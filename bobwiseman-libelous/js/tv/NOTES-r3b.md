# TV news, round 3, agent tv-B: stanzas 6-10 (song 95.917-240.917, frames 2302-5782)

Page: `looks/tv-r3b.html`. Loads the TV kit read-only (core, timing, r2_timing, crt, captions, show, ad, room,
lesson, news, r2_captions) plus `gen/r3b_tv_lines.js` (built by `node js/tv/r3b-make-lines.mjs`, gitignored)
and its own files `js/tv/r3b-*.js`. Every top-level name starts with `r3bTv` / `R3BTV`.

Same TV, same room, same bulletin as round 2's stanza 11: the anchor at the veneer desk in front of the orange
dot-matrix map, the over-the-shoulder box, still "news film" inserts in the same cel manner, the canary
teleprinter paper across the lower third. The kids' show, the commercial and the flannel-board lesson only
appear as footage inside the bulletin (in the box, the big box, or as a full cut to the clip). Their own clocks
(B, C) run on the same lines.json times, so they still land on the word.

## Captions

The teleprinter wire copy of round 2 (Courier New Bold capitals, 26 columns, cap 36 signal px, typed on the
onset, print head, 0.14 s line feed), with FOUR rows instead of three (rowH 58, paper 430-682 signal px): with
three rows, 14 lines rolled off before their read time. `r3bTvCheckRows()` checks every frame at load. The
paper is taller than stanza 11's (468-682), so the cut at 5782 shows the paper drop by one row as the new
bulletin starts on fresh paper.

Faces: every head drawn in the new art and the anchor registers a box (`r3bTvHead`); `r3bTvCheckFaces` logs an
error on any frame where one meets the paper. Kit footage (ad, lesson, show) doesn't register heads: its faces
were composed above round 1's sing-along band, and the full cuts to the commercial are lifted 56 px (x1.07) to
clear the paper.

## Framings inside the program

DESK (anchor centre-left, box 340x250 top right), BIG (anchor smaller left, box 528x396), FULL (the clip or the
news film full frame). Room camera: set framing, creeping; pull back to the room at 117.18 (the king spends his
coins into the box), at 157.70 (stanza 7's last lines, the crown glint on the stamp), and at 239.30 so the last
frame matches the room framing the next bulletin opens on.

## Beats (lines.json onsets)

| time | framing | beat |
|---|---|---|
| 95.917 | DESK | the bulletin is on; the puppet theatre waits in the box |
| 96.83 | BIG | the kids' show big in the box: Rapunzel pops up 96.89, braid 100.11 |
| 101.13 | BIG | the picture in the box rolls through the bar to the station card |
| 101.83 | FULL | cut to the commercial: clown 102.95, kids 103.85, the swap 104.75, the counter 106.41, stools spin |
| 110.15 | DESK | the anchor reads the mama/daddy line to camera; the clown conducts in the box |
| 113.84 | FULL | the party: hats, paper crown, the clown points |
| 117.18 | DESK, pull back | the end card in the box; the king's coins fly from his sack into the box |
| 120.52 | BIG | the counter rolls to thirty (121.32); coins pour from the grille in the room |
| 123.125 | BIG, push in | the felt lesson as footage: ink barrels, drain, publishing house, man, fist, wallet, wheels, lid, stacks |
| 141.16 | DESK | the anchor holds up the red book (142.40); its title appears on it word by word (143.14, 144.12) |
| 144.62 | BIG | the doctor, the diploma, the scribble, the free tag, the bun, the heart, the glass and cup |
| 158.40 | DESK, pull back | the felt people, the stamp (crown glint in the room 160.99), fries, the tip jar |
| 165.083 | DESK | the anchor reads; the box: a navy policy binder with the crown, opens 166.79 |
| 166.91 | FULL counter | three girls pop in behind the counter, smile; puppet strings on the last word (168.33) |
| 168.69 | window | dusk to night 169.59, moon and stars; clock hands race 170.13; tinsel and baubles 170.79 |
| 172.12 | counter | they step up and one waves 172.70 |
| 173.12 | close | bubble gum grows and pops 174.90; braces |
| 175.56 | counter + manager | the manager pops on 176.00, pointer and smile chart 176.30, smiles snap wide 178.34, sparkles 178.60 |
| 178.96 | restroom | the door swings open 179.40, the mop swishes, bubbles 180.36 |
| 180.82 | grill | a patty flipped 181.94, steam |
| 182.10 | time clock | the card goes in and the box jumps 183.42 |
| 184.26 | wall clock | the hands race until the next line |
| 185.87 | counter | light bulbs over their heads 186.83, linked arms and red badges 188.05, sway 188.65 |
| 189.29 | counter + manager | he points 189.97, her hat flies, she whooshes out 190.35; his ear grows 191.43; the others cover their mouths 192.75 |
| 192.89 | wall clock | hands round; the clock stretches long 194.07 |
| 194.55 | grill | green stink lines 194.95; a thermometer pops and boils over 196.03; sweat |
| 196.23 | ladder | she reaches for the star; the rungs fall away 196.91 |
| 197.23 | close | the pay envelope opens 197.57; empty, a moth flies out 198.05 |
| 198.125 | FULL farm | picture-book farm: hens pop 198.55, pigs 199.41 |
| 199.72 | sheds | grey shed, crown on the door 199.74, vents puff 200.90, more sheds 201.62; haze over the sun 203.46 |
| 204.48 | inside | one bare bulb; hens in stacked cages, pigs in stalls; the bars rattle and the bulb flickers 206.12 |
| 206.60 | shed end | crates on a conveyor into a dark door; red lamps 207.56 and 207.84; shutter slams 208.48 |
| 208.60 | other side | trays of meat on a belt, a tray pops 209.28; a yellow drip 209.86, a brown one 210.98 into the gutter |
| 212.0 | DESK | the anchor, grave; the shed in the box |
| 213.458 | FULL map | Britain in orange dots; the couple pop 213.82, target ring 214.75; zoom in, they turn queasy 216.37 |
| 216.83 | sitting room | backs of their heads on the sofa; the king on their TV 218.07; he ticks side to side, a pendulum 218.95, a clock dial 219.77 |
| 220.21 | a door | they walk in, she reaches the green door, it opens 221.29 |
| 222.09 | typewriter | the sheet types up 222.45, a crossed-out crown 222.81, pulled out and copies fan 223.25 |
| 223.73 | street | rain 225.21; sun and heat waves 226.93, they fan with their leaflets |
| 227.21 | street | three passers-by each take a leaflet 227.57, 228.39, 230.06 |
| 230.30 | DESK | the anchor reads; in the box the couple raise their leaflets 231.84 |
| 234.06 | sitting room | the parents pop in 235.26, wag fingers 236.36, a big palm 237.24 |
| 237.54 | street | the king's crowned shadow 237.92; three barristers march in 238.86 |
| 239.26 | DESK, pull back | the box: palace hedge; constables pop up 240.18; the room framing the next bulletin opens on |
