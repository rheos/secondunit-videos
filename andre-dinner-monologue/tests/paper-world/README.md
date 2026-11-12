# paper-world: the table world, f0 to f4761 (ten sections; 5, 6 and 7 are built)

Newest first: how to build a section (the engine for all ten), then sections 6 and 7 (the camp, the seed), then test 04
and test 03 (section 5 in the painted skin), then test 02 (section 5, the blocking pass), which is where the units, the
commands and the file list are.

The table-city section rebuilt as a real 3D paper world in three.js r160: one dinner table, flat paper cut-out
people standing in it as cards, one continuous camera that never cuts and never stops. This render is a
**blocking pass**: camera, timing, staging and pop-up mechanics are the deliverable; the final surface is made
later in a photoreal pass from `out/paper-world/blocking.json`.

Review file: `out/paper-world/andre_paper-world-test02_f1800-f2544_24fps_720x1280.mp4` (744 frames, 31.000 s,
voice muxed from `_in/andre.wav` cut to [75.0, 106.0)).

**Units and axes (also in blocking.json): centimetres, right-handed, y up, the cloth is y = 0, x to the right,
z toward the viewer. The near place setting is at +z, the far one at -z. Quaternions are [x, y, z, w].**

## How to build a section (the engine takes all ten, f0 to f4761)

The film is ten sections on one table with one camera. Sections 5 to 7 are built; 1 to 4 and 8 to 10 start as stubs
(no cues, no pieces, a camera that glides from join to join). Each section has its own four files, so seven builders
can work at once and no two of them ever edit the same file. `window.renderFrame(f)` works for 0 <= f < 4761.

| Section | Frames | Section | Frames |
|---|---|---|---|
| 1 the table as set | f0 to f196 | 6 the camp | f2544 to f3130 |
| 2 the bathtub | f196 to f504 | 7 the seed | f3130 to f3397 |
| 3 the boredom machine | f504 to f1196 | 8 the couple at the edge | f3397 to f3840 |
| 4 the physicist | f1196 to f1800 | 9 the last burst | f3840 to f4315 |
| 5 the table city | f1800 to f2544 | 10 the bare table | f4315 to f4761 |

### The files you own (NN = your section, two digits)

- `js/sections/sNN.js`: cue names (`C`), events, camera keys (`CAM_KEYS`, `camAt`), `BEATS`, and the optional hooks.
  Every export is a pure function of the film frame. Model: `s06.js`, `s07.js`.
- `js/skins/sNN.js`: `export async function build(X)` makes your pieces and returns `{ update(f, jitter, cam) }`.
  Model: `js/skin67.js`.
- `tools/cues/sNN.json`: your key words and your stills list.
- `notes/sNN.md`: your beat table and notes.
- Under `out/paper-world/`: `frames-sNN/`, `check-sNN/`, `wip/sNN_*`, and your review file.

Nothing else. Not `story.js`, `skin.js`, `skin67.js`, `lib.js`, `joins.js`, `registry.js`, `README.md`, another
section's files, `paint.sh`, `plates.json`, `work/plates/`, `js/cast/`. If you need a change there, put it in your report.

If your module or your skin fails (a syntax error, a missing cue key, a throw in `build` or `update`), the engine
replaces the module with its stub or leaves the skin out, prints `SECTION NN FAILED (...)` with the error, and the
other nine sections render as before. So a neighbour's half-written file cannot stop your render, and yours cannot
stop theirs. `SECTION=NN` on a render makes it stop (exit 2) when your own section is the one that failed.

### Commands (from `tests/paper-world/`; `PY` is the viralvision venv python)

```bash
SKIN=1 SECTION=03 FRAMES=560,700 OUT=../../out/paper-world/wip/s03_x node tools/render.mjs   # stills: cheap, never wait
SKIN=1 FRAMES=504-1195 SPEED=12 node tools/render.mjs        # camera speed: cm a frame, dead stops, jumps
SKIN=1 FRAMES=560 PX=1 node tools/render.mjs                 # how tall every standee made with X.standee stands on screen, px
SKIN=1 FRAMES=700 CAM="-22,8,-30,-26,4,-48" OUT=... node tools/render.mjs    # a check camera: position, then target
SKIN=1 NAMES=1 node tools/render.mjs                         # the registry: every piece, its section, kind and setters (NAMES=2: parts too)
$PY tools/onsets.py 03                                       # snap tools/cues/s03.json, write js/cues/s03.js
zsh tools/make-section.sh 03 560 640                         # a range inside your section: frames and a muxed mp4 in wip/
zsh tools/make-section.sh 03                                 # the whole section: see below
zsh tools/regress-built.sh                                   # sections 5 to 7 against the delivered frames, byte for byte (add 1 for every frame)
```

Run renders under `nice -n 15` (make-section.sh does). Several `render.mjs` runs at once are safe: each has its own
port and Chrome profile, and a frame is written under a temporary name and renamed. Give each run its own `OUT`.

### Cues

`tools/cues/sNN.json` is tracked by git, so it holds key words only, never the dialogue:

```json
{ "section": 3,
  "words": [ { "key": "bored1", "word": "bored", "cue": 565 }, { "key": "no", "word": "no", "cue": 1172, "hand": 1174 } ],
  "stills": [504, 620] }
```

`key` is the name your module uses, `word` the word as Whisper has it in `_in/cues.json` (case and punctuation
ignored), `cue` its Whisper frame (within 3 frames), `hand` your own pick when the snapper takes a neighbouring word.
`$PY tools/onsets.py NN` snaps each word to its onset (the same method as sections 5 to 7) and writes `js/cues/sNN.js`
(gitignored: `CUES`, `STILLS`). Your module reads it: `const c = (k) => CUES[k].f; export const C = { bored1: c("bored1") };`.
A key that is not in the generated file throws when the page loads, and your section falls back to its stub: run
`onsets.py NN` after every change to the list. Sections 5 to 7 keep `js/cues.js` as it is (`onsets.py` with no argument).

### The camera and the joins

`js/sections/joins.js` holds the camera at every boundary between two sections: position, target, velocity per frame,
and the size of the float. Your first key is `joinKey(F0)` and your last is `joinKey(F1)` (import it from `./joins.js`);
between them, your own keys `{ f, P, T }`. `camFrom(CAM_KEYS, f, joinFloat(F0, F1, f))` splines them and adds the slow
float, so the film is one move with no jump at a join (`out/paper-world/check-engine/join-f3397/`). Section 10 has no
join at f4761: its last key is its own. Helpers in `lib.js`: `crane()`, `handover()`, `camRaw()`, `makePath`, `leg`,
`walker`.

