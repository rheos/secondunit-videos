"""Check the source pin and decoded audio alignment at several positions of a named review cut."""
from pathlib import Path
import subprocess,hashlib,json,sys,re
import numpy as np
from scipy.signal import correlate
movie=Path(sys.argv[1]).resolve(); root=movie.parent.parent
m=re.search(r'_f(\d+)-f(\d+)_',movie.name); assert m
first,end=map(int,m.groups()); start=first/24; duration=(end-first)/24
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
pinned=(root/'source/all-the-trees.wav.sha256').read_text().split()[0]
assert sha(root/'source/all-the-trees.wav')==pinned==sha(root/'assets/song.wav')
def pcm(path,offset,length):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-ss',str(offset),'-t',str(length),'-i',str(path),'-ac','1','-ar','16000','-f','f32le','-']),np.float32)
windows=[]
for offset in [0,duration/2,max(0,duration-10.1)]:
 length=min(10,duration-offset-.05); a=pcm(root/'assets/song.wav',start+offset,length); b=pcm(movie,offset,length)
 n=min(len(a),len(b)); a=a[:n];b=b[:n];cc=correlate(b,a,mode='full',method='fft');lag=int(np.argmax(cc)-(n-1));r=float(np.corrcoef(a,b)[0,1])
 assert abs(lag)<=80 and r>.97,(offset,lag,r)
 windows.append({'songStart':start+offset,'seconds':n/16000,'lagMilliseconds':lag/16,'correlation':r})
out={'pinnedAudioUnchanged':True,'sourceRangeSeconds':[start,end/24],'windows':windows}
(movie.parent/(movie.stem.split('_f')[0]+'_audio-audit.json')).write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))
