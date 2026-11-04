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

Filled in after the build, in the review below.

## Build and render

Playwright comes from a sibling look (`ln -s ../bobwiseman-in-her-dream/node_modules node_modules`, not committed).

```bash
../tools/inked3d-kit/sync.sh indieagent-snowbus-test                 # from mv-projects; refresh kit/ from the kit
node check.mjs out/check/sheet.jpg 1 3.5 6 9
node ../tools/motion-lab/audit.mjs index.html 0 10 --spec audit.spec.mjs --width 1280 --height 720
nice -n 15 node ../tools/motion-lab/render.mjs index.html 0 10 out/snowbus_test_f0-f240_24fps_review-720p_v1.mp4 --width 1280 --height 720 --workers 3
```
