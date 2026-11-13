# Field-guide illustration: 15 s segment

Look: `looks/fieldguide.yaml`, cut on the beat against `looks/blueprint.yaml`. A gardener waters a seedling and it grows
into a sunflower taller than him. Three paper acts on diagonal stripes (sage, ochre, rose), two blueprint plates between
them (the growth dial, the seed head), and in the last seconds the blueprint burns through the paper. Cuts sit on a fixed
120 bpm grid.

```bash
npm install && npm run render     # out/fieldguide-segment_f00000-f00360_24fps_review-720p.mp4, 1280x720, about 50 s
npm run preview                   # serves the folder; open the address it prints (click or space plays)
```

## How the look works

The scene draws with the cleanline kit's plain primitives (`fillP`, `iP`, `iE`, `hatch`, `shade`). The `fieldguide` look
wraps those in its `init()`: every hand line becomes a filled pressure ribbon that swells, thins and tapers; an ink stroke
that sits on a fill takes a darker cut of that fill's colour; and every opaque fill gets a wash, lighter at the upper
left with colour pooled inside the edge. Drawings are held on twos with a fresh grain every frame. The `blueprint` look
draws the `sch` shots: navy ground, crisp lavender and cyan linework that never boils, magenta for what changes.

| Path | What it is |
|---|---|
| `engine/` | cleanline: the clock, core, kit, look registry and frame driver |
| `looks/fieldguide.js`, `looks/blueprint.js` | the two looks |
| `film.config.js`, `clock.js` | which look draws which mode; the 15 s, 24 fps, 120 bpm clock (no audio) |
| `js/scene.js` | the segment: gardener, plant, water, the two plates, the burn-through, `buildShots()` |
| `js/hooks.js` | `window.__frame(t)` and `window.__seg` for `render.mjs` |

## Where it came from

rheos/secondunit-videos at `560a5a5`:

- `cleanline/js/{clock,core,kit,look}.js` and `cleanline/looks/{fieldguide,blueprint}.js`: copied with the code unchanged.
  Five comments that named the source film or its song file were reworded.
- `cleanline/js/frame.js`: one change, marked in the file: with no audio file the preview player runs on the wall clock.
- `js/scene.js` is new. The figure follows the idiom of the cleanline films (filled shape, hatched shadow crescent, ink
  outline) but none of their cast, props or shots came along.
