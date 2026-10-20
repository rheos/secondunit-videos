# Experiment log

One entry per take, newest at the bottom. Each take records:

- what changed and why
- the settings that matter (BPM, SEED, PREVIEW, OUTLINES, section beats)
- the commit
- where the renders are
- the verdict

Commit the script before rendering, so every MP4 in `out/` maps to an exact version of the code.
Name renders after the take (`tools/render_preview.py -- take-02`).

To try a variation, change the script, add a take entry and commit. Don't copy the folder:
git history keeps every version. Tag a take worth returning to: `git tag orb-take-02`.

---

## Take 01 (2026-10-16)

**Brief.** A clean, slightly flat, illustrative 15-30 s visualizer. A small glowing orb travels
through varied scenes: abstract orbits, soft geometric environments, atmospheric transitions. It
needs smooth camera moves, a cohesive palette, and should feel music-video rather than technical.

**Settings.** Blender 4.5.14 LTS, EEVEE Next.
- 24 fps, 120 BPM, 48 beats (576 frames, 24 s).
- SEED 7, OUTLINES on.
- Sections start at beats 0 / 12 / 24 / 36. Drops at 12, 24, 36.

**Palette.**

| Role | Hex |
|---|---|
| Ink | #17122B |
| Shadow | #2A1F4A |
| Plum | #4A2F63 |
| Coral | #F2786D |
| Peach | #FFB38A |
| Cream | #FFF1DC |
| Gold | #FFD27A |
| Teal | #3BB7B0 |
| Lilac | #9C8BD8 |

| Section | Sky / fog |
|---|---|
| Orbits | #3A2F6B |
| Corridor | #E39A8E |
| Pillars | #16505E |
| Finale | #1C1535 |

**v1 → v2 fixes, after the first stills:**
- Frame 430 was black. The fog swell (mist depth 4 m) swallowed the orb, so the depth is now 9 m.
- The pillar crane shot lost the field off the bottom of the frame. The camera now ends nearly
  overhead at (-1, 110, 16), and the f-stop goes to 8 over the field so the ripple reads.
- The orb's light pool on the floor came out grey. The floor's light ramp color is now
  plum mixed with peach.
- The finale backdrop disc looked muddy through the fog. It's now coral and closer.
- Distant drifters crowded the top of the first shot. Now 6 of them, 12-20 m out, lower.

**Renders.**
- Stills and the full 720p preview (`take-01_preview_720p.mp4`, 7.6 MB) are in `out/` on the Mac.
  A copy is in ~/Downloads.
- Contact sheet: `reviews/take-01_v2_contact.jpg`. Every 18th frame: `reviews/take-01_v2_motion-strip.jpg`.

**Render cost.** About 1.4 s per frame at 960x540 / 16 samples, and about 15 min for the full
576 frames at 720p.

**Verdict.** It works as a first pass. Motion reads cleanly through all four sections.
- Strongest: the corridor and the finale burst.
- Weakest: the beats 24-26 bridge, which is mostly teal fog with the orb in it, and the corridor
  fog at beat 12, which is a flat peach screen for half a beat.
- Robin has not reviewed it yet.

**Ideas for the next takes.**
- Bake a real song into `energy` and set the sections to its structure.
- Add a second `highs` energy channel for satellite spin and shard sparkle.
- A 9:16 cut: 1080x1920, a wider lens, `shift_x` 0.
- Lyric-safe framing: key `shift_y` to hold a third empty per line.
- Replace the 81 pillar objects with a Geometry Nodes grid, so a bigger field stays cheap.

---

## Take 01b: the same piece on Blender 5.2 (2026-10-16)

**Why.** This Mac is an Intel MacBook Pro and can't run Blender 5. The newer agent skills target 5.x,
so the lab needs a way to render on 5. See `notes/skill-survey-2026-10-16.md`.

**Changes to the script (no visual change on 4.5).**
- The compositor is built two ways: on 5.x a node group with a Group Output, on 4.5 the scene tree
  with a Composite node.
