"""Local instrument-specific YAMNet evidence. Uses its original waveform frontend.
Model: Google YAMNet, Apache 2.0; ONNX conversion: audiomagic/yamnet-onnx.
"""
from pathlib import Path
from math import gcd
import json,csv,sys
import numpy as np, scipy.signal as ss, soundfile as sf, onnxruntime as ort
out=Path(sys.argv[2]);tag=sys.argv[3] if len(sys.argv)>3 else 'yamnet';names=[r['display_name'] for r in csv.DictReader((out/'yamnet_class_map.csv').open())]
options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
model=ort.InferenceSession(str(out/'yamnet.onnx'),options,providers=['CPUExecutionProvider'])
y,sr=sf.read(sys.argv[1]);y=y.mean(1) if y.ndim>1 else y;d=gcd(sr,16000);y=ss.resample_poly(y,16000//d,sr//d).astype('float32')
selected=['Trumpet','Brass instrument','Trombone','Saxophone','Piano','Singing','Acoustic guitar','Music'];idx=[names.index(x) for x in selected]
times=[];scores=[]
# Six shifted evaluations produce an 80 ms grid; each estimate still spans a 960 ms context.
for phase in range(6):
 shift=phase*.08
 pred=model.run(None,{'waveform':y[int(shift*16000):]})[0]
 t=np.arange(len(pred))*.48+.48+shift
 mask=t<=len(y)/16000
 times.extend(t[mask].tolist());scores.extend(pred[mask][:,idx].tolist())
 print('Classifier phase',phase+1,'/ 6',flush=True)
order=np.argsort(times);times=np.array(times)[order];scores=np.array(scores)[order]
(out/(tag+'-probabilities.json')).write_text(json.dumps({'method':'YAMNet on Demucs instrumental, 960 ms context on 80 ms grid; model estimates, not isolated trumpet stem or listening confirmation','labels':selected,'times':times.tolist(),'scores':scores.tolist()},separators=(',',':')))
for i,n in enumerate(selected):print(n,round(float(scores[:,i].max()),3),round(float(scores[:,i].mean()),3),flush=True)
for a in range(0,153,4):
 mask=(times>=a)&(times<a+4)
 print(a, {n:round(float(scores[mask,i].mean()),2) for i,n in enumerate(selected[:6])},flush=True)
