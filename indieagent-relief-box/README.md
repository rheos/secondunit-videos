# Relief box (look test)

An 11 s look test at 720p, 24 fps, asked for by Robin on 2026-10-25 (issue #327): a visual language built from
photographs of sculpted clay relief panels in shadowboxes, drawn in the language of Leon Lin's paper-fox. Recipe: `looks/relief-box.yaml`.

```bash
node tools/bundle.mjs           # after every edit in src/: writes build/film.js
open index.html                 # plays in the browser; ?t=6 starts at 6 s, ?w=1920 renders 1080p
node tools/still.mjs index.html out/check/f 0.5 6 10.8 --width 1280 --height 720
nice -n 15 node ../tools/motion-lab/render.mjs "index.html?w=1280" 0 11 out/draft/reliefbox_dN_f0-f264_24fps_draft.mp4 --width 1280 --height 720 --workers 2
```

A full render takes about 30 s on the Intel Mac. Playwright comes from a sibling look's `node_modules`
(`ln -s ../bobwiseman-in-her-dream/node_modules`).

## Built on paper-fox, directly

`vendor/paper-fox/core/` is paper-fox's `src/core` copied unchanged from commit 6a150fd (MIT, Copyright (c) 2026
Leonxlnx, `vendor/paper-fox/LICENSE`). The scene in `src/` is written the way paper-fox's own scenes are: a
`Scene` with planes at depths, sprites painted once and baked into paper (texture, lit and unlit cut edge, a
blurred silhouette for the drop shadow), `drawSprites` for anything that moves, and paper-fox's film finish.
Nothing of paper-fox's fox, scenes or audio is used. Our renderers open pages from `file://`, where ES modules
don't load, so `tools/bundle.mjs` joins the modules into one classic script.

## What is on screen (draft 2)

Draft 1 rebuilt one reference photo too closely (a split doll with an ornament spine, plumes, a thought bubble).
Robin, 2026-10-25: we are making a language, not copying a work, so draft 2 leaves the figure out and uses the
reference set's vocabulary in a scene of our own, with paper-fox's density: many pieces on many planes.

| z | Plane |
|---|---|
| 1500 | back wall: warm card, embossed honeycomb (`box.js`) |
| 1480 | the sun, a wheel of lit windows with stepped rays, and its glow (`props.js`) |
| 1460, 1400 | two ranges of stepped pastel hills with torn white edges and cone trees (`density.js`) |
| 1430 | dotted discs standing off the wall |
| 1290, 1180 | a terracotta city and a pink mountain town on floating islands with stepped roots |
| 1240 | coral: grey curl clusters, wheat fronds, lime beads |
| 1150 | two stepped-trunk trees whose rosettes bloom |
| 1100 | butter piping from a porthole in the left wall to one in the right, and the bead train |
| 900 | a garland hanging from the top of the box: bead strings, stepped pendants, dotted balls |
| 830, 790 | two rows of small things along the floor |
| 720 | the moulded frame |
| 560 | the lens plane, in front of the frame: rosettes, plume tips and a dotted ball in the lower corners |

| Time | Beat |
|---|---|
| 0-6 s | the sun rises over the hills and turns; a cool half-dark lifts to warm light |
| 2.4-9.4 s | seven beads roll out of the left porthole, along the piping, into the right one |
| 4-7.4 s | the trees bloom, nearest the sun first |
| all through | islands drift and bob, the garland swings, the camera trucks right and pushes in |
| 9.4-11 s | hold |

## How a flat cut-out reads as clay (draft 3)

Robin asked for rounder forms, softer light and a finer surface. `src/kit.js` now shades every shape as a lump:

- `clayForm()`: the outline is filled, then, inside it, the outline pushed toward the light leaves the far side
  uncovered; that sliver, heavily blurred and darker, is the soft falloff into shadow. A smaller one tucked under
  the far edge is the core shadow; the outline pushed away from the light gives a pale lit shoulder; a faint radial
  sheen sits high on the lit side. The shading scales with `size`, the piece's thickness.
- Under each piece, two shadows: a tight contact shadow and a wide soft one.
- A clay surface made once (fine grain, fingerprint whorls, tiny pits) is soft-lit into every piece; paper-fox's
  fibre stays underneath at a low amount (`CLAY_MAT`), and the baked cut edge is soft (`CLAY_EDGE`).
