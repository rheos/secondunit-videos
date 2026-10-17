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

## Draft 8: the light holds through Bob's walk (Bob's note on draft 7, 2026-10-14)

Bob: "we sit with the ending too long, with the darkness of the video ending before cartoon bob walks across...i
wish we still saw some action or delayed the dimming of the light." The table above is draft 7. In draft 8:

- Light (`TOD` in `main.js`): day to golden at 199.5 as before, then a late golden afternoon (I 0.92 to 0.88)
  instead of dusk at 204.5 and night at 209.5. Dusk and night come only at `TOD_DIM` = 229.3-231.75, after Bob has
  walked out of the right edge and while the piano and Junos trail out; the fade to black is unchanged (231.75-232.45).
  The light runs on real time (`drawGlassWorld(..., { rt })`), the night stars and the moon pool only with the night.
- World time runs on until 229.3 (draft 7 slowed it to a still image from 215), so the dust in the shafts, the
  sunbeam hotspots and the scenes keep moving while he walks. The camera still comes to rest at 223 and the daisy
  still stops swaying for him.
- Bob is lit by the window's warm light while it is day (`OUTRO_BOB.draw(g, t, cam, tod)`), moonlight once night
  comes. He crosses the floor through the window's coloured light pools.
- Falling panes (203.75-211) now show daylight through the holes instead of night sky.

Frames before 199.5 are unchanged.

## Draft 9: the Pips stay, sing the refrains and dance out the song (Bob's notes on draft 8, 2026-10-15)

Baseline 8b (5bcf8fb, cpP1M3Nu9MQ). Bob's four notes, built as written:

- "the Pips are gone by :08 but I would like them to remain closer to :17": the intro Pips (`v1-pips.js`) no
  longer leap out at 8.46. They keep dancing through the up-from-black and the window reveal, grow back to their
  floor size as the camera pulls out, and leap out of the top on the bar at 16.8. Frames before 8.1 are unchanged.
- "could one or all three stick their heads in each time to sing the 'you don't love me' refrain?": new
  `pip-heads.js`. Two Pips (left and right singers of the bridge trio) pop their heads in for all twelve refrains
  (27.42 ... 191.24, snapped to the backing onsets), alternating bottom corners and sides, mouths on the vocal
  stem. The middle Pip is the petal plucker, already there, so all three are in every refrain. Drawn in
  `v1-main.js`, `v2-main.js` and `main.js` over the scene, under vignette and grain.
- "can they enter for the rest of the song @ 3:15 to dance around?": new `pip-finale.js`. All three drop in on
  the beat at 195.37, land one per beat on the nave floor and dance a new move every beat or two, behind little
  Bob as he walks; hat tip with him at 225.55, leap out at 230.72 before the fade.
- "0:49 ... i just want her lips in a kissy face and peck her head twice like a chicken": `v1alt-wave.js`. Her
  lips go into a squeezed kissy face on V1.waiting and hold (never parted) through the near miss; on V1.kissed she
  jabs her head out at the wave twice, 0.35 s apart, a smack on each.
- "2:45 ... i believe the glue stick should be inverted": in `scenes.js` (local, quotes the lyric) the tube is
  turned over in her hand, nozzle up and left, and the nozzle's point runs down the crack line.

## Draft 10: the Pips in sharkskin, with a synchronized step finale (Bob's photo, 2026-10-16, #176)

Baseline draft 9 (63125df, KTAHdM5sC4U). Bob sent a 1960s soul group publicity photo: five singers in matching
pale sharkskin tuxedo jackets, mid-step in one move. The photo is a press shot and stays out of git.

- Costume (`bridge-trio.js` drawSinger, so every appearance gets it: the intro, the refrain heads, the petal
  plucker, the bridge trio and the finale): a pale silver glass jacket with a lighter leaded piece for the sheen
  down each front and each sleeve (the fronts catch more light as he leans), satin-black peaked lapels with their
  own sheen strip, one button, black pocket welts, a black bow tie with a satin knot, white shirt, black trousers
  with a satin stripe, and the trousers' seat showing through the cutaway below the button. The gold sequins are
  gone. Faces, sizes, poses and timing outside the finale are unchanged.
