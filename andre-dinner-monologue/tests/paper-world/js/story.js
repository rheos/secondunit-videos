// story.js: the layout, the camera keys and every event, all pure functions of the film frame f (24 fps).
// Frames come from js/cues.js (tools/onsets.py). Units: centimetres, y up, the cloth is y = 0,
// x to the right, z toward the viewer (the near place setting is at +z, the far one at -z).
import { CUES } from "./cues.js";
import { clamp, lerp, smooth, spring, hash } from "./kit.js";

export const F0 = 1800, F1 = 2544, FPS = 24;
// test 03 (the painted skin) sets window.PAPER_SKIN before this module loads; test 02 leaves it unset
export const SKIN = !!globalThis.PAPER_SKIN;
const c = (k) => CUES[k].f;
export const C = {
  expert: c("expert"), trees: c("trees"), redwoods: c("redwoods"), eighty4: c("eighty4"), backpack: c("backpack"),
  tomorrow: c("tomorrow"), where: c("where"), from: c("from"), newyork1: c("newyork1"), newyork2: c("newyork2"),
  never: c("never"), do: c("do"), yes: c("yes"), why: c("why"), leave2: c("leave2"), theories: c("theories"), all: c("all"),
};

// ---------- the table (x, z)
export const LAY = {
  cloth: { hw: 45, hd: 65 },
  plate_far: [0, -44], plate_near: [0, 44], plateR: 11,
  glass_far: [9, -30.5], glass_near: [12, 30],
  bottle: [21, -24], candle: [10.5, -16.5], flameY: 10.6,
  salt: [-9, -2], pepper: [-12.5, 2], basket: [-21, 12], napkin: [-25.5, 44], pot: [37, -57.5],
  cutlery: {   // rest stacks: [x, zBase (handle end), kind]
    far: [[-13.5, -34.5, "fork"], [13.2, -34.5, "knife"], [16.6, -34.5, "spoon"]],
    near: [[-13.5, 53.5, "fork"], [13.2, 53.5, "knife"], [16.6, 53.5, "spoon"]],
  },
};
// the fence line: the cloth edge inset, with the far right corner cut off by a long chamfer, so the pot
// (the redwood) and a triangle of cloth are outside the wall. n = the chamfer's outward normal, t = along it.
export const CH = { n: [0.7, -0.714], t: [0.715, 0.7], c: 45.4, a: [3.1, -60.5], b: [40.5, -23.9] };
export const FENCE_POLY = [[-40.5, -60.5], CH.a, CH.b, [40.5, 60.5], [-40.5, 60.5]];
const onChamfer = (x) => [x, (0.7 * x - CH.c) / 0.714];
export const GATE = onChamfer(27);                        // where the tree man walks out between two posts
const G = (k, inset = 1.5) => [GATE[0] + k * 3.3 * CH.t[0] - inset * CH.n[0], GATE[1] + k * 3.3 * CH.t[1] - inset * CH.n[1]];

// ---------- paths: a smooth line through points, by arc length
export function makePath(pts, n = 14) {
  const P = [], N = pts.length, get = (i) => pts[clamp(i, 0, N - 1)];
  for (let i = 0; i < N - 1; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; P.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); }
  }
  P.push(pts[N - 1].slice());
  const S = [0]; for (let i = 1; i < P.length; i++) S.push(S[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const len = S[S.length - 1];
  const at = (s) => { s = clamp(s, 0, len); let lo = 0, hi = S.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (S[m] <= s) lo = m; else hi = m; } const u = (s - S[lo]) / Math.max(1e-9, S[hi] - S[lo]); return [lerp(P[lo][0], P[hi][0], u), lerp(P[lo][1], P[hi][1], u)]; };
  const pose = (s) => { const a = at(s - 0.6), b = at(s + 0.6), p = at(s), hx = b[0] - a[0], hz = b[1] - a[1], l = Math.hypot(hx, hz) || 1; return { x: p[0], z: p[1], hx: hx / l, hz: hz / l }; };
  return { len, at, pose, pts };
}
const rev = (pts) => pts.slice().reverse();

