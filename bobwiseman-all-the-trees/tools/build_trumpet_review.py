"""Build local calibration evidence, never automatically turn uncertain scores into cues."""
from pathlib import Path
import json,numpy as np,librosa
root=Path(__file__).resolve().parents[1]
src=Path('/Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-all-the-trees/work/demucs/htdemucs/all-the-trees/no_vocals.wav')
y,sr=librosa.load(src,sr=16000,mono=True);S=np.abs(librosa.stft(y,n_fft=2048,hop_length=1600));db=librosa.amplitude_to_db(S,ref=np.max)
freq=np.geomspace(150,6500,128);bins=np.rint(freq/(sr/2048)).astype(int)
data={'duration':len(y)/sr,'step':.1,'frequencies':freq.tolist(),'spectrum':np.rint(np.clip((db[bins]+65)/65,0,1)*255).astype(int).tolist(),'panns':json.loads((root/'out/trumpet-v8/panns-frame-probabilities.json').read_text())}
(root/'assets/alchemy/trumpet-evidence.js').write_text('window.TRUMPET_EVIDENCE='+json.dumps(data,separators=(',',':'))+';\n')
