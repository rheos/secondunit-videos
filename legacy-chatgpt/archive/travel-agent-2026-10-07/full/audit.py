"""Validate the finished export's frame coverage, decode, and source-audio alignment."""
from pathlib import Path
import json, subprocess, wave, numpy as np

root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'full/manifest.json').read_text())
movie=root/'out/full'/manifest['filename']
probe=json.loads(subprocess.check_output(['/usr/local/bin/ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video')
a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert int(v['nb_frames'])==manifest['frames'],v
assert (v['width'],v['height'])==(1920,1080)
assert v['r_frame_rate']=='24/1'
assert abs(float(v['duration'])-manifest['duration'])<.001
assert abs(float(a['duration'])-403.35675)<.06
print('Picture: 9,681 frames, 1920×1080, 24 fps; sound duration matches source.',flush=True)
subprocess.run(['/usr/local/bin/ffmpeg','-v','error','-i',str(movie),'-f','null','-'],check=True,stdout=subprocess.DEVNULL)
pcm=subprocess.check_output(['/usr/local/bin/ffmpeg','-v','error','-i',str(movie),'-map','0:a:0','-ar','16000','-ac','1','-f','s16le','-'])
rendered=np.frombuffer(pcm,dtype='<i2').astype(np.float64)
with wave.open(str(root/'source/full-analysis.wav')) as f:
    original=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(np.float64)
samples=[]
for sec in [10,100,205,310,395]:
    start=sec*16000; ref=original[start:start+16000]; best=(-2,None)
    for lag in range(-40,41):
        test=rendered[start+lag:start+lag+16000]
        score=float(np.dot(ref,test)/(np.linalg.norm(ref)*np.linalg.norm(test)+1e-12))
        if score>best[0]:best=(score,lag)
    assert best[0]>.97,(sec,best)
    samples.append({'seconds':sec,'correlation':round(best[0],6),'offset_samples_at_16kHz':best[1]})
    print(f'Audio at {sec}s: correlation {best[0]:.5f}, offset {best[1]} samples',flush=True)
assert max(s['offset_samples_at_16kHz'] for s in samples)-min(s['offset_samples_at_16kHz'] for s in samples)<=2
report={'file':str(movie),'frames':int(v['nb_frames']),'picture_duration':float(v['duration']),'audio_duration':float(a['duration']),'dimensions':[v['width'],v['height']],'full_decode':'passed','audio_alignment':samples,'visual_review':'Start, midpoint and end stills generated for all 61 shots; midpoint and ending sheets reviewed, with targeted repairs to framing, action continuity and foreground occlusion.','source_signature':manifest['signature']}
(root/'out/full/validation.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS: full decode, frame coverage and audio alignment.',flush=True)
