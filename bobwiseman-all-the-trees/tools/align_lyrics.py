# Aligns Bob's lyric sheet to the vocal stem: source/all-the-trees.sung.txt -> source/aligned.json (local only, it quotes
# the lyric). Then tools/build_lines.py turns it into source/lines.json for the finals. Copied from
# bobwiseman-giulietta-masina/tools/align_lyrics.py (2026-10-14), which came from bobwiseman-me-and-jimi.
# sung.txt: '## <t0> <t1>' starts a verse window on the song clock; every other non-empty line after it is one
# caption line, exactly as sung. Lines starting with '#' are comments.
#   1. torchaudio MMS_FA forced alignment of each window's lines to the Demucs vocal stem
#   2. each word's start snapped to a vocal onset: rise in log energy over 40 ms, the strongest peak within
#      -0.25 (-0.45 after a rest) / +0.35 s of the aligned time and no further than halfway to the neighbouring words; the aligned time is kept when the onset is weak
# Run: uv run --python 3.11 --with torch==2.2.2 --with torchaudio==2.2.2 --with 'numpy<2' --with soundfile \
#        python tools/align_lyrics.py <vocals.wav> source/all-the-trees.sung.txt source/aligned.json
import json, re, sys, hashlib, numpy as np, torch, torchaudio
voc, sung, out = sys.argv[1:4]
wins, cur = [], None
for raw in open(sung).read().split('\n'):
    l = raw.strip()
    if l.startswith('## '): a, b = map(float, l[3:].split()[:2]); cur = {'a': a, 'b': b, 'lines': []}; wins.append(cur)
    elif l and not l.startswith('#') and cur is not None: cur['lines'].append(l)
bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=False).eval(); dic = bundle.get_dict(star=None); SR = bundle.sample_rate
wav, sr = torchaudio.load(voc); wav = wav.mean(0, keepdim=True)
mono = wav[0].numpy()
def norm(w):
    w = w.lower().replace('’', "'").replace('60s', 'sixties').replace('80s', 'eighties')
    return re.sub(r"[^a-z]", '', w)
# onset envelope on the stem: 10 ms hop, log energy, rise over 40 ms
hop = int(sr * .01); fr = np.lib.stride_tricks.sliding_window_view(mono, hop * 4)[::hop]
le = np.log10((fr ** 2).mean(1) + 1e-9); rise = np.zeros_like(le); rise[4:] = le[4:] - le[:-4]
def snap(t, lo, hi):
    a, b = max(int(lo * 100) + 2, 4), min(int(min(t + .35, hi) * 100) + 2, len(rise) - 1)
    if b <= a: return t, 0.
    i = a + int(np.argmax(rise[a:b])); v = float(rise[i])
    return (round((i - 2) / 100, 3), v) if v > .6 else (t, v)  # i-2: the rise is measured over 4 hops, the onset is mid-rise
lines = []
for W in wins:
    seg = wav[:, int(W['a'] * sr): int(W['b'] * sr)]
    seg = torchaudio.functional.resample(seg, sr, SR)
    words = [(li, w, norm(w)) for li, l in enumerate(W['lines']) for w in l.split() if norm(w)]
    with torch.inference_mode():
        em, _ = model(seg); em = torch.log_softmax(em, -1)
    toks = [dic[c] for _, _, n in words for c in n]
    ali, sc = torchaudio.functional.forced_align(em, torch.tensor([toks], dtype=torch.int32), blank=0)
    spans = torchaudio.functional.merge_tokens(ali[0], sc[0].exp())
    ratio = seg.shape[1] / em.shape[1] / SR
    k = 0; timed = []
    for li, w, n in words:
        sp = spans[k:k + len(n)]; k += len(n)
        timed.append({'li': li, 'w': w, 's': W['a'] + sp[0].start * ratio, 'e': W['a'] + sp[-1].end * ratio, 'score': float(np.mean([x.score for x in sp]))})
    for j, x in enumerate(timed):
        x['aligned'] = x['s']
    for j, x in enumerate(timed):   # window: halfway to the aligned neighbours, -0.25 / +0.35 s at most
        a = x['aligned']; lo = (timed[j - 1]['aligned'] + a) / 2 if j else W['a']; hi = (a + timed[j + 1]['aligned']) / 2 if j + 1 < len(timed) else W['b']
        early = .45 if not j or a - timed[j - 1]['aligned'] > .6 else .25   # a word after a rest may start well before the aligner says
        x['s'], x['onset'] = snap(a, max(lo, a - early), hi); x['aligned'] = round(a, 3); x['e'] = round(max(x['e'], x['s'] + .1), 3)
    for li, l in enumerate(W['lines']):
        ws = [x for x in timed if x['li'] == li]
        lines.append({'i': len(lines), 'text': l, 's': ws[0]['s'], 'e': ws[-1]['e'],
                      'words': [{'w': x['w'], 's': x['s'], 'e': x['e'], 'aligned': x['aligned'], 'onset': round(x['onset'], 2), 'score': round(x['score'], 2)} for x in ws]})
sha = hashlib.sha256(open('assets/song.wav', 'rb').read()).hexdigest()
json.dump({'song': 'all-the-trees', 'sha256': sha, 'fps': 24, 'lines': lines}, open(out, 'w'), indent=1)
for l in lines: print(f"{l['s']:7.2f}-{l['e']:7.2f}  " + ' '.join(f"{w['w']}@{w['s']:.2f}{'' if abs(w['s'] - w['aligned']) < .02 else '(' + format(w['aligned'], '.2f') + ')'}" for w in l['words']))
