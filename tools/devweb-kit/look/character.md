# Look: character

Measured 2026-11-02 for the devweb look bible (look-bible step 1, topic `character`). Blink stays as Robin approved it
(shape, toon look, one outer outline, no hands, the harness acts); this file measures how well Blink **acts**, not how
it looks. Ours: episode 1 draft 6 (the approved oner) and episode 5 finish d2. References: cinetic's four films
(how objects act), and the narrated shorts Robin picked (corespear's 12, Jam With AI's two) for how a presenter or a
character carries the eye. Scripts, data and sheets: `.bureau/runs/20261102-devweb-look-bible/look/character/` in this
worktree (called `CHAR/` below).

## 1. Verdict

Per second on screen, ep 5's Blink acts as much as ep 1's, and cleaner. Ep 5's problem is that Blink is barely in the
film, and when it is, it is too small for its acting to read. The biggest gaps:

1. **Blink is out of shot for most of ep 5.** In shot: ep 1 **42.1 s of 45.3 s (0.93)**, ep 5 **34.4 s of 129.6 s
   (0.27)**. Longest absence: ep 1 **0.38 s**, ep 5 **39.5 s** (and a second one of 38.1 s). Words spoken while Blink
   is in shot: ep 1 **0.92**, ep 5 **0.24**. The Jam With AI presenter is in **21 of 21** sampled frames. Corespear has
   no character at all; it is not the model for a mascot series.
2. **Too small to read when it is there.** Median body height in shot: ep 1 **617 px (0.32 of 1920)**, ep 5 **256 px
   (0.13)**. At ep 5's size an eye is **55 px** tall (ep 1 **131 px**) and a full sideways look moves the eyes
   **7.5 px** (ep 1 **18 px**). A 3.5-6 % squash pop is 9-15 px. The eye-line work in `ledge.js` is right and nobody
   can see it.
3. **Ep 5's springs wobble; cinetic's moves land.** Ep 5's `pop()` rebounds at **56 %** of each previous swing, crosses
   rest **5 times** and takes **65 frames**; `tug` **55 %**, 43 frames. Cinetic's tracked moves cross their end value
   **0 times** in 10 of 10 moves, overshoot **0-2.4 %** on 7 (5.7 % on a colour fill; two logo slides land 6-9.5 %
   past and drift back over 30-80 frames, never bouncing), and come to rest in **6-35 frames**. Ep 1's `back()` easing overshoots **10 %** once.
4. **The kit forces under-acting on the mouth.** `face()` swaps smile for grin in one frame when `happy` or `eager`
   crosses 0.5, so ep 5 caps both at **0.45-0.48** (eye squash never below 0.66, the smile never widens) and ep 1, which
   went to 1.0, shows **7** one-frame mouth swaps. Ep 1 also has **18** one-frame gaze jumps in shot (it predates the ep 3
   easing rule; checked by eye at 4.88 s, `CHAR/crops/ep01_gazesnap_4p88.jpg`); ep 5 has **0**.
5. **Blinks are flicks.** Ours: **7-8 frames** total with **1-2** frames near shut, a linear triangle (`pulse(t, c,
   0.07)`). Halden's text cursor, the closest thing in the references to Blink (a cursor that blinks), takes **17 frames**:
   7 closing, 3 held, 7 opening, eased. Rate in shot: ep 1 **5.7 /min**, ep 5 **10.5 /min**; blinks within 0.3 s of a
   gaze shift: ep 1 **1 of 4**, ep 5 **0 of 6**.

## 2. Method

