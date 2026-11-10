# type: kinetic typography look test, f504-f1188 (21.0-49.5 s)

Builds on `../../../bobwiseman-airplane-type/` (the finish in `js/look.js` + `js/gl.js`, the UI kit in
`js/ui.js`), re-cut for 720x1280 with the plane gone. One continuous interface in a tall frame: a column
of words at the top, instruments in the lower half, a paper readout tape along the bottom 120 px.
Every event sits on a frame from `js/words.js`, which `onsets.py` generates from `_in/cues.json` with
each word snapped to an onset of `_in/andre.wav`.

## Commands (run from this folder)

```bash
PY=/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python
ln -s /Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-in-her-dream/node_modules   # Playwright, once
nice -n 15 $PY onsets.py                                       # _in/cues.json + onsets of _in/andre.wav -> js/words.js
nice -n 15 node render.mjs 504 1188 ../../out/type/andre_type-test01_f504-f1188_24fps_720x1280.mp4 --workers 4
nice -n 15 node check.mjs ../../out/type/check 504 507 555 567 588 603 626 633 671 702 725 741 775 781 801 818 829 844 870 878 888 900 916 930 961 985 1002 1028 1039 1066 1072 1104 1130 1132 1156 1169 1187
nice -n 15 $PY ../../../tools/cloud-render/badframes.py ../../out/type/andre_type-test01_f504-f1188_24fps_720x1280.mp4
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py ../../out/type/andre_type-test01_f504-f1188_24fps_720x1280.mp4
```

`render.mjs` draws frames `[f0, f1)` at 720x1280 through `window.__frameJPEG`, then muxes the master's
audio for the same span (`-ss f0/24 -t (f1-f0)/24`, aac 192k; video libx264 crf 23 yuv420p). `check.mjs`
writes full-size `f<frame>.jpg` stills plus `sheet.jpg` (ffmpeg `tile=4xN`). The motion-lab tools also
work on `index.html` (`?t=<s>` seeks in a browser, `?w=` sets the width):
`node ../../../tools/motion-lab/render.mjs index.html 21.0 49.5 out.mp4 --width 720 --height 1280 --audio ../../_in/andre.wav`.

Results (2026-11-10): 684 frames, duration 28.500 s, review audio against the master at 21.0 s by
cross-correlation: lag 0 ms. badframes 0/684, flashcheck PASS (worst 0.5 flashes in a second).

## SHOTS

Frames are snapped onsets (`js/words.js`); the brief's rough shot frames moved to the cue the shot answers.
Lines hold at least 36 frames after their last word before they leave.

