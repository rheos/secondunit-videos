# The buildings: eight pop-ups for the table city, the Twin Towers among them (from f2215)

Nov 12, 2026. The two wine glasses became plain glasses, which thinned the skyline, so the city gets eight paper
buildings that are not tableware: six that step in as they rise, and the Twin Towers (it is 1981). They come up on
"New York" with everything else. In section 10 the six go down the way the plate towers do; the twins close sideways
and lie flat. The bottle, the glasses, the plate towers, every cue and every camera key are as they were.

Review file: `out/paper-world/wip/buildings/andre_paper-world-buildings_f2180-f2560_24fps_720x1280.mp4`.
Checks: `out/paper-world/check-buildings/`.

## What a building is

Real geometry, true from every side (`js/skin.js`: `bldgTile`, `twinTile`, `bldgMat`, `bldgWalls`, `building`):

- One to three boxes that step in as they rise. Each box has four painted walls and the `bldg_roof` card on top.
- The walls come from `bldg_stone`, `bldg_brick`, `bldg_teal` and each one's `_dark` twin. A panel is cropped to whole
  window columns (the crop starts and ends in the middle of a pier) and its floors are evened out to one height (the
  panels are painted with a little perspective), so it repeats both ways with no seam. A face is laid out in whole
  columns and whole floors, and every face starts on another column of the panel so the few unlit windows never line up.
- A window is 0.5 cm wide on those six. One column and one floor, in cm (`s05.js FACES`): stone 1.025 by 0.706,
  brick 1.191 by 0.914, teal 1.578 by 0.656.
- Never relit: the paint times the candle's tint (`tintAt`) times one form shade a face, 0.56 away from the flame to 1
  facing it. The drums use 0.72 to 1 round a curve; four flat faces need the wider step to read as a box. Walls and
  roofs cast shadows on the cloth.
- The `spire`, the two `water_tower` cards and the twins' mast are volumes (they turn to the lens), standing on a roof.

### The Twin Towers' face

`bldg_twin` and `bldg_twin_dark` go on once a side, whole: 50 ribs across 5 cm, the two plain bands at a third and two
thirds of the 38 cm. So the one-window-size rule does not hold for these two, by the coordinator's instruction.

The ribs are 1 mm apart, and the face is stretched five to one up the tower, so ordinary filtering takes its level from
the tall axis and samples the ribs too sparsely. Measured head-on from a fixed check camera with the windows dark, a
fine stripe of amplitude 8.9 of 255 stood on the face at 70 cm and 4.9 at 80 cm; that stripe would crawl as the camera
moved. Two things fix it (`twinTile`, `bldgMat`):

- The panel is cut from the middle of its first rib to the middle of its last and resampled to exactly 16 texels a rib
  (800 wide), so every mip level down to one texel a rib averages whole ribs.
- A second copy has every rib averaged away across (a box blur one rib wide). The wall shows the panel only where a rib
  is three pixels or more on screen and fades to the copy where it is finer. The copy has no ribs to alias.

After: nothing over 1 of 255 at any of 14 distances from 30 to 180 cm (`check-buildings/twin-ribs.txt`, and the strip
`twin-ribs_head-on_14-distances.jpg`). The film's own lens never comes nearer than 57 cm to a twin, so in the film the
faces are even silver-grey with the lit windows as short dashes; the ribs themselves would only draw inside about 45 cm.
That test is head-on and still. I did not find a way to measure shimmer on the moving shots themselves (the camera's own
motion swamps it), so watch the twins in the review file and in section 8's couple shot (f3540 to f3640).

## The eight (`s05.js BUILDINGS`, in rise order; x to the right, z toward the viewer, cm)

