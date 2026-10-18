// Reform Party, Dali look: installations from Robin's own Burning Man photos (source/refs/artcars).
// scene hook: pushes {z, draw, shadow} into list.
// Homages, drawn from his photos, with no names and no readable text:
//   burger   - a giant hamburger (sesame bun, two patties, cheese, lettuce, tomato), about 4 m across, with a tall pole
//              sign beside it: a red panel with a yellow upside-down-arches "W", guyed with wires (burger.jpg)
//   jig      - two semi trucks (cab + tanker) bent into a towering arch: one stands on its nose, the second is balanced
//              upside down on top, the tankers bent like pipe elbows, wheels sticking out; about 15 m tall (big-rig-jig.jpg)
//   monolith - a tapered olive-green prism on a diamond footprint (diagonals 6 m and 3.6 m), 7.6 m tall, a wide face and
//              a narrow one meeting at the near edge; a 2.6 m bore runs through near the top against that edge; by night
//              the face toward the Man takes the burn's rust light (green-monolith-day/night.jpg)
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
// rot 4.62 (its bore square to the line to the Man) and a drone pose [t, 222.7, 2.23, 81.7, -.125, 1300, 2.014]
// (world metres, as END_KEYS): the burning Man stands inside the bore. Draft 9 has no such pose, so it is off.
const ARTPIECES = [
  // ---------- draft 16: Robin's new photos (source/refs/robin-2026-10-18), placed on the open playa off the promenades ----------
  { kind: 'nave', X: 176, Z: 176, rot: 2.5, scale: 1, people: 0,
    clock: '7:30', r: 186, seen: 'the long wides down the road all day: 73-104, 112-160, 163-177, 185-195 in the background (60-170 px), the entrance toward the drone' },
  { kind: 'octa', name: 'octa-a', X: 156, Z: 64, rot: .4, a: 2.1, tilt: 0, sitter: true, scale: 1, people: 3,
    clock: '8:30', r: 145, seen: '113-137 and 147-155 in the background left of the road (75-110 px)' },
  // draft 16 (Robin: "the green thing is 1 sculpture from different angles not 2"): the tipped-over second one (octa-b,
  // 140, 55) is cut; this one, balanced on its point with the sitter in its window, is the only one
  { kind: 'clock', X: 104, Z: 130, rot: 2.74, scale: 1, people: 0,
    clock: '8:00', r: 210, seen: 'on "time" (126.5) in the open playa left of the melting clock, 125 px; also 72-95 and 129-141' },
  { kind: 'stilts', path: [[0, -14, 47.4], [114.5, 123.4, 47.4]], X: 0, Z: 0, rot: 0, scale: 1, t0: 0, t1: 114.5,
    clock: '9:00 promenade', r: 200, seen: 'strolling east along the 9:00 promenade from the first frame, 50-90 px, in the board shots of verse 1; gone off frame by 114.5' },
  { kind: 'burger', X: -316, Z: -4, rot: -Math.PI / 2 - .3, scale: 1, sign: { lx: 5.2, lf: -1.6, rot: .35 }, people: 4,
    clock: '9:20', r: 600, seen: 'intro 3-7.6: on the open playa straight ahead of the drone as it glides in from the 9:00 Esplanade sound camp; the bun grows to about 140 px (the sign 260 px) at 7.4 before the drone passes over it' },
  { kind: 'jig', X: 265, Z: 110, rot: Math.PI - .2, scale: 1, people: 7,
    clock: '7:00', r: 72, seen: 'day 153-160, 163-184, 193-198 (h 120-255 px); night 212-268 on the left of the burn framings, dark against the city' },
  { kind: 'monolith', X: 244, Z: 72, rot: 2.45, scale: 1, people: 4, nightPeople: 8,
    clock: '8:10', r: 62, seen: 'day 152-160, 163-184, 193-198 (h 80-180 px), the wide face to the drone with the bore reading round, the narrow face beside it; night 212-233 and 237-246 behind the crowd ring, the narrow face (toward the Man) rust, the wide face olive' },
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
// Draft 11 (Robin: nothing blinks in or out): the night ones no longer fade in and out. Each walks in from 16 m out along
// its own spoke from the piece (so nobody walks through the piece or through anyone standing nearer), setting off in the
// dusk aerial (204.6-209.5, when the drone is hundreds of metres up and they are specks), reaching its spot 12 s later
// in the first burn framings, and after the burn (from 253) walks back out the way it came, toward the city.
const AP_WALK = { d: 16, v: 1.3, in0: 204.6, inStep: .7, out0: 253, outStep: .6 };
function apWalkOff(s) { return s <= 0 ? 0 : s >= 1 ? AP_WALK.v * (s - .5) : AP_WALK.v * .5 * s * s; } // metres from the spot, s seconds from it (eases the last second)
// where each visitor stands, in the piece's frame [lx, lf] (draft 11: spaced so nobody stands inside anybody, with every
// night walker's spoke clear of everyone else's spot). A fixed layout, worked out once per piece from its seeds.
// other builders' standing things a visitor must not stand in or walk through: playa.js's art (the chair tower, the candle,
// the eye, the lantern arch) and burn.js's parked mutant vehicles where they park for the burn
function apNearPlayaArt(o, q, rb) {
  const w = apFrame(o)(q[0], 0, q[1]), near = (X, Z, r) => Math.hypot(w[0] - X, w[2] - Z) < r + rb + .5;
  if (typeof BM_CAMPS !== 'undefined' && typeof BM_PLAYA_ART !== 'undefined' && BM_CAMPS.some((c) => BM_PLAYA_ART[c.kind] && near(c.X, c.Z, (typeof BM_ART_R !== 'undefined' && BM_ART_R[c.kind] ? BM_ART_R[c.kind] : 1) * c.r))) return true;
  if (typeof MV !== 'undefined' && MV.some((c) => near(c.X, c.Z, (typeof MV_HALF !== 'undefined' && MV_HALF[c.kind]) || 5))) return true;
  return false;
}
function apSpots(o) {
  if (o._spots) return o._spots; const n0 = o.people || 0, n = n0 + (o.nightPeople || 0), R = { burger: 3.2, jig: 6.5, monolith: 4.3, head: 4.8 }[o.kind] || 4, out = [];
  const body = (i) => (i < n0 && i % 3 === 1 ? .8 : .3), foot = AP_FOOT[o.kind];
  const segD = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], u = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz || 1)); return Math.hypot(p[0] - a[0] - dx * u, p[1] - a[1] - dz * u); };
  const spoke = (q) => { const l = Math.hypot(q[0], q[1]) || 1; return [q, [q[0] * (1 + AP_WALK.d / l), q[1] * (1 + AP_WALK.d / l)]]; };
  for (let i = 0; i < n; i++) {
    let best = null;
    for (let tr = 0; tr < 60 && !best; tr++) {
      const a = rnd(i, 3, o.X) * TAU + tr * .23, r = R + 1.2 + 2.6 * rnd(i, 4, o.Z) + (tr % 3) * .4, q = [Math.cos(a) * r, Math.sin(a) * r * .8];
      if (Math.hypot(q[0] - foot[0], q[1] - foot[1]) < foot[2] + body(i) + .4) continue;
      if (out.some((s, j) => Math.hypot(q[0] - s[0], q[1] - s[1]) < body(i) + body(j) + .35)) continue;
      if (apNearPlayaArt(o, q, body(i)) || (i >= n0 && [.25, .5, .75, 1].some((u) => apNearPlayaArt(o, [q[0] + (spoke(q)[1][0] - q[0]) * u, q[1] + (spoke(q)[1][1] - q[1]) * u], body(i))))) continue; // clear of playa.js's art pieces (spot and walk-out end)
      if (i >= n0) { const [a0, b0] = spoke(q); if (out.some((s, j) => segD(s, a0, b0) < body(i) + body(j) + .35)) continue; } // its own walk in and out
      if (out.some((s, j) => j >= n0 && (() => { const [a0, b0] = spoke(s); return segD(q, a0, b0) < body(i) + body(j) + .35; })())) continue; // not on an earlier walker's way
      best = q; }
    out.push(best || [Math.cos(i) * (R + 4 + i * .9), Math.sin(i) * (R + 4 + i * .9)]); }
  return (o._spots = out);
}
function apVisitors(o, t, list) {
  const n0 = o.people || 0, n = n0 + (o.nightPeople || 0); if (!n) return; const F = apFrame(o), sp = apSpots(o);
  for (let i = 0; i < n; i++) {
    const [lx, lf] = sp[i];
    const night = i >= n0, j = i - n0, bike = !night && i % 3 === 1, seed = i + o.kind.length * 7;
    let off = 0, step = 0;
    if (night) { const tIn = AP_WALK.in0 + j * AP_WALK.inStep, tArr = tIn + AP_WALK.d / AP_WALK.v + .5, tOut = AP_WALK.out0 + j * AP_WALK.outStep;
      if (t < tIn) continue; off = t < tArr ? apWalkOff(tArr - t) : apWalkOff(t - tOut); if (off > .02) step = Math.sin(t * 5.2 + j * 1.7) * .25 * clamp(off); }
    const sl = Math.hypot(lx, lf) || 1, w = F(lx * (1 + off / sl), 0, lf * (1 + off / sl)), p = P(w[0], 0, w[2]);
    const al = clamp((p[2] - 3) / 3), kk = p[2] > .3 ? kAt(p) * (o.scale || 1) : 0, vis = p[2] >= 3 && kk >= .4 && p[0] >= -60 && p[0] <= W + 60;
    ACT.note('artpieces:visitor:' + (o.name || o.kind) + ':' + i, w[0], w[2], bike ? .8 : .3, { h: bike ? 1.1 : 1.8, a: vis ? al : 0, group: 'visitors' });
    if (!vis || al <= .01) continue; const k = kk;
    list.push({ z: p[2], draw: () => { g.save(); if (al < 1) g.globalAlpha = al; bike ? apBike(p[0], p[1], k, seed, t) : person(p[0], p[1], k, { step, lift: 0, hat: seed % 6, cape: seed % 4 === 1, sit: 0 }, { body: AP_COLS[seed % 8], skin: ['#e8d4b4', '#c99a74', '#8c6448', '#f0dcc4'][seed % 4], dark: '#3a3040', lamp: '#f0d49a', hatc: AP_COLS[(seed + 3) % 8] }); g.restore(); },
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
// A tapered prism on a DIAMOND footprint (Robin: "the base is a diamond. it's not flat across the front"). Seen from
// the photo's angle: a wide face and a narrower face meeting at the near, nearly vertical edge, each tapering in to a
// smaller diamond on top; the near corner pokes out at the foot. A round bore runs horizontally right through near the
// top, square to the wide face and set against the near edge, so the edge cuts the circle and you see the bore's
// curved inner wall. Real 3D: four side faces, the top, and the bore as a cylinder through the solid, from any angle.
// Local metres: lx along the long diagonal, lf along the short one (the near corner is +lf), ly up.
const AP_MONO = { a: 3.0, b: 1.8, h: 7.6, top: .65, piv: [.1, 1.05], hr: 1.3, hy: 5.0, hoff: .5, nb: 36 }; // hoff: the bore's centre this far in from the near edge, so the edge cuts the circle
const AP_STREAKS = [...Array(14)].map((_, i) => ({ u: rnd(i, 51), w: .03 + .07 * rnd(i, 52), y0: .1 + 2.5 * rnd(i, 53), y1: 3.5 + 4 * rnd(i, 54), d: rnd(i, 55) < .5 }));
const apSub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]], apDot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
const apCross = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]], apNorm = (p) => { const l = Math.hypot(...p) || 1; return [p[0] / l, p[1] / l, p[2] / l]; };
function apMonoGeo(o) { // world geometry: corners, faces (with outward normals), the bore
  const F = apFrame(o), m = AP_MONO, S = o.scale || 1, B2 = [[-m.a, 0], [0, m.b], [m.a, 0], [0, -m.b]]; // left, near, right, back
  const T2 = B2.map(([x, f]) => [m.piv[0] + m.top * (x - m.piv[0]), m.piv[1] + m.top * (f - m.piv[1])]);
  const base = B2.map(([x, f]) => F(x, 0, f)), top = T2.map(([x, f]) => F(x, m.h, f)), cen = F(0, m.h * .45, .2);
  const faces = []; for (let i = 0; i < 4; i++) { const j = (i + 1) % 4, pts = [base[i], base[j], top[j], top[i]]; let n = apNorm(apCross(apSub(base[j], base[i]), apSub(top[i], base[i])));
    if (apDot(n, apSub(base[i], cen)) < 0) n = n.map((v) => -v); faces.push({ pts, n, q: base[i], side: true, i }); }
  faces.push({ pts: top.slice(), n: [0, 1, 0], q: top[0], side: false, i: 4 });
  // the bore: square to the wide face (left to near), its axis horizontal, centred hoff in from the near edge
  const e = [B2[1][0] - B2[0][0], B2[1][1] - B2[0][1]], el = Math.hypot(e[0], e[1]), nl = [-e[1] / el, e[0] / el]; // the wide face's outward normal in (lx, lf)
  const u = m.hy / m.h, Ly = [lerp(B2[0][0], T2[0][0], u), lerp(B2[0][1], T2[0][1], u)], Ny = [lerp(B2[1][0], T2[1][0], u), lerp(B2[1][1], T2[1][1], u)], dl = Math.hypot(Ly[0] - Ny[0], Ly[1] - Ny[1]);
  const Q2 = [Ny[0] + (Ly[0] - Ny[0]) / dl * m.hoff, Ny[1] + (Ly[1] - Ny[1]) / dl * m.hoff];
  const Q = F(Q2[0], m.hy, Q2[1]), ax = apNorm(apSub(F(Q2[0] + nl[0], m.hy, Q2[1] + nl[1]), Q)), U = apNorm(apCross([0, 1, 0], ax)), V = [0, 1, 0];
  // each generator line of the bore, clipped to the solid (the four side planes, the top, the playa)
  const gens = []; for (let k = 0; k < m.nb; k++) { const th = k / m.nb * TAU, ct = Math.cos(th), st = Math.sin(th), p0 = [Q[0] + (U[0] * ct + V[0] * st) * m.hr * S, Q[1] + (U[1] * ct + V[1] * st) * m.hr * S, Q[2] + (U[2] * ct + V[2] * st) * m.hr * S];
    let t0 = -50, t1 = 50; for (const fc of faces) { const dn = apDot(fc.n, ax), dd = apDot(fc.n, apSub(p0, fc.q)); if (Math.abs(dn) < 1e-6) { if (dd > 0) { t0 = 1; t1 = 0; } continue; } const tt = -dd / dn; if (dn > 0) t1 = Math.min(t1, tt); else t0 = Math.max(t0, tt); }
    if (p0[1] < 0) { t0 = 1; t1 = 0; }
    gens.push({ th, p0, t0, t1, ok: t1 > t0, inN: [-(U[0] * ct + V[0] * st), -(U[1] * ct + V[1] * st), -(U[2] * ct + V[2] * st)] }); }
  return { F, faces, base, top, Q, ax, U, V, gens };
}
function apMonolith(o, t, p, k) {
  const G = apMonoGeo(o), m = AP_MONO, S = o.scale || 1, night = nightAmt(t), cam = [C.x, C.y, C.z];
  const green = hex('#a5bf3c'), olive = hex('#b4cc48'), base = mix(green, olive, night), rust = hex('#ff8a3a'), wallC = mix(hex('#3f4f8c'), hex('#2a2a3a'), night * .6);
  const mx = MAN.x - o.X, mz = MAN.z - o.Z, ml = Math.hypot(mx, mz) || 1; // by night only the face turned most squarely to the burn goes rust; the others stay olive, as in the night photo
  const h2of = (n) => { const hn = Math.hypot(n[0], n[2]) || 1; return [n[0] / hn, n[2] / hn]; };
  const col = (n, f, l) => { const h2 = h2of(n); if (l == null) l = apLight(t, h2, n[1], o.X, o.Z); const sq = smooth((h2[0] * mx / ml + h2[1] * mz / ml - .8) / .12), r = apRust(t, h2, o.X, o.Z) * 1.6 * sq; return rgb(mix(apShade(base, (f || 1) * (.48 + .55 * l)), rust, clamp(r))); };
  const at = (gn, tt) => P(gn.p0[0] + G.ax[0] * tt, gn.p0[1] + G.ax[1] * tt, gn.p0[2] + G.ax[2] * tt);
  // where the bore's cylinder meets a face's plane (an ellipse; null if the plane runs along the bore)
  const holeOn = (fc) => { const dn = apDot(fc.n, G.ax); if (Math.abs(dn) < .05) return null; const out = []; for (const gn of G.gens) out.push(at(gn, -apDot(fc.n, apSub(gn.p0, fc.q)) / dn)); return ok(out) ? out : null; };
  const isVis = (fc) => apDot(fc.n, apSub(cam, fc.q)) > 0, vis = G.faces.filter(isVis);
  // each face its own value from the sun, and the visible sides held at least .36 apart so the edge between them reads
  const Lf = new Map(); for (const fc of vis) Lf.set(fc, apLight(t, h2of(fc.n), fc.n[1], o.X, o.Z));
  const sides = vis.filter((fc) => fc.side).sort((p1, p2) => Lf.get(p1) - Lf.get(p2));
  if (sides.length > 1) { const lo = Lf.get(sides[0]), hi = Lf.get(sides[sides.length - 1]); if (hi - lo < .36) { const md = (hi + lo) / 2; sides.forEach((fc, i) => Lf.set(fc, md - .18 + .36 * i / (sides.length - 1))); } }
  const farOf = (fc) => { const op = G.faces.find((f2) => f2.side && f2 !== fc && apDot(f2.n, G.ax) * apDot(fc.n, G.ax) < -.8); return op && !isVis(op) ? holeOn(op) : null; }; // the bore's far opening (on the face opposite the one we look in by), where you see out
  // the bore's wall: lit where it faces the sun, deep blue where it doesn't (a gradient across the opening)
  const el = Math.max(sunEl(t), 2) * Math.PI / 180, sd = sunDir(t), sun = [-sd[0] * Math.cos(el), Math.sin(el), -sd[1] * Math.cos(el)];
  let gb = null, gd = null; for (const gn of G.gens) { if (!gn.ok) continue; const v = apDot(gn.inN, sun); if (!gb || v > gb.v) gb = { v, gn }; if (!gd || v < gd.v) gd = { v, gn }; }
  const wallLit = mix(hex('#aab8de'), hex('#4a4a62'), night), wallMid = mix(hex('#56669f'), hex('#2e2e44'), night), wallDark = mix(hex('#25326a'), hex('#1a1a28'), night);
  const holes = [];
  for (const fc of vis) { const sp = fc.pts.map(apP); if (!ok(sp)) continue; const hole = fc.side ? holeOn(fc) : null; if (hole) holes.push(hole);
    g.save(); apPath(sp); g.clip();
    g.beginPath(); sp.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); if (hole) { hole.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); }
    g.fillStyle = col(fc.n, fc.side ? 1 : 1.05, Lf.get(fc)); g.fill('evenodd');
    if (k > 3 && fc.side) { // weathering: long faint streaks down from the top, a grime band at the foot (not over the hole)
      g.save(); if (hole) { g.beginPath(); g.rect(-W, -H, 3 * W, 3 * H); hole.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.clip('evenodd'); }
      const map = apQuad(sp[3], sp[2], sp[0], sp[1]);
      for (const st of AP_STREAKS) { const a = map(st.u, 1 - st.y1 / m.h), b = map(st.u + .01, 1 - st.y0 / m.h); g.strokeStyle = st.d ? 'rgba(60,72,20,.14)' : 'rgba(235,240,190,.11)'; g.lineWidth = Math.max(1, st.w * k); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      const f0 = map(0, 1), f1 = map(1, 1), f2 = map(1, .9), f3 = map(0, .9), gr = g.createLinearGradient(0, f0[1], 0, f3[1]); gr.addColorStop(0, 'rgba(70,60,30,.28)'); gr.addColorStop(1, 'rgba(70,60,30,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(f0[0], f0[1]); g.lineTo(f1[0], f1[1]); g.lineTo(f2[0], f2[1]); g.lineTo(f3[0], f3[1]); g.closePath(); g.fill(); g.restore(); }
    // through the hole in this face: the bore's inner wall, everywhere except the clean far opening
    if (hole) { const farHole = farOf(fc); g.save(); apPath(hole); g.clip();
      if (farHole) { g.beginPath(); g.rect(-W, -H, 3 * W, 3 * H); farHole.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); g.clip('evenodd'); }
      const mt = (gn) => at(gn, (gn.t0 + gn.t1) / 2), pb = gb ? mt(gb.gn) : sp[0], pd = gd ? mt(gd.gn) : sp[2];
      const wg = g.createLinearGradient(pb[0], pb[1], pd[0], pd[1]); wg.addColorStop(0, rgb(wallLit)); wg.addColorStop(.45, rgb(wallMid)); wg.addColorStop(1, rgb(wallDark));
      g.fillStyle = wg; g.fillRect(-W, -H, 3 * W, 3 * H);
      const rr = apRust(t, h2of(G.ax.map((v) => -v)), o.X, o.Z); if (rr > .02) { g.fillStyle = rgb(rust, clamp(rr * .45)); g.fillRect(-W, -H, 3 * W, 3 * H); } // by night the burn glows down the bore
      if (farHole && k > 5) { g.strokeStyle = rgb(wallDark, .8); g.lineWidth = Math.max(1, .03 * k); apPath(farHole); g.stroke(); } // the far rim, crisp
      g.restore();
      // the cut rim: a dark line just inside and a light lip on the face
      g.save(); apPath(hole); g.strokeStyle = 'rgba(20,28,60,.45)'; g.lineWidth = Math.max(1.4, .07 * k); g.stroke(); g.strokeStyle = rgb(apShade(base, 1.25), .9); g.lineWidth = Math.max(1, .028 * k); g.stroke(); g.restore(); }
    g.restore();
  }
  // inside the bore, paint the wall over the seam where two faces' cut-outs meet, so no line runs down through the hole (Robin)
  if (holes.length > 1) { const mt = (gn) => at(gn, (gn.t0 + gn.t1) / 2), pb = gb ? mt(gb.gn) : null, pd = gd ? mt(gd.gn) : null;
    if (pb && pd) { g.save(); g.beginPath(); for (const hh of holes) { hh.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); } g.clip();
      const fars = vis.map(farOf).filter(Boolean); if (fars.length) { g.beginPath(); g.rect(-W, -H, 3 * W, 3 * H); for (const fh of fars) { fh.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); } g.clip('evenodd'); }
      const wg = g.createLinearGradient(pb[0], pb[1], pd[0], pd[1]); wg.addColorStop(0, rgb(wallLit)); wg.addColorStop(.45, rgb(wallMid)); wg.addColorStop(1, rgb(wallDark));
      g.strokeStyle = wg; g.lineWidth = Math.max(3, .08 * k); g.lineCap = 'butt';
      for (const fc of sides) { const nx = G.faces[(fc.i + 1) % 4]; if (!isVis(nx)) continue; const a2 = apP(fc.pts[1]), b2 = apP(fc.pts[2]); g.beginPath(); g.moveTo(a2[0], a2[1]); g.lineTo(b2[0], b2[1]); g.stroke(); }
      g.restore(); } }
  // the edges: a crisp light line where two visible faces meet (kept off the hole)
  if (k > 2.5) { g.save(); if (holes.length) { g.beginPath(); g.rect(-W, -H, 3 * W, 3 * H); for (const hh of holes) { hh.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); } g.clip('evenodd'); }
    g.strokeStyle = rgb(apShade(base, 1.3), .85); g.lineWidth = Math.max(1, .022 * k); g.lineCap = 'butt';
    for (const fc of sides) { const nx = G.faces[(fc.i + 1) % 4]; if (!isVis(nx)) continue; const A3 = fc.pts[1], B3 = fc.pts[2];
      // the edge the bore cuts: leave the stretch beside the hole out entirely (two faces' cut-outs overlap there, so a clip can't hide it)
      const at3 = (u) => [lerp(A3[0], B3[0], u), lerp(A3[1], B3[1], u), lerp(A3[2], B3[2], u)], uh = m.hy / m.h, mid = at3(uh), dq = apSub(mid, G.Q), along = apDot(dq, G.ax), rad = Math.hypot(dq[0] - G.ax[0] * along, dq[1] - G.ax[1] * along, dq[2] - G.ax[2] * along);
      const segs = rad < m.hr * S * 1.25 ? [[0, (m.hy - m.hr * 1.15) / m.h], [(m.hy + m.hr * 1.15) / m.h, 1]] : [[0, 1]];
      for (const [u0, u1] of segs) { const a2 = apP(at3(u0)), b2 = apP(at3(u1)); g.beginPath(); g.moveTo(a2[0], a2[1]); g.lineTo(b2[0], b2[1]); g.stroke(); } }
    g.restore(); }
  // the near corner pokes out at the foot: a small flat point of plate on the playa
  { const nf = G.faces[0].n, fp = [G.F(-.3, 0, AP_MONO.b - .18), G.F(.3, 0, AP_MONO.b - .18), G.F(.05, 0, AP_MONO.b + .55), G.F(.05, .2, AP_MONO.b + .05)].map(apP); if (ok(fp)) { poly([fp[0], fp[2], fp[1]], col(nf, .78)); poly([fp[0], fp[3], fp[2]], col(nf, .9)); } }
  const topS = G.top.map(apP); if (ok(topS)) apRim([topS[0], topS[1], topS[2]], t, k, false);
}
function apClipConvex(subj, clip) { // Sutherland-Hodgman: a polygon clipped to a convex one (screen points)
  let out = subj; const n = clip.length, sgn = Math.sign((clip[1][0] - clip[0][0]) * (clip[2][1] - clip[0][1]) - (clip[1][1] - clip[0][1]) * (clip[2][0] - clip[0][0])) || 1;
  for (let i = 0; i < n && out.length; i++) { const A = clip[i], B = clip[(i + 1) % n], inside = (p) => sgn * ((B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0])) >= 0, inp = out; out = [];
    for (let j = 0; j < inp.length; j++) { const P1 = inp[j], P2 = inp[(j + 1) % inp.length], i1 = inside(P1), i2 = inside(P2);
      if (i1) out.push(P1); if (i1 !== i2) { const d1 = (B[0] - A[0]) * (P1[1] - A[1]) - (B[1] - A[1]) * (P1[0] - A[0]), d2 = (B[0] - A[0]) * (P2[1] - A[1]) - (B[1] - A[1]) * (P2[0] - A[0]), u = d1 / (d1 - d2); out.push([lerp(P1[0], P2[0], u), lerp(P1[1], P2[1], u)]); } } }
  return out; }
