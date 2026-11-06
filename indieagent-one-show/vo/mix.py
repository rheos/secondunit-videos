#!/usr/bin/env python3
"""Mix the voice over the score into assets/mix.mp3, the film's one audio track.
Each plate's line goes at T + VO (vo/timeline.json). The score's lead is trimmed so its
beat k sits at k * 0.625 s, then it ducks under the voice (sidechain) and the sum is
normalised to -14 LUFS, true peak -1.5 dB."""
import json, pathlib, subprocess
HERE = pathlib.Path(__file__).parent
ROOT = HERE.parent
tl = json.loads((HERE / "timeline.json").read_text())
segs = json.loads((HERE / "segments.json").read_text())
SCORE = ROOT / "../../score-library/drafting-table-one-show-vo/take-01.mp3"
LEAD = 0.056  # librosa beat fit on take-01: period 0.6250 s, residual max 19 ms
args = ["ffmpeg", "-y", "-v", "error", "-i", str(SCORE)]
chain = [f"[0:a]atrim=start={LEAD},asetpts=PTS-STARTPTS,volume=0.2[mus]"]
for i, s in enumerate(segs):
    args += ["-i", str(HERE / s["file"])]
    ms = round((tl["T"][s["plate"]] + tl["VO"][s["plate"]]) * 1000)
    chain.append(f"[{i + 1}:a]aformat=channel_layouts=stereo,adelay={ms}|{ms}[v{i}]")
vs = "".join(f"[v{i}]" for i in range(len(segs)))
chain += [
    f"{vs}amix=inputs={len(segs)}:normalize=0[vo]",
    "[vo]asplit=2[vo1][vosc]",
    "[mus][vosc]sidechaincompress=threshold=0.02:ratio=5:attack=40:release=450[duck]",
    f"[duck][vo1]amix=inputs=2:normalize=0,apad=whole_dur={tl['END']},atrim=0:{tl['END']},"
    "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[out]",
]
out = ROOT / "assets/mix.mp3"
subprocess.run(args + ["-filter_complex", ";".join(chain), "-map", "[out]", "-b:a", "192k", str(out)], check=True)
print(out, subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)]).decode().strip(), "s")
