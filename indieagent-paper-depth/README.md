# Paper depth (look test)

An 18 s cut-paper look test at 720p, 24 fps, asked for by Robin on 2026-10-24 (issue #322). It borrows the
techniques that make Leon Lin's paper-fox film look rich (study: `references/leon-lin/STUDY-paper-fox.md`) and
uses them on our own two scenes and our own character. If Bob picks the pull-tab book for No One's Coming to the
Rescue, these are the techniques that make that book richer.

```bash
open index.html                 # plays in the browser; ?t=8 starts at 8 s, ?w=1920 renders 1080p
open character.html             # the character lock sheet
node tools/still.mjs index.html out/check/f 4 9 17.6 --width 1280 --height 720
nice -n 15 node ../tools/motion-lab/render.mjs "index.html?w=1280" 0 18 out/draft/paperdepth_dN_f0-f432_24fps_draft.mp4 --width 1280 --height 720
```

A full local render takes about 40 s on the Intel Mac (each worker bakes the paper once, then only moves sprites).
Playwright comes from a sibling look's `node_modules` (`ln -s ../bobwiseman-in-her-dream/node_modules`).

## What is on screen

- 0-8 s, **A, the road out of town at dusk.** Eight planes: sky with a low sun, drifting torn clouds, two mountain
  ranges, hills with a small town and telephone poles, a fenced field with trees and a road sign, the road, wild
  grass and flowers in front. The camera trucks right with her. Light low from the left.
- 8-10.2 s, **the pop-up book.** A's cut-outs fold flat onto a cream page, nearest first; the night backdrop drops in
  on a fly line with one bounce; B's cut-outs spring up, farthest first. She keeps walking on the page throughout.
- 10.2-18 s, **B, the venue at night.** Seven planes: sky with moon and stars, skyline, rooftops, the alley with the
  tour van and its gear, the street front (a shop, the venue with posters, a bulb marquee and a door), the sidewalk,
  a lamp post, hydrant and sandwich board in front. She slows and stops by the door, the camera dollies in, the
  door opens and its light spills over the pavement and rims her.

## Taken from paper-fox (MIT, Copyright (c) 2026 Leonxlnx; notice in `LICENSE-paper-fox.md`)

| Technique | paper-fox source | Here |
|---|---|---|
| Crumple (lit Voronoi height field) and fibre textures, soft-lit into each piece at bake time so the grain travels with it | `core/paper.js` makeCrumple, makeFiber, applyTexture | `js/paper.js` (512 px textures instead of 1024) |
| Lit and unlit cut edge on a whole sprite | `core/paper.js` edgeLight | `edgeLight`, 2.2-2.6 authored px (about 1.5 px at 720p) |
| Bevel and contact shadow per piece inside a sprite | `core/piece.js` bevelBands, setShadow | `bevel`, `cutp` |
| Torn outline with a white core | `core/geom.js` tear, `piece({ rim })` | `tear`, `torn()` in `js/scenes.js` |
| Baked blurred-silhouette drop shadows, drawn through the plane's camera matrix so they scale with depth | `core/sprite.js` bakeSprite, drawSprites | `sprite`, `renderPlanes`; offset grows with the gap to the plane behind |
| Multiplane camera (truck, dolly, roll) | `core/stage.js` layerMatrix | `layerMatrix` |
| Pop-up transition: fold front to back, spring up back to front, a page between | `film/transitions.js` popup, `props.popSpring` | `js/main.js` |
| Rig: breathing about the belly, follow-through chains, two-bone IK on planted feet, one composite shadow per figure | `elements/fox.js`, `fox-rig.js` ik2 | `js/musician.js` (our drawing, a biped gait) |
| Bloom, vignette, animated grain | `core/post.js` finish | `finish` |
| Seeded randomness, never `Math.random` | `core/rng.js` | `mulberry32`, `RNG`, `noise` |

Not taken: the fox drawing (traced from AI references), any scene, any audio.

## Ours

- The musician: beanie with pom-pom, mustard scarf with two fringed tails, teal coat, guitar case with tour stickers
  in the far hand. Gait phase comes from distance; each foot is planted for 62% of the cycle, rolls on the heel at
  the strike and on the toe at push-off, and stays put (checked: 0.000 px of slide between stance frames).
  Follow-through: scarf tails (each segment repeats the one before it, later and bigger, plus flutter), the case
  lagging the arm, the pom-pom; all three settle with a damped swing when she stops. Breathing scales the torso.
- She stops in the middle of a double support (the phase offset is solved from where she stops).
- Depth shadows: offset `6 + 8 * sqrt(gap)` px away from the light, gap = distance to the plane behind / 1500.
