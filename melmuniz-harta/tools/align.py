# Harta: Spanish-aware fork of In Her Dream's tools/align.py.
# Forced alignment of the lyric sheet to the Demucs vocal stem (torchaudio MMS_FA, CTC).
# Emissions are computed in 30 s windows (2 s overlap trimmed) and concatenated, then one forced_align over the whole sheet.
import json, re, sys, unicodedata, torch, torchaudio
src, lyr, out = sys.argv[1], sys.argv[2], sys.argv[3]
T0 = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0; T1 = float(sys.argv[5]) if len(sys.argv) > 5 else None
FIRST = sys.argv[6] if len(sys.argv) > 6 else None
lines = [l.strip() for l in open(lyr).read().split("\n")[3:] if l.strip()]
if FIRST: lines = lines[lines.index(FIRST):]
LAST = sys.argv[7] if len(sys.argv) > 7 else None
if LAST: lines = lines[:lines.index(LAST) + 1]
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).eval()
dic = bundle.get_dict(star=None)
wav, sr = torchaudio.load(src); wav = wav.mean(0, keepdim=True)
wav = wav[:, int(T0 * sr): int(T1 * sr) if T1 else None]
wav = torchaudio.functional.resample(wav, sr, bundle.sample_rate); SR = bundle.sample_rate
def norm(w):
    # Spanish: drop accents (á -> a, ñ -> n, ü -> u); MMS_FA's dictionary is romanised a-z
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z']", "", w).replace("'", "")
words, wline = [], []
for li, l in enumerate(lines):
    for w in l.split():
        n = norm(w)
        if n: words.append((w, n)); wline.append(li)
# emissions in windows
win, ov = 30 * SR, 2 * SR
ems = []; pos = 0; N = wav.shape[1]
with torch.inference_mode():
    while pos < N:
        a = max(0, pos - ov); b = min(N, pos + win + ov)
        e, _ = model(wav[:, a:b]); e = e[0]
        fps = e.shape[0] / ((b - a) / SR)
        s0 = int(round((pos - a) / SR * fps)); s1 = int(round((min(N, pos + win) - a) / SR * fps))
        ems.append(e[s0:s1]); pos += win
em = torch.cat(ems).log_softmax(-1)
frame_s = (N / SR) / em.shape[0]
tokens = [dic[c] for _, n in words for c in n]
ali, scores = torchaudio.functional.forced_align(em.unsqueeze(0), torch.tensor([tokens], dtype=torch.int32), blank=0)
spans = torchaudio.functional.merge_tokens(ali[0], scores[0].exp())
res, k = [], 0
for (w, n), li in zip(words, wline):
    sp = spans[k:k + len(n)]; k += len(n)
    res.append({"w": w, "line": li, "s": round(T0 + sp[0].start * frame_s, 3), "e": round(T0 + sp[-1].end * frame_s, 3), "score": round(sum(x.score for x in sp) / len(sp), 3)})
json.dump({"lines": lines, "words": res}, open(out, "w"), indent=0)
for li, l in enumerate(lines):
    ws = [r for r in res if r["line"] == li]
    print(f"{ws[0]['s']:7.2f}-{ws[-1]['e']:7.2f}  min {min(r['score'] for r in ws):.2f}  {l}")
