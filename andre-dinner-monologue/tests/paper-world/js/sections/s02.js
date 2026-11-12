// s02.js: section 2, the bathtub, f196 to f504. Its cue names, its events and its camera keys, every one a pure
// function of the film frame f (24 fps). The near plate opens like a lid, hinged at its far edge; a child cut-out rises
// on a slot out of the opening; a paper tub pops up round it with waves on a rocker; a duck slides out along a slot on
// the waves and bobs back and forth; on "what" everything stops dead; then it all folds back under the lid.
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import { CUES } from "../cues/s02.js";                  // generated: $PY tools/onsets.py 02 (from tools/cues/s02.json)
import { clamp, smooth, smoother, spring } from "../kit.js";
import { camFrom } from "./lib.js";
import { joinKey, joinFloat } from "./joins.js";
export { CUES };

export const F0 = 196, F1 = 504;
const c = (k) => CUES[k].f;
export const C = { spoiled: c("spoiled"), children: c("children"), bathtub: c("bathtub"), playing: c("playing"), duck: c("duck"), thinking: c("thinking"), what: c("what"), do_: c("do") };
const twos = (f) => f - ((f - F0) & 1);                  // paper is posed on twos
const bump = (u) => (u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u) ** 2);

// ---------- the layout. PLATE is the near plate; everything that pops up stands in one frame turned YAW about the
// vertical, so its cards face the lens where the camera holds (local x: along the tub, the duck's end; local z: toward the lens)
export const PLATE = [0, 44], YAW = (-3 * Math.PI) / 180, LID_DEG = 75;
export const TUB = { len: 16, zFront: -0.4, zBack: -3.2, zWaves: -1.8, zChild: -2.5 };       // local z of each card
export const local = (x, z) => [PLATE[0] + x * Math.cos(YAW) + z * Math.sin(YAW), PLATE[1] - x * Math.sin(YAW) + z * Math.cos(YAW)];

// ---------- the order of the fold-away, from f470
export const OUT = { duck: 470, tub: 475, front: 478, child: 480, lid: 485, line: 497 };

// ---------- the hinge line along the plate's far edge: cut from the middle outward, closed up again at the end. The hinge is
// on the far left of the rim, AZ round from the straight-far point, so the open lid stands clear of the line from the
// lens through the tub to the candle (hinged straight across the far edge, the lid hides the candle from every low camera)
export const HINGE = { az: (55 * Math.PI) / 180, r: 12, half: 5.2, in0: 204, in1: 220 };
HINGE.at = [PLATE[0] - HINGE.r * Math.sin(HINGE.az), PLATE[1] - HINGE.r * Math.cos(HINGE.az)];
HINGE.along = [Math.cos(HINGE.az), -Math.sin(HINGE.az)];
export const hingeAt = (f) => (f < OUT.line ? smooth((f - HINGE.in0) / (HINGE.in1 - HINGE.in0)) : 1 - smooth((f - OUT.line) / (F1 - 1 - OUT.line)));

// ---------- the lid: the near plate disc, 0 flat to 1 open by LID_DEG. It stirs twice, springs open on "spoiled",
// and drops shut with one small bounce
export function lidAt(f) {
  if (f < F0 || f >= F1) return 0;
  if (f < C.spoiled) return 0.035 * bump((f - 222) / 9) + 0.06 * bump((f - 235) / 11);
  const t = f - OUT.lid, shut = t <= 0 ? 1 : t < 12 ? 1 - (t / 12) ** 2 : t < 18 ? 0.03 * Math.exp(-(t - 12) / 2.5) * Math.abs(Math.sin((Math.PI * (t - 12)) / 5)) : 0;
  return spring(f - C.spoiled, 0.6, 20) * shut;
}

// ---------- the child: rises on its slot on "children" (12 frames and a settle), leaning back; rocks on twos while it
// plays; stops dead on "what"; sinks again at the end
export const CHILD = { h: 8, x: -3.7, base: 5.8, lean: (12 * Math.PI) / 180, travel: 14.5 };
export function childAt(f) {
  const up = spring(f - C.children, 0.62, 24) * (1 - smoother((f - OUT.child) / 11)), g = twos(Math.min(f, C.what));
  const rock = ((2.6 * Math.PI) / 180) * Math.sin(((g - C.playing) * Math.PI) / 9) * smooth((g - C.playing) / 6);
  return { shown: f >= C.children && f < OUT.child + 12, y: CHILD.base - CHILD.travel * (1 - up), lean: CHILD.lean + (f >= C.playing ? rock : 0) };
}

// ---------- the tub: on "bathtub" the front wall hinges up from lying flat toward the lens. The waves lie against its
// inner face and stand away from it on their rocker as it comes up (four frames later); the back wall lifts through its
// slit behind (two frames later). At the end the waves drop back against the wall, the back wall sinks, the wall folds down.
export function tubAt(f) {
  const t = f - C.bathtub, d = f - OUT.tub;
  const front = spring(t, 0.6, 16) * (1 - clamp((f - OUT.front) / 9) ** 2);
  return { front, back: spring(t - 2, 0.62, 22) * (1 - smoother((d - 1) / 10)), waves: spring(t - 4, 0.62, 20) * (1 - smoother(d / 8)) };
}
// the waves tip slowly on their rocker; dead still from "what"
export const WAVES = { len: 12.4, base: 4.4, deg: 3.2, period: 66 };
export function rockAt(f) { const g = Math.min(f, C.what); return ((WAVES.deg * Math.PI) / 180) * Math.sin(((g - C.bathtub) * 2 * Math.PI) / WAVES.period) * smooth((g - C.bathtub - 8) / 20); }

