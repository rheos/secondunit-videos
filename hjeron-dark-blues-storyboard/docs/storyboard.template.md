# Storyboard: "dream of fire" (hjeron_dark_blues)

<!--LOCAL-->

Hjeron's solo dark-blues act, in the persona of his earlier project Dark Blues Ritual (his music
project is The Wyrd One). No MythMaker branding anywhere. Hjeron consented to AI video of himself.
Vertical 9:16, 24 fps, 2342 song frames over the 97.567 s mix. PLAN ONLY: nothing in this file has
been generated. Every credit number below is a `higgsfield generate cost` estimate taken 2026-09-28.

Built on the real-footage rough cut in `../hjeron-dark-blues-realcut/` (48 shots, `docs/EDL.md`).
This board keeps most of that edit and its line cuts (which come from vocal-stem onsets), and
replaces only the spans that the tape can't cover.

## Production status (2026-09-28)

Built. The assembled cut is `output/dream-of-fire_storyboard-cut_f0000-f2342_24fps_9x16_master.mp4`
(local), shot list in `docs/EDL.md` (the as-built edit, which supersedes the board below where they
differ), reviews in `docs/reviews/`, spend in `docs/SPEND.md` (141.5 of 175). Changes from this board
during production: singing is H3 on frames of Hjeron's real in-character day take (veil down,
frontal or 3/4), graded locally into his neon; the veil is a black cloth, with one Odin eye at three
beats only; generated figures wear the long tattered duster of coat-reference.webp; the sand-ripple
shot became the forced-perspective guitar (inspiration 25); the wolfdog is in 12 shots.

## Treatment

A man in a black hat walks out of the night toward a moon with a serpent's face in it. In his own
sepia daylight he crosses skull and spire and dune with his wolfdog, then the snake in the grass
and the fire start talking to him. At sunrise one ember eye opens under his brim and the vision
takes over: he sings the hook as a silhouette inside the fire, a smoke serpent coils round him, and
firelight shows him painted on the canyon wall as if he had always been there. Then, cut between
his bridge and his fire, he sings the song's warning to us, twice. Night comes back as a scratchboard etching,
the dog walks under the moon, and the ground cracks open into the same fire. It builds because each
section hands the next one a bigger dose of the dream: tape first, myth creeping in, then myth
carrying the tape. It ends on his real fire, not on a generated one, fading to black.

## Rules this board follows

- His footage is never restyled. Real shots are cut, trimmed, sped or slowed only, and keep their own
  sepia, grain, torn borders, silver-grey mono or neon fire. Generated shots match a named real clip.
  The one approved conversion is scratchboard (46, 47).
- **Canonical character (revised 2026-09-28): "THE WYRD ONE" character sheet**
  (`hjeron-darkblues-ref/wyrd-one-character-sheet.webp`). The face is masked by a veil hanging from the hat
  brim, a black see-through cloth (the sheet draws it as fine cords): he can see out, you can't see his face at all; layered worn cloak and hooded mantle, leather cargo pants and
  boots, a green beaded fringe necklace, a black Les Paul. Behaviour: calm, deep rhythmic breathing,
  accelerating in performance. This supersedes the earlier "faceless by lighting only, nothing over
  the face" rule for every GENERATED shot. His real footage is untouched and keeps its own look.
- **Singing direction (Robin):** no profile shots. The head faces camera or three-quarters and
  barely turns; you know he's singing because the head moves with the phrasing. NO face, lips or beard
  visible at any moment (Robin: "a black cloth that he can see through but you can't see his face at all")
  (counter-example: `hjeron-darkblues-ref/counterexample-too-much-face.webp`).
- Every singing shot is 2 to 3 s and intercut with real footage.
- One pull-back BRIDGE only (09). Every other transition comes from his own visual language, built
  locally for free.
- Generated shots only where the tape can't do it: singing, the moon serpent, the fire ring, the
  ember eye, the smoke serpent, the rock-wall painting, the night conversion, the cracks.
- About 30% AI by screen time (actual: see Totals).

## Look targets (his four house looks)

| look | clips | what to match |
|---|---|---|
| sepia torn-photo | #11-#16, #27-#42, #47-#50 | warm amber, lifted blacks, heavy grain, dust, vertical scratches, light leaks, torn and burned photo border |
| neon fire composite | #17-#26 | hot pink/violet sky, orange flame overlays, purple-black silhouette |
| on-black | #2, #3, #43-#46 | smoke and torn-mask reveals on pure black |
| silver-grey mono | #0, #1 | ram skull, storm sky, heavy vignette, glitch bars at the bottom edge |

**Local worn-film finish on every generated shot** (free, before it goes in the cut): colour
transfer (LAB mean/std) from the named real clip; grain lifted from that clip (the high-pass
residual of its temporal median, looped over the shot); the torn/burned border plate from the same
clip (the temporal median of its edge band, multiplied over the frame); a 1 to 2 px gate weave. Neon
shots get his flame motion screened back on top if the model froze the overlay.

## Lipsync (revised after wave 1)

Wave 1 settled the method and rejected both takes (`docs/reviews/wave1.md`):