- Finale (`pip-finale.js`): from the ta-da (200.88) to the hat tip (225.58) one unison step routine in 4-beat
  phrases built on the photo's pose (`PF_STEP.KEY_R` and its mirror: a knee up and across, weight on the back foot,
  both arms reaching forward and down with open palms, a new `palm` value on a pose). Kicks land on the beats of
  `PF_B`, the step is the half beat before each one, and the line travels 70 world units a step (right, left, right,
  left: back to centre by the hat tip). Double kicks, the photo held with two claps, a unison spin, kicks with a
  clap on every and. The entry, the middle one's pluck of petal 27 (he rejoins in step on b17), the hat tip with
  Bob, the wave and the exit are as draft 9; the ta-das are now all three the same.
- `mixPose` treats a scalar one pose lacks (the palm) as 0; all the older poses share their keys, so nothing they
  draw changes.
- Five Pips, each his own man (Robin, after Bob's reply 2026-10-16: "their differences are part of the fun", and the
  singer on the left of the photo wore "big buddy Holly glasses"). `SINGERS` in `bridge-trio.js` now holds five, with
  height (`sz`, the whole figure on the same floor), build (`bw`), face size and shape, hair (`style`: part, pomp,
  fade, afro, cap), mustache, ears, grin, and `specs` (big black horn-rims): Specs (tall, slim, glasses), the lead
  (pompadour, pencil mustache; the petal plucker, draft 9's size exactly so the pluck geometry is untouched), the big
  man (short, broad, full mustache), the tallest (lanky, short afro), the kid (shortest, round face). `PIP_LINE` puts
  them left to right as Specs, the kid, the lead, the tallest, the big man.
  - Intro (`v1-pips.js`): five, landing on the first five half beats; the ta-da is a pyramid (low at the ends, the
    lead highest); gap 200 (was 230). The two on the left pass behind the pillar on the strut, as draft 9's left one did.
  - Refrain heads (`pip-heads.js`): still two heads a refrain plus the plucker (four heads would crowd the scene and the
    daisy); the pairs take turns two refrains each, Specs and the big man, then the tallest and the kid.
  - Bridge: the stage, its three discs and mic stands are built for three, so it stays a trio (`TRIO_THREE`: Specs, the
    lead, the big man); the mic stands are set to each man's height.
  - Finale (`pip-finale.js`): five in the line (gap 470, was 600), landing on the half beats from PF_B[5] to PF_B[7];
    the middle place is the lead, who still goes up for petal 27. The steps are the same, in unison.

## Draft 11: the singers are women, and little Bob is gone (Bob's notes on draft 10, 2026-10-17)

Baseline draft 10 (7fa02fc, IZiE_0-P_ak). Bob: "I unfortunately realize now they should be female. dresses. big hair.
Also I don't like the little bob and piano anymore. i think it is overkill. can you take that away?" (He had asked
for little Bob out on draft 9 as well; Robin, 2026-10-17: take it out of this video only. Little Bob stays in the
other Bob videos.)

- Little Bob (`main.js`): the outro no longer draws `outro-bob.js` (the man, his piano, the Junos, his moon pool and
  shadows). The light, the camera, the daisy and the singers' finale are as draft 10, so 214.6 to the end is the five
  singers dancing in the window's late light, then dusk, their leap out (230.72) and the fade.
- The singers (`bridge-trio.js` drawSinger and drawSingerHead, so every appearance changes together: the intro, the
  refrain heads, the petal plucker, the bridge trio and the finale): matching 1960s girl-group cocktail dresses in
  the silver of draft 10's sharkskin, a sleeveless fitted bodice with a scoop neck, a black satin sash, a knee-length
  A-line skirt with a beaded hem whose two sides ride on the knees (every kick still lifts it), a sheen piece down
  the bodice and skirt, slow sequin twinkles (no flashes on the beat), pearls, bare arms with a silver bangle, sheer
  stockings, black pumps. Faces get fine arched brows, lashes and a liner flick, rouge, red lipstick (closed: a red
  bow; singing: parted) and earrings. No mustaches. Big hair (`PIP_HAIR`, a back mass behind the face and a front
  piece over it, `big` = width and crown height): Specs a bouffant flip (with her horn-rims), the lead a tall
  beehive, the big one a round bubble bouffant, the tallest a big natural, the kid a flip with a ruby headband and
  bow. Heights, builds, skin tones, face shapes, the line order and every move and time are draft 10's.
- The salute and flick poses, a hat tip on the men, now read as a hand to the hair.
- Cut: `out/_render_d11.sh` (cloud-render --draft for verse 1, verse 2, the bridge trio span and verse 3 + outro,
  draft 9's own bridge parts for the rest), file `out/ydlm_full-v13_*`.
