"""Flash-safety check for a finished cut (WCAG 2.3.1 general flash threshold).

    flashcheck.py <video>...      (needs numpy: run it with $MV_PYTHON, see the video-production skill)

A flash is a pair of opposing changes in relative luminance of 0.1 or more where the darker state is
below 0.8. More than 3 flashes in any one second fails, unless the flashing area is small. The small
area is a quarter of a 10-degree field, about a third of the frame each way, so this measures the mean
luminance of 25 overlapping windows that size (5 x 5, half-window steps) plus the whole frame.
Saturated-red flashes (the second WCAG rule) are not measured. Exits 1 if any file fails."""
import json, subprocess, sys
import numpy as np

W, H = 96, 54


def fps_of(path):
    s = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                   'stream=r_frame_rate', '-of', 'json', path], capture_output=True, text=True).stdout)
    n, d = s['streams'][0]['r_frame_rate'].split('/')
    return float(n) / float(d)


def luminance(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}:flags=area', '-f', 'rawvideo',
                          '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    c = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3) / 255.0
    lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return lin @ np.array([0.2126, 0.7152, 0.0722])


def windows(L):
    ww, wh = W // 3, H // 3
    out = {'whole frame': L.mean(axis=(1, 2))}
    for iy in range(5):
        for ix in range(5):
            x, y = ix * ww // 2, iy * wh // 2
            out[f'window {ix},{iy}'] = L[:, y:y + wh, x:x + ww].mean(axis=(1, 2))
    return out


def transitions(s):
    """Frame indexes of luminance changes of 0.1 or more with the darker side under 0.8, alternating."""
    # d is the direction of the last change: after a rise track the peak (hi), after a fall the trough (lo)
    out, d, lo, hi = [], 0, s[0], s[0]
    for i, v in enumerate(s[1:], 1):
        if d >= 0 and hi - v >= 0.1 and v < 0.8:
            out.append(i); d, lo = -1, v
        elif d <= 0 and v - lo >= 0.1 and lo < 0.8:
            out.append(i); d, hi = 1, v
        else:
            if d >= 0: hi = max(hi, v)
            if d <= 0: lo = min(lo, v)
    return out


def worst_second(tr, fps):
    best, at = 0, None
    for k, f in enumerate(tr):
        n = sum(1 for g in tr[k:] if g < f + fps)
        if n > best: best, at = n, f
    return best / 2, at


bad = 0
for path in sys.argv[1:]:
    fps = fps_of(path)
    L = luminance(path)
    results = sorted(((worst_second(transitions(s), fps), name) for name, s in windows(L).items()), key=lambda r: -r[0][0])
    (flashes, at), name = results[0]
    over = [r for r in results if r[0][0] > 3]
    verdict = 'FAIL' if over else 'PASS'
    when = f' at {at / fps:.2f} s (frame {at}), {name}' if at is not None else ''
    print(f'{verdict}  {path.split("/")[-1]}  {len(L)} frames  worst {flashes:g} flashes in one second{when}')
    for (f2, at2), n2 in over[1:6]:
        print(f'        also {f2:g} at {at2 / fps:.2f} s, {n2}')
    bad += bool(over)
sys.exit(1 if bad else 0)
