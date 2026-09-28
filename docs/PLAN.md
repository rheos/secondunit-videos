# Painted Myth: plan and cue table

Hjeron, "Dream of Fire", instrumental intro. 0.00 s to 25.84 s, where the first sung word "The"
starts. 620 frames at 24 fps (frame n is song time n/24), 1920x1080, muxed with the untouched song
audio for the same span. Zero paid generation: every pixel is drawn in code and rendered locally.

Output: `output/painted-myth-intro.mp4`, contact sheet `output/painted-myth-intro_contact.png`.

**Correction (2026-09-28):** "Dream of Fire" is a Hjeron solo song, not a MythMaker track. Robin's
call: no wordmark and no name on screen. The MYTHMAKER wordmark finale was removed and no file from
`mythmaker/assets/brand/` is loaded any more. Everything before 23.64 s is unchanged, apart from a
softer pyre core on the hits.

## Concept

One continuous shot of a night desert that paints itself. A fire circle draws itself on the sand,
an ouroboros is inked stroke by stroke in the smoke above it, the antler-rune medallion assembles
inside the serpent's ring. In the breakdown the fire ring flares, the sigil relights, and a twisted
column of smoke rises through it and bends across the frame, handing off to the first sung line,
"The air it bends, the smoke twists". Red rock, a ram skull, charred posts, a dead juniper, a dusk sky over mesas. Aged print
grade with a scorched, torn edge.

## How the timing was found

`tools/analyze.py` runs librosa over the Demucs `no_vocals.wav` stem (0 to 27.8 s). Findings:

- Tempo 147.7 BPM (beat 0.406 s). The beat tracker is stable from 0.27 s.
- **Downbeats are beat phase 2**, not phase 0. The strongest onsets (2.69, 4.32, 14.08, 17.25,
  18.84) all fall on beats 2, 6, 10 ... so bars start at D0 = 1.08 s, every 1.625 s.
  Phase 0 also carries accents (5.12, 8.37), heard as half-bar hits.
- Section map: pickups at 0.27 / 0.67; a sparse intro from D0 to D7 (1.08 to 12.45) where
  low-heavy and mid-heavy bars alternate; the bass enters at 12.45 and swells for one bar; the big
  kick lands at **14.08** (onset 1.27, low band 1.07), and the full groove runs to 22.84; a
  breakdown from 22.84 (hits at 23.64, 24.43), and a big low hit at 25.24 before the pickup vocal.

Cue times live in `CUE` at the top of `js/scene.js`. They are read from the beat list, not typed in.

## Cue table

| Time (s) | Source | What happens |
|---|---|---|
| 0.27, 0.67 | pickup beats | two sparks glint in the black |
| 1.08 | D0 | the sky paints in, horizon up, in broad dabs: stars, milky way, dusk band |
| 2.69 | D1, onset .98 | a meteor crosses; milky way lifts |
| 4.32 | D2, onset 1.12 | far mesas paint in left to right; camera cranes down to the horizon |
| 5.12 | onset 1.27 (strongest of the intro) | ram skull on its rock, foreground left, moon-rimmed |
| 5.91 | D3 | the dead juniper grows branch by branch on the right ridge |
| 7.56 | D4 | a fuse lights at the front of the circle; two sparks race round and draw the ring in fire |
| 8.37 | onset 1.32 | sparks meet at the back; the pyre ignites (flash, camera punch, shake) |
| 9.18, 10.00, 10.82, 11.63 | half-bars | four torch pairs light, back to front |
| 10.82 | D6 | smoke column rises; the ouroboros pen starts inking at the tail |
| 12.45 | D7, bass enters | the pen accelerates through the swell; camera tilts up after the smoke |
| 13.58 to 14.00 | run-up | the head is inked, jaws open |
| **14.08** | D8, the kick | **the serpent bites its tail**: flash, fire flares, zoom punch, shake; gold runs round the scales |
| 15.66 | D9 | molten bronze spreads from the centre of the ring |
| 17.25, 17.66, 18.04, 18.45 | beats | four rim quarters fly in and lock, one per beat |
| 18.84, 19.25, 19.64, 20.06 | D11 (onset 1.28) + beats | 24 Elder Futhark runes stamp into the rim in four groups of six, hot then cooling |
| 20.46 | D12 | the antler tree grows from the base of the field |
| 20.85, 21.24, 21.64 | beats | tines sprout in pairs |
| 22.04 | D13 | the diamond between the antlers ignites; a glint sweeps the metal |
| 22.84 | last hit before the break | final flare of the emblem, then the breakdown |
| 22.96 to 24.04 | breakdown | camera pulls back wide; the emblem shrinks up into the sky and dims; fire drops |
| 23.64 | D14 hit | the fire ring flares: every lick leaps and a wide glow washes the ground |
| 24.43 | hit | the small sigil relights (flare, back to full brightness); a twisted smoke column starts rising from the pyre through it |
| 25.24 | D15, big low hit | the pyre surges and the air bends the smoke: the column bows, then its top sweeps right across the upper frame, still twisting; camera tilts up after it to the last frame (25.79) |

