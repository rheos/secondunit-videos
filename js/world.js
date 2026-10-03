// The world from the air: a perspective ground plane of patchwork fields, the highway, a river,
// cumulus clouds, the sun, and the plane in three views (side, front-from-below, top-down).
// Palette and brush settings are documented at the top of js/ch/flight.js.

const PG = {
  ground: '#f3e7c9', white: '#fbf5e6', lemon: '#f5d93a', yellow: '#f4c534', orange: '#f08a24',
  vermilion: '#e4502e', rose: '#d9577a', violet: '#8a5bb5', ultra: '#2a3a9e', cobalt: '#2f63b8',
  cerulean: '#5aa9da', viridian: '#1f7a5c', sap: '#6a9a3a', green: '#8cc04a', ochre: '#d9a441',
  indigo: '#1d2a5a', lilac: '#b7b0de', haze: '#b9c6ee', hedge: '#17594a', road: '#efe2f0',
};

// ---------------------------------------------------------------- ground camera
// World: X right, Y up (altitude), Z forward. The camera sits at (x, h, z), pitched down by p, turned by yaw.
const V = {};
function view(o) {
  Object.assign(V, { x: 0, z: 0, h: 8, p: .35, yaw: 0, F: 1000, cx: W / 2, cy: H / 2 }, o);
  V.cp = Math.cos(V.p); V.sp = Math.sin(V.p); V.cyw = Math.cos(V.yaw); V.syw = Math.sin(V.yaw);
}
function P3(X, Y, Z) {
  const x = X - V.x, z = Z - V.z, y = Y - V.h;
  const xr = x * V.cyw - z * V.syw, zr = x * V.syw + z * V.cyw;
  const vy = y * V.cp + zr * V.sp, vz = -y * V.sp + zr * V.cp;
  return [V.cx + V.F * xr / vz, V.cy - V.F * vy / vz, vz];
}
function U2(sx, sy, tmax = 140) { // screen point -> ground point (Y = 0)
  const vx = (sx - V.cx) / V.F, vy = -(sy - V.cy) / V.F;
  const dy = vy * V.cp - V.sp, dzr = vy * V.sp + V.cp, dxr = vx;
  const dx = dxr * V.cyw + dzr * V.syw, dz = -dxr * V.syw + dzr * V.cyw;
  const tt = dy < -1e-4 ? Math.min(-V.h / dy, tmax) : tmax;
  return [V.x + dx * tt, V.z + dz * tt];
}
const horizonY = () => V.p > 1.5 ? -1e5 : V.cy - V.F * Math.tan(V.p);

function sky(top = PG.cobalt, mid = PG.cerulean, low = '#f6e9b8') {
  const hy = horizonY();
  s.fillStyle = vgrad(s, Math.min(hy - 900, -400), hy + 4, [[0, PG.ultra], [.35, top], [.75, mid], [1, low]]);
  s.fillRect(-1000, -1500, W + 2000, hy + 1500 + 20);
}
function sun(x, y, r, a = 1) {
  dot(s, x, y, r * 1.9, '#fbefb4'); dot(s, x, y, r, '#fffbe8');
  glow(x, y, r * 7, `rgba(255,236,170,${.35 * a})`); glow(x, y, r * 2.2, `rgba(255,250,225,${.8 * a})`);
}

// ---------------------------------------------------------------- the patchwork
const LA = .38, LC = Math.cos(LA), LS = Math.sin(LA), CELL = 1.15;
const FIELD = [ // [colour, weight, furrows]
  [PG.green, 6, 1], [PG.sap, 5, 1], [PG.viridian, 3.5, 0], [PG.lemon, 1.5, 1], [PG.ochre, 2, 1],
  [PG.orange, .45, 1], [PG.rose, .4, 1], [PG.violet, .5, 1], ['#efd9a4', 1.2, 1], [PG.cerulean, .1, 0],
];
const FW = FIELD.reduce((a, f) => a + f[1], 0);
function fieldType(i, j) { if (hash2(i, j, 8) < .55) { i = Math.floor(i / 2); j = Math.floor(j / 2); } let r = hash2(i, j, 7) * FW; for (const fd of FIELD) { r -= fd[1]; if (r <= 0) return fd; } return FIELD[0]; }
function corner(i, j) { const a = (i + (hash2(i, j, 1) - .5) * .5) * CELL, b = (j + (hash2(i, j, 2) - .5) * .5) * CELL; return [a * LC - b * LS, a * LS + b * LC]; }
const toLat = (X, Z) => [(X * LC + Z * LS) / CELL, (-X * LS + Z * LC) / CELL];
function hazeK(vz) { return clamp((vz - 14) / 75) * .78; }

