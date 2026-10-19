# Compositor for 10,000 Miles (numpy + Pillow). Paper, sound rings, circle portals with the characters' one outer
# outline (from the holdout alpha render.py makes), the mosaic Earths, the second rocket, the tear, the moon, the
# lift-off swarm, the rockets on top, grain. Timing comes from timeline.json; frames from out/<part>/####.png.
#   uv run --with numpy --with pillow python comp.py --lineup                      the cast line-up sheet
#   uv run --with numpy --with pillow python comp.py [--frames 1,200] [--workers 4] [--review --song <mp3>] [--encode-only]
import json, math, os, sys, subprocess
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "timeline.json")))
FPS, T0, T1 = TL["fps"], TL["t0"], TL["t1"]
W, H = TL["size"]
OUT = os.path.join(HERE, "out")
NF = int(round((T1 - T0) * FPS))
time_of = lambda f: T0 + (f - 1) / FPS
CX, CY = W / 2, H / 2

def hexrgb(h): h = h.lstrip("#"); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255
PAPER, COBALT, CORAL, LINE = hexrgb("#efe8db"), hexrgb("#2f5fb3"), hexrgb("#e8645a"), hexrgb("#3b2a22")
SKY, SHADOW, TEAR = hexrgb("#d6e6ea"), hexrgb("#3b3550"), hexrgb("#5b9bd5")

def smooth(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)
def s1(x): x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def keyed(keys, t):
    if t <= keys[0][0]: return keys[0][1]
    for (a, va), (b, vb) in zip(keys, keys[1:]):
        if t <= b: return va + (vb - va) * s1((t - a) / (b - a))
    return keys[-1][1]

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
DIST = np.hypot(xx - CX, yy - CY); ANG = np.arctan2(yy - CY, xx - CX)

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
            out = (c[2 * k:, :] - c[:-2 * k, :]) / (2 * k) if axis == 0 else (c[:, 2 * k:] - c[:, :-2 * k]) / (2 * k)
    return out

def outline_ring(alpha, r=3.2):
    """The characters' one outer outline: the alpha grown by about r px with a smooth edge, minus the alpha."""
    g = blur(alpha, r * .9)
    return np.clip(np.clip((g - .06) / .12, 0, 1) - alpha, 0, 1)

def outline(dst, alpha, r=3.2, rgb=LINE, strength=1.0):
    return over(dst, rgb[None, None, :], outline_ring(alpha, r) * strength)

def paper_img(w, h, seed=7):
    rng = np.random.default_rng(seed)
    def blotch(scale, amp):
        g = rng.random((h // scale + 2, w // scale + 2)).astype(np.float32)
        img = np.array(Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
        return (img - .5) * amp
    tone = blotch(140, .022) + blotch(40, .012)
    y2, x2 = np.mgrid[0:h, 0:w].astype(np.float32); d = np.hypot(x2 - w / 2, y2 - h / 2)
    vign = 1 - .10 * np.clip((d / math.hypot(w / 2, h / 2) - .45) / .55, 0, 1) ** 2
    return np.clip(PAPER[None, None, :] * (1 + tone[..., None]) * vign[..., None], 0, 1)

def load_rgba(path):
    if not os.path.exists(path): return None
    return np.asarray(Image.open(path).convert("RGBA"), np.float32) / 255

def load(part, f): return load_rgba(os.path.join(OUT, part, f"{f:04d}.png"))

def ring(dst, cx, cy, r, width, rgb, alpha, dash=0, phase=0.0):
    if r <= 0 or alpha <= 0: return dst
    centred = (cx == CX and cy == CY)
    d = DIST if centred else np.hypot(xx - cx, yy - cy)
    a = np.clip(1 - np.abs(d - r) / (width / 2 + .7), 0, 1) * alpha
    if dash:
        an = ANG if centred else np.arctan2(yy - cy, xx - cx)
        a = a * smooth((np.sin(an * dash + phase) + .2) * 3)
    return over(dst, rgb[None, None, :], a)

def disc_paste(dst, cx, cy, rad, img=None, rgb=None, alpha=1.0, edge=None, edge_w=2.0, shadow=0.0):
    """A filled circle at (cx, cy): an image (square, scaled to the disc) or a flat colour, optional outline and shadow."""
    if rad < .5 or alpha <= 0: return dst
    R = int(math.ceil(rad + 22)); x0, x1 = int(max(0, cx - R)), int(min(W, cx + R)); y0, y1 = int(max(0, cy - R)), int(min(H, cy + R + 10))
    if x1 <= x0 or y1 <= y0: return dst
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

def sprite_paste(dst, spr, cx, cy, angle=0.0, scale=1.0):
    """An RGBA sprite centred at (cx, cy), rotated by angle degrees (counter-clockwise, 0 = nose up)."""
    im = Image.fromarray((spr * 255).astype(np.uint8))
    if scale != 1: im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.LANCZOS)
    if angle: im = im.rotate(angle, resample=Image.BICUBIC, expand=True)
    a = np.asarray(im, np.float32) / 255; h, w = a.shape[:2]
    x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2)); x1, y1 = x0 + w, y0 + h
    sx0, sy0 = max(0, -x0), max(0, -y0); x0, y0 = max(0, x0), max(0, y0); x1, y1 = min(W, x1), min(H, y1)
    if x1 <= x0 or y1 <= y0: return dst
    sub = a[sy0:sy0 + (y1 - y0), sx0:sx0 + (x1 - x0)]
    dst[y0:y1, x0:x1] = over(dst[y0:y1, x0:x1], sub[..., :3], sub[..., 3]); return dst

