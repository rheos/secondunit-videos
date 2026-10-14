# Bob Wiseman: Travel Agent

Code-drawn music video, 0 credits. Started 2026-10-12 at Robin's request.

- Song: "Travel Agent", from *In Her Dream: Bob Wiseman Sings Wrench Tuttle* (2024, Indie Pool; YouTube sViz56fxSmY).
- Clock: `source/travel-agent-2024.wav`, 48 kHz stereo, 403.4 s, sha256 `f270050ba780d5543fc0754e5e3337e799d82b2307f02d8d6e2c63272daae337`. 24 fps grid, 9682 song frames. Taken from the YouTube audio stream; ask Bob for the WAV.
- Timing: Whisper medium (`source/words-whisper-medium.json`) and librosa beats (`source/beats.json`), exported without lyric text to `js/data.js`. Bob's lyric sheet is still needed: no lyrics are printed on screen until it arrives, only diagram labels.
- Audio, lyrics and `STORYBOARD.md` (it quotes them) stay out of git.

## Status (2026-10-13)

Draft 8f continues the work in draft PR rheos/secondunit-videos#113 (issues #112 and #120).
The 73.7–90.8 s passage now follows the corrected lyric: the car is turned away at a village and on the moon,
then the traveller leaves it and continues on foot to a payphone. In the last minute, the navy ruptures grow
and merge beyond the earlier one-third ceiling, preserving focal subjects and the protected phone recursion.
The snow restores the paper before the unchanged closed-shop ending.

Draft 8e extends the nested-screen zoom from 373.48 to 382.46 s (8.98 s instead of 4.22 s),
traversing 3.5 screen levels instead of 1.5. It starts 1.6 s earlier, continues through the former
standing-stones shot, and cuts to the typing-dots blueprint at its original cue.

Draft 8f adds a 0.56 s widening lens pull-back at the end of the descent, revealing the traveller
before the hard cut on the transcribed onset of “I’ve” at 382.46 s. The lens move uses the same
nested artwork and settles at the cut; subsequent vocal cues and the soundtrack keep their timing.

Draft 8e remains the comparison baseline for this transition. Review exports and verification evidence stay local under `out/`;
no final master or new upload is implied. The current handoff and detailed direction are in `NEXT-SESSION.md`
and `MVU-DIRECTION.md` (local, gitignored).

## Look

An educational field-guide short in two modes, cut hard on the beat: **illustrated** (Kevin Ngo manner: cream paper with
grain, irregular doubled ink, hatching only, muted warm palette, wide diagonal stripe grounds, construction lines, thin
coloured motion arcs) and **schematic** (navy blueprint, pale linework, hex lattices, stipple, glowing nuclei, brackets,
magenta for change). Drawn on twos; every mark is canvas code.

Mark Von Ulrich, an illustrator Robin loves (he died about ten years ago), is guest art director from draft 6: his
thinking shapes the drawn shots (device-as-body, frontal emblem framing, nesting, scale as meaning), and his world
lives only inside device screens as early-Mac illustration (72-dpi stepped edges, the 216-colour cube with ordered
dither, 1-px outlines, indigo gradient grounds). Schematics are never pixelated; none of his pieces is reproduced.

Concept: the life of a getaway. A generic traveller (never Bob's likeness) with a rain cloud asks a travel agent for the
farthest place from his blues. The world gets more surreal act by act; the agent becomes a payphone, a hold queue, an
app, then a woman inside his phone; the blueprint burns through the paper in the last third; the snow heals it and the
film ends at the closed agency, FOR LEASE, with little Bob passing.

## Files

- `looks/film.html` the film; `looks/test-act-<x>.html` one act each; `looks/mvu.html` the look-test page
- `js/kit.js js/props.js js/shots.js js/surreal.js js/symbols.js js/story.js` shared drawing, cast, older set-ups,
  the burn-through, the colour arc, overlays and the shot builder
- `js/acts/act-a.js .. act-e.js` the five acts (cut lists + set-ups), `js/acts/act-fix.js` shared replacements
- `js/mvu/pixel.js` the screen-world engine, `js/mvu/shots-mvu.js` the signed-off Von Ulrich shots
- `js/main.js` frame driver: `window.__frameJPEG(t)`, held drawings on twos, preview player

## Running

`PAGE=looks/film.html node check.mjs out/sheet.jpg t1 t2 ...` for a contact sheet. Drafts render on GitHub with
`tools/cloud-render/cloud-render.sh --draft` (see NEXT-SESSION.md for the recipe); short tests locally with
`PAGE=looks/film.html node render.mjs t0 t1 out/<name>.mp4 4 24 0.6667`.
