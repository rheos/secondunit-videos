# paper-fox: what is worth taking

Repo: github.com/Leonxlnx/paper-fox, shallow clone of commit 6a150fd (one commit, 5:07 am Tue Oct 20 Pacific).
Read only; nothing was installed, run or rendered.

Our side was read from mv-projects origin/main (aa97890) without checkout: the In Her Dream kit
`bobwiseman-in-her-dream/js/cut/{kit,main,cut,cast}.js`, the peacock fork on `origin/clap-hands-peacock`
(`gemmaluna-clap-hands/js/peacock/`), and `looks/*.yaml`. `STORYBOARD-cut.md` is gitignored (it quotes lyrics),
so it was read from the working tree and nothing from it is quoted here.

## Recommendation

Borrow named techniques into our cut-paper kit. Do not vendor the whole engine, do not add it as a look.

Our kit's authoring model (immediate `cut(path, fill)` calls every frame, puppets built from nested transforms,
shots in a global `SHOTS` list) is what 17 In Her Dream shots and the peacock sections are written against, and
the paper-fox engine wants the opposite model (bake every shape once, then only move sprites on depth planes).
The six or seven techniques that make paper-fox look better each port into `cut()` and `puppet()` in under a
hundred lines without breaking a single shot. `src/core` (10 files, 1,266 lines, MIT, no content in it) is clean
enough to vendor later as an IIFE bundle in `tools/` the way `tools/motion-lab/vendor/` does Remotion, but only
when a new paper film starts that wants a real z-depth camera; the fox, scenes and audio stay out.

It is not a catalogue look: the film is Leon's, its look recreates someone's AI-generated illustrations, and we
have no proof render of our own.

## Licence and credits

- `LICENSE`: MIT, "Copyright (c) 2026 Leonxlnx". Any vendored file keeps that notice beside it.
- Audio is not in the repo. `audio/sources.json` lists "Fairy Tale" by Music_For_Videos (Pixabay Content
  License) and about a dozen Mixkit sound effects (Mixkit Sound Effects Free License), fetched at build time by
  `tools/fetch-audio.mjs`. Neither licence allows redistributing the files. We take none of it.
- README: "Built with Claude Code". The look recreates a set of AI-generated paper-cut illustrations used only as
  reference. The fox rig in `src/elements/fox-rig.js` says it was "traced from the references" (ref01, ref02,
  ref10). The code is MIT, but the fox's proportions come from those images, which is one more reason to take the
  rig technique and leave the fox drawing.

## 1. The paper engine, and how ours differs

### How paper-fox draws paper (src/core)

- **Textures, built once** (`paper.js`). `makeCrumple()` is crumpled paper as a lit height field: four scales of
  Voronoi relief (ridges on cell borders, creases sunk into them, a random tilt per cell), shaded with a raking
  light so facets come out with a light and a dark side. `makeFiber()` is tileable value-noise mottling plus
  fine grain, a few thousand short curved fibres, specks and blotches. Presets `fiber`, `crumple`, `stone`
  (granite speckle) and `felt`. `MATERIALS` mixes them per surface (`paper`, `crumpled`, `sky`, `stone`, `felt`).
  Textures are 1024 square, tiled, offset per sprite by seed, and only ever turned in quarter turns because
  arbitrary angles resample the grain into a lattice.
- **Bake** (`sprite.js bakeSprite()`, `paper.js bake()`). A shape is painted flat into its own canvas at a
  chosen resolution (`res`, raised for layers the camera pushes into). Then `applyTexture()` soft-lights each
  texture layer in, only where the shape is opaque. So the grain belongs to the piece and travels with it.
- **Bevel on the cut edge** (`paper.js edgeLight()`). The silhouette is shifted by 1.3 to 1.6 px toward the light
  and subtracted from itself, which leaves a thin band on the edges facing the light; it is filled warm white at
  about 0.3 and laid on with `source-atop` and a slight blur. The same on the far side in black gives the unlit
  edge. That pair is what reads as the thickness of card. `piece.js bevelBands()` does the same per path for
  pieces painted inside a sprite.
- **Torn edge with a white core** (`geom.js tear()`, `piece.js piece({ torn, rim })`). The outline is subdivided
  and pushed along its normals by fbm noise; a slightly larger torn copy is filled cream underneath first, so the
  white paper core shows around the coloured layer.