| In | Out | On screen | Words it answers |
|---|---|---|---|
| f504 | f626 | SH01 STATUS. `> status:` types in the accent; "Okay, yes." in the serif (f507, f527); WE ARE (f555); BORED stamps in, scale 1.3 to 1.0 over f562-f567, 2-frame hold, the layer's jolt settles on a 0.6 spring; a roster panel on "We're" (f588), rows one by one on "all", streaming up on "bored" (f603), full speed on "now" (f611); roster leaves f647-f653 | Okay, yes. We are bored. We're all bored now. |
| f626 | f741 | SH02 LOOP. The stamp cuts out at f628. "has it ever occurred / to you, Wally," serif at the top (f633-f657). PROCESS box (f671), the right arc draws to BOREDOM (f702) with `creates` on it (f684), the left arc closes the loop by "world" (f725); "that we see in the world now" dim serif (f717-f732) | has it ever occurred to you, Wally, that the process that creates this boredom that we see in the world now |
| f741 | f900 | SH03 SPIN. The loop turns on "may" (f741), 0.45 rev/s by f760, 1.6 by "unconscious" (f801), 2.6 by "brainwashing" (f829), 3.2 by f860, ghost copies when it spins. A SELF- (f775), PERPETUATING, (f781), UNCONSCIOUS (f801), all three 77 px (fit to the 624 column, floor 56 px); the words dim to 40% over f803-f815; "form of" (f818); the three lines leave f856. BRAINWASHING bar panel (f829) fills to 73% in 24 frames and then creeps (74.2% at f880, 75.4% at f900). "created by a" (f844), WORLD (f870), TOTALITARIAN (f878), GOVERNMENT (f888) | may very well be a self-perpetuating, unconscious form of brainwashing created by a world totalitarian government |
| f900 | f1002 | SH04 MONEY. Loop and bar fold away f900-f906; MONEY gauge panel springs in on "based" (f901); needle from 8% to 38%, then slams to the peg (0.5 spring, 3.2 Hz) so it meets the red on "money" (f916) and jitters there; the government lines leave f930; "and that all of this is much more" serif (f930-f961); DANGER pop-up opens f958-f961, `DANGER: higher` then "than one thinks?" word by word (f976-f985); glitch tear decays from f961 (the only glitch); pop-up closes f1021-f1025 | based on money, and that all of this is much more dangerous than one thinks |
| f1002 | f1104 | SH05 SCAN. Gauge folds f1002-f1008; radar panel springs in on "it's" (f1002), sweep 1 rev/2.2 s; "it's not just a question of" serif (f1002-f1028); INDIVIDUAL (f1028), SURVIVAL, (f1039), one blip lit by the sweep on "survival" (f1039); "Wally," serif in the accent (f1066); "but that somebody who's bored" (f1072-f1093); the three lines leave f1102 | And it's not just a question of individual survival, Wally, but that somebody who's bored |
| f1104 | f1130 | SH06 SLEEP. ASLEEP, 120 px (f1104); the veil dims the interface to 38% over f1104-f1128; the words sink 44 px and fade; a breathing LED (2.6 s) above the tape; the radar folds f1122-f1129 | is asleep |
| f1130 | f1188 | SH07 DIALOG. A dialog springs in on "and" (f1130): "somebody who's asleep" (f1132-f1143), "will not say" (f1156-f1166); [ YES ] [ NO ]; NO greys out and is struck through on "no" (f1169); the cursor drifts from the lower right to YES (f1169-f1188, ease-in-out sine) and rests on it; hold to the end of the file (19 frames after "no", the section's end) | and somebody who's asleep will not say no |

Readout tape (bottom 120 px): frame counter, a label + value that only reports what the picture just did
(STATUS BORED ×0036, PROCESS 1.29 REV/S, BRAINWASHING 74.2%, MONEY 100% ▲, DANGER, INDIVIDUAL ×1,
ASLEEP, NO ×), and the voice level of the last 12 frames.

## Files

- `index.html` the page (`window.__ready`, `window.__frameJPEG(t, q)`, `?t=`, `?w=`); loads Google Fonts and `tools/motion-lab/motion.js`
- `js/core.js` time, easing, springs (damping ratio), piecewise-rate integral for the loop, frame assembly
- `js/gl.js` the WebGL finishing pass (unchanged from the reference)
- `js/look.js` the shader: edge channel split, grain, scanlines, vignette reshaped for 9:16, bloom on the accent only, glitch tear
- `js/ui.js` palette, type, panels, cursor, chrome, the readout tape
- `js/shots.js` the timeline, f504-f1188
- `js/words.js` generated: `WORDS` (word, snapped frame, cue frame, seconds, how) and `VOC` (voice level per frame)
- `onsets.py` the snapping and the voice level
- `render.mjs`, `check.mjs` render and stills; `package.json`; `node_modules` -> mv-projects/bobwiseman-in-her-dream (symlink, Playwright)
- `NOTES.md` BANNED list, defects, what the full film would change
- Output: `../../out/type/andre_type-test01_f504-f1188_24fps_720x1280.mp4`, `../../out/type/check/f*.jpg` (37 stills), `../../out/type/check/sheet.jpg`
