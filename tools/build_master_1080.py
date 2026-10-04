import json, subprocess, sys
import os; assert len(sys.argv)==3 and not os.path.exists(sys.argv[1]), "usage: build_v4b.py NEW_OUTPUT PLAN (output must not exist)"
plan=json.load(open(sys.argv[2]))
W='/Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-airplane-on-the-highway/source/airplane-2026.wav'
inputs=['-i','base_v4d_1080.mp4']; fc=[]; last='[0:v]'
for k,p in enumerate(plan,1):
    act=p['e']-p['s']+1; win=p['b']-p['a']
    L=min(win,act) if act>=12 else max(act,12)
    start=p['a']+(win-L)//2
    fd=p.get('fd',min(6,L//3)); fdo=max(1,p.get('fdo',fd))
    inputs+=['-i',p['file']]
    fc.append(f"[{k}:v]trim=start_frame={p['s']}:end_frame={p['e']+1},setpts=(PTS-STARTPTS)*{L}/{act},fps=24,scale=1920:1080:flags=lanczos,trim=end_frame={L},setpts=PTS-STARTPTS,format=yuva420p,"
              f"fade=t=in:s=0:n={fd}:alpha=1,fade=t=out:s={L-fdo}:n={fdo}:alpha=1,setpts=PTS+{start}/24/TB[m{k}]")
    fc.append(f"{last}[m{k}]overlay=eof_action=pass:repeatlast=0[v{k}]"); last=f'[v{k}]'
    print(p['name'],'overlay frames',start,'-',start+L)
fc.append(f"{last}format=yuv420p[vout]")
cmd=['nice','-n','10','ffmpeg','-v','error','-y']+inputs+['-i',W,'-filter_complex',';'.join(fc),'-map','[vout]','-map',f'{len(plan)+1}:a',
     '-c:v','libx264','-crf','16','-maxrate','20M','-bufsize','40M','-preset','slow','-pix_fmt','yuv420p','-c:a','aac','-b:a','320k','-movflags','+faststart',sys.argv[1]]
open('master_cmd.txt','w').write(' '.join(cmd))
subprocess.run(cmd,check=True)
