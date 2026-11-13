# Camera pass: hold, then cut (proposal, Nov 13 2026; not built)

Mark Achbar's note on cut 03, paraphrased: it feels a bit like a video game; the shot does not have to
be continuous; being able to fly everywhere is not a reason to; choose angles for an effect; where it
gets jittery, calmer movement would work better. Robin, Nov 13: "There are a number of places where
the camera could linger longer to take in an effect and then cut to the new place instead of
traveling there. Also, places where the camera moves too quickly and should be slowed down a bit.
And maybe those are the places that should just be cut out... but we'll see." And: "There are also
places where the camera passes through solid objects, like the fork... the fork is sitting oddly on
the table... When we zoom in on it, it's kind of just hovering in space."

The one unbroken flying camera was our rule (the storyboard's "one continuous move"), not Robin's.
This pass replaces it. Nothing that happens on the table changes, and no cue frame moves: only where
the lens is.

## What the measurements say (cut 05)

`check-film/cut05/camera-speed.txt` (speed and turn every 12 frames) and `camera-near.txt` (every
frame where the lens is within 3 cm of a piece; `NEAR=3` on `render.mjs`).

- Almost every fast stretch is travel from one subject to the next, not a move on a subject. So the
  two notes have one answer: where the camera now travels, cut.
- Share of each section spent fast (over 1.2 cm a frame or 0.9 degrees a frame): table as set 0 %,
  bathtub 0 %, boredom machine 28 %, physicist 8 %, table city 39 %, camp 24 %, seed 17 %, couple
  36 %, burst 15 %, bare table 3 %.
- The fastest: 1:43 (5.0 cm a frame, up to the high wide), 1:58 (4.9, wall to head), 1:46 (4.4, high
  wide down to the wall), 2:19 (2.9, craning with the pine), 1:36 (2.4, down to the fence), 0:21
  (2.1, bathtub to the ranks). The hardest turns: 1:23 and 1:28 to 1:32 (3.5 degrees a frame, swinging
  round the tree man), 2:24 to 2:27 (3.0, down to the couple), 0:27 (2.4, round to the wheel).
- The lens grazes or passes through: the floating fork at 1:19; fence cutlery at 1:37, 2:24 to 2:28
  (four pieces in a row), 2:37 and 2:44 to 2:45; the salt and pepper at 0:54; the basket at 1:13; the
  coin at 0:47; the near plate tower at 2:59.

## The fork

`fg_fork` and `fg_glass` are blurred photographs of real tableware standing in the air near the lens
as depth dressing (our idea, test 03). In a paper world a photographed metal fork with its tines in
the air reads as a fork hovering, and at 1:19 the lens goes through it. Remove both, here and the
copies section 1 made. The plain paper wine glasses now give the near foreground honestly. If a shot
wants something close to the lens, it is a paper piece that stands or lies on the cloth.

## Rules for the pass

1. A shot holds on one subject from one chosen angle. It may drift, push in or track with a moving
   figure, slowly: under 0.35 cm a frame and under 0.3 degrees a frame, never still.
2. To go somewhere else, cut. Hard cuts, on a word or on the frame an event starts, never mid-event.
3. An effect gets its hold: the lens is already there and settled 12 frames before it starts and
   stays at least 36 frames after it lands.
4. The lens stays 6 cm or more from every piece and never passes between two fence posts.
5. No shot shows a piece arriving or leaving by a route it was only allowed because the old camera
   was elsewhere: check every new angle for pop-ins.
6. Two moves stay as moves, because the move is the meaning: the opening push to the flame, and the
   last slow rise from the table to the widest frame.

## Proposed shots (frames are film frames; times in the film)

| Time | Cut on | Shot |
|---|---|---|
| 0:00 | start | The opening push over the near plate to the flame (kept) |
| 0:08 | "spoiled" lead-in | The near plate, low: lid, child, tub, duck. One slow arc (kept, as it is) |
| 0:21 | "Okay, yes" | Ranks along the far left, low and close; they hinge up on "bored", "bored". Slow truck |
| 0:28 | "process" | The wheel, a little above: coin, riders, screen. Hold through "brainwashing" |
| 0:35 | seal fades in | Higher on the coin's face: the seal, the glint on "money". Hold to 0:40 |
| 0:40 | "dangerous" | The ranks, wide enough for all three. Hold: the dominoes on "asleep" |
| 0:48 | second "asleep" | Close on the last one standing; it tips on "no" |
| 0:50 | "See, I keep meeting" | The room rising; the physicist slides in. One slow push |
| 0:59 | "television" | The back wall, close: the three things are cut out and tip away. Hold |
| 1:04 | "cut them out" | The room with its three holes and him in it |
| 1:08 | "Orwellian" | The flap and the eye. Hold while the iris moves |
| 1:13 | "robot" | The citizen card turning to the robot, close |
| 1:15 | "And when I was at Findhorn" | Low and wide across the table; the tree man comes in by the sapling (no fork) |
| 1:20 | "trees" | The sapling springs |
| 1:23 | "redwoods" | From low, looking up: the redwood shoots up. Hold |
| 1:24 | "84" | Him at the bottle, side-on; tracks slowly with him to the candle |
| 1:31 | "where are you from" | Him and the near setting |
| 1:32 | "New York" | The whole table from a raised three-quarter angle, already settled: towers, buildings, the Twin Towers, windows, fence. Hold to 1:36. This is the effect that is now lost in a swing |
| 1:36 | "Do you know" | Street level at the fence; citizens stop and turn back |
| 1:40 | "why" | Outside the fence with the tree man, looking back in |
| 1:43 | "theories" | The high wide: the walled, lit city. Hold |
| 1:46 | "I think that New York" | Low outside the wall; bricks arrive, the wall rises on "camp" |
| 1:54 | "guards" | The row at the wall, close: the cards turn |
| 1:55 | "pride" | The hero angle: guards rise into the battlements. Hold to 1:58 |
| 1:58 | "And so they exist" | The head, at its eye height. Slow arc as the layers part |
| 2:04 | "no longer have" | Higher, into the crown: the brain, the cut, the lobe falls. Hold |
| 2:09 | "see" | The eyes: the brick band slides across. Hold |
| 2:12 | "And then he went" | Over the palm: pinch hand, seed, tiny pine. Slow push in |
| 2:19 | "escape" | Low and wide: the pine opens to full height, the wall falls. Hold |
| 2:21 | "See, actually" | Wide and still: the hand slides out |
| 2:24 | "Chiquita" | Beside the couple, side-on; tracks with them at their own speed |
| 2:32 | second "out" | The edge of the cloth: they stop; one more push on "here" |
| 2:34 | "problem" | Behind them, looking out; the other tables light. Hold |
| 2:40 | "See, I think" | The table, three-quarter: the stem rises on "1960s" |
| 2:47 | "burst" | From below, looking up: the ball opens. Hold |
| 2:50 | "extinguished" | Wider: it comes apart, the flakes fall, the colour drains. Hold to 2:53 |
| 2:53 | "beginning" | Slot height: ranks hinge up, turn to robots on "robots", march past |
| 2:59 | "there'll be nobody" | The robots fall. Then the last slow rise to the widest frame (kept) |

About 38 shots, one every 5 seconds on average; the reference film Robin pointed to cuts every 5 to
6 seconds.

## How it gets built

- Engine: a section's camera becomes a list of shots, each with its own keys; a cut is declared, so
  the speed check counts it as a cut and still fails on an undeclared jump. `NEAR` joins the checks.
- One builder per two or three sections, camera files only, with the before-and-after proof that no
  piece and no cue moved. Then one whole-film render.
