# Sound design for the reel: every hit synthesised here (no samples, no licences), placed one frame after the
# visual event it belongs to, then mixed under the score and limited.
#   viralvision venv python -I sfx.py   ->  assets/sfx.wav, assets/mix.wav (render with AUDIO=assets/mix.wav)
# Event times mirror js/shots.js and js/draft.js (same beat grid constants); change them together.
# The score edit: take-02 with bars 0-4 played twice (room for the drafting opening, SHIFT = 4 bars), then the
# rest, then a coda from the track's own hushed intro under the longer title block.
import os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 48000; DUR = 76.0; N = int(SR * DUR); FR = 1 / 24
here = os.path.dirname(os.path.abspath(__file__))
B0 = 6.41; HB = (53.55 - 6.41) / 138; BEAT = 2 * HB; BAR = 4 * BEAT
bar = lambda n: B0 + n * BAR; bt = lambda n: B0 + n * BEAT
rng = np.random.default_rng(7)
out = np.zeros((N, 2))

def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def put(t, x, gain_db=0, pan=0.0):
    i = int(round((t + FR) * SR)); g = 10 ** (gain_db / 20); x = x[: max(0, N - i)]
    if i < 0 or not len(x): return
    out[i:i + len(x), 0] += x * g * (1 - max(0, pan)); out[i:i + len(x), 1] += x * g * (1 + min(0, pan))
def noise(sec): return rng.standard_normal(int(sec * SR))
def tone(f, sec, ph=0): t = np.arange(int(sec * SR)) / SR; return np.sin(2 * np.pi * f * t + ph)

# --- sounds ---
def thump(depth=1.0):                     # low body hit (stamp, title slam)
    n = int(.5 * SR); t = np.arange(n) / SR; f = 55 + 70 * np.exp(-t * 30)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .12)
    snap = bp(noise(.5), 600, 4000) * env(n, .001, .018) * .5
    return (body * depth + snap) * .9
def tick(bright=4000, d=.012): x = bp(noise(.06), bright * .6, min(bright * 1.6, 20000)); return x * env(len(x), .0005, d)
def pen(sec):                             # drafting pen on paper
    x = bp(noise(sec), 1800, 7000); t = np.arange(len(x)) / SR
    mod = .55 + .45 * np.abs(np.sin(2 * np.pi * 3.1 * t + np.sin(2 * np.pi * .7 * t)))
    fade = np.minimum(1, t / .08) * np.minimum(1, (sec - t) / .15)
    return x * mod * fade * .35
def whoosh(sec, rev=False):
    x = noise(sec); t = np.arange(len(x)) / SR; e = np.sin(np.pi * t / sec) ** 2
    if rev: e = (t / sec) ** 2.5 * np.minimum(1, (sec - t) / .05)
    lo = bp(x, 200, 1200) * e; hi = bp(x, 1500, 6000) * e * .4
    return (lo + hi) * .5
def chime(f=880, sec=1.2): return (tone(f, sec) + .35 * tone(f * 2.76, sec) + .2 * tone(f * 5.4, sec)) * env(int(sec * SR), .003, .35) * .25
def relays(sec, rate=22):
    x = np.zeros(int(sec * SR))
    for k in range(int(sec * rate)):
        i = int(rng.uniform(0, len(x) - 3000)); c = tick(rng.uniform(2500, 6000), rng.uniform(.004, .012)); x[i:i + len(c)] += c * rng.uniform(.4, 1)
    return x
def hum(sec, f=60):
    t = np.arange(int(sec * SR)) / SR
    x = .5 * np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2 * f * t) + .15 * np.sin(2 * np.pi * 3 * f * t)
    x += .08 * bp(noise(sec), 7000, 9000)              # faint flyback whine
    return x * np.minimum(1, t / .25) * np.minimum(1, (sec - t) / .3) * .25
def crt_on(): n = int(.9 * SR); t = np.arange(n) / SR; return (bp(noise(.9), 300, 3000) * env(n, .001, .05) * .8 + tone(40, .9) * env(n, .001, .2) * .7)
def static(sec): x = bp(noise(sec), 1000, 9000); t = np.arange(len(x)) / SR; return x * (np.abs(np.sin(2 * np.pi * 9 * t)) ** 3) * np.sin(np.pi * t / sec) * .6
def blip_down(): n = int(.35 * SR); t = np.arange(n) / SR; f = 900 * np.exp(-t * 9) + 60; return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .12) * .4
def crowd(sec):                           # a stadium murmur: many voices as filtered noise, slow swells
    x = bp(noise(sec), 250, 1800); t = np.arange(len(x)) / SR
    sw = .6 + .4 * np.sin(2 * np.pi * .7 * t) * np.sin(2 * np.pi * .23 * t + 1)
    return x * sw * np.minimum(1, t / .4) * np.minimum(1, (sec - t) / .6) * .5
def ratchet(t0, t1, n0=3, n1=14):            # clock hand sweeping: ticks speeding up
    tt = t0; k = 0
    while tt < t1:
        put(tt, tick(3200, .006), -20 + 6 * (tt - t0) / (t1 - t0), pan=-.1); k += 1
        tt += 1 / (n0 + (n1 - n0) * ((tt - t0) / (t1 - t0)))

