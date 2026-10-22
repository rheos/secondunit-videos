#!/usr/bin/env python3
"""Sound on the picture for a blueprint-kit film, after the Romancing the Atom reel's sfx.py.

    <viralvision venv python> -I tools/blueprint-kit/sfx.py <project> [--score _in/score.mp3]
        [--voice _in/voice.wav] [--end 147.9] [--sfx-db 0] [--score-db -10]

Reads <project>/cues.json (tools/blueprint-kit/cues.mjs): every animation event the kit's helpers report. Each
sound is synthesised here (no samples, no licences: an Edison-era office, and since rheoStream
draft 2 a waterworks: gate, valve, water, chime) and placed one frame after its event, thinned to one per frame
per kind. Writes <project>/_in/sfx.wav, then mixes score + voice + sfx into <project>/_in/mix.wav: the score ducks
under the voice when there is one, and the sum is normalised to -14 LUFS, true peak -1.5 dB.
The root page's <audio> points at _in/mix.wav.
"""
import argparse, json, pathlib, subprocess
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

ap = argparse.ArgumentParser()
ap.add_argument("project")
ap.add_argument("--score", default="_in/score.mp3")
ap.add_argument("--voice", default=None)
ap.add_argument("--end", type=float, default=None, help="film length in seconds (default: last cue + 3 s)")
ap.add_argument("--sfx-db", type=float, default=0.0, help="overall sfx level")
ap.add_argument("--score-db", type=float, default=-10.0, help="score level before the duck")
a = ap.parse_args()
proj = pathlib.Path(a.project).resolve()
cues = json.loads((proj / "cues.json").read_text())

SR = 48000
FR = 1 / 24
END = a.end or (max(c["t"] for c in cues) + 3)
N = int(SR * END)
out = np.zeros((N, 2))
rng = np.random.default_rng(7)


def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)
def env(n, att, dec): t = np.arange(n) / SR; return np.minimum(1, t / max(att, 1e-4)) * np.exp(-t / dec)
def noise(sec): return rng.standard_normal(int(sec * SR))
def tone(f, sec): t = np.arange(int(sec * SR)) / SR; return np.sin(2 * np.pi * f * t)


def put(t, x, gain_db=0.0, pan=0.0):
    i = int(round((t + FR) * SR))
    x = x[: max(0, N - i)]
    if i < 0 or not len(x): return
    g = 10 ** ((gain_db + a.sfx_db) / 20)
    out[i:i + len(x), 0] += x * g * (1 - max(0, pan))
    out[i:i + len(x), 1] += x * g * (1 + min(0, pan))


# --- the sounds: an Edison-era office ---
def key(size=20):  # a typewriter key: a bright strike and a little carriage body
    n = int(.06 * SR)
    x = bp(noise(.06), 1800 + 30 * (40 - min(size, 40)), 8000) * env(n, .0004, .006)
    return x + lp(noise(.06), 500) * env(n, .001, .014) * .7


def thud(size=60):  # a piece of type set into the stick: a wooden knock, deeper for big type
    n = int(.12 * SR); t = np.arange(n) / SR
    f = 110 + 70 * np.exp(-t * 60) + 500 / max(size, 20)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .03) * .8 + bp(noise(.12), 900, 3500) * env(n, .0005, .008) * .4


def tick(bright=4000, d=.01): x = bp(noise(.05), bright * .6, min(bright * 1.6, 20000)); return x * env(len(x), .0005, d)


def pen(sec):  # a steel nib on drafting paper
    x = bp(noise(sec), 1800, 7000); t = np.arange(len(x)) / SR
    mod = .55 + .45 * np.abs(np.sin(2 * np.pi * 3.1 * t + np.sin(2 * np.pi * .7 * t)))
    fade = np.minimum(1, t / .06) * np.minimum(1, np.maximum(0, sec - t) / .12)
    return x * mod * fade * .3


