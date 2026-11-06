# Look: depth

Measured 2026-11-02 for the devweb look bible (look-bible step 1, topic `depth`). References: cinetic's four example
films (quire, kiln, ledgerly, halden), the quality bar; the 20-shorts study's depth notes as a second, text-only
reference. Ours: episode 1 draft 6 (the approved oner) and episode 5 finish d2. Scripts, data and sheets:
`.bureau/runs/20261102-devweb-look-bible/look/depth/` in this worktree (called `DEPTH/` below).

## 1. Verdict

Cinetic's films are flat 2D staging: one sharp plane, no lens blur on a held frame, no fog. Their depth craft is
**where the eye is allowed to go**: a small lit subject in a big empty field, everything else dimmed. Ours is a real
3D world with more planes than cinetic ever uses, but every plane is equally sharp and almost none recede, so the
edge energy spreads over the whole frame. The biggest gaps:

1. **Attention area.** The share of the frame's 60 px tiles that hold 80 % of its edge energy: refs **0.16** (median,
   530 frames), ep 1 **0.52**, ep 5 **0.31**. The top tenth of tiles carries **0.60** of the energy in the refs,
   **0.36** in ep 1 and **0.35** in ep 5.
2. **Empty frame.** Share of tiles that are flat colour (luma range under 0.03): refs **0.70**, ep 1 **0.49**, ep 5
   **0.50**. Tiles that are flat and at the background's own luma: refs **0.53**, ep 1 **0.44**, ep 5 **0.48**.
3. **Nothing recedes in ep 5.** Fog on the subject is **0.00** at the median camera key and at most **0.13**; the
   back wall gets at most **0.16** (`world.js` fog near = max(30, d - 12), far = near + 95, against camera-target
   distances of 8-61 units). Ep 1's stage fog (14-70) put the mass moment's crowd at **0.50-1.00** fog and was the
   one shot where depth read. The refs have no fog to measure (flat 2D): unmeasured, not zero.
4. **Static background blur: no gap against cinetic, an open one against the 20 shorts.** Held frames with a soft
   background (5 % or more of content tiles at sigma 3.5 px or more): refs **0.01**, ep 1 **0.00**, ep 5 **0.00**.
   Every soft frame in the refs is directional motion blur on a moving element (median sigma **5.0 px**; checked by
   eye on `DEPTH/crops/quire_t6p2.png` and `kiln_t22p8.png`). The 20 shorts use "soft depth of field on
   backgrounds" in 3D toon sets, which is our case, but their radius is **unmeasured** (the study kept no numbers).
5. **Inactive elements are not dimmed enough.** Kiln's inactive node fill sits **+0.09** luma off the background,
   its active node **+0.36**: a quarter. Ep 5's column shows 6-15 cards at the same blue outline and fill as the
   card the line is about (by eye on the sheets; the tile metric `dim` does not separate them, see section 3). The
   share of tiles that are sharp content says the same: refs **0.31**, ep 1 **0.31**, ep 5 **0.49**.

## 2. Method

- **Frames.** Refs every 6th frame (10 per second): quire 120, kiln 250, ledgerly 100, halden 60 = 530. Ours every
  15th frame (4 per second): ep 1 182, ep 5 519. Ours are masked to y 130-1560 (the header band and the caption
  band are type, not world); refs unmasked (their type is the content, and they carry no burned captions). All
  sizes are px on the 1080 short side, which every file shares.
