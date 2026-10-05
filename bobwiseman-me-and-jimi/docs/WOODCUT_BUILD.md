# Building a section of the woodcut Me and Jimi

Project: `~/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-me-and-jimi`. Bob Wiseman's song "Me and Jimi"
(2026), a tribute to slide guitarist Ellen McIlwaine. Bob wrote the storyboard; the whole video is WOODCUT.
Read first: `STORYBOARD.md` (your section's beats and exact times), `js/wood.js` and `js/wkit.js` (the kit),
`js/look-woodcut.js` (the print), `js/core.js` (time helpers), and look at `out/cast/t_1000.50.jpg` (the cast).

## How a frame is made
- Every frame is a pure function of song time `t` (frames render in parallel, out of order): no state between
  frames, no Math.random (use `rng(seed)`, `hash`, `noise1`). Draw onto the 2D context `s` (1920 x 1080).
- Draw ONLY three values: `INK` (#000), `CUT` (#fff, bare paper), `RED` (#f00, the red plate). Nothing else;
  no greys, no gradients, no alpha except for a deliberate ghost (Jimi as a ghost: `put(..., {alpha: .55})`).
  The look roughens edges, adds paper tooth and wood grain, slips the red plate off register, re-pulls on threes.
- RED is reserved for ELLEN'S HAIR, plus Bob's named red things only (the red carpet, the glowing E, the red
  staff made of her hair, the stream of red hair). Do not use red anywhere else.
- Carved marks, not vector art: `taper` (strokes that swell and thin), `flick`/`flicks` (gouge flicks),
  `rows` (parallel cut lines inside a clip, for tone), `chisel` (faceted outlines), `shape(mk, fill, lineWidth)`,
  `clipTo(mk, fn)`. Fill big areas with INK and carve light into them with CUT lines, or the reverse.
- Motion is limited animation: positions on twos (`onTwos(t, 12)`), a few big held poses rather than smooth
  tweening everywhere. Hits land on the audio: `FEAT.beats`, `beatPulse(t)`, `hit(t, t0, decay)`, onsets in
  STORYBOARD.md.
- Shots: `chapter(name, a, b, [[t0, fn], [t1, fn2], ...])` registers shots; `fn(t, tLocal, dur)` draws one.
  Your chapter covers exactly your section's range, every frame of it.

## The cast (js/wkit.js, do not edit; write extra helpers inside your own chapter file)
- `ellen(x, y, k, {pose, t, wind, facing, slide, eyes, smile})`: drawn Ellen, red hair, bus-driver jacket.
  poses: stand, walk (guitar case), play (slide guitar), hold, drive (hips up), point. She will get a carved
  face from a photo later; keep her face area clear of other marks.
- Real people are carved photo pieces: `put(name, x, y, h, {ax, ay, rot, flip, alpha, crop})`:
  `jimi-helsinki` (fist up, Strat), `bob-1989` (Bob with accordion), `mj-1984` (Michael Jackson, glove up),
  `beyonce`, `pixies` (all four). `crop: [x, y, w, h]` in fractions takes part of a piece (e.g. Jimi's head
  `[.25, .2, .45, .32]`, adjust by eye). Pieces move like cut-out puppets: slide, bob, tilt, flip, scale;
  for other body poses, crop the head and put it on a body you draw in woodcut.
- `kid(x, y, k, {asleep, seed, letter})`, `schoolBus(x, y, k, {t, lights, driver, kids, asleep, doorOpen})`,
  `guitar(...)`, `guitarCase(...)`, `stage({curtain})`, `carveText(str, x, y, size, c, {w, rot, align})`.
- Bob asked for Hendrix, Beyonce, the Pixies and Michael Jackson as themselves: use the carved pieces.

## Rules from Robin's past notes (each one has bitten before)
- Stage what is SUNG at that moment (STORYBOARD.md gives the recording's order; it differs from Bob's sheet).
- Every word on screen must fit inside its sign/box with margin, even at overshoot; measure, don't eyeball.
- Rhythmic hand or arm motion near a lap reads sexual: keep idle hands still or on an object.
- Keep a character's look the same across shots. Don't redesign the kit's characters.
- A style jump must look intentional; inside this video everything is the same woodcut.
- Honour harmonica phrases in your range (STORYBOARD.md, `source/harmonica-band.json`): give each a visible
  moment (in Bob's notes the harmonica and the wind are linked).

## Checking your work (no video renders; the conductor renders)
- `node --check js/wch/<your file>.js`
- Contact sheet: `nice -n 10 node check.mjs wood-<N> out/<you>-sheetK.jpg t1 t2 t3 ...` (3 columns), then LOOK at it
  with the Read tool. Full stills: `node check.mjs wood-<N> --full out/<you>-stills t1 t2`.
- Check every beat's key frame, every cut, and every on-screen word. Fix and re-check until each beat reads
  clearly as what Bob described. Report console ERRORS lines if any appear.
- Do not edit any file except your own chapter file. Do not commit. Do not render video.
