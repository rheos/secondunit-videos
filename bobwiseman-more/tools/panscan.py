"""9:16 pan and scan of a finished 16:9 video: a window that follows the action, cut on the shot cuts.

  panscan.py plan   <video> <plan.json> [--ratio 9:16]
  panscan.py render <video> <plan.json> <out.mp4> [--size 720x1280] [--audio <file>]
  panscan.py sheet  <video> <plan.json> <out.jpg> [--every 4]   16:9 frames with the window drawn on, for review

plan: analyses a small copy (192 px wide). Shot cuts = frame differences far above the local norm.
Inside a shot, each frame's interest = motion (difference to 2 frames back) + how far each pixel is from
the shot's median frame (what stands out from the background). The window centre is the position that
holds the most interest; it is median-filtered, smoothed (~0.5 s), speed-capped, and reset at every cut.
A shot with no clear subject stays centred. The plan stores one centre per frame (0-1 of the width) plus
the cuts, so a person can override `centre` spans by hand before rendering.
render: decodes the full-size video, crops each frame's window, scales to --size, copies the source audio.
"""
import argparse, json, subprocess, sys
import numpy as np

SW = 192  # analysis width


def probe(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
                          '-of', 'csv=p=0', path], capture_output=True, text=True, check=True).stdout.strip().split(',')
    return int(out[0]), int(out[1])


def frames(path, w, h, pix='rgb24'):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', pix, '-'],
                         stdout=subprocess.PIPE)
    n = w * h * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(h, w, 3)
    p.wait()


def smooth(x, sigma):
    if sigma <= 0 or len(x) < 3: return x.copy()
    r = int(3 * sigma); k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum()
    pad = np.pad(x, r, mode='edge'); return np.convolve(pad, k, mode='valid')


def medfilt(x, r):
    pad = np.pad(x, r, mode='edge'); return np.array([np.median(pad[i:i + 2 * r + 1]) for i in range(len(x))])


