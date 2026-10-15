# Build state: full film (draft 1), PAUSED 2026-10-15

Robin approved the beat 4 look test (https://youtu.be/0KMfTCTauI0) and asked for beats 1-7 on the
full score, same look, then draft 1. Paused mid-build for session quota. Resume from here.

## Read before writing beats (added 2026-10-15)

- Pacing rules and this film's accuracy limit: `~/Code/novadiem/assistant/ideas/bureau-series.md`
  (filed from Codex's Bureau series attempt; this film is that series' pilot). Key ones: something
  new on screen every 3 to 6 s, at least three visible events per ~15 s, words appear where the
  event happens. Check each beat below against that before building it.
- Open with Robin: "No shared assumptions." may become "No shared conversation." Build it as
  written unless he has answered (see `assistant/ideas/cold-read-video.md`, Open decisions).

## Done

- `index.html` rewritten as a thin root: shared CSS (all look classes), `window.CR` helpers
  (beat grid, `snap`, `el`, `text`, `prime`, `kit(tl, slotStart)` giving `T` snapped cue,
  `R` unsnapped, `draw`, `fade`, `reveal`, `out`, `travel`), audio, and 8 sub-composition slots.
  Not yet checked or rendered.
- `compositions/furniture.html` (0-95 s): paper grain, grid, border + registration marks drawn in
  at the start, bottom bar drawn in, tick and progress move SPEC (1.63) > PLAN (7.89) >
  BUILD (20.39) > CRITIC (55.08) > MERGE (85.08). Not yet checked.
- `beats.json`: 144 librosa beats of the score (~95.7 BPM, first beat 1.63 s).
- The v1 look test (single-file `index.html`) is in git at rheos/secondunit-videos PR #135 if
  beat 4 code needs copying: `git show 29aad8b:novadiem-cold-read/index.html`.

## Still to write (one file each in `compositions/`, ids prefixed per beat, e.g. `b2-node`)

Every file: `<template>` holding `<style>#bN{position:absolute;inset:0}</style>`, root
`<div id="bN" data-composition-id="bN" ...>`, script using `CR.kit(tl, slotStart)`, register
`window.__timelines["bN"]`. Plate labels top-left/right in each beat. Fade the beat's content out
in its last ~0.5 s (except b3 and b4, see below). Cue times below are SCORE seconds.

| Slot | File | Window | Labels |
|---|---|---|---|
| b1 | b1-plate.html | 0-7.5 | Plate I / Review |
| b2 | b2-closed-loop.html | 7.5-20 | Plate II / The Closed Loop |
| b3 | b3-two-failures.html | 20-35.4 (z-index 5, above b4) | Plate III / Two Kinds of Failure |
| b4 | b4-assembly.html | 34.7-55.08 | Plate IV / The Bureau Assembles |
| b5 | b5-critic-loop.html | 55.08-70.08 | Plate V / The Critic Loop |
| b6 | b6-the-test.html | 70.08-85.08 | Plate VI / The Test |
| b7 | b7-colophon.html | 85.08-95 | Plate VII / Colophon |

**b1.** Labels at 1.63. Title "THE COLD READ" in Marcellus SC ~120px, letterspaced, centred
y~380, `reveal` at 2.25 (1.2 s). Gold rule 600px under it at 2.88 with end ticks. Mono subtitle
"WHEN INDEPENDENT REVIEW IS WORTH ITS COST" at 3.51. A diff below (y 600-760): bracket + "DIFF"
label, 7 lines of varying length, `+` lines gold, `-` lines lighter ink, drawn pen-speed
(`ease none`) one after another 4.13-6.9. Out at 7.0.

**b2.** AGENT node (double ring, r 64) at (700,420); doc at (1220,420) with a hatched
blind-spot box labelled "ASSUMED". "WRITES" arrow node > doc (10.38). Doc 11.01, hatch 11.63.
Return arc from doc bottom curving under and back up into the same node (12.89, ease none),
"REVIEWS" label. A gold dot does 2 laps of the closed loop 14.14-19.13 (`travel`; set its initial
transform by hand). Statement uses `.statement.wrap` (two lines): "The author" (15.39),
"**can't see**" red (16.0), "what the author assumed." (16.63). Out at 19.6.

**b3.** Paper first: left half shows two loud failures, CRASH (window frame with a zigzag break +
alarm ticks) and BROKEN UI (frame with a block knocked out of line), bracket "ANNOUNCES ITSELF";
statement "Most bugs announce themselves." (ink, no red) ~22-25. Then the night layer (copy from
v1: stars, border, 3 stacked layers DURABLE STATE / MONEY · AUTH / OUTBOUND SENDS, faint red
crack, night bar at BUILD, paper-coloured labels) wipes IN from the right 27.26-27.89 (clip
inset left 100% > 0%, gold edge line 1918 > 0). Layers draw 28.51-30.4, crack 31.0, "Some bugs
are" 31.0, "**silent.**" 31.63. Wipe OUT left-to-right 34.76-35.39 exactly as v1. No fade-out.

**b4.** Port v1's beat 4 minus the night layer and minus the 55.08+ critic lead-in. Labels visible
from slot start (b3 covers them until the wipe). Conductor 35.39, chambers 37.27/40.38/43.82/46.95,
docs 39.13/42.56/45.7, note 49.46, "Fresh context." 50.06, "**No shared assumptions.**" 51.32.
Hold to the end, no fade (b5 redraws).

**b5.** Builder chamber (centre x 520) and Critic chamber (x 1140), 260x210 at y 400-610, drawn
55.08-56.5. Gate at x ~1580 (post + striped boom, "CHECKPOINT" / "HUMAN GATE"), drawn ~56.3.
DIFF arrow 56.96; doc token Builder > Critic 57.56; ink "x" in Critic 58.82; "FINDINGS" return arc
underneath 59.44 with token riding back; loop gauge "FIX LOOPS · MAX 2" with two cells (real
Bureau default `max_critic_loops` = 2), cell 1 fills 60.07. Statement "Every pass," 61.32,
"a **cold read.**" red 61.95. Token v2 goes again 61.95; x fades, check draws 63.18; arrow to gate
63.81; token travels 64.44; boom lifts 65.69 (rotate about post, power2.inOut); token passes and
fades ~67. Out at 69.45.

**b6.** Cartouche (double rect x 260-1660, y 190-400) at 70.68. Inscription in Marcellus SC ~44px,
3 lines, words fading in one by one 71.31-~74: "DOES THIS DIFF WRITE DURABLE STATE, MOVE MONEY,
GATE ACCESS, OR FIRE SOMETHING IRREVERSIBLE?" Flow: trunk down 75.07, branch 75.7, drops 76.32,
boxes 76.95 (left "YES" > "BRING THE BUREAU" with a small double-square glyph; right "NO" >
"SHIP IT"), labels 77.58. Statement "No:" 79.46, "**just ship.**" red 80.06. Out at 84.45.

**b7.** Two statement rows centred around y 420 and 520, ~80px: "Independent review costs a lot."
(85.68), then "Spend it" (87.56) + "**where errors stay quiet.**" red (88.19). Gold rule at 88.82,
mono "THE COLD READ · NOVADIEM.COM" at 89.44 (credit line is still an open decision: novadiem.com
only for now). Hold to 95; audio fades 93.6-95.

## Then

1. `npx hyperframes check`; fix. Mark intentional layering (b3 over b4) with
   `data-layout-allow-overlap` / `data-layout-allow-occlusion` as in v1.
2. `npx hyperframes snapshot --at <every beat midpoint + every red phrase>`; read the contact
   sheet and zoom crops; fix.
3. Render drafts NATIVELY at 720p (house rule; Robin 2026-10-15: "why are we doing 1080p anything
   at this point? these are all drafts"). HyperFrames has no downscale flag, so: set the root
   `data-width="1280" data-height="720"` and wrap the slots in a 1920x1080 stage div with
   `transform: scale(0.666667); transform-origin: 0 0`. Render
   `nice -n 15 npx hyperframes render -f 24 -q draft -o renders/cold-read-score_take01_f0-f2280_24fps_draft1.mp4`.
   No 1080p render of anything until Robin signs off the cut; the master then flips the root back
   to 1920x1080 with scale 1. (The v1 look test wrongly rendered at 1080p and downscaled.)
4. flashcheck + badframes from latest tools (`git archive origin/main tools/motion-lab
   tools/cloud-render` into the scratchpad; the shared checkout's tools/ is stale). badframes will
   flag b3's dark plate (~27.5-35.4 s): expected.
5. Upload unlisted with `secondunit-worker/yt_upload.py` (--category 27, --note), confirm
   UPLOADS.jsonl says notified true.
6. Commit from a worktree off origin/main (shared checkout has other sessions' dirty work):
   issue > branch > PR > `gh pr merge --merge`. Update `assistant/ideas/cold-read-video.md`.
