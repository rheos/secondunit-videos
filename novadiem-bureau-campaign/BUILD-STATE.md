# Build state: The Campaign (Inside the Bureau, film 8)

**Draft 1 BUILT 2026-10-17**: https://youtu.be/ZUzxbEowBWU (unlisted, default channel). Seven plates,
86.5 s, 720p, kit `paper` theme (The Cold Read's look). `hyperframes check` passes; flashcheck PASS
(worst 0.5 flashes/s); -13.9 LUFS, peak -1.4 dBFS. Local master:
`renders/bureau-campaign_take01_draft1.mp4` (gitignored). Next: Robin's notes. Question: what does the Envoy add above a single run? Send it when
someone asks "Can it work through a roadmap?"

## Facts used (all from ~/Code/novadiem/bureau at origin/main 939f522, read with `git show`)

| On screen | Source |
|---|---|
| For a planned series of runs, the Envoy reads an `INDEX.md`, launches each run through its own Delegate and supervises one run at a time | README.md "How a run moves"; cast table |
| The Envoy is XVIII, The Moon (the crescent mark) | agents/envoy.md title |
| Its books: the charter `SUPERVISOR.md` (authority + escalation), `SUPERVISOR-STATE.md` (current block), `HANDOFF.md` (the cross-run baton), plus INDEX | agents/envoy.md Bootstrap and Startup read scope; workflows/run-series.md Inputs |
| A run launches when its dependencies are satisfied in INDEX; one product run at a time unless INDEX marks product parallelism | workflows/run-series.md step 5 |
| Each run gets a fresh Delegate/Conductor, no context shared with the prior run; the Envoy spawns the Delegate as a subagent | workflows/run-series.md Invariant and step 5; agents/envoy.md "Spawn each run's Delegate as a SUBAGENT" |
| Delegate -> Conductor -> fresh specialists, writing to the run dir (state.json, log.md) | README.md "How a run moves"; agents/envoy.md Inputs (RUN_DIR state.json + log.md) |
| The Delegate returns to the Envoy at each checkpoint; the Envoy reads `state.json` and the `log.md` tail; the run directory is authoritative | agents/envoy.md "Blocking does not mean blind"; Each tick; workflows/run-series.md step 2 |
| Usage bands: weekly under 50% full speed; 50-80% go to the end of the run; weekly or session (5 h) at or over 80% pause at a clean checkpoint and ping | workflows/run-series.md step 6; agents/envoy.md Escalation |
| At the PR gate the Envoy verifies the close-out itself: state.json, required checks, main untouched, diff scope, publication safety | workflows/run-series.md step 3 |
| The Envoy never grades on its own authority; a fresh cold reviewer (the Challenger) gives proceed / revise / escalate | workflows/run-series.md step 3 and "When NOT to use"; agents/envoy.md Role |
| The verdict counts only when paired with a green final gate on the same head SHA | workflows/run-series.md step 3 (`scripts/terminal-pairing.sh`); agents/envoy.md Role |
| Verdicts inside the charter's grant are relayed; outside it, park and ping | workflows/run-series.md step 4; agents/envoy.md Role |
| The run merges through its own delivery flow | workflows/run-series.md step 4 |
| Hand off per product run: HANDOFF written, a fresh Envoy picks up from disk, never zero or two Envoys live; the successor Envoy spawns the next run's Delegate | workflows/run-series.md steps 5 and 7; agents/envoy.md Bootstrap 4, Escalation, Handoff |
| The Envoy doesn't build or grade its own work | workflows/run-series.md "When NOT to use" ("it does not implement, and every PR verdict comes from a fresh cold reviewer"); agents/envoy.md Role |
| Done when INDEX shows every run done, or stopped cleanly at the token budget with remaining runs parked | workflows/run-series.md Done criteria |
| thebureau.dev, novadiem.com | README.md "Further reading" |

## Changed or simplified, on purpose

- The series is illustrative: five runs, synthetic dependencies (3 waits on 2; 4 on 3; 5 on 3 and 4).
  Labelled "INDEX.md · AN ILLUSTRATIVE SERIES". The usage needle values are illustrative (labelled).
- The checklist wording is shortened ("diff inside the run card" for "diff scope", "state.json says
  complete" for verifying `state.json`).
- Order in plate VI follows agents/envoy.md: run 3 merges, the Envoy hands off, and the fresh Envoy
  launches run 4. The workflow numbers "advance" (5) before "hand off" (7); envoy.md says the
  successor spawns the next run's Delegate, so the film uses that order. The bottom bar reads
  ADOPT, LAUNCH, WATCH, SECOND REVIEW, RELAY, HAND OFF, NEXT RUN: the stage of the story, not run
  progress.
- Left out: the eval / A/B track, the legacy `--bg` path, the depth-3 measurement, the challenger
  review starting beside the final gate.
- "The owner" stands in for Robin, drawn as text, not a person.
- Nothing is drawn dashed as `.planned`: every part shown exists on origin/main. The faint dashed
  boxes inside DETAIL B are construction lines for a run that has only just started.

## Plates (score seconds)

| Slot | File | Window | Red |
|---|---|---|---|
| c1 | c1-merged.html | 0-9.47 | 3 RUNS LEFT |
| c2 | c2-map.html | 9.47-19.46 | above the runs. |
| c3 | c3-launch.html | 19.46-33.0 | the rest parked. |
| c4 | c4-watch.html | 33.0-43.54 | 80%: PAUSE |
| c5 | c5-review.html | 43.54-56.22 | A fresh reviewer (the score thins 47.07-56.2) |
| c6 | c6-advance.html | 56.22-72.68 | Next run launched. (full arrangement returns at 56.2) |
| c7 | c7-limit.html | 72.68-86.5 | It doesn't build or grade its own work. + colophon |

Device: the campaign map (`CM.map` in index.html) with an engineering detail callout that enlarges
the one active run (`CM.callout`, `CM.inset`); blocked runs sit in a hatched PARKED zone. Plates
III-VI hand over on identical static states, so the map never blinks between plates.

Score: score-library `bureau-art-pop-bureau-campaign/take-01-edit.mp3` (sha256 42a50307...c905),
take-01 spliced over its mid-track silence (recipe in that folder's NOTES.md). `beats.json` is
librosa's grid of the edit (0.5805 s gap, ~103 BPM), extended to both ends.
