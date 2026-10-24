# 300 of 300 Fields: build state

Music-only blueprint explainer for the Upwork "Document extraction API" catalog listing. Plan and
beat sheet: `~/Code/novadiem/assistant/ideas/doc-extraction-video.md` (approved 2026-10-17).
Facts come only from rheos/doc-extraction-api (README, `results/accuracy.md`, `validate.py`).

## Now: draft 1 (2026-10-17)

Robin approved the plate IV look (https://youtu.be/vhQkCCpVATk) and asked for all seven plates on the
full score. The root is 88 s.

- Score: score-library `drafting-table-doc-extraction/take-01`, sha256 d03dc64f...f344, 88 s,
  ~95.7 BPM. `beats.json`: librosa beats 0.07-84.43, extended to 87.58 at 0.63 s.
- Plate starts on the score: 0, 8, 22, 36, 52, 66, 80; end 88 (music decays from 86.3).
- Getting the score on a fresh checkout (audio stays out of git): copy it from the score library in
  rheos/indieagent-workspace, then check the hash.
  `cp ../score-library/drafting-table-doc-extraction/take-01.mp3 novadiem-doc-extraction/_in/score.mp3`
  (from `secondunit/mv-projects`), and `shasum -a 256` must print `d03dc64f876d6b6c1d93ace760674eaf43e4532cb68c21a3c58f840760ecf344`.
- Theme `paper` from the kit. Archivo Black and IBM Plex Mono come from Google Fonts; HyperFrames
  fetches and pins them at compile time. Small gold type uses #6b5416 (line-strong is 3.5:1 on paper).
- Bar stations are the real pipeline: PDF 0, TEXT 8, MODEL 22, CHECK 52, JSON 66.
- `window.DX` on the root draws the 2026-layout sheet (charges left, summary right, synthetic values:
  bill 2026-03-14, due 2026-04-04, total 73.75 = unpaid 12.50 + current 61.25; charges 52.85 + 12.00
  + 1.40 - 5.00). `DX.box(name)` gives each field's value box for highlights, stencils and lifts.
  Plate IV draws its own older layout.

## Plates

- **I · The Document (0-8.05).** Sheet draws 0.7-2.6; "Ten fields." 2.59 with ten gold field marks;
  "Every month." 3.84 with two sheets stacked behind; "Typed by hand." (red) 5.10. Clears to the one
  sheet at 7.48. Right label carries the film's title.
- **II · The Schema (8-22.05).** Sheet glides left (to x 260). Scan line = the text layer, "One PDF
  in." 9.38. bill.json panel 10.01. The ten values lift one beat apart from 10.64 and land in their
  rows. `"needs_review": false` 17.55; "SCHEMA-VALID" and "Validated JSON" (red) 18.18. Clears at 21.42.
- **III · Two Readers (22-36.4).** Sheet slides back to centre. Panels as in plate IV, four rows
  ("4 of the 10 fields shown"). The model's lens finds each field from 25.05 ("A model reads it."
  24.43); the parser's stencil lands on the same cells 28.17 ("A fixed-rule parser checks it.");
  matching ticks 30.67; "THE ANSWER KEY" / "THE EXTRACTOR" 32.55. Plate IV's night wipes over it.
- **IV · The Old Layout** (below).
- **V · The Checks (51.9-66.05).** Nothing draws until IV's night has gone (52.57). Check 1, the sum
  as stacked bars with a dimension line, 53.2-55.7. Check 2, a day scale 03-10 to 04-18 with the
  7-31 day window and the due date inside it, 56.3-58.81. Check 3, ten required fields, nine ticks,
  `data_used_mb` null (an illustration of the mechanism, not a sample result), routed to a NEEDS
  REVIEW gate 61.94-62.57. "Doubtful values are flagged, not passed along." 61.94/62.57.
- **VI · The Tally (66-80.05).** 10 bills x 3 runs, each cell 10/10, filling from 68.42 with the
  counter to 300 / 300. Scope line 72.8. Bracket over B01-B06 (the six older bills added in
  doc-extraction-api PR #4, never used for tuning) 73.43; counter 2 to 180 / 180. "180 of 180 on
  bills it was never tuned on." 75.3.
- **VII · Colophon (80-88).** The pipeline as construction lines, "Check the model / before anything
  relies on it." 81.29/81.92, novadiem.com 83.17. Holds to the end.

## Plate IV · The Old Layout (slot 35.4-52.7)

Night field, wiped in from the left 35.69-36.32 and out to the right 51.94-52.57 onto plate V.
It carries its own border, grid and bar copy (tick at MODEL, sheet 04 / 07).

- 37.57-40.0: the older bill draws: frame, header (bill date), totals box on the LEFT, charges on
  the RIGHT, ruled body lines. Synthetic values: bill 2025-11-14, due 2025-12-05, current 58.40,
  total 58.40, charges 45.00 + 12.00 + 1.40. No vendor name.
- 40.68: parser (left) and model (right) panels, four rows each: bill_date, current_charges,
  total_due, due_date.
- 41.94: the parser's dashed stencil drops onto the 2026 positions. 43.19: it reads one right
  (bill date, same place in both layouts), two misses and one wrong value (45.00 from the PLAN row).
- 44.44 / 45.07: "The old layout" / "broke the parser." (red).
- 45.07-48.2: the model's lens visits each field where it actually sits; a highlight box, the
  value and a tick land per stop, one beat apart.
- 48.18: "The model read it unchanged."
- 48.81: the stencil boxes slide to the old layout's true positions (the code fix); the parser's
  values correct. 49.44 "PARSER: CODE FIX", 50.06 "MODEL: NO CHANGE".

`hyperframes check` reports the paper furniture's bar text as occluded under the night field.
That's intended (the plate draws its own bar copy), the same as the Cold Read's plate III.

## Look test v1

https://youtu.be/vhQkCCpVATk (unlisted, default channel), 19 s cut from 35-54 s of the 0-54 s render
(`renders/doc-extraction_plate4_looktest_v1.mp4`). flashcheck PASS; -13.0 LUFS, peak -1.0 dBFS.
badframes flags the night field as "dark lower-right" by design; frames checked by eye, full-frame.

## Draft 1

https://youtu.be/tcsvJvogNZA (unlisted, default channel), 88 s at 720p
(`renders/doc-extraction_take01_f0-f2112_24fps_draft1.mp4`). flashcheck PASS; -13.5 LUFS, peak -1.7 dBFS.
No vendor names or real figures in the sources (grep audit). The first full render caught plate III
leaving the sheet parked left: a `set` + `to` pair that snapshots ran correctly but the renderer
did not. Both sheet slides now use `fromTo` with explicit values.

## Delivery (2026-10-17)

Robin approved draft 1 as the delivery cut. On Novadiem Studio: https://youtu.be/4B_UinelxCY (unlisted,
"300 of 300 Fields: a document extraction API, checked"). Listed on the library page and on
novadiem.com/video/explainers (rheos/novadiem.com#170). Renders and the score copy stay in this
worktree (`renders/`, `_in/`), outside git.
