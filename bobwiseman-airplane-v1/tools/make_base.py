# python3 make_base.py <entries.txt> <out.mp4>   each line: <file or frames_dir> <local start> <local end>   (half-open frames)
# Every input is decoded, trimmed by frame number, re-timed to N/24 and joined with the concat filter, one encode.
import subprocess, sys, os
lines = [l.split() for l in open(sys.argv[1]) if l.strip() and not l.startswith('#')]
args, fc, cat, tot = [], [], '', 0
for i, (src, a, b) in enumerate(lines):
    a, b = int(a), int(b); tot += b - a
    args += (['-framerate', '24', '-i', f'{src}/f_%06d.jpg'] if os.path.isdir(src) else ['-i', src])
    fc.append(f'[{i}:v]trim=start_frame={a}:end_frame={b},setpts=N/24/TB,scale=1280:720,format=yuv420p,setsar=1[v{i}]'); cat += f'[v{i}]'
fc.append(f'{cat}concat=n={len(lines)}:v=1:a=0[out]')
print('total frames', tot)
subprocess.run(['nice', '-n', '10', 'ffmpeg', '-v', 'error', '-y'] + args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-r', '24', '-c:v', 'libx264', '-crf', '15', '-preset', 'fast', sys.argv[2]], check=True)
