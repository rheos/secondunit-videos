// s09.js: section 9, the last burst, f3840 to f4315. Its cue names, its events and its camera keys, every one a pure
// function of the film frame f (24 fps). The city of sections 5 to 7 stands; section 8's couple stand at the left edge.
// A card stem telescopes up out of a slot in the middle of the city carrying a shut honeycomb ball; on "burst" its
// leaves fan round the stem into a ball of colour; on "extinguished" the ball comes apart, top first, into torn scraps
// of its own paper that drift down going grey, the bare stem drops and the picture drains to grey-blue. Then every citizen card stands up, turns to its robot side and slides along its slot.
// This section's pieces act after f4315 too: the robots fall on "nobody" and fade into the cloth from "erased".
// Units: centimetres, y up, the cloth is y = 0, x to the right, z toward the viewer.
import { CUES } from "../cues/s09.js";                  // generated: $PY tools/onsets.py 09 (from tools/cues/s09.json)
import { clamp, lerp, smooth, smoother, spring, hash } from "../kit.js";
import { shots } from "./lib.js";
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
// one leaf's angle. On "extinguished" it does not shut: it comes apart (APART, below). The stem stands bare for about
// 12 frames after the last scrap has left it, then its sections drop into each other and it goes back through the slot.
export const BURST = { at: [0, 5], N: 14, R: 17.15, H: 31.45, th0: -0.72, spine: 31.4, L: 8.1, widths: [2.1, 1.7, 1.3, 0.9] };
export const APART = { spread: 14, hold: 20, landers: 60, last: C.future + 4 };      // frames the break takes, top to bottom; how much later the stem drops; how many scraps land; every scrap is gone by `last`
const DELTA = (2 * Math.PI) / BURST.N, UPS = [C.last - 6, C.last - 15, C.last - 24];      // section 0 (the widest, at the cloth) clicks out last
export function burstAt(f) {
  const a = smoother((f - C.sixties) / 22) * (1 - clamp((f - (E + 19 + APART.hold)) / 12) ** 2);                    // the spine through the slot
  const e = UPS.map((t, k) => spring(f - t, 0.6, 12) * (1 - smooth((f - (E + 10 + APART.hold + 3 * k)) / 6)));     // the three sections, 0 = at the cloth
  const Y = [0, 0, 0]; let y = 0; e.forEach((v, k) => { y += BURST.L * v; Y[k] = y; });
  const bottom = y - BURST.spine * (1 - a), open = spring(f - C.burst, 0.5, 18);
  return { a, e, Y, bottom, hub: bottom + BURST.spine / 2, open, apart: f >= E, phi: DELTA * clamp((f - C.burst) / (E - C.burst)),
    shown: f >= C.sixties - 1 && f < E + 32 + APART.hold, slot: clamp((f - (C.sixties - 10)) / 8), glow: clamp(open) * (1 - smooth((f - E) / 16)) };
}
// where leaf i points (radians about the stem), and how far it sits from the middle of the pack while the pack is shut
export function leafAt(i, b) {
  return { ang: BURST.th0 + b.phi + i * DELTA * b.open, off: (i - (BURST.N - 1) / 2) * 0.03 * (1 - clamp(b.open * 4)) };
}

