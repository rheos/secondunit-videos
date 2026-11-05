# Snow bus (look test)

A 10 s silent look test, 16:9 at 720p, 24 fps, drawn in code (0 credits), to prove the inked3d kit on a subject with
nothing in common with the moss forest. Issue rheos/secondunit-videos#400.

## The idea

A small town street at dusk. An old two-tone tour bus has stood at the kerb long enough to be buried: snow on the
roof, the sills, the mirrors, drifts banked against the wheels. Its destination box flickers, the headlights catch,
the whole bus shudders and the roof snow lets go in slabs. Then it rolls forward one length through its own powder,
lights on, exhaust puffing, and leaves the drifts it stood in behind.

The bus is our own design (a rounded 1950s intercity shape, cream below the belt, red above, chrome trim, a split
windshield, a destination box). No badge, no livery, no frame from any film.

## Brief as numbers (written before the build)

```text
GOAL: the kit's manner on a machine in snow at dusk; the warmth is from the windows and the lamps, not the sun
OUTPUT: 1280 x 720, 24 fps, 10 s = 240 frames; kit/ from tools/inked3d-kit at the VERSION in kit/VERSION
MODEL: body 9.0 x 2.3 x 2.5 m, roof dome, 4 wheels r .55, 7 side windows a side, 2 headlights, destination box,
      bumpers, mirrors, exhaust; materials cream (weathered), red (weathered), chrome, glass, rubber, lamp (glow),
      dark, sign (glow). Front faces +x; it rolls toward +x.
SNOW (the stroke layer): roof blanket 520 clumps, wind-piled toward -x; window sills and belt strip; bumper top;
      mirrors; ground drifts (700 clumps on a static ground part, deeper on the lee side) that stay when it leaves;
      18 roof slabs that slide off at 5.15-6.75 s; star strokes as flakes. Tones #6F86A8 to #FFFFFF.
LIGHT: sun low from the left-front [-.72, .22, .55]; cool fill. Glow: destination box and headlights flicker at
      3.0, 3.35, 3.8 s and catch 4.1-4.5 s (lightsOn f108). A blue multiply of 35% over the whole frame for dusk.
SHOTS: f0-59 wide, buried, snow falling | f60-119 close on the front, the flicker and the catch |
      f120-239 wide: shudder 5.0-6.4 s (camera shake 2.6 px), slabs off, exhaust from 4.4 s, roll 7.1-9.6 s one
      bus length with a .12 m anticipation back, pitch -.045, wheels spin at x / .55, powder from the wheels,
      camera pans with it.
TIMING: the bus on twos throughout; camera, snowfall and powder on ones.
PLATES: dusk sky in flat bands (indigo to peach), two hill ridges in hatch, 9 flat houses with lit windows and
      snow caps, 3 poles with wires, a snow street in flat tones warm near the windows; front: a dark hedge with
      snow caps and a lamppost with a lamp glow.
QA: stills at 1, 3.5, 6, 9 s beside the moss forest's; audit (cuts, lightsOn, rollStart, bus in frame, bus on the
      street); badframes; purity; then watch it.
```

## What the kit needed

The second subject exposed one baked-in assumption and confirmed the rest were settings:

- **Weathering cover and patch size were the piano's.** The bus came out rusted all over. Added `weather.density`
  and `weather.scale` to `configureInk` (kit commit db5e878); defaults keep the piano identical. The bus uses
  .42 and .55.
- **The shadow map's centre** was already a setting (`uni.shadowAt`, `shadowR`); a subject that travels needs it
  to follow (`shadowAt: [p.x, 1.6, 0]`, radius 8 for a 9 m body), where the piano never left the origin.
- **The sun and fill directions** are settings; dusk from the left-front with a cool fill works without changes.
- **The stroke layer is subject-free.** Snow is the same `clump` as moss with five blue-to-white tones and a flat
  stroke angle (`ang` near 0 instead of the moss's .8 to 1.4). Star strokes read as flakes at small size.
- **A static part for what stays behind** (the drifts on `P_GND` with an identity matrix) is a project pattern,
  not a kit change; worth copying for anything that leaves its resting place.
- **Ink and dust tones** were already per film. Nothing in `paint.js` or `flat.js` needed a change: `barkTrunk`
  draws a telegraph pole and a lamppost with cold tones and no ivy, `hatch` paints hills, snow caps and a hedge.
- Unused here: the blade kind of stroke and the ray (`kind` bit 4, `uni.ray`), which are the forest's sunrise.

## Review (v1, 2026-11-03)

Review cut `out/snowbus_test_f0-f240_24fps_review-720p_v1.mp4` (42 s to render, 3 workers, about .27 s a frame).
Audit on all 240 frames: cuts on 60 and 120, lights on 108, roll starts 178 (the brief said 172 and forgot the
anticipation; the spec was corrected to the geometry), bus in frame in the wide shots, never below the street.
badframes 0 of 240, flash check passes, a frame drawn out of order is byte-identical. Motion judged from sheets,
not watched at speed. Side by side with the moss forest: `out/snowbus_v1_side-by-side_moss-vs-bus.jpg`.

What reads: the manner carries over whole (cel from one light, broken ink, hatched snow on the roof and sills,
flat plates, the dusk grade), the drifts stay behind when it leaves, the headlights catch with beams. What is
weak: the roof slabs read as white blobs mid-air rather than sheets of snow sliding; the hedge in the front
plate is a dark strip; the wheels are plain discs at this size; no sound.

## Build and render

Playwright comes from a sibling look (`ln -s ../bobwiseman-in-her-dream/node_modules node_modules`, not committed).

```bash
../tools/inked3d-kit/sync.sh indieagent-snowbus-test                 # from mv-projects; refresh kit/ from the kit
node check.mjs out/check/sheet.jpg 1 3.5 6 9
node ../tools/motion-lab/audit.mjs index.html 0 10 --spec audit.spec.mjs --width 1280 --height 720
nice -n 15 node ../tools/motion-lab/render.mjs index.html 0 10 out/snowbus_test_f0-f240_24fps_review-720p_v1.mp4 --width 1280 --height 720 --workers 3
```

## Plate marks test (2026-11-04, rheos/secondunit-videos#417, waiting on Robin)

Same test as the moss forest (see its README). Page `marks.html`, `js/plates-marks.js`; `?marks=0` is byte-identical to
`index.html`. Cloud bank and hills, hedge, snow caps, street and poles are repainted in small dabs; the wires are drawn after every
mark and stay whole, and the bus and its snow are untouched. Clip: `out/snowbus_test_f96-f240_24fps_marks-flip.mp4`.

```text
t=8                  before    marks
marks per 10,000 px    90.8    108.8
LIGHT mean / p10   134.7/44.3  134.1/46.8
```

Street contrast was lowered after the first pass so it doesn't compete with the bus's drift. Adds about 2 s at load (375,000 dabs).
Hedge frame-to-frame change rises slightly on the camera slide (mean 1.25 to 1.41 levels). 0 bad frames.
