# NEXT SESSION: Lobbyists at Parliament, whole song (paused 2026-11-10)

Paused by Robin mid-build of draft 2. Pick up at "Resume" below.

## Load first
1. Skill `video-production` (house rules: audio is the clock, review checklist, money, shared Mac) and its
   `references/revision-loop.md` (the loop this build is running: critics, guest, sandboxed builders, coordinator
   merge, cloud render).
2. Memories in `~/.claude/projects/-Users-robin-Code-novadiem-indieagent/memory/`: `bob-lobbyists-at-parliament`
   (this project), `rescue-machine-look-test`, `bob-test-song-queue`, `robin-watches-before-bob`,
   `characters-not-marionettes`, `text-fits-container`, `new-look-new-cast`, `parallel-sessions-on-this-mac`.
3. In this folder: `README.md`, then `out/d2/AUDIT-d1.md` (the merged audit and Robin's rulings),
   `out/d2/BRIEF.md` (shared builder brief: engine, hand-offs, rules), `out/d2/PROMPTS.md` (each builder's prompt),
   `out/d2/AGENTS.md` (builder map), `out/d2/SONGMAP.md` (every line's time). The `out/` files are local only
   (gitignored, they name the song's lines).

## Where things are
- Worktree `~/Code/novadiem/indieagent/secondunit/_wt-lobbyists`, branch `look/lobbyists-machine`, issue
  rheos/secondunit-videos#476, draft PR #477. Inputs copied into `work/` (gitignored): song mp3, vocal stem,
  settled lyrics, alignments, `work/cues-song.js` (built by `tools/song_cues.py`).
- Engine: `song.html` loads `js/pen.js`, `js/cast.js`, `js/core.js`, then sections in order: `sec-attic`,
  `sec-list` (test 01), `sec-floor1`, `sec-floor2`, `sec-floor3`, `sec-basement`, `sec-frame`. Song time
  throughout. On the branch, every section except `sec-list` is still a stub.
- Test 01 render (approved, "Looks great. Keep going."): `out/lobbyists_machine-test01_f480-f1284_24fps_draft.mp4`.
  It still has the old thumbs-up hand (fixed since in `cast.js`).
- Cast line-ups, all approved by Robin: `out/cast-lineup-1.png` .. `-3.png`.

## Decisions Robin made
- Whole song as one machine that keeps growing. Outro plan A: seven chanted rounds, each a dive into the jukebox
  window to find the machine again, smaller and faster, paper darkening; plus the guest's "machine eats the Rocker".
- All three passes: (1) fix test 01 per the critic, (2) the whole song on the guest's layout, (3) the guest's
  extras (jukebox turns out bigger at three pull-backs, APPROVED stamp before the outro, the machine eats the Rocker).
- The verse 3 figure is an invented stand-in, the Shoveller (no real face). New cast approved: hired minder,
  the Shoveller, bellhop, blank stone busts with big noses, cardboard opinion heads and jesters.

## State of draft 2 (stopped mid-build)
Seven builders worked in sandboxes `out/d2/sb/b1..b7/proj/` (each a full copy of the page; base copy in
`out/d2/sb/base/`). They were stopped when Robin paused. Every owned file parses. NOTHING is merged into `js/` yet.
- **b6 basement** (157.5-207.8): finished and audited (all checks pass). Coin wash, chute, pump jack, DUPED stamp on
  blank report cards, PAYOLA monitor with the bellhop watching, busts' noses lift on the last word, APPROVED stamp
  drops the coin into the jukebox slot at 207.8. Open: two frames where the lettering smears under camera blur
  (around 183-184 and 188-189); the follow-up was sent but not finished. It also works around the list section's
  pull-back leak in its own cam(); harmless once b2's file lands with `pullback: false`.
- **b1, b3, b4, b5**: well along (300-360 lines each) and were running their audits when stopped; no reports.
- **b2 list fixes, b7 frame and outro**: were rewriting their files when stopped; the sandbox files are their
  earlier state.
- The builders' code comments quote multi-word lyric fragments. Scrub those comments at merge, before any commit.

## Resume
1. ListAgents; don't start heavy work while another video build renders.
2. For each builder b1-b5 and b7: start a fresh background agent with BRIEF.md plus its prompt from PROMPTS.md,
   plus: "Your sandbox already holds your earlier work on your file (stopped mid-build, unreported): read it first,
   keep what works, finish the items, then report." For b6, only the smear follow-up (in PROMPTS.md).
3. Coordinator review (revision-loop.md section 4): read each builder's sheets, not just its report; check every
   hand-off (fixed points and times in BRIEF.md); `diff -rq out/d2/sb/base out/d2/sb/b<k>` to confirm each builder
   changed only its file; copy the files into `js/`, scrub lyric fragments from comments, commit and push.
4. Full motion-lab audit over 0-268.6 from the travel-agent folder (it has playwright):
   `cd ../../mv-projects/bobwiseman-travel-agent && node $WT/tools/motion-lab/audit.mjs $PROJECT/song.html 0 268.6 --width 1280 --height 720`
5. Stills at every hand-off and every pull-back, phone-size sheets, before/after against test 01 at the
   Do not touch moments.
6. Render on GitHub, not the Mac: `tools/cloud-render/cloud-render.sh --draft` from a throwaway worktree at
   origin/main (revision-loop.md section 5). It packages only page code, so check it picks up `work/cues-song.js`
   (it holds lyrics: it must go up as a draft-release asset and be deleted after, never committed). Name:
   `lobbyists_machine-d2_f0-f6446_24fps_draft.mp4`. Flash check, then open in ONE VLC window and stop.
   Nothing to YouTube or Bob's page without Robin's say-so.
7. Open questions for Robin's ear: hook 3 and hook 4 tick counts (beat grids of 10 and 11), and the second hook's
   10. A hold-key TAP pass (video-production rule 2) would settle them.

## Kickoff prompt
"Resume the Lobbyists at Parliament machine build. Read
~/Code/novadiem/indieagent/secondunit/_wt-lobbyists/bobwiseman-lobbyists-machine/NEXT-SESSION.md and do what it says."
