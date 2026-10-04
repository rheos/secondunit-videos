"""Assemble the full 2342-frame 9:16 cut of "dream of fire" on the untouched song.

  python tools/assemble.py                 # master, 1080x1920 24 fps + song
  python tools/assemble.py --preview       # 540x960 preview
  python tools/assemble.py --range 1500 1700 --preview
  python tools/assemble.py --edl           # write docs/EDL.md
  python tools/assemble.py --sheet         # contact sheet, one frame per shot

Real clips are cut, trimmed and speed-changed only. Generated takes get the local worn-film
finish named per shot. Transitions are built here, locally, from masks.
Song frames are 24 fps, half-open [a, b). Real clips are 30 fps; src seconds = inp + (k - a)/24 * speed.
Generated takes are 24 fps; take frame = off + (k - a).
"""
import argparse
import json
import os
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
FOOT = "/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/artists/mythmaker/footage/"
SONG = "/Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/_hjeron-dream-of-fire/dream-of-fire.wav"
AUG = "/Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/hjeron-dark-blues-augment/"
G = os.path.join(PROJ, "work", "gen") + "/"
DT = os.path.join(PROJ, "work", "daytake") + "/"
FPS, TOTAL = 24, 2342
CLIPS = [c["path"] for c in json.load(open(FOOT + "manifest.json"))["clips"]]

W, H = 1080, 1920


def R(a, b, clip, inp, sp, why, dog=False, fo=0, fi=0, over=None):
    """over = (clip, inp, speed, weight): a second real clip screened in, a double exposure."""
    return dict(kind="REAL", a=a, b=b, clip=clip, inp=inp, sp=sp, why=why, dog=dog, fo=fo, fi=fi, over=over)


def X(a, b, kind, path, off, why, fx=None, sp=1.0, dog=False, job=""):
    return dict(kind=kind, a=a, b=b, path=path, off=off, why=why, fx=fx or {}, sp=sp, dog=dog, job=job)


