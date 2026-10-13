"""Inspect an encoded look test and make its labelled 2.5-second review strip."""
from pathlib import Path
import subprocess,json,math,sys,re
import numpy as np
from PIL import Image,ImageDraw,ImageFont
movie=Path(sys.argv[1]); out=movie.parent; fps=24
match=re.search(r'_f(\d+)-f(\d+)_',movie.name); assert match, 'Movie name must specify its song-frame range'
first,end=map(int,match.groups()); start=first/fps; count=end-first; duration=count/fps
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]))
v=next(x for x in info['streams'] if x['codec_type']=='video'); a=next(x for x in info['streams'] if x['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1280,720,'24/1',count)
assert abs(float(info['format']['duration'])-duration)<.05
# Fixed frame indices, not fps-filter sampling: song time 47 + i*2.5 exactly.
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(movie),'-vf',"select='not(mod(n,60))',scale=480:270",'-fps_mode','vfr','-f','rawvideo','-pix_fmt','rgb24','-'])
frames=np.frombuffer(raw,np.uint8).reshape(-1,270,480,3);assert len(frames)==math.ceil(count/60)
cols=4 if len(frames)>18 else 3; rows=math.ceil(len(frames)/cols)
sheet=Image.new('RGB',(cols*480,rows*300),(243,231,200));d=ImageDraw.Draw(sheet)
try:font=ImageFont.truetype('/System/Library/Fonts/Menlo.ttc',14)
except OSError:font=ImageFont.load_default()
for i,f in enumerate(frames):
 x=i%cols*480;y=i//cols*300;sheet.paste(Image.fromarray(f),(x,y));d.text((x+12,y+278),f'{start+i*2.5:05.1f}s  /  f{first+i*60:05d}',font=font,fill=(39,38,29))
strip=out/(movie.stem.split('_f')[0]+'_strip.jpg');sheet.save(strip,quality=94)
# Include trailing freezes too, unlike the inherited scanner's open-run edge case.
r=subprocess.check_output(['ffmpeg','-v','error','-i',str(movie),'-vf','scale=64:36,format=gray','-f','rawvideo','-'])
z=np.frombuffer(r,np.uint8).reshape(-1,36,64).astype(float);delta=np.abs(np.diff(z,axis=0)).mean(axis=(1,2));runs=[];begin=None
for i,val in enumerate(np.r_[delta,999]):
 if val<.05:begin=i if begin is None else begin
 elif begin is not None:
  if i-begin>48:runs.append([round(start+begin/24,3),round(start+i/24,3)])
  begin=None
bad=int((z[:,18:,32:].mean(axis=(1,2))<12).sum());dark=int((z.mean(axis=(1,2))<14).sum());assert not runs and bad==0 and dark==0
report={'duration':float(info['format']['duration']),'size':[v['width'],v['height']],'fps':v['r_frame_rate'],'frames':int(v['nb_frames']),'audioCodec':a['codec_name'],'audioChannels':a['channels'],'badCornerFrames':bad,'darkFrames':dark,'frozenOver2Seconds':runs,'contactSheet':strip.name,'contactSheetSongTimes':[47+i*2.5 for i in range(len(frames))]}
(out/(movie.stem.split('_f')[0]+'_encoded-audit.json')).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
