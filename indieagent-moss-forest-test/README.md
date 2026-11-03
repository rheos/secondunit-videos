# Moss forest (look test)

A 15 s silent look test, 16:9 at 720p, 24 fps, every frame drawn in code (0 credits). Robin saw chetaslua's
80 s "pure code" film on 2026-11-03 (a painted anime forest, haze, god rays, a moss-grown robot;
x.com/chetaslua/status/2117169796290916732) and said "Yes, build it". Issue rheos/secondunit-videos#396.

## Draft 3: a painted forest and a cel giant (2026-11-03)

Draft 2 was pixel art, and Robin rejected it: "We are trying to make a Studio Ghibli film and you made a 1980s
video game." The reference was never pixel art. Read side by side (`work/ref/side_v2_vs_ref.jpg`), it is a hand-painted
anime background: gouache foliage, high-key warm mist, a pale blue sky with peach cloud bands, the sun behind the
giant, four or five planes each paler than the last, and a cel-drawn giant standing half in ground fog. Draft 3
starts again in that manner with the same idea (the piano that the forest grew over wakes and takes a step). Draft 2's
page, code and renders stay as they were (`index.html`, `js/*.js`); draft 3 is `d3.html` and `js/d3/`.

We borrow the manner (painted backgrounds, light, air, a cel creature on them), never a character, creature or shot
from the clip or from any film by that studio. The piano giant is ours, and no frame is laid out like the clip's.

### Brief as numbers (d3, written before the build)

```text
GOAL: a background painting that breathes, and a giant that wakes with weight
OUTPUT: canvas2d, native 1280 x 720, anti-aliased; 24 fps; 15 s = 360 frames (song frames 0-359); silent
MEDIUM: background = gouache: brush-dab clusters (ellipses 3-22 px, 2-3 overlapping strokes each, alpha .5-.9),
      smooth gradients, soft edges, paper grain overlay at <= 6% contrast. Planes baked once at load, pre-blurred
      by depth: far 3.2 px, far-mid 1.8, mid 0.8, giant plane 0, near 0.
      Giant = cel: 2 flat tones per material (base + one shadow shape) and a rim, a soft dark outline (alpha .55,
      2.5 px) only on the silhouette and the big shapes, no texture noise on it.
LIGHT: bright sky and deep darks, measured off the reference (see "Corrected after the first sheets"): mean luma
      130-150, p10 <= 65, p50 130-155, p90 >= 205, 45-55% of pixels lighter than 140, mean saturation .24-.30.
      Sun at screen (662, 214), behind the giant's left shoulder once it stands. Sky: pale blue #a9cbd8 at the top
      to cream-gold #fff1c8 at the sun; 3 peach-pink cloud bands (#f2b8a0, #f6cdb2). Shafts: 7 beams fanning down
      from the sun, screen-blended, peak alpha .22; bloom = 1/4-size copy, contrast 2.6, blur 6 px, screen at .13 x L.
      Dust motes: 140, brightness from the shaft field, never visible outside a beam above alpha .15.
      Light arc L: .62 (0 s) -> 1.0 (11 s), smooth; sun glow, shafts, rim light and bloom read L.
DEPTH (back to front, parallax rate): sky .03 | far forest .10 | fog | far-mid .22 | fog | mid .40 | ground fog |
      giant + clearing .55 | ground fog over the giant's feet | shafts, motes | near trunks + canopy 1.0 | grass 1.15.
      Aerial perspective: each plane is tinted toward the fog colour by depth: far 62%, far-mid 44%, mid 24%,
      giant 12%, near 0. Fog colour = cream #f6e8c6 at the sun's x, pale blue-green #cfe0d6 at the frame edges.
TREES: far and far-mid trunks 6-22 px, mid 22-40 px, near 70-140 px; all reach past the top edge (canopy cut off).
      Near trunks: dark blue-green-brown #24332d to #3a4a3c, bark strokes, a 3-5 px warm rim #f2d58c on the sun side.
      Hanging moss: 40+ strands from the near canopy, 60-260 px long, lit tips #c8dc6a, sway 2-6 px.
COLOUR: lit leaves #a9c93c to #cfe06a; shade leaves #3d6c5e to #5d8e7a (blue-green); no olive below
      saturation .3 on lit foliage. Giant: weathered wood #8c6c55 / shadow #5c4c4c, stone-grey moss-free patches
      #a39a8c, moss #6f9a36 / #3f6b55 / lit #bcd650, rust accents #b4532f (sconces, hinge, foot caps), keys #eadfc4.
CREATURE: upright piano front 300 x 250 px plus a 66 px side plane, legs about 86 px, one moss mound on top.
      Feet to moss crest 59% of frame height at 9 s, 75% with the sapling (brief said 45-55%; left bigger because the
      reference's giant is about 75%). Body centre x 772, feet on the floor line y 592. Asleep: body bottom y 634
      (standing 506), tilted -3 deg, legs folded under it, three sheets of moss over the front.
      0-3 s asleep (moss breathes 1 px); 3.0-5.0 s stirs: 9 clods fall, fallboard opens 3.6-4.6 s (lidOpen f110),
      top lid lifts 4.2-5.0 s; 5.0-5.4 s anticipation dip 6 px; 5.4-8.6 s rises (in-out), overshoot 3%, settles 9.2 s;
      9.2-9.8 weight onto the right leg (tilt +2.3 deg); left foot lifts 9.8, plants 10.92 s (plantL f262) 50 px toward
      the sun; body follows, drops 7 px on the plant; right foot lifts 11.6, plants 12.58 s (plantR f302) 50 px;
      13-15 s stands in full sun, breathes 2 px at .3 Hz. Feet 0 px slide while down; planted feet on their floor y.
      Sapling and drape moss follow through (sampled from earlier body poses).
GROUND: grass band y 630-720 at rate 1.15, blades 18-60 px with rim-lit tips, 40 flowers (cream, yellow, rust);
      its top melts into a fog band at y 560-640.
CAMERA: one shot, slow dolly. camX = 2.6 t + 30 smooth(t/15) px (0 -> 69), push-in 0 -> 4% x rate. Never stops.
KEEP: the giant's box inside the frame; the giant never scales except by the camera's push.
QA: sheet of the reference beside d3 at 6 times; d3 sheet at 1, 4, 6.5, 9, 11, 14.5 s; 600x450 crops of the giant at
      4, 7, 10.9, 14 s and of the near plane at 2, 8, 13 s from full-size frames; motion-lab audit on all 360 frames
      (audit-d3.spec.mjs); badframes on the mp4; luma numbers above measured, not eyeballed; then watch it.
```

