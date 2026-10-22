"""Sound for the spec clip, synthesised in code (no samples), so the series sounds the same.
Every hit lands one video frame (1/30 s) after its picture event. Times mirror index.html."""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR, DUR, F = 48000, 7.5, 1 / 30
PING1, PING2, BRAKE, IRIS0, LOCK, HIT, PING3 = 0.6, 2.4, 2.6, 3.3, 3.85, 4.1, 5.0
rng = np.random.default_rng(11)
out = np.zeros(int(SR * DUR))


def t_(n): return np.arange(n) / SR
def bp(x, lo, hi, o=4): return sosfilt(butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, o=4): return sosfilt(butter(o, f, "lowpass", fs=SR, output="sos"), x)
def hp(x, f, o=4): return sosfilt(butter(o, f, "highpass", fs=SR, output="sos"), x)


def add(at, x, gain=1.0):
    i = int((at + F) * SR)
    j = min(len(out), i + len(x))
    out[i:j] += gain * x[: j - i]


def chime(at, gain=0.5):
    # two-note phone ping: G6 then C7, soft bell partials
    for k, (f0, d) in enumerate([(1568, 0.0), (2093, 0.09)]):
        t = t_(int(SR * 0.5))
        env = np.exp(-t * 9) * np.minimum(1, t * 400)
        x = np.sin(2 * np.pi * f0 * t) + 0.3 * np.sin(2 * np.pi * f0 * 2.01 * t) * np.exp(-t * 6)
        add(at + d, x * env, gain)


def buzz(at, gain=0.25):
    t = t_(int(SR * 0.3))
    x = np.sign(np.sin(2 * np.pi * 170 * t)) * (np.sin(2 * np.pi * 26 * t) > -0.3)
    add(at, lp(x, 900) * np.minimum(1, (0.3 - t) * 30), gain)


# engine hum under the road shots, muffled inside the car, gone after the hit
n = int(SR * (HIT + 0.4))
t = t_(n)
hum = lp(rng.standard_normal(n), 220) * 2.5 + 0.35 * np.sin(2 * np.pi * (62 + 3 * np.sin(2 * np.pi * 0.7 * t)) * t)
env = np.minimum(1, t / 0.3) * np.where(t < HIT, 1, np.exp(-(t - HIT) * 12))
env *= np.where((t > 2.0) & (t < 3.6), 0.55, 1)
add(-F, hum * env, 0.12)

chime(PING1)
chime(PING2, 0.45)
buzz(PING2)
chime(PING3, 0.42)

# the red takes the frame: a rising whoosh into the cut
n = int(SR * 0.45)
t = t_(n)
w = bp(rng.standard_normal(n), 400, 2400) * (t / t[-1]) ** 2
add(IRIS0 - 0.1, w, 0.35)

# tyre screech from the lock to the hit
n = int(SR * (HIT - LOCK + 0.05))
t = t_(n)
f = 2600 + 300 * (t / t[-1]) + 60 * np.sin(2 * np.pi * 23 * t)
tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
scr = 0.6 * tone + bp(rng.standard_normal(n), 1800, 4200) * 3
add(LOCK, scr * np.minimum(1, t / 0.04) * (0.6 + 0.4 * t / t[-1]), 0.22)

# the crash: low thump, metal crunch, glass
n = int(SR * 1.4)
t = t_(n)
thump = np.sin(2 * np.pi * (85 * np.exp(-t * 6) + 40) * t) * np.exp(-t * 7)
crunch = lp(rng.standard_normal(n), 3000) * np.exp(-t * 9) * 1.5
metal = sum(np.sin(2 * np.pi * f0 * t + rng.uniform(0, 6)) * np.exp(-t * d) for f0, d in [(311, 5), (523, 6), (797, 8), (1187, 9), (1733, 12)])
add(HIT, thump * 0.9 + crunch * 0.6 + metal * 0.12, 0.6)
for k in range(14):  # glass tinkles as the shards land
    at = HIT + 0.35 + rng.uniform(0, 0.6)
    m = int(SR * 0.12)
    tt = t_(m)
    add(at, np.sin(2 * np.pi * rng.uniform(3500, 7500) * tt) * np.exp(-tt * 45), 0.05 + 0.04 * rng.random())

# steam hiss from the bent hood
n = int(SR * (6.0 - HIT - 0.3))
t = t_(n)
add(HIT + 0.3, hp(rng.standard_normal(n), 3500) * np.minimum(1, t / 0.3) * np.minimum(1, (t[-1] - t) / 0.2), 0.05)

# closing screen: a soft pop, then a low warm chord under the text
n = int(SR * 0.25)
t = t_(n)
add(6.05, np.sin(2 * np.pi * (300 * np.exp(-t * 18) + 140) * t) * np.exp(-t * 16), 0.35)
n = int(SR * 1.2)
t = t_(n)
chord = sum(np.sin(2 * np.pi * f0 * t) for f0 in (196, 247, 294, 392)) / 4
add(6.72, chord * np.minimum(1, t / 0.05) * np.exp(-t * 2.2), 0.25)

out = np.tanh(out * 1.2) * 0.85
fade = int(SR * 0.08)
out[-fade:] *= np.linspace(1, 0, fade)
wavfile.write(sys.argv[1] if len(sys.argv) > 1 else "out/sfx.wav", SR, (out * 32767).astype(np.int16))
print("peak", float(np.abs(out).max()))
