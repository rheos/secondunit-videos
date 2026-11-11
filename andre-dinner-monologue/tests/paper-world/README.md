# paper-world: test 02, the table section, f1800 to f2544 (75.0 to 106.0 s)

The table-city section rebuilt as a real 3D paper world in three.js r160: one dinner table, flat paper cut-out
people standing in it as cards, one continuous camera that never cuts and never stops. This render is a
**blocking pass**: camera, timing, staging and pop-up mechanics are the deliverable; the final surface is made
later in a photoreal pass from `out/paper-world/blocking.json`.

Review file: `out/paper-world/andre_paper-world-test02_f1800-f2544_24fps_720x1280.mp4` (744 frames, 31.000 s,
voice muxed from `_in/andre.wav` cut to [75.0, 106.0)).

**Units and axes (also in blocking.json): centimetres, right-handed, y up, the cloth is y = 0, x to the right,
z toward the viewer. The near place setting is at +z, the far one at -z. Quaternions are [x, y, z, w].**

## Commands

Everything, from `tests/paper-world/`:

```bash
zsh tools/make.sh
```

One step at a time (`PY` = the viralvision venv python with numpy):

```bash
nice -n 15 $PY tools/onsets.py                                     # snap the words to onsets, writes js/cues.js (gitignored)
FRAMES=1800-2543 SPEED=12 node tools/render.mjs                    # camera speed print: cm a frame, dead stops, jumps
FRAMES=1800-2543 OUT=../../out/paper-world/frames nice -n 15 node tools/render.mjs    # frames (N=10 sub-renders each)
nice -n 15 ffmpeg -y -framerate 24 -start_number 1800 -i ../../out/paper-world/frames/f%04d.jpg -ss 75.0 -to 106.0 -i ../../_in/andre.wav -map 0:v -map 1:a -c:v libx264 -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart ../../out/paper-world/andre_paper-world-test02_f1800-f2544_24fps_720x1280.mp4
BLOCKING=../../out/paper-world/blocking.json node tools/render.mjs # the blocking export
FRAMES=2349,2426 PX=1 node tools/render.mjs                        # how tall each figure stands on screen, in px
LINEUP=1 W=1400 H=900 N=16 FRAMES=1800 OUT=../../out/paper-world/wip/lineup node tools/render.mjs   # the figure line-up
zsh tools/sheet.sh <name> <cols> <frame> [frame ...]               # a quick low-sample contact sheet into out/paper-world/wip/
nice -n 15 $PY ../../../tools/cloud-render/badframes.py <review.mp4>
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py <review.mp4>
```

`tools/render.mjs` env: `FRAMES` ("a-b", "a,b,c", "a-b:step"), `OUT`, `N` (sub-renders a frame), `W`, `H`,
`RESUME=1`, `PNG=1`. In a browser, serve the folder and open `index.html?f=2300` for one frame (`&n=16` for
more samples); with no `f` the section plays on a loop. The page keeps the brief's contract: canvas `#c`,
`window.ready === true`, `window.renderFrame(f)` a pure function of f.

## The beat table (frames snapped by tools/onsets.py)

| Frame | Word | What happens | Camera |
|---|---|---|---|
| f1800 | (start) | One flame, the far glass and the bottle behind it, the pot small at the far corner | 6 cm up, 20 cm from the flame, already gliding toward the far corner |
| f1874 | "tree expert" | The tree man (hat, pack, stick, stooped) is beside the potted sapling, walking in (118 px) | passing the glass stem; then over the plate rim and the knife and spoon |
| f1930 | "trees" | The sapling springs a tier and stands 1.5 cm taller | beside him at his eye height, the knife and spoon stacks under the lens |
| f1998 | "redwoods" | The sapling shoots up into a redwood (about 65 cm; the bottle is 31 cm) | he passes the lens; the camera looks up the trunk (peak f2009) and comes back down |
| f2022 | "84" | He stops and leans on the stick, tiny beside the bottle | behind his shoulder: bottle left, candle and glass beyond |
| f2071 | "backpack" | He hitches the pack (it jumps and settles) and walks on | drifts round him, then tracks |
| f2106 | "tomorrow" | He reaches the candle; the flame leans after him as he goes round it | his far side, the candle coming into frame |
| f2192 | "where are you from" | He has stopped (f2190); the card turns half a turn to the near setting, edge-on at f2196 and f2197 | round the candle on the outside of his circle, rising from 5 to 10 cm |
| f2215 | "New York" | Plates, bottle, glasses, salt, pepper, basket and napkin telescope up out of the cloth, three frames apart, windows coming on floor by floor | cranes up and back to 64 cm, tilted down 35 degrees (f2300) |
| f2218 | | The tree man's card turns back; from f2227 he walks out down the street | |
| f2236 | "New York" (2) | 54 cutlery cards deal off the six stacks, slide out to the fence line, travel along the table edge and hinge up on their foot tabs (all up by f2300) | |
| f2300 | "Do you know" | Citizens are walking out of the towers toward the fence | comes down to citizen height at the fence |
| f2349 | "never do" | The first wave has stopped at the fence; their cards turn (f2349 to f2365) and they walk back. The tree man walks on | 7 cm up, 20 cm from the fence |
| f2367 | ("oh, yes") | The tree man walks out between two posts | |
| f2402 | "why" (f2406) | Outside, by the redwood, his card turns and he looks back in | 4 cm up, creeping toward the fence |
| f2426 | "don't leave" | The second wave stops at the fence; they turn from f2432 | |
| f2458 | "theories" (f2466) | | starts up and back: a real crane, the view steepens as it rises |
| f2522 | "all" | The whole table as a walled, lit city; citizens small in the streets; the redwood and the tree man outside the fence | lands on the high wide, then drifts to f2544 |

