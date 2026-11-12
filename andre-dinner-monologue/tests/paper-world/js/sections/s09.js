// s09.js: section 9, the last burst, f3840 to f4315. Its cue names, its events and its camera keys, every one a pure
// function of the film frame f (24 fps). The city of sections 5 to 7 stands; section 8's couple stand at the left edge.
// A card stem telescopes up out of a slot in the middle of the city carrying a shut honeycomb ball; on "burst" its
// leaves fan round the stem into a ball of colour; on "extinguished" they fan shut, the stem drops and the picture
// drains to grey-blue. Then every citizen card stands up, turns to its robot side and slides along its slot.
// This section's pieces act after f4315 too: the robots fall on "nobody" and fade into the cloth from "erased".
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import { CUES } from "../cues/s09.js";                  // generated: $PY tools/onsets.py 09 (from tools/cues/s09.json)
import { clamp, lerp, smooth, smoother, spring } from "../kit.js";
import { camFrom, camRaw } from "./lib.js";
import { joinKey, joinFloat } from "./joins.js";
import * as S5 from "./s05.js";
export { CUES };

export const F0 = 3840, F1 = 4315;
const c = (k) => CUES[k].f;
export const C = {
  sixties: c("sixties"), last: c("last"), burst: c("burst"), human: c("human"), extinguished: c("extinguished"),
  beginning: c("beginning"), future: c("future"), robots: c("robots"), walking: c("walking"), feeling: c("feeling"),
  nothing1: c("nothing1"), thinking: c("thinking"), nothing2: c("nothing2"), nobody: c("nobody"), erased: c("erased"),
};
const E = C.extinguished;

// ---------- the burst. A cross of card strips stands in a slot at the middle of the city. The shut ball (fourteen
// half-disc leaves pressed into one flat pack) comes up through the slot edge-on on its spine, then three wider
// sections telescope up under it, the widest last, on "last". The hub of the ball ends 40 cm over the cloth.
// On "burst" leaf i swings round the spine to i / 14 of a turn (damping 0.5: it overshoots); open, the ball turns by
// one leaf's angle, so the last leaf has come the whole way round to the slot's line; on "extinguished" the others
// follow it round and the pack is shut over that line again in 10 frames, and drops back through the slot.
export const BURST = { at: [0, 5], N: 14, R: 17.15, H: 31.45, th0: -0.72, spine: 31.4, L: 8.1, widths: [2.1, 1.7, 1.3, 0.9] };
const DELTA = (2 * Math.PI) / BURST.N, UPS = [C.last - 6, C.last - 15, C.last - 24];      // section 0 (the widest, at the cloth) clicks out last
export function burstAt(f) {
  const a = smoother((f - C.sixties) / 22) * (1 - clamp((f - (E + 19)) / 12) ** 2);                    // the spine and its pack through the slot
  const e = UPS.map((t, k) => spring(f - t, 0.6, 12) * (1 - smooth((f - (E + 10 + 3 * k)) / 6)));     // the three sections, 0 = at the cloth
  const Y = [0, 0, 0]; let y = 0; e.forEach((v, k) => { y += BURST.L * v; Y[k] = y; });
  const bottom = y - BURST.spine * (1 - a), shut = f >= E;
  const open = shut ? 1 - smooth((f - E) / 10) : spring(f - C.burst, 0.5, 18);
  return { a, e, Y, bottom, hub: bottom + BURST.spine / 2, open, shut, phi: DELTA * clamp((f - C.burst) / (E - C.burst)),
    shown: f >= C.sixties - 1 && f < E + 32, slot: clamp((f - (C.sixties - 10)) / 8), glow: clamp(open) };
}
// where leaf i points (radians about the stem), and how far it sits from the middle of the pack while the pack is shut
export function leafAt(i, b) {
  const ang = b.shut ? BURST.th0 + 2 * Math.PI - (BURST.N - 1 - i) * DELTA * b.open : BURST.th0 + b.phi + i * DELTA * b.open;
  return { ang, off: (i - (BURST.N - 1) / 2) * 0.03 * (1 - clamp(b.open * 4)) };
}

