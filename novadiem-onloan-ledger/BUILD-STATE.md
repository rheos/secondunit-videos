# Where Does the Loan Settle?: build state

Music-only blueprint explainer for OnLoan on the FOAF ledger (slate item 11, slug `onloan-ledger`),
aimed at developers and the foaf-client SDK. GrowOperative's narrated explainers cover the user side;
this one is the mechanism. A lender lends a car, the use is metered by distance, and the loan settles
on the FOAF ledger as a transfer on the trustline the two people already share. Message: a new app
gets the same login, the same contacts and the same tabs.

## Facts used

Read 2026-10-17 from `~/Code/foaftech/onloan` (onloan-api at 9d1e3b2; origin/main is two Dependabot
bumps ahead), `~/Code/foaftech/foaf-client` (gem and docs), `~/Code/foaftech/foaf-docs` and
`~/Code/foaftech/onloan/onloan-app`. CI on onloan-api main (runs `bundle exec rspec`) was green on
2026-10-01; I read the specs, I didn't run them.

- **Lending between existing contacts, on a trustline.** `onloan/CLAUDE.md`: both parties are FOAF
  contacts; contacts come from auth.foaf.io `GET /v1/contacts`. foaf-docs
  `docs/about/app-ecosystem.md` (OnLoan entry): "A loan needs an existing trustline between the two
  people".
- **Metering.** `onloan-api/app/services/metering_calculator.rb`: `(end - start) * rate`, BigDecimal,
  `round(decimals, :half_up)` to the network's decimals, units km / day / hour, rejects zero,
  negative and rounds-to-zero. `spec/services/metering_calculator_spec.rb` covers the rounding
  (67 x 0.125 = 8.375 -> 8.38). Plate II's 21.675 -> 21.68 is the same half-up rule.
- **Vehicles can be metered by km.** `app/models/loan_item.rb`: vehicle allows km, day, hour.
- **Lifecycle (the bar stations).** `app/models/loan.rb` status enum draft, open,
  awaiting_confirmation, settled (and void). Start reading set by the lender, end reading entered by
  lender or borrower (`onloan/CLAUDE.md` state diagram).
