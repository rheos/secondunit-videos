# Backing-vocal finder for Libelous (BACKING-VOCAL.md). Run from the project folder with:
#   uv run --python 3.11 --with librosa --with matplotlib --with scipy --with numba==0.60.0 --with llvmlite==0.43.0 --with 'numpy<2' python tools/bv/onsets.py [args]
import numpy as np, librosa, json
y,sr=librosa.load('work/karaoke/backing_roformer.flac',sr=22050)
hop=110  # 5 ms
S=np.abs(librosa.stft(y,n_fft=2048,hop_length=hop))
L=np.log1p(10*S)
flux=np.maximum(0,np.diff(L,axis=1)).sum(0); flux=np.concatenate([[0],flux])
# chroma/timbre change: cosine distance between spectra 40 ms apart
lag=8
Sn=L/ (np.linalg.norm(L,axis=0,keepdims=True)+1e-9)
chg=np.zeros(L.shape[1]); chg[lag:]=1-(Sn[:,lag:]*Sn[:,:-lag]).sum(0)
rms=librosa.feature.rms(y=y,frame_length=2048,hop_length=hop)[0]; db=20*np.log10(rms+1e-9)
t=np.arange(len(db))*hop/sr
def near(arr, c, w=.35):
  m=(t>c-w)&(t<c+w); i=np.argmax(np.where(m,arr,-1)); return round(float(t[i]),3)
def endof(a,b,thr):
  m=(t>a)&(t<b); idx=np.where(m&(db>thr))[0]; return round(float(t[idx[-1]]),3)
top=np.percentile(db,99.9)
res=[]
for name,(on,b1,b2,end) in {'intro':(7.45,8.9,10.9,12.8),'out1':(310.08,311.58,313.55,315.4),'out2':(323.95,325.48,327.3,329.2)}.items():
  o=near(flux,on); x1=near(chg,b1); x2=near(chg,b2); e=endof(on,end+.6,top-30)
  res.append(dict(name=name,lib=o,el=x1,ous=x2,end=e,peak_db=round(float(db[(t>on)&(t<end)].max()-top),1)))
  print(res[-1])
json.dump(res,open('work/karaoke/bv_onsets.json','w'),indent=1)
print('--- energy gates')
for name,(a,b) in {'intro':(7,13.6),'out1':(309.6,316.4),'out2':(323.4,330.2)}.items():
  m=(t>a)&(t<b)
  for thr in [-30,-25,-20,-15]:
    idx=np.where(m&(db>top+thr))[0]
    print(name,thr,round(float(t[idx[0]]),3),round(float(t[idx[-1]]),3))
  # dips inside: local minima of db
  seg=np.where(m)[0]; d=db[seg]; 
  from scipy.signal import argrelextrema
  sm=np.convolve(d,np.ones(9)/9,'same'); mins=argrelextrema(sm,np.less,order=40)[0]
  print(name,'dips',[(round(float(t[seg[i]]),3),round(float(sm[i]-top),1)) for i in mins])
