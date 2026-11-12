# Sections 3 and 4: the polish pass, f504 to f1800 (Nov 11 2026)

Files changed: `js/sections/s03.js`, `js/sections/s04.js`, `js/skins/s03.js`, `js/skins/s04.js`. Nothing else.
`tools/cues/s03.json` and `s04.json` are as they were: no cue moved, no word added.

Review file: `out/paper-world/wip/polish-s34/andre_paper-world-s03-s04-polish_f504-f1800_24fps_720x1280.mp4`
(1,296 frames, 54.000 s, voice from 21.0 s, muxed without `-shortest`). Frames: `out/paper-world/wip/polish-s34/frames/`.
Checks: `out/paper-world/check-polish-s34/` (`sheet_every-1s.jpg`, `f1150-f1300_every-6.jpg`, `join_f1193-f1199.jpg`,
nine full-size stills, `before/`, `after/`, `regress.txt`, `camera-speed_f504-f1800.txt`, `badframes.txt`, `flashcheck.txt`).

## What changed, by fix

1. **f1150 to f1300.**
   - The camera comes down the front rank behind its falling wave and stops 9 cm off the last one standing, at its
     own height (2.4 cm). At f1174 it stands 491 px tall (38 % of the frame) across the middle, the fallen cards of the
     front and second rank behind it on the right.
   - f1196 is no longer the shared join. Both sections carry the same key (`J1196`: P [-24.6, 3.4, -41.6],
     T [-30.8, 0.9, -51.2], velocity [0.4, 0.1, 0.18] a frame). `joins.js` is untouched; `joinFloat` is still used.
     `join_f1193-f1199.jpg` is the strip; the speed print has no jump there (0.28 cm a frame at f1192, 0.44 at f1196,
     0.64 at f1200).
   - Section 4 opens as one pull-back that keeps looking the way the close-up looked (the far left): past the right
     end of where the room will stand, to its open front. The turn is 40 degrees over 30 frames, then the view holds.
     The coin slides out from under the lens and off the far edge (f1204 to f1216), the floor's outline is cut below
     the lens (f1205 to f1217), the floor goes over in front of the lens on "meeting".
   - The room's events each moved one cue earlier, so every one is still on a snapped cue frame: the cut f1205 to
     f1217 (was on "meeting"), the floor flips on "meeting" f1221 (was "just"), the back wall springs up on "just"
     f1252 (was "met") and the right side wall opens 9 frames later, the left side wall opens on "met" f1281, off
     the television. The screen's glow comes on as that wall swings off it. Folded, a side wall sits 2 mm proud of
     the back wall so it does not fight the cards that stand against it.
   - Section 3's pull-strip is drawn off from f1194 (was f1198) over 50 frames (was 44): the last one has landed at
     f1188. The coin sinks f1182 to f1192. Everything is over the far edge by f1228.
2. **The citizens are slate**, `[74, 82, 96]` (was grey-ochre `[116, 102, 80]`), the cut rim the same slate, paler.
   Still one plate, one colour, tinted by the candle's distance and the screen's cold glow as before.
3. **Framing.** The truck along the front rank is at 2.5 to 2.9 cm, 10 cm off (f577 to f640). The wheel is held from
   7.5 cm up and 18.5 cm off its hub instead of 18.5 up and 26.5 off: the coin lies across the middle of the frame,
   a rider passes 11 cm from the lens, the screen at the left edge, the ranks behind (key image f790). The dominoes
   are seen from 4.4 to 6.4 cm up. One soft piece, `s03.soft_fork` (the `fg_fork` plate, blurred 7 px, at 26 %), stands
   at [-16.45, -47.3] in the lower right from about f1046 to f1130; it enters and leaves over the frame's right edge and
   is in the scene only for f1041 to f1139. The second allowed piece is not used.
4. **The coin and the riders.** The camera comes down the left side outside the coin and between its rim and the flat
   television: from f552 the coin is out of the frame (at f546 it is a mid-distance disc at the right edge). Each rider's card swivels on its tab: tangent to the rim while
   that shows its face, and back through face-on where the rim would turn it edge-on. It never shows the lens less
   than 52 degrees of face. The cost: a rider on the far side of the rim rides backward.
5. **f1764 to f1800.** The robot is seen from 2 cm further back (213 px at f1772, was 305). From f1764 the lens draws
   back and round the near side of the pepper and the salt, 13 to 17 cm off them, then down the salt's right side to
   section 5's first key. They cross the frame right to left as two towers, f1774 to f1787. By eye on f1781 the
   pepper covers about 18 % of the frame and the salt 15 %.

## What did not change

- The camera at f504 and at f1800, and everything after f1800: `regress.txt`, five PNG frames before and after.
  f500, f504, f1800, f1810, f2400: mean absolute difference 0.0000, largest 0, on all five.
- Every cue frame. `fg_glass` and `fg_fork` (the table's): hidden for f504 to f1195, and in section 4 hidden until
  f1662 and in place from then on, as before.

## Checks

- Camera f504 to f1799: slowest 0.050 cm a frame (about f1692, on the eye, as before), fastest 2.63 (f546, crossing the
  table, as before); in section 4 the fastest is 1.50 at f1782 (was 1.31). No dead stops, no jumps. Fastest turn
  2.4 degrees a frame at f648 and 2.3 at f566 (was 2.5 at f1788).
- badframes 0 of 1,296. flashcheck pass (worst 2 flashes in one second, at f1248: the floor landing).

## Defects that remain

- f1188 to f1203: the last one lies flat and nothing stands in the frame until the coin slides in at f1204.
- f1217 to f1221: four frames of cloth with the cut outline before the floor lifts.
- f1237 to f1252: the folded room lies on its floor as a dark teal packet with the lamp's cream card back on it.
- f549 to f566: the machine is still flat, so the frame is the flat television and the flat ranks.
- f1776 to f1783: the pepper and the salt are large in the frame together (about a third between them), and the
  robot leaves the frame at about f1779, a frame or two after the original.
- The exit is faster than it was: 1.2 to 1.5 cm a frame from f1780 to f1790, slowing to 0.29 at f1800.
- No depth of field in this renderer: the fallen ranks behind the last one are sharp, not soft.
- `notes/s03.md` and `notes/s04.md` still describe the old camera and the old order of the room's events (not mine to edit).
