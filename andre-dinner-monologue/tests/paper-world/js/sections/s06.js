// s06.js: section 6, the camp, f2544 to f3130. Its cue names, its events and its camera keys, all pure functions
// of the film frame. The city of section 5 stands (s05.js holds its last state); this section builds the wall round
// it, turns five citizens into guards and stands the split head up beside the candle.
// The wall the camera works is the chamfer: the long diagonal of the fence across the far right corner. It is the only
// stretch with cloth outside it (the triangle where the redwood stands), with the candle 26 cm behind it and the lit
// towers right behind the cutlery. (u, v) below are centimetres along that wall and out from the fence line.
import { CUES } from "../cues.js";
import { clamp, lerp, smooth, smoother, spring } from "../kit.js";
import { leg, walker, camRaw, camFrom, handover, hermite } from "./lib.js";
import * as S5 from "./s05.js";

export const F0 = 2544, F1 = 3130;
const c = (k) => CUES[k].f;
export const C = {
  think: c("think"), camp: c("camp"), camp2: c("camp2"), built: c("built"), themselves: c("themselves"), guards: c("guards"), pride: c("pride"),
  prison1: c("prison1"), schizophrenia: c("schizophrenia"), guards2: c("guards2"), prisoners: c("prisoners"), result: c("result"),
  lobotomized: c("lobotomized"), see: c("see"), prison2: c("prison2"),
};
const { CH } = S5, O = [CH.c * CH.n[0], CH.c * CH.n[1]];
export const chP = (u, v) => [O[0] + u * CH.t[0] + v * CH.n[0], O[1] + u * CH.t[1] + v * CH.n[1]];           // (u, v) -> (x, z)
export const chUV = ([x, z]) => [CH.t[0] * (x - O[0]) + CH.t[1] * (z - O[1]), CH.n[0] * x + CH.n[1] * z - CH.c];
const GATE_U = chUV(S5.GATE)[0];                                    // -6.7: where the tree man walked out; the crew use it too

// ---------- the wall: 26 segments just outside the cutlery, round the whole table. Each rises through a slit in the
// cloth (a lift: 12 frames and a settle), dealt from the first one both ways round the table edge.
export const WALL = { H: 7, off: 1.2, hw: 41.7, hd: 61.7, lift: 12 };
const uB = (-WALL.hd - O[1] - WALL.off * CH.n[1]) / CH.t[1], uC = (WALL.hw - O[0] - WALL.off * CH.n[0]) / CH.t[0];
const cB = chP(uB, WALL.off), cC = chP(uC, WALL.off), cD = [WALL.hw, WALL.hd], cE = [-WALL.hw, WALL.hd], cA = [-WALL.hw, -WALL.hd];
export const WALL_CORNERS = { A: cA, B: cB, C: cC, D: cD, E: cE, uB, uC };
const SIDES = [["front", cB, cC, 4], ["right", cC, cD, 6], ["near", cD, cE, 5], ["left", cE, cA, 8], ["far", cA, cB, 3]];
export const HERO = 2, FIRST = 3;                                    // front segments 0..3 run from corner B (far edge) to corner C (right edge)
export const SEGS = [];
for (const [side, a, b, n] of SIDES) for (let k = 0; k < n; k++) {
  const p = [lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)], q = [lerp(a[0], b[0], (k + 1) / n), lerp(a[1], b[1], (k + 1) / n)];
  const w = Math.hypot(q[0] - p[0], q[1] - p[1]), d = [(q[0] - p[0]) / w, (q[1] - p[1]) / w], nrm = [d[1], -d[0]];       // outward
  SEGS.push({ i: SEGS.length, side, k, a: p, b: q, w, n: nrm, mid: [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], yaw: Math.atan2(nrm[0], nrm[1]) });
}
// the deal: the first segment on "camp", the hero wall on "built" once its crew are out through the gate, then the rest
// of the front; the other way round the table from the first, one every 3.6 frames
SEGS[FIRST].t0 = C.camp; SEGS[HERO].t0 = C.built; SEGS[1].t0 = C.themselves; SEGS[0].t0 = C.themselves + 10;
for (let i = 4; i < SEGS.length; i++) SEGS[i].t0 = Math.round(C.camp + 6 + 3.6 * (i - 4));
SEGS.forEach((s) => { s.from = s.i === FIRST ? 0 : s.i < FIRST ? 1 : -1; });     // which end its slit is cut from (+1: from b, the end nearer the first)
export const liftAt = (t) => (t <= 0 ? 0 : t < WALL.lift ? 1 - (1 - t / WALL.lift) ** 3 : 1 + 0.035 * Math.exp(-(t - WALL.lift) / 5) * Math.sin(((t - WALL.lift) * Math.PI) / 5));
export const wallAt = (i, f) => ({ slit: clamp((f - (SEGS[i].t0 - 6)) / 5), up: liftAt(f - SEGS[i].t0) });
export const TOWERS = [{ name: "watchtower_c", at: chP(uC + 0.2, WALL.off + 0.3), t0: C.camp + 7, out: [1, 0] }, { name: "watchtower_b", at: chP(uB - 0.2, WALL.off + 0.3), t0: C.themselves + 16, out: [0, -1] }];
export const towerAt = (k, f) => ({ up: spring(f - TOWERS[k].t0, 0.6, 18), lamp: smooth((f - TOWERS[k].t0 - 12) / 14) });

