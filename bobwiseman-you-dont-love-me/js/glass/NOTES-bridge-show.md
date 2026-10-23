# Stained glass, bridge, draft 7: the morning show, versions A and B (notes)

Bob on draft 6 (2026-10-14): he still did not like the fortune teller, and asked for something more surreal, in
the manner of the old children's morning shows. Two readings of that went to Bob side by side (Robin, 2026-10-14):

- **A** (Robin's reading, `looks/glass-bridge-d7a.html`, `bridge-show-a.js`): draft 6's bridge as it was, the tea
  leaves making every picture, with only the reader recast. The sibyl, her midnight alcove, crystal ball and candle
  become the host on his TV set behind the tea table, with the owl where the ball was and the sleepy teapot where
  the candle was. His hand turns the cup and taps the rim exactly where hers did, he says his piece deadpan, and a
  teabag drops on his head at 139.13 (an instrumental onset in the close-up on his face). Changed frames: 3228-3366.
- **B** (`looks/glass-bridge-d7b.html`, `bridge-show.js`): the bridge's first 22 seconds (118.333-140.24) leave the
  cup for the kids' TV set and the host acts out every line, as below. Changed frames: 2840-3366.

The rest of this file describes B; A reuses B's host, owl, teapot, backdrop and valance. The Pips (140.24-148.42) and the cup tail
that dives into verse 3 are draft 6's, frame for frame. The spirit of those shows is the brief (a gentle host, a
coat with pockets too big, a set where things talk back, puppet sidekicks, things dropping on his head on cue);
none of any show's own characters or names are used.

Files: `js/glass/bridge-show.js` (B, and the cast both versions use), loaded by the local page `looks/glass-bridge-d7b.html`;
`js/glass/bridge-show-a.js` (A) loads after the bridge's main file on `looks/glass-bridge-d7a.html` and replaces the reader's draw functions. The
bridge's main file calls `showFrame(t)` after the Pips' check, only when bridge-show.js is on the page, so draft 6's
page `looks/glass-bridge.html` renders exactly as before.

## Cast

- **The host.** A gentle old man, standing in elevation on the set: long green coat buttoned to the waist, two
  mustard patch pockets far too big for it (they bulge past its sides), round gold spectacles, white tufts over his
  ears, bald top with a shine, rosy cheeks, ruby bow tie. Deadpan: heavy lids, flat mouth, flat brows. Arms are
  two-bone IK to keyed hand targets, the elbow always on the outside.
- **The owl.** A felt hand puppet behind the counter's far end. It pops up, watches the host, and pulls the gold
  cord in the flies before every drop.
- **The teapot.** Blue-and-white china on the counter, asleep with its spectacles on. It wakes with a hop, tips
  over the cup to read the leaves (spectacles slide down), sits back, then turns to the host and talks with its
  lid, steam puffing from the spout.
- **The pillow stone.** The first rock to land. It opens its eyes on the host while he lies on it and yawns.
- **The sun.** A leaded sun with a face on the backdrop. It winces at each bonk and dozes while he lies down.
- **Props.** A rolled sandy runner from his pocket; three rocks; a ruby glass heart on a gold string; a man's felt
  hat with a ruby band (the hat from draft 6's leaves, so the lover still arrives only as his hat).

## Timing (song seconds, the bridge's vocal-stem onsets)

| Time | What happens |
|---|---|
| 118.333-119.8 | verse 2's push carries on into the cup; from 118.55 the tea opens into a round leaded window (lead + gold ring) onto the set, the host held in the middle of it, widening past the frame by 119.8 |
| 119.75-120.75 | his hand goes into his left pocket, pulls out a sand roll, tosses it; it unrolls across the floor toward us, full at 120.75 |
| 121.0-121.5 | he holds up a palm at it, no thanks |
| 121.45-122.5 | the runner rolls itself back up and hops into his pocket in a puff of sand; he pats the pocket twice |
| 123.45-123.88 | the owl pops up behind the counter |
| 124.95, 125.48, 126.31 | the owl pulls the cord (0.42 s before) and a rock drops on his head: squash, eyes shut, a ring of gold stars; each rock bounces into a row on the floor |
| 126.9-127.3 | he tips over stiff as a plank onto the rocks, head on the pillow stone |
| 127.9-129.3 | the pillow stone opens its eyes on him, yawns, shuts them |
| 129.44 | he springs back up (overshoot), mouth open for a moment |
| 130.45-131.2 | the owl lowers a ruby heart on a string in front of him; it swings and settles |
| 131.37 | the heart flushes pink and beats |
| 131.79 | the owl yanks it back up into the flies |
| 132.0 | a felt hat drops onto his head, low over his eyes |
| 133.1-133.5 | he lifts the brim with a finger and looks at us |
| 134.3-135.3 | he glides to the counter without taking a step |
| 134.85 | the teapot wakes with a hop and a lid pop |
| 136.0-136.72 | it tips over the cup and peers into the leaves, then sits back up |
| 137.37-139.25 | it turns to him and talks with its lid; he leans in with a hand to his ear; the owl nods |
| 139.45 | glitter sifts down from the flies; all three look up |
| 139.84-140.24 | the Pips' stage drops in from above over the set (bridge-trio.js, unchanged) |

Camera: a wide of the whole set for the runner and the rocks, in on him lying on the stones, a medium for the heart,
close for the hat, a pan to the counter, close on the teapot over the cup, then a two-shot, easing up toward the
flies before the drop. A small zoom kick on each bonk.

## Finish

As the Pips' stage: glass texture overlay 0.5, warm multiply, a soft spot on the host, bloom 0.3, vignette 0.26,
grain 0.06. No text on screen. No daisy (the bridge sits inside the roundel's absence, as before).