// ---------- walkers. A walker has legs (a path walked between two frames) and turns (the card flips half a turn
// about its vertical axis over 8 frames, so on twos it shows its edge for two frames). Between legs it stands.
// Distance per step is fixed per leg (len / whole steps), 12 frames a step, so a planted foot never slides.
const RAMP = 8;
function leg(pts, o) {            // o: { end } or { start }, v cm/frame, in/out ramps
  const path = makePath(pts), v = o.v, rin = o.rampIn === false ? 0 : RAMP, rout = o.rampOut === false ? 0 : RAMP;
  const steps = Math.max(1, Math.round(path.len / (v * 12))), L = path.len / steps;
  const dur = path.len / v + (rin + rout) / 2;
  const fa = o.end !== undefined ? o.end - dur : o.start, fb = fa + dur;
  const sAt = (f) => {              // distance walked: quadratic ramps, linear cruise
    const t = clamp(f - fa, 0, dur);
    if (t < rin) return v * t * t / (2 * rin);
    if (t > dur - rout) { const r = dur - t; return path.len - v * r * r / (2 * rout); }
    return v * (t - rin / 2);
  };
  const speedAt = (f) => { const t = f - fa; if (t <= 0 || t >= dur) return 0; if (t < rin) return v * t / rin; if (t > dur - rout) return v * (dur - t) / rout; return v; };
  return { path, v, L, steps, fa, fb, sAt, speedAt };
}
function walker(def) {
  const { name, legs, turns = [], show = [-1e9, 1e9] } = def;
  def.at = (fRaw) => {
    const f = fRaw - ((fRaw - F0) & 1);                               // posed on twos
    let i = -1; for (let k = 0; k < legs.length; k++) if (f >= legs[k].fa) i = k;
    const L0 = legs[Math.max(i, 0)], walking = i >= 0 && f < L0.fb;
    const s = i < 0 ? 0 : L0.sAt(f), p = L0.path.pose(s);
    let yaw = Math.atan2(-p.hz, p.hx), flip = 0, edge = 0;
    if (!walking) {                                                   // standing: add the turns made since the leg ended
      const from = i < 0 ? -1e9 : L0.fb, to = i + 1 < legs.length ? legs[i + 1].fa : 1e9;
      for (const t of turns) if (t.f >= from - 1 && t.f < to) { const u = clamp((f - t.f) / 8); flip += u; if (u > 0.4 && u < 0.6) edge = 1; }
      yaw += Math.PI * flip;
    }
    const w = walking ? clamp(L0.speedAt(f) / L0.v * 1.6) : 0;
    return { name, f, x: p.x, z: p.z, yaw, phase: walking ? s / L0.L : 0, L: L0.L, walk: w, edge, visible: fRaw >= show[0] && fRaw <= show[1], leg: i, s, rest: walking || i < 0 ? 99 : f - L0.fb };
  };
  return def;
}

// ---------- the tree man
const VT = 2.6 / 12;                                                  // 2.6 cm a step, 12 frames a step
const candle = LAY.candle;
const TM_A = [[34, -84], [33, -64], [31.6, -55], [22, -38], [16, -28.5]];
const TM_B = [[16, -28.5], [11.6, -22.6], [7.3, -19.2], [6.2, -15.4], [8.5, -12.2], [12.0, -12.1], [13.4, -13.5]];
const TM_C = [[13.4, -13.5], [14.9, -18.4], [15.3, -27.3], [20.6, -33], GATE, [32.6, -40.5]];
// test 03: a standee cannot be off the table, so his slot starts at the cloth's far edge and he waits there
const TM_A3 = [[33.05, -63.6], [32.9, -61.5], [31.6, -55], [22, -38], [16, -28.5]];
const legA = SKIN ? leg(TM_A3, { end: C.eighty4, v: VT }) : leg(TM_A, { end: C.eighty4, v: VT, rampIn: false });
const legB = leg(TM_B, { start: C.backpack - 5, v: VT * 1.06 });
const legC = leg(TM_C, { start: C.newyork1 + 12, v: VT });
export const TM = walker({
  name: "treeman", legs: [legA, legB, legC],
  turns: [{ f: C.where }, { f: C.newyork1 + 3 }, { f: C.why - 4 }],  // faces the near setting; turns to go; looks back in
});
export const TMF = { stopB: Math.round(legB.fb), startC: Math.round(legC.fa), gate: Math.round(legC.fa + RAMP / 2 + (legC.path.len - 6.6) / VT), stopC: Math.round(legC.fb) };
export function treemanAt(f) {
  const s = TM.at(f), g = s.f;
  // off the cloth he walks on the room's paper, a card's thickness lower
  s.y = s.z < -LAY.cloth.hd ? -0.3 : 0;
  s.lean = smooth((g - C.eighty4) / 12) * (1 - smooth((g - (C.backpack - 10)) / 9));        // leans on the stick at "84"
  const h = g - (C.backpack - 8); s.hitch = h <= 0 ? 0 : h < 8 ? smooth(h / 8) : 1 - spring(h - 8, 0.5, 12);   // hitches the pack on "backpack"
  const hp = (g - (C.backpack - 4)) / 8; s.hop = hp > 0 && hp < 1 ? Math.sin(Math.PI * hp) : 0;                    // test 03: one small hop on "backpack"
  return s;
}

