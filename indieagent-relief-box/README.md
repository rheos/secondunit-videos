# Relief box (look test)

An 11 s look test at 720p, 24 fps, asked for by Robin on 2026-10-25 (issue #327): a visual language built from
photographs of sculpted clay relief panels in shadowboxes, drawn in the language of Leon Lin's paper-fox. Recipe: `looks/relief-box.yaml`.

```bash
node tools/bundle.mjs           # after every edit in src/: writes build/film.js
open index.html                 # plays in the browser; ?t=6 starts at 6 s, ?w=1920 renders 1080p
node tools/still.mjs index.html out/check/f 0.5 6 10.8 --width 1280 --height 720
nice -n 15 node ../tools/motion-lab/render.mjs "index.html?w=1280" 0 11 out/draft/reliefbox_dN_f0-f264_24fps_draft.mp4 --width 1280 --height 720 --workers 2
```

A full render takes about 30 s on the Intel Mac. Playwright comes from a sibling look's `node_modules`
(`ln -s ../bobwiseman-in-her-dream/node_modules`).

## Built on paper-fox, directly

`vendor/paper-fox/core/` is paper-fox's `src/core` copied unchanged from commit 6a150fd (MIT, Copyright (c) 2026
Leonxlnx, `vendor/paper-fox/LICENSE`). The scene in `src/` is written the way paper-fox's own scenes are: a
`Scene` with planes at depths, sprites painted once and baked into paper (texture, lit and unlit cut edge, a
blurred silhouette for the drop shadow), `drawSprites` for anything that moves, and paper-fox's film finish.
Nothing of paper-fox's fox, scenes or audio is used. Our renderers open pages from `file://`, where ES modules
don't load, so `tools/bundle.mjs` joins the modules into one classic script.

## What is on screen (draft 2)

Draft 1 rebuilt one reference photo too closely (a split doll with an ornament spine, plumes, a thought bubble).
Robin, 2026-10-25: we are making a language, not copying a work, so draft 2 leaves the figure out and uses the
reference set's vocabulary in a scene of our own, with paper-fox's density: many pieces on many planes.

| z | Plane |
|---|---|
| 1500 | back wall: warm card, embossed honeycomb (`box.js`) |
| 1480 | the sun, a wheel of lit windows with stepped rays, and its glow (`props.js`) |
| 1460, 1400 | two ranges of stepped pastel hills with torn white edges and cone trees (`density.js`) |
| 1430 | dotted discs standing off the wall |
| 1290, 1180 | a terracotta city and a pink mountain town on floating islands with stepped roots |
| 1240 | coral: grey curl clusters, wheat fronds, lime beads |
| 1150 | two stepped-trunk trees whose rosettes bloom |
| 1100 | butter piping from a porthole in the left wall to one in the right, and the bead train |
| 900 | a garland hanging from the top of the box: bead strings, stepped pendants, dotted balls |
| 830, 790 | two rows of small things along the floor |
| 720 | the moulded frame |
| 560 | the lens plane, in front of the frame: rosettes, plume tips and a dotted ball in the lower corners |

| Time | Beat |
|---|---|
| 0-6 s | the sun rises over the hills and turns; a cool half-dark lifts to warm light |
| 2.4-9.4 s | seven beads roll out of the left porthole, along the piping, into the right one |
| 4-7.4 s | the trees bloom, nearest the sun first |
| all through | islands drift and bob, the garland swings, the camera trucks right and pushes in |
| 9.4-11 s | hold |

## How a flat cut-out reads as clay (draft 3)

Robin asked for rounder forms, softer light and a finer surface. `src/kit.js` now shades every shape as a lump:

- `clayForm()`: the outline is filled, then, inside it, the outline pushed toward the light leaves the far side
  uncovered; that sliver, heavily blurred and darker, is the soft falloff into shadow. A smaller one tucked under
  the far edge is the core shadow; the outline pushed away from the light gives a pale lit shoulder; a faint radial
  sheen sits high on the lit side. The shading scales with `size`, the piece's thickness.