- **Drop shadow onto the layer behind** (`sprite.js drawSprites()`). At bake time a blurred black silhouette is
  kept with each sprite (`shadowOf()`, blurred at reduced scale for big radii). Per frame, a plane draws all its
  sprites' shadows first, offset away from the scene light (`Scene.shadowOffset`), then the paper. Because planes
  draw far to near, each plane's shadow lands on whatever is already behind it. Pieces on the same plane never
  shadow each other. Inside a sprite, `setShadow()` gives contact shadows between small pieces and scales the blur
  by the bake resolution, because canvas shadows ignore the transform.
- **Camera and parallax** (`stage.js layerMatrix()`). Layers are authored in 1920x1080 as seen at rest, each at a
  depth `z` (F = 1000 moves 1:1 with a pan). The camera has x, y, z (dolly), zoom and roll; per plane the matrix
  scales by z / (z - cam.z), so a pan moves near planes faster and a dolly rushes near planes past the lens. Depth
  bands are fixed in `docs/AUTHORING.md` (sky 20000, mountains 4000-8000, hero 900-1000, foreground 420-600) so
  scenes cut together.
- **Finish** (`post.js finish()`). Bloom from bright paper (threshold on a 480x270 copy, two blurs, screen), a
  colour grade, lifted blacks, a vignette, and animated grain from six pre-made tiles picked by frame number.

### How our kit draws paper today

`kit.js cut(path, fill, { sh, grain, lift, alpha })` (same function in `cut.js` and in the peacock `kit.js`):

- fills the path live every frame with a canvas `shadowBlur` drop shadow whose size grows with `lift`;
- then clips to the path and soft-lights `GRAIN2` and `MOTTLE` over it with the transform reset to identity.
  Those are full-frame, screen-locked canvases, so a moving puppet slides under a texture that stays put;
- no edge light, no white core (the Airplane `cutout` look has a white scissor rim, this kit does not);
- depth is a few hand-placed layers plus per-shot parallax written by hand; no camera;
- `main.js` finishes every frame with overlay grain, mottle and a warm multiply vignette.

### What would visibly improve our frames

In order of how much a viewer would see it:

1. **Texture locked to the piece.** Today moving figures "swim" through a fixed grain (a shower-door effect,
   strongest on the big slow heads and the walking puppets). Baking each fixed shape once (`PARTS`, `HEADS`,
   `HAIR`, props) into a textured sprite, or at least drawing `GRAIN2` through the piece's own transform with a
   per-piece offset, fixes it. Shapes that morph (the `HER_LAUGH` tween) can stay live.
2. **The lit and unlit bevel.** A 1.5 px warm band on the light side and dark band on the far side turns flat
   colour into card. This is a judgement call against the papersilhouette rule "never 3D lighting": the bevel is a
   paper-edge cue, not modelling, but test it on one approved shot (04-sky) before and after, per our
   no-regression rule, before touching the rest.
3. **Shadows that scale with the camera.** Canvas `shadowBlur` is in device pixels, so when a shot zooms 1.3x the
   shadow stays the same size and the depth reads flatter. A baked blurred silhouette drawn through the same
   transform scales with it, and is far cheaper per frame than a live blur on every `cut()`.
4. **Crumple texture for grounds and skies.** Our grounds are flat fills with value-noise grain; the lit Voronoi
   crumple gives sheets visible facets under a raking light.
5. **Torn edges with a white core** for clouds, hills, water and the wind ribbons, which today are clean fills with
   a little hash jitter.
6. **One drop shadow per puppet** (see section 3). Our jointed puppets cast one shadow per part, which doubles up
   dark where an arm crosses the body.
7. **Bloom from bright paper** on lamps, suns and the gold rings; our finish has no glow.

## 2. The transitions

The film has nine scene changes (ten scenes), plus an opening where the first diorama's cut-outs settle onto their
stands nearest last (`film.js drawIntro()`), which is presumably how the brief counts ten. `transitions.js` also
keeps plain `cut` and `fade` as fallbacks. All nine sit on bar lines (`timeline.js TRANSITIONS`), 1 to 1.75 s
long, with optional sub-frame motion blur.

Our side for comparison: `main.js` in both kits has `fade`, `slide`/`slideL`, `rise`, `iris` (a clean circle
clip) and `wipe` (a torn edge sweeping across). Peacock's scene changes are short fades matched on an element
(door arch to window arch, moon halo to ring halo), which follow our "transitions follow an element" rule by
composition rather than by a transition type.

