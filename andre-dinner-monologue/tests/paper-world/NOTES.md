# paper-world test 02: notes

This is a blocking pass (conductor, Nov 11 2026): the camera, the timing on the words, the staging and the pop-up
mechanics are what to judge. The paper surface here is a stand-in; the final one is made in a photoreal pass.

## BANNED

From the brief, kept out from the start: smooth plastic 3D, glossy highlights (roughness 1, metalness 0
everywhere), a still camera, a zoom instead of a crane (the lens is fixed at 60 degrees), a cut, figures that
slide (feet are planted by IK from the distance walked), a figure that pops in, faces, text, a Christmas-tree
redwood, wedding-cake pastel towers, the musician, lens flares, depth-of-field blur (none at all).

Defaults I reached for in the first stills and took out:

- **A physically correct candle** (inverse-square falloff). The far cloth and the redwood went black. The key now
  falls off slowly and a shadowless warm light high above the flame stands in for the room's bounce.
- **Paper grain as a strong bump.** Every surface looked scratched in the macro shots. Cut to a hint.
- **Dark window cut-outs on the tableware at rest.** The bottle and glasses read as towers before "New York".
  A carrier's windows are hidden until its first one lights.
- **A full-thickness telescoping trunk on the sapling.** It read as a stack of flowerpots. The trunk is thin
  while it is a sapling and thickens as it shoots up.
- **A staff taller than the man, held through the fist.** It crossed his head. Now a stick with his hand on its top.
- **The camera square to him with the bottle directly behind at "84".** A green card on a navy wall disappears.
  The camera is behind his shoulder: bottle on the left, him against the lit cloth, candle and glass beyond.
- **Rising to 25 cm while he turns.** From above the card is a 30 px sliver. The camera stays under 11 cm until
  the turn is over, then rises.
- **Looking down the street at the fence.** Cards walking away from the lens are edge-on lines. The view crosses
  the street instead.
- **Plain Catmull-Rom camera keys.** The camera dipped to the cloth before the last crane. Tangents are limited
  so no channel overshoots a key; the last crane is eased along its line.
- **A citizen in a flat cap with a brim.** Too close to the guard's peaked cap (Builder B's). Citizens wear a
  beret, a bob or nothing.
- **A teal citizen.** Read as a second tree man. No green or teal citizens; he is the only green figure.
- **1024 px shadow faces.** Blocky shadows when the camera is 4 cm above the cloth. 2048 px, and the flame is a
  small area light (the light is jittered across the sub-renders), so shadows soften with distance.
- **Cutlery cards 1.1 mm thick.** Nine in a stack made a 1 cm slab. They are 0.6 mm.
- **The tree man standing by the redwood from f2300.** He cannot walk there in time and nothing may pop. He
  walks out through the fence instead (f2367).

## Cue picks

`tools/onsets.py` is test 01's snapper with the same two hand picks ("New York" 2 at f2236, "leave?" at f2426)
and "New York" 1 held at Whisper's f2215. "tree" and "expert" both snap to f1874. Snapped values: `out/paper-world/check/cues.txt`.

## Known defects (frame numbers)

1. f1874 ("tree expert"): the tree man is 118 px tall, pale and seen at about 45 degrees, beside the pot with the
   glass stem large in the foreground. He is in frame from f1800 as a speck walking in from the dark; he does not
   enter at the frame edge on the word.
2. f1996 to f2001 ("redwoods"): he leaves the right edge of frame before the sapling is in view, so the first
   three frames of the redwood's growth are off screen. It is seen shooting up from f2002, peak look at f2009.
3. f2012 to f2018: on the way back down from the redwood the frame is mostly room and bare cloth.
4. f2022 to f2071: he stands in the bottle's shadow side, so the lean on "84" and the hitch on "backpack" (the
   pack jumps 0.56 cm) are small, low-contrast moves. They read at full size, not at a glance.
5. f2106 to f2130: the flame's lean after him is slight (about 25 degrees) and brief.
6. f2192 to f2200: the turn reads (353 px, edge-on at f2196 and f2197) but he overlaps the candle's saucer.
   His second turn (f2218 to f2226) is about 80 px tall from the rising camera and easy to miss.
7. f2215 to f2330: in the crane the tree man and the citizens are 40 to 80 px.
8. f2236 to f2300: the fence deal was checked on stills at f2262, f2270, f2280 and f2292 only, not frame by
   frame; the near-side cards swing through half a turn as they leave their stacks.
9. f2245 on: citizens walk out through the tower walls. There are no doorways.
10. f2349 to f2365 ("never do"): two of the turning citizens stand within 2 cm of a post, so their edge-on
    frames sit against the post. The nearest citizen is 350 px, the ones at the fence 102 to 209 px.
