# For the agent: retro halftone cartoon segment

This folder is a Quiver look segment for a generated look: the prompts, the two stills they made, and the code that
keys and composites them, rendering 15 seconds. The look: a character in a late-1960s collage-cartoon style
(brush-and-ink outlines, flat spot colours on newsprint, Ben-Day halftone, cut-paper white borders), painted on flat
chroma green, keyed over a plate in the same style that scrolls left, with torn white lane dashes rushing past.
`segment.json` is the machine-readable version of this page.

## Run it, in this order

1. `npm install`
2. `npm run check`. Fix every MISSING line with the command it prints. It needs Node 20+, ffmpeg and a browser.
3. `npm run render` writes `out/gencartoon-segment_f00000-f00360_24fps_review-720p.mp4` (about 30 s).
4. Look at it: pull stills with `ffmpeg -ss 7 -i out/<file>.mp4 -frames:v 1 still.png` and check the key edge at
   full size before you say it worked. `npm run preview` serves a live page.

Rendering this segment costs nothing: the stills are in `assets/`.

## Stand-in: read this before you show anyone

The look's character is a lip-sync video clip (a paid model, below). This segment has no clip, so the character is
the still, bobbing, squashing and rocking on the beat in code. It does not sing. Say so when you show the result.

## Make your own piece with it

1. **Character still.** Write the subject after the style bible: `prompts/style.txt` verbatim, then one character
   alone on perfectly flat #00B140 green, side three-quarter facing screen-right, whole body inside the frame with
   margins, no floor, no shadows, no text (`prompts/01_character.txt` is the worked example). Use any image model that
   follows a long style prompt: Codex's built-in image tool on a ChatGPT plan, the OpenAI GPT Image API, Higgsfield
   (GPT Image 2.5), or similar. Save it as `assets/character-green.png`; about 1152x768 is plenty.
2. **Plate.** Same style bible, then the scene with no characters, the road across the lower third and its lower
   middle left clear (`prompts/02_plate.txt`). 16:9, wider is better since it pans. Save as `assets/plate.jpg`.
3. **Check the key.** Render and look at the edge of the character at full size. If green fringes show, the
   threshold is in `chromaKey()` in `js/composite.js`: `(k - 28) / 60`.
4. **Layout.** The numbers at the top of `js/composite.js`: `LEAD_H` (character height), `ROAD_Y` (tyre line on the
   plate), `BEAT`. The plate covers the frame at 1.18x and pans its extra width once over the piece.
5. **The singing clip (paid, optional).** `prompts/03_clip.yml` is the brief: one 10 s lip-sync clip in reference mode
   from the green still plus a vocal you own, locked camera, character alone on green. MiniMax H3 Max costs about 34
   Higgsfield credits per 10 s; other lip-sync models that take a still and audio can work. Ask your user before
   spending. Put the frames in `assets/clip/0000.png ...` and set `CLIP.frames` in `js/composite.js`; they are keyed
   the same way, and the stand-in motion switches off.

Rules that hold the look: no full-frame generated shots (the character is always keyed over the plate); no
lettering, logos or real people in any generated image; the style bible goes into every prompt unchanged.
