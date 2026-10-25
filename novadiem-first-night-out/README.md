# First Night Out

A wordless cut-paper film of about 60 s: a raccoon parent and its kit on the kit's first night out, dusk to
dawn, in the manner of Leon Lin's paper-fox (rheos/secondunit-videos#325, picked by Robin on 2026-10-24). This
folder is at **step 1, the character sheet**: the cast is locked before any scene or transition is built.

```bash
open character.html             # the lock sheet; ?t=3 moves the breathing and twitches, ?q=2 renders it at 4K
open index.html                 # the 16 s character test; ?t=4 starts at 4 s, ?w=1920 renders 1080p
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

## Taken from paper-fox (MIT, Copyright (c) 2026 Leonxlnx; notice in `LICENSE-paper-fox.md`)

`js/paper.js` is copied unchanged from the paper-depth look test (`indieagent-paper-depth/js/paper.js`, the port
of paper-fox `src/core`): paper textures baked into each piece, the lit and unlit cut edge, torn edges with a white
core, baked shadows, the multiplane camera, bloom and grain. The rig techniques (breathing, twitches, follow-through
chains, planted-foot IK, one composite shadow) follow paper-fox's `elements/fox.js` and `fox-rig.js` by way of the
paper-depth musician. Not taken: the fox drawing, any scene, any audio.

## Next (after Robin signs off the cast)

1. The creek, end to end, as the look test for night paper and bloom.
2. Score plan and take.
3. The rest, each scene rendered as it lands; transitions after the cast is locked.
