# Every Passage Has a Source: build state

Music-only blueprint explainer for MemoirQuill, slate item 8 (slug `memoirquill`). Audience: Upwork
clients hiring for LLM pipeline work, later MemoirQuill users. Facts come only from rheos/memoirquill
at `750968f` (main, 2026-07-30). Everything on screen is synthetic: the speaker "Nell", the grain-truck
memory, the transcript, the prose and the audio times. Nothing comes from a real recording or family.

## Facts used (with sources)

- **Eight stages, in this order:** normalize, entity_extract, chapter_map, retelling_detect,
  contradiction_detect, structured_clean, prose_draft, review_flag.
  `src/server/pipeline/run-pipeline.ts` (`PIPELINE_CHAIN`), `src/server/pipeline/registry.ts`. These are
  the bar stations. The slate's "8 stages" is right.
- **The transcript is frozen.** `raw_source_payload` is write-once; status lives in a separate column.
  Each turn has index, speaker, text, confidence and `start_offset_s`.
  `src/lib/session-document/schema.ts`.
- **Nothing dropped at import.** Lines the parser can't use as turns (AI commentary such as "Here's the
  transcript...") go into `normalization_report.unparsed_segments`, verbatim. The report's other fields
  shown are real names (`speaker_labels_inferred`, `turns_with_low_confidence`). Status goes raw to
  ingested. `schema.ts` (`AI_COMMENTARY_RE`, `turnsFromBlob`), `stages/normalize.ts`.
- **Entities** are person / place / date / event / organization. `prisma/schema.prisma` (`EntityType`).
- **chapter_map** makes fragments, each pinned to one chapter by `turn_span`. Chapter names are the real
  default framework. `registry.ts`, `src/server/services/life-graph.ts` (`DEFAULT_CHAPTER_FRAMEWORK`).
- **retelling_detect** sets `is_retelling_of` on a later fragment that tells an earlier story again.
  **contradiction_detect** records same event / conflicting fact as a Contradiction plus a review flag
  and never auto-resolves; both fragments stay. `registry.ts`, `stages/contradiction-detect.ts`.
- **structured_clean** removes false starts, keeps distinctive lines verbatim, adds no facts, and only
  sees the fragment's own turns. `stages/structured-clean.ts`.
- **prose_draft** writes only from the chapter's fragments. Coverage gate: a thin chapter gets a
  `thin_source` flag and no prose. Provenance is per passage: `PassageProvenance` stores the passage's
  `source_fragment_ids` and `turn_refs` ({session_document_id, turn_index}). A passage with no
  turn_refs raises `low_coherence` and is held. `stages/prose-draft.ts`, `prisma/schema.prisma`
  (`PassageProvenance`), tests in `src/server/pipeline/prose-gates.test.ts`.
- **review_flag runs the safety gate.** A draft publishes only with no open blocking flag and no
  unresolved contradiction on its sources; otherwise it is `gated` and readers see a gap. Resolving
  (e.g. `both_kept`) and re-running the gate publishes it. `src/server/services/chapter-draft.ts`
  (`evaluateSafetyGate`), `src/server/services/reading.ts` (admin trace from passage to verbatim turns).

## Changed from the slate

- **Title: "Every Passage Has a Source"**, not "Every Sentence Has a Source". Provenance is
  passage-level (a paragraph or scene), not per sentence. The film never claims a sentence maps to a
  single turn. Open question for Robin.
- "Provenance lines trace each sentence back to the moment in the recording": the trace ends at the
  transcript turns. The audio-time link is drawn **dashed** (plate VI). `start_offset_s` exists in the
  schema but every built path writes null; the in-app voice capture (ElevenLabs) gets per-turn
  `start_time` but stops at transcript review (`READY_FOR_REVIEW`, Back / Discard only) and does not
  commit a session document yet. `src/server/services/native-voice-capture.ts`,
  `src/app/app/capture/review/[captureId]/page.tsx`.

