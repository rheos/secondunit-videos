# Build state: Routing (Inside the Bureau, film 2)

**Draft 1 BUILT 2026-10-17**: https://youtu.be/lObvJdKVnS0 (unlisted, default channel). Seven plates,
85.2 s, 720p, kit `paper` theme (The Cold Read's and The Map's look). `hyperframes check` passes;
flashcheck PASS (worst 0.5 flashes/s); -14.0 LUFS, peak -2.0 dBFS; no silence at -45 dB / 1 s; no
dark fields. Local master: `renders/bureau-routing_take01_draft1.mp4` (gitignored). Next: Robin's notes. Question: why are the Delegate, the Conductor and the specialists separate?
Send it when someone asks "Why so many agents and coordinators?"

## Facts used (all from ~/Code/novadiem/bureau at origin/main 939f522, read with `git show`)

The local checkout is behind origin/main with uncommitted edits, so it was not moved.

| On screen | Source |
|---|---|
| "fix a crash on login" goes to `bug-fix`; "add team invitations" goes to `feature` | workflows/index.md, "Triage examples" table |
| One session interprets the brief, chooses an architecture, writes the code and reviews its own choices | README.md "Why it exists" |
| Delegate "flow and gates", Conductor "dispatch and adjudication", specialist "bounded context" | README.md "How a run moves" (mermaid labels) |
| "Tasks are classified before an agent is chosen" (statement: "Classified before an agent is chosen.") | README.md "Why it exists" |
| Six registry rows (feature, bug-fix, build-review-cold, execute-plan, code-review, design-build) + 14 more = 20 | workflows/index.md "Registered workflows" |
| The Delegate triages against the registry, then `run-start.sh --workflow` writes the workflow into state.json before the Conductor is spawned | agents/delegate.md "Bootstrap" step 1 and 3; scripts/run-start.sh (patches `.workflow` into state.json) |
| The Delegate starts the Conductor | agents/delegate.md "Bootstrap" step 3 |
| Bug fix: 1 Analizer 2000 reproduces and locates the cause (repro.md); 2 worktree; 3 one coder (Mage, Systemsmith or Mechanic) fixes it with a regression test in the worktree; 4 the Challenger cold-reviews the diff against repro.md and does not get log.md; the Conductor re-runs the repro, dev-verified | workflows/bug-fix.md steps 1-4, summary row in workflows/index.md |
| "The bug is the spec." / no spec.md, no plan.md, no prompts.md | workflows/bug-fix.md "When to use" ("the bug itself is the spec") and "Outputs" |
| Feature: 1 Analizer 2000 requirements (spec.md), 2 Architect architecture + plan (plan.md), 3 Analizer reconciliation, 4 design-model checkpoint, 5 Challenger round 1 on spec + plan, 6-7 Cleric (design brief or DESIGN: NOT NEEDED, then ingest), 8 Spellwright (prompts.md), 9 Challenger round 2 on the prompts | workflows/feature.md steps 1-9 |
| "the heaviest route" | agents/orchestrator.md "Triage" ("the default and the heaviest") |
| No coder on the feature route: it is a plan workflow | workflows/feature.md "Type: plan" |
| Delegate holds the gates and never grades; every verdict comes from a fresh cold reviewer | agents/delegate.md "Role" (FR6) |
| Conductor dispatches and adjudicates; never writes spec, plan or review itself, spawns a specialist | agents/orchestrator.md "Role" |
| A specialist sees only its persona file and input files, never the conversation | agents/orchestrator.md "Why subagents" |
| "If it matters, it has to be written." / a fresh context misses what nobody wrote down | agents/orchestrator.md "Why subagents" ("If it matters, it has to be written in spec.md"); README.md "Current status and limits" ("Cold review also lacks unwritten context") |
| "Match the weight of process to the weight of the work." | agents/orchestrator.md "Triage" |
| thebureau.dev, novadiem.com | README.md "Further reading" |

## Who triages: which doc the film follows

README.md says the Conductor selects the workflow; agents/orchestrator.md also tells the Conductor
to triage first. agents/delegate.md "Bootstrap" (the current default entrypoint for a single run)
has the Delegate read workflows/index.md, triage, and open the run dir with
`run-start.sh --workflow` before it spawns the Conductor, which then reads the selected workflow
file. The film follows the Delegate bootstrap and the script: the task lands at the Delegate's
desk, the Delegate's cord picks the row and writes it to state.json, then the Delegate starts the
Conductor. The Conductor's triage section still applies in direct fallback mode; the film doesn't
show that mode.

## Changed or simplified, on purpose

- Step 2 of bug-fix (the worktree) and step 4 of feature (the design-model checkpoint) are not
  specialists, so they have no lamp. The worktree is named in step 3's callout; the checkpoint is a
  pulse back up the cord to the Delegate's gate arm. The film doesn't claim who answers the
  checkpoint.
- Only six of the twenty registry rows are drawn; the others are "+ 14 MORE". Rows other than
  bug-fix and feature have empty sockets and never light, so the film makes no claim about which
  specialists they use.
- Bug-fix also stops at checkpoints (cannot reproduce, cause spans two domains); not shown.
- Close-out shows both routes lit at once on one board; a real run has one route and its own
  run dir.
- Nothing is drawn dashed: every part shown exists. Both tasks are the registry's own examples, no
  real run data.

## Plates (score seconds)

| Slot | File | Window | Red phrase |
|---|---|---|---|
| r1 | r1-two-tasks.html | 0-8.31 | none (title: ROUTING, "Inside the Bureau · 2") |
| r2 | r2-one-session.html | 8.31-18.88 | reviews its own choices. |
| r3 | r3-triage.html | 18.88-35.34 | before an agent is chosen. |
| r4 | r4-bug-fix.html | 35.34-46.51 | the spec. |
| r5 | r5-feature.html | 46.51-63.58 | the heaviest route. |
| r6 | r6-separate.html | 63.58-76.51 | it has to be written. |
| r7 | r7-weight.html | 76.51-85.2 | to the weight of the work. + colophon |

Device: one switchboard (`RT` in index.html). Rows are workflows, columns are specialists, and only
the chosen route's lamps light, numbered by workflow step. The Delegate's desk plugs the task in;
the Conductor's reticle runs along the row in step order; files drop into the run dir. Bottom bar:
BRIEF, TRIAGE, DISPATCH, REVIEW, CLOSE-OUT, the stages of one run (as in The Map), not live
progress.

Score: score-library `bureau-art-pop-bureau-routing/take-01-edit.mp3` (sha256 530449a9...dc17),
take-01 spliced on its beat grid around a 16 s silence; see that folder's NOTES.md. `beats.json` is
the edit's librosa grid (0.5805 s gap, extended to 84.71).
