"""voice.py · a small formant voice for the living loop: the "doiy" and "dee" syllables of the Sohan icaro.

Measured on Robin's recording (vocal separated with Demucs, 123 bursts, 2026-10-25): hits about 192 ms apart, each
a "d" then a vowel; "doiy" slides the second formant from about 860 Hz ("o") to 1850 Hz ("ee") through the note,
"dee" holds it near 2000 Hz; the pitch holds steady through each hit, the singer tuned 17 cents above A440.

Robin, on hearing the first version: "they should have long tails.. and it's also like the sound of a spring
doorstop when it's kicked sideways". So each syllable rings on past the next hit, decaying slowly, and the pitch
twangs: a fast wobble (about 18 a second) that dies away over the first quarter second, with a flutter of loudness
at the same rate and a faint inharmonic ring, as a kicked doorstop spring does.

A syllable is a glottal buzz (harmonics falling about 12 dB an octave, a little jitter, a scoop into the note, a
breath of aspiration) through four vocal-tract resonances whose centres move as the measured ones do, after a short
"d": a closure, a soft click, and the second formant sliding in from the "d" locus.

    from voice import syllable;  syllable(midi, 'doiy', dur=0.19)
"""
import numpy as np
from scipy.signal import lfilter

SR = 48000
TUNE = 0.17                # her tuning, in semitones above A440
RNG = np.random.default_rng(7)

# formant tracks: (F1, F2, F3, F4) at the vowel's start and end, with bandwidths
VOWELS = {
    'doiy': ((420, 860, 2450, 3400), (310, 1880, 2800, 3500)),
    'dee':  ((300, 2020, 2850, 3500), (300, 2020, 2850, 3500)),
    'oh':   ((420, 900, 2450, 3400), (400, 860, 2450, 3400)),
}
BW = (70, 95, 140, 200)
D_LOCUS = 1700             # where F2 starts after a "d"


def hz(midi):
    return 440.0 * 2 ** ((midi + TUNE - 69) / 12)


def syllable(midi, kind='doiy', dur=0.19, tail=1.1, decay=0.38, wobble=18.0, twang=0.9, gain=1.0):
    """one sung syllable, mono: the vowel shapes over the first dur seconds, then rings on for `tail` more,
    decaying (time constant `decay`); `twang` semitones of spring wobble at `wobble` Hz, dying away"""
    nv = int(SR * (dur + tail))
    n = nv
    t = np.arange(nv) / SR
    # pitch: a quick scoop up into the note, the spring's twang dying away, and a whisper of jitter
    spring = twang * np.exp(-t / 0.22) * np.sin(2 * np.pi * wobble * t)
    f0 = hz(midi) * 2 ** ((-0.35 * np.exp(-t / 0.018) + spring + 0.03 * np.cumsum(RNG.standard_normal(nv)) / np.sqrt(np.arange(1, nv + 1)) * 0.2) / 12)
    ph = 2 * np.pi * np.cumsum(f0) / SR
    src = np.zeros(nv)
    for k in range(1, 60):
        if hz(midi) * k > 7000:
            break
        src += np.sin(k * ph) / k ** 2.0 * (1.0 if k > 1 else 0.7)
    src += 0.02 * RNG.standard_normal(nv)                       # aspiration
    # the vowel: formant centres moving from start to end; "doiy" slides through the middle of the note
    (a, b) = VOWELS[kind]
    u = np.clip((t / dur - 0.3) / 0.6, 0, 1)
    glide = u * u * (3 - 2 * u) if kind == 'doiy' else np.clip(t / dur, 0, 1)
    tracks = [a[i] + (b[i] - a[i]) * glide for i in range(4)]
    # the "d": F2 slides in from the locus over the first 35 ms
    tracks[1] = tracks[1] + (D_LOCUS - tracks[1]) * np.exp(-t / 0.012)
    out = src
    blk = 120
    for i in range(4):
        y = np.zeros(nv)
        zi = np.zeros(2)
        for s in range(0, nv, blk):
            fc, bw = tracks[i][s], BW[i]
            r = np.exp(-np.pi * bw / SR)
            a1, a2 = -2 * r * np.cos(2 * np.pi * fc / SR), r * r
            y[s:s + blk], zi = lfilter([1 - r], [1, a1, a2], out[s:s + blk], zi=zi)
        out = y   # cascade: each resonance filters the last one's output
    # envelope: the "d" closure, its click, a fast rise, then a long ring dying away, fluttering with the spring;
    # the very end is faded so it can't click
    flutter = 1 + 0.35 * np.exp(-t / 0.3) * np.sin(2 * np.pi * wobble * t + 1.0)
    env = np.minimum(1, np.maximum(0, (t - 0.012) / 0.012)) * np.exp(-np.maximum(0, t - dur * 0.5) / decay) * flutter
    env *= np.minimum(1, (nv / SR - t) / 0.08)
    voice = out * env
    # the spring's own metal: two inharmonic partials, rung by the kick, quick to fade
    f = hz(midi)
    voice += 0.05 * np.exp(-t / 0.18) * (np.sin(2 * np.pi * f * 2.76 * t) + 0.6 * np.sin(2 * np.pi * f * 5.4 * t)) * np.abs(out).max()
    voice /= np.abs(voice).max() + 1e-9
    click = np.zeros(nv)
    k = int(0.012 * SR)
    burst = RNG.standard_normal(int(0.006 * SR)) * np.hanning(int(0.006 * SR))
    click[k:k + len(burst)] = lfilter([1, -0.95], [1], burst) * 0.25
    return (voice + click) * gain
