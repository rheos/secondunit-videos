# Look bible: motion

Measured 2026-11-02 for the devweb look bible (bureau run `20261102-devweb-look-bible`). Quality bar: cinetic's four
example films (quire, kiln, ledgerly, halden). Ours: episode 1 draft 6 (approved oner) and episode 5 finish d2
("ours now"). Text-only cross-check: the 20-shorts camera numbers in `refs/omi-motion-report.md` of that run.

**Units.** px = pixels on a frame whose short side is 1080 (all six videos). f = one frame at 60 fps. %/f = change of
picture scale per 60 fps frame. To compare with the 20-shorts report (720 short side, 30 fps): its px/f = ours x 1.33,
its %/f = ours x 2. Its classes (hold < 0.3, move >= 2 px/f) are hold < 0.225, move >= 1.5 px/f here.

## 1. Verdict

1. **Our moves travel 7.5 times as far and last twice as long.** A camera move in ep 5 covers a median 1175 px
   (1.1 frame widths) and 61 % zoom over 144 f. cinetic's camera moves cover 156 px and 24 % zoom over 68 f. The
   20-shorts report agrees with cinetic almost exactly: 152 px and 23 % zoom per move, over 46 f. Ep 1 sat closer
   (353 px, 13 % zoom, 56 f): ep 5 drifted away from the approved episode.
2. **Our motion blur shows two sharp copies; cinetic's is one smear.** `finish.sh` averages 2 renders per output
   frame (`tmix=frames=2`), so anything moving v px/f prints twice, v/2 px apart. 36 % of ep 5's frames move at
   4 px/f or more (copies 2 px or more apart) and 20.5 % at 10 px/f or more (5 px or more). Checked by eye at 22.83 s
   (38.8 px/f): the card text sits twice, about 19 px apart (`sheet_blur.jpg`). cinetic at 100 px/f (kiln 15.97 s)
   is one continuous smear with the subject sharp.
3. **Every ep 5 move has the same shape.** 23 of 26 measured moves fit the kit's `io` (cubic in-out, peak speed 3.0x
   the mean) with the peak in the middle (median peak position 0.50, release/attack 0.98). cinetic's 7 camera moves
   mix shapes: 3 cubic-out, 2 in-out, 1 smootherstep, 1 ease-in, peak position 0.19-0.76.
4. **cinetic's picture moves through its elements, ours through the camera.** cinetic: camera moving in 18-31 % of
   frames, an element moving in 37-43 %. Ep 5: camera moving in 48 % of frames, an element moving in 21 %. Ep 1: 37 %
   and 45 %, close to cinetic.
5. **Every cinetic scene change carries one element across; 3 of 5 of ours do.** 11 of 11 cinetic changes keep one
   element on screen through the change (a morph, a split, or a zoom anchored on it). Of 5 of our travels checked,
   3 follow an element and 2 pan over still set.

## 2. Method

- **Camera, per frame (`motion_fit.py`, `lk.py`).** Every frame pair, decoded grey at half size. A grid of 128 px
  tiles (64 px step) is matched by phase correlation for a robust similarity fit (shift, zoom, roll) with outlier
  rejection; that fit seeds a Lucas-Kanade refinement on the inlier tiles' textured pixels with Tukey weights, so
  independently moving elements drop out. Synthetic check (`test_fit.py`, a real frame warped by known amounts):
  shift error <= 0.04 px at half size (0.08 px full), zoom error <= 0.0002, roll error <= 0.015 deg. Phase
  correlation alone read 0.30 px as 0.16 px (the windowing bias that misled earlier studies), so it is only the seed.
- **Masks.** Ours: rows 0-160 (the `~/devweb` and `// topic` tags) and 1560-1920 (captions and progress bar) are
  never used. cinetic carries no captions; its fixed headers are design and stay in.
- **Frames.** Every frame of all six videos: 3,180 cinetic frames (quire 720, kiln 1,500, ledgerly 600, halden 360)
  and 10,494 of ours (ep 1 2,720, ep 5 7,774).
