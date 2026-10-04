# Animation guide: read before painting a chapter

A painted music video for Pnubb's "Mind The Sheep" (145.7 s, ~80.7 BPM, one beat ≈ 0.72 s).
Every frame is drawn in code and repainted by a GPU brushstroke renderer (from
functional-emotions-video, MIT). The shot plan is `STORYBOARD.md`: read its intro, the world
and cast, then your chapter's brief. `js/ch/hook.js` is the finished reference chapter. Read it first
and match its look.

**Direction:** a real music video, not a lyric video. Deadpan and absurd, like the song:
everything is "fine", and the sheep are the problem. Short shots (1.2 to 3.5 s), the camera always
moving, action landing on beats and on sung words, motivated cuts. **Never let a shot sit still.**

## Hard rules

- **No text on screen, ever.** No words, letters, numbers, signs or labels. Pictures only.
- **No real people's likeness.** The sleeper is a generic mannequin. The sheep are original.
- **The lyrics are the artist's.** Don't quote lyric lines in code comments. A cue word
  (`when('pride', 65)`) is fine. Never draw anything that illustrates the slur in verse 3; that
  line gets an abstract or slapstick image (see your brief).
- **Pure function of `t`.** Frames render in parallel and out of order. No state between frames,
  no `Math.random()`. Use `hash(i)`, `rng(seed)`, `noise1`/`snoise`.
- **Only edit your own chapter file**, `js/ch/<you>.js`. Shared files: `js/paint.js`, `js/lib.js`,
  `js/cast.js`, `js/main.js`, `index.html`, `js/ch/hook.js`. Need a helper? Write it privately in your
  IIFE. Found a real bug in a shared file? Report it in your final message; don't edit it.
- Your chapter must start and end exactly at its brief's times. The next chapter's first shot starts
  where yours ends.

## How rendering works

Every frame you draw two Canvas2D layers in 1920x1080 coordinates:

- **`s`, the underpainting.** Flat shapes, gradients, silhouettes. The GPU repaints it with thousands
  of brushstrokes that sample its colour and follow its edges. **Value contrast and big clear shapes
  are everything.** Details under ~8 px (at screen scale) dissolve into paint. Flat areas get swirly
  stroke texture for free.
- **`f`, the light layer.** Black background. Anything drawn here is added as light, with bloom:
  lamps, glows, eyes in the dark, sparks, moonlight. Use `glow()`, `dot(f, ...)`, `stroke(f, ...)`.
  It ignores depth, so a glow behind a body shows through it. To block light, repaint the silhouette
  on `f` in black after the light: `occlude(() => sheep(t, x, y, sc, { ...o, sil: true, black: true, g: f }))`.

## A chapter file

```js
// js/ch/c3.js · FATHER (51.02 - 69.18)
(() => {
  function statue(t, lt, dur) { ... }          // a shot paints the ENTIRE frame, background included
  function pride(t, lt, dur) { ... }
  chapter('father', 51.02, 69.18, [
    [51.02, statue],
    [53.4, pride, { paint: { boil: 10 } }],      // optional per-shot paint settings
  ], { paint: { boil: 8, bloom: 1.2 } });
})();
```

A shot fn is `fn(t, lt, dur)`: song time, time since the shot started, shot length. Call `cam()` once
at the top, then draw. `f` starts black each frame.

## Paint settings

`boil` (stroke re-rolls per second, 6 to 12), `bloom` (~1 to 2), `flowK` (swirl, 0.5 to 1.5),
`strokeK` (stroke size, 0.7 to 1.5), `grain`, `vig`. Per frame: `paintSet({...})`, and **`whip(dx, dy)`**
smears every stroke along a direction for whip pans (magnitude ~60 is full smear).

## API

**Math and time:** `clamp lerp inv(a, b, x) smooth`, `ease.out/in/inOut/back/sine`, `hash(i)`,
`rng(seed)`, `noise1(x, seed)`, `snoise`, `TAU`. `kf(t, [[t0, v0], [t1, v1], ...], easeFn)` keyframes
numbers or arrays: use it for every camera move and piece of choreography. `hit(t, t0, decay)` is a
1 to 0 envelope from t0 for impacts, flashes and shakes.

