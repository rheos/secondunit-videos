"""One-spiral-line portrait: a single Archimedean spiral, wound out from a chosen centre, whose width follows the
photo's darkness (Claude Mellan's 1649 engraving technique). The animation is the line being drawn.

  uv run --no-project --with opencv-python-headless --with numpy python tools/spiral.py still out/still.png
  uv run --no-project --with opencv-python-headless --with numpy python tools/spiral.py film out/spiral.mp4
  ... film out/clip.mp4 --clip     the 360x640 styles-page clip

Settings are the constants below. The photo is cropped to a square, given local contrast (CLAHE) so a dark figure
separates from a dark sky, then mapped to line width. Drawn at 2x and reduced, so the ribbon edges stay clean.
"""
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).resolve().parent.parent
SRC = HERE / "work" / "moon.webp"
CROP = (0, 150, 704, 704)        # x, y, w, h in the photo: moon, hat, guitar
CENTRE = (430, 500)              # spiral starts here, in photo pixels: the middle of the moon
OW, OH = 1080, 1080              # output size; the crop must have the same aspect
SS = 2                           # supersample
SPACING = 5.0                    # px between turns at output size
MIN_W, MAX_W = 0.06, 0.78        # line width as a share of SPACING, white to black
GAMMA = 1.0                      # >1 thins the mid-greys, keeping the sky lighter than the figure
INK = (23, 26, 29)               # BGR, warm black
PAPER = (214, 231, 239)          # BGR, cream
DRAW_S, HOLD_S, FPS = 7.0, 2.5, 24


def tone():
    img = cv2.imread(str(SRC), cv2.IMREAD_COLOR)
    x, y, w, h = CROP
    g = cv2.cvtColor(img[y:y + h, x:x + w], cv2.COLOR_BGR2GRAY)
    g = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(6, 6)).apply(g)
    g = cv2.resize(g, (OW * SS, OH * SS), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255
    lo, hi = np.percentile(g, 1), np.percentile(g, 99.5)
    g = np.clip((g - lo) / (hi - lo), 0, 1)
    return (1 - g) ** GAMMA  # darkness 0..1


def spiral(dark):
    nw, nh = OW * SS, OH * SS
    k = nw / CROP[2]
    cx, cy = (CENTRE[0] - CROP[0]) * k, (CENTRE[1] - CROP[1]) * k
    s = SPACING * SS
    rmax = max(np.hypot(cx - a, cy - b) for a in (0, nw) for b in (0, nh)) + s
    # Archimedean r = s * theta / 2pi, sampled about every 1.5 px of arc
    pts, th = [], 0.4
    while True:
        r = s * th / (2 * np.pi)
        if r > rmax:
            break
        pts.append((cx + r * np.cos(th), cy + r * np.sin(th), th))
        th += 1.5 * SS / max(r, s)
    p = np.array(pts)
    xi = np.clip(p[:, 0], 0, nw - 1).astype(int); yi = np.clip(p[:, 1], 0, nh - 1).astype(int)
    inside = (p[:, 0] >= 0) & (p[:, 0] < nw) & (p[:, 1] >= 0) & (p[:, 1] < nh)
    w = s * (MIN_W + (MAX_W - MIN_W) * dark[yi, xi]) * inside
    # normals: the spiral's outward direction (good enough at these radii)
    d = np.gradient(p[:, :2], axis=0); t = d / np.maximum(np.linalg.norm(d, axis=1, keepdims=True), 1e-6)
    nrm = np.stack([-t[:, 1], t[:, 0]], 1)
    return p[:, :2], w, nrm


def draw_range(canvas, P, w, nrm, a, b):
    """Fill the ribbon from point a to b in chunks."""
    step = 300
    for i in range(a, b, step):
        j = min(b, i + step + 1)
        if j - i < 2:
            continue
        L = P[i:j] + nrm[i:j] * (w[i:j, None] / 2)
        R = P[i:j] - nrm[i:j] * (w[i:j, None] / 2)
        # 4 fractional bits: whole-pixel edges make near-vertical lines step together into bands
        poly = np.round(np.concatenate([L, R[::-1]]) * 16).astype(np.int32)
        cv2.fillPoly(canvas, [poly], INK, lineType=cv2.LINE_AA, shift=4)


def paper():
    nw, nh = OW * SS, OH * SS
    c = np.full((nh, nw, 3), PAPER, np.uint8).astype(np.int16)
    rng = np.random.default_rng(7)
    grain = cv2.GaussianBlur(rng.normal(0, 6, (nh, nw)).astype(np.float32), (0, 0), 1.2)
    c += grain[..., None].astype(np.int16)
    return np.clip(c, 0, 255).astype(np.uint8)


def reduce(c):
    return cv2.resize(c, (OW, OH), interpolation=cv2.INTER_AREA)


# The styles-page clip: 360x640, its own render (scaling the 1080 one down turns the turns to moire).
CLIP = dict(CROP=(0, 100, 704, 1252), OW=360, OH=640, SPACING=3.2, DRAW_S=4.5, HOLD_S=1.5)


def main():
    if "--clip" in sys.argv:
        globals().update(CLIP)
    mode, out = sys.argv[1], Path(sys.argv[2])
    out.parent.mkdir(exist_ok=True)
    P, w, nrm = spiral(tone())
    N = len(P)
    canvas = paper()
    if mode == "still":
        draw_range(canvas, P, w, nrm, 0, N)
        cv2.imwrite(str(out), reduce(canvas))
        print(out, N, "points")
        return
    frames_draw, frames_hold = int(DRAW_S * FPS), int(HOLD_S * FPS)
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{OW}x{OH}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p",
                           "-movflags", "+faststart", str(out)], stdin=subprocess.PIPE)
    done = 0
    for f in range(frames_draw + frames_hold):
        k = min(1, (f + 1) / frames_draw)
        k = k * k * (3 - 2 * k) * 0.25 + k * 0.75  # mostly constant speed, soft at both ends
        upto = int(N * k)
        draw_range(canvas, P, w, nrm, max(0, done - 1), upto)
        done = upto
        frame = reduce(canvas)
        if done < N:  # the pen tip
            x, y = P[done - 1] / SS
            cv2.circle(frame, (int(x), int(y)), max(2, round(SPACING * 0.6)), INK, -1, cv2.LINE_AA)
        ff.stdin.write(frame.tobytes())
    ff.stdin.close(); ff.wait()
    print(out, N, "points", frames_draw + frames_hold, "frames")


if __name__ == "__main__":
    main()
