# The cable and the stub

An IndieAgent object short in the manner of Kevin Ngo's paperclip-and-sticky-note film: every frame
drawn by canvas code, no generated images, no paid calls. Built 2026-10-20 as the test film for the
recipes in `references/kevin-ngo/STUDY-paperclip-and-sticky-note.md` (issue #273).

Story: show night, an empty stage. A guitar cable sleeps coiled on the amp. A ticket stub blows in
under the stage door and lands in the ghost light's pool. The cable wakes and makes it a small loop
(the symbol, once). A gust takes the stub back out; the cable chases it through the alley (as a
wheel), across the parking lot (as a spring), up a fence (as a pole), and lassos it in the open sky
(the symbol, twice). The marquee lights up as they swing down; the cable tows the stub under the
door and does its job: one jack into the guitar, one into the amp. The pilot lamp comes on, the
stage lights come up, and the cable's slack rests looped around the stub in the light (the symbol,
three times). Signed "indieagent.ai", small, bottom right.

Recipes used: P01 one body many tools, P02 shape-shifter and drifter, P03 the object's job is the
climax, P04 one symbol three times, P05 the room as landscape, P06 the world takes their side after
the threshold, P07 one colour arc paid off indoors, P08 paper frame outside / full bleed inside, P09
the lamp pool is home, P10 faces of two dots, P11 follow the prop (the door, the cable itself), P12
cut on the bar, P13 one highlight per material, P14 sign it small.

## Clock

`assets/song.wav` (gitignored) is bars 23 to 35 of `score-library/drafting-table/take-01.mp3`
(96 BPM, 2.5 s bars; excerpt 57.561 to 90.044 s with a 0.3 s fade in; sha256 ce264a7b490bc5e0...),
13 bars, 32.48 s. The resolve at bar 11 lands under the plug-in. One shot per bar.

## Files

- `index.html` plays the film in a browser (space bar: the play button); `?offline=1` exposes
  `__frameJPEG(t)` for the render scripts.
- `js/kit.js` the marks; `js/scenes.js` the stage and the exteriors; `js/shots.js` the 13 shots.
- `check.mjs out/x.jpg t1 t2 ...` contact sheet; `--full dir` for full-size stills.
- `render.mjs 0 32.483 out/name.mp4 3 24 0.6667` renders the 720x720 draft (frames at 1080).
- `node_modules` is a symlink to the Travel Agent project's playwright (gitignored).

## Drafts

| Draft | Date | File | Notes |
|---|---|---|---|
| 1b | 2026-10-20 | `out/cable-stub_draft1b_720.mp4` | First full pass. Checked: contact sheet per bar, in-betweens, 12 fps strips of bars 2, 3, 4, 7, 11, every frame scanned for dark frames (none). Not yet watched by Robin. |

Look record: `looks/marker-paper.yaml`. The 6 s styles clip is cut to `out/marker-paper.mp4` and
waits for the novadiem.com step.
