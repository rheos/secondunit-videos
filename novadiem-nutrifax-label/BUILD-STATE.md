# Recipe In, Label Out: build state

Music-only blueprint explainer for Nutrifax (slate item 7), aimed at small food producers, the paying
users. Message: put your recipe in, get a label you can print. Built from the production brief
(`~/Code/novadiem/assistant/ideas/explainer-production-brief.md`), straight to draft 1 (Robin,
2026-10-17). Placement on nutrifax.app (landing and buyer-intent pages, not /nutrients) is the
coordinating session's call.

## Facts used, and where they come from

All from rheos/nutrifax at `85329c6` (origin/main, 2026-10-17) unless noted.

- **Recipe in, matched to food records.** `docs/claude/ai-import.md` and
  `backend/app/services/ai_import.py`: a model parses the recipe and picks the best food and measure
  from search results; unresolved ingredients come back to the user
  (`frontend/components/RecipeBuilder.tsx`, the unresolved-ingredient cards). Data sources are the
  Canadian Nutrient File and USDA FoodData Central (`CLAUDE.md`).
- **Cups to grams, then the sums.** `backend/app/services/calculator.py`: grams = quantity / amount x
  gram weight; contribution = value per 100 g x grams / 100; summed per nutrient; divided by
  servings. The audit report's methodology says the same in five steps
  (`backend/app/services/audit_report.py`, lines 130-139).
- **Rounding.** `backend/app/services/label_generator.py`, the Canadian (B.01.402) and FDA (21 CFR
  101.9) label rounding functions. Used on screen: calories over 50 to the nearest 10; fat over 5 g
  to the nearest 1 g; fat 5 g or less to the nearest 0.5 g; under 0.5 g shown as 0; sodium over
  140 mg to the nearest 10 mg. FDA cholesterol 2-5 mg reads "less than 5" (`_fda_round_cholesterol`);
  the Canadian rule rounds it to the nearest 5 (`_ca_round_cholesterol`).
- **Daily values.** `backend/etl/import_foods.py`: HC fat DV 75 g, FDA fat DV 78 g (so the same
  16.48 g of fat is 22 % on the Canadian table and 21 % on a US panel).
- **The table.** `render_ca_standard()` in `label_generator.py` (row order, bold names, the 8 %
  sat+trans line, no %DV on cholesterol) and the shipped Figure 1.2 preview
  (`backend/app/static/label-previews/ca/1.2.png`) for the rules and layout. English, French or
  bilingual: `CA_LABELS` en/fr, the bilingual renderer, and the CA landing page FAQ
  (`backend/app/templates/landing_generator_ca.html`).
- **The sheet.** `docs/claude/label-system.md` and `label_sheet.py`: Avery 5163, 2 x 5 on US Letter,
  PDF or PNG output. Layout copied from `label-previews/avery_5163.png` (tables turned on their side).
- **The audit report.** `audit_report.py`: ingredient summary, per-nutrient audit trail, data source.
- **Claim language.** `docs/claude/brand-voice.md`: never "compliant", "approved" or "certified";
  say "a CFIA Nutrition Facts table, rounded per B.01.402"; carry the standing qualifier "Confirm the
  final label against current regulations for your product." The film follows all three.
- **Look.** `backend/app/static/marketing/base.css` and the brand handoff
  (`docs/Design Handoffs/design_handoff_nutrifax_brand/README.md`): paper #FBF8F1, cream #ECE5D2,
  ink #14110D, green #16A34A; Fraunces display, Hanken Grotesk, JetBrains Mono and Caveat are the
  site's own fonts.

### The sample recipe (synthetic) and its numbers

"Maple almond granola", makes 12: 400 g rolled oats, 1/2 cup maple syrup, 4 tbsp canola oil, 1 cup
whole almonds, 1/2 cup sunflower seeds, 1 tsp salt. Matched by hand to plain CNF records (no brand
names): Grains, oats (4421); Sweets, syrups, maple, bulk (4326); Vegetable oil, canola (451); Nuts,
almonds, dried, unblanched, unroasted (2534); Seeds, sunflower seed kernels, dried (2526); Salt, table
(214). Measures from CNF `CONVERSION FACTOR.csv`: 125 ml, 4 x 15 ml, 2 x "125ml whole", "125ml
hulled", 5 ml.

Every number on screen was computed from the CNF 2015 CSVs in `nutrifax/data/Canada/` with a script
that mirrors `calculator.py` and the `label_generator.py` rounding (kept in the session scratchpad,
not committed). Recipe weighs 853.3 g; per serving 316.04 kcal, 16.48 g fat, 1.505 g saturated,
0.111 g trans, 35.29 g carbohydrate, 5.63 g fibre, 9.02 g sugars, 9.56 g protein, 0 mg cholesterol,
200.33 mg sodium, 305.7 mg potassium, 71.7 mg calcium, 2.38 mg iron. The table shows 320 / 16 g 22 %
/ 1.5 g + 0 g 8 % / 35 g / 6 g 20 % / 9 g 9 % / 10 g / 0 mg / 200 mg 9 % / 306 mg 7 % / 72 mg 6 % /
2.4 mg 13 %. The salt line carries 2,372.8 of the recipe's 2,403.9 mg sodium. The serving
description "2/3 cup (71 g)" is the made-up producer's; the 71 g is 853.3 / 12.