- Both mixes now use the generic Mix node in Color mode.
- Glare's type is set through the property or the 5.x menu socket.
- Video output sets `media_type` first on 5.x.
- The reset also removes the `OV_` compositor node group.

**Checks.**
- On 4.5, frames 60 and 200 are bit-identical to take 01. Frame 445 is 54 dB PSNR (sampling noise in
  the burst).
- 5.2 on Modal CPU (software GL) against 4.5 locally gives 50, 60 and 43 dB on frames 60, 200 and
  445. That is the same picture; 5.2's bloom is a little tighter.
- Sheet: `reviews/port-4.5-vs-5.2_stills.jpg` (left 4.5, right 5.2).

**Cost so far.** Two CPU runs (probe, three stills). Under 2 minutes of an 8-core container each,
a few cents.

**Open.**
- The GPU stills test is blocked until a card is on the Modal account.
- It will show whether EEVEE sees the NVIDIA GPU through EGL or falls back to llvmpipe there too
  (the run prints `gpu_renderer`).


## Take 02: an 8-second Canvas loop for Travel Agent (2026-10-19)

**Brief.** Robin liked Kevin Ngo's Blender GIF of Claude mascots riding a turning tesseract: rendered small and
scaled up into hard pixels, and the loop closes because the shape maps onto itself. He asked for a test in that
manner: an 8-second vertical loop for a song (Spotify Canvas shape), pixel-render look, motion whose symmetry
closes the loop. Issue #235.

**What it is.** `canvas_loop.py`, a separate script from the orb piece. Bob Wiseman's traveller (teal coat,
fedora, suitcase, never Bob) and his rain cloud walk on top of a cube-shaped little world. The cube turns once
in exactly 8 s about the axis facing the camera, so each side face comes up under him in turn: the travel agent
at 0 s, the beach at 2 s, the snow at 4 s, the city at 6 s, and the travel agent again at 8 s, which is frame 1.
He rides the surface height (`A / cos q`), so he climbs over every corner. Walk 1 s, cloud bob 2 s, rain 0.5 s:
every period divides 8 s, so nothing jumps at the seam. Every value is keyed on every frame, linear.

**Look.** Voxel boxes with 16x16 textures generated in Python, sampled Closest through box projection in world
metres (one texel = 0.05-0.12 m), so pixel density is the same on every box. The film's own palette. Sky graded
in screen space (Window Y), so it reads whatever the camera tilt. EEVEE Next at 180x320, filter 0.6, 16 samples;
`tools/canvas_encode.sh` scales x4 nearest-neighbour to 720x1280.

**Settings.** Blender 4.5.14 LTS. 24 fps, 192 frames. Cube half-size 2.5 m, traveller x1.4, camera at
(-7, -23, 11.6) aimed at (0.3, 0, 1.6), 50 mm on a 24 mm vertical sensor.

**Speed.** 192 frames in 27 s on this Mac (about 0.14 s a frame).

**Seam check** (`tools/canvas_encode.sh take-02`): PSNR of every frame step, median 19.36 dB (17.56-20.85);
last frame to first 20.77 dB. The seam is an ordinary step.

**Renders** (`out/canvas/take-02/`): `take-02_canvas_720x1280.mp4` (8.0 s, silent, the Canvas) and
`take-02_review_x4_song.mp4` (four loops over the song from 1:30, for review only). Contact sheet:
`reviews/take-02_canvas_contact.jpg` (one frame a second).

**Verdict.** Robin, 2026-10-19: "this is great. love it." Merged in #236 (6805b44); tagged `canvas-take-02`.

The take-02 helpers now live in `canvas_kit.py` (textures, boxes, camera, sky, render, run), shared by takes
02-04. Take 02 renders bit-identical through it (frames 1, 60 and 130, PSNR inf against the pre-kit script).


## Take 03: an 8-second Canvas loop for All The Trees (2026-10-19)