// ---------- the crew. Every citizen comes out again on its section 5 slot, pushing a brick. Eight go on through a gap
// in the cutlery to the foot of the front wall: five stand against the hero segment (they turn into guards on "guards"
// and rise onto the wall on "pride"), three carry bricks to and fro along its foot. The other eight push their bricks to
// the fence where they stopped in section 5 and go home again.
const VC = 2.1 / 12, LANE = 3.3, FOOT = 1.75;
const turnAt = (k) => C.guards + 3 * k, riseAt = (k) => C.pride + 2 * k;
export const GUARD_Y = WALL.H - 0.42;                               // how far up the wall a guard is once the wall has fallen flat (section 9 reads it)
// On "pride" a guard stands on top of the wall, not on a rod up its face: the card drops through the slot it stands in
// (6 frames, ending on the cue), passes under the table, and rises behind the battlements through the wall's top (12
// frames and a settle), its boots on the floor of a crenel. Nothing is in front of the bricks.
const HERO_U1 = uB + 3 * (uC - uB) / 4, HERO_W = (uC - uB) / 4;      // the hero segment's right-hand end (seen from outside) and its width
export const GUARD_TOP = { y: WALL.H - 0.97 - 0.04, back: 0.2, sink: 6, drop: 4.5, rise: 4.4,
  u: [1226, 974.5, 720.5, 464.5, 210].map((px) => HERO_U1 - (px / 1438) * HERO_W) };      // the five crenels of the wall_segment plate, guard 0 first
