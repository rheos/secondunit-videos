# Works With No Signal (Orchardly): build state

Music-only blueprint explainer for Orchardly, slate item 10. Audience: orchard operators, and Upwork
clients hiring for offline-first mobile work. Production brief:
`~/Code/novadiem/assistant/ideas/explainer-production-brief.md`.

## Facts used (checked 2026-10-17)

Sources: `~/Code/foaftech/orchardly/orchardly-app` (local main 145db89), `orchardly-rails` (0f35af0).

- Built: the phone is the system of record and works offline. SQLite on the device, "offline
  operation is normal" (`orchardly-app/docs/data-model.md`, Design Principles 1; plan 01 decision
  "Offline-all-day; sync when available").
- Built: each tally write is a tally row plus a `tally_edit_log` 'create' row in one transaction
  (`src/core/db/queries/talliesWrite.ts`, `insertTallyInDb`, `withTransactionSync`). Count edits log
  one row per changed field (`updateTallyCountInDb`).
- Built: the active pay rule is resolved at write and its rate and URI are snapshotted onto the tally
  (`insertTallyInDb`, `resolveActivePayRuleForTallyFromDb`). Rate changes supersede the old rule
  rather than editing it (`payRulesWrite.ts`, `superseded_at` / `superseded_by_uri`).
- Built: owed per tally is `floor(count × rate_snapshot_cents)`; pay week sums owed per picker, paid
  comes from payouts whose coverage overlaps the week, unpaid = owed − paid
  (`src/core/domain/payMath.ts`, `owedCentsForTally`, `payPeriodSummary`). Payouts are inserted,
  never edited (`payoutsWrite.ts`, `insertPayoutInDb`, `reversePayoutInDb`).
- Built: `POST /api/v1/sync_batches` stores a batch idempotently on `client_batch_id` (UUID v4): a
  repeat of a stored id returns the stored batch with 200, a new one is created with 201
  (`orchardly-rails/app/controllers/api/v1/sync_batches_controller.rb`, `app/models/sync_batch.rb`);
  unique index `index_sync_batches_on_client_batch_id` (`db/schema.rb`). Payload carries an
  `operations` array (entity_type / op / body). The pilot CSV import pushes through it today
  (`scripts/push_sync_batch_from_json.py`). There are no Rails tests for it.
- Not built, drawn dashed: the app's push to that endpoint (plan 01 milestone 8 "not started",
  README "backend sync push" pending, no sync code in `src/`); applying operations to typed tables
  and pull sync (orchardly-rails README "Next steps", plan 07 bundles 4 and 5); conflict rule
  last-write-wins by `updated_at` with `sync_version` tiebreak (`data-model.md`, Sync Model).

Changed from the slate's story: the slate said phones "come back into range, and sync merges into
payroll". The merge is not built, and payroll is already worked out on the phone. The film says pay
week adds up on the phone (built), shows the batch endpoint's stored-once behaviour (built), and draws
the app push and the server-side merge dashed as planned. The message "nothing they logged is lost or
counted twice" is not put on screen as a whole; the colophon says "Crews keep working with no signal."

Synthetic on screen: crew ANA, BEN, CLEO, DEV; BLOCK 4 · GALA · BIN; rate 2400 ¢ a bin, 2600 ¢ after
2026-09-15; week 2026-09-08 / 09-14 with 14, 12, 15, 11 bins; payout ANA cash 336.00; batch id
7c1e4b2a-…-a3f9. Site: orchardly.app (live, 200 on 2026-10-17).

## Now: draft 1 (2026-10-17)

- Score: score-library `drafting-table-orchardly/take-01`, sha256 9c3f9edb...7ece, 84.98 s, ~95.7 BPM,
  silent from 83.16. `beats.json`: librosa beats 0.30-78.25, extended to 84.52 at 0.627 s. Root 83.3 s.
  Fresh checkout: `cp ../score-library/drafting-table-orchardly/take-01.mp3 novadiem-orchardly/_in/score.mp3`
  (from `secondunit/mv-projects`), and `shasum -a 256` must print
  `9c3f9edb0034ee49b595470524855d1b0160b728f650f58f4c1dd8aa258b7ece`.
