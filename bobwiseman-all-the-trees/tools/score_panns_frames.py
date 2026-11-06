"""Local PANNs instrument evidence, preserving temporal activations before clip pooling.
Framewise values are exploratory localization from a clip-trained model, not guaranteed timestamps.
"""
from pathlib import Path
import sys,json,numpy as np,torch,librosa
from safetensors.torch import load_file
from panns_inference.models import Cnn14
from panns_inference.config import labels
out=Path(sys.argv[2]);torch.set_num_threads(2)
model=Cnn14(sample_rate=32000,window_size=1024,hop_size=320,mel_bins=64,fmin=50,fmax=14000,classes_num=len(labels));state=load_file(str(out/'panns-cnn14.safetensors'))
state={k.removeprefix('backbone.'):v for k,v in state.items()}
model.load_state_dict(state,strict=True);model.eval()
y,sr=librosa.load(sys.argv[1],sr=32000,mono=True)
selected=['Trumpet','Brass instrument','Trombone','Saxophone','Piano','Singing','Acoustic guitar','Music'];idx=[labels.index(n) for n in selected]
cache={};model.conv_block6.register_forward_hook(lambda m,i,o:cache.update(features=o))
rows=[]
for start in np.arange(0,len(y)/sr,5):
 lo=int(max(0,start-2.5)*sr);hi=int(min(len(y), (start+7.5)*sr));clip=y[lo:hi]
 with torch.inference_mode():
  r=model(torch.from_numpy(clip[None,:]),None)
  x=cache['features'].mean(3).transpose(1,2)
  local=torch.sigmoid(model.fc_audioset(torch.relu(model.fc1(x))))[0].numpy()
  clipwise=r['clipwise_output'][0].numpy()
  ts=np.linspace(lo/sr,hi/sr,len(local),endpoint=False)+.16
  keep=(ts>=start)&(ts<start+5)
  for t,row in zip(ts[keep],local[keep]): rows.append([float(t)]+row[idx].tolist())
  print(round(start,1),{n:round(float(clipwise[j]),3) for n,j in zip(selected,idx)},flush=True)
(out/'panns-frame-probabilities.json').write_text(json.dumps({'method':'PANNs Cnn14; temporal feature localization before clip pooling; exploratory','labels':selected,'rows':rows}))
