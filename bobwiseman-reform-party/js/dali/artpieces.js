// Reform Party, Dali look: installations from Robin's own Burning Man photos (source/refs/artcars).
// scene hook: pushes {z, draw, shadow} into list.
// Homages, drawn from his photos, with no names and no readable text:
//   burger   - a giant hamburger (sesame bun, two patties, cheese, lettuce, tomato), about 4 m across, with a tall pole
//              sign beside it: a red panel with a yellow upside-down-arches "W", guyed with wires (burger.jpg)
//   jig      - two semi trucks (cab + tanker) bent into a towering arch: one stands on its nose, the second is balanced
//              upside down on top, the tankers bent like pipe elbows, wheels sticking out; about 15 m tall (big-rig-jig.jpg)
//   monolith - a tall tapered olive-green slab, 7.6 m, with a 2.5 m hole bored through near the top by one edge, 1 m
//              thick; by night the side that faces the Man takes the burn's rust light (green-monolith-day/night.jpg)
//   head     - a giant lavender head buried to the eyes: the skull's dome, half-lidded eyes, the nose running into the
//              playa, the ears; about 7.6 m across, 5.3 m tall (purple-head.jpg)
//   genie    - a slow mobile art car: a giant lace-white daisy on a Genie articulating boom lift, the boom sleeved like a
//              jointed stem, a woven stone-and-wicker planter of agave hiding the drive base; it creeps at walking pace
//              while the boom raises, bends at its knuckles and the bloom nods and turns (giant-flower-1/2/3.jpg)
// Real installations stand out on the open playa between the Esplanade (760 m) and the Man, off the promenades.
//
// ---------- where and when (placed for draft 9's camera; re-place them here when the camera changes) ----------
// X, Z: world metres (the Man is at 300, 45; the car drives along z = 0 until 3:20; the 9:00 promenade runs along z = 45).
// rot: the way the piece's front faces, as an angle: front = (sin rot, cos rot); PI faces -z, toward most of the day
// camera. scale: 1 = the sizes above. people: visitors standing and parked bikes at its foot.
// clock / r: where it sits on the city plan (from the Man), for the aerial.
// seen: where draft 9's camera sees it at readable size (song seconds), from the probe in the report.
// path (mobile pieces): [t, X, Z] keys at walking pace; lift(t): how far the boom is raised, 0..1.
// front: true draws the piece after the Man's fire (artpiecesFront), for a framing that sees the burn through the
// monolith's hole. It only takes effect once render.js lists 'artpiecesFront' in FRONT_HOOKS. Tested framing: monolith
// rot -1.12 (its hole on the line to the Man) and a drone pose [t, 223.3, 1.6, 82, -.12, 1300, 2.02] (world metres,
// as END_KEYS): the burning Man stands inside the hole. Draft 9 has no such pose, so it is off.
const ARTPIECES = [
  { kind: 'burger', X: -316, Z: -4, rot: -Math.PI / 2 - .3, scale: 1, sign: { lx: 5.2, lf: -1.6, rot: .35 }, people: 4,
    clock: '9:20', r: 600, seen: 'intro 3-7.6: on the open playa straight ahead of the drone as it glides in from the 9:00 Esplanade sound camp; the bun grows to about 140 px (the sign 260 px) at 7.4 before the drone passes over it' },
  { kind: 'jig', X: 265, Z: 110, rot: Math.PI - .2, scale: 1, people: 7,
    clock: '7:00', r: 72, seen: 'day 153-160, 163-184, 193-198 (h 120-255 px); night 212-268 on the left of the burn framings, dark against the city' },
  { kind: 'monolith', X: 244, Z: 72, rot: 2.8, scale: 1, people: 4, nightPeople: 8,
    clock: '8:10', r: 62, seen: 'day 152-160, 163-184, 193-198 (h 80-180 px); night 212-233 and 237-246 behind the crowd ring, its Man side lit rust' },
  { kind: 'head', X: 236, Z: 28, rot: 2.68, scale: 1, people: 5,
    clock: '8:50', r: 66, seen: 'grin 3, 180.5-184 (left third, h 225-250 px); also 159-172 in the background (behind the row on "rehearsed"), 173-177 below the refrain-3 drape' },
  { kind: 'genie', path: [[96, 230, 33], [131, 186, 32], [170, 140, 30]], X: 0, Z: 0, rot: Math.PI, scale: 1,
    lift: (t) => .3 + .7 * ease(t, 126.5, 131.6) - .45 * ease(t, 141, 148), // folded on the way in, raised on "poor person", lowered again after the bridge
    clock: '8:40-9:00', r: 125, seen: 'the poor person, 129.5-134.2: it creeps past behind her and lifts its bloom against the sky (h 330-350 px)' },
];

// ---------- shared helpers ----------
// the piece's own frame: lx to its right (seen from the front), ly up, lf forward (out of its front)
function apFrame(o) { const c = Math.cos(o.rot), s = Math.sin(o.rot), S = o.scale || 1;
  return (lx, ly, lf) => [o.X + S * (-lx * c + lf * s), S * ly, o.Z + S * (lx * s + lf * c)]; }
function apNormal(o, nx, nf) { const c = Math.cos(o.rot), s = Math.sin(o.rot); return [-nx * c + nf * s, nx * s + nf * c]; }
const apP = (w) => P(w[0], w[1], w[2]);
function apRing(cx, cz, y, r, n, wob) { const out = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + (wob ? wob(a) : 0)); out.push(P(cx + Math.cos(a) * rr, y, cz + Math.sin(a) * rr)); } return out; }
function apPath(pts, close = true) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); if (close) g.closePath(); }
const apShade = (c, f) => [c[0] * f, c[1] * f, c[2] * f];
// light on a face with horizontal normal n (world x, z) and up component ny: the sun by day, the burn by night
function apLight(t, n, ny, X, Z) {
  const night = nightAmt(t), sd = sunDir(t), ls = [-sd[0], -sd[1]], el = Math.max(sunEl(t), 0) * Math.PI / 180;
  const day = .58 + .42 * Math.max(0, (n[0] * ls[0] + n[1] * ls[1]) * Math.cos(el) + (ny || 0) * Math.sin(el) * .6);
  let nt = .5; const fg = typeof fireGlow === 'function' ? fireGlow(t) : 0;
  if (fg > 0) { const dx = MAN.x - X, dz = MAN.z - Z, d = Math.hypot(dx, dz) || 1; nt += .75 * fg * Math.max(0, (n[0] * dx + n[1] * dz) / d) * clamp(90 / d); }
  return lerp(day, nt, night);
}
// how much a face turned toward the Man burns rust at night (0..1)
function apRust(t, n, X, Z) { const fg = typeof fireGlow === 'function' ? fireGlow(t) : 0; if (fg <= 0) return 0; const dx = MAN.x - X, dz = MAN.z - Z, d = Math.hypot(dx, dz) || 1;
  return fg * nightAmt(t) * Math.max(0, (n[0] * dx + n[1] * dz) / d) * clamp(90 / d); }
// a thin cool rim of city light along a silhouette's top edge after dark (multiplied by the grade like everything else)
function apRim(pts, t, k, close) { const n = nightAmt(t); if (n < .05 || pts.length < 2) return; g.save(); g.globalCompositeOperation = 'lighter'; apPath(pts, close);
  g.strokeStyle = `rgba(170,190,255,${.28 * n})`; g.lineWidth = Math.max(1, .06 * k); g.lineJoin = 'round'; g.stroke(); g.restore(); }
// the camera's elevation angle over a point (radians): high views get footprints instead of billboards
const apElev = (X, Y, Z) => Math.atan2(C.y - Y, Math.hypot(X - C.x, Z - C.z));
// project a quad's corners and map (u, v) in [0, 1] onto it (bilinear; fine for a sign-sized panel)
const apQuad = (c00, c10, c01, c11) => (u, v) => [lerp(lerp(c00[0], c10[0], u), lerp(c01[0], c11[0], u), v), lerp(lerp(c00[1], c10[1], u), lerp(c01[1], c11[1], u), v)];
// a world-space shadow for a polyline (tubes, poles that lean): drawn as one thick stroke on the ground
function apShadowLine(wpts, wm, t) { const sv = sunVec(t), a = shadowA(t); if (a < .01) return; const ps = wpts.map((w) => shadowPt(w[0], w[1], w[2], sv)); if (ps.some((p) => p[2] < 2.5)) return;
  const k = kAt(ps[0]); g.save(); apPath(ps, false); g.strokeStyle = `rgba(52,34,58,${a})`; g.lineWidth = Math.max(1, wm * k); g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); g.restore(); }

