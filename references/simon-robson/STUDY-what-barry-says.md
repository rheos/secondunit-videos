# What Barry Says (Simon Robson, 2004)

Studied 2026-11-12 for Robin ("i want to study this animation style and see if we can recreate it"). Issue #500.

- Film: https://www.northboysouth.com/what-barry-says (Vimeo 38778632), 2:30, 640x480, 25 fps.
- Direction and animation: Simon Robson (northboysouth; released under Knife Party). Words and voice: Barry
  McNamara. Additional modelling: Andrew Morgan. Grade: Jim Birchenough. Music and sound: Jody K Jenkins.
- All rights reserved. Ideas only: no frames, models, type layouts or audio of his come into our work.

## What he says (fact, from the page)

A 2003 recording of his neighbour's polemic on the coming Iraq invasion, animated in his spare time from
September 2003 to February 2004 with early After Effects and Cinema 4D. It launched at Onedotzero, toured with
Resfest, and won best animation at the London Portobello and Brooklyn International film festivals.

## The film (fact, read off frames every 4 s and four full-size stills)

- **Three inks on cream card.** Cream paper, a poster red, a near-black. Whole scenes flip ground: cream, then
  red, then black. Nothing else, apart from one flame and one flag.
- **The voice is the picture.** Almost every phrase becomes heavy condensed grotesque type, set in blocks,
  slanted, stacked, on grey label slabs, ruled with thin lines in a constructivist layout.
- **The type lives in 3D space.** Words are planes in a C4D scene; the camera flies past, rolls, dives under
  them and pulls them into deep perspective so a line of words becomes a road.
- **Props are flat two-tone 3D.** Tanks, jets, soldiers, missiles, oil derricks, a city skyline. Modelled in 3D
  but shaded flat in red and black with no outline, so they read as printed silhouettes. Rows of them go to
  the horizon.
- **Photos as stencils.** Portraits are thresholded into two inks (red and black on cream), like a screen print.
  Emblems (eagles, roundels, targets) are graphic and flat.
- **Printed-on-paper finish over the 3D.** A heavy paper tooth multiplied over everything (it stays put while
  the 3D moves), a strong vignette, deep depth of field blur on near and far planes, motion blur on fast moves,
  and big soft out-of-focus red shapes drifting through. Slight film softness overall.
- **Full motion,** 25 fps, no held drawings. Cuts land on the voice's phrases.

## How it was made (inferred)

C4D scenes with flat (luminance-only) materials in two or three colours, cameras animated through type and
props, rendered with a depth pass; After Effects for the 2D type, the threshold portraits, depth of field from
the depth pass, motion blur, the paper texture on multiply and the vignette. The type was likely set in AE and
brought into C4D as planes, or the reverse.

## What's new to us

We have kinetic type (`type`, flat 2D in canvas2d), toon 3D in three.js (`toon-cards`, `devweb-world`,
`perspective-illusion`) and print looks (`riso`). We don't have:

1. **Type as architecture.** Words as objects in a 3D scene that the camera travels through.
2. **3D printed on paper.** Flat-shaded 3D with a paper texture that does not move with the scene, plus
   depth of field and vignette, so a render reads as ink on card.
3. **A strict three-ink, ground-flipping palette** in the constructivist poster tradition.
4. **Threshold stencil portraits** from photos (Bob's photos, with his consent already given).

## Recipes (our words)

1. **Script the type from the vocal stem.** Whisper words, re-timed from vocal-stem onsets; each phrase is a
   type block. Lyrics stay out of git as always.
2. **three.js scene, unlit.** `MeshBasicMaterial` in three colours only; no lights, no outlines. Type as
   extruded or flat text meshes in a free condensed grotesque (OFL, e.g. Anton, Oswald or Big Shoulders).
3. **Props from low-poly models** (Poly Pizza CC0, or Meshy for one-offs), every material replaced by a single
   ink, so the silhouette is the drawing. Instance them in rows to the horizon.
4. **One camera path per phrase,** rolling and diving; cut on the phrase.
5. **Finish pass in a shader:** depth of field from the depth buffer (bokeh), motion blur by accumulating
   sub-frames, a fixed paper texture multiplied in screen space, vignette, a little softness and gate weave.
6. **Ground flips** (cream to red to black) on section changes, swapping which ink is paper.
7. **Stencil portraits:** threshold a photo into two inks, then hand-clean the edges.

## What not to copy

His compositions and type layouts, his emblems and eagles, the political imagery (Bush, the swastika-cross
graphics), his models, his VO and sound. Never depict a real politician or a real person a lyric names.

## Verdict

Look test. It is recreatable at 0 credits in three.js, and it's the 3D treatment Robin wanted to try after the
machine. Proposed: 15 to 20 s on William's spoken "David Geffen song" section (about 2:28 to 3:26, no text
anywhere, so ours), type only, no likeness of the person named. Cost: Team-seat tokens, about half a day of
build plus review, a few minutes of render, no paid generation (Meshy only if a prop can't be found free).
Academy fit: a strong Kit lesson ("three.js unlit plus a paper finish pass"), and the finish pass is reusable
by `toon-cards` and `devweb-world`.
