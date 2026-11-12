# Sections 1 to 4 and 8 to 10: one builder each

Robin on the storyboard for these seven sections, Nov 11 2026: "Build as written". On the table
section built this way: "overall, this is great." You build ONE section, named in your prompt, in the
same world, engine and method as sections 5 to 7. Six other builders are building the other six at the
same time, so the file rules below are strict.

Read first, in full: `LOOKS.md` sections 4 to 7, `docs/STORYBOARD.md`, `docs/BRIEF.md` ("Rules that
bind every look"), `docs/BRIEF-test03-skin.md` (the rules of the painted skin), this file (the common
part and your section), then `tests/paper-world/README.md` ("How to build a section") and the built
sections as your model: `js/sections/s06.js`, `s07.js`, `js/skin67.js`. Look at the two target stills in
`out/paper-world/styleboard/` and at your pieces on `tests/paper-world/work/plates/_sheet1.jpg` to
`_sheet4.jpg` at full size. `out/paper-world/check04/sheet.jpg` and `check-s67/sheet.jpg` show the
standard you are matching.

The words are in `_in/cues.json` (segments and words with film frames). This brief names key words
only, with their Whisper frames; snap each to its onset with `tools/onsets.py NN`. Never write the
dialogue into a file that git tracks.

## Files you may write (nothing else, no exceptions)

- `tests/paper-world/js/sections/sNN.js` (cues, events, camera keys: pure functions of the frame)
- `tests/paper-world/js/skins/sNN.js` (your pieces and their `update`)
- `tests/paper-world/tools/cues/sNN.json` (your word list and stills list)
- `tests/paper-world/notes/sNN.md` (your beat table with snapped frames, BANNED additions, defects)
- under `out/paper-world/`: `frames-sNN/`, `check-sNN/`, `wip/sNN_*`, and your review file

If you need a change anywhere else (the engine, a join, a piece, another section), do not make it:
put it in your report. No git commands. Never repaint, never touch `paint.sh`, `plates.json`,
`work/plates/`, `js/cast/`, `README.md`, `NOTES.md`, `story.js`, `skin.js`, `skin67.js`, `lib.js`,
`joins.js`, or another section's files.

## Rules for every section

- **One table, one camera.** Your camera starts on the join at your F0 and ends on the join at your
  F1 (`joinKey`, position, target and velocity), so the film is one move. In between: one continuous
  move, low and close, never slower than 0.05 cm a frame, no snaps, no zoom-only moves, never through
  a card. If a join is in the wrong place for your section, keep to it and say so in your report.
- **Nothing appears or leaves without a mechanism** from the storyboard's grammar: hinge, slot, turn,
  pull-tab, wheel, string, fold. Draw the slot, the strip, the hinge line. Hinges spring with damping
  0.55 to 0.7; a lift on a slot is 12 frames with a settle; pull-tabs ease over 10 to 14 frames.
- **Standees** slide on slots, posed on twos, rocking 2.6 degrees. Nobody walks with legs. A turn is
  the card turning, edge-on for two frames. A standee that is the subject is seen within 50 degrees
  of side-on and stands at least 90 px tall.
- **Painted pieces are never relit**: tint by distance from the candle only. The cloth is the only
  lit surface and the only one that takes shadows. Volumes turn to the lens, flats do not. A solid
  piece the camera sees from high above must be real geometry wrapped in the painted card.
- **Every hit lands on its snapped frame.** Hold at least 36 frames on your section's key image.
- **Clear your own pieces.** Everything you bring leaves by its own mechanism by your F1, or within
  48 frames after it while the next camera is looking elsewhere. Your pieces are pure functions of
  the frame for the whole film, so they can move after your F1; where this brief says a piece of
  yours acts in a later section, you build that too.
- **Other sections' pieces** you may re-pose through the registry inside your own frames (their owner
  resets them on every frame). Outside the frames your section needs them, leave them alone.
- No faces, no text, no period imagery. The film's audio is the clock: 24 fps, half-open ranges.
- Keep your context small: one contact sheet per pass and at most six full-size stills; pipe long
  output through `tail`. Stills are cheap (`FRAMES=... node tools/render.mjs`); the whole-section
  render waits for a machine-wide lock, so run it when the stills are right, not to find out.

## Deliver

