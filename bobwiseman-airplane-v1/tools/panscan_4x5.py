"""4:5 pan and scan of the finished 16:9 master, derived from the 9:16 plan's subject tracking.

  panscan_4x5.py analyse <video> <cache.npz>                       per-frame interest columns, once (~2 min)
  panscan_4x5.py derive  <plan916.json> <cache.npz> <plan45.json> [--hand hand.json]
  panscan_4x5.py sheet   <video> <plan45.json> <out.jpg> [--at mid|start] [--w 480]
  panscan_4x5.py render  <video> <plan45.json> <out.mp4> [--size 864x1080] [--crf 20]
  panscan_4x5.py scan    <render.mp4> <report.json>                  bad-frame scan of a finished cut

Built on bobwiseman-more/tools/panscan.py (the 9:16 tool, branch more-1): same cuts, same plan shape
(cuts, shots, one centre per frame as 0-1 of the width), so the same render logic applies.

A 4:5 window is 864 of 1920 px, 45% of the width against the 9:16 slice's 32%. Where the 9:16 plan
cropped, its window is kept inside the 4:5 window: the 4:5 centre may sit anywhere within +-0.067 of the
9:16 centre, so it holds still whenever one position covers the whole shot, and otherwise follows lazily
(moves only when the 9:16 window would leave it). Where the 9:16 plan showed the shot whole ('fit'), the
4:5 window is placed by its own detector on the cached interest, and the shot becomes a crop when the
window holds enough of it. Kinetic-type sections and anything else wider than 864 px stay 'fit' (whole
frame over a blurred copy). --hand overrides per shot: {"<start>": {"mode": "crop"|"fit", "centre": 0.5,
"why": "..."}}.
"""
import argparse, json, subprocess
import numpy as np

SW = 192  # analysis width
RATIO = (4, 5)


def probe(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
                          '-of', 'csv=p=0', path], capture_output=True, text=True, check=True).stdout.strip().split(',')
    return int(out[0]), int(out[1])


def frames(path, w, h, vf=None):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vf', vf or f'scale={w}:{h}', '-fps_mode', 'passthrough', '-f', 'rawvideo',
                          '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    n = w * h * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(h, w, 3)
    p.wait()


def smooth(x, sigma):
    if sigma <= 0 or len(x) < 3: return x.copy()
    r = int(3 * sigma); k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum()
    return np.convolve(np.pad(x, r, mode='edge'), k, mode='valid')


def medfilt(x, r):
    pad = np.pad(x, r, mode='edge'); return np.array([np.median(pad[i:i + 2 * r + 1]) for i in range(len(x))])


def analyse(args):
    W, H = probe(args.video); sh = round(SW * H / W)
    a = np.stack(list(frames(args.video, SW, sh))).astype(np.float32)
    np.savez_compressed(args.cache, small=a.astype(np.uint8))
    print(f'{len(a)} frames {SW}x{sh} -> {args.cache}')