| f | P | T | velocity of P per frame | float |
|---|---|---|---|---|
| 0 | [-2, 16, 96] | [8, 9, -10] | [0.01, -0.03, -0.12] | 0.5 |
| 196 | [-5, 9, 70] | [1, 3.5, 44] | [0.01, -0.005, -0.05] | 0.5 |
| 504 | [-8, 11, 60] | [-3, 4, 30] | [-0.03, 0.03, -0.12] | 0.5 |
| 1196 | [-17, 5, -39] | [-30, 2.2, -50] | [0.02, 0.01, 0.04] | 0.5 |
| 1800 | [-4, 6, -2] | [12, 4.5, -22] | [0.072, -0.01, -0.285] (section 5's first key, read from it) | 1 |
| 3397 | [-7.2, 52.8, 101.0] | [26.7, 31.4, 22.0] | [-0.036, 0.09, 0.124] (section 7's spline at f3397, read from it) | 0.5 |
| 3840 | [-58, 18, 16] | [-170, 10, 4] | [-0.04, 0.01, 0] | 0.5 |
| 4315 | [-12, 4, 36] | [2, 3, 10] | [-0.01, 0.01, 0.05] | 0.5 |

### Hooks (optional exports of `js/sections/sNN.js`)

`story.js` applies every section's hooks, in section order, for every frame of the film. So each hook must leave
things as they are outside the frames it cares about.

- `flame(f, fl)`: change and return the flame's state. `fl.lit`: 1 burning, 0 out; the key light, the cloth's
  bounce, the glow and every painted piece's tint follow it (pieces go down to 6 %). Use `lit` to dim the candle on
  everything at once. `fl.hinge`: 0 the flame card up, 1 folded down on the wick. `fl.gain`: the key light on the cloth
  only (section 5's flicker, section 7's flare). `fl.h`: the flame card's height. `fl.lx`, `fl.lz`: its lean.
  `fl.flare` (section 7, 0 to 1) opens the exposure 12 %.
- `fill(f)`: a factor on the room fill and the cloth's bounce.
- `grade(f)`: `{ expo, tint: [r, g, b], sat }`, factors on the final picture (saturation first, then the tint).

Section 7's hooks hold past f3397: the flare stays at 0.78 (gain times 1.74, `fl.flare` 0.78) and the fill at 1.2.
A later section that wants the candle settled scales `fl.gain`, `fl.h` and `fl.flare` down in its own `flame` hook and
returns a `fill` below 1.

### The skin: `build(X)` and `update(f, jitter, cam)`

The table (`js/skin.js`, wrapped by `skins/s05.js`) is built and updated first on every frame, then `skins/s01.js` to
`s04.js`, then `s06.js` to `s10.js`. So every section may re-pose the table's pieces, and a section may re-pose the
pieces of any section before it. `X` is the shared kit (the full list is in the comment above `buildSkin` in `js/skin.js`):

| In `X` | What it is |
|---|---|
| `scene`, `world`, `THREE`, `S`, `LAY` | the scene, the Group everything on the table hangs from, three.js, `story.js`, the layout in cm |
| `plate(name, o)` | the plate loader: `work/plates/<name>.png` trimmed to its alpha box, as `{ canvas, w, h, box, data, mean, t }` (`t` is the texture). `image`, `cut`, `tex` are its three steps |
| `flatCard(t, w, h, cast)`, `plane(w, h)` | a flat: an unlit two-sided card that stands on y = 0 and casts its own silhouette |
| `volume(world, name, [x, z], t, w, h, mat)` | a volume: a card that turns to the lens, with an unseen second card that faces the flame and casts the shadow. Every frame: `v.aim(cam.P, X.now.L); v.tint();` |
| `standee(name, plate, h)` | a standee: two faces and a core. Every frame: `st.pose({ visible, x, z, yaw, f, walk, rest, hop, pop })` (see `lib.js walker`) |
| `tintAt(x, z, gain)` | the candle tint: the one colour an unlit painted piece is multiplied by. Set it every frame: it follows `fl.lit` |
| `cast(mesh, t)`, `caster(t)`, `unseen` | the shadow set-up: `cast()` makes a mesh throw its texture's silhouette on the cloth; `unseen` is the material of a shadow-only card |
| `slot(path)`, `ribbon`, `slotPale`, `slotDark` | the cloth-slot drawer: `slot(makePath(points))` is a Group (pale lip, dark cut); `g.draw(k)` shows the first k of it, call it every frame |
| `blurred(canvas, px)` | the pre-blur helper, for a card close to the lens (draw it `transparent`, `depthWrite: false`) |
| `wipeMat(tDark, tLit)`, `shoulder(m)`, `clothT`, `cloth`, `leanFor` | windows that wipe from dark to lit; the roll-off for a lit material; the cloth's texture and mesh; a volume's lean |
| `key`, `bounce`, `hemi` | the flame's light, the cloth's bounce, the room fill (the table sets them every frame) |
| `reg` | the registry |
| `now` | this frame: `{ f, jitter, cam, L, flame, fill, level }`; `L` is where the flame's light is in this sub-render |

`update` is called on every sub-render of every frame of the film (12 times a frame), for every f from 0 to 4760. It
must be a pure function of f.

**The rule about clearing pieces.** An owner sets every animated property of its pieces from scratch on every frame:
position, rotation, scale, visibility, opacity, colour, uniforms. The registry backs this up: at the start of every
frame it puts every registered object and everything under it back as it was built (position, rotation, scale,
visibility) and undoes the last frame's fades. So build a piece hidden (`obj.visible = false`) and it is hidden on every
frame your `update` does not show it. What the registry does not put back: material colours and uniforms, texture
offsets, geometry draw ranges. Set those every frame. Everything you bring leaves by its own mechanism by your F1, or
within 48 frames after it; your `update` runs for the whole film, so a piece of yours can act in a later section.
A light you add must be at intensity 0 outside your frames.

### The registry

Every piece is registered by name: `X.reg.add(name, obj, { kind, set, it })` (`volume` and `standee` do it for you).
`X.reg.get(name)` gives `{ name, obj, section, kind, set, it }`. Your own names are prefixed with your section
(`X.reg.add("tv", ...)` in section 3 is `s03.tv`; `get("tv")` finds it from inside your own build and update), so two
builders can both have a `tv`. Named objects under a piece are registered as parts (`fence_07.hinge`, `pine.tier_3`).
`X.reg.names(section)` lists a section's pieces; `SKIN=1 NAMES=1 node tools/render.mjs` prints all of them.

Re-posing another section's piece: call a setter, or set a raw property of `obj` or `it`, in your `update`. The owner
has already posed it this frame, and it resets it on the next, so your change lasts exactly that frame: apply it on
every frame you want it, and leave the piece alone outside the frames your section needs it.

The pieces of sections 5 to 7 (143 pieces, 137 parts):

| Names | Section, kind | Setters besides `hide()` and `fade(k)` |
|---|---|---|
| `plate_far`, `plate_near` | 5 flat | `lid(k, deg = 75)`: hinge the disc up about its far edge, 0 flat to 1 open; its underside is the same paint, mirrored |
| `plate_far.tower`, `plate_near.tower` | 5 drum | `telescope(k)`: 1 up, 0 down in its plate (a number, `[tier 0, tier 1, tier 2, cap]` or a function of the tier); `windows(k)`: 1 lit, 0 dark, top tier dark first; `fold(k, heading)`: tip the stack over about its base rim |
| `glass_far`, `glass_near`, `bottle` | 5 volume | `fold(k, heading)`, `windows(k)` (dark from the top floor down), `tint(gain)` |
| `salt`, `pepper`, `basket` | 5 volume | `fold(k, heading)`, `windows(k)` (1 as lit, 0 dimmed 30 % as before "New York"), `tint(gain)` |
| `sapling`, `redwood` | 5 volume | `fold(k, heading)`, `tint(gain)` |
| `candle` (part `flame`) | 5 candle | the flame is the `flame` hook's, not a setter's |
| `fence_01` to `fence_54` | 5 flat | `hinge(k)`: 0 standing, 1 flat pointing out over the table's edge, -1 flat pointing in |
| `treeman`, `citizen_01` to `citizen_16` | 5 standee | `fold(k, dir = 1)`: hinge the card down flat. A citizen's entry has `role` (`guard`, `layer`, `home`) and `guard` (0 to 4 along the wall): the guards are citizens 10, 1, 3, 2, 11, and hiding the citizen hides its guard |
| `fg_glass`, `fg_fork` | 5 lens | |
| `slots`, `cloth`, `room_wall`, `room_floor`, `key_light`, `bounce_light`, `room_fill` | 5 | |
| `wall_01` to `wall_26`, `brick_01` to `brick_16`, `head`, `slots_camp` | 6 flat, slots | |
| `watchtower_c`, `watchtower_b` | 6 volume | `fold(k, heading)`, `windows(k)` (the lamp), `tint(gain)` |
| `hand_open` | 7 flat | `slide(dz)`: 0 in place, 72 out over the near edge on its sleeve; `fold(k)`: the fingers, 0 flat, 1 up round the seed |
| `hand_pinch`, `seed` | 7 flat | |
| `pine` | 7 volume | `tiers(k)`: how far each of the eight tiers is open (a number, an array or a function of the tier, 0 = the bottom); `fold(k, heading)` |

- `fold(k, heading)` on a volume: 0 standing to 1 flat on the cloth, painted side up. `heading` is the way its top comes
  down, in radians (0 toward +z, the viewer; `Math.PI / 2` toward +x); the default is away from the candle; `null` is
  straight back from the lens. The card turns from facing the lens to that heading over the first third of the fold.
- `fade(k)`: 1 as painted, 0 nothing, for that frame, on the piece and everything under it. It works on a piece that
  shares its material with others (the slots do). A `ShaderMaterial` of your own needs an `opacity` uniform to fade.
- `hide()`: not drawn this frame.
- Proof of each: `out/paper-world/check-engine/setters/` (the throwaway skin that called them, and the sheets).

### Before f1800 and after f3397

- Before f1800 the table is as set, which is section 5's state before its first event: plate discs flat, cutlery lying
  flat in six stacks, glasses and bottle with dark windows, basket and shakers dimmed, the sapling in its pot, the candle
  burning, the citizens out of sight. Three things of section 5's are also there for every f before 1800, because they
  are in its first frame and must not pop on the join: `slots` (section 5's slots, drawn in the cloth), and the two soft
  pieces of real tableware `fg_glass` at [7, -10] and `fg_fork` at [9, -38], which turn to the lens. Hide or move them
  inside your own frames through the registry if they are in your way; section 4 must leave them as they are over its
  last frames. The tree man hinges up at the head of his slot at the far edge from f1790 to f1798.
- After f3397 everything holds section 7's last state: the pine at 60 cm, the wall flat, the hand open on the cloth,
  the towers lit, the candle flared.

### make-section.sh

`zsh tools/make-section.sh NN` snaps your cues, prints the camera speed, renders the section to
`out/paper-world/frames-sNN/` (12 sub-renders a frame), muxes the voice from `_in/andre.wav` cut to the range into
`out/paper-world/andre_paper-world-sNN-test01_f<F0>-f<F1>_24fps_720x1280.mp4`, and writes to `out/paper-world/check-sNN/`:
`cues.txt`, `camera-speed_f<F0>-f<F1>.txt`, full-size stills at your first and last frame, every snapped cue frame and
every frame in your `stills` list (a still outside your section is rendered on its own), `sheet.jpg`, `luma.txt`,
`badframes.txt`, `flashcheck.txt`. A scan that flags is reported, not fatal. With a range (`NN f0 f1`, inside your
section) it renders the frames and writes `out/paper-world/wip/sNN_f<f0>-f<f1>_24fps_720x1280.mp4` only.

A whole-section render takes a machine-wide lock (`/tmp/paper-world-render.lock`): one runs at a time and the others
wait their turn, printing who holds it once a minute. Ranges and single stills never wait. Run the whole section when
the stills are right, not to find out.

### What changed in the engine, and the proof (`out/paper-world/check-engine/`)

- `js/story.js` loads all ten sections and joins them generically; `js/sections/joins.js`, `stub.js`, `s01.js` to
  `s04.js`, `s08.js` to `s10.js` are new; `s06.js` and `s07.js` gained their hooks (`fill`, `flame`).
- `js/skin.js`: the old `buildSkin` is `buildTable(X)`; the new `buildSkin` makes the kit and the registry and runs the
  ten skins. `js/skins/registry.js` and `js/skins/s01.js` to `s10.js` are new. `js/skin67.js` registers its pieces and
  splits its update in two (section 6's, section 7's).
- `js/main.js`: the grade hook's `sat` and `tint` in the final pass. `tools/render.mjs`: `NAMES`, `SECTION`, atomic writes.
  `tools/onsets.py NN`, `tools/make-section.sh`.
- Sections 5 to 7 render the same: `regress.txt` (20 frames as PNG before and after, mean absolute difference 0.0000,
  largest 0), `before-above_after-below.jpg`, and `regress_f1800-f3397_vs_delivered.txt` (all 1,597 frames rendered again
  and compared with the delivered JPEGs in `frames04/` and `frames-s67/`).
- `stubs/`: stills at f100, f800, f1500, f3600, f4500. `join-f3397/`, `join-f1800/`: 48 frames across each built join
  with the voice, and the camera speed there (no jump). `setters/`, `hooks/`: the throwaway checks.

## Sections 6 and 7: the camp and the seed, f2544 to f3397 (`?skin=1`)

Review file: `out/paper-world/andre_paper-world-s06-s07-test01_f2544-f3397_24fps_720x1280.mp4` (853 frames, 35.542 s,
voice muxed from `_in/andre.wav` cut to [106.0, 141.5417)). Same world, same engine, same camera as test 04: the
camera of f2544 is the camera of f2543 a frame later.

```bash
zsh tools/make67.sh                 # everything: cues, frames-s67/, the mp4, check-s67/, the regression, blocking-s06-s07.json, scans
zsh tools/make67.sh 2737 2830       # any range [f0, f1) of f1800 to f3397: frames and a muxed mp4 in out/paper-world/wip/
SKIN=1 FRAMES=2800 OUT=../../out/paper-world/wip/x node tools/render.mjs          # one frame
SKIN=1 FRAMES=2544-3396 SPEED=12 node tools/render.mjs                            # the camera speed print for the two sections
SKIN=1 FRAMES=2544-3396 BLOCKING=../../out/paper-world/blocking-s06-s07.json node tools/render.mjs   # blocking for a range
zsh tools/make04.sh                 # section 5 (test 04), unchanged; SKIN=1 T3=1 zsh tools/make03.sh is test 03
```

`out/paper-world/check-s67/`: `f<frame>.jpg` (every row's first frame and every cue frame, full size), `sheet.jpg`,
`compare_hero_target_vs_f2800.jpg` (the target still beside the hero frame), `hand-seed_1to1_f3250.jpg` and
`hand-seed_1to1_crop_f3250.png` (the open hand with the seed, unscaled), `regress/` (section 5 before and after,
`regress.txt`, `before-above_after-below.jpg`, the old `story.js`), `cues.txt`, `camera-speed_f2544-f3397.txt`
(min 0.051 cm a frame, no dead stops, no jumps), `figure-heights-px.txt` (guards 223 to 272 px), `luma.txt`.
`out/paper-world/frames-s67/` holds the 853 frames; `blocking-s06-s07.json` is the export for the range (280 objects,
same format; `blocking.json` is still test 04's).

### The engine now takes more than one section

- **A section is a module**: `js/sections/s05.js`, `s06.js`, `s07.js`. Each owns its cue names (`C`), its events and
  its camera keys (`CAM_KEYS`, `camAt`), every one a pure function of the film frame, and its `BEATS`.
  `js/sections/lib.js` holds what they share: paths and walkers (standees on slots), the camera spline and its float.
- **`js/story.js` is the film**: it lists the sections, gives the frame range (`F0` 1800, `F1` 3397), picks the
  section's camera and the section that poses the standees at f, and joins the beat tables. It re-exports section 5's
  layout, because the world is section 5's table.
- **The world's state at f is a function of f alone.** Section 5's functions hold their last state past f2544 (towers
  up, windows lit, fence up, citizens home, tree man and redwood outside), so f2600 renders the same whether or not
  f2543 was ever drawn. Sections 6 and 7 add to that state; nothing they build exists before f2544.
- **The camera carries across a join**: a section's first key is `handover(previous keys, F0)`, the last section's
  spline at that frame with its velocity. Position and direction match to the frame at f2544 and at f3130.
- **To add a section**: write `js/sections/sNN.js` (`F0`, `F1`, `C`, `CAM_KEYS` starting with a handover, `camAt`,
  `BEATS`, its events), import it in `story.js` and add it to `SECTIONS`; build its pieces in a skin module that
  `buildSkin` calls (as `js/skin67.js` is), hidden before its first frame; add its words to `tools/onsets.py`.
- **Section 5 renders the same.** f1800, f2215, f2300, f2400 and f2543 before and after the change: mean absolute
  difference 0.0000, largest 0, and the JPEGs are identical to test 04's delivered frames
  (`out/paper-world/check-s67/regress/regress.txt`, `tools/regress.py`).
- `tools/render.mjs`: `BLOCKING=` now takes `FRAMES=a-b` (the three older make scripts pass `1800-2543`).

### What is on the table

- **The wall** (`s06.js SEGS`): 26 `wall_segment` cards 1.2 cm outside the cutlery, round the whole table, 7 cm high.
  Each rises through a slit in the cloth (12 frames and a settle); the slit is cut along the wall line first. The
  first rises on "camp" as a citizen's brick arrives; the rest are dealt both ways round the table.
- **The front wall is the chamfer**, the long diagonal across the far right corner, not the near (+z) edge: see
  "Where this departs from the brief" below. A `watchtower` (15 cm, a volume) hinges up at each of its two corners
  and its lamp comes on.
- **The crew**: all 16 citizens come out on their section 5 slots pushing a `brick` card. Five go out through the
  gate the tree man used and stand against the hero segment; three go out through the next gap and carry bricks
  along the wall's foot; eight push their brick to the fence where they stopped in section 5, leave it and go home.
  New slots are cut as the first standee travels them.
- **Guards**: on "guards" each of the five cards makes its half turn (edge-on two frames, three frames apart); the
  back of the card is the `guard` plate. On "pride" each rises 6.6 cm up a slot in the wall's face (12 frames, two
  frames apart) and settles with one rock.
- **The head**: `head_capped` in front, `head_bare` 3 mm behind, 34 cm, beside the candle. It lies face down as a flap
  of the cloth (its back is the cloth's own texture, lit like the cloth) and hinges up. A pull-tab (two strips in
  slots in front of it) slides the layers 7 cm apart; the crown, cut along the hat band's line, lifts 32 degrees on a
  hinge at the back with the cap (and its peak) over a plain dark card; a band of two brick courses is drawn out of a
  slit at the back of the head across the eyes by the tab at its leading end.
- **The hand**: `hand_open`, 28 cm wrist to fingertip, flat on the cloth between the near plate and the right fence,
  on a sleeve that runs off the near edge. The plate's own seed is painted out on a copy; the four fingers and the
  thumb are cut along their knuckle lines and hinge up 27 to 35 degrees. `hand_pinch` is a standing card, 21 cm, that
  comes down from above the frame with the `seed`.
- **The pine**: `pine_tall` in eight tiers, a volume: 3 cm on "pine tree", 60 cm on "escape", tier by tier from the
  bottom (damping 0.55), the redwood is 45.
- **Light**: the room fill and the cloth's bounce fall by a third from f2544 to "prison" (f2823) and stay there; from
  f3130 they come back, and on "escape" the flame's gain goes to 1.95 and the exposure opens 12 %.

### The beat table (frames snapped by tools/onsets.py; `how: hand` where the snapper took a neighbouring word)

| Frame | Word | What happens | Camera |
|---|---|---|---|
| f2544 | "I think" | The high wide of f2543, a frame on. From f2545 citizens hinge up at the heads of their slots and slide out, each pushing a brick | down from the wide and round the far right corner |
| f2636 | "camp" | The first wall segment rises behind the first brick, outside the cutlery | low, 17 cm outside the wall, looking in |
| f2650 | "camp" (2) | The watchtower at the right corner is up, its lamp coming on; the deal runs on round the table | trucks along the wall |
| f2667 | "built" | The hero segment rises behind its citizens and their bricks | |
| f2691 | "themselves" | The next segment; the front wall closes at f2701, the second watchtower at f2707 | |
| f2737 | "guards" | The five cards turn, right to left, three frames apart: the back of each is a guard (all five by f2757) | holds low, drifting along the wall |
| f2761 | "pride" | The guards rise up the wall's face on their slots (all up by f2781) and settle with one rock | rises a little and tilts up |
| f2766 | | Three bricklayers set off in a row along the wall's foot, under the guards | |
| f2823 | "prison" | The hero frame: five guards on the wall against the bottle and glass towers and the flame, three bricklayers below | still drifting right |
| f2836 | ("And so") | The head hinges up out of the cloth beside the candle (seen first from behind, as a flap of cloth) | back and up over the wall, round the right side of the table |
| f2878 | "schizophrenia" | The pull-tab slides the layers apart: capped to the right, bare to the left, 7 cm by f2891 | in front of the head at eye height, then an 18 degree arc |
| f2911 | "guards" | The capped layer nudges | |
| f2930 | "prisoners" | The bare layer nudges | |
| f2957 | "result" | The layers slide back together (closed by f2970) | |
| f3007 | "lobotomized" | The crown lifts on its hinge with the cap: a dark hollow | rises to look down into it (peak f3037), back to the eyes by f3101 |
| f3107 | "see" | The band of bricks is drawn out of the slit across the eyes | holds, pushing in slowly |
| f3128 | "prison" | The band stops over the eyes; held to f3164 (36 frames) | |
| f3164 | | The crown shuts and the head folds back into the cloth (flat by f3178) | tilts down toward the near edge |
| f3171 | "And then" | The open hand slides in from the near edge on its sleeve (in place at f3188, "pocket") | settles over the palm, looking down 50 degrees |
| f3192 | | The pinch hand comes down from above the frame with the seed (down by f3208; "took" is f3205) | |
| f3212 | "seed" | The pinch lets go: the seed falls 5 cm, turning twice on its wing, lands at f3221 with a small bounce; the pinch hand lifts away; the fingers fold up round the seed from f3224 | pushes in on the palm |
| f3260 | "pine tree" | A 3 cm pine springs up from the seed | holds close, drifting |
| f3304 | "my hand" | The fingers close a little more | |
| f3331 | "escape" | The pine opens tier by tier to 60 cm (55 cm at f3347, just after "before"; 60 at f3351; settled by f3358); the wall falls flat outward, nearest the pine first (f3336 to f3377); the candle flares | cranes up and back from f3323, the pine's top in frame |
| f3396 | (end) | The pine over the open city, the flame at its brightest | drifting |

### Where this departs from the brief, and why

- **The wall the camera works is the chamfer, not the near edge.** At the near (+z) edge there are 4.5 cm of cloth
  outside the cutlery, the candle is 77 cm away and the towers stand far behind and below the wall's top, so there is
  no cloth for the wall's shadow to cross, no room for bricklayers at the wall's foot and no lit tower behind a
  guard. The chamfer has the triangle of cloth outside it, the candle 26 cm behind it, and the bottle, the glass and
  the far plate tower right behind the cutlery. The two watchtowers stand at its two corners. The hand still comes in
  from the near edge.
- **Wall segments rise through slits; they do not hinge up.** A card hinged at the wall's foot would have to lie
  either under the cutlery or where the bricklayers and the tree man stand. The watchtowers do hinge.
- **Citizens go out through gaps in the cutlery to the wall's foot**, as in the target still, so the turn on "guards"
  and the bricklayers are in front of the wall and not behind it.
- **"schizophrenia" is f2878 and "result" f2957, not test 01's f2897 and f2963.** Those two were the onsets of the
  next words ("where", "they"): the envelope and the sibilant band put "schizophrenia" at f2877 to f2889, then a
  pause. The camera is in front of the head by f2876 for it. The other cues agree with test 01 within a frame, except
  "prison" (1) f2823 (test 01 f2828 is its second syllable) and "late" f3365.
- **The head folds away at f3164**, after the 36 frame hold, because it lies where the hand comes in.
- **The hand is 28 cm, not 30**: it fits between the near plate tower and the right fence with a centimetre each side,
  the near glass in the notch between thumb and cuff.
- **The camera's float is half of section 5's** from f2604 on (eased from f2544), so slow trucks never stall.

## Test 04: the plate towers as drums (`?skin=1`)

Review file: `out/paper-world/andre_paper-world-test04_f1800-f2544_24fps_720x1280.mp4` (744 frames, 31.000 s, the
same voice cut). Test 04 is test 03 with two changes and nothing else; `index.html?skin=1` is now test 04 and
`index.html?skin=1&t3=1` (`SKIN=1 T3=1` for the tools) is test 03 exactly as delivered.

```bash
zsh tools/make04.sh                                   # frames04/, the mp4, check04/, blocking.json, scans
SKIN=1 T3=1 zsh tools/make03.sh                       # test 03 again, unchanged
SKIN=1 FRAMES=2300 CAM="-22,4.5,-22,-1,6,-43" OUT=../../out/paper-world/wip/x node tools/render.mjs   # a check still from a camera the film never uses (position, then target)
```

1. **The two plate towers are real geometry** (`skin.js drumTower`), centred on the flat `plate_disc`, which is
   the only plate now. Three open drums, radii 9.0, 7.0, 5.0 cm, each 4.2 cm high, and a cap (radius 1.6, 0.9 high):
   13.5 cm in all. The painted `tower_plate` card, its lean and its seating toward the lens are gone for these two.
   - Walls: one window cell per tier, composed on a canvas from `work/plates/tier_wall.png` and
     `tier_wall_dark.png` (`tierCell`): the plate's own plain card (the band above its windows) tiled down the
     cell, the plate's window scaled to 45 % of the tier's height and set a fifth of the way up, the plate's umber
     bands at top and bottom. The cell repeats 24, 18 and 12 times round the three drums. In the lit cell the
     window's yellow paper is given a warm glow, orange at the top of the arch to near white low down.
   - Tops: `tier_roof.png` on each tier and the cap, each turned differently, with a pale ring 1 mm wide at the rim.
   - Light: unlit times the same candle-distance tint as every piece, times one form shade on the walls, 0.72 on
     the side away from the flame to 1.0 facing it; tops 6 % lighter. Walls and tops cast shadows on the cloth.
   - Pop-up on "New York": the bottom tier comes up out of the disc, then each tier springs out of the one below,
     three frames apart, damping 0.6; from 12 frames in the windows wipe from dark to lit, bottom tier to top, over
     22 frames. A plain sleeve under each wall keeps an overshooting tier from showing a gap.
   - Names: `plate_far.tower`, `plate_near.tower` (kept) with children `.tier_0`, `.tier_1`, `.tier_2`, `.cap`.
2. **The foreground glass** stands at (7, -10) instead of (0.6, -10.2), 90 % the size: 8 cm to the right of the
   lens's path, so it sits at the right edge of the opening frame, covers 22 % of it at f1800 (it was 36 to 45 %
   through f1820) and is out of frame by f1822.

`out/paper-world/check04/`: `tower_street-height_checkcam_f2300.jpg` (a check camera: the film never sees a risen
plate tower from street height), `tower_rising_f2228.jpg`, `tower_mid-crane_f2262.jpg`, `tower_wide_f2543.jpg`,
`crop_near-tower_f2543_test03_vs_test04.jpg`, `crop_far-tower_f2543_test03_vs_test04.jpg`,
`before-after_test03-above_test04-below.jpg`, `changed-vs-test03.txt` (which frames differ from test 03, from
`tools/diff03.py`), `sheet.jpg` and the beat stills. `blocking.json` is test 04's export.

## Test 03: the painted skin (`?skin=1`)

Review file: `out/paper-world/andre_paper-world-test03_f1800-f2544_24fps_720x1280.mp4` (744 frames, 31.000 s, the
same voice cut). Test 02's file and code path are untouched: `index.html` is test 02, `index.html?skin=1` is test 03.

```bash
zsh tools/make03.sh                                                 # everything: frames03/, the mp4, check03/, blocking.json, scans
SKIN=1 FRAMES=2400 OUT=../../out/paper-world/wip/x node tools/render.mjs    # one frame; every render.mjs mode takes SKIN=1
SKIN=1 zsh tools/sheet.sh <name> <cols> <frame> [frame ...]         # a quick contact sheet
```

What is the same as test 02: the camera keys (except f1994 to f2038, below), every cue frame, every position on
the table, the fence plan (`table.js fencePlan`, now shared), the audio, the units.

What changed:

- **Every object is its painted cut-out** from `work/plates/` (read only), trimmed to its alpha box and standing
  in its place as a card (`js/skin.js`). Pieces are drawn unlit and multiplied by one tint: full and warm within
  25 cm of the candle, 55 % and cooler at the table's far edge (`tintAt`).
- **The cloth is the only lit surface** and the only one that takes shadows: the painted `cloth` (its even middle
  tiled 2 by 3 for the weave, the whole plate once over it at 30 % for the folds), lit by the flame, a small
  shadowless bounce and a warm room fill. It hangs 40 cm over the table's edge into the dark.
- **Volumes turn to the lens** (plate towers, glasses, bottle, basket, salt, pepper, candle, sapling, redwood):
  cylindrical billboards. Each has a second, unseen card of the same piece that faces the flame and casts the
  shadow, so shadows do not swing with the camera. When the lens is more than 24 degrees above a volume its card
  leans back by the difference, so the painted three-quarter view stays true in the crane and the wide.
- **Flats do not turn** (tree man, citizens, the 54 fence cards): fixed cards with alpha-tested shadows. A
  standee is two faces 1 mm apart with a core in its own colour between them, so it shows an edge when edge-on.
- **Nobody walks.** Standees slide along slots drawn on the cloth (a dark cut with a pale lip, the whole path),
  rocking 2.6 degrees and hopping 1 mm, on twos; a stop is the rock settling; a turn is the card's half turn,
  edge-on for two frames. The leg rig, the lean and the hitch are gone: on "84" he stops and settles, on
  "backpack" one hop (3.8 mm), on "where" the turn. Citizens hinge up out of the cloth at the start of their
  slot, just outside their tower's footprint, and fold flat again when they are back.
- **Pop-ups.** At rest: `plate_disc` flat at each setting, glasses and bottle standing with their dark-window
  plates, basket and shakers standing (dimmed 30 %: they have no dark plate), the cutlery cards flat in six
  stacks. On "New York" (f2215, three frames apart): glasses and bottle squash and settle and their windows wipe
  on from the bottom (dark plate to lit plate, 22 frames); each plate's tower springs out of its disc (damping
  0.6) and its windows wipe on 9 frames later. On "New York" 2 (f2236) the cutlery deals out and hinges up, as in
  test 02. The sapling springs taller on "trees"; on "redwoods" it folds down toward the lens and the redwood
  card hinges up from behind it.
- **Lens.** `fg_glass` (f1800 to f1845) and `fg_fork` (f1800 to f1931) stand close to the lens, pre-blurred 5 to 6 px
  in the texture and dimmed to a third; the `room` is a cylinder 330 cm out, pre-blurred 12 px, at 50 %, and the
  floor 76 cm below the cloth is the same picture softer and darker. A warm glow on the flame, a faint one on
  lit windows, a vignette, a warm grade. The paint goes to the screen as painted: only values above 0.72 roll off.
- **The tree man starts on the table**: his slot begins at the cloth's far edge, he waits there until f1831.
- **Camera, f1994 to f2038 only** (test 02 defect 2 and 3): instead of looking away up the redwood, the camera backs
  off to (-9.5, 6.4, -26.2) at f2008, so the redwood rising at the corner and the tree man at the foot of the far
  glass share the frame (he is 181 px at f2010), then swings round the glass to his shoulder for "84".

Sizes (cm): tree man 4, citizens 4 and 3.8, candle 12 with its flame, salt and pepper 9, basket 10, plate tower
18.8 high on its 24 cm plate (the tiers alone about 14), glass 18, bottle 30, knife 20, fork 19, spoon 18, redwood
45, sapling 7 with its pot, plate disc 24.

`out/paper-world/blocking.json` is now test 03's export (175 objects, same format). Names kept: `plate_far`,
`plate_near` (now the flat discs; the towers are `plate_far.tower`, `plate_near.tower`), `glass_far`, `glass_near`,
`bottle`, `salt`, `pepper`, `basket`, `candle`, `flame`, `redwood`, `fence_01`..`54` and `.hinge`, `treeman`,
`citizen_01`..`16`, `cloth`, `key_light`, `bounce_light`, `room_fill`. New: `sapling` (was `pot`), `<name>.card`
(the face that turns to the lens, or a standee's rocking card), `fg_glass`, `fg_fork`, `slots`. Gone: `napkin`
(no plate), the tower tiers, struts, limb cards, `eye_fill`.

Added files: `js/skin.js`, `tools/make03.sh`; `out/paper-world/frames03/`, `check03/` (stills at the beat frames,
`sheet.jpg`, `compare_wide_target_vs_test03-f2543.jpg`, `compare_street_target_vs_test03-f2400.jpg`,
`figure-heights-px.txt`, `first17s_*`, `camera-speed.txt`).

## Commands

Everything, from `tests/paper-world/`:

```bash
zsh tools/make.sh
```

One step at a time (`PY` = the viralvision venv python with numpy):

```bash
nice -n 15 $PY tools/onsets.py                                     # snap the words to onsets, writes js/cues.js (gitignored)
FRAMES=1800-2543 SPEED=12 node tools/render.mjs                    # camera speed print: cm a frame, dead stops, jumps
FRAMES=1800-2543 OUT=../../out/paper-world/frames nice -n 15 node tools/render.mjs    # frames (N=10 sub-renders each)
nice -n 15 ffmpeg -y -framerate 24 -start_number 1800 -i ../../out/paper-world/frames/f%04d.jpg -ss 75.0 -to 106.0 -i ../../_in/andre.wav -map 0:v -map 1:a -c:v libx264 -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart ../../out/paper-world/andre_paper-world-test02_f1800-f2544_24fps_720x1280.mp4
BLOCKING=../../out/paper-world/blocking.json node tools/render.mjs # the blocking export
FRAMES=2349,2426 PX=1 node tools/render.mjs                        # how tall each figure stands on screen, in px
LINEUP=1 W=1400 H=900 N=16 FRAMES=1800 OUT=../../out/paper-world/wip/lineup node tools/render.mjs   # the figure line-up
zsh tools/sheet.sh <name> <cols> <frame> [frame ...]               # a quick low-sample contact sheet into out/paper-world/wip/
nice -n 15 $PY ../../../tools/cloud-render/badframes.py <review.mp4>
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py <review.mp4>
```

`tools/render.mjs` env: `FRAMES` ("a-b", "a,b,c", "a-b:step"), `OUT`, `N` (sub-renders a frame), `W`, `H`,
`RESUME=1`, `PNG=1`. In a browser, serve the folder and open `index.html?f=2300` for one frame (`&n=16` for
more samples); with no `f` the section plays on a loop. The page keeps the brief's contract: canvas `#c`,
`window.ready === true`, `window.renderFrame(f)` a pure function of f.

## The beat table (frames snapped by tools/onsets.py)

| Frame | Word | What happens | Camera |
|---|---|---|---|
| f1800 | (start) | One flame, the far glass and the bottle behind it, the pot small at the far corner | 6 cm up, 20 cm from the flame, already gliding toward the far corner |
| f1874 | "tree expert" | The tree man (hat, pack, stick, stooped) is beside the potted sapling, walking in (118 px) | passing the glass stem; then over the plate rim and the knife and spoon |
| f1930 | "trees" | The sapling springs a tier and stands 1.5 cm taller | beside him at his eye height, the knife and spoon stacks under the lens |
| f1998 | "redwoods" | The sapling shoots up into a redwood (about 65 cm; the bottle is 31 cm) | he passes the lens; the camera looks up the trunk (peak f2009) and comes back down |
| f2022 | "84" | He stops and leans on the stick, tiny beside the bottle | behind his shoulder: bottle left, candle and glass beyond |
| f2071 | "backpack" | He hitches the pack (it jumps and settles) and walks on | drifts round him, then tracks |
| f2106 | "tomorrow" | He reaches the candle; the flame leans after him as he goes round it | his far side, the candle coming into frame |
| f2192 | "where are you from" | He has stopped (f2190); the card turns half a turn to the near setting, edge-on at f2196 and f2197 | round the candle on the outside of his circle, rising from 5 to 10 cm |
| f2215 | "New York" | Plates, bottle, glasses, salt, pepper, basket and napkin telescope up out of the cloth, three frames apart, windows coming on floor by floor | cranes up and back to 64 cm, tilted down 35 degrees (f2300) |
| f2218 | | The tree man's card turns back; from f2227 he walks out down the street | |
| f2236 | "New York" (2) | 54 cutlery cards deal off the six stacks, slide out to the fence line, travel along the table edge and hinge up on their foot tabs (all up by f2300) | |
| f2300 | "Do you know" | Citizens are walking out of the towers toward the fence | comes down to citizen height at the fence |
| f2349 | "never do" | The first wave has stopped at the fence; their cards turn (f2349 to f2365) and they walk back. The tree man walks on | 7 cm up, 20 cm from the fence |
| f2367 | ("oh, yes") | The tree man walks out between two posts | |
| f2402 | "why" (f2406) | Outside, by the redwood, his card turns and he looks back in | 4 cm up, creeping toward the fence |
| f2426 | "don't leave" | The second wave stops at the fence; they turn from f2432 | |
| f2458 | "theories" (f2466) | | starts up and back: a real crane, the view steepens as it rises |
| f2522 | "all" | The whole table as a walled, lit city; citizens small in the streets; the redwood and the tree man outside the fence | lands on the high wide, then drifts to f2544 |

## Where this departs from the brief's camera table, and why

- **Camera speed in the first leg is 0.25 to 0.5 cm a frame, not 1.2.** At 1.2 the 130 frames would cover 156 cm
  on a 130 cm table. The lens passes the glass stem, the plate rim and the cutlery at 3 to 8 cm, which is what
  reads as speed.
- **The candle sits 19 cm off-centre toward the far right, and the bottle and far glass beside it.** A 4.7 cm
  man at 12 frames a step covers 0.22 cm a frame, so from the corner pot he can reach a bottle 30 cm away by
  "84" and a candle 37 cm away by "tomorrow", not the centre of a 90 by 130 cloth.
- **Round the candle the camera turns about 190 degrees, not a quarter.** A flat card seen along its own plane is
  a line, so the camera stays on the outside of his circle, square to him, with the flame behind him.
- **The street view looks across the street at the fence, not down it.** Cards walking away from the lens are
  edge-on. Looking along -z, the citizens and the tree man cross at 45 to 60 degrees and the fence runs
  diagonally through the frame, the redwood behind it.
- **The fence cuts the far right corner off with a long chamfer**, so the redwood and a triangle of cloth are
  clearly outside the wall.
- **The tree man is not outside the fence at f2300: he walks out through it at f2367**, between two posts, while
  the citizens stop and turn back at it. He stands outside by the redwood from f2402. A man of his size cannot
  get from the candle to the corner any sooner, and the walk-out says the line ("they want to leave but never do").
- Vertical field of view is 60 degrees, fixed. The lens never zooms.
- Two lights are cheats for readability and are named in blocking.json: `bounce_light` (shadowless, above the
  flame) and `eye_fill` (dim, cool, from the lens).

## Files

```
tests/paper-world/
  index.html              the page: canvas #c, ?f=<frame>, ?w= ?h= ?n=
  js/kit.js               the paper kit: grain(), paper(colour), card(shape2D, colour, thickness), tube, disc,
                          discStack, ring, box, strip, windows; springs and seeded numbers
  js/table.js             the world: room, cloth, plates/towers, glasses, bottle, shakers, basket, napkin, candle
                          and flame, pot and redwood, the cutlery stacks and the fence; every piece named
  js/figures.js           the walking rig: makeFigure, makeTreeman, makeCitizen (2D joints, feet planted by IK)
  js/story.js             the film: the ten sections, the frame range, which section's camera and poses apply at f, the hooks
  js/sections/lib.js      shared: paths, walkers, the camera spline, its float, handover(), RANGES, joinKey(), joinFloat()
  js/sections/joins.js    the camera at every boundary between two sections; stub.js: what replaces a section that fails to load
  js/sections/s05.js      section 5 (was story.js): layout, paths, walkers, every event and the camera keys, on cue frames
  js/sections/s06.js, s07.js   sections 6 and 7: the wall, the crew, the head; the hand, the seed, the pine, the fall
  js/sections/s01.js to s04.js, s08.js to s10.js   the other seven sections (stubs until built)
  js/skin.js              the kit X, buildSkin (runs the ten skins) and buildTable: the table and the painted skin of section 5
  js/skin67.js            the painted pieces of sections 6 and 7
  js/skins/registry.js    every piece by name, its setters, and the reset at the start of every frame
  js/skins/s01.js to s10.js    one skin a section: s05 wraps skin.js, s06 and s07 wrap skin67.js, the rest are stubs until built
  js/cues/sNN.js          generated by tools/onsets.py NN from tools/cues/sNN.json (gitignored)
  js/main.js              renderer: N jittered sub-renders a frame, glow, grade; renderFrame, exportBlocking,
                          camInfo, figurePx; ?lineup=1
  js/cues.js              generated by tools/onsets.py (gitignored)
  js/lib/three.module.js  three.js r160 (MIT)
  js/cast/, lineup*.html  Builder B's (guard, hands, seed, pine); not used by this section
  tools/lineup.mjs, paint.sh, plates.json, work/   not Builder A's either; left untouched
  tools/onsets.py         snaps the words to onsets of _in/andre.wav (no argument: sections 5 to 7; NN: one section's list)
  tools/cues/sNN.json     a section's key words and stills list
  tools/make-section.sh   one section end to end, or a range inside it
  tools/regress-built.sh  sections 5 to 7 rendered again and compared with the delivered frames
  tools/render.mjs        frames, camera speed print, figure heights, blocking export (headless Chrome, Metal)
  tools/make.sh           the whole pipeline (test 02); make03.sh, make04.sh (section 5 skinned); make67.sh (sections 6 and 7, or any range)
  tools/regress.py        section 5 before and after an engine change; tools/luma.py: how bright each frame is
  tools/sheet.sh          quick contact sheets while building
  tools/motioncheck.py    how much the picture changes a second apart
  tools/render-frames.reference.mjs   the reference renderer this was adapted from
  README.md, NOTES.md
out/paper-world/
  andre_paper-world-test02_f1800-f2544_24fps_720x1280.mp4    the review file
  blocking.json           camera and every named object per frame (see NOTES.md, "For the Blender pass")
  frames/                 the 744 rendered frames
  check/f<frame>.jpg      full-size stills: 1800 1874 1930 1998 2009 2022 2071 2106 2110 2196 2215 2236 2262 2300
                          2349 2367 2400 2406 2426 2466 2522 2543
  check/sheet.jpg         contact sheet of those
  check/compare_wide_test01-f2543_vs_test02-f2543.jpg, compare_street_test01-f2426_vs_test02-f2400.jpg
  check/lineup-figures.jpg            the tree man and three citizens, about 600 px tall
  check/first17s_every24.jpg, first17s_change.txt   f1800 to f2215 a second apart, and the change between each pair
  check/camera-speed.txt, cues.txt    the speed print and the snapped cues
  check/figure-heights-px.txt         how tall each figure stands on screen at the figure beats
  wip/                    working sheets from the build
```

## blocking.json

`fps`, `f0`, `f1`, `cues`, `beats`, `layout`, `fence_polygon_xz`; `camera.fov_vertical_deg` and, per frame,
`pos`, `target`, `quat`; `objects.<name>`: `parent` (a named object, or null for world), `type`, `size` and
`bbox_min` (the piece's own bounding box at f1800, cm), `visible` changes, and `track` (`f`, `pos`, `quat`,
`scale`: a sample for every frame where the transform changed; hold the last value otherwise; figures are on twos).
Names: `plate_far`, `plate_near` (with `.tier_0`...), `glass_far`, `glass_near`, `bottle`, `salt`, `pepper`,
`basket`, `napkin`, `candle`, `flame`, `pot`, `redwood` (`.trunk_0`..`3`, `.crown`, `.tier`), `fence_01`..`fence_54`
(`.hinge`, `.head`, `.handle`, `.tab`), `treeman` and `citizen_01`..`16` (`.torso`, `.head`, `.thigh_near`...),
`cloth`, `room_floor`, `key_light`, `bounce_light`.
