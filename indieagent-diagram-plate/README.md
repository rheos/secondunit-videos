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
node still.mjs 32 [--notext] [--w 1280]                # frames to out/
node check.mjs 32                                      # gate: words in containers, nothing touching, words-off contrast, crops
node ../tools/motion-lab/render.mjs "plate.html?w=1280" 0 32 out/<name>.mp4 --width 1280 --height 720 --workers 3
```

Open `plate.html?play=1` to watch it draw, `plate.html?t=6` for one moment, `?notext=1` for the words-off frame.

## Files

- `js/hand.js`: paper (pulp, grain, fibres, tooth mask), the pen (pressure ribbons) and coloured pencil (through the
  tooth), the hand's wobble, boil on twos, and the stroke scheduler.
- `js/plate.js`: the plate, from pele's layout to the last word, and its timing.
- `check.mjs`, `still.mjs`: the review gate and frame grabs.

## Timing (32 s)

Construction pencil 0.35 to 2.0 s, frame, the country far to near 2.1 to 5.2 s, bands 4.5 to 8.0 s, nodes and
objects 7.1 to 9.5 s, words 9.5 to 12.0 s, then a 20 s hold that boils on twos. Draft 1 held 2 s; Bob couldn't read it
before it looped ("wish it would stay longer at the end"), so draft 2 holds 20 s. Over 20 s, his page also gives
the clip player controls instead of a silent loop.

## Sound (draft 2)

Under the plate: 29 s of Bob's "All Dressed Up" (Beware of Bob), 3:26.0 to 3:55.0. The music builds there and is at
full strength when the words land. Robin moved the start 3 s later than the first try (3:23.0) and the video ends
with the music at 29 s, so the plate holds 17 s. Fade in 0.15 s, fade out over the last 2.5 s, levelled to about
-16 LUFS. The source is Robin's copy on Bertha (`Music/Archive/Rock/Bob Wiseman/Beware of Bob/`); the cut lives in
gitignored `_in/`, never in git:

```bash
ffmpeg -ss 206.0 -t 29 -i "<Bertha>/Bob Wiseman_09_all dressed up.mp3" \
  -af "afade=t=in:d=0.15,afade=t=out:st=26.5:d=2.5,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 _in/all-dressed-up_206.0-235.0.wav
ffmpeg -i out/<picture 32 s>.mp4 -i _in/all-dressed-up_206.0-235.0.wav -map 0:v -map 1:a -t 29 \
  -c:v libx264 -crf 23 -maxrate 4.5M -bufsize 9M -pix_fmt yuv420p -c:a aac -b:a 192k out/<name>.mp4
```
