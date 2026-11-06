# Leonxlnx/shanshui: what is worth taking

Repo: https://github.com/Leonxlnx/shanshui, commit b5357c0 (Oct 19, 2026, morning Pacific). Read from a shallow
clone. LICENSE is MIT, "Copyright (c) 2026 Leonxlnx": we can copy code if we keep the notice
with it. Read only: nothing installed, built or run. Our side read from origin/main of
`~/Code/novadiem/indieagent/secondunit/mv-projects` without checkout.

## Recommendation

Borrow three renderer tricks now (frame forensics, dither before 8-bit, blur-then-grain accumulation) and keep the
ink pass and brush kit as the starting point for an "Ink-wash landscape" look, built only when a song asks for it.
Do not port the YUV streaming or the daemon for the cloud: our cloud bottleneck is the home download of the joined
video, which neither touches. The engine is clean and generic, but its vocabulary is landscape only (no people),
so it is a look kit, not a drop-in for an artist film.

## 1. The ink pass and the brush library

### Where

- `src/lib/inkfx.js` (36 lines): `inkify(api, src, {edge, granulation, bleed, grainScale, seed})`.
- `src/lib/brush.js` (222 lines): palette tokens and Canvas2D primitives.
- `src/engine/glsl.js`: shared GLSL noise (`vnoise`, `snoise`, `snoise3`, `fbm`, `ridged`, `streaks`, `worley`) and
  `paperField(px)`.
- `src/engine/engine.js`: `POST_FS` (the final "ink unify" plus paper fibre, grade, vignette, dither), `PAPER_BAKE_FS`.
- `docs/STYLE.md`: the painting rules and the measured palette. This is effectively their look recipe.

### How brushwork is baked

Every static element (pine, rock, peak, bridge, pavilion) is drawn once at build time with Canvas2D into an
OffscreenCanvas (`api.bakeCanvas(w, h, draw, {scale})`, in 1920x1080 design px times render scale times an optional
extra density for cards the camera pushes into). The canvas is uploaded as a texture with mipmaps
(`texFromSource`), then run once through `inkify`, a GLSL pass (`api.processTex`) whose output is another baked
texture. Per frame the engine only composites these cards; nothing static is redrawn. 57 calls to `inkify` across
the scenes and library.

The brush primitives in `brush.js`, all deterministic from a seeded rng:

- `stroke(ctx, pts, {width, profile, rough})`: Catmull-Rom path resampled every 3 px, offset left and right along
  normals by a pressure profile (`PROFILE.brush` swells fast then tapers, `taper`, `needle`, `leaf`, `even`) with a
  smoothed random wobble, filled as one polygon.
- `dryStroke(ctx, pts, {bristles, dry})`: many thin bristle lines across the width; a bristle breaks where noise
  falls under `dry * (0.55 + edgeness * 0.6 + s * 0.6)`, so outer bristles and the stroke's end run dry first.
- `blob` (irregular jittered polygon smoothed with quadratics), `dots` (moss dots, sqrt-distributed in a radius),
  `wash` (Canvas `blur()` fill plus a blurred, darker stroked rim for the wet edge), `granulate`
  (`destination-out` with a tiled value-noise pattern), `gradientFill`.
- `tone(v)`: linear mix from ink (v = 0) to paper (v = 1). All greys are ink diluted toward the paper colour, never
  neutral grey.

### Edge pooling and granulation (`inkify`)

Per pixel of the baked card (premultiplied):

1. Blurred alpha `ab`: 12 directions, two rings at `bleed * 2` and `bleed * 5` texels, weighted 0.6 / 0.4.
2. Wet edge: `rim = clamp((a - ab) * 2.5, 0, 1) * a`. Inside a stroke near its boundary the pixel's alpha exceeds
   the local blur, so `rim` is high there. Colour is darkened `col *= 1 - edge * rim * 0.6`: pigment pools at the rim.
3. Granulation: three octaves of value noise in design px (`p * 0.9`, `p * 2.3`, `p * 0.25`, weights 0.55 / 0.3 /
   0.15). Alpha is eroded by `granulation * (g - 0.35) * (0.6 + mid)`, where `mid = 4a(1 - a)` peaks in half-tone
   areas: pigment breaks up most in mid-tones, solid black and bare paper stay clean.
