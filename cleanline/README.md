# cleanline

The shared engine for code-drawn "clean line" films: every frame is drawn on a canvas by JavaScript, timed to the song, no images, fonts or paid generation. One copy lives here. Films point at it instead of copying the last film's kit.

The first film on it is `bobwiseman-travel-agent-cl/` (Travel Agent draft 21). Read that folder next to this file when something here is unclear.

## What's in here

| File | What it does |
|---|---|
| `js/clock.js` | The song clock. Pins the audio by SHA-256, holds the 24 fps frame grid, beats, word and line timing, and any other cue lists, all in one format. |
| `js/core.js` | Frame size, the seeded random stream `R`, easing, and the drawing state (`X`, `FD`, `DSEED`, `TNOW`, `MODE`, `LW`). |
| `js/kit.js` | The drawing primitives: wobbly ink lines (`iline`, `iE`, `iP`, `iBox`), shapes (`PE`, `PP`, `PR`), fills and hatching (`fillP`, `hatch`, `shade`, `stip`), crisp marks and labels (`gl`, `gc`, `ticks`, `lab`, `bracket`, `star`, `lattice`), camera (`cam`, `screen`), curves, grain. |
| `js/look.js` | The look registry: `defineLook({...})`, and which look draws each shot mode on this page (`?look=`). |
| `js/frame.js` | The frame driver and preview player. Loaded last. |
| `looks/*.js` | One file per look: `fieldguide`, `blueprint`, `armink`. Each has a recipe in `../looks/<name>.yaml`. |
| `bin/render.mjs` | Render a span to mp4 with the pinned song. |
| `bin/check.mjs` | Contact sheets or full-size stills, at chosen times or at every cut and line start. |
| `bin/compare.mjs` | Before/after: two pages, the same frames, an exact pixel diff per frame and side-by-side sheets. |

