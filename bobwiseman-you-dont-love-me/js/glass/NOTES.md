# Stained glass (verse 3 + outro), notes

Page `looks/glass.html`, song time 151.0-233.04 (verse 3 to the end of the song), rendered 151.0-233.04. All drawn live on canvas, 0 credits.
One place: a four-lancet leaded window in a stone wall, stone floor below. The camera moves left to right
across it, one lancet per sung line, then pulls back. Times in `timing.js` (Whisper snapped to the mix's onsets).

| Time | Shot | What happens |
|---|---|---|
| 151.0-152.1 | portal | opens inside the roundel at the head of lancet 1, which holds the bridge's swirled teacup as glass, laid out exactly as the teacup frame at 151.0 (`v3-portal.js`). The swirl keeps turning at the bridge's speed and settles by ~152; the camera pulls back out of the roundel (fast, easing) onto her for "do i" (stem onset 151.89). Bloom, shafts, vignette and grain come back over 0.75 s, and the hanging daisy swings down into place from top right. Mirrors verse 2's push into the oculus |
| 151.89-156.8 | L0 close, woman with scroll | "spell it out": the scroll unrolls from her right hand to her left (151.5-153.7), then the leaded letters YOU DON'T LOVE ME go in one by one from "spell" (153.82, 0.19 s apart). Text sized with fitText to the ribbon between her hands |
| 156.83 / 159.55 | backing x2 | daisy petals 20 and 21 drop; truck right to L1 |
| 161.98-167.8 | L1 close, woman holding a glass heart | the heart cracks on "crack" (163.02: /k/ burst after the closure gap), flash, shards, camera jolt. 165.0 her right hand picks up a glue tube, 165.75-167.2 runs amber glue down the crack, withdraws |
| 167.83 / 170.60 | backing x2 | the glue fails: halves spring apart, the tip piece drops out; petals 22, 23; truck to L2 |
| 172.6-178.8 | L2 desert | a sleeved hand waters the sand from a brass can (from 174.3, "raised"), the stem grows, bud on "flower", sun flares on "desert", on "sings" (177.57) the flower opens: shut eyes, round singing mouth; glass notes rise |
| 179.20 / 181.58 | backing x2 | the flower sings the backing; petals 24, 25; truck to L3 |
| 184.1-190.5 | L3 empty throne | seasons cycle in the sky panes, the branch and the ground (summer, then 14 seasons in 4.7 s, ending in winter); her hair greys; the crown above the throne is plain clear glass, a glint crosses it on "king" (188.5) |
| 191.5-199 | pull back to the whole window | all four lancets lit, light pool on the floor; petal 26 on the first held phrase's "me" (194.24) |
| 194.5-210 | light changes | day -> golden (199.5) -> dusk (204.5) -> night (209.5); cracks spread from the heart across the background panes from 196.5; half the quarries, borders and sky panes fall out one by one 203.75-211, the lead stays and night shows through |
| 205.12 | last petal | the 27th petal falls on the held phrase's "me": the daisy is bare |
| 210-223 | outro, quiet | the window at night, figures dim, the bare daisy. From 215 world time slows to a stop (`worldT`): a little moonlight comes up, the daisy stops swaying, the camera drifts back and rests at 223 |
| 214.60-224.56 | Bob walks in | (Bob's note: "maybe Bob from satisfied mind walks through the frame dragging his toy piano and juno awards?") the man from Satisfied Mind's tarot cards (red hat, blue tunic, red bundle on a stick) walks in from the left across the nave floor on the tail's first onset, pulling the toy piano on its rope, the three Junos clattering behind on strings. 8 fps steps; the piano bumps on its casters and jolts on the eighth-note beats, the Junos hop one after another on the beat. A cool moon pool comes up on the floor as he enters (`outro-bob.js`, times `OB` / `OB_BEATS` in `timing.js`) |
| 224.56-227.35 | under the daisy | he stops a little left of the bare daisy roundel (the Junos tip over), looks up at it (224.61), lays his bundle (still tied on its stick, knot and spots showing) on the floor in front of him and lifts his hat to it (225.55, the Fool card's hat lift), hat back on (226.68), looks down (227.0) |
| 227.35-231.6 | walks off | on the last beat he walks on, a touch brisker, and out of the right edge as the music decays; the last Juno rattles out at ~231.6 |
| 231.75-233.04 | fade | the empty, still nave; a short fade to black 231.75-232.45, black to the last frame |

Bob's drawing is copied, not loaded, from bobwiseman-satisfied-mind `js/tarot/core.js` + `figures.js` (printer, person, piano,
rope, juno, junoTrail) into `outro-bob.js`, in its own closure. It is printed the same way (colour stencils off register,
black key block, ink mottle, paper tooth) and cut out on its cream card stock, then multiplied by a cool moonlight
gradient (brighter up top) so it reads against the dark wall, with soft contact shadows under feet, casters and Junos.
Drawing units x 3.3 = world units; he walks on world y 2900, ~380 px tall at the resting camera. Nothing is drawn before
214.60: frames up to 214.58 are byte-identical to the version without him.

Daisy: the hanging leaded roundel (screen space, top right), same design and place as verse 1 and 2 (`v2-main.js`):
27 thin ray petals, 19 gone before verse 3, 20-27 drop here clockwise, each on the /m/ onset of a backing "me" in the
Demucs vocal stem: 158.43, 161.25, 169.50, 172.20, 180.46, 183.27, 194.24, 205.12. The 27th is the long held
phrase's "me", so the daisy ends bare.

Outro audio: Whisper only hears the tail "you don't love me" at 214-216.3, but the vocal stem keeps strong energy to
~228.4 (more repeats or ad libs, or instrument bleed; not checked by ear). The music decays from 228 and is silent
from ~232. Beats (librosa on the mix and the no_vocals stem): ~87 bpm, eighths every 0.345 s, last hit ~227.35.

Files: `glass.js` (palette, glass texture, pane/lead/grisaille), `window.js` (lancet geometry, quarries,
border, wall, floor, falling panes), `figure.js` (the woman), `scenes.js` (the four lancets), `v3-portal.js` (the
teacup roundel at the head of lancet 1, drawn in place of its rosette), `main.js` (camera, light, floor pool, shafts,
bloom, daisy, outro), `outro-bob.js` (the Satisfied Mind cameo in the outro).
