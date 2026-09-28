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
- Faceless by lighting: brim shadow, low key, one hard source, silhouette. No hair over the face, no
  dreadlocks, no face paint.
- Lipsync comes from HIS real guitar clips (Robin, 2026-09-28), never from a generated character.
  Every singing shot is 2 to 3 s and intercut with real footage.
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

## Lipsync: two methods, both from his real guitar clips

No footage of him singing exists. Both methods feed H3 Max a vocal-stem slice (vocals.wav, cut at
song time, onsets checked against the stem) and a real piece of his neon guitar footage, where the
profile silhouette puts the jaw line against a bright sky. That reads much better than the hazy
grey frame in the augment test (lip_in_look_with_mix.mp4), where the face barely showed.

| method | input | cost | best clip | why |
|---|---|---|---|---|
| 1, image ref (proven) | `--image` one real frame + `--audio` | 15 / 6 s, 12.5 / 5 s | **#22 frame 100** (hook, LS1); **#26 frame 90** (LS3 default) | #22 is a clean profile silhouette, hat and beard line against the pink sky with the guitar neck in frame; #26 is close on the hat and neck |
| 2, video ref (untested) | `--video-references` the real clip + `--audio` | 15 / 6 s (same price) | **#23** (LS2) | #23 has the most playing motion and a readable profile; if H3 carries that motion, the singing looks filmed, not animated |