- **Blink's acting from the film code** (`CHAR/codeprobe/`). Each film's world module (ep 1 `oner.js`, ep 5 `world.js`
  with `stations/ledge.js`) runs in node against a small three.js stand-in (`three-stub.mjs`: real transforms and a
  pinhole camera, nothing renders) and a wrapper on the kit's `makeBlink` that records every `face()` call
  (`blink3d-wrap.mjs`, `hooks.mjs`). `probe.mjs` writes one row per 60 fps frame: the face values, the rig's scale and
  rotation, and where Blink's body lands on the 1080x1920 frame (`ep01.jsonl` 2,719 frames, `ep05.jsonl` 7,774).
  The projection was checked against the master: at ep 1 6.0 s the code puts the body at y 1173-1762, the frame shows
  1165-1780 (`CHAR/crops/ep01_t6.png`). A colour-blob detector on the masters (`blink_in_video.py`, 4 fps) agrees with
  the code on ep 1 (in shot 0.928 code, 0.934 picture; blob height / code height 1.02). On ep 5 it also fires on the
  mint-lit cards and folders (checked by eye, `CHAR/crops/ep05_videoonly_check.png`), so ep 5's presence is the code's.
- **In shot** = Blink's root shown, centre inside the frame (10 % margin), more than a quarter of its height inside,
  and taller than 40 px. **Events** (`acting_from_code.py`): a gaze shift is a run of eye speed over 0.6 visor units/s
  travelling more than 0.2; an expression change is `happy`, `eager`, `think` or `skew` moving faster than 0.4/s by
  more than 0.25 (think 0.3); a pose change is squash (`rig.scale.y`), yaw, pitch, tilt or hop past fixed speed and
  size floors that leave out the breathing and the slow yaw drift. A beat is any event start, merged within 0.25 s. A
  one-frame jump is a step over 0.12 (gaze) or 0.15 (expression) that is also 3x the steps either side.
- **Presence, size, readable range** (`presence.py`): on-screen runs, words said while in shot (from each project's
  `vo/words.json`), eye height and full-look eye travel in px from the body's projected height.
- **Cinetic objects** (`track.py`, rows in `CHAR/tracks.jsonl`): one object in a box, every frame at 60 fps, as a
  foreground mask (distance from the background, or a white, red or blue key); one property (edge, centre, size, area)
  per frame; then anticipation (a wrong-way move over 2 % of the move), overshoot, frames to end, settle (inside 3 % of
  the end for good) and crossings of the end value. Events were found with `activity.py` and checked by eye on 60 fps
  strips (`CHAR/crops/strip_*.jpg`). Raw outputs of the tool were wrong on four tracks (mask catching the whole box,
  camera moves); those were re-keyed or read off the series by hand, and the hand readings are marked below.
- **Presenters and figures.** Jam With AI: `presenter_motion.py` counts jump cuts and motion beats (peaks of smoothed
  frame change in the presenter's band, at least 0.3 s apart, over 1.5x the clip's median). The same counter on our
  masters measures the camera, not Blink, so ours are taken from the code instead. Eye-line and figure counts are by eye
  on 1-per-8 s samples (`CHAR/sheets/jam_both.jpg`, `cs_1.jpg`, `cs_2.jpg`, `cs_3.jpg`).
- **Side by side:** `CHAR/sheets/side_by_side.jpg`: ep 1 and ep 5 on top, halden's cursor, kiln's keystone, the
  presenter and corespear's figures below. Overviews: `CHAR/sheets/ep01_1fps.jpg`, `ep05_1fps_1.jpg`, `ep05_1fps_2.jpg`.

## 3. Tables

### Blink, from the code (in-shot time only)