### Corrected after the first sheets

The brief's first light numbers were wrong. It asked for mean luma >= 150 and >= 55% of pixels over 140, and draft
d3 hit them (mean 167, p10 90, 71% over 140) while looking washed out and lime beside the clip. Measured
(`work/stats.py`, on the picture area of the three reference frames), the reference is mean 130-141, p10 52-63, p50
129-137, p90 211-224, 44-48% over 140, saturation .24-.29. Its "high-key" is a bright sky with deep darks, not a
pale frame. The numbers above are the measured ones, and the grade was redone to meet them.

### BANNED (d3, written before the build; grows after every render)

- A pixel grid, nearest-neighbour scaling, an indexed palette, ordered dither or `px.js` anywhere in d3
- Dim or muddy olive: lit foliage that isn't yellow-green, a mean luma under 150 at mid-film, a dark frame
- A small creature: the standing giant under 45% of frame height, or one that reads as a prop in the clearing
- Uniform dark trunks: every plane the same value. Each plane back is paler and closer to the fog colour
- Hard vector edges on the background: unblurred flat polygons, crisp outlines on trees, leaves as stamped circles
- Texture or noise on the giant (it is a cel: flat tones, one shadow shape, a rim), or an outline on the scenery
- A face on the piano (eyes, a mouth, teeth), a robot of any kind, a round-headed soldier, any figure from the clip
  or from a studio film; a frame laid out like the clip (giant centred head-on between two framing trunks)
- Marionette motion: rigid legs swinging from a pivot, a sliding planted foot, the body gliding without weight
- Lens flare rings, chromatic aberration, vignette darker than 12% at the corners
- `Math.random`, `Date.now`, state carried between frames

**Added after the first renders (2026-11-03):**

- Moss as bubbles: stacks of lit spheres read as green grapes. Moss is one blanket shape with a lumpy top and a
  scalloped hem (`mossMass`), flat patches on it, closed in round shoulders
- Foliage as discs: single soft ovals floating between trunks. Foliage is many lobes on visible branches
- A flat front: the piano as a card. It has a side plane now, and moss wraps onto it
- Drips along the keys: they read as teeth, then as green fingers. Only four soft teardrops, at the shelf ends
- A ruled rim line down a trunk: light on trunks is broken up along their length
- Fog thick enough to hide the feet: the step is the main action, so the fog over them is 58%, not 92%
- Bloom and fog as the way to look bright: they wash the frame out. Keep the darks at the measured p10

## Draft 2 (pixel art, rejected)

Everything below is draft 2 as it was built. Its idea carries into d3; its medium does not.

## The idea