// ---------- visitors: people standing about and bikes parked at a piece's foot ----------
const AP_COLS = ['#d8452f', '#2f6fb5', '#e8b23a', '#7a3c8c', '#3c8c5a', '#f2ede0', '#ee9a42', '#47c1ba'];
function apVisitors(o, t, list) {
  const n0 = o.people || 0, n = n0 + (o.nightPeople || 0); if (!n) return; /* the night ones gather at dusk, on their way to the burn */ const F = apFrame(o), R = { burger: 3.2, jig: 6.5, monolith: 3.4, head: 4.8 }[o.kind] || 4;
  for (let i = 0; i < n; i++) {
    const a = rnd(i, 3, o.X) * TAU, r = R + 1.2 + 2.6 * rnd(i, 4, o.Z), lx = Math.cos(a) * r, lf = Math.sin(a) * r * .8;
    const w = F(lx, 0, lf), p = P(w[0], 0, w[2]); if (p[2] < 3) continue; const k = kAt(p) * (o.scale || 1); if (k < .4 || p[0] < -60 || p[0] > W + 60) continue;
    const bike = i % 3 === 1, seed = i + o.kind.length * 7, al = clamp((p[2] - 3) / 3) * (i < n0 ? 1 : ease(t, 203 + (i - n0) * 1.1, 206 + (i - n0) * 1.1) * (1 - ease(t, 254, 258))); if (al <= .01) continue;
    list.push({ z: p[2], draw: () => { g.save(); g.globalAlpha = al; bike ? apBike(p[0], p[1], k, seed, t) : person(p[0], p[1], k, { step: 0, lift: 0, hat: seed % 6, cape: seed % 4 === 1, sit: 0 }, { body: AP_COLS[seed % 8], skin: ['#e8d4b4', '#c99a74', '#8c6448', '#f0dcc4'][seed % 4], dark: '#3a3040', lamp: '#f0d49a', hatc: AP_COLS[(seed + 3) % 8] }); g.restore(); },
      shadow: () => shadowStick(w[0], 0, 1.8, w[2], .45, t) });
  }
}
function apBike(x, y, k, seed, t) { // a parked playa bike side on, leaning on its stand
  const r = .34 * k, d = seed % 2 ? 1 : -1, col = AP_COLS[(seed + 1) % 8], lw = Math.max(1, .05 * k);
  g.strokeStyle = '#2a2420'; g.lineWidth = lw; for (const dx of [-.55, .55]) { g.beginPath(); g.arc(x + dx * k, y - r, r, 0, TAU); g.stroke(); }
  g.strokeStyle = col; g.lineWidth = Math.max(1, .07 * k); g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - .55 * k, y - r); g.lineTo(x - .05 * k, y - r); g.lineTo(x + .25 * k * d, y - .85 * k); g.lineTo(x - .3 * k, y - .85 * k); g.lineTo(x - .05 * k, y - r); g.moveTo(x + .25 * k * d, y - .85 * k); g.lineTo(x + .55 * k * d, y - r); g.stroke();
  g.fillStyle = '#2a2420'; g.fillRect(x - .38 * k, y - .92 * k, .2 * k, .06 * k); g.beginPath(); g.moveTo(x + .3 * k * d, y - .85 * k); g.lineTo(x + .32 * k * d, y - 1.02 * k); g.lineTo(x + .5 * k * d, y - 1.04 * k); g.strokeStyle = '#2a2420'; g.lineWidth = lw; g.stroke();
}

// ---------- 1. the burger ----------
// layers from the ground up: [y0, y1, radius profile (pairs of [y, r]), colour]
const AP_BURGER = [
  { prof: [[0, 1.86], [.12, 1.96], [.62, 1.97], [.76, 1.88]], col: '#e0956c', hi: '#f2b48c' },          // bottom bun, a fat disc
  { prof: [[.76, 1.82], [.88, 2.0], [1.24, 2.03], [1.36, 1.86]], col: '#5b4a42', hi: '#8a786c' },       // patty 1
  { cheese: 1.37, rot: .3 },
  { prof: [[1.4, 1.82], [1.52, 2.0], [1.88, 2.02], [2.0, 1.84]], col: '#5b4a42', hi: '#8a786c' },       // patty 2
  { cheese: 2.01, rot: -.45 },
  { prof: [[2.03, 1.8], [2.13, 1.86]], col: '#c8423a', hi: '#e2675a' },                                 // tomato
  { lettuce: 2.12 },
  { prof: [[2.2, 1.84], [2.32, 1.96], [2.6, 1.97], [2.86, 1.82], [3.08, 1.5], [3.24, 1.04], [3.34, .5], [3.37, 0]], col: '#e0956c', hi: '#f4b88e', top: true }, // the domed top bun
];
const AP_SEEDS = [...Array(46)].map((_, i) => ({ a: rnd(i, 21) * TAU, y: 2.62 + .7 * Math.pow(rnd(i, 22), .8), tilt: rnd(i, 23) * TAU }));
function apBunR(y) { const pr = AP_BURGER[7].prof; for (let i = 1; i < pr.length; i++) if (y <= pr[i][0]) return lerp(pr[i - 1][1], pr[i][1], (y - pr[i - 1][0]) / (pr[i][0] - pr[i - 1][0])); return 0; }
function apLayerFill(o, t, rings, col, hi) { // a body of revolution between rings: its hull, shaded across the view
  const pts = [].concat(...rings); if (!ok(pts)) return; const hl = hull(pts); if (hl.length < 3) return;
  const vx = o.X - C.x, vz = o.Z - C.z, vl = Math.hypot(vx, vz) || 1, rv = [vz / vl, -vx / vl], fv = [-vx / vl, -vz / vl];
  const xs = hl.map((p) => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), c = hex(col), h = hex(hi);
  const L = apLight(t, [-rv[0], -rv[1]], 0, o.X, o.Z), M = apLight(t, fv, 0, o.X, o.Z), R = apLight(t, rv, 0, o.X, o.Z);
  const tone = (l) => rgb(l > .9 ? mix(c, h, (l - .9) * 6) : apShade(c, .55 + .5 * l));
  const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, tone(L * .92)); gr.addColorStop(.5, tone(M)); gr.addColorStop(1, tone(R * .92));
  apPath(hl); g.fillStyle = gr; g.fill(); return hl;
}
function apBurger(o, t, p, k) {
  const F = apFrame(o), S = o.scale || 1, cx = o.X, cz = o.Z, n = k > 30 ? 40 : k > 8 ? 28 : 16, el = apElev(cx, 1.6, cz);
  let topHull = null;
  for (const L of AP_BURGER) {
    if (L.prof) { const rings = L.prof.map(([y, r]) => apRing(cx, cz, y * S, r * S, n)); const hl = apLayerFill(o, t, rings, L.col, L.hi); if (L.top) topHull = hl;
      if (L.top || !hl) continue;
      // the layer's upper face when the drone is above it (a flat ring top, only on the bun and patties)
      if (C.y > L.prof[L.prof.length - 1][0] * S + .05 && k > 3) { const rt = apRing(cx, cz, L.prof[L.prof.length - 1][0] * S, L.prof[L.prof.length - 1][1] * S, n); apPath(rt); g.fillStyle = rgb(apShade(hex(L.col), .78 + .2 * Math.sin(el))); g.fill(); }
      // patty texture: a darker char line round the middle
      if (L.col === '#5b4a42' && k > 6) { const mid = (L.prof[1][0] + L.prof[2][0]) / 2 * S, rr = apRing(cx, cz, mid, 2.04 * S, n), vis = rr.filter((q, i) => { const a = i / n * TAU; return Math.cos(a) * (C.x - cx) + Math.sin(a) * (C.z - cz) > 0; });
        if (vis.length > 2) { g.save(); g.globalAlpha = .35; apPath(vis.sort((a, b) => a[0] - b[0]), false); g.strokeStyle = '#2e241f'; g.lineWidth = Math.max(1, .06 * k); g.stroke(); g.restore(); } }
    } else if (L.cheese != null) { // a square slice: only its four corners poke out between the patties, as drooping dog-ears
      const y = L.cheese * S, hs = 1.86 * S, R0 = 1.92 * S, col = rgb(apShade(hex('#f0b62e'), .7 + .3 * apLight(t, [0, 0], .8, cx, cz))), vx = C.x - cx, vz = C.z - cz, vl = Math.hypot(vx, vz) || 1;
      for (let i = 0; i < 4; i++) { const a = L.rot + o.rot + Math.PI / 4 + i * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a), cr = hs * Math.SQRT2; // the corner's direction and distance
        if ((ca * vx + sa * vz) / vl < -.25) continue; // corners round the back stay hidden
        const e1 = [ca * R0 + sa * .62 * S, sa * R0 - ca * .62 * S], e2 = [ca * R0 - sa * .62 * S, sa * R0 + ca * .62 * S], tip = [ca * cr, sa * cr];
        const fp = [P(cx + e1[0], y, cz + e1[1]), P(cx + tip[0], y - .34 * S, cz + tip[1]), P(cx + e2[0], y, cz + e2[1])]; if (!ok(fp)) continue;
        apPath(fp); g.fillStyle = col; g.fill(); if (k > 8) { g.strokeStyle = 'rgba(150,100,20,.4)'; g.lineWidth = Math.max(1, .03 * k); g.stroke(); } }
    } else if (L.lettuce != null) { // a frilled green band sticking out under the top bun
      const y = L.lettuce * S, rings = [apRing(cx, cz, y - .04 * S, 2.06 * S, n * 2, (a) => .05 * Math.sin(a * 13) + .03 * Math.sin(a * 29)), apRing(cx, cz, y + .1 * S, 2.1 * S, n * 2, (a) => .06 * Math.sin(a * 11 + 1) + .03 * Math.sin(a * 23))];
      apLayerFill(o, t, rings, '#5d9b4c', '#86c06a');
      if (k > 6) { const lo = apRing(cx, cz, y - .1 * S, 2.12 * S, n * 2, (a) => .07 * Math.sin(a * 17 + 2)), vis = lo.filter((q, i) => { const a = i / (n * 2) * TAU; return Math.cos(a) * (C.x - cx) + Math.sin(a) * (C.z - cz) > 0; });
        if (vis.length > 2) { g.save(); apPath(vis.sort((a, b) => a[0] - b[0]), false); g.strokeStyle = '#3f7a3a'; g.lineWidth = Math.max(1, .1 * k); g.lineJoin = 'round'; g.stroke(); g.restore(); } }
    }
  }
  // sesame seeds on the side of the dome that faces the drone
  if (k > 4 && topHull) { const vx = C.x - cx, vy = C.y - 2.9 * S, vz = C.z - cz;
    for (const s of AP_SEEDS) { const r = apBunR(s.y) * S * 1.002, nx = Math.cos(s.a), nz = Math.sin(s.a), ny = clamp((s.y - 2.6) / .8) * .9, fac = nx * vx + nz * vz + ny * vy; if (fac <= 0) continue;
      const q = P(cx + nx * r, s.y * S, cz + nz * r); if (q[2] < 1) continue; const kk = kAt(q), sh = clamp(fac / Math.hypot(vx, vy, vz));
      g.save(); g.translate(q[0], q[1]); g.rotate(s.tilt); g.fillStyle = rgb(apShade(hex('#f3e6c4'), .75 + .25 * apLight(t, [nx, nz], ny, cx, cz))); g.beginPath(); g.ellipse(0, 0, Math.max(.6, .085 * kk), Math.max(.4, .045 * kk * (.4 + .6 * sh)), 0, 0, TAU); g.fill(); g.restore(); } }
  if (topHull) apRim(topHull, t, k, true);
}
function apSign(o, t) { // the pole sign: a yellow pole on a white bucket, the red panel with the yellow arches, guy wires
  const F = apFrame(o), s = o.sign, S = o.scale || 1, b = F(s.lx, 0, s.lf), q0 = P(b[0], 0, b[2]); if (q0[2] < 2) return; const k = kAt(q0);
  const sr = o.rot + s.rot, c = Math.cos(sr), sn = Math.sin(sr), at = (lx, ly) => P(b[0] - lx * c * S, ly * S, b[2] + lx * sn * S); // the panel's own plane
  // guy wires to three stakes
  g.save(); g.strokeStyle = 'rgba(70,64,60,.55)'; g.lineWidth = Math.max(.6, .015 * k); for (let i = 0; i < 3; i++) { const a = sr + .5 + i * TAU / 3, top = P(b[0], 4.0 * S, b[2]), st = P(b[0] + Math.cos(a) * 5.4 * S, 0, b[2] + Math.sin(a) * 5.4 * S); if (st[2] < 1) continue; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(st[0], st[1]); g.stroke(); g.fillStyle = '#b8b0a4'; g.fillRect(st[0] - .05 * k, st[1] - .2 * k, Math.max(1, .1 * k), .22 * k); }
  g.restore();
  // bucket and pole
  const bk = [at(-.32, 0), at(.32, 0), at(.28, .5), at(-.28, .5)]; if (ok(bk)) { poly(bk, rgb(apShade(hex('#ecebe4'), .7 + .3 * apLight(t, [sn, c], 0, b[0], b[2])))); }
  const pole = hex('#e8c23a'); seg(P(b[0], .45 * S, b[2]), P(b[0], 4.35 * S, b[2]), .2 * k, rgb(apShade(pole, .7 + .3 * apLight(t, [0, -1], 0, b[0], b[2]))));
  seg(P(b[0] + .05, .45 * S, b[2]), P(b[0] + .05, 4.35 * S, b[2]), .06 * k, rgb(mix(pole, [255, 245, 200], .4), .6));
  // the panel: a red shield, wide at the top, with a smaller box under it; a yellow edge
  const front = (sn * (C.x - b[0]) + c * (C.z - b[2])) >= 0, red = rgb(apShade(hex('#d42a28'), .62 + .38 * apLight(t, front ? [sn, c] : [-sn, -c], 0, b[0], b[2])));
  const up = [at(-.92, 6.25), at(.92, 6.25), at(.62, 4.95), at(-.62, 4.95)], lo = [at(-.66, 4.98), at(.66, 4.98), at(.6, 4.3), at(-.6, 4.3)];
  if (!ok(up) || !ok(lo)) return;
  poly(lo, red); poly(up, red);
  g.save(); g.lineJoin = 'round'; apPath(lo); g.strokeStyle = '#f2c230'; g.lineWidth = Math.max(1, .05 * k); g.stroke(); g.restore();
  if (k > 6) { const m = apQuad(lo[3], lo[2], lo[0], lo[1]); g.fillStyle = 'rgba(242,194,48,.7)'; for (const v of [.42, .66]) { const a = m(.2, v), bb = m(.8, v); g.fillRect(Math.min(a[0], bb[0]), a[1] - .02 * k, Math.abs(bb[0] - a[0]), Math.max(1, .05 * k)); } } // a strip of tiny lettering, too small to read
  // the yellow "W": two upside-down arches drawn into the panel's own perspective
  const map = apQuad(up[0], up[1], up[3], up[2]), wpts = []; // u across, v down the panel
  const bez = (p0, p1, p2, p3, n) => { for (let i = 0; i <= n; i++) { const u = i / n, a = (1 - u) ** 3, bb = 3 * u * (1 - u) ** 2, cc = 3 * u * u * (1 - u), d = u ** 3; wpts.push([a * p0[0] + bb * p1[0] + cc * p2[0] + d * p3[0], a * p0[1] + bb * p1[1] + cc * p2[1] + d * p3[1]]); } };
  bez([.12, .05], [.13, 1.1], [.49, 1.1], [.5, .24], 12); bez([.5, .24], [.51, 1.1], [.87, 1.1], [.88, .05], 12);
  g.save(); apPath(wpts.map(([u, v]) => map(u, v)), false); g.strokeStyle = '#f5c52c'; g.lineWidth = Math.max(1.2, .17 * k); g.lineJoin = 'round'; g.lineCap = 'butt'; g.stroke(); g.restore();
  apRim(up.slice(0, 2), t, k, false);
}
function apBurgerShadow(o, t) {
  const S = o.scale || 1, pts = []; for (const [y, r] of [[0, 1.95], [2.4, 1.95], [3.1, 1.5]]) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; pts.push([o.X + Math.cos(a) * r * S, y * S, o.Z + Math.sin(a) * r * S]); } shadowOf(pts, t);
  if (o.sign) { const b = apFrame(o)(o.sign.lx, 0, o.sign.lf), sr = o.rot + o.sign.rot, c = Math.cos(sr), sn = Math.sin(sr); shadowStick(b[0], 0, 4.4 * S, b[2], .2, t);
    shadowOf([[b[0] + .92 * c * S, 6.25 * S, b[2] - .92 * sn * S], [b[0] - .92 * c * S, 6.25 * S, b[2] + .92 * sn * S], [b[0] - .6 * c * S, 4.3 * S, b[2] + .6 * sn * S], [b[0] + .6 * c * S, 4.3 * S, b[2] - .6 * sn * S]], t); }
}

