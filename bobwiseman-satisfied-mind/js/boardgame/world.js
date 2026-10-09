// The world as a pure function of song time: where the pawn, money, prizes, cards and camera are at t.

// ---------- pawn ----------
const FLOOR = (x, y) => (Math.abs(x) <= 251 && Math.abs(y) <= 251 ? 3 : 0);
const HOPS = [];
(() => {
  const ft = [11.46, 11.79, 12.10, 12.42, 12.76, 13.10, 13.45, 13.80];
  ft.forEach((t0, i) => HOPS.push({ t0, t1: t0 + .3, a: sq(i), b: sq(i + 1), h: 17 }));
  const at = [26.40, 27.10, 27.85, 28.70];
  at.forEach((t0, i) => HOPS.push({ t0, t1: t0 + .5, a: sq(8 + i), b: sq(9 + i), h: 22 }));
  HOPS.push({ t0: 49.30, t1: 49.74, a: [200, -200], b: [221, -221], h: 13 });
  HOPS.push({ t0: 50.50, t1: 50.96, a: [221, -221], b: [235, -235], h: 11 });
  HOPS.push({ t0: 56.78, t1: 57.36, a: [235, -235], b: [283, -291], h: 26 });
})();
const SLIDE_PATH = [sq(12), sq(8), sq(0)];
function along(path, s) {
  const L = []; let tot = 0; for (let i = 0; i < path.length - 1; i++) { const l = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]); L.push(l); tot += l; }
  let d = clamp(s) * tot; for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) { const u = clamp(d / L[i]); return [lerp(path[i][0], path[i + 1][0], u), lerp(path[i][1], path[i + 1][1], u), Math.atan2(path[i + 1][1] - path[i][1], path[i + 1][0] - path[i][0])]; } d -= L[i]; }
}
const norm3 = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
// tilt the up axis by angle a toward direction (dx,dy)
const tiltAxis = (a, dx, dy) => { const l = Math.hypot(dx, dy) || 1; return [Math.sin(a) * dx / l, Math.sin(a) * dy / l, Math.cos(a)]; };
const LIE_AX = norm3([-1, .15, -.14]);

function pawnPose(t) {
  if (t < 8.25) return null;
  // placement: a hand lowers it onto START
  if (t < 9.25) {
    const u = lin(t, 8.25, 9.25), e = 1 - Math.pow(1 - u, 2.2);
    const x = 200 + Math.sin(u * 5) * 6 * (1 - u), y = -200 - 4 * (1 - u);
    const sw = Math.sin(u * 7) * 6 * DEG * (1 - u);
    return { x, y, z: 3 + 170 * (1 - e), floor: 3, ax: tiltAxis(sw, 1, .3) };
  }
  // topple and skid back to START
  if (t >= 38.5 && t < 47.5) {
    if (t < 38.85) {
      const u = easeIn(lin(t, 38.5, 38.85)); const p = sq(12);
      const ax = norm3([lerp(0, 1, u), 0, lerp(1, -.12, u)]);
      return { x: p[0], y: p[1], z: 3 + 9 * u, floor: 3, ax };
    }
    if (t < 40.9) {
      const u = lin(t, 38.85, 40.9), s = 1 - Math.pow(1 - u, 1.8);
      const [x, y] = along(SLIDE_PATH, s);
      const angEnd = Math.atan2(LIE_AX[1], LIE_AX[0]);
      const ang = s * (angEnd + 4 * Math.PI);
      const ax = norm3([Math.cos(ang), Math.sin(ang), -.12]);
      const b = Math.abs(Math.sin(s * Math.PI * 6)) * 14 * Math.pow(1 - s, 1.2);
      return { x, y, z: 3 + 9 + b, floor: 3, ax };
    }
    const [sx, sy] = sq(0);
    if (t < 47.5) {
      const dt = t - 40.9, wob = Math.exp(-dt * 5) * Math.sin(dt * 26) * 4;
      return { x: sx + wob * .3, y: sy, z: 3 + 9 + Math.max(0, wob * .3), floor: 3, ax: LIE_AX };
    }
  }
  if (t >= 47.5 && t < 48.25) {
    const u = lin(t, 47.5, 48.25), e = smooth(u) * (1 + .12 * Math.sin(u * Math.PI));
    const ax = norm3([lerp(LIE_AX[0], 0, e), lerp(LIE_AX[1], 0, e), lerp(LIE_AX[2], 1, e)]);
    const [sx, sy] = sq(0);
    return { x: sx + (1 - e) * 6, y: sy, z: 3 + 9 * (1 - e) + Math.sin(u * Math.PI) * 6, floor: 3, ax };
  }
  // standing / hopping
  let base = sq(0), lastLand = 9.25, dir = [1, .3], wobA = 9 * DEG;
  if (t >= 47.5) { lastLand = 48.25; dir = [-1, .2]; wobA = 7 * DEG; }
  for (const hp of HOPS) {
    if (t < hp.t0) break;
    if (t >= 38.5 && hp.t0 < 47) continue;
    if (t < hp.t1) {
      const u = (t - hp.t0) / (hp.t1 - hp.t0), e = smooth(u);
      const x = lerp(hp.a[0], hp.b[0], e), y = lerp(hp.a[1], hp.b[1], e);
      const fa = FLOOR(hp.a[0], hp.a[1]), fb = FLOOR(hp.b[0], hp.b[1]);
      const z = lerp(fa, fb, e) + hp.h * Math.sin(Math.PI * Math.pow(u, .85));
      const lean = 9 * DEG * Math.sin(Math.PI * u) - 4 * DEG * Math.sin(Math.PI * 2 * u);
      return { x, y, z, floor: Math.min(fa, fb), ax: tiltAxis(lean, hp.b[0] - hp.a[0], hp.b[1] - hp.a[1]) };
    }
    base = hp.b; lastLand = hp.t1; dir = [hp.b[0] - hp.a[0], hp.b[1] - hp.a[1]]; wobA = 8 * DEG;
  }
  if (t >= 38.5 && t < 49.3) { base = sq(0); }
  const dt = t - lastLand;
  let tilt = wobA * Math.exp(-dt * 6.5) * Math.sin(dt * 34);
  // peering over the edge at the end of "far"
  if (t > 51.1 && t < 53.6) tilt += 11 * DEG * Math.sin(Math.PI * lin(t, 51.1, 53.6)) * (1 + .15 * Math.sin(t * 9));
  if (t > 51.1 && t < 53.6) dir = [1, -1.2];
  const fl = FLOOR(base[0], base[1]);
  return { x: base[0], y: base[1], z: fl, floor: fl, ax: tiltAxis(tilt, dir[0], dir[1]) };
}

