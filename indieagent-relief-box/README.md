# Relief box (look test)

An 11 s look test at 720p, 24 fps, asked for by Robin on 2026-10-25 (issue #327): how close can code get to
sculpted clay relief panels in shadowboxes, drawn in the language of Leon Lin's paper-fox, with other elements
mixed in. Recipe: `looks/relief-box.yaml`.

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

## What is on screen

- **The box.** A honeycomb back wall with dotted discs, four inner walls projected through the camera so they keep
  their perspective as it drifts, and a moulded frame whose shadow falls into the box.
- **The doll** (`src/figure.js`), cut down the middle. Each half carries half a head with one heavy-lidded eye
  looking outward, half a jacket, an arm bent up to a hand behind the head, a leg with an ankle band, and an
  ostrich plume behind the shoulder.
- **The spine** (`src/spine.js`): a rod and fourteen mirror-symmetric ornaments in mint, pink and butter.
- **Mixed in** (`src/props.js`): a turning wheel of square windows, a floating pink mountain town and a terracotta
  city on stepped roots, a thought bubble on a white lead with an emblem inside, and small things along the floor.

| Time | Beat |
|---|---|
| 0-1.4 s | the box at rest, the doll closed |
| 1.4-3.6 s | the halves slide apart |
| 2.6-7.4 s | the rod rises, the ornaments spring in bottom to top, the eyes light as they land |
| 6.9-8.8 s | the lead runs from the head to the bubble, the bubble pops open, the emblem springs up inside |
| 8.8-11 s | hold while the camera finishes its push |

## How a flat cut-out reads as clay

`src/kit.js` adds two helpers on top of paper-fox's `piece()`: `clayForm()` cuts a shape again in smaller tiers,
each lighter and nearer the light, with a darker flank on the far side, which is paper-fox's own way of building
form from layers; `tube()` does the same for limbs, coils and leads with a highlight tube along the lit side.
