#!/usr/bin/env python3
"""Record the narration one plate at a time (ElevenLabs v4, George), passing the neighbouring lines as
previous_text / next_text so the read stays continuous. Writes vo/seg-NN.mp3 and vo/segments.json.
Every claim maps to ~/Code/novadiem/assistant/ideas/recallatron-video.md ("What's true")."""
import json, pathlib, urllib.request, subprocess, hashlib
HERE = pathlib.Path(__file__).parent
KEY = (pathlib.Path.home() / "Documents/novadiem/keys/elevenlabs/api.txt").read_text().strip()
VOICE = "JBFqnCBsd6RMkjVDRZzb"  # George - Warm, Captivating Storyteller (picked by Robin 2026-10-21)
SEGS = [
 ("I", "[like a showman at an exhibition hall] Ladies and gentlemen: the thinking machine of today forgets everything at the stroke of the switch. Tell it on Monday that staging runs Postgres seventeen. [wryly] On Tuesday, you will tell it again."),
 ("II", "Some engines keep a memory of sorts: a heap of notes, out of sight. An old fact returns as if it were new. A private note reaches the wrong desk. And nobody can say why the machine believes what it does."),
 ("III", "The Recall-a-tron keeps each memory as a proper record: what kind it is, who may read it, and to what ends. Where it came from, and how often it was revised. Draw a memory from a private one, and it stays private."),
 ("IV", "It remembers without being told. When a session ends, an apparatus on your own machine reads only the lines you typed, and scrubs them. Nothing that leaves names your session, your folders or your project. Each passage yields one memory at most."),
 ("V", "When a fact changes, the old one is superseded: retired to the history, not destroyed. When a fact was wrong, it is corrected in place, the revision counted, and everything built upon it flagged for review."),
 ("VI", "Ask it a question. It first sets aside every memory you may not read, and every one retired. Then it searches by the words and by the sense at once, combines the two, inspects every source, and a second reader on the premises puts the best first."),
 ("VII", "At your next session, the relevant memories are laid before the machine: each one dated, each one a claim to check, never an instruction."),
 ("VIII", "Ask it to forget, and it forgets entirely: the memory, and all that was drawn from it. Its search runs on your own server, with no key to anyone else's, and the whole of it can be exported and restored."),
 ("IX", "This is no promise. On the thirtieth of September, twenty twenty-six, an older store was moved in, every record counted. It has been in operation ever since."),
 ("X", "The Recall-a-tron. A memory you may inspect, correct, and trust."),
]
import sys
ONLY = set(sys.argv[1:])  # plate keys to re-record; the rest keep their files
old = {x["plate"]: x for x in json.loads((HERE / "segments.json").read_text())} if ONLY and (HERE / "segments.json").exists() else {}
out = []
for i, (k, text) in enumerate(SEGS):
    if ONLY and k not in ONLY:
        out.append(old[k]); continue
    body = {"text": text, "model_id": "eleven_v4", "voice_settings": {"stability": 0.5},
            "previous_text": SEGS[i - 1][1] if i else None, "next_text": SEGS[i + 1][1] if i + 1 < len(SEGS) else None}
    body = {a: b for a, b in body.items() if b is not None}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    f = HERE / f"seg-{i:02d}.mp3"
    data = urllib.request.urlopen(req, timeout=300).read(); f.write_bytes(data)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))
    out.append({"plate": k, "file": f.name, "seconds": round(dur, 3), "chars": len(text), "sha256": hashlib.sha256(data).hexdigest()})
    print(k, round(dur, 2), "s")
(HERE / "segments.json").write_text(json.dumps(out, indent=1) + "\n")
print("total chars", sum(s["chars"] for s in out), "speech", round(sum(s["seconds"] for s in out), 1), "s")
