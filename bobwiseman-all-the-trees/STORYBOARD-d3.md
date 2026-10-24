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

## QA on the render (2026-10-15)

- Span 2:05 to the end: 674 of 674 frames (f03000-f03673), 0 bad frames (`tools/cloud-render/badframes.py`). The two biggest frame-to-frame jumps are designed motion: the dive back into the print at 2:12.0 and the king's pop at 2:19.0. The only frozen run is the end card after the fade (2:31.4 on), same as draft 2b.
- Full cut `out/att_alchemy-d3-full_f00000-f03674_24fps_draft.mp4`: v29 frames 0-2999 (draft 2b is v29 up to 2:05) plus the draft 3 span, encoded at 720p crf 24 on the untouched song.wav. 3674 frames, 153.083 s.
- Against draft 2b's file (decoded, 320x180 grey): before 2:05 mean diff at most 0.96/255; 2:12.2 to 2:18.2 (the line and the pointing branch) at most 1.20/255. That is encode noise. The curtain call converges by 2:27.5, once the curtains cover the new picture. Audio stream md5 identical to draft 2b.
- Before/after sheet: `out/att_d3_before-after_2m05-end_left-d2b_right-d3.png` (2:06.9, 2:09.6, 2:11.3, 2:20.5, 2:23.8, 2:26.6). Side by side: `out/att_d3_side-by-side_f03000-f03674_24fps_left-d2b_right-d3.mp4`.

## Draft 3b: Robin's Gilliam pass (2026-10-15)

Robin held draft 3 and brought in the Terry Gilliam reference study (`references/terry-gilliam/AGENT-DIRECTION.txt`, issue #154). Its question: what respectable thing can we cut out of its world, make misbehave, and turn into the next thing? Draft 3's giants arrived and then stood still, nothing turned into the next thing, and the meadow was an empty stage. Robin picked all four moves offered:

- Chain the pops. 2:08.3 the snail's tree shudders and flings an acorn over the print; 2:09.18 the whale bursts up out of the soil where it lands, throwing clods; 2:10.15 its spout arcs over the print and rains down behind it, and the king shoots up there on the trumpet (2:10.71).
- Whale swallows the print. 2:19.12 (bar) it lunges and gulps the print; 2:19.95 it blows it out of its blowhole on a water column, and the print tumbles through the air back to its place (2:20.62).
- The hand plants it. 2:20.77 (bar) the engraved hand from "it's true" comes in from above the frame and pokes the print into the soil like a seed; the roots grow from that push (2:21.0) and run gold on the next bar (2:22.42) as before.
- The king's head opens. Camera in on the king from 2:22.8; 2:23.25 his crown hinges up like a lid, tree and all, onto a hollow skull; from 2:23.5 the six newcomers climb out of his head one per half beat and hop down onto the print's top edge, as the curtains close.

The king re-enters only after the poke (2:21.17) in this half. No new cut-outs: the hand is `cloudhand` from the opening media and the climbers are the ensemble atlas. The king is split at runtime along the crown's lower rim (`KCUT` in coda.js).

QA: protected frames pixel-identical to draft 2b's code (0:20, 1:00, 1:50, 2:04.95, 2:12.2 to 2:18.15); 674/674 frames, 0 bad; full cut `out/att_alchemy-d3b-full_f00000-f03674_24fps_draft.mp4` matches draft 2b before 2:05 and on 2:12.2 to 2:18.2 to encode noise (mean diff at most 1.22/255), audio md5 identical. Before/after `out/att_d3b_before-after_left-d3_right-d3b.jpg`.
