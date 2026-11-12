"""hits.py: snap our Whisper word times to the vocal stem's onsets, and list accompaniment onsets in the breaks.

Usage (from the project folder, viralvision venv python for numpy):
  python tools/hits.py work/children-at-play.OURS.medium.words.json work/stems/htdemucs/full > work/hits.txt

Rule (video-production skill, rule 2): Whisper runs 0.3 to 1 s early; snap a word to the strongest rise in log energy
(40 ms) of the vocal stem within about +-0.6 s of its aligned time, keep the aligned time when no onset is strong.
Prints each sung line with its snapped word times, then the accompaniment onsets inside every break longer than 3 s
(candidates for cuts). The output quotes our transcript, so it stays in work/ (gitignored).
"""
import json, sys, wave
import numpy as np


def load(path):
    w = wave.open(path)
    sr, ch = w.getframerate(), w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
    return x.reshape(-1, ch).mean(1), sr


def onsets(x, sr, hop_s=0.01):
    hop = int(sr * hop_s)
    e = np.array([np.sum(x[i:i + hop] ** 2) for i in range(0, len(x) - hop, hop)])
    le = 10 * np.log10(e + 1e-9)
    d = np.zeros_like(le)
    d[4:] = le[4:] - le[:-4]  # rise over 40 ms
    return le, d


def main():
    words_path, stem_dir = sys.argv[1], sys.argv[2]
    segs = json.load(open(words_path))
    vx, sr = load(f'{stem_dir}/vocals.wav')
    ax, _ = load(f'{stem_dir}/no_vocals.wav')
    vle, vd = onsets(vx, sr)
    ale, ad = onsets(ax, sr)
    vmax = vle.max()
    last_end = 0.0
    lines = []
    for s in segs:
        if s['start'] > 327:  # Whisper's tail hallucinations after the song ends
            continue
        out = []
        for w in s['words']:
            i0, i1 = int(max(0, w['s'] - 0.6) * 100), int(min(len(vd) - 1, (w['s'] + 0.6) * 100))
            seg = vd[i0:i1]
            j = int(np.argmax(seg)) + i0 if len(seg) else int(w['s'] * 100)
            strong = vd[j] > 6 and vle[min(len(vle) - 1, j + 4)] > vmax - 35
            t = j / 100 if strong else w['s']
            out.append((round(t, 2), w['w'].strip(), 'onset' if strong else 'aligned'))
        lines.append((out[0][0], out, s['end']))
    for start, ws, end in lines:
        print(f'LINE {start:7.2f}-{end:7.2f}  ' + ' '.join(f'{w}@{t:.2f}{"" if k == "onset" else "~"}' for t, w, k in ws))
    print()
    # breaks between lines: accompaniment onsets (strong rises) as cut candidates
    amax = ale.max()
    prev_end = 0.0
    for start, ws, end in lines + [(334.0, [], 334.0)]:
        if start - prev_end > 3:
            i0, i1 = int(prev_end * 100), int(start * 100)
            cand = [i for i in range(i0 + 2, i1 - 2) if ad[i] > 5 and ad[i] == max(ad[max(0, i - 15):i + 15]) and ale[min(len(ale) - 1, i + 4)] > amax - 30]
            print(f'BREAK {prev_end:7.2f}-{start:7.2f}  onsets: ' + ' '.join(f'{(i + 2) / 100:.2f}' for i in cand))
        prev_end = max(prev_end, end)


main()
