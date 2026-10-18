# Nothing Lost Mid-Job: build state

Music-only blueprint explainer, slate item 5 (slug `rheostream-durable`). Audience: developers
reading the public rheostream repo or devweb.org, and Upwork clients hiring for backend
reliability. Message: work in rheoStream is durable and accounted for, by construction.

## Facts used (rheos/rheostream `main` at 0e32b81, 2026-10-17)

Every claim on screen, with where it is true. Table, column, function and setting names are the
repo's own (public repo). The jobs, workers and timings on the plates are synthetic except where a
constant is cited.

- **Lease with SKIP LOCKED.** `acquire_lease` selects one due row `FOR UPDATE SKIP LOCKED` and sets
  `state = 'leased'`, `lease_owner`, `lease_until = now + lease_seconds`, and counts the attempt.
  `packages/core/src/rheo_core/work/jobs.py` (`acquire_lease`). Two workers never take the same job,
  and B does not block behind A's open transaction:
  `tests/postgres/test_job_repository.py::test_two_concurrent_workers_never_lease_the_same_job`.
- **Lease 60 s, heartbeat 20 s.** `LEASE_SECONDS = 60`, `HEARTBEAT_SECONDS = 20` in
  `packages/core/src/rheo_core/work/loop.py`; `extend_lease` pushes `lease_until` to `now + 60 s`
  (jobs.py). Doc: `docs/architecture/intake-and-events.md` § Jobs and the worker, steps 1-2.