- **Blur per tile** (`DEPTH/depthlib.py`, `measure.py`). 60 px tiles. At each edge pixel (local maximum of the Sobel
  magnitude above 0.02 luma/px) the gradient ratio before and after a 2 px reblur gives sigma = 2 / sqrt(r^2 - 1)
  (Zhuo and Sim's defocus estimate; contrast-free). The tile's sigma is the median over its stronger edge pixels, at
  full size and at half size, mapped to true sigma by a calibration on synthetic shapes and text blurred by known
  amounts and passed through H.264 crf 17 (`calibrate.py`, `calib2.py`, `calib3.py`; results in `calib3.txt`):
  medians land within 10 % of truth from 1 to 20 px, single tiles scatter about 30 % above 5 px. Bins: sharp under
  1.6, slight 1.6-3.5, soft 3.5-8, heavy 8 and up. "Planes" per frame = bins holding at least 3 tiles and 4 % of
  the content tiles.
- **Moving vs held.** Camera speed per frame from sub-pixel phase correlation of frame n against n+1 (masked for
  ours). Held = under 2 px/f, so a 180-degree shutter adds under 1 px of blur. Element motion inside a held frame
  still reads as blur, which is why every soft held frame was checked by eye.
- **Attention and emptiness** (`hierarchy.py`). Per tile: luma range C (p98 - p2) and edge energy E (mean Sobel
  magnitude). `e80` = share of tiles holding 80 % of E; `top10` = share of E in the top tenth of tiles; `flat` = share
  with C under 0.03; `near_bg` = flat and within 0.03 of the frame's modal flat luma; `dim` = median C of content
  tiles outside the focus over the median C of the focus tiles. Eye check: `DEPTH/crops/e80_check.jpg` (green =
  the tiles holding 80 %).
- **Fog in ours, from the code** (`fog_from_code.py`, `fog_from_code.txt`): three's linear Fog factor at each camera
  key's target and at ep 5's back wall (z -2.7), and at ep 1's 34 crowd Blinks in the mass-moment wide. Ep 1: 20 of
  its 22 keys parse (two use `CARD.x` expressions).
- **Drop shadows** (`shadow_profile.py`): luma profile outward from a ledgerly card edge.
- **Dimming** (`dimming.py`): luma inside kiln's active and an inactive node at 6.0 s.
- **Side by side:** `DEPTH/crops/depth_sheet.jpg` (ours on top: ep 1 at 3, 20, 33.5 s; ep 5 at 10, 60, 110 s; refs
  below at one height), plus the 8- and 12-frame strips `crops/strip_*.jpg`.

## 3. Tables

Generated by `DEPTH/report.py` (`report.md`, `report.json`). Held-frame metrics use held frames only.

| metric | quire | kiln | ledgerly | halden | **refs** | **ep 1** | **ep 5** |
|---|---|---|---|---|---|---|---|
| frames sampled | 120 | 250 | 100 | 60 | 530 | 182 | 519 |
| held frames (under 2 px/f) | 113 | 234 | 73 | 49 | 469 | 161 | 325 |
| share of frames moving | 0.06 | 0.06 | 0.27 | 0.18 | 0.12 | 0.12 | 0.37 |
| soft background, all frames | 0.04 | 0.02 | 0.01 | 0.00 | 0.02 | 0.00 | 0.00 |
| soft background, held frames | 0.02 | 0.00 | 0.00 | 0.00 | 0.01 | 0.00 | 0.00 |
| soft sigma px, held (median) | 10.98 | 5.76 | n/a | n/a | 5.77 | n/a | n/a |
| soft sigma px, held (p90) | 15.14 | 5.76 | n/a | n/a | 14.10 | n/a | n/a |
| soft sigma px, moving frames | 7.27 | 4.98 | 3.95 | n/a | 4.98 | n/a | n/a |
| sharp-plane edge sigma px (p90) | 0.19 | 0.12 | 0.00 | 0.11 | 0.11 | 0.78 | 0.37 |
| coverage large: share | 0.73 | 0.73 | 1.00 | 0.00 | 0.70 | 0.95 | 0.95 |
| coverage large: soft share | 0.01 | 0.00 | 0.00 | n/a | 0.00 | 0.00 | 0.00 |
| coverage large: soft sigma px | 16.18 | n/a | n/a | n/a | 16.18 | n/a | n/a |
| coverage medium: share | 0.24 | 0.19 | 0.00 | 0.29 | 0.18 | 0.05 | 0.05 |
| coverage medium: soft share | 0.04 | 0.00 | n/a | 0.00 | 0.01 | 0.00 | 0.00 |
| coverage medium: soft sigma px | 5.77 | n/a | n/a | n/a | 5.77 | n/a | n/a |
| coverage small: share | 0.04 | 0.08 | 0.00 | 0.71 | 0.12 | 0.00 | 0.00 |
| coverage small: soft share | 0.00 | 0.06 | n/a | 0.00 | 0.02 | n/a | n/a |
| coverage small: soft sigma px | n/a | 5.76 | n/a | n/a | 5.76 | n/a | n/a |
| focus planes per frame (mean) | 1.14 | 1.04 | 1.00 | 1.02 | 1.06 | 1.06 | 1.07 |
| frames with 2+ focus planes | 0.13 | 0.03 | 0.00 | 0.02 | 0.05 | 0.06 | 0.07 |
| focus x (0 left, 1 right) | 0.46 | 0.50 | 0.49 | 0.49 | 0.49 | 0.47 | 0.47 |
| focus y (0 top, 1 bottom) | 0.48 | 0.55 | 0.48 | 0.50 | 0.51 | 0.45 | 0.44 |
| focus y, IQR | 0.46-0.52 | 0.50-0.62 | 0.45-0.49 | 0.49-0.52 | 0.47-0.55 | 0.40-0.50 | 0.41-0.46 |
| focus inside the central third | 0.98 | 0.91 | 1.00 | 0.98 | 0.95 | 0.93 | 0.90 |
| sharp content share of tiles | 0.26 | 0.47 | 0.51 | 0.05 | 0.31 | 0.31 | 0.49 |
| frames with soft tiles on the frame ring | 0.01 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| flat share (median) | 0.74 | 0.53 | 0.49 | 0.96 | 0.70 | 0.49 | 0.50 |
| flat share p10 | 0.68 | 0.26 | 0.32 | 0.95 | 0.32 | 0.36 | 0.16 |
| flat share p90 | 0.91 | 0.95 | 0.76 | 0.99 | 0.95 | 0.66 | 0.76 |
| near-background share | 0.40 | 0.53 | 0.38 | 0.96 | 0.53 | 0.44 | 0.48 |
| e80 | 0.16 | 0.23 | 0.18 | 0.03 | 0.16 | 0.52 | 0.31 |
| top10 | 0.63 | 0.44 | 0.55 | 1.00 | 0.60 | 0.36 | 0.35 |
| dim | 0.98 | 0.78 | 0.21 | 0.99 | 0.85 | 0.72 | 0.77 |

What the rows mean, and which ones to trust:

- **Soft background, all and held.** Share of frames with 5 % or more of content tiles at sigma 3.5 px or more. The
  refs' few soft frames are motion (quire 6.2 s and 8.2-8.6 s: the day row sliding; kiln 20.5-22.9 s: the logo
  sliding in; ledgerly 8.5 s: the cards regrouping). No ref holds a lens blur.