// ---------- citizens
const VC = 2.1 / 12;
const HOME = { bottle: LAY.bottle, plate_far: LAY.plate_far, plate_near: LAY.plate_near, basket: LAY.basket };
const FOOT = { bottle: 3.0, plate_far: 12.9, plate_near: 12.9, basket: 5.8 };
function citizen(i, home, fence, arrive, turnAt, o = {}) {
  let pts = [HOME[home], ...(o.via || []), fence];
  if (SKIN) {       // a slot from just outside the piece's footprint to the fence; from a plate it leaves at an angle, so the slot is long enough to read
    const c = HOME[home], n = pts[1], a = Math.atan2(n[1] - c[1], n[0] - c[0]) + (home.startsWith("plate") && !o.via ? (i % 2 ? 1 : -1) * 1.05 : 0);
    pts = [[c[0] + FOOT[home] * Math.cos(a), c[1] + FOOT[home] * Math.sin(a)], ...pts.slice(1)];
  }
  const out = leg(pts, { end: arrive, v: VC * (o.pace || 1), rampIn: SKIN });
  const back = leg(rev(pts), { start: turnAt + 8 + (o.wait || 0), v: VC * (o.pace || 1), rampOut: SKIN });
  const w = walker({
    name: "citizen_" + String(i).padStart(2, "0"), home, legs: [out, back], turns: [{ f: turnAt }],
    show: SKIN ? [out.fa - 10, back.fb + 10] : [out.fa + 2, back.fb - 3], colour: o.colour ?? i % 5, h: o.h ?? 3.7 + 0.6 * hash(i, 7), hat: o.hat ?? i % 3,
  });
  w.popAt = (f) => smooth((f - (out.fa - 9)) / 8) * (1 - smooth((f - back.fb - 1) / 8));     // hinges up before it leaves, folds flat when it is back
  return w;
}
const N1 = C.never, N2 = C.leave2;
export const CITIZENS = [
  // first wave: at the fence by "leave", turn on "never do"
  citizen(1, "bottle", G(1), N1 - 9, N1),
  citizen(2, "bottle", G(3.2), N1 - 4, N1 + 4),
  citizen(3, "bottle", G(4.6), N1 - 12, N1 + 2),
  citizen(4, "plate_far", [14.6, -47.2], N1 - 6, N1 + 6),
  citizen(5, "plate_far", [-4, -59], N1 - 14, N1 + 2),
  citizen(6, "plate_near", [6, 59], N1 - 8, N1 + 4),
  citizen(7, "basket", [-39, 9], N1 - 3, N1 + 8, { pace: 1.04 }),
  // second wave: at the fence on "leave?", turn after it
  citizen(8, "plate_far", G(-1.2), N2 - 6, N2 + 8, { via: [[12.5, -40.5]] }),
  citizen(9, "plate_far", G(-2.6), N2 - 1, N2 + 12, { via: [[11, -42.5]] }),
  citizen(10, "bottle", G(1.2), N2 - 3, N2 + 6),
  citizen(11, "bottle", G(3.0), N2 - 9, N2 + 10),
  citizen(12, "plate_near", [-8, 59], N2 - 5, N2 + 9),
  citizen(13, "plate_far", [-13, -59], N2 - 2, N2 + 7),
  citizen(14, "basket", [-39, 17], N2 - 7, N2 + 11),
  citizen(15, "plate_near", [16, 59], N2 + 2, N2 + 16),
  citizen(16, "bottle", [39, -12], N2 - 4, N2 + 13),
];
export const citizenAt = (i, f) => { const s = CITIZENS[i].at(f); s.y = 0; s.lean = 0; s.hitch = 0; s.pop = CITIZENS[i].popAt(f - ((f - F0) & 1)); return s; };

