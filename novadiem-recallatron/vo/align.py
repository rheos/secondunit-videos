#!/usr/bin/env python3
"""Word times for each VO segment (faster-whisper small.en, timing only; the words come from vo.py).
Writes vo/words.json: {plate: [[word, start, end], ...]} in seconds from the segment's own start."""
import json, pathlib
from faster_whisper import WhisperModel
HERE = pathlib.Path(__file__).parent
segs = json.loads((HERE / "segments.json").read_text())
m = WhisperModel("small.en", device="cpu", compute_type="int8")
out = {}
for s in segs:
    res, _ = m.transcribe(str(HERE / s["file"]), word_timestamps=True, beam_size=5)
    out[s["plate"]] = [[w.word.strip(), round(w.start, 2), round(w.end, 2)] for r in res for w in r.words]
    print(s["plate"], " ".join(f"{w}@{a}" for w, a, b in out[s["plate"]]))
(HERE / "words.json").write_text(json.dumps(out, indent=1) + "\n")