function groundBounds() {
  const pts = [], hy = horizonY();
  for (const sx of [-200, W / 2, W + 200]) for (const sy of [Math.max(hy + 2, -200), H / 2, H + 200]) pts.push(U2(sx, Math.max(sy, hy + 2)));
  for (let k = 0; k <= 8; k++) pts.push(U2(-200 + k * (W + 400) / 8, Math.max(hy + 3, -200)));
  return pts;
}
function fields(t, o = {}) {
  const { far = 110, hedges = 1, trees = 1 } = o;
  const hy = horizonY();
  // base ground wash so slivers between LOD bands read as land
  s.fillStyle = vgrad(s, Math.max(hy, -300), H + 200, [[0, mixh(PG.sap, PG.haze, .8)], [.25, mixh(PG.sap, PG.haze, .4)], [1, PG.sap]]);
  s.fillRect(-1000, Math.max(hy, -1500), W + 2000, 4000);
  const B = groundBounds().map(([X, Z]) => toLat(X, Z));
  const a0 = Math.floor(Math.min(...B.map(b => b[0])) / 4) * 4 - 4, a1 = Math.ceil(Math.max(...B.map(b => b[0])) / 4) * 4 + 4;
  const b0 = Math.floor(Math.min(...B.map(b => b[1])) / 4) * 4 - 4, b1 = Math.ceil(Math.max(...B.map(b => b[1])) / 4) * 4 + 4;
  const blocks = [];
  for (let J = b0; J < b1; J += 4) for (let I = a0; I < a1; I += 4) {
    const c = corner(I + 2, J + 2), pc = P3(c[0], 0, c[1]);
    if (pc[2] < .3 || pc[2] > far) continue;
    blocks.push([I, J, pc[2]]);
  }
  blocks.sort((a, b) => b[2] - a[2]);
  const PROJ = {}; const pj = (i, j) => { const k = i + ',' + j; if (PROJ[k]) return PROJ[k]; const c = corner(i, j); return (PROJ[k] = P3(c[0], 0, c[1])); };
  const near = [];
  for (const [I, J, bz] of blocks) {
    const k = bz < 15 ? 1 : bz < 34 ? 2 : 4;
    for (let j = J; j < J + 4; j += k) for (let i = I; i < I + 4; i += k) {
      const q = [pj(i, j), pj(i + k, j), pj(i + k, j + k), pj(i, j + k)];
      if (q.some(p => p[2] < .25)) continue;
      const xs = q.map(p => p[0]), ys = q.map(p => p[1]);
      if (Math.max(...xs) < -60 || Math.min(...xs) > W + 60 || Math.max(...ys) < -60 || Math.min(...ys) > H + 60) continue;
      const vz = (q[0][2] + q[2][2]) / 2, ft = fieldType(i, j), hz = hazeK(vz);
      poly(s, q, mixc(ft[0], PG.haze, hz));
      if (hedges && vz < 32) { // hedgerows only between different fields, so same-crop neighbours merge into bigger fields
        s.lineCap = 'round'; s.lineWidth = Math.max(.8, V.F * .045 / vz); s.strokeStyle = mixc(PG.hedge, PG.haze, hz);
        s.beginPath();
        if (fieldType(i + k, j) !== ft) { s.moveTo(q[1][0], q[1][1]); s.lineTo(q[2][0], q[2][1]); }
        if (fieldType(i, j + k) !== ft) { s.moveTo(q[2][0], q[2][1]); s.lineTo(q[3][0], q[3][1]); }
        s.stroke();
      }
      if (vz < 15) near.push([i, j, k, q, vz, ft]);
    }
  }
  // soft atmosphere where land meets sky
  if (hy > -200) { s.fillStyle = vgrad(s, hy - 50, hy + 110, [[0, 'rgba(246,233,184,0)'], [.35, 'rgba(240,232,214,.45)'], [1, 'rgba(185,198,238,0)']]); s.fillRect(-1000, hy - 50, W + 2000, 160); }
  // furrows and trees on the near fields: they give the strokes a direction to follow
  for (const [i, j, k, q, vz, ft] of near) {
    if (ft[2]) {
      s.save(); s.beginPath(); q.forEach((p, n) => n ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath(); s.clip();
      const dir = hash2(i, j, 9) < .5, nL = 7, A = q[0], Bq = q[1], C = q[2], D = q[3];
      s.lineWidth = Math.max(.7, V.F * .028 / vz); s.strokeStyle = mixc(ft[0], hash2(i, j, 4) < .5 ? PG.indigo : PG.white, .1);
      s.beginPath();
      for (let n = 1; n < nL; n++) {
        const u = n / nL; const p0 = dir ? [lerp(A[0], Bq[0], u), lerp(A[1], Bq[1], u)] : [lerp(A[0], D[0], u), lerp(A[1], D[1], u)];
        const p1 = dir ? [lerp(D[0], C[0], u), lerp(D[1], C[1], u)] : [lerp(Bq[0], C[0], u), lerp(Bq[1], C[1], u)];
        s.moveTo(p0[0], p0[1]); s.lineTo(p1[0], p1[1]);
      }
      s.stroke(); s.restore();
    }
    if (trees && hash2(i, j, 5) < .35) {
      const n = 2 + Math.floor(hash2(i, j, 6) * 4);
      for (let m = 0; m < n; m++) { const u = (m + .5) / n; const p = [lerp(q[0][0], q[1][0], u), lerp(q[0][1], q[1][1], u)]; const r = V.F * (.07 + .04 * hash2(i, j, 20 + m)) / vz;
        dot(s, p[0] + r * .4, p[1] + r * .35, r, mixc(PG.indigo, PG.viridian, .4)); dot(s, p[0], p[1], r, PG.viridian); dot(s, p[0] - r * .3, p[1] - r * .3, r * .5, PG.green); }
    }
  }
}

// ---------------------------------------------------------------- highway and river
const ZFORK = 26;
const hwX = (Z) => 2.4 * Math.sin(Z * .055 + .4) + .9 * Math.sin(Z * .16);
const branchX = (Z) => hwX(Z) + Math.pow(Math.max(0, Z - ZFORK), 1.35) * .16;
const riverX = (Z) => -6 + 2.6 * Math.sin(Z * .045 + 2) + .8 * Math.sin(Z * .13);
function ribbon(fx, w, col, z0, z1, edge = null) {
  const L = [], R = [];
  const B = groundBounds(); const zmin = Math.max(z0, Math.min(...B.map(b => b[1])) - 2), zmax = Math.min(z1, Math.max(...B.map(b => b[1])) + 2);
  for (let Z = zmin; Z <= zmax; Z += .35) {
    const X = fx(Z), dX = (fx(Z + .05) - fx(Z - .05)) / .1, n = Math.hypot(1, dX), nx = 1 / n, nz = -dX / n;
    const a = P3(X - nx * w / 2, 0, Z - nz * w / 2), b = P3(X + nx * w / 2, 0, Z + nz * w / 2);
    if (a[2] < .3 || b[2] < .3) continue;
    L.push([a, b]);
  }
  if (L.length < 2) return L;
  const pts = [...L.map(p => p[0]), ...L.map(p => p[1]).reverse()];
  if (edge) { s.lineJoin = 'round'; s.lineWidth = 2.2; s.strokeStyle = edge; s.beginPath(); pts.forEach((p, n) => n ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.closePath(); s.stroke(); }
  // haze toward distance: draw in a few depth bands
  for (let k = 0; k < L.length - 1; k++) {
    const a = L[k], b = L[k + 1]; const vz = a[0][2];
    poly(s, [a[0], b[0], b[1], a[1]], mixc(col, PG.haze, hazeK(vz) * .8));
  }
  return L;
}
function highway(t, o = {}) {
  const { w = .1, fork = 1, cars = 0, jam = 0, carK = 1 } = o;
  ribbon(hwX, w, PG.road, -1e3, 1e3, null);
  if (fork) ribbon(branchX, w * .9, PG.road, ZFORK + .2, 1e3, null);
  if (cars) { // a long, slow line of cars: the jam he used to be in
    const B = groundBounds(), z0 = Math.min(...B.map(b => b[1])), z1 = Math.max(...B.map(b => b[1]));
    const sp = .3, lane = w * .22, cols = [PG.vermilion, PG.cobalt, PG.lemon, PG.white, PG.rose, PG.orange];
    for (let n = Math.floor(z0 / sp) - 1; n < z1 / sp + 1; n++) {
      if (hash(n * 31 + 7) < .15) continue;
      for (const side of [-1, 1]) {
        const Z = n * sp + side * .17 + t * (side > 0 ? .05 : .09) * (jam ? 1 : 4), X = hwX(Z) + side * lane;
        const p = P3(X, 0, Z); if (p[2] < .3 || p[2] > 40) continue;
        const r = V.F * .03 * carK / p[2]; if (r < .6) continue; const cc = cols[(n * 7 + (side > 0 ? 3 : 0)) % cols.length];
        ell(s, p[0], p[1], r * 1.6, r * 1.6, 0, cc);                                   // a dab in the paint
        ell(ik, p[0] + r * .25, p[1] + r * .3, r * 1.15, r * 1.15, 0, rgba(PG.indigo, .55)); ell(ik, p[0], p[1], r, r, 0, cc); // and a crisp one on top
      }
    }
  }
}
function river() { ribbon(riverX, .16, PG.cerulean, -1e3, 1e3, null); }

// ---------------------------------------------------------------- clouds
// makeClouds(seed, n, [x0,x1], [y0,y1], [z0,z1], size) -> cumulus with flat-ish bases
function makeClouds(seed, n, xr, yr, zr, size = 1) {
  const R = rng(seed), out = [];
  for (let c = 0; c < n; c++) {
    const X = lerp(xr[0], xr[1], R()), Y = lerp(yr[0], yr[1], R()), Z = lerp(zr[0], zr[1], R()), sz = size * (.6 + R() * .8);
    const puffs = []; const np = 5 + Math.floor(R() * 5);
    for (let k = 0; k < np; k++) { const u = (k / (np - 1)) * 2 - 1; puffs.push([u * sz * 1.4 + (R() - .5) * sz * .3, (1 - u * u) * sz * .55 + R() * sz * .25, (R() - .5) * sz * .5, sz * (.45 + (1 - Math.abs(u)) * .45 + R() * .15)]); }
    out.push({ X, Y, Z, puffs, sz, seed: c });
  }
  return out;
}
function drawClouds(list, t, o = {}) {
  const { wind = [0, 0], shadows = 0, sunDir = [-.6, -.8], front = 0 } = o;
  const items = list.map(c => { const X = c.X + wind[0] * t, Z = c.Z + wind[1] * t; return { c, X, Z, p: P3(X, c.Y, Z) }; }).filter(o => o.p[2] > .6).sort((a, b) => b.p[2] - a.p[2]);
  if (shadows) for (const { c, X, Z } of items) {
    const p = P3(X - c.Y * .25, 0, Z + c.Y * .2); if (p[2] < .5) continue;
    ell(s, p[0], p[1], V.F * c.sz * 1.7 / p[2], V.F * c.sz * 1.0 / p[2], .3, 'rgba(29,42,90,.22)');
  }
  for (const { c, X, Z, p } of items) {
    const hz = hazeK(p[2]) * .6;
    const P = c.puffs.map(([dx, dy, dz, r]) => { const q = P3(X + dx, c.Y + dy, Z + dz); return [q[0], q[1], V.F * r / q[2]]; }).filter(q => q[2] > .5);
    if (!P.length) continue;
    const xs = P.map(q => q[0]); if (Math.max(...xs) < -400 || Math.min(...xs) > W + 400) continue;
    for (const [x, y, r] of P) dot(s, x + r * .05, y + r * .28, r, mixc(PG.lilac, PG.haze, hz));
    for (const [x, y, r] of P) dot(s, x, y - r * .08, r * .86, mixc(PG.white, PG.haze, hz));
    for (const [x, y, r] of P) dot(s, x + sunDir[0] * r * .3, y + sunDir[1] * r * .3, r * .45, mixc('#fff4c8', PG.haze, hz));
    if (front) { ik.save(); ik.globalCompositeOperation = 'destination-out'; for (const [x, y, r] of P) dot(ik, x, y, r * .9, '#000'); ik.restore(); }
  }
}
// a screen-space cumulus (for low angles and wipes): x, y centre, r size, k seed
function cumulus(x, y, r, k, o = {}) {
  const { under = PG.lilac, top = PG.white, hi = '#fff4c8', fromBelow = 0, g = s, front = 0 } = o;
  const R = rng(k * 977 + 13), P = [];
  const n = 7 + Math.floor(R() * 4);
  for (let i = 0; i < n; i++) { const u = (i / (n - 1)) * 2 - 1; P.push([x + u * r * 1.5 + (R() - .5) * r * .3, y - (1 - u * u) * r * .5 - R() * r * .25, r * (.42 + (1 - Math.abs(u)) * .5 + R() * .12)]); }
  for (const [px, py, pr] of P) dot(g, px, py + pr * .25, pr, under);
  for (const [px, py, pr] of P) dot(g, px, py - pr * (fromBelow ? -.05 : .1), pr * .84, fromBelow ? mixh(top, under, .35) : top);
  for (const [px, py, pr] of P) dot(g, px - pr * .25, py - pr * .3, pr * .45, hi);
  if (front) { ik.save(); ik.globalCompositeOperation = 'destination-out'; for (const [px, py, pr] of P) dot(ik, px, py + pr * .1, pr * .95, '#000'); ik.restore(); }
}

// ---------------------------------------------------------------- the plane
// A stubby 1950s propeller airliner with car tyres, big eyes in the windscreen and a mouth under the nose.
const PC = { body: PG.vermilion, bodySh: '#b23a6e', bodyHi: '#f7a05c', wing: PG.yellow, wingSh: '#e27c22', fin: PG.yellow, finStripe: PG.cobalt,
  screen: PG.ultra, eye: PG.white, pupil: PG.indigo, tyre: '#3a3468', hub: PG.ochre, strut: '#5b4a7a', prop: PG.indigo, cheat: '#fbe7a6',
  port: PG.cobalt, nose: PG.cobalt, cheek: PG.rose, mouth: PG.indigo, belt: PG.cobalt, buckle: PG.lemon };
const solid = (c) => new Proxy({}, { get: () => c });
const BLACK = solid('#000');
// Fauve contour: an ultramarine line around the plane's big shapes, so the strokes have an edge to hold
function contour(g, pts, w) { smoothPath(g, pts); g.lineJoin = 'round'; g.lineWidth = w; g.strokeStyle = PG.ultra; g.stroke(); }
function xf(x, y, sc, rot) { for (const g of ALL()) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); } }
function unxf() { for (const g of ALL()) g.restore(); }