- Theme `orchardly` (added to the kit in this branch): navy and canopy green on the pale day surface,
  navy field with fruit orange for plate IV, Bricolage Grotesque, IBM Plex Mono. Planned text uses
  #5b6b5a (ink-faint is 2.6:1 on pale).
- Bar stations are the tally's path: TAP 0, SQLITE 9.96, PAY WEEK 37.38, BATCH 51.43, API 64.2.
- `window.OR` on the root draws the phone (fixed at 1380,150, 320x600), its tally sheet, the
  orchardly-rails box and the sync batch envelope, so plates hand the phone over without a jump.

## Plates

- **I · No Signal (0-9.96).** Block 4 in plan view, six rows of trees, four pickers. Phone draws
  2.3; "Four pickers." 2.95, "Six rows." 4.2, "No signal." (red) 6.11 with NO SERVICE on the phone.
  Right label "Orchardly · Works With No Signal". Clears to the phone at 9.31.
- **II · The Tally Book (9.96-23.99).** Sheet draws on the phone; ten taps one a beat 12.52-18.25,
  each filling a cell and adding a `tally` row and a `tally_edit_log` row. "Every tap is saved on the
  phone," 15.7 / "no network needed." (red) 19.53.
- **III · The Rate (23.99-38.06).** Pay rule card 24.64; tally t-10 with an empty rate slot; 2400
  travels into it 27.19; owed = floor(count × rate) 29.12; new rule 2600 31.02, old one SUPERSEDED
  31.65; tick on the kept 2400 32.95. "The rate is copied onto each tally." 28.47 / "A new rate never
  rewrites old ones." (red) 32.95.
- **IV · Pay Week (37.38-51.43).** Navy field wiped in 37.38-38.06 and out 50.81-51.43, with its own
  border, grid and bar copy (tick at PAY WEEK, sheet 04 / 07). Pay week table 38.68-42.52; cash payout
  appended 44.42; ANA paid 336.00, unpaid 0.00, total unpaid 912.00 at 45.9. "Friday night. Still no
  signal." 40.59 / "Pay week adds up on the phone." (red) 46.97.
- **V · Back in Range (50.81-64.2).** Signal bars fill 52.08; orchardly-rails box 53.36; dashed wire
  "APP PUSH: PLANNED" 53.99; the batch travels 56.54 and its row lands 57.82; "201 CREATED" 58.47.
  "Back in range." 53.36 / "One batch, one ID." (red) 59.74.
- **VI · Sent Twice (64.2-76.32).** The reply is lost 65.48; the same batch is sent again 66.13-68.66;
  the server finds the stored id and returns it, "200 OK · same batch" 69.96; "rows: 1" 71.22. Dashed
  PLANNED box 73.14: apply operations to tally and payout tables, last write wins. "Sent twice." 69.96
  "Stored once." (red) 71.22. Clears at 75.7.
- **VII · Colophon (76.32-83.3).** "Orchardly", the path as construction lines, "Crews keep working /
  with no signal." 77.6/78.25, orchardly.app 78.88. Holds to the end.

`hyperframes check` flags the paper furniture's bar text as occluded under the navy field. Intended:
plate IV draws its own bar copy.

## Draft 1

https://youtu.be/vg7GxNHjJMk (unlisted, default channel), 83.3 s at 720p
(`renders/orchardly_take01_draft1.mp4`, remuxed with `volume=0.2dB,alimiter=limit=0.82`).
flashcheck PASS (worst 0.5 flashes/s at the navy wipe); -13.9 LUFS, peak -1.3 dBFS. Eight frames
tiled from the MP4 match the snapshots. No real names, amounts, vendors or keys in the sources (grep audit).
