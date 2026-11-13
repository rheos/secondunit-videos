// s10.js: section 10, the bare table, f4315 to f4761, the end of the film. Its cue names, its events and its camera
// keys, all pure functions of the film frame f (24 fps). Nothing new stands up here: everything the table and sections
// 5 to 7 raised is folded away through the registry (skins/s10.js), the camera makes one rise and pull back to the
// widest frame of the film, and on the last word the flame card hinges down and the light goes out.
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import { CUES } from "../cues/s10.js";                  // generated: $PY tools/onsets.py 10 (from tools/cues/s10.json)
import { clamp, lerp, smooth, smoother } from "../kit.js";
import { camFrom } from "./lib.js";
import { joinKey } from "./joins.js";
import * as S5 from "./s05.js";
export { CUES };

export const F0 = 4315, F1 = 4761;
const c = (k) => CUES[k].f;
export const C = { nobody: c("nobody"), remind: c("remind"), species: c("species"), human: c("human"), feelings: c("feelings"), thoughts: c("thoughts"),
  history: c("history"), memory: c("memory"), erased: c("erased"), soon: c("soon"), nobody2: c("nobody2"), remember: c("remember"), life: c("life"),
  existed: c("existed"), planet: c("planet") };

// ---------- how a card falls flat: it tips slowly, lands on frame n, and settles with one small bounce
export const drop = (t, n = 9) => (t <= 0 ? 0 : t < n ? (t / n) ** 2 : 1 - 0.06 * Math.exp(-(t - n) / 3) * Math.abs(Math.sin((Math.PI * (t - n)) / 5)));
const unit = ([x, z]) => { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; };
export const headingOf = ([x, z]) => Math.atan2(x, z);              // the registry's heading: 0 = toward +z, PI / 2 = toward +x

// ---------- "species": the pine folds shut tier by tier from the top (tier 7), then lies down
export const PINE = { shut: 0.16, t0: C.species, gap: 2.5, each: 9, down: C.species + 25, n: 11, dir: unit([1, -0.25]) };
export const pineTier = (i, f) => lerp(1, PINE.shut, smooth((f - (PINE.t0 + PINE.gap * (7 - i))) / PINE.each));
export const pineDown = (f) => drop(f - PINE.down, PINE.n);

// ---------- "human": the redwood hinges down into the city, along its right side, between the bottle and the fence. It stands outside the
// chamfer, 45 cm tall, with 7 cm of cloth behind it: the only place it can lie is across the fence line, so the
// cutlery cards under it are pushed flat by the trunk as it comes down (skins/s10.js), and the tree man folds beside it
const FOOT = [S5.LAY.pot[0] + 1.0, S5.LAY.pot[1] - 1.3], AIM = [30, -14];       // along the right side, clear of the bottle (x = 21) and of the candle
export const RED = { foot: FOOT, dir: unit([AIM[0] - FOOT[0], AIM[1] - FOOT[1]]), h: 45, t0: C.human, n: 16 };
export const redDown = (f) => drop(f - RED.t0, RED.n);
// a card of height h standing r cm along the trunk's line is pushed over as the trunk passes its top: its angle from
// upright (radians) when the trunk is `a` from upright
export const pushed = (a, r, h) => Math.max(0, a - Math.asin(Math.min(1, (r * Math.cos(a)) / h)));
export const TREEMAN = { t0: C.human + 9, n: 8 };

// ---------- "feelings", "thoughts": the windows go dark, top floor first, half the towers on each word; then the plate
// towers telescope down into their plates (cap first) and the other towers hinge down flat, one after another
export const HALVES = { far: C.feelings, near: C.thoughts };
export const DARK = [["plate_far.tower", "far", 0], ["bottle", "far", 2], ["glass_far", "far", 4], ["watchtower_c", "far", 5], ["watchtower_b", "far", 7],
  ["plate_near.tower", "near", 0], ["glass_near", "near", 2], ["salt", "near", 4], ["pepper", "near", 5], ["basket", "near", 6]];
