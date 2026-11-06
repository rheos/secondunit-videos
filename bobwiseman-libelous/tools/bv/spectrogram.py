# Backing-vocal finder for Libelous (BACKING-VOCAL.md). Run from the project folder with:
#   uv run --python 3.11 --with librosa --with matplotlib --with scipy --with numba==0.60.0 --with llvmlite==0.43.0 --with 'numpy<2' python tools/bv/spectrogram.py [args]
import sys, numpy as np, librosa, librosa.display, json, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
src, out = sys.argv[1], sys.argv[2]; wins=[tuple(map(float,w.split('-'))) for w in sys.argv[3:]]
d=json.load(open('source/lines.json'))
fig,axs=plt.subplots(len(wins),1,figsize=(20,4*len(wins))); axs=np.atleast_1d(axs)
for ax,(a,b) in zip(axs,wins):
  y,sr=librosa.load(src,sr=22050,offset=a,duration=b-a)
  S_=librosa.amplitude_to_db(np.abs(librosa.stft(y,n_fft=2048,hop_length=128)),ref=np.max)
  librosa.display.specshow(S_,sr=sr,hop_length=128,x_axis='time',y_axis='linear',ax=ax,vmin=-70)
  ax.set_ylim(0,4000)
  ax.set_xticks(np.arange(0,b-a,.25)); ax.set_xticklabels(['%.2f'%(a+x) if i%2==0 else '' for i,x in enumerate(np.arange(0,b-a,.25))],fontsize=7)
  for l in d['lines']:
    for w in l['words']:
      if a<=w['s']<b: ax.axvline(w['s']-a,color='c',lw=.6); ax.text(w['s']-a,3800,w['w'][:8],color='c',fontsize=7)
  ax.set_title(f'{src} {a}-{b}')
plt.tight_layout(); plt.savefig(out,dpi=55)
