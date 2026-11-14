"""Write work/cues.js (gitignored: it quotes the lyrics) for the lobbyists machine, film 0 = song 20.0 s.

Words come from work/align-lines.txt (the settled sheet's lines). Times are film seconds, settled 2026-11-09 from
the MMS forced alignment snapped to vocal-stem onsets (tools/cues.py), cross-checked against Whisper word times
and the stem's energy where the aligner collapsed a run of words to its 0.08 s floor.
The hooks are beat grids: one tick per sung hook phrase, fitted to the clean onsets (period about 0.54 s); hook 1 has 8,
hook 2 has 10 by the grid (Whisper and the aligner disagree on hook 2's count; Robin's ear is the check).
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
lines = [l.strip() for l in (HERE / "work/align-lines.txt").read_text().split("\n")[3:] if l.strip()]
verse = lines[8:13]  # the five lines between the hooks
TIMES = [
    [7.61, 7.74, 7.97, 8.23, 8.35, 8.47, 8.82, 9.00, 9.20, 9.42, 9.72],
    [9.96, 10.10, 10.59, 10.91, 11.22],
    [11.61, 14.28, 14.66, 15.08, 15.35],
    [16.95, 17.93, 18.35, 18.56, 19.01, 19.39, 19.67, 19.86, 20.12],
    [21.05, 21.57, 22.12, 22.40, 22.69, 22.96, 23.22, 23.45, 23.72, 24.39, 24.87],
]
out = {"t0": 20.0, "dur": 33.5, "hookText": lines[0], "againText": lines[7],
       "hooks": [{"ticks": [0.42, 1.02, 1.54, 2.11, 2.63, 3.19, 3.75, 4.30], "again": 5.10},
                 {"ticks": [26.11, 26.65, 27.19, 27.73, 28.26, 28.79, 29.34, 29.88, 30.41, 30.95], "again": 31.49}],
       "lines": []}
for text, ts in zip(verse, TIMES):
    ws = text.split()
    assert len(ws) == len(ts), (text, len(ws), len(ts))
    out["lines"].append({"text": text, "words": [{"w": w, "t": t} for w, t in zip(ws, ts)]})
(HERE / "work/cues.js").write_text("window.CUES = " + json.dumps(out) + ";\n")
print("ok", [l["words"][0]["t"] for l in out["lines"]])