export const windowsAt = (half, lag, f) => 1 - smooth((f - HALVES[half] - lag) / 11);
export const TWINS = { t0: C.feelings + 32, n: 20, dir: [0, 1] };       // toward the viewer
export const TELE = { "plate_far.tower": C.feelings + 9, "plate_near.tower": C.thoughts + 7 };
export const teleAt = (name, i, f) => 1 - smoother((f - TELE[name] - 3 * (3 - i)) / 9);       // i: 0 to 2 the tiers, 3 the cap: the cap goes first
// the buildings (section 5's pop-ups) go the way the plate towers go: their windows go dark on "feelings" (they all stand
// in the far half), top floor first, one building a frame and a half after another; then each telescopes down into its
// cut in the cloth, the top box first, two frames apart. The cut stays in the cloth and fades with every other slot on
// "erased". bldg_01 goes first: it stands where the far glass comes down, and is in the cloth before the glass lands.
// The Twin Towers do not go down into the cloth. Their windows go dark with the rest; they stand dark while the others
// go (all are in the cloth 28 frames after "feelings"); then both close sideways the same way, as a pop-up box closes,
// slowly and with no bounce, and lie flat as two cards along the ground the skyline stood on. The cards fade on "erased".
export const BLDGS = (() => { let j = 0; return S5.BUILDINGS.map((b) => { const fold = b.end === "fold", k = fold ? 4 : j++; return { name: b.name, half: "far", fold, lag: 1 + 1.5 * k, t0: fold ? TWINS.t0 : HALVES.far + 9 + 2 * k }; }); })();
export const bldgTele = (t0, i, n, f) => 1 - smoother((f - t0 - 3 * (n - 1 - i)) / 9);       // i: the box, 0 the bottom one of n: the top box goes first
export const twinFold = (f) => smooth((f - TWINS.t0) / TWINS.n);       // a plain ease, no bounce: at its fastest 7 degrees a frame
// where each twin lies once it is flat: [x0, x1, z0, z1] on the cloth (the far wall face up, then the roof). The fence
// cards that come down on these two cards later ("history") land on top of them (skins/s10.js)
export const TWIN_CARDS = S5.BUILDINGS.filter((b) => b.end === "fold").map((b) => { const t = b.boxes[0], x = b.at[0] - t.w / 2, z = b.at[1] - t.d / 2; return [x, x + t.w, z, z + b.H + t.d]; });
// every volume that hinges down flat: when, how many frames, and the way its top comes down: toward open cloth, and
// across the frame where it can, so that from above a card lying down does not look like one still standing
export const FOLDS = [
  { name: "bottle", t0: C.feelings + 11, n: 12, dir: unit([0.04, 1]) },
  { name: "glass_far", t0: C.feelings + 15, n: 10, dir: unit([-0.95, 0.3]) },
  { name: "glass_near", t0: C.thoughts + 8, n: 10, dir: unit([-0.5, -0.87]) },
  { name: "salt", t0: C.thoughts + 11, n: 8, dir: unit([-1, -0.2]) },
  { name: "pepper", t0: C.thoughts + 13, n: 8, dir: unit([-1, 0.25]) },
  { name: "basket", t0: C.thoughts + 15, n: 9, dir: unit([-0.9, 0.45]) },
  // "memory": the watchtowers lie down along the chamfer, toward its middle (CH.t runs from corner a to corner b)
  { name: "watchtower_c", t0: C.memory, n: 10, dir: S5.CH.t.map((v) => -v) },
  { name: "watchtower_b", t0: C.memory + 3, n: 10, dir: S5.CH.t.slice() },
];

// ---------- "history": the fence cutlery hinges down flat, inward, onto the cloth, the nearest card first
export const FENCE = { t0: C.history, gap: 0.42, n: 9 };
export const fenceDown = (rank, f) => drop(f - FENCE.t0 - FENCE.gap * rank, FENCE.n);
// ---------- "memory": the bricks left at the fence hinge down, one after another
export const brickDown = (i, f) => drop(f - C.memory - 2 - 0.6 * i, 7);
// ---------- the standees of sections 5 and 6, should section 9 not have hidden them: they fall with its robots on "nobody"
export const standeeDown = (rank, f) => drop(f - C.nobody - 2 * rank, 8);

