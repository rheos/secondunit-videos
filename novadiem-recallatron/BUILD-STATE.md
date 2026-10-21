# The Recallatron: build state

Narrated blueprint explainer for Recallatron, rheoStream's memory module. Draft 1 ("Memory You Can Correct",
90 s, music only, rheo theme, https://youtu.be/WsgYFYeal-c) is in git history and its notes are kept below.
**Draft 2** (2026-10-21) is a new film from `~/Code/novadiem/assistant/ideas/recallatron-video.md`: about 148 s,
ten plates, narrated, in recallatron.com's theme (an Edison-era exhibition and patent office; the plates are
period cyanotype patent drawings and two cream broadsheets), built on the kit's engagement layer (typed captions,
set type, stamps, filed cards, hand-off transitions, sound on every event). Tracking: rheos/secondunit-videos#279.

## Draft 2: how it's made

- **Narration is the clock.** George (ElevenLabs v4, voice JBFqnCBsd6RMkjVDRZzb, picked by Robin from four
  auditions on 2026-10-21) reads one segment per plate (`vo/vo.py`, script in the file; the name is spelled
  "Recall-a-tron" for him). `vo/align.py` times the words (faster-whisper small.en, timing only),
  `vo/timeline.json` places the plates (lead 0.6 s, 1.6 s for plate I; tail 1.2 s, 4 s for X),
  `vo/place.py` writes `_in/voice.wav` and `vo/words.js`; plates cue with `VO.w(plate, word)`.
  Plate starts: I 0, II 14.72, III 30.72, IV 47.0, V 65.48, VI 81.32, VII 100.26, VIII 110.84, IX 125.84,
  X 138.52; end 147.92. Each slot opens 0.6 s early (the `S` in each plate) so plates can hand over.