// eyes: painted version on s; crisp, hand-wobbled version on the ink layer
function eyePath(g, cx, cy, rx, ry, seed) { g.beginPath(); for (let k = 0; k <= 32; k++) { const a = k / 32 * TAU, w = 1 + (noise1(k * .7, seed) - .5) * .05; const px = cx + Math.cos(a) * rx * w, py = cy + Math.sin(a) * ry * w; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); }
function eye(cx, cy, rx, ry, o, seed) {
  const { look = [0, 0], lid = 0, lidCol = PC.body, squint = 0, ink = 1 } = o;
  const px = cx + look[0] * rx * .4, py = cy + look[1] * ry * .42, pr = Math.min(rx, ry) * .5;
  // painted
  ell(s, cx, cy, rx * 1.08, ry * 1.08, 0, PG.indigo); ell(s, cx, cy, rx, ry, 0, PC.eye); dot(s, px, py, pr, PC.pupil);
  if (lid > .02) { const ly = cy - ry + lid * ry * 2.05; s.save(); eyePath(s, cx, cy, rx * 1.1, ry * 1.1, seed); s.clip(); s.fillStyle = lidCol; s.fillRect(cx - rx * 1.2, cy - ry * 1.3, rx * 2.4, ly - (cy - ry * 1.3)); s.restore(); }
  if (!ink) return;
  const g = ik, lw = Math.max(rx * .1, 1.2);
  g.save(); eyePath(g, cx, cy, rx, ry, seed); g.fillStyle = PC.eye; g.fill(); g.clip();
  g.fillStyle = 'rgba(169,185,226,.55)'; g.beginPath(); g.ellipse(cx, cy + ry * .55, rx * 1.1, ry * .6, 0, 0, TAU); g.fill(); // lower shade
  dot(g, px, py, pr, PC.pupil); dot(g, px - pr * .32, py - pr * .36, pr * .34, '#fffdf4'); dot(g, px + pr * .3, py + pr * .3, pr * .12, '#fffdf4');
  if (lid > .02 || squint > .02) {
    const ly = cy - ry + lid * ry * 2.05;
    g.fillStyle = lidCol; g.beginPath(); g.moveTo(cx - rx * 1.2, cy - ry * 1.3); g.lineTo(cx + rx * 1.2, cy - ry * 1.3); g.lineTo(cx + rx * 1.2, ly); g.quadraticCurveTo(cx, ly + ry * .25, cx - rx * 1.2, ly); g.closePath(); g.fill();
    g.strokeStyle = PG.indigo; g.lineWidth = lw * .9; g.beginPath(); g.moveTo(cx - rx * 1.2, ly); g.quadraticCurveTo(cx, ly + ry * .25, cx + rx * 1.2, ly); g.stroke();
    if (squint > .02) { const sy = cy + ry - squint * ry * .9; g.fillStyle = lidCol; g.beginPath(); g.moveTo(cx - rx * 1.2, cy + ry * 1.3); g.lineTo(cx + rx * 1.2, cy + ry * 1.3); g.lineTo(cx + rx * 1.2, sy); g.quadraticCurveTo(cx, sy - ry * .3, cx - rx * 1.2, sy); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(cx - rx * 1.2, sy); g.quadraticCurveTo(cx, sy - ry * .3, cx + rx * 1.2, sy); g.stroke(); }
  }
  g.restore();
  g.strokeStyle = PG.indigo; g.lineWidth = lw; g.lineJoin = 'round'; eyePath(g, cx, cy, rx, ry, seed); g.stroke();
  g.save(); g.globalAlpha *= .35; g.lineWidth = lw * .6; eyePath(g, cx + lw * .4, cy + lw * .3, rx * 1.02, ry * 1.02, seed + 3); g.stroke(); g.restore();
}
// mouth: L, R corners, smile (-1..1), open (0..1)
function mouth(L, R, smile, open, w) {
  const mx = (L[0] + R[0]) / 2, my = (L[1] + R[1]) / 2, up = [mx, my + smile * 22], dn = [mx, my + smile * 22 + open * 48];
  for (const [g, lw] of [[s, w * 1.6], [ik, w]]) {
    if (open < .04) { g.lineCap = 'round'; g.lineWidth = lw; g.strokeStyle = PC.mouth; g.beginPath(); g.moveTo(...L); g.quadraticCurveTo(...up, ...R); g.stroke(); continue; }
    const mp = () => { g.beginPath(); g.moveTo(...L); g.quadraticCurveTo(...up, ...R); g.quadraticCurveTo(...dn, ...L); g.closePath(); };
    mp(); g.fillStyle = '#6a1d3a'; g.fill();
    g.save(); mp(); g.clip(); ell(g, mx, dn[1] - 8, (R[0] - L[0]) * .3, 12 + open * 8, 0, PG.rose); g.restore();
    mp(); g.lineWidth = lw * .8; g.strokeStyle = PC.mouth; g.lineJoin = 'round'; g.stroke();
  }
}
function propBlur(g, cx, cy, rx, ry, spin, C, n = 3, tips = false) { // a spinning propeller seen as a pale disc with ghosted blades
  if (g === s) { g.save(); g.globalAlpha *= .38; ell(g, cx, cy, rx, ry, 0, PG.white); g.globalAlpha *= .8; g.lineWidth = Math.max(rx, ry) * .04; g.strokeStyle = PG.cerulean; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.stroke(); g.restore(); }
  for (let gh = 3; gh >= 0; gh--) {
    g.save(); g.globalAlpha *= gh ? .18 : .85;
    for (let i = 0; i < n; i++) { const a = spin - gh * .25 + i * TAU / n; const tx = cx + Math.cos(a) * rx, ty = cy + Math.sin(a) * ry;
      g.lineCap = 'round'; g.strokeStyle = C.prop; g.lineWidth = Math.max(rx, ry) * .11; g.beginPath(); g.moveTo(cx, cy); g.lineTo(tx, ty); g.stroke(); }
    g.restore();
  }
  if (tips) for (let i = 0; i < n; i++) { const a = spin + i * TAU / n; dot(g, cx + Math.cos(a) * rx * .92, cy + Math.sin(a) * ry * .92, Math.max(rx, ry) * .09, PG.lemon); }
  dot(g, cx, cy, Math.max(rx, ry) * .14, C.nose);
}
function tyre(g, cx, cy, r, C, ang = 0) {
  dot(g, cx, cy, r, C.tyre); dot(g, cx, cy, r * .52, C.hub); dot(g, cx, cy, r * .2, C.tyre);
  if (g === s) for (let i = 0; i < 6; i++) { const a = ang + i * TAU / 6; dot(g, cx + Math.cos(a) * r * .78, cy + Math.sin(a) * r * .78, r * .09, '#544c86'); }
}

