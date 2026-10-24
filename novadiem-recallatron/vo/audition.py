#!/usr/bin/env python3
"""Voice audition for the narrator: plate I's line in each candidate voice (ElevenLabs v4).
Writes vo/audition-<name>.mp3. Robin picks by ear."""
import json, pathlib, sys, urllib.request
HERE = pathlib.Path(__file__).parent
KEY = (pathlib.Path.home() / "Documents/novadiem/keys/elevenlabs/api.txt").read_text().strip()
LINE = ("[like a showman at an exhibition hall] Ladies and gentlemen: the thinking machine of the present day "
        "forgets everything at the stroke of the switch. Tell it on Monday that the staging server runs "
        "Postgres seventeen. [wryly] On Tuesday, you will tell it again.")
VOICES = {"george": "JBFqnCBsd6RMkjVDRZzb", "daniel": "onwK4e9ZLuTAKqWW03F9", "bill": "pqHfZKP75CvOlQylNhV4", "flint": "qAZH0aMXY8tw1QufPN0D"}
for name, vid in VOICES.items():
    body = {"text": LINE, "model_id": "eleven_v4", "voice_settings": {"stability": 0.5}}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_192",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    (HERE / f"audition-{name}.mp3").write_bytes(urllib.request.urlopen(req, timeout=300).read())
    print(name, "ok")
print(len(LINE), "characters per voice")
