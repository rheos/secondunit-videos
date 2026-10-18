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
  `none`. No bounce, no glow, no gradients, no characters.

## What a theme sets

Colours, the alternate field, grain colour and strength, and the three type roles (display, label,
mono). Four themes so far:

| Theme | Look | Used by |
|---|---|---|
| `paper` | gold on aged paper, night field, Marcellus SC labels | The Cold Read's look (it still has its own inline copy) |
| `rheo` | mint on deep teal (rheo.stream brand), light drafting-sheet field, Geist display | novadiem-rheostream |
| `nutrifax` | ink and Nutrifax green on the site's warm paper, cream field, Fraunces display, Hanken Grotesk labels | novadiem-nutrifax-label |
| `onloan` | ink and pine on onloan.net's warm paper, pine night field, Instrument Serif display, Hanken Grotesk labels | novadiem-onloan-ledger |
| `orchardly` | navy and canopy green on the brand's pale day surface, navy field with fruit orange, Bricolage Grotesque | novadiem-orchardly |

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
