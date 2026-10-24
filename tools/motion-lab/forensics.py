"""Frame forensics for a finished cut: single-frame pops, motion jumps, holds and brightness dips.

    forensics.py <video> [--skip 14.23,23.9,30-31.5] [--json out/qa/forensics.json]
    (needs numpy: run it with $MV_PYTHON, see the video-production skill)

Ported from tools/forensics.mjs in Leon Lin's shanshui (https://github.com/Leonxlnx/shanshui), under
its MIT licence (also in vendor/LICENSE-shanshui.md):

    MIT License

    Copyright (c) 2026 Leonxlnx

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

Decodes the video to 160x90 grey and measures each frame's step, the mean absolute difference from the
frame before it (0 to 255):

- pop: a frame that differs from both neighbours (the smaller of its two steps over 1.2, and over 3x the
  difference between the neighbours plus 0.5) while the neighbours agree. One bad frame: a worker that
  drew the wrong time, or a dropped or doubled frame at a slice seam.
- jump: a single step over max(3.0, 4x the median step of the 30 frames around it) that stands alone
  (both neighbouring steps under half of it). A motion lurch, or a seam where a look that carries state
  between frames restarted without its history. A hard cut is a jump too, so pass cut times with --skip.
  At the frames given with --seams the floor drops to shanshui's 1.0.
- hold: more than --max-hold seconds (2.0) of steps under 0.02. A freeze. A hold that runs to the last
  frame is not counted (an end card), as in shanshui.
- dip: mean luma more than 25% under the brightest frame within 1 s either side, sampled 6 times a
  second; consecutive samples are reported as one dip. Listed for a look, never a failure: a cut between
  a dark shot and a bright one, or a fade in, reads the same.

Changed from shanshui, all measured on call-toon test 02b (30 fps, three hard cuts, a fade to an end card):
its jump floor of 1.0 flagged four speaker switches (caption, mouth and highlight change in one frame,
steps 1.3 to 2.3), so the floor is 3.0 away from seams. Its jump rule also flagged every frame of a fade
and of a move's first frames, so a jump must stand alone. Its 0.8 s hold flagged a 1.0 s designed title
hold; 2.0 s is the cloud join's own limit for looks (CR_HOLD). It reports nothing as a failure; here
pops, jumps and holds outside --skip fail the file (exit 1).

--skip takes seconds, comma separated: a range a-b, or a single time t (a cut, read as t to t). Each window
is widened by 0.05 s on both sides, as shanshui widens its transitions. A pop, jump or dip inside a window,
or a hold wholly inside one, is listed as skipped. --seams takes frame numbers (the first frame of each
slice after the first; cloud-render.sh passes them)."""
import argparse, json, subprocess, sys
import numpy as np

W, H = 160, 90
PAD = 0.05
JUMP_FLOOR, SEAM_FLOOR = 3.0, 1.0


def fps_of(path):
    s = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                   'stream=r_frame_rate', '-of', 'json', path], capture_output=True, text=True).stdout)
    n, d = s['streams'][0]['r_frame_rate'].split('/')
    return float(n) / float(d)


def grey(path):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}:flags=area,format=gray',
                        '-f', 'rawvideo', '-'], capture_output=True)
    if p.returncode:
        sys.exit(f'ffmpeg failed on {path}: {p.stderr.decode().strip()}')
    return np.frombuffer(p.stdout, np.uint8).reshape(-1, H, W)


def mad(a, b):
    """Mean absolute difference per frame pair, in chunks so a long film stays small in memory."""
    out = np.empty(len(a), np.float64)
    for k in range(0, len(a), 512):
        x, y = a[k:k + 512].astype(np.int16), b[k:k + 512].astype(np.int16)
        out[k:k + 512] = np.abs(x - y).mean(axis=(1, 2))
    return out


