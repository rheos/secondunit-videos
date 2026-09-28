# GAPS: spans that want generated coverage

Song frames at 24 fps, half-open. Lyric refs are line numbers into the local-only
`_hjeron-dream-of-fire/dream-of-fire.lyrics.txt` (L1 to L25 are the 97.6 s short mix).
Every span below is currently covered by real footage, never black. Ranked by how much the
cut needs the shot.

| rank | subject | song frames | time (s) | lyric | what covers it now | why it is a gap |
|---|---|---|---|---|---|---|
| 1 | **singing shot** (faceless, brim-shadow, mouth never visible or a veiled lipsync) | f1561-f1678 | 65.04-69.92 | L14-L15, first chorus lines | #25, #47, #23 fire and rock shots | there is no footage of him singing at all; the chorus has no performer beat |
| 1b | singing shot, second pass | f1899-f2164 | 79.13-90.19 | L20-L23 | bridge shots #27, #30 and fire #24, #20, #22 | the two repeated lines land on wide shots where he is 5% of the frame |
| 2 | **serpent** at sunrise (ref 3: snake in a fire ring on cracked earth) | f1399-f1486 | 58.31-61.90 | L12 | #15 real rattlesnake in dry grass, slowed to 0.5x | the real snake is daylight grass, no sunrise, no fire; graded blue it reads as texture |
| 2b | serpent rising | f1701-f1735 | 70.89-72.31 | L16 | #15 again (fourth use) | same clip repeated; needs a rising or uncoiling move |
| 3 | **ram skull and fire ring** (refs 1, 8, 9) | f0939-f0983 | 39.13-40.96 | L5 | #0 ram skull, tight crop | the real skull is on bare rocks, no fire ring, no Hjeron |
| 3b | ram skull, intro | f0084-f0162 | 3.51-6.73 | intro | #0 ram skull, slow push | same clip, first use; a fire-ring version would seed the motif |
| 4 | **moon** (ref 1: full moon behind him) | f0000-f0319 | 0.00-13.28 | intro | smoke #44, skull #0, dune #37, shadow #39 | no moon or true night sky in any clip; day-for-night only |
| 4b | moon, late night line | f2164-f2241 | 90.19-93.37 | L24 | #10 burning-sky silhouette, #43 clouds | the line asks for night; the tape has a red sky and dark clouds |
| 5 | **wolfdog at night** (ref 13) | f1450-f1544 | 60.42-64.34 | L12 end, L13 | #16, #11 real wolfdog, sepia daylight, slowed | real dog footage exists and is used; a dusk or night version beside him would match the refs |
| 6 | heat from the cracks (cracked earth, fire rising) | f2241-f2342 | 93.37-97.58 | L25 | #17 fire overlay on rocks, fade out | the ending is a flame overlay, not ground splitting; ref 3's cracked earth is the match |
| 7 | verse opening, him in the smoke | f0620-f0871 | 25.84-36.29 | L1-L4 | smoke #46, #45, dune walk #36, bridge #28 | first vocal lines are mostly sky and smoke; a close faceless portrait would anchor the verse |

Notes for whoever generates these:

- Character: black wide-brim leather hat, face lost in brim shadow, long black coat with fringe,
  black Les Paul, pendant, wolfdog. Sonoran desert, ram skull, fire ring, moon, storm clouds.
- Grade target is this cut's look (`tools/grade.py`): blue-black shadows, moonlit-blue highlights,
  only fire warm. Generate night plates, not sepia, so they drop in without fighting the grade.
- No MythMaker branding or text in any generated shot. This is Hjeron's solo act.