- **LS1** (job e1d42c7a, method 1 from real #22 frame 100): REJECTED by Robin. H3 invented a thick
  beard in profile, "too clearly not him". There is no real frame of his face anywhere, so any
  lipsync built on his own footage has to invent one.
- **LS2** (job 61a783cf, method 2, the #23 clip as video reference): REJECTED. It kept his real
  motion and the flames, but the head is in profile and the flames cover it, so it reads as his
  footage, not singing.

New approach: H3 method 1 (image reference + vocal slice, the one that syncs) on a **veiled
frontal or 3/4 still of The Wyrd One**, made with GPT Image 2.5 from the character sheet and placed
in the look of the real shot it sits between. The sheet's own veil panels (frontal and 3/4) are
only about 135 x 166 px, too small to be the H3 reference directly, so they go in as identity refs
to the still, and the still is the H3 reference.

| still | framing | built from | look of | used by |
|---|---|---|---|---|
| **V1** | frontal, medium close, chest up | sheet + frontal veil panel (4x crop) + real #22 frame 100 | #22 neon | LS1b (31, 33) and LS3b (44) |
| **V2** | three-quarters toward camera, waist up | sheet + 3/4 veil panel (4x crop) + real #23 frame 30 | #23 neon | LS2b (38, 40) |

The H3 prompt carries a fixed singing paragraph: face the camera or 3/4, head barely turns, the
head moves with the phrasing, deep rhythmic breathing lifts the chest and shoulders, the veil
stirs and breathes outward on the sung phrases; behind it only darkness: never a profile, face, lips,
beard or a parted veil.

**Probe (one shot, not submitted): LS1b = V1 still 4.5 + H3 6 s 15 = 19.5 credits** (both from
`generate cost`, 2026-09-28). Review V1 before paying for the H3 pass: if the veil, frontal angle or
neon look is wrong, stop at 4.5. Accept the H3 take only if no profile, beard or face shows in any
frame and the head visibly phrases with the vocal onsets.

## Character sheet reuse for the generated shots

- **Identity ref everywhere:** every GPT Image 2.5 still (A1 moon walker, A3 ember eye, A5 rock
  wall, A6 cracks, V1, V2) takes the sheet as its identity reference instead of the old refs 2, 5
  and 9, and the shared character paragraph describes the veil, cloak, mantle, cargo pants and green
  beaded necklace.
- **Which panel:** A1 is seen from behind, so the turnaround back and 3/4 back. A3 is a frontal
  portrait: the frontal veil panel, and the ember now glows through the black veil. A5 is a
  full figure: the turnaround front. A6 is a tiny distant silhouette: the side view.
- **Wolfdog:** the sheet has no dog. The generated night wolfdog (SB2) is an Omni Edit of real
  #11, and the tiny dog in A6 takes real #16 frame 0 as its reference, so the dog is always his.
- **Continuity note:** his real clips don't show the veil (they are silhouettes and shadows). The
  veil only appears in the generated shots, so it reads as his vision-self. Say so if that's wrong.

## Transitions

| # | type | frames | where | how it's built | cost |
|---|---|---|---|---|---|
| T1 | MATCH CUT, moon to horn curl | f0144 | 02 to 03 | cut; A1 is framed so the moon sits where #0's horn curl is (a framing note in the A1 prompt, checked on the still) | 0 |
| T2 | LIGHT-LEAK FLASH accent | f0319-f0323 | band entry | local ffmpeg: warm radial gradient, screen blend, 4 f | 0 |
| T3 | SHADOW PASS | f0389-f0401 | 05 to 06 | local: #40's shadow as a luma matte, slid across frame | 0 |
| T4 | MATCH CUT, guitar neck to spire | f0460 | 07 to 08 | cut; both vertical on the same axis (reframe #13 by up to 1.1x if needed) | 0 |
| T5 | **BRIDGE, the pull-back** (only one) | f0524-f0620 | 08 to 10 | Kling 3.0 start/end, reused take | 0 (retake 6) |
| T6 | SMOKE WIPE | f0697-f0711 | 10 to 11 | local: his #44 smoke on black, screen blend across the cut | 0 |
| T7 | SPLICE JUMP accent | f0939 | into 15 | local: 2-frame vertical slip + a hot splice line | 0 |
| T8 | FILM BURN-THROUGH | f1128-f1146 | 19 to 20 | local p5/ffmpeg: a noise-grown hole with an orange rim and bubbling edge, revealing the next shot | 0 |
| T9 | GATE WEAVE accent | f1219-f1222 | drum hit | local: 3 f of weave and a density flicker | 0 |
| T10 | TORN PHOTO | f1236-f1252 | 22 to 23 | local p5: freeze, age the frame to his sepia, tear along a noise path, rip away | 0 |
| T11 | EYE FLASH | f1540-f1548 | 29 to 30 | local: the ember eye blooms to white, then his real flash #9 | 0 |
| T12 | DOUBLE EXPOSURE DISSOLVE | f1680-f1701 | 33 to 34 | local: singer over the burning sky over fire (lighten blend), his Dark Blues Ritual signature | 0 |
| T13 | SMOKE WIPE | f1770-f1786 | 35 to 36 | the serpent's own smoke plus his #46 smoke, screen blend | 0 |
| T14 | EMBER SCATTER | f1889-f1907 | 37 to 38 | local p5: bright pixels become particles that rise and re-form as the next frame | 0 |
| T15 | TORN PHOTO | f2044-f2058 | 41 to 42 | as T10, neon onto sepia (the hard switch the realcut EDL flagged) | 0 |
| T16 | SCRATCHBOARD ETCH | f2168-f2184 | 45 to 46 | local: scratch.mp4 is the same #37 clip converted, so its white lines are revealed over the real frame with a growing hatch mask | 0 |
| T17 | CRACK OPEN | f2280-f2296 | 48 to 49 | local: a mask from A6's widening crack splits the frame onto his #17 fire | 0 |

## Full-song board

{{SHOTS}}

## Totals

{{TOTALS}}

**Already spent: 30 credits** (wave 1, LS1 and LS2, both rejected; `docs/SPEND.md`).

**Remaining planned: 110. Spent plus planned: 140 of the 150 HARD CAP**, so only 10 credits of
headroom, less than one lipsync retake. Two ways to hold the cap: (a) take the cuts below before
production (dropping C1 and A2 frees 9, dropping LS3b frees 12.5), or (b) Robin raises the cap to
about 175 to keep a real retry allowance (35). Robin decides. Nothing is submitted until then. Log
every generate in `docs/SPEND.md`.

For scale: the four earlier dream-of-fire sections cost 66.5 to 101 each, and the augment tests
cost 50. This board covers the whole 97.6 s for 110 more (140 with wave 1), because the bridge
and the scratchboard are takes Robin already approved, two animations start from his own frames (no
still needed), V1 serves two singing shots, and every transition is local.

Where to cut if the number has to come down:

| cut | saves | cost to the video |
|---|---|---|
| drop LS3, keep the real #22/#26 on L23 | 12.5 | the wake-up run has one singing beat instead of three |
| A4 serpent as a local p5 smoke sprite over the real #23 | 6 | loses the smoke-through-fire interaction |
| A1 moon as the GPT still with local parallax and smoke, no Kling | 4.5 | the serpent's eyes don't open |
| A2 fire ring dropped, back to the realcut's slow #0 | 4.5 | the [L5] line loses its callback to the fire |
| C1 dropped, the realcut's #3 at 0.8x | 4.5 | the smoke doesn't close over them |
| floor with all five | about 69 | |

## Production order

**Wave 1 (done, 30 credits, both rejected):** LS1 method 1 and LS2 method 2. Result: method 1
syncs, method 2 doesn't read, and real frames can't carry a face that doesn't exist.

**Wave 1b, the probe (19.5, needs Robin's go):** the V1 still first (4.5), reviewed against the sheet
and #22, then LS1b on the hook (15). Gate: no profile, no beard, no face in any frame; the head
phrases with the vocal onsets; the veil breathes with the phrases and nothing of the face shows through; the neon survives.

**Wave 2 (56):** LS2b (V2 still + H3), LS3b (reuses V1), A3 ember eye, A4 serpent ring, A6 cracks.
**Wave 3 (34.5):** A1 moon, A2 fire ring, A5 rock wall, SB2 night wolfdog, C1 smoke continue.
**Then local only:** the 17 transitions, the worn-film finish, and assembly against the unbroken
song with a frame-count check.

## Risks

- **H3 may lift, part or thin the veil** and show a face or beard, as LS1 invented a beard. The
  first V1 still already lets a faint nose ridge show through the strands, so the veil must read as
  dense black cloth.
- **Singing may not read through a veil.** With no lips at all, the head's phrasing, the breath and
  the veil's movement have to carry it. If it reads as nodding rather than singing, the fix is framing (closer) and prompt beats.
- **Veil continuity:** real clips have no veil; the generated shots do (see the character sheet
  section).
- **Neon flame overlays under H3 and Kling.** The flames are his post composite, and the models may
  freeze or smear them. The fix is local: screen his real flame motion back over the shot.
- **Timing.** words.json runs early, so every lipsync slice and the "eyes" flare (29) must be set
  from vocal-stem onsets during wave 1 and 2, not from the word list. H3 needs at least 5 s, so LS3
  is sent 5 s of audio and only its last 40 frames are used.
- **Resolution.** H3 renders at 768p and the reused Kling takes are 720p, against his 1080 x 1920
  clips. His grain hides most of it, but close-ups (31, 44) will be the softest shots in the cut.
- **Look drift in the board-style animations** (A1, A3, A5, A6), which start from generated stills.
  Review each still against its named real clip before paying for the Kling pass.
- **Cultural material.** The glyphs in A5 and the stone ring in A2 are invented, not copies of real
  petroglyphs or of a real medicine wheel. Several of those are sacred sites (see RESEARCH.md).
- **The machine is shared.** Warn the other sessions before the local renders.

## Research

Sources and how each detail is used are in `docs/RESEARCH.md`.
