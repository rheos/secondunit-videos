# Lemo-Opuscar: 66 film styles made in code

Lemo-Opuscar (github.com/lemomo-ai/lemo-opuscar, LemoLab, MIT) is a library of 66 film styles for Claude
Code, tuned for Opus 5.5, the model we build with. Each style is a `STYLE.md` (the rules of the style)
plus one demo film of about 40-60 s, drawn in canvas, WebGL or three.js, scored with sampled CC0
instruments and voiced with Kokoro, with no video model. Sixteen of the styles are built from real
material instead: archive footage, documents, satellite imagery, lidar, CAD files. Two guides sit on top:
`DIRECTOR.md` (how to direct a film) and `TECHNIQUE.md` (how to build one). Gallery:
https://lemomo-ai.github.io/lemo-opuscar/

Like the Leon Lin profile, this one is about methods and vocabulary, not a person's way of seeing. It was
filed as a candidate by the 2026-11-01 review of ten motion-design repos (PR #377) and studied for issue
#387.

Read 2026-11-02 from a shallow clone of commit `bebbbe1` (7:52 am Sat Oct 31 Pacific): every STYLE.md,
the sixteen documentary and evidence demos' DEMO.md, tools, CREDITS and FACTS files, the two guides,
`core/README.md` and the gallery page. Nothing was installed, rendered or generated. The plugin was not
added.

## Verdict

**Don't install the plugin; take vocabulary, rules and a few tools.** Its skill claims any request for a
film in a named style and runs its own pipeline (its own brief, treatment, Kokoro voice, sampler, one fix
round), which would compete with the video-production skill, HyperFrames and our client review loop, the
same reason cinetic was not installed (`references/leon-lin/STUDY-cinetic.md`). The library itself is
worth more than any other source we have read on code-made film, because each style is written as rules
that transfer: what makes it read, what it is not, its native moves, its pitfalls with their fixes.

Under the "build a language, not a copy" rule (art-direction §2): from each style take its vocabulary
(materials, marks, moves, camera and sound grammar). Never a demo's story, subject, shot list, composition
or palette. Every demo here is someone's film.

## The four studies

| Study | Question | Verdict |
|---|---|---|
| `STUDY-styles.md` | All 66 styles against our 84 looks: which we have under another name, which we lack, which suit our clients | 7 have, 39 partial, 20 lack. Build first: the six below |
| `STUDY-edit-and-evidence.md` | The 16 Edit & Documentary and Evidence Films styles, for Mark Achbar's reel and devweb | Two looks for Mark, two for devweb; adopt their source discipline (four-part FACTS.md, a sources ledger that keeps rejects, numbers written by script) for every factual film |
| `STUDY-director-technique.md` | `DIRECTOR.md` and `TECHNIQUE.md` against the video-production skill's review-checklist and art-direction | Nine rules and two files to take: reading time scaled by length, two silences and two J/L cuts, four camera moves, subject a third of frame height, 0.2 s strips of key actions, `CREDITS` and `FACTS.md` |
| `STUDY-packaging.md` | How a style is packaged (STYLE.md sections, style.json) against our look YAML fields | Theirs teaches, ours records. Proposed: four optional recipe fields (`not`, `moves`, `pitfalls`, `uses`) |

## Looks worth building first

All canvas2d (or one light WebGL pass that can stay 2D), so they render on our cloud runners.

1. **Archive light table** for Mark Achbar: real archive objects on a backlit table, a loupe as the door
   into each, catalogue-true labels, no vintage grade.
2. **Evidence board on one clock** for Mark Achbar and devweb postmortems: every source on one clock,
   uncertainty drawn, known against unresolved.
3. **Marker briefing wall** for devweb: meaning-coded marker ink, the wrong fix erased to a ghost, the
   verdict stamped after a held look, the whole wall revealed last.
4. **Marker over screen recordings** for devweb: watch the bug, freeze, draw one finding; dashed for
   intended, solid for actual.
5. **A tour as a transit map** for IndieAgent: each run of dates a line, a shared bill an interchange.
6. **One line in motion** for Bob Wiseman: a quiet song as one unbroken line, the pen stopping as the
   event; our approved spiral-line portrait made to move.

Each would get a look test on a client's real material and its own `looks/<slug>.yaml` the usual way.
Nothing here is queued; Robin picks.

## Tools worth porting (MIT; keep LemoLab's notice beside anything copied)

- `core/render/readcheck.mjs`: the page reports every visible text with its box; the checker fails any text
  held too briefly for its length or not fully in frame. Generalises our Achbar-only `holdcheck.py`.
- `styles/caption-news/demo/tools/footage.py` (in every documentary demo): search Internet Archive, Commons
  and NASA, fetch with a size cap, log licence and dimensions to `SOURCES.jsonl`.
- `styles/briefing-board/demo/sources/candidates/candidates.json` + `kit/tools/fetch_sources.py`: a
  licence ledger that keeps every candidate looked at, rejected ones too, with sha256.
- `styles/archive-lighttable/demo/tools/sru.py`: Library of Congress catalogue lookup that gets past the
  Cloudflare wall on loc.gov item pages.
- `styles/microscope/demo/tools/export.mjs`: fails the build when a number in the narration differs from
  its measurement.
- `styles/visual-investigation/demo/tools/final_asr.py`: cuts each spoken line out of the finished film
  and checks it with faster-whisper (already installed).
- `styles/kino-montage/demo/tools/rhythm_report.py`: motion energy per half second, flat stretches, cuts and
  hit alignment on a finished file.
- `styles/telestrator/demo/tools/homography.py`: flattens any filmed plane from four known points.

## Licence

- Code and guides: MIT, "Copyright (c) 2026 LemoLab".
- **Demo films and stills: CC BY 4.0 (LemoLab), not MIT.** Every third-party asset in a demo keeps its own
  licence (`demo/CREDITS`). Three narration tracks are excluded from both licences (Game Show Flat's macOS
  voices, Paper-cut Lightbox's Edge TTS, Broadcast News Package's Doubao TTS).
- Credit-required packs inside demos: MuldjordKit drums (CC BY 4.0), Salamander Grand Piano (CC BY 3.0).
  `teardown`'s STEP importer `occt-import-js` is LGPL-2.1.
- Their public-domain reasoning for archive material is American. Mark's film is made with Knowledge
  Network and TVO, so archive items need a Canadian check before broadcast use.
- The "LemoLab × Claude Opus 5.5" end cards belong to their demos only.

## What is fact and what is inference

The descriptions of each style, its rules, tools and licences are read from the repo. The matches against
our looks, the client fits, the rankings and every verdict are ours.
