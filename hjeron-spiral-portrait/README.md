# One-spiral-line portrait (look test)

A single Archimedean spiral, wound out from one centre, whose width follows the photo's darkness: Claude Mellan's
1649 engraving technique, seen in Kevin Ngo's Rembrandt post (references/kevin-ngo K29). Drawing the line is the
animation. Ours starts inside the moon and winds out until Hjeron (The Wyrd One, veiled; his photo, consent on
record) appears against it.

Test 01, 2026-11-01: 1080x1080, 9.5 s (7 s of drawing, 2.5 s hold), 309,409 points, about 9 s to render. Robin: "It lands". Look: `looks/spiral-line-portrait.yaml`.

```bash
uv run --no-project --with opencv-python-headless --with numpy python tools/spiral.py still out/still.png
uv run --no-project --with opencv-python-headless --with numpy python tools/spiral.py film out/spiral.mp4
```

Input: `work/moon.webp`, a copy of `secondunit/hjeron-darkblues-ref/1.webp` (sha256 bf0a94a6...). Settings are the
constants at the top of `tools/spiral.py`: crop, spiral centre, spacing, width range, gamma, colours, timing.

## Rules (test 01)

- One line, never lifted: a single spiral from the centre to past the corners.
- Width from darkness, capped at 78% of the spacing so the line never merges into solid black (the engraving
  reads only while every turn stays visible), and a 6% hairline in the whites so the spiral shows in the moon.
- Local contrast (CLAHE) before mapping, or a dark figure melts into a dark sky.
- 5 px between turns at 1080. Drawn at 2x with sub-pixel polygon edges (`shift=4`); whole-pixel edges make
  near-vertical turns step together into horizontal bands.
- Warm black ink on cream paper with fine grain.
- Mostly constant arc speed, soft at both ends; a small pen tip rides the head of the line.
- Never scale a render down: 5 px lines turn to moire below about 800 px. A smaller version (a styles clip,
  9:16 at 720) is a new render with the spacing set for that size.
