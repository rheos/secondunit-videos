# Build state: The Map (Inside the Bureau, film 1)

**Draft 1 BUILT 2026-10-17**: https://youtu.be/iHLl4XRwB3I (unlisted, default channel). Seven plates,
84 s, 720p, kit `paper` theme (The Cold Read's look). `hyperframes check` passes; flashcheck PASS
(worst 0.5 flashes/s); -14.3 LUFS, true peak -1.5 dBFS; no dark fields. Local master:
`renders/bureau-map_take01_draft1.mp4` (gitignored). Next: Robin's notes.
Question: what are the Bureau's main parts, and how does work move between them? Send it when
someone asks "What is the Bureau's architecture?"

## Facts used (all from ~/Code/novadiem/bureau at origin/main 939f522, read with `git show`)

The local checkout was 5 commits behind with uncommitted edits, so it was not moved.

| On screen | Source |
|---|---|
| One session interprets the brief, designs, builds and reviews its own work; decisions get buried in chat history | README.md "Why it exists" |
| Human brief goes to the Delegate; the Delegate keeps one resumable Conductor; the Conductor dispatches fresh specialists; artifacts on disk; cold review; revise goes back to the Conductor, proceed gives a reviewed plan; a genuine product fork goes to the human | README.md "How a run moves" (mermaid) |
| The Delegate triages against the workflow registry and opens the run dir before it spawns the Conductor | agents/delegate.md "Bootstrap" step 1; AGENTS.md "Default Delegate path" |
| "Pick the smallest workflow that fits", recorded before work begins | README.md "How a run moves" |
| Registry rows `feature`, `bug-fix`, `execute-plan`, `code-review`, and "+ 16 more" (20 rows in the table) | workflows/index.md |
| Feature workflow order: Analizer 2000 (requirements, spec.md), The Architect (spec.md architecture, plan.md), The Challenger reviews spec + plan cold | workflows/feature.md steps 1, 2, 5; AGENTS.md |
| Specialists start in fresh contexts, without the manager's conversation; handoffs are written to files | README.md "Why it exists", "Independent review" |
| Run dir `<target-repo>/.bureau/runs/<yyyymmdd>-<task-slug>/` with state.json, log.md, spec.md, plan.md, accounting.json | README.md "Run artifacts"; docs/run-protocol.md |
| log.md records every spawn and handoff | README.md "Run artifacts" table |
| The Challenger writes a verdict record to `RUN_DIR/verdicts/`; its verdict is derived: BLOCKED with blockers, APPROVED with none; the Conductor adjudicates | agents/critic.md "Verdict record" |
| The Bureau continues when routine checks pass and stops for product choices | README.md "Human judgment" |
| accounting.json is the close-out record | README.md "Run artifacts", "Run accounting" |
| thebureau.dev, novadiem.com | README.md "Further reading" |

## Changed or simplified, on purpose

- Docs disagree on who triages. README says the Conductor selects the workflow; the Delegate
  bootstrap (the current default path) triages and runs `run-start.sh --workflow` before spawning
  the Conductor. The film draws the current path (Delegate points at the registry) and keeps the
  statement neutral ("Pick the smallest workflow that fits.").
- The feature workflow also has the Cleric, the Spellwright, a second Challenger round and a
  mandatory design-model checkpoint. The film shows only Analizer 2000, Architect and one
  Challenger round, and draws the gate generically (routine checks pass, a product choice goes to
  the owner) without claiming where in the feature sequence it falls.
- "REVISE" and "PROCEED" are the README's words for the review outcome; the Challenger's own enums
  (BLOCKED, APPROVED) appear in its room.
- Left out on purpose (their own films): reviewer isolation details, hashes and coverage, recovery
  from state, the Envoy and campaigns, worktrees, the dev boundary.
- Nothing is drawn dashed: every part shown exists. The run slug is a placeholder
  (`<date>-<task>`), "workflow: feature" is illustrative, no real run data.

## Plates (score seconds)

| Slot | File | Window | Red phrase |
|---|---|---|---|
| b1 | b1-packet.html | 0-8.3 | stamp FINISHED (decisions, review, evidence: NOT FOUND) |
| b2 | b2-one-session.html | 8.3-19 | buried in chat. |
| b3 | b3-triage.html | 19-32 | smallest workflow that fits. |
| b4 | b4-fresh-rooms.html | 32-48.5 | written to disk. |
| b5 | b5-cold-review.html | 48.5-65 | proceed. (lands as the full score returns at 61.5) |
| b6 | b6-gate.html | 65-75.5 | back to the owner. |
| b7 | b7-close-out.html | 75.5-84 | with the record. + colophon |

Device: one cutaway (`BM.build` in index.html) that grows by stage: floor 1 and the run dir (III),
floor 2 (IV), the Challenger room (V), accounting.json (VII), then steps back as the map. Role
names appear when the role does its job. Bottom bar: BRIEF, TRIAGE, DISPATCH, REVIEW, GATE,
CLOSE-OUT, the stages of one run, not live progress.

Score: score-library `bureau-art-pop-bureau-map/take-01-edit.mp3` (sha256 9f6e7626...f12a), take-01
spliced on its beat grid around a 6.5 s silence; see that folder's NOTES.md. `beats.json` is the
edit's librosa grid (0.441 s gap, extended to 84.85).
