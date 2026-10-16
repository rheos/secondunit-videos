"""Finish the Blender frames the way draft 3 finishes its own, then lay them beside draft 3.

draft 3 draws its vignette, grain and captions in render.js; here the same three go over the Blender
frames with Pillow, so the side-by-side compares the 3D render and nothing else. Lyric text is read at
run time from the Reform Party project's source/lines.json (never committed).

    python tools/compare.py <reform-party project dir>

Reads out/frames/f_####.png (Blender) and out/draft3/t_*.jpg (draft 3 at 1920x1080, from check.mjs
--full), writes out/finished/, out/side_by_side.jpg (contact sheet), out/side_by_side.mp4 and
out/blender_shot.mp4 (both with the song).
"""
import glob
import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "out")
PROJ = sys.argv[1]
FPS, T0, NF = 24, 23.5, 84
W, H = 960, 540
S = W / 1920                                    # draft 3 draws at 1920x1080

LINES = json.load(open(os.path.join(PROJ, "source", "lines.json")))
LINES = LINES["lines"] if isinstance(LINES, dict) else LINES
FONT = os.path.join(PROJ, "fonts", "Newsreader-Italic.ttf")


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def caption(img, t):
    """render.js captions(): the line's words appear on their onsets over a soft dark band."""
    cur, end = None, 0
    for i, l in enumerate(LINES):
        nx = LINES[i + 1] if i + 1 < len(LINES) else None
        e = min(l["e"] + 0.6, nx["s"] - 0.05 if nx else 1e9)
        if l["s"] - 0.05 <= t < e:
            cur, end = l, e
    if not cur:
        return img
    n = len([w for w in cur["words"] if w["s"] <= t + 0.05 + 1e-6])
    if not n:
        return img
    words = cur["text"].split()
    size = 50 * S
    font = ImageFont.truetype(FONT, round(size))
    d0 = ImageDraw.Draw(img)
    widths = [d0.textlength(w, font=font) for w in words]
    gap = size * 0.27
    tw = sum(widths) + gap * (len(words) - 1)
    x, y = W / 2 - tw / 2, 1014 * S
    ba = clamp((t - cur["s"] + 0.05) / 0.2) * clamp((end - t) / 0.25) * 0.48
    over = Image.new("RGBA", img.size, (0, 0, 0, 0))
    if ba > 0:
        band = Image.new("L", img.size, 0)
        pad = size * 1.6
        ImageDraw.Draw(band).rounded_rectangle((x - pad * 0.6, y - size * 1.05, x + tw + pad * 0.6, y + size * 0.45), radius=size * 0.4, fill=round(255 * ba))
        band = band.filter(ImageFilter.GaussianBlur(size * 0.35))
        over.paste((16, 9, 7, 255), (0, 0), band)
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    text = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ds, dt = ImageDraw.Draw(shadow), ImageDraw.Draw(text)
    for i, w in enumerate(words):
        if i < n:
            ws = cur["words"][i]["s"] if i < len(cur["words"]) else cur["s"]
            a = round(255 * clamp((t - ws) / 0.12 + 0.2))
            ds.text((x, y + 3 * S), w, font=font, fill=(20, 10, 5, round(a * 0.85)), anchor="ls")
            dt.text((x, y), w, font=font, fill=(247, 236, 211, a), anchor="ls")
        x += widths[i] + gap
    shadow = shadow.filter(ImageFilter.GaussianBlur(14 * S / 2))
    img = Image.alpha_composite(img.convert("RGBA"), over)
    img = Image.alpha_composite(img, shadow)
    return Image.alpha_composite(img, text).convert("RGB")


YY, XX = np.mgrid[0:H, 0:W]
R = np.hypot(XX - W / 2, YY - H * 0.55)
VIG = np.clip((R - H * 0.45) / (H * 0.6), 0, 1)[..., None] * 0.36     # render.js vignette(): to rgba(30,15,10,.36)


def finish(img, f):
    a = np.asarray(img).astype(np.float32)
    a = a * (1 - VIG) + np.array([30, 15, 10], np.float32) * VIG
    rng = np.random.default_rng(900 + f % 8)                            # draft 3 picks one of 8 grain tiles per frame
    a += rng.normal(0, 2.6, (H, W, 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


os.makedirs(os.path.join(OUT, "finished"), exist_ok=True)
os.makedirs(os.path.join(OUT, "pairs"), exist_ok=True)
draft = sorted(glob.glob(os.path.join(OUT, "draft3", "t_*.jpg")))
assert len(draft) == NF, len(draft)
for f in range(1, NF + 1):
    t = T0 + (f - 1) / FPS
    img = Image.open(os.path.join(OUT, "frames", "f_%04d.png" % f)).convert("RGB")
    img = caption(finish(img, f), t)
    img.save(os.path.join(OUT, "finished", "f_%04d.png" % f))
    dr = Image.open(draft[f - 1]).convert("RGB").resize((W, H), Image.LANCZOS)
    pair = Image.new("RGB", (2 * W, H))
    pair.paste(dr, (0, 0))
    pair.paste(img, (W, 0))
    pair.save(os.path.join(OUT, "pairs", "p_%04d.jpg" % f), quality=92)

# the contact sheet: six moments, draft 3 on the left, Blender on the right
PICK = [(1, "rest"), (30, "tape lands on \"can't\""), (37, "tape on, LEDs red"), (52, "the slump starts"),
        (68, "running over the edge"), (84, "full slump, the move to the ear begins")]
TW, TH, LAB, HEAD = 800, 450, 34, 64
sheet = Image.new("RGB", (2 * TW + 30, HEAD + len(PICK) * (TH + LAB) + 20), (24, 20, 18))
d = ImageDraw.Draw(sheet)
hf = ImageFont.truetype(FONT, 34)
lf = ImageFont.truetype(FONT, 22)
d.text((10, 14), "draft 3 (Canvas2D, code-drawn)", font=hf, fill=(240, 228, 204))
d.text((TW + 20, 14), "Blender 4.5 look test (EEVEE, cel + Line Art)", font=hf, fill=(240, 228, 204))
for k, (f, label) in enumerate(PICK):
    t = T0 + (f - 1) / FPS
    y = HEAD + k * (TH + LAB)
    pair = Image.open(os.path.join(OUT, "pairs", "p_%04d.jpg" % f))
    sheet.paste(pair.crop((0, 0, W, H)).resize((TW, TH), Image.LANCZOS), (10, y))
    sheet.paste(pair.crop((W, 0, 2 * W, H)).resize((TW, TH), Image.LANCZOS), (TW + 20, y))
    d.text((10, y + TH + 4), "%.2f s  (frame %d)  %s" % (t, f, label), font=lf, fill=(205, 190, 165))
sheet.save(os.path.join(OUT, "side_by_side.jpg"), quality=88)

song = os.path.join(PROJ, "assets", "song.wav")
for name, pat in (("side_by_side", "pairs/p_%04d.jpg"), ("blender_shot", "finished/f_%04d.png")):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(OUT, pat),
                    "-ss", str(T0), "-t", str(NF / FPS), "-i", song, "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", os.path.join(OUT, name + ".mp4")], check=True)
print("wrote", os.path.join(OUT, "side_by_side.jpg"), "and the two mp4s")