// The deal: nothing lies flat on the cloth. Each card is hidden until its hinge starts, springs up from the head of its
// slot (damping 0.6), one card every two frames. H[i] is citizen i's frame; a home citizen leaves ten frames later.
const DEAL = { 3: 2545, 8: 2547, 5: 2549, 10: 2551, 6: 2553, 11: 2555, 4: 2557, 9: 2559, 7: 2561, 12: 2563, 1: 2565, 2: 2567, 14: 2569, 13: 2571, 16: 2577, 15: 2583 };
function crewDef(i, o) {
  const w5 = S5.CITIZENS[i - 1], A = w5.legs[0].path.pts, v = VC * o.pace;
  const B = leg([A[A.length - 1], ...o.out.map(([u, vv]) => chP(u, vv))], { end: o.arrive, v });
  const legs = [leg(A, { end: B.fa - 2, v }), B], turns = [];
  if (o.patrol) {            // a bricklayer: along the foot of the wall and back, a turn of the card at each end, until the wall comes down
    const u0 = o.out[o.out.length - 1][0], u1 = o.patrol.to, P = [chP(u0, LANE), chP((u0 + u1) / 2, LANE + 0.15), chP(u1, LANE)]; let t = o.patrol.start, fwd = true;
    while (t < 3300) { turns.push({ f: Math.round(t - 12) }); const L = leg(fwd ? P : P.slice().reverse(), { start: t, v: VC * 1.1 }); legs.push(L); t = L.fb + 30; fwd = !fwd; }
  }
  const w = walker({ name: w5.name, legs, turns: o.guard !== undefined ? [{ f: turnAt(o.guard) }] : turns, show: [DEAL[i], 1e9] });
  return { i, w, role: o.guard !== undefined ? "guard" : "layer", k: o.guard, arrive: o.arrive, popT: DEAL[i], legB: B };
}
function homeDef(i, arrive, stay, pace = 1.25) {
  const w5 = S5.CITIZENS[i - 1], A = w5.legs[0].path.pts, v = VC * pace, start = DEAL[i] + 10;
  const out = leg(A, { start, v }), t = Math.max(arrive, out.fb) + stay, back = leg(A.slice().reverse(), { start: t + 8, v });
  const w = walker({ name: w5.name, legs: [out, back], turns: [{ f: Math.round(t) }], show: [DEAL[i], back.fb + 10] });
  return { i, w, role: "home", arrive: out.fb, popT: DEAL[i], downT: back.fb + 1, s5until: w5.show[1] };
}
const G = GATE_U;
export const CREW = [
  // through the gate, the furthest station first; the middle one comes along the lane from the gap in the first segment
  crewDef(10, { guard: 0, pace: 1.6, arrive: 2652, out: [[G + 2.2, -1.5], [G + 0.5, -1.1], [G, 0.2], [G - 0.3, 1.5], [G - 2, 1.95], [-11.8, FOOT]] }),
  crewDef(1, { guard: 1, pace: 1.6, arrive: 2656, out: [[G + 1.6, -1.5], [G + 0.3, -1.0], [G, 0.2], [G - 0.3, 1.4], [G - 1.2, 1.9], [-9.6, FOOT]] }),
  crewDef(3, { guard: 2, pace: 1.75, arrive: C.camp, out: [[8.0, -0.9], [7.7, 0.4], [7.3, 2.2], [5.6, LANE]] }),
  crewDef(2, { guard: 3, pace: 1.8, arrive: 2673, out: [[1, -1.6], [-3.5, -1.7], [G + 1.4, -1.3], [G, 0.2], [G + 0.25, 1.3], [G + 0.8, 1.85], [-5.2, FOOT]] }),
  crewDef(11, { guard: 4, pace: 1.8, arrive: 2665, out: [[0, -1.6], [-4, -1.7], [G + 1.4, -1.3], [G, 0.2], [G + 0.4, 1.5], [G + 1.8, 1.95], [-3.0, FOOT]] }),
  // three bricklayers through the gap further along, the furthest station first; from "pride" they carry their bricks in a row under the guards
  crewDef(8, { pace: 1.75, arrive: 2686, patrol: { start: 2766, to: -1.5 }, out: [[-14, -1.7], [-19, -1.7], [-20.6, -1.2], [-21.1, 0.2], [-20.7, 2.0], [-19.5, 3.2], [-16, LANE + 0.2], [-13, LANE]] }),
  crewDef(9, { pace: 1.35, arrive: 2695, patrol: { start: 2767, to: -4 }, out: [[-18.5, -1.6], [-20.4, -1.2], [-21.1, 0.2], [-20.8, 1.9], [-19.4, 3.1], [-15.5, LANE]] }),
  crewDef(4, { pace: 1.05, arrive: 2702, patrol: { start: 2768, to: -6.5 }, out: [[-21.9, -1.1], [-21.1, 0.2], [-20.9, 1.9], [-20, 3.1], [-18, LANE]] }),
  ...[[5, 25], [6, 12], [7, 18], [12, 12], [13, 24], [14, 17], [15, 11], [16, 4]].map(([i, seg], k) => homeDef(i, SEGS[seg].t0, 70 + 9 * k)),
].sort((a, b) => a.i - b.i);
// citizen 3 brings the first brick out through the gap in the first segment (the wall rises behind it on "camp"), then
// slides on along the lane to the middle station
{ const d = CREW[2], last = chUV(d.legB.path.at(d.legB.path.len));
  d.w.legs.push(leg([chP(last[0], last[1]), chP(2, LANE + 0.1), chP(-4.6, LANE), chP(-6.3, 2.6), chP(-7.4, FOOT)], { start: C.camp + 12, v: VC * 1.2 })); d.arrive = Math.round(d.w.legs[2].fb); }
