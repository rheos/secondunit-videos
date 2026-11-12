// lib.js: what every section shares. Paths and walkers (standees on slots), the camera spline and its slow float.
// Nothing here knows a cue: a section module (s05.js, s06.js, ...) owns its cue names, its events and its camera keys.
import { clamp, lerp, smooth } from "../kit.js";

export const FILM0 = 1800, FPS = 24;                      // the first frame built so far (even: "on twos" is counted from it)
// test 03 on (the painted skin) sets window.PAPER_SKIN before the modules load; test 02 leaves it unset
export const SKIN = !!globalThis.PAPER_SKIN;
const F0 = FILM0;

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
export const rev = (pts) => pts.slice().reverse();

// ---------- walkers. A walker has legs (a path walked between two frames) and turns (the card flips half a turn
// about its vertical axis over 8 frames, so on twos it shows its edge for two frames). Between legs it stands.
// Distance per step is fixed per leg (len / whole steps), 12 frames a step, so a planted foot never slides.
export const RAMP = 8;
export function leg(pts, o) {            // o: { end } or { start }, v cm/frame, in/out ramps
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
export function walker(def) {
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


// ---------- the camera: keys on cue frames, position P and target T splined in time
export const FOV = 60;                                                // vertical, fixed: the lens never zooms
export const mix3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
// a crane between two keys: eased along the line, so it starts and lands softly
export function crane(fa, fb, A, TA, B, TB, n = 7) {
  const out = []; for (let i = 1; i < n; i++) { const u = i / n, e = u * u * u * (u * (u * 6 - 15) + 10), et = smooth(u); out.push({ f: Math.round(lerp(fa, fb, u)), P: mix3(A, B, e), T: mix3(TA, TB, et) }); }
  return out;
}
export function hermite(keys, f, ch, i3) {
  let i = 0; while (i < keys.length - 2 && f >= keys[i + 1].f) i++;
  const k0 = keys[Math.max(i - 1, 0)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(i + 2, keys.length - 1)];
  const v = (k) => k[ch][i3], dt = k2.f - k1.f, u = clamp((f - k1.f) / dt);
  // Catmull-Rom tangents, limited so a channel never overshoots a key (no dip before a crane)
  const tan = (ka, kb, kc) => { if (ka === kb) return (v(kc) - v(kb)) / (kc.f - kb.f); if (kc === kb) return (v(kb) - v(ka)) / (kb.f - ka.f);
    const d0 = (v(kb) - v(ka)) / (kb.f - ka.f), d1 = (v(kc) - v(kb)) / (kc.f - kb.f); if (d0 * d1 <= 0) return 0;
    const m = (v(kc) - v(ka)) / (kc.f - ka.f); return Math.sign(m) * Math.min(Math.abs(m), 3 * Math.abs(d0), 3 * Math.abs(d1)); };
  // a key may carry its own tangent (mP, mT: per frame), as the first key of a section does to carry the last one's velocity
  const own = (k) => k["m" + ch] && k["m" + ch][i3], m1 = own(k1) ?? tan(k0, k1, k2), m2 = own(k2) ?? tan(k1, k2, k3);
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v(k1) + (u3 - 2 * u2 + u) * dt * m1 + (-2 * u3 + 3 * u2) * v(k2) + (u3 - u2) * dt * m2;
}
// the spline alone (no float): what a later section reads to start where this one ends
export const camRaw = (keys, f) => ({ P: [0, 1, 2].map((i) => hermite(keys, f, "P", i)), T: [0, 1, 2].map((i) => hermite(keys, f, "T", i)) });
// the camera at f: the spline, plus a slow circle across its own view, so where the path turns back on itself it still drifts
export function camFrom(keys, f, float = 1) {            // float: the circle's size, as a share of section 5's
  const { P, T } = camRaw(keys, f);
  const dx = T[0] - P[0], dy = T[1] - P[1], dz = T[2] - P[2], d = Math.hypot(dx, dy, dz), hl = Math.hypot(dx, dz) || 1;
  const r = clamp(0.06 * d, 0.6, 1.0) * float, a = (f * 2 * Math.PI) / 72, rx = -dz / hl, rz = dx / hl;       // right = across the view
  P[0] += r * Math.cos(a) * rx; P[2] += r * Math.cos(a) * rz; P[1] += r * 0.6 * Math.sin(a);
  P[1] = Math.max(P[1], 1.6);
  return { P, T, fov: FOV };
}
// the first key of a section: where the last one's spline is at f, with its velocity, so the move carries across the join
export function handover(keys, f) {
  const a = camRaw(keys, f), b = camRaw(keys, f + 1);
  return { f, P: a.P, T: a.T, mP: b.P.map((v, i) => v - a.P[i]), mT: b.T.map((v, i) => v - a.T[i]) };
}
