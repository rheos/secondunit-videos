"""Section 5 must not change when the engine does. Compares two folders of frames (PNG or JPEG, same names) and, if
given, a third (the delivered test 04 frames): mean absolute difference per channel, of 255, and the largest.
Run: $PY tools/regress.py <before> <after> [<test 04 frames>]   Fails (exit 1) if before/after differ by 1 or more."""
import subprocess, sys, glob, os
import numpy as np
def load(p):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).astype(np.float32)
a, b = sys.argv[1], sys.argv[2]; ref = sys.argv[3] if len(sys.argv) > 3 else None; bad = 0
for p in sorted(glob.glob(os.path.join(a, 'f*.*'))):
    n = os.path.basename(p); q = os.path.join(b, n)
    if not os.path.exists(q): continue
    x, y = load(p), load(q); d = np.abs(x - y); line = f"{n[:5]}  before vs after: mean {d.mean():.4f}  max {d.max():.0f}  pixels over 2: {100 * (d > 2).mean():.4f}%"
    if d.mean() >= 1: bad += 1
    if ref:
        r = os.path.join(ref, n[:5] + '.jpg')
        if os.path.exists(r): d2 = np.abs(y - load(r)); line += f"   after vs test 04's frame (JPEG): mean {d2.mean():.3f}  max {d2.max():.0f}"
    print(line)
print('PASS: section 5 is unchanged' if not bad else f'FAIL: {bad} frames differ by 1 or more')
sys.exit(1 if bad else 0)