SHOTS = [
    R(0, 84, 44, 0.30, 0.60, "smoke drifting on black, his shadow walking the rock (#40) double-exposed through it, fade in", fi=24,
      over=(40, 0.5, 0.9, 0.32)),
    X(84, 144, "ANIMATION", G + "A1_raw.mp4", 13, "A1 moon serpent: he and the wolfdog walk toward the moon, its serpent eyes open",
      fx=dict(grain=37), dog=True, job="d875e005 + A1-anim"),
    R(144, 240, 0, 1.20, 0.55, "ram skull under the storm (match cut from the moon onto the horn curl)"),
    R(240, 319, 39, 0.30, 0.80, "his shadow on the rock"),
    R(319, 395, 3, 0.00, 0.70, "torn-mask reveal: him and the wolfdog walking into smoke", dog=True),
    R(395, 433, 14, 0.25, 1.00, "his own montage"),
    R(433, 460, 13, 0.00, 0.80, "fretboard over dry ground"),
    R(460, 524, 47, 2.33, 1.00, "him and the Les Paul on the spire (ends on the bridge's start frame)"),
    X(524, 620, "BRIDGE", AUG + "t_bridge.mp4", 0, "the pull-back: lifts off the spire, flies the desert, lands on the dune", sp=1.26,
      job="dd8467ff (reused)"),
    X(620, 676, "LIPSYNC", G + "LSV1_sepia.mp4", 0, "LSV1 hard cut on the first sung word: he sings line 1 (day take 20.0 s, 3/4, veil down)",
      job="LSV1"),
    R(676, 703, 36, 2.33, 1.00, "back on the dune walk the bridge landed on, the wolfdog behind", dog=True),
    X(703, 745, "LIPSYNC", G + "LSV1_sepia.mp4", 83, "LSV1 again on the start of line 2", job="LSV1"),
    R(745, 786, 45, 0.50, 0.80, "storm clouds on black with the wolfdog (#11) walking up through them, double exposure", dog=True,
      over=(11, 0.8, 0.58, 0.62)),
    R(786, 871, 28, 0.50, 1.00, "him, the Les Paul and the wolfdog on the stone bridge", dog=True),
    R(871, 911, 1, 0.00, 0.80, "storm sky over the skull"),
    R(911, 939, 6, 0.80, 0.80, "ghosted double-exposure guitar"),
    X(939, 983, "ANIMATION", G + "A2_raw.mp4", 10, "A2 the fire ring lights in front of his ram skull", fx=dict(grain=0), job="f97a30f8"),
    X(983, 1015, "ANIMATION", G + "A7_raw.mp4", 0, "A7 forced perspective: his guitar planted in the sand, him and the wolfdog behind",
      fx=dict(grain=36), dog=True, job="a9adc565 + A7-anim"),
    R(1015, 1054, 3, 2.22, 0.85, "him and the wolfdog deep in the smoke", dog=True),
    X(1054, 1093, "CONTINUE", G + "C1_raw.mp4", 0, "C1 the smoke closes over them", fx=dict(grain=3), dog=True, job="6960959b"),
    R(1093, 1138, 15, 1.10, 0.80, "real rattlesnake in the grass"),
    R(1138, 1176, 17, 0.30, 1.00, "neon fire over the rocks"),
    R(1176, 1219, 18, 1.00, 1.00, "him with the guitar in the flames"),
    R(1219, 1244, 21, 1.00, 1.00, "flaming rocks"),
    X(1244, 1290, "LIPSYNC", G + "LSV2_sepia.mp4", 0, "LSV2 on the start of the first rattle's-warning line (day take 40.0 s, 3/4)",
      job="LSV2"),
    R(1290, 1316, 15, 1.90, 0.45, "the rattlesnake coils"),
    X(1316, 1358, "LIPSYNC", G + "LSV2_sepia.mp4", 72, "LSV2 on the start of the second rattle's-warning line", job="LSV2"),
    R(1358, 1399, 29, 1.12, 1.00, "him and the wolfdog on the bridge", dog=True),
    R(1399, 1450, 15, 1.10, 0.50, "HERO rattlesnake, slow"),
    R(1450, 1506, 16, 0.00, 0.38, "the wolfdog, sun on the horizon", dog=True),
    X(1506, 1548, "DAYTAKE", G + "day29_sepia.mp4", 0, "his real day take (26.0 s on), veil down, playing and swaying, slow push-in, "
      "graded sepia; ONE ember eye composited behind the veil, flaring on the sung word", fx=dict(gamma=1.45)),
    R(1548, 1561, 9, 0.30, 1.00, "overexposed flash"),
    X(1561, 1627, "LIPSYNC", DT + "LS1c_neon_v.mp4", 0, "LS1c the hook, his day take re-lit into his neon", job="1d50a97d"),
    R(1627, 1640, 25, 0.50, 1.00, "hat silhouette in the flames (breath)"),
    X(1640, 1690, "LIPSYNC", DT + "LS1c_neon_v.mp4", 79, "LS1c the hook, second line", job="1d50a97d"),
    R(1690, 1701, 10, 0.10, 0.25, "red burning-sky silhouette"),
    X(1701, 1778, "ANIMATION", G + "A4_raw.mp4", 0, "A4 the smoke serpent rises and rings him, then dissolves", fx=dict(ghost=1, grain=23),
      job="58f7b6e3"),
    X(1778, 1825, "ANIMATION", G + "A5_raw.mp4", 0, "A5 firelight reveals him painted on the canyon wall", fx=dict(grain=40), job="0556ece1 + A5-anim"),
    R(1825, 1899, 26, 1.00, 1.00, "guitarist silhouette in fire"),
    X(1899, 1945, "LIPSYNC", G + "LS2_neon.mp4", 0, "LS2 wake-up line 1, one Odin glint on the held word", job="7ea06541"),
    R(1945, 1976, 27, 1.50, 1.00, "him walking out onto the bridge"),
    X(1976, 2022, "LIPSYNC", G + "LS2_neon.mp4", 77, "LS2 wake-up line 2", job="7ea06541"),
    R(2022, 2052, 21, 2.50, 1.00, "flaming rocks"),
    R(2052, 2093, 30, 0.00, 0.80, "him on the bridge with the wolfdog", dog=True),
    R(2093, 2124, 22, 1.00, 1.00, "silhouette in the flames"),
    X(2124, 2164, "LIPSYNC", G + "LS3_neon.mp4", 72, "LS3 last wake-up line, the Odin eye glints once at the end", job="47e57c4c"),
    R(2164, 2180, 37, 0.00, 1.00, "him tiny on the dune, star field"),
    X(2180, 2215, "SCRATCHBOARD", AUG + "scratch.mp4", 16, "SB1 the same walk as a scratchboard etching", job="87b55c41 (reused)"),
    X(2215, 2241, "SCRATCHBOARD", G + "SB2_raw.mp4", 0, "SB2 the wolfdog at night, etched", fx=dict(etch=1), dog=True, job="SB2b"),
    X(2241, 2291, "ANIMATION", G + "A6_raw.mp4", 0, "A6 the cracks glow and widen; him and the wolfdog on the horizon", fx=dict(grain=17),
      dog=True, job="d8ca3c94 + A6-anim"),
    R(2291, 2342, 17, 0.00, 0.75, "HERO his fire rising over the rocks, fade out", fo=30),
]

