# Build state: The Seam (Inside the Bureau, film 6)

**Draft 1 BUILT 2026-10-17**: https://youtu.be/cYhhXsI65MY (unlisted, default channel). Seven plates,
87 s, 720p, kit `paper` theme (The Cold Read's look). `hyperframes check` passes; flashcheck PASS
(worst 0.5 flashes/s); -13.6 LUFS, true peak -2.9 dBFS, no gain change. Local master:
`renders/bureau-integration_take01_draft1.mp4` (gitignored). Next: Robin's notes.
Question: how do separately built pieces get verified together? Send it when someone asks "How do
you know the pieces work together?"

## Facts used (all from ~/Code/novadiem/bureau at origin/main 939f522, read with `git show`)

| On screen | Source |
|---|---|
| A chunk that spans two coders' domains is two chunks; the contract-owning chunk ships first ("1 · OWNS THE CONTRACT", "2 · BUILT ON IT") | workflows/execute-plan.md step 1 |
| UI half is the Mage's, API half is the Systemsmith's (frontend/design vs backend/data/contract) | workflows/execute-plan.md step 1 |
| The seam, its prompt ids and route: "Mage P4 UI ↔ Systemsmith P3 API, `/api/runs` contract" | agents/coupler.md "Running as a subagent" (its own example) |
| Each prompt ends with a green checkpoint ("TESTS PASS") and each diff gets its own cold review by the Challenger before it is accepted | workflows/execute-plan.md step 3; workflows/execute-plan/build-tail.md step 6 |
| Code is built inside the run's git worktree, never on the integration branch directly | docs/git-worktree.md (intro, "Before build") |
| "Each side green alone but dead together"; "mocks mask a dead seam" | agents/coupler.md "Metaphor (canon)", Bleed |
| After both halves of a named seam are accepted, the Conductor spawns the Coupler, fresh context, before any prompt that consumes both halves | build-tail.md "Coupling pass"; coupler.md "Running as a subagent" |
| The spawn names SEAM, HALF_A, HALF_B, WORKTREE, CHECKPOINT; it is not handed the full spec rationale or the log narrative | coupler.md "Running as a subagent", "Inputs" |
| It inventories the seam: URLs, types, env vars, auth headers, payload shapes | coupler.md "What you do" 1 |
| It traces both directions and names the files on each side | coupler.md "What you do" 2 |
| Bounded smoke: tests, curl, one happy-path call; dev/test only | coupler.md "What you do" 3, "Running as a subagent" |
| Findings rated BLOCKER / WARNING / SOLID; verdict PHASE LOCK HELD or PHASE LOCK FAILED | coupler.md "What you do" 4, "Output structure" |
| Written to `RUN_DIR/coupling/<seam-slug>.md`, summary appended to log.md | coupler.md "What you do" 5 |
| It does not commit product fixes: blockers go back to the owning coder with exact file and line | coupler.md "What you do" (last paragraph), "What you do not do" |
| No downstream prompt starts on a broken seam; re-couple after fixes; max 2 fix loops per half | build-tail.md "Coupling pass" |
| Limits: doesn't write feature code, doesn't replace the Challenger's cold review, doesn't deploy beyond dev | coupler.md "What you do not do" |
| The build stops at development; production is the owner's call ("DEV-VERIFIED", the shut gate) | build-tail.md "Production boundary"; docs/github-delivery.md "Merge gate" (merging is delivery, not a production deploy) |
| thebureau.dev, novadiem.com | README.md "Further reading" (same colophon as films 1-5) |

## Changed or simplified, on purpose

- The scenario is synthetic: `RunsList.tsx:42`, `routes/runs.py`, the `run_id` vs `id` field, the
  payload `{ "id": 7, "status": "done" }`, the worktree path `~/.bureau/worktrees/app/…` (pattern from
  git-worktree.md) and P5 are illustrative. No real run.
- Plate I shows the failure first, as the hook; in the Bureau it is the Coupler's smoke (plate V)
  that finds it.
- Plate II leaves out the CodeRabbit pre-filter and the Cleric's UI check; one Challenger per half.
- Plate VI draws the re-couple from the same Coupler room; the build tail only says "re-couple
  after fixes".
- Dashed (`.planned`): only P5, the prompt that would consume both halves, because in the story it
  isn't built yet. Every Bureau part on screen exists on origin/main.
- The bottom bar is the build tail around one seam (build, cold review, accept, couple, smoke,
  route, re-couple, dev-verified): the stage of the story, not run progress.

## Plates (score seconds)

| Slot | File | Window | Red |
|---|---|---|---|
| i1 | i1-seam.html | 0-9.47 | DEAD AT THE SEAM (and the spark) |
| i2 | i2-apart.html | 9.47-18.88 | Reviewed apart. |
| i3 | i3-mock.html | 18.88-29.47 | The mock agreed. |
| i4 | i4-coupler.html | 29.47-41.24 | The join. |
| i5 | i5-smoke.html | 41.24-54.75 | PHASE LOCK FAILED (and the spark) |
| i6 | i6-route.html | 54.75-72.4 | none (the plate V spark, until the fix) |
| i7 | i7-limit.html | 72.4-87 | Dev-complete is not a production deploy. + colophon |

Device: the seam (`SM.assembly` in index.html), two assemblies meeting at one connector with three
contract lines; the signal dies on the `id` line until the UI reads the field the API sends.

Score: score-library `bureau-art-pop-bureau-integration/take-01.mp3` (sha256 63fb3a40...0358), no
splice. No mid-track silence; no quiet section either. Bass enters 18.9 s (plate III), drums 36.5 s
(the Coupler starts its inventory), a change at 50.6 s (PHASE LOCK FAILED) and 70.0 s (PHASE LOCK
HELD), decay from 84.8 s. `beats.json`: librosa's grid from 13.58 s (0.5805 s gap, ~103 BPM), the
intro's onsets before it, extended to the end.