- **Score bed:** score-library `exhibition-hall-recallatron/take-01` (rheos/indieagent-workspace PR #60),
  sha256 `2131ffb5...6120`, ten sections sized to the plates. Copy it to `_in/score.mp3`.
- **Sound:** `node ../tools/blueprint-kit/cues.mjs novadiem-recallatron` -> `cues.json`;
  `python3 ../tools/blueprint-kit/holdcheck.py novadiem-recallatron` (0 short);
  `<viralvision venv python> -I ../tools/blueprint-kit/sfx.py novadiem-recallatron --voice _in/voice.wav --end 147.92 --score-db -15`
  -> `_in/mix.wav`, the root `<audio>`. Mix: -14.5 LUFS, peak -1.5 dBFS.
- **Facts** are the "What's true" list in the plan file (rheos/rheostream at 1305ca5); every period phrase maps
  to one. Memory contents are made up (staging on Postgres 17 then 18, a nightly backup time).
- `hyperframes check`: the remaining flags are intended (card B lands on A before A is filed; REV. 2 is pasted
  over REV. 1; the furniture's bar text sits under the two cream broadsheets).

## Draft 2: the cut

https://youtu.be/sdwqkS0sb5U (unlisted, default channel), 148 s at 720p
(`renders/recallatron_take02_draft2.mp4`). flashcheck PASS (worst 1 a second); -14.5 LUFS, peak -1.2 dBFS;
holdcheck 0 short; frames from the MP4 match the snapshots. Not yet heard by Robin: the voice/score balance
(score 15 dB down, ducked) and the sound-effect level are set by measurement, not by ear. Whisper hears the
name as "Recallertron" in plate III; check George's "Recallatron" by ear.

## Draft 2: plates

- **I · The Affliction (broadsheet).** LADIES & GENTLEMEN · WITNESS, the masthead set in type, a knife switch
  wired to a MEMORY lamp. "the stroke of the switch": the blade throws. Monday's telegram is typed, the switch
  throws again and its words fall away; Tuesday's is typed. The sheet is pulled up off the blueprint.
- **II · A Worse Affliction.** Notes tumble into a box, a cover slides over them (OUT OF SIGHT); an old card
  rises AS IF NEW with "WRITTEN: ? SOURCE: ?"; a PRIVATE note rides a pneumatic tube to another member's desk;
  the machine's needle spins: WHY DOES IT BELIEVE THIS? The old card carries on into III.
- **III · Anatomy of a Memorandum.** The card drawn large; KIND, WHO MAY READ IT, TO WHAT ENDS, WHERE IT CAME
  FROM, REVISIONS COUNTED called out on George's words; then a workspace note and a one-member note derive a
  memory stamped PRIVATE. The sheet travels left.
- **IV · The Recording Apparatus.** Your own machine: a session, SESSION ENDS (bell), the apparatus turns, the
  agent's lines dim, a scrubber passes over yours; SESSION ID, FOLDER PATHS, PROJECT NAME struck and STAYS HERE;
  an envelope with a keyed record leaves; the engine scrubs again, one model call, one memory, a receipt.
- **V · Of Changed Facts and Mistaken Ones.** Left: Postgres 18 arrives by tube, B is filed over A, A goes to
  the HISTORY drawer with a lineage line. Right: CORRECT( C, EXPECTED REV. 1 ), 02:00 struck, 03:00 typed,
  REV. 2, D derived from C dims and is stamped FLAGGED FOR REVIEW. Push in on the drawer.
- **VI · The Apparatus of Recall.** The question; the cabinet, the gate (NOT YOURS, RETIRED set aside), BY THE
  WORD and BY THE SENSE, COMBINED 1 / (60 + rank), EVERY SOURCE inspected, A SECOND READER on the premises,
  BEST FIRST.
- **VII · At the Next Sitting.** First prompt, the hook asks recall once; two cards laid before the machine under
  the hook's header, DATED stamps, A CLAIM TO CHECK, INSTRUCTION struck.
- **VIII · Of Forgetting.** FORGET: the memory and the two drawn from it fall away (deleted, not marked); your own
  server with WORDS INTO VECTORS and THE SECOND READER; no key to anyone else's; exported, restored whole.
- **IX · In Operation.** 30 September 2026 set in type; the older store's records ride into the engine; a tally in
  fives with no total (the counts are private); the lamp lights: EVER SINCE.
- **X · Broadsheet.** The sheet comes back down: A MODULE OF RHEOSTREAM, the masthead, Inspect. Correct. Trust.,
  the seven instruments, AGPL-3.0 · RHEO.STREAM.

---

# Draft 1 notes (kept for the record)

# Memory You Can Correct: build state

Music-only blueprint explainer for Recallatron, rheoStream's memory module (slate item 6, slug
`recallatron`). Audience: developers and Upwork clients hiring for AI memory and RAG work. Theme
`rheo` from the kit, like `novadiem-rheostream/`.

## Facts used, with sources

All from rheos/rheostream at `origin/main` 0e32b81 (2026-10-17). Paths are in that repo.

- **Supersede keeps the old record.** `recallatron.memory.supersede` writes a new memory, sets the old
  one's `superseded_by_id`, and the server writes a `derived_from` link back to it marked
  `supersession_lineage`. The new memory takes the old one's audience and purposes. The old one stays
  readable as history. `docs/architecture/memory.md` (Correction and supersession),
  `modules/recallatron/src/rheo_recallatron/lifecycle.py` (`supersede`).
- **Correct rewrites in place.** `recallatron.memory.correct` rewrites title, body and confidence on
  the same row, bumps `revision`, stamps `corrected_at`, and re-indexes (the tsvector regenerates, the
  vectors are deleted and re-embedded). It needs `expected_revision` (compare-and-set). Every memory
  derived from it is marked `invalidated_at` with reason `source_corrected` and kept; nothing
  re-derives on its own. Same doc section; `lifecycle.py` (`correct`, `_invalidate_closure`).
- **Recall is hybrid.** The default strategy is `hybrid`. Candidates are filtered in SQL first (live,
  not superseded or invalidated, audience, purpose). The lexical arm is Postgres full text
  (`search_tsv`, english stemming, OR join); the dense arm is 384-dimension vectors in an HNSW cosine
  index with a 0.30 floor. They are fused by reciprocal rank, `sum of 1 / (60 + rank)`, ties go to the
  newer memory. `docs/architecture/memory.md` (Retrieval),
  `modules/recallatron/src/rheo_recallatron/retrieval/hybrid.py` (`RRF_CONSTANT = 60`),
  `modules/recallatron/tests/test_hybrid_fusion.py`.
- **The 2026-09-30 transfer.** README Status: "On 2026-09-30 the reference instance finished phase
  two's last piece: the predecessor memory service's data moved into Recallatron in one accounted
  transfer, and Recallatron became the only memory writer." The counts are private by design
  (`docs/acceptance/phase-2-matrix.md`, criterion 32 note), so the film shows no numbers. What the
  public tests prove: identity, timestamps, status and provenance kept; a re-run inserts nothing;
  erased records stay erased; curated items land as `origin: migrated` memories addressed to the
  owner; everything else lands as owner-only `history_record` rows with no agent tool.
  `docs/architecture/memory.md` (Migration), `tests/postgres/test_history_records.py`.
- **Automatic save.** The bridge's Stop/SessionEnd hook writes a locator line only; a local worker
  sanitizes the transcript; the server's drain makes one extraction call and accepts at most one
  memory per evidence unit, with a content-free receipt that stops replay.
  `apps/bridge/src/rheo_bridge/hook.py`, `docs/architecture/memory.md` (Provenance and links),
  `docs/acceptance/ambient-capability-manifest.md`.
- **Automatic recall.** The `UserPromptSubmit` hook runs once per interactive session, on the first
  prompt, calls `recallatron.memory.recall`, and adds the results to the session's context under a
  header that calls them dated claims, not current truth. `apps/bridge/src/rheo_bridge/recall_hook.py`,
  `tests/test_bridge_recall_hook.py`.

Changed from the slate's story: "superseded, never overwritten" is only half true. Supersede keeps
the old record; correct does rewrite the text in place (keeping the revision count, the correction
date and the flagged derivatives). The film shows both, and the closing line says "Changed facts stay
as history", not "nothing is ever overwritten".

All memory contents on screen are made up (staging on Postgres 15 then 17, a nightly backup time).
Nothing is drawn dashed: every mechanism shown is built.

## Score

score-library `drafting-table-recallatron/take-01` (rheos/indieagent-workspace PR #13), sha256
`cca47485bd437643c0fa3b28ac25176611c7f2c37b0805740236e3ed6e07ee1c`, 89.99 s, ~94 BPM, G major.
`beats.json`: librosa finds beats 7.70-84.30 (the intro is too sparse below 7.7 s); extended to both
ends at the 0.639 s median gap. The music decays from 86.6 s.

Getting the score on a fresh checkout (audio stays out of git), from `secondunit/mv-projects`:
`cp ../score-library/drafting-table-recallatron/take-01.mp3 novadiem-recallatron/_in/score.mp3`, then
`shasum -a 256` must print the hash above.

## Plates (score seconds)

Bar stations are a memory's life in the module: IMPORT 0, SAVE 12.81, SUPERSEDE 26.2, CORRECT 40.25,
RECALL 53.02. One device throughout: the memory as an index card (`RC.card` on the root).

- **I · The move (0-12.86).** 2026-09-30, one-time transfer. OLD STORE forks into MEMORY (curated,
  origin migrated, addressed to the owner) and HISTORY (evidence, owner-only search, no agent tool);
  small cards ride the forks. Checks: every record counted, ids and clocks kept, a re-run adds
  nothing. "Counted in once." / "Erased stays erased." (red) 8.34/8.97.
- **II · Saved (12.81-26.25).** A Claude Code session says staging is on Postgres 15. Stop hook,
  local worker, extract, accept; a dot rides the path; card A appears with a content-free receipt.
  "Sessions save" / "without being asked." (red) 21.75/22.38.
- **III · Superseded (26.2-40.3).** A later session: staging moved to Postgres 17. A slides left and
  dims; B draws; the lineage link B to A; SUPERSEDED stamp; "Recall skips A, a history read still
  shows it" 36.42. "Superseded," / "not overwritten." (red) 34.5/35.14.
- **IV · Corrected (40.25-53.07).** C (nightly backup) and its derived summary D. The call
  `CORRECT( C, EXPECTED_REVISION 1 )`, 02:00 struck and replaced by 03:00, REV 1 to REV 2,
  CORRECTED 2026-10-11. The invalidation walks to D: INVALIDATED, source_corrected, kept for review.
  "Fixed in place." / "What used it is flagged." (red) 48.55/49.19.
- **V · Recall (53.02-67.75).** Query; candidate chips with A and D struck out; KEYWORD and VECTOR
  arms with their ranked lists; FUSED `1 / (60 + RANK)`; B on top at 1/61 + 1/61.
  "Keyword and vector," / "ranked as one." (red) 62.59/63.23.
- **VI · The next session (67.7-79.88).** First prompt, prompt hook (once per session), the context
  header and card B. "Recalled as a dated claim," / "not an order." (red) 73.44/74.08. The loop back:
  "When it stops, it saves again" 76.0.
- **VII · Colophon (79.83-89.9).** "Memory you can correct", Recallatron, a rheoStream module, the five
  steps, "Inspect it. Correct it." / "Changed facts stay as history." (red) 83.66/84.3,
  AGPL-3.0 · open source · rheo.stream. Holds to the end.

## Draft 1 (2026-10-17)

https://youtu.be/WsgYFYeal-c (unlisted, default channel), 90 s at 720p
(`renders/recallatron_take01_draft1.mp4`). flashcheck PASS (0 flashes). The score came out at
-15.1 LUFS, so the remux runs a linear loudnorm to -13.8 LUFS, peak -1.2 dBFS. Frames from the MP4
match the snapshots (every move uses `fromTo`). `hyperframes check` passes. No real names, keys or
amounts in the sources (grep audit). Renders and the score copy stay in this worktree, outside git.
