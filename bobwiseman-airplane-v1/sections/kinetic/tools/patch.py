#!/usr/bin/env python3
"""Patch re-rendered frame spans into an existing section render without touching the rest of its bitstream.

python3 tools/patch.py <old.mp4> <out.mp4> <t0 seconds of frame 0> <cuts csv> <seg_index=framesdir> ...
  cuts: keyframe numbers of old.mp4 (local) to split at, e.g. 626,725,1639
  each patched segment index (0-based between cuts) is replaced by JPEG frames from framesdir,
  encoded with the same x264 settings render.mjs uses (crf 18, preset medium, yuv420p).
Untouched segments are stream-copied, so their decoded frames are bit-identical to old.mp4.
Audio is re-muxed from assets/song.wav exactly as render.mjs does it.
"""
import os, subprocess, sys, tempfile, shutil

old, out, t0, cuts = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
patches = dict((int(a.split('=')[0]), a.split('=')[1]) for a in sys.argv[5:])
run = lambda *c: subprocess.run(c, check=True, capture_output=True, text=True).stdout
tmp = tempfile.mkdtemp(prefix='patch_', dir='out')
run('ffmpeg', '-y', '-loglevel', 'error', '-i', old, '-map', '0:v', '-c', 'copy', '-f', 'segment', '-segment_frames', cuts,
    '-reset_timestamps', '1', '-segment_format', 'mp4', f'{tmp}/seg_%02d.mp4')
segs = sorted(f for f in os.listdir(tmp) if f.startswith('seg_'))
bounds = [0] + [int(c) for c in cuts.split(',')]
count = lambda f: int(run('ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', f).split()[0].strip(','))
total = 0; counts = []
for i, f in enumerate(segs):
    n = count(f'{tmp}/{f}')
    if i in patches:
        d = patches[i]; m = len([x for x in os.listdir(d) if x.endswith('.jpg')])
        assert m == n, f'segment {i}: old has {n} frames, {d} has {m}'
        run('ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-i', f'{d}/f_%06d.jpg', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
            '-pix_fmt', 'yuv420p', '-f', 'mp4', f'{tmp}/{f}')
    print(f'segment {i}: frames {bounds[i]}..{bounds[i] + n - 1} ({n}) {"PATCHED from " + patches[i] if i in patches else "stream copy"}')
    total += n; counts.append(n)
with open(f'{tmp}/list.txt', 'w') as fh:
    # explicit durations: without them the concat demuxer overlaps segments by a frame (duplicate pts)
    fh.writelines(f"file '{os.path.abspath(tmp)}/{f}'\nduration {n / 24}\n" for f, n in zip(segs, counts))
run('ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list.txt', '-ss', str(t0), '-i', 'assets/song.wav',
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', 'apad', '-frames:v', str(total), '-t', str(total / 24), '-c:a', 'aac', '-b:a', '256k',
    '-movflags', '+faststart', out)
print('wrote', out, total, 'frames')
shutil.rmtree(tmp)
