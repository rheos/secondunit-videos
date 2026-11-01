"""Snap aligned word starts to vocal onsets (rise in log energy over 40 ms, strongest peak within
+-0.6 s of the aligned time; keep the aligned time when the onset is weak). Prints the deltas.
Usage: onsets.py <vocals.wav> <align.json> <out.json>"""
import json, sys, numpy as np, soundfile as sf
x, sr = sf.read(sys.argv[1]); x = x.mean(1) if x.ndim > 1 else x
hop = int(sr * .01); n = len(x) // hop
e = np.log(np.array([(x[i*hop:(i+1)*hop] ** 2).mean() for i in range(n)]) + 1e-9)
rise = np.zeros(n); rise[4:] = e[4:] - e[:-4]                      # 40 ms rise
loud = np.zeros(n); loud[:] = e
d = json.load(open(sys.argv[2])); W = d['words']; out = []; prev = 0
from scipy.signal import find_peaks
pk, _ = find_peaks(rise, height=2.0, distance=8)
pk = [k for k in pk if loud[min(n - 1, k + 3)] > np.percentile(e, 40)]
for w in W:
    c = w['s'] / .01
    cand = [k for k in pk if abs(k - c) <= 30 and k * .01 > prev + .08]
    if cand:
        k = min(cand, key=lambda k: abs(k - c)); s = round(k * .01, 2); strong = True
    else: s, strong = w['s'], False
    prev = max(prev, s)
    out.append({**w, 's_aligned': w['s'], 's': s, 'snapped': strong})
json.dump({**d, 'words': out}, open(sys.argv[3], 'w'))
dl = np.array([o['s'] - o['s_aligned'] for o in out if o['snapped']])
print(f"{len(dl)}/{len(out)} snapped; median {np.median(dl):+.2f}s  mean {dl.mean():+.2f}  |d|>0.2: {(abs(dl)>.2).sum()}  |d|>0.4: {(abs(dl)>.4).sum()}")
for o in out:
    if o['snapped'] and abs(o['s'] - o['s_aligned']) > .25: print(f"  {o['w']:>14} line {o['line']:2d}  aligned {o['s_aligned']:7.2f} -> onset {o['s']:7.2f} ({o['s']-o['s_aligned']:+.2f})")
