# canvas-loop

Tools for Spotify Canvas loops: 3 to 8 s, 9:16, silent MP4, played on repeat, so the last frame has to run
into the first with no jump.

| File | What it is |
|---|---|
| `loop-render.mjs` | Renders any code-drawn page to a 720x1280 Canvas MP4, a half-size GIF, a contact sheet, and runs the seam test. |
| `loopnoise.js` | Noise that loops exactly, for Canvas 2D pages. Sets `window.LoopNoise`. |
| `loopnoise.glsl` | The same for WebGL looks (paste into a fragment shader). |
| `loopnoise.py` | The same for Blender scripts, on `mathutils.noise`. |
| `demo-loopnoise.html` | An ink-blot and contour-line field that proves `loopnoise.js` passes the seam test, and that plain time noise fails it. |

## loop-render.mjs

```bash
cd mv-projects/<any film folder with node_modules/playwright>
node ../tools/canvas-loop/loop-render.mjs <page.html> <out dir> [--w 720 --h 1280 --seconds 8 --fps 24] \
     [--song assets/song.wav --at 90] [--q 'name=value&other=1']
```

The page exposes `window.__ready` (a promise) and `window.__framePNG(t)` (or `__frameJPEG(t, q)`), drawing time
`t` in seconds as a pure function whose period is `--seconds`. It is opened as
`page?offline=1&w=W&h=H&loop=1`, plus whatever `--q` adds. Outputs: `frames/`, `canvas_WxH.mp4`, `loop_*.gif`,
`contact.jpg`, `seam.json`, and with `--song` a review cut that plays the loop four times over the song.

Seam test: PSNR of every frame step i to i+1, and of the last frame to the first. The seam passes when it is no
worse than the median step minus 1.5 dB, so a busy loop with low step PSNR is judged against itself.

## Looping noise (loopnoise)

Until now a Canvas loop could only move things whose period divides the loop (a walk of 1 s in an 8 s loop,
grain on a counter that wraps). Continuous drift, the kind made with noise (smoke, ink, a handheld camera), never
comes back to where it started, so it jumps at the seam.

The fix is Leon Lin's, from lumenshaders (MIT, `LICENSE-lumenshaders.md`). Do not move along a time axis
through the noise. Move round a circle:

```
phase = (t mod LOOP) / LOOP                      # 0..1
value = noise4(x, y, R cos(2 pi phase), R sin(2 pi phase))
```

At phase 1 the lookup point is back where it was at phase 0, so the value is identical and frame N is frame 0.
Between, the point moves at a steady `2 pi R / LOOP` noise units per second, so `R` is the amount of motion:
0.3 is a slow drift, 1 is lively, 2 and up boils. Because the circle is in two extra dimensions, the field
changes shape as it goes. Leon puts the circle in the same two axes as the picture (`fbm(p + LT())`), which on
its own only slides the field round a small circle; he hides that with warps. With 4D noise we don't need to.

### In a Canvas 2D page

```html
<script src="../tools/motion-lab/vendor/remotion-noise.min.js"></script>  <!-- 4D simplex, seeded -->
<script src="../tools/canvas-loop/loopnoise.js"></script>
<script>
  const LOOP = 8;
  function draw(t) {
    const ph = LoopNoise.phase(t, LOOP);
    const [dx, dy] = LoopNoise.loopWander(ph, 0.6, 12, 'cam');       // handheld camera, px
    const ink = LoopNoise.loopFbm2(x / 300, y / 300, ph, 0.55, 'ink', 3); // field, about -1..1
    const tint = LoopNoise.loopNoise1(ph, 0.4, 'tint');                // one drifting value, -1..1
  }
</script>
```

| Function | Returns |
|---|---|
| `phase(t, period)` | `t` seconds as phase in [0, 1), negatives wrapped |
| `loopNoise2(x, y, phase, radius = 1, seed = 0)` | 4D noise at `(x, y, R cos, R sin)`, -1..1 |
| `loopNoise1(phase, radius = 1, seed = 0)` | one looping value, -1..1 (for camera wobble, colour drift) |
| `loopFbm2(x, y, phase, radius, seed, octaves = 4, gain = 0.5)` | fractal sum; each octave doubles the circle too, so fine detail moves faster than the big shapes |
| `loopWander(phase, radius = 0.6, amp = 12, seed)` | `[dx, dy]` in px |
| `use(fn)` | swap in another `(seed, x, y, z, w) -> -1..1` noise |

It reuses `RNoise.noise4D` (simplex-noise 4.0.1 in the motion-lab vendor bundle), so nothing new is vendored.
Seeds may be strings. Every function is pure, so `__framePNG(t)` stays a pure function of `t`.

For grain or boil, keep the counter trick: `Math.floor(phase * K)` with K a whole number of steps per loop.

### In a WebGL look

Paste `loopnoise.glsl` after the precision line and drive one uniform, `u_phase = mod(t, LOOP) / LOOP`:

```glsl
float f = loopFbm2(uv * 3.0, u_phase, 0.6, 1.0, 4);
vec2  w = vec2(loopNoise1(u_phase, 0.6, 2.0), loopNoise1(u_phase, 0.6, 3.0));
```

The 4D simplex is Ashima/Gustavson's webgl-noise (MIT, notice in the file). It looks like the JS version but the
numbers differ, since it is a different simplex. Checked in headless Chrome (WebGL2, Metal): phase 0 and phase 1
render the same image within one 8-bit level.

### In Blender

`mathutils.noise` has only 3D noise, so `loopnoise.py` does this:

- `loop_noise1(phase, R, seed)` walks a closed circle through 3D noise. For one drifting value (camera wobble, a
  light's strength) this is as good as 4D.
- `loop_noise2(x, y, phase, R, seed)` samples `(x + R cos, y, z + R sin)`. One circle axis is a picture axis, so
  the field slides back and forth in x by up to R while z changes its shape. Keep R small against the feature
  size, or use the Noise Texture node in 4D with W from the same circle for a field with no slide.
- `key_loop_drift(obj, "location", 0, amp=0.04, frames=192, radius=0.6, seed=1, base=obj.location.x)` keys a
  value on every frame 1..192, the way `canvas_loop.py` keys everything, so frame 193 would equal frame 1. This
  replaces a Noise F-curve modifier, which never repeats.

Checked in Blender 4.5.14: phase 0 and phase 1 give the same value to the last digit for every seed, and the
step from frame 192 back to frame 1 (0.012) is smaller than the largest frame step (0.018).

### Proof: demo-loopnoise.html

```bash
cd mv-projects/bobwiseman-all-the-trees
nice -n 15 node ../tools/canvas-loop/loop-render.mjs ../tools/canvas-loop/demo-loopnoise.html <out>/loop
nice -n 15 node ../tools/canvas-loop/loop-render.mjs ../tools/canvas-loop/demo-loopnoise.html <out>/time --q noise=time
```

An ink field with contour lines and a wandering camera, monochrome, 720x1280, one 8 s loop. `noise=time` swaps in
plain 3D noise with z = t at the same speed through noise space. Results on 2026-10-24 (192 frames, about 45 s
of drawing each on the Intel Mac):

| Version | Median step | Seam (last to first) | Result |
|---|---|---|---|
| loopnoise | 14.62 dB | 14.43 dB | SEAM OK |
| plain time noise | 13.36 dB | 8.76 dB | SEAM VISIBLE |

The step PSNR is low for both because thin lines move a few pixels every frame; what matters is that the looping
seam is one more ordinary step, while the time-noise seam is 4.6 dB below the median step and 4.1 dB below the
worst one: a cut to a different picture.