// ---------- "erased": every flat shape and every slot fades to blank cloth over 40 frames
export const FADE = { t0: C.erased, n: 40 };
export const fadeAt = (f) => 1 - smooth((f - FADE.t0) / FADE.n);
export const BARE = FADE.t0 + FADE.n;                                 // from here: the bare cloth, two plain plates, the candle

// ---------- "planet": the flame card hinges down on the wick and the light goes out; then the far plate is a pale disc
export const OUT = { sink: C.life, hinge: C.planet, n: 9, dark: C.planet + 4, nd: 10, pale: C.planet + 6, np: 18 };
export const hingeAt = (f) => smoother((f - OUT.hinge) / OUT.n);
export const litAt = (f) => 1 - smooth((f - OUT.dark) / OUT.nd);
export const sinkAt = (f) => smooth((f - OUT.sink) / (OUT.hinge - OUT.sink));       // the flame sinks from "life" to "planet"
export const paleAt = (f) => smooth((f - OUT.pale) / OUT.np);                        // the far plate comes out of the dark
// The end state is absolute, so the last frames do not depend on what the sections before leave: the two discs' own
// colour before the grade (linear), the room fill, and the grade (the picture is turned down, so the room beyond the
// table goes dark with the candle; cool; nearly without colour)
export const PALE = { far: [0.62, 0.59, 0.53], near: [0.05, 0.047, 0.042], fill: 0.4, expo: 0.65, tint: [0.77, 0.91, 1.19], sat: 0.3 };

// ---------- the camera: one rise and pull back from the join at f4315 to the widest frame of the film on "erased",
// then it drifts. It crosses the near fence line (z = 60.5) above the cutlery's tops (20 cm), looks left to the couple
// on "remind", right to the pine and the redwood on "species" and "human", and straightens as it goes wide.
const WIDE = { P: [-2, 178, 88], T: [-0.5, 0, -4] };                 // 63 degrees down: the cloth is 55 % of the frame's width at its near edge
export const CAM_KEYS = [
  joinKey(F0),
  { f: C.nobody, P: [-12.6, 5.4, 38.6], T: [1.2, 3, 10.4] },
  { f: 4350, P: [-12.6, 9, 41.5], T: [-3, 3, 11.5] },
  { f: 4362, P: [-12.5, 17, 50], T: [-9, 3, 12.5] },
  { f: 4375, P: [-12, 26, 61], T: [-15, 3, 13.5] },                   // over the near fence line, above the cutlery
  { f: C.remind, P: [-10.8, 35, 74], T: [-21, 2.5, 14] },
  { f: C.species, P: [-8, 60, 102], T: [8, 12, 10] },
  { f: C.human, P: [-7, 84, 107], T: [12, 8, -8] },
  { f: C.feelings, P: [-6, 113, 101], T: [6, 2, -6] },
  { f: C.thoughts, P: [-5.3, 132, 96], T: [3, 0, -5] },
  { f: C.history, P: [-4.5, 151, 91], T: [1, 0, -4.5] },
  { f: C.memory, P: [-4, 160, 89.5], T: [0.4, 0, -4.2] },
  { f: C.erased, P: WIDE.P, T: WIDE.T },
  { f: 4640, P: [-1.6, 182.5, 83.6], T: [-0.4, 0, -4.6] },             // then it drifts on up and over the table, 0.12 cm a frame, to the end
  { f: 4700, P: [-1.1, 187.7, 78.4], T: [-0.3, 0, -5.3] },
  { f: F1 + 8, P: [-0.5, 193.7, 72.5], T: [-0.2, 0, -6] },             // f4761 is the end of the film: no join, this key is mine
];
export const camAt = (f) => camFrom(CAM_KEYS, f, 0.5);