// ---------- prizes (standees) ----------
const PRIZES = [
  { k: 'mansion', x: 212, up: 14.14, down: 41.15 },
  { k: 'car', x: 150, up: 18.16, down: 41.30 },
  { k: 'boat', x: 108, up: 18.62, down: 41.40 },
  { k: 'tv', x: 70, up: 20.00, down: 41.50 },
  { k: 'ring', x: 38, up: 21.50, down: 41.58 },
  { k: 'trophy', x: 6, up: 22.66, down: 41.66 },
  { k: 'crown', x: -30, up: 23.20, down: 41.74 },
];
PRIZES.forEach((p, i) => { p.y = 238; p.sweep = 41.75 + i * .07; p.seed = i + 1; });
// angle from upright (0) to lying back (90deg); null = not there yet
function prizeAngle(p, t) {
  if (t < p.up) return null;
  let a;
  const u = (t - p.up) / .42;
  if (u < 1) { const k = 1 - u; a = 90 * k * k * Math.cos(u * 9) ; a = Math.max(-14, Math.min(90, a)); }
  else a = 0;
  if (t >= p.down) { const v = (t - p.down) / .32; a = v < 1 ? lerp(a, 90, easeIn(v)) : 90 - Math.max(0, Math.sin((v - 1) * 9) * 8 * Math.exp(-(v - 1) * 3)); }
  return a;
}
function sweepOffset(t, ts, seed, y0) {
  if (t < ts) return null;
  const dt = t - ts, acc = 620 + rnd(seed, 3) * 280;
  const dy = -0.5 * acc * dt * dt; const y = y0 + dy;
  const dx = (rnd(seed, 4) - .5) * 70 * dt + Math.sin(dt * 3 + seed) * 6;
  const edge = -400;
  let dz = 0, tip = 0;
  if (y < edge) { const te = Math.sqrt(2 * (y0 - edge) / acc); const fall = dt - te; dz = -0.5 * 6000 * fall * fall; tip = Math.min(1.3, fall * 3); }
  return { dx, dy, dz, rot: (rnd(seed, 5) - .5) * 2.2 * dt, tip };
}

