# python3 splice.py <old.mp4> <frames_dir> <out.mp4> <t0> <dur> <a-b,c-d,...>
# Patch an encoded take: GOPs of <old.mp4> that do not touch the changed local-frame spans are stream-copied bit for bit;
# GOPs that do are re-encoded from the freshly rendered JPEG frames with render.mjs's settings. Audio re-muxed from the song.
import subprocess, sys, os, tempfile
old, fdir, out, t0, dur, spans = sys.argv[1:7]
spans = [tuple(map(int, s.split('-'))) for s in spans.split(',')]
run = lambda *a: subprocess.run(a, check=True, capture_output=True, text=True).stdout
kf = [i for i, l in enumerate(run('ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'frame=key_frame', '-of', 'csv=p=0', old).split()) if l.startswith('1')]
n = int(run('ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', old).strip().strip(','))
gops = [(a, b) for a, b in zip(kf, kf[1:] + [n])]
tmp = tempfile.mkdtemp(prefix='splice_')
run('ffmpeg', '-y', '-loglevel', 'error', '-i', old, '-an', '-c', 'copy', '-f', 'segment', '-segment_frames', ','.join(map(str, kf[1:])), '-reset_timestamps', '1', f'{tmp}/old_%03d.mp4')
lst, plan = [], []
for gi, (a, b) in enumerate(gops):
    hit = any(a <= e and s < b for s, e in spans)
    if hit:
        seg = f'{tmp}/new_{gi:03d}.mp4'
        run('ffmpeg', '-y', '-loglevel', 'error', '-framerate', '24', '-start_number', str(a), '-i', f'{fdir}/f_%06d.jpg', '-frames:v', str(b - a),
            '-c:v', 'libx264', '-preset', 'medium', '-crf', os.environ.get('CRF', '18'), '-pix_fmt', 'yuv420p', seg)
    else: seg = f'{tmp}/old_{gi:03d}.mp4'
    lst.append(f"file '{seg}'"); plan.append(f"{a}-{b - 1}:{'NEW' if hit else 'copy'}")
open(f'{tmp}/list.txt', 'w').write('\n'.join(lst) + '\n')
run('ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/list.txt', '-c', 'copy', f'{tmp}/video.mp4')
run('ffmpeg', '-y', '-loglevel', 'error', '-i', f'{tmp}/video.mp4', '-ss', t0, '-t', dur, '-i', 'assets/song.wav', '-map', '0:v', '-map', '1:a',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out)
print(' '.join(plan))
