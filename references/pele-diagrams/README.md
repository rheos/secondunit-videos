# pele-art-diagrams: Mermaid diagrams redrawn as pen-and-pencil plates

https://pele-art-diagrams.vercel.app/ shows four real charts drawn as old hand-coloured plates. Each chart
starts as a few lines of Mermaid text. pele (Obsidian's open-source Mermaid renderer) lays it out, and a
JavaScript program redraws that layout in the browser with a simulated fine pen and coloured pencils, then
draws a made-up world around it. The page also embeds an earlier film, "How a burger is made, in 12
diagrams", built on the same layout engine with a different, live drawing engine.

Author unknown: the footer credits Claude Opus 5.5 for the drawing code, and nothing on the page names a
person. Studied 2026-10-24 (issue #319) from the page, its shipped source (`site.js`, `kit/plates.js`, the
marks data, `burger/film.html`) and pele's repo and docs. Unlike most profiles here, this one is about a
method we can build on, not a way of seeing to imitate.

## The four plates

All four are 2048 px squares, drawn in about 5 s each in a browser Web Worker, one at a time as they near
the screen.

| Plate | Diagram | The world around it | Print tradition |
|---|---|---|---|
| The wind's day | radar chart, 6 axes, 2 curves | a valley: snowy ridge, stone village, river, orchard, kite, smock mill | landscape plate |
| The vesper bell | state diagram, 5 states, a self-loop | an invented bellflower at each stage, seeds on the wind | botanical plate |
| Bottling thunder | sankey, 100 claps of thunder | "E. Marrowby's apparatus of 1893": rod, coils, pressure chamber, three bottles | patent drawing |
| The comet's long way home | timeline, 5 stops | the comet's 76-year orbit with two planets, tick per year | celestial plate |

What makes them work:

- **The data stays true.** Sankey bands keep their widths, the radar keeps its values, and the comet's
  ticks bunch far out and spread near the sun because the years come from the drawn orbit's own Kepler
  timing. The decoration never bends the chart.
- **pele's nodes become objects.** A sankey node is a machine part, a state is an engraved specimen label
  on a string, a timeline stop is a ring on the orbit. The diagram reads as part of the world, not a chart
  pasted on a picture.
- **One drawing grammar per plate:** a fine warm-black pen (`#2b2320`) over light coloured-pencil tints on
  cream paper (bare paper measures about `#f0e4d0` on the wind plate, `#f4f4ec` on the comet's cartridge).
  Tone is built only from hatching that follows each form. The sky stays bare paper, with level hatching
  only near the horizon. Nothing touches: labels, clouds, birds and the chart all keep clear of each other.
- **Lettering is drawn, not typeset.** Every word is traced from A. V. Hershey's 1967 single-stroke
  engraving letters by the same simulated hand, with a nudge of baseline, tilt and spacing per letter.
  Serif for names, italic for notes.

The page's "How they were made" section shows each plate three ways: the Mermaid text, pele's plain
layout rendered live, and pele's shapes drawn in blue over the finished plate. That overlay is the best
single picture of the method.

## How a plate is made

1. **Mermaid text.** A few lines, for example the comet:
   ```
   timeline
     Year 0 : Closest to the sun
     Year 5 : Passes a ringed giant
     ...
   ```
   Mermaid config sets spacing where it matters (`rankSpacing`, `nodeSpacing` for the state diagram;
   `nodeWidth`, `nodePadding`, `nodeAlignment` for the sankey).
2. **pele lays it out with the plate's own letter widths.** pele takes a `measurer`
   (`width(text, size, style)`), so the author fed it Hershey glyph widths at the plate's lettering size.
   Boxes and gaps are then sized for the hand lettering that will actually be drawn, and every label fits
   first time. A capture page fits the layout into a box on the 2048 page
   (`marks.html?d=d5-comet&size=31&font=italic&track=.02&box=90,1497,1958,1958`).
3. **The SVG becomes marks.** Every element is flattened into a record: tag, pele's classes, id, a polyline
   `P` in page pixels (circles and curves sampled), and for text the lines, anchor and size. That is
   `data/<plate>.marks.json` (the wind plate has 23 marks). A plate script picks marks the way CSS does:
   `sel('.pele-radar', '#dawn', '<text')`.
4. **A plate script draws them as the world.** The sheet is 204.8 mm square at 10 px/mm, in millimetres
   with y down. Each plate is one hand-written script (600 to 700 lines) that draws the frame, then the world
   far to near, then pele's shapes restyled, then the words last.
5. **The drawing kit simulates the media** (the bundle calls it "oav"):
   - *Paper* is a height field: three bands of blurred noise (pulp at about 0.12, 0.5 and 2.5 mm) plus
     thousands of short fibres laid along a machine direction, under a near-flat scanned tone.
   - *Media* have a contact model: light pressure touches only the crests of the tooth, so the grain shows;
     more pressure fills the valleys. Inks are translucent absorbance, so overlaps darken the way ink does.
     Pencil, coloured pencil, crayon, ballpoint, fineliner, gel and marker each have a footprint and a
     deposit rule.
   - *The hand* turns the points it aims at into what a hand does: a damped-spring follower (lag, rounded
     corners, overshoot at the end), band-limited wander (bow and tremor), a pressure profile with slow
     drift, ink skips and blobs. Pencils wear down and get re-sharpened every 300 strokes.
   - *Raster*: each stroke fills a scratch coverage buffer first, so a stroke never deposits twice on
     itself, then composites once.
6. **Layout checks run on the picture.** Each region owns its pixels on a 0.25 mm grid painted far to near,
   and every mark is clipped to its owner. Everything drawn stamps a footprint grid, so rain is laid around
   objects. Labels go to `nearestFree` (searches outward from an anchor for an empty box). Every word's box
   and colour is recorded; a second render with `NOTEXT=1` leaves the words out so a contrast check can see
   what lies under each one.
7. **Live drawing is a side effect.** In the browser the Worker patches the kit's paint call to post the
   canvas every 350 ms. Because the script draws far to near and letters last, that progress is itself a
   good reveal: you watch the landscape go down and the chart and words arrive at the end.

## The burger film's engine (a different approach)

`burger/film.html` is a 1080x1080 film with sound, 12 panels (mindmap, sankey, state diagram, timeline,
flowchart, sequence, gantt, git graph, kanban, xy chart, packet, pie). The look is flatter than the plates:
spot-ink fills, a technical pen, more poster than engraving. Its engine is the one to learn from for motion:

- **Scenes on beats.** `scene(name, beat0, beat1, draw(g, S), {dark, grain})`, where `S` carries the frame,
  the time, beats since the scene began and `u` (0 to 1 through the scene).
- **The lines boil because they are really redrawn.** Every frame is drawn from nothing. `BOIL` changes every
  other frame; `KEY` counts marks within a frame, so each mark keeps its own wobble for two frames and then
  moves on. Static plates are cached per boil (three boils are enough to stay alive), and evicted caches
  give their memory back at once.
- **A blue construction pencil lays the layout down first**, overshooting its ends the way a draughtsman's
  does, then the pen inks over it. Spot inks print a hair out of register under the line.
- **UNDRAW** pulls every mark back along itself into one point: a transition for free, since every mark is
  a path.
- Mark helpers: hatching clipped to a shape by a tone function; flowing hatching along evenly spaced
  streamlines of a direction field (an engraver following a form); stipple as dot density; light drawn
  only with marks (inked core, thinning stipple halo, a few rays, no gradients); contour lines by marching
  squares; a compass circle with its needle prick; dimension lines with tally marks.

On the main page the burger sheet runs in an iframe and did not draw in our hidden browser pane; opened
directly at `/burger/film.html?render&sheet` it draws all 12 panels.

## Licences

- **pele: MIT** (Copyright 2026 kepano, github.com/obsidianmd/pele). npm `pele` is at 1.10.0; the site bundles
  1.6.0. It supports every Mermaid 12.1 diagram type, has no runtime dependencies, renders synchronously, and
  takes a custom `measurer`, `fontFamily`, `fontSize` and CSS-variable theming. Free to use.
- **Hershey fonts:** public domain; the `hersheytext` JSON packaging is MIT.
- **The drawing kit and the plate scripts:** unclear. The bundle header calls them "the owner's"; one plate's
  comment says "on the oav kit, MIT". No licence file is served. Treat them as all rights reserved: read for
  ideas, write our own, copy nothing. Same for the burger film's code.

## What we already have

- `tools/blueprint-kit`: self-drawing technical plates for the explainers (Cold Read, rheostream,
  Nutrifax, onloan, Orchardly, FOAF). Clean 2px vector line, no hand. Every diagram is placed by hand.
- Looks: `engraving` (banknote: tone maps turned into line engraving in WebGL), `fieldguide` (pressure-ribbon
  ink on cream with washes), `alchemy` (copperplate with washes under the ink), `crayon`, `blueprint`.
- motion-lab has no boil, hatching or stipple helpers (only a note about boiling paint in onion skins).

The gap: nothing we own starts from data. Every chart in our films so far was positioned by hand, and its
labels were fitted afterwards.

## Verdict: what to borrow

**Take now.**

1. **pele as our diagram layout engine.** `npm install pele` into the blueprint kit and give it a
   `diagram(mmd, box, font)` helper: run pele with a measurer for the font the film letters in, flatten the
   SVG to marks, and let a shot restyle marks by class. Any explainer, band one-sheet or tour graphic can
   then start from a few lines of text. MIT, no dependencies.
2. **The marks layer.** SVG flattened to polylines with classes and ids, plus a CSS-like selector. About a
   hundred lines; ours, written fresh. This is what lets one layout feed any of our looks (blueprint,
   fieldguide, engraving), not just this one.
3. **Measure with the drawing's own letters.** Same idea as our "text fits its container" rule, enforced at
   layout time instead of fixed by hand afterwards.
4. **The words-off contrast pass.** Render a frame without words and check each recorded word box against
   what lies beneath. It slots into the check-frames gate before render.

**Take for the next code-drawn diagram film.**

5. **Construction pencil, then ink, then UNDRAW** as an explainer's draw-on and scene change. UNDRAW
   collapsing into a point the next scene grows from fits our "transitions follow an element" rule.
6. **Per-mark boil held for two frames** (a 12 fps boil inside 24 fps), with static layers cached per boil.
7. **Region ownership painted far to near** and `nearestFree` label placement, for any busy plate.

**Set aside for motion, keep for stills.** The per-pixel paper and media physics is the most beautiful part,
and also the slowest: about 5 s of CPU per 2048 frame, so a full redraw every frame would cost roughly two
minutes of render per second of 24 fps video. It suits a draw-once, reveal-by-stroke shot (snapshot the
canvas at the stroke counts the score asks for, from one run), and stills: title cards, posters, a 4:5
cover, a Canvas loop background. Writing our own version is a real project; don't start it before a film
needs it.

## A look to build: pen-and-pencil diagram plate

Proposed, not built. It gets a `looks/` file only when a test exists (per `looks/README.md`).

- **Title:** Pen-and-pencil diagram plate.
- **Note (for the site):** A real chart drawn as an old hand-coloured plate: fine warm-black pen over light
  coloured pencil on cream paper, the chart's boxes and bands turned into objects in a small invented world,
  every word lettered by hand.
- **Rules:**
  - The chart's layout comes from pele and its numbers stay true; decoration never moves a node or a band.
  - Each node is drawn as an object from the song's world (a label on a string, a machine part, a ring on
    an orbit), not a box.
  - One warm-black pen (about `#2b2320`); colour only as light pencil tint under the ink; paper left bare in
    the sky.
  - Tone only from hatching that follows the form; level hatching near the horizon; no fills, no gradients.
  - Hand-lettered single-stroke words (Hershey serif and italic), laid out with their own widths; nothing
    touches.
  - Motion: draws itself far to near, chart last, words last of all; any held shot boils per mark on twos.
- **First test that would earn it:** a musician object, not a tech chart. Bob's tour as a sankey or a
  timeline (the artist agent MCP holds his 53 shows), or a song's story as a state diagram drawn as its
  world. Code-drawn, no credits.