def stamp():  # a rubber stamp: a body thump and the snap of the handle
    n = int(.4 * SR); t = np.arange(n) / SR; f = 70 + 80 * np.exp(-t * 40)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .07)
    return body + bp(noise(.4), 700, 4000) * env(n, .001, .015) * .6


def card():  # an index card dropped into a drawer: a slap and a flutter
    n = int(.15 * SR)
    return bp(noise(.15), 900, 5000) * env(n, .001, .025) * .8 + bp(noise(.15), 2500, 9000) * env(n, .015, .04) * .35


def slide(sec=.5):  # paper sliding on paper
    sec = max(.2, min(sec, 1.5)); x = bp(noise(sec), 400, 2500); t = np.arange(len(x)) / SR
    return x * (np.sin(np.pi * t / sec) ** 1.5) * .35


def drawer(sec=.6):  # a wooden card drawer running on its slide and stopping
    sec = max(.3, min(sec, 1.2)); x = bp(noise(sec), 150, 1400); t = np.arange(len(x)) / SR
    rumble = x * (np.sin(np.pi * t / sec) ** 1.2) * (.7 + .3 * np.sin(2 * np.pi * 23 * t)) * .45
    stop = np.zeros_like(rumble); k = int((sec - .05) * SR); st = thud(90)[: len(stop) - k]; stop[k:k + len(st)] += st * .8
    return rumble + stop


def whoosh(sec=.8):
    sec = max(.25, min(sec, 2.0)); x = noise(sec); t = np.arange(len(x)) / SR; e = np.sin(np.pi * t / sec) ** 2
    return (bp(x, 200, 1200) * e + bp(x, 1500, 6000) * e * .35) * .4


def bell(f=1568):  # a desk bell: inharmonic partials, a long ring
    sec = 1.6
    return (tone(f, sec) + .5 * tone(f * 2.76, sec) + .25 * tone(f * 5.4, sec)) * env(int(sec * SR), .002, .45) * .2


def tube():  # a pneumatic tube carrier arriving: a rising rush and a thunk
    sec = .7; x = noise(sec); t = np.arange(len(x)) / SR
    rush = bp(x, 300, 3000) * (t / sec) ** 2 * .4
    hit = np.zeros_like(rush); k = int((sec - .08) * SR); h = thud(70)[: len(hit) - k]; hit[k:k + len(h)] += h
    return rush + hit


def ping(f=1175):
    n = int(.5 * SR); return (tone(f, .5) + .3 * tone(f * 2.01, .5)) * env(n, .002, .14) * .3


def crank(sec):  # a crank or ratchet: ticks
    x = np.zeros(int(max(sec, .1) * SR)); k = 0
    while k < len(x) - 3000:
        c = tick(3000, .006); x[k:k + len(c)] += c; k += int(SR / 14)
    return x


# --- waterworks (rheoStream draft 2): a lock gate, a valve, running water, a soft modern chime ---
def gate():  # a lock gate closing: a heavy low thump with a short wooden ring and a splash of water
    n = int(.9 * SR); t = np.arange(n) / SR; f = 48 + 40 * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .003, .18)
    ring = bp(noise(.9), 180, 900) * env(n, .002, .09) * .5
    splash = bp(noise(.9), 1200, 6000) * env(n, .03, .22) * .18
    return body + ring + splash


def valve(sec=.6):  # a valve turning: a short hiss that opens up, then a metal click
    sec = max(.25, min(sec, 1.2)); x = bp(noise(sec), 2500, 9000); t = np.arange(len(x)) / SR
    hiss = x * np.minimum(1, t / (sec * .4)) * np.minimum(1, np.maximum(0, sec - t) / .08) * .22
    c = tick(5000, .006); hiss[: len(c)] += c * .8
    return hiss


