#!/usr/bin/env python3
"""Tighten a take's pauses, between vo.py and align.py. Gaps after a full stop or question go to 0.22 s, gaps after a
comma, colon or semicolon to 0.15 s; every other gap stays. Silence is cut from the middle of the gap with 10 ms fades,
so breaths at the edges survive. script.json may list "holds": ["X"], beat ids whose lead-in pause stays natural, capped
at 0.6 s. Keeps the raw take as vo/voice.raw.mp3 and re-reads it on a second run, so tightening never compounds.

    <viralvision venv python> -I tools/devweb-kit/vo/tighten.py <project-folder>
"""
import difflib, json, pathlib, re, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

ROOT = pathlib.Path(sys.argv[1]).resolve(); HERE = ROOT / "vo"
STOP, COMMA, HOLD_CAP, FADE, SR = 0.22, 0.15, 0.6, 0.01, 44100
raw = HERE / "voice.raw.mp3"
if not raw.exists():
    raw.write_bytes((HERE / "voice.mp3").read_bytes())
script = json.loads((HERE / "script.json").read_text())
# A script may set its own: "tighten": {"stop": 0.4, "comma": 0.28, "fade": 0.03}. A voice with long natural pauses sounds chopped at the defaults.
own = script.get("tighten", {})
STOP, COMMA, FADE = own.get("stop", STOP), own.get("comma", COMMA), own.get("fade", FADE)
norm =lambda s: re.sub(r"[^a-z0-9']", "", s.lower())

m = WhisperModel("small.en", device="cpu", compute_type="int8")
res, _ = m.transcribe(str(raw), word_timestamps=True, beam_size=5)
words = [(w.word.strip(), w.start, w.end) for r in res for w in r.words]
if len(words) < 2:
    sys.exit(f"tighten: whisper found {len(words)} words in {raw}")

# Which spoken word opens each held beat: align the script's words to whisper's.
held = set()
if script.get("holds"):
    said = [norm(w) for w, _, _ in words]
    planned, opens = [], {}
    for beat, text in script["lines"]:
        opens.setdefault(beat, len(planned))
        planned += [norm(w) for w in text.split() if norm(w)]
    pairs = difflib.SequenceMatcher(None, planned, said, autojunk=False).get_matching_blocks()
    to_said = {b.a + i: b.b + i for b in pairs for i in range(b.size)}
    for beat in script["holds"]:
        if beat not in opens:
            sys.exit(f"tighten: hold '{beat}' is not a beat in script.json")
        idx = next((to_said[i] for i in range(opens[beat], opens[beat] + 6) if i in to_said), None)
        if idx is None:
            sys.exit(f"tighten: could not find beat '{beat}' in the take")
        held.add(idx)

pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(raw), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                     check=True, capture_output=True).stdout
audio = np.frombuffer(pcm, dtype=np.float32).copy()
fade = int(FADE * SR)
ramp = np.linspace(0.0, 1.0, fade, dtype=np.float32)
pieces, cursor, stops_before, stops_after = [], 0, [], []
for i in range(len(words) - 1):
    word, _, end = words[i]; start_next = words[i + 1][1]
    gap = start_next - end
    if i + 1 in held:
        target = HOLD_CAP
    elif word[-1:] in ".?!":
        target = STOP
    elif word[-1:] in ",:;":
        target = COMMA
    else:
        continue
    if word[-1:] in ".?!":
        stops_before.append(gap); stops_after.append(min(gap, target))
    if gap <= target:
        continue
    # Keep target/2 of the silence on each side of the cut, so the removed span is gap - target long.
    a = int(round((end + target / 2) * SR)); b = int(round((start_next - target / 2) * SR))
    head = audio[cursor:a].copy(); head[-fade:] *= ramp[::-1]
    pieces.append(head)
    audio[b:b + fade] *= ramp
    cursor = b
pieces.append(audio[cursor:])
out = np.concatenate(pieces)
enc = subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                      "-c:a", "libmp3lame", "-b:a", "192k", str(HERE / "voice.mp3")], input=out.tobytes())
if enc.returncode:
    sys.exit("tighten: ffmpeg could not write voice.mp3")
seconds = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                         str(HERE / "voice.mp3")]))
take = json.loads((HERE / "take.json").read_text())
before = take.get("tightened", {}).get("raw_seconds", take["seconds"])
take.update(seconds=round(seconds, 3), tightened={"stop": STOP, "comma": COMMA, "raw_seconds": before, "seconds": round(seconds, 3)})
(HERE / "take.json").write_text(json.dumps(take, indent=1) + "\n")
med = lambda v: round(float(np.median(v)), 2) if v else 0
print(f"seconds {before} -> {round(seconds, 2)}; median stop gap {med(stops_before)} -> {med(stops_after)}; "
      f"words/s {round(len(words) / before, 2)} -> {round(len(words) / seconds, 2)}")
