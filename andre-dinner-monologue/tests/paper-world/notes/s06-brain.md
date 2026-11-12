# Section 6: the brain in the opened head (f2983 to f3168)

One beat added to the head, in `js/sections/s06.js` and `js/skin67.js`. `s07.js` is untouched. No cue moved, no
camera key changed, no registered piece renamed. Two pieces added: `brain` and `brain_lobe`.

Review file: `out/paper-world/wip/brain/andre_paper-world-s06-brain_f2940-f3181_24fps_720x1280.mp4` (241 frames,
10.04 s, voice cut to [122.5, 132.5417), muxed without -shortest). Frames: `out/paper-world/wip/brain/frames/`.
Checks: `out/paper-world/check-brain/` (`sheet.jpg`, 18 full-size stills, `regress.txt`, the camera speed print).

## The beat

| Frame | What happens | Look at |
|---|---|---|
| f2983 ("no longer have") | The crown lifts on its hinge, 24 frames earlier than before. The brain stands in the hollow, its dome about 4.5 cm above the skull's cut | f2990, f3000 |
| f3007 ("lobotomized") | A dashed cut runs down the groove, top to bottom, done at f3015 | f3011, f3015 |
| f3016 | The frontal lobe tips forward over the rim (9 frames), slides off at f3024 and falls in front of the face, turning three quarters of a turn. It is last seen at the bottom of the frame at f3034 and is flat on the cloth at f3040 | f3019, f3023, f3028, f3033 |
| f3019 | What is left tilts 3 degrees toward the gap and settles on one spring (damping 0.45, period 16). The gap shows the hollow's dark wall, and the cut edge of the brain is pale | f3040, f3060 |
| f3107 to f3164 | The brick band crosses the eyes with the rest of the brain still in the crown | f3118, f3130 |
| f3160 to f3168 | The crown shuts over the brain as the head starts to fold; from f3169 the picture is the old one | f3166, f3170 |

## How it is built

- **The plate.** `work/plates/brain.png`, trimmed and alpha-tested by the same `cut()` as every plate. Its alpha is
  clean (the glow you see in a viewer is colour under transparent pixels). 13 cm long, 10.5 cm with the stem.
- **Where it sits** (`s06.js BRAIN`). Behind the bare layer, in the bare layer's group, so it would travel with it.
  Its long axis lies along the skull's cut (12.35 degrees, the hat band's slope), centre at pixel (500, 232) of the
  head plate's box. Closed, every pixel of it is behind the bare head, so the crown hides it and the lid uncovers it.
  The lid still covers the back third when it is open.
- **Depth.** The brain rides the hollow's inner wall: it stands off 1.2 cm behind the face as the lid lifts and is
  pressed flat between the layers when the crown shuts. That is how it folds away with the head.
- **The cut** (`skin67.js GROOVE`, `cutX`). 35 points down the lobe's own edge of the dark groove, in plate pixels.
  `brain` keeps what is left of that line, `brain_lobe` what is right of it. Both are the plate's own pixels; the
  lobe reaches two pixels under the other's edge and hangs 0.2 mm behind it, so there is no gap before it moves
  (`wip/brain/z_crops.jpg`, f3005 at 1:1).
- **The dashes.** About ten cream slits along the middle of the groove, one draw range, shown from the top. The eight
  frames are spent on the ones above the rim, since the face hides the rest.
- **The lobe's hinge is the skull's rim.** Its true base is 2.7 cm down inside the head, and a card hinged there would
  come out through the forehead. So it turns about the line where it crosses the rim, lifting 0.8 cm as it levers
  over, its lower part swinging back and up inside the hollow. `brain_lobe` is a piece in the world, not in the head.
- **Where the lobe goes.** 21.7 cm toward the lens and 1.4 cm left, to lie painted side up where the head's face
  comes down. When the head folds (f3164 to f3178) the flap covers it, and it is hidden with the pull-tab strips once
  the flap is flat. Nearer the head it lay in the bottom of the frame through the brick band, cut by the frame's
  edge; under the neck it showed past the head's outline at f3172 to f3175.
- **Tint.** The brain takes the head's tint; the lobe takes the tint of where it is. Nothing is relit. Both cast on
  the cloth.

## The camera

Not changed. With the keys as they were, the whole of the brain that shows is in the frame at f3000 (the lens is at
eye height then), the cut and the lobe are in frame from f3007 until the lobe leaves the bottom edge after f3034, and
the eyes are back for the band. Speed over f2957 to f3170: min 0.059, max 1.06 cm a frame, no dead stops, no jumps
(`check-brain/camera-speed_f2957-f3170.txt`).

## Checks

- `check-brain/regress.txt`: f2800, f2957, f2970, f3200, f3396, f3600, f4500 as PNG before and after: mean 0.0000,
  largest 0. f3130 differs (mean 2.94): the rest of the brain is in the open crown, as the beat asks. Every changed
  pixel is inside x 223 to 461, y 332 to 505, the brain. `check-brain/f3130_before-left_after-right.jpg` shows the two.
- `check-brain/frames_f2940-f3180_vs_last-pass.txt`: the 241 review frames against the last pass's delivered JPEGs.
  f2940 to f2983 and f3169 to f3180 are identical (56 frames, mean 0.0000, largest 0). f2984 to f3168 changed.
- Registry: 244 pieces, 247 parts; `brain` and `brain_lobe` are the two new names.

## What a later section could notice

- `S6.headAt(f).lid` starts at f2983, not f3007. `S6.BRAIN` and `S6.brainAt` are new exports. `BEATS` has one more row.
- `brain_lobe` lies on the cloth at about (27.6, 14.5) from f3040 to f3176, under the head's flap at the end.

## Still wrong

- The lid covers the back third of the brain. Seen from the front it is the front two thirds of a brain.
- Above the rim, the room shows behind the gap the lobe leaves; the dark wall is only the lower 2 cm of it (the wall
  stops near the rim, as the last pass built it).
- The falling lobe shows the same paint on its back, mirrored, as every two-sided card here does.
- `README.md` still has the crown lifting at f3007 in its beat table; it is not a file this pass may write.
- The lobe lands out of frame. Nobody sees it on the cloth: the camera is on the eyes until the head folds over it.