// ---- side view, facing right. Local units, about 620 long; (0,0) is the middle of the body.
const FUSE = [[285, -5], [275, -62], [225, -100], [110, -114], [-30, -112], [-170, -100], [-265, -82], [-320, -62], [-328, -38], [-285, -8], [-180, 44], [-40, 86], [110, 96], [220, 80], [275, 40]];
const SCREEN = [[95, -106], [215, -98], [268, -64], [280, -26], [200, -12], [96, -20]];
const EYES_SIDE = [[148, -60, 34, 40], [226, -56, 37, 43]];
function planeSide(x, y, sc, rot, o = {}) {
  const { t = 0, spin = t * 42, look = [.3, .3], lid = 0, squint = 0, smile = .25, open = 0, swing = [0, 0], belt = 0, buckle = 0, chime = 0, C = PC, sil = false } = o;
  if (!sil) { ik.save(); ik.globalCompositeOperation = 'destination-out'; planeSide(x, y, sc, rot, { ...o, sil: true, silG: ik, silCol: '#000' }); ik.restore(); }
  xf(x, y, sc, rot);
  const G = sil ? (o.silG || f) : s; const K = sil ? solid(o.silCol || '#000') : C; const ow = Math.max(11, 5 / sc);
  // tyres dangling on their struts (behind the body)
  [[120, 88], [-130, 82]].forEach(([bx, by], i) => {
    const a = swing[i], L = 72, tx = bx + Math.sin(a) * L, ty = by + Math.cos(a) * L;
    stroke(G, [[bx, by - 10], [tx, ty]], K.strut, 14);
    tyre(G, tx, ty, 38, K, t * 2 + i);
  });
  // tail fin and far stabiliser
  blob(G, [[-170, -96], [-250, -252], [-300, -264], [-324, -246], [-318, -60]], K.fin);
  if (!sil) contour(s, [[-170, -96], [-250, -252], [-300, -264], [-324, -246], [-318, -60]], ow);
  if (!sil) { G.save(); smoothPath(G, [[-170, -96], [-250, -252], [-300, -264], [-324, -246], [-318, -60]]); G.clip(); stroke(G, [[-330, -200], [-200, -190]], C.finStripe, 30); G.restore(); }
  // fuselage
  blob(G, FUSE, K.body);
  if (!sil) {
    s.save(); smoothPath(s, FUSE); s.clip();
    ell(s, -10, 98, 340, 66, 0, rgba(C.bodySh, .85));                           // belly in rose madder shade
    ell(s, 20, -98, 250, 24, -.02, C.bodyHi);                                    // sunlit back
    s.beginPath(); s.moveTo(-340, -34); s.lineTo(200, -40); s.lineTo(200, -14); s.lineTo(-340, -4); s.closePath(); s.fillStyle = C.cheat; s.fill(); // cheat line
    for (let i = 0; i < 6; i++) { const wx = -238 + i * 52, wy = -22; dot(s, wx, wy, 14, C.port); dot(s, wx - 4, wy - 4, 4.5, PG.white); }
    // seat-belt strap around the middle, drawn up from the belly
    if (belt > 0) { const top = lerp(100, -120, belt); s.fillStyle = C.belt; s.fillRect(-218, top, 44, 110 - top); }
    s.restore(); contour(s, FUSE, ow);
  }
  // near stabiliser
  blob(G, [[-200, -40], [-298, -36], [-348, -10], [-332, 8], [-238, 2]], K.wing);
  if (!sil) contour(s, [[-200, -40], [-298, -36], [-348, -10], [-332, 8], [-238, 2]], ow * .8);
  // windscreen and face
  blob(G, SCREEN, K.screen);
  if (!sil) {
    ell(s, 172, 26, 30, 15, 0, rgba(C.cheek, .8));
    dot(s, 287, 12, 24, C.nose); dot(s, 280, 4, 8, PG.cerulean);
    // roof lamps: the seat-belt sign
    for (const lx of [40, 78]) { dot(s, lx, -116, 13, chime > .05 ? mixh('#c98a2c', '#ffd36a', chime) : '#9b5a3a'); }
    if (chime > .02) for (const lx of [40, 78]) { glow(lx, -116, 70, `rgba(255,200,90,${.55 * chime})`); glow(lx, -116, 18, `rgba(255,245,200,${.9 * chime})`); }
    EYES_SIDE.forEach(([ex, ey, rx, ry], i) => eye(ex, ey, rx, ry, { look, lid, squint, lidCol: C.body }, 11 + i));
    mouth([210, 54], [266, 50], smile, open, 7);
  }
  // near wing (level, coming toward camera), engine nacelle and propeller
  const WING = [[96, 20], [-104, 26], [-150, 90], [-40, 92]];
  blob(G, WING, K.wing);
  if (!sil) { s.save(); smoothPath(s, WING); s.clip(); stroke(s, [[-170, 92], [-20, 92]], C.wingSh, 22); stroke(s, [[80, 22], [-110, 28]], '#fde38a', 8); s.restore(); contour(s, WING, ow); }
  blob(G, [[88, 58], [70, 40], [-10, 36], [-70, 46], [-70, 70], [-10, 80], [70, 76]], K.body);
  if (!sil) contour(s, [[88, 58], [70, 40], [-10, 36], [-70, 46], [-70, 70], [-10, 80], [70, 76]], ow * .8);
  if (!sil) { stroke(s, [[60, 44], [-50, 48]], C.bodyHi, 7); ell(s, 90, 58, 9, 20, 0, PG.indigo); }
  if (!sil) propBlur(s, 104, 58, 34, 80, spin * .3, C, 3, true);
  // belt buckle pops on
  if (!sil && buckle > 0) {
    const k = ease.back(buckle);
    s.save(); s.translate(-196, -8); s.scale(k, k); s.fillStyle = C.buckle; s.fillRect(-28, -24, 56, 48); s.fillStyle = C.belt; s.fillRect(-14, -12, 28, 24); s.restore();
    ik.save(); ik.translate(-196, -8); ik.scale(k, k); ik.strokeStyle = PG.indigo; ik.lineWidth = 4; ik.strokeRect(-28, -24, 56, 48); ik.restore();
  }
  unxf();
  if (!sil) planeSide(x, y, sc, rot, { ...o, sil: true, silG: mk, silCol: '#fff' });
}

