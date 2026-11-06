"""List frames whose lower-right quadrant is near black (a mis-scaled render worker draws a tiny picture
in the top-left corner on black). Usage: badframes.py <mp4>... ; prints count and first frame indexes."""
import subprocess, sys, numpy as np
for f in sys.argv[1:]:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', 'scale=32:18,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, 18, 32)
    bad = np.where(a[:, 9:, 16:].mean(axis=(1, 2)) < 12)[0]
    print(f'{len(bad):4d}/{len(a)} bad  {f.split("/")[-1]}  {list(bad[:8])}')