// ---------- hooks. Section 9 leaves the candle guttered and the picture grey-blue; whatever the flame, the fill and the
// grade are at f4314 is where this section starts, and it holds that to "life", whether or not the earlier sections'
// hooks hold their last state past their own frames. So each hook reads the film's value at f4314 and at f (story.js,
// loaded after this module, with this section's own hooks switched off) and returns the factor that makes the product
// what this section wants. Before f4315 every hook is "no change".
let STORY = null, busy = false, memo = null;
import("../story.js").then((m) => { STORY = m; }, () => {});
const others = (fn) => { busy = true; try { return fn(); } finally { busy = false; } };
const base = () => memo || (STORY ? (memo = { fl: STORY.flameAt(F0 - 1), fill: STORY.fillAt(F0 - 1), grade: STORY.gradeAt(F0 - 1), raw: S5.flameAt(F0 - 1) }) : null);
const flareAt = (f, b) => (b.fl.flare || 0) * litAt(f);
export function flame(f, fl) {
  if (f < F0 || busy) return fl;
  const b = base(); if (!b) return fl;
  const raw = S5.flameAt(f), s = sinkAt(f);
  fl.lx = raw.lx * (1 - 0.6 * s); fl.lz = raw.lz * (1 - 0.6 * s);
  fl.gain = raw.gain * (b.fl.gain / b.raw.gain) * (1 - 0.3 * s);       // the candle as section 9 left it; from "life" it sinks
  fl.h = raw.h * (b.fl.h / b.raw.h) * (1 - 0.35 * s);
  fl.lit = b.fl.lit * litAt(f); fl.hinge = Math.max(b.fl.hinge || 0, hingeAt(f)); fl.flare = flareAt(f, b);
  return fl;
}
export function fill(f) {
  if (f < F0 || busy) return 1;
  const b = base(); if (!b) return 1;
  const cur = others(() => STORY.fillAt(f)) || 1;
  return lerp(b.fill, PALE.fill, smooth((f - OUT.dark) / 24)) / cur;   // out: a faint fill, so the cloth is a shape in the dark
}
export function grade(f) {
  if (f < F0 || busy) return undefined;
  const b = base(); if (!b) return undefined;
  const cur = others(() => ({ g: STORY.gradeAt(f), flare: STORY.flameAt(f).flare || 0 })), k = smooth((f - OUT.dark) / 28);
  const hooks0 = b.grade.expo / (1 + 0.12 * (b.fl.flare || 0)), hooks = cur.g.expo / (1 + 0.12 * cur.flare);       // the other sections' grade hooks, without the flare's share
  return { expo: lerp(hooks0, PALE.expo, k) / hooks, tint: [0, 1, 2].map((i) => lerp(b.grade.tint[i], PALE.tint[i], k) / cur.g.tint[i]), sat: lerp(b.grade.sat, PALE.sat, k) / cur.g.sat };
}

export const BEATS = [
  [F0, "(join)", "the camera starts one rise and pull back; section 9's robots stand in their ranks"],
  [C.nobody, "nobody", "(section 9) the robots hinge down flat, the nearest first"],
  [C.remind, "remind", "(section 8) the couple hinge down at the left edge, the last standees to fall"],
  [C.species, "species", "the pine folds shut tier by tier from the top; then it lies down"],
  [C.human, "human", "the redwood hinges down into the city across the fence line, pushing the cutlery under it flat; the tree man folds beside it"],
  [C.feelings, "feelings", "the far half's windows go dark, top floor first; the far plate tower and the six buildings telescope down; the bottle and the far glass hinge down; the Twin Towers stand dark"],
  [C.thoughts, "thoughts", "the near half's windows go dark; the near plate tower telescopes down; the near glass, the shakers and the basket hinge down"],
  [TWINS.t0, "(thoughts)", "the Twin Towers close sideways like a pop-up box, both toward the viewer, and lie flat (20 frames)"],
  [C.history, "history", "the fence cutlery hinges down flat, the nearest card first, round the whole table"],
  [C.memory, "memory", "the watchtowers and the bricks lie down: every card lies in the cloth"],
  [C.erased, "erased", "every flat shape and every slot fades to blank cream cloth over 40 frames: the widest frame of the film"],
  [BARE, "(bare)", "a bare cloth, two plain plates, the candle"],
  [C.life, "life", "the flame sinks"],
  [C.planet, "planet", "the flame card hinges down on the wick and the light goes out"],
  [OUT.pale + OUT.np, "(hold)", "the far plate is a pale disc in the dark, in a faint cool fill; held to the end"],
  [F1 - 1, "end", "the pale disc"],
];
