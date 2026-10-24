# Timing reference only: what is actually sung and in what order (the lyric sheet stays the source of words).
import json, sys
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
m = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = m.transcribe(src, language="es", word_timestamps=True, vad_filter=False,
                       initial_prompt="Harta de tu bronca. ¿De veras no lo ves? Estoy cansada.")
res = []
for s in segs:
    res.append({"s": round(s.start, 2), "e": round(s.end, 2), "text": s.text.strip(),
                "words": [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in s.words]})
    print(f"{s.start:7.2f}-{s.end:7.2f}  {s.text.strip()}", flush=True)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=0)
