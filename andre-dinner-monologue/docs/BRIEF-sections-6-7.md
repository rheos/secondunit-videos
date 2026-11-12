# Sections 6 and 7: the camp and the seed, f2544 to f3397 (106.0 to 141.5 s)

Read first, in full: `LOOKS.md` sections 4 to 7 (Robin's notes, the reference, the method, the test 03
verdict), `docs/STORYBOARD.md` (the grammar table, sections 5 to 7), `docs/BRIEF.md` ("Paths" and "Rules
that bind every look"), `docs/BRIEF-test03-skin.md` (the rules of the painted skin), then
`tests/paper-world/README.md` and `NOTES.md` and the code (`js/skin.js`, `js/story.js`, `js/main.js`,
`js/table.js`, `tools/`). Look at `out/paper-world/styleboard/target-camp-wall_v1.png` at full size: that
frame is the hero of section 6. Look at the pieces: `tests/paper-world/work/plates/_sheet1.jpg`,
`_sheet2.jpg`, `_sheet3.jpg`.

Robin on the table section built this way (test 03): "overall, this is great." These two sections
continue the same world, the same engine and the same camera without a cut. They carry the film's two
key images: the prison built by its inmates, who are also its guards, and the seed in the hand.

## Job 1: make the engine take more than one section (small, no change to section 5's picture)

Today `js/story.js` is section 5 and the film range is fixed at f1800 to f2544. Change only what is
needed so that:

- a section is a module (`js/sections/s05.js`, `s06.js`, `s07.js`) that owns its cue names, its events
  and its camera keys, each a pure function of the film frame;
- the world's state at any frame is a pure function of that frame: at f2600 the city of section 5 is
  standing as it stood at f2544 (towers up, windows lit, fence up, citizens home, tree man and redwood
  outside), with no dependence on having drawn earlier frames;
- `window.renderFrame(f)` works for any f in f1800 to f3397, `tools/render.mjs` and the make script take
  a frame range, and the camera is continuous across f2544 (position and direction match to the frame);
- section 5 still renders the same: render f1800, f2215, f2300, f2400, f2543 before and after your
  refactor and compare (mean absolute difference under 1 of 255 per channel); put the comparison in
  `out/paper-world/check-s67/regress/`.

Keep the folder (`tests/paper-world/`), the units (cm, y up), the names in `blocking.json`, and the skin
rules: painted pieces are never relit (tint by distance from the candle only), the cloth is the only
lit, shadow-receiving surface, volumes turn to the lens, flats do not, nobody walks with legs.

The plate towers are real tiered drums as of test 04 (`README.md` says how). Leave them as they are.

## Job 2: section 6, the camp, f2544 to f3130

Pieces (in `work/plates/`, read only): `brick`, `wall_segment`, `watchtower`, `guard`, `head_bare`,
`head_capped` (a registered edit of `head_bare`: same head, cap added), plus section 5's cast.
Cue frames snapped in test 01 (re-snap with `tools/onsets.py`; extend it for these words): camp f2636,
guards f2737, pride f2761, prison (1st) f2828, schizophrenia f2897, result f2963, lobotomized f3007,
see f3107, prison (2nd) f3128.

| Frames | Words | What happens | Camera |
|---|---|---|---|
| f2544-f2636 | "I think that New York is the new model for the new concentration camp" | Citizens come out again on their slots, each pushing one `brick` card ahead of it, toward the cutlery fence | From the high wide, down and round to just outside the near fence, low, looking in |
| f2636-f2737 | "camp ... built by the inmates themselves" | On "camp" the first `wall_segment` hinges up in front of the cutlery; the rest follow round the table edge like a deal, each as a citizen's brick arrives; a `watchtower` hinges up at the two near corners, its lamp coming on | Trucks along the near wall as it goes up |
| f2737-f2761 | "and the inmates are the guards" | Each citizen at the wall turns as a card (edge-on two frames): the back of the card is the `guard` plate, facing the same way | Holds low, drifting |
| f2761-f2830 | "and they have this pride in this thing they've built" | The guards rise on their slots to stand in a row on top of the wall, settle with one small rock, chests out; citizens without caps still carry bricks at the wall's foot. Compose this like the target still: guards on the wall against the lit towers, bricklayers below, low angle | Rises a little and tilts up to them; this is the hero frame of the section |
| f2830-f2897 | "They've built their own prison. And so they exist in a state of" | The camera leaves the wall and crosses to the middle of the table. A large head, about 34 cm tall, hinges up from the cloth beside the candle: `head_capped` in front, `head_bare` directly behind it, 3 mm apart | Pulls back and up over the wall, then settles at the head's eye height |
| f2897-f2963 | "schizophrenia, where they are both guards and prisoners, and as a" | On "schizophrenia" a pull-tab (draw the strip and its slot in the cloth) slides the two layers apart sideways by 7 cm, capped one way, bare the other; two small nudges (about f2911, f2930); they slide back together on "result" | A slow arc of about 20 degrees so the two layers part in depth |
| f2963-f3107 | "result, they no longer have, having been lobotomized, the capacity to leave the prison they've made" | On "lobotomized" the crown of the bare head lifts like a lid on a hinge at the back (cut the crown from `head_bare` with a mask along the hat band's line; the capped layer's cap lifts with it), showing a plain dark hollow | Rises to look into the open crown, then comes back down to the eyes |
| f3107-f3130 | "or to even see it as a prison" | A band of bricks (a `wall_segment` strip) slides across the head at eye height on its own pull-tab and stops on "prison" | Holds on the head, pushing in very slowly |

Light: the wall's shadow from the candle grows across the cloth as it goes up; by "prison" this is the
darkest stretch of the film (drop the room fill and the cloth's bounce by a third across the section).

## Job 3: section 7, the seed, f3130 to f3397

Pieces: `hand_open` (palm up, with cuff and sleeve; the painted seed in its palm must not show before
the seed lands: paint it out by covering it with palm colour sampled beside it, in code, on a copy),
`hand_pinch` (reaches down from above, sleeve at the top), `seed`, `pine_tall`.
Cue frames from test 01: pocket about f3150, seed f3212, pine tree f3260, hand about f3290, escape f3331,
before f3346, late about f3372.

| Frames | Words | What happens | Camera |
|---|---|---|---|
| f3130-f3212 | "And then he went into his pocket, and he took out a seed for a tree" | The open hand slides in from the near edge of the table on its sleeve, lying flat on the cloth, palm up, about 30 cm from wrist to fingertip. The pinch hand comes down from above the frame as a standing card, holding the `seed` | Drops from the head to the near edge and settles over the palm, looking down about 50 degrees |
| f3212-f3260 | "seed ... and he said, this is a" | On "seed" the pinch opens and the seed falls 5 cm, turning on its wing, and lands in the palm with a tiny bounce. The pinch hand lifts away. The fingers fold up round the seed: cut the four fingers and the thumb from the painted hand along their knuckle lines and hinge each up 25 to 35 degrees | Pushes in on the palm |
| f3260-f3331 | "pine tree. He put it in my hand, and he said," | On "pine tree" a tiny pine (the `pine_tall` plate, 3 cm) springs up from the seed | Holds close, drifting |
| f3331-f3397 | "escape before it's too late" | On "escape" the pine opens out to 60 cm, tier by tier from the bottom with overshoot, taller than every tower. The wall segments fall flat outward one after another round the table, away from the pine. The candle flares: the brightest frame of the film. Hold to f3397 with the pine standing over the open city | Cranes up and back with the pine so its top stays in the tall frame |

## Numbers and rules

- Standees on slots, on twos, 2.6 degrees of rock; a lift on a slot is 12 frames with a settle; hinges
  use a spring with damping 0.55 to 0.7; pull-tabs ease in and out over 10 to 14 frames and show their
  strip. Nothing appears without a mechanism.
- Camera: one continuous move, never slower than 0.05 cm a frame, no snaps, no zoom-only moves, never
  through a card. A standee that is the subject is seen within 50 degrees of side-on and is at least
  90 px tall; the guards on the wall are at least 110 px tall in the hero frame.
- Every hit lands on its snapped frame. Hold at least 36 frames on the brick band over the eyes and on
  the full pine.
- No faces, no text. The guards' caps are the painted peaked caps; never redraw them.
- If a piece is missing or wrong, do not repaint it and do not touch `paint.sh`, `plates.json`,
  `work/plates/` or `js/cast/`. Say so in the report.

## Deliver

- `out/paper-world/andre_paper-world-s06-s07-test01_f2544-f3397_24fps_720x1280.mp4`, voice muxed from
  `_in/andre.wav` cut to [106.0, 141.5417), 853 frames, badframes and flashcheck passing.
- `out/paper-world/check-s67/`: full-size stills at every row's first frame and at every cue frame, a
  contact sheet, the hero frame (guards on the wall) beside `target-camp-wall_v1.png`, the open hand
  with the seed at 1:1, and the regression comparison from Job 1.
- `README.md` and `NOTES.md` updated: how sections are added, the beat table with snapped frames, BANNED
  additions, defects with frames. No git commands.

Report under 300 words: the review file, the beat table, what you changed in the engine, anything in
section 5 that no longer matches, BANNED additions, defects with frames.
