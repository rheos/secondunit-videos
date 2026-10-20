# Sound design for the reel: every hit synthesised here (no samples, no licences), placed one frame after the
# visual event it belongs to, then mixed under the score and limited.
#   viralvision venv python -I sfx.py   ->  assets/sfx.wav, assets/mix.wav (render with AUDIO=assets/mix.wav)
# Event times mirror js/shots.js, js/plates6.js and js/bomb.js (same beat grid constants); change them together.
# The score (draft 7c): score-library atom-drive take-05 (assets/song7.wav, Music v2.5 on the 66-bar plan, limited),
# played straight; B0 and BEAT below are its measured first downbeat and beat.
import os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 48000; DUR = 175.0; N = int(SR * DUR); FR = 1 / 24
here = os.path.dirname(os.path.abspath(__file__))
B0 = 17.356; BEAT = 0.54056; BAR = 4 * BEAT       # js/shots.js
bar = lambda n: B0 + n * BAR; bt = lambda n: B0 + n * BEAT
PL = dict(A=0, T=bar(4), B=bar(9), M=bar(14), X=bar(19), C=bar(24), N=bar(29), D=bar(34), Y=bar(39), E=bar(44), Z=bar(48), P=bar(53), F=bar(61), G=bar(66))
# the score: the 119 s take looped at bar lines so its changes at bars 24 and 32 land on the sync loss (film bar 35)
# and the cards (film bar 52): (film bar, source bar, bars)
BARMAP = [(0, 0, 20), (20, 9, 11), (31, 20, 4), (35, 9, 3), (38, 24, 10), (48, 24, 9), (57, 32, 8), (65, 39, 1), (66, 40, None)]
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
    tt = t0
    while tt < t1:
        put(tt, tick(3200, .006), -20 + 6 * (tt - t0) / (t1 - t0), pan=-.1)
        tt += 1 / (n0 + (n1 - n0) * ((tt - t0) / (t1 - t0)))
def snap():                               # a card dealt onto the table: a slap of filtered noise and a short card flutter
    n = int(.16 * SR); x = bp(noise(.16), 900, 5000) * env(n, .001, .03)
    fl = bp(noise(.16), 2500, 9000) * env(n, .02, .05) * .4
    return (x + fl) * .8
def slide(sec=.5):                        # paper panel sliding in
    x = bp(noise(sec), 400, 2500); t = np.arange(len(x)) / SR
    return x * (np.sin(np.pi * t / sec) ** 1.5) * .35
def odometer(t0, t1, n=28):               # digits rolling: quick ticks
    for k in range(n): put(t0 + (t1 - t0) * k / n, tick(5200, .006), -27 + 4 * (k % 3 == 0), pan=.3)
def key(size=20):                         # one typed character: a typewriter key, brighter for small type
    n = int(.05 * SR); x = bp(noise(.05), 2200 + 40 * (40 - min(size, 40)), 9000) * env(n, .0005, .007)
    return x + lp(noise(.05), 400) * env(n, .001, .012) * .6
def thud(size=60):                        # one kinetic letter landing: a soft body knock, deeper for big type
    n = int(.12 * SR); t = np.arange(n) / SR; f = 90 + 60 * np.exp(-t * 60) + 400 / max(size, 20)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .03) * .8 + bp(noise(.12), 800, 3000) * env(n, .0005, .01) * .35
def zip_(sec=.22):                        # a leader line drawing: a quick rising zip
    n = int(sec * SR); t = np.arange(n) / SR; f = 500 + 1400 * (t / sec) ** 1.6
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .003, .09) * .3
def ping(f=1200):                         # a crosshair settling: a sonar ping
    n = int(.5 * SR); return (tone(f, .5) + .3 * tone(f * 2.01, .5)) * env(n, .002, .14) * .35
def flap():                               # a flag running up its pole and snapping in the wind: a cloth flutter
    n = int(.3 * SR); t = np.arange(n) / SR; x = bp(noise(.3), 300, 2600)
    fl = (.4 + .6 * np.abs(np.sin(2 * np.pi * 11 * t + 2 * np.sin(2 * np.pi * 3 * t)))) * env(n, .004, .09)
    return x * fl * .7 + bp(noise(.3), 3000, 7000) * env(n, .001, .012) * .4
def blip(f):                              # a neuron firing
    n = int(.1 * SR); return tone(f, .1) * env(n, .002, .025) * .5
def glide(f_of_t, sec, gain=.3):          # a tone whose pitch follows a curve (the beam drawing the warhead count)
    n = int(sec * SR); t = np.arange(n) / SR; f = f_of_t(t / sec)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + .25 * np.sin(2 * np.pi * 2 * np.cumsum(f) / SR)
    trem = .85 + .15 * np.sin(2 * np.pi * 7 * t)
    return x * trem * np.minimum(1, t / .12) * np.minimum(1, (sec - t) / .08) * gain

