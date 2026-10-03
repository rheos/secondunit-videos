# Animation guide: We Got Time, drawn in code

How a chapter is painted here. Read this before writing a chapter file. The story itself, with the
lyrics and their times, is in `STORYBOARD.md` (gitignored: it quotes the lyrics).

## The frame contract

- Every frame is a pure function of song time `t` (seconds into the 2026 recording). Frames render in
  parallel and out of order: no state between frames, no `Math.random()`. Use `hash(n)`, `rng(seed)`,
  `noise1(x, seed)` for anything random.
- 1920 x 1080 world coordinates (16:9). Drafts render at 720p with `scale=0.6667`; world coords don't change.
- A shot function `fn(t, lt, dur)` paints the ENTIRE frame onto the 2D context `s` (start with a fill
  or a full set). `lt` is time since the shot started. Register shots with
  `chapter(name, start, end, [[t0, fn, { fx: {...} }], ...])`; cuts land on each `t0`.
- `fx({...})` inside a shot sets the look's uniforms for this frame: `sat` (0.32 default grey world, up
  to 1 for full colour), `sky` (1 keeps blue), `rose` (1 keeps warm red), `boil` (line wobble,
  default 1), `flash` (0..1 wash to paper white).

## Files

- `js/core.js`: clock, easing (`ease.*`, `kf`, `inv`, `smooth`, `hit`, `onTwos`), audio features
  (`F(name, t, smooth)` with `rms voc onset low mid high perc`, `beatPulse(t)`, `lastBeat(t)`,
  `FEAT.beats`, `FEAT.vonsets`), drawing primitives (`fill poly line dot vgrad rgrad withT`).
- `js/kit.js`: the shared world. Read it before drawing. Perspective camera `cam({x, y, z, f, vy})`
  and `P(x, y, z) -> [sx, sy, scale]`; sets (`room duct tube board horn clock ticketBox rows seat
  skyHole cloud papers desk`); people (`man`, `woman`); paper things (`text form stamp splitFlap
  typewriter`); ink helpers (`ink shape hatch`); palette consts (`INK CREAM STEEL GREEN BRASS AMBER
  SKIN COAT HAT SKY_T SKY_B ROSE ROSE_L`).
- `js/ch/NN-name.js`: one chapter per file, wrapped in an IIFE. Add your own helpers inside your IIFE.
  Do not edit `kit.js`, `core.js`, `look.js` or another chapter's file; if the kit lacks something,
  draw it in your file.
- Order in `index.html`: data, core, gl, look, kit, chapters, main.

## The look

Brazil's ideas, none of its scenes, characters or names (no "27B/6", no Tuttle, no Ministry of
Information). A 1940s office that grew into a machine: ducts and grey hoses everywhere, pneumatic
tubes, typewriters, numbered queues, forms, stamps, loudspeakers. People are small and identical.
The sky is the way out and the only colour, until she brings a second one (rose). Wit, never dread.

- Ink line (`INK`, 2 to 4 px) over flat greys on cream. Hatching for shadow. No gradients except sky.
- Colour is a story beat. Blue only where there is real sky or a dream of it. Rose only for her and
  what she gives him. Everything else is grey (the shader crushes it anyway at `sat` .32).
- Arty means composed: strong silhouettes, symmetry, big negative space, graphic cuts, scale jokes
  (a tiny man under a vast duct), constructivist poster framing, match cuts between shapes (a clock
  face becomes the sun, a stamp becomes a cloud). Every shot should read as a still.
- **Bring the lyrics in as things in the world**, never as captions: typed on forms, flipped on the
  split-flap board, stamped, on signage, on ticker tape out of the pneumatic tube, on name cards.
  Only lines marked confirmed in the storyboard; `[?]` lines are shown as shapes, not words.

## Rhythm and timing

- The song is the clock. Line and word starts are in the storyboard; hits that must land on a sung
  syllable use `FEAT.vonsets` (vocal onsets) near the listed time. Beat ~0.73 s (82 bpm).
- One location per stretch of song, moving forward. Quick cuts are framings within it.
- Move on the beat where it's mechanical (stamps, tubes, typewriter bars, hats), drift where it's
  dreamy (clouds, sky). Hold shots long enough to read: rarely under 1.5 s.

## People

- **He** (stand-in, not Bob's likeness): long coat, fedora, guitar case. `man(x, z, {ph, walk, face,
  arm, ticket})`, ticket number 7 436 912.
- **She**: a typist across the hall, hair in a bun, grey uniform, a rose collar. `woman(x, z,
  {seated, walk, ph, face, arm, rose, look})`. Her desk: `desk(x, z, face)`.
- Everyone else: identical men in hats seen from behind (`rows`, `seat`). They never get served.
- Faces stay small and simple. No lip sync.

## Checking

```bash
node check.mjs index out/check/<name>.jpg 120 121.5 125     # contact sheet at times, prints ms/frame and errors
node check.mjs index --full out/check/<dir> 125              # full-size stills
```

Look at your own frames like a viewer: every cut, every lyric line start. Fix overlapping objects,
things drawn off the set, text running off a form, figures floating above the floor, and anything that
doesn't read at a glance. Keep a frame under ~400 ms.
