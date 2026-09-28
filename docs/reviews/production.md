# Production review, waves 2 to 4 (reviewed by me, not Robin, per his "don't wait for my review")

Evidence sheets are local in `work/gen/` (review2a.jpg, stills_review.jpg, vids_review.jpg,
vids_review2.jpg, *_face.jpg) and `work/checks*.jpg`.

| job | verdict | notes |
|---|---|---|
| LS2 (H3, day-take 10.0 s, low 3/4) | accept | veil holds in every frame, no face; the head moves with the phrases; graded to neon locally |
| LS3 (H3, day-take 72.5 s, close) | accept | veil holds; a small skin patch at the right edge near the ear in a few frames, dark in the neon grade |
| A3 still + anim (Odin eye) | accept | one ember eye only, ignites behind the veil; coat, hat and necklace right |
| A4 smoke serpent (Kling from real #23) | accept after local fix | the model drew a solid glossy white snake. Local fix in `assemble.py ghost()`: the snake is keyed out and replaced by his real #23, then redrawn as translucent smoke textured by his own smoke clip #44, noise-wisped edges, faint scales, screen-blended so his figure and the flames read through. No paid retry |
| A1 moon serpent | accept | walker in the tattered duster, the wolfdog beside him, serpent eyes open at the end |
| A2 fire ring | accept | grey fire on his real skull, matches #0 |
| A5 rock wall | accept | painted figure, arms out, tattered duster, invented glyphs; firelight rises |
| A6 cracks | accept | neon look, man and wolfdog tiny on the horizon |
| A7 forced-perspective guitar | accept, first 32 frames only | normal-size guitar planted close to the lens, figure and dog mid-ground; the push drifts right later, unused |
| C1 smoke continue | accept | seamless from real #3 |
| SB2 night wolfdog | accept after local fix | Omni Edit came back as a grey render, not scratchboard; the local etch pass in `assemble.py etch()` turns it into white hatch and edge lines on black, matching SB1 |
| LS1c neon grade | accept | re-graded locally: his #22 tone table, crushed purple-black, saturation up, his own flame layer keyed out of #22 and screened on top |

Known soft spots: the H3 takes are 768p and the reused Kling takes 720p; the ember-scatter
transition dissolves in blotches; the serpent is a smoke ghost with a still-readable outline.
The optional "The Wyrd One" title card (inspiration 26) is NOT in the cut; it is an option for Robin.
