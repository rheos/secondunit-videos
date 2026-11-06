# Receipts: One Show launch clip, built twice

The brief as sent is `../BRIEF.md` (written 2026-10-22 before either build; frames and copy fixed).
Every follow-up note is listed here verbatim with its round, creative notes and technical fixes apart.
Times are Pacific. The verdict is `../VERDICT.md`.

## Timeline

| When (2026-10-22) | What |
|---|---|
| 4:53 pm | session starts; skills, memory and the two frameworks' skills read |
| 4:57 pm | `npx create-video --yes --blank remotion` starts (install 1 min 10 s) |
| 5:02 pm | `hyperframes init hyperframes --resolution square` (seconds), four catalog components added |
| 5:04 pm | Remotion skills installed with `npx remotion skills add` (12 skills copied into remotion/.claude/skills) |
| 5:09 pm | BRIEF.md and shared/spec.json committed, issue #294 and draft PR #295 open |
| 5:12 pm | Remotion build written (src/Launch.tsx, 1 file), `tsc` clean, one eslint note |
| 5:14 pm | HyperFrames build written (index.html, 1 file), lint 0 errors 2 warnings, check passed |
| 5:17 pm | Remotion event-frame stills (8 frames, 106 s with bundling); HyperFrames snapshots (8 frames, 7 s) |
| 5:20 pm | round 1 notes written from the stills (below) |
| 5:22 pm | round 1 applied to both; Remotion stills 6 s (bundle cached), HyperFrames check 8 s |
| 5:24 pm | review renders: Remotion `--scale` refused a non-integer height, so 1080 (21 s) then ffmpeg to 720 (2 s); HyperFrames 1080 in 24 s of render (29 s wall) then ffmpeg to 720 (2 s) |
| 5:27 pm | motion-lab audit tried on both: neither can report probes without an adapter (VERDICT.md) |
| 5:29 pm | HyperFrames re-rendered as d1b (the ease fix had landed after its compile); both cuts opened in one VLC for Robin |

## Round 1 (my own audit of the first stills, before Robin sees anything)

Creative notes (both builds get the same change):

1. Where: frames 42 to 209, the card's lower half. Observed: a blank 700 x 200 area for 5.6 s before
   the stub lands there. Change: a dashed ticket outline in the stub's place with the label NEXT SHOW,
   on from the card's entrance, fading 209 to 215 as the stub grows over it. Keep: the stub's entrance,
   the press, every event frame.
2. Where: frames 234 to 420, the hold. Observed: nothing moves for 6.2 s (HyperFrames' craft check
   flagged the same stretch, "dead_stretch 6.00 s"). Change: the new show files itself into the list as
   a fourth row, NOV 12 · NELSON with an accent outline, 300 to 312 (opacity and a 12 px rise, expo
   out). Keep: the stub still, the cursor parked, the closing cut at 420.

Technical fixes:

- HyperFrames page: the CSS `font` shorthand was written after `line-height` on five rules and reset
  it, so text sat at the top of its box. Fixed by folding the line height into the shorthand
  (`font: 400 16px/64px`). My slip, not the framework's.
- HyperFrames page: `data-composition-variables` belongs on `<html>`, not on the composition root
  (first lint run said nothing; the reference did).
- Remotion: eslint rule `@remotion/from-0` rejects an explicit `from={0}` on a Sequence.
- HyperFrames page: two `tl.to` calls without an `ease` ran on GSAP's default `power1.out` (the hover
  darkening and the form clear), while the Remotion interpolate for the same moves is linear; frame
  214 showed the cleared field lighter in HyperFrames. Both now say `ease: "none"`. Lesson for the
  parity contract: name every ease, including "none".

## Round 2 (Robin, 2026-10-22, about 5:35 pm, relayed by the parent session)

Looking at: the two 720 x 720 review cuts (Remotion d1, HyperFrames d1b) played back to back in one VLC
window. His words: "looks about the same." No change requested; none made. The picture is identical by
design, so the verdict rests on the four non-picture measures.
