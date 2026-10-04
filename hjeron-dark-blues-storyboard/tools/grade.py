"""Local match-grade of a generated take toward one of Hjeron's real clips (free, no model calls).

  python tools/grade.py <take.mp4> <out.mp4> --look neon|sepia --ref <clip index> [--frames 144]

Both looks: the take's luminance is histogram-matched to the ref clip, then mapped through the ref's
own luminance-to-colour table (so skies, shadows and skin land on his palette), plus his grain.
neon:  his flame overlay, keyed out of the ref clip by hue, screened on top.
sepia: a procedural torn, scorched photo edge in the style of his borders.
Real clips are only read, never changed. Output is 1080x1920, 24 fps, video only.
"""
import argparse
import json
import subprocess

import cv2
import numpy as np

FOOT = "/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/artists/mythmaker/footage/"
CLIPS = [c["path"] for c in json.load(open(FOOT + "manifest.json"))["clips"]]
W, H = 1080, 1920


def read(path, size=(W, H)):
    cap = cv2.VideoCapture(path)
    out = []
    while True:
        ok, im = cap.read()
        if not ok:
            break
        out.append(cv2.resize(im, size, interpolation=cv2.INTER_CUBIC))
    return out


def lab_stats(frames):
    labs = np.concatenate([cv2.cvtColor(f, cv2.COLOR_BGR2LAB).reshape(-1, 3).astype(np.float32) for f in frames[::6]])
    return labs.mean(0), labs.std(0) + 1e-3


def transfer(img, src, dst):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    lab = (lab - src[0]) / src[1] * dst[1] + dst[0]
    return cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)


def grain_bank(frames):
    out = []
    for f in frames[:24]:
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32)
        hp = g - cv2.GaussianBlur(g, (0, 0), 1.2)  # fine luma residual = his grain, not his edges
        hp *= 1 - flame_mask(f)
        out.append(np.clip(hp, -10, 10)[..., None])
    return out


def flame_mask(f):
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    m = (h <= 25) & (s > 90) & (v > 140)  # his orange/yellow flame overlay only, not the pink sky
    return cv2.GaussianBlur(m.astype(np.float32), (0, 0), 2.0)


def flame_layer(f):
    """Soft flame layer: weight each pixel by how orange it is (red well above blue and green-ish warm)."""
    b, g, r = [c.astype(np.float32) for c in cv2.split(f)]
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV).astype(np.float32)
    hue, sat, val = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    # his flames sit at OpenCV hue 0-25 (red-orange to yellow); the pink sky is 150-180, soft on saturation and value; pink sky (hue 150-180) gets 0
    warm = np.clip((34 - hue) / 12, 0, 1) * np.clip((sat - 50) / 110, 0, 1) * np.clip((val - 100) / 120, 0, 1)
    warm = cv2.GaussianBlur(warm, (0, 0), 6.0) ** 0.8
    return f.astype(np.float32) * warm[..., None]


def tone_lut(frames, margin=0.12):
    """Mean colour of the ref at each luminance level (flame pixels and the border band excluded)."""
    acc = np.zeros((256, 3)); cnt = np.zeros(256)
    ys, xs = int(H * margin), int(W * margin)
    lums = []
    for f in frames[::5]:
        c = f[ys:H - ys, xs:W - xs]
        keep = flame_mask(c) < 0.05
        l = cv2.cvtColor(c, cv2.COLOR_BGR2GRAY)[keep]
        col = c[keep].astype(np.float64)
        np.add.at(acc, l, col); np.add.at(cnt, l, 1)
        lums.append(l)
    lut = np.zeros((256, 3))
    have = cnt > 20
    for ch in range(3):
        lut[:, ch] = np.interp(np.arange(256), np.nonzero(have)[0], acc[have, ch] / cnt[have])
    return lut.astype(np.float32), np.concatenate(lums)


