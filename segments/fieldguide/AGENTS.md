# For the agent: field-guide illustration segment

This folder is a Quiver look segment: 15 seconds of one look, drawn in code, that you can render, study and reuse.
The look: hatched ink on cream paper over wide diagonal stripes, every line a pressure ribbon, each outline a darker
cut of the fill it sits on, fills washed; it cuts hard on the beat against navy blueprint plates. The scene is a
gardener and a sunflower. `segment.json` is the machine-readable version of this page.

## Run it, in this order

1. `npm install`
2. `npm run check`. Fix every MISSING line with the command it prints, then run it again. It needs Node 20+, ffmpeg
   and a browser (Google Chrome or Playwright Chromium).
3. `npm run render` writes `out/fieldguide-segment_f00000-f00360_24fps_review-720p.mp4` (about a minute).
4. Look at it: pull stills with `ffmpeg -ss 3 -i out/<file>.mp4 -frames:v 1 still.png` and view them before you say
   it worked. `npm run preview` serves a live page (click or space plays, arrows step).

## What makes the look (keep these as they are)

| File | Rule it enforces |
|---|---|
| `looks/fieldguide.js` | wraps the kit's `stroke()` so hand lines become filled ribbons whose width and darkness follow a pressure curve with tapered ends; tints an ink stroke to a darker cut of the fill it sits on (same hue, lightness x0.5 clamped 0.17 to 0.36, 12% toward the ink); washes every opaque fill (light from the upper left, colour pooled inside the edge); provides `paper()`, `stripes()`, `illDress()`; palette and paper grain |
| `looks/blueprint.js` | the `sch` plates: navy `#0c1430` ground, lavender `#c9c6ff` and cyan `#8fe3ff` crisp lines that never boil, magenta `#ff3d9a` only for what changes; provides `schBG()`, `schFrame()` |
| `engine/` | cleanline: drawings held on twos with fresh grain every frame, the seeded random stream `R`, the drawing kit, the look registry, the frame driver |

## Make your own piece with it

- Edit `js/scene.js`. `buildShots()` returns cuts in time order: `{ t0, t1, mode: 'ill' | 'sch', key, draw(p, lt) }`.
  `p` runs 0 to 1 across the shot, `lt` is seconds into it. `ill` shots are drawn by fieldguide, `sch` by blueprint.
- Draw with the kit's plain primitives (`engine/kit.js`): fill a shape with `fillP(PP(points) | PE(...) | PR(...), C.colour)`,
  shade with `hatch()` or `shade()` (never gradients), then ink it with `iP`, `iE`, `iBox` or `iline` in `C.ink`. The
  look turns that ink into ribbons and tints it; do not pick outline colours yourself.
- Figures stay primitive: box coats, ellipse heads, stick legs, deadpan faces (two dots and a flat mouth).
- Grounds: `stripes(C.paper, tint, 150, -.62, 0, hatchColour)` per act, shifting colour from act to act.
- Frames must be pure: draw only from `p`, `lt` and the clock. `R`, `rnd()` and `jit()` boil between held drawings;
  for anything that must hold still across a shot, use `M32(DSEED * k + n)`.
- Timing: `clock.js` is a 120 bpm grid. Cut on beats. With a song, set `audio.file` (and its sha256) and the beats
  there; the preview plays it, and `render.mjs` needs the audio added as a second ffmpeg input (it renders silent
  today).

## Not included

No song: silent on a beat grid. Nothing in this folder costs money to run.