A low sun behind a deep forest. In a clearing sits a mound of moss with a sapling on top. As the light comes up,
the mound stirs, a lid opens and a row of old ivory catches the sun: it's an upright piano that has been asleep
long enough for the forest to grow over it. It pushes itself up on four carved legs, moss sliding off, and takes
one heavy step toward the light.

**Why a piano.** The clip's giant is a robot that sits close to a famous studio's robot soldier, so a robot of any
kind was out. Bob Wiseman is our default test subject and a keyboard player, so a musical object is the right
giant for this studio, and an upright is the one that already looks like a body: a tall cabinet for a torso, a
keybed for a chest, a fallboard that opens like an eyelid without being a face, brass candle sconces as the one
craft detail. An abandoned piano in the woods also reads in one second, which a tour-bus amp doesn't. It never gets
eyes or a mouth: the keys are a keyboard, not teeth.

What we took from the clip is the vocabulary only: low-res painted pixels, many planes of trees in warm haze, light
shafts, a mossy giant that wakes. No frame of it is copied. The clip frames its robot head-on and small in the middle
of the forest; ours starts as an unreadable mound right of centre and ends standing in the sun's path.

## Brief as numbers (written before the build)

```text
GOAL: a forest that feels painted and deep, and a giant whose waking feels heavy and slow
OUTPUT: canvas2d, indexed 320 x 180 buffer (px.js), x4 nearest-neighbour to 1280 x 720; 24 fps; silent
TIME: 15 s x 24 = 360 frames (song frames 0-359 on the 24 fps grid); no loop; no audio, so the brief is the clock
LOOK: one palette of <= 255 indices: ~60 hand-picked base colours (sky 7, far trees 3, far-mid 4, mid 5,
      near 5, rim 2, moss 7, bark 3, piano wood 6, ivory 2 + key black, ground 4, dust 2, fog 3, brass 3)
      plus each colour's LIGHT and FOG blend, added as palette entries so shafts and haze stay in palette.
      Shading is always ramp index + 4x4 Bayer threshold. Foliage = clumps of radius 4-14 px lit per pixel
      from the sun direction with value noise, quantized to the ramp.
LAYOUT (back to front, parallax rate in brackets; screen px at cam 0):
      1 sky card (0.05), sun at (190, 46), dithered radial glow
      2 far trees (0.12), trunks 3-6 px, canopy tops 20-60
      3 haze band y 70-120, FOG remap by Bayer, densest at the sun's x
      4 far-mid trees (0.25), trunks 5-10 px
      5 fog band y 95-130
      6 mid trees (0.42), trunks 8-16 px, roots, ground line y 120
      7 clearing floor (0.6), ground line y 140; the piano and its mound ride this plane
      8 light shafts (screen, anchored on the sun), 5 beams, LIGHT remap, <= 0.5 density
      9 spores (0.8), 48 one-pixel motes, bright only inside a shaft
     10 near plane (1.0): two big trunks, overhead branch, hanging moss strands, fern band y 160-180
     11 foreground (1.5): two fern fronds through the bottom corners
MOTION: camera truck camX = 6.5 t + 32 smooth(4..13 s) px (0 to 130 px, never stops);
      tilt camY = -10 smooth(5..9 s) px; every plane offset = round(cam * rate), whole pixels.
      Piano rise r: 0 -> -0.06 (5.0-5.4 s anticipation dip) -> 1.03 (5.4-8.6 s, in-out cubic) -> 1.0 (8.6-9.2 s).
      Body bottom = ground + lerp(+12, -13, r) px. Legs: thigh 22 + shin 22 px, two-bone IK, knees out.
      Step: right front foot lifts 9.2 s, +16 px, plants 10.4 s; left front 10.9 s, plants 12.1 s;
      rear feet follow 0.2 s after their front foot. Body x +8 per step, dips 2 px on each plant.
      Fallboard opens 3.8-4.6 s (ease out). Sapling and hanging moss lag the body (follow-through, pure:
      sampled from earlier body poses). Breathing 1 px at 0.25 Hz when standing.
      Light arc L: 0.35 (0 s) -> 1.0 (12.5 s), smooth; shafts, sky, rim light and fog brightness all read L.
SHOTS: one continuous shot. 0-3 s the still mound; 3-5 s stir (clods fall, lid opens); 5-9 s rise;
      9-12.4 s the step; 12.4-15 s it stands in full sun.
KEEP: the piano never rotates or scales; every element on the 320 x 180 grid at 1x.
BANNED: (see below)
QA: contact sheet at 1, 4, 6.5, 9, 11, 14.5 s; 600x450 crops (full-size frames) of the giant at 4, 7, 10.4, 14 s
      and of the near plane at 2, 8, 13 s; motion-lab audit on all 360 frames (feet planted while down,
      giant inside frame, no 12+ frame frozen run, fallboard and plant events on their frames);
      badframes on the mp4; then watch it.
```

