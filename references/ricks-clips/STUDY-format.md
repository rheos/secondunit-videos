# Ricks Clips format: study, 2026-11-06

Why: Robin watched the real videos against our candy machine test and said they are "much better than ours with colouring and effects and camera work". We take the grammar, never the channel's characters, designs or scripts.

Sources: two shorts looked at frame by frame ("The Pink Prison Cell Experiment" HxqtHI62otM, "Why Perfect Railroads Don't Work" 7xS87iActkU, at YouTube's 360x640); Dumble's "How to build a 2.5D motion studio with Opus 5.5" (x.com/Y0urDumble/status/2115164938884862375), which says outright that nobody outside the channel knows its real pipeline; trey's prompt (x.com/treyscalez/status/2118357912624005300, QUIVER).

## What is on screen

- **Flat 2D characters in fully lit 3D sets.** That contrast is the signature. The character stays simple and the set does the richness.
- **Sets are worlds, not stages.** Real depth, full of repeated detail: rail gallery, numbered doors, ballast rock, strata. Materials have wear and texture.
- **One motif colour against a base palette, by story.** Hot pink cell in a blue-grey prison. Orange canyon with violet-blue water, hot yellow rail. The colour is the idea of the film.
- **Light does the drama.** Light shafts, window-bar shadows across the floor, hanging practicals, glow and bloom on the hot object, sunset and sky changes.
- **Effects are physical and on the story.** Cracks, steam, smoke columns, a glowing rail. A character's whole head can go purple with rage, with puffs of steam.
- **The camera is close, low and wide, and it moves.** Foreground objects pass the lens, the camera swings round characters mid-line, and it goes from extreme close-up on a prop to a wide of the whole place.
- **Hero prop in real 3D** with its own close-up.
- **Captions:** 1 to 2 words at a time, bold white with dark outline, centre-low, cut on each word.
- **Script:** true surprising story, hook first, twist about 40 s, last line pays off.

## Measured against our test 04 (same method, 45x80 px)

| | Prison | Railroad | Our test 04 |
|---|---|---|---|
| Median picture change per frame | 0.016 | 0.031 | 0.004 |
| Mean saturation | 0.36 | 0.47 | 0.37 |
| Value p5 to p95 | 0.31 to 0.98 | 0.24 to 0.97 | 0.35 to 0.93 |

So their frames change 4 to 8 times more than ours, frame to frame. Overall saturation isn't the gap: ours matches the prison film. Their colour reads richer because of the motif colour, the light and the texture. My cut detector was unreliable here (29 and 3 cuts) because the camera moves so much; Dumble counts a new shot about every 2 s.

## How the faces move

Robin caught this; the first pass looked at frames a second or more apart and missed it. Faces tracked at 30 fps on two shots only, at 360x640, so read the numbers as rough. Camera zoom can't be fully removed, and the tracked area can pick up nearby shapes.

- **The head pulses.** After slow change is removed, face size moves by about 2 to 4% in width and 4 to 6% in height, strongest at about 1.2 to 2.5 times a second. Width and height move together (+0.6 and +0.9), so it reads as scaling, not squash and stretch. On one angry line the face swells about 18% and settles in about half a second.
- **It doesn't simply follow voice loudness** (correlation under +0.2 on these shots). It may be tied to stressed words or to acting; these shots can't settle that.
- **The whole head is alive.** The head tilts through a line, and its outline and shape shift from frame to frame.
- **The mouth changes shape, the eyes mostly hold.** Eyes and brows set the mood and hold; teeth bared, pursed, O. One calm character barely opens his mouth and acts with one raised brow and a tilt.
- **Light travels across the face.** A shadow wedge moves over the white head as the character or camera moves. This goes against Dumble's "shadeless" advice, at least on these shots.
- **Emotion gets a physical add-on.** Puffs of steam with trails beside the angry head, plus the purple head.

Ours has none of this: a fixed-size card, level-driven mouths on 12 fps, no head tilt while talking, no light on the face.

## How people say they build it

- **Dumble: Blender.** Sets through the Blender MCP in three passes, stopping after each: BLOCK grey shapes and every camera, LIGHT one motivated key plus warm practicals plus a Poly Haven HDRI, DRESS worn materials and props, depth of field on every camera. Characters are flat image planes with an emit or shadeless shader and a contact shadow. Hero prop gets its own 6-angle build. An acting line per shot: thought, anticipation, action, hold; no idle bounce. Timing as frame numbers so a revision can't be misread. Fix by frame range, four-field notes: where, problem, change, keep. Critic pass on a 1 fps contact sheet and a 360 px phone sheet.
- **trey: three.js in code.** MeshToon with painted canvas textures, ink pass, lens pass with 48-tap depth of field, light presets (day, golden, dusk). Camera: glides of 18 to 45 frames, ease-out for whips, every hold creeps, 3 to 5 degree roll on drama, a decaying kick on impact. Prefer one continuous move: pull back into a wide, crane over a fence, truck along a lineup, crane down into an insert, rack focus to a background gag. Nothing static for 4 frames. Our toon-cards test uses this route.

Also seen, for sets: Poly Haven (CC0), Quaternius packs, Meshy. Damir Akaza's and Bonsai's posts are general, nothing specific to this format.

## Gaps in our candy machine test

1. The room is a flat painted backdrop. It should be a lit 3D set.
2. Our figure scenes are clean and evenly lit, with no light as drama.
3. The camera is far off and smooth where theirs is close, low and wide with foreground passing.
4. No motif colour chosen for the film.
5. Effects are small. Nothing glows, cracks or fills the frame.
6. No captions, though Robin may not want them.

The see-through head door and the objects that land on his words are ours, so keep them.