11. f2380 to f2466: with the lens 4 cm above the cloth, the figures' contact shadows show shadow-map steps.
12. f1840 to f1990: the cutlery stacks' cut edges show the grain as fine stripes.
13. Whole film: the camera floats on a 0.6 to 1 cm circle every 3 seconds so it is never still. In the close
    shots it reads as handheld. It is one line in `story.js camAt`.
14. f2494 to f2543 (the wide): from above the plate towers read as tiered cakes; the redwood leans outward (60
    degree lens, far corner); the room is flat navy with little crumple; figures are 11 to 18 px.
15. A tower's unlit windows all appear on the frame its first window lights.
16. The table is never seen from above at rest in this cut, so "reads from above as a real place setting" is not
    shown; both settings are laid for a viewer at the near side (as in test 01), and the candle is 19 cm off-centre.
17. Not done from docs/BRIEF.md: `views.mjs onion` (the page keeps test 02's `renderFrame` contract, not
    `__frameJPEG`); springs are `kit.js spring(t, zeta, period)`, zeta 0.5 to 0.72, not `motion.js`.

## For the Blender pass

`out/paper-world/blocking.json` carries the camera and every named object per frame (centimetres, y up; see README).

Import as-is:
- the camera (position, target or quaternion, 60 degree vertical field of view) for all 744 frames. Drop the
  slow circular float if a steadier camera is wanted: it is added in `story.js camAt` after the keys.
- the layout (`layout`, `fence_polygon_xz`) and every object's track: riser heights (`plate_far.tier_k`,
  `bottle.upper`, `glass_*.upper`, `salt.upper`, `pepper.upper`, `basket.dome`, `napkin.fold`), the 54 fence
  cards (`fence_NN` slides, `fence_NN.hinge` stands up), the redwood (`redwood.trunk_k`, `.crown`, `.tier`), the
  flame's lean, the key light's position.
- the figures' root tracks (`treeman`, `citizen_NN`: position and yaw, including the half-turn flips) and, if
  the rig is kept, each limb card's track under its figure.
- the cue frames and the beat list.

Rebuild:
- every surface and material: paper stock, torn edges with the white core, creases, the crumpled navy room.
- the lighting: one flame as the key with real soft shadows, real bounce; drop the shadowless `bounce_light` and
  the cool `eye_fill` on the lens (both are cheats for readability), and add the shallow depth of field.
- the pieces as paper craft: the plate tiers as nested drums with paper tabs, the bottle and glasses as rolled
  and scored tubes, the cutlery as die-cut cards. Sizes are in `objects.<name>.size`; outlines of the cutlery and
  the figures are in `js/table.js` (`CUT`) and `js/figures.js`.
- windows: positions are generated in `js/table.js` (`ringWindows`) and are not in blocking.json. Their timing
  rule is "floor by floor from the riser's start, 1.2 to 2.5 frames a floor, plus up to 6 frames of scatter".
- the pop-up tabs: only the bottle and glasses have struts here (`*.strut_a/b`), and the fence cards have foot
  tabs. The plates, shakers and basket rise through a pale slot ring with no tabs.
- the figures as standees with a base tab and real paper joints (brads); doorways in the towers (citizens walk
  out through the wall here).
- Builder B's guard, hands, seed and pine (`js/cast/`) are not in this section.

## For the full film

The same kit carries the camp section: the fence is already a wall of cards on a loop, and a citizen card can
turn into a guard on the half-turn. Give the camera more to pass close to in the first leg (a second glass, the
bread basket nearer the path), and decide whether the candle may sit off-centre as it does here.

---

# Test 03: the painted skin

Same camera, cues, positions and audio as test 02; every object replaced by its painted card (`js/skin.js`,
`index.html?skin=1`, `zsh tools/make03.sh`). What changed is listed in README.md under "Test 03".

## The test: would the frame pass for a photograph of a paper model on a restaurant table?

- **The wide (f2543): no, not yet.** The pieces pass. The frame does not: the 90 by 130 cm cloth is mostly empty
  (the city is nine small pieces on it, where the target still packs a table a third the size), the cloth is a
  flat lit plane with no fabric relief, the table reads as a box, and the candle sits inside the fence so the
  fence's shadows fall outward off the table instead of raking across it as in the target.
- **The street frame (f2400): nearly.** Standees on their tabs, the cutlery fence, the redwood trunk and the
  out-of-focus room behind hold up beside the target. What gives it away: the cloth (even, a little like kraft
  paper at this distance), slots drawn as clean lines, standee shadows that are thin lines because their cards
  point at the flame, and no depth of field in the mid-ground.

## BANNED (added in test 03)

- **Relighting a painted piece.** No light touches a card; test 02's `eye_fill` and the bounce on figures are gone.
- **Mirror-tiling the whole cloth plate.** Its corner wrinkles repeated as butterfly marks in the wide. The even
  middle is tiled; the whole plate goes over it once.
