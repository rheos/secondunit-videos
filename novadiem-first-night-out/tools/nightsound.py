#!/usr/bin/env python3
"""nightsound.py · the night sound for a First Night Out scene, made in code (no score: Robin, Oct 25).

    <viralvision venv python> -I tools/nightsound.py assets/creek_cues.json -o assets/creek_sound.wav [--seed 7]

A bed (the creek's water and its bubbles, crickets near and far, a chorus frog, one distant owl) under the events
the scene reports (tools/cues.mjs): paws into and out of the water, washing strokes, sniffs, the slap and its drops,
the raccoons' voices. Every event's onset lands one frame (1/24 s) after its cue. 48 kHz stereo, 24-bit, peak under
-1 dBFS; panned by the cue's x in film px. Deterministic: same cues and seed, same file.
"""
import argparse
import json

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
FRAME = 1 / 24


def band(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def low(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def high(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def pan(sig, p):
    """equal-power pan, p in -1 (left) .. 1 (right)"""
    p = float(np.clip(p, -1, 1))
    return np.stack([sig * np.cos((p + 1) * np.pi / 4), sig * np.sin((p + 1) * np.pi / 4)], 1)


def place(buf, sig, t):
    i = int(round(t * SR))
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), len(buf) - i)
    if n > 0:
        buf[i:i + n] += sig[:n]


def pan_of(x):
    return (x / 1920) * 1.6 - .8


def env(n, attack, decay_tau):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay_tau)


# ---------------- sound sources ----------------
def bubble(rng, f0, amp, dur=None):
    """a water bubble (after van den Doel): a sine whose pitch rises as it decays"""
    tau = 1 / (0.043 * f0 + 0.0014 * f0 ** 1.5)
    dur = dur or min(.12, tau * 6)
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + 0.1 * f0 * t)
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / tau)


def noise_burst(rng, dur, lo, hi, attack, tau, amp):
    n = int(dur * SR)
    return amp * band(rng.normal(size=n), lo, hi) * env(n, attack, tau)


def creek(rng, n):
    """the water: a band of filtered noise breathing slowly, under a stream of bubbles, wider on the right where the
    creek crosses the foreground"""
    out = np.zeros((n, 2))
    for ch in (0, 1):
        w = band(rng.normal(size=n), 220, 2600) * .026
        w *= 1 + .25 * np.sin(2 * np.pi * (.27 + .05 * ch) * np.arange(n) / SR + ch)
        out[:, ch] += w * (.8 if ch == 0 else 1.1)
    hiss = high(rng.normal(size=n), 2500) * .012                      # the far cascades
    out += pan(hiss, .3)
    t = 0.0
    while t < n / SR:
        t += rng.exponential(1 / 70)
        f0 = float(np.exp(rng.uniform(np.log(420), np.log(2400))))
        b = bubble(rng, f0, float(np.exp(rng.uniform(np.log(.004), np.log(.016)))))
        place(out, pan(b, rng.uniform(-.2, .9)), t)
    return out


def crickets(rng, n, voices=6, far=10):
    """field crickets: each a sine near 4.5 kHz chirping three or four pulses at a time, two or three chirps a second;
    a fainter, softer chorus of far ones behind"""
    out = np.zeros((n, 2))
    for v in range(voices + far):
        is_far = v >= voices
        f = rng.uniform(4200, 5200)
        rate = rng.uniform(2.1, 3.2)
        amp = rng.uniform(.006, .014) * (.35 if is_far else 1)
        p = rng.uniform(-.95, .95)
        sig = np.zeros(n)
        t = rng.uniform(0, .5)
        while t < n / SR:
            if rng.random() > .08:                                      # the odd skipped chirp
                for k in range(rng.integers(3, 5)):
                    pl = int(.013 * SR)
                    tt = np.arange(pl) / SR
                    pulse = (np.sin(2 * np.pi * f * tt) + .22 * np.sin(4 * np.pi * f * tt)) * np.hanning(pl)
                    i = int((t + k * .027) * SR)
                    if i + pl < n:
                        sig[i:i + pl] += pulse * amp
            t += 1 / rate * rng.uniform(.88, 1.12)
        if is_far:
            sig = low(sig, 5200)
        out += pan(sig, p)
    return out