- `zsh tools/make-section.sh NN`: the review file
  `out/paper-world/andre_paper-world-sNN-test01_f<F0>-f<F1>_24fps_720x1280.mp4` with the voice,
  badframes and flashcheck passing (if a scan fails only because a frame is meant to be dark, say so
  with the frames).
- `out/paper-world/check-sNN/`: full-size stills at every row's first frame and every cue frame, the
  contact sheet, and your key image at 1:1.
- `notes/sNN.md`.
- Report under 250 words: the review file, the beat table with snapped frames, what you re-posed of
  other sections, what you need changed outside your files, defects with frames, and your honest
  answer for your key image: **would this frame pass for a photograph of a paper model on a
  restaurant table?**

The table (cm; x right, z toward the viewer; `LAY` in `s05.js`): cloth 90 by 130; near plate [0, 44],
far plate [0, -44], radius 11; candle [10.5, -16.5]; bottle [21, -24]; glasses [9, -30.5] and
[12, 30]; salt [-9, -2], pepper [-12.5, 2]; basket [-21, 12]; the sapling's pot [37, -57.5].

---

## Section 1: the table as set, f0 to f196

Pieces: none new. Key words: why 17, why 68, lazy 134, bored 165.

| Frames | What happens | Camera |
|---|---|---|
| f0 to about f17 | Near dark: the far room's soft lights and the table as a dim shape (not pure black). The candle's flame card lies folded down against the wick. On the first word it flips up on its hinge and lights; the light opens across the cloth over 12 frames with one flicker | From the join at f0, high and back, already moving |
| to f134 | The table as set, in paper: two plate discs, cutlery cards lying flat, the glasses, the bottle, salt and pepper, the basket, the sapling in its pot at the far corner. Soft real tableware (`fg_glass`, `fg_fork`) passes close to the lens | A slow push in over the near place setting toward the flame |
| lazy, bored | On "bored" the flame sinks low for 8 frames and comes back | Tilts down from the flame to the near plate, to the join at f196 |

Key image: the lit table from low over the near plate, flame beyond. Light: dark, then one flame.

## Section 2: the bathtub, f196 to f504

Pieces: `bathtub`, `child_tub`, `waves`, `duck`, and section 5's near plate disc (lift it through the
registry, or stand in your own copy of `plate_disc` and hide theirs for your frames).
Key words: spoiled 243, children 255, bathtub 306, playing 338, duck 380, thinking 408, what 440,
do 456.

| Frames | What happens | Camera |
|---|---|---|
| f196 to spoiled | The near plate stirs: a hinge line shows along its far edge | Settles low at the near plate |
| spoiled, children | The plate opens like a lid, hinged at its far edge, to about 75 degrees. On "children" the child cut-out (no face) rises on a slot out of the opening, leaning back | Starts a slow circle round the plate |
| bathtub | The tub (16 cm long, 8 high) hinges up out of the plate in front of the child, so the child reclines in it. The `waves` strip stands between the tub's walls on a rocker and tips slowly | Low, circling a few degrees |
| playing, duck | On "duck" the yellow duck (3 cm) slides out along a slot on the waves and bobs back and forth, 1.2 cm each way, on twos | Pushes in a little |
| what ... do | On "what" the duck stops dead. Hold. | Holds, drifting |
| about f470 to f504 | The duck drops, the tub folds back into the plate, the child sinks on its slot, the lid closes | Rises off the plate toward the join at f504 |

Key image: the child in the tub with the duck, low, the candle beyond. Light: warm, close.

## Section 3: the boredom machine, f504 to f1196

Pieces: `citizen` (one colour for all, tinted grey-ochre so they are identical), `coin`, `tv`.
Zone: the far left quarter of the table, x -40 to -12, z -60 to -20.
Key words: yes 524, bored 565, bored 599, process 670, brainwashing 827, totalitarian 875,
government 888, money 916, dangerous 964, survival 1041, bored 1092, asleep 1106, asleep 1145,
no 1172.

