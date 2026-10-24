# Draft 2: ViralVision, "Cut to the Beat"

2026-10-16. Built from `AUDIT-v1.md`, all sixteen findings plus both rethinks, as Robin approved. 58.0 s, 720p (vector explainers have no 1080p master). Draft 1's composition is frozen at `drafts/index-v1.html` (local only; it is also commit 0e019aa).

## How it is built now

- Every plate draws into one SVG, so an object can carry from plate to plate. The reel (ten scene tiles) is the same object from Plate II's filmstrip through Plate III's lane to Plate IV's 16-beat strip. The IV phone is the same object as V's clip 1.
- Every tween states its start values, and every count (the heap stat, the III tally, the "Ready to post" counter) is a stack of pre-drawn values shown in turn, so any frame renders the same in any order.
- Fonts are inlined in the page CSS. With `?offline=1` the page exposes `window.__ready` and `window.__frameJPEG(t, q)`, which seek the timeline and draw the page through an SVG foreignObject. That is what `tools/cloud-render` needs; no other HyperFrames page had it.
- `assets/song.wav` (gitignored) is the score from 0.055 s for 58 s, the clock cloud-render muxes.

## Audit items

| # | Finding | Draft 2 |
|---|---|---|
| 1 | V smaller and stiller than IV (RETHINK) | V rebuilt as IV times three: phones 343x610 (IV's was 300x533), the widest frame in the film. Each phone cuts to a new subject on its own beats and lights one karaoke word a beat; in the last bar all three cut on the same four beats and their frames pulse together. |
| 2 | Every plate change fades through paper | One object carries each change: at 9.4 s the long video in the heap stretches into II's filmstrip; at 21.9 s the filmstrip collapses into III's lane with its red cuts still on it; at 32.5 s the snapped lane contracts into IV's strip (same seams); at 45.0 s IV's phone slides into V's first slot and grows; at 55.0 s "One song." rises into the tagline slot and turns into "Post the tour you already filmed." |
| 3 | Plate I finished by 2.75 s, a tidy grid | A seeded heap of 45 tiles, overlapping, rotated 6-15 degrees, mixed sizes, every sixth one landscape, dense in the middle. One lands a beat from 1.25 s, then 3 to 7 a beat from the pulse at 5 s, still landing when "You posted none of it." arrives. Each tile carries a mono duration. |
| 4 | Nothing backs "none of it"; "312 clips" vs "Clips 00" | The stat reads "312 videos · 4 h 51 min" and counts up as tiles land. The counter is now "Ready to post 00" and flashes red when the red clause lands. The heap dims a step a beat after that; the long video stays lit. |
| 5 | II's 4.9 s dead stretch, empty strip, no road row | The strip holds ten scenes as runs of frames, so each cut falls where the picture changes. A read head plays it, a scene a beat, and leaves a red cut on each beat. Each cut scene flies down a dashed guide into its row. Five rows now (stage, crowd, van, guitar, road), centred under the strip; the cut scenes take the first slots, then "from all 312 videos" fills the rest a row a beat. |
| 6 | III's snap invisible (RETHINK) | The lane is the reel: clip tiles whose seams are the cuts, arrived from II. The beat lines run down through it. Each cut's gap to its beat is shaded red; the cuts snap one at a time, a beat ahead of the playhead, each with a red pulse ring and a step on the tally. One bar of push-in (1.45x) on the snap at beat 8. |
| 7 | III after the snap: only the playhead moves | When the playhead meets a cut, the cut and its beat line light red for a beat and the next clip lights (ink frame). Ten on-beat proofs. Snaps now run to 30.6 s. |
| 8 | "0 ms off the beat" | A tally, "3 of 9 cuts on the beat", ending "9 of 9 cuts on the beat, to the frame". |
| 9 | V's invented hooks, too much red | Each phone shows real lines of the one song as karaoke (clip 1 the IV verse, clips 2 and 3 two more lines of it). Progress bars are line brown and share one position. Red in V: the lit word per phone and "One song." |
| 10 | Two red playheads | Playheads inside plates are ink with a small red cap, like the song scale's. Red cuts in II and III only; in IV red is only the lit word and "Your words."; "split into scenes" is label brown. Beat lines flash ink on a beat, red only where a cut is. |
| 11 | Labels 10-13 px; thin caption | Labels 20-26 px; the stat and tally 26 px mono; the caption is Archivo 800 at 42 px (37 px in IV's smaller phone), two short rows a line, the lit word red with a red stroke so it reads heavier without reflowing. |
| 12 | Glyphs too thin and small | Subjects are drawn in the darker brown with non-scaling strokes about 1.5x heavier, fitted to about 80% of the tile height. Stage has a stage edge, two lamps, a figure and a mic stand; the crowd has bigger heads and two raised arms; the row is "guitar". |
| 13 | 3.1 s of silence at the end | The film is 58.0 s. The song scale is rescaled so its playhead reaches the end tick at 58.0, the last event. "Private beta · IndieAgent" comes in at 56.25 s on the held chord. |
| 14 | Quiet tagline, small "private beta" | Tagline at headline size (52 px), wordmark 106 px (was 132), "Private beta · IndieAgent" 26 px, label brown, mixed case. |
| 15 | Same locked wide shot | The III push-in; V as the widest, fullest frame; a slow push (2.5% on I, 2% on V). II, III and IV have no holds left to push (read head, snaps and playhead keep them moving), so they don't take one. |
| 16 | First clause alone left of centre | Every headline's first clause sits centred while alone, and the line slides left on the beat the next clause lands. |

## Protect list, checked

Kept: both bookend lines and all six headline texts with their red clauses; the "Your song" scale and its red playhead; the bottom counter as the one running tally (relabelled); IV's mechanics (playhead, phone shows the tile under it, one word lit a beat on the same lyric); the shared cut pattern 0, 2, 4, 5, 6, 8, 10, 12, 13, 14, 16 (II's scene changes map to it, III snaps to it, IV's seams are it); bars, beats and "your clip · 16 beats" on screen; 312 · 4 h 51 min; the van, guitar and five-icon vocabulary; brown line work, the plate frame, chapter labels; "Every cut lands on the beat." on the bar-4 downbeat (27.5 s); a row a beat in II; one phone per bar in V (45.6, 47.5, 50.0 s); the wordmark on the 55 s chord with its rule; "private beta".

One deliberate exception: the protect list says no timecode on screen, but finding 3 asks for durations on the heap tiles so they read as video. Draft 2 follows finding 3 (small mono durations on Plate I's tiles only).

## Not done

- The score is unchanged (-15.1 LUFS against YouTube's -14); the audit didn't list it.
- A 9:16 version waits for sign-off on this one.