- `tube()` rolls coils, stalks and the piping with the same shading; `chaikin()` rounds the piping's corners.
- The hills are rows of rounded mounds instead of torn paper strata.

Draft 2 built form the paper way, with tiers cut inside each shape (commit 7cbb8a4).

## The living loop (`loop.html`, issue #329)

Robin, 2026-10-25, after approving the look: smaller figures instead of a big one, a living sculpture in the
middle shaped like the recycle symbol (a funnel feeding back into itself, part of a system that feeds back into
itself), and an open world instead of a framed diorama, with decorations floating in mid-air rather than hanging.

```bash
node tools/bundle.mjs src/loop.js build/loop.js
nice -n 15 node ../tools/motion-lab/render.mjs "loop.html?w=1280" 0 12.0417 out/draft/reliefloop_dN_seamcheck.mp4 --width 1280 --height 720 --workers 2
```

A seamless 12 s loop: every motion is periodic in 12 s or a divisor of it (`cyc()` in `src/loop-world.js`), and
the page wraps t, so frame 288 is frame 0. Render 289 frames and compare the first and last to check the seam.

Draft 2 (Robin's notes on draft 1): the recycle shape is one funnel that feeds itself, and the figures' work is
mysterious, not fetching and carrying. The honeycomb backdrop comes back; only the frame and box stay out.

- `src/loop-world.js`: the honeycomb backdrop, the sun, clay clouds, three rows of hills into the haze, the
  terrace, a floating city, and fourteen decorations floating at depths from 1300 to 3200.
- `src/loop-machine.js`: the funnel (it gathers at the top; a duct leaves the bottom, turns right, climbs past the
  lip, turns left and drops back in; eight beads swirl down the mouth, swell along the duct, light two windows in
  the riser and drop from the spout), the console (knobs, lever, lights, a screen with a turning octahedron, a
  cable to the duct) and the ring instrument (three rings on different axes, a hovering solid, a cube let go once a
  loop).
- `src/loop-shapes.js`: faceted clay solids drawn each frame (tetrahedron, octahedron, cube, icosahedron, a star
  of two tetrahedra, a ring), lit per face, with a making-glow.
- `src/loop-figures.js`: small clay figures, body and head baked, each limb one rolled tube bending through its
  joint, knees and elbows by two-bone IK, hands held to the arm's reach.
- `src/loop.js`: the operator behind the console (knobs, lever, hands over the screen, every 3 s), the tuner at
  the instrument (slider, a reach toward the rings), and two practitioners of the same 6 s mudra, three seconds
  apart (palms at the chest, lifted overhead, parted into a frame while a solid forms between them, released, arms
  open, head following it up); one stands on the terrace, one sits on the floating island.

Draft 3 (Robin's notes on draft 2): a more geometric, purposeful world, toward a four-dimensional space. The funnel
is an octagonal frustum of flat lit facets with a collar and a throat band; the pipe is thicker, runs straight and
turns square corners with small round fillets (`squarePath`), with banded joints; no dark windows. Small faceted
solids circulate instead of dotted beads. The dotted discs and balls are gone; floating geometry is pendants,
chevrons, turning polyhedra and small tesseracts, and a large tesseract (`drawTesseract` in `src/loop-shapes.js`:
sixteen corners turned in the XW and YZ planes, seen in perspective out of w) turns once a loop in the sky.

Draft 4 (Robin's notes on draft 3): no raised ridges on the pipe; it carries smooth rings of alternating colour
(mint, butter, pink; the whole pipe shaded once per colour and clipped to that colour's rings). The casters work
like spell-casters: the leading hand traces a precise sigil of light in the air (a circle, a ring of twelve ticks,
then the solid's figure: triangle, pentagram, hexagram or diamond with an inner circle) while the other hand turns
small steady circles at the chest; both hands push in, the sigil spins down to its centre, the solid forms there
and is released (`castPose`, `drawSigil`, `castSolids` in `src/loop.js`).

Draft 5 (Robin, on draft 4): no balls seen in the pipe; the pipe itself swells in a bulge that travels along it.
`drawBulge` in `src/loop-machine.js` redraws a stretch of the pipe each frame with a gaussian swell in its width,
in the same colour rings and at the pipe's own shading scale, clipped to the swollen middle so its ends never show.
