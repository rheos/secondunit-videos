"""sfx_kit.py · a sound-design kit after the Ijep Studio flagellum reel, for This Goes Into This and the gnome piece.

    python tools/sfx_kit.py [out/audio/flagellum-kit]

Robin, 2026-10-30, on the reel (a bacterium building its flagellar motor, saved to ~/Downloads): "it's a soundscape
with a lot of sounds i would like to recreate". Its sounds, read off the spectrogram against the frames (issue #353):
a low hum under everything, a granular fizz as loose parts drift in, short bright chirps as parts dock, a clunk as a
big part lands, a long falling whistle as a protein threads the channel, a hiss as the tail extrudes, a rising ladder
of harmonics, a staircase of blips and click bursts as the stators lock, 100 ms of dead silence, then ignition: a
pitch glide up into a hum that pulses about 3.6 times a second, with whooshes as the tail sweeps past.

Each is a recipe here, built on the loop's own sound.py helpers (tone, sweep, bell, pluck, noise_sweep, crush) and
pitched into its D major-seventh-sharp-eleven, so they sit in the loop's voice. Unlike sound.py these are one-shots,
not loops: nothing wraps round. This file never touches sound.py or the frozen s26w mix.

Writes <stem>_audition.wav (each sound alone, then the sequence), <stem>_sequence.wav (the reel's 61.4 s arc, timed
to its picture) and <stem>_cues.txt (where each sound starts in the audition).
"""
import sys
import wave
from pathlib import Path

import numpy as np
from scipy.signal import fftconvolve

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sound as s  # noqa: E402  (the loop's helpers; importing it renders nothing)

SR = s.SR
RNG = np.random.default_rng(353)
D_CHORD = (2, 9, 4, 8, 1)       # D A E G# C#: the loop's first chord, as pitch classes


def chord_tones(lo, n):
    """the first n notes of the D chord at or above midi lo"""
    out, m = [], lo
    while len(out) < n:
        if m % 12 in D_CHORD:
            out.append(m)
        m += 1
    return out


# ---------------- one-shot tools (linear, not circular) ----------------
def put(buf, t, sig, pan=0.0, gain=1.0):
    """add a mono or stereo sound at time t; pan -1 left .. 1 right, or an array for a moving pan"""
    if sig.ndim == 1:
        a = (np.asarray(pan) + 1) * np.pi / 4
        sig = np.stack([sig * np.cos(a), sig * np.sin(a)], axis=1)
    i0 = int(round(t * SR))
    n = min(len(sig), len(buf) - i0)
    if n > 0:
        buf[i0:i0 + n] += sig[:n] * gain


def band(x, lo=None, hi=None):
    """band-pass with soft edges in the FFT domain, padded so nothing wraps"""
    pad = SR // 2
    xp = np.concatenate([x, np.zeros((pad,) + x.shape[1:])])
    X = np.fft.rfft(xp, axis=0)
    f = np.fft.rfftfreq(len(xp), 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * (g[:, None] if x.ndim == 2 else g), n=len(xp), axis=0)[: len(x)]


def fade(x, a=0.01, r=0.05):
    n = len(x)
    g = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        g[:na] = np.linspace(0, 1, na)
    if nr:
        g[n - nr:] *= np.linspace(1, 0, nr)
    return x * (g[:, None] if x.ndim == 2 else g)


def layer(*sigs):
    """sum mono sounds of different lengths, aligned at their start"""
    out = np.zeros(max(len(x) for x in sigs))
    for x in sigs:
        out[: len(x)] += x
    return out


def harmonics(f, n, top=2600, nasal=1200, width=600):
    """a buzzy harmonic tone following the frequency curve f (an array), shaped toward a formant like the loop's reed"""
    ph = 2 * np.pi * np.cumsum(f) / SR
    out = np.zeros(n)
    for k in range(1, 40):
        if k * f.max() > top:
            break
        fk = k * np.median(f)
        out += (1 / k) * (1 + 1.6 * np.exp(-((fk - nasal) / width) ** 2)) * np.sin(k * ph + RNG.uniform(0, 2 * np.pi))
    return out


def click(fc=2600, dur=0.012):
    n = int(SR * dur)
    return s.cfilter_short(RNG.standard_normal(n) * s.env(n, 0.0004, dur / 4), fc)