- Under each piece, two shadows: a tight contact shadow and a wide soft one.
- A clay surface made once (fine grain, fingerprint whorls, tiny pits) is soft-lit into every piece; paper-fox's
  fibre stays underneath at a low amount (`CLAY_MAT`), and the baked cut edge is soft (`CLAY_EDGE`).
- `tube()` rolls coils, stalks and the piping with the same shading; `chaikin()` rounds the piping's corners.
- The hills are rows of rounded mounds instead of torn paper strata.

Draft 2 built form the paper way, with tiers cut inside each shape (commit 7cbb8a4).

## This Goes Into This, the living loop (`loop.html`, issue #329)

Title chosen 2026-10-25 (Robin's own phrase, from his notes on the machine-elf space: the funnel feeds itself, the
singers put what they sing into the portal, the whole system feeds back). "The living loop" stays as the working
name in files and code (`loop.html`, `reliefloop_*`).

Robin, 2026-10-25, after approving the look: smaller figures instead of a big one, a living sculpture in the
middle shaped like the recycle symbol (a funnel feeding back into itself, part of a system that feeds back into
itself), and an open world instead of a framed diorama, with decorations floating in mid-air rather than hanging.

```bash
node tools/bundle.mjs src/loop.js build/loop.js
nice -n 15 node ../tools/motion-lab/render.mjs "loop.html?w=1280" 0 12.0417 out/draft/reliefloop_dN_seamcheck.mp4 --width 1280 --height 720 --workers 2
```

A seamless 12 s loop: every motion is periodic in 12 s or a divisor of it (`cyc()` in `src/loop-world.js`), and
the page wraps t, so frame 288 is frame 0. Render 289 frames and compare the first and last to check the seam.

