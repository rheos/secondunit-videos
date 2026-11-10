# table-city: look test, f1800 to f2544 (75.0 to 106.0 s)

A cut-paper dinner table seen from above, lit by its candle, that rises into a walled city on "New York". Built on
the paper-depth engine (`../../../indieagent-paper-depth/`): its paper bake, lit cut edges, torn white cores,
baked blurred-silhouette shadows, multiplane camera and pop-up fold. `js/paper.js` is that engine with the
authored frame set to 720x1280 and the bloom buffer turned portrait (two lines, both marked). No musician, no
scene from it. Licence notice for the paper-fox techniques in `LICENSE-paper-fox.md`.

Review file: `out/table-city/andre_table-city-test01_f1800-f2544_24fps_720x1280.mp4` (744 frames, 31.000 s,
voice muxed from `_in/andre.wav`, checked at 0 ms lag against the master).

## Commands

Everything, from the look's folder (`tests/table-city/`):

```bash
bash tools/make.sh
```

The steps it runs, for one at a time (PY is the viralvision venv python with numpy):

```bash
nice -n 15 $PY tools/onsets.py                      # snap the key words to onsets, writes js/cues.js
nice -n 15 node ../../../tools/motion-lab/render.mjs index.html 75.0 106.0 ../../out/table-city/table-city_silent.mp4 --width 720 --height 1280 --workers 3
nice -n 15 ffmpeg -y -i ../../out/table-city/table-city_silent.mp4 -ss 75.0 -to 106.0 -i ../../_in/andre.wav -map 0:v -map 1:a -c:v libx264 -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart ../../out/table-city/andre_table-city-test01_f1800-f2544_24fps_720x1280.mp4
nice -n 15 node tools/still.mjs index.html ../../out/table-city/check 1800 1950 2110 2215 2236 2300 2543   # f<frame>.jpg, full size
nice -n 15 $PY ../../../tools/cloud-render/badframes.py <review.mp4>
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py <review.mp4>
```

In a browser: `open index.html` plays the section on a loop; `?t=92.3` seeks (song seconds); `?w=1080` renders
at 1080x1920. The page keeps the contract (`window.__ready`, `window.__frameJPEG(t, q)`), so `audit.mjs` and
`views.mjs` work on it. Note the tools path is `../../../tools/motion-lab` from here (the brief's `../../` is one
level short: this project has no `tools/` of its own).

## How the tilt works

The engine's multiplane is screen-parallel planes; it has no tilt. The tilt is the engine's pop-up fold used as a
camera: every piece is either FLAT (lies on the cloth, squashes by sin(tilt)) or a STANDEE (upright cut-out with
its hinge at its base, squashes by cos(tilt)). The view goes from 68 deg (above and a little in front) to 34 deg
(three-quarter) over f2215 to f2300. A standee can also lie down on the cloth (the cutlery at rest) and hinge up
(the fence) with the same transform. Rows of the table sit at their own z (far rows further), so the truck, dolly
and zoom give real parallax, and each row's shadow falls on what is behind it. The candle is the key light: every
piece is baked with its lit edge toward the candle, and its shadow is its own blurred silhouette laid along the
cloth away from the flame, longer the further it stands from it.

## SHOTS

| In | Out | On screen | Words it answers |
|---|---|---|---|
| f1800 | f1950 | The table from above: two plates with cutlery, two glasses, a bottle, salt, a bread basket, a candle at the centre, a sapling in a pot and a napkin at the far right edge. The camera trucks slowly. On "trees" (f1930, snapped) the sapling springs a third tier. | "And when I was at Findhorn, I met this extraordinary English tree expert who had devoted his life to saving trees" |
| f1950 | f2110 | On "redwoods" (f1998) the sapling grows tier by tier into a tree taller than the glasses (seven tiers, one every 4 frames, each a spring). On "backpack" (f2071) the napkin's half turns over, the half folds down, and a small pack springs up leaning on the pot (done by f2098). The flame leans toward the tree through the shot. The camera dollies in a little. | "He just got back from Washington, lobbying to save the redwoods. He's 84 years old, and he always travels with a backpack, because he never knows where he's going to be tomorrow" |
| f2110 | f2300 | On "New York" (f2215) the plates, glasses, bottle, salt and basket rise into towers on paper layers, staggered 3 frames apart, springs with overshoot: plate ziggurats with lit windows, glass towers lit from inside, the bottle as the spire, the salt a squat tower, the basket a dome. On the second "New York" (f2236) the six pieces of cutlery fan out into 34 along a ring and hinge up facing outward as a fence (done by f2284). The camera tilts from high to three-quarter, f2215 to f2300. | "And when I met him at Findhorn, he said to me, where are you from? And I said, New York. He said, ah, New York, yes, that's a very interesting place. Do you know a lot of New Yorkers who keep talking about the fact that they want to leave but never do?" |
| f2300 | f2544 | Four one-colour profile figures walk out of the towers to the fence (arriving on "leave", f2342 to f2351), turn on "never" (f2349) and walk back in; out again on "why" (f2406), at the fence on "leave?" (f2426), back on "gave" (f2442), and stand at the tower doors facing the fence. From "theories" (f2466) to "all" (f2522) the camera pulls up and back (zoom 1 to 0.8) to the whole table as a walled city on its cream cloth, the redwood outside the fence. Hold to f2544. | "And I said, oh, yes. And he said, why do you think they don't leave? I gave him different banal theories. He said, oh, I don't think it's that way at all" |

Cue frames: `js/cues.js` (from `tools/onsets.py`), with two hand picks noted in `NOTES.md`.

## Files

```
tests/table-city/
  index.html            the page: 720x1280, ?t= seeks, ?w= sets the width
  js/paper.js           the paper-depth engine (frame 720x1280, portrait bloom; otherwise verbatim)
  js/table.js           the pieces: bakes (cloth, plates, glasses, bottle, salt, basket, candle, flame, pot, tree
                        tiers, napkin, pack, cutlery, towers, figures), the view, standee/flat placement, shadows
  js/main.js            the timeline: cue frames, the fence ring, the walks, the camera, the planes per frame
  js/cues.js            generated: snapped cue frames
  tools/onsets.py       snaps the key words to onsets of _in/andre.wav
  tools/still.mjs       full-size stills by frame number
  tools/make.sh         the whole pipeline
  LICENSE-paper-fox.md  the MIT notice the engine carries
  node_modules -> mv-projects/bobwiseman-in-her-dream/node_modules (Playwright)
  README.md, NOTES.md
out/table-city/
  andre_table-city-test01_f1800-f2544_24fps_720x1280.mp4   the review file
  check/f<frame>.jpg    stills: 1800 1807 1930 1950 1998 2071 2110 2131 2215 2232 2236 2262 2300 2342 2366 2426 2522 2543
  check/sheet.jpg       4x4 contact sheet of those (less 2232 and 2522)
  check/wip/            working stills from the build rounds, sync pairs (MP4 frame beside the direct still at f2215 and f2522)
```
