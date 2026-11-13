# New City: constructivist type in 3D, printed on paper (look test)

**Reference build: Blender** (`blender/newcity_blender.py`), the same test as three.js v2 with the engine swapped.
Robin, 2026-11-12, comparing `out/review/new-city_constructivist-blender-e_f0-f468_24fps_review.mp4` with the three.js
`new-city_constructivist-v2-cobalt-d_f0-f468_24fps_review.mp4` (same 19.5 s, same finish): Blender reads closer to What
Barry Says. Issue #505. The three.js v2 (`newcity.html?v=2`, `js/story2.js`) stays as the fast version; its verdict
on cobalt-b was "it lands, keep it". v1 (`js/story.js`) is kept as the record of what missed.

## The whole song (Blender)

Robin's go, 2026-11-12: finish New City end to end in the Blender build. Issue #511.

**Stopped, 2026-11-12, before the render finished.** Robin, on half the song rendered and the stills: "i'm actually
not that happy with how this is turning out.. the animals look terrible.. it's probably not the right thing for this
song.. let's wrap it up." What didn't work, as far as it can be read from the frames: code-built animals at film size
read as toys next to the CC0 buildings; the chorus shots repeat the same three ideas four times over three and a half
minutes; and the look-test grammar (one printed line per shot, skimmed or stacked) has no build or release across a
whole song. The look itself stays a 19.5 s test. The render route (`blender-render.yml`) and the sung-order aligner are
the parts worth keeping. GitHub's CPU runners took 75-160 min per 282-frame slice on the crowd shots, far slower than
the 24-frame speed test, so budget software EEVEE from the heaviest shot, not the lightest.

```bash
nice -n 15 uv run -q --python 3.11 --with torch==2.2.2 --with torchaudio==2.2.2 --with 'numpy<2' --with soundfile --with scipy \
  python tools/align_sung.py _in/demucs/vocals.wav work/sung.txt work/sung.align.json        # the song as sung, timed
blender -b --factory-startup --python blender/newcity_blender.py -- --full --res 50 --samples 8 --stills 600,1330 --tag check
blender -b --factory-startup --python blender/newcity_blender.py -- --full --samples 16 --mbsteps 1 --save out/blender/newcity-full.blend
../tools/cloud-render/blender-cloud.sh out/blender/newcity-full.blend 0 5638 out/blender/newcity-full_silent.mp4 20 16
```

- **Words and times.** `work/sung.txt` (gitignored) lists the lines in recording order, words from Bob's sheet, one
  search window per line from the Whisper pass; `tools/align_sung.py` aligns each line to the Demucs vocal stem and
  snaps every word to its onset. The recording sings "who could" where the sheet has "who can"; the type follows the
  sheet until Robin hears it. A short ad-lib near 2:26 in the third chorus is not printed.
- **Shots** (`blender/song.py`): verse 1 is the look test. The choruses stack printed blocks, one dropped onto the stack
  on each word ("build this city"), raise every arm in a crowd in a wave from the big word ("lend their hand"), and
  end on the junction seen from high ("understand"). The animals verse uses the B rounded animals from the signed-off
  board (they turn to face us on "hear"), and ends on the rising-scale card Robin picked for verse 1. The flags verse
  uses bare masts, never a flag, then two crowds facing off across a bar. The instrumentals are the city rising out of
  the card, the avenue of open gates, and the finished city with its roofs in the motif yellow. The motif yellow grows
  across the choruses on what is being built. The colour arc runs cool to warm over the whole song.
- **Render** on GitHub Actions (`blender-render.yml`), 20 slices of EEVEE on Mesa's software GL with the bpy wheel, at
  16 samples and one motion-blur step: about 25 s a frame per runner, an hour of wall time, inside the Pro plan's
  free minutes. The cloud frames match the Mac's. The .blend holds the lyric as type, so it goes up as a draft
  release asset and is deleted after the run.
