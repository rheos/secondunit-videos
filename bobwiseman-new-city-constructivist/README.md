# New City: constructivist type in 3D, printed on paper (look test)

**Current version: v2** (`newcity.html?v=2`, `js/story2.js`), cobalt palette. Robin's verdict 2026-11-12 on
`out/review/new-city_constructivist-v2-cobalt-b_f0-f468_24fps_review.mp4`: it lands, keep it. Next: the same test in
Blender, to compare. v1 below (`js/story.js`, no flag) is kept as the record of what missed.

## v2, after Robin's notes on v1

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