def water(sec=1.0):  # water running through a channel: a low soft rush that swells and settles
    sec = max(.3, min(sec, 3.0)); x = noise(sec); t = np.arange(len(x)) / SR
    e = np.sin(np.pi * t / sec) ** 1.4
    gurgle = 1 + .35 * np.sin(2 * np.pi * 5.3 * t + 2 * np.sin(2 * np.pi * 1.7 * t))
    return (lp(x, 700) * 1.1 + bp(x, 900, 3200) * .25) * e * gurgle * .5


def chime(f=1318.5):  # the inquiry arriving: a soft, clean two-partial chime (a fifth above)
    n = int(1.2 * SR)
    return (tone(f, 1.2) + .45 * tone(f * 1.5, 1.2) + .12 * tone(f * 3, 1.2)) * env(n, .004, .38) * .18


# --- place them ---
last = {}
for c in sorted(cues, key=lambda c: c["t"]):
    k, t = c["k"], c["t"]
    if k == "out": continue
    if k in last and t - last[k] < FR - 1e-6: continue
    last[k] = t
    size = c.get("size") or 20
    d = c.get("d") or .5
    pan = float(rng.uniform(-.25, .25))
    if k == "type": put(t, key(size), -30, pan)
    elif k == "slam": put(t, thud(size), -24 + 6 * min(size, 120) / 120, pan * .6)
    elif k == "drop":
        for j in range(min(int(c.get("n", 8)), 24)): put(t + j * d / max(1, c.get("n", 8)), tick(2600, .005), -36, pan)
    elif k == "pen": put(t, pen(min(d, 2.5)), -33, pan)
    elif k == "stamp": put(t, stamp(), -16)
    elif k == "card": put(t, card(), -22, pan)
    elif k == "slide": put(t, slide(d), -24, pan)
    elif k == "drawer": put(t, drawer(d), -18, pan * .5)
    elif k == "whoosh": put(t, whoosh(d), -26)
    elif k == "bell": put(t, bell(), -20)
    elif k == "tube": put(t, tube(), -20, pan)
    elif k == "tick": put(t, tick(3600, .01), -28, pan)
    elif k == "ping": put(t, ping(), -26, pan)
    elif k == "crank": put(t, crank(d), -28, pan)
    elif k == "gate": put(t, gate(), -17, pan * .5)
    elif k == "valve": put(t, valve(d), -26, pan)
    elif k == "water": put(t, water(d), -24, pan * .5)
    elif k == "chime": put(t, chime(), -24, pan * .4)

peak = np.abs(out).max()
if peak > .98: out *= .98 / peak
(proj / "_in").mkdir(exist_ok=True)
sf.write(proj / "_in/sfx.wav", out, SR, subtype="PCM_24")
print("sfx", proj / "_in/sfx.wav", f"{END:.2f} s", {k: sum(1 for c in cues if c["k"] == k) for k in sorted({c["k"] for c in cues})})

# --- the mix: score (ducked under the voice), voice, sfx; -14 LUFS, true peak -1.5 dB ---
score = proj / a.score
args = ["ffmpeg", "-y", "-v", "error", "-i", str(score), "-i", str(proj / "_in/sfx.wav")]
chain = [f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={a.score_db}dB,apad=whole_dur={END},atrim=0:{END}[mus]",
         f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo[fx]"]
if a.voice:
    args += ["-i", str(proj / a.voice)]
    chain += [f"[2:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur={END},atrim=0:{END},asplit=2[vo][vosc]",
              "[mus][vosc]sidechaincompress=threshold=0.03:ratio=4:attack=40:release=500[duck]",
              "[duck][vo][fx]amix=inputs=3:normalize=0[sum]"]
else:
    chain += ["[mus][fx]amix=inputs=2:normalize=0[sum]"]
chain += ["[sum]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]"]
mix = proj / "_in/mix.wav"
subprocess.run(args + ["-filter_complex", ";".join(chain), "-map", "[out]", "-c:a", "pcm_s16le", str(mix)], check=True)
print("mix", mix)