// ---------- 2. the big rig arch ----------
// In its own plane: x along the arch, y up, metres; laid out from the photo (one truck nose-down on the ground on the
// right, its tanker climbing and bending over to the left; the second truck upside down on top, its cab hanging on the
// left, its tanker arching over to the right, its trailer wheels resting on the first tank).
const AP_JIG = {
  tankA: [[2.55, 4.3], [2.85, 5.6], [3.0, 6.9], [2.95, 7.9], [2.6, 8.8], [1.95, 9.45], [1.0, 9.75], [-.2, 9.8], [-1.5, 9.75], [-2.7, 9.68]],
  tankB: [[-3.55, 8.1], [-3.8, 9.3], [-3.82, 10.4], [-3.6, 11.5], [-3.1, 12.4], [-2.3, 12.95], [-1.25, 13.15], [0, 13.2], [1.3, 13.12]],
  D: 2.05,
  cabA: { nose: [.55, .05], ang: 60 * Math.PI / 180, roof: 1 },   // standing on its nose, roof to the upper left
  cabB: { nose: [-1.55, 4.45], ang: 117 * Math.PI / 180, roof: -1 }, // upside down, hanging, roof to the upper right
  wheels: [[5.15, 6.0], [4.75, 4.65], [-1.75, 14.75], [-.2, 14.75], [-1.75, 11.45], [-.2, 11.45], [-5.65, 10.9], [-5.5, 9.35]],
  frames: [[[4.35, 6.85], [4.95, 3.85]], [[-5.05, 11.75], [-4.6, 8.65]], [[-2.4, 14.9], [.45, 14.9]], [[-2.4, 11.3], [.45, 11.3]]],
};
const AP_STEEL = ['#eef0f0', '#b9bdc0', '#878c90', '#53575c'];
function apJigAffine(o, ly) { // the plane's local axes on screen at height ly (an affine stand-in for the perspective)
  const F = apFrame(o), o0 = apP(F(0, ly, 0)), ex = apP(F(1, ly, 0)), ey = apP(F(0, ly + 1, 0)); if (o0[2] < 2 || ex[2] < 2 || ey[2] < 2) return null;
  return { ox: o0[0], oy: o0[1], ax: ex[0] - o0[0], ay: ex[1] - o0[1], bx: ey[0] - o0[0], by: ey[1] - o0[1], k: kAt(o0) };
}
function apJigTube(o, t, pts, D, F) {
  const sp = pts.map(([x, y]) => apP(F(x, y, 0))); if (!ok(sp)) return; const w = D * kAt(sp[0]), L = apLight(t, apNormal(o, 0, 1), 0, o.X, o.Z) * (1 - .55 * nightAmt(t)), steel = AP_STEEL.map(hex);
  const nj = nightAmt(t), sh = (i) => rgb(apShade(steel[i], lerp(.7 + .35 * L, .22 + .45 * L, nj)));
  for (let i = 0; i < sp.length - 1; i++) { const a = sp[i], b = sp[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2, ext = .03 * w;
    const ax = a[0] - dx / l * ext, ay = a[1] - dy / l * ext, bx = b[0] + dx / l * ext, by = b[1] + dy / l * ext;
    const gr = g.createLinearGradient(a[0] + nx, a[1] + ny, a[0] - nx, a[1] - ny); gr.addColorStop(0, sh(3)); gr.addColorStop(.28, sh(1)); gr.addColorStop(.42, sh(0)); gr.addColorStop(.62, sh(1)); gr.addColorStop(1, sh(2));
    g.beginPath(); g.moveTo(ax + nx, ay + ny); g.lineTo(bx + nx, by + ny); g.lineTo(bx - nx, by - ny); g.lineTo(ax - nx, ay - ny); g.closePath(); g.fillStyle = gr; g.fill(); }
  // seams at every elbow joint, and a riveted band now and then
  if (w > 4) { g.save(); g.strokeStyle = rgb(apShade(steel[3], .8)); g.lineWidth = Math.max(1, .045 * w); g.lineCap = 'butt';
    for (let i = 1; i < sp.length - 1; i++) { const a = sp[i - 1], b = sp[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2; g.beginPath(); g.moveTo(sp[i][0] + nx, sp[i][1] + ny); g.lineTo(sp[i][0] - nx, sp[i][1] - ny); g.stroke(); }
    g.restore(); }
  // the end cap on the open end
  const e = sp[sp.length - 1], f = sp[sp.length - 2], dx = e[0] - f[0], dy = e[1] - f[1], l = Math.hypot(dx, dy) || 1;
  g.save(); g.translate(e[0], e[1]); g.rotate(Math.atan2(dy, dx)); g.fillStyle = sh(2); g.beginPath(); g.ellipse(0, 0, w * .16, w / 2, 0, 0, TAU); g.fill(); g.fillStyle = sh(1); g.beginPath(); g.ellipse(w * .03, 0, w * .1, w * .36, 0, 0, TAU); g.fill(); g.restore();
  return sp;
}
function apCab(A, c, t, L) { // a cab-over-engine truck cab in its own frame: u from the nose back, v from the chassis up
  const ca = Math.cos(c.ang), sa = Math.sin(c.ang), vx = -sa * c.roof, vy = ca * c.roof; // v is u turned 90 degrees
  const to = (u, v) => { const x = c.nose[0] + ca * u + vx * v, y = c.nose[1] + sa * u + vy * v; return [A.ox + A.ax * x + A.bx * y, A.oy + A.ay * x + A.by * y]; };
  const fill = (pts, col) => { apPath(pts.map(([u, v]) => to(u, v))); g.fillStyle = col; g.fill(); };
  const nc = nightAmt(t), sh = (h, f) => rgb(apShade(hex(h), (f || 1) * lerp(.66 + .34 * L, .2 + .45 * L, nc)));
  // chassis rails and the fuel tank
  fill([[.2, .15], [5.2, .15], [5.2, .5], [.2, .5]], sh('#2c2a2c'));
  fill([[2.6, .2], [3.9, .2], [3.9, -.55], [2.6, -.55]], sh('#c3c7cb')); fill([[2.6, -.15], [3.9, -.15], [3.9, -.3], [2.6, -.3]], sh('#80868c'));
  // the cab: a tall box with a sloped windscreen, a sleeper behind it, white with blue stripes
  fill([[0, .45], [.15, 3.0], [2.7, 3.15], [2.75, .45]], sh('#dde5ee'));
  fill([[2.7, .5], [4.1, .5], [4.1, 3.05], [2.7, 3.15]], sh('#c8d2de'));
  fill([[0, 1.25], [2.7, 1.62], [2.7, 1.86], [.03, 1.5]], sh('#2c56ad')); fill([[0, .95], [2.7, 1.3], [2.7, 1.42], [.02, 1.08]], sh('#2c56ad'));
  fill([[2.7, 1.62], [4.1, 1.8], [4.1, 2.02], [2.7, 1.86]], sh('#2c56ad'));
  fill([[.08, 2.1], [.15, 2.9], [1.1, 2.95], [1.05, 2.15]], sh('#2a323c')); // windscreen
  fill([[1.3, 2.2], [1.35, 2.85], [2.3, 2.92], [2.25, 2.25]], sh('#2a323c')); // side window
  fill([[-.12, .45], [.08, .45], [.08, 1.15], [-.12, 1.15]], sh('#c9ccd0')); // grille / bumper
  fill([[-.2, .3], [.25, .3], [.25, .55], [-.2, .55]], sh('#8f949a'));
  fill([[3.55, 3.05], [3.75, 3.05], [3.85, 4.1], [3.65, 4.1]], sh('#c3c7cb')); // exhaust stack
  // its own wheels: the steer tyre under the front and the drive axle behind (on the upside-down cab they point at the sky)
  const kk = Math.hypot(A.bx, A.by); for (const u of [1.05, 4.75]) { const q = to(u, .05); apWheel(q[0], q[1], .62 * kk, kk, t, L); }
  return to;
}
function apWheel(x, y, r, k, t, L, shade) { // a dual truck tyre seen from the side, sticking out of the structure
  g.fillStyle = rgb(apShade([34, 32, 34], .8 + .4 * L)); g.beginPath(); g.arc(x + .12 * r, y + .06 * r, r, 0, TAU); g.fill();
  g.fillStyle = rgb(apShade([46, 44, 46], .8 + .4 * L)); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  if (r > 3) { g.fillStyle = rgb(apShade(hex('#9aa0a6'), .7 + .35 * L)); g.beginPath(); g.arc(x, y, r * .52, 0, TAU); g.fill(); g.fillStyle = rgb(apShade(hex('#5a5f64'), .8)); g.beginPath(); g.arc(x, y, r * .22, 0, TAU); g.fill();
    if (r > 8) { g.fillStyle = '#3a3d40'; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.arc(x + Math.cos(a) * r * .37, y + Math.sin(a) * r * .37, r * .04, 0, TAU); g.fill(); } } }
}
function apJig(o, t, p, k) {
  const F = apFrame(o), S = o.scale || 1, el = apElev(o.X, 7, o.Z);
  if (el > .75) { // from high up: the arch as a grey bar with wheels, lying in its plane, and its long shadow does the rest
    const a = apP(F(-5.8, 6, 0)), b = apP(F(5.6, 6, 0)); if (a[2] > 1 && b[2] > 1) seg(a, b, 2 * k, '#9a9ea2'); return; }
  const A = apJigAffine(o, 7), L = apLight(t, apNormal(o, 0, 1), 0, o.X, o.Z) * (1 - .55 * nightAmt(t)); if (!A) return; /* by night it stands dark against the city lights */
  const D = AP_JIG.D * S, kk = Math.hypot(A.bx, A.by);
  const tp = (x, y) => [A.ox + A.ax * x + A.bx * (y - 7), A.oy + A.ay * x + A.by * (y - 7)];
  // wheel frames behind, the tanks, the cabs, then the wheels on top (as in the photo, they stick out over everything)
  g.save(); g.lineCap = 'round'; for (const [a, b] of AP_JIG.frames) { const pa = tp(a[0], a[1]), pb = tp(b[0], b[1]); g.strokeStyle = rgb(apShade([40, 38, 40], .8 + .4 * L)); g.lineWidth = Math.max(1, .32 * kk); g.beginPath(); g.moveTo(pa[0], pa[1]); g.lineTo(pb[0], pb[1]); g.stroke(); } g.restore();
  const A7 = { ox: A.ox - A.bx * 7, oy: A.oy - A.by * 7, ax: A.ax, ay: A.ay, bx: A.bx, by: A.by };
  apCab(A7, AP_JIG.cabA, t, L);
  const sa = apJigTube(o, t, AP_JIG.tankA, D, F), sb = apJigTube(o, t, AP_JIG.tankB, D, F);
  apCab(A7, AP_JIG.cabB, t, L);
  for (const [x, y] of AP_JIG.wheels) { const q = tp(x, y); apWheel(q[0], q[1], .66 * kk, kk, t, L); }
  if (sb) apRim(sb.slice(2, 8), t, kk, false);
}
function apJigShadow(o, t) {
  const F = apFrame(o), D = AP_JIG.D * (o.scale || 1); apShadowLine(AP_JIG.tankA.map(([x, y]) => F(x, y, 0)), D, t); apShadowLine(AP_JIG.tankB.map(([x, y]) => F(x, y, 0)), D, t);
  apShadowLine([F(.5, 0, 0), F(2.6, 4.3, 0)], 2.6, t); apShadowLine([F(-1.6, 4.4, 0), F(-3.6, 8.2, 0)], 2.6, t);
}

// ---------- 3. the green monolith ----------
// the slab in its own frame: base 4 m wide, 7.6 m tall, the left edge leaning in, 1 m thick; the hole is 2.5 m across,
// its centre 5.3 m up and toward the right edge, so it nearly breaks the side
const AP_MONO = { bl: -2.0, br: 2.0, tl: -.55, tr: 1.7, h: 7.6, th: .5, hx: .43, hy: 5.0, hr: 1.25 };
const AP_STREAKS = [...Array(14)].map((_, i) => ({ u: rnd(i, 51), w: .03 + .07 * rnd(i, 52), y0: .1 + 2.5 * rnd(i, 53), y1: 3.5 + 4 * rnd(i, 54), d: rnd(i, 55) < .5 }));
function apMonoGeo(o) {
  const F = apFrame(o), m = AP_MONO, S = o.scale || 1;
  const v = (lx, ly, lf) => apP(F(lx, ly, lf));
  const front = [v(m.bl, 0, m.th), v(m.br, 0, m.th), v(m.tr, m.h, m.th), v(m.tl, m.h, m.th)], back = [v(m.bl, 0, -m.th), v(m.br, 0, -m.th), v(m.tr, m.h, -m.th), v(m.tl, m.h, -m.th)];
  const holeF = [], holeB = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, x = m.hx + Math.cos(a) * m.hr, y = m.hy + Math.sin(a) * m.hr; holeF.push(v(x, y, m.th)); holeB.push(v(x, y, -m.th)); }
  return { F, front, back, holeF, holeB };
}
function apMonolith(o, t, p, k) {
  const { F, front, back, holeF, holeB } = apMonoGeo(o), m = AP_MONO; if (!ok(front) || !ok(back)) return;
  const cam = [C.x, C.y, C.z], facing = (n, w) => n[0] * (cam[0] - w[0]) + n[1] * (cam[2] - w[2]) > 0;
  const nF = apNormal(o, 0, 1), nB = apNormal(o, 0, -1), nR = apNormal(o, 1, .06), nL = apNormal(o, -.99, -.0), night = nightAmt(t);
  const green = hex('#a5bf3c'), olive = hex('#b4cc48'), base = mix(green, olive, night), rust = hex('#ff8a3a'); // by night a brighter olive so it survives the dusk grade
  const col = (n, f, side) => { const l = apLight(t, n, 0, o.X, o.Z), r = apRust(t, n, o.X, o.Z) * (side ? 1.7 : .25); return rgb(mix(apShade(base, (f || 1) * (.5 + .52 * l)), rust, clamp(r))); }; // the burn turns the edges rust, the big faces stay olive
  const wF = F(0, 3, m.th), wB = F(0, 3, -m.th), wR = F(1.9, 3, 0), wL = F(-1.45, 3, 0);
  const top = [front[3], front[2], back[2], back[3]];
  // side faces first (they never overlap the face with the hole)
  if (facing(nR, wR)) poly([front[1], back[1], back[2], front[2]], col(nR, .86, true));
  if (facing(nL, wL)) poly([back[0], front[0], front[3], back[3]], col(nL, .86, true));
  if (C.y > m.h * (o.scale || 1)) poly(top, col([0, 0], .95));
  const showF = facing(nF, wF), face = showF ? front : back, hn = showF ? holeF : holeB, hf = showF ? holeB : holeF;
  // the big face with the hole cut through it (evenodd), then the tunnel's inside wall in the hole
  g.save(); g.beginPath(); face.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); hn.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath();
  g.fillStyle = col(showF ? nF : nB); g.fill('evenodd');
  // weathering: long faint streaks running down from the top, and a darker grime band at the foot
  if (k > 3) { g.clip('evenodd'); const map = apQuad(face[3], face[2], face[0], face[1]); // u across, v down
    for (const s of AP_STREAKS) { const a = map(s.u, 1 - s.y1 / m.h), b = map(s.u + .01, 1 - s.y0 / m.h); g.strokeStyle = s.d ? 'rgba(60,72,20,.16)' : 'rgba(235,240,190,.13)'; g.lineWidth = Math.max(1, s.w * k); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
    const f0 = map(0, 1), f1 = map(1, 1), f2 = map(1, .9), f3 = map(0, .9); const gr = g.createLinearGradient(0, f0[1], 0, f3[1]); gr.addColorStop(0, 'rgba(70,60,30,.28)'); gr.addColorStop(1, 'rgba(70,60,30,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(f0[0], f0[1]); g.lineTo(f1[0], f1[1]); g.lineTo(f2[0], f2[1]); g.lineTo(f3[0], f3[1]); g.closePath(); g.fill(); }
  g.restore();
  // the tunnel: inside the near hole, everything that is not the far opening (you see the playa or the sky through that)
  g.save(); apPath(hn); g.clip(); g.beginPath(); hn.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); hf.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath();
  const tun = mix(hex('#41528c'), hex('#2a2a3a'), night * .6), tl = apLight(t, showF ? nB : nF, .3, o.X, o.Z), rr = apRust(t, showF ? nB : nF, o.X, o.Z);
  const hc = apP(F(m.hx, m.hy, 0)), gr = g.createRadialGradient(hc[0], hc[1], 0, hc[0], hc[1], m.hr * k * 1.1); gr.addColorStop(0, rgb(mix(apShade(tun, .55 + .4 * tl), rust, rr * .6))); gr.addColorStop(1, rgb(mix(apShade(tun, .85 + .3 * tl), rust, rr * .8)));
  g.fillStyle = gr; g.fill('evenodd'); g.restore();
  // a bright lip on the hole's rim, and the little foot plate at the bottom corner (both in the photo)
  if (k > 5) { g.save(); apPath(hn); g.strokeStyle = rgb(apShade(base, 1.08), .55); g.lineWidth = Math.max(1, .05 * k); g.stroke(); g.restore();
    const fp = [apP(F(m.br - .1, 0, m.th + .05)), apP(F(m.br + .55, 0, m.th + .15)), apP(F(m.br + .1, .35, m.th + .02))]; if (ok(fp)) poly(fp, col(nF, .8)); }
  apRim([front[3], front[2], back[2]], t, k, false);
}
function apMonoShadow(o, t) { // the slab's shadow, with the hole's patch of sunlight in it
  const sv = sunVec(t), a = shadowA(t); if (a < .01) return; const F = apFrame(o), m = AP_MONO, S = o.scale || 1, sp = (w) => shadowPt(w[0], w[1], w[2], sv);
  const corners = [[m.bl, 0, m.th], [m.br, 0, m.th], [m.tr, m.h, m.th], [m.tl, m.h, m.th], [m.bl, 0, -m.th], [m.br, 0, -m.th], [m.tr, m.h, -m.th], [m.tl, m.h, -m.th]].map((c) => sp(F(...c)));
  if (!ok(corners)) return; const hl = hull(corners), hole = []; for (let i = 0; i < 32; i++) { const an = i / 32 * TAU; hole.push(sp(F(m.hx + Math.cos(an) * m.hr * .86, m.hy + Math.sin(an) * m.hr * .86, 0))); }
  g.save(); g.beginPath(); hl.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); if (ok(hole)) { hole.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); }
  g.fillStyle = `rgba(52,34,58,${a})`; g.fill('evenodd'); g.restore();
}

