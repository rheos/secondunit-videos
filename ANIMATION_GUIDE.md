# Animation guide: read before painting a chapter

A painted music video for Hjeron's solo song "dream of fire" (97.583 s, ~76 BPM half-time pulse,
one beat ≈ 0.79 s). Every frame is drawn in code and repainted by a GPU brushstroke renderer (from
functional-emotions-video, MIT). The shot plan is `STORYBOARD.md`: read the whole thing, then your
chapter. `js/ch/c4.js` (SUNRISE) is the finished reference chapter: read it first and match its
craft. His visual references: `../../hjeron-darkblues-ref/` (character sheet
`wyrd-one-character-sheet.webp`, coat `coat-reference.webp`, his inspiration board in
`inspiration/`). Look at them.

**Direction:** a real music video, mythic and slow-burning, a dark desert blues. Heavy, patient,
ritual. Shots 1.5 to 4 s (longer than a pop video), the camera always drifting, pushing or craning,
action landing on beats and on sung words, motivated cuts. **Never let a frame sit still.**

## Hard rules

- **One character only: The Wyrd One.** Draw him with `wyrd()` and nothing else. No second
  person, no crowd, no faces anywhere. Never the old face-paint / fur / horned look.
- **His face is never seen.** The black veil hangs from the brim over the whole face. No lips,
  beard, eyes, profile. At most ONE ember eye glows through the veil now and then (`eye`), never two.
- **Singing shots:** head frontal or 3/4 (`turn` within ±.5), barely turning, `sing: 1` so the head
  phrases with the vocal; breath and the veil stirring carry it. No profile while singing.
- **He plays right-handed:** body at his right hip (screen left), neck rising to screen right. Only
  flip that (`dir`) if the whole shot is mirrored on purpose.
- **The duster is long and tattered**, ankle length, the hem in ragged strips that stream in the wind
  (`wind`). It's his signature silhouette: give it wind in most shots.
