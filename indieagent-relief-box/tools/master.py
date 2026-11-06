"""master.py · take a Kits.ai master of the loop's sound and make it the loop's mix, keeping the original width.

    python -I tools/master.py <original sNN.wav> <kits master of the x3 file.wav> <out sNNw.wav> [--loop 24] [--keep-width]

Kits.ai's AI Mastering is web-only (its API has no mastering endpoint, and the free tier may not use the API at all),
so the flow is by hand: concat the loop three times (tools/master.py --x3 makes the upload file), upload it at
app.kits.ai -> AI Mastering, pick a preset (Punch & Air on 2026-10-25, Robin: "pretty good"), download. This script
cuts the MIDDLE pass out of the mastered file (the processors are in steady state at both ends, so the loop stays
seamless), resamples to 48 kHz 16-bit, and, with --keep-width, replaces the master's stereo with the original mix's:
the master's mid (its tone and level) plus the original side scaled to the original side/mid ratio. Punch & Air
folded the image from an L/R correlation of 0.23 to 0.86, which flattened the panned events and the ping-pong echo;
restoring the side costs about 4 dB of headroom, so the result sits between the master and the original in level.
"""
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np


def read(p):
    w = wave.open(str(p))
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64).reshape(-1, w.getnchannels()) / 32768
    return a, w.getframerate()


def write(p, a, sr):
    w = wave.open(str(p), 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()


def stats(name, a, sr):
    mono = a.mean(axis=1); peak = np.abs(a).max(); rms = np.sqrt((mono ** 2).mean())
    corr = np.corrcoef(a[:, 0], a[:, 1])[0, 1]
    print(f'{name}: peak {20 * np.log10(peak):.1f} dBFS, rms {20 * np.log10(rms):.1f}, L/R corr {corr:.2f}')


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    opts = [a for a in sys.argv[1:] if a.startswith('--')]
    loop = 24.0
    for o in opts:
        if o.startswith('--loop='): loop = float(o.split('=', 1)[1])
    if '--x3' in opts:                                     # make the upload file: the loop three times
        src, out = map(Path, args[:2])
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-i', src, '-i', src, '-filter_complex', '[0:a][1:a][2:a]concat=n=3:v=0:a=1[a]', '-map', '[a]', '-c:a', 'pcm_s16le', out], check=True)
        print('upload file:', out); return
    orig, master, out = map(Path, args[:3])
    mid_path = out.with_name(out.stem + '_mid.wav')
    # the middle pass, at the loop's rate and depth
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', master, '-ss', str(loop), '-t', str(loop), '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', mid_path], check=True)
    m, sr = read(mid_path); o, sr_o = read(orig)
    assert sr == sr_o, (sr, sr_o)
    n = min(len(o), len(m)); o, m = o[:n], m[:n]
    stats('original', o, sr); stats('master   ', m, sr)
    if '--keep-width' in opts:
        mid_m = m.mean(axis=1); mid_o = o.mean(axis=1); side_o = (o[:, 0] - o[:, 1]) / 2
        ratio = np.sqrt((side_o ** 2).mean()) / np.sqrt((mid_o ** 2).mean())
        side = side_o * (ratio * np.sqrt((mid_m ** 2).mean()) / np.sqrt((side_o ** 2).mean()))
        res = np.stack([mid_m + side, mid_m - side], 1)
        g = min(1.0, 0.98 / np.abs(res).max()); res *= g
        print(f'width restored, gain {20 * np.log10(g):.1f} dB')
    else:
        res = m
    write(out, res, sr); mid_path.unlink()
    stats('out      ', res, sr)
    print('wrote', out)


if __name__ == '__main__':
    main()