- **Statistics (`motion_stats.py`, `summary.py`, output `stats.json`, `summary.md`).** Speed = shift combined with
  zoom and roll times the half diagonal (1101 px), smoothed with a Gaussian of 2.4 f (the 20-shorts sigma 1.2 f at
  30 fps). Moves are runs >= 1.5 px/f whose peak is >= 4.5 px/f, extended to 5 % of the peak; attack and release are
  timed to 10 % of the peak; shape is the best of nine easing profiles by rms. Creep = zoom smoothed over 15 f in
  frames whose shift is under 1.5 px/f. Kicks = the shift minus a 6 f smooth flipping sign 3 or more frames running.
  "Element moving" = the 90th percentile of tile shifts left over after the camera fit is >= 1.5 px/f.
- **Ours from the code too (`keys_dump.mjs`, `keys_dump_ep01.mjs`, `keys_math.py`).** Each project's `KEYS` evaluated
  against its `vo/words.js` and turned into screen moves with the `io` peak (3.0x mean). Ep 5's code says 25 moving
  segments, median 186 f, peak 25.9 px/f; the video says 26 moves, 144 f between the 5 % points, 22.6 px/f. The two
  agree, and the shape fit recovered `io` with rms 0.02-0.09, which checks the method on a curve we know.
- **Eye checks.** Every cinetic move, cut, kick and punch the detector found was looked at on a strip
  (`strip.py`, `crops/chk_*.jpg`) and classed as camera or element. Side-by-side sheets, ours on top:
  `sheet_moves.jpg` (moves), `sheet_blur.jpg` (blur), `crops/chk_ep05_travels.jpg` (four of our travels).
- **Element glides (`track.py`, `track.json`).** Colour masks on chosen cinetic elements. Most masks caught more than
  one element, so only the glides confirmed on a strip are quoted below; the rest are unmeasured.

All scripts and data: `RUN_DIR/look/motion/` (`.bureau/runs/20261102-devweb-look-bible/look/motion/`). Re-run:
`run_all.sh` (or `run_ep05_chunks.sh` for a long master in six parallel ranges), then `motion_stats.py` and `summary.py`.

## 3. Tables

### 3.1 The whole film, measured from the video

| measure | quire | kiln | ledgerly | halden | **ep 1 d6** | **ep 5 d2** | 20 shorts (converted) |
|---|---|---|---|---|---|---|---|
| length | 12 s | 25 s | 10 s | 6 s | 45.3 s | 129.6 s | 31-78 s |
| camera hold (< 0.225 px/f) | 46 % | 35 % | 42 % | 14 % | 30 % | 20 % | 10 % |
| camera drift (0.225-1.5) | 36 % | 34 % | 27 % | 39 % | 34 % | 31 % | 24 % |
| camera move (>= 1.5) | 18 % | 31 % | 31 % | 48 % | 37 % | 48 % | 65 % |
| median camera speed | 0.34 px/f | 0.63 | 0.39 | 1.10 | 0.79 | 1.31 | 2.7 |
| p90 camera speed | 3.5 px/f | 14.3 | 12.0 | 19.3 | 12.2 | 16.2 | 12.7 |
| frames at >= 4 px/f | 10 % | 20 % | 23 % | 33 % | 20 % | 36 % | unmeasured |
| longest camera hold | 110 f | 168 f | 191 f | 50 f | 168 f | 114 f | unmeasured |
| camera holds over 8 f | 6 | 7 | 3 | 1 | 10 | 37 | unmeasured |
| an element moving | 43 % | 37 % | 41 % | 40 % | 45 % | 21 % | unmeasured |
| whole picture still | 24 % | 15 % | 14 % | 12 % | 15 % | 9 % | unmeasured |
| longest whole-picture still | 37 f | 66 f | 21 f | 25 f | 59 f | 50 f | unmeasured |
| creep: quiet frames zooming >= 0.025 %/f | 39 % | 57 % | 14 % | 82 % | 49 % | 37 % | 70 % |
| creep: median rate when zooming | 0.076 %/f | 0.098 | 0.127 | 0.104 | 0.065 | 0.053 | 0.07 |
| creep: share pushing in | 68 % | 44 % | 67 % | 0 % | 64 % | 60 % | 83 % |
| sustained creep runs (>= 30 f, one direction) | 1 run, 18 % of frames | 9, 36 % | 0, 0 % | 2, 48 % | 9, 22 % | 16, 14 % | 336 push-ins, 180 pull-outs |
| shake floor (high-frequency residual) | 0.032 px | 0.047 | 0.027 | 0.059 | 0.044 | 0.038 | 0.12 |
| hard cuts (checked by eye) | 1 | 0 | 0 | 0 | 0 | 0 | 0-1 per video |
| camera kicks (checked by eye) | 0 | 0 | 0 | 0 | 0 | 0 | 6-7 f30 kicks on impacts |

