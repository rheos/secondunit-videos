# Storyboard: "dream of fire" (hjeron_dark_blues)

> Public copy: lyric lines are tokens ([L14]) that index the local-only lyrics file. The local docs/STORYBOARD.md has the real lines and is gitignored.

Hjeron's solo dark-blues act, in the persona of his earlier project Dark Blues Ritual (his music
project is The Wyrd One). No MythMaker branding anywhere. Hjeron consented to AI video of himself.
Vertical 9:16, 24 fps, 2342 song frames over the 97.567 s mix. PLAN ONLY: nothing in this file has
been generated. Every credit number below is a `higgsfield generate cost` estimate taken 2026-09-28.

Built on the real-footage rough cut in `../hjeron-dark-blues-realcut/` (48 shots, `docs/EDL.md`).
This board keeps most of that edit and its line cuts (which come from vocal-stem onsets), and
replaces only the spans that the tape can't cover.

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
  (`hjeron-darkblues-ref/wyrd-one-character-sheet.webp`). The face is masked by a veil of long black
  cords hanging from the hat brim; layered worn cloak and hooded mantle, leather cargo pants and
  boots, a green beaded fringe necklace, a black Les Paul. Behaviour: calm, deep rhythmic breathing,
  accelerating in performance. This supersedes the earlier "faceless by lighting only, nothing over
  the face" rule for every GENERATED shot. His real footage is untouched and keeps its own look.
- **Singing direction (Robin):** no profile shots. The head faces camera or three-quarters and
  barely turns; you know he's singing because the head moves with the phrasing. Lips are only
  glimpsed through the veil sometimes, NEVER the full face or a beard
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
head moves with the phrasing, deep rhythmic breathing, the cords sway, lips only glimpsed between
the cords, never a profile, a beard, a full face or a parted veil.

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
  portrait: the frontal veil panel, and the ember now glows BETWEEN the cords of the veil. A5 is a
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