| # | Function | From, to | What hides the cut | Ours |
|---|---|---|---|---|
| 0 | `drawIntro` | opening | cut-outs drop onto their stands, far first, nearest last | none |
| 1 | `trackPine` | dusk, night lake | camera keeps tracking the fox; a huge foreground pine (`props.passingPine`) sweeps across the lens and night is behind it | **none** |
| 2 | `throughBranches` | lake, forest | dolly into the shore trees; fir branches rush in from the edges, fill the lens, part inside the forest | **none** |
| 3 | `curtains` | forest, canyon | the forest's own redwood planes (tagged `curtainL`/`curtainR`) close like theatre curtains, then trunk props open on the canyon | **none** |
| 4 | `craneClouds` | canyon, peaks | camera cranes up through a bank of baked cumulus | **none** (our `rise` slides a sheet up; no occluder) |
| 5 | `rockIris` | peaks, cave | a ragged stone ring of boulders closes on the fox's position (`meta.fox`) and opens on the fox in the cave | partial: our `iris` is a clean circle, opening only, no textured occluder |
| 6 | `lightFlash` | cave, storm | the star at the tunnel's end (`meta.light`) flares warm, turns cold and becomes the first lightning | **none** |
| 7 | `waveWipe` | storm, aurora | three paper wave sprites roll over the lens and drain down | partial: our torn-edge `wipe`, but not an object |
| 8 | `popup` | aurora, portal | pop-up book: every plane folds flat about its base front to back, a ground page shows, the next world springs up back to front (`props.popSpring`) | **none** |
| 9 | `lightFlood` | portal, dawn | the portal's light floods the frame and draws back into the sunrise | **none** (peacock's halo match is the nearest idea) |