def match_lum(lum, src_l, ref_l):
    """Histogram-match the take's luminance to the ref's."""
    sq = np.percentile(src_l, np.linspace(0, 100, 101))
    rq = np.percentile(ref_l, np.linspace(0, 100, 101))
    return np.interp(lum, sq, rq)


def torn_border(seed=3):
    """Procedural torn and burned photo edge in his style: ragged paper edge, scorched brown rim."""
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.minimum.reduce([x, W - 1 - x, y, H - 1 - y])
    n = cv2.resize(rng.random((H // 24, W // 24)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC)
    n2 = cv2.resize(rng.random((H // 6, W // 6)).astype(np.float32), (W, H), interpolation=cv2.INTER_CUBIC)
    edge = d - (28 * n + 10 * n2)
    paper = np.clip(edge / 6, 0, 1)            # 0 outside the torn edge
    burn = np.clip(1 - (edge - 6) / 70, 0, 1)   # scorch band inside it
    return paper, burn
def border_plate(frames):
    stack = np.stack(frames[::3]).astype(np.float32)
    med = np.median(stack, axis=0)
    lum = cv2.cvtColor(med.astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32)
    band = np.zeros_like(lum)
    e = 90
    band[:e, :] = band[-e:, :] = 1
    band[:, :e] = band[:, -e:] = 1
    band = cv2.GaussianBlur(band, (0, 0), 25)
    ref = np.median(lum[H // 4: 3 * H // 4, W // 4: 3 * W // 4])
    plate = np.clip(med / max(ref, 1.0), 0, 1.6)
    plate = plate * band[..., None] + (1 - band[..., None])
    return plate


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("take")
    ap.add_argument("out")
    ap.add_argument("--look", choices=["neon", "sepia"], required=True)
    ap.add_argument("--ref", type=int, required=True)
    ap.add_argument("--frames", type=int, default=144)
    ap.add_argument("--flames", type=int, nargs="*", default=[22, 21], help="his flame clips to key flames from")
    a = ap.parse_args()
    take = read(a.take)[: a.frames]
    ref = read(FOOT + CLIPS[a.ref])
    lut, ref_l = tone_lut(ref)
    src_l = np.concatenate([cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).ravel()[::7] for f in take[::6]])
    grain = grain_bank(ref)
    flames = [read(FOOT + CLIPS[i]) for i in a.flames] if a.look == 'neon' else []
    if a.look == "sepia":
        paper, burn = torn_border()
        edge_col = np.array([150, 205, 232], np.float32)  # aged paper (BGR), sampled look of his torn edges
        scorch = np.array([20, 45, 80], np.float32)
    p = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
                          "-r", "24", "-i", "-", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", a.out],
                         stdin=subprocess.PIPE)
    for k, f in enumerate(take):
        lum = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32)
        ml = lum  # direct tone map: the take keeps its own exposure, the ref supplies the colour at each level
        if a.look == "neon":
            ml = 212 * (lum / 255) ** 2.3  # crush the mids to purple-black; top out in the ref's pink, not its white
        g = np.stack([np.interp(ml, np.arange(256), lut[:, ch]) for ch in range(3)], -1)
        if a.look == "neon":
            hsv = cv2.cvtColor(np.clip(g, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
            hsv[..., 1] = np.clip(hsv[..., 1] * 1.4, 0, 255)
            g = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
            fl = sum(flame_layer(src_[round(k * 30 / 24) % len(src_)]) for src_ in flames)
            fl = np.clip(fl * 1.35, 0, 255)
            g = 255 - (255 - g) * (255 - fl) / 255  # screen his flames on top
        else:
            g = g * (1 - 0.75 * burn[..., None]) + scorch * 0.75 * burn[..., None] * 0.4
            g = g * paper[..., None] + edge_col * (1 - paper[..., None])
        g += grain[k % len(grain)]
        p.stdin.write(np.clip(g, 0, 255).astype(np.uint8).tobytes())
    p.stdin.close()
    p.wait()
    print("wrote", a.out, len(take), "frames")


if __name__ == "__main__":
    main()
