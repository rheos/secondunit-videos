# Bob Wiseman, handoff snapshots: history

Moved verbatim from the IndieAgent memory `bob-wiseman-videos` on 2026-10-31. Current state and standing rules stay in that memory.

## HANDOFF: Bob batch 2026-10-13

The session doing Bob Wiseman's songs ran out of quota on 2026-10-13 with agents mid-build. Each issue in rheos/secondunit-videos has a "Handoff" comment with working paths, what may be half-done, render recipes and checks:
- #116 You Don't Love Me draft 6 (wave ending simpler, head pivots on the high note, funnier Pips).
- #117 Giulietta Masina: lyrics on screen, plus three 30 s 9:16 verse clips (copy Me and Jimi's method, #104 / PR #105).
- #118 Libelous: three whole-song versions, one look each (woodcut, fact sheet, TV news); plan in bobwiseman-libelous/BRIEF-round3.md.

Already delivered to Bob 2026-10-13: YDLM draft 5, Giulietta v4, Libelous draft 1, Me and Jimi with lyrics + 3 verse clips (YouTube, the file drop, novadiem.com/video/bob-wiseman). Robin reads Bob on Messenger; paste works if Chrome access is off. See `open-media-automatically` (IndieAgent memory).

Standing: little Bob + Junos walk through every Bob video (Bob 2026-10-11; outro-bob.js in bobwiseman-you-dont-love-me, drawn in each video's look).

## HANDOFF 2026-10-20 evening (Robin switching accounts)
Bob's page: https://files.novadiem.com/d23bb3f3f30a1172/ (workspace 6). Links log: rheos/secondunit-videos#122.
**On his page now:** Reform Party draft 30 (8cNxn4FmLk8, round 57), You Don't Love Me draft 14 (nZ4UsTEDAAs, round 55), Travel Agent draft 17 (x7hMY6zNyg8, round 56), Real Thing "Which look?" (round 53, 16 s loops), 10,000 Miles draft 1 (round 43, Bob: "wait on this one"). In Her Dream FINISHED (v4c finals on downloads, round 51 closed).
**Open Bob notes (left 7:16-7:28 pm Pacific):** 41 Travel Agent (Mary through to the end, no name), 42 YDLM (tea-leaf reader as John Cleese, fingered hand), 43 Reform Party (teeth stop when each buh phrase ends: 0:39/41/43/46). Real Thing: he picked A pinball cel. Details in each song memory.
**Robin's open decisions:** (1) Real Thing: pinball redo of the gorilla film vs Respawn (draft 1 built, unposted, PR #270); (2) OK to do a Cleese-like reader; (3) mark notes 36-39 applied in the inbox (built into today's drafts; Bob still sees them open). Notes 37-39 and 36 should be marked with `round.mjs apply <note> <round>` (36 -> 54/57, 37 -> 55, 38 -> 53, 39 -> 56) once Robin agrees.
**Open draft PRs (unmerged, waiting on Bob):** #262 Reform, #264 YDLM, #266 Real Thing styles, #268 Travel Agent, #270 Respawn; #107 In Her Dream is finished and can merge (merge commit, never squash).
**Sessions (all idle):** ihd-finals local_660aac02, reform-teeth local_b687995d, ydlm-ending local_a3b2f766, real-thing-styles local_0bcfadf1, respawn local_c391ddac, travel-agent-beats local_a307cd45.
**How posting worked today:** a go relayed between sessions is blocked by the auto-mode classifier; Robin's go must be typed in the session that posts. Use the current round.mjs from rheos/novadiem-files main (the ~/Code/novadiem/novadiem-files checkout is on an old branch; the _wt/files-main worktree is at #42); spec needs "workspace_id": 6. Bob's YouTube drafts go to `--channel "Novadiem Studio"`.
**Run video sessions one at a time on the Mac** (`parallel-sessions-on-this-mac` (IndieAgent memory)); renders on GitHub Actions/Modal.
