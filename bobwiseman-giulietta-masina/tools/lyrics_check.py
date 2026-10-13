"""Compare the lyric cut with the v4 master frame by frame (#117). Captions may sit anywhere (bottom, top, beside a
head), so instead of fixed rows this finds where each frame differs from the master by more than encode noise and
checks that it is one caption-sized region: at most MAXH px tall and MAXW px wide (720p), and nothing at all on frames
where no caption shows. Prints frame count, the worst frames, and any frame whose difference looks like a picture
change (a render that drew the look differently from the master). Run from the project folder:
  <venv>/python tools/lyrics_check.py out/gm_looks-v4_f00000-f03337_24fps_draft.mp4 out/gm_looks-v4-lyrics-v1_...mp4"""
import subprocess, sys, json, numpy as np
M, O = sys.argv[1:3]
W, H = 1280, 720
MAXH, MAXW, BLOCK = 200, 860, 22   # 8x8 mean |diff| above 22 levels: encode generations on grain and edges stay under ~12
def frames(f):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(W * H)
        if len(b) < W * H: break
        yield np.frombuffer(b, np.uint8).reshape(H, W).astype(np.int16)
lines = json.load(open('source/lines.json'))['lines']
shown = set()
for l in lines:
    for f in range(int(l['a'] * 24 - 1), int(l['b'] * 24 + 2)): shown.add(f)
n = 0; bad = []; worst = []
for i, (a, b) in enumerate(zip(frames(M), frames(O))):
    n += 1
    # 8 x 8 block means: re-encoding the film grain scatters single pixels over the whole frame; a real change is a region
    d = np.abs(a - b).reshape(H // 8, 8, W // 8, 8).mean(axis=(1, 3)); m = d > BLOCK
    rows = np.where(m.any(1))[0]; cols = np.where(m.any(0))[0]
    if not len(rows): worst.append((0, i)); continue
    h, w = (rows[-1] - rows[0] + 1) * 8, (cols[-1] - cols[0] + 1) * 8; rows, cols = rows * 8, cols * 8
    worst.append((int(m.sum()), i))
    if i not in shown: bad.append((i, f'differs with no caption up: {h}x{w} px at y {rows[0]}-{rows[-1]}'))
    elif h > MAXH or w > MAXW: bad.append((i, f'difference {h}x{w} px (y {rows[0]}-{rows[-1]}, x {cols[0]}-{cols[-1]}) is bigger than a caption'))
print(f'{n} frames compared; max |diff| differing 8x8 block counts, worst 5:', sorted(worst)[-5:])
print(f'{len(bad)} suspect frames')
for f, msg in bad[:40]: print(f'  f{f}: {msg}')