| Name | Stands at (x, z) | Face | Boxes: footprint, floors | Height | On the roof |
|---|---|---|---|---|---|
| `bldg_01` | -6, -25 | brick | 4.8 by 4.8, 10 | 9.1 | water tower |
| `bldg_02` | -21.5, -21 | brick | 7.1 by 6.0, 13 | 11.9 | water tower |
| `bldg_03` | -27, -36 | stone | 8.2 sq, 18; 6.2 sq, 14; 4.1 sq, 10 | 29.7 | spire, 7.5 (37.2 in all) |
| `bldg_04` | -33, -23 | stone | 6.2 by 5.1, 16; 4.1 by 3.1, 8 | 16.9 | |
| `bldg_05` | -25.5, -13.5 | teal | 4.7 sq, 22 | 14.4 | |
| `bldg_06` | -34.2, -6.8 | teal | 6.3 by 4.7, 14 | 9.2 | |
| `twin_1` | -30.5, -49.5 | twin | 5 sq | 38 | card mast, 6 (44 in all) |
| `twin_2` | -23, -52 | twin | 5 sq | 38 | |

The twins are 2.5 cm apart across the table and 2.5 cm diagonal, at the far end of the skyline. They are the tallest
things in the city until the pine (60): the spire's tip is at 37.2, the bottle 30, the redwood 45 stands outside the
fence. For scale: a plate tower 14, a glass 18, the candle 12, a citizen 4.

The first brief asked for heights to 34 with the spire on the tallest. With the twins in, the spire tower came down
from 33.9 to 29.7 so its tip stays under their roofs, and two of the first eight (a 24 cm slab and a 20 cm brick tower
at the far end) gave their ground to the twins. Eight in all.

## When

- Before f2215 nothing of them is in the scene (built hidden). f150, f1000, f1830, f2100 are identical before and
  after, and f2199 and f2214 are identical with and without the buildings (`check-buildings/regress_before-f2200.txt`).
- A building in slot i is cut at `newyork1 + 3 i`: a pale line round its footprint, drawn in 4 frames (the slots' own
  lip and cut). It starts up 4 frames later, one frame behind the tableware's own risers, so the two sets interleave and
  the city comes up as one event. The six take slots 0 to 5 (f2215 to f2230); the twins share slot 6: both are cut at
  f2233 and both start up at f2237, last and together.
- Each box springs out of the one below, 3 frames apart, damping 0.55 to 0.7 by building, period 16 frames. A sleeve of
  wall under each box keeps an overshoot from showing a gap. The twins are one box each: damping 0.7, period 22, so
  38 cm takes about 15 frames and overshoots under 2 cm. What stands on a roof springs up once the top box is out.
- Windows wipe from the dark panel to the lit one up the whole building, from 12 frames after it starts to rise, over
  22 frames: the plate towers' numbers.
- Section 9: its grade greys them like everything else, and the burst's colour is put on their tint (`skins/s09.js`,
  the `lit` list takes every name in `BUILDINGS` and what stands on its roof).

## The end (section 10: `sections/s10.js BLDGS`, `bldgTele`, `TWINS`, `twinFold`, `TWIN_CARDS`; `skins/s10.js`)

All eight stand in the far half, so all go dark on "feelings" (f4489), top floor first, a frame and a half apart.

- The six: from 9 frames after the word each telescopes down into its cut, the top box first, two frames apart. All
  six are in the cloth by f4517. `bldg_01` goes first (in the cloth at f4507): the far glass comes down across its
  place and lands at f4514. The cuts stay and fade with every other slot on "erased".
- The twins do not go into the cloth. They are dark by f4507 and stand dark, alone, while the others go. From f4521
  both close sideways the same way, toward the viewer, as a pop-up box closes: the two walls across the fold hinge over
  about their feet, the roof rides across on them staying level, the other two walls shear flat. 20 frames, a plain
  ease, no bounce, flat at f4541. Each ends as one card 43 cm long: the far wall face up, the roof at its near end, the
  mast lying beyond the roof on `twin_1`. They lie along the ground the skyline stood on, over the six cuts.
- The flat cards lie 1 cm over the cloth. Lower, the cuts under them showed through (the slots are drawn with a depth
  offset). The fence cards that come down on them from "history" (left edge and far edge) land on top of them
  (`skins/s10.js`, `onTwin`).
