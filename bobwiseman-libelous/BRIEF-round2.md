# Round 2: the full draft, mixing three looks (shared brief)

ROOT = /Users/robin/Code/novadiem/indieagent/secondunit/mv-projects/bobwiseman-libelous. Run everything from ROOT.

Bob (2026-10-11) liked three of the round-1 looks: the woodcut chapbook, the 1970s TV sing-along, and the
photocopied fact sheet (not the courtroom, not the school cartoon). The full draft moves between those three, each
part of the story in the look that suits it. Every stanza of the song gets built; the existing round-1 spans are
kept as they are.

Read BRIEF-agents.md first: its captioning rule and look rules still hold in full (every sung word on screen on its
onset, made of the look's own material; allegory only, no company, no arches, no clown colours; the couple are
stand-ins, never jailed; animal and "urine and stool" lines stylised and plain). Then README.md (section map, the
song's story), STORYBOARD.md, source/lines.json, source/libelous.lyrics.txt, and your look's js/<look>/NOTES.md.

## Who builds what

| Agent | Look | Stanzas | Song time (s) | Frames |
|---|---|---|---|---|
| woodcut-A | woodcut | 2 dictators' ball, 3 land deal, 4 king breathes easy, 5 farmers / cattle / poison / forest | 34.4167-95.9167 | 826-2302 |
| woodcut-B | woodcut | 12 the case and the judge, 13 verdict + "Libelous" refrain, 14 tail | 261.5-340.4375 (to the end of the song) | 6276-8171 |
| tv | 1970s TV | 7 tons of ink: the "Nutritional Facts" book (as the TV show's educational segment or an ad) ; 11 one Tuesday: the king's legal teams (as a 1970s TV news bulletin on the same set) | 123.125-165.0833 and 240.9167-261.5 | 2955-3962 and 5782-6276 |
| leaflet | fact sheet | 8 the workers, 9 factory farms (the couple's leaflet pages, typed, illustrated, copied) | 165.0833-213.4583 | 3962-5123 |

Already built and kept (do not change how they render): woodcut 0-34.4167 (intro + stanza 1), tv 95.9167-123.125
(stanza 6), leaflet 213.4583-240.9167 (stanza 10). Snap your span edges to lines.json and the frame grid; the frame
numbers above are the contract (half-open), so the parts butt together with no gap or overlap.

## Where your work goes

- tv and leaflet: extend your look's own page and files (looks/<look>.html, js/<look>/). Widen T0/T1 to cover your
  new spans. The kept span must render pixel-identical: before you edit, save stills at 8 times inside it
  (check.mjs --full), and after, re-render the same times and compare (max pixel difference 0, or explain any diff).
- woodcut-A: extend looks/woodcut.html and js/woodcut/ the same way (the kept span 0-34.4167 pixel-identical).
- woodcut-B: do NOT edit js/woodcut/*.js or looks/woodcut.html (woodcut-A is editing them). Build your stanzas in new
  files js/woodcut/end-*.js and a new page looks/woodcut-end.html that loads the woodcut kit files read-only plus
  yours. If you need something changed in a shared woodcut file, copy it into your own end-*.js under a new name.
- Never edit another look's files, source/, lines.json, or anything outside ROOT.
- Seams: your first and last frames must each read as a finished picture (the draft cuts between looks on stanza
  boundaries, hard cuts). Inside a look, keep one place moving forward per stanza.

## Captions are the contract

Fire the motion-lab probes exactly as the round-1 code does (probeWord in js/common/core.js: 'word#<line>.<word>'
on a word's first drawn frame, and PROBE.box for each caption against its container). When done, audit every new
span (the audit tools are in work/motion-lab):

    node work/motion-lab/audit.mjs looks/<page>.html <t0> <t1> --spec audit.spec.mjs

Target: every sung word in your spans on its onset (2 frames early to 1 late), every caption inside its container.
Fix and rerun until clean; report the numbers.

## Checking

Contact sheets and full-res stills only (check.mjs; check.mjs --full), plus 1:1 crops of faces, hands and text.
Several sessions share this Mac: do NOT render mp4s; the coordinator renders and assembles the draft.
Pure renderFrame (prove it as before). Words only from lines.json. Comments must not quote the lyric.

## Report back

Beat by beat with times; files touched; audit numbers; the kept-span pixel compare; 3 full-res stills that show it
best; anything that didn't come off, plainly.
