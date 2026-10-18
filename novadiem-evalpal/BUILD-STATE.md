# Instruments as Data: build state

Music-only blueprint explainer for EvalPal (slate item 9, slug `evalpal`), for Upwork clients in
health tech. A screening questionnaire is defined as data; the app renders it, scores it and exports
a PDF; answers are encrypted at rest. Message: a new questionnaire is a data change, not a code
change, and answers are protected.

## Facts used (all from ~/Code/novadiem/evalpal, local git `main` at c22c58f)

- **Instruments are data.** `CLAUDE.md` § Architecture: an instrument is a tree of rows (scale,
  options, items, scoring rule, bands, safety rule), "Adding an instrument is configuration, never a
  code change." Rendering switches on `Scale.scaleType` (six families: ORDINAL, FREQUENCY, SEVERITY,
  CHECKLIST, FREE_TEXT, DATE) in one component, `components/instrument/ItemRenderer.tsx` (header
  comment, line 3-4). Scoring switches on `ScoringRule.aggregation` (SUM, THRESHOLD_COUNT) in
  `lib/scoring/score.ts`, "There is NO instrument-name check".
- **PHQ-9 structure** from `prisma/instruments/phq9.ts`: marked public domain in the file ("No
  permission required for use"), v1.0, one FREQUENCY scale 0-3 with four options (Not at all,
  Several days, More than half the days, Nearly every day), 10 items (9 with `scoredByTotal: true`,
  the impairment item `false`), rule SUM over TOTAL, five bands 0-4, 5-9, 10-14, 15-19, 20-27
  (5-9 is "Mild depression"), safety rule item ordinal 8 (the 9th item) `GT 0`. The film shows the
  structure only; item wording is drawn as ruled lines, never as text.
- **Responses on screen are synthetic**: answers 1,1,0,2,1,0,1,0,0 (sum 6, band 5-9), impairment
  item 1 (not in the total), item 9 = 0 so the safety rule does not fire. Ciphertext and IV bytes are
  made-up hex. Report date 2026-10-17 is made up.
- **Encryption at rest**, verified in code: `lib/crypto/index.ts` encrypts with AES-256-GCM via
  `node:crypto`, a fresh `randomBytes(12)` IV on every call, data key derived (HKDF-SHA256) from a
  versioned master key read from env (`RESPONSE_ENC_KEYS`, `RESPONSE_ENC_ACTIVE_VERSION`), "NEVER in
  the database". `lib/attempt/saveResponse.ts` is "the ONLY path that writes an encrypted response
  row" and calls `encryptResponse` on every autosave. `prisma/schema.prisma` `model Response`
  stores `valueCiphertext`, `iv` (12 bytes), `authTag` (16 bytes), `keyVersion`. Tamper and rotation
  tests: `lib/crypto/__tests__/crypto.test.ts` (Tests 3a/3b: a flipped byte makes decrypt throw).
- **Score**: the submit handler decrypts and hands plain data to pure `score()` (`CLAUDE.md`
  § Attempt lifecycle; `lib/scoring/score.ts`). Safety: `lib/safety/evaluate.ts`, item 9 at 0 must
  not fire (`CLAUDE.md` § Safety flagging).
- **PDF**: `lib/pdf/renderAttemptPdf.ts` renders from the attempt's immutable definition snapshot,
  decrypts the responses, and always includes `REPORT_DISCLAIMER` = "This is a screening tool only.
  Results are not a diagnosis. Consult a qualified clinician." The film quotes it on the page.
- **New instrument path**: `scripts/import/README.md` (JSON definition → validate → load) and
  `CLAUDE.md` § Deployment ("Edit a `data/instruments/*.json`, commit, redeploy → live").
  Seven definitions are in the repo: two seeded (`prisma/instruments/phq9.ts`, `gad7.ts`) and five
  JSON files in `data/instruments/`. The example card in plate VI is made up (labelled so).
- **Real data-only edit**: evalpal commit 417f43e (2026-07-20) filled 15 rows of one instrument's
  checklist; files changed were that instrument's JSON and `data/instruments/REVIEW.md`, no code.
  The film does not name the instrument (its licence is not public domain).
- **Clinical claims**: none beyond the repo's own words. "Screening only, not a diagnosis" is the
  app's required disclaimer. No validation, accuracy or compliance claims.
- Live at evalpal.app (`CLAUDE.md` § Deployment).

Dropped or changed while scripting: a "0 code files" tally for adding the five JSON instruments (they
arrived in the same commit as the import pipeline itself, so that count would be misleading). It is
replaced by the 417f43e data-only edit.

Nothing on screen is unbuilt, so nothing is drawn dashed as `.planned`.

## Score

score-library `drafting-table-evalpal/take-01` (rheos/indieagent-workspace, branch score/evalpal),
85.94 s, ~92.3 BPM, sha256 2a2b7cde4802a0c095bc544c0f97b9e6265fe06deb8f54ca6a2307a665a6e857.
`beats.json`: librosa beats 0.28-83.75, extended to 85.70 at 0.65 s. The planned quiet section
(24-38) came out at about 40-50 instead, so the night plate (IV, At Rest) sits there and the score
plate comes before it.

Getting the score on a fresh checkout (audio stays out of git):
`cp ../score-library/drafting-table-evalpal/take-01.mp3 novadiem-evalpal/_in/score.mp3` (from
`secondunit/mv-projects`), then `shasum -a 256` must print the sha above.

## Plates (score seconds)

Bar stations are what the app does with one definition: DEFINITION 0, FORM 11, SCORE 24, REPORT 52.
Sheets 0, 11, 24, 38, 52, 64, 78; end 85.9.

- **I · The Definition (0-11).** Right label "EvalPal · Instruments as Data" (the product is named on
  screen, per the coordinator, 2026-10-17). The PHQ-9 definition card draws (0.93-2.9). "One questionnaire,"
  4.2, "written as data." (red) 5.5. Four callouts: scale, items, rule, bands (6.15-8.1).
- **II · The Form (11-24).** Card slides left. ItemRenderer's six scale types; FREQUENCY lights
  (12.03-12.7). The form screen draws, the four option labels lift off the card into it (15.93),
  a synthetic answer is picked (19.2) and autosaves (19.85). "The app draws the form" / "from the
  scale type." (red).
- **III · The Score (24-38.9).** Ten synthetic answers; nine travel into `score()` and the total
  counts to 6; item 10 stays out. Band ladder, marker at 6 in 5-9. Safety rule not fired.
  "Scored by the rule" / "in the definition." (red).
- **IV · At Rest (night, 37.9-52.6).** Wipes in 38.13-38.78. Answer payload, AES-256-GCM, key from
  the app env, fresh 12-byte IV, the Response row in the database. Re-save: same answer, new IV, new
  ciphertext. "Every answer is encrypted" (red on "encrypted") / "before it is stored." Wipes out
  51.8-52.45.
- **V · The Report (51.5-64).** Snapshot, decrypt, stored score feed the PDF page: wordmark,
  instrument, total and band, every answer, the disclaimer. "A PDF report:" / "screening only, not a
  diagnosis." (red).
- **VI · A New Instrument (64-78).** A made-up definition card replaces PHQ-9; validate, load, the
  same renderer, scorer and PDF. 417f43e tally; "7 definitions · 1 renderer · 1 scorer". "A new
  questionnaire is a data change," / "not a code change." (red).
- **VII · Colophon (78-85.9).** The four stations as construction lines. "Questions are data." /
  "Answers are encrypted." (red). "EvalPal · evalpal.app · novadiem.com".
