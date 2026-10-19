# Compositor for 10,000 Miles (numpy + Pillow). Paper, sound rings, circle portals, the mosaic Earths, the rocket on
# top, the characters' one outer outline (from the holdout alpha render.py makes), grain.
#   uv run --with numpy --with pillow python comp.py --lineup           the cast line-up sheet (out/lineup/)
#   uv run --with numpy --with pillow python comp.py [--frames a,b,c] [--review --song <mp3>] [--encode-only]
import json, math, os, sys, subprocess
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json")))
FPS, T0, T1 = TL["fps"], TL["t0"], TL["t1"]
W, H = TL["size"]
OUT = os.path.join(HERE, "out")

def hexrgb(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255
PAPER, COBALT, LINE = hexrgb("#efe8db"), hexrgb("#2f5fb3"), hexrgb("#3b2a22")

def over(dst, rgb, a):
    a = a[..., None]; return dst * (1 - a) + rgb * a

def blur(a, r):
    """Separable box blur run three times (close to a Gaussian of about this radius), by cumulative sums."""
    out = a
    for _ in range(3):
        k = max(1, int(round(r)))
        for axis in (0, 1):
            pad = np.pad(out, [(k, k) if ax == axis else (0, 0) for ax in (0, 1)], mode="edge")
            c = np.cumsum(pad, axis=axis, dtype=np.float32)
            if axis == 0: out = (c[2 * k:, :] - c[:-2 * k, :]) / (2 * k)
            else: out = (c[:, 2 * k:] - c[:, :-2 * k]) / (2 * k)
    return out

def outline(dst, alpha, r=3.2, rgb=LINE, strength=1.0):
    """The characters' one outer outline: the alpha grown by about r px with a smooth edge (a blur thresholded softly,
    so curves stay curves), minus the alpha, in the line colour."""
    g = blur(alpha, r * .9)
    grown = np.clip((g - .06) / .12, 0, 1)
    ring = np.clip(grown - alpha, 0, 1) * strength
    return over(dst, rgb[None, None, :], ring)

def paper_img(w, h, seed=7):
    rng = np.random.default_rng(seed)
    def blotch(scale, amp):
        g = rng.random((h // scale + 2, w // scale + 2)).astype(np.float32)
        img = np.array(Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
        return (img - .5) * amp
    tone = blotch(140, .022) + blotch(40, .012)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); d = np.hypot(xx - w / 2, yy - h / 2)
    vign = 1 - .10 * np.clip((d / math.hypot(w / 2, h / 2) - .45) / .55, 0, 1) ** 2
    return np.clip(PAPER[None, None, :] * (1 + tone[..., None]) * vign[..., None], 0, 1)

def load_rgba(path):
    if not os.path.exists(path): return None
    return np.asarray(Image.open(path).convert("RGBA"), np.float32) / 255

if __name__ == "__main__" and "--lineup" in sys.argv:
    rows = []
    for v in ("playmobil",):
        im = load_rgba(os.path.join(OUT, "lineup", v + ".png"))
        if im is None: continue
        h, w = im.shape[:2]; bg = paper_img(w, h, 3)
        bg = outline(bg, im[..., 3], 3.4)
        bg = over(bg, im[..., :3], im[..., 3])
        rows.append((bg * 255 + .5).astype(np.uint8))
    sheet = np.concatenate(rows, 0)
    Image.fromarray(sheet).save(os.path.join(OUT, "lineup", "cast-lineup.png")); print("lineup", sheet.shape)
    sys.exit()
