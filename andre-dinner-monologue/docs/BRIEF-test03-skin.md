# Test 03: skin the table section with painted cards

Read `LOOKS.md` sections 5 and 6 (the reference, the method decision) and `docs/STORYBOARD.md` (the
grammar table and section 5). Robin's decision, Nov 11 2026: "first do the whole thing with paintied
pieces and once that is all solid we will look at running it through seedance after."

The blocking (test 02) keeps its camera, its timing and its positions. Every procedural object is
replaced by its painted piece, standing in the same place as a card. The result has to pass this test:
**would this frame pass for a photograph of a paper model on a restaurant table?** The two target stills
are the standard: `out/paper-world/styleboard/target-table-city_v1.png` and `target-camp-wall_v1.png`.
Open them before you start and put your hero stills beside them before you finish.

## The pieces (all in `tests/paper-world/work/plates/`, gitignored; `plates.json` has every prompt)

RGBA cut-outs, lit warm from the upper left, each on its own tab or base:
`treeman` (faces right), `citizen` (red, faces right), `citizen_woman` (teal, faces right), `guard`
(not used in this section), `tower_plate` and `tower_plate_dark` (registered pair, the plate is part of
the piece), `tower_glass` / `tower_glass_dark`, `tower_bottle` / `tower_bottle_dark`, `basket`,
`saltpepper` (two shakers in one image: split at the gap), `candle` (flame included), `redwood`,
`sapling`, `fence_trio` (knife, fork, spoon in one image: split into three), `plate_disc` (top-down, lies
flat), `fg_glass` and `fg_fork` (real tableware for the soft foreground), `hand_open` (not this section).
RGB, full bleed: `cloth` (top-down linen, tile or stretch it over the table), `room` (the restaurant
beyond: blur it heavily and dim it).

See them at a glance: `work/plates/_sheet1.jpg`, `_sheet2.jpg`. Trim each to its alpha box when you load
it. Never repaint or overwrite a plate; if a piece is missing or wrong, say so in your report.

## Rules

1. **A painted piece is never relit.** Use an unlit material and multiply by one warm-to-cool tint that
   falls off with distance from the candle (bright and warm within 25 cm, about 55 % and cooler at the
   table's far edge), so the light arc still works. The windows' glow is in the paint.
2. **Shadows are real.** Each card casts onto the cloth from the candle (alpha-tested depth material, so
   the shadow is the piece's silhouette, soft-edged). The cloth is the painted `cloth` texture and is
   the only lit, shadow-receiving surface. No stepped or acne shadows: check a 1:1 crop.
3. **Volumes turn to the lens, flats do not.** Towers, bottle, glasses, basket, shakers, candle, redwood
   and sapling are painted as solid objects: their cards turn about the vertical axis to face the camera
   (a cylindrical billboard), so they never go edge-on. Standees (tree man, citizens) and the cutlery
   fence are flat card: they keep a fixed orientation in the world, and you see their edge when the
   camera crosses their plane. That contrast is the look; plan the camera so a standee that is the
   subject is seen within 50 degrees of side-on.
4. **Nobody walks with legs.** A standee slides along a slot cut in the cloth (draw the slot: a thin dark
   line with a paler cut edge, along the whole path), rocking 2 to 3 degrees about its base and hopping
   a millimetre, sampled on twos. A stop is the rock settling. A turn is the card turning about its
   vertical axis, edge-on for two frames; the back shows the same figure mirrored. Remove the leg rig,
   the lean and the hitch: on "84" he stops and settles, on "backpack" one small hop, on "where" the turn.
5. **Things arrive as pop-ups.** Before "New York" the table is a paper place setting: `plate_disc` lying
   flat at each setting, the glasses and bottle standing with their dark-window plates, basket and
   shakers standing, cutlery cards lying flat beside the plates. On "New York": the windows come on
   bottom to top (wipe from the dark plate to the lit one), and each plate's tower springs up out of
   its disc (scale from the base with overshoot, damping 0.55 to 0.7; the disc stays). On the second
   "New York" the cutlery slides out along the table edge and hinges up about its base into the fence.
   The sapling springs a tier, then the redwood card hinges up behind it and the sapling folds down.
6. **Depth and lens.** `fg_glass` and `fg_fork` sit close to the lens in the first leg, pre-blurred
   (about 8 px at 720 wide) and darker; the `room` backdrop is a wide curved card far behind the table,
   pre-blurred about 14 px and dimmed to 35 %. Mid-ground stays sharp. Add a soft additive glow on the
   flame and a faint one on lit windows, a vignette, and a warm grade that matches the target stills.
   No lens flares, no heavy bloom.
7. **Sizes (cm):** tree man and citizens 4; candle 12; salt and pepper 9; basket 10 high; plate tower 14
   high on a 24 wide plate; glass tower 18; bottle tower 30; fence cutlery 16 to 20; redwood 45;
   sapling 7 in its pot. Citizens: red, teal, and two more made by tinting those plates (navy, ochre).
8. Camera path, cue frames and the audio stay as in test 02. Fix from your own defect list where the
   skin makes it cheap: f1996 to f2018 (keep him in frame while the redwood rises), figure size when
   they are the subject (at least 90 px). Keep the exported names stable and re-export `blocking.json`.

## Deliver

- `out/paper-world/andre_paper-world-test03_f1800-f2544_24fps_720x1280.mp4` (test 02's file stays),
  voice muxed, 744 frames, badframes and flashcheck passing.
- `out/paper-world/check03/`: full-size stills at every beat frame, `sheet.jpg`, and two comparisons:
  your f2543 wide beside `target-table-city_v1.png`, and your best street-level frame beside it too.
- README and NOTES updated (what changed from test 02, BANNED additions, defects with frames, and what a
  Seedance pass would need from these frames).
- `out/paper-world/frames` and `wip` stay out of git (they are under `out/`, already ignored). No git
  commands. Do not touch `js/cast/`, `lineup.html`, `paint.sh`, `plates.json` or `work/plates/`.

Report under 300 words: the review file, what you changed, BANNED additions, defects with frames, and
your honest answer to the test in bold above for the wide and for the street frame.
