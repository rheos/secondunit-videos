"""Word timings for "Clap Hands" from the Demucs vocal stem (faster-whisper, word timestamps).

TIMING ONLY. Whisper mishears this live take badly, so these words are cue handles, never on-screen
text. Writes _in/words.json. Run with the viralvision-worker venv (has faster_whisper):
  ../../../viralvision/viralvision-worker/.venv/bin/python tools/words.py
"""
import json
from pathlib import Path

from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parents[1]
VOX = ROOT / "_in/stems/htdemucs/gemmaluna-tomwaits_master-v2/vocals.wav"
m = WhisperModel("small", compute_type="int8")
segs, _ = m.transcribe(str(VOX), language="en", word_timestamps=True, condition_on_previous_text=False)
lines = []
for sg in segs:
    words = [dict(t=w.word.strip(), s=round(w.start, 3), e=round(w.end, 3)) for w in sg.words]
    if words:
        lines.append(dict(text=sg.text.strip(), s=words[0]["s"], e=words[-1]["e"], words=words))
(ROOT / "_in/words.json").write_text(json.dumps(dict(lines=lines), indent=1))
print(f"{len(lines)} lines, {sum(len(l['words']) for l in lines)} words")