def hall(x, decay=2.4, bright=6500):
    """a soft hall: convolution with a decaying stereo noise tail, cut to the input's length"""
    n = int(SR * decay * 1.5)
    tt = np.arange(n) / SR
    ir = RNG.standard_normal((n, 2)) * np.exp(-6.9 * tt / decay)[:, None]
    ir[: int(0.03 * SR)] = 0
    ir = band(ir, hi=bright)
    ir /= np.sqrt((ir ** 2).sum(axis=0, keepdims=True))
    return np.stack([fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)


# ---------------- the recipes ----------------
def hum(dur, f=s.midi(38)):
    """the bed: a low D drone, two voices a little apart so it beats slowly, with a sub rumble wandering under it"""
    n = int(SR * dur)
    tt = np.arange(n) / SR
    drift = 1 + 0.002 * np.sin(2 * np.pi * 0.07 * tt)
    a = harmonics(np.full(n, f * 0.998) * drift, n, top=1400, nasal=290, width=160)
    b = harmonics(np.full(n, f * 1.002) / drift, n, top=1400, nasal=290, width=160)
    rumble = band(RNG.standard_normal(n), lo=25, hi=90)
    rumble *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * tt + 1.0)
    drone = band(np.stack([a + 0.7 * b, b + 0.7 * a], axis=1), lo=40, hi=1500)
    drone /= np.abs(drone).max()
    return drone + 0.5 * (rumble / np.abs(rumble).max())[:, None]


def fizz(dur, rate=420):
    """parts drifting in: hundreds of tiny high grains a second, scattered across the field, swelling and thinning"""
    n = int(SR * dur)
    out = np.zeros((n, 2))
    for _ in range(int(rate * dur)):
        t = RNG.uniform(0, dur - 0.02)
        dens = np.sin(np.pi * t / dur) ** 0.5
        if RNG.random() > dens:
            continue
        f = np.exp(RNG.uniform(np.log(1500), np.log(6500)))
        g_dur = RNG.uniform(0.003, 0.014)
        grain = s.tone(f, g_dur, 'sine', a=0.0005, d=g_dur / 3)
        if RNG.random() < 0.3:
            grain = s.crush(grain, bits=5, hold=2)
        put(out, t, grain, RNG.uniform(-0.9, 0.9), RNG.uniform(0.2, 1.0))
    return out / (np.abs(out).max() + 1e-9)


def chirp(m):
    """a part docking: a quick upward flick into a short glassy bell, about 2 to 2.6 kHz"""
    f = s.midi(m)
    return layer(0.5 * s.sweep(f * 0.82, f, 0.035, d=0.03), s.bell(f, 0.45, ratio=2.0, index=0.9))


def clunk():
    """a big part landing: a dropping thump, a dull knock, and a low metal ring under it"""
    body = s.sweep(130, 42, 0.55, d=0.18)
    knock = band(RNG.standard_normal(int(SR * 0.06)) * s.env(int(SR * 0.06), 0.0005, 0.012), hi=900) * 3
    ring = 0.22 * s.bell(s.midi(50), 0.9, ratio=1.41, index=1.6)
    return layer(body, knock, ring)


def tick():
    """a small assembly click, for the busy middle"""
    return layer(click(RNG.uniform(1800, 4200)), 0.3 * s.tone(RNG.uniform(2500, 4000), 0.02, 'tri', d=0.006))


def thread(dur=5.5, f0=s.midi(100), f1=s.midi(93)):
    """a protein threading the channel: a long whistle falling a fifth (E7 to A6) with a slight warble, a zipper of
    ticks speeding up under it as the chain unspools"""
    n = int(SR * dur)
    tt = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (tt / dur) * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    whistle = (np.sin(ph) + 0.25 * np.sin(2 * ph)) * fade(np.ones(n), 0.15, 0.5)
    zip_ = np.zeros(n)
    t, rate = 0.1, 9.0
    while t < dur - 0.1:
        z = click(RNG.uniform(2500, 3500), 0.008)
        i = int(t * SR)
        zip_[i:i + len(z)] += z[: n - i]
        rate = min(22.0, rate * 1.035)
        t += 1 / rate
    return 0.6 * whistle + 0.25 * zip_


def held(dur=4.2, m=80):
    """the held tone under the whistle: G#5, the chord's sharp eleven, with a slow tremolo"""
    n = int(SR * dur)
    tt = np.arange(n) / SR
    f = s.midi(m)
    x = (np.sin(2 * np.pi * f * tt) + 0.2 * np.sin(4 * np.pi * f * tt)) * (0.85 + 0.15 * np.sin(2 * np.pi * 4.2 * tt))
    return fade(x, 0.4, 0.7)


def hiss(dur=7.0, lo=2800, hi=11000):
    """the tail extruding: a bright hiss that swells and flutters, with sparkles flicking through it"""
    n = int(SR * dur)
    tt = np.arange(n) / SR
    air = band(RNG.standard_normal((n, 2)), lo=lo, hi=hi)
    air /= np.abs(air).max()
    flutter = 0.7 + 0.3 * band(RNG.standard_normal(n), hi=6)[:, None] / 0.02
    shape = np.sin(np.pi * tt / dur) ** 0.8
    return air * np.clip(flutter, 0.2, 1.3) * shape[:, None] + 0.4 * fizz(dur, rate=60)


