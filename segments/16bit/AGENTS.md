# For the agent: 16-bit pixel art segment

This folder is a Quiver look segment: 15 seconds of one look, drawn in code, that you can render, study and reuse.
The look: a SNES-era game drawn into a 320x180 buffer of palette indices (46 colours), blown up x4 with
nearest-neighbour, then a faint CRT finish. The scene here is a made-up racer, "Coast Run". `segment.json` is the
machine-readable version of this page.

## Run it, in this order

1. `npm install`
2. `npm run check`. Fix every MISSING line with the command it prints, then run it again. It needs Node 20+, ffmpeg
   and a browser with WebGL2 (Google Chrome; Playwright Chromium with software WebGL also works).
3. `npm run render` writes `out/16bit-segment_f00000-f00360_24fps_review-720p.mp4` (about 30 s on a laptop).
4. Look at it: pull stills with `ffmpeg -ss 3 -i out/<file>.mp4 -frames:v 1 still.png` and view them before you say
   it worked. `npm run preview` serves a live page that loops the 15 s.

## What makes the look (keep these as they are)

| File | Rule it enforces |
|---|---|
| `js/px.js` | one palette index per pixel in a 320x180 buffer; integer primitives only, no anti-aliasing; 4x4 Bayer dither instead of gradients; sprites from text rows; a hand-drawn 5x7 font; x4 nearest-neighbour out |
| `js/vocab.js` | the 46-colour palette (`PALDEF`, every pixel is one of these), traffic and palm sprites, scenery layers, the pseudo-3D road, the UI box and the race HUD |
| `js/look.js`, `js/gl.js` | the finish reads the buffer 1:1 (`texelFetch`, no blur): the last output row of each game pixel x0.87, vignette 0.3·r², a white flash for hits |

## Make your own piece with it

- Edit `js/scene.js`. Each shot is a function of song time `t` that draws into the buffer; register it with
  `shot(name, t0, t1, px(fn))`. Draw only with the primitives in `px.js` and colours from `C.<NAME>`.
- Frames must be pure: the picture depends only on `t` (no state carried between frames, no `Math.random()`; use
  `hash(n)` or `snoise(x, seed)`), because the renderer draws frames in parallel and out of order.
- Timing: `js/core.js` has a 120 bpm grid (`BEAT`, `beatAt(n)`). Put cuts and hits on beats. With a song, replace
  the grid with the song's beat and onset times, and add the audio as a second ffmpeg input in `render.mjs`
  (it renders silent today).
- Hits: `fx({ flash: hit(t, t0, decay) })` flashes white; return `[dx, dy]` from a shot to shake the screen.
- Text: `txt('WORDS', x, y, C.WHITE, { o: C.INK, sc: 2, align: 'c' })`; type it out with `typed(words, times, t)`.
  The font has A to Z, 0 to 9 and common punctuation only.
- Length: change `DUR` in `js/core.js`; `npm run render -- --t0 0 --t1 30` renders any span.

## Not included

No song: the piece is silent on a beat grid. Nothing in this folder costs money to run.