// ---------- the ball comes apart. From "extinguished" every leaf is its scraps (the skin tears each leaf of the plate
// into about fifty). A scrap lets go at o.tb: the top of the ball first, the bottom 14 frames later. Then it is burnt
// paper: it drifts out from the stem and down, slowly, turning about its own axis, fluttering on its own two periods;
// it goes grey over 7 to 12 frames (the grade takes 24), curls and shrinks, and is gone in the air after o.life frames
// (the ones from the top live longest and travel furthest). APART.landers of them are carried instead to a place on
// the cloth, a tower's top or the fallen wall, turn flat as they come down, lie there, and shrink to nothing before
// `last`. Every number is seeded by the scrap's leaf and cell: no clock, no random call at render time.
// [x, y, z, yaw, tilt]: a flake on a tower lies on the side of its dome that faces the lens (a flat flake at the lens's own height is a line)
const TOPS = [[-19.66, 9.4, 12.84, -0.24, 0.4], [-24.23, 7.6, 11.73, -0.24, 0.6], [-17.23, 8.0, 13.43, -0.24, 0.6], [-9.15, 8.7, -1.63, -0.39, 0.5], [-12.64, 8.7, 2.37, -0.36, 0.5]];      // the basket (three), the salt, the pepper
const WALLS = [[-43.6, 0.2, 22], [-45.2, 0.2, 31], [-44.1, 0.2, 13.5]];                                             // on the fallen wall along the left edge
const KEEP_OFF = [[-21, 12, 9.6], [-9, -2, 4], [-12.5, 2, 4], [12, 30, 4.5], [0, 44, 9.6], [10.5, -16.5, 3.5]];     // footprints a flake may not lie in: [x, z, radius]
const clothSpot = (seed) => {       // a place on the open cloth, in the half of the table the lens goes down to
  for (let m = 0; m < 40; m++) { const a = 1.3 + 2.3 * hash(seed, 60 + 3 * m), r = 4 + 27 * Math.sqrt(hash(seed, 61 + 3 * m)), x = BURST.at[0] + r * Math.cos(a), z = BURST.at[1] + r * Math.sin(a);
    if (x > -38.5 && x < -9 && z > 22.2 && z < 31.8) continue;                          // where ranks 1 and 2 lie before they hinge up
    if (Math.abs(x) > 42 || Math.abs(z) > 62 || KEEP_OFF.some(([cx, cz, cr]) => Math.hypot(x - cx, z - cz) < cr)) continue;
    return [x, 0.07, z]; }
  return [BURST.at[0] - 6, 0.07, BURST.at[1] + 6];
};
// one scrap's numbers. c: the middle of its cell on the leaf, cm ([from the stem, up from the hub])
export function scrapOf(leaf, k, c) {
  const seed = 9001 + 977 * leaf + k, r = (n) => hash(seed, n), h = clamp(c[1] / BURST.H + 0.5), rho = clamp(c[0] / BURST.R), ta = 2 * Math.PI * r(14);
  return { leaf, k, c, h, rho, seed, land: null,
    tb: E + Math.max(0.05, APART.spread * (1 - h) ** 0.9 + 3 * (r(1) - 0.5)),
    out: (2.5 + 7.5 * h + 4 * r(2)) * (0.45 + 0.55 * rho), tau: 18 + 10 * r(3), side: 1.7 * (r(4) - 0.5), lift: (0.3 + 1.5 * r(5)) * h,
    vt: 0.45 + 0.45 * r(6), life: 18 + 24 * h + 12 * r(7),
    fl: [0.5 + 1.3 * r(8), 0.19 + 0.16 * r(9), 6.283 * r(10), 0.3 + 0.9 * r(11), 0.13 + 0.12 * r(12), 6.283 * r(13)],
    axis: [Math.cos(ta) * 0.94, Math.sin(ta) * 0.94, 0.34 * (r(15) < 0.5 ? -1 : 1)], w: (r(17) < 0.5 ? -1 : 1) * (0.05 + 0.1 * r(18)), w2: 0.09 * (r(19) - 0.5),
    g0: 4 * r(20), gd: 7 + 5 * r(21), ash: 0.45 + 0.6 * r(22), smin: 0.35 + 0.25 * r(23), curl: 1.2 + 2.8 * r(24), bend: Math.PI * r(25) };
}
// which of them land, and where (call once, with every scrap). The lower a scrap starts, the likelier it is to land.
export function landersOf(scraps, hub) {
  const pick = scraps.map((o) => [hash(o.seed, 30) / (0.22 + (1 - o.h)), o]).sort((a, b) => a[0] - b[0]).slice(0, APART.landers).map((p) => p[1]);
  pick.forEach((o, n) => { const r = (m) => hash(o.seed, m), T = n < TOPS.length ? TOPS[n] : n < TOPS.length + WALLS.length ? WALLS[n - TOPS.length] : clothSpot(o.seed);
    const y0 = hub + o.c[1], rank3 = T[0] > -38.5 && T[0] < -9 && T[2] > 18 && T[2] <= 22.2;
    o.land = { T, tilt: T[4] || 0, D: clamp((y0 - T[1]) / (0.72 + 0.3 * r(31)), 22, E + 59 - o.tb), yaw: T.length > 3 ? T[3] : 6.283 * r(32), gone: rank3 ? E + 60 + 8 * r(33) : E + 64 + 9.5 * r(33) };
    o.smin = 0.3 + 0.2 * r(23); o.curl = 0.7 + 1.1 * r(24); });
  return pick;
}
// a scrap at f. ang: where its leaf points; hub: the ball's middle over the cloth (both as they are at "extinguished").
// -> p (its middle, world), yaw and spin (it turns `spin` about o.axis in its own plane's frame, then `yaw` about the
// vertical), flat (0 to 1: turned to lie flat, at flatYaw, leaning `tilt` that way), s (size), grey, curl (radians of arc across it), on
export function scrapAt(o, f, ang, hub) {
  const t = f - o.tb, ca = Math.cos(ang), sa = Math.sin(ang), p0 = [BURST.at[0] + o.c[0] * ca, hub + o.c[1], BURST.at[1] - o.c[0] * sa];
  if (t <= 0) return { p: p0, yaw: ang, spin: 0, flat: 0, s: 1, grey: 0, curl: 0, on: true };
  const env = smooth(t / 12), th = t - 6 * (1 - Math.exp(-t / 6)), [a1, w1, p1, a2, w2, p2] = o.fl;       // th: the turning starts from rest
  let dx = ca + o.side * sa, dz = -sa + o.side * ca; const dl = Math.hypot(dx, dz); dx /= dl; dz /= dl;      // the way out: along its leaf, a little off it
  const s1 = a1 * Math.sin(w1 * t + p1) * env, s2 = a2 * Math.sin(w2 * t + p2) * env, bob = 0.35 * a1 * Math.sin(2 * w1 * t + p2) * env;
  const grey = smooth((t - o.g0) / o.gd), small = lerp(1, o.smin, smooth(t / 18)), lift = o.lift * (1 - Math.exp(-t / 5));
  if (!o.land) {
    const out = o.out * (1 - Math.exp(-t / o.tau)) + s2, fall = o.vt * (t - 10 * (1 - Math.exp(-t / 10)));
    return { p: [p0[0] + dx * out - dz * s1, p0[1] + lift - fall + bob, p0[2] + dz * out + dx * s1], yaw: ang + o.w2 * th, spin: o.w * th, flat: 0,
      s: small * (1 - smooth((t - (o.life - 10)) / 10)), grey, curl: o.curl * smooth(t / 20), on: t < o.life };
  }
  const L = o.land, u = clamp(t / L.D), k = 1 - (1 - u) ** 2, air = (1 - u) ** 1.5, flat = smooth((u - 0.5) / 0.5);
  return { p: [lerp(p0[0], L.T[0], k) + (dx * s2 - dz * s1) * air, p0[1] + (lift + bob) * air + (L.T[1] - p0[1]) * lerp(u * u, u, 0.7), lerp(p0[2], L.T[2], k) + (dz * s2 + dx * s1) * air],
    yaw: ang + o.w2 * th, spin: o.w * th, flat, flatYaw: L.yaw, tilt: L.tilt, s: small * (1 - smooth((f - L.gone) / 9)), grey, curl: o.curl * smooth(t / 20), on: f < L.gone + 9, landed: u >= 1 };
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

// ---------- the camera (camera pass, Nov 13 2026): one shot. The section CUTS in at F0 (section 8 ends on the dark room):
// the lens is already over the near left corner of the table, three-quarters on to the city, and comes slowly down and
// back into that corner while the slot is cut and the stem starts up on "1960s". This replaces cut 05's arc back from
// the dark room over the left fence (2 degrees a frame). From f3972 the keys are cut 05's, and the last is the join at F1
// (position, target and velocity), which section 10 continues from.
// Clearance: cut 05's lens stood 2.4 to 3 cm from fence_39 and fence_40 from f3942 to f4026. The four keys from f3972 to
// "burst" are 0.6 to 1 cm further in (x only); everything from "human" on is as it was.
const J1 = joinKey(F1), [bx, bz] = BURST.at;
const P72 = [-37.1, 11.4, 52.2], P90 = [-36.9, 12.3, 53.8];       // cut 05: [-38.1, 11.4, 52.2], [-37.9, 12.3, 53.8]
const hubT = (f, dy = 0) => [bx, burstAt(f).hub + dy, bz];
export const CAM_KEYS = [
  // f3840 to f3972: down and back into the corner, 0.1 cm a frame, looking at the place where the slot will be cut
  { f: F0, P: [-33.5, 22.5, 45], T: [bx, 5, bz] },
  { f: 3958, P: [-36.9, 12.3, 50.921], T: [bx, 5, bz] },             // z and T as cut 05 had them here, so f3972 to f3990 keeps its speed
  // f3968 to f4026: up with the stem and the shut ball
  { f: 3972, P: P72, T: [bx, 6, bz] },
  { f: 3990, P: P90, T: [bx, 15, bz] },
  { f: C.last, P: [-36.9, 14.5, 55.4], T: [bx, 27, bz] },            // cut 05: x -37.7
  { f: C.burst, P: [-37.2, 16, 56.4], T: [bx, 30, bz] },             // cut 05: x -37.8
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
const SHOTS = shots([{ f: F0, keys: CAM_KEYS, float: (f) => joinFloat(F0, F1, f) }], true);       // true: the section's first frame is a cut
export const CUTS = SHOTS.CUTS;
// f4082 to f4129 only: the lens stays up on the ball while it comes apart and tilts down after the first flakes, instead
// of going down with the stem. An offset on the target alone, zero (with its slope) at both ends: the path of the lens,
// its speed and every frame outside (E, beginning) are as they were.
export const LINGER = { dT: [0, 8, 0] };       // at its most (f4101) the target is 8 cm higher
const lingerAt = (f) => { const u = clamp((f - E) / (C.beginning - E)); return 28.94 * u * u * (1 - u) ** 3; };       // 1 at u = 0.4; it lets go gently
// f4268 to f4378 (this section's last frames and section 10's first): a sidestep away from the near plate tower. The join
// at f4315 (joins.js, not this file's) stands 2.6 cm from the tower's bottom tier, and cut 05 passed the tier at 2.3 to
// 3 cm from f4311 to f4344. Both sections add this same offset to the lens after the spline (section 10 imports it), so
// this section still ends on joinKey(F1), section 10 still starts from it, and the move is unbroken across f4315. It
// comes on over 46 frames and goes over 36, with no slope at either end, so the speed of the move changes by at most
// 0.04 cm a frame. If the join is ever moved clear in joins.js, set d to zero.
export const TOWER = { f0: 4268, on: 46, f1: 4342, off: 36, d: [-1.18, 0, -0.55] };       // 1.3 cm, straight out from the tower's middle
export const towerClear = (f) => { const w = smooth((f - TOWER.f0) / TOWER.on) * (1 - smooth((f - TOWER.f1) / TOWER.off)); return TOWER.d.map((v) => v * w); };
export const camAt = (f) => {
  const c = SHOTS.camAt(f);
  if (f > E && f < C.beginning) { const w = lingerAt(f); c.T = c.T.map((v, i) => v + w * LINGER.dT[i]); }
  if (f > TOWER.f0) { const d = towerClear(f); c.P = c.P.map((v, i) => v + d[i]); }
  return c;
};

export const BEATS = [
  [F0, "(See)", "a cut from the dark room to the table, three-quarters on from over its near left corner; the lens comes slowly down into the corner"],
  [C.sixties, "1960s", "the shut ball comes up through its slot on a card spine; three sections telescope up under it"],
  [C.last, "last", "the last section clicks out: the hub stands 40 cm over the cloth"],
  [C.burst, "burst", "fourteen leaves fan round the stem into a ball 34 cm across, with overshoot; its colour falls on the cloth and the towers"],
  [C.human, "human", "the open ball turns slowly: the key image"],
  [E, "extinguished", "the ball comes apart from the top down into torn scraps of its own paper, which drift down going grey; a few dozen land and shrink to nothing; the bare stem drops; the candle gutters to a third, the colour drains to grey-blue over 24 frames"],
  [C.beginning, "beginning", "three slots are cut across the cloth; two ranks of eight hinge up, and the fallen citizens and guards stand up"],
  [C.future, "future", "the third rank hinges up; the citizens who went home hinge up at the heads of their slots"],
  [C.robots, "robots", "every card turns, edge-on for two frames, to its robot side"],
  [C.walking, "walking", "the robots slide in step along their slots, rocking on one beat"],
  [C.nothing1, "nothing", "every robot stops dead for six frames, then goes on"],
  [C.nothing2, "nothing", "every robot stops dead for six frames, then goes on"],
  [C.nobody, "nobody", "(section 10's frames) the robots hinge down flat, the nearest first, two frames apart"],
  [C.erased, "erased", "(section 10's frames) the fallen robots and their slots fade into the cloth over 40 frames"],
];
