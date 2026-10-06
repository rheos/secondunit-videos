# Recomposing Me and Jimi 0:00-0:59.5 for 9:16 (the real way)

Robin wants Bob to see the difference between converting a 16:9 video to 9:16 by cropping / pan-and-scan and
by actually designing for the tall frame. The pan-and-scan version exists (vertical.mjs, out/maj_vertical-v1_*.mp4).
This is the other one: **the same story, the same beats on the same song times, the same characters and props,
redrawn so every shot is composed for a 1080 x 1920 canvas.**

Read first: `docs/WOODCUT_BUILD.md` (the house rules for this woodcut: three values only, red = Ellen's hair and
Bob's named red things, carved marks, limited animation, text fits its box), `STORYBOARD.md` verse 1 and
instrumental 1, the kit (`js/wood.js`, `js/wkit.js`), and the 16:9 source of your section.

## Setup
- Page: `wood-p.html` sets `window.PORTRAIT = 1`, so `W = 1080`, `H = 1920` everywhere (core, the print shader).
- Your file is a copy of the 16:9 chapter, already registered for the portrait page: `js/pch/p1-verse1.js`
  (0.0-35.0, copied from js/wch/w1-verse1.js) or `js/pch/p2-instr1.js` (35.0-59.5, from js/wch/w2-instr1.js;
  only its first four shots, drop / ellenIn / pour / snip, fall inside 59.5; the chapter now ends at 59.5).
  Right now they are the 16:9 layouts dumped on a tall page. Rework every shot in your range.
- Contact sheet: `PORTRAIT=1 nice -n 10 node check.mjs wood-p out/<you>-sheetK.jpg t1 t2 ...` (360x640 tiles),
  full stills: `node check.mjs wood-p --full out/<you>-stills t1 t2`. LOOK at them with the Read tool.

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

## Limits
- Edit ONLY your own file in js/pch/. Write helpers inside it. Do not touch the kit, core, look, the 16:9
  chapters, the pages or anyone else's file. No commits, no video renders.
- `node --check` your file, run the contact sheets, fix and re-check until every shot reads as its beat on a
  phone. Report console ERRORS lines if any.
- Final report: per shot, what you changed for the tall frame (one line each), the times you checked, and the
  path of a final contact sheet covering every shot.
