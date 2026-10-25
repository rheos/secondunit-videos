# Fifty-three Nights: pen-and-pencil diagram plate (look test)

First test of the look proposed in `references/pele-diagrams/README.md`: a real chart, laid out by pele and drawn
in canvas code as a hand-coloured pen-and-pencil plate. The chart is Bob Wiseman's tour, October 2026 to March 2027.
A look test for Robin (issue #321), not a client deliverable. Code-drawn, no paid generation.

## Why a sankey

Bob's 53 booked shows group into six months and six provinces. A sankey from month to province shows the shape of
the season at a glance: a thin run of nights down the east in the autumn, then a wide BC winter. Each band's width
is its nights, so the chart can be drawn as one pen line per night, which is the musician's own unit. A timeline of
53 dates would mean 53 labels; the sankey needs twelve short words.

## What is on the plate

| pele mark | drawn as |
|---|---|
| month node (left) | a spindle of ticket stubs, one stub per night, with a hanging tag |
| province node (right) | a fence post with a tally notch per night (fives crossed through) and a signboard on a rope |
| band | coloured pencil laid along the band, then one pen line per night |
| pele's labels | lettered on the tags and signs instead, by hand in Hershey Serif and Serif italic |

Around it, far to near: the sea and a lighthouse, farms and a road west with telegraph poles and a van, the
mountains. Sky left bare paper. Nodes and bands keep pele's positions and sizes; only tags, signs and ropes are
placed by us (`hang()` in `js/plate.js`). The page refuses to draw if pele's month column isn't in calendar order or
any node is off the nights scale.

## Data

`tools/tour-data.mjs` reads `_in/shows.json` (gitignored: Bob's shows as read from the IndieAgent artist agent MCP,
`list_shows`, read only) and writes `data/tour.js`: nights per month and province, nothing else. Re-read the MCP
into `_in/shows.json` to refresh.

## Run

```bash
tools/blueprint-kit/sync.sh indieagent-diagram-plate   # from the repo root: kit/ with pele, Hershey and diagram.js
npm install                                            # playwright, uses the installed Chrome
node tools/tour-data.mjs                               # _in/shows.json -> data/tour.js
node still.mjs 14 [--notext] [--w 1280]                # frames to out/
node check.mjs 14                                      # gate: words in containers, nothing touching, words-off contrast, crops
node ../tools/motion-lab/render.mjs "plate.html?w=1280" 0 14 out/<name>.mp4 --width 1280 --height 720 --workers 3
```

Open `plate.html?play=1` to watch it draw, `plate.html?t=6` for one moment, `?notext=1` for the words-off frame.

## Files

- `js/hand.js`: paper (pulp, grain, fibres, tooth mask), the pen (pressure ribbons) and coloured pencil (through the
  tooth), the hand's wobble, boil on twos, and the stroke scheduler.
- `js/plate.js`: the plate, from pele's layout to the last word, and its timing.
- `check.mjs`, `still.mjs`: the review gate and frame grabs.

## Timing (14 s)

Construction pencil 0.35 to 2.0 s, frame, the country far to near 2.1 to 5.2 s, bands 4.5 to 8.0 s, nodes and
objects 7.1 to 9.5 s, words 9.5 to 12.0 s, then a 2 s hold that boils on twos.
