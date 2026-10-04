"""Build the dream-of-fire storyboard for hjeron_dark_blues: frames, contact sheet, STORYBOARD docs.

  python tools/build.py            # frames/shot_XX.jpg, frames/board.jpg, docs/STORYBOARD*.md

Free and local only: no Higgsfield calls. Real frames come from Hjeron's clips (read only); shots
with no real source frame get a placeholder card cut from the nearest inspiration image.

Lyrics never enter git. The shot data carries line tokens ({L14}); the script renders
docs/STORYBOARD.md with the real lines from the local lyrics file (gitignored) and
docs/STORYBOARD.public.md with [L14] tokens (committed).
Song frames are 24 fps, half-open [a, b). Source clips are 30 fps; src is seconds into the clip.
"""
import json
import os
import re

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
SU = "/Users/robin/Code/novadiem/indieagent/secondunit/"
FOOT = "/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/artists/mythmaker/footage/"
AUG = SU + "mv-projects/hjeron-dark-blues-augment/"
REF = SU + "hjeron-darkblues-ref/"
LYR = SU + "mv-projects/_hjeron-dream-of-fire/dream-of-fire.lyrics.txt"
FPS, TOTAL = 24, 2342
CLIPS = [c["path"] for c in json.load(open(FOOT + "manifest.json"))["clips"]]
FONT = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_R = "/System/Library/Fonts/Supplemental/Arial.ttf"

sys_path = os.path.join(HERE, "shots.py")
exec(open(sys_path).read())  # defines SHOTS, TRANSITIONS, PROMPTS, COSTS  # noqa: S102


def t(f):
    return f / FPS


def clip_frame(clip, src):
    cap = cv2.VideoCapture(FOOT + CLIPS[clip])
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    k = n - 1 if src == "last" else min(n - 1, round(src * fps))
    cap.set(cv2.CAP_PROP_POS_FRAMES, k)
    ok, img = cap.read()
    cap.release()
    return Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))


def video_frame(path, k):
    cap = cv2.VideoCapture(path)
    cap.set(cv2.CAP_PROP_POS_FRAMES, k)
    ok, img = cap.read()
    cap.release()
    return Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))


def crop916(im, cx=0.5, cy=0.5):
    w, h = im.size
    if w / h > 9 / 16:
        nw = round(h * 9 / 16)
        x0 = int(min(max(cx * w - nw / 2, 0), w - nw))
        im = im.crop((x0, 0, x0 + nw, h))
    else:
        nh = round(w * 16 / 9)
        y0 = int(min(max(cy * h - nh / 2, 0), h - nh))
        im = im.crop((0, y0, w, y0 + nh))
    return im.resize((540, 960), Image.LANCZOS)


def caption(im, top, bottom, placeholder=False):
    d = ImageDraw.Draw(im, "RGBA")
    f1 = ImageFont.truetype(FONT, 26)
    f2 = ImageFont.truetype(FONT_R, 20)
    d.rectangle((0, 0, 540, 44), fill=(0, 0, 0, 170))
    d.text((12, 8), top, font=f1, fill=(255, 235, 200))
    lines = wrap(bottom, f2, 516)
    hh = 14 + 26 * len(lines)
    d.rectangle((0, 960 - hh, 540, 960), fill=(0, 0, 0, 185))
    for i, ln in enumerate(lines):
        d.text((12, 960 - hh + 7 + 26 * i), ln, font=f2, fill=(235, 235, 235))
    if placeholder:
        f3 = ImageFont.truetype(FONT, 22)
        d.rectangle((0, 44, 540, 78), fill=(150, 30, 10, 190))
        d.text((12, 49), "PLACEHOLDER: inspiration ref, not a render", font=f3, fill=(255, 255, 255))
    return im


def wrap(s, font, width):
    out, cur = [], ""
    for w in s.split():
        nxt = (cur + " " + w).strip()
        if font.getlength(nxt) > width and cur:
            out.append(cur)
            cur = w
        else:
            cur = nxt
    return out + ([cur] if cur else [])