| Frames | What happens | Camera |
|---|---|---|
| f504 to bored | Slots show in the cloth along the far left | Crosses the table from the near plate to the far left, low |
| bored, bored | On the first "bored" a rank of eight identical citizen standees hinges up, dealt left to right two frames apart. On the second, two more ranks behind it (z about -48, -53, -58; x -38 to -15) | Trucks along the front rank, close: they stand at least 90 px |
| process | The wheel rises: the gold `coin` (9 cm radius) lies flat as a turntable and turns; six citizens stand on its rim and ride round. The `tv` (7 cm) hinges up beside it, its screen glowing cold. Each rider passes the screen and comes back to where it started | Comes round to the wheel, a little above it |
| brainwashing | The screen pulses; the riders rock in step; the cold glow reaches the nearest rank | Circles the wheel slowly |
| government, money | On "money" a glint crosses the coin's face | High enough to see the coin's face, then down again |
| asleep, asleep | On the first "asleep" the ranks hinge down flat one after another like dominoes, 1.5 frames apart, rank by rank. On the second the wheel stops, its riders lie down and the screen goes dark. One citizen is left standing: the left end of the front rank, about [-30, -50] | Rises a little for the dominoes, then down to the one left |
| no | It tips over slowly (14 frames, one small bounce) and lies flat | Close on it: the join at f1196 |
| f1196 to f1244 | Your flat cards, the coin and the screen are drawn off under the far edge of the cloth on one pull-strip | (section 4's camera has left) |

Key image: the wheel turning between the ranks with the cold screen. Light: the screen's cold glow
joins the candle, then goes out.

## Section 4: the physicist, f1196 to f1800

Pieces: `room_fold`, `tv`, `newspapers`, `magazines`, `physicist`, `eye`, `citizen` with `robot` on
its back. Zone: left of centre, the room about 20 cm wide and 12 high at [-26, -14], open toward the
near right. Key words: meeting 1219, Swedish 1323, physicist 1333, television 1432, newspapers 1463,
magazines 1495, cut 1538, life 1567, Orwellian 1646, nightmare 1659, everything 1692, robot 1764.

| Frames | What happens | Camera |
|---|---|---|
| f1196 to Swedish | The room hinges up from the cloth: floor first, then the back wall, then the two side walls. The television (screen glowing), the newspapers and the magazines stand flush against its back wall | Leaves the fallen citizen and comes round to the room |
| Swedish, physicist | The physicist (5 cm) slides in along his slot and stops in the middle of the room | Pushes in on the room |
| television, newspapers, magazines | At each word a cut line runs round that thing (8 frames, dashed), and it tips back through the wall and drops away, leaving a hole in its own shape with a pale cut edge | Close, drifting from one to the next |
| cut ... life | He stands in the room with three holes | Holds, drifting |
| Orwellian, nightmare | The flap in the back wall opens. Behind it one large paper eye, lit from behind. Its iris slides to him | Tilts up to the eye |
| everything | The iris slides to the lens. A citizen has come along a slot to just outside the room, about [-14, -10] | Starts down |
| robot | The citizen card turns, edge-on for two frames: its back is the robot | Drops to the robot |
| to f1800 | The flap shuts, the room folds flat and is drawn off the left edge, the robot card turns back and slides away (all out of section 5's first view, which looks from [-4, 6, -2] toward the candle) | Glides to section 5's first key with its velocity |

Key image: the eye through the flap over the physicist. Light: cooler; the eye lit from behind.

## Section 8: the couple at the edge, f3397 to f3840

Pieces: `couple` (4.5 cm, painted facing right; its mirrored back faces left), `far_tables`, `room`.
You start from section 7's last state: the pine at 60 cm, the wall flat, the candle flared, the open
hand on the cloth. Key words: Chiquita 3473, unpleasant 3506, out 3558, Jews 3600, Germany 3611,
30s 3627, out 3657, here 3665, problem 3701, go 3734, whole 3791, world 3796, direction 3832.

| Frames | What happens | Camera |
|---|---|---|
| f3397 to Chiquita | The candle settles. The open hand slides back out over the near edge on its sleeve (section 7's piece: re-pose it) | Down from the wide toward the left side of the city |
| Chiquita | The couple hinge up from the cloth by the near plate tower and start along a new slot toward the left edge | Beside them, low |
| out | They slide faster, over a fallen wall segment and out through the gap | Travels with them |
| Jews, Germany, 30s | No period imagery. Two small figures with suitcases in profile against the lit towers, their shadow long on the cloth. They stand at least 110 px | Close, side-on, level with them: the key image |
| out, here | They reach the edge of the cloth and stop: the slot ends 1.5 cm short of it, in a drawn stop. On "here" one more push against the stop | Slows with them |
| problem, go | They stand at the edge | Rises behind them and looks out past the edge |
| whole, world, direction | Out in the dark, other tables come up one after another, each with its own small walled paper city and its own candle (`far_tables`: the whole plate far off, and cut-out tables from it nearer for parallax, dimmed, lightly blurred). By "direction" all are lit | Lifts past the couple to the join at f3840 |

Later, yours to build: the couple stand at the edge through section 9. On "remind" (about f4390) they
hinge down flat, the last standees to fall. From "erased" (about f4592) they and their slot fade to
blank cloth over 40 frames, and the far tables go dark one by one between "soon" (about f4610) and
"planet" (about f4708).

Key image: the couple in profile at the edge. Light: the room's other candles appear as the camera lifts.

## Section 9: the last burst, f3840 to f4315

Pieces: `burst`, `robot`, and the citizens and guards of sections 5 and 6 (hide theirs and stand your
own robot-backed cards in their places). Key words: 1960s 3968, last 4013, burst 4021, human 4047,
extinguished 4075, beginning 4128, future 4160, robots 4226, walking 4238, feeling 4272,
nothing 4281, thinking 4297, nothing 4302.

| Frames | What happens | Camera |
|---|---|---|
| f3840 to 1960s | (the couple stay at the edge, section 8's) | Turns back from the dark room to the table in one arc |
| 1960s | A card stem telescopes up from the middle of the city to 40 cm | Starts up with it |
| last, burst | On "burst" the honeycomb ball opens: 12 to 16 leaves of the `burst` plate fanning round the stem from shut to a full ball 34 cm across, with overshoot. The brightest colour in the film, never tinted by the candle. Its colour spills on the towers and the cloth | Up with the burst |
| human | It turns slowly, open | Holds on it, drifting: the key image |
| extinguished | The leaves fan shut in 10 frames and the stem drops. The candle gutters to a third. The colour drains to grey-blue over 24 frames (`grade`) | Starts down |
| beginning, future | Slots show; three more ranks of eight hinge up as citizens | Down to slot height |
| robots | Every citizen card turns, edge-on for two frames, to its robot side | At slot height, close |
| walking | The robots slide in step along their slots, rank after rank, all rocking on the same beat | They pass the lens, at least 110 px |
| feeling, nothing, thinking, nothing | On each "nothing" every robot stops dead for 6 frames, all at once, then goes on | To the join at f4315 |

Later, yours to build: on "nobody" (about f4340) the robots hinge down flat, the nearest first, two
frames apart. From "erased" (about f4592) they and their slots fade to blank cloth over 40 frames.

Key image: the burst open over the city. Light: colour for one breath, then grey-blue.

## Section 10: the bare table, f4315 to f4761

Pieces: none new. You fold away everything of the table and of sections 5 to 7 through the registry.
The robots, the couple and the far tables are folded by their own sections (above); you own the
camera, the light and the rest. Key words: nobody 4340, remind 4390, species 4424, human 4457,
feelings 4491, thoughts 4507, history 4539, memory 4552, erased 4592, soon 4610, nobody 4620,
remember 4654, life 4680, existed 4686, planet 4708. The speech ends at f4715; hold to f4761.

| Frames | What happens | Camera |
|---|---|---|
| nobody, remind | (the robots fall, then the couple: sections 9 and 8) | From the join at f4315, starts one slow rise and pull back |
| species, human | The pine folds shut tier by tier from the top and lies down; the redwood hinges down | Rising |
| feelings, thoughts | The windows go dark, top floor first: half the towers on each word. The plate towers telescope down into their plates; the glass towers, the bottle, the shakers and the basket hinge down flat | Rising |
| history, memory | The fence cutlery hinges down. The fallen wall, the bricks, the watchtowers, the head and every flat card lie in the cloth | Rising |
| erased | Every flat shape and every slot fades to blank cream cloth over 40 frames | The widest frame of the film |
| soon ... remember | A bare cloth, two plain plates, the candle | Holds wide, drifting |
| life, existed, planet | On "planet" the flame card hinges down and the light goes out. The far plate is a pale disc in the dark, in a faint cool fill | Still drifting |
| f4715 to f4761 | Hold on the pale disc | Drifting, never still |

Key image: the bare cloth, two plates and the candle from the widest frame, and then the pale disc.
Light: out.
