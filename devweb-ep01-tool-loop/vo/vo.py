#!/usr/bin/env python3
"""Record the narration (ElevenLabs v4, George) as one continuous take. Writes vo/voice.mp3 and vo/take.json.
Every claim maps to devweb.org/glossary/tool-calling-loop (devweb content/glossary/tool-calling-loop.mdx):
"A model does not run a tool. It emits a request to run one, the harness runs it, and the result comes back as
more context. The loop is that handoff, repeated until the model stops asking." The weather call is synthetic."""
import json, pathlib, urllib.request, subprocess, hashlib
HERE = pathlib.Path(__file__).parent
KEY = (pathlib.Path.home() / "Documents/novadiem/keys/elevenlabs/api.txt").read_text().strip()
VOICE = "JBFqnCBsd6RMkjVDRZzb"  # George - Warm, Captivating Storyteller (Robin's pick for narrated drafts, 2026-10-21)
LINES = [
 ("I", "An AI never runs a tool. It can't. It only writes text."),
 ("II", "Ask it for the weather in Nelson. It doesn't check the sky. It writes a request: call get weather, city, Nelson. That's the whole move."),
 ("III", "Something else picks that request up: the harness. It runs the tool, gets back four degrees and rain, and hands that to the model as more text."),
 ("IV", "The model reads it, and decides: answer, or ask again. That's the loop. Ask. Run. Read. Again and again, until it stops asking."),
 ("V", "So if an agent ever deletes a file, the model didn't run that command. The harness did. That's where the guardrails belong."),
]
text = " ".join(t for _, t in LINES)
body = {"text": text, "model_id": "eleven_v4", "voice_settings": {"stability": 0.5}}
req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192",
                             data=json.dumps(body).encode(), headers={"xi-api-key": KEY, "Content-Type": "application/json"})
data = urllib.request.urlopen(req, timeout=300).read()
f = HERE / "voice.mp3"; f.write_bytes(data)
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))
(HERE / "take.json").write_text(json.dumps({"lines": LINES, "chars": len(text), "seconds": round(dur, 3),
                                            "sha256": hashlib.sha256(data).hexdigest()}, indent=1) + "\n")
print("chars", len(text), "seconds", round(dur, 2))