# --- the cue sheet (score seconds of the extended edit) ---
S = 4 * BAR                                            # later plates sit at their old time + S
PL_B, PL_C, PL_D, PL_E, PL_F = bar(1) + S, bar(5) + S, bar(8) + 2 * BEAT + S, bar(12) + S, bar(15) + S
# the drafting (js/draft.js)
put(1.6, pen(1.2), -26, pan=-.2)                       # construction lines
put(2.4, pen(1.5), -22, pan=.1)                        # the outlines of both halves
put(3.8, pen(1.6), -24, pan=-.2)                       # lid lenses inked from the centre
put(4.9, pen(1.5), -24, pan=.2)                        # bowl lenses
put(6.2, pen(.7), -25)                                 # the floating cup
put(6.8, tick(3000, .03), -18)                         # the initiator drops in
put(7.2, pen(1.4), -26, pan=.1)                        # casing, detonators
put(8.4, pen(1.2), -24, pan=-.4)                       # the wires
for i in range(16): put(9.4 + i * .09, tick(4200, .008), -26, pan=.25)              # labels
put(10.8, thump(.5), -20)                              # THE BOMB
put(bt(7), thump(.8), -14, pan=-.3)                    # the core ringed: Hanford plutonium
put(12.6, whoosh(.9), -21)                             # scan bar: the original sheet
put(13.95, whoosh(.6, rev=True), -23)                  # paper swept off
put(4.95 + S, thump(1.0), -14)                         # ROMANCING
put(bt(1) + S, chime(880), -20)                        # the heart
put(PL_B + .8, thump(.7), -16, pan=-.3)                # the stamp lands
for k in (5, 6, 7): put(bt(k) + S, tick(5000, .01), -20, pan=.3)   # quote lines
put(bar(3) + .6 + S, tick(5000, .01), -20, pan=-.2)
put(bt(15) + S, tick(5000, .01), -20, pan=.2)
put(bt(17) + S, pen(.5), -22)                          # the dashed box round the shared words
put(PL_C, whoosh(.9), -18)                             # iris onto the HAER sheet
put(PL_C + 1.9 + .25, whoosh(.7), -20)                 # the drawn fireball becomes the photo
swap = bar(6) + .75 + 2 * BEAT + S
put(swap - .8, whoosh(.8, rev=True), -20)              # iris closes on the fireball
put(swap, whoosh(.9), -19)                             # ENIAC opens
put(swap + .9, relays(.9), -22, pan=.2)                # ENIAC relays
put(swap + 2.3, thump(.5), -18, pan=.3)                # the redaction bar
put(PL_D - .75, whoosh(.75, rev=True), -22)
put(PL_D, crt_on(), -14)                               # scope powers on
put(PL_D + .2, hum(PL_E - PL_D - .2), -27)             # tube hum under the plate
put(bar(11) - .2 + S, static(1.6), -20)                # sync lost
put(PL_E, blip_down(), -16)                            # tube off, back to blueprint
put(PL_E + 1.8, tick(2800, .03), -16)                  # hands appear
ratchet(bar(13) + .6 + S, bar(13) + 2.2 + S)           # the sweep to 85 s
put(bar(14) + .1 + S, thump(1.1), -13)                 # 85 SECONDS TO MIDNIGHT
put(bar(14) + 1.0 + S, crowd(2.8), -24)                # pull back: the stadium, nobody looking up
put(PL_F + .25, whoosh(1.2), -22)                      # camera down the sheet
t0F = round((PL_F - S - B0) / BEAT)
for i in range(4):
    rt = bt(t0F + 3 + i * 2) + S
    put(rt, tick(4500, .015), -21, pan=-.2)
    put(rt + .3, tick(6000, .02), -17, pan=.15); put(rt + .48, tick(6000, .02), -17, pan=.3)
put(bt(t0F + 10) + .1 + S, thump(.9), -12, pan=.2)     # SOUND FAMILIAR?
put(bar(18) - .05 + S, whoosh(1.1), -22)
put(bar(18) + .6 + S, pen(1.4), -26)                   # title block ruled

sf.write(os.path.join(here, 'assets', 'sfx.wav'), out.astype(np.float32), SR)
take, sr = sf.read(os.path.join(here, 'assets', 'song.wav')); assert sr == SR
cut = lambda a, b: take[int(a * SR):int(b * SR)].copy()
def join(x, y, xf):
    n = int(xf * SR); r = np.linspace(0, 1, n)[:, None]
    return np.concatenate([x[:-n], x[-n:] * (1 - r) + y[:n] * r, y[n:]])
edit = join(cut(0, bar(4) + .02), cut(bar(0) - .0, bar(4) + .02), .02)       # bars 0-4 twice
edit = join(edit, cut(bar(4), 57.6), .02)                                   # the rest of the take
coda = cut(2.0, 9.6); coda *= np.concatenate([np.ones(len(coda) - int(2.6 * SR)), np.linspace(1, 0, int(2.6 * SR))])[:, None]
edit = join(edit, coda, 1.5)                                                # the hushed intro again, fading out
song = np.zeros((N, 2)); song[:min(N, len(edit))] = edit[:N]
sf.write(os.path.join(here, 'assets', 'score-edit.wav'), song.astype(np.float32), SR)
m = song + out
m = m / max(1.0, np.max(np.abs(m)) / .84)              # keep headroom; ffmpeg's limiter does the rest
sf.write(os.path.join(here, 'assets', 'mix.wav'), m.astype(np.float32), SR)
print('sfx peak', np.max(np.abs(out)).round(3), 'mix written')