export function citizenAt(i, f) {
  const d = CREW[i], g = f - ((f - F0) & 1);
  if (d.role === "home" && f <= d.s5until) { const s = S5.citizenAt(i, f); if (s.pop < 0.02) s.visible = false; return s; }        // still on its way home from section 5; never drawn lying flat
  const s = d.w.at(f); s.y = 0; s.lean = 0; s.hitch = 0;
  const dn = d.downT ? 1 - smooth((g - d.downT) / 8) : 1;
  s.pop = spring(g - d.popT, 0.6, 14) * dn; if (g <= d.popT || dn < 0.02) s.visible = false;       // hinges up on a spring; hidden while it would lie flat
  s.role = d.role; s.carry = d.role === "layer" || (d.role === "home" ? g < d.arrive + 1 : g < d.arrive);
  if (d.role === "guard") {
    const tt = turnAt(d.k), tr = riseAt(d.k), r = g - tr;
    s.guard = g >= tt + 4;                                           // the card is edge-on at tt + 4 and tt + 5: the back is the guard
    s.turning = g >= tt && g < tt + 8;
    s.sink = GUARD_TOP.drop * smoother((r + GUARD_TOP.sink) / GUARD_TOP.sink);      // down through its slot, under by "pride"
    s.wall = r > 0;                                                  // behind the battlements from "pride" on
    if (s.wall) { s.wu = GUARD_TOP.u[d.k]; s.wy = GUARD_TOP.y - GUARD_TOP.rise * (1 - (r < 12 ? smoother(r / 12) : 1)); }
    if (r >= 12) s.rest = r - 12;                                    // lands and settles with one small rock
  }
  return s;
}
export const delivered = (i, f) => { const d = CREW[i]; return d.role !== "layer" && f >= d.arrive + (d.role === "home" ? 1 : 0); };      // the brick stays where it was pushed
// where a citizen's brick is left: 1.35 cm ahead of where it stopped
export function brickSpot(i) { const d = CREW[i], L = d.role === "guard" && d.w.legs.length > 2 ? d.w.legs[2] : d.role === "home" ? d.w.legs[0] : d.legB, p = L.path.pose(L.path.len); return { x: p.x + p.hx * 1.35, z: p.z + p.hz * 1.35, yaw: Math.atan2(-p.hz, p.hx) }; }

// ---------- the tree man backs away from the wall as it comes: a half turn, then along a new slot to the far end of the triangle
const tm5 = S5.TM.legs[2].path, e5 = tm5.pose(tm5.len), TM_T = C.think + 2;
const legD = leg([[e5.x, e5.z], [e5.x + e5.hx * 2.2, e5.z + e5.hz * 2.2], chP(-8.6, 10.4), chP(-18, 10.2), chP(-27, 9.4)], { start: TM_T + 10, v: (2.6 / 12) * 1.25 });
export const TM6 = walker({ name: "treeman", legs: [legD], turns: [{ f: -1e8 }, { f: TM_T }, { f: Math.round(legD.fb) + 14 }] });
export const TM_SLOT = legD;
export function treemanAt(f) { if (f < TM_T) return S5.treemanAt(f); const s = TM6.at(f); s.y = 0; s.lean = 0; s.hitch = 0; s.hop = 0; return s; }

// ---------- the head: two layers 3 mm apart, capped in front, bare behind. It lies face down as a flap of the cloth
// and hinges up; a pull-tab slides the layers apart on "schizophrenia"; the crown lifts on "lobotomized"; a band of
// bricks is drawn out of a slit at the back of the head across the eyes from "see" to "prison".
export const HEAD = { at: [23.7, -7.2], h: 34, t0: C.prison1 + 13, eyeY: 22.3, part: 7 };
const bump = (t, d = 10) => (t > 0 && t < d ? Math.sin((Math.PI * t) / d) : 0);
export function headAt(f) {
  const apart = smoother((f - C.schizophrenia) / 13) * (1 - smoother((f - C.result) / 13));
  return {
    up: spring(f - HEAD.t0, 0.62, 24), shown: f >= HEAD.t0,
    capped: (HEAD.part / 2) * apart + 0.7 * bump(f - C.guards2), bare: -(HEAD.part / 2) * apart - 0.7 * bump(f - C.prisoners),   // the two nudges
    tab: apart, lid: spring(f - BRAIN.t0, 0.6, 20), band: smoother((f - C.see) / (C.prison2 - C.see)),
  };
}
// ---------- the brain: the painted plate, 13 cm long, standing in the hollow of the bare head behind its face, tilted
// along the skull's cut so its dome stands 4.5 cm above the rim. The crown lifts 24 frames before "lobotomized", so it
// is seen whole before the word. On the word a dashed cut runs down its groove (8 frames, top to bottom); then the
// frontal lobe, cut from the plate along that groove, tips forward over the rim on a hinge where it crosses it (9
// frames), slides off and falls in front of the face, turning three quarters of a turn, to lie flat on the cloth in
// front of the head, painted side up (16 frames). What is left slumps 3 degrees toward the gap and settles on one spring.
// `at` is the brain's centre in the head plate's box pixels; `land` is where the lobe comes to lie, in cm from where it
// hung: [to the right, toward the lens from the head's plane].
export const BRAIN = { len: 13, at: [500, 232], depth: 1.2, t0: C.lobotomized - 24, cut: C.lobotomized, dash: 8, snip: C.lobotomized + 8, tip: 9, fall: 16, land: [-1.4, 21.7], slump: 3 };
export function brainAt(f) {
  const t = f - BRAIN.snip, a = clamp(t / BRAIN.tip), s = clamp((t - BRAIN.tip) / BRAIN.fall);
  return {
    dash: clamp((f - BRAIN.cut) / BRAIN.dash),                       // how much of the dashed cut is drawn, from the top
    parted: t > 0, tip: a, fall: s,
    th: (Math.PI / 2) * a * a + Math.PI * (1 - (1 - s) ** 1.78),     // the lobe's turn about its hinge line: a quarter turn over the rim, then half a turn more as it falls
    yaw: 0.3 * smooth(s), lift: 0.8 * smooth(a), drop: s ** 1.8, out: s * (1.25 - 0.25 * s), side: smooth(s),
    slump: spring(t - 3, 0.45, 16),                                  // what is left tilts toward the gap
  };
}