// ---- front view from slightly below. (0,0) is the middle of the fuselage.
const WING_R = [[60, 4], [560, 18], [592, 30], [562, 44], [60, 54]];
function planeFront(x, y, sc, rot, o = {}) {
  const { t = 0, spin = t * 40, look = [0, .5], lid = 0, squint = 0, smile = .35, open = 0, swing = [0, 0], C = PC, sil = false, props = true } = o;
  if (!sil) { ik.save(); ik.globalCompositeOperation = 'destination-out'; planeFront(x, y, sc, rot, { ...o, sil: true, silG: ik, silCol: '#000', props: false }); ik.restore(); }
  xf(x, y, sc, rot);
  const G = sil ? (o.silG || f) : s, K = sil ? solid(o.silCol || '#000') : C, ow = Math.max(11, 5 / sc);
  blob(G, [[-16, -90], [-12, -262], [12, -262], [16, -90]], K.fin);
  blob(G, [[-200, -76], [200, -76], [206, -62], [-206, -62]], K.wing);
  for (const m of [1, -1]) {
    const pts = WING_R.map(([px, py]) => [px * m, py]);
    blob(G, pts, K.wing);
    if (!sil) { s.save(); smoothPath(s, pts); s.clip(); s.fillStyle = C.wingSh; s.fillRect(-620, 32, 1240, 40); s.restore(); contour(s, pts, ow); }
  }
  // tyres dangling below the belly
  for (const m of [1, -1]) {
    const bx = m * 64, by = 108, a = swing[m > 0 ? 0 : 1], tx = bx + Math.sin(a) * 90, ty = by + Math.cos(a) * 90;
    stroke(G, [[bx, by - 20], [tx, ty]], K.strut, 16);
    ell(G, tx, ty, 22, 44, 0, K.tyre); if (!sil) ell(s, tx, ty, 9, 22, 0, C.hub);
  }
  // nacelles under the wings
  for (const m of [1, -1]) { dot(G, m * 280, 46, 46, K.body); if (!sil) { dot(s, m * 280 - 10, 36, 18, C.bodyHi); dot(s, m * 280, 50, 28, PG.indigo); } }
  // fuselage
  ell(G, 0, 0, 126, 130, 0, K.body);
  if (!sil) {
    s.save(); s.beginPath(); s.ellipse(0, 0, 126, 130, 0, 0, TAU); s.clip();
    ell(s, 10, 92, 140, 70, 0, rgba(C.bodySh, .85)); ell(s, -40, -92, 70, 30, -.4, C.bodyHi); s.restore();
    s.beginPath(); s.ellipse(0, 0, 126, 130, 0, 0, TAU); s.lineWidth = ow; s.strokeStyle = PG.ultra; s.stroke();
    for (const m of [1, -1]) { s.beginPath(); s.arc(m * 280, 46, 46, 0, TAU); s.stroke(); }
    blob(s, [[-104, -96], [104, -96], [114, -28], [0, -12], [-114, -28]], C.screen);
    ell(s, -82, 42, 22, 13, 0, rgba(C.cheek, .8)); ell(s, 82, 42, 22, 13, 0, rgba(C.cheek, .8));
    dot(s, 0, 24, 26, C.nose); dot(s, -7, 16, 8, PG.cerulean);
    eye(-46, -56, 36, 42, { look, lid, squint, lidCol: C.body }, 21); eye(46, -56, 36, 42, { look, lid, squint, lidCol: C.body }, 22);
    mouth([-44, 74], [44, 74], smile, open, 7);
  }
  if (props && !sil) for (const m of [1, -1]) propBlur(s, m * 280, 50, 128, 128, spin * m + m, C, 3);
  unxf();
  if (!sil) planeFront(x, y, sc, rot, { ...o, sil: true, silG: mk, silCol: '#fff', props: false });
}

