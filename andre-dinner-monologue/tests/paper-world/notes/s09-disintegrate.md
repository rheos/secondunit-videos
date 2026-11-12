# Section 9, "extinguished" (f4082): the ball comes apart instead of folding shut

Director's note on the film at 2:50: "at the 'extinguished' it should disintegrate instead of just folding back up."
Files changed: `js/sections/s09.js`, `js/skins/s09.js`, `tools/cues/s09.json` (four stills added: 4087, 4098, 4116, 4140;
no cue touched). This note replaces the f4082 and f4092 to f4113 rows of the beat table in `notes/s09.md`.

Review file: `out/paper-world/wip/disintegrate/andre_paper-world-s09-disintegrate_f4040-f4201_24fps_720x1280.mp4`
(161 frames, voice from `_in/andre.wav` cut to [168.3333, 175.0417)). Frames: `out/paper-world/wip/disintegrate/frames/`.

## What happens now

| Frame | What happens | Camera |
|---|---|---|
| f4082 "extinguished" | The fourteen leaves are swapped for their scraps, which tile each leaf exactly: the frame is the open ball | Holds on the ball |
| f4083 to f4097 | The ball comes apart from the top down: a scrap lets go at `E + 14 * (1 - height)^0.9`, give or take a frame and a half. Tears open at the crown first; the bottom rim goes last | The target stays up to 8 cm higher than before (most at f4101) |
| from each scrap's own frame | It drifts out from the stem and down (0.45 to 0.9 cm a frame once it is falling), turning about an axis of its own, fluttering on two periods of its own. It goes grey over 7 to 12 frames (the grade takes 24), curls up to 4 radians of arc and shrinks to 35 to 60 %. The ones from the top go furthest out and last longest (18 to 54 frames), then shrink to nothing in the air, f4115 to f4135 (573 of the 659 are still falling at f4120, 90 at f4130) | Tilts down after the first flakes, f4101 to f4129 |
| f4098 to f4111 | The stem stands bare (the last scrap leaves it at f4097) | |
| f4112 to f4133 | The three sections drop into each other and the spine goes back through the slot, as before, 20 frames later | |
| f4118 to f4141 | 60 flakes come down flat instead of dying in the air: 52 on the open cloth, 3 on the basket's dome, 1 each on the salt and the pepper, 3 on the fallen wall along the left edge. They lie there, each with its shadow | Down to the slots, as before from f4129 |
| f4143 to f4165 | The flakes that landed shrink to nothing, 9 frames each, the last gone at f4164.5. Those in rank 3's strip are gone by f4159 (rank 3 hinges up from f4161); none lands where ranks 1 and 2 lie | |

Unchanged, on the same frames: the candle's gutter, the fill, the grade's drain (f4082 to f4106), every cue, the robots.
The burst's three coloured lights and its share in the towers' tint now fade over 16 frames from f4082 (they went
with the leaves shutting, over 10).

## How it is made

- **The scraps are the plate.** Each leaf's own cut of `burst.png` (458 by 840 px, 26.7 px a cm) is torn into about
  fifty cells: 68 jittered sites, each pixel given to its nearest site after the pixel has been pushed about by three
  octaves of seeded noise, so the tear lines wander and fray. The cells are an id map (one byte a pixel, one texture a
  leaf). A scrap is a 4 by 4 grid over its cell's box that draws the leaf's texture and discards every pixel that is
  not its own cell. 719 scraps in all; the longest side of a scrap's box is 2.1 to 6.7 cm when it tears off (median
  4.1), 1 to 3 cm once it has curled. No scrap has a colour of its own.
- **Grey** is the scrap's own paper: `mix(paper, lightness(paper) * ash * the candle's tint, grey)`, `ash` 0.45 to 1.05
  per scrap. Coloured, a scrap is the ball's paper, unlit and untinted as the ball is; grey, it is under the one tint
  like every other painted piece, so it dims with the gutter.
- **Shadows**: a `MeshDistanceMaterial` with the id map and the leaf's alpha compiled in, so a scrap in the air or on
  the cloth casts its torn shape, soft, as other flats do.
- **Motion** is `scrapAt(o, f, ...)` in `js/sections/s09.js`: a pure function of f, every number from
  `hash(seed of leaf and cell, n)`. Posed every frame. The skin poses once a frame (the twelve sub-renders share it).
- **Camera**: no key moved. `camAt` adds `8 * w(u)` cm to the target's height for f4082 < f < f4129 only,
  `w = 28.94 u^2 (1 - u)^3`, `u = (f - 4082) / 47`: zero with zero slope at both ends. The lens's path and speed are
  as they were (0.092 to 0.29 cm a frame over f4060 to f4180, no dead stops, no jumps); the tilt is at most 1.18
  degrees a frame (f4116).
- One new registered piece: `s09.burst_scraps`. No name changed.

## Proof that nothing else moved, and scans

`out/paper-world/check-disintegrate/`: `before/` and `after/`, f4050, f4070, f4200, f4240, f4314, f4400, f4600 as PNG
(N = 12), and `regress.txt`: all seven byte-identical (mean 0.0000, max 0). `sheet_f4083-f4160.jpg`: twelve frames of it.

- The 161 review frames against the delivered `frames-s09/`: f4040 to f4081 and f4163 to f4200 are byte-identical
  JPEGs (80 frames); f4082 to f4162 differ. f4082 itself (scraps in place of leaves, nothing moved yet) differs by
  0.37 of 255 on average, 0.08 % of pixels by more than 8.
- flashcheck on the review file: pass, worst 0.5 flashes in a second (at f4095, the whole frame).
- Render: 567 ms a frame over f4040 to f4200 at N = 12, niced, on a shared machine; the frames with scraps in them
  took no longer than those without (one draw call a leaf, posed once a frame).

## BANNED (as the brief: none of these is in it)

Fire, smoke, glow, sparks, embers; a scrap drawn as a flat colour; a fade (they shrink); scraps on twos.

## Defects

- The three flakes on the fallen wall land outside the frame: from f4118 the lens looks at the ranks, and the wall on
  the left edge is behind its left shoulder.
- The towers are cards that turn to the lens, so the five flakes "on" the basket, the salt and the pepper lie 0.5 cm
  in front of the card, leaning toward the lens.
- Scraps do not collide: one in the air passes through the stem or through another.
- Some scraps are over 4 cm when they tear off (to 6.7 cm along the longest side of the box); smaller ones would mean
  about a thousand.
- Tearing the fourteen leaves adds about 3 seconds to the page's load (once a render, not a frame).
