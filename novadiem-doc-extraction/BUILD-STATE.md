# 300 of 300 Fields: build state

Music-only blueprint explainer for the Upwork "Document extraction API" catalog listing. Plan and
beat sheet: `~/Code/novadiem/assistant/ideas/doc-extraction-video.md` (approved 2026-10-17).
Facts come only from rheos/doc-extraction-api (README, `results/accuracy.md`, `validate.py`).

## Now: plate IV look test (2026-10-17)

The root is cut at 54 s and holds only the furniture and plate IV. Render 0-54 s, then cut 35-54 s
for the look test. The full film sets the root to 88 s and adds b1-b3 and b5-b7.

- Score: score-library `drafting-table-doc-extraction/take-01`, sha256 d03dc64f...f344, 88 s,
  ~95.7 BPM. `beats.json`: librosa beats 0.07-84.43, extended to 87.58 at 0.63 s.
- Section boundaries (plate starts): 0, 8, 22, 36, 52, 66, 80; end 88 (music decays from 86.3).
- Theme `paper` from the kit. Archivo Black and IBM Plex Mono come from Google Fonts; HyperFrames
  fetches and pins them at compile time.
- Bar stations are the real pipeline: PDF 0, TEXT 8, MODEL 22, CHECK 52, JSON 66.

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
