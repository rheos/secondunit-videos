# Study: ESCAPEMENT, a 36 s film from Python driving Blender (and the cook skill behind it)

Leon Lin (@LexnLin on X, github.com/Leonxlnx), posted 3:33 pm Sun Nov 8, 2026 (Pacific):
https://x.com/LexnLin/status/2119558994352304202. Same person as the rest of this folder: the X profile
links github.com/Leonxlnx/ and the repo is under that account. Studied Nov 9, 2026 (issue
rheos/secondunit-videos#467). Read: the post and his four replies, the repo at commit `02cf7a4`, the
1080p share copy from its release (frames only, nothing kept here), and his `cook` skill. Other replies
were not read past his own.

## What he says (fact)

- Post: "this might be the best thing i've built with opus 5.5", "every frame is python, no 3D assets
  were used". 45k views, about 1k likes on the day.
- How: "opus 5.5 xhigh ultracode, one prompt and some slight steering"; Blender 5.2 headless, EEVEE;
  edit, colour grade and sound mix in code (numpy + ffmpeg); a Rory Flynn post as the reference for the
  car scene; "generated images of the 3d temple and the gears" as references; made with his `/cook`
  skill.
- Music "Epical Drums 02" by Grigoriy Nuzhny (Mixkit); sound effects Mixkit and Freesound CC0.
- "not perfect btw, the cloud reveal still looks a bit like sand dunes". A better cloud build froze his
  integrated GPU, so it was cut.

The Rory Flynn post he credits is three.js blocking frames steering Seedance, the same previz-to-paid
method as the Storm-Born row in QUIVER (2026-11-07). Leon did not use Seedance: he took the car film as a
look reference only.

## The film (fact, read off the frames)

36.5 s, 24 fps, 1920x1080 with a 2.39:1 letterbox. Six acts, each a world that "escapes" into the next:

| Act | World | Hand-off into the next |
|---|---|---|
| I | Macro brass clockwork in the dark, razor focus, cyan haze | A six-spoke gear head-on fills the frame |
| II | A hypercar assembles itself in a black studio, parts slamming on the beat | The studio breaks up into chunks and reveals a dusk canyon |
| III | The drive: tracking, mirror, drift, top-down drone, car over the lens, slot canyon | Dust fills the frame and dissolves into cloud |
| IV | Above a cloud deck, a clockwork temple on a floating island | The last frame is held still and becomes a printed photo |
| V | A walnut desk: the photo, blueprints, pocket watch; low run across the desk | Dive into the watch's gears |
| VI | Title in machined brass over turning gears | |

Judged from the stills: acts I, II and VI are the strongest, dark frames with small rich speculars that
read as photographed. The canyon is soft and muddy brown in its dust shots. The temple reads as a game
asset at distance (flat lawns, toy trees), and the cloud deck does look like dunes, as he says. The
match cuts land; the film's real quality is the chain of hand-offs, not any one world.

## How it was made (fact, from the repo)

- About 18,000 lines of Python: `lib/` (shared `common.py` of primitives, materials and camera helpers,
  plus one generator per world: car, canyon, temple, clouds, desk), `shots/` (one script per act,
  `--shot <ID>` renders one shot), `tools/` (render runner, edit, mix, QC).
- Five builder agents, one per act, in parallel; then a director agent scored each act (3.5 to 5 out
  of 10 on the first pass) and a second pass fixed them. `notes/act*.md` are the agents' logs.
- `BRIEF.md` is the production bible: story, shot list, transition hand-offs, look rules, technical
  rules, and the client's notes appended mid-run as dated "CLIENT RULE" sections (never too bright;
  effects must look real; three extra driving shots).
- Render budget 30 s a frame at 1080p on an AMD 780M laptop iGPU; measured 3-33 s a frame steady state,
  plus a 35-60 s shader compile on each shot's first frame. Fast-motion shots at 83% size and 16 samples,
  then upscaled, since motion blur hides it.
- Every Blender run goes through one GPU lock (`tools/gpu_guard.py`): three EEVEE renders sharing the
  iGPU bluescreened the laptop. His own agent found races in the lock (two waiters both clearing a dead
  holder; an orphaned Blender after a shell timeout) and worked around them with a detached queue.
- Shots are rendered with handles (`shotlist.json` `render_frames`) so the edit can retrim without a
  re-render.
- `tools/edit.py` (457 lines, numpy): conform from 16-bit PNGs, retime, transitions (cut, dissolve,
  white-out, luma dissolve, diagonal hairline wipe), per-act grade with blends between acts, red-orange
  halation, grain, vignette, chroma aberration, letterbox, light leak, H.264 BT.709.
- `tools/mix.py` (211 lines, numpy): music and effects from `edit/cues.json`, cues written relative to
  shot starts so the sound follows a retrim, cut to a 120 BPM grid (12 frames a beat). Each cue has
  `align: start | peak | end`.
- `tools/exposure_check.py` (67 lines): scores a still and fails it on numbers (below).

Licence: code MIT (`LICENSE`, Leon Lin 2026). The music and effects are Mixkit and Freesound files under
their own licences, not in the repo; never copy them. The `film/ref/` reference images the brief names
are not in the repo either, and the brief tells its agents "DO NOT replicate any of these".

## The cook skill (fact)

