#!/usr/bin/env python3
"""Join the pet acts' rendered frames into one review cut on the song.

    tools/pet_join.py [--song path/to/song.wav] [--acts 0-7] [--out out/film/pet/join]

Each act renders out/film/pet/act<N>/frames/<frame:05d>.png over its [F0, F1]; neighbouring acts share the boundary
frame, and the LATER act's frame wins there (it is that act's first frame). Every song frame 0..3980 must be present or
the script lists the gaps and stops. Encodes 1280x720 at crf 20 with the untouched song muxed from 0 s, named by the
house pattern <song>_<take>_f<start>-f<end>_24fps_<kind>.mp4.
"""
import argparse, os, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent.parent
ACT_FRAMES = {0: (0, 503), 1: (504, 1183), 2: (1183, 1654), 3: (1654, 1956), 4: (1956, 2539), 5: (2539, 3130),
              6: (3130, 3396), 7: (3396, 3980)}
SONG = pathlib.Path("/Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-real-thing/assets/song.wav")

ap = argparse.ArgumentParser()
ap.add_argument("--song", default=str(SONG))
ap.add_argument("--acts", default="0-7")
ap.add_argument("--out", default=str(HERE / "out" / "film" / "pet" / "join"))
ap.add_argument("--take", default="pet-d1")
ap.add_argument("--allow-gaps", action="store_true", help="encode what is there (frames held over gaps) for a partial check")
a = ap.parse_args()
lo, hi = (int(x) for x in a.acts.split("-")) if "-" in a.acts else (int(a.acts), int(a.acts))
acts = list(range(lo, hi + 1))

frames = {}
for n in acts:
    f0, f1 = ACT_FRAMES[n]
    d = HERE / "out" / "film" / "pet" / f"act{n}" / "frames"
    for f in range(f0, f1 + 1):
        p = d / f"{f:05d}.png"
        if p.exists(): frames[f] = p               # later acts overwrite the shared boundary frame
first, last = ACT_FRAMES[acts[0]][0], ACT_FRAMES[acts[-1]][1]
missing = [f for f in range(first, last + 1) if f not in frames]
print(f"[join] acts {acts}: {len(frames)} frames present of {last - first + 1}, {len(missing)} missing")
if missing:
    runs, s = [], missing[0]
    for x, y in zip(missing, missing[1:] + [None]):
        if y != x + 1: runs.append((s, x)); s = y
    print("[join] gaps:", ", ".join(f"{p}-{q}" if p != q else str(p) for p, q in runs[:20]), "..." if len(runs) > 20 else "")
    if not a.allow_gaps: sys.exit(1)

out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
listing = out / "frames.txt"
lines, held = [], None
for f in range(first, last + 1):
    p = frames.get(f, held); held = p
    if p is None: continue
    lines.append(f"file '{p}'\nduration {1 / 24:.6f}\n")
listing.write_text("".join(lines))
mp4 = out / f"realthing_{a.take}_f{first:05d}-f{last:05d}_24fps_draft.mp4"
ss = first / 24
cmd = ["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
       "-ss", f"{ss:.6f}", "-t", f"{(last - first + 1) / 24:.6f}", "-i", a.song,
       "-map", "0:v", "-map", "1:a", "-fps_mode", "cfr", "-r", "24",
       "-vf", "format=yuv420p" + (f",fade=t=out:st={(last - first + 1) / 24 - 1:.3f}:d=1" if last == 3980 else ""),
       "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "6M", "-bufsize", "12M",
       "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(mp4)]
subprocess.run(cmd, check=True)
n = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames",
                    "-of", "csv=p=0", str(mp4)], capture_output=True, text=True).stdout.strip()
print(f"[join] -> {mp4} ({n} frames, song from {ss:.3f} s)")