def shift_layer(dst, layer, dx, dy):
    """Composite an RGBA full-frame layer moved by (dx, dy) px."""
    dx, dy = int(round(dx)), int(round(dy))
    x0, y0 = max(0, dx), max(0, dy); x1, y1 = min(W, W + dx), min(H, H + dy)
    if x1 <= x0 or y1 <= y0: return dst
    src = layer[y0 - dy:y1 - dy, x0 - dx:x1 - dx]
    dst[y0:y1, x0:x1] = over(dst[y0:y1, x0:x1], src[..., :3], src[..., 3]); return dst

# ---------- static things, built once ----------
paper = paper_img(W, H)
GRAIN = [(np.random.default_rng(7 + i).random((H, W)).astype(np.float32) - .5) * .045 for i in range(3)]
MOS = {}
def mosaic_img(name, d):
    key = (name, d)
    if key not in MOS:
        p = os.path.join(OUT, "mosaic", name + ".png")
        im = Image.open(p).convert("RGB").resize((d, d), Image.LANCZOS) if os.path.exists(p) else Image.new("RGB", (d, d), (200, 200, 210))
        MOS[key] = np.asarray(im, np.float32) / 255
    return MOS[key]
SPRITE = None
def sprite():
    """A small rocket for the lift-off swarm: the rocket layer's centre, cropped, scaled down when pasted."""
    global SPRITE
    if SPRITE is None:
        rk = load("rocket", 100)
        SPRITE = rk[int(CY) - 110:int(CY) + 110, int(CX) - 70:int(CX) + 70] if rk is not None else np.zeros((220, 140, 4), np.float32)
    return SPRITE

def cells_for(n_rings, rc):
    sp = 2.2 * rc; out = []
    for ring_i, n in zip(range(1, n_rings + 1), (6, 12, 18, 24)):
        for k in range(n):
            a = 2 * math.pi * k / n + (ring_i % 2) * math.pi / n
            out.append((ring_i * sp * math.cos(a), ring_i * sp * math.sin(a), ring_i))
    return out, sp

