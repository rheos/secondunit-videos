"""Scan a render: corner-thumbnail frames (bad worker), near-black frames outside the head/tail fades,
and runs of identical frames longer than 2 s (a frozen section). Usage: scan.py <mp4> <start_seconds>"""
import subprocess, sys, numpy as np
f, t0 = sys.argv[1], float(sys.argv[2])
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', 'scale=64:36,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.uint8).reshape(-1, 36, 64).astype(np.int16)
t = t0 + np.arange(len(a)) / 24
corner = np.where(a[:, 18:, 32:].mean(axis=(1, 2)) < 12)[0]
dark = [i for i in np.where(a.mean(axis=(1, 2)) < 14)[0] if 1.5 < t[i] < 291]
d = np.abs(np.diff(a, axis=0)).mean(axis=(1, 2))
runs, s = [], None
for i, v in enumerate(d):
    if v < .05: s = i if s is None else s
    else:
        if s is not None and i - s > 48: runs.append((round(t[s], 2), round(t[i], 2)))
        s = None
print(f'{len(a)} frames  corner-bad {len(corner)}  dark {len(dark)} {[round(t[i],2) for i in dark[:6]]}  frozen>2s {runs}')
