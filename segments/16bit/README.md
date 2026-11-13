# 16-bit pixel art: 15 s segment

Look: `looks/16bit.yaml`. A made-up SNES-era racing game, "Coast Run": a small orange van with a surfboard races a coast
road to a lighthouse. Five shots, every cut on a beat of a fixed 120 bpm grid: title, race, turbo, pause menu, stage clear.

```bash
npm install && npm run render     # out/16bit-segment_f00000-f00360_24fps_review-720p.mp4, 1280x720, about 30 s
npm run preview                   # serves the folder; open the address it prints to watch it loop
```

## How the look works

Every frame is drawn into an indexed 320x180 buffer, one palette index per pixel, with integer primitives only (no
anti-aliasing, Bayer dither instead of gradients, a hand-drawn 5x7 font). `pxOut()` expands it through the 46-colour
palette and blows it up x4 nearest-neighbour; a WebGL pass reads that 1:1 and adds only a faint darker last row per game
pixel, a whisper of vignette and a white flash on hits.

| File | What it is |
|---|---|
| `js/px.js` | the pixel engine: buffer, primitives, dither, sprites, font, palette expansion |
| `js/gl.js` | the WebGL finishing pass host |
| `js/look.js` | the finish shader (scan row, vignette, flash) |
| `js/vocab.js` | the look's vocabulary: the 46-colour palette, traffic and palm sprites, padlock, clouds, mountains, the pseudo-3D road, the UI box, the race HUD |
| `js/scene.js` | the segment: the van, the gull, the lighthouse, the sea backdrop and the five shots |
| `js/core.js` | time, easing, keyframes, the 120 bpm grid, the shot registry |
| `js/main.js` | the live player and the `window.__frame(t)` hook `render.mjs` calls |

## Where it came from

rheos/secondunit-videos at `560a5a5`, the `js/` folder of the film that `code.path` in `looks/16bit.yaml` points at:

- `px.js` and `gl.js`: copied unchanged.
- `vocab.js`: lines of `shots.js` copied as they were (palette, sprites, scenery, UI kit, HUD, road, race), with two
  changes: `race()` draws `playerVan` where the film drew its own character, and takes an optional `backdrop` for the
  far layers.
- `core.js`, `look.js`, `main.js`: the film's versions with the song features, song span and audio player taken out and a
  fixed 120 bpm grid put in.
- Not brought: the film's character, its signs and jokes, its shots, its lyrics and lyric timing, its audio features.