## Drawn dashed (planned)

- Plate VI: the audio strip, the ticks from turns to it and the times (0:38, 0:41, 0:47, 0:53), labelled
  "TIME IN THE RECORDING · PLANNED".

## Score

score-library `drafting-table-memoirquill/take-01` (rheos/indieagent-workspace), 89.99 s, sha256
`c71543cea5be8fc477a08f04a57d0e318ffa7925998edea23c260f5fe6e24de6`, ~95.7 BPM. Rendered at -11.5 LUFS,
so the root plays it at volume 0.8. `beats.json`: librosa beats 0.30-84.42, extended to 89.43 at 0.63 s.
Copy it to `_in/score.mp3` from the main checkout's score library and check the hash.

Plate starts on the score: 0, 10.98, 22.86, 33.8, 46.92, 61.29, 75.05; end 90.
Bar stations: NORMALIZE 10.98, ENTITIES 16.61, CHAPTERS 22.86, RETELLING 33.8, CONFLICTS 40.04,
CLEAN 46.92, PROSE 53.8, REVIEW 75.05.

Theme `paper`. Prose is set in EB Garamond (Google Fonts) so it reads as the memoir, apart from the
mono machinery. `window.MQ` on the root draws the shared transcript card, passage and waveform.

## Plates

- **I · The Interview (0-11).** Waveform draws 1.6-3.5, four turn brackets 3.48; "A voice interview."
  2.86. The transcript card lands row by row 5.35-6.3; WRITE-ONCE and "Kept exactly as said." (red) 7.23.
- **II · Read and Tag (10.98-22.9).** Card slides to the left. normalization_report 12.24, the kept
  unparsed line boxed 14.73 with "Nothing dropped." (red); status raw to ingested 15.36. Entities
  panel 16.61, Dad and Birch Creek boxed 17.23 / 17.86.
- **III · The Map (22.86-33.8).** Chapter framework 23.49; bracket on turns 12-15 and FRAGMENT 1 25.03;
  link to Coming of Age 26.91; turn_span boxed with "pinned to its turns." (red) 28.17; turn numbers
  boxed 30.04.
- **IV · Told Twice (33.8-47).** Session 4 card 35.04, FRAGMENT 2 36.92, is_retelling_of arrow 37.55.
  "fourteen" / "thirteen" boxed 40.04 / 40.67, CONTRADICTION tag 41.29, "Both versions kept." (red) 42.54,
  review flag 43.79.
- **V · No Source, No Sentence (46.92-61.3).** False start struck 47.54, cleaned text 48.8, verbatim
  anchor 50.67. Passage writes 54.42 (PROSE station 53.8). THE WORK chapter, thin, no prose 56.91;
  "No source, no sentence." (red) 57.54.
- **VI · The Thread (61.29-75.1).** Passage bracket 62.54, `turn_refs: [12, 13, 14, 15]` 63.17, four
  threads to the turns 63.8-65.7, "points to what was said." (red) 66.29. Dashed audio time 68.79.
  PASSAGE 2 with `turn_refs: [ ]`, held, 71.3.
- **VII · The Gate (75.05-90).** Draft, safety gate and reader view 75.66-76.92 (GATED, "Not published
  yet."). The contradiction from IV holds it 77.54; resolved by a person 79.41; gate opens 80.04,
  PUBLISHED, reader view fills 80.67. "Every passage can be checked / against what was said." (red)
  81.91 / 82.55, novadiem.com 84.42. Holds to the end.

## Draft 1 (2026-10-17)

https://youtu.be/5kKM5a2MYtM (unlisted, default channel), 90.0 s at 720p
(`renders/memoirquill_take01_draft1.mp4`, remuxed from `-raw`). flashcheck PASS (worst 0.5 flashes/s);
-13.5 LUFS, peak -2.6 dBFS. Eight frames tiled from the MP4 match the snapshots. Grep audit: no real
names, vendors, keys or amounts in `index.html` or `compositions/`.
