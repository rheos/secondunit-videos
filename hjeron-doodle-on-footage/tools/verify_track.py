"""Draw tracked points on a clip's frames as a contact sheet: pose (red), world anchors (cyan).
uv run --no-project --with opencv-python-headless --with numpy python tools/verify_track.py walk out/verify_walk.jpg x,y [x,y ...]"""
import json, sys
from pathlib import Path
import cv2, numpy as np
H = Path(__file__).resolve().parent.parent
clip, out = sys.argv[1], sys.argv[2]
anchors = [tuple(map(float, a.split(","))) for a in sys.argv[3:]]
T = json.loads((H / "data" / f"track_{clip}.json").read_text())
cap = cv2.VideoCapture(str(H / "work" / f"{clip}.mp4")); frames = []
while True:
    ok, f = cap.read()
    if not ok: break
    frames.append(f)
pick = np.linspace(0, len(frames) - 1, 12).astype(int); tiles = []
for i in pick:
    f = frames[i].copy(); a = np.array(T["cam"][i]).reshape(2, 3)
    for (x, y) in anchors:
        p = a @ np.array([x, y, 1]); cv2.circle(f, (int(p[0]), int(p[1])), 14, (255, 255, 0), 3)
    if T["pose"][i]:
        for k in (0, 15, 16, 23, 24, 27, 28):
            x, y, v = T["pose"][i][k]; cv2.circle(f, (int(x), int(y)), 7, (0, 0, 255), -1)
    cv2.putText(f, str(i), (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 4)
    tiles.append(cv2.resize(f, (240, int(240 * f.shape[0] / f.shape[1]))))
rows = [np.hstack(tiles[r * 6:(r + 1) * 6]) for r in range(2)]
Path(out).parent.mkdir(exist_ok=True); cv2.imwrite(out, np.vstack(rows)); print(out)