// ---------- the ranks: three new slots across the open cloth, eight cards on each, 3.3 cm apart. They hinge up as
// citizens ("beginning", "future"), turn to their robot side on "robots", slide in step from "walking", stop dead for
// six frames on each "nothing", fall from "nobody" and fade from "erased".
export const VR = 0.18, VO = 0.09, GAP = 3.3;                         // cm a frame: the ranks; the sixteen cards of sections 5 and 6
export const RANKS = [27, 23, 19].map((z, r) => { const x0 = -35 + (r % 2) * 1.65; return { r, z, x0, a: [x0 - 1.6, z], b: [x0 + 7 * GAP + VR * 122 + 1.2, z], cut: C.beginning - 4 + 5 * r }; });
const STOPS = [C.nothing1, C.nothing2];
export const moving = (f) => f >= C.walking && !STOPS.some((s) => f >= s && f < s + 6);
export const moved = (f) => { let m = Math.max(0, f - C.walking); for (const s of STOPS) m -= clamp(f - s, 0, 6); return m; };      // frames spent sliding by f
const drop = (t) => (t <= 0 ? 0 : t < 9 ? (t / 9) ** 2 : 1 - 0.06 * Math.exp(-(t - 9) / 3) * Math.abs(Math.sin((Math.PI * (t - 9)) / 5)));
// one card's state at f. o: { up, turn, fall (frames), v (cm a frame) }
export function cardAt(o, f) {
  const g = f - (f & 1), gm = Math.min(g, o.fall);                    // posed on twos
  return { g, shown: f >= o.up - 1, up: spring(g - o.up, 0.6, 14), turn: clamp((g - o.turn) / 8), robot: g >= o.turn + 4,
    s: o.v * moved(gm), walk: moving(g) && g < o.fall ? 1 : 0, fall: drop(f - o.fall), fade: clamp((f - C.erased) / 40) };
}
export const rankCard = (r, j) => ({ up: (r < 2 ? C.beginning + 8 + 12 * r : C.future) + 2 * j, turn: C.robots + 2 * r, fall: C.nobody + 6 * r + 2 * j, v: VR });
// the sixteen of sections 5 and 6 (k: 0 to 15 in the order they stand up): those lying by the fallen wall on
// "beginning", those folded away at the heads of their home slots on "future"
export const oldCard = (k, lying) => ({ up: (lying ? C.beginning + 2 : C.future + 2) + 2 * (k % 8), turn: C.robots + 2 * (k % 3), fall: C.nobody + 4 + Math.round(1.5 * k), v: VO });

// ---------- light. The candle of section 7's flare is eased to a settled flame over the first 60 frames (whatever
// section 8 leaves); on "extinguished" it gutters to a third and the picture drains to grey-blue over 24 frames.
// The three hooks hold their last state past f4315 (as section 7's do), so section 10 scales from there.
export const GUTTER = 1 / 3, DRAIN = { frames: 24, sat: 0.3, tint: [0.83, 0.95, 1.13], expo: 1.3 };
export const drainAt = (f) => smooth((f - E) / DRAIN.frames);
export function flame(f, fl) {
  if (f < F0) return fl;
  const base = S5.flameAt(f), s = smooth((f - F0) / 60), t = f - E;
  fl.gain = lerp(fl.gain, base.gain * 1.2, s); fl.h = lerp(fl.h, base.h * 1.1, s); fl.flare = lerp(fl.flare || 0, 0.2, s);
  if (t > 0) { const d = smooth(t / 12), flutter = 0.16 * Math.sin(t * 1.7) * Math.exp(-t / 9) * (t < 40 ? 1 : 0);
    fl.lit = clamp(lerp(1, GUTTER, d) + flutter, 0, 0.999); fl.h *= lerp(1, 0.58, d) * (1 + 1.2 * flutter); fl.flare *= 1 - d; }
  return fl;
}
export const fill = (f) => (f < E ? 1 : lerp(1, 0.8, drainAt(f)));
export const grade = (f) => { if (f < E) return null; const d = drainAt(f); return { expo: lerp(1, DRAIN.expo, d), tint: DRAIN.tint.map((v) => lerp(1, v, d)), sat: lerp(1, DRAIN.sat, d) }; };

// ---------- the camera: the first key is the join at F0, the last is the join at F1 (position, target and velocity).
// f3840 to f3958: one arc. It turns from the dark room through the far end of the table to the middle of the city while
// it rises over the cutlery of the left fence (26 cm; the cards are 20) and swoops down inside it to 11 cm.
const J0 = joinKey(F0), J1 = joinKey(F1), [bx, bz] = BURST.at;
const P72 = [-38.1, 11.4, 52.2], P90 = [-37.9, 12.3, 53.8];
const P_ARC = [J0, { f: 3862, P: [-58.6, 20.5, 20.5] }, { f: 3884, P: [-55, 24, 27] }, { f: 3904, P: [-48.5, 26.5, 34] }, { f: 3922, P: [-41.5, 26.5, 40.5] },
  { f: 3940, P: [-38.5, 21.5, 46.5] }, { f: 3956, P: [-37.9, 15.2, 50.6] }, { f: 3972, P: P72 }, { f: 3990, P: P90 }].map((k) => ({ T: [0, 0, 0], ...k }));
