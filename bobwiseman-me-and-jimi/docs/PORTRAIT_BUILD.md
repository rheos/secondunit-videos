# Recomposing Me and Jimi 0:00-0:59.5 for 9:16 (the real way)

Robin wants Bob to see the difference between converting a 16:9 video to 9:16 by cropping / pan-and-scan and
by actually designing for the tall frame. The pan-and-scan version exists (vertical.mjs, out/maj_vertical-v1_*.mp4).
This is the other one: **the same story, the same beats on the same song times, the same characters and props,
redrawn so every shot is composed for a 1080 x 1920 canvas.**

Read first: `docs/WOODCUT_BUILD.md` (the house rules for this woodcut: three values only, red = Ellen's hair and
Bob's named red things, carved marks, limited animation, text fits its box), `STORYBOARD.md` verse 1 and
instrumental 1, the kit (`js/wood.js`, `js/wkit.js`), and the 16:9 source of your section.

## Setup
- Page: `wood-9x16.html` sets `window.PORTRAIT = 1`, so `W = 1080`, `H = 1920` everywhere (core, the print shader).
- Your file is a copy of the 16:9 chapter, already registered for the portrait page: `js/wch-9x16/p1-verse1.js`
  (0.0-35.0) and `js/wch-9x16/p2-instr1.js` (35.0-59.5) are DONE and approved; don't touch them. The rest of the song is
  split into its own files, each a copy of the 16:9 chapter cut down to its range: p2b-instr1.js 59.5-77.6, p3-verse2.js
  77.6-112, p4-instr2.js 112-152.9, p5-verse3.js 152.9-187, p6a-outro.js 187-230.4, p6b-outro.js 230.4-282.5.
  Right now they are the 16:9 layouts dumped on a tall page. Rework every shot in your range.
- Contact sheet: `PORTRAIT=1 nice -n 10 node check.mjs wood-9x16 out/<you>-sheetK.jpg t1 t2 ...` (360x640 tiles),
  full stills: `node check.mjs wood-9x16 --full out/<you>-stills t1 t2`. LOOK at them with the Read tool.

## What "designed for 9:16" means here
- Use the height. A tall frame wants things stacked: sky over ground, a tall prop, a figure over its reflection,
  a sign above the action, foreground at the bottom and the world receding upward. Never a 16:9 picture
  with empty bands above and below, and never a wide composition with its sides cut off.
- Re-stage wide actions vertically or in depth: something that crossed left to right can come toward camera,
  drop from the top, rise from the bottom, or the frame can split into a top and a bottom moment.
- Keep the subject big. On a phone a figure needs to be large; close-ups and mid shots beat tiny wides.
- Every word fits inside its sign with margin at this width (1080 minus the ~20 px paper margin each side).
  Long words (CAREER IN MUSIC, LIFETIME ACHIEVEMENT, ELLEN McILWAINE) stack onto two or three lines.
- Same timing: every cut and every hit stays on the time it has in the 16:9 version (cuts listed in the
  chapter() call; hits are commented in the code). Same characters (ellen(), kid(..., {cry: true}) three to a
  window / seat, the carved photo pieces for Jimi and Bob), same props, same red rules.
- Keep the look identical: same kit drawing functions, same print. You are re-staging, not restyling.

## Lessons from 0:00-0:59.5 (Robin, 2026-10-06, comparing pan-and-scan with the first redraw)
- The pan-and-scan cut beat the redraw on SCALE and ENERGY: faces and figures big, the camera always moving.
  The redraw beat it on reading the whole idea (complete signs, the whole action in frame). Do both:
  complete signs and whole actions, AND big subjects and a moving camera.
- Keep the main subject big: Ellen at least a third of the frame height in any shot about her; the carved
  photo people (Bob, Jimi, the stars) big enough to read as faces on a phone. Prefer two shots' worth of
  framing changes (a slow push-in, a tilt up the tall frame, a pan down) over fitting everything small.
- Never stack figures into a jumble to make them fit (the 0:24 bus stop had Jimi and Bob piled up):
  stage them in depth (one near and big, one further back) or move the camera between them.
- Every shot gets some camera motion: a slow push or drift at least (kf on a scale/translate around the
  scene), timed so cuts and hits still land.
- The shared section-level look is unchanged: same kit, same print, red only for Ellen's hair and Bob's red things.

## Limits
- Edit ONLY your own file in js/wch-9x16/. Write helpers inside it. Do not touch the kit, core, look, the 16:9
  chapters, the pages or anyone else's file. No commits, no video renders.
- `node --check` your file, run the contact sheets, fix and re-check until every shot reads as its beat on a
  phone. Report console ERRORS lines if any.
- Final report: per shot, what you changed for the tall frame (one line each), the times you checked, and the
  path of a final contact sheet covering every shot.