def rise(dur=4.0, f0=s.midi(50), f1=s.midi(57)):
    """a rising ladder: a buzzy tone gliding up a fifth, heard as parallel harmonics climbing through 800 to 1800 Hz"""
    n = int(SR * dur)
    tt = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (tt / dur)
    x = band(harmonics(f, n, top=2400, nasal=1300, width=500), lo=600)
    return fade(x / np.abs(x).max(), 0.6, 0.4) * np.sin(np.pi * tt / dur) ** 0.3


def locks():
    """the stators locking on (eleven of them): a staircase of blips stepping up the chord, then two quick bursts of
    clicks at the reel's own times, then the last one seating with a soft latch"""
    out = np.zeros((int(SR * 8.6), 2))
    for i, m in enumerate(chord_tones(88, 8)):                         # E6 upward, 0.6 s apart
        b = s.crush(s.tone(s.midi(m), 0.16, 'tri', a=0.004, d=0.09), bits=7, hold=1)
        put(out, i * 0.62, layer(b, 0.4 * s.tone(s.midi(m + 12), 0.1, 'sine', d=0.05)), (-0.5, 0.5)[i % 2], 0.6)
    for k, t in enumerate((5.54, 5.71, 5.88, 6.04, 6.88, 7.05, 7.21)):  # the reel's 35.54 .. 37.21 s, less 30
        put(out, t, layer(click(1600 + 220 * k, 0.018), 0.35 * s.sweep(180, 90, 0.05, d=0.03)), 0.3 * (-1) ** k, 0.9)
    put(out, 7.94, layer(0.7 * click(900, 0.03), s.sweep(150, 60, 0.18, d=0.08)), 0.0, 1.0)
    return out


def ignition(dur, f=s.midi(38), pulse=3.6):
    """the engine starting: a glide up from an octave below into a bright harmonic hum, overshooting a touch and
    settling, then pulsing about 3.6 times a second with a sub thump on every pulse"""
    n = int(SR * dur)
    tt = np.arange(n) / SR
    curve = f * (0.5 + 0.5 * (1 - np.exp(-tt / 0.3))) * (1 + 0.04 * np.exp(-((tt - 0.9) / 0.3) ** 2))
    x = harmonics(curve, n, top=2600, nasal=1100, width=700)
    x = band(x, lo=50, hi=3000)
    x /= np.abs(x).max()
    am = 0.5 + 0.5 * (0.5 + 0.5 * np.cos(2 * np.pi * pulse * tt)) ** 2
    am = np.where(tt < 0.9, 1.0, am)                                    # the glide clean, then the chug
    out = np.stack([x * am, np.roll(x * am, int(0.004 * SR))], axis=1)   # a hair of width
    k = 0
    while 0.9 + k / pulse < dur - 0.2:
        put(out, 0.9 + k / pulse, s.sweep(95, 45, 0.12, d=0.06), 0.0, 0.35)
        k += 1
    return fade(out, 0.03, 0.8)


def whoosh(dur=1.4, p0=-0.8, p1=0.8):
    """the tail sweeping past the camera: a band of air rising then falling, carried across the stereo field"""
    up = s.noise_sweep(dur / 2, 500, 4500)
    down = s.noise_sweep(dur / 2, 4500, 600)
    x = np.concatenate([up, down])
    n = len(x)
    return x, p0 + (p1 - p0) * np.arange(n) / n


# ---------------- the reel's arc ----------------
SEQ = 61.4


def sequence():
    """the reel's 61.4 s, each sound where the reel has it (times read off its spectrogram and frames)"""
    n = int(SR * SEQ)
    out = np.zeros((n, 2))
    put(out, 0.0, fade(hum(SEQ), 1.5, 1.5), 0.0, 0.32)
    put(out, 0.0, fade(fizz(3.7), 0.2, 0.03), 0.0, 0.5)
    for t, m in zip((5.0, 5.9, 6.7, 7.6, 8.4), (97, 98, 100, 98, 97)):
        put(out, t, chirp(m), RNG.uniform(-0.4, 0.4), 0.30)
    for t in np.arange(9.2, 20.5, 0.7) + RNG.uniform(-0.2, 0.2, len(np.arange(9.2, 20.5, 0.7))):
        put(out, t, tick(), RNG.uniform(-0.7, 0.7), 0.35)
    put(out, 11.2, clunk(), -0.15, 0.85)
    put(out, 21.0, thread(5.5), 0.1, 0.32)
    put(out, 22.0, held(4.2), 0.0, 0.12)
    put(out, 22.0, hiss(7.0), 0.0, 0.3)
    put(out, 26.0, rise(4.0), 0.0, 0.30)
    put(out, 30.0, locks(), 0.0, 0.55)
    put(out, 38.6, ignition(SEQ - 38.6), 0.0, 0.55)
    for t in (41.0, 44.0, 46.5, 49.0, 52.0, 55.0, 57.5):
        x, pan = whoosh(1.4, *((-0.8, 0.8) if int(t) % 2 else (0.8, -0.8)))
        put(out, t, x, pan, 0.30)
    return out


