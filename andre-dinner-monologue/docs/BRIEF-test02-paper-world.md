# Test 02: paper-world (flat paper figures in a real 3D paper world)

Read `LOOKS.md` (all of it, including section 4: Robin's notes on test 01) and `docs/BRIEF.md` (paths,
output contract, binding rules; they still hold, with the changes below). Then this file.

Robin's notes, Nov 11 2026, verbatim:

> the guard hat doesn't look much like a priston guard which i would expect to have a hat more like a
> police than a construction worker. also that hand the seed goes into is pretty bad.. i want this all
> to have more of a 3D world look to it.. which some of it does.. i love the 2D figures in a 3D world
> idea. develop that better.

> the table city is best out of what you have done so far.. but it doesn't have enough movment for the
> first part.

## The look, as rules

1. **One world: the dinner table.** A real 3D scene (three.js r160, already at `tests/paper-world/js/lib/`),
   true perspective camera, real cast shadows. Units are centimetres, y up, the cloth is y = 0.
2. **Everything is paper, built the way a paper model is built:** flat cards with a little thickness
   (0.08 to 0.15 cm, the cut edge paler than the face, like a white paper core), stacked discs, rolled
   tubes, folded boxes. No smooth CG forms, no specular, no gloss: roughness 1, metalness 0, a paper grain
   (crumple facets plus fibres, generated once on a canvas, seeded) on every surface as colour and bump.
   Torn edges (the cloth, the room's paper) show the white core.
3. **People are flat paper cut-outs standing in the world as cards.** Profile silhouettes, one paper
   colour each, jointed (limbs are separate flat pieces a hair apart in depth), posed on twos (sample the
   pose at even frames), never rocked as one stiff piece. They cast real shadows. A turn is the card
   turning about its vertical axis, so for two or three frames you see its edge: that is the tell of the
   look, use it. Never a 3D-modelled character. No faces.
4. **One continuous camera, no cuts.** It never stops: when it slows it drifts. No snaps, no zoom-only
   moves (a pull-back rises and tilts; it is never a scale about the frame centre). Camera on ones.
5. **The candle is the key light.** A warm point light at the flame with soft shadows that radiate from
   it across the cloth; the room is navy and only dimly filled. Lit windows are emissive paper cut-outs
   with a small soft glow. Light arc for this section: dark and intimate at the start (one flame), the
   city's windows come on as it rises, the wide at the end is a lit walled city in a dark room.
6. No text. No faces. Nothing pops in from nowhere: a thing appears by rising, unfolding, walking in or
   being uncovered by the camera.

KEEP from table-city test 01 (Robin: "best out of what you have done so far"). Open
`out/table-city/check/f2300.jpg`, `f2426.jpg`, `f2543.jpg` and `tests/table-city/NOTES.md`, and hold these:
the cream cloth with a torn edge on a navy crumpled-paper room; the warm candle pool with long soft
shadows; a table that reads from above as a real place setting; plates that become stacked masonry
towers (peach and umber tiers, dense lit windows); glasses that become green towers lit from inside; the
bottle as a navy tower with lit windows; the bread-basket dome; the cutlery fanning out and standing up
as a fence around the whole table edge; the potted conifer at the corner; the palette (#35366f #f2b38a
#6c66a5 #5f8350 #23636b #e9ae3a #7e3b2f #1f2755 plus cream). It must still look handmade and warm.
Judge every hero still side by side with the test 01 still it replaces.

FIX from test 01's own defect list: the tilt was a squash (now a real camera); the two plate towers
merged (stagger heights and use the perspective); the tree read as a Christmas pine (a redwood is a
tall straight rolled-paper trunk in red-brown with a ragged crown high up, far taller than the glasses);
the figures were 17 to 22 px (now the camera comes down to them: at least 90 px tall when they are the
subject); the fence pieces slid under the towers (they travel along the table edge and hinge up).

---

## Builder A: the world and the table section, f1800 to f2544 (75.0 to 106.0 s)

You own `tests/paper-world/` except `js/cast/` and `lineup*.html` (builder B's). Renders and stills go to
`out/paper-world/`. Review file: `out/paper-world/andre_paper-world-test02_f1800-f2544_24fps_720x1280.mp4`.

Files to make: `index.html` (canvas id `c`, `window.ready === true` when loaded, `window.renderFrame(f)`
draws film frame f as a pure function of f; `?f=<frame>` shows one frame in a browser); `js/kit.js`
(paper texture, `paper(colour)` material factory, `card(shape2D, colour, thickness)`, tube, disc stack,
folded box); `js/table.js` (the world); `js/figures.js` (the walking rig: tree man and citizens);
`js/story.js` (camera keys and every event, on frames from the cue data); `tools/render.mjs` (adapt
`tools/render-frames.reference.mjs`: headless Chrome with Metal, `PW_FROM` set to this folder's
`package.json`, W=720 H=1280, FRAMES and OUT env); `tools/onsets.py` (copy `tests/table-city/tools/onsets.py`
and its hand picks; it writes the gitignored `js/cues.js`); `tools/make.sh` (frames, mp4 with the voice,
stills, sheet, scans); `README.md`; `NOTES.md`.

The table: cloth about 90 wide by 130 deep (portrait, to suit 9:16), two place settings facing each
other along the long axis, candle near the centre, bottle, two wine glasses, salt and pepper, bread
basket, napkin, cutlery at each setting, a small potted sapling at one far corner. The room beyond the
cloth edge is dark navy paper.

Scale: the tree man and the citizens are about 4 cm tall, so a wine glass is a 5-storey tower to them.

ONE CAMERA, frames snapped from the cues (the snapped values from test 01 are in
`tests/table-city/README.md`; regenerate with onsets.py):

| Frames | Words | Camera | What happens |
|---|---|---|---|
| f1800-f1930 | "And when I was at Findhorn, I met this extraordinary English tree expert who had devoted his life to saving trees" | Starts 6 cm above the cloth, 20 cm from the flame, looking across the table through the glass stems; glides along the table toward the far corner, about 1.2 cm a frame, passing the plate rim and the cutlery in the near foreground | The flame flickers and the shadows of the stems swing. On "tree expert" the tree man walks into frame beside the potted sapling: a flat paper profile figure, slightly stooped (he is 84), a walking stick, a backpack. On "trees" (f1930) the sapling springs a tier |
| f1930-f2110 | "He just got back from Washington, lobbying to save the redwoods. He's 84 years old, and he always travels with a backpack, because he never knows where he's going to be tomorrow" | Tracks beside him at his eye height as he walks in among the tableware; foreground objects pass close to the lens for parallax; tilts up on "redwoods" and comes back down | On "redwoods" (f1998) the sapling behind him shoots up into a redwood taller than the bottle. On "84" (f2022) he stops, leans on the stick, tiny beside the bottle. On "backpack" (f2071) he hitches the pack and walks on. On "tomorrow" (f2106) he reaches the candle and the flame leans in his wake |
| f2110-f2215 | "And when I met him at Findhorn, he said to me, where are you from? And I said," | A slow quarter orbit around the candle with him, rising from 5 cm to 25 cm | He stops, and the card turns to face the nearer place setting (edge-on for two frames) on "where are you from" |
| f2215-f2300 | "New York. He said, ah, New York, yes, that's a very interesting place." | Cranes up and back to about 60 cm high, tilted down 35 degrees, so the towers rise into the tall frame | On "New York" (f2215) plates, glasses, bottle, salt, pepper and basket rise into towers with overshoot, windows coming on floor by floor. On the second "New York" (f2236) the cutlery travels out along the table edge and hinges up into the fence |
| f2300-f2466 | "Do you know a lot of New Yorkers who keep talking about the fact that they want to leave but never do? And I said, oh, yes. And he said, why do you think they don't leave?" | Descends into the main street between the plate towers to citizen height, travelling toward the fence | Citizens (flat cards, several paper colours within the palette) walk out of the towers to the fence, stop at it, and turn back (card turn) on "never do"; a second wave on "don't leave" (f2426). The nearest citizen is at least 90 px tall. The tree man stands outside the fence by the redwood, looking in |
| f2466-f2544 | "I gave him different banal theories. He said, oh, I don't think it's that way at all." | Rises and pulls back to the high wide (a real crane: the view steepens as it rises), ending on "all" (f2522), then drifts to the end | The whole table as a walled, lit city on a cream cloth in a dark room; citizens small in the streets; the redwood and the tree man outside the fence. Hold, drifting, to f2544 |

Numbers: figures on twos; walk cycle 12 frames a stride, feet planted (no sliding: stride length equals
distance travelled per cycle); risers use a spring with damping ratio 0.55 to 0.7; camera keys eased, no
linear runs, speed never under 0.05 cm a frame. Anti-aliasing: render at 2x and scale down, or MSAA.
Shadows: soft, radiating from the flame; no shadow acne on the cloth (check a 1:1 crop).

BANNED to start (add what you take out): smooth plastic 3D, glossy highlights, a still camera, a zoom
instead of a crane, a cut, figures that slide, a figure that pops in, faces, text, a Christmas-tree
redwood, wedding-cake pastel towers, the musician, lens flares, depth-of-field blur heavier than a hint.

Before the full render: (1) a hero still of the wide at f2543 and of the street at about f2400, each
beside its test 01 counterpart, checked at full size; (2) the tree man and one citizen on a line-up
still at 600 px tall; (3) `views.mjs`-style check or your own speed print of the camera path (no dead
stops, no jumps). Then render, mux the voice, and run badframes.py and flashcheck.py
(`../../../tools/cloud-render/badframes.py`, `../../../tools/motion-lab/flashcheck.py`).

---

## Builder B: the cast line-up (guard cap, hands, seed, pine)

You own `tests/paper-world/js/cast/` and `tests/paper-world/lineup.html` (plus `tools/lineup.mjs` if you
need a still tool). Stills go to `out/paper-world/lineup/`. Builder A is working in the same test folder
on the world; do not edit A's files (`index.html`, `js/kit.js`, `js/table.js`, `js/figures.js`,
`js/story.js`, `tools/render.mjs`, `tools/make.sh`) and do not depend on them: your modules take a
`paper(colour)` material factory as a parameter, and `lineup.html` supplies its own simple one (matte,
roughness 1, a seeded paper grain). No film render: your deliverable is modules plus stills.

Everything is a flat paper cut-out with a little thickness (0.08 to 0.15 cm, paler cut edge), standing
or lying in a three.js scene (r160 at `js/lib/three.module.js`), lit by one warm soft key with real
shadows on a cream ground. Export ES modules: `makeGuard(THREE, paper, opts)`, `makeHandOpen(...)`,
`makeHandPinch(...)`, `makeSeed(...)`, `makePine(...)`, each returning a `THREE.Group` plus a pure
`pose(group, params)`; and the 2D outlines on their own (`capOutline()`, `handOutline(pose)`) as arrays
of points, so the film's rig can use them.

### 1. The guard (replaces the test 01 figure; see `out/papersilhouette/check/f2761.jpg` and `f2835.jpg`)

A prison officer in profile. What was wrong: the cap was a baseball cap (round crown, long flat brim).
The cap is a **peaked cap**, as police and prison officers wear. In profile, in units of head height H
(chin to top of skull):

- band: a level strip around the head at brow height, 0.10 H tall, as deep as the head front to back
- crown: sits on the band and flares outward: its top is 1.30 times the head's depth, overhanging the
  band at the back AND the front; 0.26 H tall at the back rising to 0.38 H at the front, where it stands
  up in a peak; the top edge is a shallow dished line, not a dome
- visor: short and stiff from the band's front edge, 0.26 H long, sloping down 25 degrees, thicker at
  the root. A long or level brim is a baseball cap and is banned
- badge: one small gold shield (#f1b23a) on the front of the crown above the band: the figure's only accent
- read test: at a head 40 px tall the silhouette must still show the crown overhanging at the back;
  that overhang is what separates a peaked cap from a work cap, a baseball cap or a hard hat

Uniform, all in silhouette: squared shoulders with an epaulette bump, a jacket to the hip, a belt shown
as a thin cut gap, a key ring hanging at the hip, a short baton on the belt, straight trousers, a boot
with a heel. Proportions of an adult (7.5 heads), with calves and ankles, a waist, hands with a thumb.
Poses: standing at ease (hands behind the back, chest out: this is "pride"), walking, and the citizen
version of the same body without cap, belt or keys (the inmate), so a citizen can turn into a guard by
the card turning round.

### 2. The hands (replace `out/papersilhouette/check/f3212.jpg`, which Robin called "pretty bad")

Build both hands from a 21-joint skeleton (wrist; thumb CMC, MCP, IP, tip; four fingers MCP, PIP, DIP,
tip), then skin it: tapered capsules for the finger segments, the palm as a rounded hull through the
wrist corners and the four MCP joints with a thenar bulge at the thumb's base, small fillets (radius
0.05) for the webbing. Unit = palm length (wrist crease to the middle finger's MCP) = 1:

- palm 0.85 wide at the knuckles, 0.65 at the wrist
- finger lengths MCP to tip: index 0.82, middle 0.90, ring 0.84, little 0.66; segments 45 / 30 / 25 %
- finger widths at the root 0.19, 0.20, 0.185, 0.165, tapering to 80 % at a rounded tip
- MCP joints on an arc: index (-0.30, 1.00), middle (-0.07, 1.04), ring (0.15, 0.99), little (0.34, 0.88)
- fan when open: index -8, middle 0, ring +7, little +16 degrees from the palm axis, gaps between fingers
- thumb: root at (-0.36, 0.22), segments 0.42, 0.34, 0.28, root width 0.24, set out about 50 degrees
  from the palm axis; its tip reaches the index finger's first knuckle when closed

`makeHandOpen`: the receiving hand, palm up, a giant flat cut-out lying on the ground like a paper hand
on a table, seen from above and in front (the camera looks down at 40 to 55 degrees, wrist toward the
bottom of the 9:16 frame, fingers toward the top). It comes with a wrist, a shirt cuff in a second
paper colour and a coat sleeve running off the bottom. Two or three palm creases as fine pale cuts (the
craft detail). `pose(curl)` curls the fingers and thumb UP off the ground in real 3D (each finger strip
bends at its joints, 0 flat to 1 cupped about 35 degrees a joint): paper fingers closing round the seed.

`makeHandPinch`: the giving hand, a standing card in side profile: thumb and index tips together
holding the seed, the other three fingers curled into the palm and stepped behind one another, wrist,
cuff and sleeve running up out of frame. `pose(open)` lets the seed go.

Banned: a mitten, sausage fingers of equal length, one curved blob with a bump for a thumb, a thumb
growing from the middle of the palm, fingers with no gaps, a cartoon three-finger hand.

### 3. The seed and the pine

Seed: a pine seed has a papery wing. A gold (#f1b23a) teardrop with a paler single wing, a tiny folded
card that can spin as it falls. Pine: a pop-up, three flat green cards crossed on one axis (a
six-pointed star seen from above), each card a tiered conifer outline with a short trunk; `pose(g)` 0
to 1 grows it tier by tier from the seed, with overshoot left to the caller.

### 4. Stills to deliver (all 720x1280 unless noted, real shadows, cream ground)

- `guard-lineup.jpg`: citizen, guard at ease ("pride"), guard walking, side by side at 600 px tall
- `guard-cap-crop.jpg`: the head and cap at 600 px, beside a crop of test 01's cap from
  `out/papersilhouette/check/f2835.jpg` (before / after)
- `guard-small.jpg`: six guards on a wall at head height 40 px, proving the cap still reads
- `guard-turn.jpg`: five frames of a citizen's card turning into a guard (0, 45, 90, 135, 180 degrees)
- `hand-open.jpg`: the open hand from the film's camera, curl 0, with the seed in the palm
- `hand-open-curl.jpg`: curl 0, 0.5, 1 from the same camera
- `hand-pinch.jpg`: the pinch hand above the open hand, seed held, both in frame
- `hand-before-after.jpg`: your `hand-pinch` frame beside test 01's `f3212.jpg`
- `pine-stages.jpg`: the pine at 0.1, 0.4, 0.7, 1.0 growing from the palm
- `sheet.jpg`: all of the above tiled

Review each still at full size before you report, as a stranger would: does the cap say prison officer
at a glance, does each hand have five fingers of the right relative lengths with a thumb in the right
place, would the hand embarrass a paper-cut illustrator? Fix until yes. Report under 300 words: file
list, the exports and their parameters, what you banned after the first stills, known weaknesses.
