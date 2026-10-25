# First Night Out

A wordless cut-paper film of about 60 s: a raccoon parent and its kit on the kit's first night out, dusk to
dawn, in the manner of Leon Lin's paper-fox (rheos/secondunit-videos#325, picked by Robin on 2026-10-24). This
folder is at **step 1, the character sheet**: the cast is locked before any scene or transition is built.

```bash
open character.html             # the lock sheet; ?t=3 moves the breathing and twitches, ?q=2 renders it at 4K
open index.html                 # the 16 s character test; ?t=4 starts at 4 s, ?w=1920 renders 1080p
open transitions.html           # the transitions reel (33 s)
node tools/still.mjs character.html out/check/sheet 0
node tools/planted.mjs          # planted feet: how far any foot moves while flat on the ground (must be 0)
nice -n 15 node ../tools/motion-lab/render.mjs "index.html?w=1280" 0 16 out/draft/fno_charsheet_dN_f0-f384_24fps_draft.mp4 --width 1280 --height 720
```

Playwright comes from a sibling look (`ln -s ../bobwiseman-in-her-dream/node_modules`). The 16 s test renders
in about 65 s on the Intel Mac.

## The cast (`js/raccoon.js`)

One rig, two specs. The kit is drawn at its own size rather than scaled down, so its paper grain and torn edges
match the parent's; it has a bigger head, bigger eyes and ears, a shorter snout, stubbier legs, a bushier tail,
faster breathing and a shorter stride.

- **Mask:** one black torn scrap across the eyes with the white core of the paper at its torn edge; white brows,
  cheeks and muzzle, a dark stripe down the bridge, an eye with a catchlight inside the mask.
- **Fur, after paper-fox's fox (d2):** each part is one smooth cut-out under rows of torn, pointed, many-tipped tufts
  with quill bases, laid from the rump toward the head so each row laps over the one behind it, each row casting one
  soft shadow on the row beneath, the tips breaking the outline. A darker saddle, light upper flanks, a darker
  belly, the haunch and shoulder lit on top, the odd pale or dark tuft for grizzle; a ruff of tufts behind the cheek
  and white cheek tufts under the mask.
- **Body:** one body, not a marionette. A pear: the rump high over the hind legs, the back falling to low
  shoulders, the belly slung low. The spine bends: the rump hangs off the hip and rocks with each hind step, the
  shoulders, neck and head hang off a spine joint and bend against it; the shoulders' first rows lap back over the
  rump through a ragged join. Legs are single bending tubes, grey above, dark below, their tops under the body.
- **Tail:** three long segments along a curved spine, drawn over the rump, with loose rump tufts laid over its root
  so it grows out of the coat. Light and dark rings feathered by the chevron rows of tufts that cross them, the tip
  black. Each segment repeats the sway of the one before it, later and bigger; it rises and swings with the waddle,
  drifts when standing and settles with a damped swing.
- **Hands:** the near front paw is the acting hand: an idle flick when standing, lifted forward to test something
  with the head dipping to look at it, fingers tapping (`paw`, `pat`).
- **Walk:** a slow lateral-sequence walk (near hind, near front, far hind, far front), each foot planted for 75%
  of the cycle, phase from distance, two-bone IK on every leg, rolls on heel and toe. `tools/planted.mjs` measures
  0.000 px of slide while a foot is flat. With a 75% duty the feet lift one at a time, so `setGait` nudges the
  stride to whole quarter cycles and every walk starts and stops with all four feet down.
- **Life:** breathing about the belly, a slow weight shift, ear twitches at irregular hashed times, head noise,
  a nod with the front steps, a sniff.
- **The kit copies the parent a beat late:** in `js/main.js` every curve the kit gets (walk, paw, look, sniff,
  where it is) is the parent's curve read at `t - 0.75 s`, one beat at 80 BPM.

## The character test (`index.html`, `js/main.js`, `js/forest.js`)