- **The wolfdog is medium size**, lean, pointed ears, a bushy tail. Not a husky, not a giant wolf.
- **No text on screen, ever.** No words, letters, numbers, runes, signs. Pictures only.
- **No skeletons.** A ram skull on the fire ring is fine (it's his real prop); skeleton hands,
  skulls flashed over the frame and Halloween imagery are out (Robin's note on the last video).
- **Lyrics are Hjeron's.** Don't quote lyric lines in code comments; a cue word (`when('gold', 66)`)
  is fine.
- **Pure function of `t`.** Frames render in parallel and out of order. No state between frames, no
  `Math.random()`. Use `hash(i)`, `rng(seed)`, `noise1`/`snoise`.
- **Only edit your own chapter file**, `js/ch/<you>.js`. Shared files (`js/paint.js`, `js/lib.js`,
  `js/cast.js`, `js/main.js`, `index.html`, `js/ch/c4.js`) are read-only for you. Need a helper? Write
  it privately inside your IIFE. Found a real bug in a shared file? Report it; don't edit it.
- Your chapter starts and ends exactly at its storyboard times and honours both handoffs.

## Two formats from one shot

The same code renders 9:16 (1080x1920, default) and 16:9 (1920x1080, `?fmt=16x9`). **Stage every
shot on the square WORLD**: 1920 x 1920, centre `(SC, SC)` = (960, 960). At zoom 1, 9:16 shows world
x 420..1500 (full height) and 16:9 shows world y 420..1500 (full width).

- Keep everything that matters inside the central `SAFE` square (x and y 420..1500) at the shot's
  zoom. Paint the stage (sky, ground, rocks) out to the full 1920 in both directions, and beyond
  if the camera moves.
- Frame with `frame(cx, cy, zoom, rot)` (a `cam()` on the world). Use `pick(vertValue, landValue)`
  for anything that should differ per format (zoom, a subject's x, a pan's range). A tall figure
  shot in 9:16 usually wants `pick(1, .75)` zoom in 16:9 so the hat isn't cropped.
- Screen-space effects (`flash`, `blackout`, `iris`) already use the live `W` and `H`.
- Check BOTH formats before you're done (`check.mjs --fmt 16x9 ...`).

## How rendering works

Every frame you draw two Canvas2D layers:

- **`s`, the underpainting.** Flat shapes, gradients, silhouettes. The GPU repaints it with thousands
  of brushstrokes that sample its colour and follow its edges. **Value contrast and big clear shapes
  are everything.** Details under ~8 px on screen dissolve into paint. Flat areas get swirly stroke
  texture for free.
- **`f`, the light layer.** Black background. Anything drawn here is added as light, with bloom:
  the moon, fire, the ember eye, sparks, smoke, rim light. Use `glow()`, `dot(f, ...)`, `stroke(f, ...)`.
  It ignores depth; to block light behind a body, repaint the silhouette on `f` in black after the
  light (`occlude(() => wyrd(t, x, y, h, { ...o, sil: true, g: f }))`).

Then a **grade pass** applies the section look: saturation, tint, contrast, lift, film scratches,
dust, burned edges, gate weave, flicker, and a scratchboard **etch** that turns the painted frame
into white lines scraped out of black. The etch keys off value: give an ink scene real mid-tones
(moonlit ground, lit dune crests, a pale moon halo) or it goes dead black with only outlines.

## A chapter file

```js
// js/ch/c2.js · FOG (25.833 - 38.750)
(() => {
  function loom(t, lt, dur) { frame(SC, SC, pick(1, .8)); /* paints the ENTIRE frame */ }
  function reach(t, lt, dur) { ... }
  chapter('fog', 25.833, 38.75, [
    [25.833, loom, { xin: .8 }],                          // xin crossfades picture AND look from the previous chapter
    [when('reach', 32), reach, { paint: { ...LOOK.sepia, boil: 10 } }],
  ], { paint: LOOK.sepia });
})();
```

A shot fn is `fn(t, lt, dur)`: song time, time since the shot started, shot length. Call `frame()`
once at the top, then draw the whole frame. `f` starts black each frame. Add your file to
`index.html` before `js/main.js`, in chapter order (c1 ... c5).

## Paint settings and looks

Each chapter's base paint is its `LOOK` preset (`js/cast.js`): `ink`, `sepia`, `rock`, `sunset`,
`cracks`. Override per shot with `{ paint: { ...LOOK.x, key: v } }`, or per frame with `paintSet({...})`.
Stroke keys: `boil` (re-rolls/s, 6 to 12), `bloom` (~1 to 2), `flowK` (swirl), `strokeK` (size),
`grain`, `vig`; **`whip(dx, dy)`** smears strokes for whip pans (~60 = full smear).
Grade keys: `sat`, `tint` [r,g,b], `tintK`, `con`, `lift`, `scratch`, `dust`, `burn`, `etch`, `weave`
(px), `flick`. Numbers and arrays crossfade over a shot's `xin`.

## API

**Math and time:** `clamp lerp inv(a, b, x) smooth`, `ease.out/in/inOut/back/sine`, `hash(i)`,
`rng(seed)`, `noise1(x, seed)`, `snoise`, `TAU`. `kf(t, [[t0, v0], [t1, v1], ...], easeFn)` keyframes
numbers or arrays: use it for every camera move. `hit(t, t0, decay)` is a 1 to 0 envelope for
impacts, flashes and shakes. `shake(t, amt)` returns [dx, dy].

**Music:** `FEAT.beats` is the half-time pulse (~0.79 s); `FEAT.fast` every beat (~0.4 s) for quick
hits. `lastBeat(t)`, `beatAfter(t)`, `beatPulse(t, decay)`, `beatPhase(t)`, `sway(t)`, `bob(t)`.
`F(name, t, smoothFrames)` gives audio features around 0 to 1: `rms low mid high onset perc cent`,
and **`voc`** (the vocal stem). **`when(word, after)`** is the start of the first sung word after
`after` (from his lyric sheet aligned to the vocal stem; still check a must-land hit against
`F('voc', t)`, and it can be ~0.2 s off).

**Drawing** (`g` is `s` or `f`): `fill vgrad rgrad dot poly stroke taper ridge bez at glow`.

**The world** (`js/cast.js`): `sky(top, mid, low, horizonY)`, `ground(y, top, bottom)`,
`stars(t, seed, n, x0, x1, y0, y1, a)`, `clouds(t, seed, y0, y1, c, n, speed)`,
`mesas(y, h, c, seed)`, `saguaro(x, y, h, c, seed)`, `bush(x, y, sz, c, seed)`, `fullMoon(x, y, r)`,
`ramSkull(x, y, sc)`, `fireRing(t, x, y, sc, lit)`, `sparks(t, x, y, spread, rise, n, a)`,
`cracks(t, x, y, reach, open, seed)`, `smokeSerpent(t, cx, cy, R, { ring, a, sq, head, rot })`,
`wolfdog(t, x, y, sc, { dir, walk, sil, sit, look })`, `ember(t, x, y, sz, { eyes: 0 })` (a flame tongue).

**The Wyrd One:** `wyrd(t, x, y, h, o)` with `(x, y)` = ground between his boots and `h` = height hat
crown to sole. Options: `view` (`'front'`, `'back'`, `'sil'`), `turn` (-1..1, 3/4 turn), `guitar`
(`'play'`, `'hang'`, `'none'`), `arms` (`'guitar'`, `'down'`, `'out'`), `sing` (0..1), `eye` (0..1),
`wind` (-1..1), `walk` (gait phase; pass `t * rate`), `rim` (rim-light colour or null), `lit` (0..1
front light on the costume), `strum`, `breath`, `g` (target layer). Returns joints `{ head, eye,
neck, chest, handL, handR, hem }` so you can attach light or smoke to him. At `h` above ~500 the
veil gets its cord texture; below ~150 use `view: 'sil'`.

**Camera and screen:** `frame(cx, cy, zoom, rot)`, `pick(v, l)`, `VERT`, `SAFE`, `SC`, `STAGE`.
After drawing: `flash(k, colour)`, `blackout(k)`, `iris(cx, cy, r)`.

## Style

- **Look:** a moving oil painting (his board is the target). Big dark silhouette against light is the
  strongest value contrast you have: backlight him (moon, sunrise, fire) and let the rim light draw
  the hat and duster. Avoid pure black and pure white in `s`.
- **Composition:** one focal action per shot, low heroic angles, the horizon low, huge skies.
- **Motion:** the camera drifts, pushes, cranes; the hem and smoke always move; hits land on beats.
  Anticipation, overshoot (`ease.back`), settle. A frame that doesn't visibly change for over a second
  is a bug.
- **Transitions:** set up the next shot inside this one (push into an object and its inside becomes
  the next shot; smoke or flame wipes; a whip smear hides a cut). Honour the chapter handoffs.
- **Performance:** keep a frame under ~200 ms. `check.mjs` prints ms/frame.

## Checking your work

From the project root:

```bash
node check.mjs out/check/<you>_a.jpg 26.0 27.2 28.4 29.6 30.8 32.0              # 9:16 sheet (<= 9 frames), ms/frame, errors
node check.mjs --fmt 16x9 out/check/<you>_l.jpg 26.0 28.4 30.8                    # the landscape framing
node check.mjs --full out/check/<you>_full 30.2 33.1                              # full-res stills
```

Open each sheet with the Read tool and look hard. Check the first and last frame of every shot, a few
between, motion around each hit (every 0.1 to 0.2 s), and your chapter's edges. Iterate until every
shot is readable, alive, on the music and true to his canon. The GPU and CPU are shared with other
sessions: use `nice -n 10`, keep sheets small, and never render the whole song.