const ARC1 = 3958, pArc = (f) => camRaw(P_ARC, f).P, pEnd = pArc(ARC1);
const PHI0 = Math.atan2(J0.T[2] - J0.P[2], J0.T[0] - J0.P[0]) + 2 * Math.PI, PHI1 = Math.atan2(bz - pEnd[2], bx - pEnd[0]) + 2 * Math.PI;
const D0 = Math.hypot(J0.T[0] - J0.P[0], J0.T[2] - J0.P[2]), D1 = Math.hypot(bx - pEnd[0], bz - pEnd[2]);
const arcKey = (f) => { const u = smoother((f - F0) / (ARC1 - F0)), P = pArc(f), phi = lerp(PHI0, PHI1, u), d = lerp(D0, D1, u); return { f, P, T: [P[0] + d * Math.cos(phi), lerp(J0.T[1], 5, u), P[2] + d * Math.sin(phi)] }; };
const hubT = (f, dy = 0) => [bx, burstAt(f).hub + dy, bz];
export const CAM_KEYS = [
  J0,
  ...Array.from({ length: 14 }, (_, i) => arcKey(F0 + 8 * (i + 1))), arcKey(ARC1),
  // f3968 to f4026: up with the stem and the shut ball
  { f: 3972, P: P72, T: [bx, 6, bz] },
  { f: 3990, P: P90, T: [bx, 15, bz] },
  { f: C.last, P: [-37.7, 14.5, 55.4], T: [bx, 27, bz] },
  { f: C.burst, P: [-37.8, 16, 56.4], T: [bx, 30, bz] },
  // f4026 to f4082: holds on the open ball, drifting up and round it: the key image
  { f: C.human, P: [-36.6, 18, 56.9], T: [bx, 31, bz] },
  { f: E, P: [-33.6, 20, 57], T: [bx, 31.5, bz] },
  // f4082 to f4229: down with the stem to the slots, to slot height beside the ranks
  { f: E + 24, P: [-31.5, 17, 54], T: [-4, 14, 9] },
  { f: C.beginning, P: [-30, 12.5, 50], T: [-17, 4, 21] },
  { f: C.future, P: [-28.5, 7.6, 45], T: [-19, 2.8, 23] },
  { f: 4195, P: [-27.5, 5.2, 41.5], T: [-17.5, 2.5, 23] },
  { f: C.robots, P: [-26, 4.5, 39.6], T: [-16.5, 2.4, 23] },
  // f4229 to f4315: at slot height; the files slide past the lens
  { f: C.walking, P: [-24.6, 4.3, 39.1], T: [-15, 2.4, 22.5] },
  { f: C.feeling, P: [-20, 4.1, 38], T: [-9, 2.6, 18] },
  { f: C.thinking, P: [-15, 4, 37], T: [-2, 2.9, 12.5] },
  J1,
];
export const camAt = (f) => camFrom(CAM_KEYS, f, joinFloat(F0, F1, f));

export const BEATS = [
  [F0, "(See)", "the camera turns back from the dark room to the table in one arc, over the left fence"],
  [C.sixties, "1960s", "the shut ball comes up through its slot on a card spine; three sections telescope up under it"],
  [C.last, "last", "the last section clicks out: the hub stands 40 cm over the cloth"],
  [C.burst, "burst", "fourteen leaves fan round the stem into a ball 34 cm across, with overshoot; its colour falls on the cloth and the towers"],
  [C.human, "human", "the open ball turns slowly: the key image"],
  [E, "extinguished", "the leaves fan shut in 10 frames, the stem drops, the candle gutters to a third, the colour drains to grey-blue over 24 frames"],
  [C.beginning, "beginning", "three slots are cut across the cloth; two ranks of eight hinge up, and the fallen citizens and guards stand up"],
  [C.future, "future", "the third rank hinges up; the citizens who went home hinge up at the heads of their slots"],
  [C.robots, "robots", "every card turns, edge-on for two frames, to its robot side"],
  [C.walking, "walking", "the robots slide in step along their slots, rocking on one beat"],
  [C.nothing1, "nothing", "every robot stops dead for six frames, then goes on"],
  [C.nothing2, "nothing", "every robot stops dead for six frames, then goes on"],
  [C.nobody, "nobody", "(section 10's frames) the robots hinge down flat, the nearest first, two frames apart"],
  [C.erased, "erased", "(section 10's frames) the fallen robots and their slots fade into the cloth over 40 frames"],
];