// ---------- 4. the lavender head ----------
function apSoft(pts) { // a closed path rounded through the midpoints of pts (local y up, as bmPath)
  const n = pts.length, m = (i) => { const a = pts[i % n], b = pts[(i + 1) % n]; return [(a[0] + b[0]) / 2, -(a[1] + b[1]) / 2]; };
  g.beginPath(); const s0 = m(n - 1); g.moveTo(s0[0], s0[1]); for (let i = 0; i < n; i++) { const q = m(i); g.quadraticCurveTo(pts[i][0], -pts[i][1], q[0], q[1]); } g.closePath(); }
// a body of revolution about its vertical axis with the face on one side; the features slide round with the view.
// local metres: a = half width at the ground, b = height above the playa
const AP_HEAD = { a: 3.8, b: 5.3 };
function apHeadOutline(a, b) { const out = []; for (let i = 0; i <= 32; i++) { const th = i / 32 * Math.PI, c = Math.cos(th), s = Math.sin(th); out.push([a * Math.sign(c) * Math.pow(Math.abs(c), .78), b * Math.pow(s, .9)]); } return out; } // straight sides at the playa, a full dome on top
const AP_HEAD_OUT = apHeadOutline(AP_HEAD.a, AP_HEAD.b);
const apHeadW = (y) => AP_HEAD.a * Math.pow(Math.max(0, 1 - Math.pow(clamp(y / AP_HEAD.b), 1 / .9)), .78 / 2); // half width at height y
function apHead(o, t, p, k) {
  const S = o.scale || 1, el = apElev(o.X, 2.5, o.Z), night = nightAmt(t);
  const lav = mix(hex('#a197e2'), hex('#8c82cc'), night * .3), view = Math.atan2(C.x - o.X, C.z - o.Z), phi = Math.atan2(Math.sin(view - o.rot), Math.cos(view - o.rot)); // 0 = we face it
  if (el > .7) { const rg = apRing(o.X, o.Z, 2.2 * S, AP_HEAD.a * .95 * S, 28); if (ok(rg)) { apPath(rg); g.fillStyle = rgb(apShade(lav, .75 + .25 * apLight(t, [0, 0], 1, o.X, o.Z))); g.fill(); } return; }
  bmBegin(p[0], p[1], k * S, 1); const det = k > 5;
  const sd = sunDir(t), sideL = apLight(t, [-Math.cos(view), Math.sin(view)], 0, o.X, o.Z), sideR = apLight(t, [Math.cos(view), -Math.sin(view)], 0, o.X, o.Z); // which screen side the light comes from
  const lx = (sideR - sideL) * 2.4, tone = (f) => rgb(apShade(lav, f));
  // the ears first, at the silhouette's sides (they turn with the head): rounded, close to the skull, a hollow inside
  for (const sgn of [-1, 1]) { const ang = phi + sgn * Math.PI / 2, vis = Math.cos(ang); if (vis < -.4) continue; const sn = Math.sin(ang), out = Math.sign(sn) || sgn, ex = sn * apHeadW(1), w = .7 * (.35 + .65 * Math.abs(sn)), x0 = ex - out * .2;
    g.beginPath(); g.moveTo(x0, -.15); g.bezierCurveTo(x0 + out * w * 1.1, -.05, x0 + out * w * 1.25, -1.2, x0 + out * w * .95, -1.75); g.bezierCurveTo(x0 + out * w * .7, -2.1, x0 + out * .1, -2.1, x0, -1.9); g.closePath();
    g.fillStyle = tone((out > 0 ? sideR : sideL) * .9 + .06); g.fill();
    if (det && Math.abs(sn) > .45) { g.beginPath(); g.moveTo(x0 + out * .1, -.4); g.bezierCurveTo(x0 + out * w * .75, -.35, x0 + out * w * .85, -1.2, x0 + out * w * .62, -1.6); g.bezierCurveTo(x0 + out * w * .4, -1.8, x0 + out * .15, -1.75, x0 + out * .12, -1.6); g.closePath(); g.fillStyle = tone(.6); g.fill(); } }
  // the dome
  const gr = g.createRadialGradient(lx, -AP_HEAD.b * .72, .3, lx * .4, -AP_HEAD.b * .4, AP_HEAD.a * 1.45);
  gr.addColorStop(0, tone(1.08)); gr.addColorStop(.55, tone(.93)); gr.addColorStop(1, tone(.68)); bmFill(AP_HEAD_OUT, gr);
  // the face: only while it is on our side of the head. Eyes about 2.2 m wide each, 1.85 m either side of the nose,
  // half closed under heavy lids; a brow ridge over each; the nose runs from between them down into the playa
  const fx = (psi, y) => Math.sin(psi + phi) * apHeadW(y), fv = (psi) => Math.cos(psi + phi);
  if (fv(0) > -.1) {
    const sq = (psi) => clamp(fv(psi));
    for (const sgn of [-1, 1]) { const psi = sgn * .53; if (fv(psi) < .05) continue; const ex = fx(psi, 1.4), w = 1.12 * (.25 + .75 * sq(psi)), cy = 1.38, inr = -sgn; // inr: toward the nose
      // the socket: a soft almond of shadow round the eye, deepest under the brow
      const sk = g.createLinearGradient(0, -(cy + .85), 0, -(cy - .6)); sk.addColorStop(0, tone(.66)); sk.addColorStop(.5, tone(.74)); sk.addColorStop(1, tone(.9));
      apSoft([[ex - w * 1.2, cy + .05], [ex - w * .75, cy + .72], [ex, cy + .86], [ex + w * .75, cy + .72], [ex + w * 1.2, cy + .05], [ex + w * .7, cy - .5], [ex, cy - .6], [ex - w * .7, cy - .5]]); g.fillStyle = sk; g.fill();
      // the brow ridge: a lit shelf over the socket
      bmLine([[ex - w * 1.15, cy + .72], [ex - w * .5, cy + 1.0], [ex + w * .3, cy + 1.02], [ex + w * 1.1, cy + .78]], .16, tone(1.02));
      // the eye itself, almost shut: the lid bulges down over it, a dark slit of lash line, the lower lid under it
      apSoft([[ex - w * .98, cy + .05], [ex - w * .6, cy + .5], [ex, cy + .6], [ex + w * .6, cy + .5], [ex + w * .98, cy + .05], [ex + w * .55, cy - .14], [ex, cy - .18], [ex - w * .55, cy - .14]]); g.fillStyle = tone(.97); g.fill();
      apSoft([[ex - w * .98, cy + .05], [ex - w * .55, cy - .14], [ex, cy - .18], [ex + w * .55, cy - .14], [ex + w * .98, cy + .05], [ex + w * .55, cy - .33], [ex, cy - .38], [ex - w * .55, cy - .33]]); g.fillStyle = tone(.8); g.fill();
      if (det) { bmLine([[ex - w * .98, cy + .05], [ex - w * .55, cy - .14], [ex, cy - .18], [ex + w * .55, cy - .14], [ex + w * .98, cy + .05]], .08, tone(.52));
        bmLine([[ex - w * .7, cy + .42], [ex, cy + .55], [ex + w * .7, cy + .42]], .05, tone(.78)); } }
    // the nose: wide where it goes into the playa, a lit side and a shadow side
    if (fv(0) > .05) { const nx = fx(0, 1), nw = (.3 + .7 * sq(0)), ns = sideR > sideL ? 1 : -1;
      bmFill([[nx - .32 * nw, 2.15], [nx + .32 * nw, 2.15], [nx + .62 * nw, .9], [nx + .72 * nw, 0], [nx - .72 * nw, 0], [nx - .62 * nw, .9]], tone(1.0));
      bmFill([[nx - ns * .05 * nw, 2.12], [nx - ns * .32 * nw, 2.15], [nx - ns * .62 * nw, .9], [nx - ns * .72 * nw, 0], [nx - ns * .12 * nw, 0]], tone(.76));
      if (det) bmOval(nx, .03, .9 * nw, .08, 'rgba(70,50,60,.3)'); }
  }
  // where it goes into the playa: a little ridge of drifted dust along the foot
  bmFill([[-AP_HEAD.a - .4, 0], [AP_HEAD.a + .4, 0], [AP_HEAD.a + .1, .1], [-AP_HEAD.a - .1, .1]], rgb(mix(PAL.groundFar, PAL.groundNear, .4), .7));
  g.restore();
  // the rim of city light along the dome after dark
  if (night > .05) { const pts = AP_HEAD_OUT.slice(4, 29).map(([x, y]) => [p[0] + x * k * S, p[1] - y * k * S]); apRim(pts, t, k, false); }
}
function apHeadShadow(o, t) { const S = o.scale || 1, pts = []; for (const [y, f] of [[0, 1], [2.5, .92], [4.4, .62], [5.2, .2]]) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; pts.push([o.X + Math.cos(a) * AP_HEAD.a * f * S, y * S, o.Z + Math.sin(a) * AP_HEAD.a * f * S]); } shadowOf(pts, t); }