Halden's "camera" is one mark on a blank page that changes shape, so its camera rows measure the mark, not a camera.
The 20-shorts column is that report's median converted to our units (speeds x 0.75, lengths in px x 1.5, %/f x 0.5,
frames x 2). Ep 5's two kick hits (5.82 s, 8.58 s) were looked at: smooth pans over a near-empty frame (fit noise).

### 3.2 Camera moves (eye-checked camera moves only)

cinetic, 7 camera moves in 53 s (the detector also found 7 element morphs, which are left out):

| film | t | what | length | peak | attack / release | peak at | travel | zoom | shape |
|---|---|---|---|---|---|---|---|---|---|
| quire | 8.68 s | pull out: the week collapses to a stack | 40 f | 58.8 px/f | 19 / 16 f | 0.54 | 487 px | -86 % | cubic in-out |
| ledgerly | 2.50 s | reframe as the receipt splits into four cards | 59 f | 13.0 | 41 / 13 | 0.76 | 156 | +6 % | smootherstep |
| ledgerly | 8.45 s | pan up, back to the receipt (the loop) | 135 f | 17.4 | 50 / 72 | 0.38 | 1191 | +17 % | cubic out |
| kiln | 2.08 s | crane out: the chip becomes one tile of the wall | 78 f | 69.0 | 13 / 53 | 0.19 | 252 | -185 % | cubic out |
| kiln | 6.40 s | slow pull out as the wall assembles | 68 f | 10.7 | 19 / 33 | 0.28 | 55 | -24 % | cubic out |
| kiln | 12.02 s | slow pull out over the red wall | 102 f | 6.5 | 59 / 36 | 0.60 | 43 | -19 % | cubic in |
| kiln | 15.97 s | push in through the wall to the chip | 43 f | 100.2 | 20 / 14 | 0.60 | 122 | +166 % | cubic in-out |
| **median** | | 1.3 moves per 10 s | **68 f** | **17.4** | **20 / 33** | **0.54** | **156 px** | **24 %** | mixed |

Also seen: one hard cut (quire 2.0 s: the same calendar from close to wide in one frame) and one whip zoom (kiln
5.6 s: the wall collapses to the chip in about 8 f under heavy blur). Six of the seven moves are scale moves (in or
out on an element); one is a pan.

Ours:

| | moves per 10 s | length | peak | attack / release | peak at | travel | zoom | shapes |
|---|---|---|---|---|---|---|---|---|
| ep 1 d6 (12 camera moves; the hook title's scale-down at 1.5 s left out) | 2.6 | 56 f | 18.5 px/f | 26 / 21 f | 0.51 | 353 px | 13 % | 8 of 13 cubic in-out |
| ep 5 d2 (26 moves) | 2.0 | 144 f | 22.6 | 63 / 61 | 0.50 | 1175 | 61 % | 23 of 26 cubic in-out |
| 20 shorts (converted) | 6.0 | 46 f | 10.3 | 20 / 20 | 1.0 attack/release, 62 % symmetric | 152 | 23 % | in-out |

### 3.3 Element glides on cinetic (confirmed on strips)

| film | element | length | how |
|---|---|---|---|
| quire | a day slot fills with ink | 4-6 f | a radial bloom with motion blur (tip track 506 -> 800 px in 4 f) |
| quire | the filled slot's blue settles to black | about 36 f | counted on the contact sheet (18 sheet frames at 30 fps) |
| halden | the h mark shrinks to word size | 59 f | in-out; its left edge travels 190 px |
| halden | the letters of the word rise in after it | about 6 f each, staggered | counted on the strip |
| kiln | the other code lines fade, leaving the changed line as a chip | 12-14 f | counted on the contact sheet |

### 3.4 Scene changes

| film | change | carried by |
|---|---|---|
| halden | cursor bar -> dot -> h | morph |
| halden | h -> the word | the h stays and the word grows from it |
| kiln | code -> chip | the changed line isolates |
| kiln | chip -> wall | crane out, the chip stays lit in the wall |
| kiln | wall -> chip | whip zoom onto the chip |
| kiln | chip -> branches | push in, rings grow from the chip |
| kiln | chip -> logo | the chip turns red and morphs into the mark |
| ledgerly | receipt -> four cards | the receipt splits |
| ledgerly | four cards -> receipt | pan back up (the loop) |
| quire | day -> next day (x5) | the blue line runs on to the next slot |
| quire | week -> stack -> name | the week collapses; the name appears under the stack |

11 of 11 carried by an element. Ours, 5 travels checked (`crops/chk_ep05_travels.jpg`, `crops/chk_ep05_kick8.58.jpg`):
ep 1 14.6 s follows the JSON card into Blink's visor, ep 5 8.7 s follows a card down the cord to the box, ep 5
47.67 s follows the counter down the column; ep 5 90.47 s (folders to toolbox) and 119.15 s (folders to column) pan
over still set. The other 33 travels: unmeasured.

## 4. Recipe in our stack

We keep our palette, Blink, one world and one camera that never cuts. We take cinetic's move size, shapes, blur and
element-led changes, not its shots.

### 4.1 `world.js`: `cameraPath` with short glides, a choice of ease, and a real creep

Today every key-to-key gap is one `io` ease, so a move always lasts the whole gap between two words (ep 5: 186 f
median from the code) and stops dead at every key. The sine drift (0.06 / 0.04 units) measures below the hold
threshold in both episodes (quiet-frame drift 0.04-0.19 px/f), so it reads as frozen. Replace with:

```js
// glides: a key may set { glide: s, ease: "smoother" | "out" | "io", creep: per-frame zoom } as its 5th element.
// The glide ENDS on the key's time (camera.md anchors keep their meaning) and lasts `glide` s (default 1.1 s = 66 f);
// before it the camera holds the previous framing and creeps toward its target. Peak speed with smootherstep is
// 1.875 x travel / length, so keep length_f >= 0.094 x travel_px for a peak of 20 px/f.
export const smoother = (x) => { x = cl(x); return x * x * x * (x * (6 * x - 15) + 10); };
export const outCubic = (x) => { x = cl(x); return 1 - Math.pow(1 - x, 3); };
const EASE = { smoother, out: outCubic, io };
const lerp3 = (a, b, k) => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
// dolly toward the target: the picture grows by `rate` per 60 fps frame (negative pulls out)
const creepPos = (p, g, rate, frames) => { const s = Math.pow(1 - rate, Math.max(0, frames)); return [g[0] + (p[0] - g[0]) * s, g[1] + (p[1] - g[1]) * s, g[2] + (p[2] - g[2]) * s]; };
export function cameraPath(KEYS, { creep = 0.0008 } = {}) {
  return function cameraAt(t, cam) {
    let i = 0;
    while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
    const [t0, p0, g0, f0, o0 = {}] = KEYS[i], [t1, p1, g1, f1, o1 = {}] = KEYS[i + 1];
    const len = Math.min(o1.glide ?? 1.1, t1 - t0), ts = t1 - len;
    const rate = o0.creep ?? creep;
    const held = creepPos(p0, g0, rate, (Math.min(t, ts) - t0) * 60); // where the hold has crept to
    const k = t <= ts ? 0 : EASE[o1.ease || "smoother"]((t - ts) / Math.max(0.001, len));
    const pos = lerp3(held, p1, k), tgt = lerp3(g0, g1, k);
    cam.position.set(...pos); cam.fov = mix(f0, f1, k); cam.updateProjectionMatrix(); cam.lookAt(V(...tgt));
  };
}
```

Values:

- `creep` default 0.0008 (0.08 %/f; cinetic 0.076-0.127 %/f when zooming, the 20 shorts 0.07). Payoff holds push in
  at 0.0008-0.0013 for 60-130 f (quire's last hold: 0.074 %/f for 128 f). After a pull-out, keep pulling at
  -0.0010 to -0.0028 for 50-110 f (kiln's settle runs: -0.17 to -0.28 %/f). Set `creep: 0` on a key whose hold has an
  element acting, so the camera locks while it acts (cinetic locks the camera for 35-46 % of frames).
- `glide` 0.7-1.3 s (40-80 f). Peak at most 20 px/f (cinetic median 17.4; the 20 shorts 10.3, p75 18.5).
- `ease`: `smoother` by default (peak 1.875x mean, against `io`'s 3.0x: at ep 5's lengths that alone drops the median
  peak from 22.6 to about 14 px/f). `out` for a move that starts on its word and settles (cinetic: 3 of 7). Keep `io`
  for at most a third of the moves.
- The fog in ep 5's `world.js` reads `targetAt(t)`, which copies the easing; it must call the same glide maths (export
  a `targetAt` from `cameraPath` rather than copying it again).
- Finished episodes keep their own `kit/` copy (`sync.sh` stamps a VERSION), so this changes new episodes only.
- The crew-dp default today asks for creeps of 0.15-0.35 % per 30 fps frame (0.075-0.175 %/f here); 0.08 sits at its
  low end, inside cinetic's range.

### 4.2 `crew-dp.md`: move size and how a station change is made

Replace the default line "travels are smootherstep glides of 18-40 frames at 30 fps..." with:

- **One move travels at most 600 px on screen (just over half the frame width) and at most 60 % zoom.** Aim for
  150-350 px and about 25 % (cinetic and the 20 shorts: 152-156 px and 23-24 %). Ep 5's median was 1175 px and 61 %.
- **A move lasts 40-80 f at 60 fps (0.7-1.3 s)**, set with `glide`; the key's time is where it lands. Length
  >= 0.094 x travel in px, so 350 px needs 33 f (use 40), 600 px needs 56 f.
- **A station further than 600 px is reached by scale through an element**, never one long pan: pull out on the
  element until both stations are in frame (60-80 f, `ease: "out"`), hold or creep, then push in on the next element
  (40-60 f). This is kiln's chip -> wall -> chip. A blurred whip of about 8 f is allowed only after 4.3 lands.
- **About 1.5-3 moves per 10 s** (cinetic 1.3 plus its cut and whip, ep 1 2.6, ep 5 2.0, the 20 shorts 6.0). With
  shorter moves, more of them fit; the 20 shorts' rate is the ceiling, not the target.
- **Holds.** The camera may lock when an element is acting. The whole picture is never still for more than 40 f
  (cinetic's longest runs: 21-66 f, median 31; ep 1 59 f, ep 5 50 f).
- **Every station change names its lead element** in camera.md's Why column (the packet, the card, the counter,
  Blink's gaze) and that element is on screen before and after the move. 11 of 11 in cinetic; 3 of 5 checked in ours.
- **No shake, no kicks, no cuts.** cinetic has none in 53 s, apart from one match cut we do not take; the kit README
  already bans per-frame shake. The 20 shorts' frame-alternating impact kicks are not adopted: our 2-sample blend
  would print them as ghosts. The single payoff punch below is the only impact.
- Payoff punch (optional, once per film, n = 1 in cinetic: quire 6.17 s reaches +0.51 %/f then pulls back): a key
  with `ease: "out"`, `glide: 0.12` and a fov 2-3 % narrower than the next key's, followed by a 0.4 s key back out.
  The 2-3 % and the 0.12 / 0.4 s are a judgement from one sample, not a measurement.

### 4.3 `finish.sh`: motion blur without double images

Render 240 fps and average 4 renders per output frame (a 360 degree shutter, copies v/4 apart instead of v/2):

```bash
nice -n 10 npx --yes hyperframes@0.8.162 render -f 240 -q looks --quiet -o "$raw" > qa/finish-render.log 2>&1
# ...
-vf "tmix=frames=4:weights='1 1 1 1',select='not(mod(n\,4))',setpts=N/(60*TB),format=yuv420p,setparams=..."
```

The render has twice as many frames to draw, so expect about twice the render time (not timed yet). With moves capped at 20 px/f the
copies sit at most 5 px apart and overlap into a smear. Check the fastest frame of the next finish at full size
before signing off. If the render time is too high, a screen-space blur pass keyed to the camera's own motion
(12 taps along the per-frame screen motion, in `stage()`) does the same for the camera at no extra render; elements
would keep the 2-sample blend. cinetic's sample count is unmeasured.

### 4.4 Elements (`crew-animator.md`, station files)

- While the camera holds, an element moves: target 35-45 % of frames with an element moving (cinetic 37-43 %, ep 1
  45 %, ep 5 21 %). The camera's own share then falls toward 30 % (cinetic 18-31 %, ep 5 48 %).
- Element glides stay short: 0.3-0.4 s windows (`r01(t, a, 0.3)` to `0.4`, already ep 5's most common: 44 of the 107
  windows with a literal length), state changes in 4-6 f (quire's slot fill), colour settles over about 36 f.
- Use a mix of `io`, `back` and an out-ease on elements, as on the camera.

## 5. Top five changes, ranked by visual impact

1. **Shorter camera moves** (`crew-dp.md` move-size rules, `world.js` `glide`): 1175 px over 144 f -> 150-350 px over
   40-80 f, with far stations reached by pull-out and push-in through an element.
2. **Motion blur without double images** (`finish.sh`: 240 fps, `tmix=frames=4`): today 36 % of ep 5's frames print
   two copies 2 px or more apart.
3. **Smootherstep by default and a mix of shapes** (`world.js` `EASE`, `ease` per key): 23 of 26 moves are `io`
   today; at the same lengths `smoother` alone cuts the peak from 22.6 to about 14 px/f.
4. **Let elements carry the holds** (`crew-dp.md` holds, `crew-animator.md`): elements moving 21 % -> 35-45 % of
   frames, camera moving 48 % -> about 30 %, and the invisible sine drift replaced by a 0.08 %/f creep.
5. **Every station change follows a named element** (`crew-dp.md`): 3 of 5 checked travels today, 11 of 11 in cinetic.

## 6. Limits

- cinetic is motion design without a narrator: its "camera" is the whole picture's transform, and in a frame that
  holds one element (halden, kiln's last 5 s) the camera and the element cannot be told apart. Every cinetic move in
  3.2 was classed by eye.
- Ours are 3D shots with parallax; the similarity fit reads the dominant plane. The code numbers (`keys_math.py`)
  agree with the video numbers within 25 % on length and peak.
- Camera-to-word timing in cinetic: unmeasured (no narration). The lead element's timing relative to the move:
  unmeasured. Shutter and sample count of cinetic's blur: unmeasured.
- Only 5 of our 38 travels were checked for a lead element.
- The 20-shorts numbers are text only, measured by another study on a different style.
