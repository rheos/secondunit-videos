"""Pitch-tolerant spectral template evidence, calibrated from a candidate brass passage.
This produces review evidence, never silently promotes it to a verified instrument score.
"""
import numpy as np,scipy.signal as sig,scipy.ndimage as ndi,soundfile as sf,json
from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1];out=Path('out/trumpet-v8')
y,sr=sf.read(root/'work/demucs/htdemucs/all-the-trees/no_vocals.wav');y=y.mean(1)[::2];sr//=2
f,t,z=sig.stft(y,sr,nperseg=4096,noverlap=3655);S=abs(z).astype('float32')
# Remove broad spectral bed, favour sustained narrow ridges over percussion.
H=ndi.median_filter(S,size=(1,7));P=ndi.median_filter(S,size=(31,1));S=S*H**2/(H**2+P**2+1e-12)
mask=(f>200)&(f<6200);f=f[mask];S=S[mask]
# Candidate from the classifier's strongest brass passage, to be listening-calibrated.
seed=(t>=20.9)&(t<=21.7)
base=S[:,seed];templ=[]
for j in range(0,base.shape[1],5):
 v=base[:,j:j+5].mean(1)
 for shift in range(-7,8):templ.append(np.interp(f/(2**(shift/12)),f,v,left=0,right=0))
T=np.array(templ).T
# Whiten frequency bins using the song's own long-term bed; compress loudness.
weight=1/np.maximum(S.mean(1),.00004)**.6
V=(S*weight[:,None])**.65;T=(T*weight[:,None])**.65
V/=np.linalg.norm(V,axis=0)+1e-9;T/=np.linalg.norm(T,axis=0)+1e-9
score=(T.T@V).max(0);score=ndi.median_filter(score,5)
energy=np.sqrt((S*S).mean(0));score[energy<.00008]=0
(out/'spectral-fingerprint.json').write_text(json.dumps({'source':'existing instrumental stem','candidateCalibration':[20.9,21.7],'status':'uncalibrated brass candidate; do not claim verified trumpet','times':t.tolist(),'score':score.tolist()},separators=(',',':')))
sheet=Image.new('RGB',(1600,650),'#142027');d=ImageDraw.Draw(sheet)
for row in range(5):
 lo=row*32;sel=(t>=lo)&(t<lo+32);a=score[sel];x=(t[sel]-lo)*50;y0=row*130
 for k in range(len(a)-1):d.line((x[k],y0+110-a[k]*100,x[k+1],y0+110-a[k+1]*100),fill='#edc357',width=2)
 for sec in range(0,32,2):d.text((sec*50+2,y0+112),str(lo+sec),fill='white')
 for th in [.4,.6,.8]:d.line((0,y0+110-th*100,1600,y0+110-th*100),fill='#33444e')
sheet.save('/private/tmp/att-frequency-score.jpg')
for a in range(0,153,4):
 sel=(t>=a)&(t<a+4); print(a,round(float(score[sel].mean()),3),round(float(score[sel].max()),3))
