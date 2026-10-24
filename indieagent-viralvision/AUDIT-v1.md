# Audit of draft 1: ViralVision, "Cut to the Beat"

2026-10-16. Draft 1 = commit on PR #139 (60 s, 1080p render `out/viralvision_draft1_1080.mp4`). One technical pass, then four cold critics who built nothing and edited nothing: Plates I-II, Plates III-IV, Plate V and the colophon, and the whole film. Their stills and brief are in `out/audit-v1/` (not in git). Robin's own notes, when he gives them, go on top and override all of this.

## Technical pass

| Check | Result |
|---|---|
| Composition check (lint, runtime, layout, motion, contrast) | pass, 47/47 text checks WCAG AA |
| Flashes (`flashcheck.py`) | pass, worst 0.5 a second |
| Bad frames (`badframes.py`) | 0 of 1,440 |
| Loudness | -15.1 LUFS integrated, -1.0 dBTP peak (YouTube target -14) |
| Beat sync | Plate III beat lines flash at 0 ms on the grid; Plate IV caption words step 42 ms (one frame) after the beat; the score's own notes sit a median 24 ms from the grid (detector lag) |
| Near-static picture while music plays (>= 1.5 s) | 4.2-6.4, 6.7-9.6, **10.9-15.75 (4.9 s)**, 19.8-22.1, 24.75-26.3, 28.0-31.25, 46.0-48.25, 48.5-50.75, 52.96-54.6, 57.1-60 |
| Dead air | the score is silent from 56.9 s; the picture holds 3.1 s more |

## Findings, merged and ranked

`[time] [severity] [category] issue, fix, PATCH or RETHINK`. "All" means every critic who looked there raised it.