function apMonoShadow(o, t) { // the prism's shadow, with the patch of sun that comes through the bore when it lines up
  const sv = sunVec(t), a = shadowA(t); if (a < .01) return; const G = apMonoGeo(o), sp = (w) => shadowPt(w[0], w[1], w[2], sv);
  const corners = [...G.base, ...G.top].map(sp); if (!ok(corners)) return; const hl = hull(corners);
  const ends = (which) => G.gens.filter((gn) => gn.ok).map((gn) => sp([gn.p0[0] + G.ax[0] * gn[which], gn.p0[1] + G.ax[1] * gn[which], gn.p0[2] + G.ax[2] * gn[which]]));
  const e0 = ends('t0'), e1 = ends('t1'); let patch = [];
  if (e0.length > 5 && ok(e0) && ok(e1)) { const h0 = hull(e0), h1 = hull(e1); if (h0.length > 2 && h1.length > 2) patch = apClipConvex(h0, h1); }
  g.save(); g.beginPath(); hl.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath();
  if (patch.length > 2) { patch.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.closePath(); }
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

// ---------- 6. the white Gothic nave (draft 16, robin-2026-10-18/4.jpg) ----------
// Two rows of tall white spires, 8 m apart and 4 m between spires, joined across by pointed arches and along each row by
// lower ones, so it reads as a nave you walk down; the front pair tallest, each spire a column with a pointed cap; guy
// wires off the front; a coloured mandala wheel on a pole stands at the far end. Drawn in 3D (it is long and seen end on),
// far parts first. lf runs along the nave from the far end (-) to the entrance (+), lx across it.
const AP_NAVE = { n: 7, half: 12, w: 4, sp: 4, h: 11.2, h0: 14, mand: -16 };
const apNaveSpires = () => { const N = AP_NAVE, out = []; for (let i = 0; i < N.n; i++) for (const s of [-1, 1]) out.push({ lx: s * N.w, lf: N.half - i * N.sp, h: i === 0 ? N.h0 : N.h, i }); return out; };
function apArchPts(F, ax, bx, lfA, lfB, spring, c) { // a pointed arch from (ax, lfA) to (bx, lfB) in the piece frame: two arcs meeting at the apex
  const half = Math.hypot(bx - ax, lfB - lfA) / 2, r = half + c, out = [];
  for (let j = 0; j <= 16; j++) { const left = j <= 8, u = left ? j / 8 : (16 - j) / 8, th = Math.PI - u * (Math.PI - Math.acos(c / r)), d = c + r * Math.cos(th), y = spring + r * Math.sin(th), s = left ? (half + d) / (2 * half) : 1 - (half + d) / (2 * half);
    out.push(F(lerp(ax, bx, s), y, lerp(lfA, lfB, s))); }
  return out;
}
function apNaveWalkers(o, t) { // two burners strolling up and down the nave, three standing in it
  const F = apFrame(o), out = [];
  [[-1.1, .55, .1, 4], [1.4, .48, .62, 1]].forEach(([lx, v, ph, seed], i) => { const L = 26, s = ((t * v / L + ph) % 2 + 2) % 2, u = s < 1 ? s : 2 - s; const w = F(lx, 0, -13 + 26 * u); out.push({ X: w[0], Z: w[2], step: Math.sin(t * 5 + i) * .2, seed, i }); });
  [[.4, 6.5, 2], [-2.0, -4.0, 5], [2.4, -9.5, 7]].forEach(([lx, lf, seed], j) => { const w = F(lx, 0, lf); out.push({ X: w[0], Z: w[2], step: 0, seed, i: 2 + j }); });
  return out;
}
function apNave(o, t, p, k) {
  const F = apFrame(o), N = AP_NAVE, L = apLight(t, apNormal(o, 1, 0), 0, o.X, o.Z), Lf = apLight(t, apNormal(o, 0, 1), 0, o.X, o.Z);
  const white = rgb(apShade([246, 244, 238], .78 + .22 * Math.max(L, Lf))), side = rgb(apShade([246, 244, 238], .62 + .2 * Math.min(L, Lf))), items = [];
  const dz = (w) => { const q = P(w[0], 0, w[2]); return q[2]; };
  for (const s of apNaveSpires()) { const b = F(s.lx, 0, s.lf); items.push({ z: dz(b), d: () => { const B = P(b[0], 0, b[2]), T = P(b[0], s.h, b[2]), C = P(b[0], s.h - 2.6, b[2]); if (B[2] < 1 || T[2] < 1) return; const kk = kAt(B), w = Math.max(1, .28 * kk), wc = Math.max(1.2, .42 * kk);
      g.fillStyle = white; g.beginPath(); g.moveTo(B[0] - w, B[1]); g.lineTo(C[0] - w * .95, C[1]); g.lineTo(C[0] + w * .95, C[1]); g.lineTo(B[0] + w, B[1]); g.closePath(); g.fill();
      g.fillStyle = side; g.fillRect(B[0] + w * .25, C[1], w * .7, B[1] - C[1]);
      const M = P(b[0], s.h - 1.6, b[2]); g.fillStyle = white; g.beginPath(); g.moveTo(C[0] - w, C[1]); g.quadraticCurveTo(M[0] - wc * 1.15, M[1], T[0], T[1]); g.quadraticCurveTo(M[0] + wc * 1.15, M[1], C[0] + w, C[1]); g.closePath(); g.fill();
      if (kk > 3) { g.strokeStyle = side; g.lineWidth = Math.max(1, .06 * kk); g.beginPath(); g.moveTo(C[0] - w, C[1]); g.lineTo(C[0] + w, C[1]); g.stroke(); } } });
    if (s.lx > 0) { const pts = apArchPts(F, -N.w, N.w, s.lf, s.lf, 6.3, 1.6); items.push({ z: dz(F(0, 0, s.lf)) + .01, d: () => { const q = pts.map(apP); if (!ok(q)) return; const kk = kAt(P(...F(0, 0, s.lf))); g.strokeStyle = white; g.lineWidth = Math.max(1, .24 * kk); g.lineCap = 'round'; apPath(q, false); g.stroke(); } }); }
    if (s.i < N.n - 1) { const pts = apArchPts(F, s.lx, s.lx, s.lf, s.lf - N.sp, 6.0, .4); items.push({ z: dz(F(s.lx, 0, s.lf - N.sp / 2)), d: () => { const q = pts.map(apP); if (!ok(q)) return; const kk = kAt(P(...F(s.lx, 0, s.lf - 2))); g.strokeStyle = side; g.lineWidth = Math.max(1, .16 * kk); apPath(q, false); g.stroke(); } }); }
  }
  // the mandala wheel on its pole at the far end, turning slowly
  const mb = F(0, 0, N.mand); items.push({ z: dz(mb), d: () => { const B = P(mb[0], 0, mb[2]), Cn = P(mb[0], 7.4, mb[2]); if (B[2] < 1) return; const kk = kAt(B); g.strokeStyle = white; g.lineWidth = Math.max(1, .2 * kk); g.beginPath(); g.moveTo(B[0], B[1]); g.lineTo(Cn[0], Cn[1]); g.stroke();
    const R = 1.8 * kk, cols = ['#d8452f', '#2f6fb5', '#e8b23a', '#7a3c8c', '#3c8c5a', '#ee9a42'], rot = t * .25; g.save(); g.translate(Cn[0], Cn[1]); g.rotate(rot);
    g.fillStyle = '#f2ede0'; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
    for (let j = 0; j < 12; j++) { const a = j / 12 * TAU; g.fillStyle = cols[j % 6]; g.beginPath(); g.ellipse(Math.cos(a) * R * .62, Math.sin(a) * R * .62, R * .34, R * .14, a, 0, TAU); g.fill(); }
    for (let j = 0; j < 8; j++) { const a = (j + .5) / 8 * TAU; g.fillStyle = cols[(j + 2) % 6]; g.beginPath(); g.ellipse(Math.cos(a) * R * .3, Math.sin(a) * R * .3, R * .18, R * .08, a, 0, TAU); g.fill(); }
    g.fillStyle = '#7a3c8c'; g.beginPath(); g.arc(0, 0, R * .14, 0, TAU); g.fill(); g.restore(); } });
  // the visitors walking through it
  for (const v of apNaveWalkers(o, t)) items.push({ z: dz([v.X, 0, v.Z]), d: () => { const q = P(v.X, 0, v.Z); if (q[2] < 2) return; person(q[0], q[1], kAt(q), { step: v.step, lift: 0, hat: v.seed % 4, cape: v.seed % 3 === 1, sit: 0 }, { body: AP_COLS[v.seed % 8], skin: ['#e8d4b4', '#c99a74', '#8c6448'][v.seed % 3], dark: '#3a3040', lamp: '#f0d49a', hatc: AP_COLS[(v.seed + 3) % 8] }); } });
  items.sort((a, b) => b.z - a.z); for (const it of items) it.d();
  // guy wires off the front spires
  if (k > 4) { g.strokeStyle = 'rgba(90,90,96,.5)'; g.lineWidth = 1; for (const s of [-1, 1]) { const a = apP(F(s * N.w, N.h0 - 2, N.half)), b = apP(F(s * (N.w + 9), 0, N.half + 7)), c = apP(F(s * (N.w + 10), 0, N.half - 6)); if (ok([a, b, c])) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.stroke(); } } }
}
function apNaveShadow(o, t) { const F = apFrame(o); for (const s of apNaveSpires()) apShadowLine([F(s.lx, 0, s.lf), F(s.lx, s.h, s.lf)], .5, t);
  for (const lf of [AP_NAVE.half, 0, -AP_NAVE.half]) apShadowLine(apArchPts(F, -AP_NAVE.w, AP_NAVE.w, lf, lf, 6.3, 1.6), .3, t); }

