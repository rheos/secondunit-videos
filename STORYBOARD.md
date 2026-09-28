# Storyboard: "dream of fire", painted (hjeron_dark_blues)

Hjeron's solo song, in the persona of **The Wyrd One** (his character sheet and corrections are the
canon; see the character rules in `ANIMATION_GUIDE.md`). NOT MythMaker: no MythMaker branding, no
wordmark, no name, no text on screen at all. 97.583 s = 2342 song frames at 24 fps. Every frame is
drawn in code; zero paid generation. Two formats from the same code: 9:16 first, 16:9 later.

Lyrics are Hjeron's and stay out of git: this board names cue words only. The timing source is
`js/data.js` (his lyric sheet force-aligned to the vocal stem); check sung hits against `F('voc', t)`.

## The film in one breath

A man in a black hat walks out of a scratched-ink night toward a moon with a serpent's face in it,
his wolfdog at his side. At first light the ink fills with sepia fog full of whispering smoke; he
reaches into it and is pulled through, and the world comes unglued like an old photograph tearing.
Behind the tear is day: a sandstone canyon wall where his shadow becomes a painting among the old
handprints, a ram skull on a fire ring, a rattlesnake that shakes its warning at us. The fire climbs
into a blazing sunrise; on a butte against the burning sky one ember eye opens under his brim, a
smoke serpent coils into a ring around him and he sings the hook, arms out, as the painted world
dissolves into flame. The flame burns everything back to ash. At dusk on a cracked plain he asks if
we'll wake up; the night hushes, and heat rises glowing from the cracks beneath him. Hard stop.

**The journey is only in the paint.** One character throughout; the LOOK changes by section:
ink -> sepia -> rock -> sunset -> cracks (presets in `js/cast.js` `LOOK`). Each chapter owns one
location and one look. Locations move forward and never return.

## Chapters

| ch | file | song time | frames | location | look | owner |
|---|---|---|---|---|---|---|
| c1 NIGHT WALK | `js/ch/c1.js` | 0.000 - 25.833 | 0 - 620 | night desert, dunes and saguaro under the full moon | `ink` | agent |
| c2 FOG | `js/ch/c2.js` | 25.833 - 38.750 | 620 - 930 | pre-dawn fog flats, bare ground, dead trees | `sepia` | agent |
| c3 CANYON WALL | `js/ch/c3.js` | 38.750 - 58.042 | 930 - 1393 | a sandstone canyon wall with petroglyph handprints; the fire ring below | `rock` | agent |
| c4 SUNRISE (hook) | `js/ch/c4.js` | 58.042 - 78.667 | 1393 - 1888 | a butte top against a blazing sunrise | `sunset` | reference chapter (painted first) |
| c5 CRACKS | `js/ch/c5.js` | 78.667 - 97.583 | 1888 - 2342 | a cracked clay plain at dusk into night | `cracks` | agent |

Boundaries sit on the song's own seams: 25.833 is the first sung word, 38.750 a drum crack before
"bones", 58.042 the downbeat after the warning lines, 78.667 two beats after "absolves".

## Handoffs (the outgoing chapter sets them up, the incoming one picks them up)

- **c1 -> c2, smoke becomes fog.** c1 ends with smoke pouring down off the serpent moon and filling
  the frame. c2 opens inside that smoke (its first shot `xin: .8` crossfades the look ink -> sepia).
- **c2 -> c3, the world comes unglued.** c2's last shot tears the sepia frame apart like an old
  photo on "unglued" (38.2 to 38.75). c3 opens on the drum crack at 38.75, the sandstone behind it.
- **c3 -> c4, the fire becomes the sunrise.** c3 ends pushing into the fire ring's flames, which rise
  until they fill the frame. c4 opens as those flames thin into a burning sunrise sky.
- **c4 -> c5, the flame absolves.** c4's last beats burn the painting down to black ash with a few
  embers. c5 opens from that black onto the ash-grey cracked plain at dusk.

## c1 NIGHT WALK (0.000 - 25.833, instrumental, ink)

Tempo ~147.7 BPM with bars from 1.08 s (one bar 1.625 s); the strongest hits are 2.69, 4.32, 14.08
(the kick after a bass swell from 12.45), 17.25, 18.84. Full intro analysis:
`../hjeron-painted-myth/docs/PLAN.md` (its cue table is a good starting point; do not reuse its
MythMaker medallion).
- Opens on black; stars scratch in on the first bars (etch look, white lines scraped from black).
- The full moon rises over the dunes. Its smoke gathers into a rattlesnake's face (his board #18);
  its ember eyes open on the 14.08 hit.