// ---- top view, nose up the screen. (0,0) is the middle of the fuselage.
function planeTop(x, y, sc, rot, o = {}) {
  const { t = 0, spin = t * 40, roll = 0, look = [0, -.6], C = PC } = o;
  xf(x, y, sc, rot);
  const cr = Math.cos(roll), ow = Math.max(11, 5 / sc);
  for (const m of [1, -1]) {
    const pts = [[60, -36], [575, 4], [595, 34], [570, 66], [60, 86]].map(([px, py]) => [px * m * (m * roll > 0 ? cr : 1), py]);
    blob(s, pts, m * roll > 0 ? mixh(C.wing, C.wingSh, .3) : C.wing);
    s.save(); smoothPath(s, pts); s.clip(); stroke(s, [[60 * m, 74], [580 * m, 56]], C.wingSh, 22); stroke(s, [[60 * m, -26], [570 * m, 10]], '#fde38a', 10); s.restore(); contour(s, pts, ow);
    const nx = m * 275 * (m * roll > 0 ? cr : 1);
    blob(s, [[nx, -128], [nx + 30, -100], [nx + 30, 40], [nx, 74], [nx - 30, 40], [nx - 30, -100]], C.body);
    stroke(s, [[nx - 8, -100], [nx - 8, 40]], C.bodyHi, 8);
    propBlur(s, nx, -136, 124, 12, spin * m, C, 2);
  }
  const STAB = [[0, 250], [212, 266], [218, 296], [0, 304], [-218, 296], [-212, 266]];
  blob(s, STAB, C.wing); contour(s, STAB, ow); blob(mk, STAB, '#fff');
  const FT = [[0, -336], [62, -302], [82, -200], [84, 0], [70, 150], [40, 292], [0, 322], [-40, 292], [-70, 150], [-84, 0], [-82, -200], [-62, -302]];
  blob(s, FT, C.body);
  blob(mk, FT, '#fff'); blob(mk, [[-600, -40], [600, -40], [600, 90], [-600, 90]], '#fff');
  ik.save(); ik.globalCompositeOperation = 'destination-out'; blob(ik, FT, '#000'); blob(ik, [[-600, -40], [600, -40], [600, 90], [-600, 90]], '#000'); blob(ik, [[0, 250], [218, 266], [218, 300], [-218, 300], [-218, 266]], '#000'); ik.restore();
  s.save(); smoothPath(s, FT); s.clip(); stroke(s, [[-60, -280], [-60, 280]], rgba(C.bodySh, .8), 40); stroke(s, [[22, -300], [22, 300]], C.bodyHi, 26);
  for (let i = 0; i < 6; i++) { dot(s, -66, -150 + i * 52, 11, C.port); dot(s, 66, -150 + i * 52, 11, C.port); } s.restore(); contour(s, FT, ow);
  blob(s, [[-9, 170], [9, 170], [7, 326], [-7, 326]], C.finStripe);
  blob(s, [[-64, -282], [64, -282], [72, -218], [0, -202], [-72, -218]], C.screen);
  eye(-31, -246, 26, 22, { look, lidCol: C.body }, 31); eye(31, -246, 26, 22, { look, lidCol: C.body }, 32);
  dot(s, 0, -330, 16, C.nose);
  unxf();
}
