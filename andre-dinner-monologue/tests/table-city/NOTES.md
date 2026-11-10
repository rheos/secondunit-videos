# table-city: notes

## BANNED

From the brief, kept out from the start: a plain fade (none anywhere; the only scene is the table, which
transforms), flat unlit paper, a face, the musician (never loaded), a cute toy-town palette, text labels, more than
one camera move per shot.

Defaults I reached for in the first renders and took out:

- The engine's one global light direction per plane. The candle is the key light, so every piece is baked with its
  own lit edge toward the flame and its shadow radiates from it.
- Full-length, full-width standee shadows (first render, f1800: the glasses and bottle threw dark blobs the size of
  the plates). Shortened to 0.3 + d/420 of the piece's height, narrowed to 80%, alpha 0.3, fading with distance.
- Pastel peach plate towers that read as a wedding cake. Now masonry peach and umber tiers with dense lit windows.
- A cone-shaped tree (a Christmas tree). The redwood's tiers are now a column with only the top two narrower.
  Still not a redwood; see defects.
- Figures standing on the table before there were towers to come out of. Gated until 30 frames after the rise;
  each starts inside its tower's footprint and walks out of it.
- The candle on the plates' axis: at full tilt the near plate tower hid the key light (first hero still). The
  plates sit at x 40 and the candle at x -70 now, in view between the towers.
- A landscape bloom buffer (480x270) on a portrait frame: vertical streaks on every lit window. Turned portrait.
- A faint cloth shadow at a fixed offset was fine; a drop-in from nowhere for the pack was not: the napkin folds
  twice and the pack springs up from the fold.

## Cue picks

`tools/onsets.py` takes the strongest 40 ms log-energy rise within +-0.25 s of the Whisper cue, then +-0.6 s
(the brief's window picked the neighbouring word for "New York" and "all"). Two hand picks from the envelope:
the second "New York" at f2236 (the snapper's nearest rise, f2231, is "said"), and "leave?" at f2426 (the snapper
took "don't" at f2418). The first "New York" stays at Whisper's f2215: the envelope shows the word at f2214 to
f2222 with a gap before "He said" at f2228.

## Known defects (frame numbers)

1. f2300 to f2544: the two plate towers share the x axis (both plates at x 40) and merge into one tall mass at
   full tilt; the far tower reads as the top of the near one. Offsetting the plates sideways would read as a
   table set wrong from above; the fix is a shorter near tower or a wider table.
2. f2020 on: the tree reads as a pine, not a redwood. Tiered paper reads as conifer whatever the proportions.
3. f2215 to f2300: the tilt is an oblique projection (sin/cos squash about the table's centre), no convergence.
   The far side of the table does not get smaller as the camera comes down, so the cloth stays a rectangle.
4. f2236 to f2284: fence pieces slide in straight lines from the rest cutlery to their slots; pieces headed for
   the far corners pass under the plate towers' bases for a few frames.
5. f2300 to f2544: the figures are 22 px tall at full tilt and 17 px in the wide. Four of them; two are often
   behind a tower. They read as dots that move, which is the point, but the turn at the fence is small.
6. f2270 on: the fence's 34 shadows make a starburst on the cloth under the raking candlelight. Lightened to
   alpha 0.2; still busy at the near corners.
7. Shot 1 and 2: the rows sit at different z from the cloth, so the truck and dolly slide the near pieces up to
   3 px against the cloth. Invisible at a glance; a ground plane would need a real 3D camera.
8. f2466 to f2522: the pull-back is a zoom about the frame's centre, not a camera rising; the table shrinks
   without the view steepening.

## For the full film

A true camera (perspective with a vanishing point) instead of the squash, so the tilt converges and the pull-up
can rise; the towers as lathe shapes with two tones so each reads apart; more figures (a crowd that walks to the
fence and turns, in waves on the words); a paper sound bed (the rise, the cutlery clinks, the napkin fold);
Andre's hand reaching in with the seed at the end of the next section; the redwood drawn as a column with a
ragged crown rather than tiers.
