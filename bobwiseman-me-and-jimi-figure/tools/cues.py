"""Build work/cues.js from work/lyrics.txt (local), Whisper word starts and the Demucs vocal stem.
Each word start snaps to the strongest vocal onset within +-0.35 s, keeping order. Nothing here quotes the lyrics."""
import json, sys
import numpy as np, soundfile as sf
P = sys.argv[1]; S0, S1 = 152.0, 191.0
words = [w for w in json.load(open(f'{P}/source/words-whisper-medium.json')) if 150 < w['s'] < 192]
lines = [l.split() for l in open('work/lyrics.txt').read().strip().split('\n')]
assert sum(map(len, lines)) == len(words), (sum(map(len, lines)), len(words))
def env(path):
    y, sr = sf.read(path, always_2d=True); y = y.mean(axis=1)
    i0, i1 = int(148 * sr), int(192 * sr); y = y[i0:i1]; hop = int(sr * .01)
    e = np.array([np.sqrt(np.mean(y[i:i + hop] ** 2) + 1e-9) for i in range(0, len(y) - hop, hop)])
    le = np.log(e + 1e-4); rise = np.maximum(0, le[4:] - le[:-4]); return np.r_[np.zeros(4), rise], e
rv, ev = env(f'{P}/source/stems/htdemucs/me-and-jimi-2026/vocals.wav')
def snap(t, lo):
    a, b = max(int((t - .35 - 148) * 100), int((lo - 148) * 100) + 8), int((t + .35 - 148) * 100)
    if b <= a: return t
    i = a + int(np.argmax(rv[a:b])); return 148 + i / 100 if rv[i] > .5 else t
# the song's verified times (project STORYBOARD.md, checked on the stem 2026-10-04) beat this quick snap
FIXED = {27: 176.42, 34: 185.03}
out, k, last = [], 0, 150
for l in lines:
    ws = []
    for w in l:
        t = FIXED.get(k) or snap(words[k]['s'], last); print(f"{k:2d} whisper {words[k]['s']:.2f} snapped {t:.2f} d{t-words[k]['s']:+.2f}")
        ws.append({'w': w, 't': round(t, 2)}); last = t; k += 1
    out.append({'text': ' '.join(l), 'words': ws})
open('work/cues.js', 'w').write('window.CUES=' + json.dumps({'s0': S0, 's1': S1, 'lines': out}) + ';\n')
rm, em = env(f'{P}/source/stems/htdemucs/me-and-jimi-2026/no_vocals.wav')
print('band onsets 183-191:', [(round(148 + i / 100, 2), round(float(rm[i]), 2)) for i in np.argsort(rm[3500:4300])[-8:] + 3500])
print('band rms per second 180-191:', [round(float(em[int((s - 148) * 100):int((s + 1 - 148) * 100)].mean()), 3) for s in range(180, 191)])
