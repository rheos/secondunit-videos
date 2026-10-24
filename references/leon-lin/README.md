# Leon Lin: code-made films and the tools behind them

Leon Lin (github.com/Leonxlnx, Munich) writes films and tools entirely in code, mostly with coding
agents. He also wrote taste-skill, the upstream of our `design-taste-frontend` skill. Unlike the other
profiles here, this one is about methods, not a way of seeing: six of his repos, each read against our
own pipeline and either borrowed from or set aside.

Studied 2026-10-23 and 2026-10-24 (issues #298 to #303). All six repos are MIT. Anything we copy keeps
his notice, the way `tools/motion-lab/vendor/LICENSE-*.md` does for Remotion. paper-fox's soundtrack
and open-water's rain and thunder recordings are licensed separately: never copy those.

## The six, with a verdict each

| Repo | What it is | Verdict | Study |
|---|---|---|---|
| earshot (#298) | Lets an agent hear audio: listening transcript, sync audit, search, a bank of 252 sounds written as code | Borrow `timeline --cues` as a sync check and the sound bank for code-drawn films; drop `critique` (launch-film scorecard) | `STUDY-earshot.md` |
| paper-fox (#299) | One-minute cut-paper film: multiplane diorama engine, baked paper with bevels and shadows, a rigged fox, nine object transitions | Borrow named techniques into our cut kit (texture baked into each piece, scaled baked shadows, curtains / light flood / pop-up transitions, the fox's follow-through and planted-foot walk); vendor `src/core` only when a paper film needs a real depth camera | `STUDY-paper-fox.md` |
| shanshui (#300) | Ten ink-wash landscapes in WebGL2 and Canvas, with a fast offline renderer | Take three renderer tricks now (`forensics.mjs` pop/jump/hold checks next to badframes, dither before 8-bit, blur first then grain); keep the ink pass as a look recipe for when a song wants mountains and mist | `STUDY-shanshui.md` |
| lumenshaders (#301) | Generative shader studio with seamless loops and WebM export | Borrow the loop trick (noise sampled around a circle) into `tools/canvas-loop`; don't use LUMEN as a Canvas source as shipped (no 9:16, WebM only, generic fields) | `STUDY-lumenshaders.md` |
| cinetic (#302) | An agent skill that directs software launch films: concepts, a 273-move technique library, critics, a ship gate | Don't install (claims every video ask, defaults to Remotion, bans our cream palette); borrow the encoded-file QA scripts, the refute-before-fix verifier, the text-flow numbers and a filtered technique list | `STUDY-cinetic.md` |
| open-water (#303) | A physically based ocean and storm in WebGL2 | Keep as a reference and a sea/storm plate generator, rendered only on a real GPU (Modal GPU once a card is on the account; a few stills on this Mac); not for our CPU cloud render. Take its review method now: a fixed scene set every round, domain critics, a verifier, a regression judge | `STUDY-open-water.md` |

## What the six have in common (inference)

Every film is a pure function of time with seeded randomness, rendered offline from headless Chrome,
so frames can be rendered in any order; open-water is the exception (its foam and clouds carry
history and need a warm-up). Every repo checks its own output with numbers before a person sees it:
pixel forensics, sync audits, critics against reference photos. That matches our motion-lab audit and
review checklist, and it is where most of the borrowable parts are.