| | ep 1 d6 | ep 5 d2 |
|---|---|---|
| Film length | 45.3 s | 129.6 s |
| In shot | 42.1 s (0.93) | 34.4 s (0.27) |
| Runs in shot | 2 (10.2 s, 31.9 s) | 6 (4.5, 3.8, 4.1, 8.1, 8.8, 5.0 s) |
| Longest absence | 0.38 s | 39.5 s |
| Words said while in shot | 97 of 106 (0.92) | 79 of 331 (0.24) |
| Body height in shot, p10 / median / p90 | 286 / 617 / 1044 px | 107 / 256 / 363 px |
| Eye height (median) | 131 px | 55 px |
| Eye travel at full `look` (median) | 18 px | 7.5 px |
| Acting beats per 10 s | 7.36 | 5.24 |
| Gaze shifts per 10 s | 6.41 (27) | 2.62 (9) |
| Expression changes per 10 s | 2.14 | 3.20 |
| Pose changes per 10 s | 2.85 | 4.08 |
| One-frame jumps (gaze / mouth swap / yaw) | 18 / 7 / 3 | 0 / 0 / 0 |
| Gaze shift length, median | 6 frames (many 2-frame snaps) | 21 frames |
| Gaze shift start vs nearest word, median / abs median | -0.01 / 0.10 s | -0.09 / 0.13 s |
| Gaze off the camera (on something) | 0.63 of in-shot time | 0.41 |
| Blinks in shot (total) | 4 (4) | 6 (11) |
| Blink rate in shot | 5.7 /min | 10.5 /min |
| Blink length / frames near shut | 8 / 2 frames | 7 / 1 frames |
| Longest in-shot stretch with no acting event | 4.6 s | 8.8 s |
| Max `happy` / `eager` | 1.0 / 0 | 0.48 / 0.45 |

Ep 5's springs, from `ledge.js`'s own maths: `pop(t, t0, a)` dips -0.6a over 0.14 s (8.4 frames) before the move,
then `spring(u, a, 0.18, 6, 3.2)`: first peak 4.8 frames after t0, each later swing 0.56 of the one before, 5
crossings, done at 65 frames. `tug`: a -0.035 dip over 0.15 s (9 frames), `spring(u, 0.1, 0.12, 6, 5)`: ratio 0.55, 43
frames. Squash sizes: breathing 1.5 %, pops 3.5-6 %, slump 4.5 %. Ep 1: pop-in on `back()` (10 % overshoot, one
crossing), hops a 12 % triangle `pulse` (no ease at the corners), head shakes `0.22-0.28 sin(17-18 t)` decaying over
0.35-0.4 s.

### Cinetic: how objects act (60 fps frames)

| Film, object, property | Anticipation | Travel | Overshoot | Settle after landing | Crossings |
|---|---|---|---|---|---|
| halden, cursor blink, contrast | none | 7 f closing, 3 f held, 7 f opening (17 f) | n/a | n/a | n/a |
| halden, cursor gathers then collapses to the dot: area / height | area **+77 %** over 10 f, width 28 to 66 px | height 420 to 60 px in 25 f | 0.8 % | 0 f | 0 |
| halden, wordmark slides left, left edge | none | 191 px, 24 f (10-90 %: 21 f) | lands 9.5 % past, drifts back over ~80 f | (drift) | 0 |
| kiln, brick wall collapses into the node, width / height | none | 1920 to 336 px in 6 f, accelerating | 0 % | 0 f | 0 |
| kiln, keystone drops into the arch, centre y (hand reading) | lifts **22 px (13 % of the drop)** over 58 f | 169 px in 27 f, accelerating to ~20 px/f | rebound 2.4 % (4 px) | 5 f | 0 |
| kiln, logo slides left, keystone centre x (hand reading) | none | 264 px in 19 f | lands 6 % past, drifts back over 30+ f | (drift) | 0 |
| kiln, "14:32" slam, white area / height | none | in over 2 f | eases 2 % smaller over 8 f, creeps back over ~20 f | 8 f | 0 |
| quire, day tile fills blue, fill share | none | radial fill in 5 f | 5.7 % | colour settles blue to black in 23 f | 0 |
| quire, card pull-back, card width | none | 128 px in 12 f, ease out | 0 % | 0 f | 0 |
| quire, cards stack into the deck, width (hand reading) | none | 842 to 330 px in 24 f, ease out | 1.0 % | ~10 f | 0 |
| quire, wordmark rises, top edge | none | 172 px in 12 f, ease out | 0 % | 0 f | 0 |

