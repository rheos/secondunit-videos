# LUMEN shaders (Leonxlnx/lumenshaders): what is worth taking

Read 2026-10-24 from a depth-1 clone at commit 3c54400 (last commit 2026-06-12). Nothing was installed, run or rendered.

## Recommendation

Borrow the loop technique, and if a client wants an abstract loop, vendor two or three of its shader modes behind our own adapter page and render them with our `tools/canvas-loop/loop-render.mjs`. Do not use LUMEN's own exporter as the Canvas source: it has no 9:16 option, writes WebM (Spotify takes MP4 or JPG), and the results are generic abstract fields that anyone can make free on the live site, with none of the "one idea from the lyrics" that made Bob's loops work. The circular-noise trick is the real gain, because it lets continuous noise motion (drifting clouds, smoke, shimmer, handheld camera wander) live inside a Canvas, which our current "every period divides 8 s" rule cannot do.

## License and shape

- MIT, `Copyright (c) 2026 Leonxlnx` (checked `LICENSE`). Vendoring is fine with the notice kept.
- Plain static site, no build, no dependencies. About 120 KB of JS: `js/shaders.js` (one uber fragment shader, all modes), `js/engine.js` (WebGL2 engine), `js/exporter.js` (PNG / WebM / GIF), `js/webmmux.js` (hand-written WebM muxer), `js/gifenc.js`, `js/main.js` (state, randomizer, share codes), `js/palettes.js`.
- Only outbound calls: Google Fonts and `/_vercel/insights/script.js` in `index.html`. An adapter page would load none of that.

## 1. How the loop is seamless

The whole frame is a pure function of one uniform, `u_phase` in [0, 1). In `js/shaders.js`:

```glsl
vec2 LT(){ return vec2(cos(TAU*u_phase), sin(TAU*u_phase)) * u_travel; }
```

Every time-dependent term goes through `LT()` or through something else that is periodic in `u_phase`:

- Noise lookups add `LT()` to the sample point, for example `fbm(p*0.5 + so + lt)` and `fbm(p*0.5 + so + 7.31 - lt)` in `sceneChrome`. The sample offset travels a circle of radius `u_travel` in noise space and comes back to where it started at phase 1.
- Blob orbits in `blobField` use `cos(TAU*ph*dir)` with `dir` = +1 or -1, so each blob makes a whole number of turns per loop.
- `sceneAura` adds `0.045*u_travel*sin(TAU*u_phase)`.
- Hash-driven flicker is quantized to a whole number of steps per loop: glyph swaps use `floor(u_phase*8.0)`, film grain uses `floor(u_phase*24.0)`. Since `u_phase` wraps, step 8 is step 0 again.

The engine maps time to phase as `phase = (t mod loop) / loop` (`Engine.currentPhase`, and the exporter loop in `Exporter.exportVideo`). Phase 1 and phase 0 give identical uniforms, so frame N is frame 0 exactly; rendering frames 0..N-1 gives a seam that is mathematically a normal frame step. Speed through noise space is `2*pi*travel / loop` units per second, so `travel` is the motion amount.

One honest caveat: with 2D noise and a 2D offset, `fbm(p + lt)` alone just slides the whole field around a small circle. LUMEN gets "morphing" because the offset feeds nonlinear warps with different scales and signs (chrome uses `+lt` in one warp axis, `-lt` in the other, and `u_flow*0.6*lt` in the height). The textbook version, which morphs properly, is to sample one dimension higher: 3D or 4D noise with the circle in the extra dimensions, `noise(x, y, R*cos(theta), R*sin(theta))`.

### What we do now

- `blender-orb-visualizer/canvas_loop.py` (take 02): every motion has a period that divides 8 s (walk 1 s, cloud bob 2 s, rain 0.5 s), keyed every frame, frames 1..192 rendered, frame 193 would equal frame 1.
- `bobwiseman-airplane-woodcut/js/canvas-loop.js`: drawing on twos and print re-pulls on threes indexed by wrapping counters (`n2 % 96`, `n3 % 64`). That is the same idea as LUMEN's quantized grain.
- `tools/canvas-loop/loop-render.mjs` leaves the seam to the page (contract: `__framePNG(t)` is pure in t with period `--seconds`) and then proves it with a PSNR test (last to first step within 1.5 dB of the median step).
- `orb_visualizer.py` uses Blender Noise F-curve modifiers, described in its own comment as "never repeats". That kind of drift cannot go in a Canvas today.

