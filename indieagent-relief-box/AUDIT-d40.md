# Audit of the living loop, draft 40 (2026-10-25)

Mechanical checks, then three cold critics (machine, figures and world, film-level) read the same frames in fresh
contexts; every finding below was checked against 1:1 crops before it was kept. Frames are 0 to 575 at 24 fps,
positions in the 1280x720 frame; everything about the frame's turn repeats 12 s later.

## Mechanical

- Every frame scanned (`badframes.py`): 0 of 577 bad.
- Flash safety (`flashcheck.py`): PASS, worst 0.5 flashes in a second at 5.54 s.
- Seam: frame 0 against frame 576 at 36.4 dB (two ordinary neighbours: 26.4 dB).
- Sound: the cue list regenerated from draft 40 matches the one s25 was mixed from except one chime a frame earlier
  (4.24 -> 4.19 s); a mix regenerated today differs from s25 only in that chime's tail (seconds 4-7 and 16-19).
  Re-render the sound as s26 with the next draft. An onset-detector check of the muxed file was inconclusive (the
  drone masks the events) and proves nothing either way.
- Before/after against draft 30 at frames 0, 96, 192, 288, 384, 480: the differences are inside the funnel machine
  (the turn in depth) and the fir/mandala timing. No world-side regression.

## Confirmed defects, most serious first

1. **Chorus elves stack through each other** (frames 352-400, 420-462, 498-540; about 5 s of the loop). At 374 a
   harlequin's legs pass down through the pink bowler elf's torso; from 378 it stands on the pink elf's hat for
   about 1.5 s; at 498-540 the bowler elf stands on a harlequin. Reads as a collision. Present since draft 30.
   Fix: the jump target picker (`src/loop.js`, the chorus) must never land on a plate that is already taken, or
   make the stack deliberate (the lower elf raises both hands to the upper one's feet).
2. **The frame's top runs into the sun at edge-on** (frames 138-152 and 426-440). The far side rises about 48 px
   with the depth shear, so the column's rounded top ends inside the sun's pink hub; frame-up it clears by 55 px.
   Fix: cap the far-side rise (a smaller shear above the rim), or lower the top bar 25-30 px.
3. **Two hose ends merge into one lumpy knob** for about 1 s after edge-on (frames 156-180, 444-468): the far hose
   end sits half behind the near one, its dark opening floating above the near lip, and the glob's parent is
   unreadable. The one moment the ends read as a two-nozzle fitting. Fix: hide the far hose end while more than
   about 60 % of it is covered, or widen the spouts (56 -> 80 px either side) and re-check the elbows.
4. **A bulge crossing an elbow draws a dented silhouette** (frame 120 at the fork corner, 168 and 108 at the far
   bottom corner): the stacked constant-width windows meet the fillet at different angles. Fix: taper the bulge to
   zero within one fillet radius of a corner, or draw it as one variable-width tube as `drawHoseEnd` does.
5. **Orange outside the pipe and funnel** (Robin's rule): the lollipop trees (`#f6b27e` hardcoded in the world),
   the cones beside the piston pedestals, a console button, the sun's centre boss. Fix: recolour to butter, pink
   or mint.
6. **Soft glow on the cube the ring instrument lets go** (frame 192, x 230, y 500): the only soft-edged thing in a
   crisp world. Fix: a hard highlight facet instead of a blur.
7. **Murky teal scrolls in the bottom corners** (x 0-120 and mirror, y 660-720), low contrast behind the pale
   spikes. Fix: lighten to the fir teal or cut.
8. **Edge-on bottom reads as a closed test tube** (frames 136-152): the near bottom corner seen end-on is a round
   cap 130 px below the collar with no elbow. Fix: at |cos th| < 0.2 draw a small end-on ellipse in the pipe's
   shade colour at the near corners.

## Reported, not confirmed at full size (check before fixing)

- A 1-3 px ragged double edge on the edge-on column where the thinner far pipe peeks past the near one, and 1 px
  pink collar dots either side at frame 144. Cheap guard if real: skip the back pipe's upright and top run while
  |cos th| < 0.1 (fully hidden anyway).
- The island singer's solid jumping from beside the hat to the chest (frames 140-146) and rising in front of the
  face on release (182-188); the terrace singer's arms reaching up before the solid rises (108-112).
- Dead figures: the tuner never shifts weight or looks at the ring; the operator's body is fixed; the terrace singer
  stands arms-down for a second at 126-150 and 414-438.

## Judgments for Robin (direction, not defects)

- **The big tesseracts read as glass**, pale translucent faces with the inner cube and honeycomb showing through,
  against "solid-sided" (draft 28) and "never holographic". If solid means opaque clay on the three outward faces,
  that is a change; if the tint was the intent, leave it.
- **The 12 s repeat shows**: frame 0 and frame 288 are the same picture (the picture cycle is 12 s, shown twice
  under the 24 s sound), and the 24 tiles of the overview share one exposure, so there is no light arc or climax.
  Proposal if wanted: give three systems a 24 s period (a light breath of dome and sun, brightest at the first
  edge-on and dimmest at the second; a different offered solid per half; a 24 s chorus path).
- **Palette**: the film critic reads the pale single-value band (pink dome, cream cells, lilac figures, pastel
  mounds, lollipop trees, bell-cap jesters) as candy land or nursery rather than a living machine; only the Mark
  screen has weight. Proposal: two anchor darks (the funnel's throat shadow, the console cabinets in deep slate),
  floor mounds two steps darker than the dome, figures in saturated clay. This is a look change and Robin's call.
- **The camera breath is inverted parallax**: the sun, dome, tesseracts and funnel shrink by 15-30 % while every
  figure and console stays fixed, so it reads as the back wall breathing rather than a camera. Fine if that is the
  dome breathing; otherwise scale the ground layer a little too.

## Protect

The frame-up drawing of the pipes (equal rings, round elbows, clean Y fork); the sloping top and bottom bars at
mid-turn with the stem landing on the slanted bar (this is what sells the turn, frames 72 and 108); the far pipe
passing behind the funnel's facet; the mouth's pixel swirl with the collar over the drips and every landing inside
the portal; the hose ends continuous with the last ring; the facets lit from one place while the hexagon turns;
the exact mirror symmetry (a frame against its own flip differs only in the chorus and the funnel centre); the
singer cycle (mouth, glyphs, sigil, solid, burst, offer, release); the head pops; the consoles with sine screens
and sliders; the gyroscope rings; the firs with chevron stars; the accordion pendants; the clean seam.