# --- the animation events the page reports (node cues.mjs -> assets/cues.json): every typed character, every
# kinetic letter, every leader; thinned to one per frame per kind ---
import json, re
cues = json.load(open(os.path.join(here, 'assets', 'cues.json')))
last = {}
for c in sorted(cues, key=lambda c: c['t']):
    k = c['k']
    if k in last and c['t'] - last[k] < FR - 1e-6: continue
    last[k] = c['t']; sz = c.get('size') or 20
    if k == 'type': put(c['t'], key(sz), -34 + 5 * min(sz, 30) / 30, pan=rng.uniform(-.25, .25))
    elif k == 'slam': put(c['t'], thud(sz), -30 + 10 * min(sz, 170) / 170, pan=rng.uniform(-.2, .2))
    elif k == 'zip': put(c['t'], zip_(), -24, pan=rng.uniform(-.3, .3))
WARHEADS = json.loads(re.search(r'const WARHEADS = (\[.*?\]);', open(os.path.join(here, 'js', 'data.js')).read()).group(1))
def warheads_at(yr):
    for (y0, n0), (y1, n1) in zip(WARHEADS, WARHEADS[1:]):
        if y0 <= yr <= y1: return n0 + (n1 - n0) * (yr - y0) / (y1 - y0)
    return WARHEADS[-1][1]

# --- the cue sheet ---
# 0. the drafting (js/bomb.js), the scan, the title
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
put(11.2, thump(.8), -14, pan=-.3)                     # the core ringed: Hanford plutonium
put(12.6, whoosh(.9), -21)                             # scan bar: the original sheet
put(13.95, whoosh(.6, rev=True), -23)                  # paper swept off
put(14.8, pen(2.2), -27, pan=.2)                       # the atom draws itself
put(bar(0), thump(1.0), -13)                           # ROMANCING, on the first downbeat
put(bar(1), chime(880), -20)                           # the heart
# T. the tapes: the deck runs, the reels turn, the voice (assets/ike.wav, placed below if present), the hand-off
put(PL['T'] + .2, hum(PL['B'] - PL['T'] - .4, 50), -34)                      # the deck's motor
put(PL['T'] + .2, bp(noise(PL['B'] - PL['T'] - .4), 3000, 9000) * .12, -30)  # tape hiss
put(PL['T'] + .3, tick(2200, .03), -18)                                        # play
put(PL['T'] + .9, ping(1100), -24, pan=.3)                                     # crosshair on the photograph
put(PL['B'] - .8, whoosh(.8, rev=True), -24)                                   # the photograph slides to the stamp's place
# 1. the promise
put(PL['B'] + .8, thump(.7), -16, pan=-.3)             # the stamp lands
for k in (2, 3, 4): put(PL['B'] + k * BEAT, tick(5000, .01), -20, pan=.3)   # quote lines
put(PL['B'] + 8 * BEAT, whoosh(.9, rev=True), -24)     # the stamp shrinks away
put(PL['B'] + 8 * BEAT + .3, relays(1.5, 12), -29, pan=.3)   # the network draws itself
put(PL['B'] + 8 * BEAT + .3, tick(5000, .01), -20, pan=-.2)
put(PL['B'] + 10 * BEAT, tick(5000, .01), -20, pan=.2)
put(PL['B'] + 12 * BEAT, pen(.5), -22)                 # the dashed box round the shared words
# 2. the metaphors
put(PL['M'] + .3, whoosh(.5), -24)                     # the node runs up, rules the divider
put(PL['M'] + .5, slide(.6), -20, pan=-.5); put(PL['M'] + .5, slide(.6), -20, pan=.5)   # the two panels slide in
put(PL['M'] + 1.0, thump(.4), -22)                     # they land
for i in range(6): put(PL['M'] + (2 + 2 * i) * BEAT, tick(5200 if i % 2 else 3200, .012), -19, pan=-.35 if i % 2 == 0 else .35)   # each quote
put(PL['M'] + 14 * BEAT, tick(4500, .015), -20)        # the band
put(PL['M'] + 20 * BEAT - .5, slide(.5), -21, pan=-.5); put(PL['M'] + 20 * BEAT - .5, slide(.5), -21, pan=.5)   # the panels leave
# X. the fields: the map drawn, the pins, the hot pins
put(PL['X'], pen(1.6), -24, pan=-.1)                                           # the map in the pen
for i in range(12): put(PL['X'] + (3 + i * .6) * BEAT, tick(3600, .02), -20, pan=-.4 + .07 * i)   # the sites of the bomb
for i in range(5): put(PL['X'] + (12.5 + i * .6) * BEAT, blip(1320), -19, pan=.3 - .1 * i)         # the new sites
put(PL['X'] + 12 * BEAT, tick(4500, .015), -20)                                # the band changes
put(PL['C'] - .6, ping(1500), -24)                                             # the Los Alamos pin
# 3. the same lab
put(PL['C'], whoosh(.9), -18)                          # iris onto the HAER sheet
put(PL['C'] + .9, ping(), -23, pan=-.1)                # crosshair on the drawn fireball
put(PL['C'] + 1.6 + .25, whoosh(.7), -20)              # the drawn fireball becomes the photo
put(PL['C'] + 1.6 + .85, ping(900), -22, pan=.1)       # crosshair on the photograph
swap = PL['C'] + 8 * BEAT
put(swap - .8, whoosh(.8, rev=True), -20)              # iris closes on the fireball
put(swap, whoosh(.9), -19)                             # ENIAC opens
put(swap + .9, relays(.9), -22, pan=.2)                # ENIAC relays
put(swap + 2.1, thump(.5), -18, pan=.3)                # the redaction bar
put(PL['N'] - .75, whoosh(.75, rev=True), -22)
# 4. the machine
put(PL['N'] + .0, pen(.9), -26, pan=-.2)               # construction axes
put(PL['N'] + .6, pen(2.0), -24, pan=.1)               # nodes
put(PL['N'] + 1.6, pen(2.2), -25, pan=-.3)             # weights
for i in range(4): put(PL['N'] + 6 * BEAT + i * .2, tick(4200, .008), -26, pan=.25)   # labels
put(PL['N'] + 7 * BEAT, thump(.5), -20)                # THE MACHINE
put(PL['N'] + 8 * BEAT, relays(5 * BEAT, 16), -25, pan=.1)   # the net fires
for k in range(8, 19):                                 # neurons firing on each beat
    for j, f in enumerate(rng.choice([440, 523, 587, 659, 784, 880, 1047], 3, replace=False)): put(PL['N'] + k * BEAT + j * .03, blip(f), -24 - 2 * j, pan=-.3 + .3 * j)
