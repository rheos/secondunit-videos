"""Compare two cuts of the same picture frame by frame at 720p (#117 finals): the new 720p or 1080p final against the
delivered v1 lyric cut, which Bob approved. Both carry the captions, so nothing may differ anywhere beyond encode noise:
8x8 block means of |diff| above BLOCK levels on any frame are reported. Also checks the frame counts. Run from the
project folder:  <venv>/python tools/finals_check.py out/gm_looks-v4-lyrics-v1_...mp4 out/finals/<final>.mp4"""
import subprocess, sys, numpy as np
A, B = sys.argv[1:3]
W, H, BLOCK = 1280, 720, 22
def frames(f):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'scale={W}:{H}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                         stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(W * H)
        if len(b) < W * H: break
        yield np.frombuffer(b, np.uint8).reshape(H, W).astype(np.int16)
na = nb = 0; bad = []; mean = []
ga, gb = frames(A), frames(B)
while True:
    a, b = next(ga, None), next(gb, None)
    if a is not None: na += 1
    if b is not None: nb += 1
    if a is None or b is None:
        for _ in ga: na += 1
        for _ in gb: nb += 1
        break
    d = np.abs(a - b); mean.append(d.mean())
    m = d.reshape(H // 8, 8, W // 8, 8).mean(axis=(1, 3)) > BLOCK
    if m.any():
        r, c = np.where(m)
        bad.append((na - 1, int(m.sum()), f'y {r.min() * 8}-{r.max() * 8 + 7} x {c.min() * 8}-{c.max() * 8 + 7}'))
mean = np.array(mean)
print(f'frames {na} vs {nb}; mean |diff| per frame: median {np.median(mean):.2f}, max {mean.max():.2f} at f{mean.argmax()}')
print(f'{len(bad)} frames with a block over {BLOCK}')
for f, n, w in bad[:40]: print(f'  f{f}: {n} blocks, {w}')
sys.exit(0 if na == nb and not bad else 1)