## BANNED (written before the build; grows after every render)

- Canvas gradients, `arc()`, anti-aliased anything, any `drawImage` scaling except the final x4 blit
- Mixed pixel sizes: no `blit` at a scale other than 1, no scaled font
- Sub-pixel positions: every offset is rounded before it touches the buffer
- Runtime rotation of a drawing (legs are rasterized each frame from their joint points, which is drawing, not rotating)
- Glow or bloom shader, lens flare, chromatic aberration, CRT scanlines (this is a painting, not a console)
- Purple or blue gradient sky; a cold palette
- A round-headed robot, a robot of any kind, a face on the piano (eyes, a mouth, teeth)
- Marionette motion: a rigid leg swinging from the hip, a foot that slides while down, the whole body sliding
- Floating particles as decoration: spores show where the light is, nothing else
- The camera stopping, any frame identical to the one before (nothing freezes)
- Copying a frame of the clip: no small giant centred head-on between two framing trunks
- `Math.random`, `Date.now`, state carried between frames

**Added after the first render (2026-11-03):**

- Moss as lit spheres: the first clumps read as green bubbles and balls stuck on things. Moss is now flatter
  (`sq` squash), darker, rougher (`tex` up), lumps made of two or three small clumps, rim only on the sun side
- A haze pass over the giant: an aerial haze band laid over the cabinet front read as a screen door. Haze stays
  behind the giant; only shafts and dust cross it
- Shafts as a single strong remap: light on dark wood jumped a long way and made checkerboards. Shafts now step
  LIGHT2 (17% toward the sun), then LIGHT, then LIGHT twice, with a cut-off at 1.8 widths so beams have gaps
- Rim lines dithered per pixel: a 1 px rim dimmed by Bayer reads as stitching. Rims now switch on in 2x4 runs
- Fern arches on the lid: they read as hooks. The lid has grass tufts instead
- Table legs: hips at the keybed ends with feet far out made a bench. Legs are now 20 + 20 px, feet 7 px out from
  the hips, so they bow a little when standing and fold out like a frog's when asleep
- The giant centred between two framing trunks (close to the clip, and dull): the sun moved right, the piano
  ends in the right third with the sun behind its shoulder, and it steps toward the light

## Review (v2, 2026-11-03)

- Contact sheet at 1, 4, 6.5, 9, 11, 14.5 s and a 12-frame motion sheet; 600x450 crops of the giant at 4, 7,
  10.42 and 14 s and of the near plane at 2, 8 and 13 s, cut from full-size PNG frames; a 9-frame strip of the step.
- Motion-lab audit, all 360 frames: giant in frame, feet 0 px slide while planted, planted front feet on the floor,
  `lidOpen` on frame 110, `plantR` on 250, `plantL` on 290. All pass.
- `badframes.py`: 0 of 360. Frame-to-frame change: mean 2.6 grey levels, no run of identical frames (the camera
  never stops).
- One render on the Intel Mac: about 60 ms a frame, 21 s for the whole 15 s with 4 workers.

What it still lacks, for the next pass: the asleep mound reads as a hedge with a box in it rather than one buried
shape; the cabinet front is a flat dark slab (no lean or weight shift, since nothing rotates, so the step is all
legs); the greens sit in one olive family where the clip's forest runs from teal shadow to gold; the spores are
too few to read at 720p; and there is no sound (a step thud, falling clods and one held piano note when the
fallboard opens would make the wake).

## Build and render

Playwright comes from a sibling look (`ln -s ../bobwiseman-airplane-16bit/node_modules node_modules`, not committed).

```bash
open index.html                                   # plays in a browser; ?t=8 starts at 8 s
node check.mjs out/check/sheet.jpg 1 4 6.5 9 11 14.5          # contact sheet
node check.mjs --crop 620,200 out/check/crop 10.42 14           # 600x450 crops from full-size frames
node check.mjs --full out/check/full 4 7 10.4 14               # full-size PNG stills
node ../tools/motion-lab/audit.mjs index.html 0 15 --spec audit.spec.mjs --width 1280 --height 720
nice -n 15 node ../tools/motion-lab/render.mjs index.html 0 15 out/mossforest_test_f0-f360_24fps_review-720p_vN.mp4 --width 1280 --height 720
~/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python ../tools/cloud-render/badframes.py out/mossforest_test_f0-f360_24fps_review-720p_vN.mp4
```