// ---------- 5. the flower genie (a mobile art car) ----------
// A giant lace-white daisy on a Genie articulating boom lift: the woven stone-and-wicker planter full of agave hides
// the lift's wheeled drive base; the jointed "stem" is the boom, sleeved like bone or bamboo, its kinks the two
// knuckle joints; the bloom rides on the work platform at the tip. It creeps along the open playa at walking pace and
// the boom raises, lowers and bends while the head nods and turns. Lengths in metres, angles from the vertical.
const AP_GENIE = { base: [2.4, 1.6, .95], riser: [0, 1.0], L: [3.6, 3.2, 3.7], petal: 2.85, disc: .6, n: 21 };
function apPath2(path, t) { // [t, X, Z] keys: position and heading at t (parked at either end)
  if (t <= path[0][0]) { const a = path[0], b = path[1]; return [a[1], a[2], Math.atan2(b[1] - a[1], b[2] - a[2]), 0]; }
  for (let i = 1; i < path.length; i++) { const a = path[i - 1], b = path[i]; if (t <= b[0]) { const u = (t - a[0]) / (b[0] - a[0]), s = smooth(clamp(u * 8)) * smooth(clamp((1 - u) * 8)); // eases off and on at the ends of each leg
      const uu = i === 1 ? u : u, X = lerp(a[1], b[1], uu), Z = lerp(a[2], b[2], uu); return [X, Z, Math.atan2(b[1] - a[1], b[2] - a[2]), (i === 1 && u < .12) || (i === path.length - 1 && u > .88) ? s : 1]; } }
  const a = path[path.length - 2], b = path[path.length - 1]; return [b[1], b[2], Math.atan2(b[1] - a[1], b[2] - a[2]), 0]; }
