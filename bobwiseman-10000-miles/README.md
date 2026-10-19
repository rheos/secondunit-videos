# Bob Wiseman: 10,000 Miles

A code-made video for "10,000 Miles" (Accidentally Acquired Beliefs, 1995; 200 s). 0 credits: every frame is
Blender 4.5 (EEVEE) plus a numpy compositor. Structure after Kevin Ngo's orb film: Bob's rocket ship (the anchor)
never leaves the centre of the frame until the last seconds; the song's places open around it as circle portals out
of its sound rings; each chorus gathers every place into the Earth as a mosaic of circles. A second rocket answers in
the instrumental; the bridge climbs aboard; the last chorus fills the sky with little rockets.

The look test that Robin approved is Blender lab take 05 (`../blender-orb-visualizer/rocket_portals.py`, issue #243).
The film is issue #247.

## The cast (`tk/cast.py`, locked 2026-10-19)

Playmobil manner on big-head proportions: dot eyes, a small smile, snap-on hair cut along a smooth arc, a neck peg,
a trapezoid torso with rounded shoulders and a belt, bendy tube limbs, mitt hands, square feet, glossy plastic
shading, bright colours. One dark outer outline per figure, drawn by the compositor from a holdout alpha pass, so
overlapping parts show no seams. Faces act: brows, lids, eye size, smile or downturn, open mouth (`K.face`,
`K.key_face`). A sad face is lids plus a gentle brow tilt and a small downturn, never a flipped smile.
`K.person` is the person the song talks to (teal), `K.boy(k)` one of the group of boys (cap and jacket by k),
`K.kid` a small child. The line-up Robin approved: `reviews/cast-lineup.png`.

## Files

- `timeline.json`: song seconds for everything: portal spans and radii, ring pulses, the second rocket's path, the
  three mosaics (fly-in, Earth, zoom, out; the tear, the moon, the lift-offs), the anchor's in and out.
- `tk/kit.py`: toon material, bmesh shapes, world, camera, sun, keying helpers, the Set and Chars collections.
- `tk/scenes_v1.py`, `tk/scenes_v2.py`, `tk/scenes_bridge.py`: one function per portal scene, `name(K, span)`.
- `render.py`: `--part <scene>` renders a scene for its span (and a `<scene>_chars` holdout pass when it has
  characters); `--part rocket|friend` the transparent rocket layers; `--part mosaic` nine square stills per scene;
  `--part lineup` the cast sheet; `--still <t>` one test frame to `out/stills/`.
- `comp.py`: paper, rings, portals with the characters' outline, mosaics, the second rocket, tear, moon, lift-off
  swarm, rockets on top, grain. `--workers 4` splits the frames; `--review --song <mp3>` encodes the 720p cut.
- `STORYBOARD.md` (gitignored, it quotes the lyrics): the lyric map, cue by cue.

## Running

```bash
blender -b --factory-startup --python render.py -- --part problems --still 19.0
blender -b --factory-startup --python render.py -- --part problems
blender -b --factory-startup --python render.py -- --part rocket
uv run --with numpy --with pillow python comp.py --workers 4 --review --song <path to the mp3>
```

Renders stay in the gitignored `out/`. Timings: a scene renders at 3-6 frames a second; the rocket layer (4,800
frames) in about 4 minutes; the compositor at about 0.4 s a frame per worker.

## Rules

No lyric text on screen. The traveller is never Bob's likeness. The boys posture, never fight; the toy
switchblades are toys on a shop display. Keep faces below or beside the frame centre, where the anchor rocket sits.