- **Lessons.** Blender merges keyframes closer than 0.01 frame, so a "hidden just before the cut" key 0.01 frame early
  vanished; switch keys sit 0.03 frame apart. Keying `hide_viewport` stops the object's animation being evaluated at
  all; key `hide_render` only. Orbit cameras need the city in rings outside their path, not rows through it. Type on
  a block top turns to read upright from where the camera is when the block lands.

## Blender rebuild

```bash
blender -b --factory-startup --python blender/newcity_blender.py -- --stills 48,186,290,380 --tag check   # out/blender/check/
blender/render_chunks.sh constructivist-blender-f        # 468 frames in 78-frame chunks, muxed with _in/new-city.wav
```

Blender 4.5.14 (the last Intel build). Needs `work/words.settled.json` and `_in/new-city.wav` (both gitignored). About
1.2 s a frame at 720p on the Mac's AMD GPU, 12 minutes for the cut; long unbroken EEVEE renders have crashed this Mac, so
the script renders in chunks with 30 s pauses. Options: `--res`, `--samples`, `--nomb`, `--nodof`, `--noshadow`,
`--objpaper`, `--veil`, `--lift`, `--halo`, `--noproj`.

- **Same story, same numbers.** Everything is built in three.js coordinates under one root empty turned +90 degrees
  about X, so `story2.js` ports line for line: the city RNG bit for bit, the CC0 models fitted the way `ink.js` fits
  them, Anton type at cap height 1. Every value is a function of song time, sampled at quarter frames plus both sides
  of each cut and each word's stamp time into keys, so a word never appears half-blended on its first frame.
- **One light, three inks.** A real sun along `ink.js`'s light, Diffuse > Shader to RGB (a sun of strength pi gives 1
  on a face square to it) plus the same world noise, thresholded at the same t1 and t2. Unlike three.js it casts
  shadows, so buildings and the crowd shade each other.
- **Doors** swing in geometry nodes off Scene Time, so the wave is exact at every motion-blur step.
- **Camera and lens.** three.js lookAt and roll; vertical fov on a 24 mm sensor height; the f-stop is set so EEVEE's
  thin lens gives the same circle of confusion as `main.js` (lens diameter 2 x aperture x tan(fov/2)).
- **Finish in the compositor:** gate weave, the ground ink under a transparent render, the paper (baked once with the
  same hash, noise and fbm as `main.js`), the projection pass, vignette.

## The finish, after Robin's notes on the Blender cut

- **Paper under the print.** The reference's tooth sits on the ground colour; the inked shapes come away from it
  nearly clean, with a trace on light objects. The render's alpha (after depth of field and motion blur) masks it:
  full tooth on the open backdrop, 30% on objects. Before this, the tooth sat over everything.
