"""Extract reviewable harmonic onset candidates; never infer instrument certainty from flux alone."""
import json, pathlib, sys
import numpy as np, scipy.signal as sig, scipy.ndimage as ndi, soundfile as sf
from math import gcd
from PIL import Image, ImageDraw
src=pathlib.Path(sys.argv[1]); out=pathlib.Path(sys.argv[2]); out.mkdir(parents=True,exist_ok=True)
y,sr=sf.read(src); y=y.mean(axis=1) if y.ndim>1 else y
# Optional absolute range; analyse with two seconds of context at each edge.
lo=float(sys.argv[3]) if len(sys.argv)>3 else 47.; hi=float(sys.argv[4]) if len(sys.argv)>4 else 79.5
start=max(0,lo-2); stop=min(len(y)/sr,hi+2); y=y[int(start*sr):int(stop*sr)]; d=gcd(sr,22050); y=sig.resample_poly(y,22050//d,sr//d); sr=22050
sos=sig.butter(4,[400,2500],btype='bandpass',fs=sr,output='sos'); y=sig.sosfiltfilt(sos,y)
hop=220; f,tt,Z=sig.stft(y,fs=sr,nperseg=2048,noverlap=2048-hop); S=np.abs(Z)*1024
h=ndi.median_filter(S,size=(1,21)); p=ndi.median_filter(S,size=(31,1)); H=S*h*h/(h*h+4*p*p+1e-12)
# Relative spectral flux keeps the quiet late notes visible alongside the opening notes.
L=np.log1p(H*12); flux=np.maximum(0,np.diff(L,axis=1)).mean(axis=0)
flux=sig.savgol_filter(flux,5,2); local=sig.savgol_filter(flux,101,2); score=flux/(.0001+np.maximum(local,0))
peaks,_=sig.find_peaks(score,height=1.05,prominence=.32,distance=18)
times=start+(peaks+1)*hop/sr
notes=[{'time':round(float(t),3),'strength':round(float(min(1,score[p]/4)),3)} for t,p in zip(times,peaks) if lo<=t<hi]
obj={'method':'400–2500 Hz, harmonic HPSS, positive log spectral flux / local envelope; candidates for review, not isolated trumpet transcription','sampleRate':sr,'hopSamples':hop,'onsets':notes}
(out/'brass-candidates.json').write_text(json.dumps(obj,indent=2)+'\n')
# Linear-frequency diagnostic: harmonic ridges and candidate onsets on the same song clock.
a=H[(f>=400)&(f<=2500)]
a=np.clip((20*np.log10(a+1e-6)+52)/60,0,1); a=np.flipud(a)
im=Image.fromarray(np.uint8(a*255)).resize((1600,480)); im=Image.merge('RGB',(im,im,im)); draw=ImageDraw.Draw(im)
for note in notes:
 x=int((note['time']-start)/(stop-start)*1600);draw.line((x,0,x,480),fill=(220,60,40));draw.text((x+2,5),str(note['time']),fill=(255,200,100))
for t in range(int(start)+1,int(stop),4):draw.text((int((t-start)/(stop-start)*1600),460),str(t),fill=(90,255,255))
im.save(out/'brass-onsets.png'); print(json.dumps({'range':[lo,hi],'candidates':len(notes),'first':notes[0]['time'],'last':notes[-1]['time']}))
