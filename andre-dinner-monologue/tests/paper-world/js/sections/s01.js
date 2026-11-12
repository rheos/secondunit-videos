// s01.js: section 1, the table as set, f0 to f196. Its cue names, its events and its camera keys, all pure functions
// of the film frame f (24 fps). The film opens near dark: the room's soft lights, the table as a dim shape, the candle's
// flame card folded down on its wick. On the first word the card flips up on its hinge and lights, and the light opens
// across the cloth. The camera pushes in over the near place setting toward the flame, past two soft pieces of real
// tableware, then tilts down to the near plate. On "bored" the flame sinks low for 8 frames and comes back.
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import { CUES } from "../cues/s01.js";                  // generated: $PY tools/onsets.py 01 (from tools/cues/s01.json)
import { clamp, lerp, smooth, spring } from "../kit.js";
import { camFrom } from "./lib.js";
import { joinKey, joinFloat } from "./joins.js";
export { CUES };

export const F0 = 0, F1 = 196;
const c = (k) => CUES[k].f;
export const C = { why1: c("why1"), why2: c("why2"), lazy: c("lazy"), bored: c("bored") };

// ---------- the flame card. It lies folded forward on the wick until the first word; on that frame it lets go and
// springs up on its hinge (damping 0.62, so it swings a little past upright and settles), and it lights as it rises.
export const LIGHT = { f: C.why1, open: 12, flick: 9 };              // the light opens over 12 frames, with one flicker (frame 9)
const t1 = (f) => f - LIGHT.f + 1;                                    // 1 on the cue frame: the hit is seen on it
export const hingeAt = (f) => 1 - spring(t1(f), 0.62, 13);            // 1 folded down, 0 up, below 0 past upright
// how much of the candle burns: 0 dark, 1 lit. It catches fast, dips once (the flicker), and is full on the 12th frame
export function litAt(f) {
  const t = t1(f); if (t <= 0) return 0; if (t >= LIGHT.open + 4) return 1;
  const rise = 1 - (1 - clamp(t / LIGHT.open)) ** 2, d = (t - LIGHT.flick) / 2, dip = Math.abs(d) < 1 ? 0.5 * (0.5 + 0.5 * Math.cos(Math.PI * d)) : 0;
  return rise * (1 - dip);
}
// how far the light has opened across the cloth, in cm from the flame: the reach of the key light (0 = no limit)
// It crosses the near plate (60 cm) on frames 5 to 8 and the near edge of the cloth by frame 12; past frame 24 it is out of sight.
export function reachAt(f) { const t = t1(f); return t <= 0 ? 10 : t >= 2 * LIGHT.open ? 0 : 10 + 190 * (t / LIGHT.open) ** 1.5; }
// "bored": the flame sinks low over 3 frames, stays low, and is back up 8 frames after the word, with a small rebound
export const SINK = { f: C.bored, low: 8 };
export function sinkAt(f) { const t = f - SINK.f + 1; if (t <= 0 || t > 30) return 0; return smooth(t / 3) * (1 - spring(t - SINK.low + 2, 0.6, 12)); }

// ---------- the two soft pieces of real tableware the lens passes (this section's own copies of fg_glass and fg_fork:
// section 5's stand by the candle, where the join at f196 and section 2 expect them). They stand off the table, on
// whatever the camera starts from; their feet are never in the frame.
export const FG = { glass: { at: [-6.3, 86.5], y: 5.0, w: 9.4, dim: 0.5 }, fork: { at: [8.8, 84.0], y: 3.0, w: 17, dim: 0.5 } };

// ---------- the camera: the first key is the join at F0, the last is the join at F1 (position, target and velocity).
// One push in, slowing: 0.12 cm a frame at the first join to 0.05 at the last. The target stays on the flame until
// "lazy", then tilts down to the near plate.
const FLAME = [10.2, 4.0, -16.5];                                     // aimed a little under the flame: it sits just above the middle of the tall frame
export const KEY0 = 97;                                               // the key image: f97 to "lazy" (36 frames)
export const CAM_KEYS = [
  joinKey(F0),
  { f: 48, P: [-2.5, 14.3, 89.2], T: [9, 6.6, -13] },
  { f: KEY0, P: [-3.3, 12.0, 81.0], T: FLAME },
  { f: C.lazy, P: [-4.1, 10.5, 75.6], T: [FLAME[0] - 0.4, FLAME[1] - 0.3, FLAME[2] + 1] },
  { f: C.bored, P: [-4.6, 9.5, 72.1], T: [5.6, 5.4, 14] },
  joinKey(F1),
];
export const camAt = (f) => camFrom(CAM_KEYS, f, joinFloat(F0, F1, f));

// ---------- hooks (story.js applies every section's, in section order, for every f): no change from f196 on
export function flame(f, fl) {
  if (f >= F1) return fl;
  const lit = litAt(f), s = sinkAt(f);
  fl.hinge = clamp(hingeAt(f)); fl.lit = lit * (1 - 0.5 * s);
  fl.h *= lerp(0.55, 1, smooth(t1(f) / 8)) * (1 - 0.5 * s);          // the card is small as it catches, and sinks on "bored"
  return fl;
}
// the room fill: low in the dark (the table is a dim shape, not black), up to section 5's as the light opens
export const DARK_FILL = 0.5;
export const fill = (f) => (f >= F1 ? 1 : lerp(DARK_FILL, 1, smooth(t1(f) / LIGHT.open)));

export const BEATS = [
  [F0, "(dark)", "near dark: the room's soft lights, the table a dim shape, the flame card folded down on the wick; a soft glass close to the lens"],
  [C.why1, "(first word)", "the flame card springs up on its hinge and lights; the light opens across the cloth over 12 frames, with one flicker"],
  [C.why2, "why", "the table as set in paper, pushing in; the soft glass and fork have passed the lens (by f45)"],
  [KEY0, "(key image)", "the lit table from low behind the near plate, the flame beyond: held to \"lazy\""],
  [C.lazy, "lazy", "the camera starts to tilt down from the flame to the near plate"],
  [C.bored, "bored", "the flame sinks low for 8 frames and comes back"],
  [F1 - 1, "end", "on the near plate: the join at f196"],
];