def still(s):
    st = s["still"]
    kind = st[0]
    if kind == "clip":
        im = crop916(clip_frame(st[1], st[2]))
        ph = False
    elif kind == "video":
        im = crop916(video_frame(st[1], st[2]))
        ph = False
    else:  # placeholder from a ref image
        src = Image.open(st[1]).convert("RGB")
        if len(st) > 3:
            src = src.crop(st[3])
        im = crop916(src, *(st[2] if len(st) > 2 else (0.5, 0.5)))
        ph = True
    top = f"{s['n']:02d}  {s['type']}  f{s['a']:04d}-{s['b']:04d}  {t(s['a']):.2f}s"
    return caption(im, top, s["card"], ph)


def lyric_lines():
    lines = [ln.strip() for ln in open(LYR) if ln.strip() and not ln.startswith("#")]
    return {f"L{i + 1}": ln for i, ln in enumerate(lines[:25])}


def render_tokens(text, lyr):
    if lyr is None:
        return re.sub(r"\{(L\d+)\}", r"[\1]", text)
    return re.sub(r"\{(L\d+)\}", lambda m: lyr[m.group(1)], text)


def ai_frames(s):
    return 0 if s["type"] == "REAL" else s["b"] - s["a"]


def check():
    prev = 0
    for s in SHOTS:
        assert s["a"] == prev, (s["n"], s["a"], prev)
        assert s["b"] > s["a"], s["n"]
        prev = s["b"]
    assert prev == TOTAL, prev
    for i, s in enumerate(SHOTS):
        assert s["n"] == i + 1


