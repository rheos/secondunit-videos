# Animation guide: read before painting a chapter

Gemma Luna's live cover of Tom Waits' "Clap Hands" (186.0 s, ~120 BPM, one beat = 0.5 s), painted in
code in **Art Nouveau**. Every frame is drawn as a flat underpainting and repainted by a GPU brushstroke
renderer (`js/paint.js`, from functional-emotions-video, MIT). The shot plan is `STORYBOARD.md` (local
only): read its intro and your chapter's brief. **`js/ch/c02.js` is the finished, approved reference
chapter.** Read it and `js/world.js` first, and match their look.

## Direction

A real music video, not a lyric video. The world is the Art Nouveau city at night in the rain: Guimard
ironwork and his lily-bud Metro lamps, Galle glass, Tiffany-style stained glass, Mucha's halo circles and
arched borders, whiplash curves everywhere. Tom Waits' surreal street poetry is told with **objects**,
never people. Camera always drifting or pushing; action lands on beats and sung words. Shots of 1.5 to
4 s, motivated cuts. A frame that doesn't visibly change for over a second is a bug.

## Hard rules

- **No people.** No figures, no faces. The only body parts ever shown are clapping hands, and only where
  your brief says (most claps are carried by something else: a lamp, a door, a burst of lilies).
- **Hands clap as three key drawings** (Robin's rule): use `clapPair(t, cx, cy, sc, k)`. It swaps
  drawings by distance: open palms apart, a narrowed three-quarter turn as they close, palm to palm only
  around the hit. Never draw your own clapping hands, never open palms meeting edge on.
- **No text on screen, ever.** No letters, numbers, signs or labels (a banknote is a plain green shape).
- **The lyrics are Tom Waits'.** Don't quote lyric lines in code comments; a cue word is fine.
- **Pure function of `t`.** Frames render in parallel and out of order. No state between frames, no
  `Math.random()`. Use `hash(i)`, `rng(seed)`, `noise1`, `snoise`.
- **Only edit your own chapter files** (`js/ch/cNN.js`). Shared files (`js/core.js`, `js/world.js`,
  `js/paint.js`, `js/main.js`, `index.html`, `js/ch/c02.js`) are read-only: write private helpers inside
  your IIFE, and report real bugs in shared files in your final message.
- Your chapter starts and ends exactly at its brief's times (use the `SEC` constants), and its first
  shot picks up from how the previous chapter ends, per the brief.
- One location per chapter, moving forward. Quick cuts are framings within it, never hops back.

## How rendering works

Every frame you draw on two Canvas2D layers in **1080 x 1920 (9:16) coordinates**:

- **`s`, the underpainting.** Flat shapes and gradients with **heavy umber contours (12 to 24 px)**. The
  GPU repaints it with brushstrokes that follow its edges, so a thick contour survives as a painted line
  and anything under ~8 px dissolves. Big clear shapes and value contrast are everything.
- **`f`, the light layer.** Black each frame; anything drawn there is added as light with bloom: lamps,
  lit glass, rain glints, sparks, lightning. Use `glowAt()` or draw on `f` with `lighter`. Light ignores
  depth: to hide a glow behind a solid, repaint that solid on `f` in black after the glow.

## A chapter file

```js
// js/ch/c05.js · VERSE 3 (89.7 - 111.8)
(() => {
  function street(t, lt, dur) { cam(540, 960, 1 + lt * .02); /* paint the ENTIRE frame, background first */ }
  function dreams(t, lt, dur) { ... }
  chapter('c05', SEC.v3, SEC.b1, [
    [SEC.v3, street],
    [95.24, dreams],
  ], { fx: PAINT });                      // paint settings; a shot may override: [t, fn, { fx: { ...PAINT, bloom: 1.4 } }]
})();
```

A shot fn is `fn(t, lt, dur)`: song time, time since the shot started, shot length. Call `cam()` once at
the top, then paint the whole frame (it starts undefined). Every shot calls `border(t, 1)` last, like
c02, so the Mucha frame holds the whole video together (except where a brief says otherwise).

## API

**Time and math** (`js/core.js`): `clamp lerp inv(a, b, x) smooth`, `ease.out/in/inOut/back/sine`,
`hash rng noise1 snoise TAU`, `kf(t, [[t0, v0], [t1, v1]], ease)` for every move, `hit(t, t0, decay)`
(1 to 0 envelope), `onTwos(t)`.
**Music:** `FEAT.beats` (0.5 s grid), `lastBeat(t)`, `beatPulse(t, decay)`, `F(name, t)` features ~0..1
(`rms voc low mid high onset perc`). `CLAPS` / `HANDS`: every sung "clap" and "hands" (from the vocal
stem, trust these). `SEC`: section boundaries. Word times in your brief come from Whisper on a live take
and can be ~0.3 s off; for a hit that must land on a syllable, look at `F('voc', t)` around it.
**Camera:** `cam(cx, cy, zoom, rot)` puts world point (cx, cy) at screen centre, on both layers.
**Kit** (`js/world.js`): palette `C` (cream parch gold ochre sage olive teal deep rose blush plum umber
night dusk ruby amber glass), `PAINT`; `shape(g, pts, fill, line, lw)`, `P(g, pts)` (path only),
`circle(x, y, r)`, `cub(p0, p1, p2, p3)`, `whip(p0, p1, p2, p3, curl, dir)` (whiplash ending in a spiral),
`vine(g, pts, w0, w1, col, u)` (tapered outlined stroke grown to fraction u), `petal`, `lily(g, x, y,
ang, sz, open, cols)`, `halo(cx, cy, R, rot, lit)`, `rain(t, n, seed, a)`, `glowAt(x, y, r, rgba)`,
`guimard(x, y, h, dir, lit, sway)` (Metro lamp), `glassPanel(x, y, w, h, t, lights)`, `border(t, u)`,
`clapPair(t, cx, cy, sc, k, { tone })`, `blobPts(...)`, `handShape`.

## Style

- **Palette:** muted Mucha: sage, gold, dusty rose, cream on teal / plum / night blue; ruby and amber
  for lamplight. Avoid pure black and pure white in `s`.
- **Line:** everything has an umber contour. Curves are whiplash curves; straight lines are rare.
- **Ornament grows:** vines, tendrils and petals unfurl with the music (`vine(..., u)`, `lily(..., open)`).
- **Transitions:** set up the next shot in this one (push into an object, an iris through a halo, a
  curtain, a whip of rain). Hand off to the next chapter as your brief says.
- **Performance:** aim for a frame under ~200 ms (`check.mjs` prints ms/frame) so renders stay quick. It is a soft guide for local GPU time, not a limit: never trade the look for it on a short stretch.

## Checking your work

From the project root:

```bash
node check.mjs index out/check/c05_a.jpg 89.8 91 92.5 94 95.3 97   # contact sheet (<= 9 frames), ms/frame, errors
node check.mjs index --full out/check/c05_full 95.3 103.9           # full-res stills
```

Open each sheet with the Read tool and look hard: first and last frame of every shot, a few between,
every hit (step 0.05 to 0.1 s around it), and both chapter edges (your first frame against the previous
chapter's last). Iterate until every shot is readable, alive and on the music. The GPU is shared by
several painters: keep sheets small, never render video.

## Cast

Robin, 2026-10-01: the people the song names may now appear. "No characters" only ever meant "never
the performer". This section overrides the "No people" rule above for **these characters only**. Never
draw Gemma Luna or anyone like her: no young woman with long hair, no guitar, no singer at a mic.
Clapping hands still follow the three-key-drawing rule (`clapPair`).

`js/cast.js` (loaded after `js/world.js` in `index.html`) is the shared cast kit. Use it so the
characters look like one cast; don't draw your own people. `cast.html` is the turnaround page
(`node check.mjs cast out/check/cast.jpg 0.5 2.5 ...`): 0 conductor, 2 passengers, 4 jacket man,
6 window leaner, 8 millionaire, 10 Harlem walker, 12 Knickerbocker, 14 the band (topples from 15),
16 sailors and rowers, 18 to 20 the whole cast lined up, 20 to 23 close portraits.

**Look:** Lautrec cabaret caricature in Nouveau line. Profile figures about five heads tall, a big
pointed nose, a dot eye under a lid line, a heavy brow, a mouth line, flat palette colour and umber
contours that scale with size. Everyone shares one rig, so proportions and line stay consistent.

**Coordinates.** Every function draws on `s` (props light `f`: lantern, buttons, monocle, drum flash)
and returns the figure's joints in screen coordinates.
- `(x, y)`: standing poses use the ground point under the feet. Seated poses (`sit`, `slump`, `row`,
  `leanOut`) use the seat surface under the hips.
- `sc`: standing height in px, soles to crown, hat not included. A hero is 600 to 900. 400 is a group.
  150 to 280 is far off: below about 220 the kit thins the contours, thickens the limbs, enlarges the
  head and drops small details, so it still reads.
- `facing`: 1 faces right, -1 faces left.
- `rot`: an extra whole-figure screen rotation about `(x, y)`.

**Phase.** Poses are driven by `ph`, measured in cycles: one stride pair, one shovelful, one oar stroke.
`beatPhase(t)` returns a phase that is an integer on every beat of the song. Pass `beatPhase(t)` for one
cycle per beat (drum, tambourine). Pass `beatPhase(t) / 2` for one cycle every two beats (walk, row).
Every function is pure in `t` and its arguments.

**The rig:** `person(t, x, y, sc, { who, style, pose, ph, facing, rot, view, hat, mouth, under, before, mid, after, ...poseOpts })`
- `who`: a preset from `CAST`. `style` overrides any of its fields: `kind`, `coat`, `trousers`, `hat`,
  `hatC`, `bandC`, `h`, `body`, `belly`, `nose`, `chin`, `moustache`, `mouth`, `brow`, `check`,
  `stripes`, `buttons` and so on.
- `view: 'back'`: a symmetric back view, walking away from camera.
- Hooks draw props at the right depth. Each one gets the unrotated joints `J`.
  - `under`: before the far leg.
  - `before`: after the far limbs, behind the body.
  - `mid`: after the torso and head, before the near arm.
  - `after`: on top.
- Returns `{ hand, farHand, hc (head centre), top (crown), neck, pel, legs[{hip, knee, ank, toe}],
  arms[{sho, el, wr}], h, fx, lw, ground }`. Index 0 is the near limb, 1 the far one.

**Poses (`pose`):**

| pose | phase | options |
|---|---|---|
| `stand` | idle breathing | |
| `walk` | one stride pair per cycle | `stride`, `swagger`, `lean` |
| `limp` | lame near leg, dips onto the cane | |
| `sway` | holds a strap overhead and rocks | `amp` (rotation in radians), `flail` |
| `sit` | | |
| `slump` | folded, head hung | |
| `leanOut` | | `lean` |
| `shovel` | bite at 0, lift .38, throw .62 | |
| `row` | catch at 0, finish .4 | |
| `drum` | beater hits at each integer | `march` (stride) |
| `tuba` | | `march` |
| `tambourine` | slap at each integer | `march` |
| `wave` | | |
| `topple` | | `k` 0..1, `from` (base pose) |

`walkStride(sc, { who, stride })` returns how far one walk cycle covers. Set
`x = x0 + facing * ph * walkStride(...)` and the feet won't skate.

**The cast** (wrappers; each takes the same `(t, x, y, sc, opts)` and returns the joints):
- `conductor`: dark round spectacles, peaked cap, long blue coat with brass buttons. He limps on a cane
  and swings a lantern from his far hand. Pose `limp` (default), `stand` or `sway`. Options: `lit`,
  `swing` (lantern angle).
- `passenger` with `who`:
  - `'tall'`: stovepipe hat, long nose.
  - `'stout'`: feathered hat, rose dress.
  - `'old'`: bowler, walrus moustache.
  - `'dandy'`: boater, teal tails, carnation.

  Pose `sway` (default), `sit` or `stand`. Options: `amp`, `strap: true` with `strapY` draws the leather
  strap. Give them all the same `ph` and they rock together.
- `jacketMan`: the loud gold/ruby/teal Cincinnati check, slate fedora, red nose. Pose `slump` (default),
  `sit`, `stand` or `walk`.
- `windowLeaner(t, x, y, sc, { facing, fill, lean, lit, frame, tilt })`: `(x, y)` is the middle of the
  sill. It draws the arched opening (lit amber), the nightcapped figure hanging out, the sill and the
  Galle bottle of rain held up into the rain (`fill` 0..1). The wall around it is yours.
- `sailor(..., { seed, hanky })`: waves a white handkerchief, which is the mark that reads from far off.
  `seed` varies sailor or passenger, hats and timing.
- `millionaire`: top hat, tails, gold waistcoat, monocle and watch chain. Pose `shovel` (default) or
  `stand`. Options: `coal: false`. Returns `blade` (the shovel tip) for sparks or coal.
- `harlemWalker`: lanky, cap, ruby jacket, denim. The pistol is only a butt peeking from the back
  pocket. Never draw it in hand or aimed. Pose `walk` (swagger) or `stand`.
- `knickerbocker`: bowler, long camel coat with the collar up, cane. `view: 'back'` (default) walks away
  from camera: shrink `sc` and raise `y` to send him down the avenue, and clip him behind a corner.
  `view: 'profile'` shows him in profile (`back: 0` turns his face to camera).
- `bandsman(..., { role: 'drum' | 'tuba' | 'tambourine', ph: beatPhase(t), march, k })`: Salvation
  Army dusk-blue uniforms with ruby trim, caps; the tambourine player wears a bonnet. `k` 0..1 topples
  them over backwards.
- `rower(..., { seed, ph, oar, oarlock, oarLen })`: `(x, y)` is the thwart. The oar pivots on `oarlock`
  (default: the gunwale just ahead of the rower). `oar: 'later'` lets you draw the hull over the legs
  first and then call `J.drawOar()`.

Helpers: `castShade(hex, k)` darkens a colour. `castSpline(pts, closed)` is the Catmull-Rom curve every
silhouette uses. `castLimbs(g, [[pts, width], ...], col, lw)` draws outlined strokes. `CAST` and
`CAST_POSES` let you build a new extra from the same rig.

**Using them well:** profiles read best. Keep a hero at 600 px or more if the face must carry the
line. Light a figure from behind (window, furnace, lamp) and its silhouette carries. Cream and pale
coats on cream backgrounds lose their edge, so put a value step behind them.
