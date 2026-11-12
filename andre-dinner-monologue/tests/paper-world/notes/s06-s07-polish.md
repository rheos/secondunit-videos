# Sections 6 and 7: the release polish (f2544 to f3397)

Five defects from NOTES.md's list fixed in `js/sections/s06.js`, `js/sections/s07.js` and `js/skin67.js`. No cue
moved. No registered piece or part was renamed, added or removed. The camera's keys at f2544, f3130 and from f3359
on are the ones the film already had.

Review file: `out/paper-world/wip/polish-s67/andre_paper-world-s06-s07-polish_f2544-f3397_24fps_720x1280.mp4`
(853 frames, 35.542 s, voice cut to [106.0, 141.5417), muxed without -shortest). Its frames are in
`out/paper-world/wip/polish-s67/frames/`. Checks: `out/paper-world/check-polish-s67/`.

## What changed, and where to look

| # | Frames | Before | Now |
|---|---|---|---|
| 1 | f2755 to f3130 | Each guard rode a pale slot up the front of the hero wall: figures on poles | The card drops through the cloth slot it stands in (6 frames, guard k from f2755 + 2k, under by "pride"), passes under the table and rises behind the battlements on "pride" (f2761 + 2k, 12 frames and a settle), boots on the floor of a crenel. The five guards stand in the plate's five crenels. Nothing is in front of the bricks. Hero frame f2800, f2823 |
| 2 | f3186 to f3358 | The close-up cropped the thumb: a mitten | The lens stands back 55 to 60 cm, 52 to 62 degrees up, 24 degrees round to the right of the sleeve, so the whole hand (37 cm thumb tip to little finger) is in the frame from f3207 to "escape". The fingers and thumb curl half as far again (40 to 53 degrees) from f3224 until the pine pushes them open. f3221, f3244, f3260, f3304 |
| 3 | f2545 to f2600 | Cards appeared lying flat at the heads of their slots, eight in twelve frames | A card is hidden until its hinge starts, then springs up (damping 0.6, period 14), one card every two frames: f2545 to f2571, then f2577 and f2583 for the two still walking home from section 5 |
| 4 | f2596 to f2636, f2827 to f2886 | The lens trucked low past the right fence's corner; later it went round the right side at 36 cm with the fence across the head | First: it stays high until it is out in front of the chamfer, then comes down along the line it looks along at "camp", so the fence's cutlery grows where it stands behind the citizens and does not sweep across. Second: it climbs to 62 cm round the right side, the fence lies under the head in the frame, it crosses the fence once at the near right 13 cm above the cutlery and comes down inside it |
| 5 | f3007 to f3169 | The open crown showed a flat black card the shape of the skull | No card stands where the crown was: the room shows through the gap. Behind the cut an inner wall of darker card bows back 6.5 cm (a strip fixed at both ends of the cut that bows as the lid lifts), darker toward the bottom, and the three cut edges show the card's pale core. f3037 (looking in), f3128 (eye height) |

## How each is built

- **Guards** (`s06.js GUARD_TOP`, `citizenAt`; `skin67.js` crew update). `citizenAt` gives a guard `sink` (cm
  below the cloth), `wall` (true from "pride"), `wu` (its crenel, cm along the chamfer) and `wy` (height of its
  boots). `lift` is gone. `x`, `z` and `yaw` are unchanged: they are still where the citizen stood at the foot of
  the wall, which is what section 9 reads. On the wall the card is turned parallel to it, 2 mm behind it.
- **The fall** (f3349 to f3357). A guard rides the wall down from where it now stands and is eased, over the first
  three quarters of the fall, to where it lay before. From f3357 its pose is computed by the old lines, untouched.
- **The old slot strips are still there**, hidden while the wall stands and shown from f3357, when the wall's face is
  on the cloth. Their top ends show through the crenels of the fallen wall as two to six pixels in the wides of
  sections 7 to 10. Without them f3396, f3400 and f4500 differ from the delivered frames by those pixels. Delete the
  block (it is marked in `skin67.js`) when sections 8 to 10 are next rendered anyway.
- **The deal** (`s06.js DEAL`). `DEAL[i]` is citizen i's hinge frame. A home citizen leaves ten frames after it, so the
  eight home citizens leave 2 to 26 frames later than before and their bricks reach the fence that much later (f2633
  to f2688; all eight are home again by f2916). Guards and bricklayers keep their slots' timings. A citizen folding away is also hidden on its last, flat
  frame, here and for the four still coming home from section 5 at f2549 to f2577.
- **The hand's camera** (`s07.js whole`, `aim`, `CAM_KEYS`). The float is halved from f3190 to f3338 (0.5 at both
  joins). The crane to the wide starts from the new frame and joins its old line by its 17th key: the camera is
  bit for bit the old one from f3359. The hold's drift is carried into the crane so the lens does not stall at f3323.
- **The pinch hand starts 39 cm up**, not 30, so it still enters from above the wider frame (first seen at f3197).
- **The curl** (`s07.js curlAt`): a factor on the finger hinges in the skin, exactly 1 from f3345. `handAt().fold`
  is unchanged, so section 8's hand is unchanged.
- **The hollow** (`skin67.js HOL`): `rimOf` paints the pale edge from the capped plate's own cut; the wall and its
  rim are two strips whose depth follows how far the lid is open. Hidden when the lid is shut.

## Checks

- `check-polish-s67/regress.txt`: f1800, f2400, f3396, f3400, f3600, f3900, f4250, f4500 as PNG before and after:
  mean 0.0000, largest 0 on all eight. f3396 is byte for byte the same file.
- Camera: f2544, f3129, f3130 and f3359 to f3405 identical to the last bit; f2545 to f3358 changed. Speed over
  f2544 to f3396: min 0.051, max 4.88 cm a frame, no dead stops, no jumps (`camera-speed_f2544-f3397.txt`).
- The hand's outline against the frame, with its fingers and thumb folded as they are at each frame, f3207 to f3331:
  inside 93 % of the half-width on both sides at every frame. (Folded up toward the lens the thumb's tip reaches 3 cm
  further left in the picture than it does flat: the first fit, made on the flat outline, clipped it.) From f3332 the
  crane takes the thumb out of the frame's left edge, as the old crane took the whole hand.
- The review file: badframes 0 of 853; flashcheck passes, worst second 2 flashes at f2837 (the camera leaving the
  wall, as before). `badframes.txt`, `flashcheck.txt`, `sheet.jpg` and 24 full-size stills are in the check folder.

## What a later section could notice

- `S6.citizenAt` for a guard no longer has `lift`; it has `sink`, `wall`, `wu`, `wy`.
- Between f3349 and f3357 the guards' cards are up to 0.6 cm from where they were.
- `S7.pinchAt` starts higher; `S7.camAt` differs from f3131 to f3358; `S7.HANDC` and `S7.curlAt` are new exports.

## Still wrong

- f2636 to f2830: the feet of the fence's cutlery poke through the foot of the wall as small pale tabs (old).
- f2755 to f2769: the guards leave through the floor. It is a mechanism, and they are gone for six frames each.
- f2838 to f2846: on the way up the lens looks through the chamfer's cutlery at the city for eight frames.
- f2856 to f2860: the head is edge-on to the lens as it goes round it (old).
- f3207 to f3330: the right fence runs down the frame's right edge beside the little finger, and the seed and the
  tiny pine are a third the size they were in the close-up (the pine is about 48 px tall).
- f3107 to f3164: from eye height the hollow is a sliver; the bottle's top shows through the gap.