// ---------- risers ("New York"): each springs up, three frames apart, with overshoot
export const RISERS = ["plate_far", "bottle", "glass_far", "plate_near", "glass_near", "salt", "pepper", "basket", "napkin"];
export const riseAt = (name, f, k = 0) => spring(f - (C.newyork1 + 3 * RISERS.indexOf(name) + 3 * k), 0.6, 18);

// ---------- the tree: the sapling springs a tier on "trees", shoots up into a redwood on "redwoods"
export const treeAt = (f) => ({ tier: spring(f - C.trees, 0.5, 12), grow: spring(f - C.redwoods, 0.72, 30) });

// ---------- the fence: 54 cards dealt off six stacks of cutlery, out along the table edge, hinged up
export const FENCE_T0 = C.newyork2;

// ---------- the flame: flickers always, leans after the tree man as he passes on "tomorrow"
export function flameAt(f) {
  const a = Math.sin(f * 0.37) * 0.5 + Math.sin(f * 0.83 + 1.3) * 0.3 + Math.sin(f * 0.151 + 0.4) * 0.6;
  const b = Math.cos(f * 0.29 + 2.1) * 0.5 + Math.sin(f * 0.71) * 0.3 + Math.cos(f * 0.117) * 0.6;
  const tm = TM.at(f), d = Math.hypot(tm.x - candle[0], tm.z - candle[1]);
  const wake = clamp(1 - (d - 4) / 5) * tm.walk;                      // strongest while he walks close by
  const p0 = TM.at(f - 8), wx = tm.x - p0.x, wz = tm.z - p0.z, wl = Math.hypot(wx, wz) || 1;
  return {
    lx: a * 0.045 + (wx / wl) * 0.5 * wake, lz: b * 0.045 + (wz / wl) * 0.5 * wake,   // lean as a slope (x, z per unit height)
    h: 1 + 0.06 * Math.sin(f * 0.53) + 0.04 * Math.sin(f * 1.31), gain: 1 + 0.025 * Math.sin(f * 0.47) + 0.02 * Math.sin(f * 1.13),
  };
}

