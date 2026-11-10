"""Write work/cues.js (gitignored: it quotes the lyrics) for the whole song, on SONG time (t 0 = song start).

Verse lines: work/full-lines.txt (the settled sheet minus hooks), times from work/align-*.json (MMS forced alignment
per section, tools/align.py), each word snapped to the strongest vocal-stem onset within +-0.3 s, kept as aligned
when the onset is weak. Verse 2 keeps the hand-settled times from test 01 (tools/lobby_cues.py), cross-checked
against Whisper and the stem where the aligner collapsed runs of words.
Hooks are beat grids fitted to clean onsets (about 0.54 s a phrase). The counts are the grid's, not an ear's.
Outro rounds: start times from the vocal stem's energy, one chant per round.
"""
import json
from pathlib import Path
import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent.parent
W = HERE / "work"
lines = [l.strip() for l in (W / "full-lines.txt").read_text().split("\n")[3:] if l.strip()]
hook_text = "I wanna hit"  # display text is read from the sheet below, this is only a fallback
sheet = (W / "lobbyists-at-parliament.settled.txt").read_text().split("\n")
hook_text = next(l for l in sheet if l.lower().startswith("i wanna hit")).split(",")[0].strip()
again_text = next(l.strip() for l in sheet if l.strip().lower() == "again")
outro_text = next(l for l in sheet if l.lower().startswith("gotta hit")).split("(")[0].strip().rstrip(",")

x, sr = sf.read(W / "lobbyists-at-parliament.vocals.wav", always_2d=True); x = x.mean(1)
hop = int(sr * 0.01)
e = np.array([np.sum(x[i:i + hop] ** 2) for i in range(0, len(x) - hop, hop)]); le = np.log(e + 1e-9)
rv = np.concatenate([np.zeros(4), np.maximum(0, le[4:] - le[:-4])]); thr = np.percentile(rv, 95)

def snap(t):
    i0, i1 = max(0, int((t - 0.3) * 100)), int((t + 0.3) * 100); s = rv[i0:i1]
    return (i0 + int(s.argmax())) / 100 if len(s) and s.max() > thr else t

words = {}
for f in sorted(W.glob("align-v*.json")):
    A = json.load(open(f))
    for w in A["words"]:
        li = lines.index(A["lines"][w["line"]])
        words.setdefault(li, []).append({"w": w["w"], "t": round(snap(w["s"]), 3)})
# verse 2: the settled times from test 01 (film time + 20)
V2 = [[7.61, 7.74, 7.97, 8.23, 8.35, 8.47, 8.82, 9.00, 9.20, 9.42, 9.72], [9.96, 10.10, 10.59, 10.91, 11.22],
      [11.61, 14.28, 14.66, 15.08, 15.35], [16.95, 17.93, 18.35, 18.56, 19.01, 19.39, 19.67, 19.86, 20.12],
      [21.05, 21.57, 22.12, 22.40, 22.69, 22.96, 23.22, 23.45, 23.72, 24.39, 24.87]]
for k, ts in enumerate(V2):
    li = 4 + k; words[li] = [{"w": w, "t": round(t + 20, 3)} for w, t in zip(lines[li].split(), ts)]
out_lines = []
for li, text in enumerate(lines):
    ws = words[li]
    for k in range(1, len(ws)): ws[k]["t"] = max(ws[k]["t"], round(ws[k - 1]["t"] + 0.08, 3))
    out_lines.append({"text": text, "words": ws})
grid = lambda t0, n, p=0.54: [round(t0 + i * p, 2) for i in range(n)]
hooks = [{"ticks": [20.42, 21.02, 21.54, 22.11, 22.63, 23.19, 23.75, 24.30], "again": 25.10},
         {"ticks": [46.11, 46.65, 47.19, 47.73, 48.26, 48.79, 49.34, 49.88, 50.41, 50.95], "again": 51.49},
         {"ticks": grid(83.66, 10), "again": 89.10},
         {"ticks": grid(109.25, 11), "again": 115.13}]
outro = [209.0, 217.0, 225.2, 233.2, 241.3, 249.2, 256.6]
out = {"t0": 0, "dur": 268.6, "hookText": hook_text, "againText": again_text, "outroText": outro_text,
       "lines": out_lines, "hooks": hooks, "outro": outro}
(W / "cues-song.js").write_text("window.CUES = " + json.dumps(out) + ";\n")
for i, l in enumerate(out_lines): print(f'{i:2d} {l["words"][0]["t"]:7.2f}-{l["words"][-1]["t"]:7.2f}  {len(l["words"])}w')
