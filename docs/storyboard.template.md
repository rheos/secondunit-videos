# Storyboard: "dream of fire" (hjeron_dark_blues)

<!--LOCAL-->

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

{{SHOTS}}

## Totals

{{TOTALS}}

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