Plate III's cells are rounded to 0.1 and its totals are the unrounded sums rounded to 0.1, as the code
sums unrounded values, so a column can differ from the sum of its shown cells by 0.1.

Nothing is drawn dashed: every part shown is built.

## Now: draft 1 (2026-10-17)

- Score: score-library `drafting-table-nutrifax-label/take-01`, sha256 71011a14...ec00, 85.94 s,
  ~92.3 BPM. `beats.json`: librosa beats 10.47-83.52 (the soft intro doesn't track), extended to
  0.07-85.47 at 0.65 s. Root is 86 s; the audio slot is 85.94.
- Getting the score on a fresh checkout (audio stays out of git): copy it from the main checkout's
  score library, then check the hash.
  `cp ../score-library/drafting-table-nutrifax-label/take-01.mp3 novadiem-nutrifax-label/_in/score.mp3`
  (from `secondunit/mv-projects`), and `shasum -a 256` must print
  `71011a14e6fa6cef68995851b98207a66bea9c28495720bef8f6ebd75111ec00`.
- Plate starts on the score's sections: 0, 10, 24, 38, 52, 68, 78; end 86.
- Theme `nutrifax`, added to the kit in this branch (`tools/blueprint-kit/themes/nutrifax.css`), with
  Hanken Grotesk vendored in `kit/fonts` (OFL) because the checker can't resolve it from Google
  Fonts. Fraunces, JetBrains Mono and Caveat load from Google Fonts. Compositions name Hanken through
  `var(--font-label)`.
- Bar stations are the real path through the product: RECIPE 0, MATCH 10, CALCULATE 24, ROUND 38,
  LABEL 52, PRINT 68.
- `window.NF` on the root draws the recipe card (`NF.card`) and the Canadian table (`NF.table`, parts
  in render order) so plates hand them over without a cut.

## Plates

- **I · The Recipe (0-10).** The card draws, the recipe is written one line per beat from 2.02.
  "Your recipe, in cups and spoons." 4.62; "The label needs numbers." (red) 6.57. Clears to the card.
- **II · The Match (10-24).** Card glides left 10.47. Each line is underlined and arrowed to its CNF
  record one beat apart from 11.13. "Each line is matched to / the Canadian Nutrient File." (red)
  12.43/13.08; "No confident match? That line comes back to you to pick." 15.7. Grams column 18.3,
  "Cups become grams, / from the file's own measures." 18.95/19.61, the almond measure worked out 20.91.
- **III · The Sums (24-38).** Six ingredients x calories, fat, carbohydrate, protein, sodium, one row
  per beat from 25.47. The salt sodium cell boxed red and its sum written out 29.38. Recipe total
  30.7; "÷ 12 servings" row 32.65. "Grams times the file's values per 100 g." 26.13; "Added up, then
  split 12 ways." (red) 32.0.
- **IV · The Rounding (38-52).** Five rulers (calories, fat, saturated, trans, sodium), each raw
  value's dot snapping to its step and the label value landing, one every two beats from 39.17. "Each
  nutrient rounds by its own rule." 41.13; "Canada: B.01.402. US: 21 CFR 101.9." (red) 46.35; the
  cholesterol difference 47.65.
- **V · The Table (52-68).** The table assembles part by part 53.52-60.05 in render order. "Built
  panel by panel: / a CFIA Nutrition Facts table." (red) 55.47/56.78. Callouts 61.35-63.95: 316.04 to
  320, Canadian DVs, fat 22 % vs 21 % on a US panel, sodium mostly the salt, Figure 1.2 also in French
  or bilingual.
- **VI · The Sheet (68-78).** The table shrinks and turns into the first label of an Avery 5163 sheet
  69.17; the other nine fill from 70.47. PDF and PNG 71.12. The audit report's sodium trail 72.43.
  "Print-ready, ten to a sheet, / with every number traced to its source." (red) 71.12/73.72.
- **VII · Colophon (78-86).** The six stations as construction lines; "Put your recipe in. / Get a
  label you can print." (red) 79.61/80.26; nutrifax.app 81.56; the standing qualifier 82.21.

`hyperframes check` passes. The table's text boxes overlap while it rotates into the sheet (plate VI)
and during the V-to-VI handoff; both groups carry `data-layout-allow-overlap`.

## Open notes

- `backend/app/services/rounding.py` (the app's on-screen summary) rounds Canadian fat of 5 g or less
  to the nearest 0.1 g, while `label_generator.py` (the printed label) uses 0.5 g. The film follows
  the label. Worth a look in Nutrifax.
- `docs/claude/label-system.md` says standard formats are pay-per-label (Ω); the CA landing page says
  "free". The film makes no price claim.

## Draft 1

https://youtu.be/i7HvLFXCpPw (unlisted, default channel), 86.1 s at 720p, 24 fps
(`renders/nutrifax-label_take01_draft1.mp4`, sha256 8da91ce3ce323e21...). Rendered in about 90 s under the
shared lock. Remux adds 0.8 dB and a limiter: -14.2 LUFS integrated, true peak -1.3 dBFS. flashcheck
PASS (worst 1 flash in a second, at the plate VI turn). Eight tiled frames and two full frames
(75.5 s, 85.5 s) checked by eye; the MP4 matches the snapshots. No real names, vendors, keys or
amounts in the sources (grep audit).
