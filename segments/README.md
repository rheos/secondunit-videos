# Segments

A segment is one look, lifted out of the film it was made for and set on a neutral subject: a self-contained folder
that renders 15 seconds of the look with one command. It is what a Quiver member's Claude downloads (rheos/quiver-mcp#3):
reference code to study, proof the look runs, and a baseline to hold a recipe-only build against.

## The rules

- **Self-contained and self-explaining.** Copy the folder anywhere, then `npm install && npm run check && npm run render`.
  A member's Claude or Codex should get there from `AGENTS.md` alone, with no other instructions. Nothing reaches outside it: no
  `../cleanline`, no film folder, no shared tools. Needs Node, ffmpeg and Google Chrome (Playwright's own Chromium works
  too, with software WebGL).
- **Nothing from the client film.** No artist, client or song names, no lyrics or lyric timing, no footage, stems or
  photos, no film scenes or the film's characters, no paths into a film folder. The look's drawing code comes along; the
  film does not. `node scrub.mjs` checks every segment.
- **A neutral subject and scene**, new for the segment. Our own audio or none (all three pilots are silent and run on a
  fixed 120 bpm grid where the look talks about beats).
- **Pure frames.** Every frame is a function of t alone, so frames render in any order and on any machine.
- **Paid steps stay unrun** until Robin says go. A generated look ships its prompts and the stills we own; where a paid
  clip belongs, the segment stands in for it in code and says so.

## Layout

```
segments/
  README.md        this file
  scrub.mjs        the client-material check (node scrub.mjs)
  <slug>/
    AGENTS.md      for the member's agent (Codex reads it): the commands in order, what makes the look, how to reuse it
    CLAUDE.md      `@AGENTS.md`, so Claude Code reads the same page
    segment.json   the manifest: requirements, optional and paid steps, stand-ins, commands, output, source commit
    check.mjs      npm run check: tests Node, ffmpeg, the browser and WebGL2, prints the fix for this OS
    README.md      for a person: the look, where the code came from (commit and paths), what changed, what is a stand-in
    package.json   playwright only; npm run check, npm run render, npm run preview
    segment.html   the page: draws frame t; opened without ?offline=1 it loops the 15 s
    render.mjs     writes out/<slug>-segment_f00000-f00360_24fps_review-720p.mp4 (1280x720, no audio)
    preview.mjs    serves the folder on localhost to watch it live
    js/ ...        the look's code and the segment's scene
    prompts/       generated looks: the prompts, including the unrun paid ones
    assets/        generated looks: stills we own
```

`out/` and `node_modules/` are gitignored. The zip a member downloads is the folder without them.

## The pilot (2026-11-13)

| Segment | Kind | Lifted | New | Stand-in |
|---|---|---|---|---|
| `16bit/` | film-bound code | the pixel engine `px.js` and finish `gl.js` unchanged; the palette, sprites, scenery, road, UI kit and HUD from the film's `shots.js` | the van, the gull, the lighthouse, the sea backdrop, five shots ("Coast Run") | none |
| `fieldguide/` | cleanline house look | cleanline's engine and the `fieldguide` and `blueprint` looks, code unchanged (one preview fix in `frame.js`; comments naming the source film reworded) | the gardener, the plant, two blueprint plates, the burn-through | none |
| `gencartoon/` | generated | the composite (a port of the look's p5 overlay to a plain canvas) | an ice-cream van and a coast road plate from GPT Image through Codex (no credits), keyed in code | the H3 lip-sync clip: the still bobs and squashes on the beat instead |

## Add a segment

1. Read the look's recipe (`looks/<slug>.yaml`) and its `code.path`.
2. Make `segments/<slug>/` from the pilot folder closest in kind. Copy the look's engine files in unchanged where you can,
   so the segment can be diffed against the source; write the scene new.
3. `npm install && npm run render`, check frames, then `node ../scrub.mjs` from here or `node segments/scrub.mjs` from the
   repo root.
4. Note the source commit and paths, and every change to a lifted file, in the segment's README.