Overall (10 moves; the blink is not counted): anticipation on **2 of 10**, both the film's one hero transformation
(halden's gather, kiln's keystone): **13 %** of the move, or a swell of the area before a collapse. Overshoot **0-2.4 %**
on 7 of 10, 5.7 % on quire's colour fill, and two land-and-drift-back of 6-9.5 %. **0** crossings on every move.
Travel **2-27 frames**. Squash only at a transformation, and extreme
when it comes: halden's bar goes from aspect 16:1 to 0.9:1 (width x2.36, height x0.14). Kiln's 14:32 and the wall
collapse motion-blur at speed; nothing wobbles.

### Narrated references: who carries the eye

| | Jam With AI 7sIF (111 s) | Jam With AI DirBj (60 s) | corespear (12 shorts) |
|---|---|---|---|
| Presenter or character in shot | 14 of 14 samples | 7 of 7 (lower ~55 % of frame, screen above) | none; person icons in 16 of 210 samples (0.08), as diagram nouns that never emote |
| Motion beats in the presenter's band | 5.85 per 10 s | 6.38 per 10 s | n/a |
| Jump cuts | 1.35 per 10 s | 1.17 per 10 s | n/a |
| Longest stretch with no beat and no cut | 6.7 s | 10.4 s | n/a |
| Eye-line at the viewer (by eye) | 10 of 14 | 6 of 7 | n/a |
| Blink rate | unmeasured (eyes too small at the sampled size) | unmeasured | n/a |

Corespear carries the eye with the lit element, not a figure: that is the depth topic's "attention area" (see
`look/depth.md`). Jam With AI's presenter looks at the viewer about three quarters of the time and points or glances at
the thing the other quarter; Blink is not the narrator, so its ratio runs the other way (on the thing 0.41-0.63).

## 4. Recipe in our stack

We take the quality (a character always on stage, big enough to read, moves that land) and keep Blink's look.

**`crew-storyboard.md` and `crew-dp.md` (presence and size):**
- Blink in shot for at least **0.75** of the film (ep 1: 0.93; the presenter: always), and never out of shot for more
  than **6 s** (ep 5: 39.5 s). When a station is far from the ledge, Blink goes with the camera: a second Blink rig at
  the station (it can ride the cord, peer over the card, sit on the folder tab), or a frame that keeps the ledge in the
  top third. A list too long for one frame is no reason to drop the character.
- Blink's body at least **384 px tall (0.20 of 1920)** on any beat where it acts, and **600 px (0.31, ep 1's median)**
  on its hero beats. Below 260 px the eyes travel 7.5 px and the acting is invisible; there, the body yaw and lean carry
  the gaze (see below).

**`crew-animator.md` (values; the `ledge.js` names are the reference build):**
- **Landing, not wobbling.** Replace `spring(u, a, 0.18, 6, 3.2)` in `pop()` with `spring(u, a, 0.14, 3, 11)`: one
  rebound at 0.21 of the push, 2 crossings, done in 25 frames (cinetic: 0 crossings, 6-35 frames; Blink is squishy, so
  one rebound is kept). Same for `tug`: `spring(u, 0.1, 0.12, 3, 12)`. Ease-out settles with no rebound (quire's 12-24
  frames) for anything that is not Blink's body.