def plan(args):
    W, H = probe(args.video); sh = round(SW * H / W)
    a = np.stack(list(frames(args.video, SW, sh))).astype(np.float32)
    n = len(a); g = a.mean(axis=3)
    d = np.r_[0, np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))]
    base = np.array([np.median(d[max(0, i - 24):i + 24]) for i in range(n)])
    cuts = [0] + [i for i in range(1, n) if d[i] > max(14, 5 * base[i] + 4)]
    cuts = [c for k, c in enumerate(cuts) if k == 0 or c - cuts[k - 1] >= 6] + [n]  # no cuts closer than 1/4 s
    rw, rh = map(int, args.ratio.split(':')); win = sh * rw / rh  # window width in analysis px
    hw = win / 2; centre = np.full(n, .5); shots = []
    for s, e in zip(cuts[:-1], cuts[1:]):
        seg = a[s:e]; med = np.median(seg[::max(1, len(seg) // 24)], axis=0)
        stand = np.abs(seg - med).mean(axis=3)
        mot = np.zeros_like(stand); mot[2:] = np.abs(g[s + 2:e] - g[s:e - 2])
        # only the strongest stand-out and motion count (texture, grain and gentle washes are background)
        st = np.maximum(stand - np.percentile(stand, 80), 0); mo = np.maximum(mot - np.percentile(mot, 90), 0)
        interest = (st / (st.mean() + 1e-3) + mo / (mo.mean() + 1e-3)).sum(axis=1) + 1e-3  # per column
        cs = np.cumsum(np.pad(interest, ((0, 0), (1, 0))), axis=1)
        lo, hi = int(np.ceil(hw)), int(SW - hw)
        xs = np.arange(lo, hi + 1)
        score = cs[:, np.clip(np.round(xs + hw).astype(int), 0, SW)] - cs[:, np.clip(np.round(xs - hw).astype(int), 0, SW)]
        best = xs[score.argmax(axis=1)].astype(float)
        # no clear subject (window barely beats the average) -> centre
        share = score.max(axis=1) / (interest.sum(axis=1) + 1e-6)
        flat = share < (win / SW) * 1.15
        best[flat] = SW / 2
        c = medfilt(best, min(12, max(1, (e - s) // 4)))
        c = smooth(c, 12)
        # cap the pan speed: at most a third of the frame width per second
        cap = SW / 3 / 24
        for i in range(1, len(c)): c[i] = c[i - 1] + np.clip(c[i] - c[i - 1], -cap, cap)
        centre[s:e] = np.clip(c, hw, SW - hw) / SW
        # how much of the shot's interest the moving window actually holds; low = the action is wider than
        # a 9:16 slice (wide lettering, a face filling the frame), so the shot is shown whole ("fit")
        # no narrow subject at all (wide lettering, an even field) also means: show it whole
        held = float(np.median(score.max(axis=1)[~flat] / (interest.sum(axis=1)[~flat] + 1e-6))) if flat.mean() < .5 else 0.0
        shots.append({'start': int(s), 'end': int(e), 'held': round(held, 3), 'mode': 'fit' if held < args.fit_below else 'crop'})
    json.dump({'video': args.video, 'ratio': args.ratio, 'frames': n, 'cuts': cuts[1:-1], 'shots': shots,
               'centre': [round(float(x), 4) for x in centre]}, open(args.plan, 'w'))
    nf = sum(1 for x in shots if x['mode'] == 'fit')
    print(f'{n} frames, {len(cuts) - 2} cuts, {nf}/{len(shots)} shots fit -> {args.plan}')


def render(args):
    P = json.load(open(args.plan)); W, H = probe(args.video)
    rw, rh = map(int, P['ratio'].split(':')); cw = int(round(H * rw / rh / 2) * 2)
    ow, oh = map(int, args.size.split('x'))
    audio = args.audio or args.video
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{cw}x{H}', '-r', '24', '-i', '-',
                            '-i', audio, '-map', '0:v', '-map', '1:a', '-vf', f'scale={ow}:{oh}:flags=lanczos',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-maxrate', '4.5M', '-bufsize', '9M', '-pix_fmt', 'yuv420p',
                            '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', args.out], stdin=subprocess.PIPE)
    c = P['centre']
    fit = np.zeros(P['frames'] + 1, bool)
    for sh in P.get('shots', []):
        if sh['mode'] == 'fit': fit[sh['start']:sh['end']] = True
    # fit frames: the whole 16:9 frame scaled to the window width, centred on a blurred, darkened zoom of itself
    fh = int(round(cw * H / W / 2) * 2); y0 = (H - fh) // 2
    blur = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', args.video, '-vf',
                             f'scale=-2:{H},crop={cw}:{H},boxblur=24:2,eq=brightness=-0.12:saturation=0.8,format=rgb24',
                             '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE) if fit.any() else None
    small = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', args.video, '-vf', f'scale={cw}:{fh}:flags=lanczos,format=rgb24',
                              '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE) if fit.any() else None
    for i, f in enumerate(frames(args.video, W, H)):
        if blur:
            bg = np.frombuffer(blur.stdout.read(cw * H * 3), np.uint8).reshape(H, cw, 3)
            sm = np.frombuffer(small.stdout.read(cw * fh * 3), np.uint8).reshape(fh, cw, 3)
        if fit[min(i, len(fit) - 1)]:
            o = bg.copy(); o[y0:y0 + fh] = sm; enc.stdin.write(o.tobytes()); continue
        x = int(round(min(max(c[min(i, len(c) - 1)] * W - cw / 2, 0), W - cw)))
        enc.stdin.write(np.ascontiguousarray(f[:, x:x + cw]).tobytes())
        if i % 1200 == 0: print(f'{i}/{P["frames"]}', flush=True)
    enc.stdin.close(); enc.wait(); print('wrote', args.out)


def sheet(args):
    P = json.load(open(args.plan)); W, H = probe(args.video); sw, sh = 320, round(320 * H / W)
    rw, rh = map(int, P['ratio'].split(':')); cw = sh * rw / rh
    picks = sorted(set([min(c + 12, P['frames'] - 1) for c in [0] + P['cuts']]))
    step = max(1, len(picks) // 60) if len(picks) > 60 else 1; picks = picks[::step]
    tiles = []
    for i, f in enumerate(frames(args.video, sw, sh)):
        if i in picks:
            t = f.copy(); x = int(min(max(P['centre'][i] * sw - cw / 2, 0), sw - cw))
            if any(s0['start'] <= i < s0['end'] and s0['mode'] == 'fit' for s0 in P.get('shots', [])):
                t[:6] = 255; t[-6:] = 255; t[:, :6] = 255; t[:, -6:] = 255  # white border = shown whole
            else:
                t[:, :x] = t[:, :x] // 3; t[:, int(x + cw):] = t[:, int(x + cw):] // 3
                x1 = min(int(x + cw), sw - 3); t[:, x:x + 3] = (255, 40, 40); t[:, x1:x1 + 3] = (255, 40, 40)
            tiles.append(t)
    cols = 6; rows = -(-len(tiles) // cols)
    out = np.zeros((rows * sh, cols * sw, 3), np.uint8)
    for k, t in enumerate(tiles): out[(k // cols) * sh:(k // cols + 1) * sh, (k % cols) * sw:(k % cols + 1) * sw] = t
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{out.shape[1]}x{out.shape[0]}',
                    '-i', '-', '-frames:v', '1', args.out], input=out.tobytes(), check=True)
    print(f'{len(tiles)} shots -> {args.out}')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest='cmd', required=True)
    p = sp.add_parser('plan'); p.add_argument('video'); p.add_argument('plan'); p.add_argument('--ratio', default='9:16'); p.add_argument('--fit-below', type=float, default=.5)
    r = sp.add_parser('render'); r.add_argument('video'); r.add_argument('plan'); r.add_argument('out'); r.add_argument('--size', default='720x1280'); r.add_argument('--audio')
    s = sp.add_parser('sheet'); s.add_argument('video'); s.add_argument('plan'); s.add_argument('out')
    a = ap.parse_args(); {'plan': plan, 'render': render, 'sheet': sheet}[a.cmd](a)
