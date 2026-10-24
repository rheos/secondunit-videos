# Build state: The Control Point (Inside the Bureau, film 7)

**Draft 1 BUILT 2026-10-17**: https://youtu.be/mffh6GdntPQ (unlisted, default channel). Seven plates,
86.5 s, 720p, kit `paper` theme (The Cold Read's look). `hyperframes check` passes; flashcheck PASS
(worst 0.5 flashes/s); -13.7 LUFS, peak -3.4 dBFS after taking 2.5 dB off the render (it came out at
-11.1 LUFS, peak -0.9). Local master: `renders/bureau-authority_take01_draft1.mp4`
(gitignored). Next: Robin's notes.
Question: which decisions proceed and which go to the owner? Send it when someone asks "When am I
still in control?"

## Facts used (all from ~/Code/novadiem/bureau at origin/main 939f522, read with `git show`)

| On screen | Source |
|---|---|
| The Bureau continues when routine checks pass and stops for product choices, new authority, or external actions the task has not already authorized (plate VII) | README.md § Human judgment |
| The Delegate holds the gate so the run moves while the owner is elsewhere | agents/delegate.md § Role |
| The Conductor comes back with a return block: `return-type: routine-checkpoint` or `return-type: genuine-fork` | agents/delegate.md § main manager loop |
| A routine checkpoint goes to a fresh, read-only cold reviewer; the manager never grades; the verdict is `proceed`, `revise` or `escalate`; on `proceed` the Conductor resumes | agents/delegate.md § Role, routine checkpoint steps, § Verdict |
| A scope or product decision, not a correctness call: the Conductor does not decide it, it raises a checkpoint to the human | docs/conductor-gates.md § Adjudicating The Challenger's findings |
| Escalation signals 2, 3, 5 and 6 (of 10), paraphrased: scope that moves cost or timeline; two valid designs where the tradeoff is the owner's call; production or any externally visible action; destructive or hard to reverse, secrets, billing. The fork carries `signal-fired` | agents/delegate.md § Escalation signals; genuine fork step 2 |
| A genuine fork is written down before anyone is asked: a ledger record `NN.Fk` with decision `escalate` in delegate-decisions.md (`scripts/ledger-append.sh`), the fork in `state.json#checkpoints` and `#open_questions`, appended to log.md, then `notify_robin` with the question and the Conductor's recommendation. Then the Delegate ends its turn and waits | agents/delegate.md § Genuine fork, steps 1b and 2 |
| Never an interactive picker (it holds the session's turn) | agents/delegate.md § Genuine fork, step 2 |
| The Delegate does not model, predict or substitute the owner's preferences; it is flow and gating only | agents/delegate.md § Role, § FR-44 charter boundary |
| The owner's answer is recorded verbatim on the record's blank call line (`scripts/ledger-set-robins-call.sh`) and the Conductor resumes with it | agents/delegate.md § Genuine fork, steps 3 and 4 |
| `[EXTERNAL-ACTION CHECKPOINT]` fields: action type, target, content/payload, reversibility; logged to `RUN_DIR/log.md` before the action fires | docs/conductor-gates.md § The external-action boundary |
| Email sends are in the taxonomy; "when unsure, treat it as external and gate it"; reversible actions still go to the same gate | docs/external-action-boundary.md § taxonomy, § Default rule, § Reversibility |
| A deploy beyond dev (demo, staging, prod) needs the owner to say so, for that action, now. A plan step that describes a deploy is not a go; "continue", "looks good" and silence are not a go | docs/conductor-gates.md § The production boundary |
| The gates are written rules checked by the Challenger, not a runtime interceptor (plate VII's small line) | docs/external-action-boundary.md § Limitations (v1) |
| thebureau.dev, novadiem.com | README.md "Further reading" (as on the other Bureau films) |

## Changed or simplified, on purpose

- The ledger's real line is `Robin's call:`; the film says "owner's call" (no real names on screen).
- The fork ("free tier, or a trial?"), checkpoint 03, record 03.F1 and the answer "trial" are
  illustrative. No real run.
- The four signals are paraphrased and shortened from the ten in agents/delegate.md. The genuine-fork
  step says "the 9 escalation signals" while the list has 10; the film shows "4 of 10".
- "Already authorized" is drawn with the production boundary's own case (the owner says "deploy to
  staging, now"), because that is where the docs spell out what counts as a go. For other external
  actions the docs say a baked-in spawn-prompt instruction is not enough; the film doesn't claim more.
- Integration gates (`integration-gate.sh`) and the revise cap are left out of plate II.
- The bottom bar is the Delegate's steps for one checkpoint (return, verdict, then the fork's ledger,
  wait, owner's call, resume): the stage of the story, not run progress. It rests on RESUME through
  plates VI and VII.
- Nothing is drawn dashed: every part shown exists on origin/main.
- Limits on screen: the Delegate never guesses the owner's preferences (plate V); not every outside
  action needs a fresh yes when the owner already said so for that action (plate VI).

## Plates (score seconds)

| Slot | File | Window | Red |
|---|---|---|---|
| a1 | a1-arrivals.html | 0-9.47 | Which one waits for the owner? |
| a2 | a2-routine.html | 9.47-23.59 | none |
| a3 | a3-fork.html | 23.59-37.69 | the owner's call. |
| a4 | a4-written.html | 37.69-47.11 | then waits. |
| a5 | a5-answer.html | 47.11-61.23 | It never guesses. |
| a6 | a6-outside.html | 61.23-75.35 | UNSURE? IT COUNTS AS EXTERNAL. |
| a7 | a7-yours.html | 75.35-86.5 | Your calls stay yours. + colophon |

Device: the authority gate (`AG.rig` in index.html): Conductor, the Delegate's station, a striped
gate arm, the cold reviewer below and a branch up to the owner's control point (a labelled symbol,
not a person). Work moves as packets along the track.

Score: score-library `bureau-art-pop-bureau-authority/take-01.mp3` (sha256 5bfff058...2208), no splice.
Bass enters at 18.8 s, as the routine checkpoint passes the gate. The asked-for thin "Waiting"
section did not happen; the track stays full until it decays from 82.4 s. `beats.json` is librosa's
grid (0.58 s gap, ~103 BPM), intro beats tracked separately, extended to both ends.