### Sketch of the change

No change is needed in `loop-render.mjs` itself. Add a small shared helper next to it and use it in loop pages:

```js
// tools/canvas-loop/loopnoise.js
export const loopAngle = (t, LOOP) => 2 * Math.PI * (((t % LOOP) + LOOP) % LOOP) / LOOP;
// any 4D noise (simplex-noise's createNoise4D, or a GLSL snoise(vec4))
export const loopNoise = (n4, x, y, t, LOOP, R = 1, seed = 0) => {
  const a = loopAngle(t, LOOP);
  return n4(x, y, R * Math.cos(a) + seed, R * Math.sin(a) - seed);
};
// camera wander that loops: two independent loop noises
export const loopWander = (n4, t, LOOP, R = 0.6, amp = 12) =>
  [amp * loopNoise(n4, 0, 0, t, LOOP, R, 11.3), amp * loopNoise(n4, 0, 0, t, LOOP, R, 47.9)];
```

In a GLSL pass (HyperFrames or our print shaders), pass `u_phase = t / LOOP` and use `vec2 lt = R*vec2(cos(TAU*u_phase), sin(TAU*u_phase)); f = snoise(vec4(p, lt));` (or LUMEN's cheaper `fbm(p + lt)` when the warp is strong enough to hide the slide). For grain or boil keep the counter trick: `floor(u_phase * K)` with K a whole number.

In Blender (`canvas_loop.py` style, which already keys every frame), replace a Noise F-curve modifier with a keyed value per frame: `theta = 2*pi*(fr-1)/FRAMES; v = amp * mathutils.noise.noise(Vector((R*cos(theta), R*sin(theta), seed)))`. That brings handheld drift and drifting clouds into Canvas loops and the PSNR seam test still applies.

## 2. The WebM export

From `Exporter.exportVideo` and `WebMMux.mux`:

- Codec: WebCodecs `VideoEncoder`, first choice VP9 profile 0 8-bit (`vp09.00.10.08`), fallback VP8. Muxed into WebM by the hand-written muxer (one track, SimpleBlocks, clusters every second or at keyframes, Duration set, no Cues). No MP4 path, despite the file header comment saying "WebM/MP4".
- Bitrate by pixel count (`videoBitrate`): 3.5 Mbps below 720p, 6 at 720p, 9 at 1080p, 14 at 1440p, times 1.4 at 60 fps. Keyframe every 2 s.
- Frame rate: 24, 30 or 60 (`Modals.openExport`).
- Offline and frame-stepped: `Engine.suspend()` stops the rAF loop, the canvas is resized to the export size, then for each frame `Engine.renderAt(phase)` draws and `new VideoFrame(canvas, {timestamp})` is encoded, with backpressure on `encodeQueueSize`. So it is deterministic for a given GPU and browser; it is not tied to wall-clock time.
- Size: height 720, 1080 or 1440; width = `evenRound(height * aspect)`. Aspects are only `16:9, 3:2, 1:1, 4:5, 21:9` (`ASPECTS` in `main.js`). Max is 2560x1440 (or 3360x1440 at 21:9).
- Length: 1, 2, 3, 4, 6 or 8 loops, or 5 to 60 seconds. Loop length slider 2 to 12 s in 0.5 s steps.

Seamlessness of its files: the "N loops" lengths are seamless when `loop * fps` is a whole number, which the 0.5 s slider guarantees at 24/30/60 fps (a share code can carry any value, though). The "seconds" lengths are not seamless unless the seconds are a multiple of the loop.

Against the Canvas spec as written (Spotify's pages re-read 2026-10-24, unchanged from the offer doc: 3 to 8 s, 9:16, "Between 720px - 1080px tall", MP4 or JPG, no file-size, fps or codec rule):

- Length: yes. Set loop to 8 s and "1 loop" (192 frames at 24 fps), or 4 s and "2 loops".
- Aspect: no. There is no 9:16. The nearest is 4:5 (864x1080). You would crop in ffmpeg (from 1152x1440 crop 810x1440, scale to 720x1280 or 540x960), or fork with a one-line `"9:16": 9/16` in `ASPECTS` plus 1280/1920/960 options in the resolution select (they are heights).
- File type: no. WebM VP9 must be re-encoded to H.264 MP4 (`-c:v libx264 -pix_fmt yuv420p -an -movflags +faststart`), a second lossy generation, harmless at crf 16.

So as shipped it cannot produce a Canvas file without a crop and a re-encode. The better route is to skip its exporter (section 3), since `loop-render.mjs` already writes H.264 MP4 and runs the seam test.

A side benefit for the open size question: the shaders are resolution-independent, so whichever size the real upload test settles on renders natively, with no rescale. Note that exact 9:16 with an even width only lands on heights that are multiples of 32: 540x960 and 576x1024 are clean inside 720 to 1080 tall; 1080 tall gives 607.5 wide (608x1080 is 0.56, close but not exact), and 720 tall gives 405 wide (odd).

## 3. Driving it headlessly

Yes, with a small adapter page and no changes to their shader. The engine already exposes what we need: `Engine.init(canvas, () => P, {autostart:false, onReady, onFullReady, onError})`, `Engine.setSize(w, h)`, and a synchronous `Engine.renderAt(phase)` on a WebGL2 canvas with `preserveDrawingBuffer: true`, so `toDataURL` after a render is safe.

What it would take:

1. Vendor `js/palettes.js` (for `hexToRgb01`), `js/shaders.js` and `js/engine.js` with the MIT notice.
2. Port `decodeDesign` from `main.js` into the adapter without its UI calls (`refreshAll`, `setPresetActive`, `fitCanvas`). It is about 40 lines: `LMN1.` + base64url of a JSON array `[3, mode, seed, c1..c4, bg, aspect, 22 numbers (hue..loop), synthOn, modeB, mixOp, blend, genomeOn, 12 genes]`. Start from the default `P` in `main.js` so any missing key has a value.
3. Adapter page, roughly:

```html
<canvas id="c"></canvas>
<script src="lumen/palettes.js"></script><script src="lumen/shaders.js"></script><script src="lumen/engine.js"></script>
<script src="lumen-decode.js"></script>
<script>
const q = new URLSearchParams(location.search);
const W = +q.get('w') || 720, H = +q.get('h') || 1280, SEC = +q.get('sec') || 8;
const P = decodeLMN(q.get('code'));            // port of decodeDesign
const c = document.getElementById('c'); c.width = W; c.height = H;
window.__ready = new Promise((ok, bad) => {
  const go = () => { Engine.setSize(W, H); ok(true); };
  setTimeout(() => bad(new Error('shader link timeout')), 60000);
  Engine.init(c, () => P, { autostart: false, onError: (e) => bad(new Error(e)),
    onReady: () => { if (!P.genomeOn) go(); },  // base shader has no genome styles
    onFullReady: go });
});
window.__framePNG = (t) => { Engine.renderAt((((t % SEC) + SEC) % SEC) / SEC); return c.toDataURL('image/png'); };
</script>
```

The phase is driven from our `--seconds`, so the design's own `loop` value is ignored and the Canvas length is whatever we ask; `travel` still sets how much it moves.

4. `loop-render.mjs` builds the URL as `file://<page>?offline=1&w=..&h=..&loop=1`, so the share code has nowhere to go. Add one passthrough arg (for example `--q code=LMN1...&sec=8`) appended to that query. That is the only change to our tool.
5. On GitHub Actions (Ubuntu): `loop-render.mjs` launches `channel: 'chrome'` with `--use-angle=metal`, which is Mac-only. On Linux use bundled Chromium with `--use-angle=swiftshader --enable-unsafe-swiftshader` (software WebGL2), install ffmpeg, and upload the `out` dir as an artifact. `KHR_parallel_shader_compile` may be missing under SwiftShader; the engine falls back to a timed link check, which is fine. Speed on SwiftShader is untested: chrome mode runs about five 8-octave fbm calls per pixel, so expect seconds per frame at 720x1280 and minutes for 192 frames. That is fine for a batch job. A batch is just a matrix of share codes.

Determinism: frame-stepped and pure in phase, so reruns on the same runner match. SwiftShader and a Mac GPU may differ by a few least-significant bits in the hash math; that does not matter for a loop.

## 4. The modes and the synthesizer

Nine fixed modes (`sceneFor` in `shaders.js`, recipes in `RECIPES` in `main.js`), all reading a 4-colour palette plus background:

| Mode | What the code draws | Canvas fit |
|---|---|---|
| 0 Liquid Chrome | fbm height field lit as metal: two speculars, Fresnel rim, iridescence, dark base | Good. Rich, slow, reads at phone size. Dark palettes. |
| 1 Silk Ribbons | parallel ribbon strands bent by a two-octave guide wave, cylinder normals, crevice shadow | Good. Calm, music-video backdrop feel. |
| 2 Soft Bloom | five Gaussian colour blobs on circular orbits over a warped field | Good for soft or ambient songs; plain on its own. |
| 3 Aura Rings | radial palette ramp from a seeded centre with an fbm wobble and one luminous ring | Good. Centred, so it suits the Now Playing crop. |
| 4 Light Rays | fbm-driven beams fanning from a point above the frame | Good, but the source sits above; check the top crop. |
| 5 Halftone | dot grid whose dot size follows a warped fbm field | Fair. Graphic, print-like; dot size depends on render size. |
| 6 Data Glyphs | 3x5 bitmap glyphs in a grid, swapped 8 times per loop with columnar shimmer | Weak. Busy and flickery; Spotify asks for no flashing. |
| 7 Reeded Glass | a bold colour field seen through vertical fluted glass | Good. The startup design (Ember palette) is this. |
| 8 Pixel Bloom | the bloom field quantized to big pixels | Fair. Pairs with our pixel-render look. |

Palettes (`palettes.js`): 16 curated, 10 dark (Inferno Chrome, Neon Silk, Ultraviolet, Ember, Deep Signal, Red Telemetry, Ghost Mono, Acid Garden, Tangerine Glass, Velvet Dusk) and 6 light (Blush, Prism Pastel, Sky Aura, Halo, Solar Flare, Glacier), plus `generateRandomPalette` (5 harmony schemes off a random base hue). Post stack in `main()`: chromatic fringe, glow knee, hue rotate, saturation, exposure, contrast, vignette, quantized grain.

Parameters (share-code numbers): hue, sat, exposure, contrast, scale, complex (fbm octaves 1 to 8), warp, flow, stretch, light, gloss, lightAngle, irid, glow, grain, cell, lines, ca, vig, soft, travel, loop.

The synthesizer (`generateGenomeStyle`, `sceneGenome`) is a 12-gene parametric style: 12 field types (FLUX, RIDGE, WAVE, RING, CELL, FLOW, BAND, GRID, HEX, ARC, HATCH, ORB), 7 domain ops (plain, polar, kaleidoscope, mirror, grid repeat, hex mirror, brick weave), 6 colour maps (ramp, cyclic, posterized, duotone, bands, angular sweep), 5 shadings (flat, embossed, glowing edges, contrast carve, glass sheen), 5 overlays (none, stripes, dots, scanlines, weave), plus warp, fold count, overlay scale, ridge sharpness, poster steps, field scale and rotation. The README undersells it (it says 6 x 5 x 4 x 4 x 4). It is a random draw, not an inventor: about half the hits are geometric (plaid, hatch, kaleidoscope) and look like screensavers. Kaleidoscope and hex-mirror with slow FLOW or RING fields are the ones I would try for music. The scanline overlay and the grain are tied to pixel size, so render at final size.

Which suit Canvas: Chrome, Silk, Aura, Reeded Glass and Bloom, slow (`travel` 0.3 to 0.6 over 8 s), dark palettes, with the subject kept off the edges. As a background layer under one song-specific element they are better than as the whole Canvas.

## 5. Recommendation, again

Borrow the technique first: add `loopnoise.js` (and its GLSL twin) to `tools/canvas-loop` so code-drawn and Blender loops can have continuous noise motion that still passes the seam test. Use LUMEN as a source only through the adapter route above, for a client who asks for an abstract loop or as a moving background layer, never through its WebM exporter. It is not a product to sell on its own: the live site gives the same output free to anyone.
