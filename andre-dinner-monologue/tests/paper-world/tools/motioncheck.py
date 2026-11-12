"""How much the picture changes between frames a second apart: mean absolute difference of the luma (0-255)
and the share of pixels that changed by more than 12. Run: $PY tools/motioncheck.py <frames dir> <f0> <f1> <step>"""
import subprocess, sys
import numpy as np
d, f0, f1, step = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
def load(f):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f'{d}/f{f:04d}.jpg', '-vf', 'scale=180:320', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).astype(np.float32)
prev, worst = load(f0), None
for f in range(f0 + step, f1 + 1, step):
    cur = load(f); mad = float(np.abs(cur - prev).mean()); share = float((np.abs(cur - prev) > 12).mean())
    print(f'f{f - step}-f{f}: mean change {mad:5.1f}  pixels changed {share * 100:4.0f}%')
    if worst is None or share < worst[1]: worst = (f, share)
    prev = cur
print(f'least change: f{worst[0] - step}-f{worst[0]} with {worst[1] * 100:.0f}% of pixels changed')