16 s in a night forest built as paper-fox builds its worlds (Robin, d1 notes: the look is "how busy it is... many
objects and many layers"): eleven planes from a starry sky with a crumpled moon, lavender cloud banks and snowy
peaks, through two ridges of saw-toothed pines with mist between, big cedars, an understory of bushes, mossy
boulders, ferns and foxgloves, the path, fireflies, a band of grass, ferns, daisies, bunchberry and mushrooms, to
big fronds and leaves sweeping past the lens and one old trunk crossing the whole frame mid-walk. Both raccoons
stand and breathe; the parent lifts a paw to test the air and the kit copies; the parent walks off and the kit
follows a beat later; they stop, the parent lifts its head to sniff and the kit copies.

## Scene 2: the creek (`creek.html`, `js/creek.js`)

The cast was signed off on d2 (12:45 am Sun Oct 25). The creek is the look test for night paper and bloom: 3 bars at
80 BPM, 9 s. The parent stands on a flat rock at the water and washes a crayfish; the kit, on a lower rock in front,
copies every move a beat late, but where the parent lifts the crayfish to look at it the kit's paws come up empty and
slap the water: a splash, the parent flinches, the kit shakes its head, then goes back to washing nothing, still a
beat late. Fireflies over the water.

- **Draft 2 (composition):** restaged on paper-fox's rules (`COMPOSITION.md`): a high vantage over a vista, the creek a
  ribbon winding from a vanishing point under the moon (upper right) to the bottom of frame, the parent perched at the
  left third on a rock at the water, the kit on a stone in the river, the banks stepping back with pines shrinking
  toward the vanishing point, a cedar on the left edge, the biggest flowers bottom left, rocks and foam bottom right,
  one slow push in, the moon lighting the raccoons' faces. The paws go under by drawing the creek a second time in
  front of each raccoon, clipped below its waterline. The acting is draft 1's. The notes below describe draft 1.
- **Draft 3 (richness):** bright moonlit water with long white streaks riding the flow, three small cascades where the
  creek steps down, foam along both banks and round the rocks; mossy rock ledges stepping back along both banks toward
  the vanishing point (lit moss tops with a hanging lip and moss cushions, cliff faces lit on the side toward the moon),
  pines standing on them, two thin falls spilling off the left ledges; a violet glow at the horizon, lavender peaks,
  brighter greens, lupins, daisies and red berries along the water.
- **Draft 4 (no vanishing point):** Robin found draft 3's vanishing point too obvious, all sharp lines running at it.
  Restaged as the night-lake poster is: the creek zigzags out from behind a forest mass, swings past the perch rock
  and crosses the foreground; the moon's reflection lies on a level lake with its far shore of tiny pines, seen
  through a gap in rounded, overlapping hills; ledges, pines and night-muted yellow shrubs stand as irregular masses.
- Seventeen planes: sky with stars and the moon, cloud banks, peaks, a pine ridge, the far bank (cedars, pines,
  bushes, ferns, a mossy lip, boulders), the far water with the bank's trees reflected and mist drifting low,
  stepping stones with foam and a fallen log, mid water, fireflies, the parent's rock, the parent, the water in front
  of it, the kit's rock, the kit, the near water, reeds and skunk cabbage, a cedar bough and ferns at the lens.
- Water is stacked opaque bands, each nearer band starting lower in frame and flowing faster (tileable strip sheets
  scrolled per plane). The moon's reflection is a broken column of torn cream pieces running down through every band,
  and with the fireflies, the foam and the splash it is the bright paper the bloom works on.
- The paws go under the water's surface plane; rings spread from them while they are in. The splash is a crown of
  torn water, 44 paper drops on ballistic arcs and three big rings.
- New rig inputs for this (all default 0, so the signed-off drawing and walk are unchanged): `wash`, `rub`, `lift`,
  `depth`, `dip`, `hold` (a crayfish between the paws), `shake`, `flinch`.

```bash
open creek.html
nice -n 15 node ../tools/motion-lab/render.mjs "creek.html?w=1280" 0 9 out/draft/fno_s2-creek_dN_f0-f216_24fps_draft.mp4 --width 1280 --height 720
```

The change out of the creek (the moon's reflection rises and becomes the porch light) is built with scene 3.

## The transitions (`js/transitions.js`, `js/film.js`, `transitions.html`)

A port of paper-fox's `src/film/transitions.js` with the parts of `compose.js` and `props.js` it uses (MIT). The rule
is paper-fox's: the cut from one scene to the next always happens behind something from the story world, so a
character is never seen twice. The moves, timings and eases are paper-fox's; the props are ours (a cedar trunk and
cedar sprays, torn-paper boulders, a forest-floor page, drawn with `js/forest.js`'s helpers).

| Move | What hides the cut | Its place in the film |
|---|---|---|
| `intro` | the cut-outs drop onto their stands, far first, nearest last | the opening |
| `throughBranches` | the camera pushes into cedar sprays; they fill the lens and part | the hollow, down into the cedar |
| `trackPine` | the camera keeps tracking; an old cedar sweeps across the lens with the next world behind it | down the cedar to the creek |
| `lightFlood` | the scene's light floods the frame and draws back into the next scene's light | creek to garden: the moon's reflection becomes the porch light |
| `lightFlash` | the light flares, turns cold, and is the flash that opens the next | garden to lost: the motion-sensor light |
| `rockIris` | a ring of rock closes on the hero, shut for a fifth of a second, opens on the next | lost to found: the iris on the drainpipe |
| `popup` | every cut-out folds flat onto a page front to back, the sky turns, the next world springs up back to front | found to dawn |

Scenes are now objects (`js/scene.js`: `SCENES.walk`, `SCENES.creek`), so a transition can draw two at once, each
plane with its own scene's camera and time (`PD.renderPlanes` takes `camOf`, `tOf`, `offset` for this). `js/film.js`
lays scenes and transitions out as a plan; `transitions.html` is a 33 s reel that cuts between the two built worlds
with each move, until the scenes around each move exist. The creek renders byte-identical after the refactor.

## Taken from paper-fox (MIT, Copyright (c) 2026 Leonxlnx; notice in `LICENSE-paper-fox.md`)

`js/paper.js` is copied unchanged from the paper-depth look test (`indieagent-paper-depth/js/paper.js`, the port
of paper-fox `src/core`): paper textures baked into each piece, the lit and unlit cut edge, torn edges with a white
core, baked shadows, the multiplane camera, bloom and grain. The rig techniques (breathing, twitches, follow-through
chains, planted-foot IK, one composite shadow) follow paper-fox's `elements/fox.js` and `fox-rig.js` by way of the
paper-depth musician. Not taken: the fox drawing, any scene, any audio.

## Next

1. Robin's notes on the transitions reel.
2. Night sound for the creek (no score: Robin, about 1 am Sun Oct 25): crickets, the creek, dabbling, the splash,
   chitters, placed on cues the scene reports.
3. The rest, each scene rendered as it lands, with its transitions. Growing up can come later as more episodes.