// ---------- money ----------
const NOTES = [];
(() => {
  const r = prng(77); const counts = [0, 0, 0];
  for (let i = 0; i < 60; i++) {
    const p = i % 3; const n = counts[p]++;
    const tl = 12.2 + (i / 60) * 4.6 + r() * .15;
    NOTES.push({ p, n, d: Math.floor(r() * 7), tl, x: PILES[p][0] + (r() - .5) * 16, y: PILES[p][1] + (r() - .5) * 14, rot: (r() - .5) * 1.3, sw: 41.02 + r() * .5 + (2 - p) * .06, seed: 100 + i });
  }
})();
function notePose(nt, t) {
  const fall = 1.05;
  if (t < nt.tl - fall) return null;
  let x = nt.x, y = nt.y, z = 3.3 + nt.n * .23, rot = nt.rot, tilt = 0;
  if (t < nt.tl) {
    const u = (t - (nt.tl - fall)) / fall; const k = 1 - u;
    x += Math.sin(u * 8 + nt.seed) * 26 * k; y += Math.cos(u * 6 + nt.seed) * 18 * k;
    z = lerp(190, z, 1 - k * k * (1 - .25 * Math.sin(u * 10)));
    rot += Math.sin(u * 7 + nt.seed) * 1.6 * k; tilt = Math.sin(u * 11 + nt.seed * 2) * 1.0 * k;
  }
  const sw = sweepOffset(t, nt.sw, nt.seed, nt.y);
  if (sw) { x += sw.dx; y += sw.dy; z = (y < -251 ? 0.3 : z) + sw.dz; rot += sw.rot; tilt = -sw.tip; if (z < -500) return null; }
  return { x, y, z, rot, tilt };
}

// ---------- chance card ----------
function cardPose(t) {
  const base = { x: CARDPOS.x, y: CARDPOS.y, z: 3 + 2.0 };
  let z = base.z, flip = 0, x = base.x, y = base.y, rot = .03;
  if (t >= 33.3) {
    z += 38 * easeOut(lin(t, 33.3, 33.95)) * (1 - smooth(lin(t, 36.05, 36.7)));
    rot += -.06 * smooth(lin(t, 33.3, 33.95));
    flip = Math.PI * smooth(lin(t, 35.15, 36.0));
    z += Math.sin(flip) * 4;
    if (t > 36.7) z = base.z + .35;
  }
  return { x, y, z, flip, rot };
}

// ---------- spinner ----------
const SPIN_END = -67.5 * DEG;
function spinAngle(t) { const u = lin(t, 24.72, 26.35); return SPIN_END + 7 * Math.PI * Math.pow(1 - u, 3); }

// ---------- intro: lid and folded board ----------
function lidPose(t) {
  if (t < 3.9) return { x: 0, y: 425, z: 0, rx: 0, ry: 0, rz: 0 };
  const u = lin(t, 3.9, 5.15); const e = easeIn(u);
  return { x: 760 * e + Math.sin(u * 3) * 10, y: 425 + 420 * e, z: 650 * smooth(u * 1.3) + 20 * u, rx: -10 * DEG * smooth(u), ry: 22 * DEG * smooth(u), rz: 14 * DEG * e };
}
// board: offset of the folded board (moving from the box), and the near half's fold angle (180 = folded shut)
function boardIntro(t) {
  if (t >= 7.9) return null;
  const mv = smooth(lin(t, 5.15, 6.25));
  const ox = 0, oy = lerp(300 - 0, 0, mv), oz = lerp(9, 0, mv) + Math.sin(mv * Math.PI) * 70;
  let a = 180;
  if (t > 6.3) {
    const u = lin(t, 6.3, 7.45); a = 180 * (1 - easeIn(u) * (u < 1 ? 1 : 1));
    if (t > 7.45) a = 7 * Math.sin(Math.PI * lin(t, 7.45, 7.75)) * (1 - lin(t, 7.45, 7.9));
  }
  return { ox, oy, oz, a };
}

