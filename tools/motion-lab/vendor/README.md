# Vendored Remotion helpers

Three of Remotion's packages, bundled with esbuild into plain scripts that set one window global each, so
a Canvas look can use them with a `<script src>` after `motion.js` and no bundler. Pinned to
**Remotion 4.0.538** (esbuild 0.28.2); the entries are in `src/`, the build is `build.mjs`.

```bash
cd tools/motion-lab/vendor && npm install && npm run build   # rebuilds all three, sums the metafile, runs a smoke test
```

Every function here is pure: strings and numbers in, strings and numbers out, drawn with `new Path2D(d)`.
Nothing touches the DOM or React. `../example/vendor-demo.html` uses all three.

| File | Global | Size | What came from where (esbuild metafile) |
|---|---|---|---|
| `remotion-paths.min.js` | `window.RPaths` | 69.7 KB | @remotion/paths 44.4 KB; remotion core (`no-react` entry) 24.3 KB |
| `remotion-noise.min.js` | `window.RNoise` | 9.0 KB | @remotion/noise 0.5 KB; simplex-noise 4.0.1 3.7 KB; remotion core 4.1 KB |
| `remotion-shapes.min.js` | `window.RShapes` | 52.9 KB | @remotion/shapes 22.5 KB (make* functions only); @remotion/paths 25.5 KB (its own copy of `serializeInstructions` and `interpolate`); remotion core 3.6 KB |

`manifest.json` holds the same numbers in bytes and is rewritten by every build.

## RPaths (@remotion/paths)

Functions on SVG path strings (`d` attributes). The ones a look reaches for:

| Function | Use |
|---|---|
| `evolvePath(progress, d)` | Draw-on. Returns `{ strokeDasharray: "L L", strokeDashoffset }` for 0..1; in Canvas: `g.setLineDash(strokeDasharray.split(' ').map(Number)); g.lineDashOffset = strokeDashoffset`. |
| `interpolatePath(u, d1, d2)` | Morph one path into another at `u` in 0..1. It pairs instructions one for one, so both paths need the same sequence of commands: a star (all `L`) into a heart (all `C`) collapses into a scribble halfway. For two arbitrary outlines, resample both to the same N points with `getPointAtLength` and rotate each to start at its top (the demo's `resample`, 240 points reads as a curve at 10 px stroke). Centre both on the same origin so the morph has nothing to drift. |
| `getLength(d)` | Total length, for driving a dot by distance. |
| `getPointAtLength(d, s)` | `{ x, y }` at distance `s` along the path. |
| `getTangentAtLength(d, s)` | Unit `{ x, y }` tangent at `s`: `Math.atan2(y, x)` is the heading of a prop riding the path. |
| `cutPath(d, s)` | The path up to distance `s`, as a new path string (a trail that grows). |
| `warpPath(d, ({ x, y }) => ({ x, y }))` | Bend every point through a function (a wave through a line, a lens). |
| `getBoundingBox(d)` | `{ x1, y1, x2, y2, width, height, viewBox }`, for `ML.probe.box` and for centring. |
| `translatePath(d, x, y)`, `scalePath(d, sx, sy)` | Move and scale a path string. |

Also there: `parsePath`, `serializeInstructions`, `normalizePath`, `reversePath`, `resetPath`, `centerPath`,
`getSubpaths`, `interpolatePaths` (several at once), `extendViewBox`, `reduceInstructions`,
`getInstructionIndexAtLength`.

## RNoise (@remotion/noise)

Simplex noise in -1..1, seeded, cached per seed. The seed may be a string.

| Function | Use |
|---|---|
| `noise2D(seed, x, y)` | Camera drift: `18 * noise2D('cam-x', t * 0.35, 0)` pixels never stops and never repeats. |
| `noise3D(seed, x, y, z)` | A field that evolves in time (`z = t`): wobble on a grid of things. |
| `noise4D(seed, x, y, z, w)` | A looping field: walk `(z, w)` round a circle of radius 1 over the loop so frame N meets frame 0. |

## RShapes (@remotion/shapes)

Path strings for shapes, each returning `{ path, width, height, transformOrigin, instructions }`. Only the
`make*` functions are bundled; the React components (`Star`, `Heart`, ...) are left out.

| Function | Arguments |
|---|---|
| `makeStar` | `{ innerRadius, outerRadius, points, edgeRoundness?, cornerRadius? }` |
| `makeHeart` | `{ height, aspectRatio?, bottomRoundnessAdjustment?, depthAdjustment? }` |
| `makePie` | `{ radius, progress, closePath?, counterClockwise?, rotation? }` |
| `makePolygon` | `{ points, radius, edgeRoundness?, cornerRadius? }` |
| `makeCircle` | `{ radius }` |
| `makeRect` | `{ width, height, edgeRoundness?, cornerRadius? }` |
| also | `makeEllipse`, `makeTriangle`, `makeArrow`, `makeCallout`, `makeSpark` |

`width` and `height` are the shape's tight box, not the radii: `makeStar` with `outerRadius: 100` is
190 wide. Centre a shape with `translatePath(path, -width / 2, -height / 2)`.

## Licences

The three packages are **MIT** (`LICENSE-paths.md`, `LICENSE-noise.md` which also carries simplex-noise's
MIT, `LICENSE-shapes.md`). The bundler also pulled in code from the **core `remotion` package, which is
not MIT**: it is under the Remotion licence (`LICENSE-remotion.md`), free for individuals, companies
with up to 3 employees and non-profits, a company licence above that. Robin works solo, so the free
tier applies; if that changes, this is the folder to revisit. What came in from core, named from an
unminified build:

- paths: `interpolate` and its helpers (`interpolateNumber`, `interpolateString`, `Easing`, `bezier`,
  `spring`, `measureSpring`), used by `interpolatePath`; plus the Interactive schema tables
  (`baseSchema`, `sequenceSchema`, ...) that the bundler cannot prove side-effect free.
- noise: `random` (`mulberry32`, `hashCode`), the seeded PRNG behind every noise function; plus the same
  schema tables.
- shapes: the same `interpolate` slice, through @remotion/paths.

Nothing from React or from Remotion's main entry is in any bundle; `@remotion/shapes` imports them for its
components, and `build.mjs` swaps those imports for an inert stand-in so the components fall away. The
smoke test at the end of the build calls every exported function.