1. [45-55] [high] [climax] Plate V is smaller and stiller than Plate IV, so the film peaks around 40 s and sags under the loudest music. Phones are 260x462 against IV's 300x533; nothing inside them plays; about 6 of its 10 s are near-static. Fix: V is IV times three and bigger (phones at least 560 px tall, using the empty band to y 860). Each phone cuts to a library tile on every beat and lights one karaoke word a beat; in the last bar all three cut on the same beats, so "one song" is visible. RETHINK (film critic; Plate V critic agrees, high).
2. [10.0 / 22.5 / 32.5 / 45.0 / 55.0] [high] [hand-offs] Every plate change fades through near-empty paper, against the house rule that transitions follow an element. One object can carry the whole film: at 10 a pile tile stretches into the filmstrip; at 22.5 the filmstrip collapses into III's cut lane, its scene cuts becoming the off-beat marks; at 32.5 the snapped lane contracts into IV's 16-beat strip (its cuts are already IV's seams, beats 0, 2, 4, 5, 6, 8, 10, 12, 13, 14, 16); at 45 IV's phone slides into V's first slot; at 55 V's "One song." rises into the tagline slot. PATCH (all four critics).
3. [0-10] [high] [arc, concept] Plate I is finished by 2.75 s, before the pulse at 5 s, and it is a jittered 4x10 grid in a repeating icon cycle: tidy, already sorted, so II's sorting pays nothing off. Fix: a real heap from a seeded shuffle (overlapping, rotated 6-15 degrees, mixed sizes, a few landscape tiles), a few tiles landing on every beat from about 5 s, the stat counting up as they land, still growing when "You posted none of it." arrives. Each tile gets a small mono duration (0:47, 12:08) so it reads as video. PATCH (I-II critic, film critic).
4. [6.5-9.6] [high] [earning] Nothing backs "You posted none of it." and "312 clips" collides with the "Clips 00" counter (two meanings of clip). Fix: the stat says "312 videos · 4 h 51 min"; the counter becomes "Ready to post 00" and flashes red when the red clause lands; the heap dims a step a beat. PATCH.
5. [10.9-15.75] [high] [pacing, clarity] The longest dead stretch (4.9 s): an empty-framed filmstrip at the top, two thirds blank paper, 2 px red lines appearing. The strip has no pictures, so the cuts divide nothing, and the row tiles fade in place with no path from the strip; 11 cuts make 12 pieces but the rows hold 36 tiles, and there is no road row. Fix: draw tour scenes inside the strip in runs so each red cut falls where the picture changes; a read head sweeps and leaves each cut on the beat; each cut piece flies down its dashed guide into its row as it is cut; add a ROAD row; make the counts match; centre the library under the strip. PATCH.
6. [22.5-32.5] [high] [clarity] III's proof is invisible: the off-beat marks move 6-32 px in one sideways shuffle, mostly behind the playhead, and the beat lines stop 40 px above the lane, so nobody can check a mark against a beat. The marks are abstract ticks on a lane called CUTS. Fix: the lane is a strip of clip tiles whose seams are the cuts (arrived from II's filmstrip); run the beat lines through it; shade each seam's gap to its beat, then snap seams one at a time ahead of the playhead, each with a pulse; push in for one bar on one snap. RETHINK (III-IV critic; film critic asks for the push-in).
7. [28.0-31.25] [high] [pacing] After the snap only the thin playhead moves. Fix: when the playhead meets a seam, the seam and its beat line light together for a beat and the next clip lights, four on-beat proofs. PATCH.
8. [27-32.5] [medium] [honesty] "0 ms off the beat" overclaims to people who own DAWs (cuts land on frames) and "ms" is jargon. Fix: "on the beat, to the frame". PATCH (three critics).
9. [45.75-55] [medium] [honesty, colour] V's captions are invented hooks ("ONE MORE SONG"), a feature ViralVision doesn't have, with whole red lines and three red bars: the most red in the film where it should be rarest. Fix: each phone shows real lines of the same song as karaoke, one word lit a beat; progress bars in line brown at one shared position. PATCH (V critic, film critic).
10. [22.5-45] [medium] [colour] Two red playheads at different speeds compete with what the headlines name. Fix: playheads inside plates in ink with a small red cap like the bottom scale; cut marks red in III; in IV red only for the lit word and "Your words."; "split into scenes" in label brown. PATCH.
11. [whole film] [medium] [legibility] Explanatory small caps are 10-13 px tall at 1080p (stat, strip labels, row labels, lane labels, "private beta"), about 2-5 px on a phone, and with no narration they carry the meaning. The karaoke caption is thin 26 px mono. Fix: labels 18-26 px; caption about twice the size in Archivo Bold with the lit word heavier as well as red. PATCH.
12. [whole film] [medium] [drawing] Glyph lines match the tile frames in weight and fill under half the tile, so subjects vanish small; the stage reads as spotlights or bowling pins; the crowd as scribble. Fix: subjects 1.5x heavier in the darker brown, filling about 70% of the tile; a stage edge, mic stand and one figure under the lamps; bigger heads and two raised arms for the crowd; the guitar row is labelled "guitar", not "close-up". PATCH.
13. [56.9-60] [high] [ending] 3.1 s of digital silence while the "Your song" playhead keeps running. Fix: end the film at 58.0 s (resolve at 55, ring, out), with the bottom playhead rescaled to reach the end tick as the last event; the colophon's "private beta" line comes in on the held chord. PATCH (V critic, film critic, technical pass).
14. [55-58] [medium] [hierarchy, honesty] The tagline is the quietest headline in the film and a third of the wordmark; "PRIVATE BETA · INDIEAGENT" is 13 px caps. Fix: tagline at plate-headline size, wordmark about 20% smaller, "Private beta · IndieAgent" at about 26 px in line brown, mixed case. PATCH.
15. [whole film] [low] [composition] Four of six plates are centred, every subject's top edge sits at y 200-230, every plate is the same locked wide shot. Fix: the III push-in (finding 6), V as the widest, fullest frame (finding 1), a slow 2-3% push on every plate so no hold is a true freeze. PATCH.
16. [4.2-6.5, 18.25-19.75] [low] [composition] A headline's first clause sits alone left of centre for 1.5-2.5 s. Fix: centre it while alone and slide it left on the beat the second clause lands. PATCH.

## Do not touch (protect list)

- The bookend: "You posted none of it." in Plate I and "Post the tour you already filmed." in the colophon; all six headline texts and their red second clauses.
- The "Your song" scale and its red playhead, on time to the pixel; the bottom counter as the film's one running tally (relabelled, not removed).
- Plate IV's mechanics: the strip playhead, the phone showing the tile under it, one karaoke word lit per beat on the lyric "we drove all night / to play for you / and you sang it / every word back". It is the clearest picture of the product and V should copy it.
- The shared cut pattern between III's snapped marks and IV's seams (beats 0, 2, 4, 5, 6, 8, 10, 12, 13, 14, 16).
- Musician units only: bars, beats, "Your clip · 16 beats". No seconds, frames or timecode on screen.
- "312 · 4 h 51 min" (the numbers), the van and guitar glyphs, the five-icon vocabulary, thin brown line work, the plate frame, chapter labels.
- "Every cut lands on the beat." arriving on a bar downbeat under the grid; the row-a-beat fill rhythm in II; one phone per bar in V; the wordmark landing on the 55 s chord with its rule; the words "private beta".

## Draft 2 plan (for Robin's OK)

Rethinks: Plate V rebuilt as the climax (finding 1); Plate III's lane as a tile strip with a visible, legible snap (finding 6). Everything else is a patch. Film length becomes 58.0 s. Order: hand-off chain and plate rebuilds first (1, 2, 5, 6), then Plate I's heap (3, 4), then copy, colour and legibility (8-14), then the low items. Before/after of every plate against draft 1, side by side, before Robin sees it.