- **Blur radius by shot size.** "Coverage" stands in for shot size on these flat films: large = sharp content in 15 %
  or more of tiles, medium 5-15 %, small under 5 %. Soft frames per class are 0-7, so the radius by shot size is
  **unmeasured** (too few frames); the moving-frame radius (median 5.0 px, quire 7.3, kiln 5.0, ledgerly 3.9) is the
  usable number.
- **Planes.** Per frame, the count of blur bins in use: refs mean 1.06, ep 1 1.06, ep 5 1.07. This counts focus planes,
  not staged layers. By eye (sheets): quire 2 layers (dark ground, one card), kiln 1-2 (ground, node grid), ledgerly 2
  (ground, cards lifted by a soft shadow), halden 1; ep 1 3-4 (ground, floor grid, Blink and harness, cards; the
  crowd adds a fifth), ep 5 3-4 (shaft wall, column, Blink's ledge, toolbox or folders). Ours stage more layers than
  cinetic and render them all in one focus plane.
- **Focus position.** Contrast-weighted centroid of sharp tiles (0-1 across and down the full frame): refs (0.49,
  0.51), 95 % of frames inside the central third; ep 1 (0.47, 0.45), 93 %; ep 5 (0.47, 0.44), 90 %. Ours sits 6 % of the frame higher because
  the caption band is masked out. Not a gap.
- **Edge sharpness of the sharp plane** (`content_sigma_p90_held_med`): refs 0.11 px, ep 1 0.78 px, ep 5 0.37 px. Cinetic draws
  vectors; ours are antialiased toon meshes blended 120 to 60 fps. The cause is unmeasured; it matters only in that
  a depth-of-field pass needs a crisp focus plane to contrast against.
- **Foreground framing.** Frames with 3 or more soft tiles on the outer tile ring: refs 0.00, ours 0.00. No ref puts
  an out-of-focus object in front of the subject, and our ep 3 rule ("park props the camera passes close to") agrees.
- **Dim.** Noisy across styles (ledgerly 0.21 is dark text on white cards against faint card edges); ours read lower
  than the refs on it, so it is not used for a target. The kiln pixel measure in section 1 is the number to use.
- **Shadows.** Ledgerly lifts its cards with a soft drop shadow: -0.07 luma at the card edge, -0.04 at 12 px, -0.02
  at 30 px, gone by 60 px, on a 0.91 ground. The dark films (quire, kiln) use none. On our #0d1117 ground a dark
  shadow cannot read; the light equivalent is in the recipe.
- **20 shorts** (text only): "soft depth of field on backgrounds", 3D toon sets, light pools. No blur radius, fog or
  plane count was recorded: all **unmeasured**.

## 4. Recipe in our stack

We take cinetic's discipline (one sharp subject, an empty field, the rest dimmed) and get it the way a 3D world
should, with fog and a depth-of-field pass, which is what the 20 shorts do in their 3D sets. Palette, Blink, one world
and one camera stay ours. Every value below marked *start* is a design value to set by eye on a contact sheet, not a
reference measurement; the measured targets that judge it are in 4.5.

### 4.1 Fog keyed to the focus distance (`world.js`, used by every episode)

Replace ep 5's `near = max(30, d - 12), far = near + 95` (which never fogs anything) with fog that starts just
behind whatever the camera looks at:

```js
// world.js: fog from the camera-target distance d, so the subject is clear and what is behind it recedes
export function focusFog(scene, d, { near = 1.1, far = 2.6, min = 6 } = {}) {
  scene.fog.near = Math.max(min, d * near); scene.fog.far = Math.max(scene.fog.near + 4, d * far);
}
```

Call it every frame from the episode's `render(t)` with d = camera to target (ep 5's `targetAt(t)` already gives it;
lift `targetAt` into `cameraPath` so every episode has it). *Start* values `near 1.1`, `far 2.6`: the subject gets 0,
a layer at 1.4 d gets 0.20, at 2 d 0.60, at 2.6 d it is gone into #0d1117. Fog colour stays the background colour
(fogged objects turn into empty frame, which is gap 2). Ep 1's crowd (0.50-1.00 fog) is the proof it reads. Glow
sprites and panels on `MeshBasicMaterial` take fog only if `fog: true` (the default); keep it on for everything
except the focus station's type.

