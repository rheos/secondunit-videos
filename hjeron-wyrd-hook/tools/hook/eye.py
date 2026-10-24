"""Paint the Wyrd One's single white eye into a cut-out sprite sequence, tracked to his hat.

usage: eye.py <sprite_dir> <out_dir> --ref N --hat x,y,w,h --eye x,y --open a,b --close c,d [--size 20]
--ref is the frame where --hat (a crop around the hat crown) and --eye (where the eye sits under the brim) were
measured. The hat is template-matched in every frame and the eye moves with it. It opens over frames a..b and
closes over c..d (no --close: stays open). One eye only, never two (Robin's rule); it never reveals a face.
"""
import argparse, json, os, shutil
import cv2, numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--ref", type=int, required=True)
ap.add_argument("--hat", required=True); ap.add_argument("--eye", required=True)
ap.add_argument("--open", required=True); ap.add_argument("--close")
ap.add_argument("--size", type=float, default=20)
a = ap.parse_args()
hx, hy, hw, hh = map(int, a.hat.split(",")); ex, ey = map(float, a.eye.split(","))
o0, o1 = map(int, a.open.split(",")); c0, c1 = map(int, a.close.split(",")) if a.close else (10**9, 10**9)
frames = sorted(f for f in os.listdir(a.src) if f.endswith(".png"))
gray = lambda im: cv2.cvtColor(im[:, :, :3], cv2.COLOR_BGR2GRAY)
ref = cv2.imread(os.path.join(a.src, frames[a.ref]), cv2.IMREAD_UNCHANGED)
tpl = gray(ref)[hy:hy + hh, hx:hx + hw]
if os.path.exists(a.out): shutil.rmtree(a.out)
os.makedirs(a.out)
log = []
for i, name in enumerate(frames):
    img = cv2.imread(os.path.join(a.src, name), cv2.IMREAD_UNCHANGED)
    k = 0.0
    if o0 <= i < c1:
        k = min(1.0, (i - o0 + 1) / max(1, o1 - o0)) if i < o1 else 1.0
        if i >= c0: k = max(0.0, 1 - (i - c0 + 1) / max(1, c1 - c0))
    if k > 0:
        g = gray(img)
        x0, y0 = max(0, hx - 2 * hw), max(0, hy - 2 * hh)
        roi = g[y0:y0 + 5 * hh, x0:x0 + 5 * hw]
        r = cv2.matchTemplate(roi, tpl, cv2.TM_CCOEFF_NORMED)
        _, score, _, loc = cv2.minMaxLoc(r)
        dx, dy = x0 + loc[0] - hx, y0 + loc[1] - hy
        cx, cy, s = int(ex + dx), int(ey + dy), a.size
        # an almond of white, opening vertically, with a black slit pupil and a few scratched rays
        cv2.ellipse(img, (cx, cy), (int(s), max(1, int(s * 0.42 * k))), 0, 0, 360, (255, 255, 255, 255), -1, cv2.LINE_AA)
        if k > 0.5:
            cv2.ellipse(img, (cx, cy), (max(1, int(s * 0.12)), max(1, int(s * 0.36 * k))), 0, 0, 360, (0, 0, 0, 255), -1, cv2.LINE_AA)
        # the veil's cords pass in front of it: thin black verticals across the eye, so it glints THROUGH the fringe
        for vx in range(int(cx - s * 1.1), int(cx + s * 1.1), max(4, int(s * 0.32))):
            cv2.line(img, (vx, int(cy - s)), (vx + 1, int(cy + s)), (0, 0, 0, 255), max(1, int(s * 0.09)), cv2.LINE_AA)
        log.append({"frame": i, "open": round(k, 2), "x": cx, "y": cy, "score": round(float(score), 3)})
    cv2.imwrite(os.path.join(a.out, name), img)
json.dump(log, open(os.path.join(a.out, "eye.json"), "w"), indent=1)
print(json.dumps({"frames": len(frames), "painted": len(log), "min_score": min([l["score"] for l in log] or [1])}))
