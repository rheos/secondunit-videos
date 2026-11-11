# The cast: guard, hands, seed, pine

Flat paper cut-outs for the paper-world look (test 02), as three.js r160 modules. Each piece is a card with a
little thickness and a paler cut edge. Nothing here imports the world's kit: every builder takes the caller's
`paper(colour)` material factory, where `colour` is a `"#rrggbb"` string. Card UVs are in cm divided by
`opts.grain` (default 4), so the paper texture must wrap.

Proof stills are in `out/paper-world/lineup/`. This replaces test 01's guard cap (it read as a baseball cap) and
its hand (`out/papersilhouette/check/f2835.jpg`, `f3212.jpg`).

## Files

| File | What it holds |
|---|---|
| `index.js` | every export, in one place |
| `guard.js` | the prison officer and the citizen: parts, rig, poses, planted walk |
| `outlines-guard.js` | head, peaked cap and badge outlines, plus test 01's cap for the before / after print |
| `hand.js` | the 21-joint skeleton, both hands, their outlines and pieces |
| `seed.js` | the winged seed and the pop-up pine |
| `card.js` | card geometry (face, back, cut edge as three material groups), the material cache, hinges |
| `shape2d.js` | 2D tools: corner fillets, splines, signed distance fields, marching squares, ASCII print |
| `../../lineup.html` | the line-up page, with its own simple paper and stage |
| `../../tools/lineup.mjs` | the still tool |

## Exports

Every `make*` returns a `THREE.Group` in centimetres. The group also carries `.pose` and `.group`, so both
`const g = makeGuard(...); g.pose(g, {...})` and `const { group, pose } = makeGuard(...)` work. The named pose
functions do the same job. Poses are pure: the same parameters always give the same joints. Rig internals sit on
`group.cast`, and `group.userData` holds plain values only, so build one group per figure instead of cloning.

### `makeGuard(THREE, paper, opts)` and `poseGuard(group, params)`

A jointed puppet in profile, facing +x, feet on y = 0, origin between the feet. Authored in head units
(H = chin to top of skull, 7.5 H tall) and scaled to `height`.

| opt | default | meaning |
|---|---|---|
| `height` | 4 | cm to the top of the skull (the cap adds 0.08 H) |
| `thickness` | 0.08 | cm, each card |
| `colour` | `#1f2755` | the face seen at turn 0 |
| `back` | same as `colour` | the other face, seen past 90 degrees |
| `role` | `"guard"` | `"guard"` or `"citizen"`: which kit shows by default |
| `badge` | `#f1b23a` | the shield on the cap, the only accent |
| `edge` | 0.32 | how far the cut edge is pulled toward the white core (0 to 1) |
| `grain` | 4 | cm per texture repeat |

| param | meaning |
|---|---|
| `stance` | `"ease"` (hands behind the back, chest out, chin up: pride), `"walk"`, `"stand"` |
| `phase` | 0 to 1 along the walk cycle. Move the group `stride * phase` and the stance foot stays put |
| `turn` | degrees the card has turned about its vertical axis. At 90 it is edge on |
| `guard` | true or false: cap, belt gap, keys, baton, epaulette, jacket. Defaults to the role |
| `head`, `lean`, `keys`, `baton` | degrees, to override what the stance sets |
| `stride` | head units per cycle, default 4.4. `group.userData.stride` is the default in cm (2.35 at 4 cm) |

A citizen becomes a guard by turning the card: build with `{ role: "citizen", colour: citizenColour, back: guardColour }`
and pose with `{ turn, guard: turn >= 90 }`, so the kit swaps while the card is edge on.

The cap follows the brief's numbers: band 0.10 H, crown 1.30 head depths wide and overhanging the band at back and
front, 0.26 H tall at the back rising to 0.38 H at the front peak, top flat at the back and rising in one curve,
visor 0.26 H long at 25 degrees down and thicker at the root. Uniform: squared shoulders with an epaulette, jacket
to the hip, the belt as a cut gap, a breast pocket cut, a key ring with two keys, a baton, straight trousers with
the hem above the ankle, a boot with a heel.

