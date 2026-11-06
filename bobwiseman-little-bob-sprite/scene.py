#!/usr/bin/env python3
"""Walk the finished Little Bob pixel loop through a side-on road drawn in the 16bit look's palette.

Follows the 16bit rules: indexed 320x180 buffer, palette colours only, integer positions, 4x4 Bayer
dither, x4 nearest at 720p. Writes raw 1280x720 frames to stdout for ffmpeg.

usage: scene.py <palette.json> <pixel frames dir> <seconds> | ffmpeg -f rawvideo ...
"""
import glob
import json
import sys

import numpy as np
from PIL import Image

W, H, FPS, SCALE = 320, 180, 24, 4
SPRITE_FRAMES = 12  # 12 of the 40 loop frames, one stride a second, each held 2 video frames
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0


def load_palette(path):
    colours = json.load(open(path))["colors"]
    return {c["name"]: tuple(int(c["hex"][i:i + 2], 16) for i in (1, 3, 5)) for c in colours}


def background(pal):
    """Sky, skyline and hills, grass, then the road seen from the side with a dashed line."""
    img = np.zeros((H, W, 3), np.uint8)
    yy, xx = np.mgrid[0:H, 0:W]
    bayer = BAYER[yy % 4, xx % 4]

    def band(top, bottom, c1, c2):
        t = (yy - top) / max(1, bottom - top)
        mask = (yy >= top) & (yy < bottom)
        img[mask & (t <= bayer)] = pal[c1]
        img[mask & (t > bayer)] = pal[c2]

    band(0, 88, "DBLUE", "BLUE")
    img[(yy >= 88) & (yy < 112)] = pal["SKY"]
    rng = np.random.default_rng(7)
    x = 0
    while x < W:  # skyline, one colour per building, lit windows on a 3 px grid
        wide, tall = int(rng.integers(12, 26)), int(rng.integers(22, 62))
        top = 112 - tall
        img[top:112, x:x + wide] = pal["SLATE"]
        for wy in range(top + 3, 108, 5):
            for wx in range(x + 2, x + wide - 2, 4):
                if rng.random() < 0.45:
                    img[wy:wy + 2, wx:min(W, wx + 2)] = pal["YELLOW"]
        x += wide + int(rng.integers(0, 4))
    band(112, 128, "LGREEN", "SLATE")
    img[(yy >= 128) & (yy < 136)] = pal["CREAMD"]
    road = (yy >= 136) & (yy < 180)
    img[road & ((xx // 2 + yy // 2) % 2 == 0)] = pal["ROADA"]
    img[road & ((xx // 2 + yy // 2) % 2 == 1)] = pal["ROADB"]
    img[136:138, :] = pal["WHITE"]
    for dash in range(0, W, 28):  # static marks, so a sliding foot would show against them
        img[166:168, dash:dash + 14] = pal["CREAM"]
    return img


def main():
    pal = load_palette(sys.argv[1])
    files = sorted(glob.glob(sys.argv[2] + "/*.png"))
    seconds = float(sys.argv[3])
    picks = [np.asarray(Image.open(files[round(i * len(files) / SPRITE_FRAMES) % len(files)]).convert("RGBA"))
             for i in range(SPRITE_FRAMES)]
    sprite_w = picks[0].shape[1]
    sprite_h = picks[0].shape[0]

    # Stride from the sprite: widest spread of the bottom rows, less one foot, twice per cycle.
    spreads = []
    for frame in picks:
        cols = np.where((frame[-8:, :, 3] > 0).any(0))[0]
        spreads.append(cols.max() - cols.min())
    step = max(spreads) - 6
    speed = 2 * step  # px per second at one stride a second
    print(f"step {step} px, speed {speed} px/s", file=sys.stderr)

    bg = background(pal)
    ground = 158
    start = -sprite_w
    for n in range(int(seconds * FPS)):
        t = n / FPS
        canvas = bg.copy()
        frame = picks[(n // 2) % SPRITE_FRAMES]
        px = start + int(round(speed * t))
        py = ground - sprite_h
        x0, x1 = max(0, px), min(W, px + sprite_w)
        if x1 > x0:
            part = frame[:, x0 - px:x1 - px]
            mask = part[..., 3] > 0
            canvas[py:py + sprite_h, x0:x1][mask] = part[..., :3][mask]
        sys.stdout.buffer.write(np.repeat(np.repeat(canvas, SCALE, 0), SCALE, 1).tobytes())


if __name__ == "__main__":
    main()