**Brief.** Robin loved take 02, so the same treatment for Bob's other songs, one Canvas per track. Issue #237.
All The Trees has the clearest single image of the set: the film's thesis, that trees look separate but their
roots join.

**What it is.** `canvas_trees.py`. The sun-headed man (ultramarine robe) and the moon-headed woman (rose robe)
stand apart on a floating island with their arms raised into boughs, and the heart tree between them. Under the
island their roots hang down, three strands each plus the heart tree's, and meet in one gold knot with a
taproot below. The island turns once in exactly 8 s about the vertical. A gold pulse runs down his middle root,
through the knot (which flares) and up hers in 4 s, then back in 4 s. The two cloud trumpeters stay fixed left
and right of the sky, facing us like the film's plates, horns pointing in. Boughs and trumpeters rock on 2 s, the
heart beats on 1 s (a thump and an echo), the horns lift on 1 s, the sun's eight rays turn 45 degrees in 2 s and
the gold ring round the heart 30 degrees in 2 s, so both map onto themselves.

**Look.** The film's hand-coloured engraving palette: azure sky graded to cream, ultramarine and rose robes with a
hatch every third pixel column, gamboge sun, sap-green leaves, tan soil steps. Roots are chains of axis-aligned
boxes along curves, so they step like voxels. Not Bob or anyone real.

**Settings.** Blender 4.5.14 LTS, EEVEE Next at 180x320, 16 samples. Island top 5.2 m, figures about 2.3 m.
Camera at (0, -24, 5.2) aimed at (0, 0, -0.05), 47 mm.

**Speed.** 192 frames in 34 s on this Mac.

**Seam check** (`tools/canvas_encode.sh take-03`): steps median 24.82 dB (23.74-25.89); last frame to first
25.05 dB. SEAM OK.

**Renders** (`out/canvas/take-03/`): `take-03_canvas_720x1280.mp4` (8.0 s, silent) and
`take-03_review_x4_song.mp4` (four loops from 48.1 s, the first chorus trumpet passage). Contact sheet:
`reviews/take-03_canvas_contact.jpg` (one frame a second).

**Verdict.** Not reviewed yet.


## Take 04: an 8-second Canvas loop for The Reform Party at Burning Man (2026-10-19)

**Brief.** The second song for #237. The boardroom art car is the film's one image, and it is made of boxes
already.

**What it is.** `canvas_playa.py`. The car holds still in frame on its circle round the Man, and the playa turns
under it once in 8 s, as the world turned under the traveller in take 02. The table covers the whole car: suits
on black office chairs built out from its edge, the driver's red hat in the hole in the middle, a whiteboard of
bar charts, a speakerphone, laptops and mugs. Behind it the Man stands on his stepped base at the centre of the
disc, and the city arc (shade structures, tents, domes, a trailer under a flag, Esplanade lamp posts) runs from
2:00 to 10:00 on the rim, with the onion-dome Temple out at 12:00. Wheels make exactly 15 turns a loop (the
circle's length over the wheel's), the car rattles on 0.5 s, dust puffs live 0.5 s, the suits nod on 1 s and vote
a third at a time on 2 s, and the driver looks about on 4 s.

**Look.** The drawn film's palette (draft 24): navy suits, cream egg heads, red table top with gold trim,
mahogany skirt, black chairs, playa tan with Voronoi crazing on the 16 px tile, desert blue sky. The disc is
built from strips in one mesh (`canvas_kit.disc`), so the crust texture runs across without seams and the rim
steps like voxels. Allegory only: faceless suits, no real people, no little Bob. The Temple is kept small and on
the rim so it never covers the car when it swings to the front.

**Settings.** Blender 4.5.14 LTS, EEVEE Next at 180x320, 16 samples. Playa radius 6.2 m, car on a 3 m circle,
wheel radius 0.2 m. Camera at (-1, -14.5, 12.5) aimed at (0, -1.1, 0.4), 44 mm.

