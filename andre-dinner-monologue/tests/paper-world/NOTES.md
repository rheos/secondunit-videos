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
