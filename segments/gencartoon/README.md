# Retro halftone cartoon: 15 s segment

Look: `looks/gencartoon.yaml`. A generated character on chroma green, keyed and composited over a generated plate that
scrolls left, with torn white lane dashes rushing past under its tyres. Here the character is a 1950s ice-cream van and
the plate a coast road with a lighthouse, both new for the segment.

```bash
npm install && npm run render     # out/gencartoon-segment_f00000-f00360_24fps_review-720p.mp4, 1280x720, about 30 s
npm run preview                   # serves the folder; open the address it prints to watch it loop
```

## What is generated and what is code

| Piece | How | Cost |
|---|---|---|
| `assets/character-green.png` | GPT Image through Codex, prompt `prompts/01_character.txt` (the style bible verbatim, then the van), 1536x1024 scaled to 1152x768 | none (ChatGPT plan) |
| `assets/plate.jpg` | GPT Image through Codex, prompt `prompts/02_plate.txt`, 1536x1024 cropped to 16:9 | none |
| The lip-sync clip | **not made.** `prompts/03_clip.yml` is the brief for one 10 s MiniMax H3 Max clip in reference mode | 34 credits per 10 s on the look's record; needs Robin's go and a vocal of our own |
| Keying, layout, pan, dashes, bob | `js/composite.js`, a plain-canvas port of the look's p5 overlay | none |

**Stand-in.** Until the clip exists the character is the green still, animated in code: it bobs on the beat as the
original does, and also lands each beat with a small squash and rocks a little, because a still cannot act. It does not
sing. To use a clip, put its frames in `assets/clip/0000.png ...` and set `CLIP.frames` in `js/composite.js`; each frame
is keyed the same way.

`prompts/style.txt` is the style bible as pasted into both still prompts.

## Where it came from

The look's composite is the p5 overlay that `code.path` in `looks/gencartoon.yaml` points at (`05_overlay.js`, kept in
the local mv-projects checkout, not in git). `js/composite.js` keeps its layout numbers (lead height, road line, the 1.18 cover
scale and full-width pan, nine dashes at 26 px a frame, the beat bob) and drops the toolkit (`Anim.sketch`, p5). The
film's character, plate, vocal and clip did not come along; the prompts here were written new from the recipe's style
bible.
