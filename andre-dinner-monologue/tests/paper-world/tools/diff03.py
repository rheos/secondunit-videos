"""Which frames differ between two renders, and by how much: share of pixels whose luma moved more than 10 (of 255).
Run: $PY tools/diff03.py <frames A> <frames B>. Prints runs of frames that changed and runs that did not."""
import subprocess, sys
import numpy as np
a, b = sys.argv[1], sys.argv[2]
def load(d, f):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f'{d}/f{f:04d}.jpg', '-vf', 'scale=180:320', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).astype(np.float32)
share = {f: float((np.abs(load(a, f) - load(b, f)) > 10).mean()) for f in range(1800, 2544)}
runs, start, state = [], 1800, share[1800] > 0.002
for f in range(1801, 2545):
    s = share[f] > 0.002 if f < 2544 else None
    if s != state:
        seg = [share[k] for k in range(start, f)]
        runs.append(f"f{start}-f{f - 1}: {'CHANGED' if state else 'same   '}  pixels changed: mean {100 * np.mean(seg):.2f}%  max {100 * max(seg):.2f}%")
        start, state = f, s
print('\n'.join(runs))