function apGeniePose(o, t) { // where the genie is and how its boom stands at t
  const [X, Z, hd, mv] = apPath2(o.path, t), lift = o.lift ? clamp(o.lift(t)) : .6, sw = Math.sin(t * .37 + 1.1), sw2 = Math.sin(t * .23 + 2.4);
  // folded (head about 6 m up, the boom in a Z) to raised (about 12 m, leaning a little forward, as in the photos)
  const a1 = lerp(.95, .12, lift) + .05 * sw, a2 = a1 + lerp(-1.75, .22, lift) + .07 * sw2, a3 = a2 + lerp(1.15, -.32, lift) - .06 * sw;
  const turn = .25 * Math.sin(t * .19 + .6) + (o.turn || 0), nod = lerp(.15, .42, lift) + .1 * Math.sin(t * .41 + .3);
  return { X, Z, heading: hd, mv, rot: o.rot != null ? o.rot : hd + Math.PI / 2, a: [a1, a2, a3], turn, nod, scale: o.scale || 1 };
}
function apGenieJoints(st) { const F = apFrame(st), S = st.scale; let x = AP_GENIE.riser[0], y = AP_GENIE.riser[1]; const pts = [[x, y]];
  for (let i = 0; i < 3; i++) { x += Math.sin(st.a[i]) * AP_GENIE.L[i]; y += Math.cos(st.a[i]) * AP_GENIE.L[i]; pts.push([x, y]); }
  return { local: pts, world: pts.map(([lx, ly]) => F(lx, ly, 0)) }; }
function apGenieHead(st) { // the bloom's centre and its disc axes (n faces out of the flower) in world metres
  const J = apGenieJoints(st), tip = J.world[3], fa = st.rot + st.turn, ce = Math.cos(st.nod), n = [Math.sin(fa) * ce, Math.sin(st.nod), Math.cos(fa) * ce];
  let u = [n[2], 0, -n[0]]; const ul = Math.hypot(u[0], u[2]) || 1; u = [u[0] / ul, 0, u[2] / ul]; const v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
  const c = [tip[0] + n[0] * .35, tip[1] + n[1] * .35 + .2, tip[2] + n[2] * .35]; return { c, n, u, v, J }; }
