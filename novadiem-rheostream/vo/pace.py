#!/usr/bin/env python3
"""Pace George's read: eleven_v4 ignores voice_settings.speed (tried 1.1 on 2026-10-21, same lengths), and his calm
read of the approved ~400-word script runs 162 s. So each segment is played 10% faster with ffmpeg atempo, which
keeps the pitch (no face on screen to sync). vo/seg-NN.mp3 -> vo/seg-NN-p.wav; segments.json "file" points at it,
"source" keeps the recording. Re-run align.py and place.py after."""
import json, pathlib, subprocess
HERE = pathlib.Path(__file__).parent
TEMPO = 1.1
segs = json.loads((HERE / "segments.json").read_text())
for s in segs:
    src = HERE / s.get("source", s["file"]); s["source"] = src.name
    out = HERE / src.name.replace(".mp3", "-p.wav")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-af", f"atempo={TEMPO}", "-ar", "48000", "-c:a", "pcm_s24le", str(out)], check=True)
    s["file"], s["tempo"] = out.name, TEMPO
    s["seconds"] = round(float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)])), 3)
(HERE / "segments.json").write_text(json.dumps(segs, indent=1) + "\n")
print("speech", round(sum(s["seconds"] for s in segs), 1), "s at", TEMPO)