// ---------- light: the room fill and the cloth's bounce drop by a third across the section; darkest from "prison" on
export const fillAt = (f) => 1 - smooth((f - F0) / (C.prison1 - F0)) / 3;

// ---------- the camera: carries on from section 5's high wide without a cut
const P3 = (u, v, y) => { const p = chP(u, v); return [p[0], y, p[1]]; };
const hd = (dy = 0) => [HEAD.at[0], HEAD.eyeY + dy, HEAD.at[1]];
const orbit = (deg, r, y) => [HEAD.at[0] + r * Math.sin((deg * Math.PI) / 180), y, HEAD.at[1] + r * Math.cos((deg * Math.PI) / 180)];
export const CAM_KEYS = [
  handover(S5.CAM_KEYS, F0),
  // f2544-f2636: down from the high wide and wide round the far right corner, staying high until it is out in front of
  // the chamfer; then it comes down and in along the line it will look along at "camp", so the cutlery of the fence
  // grows where it stands behind the citizens and never sweeps across the lens (it no longer trucks low past the
  // right fence's corner)
  { f: 2566, P: [22, 132, 96], T: [8, 8, -4] },
  { f: 2590, P: [66, 96, 26], T: [18, 6, -18] },
  { f: 2614, P: P3(18.2, 40.3, 40), T: P3(5.5, -0.5, 4.5) },
  { f: C.camp, P: P3(11, 17.5, 6.4), T: P3(5.5, 0, 4) },
  // f2636-f2737: trucks along the wall as it goes up, to the hero segment
  { f: C.camp2 + 4, P: P3(9, 18, 5.8), T: P3(2.5, 0, 4) },
  { f: C.built + 6, P: P3(6.3, 19, 5.4), T: P3(-2.5, 0, 4.2) },
  { f: C.themselves + 8, P: P3(2.8, 19.4, 5.1), T: P3(-6, 0, 4.2) },
  // f2737-f2761: holds low on the five as their cards turn, still drifting along the wall
  { f: C.guards, P: P3(-1.2, 18.9, 4.9), T: P3(-7.4, 0, 3.6) },
  { f: C.pride, P: P3(-5.4, 18.3, 4.6), T: P3(-7.4, 0, 4.2) },
  // f2761-f2830: rises a little and tilts up to the guards on the wall: the hero frame
  { f: C.pride + 24, P: P3(-9.4, 18.5, 5.4), T: P3(-7.4, 0, 6.6) },
  { f: C.prison1 + 4, P: P3(-12.2, 19.4, 6.2), T: P3(-7.4, 0, 6.9) },
  // f2830-f2886: back and up over the wall, high round the right side of the table (60 cm up, so the right fence lies
  // under the head in the frame, not across it), over the fence once at the near right, 13 cm above the cutlery, and
  // down inside it to the head's eye height
  { f: 2838, P: [43.4, 18, -51.9], T: [25, 7.8, -33] },
  { f: 2847, P: [61, 48, -35], T: [24.5, 10, -16] },
  { f: 2854, P: [69, 62, -12], T: hd(-8) },
  { f: 2861, P: [64.5, 62, 12], T: hd(-6) },
  { f: 2868, P: [53, 51, 31], T: hd(-5) },
  { f: 2876, P: [41.3, 34, 40.8], T: hd(-4.2) },
  { f: 2886, P: orbit(12, 51, 23.3), T: hd(-3.7) },
  // f2878-f2957: a slow arc of 18 degrees, on round the head the way it came, as the layers part
  { f: C.guards2, P: orbit(6.5, 51, 22.8), T: hd(-3.8) },
  { f: C.result, P: orbit(-6, 50, 22.3), T: hd(-3.8) },
  // f2957-f3107: rises to look into the open crown, then comes back down to the eyes
  { f: C.lobotomized - 6, P: orbit(-7.5, 45, 23.2), T: hd(-2.5) },
  { f: C.lobotomized + 30, P: orbit(-2, 36, 43), T: hd(7) },
  { f: 3062, P: orbit(3, 39, 38), T: hd(5) },
  { f: C.see - 6, P: orbit(7, 45, 23.5), T: hd(-2.5) },
  // f3107-f3130: holds on the head, pushing in very slowly as the bricks cross the eyes
  { f: C.prison2, P: orbit(9.5, 42.5, 23), T: hd(-2) },
  { f: 3166, P: orbit(12.5, 38.5, 23.8), T: hd(-1.5) },
];
// The dive from the high wide to the wall (f2544 to "camp", f2636) is the same spline read at another pace (camera pass,
// Nov 13 2026): the path, its shape and the frame it lands on are the old ones, but it leaves the high hold two frames
// sooner, holds 4.2 cm a frame (it peaked at 4.8) and slows early for the turn onto the wall, so the view never turns
// 1.6 degrees a frame (it turned 2.6). It cannot land later: the first wall segment starts to rise on the frame it
// lands. DIVE: [frames after f2544, where on the old spline the lens is then, in old frames].
const DIVE = [[0, 2544], [1, 2545.93], [2, 2547.69], [3, 2549.33], [4, 2550.87], [5, 2552.4], [6, 2553.93], [7, 2555.47], [8, 2557.02], [12, 2563.33], [16, 2569.3], [20, 2574.04],
  [24, 2578.17], [28, 2582.12], [32, 2586.15], [36, 2590.43], [40, 2594.38], [44, 2597.71], [48, 2600.45], [52, 2602.86], [56, 2605.13], [60, 2607.4], [64, 2609.87], [68, 2612.99],
  [72, 2617.13], [76, 2621.56], [80, 2625.54], [84, 2628.96], [88, 2632.27], [92, 2636]].map(([i, t]) => ({ f: F0 + i, P: [t] }));
