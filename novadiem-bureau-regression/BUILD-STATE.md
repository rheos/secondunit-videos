# Build state: The Tripwire (Inside the Bureau, deep dive 11)

**Draft 1 BUILT 2026-10-18**: https://youtu.be/27DeuVqxgIg (unlisted, default channel). Seven plates,
86.9 s, 720p, kit `paper` theme (The Cold Read's look). `hyperframes check` passes; flashcheck PASS
(worst 0.5 flashes/s); -13.9 LUFS, peak -1.7 dBFS after +1.8 dB and a limiter in the remux (the raw
render was -15.3 LUFS, peak -1.3). Only the last 1.1 s is silent. Local master:
`renders/bureau-regression_take01_draft1.mp4` (gitignored). Next: Robin's notes.
Question: how does a failure become a check? Point: a failure is written down as a committed,
mutation-tested fixture, and the next run's re-run gate trips on it before any coder is
dispatched. Limit: a fixture catches only what it asserts.

## Facts used (all from ~/Code/novadiem/bureau at origin/main 939f522, read with `git show`)

| On screen | Source |
|---|---|
| Lessons from repeated failures become conventions, script changes or committed fixtures (plate II caption, the three boxes) | README.md § Regression checks |
| The suite covers artifact binding, verdict validation, run isolation, accounting integrity and gates (plate V drawer tabs) | README.md § Regression checks |
| The real case: the Conductor is an LLM and typed plausible stamps; planning-run logs drifted to round hours (00:00 to 07:00) | commit 0e2983c message (2026-07-10) |
| Convention box: "timestamps are shell-computed, never typed" | commit 1321e89 (docs canon) |
| `TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"`, "the ONLY source; never an argument" | commit 0e2983c message; scripts/log-append.sh |
| Fixture 135 file name and its five fields (name, command, expected, phase `135 · framework-hardening`, owner `scripts/log-append.sh`), values abridged | .bureau/regression/135-log-append-real-timestamp.md; docs/conventions/regression-fixtures.md § format |
| The five assertions (ISO-8601 UTC, within 5 s of `date -u`, never a 00:00:00Z placeholder, monotonic, never clobbers log.md) | fixture 135 `command`/`expected` |
| "A fixture passes when its command exits 0" | .bureau/regression/README.md; .bureau/regression/run.sh |
| Mutation A, `TS="2026-01-01T00:00:00Z"`, and the runner output `FAIL exit=1 135-…` / `last output: FAIL: TS1 is 00:00:00Z placeholder, not a real clock read` | fixture 135 `expected` (MUTATION A) and its FAIL string; run.sh output format |
| Every fixture is mutation-tested by its author (the script cannot do it) | docs/conventions/regression-fixtures.md § Mutation-test requirement; scripts/README.md § promote-fixtures.sh |
| Cold review the same day found B1 (heading-only call could hang on a stdin that never closes) and B2 (fixture 135 shared the blind spot, passed only because run.sh's stdin reaches EOF); NO-HANG assertion with a 2 s bound; "pass=141 fail=0 skip=4" | commit 5070dee message (2026-07-10, 26 min after 0e2983c) |
| 327 fixture files, 93 `retired:`, 2 `slow:` on main | counted with `git ls-tree` + `git show` over `.bureau/regression/[0-9]*-*.md` at 939f522 (2026-10-17) |
| Retired fixtures are kept as the record of a deliberate breaking change | docs/conventions/regression-fixtures.md (`retired:` flag) |
| Two ways in: committed with a framework fix (135), or promoted at a build run's close-out from `RUN_DIR/regression/` by `promote-fixtures.sh` | .bureau/regression/README.md § Lifecycle; scripts/README.md § promote-fixtures.sh |
| The gate: before any coder dispatch the Conductor shells `sh .bureau/regression/run.sh`; a failure blocks the prompt; the log names the fixture file, the command and the failing output | workflows/execute-plan/build-tail.md step 6 (prior-fixture re-run gate, standing-suite gate) |
| Fixtures 133 and 134 are live and run just before 135 (run.sh globs three-digit fixtures in order) | .bureau/regression/ file list; run.sh |
| Dashed: the Bureau's CI does not run this suite (it runs check-framework.sh and parse checks) | .github/workflows/checks.yml |
| The Systemsmith is the backend coder | workflows/execute-plan/build-tail.md step 6 |
| thebureau.dev, novadiem.com | README.md "Further reading" (as films 9 and 10) |

## Real vs illustrative

- **Real:** the failure pattern (round-hour stamps), the fix line, fixture 135's name, fields and
  assertions, mutation A and its exact FAIL output, the cold-review blockers and the 141/0/4 suite
  result, the suite counts, the gate's behaviour, fixtures 133 and 134.
- **Illustrative (labelled on screen):** the four log.md lines in plate I (date 2026-07-09 and the
  role headings are made up; labelled "RUN · ILLUSTRATIVE" with a caption naming the real pattern
  and commit); the later build run in plate VI ("LATER · A NEW BUILD RUN · ILLUSTRATIVE",
  "WORKTREE · ILLUSTRATIVE"): prompt 03's edit `TS="${STAMP}"` and prompt 04 to The Systemsmith are
  synthetic. The runner output it shows is what run.sh would print for that edit: with `STAMP`
  unset the stamp is empty and fixture 135's first assertion prints `FAIL: echoed TS1 [] not
  ISO-8601 UTC`. No real run is known to have tripped fixture 135.

## Drawn dashed

- "CI ON EVERY PR · not wired to this suite" (plate V). The suite runs at the re-run gate and at
  promotion, not in the Bureau's GitHub checks.

## Changed or simplified, on purpose

- Fixture field values are abridged (`…`); the real `command` is about 90 lines of shell.
- Plate I's log lines omit the event lines that sit under real headings.
- The drawer's faint card edges (about one in four) stand for retired fixtures; they are not
  one-to-one.
- The bottom bar is the order a failure becomes a check (FAILURE, FIX, FIXTURE, MUTATION TEST,
  STANDING SUITE, RE-RUN GATE): the stage of the story, not run progress.
- Fixture 135 went straight into `.bureau/regression/` with its script (a framework-hardening
  commit); the promote path is shown as the other way in, not as 135's route.

## Plates (score seconds)

| Slot | File | Window | Red |
|---|---|---|---|
| c1 | c1-typed.html | 0-9.87 | TYPED, NOT READ |
| c2 | c2-fix.html | 9.87-19.37 | none (the slip is red-edged) |
| c3 | c3-fixture.html | 19.37-31.25 | never a 00:00:00Z placeholder |
| c4 | c4-mutation.html | 31.25-43.12 | The check must fail. |
| c5 | c5-suite.html | 43.12-61.53 | The check had a blind spot. (first half only) |
| c6 | c6-gate.html | 61.53-79.64 | BLOCKED BEFORE DISPATCH |
| c7 | c7-limit.html | 79.64-86.9 | It catches only what it asserts. + colophon |

Device: the failure travelling into a check (`TW` in index.html). The slip (a typed stamp) tears
off the log, branches into convention, script and fixture, lands on fixture 135's red assertion;
the 135 card drops into the standing suite's drawer and hangs on the next run's gate as the wire.

Score: score-library `bureau-art-pop-bureau-regression/take-01-edit.mp3` (sha256
4fd2b8811c048b1112664b4a51d728aae88486e6dc103781e9945ebd03e10fbd), 89.95 s, ~101 BPM. take-01 had
two mid-track gaps and the retry was worse; the edit loops the 8 beats before each gap (recipe in
the score folder's NOTES.md). Thin 0-19.4 s, full 19.4-61.5 s, thin 61.5-76.0 s (the next run
approaches the gate), full from 76.0 s (the stamp lands on the return), decays to silence at
85.7 s. Beat grid `beats.json`.