| # | frames | time (s) | lyric | type | source (clip, exact frames) | viewer sees | cr |
|---|---|---|---|---|---|---|---|
| 01 | f0000-f0084 (84) | 0.00-3.50 | instr. | **REAL** | #44 src 0.30-2.40 s at 0.60x | grey smoke drifting on black, fading up from nothing | 0 |
| 02 | f0084-f0144 (60) | 3.50-6.00 | instr. | **ANIMATION** | generated: GPT Image 2.5 still (refs: inspiration 17, real #37 frame at 2.5 s, the character sheet (turnaround back and 3/4 back)) then Kling 3.0 i2v 3 s; uses 60 of 72 frames | a tiny walking silhouette in hat and frayed cloak crosses low dunes toward a huge full moon; the moon's smoke forms a rattlesnake face whose eyes open on the bar | 9 |
| 03 | f0144-f0240 (96) | 6.00-10.00 | instr. | **REAL** | #0 src 1.20-3.40 s at 0.55x | the ram skull on the rock pile under a storm sky, silver-grey | 0 |
| 04 | f0240-f0319 (79) | 10.00-13.29 | instr. | **REAL** | #39 src 0.30-2.93 s at 0.80x | his shadow on red sandstone: hat, coat, fringe | 0 |
| 05 | f0319-f0395 (76) | 13.29-16.46 | instr. | **REAL** | #3 src 0.00-2.22 s at 0.70x | torn-mask reveal: Hjeron and the wolfdog walking into white smoke (band enters). WOLFDOG | 0 |
| 06 | f0395-f0433 (38) | 16.46-18.04 | instr. | **REAL** | #14 src 0.25-1.83 s at 1.00x | his quick montage: skull cairn, him on the red rock, his shadow | 0 |
| 07 | f0433-f0460 (27) | 18.04-19.17 | instr. | **REAL** | #13 src 0.00-0.90 s at 0.80x | his fretboard over dry ground, the neck running up the frame | 0 |
| 08 | f0460-f0524 (64) | 19.17-21.83 | instr. | **REAL** | #47 src 2.33-5.00 s at 1.00x (ends on the clip's last frame, the bridge's start frame) | Hjeron with the Les Paul standing on the red sandstone spire, wide | 0 |
| 09 | f0524-f0620 (96) | 21.83-25.83 | instr. | **BRIDGE** | Kling 3.0 start = #47 last frame, end = #36 first frame. Accepted take t_bridge.mp4 (job dd8467ff, already paid, 121 f) played at 1.26x into 96 f | the camera lifts off the spire, pulls back and glides low over the desert, dust blowing, and settles on him walking the crest of the dune | 0 |
| 10 | f0620-f0703 (83) | 25.83-29.29 | [L1] | **REAL** | #36 src 0.00-3.46 s at 1.00x (the bridge's landing frame) | him walking close over the dune, the wolfdog behind | 0 |
| 11 | f0703-f0786 (83) | 29.29-32.75 | [L2] | **REAL** | #45 src 0.50-3.27 s at 0.80x | storm clouds rolling on black | 0 |
| 12 | f0786-f0871 (85) | 32.75-36.29 | [L3] | **REAL** | #28 src 0.50-4.04 s at 1.00x | Hjeron with the Les Paul and the wolfdog on the stone bridge. WOLFDOG | 0 |
| 13 | f0871-f0911 (40) | 36.29-37.96 | [L4] | **REAL** | #1 src 0.00-1.33 s at 0.80x | storm sky over the ram skull, fading | 0 |
| 14 | f0911-f0939 (28) | 37.96-39.12 | [L4] | **REAL** | #6 src 0.80-1.73 s at 0.80x | his ghosted grey double-exposure guitar | 0 |
| 15 | f0939-f0983 (44) | 39.12-40.96 | [L5] | **ANIMATION** | generated: Kling 3.0 i2v 3 s from real #0 frame 90 (src 3.00 s), uses 44 of 72 frames | the same ram skull; a ring of stones and charred logs in front of it catches fire, flames climb and light the horn curls from below | 4.5 |
| 16 | f0983-f1015 (32) | 40.96-42.29 | [L6] | **REAL** | #35 src 0.20-1.27 s at 0.80x | sand ripples | 0 |
| 17 | f1015-f1054 (39) | 42.29-43.92 | [L7] | **REAL** | #3 src 2.22-3.60 s at 0.85x (cut before his own light-leak transition at 3.7 s; 3.60 s is the continue's start frame) | him and the wolfdog deep in the white smoke. WOLFDOG | 0 |
| 18 | f1054-f1093 (39) | 43.92-45.54 | [L7] | **CONTINUE** | Kling 3.0 3 s from #3 frame 108 (src 3.60 s), uses 39 of 72 frames | they keep walking; the smoke rolls toward camera and closes over them until only the hat's outline shows | 4.5 |
| 19 | f1093-f1138 (45) | 45.54-47.42 | [L8] | **REAL** | #15 src 1.10-2.60 s at 0.80x | a real rattlesnake in dry grass | 0 |
| 20 | f1138-f1176 (38) | 47.42-49.00 | [L8] | **REAL** | #17 src 0.30-1.88 s at 1.00x | neon fire over the rocks: the first neon block | 0 |
| 21 | f1176-f1219 (43) | 49.00-50.79 | [L9] | **REAL** | #18 src 1.00-2.79 s at 1.00x | him with the guitar inside the flames | 0 |
| 22 | f1219-f1244 (25) | 50.79-51.83 | [L9] | **REAL** | #21 src 1.00-2.04 s at 1.00x | flaming rocks on the beat | 0 |
| 23 | f1244-f1278 (34) | 51.83-53.25 | [L10] | **REAL** | #31 src 0.50-1.92 s at 1.00x | a scorpion by an obsidian point on red dirt | 0 |
| 24 | f1278-f1316 (38) | 53.25-54.83 | [L10] | **REAL** | #15 src 1.90-2.61 s at 0.45x | the rattlesnake coiling, slower | 0 |
| 25 | f1316-f1355 (39) | 54.83-56.46 | [L11] | **REAL** | #32 src 1.00-2.62 s at 1.00x | the scorpion again | 0 |
| 26 | f1355-f1399 (44) | 56.46-58.29 | [L11] | **REAL** | #29 src 1.00-2.83 s at 1.00x | him and the wolfdog on the bridge. WOLFDOG | 0 |
| 27 | f1399-f1450 (51) | 58.29-60.42 | [L12] | **REAL** | #15 src 1.10-2.16 s at 0.50x | HERO: the real rattlesnake held slow | 0 |
| 28 | f1450-f1506 (56) | 60.42-62.75 | [L12] / [L13] | **REAL** | #16 src 0.00-0.89 s at 0.38x (the dog is gone after 0.9 s) | the wolfdog walking toward camera, the sun on the horizon behind him. WOLFDOG | 0 |
| 29 | f1506-f1548 (42) | 62.75-64.50 | [L13] | **ANIMATION** | generated: GPT Image 2.5 still (refs: inspiration 16, real #39 frame at 1.5 s, the character sheet (front and 3/4 panels)) then Kling 3.0 i2v 3 s; uses 42 of 72 frames | a tight low-angle portrait of him painted on cracked sandstone; the face is hidden by the cord veil; on the sung word 'eyes' one ember point ignites behind the cords and flares | 9 |
| 30 | f1548-f1561 (13) | 64.50-65.04 | [L13] | **REAL** | #9 src 0.30-0.84 s at 1.00x | his overexposed guitar flash, the hinge into the chorus | 0 |
| 31 | f1561-f1627 (66) | 65.04-67.79 | [L14] | **LIPSYNC** | V1 still (GPT Image 2.5: the veiled figure FRONTAL, medium close, placed in #22's neon, from the character sheet), then H3 Max 6 s image ref = V1 + audio = vocals.wav 65.039-71.039 s; uses 65.04-67.79 s. LS1 (job e1d42c7a) is REJECTED: invented beard in profile | The Wyrd One facing camera in his neon fire, veil of cords over the face, head pushing and lifting with the phrasing, guitar across the body | 19.5 |
| 32 | f1627-f1640 (13) | 67.79-68.33 | [L15] | **REAL** | #25 src 0.50-1.04 s at 1.00x | HERO hat silhouette in the flames, a half-beat on the breath between lines | 0 |
| 33 | f1640-f1690 (50) | 68.33-70.42 | [L15] | **LIPSYNC** | LS1b continued, song-synced 68.33-70.42 s (same job) | back on the veiled singer; the head lifts slowly on the held last word, the cords swinging | 0 |
| 34 | f1690-f1701 (11) | 70.42-70.88 | [L15] | **REAL** | #10 src 0.10-0.21 s at 0.25x | his red burning-sky silhouette, one bright frame then dark | 0 |
| 35 | f1701-f1778 (77) | 70.88-74.08 | [L16] / [L17] | **ANIMATION** | generated: Kling 3.0 i2v 4 s from real #23 frame 30 (src 1.00 s), uses 77 of 96 frames | a spectral rattlesnake of white smoke rises out of the flames, climbs past his silhouette and coils into a ring around him, then breaks apart into drifting smoke as the world dissolves | 6 |
| 36 | f1778-f1825 (47) | 74.08-76.04 | [L18] | **ANIMATION** | generated: GPT Image 2.5 still (refs: inspiration 15, real #40 frame at 2.5 s, the character sheet (front and 3/4 panels)) then Kling 3.0 i2v 3 s; uses 47 of 72 frames | firelight climbs a cracked canyon wall and reveals a painting of him, arms out, with invented glyphs (spiral, zigzag snake, bighorn) around him | 9 |
| 37 | f1825-f1899 (74) | 76.04-79.12 | [L19] | **REAL** | #26 src 1.00-4.08 s at 1.00x | the guitarist's silhouette in fire | 0 |
| 38 | f1899-f1945 (46) | 79.12-81.04 | [L20] | **LIPSYNC** | V2 still (GPT Image 2.5: the veiled figure 3/4 TOWARD camera, placed in #23's neon), then H3 Max 6 s image ref = V2 + audio = vocals.wav 79.134-85.134 s; uses 79.13-81.04 s. LS2 (job 61a783cf, video ref) is REJECTED: no readable singing, profile | The Wyrd One three-quarters toward camera in the flames, guitar neck rising, the veil swaying as his head pushes on the words | 19.5 |
| 39 | f1945-f1976 (31) | 81.04-82.33 | [L20] | **REAL** | #27 src 1.50-2.79 s at 1.00x | him walking out onto the stone bridge, sepia | 0 |
| 40 | f1976-f2022 (46) | 82.33-84.25 | [L21] | **LIPSYNC** | LS2b continued, song-synced 82.33-84.25 s (same job) | back on the veiled singer, the head dropping on the last word | 0 |
| 41 | f2022-f2052 (30) | 84.25-85.50 | [L21] | **REAL** | #21 src 2.50-3.75 s at 1.00x | flaming rocks, later in the clip | 0 |
| 42 | f2052-f2093 (41) | 85.50-87.21 | [L22] | **REAL** | #30 src 0.00-1.37 s at 0.80x | him on the bridge with the wolfdog. WOLFDOG | 0 |
| 43 | f2093-f2124 (31) | 87.21-88.50 | [L23] | **REAL** | #22 src 1.00-2.29 s at 1.00x | his silhouette in the flames | 0 |
| 44 | f2124-f2164 (40) | 88.50-90.17 | [L23] | **LIPSYNC** | H3 Max 5 s, image ref = the V1 still (no new still) + audio = vocals.wav 85.496-90.496 s; uses 88.50-90.17 s | The Wyrd One facing camera in the flames, the head lowering slowly on the last held word and holding still | 12.5 |
| 45 | f2164-f2180 (16) | 90.17-90.83 | [L24] | **REAL** | #37 src 0.00-0.67 s at 1.00x | him tiny on the dune under the printed star field | 0 |
| 46 | f2180-f2215 (35) | 90.83-92.29 | [L24] | **SCRATCHBOARD** | the approved Kling Omni Edit take scratch.mp4 (job 87b55c41, already paid) of the same #37 clip, src 0.67-2.13 s | the same walk, now a white-on-black scratchboard etching: stippled stars, hatched sand, buttes | 0 |
| 47 | f2215-f2241 (26) | 92.29-93.38 | [L24] | **SCRATCHBOARD** | Kling 3.0 Omni Edit (std) of real #11 (whole 2.0 s clip), uses 26 frames | the wolfdog lifts its head toward a full moon under a stippled night sky. WOLFDOG (generated) | 7.5 |
| 48 | f2241-f2291 (50) | 93.38-95.46 | [L25] | **ANIMATION** | generated: GPT Image 2.5 still (refs: real #17 frame 0, ref 3, the character sheet (front and 3/4 panels)) then Kling 3.0 i2v 3 s; uses 50 of 72 frames | low over cracked earth at night, heat glowing in every crack; the central crack widens toward camera and embers rise; tiny in the distance, the man and the wolfdog | 9 |
| 49 | f2291-f2342 (51) | 95.46-97.58 | [L25] | **REAL** | #17 src 0.00-1.59 s at 0.75x, fade out over the last 30 frames | HERO: his fire rising over the rocks, fading to black | 0 |

### Shot by shot

#### 01. REAL: smoke out of nothing

- **Song:** f0000-f0084 (84 frames), 0.000-3.500 s
- **Lyric:** (instrumental)
- **Source:** #44 src 0.30-2.40 s at 0.60x
- **Viewer sees:** grey smoke drifting on black, fading up from nothing
- **Camera:** static, as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_01.jpg`

#### 02. ANIMATION: the serpent in the moon (A1)

- **Song:** f0084-f0144 (60 frames), 3.500-6.000 s
- **Lyric:** (instrumental)
- **Source:** generated: GPT Image 2.5 still (refs: inspiration 17, real #37 frame at 2.5 s, the character sheet (turnaround back and 3/4 back)) then Kling 3.0 i2v 3 s; uses 60 of 72 frames
- **Viewer sees:** a tiny walking silhouette in hat and frayed cloak crosses low dunes toward a huge full moon; the moon's smoke forms a rattlesnake face whose eyes open on the bar
- **Camera:** locked off, very slow push-in
- **Look match:** match #37 (sepia dune under the printed star field, torn border); local finish: colour transfer from #37, #37's grain, border plate from #37
- **Transition in:** cut on the bar line (f0084)
- **Generation `A1-still`:** `higgsfield generate create gpt_image_2_5 --variant sunburst --quality xhigh --resolution 2k --aspect_ratio 9:16 --image-references <insp17> --image-references <c37_2.5s.png> --image-references <wyrd-one-sheet> --prompt @A1-still.txt`  (4.5 credits, from `generate cost`)

  ```text
  Vertical 9:16. A night desert of low wind-rippled dunes under a starry sky. A huge full moon fills the upper half of the frame. In the moon's pale face, drifting smoke forms the head of a rattlesnake: eyes half closed, jaw slightly open, made only of smoke and moonlight (the motif of reference 1, redrawn, not copied). Below it, small at about 25% of frame height in the lower third, a lone man walks away from camera toward the moon: The Wyrd One, exactly as the character sheet: a black wide-brim leather hat with a braided band; from the brim hangs a VEIL of long black cords that covers the whole face down to the chest; a layered dark cloak and hooded mantle, heavily worn, over a dark tunic; worn leather cargo pants and boots; a green beaded fringe necklace with a round beaded medallion; fingerless leather gloves; a black Les Paul style guitar; the frayed cloak hem lifts in the wind. A saguaro and a flat-topped butte in silhouette on the horizon. Seen from behind, so no face. Match the look of the real frame reference exactly: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. The moon is warm cream, not white. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Generation `A1-anim`:** `higgsfield generate create kling3_0 --mode std --duration 3 --aspect_ratio 9:16 --sound off --start-image <A1-still job id> --prompt @A1-anim.txt`  (4.5 credits, from `generate cost`)

  ```text
  The man keeps walking slowly toward the moon, his cloak hem moving in the wind, sand drifting off the dune crest. The smoke in the moon slowly coils, and in the final second the serpent's eyes open. Locked-off camera with a very slow push-in. Keep the exact look of the frame throughout: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Credits:** 9
- **Still:** `frames/shot_02.jpg`

#### 03. REAL: ram skull under the storm

- **Song:** f0144-f0240 (96 frames), 6.000-10.000 s
- **Lyric:** (instrumental)
- **Source:** #0 src 1.20-3.40 s at 0.55x
- **Viewer sees:** the ram skull on the rock pile under a storm sky, silver-grey
- **Camera:** as shot, slowed
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** MATCH CUT: the moon disc (end of 02) onto the round curl of the ram's horn, same screen position
- **Credits:** 0
- **Still:** `frames/shot_03.jpg`

#### 04. REAL: his shadow on the rock

- **Song:** f0240-f0319 (79 frames), 10.000-13.292 s
- **Lyric:** (instrumental)
- **Source:** #39 src 0.30-2.93 s at 0.80x
- **Viewer sees:** his shadow on red sandstone: hat, coat, fringe
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_04.jpg`

#### 05. REAL: him and the dog into the smoke

- **Song:** f0319-f0395 (76 frames), 13.292-16.458 s
- **Lyric:** (instrumental)
- **Source:** #3 src 0.00-2.22 s at 0.70x
- **Viewer sees:** torn-mask reveal: Hjeron and the wolfdog walking into white smoke (band enters). WOLFDOG
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** LIGHT-LEAK FLASH accent on the band entry (f0319, 4 frames, local)
- **Credits:** 0
- **Still:** `frames/shot_05.jpg`

#### 06. REAL: his own montage

- **Song:** f0395-f0433 (38 frames), 16.458-18.042 s
- **Lyric:** (instrumental)
- **Source:** #14 src 0.25-1.83 s at 1.00x
- **Viewer sees:** his quick montage: skull cairn, him on the red rock, his shadow
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** SHADOW PASS: his shadow from #40 (src 1.0-1.5 s) walks across frame as a luma wipe, f0389-f0401
- **Credits:** 0
- **Still:** `frames/shot_06.jpg`

#### 07. REAL: fretboard

- **Song:** f0433-f0460 (27 frames), 18.042-19.167 s
- **Lyric:** (instrumental)
- **Source:** #13 src 0.00-0.90 s at 0.80x
- **Viewer sees:** his fretboard over dry ground, the neck running up the frame
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_07.jpg`

#### 08. REAL: him on the spire

- **Song:** f0460-f0524 (64 frames), 19.167-21.833 s
- **Lyric:** (instrumental)
- **Source:** #47 src 2.33-5.00 s at 1.00x (ends on the clip's last frame, the bridge's start frame)
- **Viewer sees:** Hjeron with the Les Paul standing on the red sandstone spire, wide
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** MATCH CUT: the vertical guitar neck (07) onto the vertical spire, same screen axis
- **Credits:** 0
- **Still:** `frames/shot_08.jpg`

#### 09. BRIDGE: the pull-back (the one bridge)

- **Song:** f0524-f0620 (96 frames), 21.833-25.833 s
- **Lyric:** (instrumental)
- **Source:** Kling 3.0 start = #47 last frame, end = #36 first frame. Accepted take t_bridge.mp4 (job dd8467ff, already paid, 121 f) played at 1.26x into 96 f
- **Viewer sees:** the camera lifts off the spire, pulls back and glides low over the desert, dust blowing, and settles on him walking the crest of the dune
- **Camera:** pull-back and lift, fly-over, descending landing
- **Look match:** the take already holds both real looks (Robin: 'especially that zoom out transition'); local: the same #47/#36 border plate over the middle frames so the torn edge never drops out
- **Generation `BR1`:** `(no call) reuse the accepted take t_bridge.mp4, job dd8467ff. Retake only if the 1.26x speed-up reads rushed: higgsfield generate create kling3_0 --mode std --duration 4 --aspect_ratio 9:16 --sound off --start-image 2da1f5b3 (#47 last) --end-image 0f9b5c65 (#36 first) --prompt @BR1.txt (6 credits, inside the retry allowance)`  (0 credits, from `generate cost`)

  ```text
  One continuous camera move connecting the first frame to the last frame. From the man playing guitar on top of the red sandstone spire, the camera lifts away and glides low over the desert at golden hour, dust blowing, and settles on the lone figure in the wide-brim hat walking along the crest of the rippled sand dune. Keep the exact look of both frames throughout: aged sepia film stock, heavy grain, dust, scratches, light leaks, faded warm tones, torn and burned photo borders. No text, no extra people.
  ```
- **Credits:** 0
- **Still:** `frames/shot_09.jpg`

#### 10. REAL: walking the dune

- **Song:** f0620-f0703 (83 frames), 25.833-29.292 s
- **Lyric:** [L1]
- **Source:** #36 src 0.00-3.46 s at 1.00x (the bridge's landing frame)
- **Viewer sees:** him walking close over the dune, the wolfdog behind
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_10.jpg`

#### 11. REAL: storm clouds

- **Song:** f0703-f0786 (83 frames), 29.292-32.750 s
- **Lyric:** [L2]
- **Source:** #45 src 0.50-3.27 s at 0.80x
- **Viewer sees:** storm clouds rolling on black
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** SMOKE WIPE: his own smoke-on-black #44 (src 1.5-2.1 s) screened across the cut, f0697-f0711
- **Credits:** 0
- **Still:** `frames/shot_11.jpg`

#### 12. REAL: the stone bridge

- **Song:** f0786-f0871 (85 frames), 32.750-36.292 s
- **Lyric:** [L3]
- **Source:** #28 src 0.50-4.04 s at 1.00x
- **Viewer sees:** Hjeron with the Les Paul and the wolfdog on the stone bridge. WOLFDOG
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_12.jpg`

#### 13. REAL: skull sky

- **Song:** f0871-f0911 (40 frames), 36.292-37.958 s
- **Lyric:** [L4]
- **Source:** #1 src 0.00-1.33 s at 0.80x
- **Viewer sees:** storm sky over the ram skull, fading
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_13.jpg`

#### 14. REAL: ghost guitar

- **Song:** f0911-f0939 (28 frames), 37.958-39.125 s
- **Lyric:** [L4]
- **Source:** #6 src 0.80-1.73 s at 0.80x
- **Viewer sees:** his ghosted grey double-exposure guitar
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_14.jpg`

#### 15. ANIMATION: the fire ring (A2)

- **Song:** f0939-f0983 (44 frames), 39.125-40.958 s
- **Lyric:** [L5]
- **Source:** generated: Kling 3.0 i2v 3 s from real #0 frame 90 (src 3.00 s), uses 44 of 72 frames
- **Viewer sees:** the same ram skull; a ring of stones and charred logs in front of it catches fire, flames climb and light the horn curls from below
- **Camera:** slow push-in on the skull
- **Look match:** match #0 exactly (silver-grey mono, heavy vignette, glitch bars at the bottom edge); the fire stays grey-white, no colour; local finish: colour transfer + grain from #0
- **Transition in:** SPLICE JUMP accent on the downbeat (f0939, 2-frame vertical slip, local)
- **Generation `A2`:** `higgsfield generate create kling3_0 --mode std --duration 3 --aspect_ratio 9:16 --sound off --start-image <c00_f090.png> --prompt @A2.txt`  (4.5 credits, from `generate cost`)

  ```text
  Continue this exact shot. In front of the ram skull on the rocks, a ring of stones around charred logs catches fire: small flames rise and grow, lighting the curls of the horns from below, and smoke drifts up into the storm sky. The camera pushes in slowly toward the skull. The skull and rocks do not move. Keep the exact look of the frame: silver-grey monochrome, heavy grain, strong vignette, the glitch bars at the bottom edge; the fire stays grey-white like the rest of the frame, no colour. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Credits:** 4.5
- **Still:** `frames/shot_15.jpg`

#### 16. REAL: sand ripples

- **Song:** f0983-f1015 (32 frames), 40.958-42.292 s
- **Lyric:** [L6]
- **Source:** #35 src 0.20-1.27 s at 0.80x
- **Viewer sees:** sand ripples
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_16.jpg`

#### 17. REAL: deep in the smoke

- **Song:** f1015-f1054 (39 frames), 42.292-43.917 s
- **Lyric:** [L7]
- **Source:** #3 src 2.22-3.60 s at 0.85x (cut before his own light-leak transition at 3.7 s; 3.60 s is the continue's start frame)
- **Viewer sees:** him and the wolfdog deep in the white smoke. WOLFDOG
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_17.jpg`

#### 18. CONTINUE: into the smoke (C1)

- **Song:** f1054-f1093 (39 frames), 43.917-45.542 s
- **Lyric:** [L7]
- **Source:** Kling 3.0 3 s from #3 frame 108 (src 3.60 s), uses 39 of 72 frames
- **Viewer sees:** they keep walking; the smoke rolls toward camera and closes over them until only the hat's outline shows
- **Camera:** continues #3's slight drift
- **Look match:** seamless from #3 (black ground, torn-mask edges, white smoke, grain); local: #3's grain on top
- **Generation `C1`:** `higgsfield generate create kling3_0 --mode std --duration 3 --aspect_ratio 9:16 --sound off --start-image <c03_f108.png> --prompt @C1.txt`  (4.5 credits, from `generate cost`)

  ```text
  Continue this exact shot seamlessly from the given first frame. The man in the black wide-brim hat and the wolfdog keep walking away from camera into the thick white smoke; the smoke rolls toward the camera and closes over them until only the outline of the hat shows, then nothing but smoke. Keep the exact look of the frame throughout: black background, the torn-mask edges, white smoke, grain. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Credits:** 4.5
- **Still:** `frames/shot_18.jpg`

#### 19. REAL: snake in the grass

- **Song:** f1093-f1138 (45 frames), 45.542-47.417 s
- **Lyric:** [L8]
- **Source:** #15 src 1.10-2.60 s at 0.80x
- **Viewer sees:** a real rattlesnake in dry grass
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_19.jpg`

#### 20. REAL: first neon

- **Song:** f1138-f1176 (38 frames), 47.417-49.000 s
- **Lyric:** [L8]
- **Source:** #17 src 0.30-1.88 s at 1.00x
- **Viewer sees:** neon fire over the rocks: the first neon block
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** FILM BURN-THROUGH: a hole melts open in the sepia snake frame and burns outward into the fire, f1128-f1146 (local)
- **Credits:** 0
- **Still:** `frames/shot_20.jpg`

#### 21. REAL: guitar in the flames

- **Song:** f1176-f1219 (43 frames), 49.000-50.792 s
- **Lyric:** [L9]
- **Source:** #18 src 1.00-2.79 s at 1.00x
- **Viewer sees:** him with the guitar inside the flames
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_21.jpg`

#### 22. REAL: flaming rocks

- **Song:** f1219-f1244 (25 frames), 50.792-51.833 s
- **Lyric:** [L9]
- **Source:** #21 src 1.00-2.04 s at 1.00x
- **Viewer sees:** flaming rocks on the beat
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** GATE WEAVE accent on the drum hit (f1219, 3 frames, local)
- **Credits:** 0
- **Still:** `frames/shot_22.jpg`

#### 23. REAL: scorpion

- **Song:** f1244-f1278 (34 frames), 51.833-53.250 s
- **Lyric:** [L10]
- **Source:** #31 src 0.50-1.92 s at 1.00x
- **Viewer sees:** a scorpion by an obsidian point on red dirt
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** TORN PHOTO: the last neon frame freezes, ages into a torn photo and rips away to reveal the scorpion, f1236-f1252 (local)
- **Credits:** 0
- **Still:** `frames/shot_23.jpg`

#### 24. REAL: coils

- **Song:** f1278-f1316 (38 frames), 53.250-54.833 s
- **Lyric:** [L10]
- **Source:** #15 src 1.90-2.61 s at 0.45x
- **Viewer sees:** the rattlesnake coiling, slower
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_24.jpg`

#### 25. REAL: scorpion again

- **Song:** f1316-f1355 (39 frames), 54.833-56.458 s
- **Lyric:** [L11]
- **Source:** #32 src 1.00-2.62 s at 1.00x
- **Viewer sees:** the scorpion again
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_25.jpg`

#### 26. REAL: the pair

- **Song:** f1355-f1399 (44 frames), 56.458-58.292 s
- **Lyric:** [L11]
- **Source:** #29 src 1.00-2.83 s at 1.00x
- **Viewer sees:** him and the wolfdog on the bridge. WOLFDOG
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_26.jpg`

#### 27. REAL: hero rattlesnake

- **Song:** f1399-f1450 (51 frames), 58.292-60.417 s
- **Lyric:** [L12]
- **Source:** #15 src 1.10-2.16 s at 0.50x
- **Viewer sees:** HERO: the real rattlesnake held slow
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_27.jpg`

#### 28. REAL: the dog and the sun

- **Song:** f1450-f1506 (56 frames), 60.417-62.750 s
- **Lyric:** [L12] / [L13]
- **Source:** #16 src 0.00-0.89 s at 0.38x (the dog is gone after 0.9 s)
- **Viewer sees:** the wolfdog walking toward camera, the sun on the horizon behind him. WOLFDOG
- **Camera:** as shot, slowed
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_28.jpg`

#### 29. ANIMATION: the ember eye (A3)

- **Song:** f1506-f1548 (42 frames), 62.750-64.500 s
- **Lyric:** [L13]
- **Source:** generated: GPT Image 2.5 still (refs: inspiration 16, real #39 frame at 1.5 s, the character sheet (front and 3/4 panels)) then Kling 3.0 i2v 3 s; uses 42 of 72 frames
- **Viewer sees:** a tight low-angle portrait of him painted on cracked sandstone; the face is hidden by the cord veil; on the sung word 'eyes' one ember point ignites behind the cords and flares
- **Camera:** slow push-in toward the brim
- **Look match:** match #39 (sepia red sandstone, torn border); local finish: colour transfer + grain + border from #39. This is an original board-style animation, not a restyle of his footage
- **Generation `A3-still`:** `higgsfield generate create gpt_image_2_5 --variant sunburst --quality xhigh --resolution 2k --aspect_ratio 9:16 --image-references <insp16> --image-references <c39_1.5s.png> --image-references <wyrd-one-sheet> --prompt @A3-still.txt`  (4.5 credits, from `generate cost`)

  ```text
  Vertical 9:16, tight low-angle portrait from the chest up: The Wyrd One, exactly as the character sheet: a black wide-brim leather hat with a braided band; from the brim hangs a VEIL of long black cords that covers the whole face down to the chest; a layered dark cloak and hooded mantle, heavily worn, over a dark tunic; worn leather cargo pants and boots; a green beaded fringe necklace with a round beaded medallion; fingerless leather gloves; a black Les Paul style guitar, painted onto a wall of cracked red sandstone like an old rock painting, the pigment worn and flaking along real fissures that run through him. The cord veil covers the whole face and no features ever show; behind the cords, where one eye would be, a single tiny dull ember point shows between two cords, not yet glowing. No beard, no skin. Warm dusk light rakes across the rock from the left. Match the look of the real frame reference exactly: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Generation `A3-anim`:** `higgsfield generate create kling3_0 --mode std --duration 3 --aspect_ratio 9:16 --sound off --start-image <A3-still job id> --prompt @A3-anim.txt`  (4.5 credits, from `generate cost`)

  ```text
  Slow push-in toward the dark face under the brim. At about two seconds the single ember point behind the veil ignites and flares brighter, its glow spilling through the gaps between the cords; a few sparks drift up along the cracks in the rock. The painted figure itself does not move and the veil stays closed and no face shows. Keep the exact look of the frame: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Credits:** 9
- **Still:** `frames/shot_29.jpg`

#### 30. REAL: white

- **Song:** f1548-f1561 (13 frames), 64.500-65.042 s
- **Lyric:** [L13]
- **Source:** #9 src 0.30-0.84 s at 1.00x
- **Viewer sees:** his overexposed guitar flash, the hinge into the chorus
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** EYE FLASH: the ember eye (29) flares to white over f1540-f1548 and cuts into his real flash (local)
- **Credits:** 0
- **Still:** `frames/shot_30.jpg`

#### 31. LIPSYNC: hook, part 1 (LS1b, veiled frontal)

- **Song:** f1561-f1627 (66 frames), 65.042-67.792 s
- **Lyric:** [L14]
- **Source:** V1 still (GPT Image 2.5: the veiled figure FRONTAL, medium close, placed in #22's neon, from the character sheet), then H3 Max 6 s image ref = V1 + audio = vocals.wav 65.039-71.039 s; uses 65.04-67.79 s. LS1 (job e1d42c7a) is REJECTED: invented beard in profile
- **Viewer sees:** The Wyrd One facing camera in his neon fire, veil of cords over the face, head pushing and lifting with the phrasing, guitar across the body
- **Camera:** locked, medium close from the chest up
- **Look match:** V1 is made in #22's look (pink sky, orange flame overlay, purple-black figure, grain); local finish: #22's grain and flame motion screened on top
- **Generation `V1-still`:** `higgsfield generate create gpt_image_2_5 --variant sunburst --quality xhigh --resolution 2k --aspect_ratio 9:16 --image-references <wyrd-one-sheet> --image-references <sheet_frontal_x4.png> --image-references <c22_f100.png> --prompt @V1-still.txt`  (4.5 credits, from `generate cost`)

  ```text
  Vertical 9:16, medium close-up from the chest up, the man FACING THE CAMERA straight on, slightly below eye level: The Wyrd One, exactly as the character sheet: a black wide-brim leather hat with a braided band; from the brim hangs a VEIL of long black cords that covers the whole face down to the chest; a layered dark cloak and hooded mantle, heavily worn, over a dark tunic; worn leather cargo pants and boots; a green beaded fringe necklace with a round beaded medallion; fingerless leather gloves; a black Les Paul style guitar; the guitar neck crosses the lower frame. the face is NEVER shown: the cord veil covers it completely; at most a sliver of dark lips is glimpsed between the cords now and then; no beard, no nose, no eyes, no skin of the face ever visible; the veil is never lifted or parted; low-key light, one hard source. Identity and costume from reference 1 and 2 (the character sheet and its frontal veil panel); the veil pattern exactly as there. Place him in the world and look of reference 3 (his real footage frame): his neon fire composite: hot pink and violet sky, orange and yellow flame overlays drifting across the frame, the figure a deep purple-black silhouette, heavy grain; the flames pass in front of the lower body and at the frame edges, never across the veil. No profile, no beard, no visible face. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Generation `LS1b`:** `higgsfield generate create minimax_h3_max --duration 6 --aspect_ratio 9:16 --resolution 768p --image <V1 job id> --audio <vocals_65.039-71.039 id a4cf692a> --prompt @LS1b.txt`  (15 credits, from `generate cost`)

  ```text
  The veiled man in the reference image sings the supplied vocal audio while playing his black electric guitar. He faces the camera, or three-quarters toward it, and his head barely turns: never a profile, never side-on. You can tell he is singing because his head moves with the phrasing: small forward pushes on stressed words, a slow lift on held notes, a settle in the pauses, and deep rhythmic breathing in the chest and shoulders. The cord veil sways with the head and the breath; through the gaps between cords the dark lips are only glimpsed now and then, opening on the sung syllables. Never show the full face, never show a beard, never lift or part the veil, never turn to profile. His head lifts on the two held words of the first line and rises slowly on the long last word of the second line; he settles and breathes in the gap between the lines. Small natural playing movements in the hands. The flame overlay keeps drifting at the edges as in the reference. Keep the exact look of the reference: his neon fire composite: hot pink and violet sky, orange and yellow flame overlays drifting across the frame, the figure a deep purple-black silhouette, heavy grain. Locked camera, no zoom, no cuts. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Credits:** 19.5
- **Still:** `frames/shot_31.jpg`

#### 32. REAL: breath cutaway

- **Song:** f1627-f1640 (13 frames), 67.792-68.333 s
- **Lyric:** [L15]
- **Source:** #25 src 0.50-1.04 s at 1.00x
- **Viewer sees:** HERO hat silhouette in the flames, a half-beat on the breath between lines
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_32.jpg`

#### 33. LIPSYNC: hook, part 2 (LS1)

- **Song:** f1640-f1690 (50 frames), 68.333-70.417 s
- **Lyric:** [L15]
- **Source:** LS1b continued, song-synced 68.33-70.42 s (same job)
- **Viewer sees:** back on the veiled singer; the head lifts slowly on the held last word, the cords swinging
- **Camera:** locked
- **Look match:** as 31
- **Credits:** 0
- **Still:** `frames/shot_33.jpg`

#### 34. REAL: burning sky

- **Song:** f1690-f1701 (11 frames), 70.417-70.875 s
- **Lyric:** [L15]
- **Source:** #10 src 0.10-0.21 s at 0.25x
- **Viewer sees:** his red burning-sky silhouette, one bright frame then dark
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** DOUBLE EXPOSURE DISSOLVE (his Dark Blues Ritual signature): the singing silhouette over the burning sky over fire, f1680-f1701 (local)
- **Credits:** 0
- **Still:** `frames/shot_34.jpg`

#### 35. ANIMATION: the smoke serpent ring (A4)

- **Song:** f1701-f1778 (77 frames), 70.875-74.083 s
- **Lyric:** [L16] / [L17]
- **Source:** generated: Kling 3.0 i2v 4 s from real #23 frame 30 (src 1.00 s), uses 77 of 96 frames
- **Viewer sees:** a spectral rattlesnake of white smoke rises out of the flames, climbs past his silhouette and coils into a ring around him, then breaks apart into drifting smoke as the world dissolves
- **Camera:** locked, slight push-in
- **Look match:** match #23 exactly (it starts from his frame); local finish: #23 grain
- **Generation `A4`:** `higgsfield generate create kling3_0 --mode std --duration 4 --aspect_ratio 9:16 --sound off --start-image <c23_f030.png> --prompt @A4.txt`  (6 credits, from `generate cost`)

  ```text
  Continue this exact shot. A spectral rattlesnake made of white smoke rises out of the flames at the bottom of the frame, climbs past the man's dark silhouette and coils into a full ring around him, its head meeting its own tail, the rattle raised. Then the ring loosens and breaks apart into drifting smoke that spreads across the whole frame. The man stays a dark silhouette, the hat brim hiding the face. Keep the exact look of the frame: his neon fire composite: hot pink and violet sky, orange and yellow flame overlays drifting across the frame, the figure a deep purple-black silhouette, heavy grain. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Credits:** 6
- **Still:** `frames/shot_35.jpg`

#### 36. ANIMATION: the rock-wall painting (A5)

- **Song:** f1778-f1825 (47 frames), 74.083-76.042 s
- **Lyric:** [L18]
- **Source:** generated: GPT Image 2.5 still (refs: inspiration 15, real #40 frame at 2.5 s, the character sheet (front and 3/4 panels)) then Kling 3.0 i2v 3 s; uses 47 of 72 frames
- **Viewer sees:** firelight climbs a cracked canyon wall and reveals a painting of him, arms out, with invented glyphs (spiral, zigzag snake, bighorn) around him
- **Camera:** slow tilt up with the light
- **Look match:** match #40 (sepia red sandstone and his shadow, torn border); local finish: colour transfer + grain + border from #40
- **Transition in:** SMOKE WIPE: the serpent's own smoke plus his #46 smoke screened across, f1770-f1786 (local)
- **Generation `A5-still`:** `higgsfield generate create gpt_image_2_5 --variant sunburst --quality xhigh --resolution 2k --aspect_ratio 9:16 --image-references <insp15> --image-references <c40_2.5s.png> --image-references <wyrd-one-sheet> --prompt @A5-still.txt`  (4.5 credits, from `generate cost`)

  ```text
  Vertical 9:16, a tall cracked sandstone canyon wall at night, lit only from below. Painted on the rock in worn ochre, umber and soot black: The Wyrd One, exactly as the character sheet: a black wide-brim leather hat with a braided band; from the brim hangs a VEIL of long black cords that covers the whole face down to the chest; a layered dark cloak and hooded mantle, heavily worn, over a dark tunic; worn leather cargo pants and boots; a green beaded fringe necklace with a round beaded medallion; fingerless leather gloves; a black Les Paul style guitar, full figure, arms held out from his sides, the cloak hem frayed; the cord veil over the face. Around him, smaller painted glyphs of the same age: a spiral, a zigzag snake, two bighorn sheep (invented forms, not copies of any real petroglyph). Real fissures run through the painting. The lower half of the wall is in firelight, the top still dark. Match the look of the real frame reference exactly: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Generation `A5-anim`:** `higgsfield generate create kling3_0 --mode std --duration 3 --aspect_ratio 9:16 --sound off --start-image <A5-still job id> --prompt @A5-anim.txt`  (4.5 credits, from `generate cost`)

  ```text
  Flames rise at the base of the rock wall and their light sweeps upward across the painting, revealing the painted figure from the feet to the hat; the cracks glow faintly as the light passes. The painting itself does not move, only the firelight flickers. Slow tilt up with the light. Keep the exact look of the frame: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Credits:** 9
- **Still:** `frames/shot_36.jpg`

#### 37. REAL: guitarist in fire

- **Song:** f1825-f1899 (74 frames), 76.042-79.125 s
- **Lyric:** [L19]
- **Source:** #26 src 1.00-4.08 s at 1.00x
- **Viewer sees:** the guitarist's silhouette in fire
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_37.jpg`

#### 38. LIPSYNC: wake-up 1 (LS2b, veiled 3/4)

- **Song:** f1899-f1945 (46 frames), 79.125-81.042 s
- **Lyric:** [L20]
- **Source:** V2 still (GPT Image 2.5: the veiled figure 3/4 TOWARD camera, placed in #23's neon), then H3 Max 6 s image ref = V2 + audio = vocals.wav 79.134-85.134 s; uses 79.13-81.04 s. LS2 (job 61a783cf, video ref) is REJECTED: no readable singing, profile
- **Viewer sees:** The Wyrd One three-quarters toward camera in the flames, guitar neck rising, the veil swaying as his head pushes on the words
- **Camera:** locked, medium shot from the waist up
- **Look match:** V2 is made in #23's look; local finish: #23 grain and flame motion
- **Transition in:** EMBER SCATTER: the fire silhouette (37) breaks into rising embers that re-form as the singer, f1889-f1907 (local p5)
- **Generation `V2-still`:** `higgsfield generate create gpt_image_2_5 --variant sunburst --quality xhigh --resolution 2k --aspect_ratio 9:16 --image-references <wyrd-one-sheet> --image-references <sheet_threeq_x4.png> --image-references <c23_f030.png> --prompt @V2-still.txt`  (4.5 credits, from `generate cost`)

  ```text
  Vertical 9:16, medium shot from the waist up, the man turned THREE-QUARTERS TOWARD the camera (never profile), the guitar neck rising diagonally through the frame: The Wyrd One, exactly as the character sheet: a black wide-brim leather hat with a braided band; from the brim hangs a VEIL of long black cords that covers the whole face down to the chest; a layered dark cloak and hooded mantle, heavily worn, over a dark tunic; worn leather cargo pants and boots; a green beaded fringe necklace with a round beaded medallion; fingerless leather gloves; a black Les Paul style guitar. the face is NEVER shown: the cord veil covers it completely; at most a sliver of dark lips is glimpsed between the cords now and then; no beard, no nose, no eyes, no skin of the face ever visible; the veil is never lifted or parted; low-key light, one hard source. Identity and costume from references 1 and 2 (the character sheet and its 3/4 veil panel). Place him in the world and look of reference 3 (his real footage frame): his neon fire composite: hot pink and violet sky, orange and yellow flame overlays drifting across the frame, the figure a deep purple-black silhouette, heavy grain; flames rise in front of the guitar body and at the frame edges, never across the veil. No beard, no visible face. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Generation `LS2b`:** `higgsfield generate create minimax_h3_max --duration 6 --aspect_ratio 9:16 --resolution 768p --image <V2 job id> --audio <vocals_79.134-85.134 id 0c7a20a0> --prompt @LS2b.txt`  (15 credits, from `generate cost`)

  ```text
  The veiled man in the reference image sings the supplied vocal audio while playing his black electric guitar. He faces the camera, or three-quarters toward it, and his head barely turns: never a profile, never side-on. You can tell he is singing because his head moves with the phrasing: small forward pushes on stressed words, a slow lift on held notes, a settle in the pauses, and deep rhythmic breathing in the chest and shoulders. The cord veil sways with the head and the breath; through the gaps between cords the dark lips are only glimpsed now and then, opening on the sung syllables. Never show the full face, never show a beard, never lift or part the veil, never turn to profile. His head pushes forward on the held word of the first line, settles in the pause, and drops on the last word of the second line. Keep the exact look of the reference: his neon fire composite: hot pink and violet sky, orange and yellow flame overlays drifting across the frame, the figure a deep purple-black silhouette, heavy grain. Locked camera, no zoom, no cuts. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Credits:** 19.5
- **Still:** `frames/shot_38.jpg`

#### 39. REAL: the bridge

- **Song:** f1945-f1976 (31 frames), 81.042-82.333 s
- **Lyric:** [L20]
- **Source:** #27 src 1.50-2.79 s at 1.00x
- **Viewer sees:** him walking out onto the stone bridge, sepia
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_39.jpg`

#### 40. LIPSYNC: wake-up 2 (LS2)

- **Song:** f1976-f2022 (46 frames), 82.333-84.250 s
- **Lyric:** [L21]
- **Source:** LS2b continued, song-synced 82.33-84.25 s (same job)
- **Viewer sees:** back on the veiled singer, the head dropping on the last word
- **Camera:** as 38
- **Look match:** as 38
- **Credits:** 0
- **Still:** `frames/shot_40.jpg`

#### 41. REAL: flaming rocks

- **Song:** f2022-f2052 (30 frames), 84.250-85.500 s
- **Lyric:** [L21]
- **Source:** #21 src 2.50-3.75 s at 1.00x
- **Viewer sees:** flaming rocks, later in the clip
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_41.jpg`

#### 42. REAL: bridge with the dog

- **Song:** f2052-f2093 (41 frames), 85.500-87.208 s
- **Lyric:** [L22]
- **Source:** #30 src 0.00-1.37 s at 0.80x
- **Viewer sees:** him on the bridge with the wolfdog. WOLFDOG
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** TORN PHOTO: the neon rocks freeze, tear and rip away onto the sepia bridge, f2044-f2058 (local)
- **Credits:** 0
- **Still:** `frames/shot_42.jpg`

#### 43. REAL: silhouette in flames

- **Song:** f2093-f2124 (31 frames), 87.208-88.500 s
- **Lyric:** [L23]
- **Source:** #22 src 1.00-2.29 s at 1.00x
- **Viewer sees:** his silhouette in the flames
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_43.jpg`

#### 44. LIPSYNC: wake-up 4 (LS3b, veiled frontal, reuses V1)

- **Song:** f2124-f2164 (40 frames), 88.500-90.167 s
- **Lyric:** [L23]
- **Source:** H3 Max 5 s, image ref = the V1 still (no new still) + audio = vocals.wav 85.496-90.496 s; uses 88.50-90.17 s
- **Viewer sees:** The Wyrd One facing camera in the flames, the head lowering slowly on the last held word and holding still
- **Camera:** locked
- **Look match:** V1 is in #22's neon, which also matches #26 beside it
- **Generation `LS3b`:** `higgsfield generate create minimax_h3_max --duration 5 --aspect_ratio 9:16 --resolution 768p --image <V1 job id> --audio <vocals_85.496-90.496.mp3> --prompt @LS3b.txt`  (12.5 credits, from `generate cost`)

  ```text
  The veiled man in the reference image sings the supplied vocal audio, holding his black electric guitar. He faces the camera, or three-quarters toward it, and his head barely turns: never a profile, never side-on. You can tell he is singing because his head moves with the phrasing: small forward pushes on stressed words, a slow lift on held notes, a settle in the pauses, and deep rhythmic breathing in the chest and shoulders. The cord veil sways with the head and the breath; through the gaps between cords the dark lips are only glimpsed now and then, opening on the sung syllables. Never show the full face, never show a beard, never lift or part the veil, never turn to profile. On the last held word his head lowers slowly and then holds still, breathing. Keep the exact look of the reference: his neon fire composite: hot pink and violet sky, orange and yellow flame overlays drifting across the frame, the figure a deep purple-black silhouette, heavy grain. Locked camera, no zoom, no cuts. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Credits:** 12.5
- **Still:** `frames/shot_44.jpg`

#### 45. REAL: dune at dusk

- **Song:** f2164-f2180 (16 frames), 90.167-90.833 s
- **Lyric:** [L24]
- **Source:** #37 src 0.00-0.67 s at 1.00x
- **Viewer sees:** him tiny on the dune under the printed star field
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Credits:** 0
- **Still:** `frames/shot_45.jpg`

#### 46. SCRATCHBOARD: the scratchboard walk (SB1)

- **Song:** f2180-f2215 (35 frames), 90.833-92.292 s
- **Lyric:** [L24]
- **Source:** the approved Kling Omni Edit take scratch.mp4 (job 87b55c41, already paid) of the same #37 clip, src 0.67-2.13 s
- **Viewer sees:** the same walk, now a white-on-black scratchboard etching: stippled stars, hatched sand, buttes
- **Camera:** as #37
- **Look match:** approved conversion style (Robin 2026-09-28); same clip time as 45 so the etch is frame-continuous
- **Transition in:** SCRATCHBOARD ETCH: white etched lines draw over the real #37 frame until it is the scratchboard frame, f2168-f2184 (local: scratch.mp4 luma as a progressive reveal)
- **Generation `SB1`:** `(no call) reuse the approved take scratch.mp4, job 87b55c41`  (0 credits, from `generate cost`)

  ```text
  (already rendered) Transform this video into a white-on-black scratchboard etching at night. Everything is black ink with fine white hatched and stippled lines scratched out of it: the man in the black wide-brim hat and long coat walking across the desert, the sand ripples, a starry night sky full of stippled stars, distant buttes. Keep his exact walk, pose, timing and silhouette. His face stays black under the brim. High contrast, hand-etched line texture, subtle film grain, no color except white on black. No text, no extra people.
  ```
- **Credits:** 0
- **Still:** `frames/shot_46.jpg`

#### 47. SCRATCHBOARD: the wolfdog at night (SB2)

- **Song:** f2215-f2241 (26 frames), 92.292-93.375 s
- **Lyric:** [L24]
- **Source:** Kling 3.0 Omni Edit (std) of real #11 (whole 2.0 s clip), uses 26 frames
- **Viewer sees:** the wolfdog lifts its head toward a full moon under a stippled night sky. WOLFDOG (generated)
- **Camera:** as #11
- **Look match:** same approved scratchboard style as 46, so the two read as one night
- **Generation `SB2`:** `higgsfield generate create kling_video_edit --mode std --video-references <c11.mp4> --prompt @SB2.txt  (7.5 is the estimate on a 5 s clip; #11 is 2.0 s, so this is a ceiling)`  (7.5 credits, from `generate cost`)

  ```text
  Transform this video into a white-on-black scratchboard etching at night. Everything is black ink with fine white hatched and stippled lines scratched out of it: the wolfdog on the rocky desert lifting its head toward a full moon low on the horizon where the sun was, a starry night sky full of stippled stars, distant buttes and one saguaro. Keep the dog's exact movement, pose and timing. High contrast, hand-etched line texture, subtle film grain, no colour except white on black. No text, no people.
  ```
- **Credits:** 7.5
- **Still:** `frames/shot_47.jpg`

#### 48. ANIMATION: the cracks (A6)

- **Song:** f2241-f2291 (50 frames), 93.375-95.458 s
- **Lyric:** [L25]
- **Source:** generated: GPT Image 2.5 still (refs: real #17 frame 0, ref 3, the character sheet (front and 3/4 panels)) then Kling 3.0 i2v 3 s; uses 50 of 72 frames
- **Viewer sees:** low over cracked earth at night, heat glowing in every crack; the central crack widens toward camera and embers rise; tiny in the distance, the man and the wolfdog
- **Camera:** slow push-in low over the ground
- **Look match:** match #17 (his neon fire), because it cracks open into #17; local finish: colour transfer + grain from #17
- **Transition in:** cut on the line (f2241) from the scratchboard dog, the night world breaking
- **Generation `A6-still`:** `higgsfield generate create gpt_image_2_5 --variant sunburst --quality xhigh --resolution 2k --aspect_ratio 9:16 --image-references <c17_f000.png> --image-references <ref3> --image-references <wyrd-one-sheet> --prompt @A6-still.txt`  (4.5 credits, from `generate cost`)

  ```text
  Vertical 9:16, camera low and close to the ground at night: dry cracked desert earth in large polygon plates running to a dark horizon and a butte. Orange-red heat glows deep inside every crack, brightest in one long central crack that runs toward the camera; thin smoke and heat shimmer rise from the fissures. Far away on the horizon, tiny, the silhouette of the man in the wide-brim hat stands beside the wolfdog. Match the look of the real frame reference exactly: his neon fire composite: hot pink and violet sky, orange and yellow flame overlays drifting across the frame, the figure a deep purple-black silhouette, heavy grain. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Generation `A6-anim`:** `higgsfield generate create kling3_0 --mode std --duration 3 --aspect_ratio 9:16 --sound off --start-image <A6-still job id> --prompt @A6-anim.txt`  (4.5 credits, from `generate cost`)

  ```text
  The glow inside the cracks brightens and pulses like breathing; the central crack slowly widens toward the camera and embers and heat rise out of it into the frame. The distant figure and dog stay still. Slow push-in, low over the ground. Keep the exact look of the frame: his neon fire composite: hot pink and violet sky, orange and yellow flame overlays drifting across the frame, the figure a deep purple-black silhouette, heavy grain. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Credits:** 9
- **Still:** `frames/shot_48.jpg`

#### 49. REAL: fire rising, the end

- **Song:** f2291-f2342 (51 frames), 95.458-97.583 s
- **Lyric:** [L25]
- **Source:** #17 src 0.00-1.59 s at 0.75x, fade out over the last 30 frames
- **Viewer sees:** HERO: his fire rising over the rocks, fading to black
- **Camera:** as shot
- **Look match:** untouched: cut, trim, speed only (no grade)
- **Transition in:** CRACK OPEN: the widening crack in 48 splits the frame apart and his fire comes up through it, f2280-f2296 (local mask from 48's crack)
- **Credits:** 0
- **Still:** `frames/shot_49.jpg`


## Totals

| ingredient | shots | frames | seconds | share of song |
|---|---|---|---|---|
| REAL | 34 | 1578 | 65.8 | 67.4% |
| BRIDGE | 1 | 96 | 4.0 | 4.1% |
| CONTINUE | 1 | 39 | 1.6 | 1.7% |
| LIPSYNC | 5 | 248 | 10.3 | 10.6% |
| ANIMATION | 6 | 320 | 13.3 | 13.7% |
| SCRATCHBOARD | 2 | 61 | 2.5 | 2.6% |
| **all** | 49 | 2342 | 97.6 | 100% |

**Generated or converted screen time: 764 frames = 31.8 s = 32.6% of the song.** Real, untouched: 1578 frames = 65.8 s.

| job | shot | credits | wave |
|---|---|---|---|
| `LS1b probe: V1 still + H3 6 s (veiled frontal)` | 31, 33 | 19.5 | 1b |
| `BR1 bridge (reuse dd8467ff)` | 09 | 0 | 1b |
| `LS2b: V2 still + H3 6 s (veiled 3/4)` | 38, 40 | 19.5 | 2 |
| `LS3b: H3 5 s from V1` | 44 | 12.5 | 2 |
| `A3 still + Kling 3 s` | 29 | 9 | 2 |
| `A4 Kling 4 s from #23` | 35 | 6 | 2 |
| `A6 still + Kling 3 s` | 48 | 9 | 2 |
| `A1 still + Kling 3 s` | 02 | 9 | 3 |
| `A2 Kling 3 s from #0` | 15 | 4.5 | 3 |
| `A5 still + Kling 3 s` | 36 | 9 | 3 |
| `SB2 Omni Edit of #11` | 47 | 7.5 | 3 |
| `C1 Kling 3 s from #3` | 18 | 4.5 | 3 |
| `SB1 scratchboard (reuse 87b55c41)` | 46 | 0 | 3 |
| **planned total** | | **110.0** | |

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
phrases with the vocal onsets; the cords sway naturally; the neon survives.

**Wave 2 (56):** LS2b (V2 still + H3), LS3b (reuses V1), A3 ember eye, A4 serpent ring, A6 cracks.
**Wave 3 (34.5):** A1 moon, A2 fire ring, A5 rock wall, SB2 night wolfdog, C1 smoke continue.
**Then local only:** the 17 transitions, the worn-film finish, and assembly against the unbroken
song with a frame-count check.

## Risks

- **H3 may lift or part the veil** and invent a face or beard, as LS1 invented a beard. The
  prompt forbids it, but only the probe shows whether the cords hold through 6 s of singing.
- **Singing may not read through a veil.** With the lips only glimpsed, the head's phrasing has to
  carry it. If it reads as nodding rather than singing, the fix is framing (closer) and prompt beats.
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