// ---------- the camera: one move, keys on the cue frames, position P and target T splined in time
const tmT = (f, dy = 2.5) => { const s = treemanAt(f); return [s.x, s.y + dy, s.z]; };
const around = (deg, r, y) => [candle[0] + r * Math.cos(deg * Math.PI / 180), y, candle[1] + r * Math.sin(deg * Math.PI / 180)];
const mix3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const flame = [candle[0], 7, candle[1]];
// a crane between two keys: eased along the line, so it starts and lands softly
function crane(fa, fb, A, TA, B, TB, n = 7) {
  const out = []; for (let i = 1; i < n; i++) { const u = i / n, e = u * u * u * (u * (u * 6 - 15) + 10), et = smooth(u); out.push({ f: Math.round(lerp(fa, fb, u)), P: mix3(A, B, e), T: mix3(TA, TB, et) }); }
  return out;
}
export const CAM_KEYS = [
  // f1800-f1930: low across the table, gliding to the far corner, past the glass stem, the plate rim and the knife
  { f: 1800, P: [-4, 6, -2], T: [12, 4.5, -22] },
  { f: 1842, P: [-1, 5.6, -14], T: [22, 4, -46] },
  { f: C.expert, P: [-0.5, 5.4, -25.5], T: tmT(C.expert, 2.4) },
  { f: C.trees, P: [10, 4.6, -41], T: [28.5, 3.3, -48.5] },
  // f1930-f2110: beside him at his eye height as he comes in among the tableware; he passes the lens, the camera
  // swings round behind him, looks up the redwood as it shoots up, and comes back down to him at the bottle
  { f: 1944, P: [13.2, 4.5, -44.2], T: tmT(1944, 2.7) },
  { f: 1954, P: [13.9, 4.5, -43], T: tmT(1954, 2.7) },
  { f: 1964, P: [12.4, 4.6, -40.8], T: tmT(1964, 2.7) },
  ...(SKIN ? [
    // test 03: back and a little up, so the tree man (under the far glass's bowl) and the redwood rising at the corner share the frame
    { f: C.redwoods - 4, P: [2.5, 5, -31.6], T: tmT(C.redwoods - 4, 2.5) },
    { f: C.redwoods + 10, P: [-9.5, 6.4, -26.2], T: [19.2, 12.2, -37.5] },
    { f: C.eighty4 + 3, P: [5, 5.3, -37.5], T: [16.3, 2.6, -28.6] },
    { f: C.eighty4 + 16, P: [11, 5.4, -40], T: [16.2, 2.5, -28.3] },
  ] : [
  { f: C.redwoods - 4, P: [4, 4.8, -33], T: tmT(C.redwoods - 4, 2.9) },
  { f: C.redwoods + 4, P: [3.6, 4.9, -36.5], T: [27, 14, -44] },
  { f: C.redwoods + 11, P: [6.5, 5.2, -39.6], T: [33.5, 31, -53] },
  { f: C.eighty4 - 7, P: [9.6, 5.4, -40.4], T: [26, 7, -42] },
  { f: C.eighty4 - 1, P: [12.4, 5.5, -40.6], T: [16.2, 2.7, -28.3] },
  { f: C.eighty4 + 8, P: [13.2, 5.4, -40.4], T: [16.2, 2.7, -28.3] },
  ]),
  { f: 2048, P: [14.3, 5.2, -39.3], T: [16.2, 2.7, -28.2] },
  { f: C.backpack, P: [14.6, 5, -37.6], T: [16.2, 2.8, -28] },
  { f: 2090, P: [8.5, 4.7, -34.4], T: tmT(2090, 2.6) },
  { f: C.tomorrow, P: [1.5, 4.6, -31], T: mix3(tmT(C.tomorrow, 2.8), flame, 0.2) },
  // f2110-f2215: round the candle on the outside of his circle, rising from 5 to 25 cm
  { f: 2130, P: around(-160, 15, 5.4), T: mix3(tmT(2130), flame, 0.3) },
  { f: 2156, P: around(-215, 14.5, 6.6), T: mix3(tmT(2156), flame, 0.3) },
  { f: 2180, P: around(-290, 14, 8.2), T: mix3(tmT(2180), flame, 0.25) },
  { f: C.from, P: around(-310, 14.5, 10.5), T: mix3(tmT(C.from), flame, 0.2) },
  { f: C.newyork1, P: around(-322, 19, 21), T: [12, 4, -15.5] },
  // f2215-f2300: crane up and back as the towers rise
  { f: 2256, P: [41, 43, 14], T: [11, 7, -20] },
  { f: 2300, P: [62, 64, 34], T: [8, 10, -24] },
  // f2300-f2466: down to citizen height at the fence
  { f: 2326, P: [45, 27, 10], T: [26, 4.5, -29] },
  { f: 2346, P: [34.2, 7.6, -7.5], T: [29.5, 3.2, -32] },
  { f: 2378, P: [31.6, 5.2, -11.5], T: [30.6, 2.9, -34] },
  { f: C.leave2, P: [31.2, 4.3, -16.5], T: [31.5, 3.0, -36] },
  { f: C.theories - 8, P: [31.6, 4.2, -19.2], T: [32, 3.5, -38] },
  // f2466-f2544: up and back to the high wide, landing on "all", then drifting
  ...crane(C.theories - 8, C.all, [31.6, 4.2, -19.6], [32, 3.5, -38], [5, 144, 106], [0, 10, 5]),
  { f: C.all, P: [5, 144, 106], T: [0, 10, 5] },
  { f: 2548, P: [3.6, 147, 108.6], T: [0, 10, 4.4] },
];
export const FOV = 60;                                                // vertical, fixed: the lens never zooms
function hermite(keys, f, ch, i3) {
  let i = 0; while (i < keys.length - 2 && f >= keys[i + 1].f) i++;
  const k0 = keys[Math.max(i - 1, 0)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(i + 2, keys.length - 1)];
  const v = (k) => k[ch][i3], dt = k2.f - k1.f, u = clamp((f - k1.f) / dt);
  // Catmull-Rom tangents, limited so a channel never overshoots a key (no dip before a crane)
  const tan = (ka, kb, kc) => { if (ka === kb) return (v(kc) - v(kb)) / (kc.f - kb.f); if (kc === kb) return (v(kb) - v(ka)) / (kb.f - ka.f);
    const d0 = (v(kb) - v(ka)) / (kb.f - ka.f), d1 = (v(kc) - v(kb)) / (kc.f - kb.f); if (d0 * d1 <= 0) return 0;
    const m = (v(kc) - v(ka)) / (kc.f - ka.f); return Math.sign(m) * Math.min(Math.abs(m), 3 * Math.abs(d0), 3 * Math.abs(d1)); };
  const m1 = tan(k0, k1, k2), m2 = tan(k1, k2, k3);
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v(k1) + (u3 - 2 * u2 + u) * dt * m1 + (-2 * u3 + 3 * u2) * v(k2) + (u3 - u2) * dt * m2;
}
export function camAt(f) {
  const P = [0, 1, 2].map((i) => hermite(CAM_KEYS, f, "P", i)), T = [0, 1, 2].map((i) => hermite(CAM_KEYS, f, "T", i));
  // the camera floats on a slow circle across its own view, so where the path turns back on itself it still drifts
  const dx = T[0] - P[0], dy = T[1] - P[1], dz = T[2] - P[2], d = Math.hypot(dx, dy, dz), hl = Math.hypot(dx, dz) || 1;
  const r = clamp(0.06 * d, 0.6, 1.0), a = (f * 2 * Math.PI) / 72, rx = -dz / hl, rz = dx / hl;       // right = across the view
  P[0] += r * Math.cos(a) * rx; P[2] += r * Math.cos(a) * rz; P[1] += r * 0.6 * Math.sin(a);
  P[1] = Math.max(P[1], 1.6);
  return { P, T, fov: FOV };
}

