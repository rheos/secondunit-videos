---
title: "rheoStream: One System You Own"
cut: developer
duration: 102.5
format: 1920x1080
mode: collaborative
music: "score-library drafting-table-rheostream take-01 (sha256 8b13e494...57bf), beats.json"
status: "draft 1: all seven plates built on the score; awaiting render go"
---

# rheoStream: One System You Own (developer cut)

Music only, no narration. Seven plates on the series kit (`kit/`, theme `rheo`). Times are score
seconds on a 96 BPM grid (a beat is 0.625 s, a bar 2.5 s); every plate is a whole number of bars so
the score can be planned section by section. Until the score exists the plates run on a placeholder
grid, then `BP.grid({ beats })` swaps in the measured one and every cue re-snaps.

**Message:** tools you own, records you can inspect and export, one door for every agent.
**Audience:** developers reading the repo, and Upwork clients hiring for backend or agent
architecture. The 60 s client cut comes later from the same drawings (plates I, III, IV, VI, VII).

**Truth rule:** every claim is checked against rheos/rheostream `main` (2026-10-15). Anything not
built is drawn dashed (`.planned`). Sources are listed per plate.

## Furniture (0 to 102.5)

Border, registration marks and grid rule in over the first 1.6 s. Bottom bar stations, the tick
moving at each: TOOLS 7.5 · SYSTEM 20 · DOOR 40 · WORK 55 · GATE 75 · STATUS 90. Sheet counter
bottom right, 01/07 to 07/07 at each plate start.

## Plate I · Title (0 to 7.5, 3 bars)

Labels `PLATE I` / `THE PROJECT`. A streamline field (five curves, the rheo.stream hero motif)
draws left to right and gathers into one channel. `rheoStream` in Geist 800 at 168px, revealed on
the beat; a 640px mint rule with end ticks under it; mono subtitle `A SELF-HOSTED FRAMEWORK FOR
AGENT-ASSISTED WORK`; small mono `AGPL-3.0 · OPEN SOURCE · RHEO.STREAM`. Out at 7.0.
No accent phrase. **Built as a style frame.**

## Plate II · The Scatter (7.5 to 20, 5 bars)

Labels `PLATE II` / `THE PROBLEM`. Five tool panes drawn one per beat at scattered positions:
INBOX, TRACKER, NOTES, CRM, CHAT, each a frame with a header rule and three content lines. Dashed
construction arrows hop between them, labelled `COPY · PASTE`. An agent node (double ring) at lower
right throws a dashed sight cone that covers only one pane, labelled `CONTEXT`.
Statement: "The assistant sees **one tab.**" (accent on "one tab."). From 18.75 the panes slide
toward the centre and fade, handing the centre line to plate III.

## Plate III · One Building (20 to 40, 8 bars)

Labels `PLATE III` / `ONE SYSTEM`. A section drawing of one building:

- Ground line across the plate with hatching below.
- Foundation slab: `POSTGRES · ONE DATABASE PER WORKSPACE`.
- Core floor: `CORE · FASTAPI · DURABLE WORKER · AUDIT`.
- Four rooms, drawn one per bar, each with a glyph: RECALLATRON / MEMORY (stacked records),
  LEADS / OPPORTUNITIES (funnel), CURRENT / ACTIVE WORK (checklist), RELATIONSHIPS / PEOPLE (two
  linked nodes).
- Roof band: `NEXT.JS SHELL`.
- Above the roof, dashed: the rheo agent, `RHEO AGENT · PLANNED`.
- A dimension line under the building: `ONE SYSTEM · FOUR MODULES`.

Statement: "One system. **You own it.**" Hold, out at 39.4.
Sources: README "What the framework does today"; `modules/` (current, leads, recallatron,
relationships). The conversational rheo agent is not built. **Built as a style frame.**

## Plate IV · One Door (40 to 55, 6 bars)

Labels `PLATE IV` / `ONE DOOR`. The building redraws small at left in elevation, a door on its right
wall labelled `MCP`. Four lanes come in from the right, each drawn then carrying a token to the
door: `CLAUDE.AI · OAUTH`, `CLAUDE CODE · SESSION MEMORY`, `TELEGRAM · RHEO BOT`, and `VOICE`
dashed (planned). Inside, one line fans out to the four rooms.
Statement: "Every client. **One door.**"
Sources: README (MCP facade over streamable HTTP); rheostream #288 (claude.ai OAuth), #284/#293
(Claude Code bridge), rheos/rheo-bot#4. Voice is not built.

## Plate V · Nothing Lost (55 to 75, 8 bars). Developer cut only.

Labels `PLATE V` / `DURABLE WORK`. The one plate on the light field (`.field`), a cutaway of the
worker:

- A job lane of five cards. Worker A leases card 2: `LEASE · SKIP LOCKED`.
- Worker A breaks (accent crack): `PROCESS DIES`. A dial sweeps: `LEASE EXPIRES`.
- Worker B leases the same card and finishes it (check). Note: `A WORKER WHOSE LEASE EXPIRED
  CANNOT COMMIT`.
- Right side: a double-walled box `ONE TRANSACTION` holding `STATE CHANGE` and `OUTBOX EVENT`; the
  event leaves to consumers, `DEDUPLICATED`.
- Footnote: `EVERY MUTATING CALL HAS AN AUDIT PATH, OR THE SERVICE WON'T START`.

Statement: "Nothing lost **mid-job.**"
Sources: `packages/core/src/rheo_core/work/jobs.py` (lease expiry, ownership check),
`events/deliveries.py` (SKIP LOCKED, consumer dedup), `operations/audit_paths.py` and
`audit/sink.py` (startup refuses a missing audit path).

## Plate VI · The Gate (75 to 90, 6 bars)

Labels `PLATE VI` / `SAFETY CLASSES`. Six classes drawn as a ladder, lower to upper: READ, DRAFT,
MUTATE, then a heavier rule, DESTRUCTIVE, EXTERNAL, FINANCIAL. Calls arrive as tokens. READ passes;
DRAFT and MUTATE pass and get an `AUDIT` stamp. The upper three stop at a gate: `APPROVAL · THIS
EXACT CALL`, the token held as `approval_required` until a check draws and the boom lifts.
Inscription beside the upper three: `NEVER A STANDING GRANT`. The effect paths of EXTERNAL and
FINANCIAL are drawn dashed (the execution half is not built).
Statement: "Risky calls wait **for you.**"
Sources: `packages/contracts/src/rheo_contracts/safety.py`, `docs/architecture/confirmation-and-safety.md`
(table of the six classes; "the external half of the table is not built yet").

## Plate VII · Status (90 to 102.5, 5 bars)

Labels `PLATE VII` / `STATUS`. A drawing schedule (revision table), rows filling one per beat.
Solid: CORE · WORKER · SHELL, RECALLATRON, LEADS, CURRENT, RELATIONSHIPS, MCP, EXPORT · RESTORE.
Dashed: RHEO AGENT, CONNECTORS · CHANNELS, VOICE.
Statement: "Inspect it. Export it. **Own it.**" Mono line: `RHEO.STREAM · GITHUB.COM/RHEOS/RHEOSTREAM
· AGPL-3.0`. Score fades 101 to 102.5.
Source: README "Current status and limits" (connectors, channels and packs unimplemented).

## Decided (Robin, 2026-10-15)

Storyboard approved. Coral accent kept. Plate V on the light drafting sheet. Credit line rheo.stream
only (no novadiem.com).
