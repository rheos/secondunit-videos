#!/usr/bin/env python3
"""Record a devweb short's narration as one continuous take: Chris on ElevenLabs eleven_v4 (Robin's pick for the
series, 2026-10-29). The script is <project>/vo/script.json: {"lines": [["I", "text"], ...], "facts": "where every
claim comes from"}. Writes vo/voice.mp3 and vo/take.json. Then run vo/align.py from the kit.

    python3 -I tools/devweb-kit/vo/vo.py <project-folder>
"""
import json, pathlib, sys, urllib.request, subprocess, hashlib
PROJ = pathlib.Path(sys.argv[1]).resolve()
HERE = PROJ / "vo"
KEY = (pathlib.Path.home() / "Documents/novadiem/keys/elevenlabs/api.txt").read_text().strip()
VOICE = "iP95p4xoKVk53GoZ742B"  # Chris - Charming, Down-to-Earth (the felt GrowOperative voice)
LINES = json.loads((HERE / "script.json").read_text())["lines"]
text = " ".join(t for _, t in LINES)
body = {"text": text, "model_id": "eleven_v4", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}
req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_192",
                             data=json.dumps(body).encode(), headers={"xi-api-key": KEY, "Content-Type": "application/json"})
data = urllib.request.urlopen(req, timeout=300).read()
f = HERE / "voice.mp3"; f.write_bytes(data)
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))
(HERE / "take.json").write_text(json.dumps({"lines": LINES, "chars": len(text), "seconds": round(dur, 3),
                                            "sha256": hashlib.sha256(data).hexdigest()}, indent=1) + "\n")
print("chars", len(text), "seconds", round(dur, 2))