def interest_for(a, s, e):
    """Per-frame, per-column interest inside one shot (as panscan.py): stand-out from the shot's median + motion."""
    seg = a[s:e]; g = seg.mean(axis=3)
    med = np.median(seg[::max(1, len(seg) // 24)], axis=0)
    stand = np.abs(seg - med).mean(axis=3)
    mot = np.zeros_like(stand); mot[2:] = np.abs(g[2:] - g[:-2])
    st = np.maximum(stand - np.percentile(stand, 80), 0); mo = np.maximum(mot - np.percentile(mot, 90), 0)
    return (st / (st.mean() + 1e-3) + mo / (mo.mean() + 1e-3)).sum(axis=1) + 1e-3


def window_scores(interest, hw):
    cs = np.cumsum(np.pad(interest, ((0, 0), (1, 0))), axis=1)
    xs = np.arange(int(np.ceil(hw)), int(SW - hw) + 1)
    score = cs[:, np.clip(np.round(xs + hw).astype(int), 0, SW)] - cs[:, np.clip(np.round(xs - hw).astype(int), 0, SW)]
    return xs, score


def lazy_follow(lo, hi, start):
    """Least-motion path inside a per-frame band [lo, hi]: hold until the band pushes, then move with it."""
    x = np.empty(len(lo)); v = min(max(start, lo[0]), hi[0])
    for i in range(len(lo)):
        v = min(max(v, lo[i]), hi[i]); x[i] = v
    # backward pass so the window starts moving before it is pushed, not after
    for i in range(len(lo) - 2, -1, -1):
        x[i] = min(max(x[i], x[i + 1] - .004), x[i + 1] + .004) if lo[i] <= x[i + 1] <= hi[i] else x[i]
    return x


def derive(args):
    P9 = json.load(open(args.plan916)); a = np.load(args.cache)['small'].astype(np.float32)
    n, sh = len(a), a.shape[1]
    hand = json.load(open(args.hand)) if args.hand else {}
    c9 = np.array(P9['centre']); hw9 = sh * 9 / 16 / 2 / SW; hw = sh * RATIO[0] / RATIO[1] / 2 / SW  # half widths, 0-1
    m = hw - hw9
    centre = np.full(n, .5); shots = []
    for s9 in P9['shots']:
        s, e = s9['start'], s9['end']; L = e - s
        inter = interest_for(a, s, e)
        xs, score = window_scores(inter, hw * SW)
        tot = inter.sum(axis=1)
        share = score.max(axis=1) / tot  # best possible 4:5 hold per frame
        if s9['mode'] == 'crop' and 'hand override' not in s9.get('why', ''):
            lo = np.maximum(c9[s:e] - m, hw); hi = np.minimum(c9[s:e] + m, 1 - hw)
            if lo.max() <= hi.min():  # one position holds the 9:16 window all shot long
                v = min(max((0.5 + np.median(c9[s:e])) / 2, lo.max()), hi.min()); c = np.full(L, v); how = 'still, holds the 9:16 window'
            else:
                c = lazy_follow(lo, hi, np.median(c9[s:e])); c = smooth(c, 6); how = 'follows the 9:16 window'
            mode = 'crop'
        else:
            best = xs[score.argmax(axis=1)] / SW
            c = medfilt(best, min(12, max(1, L // 4))); c = smooth(c, 12)
            # a still window if one position holds nearly as much as following would
            v = xs[score.mean(axis=0).argmax()] / SW
            cs_still = np.interp(v * SW, xs, score.mean(axis=0)) / tot.mean()
            if cs_still >= .9 * share.mean(): c = np.full(L, v); how = 'still, own detector'
            else: how = 'follows, own detector'
            mode = 'crop' if share.mean() >= args.fit_below else 'fit'
            if 'hand override' in s9.get('why', ''): mode = 'fit'; how = 'kinetic type, ' + how
        cap = 1 / 4 / 24  # at most a quarter of the frame width per second
        for i in range(1, L): c[i] = c[i - 1] + np.clip(c[i] - c[i - 1], -cap, cap)
        c = np.clip(c, hw, 1 - hw)
        held = float(np.median([np.interp(c[i] * SW, xs, score[i]) / tot[i] for i in range(L)]))  # what the window holds
        rec = {'start': s, 'end': e, 'mode': mode, 'held': round(held, 3), 'best': round(float(share.mean()), 3),
               'mode916': s9['mode'], 'how': how}
        h = hand.get(str(s))
        if h:
            rec['mode'] = h.get('mode', rec['mode']); rec['why'] = h['why']
            if 'width' in h: rec['width'] = int(h['width'])
            if 'centre' in h: c = np.full(L, float(h['centre']))
            if 'keys' in h:  # [[frame, centre], ...] eased like vertical.mjs
                k = sorted(h['keys']); t = np.arange(s, e)
                c = np.interp(t, [q[0] for q in k], [q[1] for q in k])
        if rec['mode'] == 'wide':  # the window is wider than 864: keep it inside the frame
            hwW = rec['width'] / 1920 / 2; c = np.clip(c, hwW, 1 - hwW)
        centre[s:e] = c; shots.append(rec)
    out = {'video': P9['video'], 'ratio': '4:5', 'frames': n, 'from': 'aspects/9x16/panscan-plan-v1.json',
           'cuts': P9['cuts'], 'shots': shots, 'centre': [round(float(x), 4) for x in centre]}
    json.dump(out, open(args.plan45, 'w'))
    nf = sum(x['mode'] == 'fit' for x in shots)
    print(f'{n} frames, {len(shots)} shots, {nf} fit, {len(shots) - nf} crop -> {args.plan45}')


def sheet(args):
    P = json.load(open(args.plan)); W, H = probe(args.video); sw = args.w; sh = round(sw * H / W)
    cw = sh * RATIO[0] / RATIO[1]
    picks = {}
    for k, s in enumerate(P['shots']):
        f = s['start'] + 2 if args.at == 'start' else (s['start'] + s['end']) // 2
        if args.at == 'end': f = s['end'] - 3
        picks[min(max(f, s['start']), P['frames'] - 1)] = (k, s)
    tiles = []
    for i, f in enumerate(frames(args.video, sw, sh)):
        if i not in picks: continue
        k, s = picks[i]; t = f.copy()
        if s['mode'] == 'fit':
            t[:5] = 255; t[-5:] = 255; t[:, :5] = 255; t[:, -5:] = 255
        else:
            ww = cw if s['mode'] == 'crop' else s['width'] / W * sw
            col = (255, 40, 40) if s['mode'] == 'crop' else (40, 200, 255)  # red = crop, blue = wide
            x = int(min(max(P['centre'][i] * sw - ww / 2, 0), sw - ww))
            t[:, :x] = t[:, :x] // 3; t[:, int(x + ww):] = t[:, int(x + ww):] // 3
            x1 = min(int(x + ww), sw - 3); t[:, x:x + 3] = col; t[:, x1:x1 + 3] = col
        tiles.append(t)
    cols = 6; per = args.chunk or len(tiles)
    for ci in range(0, len(tiles), per):
        part = tiles[ci:ci + per]; rows = -(-len(part) // cols)
        out = np.zeros((rows * sh, cols * sw, 3), np.uint8)
        for k, t in enumerate(part): out[(k // cols) * sh:(k // cols + 1) * sh, (k % cols) * sw:(k % cols + 1) * sw] = t
        name = args.out if per >= len(tiles) else args.out.replace('.jpg', f'_{ci // per + 1:02d}.jpg')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{out.shape[1]}x{out.shape[0]}',
                        '-i', '-', '-frames:v', '1', '-q:v', '3', name], input=out.tobytes(), check=True)
    print(f'{len(tiles)} shots -> {args.out}')


def render(args):
    """crop: an 864x1080 window, as is. wide/fit: a window <width> px wide (fit = 1920), scaled to 864 wide and
    centred on a blurred, darkened copy of the same window, so nothing inside it is cut."""
    from PIL import Image, ImageFilter, ImageEnhance
    P = json.load(open(args.plan)); W, H = probe(args.video)
    cw = int(round(H * RATIO[0] / RATIO[1] / 2) * 2)  # 864
    ow, oh = map(int, args.size.split('x'))
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{cw}x{H}', '-r', '24',
                            '-i', '-', '-i', args.video, '-map', '0:v', '-map', '1:a', '-vf', f'scale={ow}:{oh}:flags=lanczos',
                            '-c:v', 'libx264', '-preset', 'medium', '-crf', str(args.crf), '-pix_fmt', 'yuv420p',
                            '-c:a', 'copy', '-shortest', '-movflags', '+faststart', args.out], stdin=subprocess.PIPE)
    c = P['centre']; width = np.full(P['frames'] + 1, cw)
    for s in P['shots']:
        if s['mode'] != 'crop': width[s['start']:s['end']] = W if s['mode'] == 'fit' else s['width']
    for i, f in enumerate(frames(args.video, W, H)):
        k = min(i, len(c) - 1); ww = int(width[k])
        x = int(round(min(max(c[k] * W - ww / 2, 0), W - ww)))
        win = f[:, x:x + ww]
        if ww == cw:
            enc.stdin.write(np.ascontiguousarray(win).tobytes())
        else:
            im = Image.fromarray(np.ascontiguousarray(win))
            bg = im.resize((cw // 12, H // 12), Image.BILINEAR).filter(ImageFilter.GaussianBlur(2)).resize((cw, H), Image.BILINEAR)
            bg = ImageEnhance.Brightness(ImageEnhance.Color(bg).enhance(.8)).enhance(.82)
            fh = int(round(H * cw / ww / 2) * 2); bg.paste(im.resize((cw, fh), Image.LANCZOS), (0, (H - fh) // 2))
            enc.stdin.write(bg.tobytes())
        if i % 1200 == 0: print(f'{i}/{P["frames"]}', flush=True)
    enc.stdin.close(); enc.wait(); print('wrote', args.out)


def scan(args):
    """Every frame: mean, spread, and difference to the previous frame; flags black/flat/frozen/flash frames."""
    W, H = probe(args.video); w, h = 160, round(160 * H / W)
    prev = None; rows = []
    for i, f in enumerate(frames(args.video, w, h)):
        g = f.astype(np.float32)
        d = float(np.abs(g - prev).mean()) if prev is not None else 0.0
        rows.append((i, float(g.mean()), float(g.std()), d)); prev = g
    r = np.array(rows); flags = []
    dd = r[:, 3]; base = np.array([np.median(dd[max(0, i - 24):i + 24]) for i in range(len(dd))])
    for i, mean, std, d in rows:
        if mean < 4: flags.append((i, 'black'))
        elif std < 2: flags.append((i, 'flat'))
        if 0 < i < len(rows) - 1 and d > 25 and dd[i + 1] > 25 and d > 6 * base[i] + 6 and dd[i + 1] > 6 * base[i] + 6:
            flags.append((i, 'one-frame flash'))
    json.dump({'frames': len(rows), 'flags': flags, 'stats': [[round(x, 2) for x in q] for q in rows]}, open(args.report, 'w'))
    print(f'{len(rows)} frames, {len(flags)} flags')
    for q in flags[:40]: print(q)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest='cmd', required=True)
    p = sp.add_parser('analyse'); p.add_argument('video'); p.add_argument('cache')
    p = sp.add_parser('derive'); p.add_argument('plan916'); p.add_argument('cache'); p.add_argument('plan45')
    p.add_argument('--hand'); p.add_argument('--fit-below', type=float, default=.6)
    p = sp.add_parser('sheet'); p.add_argument('video'); p.add_argument('plan'); p.add_argument('out')
    p.add_argument('--at', default='mid'); p.add_argument('--w', type=int, default=480); p.add_argument('--chunk', type=int, default=0)
    p = sp.add_parser('render'); p.add_argument('video'); p.add_argument('plan'); p.add_argument('out')
    p.add_argument('--size', default='864x1080'); p.add_argument('--crf', type=int, default=20)
    p = sp.add_parser('scan'); p.add_argument('video'); p.add_argument('report')
    a = ap.parse_args(); {'analyse': analyse, 'derive': derive, 'sheet': sheet, 'render': render, 'scan': scan}[a.cmd](a)
