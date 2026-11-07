#!/usr/bin/env python3
"""Cut the finished 9:16 film into ad clips with a swappable end card.
Usage: ihd_clips.py FINISHED.mp4 OUT_DIR [LEG]   LEG is a key in ../legs.json; without it the clips are clean.
A new tour leg means a new legs.json entry and a run of this script, about a minute; nothing is re-rendered."""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

CLIPS = [("a", 17.0, 44.9), ("b", 44.9, 75.3), ("c", 75.3, 106.9), ("d", 106.9, 137.3), ("e", 137.3, 162.8),
         ("f", 162.8, 190.9), ("g", 190.9, 216.9), ("h", 216.9, 248.4), ("i", 248.4, 282.0)]
CARD_S = 4.5
W, H = 720, 1280
HAND = "/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf"
CREAM, GOLD, NIGHT = (255, 233, 176, 255), (255, 197, 49, 255), (10, 16, 51)


def fit(draw, text, size, width):
    while True:
        font = ImageFont.truetype(HAND, size)
        if draw.textlength(text, font=font) <= width or size < 20:
            return font
        size -= 2


def card(leg, path):
    """Dates sit in the middle of the frame, clear of the phone apps' top bar and bottom caption area."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    rows = leg["shows"]
    top = 300
    bottom = 300 + 150 + 92 * len(rows) + 90
    panel = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(panel).rounded_rectangle((44, top - 36, W - 44, bottom), 26, fill=NIGHT + (222,), outline=(255, 197, 49, 255), width=3)
    img.alpha_composite(panel)
    d.text((W / 2, top + 30), leg["title"], font=fit(d, leg["title"], 74, W - 150), fill=CREAM, anchor="mm")
    d.ellipse((W / 2 - 13, top + 78, W / 2 + 13, top + 104), fill=GOLD)
    y = top + 158
    for date, city, venue in rows:
        d.text((76, y), date, font=fit(d, "Nov 22", 40, 150), fill=GOLD, anchor="lm")
        d.text((228, y - (15 if venue else 0)), city, font=fit(d, city, 44, W - 300), fill=CREAM, anchor="lm")
        if venue:
            d.text((228, y + 25), venue, font=fit(d, venue, 27, W - 300), fill=(198, 208, 240, 255), anchor="lm")
        y += 92
    d.text((W / 2, y + 2), leg["url"], font=fit(d, leg["url"], 36, W - 150), fill=CREAM, anchor="mm")
    img.save(path)


def run(*a):
    subprocess.run(a, check=True)


def main():
    src, out = sys.argv[1], Path(sys.argv[2])
    leg_key = sys.argv[3] if len(sys.argv) > 3 else None
    out.mkdir(parents=True, exist_ok=True)
    png = None
    if leg_key:
        leg = json.loads((Path(__file__).parent.parent / "legs.json").read_text())[leg_key]
        png = out / f"card_{leg_key}.png"
        card(leg, png)
    for name, a, b in CLIPS:
        dur = b - a
        tag = f"_{leg_key}" if leg_key else "_clean"
        dest = out / f"ihd-clip-{name}{tag}_720x1280.mp4"
        vf = f"scale={W}:{H}:flags=lanczos,fade=t=in:st=0:d=0.3:c=0x0A1033"
        af = f"afade=t=in:st=0:d=0.15,afade=t=out:st={dur - 0.7:.3f}:d=0.7"
        cmd = ["ffmpeg", "-y", "-v", "error", "-ss", f"{a:.3f}", "-t", f"{dur:.3f}", "-i", src]
        if png:
            at = dur - CARD_S
            cmd += ["-loop", "1", "-t", f"{dur:.3f}", "-i", str(png), "-filter_complex",
                    f"[0:v]{vf}[v];[1:v]format=rgba,fade=t=in:st={at:.3f}:d=0.5:alpha=1[c];[v][c]overlay=format=auto:shortest=1[o]", "-map", "[o]", "-map", "0:a", "-af", af]
        else:
            cmd += ["-vf", vf, "-af", af]
        cmd += ["-c:v", "libx264", "-crf", "23", "-maxrate", "4.5M", "-bufsize", "9M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", str(dest)]
        run(*cmd)
        print(dest.name, round(dur, 1))


main()
