# papersilhouette: coloured paper silhouettes, f2548 to f3384 (106.0 to 141.0 s)

Look test for the camp-to-seed section of the Andre dinner monologue. Built on the paper, shadow,
grain and puppet machinery of `../../../bobwiseman-in-her-dream/js/cut/kit.js`, re-sized to 720x1280
and trimmed to what this speech needs (`js/kit.js`); a new cast and props (`js/cast.js`); two shot
files. Every frame is a pure function of t; paper moves on twos; seeded randomness only.

Review file: `../../out/papersilhouette/andre_papersilhouette-test01_f2548-f3384_24fps_720x1280.mp4`
(836 frames, 34.83 s, voice muxed from `_in/andre.wav`).

## Commands (run from this folder; `node_modules` is a symlink to the In Her Dream install for Playwright)

```bash
# cast line-up at full size (rig check, not in the film)
PAGE=lineup.html nice -n 15 node check.mjs ../../out/papersilhouette/lineup 0
# the review file: frames [2548, 3384) at 24 fps, H.264 crf 23 yuv420p, aac 192k from the master
nice -n 15 node render.mjs 2548 3384 ../../out/papersilhouette/andre_papersilhouette-test01_f2548-f3384_24fps_720x1280.mp4 3
# full-size stills (frame numbers, or seconds with an s suffix) and the contact sheet
nice -n 15 node check.mjs ../../out/papersilhouette/check 2548 2700 2830 2835 3130 3168 3212 3331 3383 2737 2761 2897 3007 3128 3260
node check.mjs --sheet ../../out/papersilhouette/check/sheet.jpg ../../out/papersilhouette/check
# onion skin of the hero move (the pine shoot on "escape")
nice -n 15 node ../../../tools/motion-lab/views.mjs onion index.html ../../out/papersilhouette/check/onion-pine.jpg 138.75 139.75 --step 2 --width 720 --height 1280
# scans
PY=/Users/robin/Code/novadiem/indieagent/viralvision/viralvision-worker/.venv/bin/python
nice -n 15 $PY ../../../tools/cloud-render/badframes.py ../../out/papersilhouette/andre_papersilhouette-test01_f2548-f3384_24fps_720x1280.mp4
nice -n 15 $PY ../../../tools/motion-lab/flashcheck.py ../../out/papersilhouette/andre_papersilhouette-test01_f2548-f3384_24fps_720x1280.mp4
# onsets: snap a cue to the strongest 40 ms energy rise within 0.6 s; or list every onset in a span
$PY onsets.py ../../_in/andre.wav 133.78 138.94
$PY onsetlist.py ../../_in/andre.wav 106 141.2 0.7
```

In the browser: `index.html?t=120.7` seeks (click or space to play; `a=` and `b=` set the loop);
`?w=360` renders at that width. `?offline=1` is what the tools use (no audio element wait).

## SHOTS (frames at 24 fps, half-open; hits snapped to onsets in `_in/andre.wav`)

| In | Out | On screen | Words it answers |
|---|---|---|---|
| f2548 | f2700 | Cream paper. A slate cut-paper skyline rises tower by tower out of the ground line (nine towers, f2549 to f2601, each a spring with 6% overshoot). Six small navy figures walk in from the left, each with two oxblood bricks held overhead, and drop them into a slot: the first stack lands at f2636 ("camp"), then one every 0.38 s right to left; the wall (six slots, two courses) is done at f2684. | "I think that New York is the new model for the new concentration camp" |
| f2700 | f2830 | The six stand behind the wall they built, heads and shoulders above it, breathing, a look up at it on "themselves" (f2696). On "guards" (f2737) each does a paper turn to face outward and a kepi pops onto its head, left to right. On "pride" (f2761) they hop up and stand on the wall, hands on hips, chests out, leaning back. A slow push-in (1.0 to 1.28) from f2773 to the cut. | "where the camp has been built by the inmates themselves, and the inmates are the guards, and they have this pride in this thing they've built. They've built their own prison." |
| f2830 | f3130 | A sheet slides up (0.45 s): one big capped head in profile, navy, filling the top two thirds, a closed-eye crescent cut out of it. It is two papers: on "schizophrenia" (f2897) the bare oxblood layer slides out to the right and the capped navy one to the left; the capped one nudges on "guards" (f2911), the bare one on "prisoners" (f2930); they close up on "result" (f2963). On "lobotomized" (f3007) the crown lifts off with its cap and hangs there. From "see" (f3107) oxblood bricks slide in row by row from the frame edges, outer rows first, until only a slit at the eye is left on "prison" (f3128). | "And so they exist in a state of schizophrenia, where they are both guards and prisoners, and as a result, they no longer have, having been lobotomized, the capacity to leave the prison they've made or to even see it as a prison." |
| f3130 | f3384 | The slit holds. On "And then" (f3171) a big open navy hand rises from below, palm up, filling the bottom half. On "took" (f3200) a second hand comes in from the top right pinching the seed; the seed drops and lands in the palm on "seed" (f3212, a small bounce); the hand withdraws. On "pine tree" (f3260) a tiny pine pops out of the seed. On "hand" (f3303) the palm lifts a touch. On "escape" (f3331) the pine shoots up through the slit (spring, 0.74, settles by f3355) and the bricks fall away past the camera, slit row first, while the two head papers leave left and right. Hold the pine in the open hand to f3384. | "And then he went into his pocket, and he took out a seed for a tree, and he said, this is a pine tree. He put it in my hand, and he said, escape before it's too late." |

Onset frames used: towers f2549, camp f2636, built f2675, themselves f2696, guards f2737, pride f2761,
prison f2827, schizophrenia f2897, guards f2911, prisoners f2930, result f2963, lobotomized f3007,
see f3107, prison f3128, then f3171, took f3200, seed f3212, pine f3260, hand f3303 (weak onset, cue
kept), escape f3331 (the stressed syllable; "before" is f3346, "late" f3371).

## Files

- `index.html`, `lineup.html`: the look and the rig check (contract: `window.__ready`, `window.__frameJPEG(t, q)`, `?t=`, `?w=`).
- `js/kit.js`: paper primitive, grain, head, kepi, puppet, poses, shot registry (720x1280).
- `js/cast.js`: the worker, bricks, seed, pine, the open hand, the pinching hand, towers.
- `js/shots/00-lineup.js`, `js/shots/01-camp.js` (shots 1-2), `js/shots/02-head.js` (shots 3-4).
- `js/main.js`: buffers, the rise transition, the paper finish, the browser loop.
- `render.mjs`, `check.mjs`: review file and stills per the output contract.
- `onsets.py`, `onsetlist.py`: onset snapping against the master.
- `NOTES.md`: BANNED list, known defects, what to change for the full film.
- Output: `../../out/papersilhouette/` (review MP4, `check/` stills + `sheet.jpg` + `onion-pine.jpg`, `lineup/f0.jpg`).