const diveT = (f) => (f <= F0 || f >= DIVE[DIVE.length - 1].f ? f : hermite(DIVE, f, "P", 0));
export const camAt = (f) => camFrom(CAM_KEYS, diveT(f), lerp(1, 0.5, smooth((f - F0) / 60)));      // the float eases to half of section 5's

export const BEATS = [
  [F0, "I think", "citizens spring up at the heads of their slots, one every two frames, and come out again, each pushing a brick"], [C.camp, "camp", "the first wall segment rises in front of the cutlery as the first brick arrives"],
  [C.built, "built", "the hero segment rises behind its five; the deal goes on round the table"], [C.themselves, "themselves", "the front wall closes; the watchtowers stand at its two corners"],
  [C.guards, "guards", "the five cards turn: the back of each is a guard"], [C.pride, "pride", "the guards, gone down through their slots, come up behind the battlements to stand on the wall"],
  [C.prison1, "prison", "the hero frame: guards on the wall against the lit towers, bricklayers below"], [HEAD.t0, "(And so)", "the head hinges up out of the cloth beside the candle"],
  [C.schizophrenia, "schizophrenia", "the pull-tab slides the two layers apart: capped one way, bare the other"], [C.guards2, "guards", "the capped layer nudges"],
  [C.prisoners, "prisoners", "the bare layer nudges"], [C.result, "result", "the layers slide back together"], [BRAIN.t0, "(no longer have)", "the crown lifts on its hinge: the brain stands in the hollow"],
  [C.lobotomized, "lobotomized", "a dashed cut runs down the brain's groove; the frontal lobe tips out over the rim and falls in front of the face; the rest slumps"],
  [C.see, "see", "a band of bricks is drawn across the eyes"], [C.prison2, "prison", "the band stops over the eyes"],
];

// ---------- hooks (story.js applies every section's, in section order, for every f): no change outside f2544 to f3130
export const fill = (f) => (f < F0 || f >= F1 ? 1 : fillAt(f));
