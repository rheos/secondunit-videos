# Motion lab

Tools and numbers for code-drawn looks, adapted from Florence's "Opus 5.5 Motion Lab" article
(x.com/flxrnc/status/2105311836190978392, 2026-09-30) and tested on `example/` and on Mind The Sheep.
They work on any look that keeps the mv-projects contract: `window.__ready` and
`window.__frameJPEG(t, q)`. Run them from the look's folder, which has Playwright installed.

| Tool | What it does |
|---|---|
| `motion.js` | Springs as a damping ratio, named easings, frame helpers, and `ML.probe`, which records what a frame drew for the audit. Load it with a `<script src>` before the look's code. |
| `audit.mjs` | Draws every frame of a range and checks the brief's numbers: text fits its container, kept things stay in frame, events land on their frames, plus your own checks. Exits 1 on failure. |
| `views.mjs onion` | A strobe photo of a move: every pose at once, older ones fainter. Spacing that tightens near the keys means the easing works. |
| `views.mjs speed` | x, y, height and speed of a probed box per frame, plus a list of dead stops, dead starts and linear runs. |
| `render.mjs` | Renders any look to MP4 on the song grid. `--shutter n` adds film-shutter motion blur. |
| `flashcheck.py` | Flash safety on a finished cut: fails above 3 flashes in any second (WCAG 2.3.1). |

```bash
node ../tools/motion-lab/audit.mjs index.html 51.0 69.2 --spec audit.spec.mjs
node ../tools/motion-lab/views.mjs onion index.html out/check/hop.jpg 52.1 52.9 --step 2 --crop 600,300,900,600
node ../tools/motion-lab/views.mjs speed index.html sheep out/check/sheep-speed.png 52.0 54.0
node ../tools/motion-lab/render.mjs index.html 51.0 69.2 out/father.mp4 --shutter 8 --audio assets/song.mp3
$MV_PYTHON ../tools/motion-lab/flashcheck.py out/final.mp4
```

Try them on the example: `example/index.html` passes, `example/index.html?bug=1` fails three ways
(text overflows its sign, the ball leaves the frame, a landing is 2 frames late).

## Probing a look

The audit only knows what the look tells it. Next to the drawing code:

```js
ML.probe.text(g, 'sign', word, x, y, [bx, by, bw, bh]);       // after setting font/align, beside the fillText
ML.probe.box(g, 'sheep', x - w / 2, y - h, w, h, { keep: true }); // keep: must stay inside the safe area
ML.probe.edge('land', footY(t) >= floor - 0.5, footY(ML.prevT(t)) >= floor - 0.5);
ML.probe.value('squash', sy);                                  // anything a spec check wants to read
```

Boxes go through the context's current transform, so call them inside the same `save`/`translate`/`scale`
as the drawing. Both `box` and `text` take options: `keep`, `in: [x, y, w, h]` (container, local),
`inScreen: [...]` (container in canvas pixels, when it was drawn under another transform) and `margin`
(canvas pixels).

