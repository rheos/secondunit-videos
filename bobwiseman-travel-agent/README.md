# Bob Wiseman: Travel Agent

Code-drawn music video, 0 credits. Started 2026-10-12 at Robin's request.

- Song: "Travel Agent", from *In Her Dream: Bob Wiseman Sings Wrench Tuttle* (2024, Indie Pool; YouTube sViz56fxSmY).
- Clock: `source/travel-agent-2024.wav`, 48 kHz stereo, 403.4 s, sha256 `f270050ba780d5543fc0754e5e3337e799d82b2307f02d8d6e2c63272daae337`. 24 fps grid, 9682 song frames. Taken from the YouTube audio stream; ask Bob for the WAV.
- Timing: Whisper medium (`source/words-whisper-medium.json`) and librosa beats (`source/beats.json`), exported without lyric text to `js/data.js`. Bob's lyric sheet is still needed: no lyrics are printed on screen until it arrives, only diagram labels.
- Audio, lyrics and `STORYBOARD.md` (it quotes them) stay out of git.

## Look

An educational field-guide short in two modes, cut hard every 1.2 to 2.5 s on the beat:

- **Illustrated**: cream paper with grain, irregular doubled ink, shading by directional hatching only, flat muted warm palette, wide diagonal stripe grounds, construction lines running past the forms, thin coloured motion-graphic arcs.
- **Schematic**: navy blueprint, pale lavender/cyan linework, hex lattices, stipple fills, glowing nuclei with radial ticks, brackets and ticks everywhere, magenta saved for change.

Drawn on twos (each drawing held 2 frames, lines boil between drawings), grain changes every frame. Every mark is canvas code: no images, fonts or libraries.

Concept: the life of a getaway. A deadpan traveller (fedora, teal coat, suitcase, a blues cloud that follows him; a generic figure, not Bob's likeness) asks a travel agent for the farthest place from his blues. Every route in the diagrams loops back to her desk, and the film ends where it began, at the shopfront, now in snow.

## Files

- `js/kit.js` drawing primitives for both modes, grain, dressing layers
- `js/props.js` cast and props (traveller, agent, desk, globe, plane, cloud, sun, palm, ticket, suitcase)
- `js/shots.js` ~30 set-ups (illustrated + schematic) and the section/cut list (`SECS`, `buildShots`)
- `js/main.js` frame driver: `window.__frameJPEG(t)`, held drawings on twos, preview player
- `looks/film.html` the page; open it in a browser to play with the song (click), arrows scrub, `?t=SECONDS`

## Running

`PAGE=looks/film.html node check.mjs out/sheet.jpg t1 t2 ...` for a contact sheet.
`PAGE=looks/film.html node render.mjs 0 403.4 out/<name>.mp4 4 24 0.6667` for the 720p draft (always on the song grid).
