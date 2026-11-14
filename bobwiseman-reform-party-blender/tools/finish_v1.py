"""Finish the verse 1 Blender frames the way draft 5 finishes its own (render.js vignette, grain,
captions), and build the review files. Lyric text is read at run time from the Reform Party project's
source/lines.json and never lands in this folder's git.

    python tools/finish_v1.py <reform-party project dir> <blender frames dir> [--t0 16.7] [--tag v1]

Blender frames are f_NNNN.png (Blender's own numbering, frame 1 = t0) or fNNNN.png (the cloud run).
Writes out/<tag>/finished/, out/<tag>_blender_720p.mp4 (the cut for Bob, with the song) and, when
out/draft5/ holds draft 5's frames at the same times (check.mjs --full), out/<tag>_side_by_side.mp4
and out/<tag>_side_by_side.jpg.
"""
import argparse
import glob
import json
import os
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out")
ap = argparse.ArgumentParser()
ap.add_argument("proj")
ap.add_argument("frames")
ap.add_argument("--t0", type=float, default=16.7)
ap.add_argument("--tag", default="v1")
ap.add_argument("--pick", default="1,32,80,120,170,215,260,300,350,420,480,545")
A = ap.parse_args()
FPS = 24
FONT = os.path.join(A.proj, "fonts", "Newsreader-Italic.ttf")
LINES = json.load(open(os.path.join(A.proj, "source", "lines.json")))
LINES = LINES["lines"] if isinstance(LINES, dict) else LINES

files = sorted(glob.glob(os.path.join(A.frames, "f_*.png")) or glob.glob(os.path.join(A.frames, "f[0-9]*.png")))
NF = len(files)
W, H = Image.open(files[0]).size
S = W / 1920


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
    font = ImageFont.truetype(FONT, 50)
    d0 = ImageDraw.Draw(img)
    w0 = sum(d0.textlength(w, font=font) for w in words) + 50 * 0.27 * (len(words) - 1)
    size = max(18, int(50 * min(1, 1500 / w0))) * S                    # the line fits 1500 px at full size
    font = ImageFont.truetype(FONT, round(size))
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
        over.paste((16, 9, 7, 255), (0, 0), band.filter(ImageFilter.GaussianBlur(size * 0.35)))
    shadow, text = Image.new("RGBA", img.size, (0, 0, 0, 0)), Image.new("RGBA", img.size, (0, 0, 0, 0))
    ds, dt = ImageDraw.Draw(shadow), ImageDraw.Draw(text)
    for i, w in enumerate(words):
        if i < n:
            ws = cur["words"][i]["s"] if i < len(cur["words"]) else cur["s"]
            a = round(255 * clamp((t - ws) / 0.12 + 0.2))
            ds.text((x, y + 3 * S), w, font=font, fill=(20, 10, 5, round(a * 0.85)), anchor="ls")
            dt.text((x, y), w, font=font, fill=(247, 236, 211, a), anchor="ls")
        x += widths[i] + gap
    img = Image.alpha_composite(img.convert("RGBA"), over)
    img = Image.alpha_composite(img, shadow.filter(ImageFilter.GaussianBlur(7 * S)))
    return Image.alpha_composite(img, text).convert("RGB")


YY, XX = np.mgrid[0:H, 0:W]
VIG = np.clip((np.hypot(XX - W / 2, YY - H * 0.55) - H * 0.45) / (H * 0.6), 0, 1)[..., None] * 0.36


def finish(img, f):
    a = np.asarray(img).astype(np.float32)
    a = a * (1 - VIG) + np.array([30, 15, 10], np.float32) * VIG
    a += np.random.default_rng(900 + f % 8).normal(0, 2.6, (H, W, 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


fin = os.path.join(OUT, A.tag, "finished")
os.makedirs(fin, exist_ok=True)
draft = sorted(glob.glob(os.path.join(OUT, "draft5", "t_*.jpg")))
pairs = os.path.join(OUT, A.tag, "pairs")
if len(draft) >= NF:
    os.makedirs(pairs, exist_ok=True)
for k, p in enumerate(files):
    f = k + 1
    t = A.t0 + k / FPS
    img = caption(finish(Image.open(p).convert("RGB"), f), t)
    img.save(os.path.join(fin, "f_%04d.png" % f))
    if len(draft) >= NF:
        pair = Image.new("RGB", (2 * W, H))
        pair.paste(Image.open(draft[k]).convert("RGB").resize((W, H), Image.LANCZOS), (0, 0))
        pair.paste(img, (W, 0))
        pair.save(os.path.join(pairs, "p_%04d.jpg" % f), quality=90)

song = os.path.join(A.proj, "assets", "song.wav")


def encode(pattern, out, vf=None):
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", pattern, "-ss", "%.4f" % A.t0,
           "-t", "%.4f" % (NF / FPS), "-i", song]
    if vf:
        cmd += ["-vf", vf]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "6M", "-bufsize", "12M",
            "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)


encode(os.path.join(fin, "f_%04d.png"), os.path.join(OUT, A.tag + "_blender_720p.mp4"))
if len(draft) >= NF:
    encode(os.path.join(pairs, "p_%04d.jpg"), os.path.join(OUT, A.tag + "_side_by_side.mp4"), vf="scale=1920:-2")
    pick = [int(x) for x in A.pick.split(",") if int(x) <= NF]
    TW, TH = 640, 360
    font = ImageFont.truetype(FONT, 22)
    sheet = Image.new("RGB", (2 * TW + 30, 60 + len(pick) * (TH + 30)), (24, 20, 18))
    d = ImageDraw.Draw(sheet)
    d.text((10, 16), "draft 5 (Canvas2D)", font=ImageFont.truetype(FONT, 30), fill=(240, 228, 204))
    d.text((TW + 20, 16), "Blender 4.5 (EEVEE, cel + Line Art)", font=ImageFont.truetype(FONT, 30), fill=(240, 228, 204))
    for r, f in enumerate(pick):
        pr = Image.open(os.path.join(pairs, "p_%04d.jpg" % f))
        y = 60 + r * (TH + 30)
        sheet.paste(pr.crop((0, 0, W, H)).resize((TW, TH), Image.LANCZOS), (10, y))
        sheet.paste(pr.crop((W, 0, 2 * W, H)).resize((TW, TH), Image.LANCZOS), (TW + 20, y))
        d.text((10, y + TH + 3), "%.2f s (frame %d)" % (A.t0 + (f - 1) / FPS, f), font=font, fill=(205, 190, 165))
    sheet.save(os.path.join(OUT, A.tag + "_side_by_side.jpg"), quality=88)
print("finished %d frames -> %s" % (NF, os.path.join(OUT, A.tag + "_blender_720p.mp4")))