4. Bleed halo: outside the stroke, `halo = max(0, ab - a) * 0.35` adds a faint coloured fringe where ink wicked into
   the paper.

Defaults `edge 0.45, granulation 0.22, bleed 1.2`. Values used in the scenes cluster at edge 0.3 to 0.5,
granulation 0.12 to 0.3, bleed 0.8 to 1.2 (far, soft elements: edge 0.1, gran 0.1, bleed 0.5).

### Frame-level ink unify (`POST_FS`, `uInk`, default `ink: [0.32, 0.42, 1.4, 0]`)

Applied once to the whole composite:

- Edge wobble: the screen-space paper fibre field (`paperField`: fbm mottle plus two crossed `streaks` fibre
  directions minus specks, baked once into `paperTex`) is differentiated, and the source lookup is offset along that
  gradient by 0.42 px times 20 texels. Every edge in the frame wobbles along the same paper fibres, which ties
  separately baked cards together.
- Wicking: 8 taps at radius 1.4 px; `wick = min(c, mix(mean, min, 0.35) + 0.025)`, blended at 0.32. Dark ink creeps
  into lighter neighbours only (it can only darken).
- Then grade (exposure, saturation, contrast pivoting at 0.62, tint, lift toward paper), paper fibre texture
  `c *= 1 + paper * pf * (0.45 + 1.1 * dark)` (paper 0.045; texture is stronger in ink than on bare paper),
  vignette 0.10, and a triangular dither of 1 LSB (two hashes summed) to stop banding in mist gradients.

### Per-frame elements

Mist, cloud seas, sky, water, glitter, waterfalls (`src/lib/atmos.js`, `src/lib/water.js`) are `api.shader`
layers: GLSL evaluated every frame in rest-space design px, so the noise sticks to the world and parallaxes with its
card. Cranes, leaves and snow are `api.canvas` layers redrawn per frame (`src/lib/fauna.js`, `fauna/leaves.js`,
`fauna/snow.js`). Wind sway is a vertex/fragment displacement on texture cards (`sway: {amp, freq, anchor, power}`).

### Draft look recipe (catalogue format; do not commit until we have our own clip)

Our closest existing looks: `water` (watercolour bleed: per-frame shader that pools at drying edges and
granulates, colour palette) and `kawaii` (its wash pass is adapted from `water`). Neither is monochrome ink, value
ladder and mist. `woodcut` and `charcoal` share the cream paper and one-red rule but are flat or smudged, not wash.

```yaml
slug: ink-wash
title: Ink-wash landscape
note: Ink on warm rice paper, near rocks and pines in true black, far peaks dissolving into mist. One small red.
used: null            # fill when a piece uses it
cost: free
group: code
order: null
clip: null
tall: false
status: test
engine: canvas2d + webgl2
project: null
code:
  path: null
  note: >-
    Start from Leonxlnx/shanshui (MIT, keep the notice): src/lib/brush.js (strokes), src/lib/inkfx.js (inkify),
    POST_FS in src/engine/engine.js (ink unify, paper, dither), src/engine/glsl.js (noise, paperField).
rules:
  - Warm rice paper is the sky, the mist and the water; never pure white, never flat (fibre field in screen space)
  - Every grey is ink diluted toward the paper colour (tone v from 0 ink to 1 paper), never neutral grey
  - "Three distances: near mass in true black with crisp dry-brush contours (tone 0 to 0.15), midground tone
    0.35 to 0.55, far ranges tone 0.65 to 0.85 with no inner detail; contrast and edge sharpness fall with distance"
  - Mist (paper colour) separates every depth plane; the base of each mass dissolves into it
  - "Static brushwork is baked once, then inkified: wet edge 0.3 to 0.5, granulation 0.12 to 0.3 (mid-tones
    break up most), bleed halo 0.8 to 1.2 px"
  - "Whole-frame ink unify: edges wobble 0.4 px along the paper fibres, dark ink wicks 1.4 px into lighter paper"
  - Strokes have pressure (swell, body, taper); dry-brush bristles break at the edges and the stroke end first
  - Moss dots along ridges, vertical cun strokes on rock faces, pines as flat needle-fan pads
  - Red under 2 percent of the frame (pavilion columns, a maple cluster, a sun)
  - "Motion breathes: mist 5 to 25 px/s evolving in 3D noise, sway 1 to 5 px at 0.15 to 0.35 Hz, camera 8 to 35
    px/s with parallax by depth; nothing jitters"
  - Paint-in and paint-out by value (darkest ink first in, palest wash first out) instead of fades
  - 1 LSB triangular dither on the final frame so mist gradients do not band
palette:
  - "#efe7dc"   # paper
  - "#fae9cb"   # golden paper
  - "#f0eae2"   # snow paper
  - "#0b0906"   # warm ink black
  - "#cdc7be"   # mist shadow
  - "#b22e20"   # vermilion
  - "#c43a28"   # maple
  - "#ecc478"   # gold sun
reference: Chinese shan shui ink-wash painting; technique studied from Leonxlnx/shanshui (MIT)
proof: { renders: [], pr: [], youtube: [] }
verdict: null
related: [water, woodcut, charcoal]
```

