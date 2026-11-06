# Aspect ratios: The Reform Party at Burning Man

| Ratio | Page | Shot code | Renders | How it was made |
|---|---|---|---|---|
| 16:9 master | `looks/dali.html` | `js/dali/` | `out/`, finals in `out/finals/` | the film as drawn, 1080p master from draft 37 (9eb9384) |
| 9:16 | `looks/dali-9x16.html` | `js/dali-9x16/` | `out/9x16/`, file names end `_9x16.mp4` | tall-camera redraw (Robin, 2026-11-06), not a crop |

## 9:16, the tall camera

The same 3D world and the same drone flight, drawn on a 1080x1920 canvas (rendered and delivered at 720x1280).

- `core.js` reads `window.PORTRAIT` (set by the tall page) for W and H. World placements that were tuned on master
  screen positions (the gag lips, the referee, the Instrument People's exit) use `MW`/`MH`, so both pages build the
  same world.
- `camera.js camAt` hands each pose to `camPortrait` (js/dali-9x16/camera-9x16.js) when the tall page loads it. The lens
  is the master's, so the tall frame sees the middle 56% of the master's width and 1.78x its height. Where the master
  put the sung word's subject (camera.js `CUE_TARGETS`) or the table off centre, the drone turns just enough (a real
  yaw, smoothed over about half a second) to keep it in the tall frame. Subjects the master doesn't show are ignored.
  Bare poses (scene placement) stay the master's.
- Captions sit at y 1250 of 1920 (js/dali-9x16/frame-9x16.js), clear of the Reels/Shorts bottom fifth and above the
  stilt pair on "without spin".
- Check: `PAGE=looks/dali-9x16.html node tools/check-camera.mjs`. On 2026-11-06 the tall page missed the same cue
  words as the master (control, blues, time, poor, unfair, pie, mystery, look, knight, shamelessly) plus partial frames
  on grin (49), spin (56), facts and share.
- Flash: the first full tall render failed flashcheck at 1:19 (the push into the cell bars, 4 a second) and 2:27 (the
  protected whip onto the mystery book, 3.5) where the 16:9 passes. `PORT_FIX` in camera-9x16.js widens the lens on the bar
  push and tilts up a little on the whip; those two spans were re-rendered and spliced in, and the cut passes (worst 3).
- Render: `tools/cloud-render/cloud-render.sh --tall bobwiseman-reform-party looks/dali-9x16.html 0 268.99 <out>`.