put(PL['N'] + 8 * BEAT, tick(4500, .015), -20)         # the 1958 band
odometer(PL['N'] + 11 * BEAT, PL['N'] + 12 * BEAT)     # GPT-2
odometer(PL['N'] + 12.5 * BEAT, PL['N'] + 14 * BEAT, 40)   # GPT-3
put(PL['N'] + 15 * BEAT, thump(.5), -18, pan=.3)       # the redaction bar
put(PL['N'] + 19 * BEAT, whoosh(.55, rev=True), -22)   # the net collapses to the beam spot
# 5. the scope
put(PL['D'], crt_on(), -14)                            # scope powers on
put(PL['D'] + .2, hum(PL['Y'] - PL['D'] - .2), -27)    # tube hum under the plate
c0, c1 = PL['D'] + 9 * BEAT + .3, PL['D'] + 13.5 * BEAT      # CH2: the compute curve, a second tone an octave up
put(c0, glide(lambda u: 330 + 900 * u ** 2.2, c1 - c0, .22), -26, pan=-.2)
put(PL['D'] + 16 * BEAT - .2, static(1.6), -20)        # sync lost (the music's own change, bar 35)
d0, d1 = PL['D'] + 1.3, PL['D'] + 9 * BEAT              # the beam draws the curve: a tone follows the count
put(d0, glide(lambda u: 170 + 720 * np.array([warheads_at(1945 + 81 * v) for v in u]) / 75000, d1 - d0), -22, pan=.15)
# Y. the day after: a television
put(PL['Y'], crt_on(), -18)
put(PL['Y'] + .2, hum(PL['E'] - PL['Y'] - .2, 60), -30)
for k in (5, 11, 13): put(PL['Y'] + k * BEAT - .1, static(.25), -18)          # the channel changes
odometer(PL['Y'] + 5 * BEAT, PL['Y'] + 6.5 * BEAT, 36)                         # the audience counts up
put(PL['Y'] + 11 * BEAT, chime(1320, .6), -22)                                 # the station's sting
put(PL['Y'] + 13.5 * BEAT, thump(.6), -18); put(PL['Y'] + 14 * BEAT, thump(.6), -18)   # the diary lines
put(PL['E'] - .5, blip_down(), -16)                                            # the set goes off
# 6. the clock
put(PL['E'], blip_down(), -20)                         # back to blueprint
for k in range(20): put(PL['E'] + 1.3 + .7 * (1 - (1 - k / 20) ** 3), tick(5000, .005), -29, pan=.2)   # the dial's ticks
put(PL['E'] + 1.8, tick(2800, .03), -16)               # hands appear
ratchet(PL['E'] + 3.3, PL['E'] + 4.9)                  # the sweep to 85 s
put(PL['E'] + 5.4, thump(1.1), -13)                    # 85 SECONDS TO MIDNIGHT
put(PL['E'] + 6.3, crowd(2.4), -24)                    # pull back: the stadium, nobody looking up
# Z. the restart
put(PL['Z'], whoosh(.9), -18)                                                  # iris onto Three Mile Island
put(PL['Z'] + .9, ping(), -23)                                                 # crosshair on the towers
put(PL['Z'] + 8 * BEAT, thump(1.1), -12)                                       # RESTARTING FOR AI
for i in range(3): put(PL['Z'] + (11 + i * .8) * BEAT, tick(4500, .015), -21, pan=-.2 + .2 * i)   # the schedule
put(PL['P'] - .55, whoosh(.55, rev=True), -22)                                 # iris shuts to the dot
# 7. p(doom)
put(PL['P'], whoosh(.9), -18)                          # iris onto LA-602
put(PL['P'] + .9, ping(), -23)                         # crosshair on the report's title
put(PL['P'] + 3 * BEAT, thump(.6), -17)                # THE FIRST p(doom)
put(PL['P'] + 6.5 * BEAT, thump(1.1), -12)             # < 3 IN 1,000,000
put(PL['P'] + 11 * BEAT, whoosh(.55, rev=True), -22)   # iris shuts to the dot
for i in range(5): put(PL['P'] + (12 + 1.5 * i) * BEAT + .3, snap(), -16, pan=-.4 + .2 * i)   # cards dealt
put(PL['P'] + 19 * BEAT, thump(.8), -14)               # p(doom) ALL-STARS
for i in range(5): put(PL['P'] + 21 * BEAT + i * .25 + .2, tick(2200, .02), -19, pan=-.4 + .2 * i)   # cards flipped
put(PL['P'] + 23 * BEAT, tick(4500, .015), -20)        # the band
put(PL['P'] + 26.5 * BEAT, slide(.7), -20)             # the stack gathers
put(PL['P'] + 28 * BEAT - .15, snap(), -18)
# 8. red flags
put(PL['F'] + .6, thump(.7), -16)                      # RED FLAGS
for i in range(5):
    rt = PL['F'] + (3 + i * 2) * BEAT
    put(rt, tick(4500, .015), -21, pan=-.2)             # the row rules itself
    put(rt + .3, flap(), -17, pan=.15); put(rt + .48, flap(), -17, pan=.35)   # the column flags fly
    put(rt + 1.25, slide(.35), -24, pan=.15); put(rt + 1.43, slide(.35), -24, pan=.35)   # and fold into their boxes
    put(rt + 1.6, tick(6000, .02), -17, pan=.15); put(rt + 1.78, tick(6000, .02), -17, pan=.35)   # ticked
