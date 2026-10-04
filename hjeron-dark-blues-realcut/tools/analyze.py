"""Beat/onset analysis of dream of fire stems. Writes work/analysis.json (local only)."""
import json, librosa, numpy as np
S='/Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/_hjeron-dream-of-fire/'
y,sr=librosa.load(S+'stems/htdemucs/dream-of-fire/no_vocals.wav',sr=22050,mono=True)
tempo,beats=librosa.beat.beat_track(y=y,sr=sr,units='time')
oenv=librosa.onset.onset_strength(y=y,sr=sr)
rms=librosa.feature.rms(y=y)[0]; rt=librosa.times_like(rms,sr=sr)
v,_=librosa.load(S+'stems/htdemucs/dream-of-fire/vocals.wav',sr=22050,mono=True)
von=librosa.onset.onset_detect(y=v,sr=sr,units='time',backtrack=True)
vr=librosa.feature.rms(y=v)[0]
out={'tempo':float(np.atleast_1d(tempo)[0]),'beats':[round(float(b),3) for b in beats],
     'vocal_onsets':[round(float(t),3) for t in von],
     'rms_1s':[round(float(rms[(rt>=s)&(rt<s+1)].mean()),4) for s in range(98)],
     'vrms_1s':[round(float(vr[(rt>=s)&(rt<s+1)].mean()),4) for s in range(98)]}
json.dump(out,open('work/analysis.json','w'))
print(out['tempo'], len(out['beats'])); print(out['beats'][:40]); print(out['rms_1s']); print(out['vrms_1s'])