- **Capacity first.** `app/services/settle_service.rb#initiate` calls `max_capacity_path_info`
  borrower -> lender (foaf-client `gem/lib/foaf/client.rb`: POST
  `/api/v1/networks/:addr/max-capacity-path-info`) and refuses before any write when the amount is
  more than the capacity, with the message shown on plate III ("...'s credit with you is X; this
  loan came to Y."). Covered by `spec/services/settle_service_spec.rb` ("returns the EC-3 message
  when capacity < amount").
- **Two signatures.** `settle_service.rb`: the borrower (sender) creates the pending transfer (POST
  `/api/v1/pending_transfers`, idempotency key `onloan:loan:<id>`), the lender (receiver) confirms
  it (PUT `/api/v1/pending_transfers/:id/confirm`). Each step's client is bound to that party's
  foaf_id; specs "#initiate binds the remote provider to the BORROWER foaf_id" and "#confirm binds
  ... the LENDER foaf_id".
- **Keys live with the custodian.** `settle_service.rb` comment ("The custodian holds the key;
  OnLoan never does") and foaf-client `docs/architecture.md` (remote custodian signing at
  auth.foaf.io, no local-key fallback).
- **Settled only on a 2xx with an operation id.** `settle_service.rb#finalize_confirm`; spec
  "flips status to settled ONLY on a 2xx with an operation id (EC-5)".
- **OnLoan keeps the loan, FOAF keeps the money.** `onloan/CLAUDE.md` ("OnLoan does no balance
  math", "OnLoan's net-new contribution is the loans table + the metering calculation + the state
  machine"); `onloan-api/CLAUDE.md` hard constraints. The loan stores `operation_id`.
- **Same ledger, same login, same contacts.** `onloan/CLAUDE.md`: prod uses the shared network "so
  balances reconcile across GrowOperative and OnLoan"; foaf-docs app-ecosystem: "a debt between two
  people is the same trustline whether it was recorded in OnLoan or GrowOperative". Login:
  `onloan-app/src/core/foaf/IdentityContext.tsx` signs in at auth.foaf.io with OnLoan's own audience
  (`onloan`). foaf-client README: one SDK per side (Ruby gem, TypeScript) with auth, contacts and
  ledger modules; `docs/adoption.md` covers GrowOperative's adoption.
- **onloan.net** answers 200 and is the URL foaf-docs lists. FOAF-Foundation/foaf-client is public;
  rheos/onloan-api is private, so the colophon names the SDK repo, not the API repo.

Synthetic on screen: Ana (lender) and Ben (borrower), a 100.00 credit line, odometer 48 210.0 to
48 296.7 (86.7 km), 0.25 per km, 21.68, loan 42, the 15.00 "if the credit were" case and the
signatures. None of it comes from Robin's live loans (the repo's spike example and the live op
numbers are left out). Not built, drawn dashed: "Your app" on plate VI.

## Now: draft 1 (2026-10-17)

- Score: score-library `drafting-table-onloan-ledger/take-01`, sha256
  `b4b8e59f7d9a01ba997913b85010cd397e249ba6c95027e008c79b80d27e4eae`, 87.95 s, ~95.7 BPM.
  `beats.json`: librosa beats 1.35-82.41, extended to 0.09-87.42 at 0.627 s. Music decays from ~84 s.
- Getting the score on a fresh checkout (audio stays out of git): from `secondunit/mv-projects`,
  `cp ../score-library/drafting-table-onloan-ledger/take-01.mp3 novadiem-onloan-ledger/_in/score.mp3`,
  then `shasum -a 256` must print the hash above.
- Plate starts on the score sections: 0, 10, 24, 36 (pine wipe 35.69-36.32), 52 (wipe out
  51.94-52.57), 66, 80; end 88.
- Theme `onloan` (added to the kit in this branch): onloan.net's warm-ledger tokens from
  rheos/onloan-web `app/globals.css`. Paper #f4eee0, ink #211c14, pine line work, clay accent
  darkened to #a8501f for contrast, pine field #1f4b39 for plate IV. Instrument Serif display and
  JetBrains Mono from Google Fonts, Hanken Grotesk from the kit's fonts.
- Bar stations are the loan lifecycle: DRAFT 0, OPEN 11.54, AWAITING 17.93, SETTLED 48.18.
- One device: Ana and Ben joined by the FOAF trustline (`window.OL.pair` on the root), at the top of
  every plate.

## Plates

- **I · The Loan (0-10.05).** Tag "OnLoan · metered lending on the FOAF ledger" 1.35. Ana and Ben
  draw 1.35/1.97, the trustline 2.62 with "credit 100.00". Car 3.88, "LOAN · CAR · 0.25 PER KM ·
  DRAFT" 5.8. "Ana lends Ben her car, / metered by the kilometre." then "Where does it settle?" (red)
  6.43. Right label is the title.
- **II · The Meter (10-24.05).** Odometer 10.91, start reading 11.54 (bar to OPEN). The car token
  drives 13.47-17.3 while the digits roll; end reading 17.93 (bar to AWAITING).
  MeteringCalculator panel from 13.47: unit km, rate 0.25, then (48 296.7 - 48 210.0) x 0.25 18.58,
  = 21.675 19.85, half_up to 2 decimals -> 21.68 20.48. Red: "(end - start) x rate".
- **III · Capacity First (24-36.4).** Scale of Ben's credit with Ana 24.96. The capacity call
  26.22, capacity 100 28.14, 21.68 marked 28.79, "21.68 <= 100 · go" 29.42. The refusal case
  (credit 15.00) 30.69-32.6, "nothing is written to the ledger". Red: "check Ben's credit."
- **IV · Two Signatures (35.4-52.7).** Pine field with its own border, grid and bar copy (tick at
  AWAITING, moves to SETTLED 48.18). Ben's create card 37.57, custodian 38.82, Ben's signature
  39.45; the pending 21.68 rides the trustline to Ana 40.68-42.56. Ana's confirm card 42.56, her
  signature 44.44; token reads CONFIRMED 45.7; "OnLoan holds no keys" 46.3; red "Each side signs its
  own half." 46.93; "settled only on a 2xx with an operation id" 48.18.
- **V · The Tab (51.9-66.05).** Trustline thickens 53.2; balance Ben -21.68 · Ana +21.68, 78.32 of
  100.00 left. OnLoan box (loan row, status, operation id, no balance math) 55.68; FOAF box
  (trustline, transfer, operation, balance) 58.19; red "FOAF keeps the money." 59.44.
- **VI · Same Ledger (66-80.05).** foaf-client band (auth, contacts, ledger) 66.94. GrowOperative
  69.43 and OnLoan 71.31 each land an entry on the same trustline. "Your app" dashed 73.19. "A new
  app gets the same login, the same contacts, / and the same tabs." (red) 76.93.
- **VII · Colophon (80-88).** The lifecycle as construction lines; "Build the workflow. / Leave the
  money to the ledger." OnLoan · onloan.net, FOAF · github.com/FOAF-Foundation/foaf-client,
  novadiem.com.

`hyperframes check` flags the paper furniture's bar text as occluded and low-contrast under the pine
field at 44 s. That's intended: plate IV draws its own bar copy.
