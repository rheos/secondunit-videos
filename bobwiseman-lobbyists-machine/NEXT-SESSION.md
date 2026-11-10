# NEXT SESSION: Lobbyists at Parliament, whole song (draft 3 = draft 2 + intro scat, 2026-11-10)

Draft 2 is built, merged, audited and rendered. Robin started watching it and gave one note so far: the intro
scat (vocal at 0.33-3.2 s, five syllables) needed something happening. He picked machine-only, no lettering. Built in
sec-attic.js: per syllable the crank is yanked a notch, the ram ratchets up, a pawl on the press pulley clacks, and a
marquee bulb on the RECORD LABEL sign lights; all five flash on the stamp. Draft 3 =
`out/lobbyists_machine-d3_f0-f6446_24fps_draft.mp4`: a local render of 0-4.58 s spliced at frame 110 (mid camera move)
into draft 2's picture, draft 2's audio copied. Wide shots later in the song were not re-rendered, so the unlit bulbs
show up there only on the next full render. Audit 0-8 s passes; flash check passes.

## Load first
1. Skill `video-production` and its `references/revision-loop.md`.
2. Memories in `~/.claude/projects/-Users-robin-Code-novadiem-indieagent/memory/`: `bob-lobbyists-at-parliament`,
   `rescue-machine-look-test`, `robin-watches-before-bob`, `characters-not-marionettes`, `text-fits-container`,
   `new-look-new-cast`, `parallel-sessions-on-this-mac`.
3. In this folder: `README.md`, `out/d2/AUDIT-d1.md` (merged audit, Robin's rulings, Do not touch),
   `out/d2/BRIEF.md`, `out/d2/PROMPTS.md`, `out/d2/AGENTS.md`, `out/d2/SONGMAP.md`. The `out/` files are local only.

## Where things are
- Worktree `~/Code/novadiem/indieagent/secondunit/_wt-lobbyists`, branch `look/lobbyists-machine`, issue
  rheos/secondunit-videos#476, draft PR #477. Draft 2 code: commits 08f3938 (six sections + cast.js badge fix) and
  69969ec (sec-frame.js: jukebox stages and outro).
- Draft 2 render: `out/lobbyists_machine-d2_f0-f6446_24fps_draft.mp4` (720p, 6446 frames, song 0-268.6, GitHub
  render 531 s, 0 bad frames). Flash check passes (worst second: 3 flashes at 258.8, round 7's pull-out, at the limit).
  Not uploaded anywhere.
- Full motion-lab audit 0-268.6 on the merged page: all checks pass (`out/d2/audit-full.txt`).
- Test 01 (approved): `out/lobbyists_machine-test01_f480-f1284_24fps_draft.mp4`.
- Builder sandboxes `out/d2/sb/b1..b7/proj/`; the coordinator sandbox `out/d2/sb/coord/proj/` equals `js/` exactly.
  Coordinator sheets: `out/d2/sb/coord/*.jpg` (before/after vs test 01: `ba1.jpg`, `ba2.jpg`; hand-offs and outro:
  `handoffs.jpg`).

## What draft 2 is
One machine for the whole song, sections in order: attic (RECORD LABEL press, the minder's wing, FRIGHT-O-METER, RETURNS
box jack-in-the-box, mic fan), test 01 with every critic fix and a jackpot on hook 2's last word, floor 1 (opinion ruler,
press blizzard, the Shoveller, THE ACTION pie, hook 3's 50 cent cabinet), floor 2 (FIX-O-METER, LOBBY shell game,
REPUTATION scale, the coin as door knocker through hook 4), floor 3 (opinion loop, piggy escalator, WIN A JESTER claw,
BUSINESS RULE No. 1, drum stack and CONFETTI cannon), basement (coin wash, pump jack, DUPED, PAYOLA monitor, the busts'
noses, APPROVED stamp into the slot), and the jukebox in three stages (J1 held whole 52.75-53.75, J2 at 115.2-118, J3 at
166-182) plus the outro: seven rounds diving into the base window, smaller, faster, darker, the machine eating the Rocker
(cello, guitar lever, squinting copies), back out to the empty bag, the coin out of COIN RETURN, SELECT YOUR HIT lit on
the last chord.

## Known soft spots (for Robin's notes, not fixed)
- Floor 2's move from the lobby down to the scale (about 100.8) smears the frame; legal (lettering past its hold) but reads
  close to a whip.
- b7's zoom into verse 6 (180.4-182) blurs up to 43 px/frame; instrumental, before any lettering.
- At 155.9 the last comic bursts touch edges; no word covered.
- Outro: the nested machine is small, and the Rocker keeps his fixed grin (cast.js has no deadpan mouth; a `face: 'flat'`
  option would be needed for rounds 3-5).
- Hook 3 and hook 4 tick counts (10 and 11) are beat grids, not checked by ear. A hold-key TAP pass would settle them.
- The guest-and-critic open ruling on the Shoveller stand-in: Robin approved him with the new cast line-up.

## Next
1. Robin watches draft 2 (local file, VLC). Build his notes; artist notes are the brief.
2. Only on his say-so: upload unlisted (`secondunit-worker/yt_upload.py`, link to Telegram), then Bob's review page
   (`client-review` skill). Robin watches before Bob.
3. After sign-off: 1080p master on GitHub (no --draft), 9:16 redraw, 4:5 cut.
