# Brief: redraw the kinetic-type shots of "Airplane on the Highway" for a 4:5 frame (864 x 1080)

You are one of four parallel builders. Bob Wiseman's music video "Airplane on the Highway" has a 16:9 master (signed off).
We are making a 4:5 version for the Facebook/Instagram feed. Most of it is pan-and-scan, but the kinetic-typography
sections (A at 0-72 s, K at 341.29-366.83 s) have lyric lines and HUD layouts that span the whole 16:9 width, so they
are being REDRAWN for the tall frame, in code. Same shots, same words, same timing, same look; new layout.

## Where

Project dir (a git worktree of rheos/secondunit-videos, branch airplane-4x5):
`/Users/robin/Code/novadiem/indieagent/secondunit/_wt-airplane-4x5/bobwiseman-airplane-v1/sections/kinetic`

- `kinetic.html` + `js/ch/A-preamble.js`, `js/ch/K-reprise.js`: the 16:9 master. READ ONLY. This is your reference.
- `kinetic-4x5.html`: the 4:5 page (sets `window.CANVAS = [864, 1080]`, so `W = 864, H = 1080` everywhere).
- `js/ch-4x5/A1.js`, `A2.js`, `A3.js`, `K.js`: one file per builder, each a full copy of the master chapter with only its
  group of shots registered at the bottom (`chapter(...)`). YOU EDIT ONLY YOUR FILE.
- Shared, READ ONLY: `js/core.js` (time, keyframes, `W`/`H`), `js/ui.js` (text(), measure(), fitSize(), letters(), readout(), tag(), brackets()),
  `js/plane.js` (PL.front / PL.side / PL.top, the plane character), `js/kit.js` (KIT: cvr chrome, wave, transcript, caption, garage, trace, stamp),
  `js/kit-4x5.js` (KIT45.paper: a 776 x 1000 portrait cream sheet; KIT45.logPage: the tech log restacked for it; KIT45.LOG: its geometry).
  If you need a variant of a shared helper, write a local version inside your own file.
- `js/lyrics.js` and `js/data.js` are gitignored data (the artist's lyrics and audio features). Read them if you need word
  times, but NEVER copy lyric text into your code, your comments or your report. Words on screen come from `LYR` as now.

**Tool note:** a hook blocks the Edit/Write tools on paths outside the parent session's worktree, and this project dir is
outside it. Edit your file through Bash: e.g. copy it to your own scratch dir, edit there with Edit/Write, then `cp` it back,
or apply changes with a short python script. Never touch any other file in the project.

## The rules

1. **Same film.** Keep every shot function, its start time, every word and its timing (from LYR), every hit, flash/glitch FX,
   the plane's expressions and the design labels already in the code (e.g. SYSTEMS CHECK, FASTEN SEAT BELTS, NOT A CAR).
   Only the layout changes: positions, sizes, line breaks, scale of drawings. Do not invent new content.
2. **Text fits its container, with margin.** Every word wholly inside the frame with at least 48 px clear of the left and
   right edges (keep text inside x 48..816), and inside its box / sign / stamp / screen with margin, at every frame including
   slam-in overshoot. Measure with `measure()` / `fitSize()`; never eyeball. A long line becomes two or three short lines
   (the tall frame has the room) rather than shrinking type: body text stays at least 30 px, hero words stay big.
3. **Leave the chrome alone.** `KIT.cvr(...)` already adapts to W/H (brackets, header row at y ~76, footer at y ~H-62).
   Keep content roughly inside y 110..980 and x 48..816 so it does not collide with the chrome.
4. **Characters stay whole.** Scale PL.front / PL.side / PL.top and KIT.garage (its `k`) so the plane and his face are never cut by
   the frame edge (wings and ground lines may run off). A face never sits against the edge.
5. **Paper shots** use `KIT45.paper` and `KIT45.logPage` (sheet coordinates 0..776 x 0..1000). Stamps use `KIT.stamp` in sheet
   coordinates; the stamp sizes its box to the text plus 112 px, so pick a size (or two rows) that keeps the whole box on the sheet.
6. **Same look.** Palette `C`, fonts `FAM`, the look shader, grain, flashes: unchanged.
7. **Verify, then verify again.** Contact sheet (portrait tiles, 6 columns):
   `nice -n 15 node check.mjs kinetic-4x5 out/chk_<you>.jpg <t1> <t2> ...`
   Full-res stills: `nice -n 15 node check.mjs kinetic-4x5 --full out/full_<you> <t1> <t2> ...`
   Look at them with the Read tool. Check every shot at its start, middle and end, and at each word hit and slam (use the
   word times in LYR). Also compare with the 16:9 reference at the same times (`node check.mjs kinetic ...`) so nothing is lost.
   Confirm: every word inside with margin, nothing overlapping, the plane whole, no console errors. Iterate until clean.
8. **Shared machine.** Other sessions render on this Mac. Run node with `nice -n 15`, one check at a time, no full video renders.
9. **No git.** Don't commit, don't touch other files. When done, report: what you changed per shot, any compromise you made
   and why, and the list of check times you looked at. Keep the report free of lyric text.

## Your group

(see the task message)