## Where this departs from the brief's camera table, and why

- **Camera speed in the first leg is 0.25 to 0.5 cm a frame, not 1.2.** At 1.2 the 130 frames would cover 156 cm
  on a 130 cm table. The lens passes the glass stem, the plate rim and the cutlery at 3 to 8 cm, which is what
  reads as speed.
- **The candle sits 19 cm off-centre toward the far right, and the bottle and far glass beside it.** A 4.7 cm
  man at 12 frames a step covers 0.22 cm a frame, so from the corner pot he can reach a bottle 30 cm away by
  "84" and a candle 37 cm away by "tomorrow", not the centre of a 90 by 130 cloth.
- **Round the candle the camera turns about 190 degrees, not a quarter.** A flat card seen along its own plane is
  a line, so the camera stays on the outside of his circle, square to him, with the flame behind him.
- **The street view looks across the street at the fence, not down it.** Cards walking away from the lens are
  edge-on. Looking along -z, the citizens and the tree man cross at 45 to 60 degrees and the fence runs
  diagonally through the frame, the redwood behind it.
- **The fence cuts the far right corner off with a long chamfer**, so the redwood and a triangle of cloth are
  clearly outside the wall.
- **The tree man is not outside the fence at f2300: he walks out through it at f2367**, between two posts, while
  the citizens stop and turn back at it. He stands outside by the redwood from f2402. A man of his size cannot
  get from the candle to the corner any sooner, and the walk-out says the line ("they want to leave but never do").
- Vertical field of view is 60 degrees, fixed. The lens never zooms.
- Two lights are cheats for readability and are named in blocking.json: `bounce_light` (shadowless, above the
  flame) and `eye_fill` (dim, cool, from the lens).

## Files

```
tests/paper-world/
  index.html              the page: canvas #c, ?f=<frame>, ?w= ?h= ?n=
  js/kit.js               the paper kit: grain(), paper(colour), card(shape2D, colour, thickness), tube, disc,
                          discStack, ring, box, strip, windows; springs and seeded numbers
  js/table.js             the world: room, cloth, plates/towers, glasses, bottle, shakers, basket, napkin, candle
                          and flame, pot and redwood, the cutlery stacks and the fence; every piece named
  js/figures.js           the walking rig: makeFigure, makeTreeman, makeCitizen (2D joints, feet planted by IK)
  js/story.js             layout, paths, walkers, every event and the camera keys, all on cue frames
  js/main.js              renderer: N jittered sub-renders a frame, glow, grade; renderFrame, exportBlocking,
                          camInfo, figurePx; ?lineup=1
  js/cues.js              generated by tools/onsets.py (gitignored)
  js/lib/three.module.js  three.js r160 (MIT)
  js/cast/, lineup*.html  Builder B's (guard, hands, seed, pine); not used by this section
  tools/lineup.mjs, paint.sh, plates.json, work/   not Builder A's either; left untouched
  tools/onsets.py         snaps the words to onsets of _in/andre.wav
  tools/render.mjs        frames, camera speed print, figure heights, blocking export (headless Chrome, Metal)
  tools/make.sh           the whole pipeline
  tools/sheet.sh          quick contact sheets while building
  tools/motioncheck.py    how much the picture changes a second apart
  tools/render-frames.reference.mjs   the reference renderer this was adapted from
  README.md, NOTES.md
out/paper-world/
  andre_paper-world-test02_f1800-f2544_24fps_720x1280.mp4    the review file
  blocking.json           camera and every named object per frame (see NOTES.md, "For the Blender pass")
  frames/                 the 744 rendered frames
  check/f<frame>.jpg      full-size stills: 1800 1874 1930 1998 2009 2022 2071 2106 2110 2196 2215 2236 2262 2300
                          2349 2367 2400 2406 2426 2466 2522 2543
  check/sheet.jpg         contact sheet of those
  check/compare_wide_test01-f2543_vs_test02-f2543.jpg, compare_street_test01-f2426_vs_test02-f2400.jpg
  check/lineup-figures.jpg            the tree man and three citizens, about 600 px tall
  check/first17s_every24.jpg, first17s_change.txt   f1800 to f2215 a second apart, and the change between each pair
  check/camera-speed.txt, cues.txt    the speed print and the snapped cues
  check/figure-heights-px.txt         how tall each figure stands on screen at the figure beats
  wip/                    working sheets from the build
```

## blocking.json

`fps`, `f0`, `f1`, `cues`, `beats`, `layout`, `fence_polygon_xz`; `camera.fov_vertical_deg` and, per frame,
`pos`, `target`, `quat`; `objects.<name>`: `parent` (a named object, or null for world), `type`, `size` and
`bbox_min` (the piece's own bounding box at f1800, cm), `visible` changes, and `track` (`f`, `pos`, `quat`,
`scale`: a sample for every frame where the transform changed; hold the last value otherwise; figures are on twos).
Names: `plate_far`, `plate_near` (with `.tier_0`...), `glass_far`, `glass_near`, `bottle`, `salt`, `pepper`,
`basket`, `napkin`, `candle`, `flame`, `pot`, `redwood` (`.trunk_0`..`3`, `.crown`, `.tier`), `fence_01`..`fence_54`
(`.hinge`, `.head`, `.handle`, `.tab`), `treeman` and `citizen_01`..`16` (`.torso`, `.head`, `.thigh_near`...),
`cloth`, `room_floor`, `key_light`, `bounce_light`.