// ---------- camera ----------
const lerpCam = (A, B, u) => ({ x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u), z: lerp(A.z, B.z, u), phi: lerp(A.phi, B.phi, u), f: lerp(A.f, B.f, u), roll: lerp(A.roll || 0, B.roll || 0, u) });
const C = (x, y, z, phi, f, roll = 0) => ({ x, y, z, phi, f, roll });
// pawn-follow for the ladder chase
function ladderY(t) { const p = pawnPose(t); return p ? p.y : -200; }
const SHOTS = [
  { a: 0, b: 5.1, cam: (t) => lerpCam(C(0, 425, 960, 90, 2000, -2), C(0, 425, 830, 90, 2000, 0), smooth(lin(t, 0, 5.1))), dof: 0 },
  { a: 5.1, b: 11.46, cam: (t) => {
      const A = C(0, 425, 830, 90, 2000), B = C(0, 150, 1750, 90, 2000), Cc = C(80, -10, 1500, 90, 2000), D = C(232, -470, 150, 28, 1700);
      if (t < 8.0) return lerpCam(A, B, smooth(lin(t, 5.1, 6.5)));
      if (t < 9.7) return lerpCam(B, Cc, smooth(lin(t, 8.0, 9.7)));
      const u = smooth(lin(t, 9.7, 11.46));
      const c = lerpCam(Cc, D, u); c.z = lerp(Cc.z, D.z, Math.pow(u, .6)); c.phi = lerp(90, 28, Math.pow(u, 1.6)); return c;
    }, dof: (t) => t > 10.5 ? { zf: 300, A: .5 * lin(t, 10.5, 11.4) } : 0 },
  { a: 11.46, b: 17.0, cam: (t) => {
      const py = ladderY(Math.min(t, 14.3)); const u = lin(t, 14.3, 17);
      return C(232 - 20 * smooth(u), lerp(py - 270, py - 330, smooth(u)), 150 + 60 * smooth(u), 28 + 4 * smooth(u), 1700);
    }, dof: (t) => ({ zf: 300 + 60 * lin(t, 14.3, 17), A: .55 }) },
  { a: 17.0, b: 24.66, cam: (t) => { const u = smooth(lin(t, 17, 24.4)); return C(lerp(232, -2, u), lerp(28, 52, u), 21, 3, 1900); }, dof: () => ({ zf: 195, A: 1.25 }), sharp: 120 },
  { a: 24.66, b: 26.4, cam: (t) => C(SPIN.x + 4, SPIN.y + 2, lerp(300, 270, lin(t, 24.66, 26.4)), 90, 2000, lerp(-3, 2, lin(t, 24.66, 26.4))), dof: 0 },
  { a: 26.4, b: 31.0, cam: (t) => { const p = pawnPose(t); const px = p ? p.x : 200; return C(lerp(240, 40, smooth(lin(t, 26.3, 30.2))) * .35 + px * .65 + 10, -70, 190, 36, 1650); }, dof: () => ({ zf: 330, A: .45 }) },
  { a: 31.0, b: 33.3, cam: (t) => { const u = smooth(lin(t, 31, 33.3)); return C(lerp(-14, -6, u), lerp(-20, 0, u), lerp(48, 44, u), 15, 2000); }, dof: () => ({ zf: 125, A: 1.3 }), sharp: 60 },
  { a: 33.3, b: 38.5, cam: (t) => C(CARDPOS.x + 2, CARDPOS.y - 1, lerp(272, 238, smooth(lin(t, 33.3, 38.5))), 90, 2000, lerp(1.5, -1, lin(t, 33.3, 38.5))), dof: 0 },
  { a: 38.5, b: 40.95, cam: (t) => lerpCam(C(140, -470, 520, 45, 1500), C(170, -500, 470, 42, 1500), smooth(lin(t, 38.5, 40.95))), dof: 0 },
  { a: 40.95, b: 43.6, cam: (t) => { const c = lerpCam(C(150, -760, 200, 18, 1700), C(160, -785, 192, 17.5, 1700), lin(t, 40.95, 43.6)); c.roll = -5.5 * smooth(lin(t, 41.0, 41.7)) * (1 - smooth(lin(t, 42.7, 43.5))); return c; }, dof: () => ({ zf: 850, A: .35 }) },
  { a: 43.6, b: 46.76, cam: (t) => lerpCam(C(10, -20, 1450, 90, 2000, 1), C(30, -45, 1330, 90, 2000, -1), smooth(lin(t, 43.6, 46.76))), dof: 0 },
  { a: 46.76, b: 54.6, cam: (t) => { const u = smooth(lin(t, 46.76, 54.6)); return C(lerp(226, 236, u), lerp(-430, -405, u), lerp(34, 30, u), 5, 2000); }, dof: () => ({ zf: 225, A: 1.2 }), sharp: 90 },
  { a: 54.6, b: 62.6, cam: (t) => {
      const A = C(262, -465, 24, 3, 2000), B = C(300, -565, 95, 14, 2000);
      const u = smooth(lin(t, 58.4, 60.9)); const c = lerpCam(A, B, u); c.z = lerp(A.z, B.z, Math.pow(u, 1.4));
      if (t < 60.9) return c;
      // dive into the engraved note that has slid in beside him: keep it centred, end straight down on its portrait
      const o = diveOval(), tx = o[0] + 7 * Math.cos(DIVE.rot), ty = o[1] + 7 * Math.sin(DIVE.rot);
      const v = lin(t, 60.9, 62.5), e = smooth(v) * .4 + Math.pow(v, 1.5) * .6;
      const x = lerp(c.x, tx, e), y = lerp(c.y, ty, Math.pow(e, .8)), z = Math.exp(lerp(Math.log(c.z), Math.log(62), e));
      const look = Math.atan2(z, Math.max(ty - y, 1e-3)) / DEG; const phi = lerp(c.phi, look, smooth(lin(v, 0, .25)));
      return C(x, y, z, Math.min(90, phi), 2000, 0);
    }, dof: (t) => ({ zf: 0, A: (1.1 + .6 * lin(t, 57.5, 60)) * (1 - smooth(lin(t, 60.9, 61.8))) }), sharp: 120, trackPawn: true },
];
function shotAt(t) { for (const s of SHOTS) if (t >= s.a && t < s.b) return s; return t < 0 ? SHOTS[0] : SHOTS[SHOTS.length - 1]; }
