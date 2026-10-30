#!/usr/bin/env python3
"""Voice auditions for devweb (Robin, 2026-10-29: George is not the voice for a viral short, and his "A - I" had too
big a gap). Step 1 (`spell`): the opening line in Liam with four spellings of AI, gap measured. Step 2 (`voices`): the
first three lines in each candidate with the chosen spelling. Writes vo/audition/*.mp3. Robin picks by ear."""
import json, pathlib, sys, urllib.request
HERE = pathlib.Path(__file__).parent
KEY = (pathlib.Path.home() / "Documents/novadiem/keys/elevenlabs/api.txt").read_text().strip()
VOICES = {"liam": "TX3LPaxmHKxFdv7VOQHJ", "charlie": "IKne3meq5aSn9XLyUdCD", "laura": "FGY2WhTYpPnrIDTdsKH5",
          "chris": "iP95p4xoKVk53GoZ742B", "rose": "grNi3FzebPHA7xE0IOs6", "adam": "pNInz6obpgDQGcFmaJgB"}
def tts(vid, text, out):
    body = {"text": text, "model_id": "eleven_v4", "voice_settings": {"stability": 0.5}}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format=mp3_44100_192",
                                 data=json.dumps(body).encode(), headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    out.write_bytes(urllib.request.urlopen(req, timeout=300).read())
if sys.argv[1] == "spell":
    for tag, ai in {"ai": "AI", "dots": "A.I.", "ayeye": "ay-eye", "hyphen": "A-I"}.items():
        tts(VOICES["liam"], f"An {ai} never runs a tool.", HERE / f"audition/spell-{tag}.mp3")
else:
    ai = sys.argv[2]
    text = f"An {ai} never runs a tool. It can't. It only writes text. Ask it for the weather in Nelson. It doesn't check the sky. It writes a request."
    for name, vid in VOICES.items():
        tts(vid, text, HERE / f"audition/{name}.mp3"); print(name)
