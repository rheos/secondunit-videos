"""Instrument-specific PANNs evidence on the locally separated instrumental stem.
Scores are model estimates; spectral analysis refines their boundaries, not verified stems.
"""
from pathlib import Path
import json, sys, urllib.request
import numpy as np
import torch
import librosa
from panns_inference.models import Cnn14_DecisionLevelMax
from panns_inference.config import labels

torch.set_num_threads(2)
out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
modelpath=out/'Cnn14_DecisionLevelMax.pth'
if not modelpath.exists():
 print('Downloading official PANNs sound-event model.',flush=True)
 urllib.request.urlretrieve('https://zenodo.org/records/3987831/files/Cnn14_DecisionLevelMax_mAP%3D0.385.pth?download=1',modelpath)
model=Cnn14_DecisionLevelMax(sample_rate=32000,window_size=1024,hop_size=320,mel_bins=64,fmin=50,fmax=14000,classes_num=len(labels),interpolate_mode='linear')
model.load_state_dict(torch.load(modelpath,map_location='cpu',weights_only=True)['model']);model.eval()
y,sr=librosa.load(sys.argv[1],sr=32000,mono=True)
selected=['Trumpet','Brass instrument','Trombone','Saxophone','Piano','Singing','Acoustic guitar','Music']
indices=[labels.index(x) for x in selected]
# Centre six seconds of each ten-second context prevents window edge artifacts.
times=[];scores=[]
for a in np.arange(0,len(y)/sr,6):
 start=a-2;lo=int(start*sr);hi=lo+10*sr
 clip=y[max(0,lo):min(len(y),hi)]
 clip=np.pad(clip,(max(0,-lo),max(0,hi-len(y))))
 with torch.inference_mode():r=model(torch.from_numpy(clip[None,:]),None)['framewise_output'][0].numpy()
 ts=start+np.arange(len(r))*.01
 mask=(ts>=a)&(ts<a+6)&(ts<len(y)/sr)
 times.extend(ts[mask].tolist());scores.extend(r[mask][:,indices].tolist())
 print(f'Analysed {min(a+6,len(y)/sr):.1f} / {len(y)/sr:.1f} seconds',flush=True)
obj={'method':'PANNs Cnn14 DecisionLevelMax on Demucs no-vocals, 10 ms sample grid; estimates, not isolated trumpet or human verification','source':str(Path(sys.argv[1]).resolve()),'labels':selected,'times':times,'scores':scores}
(out/'trumpet-probabilities.json').write_text(json.dumps(obj,separators=(',',':')))
for i,name in enumerate(selected):
 s=np.array(scores)[:,i]; print(name,'max',round(float(s.max()),3),'mean',round(float(s.mean()),3),flush=True)