- The cards, the mast and the cuts fade on "erased" with everything else. f4629, f4660 and f4740 are identical to the
  film without buildings.

## The registry

`bldg_01` to `bldg_06`, `twin_1`, `twin_2`: section 5, kind `drum`, the plate towers' setters:

- `telescope(k)`: a number, one value a box bottom first, or a function of (box, boxes).
- `windows(k)`: 1 lit, 0 dark, the top floor first.
- `fold(k, heading)`: the sideways close, 0 standing to 1 flat. This is not the drums' `fold`, which tips the stack
  over; a box closes. It works on any of the eight.

Parts `<name>.tier_0` and up. `<name>_cut`: kind `slots`. `bldg_03_spire`, `bldg_01_tank`, `bldg_02_tank`,
`twin_1_mast`: kind `volume`; the building places them, so pose the building, not the card.

## Where they stand, and why there

Worked out from the scene, not by eye: every visible mesh of every section was rasterised onto a 0.5 cm grid of the
table, every second frame from f2215 to f4489 (painted silhouettes, not card rectangles), with the lens path on top.
What that showed:

- Right side, far to middle: the tree man's and the bottle citizens' slots, the gate, the guards and bricklayers, the
  low fence camera of f2346 to f2466, and the redwood's fall line in section 10.
- Right middle (x 9 to 38, z -12 to 27): the head lies there as a flap of the cloth and hinges up.
- Near right: the open hand, its sleeve and the pine.
- Middle: the burst's stem at (0, 5), the ball over it (17 cm radius), and where its scraps land (out to x -30).
- Near left: the three robot ranks (z 19 to 27, from x -37), the couple's slot (z 37 to 49), and the low cameras of
  sections 8, 9 and the start of 10.
- The cutlery's deal lanes off the two fork stacks, the citizens' slots off the plates and the basket.

That leaves the far left quarter (x -37 to -17, z -57 to -12) and a pocket between the far plate and the shakers. Seven
stand in the far left, one in the pocket; the two nearest are as near as the scraps allow (z -7 and -13.5). Nothing in
the near half is free: the brief's "a few nearer" is not met. Every footprint has a centimetre clear on all sides for
the whole of f2215 to f4489. The lens never comes within 30 cm of a building (the brief asks 3).

The twins are at the far end because that is the one place a 43 cm card can lie: toward the viewer, down the length of
the far left quarter, once the six are in the cloth. From the crane (f2260 to f2300) they stand at the skyline's right
end, side by side, between the spire and the far plate tower.

## What each later shot sees (`check-buildings/changed-vs-no-buildings.txt`, and the sheets)

The same 28 frames were rendered with and without the buildings from the same code.

- Identical: f2400, f2480, f2800, f3037, f3118, f3340, f3396, f3475, f3700, f3829, f4660, f4740. A handful of pixels at
  f4250 and f4300.
- f2230 to f2300, f2543, f4400, f4500, f4600: the skyline, its end, as intended.
- f3613: the couple now walk in front of the skyline. Both figures read; the woman is against the two teal faces
  instead of dark room, the twins and the spire stand over her to the left. This is the one later shot whose backdrop
  changes, and it is Robin's call.
- f2650, f2900, f3250, f4026 to f4096: a building at the frame's edge, away from the subject.

## What it does not do

- f2400 is unchanged. That shot looks across the street at the fence from inside the city; nothing but the fence, the
  citizens and the redwood is in its view, and the ground there is slots and the lens's own path.
- f2543: the far left quarter reads as a city, with the twins and the spire as its marks. The near half is still
  tableware on bare cloth.

## Files

`js/sections/s05.js` (FACES, BUILDINGS, BLDG, bldgCut, bldgRise), `js/skin.js` (the makers, built in `buildTable`),
`js/skins/s09.js` (one line), `js/sections/s10.js` and `js/skins/s10.js`. Not touched: the registry, plates, any other
section, the camera, the cues.