def med(v):
    """shanshui's median: the upper middle element of the sorted list (0 when empty)."""
    return float(np.sort(v)[len(v) // 2]) if len(v) else 0.0


def parse_skip(text):
    wins = []
    for part in filter(None, (p.strip() for p in (text or '').split(','))):
        a, _, b = part.partition('-')
        a = float(a); b = float(b) if b else a
        wins.append((min(a, b) - PAD, max(a, b) + PAD))
    return wins


def scan(path, wins, seams=(), max_hold=2.0):
    fps = fps_of(path)
    f = grey(path)
    n = len(f)
    skipped = lambda t: any(a <= t <= b for a, b in wins)
    steps = np.zeros(n)
    if n > 1:
        steps[1:] = mad(f[1:], f[:-1])
    lum = f.reshape(n, -1).mean(axis=1)
    rep = {'file': path.split('/')[-1], 'fps': round(fps, 3), 'frames': n, 'median_step': round(med(steps), 3),
           'skip': [[round(a, 2), round(b, 2)] for a, b in wins], 'pops': [], 'jumps': [], 'holds': [], 'dips': []}

    if n > 2:
        around = mad(f[2:], f[:-2])                       # frame i-1 against frame i+1, for i = 1..n-2
        for i in range(1, n - 1):
            spike = min(steps[i], steps[i + 1])
            if spike > 1.2 and spike > 3 * around[i - 1] + 0.5:
                t = i / fps
                rep['pops'].append({'frame': i, 't': round(t, 3), 'spike': round(spike, 2),
                                    'neighbours': round(float(around[i - 1]), 2), 'skipped': skipped(t)})

    near_seam = {k + d for k in seams for d in (-1, 0, 1)}
    for i in range(3, n - 3):
        local = med(steps[max(1, i - 15):i + 15])
        floor = SEAM_FLOOR if i in near_seam else JUMP_FLOOR
        if steps[i] > max(floor, local * 4) and steps[i] > 2 * max(steps[i - 1], steps[i + 1]):
            t = i / fps
            rep['jumps'].append({'frame': i, 't': round(t, 3), 'step': round(float(steps[i]), 2),
                                 'local': round(local, 2), 'seam': i in near_seam, 'skipped': skipped(t)})

    run = 0
    for i in range(1, n):
        if steps[i] < 0.02:
            run += 1
            continue
        if run > fps * max_hold:
            a, b = (i - run) / fps, i / fps
            rep['holds'].append({'frame': i - run, 't': round(a, 3), 'to': round(b, 3),
                                 'skipped': any(wa <= a and b <= wb for wa, wb in wins)})
        run = 0

    r = int(round(fps))
    samples = []
    for i in range(0, n, max(1, int(round(fps / 6)))):
        mx = float(lum[max(0, i - r):min(n, i + r)].max())
        if lum[i] < mx * 0.75:
            samples.append((i, float(lum[i]), mx))
    step = max(1, int(round(fps / 6)))
    for i, l, mx in samples:                             # samples one step apart are one dip
        d = rep['dips'][-1] if rep['dips'] else None
        if d and i - d['_last'] <= step:
            d['_last'] = i; d['to'] = round(i / fps, 3)
            if l < d['lum']:
                d.update(frame=i, t_low=round(i / fps, 3), lum=round(l, 1), local_max=round(mx, 1))
            continue
        rep['dips'].append({'frame': i, 't': round(i / fps, 3), 'to': round(i / fps, 3), 't_low': round(i / fps, 3),
                            'lum': round(l, 1), 'local_max': round(mx, 1), '_last': i})
    for d in rep['dips']:
        del d['_last']
        d['skipped'] = skipped(d['t_low'])
    return rep


def line(kind, x):
    tag = '  (skipped)' if x['skipped'] else ''
    if kind == 'pop':
        what = f"spike {x['spike']} vs neighbours {x['neighbours']}"
    elif kind == 'jump':
        what = f"step {x['step']} vs local {x['local']}"
    elif kind == 'hold':
        what = f"still to {x['to']:.2f} s ({x['to'] - x['t']:.2f} s)"
    else:
        what = f"luma {x['lum']} vs {x['local_max']} nearby, {x['t']:.2f}-{x['to']:.2f} s, a note"
    t = x['t_low'] if kind == 'dip' else x['t']
    return f"        {kind:<4}  frame {x['frame']:>5}  {t:7.2f} s  {what}{tag}"


def main():
    ap = argparse.ArgumentParser(description='Frame forensics: pops, jumps, holds, dips.')
    ap.add_argument('video', nargs='+')
    ap.add_argument('--skip', help='seconds to ignore: a-b ranges or single cut times, comma separated')
    ap.add_argument('--seams', help='frame numbers where slices meet; jumps there use the 1.0 floor')
    ap.add_argument('--max-hold', type=float, default=2.0, help='longest still stretch in seconds (default 2.0)')
    ap.add_argument('--json', help='write the full report here')
    a = ap.parse_args()
    wins = parse_skip(a.skip)
    reports, bad = [], 0
    for path in a.video:
        rep = scan(path, wins, [int(x) for x in (a.seams or '').split(',') if x.strip()], a.max_hold)
        reports.append(rep)
        kinds = [('pop', rep['pops']), ('jump', rep['jumps']), ('hold', rep['holds']), ('dip', rep['dips'])]
        live = {k: [x for x in xs if not x['skipped']] for k, xs in kinds}
        nskip = sum(len(xs) for _, xs in kinds) - sum(len(v) for v in live.values())
        fail = bool(live['pop'] or live['jump'] or live['hold'])           # dips are listed, never fail
        big = [(x['spike'], 'pop', x) for x in live['pop']] + [(x['step'], 'jump', x) for x in live['jump']]
        worst = 'no pops or jumps'
        if big:
            size, kind, x = max(big, key=lambda b: b[0])
            worst = f"worst {kind} {size} at {x['t']:.2f} s (frame {x['frame']})"
        counts = ', '.join(f"{len(live[k])} {k}{'s' if len(live[k]) != 1 else ''}" for k, _ in kinds[:3])
        counts += f", {len(live['dip'])} dip note{'s' if len(live['dip']) != 1 else ''}"
        print(f"{'FAIL' if fail else 'PASS'}  {rep['file']}  {rep['frames']} frames @ {rep['fps']:g} fps  "
              f"median step {rep['median_step']}  {counts}  {worst}" + (f"  ({nskip} skipped)" if nskip else ''))
        for k, xs in kinds:
            for x in xs[:20]:
                print(line(k, x))
            if len(xs) > 20:
                print(f'        ... {len(xs) - 20} more {k}s in the JSON')
        bad += fail
    if a.json:
        import os
        os.makedirs(os.path.dirname(os.path.abspath(a.json)), exist_ok=True)
        with open(a.json, 'w') as fh:
            json.dump(reports[0] if len(reports) == 1 else reports, fh, indent=1)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
