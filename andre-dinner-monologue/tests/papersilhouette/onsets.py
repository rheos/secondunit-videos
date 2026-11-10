"""Snap cue times to audio onsets in _in/andre.wav.
Onset = rise in log energy over 40 ms; strongest peak within +-0.6 s of the cue; keep the cue when weak.
usage: python onsets.py <wav> t1 t2 ...   prints cue, onset, frame(24), strength"""
import sys, wave, numpy as np
path = sys.argv[1]; cues = [float(x) for x in sys.argv[2:]]
w = wave.open(path); sr = w.getframerate(); n = w.getnframes(); ch = w.getnchannels()
a = np.frombuffer(w.readframes(n), np.int16).reshape(-1, ch).mean(axis=1) / 32768.0
hop = int(sr * 0.010); win = int(sr * 0.040)
nf = (len(a) - win) // hop
e = np.array([np.log10(1e-7 + np.mean(a[i*hop:i*hop+win]**2)) for i in range(nf)])
d = np.diff(e, prepend=e[0]); d4 = d + np.roll(d, -1) + np.roll(d, -2) + np.roll(d, -3)  # rise over 40 ms
for c in cues:
    lo, hi = max(0, int((c - 0.6) / 0.010)), min(nf - 1, int((c + 0.6) / 0.010))
    seg = d4[lo:hi]; k = int(np.argmax(seg)); s = float(seg[k]); t = (lo + k) * 0.010
    strong = s > 0.6
    out = t if strong else c
    print(f"cue {c:8.3f}  onset {t:8.3f}  str {s:5.2f}  {'USE' if strong else 'keep'} -> {out:8.3f}  f{round(out*24)}")
