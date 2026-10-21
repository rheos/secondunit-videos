# Blueprint kit

The shared look for the technical-plate explainers: music-driven, no narration, diagrams that draw
themselves. Lifted from The Cold Read (`novadiem-cold-read`, the `window.CR` helpers and its furniture
plate) and made theme-driven, so every explainer shares one drawing grammar while the palette changes
per film. First used by `novadiem-rheostream`.

## What's fixed across the series

- Line: 2px at 1080p, square caps, miter joins. Construction lines 1px dashed at 40%.
- **Planned, not built** is drawn dashed and faint (`.planned`). Every film shows unbuilt parts this way.
- Plate border inset 48px with registration crosshairs, faint 60px grid, seeded grain.
- Plate labels top-left and top-right. One accent phrase per plate, never more.
- A progress bar along the bottom (stations at score times) and an optional sheet counter.
- Cues are written in score seconds and snapped to the score's beat grid. Draws ease `power2.out` or
  `none`. No glow, no gradients, no characters. Since the engagement layer (below) a stamp or a set letter may settle with a small overshoot.

## What a theme sets

Colours, the alternate field, grain colour and strength, and the three type roles (display, label,
mono). The themes so far:

| Theme | Look | Used by |
|---|---|---|
| `paper` | gold on aged paper, night field, Marcellus SC labels | The Cold Read's look (it still has its own inline copy) |
| `rheo` | mint on deep teal (rheo.stream brand), light drafting-sheet field, Geist display | novadiem-rheostream |
| `nutrifax` | ink and Nutrifax green on the site's warm paper, cream field, Fraunces display, Hanken Grotesk labels | novadiem-nutrifax-label |
| `onloan` | ink and pine on onloan.net's warm paper, pine night field, Instrument Serif display, Hanken Grotesk labels | novadiem-onloan-ledger |
| `orchardly` | navy and canopy green on the brand's pale day surface, navy field with fruit orange, Bricolage Grotesque | novadiem-orchardly |
| `foaf` | navy ink and FOAF blue on a cool pale sheet, pink accent, navy field, Red Hat Display | novadiem-foaf-client |
| `cyanotype` | pale line work on Prussian blue (a classic blueprint), amber accent, cream field, Space Grotesk display, JetBrains Mono labels | novadiem-self-hosting |
| `patent` | an Edison-era patent office: cyanotype sheets, a cream broadsheet field in ink and oxblood (after recallatron.com), IM Fell English display and labels, Special Elite typewriter captions | novadiem-recallatron (draft 2) |

Add a theme by copying one file in `themes/` and changing the tokens.

## Use it in a project

```bash
tools/blueprint-kit/sync.sh <project-folder>     # copies the kit to <project>/kit/ with a VERSION stamp
```

Root `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<link rel="stylesheet" href="kit/themes/rheo.css" />
<link rel="stylesheet" href="kit/kit.css" />
<script src="kit/kit.js"></script>
<script>BP.grid({ beats: [/* beats.json of the score */] });</script>
```

`BP.grid({ bpm: 96, offset: 0, length: 105 })` gives a placeholder grid until the score exists.

In a plate (sub-composition): `const K = BP.kit(tl, slotStart)` gives `T` (score time to plate time,
on the beat), `R` (unsnapped), `draw`, `sweep` (for dashed lines), `fade`, `reveal`, `out`, `travel`
and `$`. The furniture plate calls `BP.furniture(K, tl, { stations, sheets })` into two empty SVGs
with ids `fu-ground` and `fu-frame`; see `novadiem-rheostream/compositions/furniture.html`.

## Drafts at 720p, masters at 1080p

Plates always draw on a 1920x1080 stage. Drafts render at 720p (Robin, 2026-10-15: "these are all
drafts"); a 1080p master only after he signs off the cut. Wrap the root's slots in
`<div class="stage">`, then flip the root with:

```bash
tools/blueprint-kit/stage.sh <project-folder> draft    # html.draft, root 1280x720, stage scaled 2/3 from top-left
tools/blueprint-kit/stage.sh <project-folder> master   # back to 1920x1080
```

HyperFrames has no downscale flag, so this is how a draft gets rendered small. Only the root changes.

Edit the kit here, then re-run `sync.sh` for each project that should pick up the change. A
project's `kit/` copy is never edited by hand.

## Making it engaging: motion, type and sound (2026-10-21)

Learned from the Romancing the Atom reel (`achbar-atom-reel/`). Robin: the point is "how much more engaging
it is.. the transitions.. the sound.. the typography.. animations", in one style held for the whole film.
`kit(tl, slotStart, plate)` now has, beside `draw`/`fade`/`reveal`/`out`/`travel`:

| Helper | What it does |
|---|---|
| `typed(node, at, {cps, cursor})` | a typewriter caption, HTML or SVG text: characters appear one by one, a `_` cursor blinks while typing. Returns the time the last character lands |
| `slam(node, at, {stagger})` | set type (HTML only): each letter drops into place, a little large and turned, and settles |
| `drop(node, at)` | the letters fall away in reading order (HTML only); the exit for slam or typed text |
| `stamp(node, at, {origin, sound})` | a rubber stamp or a filed card: big and faint to full size with a small overshoot |
| `move(node, at, dur, from, to, {ease, sound})` | any explicit `fromTo` move, with an optional cue |
| `camera(layer, at, dur, from, to)` | a push-in or travel of a whole plate layer, for hand-offs |
| `pulse(node, at, n, gap, amount)` | beat-locked swells |
| `sfx(kind, at, extra)` | a cue with no animation (a bell, a tick) |

Every helper reports its event in score seconds to `BP.CUES` (typed characters, set letters, pen strokes, stamps,
cards, slides, whooshes, plate exits). Nothing plays from the page. The sound is built offline:

```bash
cd tools/blueprint-kit && npm install                       # once (playwright-core, uses the installed Chrome)
node tools/blueprint-kit/cues.mjs <project>                 # -> <project>/cues.json
python3 tools/blueprint-kit/holdcheck.py <project>          # every plate holds 1.5 s after its last text
<viralvision venv python> -I tools/blueprint-kit/sfx.py <project> [--voice _in/voice.wav] [--end SEC] [--score-db -15]
                                                            # -> _in/sfx.wav and _in/mix.wav (score ducked under the voice)
```

The root `<audio>` then points at `_in/mix.wav`. Re-run all three after any timing change, so the sound can't
drift from the picture. `sfx.py` synthesises an office of the period (typewriter keys, set type, a steel pen,
rubber stamp, index card, card drawer, desk bell, pneumatic tube, clockwork); add a kind there and report it with
`K.sfx`. A plate that leaves by a move rather than `out` should call `K.sfx("out", t)` so holdcheck knows.

Rules learned on the first film: transforms don't apply to SVG `<tspan>`, so letters that slam or drop must be
HTML; give each slot an early start (0.6 s) and late end so one plate can hand an element to the next; don't
animate `scale` with `svgOrigin` twice on one SVG group with `x` moves in between (GSAP compensates the origin
and the group drifts): move with `x`/`y` only, or wrap it.

**Narration.** When a film is narrated, the voice is the clock: record per plate, time the words with
faster-whisper, place them, and cue plates on words (`novadiem-recallatron/vo/`: `vo.py`, `align.py`,
`place.py` -> `vo/words.js`, `VO.w(plate, word)`).
