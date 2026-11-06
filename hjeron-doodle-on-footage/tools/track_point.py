"""Follow one region (a dog's head) through a clip with LK flow: median shift of the corners inside a box,
re-seeded every frame. Adds "pts": {name: [[x, y] or null per frame]} to data/track_<clip>.json.
uv run --no-project --with opencv-python-headless --with numpy python tools/track_point.py dog head 270,640 50"""
import json, sys
from pathlib import Path
import cv2, numpy as np
H = Path(__file__).resolve().parent.parent
clip, name, xy, r = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
x, y = map(float, xy.split(","))
cap = cv2.VideoCapture(str(H / "work" / f"{clip}.mp4")); frames = []
while True:
    ok, f = cap.read()
    if not ok: break
    frames.append(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY))
out = [[x, y]]; lost = False
for i in range(1, len(frames)):
    if lost: out.append(None); continue
    m = np.zeros_like(frames[i - 1]); cv2.circle(m, (int(x), int(y)), r, 255, -1)
    pts = cv2.goodFeaturesToTrack(frames[i - 1], 80, 0.01, 4, mask=m)
    if pts is None or len(pts) < 5: lost = True; out.append(None); continue
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(frames[i - 1], frames[i], pts, None, winSize=(25, 25), maxLevel=3)
    d = (nxt - pts)[st.ravel() == 1].reshape(-1, 2)
    if len(d) < 5: lost = True; out.append(None); continue
    dx, dy = np.median(d, axis=0); x += float(dx); y += float(dy)
    if not (0 <= x < frames[i].shape[1] and 0 <= y < frames[i].shape[0]): lost = True; out.append(None); continue
    out.append([round(x, 1), round(y, 1)])
p = H / "data" / f"track_{clip}.json"; T = json.loads(p.read_text()); T.setdefault("pts", {})[name] = out
p.write_text(json.dumps(T)); print(name, sum(o is not None for o in out), "of", len(out), "frames")