def frog(rng, n, t0, every, amp, p):
    """a Pacific chorus frog away up the bank: a two-part 'rib-bit', each part a quick buzz of pulses"""
    out = np.zeros((n, 2))
    t = t0
    while t < n / SR:
        for part, (dur, f) in enumerate([(.07, 1350), (.11, 1550)]):
            m = int(dur * SR)
            tt = np.arange(m) / SR
            buzz = np.sign(np.sin(2 * np.pi * 70 * tt)) * .5 + .5
            tone = band(np.sin(2 * np.pi * f * tt) * buzz + .3 * rng.normal(size=m), 900, 2600)
            place(out, pan(tone * amp * np.hanning(m), p), t + part * .1)
        t += every * rng.uniform(.8, 1.25)
    return out


def owl(rng, t0, amp, p):
    """a great horned owl far off: hoo, h-hoo, hoo, hoo"""
    notes = [(0, .32), (.55, .14), (.72, .3), (1.15, .3), (1.6, .34)]
    total = int(2.2 * SR)
    sig = np.zeros(total)
    for st, d in notes:
        m = int(d * SR)
        tt = np.arange(m) / SR
        f = 310 * (1 - .06 * tt / d)
        tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + .25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
        e = np.minimum(1, tt / .05) * np.minimum(1, (d - tt) / .08)
        i = int(st * SR)
        sig[i:i + m] += tone * e
    sig = low(sig + .05 * rng.normal(size=total) * (np.abs(sig) > .05), 900)
    return t0, pan(sig * amp, p)


def voice_chirps(rng, count, rate, f_hi, f_lo, dur, amp, formant=(1500, 5200)):
    """raccoon chitter: a run of short descending chirps, each a buzzy harmonic tone shaped by a formant band"""
    total = int((count / rate + dur + .05) * SR)
    sig = np.zeros(total)
    for c in range(count):
        m = int(dur * SR * rng.uniform(.85, 1.15))
        tt = np.arange(m) / SR
        f = np.linspace(f_hi, f_lo, m) * rng.uniform(.93, 1.07)
        ph = 2 * np.pi * np.cumsum(f) / SR
        tone = sum(np.sin(h * ph) / h for h in (1, 2, 3, 4))
        e = np.minimum(1, tt / .006) * np.exp(-tt / (dur * .5))
        i = int(c / rate * SR * rng.uniform(.95, 1.05))
        sig[i:i + m] += tone * e * rng.uniform(.7, 1)
    return amp * band(sig + .08 * rng.normal(size=total), *formant)


def churr(rng, amp):
    """the parent's soft churr over the crayfish: a low purring trill"""
    m = int(.5 * SR)
    tt = np.arange(m) / SR
    am = .5 + .5 * np.sign(np.sin(2 * np.pi * 27 * tt))
    tone = (np.sin(2 * np.pi * 380 * tt) + .5 * np.sin(2 * np.pi * 760 * tt) + .3 * rng.normal(size=m)) * am
    return amp * band(tone, 250, 1600) * np.hanning(m)


def event(rng, c):
    """one cue's sound: (signal, onset offset)"""
    k, kid = c['k'], c.get('who') == 'kit'
    if k == 'pawIn':
        s = bubble(rng, rng.uniform(260, 420) * (1.5 if kid else 1), .09)
        s = np.pad(s, (0, max(0, int(.05 * SR) - len(s))))
        s[:int(.04 * SR)] += noise_burst(rng, .04, 900, 6000, .002, .012, .05)
        return s
    if k == 'pawOut':                                                   # water running off the paws: a few drips
        out = np.zeros(int(.6 * SR))
        for _ in range(rng.integers(3, 6)):
            place2 = int(rng.uniform(.02, .5) * SR)
            b = bubble(rng, rng.uniform(900, 1900), .09)
            out[place2:place2 + len(b)] += b[:len(out) - place2]
        return out
    if k == 'dab':                                                      # a washing stroke: a small slosh
        s = noise_burst(rng, .09, 500 * (1.4 if kid else 1), 2600, .01, .03, .15)
        b = bubble(rng, rng.uniform(600, 1400), .07)
        s[:len(b)] += b[:len(s)]
        return s
    if k == 'sniff':
        s = np.zeros(int(.2 * SR))
        for j in range(2):
            puff = noise_burst(rng, .055, 1500 * (1.3 if kid else 1), 4800, .008, .02, .17 * (.8 if kid else 1))
            i = int(j * .09 * SR)
            s[i:i + len(puff)] += puff
        return s
    if k == 'splash':
        n = int(.9 * SR)
        s = noise_burst(rng, .9, 200, 9000, .004, .16, .32)
        tt = np.arange(int(.12 * SR)) / SR
        s[:len(tt)] += .2 * np.sin(2 * np.pi * np.cumsum(np.linspace(120, 55, len(tt))) / SR) * np.exp(-tt / .05)
        for _ in range(26):
            i = int(rng.uniform(0, .55) * SR)
            b = bubble(rng, rng.uniform(500, 2200), rng.uniform(.03, .07))
            s[i:i + len(b)] += b[:n - i]
        return s
    if k == 'drop':                                                     # a drop landing: a tiny plink, smaller drops higher
        return bubble(rng, 3400 - c.get('size', 6) * 220 + rng.uniform(-200, 200), .045)
    if k == 'churr':
        return churr(rng, .15)
    if k == 'chitter':
        return voice_chirps(rng, 7, 11, 3300, 2200, .045, .16)
    if k == 'squeak':
        return voice_chirps(rng, 1, 1, 2400, 3900, .09, .08)
    if k == 'huff':
        return noise_burst(rng, .09, 350, 1500, .006, .03, .06)
    if k == 'sneeze':
        s = np.zeros(int(.3 * SR))
        inh = noise_burst(rng, .1, 900, 3000, .06, .2, .012)
        s[:len(inh)] += inh
        pf = noise_burst(rng, .14, 1000, 3800, .002, .04, .2)
        i = int(.12 * SR)
        s[i:i + len(pf)] += pf
        return s
    if k == 'shake':                                                    # a head shake: ears flapping, water flicked off
        d = c.get('dur', .6)
        m = int(d * SR)
        tt = np.arange(m) / SR
        s = band(rng.normal(size=m), 700, 3200) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 21 * tt))) * np.hanning(m) * .1
        for _ in range(7):
            i = int(rng.uniform(.05, d) * SR)
            b = bubble(rng, rng.uniform(1600, 3200), .04)
            s[i:i + len(b)] += b[:m - i]
        return s
    raise ValueError(k)