def gate(x, t0=38.46, dur=0.10, ramp=0.003):
    """the dead silence before ignition: everything, tails and reverb included, cut to nothing for 100 ms"""
    g = np.ones(len(x))
    a, b, r = int(t0 * SR), int((t0 + dur) * SR), int(ramp * SR)
    g[a - r:a] = np.linspace(1, 0, r)
    g[a:b] = 0
    g[b:b + r] = np.linspace(0, 1, r)
    return x * g[:, None]


def master(x, rms_db=-17):
    x = band(x, lo=30, hi=15000)
    x *= 10 ** (rms_db / 20) / np.sqrt((x ** 2).mean())
    return np.tanh(x / 0.89) * 0.89


def stereo(x):
    return np.stack([x, x], axis=1) * np.cos(np.pi / 4) if x.ndim == 1 else x


SOLOS = [
    ('hum (the bed)', lambda: fade(hum(5.0), 0.5, 0.8)),
    ('fizz (parts drifting in)', lambda: fade(fizz(3.7), 0.2, 0.05)),
    ('chirps (parts docking)', lambda: sum_at([(0.0, chirp(97)), (0.8, chirp(98)), (1.5, chirp(100)), (2.3, chirp(98))])),
    ('ticks (assembly clicks)', lambda: sum_at([(0.35 * i + RNG.uniform(0, 0.1), tick()) for i in range(8)])),
    ('clunk (a big part lands)', clunk),
    ('thread (a protein threading the channel)', lambda: thread(5.5)),
    ('held tone (under the thread)', lambda: held(4.2)),
    ('hiss (the tail extruding)', lambda: hiss(5.0)),
    ('rise (the harmonic ladder)', lambda: rise(4.0)),
    ('locks (stators: staircase, click bursts, latch)', locks),
    ('silence then ignition', lambda: np.concatenate([np.zeros((int(0.8 * SR), 2)), ignition(6.0)])),
    ('whoosh (the tail sweeping past)', lambda: whoosh_st()),
]


def sum_at(items):
    out = np.zeros((int(SR * (max(t for t, _ in items) + 1.0)), 2))
    for t, x in items:
        put(out, t, x, RNG.uniform(-0.4, 0.4))
    return out


def whoosh_st():
    x, pan = whoosh(1.4)
    out = np.zeros((len(x), 2))
    put(out, 0.0, x, pan)
    return out


def write(path, x):
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def main():
    root = Path(__file__).resolve().parent.parent
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    stem = root / (args[0] if args else 'out/audio/flagellum-kit')

    seq = sequence()
    seq = master(gate(seq + 0.35 * hall(seq)))
    write(Path(f'{stem}_sequence.wav'), seq)

    gap = 1.2
    parts, cues, t = [], [], 0.0
    for name, make in SOLOS:
        x = stereo(make())
        x = x / (np.abs(x).max() + 1e-9) * 0.5
        x = np.concatenate([x, np.zeros((int(SR * gap), 2))])
        x = x + 0.3 * hall(x)
        parts.append(x)
        cues.append(f'{t:6.1f} s  {name}')
        t += len(x) / SR
    cues.append(f'{t + 1.0:6.1f} s  the whole sequence, timed to the reel ({SEQ} s)')
    solos = master(np.concatenate(parts), rms_db=-19)
    write(Path(f'{stem}_audition.wav'), np.concatenate([solos, np.zeros((SR, 2)), seq]))
    Path(f'{stem}_cues.txt').write_text('\n'.join(cues) + '\n')

    print('\n'.join(cues))
    print(f'{Path(f"{stem}_audition.wav").relative_to(root)}: {t + 1.0 + SEQ:.1f} s, '
          f'sequence rms {20 * np.log10(np.sqrt((seq ** 2).mean())):.1f} dBFS, peak {20 * np.log10(np.abs(seq).max()):.1f} dBFS')


if __name__ == '__main__':
    main()