### 4.2 A depth-of-field pass (`kit/dof.js`, new; called from the episode's `render(t)`)

Depth-aware blur from three's depth buffer, no temporal state (HyperFrames seeks frames in any order):

- Render the scene into a `WebGLRenderTarget` at canvas size with a `DepthTexture`, then two full-screen passes
  (horizontal, vertical) of a 13-tap Gaussian gather whose sigma per pixel is the circle of confusion
  `coc = min(10, A * abs(1 - zf / z))` px, z = view depth from `perspectiveDepthToViewZ`, zf = camera-target
  distance. In each tap, drop samples that are nearer than the centre pixel and sharper than it (`tapCoc <
  centreCoc && tapZ < centreZ`), or the sharp subject bleeds a halo into the blurred wall. Composite to the canvas,
  then the finish's 120-to-60 blend runs as now.
- **Aperture per camera key.** Add a fifth element to `KEYS` rows, `A` in px, eased between keys like fov
  (`cameraPath` returns it). *Start* values by camera-target distance: close (under 12 units) **A 10**, medium
  (12-25) **A 6**, wide (over 25) **A 0** (deep focus: a wide shows the world, as cinetic's wides are all sharp).
  At A 10 with the focus at 10 units, a wall 4 units behind gets sigma 2.9 px, the far shaft 10 px.
- **Panels must write depth** or the pass blurs every card as if it stood on the far plane: in `world.js`
  `panel()`, give the material `alphaTest: 0.5` and set `depthWrite = opacity > 0.98` (the ep 1 fade rule, now for
  panels too). Additive glows keep `depthWrite: false`; they take the blur of what is behind them, which is fine.
- **Never blur the type overlay** (DOM, above the canvas) or the end card.
- Moving elements already get motion blur from the finish's 180-degree shutter; the refs' moving-element blur
  (median sigma 5.0 px) is what that shutter gives at about 10 px/f, so `finish.sh` needs no change.

### 4.3 How stations layer (`crew-production-design.md`, `crew-dp.md`, the episode's `stations/*.js`)

- **One sharp station per beat.** Camera target = the station the line is about; that sets zf for fog and focus.
- **Space layers in depth by the focus distance, not by a fixed gap.** A back layer needs to sit at 1.4 d or more
  behind the camera to get fog 0.2 and a visible blur; ep 5's wall sits 4 units behind the column (1.13-1.4 d at its
  close keys), so it would barely move. *Start*: back walls and idle stations at least 0.5 d behind the focus
  station for the beat's closest key.