Setup, once per machine: `cd cleanline && npm install`. The tools drive the installed Google Chrome through Playwright (`CL_CHANNEL=chromium` to use Playwright's own build instead).

## How a film is put together

A film folder holds five things:

```
my-film/
  film.config.js   const FILM = { title, size, hold, page, clock, looks }
  clock.js         const CLOCK = songClock({ audio: { file, sha256, duration }, fps, words, lines, beats, cues })
  film.html        loads config, clock, engine, looks, the film's js, then cleanline/js/frame.js
  js/              the film: cast, set-ups, and buildShots()
  source/          the song and anything else from the artist (gitignored)
```

Every path in `film.config.js` and `clock.js` is relative to the film folder, and the page sits in that folder, so nothing names a machine.

**The shot list.** The film defines one global function, `buildShots()`, that returns the cuts in time order:

```js
function buildShots() {
  return [
    { t0: 0,    t1: 31.1, mode: 'ill', key: 'shopfront', draw: (p, lt) => { stripes(C.paper, C.paper2); /* ... */ } },
    { t0: 31.1, t1: 33.5, mode: 'sch', key: 'loop',      draw: (p, lt) => { schBG(); schFrame('06', 'THE LOOP'); /* ... */ } },
  ];
}
```

`t0` and `t1` are song seconds, half-open. `p` runs 0 to 1 across the shot and `lt` is seconds into it. `mode` says which look draws the shot. `key` is a name for review tools and the preview's timecode.

**The frame.** `drawFrame(t)` draws song time `t`. It is pure: the picture depends only on `t`, so frames render in any order and on any machine. Drawings are held on twos (`hold: 2`): frame `f` shows the drawing made at `f - f % 2`, seeded by that frame and the shot. Lines boil between drawings and hold still for the pair. A held drawing never crosses a cut. The grain overlay changes every frame, so a held drawing still breathes.

Two rules keep frames pure. Draw only from `t`, `p`, `lt` and the clock, never from what the last frame drew. Use `R`/`rnd`/`jit` for anything that should boil and your own `M32(seed)` for anything that must hold still across a shot (seed it from `DSEED`).

**The song clock.** One format for everything timed: a span is `[t0, t1, ...extra]` in song seconds, half-open, and an instant is a number. Song frame `f` covers `[f/fps, (f+1)/fps)`.

```js
CLOCK.frameAt(t)        // the frame t falls in
CLOCK.spanFrames(span)  // [f0, f1) on the grid
CLOCK.words, CLOCK.lines, CLOCK.beats
CLOCK.wordAt(t), CLOCK.lineAt(t), CLOCK.sinceBeat(t), CLOCK.beatPhase(t)
CLOCK.cue('ohara')      // any other list, e.g. a singer's wordless stretches
```

Words come from the lyric sheet, times come from the audio (see the `video-production` skill, rule 2). The clock file carries times only; lyrics stay out of git.

`render.mjs`, `check.mjs` and the preview read the song from `audio.file` and refuse a file whose SHA-256 doesn't match the pin. If the song changes, the beats, words and cuts were timed to the old one: re-time first.

## Start a new film

1. Make the folder, flat at the top of the repo, and add `!/<folder>/` to the root `.gitignore`. Copy `bobwiseman-travel-agent-cl/.gitignore` in so `source/`, `out/` and `work/` stay out.
2. Put the song in `source/` and take its hash: `shasum -a 256 source/song.wav`.
3. Write `clock.js`: the audio pin and duration, `fps: 24`, and the timing (beats from librosa, words and lines from forced alignment). Start with empty lists if you don't have them yet.
4. Write `film.config.js` with the looks you want per mode, for example `looks: { ill: ['fieldguide'], sch: ['blueprint'] }`.
5. Copy `bobwiseman-travel-agent-cl/film.html`, keep the engine and look lines, and replace the film's script list with your own files.
6. Write `buildShots()` and the set-ups it calls. Open `film.html` in Chrome to watch with the song.

The preview: click or space plays with the song, the bar at the bottom scrubs (the ticks are cuts), arrows step a second (shift: ten), `,` and `.` step one frame, `?t=95.5` opens at a time. The timecode shows seconds, the song frame and the shot's key.

## Add a look

A look is one way of drawing a shot mode. Write `cleanline/looks/<name>.js`:

```js
defineLook({
  name: 'mylook', mode: 'ill',
  extends: 'fieldguide',            // optional: take its palette, grounds and grain (not its hooks)
  palette: { myInk: '#25264a' },    // merged into C
  lineWeight: 1,                    // stroke() multiplies every width by this on this mode's shots
  grain: { seeds: [11, 12, 13, 14], tone: 'paper' },   // or tone: 'dark'
  provides: { paper(c) { /* ... */ } },                 // grounds and frames films call by name
  init(ctx, opts) { /* once; may wrap primitives */ },
  pre(ctx, shot) {},                // before each drawing in this mode
  post(ctx, shot) {},               // after it: overlays, cast shadows
});
```

- **Restyle by wrapping.** A look changes the line by replacing a primitive in `init`: keep the old one, assign a new one (`const _stroke = stroke; stroke = function (col, w, a) { ... _stroke(...) }`). Every film call goes through the new one. Check `X === ctx` so canvases a film draws on its own (pixel screens, echoes) keep the plain line. `fieldguide` and `armink` are the worked examples.
- **Don't take the film's colour names.** If a look's ink differs, add a new key (`armInk`) and swap it in as you draw. Overwriting `C.ink` would recolour every fill the film paints with it.
- **Leave `R` alone.** A look that needs randomness makes its own `M32(seed)`, or every layout that reads `R` after it shifts.
- **Switches** come from the page URL: `opts.get('ink')`, `opts.get('ground')`.

Then add the look to a film's `looks` list and a `<script>` line in its page (parents before children), and write its recipe in `looks/<name>.yaml` with `code.path` pointing at the module (`looks/README.md` has the fields). `?look=mylook` switches the mode it draws. `?look=ill:mylook,sch:blueprint` names the modes outright.

## Render and check

Run these from the film folder (or pass `--film <dir>`). Renders are heavy on a shared Mac: run them `nice -n 15` and tell the other sessions first.

```bash
node ../cleanline/bin/check.mjs out/sheet.jpg 12.5 31.1 95                       # contact sheet at those times
node ../cleanline/bin/check.mjs out/events.jpg --events cuts,lines               # every cut and every line start
node ../cleanline/bin/check.mjs --full out/stills 95 210                         # full-size stills
node ../cleanline/bin/render.mjs 0 end out/film_v1_f00000-f09682_24fps_draft.mp4 --scale 0.6667   # 720p draft
node ../cleanline/bin/render.mjs 0 end out/film_arm.mp4 --qs look=armink --scale 0.6667          # another look
```

Spans for `render.mjs` sit on the song grid: frame `i` is time `t0 + i/24`, and `end` is the song's last frame. Name outputs with their placement (`<audio>_<take>_f<start>-f<end>_24fps_<kind>.<ext>`). Long renders go to GitHub Actions, from the repo root: `tools/cloud-render/cloud-render.sh --draft <film-folder> film.html 0 403.4166`. It packages the film folder (code only, never audio), finds the song through `clock.js` and checks its hash. The runner takes `cleanline/` from git, as committed on the workflow's ref (main, or `CR_REF=<branch>`), so commit and push engine changes before a cloud render.

**Before and after.** `compare.mjs` draws the same frames from two pages and diffs every pixel. Use it to prove a refactor changes nothing, or to show exactly what a fix changed beside the frozen draft:

```bash
node ../cleanline/bin/compare.mjs --a ../frozen/film.html --b film.html --out out/compare --events cuts,lines
```

It writes `report.md` (identical, or the mean and max difference and the share of pixels changed, per frame) and sheets with the two frames and their difference side by side. `--every 12` adds every 12th frame; `--qs-a` and `--qs-b` set each page's query string.

The page also exposes `window.__film()` (the shots, lines, words, beats and looks in use) for tools that need the event frames.
