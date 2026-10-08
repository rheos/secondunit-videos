#!/usr/bin/env python3
"""Living animatic for We Got Time (Robin, 2026-10-06).

The old pinball cut plays under everything. Each entry in manifest.json drops a new still or clip
onto the song timeline and covers the old picture for its span; anything not yet replaced stays
the old version. Add stills to the manifest as they're painted and re-run.

    python3 animatic.py [--out out/NAME.mp4] [--cuts]

Entries (times are song seconds, frames are 24 fps song frames, half-open [start, end)):
  {"still": "keyframes/x.png", "at": 68.5}           span = the pinball shot that contains `at`
  {"still": "...", "span": [13.0, 33.0]}             explicit span in seconds
  {"clip": "../desk-shot/out/wgt_desk-shot-v2_f01432-f01558_24fps_composite.mp4"}
                                                     frames read from the catalogue name
Stills get a slow push-in (zoom 1.00 -> 1.06) and are cover-cropped to 16:9 from the centre;
"focus": [x, y] (0-1) moves the crop/zoom centre.
"""
import argparse, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, '../../bobwiseman-we-got-time/out/wgt_pnc-v12_f00000-f08194_24fps_review-720p.mp4')
FPS, W, H, TOTAL = 24, 1280, 720, 8194
CUTS = os.path.join(HERE, 'cuts.json')


def detect_cuts():
    """Shot boundaries of the base cut, as song frames (scene score > 0.30)."""
    p = subprocess.run(['ffmpeg', '-hide_banner', '-i', BASE, '-vf', "select='gt(scene,0.30)',metadata=print:file=-",
                        '-an', '-f', 'null', '-'], capture_output=True, text=True)
    frames = sorted({round(float(m) * FPS) for m in re.findall(r'pts_time:([0-9.]+)', p.stdout)})
    json.dump([0] + frames + [TOTAL], open(CUTS, 'w'))
    return [0] + frames + [TOTAL]


def shot_span(cuts, at):
    f = round(at * FPS)
    for a, b in zip(cuts, cuts[1:]):
        if a <= f < b:
            return a, b
    raise ValueError(f'{at}s is outside the song')


def entry_span(e, cuts):
    if 'clip' in e:
        m = re.search(r'_f(\d{5})-f(\d{5})_', os.path.basename(e['clip']))
        return int(m.group(1)), int(m.group(2))
    if 'span' in e:
        return round(e['span'][0] * FPS), round(e['span'][1] * FPS)
    return shot_span(cuts, e['at'])


def upgraded(path):
    """The newest-style version of a still, if the style pass has made one (keyframes_v2/<flattened name>)."""
    if path.startswith('keyframes_v2/'):
        for d in ('keyframes_nm2', 'keyframes_nm'):
            if os.path.exists(os.path.join(HERE, d, path.split('/', 1)[1])):
                return f"{d}/{path.split('/', 1)[1]}"
        return path
    name = re.sub(r'^(\.\./)+', '', path).replace('keyframes/', '').replace('/', '__')
    # nightmare-world versions (flat, cold) win over the cinematic style pass
    for d in ('keyframes_nm2', 'keyframes_nm', 'keyframes_v2'):
        if os.path.exists(os.path.join(HERE, d, name)):
            return f'{d}/{name}'
    return path


def still_segment(path, n, focus, out):
    """n frames of a slow push-in on a still, cover-cropped to 16:9."""
    fx, fy = focus
    # upscale 4x before zoompan so the per-frame crop steps are sub-pixel at output size
    vf = (f"scale={W*4}:{H*4}:force_original_aspect_ratio=increase,crop={W*4}:{H*4},"
          f"zoompan=z='1+0.06*on/{max(n-1,1)}':x='(iw-iw/zoom)*{fx}':y='(ih-ih/zoom)*{fy}':d={n}:s={W}x{H}:fps={FPS},"
          f"format=yuv420p")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-loop', '1', '-i', path, '-vf', vf, '-frames:v', str(n),
                    '-c:v', 'libx264', '-crf', '18', '-preset', 'fast', out], check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=None)
    ap.add_argument('--cuts', action='store_true', help='re-detect the base cut points')
    a = ap.parse_args()
    cuts = detect_cuts() if a.cuts or not os.path.exists(CUTS) else json.load(open(CUTS))
    man = json.load(open(os.path.join(HERE, 'manifest.json')))
    tmp = os.path.join(HERE, 'out', 'segments'); os.makedirs(tmp, exist_ok=True)

    placed = []
    for i, e in enumerate(man['entries']):
        s, t = entry_span(e, cuts)
        if 'still' in e:
            if man.get('use_upgrades'):
                e['still'] = upgraded(e['still'])
            seg = os.path.join(tmp, f'{i:03d}_{os.path.splitext(os.path.basename(e["still"]))[0]}.mp4')
            still_segment(os.path.join(HERE, e['still']), t - s, e.get('focus', [0.5, 0.5]), seg)
        else:
            seg = os.path.join(HERE, e['clip'])
        placed.append((s, t, seg, e.get('still') or e.get('clip')))
    # overlays stack in manifest order, so where entries overlap the one listed LATER wins
    for i, (s1, t1, _, n1) in enumerate(placed):
        for s2, t2, _, n2 in placed[i + 1:]:
            if s2 < t1 and s1 < t2:
                print(f'note: {n2} overlaps {n1} (f{max(s1, s2)}-f{min(t1, t2)}); {n2} wins (listed later)', file=sys.stderr)

    # overlay every segment on the base at its song frames; the base's audio is the song
    args = ['ffmpeg', '-y', '-loglevel', 'error', '-i', BASE]
    for _, _, seg, _ in placed:
        args += ['-i', seg]
    chains, last = [], '0:v'
    for k, (s, t, _, _) in enumerate(placed, start=1):
        chains.append(f'[{k}:v]trim=end_frame={t - s},setpts=PTS-STARTPTS+{s}/{FPS}/TB,scale={W}:{H}[s{k}]')
        chains.append(f"[{last}][s{k}]overlay=eof_action=pass:enable='between(n,{s},{t - 1})'[v{k}]")
        last = f'v{k}'
    out = a.out or os.path.join(HERE, 'out', f'wgt_world-animatic-v{man["version"]}_f00000-f{TOTAL:05d}_24fps_composite.mp4')
    args += ['-filter_complex', ';'.join(chains), '-map', f'[{last}]', '-map', '0:a', '-frames:v', str(TOTAL),
             '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', out]
    subprocess.run(args, check=True)
    covered = len({f for s, t, _, _ in placed for f in range(s, t)})
    print(f'wrote {out}\n{len(placed)} entries, {covered} of {TOTAL} frames new ({100 * covered / TOTAL:.0f}%)')
    for s, t, _, n in sorted(placed):
        print(f'  f{s:05d}-f{t:05d}  {s / FPS:7.2f}-{t / FPS:7.2f}s  {n}')


if __name__ == '__main__':
    main()
