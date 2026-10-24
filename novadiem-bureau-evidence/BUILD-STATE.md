# Build state: The Fingerprint (Inside the Bureau, film 5)

**Draft 1 BUILT 2026-10-17**: https://youtu.be/bcej6dK9zrU (unlisted, default channel). Seven plates,
88 s, 720p, kit `paper` theme (The Cold Read's look). `hyperframes check` passes; flashcheck PASS
(worst 0.5 flashes/s); -13.9 LUFS, true peak -1.4 dBFS. Local master:
`renders/bureau-evidence_take01_draft1.mp4` (gitignored). Next: Robin's notes.
Question: how is a verdict tied to the exact evidence reviewed? Send it when someone asks "What if
the reviewed files change?"

## Facts used (all from ~/Code/novadiem/bureau at origin/main 939f522, read with `git show`)

| On screen | Source |
|---|---|
| A cold reviewer's verdict says `proceed` (Decision is proceed, revise or escalate) and carries `Artifact-hash` and `Artifacts-read` (a list of path + sha256) | config/delegate-verdict.schema.json |
| The harness computes the SHA-256 of the staged artifact and writes `artifact.sha256` into the packet; the reviewer is Read-only, cannot compute a digest, and copies the value into `Artifact-hash` | scripts/run-cold-reviewer.sh (FR9 block, `sha256_file`); docs/delegate-bridge/v2-integrated.md § v2 §9 |
| A digest is 64 hex characters (the glyph draws one mark per digit) | config/delegate-verdict.schema.json (`^[a-f0-9]{64}$`); run-cold-reviewer.sh length check |
| The Delegate checks the verdict's hash against the artifact; on a mismatch it discards the verdict and re-spawns the reviewer, never resumes the Conductor with it | agents/delegate.md main manager loop step 7; v2-integrated.md § v2 §3 |
| Same rule for the Challenger's records: `verdict-gate.sh` re-hashes every reviewed file after the review and fails with `hash-mismatch` (regression 189 edits the file after an APPROVED record and expects that defect) | scripts/verdict-gate.sh STEP 3; .bureau/regression/189-hash-mismatch-fails-loud.md |
| The packet `checkpoints/NN-context/` is staged by the Delegate; the primary artifact plus supplementary artifacts (spec.md beside plan.md); `state.json`, `log-slice.md`, `conventions.md`, `delegate-reviewer.md`, `bureau-agents.md` are infrastructure, not artifacts | v2-integrated.md § v2 §9; run-cold-reviewer.sh `INFRA_FILES` |
| `artifacts.sha256`: one line per artifact, primary first; the prompt names each with its digest; the verdict's `Artifacts-read` must list each one | run-cold-reviewer.sh manifest block; v2-integrated.md § v2 §9 |
| Coverage is checked both ways: a manifest entry missing from `Artifacts-read` is unread, a reported pair not in the manifest is unexpected; either sets `artifacts_read_complete: false`, names `artifacts_unread`, and logs "Artifacts-read does not match the packet manifest" to log.md | run-cold-reviewer.sh coverage block |
| The test case drawn: plan.md + spec.md staged, the reviewer's verdict skips spec.md, result `artifacts_unread == ["spec.md"]`, the gap logged | scripts/check-cold-reviewer-packet.sh case 2 |
| On `artifacts_read_complete: false` the Delegate discards the verdict and re-spawns | agents/delegate.md step 7; v2-integrated.md § v2 §3 |
| "Added 2026-09-25, after a staged spec went unread" | v2-integrated.md § v2 §9 ("Added 2026-09-25 (#79)") |
| An accepted verdict is appended to the ledger, one record per verdict, and the Conductor resumes | agents/delegate.md steps 7 and 9; v2-integrated.md § v2 §6 |
| thebureau.dev, novadiem.com | README.md "Further reading" |

The glyphs are real: each is the SHA-256 of the synthetic document drawn on screen (lines joined
with `\n`, trailing newline), stored in `FP.DIG` in index.html. The one-line edit (60 to 600
requests a minute) changes 61 of the 64 hex digits; the plate counts them in code.

## Changed or simplified, on purpose

- The film tells the "file changed after proceed" story with the Delegate's step-7 check ("confirm
  it yourself against the artifact"). `verdict-gate.sh` does the same for Challenger records; it is
  cited here but not drawn, to keep one reviewer on screen.
- The packet name `02-context/`, the plan and spec text, and the edit are illustrative. No real run.
- Plate VI shows the helper's result as three short lines; the real log line is longer and names
  the spawn id.
- The bottom bar is the Delegate's sequence for one cold review (stage, fingerprint, cold review,
  hash match, coverage, ledger): the stage of the story, not run progress. The revise cap (step 8)
  is left out.
- Nothing is drawn dashed: every part shown exists on origin/main.
- Limit on screen (plate VII): a match proves what was reviewed (identity and reported coverage),
  not that it was understood.

## Plates (score seconds)

| Slot | File | Window | Red |
|---|---|---|---|
| e1 | e1-proceed.html | 0-8.87 | ONE LINE CHANGED |
| e2 | e2-fingerprint.html | 8.87-18.88 | these exact bytes. |
| e3 | e3-mismatch.html | 18.88-30.65 | the 61 changed marks, ≠, NO MATCH |
| e4 | e4-packet.html | 30.65-44.16 | two fingerprints. |
| e5 | e5-report.html | 44.16-56.54 | none (the desk carries into VI) |
| e6 | e6-refused.html | 56.54-75.35 | spec.md · UNREAD (lands as the score thins at 56.8) |
| e7 | e7-limit.html | 75.35-88 | Not that it was understood. + colophon |

Device: the fingerprint glyph (`FP.glyph` in index.html), then the review desk (`FP.desk`) for
V-VII: manifest, fresh reviewer, verdict card, the Delegate's gate.

Score: score-library `bureau-art-pop-bureau-evidence/take-01.mp3` (sha256 ca6b6391...c408), no
splice needed. Bass and drums drop out 56.8-75.3 (a pulse keeps time) and return at 75.3, where
the re-review passes. `beats.json` is librosa's grid (0.5805 s gap, ~103 BPM), extended to both
ends.
