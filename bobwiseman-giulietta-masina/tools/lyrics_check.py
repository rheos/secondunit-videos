"""Compare the lyric cut with the v4 master frame by frame (#117). Captions may sit anywhere (bottom, top, beside a
head), so instead of fixed rows this finds where each frame differs from the master by more than encode noise and
checks that it is one caption-sized region: at most MAXH px tall and MAXW px wide (720p), and nothing at all on frames
where no caption shows. Prints frame count, the worst frames, and any frame whose difference looks like a picture
change (a render that drew the look differently from the master). Run from the project folder:
  <venv>/python tools/lyrics_check.py out/gm_looks-v4_f00000-f03337_24fps_draft.mp4 out/gm_looks-v4-lyrics-v1_...mp4"""
import subprocess, sys, json, numpy as np
M, O = sys.argv[1:3]
W, H = 1280, 720
MAXH, MAXW, NOISE = 200, 860, 28
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
    d = np.abs(a - b); m = d > NOISE
    # ignore isolated noise pixels: keep rows / columns with at least 4 differing pixels
    rows = np.where(m.sum(1) >= 4)[0]; cols = np.where(m.sum(0) >= 4)[0]
    if not len(rows): worst.append((0, i)); continue
    h, w = rows[-1] - rows[0] + 1, cols[-1] - cols[0] + 1
    worst.append((int(m.sum()), i))
    if i not in shown: bad.append((i, f'differs with no caption up: {h}x{w} px at y {rows[0]}-{rows[-1]}'))
    elif h > MAXH or w > MAXW: bad.append((i, f'difference {h}x{w} px (y {rows[0]}-{rows[-1]}, x {cols[0]}-{cols[-1]}) is bigger than a caption'))
print(f'{n} frames compared; max |diff| region pixel counts, worst 5:', sorted(worst)[-5:])
print(f'{len(bad)} suspect frames')
for f, msg in bad[:40]: print(f'  f{f}: {msg}')
