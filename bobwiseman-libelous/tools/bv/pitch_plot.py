# Backing-vocal finder for Libelous (BACKING-VOCAL.md). Run from the project folder with:
#   uv run --python 3.11 --with librosa --with matplotlib --with scipy --with numba==0.60.0 --with llvmlite==0.43.0 --with 'numpy<2' python tools/bv/pitch_plot.py [args]
import numpy as np, librosa, json, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
out={}
for name in ['lead','backing']:
  y,sr=librosa.load(f'work/karaoke/{name}_roformer.flac',sr=16000)
  f0,vf,vp=librosa.pyin(y,fmin=80,fmax=1000,sr=sr,frame_length=1024,hop_length=160)
  db=20*np.log10(librosa.feature.rms(y=y,frame_length=1024,hop_length=160)[0]+1e-9)
  out[name]=(f0,db)
np.savez('work/karaoke/r_pitch.npz',lf=out['lead'][0],ld=out['lead'][1],bf=out['backing'][0],bd=out['backing'][1])
d=json.load(open('source/lines.json'))
top=max(out['lead'][1].max(),out['backing'][1].max())
fig,axs=plt.subplots(6,1,figsize=(24,26))
for k,ax in enumerate(axs):
  a,bb=k*57,(k+1)*57
  for name,c in [('lead','b'),('backing','r')]:
    f0,db=out[name]; t=np.arange(len(f0))/100; m=(t>=a)&(t<bb)
    ax2=ax
    ax.plot(t[m],(db[m]-top)*4+200 if False else None) if False else None
    v=m&(db>top-38)
    ax.scatter(t[v],f0[v],s=3,c=c)
    # energy strip
    ax.fill_between(t[m], 60 if name=='lead' else 40, (60 if name=='lead' else 40)*np.power(10,(np.clip(db[m]-top+45,0,45))/45*0.25), color=c, alpha=.3)
  for l in d['lines']:
    if a<=l['s']<bb: ax.axvline(l['s'],color='g',lw=.5); ax.text(l['s'],900,str(l['i']),fontsize=8)
  ax.set_xlim(a,bb); ax.set_ylim(35,1000); ax.set_yscale('log'); ax.set_xticks(np.arange(a,bb,1),minor=True); ax.grid(True,which='minor',alpha=.2)
plt.tight_layout(); plt.savefig('work/karaoke/pitch_roformer.png',dpi=55)
