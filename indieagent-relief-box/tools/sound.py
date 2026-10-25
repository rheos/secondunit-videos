"""sound.py · the living loop's sound, synthesized: a breathing reed organ, glitches, and the picture's events.

    python tools/sound.py [out/loop-cues.json] [out/audio/reliefloop_loop.wav]

Robin, 2026-10-25: "ambient glitchy and ethereal noises with a strange kind of harmony in what sounds like the
bellows of an accordion or harmonium". So the bed is a reed organ: every note two slightly mistuned reeds that beat
against each other (the accordion's shimmer), voiced toward a nasal reed tone; each chord swells and fades like a
slow push and pull of the bellows, with air hissing through as the bellows turn. The harmony is four bright,
airy major-seventh-sharp-eleven chords sliding in parallel by odd steps, one per 3 s, changing legato inside two
long breaths of the bellows per loop. Around it: glitch stutters
cut from the organ itself, and the events the page reports (tools/cues.mjs), each panned to where it happens.

The 12 s loop is seamless by construction: every oscillator runs a whole number of cycles in the loop (frequencies
snapped to multiples of 1/12 Hz), noise and reverb are filtered and convolved circularly (in the FFT domain over
the whole loop), and every sound that runs past the end wraps round to the start.
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
LOOP = 12.0
N = int(SR * LOOP)
T = np.arange(N) / SR
RNG = np.random.default_rng(1919)
FRAME = 1 / 24          # each event sound lands one frame after the picture's event


def snap(f):
    """the nearest frequency that runs a whole number of cycles in the loop"""
    return round(f * LOOP) / LOOP


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------- circular tools ----------------
def cfilter(x, lo=None, hi=None, tilt=0.0):
    """band-pass a loop in the FFT domain (soft edges), so the result loops too"""
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        g *= 1 / (1 + (f / hi) ** 4)
    if tilt:
        g *= (np.maximum(f, 20) / 1000) ** tilt
    return np.fft.irfft(X * (g[:, None] if x.ndim == 2 else g), n=len(x), axis=0)


def creverb(x, decay=3.2, pre=0.02, bright=6000):
    """a long, soft hall: circular convolution with a decaying stereo noise tail"""
    n = int(SR * min(decay * 1.6, LOOP - 0.1))
    tt = np.arange(n) / SR
    ir = RNG.standard_normal((n, 2)) * np.exp(-6.9 * tt / decay)[:, None]
    ir[: int(pre * SR)] = 0
    ir = cfilter(np.pad(ir, ((0, N - n), (0, 0))), hi=bright)
    ir /= np.sqrt((ir ** 2).sum(axis=0, keepdims=True))
    X = np.fft.rfft(x, axis=0)
    return np.fft.irfft(X * np.fft.rfft(ir, axis=0), n=N, axis=0)


def cdelay(x, step=0.375, feedback=0.55, repeats=8, darken=0.75):
    """a ping-pong echo locked to the loop (3/8 s, 32 repeats a loop): each repeat swaps sides, fades and darkens;
    the repeats wrap round, so the loop stays seamless"""
    out = np.zeros_like(x)
    cur = x.copy()
    for k in range(1, repeats + 1):
        cur = cfilter(cur, hi=7000 * darken ** k)
        echo = np.roll(cur, int(round(step * k * SR)), axis=0) * feedback ** k
        out += echo[:, ::-1] if k % 2 else echo
    return out


def place(buf, t, sig, pan=0.0, gain=1.0):
    """add a mono or stereo sound at time t, wrapping round the loop; pan -1 left .. 1 right"""
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.stack([sig * np.cos(a), sig * np.sin(a)], axis=1)
    i0 = int(round((t % LOOP) * SR))
    idx = (i0 + np.arange(len(sig))) % N
    np.add.at(buf, idx, sig * gain)


def env(n, a=0.005, d=0.2, curve=1.0):
    tt = np.arange(n) / SR
    return np.minimum(1, tt / max(a, 1e-4)) * np.exp(-tt / max(d, 1e-4)) ** curve


def crush(x, bits=5, hold=3):
    """bit-crush and sample-hold: the glitch grit"""
    q = 2 ** (bits - 1)
    y = np.round(x * q) / q
    return np.repeat(y[::hold], hold)[: len(x)]


# ---------------- the reed organ ----------------
def reed(f, n_harm=40, nasal=1400):
    """one reed: a band-limited buzzy wave, its harmonics shaped toward a nasal reed formant"""
    out = np.zeros(N)
    for k in range(1, n_harm + 1):
        fk = f * k
        if fk > 9000:
            break
        w = (1 / k) * (1 + 1.6 * np.exp(-((fk - nasal) / 700) ** 2)) * (1.0 if k % 2 else 0.7)
        out += w * np.sin(2 * np.pi * snap(fk) * T + RNG.uniform(0, 2 * np.pi))
    return out


# four chords, a bar of 3 s each: major seventh with a sharp eleven, sliding in parallel by odd steps
CHORDS = [
    [50, 57, 64, 68, 73],    # D:  D A E G# C#
    [46, 53, 60, 64, 69],    # Bb: Bb F C E A   (down a major third)
    [48, 55, 62, 66, 71],    # C:  C G D F# B   (up a tone)
    [44, 51, 58, 62, 67],    # Ab: Ab Eb Bb D G (down a major third: the strangest, a tritone from home)
]
BAR = LOOP / len(CHORDS)


BREATH = LOOP / 2      # two long breaths of the bellows per loop (Robin: longer breaths)


def breath(k):
    """breath k: drawn in slowly over 2.4 s, swelling a little through the middle, let out slowly into the next"""
    t = (T - k * BREATH) % LOOP
    rise = 0.5 - 0.5 * np.cos(np.pi * np.clip(t / 2.4, 0, 1))
    fall = 0.5 + 0.5 * np.cos(np.pi * np.clip((t - (BREATH - 1.2)) / 2.4, 0, 1))
    swell = 1 + 0.15 * np.sin(np.pi * np.clip(t / (BREATH + 1.2), 0, 1))
    return rise * fall * swell * (t < BREATH + 1.2)


def chord_gate(i, xf=0.6):
    """chord i sounds through its bar, crossfading legato into the next (raised cosine, wrapping round)"""
    t = (T - i * BAR + xf / 2) % LOOP
    up = 0.5 - 0.5 * np.cos(np.pi * np.clip(t / xf, 0, 1))
    down = 0.5 + 0.5 * np.cos(np.pi * np.clip((t - BAR) / xf, 0, 1))
    return up * down * (t < BAR + xf)


def organ():
    out = np.zeros((N, 2))
    wind = breath(0) + breath(1)
    for i, chord in enumerate(CHORDS):
        b = chord_gate(i) * wind
        for j, m in enumerate(chord):
            f = midi(m)
            # two reeds a few hertz apart: the beating shimmer of an accordion's musette
            beat = 2.4 + 0.6 * j
            lo, hi = reed(snap(f - beat / 2)), reed(snap(f + beat / 2))
            l, r = lo + 0.8 * hi, hi + 0.8 * lo
            g = 0.9 / (1 + 0.25 * j)
            out[:, 0] += l * b * g
            out[:, 1] += r * b * g
    out = cfilter(out, lo=70, hi=5200)
    # air through the bellows: breathy noise that rushes as the bellows turn, between the two breaths
    air = cfilter(RNG.standard_normal((N, 2)), lo=900, hi=5000)
    rush = sum(np.exp(-(((T - k * BREATH - BREATH + 0.2 + LOOP / 2) % LOOP - LOOP / 2) / 0.45) ** 2) for k in range(2))
    out += air * (0.05 + 0.35 * rush)[:, None] * np.abs(out).mean() / (np.abs(air).mean() + 1e-9) * 0.25
    return out / np.abs(out).max()


# ---------------- glitches cut from the organ ----------------
def glitches(src):
    out = np.zeros((N, 2))
    grid = 1 / 8
    for slot in range(int(LOOP / grid)):
        if RNG.random() > 0.14:
            continue
        t0 = slot * grid
        g_len = int(SR * RNG.uniform(0.025, 0.06))
        start = int(RNG.uniform(0, LOOP) * SR)
        grain = src[(start + np.arange(g_len)) % N, 0] * np.hanning(g_len)
        reps = RNG.integers(3, 7)
        seq = np.concatenate([grain * (0.85 ** r) for r in range(reps)])
        seq = crush(seq, bits=int(RNG.integers(4, 7)), hold=int(RNG.integers(2, 6)))
        place(out, t0, seq, pan=RNG.uniform(-0.8, 0.8), gain=0.5)
    return out


# ---------------- event sounds ----------------
def tone(f, dur, wavef='sine', a=0.003, d=0.15):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    ph = 2 * np.pi * f * tt
    w = np.sin(ph) if wavef == 'sine' else (2 / np.pi) * np.arcsin(np.sin(ph)) if wavef == 'tri' else np.sign(np.sin(ph)) * 0.6
    return w * env(n, a, d)


def sweep(f0, f1, dur, wavef='sine', d=None):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (tt / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    w = np.sin(ph) if wavef == 'sine' else np.sign(np.sin(ph)) * 0.5
    return w * env(n, 0.004, d or dur)


def bell(f, dur=1.4, ratio=3.5, index=2.2):
    n = int(SR * dur)
    tt = np.arange(n) / SR
    mod = index * np.exp(-tt / 0.5) * np.sin(2 * np.pi * f * ratio * tt)
    return np.sin(2 * np.pi * f * tt + mod) * env(n, 0.002, dur / 3.5)


def pluck(f, dur=0.6):
    """Karplus-Strong: a short plucked string"""
    n = int(SR * dur)
    p = max(2, int(SR / f))
    buf = RNG.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * env(n, 0.001, 0.25)


def noise_sweep(dur, f0, f1, gain=1.0):
    n = int(SR * dur)
    x = RNG.standard_normal(n)
    # a moving band: crude, done as a sum of short filtered chunks
    out = np.zeros(n)
    k = 8
    for c in range(k):
        a, b = c * n // k, (c + 1) * n // k
        fc = f0 * (f1 / f0) ** ((c + 0.5) / k)
        X = np.fft.rfft(x[a:b])
        fr = np.fft.rfftfreq(b - a, 1 / SR)
        X *= np.exp(-((fr - fc) / (fc * 0.35)) ** 2)
        out[a:b] = np.fft.irfft(X, n=b - a)
    return out / (np.abs(out).max() + 1e-9) * np.sin(np.pi * np.arange(n) / n) * gain


# --reverse-breath: the bellows (organ and air) play backwards while every event still plays forwards (Robin,
# 2026-10-25: "played the breath backwards but the other sounds forward"). The bed is reflected about t = 0, so
# its chords change on the same beats, in reverse order.
REVERSE_BREATH = '--reverse-breath' in sys.argv


def chord_at(t):
    """the chord sounding at time t: every voiced event plays a note of it, so each note belongs to something
    happening in the picture and sits in the bellows' harmony"""
    if REVERSE_BREATH:
        t = LOOP - (t % LOOP) - 1e-6
    return CHORDS[int((t % LOOP) // BAR) % len(CHORDS)]


def tone_of(t, k, octave=2):
    """the k-th note (counting up through the chord, wrapping into the next octave) of the chord at time t"""
    ch = sorted(chord_at(t))
    return ch[k % len(ch)] + 12 * (octave + k // len(ch))


def events(cues):
    out = np.zeros((N, 2))
    pan = lambda x: float(np.clip((x - 960) / 960, -1, 1)) * 0.85
    for c in cues:
        t, k, p = c['t'] + FRAME, c['kind'], pan(c['x'])
        if k == 'glyph':
            f = midi(tone_of(c['t'], c['n'] % 10, 1))          # climbing up through the chord as the song goes
            s = crush(tone(f, 0.05, 'tri', d=0.025), bits=6, hold=2)
            place(out, t, s, p, 0.10)
        elif k == 'chime':
            place(out, t, bell(midi(tone_of(c['t'], 4, 1)), 1.6), p, 0.20)
        elif k == 'fold':
            place(out, t, crush(sweep(1800, 300, 0.45, 'square', d=0.3), bits=5, hold=3), p, 0.09)
        elif k == 'form':
            place(out, t, sweep(300, 900, 0.22, d=0.12), p, 0.18)
            place(out, t + 0.02, bell(midi(tone_of(c['t'], 2, 2)), 1.0, ratio=2.0, index=1.2), p, 0.10)
        elif k == 'offer':
            n = int(SR * c.get('dur', 1.2))
            sw = sum(tone(midi(tone_of(c['t'], q, 1)), c.get('dur', 1.2), 'tri', a=0.5, d=0.9) for q in (0, 2, 3, 4))
            place(out, t, sw * np.sin(np.pi * np.arange(n) / n), p, 0.05)
        elif k == 'rise':
            place(out, t, noise_sweep(0.7, 800, 5000, 0.12), p)
        elif k == 'drop':
            place(out, t, pluck(midi(tone_of(c['t'], [0, 1, 0, 2][c['n'] % 4], 1)), 0.7), 0.0, 0.22)
        elif k == 'release':
            place(out, t, crush(tone(midi(tone_of(c['t'], 4, 2)), 0.03, 'sine', d=0.012), bits=4, hold=4), p, 0.07)
        elif k == 'bulge':
            dur, side = c.get('dur', 3.2), c.get('side', 1)
            place(out, t, sweep(140, 70, 0.3, d=0.14), side * 0.2, 0.22)
            # the swell travels the pipe: a soft band of air panned out and back in along it
            body = noise_sweep(dur, 300, 900, 0.035)
            n = len(body)
            pp = side * 0.75 * np.sin(np.pi * np.arange(n) / n)
            a = (pp + 1) * np.pi / 4
            place(out, t, np.stack([body * np.cos(a), body * np.sin(a)], axis=1), 0, 1.0)
        elif k == 'tick':
            # each elf its own chord tone; the high crossing a little brighter than the low
            place(out, t, tone(midi(tone_of(c['t'], 2 + c['n'], 1)), 0.05, 'tri', d=0.02), p, 0.045 if c.get('high') else 0.03)
        elif k == 'swap':
            # the chorus changing places: the hop's air, the elf reaching the front sounding its own note of the
            # chord, and on a chord change the chord's root plucked low under it
            place(out, t - 0.3, noise_sweep(0.35, 500, 2500, 0.05), 0.0)
            place(out, t, bell(midi(tone_of(c['t'], c['n'] % 5, 2)), 1.1, ratio=2.0, index=1.0), 0.0, 0.13)
            if c.get('chord'):
                place(out, t, pluck(midi(tone_of(c['t'], 0, 0)), 0.9), 0.0, 0.2)
        elif k == 'pop':
            place(out, t, crush(sweep(1200, 180, 0.12, d=0.06), bits=6, hold=2), p, 0.16)
        elif k == 'lever':
            click = RNG.standard_normal(int(SR * 0.02)) * env(int(SR * 0.02), 0.0005, 0.004)
            place(out, t, cfilter_short(click, 1500), p, 0.18)
            place(out, t + 0.09, cfilter_short(click, 900), p, 0.12)
        elif k == 'cube':
            place(out, t, bell(midi(tone_of(c['t'], 3, 2)), 1.2, ratio=1.5), p, 0.12)
            place(out, t + 0.1, noise_sweep(0.8, 1000, 6000, 0.08), p)
    return out


def cfilter_short(x, fc):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= np.exp(-((f - fc) / (fc * 0.6)) ** 2)
    return np.fft.irfft(X, n=len(x)) * 4


def main():
    root = Path(__file__).resolve().parent.parent
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    cues_path = root / (args[0] if args else 'out/loop-cues.json')
    out_path = root / (args[1] if len(args) > 1 else 'out/audio/reliefloop_loop.wav')
    cues = json.loads(cues_path.read_text())['cues']

    bed = organ()
    if REVERSE_BREATH:
        # x[(-n) mod N]: time-reversed on the loop's circle, so sample 0 stays put and the seam stays closed
        bed = np.roll(bed[::-1], 1, axis=0)
    glitch = glitches(bed)
    ev = events(cues)
    dry = 0.5 * bed + 0.2 * glitch + ev
    # a ping-pong echo on the events and glitches (and a little of the organ), then everything into a long hall
    echo = cdelay(0.75 * ev + 0.6 * glitch + 0.12 * bed)
    wet = creverb(0.5 * bed + 0.35 * glitch + 0.9 * ev + 0.6 * echo, decay=6.0, pre=0.04)
    mix = dry + 0.45 * echo + 0.95 * wet
    mix = cfilter(mix, lo=35, hi=15000)
    # level: about -18 dBFS RMS, peaks held under -1 dBFS by a soft clip
    mix *= 10 ** (-18 / 20) / np.sqrt((mix ** 2).mean())
    mix = np.tanh(mix / 0.89) * 0.89
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(out_path), 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    seam = np.abs(mix[0] - mix[-1]).max()
    step = np.median(np.abs(np.diff(mix, axis=0)))
    print(f'{out_path.relative_to(root)}: {LOOP:.0f} s, {len(cues)} cues, rms {20 * np.log10(np.sqrt((mix ** 2).mean())):.1f} dBFS, '
          f'peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS, seam jump {seam:.4f} vs median step {step:.4f}')


if __name__ == '__main__':
    main()