// ---------- 7. the lime-green octahedron shelters (draft 16, robin-2026-10-18/5.jpg and 6.jpg) ----------
// Plywood octahedra painted lime green (draft 16: one only, balanced on its point; apOctaGeo still takes a tilt); a little cube caps the
// top point; a square window is cut through the upper faces and the lower faces are open, so people sit inside in the
// shade. Someone sits cross-legged in the first one's window. Drawn in 3D: the faces that face the drone, lit by the sun.
function apOctaGeo(o) { const a = o.a || 2.1, tl = o.tilt || 0, ct = Math.cos(tl), sn = Math.sin(tl);
  const raw = [[0, a, 0], [a, 0, 0], [0, 0, a], [-a, 0, 0], [0, 0, -a], [0, -a, 0]].map(([x, y, z]) => [x, y * ct - z * sn, y * sn + z * ct]);
  const lift = -Math.min(...raw.map((v) => v[1])), F = apFrame(o); return raw.map(([x, y, z]) => F(x, y + lift, z)); }
const AP_OCTA_F = [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1], [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]];
function apOcta(o, t, p, k) {
  const V = apOctaGeo(o), cen = [0, 1, 2].map((i) => V.reduce((s, v) => s + v[i], 0) / 6), base = [164, 212, 58];
  const faces = AP_OCTA_F.map((f) => { const [A, B, Cc] = f.map((i) => V[i]); let n = apNorm(apCross(apSub(B, A), apSub(Cc, A))); const m = [0, 1, 2].map((i) => (A[i] + B[i] + Cc[i]) / 3); if (apDot(n, apSub(m, cen)) < 0) n = n.map((v) => -v);
    return { f, n, m, vis: apDot(n, apSub([C.x, C.y, C.z], m)) > 0, top: f[0] === 0 }; });
  const vis = faces.filter((f) => f.vis).sort((a, b) => apDot(apSub(b.m, [C.x, C.y, C.z]), apSub(b.m, [C.x, C.y, C.z])) - apDot(apSub(a.m, [C.x, C.y, C.z]), apSub(a.m, [C.x, C.y, C.z])));
  let best = null;
  for (const fc of vis) { const q = fc.f.map((i) => apP(V[i])); if (!ok(q)) return; const hl = Math.hypot(fc.n[0], fc.n[2]) || 1, L = apLight(t, [fc.n[0] / hl, fc.n[2] / hl], fc.n[1], o.X, o.Z);
    apPath(q); g.fillStyle = rgb(apShade(base, .55 + .45 * L)); g.fill(); g.strokeStyle = rgb(apShade(base, .45)); g.lineWidth = Math.max(1, .03 * k); g.stroke();
    const [A, B, Cc] = fc.f.map((i) => V[i]), at = (u, v) => apP([0, 1, 2].map((j) => A[j] + u * (B[j] - A[j]) + v * (Cc[j] - A[j])));
    if (fc.top) { const w = (o.tilt || 0) < .3 ? [at(.2, .2), at(.52, .2), at(.52, .48), at(.2, .48)] : [at(.18, .22), at(.45, .22), at(.45, .45), at(.18, .45)]; apPath(w); g.fillStyle = '#34401e'; g.fill(); // the square window, cut through the upper faces
      const s = apDot(fc.n, apNorm(apSub([C.x, C.y, C.z], fc.m))); if (!best || s > best.s) best = { s, w, fc }; }
    else { apPath([at(.1, .18), at(.62, .18), at(.1, .7)]); g.fillStyle = '#2a3418'; g.fill(); } // the lower faces are open: shade inside
  }
  // the person sitting cross-legged in the window, clipped to it
  if (o.sitter && best && k > 3) { const w = best.w, cx = (w[0][0] + w[1][0] + w[2][0] + w[3][0]) / 4, by = Math.max(...w.map((q) => q[1])), kk = k * .95; g.save(); apPath(w); g.clip();
    person(cx, by - .1 * kk, kk, { step: 0, lift: 0, hat: 0, cape: false, sit: 1 }, { body: '#2a2228', skin: '#e2c4a4', dark: '#47c1ba', lamp: '#f0d49a' }); g.restore(); }
  // the little cube on the top point
  const top = V[0], cq = [apP([top[0] - .25, top[1], top[2]]), apP([top[0], top[1] + .3, top[2]]), apP([top[0] + .25, top[1], top[2]]), apP([top[0], top[1] - .3, top[2]])]; if (ok(cq)) { apPath(cq); g.fillStyle = rgb(apShade(base, .9)); g.fill(); }
}
function apOctaShadow(o, t) { shadowOf(apOctaGeo(o), t); }

