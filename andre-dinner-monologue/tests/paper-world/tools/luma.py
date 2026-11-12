"""Mean relative luminance of every frame of a video, to find the darkest stretch and the brightest frame.
Run: $PY tools/luma.py <mp4> <first film frame>. Prints one line a second and a summary."""
import subprocess, sys
import numpy as np
path, f0 = sys.argv[1], int(sys.argv[2])
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', 'scale=90:160:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
c = np.frombuffer(raw, np.uint8).reshape(-1, 160, 90, 3) / 255.0
lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
y = (lin @ np.array([0.2126, 0.7152, 0.0722])).mean(axis=(1, 2))
for i in range(0, len(y), 24): print(f"f{f0 + i}  {y[i]:.3f}  {'#' * int(y[i] * 200)}")
k = np.convolve(y, np.ones(48) / 48, mode='valid')
print(f"frames {len(y)}; brightest frame f{f0 + int(y.argmax())} ({y.max():.3f}); darkest frame f{f0 + int(y.argmin())} ({y.min():.3f}); darkest two seconds start f{f0 + int(k.argmin())} ({k.min():.3f}); brightest two seconds start f{f0 + int(k.argmax())} ({k.max():.3f})")
