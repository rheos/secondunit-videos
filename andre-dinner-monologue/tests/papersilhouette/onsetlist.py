"""All onsets (local maxima of the 40 ms log-energy rise) between t0 and t1 in a wav, with strength.
usage: python onsetlist.py <wav> t0 t1 [min_strength]"""
import sys, wave, numpy as np
path, t0, t1 = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]); ms = float(sys.argv[4]) if len(sys.argv) > 4 else 0.5
w = wave.open(path); sr = w.getframerate(); ch = w.getnchannels()
w.setpos(int(max(0, t0 - 1) * sr)); n = int((t1 - t0 + 2) * sr)
a = np.frombuffer(w.readframes(n), np.int16).reshape(-1, ch).mean(axis=1) / 32768.0
hop = int(sr * 0.005); win = int(sr * 0.040); base = max(0, t0 - 1)
nf = (len(a) - win) // hop
e = np.array([np.log10(1e-7 + np.mean(a[i*hop:i*hop+win]**2)) for i in range(nf)])
d4 = e - np.roll(e, 8)   # rise over 40 ms
for i in range(8, nf - 8):
    t = base + i * 0.005
    if t < t0 or t > t1: continue
    if d4[i] >= ms and d4[i] == d4[i-6:i+7].max():
        print(f"{t:8.3f}  f{round(t*24):5d}  str {d4[i]:4.2f}  level {e[i]:5.2f}")