Draft 2 (Robin's notes on draft 1): the recycle shape is one funnel that feeds itself, and the figures' work is
mysterious, not fetching and carrying. The honeycomb backdrop comes back; only the frame and box stay out.

- `src/loop-world.js`: the honeycomb backdrop, the sun, clay clouds, three rows of hills into the haze, the
  terrace, a floating city, and fourteen decorations floating at depths from 1300 to 3200.
- `src/loop-machine.js`: the funnel (it gathers at the top; a duct leaves the bottom, turns right, climbs past the
  lip, turns left and drops back in; eight beads swirl down the mouth, swell along the duct, light two windows in
  the riser and drop from the spout), the console (knobs, lever, lights, a screen with a turning octahedron, a
  cable to the duct) and the ring instrument (three rings on different axes, a hovering solid, a cube let go once a
  loop).
- `src/loop-shapes.js`: faceted clay solids drawn each frame (tetrahedron, octahedron, cube, icosahedron, a star
  of two tetrahedra, a ring), lit per face, with a making-glow.
- `src/loop-figures.js`: small clay figures, body and head baked, each limb one rolled tube bending through its
  joint, knees and elbows by two-bone IK, hands held to the arm's reach.
- `src/loop.js`: the operator behind the console (knobs, lever, hands over the screen, every 3 s), the tuner at
  the instrument (slider, a reach toward the rings), and two practitioners of the same 6 s mudra, three seconds
  apart (palms at the chest, lifted overhead, parted into a frame while a solid forms between them, released, arms
  open, head following it up); one stands on the terrace, one sits on the floating island.

Draft 3 (Robin's notes on draft 2): a more geometric, purposeful world, toward a four-dimensional space. The funnel
is an octagonal frustum of flat lit facets with a collar and a throat band; the pipe is thicker, runs straight and
turns square corners with small round fillets (`squarePath`), with banded joints; no dark windows. Small faceted
solids circulate instead of dotted beads. The dotted discs and balls are gone; floating geometry is pendants,
chevrons, turning polyhedra and small tesseracts, and a large tesseract (`drawTesseract` in `src/loop-shapes.js`:
sixteen corners turned in the XW and YZ planes, seen in perspective out of w) turns once a loop in the sky.

Draft 4 (Robin's notes on draft 3): no raised ridges on the pipe; it carries smooth rings of alternating colour
(mint, butter, pink; the whole pipe shaded once per colour and clipped to that colour's rings). The casters work
like spell-casters: the leading hand traces a precise sigil of light in the air (a circle, a ring of twelve ticks,
then the solid's figure: triangle, pentagram, hexagram or diamond with an inner circle) while the other hand turns
small steady circles at the chest; both hands push in, the sigil spins down to its centre, the solid forms there
and is released (`castPose`, `drawSigil`, `castSolids` in `src/loop.js`).

Draft 5 (Robin, on draft 4): no balls seen in the pipe; the pipe itself swells in a bulge that travels along it.
`drawBulge` in `src/loop-machine.js` redraws a stretch of the pipe each frame with a gaussian swell in its width,
in the same colour rings and at the pipe's own shading scale, clipped to the swollen middle so its ends never show.

Draft 6 (Robin's choices after the research in `RESEARCH-machine-elves.md`; the loop is his memory of the DMT
machine-elf space): the world closes into a turning honeycomb dome (`src/loop-dome.js`) with the window-wheel sun as
its lantern; clouds, far hills and open sky are gone. The two singers sing their shapes: glyphs stream from the
mouth into a sigil drawn in the air while the hands conduct; the sigil folds into a solid; they turn to face us and
hold it out, a burst flaring behind, before letting it go. The operator and the tuner turn and beckon every 6 s. A
chorus at the funnel's foot (two in harlequin diamonds and bell caps) hops and cheers each offering; now and then a
head pops into a faceted ball. Mark Von Ulrich's world lives in what the elves make: glyphs, sigils, the offered
solids, the funnel's inside and the console screen are drawn in `src/loop-mark.js` (6x6x6 colour cube, 4x4 ordered
dither anchored to each element, one-pixel black contours), after his STYLE-BRIEF.

Draft 8 (Robin, on draft 7b: too much open space on the right; the space has a sense of symmetry and a strange
order, a living machine): the picture is built about the centre line at x = 960. The funnel sits on the axis and
feeds itself from both sides through two mirrored pipes (the stem splits under the throat); material alternates
between them. Everything off the axis is made for the left half and drawn again reflected (`mirrored()` in
`src/loop-machine.js`, `pair()` / `addPair()` / `mirror()` in `src/loop-world.js`): twin consoles, ring
instruments, singers, floating islands with singers, chorus halves, hills, floaters and a pair of large
tesseracts, all moving in mirror unison. The chorus wave runs outward from the middle. The camera no longer drifts
sideways; it breathes in and out on the axis.

Draft 9 to 9d (Robin's notes on draft 8): the space is "solid material with a crisp projected construct", so the
loop switches the kit to its crisp finish (`setFinish('crisp')` in `src/kit.js`: defined planes and a clean
terminator, a sharp highlight on each lit edge, tight shadows, a finer surface; the approved relief-box film keeps
the soft clay). Haze is cut (little bloom, grain or vignette), the dome's cells are exact raised hexagons. Nothing
floats still: pendants work as accordions, chevron stacks fan open and fold, solids squash, flatten and spring
back. The chorus does scissor arms: crossed in front of the chest, each hand on its own side, one rising as the
other falls, rolling along the row. The lantern is a spinning mechanism of parts: rays reaching and retracting in a
wave, window rings turning against each other and breathing.

## Sound (draft 9d, s1)

Synthesized in code, after Robin: "ambient glitchy and ethereal noises with a strange kind of harmony in what sounds
like the bellows of an accordion or harmonium".

```bash
node tools/bundle.mjs src/loop.js build/loop.js && node tools/cues.mjs         # the page's events -> out/loop-cues.json
~/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python -I tools/sound.py   # -> out/audio/reliefloop_loop.wav
```

- `window.FILM.cues()` in `src/loop.js` lists every event from the same schedules the picture uses (sung glyphs,
  sigil circles closing, folds, solids forming, offerings, releases, drops into the funnel, pipe bulges, chorus
  scissor crossings, heads popping, levers, released cubes); mirrored twins give a cue on each side.
- `tools/sound.py`: a reed organ (two beating reeds a note, voiced toward a nasal reed formant) breathing like
  bellows in two long breaths per loop (s2, Robin: longer breaths), the chords changing legato every 3 s inside them;
  air hisses through at each change; glitch stutters cut from the organ and bit-crushed; each event its own
  synthesized sound, one frame after its picture event, panned to where it happens; a long circular hall with a
  ping-pong delay (s5, s6).
- Shepard chords (s7, Robin: "each chord a minor third lower, falling forever"): the same major-seventh-sharp-eleven
  voicing on D, B, Ab, F, each a minor third below the last, so four chords fall one octave and the loop lands back on
  D. Every note is a stack of octaves from 38 Hz to 4.2 kHz under one fixed bell of loudness centred near 330 Hz:
  as the chords fall, the low octaves fade out and new high ones fade in, so the ear hears a fall that never arrives.
  The event notes come from the current chord, folded into a fixed register, so they fall with it. Set aside
  (Robin: "they were better before"); s8 is back on the s6 chords, and s7 stays in git (30961b2) for reference.
- Draft 10 / s8: the chorus is eight elves on three tiers (1, 3, 4) trading places every 1.5 s along a closed
  path, so a new elf takes the front on each chord change and half chord; each swap is a cue (the arriving elf's
  chord note, and the root plucked on a chord change).
- s9 (kept): the breath plays backwards and every other sound forwards. The bed is reflected on the loop's circle,
  so the chords change on the same beats in reverse order (Ab, C, Bb, D) and the events follow them. It is the
  default now; `--forward-breath` gives s8.
- Seamless by construction: every oscillator runs whole cycles in 12 s, noise filtering and reverb are circular,
  every sound that runs past the end wraps to the start.

## Drafts 11 to 37 (2026-10-25, all Robin's notes on the day)

The loop is now 24 s (`FILM_LOOP` in `src/loop-world.js`: three 8 s breaths of the bellows, while the picture's 12 s
cycle comes round twice). The render chain the drafts use:

```bash
node tools/bundle.mjs src/loop.js build/loop.js
nice -n 15 node ../tools/motion-lab/render.mjs "loop.html?w=1280" 0 24.0417 out/draft/reliefloop_dN_seamcheck.mp4 --width 1280 --height 720 --workers 2
# seam: frame 0 against frame 576 (PSNR), then cut 576 frames, mux the sound, double it for review
ffmpeg -i out/draft/reliefloop_dN_seamcheck.mp4 -frames:v 576 -c:v libx264 -crf 18 -pix_fmt yuv420p out/draft/reliefloop_dN_f0-f576_24fps_loop.mp4
ffmpeg -i out/draft/reliefloop_dN_f0-f576_24fps_loop.mp4 -i out/audio/reliefloop_loop_s26w.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/draft/reliefloop_dN_s26w_f0-f576_24fps_loop.mp4
ffmpeg -stream_loop 1 -i out/draft/reliefloop_dN_s26w_f0-f576_24fps_loop.mp4 -c copy out/draft/reliefloop_dN_s26w_x2_review.mp4
```

The sound (s26) is `node tools/cues.mjs` then `tools/sound.py` (the viralvision venv's python, `-I`), which calls
`tools/voice.py`. Every note is tied to a picture cue, so a timing change in the page cannot desync it.

**Mastering (since draft 41, Robin: "can we master the sound somehow cool?").** Kits.ai's AI Mastering, by hand in
the web app (its API has no mastering endpoint, and the free tier may not use the API; key in
`keys/kits/kits.env`). `tools/master.py --x3 sNN.wav upload.wav` makes the upload (the loop three times), Robin
masters it at app.kits.ai with a preset (Punch & Air, 2026-10-25) and downloads, then
`tools/master.py sNN.wav <download>.wav sNNw.wav --keep-width` cuts the middle pass (steady-state processing at both
ends, so the loop stays seamless), resamples to 48 kHz, and puts the original stereo width back: Punch & Air fixed
the dull top (air from -32 to -17 dB of the total) and raised the level 9 dB, but folded the image to near mono
(L/R correlation 0.23 -> 0.86) and clipped at full scale. s26w = the master's mid with the original side, 4 dB under
the master, 5 dB over s26. Robin on s26w: "pretty good, let's go with that". Draft 41 ships with s26w; the unmastered
s25 and s26 are kept in `audio-keep/` (gitignored) and `~/Downloads/living-loop-audio-keep/`.

**The picture, drafts 11 to 37.**

- 11: the 24 s loop; layered suns; a chorus phrase; pistons under the chorus.
- 12 to 17, the pipe ends: the two pipes meet in one fork with no seam on the centre line (12); the ends became
  egg-laying tips (13, Robin: "less like plumbing attachments... like something laying eggs"), then rubber hose ends
  that lay paint globs (14, "not really fleshy... a rubber hose with a bulge of water passing through"); a birthing
  membrane that pushes out with the bulge, births a bigger glob, and retracts to the lip while its hole shrinks to
  nothing; the glob drops straight down into the portal (17).
- 15, 23: the funnel turns against the portal with panels in alternating colours; its throat band is a rounded
  collar; from 23 it is a hexagon in the pipe's three colours (mint, butter, orange).
- 16: orange, in the pipe rings only (fork, bulges and hose ends follow); pink stays elsewhere.
- 18: clean equal pipe rings. 19, 21: the console is a Mark-style button panel facing us, its operator with his back
  to us, in our clay colours (Robin: "no, not in Mark's colours"), on a cabinet with varied controls, no cables.
- 20: the camera breathes in and out with the drone; tesseracts over the mountains.
- 22: the whole funnel machine drifts away toward the sun and back every 12 s (`funnelXf`).
- 23 to 27, the chevrons: fans beside each island's roots, then a radial ring round the island (Robin's pick), then a
  tighter cluster "like a mandala", moved over the control panels, floating and bobbing, swaying as mirror images.
- 25, 27, the pistons: five elves on eight pistons; a piston rises only when empty and sinks only under an elf; then
  the pistons rise on their own schedule and an elf jumps to one because it came up (Robin: "he goes to it because
  it came up"); a 32-jump closed sequence.
- 28: the big tesseracts have solid sides. 29: the pendant is a double-pointed accordion that bursts open and slams
  shut (Robin's sketch: a cone on top as on the bottom).
- 30: trees of a few kinds fold up and down along the horizon and never meet the funnel: those in its zone come up
  only while it is away and fold before it is back. Uploaded unlisted (Robin G) as "The Living Loop (draft 30)".
- 31 to 33: the frame of pipes turns about the upright axis, the other way from the funnel, half a turn per 12 s;
  the pipes are stroked rather than outlined, so bends and the fork join cleanly edge-on (31 and 32 broke them).
- 34, 35: the mandalas rise to be the stars of the firs behind the consoles, driven by the fir's own fold, so they
  reach the tip with the tree and drop with it; the small tesseracts moved off the sun to the far edges.
- 36: no Star of David anywhere (nor pentacle or pentagram): the seer's star sigil is the star tetrahedron drawn
  from near a cube face, where its outline does not read as a hexagram. Icosahedron, dodecahedron, star tetrahedron
  stay.
- 37 to 39, the drips (Robin: "there are moments when the dripping does not appear to be over the portal anymore";
  on 37 "still broke in all the same places"; on 38 "making it worse... the pipes collide... this is 100% a layer
  issue"). It was draw order: the hose end and globs of the pipe swinging away were drawn before the funnel, so the
  mouth's swirl painted over them and half the drips showed only where they stuck up above the far edge. Draft 39
  draws both hose ends and their globs after the mouth (the swinging-away pipe's still behind the pipe swinging
  toward us). Drafts 37 and 38 had moved the spouts about instead (lower, then in to the centre, where the elbows
  collided); they are back at 56 px either side, with the lip 10 px lower so the closed hose end meets the mouth's
  edge, and a glob lands just below the centre line. See the note at `SURF` in `src/loop-machine.js`.
- 40 (Robin, on 39: "fixed it up a bit but it looks janky still... this may be headed to blender", with the edge-on
  moment where a glob sat glued to the front pipe): the front hose was still drawn after the front pipe; both hoses
  now come after the mouth and before the front pipe, so they duck behind its upright for the half second it passes
  in front of them. And the frame now turns in depth (`project`, `DEPTH` in `src/loop-machine.js`): every point of
  the frame is projected at its depth, nearer points lower by the mouth's own tilt and a little bigger, each stroke
  piece's width scaled by its depth, the hoses hanging and the globs landing at their own depth. Until 39 the turn
  only squeezed x, so at edge-on a pipe slid over the funnel like a paper cutout.
- Audit of 40 (`AUDIT-d40.md`: mechanical checks, three cold critics, every finding verified at 1:1) and draft 41,
  which takes its eight confirmed defects and leaves the direction calls (glassy tesseracts, the visible 12 s repeat
  and flat light, the pale palette, the back-wall camera breath) for Robin: a new chorus sequence that never puts an
  elf on the middle-centre piston while the front one is taken (they share an x, so two there read as a stack); the
  frame's far side rises by 0.4 of the shear so its top clears the sun at edge-on; the far hose end hides while the
  near one covers it; bulges are 4 px variable-width pieces that round an elbow without a dent; orange only in the
  pipe and funnel (lollipops, mound cones, console knobs and button went pink); no glow on the released cube; mint
  curls and rosettes in the near corners; end-on elbow ellipses at the near corners near edge-on. Sound s26 from the
  new cue list.
- 42 (Robin, on 41: "at 0:04 where the christmas tree comes up it comes up a bit early to be in good sync with the
  sound... timed to a sound" without adding sound; "sync more things up, like the movement in the sun, the way the
  rings expand and collapse"): the fir behind the console rises on the seer pair's bells (the sigil-closing 'chime'
  at 4.19 and 10.27 s, computed in loop.js by `bellTime` and passed to the world with `setFirRise`; it starts 0.3 s
  before each bell, so it is full a frame ahead). **The sound is frozen at s26w** (Robin: "i specifically said not to
  touch the audio.. to move the action instead"): the cue list stays exactly what s26 was mixed from (proved by
  regenerating the mix and comparing sample for sample), so the fir's own soft flap still sounds at 4.5 s, 0.6 s
  after the fir now pops; if that ever reads loose, put another action on it, never move the mix. In this project a
  cue IS a sound, so a picture retime that moves a cue is an audio change. The suns on the
  sound's grid (`beatPulse` in `src/loop-world.js`): the back suns' rings expand on each chord change (3 s bar
  lines) in a wave running outward ring by ring and collapse slowly; the lantern's rings breathe with the bellows,
  fullest 2 s and 6 s into each 8 s breath, outer ring first; the rays flare on the chord change; the lantern's scale
  pulse peaks on the 0.75 s machine rhythm. `references/README.md` begins (Robin's first reference painting for the
  project).

**The sound, s10 to s25.** s10 the 24 s loop; s11 to s14 the Sohan "doiy" and "dee" voice (`tools/voice.py`,
measured on the icaro recording), one syllable per picture event, with long doorstop-spring tails and its own
ping-pong echo, first replacing the bells, then laid over them; s15 the pistons heard (a thunk, a puff of air, a
chord tone); s16 less bell, more Sohan; s17 more drone, less busy; s18 the machine rhythm (Robin's name: glyph
blips, arm ticks, pistons, key presses, glitches) on its own bus, halfway back up; s19 and s20 the doiy runs as
objects are sung, the camera breathing with the drone; s21 to s25 event and mix adjustments to the drafts above.
