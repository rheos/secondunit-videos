# rheoStream explainer: build state

Narrated blueprint explainer for rheoStream. Draft 1 ("One System You Own", 102.5 s, music only,
https://youtu.be/168-OWHkdvU) is in git history before rheos/secondunit-videos#286. **Draft 2** (2026-10-21) is
a new film from `~/Code/novadiem/assistant/ideas/rheostream-video.md`: one inquiry followed through the whole
system, ten plates, narrated by George, in the rheo theme (mint line on deep teal) with the plates drawn as
hydraulic works in section. Built on the Recallatron draft 2 pattern (narration as the clock, the kit's
engagement layer, sound on every event). Tracking: rheos/secondunit-videos#286.

## Draft 2: how it's made

- **Narration is the clock.** George (ElevenLabs v4, voice JBFqnCBsd6RMkjVDRZzb) reads one segment per plate
  (`vo/vo.py`, script in the file). The names are spelled for him: "Ree-oh Stream", "Ree-oh", "Recall-a-tron".
  Whisper hears "Rio Stream" and "Recolletron"; check both by ear.
- **Pace.** His calm read of the approved ~400-word script ran 162 s. eleven_v4 ignores `voice_settings.speed`
  (a second take at 1.1 came back the same length), so `vo/pace.py` plays each segment 10% faster with ffmpeg
  `atempo`, which keeps the pitch. Speech is 147.5 s.
- `vo/align.py` times the words (faster-whisper small.en, timing only), `vo/timeline.json` places the plates
  (lead 0.6 s, 1.6 s for plate I; tail 1.7 s, 4.5 s for X), `vo/place.py` writes `_in/voice.wav` and
  `vo/words.js`; plates cue with `VO.w(plate, word)`. Plate starts: I 0, II 18.14, III 35.48, IV 52.08,
  V 70.18, VI 86.34, VII 105.38, VIII 123.06, IX 136.48, X 148.64; end 168.94. Each slot opens 0.6 s early
  and closes 0.8 s after the next plate starts, so plates hand over.
- **Length.** 168.9 s, not the script's "about 140 s": the approved narration is about 400 words, and at
  George's pace that is 2:30 of speech. Getting to 140 s means cutting lines, which is Robin's call.
- **Score bed:** score-library `current-rheostream/take-01` (rheos/indieagent-workspace#61, merged), Music v2.5,
  seed 90, ten sections sized to the plates, sha256 `e20fcf82...fe6dc`. Copy it to `_in/score.mp3`.
- **Sound:** `node ../tools/blueprint-kit/cues.mjs novadiem-rheostream` -> `cues.json` (2,070 cues);
  `python3 ../tools/blueprint-kit/holdcheck.py novadiem-rheostream` (0 short);
  `<viralvision venv python> -I ../tools/blueprint-kit/sfx.py novadiem-rheostream --voice _in/voice.wav --end 168.94 --score-db -15`
  -> `_in/mix.wav`, the root `<audio>`. Mix -14.5 LUFS, peak -1.5 dBFS. The kit gained waterworks sounds for
  this film (gate, valve, water, chime).
- **Shared parts:** `window.RS` in `index.html`: the inquiry (`dot`, `put`, `ride`, `arrive`), basins, gates,
  houses, record cards, callouts, stamps. Particle moves are straight `fromTo` segments, each starting where
  the last ended, so any frame renders the same out of order.
- `hyperframes lint` and `check` pass. The five layout notes are plate II's push-in carrying the statement
  over the bottom bar for half a second.

## Facts

Only the script's "What's true" list (rheos/rheostream `docs/guide/` at 63f3658). Spot-checked against the
guide: the four modules (Leads, Current, Recallatron, Relationships) on a small core; the `202` after the
commit; "no token can approve" covers every token; the export carries the same identifiers and a digest;
restore brings approvals, operations and credentials back waiting for a person. Present tense throughout and
nothing drawn dashed; the end card names it as the design.

Made up for the screen: the inquiry (Avery Lund, avery@lund.example, "Lund studio site"), the other party of
the same name, the draft reply, the alert ("backup check failed"), the note, the memory's reason. No real
names, keys or numbers. "Not ten" on plate VIII is the approved line, rhetorical.

## Delivery (2026-10-21)

Robin approved draft 2 for the sites. YouTube title changed to "How rheoStream works, by design" (still unlisted,
Novadiem Studio). Placed on novadiem.com/video/explainers in its own narrated group (rheos/novadiem.com#221,
deployed), rheo.stream's explainer section (rheos/rheo-stream-site#52, deployed) and the rheostream README
(rheos/rheostream#453); draft 1 is off all three. Upwork and MOL still link draft 1.

## Draft 3 (2026-10-24)

Robin: don't make a beat of "every workspace is its own database"; most people run one workspace locally, and
separate databases only matter for the hosted architecture. Plate II's line is now "Your records live in your own
Postgres" (only segment II re-recorded, lead 1.4 s; plate starts unchanged, so the score and every later cue stay
put). The second workspace box and its blocked probe are gone; a Postgres cylinder labelled YOUR RECORDS sits beside
the core. Ownership as a beat is plate X (one file, same identifiers). Draft 2's plate II voice files are kept in
`_in/draft2-vo/`.

https://youtu.be/pFBLNHC59XU (unlisted, Novadiem Studio, link sent to Telegram), 169 s at 720p
(`renders/rheostream_draft3_720p.mp4`). Checks: lint and check pass, holdcheck 0 short, flashcheck PASS, -14.5 LUFS,
peak -1.3 dBFS, MP4 frames match the snapshots. Re-recording cost about 90 credits. Draft 2 (T7i6fdqUPzc) is retitled
"(draft 2, superseded)" and points at draft 3. Draft 3 replaced draft 2 on novadiem.com (rheos/novadiem.com#233),
rheo.stream (rheos/rheo-stream-site#61) and the README (rheos/rheostream#474).

## Draft 2: plates

- **I · The Pile.** Five pools in section with streamlines that dead-end at their walls; FINDS THE WORK,
  TRACKS IT, REMEMBERS; agent routines stitched between them; the lids come down ("trap your history");
  LEAD reaches for PROJECT and is crossed out. "Your working life, in a pile of tools."
- **II · One Current.** The lids lift and the pools drain into one channel inside ONE SYSTEM YOU OWN (your
  records in your own Postgres, drawn as a cylinder beside the core; draft 2 had a second workspace here). Four mill houses (Leads, Relationships, Current, Recallatron) on the CORE; agents come down ONE DOOR.
  The particle appears at the inlet. Push in on it.
- **III · The Intake.** Your website seals the inquiry (signed with its key), the sluice checks connection,
  timestamp, signature, then opens; receipt, payload and event land in one chamber, ONE COMMIT; only then
  202 ACCEPTED runs back. A resend with the same event id is absorbed by the receipt: STILL ONE LEAD.
- **IV · The Lock.** The save, its audit row and its event in one lock chamber; both gates shut: ONE COMMIT.
  A worker (a mill wheel) leases the job on a dial; PROCESS DIES; the lease RUNS OUT; ANOTHER WORKER runs it:
  DONE ONCE (its dedup row commits with its effect). BROKER and WORKFLOW ENGINE struck; ORDINARY TABLES.
- **V · The Junction.** The inquiry (Avery Lund) meets a party of the same name; the gate OPENS ONLY ON
  EVIDENCE A CONNECTION PROVED; A QUESTION FOR YOU, NOT AN ANSWER; their history pushes toward the gate and
  is stopped: ONE PERSON'S HISTORY, SHOWN TO ANOTHER. A merge is an alias, a stop log that lifts out.
- **VI · The Door.** Claude, Telegram and voice converge on one culvert through the workspace wall; ITS KEY
  (one workspace; read · qualify · draft); RHEO behind it with a runtime slot cycling Claude CLI, OpenRouter,
  Codex CLI; it reads the lead, writes a DRAFT REPLY stamped A RECORD; the outlet gate shuts: NOTHING LEAVES.
- **VII · The Gate.** RHEO PROPOSES (hand this lead to Current, an external step); the gate drops: APPROVAL
  REQUIRED; YOUR APPROVAL bound to a digest of this exact payload; three keys crossed; CHECKED AGAIN AS IT RUNS;
  DAY ONE APPROVED, DAY TWO PERMISSION WITHDRAWN, DAY THREE RUNS: REFUSED. The gate lifts and it rides on.
- **VIII · The Channel.** NOW IT IS WORK in Current; an alert fires down its inlet again and again into ONE
  ITEM that WAKES, REOPENS, CLIMBS a priority ladder; YOUR NOTE stays AS YOU WROTE IT.
- **IX · The Reservoir.** A memory settles into Recallatron: why, who may read it, for what, from this
  opportunity, linked back to it; the opportunity is erased and the memory sinks: ERASED TOGETHER.
- **X · Yours.** The whole workspace in miniature, an audit row ticking for every change; sealed as ONE FILE
  (the same identifiers, its digest), it travels and lands ANYWHERE, arriving waiting for you (approvals,
  operations, credentials) and FIRES NOTHING. End card: "Your working life, in one current." /
  "How rheoStream works, by design." / RHEO.STREAM · AGPL-3.0, the particle riding one long streamline.

## Draft 2: the cut

https://youtu.be/T7i6fdqUPzc (unlisted, Novadiem Studio, uploaded 8:22 pm Oct 21; link sent to Telegram),
169 s at 720p (`renders/rheostream_draft2_720p.mp4`, sha256 `93c16cf2...b5f1`). flashcheck PASS (0 flashes);
-14.6 LUFS, peak -1.2 dBFS; holdcheck 0 short; frames from the MP4 match the snapshots. Renders and the score
copy stay in this worktree, outside git.

Cost: narration 1,987 ElevenLabs credits (two takes of 2,263 characters; v4 bills about 0.44 a character; the
first take, with an "unhurried" tag, is kept in `_in/take1/`), score 2,323 credits. 4,310 in all, against an
estimate of about 4,500. Not yet heard by Robin: the voice/score balance (score 15 dB down,
ducked), the effects level, the 1.1 pace and George's "Ree-oh Stream".
