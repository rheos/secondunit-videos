from pathlib import Path
import json,subprocess,hashlib,wave
import numpy as np
root=Path(__file__).resolve().parent
movie=root/'out/travel-agent_night-departure_f00000-f01728_24fps_study-v3-pov.mp4'
probe=json.loads(subprocess.check_output(['/usr/local/bin/ffprobe','-v','error','-show_streams','-of','json',str(movie)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert int(v['nb_frames'])==1728
assert v['r_frame_rate']=='24/1'
assert [v['width'],v['height']]==[1920,1080]
assert abs(float(v['duration'])-72)<.01 and abs(float(a['duration'])-72)<.03
subprocess.run(['/usr/local/bin/ffmpeg','-v','error','-i',str(movie),'-f','null','-'],check=True)
pcm=subprocess.check_output(['/usr/local/bin/ffmpeg','-v','error','-i',str(movie),'-map','0:a:0','-ar','16000','-ac','1','-f','s16le','-'])
r=np.frombuffer(pcm,dtype='<i2').astype(float)
with wave.open(str(root.parent/'source/full-analysis.wav')) as f:o=np.frombuffer(f.readframes(1152000),dtype='<i2').astype(float)
checks=[]
for sec in [1,18,35,55,70]:
 n=sec*16000;ref=o[n:n+16000];best=(-2,None)
 for lag in range(-8,9):
  test=r[n+lag:n+lag+16000];co=float(np.dot(ref,test)/(np.linalg.norm(ref)*np.linalg.norm(test)+1e-12))
  if co>best[0]:best=(co,lag)
 assert best[0]>.98
 checks.append({'seconds':sec,'correlation':best[0],'offset_samples_16k':best[1]})
report={'frame_count':1728,'fps':24,'dimensions':[1920,1080],'decode':'pass','audio_alignment':checks,'review':'Technical checks only. See docs/REVIEW.md for visual review and limitations.'}
(root/'out/validation.json').write_text(json.dumps(report,indent=2)+'\n')
sha='78c9f34dc2bb94801693ed5ce4349733c0be25bfb610a1b061dbc9e10923f77d'
side={'schema':'secondunit.take/1','song':{'id':'travel-agent','sha256':sha},'take':{'id':'night-departure-v3-pov','project':str(root),'method':'code-painted: original WebGL underpainting + adapted functional-emotions brushstroke renderer','provenance':str(root/'out/manifest.json'),'sources':[]},'kind':'composite','fps':24,'frames':1728,'file_frames':[0,1728],'song_frames':[0,1728],'song_seconds':[0,72],'video':{'width':1920,'height':1080,'codec':v['codec_name'],'pix_fmt':v['pix_fmt'],'alpha':False},'audio':{'present':True,'source':str(root.parent/'source/travel-agent.mp3')},'lyric_lines':[],'status':'review','file_bytes':movie.stat().st_size}
Path(str(movie)+'.json').write_text(json.dumps(side,indent=2)+'\n')
print(json.dumps(report,indent=2))