MOSAICS = []
for M in TL["mosaics"]:
    rc = M.get("cell", .06) * H; cells, sp = cells_for(M["rings"], rc)
    names = [f"{s}_{k}" for k in range(9) for s in M["images"]]
    rng = np.random.default_rng(11 + len(MOSAICS)); order = rng.permutation(len(names))[:len(cells)]
    M = dict(M, rc=rc, cells=cells, sp=sp, imgs=[names[i] for i in order], er=(M["rings"] * sp + rc + 16))
    if "liftoff" in M:
        rng2 = np.random.default_rng(5); launches = []
        for (t_, n) in M["liftoff"]:
            for j in range(int(n)):
                c = int(rng2.integers(len(cells)))
                launches.append(dict(t=t_ + float(rng2.random()) * .9, cell=c, speed=150 + float(rng2.random()) * 120, curl=float(rng2.random() - .5) * .6))
        M["launches"] = launches
    MOSAICS.append(M)

def anchor_offset(t):
    a, b, d = TL["rocket"]["in"]; o, p, e = TL["rocket"]["out"]
    dy = d * (1 - s1((t - a) / (b - a))) if t < b else 0.0
    if t >= o: dy += e * (s1((t - o) / (p - o)) ** 1.6)
    return 0.0, dy

def friend_pos(t):
    """Where the second rocket is (dx, dy from centre), or None when off-screen."""
    F = TL["friend"]; path = F["path"]
    if t < path[0][0] or t > path[-1][0] + .5: return None
    oa, ob, orad, period = F["orbit"]
    a0 = math.atan2(path[1][2], path[1][1])
    if oa <= t <= ob:
        a = a0 + 2 * math.pi * (t - oa) / period
        return orad * math.cos(a), orad * math.sin(a)
    if ob < t < path[3][0]:                                                  # ease from the orbit's end to the dock
        a = a0 + 2 * math.pi * (ob - oa) / period
        x0, y0 = orad * math.cos(a), orad * math.sin(a); u = s1((t - ob) / (path[3][0] - ob))
        return x0 + (path[3][1] - x0) * u, y0 + (path[3][2] - y0) * u
    for (ta, xa, ya), (tb, xb, yb) in zip(path, path[1:]):
        if ta <= t <= tb:
            u = s1((t - ta) / (tb - ta)) if tb > ta else 1
            return xa + (xb - xa) * u, ya + (yb - ya) * u
    return None