// ---------- 8. the wooden clock tower (draft 16, robin-2026-10-18/8.jpg, 9.jpg, 10.jpg) ----------
// A lattice timber tower: a plank pavilion with a Gothic grille door, a fretwork balcony round it reached by an open stair,
// a shaft with two round dials, an open belfry full of clockwork, a copper spire with a ball and a cup anemometer that
// turns in the wind. Two flying lattice arches reach from the shaft to two X-braced obelisks, one crowned by an armillary
// sphere, the other by a pinwheel sunburst. Drawn as a flat cut-out that faces the drone (like the head). Lit at night: the
// belfry and the lamps on the balcony glow. Two jesters in striped orange and black stand at its foot (separate bodies).
function apClock(o, t, p, k) {
  const S = o.scale || 1; bmBegin(p[0], p[1], k * S, 1); const det = k > 5, night = nightAmt(t), L = apLight(t, [Math.sin(Math.atan2(C.x - o.X, C.z - o.Z)), Math.cos(Math.atan2(C.x - o.X, C.z - o.Z))], 0, o.X, o.Z);
  const sh = (h, f) => bmShade(h, (.7 + .3 * L) * (f || 1)), wood = sh('#cfae7e'), woodM = sh('#b08a5c'), woodD = sh('#7a5c3c'), copper = sh('#7a8a80'), grey = sh('#9a9488');
  // the obelisks with their X bracing, the armillary sphere and the pinwheel
  for (const s of [-1, 1]) { const x = s * 8.6; bmFill([[x - .85, 0], [x + .85, 0], [x + .42, 7.4], [x - .42, 7.4]], s < 0 ? wood : woodM); bmFill([[x - .95, 0], [x + .95, 0], [x + .95, .3], [x - .95, .3]], woodD);
    if (det) for (let j = 0; j < 4; j++) { const y0 = .4 + j * 1.75, y1 = y0 + 1.75, w0 = .85 - .43 * y0 / 7.4, w1 = .85 - .43 * y1 / 7.4; bmLine([[x - w0 * .8, y0], [x + w1 * .8, y1]], .07, woodD); bmLine([[x + w0 * .8, y0], [x - w1 * .8, y1]], .07, woodD); bmLine([[x - w1, y1], [x + w1, y1]], .06, woodD); }
    bmFill([[x - .5, 7.4], [x + .5, 7.4], [x, 8.0]], woodD); }
  g.strokeStyle = woodD; g.lineWidth = bmW(.08); for (const [rx, ry, a] of [[.75, .75, 0], [.75, .28, .5], [.28, .75, 0]]) { g.beginPath(); g.ellipse(-8.6, -8.7, rx, ry, a, 0, TAU); g.stroke(); } bmLine([[-9.3, 8.0], [-7.9, 9.4]], .05, woodD);
  for (let j = 0; j < 10; j++) { const a = j / 10 * TAU + t * .6; bmFill([[8.6, 8.6], [8.6 + Math.cos(a) * .9, 8.6 + Math.sin(a) * .9], [8.6 + Math.cos(a + .25) * .75, 8.6 + Math.sin(a + .25) * .75]], j % 2 ? wood : '#e8d4a8'); }
  // the flying lattice arches from the shaft to the obelisk tops
  for (const s of [-1, 1]) { const A = [s * 1.3, 9.6], B = [s * 8.4, 7.3], M = [s * 5.2, 11.2], arc = (o2) => { const pts = []; for (let j = 0; j <= 14; j++) { const u = j / 14, a = 1 - u; pts.push([a * a * A[0] + 2 * a * u * M[0] + u * u * B[0], a * a * (A[1] + o2) + 2 * a * u * (M[1] + o2) + u * u * (B[1] + o2)]); } return pts; };
    const up = arc(0), lo = arc(-.55); bmLine(up, .12, woodM); bmLine(lo, .12, woodM); if (det) for (let j = 0; j < 14; j++) bmLine([up[j], lo[j + 1]], .05, woodD); else bmFill(up.concat(lo.slice().reverse()), woodM); }
  // the open stair up the left to the balcony
  bmFill([[-6.2, 0], [-5.3, 0], [-2.6, 3.4], [-3.5, 3.4]], woodM); if (det) for (let j = 1; j < 8; j++) { const u = j / 8; bmLine([[lerp(-6.2, -3.5, u), lerp(0, 3.4, u)], [lerp(-5.3, -2.6, u), lerp(0, 3.4, u)]], .05, woodD); }
  bmLine([[-6.0, 1.0], [-3.3, 4.4]], .08, wood); bmLine([[-6.0, 0], [-6.0, 1.0]], .07, wood);
  // the pavilion, its Gothic grille door
  bmFill([[-2.3, 0], [2.3, 0], [2.3, 3.4], [-2.3, 3.4]], grey); if (det) { g.strokeStyle = 'rgba(60,50,40,.4)'; g.lineWidth = bmW(.04); g.beginPath(); for (let x = -2.1; x < 2.3; x += .35) { g.moveTo(x, 0); g.lineTo(x, -3.4); } g.stroke(); }
  bmPath([[-.55, .2], [.55, .2], [.55, 1.9], [0, 2.6], [-.55, 1.9]]); g.closePath(); g.fillStyle = woodD; g.fill(); if (det) for (let j = -2; j <= 2; j++) bmLine([[j * .18, .25], [j * .18, 1.9 + .5 * (1 - Math.abs(j) / 3)]], .04, wood);
  // the balcony with its fretwork rail and two lamps
  bmFill([[-3.7, 3.4], [3.7, 3.4], [3.7, 3.65], [-3.7, 3.65]], woodD); bmFill([[-3.6, 3.65], [3.6, 3.65], [3.6, 4.65], [-3.6, 4.65]], wood);
  if (det) for (let j = 0; j < 8; j++) { const x = -3.4 + j * .97; bmOval(x + .45, 4.15, .3, .3, woodM); bmOval(x + .45, 4.15, .15, .15, wood); }
  for (const lx of [-3.5, 3.5]) { bmLine([[lx, 4.65], [lx, 5.2]], .05, '#3a3028'); bmFill([[lx - .12, 5.2], [lx + .12, 5.2], [lx + .1, 5.5], [lx - .1, 5.5]], night > .1 ? '#ffe2a0' : '#d8d0b8'); }
  // the shaft with two round dials, then the belfry full of clockwork
  bmFill([[-1.4, 4.65], [1.4, 4.65], [1.4, 8.9], [-1.4, 8.9]], bmLG(-1.4, 0, 1.4, 0, [woodM, wood, woodM])); bmFill([[-.9, 4.65], [.9, 4.65], [.9, 6.4], [-.9, 6.4]], sh('#a86a3a'));
  for (const [x, y] of [[-.62, 8.0], [.62, 8.0]]) { bmDot(x, y, .42, woodD); bmDot(x, y, .32, '#d8d0b8'); }
  bmFill([[-2.0, 8.9], [2.0, 8.9], [2.0, 12.1], [-2.0, 12.1]], wood); bmFill([[-2.15, 12.1], [2.15, 12.1], [2.15, 12.45], [-2.15, 12.45]], woodD);
  const glow = night > .05 ? `rgba(255,${200 + 20 * night},${120 + 30 * night},${.4 + .5 * night})` : woodD;
  for (const s of [-1, 1]) { bmPath([[s * .2, 9.3], [s * 1.75, 9.3], [s * 1.75, 11.0], [s * .97, 11.8], [s * .2, 11.0]]); g.closePath(); g.fillStyle = glow; g.fill(); }
  const gear = (x, y, r, a) => { g.save(); g.translate(x, -y); g.rotate(a); g.fillStyle = sh('#e8d8b0'); g.beginPath(); for (let j = 0; j < 20; j++) { const rr = j % 2 ? r : r * .8, aa = j / 20 * TAU; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.closePath(); g.fill(); g.fillStyle = woodD; g.beginPath(); g.arc(0, 0, r * .3, 0, TAU); g.fill(); g.restore(); };
  gear(-1.0, 10.3, .6, t * .5); gear(-.75, 11.1, .35, -t * .85); gear(1.0, 10.1, .55, -t * .3); gear(.85, 10.95, .3, t * .9);
  bmDot(0, 10.4, .55, '#efe6cc'); g.strokeStyle = '#2a2420'; g.lineWidth = bmW(.06); g.beginPath(); g.moveTo(0, -10.4); g.lineTo(Math.sin(t * .1) * .42, -10.4 - Math.cos(t * .1) * .42); g.moveTo(0, -10.4); g.lineTo(Math.sin(t * 1.2) * .5, -10.4 - Math.cos(t * 1.2) * .5); g.stroke(); // the front dial, its hands turning
  // the copper spire, the ball, the anemometer
  bmFill([[-2.1, 12.45], [2.1, 12.45], [.3, 14.6], [-.3, 14.6]], bmLG(-2, 0, 2, 0, [copper, sh('#9aaaa0'), sh('#5e6a62')]));
  bmOval(0, 14.9, .42, .38, sh('#8a5a3a')); bmLine([[0, 15.2], [0, 15.9]], .06, '#3a3028');
  for (let j = 0; j < 4; j++) { const a = t * 2.6 + j * Math.PI / 2, cx = Math.cos(a) * 1.0, front = Math.sin(a) > 0; bmLine([[0, 15.85], [cx, 15.85]], .045, '#3a3028'); bmOval(cx, 15.85, .2 * (front ? 1 : .8), .17, front ? sh('#a87a4a') : sh('#6a4a2c')); }
  g.restore();
}
function apClockShadow(o, t) { const F = apFrame(o); shadowOf([F(-2.3, 0, -1.5), F(2.3, 0, 1.5), F(-2.3, 12.4, 0), F(2.3, 12.4, 0), F(0, 15.9, 0)], t); for (const s of [-1, 1]) apShadowLine([F(s * 8.6, 0, 0), F(s * 8.6, 8, 0)], 1.2, t); apShadowLine([F(-1.3, 9.6, 0), F(-5.2, 10.6, 0), F(-8.4, 7.3, 0)], .3, t); apShadowLine([F(1.3, 9.6, 0), F(5.2, 10.6, 0), F(8.4, 7.3, 0)], .3, t); }
// the two jesters at its foot: striped orange-and-black costumes, crested gold helmets; they shift their weight and point
function apJester(x, y, k, t, i) { bmBegin(x, y, k, i ? -1 : 1); const det = k > 8, sw = Math.sin(t * .9 + i * 2) * .04;
  for (const s of [-1, 1]) bmLine([[s * .12, 0], [s * .1 + sw, .9]], .16, '#1c1a1e');
  bmFill([[-.27, .85], [.27, .85], [.24, 1.5], [-.24, 1.5]], '#e07a20'); if (det) for (let j = 0; j < 4; j++) bmFill([[-.22 + j * .14, .85], [-.15 + j * .14, .85], [-.15 + j * .14, 1.5], [-.22 + j * .14, 1.5]], '#1c1a1e');
  bmLine([[.22, 1.42], [.4, 1.15], [.5, 1.45 + .15 * Math.sin(t * 1.3 + i)]], .09, '#e07a20'); bmLine([[-.22, 1.42], [-.3, 1.0]], .09, '#1c1a1e');
  bmOval(0, 1.67, .12, .14, '#c99a72'); bmPath([[-.15, 1.66], [.15, 1.66], [.13, 1.86], [-.13, 1.86]]); g.closePath(); g.fillStyle = '#c8a040'; g.fill();
  g.beginPath(); g.moveTo(-.05, -1.84); g.quadraticCurveTo(.05, -2.25, .28, -2.08); g.quadraticCurveTo(.12, -2.0, .05, -1.84); g.closePath(); g.fillStyle = '#1c1a1e'; g.fill();
  g.restore(); }
const AP_JESTERS = [[3.4, 2.6], [4.2, 3.1]]; // [lx, lf] in the clock tower's frame, in front and to its right
function apClockExtras(o, t, list) { const F = apFrame(o);
  AP_JESTERS.forEach(([lx, lf], i) => { const w = F(lx, 0, lf), q = P(w[0], 0, w[2]); ACT.note('artpieces:clock:jester:' + i, w[0], w[2], .3, { h: 2.1, group: 'installs' }); if (q[2] < 3) return; const kk = kAt(q); if (kk < .6 || q[0] < -60 || q[0] > W + 60) return;
    list.push({ z: q[2], draw: () => apJester(q[0], q[1], kk, t, i), shadow: () => shadowStick(w[0], 0, 2.0, w[2], .45, t) }); }); }

// ---------- 9. the silver bucket-head stilt walkers (draft 16, robin-2026-10-18/11.jpg) ----------
// Two performers in shiny silver suits with upturned silver buckets over their heads, walking on buckets strapped to
// their feet: slow, stiff steps side by side along the 9:00 promenade. Separate bodies; o.path is the pair's centre.
function apStiltPair(o, t) { const [X, Z] = apPath2(o.path, t), a = o.path[0], b = o.path[o.path.length - 1], hx = b[1] - a[1], hz = b[2] - a[2], L = Math.hypot(hx, hz) || 1;
  return [[-.6, 1.0], [.6, -1.0]].map(([side, back], i) => ({ X: X + (-hz / L) * side - hx / L * back, Z: Z + (hx / L) * side - hz / L * back, i, hx: hx / L, hz: hz / L })); }
function apStilt(x, y, k, d, t, i) { bmBegin(x, y, k, d); const ph = t * 2.6 + i * 1.3, det = k > 8, silver = (x0, x1) => bmLG(x0, 0, x1, 0, ['#f4f6f8', '#9aa2aa', '#e2e6ea', '#6e767e']);
  for (const s of [-1, 1]) { const sw = Math.sin(ph + (s > 0 ? Math.PI : 0)), lift = Math.max(0, sw) * .12, fx = s * .1 + sw * .22; // a bucket on each foot
    bmFill([[fx - .17, lift], [fx + .17, lift], [fx + .14, lift + .45], [fx - .14, lift + .45]], silver(fx - .17, fx + .17)); if (det) bmLine([[fx - .16, lift + .05], [fx + .16, lift + .05]], .02, '#5a626a');
    bmLine([[fx, lift + .45], [s * .1 + sw * .08, 1.3]], .17, '#c8ced4'); }
  bmPath([[-.26, 1.25], [.26, 1.25], [.3, 1.95], [.2, 2.05], [-.2, 2.05], [-.3, 1.95]]); g.closePath(); g.fillStyle = silver(-.3, .3); g.fill();
  const as = Math.sin(ph) * .2; bmLine([[.24, 1.95], [.32 + as * .5, 1.55], [.3 + as, 1.25]], .11, '#d4dade'); bmLine([[-.24, 1.95], [-.32 - as * .5, 1.55], [-.3 - as, 1.25]], .11, '#aab2ba');
  g.save(); g.translate(.06, -2.32); g.rotate(-.18); bmFill([[-.24, -.3], [.24, -.3], [.18, .22], [-.18, .22]], silver(-.24, .24)); bmOval(0, -.3, .25, .05, '#7e868e'); bmOval(0, .22, .18, .04, '#dfe4e8');
  if (det) { bmLine([[-.23, -.18], [.23, -.18]], .02, '#6e767e'); for (let j = 0; j < 4; j++) bmDot(-.09 + j * .06, .23, .015, '#5a626a'); } g.restore();
  g.restore(); }
function apStiltsExtras(o, t, list) { for (const w of apStiltPair(o, t)) { ACT.note('artpieces:stilts:' + w.i, w.X, w.Z, .35, { h: 2.6, group: 'walkers' }); const q = P(w.X, 0, w.Z); if (q[2] < 3) continue; const kk = kAt(q); if (kk < .5 || q[0] < -60 || q[0] > W + 60) continue;
    const ah = P(w.X + w.hx, 0, w.Z + w.hz), d = Math.sign(ah[0] - q[0]) || 1; list.push({ z: q[2], draw: () => apStilt(q[0], q[1], kk, d, t, w.i), shadow: () => shadowStick(w.X, 0, 2.6, w.Z, .45, t) }); } }

// ---------- the front layer: the monolith framing the burn through its hole ----------
// The Man's fire is drawn over the scene list (render.js manFire), so a slab standing between the drone and the fire
// would be painted over. A piece with front: true is drawn here instead, after the fire, graded the way render.js grades
// the car layer. Needs one word in render.js: FRONT_HOOKS gets 'artpiecesFront'. Without it, front pieces draw as usual.
const AP_DRAW = { burger: apBurger, jig: apJig, monolith: apMonolith, head: apHead, genie: apGenie, nave: apNave, octa: apOcta, clock: apClock };
const AP_FC = mkCanvas(), apFg = AP_FC.getContext('2d'), AP_FM = mkCanvas(), apFm = AP_FM.getContext('2d');
const apFrontOn = () => typeof FRONT_HOOKS !== 'undefined' && FRONT_HOOKS.includes('artpiecesFront');
function artpiecesFront(t) {
  const fr = ARTPIECES.filter((o) => o.front); if (!fr.length) return; const gs = g;
  apFg.setTransform(1, 0, 0, 1, 0, 0); apFg.globalCompositeOperation = 'source-over'; apFg.globalAlpha = 1; apFg.clearRect(0, 0, W, H); g = apFg;
  for (const o of fr) { const p = P(o.X, 0, o.Z); if (p[2] < 3) continue; g.save(); AP_DRAW[o.kind](o, t, p, kAt(p)); g.restore(); }
  apFm.clearRect(0, 0, W, H); apFm.drawImage(AP_FC, 0, 0); grade(t, true); apFg.globalCompositeOperation = 'destination-in'; apFg.drawImage(AP_FM, 0, 0); apFg.globalCompositeOperation = 'source-over';
  g = gs; g.drawImage(AP_FC, 0, 0);
}

// ---------- the actor check (tools/check-actors.mjs) ----------
// Each piece reports its footprint as a fixed circle (the genie as its planter, where it has driven to). The big rig arch
// stands on the first cab's nose and the bent tank above it; the rest of it is overhead, so only that foot is solid.
const AP_FOOT = { burger: [0, 0, 2.1], jig: [1.6, 0, 2.6], monolith: [0, 0, 2.6], head: [0, 0, 3.9], genie: [0, 0, 2.4], octa: [0, 0, 2.0], clock: [0, 0, 3.8] }; // [lx, lf, r]
// draft 16: pieces with more than one solid body note each one ([lx, lf, r] in the piece's frame); the nave's spires and its
// mandala pole, the clock tower's obelisks and the foot of its stair
const AP_BODIES = { nave: () => apNaveSpires().map((q) => [q.lx, q.lf, .45]).concat([[0, AP_NAVE.mand, .3]]), clock: () => [[0, 0, 3.8], [-5.6, 0, .8], [-8.6, 0, 1.0], [8.6, 0, 1.0]] };
function apNote(o, S, t) { if (o.kind === 'stilts') return; const id = 'artpieces:' + (o.name || o.kind), h = AP_SIZE[o.kind][1] * S;
  if (AP_BODIES[o.kind]) { AP_BODIES[o.kind]().forEach(([lx, lf, r], i) => { const w = apFrame(o)(lx, 0, lf); ACT.note(id + ':' + i, w[0], w[2], r * S, { h, group: 'installs' }); });
    if (o.kind === 'nave' && ACT.on) apNaveWalkers(o, t).forEach((v) => ACT.note(id + ':visitor:' + v.i, v.X, v.Z, .3, { h: 1.8, group: 'visitors' })); return; }
  const [lx, lf, r] = AP_FOOT[o.kind], w = apFrame(o)(lx, 0, lf);
  ACT.note(id, w[0], w[2], r * S, { h, group: 'installs' });
  if (o.sign) { const b = apFrame(o)(o.sign.lx, 0, o.sign.lf); ACT.note('artpieces:burger-sign', b[0], b[2], .5, { h: 7, group: 'installs' }); } }

// ---------- the scene hook ----------
const AP_SIZE = { burger: [8, 7], jig: [7, 15.5], monolith: [4, 7.6], head: [5, 5.3], genie: [6, 14], nave: [17, 14], octa: [3, 4.4], clock: [9.6, 16], stilts: [1, 2.6] }; // half width for culling, height
function artpiecesInto(t, list) {
  for (const o of ARTPIECES) {
    if (o.t0 != null && t < o.t0) continue; if (o.t1 != null && t > o.t1) continue;
    if (o.path) { const [X, Z] = apPath2(o.path, t); o.X = X; o.Z = Z; } // a mobile piece: where it has driven to by t (set each frame, so still a pure function of t)
    if (o.kind === 'stilts') { apStiltsExtras(o, t, list); continue; } // draft 16: the stilt walkers are two bodies of their own
    const p = P(o.X, 0, o.Z), [hw, ht] = AP_SIZE[o.kind], S = o.scale || 1; apNote(o, S, t);
    if (o.kind === 'clock') apClockExtras(o, t, list);
    if (o.kind === 'octa') apVisitors(o, t, list); // draft 16: its visitors are culled one by one, never with the piece (no pop at a frame edge)
    if (p[2] < 3) continue; const k = kAt(p);
    if (ht * S * k < 2 || p[0] < -hw * S * k - 200 || p[0] > W + hw * S * k + 200) continue;
    const draw = AP_DRAW[o.kind], shadow = { burger: apBurgerShadow, jig: apJigShadow, monolith: apMonoShadow, head: apHeadShadow, genie: apGenieShadow, nave: apNaveShadow, octa: apOctaShadow, clock: apClockShadow }[o.kind];
    list.push({ z: p[2], draw: () => { if (o.front && apFrontOn()) return; g.save(); draw(o, t, p, k); g.restore(); }, shadow: () => { g.save(); shadow(o, t); g.restore(); } }); // a front piece is drawn by artpiecesFront instead
    if (o.sign) { const b = apFrame(o)(o.sign.lx, 0, o.sign.lf), q = P(b[0], 0, b[2]); if (q[2] > 2) list.push({ z: q[2], draw: () => { g.save(); apSign(o, t); g.restore(); } }); }
    if (k > .8 && o.kind !== 'octa') apVisitors(o, t, list);
  }
}
