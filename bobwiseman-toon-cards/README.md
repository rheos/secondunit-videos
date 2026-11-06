# Toon cards (look test)

Flat bean-head cards in an inked three.js world, on a section of Bob Wiseman's "Libelous", song frames 1488 to 2324 at 24 fps
(about 35 s, 720x1280). Issue #424. Internal test, not for the client page.

The look comes from `references/QUIVER.md` (claude-animated-shorts and trey's prompt). The story, cast and props are ours.

## What's in it

- `js/toon.js`: the card drawing from github.com/mromidev/claude-animated-shorts (MIT, `js/LICENSE-toon.txt`), types stripped.
  We added a crown, stetson, straw hat, wig and a held money sack.
- `js/beasts.js`: our cow, chicken and mouse. Side-view sprites with 2-bone IK legs, cached by pose, so 46 cows share a few
  textures.
- `js/world.js`, `js/paint.js`: the world from primitives and canvas-painted textures.
- `js/story.js`: every camera, actor, sprite and prop as a pure function of song time.
- `js/main.js`: colour, normal and depth, ink and grade, lens. Written for plain three.js, no Remotion.

## Running it

Run `./shots.sh <name> 20,75,110` for a contact sheet, or `OUT=out/frames FRAMES=0-835 node render.mjs` for the film (set
`PW_FROM` to a package.json that can resolve playwright-core). It takes about 70 ms a frame on the Mac's Metal GPU at 720p.

`work/` stays out of git: `work/words.js` holds the words on the props, which quote the lyric, and the song cut goes there too,
cut from `bobwiseman-libelous/source/libelous.wav`.

## Lessons

- Check what big "far" hills really cover. A wide ellipsoid sat in front of the plain and buried everything built behind it.
- Stack coins as one solid cylinder with painted edges. Thin discs break the ink pass into dots.
- A flight shot should chase its object. A camera that tilts from sky to ground makes empty frames and fails the flash check.
- Compare opposite neighbours in 1/z for the depth edge. A single-sample depth test draws a false black band where the ground
  meets the horizon.
- Set `frustumCulled = false` on an InstancedMesh you fill later, or its first bounding sphere hides it.
- Colour-only sprites let the world's ink draw over them. Dust and spray have to write to the normal and depth pass as well.
- A plane with a cut-out outline needs real shape in that pass too: a round dial on a square plane drew a square of ink.
- Keep cameras and crowds apart by construction. A cow standing on the camera's path fills the frame.