- **Projected, not painted.** Robin: "like a holographic projection... not so opaque but not transparent either".
  The reference's black ink measures 45-55/255; ours rendered at 4-10. A veil (3.5% of a wide blur of the frame) and a
  0.02 linear lift take the inks to charcoal tinted by their surroundings, and a fog glow off the bright paper bleeds
  over dark edges. three.js got the same pass (#504).
- **Colour.** three.js r160 linearised the palette twice (`Color.set` already converts hex to linear, then
  `convertSRGBToLinear` again), so the approved cuts show lin(hex). Blender keys lin(lin(hex)) to match what Robin
  approved, not the hex codes.

## Lessons (Blender)

- Set an image's colour space before writing its pixels: switching a generated float image to Non-Color afterwards
  re-encoded it (every value came back to the power 1/2.2).
- Several shot functions writing the camera each frame means the last one wins: only the active shot may key it.
- A constant visibility key on a frame boundary half-blends the first frame under motion blur; key the exact time.
- Grazing faces under the sun's shadow map get a sawtooth edge (the near bar in line 3). It reads as print
  roughness at review size; a higher shadow resolution or a small sun angle would soften it.

## three.js v2, after Robin's notes on v1

- Real CC0 models (`assets/models/`, credits in `CREDITS.md`) lit by one fixed light and thresholded into the inks
  (`js/ink.js`), so every block has a lit side and a dark side. v1's one-ink silhouettes read as flat cut-outs.
- Type printed flat on surfaces the camera skims: a street card, gateway lintels, crossing bars, a card under a crowd.
  v1 stood extruded words up facing the camera, which read as a 2D poster in front of a backdrop.
- A low, wide, rolled camera through dense rows. Each word is placed ahead of the camera on its onset; in the gate
  flight the gates are spaced by the time between words, and words sung under 0.3 s apart share a lintel.
- Palette by role (`?pal=`): cobalt, from the Accidentally Acquired Beliefs cover, drifts cool to warm over the piece,
  and a motif yellow grows on what is being built (crane loads, opened doors, a rule, the last big word). The first
  palette is archived as `?pal=oxblood` ("very cool, but it's also kind of fascist").
- Paper: an embossed, lit card tooth matched against a 1:1 crop of the reference, showing through dark ink too.

The v1 notes follow.

Bob Wiseman, "New City" (Accidentally Acquired Beliefs), song 0:00.0 to 0:19.5, the first verse, 24 fps song frames
0 to 468, 1280x720. Issue #502. Internal test, not for the client page. Look: `looks/constructivist-type-3d.yaml`.

The idea comes from the study of Simon Robson's "What Barry Says" (`references/simon-robson/STUDY-what-barry-says.md`,
#500/#501). Ideas only: none of his frames, layouts, emblems, models or sound. Story, city, gates, people and type
layouts are ours. No political imagery, no real people.

## The look

- Three inks: cream card, poster red, near-black. The ground (the paper) flips ink at every cut: cream, red, black, cream.
- The sung words are Anton (OFL) glyph outlines extruded into 3D (`js/type.js`, opentype.js), standing in the scene
  as towers, lintel signs and slabs. Each word lands on its vocal-stem onset.
- Props are flat one-ink silhouettes drawn in code (`js/city.js`): stepped towers, drum towers, chimneys, lattice
  cranes, gateways, people. Unlit `MeshBasicMaterial`, no lights, no outlines.
- Finish (`js/main.js`): 6 sub-frames over a 180-degree shutter for motion blur, depth of field gathered from the depth
  buffer, a paper tooth fixed to the screen on multiply, gate weave that moves the print against the paper, slight
  softness, vignette.
- Layout (`js/story.js`): one camera path per line; words are placed by where they should sit on screen when the whole
  line is in, then the camera moves through that 3D arrangement.

## Running it

`work/words.js` (gitignored, it quotes the lyric) holds the words and their onset times. `_in/` holds the song,
its Demucs vocal stem and the ear-check clips.

```bash
PW_FROM=<a package.json that resolves playwright-core> OUT=out/frames FRAMES=0-467 node render.mjs
```

Add `Q=lineup` for the prop line-up, `Q="sub=1&nodof=1"` for fast sharp debug frames. About 0.25 to 0.6 s a frame at
720p on the Mac's Intel GPU.

## Timing

Forced alignment of the Bandcamp lyric sheet to the vocal stem (`tools/align.py`, torchaudio MMS), snapped to onsets
(`tools/onsets.py`), then three weak spots fixed by hand from the onset list: two short words sung legato after a
strong one, an article before the next word's plosive, and a held last word on its onset. In line 2 the recording
sings a singular noun where the Bandcamp sheet has a plural (no sibilant after the vowel); the type follows the
recording. The settled words and times are in `work/words.settled.json`.

## Lessons

- A word placed by screen position can land below the ground plane. Grow it up from its baseline (scale y) instead of
  sliding it up through an opaque ground.
- City rows must not grow with distance, or they merge into one black wall. Keep tower heights flat and let perspective
  shrink the far rows.
- Same-ink overlaps vanish: a red word over a red skyline loses its letters. Tilt the camera so the skyline sits low.
- Side faces in a contrasting ink scramble small words; keep sides in the face ink except on big standing slabs.
- Low wall stubs beside every gate pile up into a black band; gates read best freestanding.
