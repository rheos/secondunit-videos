# Reform Party at Burning Man: Blender look test

Robin asked (2026-10-16) whether Bob Wiseman's Reform Party video could be redone in Blender. Draft 3 is a
code-drawn Canvas2D renderer (branch `reform-party-1`, `bobwiseman-reform-party/js/dali/`). Before any
rebuild, this folder rebuilds one shot and puts it next to draft 3. Issue #174.

The shot is song time 23.50-27.00 s (84 frames), draft 3's held SPK framing: the speakerphone gets a tape X
on "can't" (24.76 s) and from 25.21 s slumps like a soft watch over the table's front edge.

## Run it

```bash
blender -b --factory-startup --python slump_shot.py -- --stills 1,42,84   # out/stills/
blender -b --factory-startup --python slump_shot.py -- --render           # out/frames/, 84 frames
blender -b --factory-startup --python slump_shot.py -- --stills 1 --grins --tag grins
```

Draft 3's matching frames come from its own harness, in a checkout of `reform-party-1` with the project's
`source/`, `assets/`, `js/gen/` and `node_modules` in place:

```bash
PAGE=looks/dali.html node check.mjs --full <this folder>/out/draft3 23.5 23.541667 ...   # t = 23.5 + i/24, i = 0..83
```

Then `python tools/compare.py <reform-party project dir>` (needs Pillow and numpy) adds draft 3's vignette,
grain and captions to the Blender frames and writes `out/side_by_side.jpg`, `out/side_by_side.mp4` and
`out/blender_shot.mp4`. Lyrics are read from the project's `source/lines.json` at run time and never land
here. `out/` is gitignored.

## What is in the scene

- The same numbers as draft 3: the SPK camera and its drift (`camera.js`), the car at 1.6 m/s (`world.js`),
  the table, seats, wheels and suits (`car.js`), the speakerphone, tape, LEDs and drips (`table.js`).
  Draft coords (x right, y up, z away) map to Blender as (x, z, y). Draft focal length 1400 px on a
  1920 frame is a 26.25 mm lens on a 36 mm sensor.
- The slump is draft 3's own `flow()` and `drape()`, run per frame on a 3D puck and baked as absolute shape
  keys (one per frame, played by `eval_time`). The fold round the table edge is a real bend, not a 2D drape.
- 14 egg-head suits on low hop-on seats, rosettes, ties, the drawer torso, Dali crutches, knees solved with
  the same two-bone IK as `kneeIK`. Grin cards on every egg, hidden here because draft 3 has no grins in this
  shot (they come on line 5); `--grins` shows them.
- Cel shading from the orb lab: Diffuse > Shader to RGB > CONSTANT ramp > Emission, Standard view transform,
  lamps white, colours in the ramps. Two suns at angle 0: the draft's low sun (17 deg, behind-left, casting
  the long shadows toward camera) and a shadowless key from front-left so faces read. Ink is Grease Pencil
  Line Art over the car collection.
- The playa is a plane with Voronoi edge cracks at draft 3's 3.2 m cell.
- Not built: dust and wheel tracks. In this framing the car's rear is out of shot, so draft 3 shows none.

## Results (2026-10-16, 2019 Intel MacBook Pro, Blender 4.5.14, EEVEE, AMD 5500M)

| | draft 3 (Canvas2D) | Blender look test |
|---|---|---|
| Render, 960x540 | 99 ms a frame (drawn at 1920x1080) | 1.1 s a frame at 16 samples, 96 s for the shot; first frame ~15 s shader compile |
| Whole song, 6,456 frames | ~13 min locally, 250 s on GitHub | ~2 h at 540p, roughly 6-8 h at 1080p locally |
| Build effort | already built (seven builders, three drafts) | ~2.5 h for this one shot, most of it the car, suits and the soft puck |

**What Blender did better**

- Real cast shadows. The speakerphone, easel legs and suits throw long shadows across the table and playa
  that follow the geometry. Draft 3 fakes them with hulls on the ground and has none on the table top.
- The slump has volume. It folds over the edge with thickness, light on its hump and a shadow under it.
  Draft 3's version is a flat polygon that sags.
- Solid objects: the hat sits inside a real hole with a dark well, the skirt has pleats that shade, the
  rosettes and drawer fronts have depth, the whiteboard catches the sun.
- Line Art gives an even ink line for free, and any camera move would hold up without new drawing code.

**What got worse**

- The painted charm. Draft 3's soft gradients on the eggs and jackets, its pale table grain and its
  billboard figures read as illustration. Blender's cel bands read as a 3D cartoon, cleaner but closer
  to a game cutscene. The jagged shadow bands inside the slumped dome are the worst spot.
- Composition. Draft 3's suits are screen-space billboards that stand upright whatever the camera's pitch,
  so their egg heads sit against the skirt in mid-frame. In true 3D, from the same camera, the near row
  drops to the bottom edge and the eggs get cropped. Every one of draft 3's ~60 shot-list framings would
  need re-blocking, because the shot list was tuned to the billboard figures.
- Speed: about 11x slower a frame, and the iteration loop is a Blender render instead of a browser reload.
- Draft 3's 2D gags (the iris into the table world, screen-space overlays, captions) would have to be
  rebuilt as compositor work or kept as a 2D layer on top.

## Recommendation

Don't rebuild. A full rebuild means every asset in `car.js`, `table.js`, `installs.js`, `playa.js` and
`burn.js` remade as geometry (dozens of props, the burn, the Man, the camps, the art cars), every
framing re-blocked, and every 2D gag reworked. It would take weeks, and the result trades draft 3's
illustrated look for a generic toon-3D one. Bob hasn't seen draft 3 yet, so nothing says the look is the
problem.

If something here is worth taking, it is one hero shot. The slump is the best case for Blender: a soft
object with weight and a shadow. That could be rendered in Blender and cut into the Canvas2D draft as an
insert, at the cost of a visible change in look for those few seconds. Even that is only worth doing if
Robin or Bob wants this moment to land harder.
