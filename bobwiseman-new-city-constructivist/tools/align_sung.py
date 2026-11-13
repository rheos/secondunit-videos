"""Forced alignment of the song as sung (sections in recording order, each with its own search window) to the Demucs
vocal stem, with torchaudio MMS_FA, then each word start snapped to the strongest vocal onset within +-0.3 s.
Usage: align_sung.py <vocals.wav> <sung.txt> <out.json>
sung.txt: lines "@ t0 t1 name" open a section; the lines after it are that section's sung lines (gitignored: lyric).
Out: {"sections": [{"name", "t0", "t1", "lines": [[{"w", "s", "e", "score", "snapped"}...]...]}]}"""
import json, re, sys
import numpy as np, soundfile as sf, torch, torchaudio

src, sung, out = sys.argv[1:4]
secs = []
for raw in open(sung):
    l = raw.strip()
    if not l or l.startswith("#"): continue
    if l.startswith("@"):
        _, t0, t1, name = l.split(); secs.append({"name": name, "t0": float(t0), "t1": float(t1), "text": []})
    else: secs[-1]["text"].append(l)

bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).eval(); dic = bundle.get_dict(star=None); SR = bundle.sample_rate
wav, sr = torchaudio.load(src); wav = torchaudio.functional.resample(wav.mean(0, keepdim=True), sr, SR)
norm = lambda w: re.sub(r"[^a-z]", "", w.lower().replace("’", "'"))

# vocal onsets (tools/onsets.py): rise in log energy over 40 ms
x, xsr = sf.read(src); x = x.mean(1) if x.ndim > 1 else x
hop = int(xsr * .01); n = len(x) // hop
e = np.log(np.array([(x[i * hop:(i + 1) * hop] ** 2).mean() for i in range(n)]) + 1e-9)
rise = np.zeros(n); rise[4:] = e[4:] - e[:-4]
from scipy.signal import find_peaks
pk, _ = find_peaks(rise, height=2.0, distance=8)
pk = [k for k in pk if e[min(n - 1, k + 3)] > np.percentile(e, 40)]

res = []
for sec in secs:
    a, b = int(sec["t0"] * SR), int(sec["t1"] * SR)
    words = [(w, norm(w), li) for li, l in enumerate(sec["text"]) for w in l.split() if norm(w)]
    with torch.inference_mode():
        em, _ = model(wav[:, a:b]); em = em[0].log_softmax(-1)
    fs = ((b - a) / SR) / em.shape[0]
    toks = [dic[c] for _, nn, _ in words for c in nn]
    ali, sc = torchaudio.functional.forced_align(em.unsqueeze(0), torch.tensor([toks], dtype=torch.int32), blank=0)
    spans = torchaudio.functional.merge_tokens(ali[0], sc[0].exp())
    lines = [[] for _ in sec["text"]]; k = 0; prev = 0
    for w, nn, li in words:
        sp = spans[k:k + len(nn)]; k += len(nn)
        s0 = sec["t0"] + sp[0].start * fs; c = s0 / .01
        cand = [p for p in pk if abs(p - c) <= 30 and p * .01 > prev + .08]
        snap = bool(cand); s = round(min(cand, key=lambda p: abs(p - c)) * .01, 2) if cand else round(s0, 2)
        prev = max(prev, s)
        lines[li].append({"w": w, "s": s, "s_aligned": round(s0, 3), "e": round(sec["t0"] + sp[-1].end * fs, 3),
                          "score": round(sum(t.score for t in sp) / len(sp), 3), "snapped": snap})
    res.append({"name": sec["name"], "t0": sec["t0"], "t1": sec["t1"], "lines": lines})
    for ws in lines:
        print(f'{sec["name"]:9s} {ws[0]["s"]:7.2f}-{ws[-1]["e"]:7.2f} min {min(w["score"] for w in ws):.2f}  ' +
              " ".join(f'{w["w"]}@{w["s"]:.2f}{"" if w["snapped"] else "*"}' for w in ws))
json.dump({"sections": res}, open(out, "w"), indent=0)