Against our rule, the best fits are the ones that use an element of scene A itself: `curtains` (A's own trunks),
`lightFlash` and `lightFlood` (A's light source becomes B's light), `rockIris` centred on the hero, and `popup`,
which is the most paper-native move of the lot. `trackPine`, `throughBranches`, `craneClouds` and `waveWipe` are
motivated occluder wipes: better than a fade, but the object is a transition prop, not something that morphs.

Most of these need depth planes (`popup`, `curtains`, the dollies all read layers and tags through
`compose.js composePlanes()`). With our two-buffer `main.js`, `lightFlash`, `lightFlood`, `rockIris` and the
occluder wipes port directly (draw A, draw B, draw a prop over both); `popup` would need each shot to expose its
layers.

## 3. The fox rig: secondary motion our puppets lack

Files: `src/elements/fox.js` (475 lines, motion and compositing), `fox-rig.js` (213, rest poses and IK),
`fox-paint.js` (1,153, painting the parts). Motion is in `poseAt(st)`; every part is a baked sprite moved by a
small bone hierarchy (body, neck group, head, ears; body, tail chain; two-bone IK legs).

What it has, and what `kit.js puppet()` / `POSE` does today:

- **Breathing.** `br = sin(t / 3.5 s)` scales the body about a belly point (`rig.breath`) by 0.4% wide and 0.9%
  tall; the neck group rises and rotates a little with it. Ours: none; a standing puppet is static apart from what
  a shot animates.
- **Weight shift.** Slow noise drift of the body (1.6 and 0.6 units) so a standing figure never freezes. Ours: none
  (`jit()` is per-twos wobble, not weight).
- **Follow-through.** The tail is three segments; each one repeats the sway of its parent later
  (`sway(t - i * 0.32)`) with amplitude growing down the chain, plus a walk term and wind. Ours: none; hair,
  skirts, coat tails and the dress hem are rigid with the body.
- **Irregular twitches.** `twitches()` fires a damped wobble at hashed, irregular times (ears every 4.7 s and
  6.3 s, with a skip chance). Ours: none. This maps well to a head turn, a hand flick or a hair toss.
- **Head life.** Small noise on head tilt plus a breathing term, a `look` parameter. Ours: `pose.head` only.
- **Walk with planted feet.** Diagonal-pair gait, each foot planted for 60% of the cycle (`DUTY`), phase from
  distance travelled; the planted paw stays put while the body passes over it and two-bone IK (`ik2()`) solves the
  knee back to the hip, so feet never skate. Body bob and pitch are tied to the gait phase; the swinging paw lifts
  and rolls. Ours: `POSE.walk(ph)` swings hip and knee angles on sines; phase follows distance (the look bible
  insists), but the foot is not locked, so it slides a little on the ground.
- **Wind on loose parts.** Loose tufts flutter with noise; wind lifts the tail. Ours: wind exists only as ribbons.
- **View blending.** Two rest rigs with the same shape (rear three-quarter, side-on) blend by a `yaw` number. Ours:
  profile only, by design.
- **One clean shadow per character.** The parts are stacked in an offscreen buffer with deep red-brown contact
  shadows between them (`s.inner`, `source-atop`), and a separate mask buffer collects all the far shadows, so the
  whole fox drops one soft shadow on the scene. Ours: every `cut()` of a puppet part casts its own grey shadow.
  For our one-colour silhouettes the inner shadow must stay faint, since the look bible wants joints hidden by
  the colour.
- **Rim light** on the composed silhouette toward a coloured light (`applyRim()`), used for crystal and star
  light. Ours: none.

Our puppets move on twos, so breathing and follow-through would step at 12 a second; that still reads.

## 4. How it renders, and whether it fits our pipeline

- **Pure function of t.** Yes. `film.renderAt(ctx, t, opts)` picks the segment from `timeline.js segmentAt(t)`;
  scenes and transitions draw from local time only. Scene builds are cached and disposed but rebuild identically.
- **Deterministic.** Yes. `core/rng.js` (mulberry32, FNV string hashes, seeded Perlin) and a stated rule that
  nothing calls `Math.random()`; grep finds none in `src/`. Sprite seeds come from scene id, name and a build
  counter, so they are stable as long as build order is. Grain uses the frame number passed in.
- **Offline render.** `tools/render.mjs`: puppeteer-core, 4 headless Chrome workers on contiguous frame chunks
  (so each worker bakes only its scenes), JPEG 0.97 via `window.APP.renderFilm()` + `snapshot()`, resumable, then
  ffmpeg x264 at 60 fps tagged BT.709 with `-tune grain`. Optional 180-degree-shutter motion blur averages 4 to 6
  sub-frames in a Float32 buffer during fast transitions.
- **Into cloud-render:** yes, with a small shim. Our contract is `window.__ready` and `window.__frameJPEG(t, q)`
  on a `file://` page (`tools/cloud-render/render-slice.mjs`). Needed: (a) bundle the ES modules into one IIFE
  (Chrome refuses module scripts from `file://`), as `tools/motion-lab/vendor/build.mjs` already does with esbuild;
  (b) a ten-line `__frameJPEG` that awaits `APP.renderFilm(t, { fps: 24, frame })` and returns `toDataURL`
  (Playwright's `evaluate` awaits the promise); (c) replace the hard-coded 80 BPM, 10-scene `timeline.js` with our
  song's beat grid. The 1024-pixel crumple texture is a few seconds of CPU at load; runners have no GPU but the
  600 s page timeout covers it.
- **Into HyperFrames:** not naturally. It is imperative Canvas 2D, not a DOM/GSAP composition. Per the 2026-10-22
  trial, HyperFrames keeps the DOM lane and canvas looks use the `__frameJPEG` contract, which is where this goes.

## 5. Size and how tangled it is

| Part | Files | Lines | Coupling |
|---|---|---|---|
| `src/core` (engine) | 10 | 1,266 | imports only itself; no film content |
| `src/film` | 6 | 873 | `timeline.js` hard-codes BPM, scene ids and the transition plan; `transitions.js` reads scene `meta` (fox, light, horizon) and layer tags (`sky`, `celestial`, `aurora`, `curtainL/R`); `props.js` (397) imports trees, clouds, rocks, water from the element library |
| `src/elements` | 20 | 10,410 | depends only on core and each other; the fox alone is 1,841 lines and specific to this fox |
| `src/scenes` | 57 | 13,562 | the film's content |
| `src/gallery` | 8 | 1,370 | element test sheets |
| `tools` | 12 | 828 | render, snap, contact sheets, soundtrack mix |
| `docs` | 8 md | 2,784 | `AUTHORING.md` plus an API page per element family |

So the engine is small and cleanly separated; the transitions are a thin layer over it with light conventions
(tags and meta); the bulk is content. For comparison our kit is one 399-line globals file plus a 73-line
`main.js`, and the peacock branch carries its own 177-line copy of `cut()` and the grain, so any port has to land
in both, or better in one shared file.

## 6. Recommendation, again

Borrow named techniques. In order: piece-locked texture, bevel (`edgeLight`), baked shadows that scale with the
transform, one composite shadow per puppet, breathing plus follow-through plus twitches plus planted-foot IK in
`puppet()`, crumple and torn white-core edges, and three transitions for our `main.js` (`lightFlash`/`lightFlood`
as a light-source match, `curtains` from a scene's own pieces, `popup` when a shot can expose layers). Vendor
`src/core` into `tools/` as an IIFE only when the next new paper film wants a depth camera. Never take the fox
drawing, the scenes or the audio.
