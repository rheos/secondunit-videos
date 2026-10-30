#!/usr/bin/env python3
"""Sound on the picture from earshot's sound bank (Leon Lin, MIT; references/leon-lin/STUDY-earshot.md).

    EARSHOT=<earshot clone> <viralvision venv python> -I sfx_earshot.py

Reads cues.json (tools/blueprint-kit/cues.mjs: every event the page reports), renders one take per cue kind with
`earshot sfx render` (the bank is numpy only: no Docker, no torch, no models), places each hit one frame after its
event, thinned to one per frame per kind, and mixes it under _in/voice.wav -> _in/sfx.wav and _in/mix.wav
(-14 LUFS integrated, -1.5 dBTP). Re-run after any timing change, after cues.mjs.
"""
import json, os, pathlib, subprocess, sys
import numpy as np
import soundfile as sf

HERE = pathlib.Path(__file__).resolve().parent
EARSHOT = os.environ["EARSHOT"]
SR, FPS = 48000, 30
# kind -> (bank id, gain dB under a -1 dBFS take, seeds to rotate)
KIT = {
    "type": ("pro_typing_key/soft", -24, [1, 2, 3, 4]),
    "whoosh": ("whoosh_big/swell", -15, [None]),
    "strike": ("swish/zing", -17, [None]),
    "blip": ("ui_pop/blip", -21, [None]),
    "swipe": ("swipe/flick", -20, [None]),
    "pop": ("pro_pop_in/round", -19, [None, 2]),
    "riser": ("riser/air", -21, [None]),
    "zip": ("pro_zip/up", -17, [None]),
    "zipdown": ("pro_zip/down_warm", -17, [None]),
    "slide": ("swipe/glide", -21, [None]),
    "tick": ("hover_tick/detent", -16, [None]),
    "land": ("tap/soft", -14, [None]),
    "ding": ("pro_notify/ding_2045", -16, [None]),
    "draw": ("shimmer/m2", -24, [None]),
    "slam": ("pro_impact/short", -14, [None]),
    "thud": ("knock/desk", -14, [None]),
    "stamp": ("pro_impact/deep", -12, [None]),
    "sting": ("logo_sting/soft_bloom", -11, [None]),
}
cache = HERE / "sfx"
cache.mkdir(exist_ok=True)


def take(sid, seed, dur=None):
    name = sid.replace("/", "_") + (f"_s{seed}" if seed else "") + (f"_d{dur:.2f}" if dur else "") + ".wav"
    f = cache / name
    if not f.exists():
        cmd = [sys.executable, "-m", "earshot", "sfx", "render", sid, "-o", str(f), "--sr", str(SR)]
        if seed: cmd += ["--seed", str(seed)]
        if dur: cmd += ["--dur", f"{dur:.2f}"]
        subprocess.run(cmd, check=True, env=dict(os.environ, PYTHONPATH=EARSHOT), stdout=subprocess.DEVNULL)
    x, sr = sf.read(f, always_2d=True)
    assert sr == SR, (f, sr)
    x = x.mean(axis=1)
    return x / (np.abs(x).max() + 1e-9) * 10 ** (-1 / 20)


voice, sr = sf.read(HERE / "_in/voice.wav", always_2d=True)
assert sr == SR
n = len(voice)
bus = np.zeros(n)
cues = json.loads((HERE / "cues.json").read_text())
seen, count = set(), {}
for c in sorted(cues, key=lambda c: c["t"]):
    k = c["k"]
    if k not in KIT: continue
    frame = round(c["t"] * FPS) + 1  # one frame after the event
    if (k, frame) in seen: continue
    seen.add((k, frame))
    sid, db, seeds = KIT[k]
    i = count.get(k, 0); count[k] = i + 1
    dur = c.get("d") if k in ("whoosh", "riser", "slide", "draw") else None
    x = take(sid, seeds[i % len(seeds)], dur) * 10 ** (db / 20)
    a = int(frame / FPS * SR)
    b = min(n, a + len(x))
    if a < n: bus[a:b] += x[: b - a]
sf.write(HERE / "_in/sfx.wav", np.stack([bus, bus], 1), SR, subtype="PCM_24")
mix = voice + np.stack([bus, bus], 1)
sf.write(HERE / "_in/premix.wav", mix, SR, subtype="FLOAT")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(HERE / "_in/premix.wav"), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                "-ar", str(SR), "-c:a", "pcm_s16le", str(HERE / "_in/mix.wav")], check=True)
print("placed", {k: v for k, v in sorted(count.items())}, "->", HERE / "_in/mix.wav")