- **Leaving the real glass and fork on the table.** They showed up in the crane and the wide as a real coupe in a
  paper city. They exist only while the lens passes them.
- **Upright billboards under a high lens.** From 47 degrees up the towers were squashed slivers with a second
  plate floating under them. Volumes lean back to the lens above 24 degrees, and a plate tower's card is seated
  toward the lens so its painted plate lies over the flat disc.
- **Fill light as strong as the key.** The shadows disappeared. The flame gives most of the cloth's light now.
- **An orange key.** It turned the linen into burlap. The key is a pale warm white; the warmth is in the paint.
- **Letting the cloth burn out by the candle.** It bleached the tree man through the glow pass. Lit paper rolls off
  to white and no longer feeds the glow; the glow is the flame and, faintly, the lit windows.
- **Test 02's film curve on the paint.** It washed the plates. Paint goes through as painted.
- **A white core in the standees.** It showed as white slivers at the neck and between the legs in three-quarter
  view. The core is the figure's own colour, 0.2 mm wide.
- **Recolouring by saturation.** It turned the cream tabs navy and left the teal woman teal. Recolouring is by hue:
  only pixels the colour of the figure's own paper change.
- **Black slot lines.** They read as marker. Dark brown, 1 mm, with a pale lip.
- **The camera behind the far glass's stem at "84".** The stem covered him. Shifted to his shoulder.
- Legs, the lean, the hitch, the walking stick's swing: gone with the rig.

## Pieces: missing or wrong (nothing was repainted)

- **No dark-window plates for `basket` and `saltpepper`.** They cannot wipe on. They stand dimmed 30 % until
  "New York" and brighten; their windows glow from the first frame.
- **No napkin piece.** The napkin is gone from the table.
- **`tower_plate` carries its own plate**, which doubles with `plate_disc` lying under it. Seating the card toward
  the lens hides most of it; a tower painted without its plate would sit on the disc properly at every angle.
- **Every piece is lit from the upper left.** The candle is to the right of the far plate tower, the far glass and
  the salt and pepper in most shots, so their painted highlights face away from the flame.
- **`fg_glass` is a coupe of red wine**; fine as a blur. **`fg_fork`** is drawn at a slant, so it stands as a card
  rather than lying on the cloth.
- **Only two citizen plates.** Navy and ochre are recolours of them, as briefed, so there are two silhouettes.
- **`redwood` is 45 cm on a 10.6 cm wide card**: slim for a redwood; the target's is far heavier.
- **`candle`'s flame** is split from the body where the wick is narrowest so it can lean; the split is automatic.

## Known defects (frame numbers)

1. f1800 to f1832: the real glass covers up to half the frame as the lens passes within 2 cm of it.
2. f1860 to f1905 and f2014 to f2030: the far paper glass's stem and foot fill a quarter to a third of the frame
   (the test 02 path passes 5 cm from it). At f1874 ("tree expert") the tree man is 100 px beside it.
3. f1995 to f2001: he passes behind that stem (5 frames hidden). From f2002 he is in frame with the rising redwood.
4. f1998 to f2010: the redwood hinges up from lying flat beyond the table's corner, so it rises out of the dark
   past the cloth's edge; the folded sapling lies at its foot from f2008 on.
5. f2106 to f2215: the candle, bottle and glass turn to follow the lens as it goes round them. That is the rule
   for volumes; on the candle orbit it is visible as the pieces "watching" the camera.
6. f2215 to f2300: a plate tower's card is seated 3 to 6 cm toward the lens, so its base slides a little on its
   disc as the camera cranes round.
7. f2236 to f2262: the cutlery cards at rest are nine identical cards in a stack; the deal was checked on stills
   at f2250, f2262, f2276 and f2290 only.
8. f2280 to f2470: citizens' shadows are thin lines (their cards point at the flame); the fence's shadows fall
   outward off the table. Soft, not stepped, on the 1:1 crops checked (f2300, f2400, f2426).
9. f2300 on: a citizen about to rise lies flat at the head of its slot for up to 9 frames and reads as a grey
   figure on the cloth.
10. f2349 to f2365 and f2432 to f2450: the citizens' turns; two stand within 2 cm of a fence card.
11. f2494 to f2543: the wide, as above. Figures are 10 to 16 px; from above the fence cards are slivers.
12. Slots are drawn from frame one, so the citizens' slots lie on the cloth before there is a city.
13. The mid-ground has no depth of field (by the rule); the foreground blur is in the texture, so it does not
    change as the lens approaches.
14. Whole film: the camera's slow float (test 02 defect 13) is still there.

## What a Seedance pass would need from these frames

