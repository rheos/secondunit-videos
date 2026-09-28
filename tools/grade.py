"""Dark-blues grade for Hjeron's real footage.

One look for every clip: deep blue night/dusk base, crushed blacks, warm fire kept warm,
vignette, light grain. Per-clip presets only change how much "fire" survives, how hard
the black point sits, and whether magenta (his neon-pink fire edits) is pulled to blue.
"""
import cv2
import numpy as np

# Blue night tone, applied to luminance (RGB order).
NIGHT_HI = np.array([0.62, 0.78, 1.00], np.float32)   # highlights: cold moonlit blue
NIGHT_LO = np.array([0.00, 0.035, 0.09], np.float32)  # shadows: blue-black, not grey
FIRE_TINT = np.array([1.00, 0.55, 0.20], np.float32)  # what warm pixels are pushed toward

PRESETS = {
    # sepia / torn-photo desert clips: no real fire, full day-for-night
    "night":   dict(bp=0.10, gamma=1.55, gain=0.95, fire=0.0, fsat=0.55, fval=0.80, hw=18, cores=False, mag=False),
    # sepia clips with a real sun or ember in frame: keep only the hottest warm pixels
    "dusk":    dict(bp=0.10, gamma=1.45, gain=1.00, fire=1.0, fsat=0.62, fval=0.82, hw=18, cores=False, mag=False),
    # his neon-pink fire composites: magenta sky to blue, orange/yellow flames stay warm
    "fire":    dict(bp=0.05, gamma=1.12, gain=1.05, fire=1.0, fsat=0.40, fval=0.45, hw=38, cores=True, mag=True),
    # already dark / black-background clips (smoke, clouds, silhouettes)
    "dark":    dict(bp=0.04, gamma=1.15, gain=1.15, fire=0.0, fsat=0.55, fval=0.8, hw=18, cores=False, mag=False),
    # smoke and cloud elements shot on near-black: lift them so the smoke reads
    "smoke":   dict(bp=0.00, gamma=0.85, gain=2.2, fire=0.0, fsat=0.55, fval=0.8, hw=18, cores=False, mag=False),
    # dark silhouette clips with a red cast (Hjeron against a burning sky)
    "ember":   dict(bp=0.00, gamma=0.75, gain=2.0, fire=1.0, fsat=0.45, fval=0.15, hw=30, fgain=2.5, cores=False, mag=False),
    # overexposed flash: tame it hard
    "flash":   dict(bp=0.35, gamma=1.8, gain=0.85, fire=0.0, fsat=0.5, fval=0.8, hw=18, cores=False, mag=False),
}

_vig_cache = {}


def _vignette(h, w, strength=0.55):
    key = (h, w, strength)
    if key not in _vig_cache:
        y, x = np.mgrid[0:h, 0:w].astype(np.float32)
        d = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / 1.2
        _vig_cache[key] = np.clip(1 - strength * d ** 2.2, 0, 1)[..., None]
    return _vig_cache[key]


def _smooth(x, a, b):
    t = np.clip((x - a) / (b - a + 1e-6), 0, 1)
    return t * t * (3 - 2 * t)


def grade(bgr, preset="night", fire_boost=1.0, rng=None):
    p = PRESETS[preset]
    img = bgr.astype(np.float32) / 255.0
    rgb = img[..., ::-1]
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float32)
    hue, sat, val = hsv[..., 0] * 2.0, hsv[..., 1] / 255.0, hsv[..., 2] / 255.0

    lum = rgb[..., 0] * 0.30 + rgb[..., 1] * 0.59 + rgb[..., 2] * 0.11
    if p["mag"]:
        # pink-white sky reads as blown highlight: sink it so it becomes night sky
        magenta = _smooth(np.minimum(np.abs(hue - 310), 60), 60, 25)  # 1 near 310 deg
        lum = lum * (1 - 0.55 * magenta)
    l2 = np.clip((lum - p["bp"]) / (1 - p["bp"]), 0, 1) ** p["gamma"] * p["gain"]
    l2 = np.clip(l2, 0, 1)[..., None]
    base = NIGHT_LO + (NIGHT_HI - NIGHT_LO) * l2

    out = base
    if p["fire"] > 0:
        h2 = np.where(hue > 200, hue - 360, hue)     # -160..200, red at 0
        warm = np.abs(h2 - 22)                        # distance from orange
        warm_m = _smooth(-warm, -p["hw"] - 12, -p["hw"])
        fire = warm_m * _smooth(sat, p["fsat"] - 0.12, p["fsat"] + 0.08) * _smooth(val, p["fval"] - 0.15, p["fval"] + 0.05)
        if p["cores"]:
            # white-yellow flame cores: bright, low saturation, not magenta
            core = _smooth(val, 0.78, 0.92) * _smooth(-np.abs(h2 - 35), -70, -45) * _smooth(sat, 0.08, 0.2)
            fire = np.maximum(fire, core)
        fire = np.clip(fire * p["fire"] * fire_boost, 0, 1)[..., None]
        flame = np.clip(rgb * 0.55 + FIRE_TINT * lum[..., None] * 0.75, 0, 1) * (1 + (p.get("fgain", 1.0) - 1) * (1 - np.clip(lum * 3, 0, 1)))[..., None]
        flame = np.clip((flame - 0.04) * 1.15, 0, 1)
        out = out * (1 - fire) + flame * fire

    out = out * _vignette(out.shape[0], out.shape[1])
    if rng is not None:
        out = out + rng.normal(0, 0.012, out.shape[:2])[..., None].astype(np.float32)
    out = np.clip(out, 0, 1)
    return (out[..., ::-1] * 255).astype(np.uint8)
