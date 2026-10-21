#!/usr/bin/env python3
"""Reading time for a blueprint-kit film: after a plate's last typed character or set letter, the plate must hold
at least 1.5 s before it leaves (Robin, 2026-10-19: "we can't have the slide blink away the next second after the
last word"). Reads <project>/cues.json (tools/blueprint-kit/cues.mjs); a plate leaves at its first "out" cue, or
at the film's end. Exit 1 when any plate is short.

    python3 tools/blueprint-kit/holdcheck.py <project> [--end 147.9] [--min 1.5]
"""
import argparse, json, pathlib, re, sys

ap = argparse.ArgumentParser()
ap.add_argument("project")
ap.add_argument("--end", type=float, default=None)
ap.add_argument("--min", type=float, default=1.5)
a = ap.parse_args()
proj = pathlib.Path(a.project)
cues = json.loads((proj / "cues.json").read_text())
end = a.end
if end is None:
    m = re.search(r'id="root"[^>]*data-duration="([\d.]+)"', (proj / "index.html").read_text(), re.S)
    end = float(m.group(1)) if m else max(c["t"] for c in cues)
plates = []
for c in cues:
    if c.get("p") and c["p"] not in plates: plates.append(c["p"])
bad = 0
for p in plates:
    texts = [c["t"] for c in cues if c.get("p") == p and c["k"] in ("type", "slam")]
    outs = [c["t"] for c in cues if c.get("p") == p and c["k"] == "out"]
    if not texts:
        print(f"{p:6s} no typed text"); continue
    leave = min([o for o in outs if o > max(texts)] or [end])
    hold = leave - max(texts)
    short = hold < a.min
    bad += short
    print(f"{p:6s} last text {max(texts):7.2f}  leaves {leave:7.2f}  hold {hold:5.2f} s{'  <-- SHORT' if short else ''}")
print(f"plates holding under {a.min} s: {bad}")
sys.exit(1 if bad else 0)
