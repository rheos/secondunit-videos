# All The Trees, draft 3: 2:05 to the end

Bob's note on draft 2 (2026-10-15): bored from 2:05 to the end because nothing varies. He offered two ways out, both "an organic Pythonesque juxtaposition": the whole thing shrinks down and other things pop up and take over, or it grows too big for the frame and other things are born into the scene.

What draft 2b does there: one held tableau (pair, heart tree, six newcomers, angels) from 2:02 to 2:24, a slow pull-back, the emblem frame drawing in, then the curtain call. About 20 seconds of the same picture.

Fixed points: everything before 2:05 stays as it is. "Because I'm a tree too and so are you" (2:12.2 to 2:16.5) and draft 2's pointing branch (2:14.75 to 2:17.7) stay full frame. The curtain call from 2:24.6 stays. Trumpets run 2:07.4 to 2:26.8 in phrases at 2:07.42, 2:10.71, 2:12.33, 2:24.13; bars of 145 bpm fall at 2:07.5, 2:09.2, 2:10.8 and so on.

## A. Shrink (picked)

- 2:05.0 to 2:06.5: the plate swells a little (uh-oh), then gets sucked down to a small print standing on a meadow, with a bounce.
- 2:07.42 (trumpet): a giant engraved snail pops up out of the meadow. A tree grows out of its shell.
- 2:09.18 (bar): a whale leaps in from the left on an arc and lands in the grass. A tree grows out of its blowhole.
- 2:10.71 (trumpet): a king's head shoots up from behind the print, overshoots, and sinks back to peer over it. His crown is a tree. The print jolts each time one of them lands.
- 2:11.55 to 2:12.2: the camera dives back into the print for the line. Draft 2 plays untouched to 2:18.2.
- 2:18.2: the print shrinks again, smaller. The giants were there all along, out of shot, and barge back in as the camera pulls away.
- 2:19.1 to 2:21: roots grow down from the print and from every giant and meet in one knot under the meadow.
- 2:22.4 (bar): gold runs up the roots from the knot, and each giant's tree catches the light.
- 2:24.6: the valance drops and the curtains close over the whole page, then the curtain call as in draft 2.

## B. Too big

- 2:05: the camera presses into the heart until it overflows the plate, and the border cracks.
- 2:07.4: the heart splits like an egg, and a phoenix and small creatures hatch into the scene.
- 2:11.5: pull back to the full plate for the line and the pointing branch.
- 2:18.2: the heart tree grows past the top border and branches spill over the margins. Birds hatch from the buds.

## Why A

1. The look is fine engraved line. The cut-outs are raster engravings, and blown up three to five times their hatching turns soft and thick, which is exactly what makes them read as engravings. Shrinking keeps every line crisp; the hatching only gets finer, the way a small plate looks.
2. Emblem books are pages of small framed plates beside big strange emblems. A plate that turns out to be a print standing among giant emblematic creatures is a move this style already owns, and the scale clash is the Gilliam joke.
3. The film already pushes in a lot (the root dive in chorus 2, the pushes on every chorus). Going bigger again would not feel like the change Bob asked for. Going smaller is new.
4. It lands the song. Things that look separate, a snail, a whale, a king, the whole picture so far, all turn out to share one root. The gold is that claim made physical.

## Built

`js/alchemy/coda.js` (loaded before `stage.js`, so the curtains still close over it). One world and one camera: world units are plate pixels, the plate sits at (0,0), the meadow at y=486. The plate is drawn as before, copied into a small mip chain, and redrawn as the print. Cut-outs (GPT Image via Codex, style refs: a draft 2 frame and the searcher cut-out) live in `source/alchemy/coda/`, packed by `tools/pack_coda_media.py`.

Checks: frames at 0:20, 1:00, 1:50, 2:04.95 and 2:12.2 to 2:18.15 are pixel-identical to draft 2b's code.
