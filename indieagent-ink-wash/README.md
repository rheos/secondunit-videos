# Ink-wash look test

12 s test of an ink-wash landscape: a tiny red tour van crosses a hump-backed stone bridge between karst
peaks in mist. Issue #312. Method after Leon Lin's shanshui (MIT); study in
`references/leon-lin/STUDY-shanshui.md`, look in `looks/ink-wash.yaml`.

- `js/inkkit.js`: the reusable kit. Brush primitives, `inkify` (wet edge, granulation, bleed) run once on each
  baked card, `paperField`, and `unify` (edge wobble along the paper fibres, wicking, paper texture, vignette,
  dither) run on every frame. CPU Canvas2D only, so it renders headless anywhere, the cloud render included.
- `js/scene.js`: this test's subject. Planes at depths 0.2 / 0.5 / 0.8 / 1.15 with parallax, wisps of mist at
  the base of each, paint-in by value at the open. `draw(ctx, t)` is a pure function of t.
- `index.html`: HyperFrames host, one canvas, one GSAP driver.

```bash
npx --yes hyperframes@0.8.174 render . -q high -o out/ink-wash_test01_720.mp4
```

Setup about 4 s (baking and inkifying the cards), then about 0.8 s a frame at 720p.
