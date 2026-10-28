# Anatomy trial: stage-door amp

A test of [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy) (MIT, v1.1.0, installed to
`~/.claude/skills/anatomy` on 2026-10-28). One Figure-size object: a small tweed-style combo amp on a stage
riser, seen from the open back. It has three valves, a chassis with three knobs, a toggle, an input jack and a
pilot lamp (the one lit part). A lead runs from a stompbox, and a ticket stub is clipped to the side. 42
recorded solids, one cable, 51 depth-sorted items. Issue rheos/secondunit-videos#341.

The kit is copied into `kit/` (iso-kit, lathe, tube, audit, gl, with its MIT licence) so the folder builds
without the skill installed.

```
node build.mjs --audit                          # writes amp.html, settles depth, runs the audit
node ~/.claude/skills/anatomy/scripts/lines.mjs amp.html --out out/lines.png
node render.mjs --shots 0,3.8,7.6               # stills
node render.mjs                                 # 288 frames at 1920x1080 -> out/amp-tour_720p.mp4
```

The tour (12 s): unplugged and cold, the lead slides in (1.2 s), lamp and valve heaters come on (2.7 s), lamp
off (4.3 s), then it comes apart (4.7 s) in the order lead, back panel, valves, chassis. It holds apart, folds
back up from 8.1 s with the lead home last, and the lamp comes on again at 10.6 s.

## Setup friction

Low. `npx skills add wheresryan22/anatomy -g -a claude-code -y` worked first time. It flags itself "Med Risk"
on one of three scanners (Gen), with 0 Socket alerts and Low on Snyk. Node 24 and Chrome were already here. The
skill is big: SKILL.md plus five reference files is about 1,500 lines of rules, and they matter. Most of
what passed first time passed because I read them before drawing.

The Raptor audit passes on this Mac, but it took **16 minutes** (769 s of audit). The docs quote about 2.5
minutes. A dense figure on the 2019 Intel Mac is a background job, not something to iterate on.

## Did the audit and line check catch real faults?

Yes, and each one was a fault I'd have shipped. The first audit failed with 6 problems:

- **Back panel floating.** It sat 0.2 units above the cabinet floor, touching nothing (`support: loose
  back.panel`). It looked fine on screen.
- **Staircase domes.** The three valve domes and the lamp jewel were traced through hand-typed knots, so their
  tone bands lurched (`wobble`). Fixed with an analytic slope.
- **Cable end landing on a valve.** The cable's start at the plug read on screen as touching the 12AX7 behind
  it, 59 units apart in depth (`crowding`). Moving the jack 6 units fixed it.

The second audit passed. The line check then found one floating line (a seam on the ticket clip stopping
short of the clip's rounded corner) and was 0 after the fix, at rest, powered and apart.

The more important test was the explode. My first vectors drove the chassis jack straight through the parked
plug. I saw it in a still and fixed the vectors before the audit ran. So I re-ran the audit on a copy with the
old vectors, and it caught the fault exactly: `chassis.jack × lead.plug sunk 3.70 deep` apart, plus 527
depth-order problems across the replayed spring frames. It proves the explode for every frame, including
reversals mid-flight, which is the part we only check by eye today.

What it doesn't see: composition, whether the object is detailed enough, and anything outside its painter's
model (my lamp glow and heater glows are plain SVG overlays it never checks).

## How hard was the seek(t) port?

Easy, about 40 lines. Anatomy pages run springs on `requestAnimationFrame` time. The port keeps the same spring
constants and stagger that the audit replays, and fixes the tour as a list of events. Then `__seek(t)`
integrates every spring from t = 0 at 240 Hz on each call. That's pure (no state carried between frames) and
cheap: 5 springs × 2,880 steps. The per-frame depth re-sort is the kit's own `key + lift × share`. One fiddly bit:
`pageHtml` wraps the figure in a centred column with a 64 px top margin, which pushed the frame down until I
overrode `.iso-page`. Render: 288 frames in 75 s on this Mac, one Chrome, no GPU.

## Time (Pacific, from `date`)

| Step | Time |
|---|---|
| Start | 1:56 pm |
| Issue, worktree, skill installed | 1:57 pm |
| Docs read, first build on screen | 2:04 pm |
| Audit passed (after 6 fixes) | ~2:09 pm |
| Line check 0 in three poses | ~2:13 pm |
| 720p cut rendered | 2:17 pm |

About 20 minutes from first build to the finished cut. Each audit run is about 75 s on this Mac, mostly
settling the depth keys.

## Verdict

**Worth keeping for object cutaways, not as a whole film look.** For the IndieAgent explainers and the
bureau-series cutaways, it does one thing nothing else we have does: a crisp technical drawing of a real object
that comes apart and goes back together, with the geometry proved. "Here is what's inside the thing" shots are
a strong fit: the amp, a ticket machine, a mixing desk, a phone with its back off. It's fast once the rules are
read, and the seek(t) port means any figure drops into our render pipeline.

Limits:
- It's a drafting look: pale, monochrome, thin lines, one lit accent. It reads as an engineering plate, not
  marker paper. Next to the Kevin Ngo marker-paper short it would be a deliberate change of register, an
  "insert", not a match.
- This figure is at the low end of the skill's own detail bar. The cabinet faces are plain (no tolex, grille
  or corner caps), and a reviewer applying its 4× rule would ask for more. It's enough to judge the look, not
  a final.
- Isometric only, no camera moves. Motion has to come from the object (explodes, plugs, lamps, needles).
- Dense figures (Raptor-size) are slow to audit here. Keep figures small or audit in the background.

No look record yet. That waits for Robin's call on the clip.