const AP_PETALS = [...Array(AP_GENIE.n)].map((_, i) => ({ a: i / AP_GENIE.n * TAU + .13 * Math.sin(i * 2.7), L: AP_GENIE.petal * (.84 + .24 * rnd(i, 71)), w: .27 + .07 * rnd(i, 72), curl: (rnd(i, 73) - .5) * .25 }));
function apGenie(o, t, p, k) {
  const st = apGeniePose(o, t), S = st.scale, F = apFrame(st), night = nightAmt(t), L = apLight(t, apNormal(st, 0, 1), 0, st.X, st.Z), el = apElev(st.X, 4, st.Z);
  const { c, n, u, v, J } = apGenieHead(st), jw = J.world.map(apP); if (!ok(jw)) return;
  // the planter: a woven basket of stone and wicker, an oval drum, the agave and small flowers on top
  const [bx, bz, bh] = AP_GENIE.base, ring = (y, f) => { const out = []; for (let i = 0; i < 24; i++) { const an = i / 24 * TAU, w = F(Math.cos(an) * bx * f, y, Math.sin(an) * bz * f); out.push(apP(w)); } return out; };
  const r0 = ring(.05, .9), r1 = ring(bh * .45, 1.04), r2 = ring(bh, .88), side = hull([...r0, ...r1, ...r2]); if (!ok(side)) return;
  const stone = hex('#cbbba0'), gr = g.createLinearGradient(Math.min(...side.map((q) => q[0])), 0, Math.max(...side.map((q) => q[0])), 0);
  gr.addColorStop(0, rgb(apShade(stone, .62 + .4 * L))); gr.addColorStop(.5, rgb(apShade(stone, .75 + .3 * L))); gr.addColorStop(1, rgb(apShade(stone, .55 + .3 * L)));
  g.save(); apPath(side); g.fillStyle = gr; g.fill();
  if (k > 4) { g.clip(); // the nest: rows of rounded stones bound with wicker, the near side only
    for (let j = 0; j < 3; j++) { const y = bh * (.18 + j * .3), rr = ring(y, 1.03 - .06 * Math.abs(j - 1)); for (let i = 0; i < 24; i++) { const q = rr[(i + j) % 24]; if (q[2] > p[2] + .2 * bz * S) continue; const kq = kAt(q), sr = (.26 + .1 * rnd(i, j, 95)) * kq * S;
      g.fillStyle = rgb(apShade(i % 3 ? stone : hex('#a8967c'), .55 + .4 * L)); g.beginPath(); g.ellipse(q[0], q[1], sr * 1.3, sr * .8, 0, 0, TAU); g.fill(); } }
    g.strokeStyle = 'rgba(96,74,48,.5)'; g.lineWidth = Math.max(1, .05 * k); for (let j = 1; j < 3; j++) { const rr = ring(bh * j / 3, 1.03); g.beginPath(); rr.slice(0, 13).forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke(); } }
  g.restore();
  if (C.y > bh * S) { apPath(r2); g.fillStyle = rgb(apShade(hex('#5a4a34'), .7 + .3 * L)); g.fill(); }
  // the boom: three sleeved segments, swelling at the knuckles like bamboo or bone
  const sleeve = hex('#d9cba2'), shadeS = hex('#a8946a'), Wd = [.62, .55, .5].map((w) => w * S);
  for (let i = 0; i < 3; i++) { const a = jw[i], b = jw[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ka = kAt(a), kb = kAt(b), nx = -dy / l, ny = dx / l, wa = Wd[i] * ka / 2, wb = Wd[i] * .85 * kb / 2;
    const gg = g.createLinearGradient(a[0] + nx * wa, a[1] + ny * wa, a[0] - nx * wa, a[1] - ny * wa); gg.addColorStop(0, rgb(apShade(sleeve, .78 + .3 * L))); gg.addColorStop(.45, rgb(apShade(sleeve, .9 + .25 * L))); gg.addColorStop(1, rgb(apShade(shadeS, .7 + .3 * L)));
    g.beginPath(); g.moveTo(a[0] + nx * wa, a[1] + ny * wa); g.lineTo(b[0] + nx * wb, b[1] + ny * wb); g.lineTo(b[0] - nx * wb, b[1] - ny * wb); g.lineTo(a[0] - nx * wa, a[1] - ny * wa); g.closePath(); g.fillStyle = gg; g.fill();
    if (k > 4) { g.strokeStyle = rgb(apShade(shadeS, .7)); g.lineWidth = Math.max(1, .05 * ka); for (const f of [.3, .62]) { const q = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)], w2 = lerp(wa, wb, f) * .95; g.beginPath(); g.moveTo(q[0] + nx * w2, q[1] + ny * w2); g.quadraticCurveTo(q[0] + dx / l * w2 * .3, q[1] + dy / l * w2 * .3, q[0] - nx * w2, q[1] - ny * w2); g.stroke(); } } }
  for (let i = 1; i < 3; i++) { const q = jw[i], kq = kAt(q); g.fillStyle = rgb(apShade(sleeve, .82 + .28 * L)); g.beginPath(); g.ellipse(q[0], q[1], .5 * S * kq, .42 * S * kq, 0, 0, TAU); g.fill(); g.fillStyle = rgb(apShade(shadeS, .72 + .2 * L)); g.beginPath(); g.ellipse(q[0] + .12 * S * kq, q[1] + .1 * S * kq, .3 * S * kq, .26 * S * kq, 0, 0, TAU); g.fill(); }
  // the one big translucent leaf on a short wire stalk, off the lower segment
  { const ja = J.local[0], jb = J.local[1], f = .72, sx = lerp(ja[0], jb[0], f), sy = lerp(ja[1], jb[1], f), s0 = apP(F(sx, sy, 0)), s1 = apP(F(sx - .55, sy + .1, .1)), tipL = apP(F(sx - 2.0, sy - .45, .3)), ks = kAt(s0);
    if (s0[2] > 1 && s1[2] > 1 && tipL[2] > 1) { g.strokeStyle = '#4a4440'; g.lineWidth = Math.max(1, .04 * ks); g.beginPath(); g.moveTo(s0[0], s0[1]); g.lineTo(s1[0], s1[1]); g.stroke();
      const mx = (s1[0] + tipL[0]) / 2, my = (s1[1] + tipL[1]) / 2, ddx = tipL[0] - s1[0], ddy = tipL[1] - s1[1], wl = .32;
      g.beginPath(); g.moveTo(s1[0], s1[1]); g.quadraticCurveTo(mx - ddy * wl, my + ddx * wl, tipL[0], tipL[1]); g.quadraticCurveTo(mx + ddy * wl, my - ddx * wl, s1[0], s1[1]); g.closePath();
      g.fillStyle = `rgba(232,230,214,${.72 + .1 * L})`; g.fill(); g.strokeStyle = 'rgba(90,86,76,.7)'; g.lineWidth = Math.max(1, .03 * ks); g.stroke(); g.beginPath(); g.moveTo(s1[0], s1[1]); g.lineTo(tipL[0], tipL[1]); g.stroke(); } }
  // the agave and the little flowers crowding the planter (drawn flat at the planter's top, after the boom's foot)
  const top = apP(F(0, bh, 0)), kt = kAt(top); bmBegin(top[0], top[1], kt * S, 1);
  for (let i = 0; i < 22; i++) { const x0 = (rnd(i, 81) - .5) * 3.8, h = .7 + 1.6 * rnd(i, 82), lean = (rnd(i, 83) - .5) * 1.8 + x0 * .3, w = .16 + .18 * rnd(i, 84), col = ['#4f8a4a', '#6fa860', '#3f7a40'][i % 3];
    bmFill([[x0 - w, 0], [x0 + lean * .5 + w * .3, h * .6], [x0 + lean, h], [x0 + lean * .45 - w * .2, h * .55], [x0 + w, 0]], rgb(apShade(hex(col), .7 + .35 * L))); }
  for (let i = 0; i < 6; i++) { const x0 = (rnd(i, 85) - .5) * 3.4, h = .9 + .9 * rnd(i, 86); bmLine([[x0, 0], [x0 + .1, h]], .04, '#3f6a3a'); bmOval(x0 + .1, h + .08, .14, .1, i % 3 === 1 ? '#c84a3c' : '#f2efe4'); }
  g.restore();
  // the bloom: lace-white petals in the disc's own plane, the purple spiky centre, the little gold bug on it
  const at = (s, a, w, lift) => { const ca = Math.cos(a), sa = Math.sin(a), dx = ca * u[0] + sa * v[0], dy = ca * u[1] + sa * v[1], dz = ca * u[2] + sa * v[2], px = -sa * u[0] + ca * v[0], py = -sa * u[1] + ca * v[1], pz = -sa * u[2] + ca * v[2];
    return P(c[0] + (dx * s + px * w + n[0] * lift) * S, c[1] + (dy * s + py * w + n[1] * lift) * S, c[2] + (dz * s + pz * w + n[2] * lift) * S); };
  const facing = (n[0] * (C.x - c[0]) + n[1] * (C.y - c[1]) + n[2] * (C.z - c[2])) > 0, kc = kAt(P(c[0], c[1], c[2])), back = facing ? 1 : .82;
  const petalPts = (pe) => { const out = [], r0 = AP_GENIE.disc * .6, NS = 9; for (let j = 0; j <= NS; j++) { const f = j / NS, s2 = r0 + pe.L * f, w2 = pe.w * Math.pow(Math.sin(Math.PI * Math.min(1, Math.pow(f, 1.35))), .65) * (1 + (j % 2 ? .14 : -.1)); out.push(at(s2, pe.a + pe.curl * f, w2, .25 * f * f)); }
    for (let j = NS; j >= 0; j--) { const f = j / NS, s2 = r0 + pe.L * f, w2 = pe.w * Math.pow(Math.sin(Math.PI * Math.min(1, Math.pow(f, 1.35))), .65) * (1 + (j % 2 ? -.1 : .14)); out.push(at(s2, pe.a + pe.curl * f, -w2, .25 * f * f)); } return out; };
  const glow = night * .5; g.save(); g.lineJoin = 'round';
  for (const pe of AP_PETALS) { const pts = petalPts(pe); if (!ok(pts)) continue; apPath(pts);
    g.fillStyle = `rgba(${Math.round(244 * back)},${Math.round(242 * back)},${Math.round(232 * back)},${.8 + .12 * L})`; g.fill();
    if (kc > 3) { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = Math.max(.7, .03 * kc); g.stroke(); // the serrated lace edge
      const m0 = at(AP_GENIE.disc * .6, pe.a, 0, 0), m1 = at(AP_GENIE.disc * .6 + pe.L * .92, pe.a + pe.curl * .92, 0, .2); g.strokeStyle = 'rgba(150,150,140,.45)'; g.lineWidth = Math.max(.6, .025 * kc); g.beginPath(); g.moveTo(m0[0], m0[1]); g.lineTo(m1[0], m1[1]); g.stroke();
      if (kc > 10) { g.strokeStyle = 'rgba(170,170,160,.3)'; for (const f of [.3, .5, .7]) { const q = at(AP_GENIE.disc * .6 + pe.L * f, pe.a + pe.curl * f, 0, .25 * f * f), e1 = at(AP_GENIE.disc * .6 + pe.L * (f + .12), pe.a + pe.curl * f, pe.w * .7, .25 * f * f), e2 = at(AP_GENIE.disc * .6 + pe.L * (f + .12), pe.a + pe.curl * f, -pe.w * .7, .25 * f * f); g.beginPath(); g.moveTo(e1[0], e1[1]); g.lineTo(q[0], q[1]); g.lineTo(e2[0], e2[1]); g.stroke(); } } }
    if (glow > .02) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(200,190,255,${.22 * glow})`; g.fill(); g.restore(); } }
  g.restore();
  // the centre: a purple spiky boss
  const disc = []; for (let i = 0; i < 20; i++) disc.push(at(AP_GENIE.disc, i / 20 * TAU, 0, .25)); if (ok(disc)) { apPath(disc); g.fillStyle = rgb(apShade(hex('#6a4a86'), .7 + .3 * L)); g.fill();
    g.strokeStyle = rgb(apShade(hex('#a888c8'), .8 + .3 * L)); g.lineWidth = Math.max(1, .05 * kc); g.beginPath(); for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, q0 = at(AP_GENIE.disc * .25, a, 0, .45), q1 = at(AP_GENIE.disc * 1.15, a + .1, 0, .3 + .25 * (i % 2)); g.moveTo(q0[0], q0[1]); g.lineTo(q1[0], q1[1]); } g.stroke();
    const bug = at(AP_GENIE.disc * .45, Math.PI / 2 + .3, 0, .55); if (bug[2] > 1) { const kb = kAt(bug); g.fillStyle = rgb(apShade(hex('#e0aa2c'), .8 + .3 * L)); g.beginPath(); g.ellipse(bug[0], bug[1], .32 * S * kb, .24 * S * kb, .3, 0, TAU); g.fill();
      if (kb > 8) { g.fillStyle = 'rgba(255,240,170,.8)'; g.beginPath(); g.ellipse(bug[0] - .1 * kb, bug[1] - .07 * kb, .09 * kb, .05 * kb, .3, 0, TAU); g.fill(); g.strokeStyle = '#4a3418'; g.lineWidth = Math.max(1, .03 * kb); g.beginPath(); for (const sx of [-1, 1]) { g.moveTo(bug[0] + sx * .2 * kb, bug[1] + .1 * kb); g.lineTo(bug[0] + sx * .38 * kb, bug[1] + .22 * kb); } g.stroke(); } } }
  // a little dust off the hidden wheels while it creeps
  if (st.mv > .05 && shadowA(t) > .05) { g.save(); for (let i = 0; i < 5; i++) { const q = apP(F((rnd(i, 91) - .5) * 4.2, .15 + .3 * rnd(i, 92), -bz * 1.05)), r = (.35 + .4 * rnd(i, 93)) * kAt(q) * S; g.fillStyle = `rgba(226,200,150,${.25 * st.mv})`; g.beginPath(); g.arc(q[0], q[1], r, 0, TAU); g.fill(); } g.restore(); }
}
function apGenieShadow(o, t) { const st = apGeniePose(o, t), J = apGenieJoints(st), F = apFrame(st), S = st.scale, pts = [];
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; pts.push(F(Math.cos(a) * AP_GENIE.base[0], 0, Math.sin(a) * AP_GENIE.base[1]), F(Math.cos(a) * AP_GENIE.base[0], AP_GENIE.base[2], Math.sin(a) * AP_GENIE.base[1])); }
  shadowOf(pts, t); apShadowLine(J.world, .55 * S, t);
  const { c, u, v } = apGenieHead(st), R = (AP_GENIE.petal + AP_GENIE.disc) * S * .9, hp = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; hp.push([c[0] + (Math.cos(a) * u[0] + Math.sin(a) * v[0]) * R, c[1] + (Math.cos(a) * u[1] + Math.sin(a) * v[1]) * R, c[2] + (Math.cos(a) * u[2] + Math.sin(a) * v[2]) * R]); }
  const sv = sunVec(t), a = shadowA(t); if (a < .01) return; const sp = hp.map((w) => shadowPt(w[0], w[1], w[2], sv)); if (!ok(sp)) return; g.save(); apPath(hull(sp)); g.fillStyle = `rgba(52,34,58,${a * .7})`; g.fill(); g.restore(); } // the lace lets a little light through

// ---------- the front layer: the monolith framing the burn through its hole ----------
// The Man's fire is drawn over the scene list (render.js manFire), so a slab standing between the drone and the fire
// would be painted over. A piece with front: true is drawn here instead, after the fire, graded the way render.js grades
// the car layer. Needs one word in render.js: FRONT_HOOKS gets 'artpiecesFront'. Without it, front pieces draw as usual.
const AP_DRAW = { burger: apBurger, jig: apJig, monolith: apMonolith, head: apHead, genie: apGenie };
const AP_FC = mkCanvas(), apFg = AP_FC.getContext('2d'), AP_FM = mkCanvas(), apFm = AP_FM.getContext('2d');
const apFrontOn = () => typeof FRONT_HOOKS !== 'undefined' && FRONT_HOOKS.includes('artpiecesFront');
function artpiecesFront(t) {
  const fr = ARTPIECES.filter((o) => o.front); if (!fr.length) return; const gs = g;
  apFg.setTransform(1, 0, 0, 1, 0, 0); apFg.globalCompositeOperation = 'source-over'; apFg.globalAlpha = 1; apFg.clearRect(0, 0, W, H); g = apFg;
  for (const o of fr) { const p = P(o.X, 0, o.Z); if (p[2] < 3) continue; g.save(); AP_DRAW[o.kind](o, t, p, kAt(p)); g.restore(); }
  apFm.clearRect(0, 0, W, H); apFm.drawImage(AP_FC, 0, 0); grade(t, true); apFg.globalCompositeOperation = 'destination-in'; apFg.drawImage(AP_FM, 0, 0); apFg.globalCompositeOperation = 'source-over';
  g = gs; g.drawImage(AP_FC, 0, 0);
}

// ---------- the scene hook ----------
const AP_SIZE = { burger: [8, 7], jig: [7, 15.5], monolith: [3, 7.6], head: [5, 5.3], genie: [6, 14] }; // half width for culling, height
function artpiecesInto(t, list) {
  for (const o of ARTPIECES) {
    if (o.t0 != null && t < o.t0) continue; if (o.t1 != null && t > o.t1) continue;
    if (o.path) { const [X, Z] = apPath2(o.path, t); o.X = X; o.Z = Z; } // a mobile piece: where it has driven to by t (set each frame, so still a pure function of t)
    const p = P(o.X, 0, o.Z); if (p[2] < 3) continue; const k = kAt(p), [hw, ht] = AP_SIZE[o.kind], S = o.scale || 1;
    if (ht * S * k < 2 || p[0] < -hw * S * k - 200 || p[0] > W + hw * S * k + 200) continue;
    const draw = AP_DRAW[o.kind], shadow = { burger: apBurgerShadow, jig: apJigShadow, monolith: apMonoShadow, head: apHeadShadow, genie: apGenieShadow }[o.kind];
    list.push({ z: p[2], draw: () => { if (o.front && apFrontOn()) return; g.save(); draw(o, t, p, k); g.restore(); }, shadow: () => { g.save(); shadow(o, t); g.restore(); } }); // a front piece is drawn by artpiecesFront instead
    if (o.sign) { const b = apFrame(o)(o.sign.lx, 0, o.sign.lf), q = P(b[0], 0, b[2]); if (q[2] > 2) list.push({ z: q[2], draw: () => { g.save(); apSign(o, t); g.restore(); } }); }
    if (k > .8) apVisitors(o, t, list);
  }
}
