# Build state: What Survives (Inside the Bureau, film 3)

**Draft 1 BUILT 2026-10-17**: https://youtu.be/V98nKVNlhb4 (unlisted, default channel). Seven plates,
86 s, 720p, kit `paper` theme (The Cold Read and The Map's look). `hyperframes check` passes;
flashcheck PASS (worst 0.5 flashes/s); -14.0 LUFS, true peak -1.3 dBFS (remux adds 1.4 dB through a
limiter); no dark fields. Local master: `renders/bureau-memory_take01_draft1.mp4` (gitignored).
Next: Robin's notes. Question: where does a Bureau run's memory live when the session ends? Send it when
someone asks "What happens when the session ends?"

## Facts used (all from ~/Code/novadiem/bureau at origin/main 939f522, read with `git show`)

The local checkout is behind origin/main with uncommitted edits, so it was not moved.

| On screen | Source |
|---|---|
| Each run has one run dir, `<target-repo>/.bureau/runs/<yyyymmdd>-<task-slug>/` | README.md "Run artifacts"; docs/run-protocol.md "Run directory" |
| state.json, log.md, spec.md, plan.md, prompts.md live in the run dir | docs/run-protocol.md ("state.json, log.md, spec.md, plan.md, prompts.md, and design/ all live under RUN_DIR"); README.md "Run artifacts" table |
| Specialists work in fresh contexts; handoffs are written to files | README.md "Why it exists" |
| Analizer 2000 writes spec.md, The Architect plan.md, The Challenger's findings go to log.md, The Spellwright writes prompts.md | workflows/feature.md steps 1, 2, 5, 8; README.md "The cast" |
| At every phase boundary, before the next spawn, the Conductor updates state.json and appends a resume note to log.md: what completed, what is next, what is blocked, which artifact is canonical | agents/orchestrator.md "Context hygiene" 1 and 2 |
| state.json keys `phase`, `phase_status`, `phases_complete`, `open_questions`, `last_updated`, `decisions` | docs/run-protocol.md "State management" (the JSON shape) |
| state.json is state, not prose; prose goes in log.md | docs/run-protocol.md "State discipline" |
| log.md is the append-only human record | README.md "Run artifacts" table |
| A new session resumes with "Run dir: ... read its state.json and log.md" | bureau CLAUDE.md "Resuming" |
| The Conductor re-reads state.json and the latest log.md section before acting; the transcript is not adjudication memory, the written artifacts are | agents/orchestrator.md "Context hygiene" 3 |
| Another Conductor resumes from the files without the previous session's transcript | README.md "Artifact memory" |
| An existing run dir is used verbatim: never relocated, no duplicate run dir | docs/run-protocol.md "Creation order" step (0); bureau CLAUDE.md "Resuming" |
| `resumed_legs` is incremented in state.json when a Conductor leg resumes | agents/orchestrator.md (pointer section, "On resume") |
| After the Spellwright writes prompts.md, The Challenger reviews the prompts in a fresh context (round 2); feature is a plan workflow and closes out after that | workflows/feature.md steps 8, 9 and "DONE" |
| thebureau.dev, novadiem.com | README.md "Further reading" |

## Changed or simplified, on purpose

- **Illustrative run.** The phase values (`prompts`, `complete`), "challenger, round 2", the decision
  "auth: session cookie" and "keep the v1 endpoints" are made up. No real run data, slug or numbers.
- **The limit** ("Only what was written down comes back") is drawn from the resume path, not quoted:
  the new Conductor reads state.json and log.md and does not get the old transcript (README
  "Artifact memory", orchestrator.md "Context hygiene"), so a decision said only in chat is not
  there to find. The README's own wording of the nearby limit is about cold review ("Cold review also
  lacks unwritten context").
- Only the Conductor's context is drawn in the session. The Delegate, which in the default topology
  keeps the Conductor resumable and re-spawns it with state.json and log.md context when it dies
  (agents/delegate.md "Failure handling"), is left out to keep one device.
- The bottom bar is the story of one recovery (SESSION ENDS, ON DISK, STATE + LOG, NEW SESSION,
  RE-READ, CONTINUE), not live run progress. ON DISK and STATE + LOG look at what was written before
  the cut.
- The dashed "second run dir" in plate V is a rejected option, not a planned feature. Nothing in this
  film is unbuilt, so nothing else is dashed. The "said only in chat" slip in plate VI is dashed
  because it never reached disk.
- The feature workflow's other steps (Analizer reconciliation, the design-model checkpoint, the Cleric)
  are not drawn; the four specialist chambers are the ones that wrote a file shown here.
- Left out on purpose: the run-scope nonce and pointer file, the resume-token check, accounting,
  archiving, worktrees, the Envoy.

## Plates (score seconds)

| Slot | File | Window | Red phrase |
|---|---|---|---|
| b1 | b1-cut.html | 0-8.89 | stamp SESSION ENDED |
| b2 | b2-on-disk.html | 8.89-22.41 | written to a file. |
| b3 | b3-state-log.html | 22.41-36.52 | before the next spawn. |
| b4 | b4-new-session.html | 36.52-50.06 | starts empty. |
| b5 | b5-re-read.html | 50.06-65.34 | not the transcript. |
| b6 | b6-limit.html | 65.34-77.69 | written down |
| b7 | b7-continue.html | 77.69-86 | outlives the session. + colophon |

Device (`AM` in index.html): above the disk line, the session and its context chambers; below it,
the run dir and its artifact plates. The chambers go to ghosts at the cut and vanish when session 2
starts; the plates never move. The new Conductor's chamber fills row by row from the plates.

Score: score-library `bureau-art-pop-bureau-memory/take-01.mp3` (sha256 783259d8...5f65), used whole
and cut at 86 s (it decays to silence at 85.75). No mid-track gaps; no quiet section either (see that
folder's NOTES.md). The new session lands where the drums enter (36.5 s). `beats.json`: intro beats
from a beat_track of the first 37 s, main grid 36.52-84.17 (0.580 s median gap), extended to 90.
