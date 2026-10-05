"""Score the song for harmonica with an AudioSet classifier (AST), half-second hop, 2 s windows.
Writes source/harmonica.json [{t, p_harmonica, p_singing, p_slide}] and prints the in/out spans.
Args: [audio path] [out json] (default: the song, source/harmonica.json). Run on the Demucs vocal stem too:
harmonica sits in that stem, isolated from the band.
Run: uv run --python 3.11 --with torch==2.2.2 --with torchaudio==2.2.2 --with 'transformers==4.44.2' --with 'numpy<2' --with librosa==0.10.2.post1 --with numba==0.60.0 --with llvmlite==0.43.0 python tools/harmonica.py
"""
import json, numpy as np, librosa, torch
from transformers import ASTFeatureExtractor, ASTForAudioClassification
M = 'MIT/ast-finetuned-audioset-10-10-0.4593'
fe = ASTFeatureExtractor.from_pretrained(M); model = ASTForAudioClassification.from_pretrained(M).eval()
lab = model.config.label2id
want = {k: lab[k] for k in ['Harmonica', 'Singing', 'Steel guitar, slide guitar', 'Guitar', 'Piano', 'Speech']}
import sys
SRC = sys.argv[1] if len(sys.argv) > 1 else 'assets/song.wav'; OUTF = sys.argv[2] if len(sys.argv) > 2 else 'source/harmonica.json'
y, sr = librosa.load(SRC, sr=16000, mono=True)
hop, win, out = 0.5, 2.0, []
starts = np.arange(0, len(y) / sr - win, hop)
batch = []
def run(b):
    x = fe([y[int(s * sr):int((s + win) * sr)] for s in b], sampling_rate=sr, return_tensors='pt')
    with torch.no_grad(): p = torch.sigmoid(model(**x).logits).numpy()
    for s, row in zip(b, p): out.append({'t': round(float(s + win / 2), 2), **{k: round(float(row[i]), 3) for k, i in want.items()}})
for s in starts:
    batch.append(s)
    if len(batch) == 16: run(batch); batch = []
if batch: run(batch)
json.dump(out, open(OUTF, 'w'))
h = np.array([o['Harmonica'] for o in out]); t = np.array([o['t'] for o in out])
on = h > 0.25; spans = []; i = 0
while i < len(on):
    if on[i]:
        j = i
        while j + 1 < len(on) and (on[j + 1] or (j + 2 < len(on) and on[j + 2])): j += 1
        spans.append((t[i] - .5, t[j] + .5, h[i:j + 1].max())); i = j + 1
    else: i += 1
for a, b, m in spans: print(f'{a:7.1f} - {b:7.1f}  ({b - a:5.1f}s)  peak {m:.2f}')