**Speed.** 192 frames in 33 s on this Mac.

**Seam check** (`tools/canvas_encode.sh take-04`): steps median 19.54 dB (18.68-20.36); last frame to first
19.24 dB. SEAM OK.

**Renders** (`out/canvas/take-04/`): `take-04_canvas_720x1280.mp4` (8.0 s, silent) and
`take-04_review_x4_song.mp4` (four loops from 35.0 s, the first refrain and the sax lick). Contact sheet:
`reviews/take-04_canvas_contact.jpg`.

**Verdict.** Not reviewed yet.

## Takes 05-08: four pixel-world look tests for Real Thing (2026-10-19)

**Brief.** Robin: the pixel Blender style might suit Bob Wiseman's Real Thing, maybe as the opposite of the real
thing; the gorilla stays if Bob wants it, but more proposals would help. Bob's own brief (note on draft 1): an
entirely different story that makes us think about the lyric, never the lyric illustrated. Each take compresses a
whole-film idea into the 28 s of song 21.0-49.3 (the same stretch as the 2D gorilla look test). Issue #244.

**Kit.** `film_kit.py` on top of `canvas_kit.py`: frames numbered by song frame, one camera per shot cut by
timeline markers, voxel people (`person()`, walk/stand/sit poses), and the pixel look in the compositor: a
Pixelate node whose Size is keyed per frame with constant steps, plus a cryptomatte list of objects that stay
sharp. 1280x720 EEVEE, about 0.7 s a frame on this Mac. `tools/film_encode.sh` muxes the song from the same song
time. Four builders worked in parallel, one script each; the coordinator reviewed every contact sheet.

| Take | Script | Idea | Pixel use |
|---|---|---|---|
| 05 | `realthing_connection.py` | Bad connection: a grandfather's frozen video call; he drives to his granddaughter's porch | resolution is distance: size 8 at home, 6, 4 on the road, 2, then 1 exactly on the hug |
| 06 | `realthing_pet.py` | The pet: a keychain pixel pet dies while the real dog waits with the leash | pixels only on the LCD (sprite frames as box objects switched by show()); the room renders sharp |
| 07 | `realthing_respawn.py` | Respawn: a game shopkeeper sells the same sword forever, walks off the map into a grid void, finds a crack onto a real sunrise | world at size 6; the sunrise (`CL_sr_*`) in the sharp list stays crisp |
| 08 | `realthing_gorilla.py` | Bob's gorilla story, draft 3's verse beats and times, as a voxel jungle | whole frame at size 5 |

**Renders** (`out/film/take-0N/take-0N_f00504-f01183_24fps_draft.mp4`, 680 frames each, song muxed; reel
`out/film/reel/realthing_pixel-looks_takes05-08_review.mp4`, 116 s). Contact sheets: `reviews/take-0N_realthing_contact.jpg`.
badframes: 0 on 06-08; 3 on 05 at the cut onto the night road, which are dark frames, not faults.

**Known faults.** 05: the opening room is dark and muddy at size 8, his face doesn't read there; the car reads as a
golf cart; he appears beside the car instead of getting out. 06: the pile jumps from his feet to the door between
shots; the sleeping dog is small. 07: hero 3 crosses close to camera for a few frames; the apron is a white slab.
08: the banana reads like a crown seen end-on; his legs are big dark blocks in the lying shots.

**Verdict.** Waiting on Robin.

## Take 07 to whole song: Respawn plan (2026-10-20)

Robin wants the Respawn idea (take 07) developed for all of Real Thing, alongside the gorilla film. Plan 1 is a
gitignored `STORYBOARD-respawn.md` here: eight acts over the 165.9 s song, the take-07 look and pixel rule kept (game
pixelated at size 6, the real world sharp), the sketch's sunrise moved to refrain 3 as the climax. A flower seller
who follows him off the map is the one new character. Nothing built or rendered yet; waiting on Robin's go.
Long renders go to Modal, not this Mac.