def room(sig, rng, tail=.7, wet=.14):
    """a little outdoor air: a short decaying noise tail, mostly early reflections off the banks"""
    m = int(tail * SR)
    tt = np.arange(m) / SR
    out = np.zeros_like(sig)
    for ch in (0, 1):
        ir = rng.normal(size=m) * np.exp(-tt / (tail / 5))
        ir[0] = 0
        ir = low(ir, 4500) / np.sqrt(np.sum(ir ** 2))
        out[:, ch] = fftconvolve(sig[:, ch], ir)[:len(sig)]
    return sig + wet * out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cues')
    ap.add_argument('-o', '--out', required=True)
    ap.add_argument('--seed', type=int, default=7)
    ap.add_argument('--stems', action='store_true', help='also write the bed and the events as their own files')
    ap.add_argument('--owl', type=float, default=6.6, help='when the owl calls, seconds (negative: no owl)')
    a = ap.parse_args()
    data = json.load(open(a.cues))
    end = data.get('end') or 9
    n = int(end * SR)
    rng = np.random.default_rng(a.seed)

    bed = creek(rng, n) + crickets(rng, n) + frog(rng, n, .8, 2.6, .012, -.75)
    if a.owl >= 0:
        t0, o = owl(rng, a.owl, .03, -.6)
        o = room(o, rng, tail=1.4, wet=.5)
        place(bed, o, t0)
    ev = np.zeros((n, 2))
    placed = []
    for c in data['cues']:
        s = event(rng, c)
        place(ev, pan(s, pan_of(c.get('x', 960))), c['t'] + FRAME)       # onset one frame after the cue
        placed.append({'k': c['k'], 'cue': round(c['t'], 4), 'onset': round(c['t'] + FRAME, 4)})
    ev = room(ev, rng)
    mix = bed + ev
    # fade the edges a hair so the cut has no click
    f = int(.03 * SR)
    mix[:f] *= np.linspace(0, 1, f)[:, None]
    mix[-f:] *= np.linspace(1, 0, f)[:, None]
    peak = np.max(np.abs(mix))
    if peak > .89:
        mix *= .89 / peak
    sf.write(a.out, mix, SR, subtype='PCM_24')
    if a.stems:                                                         # the bed and the events apart, for checking
        g = .89 / peak if peak > .89 else 1
        sf.write(a.out.rsplit('.', 1)[0] + '_bed.wav', bed * g, SR, subtype='PCM_24')
        sf.write(a.out.rsplit('.', 1)[0] + '_events.wav', ev * g, SR, subtype='PCM_24')
    json.dump({'events': placed, 'peak_dbfs': round(20 * np.log10(np.max(np.abs(mix)) + 1e-12), 2)}, open(a.out.rsplit('.', 1)[0] + '_placed.json', 'w'), indent=1)
    print(f'{a.out}: {end:.2f} s, {len(placed)} events, peak {20 * np.log10(np.max(np.abs(mix))):.1f} dBFS')


if __name__ == '__main__':
    main()
