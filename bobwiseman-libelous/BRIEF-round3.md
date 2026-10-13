# Round 3: three whole-song versions, one look each (shared brief)

ROOT = /Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-libelous. Run everything from ROOT.

Bob (2026-10-13) watched draft 1 (which mixes the looks) and asked for THREE full-length versions, each in ONE look
the whole time:
1. **Woodcut** (the chapbook, "the first filter").
2. **Fact sheet** (the photocopied leaflet, "the 3rd one you start at 2:45").
3. **TV news** ("the filter at 4:04": the 1970s news bulletin on the TV set, anchor at the desk, the over-the-shoulder
   box, and the canary-yellow teleprinter wire-copy captions). Bob wants the whole song "as if by that filter", so the
   TV version uses the news-bulletin frame and teleprinter captions throughout; stanzas 6-7's kids-show material may
   appear inside the news (as footage in the over-the-shoulder box or a cut to a clip), but the captions and frame
   are the news bulletin's.

Read first, in this order: BRIEF-agents.md (the captioning rule and look rules: every sung word on screen on its onset,
made of the look's own material; allegory only, no company name, no arches, no clown colours; the couple are stand-ins,
never jailed; animal and "urine and stool" lines stylised and plain), BRIEF-round2.md (how round 2 was built and
audited), README.md (section map, the song's story), STORYBOARD.md, source/lines.json, source/libelous.lyrics.txt, and
your look's js/<look>/NOTES.md (+ NOTES-end.md for woodcut). Look at how the existing stanzas of your look are drawn and
match them exactly (same kit, same camera manner, same caption system).

## Section map (song seconds, frames half-open at 24 fps)

| # | Stanza | Time (s) | Frames |
|---|---|---|---|
| 0 | Intro | 0-13.9 | 0-334 |
| 1 | The king's chain | 13.9-34.4167 | 334-826 |
| 2 | The dictators' ball | 34.4167-48.38 | 826-1161 |
| 3 | The land deal | 48.38-62.08 | 1161-1490 |
| 4 | The king breathes easy | 62.08-75.42 | 1490-1810 |
| 5 | Farmers, cattle, poison, forest | 75.42-95.9167 | 1810-2302 |
| 6 | Rapunzel, the clown ad, the children's party | 95.9167-123.125 | 2302-2955 |
| 7 | Tons of ink, the "Nutritional Facts" book | 123.125-165.0833 | 2955-3962 |
| 8 | The workers | 165.0833-198.125 | 3962-4755 |
| 9 | Factory farms | 198.125-213.4583 | 4755-5123 |
| 10 | The couple and their fact sheet | 213.4583-240.9167 | 5123-5782 |
| 11 | One Tuesday: the king's legal teams | 240.9167-261.5 | 5782-6276 |
| 12 | The case, the judge, five views | 261.5-296.33 | 6276-7112 |
| 13 | Verdict, the "Libelous" refrain | 296.33-329.5 | 7112-7908 |
| 14 | Tail | 329.5-340.4583 | 7908-8171 |

What each look already has (KEEP these spans exactly as they render now; do not edit their files):
- woodcut: 0-2302 (looks/woodcut.html) and 6276-8171 (looks/woodcut-end.html)
- fact sheet: 3962-5782 (looks/leaflet.html)
- TV: 2302-3962 kids show (looks/tv.html) and 5782-6276 news (looks/tv.html). For the TV-news version, 5782-6276 is
  kept as is; 2302-3962 gets rebuilt in the news frame (see agent tv-B).

## Who builds what (each agent: NEW files and a NEW page only)

| Agent | Look | Stanzas | Frames | Page | Files |
|---|---|---|---|---|---|
| wood-A | woodcut | 6, 7 | 2302-3962 | looks/woodcut-r3a.html | js/woodcut/r3a-*.js |
| wood-B | woodcut | 8, 9, 10, 11 | 3962-6276 | looks/woodcut-r3b.html | js/woodcut/r3b-*.js |
| leaf-A | fact sheet | 0-5 | 0-2302 | looks/leaflet-r3a.html | js/leaflet/r3a-*.js |
| leaf-B | fact sheet | 6, 7 | 2302-3962 | looks/leaflet-r3b.html | js/leaflet/r3b-*.js |
| leaf-C | fact sheet | 11-14 | 5782-8171 | looks/leaflet-r3c.html | js/leaflet/r3c-*.js |
| tv-A | TV news | 0-5 | 0-2302 | looks/tv-r3a.html | js/tv/r3a-*.js |
| tv-B | TV news | 6-10 | 2302-5782 | looks/tv-r3b.html | js/tv/r3b-*.js |
| tv-C | TV news | 12-14 | 6276-8171 | looks/tv-r3c.html | js/tv/r3c-*.js |

Rules for parallel work (several agents edit the same look at once):
- Load the look's existing kit files read-only from your page. NEVER edit an existing file in js/<look>/, looks/, gen/,
  source/ or lines.json. If you need a change to a shared function, copy it into your own r3x-*.js under a new name.
- Every top-level name you define is prefixed with your agent key (`r3aWood...`, `r3cLeaf...`) so pages can't clash.
- Caption-generation scripts write to your own gen/ file (e.g. gen/r3a_lines.js), never an existing one.
- Your span's first and last frames must read as a finished picture: the coordinator joins the spans with hard cuts at
  the frame boundaries above. Where your span meets an existing span of the same look, make it read as one continuous
  piece (same page layout, camera manner, caption system; the woodcut's sheet/page numbering and side column carry on).
- One place moving forward per stanza. Stage what is sung, on the word.

## Captions are the contract

Fire the motion-lab probes exactly as the existing code of your look does ('word#<line>.<word>' on a word's first drawn
frame; PROBE.box for each caption against its container). Then audit every frame of your span:

    node work/motion-lab/audit.mjs looks/<your page>.html <t0> <t1> --spec audit.spec.mjs   (add --safe 0.05 for TV)

Target: every sung word on its onset (2 frames early to 1 late), every caption inside its container. Also keep captions
OFF faces (Robin, 2026-10-13): never lay a caption over a person's or the king's face; test caption boxes against your
figures' head boxes on every frame.

## Checking and reporting

Contact sheets and full-res stills only (check.mjs; check.mjs --full), with 1:1 crops of faces, hands and text.
renderFrame must be pure (prove it). Do NOT render mp4s; the coordinator renders. Do not commit. Comments must not quote
the lyric. Report: beat list with times, files, audit numbers, 3 full-res stills, and anything that didn't come off.
