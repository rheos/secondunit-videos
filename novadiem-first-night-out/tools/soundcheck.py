#!/usr/bin/env python3
"""soundcheck.py · does each sound event stand out from the night bed on a phone? Compares each event's stem with the
bed's stem over the same 120 ms after its onset, in the phone band (300-3400 Hz).

    <viralvision venv python> -I tools/soundcheck.py assets/creek_sound
"""
import json
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

base = sys.argv[1]
bed, sr = sf.read(base + '_bed.wav')
ev, _ = sf.read(base + '_events.wav')
sos = butter(4, [300, 3400], btype='band', fs=sr, output='sos')
pb, pe = sosfilt(sos, bed.mean(1)), sosfilt(sos, ev.mean(1))
db = lambda a: 20 * np.log10(np.sqrt(np.mean(a ** 2)) + 1e-12)
rows = {}
for e in json.load(open(base + '_placed.json'))['events']:
    i = int(e['onset'] * sr)
    w = slice(i, i + int(.12 * sr))
    rows.setdefault(e['k'], []).append(db(pe[w]) - db(pb[w]))
for k, v in rows.items():
    print(f"{k:8s} n={len(v):2d}  over the bed: median {np.median(v):5.1f} dB, quietest {min(v):5.1f} dB")