Not used: the sepia bridge clips (#27-#30) and the spire (#47-#49) are too wide, since his head is
about 40 px tall in a 1080 frame. #4, #6 and #8 are the hazy double exposures that failed. The
Dark Blues Ritual videos have a burned-in title and are style reference only.

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
| 02 | f0084-f0144 (60) | 3.50-6.00 | instr. | **ANIMATION** | generated: GPT Image 2.5 still (refs: inspiration 17, real #37 frame at 2.5 s, char refs 2, 5, 9) then Kling 3.0 i2v 3 s; uses 60 of 72 frames | a tiny walking silhouette in hat and shredded duster crosses low dunes toward a huge full moon; the moon's smoke forms a rattlesnake face whose eyes open on the bar | 9 |
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
| 29 | f1506-f1548 (42) | 62.75-64.50 | [L13] | **ANIMATION** | generated: GPT Image 2.5 still (refs: inspiration 16, real #39 frame at 1.5 s, char refs 2, 9) then Kling 3.0 i2v 3 s; uses 42 of 72 frames | a tight low-angle portrait of him painted on cracked sandstone; the face is black under the brim; on the sung word 'eyes' one eye ignites as an ember and flares | 9 |
| 30 | f1548-f1561 (13) | 64.50-65.04 | [L13] | **REAL** | #9 src 0.30-0.84 s at 1.00x | his overexposed guitar flash, the hinge into the chorus | 0 |
| 31 | f1561-f1627 (66) | 65.04-67.79 | [L14] | **LIPSYNC** | H3 Max 6 s, image ref = real #22 frame 100 (src 3.33 s), audio = vocals.wav 65.039-71.039 s; uses song-synced 65.04-67.79 s | his neon profile silhouette, hat and beard line against the pink sky, singing, guitar neck in frame | 15 |
| 32 | f1627-f1640 (13) | 67.79-68.33 | [L15] | **REAL** | #25 src 0.50-1.04 s at 1.00x | HERO hat silhouette in the flames, a half-beat on the breath between lines | 0 |
| 33 | f1640-f1690 (50) | 68.33-70.42 | [L15] | **LIPSYNC** | LS1 continued, song-synced 68.33-70.42 s (same job) | back on the singing silhouette; the chin lifts on the held last word | 0 |
| 34 | f1690-f1701 (11) | 70.42-70.88 | [L15] | **REAL** | #10 src 0.10-0.21 s at 0.25x | his red burning-sky silhouette, one bright frame then dark | 0 |
| 35 | f1701-f1778 (77) | 70.88-74.08 | [L16] / [L17] | **ANIMATION** | generated: Kling 3.0 i2v 4 s from real #23 frame 30 (src 1.00 s), uses 77 of 96 frames | a spectral rattlesnake of white smoke rises out of the flames, climbs past his silhouette and coils into a ring around him, then breaks apart into drifting smoke as the world dissolves | 6 |
| 36 | f1778-f1825 (47) | 74.08-76.04 | [L18] | **ANIMATION** | generated: GPT Image 2.5 still (refs: inspiration 15, real #40 frame at 2.5 s, char refs 2, 9) then Kling 3.0 i2v 3 s; uses 47 of 72 frames | firelight climbs a cracked canyon wall and reveals a painting of him, arms out, with invented glyphs (spiral, zigzag snake, bighorn) around him | 9 |
| 37 | f1825-f1899 (74) | 76.04-79.12 | [L19] | **REAL** | #26 src 1.00-4.08 s at 1.00x | the guitarist's silhouette in fire | 0 |
| 38 | f1899-f1945 (46) | 79.12-81.04 | [L20] | **LIPSYNC** | H3 Max 6 s, VIDEO ref = real #23 (whole 5 s clip), audio = vocals.wav 79.134-85.134 s; uses 79.13-81.04 s | his neon profile silhouette with the guitar, singing, carrying his real playing motion | 15 |
| 39 | f1945-f1976 (31) | 81.04-82.33 | [L20] | **REAL** | #27 src 1.50-2.79 s at 1.00x | him walking out onto the stone bridge, sepia | 0 |
| 40 | f1976-f2022 (46) | 82.33-84.25 | [L21] | **LIPSYNC** | LS2 continued, song-synced 82.33-84.25 s (same job) | back on the singing silhouette | 0 |
| 41 | f2022-f2052 (30) | 84.25-85.50 | [L21] | **REAL** | #21 src 2.50-3.75 s at 1.00x | flaming rocks, later in the clip | 0 |
| 42 | f2052-f2093 (41) | 85.50-87.21 | [L22] | **REAL** | #30 src 0.00-1.37 s at 0.80x | him on the bridge with the wolfdog. WOLFDOG | 0 |
| 43 | f2093-f2124 (31) | 87.21-88.50 | [L23] | **REAL** | #22 src 1.00-2.29 s at 1.00x | his silhouette in the flames | 0 |
| 44 | f2124-f2164 (40) | 88.50-90.17 | [L23] | **LIPSYNC** | H3 Max 5 s, ref = real #26 frame 90 (method 1) or the #26 clip (method 2), picked at the wave-1 gate; audio = vocals.wav 85.496-90.496 s; uses 88.50-90.17 s | close on his hat and the guitar neck in the flames, singing the last word of the run | 12.5 |
| 45 | f2164-f2180 (16) | 90.17-90.83 | [L24] | **REAL** | #37 src 0.00-0.67 s at 1.00x | him tiny on the dune under the printed star field | 0 |
| 46 | f2180-f2215 (35) | 90.83-92.29 | [L24] | **SCRATCHBOARD** | the approved Kling Omni Edit take scratch.mp4 (job 87b55c41, already paid) of the same #37 clip, src 0.67-2.13 s | the same walk, now a white-on-black scratchboard etching: stippled stars, hatched sand, buttes | 0 |
| 47 | f2215-f2241 (26) | 92.29-93.38 | [L24] | **SCRATCHBOARD** | Kling 3.0 Omni Edit (std) of real #11 (whole 2.0 s clip), uses 26 frames | the wolfdog lifts its head toward a full moon under a stippled night sky. WOLFDOG (generated) | 7.5 |
| 48 | f2241-f2291 (50) | 93.38-95.46 | [L25] | **ANIMATION** | generated: GPT Image 2.5 still (refs: real #17 frame 0, ref 3, char refs 2, 9) then Kling 3.0 i2v 3 s; uses 50 of 72 frames | low over cracked earth at night, heat glowing in every crack; the central crack widens toward camera and embers rise; tiny in the distance, the man and the wolfdog | 9 |
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
- **Source:** generated: GPT Image 2.5 still (refs: inspiration 17, real #37 frame at 2.5 s, char refs 2, 5, 9) then Kling 3.0 i2v 3 s; uses 60 of 72 frames
- **Viewer sees:** a tiny walking silhouette in hat and shredded duster crosses low dunes toward a huge full moon; the moon's smoke forms a rattlesnake face whose eyes open on the bar
- **Camera:** locked off, very slow push-in
- **Look match:** match #37 (sepia dune under the printed star field, torn border); local finish: colour transfer from #37, #37's grain, border plate from #37
- **Transition in:** cut on the bar line (f0084)
- **Generation `A1-still`:** `higgsfield generate create gpt_image_2_5 --variant sunburst --quality xhigh --resolution 2k --aspect_ratio 9:16 --image-references <insp17> --image-references <c37_2.5s.png> --image-references <ref2> --image-references <ref5> --image-references <ref9> --prompt @A1-still.txt`  (4.5 credits, from `generate cost`)

  ```text
  Vertical 9:16. A night desert of low wind-rippled dunes under a starry sky. A huge full moon fills the upper half of the frame. In the moon's pale face, drifting smoke forms the head of a rattlesnake: eyes half closed, jaw slightly open, made only of smoke and moonlight (the motif of reference 1, redrawn, not copied). Below it, small at about 25% of frame height in the lower third, a lone man walks away from camera toward the moon: the same man as the references: black wide-brim leather hat with a braided band, long black duster coat with a shredded fringed hem, fingerless black leather gloves, a silver star-compass medallion, a black Les Paul style guitar; long hair behind his shoulders, never over the face; no face paint; the shredded coat hem lifts in the wind. A saguaro and a flat-topped butte in silhouette on the horizon. Seen from behind, so no face. Match reference 2's look exactly: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. The moon is warm cream, not white. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Generation `A1-anim`:** `higgsfield generate create kling3_0 --mode std --duration 3 --aspect_ratio 9:16 --sound off --start-image <A1-still job id> --prompt @A1-anim.txt`  (4.5 credits, from `generate cost`)

  ```text
  The man keeps walking slowly toward the moon, his coat hem moving in the wind, sand drifting off the dune crest. The smoke in the moon slowly coils, and in the final second the serpent's eyes open. Locked-off camera with a very slow push-in. Keep the exact look of the frame throughout: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. No text, no letters, no logos, no watermark, no extra people.
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
- **Source:** generated: GPT Image 2.5 still (refs: inspiration 16, real #39 frame at 1.5 s, char refs 2, 9) then Kling 3.0 i2v 3 s; uses 42 of 72 frames
- **Viewer sees:** a tight low-angle portrait of him painted on cracked sandstone; the face is black under the brim; on the sung word 'eyes' one eye ignites as an ember and flares
- **Camera:** slow push-in toward the brim
- **Look match:** match #39 (sepia red sandstone, torn border); local finish: colour transfer + grain + border from #39. This is an original board-style animation, not a restyle of his footage
- **Generation `A3-still`:** `higgsfield generate create gpt_image_2_5 --variant sunburst --quality xhigh --resolution 2k --aspect_ratio 9:16 --image-references <insp16> --image-references <c39_1.5s.png> --image-references <ref2> --image-references <ref9> --prompt @A3-still.txt`  (4.5 credits, from `generate cost`)

  ```text
  Vertical 9:16, tight low-angle portrait from the chest up: the same man as the references: black wide-brim leather hat with a braided band, long black duster coat with a shredded fringed hem, fingerless black leather gloves, a silver star-compass medallion, a black Les Paul style guitar; long hair behind his shoulders, never over the face; no face paint, painted onto a wall of cracked red sandstone like an old rock painting, the pigment worn and flaking along real fissures that run through him. his face is hidden by LIGHTING: one hard source, low overall exposure, the face falls into the shadow of the hat brim so no features show, and the neck is no brighter than the face; the face is pure darkness under the brim, and ONE eye shows as a tiny dull ember point in that darkness, not yet glowing. Warm dusk light rakes across the rock from the left. Match reference 2's look exactly: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. No text, no letters, no logos, no watermark, no extra people.
  ```
- **Generation `A3-anim`:** `higgsfield generate create kling3_0 --mode std --duration 3 --aspect_ratio 9:16 --sound off --start-image <A3-still job id> --prompt @A3-anim.txt`  (4.5 credits, from `generate cost`)

  ```text
  Slow push-in toward the dark face under the brim. At about two seconds the single eye ignites into a glowing ember-orange point and flares brighter; a few sparks drift up along the cracks in the rock. The painted figure itself does not move and the face stays dark apart from the eye. Keep the exact look of the frame: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. No text, no letters, no logos, no watermark, no extra people.
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

#### 31. LIPSYNC: hook, part 1 (LS1, method 1)

- **Song:** f1561-f1627 (66 frames), 65.042-67.792 s
- **Lyric:** [L14]
- **Source:** H3 Max 6 s, image ref = real #22 frame 100 (src 3.33 s), audio = vocals.wav 65.039-71.039 s; uses song-synced 65.04-67.79 s
- **Viewer sees:** his neon profile silhouette, hat and beard line against the pink sky, singing, guitar neck in frame
- **Camera:** locked, as the source frame
- **Look match:** the source IS his neon frame; local finish: #22's grain and flame-overlay motion screened on top if the H3 flames stall
- **Generation `LS1`:** `higgsfield generate create minimax_h3_max --duration 6 --aspect_ratio 9:16 --resolution 768p --image <c22_f100.png> --audio <vocals_65.039-71.039.wav> --prompt @LS1.txt`  (15 credits, from `generate cost`)

  ```text
  The man in the reference image sings the supplied vocal audio: "[L14] / [L15]", while playing his black electric guitar. He stays a dark silhouette in profile against the pink sky and his face is never lit; the singing reads through the jaw and beard line in silhouette, opening and closing with every syllable and closing in the breath between the lines. His head lifts on the two held words of the first line, and on the long held last word of the second line his chin rises slowly. Small natural playing movements in the hands and shoulders. The flame overlay keeps drifting across the frame as in the reference. Keep the exact look of the reference frame: hot pink and violet sky, orange flame overlays, deep purple-black silhouette, heavy grain. Locked camera, no zoom, no cuts. No text, no extra people.
  ```
- **Credits:** 15
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
- **Source:** LS1 continued, song-synced 68.33-70.42 s (same job)
- **Viewer sees:** back on the singing silhouette; the chin lifts on the held last word
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
- **Source:** generated: GPT Image 2.5 still (refs: inspiration 15, real #40 frame at 2.5 s, char refs 2, 9) then Kling 3.0 i2v 3 s; uses 47 of 72 frames
- **Viewer sees:** firelight climbs a cracked canyon wall and reveals a painting of him, arms out, with invented glyphs (spiral, zigzag snake, bighorn) around him
- **Camera:** slow tilt up with the light
- **Look match:** match #40 (sepia red sandstone and his shadow, torn border); local finish: colour transfer + grain + border from #40
- **Transition in:** SMOKE WIPE: the serpent's own smoke plus his #46 smoke screened across, f1770-f1786 (local)
- **Generation `A5-still`:** `higgsfield generate create gpt_image_2_5 --variant sunburst --quality xhigh --resolution 2k --aspect_ratio 9:16 --image-references <insp15> --image-references <c40_2.5s.png> --image-references <ref2> --image-references <ref9> --prompt @A5-still.txt`  (4.5 credits, from `generate cost`)

  ```text
  Vertical 9:16, a tall cracked sandstone canyon wall at night, lit only from below. Painted on the rock in worn ochre, umber and soot black: the same man as the references: black wide-brim leather hat with a braided band, long black duster coat with a shredded fringed hem, fingerless black leather gloves, a silver star-compass medallion, a black Les Paul style guitar; long hair behind his shoulders, never over the face; no face paint, full figure, arms held out from his sides, the duster hem shredded; his face dark under the brim. Around him, smaller painted glyphs of the same age: a spiral, a zigzag snake, two bighorn sheep (invented forms, not copies of any real petroglyph). Real fissures run through the painting. The lower half of the wall is in firelight, the top still dark. Match reference 2's look exactly: aged sepia film stock, heavy organic grain, dust, fine vertical scratches, soft light leaks, faded warm amber and umber tones, lifted blacks, a torn and burned photo border at the frame edges. No text, no letters, no logos, no watermark, no extra people.
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

#### 38. LIPSYNC: wake-up 1 (LS2, method 2)

- **Song:** f1899-f1945 (46 frames), 79.125-81.042 s
- **Lyric:** [L20]
- **Source:** H3 Max 6 s, VIDEO ref = real #23 (whole 5 s clip), audio = vocals.wav 79.134-85.134 s; uses 79.13-81.04 s
- **Viewer sees:** his neon profile silhouette with the guitar, singing, carrying his real playing motion
- **Camera:** whatever #23's camera does (the point of the test)
- **Look match:** the source IS his neon clip; local finish: #23 grain
- **Transition in:** EMBER SCATTER: the fire silhouette (37) breaks into rising embers that re-form as the singer, f1889-f1907 (local p5)
- **Generation `LS2`:** `higgsfield generate create minimax_h3_max --duration 6 --aspect_ratio 9:16 --resolution 768p --video-references <c23.mp4> --audio <vocals_79.134-85.134.wav> --prompt @LS2.txt`  (15 credits, from `generate cost`)

  ```text
  The man in the reference video sings the supplied vocal audio: "[L20] / [L21]", while he keeps playing his black electric guitar exactly as in the reference video. Keep his real movement, framing and the camera's motion from the reference video. He stays a dark silhouette in profile against the pink sky and his face is never lit; the singing reads through the jaw and beard line in silhouette, opening on each word and closing in the pause between the two lines; his head pushes forward on the held word of the first line and drops on the last word of the second. Keep the exact look of the reference: hot pink and violet sky, orange flame overlays, deep purple-black silhouette, heavy grain. No cuts. No text, no extra people.
  ```
- **Credits:** 15
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
- **Source:** LS2 continued, song-synced 82.33-84.25 s (same job)
- **Viewer sees:** back on the singing silhouette
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

#### 44. LIPSYNC: wake-up 4 (LS3)

- **Song:** f2124-f2164 (40 frames), 88.500-90.167 s
- **Lyric:** [L23]
- **Source:** H3 Max 5 s, ref = real #26 frame 90 (method 1) or the #26 clip (method 2), picked at the wave-1 gate; audio = vocals.wav 85.496-90.496 s; uses 88.50-90.17 s
- **Viewer sees:** close on his hat and the guitar neck in the flames, singing the last word of the run
- **Camera:** locked (method 1) or #26's own move (method 2)
- **Look match:** the source IS his neon frame
- **Generation `LS3`:** `higgsfield generate create minimax_h3_max --duration 5 --aspect_ratio 9:16 --resolution 768p --image <c26_f090.png> (or --video-references <c26.mp4> if method 2 wins) --audio <vocals_85.496-90.496.wav> --prompt @LS3.txt`  (12.5 credits, from `generate cost`)

  ```text
  The man in the reference sings the supplied vocal audio: "[L22] / [L23]", holding his black electric guitar with the neck rising through the frame. The hat brim and the dark keep his face unlit the whole time; the singing reads through the jaw and beard in shadow and through the head and shoulders, the head lowering slowly on the last held word and holding still after it. Flame overlays keep drifting across the frame. Keep the exact look of the reference: hot pink and violet sky, orange flame overlays, deep purple-black silhouette, heavy grain. Locked camera, no zoom, no cuts. No text, no extra people.
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
- **Source:** generated: GPT Image 2.5 still (refs: real #17 frame 0, ref 3, char refs 2, 9) then Kling 3.0 i2v 3 s; uses 50 of 72 frames
- **Viewer sees:** low over cracked earth at night, heat glowing in every crack; the central crack widens toward camera and embers rise; tiny in the distance, the man and the wolfdog
- **Camera:** slow push-in low over the ground
- **Look match:** match #17 (his neon fire), because it cracks open into #17; local finish: colour transfer + grain from #17
- **Transition in:** cut on the line (f2241) from the scratchboard dog, the night world breaking
- **Generation `A6-still`:** `higgsfield generate create gpt_image_2_5 --variant sunburst --quality xhigh --resolution 2k --aspect_ratio 9:16 --image-references <c17_f000.png> --image-references <ref3> --image-references <ref2> --image-references <ref9> --prompt @A6-still.txt`  (4.5 credits, from `generate cost`)

  ```text
  Vertical 9:16, camera low and close to the ground at night: dry cracked desert earth in large polygon plates running to a dark horizon and a butte. Orange-red heat glows deep inside every crack, brightest in one long central crack that runs toward the camera; thin smoke and heat shimmer rise from the fissures. Far away on the horizon, tiny, the silhouette of the man in the wide-brim hat stands beside the wolfdog. Match reference 1's look exactly: his neon fire composite: hot pink and violet sky, orange and yellow flame overlays drifting across the frame, the figure a deep purple-black silhouette, heavy grain. No text, no letters, no logos, no watermark, no extra people.
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
| `LS1 H3 6 s, method 1 (image ref)` | 31, 33 | 15 | 1 |
| `LS2 H3 6 s, method 2 (video ref)` | 38, 40 | 15 | 1 |
| `BR1 bridge (reuse dd8467ff)` | 09 | 0 | 1 |
| `A3 still + Kling 3 s` | 29 | 9 | 2 |
| `A4 Kling 4 s from #23` | 35 | 6 | 2 |
| `A6 still + Kling 3 s` | 48 | 9 | 2 |
| `LS3 H3 5 s (method from gate)` | 44 | 12.5 | 2 |
| `A1 still + Kling 3 s` | 02 | 9 | 3 |
| `A2 Kling 3 s from #0` | 15 | 4.5 | 3 |
| `A5 still + Kling 3 s` | 36 | 9 | 3 |
| `SB2 Omni Edit of #11` | 47 | 7.5 | 3 |
| `C1 Kling 3 s from #3` | 18 | 4.5 | 3 |
| `SB1 scratchboard (reuse 87b55c41)` | 46 | 0 | 3 |
| **planned total** | | **101.0** | |

**Retry allowance: 40 credits.** That covers one retake of each lipsync method (15 + 12.5), the
bridge retake (6) and one Kling animation retake (6).

**HARD CAP: 150 credits** for the whole song. Stop and ask Robin before anything beyond it, and
log every generate in `secondunit/CREDITS.md`.

For scale: the four earlier dream-of-fire sections cost 66.5 to 101 each, and the augment tests
cost 50. This board covers the whole 97.6 s for about 101 planned, because the bridge and the
scratchboard are takes Robin already approved, two animations start from his own frames (no still
needed), and every transition is local.

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

The same wave discipline as the skill, with the waves sized to the jobs this board has.

**Wave 1, the gate (30 credits, plus the free bridge placement):**
1. **LS1**, method 1 from #22 frame 100, on the hook. The most important shot in the video: if a
   neon silhouette can't carry the lipsync, the board changes.
2. **LS2**, method 2 from the #23 clip, on the first wake-up line. The biggest unknown: does H3 keep
   his real motion?
3. Rider, no credits: cut the accepted bridge take into f0524-f0620 at 1.26x and check the landing
   on #36. Robin wants the bridge in the first wave; it's placed, not generated.

Gate questions, reviewed at normal speed with audio, then slowed, then as a mouth crop: does the
jaw line visibly move on the words and close in the breaths? Does the face stay unlit? Does
method 2 keep his playing motion and look filmed? Does either one invent text or a face? The
answer picks the method for LS3 and decides whether the hook stays on 31/33.

**Wave 2 (36.5):** A3 ember eye, A4 serpent ring, A6 cracks, LS3. These are the chorus and ending
peaks.
**Wave 3 (34.5):** A1 moon, A2 fire ring, A5 rock wall, SB2 night wolfdog, C1 smoke continue.
**Then local only:** the 17 transitions, the worn-film finish, and assembly against the unbroken
song with a frame-count check.

## Risks

- **Silhouette lipsync may not read.** With the face black by design, the sync lives in the jaw and
  beard edge in profile. If H3 turns the head toward camera it can light a face or invent features.
  That is why the gate comes first and why every singing shot is 2 to 3 s long.
- **Method 2 is untested.** H3 may treat the video only as an identity reference and ignore the
  motion, or it may copy the flames and drift. It costs the same as method 1, so the test is cheap.
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