def frame(f):
    t = time_of(f); img = paper.copy()
    adx, ady = anchor_offset(t); acx, acy = CX + adx, CY + ady
    # sound rings out of the rocket: each pulse grows past the frame in 2.6 s and fades; every other one dashed
    for i, p in enumerate(TL["pulses"]):
        u = (t - p) / 2.6
        if 0 <= u <= 1:
            img = ring(img, acx, acy, 18 + u * 760, 3.4 - 1.6 * u, COBALT, (1 - u) ** 1.2, dash=(36 if i % 2 else 0), phase=p)
    # the second rocket's rings, coral: first from off-screen, then from wherever it is
    F = TL["friend"]
    for p in F["rings_from_offscreen"]:
        u = (t - p) / 3.0
        if 0 <= u <= 1: img = ring(img, CX + F["offscreen"][0], CY + F["offscreen"][1], 18 + u * 1100, 3.2 - 1.4 * u, CORAL, (1 - u) ** 1.2)
    fp = friend_pos(t)
    for i, p in enumerate(F["rings"]):
        u = (t - p) / 2.6; fq = friend_pos(p)
        if 0 <= u <= 1 and fq: img = ring(img, CX + fq[0], CY + fq[1], 18 + u * 760, 3.2 - 1.5 * u, CORAL, (1 - u) ** 1.2, dash=(36 if i % 2 else 0), phase=p)
    # portals: the scene inside a circle, a soft shadow, the characters' outline, a cobalt edge; a ring runs ahead as it opens
    for P in TL["portals"]:
        rr = keyed(P["r"], t) * H; lead = keyed(P["r"], t + .12) * H
        if lead > rr + 1: img = ring(img, CX, CY, lead, 2.2, COBALT, .9)
        if rr < .5: continue
        sc = load(P["id"], f)
        if sc is None: continue
        inside = np.clip(rr - DIST + .5, 0, 1)
        img = over(img, SHADOW[None, None, :], (1 - smooth((np.hypot(xx - CX, yy - CY - 6) - rr) / 18)) * .16 * (DIST > rr - 2))
        img = over(img, sc[..., :3], inside)
        ch = load(P["id"] + "_chars", f)
        if ch is not None: img = over(img, LINE[None, None, :], outline_ring(ch[..., 3]) * inside)
        img = ring(img, CX, CY, rr, 3.0, COBALT, 1.0)
    # the mosaics: every place comes back as a circle and they pack into the Earth around the rocket
    for M in MOSAICS:
        m0, m1 = M["fly"]
        if t < m0 or t > M["out"][1] + .1: continue
        spin = math.radians(7) * max(0, t - m1)
        zoom = keyed(M["zoom"], t) * (1 - s1((t - M["out"][0]) / (M["out"][1] - M["out"][0])))
        if zoom <= .001: continue
        bounce = 1.0
        if "tear" in M:
            ta, tb = M["tear"]
            if tb <= t <= tb + .5: bounce = 1 + .05 * math.sin(math.pi * (t - tb) / .5)
        earth = s1((t - (M["earth"] - .45)) / .9)
        er = M["er"] * zoom * bounce * (.6 + .4 * earth)
        if earth > 0:
            img = disc_paste(img, CX, CY, er + 26 * zoom, rgb=hexrgb("#e6eef2"), alpha=.55 * earth)        # a little atmosphere
            img = disc_paste(img, CX, CY, er, rgb=SKY, alpha=earth, edge=COBALT, edge_w=2.4, shadow=.18)
        n = len(M["cells"])
        for i, (x, y, ring_i) in enumerate(M["cells"]):
            ta = m0 + (i / n) * (m1 - m0 - .7); u = (t - ta) / .7
            if u < 0: continue
            e = 1 - (1 - min(1, u)) ** 3; back = 1 + .12 * math.sin(math.pi * min(1, u)) * (u < 1)
            a0 = math.atan2(y, x); far = 900
            px, py = far * math.cos(a0) + (x - far * math.cos(a0)) * e, far * math.sin(a0) + (y - far * math.sin(a0)) * e
            ca, sa = math.cos(spin), math.sin(spin); qx, qy = px * ca - py * sa, px * sa + py * ca
            rad = M["rc"] * (.45 + .55 * e) * back * zoom * bounce
            if rad < 2: continue
            img = disc_paste(img, CX + qx * zoom, CY + qy * zoom, rad, img=mosaic_img(M["imgs"][i], max(4, int(2 * rad + 2))), edge=COBALT, edge_w=1.6, shadow=.2)
        if "tear" in M:                                                   # a tear falls from the rocket and lands on the Earth's rim
            ta, tb = M["tear"]; u = (t - ta) / (tb - ta)
            if 0 <= u <= 1:                                              # from under the flame to the Earth's rim, speeding up
                yv = CY + 68 + (er - 76) * (u * u); r0 = 9 + 3 * u
                img = disc_paste(img, CX, yv - r0 * 1.0, r0 * .55, rgb=TEAR, edge=COBALT, edge_w=1.4)
                img = disc_paste(img, CX, yv, r0, rgb=TEAR, edge=COBALT, edge_w=1.4)
                img = disc_paste(img, CX - r0 * .3, yv - r0 * .25, r0 * .22, rgb=hexrgb("#dcebf5"))
            if tb <= t <= tb + 1.6:
                v = (t - tb) / 1.6; img = ring(img, CX, CY + er, 4 + v * 160, 2.4, COBALT, (1 - v) ** 1.3)
        if "moon" in M:                                                   # the first verse's places as a moon around this Earth
            Mo = M["moon"]; ia, ib = Mo["in"]; mscale = s1((t - ia) / (ib - ia))
            if mscale > 0:
                a = -math.pi / 2 + 2 * math.pi * (t - ia) / Mo["period"]; mr = 58 * zoom * mscale
                mx, my = CX + Mo["orbit"] * zoom * math.cos(a), CY + Mo["orbit"] * zoom * math.sin(a)
                img = disc_paste(img, mx, my, mr, rgb=hexrgb("#e9eef0"), edge=COBALT, edge_w=1.8, shadow=.18)
                for j, nm in enumerate(Mo["images"]):
                    b = 2 * math.pi * j / len(Mo["images"]) + a * .5; cr = mr * .26
                    img = disc_paste(img, mx + mr * .55 * math.cos(b), my + mr * .55 * math.sin(b), cr, img=mosaic_img(nm + "_3", max(4, int(2 * cr + 2))), edge=COBALT, edge_w=1.0)
        if "launches" in M:                                               # little rockets lift off from the Earth until the sky is full
            spr = sprite()
            for L in M["launches"]:
                dt = t - L["t"]
                if dt < 0: continue
                x, y, _ = M["cells"][L["cell"]]; ca, sa = math.cos(spin), math.sin(spin); qx, qy = (x * ca - y * sa) * zoom, (x * sa + y * ca) * zoom
                a0 = math.atan2(qy, qx) + L["curl"] * min(1, dt / 4); dist = L["speed"] * dt + 30 * (1 - math.exp(-dt))
                px, py = CX + qx + dist * math.cos(a0), CY + qy + dist * math.sin(a0)
                if -80 < px < W + 80 and -80 < py < H + 80:
                    for k in range(3):                                   # a short smoke trail
                        tr = 10 + k * 9; img = disc_paste(img, px - tr * math.cos(a0), py - tr * math.sin(a0), 3.5 - k * .8, rgb=hexrgb("#d8d2c8"), alpha=.6 - k * .15)
                    img = sprite_paste(img, spr, px, py, angle=-(math.degrees(a0) + 90), scale=.3 * min(1, .4 + dt))
    # the rockets, always on top
    if fp:
        fr = load("friend", f)
        if fr is not None: img = shift_layer(img, fr, fp[0], fp[1])
    rk = load("rocket", f)
    if rk is not None: img = shift_layer(img, rk, adx, ady)
    img = np.clip(img * (1 + GRAIN[f % 3][..., None]), 0, 1)
    return (img * 255 + .5).astype(np.uint8)