The audit injects `motion.js` into the page itself, so a look needs no path to this folder (cloud renders
don't package it). Give the look a fallback that does nothing when `ML` is absent:

```js
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };
```

One event per word (`word#<line>.<word>`) lets a spec built from `lines.json` check that every sung word
appears on its onset; those report together as `event: word`. `tolerance: [2, 1]` allows a word up to
2 frames early and 1 late. Fire events from the geometry, not from the time the code meant to use: that is how a
late landing gets caught. Use `ML.prevT(t)` for the previous frame, never `t - 1/24` (it lands a hair
early and the event fires twice). A spec is a small module (see `example/spec.mjs`):
`events` (song frames), `tolerance`, and `checks` with a `test(log, { t, frame })`.

## The brief as numbers

Every line removes a decision the model would make for you, and its decisions are the default look.
Fill each one before building a shot list or a chapter brief:

```text
GOAL: what the viewer should feel or do, one sentence
OUTPUT: engine, W x H, fps
TIME: seconds x fps = frames; loop yes or no; BPM and frames per beat
LOOK: palette in hex, one accent, typeface + weight + size
MOTION: easings by name, springs as damping ratio + Hz, durations in frames
SHOTS: frame ranges, one hero move per shot, how each shot hands off
KEEP: what may not change (character proportions, the approved drawing)
BANNED: the defaults you never want to see, by name
QA: the frames to check, the audit spec, then the full render
```

**BANNED grows.** After every first render, name what the model reached for anyway and add it.
"Avoid a generic look" only swaps one default for another. Starting list for any look: purple or blue
gradients, glow and lens flares, floating particles as decoration, everything fading in at once,
fade-and-slide-up on every element, centred everything, text that moves while it is being read.

**One hero per shot.** Secondary moves travel 50 to 70% as far and start 100 to 200 ms after it;
ambient motion stays under 5% of the hero's travel on a slow sine and never stops.

## Numbers

| What | Number |
|---|---|
| Enter / exit / cross | ease-out (`EASE.outExpo`, `outQuint`) / ease-in, 40 to 50% shorter (`inExpo`) / ease-in-out (`inOutQuart`) |
| Linear | only rotation, progress bars and loop phase |
| Springs (damping ratio) | 1 no bounce, 0.7 to 0.85 premium, 0.4 to 0.6 playful, under 0.3 cartoon. Position and size may bounce; opacity and colour never |
| Durations | feedback 0.1 to 0.2 s, moves 0.2 to 0.5 s, hero reveals 0.6 to 0.9 s |
| Stagger | letters 1 frame, words 60 to 120 ms, items 40 to 80 ms; start the next at 30 to 50% of the previous |
| Text holds | 0.3 s per word + 0.5 s (`ML.readHold`); a 2% push keeps a hold alive |
| Beats | compute each beat from time and round it; never add a rounded frame count (drifts 2 frames in 32 beats at 128 BPM). Cut on the beat, change layout on the bar |
| Camera | softest curves (ease-in-out-quart); parallax 1.0 / 0.5 / 0.2 |
| Phone size | push key poses 10 to 30% further than feels right |
| Safety | text 4.5:1 contrast on every frame; never more than 3 flashes a second |
| Loops | render frames 0 to N-1, never N; whole cycles of `ML.loopPhase`; frame 0 a finished picture |

**Notes into numbers.** Turn a feeling into a change before making it:

| Note | Change |
|---|---|
| Make it pop | scale 1.0 to 1.08 to 1.0 over 6 frames, peak on the beat |
| Make it feel premium | ease-out-quint entrances, springs at 0.8, no overshoot on text |
| It drags | shorten each hold by one beat, so cuts stay on the grid |
| It feels busy | one hero move at a time; the rest 150 ms later at 60% of its travel |
| It looks like AI | list the defaults it used by name, ban each one, render again |

## Review loop

Render stills, look, write notes that name frames, fix only what the note names, re-render only that.
Two to four rounds is normal. One or two notes per round: seven at once turns a fix into a rewrite.
When a fix doesn't hold, render the frames either side of it and list every difference before
touching code. Useful asks: describe each still in one sentence as a viewer would and compare it with
the shot list; mark every contact-sheet frame where two things move at once; onion-skin a move and
fix the spacing; plot the hero's speed and fix the dead stops with the easing tokens.

Onion skins on a look whose paint boils pick up the stroke re-rolls too: crop to the subject.

## Receipts

Each piece keeps `docs/RECEIPTS.md`: the brief as sent, then every follow-up note verbatim with its
date and round, creative notes and technical fixes in separate lists, and the count at the end. It is
the raw material for the novadiem.com "how we made it" pages and shows where the time went.

## Sound against picture

Our songs are the clock, so this applies to effects and to scores made for a picture (Shadow Tales,
promos). Each hit lands 1 frame after its visual event, never before. Hits sit 3 to 6 dB over the bed.
Check the mix on the phone band: energy under 60 Hz plays as nothing on a phone, and a first mix can
put most of its energy there. Check sync by decoding the finished MP4, not by listening.
