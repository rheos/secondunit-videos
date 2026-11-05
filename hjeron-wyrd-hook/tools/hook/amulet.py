"""Paint the Wyrd One's amulet in a cut-out sprite sequence with a magenta marker, so the hook's two-tone pass
(tools/hook/common.js twoTone) turns it jade green, the one colour Robin kept from sheet variant b.

usage: amulet.py <sprite_dir> <template.png> <out_dir> [--scales 0.8,1.2] [--fringe 1.2] [--ring 0.62]
Finds the rosette in every frame by template matching (multi-scale, searched near the last hit), then paints the
bright line work inside the rosette circle and its bead fringe below. Writes a fresh out_dir and amulet.json.
"""
import json, sys, os, shutil
import cv2, numpy as np

src, tpl_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
scales = [float(x) for x in (sys.argv[sys.argv.index("--scales") + 1].split(",") if "--scales" in sys.argv else ["0.8", "1.25"])]
fringe = float(sys.argv[sys.argv.index("--fringe") + 1]) if "--fringe" in sys.argv else 1.2
ring = float(sys.argv[sys.argv.index("--ring") + 1]) if "--ring" in sys.argv else 0.62
tpl0 = cv2.imread(tpl_path, cv2.IMREAD_GRAYSCALE)
if os.path.exists(out): shutil.rmtree(out)
os.makedirs(out)
frames = sorted(f for f in os.listdir(src) if f.endswith(".png"))
hits, last = [], None
for name in frames:
    img = cv2.imread(os.path.join(src, name), cv2.IMREAD_UNCHANGED)
    gray = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)
    gray[img[:, :, 3] < 128] = 0
    best = None
    for s in np.linspace(scales[0], scales[1], 9):
        t = cv2.resize(tpl0, None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
        th, tw = t.shape
        if last:
            x0, y0 = max(0, last[0] - 2 * tw), max(0, last[1] - 2 * th)
            roi = gray[y0:y0 + 5 * th, x0:x0 + 5 * tw]
        else:
            x0, y0, roi = 0, 0, gray
        if roi.shape[0] < th or roi.shape[1] < tw: continue
        r = cv2.matchTemplate(roi, t, cv2.TM_CCOEFF_NORMED)
        _, v, _, loc = cv2.minMaxLoc(r)
        if not best or v > best[0]: best = (v, x0 + loc[0], y0 + loc[1], tw, th)
    v, x, y, tw, th = best
    ok = v > 0.35
    if ok:
        last = (x, y)
        cx, cy, rad = x + tw / 2, y + th / 2, max(tw, th) / 2
        mask = np.zeros(gray.shape, np.uint8)
        cv2.circle(mask, (int(cx), int(cy)), int(rad * ring), 255, -1)
        fw, fh = int(rad * 1.35 * ring / 0.62), int(rad * fringe)
        cv2.rectangle(mask, (int(cx - fw / 2), int(cy + rad * 0.5)), (int(cx + fw / 2), int(cy + rad * 0.5 + fh)), 255, -1)
        bright = (gray > 140) & (mask > 0) & (img[:, :, 3] > 128)
        img[bright, 0], img[bright, 1], img[bright, 2] = 255, 0, 255  # BGR magenta marker
    hits.append({"frame": name, "score": round(float(v), 3), "found": bool(ok)})
    cv2.imwrite(os.path.join(out, name), img)
json.dump(hits, open(os.path.join(out, "amulet.json"), "w"), indent=1)
found = sum(h["found"] for h in hits)
print(json.dumps({"frames": len(hits), "found": found, "min_score": min(h["score"] for h in hits)}))
