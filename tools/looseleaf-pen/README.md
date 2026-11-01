# Looseleaf pen

Kevin Ngo's pen engine from Looseleaf (github.com/kevintngo/looseleaf, MIT, commit 9fbd9b6), vendored so our
code-drawn films can draw ink as pressure ribbons instead of even-width jittered strokes.

- `src/`: the seven ink files copied from `src/lib/ink` (rng, noise, paint, geom, pens, pen, types), imports made
  relative. `src/entry.ts` exposes `window.LLPen = { stroke, dot, makeRng, pen, PENS }`.
- `looseleaf-pen.js`: the browser bundle. Rebuild after touching `src/`:
  `npx esbuild src/entry.ts --bundle --format=iife --target=es2020 --outfile=looseleaf-pen.js`
- `kit-ll.js`: replaces a kit.js film's `iline`, `iE`, `iP` and `iBox` with the pen. Load after kit.js. Hatching,
  stipple and fills stay the kit's. Seeded from the kit's RNG, so lines still boil on twos.
  Query: `pen=felt` (default) `| pencil | brush | fine`, `penw=` width multiplier, `penwob=` wobble multiplier.
  Always strokes with `poly: true`: the pen's default spline loops wildly on sparse corner points (a 4-point box).
- `ta-pen.html`: Travel Agent's film page with the pen swapped in. Nothing in `bobwiseman-travel-agent/` changes.
- `stills.mjs`: before/after stills at song times. Needs playwright; point `PW_FROM` at a package.json that has it:
  `PW_FROM=../../bobwiseman-travel-agent/package.json node stills.mjs out/ 20,140,215 "pen=pencil"`

## Test 1 (2026-11-01), Travel Agent

Compare sheets in `out/` (not committed). Felt is the keeper: tapered ends, a little weight change along each
line, ink pooling at corners; at full frame it reads as the same film, close up it stops looking machine-drawn.
Pencil is thinner and softer, good for construction lines. Brush breaks lines into dashes (its `gaps`) and leaves
blobs at line ends, so not for outlines at this scale. The kit's doubled line is gone; the pen's own halo replaces
it. Not checked yet: motion (whether the per-drawing reseed boils too much on twos) and render time on a full act.
