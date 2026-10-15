"""Compare a span of the full-song 9:16 final with a delivered 9:16 verse clip, frame by frame at 360x640 (#117).
Usage: <venv>/python tools/verse_check.py <full 9x16.mp4> <verse clip.mp4> <clip first song frame>
Prints the song frames whose 8x8 block means differ by more than 22 levels (a real change, not encode noise)."""
import subprocess, sys, numpy as np
full, clip, f0 = sys.argv[1], sys.argv[2], int(sys.argv[3]); W, H = 360, 640
def fr(f, vf):
    p = subprocess.Popen(['ffmpeg','-v','error','-i',f,'-vf',vf+f',scale={W}:{H}:flags=area','-f','rawvideo','-pix_fmt','gray','-'], stdout=subprocess.PIPE)
    while (b := p.stdout.read(W*H)) and len(b) == W*H: yield np.frombuffer(b,np.uint8).reshape(H,W).astype(np.int16)
n=0; bad=[]
for i,(c,a) in enumerate(zip(fr(clip,'null'), fr(full, f'trim=start_frame={f0},setpts=PTS-STARTPTS'))):
    n+=1; m=np.abs(a-c).reshape(H//8,8,W//8,8).mean(axis=(1,3))>22
    if m.any(): bad.append(f0+i)
print(f'{clip.split("/")[-1]}: {n} frames compared from f{f0}; differing frames: {len(bad)} {bad[:20]}')
