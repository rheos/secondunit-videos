# Ink-wash Canvas loop

A sample for the Canvas loops offer (`secondunit/CANVAS-LOOPS-OFFER.md`): 8 s, 9:16, silent, loops exactly.
One karst spire with a pine on its shoulder, mist rising through the gorge in front, three birds wheeling, a
small red sun low behind the far range. No text.

It joins two pieces of work:

- the ink-wash kit from the look test (`indieagent-ink-wash/js/inkkit.js`, PR #316): brush, `inkify` once per
  baked card, `paperField`, and `unify` on every frame;
- loop noise (`tools/canvas-loop/loopnoise.js`, PR #315): noise sampled round a closed circle, so continuous
  drift comes back to where it started.

## How it loops

Every frame is a pure function of the phase `t / 8`.

- **Cards** (far range with the sun, side peaks, spire, pine, near rocks) are baked and inkified once. They move
  only on looping paths: a camera wander of about 5 px (`LoopNoise.loopWander`, scaled by depth for parallax)
  and the pine's sway about its root (`loopNoise1`, about 1 degree).
- **Mist** is four layers of warped `loopFbm2`, each with its own envelope (far veil, side veil, the gorge,
  wisps in front of the near rocks). LoopNoise alone makes a field change shape but not travel. To make the
  gorge mist rise, each layer is a two-copy flow map: both copies scroll up by `rise` px per loop, half a loop
  apart, and each one jumps back while its weight is zero. The blend is divided by `hypot(w1, w2)` so the
  contrast doesn't dip mid-blend.
- **Birds** go round an ellipse once a loop, with a whole number of wingbeats and two glides.
- The dither seed in `unify` is the frame number within the loop.

## Render

From any mv-projects film folder that has `node_modules/playwright`:

```bash
cd mv-projects/bobwiseman-all-the-trees
nice -n 15 node ../tools/canvas-loop/loop-render.mjs ../canvas-ink-wash/index.html ../canvas-ink-wash/out/loop
```

Opened in a browser, `index.html` plays the loop. `?w=540&h=960` draws the same picture smaller, for when the
open question on Spotify's 720 to 1080 px height rule is settled.

The rock, spire and pine helpers are copied from `indieagent-ink-wash/js/scene.js`; if a third ink-wash piece
needs them, they belong in `inkkit.js`.
