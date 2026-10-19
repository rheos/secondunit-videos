# Take 05 compositor: paper, sound rings, circle portals, the mosaic Earth, the rocket on top, grain.
# Reads portals_take05.json and the Blender layers in out/portals/take-05/<part>/####.png (global frame numbers).
#   uv run --with numpy --with pillow python tools/portals_comp.py [--frames 1,200,500] [--review]
# Writes out/portals/take-05/comp/####.png; --review also encodes take-05_review_720p.mp4 with the song.
import json, math, os, sys, subprocess
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TM = json.load(open(os.path.join(HERE, "portals_take05.json")))
FPS, T0, T1 = TM["fps"], TM["t0"], TM["t1"]
W, H = TM["size"]
OUT = os.path.join(HERE, "out", "portals", "take-05")
NF = int(round((T1 - T0) * FPS))
time_of = lambda f: T0 + (f - 1) / FPS
CX, CY = W / 2, H / 2

def hexrgb(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255
PAPER, COBALT, SKY, SHADOW = hexrgb("#efe8db"), hexrgb("#2f5fb3"), hexrgb("#d6e6ea"), hexrgb("#3b3550")

def smooth(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
def s1(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def keyed(keys, t):
    if t <= keys[0][0]: return keys[0][1]
    for (a, va), (b, vb) in zip(keys, keys[1:]):
        if t <= b: return va + (vb - va) * s1((t - a) / (b - a))
    return keys[-1][1]

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
DIST = np.hypot(xx - CX, yy - CY); ANG = np.arctan2(yy - CY, xx - CX)

# ---------- paper, rendered once ----------
rng = np.random.default_rng(7)
def blotch(scale, amp):
    g = rng.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    img = np.array(Image.fromarray((g * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
    return (img - .5) * amp
tone = blotch(140, .022) + blotch(40, .012)
vign = 1 - .10 * smooth((DIST / math.hypot(CX, CY) - .45) / .55)
paper = np.clip(PAPER[None, None, :] * (1 + tone[..., None]) * vign[..., None], 0, 1)
GRAIN = [(rng.random((H, W)).astype(np.float32) - .5) * .045 for _ in range(3)]

def over(dst, rgb, a):
    a = a[..., None]; return dst * (1 - a) + rgb * a

def ring(dst, r, width, rgb, alpha, dash=0, phase=0.0):
    if r <= 0 or alpha <= 0: return dst
    a = np.clip(1 - np.abs(DIST - r) / (width / 2 + .7), 0, 1) * alpha
    if dash: a = a * smooth((np.sin(ANG * dash + phase) + .2) * 3)
    return over(dst, rgb[None, None, :] if rgb.ndim == 1 else rgb, a)

def load(part, f):
    p = os.path.join(OUT, part, f"{f:04d}.png")
    if not os.path.exists(p): return None
    im = Image.open(p); return np.asarray(im, np.float32) / 255

# ---------- mosaic layout: 36 cells, hex rings of 6/12/18 around the rocket ----------
RC = .06 * H                                    # cell radius
SP = 2.2 * RC
CELLS = []
for ring_i, n in ((1, 6), (2, 12), (3, 18)):
    for k in range(n):
        a = 2 * math.pi * k / n + (ring_i % 2) * math.pi / n
        CELLS.append((ring_i * SP * math.cos(a), ring_i * SP * math.sin(a), ring_i))
names = [f"{s}_{k}" for k in range(9) for s in ("problems", "world", "window", "cat")]
order = np.random.default_rng(11).permutation(36)
CELL_IMG = [names[i] for i in order]
MOS = {}
def mosaic_img(name, d):
    key = (name, d)
    if key not in MOS:
        p = os.path.join(OUT, "mosaic", name + ".png")
        im = Image.open(p).convert("RGB").resize((d, d), Image.LANCZOS) if os.path.exists(p) else Image.new("RGB", (d, d), (200, 200, 210))
        MOS[key] = np.asarray(im, np.float32) / 255
    return MOS[key]

def disc_paste(dst, cx, cy, rad, img=None, rgb=None, alpha=1.0, edge=None, edge_w=2.0, shadow=0.0):
    """A filled circle at (cx, cy): an image (centre-cropped square) or a flat colour, with an optional outline and shadow."""
    R = int(math.ceil(rad + 22)); x0, x1 = int(max(0, cx - R)), int(min(W, cx + R)); y0, y1 = int(max(0, cy - R)), int(min(H, cy + R + 10))
    if x1 <= x0 or y1 <= y0 or rad < .5: return dst
    sub = dst[y0:y1, x0:x1]; ly, lx = np.mgrid[y0:y1, x0:x1].astype(np.float32); d = np.hypot(lx - cx, ly - cy)
    if shadow:
        ds = np.hypot(lx - cx, ly - (cy + rad * .1 + 5))
        sub = over(sub, SHADOW[None, None, :], (1 - smooth((ds - rad * .92) / 16)) * shadow * alpha)
    m = np.clip(rad - d + .5, 0, 1) * alpha
    if img is not None:
        dd = img.shape[0]; ix = np.clip(((lx - cx) / (2 * rad) + .5) * dd, 0, dd - 1).astype(int); iy = np.clip(((ly - cy) / (2 * rad) + .5) * dd, 0, dd - 1).astype(int)
        sub = over(sub, img[iy, ix], m)
    else:
        sub = over(sub, rgb[None, None, :], m)
    if edge is not None:
        sub = over(sub, edge[None, None, :], np.clip(1 - np.abs(d - rad) / (edge_w / 2 + .7), 0, 1) * alpha)
    dst[y0:y1, x0:x1] = sub; return dst

def frame(f):
    t = time_of(f); img = paper.copy()
    # sound rings out of the rocket: each pulse grows past the frame in 2.6 s and fades; every other one dashed
    for i, p in enumerate(TM["pulses"]):
        u = (t - p) / 2.6
        if 0 <= u <= 1:
            img = ring(img, 18 + u * 760, 3.4 - 1.6 * u, COBALT, (1 - u) ** 1.2, dash=(36 if i % 2 else 0), phase=p)
    # portals: the scene inside a circle, a soft shadow, a cobalt edge; a ring runs just ahead as it opens
    for P in TM["portals"]:
        rr = keyed(P["r"], t) * H
        lead = keyed(P["r"], t + .12) * H
        if lead > rr + 1: img = ring(img, lead, 2.2, COBALT, .9)
        if rr < .5: continue
        sc = load(P["id"], f)
        if sc is None: continue
        sh = (1 - smooth((np.hypot(xx - CX, yy - CY - 6) - rr) / 18)) * .16
        img = over(img, SHADOW[None, None, :], sh * (DIST > rr - 2))
        img = over(img, sc[..., :3], np.clip(rr - DIST + .5, 0, 1))
        img = ring(img, rr, 3.0, COBALT, 1.0)
    # the mosaic: every place comes back as a circle and they pack into the Earth, which turns and falls away
    m0, m1 = TM["mosaic"]["fly_in"]; p0, p1 = TM["mosaic"]["pull_back"]
    if t >= m0:
        spin = math.radians(7) * max(0, t - m1)
        zoom = 1 - .42 * s1((t - p0) / (p1 - p0))
        earth = s1((t - (m1 - .8)) / .9)
        if earth > 0:
            er = (3 * SP + RC + 16) * zoom * (.6 + .4 * earth)
            img = disc_paste(img, CX, CY, er + 26 * zoom, rgb=hexrgb("#e6eef2"), alpha=.55 * earth)        # a little atmosphere
            img = disc_paste(img, CX, CY, er, rgb=SKY, alpha=earth, edge=COBALT, edge_w=2.4, shadow=.18)
        for i, (x, y, ring_i) in enumerate(CELLS):
            ta = m0 + (i / 36) * (m1 - m0 - .7)
            u = (t - ta) / .7
            if u < 0: continue
            e = 1 - (1 - min(1, u)) ** 3; back = 1 + .12 * math.sin(math.pi * min(1, u)) * (u < 1)
            a0 = math.atan2(y, x); far = 900
            sx, sy = math.cos(a0) * far, math.sin(a0) * far
            px, py = sx + (x - sx) * e, sy + (y - sy) * e
            ca, sa = math.cos(spin), math.sin(spin); qx, qy = px * ca - py * sa, px * sa + py * ca
            rad = RC * (.45 + .55 * e) * back * zoom
            d = max(4, int(2 * rad + 2))
            img = disc_paste(img, CX + qx * zoom, CY + qy * zoom, rad, img=mosaic_img(CELL_IMG[i], d), edge=COBALT, edge_w=1.6, shadow=.2)
    # the rocket, always on top, always in the middle
    rk = load("rocket", f)
    if rk is not None:
        img = over(img, rk[..., :3], rk[..., 3])
    img = np.clip(img * (1 + GRAIN[f % 3][..., None]), 0, 1)
    return (img * 255 + .5).astype(np.uint8)

if __name__ == "__main__":
    args = sys.argv[1:]
    frames = [int(x) for x in args[args.index("--frames") + 1].split(",")] if "--frames" in args else range(1, NF + 1)
    od = os.path.join(OUT, "comp"); os.makedirs(od, exist_ok=True)
    for f in frames:
        Image.fromarray(frame(f)).save(os.path.join(od, f"{f:04d}.png"))
    print(f"{len(frames)} frames -> {od}")
    if "--review" in args:
        song = os.path.normpath(os.path.join(HERE, TM["song"]))
        mp4 = os.path.join(OUT, "take-05_review_720p.mp4")
        subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-framerate", str(FPS), "-i", os.path.join(od, "%04d.png"),
                        "-ss", str(T0), "-t", str(T1 - T0), "-i", song, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow",
                        "-crf", "18", "-maxrate", "6M", "-bufsize", "12M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                        "-shortest", "-movflags", "+faststart", mp4], check=True)
        print("review", mp4)
