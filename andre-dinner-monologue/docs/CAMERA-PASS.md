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

## Robin's answer to the proposal (Nov 13): cutting is not the default

"I do definitely like some of the times that the camera zooms out and comes down. Like, I especially
like the part just before it talks about the new concentration camp, how it zooms out and then comes
down on the prison guards... I don't want to cut to that. That one is definitely a good one that
zooms out and then zooms in on the new location."

That move is 1:43 to 1:50 (f2466 to f2634): up from the fence to 144 cm in two seconds, a hold on
the lit city, then down to the wall in three and a half. It is the fastest move in the film and it
stays exactly as it is. It passes within 3 cm of nothing. So speed alone is not the fault, and the
table of shots below is wrong wherever it cuts a move of this kind without his say.

The travels sort into two kinds by the height the lens covers:

- Pull-outs and come-downs. The lens leaves a place by rising or arrives by descending: 0:21 (bathtub
  down to the ranks), 1:28 to 1:35 (up over the table as New York rises), 1:36 (down to the fence),
  1:43 to 1:50 (kept), 1:58 (up and over from the wall to the head, peaking at 62 cm), 2:12 (up over
  the palm), 2:22 to 2:25 (down from the pine to the couple), 3:01 (the last rise, kept). Each of
  these is Robin's call, one by one.
- Swings at table height. The lens stays under about 10 cm and turns hard to face the next thing:
  0:27 (round to the wheel), 0:50 (into the room), 1:14 to 1:26 (round the tree man, 3.5 degrees a
  frame), 2:26 to 2:31 (round the couple, 3.0, through the fence), 2:41 (in the dark room). These are
  the video-game moves and hold every fence graze. They are the ones to cut.

## Decided with Robin (Nov 13): what cut 06 does

His picks from the list of pull-outs and come-downs, and one line on the rest. On the 1:46 dive he
added: "I like when it dives from the high wide to the wall... but maybe we could slow it down if it
seems too fast. I wouldn't want that to be a cut."

| Time | Cut 06 |
|---|---|
| 0:00 to 0:21 | As it is (the opening push, the bathtub arc). The floating glass and fork are gone |
| 0:21 | CUT on "Okay, yes" (f504) to the ranks. He did not keep the swoop down from the bathtub |
| 0:27 | CUT to the wheel (was a swing) |
| 0:35 to 0:40 | The small lift onto the coin's face and back stays a move, eased |
| 0:50 | CUT (f1196) to the room (was a swing) |
| 1:15 to 1:31 | CUTS in place of the swings round the tree man: f1800, "trees", "redwoods", "84", "where are you from" |
| 1:31 to 1:36 | KEPT: the climb over the table as New York rises. The cut at 1:31 lands on the climb after its whip turn |
| 1:36 | KEPT: down to the fence, moved clear of the fence fork it grazed |
| 1:43 to 1:50 | KEPT: up to the high wide and down on the wall. The dive may take a little longer if the cues allow, never a cut |
| 1:58 | KEPT: up and over from the wall to the head |
| 2:12 | KEPT: up over the palm |
| 2:19 | CUT on "escape" to where the sideways move at 50 cm ends (ours: this one was not on his list; fast and sideways, not a pull-out) |
| 2:22 to 2:25 | KEPT: down from the pine to the couple, landing clear of the fence |
| 2:26 to 2:34 | CUTS in place of the swings round the couple: side-on with them, the edge, behind them |
| 2:40 | CUT (f3840) in place of the turn in the dark room |
| 2:59 on | KEPT: the last rise, clear of the near plate tower |

Stretches that were already slow in cut 05 are left alone: the first proposal's extra shots (guards
close, crown, eyes and so on) are not built. The table of about 38 shots below is that first
proposal, kept for the record; where it differs from this table, this table wins.

Engine: `shots()` in `js/sections/lib.js`; a section exports `CUTS`; `SPEED` on `render.mjs` lists
the declared cuts, skips them as moves, and flags a declared cut that hardly changes the view. The
three blurred photographs of real tableware (the opening's glass and fork, the fork by the ranks at
0:43, the glass and fork at 1:15) are never drawn.

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
6. Some moves stay as moves: the opening push to the flame, the last slow rise from the table to the
   widest frame, the pull-out and come-down at 1:43 to 1:50, and any other pull-out or come-down Robin
   names. A kept move keeps its speed; rule 4 still applies to it.

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
| 1:43 | no cut (kept move) | Up from the fence to the high wide, the hold on the lit city, then down to the wall as the bricks arrive and it rises on "camp". Exactly as in cut 05 |
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
