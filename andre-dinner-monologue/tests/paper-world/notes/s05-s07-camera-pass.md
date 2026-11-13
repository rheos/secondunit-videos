# Sections 5 to 7: the camera pass (Nov 13 2026)

Only the camera changed: `js/sections/s05.js`, `s06.js`, `s07.js`. No cue, event, hook or skin was touched. The brief is
`docs/CAMERA-PASS.md`, "Decided with Robin".

## Shots

| First frame | Time | Cut on | What the shot holds |
|---|---|---|---|
| f1800 | 1:15 | section start (cut in) | The old glide, exactly: low across the table to the far corner, the tree man coming in by the sapling |
| f1930 | 1:20 | "trees" | From the right edge of the table, 45 cm from the pot, pulling back to 57 and rising from 9.5 to 16 cm, never looking more than 1 degree up. The sapling springs; the lens is still 12 frames before "redwoods"; the redwood swings up whole in the tall frame with the room's wall behind its crown |
| f2036 | 1:24 | "84" + 14 | Beside him at the bottle, at his height, from the south-west: he has stopped and is leaning on the stick. Pushes in 3 cm; from "backpack" goes with him on a line parallel to his, to the candle and down its west side while he walks round it |
| f2192 | 1:31 | "where" | The old spline from here to the end of section 5: him at the candle, the climb as New York rises, the drop to the fence, the rise to the high wide |
| f2544 | 1:46 | no cut | The dive to the wall, the old path at a new pace (below). From f2636 section 6 is the old camera exactly |
| f3130 | 2:10 | no cut | The old camera exactly to f3323, then the hold on the hand carries on at its own drift |
| f3331 | 2:18 | "escape" | The wide the old crane ended on: the pine opens to 60 cm, the wall falls, the candle flares. On the old spline from f3359 |

"trees" and "redwoods" are one shot (the same pot from one angle): a separate redwood shot would have been 24 frames
long. The cut to the walk shot is 14 frames after "84" (review, Nov 13), so the redwood stands 26 frames before it.

The tree shot was first built low (3 cm up, looking up 24 degrees). From there the top edge of the room's wall (a
cylinder 330 cm out, its top 234.5 cm up: 35 degrees above the table from anywhere on it) stood in the frame as a black
band behind the crown. Any shot in this room that looks up more than about 4 degrees shows it. The top of this shot's
frame now stays 1.7 degrees or more under that edge on every frame.

## How each kept stretch was kept

- `S5.CAM_KEYS` is the old list with one key moved (below). Shots 1 and 4 read it whole, so f1800 to f1929 and f2192 to
  f2300, f2346 to f2544 are the old camera to the last bit.
- `S6.CAM_KEYS` is untouched. `camAt` reads it at `diveT(f)`, which is `f` everywhere but f2545 to f2635.
- `S7.CAM_KEYS` is the last shot's list and ends with the old keys at f3359, f3361, f3363 and f3405, so
  `handover(S7.CAM_KEYS, 3397)` gives the same position, target and velocity as before, bit for bit.

## The two changes inside kept moves

- The fence: the key at f2326 went from `[45, 27, 10]` to `[41.5, 28, 10]` (3.6 cm). The lens now crosses the right fence
  3.2 cm from the fork's tines (it was 0.7). The key at f2346 carries the tangent it had before (`mP`), so the hold at
  the fence from f2346 on is the old one. Peak speed of the drop 2.40 to 2.44 cm a frame, turn 1.44 to 1.41.
- The dive: `DIVE` in s06.js maps each frame to a place on the old spline. Peak speed 4.79 to 4.28 cm a frame, peak turn
  2.63 to 1.58 degrees a frame. It starts two frames sooner (f2544) and lands on the same frame (f2636). It gained no
  frames at the landing: the first wall segment starts to rise on f2636, the frame the old dive landed, so there was
  never 12 frames of slack there. With the time fixed, speed and turn trade against each other: a turn of 1.8 allows
  a peak of 3.7, 1.65 allows 3.9, 1.58 needs 4.3. Landing 12 frames later (f2648) would allow about 3.1 and 1.55, with
  the first wall segment rising under a lens that is still arriving.

## What the rules could not all have

- The redwood lands about f2010 and the cut is at f2036: a 26-frame hold, not 36.
- In the walk shot he is thin for about 30 frames (f2160 to f2191) as he walks away round the candle, and at the bottle
  he is 12 % smaller than in cut 05 (the far glass stands where a closer lens would go).
- The float (s05's, at 1) alone turns the view up to 0.3 degrees a frame when the subject is 11 cm away, so the walk
  shot reads up to 0.41 on the speed check.

## Tools

`SPEED`, `NEAR` and `PX` on `tools/render.mjs`. Stills and one sheet per section are in
`out/paper-world/camera-pass/s05`, `s06`, `s07`.