# Transitions: (kind, start, end, extra). Frames in [start, end) mix the shot that ends inside the window (A)
# with the one that starts there (B). Accents act on one shot only.
TRANS = [
    ("leak", 319, 323, {}), ("shadow", 389, 401, {}), ("smoke", 697, 711, {"matte": 44}),
    ("splice", 939, 941, {}), ("burn", 1128, 1146, {}), ("weave", 1219, 1222, {}),
    ("eyeflash", 1540, 1548, {}), ("dexp", 1680, 1701, {}), ("smoke", 1770, 1786, {"matte": 46}),
    ("embers", 1889, 1907, {}), ("torn", 2044, 2058, {}), ("etch", 2168, 2184, {}), ("crack", 2280, 2296, {}),
]
# Odin glint: one ember eye behind the veil, tracked to the head. (take, take frame at peak, x, y in take px)
GLINTS = {"LS2": (22, 420, 300, 3.5, 1.0, 0), "LS3": (104, 590, 250, 3.5, 1.0, 0), "D29": (23, 359, 392, 3.0, 1.8, 1)}


# ---------------------------------------------------------------- sources
class Video:
    cache = {}

    def __init__(self, path):
        self.path = path
        self.cap = cv2.VideoCapture(path)
        self.n = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.pos = -1
        self.buf = {}

    def frame(self, i):
        i = int(min(max(i, 0), self.n - 1))
        if i in self.buf:
            return self.buf[i]
        if i != self.pos + 1:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            self.pos = i - 1
        ok, im = self.cap.read()
        while not ok and i > 0:  # some encodes report one frame too many
            i -= 1
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ok, im = self.cap.read()
        self.pos = i
        im = cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA if im.shape[1] >= W else cv2.INTER_CUBIC)
        if len(self.buf) > 48:
            self.buf.pop(next(iter(self.buf)))
        self.buf[i] = im
        return im


def vid(path):
    if path not in Video.cache:
        Video.cache[path] = Video(path)
    return Video.cache[path]


GRAIN = {}


def grain_of(clip):
    if clip not in GRAIN:
        v = Video(FOOT + CLIPS[clip])
        bank = []
        for i in range(0, min(v.n, 48), 2):
            g = cv2.cvtColor(v.frame(i), cv2.COLOR_BGR2GRAY).astype(np.float32)
            bank.append(np.clip(g - cv2.GaussianBlur(g, (0, 0), 1.2), -9, 9)[..., None])
        GRAIN[clip] = bank
    return GRAIN[clip]


