# Profile film: the Bureau passage

The 19.2 s passage of Robin's portfolio film from 70.5 to 89.7083 s on the current cut (`assistant/portfolio-video/picture-draft/robin-portfolio-with-desk-opening.mp4`). It runs from "Building these applications is another place I use agents" to "the conversation that produced it", and its last frame is the first frame of the approved one-administrator beat (`robin-profile-admin-beat`, test 03). Issue #448.

Robin's direction, Nov 7: match the administrator beat's navy and gold, keep it lively like the Romancing the Atom reel, and show the technical looks in the quiver.

| Plate | Time (s) | Words | Look |
|---|---|---|---|
| 0 The door | 0 to 3.3 | "...another place I use agents" | flat vector living room; Robin opens the door, agents peek out, he steps through |
| 1 The Bureau | 3.3 to 6.8 | "...called the Bureau to organize that work" | chart-world isometric cutaway, floors drop in, leader labels, tickets on a route |
| 2 Requirements | 6.8 to 8.42 | "from working out the requirements" | banknote engraving: guilloche, line-tone cameo, the brief written with a nib, red serial and Robin's seal |
| 3 Implementation | 8.42 to 9.52 | "through implementation" | voxels dropping into a tower, voxel agents |
| 4 Review | 9.52 to 10.52 | "and review" | woodcut, pulled through the WebGL print pass |
| 5 Division of labour | 10.52 to 12.78 | "Different agents take on different parts" | all three looks side by side; only the woodcut panel goes through the print pass |
| 6 Fresh context | 12.78 to 19.21 | "The reviewer gets a fresh context..." | the change crosses into the reviewer's woodcut room; a red blade cuts the string of conversation bubbles, which fall in a heap; Robin becomes the gold figure |

Engine: the Romancing the Atom canvas kit (`js/kit.js`, `js/type.js` copied from `achbar-atom-reel`), plus `js/finish.js`, the woodcut shader from `bobwiseman-airplane-woodcut/js/look.js` masked to a rectangle. Word times are in `js/words.js` (Robin Pro film take v3, re-clocked to this passage).

```
ln -s ../../_wt-atom/achbar-atom-reel/node_modules node_modules   # or npm i
ffmpeg -ss 70.5 -t 19.2083 -i <current cut> -vn -ar 48000 assets/song.wav
node check.mjs out/sheet.jpg 1 4 7 9 10 13 17 19.2
node render.mjs 0 19.2083 renders/bureau-passage_draft1_720p.mp4 4 24 0.6667
```

Draft 1 (Nov 7) is unreviewed. No sound effects yet.