if __name__ == "__main__":
    args = sys.argv[1:]
    if "--lineup" in args:
        rows = []
        for v in ("playmobil",):
            im = load_rgba(os.path.join(OUT, "lineup", v + ".png"))
            if im is None: continue
            h, w = im.shape[:2]; bg = paper_img(w, h, 3); bg = outline(bg, im[..., 3], 3.4); bg = over(bg, im[..., :3], im[..., 3])
            rows.append((bg * 255 + .5).astype(np.uint8))
        sheet = np.concatenate(rows, 0); Image.fromarray(sheet).save(os.path.join(OUT, "lineup", "cast-lineup.png")); print("lineup", sheet.shape); sys.exit()
    frames = [int(x) for x in args[args.index("--frames") + 1].split(",")] if "--frames" in args else list(range(1, NF + 1))
    if "--encode-only" in args: frames = []
    workers = int(args[args.index("--workers") + 1]) if "--workers" in args else 1
    od = os.path.join(OUT, "comp"); os.makedirs(od, exist_ok=True)
    if workers > 1 and len(frames) > workers:
        procs = [subprocess.Popen([sys.executable, __file__, "--frames", ",".join(map(str, frames[w::workers]))]) for w in range(workers)]
        for p in procs: p.wait()
        print(f"{len(frames)} frames in {workers} workers -> {od}")
    else:
        for f in frames: Image.fromarray(frame(f)).save(os.path.join(od, f"{f:04d}.png"))
        if frames: print(f"{len(frames)} frames -> {od}")
    if "--review" in args:
        song = args[args.index("--song") + 1]
        mp4 = os.path.join(OUT, "10000-miles_draft1_720p.mp4")
        subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-framerate", str(FPS), "-i", os.path.join(od, "%04d.png"),
                        "-ss", str(T0), "-t", str(T1 - T0), "-i", song, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow",
                        "-crf", "18", "-maxrate", "6M", "-bufsize", "12M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                        "-shortest", "-movflags", "+faststart", mp4], check=True)
        print("review", mp4)