- The Wyrd One seen from BEHIND, small, walking toward the moon along a dune crest, duster hem
  streaming, guitar hanging from one hand; the wolfdog trots beside him (medium, lean, not a husky).
- Scratchboard walk (his board #19): a low wide with a saguaro silhouette, the stars wheeling.
- End (from ~23.6): the moon's smoke pours down the dunes and fills the frame for the handoff.

## c2 FOG (25.833 - 38.750, verse 1, sepia worn film)

Cue words: "air", "bends", "smoke", "twists" / "thousand", "voices", "mist" / "reach", "pull",
"through" / "lost", "sky", "unglued".
- Fog flats before dawn. His silhouette and the guitar loom out of the haze (his board #25: the
  guitar standing close in the foreground, him further back, forced perspective).
- "bends" / "twists": the air visibly bends, smoke twisting in spirals around him.
- "voices": pale smoke wisps rise all over the fog like whispering breath (NOT people, no faces).
- First SINGING close-up of the chapter: veiled head, frontal or 3/4, phrasing with the vocal.
- "reach": his gloved hand reaches toward the fog; "pull ... through": the camera is drawn through
  the fog wall past him.
- "unglued": the handoff tear (above).

## c3 CANYON WALL (38.750 - 58.042, verse 2, rock-wall painting)

Cue words: "bones", "remember" / "sand" / "slip", "spirits", "hand" / "rattles", "shake", "fire",
"hums" / "speaks", "flames", "beats", "drums" / "warning" x2, "me", "you".
The rhythm section drives this chapter: hits on the drum cracks (`FEAT.fast`, `F('perc')`).
- A sandstone canyon wall in hard daylight, painted as a rock-wall painting (his board #15 to #17).
  Its petroglyph handprints and spirals are part of the rock.
- "bones": a ram skull on the stone fire ring (his real set-up); "remember" the camera holds on it.
- "sand": wind drags sand across the ground in sheets.
- "slip ... spirits hand": he walks between two huge petroglyph hands on the wall that seem to
  close around him (no skeletons, no bones here; this was a note from Robin on the last video).
- "rattles": a rattlesnake coils on the rock beside the fire ring; its rattle shakes on the hits.
- "fire", "hums": the fire ring catches; its glow pulses with the drums.
- "warning ... me and you": SINGING close-up to camera, then the snake rears toward the lens on "you".
- End: push into the flames for the handoff.

## c4 SUNRISE (58.042 - 78.667, pre-hook + hook, blazing sunset oil) - REFERENCE CHAPTER

Cue words: "serpent", "sunrise", "asking" / "open", "eyes" / "dream", "fire", "dream", "gold" /
"dream", "secrets", "told" / "serpents", "rising" / "world", "dissolves" / "flames", "reveal" /
"flame", "absolves".
- Opens in the risen flames, thinning to a burning sunrise over buttes (his board #26).
- "serpent of the sunrise": smoke rises from the sun and becomes the serpent.
- "open ... eyes": close on the veil; ONE ember eye opens under the brim (Odin). Never two.
- The hook: he stands on the butte top, arms out, as the smoke serpent coils into a ring around him
  (his boards #15, #16, #21), intercut with veiled singing close-ups. "gold": the frame flares gold.
- "dissolves": the painting itself loosens, strokes lengthen and swirl (paint `flowK`, `boil` up).
- "absolves": fire washes over everything and burns it down to black ash for the handoff.

## c5 CRACKS (78.667 - 97.583, bridge + ending, ink with glowing cracks)

Cue words: "wake" x2, "burn", "down" / "flaming", "dream", "seen" / "night", "whispering", "low",
"deep" / "heat", "rising", "cracks", "beneath".
- From black, dusk on a cracked clay plain, ash drifting. The etch look returns but warmer.
- "wake": SINGING close-up, the ember eye snaps open on each "wake".
- "burn ... down": a line of fire races across the plain behind him.
- "night ... whispering": everything hushes toward night: darker, slower, the wolfdog sits by him.
- "heat ... rising ... cracks beneath": the cracks glow open under his boots and heat and embers rise
  around him in a column. Final wide: him and the dog on the glowing cracks under the stars.
- Hard stop on the last frame (the mix ends at full level; no fade).
