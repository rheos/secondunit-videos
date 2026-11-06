from pathlib import Path
import hashlib, json, subprocess, wave
import numpy as np

root=Path(__file__).resolve().parent
movie=root/'out/travel-agent_journey_f00000-f05280_24fps_study-v8-development.mp4'
opening=root.parent/'retry-v7-departure/out/picture.mp4'
source=root.parent/'source/travel-agent.mp3'
sha='78c9f34dc2bb94801693ed5ce4349733c0be25bfb610a1b061dbc9e10923f77d'
assert hashlib.sha256(source.read_bytes()).hexdigest()==sha, 'Source recording changed'

def probe(args):
    return json.loads(subprocess.check_output(['/usr/local/bin/ffprobe','-v','error',*args,'-of','json']))

streams=probe(['-show_streams',str(movie)])['streams']
v=next(s for s in streams if s['codec_type']=='video')
a=next(s for s in streams if s['codec_type']=='audio')
assert int(v['nb_frames'])==5280, v
assert v['r_frame_rate']=='24/1' and v['avg_frame_rate']=='24/1', v
assert [v['width'],v['height']]==[1920,1080], v
assert abs(float(v['duration'])-220)<.01
assert abs(float(a['duration'])-220)<.03

def packets(file):
    return probe(['-select_streams','v:0','-show_packets','-show_entries','packet=pts_time,data_hash','-show_data_hash','sha256',str(file)])['packets']

old=packets(opening);new=packets(movie)
assert len(old)==2160 and len(new)==5280
# Concat injects SPS/PPS headers into copied keyframes. Compare decoded pictures
# rather than incorrectly treating that container/codec-header change as re-encoding.
packet_header_changes=sum(x['data_hash']!=y['data_hash'] for x,y in zip(old,new))
def frame_hashes(file):
    text=subprocess.check_output(['/usr/local/bin/ffmpeg','-v','error','-threads','2','-i',str(file),'-t','90','-map','0:v:0','-an','-f','framemd5','-']).decode()
    return [line.split(',')[-1].strip() for line in text.splitlines() if line and not line.startswith('#')]
old_frames=frame_hashes(opening);new_frames=frame_hashes(movie)
assert len(old_frames)==len(new_frames)==2160
assert old_frames==new_frames, 'Opening decoded pictures changed'
pts=np.sort([float(p['pts_time']) for p in new])
assert abs(pts[0])<1e-6
assert np.max(np.abs(np.diff(pts)-1/24))<2e-6, 'Picture timestamp discontinuity'
assert abs(pts[2160]-90)<1e-6

# Decode the whole file, including audio, to catch damaged streams or assembly errors.
subprocess.run(['/usr/local/bin/ffmpeg','-v','error','-i',str(movie),'-f','null','-'],check=True)
pcm=subprocess.check_output(['/usr/local/bin/ffmpeg','-v','error','-i',str(movie),'-map','0:a:0','-ar','16000','-ac','1','-f','s16le','-'])
rendered=np.frombuffer(pcm,dtype='<i2').astype(float)
with wave.open(str(root.parent/'source/full-analysis.wav')) as f:
    original=np.frombuffer(f.readframes(220*16000),dtype='<i2').astype(float)
checks=[]
for sec in [1,35,70,89,90,96,118,147,166,182,199,217]:
    n=sec*16000;ref=original[n:n+16000];best=(-2,None)
    for lag in range(-8,9):
        test=rendered[n+lag:n+lag+16000]
        correlation=float(np.dot(ref,test)/(np.linalg.norm(ref)*np.linalg.norm(test)+1e-12))
        if correlation>best[0]:best=(correlation,lag)
    assert best[0]>.98, (sec,best)
    assert best[1]==0, (sec,best)
    checks.append({'seconds':sec,'correlation':best[0],'offset_samples_16k':best[1]})

edit=json.loads((root/'edit.json').read_text())
assert edit[0]['startFrame']==0 and edit[-1]['endFrame']==5280
assert all(x['endFrame']==y['startFrame'] for x,y in zip(edit,edit[1:])), 'Edit frame gap'
report={'frame_count':5280,'fps':24,'dimensions':[1920,1080],'duration_seconds':220,'decode':'pass','timestamp_continuity':'pass','original_opening_decoded_frames':'2160 identical YUV frame hashes','copied_keyframe_header_changes':packet_header_changes,'audio_alignment':checks,'source_audio_sha256':sha,'review':'Technical checks only. Visual staging review and limitations are in docs/REVIEW.md.'}
(root/'out/validation.json').write_text(json.dumps(report,indent=2)+'\n')
side={'schema':'secondunit.take/1','song':{'id':'travel-agent','sha256':sha},'take':{'id':'journey-v8-development','project':str(root),'method':'code-painted: original geometry and choreography, WebGL underpainting, adapted functional-emotions brushstroke renderer','provenance':str(root/'out/manifest.json'),'sources':[]},'kind':'composite','fps':24,'frames':5280,'file_frames':[0,5280],'song_frames':[0,5280],'song_seconds':[0,220],'video':{'width':1920,'height':1080,'codec':v['codec_name'],'pix_fmt':v['pix_fmt'],'alpha':False},'audio':{'present':True,'source':str(source)},'lyric_lines':[],'status':'review','file_bytes':movie.stat().st_size}
Path(str(movie)+'.json').write_text(json.dumps(side,indent=2)+'\n')
print(json.dumps({'file':str(movie),'duration':220,'frames':5280,'checks':'decode, timestamps, source hash, opening decoded-frame preservation, contiguous edit and audio alignment passed','audio_minimum_correlation':min(c['correlation'] for c in checks),'audio_offset_samples':0},indent=2))
