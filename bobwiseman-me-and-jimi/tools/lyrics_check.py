"""Checks a captioned render against the master it was made from.
  lyrics_check.py <new.mp4> <master.mp4> <master_start_frame> <band> [<band> ...]
band = 'y0:y1' in fractions of the height: rows no caption label touches. Per frame: the new and master pictures
are compared (64 px wide, grey) inside the bands only, so a caption makes no difference but a wrong, shifted,
blank or half-drawn frame does. Prints the frame count, blank frames (lower-right quadrant near black or near
white), and every frame whose band difference is 4x the clip's median (and over 6 levels). Exits 1 on any."""
import subprocess, sys, numpy as np

def frames(f, w, h, ss=None, n=None):
    cmd = ['ffmpeg', '-v', 'error'] + (['-ss', f'{ss:.6f}'] if ss is not None else []) + ['-i', f]
    cmd += (['-frames:v', str(n)] if n else []) + ['-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.uint8).reshape(-1, h, w).astype(np.int16)

new, master, f0 = sys.argv[1], sys.argv[2], int(sys.argv[3])
bands = [tuple(map(float, b.split(':'))) for b in sys.argv[4:]]
wh = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', new],
                    capture_output=True, text=True, check=True).stdout.strip().split(',')
W = 64; H = round(W * int(wh[1]) / int(wh[0]))
a = frames(new, W, H)
b = frames(master, W, H, ss=f0 / 24, n=len(a))
n = min(len(a), len(b)); a, b = a[:n], b[:n]
rows = np.zeros(H, bool)
for y0, y1 in bands: rows[int(y0 * H):int(np.ceil(y1 * H))] = True
d = np.abs(a[:, rows] - b[:, rows]).mean(axis=(1, 2))
q = a[:, H // 2:, W // 2:].mean(axis=(1, 2))
blank = np.where((q < 12) | (q > 248))[0]
med = float(np.median(d)); odd = np.where((d > 4 * med) & (d > 6))[0]
print(f'{new.split("/")[-1]}: {len(a)} frames; band diff vs master median {med:.2f}, max {d.max():.2f} at frame {f0 + int(d.argmax())}')
print(f'  blank: {len(blank)} {list(blank[:8] + f0)}   odd: {len(odd)} {[(int(i) + f0, round(float(d[i]), 1)) for i in odd[:12]]}')
sys.exit(1 if len(blank) or len(odd) else 0)
