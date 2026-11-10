"""Build work/cues.js (gitignored, it quotes the lyrics) from the forced alignment and the section's stems.

Each word's time is snapped to the strongest vocal onset within +-0.3 s (alignment runs early), kept as aligned
when the onset is weak. Hits (kick and snare) are onsets in the accompaniment's low band.
Times in cues.js are film seconds: 0 is FILM_T0 in the song.

uv run --no-project --with numpy --with soundfile python tools/cues.py work/align.json <stem dir> <stem_t0> <film_t0> <film_t1> <first_line> [display substitutions a=b ...]
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent.parent


def onsets(path, band=None):
    x, sr = sf.read(path, always_2d=True)
    x = x.mean(1)
    if band:
        f = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / sr)
        f[(fr < band[0]) | (fr > band[1])] = 0; x = np.fft.irfft(f, len(x))
    hop = int(sr * 0.01)
    e = np.array([np.sum(x[i:i + hop] ** 2) for i in range(0, len(x) - hop, hop)])
    le = np.log(e + 1e-9)
    return np.concatenate([np.zeros(4), np.maximum(0, le[4:] - le[:-4])])  # index -> stem seconds * 100


def main():
    aligned, stems, st0, f0, f1, first = sys.argv[1:7]
    st0, f0, f1, first = float(st0), float(f0), float(f1), int(first)
    subs = dict(a.split("=", 1) for a in sys.argv[7:])
    A = json.load(open(aligned))
    rv = onsets(f"{stems}/vocals.wav"); thr = np.percentile(rv, 95)
    lines = []
    for li, text in enumerate(A["lines"]):
        if li < first:
            continue
        ws = []
        for w in [w for w in A["words"] if w["line"] == li]:
            t = w["s"]  # align.json is in stem seconds (its T0 was 0)
            i0, i1 = max(0, int((t - 0.3) * 100)), max(0, int((t + 0.3) * 100))
            seg = rv[i0:i1]
            if len(seg) and seg.max() > thr:
                t = (i0 + int(seg.argmax())) / 100
            ws.append({"w": w["w"], "t": round(t + st0 - f0, 3)})
        for k in range(1, len(ws)):
            ws[k]["t"] = max(ws[k]["t"], ws[k - 1]["t"] + 0.08)
        taps = [w["t"] for w in ws]
        if text in subs:  # a phrase aligned spelled out (numbers), shown as written on the sheet
            n = len(text.split()) - len(subs[text].split()) + 1
            ws = [{"w": subs[text].split()[0], "t": ws[0]["t"]}] + ws[n:]
        lines.append({"text": subs.get(text, text), "taps": taps, "words": ws, "end": round(max(w["e"] for w in A["words"] if w["line"] == li) + st0 - f0, 3)})
    rd = onsets(f"{stems}/no_vocals.wav", band=(40, 180)); thr_d = np.percentile(rd, 96)
    hits, last = [], -9
    for i in range(1, len(rd) - 1):
        t = i / 100 + st0 - f0
        if rd[i] > thr_d and rd[i] >= rd[i - 1] and rd[i] >= rd[i + 1] and 0 <= t <= f1 - f0 and t - last > 0.15:
            hits.append(round(t, 3)); last = t
    (HERE / "work" / "cues.js").write_text("window.CUES = " + json.dumps({"dur": round(f1 - f0, 3), "lines": lines, "hits": hits}) + ";\n")
    for l in lines:
        print(f'{l["words"][0]["t"]:6.2f}-{l["end"]:6.2f}  ' + " ".join(f'{w["w"]}@{w["t"]:.2f}' for w in l["words"]))
    print("hits:", hits)


if __name__ == "__main__":
    main()
