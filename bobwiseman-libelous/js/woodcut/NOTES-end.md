# Woodcut chapbook, last chapter: stanzas 12-14, 261.5 to 340.4375 (f6276-f8171)

Page: `looks/woodcut-end.html`. Files: `js/woodcut/end-*.js` (timing, figures, blocks, main), words from
`js/woodcut/gen/end-lyrics.js` (made by `end-make-lyrics.mjs` from source/lines.json, gitignored). The stanza-1
kit (`woodcut.js`, `print.js`, `figures.js`) is loaded read-only; nothing in it is changed. The camera, caption
slots and page furniture are copies of `main.js` under new names (suffix E).

Lines are named by their index in lines.json (111-131) so this file quotes nothing.

## How it differs from stanza 1

- Same sheet engine: one long uncut sheet of 8 pages on the table, whip pans that land one frame before a new
  line, a straight cut when the old line ends under 0.45 s before (only 124 to 125).
- The side column can't hold 21 lines, so each page's column starts as far back as still fits by that page's
  last line (`colStart`); the earliest lines drop off the top.
- Lines 128 and 131 (the held one-word shouts) are set at 156 px on a lower baseline (986).
- Big initials T, W, Y, P are kerned in (a T left a hole under its arm).

## Beat list (song seconds)

| Time | Page | What |
|---|---|---|
| 261.50 | 0 court | first frame: the court printed (bench, judge, crown, calendar, clock, empty jury box, the couple's table); 111 starts |
| 261.52-264.95 | 0 | 14 calendar leaves tear off and flutter away, the clock hands race, the couple's paper stacks rise |
| 266.59 | 0 | 112 "jury": a shaft of light opens on the empty jury box |
| 267.47, 267.91 | 0 | "legal", "aid": the couple shrug; the judge looks to them |
| 268.16-268.42 | | whip pan |
| 268.46 | 1 king's side | 113: the king on his sacks, rays behind; three barristers arrive |
| 268.75 | 1 | "king": the crown hops |
| 269.78 | 1 | "30": three more barristers |
| 270.00 | 1 | "billions": the last three, and three more sacks pile up behind the king |
| 270.66 | 1 | "dollars": the sacks open, coins spill |
| 272.40 | 1 | 114 "crush": the king smiles, the barristers lean in, a tied bundle of papers comes down over the couple |
| 274.36 | 1 | "defend": the couple hold their leaflets up and the bundle stops, pushed back a little |
| 275.54 | 2 speaking out | 115: the couple on a crate, the man holding up leaflets, the woman with a speaking trumpet; sound cuts on every sung onset |
| 279.09 | 2 | 116 "TV": a cabinet set pops in, the woman on its screen |
| 279.93 | 2 | "newsprint": a broadsheet with a cut of the couple |
| 280.89-282.0 | 2 | "internet" to "crowds": a web of heads on threads spreads left to right across the top |
| 282.23 | 3 the judge | 117: close on the judge (full-bottomed wig, red robe, the crown on the bench), head down, eyes shut |
| 282.81 | 3 | "judge": he wakes, eyes open |
| 283.67 | 3 | "end": he looks down |
| 284.79 | 3 | 118 "agreed": two nods |
| 285.95 | 3 | "couple": he looks off to the left, toward them |
| 287.35 | 4 five views | 119: the couple hold up their leaflet; a roundel opens above on each line's start, with a ray from the leaflet |
| 288.29 | 4 | "greed": two hands clutch a bulging sack, coins squeeze out |
| 290.36 | 4 | "workers": a worker in a paper cap at a grill, steam |
| 292.10 | 4 | "wealth": the crown on a pillar of coin (the red accent) |
| 293.86 | 4 | "torture": a hen in a cage too small for her (plain, no gore) |
| 295.54 | 4 | "health": a bun and a cracked heart |
| 296.40 | 5 verdict | 124: the judge raises the gavel; the couple stand before the bench |
| 296.94, 297.47, 298.60 | 5 | "fine", "guilty", "fuss": three strokes on the sound block, impact cuts; on "fuss" a purse of coin (the fine) drops onto their table |
| 298.98 | 6 outside | CUT. 125: the court from outside; the couple come out of the door and down the steps (2.3 s) |
| 299.46, 302.80, 306.52, 317.06, 320.52 | 6 | every "people" (in 125, and the starts of 126, 127, 129, 130): a new group with leaflets pops up |
| every last word of 125-131 | 6 | "Libelous": everyone's leaflets go up, held 1.8 s |
| 311.86 | 6 | 128, the first held shout: 34 leaflets are thrown into the air |
| 325.50 | 6 | 131, the last held shout: leaflets thrown again; the sky's cuts turn to rays and the sun rises behind the court (3.4 s) |
| 331.06-331.57 | | whip pan to the last page |
| 331.61 | 7 colophon | strong hit: the inked block comes down (0.1 s), a jolt; the printer's device prints: a hand from a cloud holding up a leaflet, in a garlanded oval |
| 332.25, 332.67, 333.18, 333.73 | 7 | the tailpiece prints centre-out under the block, on the last hits of the band |
| 333.2-337.4 | | pull back to 0.46 while the music fades: the last two pages on the table |
| 337.4-340.44 | | hold (the record is silent from 337.5) |

The colophon page carries no words: the column's flowers, the printer's hand and the tailpiece are type
ornaments, as on the book's first page before the king.

## Checks

- Pure: `node js/woodcut/end-purity.mjs` (15 times, 8 others between, reversed): all byte-identical.
- Caption audit: `node work/motion-lab/audit.mjs looks/woodcut-end.html 261.5 340.4375 --spec audit.spec.mjs`.
