# What Does One SDK Give Your App?: build state

Music-only blueprint explainer for foaf-client, the FOAF SDK (slate item 12, slug `foaf-client`), for
developers who might build an app on FOAF. It follows "OnLoan: Where Does the Loan Settle?" and stays on
the SDK surface: one login, the person's contacts, ledger calls signed through the custodian, and the two
packages that ship it.

## Facts used

Read 2026-10-17 from `FOAF-Foundation/foaf-client` origin/main at 3a1cca0 (the local checkout sits on a
security branch one commit off main; I read main through `git archive`), plus `foaf-auth` for the token
claims and `foaf-next-v2` for the palette. foaf-docs has no SDK page; nothing was taken from it.

- **One SDK per side, two languages.** `README.md`: a Ruby gem (auth.foaf.io RS256 verification plus the
  ledger client) and a TypeScript package (auth, contacts, ledger, adapters, React Native UI).
  `AGENTS.md`: `gem/` exposes `Foaf::Auth` and `Foaf::Ledger`; `client/` exposes `auth`, `contacts`,
  `ledger`, `adapters`, `ui`; `contracts/` holds wire fixtures for both. Dependency direction
  `ledger -> contacts -> auth` (the bar stations follow it). The Ruby gem has no contacts client, so
  plate VI lists only what it has.
- **Imports (plate I)** are the three lines in `client/README.md`.
- **Login (plate II).** `client/src/auth/FoafAuthClient.ts#login` posts `/v1/sessions` with
  `client_id`; Apple, Google native and OAuth link methods exist in the same class. foaf-auth
  `service/app/services/jwt_issuer.rb`: RS256, `iss`, `aud` = the audience, `sub` = foaf_id, `jti`,
  `foaf_address` when bound. `service/app/controllers/v1/base_controller.rb`: `client_id` must be a
  registered audience. The five checks are `gem/lib/foaf/auth/verifier.rb` and README "Contract
  rules": issuer, audience, JWKS key status, identity cutoffs, revoked JTIs.
- **Contacts (plate III).** `client/src/contacts/FoafContactsClient.ts#list`: GET `/v1/contacts` with
  `client_id` and the bearer token. `client/src/contacts/types.ts`: `foaf_address` is non-null only for
  confirmed contacts.
- **Trustline (plate IV).** `client/src/ledger/FoafLedgerClient.ts`: `updateTrustline` posts
  `/api/v1/networks/:net/trustlines/update` signed for the creditor (`X-Signature`); `userTrustlines`
  reads `/users/:addr/trustlines`. `AGENTS.md`: those rows are already viewer-oriented, negative balance
  means the viewer owes, `received` is the viewer's credit limit, `given` the counterparty's.
- **Signing, no keys (plate V).** `client/src/ledger/signer.ts`: Ethereum `personal_sign` over the exact
  body; `createRemoteCustodianSignatureProvider` (POST `/v1/internal/custodian/sign`, service token,
  throws on 5xx or network, never a local-key fallback) and `createSessionSignatureProvider`
  (`/v1/custodian/sign_for_self`, the caller's own session). `docs/architecture.md` "Remote custodian
  signing (v1 default)": apps should not hold FOAF private keys. ADR-0001 (custodian lives in
  auth.foaf.io), ADR-0006 (sign_for_self for UI-only apps). `createPendingTransfer` posts
  `/api/v1/pending_transfers` signed for the sender.
- **Packages (plate VI).** `docs/adoption.md`: the gem is a Bundler git dependency pinned to a tag with
  `glob: "gem/*.gemspec"` (shortened on screen to git + tag); `gem/lib/foaf_client/version.rb` is 0.2.0
  and tag v0.2.0 exists. TypeScript is copy-synced with `scripts/sync-to-app.sh` and checked with
  `check-drift.sh`; `client/package.json` is `"private": true`. UI components and theme overrides:
  `client/src/ui/` and `THEME.md`. `Foaf::Custodian.remote_provider`: `docs/architecture.md`.

Not built, drawn dashed: "Your app" (the viewer's), on-device keys (ADR-0004: Phase A is "named, not
built"), and an npm package (the TS side is copy-synced "for now").

Synthetic on screen: Mira, Tomas, Jun, their areas, ids and addresses, `your-app`, 50.00 credit lines, the
12.00 transfer and the signature. No real people, accounts, keys or amounts.

## Now: draft 1 (2026-10-17)

- Score: score-library `drafting-table-foaf-client/take-01`, sha256
  `c93c5690522b710f73674955d9b0534e26800e8e5c65a457ad70e520af7e2872`, 85.92 s, ~95.7 BPM.
  `beats.json`: librosa beats 0.06-79.42, extended to 85.69 at 0.627 s. Music decays from ~82 s and is
  silent from 83.86.
- Getting the score on a fresh checkout (audio stays out of git): from `secondunit/mv-projects`,
  `cp ../score-library/drafting-table-foaf-client/take-01.mp3 novadiem-foaf-client/_in/score.mp3`, then
  `shasum -a 256` must print the hash above.
- Plate starts on the score sections: 0, 10, 24, 38, 52, 66, 78; end 85.9.
- Theme `foaf` (added to the kit in this branch): the FOAF site's navy #0d1c2a and blue #324ccd on a cool
  pale sheet, pink accent darkened to #c2306d for contrast, navy field. Red Hat Display (the site's
  display face) and JetBrains Mono from Google Fonts.
- Bar stations: SIGN IN 10.1, CONTACTS 24, TRUSTLINE 38, TRANSFER 52.
- One device: `window.FC.rig` on the root, your app (dashed), the foaf-client band with its three
  modules, auth.foaf.io and api.foaf.io, across the top of every plate. Each plate lights the module
  and the service it is about.

## Plates

- **I · One SDK (0-10.05).** Rig draws in 1.3-4.7; the three imports 5.05; "FOAF-CLIENT · ONE SDK FOR
  APPS ON FOAF" 6.6. "Your app needs a login, contacts and a ledger." 5.7, red "What does one SDK give
  it?" 6.95. Right label is the title.
- **II · One Login (10-24.05).** AUTH and auth.foaf.io lit 10.7. Login card 11.3, JWT card 14.4 with
  `aud your-app`. "One FOAF login," / red "issued to your app's own audience." Five verifier checks 19.15
  on, one per beat.
- **III · Their Contacts (24-38.05).** CONTACTS lit. `contacts.list()` 25.25, three contact edges 26.5,
  27.75, 29.0 (Jun unconfirmed, address null). Red "Confirmed ones carry an address."; addresses
  underlined 32.85.
- **IV · The Trustline (38-52.05).** LEDGER and api.foaf.io lit. You and Mira on a FOAF trustline 39.25.
  updateTrustline card 41.1, "A signed write sets the credit line." 42.4; the read card replaces it
  46.15; red "Every row reads from your side." 48.05.
- **V · Signed, No Keys (52-66.05).** Transfer 53.35, exact body 54.9, custodian at auth.foaf.io 56.8,
  ledger 58.65. "The custodian signs the exact bytes." / red "Your app holds no keys." The two built
  providers 61.5 / 62.1; device keys dashed 63.35.
- **VI · Two Packages (66-78.05).** All three modules lit. Ruby column 67.15, TypeScript column 69.0,
  npm dashed 71.5, `contracts/` 72.15. Red "One wire contract under both." Everything clears 77.4.
- **VII · Colophon (78-85.9).** The stations as construction lines; "One login, their contacts, signed
  writes." / red "No keys in your app."; foaf-client · the FOAF SDK, github.com/FOAF-Foundation/foaf-client,
  novadiem.com, all in by 82.2 while the music rings out.