- **Crash recovery is the expired lease.** The lease query's second arm, `state = 'leased' AND
  lease_until < :now`, "is the crash-recovery path: an expired lease is a dead worker, and
  re-acquiring counts the attempt" (jobs.py docstring). "Restart recovery is the expired-lease path
  and nothing else" (intake-and-events.md). Test:
  `test_an_expired_lease_is_reacquired_with_the_attempt_counted` (attempts 1 to 2, owner A to B).
- **A late worker can't overwrite the new owner.** Every finish is predicated on `lease_owner =
  :owner AND state = 'leased'` (`_held` in jobs.py). Test:
  `test_a_worker_whose_lease_was_stolen_cannot_finish_the_job` (`finish_succeeded` by A applies to
  0 rows; the row stays leased under B).
- **The outbox: the change and its event commit together.** `publish()` writes one
  `core.outbox_event` row and one `core.event_delivery` row per subscribed, enabled consumer inside
  the caller's unit of work and commits nothing, "which is what makes a state change and its event
  delivery one transaction" (`packages/core/src/rheo_core/events/publish.py`). A job's handler
  effects and its `succeeded` write share one transaction (intake-and-events.md, "The transaction
  boundary"). Test: `tests/postgres/test_outbox.py::test_a_rolled_back_publish_leaves_neither_the_event_nor_its_deliveries`.
- **Consumers run a handler once.** `core.consumer_processed`'s primary key stops a handler running
  twice (`packages/core/src/rheo_core/events/deliveries.py` docstring).
- **No audit path, no start.** `check_audit_paths(REGISTRY)` runs in `run_startup()` after
  `load_modules()` and raises one `RuntimeError` naming every non-READ operation whose module has no
  audit sink (`packages/core/src/rheo_core/operations/audit_paths.py`,
  `apps/core/src/rheo_app_core/startup.py`). Test:
  `tests/postgres/test_cli.py::test_startup_refuses_to_complete_when_an_operation_has_no_audit_sink`
  (module `harness`, operation `harness.note.write`, the names drawn on plate VI). Three layers:
  registration refuses a non-READ declaration with no `AuditSpec` (`operations/registry.py`),
  startup refuses a missing sink, dispatch refuses `audit_sink_missing` (`operations/dispatch.py`).
- Registry rows on plate VI are real operations: `current.project.get` (read),
  `current.project.update` and `current.area.create` (mutate), from
  `modules/current/src/rheo_current/operations.py`.

All three claims in the film brief held as stated. Nothing is drawn dashed for "not built": every
mechanism shown exists. Dashed lines here are construction lines (the missing heartbeat, the late
worker, the rollback that lands nothing, the colophon).

## Now: draft 1 (2026-10-17)

- Score: score-library `drafting-table-rheostream-durable/take-01`, sha256 fddeda3f...7917, 89.94 s,
  ~95.7 BPM, -12.7 LUFS, played at volume 0.9. `beats.json`: librosa beats 5.36-84.73, extended to
  0.32 and 89.77 at 0.63 s.
- Getting the score on a fresh checkout: copy
  `../score-library/drafting-table-rheostream-durable/take-01.mp3` (from `secondunit/`) to
  `_in/score.mp3`; `shasum -a 256` must print
  `fddeda3fd394b59eda55c58e93bf27b99bd658c289395e492f5d437cf7b27917`.
- Theme `rheo` from the kit. IBM Plex Mono from Google Fonts (pinned at compile time).
- Root 89.9 s. Plate starts on the score's sections: 0, 8, 22, 36, 50, 64, 80.
- Bar stations are one job's life through a crash: QUEUED 8, LEASED 15.98, LEASE EXPIRES 31.6,
  RE-LEASED 40.98, SUCCEEDED 52.23.
- `window.JB` on the root draws the `core.job` table (real columns, synthetic rows), the film's one
  device, plus row, swap and box helpers.

## Plates

- **I · Durable Work (0-8).** Title, rule, `JOBS, EVENTS AND AUDIT IN RHEOSTREAM`, and the
  `core.job` table with one queued row.
- **II · The Lease (8-22).** Three queued jobs. Workers A and B run `acquire_lease()`
  (`SELECT id ... FOR UPDATE SKIP LOCKED LIMIT 1`); A takes job 1, B hits the lock and skips to job 2.
  Rows go `leased`, `now + 60 s`, attempts 1. "Two workers. **Never the same job.**"
- **III · The Crash (22-36).** Job 1 under A on a lease clock (seconds since the lease). Heartbeats
  at 20 and 40 push `lease_until` to t + 80 and t + 100. A dies; no heartbeat at 60; NOW passes
  `lease_until`. "The worker dies. **The job doesn't.**"
- **IV · Recovery (36-50).** The lease query's two arms, the second highlighted ("AN EXPIRED LEASE IS
  A DEAD WORKER"). B takes the row: owner worker-b, attempts 2. Late A's `finish_succeeded` hits
  0 rows. "The lease **is the recovery.**"
- **V · The Outbox (50-64).** One transaction holding handler effects, `core.job -> succeeded`,
  `core.outbox_event`, `core.event_delivery`. COMMIT: all four land. ROLLBACK: none. Footnote on
  `core.consumer_processed`. "The change and its event. **One commit.**"
- **VI · The Audit Path (64-80).** `run_startup()` steps; the registry; `check_audit_paths()` scans
  it and flags `harness.note.write`; the RuntimeError; SERVE crossed out. Three layers footnote.
  "No audit path, **no start.**"
- **VII · By Construction (80-89.9).** Three guarantees as construction lines; "Durable and
  accounted for. **By construction.**"; `RHEO.STREAM · GITHUB.COM/RHEOS/RHEOSTREAM · AGPL-3.0`.

## Draft 1

https://youtu.be/jcp269KAwSI (unlisted, default channel), 89.9 s at 720p, 24 fps
(`renders/rheostream-durable_take01_draft1.mp4`, remuxed from the `-raw` render). flashcheck PASS
(0 flashes in any second); -13.7 LUFS, true peak -1.8 dBFS. Eight frames tiled from the MP4 match the
snapshots, moves included. Source grep: no real names, keys, amounts or vendors. Renders and the
score copy stay in this worktree (`renders/`, `_in/`), outside git.