def etch(img, k):
    """Local scratchboard: white hatch and edge lines scratched out of black."""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    g = cv2.GaussianBlur(g, (0, 0), 1.0)
    ex = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
    ey = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    edge = np.clip(np.sqrt(ex * ex + ey * ey) * 4.5 - 0.15, 0, 1)
    yy, xx = np.mgrid[0:H, 0:W]
    lv = np.clip((g - 0.5) / 0.45, 0, 1) ** 1.6
    hatch = (((xx + yy) % 7) < 7 * lv).astype(np.float32)
    rng = np.random.default_rng(k // 2)
    stip = (rng.random((H, W)) < 0.012 * (1 - lv) * (yy < H * 0.45)).astype(np.float32)
    out = np.clip(np.maximum(edge, hatch * 0.85) + stip, 0, 1) * 235
    return np.repeat(out[..., None], 3, -1)


def ghost(img, plate, t):
    """The model drew the serpent as solid white. Use its shape only as a path: remove it from the scene
    (his real #23 behind), then redraw it as translucent smoke textured by his own smoke clip #44,
    with wisping, noise-displaced edges, screen-blended so the flames and his figure read through."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    diff = np.abs(img.astype(np.float32) - plate).mean(-1)
    hard = ((hsv[..., 1] < 70) & (hsv[..., 2] > 165) & (diff > 45)).astype(np.float32)
    hard = cv2.morphologyEx(hard, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    base = img.astype(np.float32) * (1 - cv2.GaussianBlur(hard, (0, 0), 3)[..., None]) + \
        plate * cv2.GaussianBlur(hard, (0, 0), 3)[..., None]
    # wisping: displace the mask along a slow noise flow, then blur
    rng = np.random.default_rng(11)
    fx = cv2.resize(rng.random((H // 64, W // 64)).astype(np.float32) - 0.5, (W, H), interpolation=cv2.INTER_CUBIC)
    fy = cv2.resize(rng.random((H // 64, W // 64)).astype(np.float32) - 0.5, (W, H), interpolation=cv2.INTER_CUBIC)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    amp = 70 + 40 * np.sin(t * 1.7)
    wisp = cv2.remap(hard, (xx + fx * amp).astype(np.float32), (yy + fy * amp - 25).astype(np.float32), cv2.INTER_LINEAR)
    m = np.clip(0.8 * cv2.GaussianBlur(hard, (0, 0), 5) + 0.7 * cv2.GaussianBlur(wisp, (0, 0), 22), 0, 1)
    v44 = vid(FOOT + CLIPS[44])
    sm = cv2.cvtColor(v44.frame(round((0.3 + t * 0.6) * v44.fps)).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    sm = cv2.resize(sm, (W, H))
    tex = 0.4 + 0.6 * np.clip(sm * 2.2, 0, 1)
    # faint scales: a soft diagonal lattice inside the core only
    scales = 0.94 + 0.06 * np.sin(xx * 0.21 + yy * 0.12) * np.sin(xx * 0.12 - yy * 0.21)
    layer = (m * tex * scales * 225)[..., None] * np.array([1.0, 0.97, 1.0], np.float32)
    return 255 - (255 - base) * (255 - layer) / 255


def shot_frame(s, k):
    """Frame of shot s at song frame k (k may lie a little outside [a, b) for transitions)."""
    if s["kind"] == "REAL":
        v = vid(FOOT + CLIPS[s["clip"]])
        t = s["inp"] + (k - s["a"]) / FPS * s["sp"]
        img = v.frame(round(t * v.fps)).astype(np.float32)
        if s.get("over"):
            oc, oi, osp, ow = s["over"]
            ov = vid(FOOT + CLIPS[oc])
            o = ov.frame(round((oi + (k - s["a"]) / FPS * osp) * ov.fps)).astype(np.float32) * ow
            img = 255 - (255 - img) * (255 - o) / 255  # screen: a double exposure
    else:
        v = vid(s["path"])
        img = v.frame(s["off"] + (k - s["a"]) * s["sp"]).astype(np.float32)
        fx = s["fx"]
        if fx.get("ghost"):
            v23 = vid(FOOT + CLIPS[23])
            plate = v23.frame(round((1.0 + (k - s["a"]) / FPS) * v23.fps)).astype(np.float32)
            img = ghost(img.astype(np.uint8), plate, (k - s["a"]) / FPS)
        if fx.get("etch"):
            img = etch(img.astype(np.uint8), k)
        if "gamma" in fx:
            img = 255 * (img / 255) ** fx["gamma"]
        if "grain" in fx:
            gb = grain_of(fx["grain"])
            img = img + gb[k % len(gb)]
    f = 1.0
    if s.get("fi") and k - s["a"] < s["fi"]:
        f = (k - s["a"] + 1) / s["fi"]
    if s.get("fo") and s["b"] - k <= s["fo"]:
        f = min(f, (s["b"] - k - 1) / s["fo"])
    return np.clip(img * max(f, 0), 0, 255)


# ---------------------------------------------------------------- transitions
def noise(seed, scale):
    rng = np.random.default_rng(seed)
    n = rng.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    return cv2.resize(n, (W, H), interpolation=cv2.INTER_CUBIC)


N1 = None


def smooth(u):
    return u * u * (3 - 2 * u)


def transition(kind, u, A, B, k, extra):
    """u in [0, 1): progress. A, B float frames. Returns float frame."""
    global N1
    if N1 is None:
        N1 = 0.65 * noise(1, 60) + 0.35 * noise(2, 14)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    if kind == "leak":
        g = np.exp(-(((xx - W * 0.8) / (W * 0.5)) ** 2 + ((yy - H * 0.3) / (H * 0.4)) ** 2))
        amt = np.sin(np.pi * u) * 170
        leak = np.stack([g * amt * 0.35, g * amt * 0.7, g * amt], -1)
        return 255 - (255 - B) * (255 - leak) / 255
    if kind == "weave":
        dx, dy = [(5, -3), (-4, 4), (3, 2)][int(u * 3) % 3]
        M = np.float32([[1, 0, dx], [0, 1, dy]])
        img = cv2.warpAffine(B, M, (W, H), borderMode=cv2.BORDER_REFLECT)
        return img * (0.92 + 0.08 * np.sin(u * 20))
    if kind == "splice":
        M = np.float32([[1, 0, 0], [0, 1, 46]])
        img = cv2.warpAffine(B, M, (W, H), borderMode=cv2.BORDER_CONSTANT)
        img[40:48] = 245
        return img
    if kind == "shadow":
        sh = cv2.cvtColor(vid(FOOT + CLIPS[40]).frame(30).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
        sh = cv2.GaussianBlur((sh < 90).astype(np.float32), (0, 0), 6)
        x0 = int((-0.6 + 1.6 * u) * W)
        M = np.float32([[1, 0, x0], [0, 1, 0]])
        sm = cv2.warpAffine(sh, M, (W, H))
        edge = np.clip((xx - (x0 + W * 0.5)) / 60, 0, 1)
        m = np.clip(np.maximum(1 - edge, 0) + 0, 0, 1)
        m = np.where(xx < x0 + W * 0.5, 1.0, 0.0)
        m = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 20)
        out = B * m[..., None] + A * (1 - m[..., None])
        return out * (1 - 0.8 * sm[..., None])
    if kind == "smoke":
        v = vid(FOOT + CLIPS[extra["matte"]])
        sm = cv2.cvtColor(v.frame(round(u * (v.n - 1))).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
        sm = cv2.GaussianBlur(sm, (0, 0), 8)
        m = np.clip((sm + u * 1.3 - 0.65) / 0.3, 0, 1)
        m = np.maximum(m, smooth(np.clip(u * 1.6 - 0.6, 0, 1)))[..., None]
        out = B * m + A * (1 - m)
        return 255 - (255 - out) * (255 - sm[..., None] * 200 * np.sin(np.pi * u)) / 255
    if kind == "burn":
        d = np.sqrt(((xx - W * 0.45) / W) ** 2 + ((yy - H * 0.45) / H) ** 2) + 0.25 * N1
        r = u * 1.15
        m = np.clip((r - d) / 0.02, 0, 1)
        rim = np.clip(1 - np.abs(r - d) / 0.035, 0, 1)
        char = np.clip(1 - np.abs(r + 0.04 - d) / 0.06, 0, 1)
        out = B * m[..., None] + A * (1 - m[..., None]) * (1 - 0.8 * char[..., None])
        return np.clip(out + rim[..., None] * np.array([40, 150, 255], np.float32), 0, 255)
    if kind == "torn":
        tear = W * 0.5 + 60 * (N1[:, W // 2] - 0.5)[:, None] * 3 + 18 * (noise(7, 5)[:, :1] - 0.5)
        sep = smooth(np.clip(u * 1.2, 0, 1)) * W * 0.62
        aged = cv2.cvtColor(cv2.cvtColor(A.astype(np.uint8), cv2.COLOR_BGR2GRAY), cv2.COLOR_GRAY2BGR).astype(np.float32)
        aged = aged * np.array([0.72, 0.86, 1.0], np.float32) * 0.95 + 12
        left = cv2.warpAffine(aged, np.float32([[1, 0, -sep], [0, 1, sep * 0.05]]), (W, H), borderValue=(0, 0, 0))
        right = cv2.warpAffine(aged, np.float32([[1, 0, sep], [0, 1, -sep * 0.05]]), (W, H), borderValue=(0, 0, 0))
        ml = (xx < tear - sep).astype(np.float32)
        mr = (xx > tear + sep).astype(np.float32)
        edge = (np.abs(xx - (tear - sep)) < 5) | (np.abs(xx - (tear + sep)) < 5)
        out = B * (1 - ml - mr)[..., None] + left * ml[..., None] + right * mr[..., None]
        out[edge] = [205, 225, 240]
        if u < 0.15:
            out = aged * (u / 0.15) + A * (1 - u / 0.15)
        return out
    if kind == "eyeflash":
        g = np.exp(-(((xx - W * 0.468) / (W * (0.05 + u)))) ** 2 - ((yy - H * 0.292) / (H * (0.03 + u * 0.8))) ** 2)
        w = g[..., None] * np.array([200, 235, 255], np.float32) * smooth(u) * 1.6
        return np.clip(A + w + smooth(u) ** 3 * 255, 0, 255)
    if kind == "dexp":
        fire = shot_frame(dict(kind="REAL", a=0, b=1, clip=17, inp=1.0, sp=1.0), int(u * 30))
        m = smooth(u)
        base = np.maximum(A * (1 - m), B * m)
        return np.maximum(base, fire * 0.45 * np.sin(np.pi * u))
    if kind == "embers":
        m = np.clip((u * 1.3 - N1) / 0.12, 0, 1)
        rng = np.random.default_rng(k)
        pts = np.zeros((H, W), np.float32)
        n = int(1400 * np.sin(np.pi * u))
        ys = (rng.random(n) * H - u * 300).astype(int) % H
        xs = (rng.random(n) * W).astype(int)
        pts[ys, xs] = 1
        pts = cv2.GaussianBlur(pts, (0, 0), 2.2) * 9
        out = B * m[..., None] + A * (1 - m[..., None])
        return np.clip(out + pts[..., None] * np.array([40, 140, 255], np.float32), 0, 255)
    if kind == "etch":
        lines = ((((xx + yy) % 9) / 9 + 0.35 * N1) < u * 1.5).astype(np.float32)
        m = cv2.GaussianBlur(lines, (0, 0), 0.8)[..., None]
        m = np.maximum(m, smooth(np.clip(u * 2 - 1, 0, 1)))
        return B * m + A * (1 - m)
    if kind == "crack":
        cx = W * 0.5 + 140 * (N1[:, W // 3] - 0.5)[:, None] + 30 * (noise(9, 8)[:, :1] - 0.5)
        wdt = smooth(u) * W * 0.8
        d = np.abs(xx - cx)
        m = np.clip((wdt / 2 - d) / 6, 0, 1)
        rim = np.clip(1 - np.abs(d - wdt / 2) / 14, 0, 1) * (u < 0.95)
        out = B * m[..., None] + A * (1 - m[..., None])
        return np.clip(out + rim[..., None] * np.array([40, 130, 255], np.float32), 0, 255)
    return B


# ---------------------------------------------------------------- glints
TRACK = {}


def glint(name, take_path, tk, img, k_take):
    peak, x, y, width, size, hold = GLINTS[name]
    amt = np.exp(-((k_take - peak) / width) ** 2)
    if hold and k_take > peak:  # the flare stays lit into the white-out
        amt = 1.0 + 0.04 * (k_take - peak)
    if amt < 0.02:
        return img
    v = vid(take_path)
    if name not in TRACK:  # track the head from the peak frame with template matching
        pts = {}
        ref = cv2.cvtColor(v.frame(peak).astype(np.uint8), cv2.COLOR_BGR2GRAY)
        sx, sy = W / 768, H / 1344
        px, py = int(x * sx), int(y * sy)
        tpl = ref[py - 90:py + 90, px - 90:px + 90]
        for j in range(peak - 24, peak + 26):
            g = cv2.cvtColor(v.frame(j).astype(np.uint8), cv2.COLOR_BGR2GRAY)
            y0, x0 = max(py - 170, 0), max(px - 170, 0)
            win = g[y0:py + 170, x0:px + 170]
            r = cv2.matchTemplate(win, tpl, cv2.TM_CCOEFF_NORMED)
            _, _, _, mx = cv2.minMaxLoc(r)
            pts[j] = (x0 + mx[0] + 90, y0 + mx[1] + 90)
        TRACK[name] = pts
    px, py = TRACK[name].get(k_take, TRACK[name][peak])
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    core = np.exp(-(((xx - px) ** 2 + (yy - py) ** 2) / (2 * (9.0 * size) ** 2)))
    halo = np.exp(-(((xx - px) ** 2 + (yy - py) ** 2) / (2 * (42.0 * size) ** 2)))
    col = np.array([60, 150, 255], np.float32)
    return np.clip(img + (core[..., None] * 255 + halo[..., None] * col * 0.7) * amt, 0, 255)


GLINT_OF = {"LS2_neon.mp4": "LS2", "LS3_neon.mp4": "LS3", "day29_sepia.mp4": "D29"}


def frame_at(k):
    i = next(j for j, s in enumerate(SHOTS) if s["a"] <= k < s["b"])
    s = SHOTS[i]
    for kind, a, b, extra in TRANS:
        if a <= k < b:
            u = (k - a) / (b - a)
            j = next(jj for jj, ss in enumerate(SHOTS) if ss["a"] <= a < ss["b"])
            nxt = next((jj for jj, ss in enumerate(SHOTS) if a < ss["a"] <= b), None)
            if kind in ("leak", "weave", "splice"):
                return transition(kind, u, None, shot_frame(s, k), k, extra)
            if kind == "eyeflash":
                return transition(kind, u, with_glint(SHOTS[j], k), None, k, extra) if s is SHOTS[j] else shot_frame(s, k)
            A = shot_frame(SHOTS[j], k)
            B = shot_frame(SHOTS[nxt], k) if nxt is not None else A
            return transition(kind, u, A, B, k, extra)
    return with_glint(s, k)


def with_glint(s, k):
    img = shot_frame(s, k)
    name = GLINT_OF.get(os.path.basename(s.get("path", "")))
    if name:
        img = glint(name, s["path"], None, img, s["off"] + (k - s["a"]))
    return img


def render(preview, lo, hi):
    ow, oh = (540, 960) if preview else (W, H)
    lo, hi = lo or 0, hi or TOTAL
    name = "preview" if preview else "master"
    out = os.path.join(PROJ, "output", f"dream-of-fire_storyboard-cut_f{lo:04d}-f{hi:04d}_24fps_9x16_{name}.mp4")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    cmd = ["nice", "-n", "15", "ffmpeg", "-loglevel", "error", "-y",
           "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{ow}x{oh}", "-r", str(FPS), "-i", "-",
           "-ss", f"{lo / FPS:.4f}", "-t", f"{(hi - lo) / FPS:.4f}", "-i", SONG, "-map", "0:v", "-map", "1:a",
           "-c:v", "libx264", "-preset", "veryfast" if preview else "medium", "-crf", "23" if preview else "17",
           "-pix_fmt", "yuv420p", "-r", str(FPS), "-threads", "4", "-c:a", "aac", "-b:a", "320k",
           "-movflags", "+faststart", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for k in range(lo, hi):
        img = np.clip(frame_at(k), 0, 255).astype(np.uint8)
        if preview:
            img = cv2.resize(img, (ow, oh), interpolation=cv2.INTER_AREA)
        p.stdin.write(img.tobytes())
        if k % 200 == 0:
            print("frame", k, flush=True)
    p.stdin.close()
    p.wait()
    print("wrote", out)


def sheet():
    tw, th, cols = 180, 320, 10
    rows = (len(SHOTS) + cols - 1) // cols
    im = Image.new("RGB", (tw * cols, (th + 40) * rows), (10, 10, 12))
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 14)
    f2 = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 12)
    for i, s in enumerate(SHOTS):
        k = (s["a"] + s["b"]) // 2
        fr = cv2.cvtColor(np.clip(frame_at(k), 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)
        x, y = (i % cols) * tw, (i // cols) * (th + 40)
        im.paste(Image.fromarray(fr).resize((tw, th)), (x, y))
        col = (255, 225, 170) if s["kind"] == "REAL" else (255, 120, 90)
        d.text((x + 4, y + th + 3), f"{i + 1:02d} {s['kind']}{' dog' if s.get('dog') else ''}", font=f, fill=col)
        d.text((x + 4, y + th + 21), f"{s['a'] / FPS:.2f}s f{s['a']}-{s['b']}", font=f2, fill=(200, 200, 200))
    out = os.path.join(PROJ, "output", "dream-of-fire_storyboard-cut_f0000-f2342_24fps_contact.jpg")
    im.save(out, quality=88)
    print("wrote", out)


def edl():
    rows = ["| # | song frames | len | time (s) | kind | source | src/offset | speed | what | dog | job |",
            "|---|---|---|---|---|---|---|---|---|---|---|"]
    ai = 0
    for i, s in enumerate(SHOTS):
        n = s["b"] - s["a"]
        if s["kind"] == "REAL":
            src, off = f"#{s['clip']}" + (f" + #{s['over'][0]} screened" if s.get("over") else ""), f"{s['inp']:.2f} s"
        else:
            src, off = os.path.basename(s["path"]), f"take f{s['off']}"
            ai += 0 if s["kind"] == "DAYTAKE" else n
        rows.append(f"| {i + 1:02d} | f{s['a']:04d}-f{s['b']:04d} | {n} | {s['a'] / FPS:.2f}-{s['b'] / FPS:.2f} | {s['kind']} | {src} | {off} | "
                    f"{s['sp']:.2f}x | {s['why']} | {'yes' if s.get('dog') else ''} | {s.get('job', '')} |")
    tr = ["| transition | frames | built |", "|---|---|---|"] + [f"| {k} | f{a}-f{b} | local |" for k, a, b, _ in TRANS]
    dogs = sum(1 for s in SHOTS if s.get("dog"))
    txt = f"""# EDL: dream of fire, storyboard cut (hjeron_dark_blues)

Generated by `tools/assemble.py --edl` from SHOTS. Song frames 24 fps, half-open. Real clips are
Hjeron's own (`viralvision-worker/artists/mythmaker/footage/clips/`, read only), cut, trimmed and
speed-changed only. Generated takes sit in `work/` (local, gitignored) and get the local worn-film
finish (his grain; the ghost pass on A4; the etch pass on SB2). Lipsync takes are H3 on frames of his
real in-character day take, graded locally into his neon (`tools/grade.py`).

{len(SHOTS)} shots, {TOTAL} frames. Generated or converted: {ai} frames = {ai / FPS:.1f} s = {100 * ai / TOTAL:.1f}%.
Wolfdog on screen in {dogs} shots. Fade in f0000-f0024, fade out over the last 30 frames.

""" + "\n".join(rows) + "\n\n## Transitions (all local, free)\n\n" + "\n".join(tr) + """

Odin eye: one ember eye glints through the veil at three beats only: shot 29 (the "open our eyes"
line: his real day take with the eye composited, flaring into the white-out), LS2 (a brief glint on the first held wake-up word) and LS3 (a glint on the
last word of the run). Never two eyes, never elsewhere.
"""
    open(os.path.join(PROJ, "docs", "EDL.md"), "w").write(txt)
    print("wrote docs/EDL.md;", f"AI {100 * ai / TOTAL:.1f}%", "dog shots", dogs)


def check():
    prev = 0
    for s in SHOTS:
        assert s["a"] == prev and s["b"] > s["a"], s
        prev = s["b"]
    assert prev == TOTAL


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--range", nargs=2, type=int)
    ap.add_argument("--sheet", action="store_true")
    ap.add_argument("--edl", action="store_true")
    ap.add_argument("--frames", nargs="*", type=int, help="write single-frame checks to work/check/")
    a = ap.parse_args()
    check()
    if a.edl:
        edl()
    elif a.sheet:
        sheet()
    elif a.frames:
        os.makedirs(os.path.join(PROJ, "work", "check"), exist_ok=True)
        for k in a.frames:
            cv2.imwrite(os.path.join(PROJ, "work", "check", f"f{k:04d}.jpg"),
                        cv2.resize(np.clip(frame_at(k), 0, 255).astype(np.uint8), (540, 960)))
    else:
        lo, hi = a.range if a.range else (0, TOTAL)
        render(a.preview, lo, hi)