// the beat table, for the README and for blocking.json
export const BEATS = [
  [F0, "start", "low across the table, one flame"], [C.expert, "tree expert", "the tree man walks into frame by the sapling"],
  [C.trees, "trees", "the sapling springs a tier"], [C.redwoods, "redwoods", "the sapling shoots up into a redwood"],
  [C.eighty4, "84", "he stops and leans on the stick beside the bottle"], [C.backpack, "backpack", "he hitches the pack and walks on"],
  [C.tomorrow, "tomorrow", "he reaches the candle; the flame leans after him"], [C.where, "where are you from", "he stops; the card turns to the near setting"],
  [C.newyork1, "New York", "plates, glasses, bottle, salt, pepper, basket rise into towers"], [C.newyork2, "New York (2)", "the cutlery deals out along the edge and hinges up as the fence"],
  [2300, "Do you know", "the camera comes down toward the fence"], [C.never, "never do", "citizens stop at the fence and turn back; the tree man walks on"],
  [TMF.gate, "(oh, yes)", "the tree man walks out between two posts"], [C.why, "why", "outside, he turns and looks back in"],
  [C.leave2, "don't leave", "the second wave stops at the fence"], [C.theories, "theories", "the camera starts up and back"],
  [C.all, "all", "the high wide: the walled, lit city"], [F1 - 1, "end", "hold, drifting"],
];
