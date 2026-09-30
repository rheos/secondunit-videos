# Storyboard: "dream of fire", painted (hjeron_dark_blues)

Hjeron's solo song, in the persona of **The Wyrd One** (his character sheet and corrections are the
canon; see the character rules in `ANIMATION_GUIDE.md`). NOT MythMaker: no MythMaker branding, no
wordmark, no name, no text on screen at all. 283.833 s = 6812 song frames at 24 fps (the full-length mix, 2026-09-30; its first 97.567 s are sample-identical to the short mix the first five chapters were cut to). Every frame is
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
- **Handoff to c6 (full-length mix):** no hard stop any more. The ember column keeps rising past the top of frame; c6 opens as those embers scatter into a night sky full of stars.

## Second half (the full-length mix, 97.583 - 283.833)

Structure from the mix itself: instrumental 97.6-116.4; verse 3 116.4-153.3; instrumental break
153.3-166.0; verse 4 166.0-186.2; second chorus 186.2-213.2; the calling 213.2-264.3; instrumental
tail 264.3 to the end (the mix falls silent about 280.5). Energy stays high to ~164, dips to its
quietest valley 168-220 (lowest ~220), rebuilds to a peak 244-270.

| ch | file | song time | location | look |
|---|---|---|---|---|
| c6 PLAINS OF STARS | `js/ch/c6.js` | 97.583 - 116.400 | open plains under a sky of stars (the dream begins) | `dream` (new: indigo night oil) |
| c7 THE SERPENT CALLS | `js/ch/c7.js` | 116.400 - 153.400 | a lone campfire on the plains | `dream` -> `sunset` sky at the end |
| c8 STORM AT DAWN | `js/ch/c8.js` | 153.400 - 186.200 | bare hills in a lightning storm at dawn | `storm` (new: silver-grey mono, his footage's storm look) |
| c9 ALL A FLAME | `js/ch/c9.js` | 186.200 - 213.200 | a mesa rim above a burning valley | `sunset` |
| c10 THE CALLING | `js/ch/c10.js` | 213.200 - 283.833 | a stone medicine-wheel ring with torches, night into dawn | `ink` -> `cracks` warmth, fading to black |

Handoffs: c5's rising embers become c6's stars; c6's stars gather into a fire on the ground for c7;
c7's burning sky breaks into c8's storm clouds; c8's sunrise flares into c9's blaze; c9's flames
sink to the torches of c10's ring.

**Eye windows, proposed** (added to `EYE_WINDOWS` only if Robin approves): "eyes like gold"
(166.1-169.8) and the next "wake up" (216.6-220.0). Everything else stays eye-free.

### c6 PLAINS OF STARS (97.583 - 116.400, instrumental)
- c5's ember column scatters upward and the embers settle into stars.
- He walks on across the open plains with the wolfdog, small, silhouetted against the Milky Way.
- The paint drifts: the whole sky slowly wheels. Beats land as shooting stars and dust from his boots.
- End: the stars in the foreground drift down and gather into a small fire on the ground (c7).

### c7 THE SERPENT CALLS (116.400 - 153.400, verse 3)
Cue words: "shadows", "danced", "air", "still" / "fire", "called", "will" / "echoes", "tongues" /
"smoke", "singing" / "dream", "planes" / "blazing" / "serpent", "called", "name" / "said" /
"smoke", "rivers" / "sky", "flame" / "old", "speaking" / "calling", "name".
- The campfire throws his shadow huge and doubled across the ground; the shadows dance while he
  stands still (only HIS shadows: no other figures). On "air stood still" everything freezes except
  the fire.
- "echoes ... tongues unknown": ripples of light travel out from the fire across the plain.
- "smoke was singing": the smoke rises in ribbons that move with the vocal (`F('voc')`).
- "blazing high": the fire leaps; the smoke serpent rises out of it and turns its head to him on
  "called my name". Singing close-up (veiled, 3/4) on the serpent's call.
- "smoke will be like rivers": smoke pours across the plain in rivers. "the sky will be a flame":
  the sky ignites from the horizon up.
- "the old ones are speaking": in the burning sky, giant rock-art glyphs (antlered stick figures,
  spirals, handprints, like his canyon wall) glow like constellations. Glyphs only: no faces, no people.

### c8 STORM AT DAWN (153.400 - 186.200, break + verse 4)
Cue words: "hands", "embers", "eyes", "gold" / "rattle", "hums", "desert" / "lightning", "hills",
"dawn" / "fire", "belong" / "footsteps", "vanished", "unspun" / "dreams", "begun".
- The break (153.4-166): storm clouds roll over bare hills; lightning flickers on the drum hits; he
  stands on a ridge, duster whipping.
- "hands like embers": close on his gloved hands, glowing from inside like embers.
  "eyes like gold": the one eye opens gold (proposed eye window).
- "a rattle hums": a rattlesnake coiled on a rock shakes its rattle into the wind.
- "lightning struck the hills at dawn": a strike hits the far hill and the frame flashes.
- "the fire knew where i belong": the strike's fire runs toward him along the ground and stops at his boots.
- "footsteps vanished": his footprints in the sand blow away behind him.
- "dreams won't die, it's just begun": the sun breaks through the storm.

### c9 ALL A FLAME (186.200 - 213.200, second chorus)
Cue words: "dream", "flame" / "blazing", "name" / "smoke", "rivers", "sky", "fire" / "old", "rise" /
"calling" (x4), "flame", "same", "changes", "seeing", "name".
- A mesa rim above a valley that burns end to end; the second chorus answers the first (c4) with a
  bigger world: he plays on the rim, the valley fire behind him.
- "smoke like rivers and the sky on fire": smoke rivers run down the valley, the sky burns.
- "the old ones rise": the rock-art glyphs from c7 rise from the smoke, towering, glowing. Glyphs only.
- The four "calling" lines: each one throws a wave of light across the valley; singing close-ups
  between them. "changes": the paint itself swirls (flowK up).

### c10 THE CALLING (213.200 - 283.833, the calling + tail)
Cue words: "calling", "wake" / "take", "torch" / "stop", "far" / "gone", "long" / "world", "burns" /
"song" / "dream" / "changing", "seems" / "late".
- A stone medicine-wheel ring at night, torches around it (his board #20). He stands at its centre.
- "wake up": singing close-up; the eye opens (proposed eye window).
- "take up the torch": he lifts a burning torch from the ring.
- "stop this, before it's too far ... gone on too long": he holds the torch high; the camera cranes
  back to show fire along the whole horizon.
- "the world burns": the horizon flares. "just like this song": he plays, torch planted beside him.
  "just like my dream": the stars return overhead, a callback to c6.
- "changing before it seems": the ring's stones glow and the ground cracks with light (c5 callback).
- "too late": every torch goes out at once; only the embers hang in the dark.
- Tail (264.3 to the end): in the last light he and the wolfdog walk out of the ring toward the
  first line of dawn; embers drift; fade to black as the mix falls silent (~280.5).