**Music:** `FEAT.beats` holds the beat grid (~0.72 s). `lastBeat(t)`, `beatAfter(t)`,
`beatPulse(t, decay)`, `beatPhase(t)`, `sway(t)`, `bob(t)`. `F(name, t, smoothFrames)` gives audio
features around 0 to 1: `rms low mid high onset perc cent`. **`when(word, after)`** is the start time
of the first sung word after `after`, e.g. `when('pride', 65)`. Word times come from Whisper aligned to
the lyric sheet, and can run up to ~0.4 s early on held or repeated words. For a hit that must land on
a sung syllable, check it against `F('rms', t)` or the brief's stem times.

**Camera:** `cam(cx, cy, zoom, rot)` puts world point (cx, cy) at screen centre. `shake(t, amt)` returns
[dx, dy]. Screen-space effects after drawing: `flash(k, colour)`, `blackout(k)`, `iris(cx, cy, r)`.

**Drawing** (`g` is `s` or `f`): `fill(g, c)`, `vgrad(g, y0, y1, stops)`, `rgrad(g, x, y, r0, r1, stops)`,
`dot(g, x, y, r, c)`, `poly(g, pts, c)`, `stroke(g, pts, c, w)`, `taper(g, a, b, w1, w2, c)`,
`ridge(g, y, amp, freq, seed, c)`, `bez(p0, p1, p2, p3, n)`, `at(pts, u)`, `glow(x, y, r, 'rgba(...)')`.
Scenery (`js/cast.js`): `sky(top, mid, low, horizonY)`, `clouds(t, seed, y0, y1, c, n, speed)`,
`stars(t, seed, n, yMax, a)`, `moon(x, y, r)` (crescent), `fullMoon(x, y, r)`, `fence(g, x0, x1, yGround, h, c, post)`.

**The sheep** (the star): `sheep(t, x, y, sc, { air, dir, lids, look, seed, sil, black, sit, bob, g })`.
(x, y) is the ground under its middle; `sc` is about half the body width in px (70 to 120 in a wide
shot, 400+ for a close-up). `air` null = standing, 0 to 1 = through a leap. `dir` 1 faces right, -1 left.
`lids` 0.4 to 0.7 is heavy-lidded deadpan (the character; don't open the eyes wide unless a gag needs
it). `look` [x, y] moves the pupils. `sil` = dark silhouette. `sit` 0 to 1 = sits back. `bob` = vertical
offset for walks and beats. Returns `{ head, body }` in world coords, so you can attach props
(hats, ties, glasses) at `head`. Accessories are yours to draw privately.

**The sleeper and the bedroom:** `bedroom(t, { lamp, eye, moonA })` paints the whole side-view room
with the sleeper face-up in bed, lamp at left (x ~310) and window at right. `eyeGlint(eye, a)` puts
light in the open eye for dark shots. For the sleeper out of bed (in the dream), use
`figure(s, pose, { x, y, sc, color, coat, headC, limbC })` with pyjama colours (`coat: '#3b4d8e'`,
`headC: SKIN`), plus `POSE` and `groove(base, style, t, amt)` (`idle nod sway bounce funk walk`).
**Use groove on anyone who isn't mid-action.**

## Style

- **Look:** a moving oil painting. Night blues and violets, warm amber lamplight, cream wool against
  navy. The sheep's black face against light, or its cream wool against dark, is the strongest value
  contrast you have: use it. Avoid pure black and pure white in `s`.
- **Composition:** one focal action per shot, big silhouette, the subject where the camera leads.
- **Motion:** camera drifts, pushes or whips. Characters groove. Hits land on beats. Anticipation,
  overshoot (`ease.back`), settle. A frame that doesn't visibly change for over a second is a bug.
- **Transitions:** set up the next shot in this one (a push into an object becomes its inside, a whip
  smear hides the cut). Your first shot should pick up from how the previous chapter ends, per the
  brief.
- **Performance:** keep a frame under ~150 ms. `check.mjs` prints ms/frame.

## Checking your work

From the project root:

```bash
node check.mjs out/check/<you>_a.jpg 51.2 52.0 52.8 53.6 54.4 55.2   # contact sheet (<= 9 frames), ms/frame, errors
node check.mjs --full out/check/<you>_full 60.2 63.1                 # full-res stills
```

Open each sheet with the Read tool and look hard. Check the first and last frame of every shot, a few
between, motion around each hit (every 0.1 to 0.2 s), and your chapter's edges. Iterate until every
shot is readable, alive and on the music. The GPU is shared by several painters: keep sheets small
and don't run renders of the whole song.
