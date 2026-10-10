# Stained glass (verse 3), notes

Page `looks/glass.html`, song time 151.0-214.0, rendered 149.5-215.0. All drawn live on canvas, 0 credits.
One place: a four-lancet leaded window in a stone wall, stone floor below. The camera moves left to right
across it, one lancet per sung line, then pulls back. Times in `timing.js` (Whisper snapped to the mix's onsets).

| Time | Shot | What happens |
|---|---|---|
| 149.5-151.6 | floor, tilt up | the window's coloured light on the stone floor; tilt up to lancet 1 |
| 151.45-156.8 | L0 close, woman with scroll | "spell it out": the scroll unrolls from her right hand to her left (151.5-153.7), then the leaded letters YOU DON'T LOVE ME go in one by one from "spell" (153.82, 0.19 s apart). Text sized with fitText to the ribbon between her hands |
| 156.83 / 159.55 | backing x2 | daisy petals 5 and 6 drop; truck right to L1 |
| 161.98-167.8 | L1 close, woman holding a glass heart | the heart cracks on "crack" (163.02: /k/ burst after the closure gap), flash, shards, camera jolt. 165.0 her right hand picks up a glue tube, 165.75-167.2 runs amber glue down the crack, withdraws |
| 167.83 / 170.60 | backing x2 | the glue fails: halves spring apart, the tip piece drops out; petals 7, 8; truck to L2 |
| 172.6-178.8 | L2 desert | a sleeved hand waters the sand from a brass can (from 174.3, "raised"), the stem grows, bud on "flower", sun flares on "desert", on "sings" (177.57) the flower opens: shut eyes, round singing mouth; glass notes rise |
| 179.20 / 181.58 | backing x2 | the flower sings the backing; petals 9, 10; truck to L3 |
| 184.1-190.5 | L3 empty throne | seasons cycle in the sky panes, the branch and the ground (summer, then 14 seasons in 4.7 s, ending in winter); her hair greys; the crown above the throne is plain clear glass, a glint crosses it on "king" (188.5) |
| 191.5-199 | pull back to the whole window | all four lancets lit, light pool on the floor; petal 11 on the first held phrase (194.6) |
| 194.5-210 | light changes | day -> golden (199.5) -> dusk (204.5) -> night (209.5); cracks spread from the heart across the background panes from 196.5; half the quarries, borders and sky panes fall out one by one 203.75-211, the lead stays and night shows through |
| 205.30 | last petal | the 12th petal falls on the held phrase's "me": loves me not |
| 210-215 | quiet | the window at night, figures dim, the bare daisy |

Daisy: a hanging leaded roundel (screen space, top right): 12 petals, 4 already gone before verse 3 (so the count
reads as continuing from earlier verses), 8 drop here, one per backing phrase at its "me" (onset + 1.45 s).

Files: `glass.js` (palette, glass texture, pane/lead/grisaille), `window.js` (lancet geometry, quarries,
border, wall, floor, falling panes), `figure.js` (the woman), `scenes.js` (the four lancets), `main.js`
(camera, light, floor pool, shafts, bloom, daisy).