- **Anticipation only on the hero move**, sized like cinetic's: a wrong-way move of **10-15 %** of the move over
  **6-10 frames** (ep 5's `pop` dips 60 % of the move on every pop). One per station; the rest go straight.
- **Squash that reads:** on the hero beat let `rig.scale.y` go to **0.88-0.90** (ep 1's 12 % hop) with
  `sxz = 1 / Math.sqrt(sy)`, not 0.94-0.965; breathing stays at 1.5 %.
- **Eyes lead, body follows.** A gaze shift is **4-6 frames** of eye travel with `io` (ep 5: 21 frames), and the body
  `yaw` toward the same target starts **2-3 frames later** and takes **12-18 frames**. In `ledge.js` terms the look keys
  `[s - 0.05, 0], [s + 0.3, SX]` become `[s + 0.03, 0], [s + 0.12, SX]` and the yaw keys `[s, 0], [s + 0.35, 0.2]`.
  Keep cueing the shift on the word: both episodes already land within 0.13 s.
- **When Blink is under 384 px tall**, gaze is carried by yaw of **0.2-0.3 rad** and a lean (`rig.rotation.x`) of
  **0.06-0.1 rad** toward the target, because the eyes alone move under 8 px.
- **Blinks:** keep the rate (ep 5's 10.5 /min in shot is fine; ep 1's 5.7 /min is low), put one on every other gaze
  shift of 0.5 visor units or more (ours: 0-1 of 4-6), and use the kit's new blink shape below.
- **Expressions** go to full range once the kit crossfades the mouth: `happy` up to 1.0 on the hero smile, `eager` up to
  0.8, instead of the 0.45-0.48 cap.

**`blink3d.js` (kit changes; one edit each, all values from the tables above):**
- **Mouth crossfade.** `smile` and `grin` share the eyes' `glow` material, so the swap cannot fade today. Give each
  mouth its own copy of `glow` (`transparent: true`), and in `face()` replace the `smile.visible` / `grin.visible`
  lines with `const g = Math.min(1, Math.max(0, (Math.max(happy, eager) - 0.4) / 0.2))`, smile opacity `1 - g`, grin
  opacity `g`, each visible while its opacity is over 0.01. Over the usual 0.15 s expression ramp that is a 0.1 s
  crossfade, which is the README's "no one-frame swaps" rule.
- **A blink helper with a shape:** `blinkAt(t, c)` returning 0..1: close over **4 frames** (`io`), held shut **2
  frames**, open over **6 frames** (`io`): 12 frames in all, between ours (7-8, 1 shut) and halden's cursor (17, 3
  held). Films call `face({ blink: Math.max(...BLINKS.map((c) => blinkAt(t, c))) })` in place of `pulse(t, c, 0.07)`.
- **Eye travel scales with the visor.** `look * 0.06` and `lookY * 0.05` (in `e.g.position.set`) use about a sixth of
  the room the visor leaves beside each eye (0.40 units: visor edge 0.84, eye centre 0.34, half-width 0.10). Raise the multipliers to **0.11** and **0.08** so a full look moves the eyes
  ~14 px on a 256 px Blink and ~33 px on ep 1's 617 px; check that the eyes stay inside the visor at `look = 1.05`.

## 5. Top five changes, by visual impact

1. **Keep Blink in shot:** at least 0.75 of the film, no absence over 6 s (ep 5: 0.27, 39.5 s). `crew-storyboard.md`,
   `crew-dp.md`.
2. **Frame Blink big enough to act:** 384 px or more when it acts, about 600 px on hero beats (ep 5 median 256 px).
   `crew-dp.md`.
3. **Mouth crossfade in `face()`**, then let `happy` and `eager` use their full range (ep 5 capped at 0.48; ep 1's 7
   one-frame swaps). `blink3d.js`, then `crew-animator.md`.
4. **Springs that land:** one rebound, done in 25 frames (`spring(u, a, 0.14, 3, 11)`), anticipation only on the hero
   move at 10-15 % (ep 5: 5 crossings over 65 frames, a 60 % dip on every pop). `crew-animator.md`.
5. **Eyes that lead in 4-6 frames with the body 2-3 frames behind, and a 12-frame blink** (ep 5: 21-frame eye moves
   keyed with the body; 7-frame blinks with 1 frame shut). `crew-animator.md`, `blink3d.js` (`blinkAt`, eye travel).