put(PL['F'] + 13 * BEAT + .1, thump(.9), -12, pan=.2)  # SOUND FAMILIAR?
# 9. the title block
put(PL['G'] - .05, whoosh(1.1), -22)
put(PL['G'] + .6, pen(1.4), -26)                       # title block ruled
put(PL['G'] + 1.3, pen(1.3), -29, pan=.4)              # the little atom draws itself

IKE = os.path.join(here, 'assets', 'ike.wav')
if os.path.exists(IKE):
    v, vsr = sf.read(IKE); assert vsr == SR
    if v.ndim == 2: v = v.mean(1)
    put(PL['T'] + .6, v, -5)                                                   # the voice (TAPE_T0 in js/tape-data.js = PL['T'] + .6)
sf.write(os.path.join(here, 'assets', 'sfx.wav'), out.astype(np.float32), SR)
take, sr = sf.read(os.path.join(here, 'assets', 'song7.wav')); assert sr == SR   # atom-drive take-05, made to the 66-bar plan: played straight
edit = take
song = np.zeros((N, 2)); song[:min(N, len(edit))] = edit[:N]
if os.path.exists(IKE):                                 # duck the score under the voice
    d0, d1 = PL['T'] + .4, PL['T'] + .6 + len(v) / SR + .3; g = np.ones(N)
    i0, i1 = int(d0 * SR), int(d1 * SR); r = int(.4 * SR)
    g[i0 + r:i1 - r] = 10 ** (-9 / 20); g[i0:i0 + r] = np.linspace(1, 10 ** (-9 / 20), r); g[i1 - r:i1] = np.linspace(10 ** (-9 / 20), 1, r)
    song *= g[:, None]
print('score edit', round(len(edit) / SR, 2), 's')
sf.write(os.path.join(here, 'assets', 'score-edit.wav'), song.astype(np.float32), SR)
m = song + out
m = m / max(1.0, np.max(np.abs(m)) / .84) * 10 ** (-2.6 / 20)   # about -14 LUFS integrated; ffmpeg's limiter does the rest
sf.write(os.path.join(here, 'assets', 'mix.wav'), m.astype(np.float32), SR)
print('sfx peak', np.max(np.abs(out)).round(3), 'mix written')