## 2. The render path

### YUV readback and streaming to ffmpeg

- `src/main.js` `api.streamFilm({from, to, fps, samples})`: for each frame, `film.prepare(T)` (build or dispose
  scenes), `film.renderAt(T, {target: eng.targets.tmp})` into an RGBA16F target, then `eng.readYUV(tmp)`.
- `src/engine/engine.js` `readYUV` with `YUV_FS`: a fragment shader draws into an RGBA8 target sized
  (W / 4) x (1.5 H). Each output texel computes 4 consecutive bytes of the planar yuv420p buffer (`byteAt(idx)`):
  the first W x H bytes are Y (BT.709 limited range, 16 + 219 * luma), then U, then V, each averaging a 2x2 block.
  A small hash dither (half an LSB) is added before rounding. One `gl.readPixels` returns exactly the yuv420p frame:
  3.1 MB for 1080p instead of 8.3 MB of RGBA, and no CPU colour conversion.
- The buffer goes over a WebSocket (`ws` server on the tool's own static server, path `/frames`) to Node.
  `tools/render.mjs` writes each message to ffmpeg's stdin (`-f rawvideo -pix_fmt yuv420p -color_range tv
  -colorspace bt709 ... -i -`, libx264 slow, CRF 16, tune film) and acks with `'k'` once stdin accepted it
  (back-pressure through `drain`). The page keeps at most two frames in flight (`waitAck(f - 1)`), so the GPU draws
  frame n+1 while frame n is in transit. Nothing touches disk but the MP4. (The comment at the top of render.mjs says
  "raw RGBA"; the code is yuv420p.)

Would it help us?

- Cloud render: barely on the thing that hurts. The home download (~0.46 MB/s) is the joined video, set by CRF and
  length, not by frame transport. On the runner it would save, per frame: `toDataURL` JPEG encode in the page, base64
  through CDP, a JPEG file write, ffmpeg's JPEG decode, and one JPEG generation (q 0.93) before x264. For a heavy
  WebGL look drawn by SwiftShader the drawing dominates and this is noise; for a cheap Canvas2D look it might cut
  runner time by 10 to 30 percent (estimate, not measured).
- HyperFrames: does not apply. `hyperframes render` and our HF path in `render-slice.mjs` take a CDP screenshot of
  DOM; there is no GL target to pack.
- Local renders (`tools/motion-lab/render.mjs`): would remove the `out.mp4.frames` JPEG folder and the generation
  loss for WebGL looks. Canvas2D looks could use it by uploading the canvas to a texture and running the pack shader.
- Port cost: 1 to 2 days (pack shader is copyable as is; new transport in render-slice.mjs and render.mjs, a new
  optional page hook beside `__frameJPEG`, and the slice encode reading stdin). Low priority.

### The warm render daemon (`tools/daemon.mjs`, `tools/lib.mjs`)

Keeps one headless Chrome open with a persistent profile (`out/.chrome/daemon`, so the GPU shader cache survives),
serves the repo on 127.0.0.1:7781, and takes JSON jobs on `POST /job`. Each job gets a fresh page (so edited ES
modules reload), up to 6 pages at once, 240 s timeout. `tools/still.mjs` pings `/ping` and uses the daemon when
present (2 to 3 s per still), else launches Chrome itself (~20 s). It keeps the browser process, the GPU process and
its compiled-shader cache alive; it does not keep scenes or bakes between jobs.

Would it help us? Not the cloud (runners start fresh every run). It would help local iteration on the Intel Mac:
`audit.mjs`, `views.mjs` and stills each pay a Chrome launch through `frames.mjs launch()`. Port cost: about half a
day (a ~60-line server around our `openLook`/`frame`, plus a ping-and-fallback in the tools). Medium value.

### Sub-frame motion blur

`src/film.js` `Film.renderAt(T, {samples, shutter = 0.5, fps})` and `Engine.renderSceneFrame`: n sub-frames at
`T + ((i + 0.5) / n - 0.5) * shutter / fps` (centred, 180 degree shutter, same as our `--shutter`), each fully
composited (scenes, transition, overlays) and added into an RGBA16F `accum` target with gain 1/n by GL blending.
The final pass (paper fibre, vignette, dither) runs once, after the accumulation, so grain and dither are never
blurred. `film.prepare` keeps a 0.05 s tail so sub-frames before T still have their scenes. It averages
display-referred values, not linear light; ours (`frames.mjs average`) is linear and more correct.

Would it help us? The idea worth taking is the order: blur the raw picture, then add grain and dither. Our
`blurFrame`/`average` averages finished frames, so any paper grain or boil in a look gets smeared. The second gain
is speed: ours does a JPEG encode (q 0.97), fetch, decode and `getImageData` plus a JS loop per sub-frame; theirs
stays on the GPU. Port: an optional look hook (say `window.__frameBlur(t, n, shutter)`) that WebGL looks implement
with a float accumulator and their own post after it; `frames.mjs` uses it when present. About a day, for WebGL
looks only. Canvas2D looks can at least skip the JPEG round trip by averaging `getImageData` directly.

### Frame forensics (`tools/forensics.mjs`, 77 lines)

Decodes the MP4 to 160x90 grey with ffmpeg, then:

- pops: frame i differs from both neighbours (min of the two steps > 1.2 mean abs diff and > 3x the diff between
  i-1 and i+1, + 0.5). A single bad frame.
- jumps: a step larger than max(1.0, 4x the median step over the surrounding 30 frames), outside transitions. A
  motion lurch.
- holds: more than 0.8 s with step < 0.02. A freeze.
- luminance dips: mean luma more than 25 percent under the max within one second (sampled 6 times a second).
- Transition windows (from `SHOTS` in `src/timeline.js`) are flagged or skipped so intended cuts do not count.

What we already have: `tools/cloud-render/badframes.py` (black lower-right quadrant from a mis-scaled worker),
`tools/motion-lab/flashcheck.py` (WCAG flashes), and the cloud join's frame-count and max-hold checks. Pops and
jumps are new to us, and they are exactly what a slice seam produces when a look carries state between frames
(frame 0 of slice k drawn without the history slice k-1 had). Port: an hour or two in Python with numpy next to
badframes.py, taking an optional cut list (beat or cut times) instead of SHOTS. High value, low cost. Run it in the
join job on the joined film, so the Mac downloads nothing extra.

### Dither before 8-bit

Both `POST_FS` (1 LSB triangular, two hashes) and `YUV_FS` (half LSB) dither before quantising. Soft paper and mist
gradients band in 8-bit and then band worse after x264. Any of our looks with large soft gradients (washes, haze,
sky) can add the same two-line dither to their final pass. Minutes per look.

## 3. Pure function of t? GPU or SwiftShader?

Pure: yes, by contract and in practice. `docs/ENGINE.md` requires scenes to be pure in scene time for t in [-3, 14]
with seeded rng only; `grep` finds no `Math.random` and no `Date.now` in scenes, lib or transitions (the
`performance.now` calls are build-time logging). `layer.update(t, layer)` hooks recompute from t (e.g. the s05 sun
sinks `1.6 * t`). `Film.prepare(T)` builds whatever the shot list needs at T from seeded code, so any frame renders
alone and the film is renderable out of order and sliceable. A slice pays the bake cost of the scenes it touches
(one or two scenes per 6 s of film).

What it would take on our runners: a shim page that calls `__api.init`, `loadFilm`, and exposes `__ready` and
`__frameJPEG(t)` as `prepare(T)` + `renderAt(T)` + `canvas.toDataURL`. Half a day. `tools/lib.mjs` hard-codes
`--use-angle=d3d11` (Windows); our `frames.mjs` already passes `--use-angle=metal` on the Mac and nothing on runners.

GPU: needs WebGL2; it asks for `EXT_color_buffer_float` and falls back to RGBA8 targets without it
(`createTarget`, `gl.__floatOK`), so it would still run but with coarser accumulation. Headless Chromium on a
GitHub runner draws WebGL through SwiftShader, which supports WebGL2. Speed is the question and I could not measure
it (no running allowed). Their per-frame budget is 40 ms at 1080p on a Radeon 780M iGPU, with several full-frame
fbm shader layers (mist, sky, water) per scene plus heavy GLSL bakes (`inkify` is 24 texture taps per pixel on
every card). A rough guess for SwiftShader on a 2-core private-repo runner is one to several seconds per frame at
720p, and bakes of a minute or more per scene. That would still fit 20 slices for a one-minute film, but measure one
still on a runner before planning on it. On the Intel MacBook GPU the same frame is probably 100 to 300 ms at
1080p, so a local render may beat the cloud for this one; the Mac's limit is heat and memory, not this code.

## 4. Size and tangle

About 25,000 lines in 1.6 MB of `src` plus 76 KB of tools; `package.json` has two dev dependencies
(`puppeteer-core`, `ws`).

- Engine, generic, no imports from film content: `src/engine/engine.js` 573, `gl.js` 159, `glsl.js` 132,
  `rng.js` 119 (~980 lines). Parallax cards on a 2.5D camera, bakes, reflections, sway, grade, YUV.
- Painter's kit, generic within landscape: `brush.js` 222, `inkfx.js` 36, then `pine` 1114, `rock` 1092, `water`
  1039, `peaks` 983, `flora` 979, `atmos` 651, `fauna` 617 (+ leaves, snow), `architecture` 1452, `seal` 89
  (~8,300 lines). Each imports only `engine/rng.js`, `engine/gl.js`, `brush.js`, `inkfx.js`. Parameterised
  (`makePine(api, {x, y, height, lean, bend, reach, seed})`, `makeMist(api, {top, lobe, drift, ...})`).
- Film content, tightly bound: `src/scenes/` (~12,000 lines) hard-codes coordinates matched region by region to ten
  reference paintings that are not in the repo; `src/transitions/index.js` 334 (generic two-texture shaders, a few
  with focus points tied to specific scenes); `film.js` 186, `timeline.js` 37, `tools/audio.mjs` 686 (soundtrack).
- `src/lab/` (~45 small scenes) shows each element alone; good documentation by example.

So the engine and kit lift out cleanly. What does not exist: people, animals other than cranes, any figure we could
put a musician in. A rope bridge has an optional tiny figure; that is all.

## 5. Recommendation

Borrow renderer tricks now: port `forensics.mjs` pops and jumps into a `tools/cloud-render` check run in the join
(catches slice-seam bugs we cannot see today), add the 1-LSB dither to looks with soft gradients, and when a WebGL
look needs motion blur, accumulate on the GPU and add grain after the blur. Keep `brush.js`, `inkfx.js` and the
`POST_FS` ink unify as the base of an "Ink-wash landscape" look, written up from the recipe above when a song wants
mountains, mist and water; it fits code-drawn interludes and title plates, not a performer film, because the library
has no figures. Skip the YUV pipe and the daemon for the cloud (they do not touch the download bottleneck); the
daemon is a nice-to-have for local stills on the Intel Mac.