github.com/Leonxlnx/cook, MIT, about 760 lines: SKILL.md, five references, a ROUNDS ledger template and
`scripts/side-by-side.mjs`. One intake with defaults, then a long autonomous loop (it is written for
10-40 hour runs): build, render stills from fixed camera presets, side-by-side against the references,
measure, score with fresh-context critics, log the round, send stills, keep going. It holds the final
render until the user approves the stills.

## What's new to us

Most of this is already in house: song clock and beat grid, parallel builders per chapter plus a
reviewer, a production bible (LEVIATHAN's CONTRACT.md), off-Mac renders, critics against references
(open-water's loop), transitions that follow an element. Blender itself is in the toolbox (4.5 on this
Mac, 5.2 on Modal) and two of our looks run on it (rocket-portals, voxelloop). What is new:

1. **An exposure and colour gate on every still.** We have frame forensics, badframes and flashcheck,
   which catch pops, holds and flashes, but nothing that fails a frame for being washed out or dull.
   His check measures luma percentiles (p1/p5/p50/p95/p99), clipped pixels (>0.985 in any channel, max
   0.5%), near-white area (luma >0.92, max 2%), lifted blacks (p5 above 0.08, or 0.15 for daylight),
   contrast (p95 minus p5, fail under 0.35), mean saturation and Hasler-Susstrunk colourfulness (fail
   under 18). His thresholds are for dark cinema; our cream-paper looks would fail "near-white" on every
   frame. So the thresholds belong to the look, not the tool: each look's YAML would carry its own
   expected paper luma, black floor and colourfulness range, measured off its approved clip.
2. **Hand-off contracts in numbers.** For each cut between two builders' acts, the brief fixes what both
   sides must show: camera down the rotation axis, the object's outer diameter at 95% of frame height,
   exactly six spokes, clockwise on screen, the same angular speed (26 degrees a frame) carried through
   the cut, the last 12 frames held still where the next act needs a static frame. Our rule says a
   transition follows an element; this is how to brief it when two agents build the two sides.
3. **One scene's last frame becomes an object in the next.** Act IV's final frame is written to a PNG
   and used as the texture of a printed photo lying on act V's desk; act V opens with the camera square
   on the print so the frame matches exactly, then pulls back. Any of our engines can do this (a canvas
   frame as an image on a poster, a postcard, a TV, a page in a book).
4. **Luma dissolve.** The bright parts of the incoming shot appear first (dust into cloud). A one-line
   rule that sits beside our element transitions as a fallback better than a plain fade.
5. **Sound cues aligned by their loudest point.** `align: peak` puts a sound's peak on the frame (an
   impact on the cut), `align: end` ends a riser on the cut. Our sound placement is by start time.
6. **cook's calibration offset.** When the user gives a score, log the gap between it and the critics'
   median and apply that offset to every later score; add a critic when two differ by more than 10
   points. Our critics have no record of how far they overrate.

## Verdict

**Borrow the methods; no look test now.** A Blender photoreal look is a candidate, not queued.

- Our house work is drawn: clean line, paper, ink, toon. Photographed objects in the dark are a
  different studio. The fit is narrow: an IndieAgent object short, a product macro in an explainer, the
  Achbar reel if it wants a machine. Nothing in the current queue needs it.
- It doesn't run here. This Mac can't run Blender 5 and crashed on a long local EEVEE render
  (2026-10-16). His 30 s-a-frame budget is on a GPU. On Modal CPU (llvmpipe) a 960x540 EEVEE frame took
  5-9 s with no volumes; his scenes carry volumetric haze and dense geometry, so expect several times
  that.
- If Robin wants it later, the test is: one 8-10 s macro-mechanism shot of our own design (not his
  clockwork, car, temple or desk), stills on Blender 4.5 locally, the clip on Modal. Cost: 0 credits;
  Modal about $1-3 for 240 frames at 720p-1080p on CPU (the $0.002 a 720p frame we measured, times
  several for volumes); half a day of Team-seat tokens; render time a few hours on CPU unless a GPU card
  goes on the Modal account.

What to take now, all MIT code or plain ideas:

| Take | Where it goes | Cost |
|---|---|---|
| Exposure and colour gate, thresholds per look | cleanline's planned `review` command (Academy plan phase 1, item 4); a field in each look YAML | an hour to port, then measure each look's approved clip |
| Numeric hand-off contracts | the brief template for parallel chapter builders | none |
| Last frame becomes a prop | a transition recipe in `video-production` art direction | none |
| Luma dissolve | the transition list, as the fallback above a fade | none |
| `align: peak` / `end` for sound cues | the sfx-bank and whatever cue format cleanline settles on | small |
| Calibration offset for critics | our critic step (motion-lab review, bureau critics) | none |

Don't install cook. Like cinetic, it would claim every visual build, and its loop never asks a question
after intake, where ours stops at Robin's gates. Its description also invites "a recreation in code"
from reference images, which breaks build-a-language-not-a-copy (its own Never list does say not to
copy one element 1:1).

For the Academy Kit: the exposure gate is a good lesson ("measure the frame before you judge it") and a
good kit tool, provided we write our own version with per-look thresholds and keep his MIT notice if any
of his code is copied. The hand-off contract and the last-frame-as-prop recipe are teachable without
code. Never his film, its worlds, its shot list or its music in anything we ship.