Also exported: `capOutline(overrides)`, `headOutline({ capped })`, `badgeOutline()` (head units, origin under the
chin, x forward), `guardParts()` (every part's outline about its own pivot), `CAP`, `HEAD`, `BODY`.

### `makeHandOpen(THREE, paper, opts)` and `poseHandOpen(group, params)`

The receiving hand, palm up, lying on y = 0. Wrist crease at the origin, fingers toward -z, thumb toward -x.
Unit inside is the palm length (wrist crease to the middle finger's MCP).

| opt | default | meaning |
|---|---|---|
| `scale` | 10 | cm per palm length |
| `thickness` | 0.12 | cm |
| `colour`, `cuff`, `sleeve` | `#35366f`, `#f2b38a`, `#1f2755` | hand, shirt cuff, coat sleeve |
| `side` | `"left"` | `"right"` mirrors it |
| `creases` | true | the three palm creases, cut through with a pale liner under each |

`poseHandOpen(group, { curl, fingers, thumb })`: `curl` 0 is flat, 1 is cupped (35 degrees a joint, in real 3D).
`fingers` is an optional `[index, middle, ring, little]` and `thumb` an optional number; both default to `curl`.
`group.userData.palmCentre` is where a seed lies, in the group's own cm.

### `makeHandPinch(THREE, paper, opts)` and `poseHandPinch(group, params)`

The giving hand, a standing card facing +z. The origin is the pinch point. By default it reaches down from the
upper right, palm down, with cuff and sleeve running up out of frame.

| opt | default | meaning |
|---|---|---|
| `scale`, `thickness` | 10, 0.12 | as above |
| `colour`, `cuff`, `sleeve` | `#7e3b2f`, `#f2b38a`, `#5f8350` | |
| `lean` | -55 | degrees the hand is turned in its own plane |
| `facing` | 1 | -1 mirrors it to come from the upper left |
| `pose` | null | overrides for `PROFILE.poses.pinch`, for example `{ index: [38, 46, 32], yaw: 36 }` |

`poseHandPinch(group, { open })`: 0 holds the seed, 1 lets go (the index lifts, the thumb drops).
`group.cast.seedAnchor` is a group at the pinch point in palm units: add a seed to it scaled by `1 / scale`.

### Hand outlines

- `handOutline("open")`: the open hand from above the palm, wrist crease at (0, 0), fingers toward +y, thumb at -x.
- `handOutline("open", { fan: 0.1, thumbOut: 21 })`: the same hand closed up (the figures' hands use this).
- `handOutline("pinch")`: the pinch, wrist at (0, 0), fingers toward +v, palm side toward +u.
- `handLoops(pose)` adds the holes (the gap inside the pinch). `handPieces(pose)` gives the separate pieces.
- `handSkeleton(opts)` and `profileSkeleton(pose, overrides)` return the 21 joints. `HAND` and `PROFILE` hold the numbers.

### `makeSeed(THREE, paper, opts)` and `poseSeed(group, params)`

A gold teardrop on a paler wing folded along its spine. Origin at the seed body; at rest it hangs, wing up, facing +z.
Opts: `size` (cm, whole length, 3.2), `thickness` (0.05), `colour`, `wing`.
Params: `spin` (radians about the vertical axis through the seed), `tilt` (0 hanging, PI / 2 lying flat),
`fold` (radians each half of the wing lifts, 0.22). `seedOutline()` returns body, the two wing halves and the spine.

### `makePine(THREE, paper, opts)` and `posePine(group, params)`

A pop-up: three cards crossed on one axis. Origin at the foot of the trunk. Opts: `height` (cm at full growth, 14),
`thickness` (0.1), `colour`. `posePine(group, { growth })`, 0 to 1: tiers appear from the tip down, each new tier
pushing the ones above it up. Overshoot is the caller's. `pineOutline(growth)` is the 2D outline (unit = full height).

## Regenerating the stills

From `tests/paper-world/`:

```bash
nice -n 15 node tools/lineup.mjs
```

That writes the nine stills and `sheet.jpg` to `out/paper-world/lineup/` (about 25 s). Name stills to render only
those: `node tools/lineup.mjs hand-open guard-lineup`. `OUT=<folder>` changes the folder, `SAMPLES=12` makes a quick
draft, `SHEET=0` skips the sheet. Working views that are not deliverables: `debug-cap` (the cap in 2D, with the
40 px read test), `debug-2d` (the hand pieces and joints), `hand-top` (the open hand from directly above),
`pinch-open`, `seed-close`. In a browser: serve the folder and open `lineup.html?still=hand-open`.

Each panel is 28 renders averaged, with the key light moved over a small disc and the camera jittered. That gives a
soft key and clean edges. The film will not do this, so the film's shadows come from the world's own light.

Still sizes: single frames are 720x1280. The before / after pairs are 1440x1280 (test 01 on the left), the curl
triptych is 2160x1280 and the pine stages are a 2x2 of full frames (1440x2560), so each panel stays full size.

## Banned after the first stills

- A thin visor. The first print read as a beak at a 40 px head. It is a wedge now, thicker at the root.
- A crown top with a kink in it. It is one curve: flat at the back, rising to the peak.
- A pencil neck (0.24 H). The neck is 0.41 H front to back.
- Chalk outlines inside the figure. The cut edge at 70 % white drew every limb on the body; figures use 32 %.
- A five-layer puppet. Edge on it was five sticks with the arms floating off the body. Three layers now.
- A baton hidden behind the arm, spread claw hands on the figures, a crouching walk (5.2 H stride with the hip bob
  upside down), a boot toe through the ground at toe-off.
- The pinch in pure side profile. The curled fingers vanished and it read as a wrench. It is seen a little from
  the back of the hand, so the knuckles step behind one another.
- The pinch pointing straight down. The thumb read as a fat index and the index as a twig. It reaches in palm down.
- A thumb thinner than the index, a thumb leaving the palm like a branch with no web, a let-go that closed the fingers.
- Broken hairlines where the open hand's pieces meet. Every finger joint is now a deliberate crease; other seams overlap.
- A seed that read as a matchstick (wing too narrow, one half folded under the palm).
- A 30 degree lens at 47 degrees for the hand: stubby fingers. The line-up uses 22 degrees at 54.
- Spiky pine boughs.
- On the stage: a tan ground with crumple blotches, one hard dark shadow, a backdrop darker than the ground.

## Known weaknesses

- Guard at ease: in profile, hands behind the back read closer to a hand resting at the hip. The forearm is
  shortened by scaling the card. The pride comes from the chest, the chin and the stillness.
- The walk's passing pose (phase 0.3 and 0.8) has soft knees. Fine on twos, a little sneaky as a single still.
- Thickness: 0.08 cm on a 4 cm figure is 2 % of its height, so the edge-on frames show three slabs about 0.27 cm deep.
- The head has a brow, nose and chin contour. No eye, no mouth.
- The pinch is a three-quarter view, not a strict profile. Index and thumb are rigid cards that pivot to let go;
  they do not re-curl. The index knuckle shows as a round outline on the fist.
- The open hand curls in rigid segments with crisp folds. From 54 degrees a full curl reads as fingers lifting more
  than cupping; a lower camera shows it better. The thumb's pad folds on one straight line.
- Building the first open hand takes about 0.7 s (outlines are traced from distance fields, then cached). The guard
  takes about 0.2 s the first time.
- The seed is oversized for a 10 cm palm (3.2 cm) so it reads at 720 px wide.
- None of this has been lit by the world's candle. Thin cards near a point light need shadow bias tuned there.
