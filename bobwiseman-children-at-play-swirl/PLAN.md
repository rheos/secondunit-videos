# Children at Play, verse 1, painted swirl: plan

Look test of Bob Wiseman's "Children at Play", song 0 to 39 s, in the painted-swirl look (`looks/painted-swirl.yaml`,
first used on the In Her Dream test). 16:9 master at 1920x1080, 24 fps. Shared brief: `work/BRIEF.md` (gitignored).
Internal test; nothing has gone to Bob.

## Phase 1 (done)

Stills only, in `out/p1/` (gitignored):

- `lineup.png`: the three dabs at 3x and 1:1 with labels, and the set at 36.5 s with the people taken out, labelled.
  Dotted rings mark where the lovers' two dabs sit.
- `key-08s.png` (frame 192): the mother just off the porch, the house lit behind her, the sky round the barn roof
  still warm and turning from the first laugh.
- `key-27s.png` (frame 658): she has stopped in the yard and leans toward the barn on the laugh; the paint round her
  streams toward the hay door, and the swirl round the door is at its first peak.
- `key-36s.png` (frame 864): she stands below the barn in a cool pocket of paint; above her, in the hay door, the two
  dabs sit close together and the warmth swirls over the whole right of the frame.

## The picture

One flat row on a flat horizon (y 770), all plain silhouettes: rail fence at the field's edge, house with a porch,
washing line, a swing on an A-frame, a gambrel barn. No hills, no spire, no tree, so nothing borrows the Starry Night
composition. About 3,000 brush dashes cover sky and yard, redrawn 8 times a second. Each takes its angle from the
designed field and its colour from heat across the look's nine paints; dashes thicken as they warm.

The field, per dash:

- Sky: the In Her Dream sky rivers, plus a dusk band over the horizon that cools from 0.44 to 0.24 over the verse.
- Yard: long grass rows running along the ground, kept cool so the mother's dab always reads.
- Hay door: a swirl and a heat bloom whose strength and reach follow `laugh(t)`. This is the laughter. It never leaves
  the barn; it only grows, drifts and pulses.
- Porch lamp: a small swirl once she switches it on.
- The mother: a small counter-eddy round her, and a cool pocket so the warmth is never hers. From the laugh at 26.98 s
  until she sets off at 33.39 s, the paint within about 250 px of her streams toward the hay door (her look).
- Fireflies: a gentle curl round each. They are the lights that arrive on sung words, coming in from off frame.

The cast is one dab each, radius 24, dark edge, all the same adult size: the mother lavender `#C4B2FF`, the daughter
("you") gold `#FFC531`, her lover ("me") rose `#FF6F9C`. The lovers only ever appear as two dabs overlapping slightly,
low and to one side in the hay, at two heights so the pair never reads as a pair of eyes. They sway a few pixels with
the laughter. Nothing else is ever shown.

## Beats (song seconds)

| Time | Picture |
| --- | --- |
| 0 to 0.6 | Fade up from night on the farm, end of a summer day: dusk band warm over the horizon, house dark. |
| 1.50 | First laugh: the hay door lights, the sky round the barn warms and swirls (rises over 0.5 s, holds 2 s, falls over 2.6 s). |
| 7.34 | The mother: the house door glows, the porch lamp and windows come on, her dab comes out of the door. |
| 8.3 to 9.9 | The porch. Laughter stays in the air round the barn (drift level 0.4). |
| 11.4 to 13.6 | The field's edge, far left. |
| 15.6 to 18.2 | The washing line. |
| 19.3 to 22.0 | The swing. Small laughter pulses at 11.2, 14.7, 18.5 and 22.1 s keep it drifting from the barn. |
| 23.6 | She walks back into the middle of the yard. |
| 25.39 | She hears and stands still. |
| 26.98 | The laugh: second big swirl; her dab leans toward the barn and the paint round her streams that way. |
| 33.39 | She sets off; the two dabs fade in inside the hay door over 0.6 s. |
| 35.6 | She stands below the hay door. |
| 35 to 39 | Hold. The laughter swirl rises to its widest and hottest over her; the camera settles in a few percent. |

Fireflies arrive on word onsets at 9.64, 16.34, 17.14, 18.08, 19.21, 24.50, 25.52, 27.35, 34.57 and 37.32 s
(`work/hits.txt`). For phase 2, snap 1.50, 7.34, 25.39, 26.98 and 33.39 to the vocal stem's onsets and check each
on a contact sheet.

## Reused from the kit

- `scene/farm.rb` is adapted from `bobwiseman-swift-noimage/scene/ihd.rb` (copied, not edited): dash grid, sky
  rivers, heat-to-paint buckets written as one path per colour per window, the arrival ring on each light, the
  camera drift, the nebula underpaint and the bloom.
- Renderer: makevoid's `mgraphics` (Swift and Metal, MIT). The release binary built for the In Her Dream test is
  copied to `work/bin/mgraphics` (gitignored). To rebuild it, clone makevoid's motion-graphics-music-video-skill-noimage
  and run `swift build -c release` in `tools/graphics` (2:23 on the Intel Mac).
- Phase 2 sound and VFX finish: copy `bobwiseman-swift-noimage/scene/ihd_finish.rb`, keyed to this scene's events
  (`hay_door`, `mother_out`, `arrive`, `hears`, `turn`, `where`, `lovers`). Quiet shimmers on the arrivals, nothing
  that hits.

## Commands

From this folder, with Homebrew Ruby (`/usr/local/opt/ruby/bin/ruby`):

```bash
nice -n 15 ruby scene/farm.rb --at 8,27.42,36
nice -n 15 work/bin/mgraphics work/scenes/farm-stills.json --out out/p1/k --frames 937 --only 192,658,864
nice -n 15 ruby scene/farm.rb --lineup
nice -n 15 work/bin/mgraphics work/scenes/lineup.json --out out/p1/lineup --frames 937 --only 876
```

`--at` builds paint only for the windows holding those seconds, so a still is the same picture as the full film.
`ruby scene/farm.rb` with no flags writes the full `work/scenes/farm.json`.

## Render time (phase 2, not run)

- Scene JSON: 312 paint windows, about 30 MB, about 30 s of Ruby.
- Picture: 937 frames at 1080p, about 40 s with JOBS=5 at nice 15 (In Her Dream rendered 860 frames in 36 to 39 s).
- Sound and VFX finish about 30 s (VFX with JOBS=1), 720p review encode about 10 s.

Under three minutes of machine time for the whole 39 s, once the Mac is free of other renders.

## Open questions for Robin

- Is lavender right for the mother, and gold for the daughter? The look's rule says the gold dab is "her"; here that
  is the daughter the song speaks to.
- The fireflies carry the "lights on sung words" rule. If they read as clutter, the lights could be the house windows
  coming on one by one instead.
- 16:9 per the brief. Robin's note on the In Her Dream test said this look should probably be 9:16; a tall redraw
  would stack the house over the barn's foot and give the swirl more sky.