## Camera

Keyframed in `camera()`: starts tight on the stars (zoom 1.8), cranes down to the land by 5.9,
settles on the circle, pushes in slowly through the torches, tilts up with the smoke as the serpent
is inked, punches on the bite, pushes into the medallion with a slight roll, then pulls back on the
breakdown to the only full wide frame of the piece, then tilts up after the bending smoke. Parallax: sky 0.5, far mesas 0.55, mid rocks 0.8, ground 1, skull 1.12.
A slow handheld drift keeps it from feeling locked off. Shake only on the pyre, the bite and 22.84.

## Layers

Renderer: `js/paint.js`, adapted from functional-emotions-video (MIT, `LICENSE-functional-emotions`),
the same engine the Pnubb painted spike uses. Scenes draw three Canvas2D layers per frame:

- **src** (960x540 underpainting): sky, clouds, mesas, ground, skull, tree, smoke, fire bodies,
  the serpent's body and the bronze disc. The GPU repaints it with three layers of instanced
  brushstrokes that sample its colour and follow its edges, so it reads as oil on board.
- **ink** (1920x1080, unbrushed): the hand-inked linework that has to stay crisp. Serpent
  contours, scales, spines and head; medallion rim, runes, antlers and diamond; skull cracks and
  rim light; cloud edges; smoke wisps. Lines use a pressure and wobble model (`inkLine`), not
  vector strokes.
- **fx** (960x540 additive light): flames, glows, stars, pen tip, embers, plus a blurred copy for
  bloom and red halation.

The finish pass (new here) grades the whole frame like aged print stock: soft shoulder, deeper
shadows with an umber toe, cream highlights, clumped per-frame grain, dust specks, an occasional
scratch, sub-pixel gate weave, vignette, and a torn, scorched edge with a faint ember line.

## Source material

Everything is drawn in code. The medallion and ouroboros are code-drawn motifs (antler tree,
diamond, rune ring, scaled serpent); no image file is loaded, so no photo, face or brand asset
appears in frame.

## Run it

```bash
npm install                                         # playwright only; uses the system Chrome
../../../viralvision/viralvision-worker/.venv/bin/python tools/analyze.py --report   # js/data.js
open index.html                                     # live player with audio (space to play)
node check.mjs out/sheet.jpg 5.12 8.4 14.08 25.5    # contact sheet of any song times
node render.mjs 0 620 output/painted-myth-intro.mp4 3
```

Measured: about 0.3 to 0.85 s per frame in the checker, 269 to 329 s for all 620 frames with
3 workers while other sessions had the Mac at load 45 to 250. About 7 minutes wall clock with the
encode.

## Known weaknesses

The ram skull is the weakest drawing; the mesas are flat cutouts; the ring flames repeat; before the
bend, the smoke column reads a little like a light beam; the file is large (139 MB) because
per-frame grain costs bitrate.
