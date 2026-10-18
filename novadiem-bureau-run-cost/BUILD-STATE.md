# Build state: The Ledger (Inside the Bureau, deep dive 10)

**Draft 1 BUILT 2026-10-18**: DRAFT_LINK (unlisted, default channel). Seven plates, 87.5 s, 720p,
kit `paper` theme (The Cold Read's look). `hyperframes check` passes. Local master:
`renders/bureau-run-cost_take01_draft1.mp4` (gitignored). Next: Robin's notes.
Question: what did this run actually cost? Point: failed and discarded work counts toward the cost,
and a cost nobody measured stays "unknown", never zero.

## Facts used (all from ~/Code/novadiem/bureau at origin/main 939f522, read with `git show`)

| On screen | Source |
|---|---|
| Accounting answers which roles ran, how many times and to what end; `account-run.sh <RUN_DIR>` builds `accounting.json` | docs/run-accounting.md § Overview |
| Each spawn writes two SPAWN-EVENT lines to log.md, `started` then a terminal status, joined by `attempt_id` (`"<role>-<n>"`, e.g. `analyst-1`) | docs/run-accounting.md § A; agents/orchestrator.md § Run accounting |
| Terminal statuses include `no-handoff`; such spawns "still cost tokens and must be recorded, not dropped" (plate III's red line) | docs/run-accounting.md § A |
| `rework: true` goes on the started line of a spawn that redoes a deliverable, including "a retried failed or no-handoff spawn"; never on the reviewer that triggered it | agents/orchestrator.md § Run accounting (rework flag rule); run-accounting.md § B2.1 |
| A terminal with no started line is dropped (logged as an orphan terminal with "no started event, skipped"); a rerun needs its own started line | docs/run-accounting.md § A; scripts/account-run.sh |
| Token figures are not on SPAWN-EVENT lines; close-out (`account-run.sh`) calls `aggregate-transcripts.sh`, which reads one transcript per attempt (so the token column fills only at close-out) | docs/run-accounting.md § B2, § B2.3 |
| An attempt with no transcript gets confidence `unavailable` with the note "no run-scoped transcript resolved for this SPAWN-EVENT attempt" | scripts/aggregate-transcripts.sh (line 517) |
| A zero from a missing source is never `exact`: "a zero created by a missing, malformed, ambiguous, or collided source must be non-exact and carry a note" | docs/run-accounting.md § B4 |
| A non-Claude runtime emits a `_runtime_gap` naming the absence of transcripts "instead of guessing a figure" (the second host in the film) | docs/run-accounting.md § B2.2; scripts/aggregate-transcripts.sh |
| The Conductor is never a spawn; its figure is the separate `conductor_tokens` block | docs/run-accounting.md § A |
| `processed_total` is build-only (specialists plus Conductor); `partial` means the sum of the shares present, with the missing share named in a `_note` | docs/run-accounting.md § B2.3, § B4; templates/accounting.json |
| `rework_ratio` = processed tokens on rework spawns / processed_total; its confidence follows processed_total | scripts/account-tokens.sh (rework_ratio block); templates/accounting.json |
| Accounting is attempted on every terminal exit, not only success | docs/run-accounting.md § B |
| Limit: `cost.currency_estimate` is always `{value: null, confidence: "unavailable"}`, "no token/cost source in scope for v1": it counts tokens and time, not dollars | scripts/account-run.sh (cost block); templates/accounting.json |
| thebureau.dev, novadiem.com | README.md "Further reading" |

## Where the numbers come from

- **Plates I to VI (the ledger): illustrative**, labelled "ILLUSTRATIVE FIGURES" on the card and
  "RUN · ILLUSTRATIVE" on plate I. Six attempts: analyst-1 1.2M, architect-1 5.4M, challenger-1
  2.9M (no-handoff), challenger-2 3.1M (rework), architect-2 4.6M (rework), spellwright-1 on a
  second host (UNKNOWN), conductor 6.0M. processed_total 23.2M partial; rework 7.7M of 23.2M =
  0.33. The arithmetic is consistent.
- **Plate VI (the real run card): real**, from
  `~/Code/novadiem/bureau/.bureau/runs/20260812-posthoc-token-accounting/accounting.json` (a
  feature run on the Bureau itself, accounted 2026-08-13): 22 entries in `specialist_spawns`; 1 with
  `reported_status` no-handoff (critic-4); 14 with `rework: true`; 9 with no token fields (critic-4
  plus 8 spawns on a non-Claude model); `tokens.rework_ratio` 0.5616, confidence `partial`;
  `reviewer_tokens` confidence `unavailable` with the note ending "reviewer share is a real gap,
  not a clean zero" (the plate's red quote). That note string is still in scripts/account-tokens.sh
  on origin/main.
- That run was accounted by the older token pipeline (SPAWN-TOKEN-EVENT lines), so its missing
  token fields are absent rather than `unavailable`; the film says "no token figure", which is true
  either way.

## Changed or simplified, on purpose

- SPAWN-EVENT lines are shown with two or three keys (`attempt_id`, `status`, `rework`). The real
  line has seven required keys plus `at`.
- The ledger's columns (attempt, host, status, rework, tokens) are a reading of
  `specialist_spawns[]`, not its literal layout. "Host" stands in for the runtime; no vendor or
  model names on screen.
- Token figures are shown as one "processed" number per row in millions; accounting.json splits
  input, cache_creation, cache_read and output.
- Delegate and reviewer shares are left out of the illustrative ledger (they sit outside
  processed_total); the reviewer gap appears only on the real run card.
- The no-handoff cause ("rejected" by the verdict gate) is borrowed from the real run's log
  (challenger-4: "verdict-gate rejected record schema").
- The bottom bar is a run's accounting sequence (SPAWN-EVENTS, CLOSE-OUT, TRANSCRIPTS,
  ACCOUNTING.JSON): the stage of the story, not run progress.
- Nothing is drawn dashed: every part shown exists on origin/main.

## Plates (score seconds)

| Slot | File | Window | Red |
|---|---|---|---|
| c1 | c1-bill.html | 0-9.03 | WHAT DID IT COST? |
| c2 | c2-ledger.html | 9.03-19.18 | none |
| c3 | c3-discard.html | 19.18-30.79 | RECORDED, NOT DROPPED |
| c4 | c4-rerun.html | 30.79-40.94 | ORPHAN TERMINAL: SKIPPED |
| c5 | c5-unknown.html | 40.94-55.05 | UNKNOWN (the token cell) |
| c6 | c6-total.html | 55.05-73.14 | "a real gap, not a clean zero" |
| c7 | c7-limit.html | 73.14-87.5 | Unknown stays unknown. + colophon |

Device: the ledger (`LG.ledger` in index.html), redrawn in each plate's opening state; event tags
(`LG.tag`) carry each SPAWN-EVENT line to its row.

Score: score-library `bureau-art-pop-bureau-run-cost/take-02.mp3` (sha256 5c53868a...3168), no
splice. take-01 had about 5 s of silence at 52.7 s and was not used. Plucks only to 19.1 s, bass in
at 19.1 (the discarded review lands there), brighter top from ~38 s, full to 85.3, decay to 87.7.
`beats.json` is librosa's grid (0.4412 s gap), extended to both ends.
