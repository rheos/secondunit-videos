# Candy machine (look test)

A 9:16 animated short on a spoken memo. Bean-head cards carry the talking and Colorfigures objects carry what he describes.
The door between them is a see-through head: the page's See-through switch turns his head to a ghost with the workbench
inside, and one camera zooms through it. Issue #430. Internal test.

Test 01 is the last 51 seconds of a 2:18 clip, voice not yet replaced.

## What's in it

- `js/core.js`: Colorfigures engine by April Zhu (MIT, `js/LICENSE-colorfigures.txt`), unchanged.
- `js/machine.js`: the dial machine with its real mechanism, the stub of two-by-four and the bench props.
- `js/film.js`: the figure's `seek(s)`, 720x1280. Machines stack into a tower because a tall frame wants height.
- `js/toon.js`: card drawing from github.com/mromidev/claude-animated-shorts (MIT, `js/LICENSE-toon.txt`), wrapped in one
  scope because both engines use the same global names, with four talking faces added.
- `js/cards.js`: the room, the cards, the phone, and the door (clip-path on the svg, same zoom on every layer).

## Running it

`work/` stays out of git: `work/cues.js` (clip range and the one word quoted on screen), `work/env.js` (voice level at 12 fps,
drives the mouths), `work/section.wav`.

    PW_FROM=<a checkout with playwright>/package.json node render.mjs --stills 89.6,104,128
    PW_FROM=<a checkout with playwright>/package.json node render.mjs out/candy_test01_87p5-138p3_9x16_draft.mp4

The render takes about 4 minutes for 1,219 frames.

## Lessons

- A wide bench can't fill 9:16. Move in until the object fills the frame, let the bench run off the sides, and build gags upward.
- Two script engines on one page: wrap the second in a scope first. Both define `INK`, `mix` and `rnd`.
- `file://` blocks ES module imports, so a page shot from disk needs classic scripts.
- `parallel` projection means a clone of a drawn object is a plain screen translate, which is cheap and always correct.
