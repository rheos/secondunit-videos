# Doodles on footage (look test)

Crayon-and-felt-pen characters living on an artist's real footage, after Kevin Ngo's doodles drawn on photos
(references/kevin-ngo K28): the real thing stays untouched, the doodle turns it into a set. Built on two of
Hjeron's own clips (The Wyrd One; consent on record in memory). Test 01, 2026-11-01: 9.2 s, 720x1280. Robin: "It lands". Look: looks/doodle-on-footage.yaml.

- **Walk** (walkaway clip 22.5-28.5 s; cut before his face shows at ~29 s): a sleepy sun drawn into the sunset
  glow wakes up, three crows perched on the long cloud take off as he nears, notes rise from his guitar hand, a
  little doodle wolf pup trots at his heel. The sun and crows sit behind him (his MediaPipe mask is laid back over
  them); the pup and notes are in front.
- **Dog** (wolfdog clip 0-3.2 s): a bird flies in and lands between the dog's ears, a heart pops, the prickly pear
  blooms, the bird leaves as the dog turns away.

## How it works

1. `tools/track.py <clip> [--masks]`: camera motion (LK flow on background corners, RANSAC affine, accumulated from
   frame 0) so world-pinned doodles ride the handheld camera; MediaPipe pose per frame; with `--masks`, the person's
   segmentation mask per frame into `work/mask_<clip>/`. Writes `data/track_<clip>.json`.
2. `tools/track_point.py <clip> <name> x,y r`: follows one region (the dog's head) by median LK shift.
3. `tools/verify_track.py`: draws the tracked points on a contact sheet. Check this before drawing anything.
4. `js/doodles.js` (loaded by `doodle.html`): `drawFrame(t, layer)` is pure; every mark is a Looseleaf pen stroke
   (`tools/looseleaf-pen`), crayon fills, held on twos and reseeded per drawing so the lines boil. Two layers:
   `back` (behind people) and `front`.
5. `render.mjs <clip> <out.mp4> [--stills t,...]`: draws both layers as transparent PNGs and composites them:
   footage + back, the person back on top through the feathered mask, then front.

```bash
uv run --no-project --python 3.12 --with opencv-python-headless --with mediapipe --with 'numpy<2.3' python tools/track.py walk --masks
PW_FROM=../bobwiseman-travel-agent/package.json node render.mjs walk out/walk_doodle.mp4
```

Inputs: copy the clips into `work/` at 24 fps (`work/`, `out/` are gitignored). Sources:
`secondunit/output/fal-transform-20261009/in/walk_22.5-32.5.mp4` (sha256 81ff33e5...) and `dog_0-3.2.mp4` (53df9e73...).

## Rules (test 01)

- Never draw on the artist; doodles sit beside, behind or on things around them.
- Felt ink #2a2320 at about 2.5 px, crayon fills a touch off the line, cream bodies so they read on light and dark.
- Palette: cream #f6efdc, sun #ffc93c, coral #ef6a4c, sky #79b8e0, plus ink.
- Sized as the subject of the frame (the sun is 170 px across), not as specks.
- Boil on twos (12 drawings a second).