def board(imgs):
    tw, th, cols = 180, 320, 10
    rows = (len(imgs) + cols - 1) // cols
    sheet = Image.new("RGB", (tw * cols, (th + 40) * rows), (12, 12, 14))
    d = ImageDraw.Draw(sheet)
    f = ImageFont.truetype(FONT, 14)
    f2 = ImageFont.truetype(FONT_R, 12)
    for i, (s, im) in enumerate(zip(SHOTS, imgs)):
        x, y = (i % cols) * tw, (i // cols) * (th + 40)
        sheet.paste(im.resize((tw, th)), (x, y))
        col = (255, 225, 170) if s["type"] == "REAL" else (255, 120, 90)
        d.text((x + 4, y + th + 3), f"{s['n']:02d} {s['type']}", font=f, fill=col)
        d.text((x + 4, y + th + 21), f"{t(s['a']):.2f}-{t(s['b']):.2f}s f{s['a']}", font=f2, fill=(200, 200, 200))
    sheet.save(os.path.join(PROJ, "frames", "board.jpg"), quality=88)


def main():
    check()
    os.makedirs(os.path.join(PROJ, "frames"), exist_ok=True)
    imgs = []
    for s in SHOTS:
        im = still(s)
        im.save(os.path.join(PROJ, "frames", f"shot_{s['n']:02d}.jpg"), quality=88)
        imgs.append(im)
    board(imgs)
    lyr = lyric_lines()
    head = open(os.path.join(PROJ, "docs", "storyboard.template.md")).read()
    body = shot_docs()
    totals = totals_doc()
    for name, l in (("STORYBOARD.md", lyr), ("STORYBOARD.public.md", None)):
        txt = head.replace("{{SHOTS}}", body).replace("{{TOTALS}}", totals)
        if l is None:
            txt = txt.replace("<!--LOCAL-->", "> Public copy: lyric lines are tokens ([L14]) that index the local-only lyrics file. "
                              "The local docs/STORYBOARD.md has the real lines and is gitignored.")
        else:
            txt = txt.replace("<!--LOCAL-->", "> LOCAL COPY with lyrics: gitignored, never commit. The committed twin is STORYBOARD.public.md.")
        open(os.path.join(PROJ, "docs", name), "w").write(render_tokens(txt, l))
    ai = sum(ai_frames(s) for s in SHOTS)
    print(f"{len(SHOTS)} shots, AI frames {ai} / {TOTAL} = {100 * ai / TOTAL:.1f}%")
    print("planned credits", sum(c for _, _, c, _ in COSTS))


def shot_docs():
    out = ["| # | frames | time (s) | lyric | type | source (clip, exact frames) | viewer sees | cr |",
           "|---|---|---|---|---|---|---|---|"]
    for s in SHOTS:
        out.append(f"| {s['n']:02d} | f{s['a']:04d}-f{s['b']:04d} ({s['b'] - s['a']}) | {t(s['a']):.2f}-{t(s['b']):.2f} | "
                   f"{s['lyric'] or 'instr.'} | **{s['type']}** | {s['src']} | {s['sees']} | {s.get('cr', 0)} |")
    out.append("")
    out.append("### Shot by shot")
    out.append("")
    for s in SHOTS:
        lyr = s["lyric"] or "(instrumental)"
        out.append(f"#### {s['n']:02d}. {s['type']}: {s['title']}")
        out.append("")
        out.append(f"- **Song:** f{s['a']:04d}-f{s['b']:04d} ({s['b'] - s['a']} frames), {t(s['a']):.3f}-{t(s['b']):.3f} s")
        out.append(f"- **Lyric:** {lyr}")
        out.append(f"- **Source:** {s['src']}")
        out.append(f"- **Viewer sees:** {s['sees']}")
        out.append(f"- **Camera:** {s['cam']}")
        out.append(f"- **Look match:** {s['look']}")
        if s.get("tin"):
            out.append(f"- **Transition in:** {s['tin']}")
        if s.get("pid"):
            for pid in s["pid"]:
                p = PROMPTS[pid]
                out.append(f"- **Generation `{pid}`:** `{p['cmd']}`  ({p['cr']} credits, from `generate cost`)")
                out.append("")
                out.append("  ```text")
                for ln in p["prompt"].strip().split("\n"):
                    out.append("  " + ln)
                out.append("  ```")
        out.append(f"- **Credits:** {s.get('cr', 0)}")
        out.append(f"- **Still:** `frames/shot_{s['n']:02d}.jpg`")
        out.append("")
    return "\n".join(out)


def totals_doc():
    ai = sum(ai_frames(s) for s in SHOTS)
    by = {}
    for s in SHOTS:
        k = s["type"]
        c, f = by.get(k, (0, 0))
        by[k] = (c + 1, f + s["b"] - s["a"])
    out = ["| ingredient | shots | frames | seconds | share of song |", "|---|---|---|---|---|"]
    for k in ["REAL", "BRIDGE", "CONTINUE", "LIPSYNC", "ANIMATION", "SCRATCHBOARD"]:
        c, f = by.get(k, (0, 0))
        out.append(f"| {k} | {c} | {f} | {f / FPS:.1f} | {100 * f / TOTAL:.1f}% |")
    out.append(f"| **all** | {len(SHOTS)} | {TOTAL} | {TOTAL / FPS:.1f} | 100% |")
    out.append("")
    out.append(f"**Generated or converted screen time: {ai} frames = {ai / FPS:.1f} s = {100 * ai / TOTAL:.1f}% of the song.** "
               f"Real, untouched: {TOTAL - ai} frames = {(TOTAL - ai) / FPS:.1f} s.")
    out.append("")
    out.append("| job | shot | credits | wave |")
    out.append("|---|---|---|---|")
    for job, shot, c, w in COSTS:
        out.append(f"| `{job}` | {shot} | {c} | {w} |")
    total = sum(c for _, _, c, _ in COSTS)
    out.append(f"| **planned total** | | **{total}** | |")
    return "\n".join(out)


if __name__ == "__main__":
    main()
