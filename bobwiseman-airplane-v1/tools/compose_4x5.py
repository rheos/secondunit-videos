"""Splice the redrawn kinetic sections into the 4:5 pan-and-scan cut, on the song grid.

  compose_4x5.py <base_4x5.mp4> <A_frames_dir> <K_frames_dir> <out.mp4> [--k0 8191] [--xfade 24]

base: the pan-and-scan render (864x1080, 8804 frames, master audio). A_frames_dir holds frames 0..1727 of
kinetic-4x5.html (render.mjs FRAMES_ONLY=1 f0 f1728 -> f_000000.jpg ...); K_frames_dir holds frames k0..8803.
Output = A redrawn [0, 1728) + base [1728, k0) + a crossfade base -> K over [k0, k0 + xfade) (in the master the
J2 -> K bridge dissolves over these frames, so the pan-and-scan carries the bridge and hands over to the redraw)
+ K redrawn [k0 + xfade, 8804). Audio is copied from base. Every part is frame-counted after the encode.
"""
import argparse, os, subprocess

ap = argparse.ArgumentParser()
ap.add_argument('base'); ap.add_argument('adir'); ap.add_argument('kdir'); ap.add_argument('out')
ap.add_argument('--k0', type=int, default=8191); ap.add_argument('--xfade', type=int, default=24)
ap.add_argument('--a1', type=int, default=1728); ap.add_argument('--n', type=int, default=8804)
ap.add_argument('--crf', type=int, default=20)
a = ap.parse_args()
assert not os.path.exists(a.out), 'output exists; never overwrite a review file'
na = len([f for f in os.listdir(a.adir) if f.endswith('.jpg')]); nk = len([f for f in os.listdir(a.kdir) if f.endswith('.jpg')])
assert na == a.a1, f'A frames: {na}, want {a.a1}'
assert nk == a.n - a.k0, f'K frames: {nk}, want {a.n - a.k0}'
X = a.xfade
fc = (
    f"[1:v]setpts=N/24/TB,format=yuv420p[A];"
    f"[0:v]trim=start_frame={a.a1}:end_frame={a.k0},setpts=N/24/TB,format=yuv420p[B];"
    f"[0:v]trim=start_frame={a.k0}:end_frame={a.k0 + X},setpts=N/24/TB,format=yuv420p[Xb];"
    f"[2:v]trim=start_frame=0:end_frame={X},setpts=N/24/TB,format=yuv420p[Xk];"
    f"[Xb][Xk]blend=all_expr='A*(1-(N+1)/{X + 1})+B*((N+1)/{X + 1})',format=yuv420p[XF];"
    f"[2:v]trim=start_frame={X},setpts=N/24/TB,format=yuv420p[K];"
    f"[A][B][XF][K]concat=n=4:v=1:a=0,setpts=N/24/TB[v]"
)
cmd = ['nice', '-n', '15', 'ffmpeg', '-v', 'error', '-y', '-i', a.base,
       '-framerate', '24', '-i', os.path.join(a.adir, 'f_%06d.jpg'), '-framerate', '24', '-i', os.path.join(a.kdir, 'f_%06d.jpg'),
       '-filter_complex', fc, '-map', '[v]', '-map', '0:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', str(a.crf),
       '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-frames:v', str(a.n), '-movflags', '+faststart', a.out]
subprocess.run(cmd, check=True)
n = int(subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_packets',
                        '-of', 'csv=p=0', a.out], capture_output=True, text=True, check=True).stdout.strip().strip(','))
print('wrote', a.out, n, 'frames')
assert n == a.n, f'frame count {n} != {a.n}'