// ---------- the duck: 3 cm. On "duck" it slides up and out along its slot on the waves (12 frames), then bobs back and
// forth 1.2 cm each way on twos; on "what" it stops dead; at the end it drops back down its slot
export const DUCK = { h: 3, home: [3.8, 0.3], from: [3.6, -3.0], swing: 1.2, period: 22, in: 12 };      // x along the waves, y above the waves' foot
export function duckAt(f) {
  const t = f - C.duck, k = smoother(t / DUCK.in) + 0.06 * bump((t - DUCK.in + 3) / 9), g = twos(Math.min(f, C.what)) - (C.duck + DUCK.in);
  const bob = g > 0 ? Math.sin((g * 2 * Math.PI) / DUCK.period) : 0, fall = clamp((f - OUT.duck) / 5) ** 2;
  // the way out: up the slot's leg behind the front wall to the line along the waves
  const u = clamp(k, 0, 1.2), x = DUCK.from[0] + (DUCK.home[0] - DUCK.from[0]) * smooth(u), y = DUCK.from[1] + (DUCK.home[1] - DUCK.from[1]) * Math.min(1.03, 1 - (1 - Math.min(u, 1)) ** 2 + (u > 1 ? (u - 1) * 0.5 : 0));
  return { shown: t >= 0 && f < OUT.duck + 5, x: x + DUCK.swing * bob, y: y + 0.1 * Math.abs(bob) * (g > 0 ? 1 : 0) - 3.0 * fall, tilt: -0.07 * bob + 0.35 * fall, bob };
}

// ---------- the light: a little warmer and closer while the tub is up (the final picture's tint, eased in and out)
const warm = (f) => smooth((f - C.spoiled + 6) / 30) * (1 - smooth((f - OUT.tub) / (F1 - 2 - OUT.tub)));
export const grade = (f) => { const k = f < F0 || f >= F1 ? 0 : warm(f); return { expo: 1 + 0.05 * k, tint: [1 + 0.035 * k, 1, 1 - 0.07 * k], sat: 1 }; };

// ---------- the camera: one move. It settles low at the near plate, a little to the right; as the lid opens it starts a
// slow circle back round the plate to the left, rising just enough for the flame to stand over the tub's far rim,
// between the child's hand and the duck; it pushes in a little, holds drifting, then rises off the plate to the join.
const orbit = (deg, d, y) => [PLATE[0] + d * Math.sin((deg * Math.PI) / 180), y, PLATE[1] + d * Math.cos((deg * Math.PI) / 180)];
export const CAM_KEYS = [
  joinKey(F0),
  { f: 226, P: orbit(1, 27.4, 6.9), T: [-3.2, 3.0, 40.5] },
  { f: C.spoiled, P: orbit(10.5, 27.6, 6.0), T: [-1.8, 5.2, 41.8] },
  { f: C.children + 10, P: orbit(17, 28.4, 6.0), T: [-0.6, 6.8, 42] },
  { f: 290, P: orbit(19, 29.6, 6.9), T: [-0.6, 6.9, 42] },
  { f: C.bathtub, P: orbit(18, 30.4, 8.2), T: [-0.6, 6.9, 42] },
  { f: C.playing, P: orbit(13.4, 29.6, 8.6), T: [-0.6, 6.8, 42] },
  { f: C.duck, P: orbit(4.5, 27.6, 8.9), T: [-0.6, 6.8, 42] },
  { f: C.what, P: orbit(-6, 25.8, 9.3), T: [-0.25, 6.8, 42] },
  { f: C.do_ + 4, P: orbit(-9.5, 25.2, 9.5), T: [-0.2, 6.7, 42] },
  joinKey(F1),
];
export const camAt = (f) => camFrom(CAM_KEYS, f, joinFloat(F0, F1, f));

export const BEATS = [
  [HINGE.in0, "(mean)", "a hinge line is cut along the near plate's far edge, from the middle outward"], [222, "(bored)", "the plate stirs twice on its hinge"],
  [C.spoiled, "spoiled", "the plate springs open like a lid, hinged at its far edge, to 75 degrees"], [C.children, "children", "the child cut-out rises on its slot out of the opening, leaning back"],
  [C.bathtub, "bathtub", "the tub's front wall hinges up in front of the child; the back wall and the waves lift behind it; the waves tip on their rocker"],
  [C.playing, "playing", "the child rocks on twos; the camera pushes in"], [C.duck, "duck", "the duck slides out along its slot on the waves and bobs back and forth, 1.2 cm each way, on twos"],
  [C.thinking, "thinking", "the duck bobs; the waves tip"], [C.what, "what", "the duck, the waves and the child stop dead"], [C.do_, "do", "held"],
  [OUT.duck, "(fold)", "the duck drops, the waves and the back wall sink, the front wall folds down, the child sinks"], [OUT.lid, "(lid)", "the lid drops shut with one small bounce; the hinge line closes"],
];