- **Two to three layers on screen, never one flat wall of equal cards.** Cinetic uses 1-2; our 3D world earns a third
  only if it is fogged or soft.
- **Dim what the line is not about.** Inactive cards and labels: fill and outline at a quarter of the active one's
  luma offset from the background (kiln: +0.09 against +0.36). For ep 5's column that is the 6-15 neighbours of the
  named card, eased over 0.25 s when the line moves on.
- **Floor grid off or faint.** Ep 1's `GridHelper` (opacity 0.55) speckles energy across the whole lower half
  (`DEPTH/crops/e80_check.jpg`, third frame). With 4.1's fog it fades by distance; *start* opacity 0.25 within 2 d.
- **No foreground occluders.** Refs 0 %, ours 0 %: keep it. A prop nearer than 0.6 d would get coc over 0.67 A
  and turn into a blob; park it (ep 3 rule).
- **Lift a card on a lit panel with a light rim, not a shadow.** Ledgerly's shadow is -0.07 luma at the edge, gone by
  60 px, on a 0.91 ground. Our ground is 0.07: the mirror is a +0.05 luma halo around a card that sits in front of
  another panel, 30 px wide, only where two layers overlap. *Start* value; check on a sheet.

### 4.4 Where each value lives

| value | file |
|---|---|
| `focusFog(scene, d, {near 1.1, far 2.6})`, `targetAt` in `cameraPath` | `tools/devweb-kit/world.js` |
| `panel()` alphaTest 0.5, depthWrite when opaque | `tools/devweb-kit/world.js` |
| DOF pass, `coc = min(10, A·abs(1 - zf/z))`, 13 taps, near-sharp rejection | `tools/devweb-kit/dof.js` (new) |
| aperture A per key (10 / 6 / 0 by distance) | `crew-dp.md` (camera keys) |
| one sharp station per beat, layers 0.5 d behind, dimming to a quarter, grid 0.25 | `crew-production-design.md` |

### 4.5 Measured targets (check with `DEPTH/hierarchy.py` on a snapshot sheet or the master)

| metric | refs | ep 1 | ep 5 | target |
|---|---|---|---|---|
| e80 (share of tiles holding 80 % of edge energy) | 0.16 | 0.52 | 0.31 | 0.25 or less |
| top10 (energy in the top tenth of tiles) | 0.60 | 0.36 | 0.35 | 0.50 or more |
| flat share | 0.70 | 0.49 | 0.50 | 0.60 or more |
| near-background share | 0.53 | 0.44 | 0.48 | 0.50 or more |
| fog on the layer behind the subject | unmeasured | 0.00 at the median key | 0.00 median, 0.16 max | 0.20 at 1.4 d |
| held frames with a soft background | 0.01 | 0.00 | 0.00 | close and medium shots only, wides 0 |
| foreground soft tiles on the frame ring | 0.00 | 0.00 | 0.00 | 0 |

Run: `<viralvision venv python> -I hierarchy.py <master.mp4> <name> 15 --ours`, then read `<name>_hier.json`.

## 5. Top five changes, by visual impact

1. **Focus-keyed fog** (`world.js`, 4.1): the cheapest change and the one that empties the frame (gap 2) and pushes
   ep 5's wall back (gap 3). One function, every episode.
2. **Dim what the line is not about** (4.3): ep 5's column and ep 1's harness tools at a quarter of the active
   element's offset. Closes most of gap 1 without any new pass.
3. **DOF pass on close and medium keys** (`dof.js`, 4.2): A 10 close, 6 medium, 0 wide, with panels writing depth.
   This is the 20 shorts' 3D look; cinetic gets the same effect by having nothing behind the subject.
4. **Layer spacing by focus distance** (4.3): back layers at least 0.5 d behind the focus station, so fog and blur
   have something to act on.
5. **Floor grid at 0.25 and fogged** (4.3): removes the speckle that holds ep 1's e80 at 0.52.