- **Clips, not the whole move.** The test is one 31 s camera move; Seedance works in 5 to 10 s clips. Natural
  handovers, each with a first and last frame from `out/paper-world/frames03/`: f1800-f1930, f1930-f2110,
  f2110-f2215, f2215-f2300, f2300-f2466, f2466-f2544. Overlap each by 8 frames for the join.
- **First and last frame of every clip as image conditioning**, plus one or two frames inside it at the beats
  (the redwood up at f2010, the towers up at f2262, the fence up at f2300, the turns at f2357 and f2440), or the
  model will invent its own timing. The cue frames are in `blocking.json`.
- **A prompt that says what must not happen**: the figures are card standees on tabs that slide and rock; they
  never bend a leg, never grow a face. Nothing on the table is real except the cloth. One flame.
- **Mattes and depth from the same render**, so its output can be composited back over ours where it drifts: an
  object-ID pass and a depth pass are a small addition to `main.js` (every card is its own mesh).
- **Higher resolution stills** for conditioning: the plates are 1024 to 1536 px, so 1080 by 1920 frames are free
  (`W=1080 H=1920`).
- **The audio stays ours.** Generate silent, conform to 744 frames at 24 fps, mux the master cut as now.
- **Decide first what Seedance is for.** These frames already carry the pieces, timing and camera. What they
  lack is in the two verdicts above: real cloth, real contact shadows and soft depth of field. A relight and
  defocus pass may get there cheaper than regenerating the motion.

---

# Test 04: the plate towers as drums, and the opening

The director on test 03: "overall, this is great", and one note, "the building cakes on the plates are not at quite
the right angle." Test 04 is that fix and the foreground glass, nothing else. README.md, "Test 04", has the build.

## What the towers look like now

- **Street height** (a check camera; the film never sees a risen plate tower from this low): three stacked drums
  with an umber band at each rim and a row of small arched windows glowing warm, brighter low in the arch. The
  side away from the flame is a shade darker. The walls are plain orange card: flatter than the painted
  tower was, with no scored panels or tabs.
- **Mid-crane (f2262)**: tiers stepped back with their pleated tops showing, standing square on the plate from
  every side as the lens goes round. No lean, no sliding on the disc.
- **The wide (f2543)**: three concentric pleated discs and the cap on the plate, a ring of windows under each
  rim, the tower's shadow thrown away from the candle. This is the director's crop; it is the right angle now.

## What changed that was not asked for

Nothing in the picture. `check04/changed-vs-test03.txt` compares all 744 frames with test 03: f1800 to f1824
differ (the glass), f2216 to f2330 and f2477 to f2543 differ (the towers and their shadows), every other frame is
the same to within JPEG noise. `SKIN=1 T3=1` still renders test 03's frames exactly (difference 0 on the frames
checked). In the code: `skin.js` gained `tierCell`, `wallMat`, `drumTower` and a `DRUMS` switch; `main.js` and
`render.mjs` gained `CAM=` for check stills; `blocking.json` has six more objects (the tiers and caps).

One thing caught on the way: the first test 04 render left the real glass and fork standing on the table for the
whole film (an edit had commented out the line that registers them). The frame-by-frame comparison showed changes
where none should be; fixed and re-rendered before delivery.

## BANNED (added in test 04)

- A painted three-quarter view standing in for a solid that the camera sees from above. Solids that are seen from
  more than one height are built.
- An inline comment added in the middle of a one-line block.

## Pieces (nothing was repainted)

- **`tier_wall` is a stronger, yellower orange than `tier_roof`** (salmon) and than the old painted tower, so the
  walls and tops do not quite match and the towers are the most saturated thing on the table.
- **`tier_wall` has no panel scoring, tabs or cut edges** apart from the faint joins between its three windows, so
  the walls read as a smooth wrap at close range.
- The panel's windows are plain yellow; the glow is added in code as asked.

## Known defects (frame numbers)

1. Not in the film, check camera only: at street height the walls are flat orange card with little paper detail.
2. f2216 to f2236: the tiers telescope up through their own pleated tops; for the first two or three frames of
   each tier the top of the tier below is cut by the rising wall with no slot drawn.
3. f2228 to f2262: the dark windows are near-black arches until the wipe reaches them (from f2227, 22 frames).
4. f2477 to f2543: from above the walls are slivers, so the windows are a few pixels; the pale rim rings read as
   fine light circles.
5. f1800 to f1822: the foreground glass is now in front of the bottle at the frame's right edge (22 % of the frame
   at f1800, by `fgcover`-style difference against a render without it), and its foot crosses the candle's holder
   for the first 8 frames.
6. All of test 03's other defects stand (NOTES above), except its numbers 6 (tower seated toward the lens) and the
   leaning half of 5 for the plate towers, which are gone.
