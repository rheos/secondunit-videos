// Reform Party, Dali look: the playa (elephants, the poor person, the cops, camps, lamps, riders, art cars, dust devils).
// Draft 3 (b4): every playa figure is drawn in metres in a local frame (bmBegin), shaded, with long shadows, so detail
// holds up close and simplifies far off. Everything new goes through playaInto; the draft-2 entry points that
// render.js still calls (elephantsInto, poorPerson, cops, CAMPS, BIKES) are kept as empty stubs so nothing draws twice.

// ---------- local drawing frame: metres, y up, facing d (+1 right, -1 left) ----------
let bmK = 1;
function bmBegin(x, y, k, d) { g.save(); g.translate(x, y); g.scale((d || 1) * k, k); bmK = k; }
const bmW = (w) => Math.max(w, 1 / bmK);
function bmPath(pts) { g.beginPath(); for (let i = 0; i < pts.length; i++) i ? g.lineTo(pts[i][0], -pts[i][1]) : g.moveTo(pts[i][0], -pts[i][1]); }
function bmFill(pts, fill) { bmPath(pts); g.closePath(); g.fillStyle = fill; g.fill(); }
function bmLine(pts, w, col) { bmPath(pts); g.strokeStyle = col; g.lineWidth = bmW(w); g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function bmDot(x, y, r, fill) { g.beginPath(); g.arc(x, -y, r, 0, TAU); g.fillStyle = fill; g.fill(); }
function bmOval(x, y, rx, ry, fill, rot) { g.beginPath(); g.ellipse(x, -y, Math.max(rx, 1e-4), Math.max(ry, 1e-4), rot || 0, 0, TAU); g.fillStyle = fill; g.fill(); }
function bmLG(x0, y0, x1, y1, cols) { const gr = g.createLinearGradient(x0, -y0, x1, -y1); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); return gr; }
function bmShade(h, f) { const c = hex(h); return rgb([c[0] * f, c[1] * f, c[2] * f]); }
function bmJoint(a, b, l1, l2, sx, sy) { // a two-bone joint (knee, elbow) between a and b; bends toward (sx, sy)
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.max(1e-4, Math.min(Math.hypot(dx, dy), l1 + l2 - 1e-4)), th = Math.atan2(dy, dx), A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const p = [a[0] + l1 * Math.cos(th + A), a[1] + l1 * Math.sin(th + A)], q = [a[0] + l1 * Math.cos(th - A), a[1] + l1 * Math.sin(th - A)];
  return p[0] * sx + p[1] * sy > q[0] * sx + q[1] * sy ? p : q;
}
function bmFur(pts, amp, seed) { // an outline broken into tufts: fur coats, fluffy hats
  const out = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / .055)), nx = -(b[1] - a[1]), ny = b[0] - a[0], L = Math.hypot(nx, ny) || 1;
    for (let j = 0; j < n; j++) { const u = j / n, o = (j % 2 ? amp : -amp * .25) * (.6 + .4 * rnd(seed, i, j)); out.push([lerp(a[0], b[0], u) + nx / L * o, lerp(a[1], b[1], u) + ny / L * o]); } }
  return out; }
function bmCrutch(a, b, w) { // a Dali crutch from foot a up to the fork b, with its padded cradle
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, m = [lerp(a[0], b[0], .62), lerp(a[1], b[1], .62)];
  bmLine([a, m], w, PAL.crutch); bmLine([m, [b[0] + nx * w * 1.6, b[1] + ny * w * 1.6]], w * .7, PAL.crutch); bmLine([m, [b[0] - nx * w * 1.6, b[1] - ny * w * 1.6]], w * .7, PAL.crutch);
  bmLine([[b[0] + nx * w * 2.6, b[1] + ny * w * 2.6], [b[0] - nx * w * 2.6, b[1] - ny * w * 2.6]], w * 1.4, '#e9dcc2');
  const hp = [lerp(a[0], b[0], .78), lerp(a[1], b[1], .78)]; bmLine([[hp[0] + nx * w * 1.2, hp[1] + ny * w * 1.2], [hp[0] - nx * w * 1.2, hp[1] - ny * w * 1.2]], w * .8, '#8a6a3c');
}
const bmVis = (p, m) => p[2] > 1 && p[0] > -m && p[0] < W + m;
const bmFade = (p) => clamp((p[2] - 4.5) / 3.5); // anything closer than ~3 m to the lens fades out instead of wiping the frame as a block

// ---------- stilt elephants ----------
// elephant(X, Z, t, s, ph, load) keeps its draft-2 signature; o (optional, last) adds: dir, grow (stilts 0..1), vogue, flip, chips (0..1), walk.
function elephant(X, Z, t, s, ph, load, o) {
  o = o || {}; const p = P(X, 0, Z); if (p[2] < 1.5) return; const k = kAt(p) * s; if (k < .25 || p[0] < -16 * k || p[0] > W + 16 * k) return;
  const d = o.dir || 1, grow = o.grow == null ? 1 : o.grow, legH = .9 + 9.6 * grow, flip = o.flip || 0, vog = o.vogue || 0, det = k > 6, lx = -d;
  const wk = (o.walk == null ? 1 : o.walk), w = Math.sin(t * 1.4 * wk + ph) * wk, bob = Math.abs(Math.cos(t * 1.4 * wk + ph)) * .12 * wk, B = legH + bob;
  bmBegin(p[0], p[1], k, d); if (o.alpha != null) g.globalAlpha = o.alpha;
  if (flip > 0) { const hp = (legH + 2.7) / 2; g.translate(0, -hp); g.rotate(Math.PI * flip); g.translate(0, hp); }
  const skin = PAL.elephant, lit = PAL.elephantLit, far = bmShade(PAL.elephant, .72);
  const leg = (hx, sw, col, lift) => { // a spindly insect leg with two knees and a small round foot
    const top = [hx, B + .35], foot = lift ? [hx + 1.2, legH * .42] : [hx + sw, 0], k1 = [lerp(top[0], foot[0], .38) + .28 + (lift ? .9 : 0), lerp(top[1], foot[1], .36)], k2 = [lerp(top[0], foot[0], .7) - .12, lerp(top[1], foot[1], .7)];
    bmLine([top, k1, k2, foot], .2, col); if (det) { bmDot(k1[0], k1[1], .17, col); bmDot(k2[0], k2[1], .13, col); } bmOval(foot[0], foot[1] + .08, .3, .11, col);
  };
  leg(-1.0, -w * 1.1, far); leg(1.85, w * 1.1, far);
  // tail
  bmLine([[-2.4, B + 1.5], [-2.75, B + .9 + w * .1], [-2.7, B + .45]], .07, skin); bmOval(-2.7, B + .38, .09, .16, '#4a4038');
  // body: a soft barrel that sags a little underneath
  const bg = bmLG(lx * 1.2, B + 2.6, -lx * 1.4, B + .2, [lit, skin, bmShade(PAL.elephant, .7)]);
  bmPath([[-2.55, B + 1.2], [-2.3, B + 2.15], [-1, B + 2.62], [1, B + 2.6], [2.35, B + 2.1], [2.6, B + 1.2], [2.1, B + .38], [.6, B + .05], [-.8, B + .08], [-2.15, B + .42]]); g.closePath(); g.fillStyle = bg; g.fill();
  if (det) { g.strokeStyle = 'rgba(60,50,45,.35)'; g.lineWidth = bmW(.05); for (const wx of [-1.7, -1.4, 1.5]) { g.beginPath(); g.moveTo(wx, -(B + .4)); g.quadraticCurveTo(wx + .15, -(B + 1.2), wx, -(B + 1.9)); g.stroke(); } }
  // saddle cloth with a fringe
  const cloth = load === 'chips' ? '#7a1420' : '#c7362b'; bmFill([[-1.35, B + 2.55], [1.35, B + 2.55], [1.45, B + 1.25], [-1.45, B + 1.25]], cloth);
  bmFill([[-1.45, B + 1.32], [1.45, B + 1.32], [1.45, B + 1.18], [-1.45, B + 1.18]], '#d9b45a');
  if (det) { for (let i = 0; i < 10; i++) { const fx = -1.4 + i * .31; bmFill([[fx, B + 1.2], [fx + .3, B + 1.2], [fx + .15, B + .95]], '#d9b45a'); } }
  // near legs (one lifts and the trunk goes up on "vogue")
  leg(-1.5, w * 1.1, skin); leg(1.35, -w * 1.1, skin, vog > .5);
  // head, ear, tusk, trunk
  const HX = 2.55, HY = B + 1.75 + vog * .2;
  bmDot(HX, HY, .95, bmLG(HX + lx * .8, HY + .8, HX - lx * .8, HY - .8, [lit, skin]));
  const fl = Math.sin(t * 2.1 + ph) * .1; bmOval(HX - .45, HY - .05, .72 + fl * .3, 1.05, bmShade(PAL.elephant, .82), -.15 + fl); if (det) bmOval(HX - .45, HY - .05, .46, .74, 'rgba(210,150,140,.55)', -.15 + fl);
  bmDot(HX + .45, HY + .3, .075, '#1c1614');
  const tr = vog > 0 ? [[HX + .7, HY - .25], [HX + 1.5, HY + lerp(-.9, 1.4, vog)], [HX + lerp(1.1, 1.3, vog), HY + lerp(-2.6, 2.6, vog) + w * .12]] : [[HX + .7, HY - .25], [HX + 1.35, HY - 1.2], [HX + 1.05, HY - 2.6 + w * .12]];
  g.lineCap = 'round'; g.strokeStyle = skin; for (const [wd, u0] of [[.46, 0], [.34, .35], [.22, .7]]) { g.lineWidth = bmW(wd); g.beginPath(); const q = (u) => { const a = 1 - u; return [a * a * tr[0][0] + 2 * a * u * tr[1][0] + u * u * tr[2][0], a * a * tr[0][1] + 2 * a * u * tr[1][1] + u * u * tr[2][1]]; }; for (let i = 0; i <= 6; i++) { const pt = q(u0 + (1 - u0) * i / 6 * (wd === .46 ? .5 : 1)); i ? g.lineTo(pt[0], -pt[1]) : g.moveTo(pt[0], -pt[1]); } g.stroke(); }
  bmLine([[HX + .55, HY - .55], [HX + .95, HY - .75], [HX + 1.15, HY - .55]], .1, '#efe6d0');
  // the load on its back
  const top = B + 2.55;
  if (flip < .5) {
    if (load === 'papers') { for (let i = 0; i < 9; i++) bmFill([[-1.1 + Math.sin(i * 2.3) * .2, top + i * .38], [1.1 + Math.sin(i * 2.3) * .2, top + i * .38], [1.1 + Math.sin(i * 2.3) * .2, top + i * .38 + .34], [-1.1 + Math.sin(i * 2.3) * .2, top + i * .38 + .34]], i % 2 ? '#ece6d6' : '#d9d1bd'); }
    else if (load === 'ballot') { bmFill([[-1.2, top], [1.2, top], [1.2, top + 2.4], [-1.2, top + 2.4]], bmLG(-1.2 * lx, 0, 1.2 * lx, 0, ['#f7f0de', '#cfc5ad'])); bmFill([[-.7, top + 2.3], [.7, top + 2.3], [.7, top + 2.45], [-.7, top + 2.45]], '#1a1a1a'); const by = top + 2.5 + Math.abs(Math.sin(t * 2 + ph)) * .5; bmFill([[-.35, by], [.35, by], [.35, by + .9], [-.35, by + .9]], '#fbf7ec'); }
    else if (load === 'cash') { for (let i = 0; i < 6; i++) { bmFill([[-1.2, top + i * .32], [1.2, top + i * .32], [1.15, top + i * .32 + .3], [-1.25, top + i * .32 + .3]], i % 2 ? '#b9c99a' : '#9fb37e'); bmFill([[-.2, top + i * .32], [.2, top + i * .32], [.2, top + i * .32 + .3], [-.2, top + i * .32 + .3]], '#e8dcb0'); } }
    else if (load === 'chips') { // a howdah of casino chips: towers that grow on "bets", one propped on a crutch
      bmFill([[-1.7, top - .05], [1.7, top - .05], [1.6, top + .3], [-1.6, top + .3]], '#d9b45a'); const cols = ['#c7362b', '#f2ede0', '#2f6fb5', '#1c1a1e'], hs = [7, 11, 9, 13];
      for (let c = 0; c < 4; c++) { const n = Math.round(hs[c] * clamp(o.chips == null ? 1 : o.chips)), cx = -1.2 + c * .8 + Math.sin(c * 1.7) * .05, lean = Math.sin(t * .9 + c + ph) * .015 * n;
        for (let j = 0; j < n; j++) { const cy = top + .3 + j * .2, cxx = cx + lean * j / Math.max(1, n); bmFill([[cxx - .36, cy], [cxx + .36, cy], [cxx + .36, cy + .18], [cxx - .36, cy + .18]], bmShade(cols[c], c === 1 ? .82 : .8)); if (det) for (let q = 0; q < 3; q++) bmFill([[cxx - .26 + q * .22, cy + .03], [cxx - .2 + q * .22, cy + .03], [cxx - .2 + q * .22, cy + .15], [cxx - .26 + q * .22, cy + .15]], c === 1 ? '#c7362b' : '#f2ede0'); bmOval(cxx, cy + .18, .36, .07, cols[c]); }
        if (c === 3 && n > 6) bmCrutch([2.3, B + 1.4], [cx + lean + .38, top + .3 + n * .14], .06); }
    } else { // a soft tower that droops at the tip, with a red pennant
      bmFill([[-1, top], [1, top], [.3, top + 3.6], [.5, top + 3.9], [.15, top + 4.0], [-.3, top + 3.6]], bmLG(lx * .8, 0, -lx * .8, 0, ['#f1e4c4', '#c9b88f'])); bmLine([[.2, top + 3.9], [.2, top + 4.8]], .05, '#5a4a3a'); bmFill([[.2, top + 4.8], [1.1, top + 4.6 + Math.sin(t * 3 + ph) * .08], [.2, top + 4.4]], '#c7362b'); }
  }
  g.restore();
}
// day elephants: wrapped relative to the car so a few always walk the playa; bigger and nearer than draft 2.
// r0: start offset from the car, dv: speed relative to the car, Z: depth, s: scale.
const BM_ELEPHANTS = [
  { r0: 30, dv: -.55, Z: 36, s: 1.25, load: 'papers' }, { r0: -40, dv: .5, Z: 46, s: 1.15 }, { r0: 85, dv: -.8, Z: 58, s: 1.4, load: 'ballot' },
  { r0: 150, dv: -.4, Z: 40, s: 1.2 }, { r0: -110, dv: .65, Z: 64, s: 1.5, load: 'papers' }, { r0: 10, dv: -1.1, Z: 75, s: 1.6, load: 'ballot' },
  { r0: 205, dv: -.7, Z: 50, s: 1.3, load: 'cash' }, { r0: -170, dv: .35, Z: 30, s: 1.05 },
];
// elephants that lead the table along the road: they walk just behind the car's line, a little slower, so the board
// drives past beneath their stilts. Each has a window [t0, t1] in which it is on the road.
const BM_ROAD = [{ t0: 24, t1: 58.5, r0: 30, dv: -.75, Z: 11, s: 1.2, load: 'papers' }, { t0: 141, t1: 155.4, r0: 26, dv: -.9, Z: 12, s: 1.15, load: 'cash' }];
const bmVogue = (t) => { const v = wt(14, 'vogue'); return ease(t, v - .15, v + .35) * (1 - ease(t, v + 1.7, v + 2.3)); };
const bmFlip = (t) => { const pv = wt(29, 'perverse'); return easeOutBack(clamp((t - pv + .05) / .55), 1.2) * (1 - ease(t, L_(30).s - .5, L_(30).s + .1)); };
function bmElephantEntry(X, Z, t, s, ph, load, o, list) {
  const p = P(X, 0, Z); if (p[2] < 2 || p[0] < -W * .7 || p[0] > W * 1.7) return; const lh = .9 + 9.6 * (o.grow == null ? 1 : o.grow);
  list.push({ z: p[2], draw: () => elephant(X, Z, t, s, ph, load, o), shadow: () => { shadowOf([[X - 2.4 * s, (lh + .3) * s, Z], [X + 3.4 * s, (lh + .3) * s, Z], [X - 2.2 * s, (lh + 2.6) * s, Z], [X + 2.6 * s, (lh + 2.8) * s, Z]], t); for (const dx of [-1.5, -1, 1.35, 1.85]) shadowStick(X + dx * s, 0, lh * s, Z, .3 * s, t); } });
}
function bmElephantsInto(t, list) {
  const cx = carX(clamp(t, 0, 238)), vo = bmVogue(t), fl = bmFlip(t);
  BM_ELEPHANTS.forEach((e, i) => { const rel = ((((e.r0 + e.dv * t) % 400) + 400) % 400) - 200, X = cx + rel, v = 1.6 + e.dv; bmElephantEntry(X, e.Z, t, e.s, i * 2.1, e.load, { dir: Math.sign(v) || 1, walk: clamp(Math.abs(v) / 1.4, .5, 1.3), vogue: vo, flip: fl }, list); });
  BM_ROAD.forEach((e, i) => { if (t < e.t0 || t > e.t1) return; const X = cx + e.r0 + e.dv * (t - e.t0); bmElephantEntry(X, e.Z, t, e.s, 7 + i, e.load, { dir: 1, walk: .85, vogue: vo, flip: fl }, list); });
}
// "expand the wars": a stilt-elephant parade behind the table; their stilts shoot up out of the sand on "wars" and
// the chip towers on their backs grow with the bets.
function bmWarsInto(t, list) {
  const w = wt(21, 'wars'), bets = wt(22, 'bets'); if (t < w - 1.5 || t > 150) return; const base = carX(w), fl = bmFlip(t);
  for (let i = 0; i < 5; i++) { const go = Math.max(0, t - 142.7), X = base - 17 + i * 9 + (t - w) * 1.95 + go * go * 5, Z = 21 + (i % 2) * 7 + i * .8, grow = (.02 + .98 * easeOutBack(clamp((t - w - i * .12) / .9), 1.4)) * (1 - .9 * ease(t, 142.6, 143.5)), chips = .25 + .75 * ease(t, bets - .4, bets + 1.6);
    bmElephantEntry(X, Z, t, 1.05 + (i % 3) * .1, 30 + i * 1.3, 'chips', { dir: 1, grow, chips, walk: .9 + .3 * grow, flip: fl }, list); }
}

// ---------- costumed riders ----------
const BM_COATS = [['#f4b0cf', '#b05a84'], ['#f6f0e2', '#b3a690'], ['#9a68dc', '#4b2a80'], ['#47c1ba', '#1d6f6a'], ['#ee9a42', '#9a4f16'], ['#e3cb82', '#8a6a2c'], ['#e0533a', '#7a1d12'], ['#3a3442', '#141218']];
const BM_PARAS = [['#d8452f', '#f6efe0'], ['#2f6fb5', '#e8b23a'], ['#7a3c8c', '#f4b0cf'], ['#3c8c5a', '#f6efe0'], ['#e8b23a', '#d8452f'], ['#1c1a1e', '#e8b23a']];
function bmCostume(seed, force) {
  const R = mulberry(seed), pick = (a) => a[Math.floor(R() * a.length)], c = {
    coat: pick(BM_COATS), fur: R() < .72, spots: R() < .22, trim: pick(['#fbf6ea', '#f4b0cf', '#e8b23a', '#1c1a1e', '#47c1ba']), legs: pick(['#2a2420', '#e8d4b4', '#3a3048', '#c43a2a', '#1c1a1e']), stripes: R() < .3,
    skin: pick(['#e8cfae', '#c99a72', '#8a5a3c', '#f1dcc4', '#6a4630']), hat: pick(['top', 'fluff', 'bopper', 'sun', 'none', 'top', 'fluff']), lens: pick(['#f0b030', '#3fc0e0', '#c060e0', '#e05a3a']),
    para: R() < .38 ? pick(BM_PARAS) : null, flag: R() < .5 ? { h: 3 + R() * 1.7, col: pick(['#d8452f', '#e8b23a', '#2f6fb5', '#f6efe0', '#7a3c8c', '#3c8c5a']), col2: pick(['#f6efe0', '#1c1a1e', '#e8b23a']) } : null,
    frame: pick(['#c43a2a', '#2f6fb5', '#e8b23a', '#3c8c5a', '#d9d2c2', '#1c1a1e', '#9a68dc']), bike: R() < .68 ? 'plain' : pick(['tall', 'fish', 'snail', 'clock']), seed: seed % 97 };
  return Object.assign(c, force || {});
}
function bmWheel(cx, cy, r, ang, det, rimCol) {
  g.beginPath(); g.arc(cx, -cy, r, 0, TAU); g.strokeStyle = '#1b1714'; g.lineWidth = bmW(.055); g.stroke();
  g.beginPath(); g.arc(cx, -cy, r - .045, 0, TAU); g.strokeStyle = rimCol || '#a49a8c'; g.lineWidth = bmW(.018); g.stroke();
  if (det) { g.strokeStyle = 'rgba(70,64,58,.75)'; g.lineWidth = bmW(.008); g.beginPath(); for (let i = 0; i < 8; i++) { const a = ang + i * Math.PI / 8; g.moveTo(cx + Math.cos(a) * (r - .05), -cy - Math.sin(a) * (r - .05)); g.lineTo(cx - Math.cos(a) * (r - .05), -cy + Math.sin(a) * (r - .05)); } g.stroke(); }
  bmDot(cx, cy, .035, '#3a342e');
}
function bmParasol(hx, hy, c, t, det) { // a fringed parasol held up from the hand
  g.save(); g.translate(hx, -hy); g.rotate(-.22 + n1(c.seed + 9, t * .7) * .1); bmLine([[0, -.2], [0, 1.0]], .025, '#3a3028');
  g.translate(0, -1.0); const R = .82, Hh = .46, n = 8, rim = [];
  for (let i = 0; i <= n; i++) rim.push([-Math.cos(i / n * Math.PI) * R, 0]);
  for (let i = 0; i < n; i++) { g.beginPath(); g.moveTo(0, -Hh); g.lineTo(rim[i][0], 0); g.quadraticCurveTo((rim[i][0] + rim[i + 1][0]) / 2, .09, rim[i + 1][0], 0); g.closePath(); g.fillStyle = c.para[i % 2]; g.fill(); }
  const sh = g.createLinearGradient(-R, 0, R, 0); sh.addColorStop(0, 'rgba(255,250,235,.18)'); sh.addColorStop(1, 'rgba(30,20,30,.32)'); g.beginPath(); g.moveTo(-R, 0); g.quadraticCurveTo(-R * .9, -Hh * 1.2, 0, -Hh); g.quadraticCurveTo(R * .9, -Hh * 1.2, R, 0); g.closePath(); g.fillStyle = sh; g.fill();
  if (det) { g.strokeStyle = c.para[1]; g.lineWidth = bmW(.012); g.beginPath(); for (let i = 0; i <= 24; i++) { const x = -R + i / 24 * 2 * R; g.moveTo(x, .04); g.lineTo(x + Math.sin(t * 4 + i) * .01, .13); } g.stroke(); }
  bmDot(0, Hh + .05, .04, '#d9b45a'); g.restore();
}
// A rider on a bike, side on. (x, y) = ground point under the bottom bracket, k px per metre, d direction, sp metres travelled.
function bmRider(x, y, k, d, sp, t, c, alpha) {
  if (k < .9) return; bmBegin(x, y, k, d); if (alpha != null && alpha < 1) g.globalAlpha = alpha;
  const det = k > 15, lx = -d, ink = '#1b1714', up = c.bike === 'tall' ? 1.0 : 0, cw = c.bike === 'clock', rf = cw ? .46 : .34, RW = [-.55, .34], FW = [cw ? .72 : .57, rf], ang = -sp / .34;
  const BB = [-.04, .3 + up], SEAT = [-.2, .88 + up], HT = [.4, .9 + up], HB = [.45, .72 + up], G = [.27, 1.1 + up], H0 = [-.2, .98 + up], S = [H0[0] + .13, H0[1] + .56], HD = [S[0] + .05, S[1] + .23];
  const ca = ang * .55 + c.seed, P1 = [BB[0] + Math.cos(ca) * .17, BB[1] + Math.sin(ca) * .17], P2 = [BB[0] - Math.cos(ca) * .17, BB[1] - Math.sin(ca) * .17];
  if (k < 5) { // far away: a coloured rider on a dark bike, enough to read as traffic
    bmWheel(RW[0], RW[1], .34, 0, false); bmWheel(FW[0], FW[1], rf, 0, false); bmLine([RW, BB, HB, FW], .08, c.frame); bmFill([[S[0] - .2, S[1]], [S[0] + .14, S[1]], [H0[0] + .25, H0[1] - .3], [H0[0] - .3, H0[1] - .35]], c.coat[0]); bmDot(HD[0], HD[1], .13, c.skin);
    if (c.flag) bmLine([[-.62, .6], [-.66, c.flag.h + up]], .06, c.flag.col); if (c.para) bmOval(S[0] - .1, S[1] + 1.25, .8, .3, c.para[0]); g.restore(); return; }
  // flag pole on the rear rack, its pennant streaming back
  if (c.flag) { const top = c.flag.h + up, n = 10, pts = []; bmLine([[-.6, .62 + up * .5], [-.66, top]], .03, '#3a3028');
    for (let i = 0; i <= n; i++) { const u = i / n; pts.push([-.66 - u * 1.35, top - u * .14 + Math.sin(u * 5 - t * 7 + c.seed) * .1 * u]); }
    for (let i = n; i >= 0; i--) { const u = i / n; pts.push([-.66 - u * 1.35, top - .52 + u * .38 + Math.sin(u * 5 - t * 7 + c.seed) * .1 * u]); }
    bmFill(pts, c.flag.col); if (det) { const st = pts.slice(0, n + 1); bmFill(st.concat(st.slice().reverse().map(([a, b], j) => [a, b - .13 * (1 - (n - j) / n * .7)])), c.flag.col2); } bmDot(-.66, top + .05, .06, '#e8c04a'); }
  // a giant snail shell towed over the back wheel
  if (c.bike === 'snail') { const sx = -.75, sy = 1.15 + up; bmDot(sx, sy, .66, bmLG(sx + lx * .5, sy + .5, sx - lx * .6, sy - .5, ['#f0d9a8', '#b07a3a', '#6e4420'])); g.strokeStyle = 'rgba(80,46,20,.8)'; g.lineWidth = bmW(.05); g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU * 2.2, r = .62 * (1 - i / 46); i ? g.lineTo(sx + Math.cos(a) * r, -sy - Math.sin(a) * r) : g.moveTo(sx + Math.cos(a) * r, -sy - Math.sin(a) * r); } g.stroke(); }
  // far leg and the far crank
  const legCol = c.legs, farLeg = bmShade(c.legs, .62), K2 = bmJoint(H0, P2, .47, .48, 1, .2);
  bmLine([H0, K2, P2], .13, farLeg); bmOval(P2[0] + .04, P2[1], .1, .055, c.fur ? bmShade(c.trim, .7) : ink);
  // wheels
  bmWheel(RW[0], RW[1], .34, ang, det);
  if (cw) { bmDot(FW[0], FW[1], rf, bmLG(FW[0] - .4, FW[1] + .4, FW[0] + .4, FW[1] - .4, ['#fbf1d0', '#d9c48a'])); g.strokeStyle = '#b08a3a'; g.lineWidth = bmW(.05); g.beginPath(); g.arc(FW[0], -FW[1], rf, 0, TAU); g.stroke(); g.strokeStyle = '#3a2a1a';
    for (let i = 0; i < 12; i++) { const a = ang * .74 + i / 12 * TAU; g.lineWidth = bmW(.025); g.beginPath(); g.moveTo(FW[0] + Math.cos(a) * rf * .78, -FW[1] - Math.sin(a) * rf * .78); g.lineTo(FW[0] + Math.cos(a) * rf * .9, -FW[1] - Math.sin(a) * rf * .9); g.stroke(); }
    for (const [L, sp2, wd] of [[.24, 1, .03], [.36, 12, .018]]) { const a = t * sp2 * .5; bmLine([FW, [FW[0] + Math.cos(a) * L, FW[1] + Math.sin(a) * L]], wd, '#1a1412'); } }
  else bmWheel(FW[0], FW[1], rf, ang, det);
  // frame (a tall bike welds a second frame on top)
  const fc = c.frame, tube = .045; bmLine([RW, [BB[0], .3], [SEAT[0], .88], RW], tube, fc); bmLine([[BB[0], .3], [HB[0], .72], [HT[0], .9], [SEAT[0], .88]], tube, fc); bmLine([[HB[0], .72], FW], tube, fc);
  if (up) { bmLine([[SEAT[0], .88], [BB[0], BB[1]], SEAT, HT, HB, [BB[0], BB[1]]], tube, fc); bmLine([[HT[0], .9], HB], tube, fc); bmLine([BB, [RW[0], RW[1] + .02]], .015, '#3a342e'); }
  else bmLine([BB, RW], .015, '#3a342e'); // chain
  bmLine([HT, [HT[0] - .02, HT[1] + .16], [G[0], G[1]]], .035, '#2a2622'); bmOval(SEAT[0] - .02, SEAT[1] + .07, .14, .035, '#3a2416');
  // a fish shell around the bike: the rider pops out of its back
  if (c.bike === 'fish') { const fy = .92 + up, fcol = c.frame; bmPath([[1.1, fy], [.7, fy + .42], [-.6, fy + .45], [-1.1, fy + .1], [-1.55, fy + .45], [-1.45, fy - .05], [-1.55, fy - .5], [-1.1, fy - .12], [-.6, fy - .42], [.7, fy - .36]]); g.closePath(); g.fillStyle = bmLG(0, fy + .45, 0, fy - .45, ['#f6efe0', fcol, bmShade(fcol, .6)]); g.fill();
    bmFill([[-.3, fy + .42], [.2, fy + .78], [.35, fy + .4]], bmShade(fcol, .8)); if (det) { g.strokeStyle = 'rgba(255,250,235,.45)'; g.lineWidth = bmW(.02); for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-.5 + i * .25, -fy, .15, -1, 1); g.stroke(); } } bmDot(.82, fy + .08, .07, '#fbf7ec'); bmDot(.84, fy + .08, .035, ink); }
  // near crank, pedal, near leg with a furry boot
  bmLine([BB, P1], .03, '#5a524a'); const K1 = bmJoint(H0, P1, .47, .48, 1, .2);
  if (c.bike !== 'fish') { bmLine([H0, K1, P1], .14, legCol); if (det && c.stripes) { g.strokeStyle = 'rgba(255,250,235,.7)'; g.lineWidth = bmW(.03); g.setLineDash([.04, .05]); g.beginPath(); g.moveTo(K1[0], -K1[1]); g.lineTo(P1[0], -P1[1]); g.stroke(); g.setLineDash([]); } }
  bmOval(P1[0] + .04, P1[1] + .01, .11, .065, c.fur ? c.trim : ink);
  // far arm (to the grip) behind the coat
  const E2 = bmJoint(S, G, .3, .31, 0, -1); bmLine([S, E2, G], .1, bmShade(c.coat[1], .75));
  // the coat: fur breaks the edge into tufts, light from the left
  const coat = [[S[0] - .17, S[1] + .03], [S[0] + .12, S[1] + .03], [S[0] + .17, S[1] - .25], [H0[0] + .3, H0[1] - .1], [H0[0] + .24, H0[1] - .36], [H0[0] - .34, H0[1] - .44], [H0[0] - .27, H0[1] + .06]];
  bmPath(c.fur && det ? bmFur(coat, .035, c.seed) : coat); g.closePath(); g.fillStyle = bmLG(lx * .45 + S[0], 0, -lx * .35 + S[0], 0, [c.coat[0], c.coat[0], c.coat[1]]); g.fill();
  if (det && c.spots) { for (let i = 0; i < 9; i++) bmOval(H0[0] - .2 + rnd(c.seed, i, 1) * .4, H0[1] - .3 + rnd(c.seed, i, 2) * .75, .035, .025, 'rgba(40,24,14,.7)'); }
  if (det && c.fur) { g.strokeStyle = 'rgba(255,250,240,.25)'; g.lineWidth = bmW(.012); g.beginPath(); for (let i = 0; i < 8; i++) { const fx = H0[0] - .25 + i * .07; g.moveTo(fx, -(H0[1] - .3)); g.lineTo(fx + .03, -(H0[1] + .2)); } g.stroke(); }
  bmOval(S[0] - .02, S[1] - .01, .18, .075, c.fur ? c.trim : bmShade(c.coat[1], .8));
  // near arm: to the grip, or up holding a parasol
  if (c.para) { const Hn = [S[0] + .14, S[1] + .32], E1 = bmJoint(S, Hn, .3, .3, 1, -.5); bmLine([S, E1, Hn], .1, c.coat[0]); bmDot(Hn[0], Hn[1], .045, c.skin); }
  else { const E1 = bmJoint(S, G, .3, .31, 0, -1); bmLine([S, E1, G], .1, c.coat[0]); bmDot(G[0], G[1], .045, c.skin); }
  // head: goggles, a hat
  bmLine([[S[0] + .02, S[1]], [HD[0], HD[1] - .05]], .07, c.skin);
  bmOval(HD[0], HD[1], .11, .125, bmLG(HD[0] + lx * .1, HD[1] + .1, HD[0] - lx * .12, HD[1] - .1, ['#fff3e0', c.skin, bmShade(c.skin, .7)]));
  if (c.hat === 'top') { bmFill([[HD[0] - .1, HD[1] + .08], [HD[0] + .1, HD[1] + .08], [HD[0] + .11, HD[1] + .38], [HD[0] - .09, HD[1] + .38]], '#1c1a1e'); bmFill([[HD[0] - .1, HD[1] + .1], [HD[0] + .1, HD[1] + .1], [HD[0] + .1, HD[1] + .15], [HD[0] - .1, HD[1] + .15]], c.coat[0]); bmOval(HD[0], HD[1] + .08, .19, .03, '#1c1a1e'); }
  else if (c.hat === 'fluff') { bmPath(bmFur([[HD[0] - .16, HD[1] + .02], [HD[0] - .1, HD[1] + .22], [HD[0] + .12, HD[1] + .22], [HD[0] + .17, HD[1] + .02]], .03, c.seed + 3)); g.closePath(); g.fillStyle = c.trim; g.fill(); }
  else if (c.hat === 'sun') { bmOval(HD[0], HD[1] + .09, .3, .045, '#e2c88a'); bmFill([[HD[0] - .1, HD[1] + .09], [HD[0] + .1, HD[1] + .09], [HD[0] + .08, HD[1] + .22], [HD[0] - .08, HD[1] + .22]], '#d4b670'); bmFill([[HD[0] - .1, HD[1] + .1], [HD[0] + .1, HD[1] + .1], [HD[0] + .1, HD[1] + .14], [HD[0] - .1, HD[1] + .14]], c.coat[0]); }
  else if (c.hat === 'bopper') { for (const s2 of [-1, 1]) { const tip = [HD[0] + s2 * .1 + Math.sin(t * 6 + s2) * .03, HD[1] + .4]; bmLine([[HD[0] + s2 * .05, HD[1] + .1], tip], .015, '#2a2420'); bmDot(tip[0], tip[1], .05, c.lens); } }
  bmLine([[HD[0] - .11, HD[1] + .01], [HD[0] + .1, HD[1] + .02]], .035, '#2a2420'); bmDot(HD[0] + .075, HD[1] + .02, .05, bmLG(HD[0] + .03, HD[1] + .07, HD[0] + .12, HD[1] - .03, ['#ffffff', c.lens, bmShade(c.lens, .5)])); if (det) bmDot(HD[0] + .06, HD[1] + .04, .013, 'rgba(255,255,255,.9)');
  if (c.bike === 'snail') for (const s2 of [0, .08]) { const tip = [G[0] + .12 + s2, G[1] + .42]; bmLine([[G[0] + .02, G[1] + .03], tip], .02, '#8a5a2a'); bmDot(tip[0], tip[1], .04, '#e8d4b4'); }
  if (c.para) bmParasol(S[0] + .14, S[1] + .32, c, t, det);
  g.restore();
}
function bmRiderShadow(X, Z, c, t) { const top = 1.95 + (c.bike === 'tall' ? 1 : 0); shadowOf([[X - .9, 0, Z], [X + .9, 0, Z], [X - .35, top, Z], [X + .3, top, Z]], t); if (c.flag) shadowStick(X - .66, 0, c.flag.h, Z, .06, t); if (c.para) shadowOf([[X - .7, top + .9, Z], [X + .9, top + .9, Z], [X, top + 1.3, Z]], t); }
function bmRiderEntry(X, Z, d, sp, t, c, list, fadeNear) {
  const p = P(X, 0, Z); if (p[2] < 1.2 || p[0] < -400 || p[0] > W + 400) return; const a = fadeNear === false ? 1 : bmFade(p); if (a <= 0) return;
  list.push({ z: p[2], draw: () => { const q = P(X, 0, Z); bmRider(q[0], q[1], kAt(q), d, sp, t, c, a); }, shadow: () => bmRiderShadow(X, Z, c, t) });
}
// traffic: riders crossing all day on lanes behind the car (and two in front), wrapped relative to the car far off-screen
const BM_LANES = [8, 11.5, 15, 19, 23.5, 28, 33, 39, -19, -24];
const BM_BIKES = [...Array(22)].map((_, i) => { const R = mulberry(4000 + i * 17), v = (R() < .5 ? -1 : 1) * (2.3 + R() * 2.4); return { Z: BM_LANES[i % BM_LANES.length] + R() * 2, v, off: R() * 240, c: bmCostume(500 + i * 31), i }; });
function bmTraffic(t, list) {
  const cx = carX(clamp(t, 14, 238)), quiet = (t > 84 && t < 99) || (t > 127 && t < 135.5) || (t > 155.5 && t < 171); // keep the foreground clear for the poor person and the cops
  for (const b of BM_BIKES) { if (b.Z < 0 && (quiet || t > 200)) continue; if (t > 205 && b.i % 2) continue;
    const rel = ((((b.v * t + b.off) % 240) + 240) % 240) - 120, vw = b.v + (t > 14 && t < 200 ? 1.6 : 0); bmRiderEntry(cx + rel, b.Z, Math.sign(vw) || 1, Math.abs(vw) * t, t, b.c, list); }
}
// a costumed flock crossing in front of the camera in the first instrumental (it replaces draft 2's foreground block)
const BM_FLOCK = [...Array(8)].map((_, i) => ({ dx: -i * 2.6 - (i % 2) * .9, dz: (i % 3) * 1.6, c: bmCostume(9100 + i * 7, { bike: ['tall', 'tall', 'fish', 'tall', 'clock', 'tall', 'snail', 'tall'][i], para: i % 2 ? null : BM_PARAS[i % 6], flag: i % 2 ? { h: 4 + (i % 3) * .5, col: ['#e8b23a', '#d8452f', '#2f6fb5', '#f6efe0'][i % 4], col2: '#1c1a1e' } : null }) }));
function bmFlockInto(t, list) { const s = 63.5, e = 75; if (t < s || t > e) return; const cx = carX(t);
  for (const f of BM_FLOCK) { const X = cx - 26 + (t - s) * 3.6 + f.dx, Z = 7 + f.dz; bmRiderEntry(X, Z, 1, (1.6 + 3.6) * t, t, f.c, list); } }

// ---------- art cars ----------
function bmSitter(x, y, col, hat, t, ph, wave) { // a small passenger on an art car's roof
  bmFill([[x - .17, y], [x + .17, y], [x + .14, y + .5], [x - .14, y + .5]], col); bmDot(x, y + .64, .12, '#e8cfae');
  if (hat) bmFill([[x - .1, y + .72], [x + .1, y + .72], [x + .09, y + .92], [x - .09, y + .92]], hat);
  if (wave) { const a = Math.sin(t * 5 + ph) * .4; bmLine([[x + .12, y + .45], [x + .3 + Math.sin(a) * .1, y + .8 + Math.cos(a) * .1]], .07, col); }
}
function bmCarWheels(xs, r, ang, det) { for (const x of xs) bmWheel(x, r, r, ang, det, '#7a6a58'); }
function bmArtCar(kind, x, y, k, d, t, sp, seed, sc) {
  bmBegin(x, y, k * (sc || 1), d); const det = k > 6, lx = -d, ang = -sp / .5;
  if (kind === 'drawers') { // a chest of drawers on cabriole legs; its drawers slide in and out, papers spill, a crutch props one open
    bmCarWheels([-2.5, 2.5], .34, ang, det);
    for (const lgx of [-2.7, 2.7]) bmLine([[lgx, 1.0], [lgx + .3 * Math.sign(lgx), .62], [lgx, .4]], .26, '#5a3418');
    bmFill([[-3, .95], [3, .95], [3, 4.05], [-3, 4.05]], bmLG(lx * 3, 0, -lx * 3, 0, ['#a5713f', '#7b5530', '#56381c']));
    bmFill([[-3.25, 4.0], [3.25, 4.0], [3.1, 4.3], [-3.1, 4.3]], '#8c6338');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const i = r * 2 + c, x0 = -2.8 + c * 2.85, y0 = 1.15 + r * 0.95, o = Math.pow(Math.max(0, Math.sin(t * .9 + i * 1.7 + seed)), 3) * .35 + (i === 4 ? .3 : 0);
      bmFill([[x0, y0], [x0 + 2.75, y0], [x0 + 2.75, y0 + .8], [x0, y0 + .8]], '#2a1608');
      bmFill([[x0 + o * .3, y0 - o], [x0 + 2.75 + o * .3, y0 - o], [x0 + 2.75 + o * .3, y0 + .8 - o * .6], [x0 + o * .3, y0 + .8 - o * .6]], bmLG(x0, y0 + .8, x0, y0 - o, ['#b07c48', '#7e5730']));
      bmDot(x0 + 1.37 + o * .3, y0 + .4 - o * .8, .09, '#d9b45a');
      if (o > .25 && det) for (let q = 0; q < 3; q++) { const u = (t * .7 + q * .33 + i * .1) % 1, px = x0 + 1 + q * .4 - u * 1.4, py = y0 + .8 + u * 2.2; g.save(); g.translate(px, -py); g.rotate(t * 3 + q); g.fillStyle = '#ece6d6'; g.fillRect(-.22, -.15, .44, .3); g.restore(); } }
    bmCrutch([-3.9, 0], [-2.6, 2.95], .07);
    bmSitter(-1.7, 4.3, '#e0533a', '#1c1a1e', t, 1, true); bmSitter(1.4, 4.3, '#47c1ba', null, t, 2, false); bmParasol(1.6, 4.9, { para: BM_PARAS[2], seed: 7 }, t, det);
    bmLine([[2.9, 4.3], [2.95, 7.6]], .05, '#3a3028'); bmFill([[2.95, 7.6], [1.6, 7.45 + Math.sin(t * 5) * .1], [2.95, 7.1]], '#e8b23a');
  } else if (kind === 'phone') { // a rotary telephone on wheels with a giant lobster lying across its cradle
    bmCarWheels([-2.1, 2.1], .32, ang, det);
    bmPath([[-2.8, .55], [2.8, .55], [2.35, 1.9], [1.7, 2.45], [-1.7, 2.45], [-2.35, 1.9]]); g.closePath(); g.fillStyle = bmLG(lx * 2, 2.4, -lx * 2.4, .6, ['#4a4a52', '#1d1d22', '#0c0c0e']); g.fill();
    bmLine([[-1.8, 2.2], [-.4, 2.38]], .06, 'rgba(255,255,255,.25)');
    const dr = .78, dc = [.25, 1.35]; bmDot(dc[0], dc[1], dr, '#efe6d0'); for (let i = 0; i < 10; i++) { const a = t * .5 + i / 10 * 5.2 + 1; bmDot(dc[0] + Math.cos(a) * dr * .7, dc[1] + Math.sin(a) * dr * .7, .12, '#24242a'); } bmDot(dc[0], dc[1], .3, '#c7362b');
    for (const cx2 of [-1.45, 1.45]) { bmLine([[cx2, 2.4], [cx2, 2.8]], .14, '#1d1d22'); bmLine([[cx2 - .2, 2.85], [cx2 + .2, 2.85]], .1, '#1d1d22'); }
    g.strokeStyle = '#1d1d22'; g.lineWidth = bmW(.05); g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, px = lerp(-2.6, -3.2, u) + Math.cos(u * 30) * .15, py = lerp(1.2, 2.9, u) + Math.sin(u * 30) * .1; i ? g.lineTo(px, -py) : g.moveTo(px, -py); } g.stroke();
    const red = bmLG(0, 3.4, 0, 2.5, ['#f0703c', '#d23a1e', '#8a1e0e']);
    for (let i = 0; i < 6; i++) bmOval(-2.6 + i * .42, 3.0 + Math.sin(i * .6) * .05, .34 - i * .015, .3 - i * .01, red);
    bmFill([[-2.9, 3.0], [-3.55, 3.5], [-3.7, 3.0], [-3.55, 2.5]], '#c7362b');
    bmOval(.7, 3.05, 1.15, .45, red); bmOval(1.85, 3.0, .38, .3, red); bmDot(2.05, 3.18, .06, '#1c1614');
    for (const s2 of [0, 1]) { const ax = Math.sin(t * 1.3 + s2) * .25; g.strokeStyle = '#a8301a'; g.lineWidth = bmW(.04); g.beginPath(); g.moveTo(2.15, -3.15); g.quadraticCurveTo(3.4, -(4.4 + s2 * .3), 3.6 + ax, -(5.4 - s2 * .6)); g.stroke(); }
    for (const [ox, oy, sc] of [[1.9, 1.95, 1], [1.2, 1.75, .85]]) { bmLine([[1.4, 2.75], [ox, oy + .5]], .17 * sc, '#c13a20'); const op = .2 + .2 * Math.max(0, Math.sin(t * 2 + ox)); bmOval(ox + .1, oy + .25, .42 * sc, .3 * sc, red, .4); bmFill([[ox + .35, oy + .35], [ox + .95 * sc, oy + .2 + op], [ox + .5, oy + .05]], '#d23a1e'); bmFill([[ox + .35, oy + .1], [ox + .95 * sc, oy - op * .5], [ox + .5, oy + .3]], '#b02a14'); }
    if (det) for (let i = 0; i < 4; i++) bmLine([[.2 + i * .35, 2.7], [.1 + i * .35 + Math.sin(t * 6 + i) * .05, 2.45]], .04, '#a8301a');
    bmSitter(-1.2, 3.3, '#f6f0e2', '#c7362b', t, 3, true);
  } else if (kind === 'bus') { // a bus going soft: its roof sags and drips, a soft clock on its side, its nose propped on a crutch
    bmCarWheels([-2.7, 2.6], .55, ang, det); const m = .5 + .5 * Math.sin(t * .4 + seed);
    const roof = [[-4.1, 3.0], [-3, 3.42], [-1, 3.36 - m * .1], [1, 3.3 - m * .15], [3, 3.05 - m * .2], [4.05, 2.55 - m * .25]];
    bmPath([[-4.1, .75], [4.3, .75], [4.35, 1.6], ...roof.slice().reverse()]); g.closePath(); g.fillStyle = bmLG(lx * 4, 3.3, -lx * 4, .8, ['#f6c45a', '#e09a2a', '#9a5a14']); g.fill();
    for (let i = 0; i < 9; i++) { const dx = -3.6 + i * .9 + Math.sin(i * 2.1) * .2, top = lerp(3.0, 2.6, (dx + 4) / 8) - .05, L = .3 + .5 * (.5 + .5 * Math.sin(t * .6 + i * 1.9)) * (.4 + .6 * m); bmPath([[dx - .16, top], [dx + .16, top], [dx + .07, top - L], [dx, top - L - .12], [dx - .07, top - L]]); g.closePath(); g.fillStyle = '#e8a83a'; g.fill(); }
    for (let i = 0; i < 6; i++) { const wx = -3.5 + i * 1.05, wy = 1.95; bmFill([[wx, wy], [wx + .85, wy], [wx + .85, wy + .62 - i * .03], [wx, wy + .62 - i * .03]], '#3b4a5e'); if (i % 2 === 0) { bmDot(wx + .42, wy + .32, .14, '#e8cfae'); bmFill([[wx + .3, wy + .1], [wx + .55, wy + .1], [wx + .55, wy + .2], [wx + .3, wy + .2]], '#1c1a1e'); } }
    bmFill([[3.0, 1.9], [3.95, 1.9], [4.05, 2.45 - m * .2], [3.0, 2.6]], '#4a5a70');
    const cc = [-.6, 1.25]; bmPath([]); g.beginPath(); for (let i = 0; i <= 36; i++) { const a = i / 36 * TAU, sag = Math.max(0, -Math.sin(a)) * (.25 + .35 * m); const px = cc[0] + Math.cos(a) * .85, py = cc[1] + Math.sin(a) * .5 - sag; i ? g.lineTo(px, -py) : g.moveTo(px, -py); } g.closePath(); g.fillStyle = '#f2e6c0'; g.fill(); g.strokeStyle = '#a07a2a'; g.lineWidth = bmW(.06); g.stroke();
    for (const [L, s2, wd] of [[.32, .25, .06], [.5, 3, .035]]) { const a = -t * s2; bmLine([cc, [cc[0] + Math.cos(a) * L, cc[1] + Math.sin(a) * L * .6]], wd, '#2a1a10'); }
    bmCrutch([5.0, 0], [4.25, 1.05], .07);
    bmSitter(-2.4, 3.36, '#9a68dc', null, t, 4, true); bmSitter(-.8, 3.32, '#f4b0cf', '#1c1a1e', t, 5, false); bmSitter(.9, 3.25, '#e3cb82', null, t, 6, true);
    bmLine([[-3.6, 3.2], [-3.7, 6.6]], .05, '#3a3028'); bmFill([[-3.7, 6.6], [-5.2, 6.4 + Math.sin(t * 5 + 2) * .1], [-3.7, 6.05]], '#2f6fb5');
  } else if (kind === 'swan') { // a swan whose head is an elephant's, gliding on a painted lake skirt
    const by = .55, bc = bmLG(lx * 3, 3, -lx * 3, .6, ['#fffaf0', '#e4ddcf', '#a9a294']);
    bmPath([[-3.4, by + 2.1], [-2.6, by + .7], [-1, by + .25], [1.5, by + .3], [2.8, by + .9], [3.1, by + 1.6], [2.4, by + 1.85], [.5, by + 1.7], [-1.6, by + 1.9]]); g.closePath(); g.fillStyle = bc; g.fill();
    const wf = Math.sin(t * 1.6 + seed) * .25; bmPath([[-2.1, by + 1.8], [-1.6, by + 3.3 + wf], [-.6, by + 3.9 + wf], [.6, by + 3.4 + wf * .6], [1.4, by + 1.9]]); g.closePath(); g.fillStyle = bmLG(0, by + 3.9, 0, by + 1.8, ['#fbf6ec', '#d9d0c0']); g.fill();
    if (det) { g.strokeStyle = 'rgba(120,110,95,.5)'; g.lineWidth = bmW(.04); for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-1.7 + i * .55, -(by + 2.0)); g.quadraticCurveTo(-1.5 + i * .5, -(by + 2.9 + wf), -1.2 + i * .45, -(by + 3.5 + wf * .8)); g.stroke(); } }
    g.strokeStyle = '#efe8da'; g.lineCap = 'round'; for (const [wd, a0] of [[.62, 0], [.45, .45]]) { g.lineWidth = bmW(wd); g.beginPath(); const pts = [[2.5, by + 1.6], [3.4, by + 2.8], [2.7, by + 4.0], [3.1, by + 5.0]]; const q = (u) => { const a = 1 - u; return [a * a * a * pts[0][0] + 3 * a * a * u * pts[1][0] + 3 * a * u * u * pts[2][0] + u * u * u * pts[3][0], a * a * a * pts[0][1] + 3 * a * a * u * pts[1][1] + 3 * a * u * u * pts[2][1] + u * u * u * pts[3][1]]; }; for (let i = 0; i <= 12; i++) { const pt = q(a0 + (1 - a0) * i / 12); i ? g.lineTo(pt[0], -pt[1]) : g.moveTo(pt[0], -pt[1]); } g.stroke(); }
    const hc = [3.3, by + 5.3]; bmDot(hc[0], hc[1], .62, bmLG(hc[0] + lx * .5, hc[1] + .5, hc[0] - lx * .5, hc[1] - .5, [PAL.elephantLit, PAL.elephant])); bmOval(hc[0] - .35, hc[1] - .05, .45, .62, bmShade(PAL.elephant, .82), -.2 + Math.sin(t * 2) * .1); bmDot(hc[0] + .28, hc[1] + .2, .06, '#1c1614');
    g.strokeStyle = PAL.elephant; g.lineWidth = bmW(.24); g.beginPath(); g.moveTo(hc[0] + .45, -(hc[1] - .2)); g.quadraticCurveTo(hc[0] + 1.3, -(hc[1] - .6), hc[0] + 1.1 + Math.sin(t * 1.5) * .15, -(hc[1] - 1.6)); g.stroke(); bmLine([[hc[0] + .35, hc[1] - .35], [hc[0] + .75, hc[1] - .5]], .07, '#efe6d0');
    bmFill([[-.9, by + 1.7], [.7, by + 1.7], [.6, by + 2.4], [-.8, by + 2.4]], '#c7362b'); bmLine([[-.85, by + 2.4], [-.85, by + 3.1]], .05, '#d9b45a'); bmLine([[.65, by + 2.4], [.65, by + 3.1]], .05, '#d9b45a'); bmPath([[-1.05, by + 3.05], [.85, by + 3.05], [-.1, by + 3.6]]); g.closePath(); g.fillStyle = '#d9b45a'; g.fill();
    bmSitter(-.45, by + 2.4, '#47c1ba', null, t, 8, true); bmSitter(.25, by + 2.4, '#e0533a', '#1c1a1e', t, 9, false);
    bmPath([[-3.6, 0]]); g.beginPath(); g.moveTo(-3.7, 0); for (let i = 0; i <= 24; i++) { const u = i / 24, px = -3.7 + u * 7.4; g.lineTo(px, -(.65 + Math.sin(u * 14 - t * 3 + seed) * .07)); } g.lineTo(3.7, 0); g.closePath(); g.fillStyle = bmLG(0, .7, 0, 0, ['#8fb8d8', '#3f6f9a', '#2a4f74']); g.fill();
    if (det) { g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = bmW(.03); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-3 + i * 1.7, -.35); g.lineTo(-2.4 + i * 1.7, -.35); g.stroke(); } }
  }
  g.restore();
}
const BM_CAR_SIZE = { drawers: [4.2, 7.8], phone: [3.8, 5.5], bus: [5.2, 6.8], swan: [4.6, 6] }; // half length, height
// the parades: one per instrumental, each car on a lane behind the table, entering and leaving off-screen.
// [kind, lane Z, enter time, offset from the car at entry, speed relative to the car, leave time]
const BM_PARADE = [
  ['drawers', 15, 59.4, 36, -4.4, 75.5, 1.6], ['phone', 19, 61.6, 38, -4.4, 77, 1.7], ['bus', 14, 63.8, 40, -4.4, 79, 1.5],
  ['swan', 15, 116.9, -34, 6.2, 126.5, 1.3], ['drawers', 20, 117.6, -42, 6.2, 127, 1.2], ['bus', 24, 118.3, -48, 6.2, 128, 1.2],
];
function bmParadeInto(t, list) {
  BM_PARADE.forEach(([kind, Z, t0, r0, vr, t1, sc], i) => { if (t < t0 || t > t1) return; const X = carX(t) + r0 + vr * (t - t0), vw = 1.6 + vr, p = P(X, 0, Z), sz = BM_CAR_SIZE[kind].map((v) => v * sc); if (p[2] < 2) return; const k = kAt(p); if (p[0] < -sz[0] * k * 1.5 - 300 || p[0] > W + sz[0] * k * 1.5 + 300) return;
    const d = Math.sign(vw) || 1, a = bmFade(p);
    list.push({ z: p[2], draw: () => { g.save(); g.globalAlpha = a; bmArtCar(kind, p[0], p[1], k, d, t, Math.abs(vw) * t / sc, i, sc); g.restore(); }, shadow: () => shadowOf([[X - sz[0], 0, Z], [X + sz[0], 0, Z], [X - sz[0] * .8, sz[1] * .6, Z], [X + sz[0] * .8, sz[1] * .55, Z]], t) }); });
}

// ---------- the poor person (129.54 "poor", 131.32 "share", 132.32 "unfair") ----------
// on foot, a bowl held out: she walks up to the end of the table, holds the bowl up to the end seat and walks
// with the table; on "unfair" she stops, the board rolls on, and her bowl turns over: empty.
function bmPoorInto(t, list) {
  const poor = wt(17, 'poor'), share = wt(17, 'share'), unfair = wt(18, 'unfair'), s = L_(16).s - .6, e = L_(19).s + 1.6; if (t < s || t > e) return;
  const stop = unfair + .15, tt = Math.min(t, stop), rel = lerp(11, 6.15, ease(tt, s, poor - .05)), X = carX(tt) + rel, Z = -3.0;
  const walking = t < poor ? 1 : t < stop ? .55 : 0, phase = t * 5.2, ask = ease(t, poor - .3, poor + .25), more = ease(t, share - .2, share + .3), drop = ease(t, unfair + .35, unfair + 1.5), tip = ease(t, unfair - .05, unfair + .45), turn = t > stop + .5 ? 1 : -1;
  const p = P(X, 0, Z); if (p[2] < 1.5) return;
  list.push({ z: p[2], draw: () => { const q = P(X, 0, Z), k = kAt(q); bmBegin(q[0], q[1], k, turn); const lx = -turn, det = k > 14;
    const st = Math.sin(phase) * .2 * walking, coat = '#7d6248', coatD = '#4e3c2c';
    for (const [sgn, col] of [[-1, '#3a2e26'], [1, '#55453a']]) { const hip = [0, .88], foot = [sgn * st + .02, .02], kn = bmJoint(hip, foot, .45, .45, 1, 0); bmLine([hip, kn, foot], .12, col); bmOval(foot[0] + .06, .04, .1, .045, '#2a201a'); }
    bmPath([[-.2, 1.42], [.16, 1.42], [.25, .92], [.3, .5], [.05, .46], [-.15, .52], [-.32, .5], [-.27, .95]]); g.closePath(); g.fillStyle = bmLG(lx * .35, 0, -lx * .35, 0, [coat, coatD]); g.fill();
    if (det) { bmFill([[-.15, .7], [.02, .7], [.02, .86], [-.15, .86]], '#9a8462'); bmFill([[.08, 1.05], [.2, 1.05], [.2, 1.16], [.08, 1.16]], '#5e5a48'); g.strokeStyle = 'rgba(30,20,10,.5)'; g.lineWidth = bmW(.012); g.setLineDash([.025, .02]); g.strokeRect(-.15, -.86, .17, .16); g.setLineDash([]); }
    bmFill([[-.24, 1.45], [.2, 1.45], [.26, 1.1], [-.3, 1.05]], '#8a3a2c'); // a shawl
    const sh = [.08, 1.36], hand = [lerp(.3, .5, ask) + more * .08 - drop * .25, lerp(1.0, 1.42, ask) + more * .2 - drop * .45], el = bmJoint(sh, hand, .3, .3, .2, -1);
    bmLine([[-.12, 1.36], [-.08, 1.1], [.06, 1.06]], .09, coatD); bmLine([sh, el, hand], .095, coat); bmDot(hand[0], hand[1], .045, '#c99a72');
    g.save(); g.translate(hand[0] + .1, -(hand[1] + .03)); g.rotate(tip * 2.6); g.beginPath(); g.ellipse(0, 0, .25, .1, 0, 0, Math.PI); g.closePath(); g.fillStyle = '#8a5a2c'; g.fill(); g.beginPath(); g.ellipse(0, 0, .25, .05, 0, 0, TAU); g.fillStyle = '#4a2c14'; g.fill(); g.restore();
    bmLine([[.02, 1.45], [.04, 1.52]], .07, '#c99a72'); bmOval(.05, 1.64, .1, .12, bmLG(.05 + lx * .1, 1.75, .05 - lx * .1, 1.55, ['#e2b88e', '#9a6a46']));
    bmPath([[-.08, 1.62], [-.02, 1.8], [.14, 1.78], [.16, 1.66], [.05, 1.74], [-.02, 1.55], [-.12, 1.42]]); g.closePath(); g.fillStyle = '#a04a3a'; g.fill(); // headscarf
    g.restore(); }, shadow: () => shadowOf([[X - .3, 0, Z], [X + .3, 0, Z], [X - .15, 1.75, Z], [X + .2, 1.75, Z]], t) });
}

// ---------- the cops: giant chess pawns in riot helmets (155.94 on, "cop" 158.3, "paid" 159.38) ----------
// they drop onto the playa one by one behind the table, shields facing us, then keep pace like an escort. On "paid"
// each puts out a gloved palm over the board and coins arc up from the table and stack in it.
function bmPawn(x, y, k, t, i, palm, coins, sq, flip) { // front view, 3.4 m tall; flip turns it onto its helmet
  bmBegin(x, y, k, 1); const s = 1.36, det = k > 5, blk = bmLG(-.6 * s, 0, .6 * s, 0, ['#55555f', '#1c1c22', '#08080a']);
  g.scale(1 + sq * .12, 1 - sq * .12); if (flip > 0) { const hp = 1.18 * s; g.translate(0, -hp); g.rotate(Math.PI * flip); g.translate(0, hp); }
  bmPath([[-.62 * s, 0], [.62 * s, 0], [.56 * s, .16 * s], [.42 * s, .24 * s], [.46 * s, .34 * s], [.26 * s, .4 * s], [.18 * s, 1.42 * s], [.32 * s, 1.5 * s], [.24 * s, 1.58 * s], [-.24 * s, 1.58 * s], [-.32 * s, 1.5 * s], [-.18 * s, 1.42 * s], [-.26 * s, .4 * s], [-.46 * s, .34 * s], [-.42 * s, .24 * s], [-.56 * s, .16 * s]]); g.closePath(); g.fillStyle = blk; g.fill();
  if (det) bmLine([[-.12 * s, .5 * s], [-.08 * s, 1.35 * s]], .04 * s, 'rgba(255,255,255,.18)');
  bmDot(0, 1.9 * s, .34 * s, blk);
  // riot helmet: a navy dome with a ridge, a clear face shield down over the ball, a neck guard; no insignia
  bmPath([[-.42 * s, 1.82 * s], [-.4 * s, 2.06 * s], [-.22 * s, 2.28 * s], [.22 * s, 2.28 * s], [.4 * s, 2.06 * s], [.42 * s, 1.82 * s]]); g.closePath(); g.fillStyle = bmLG(-.3 * s, 2.28 * s, .4 * s, 1.85 * s, ['#5a6886', '#25304a', '#121828']); g.fill();
  bmLine([[0, 2.28 * s], [0, 2.05 * s]], .05 * s, '#3a4664'); bmFill([[-.46 * s, 1.84 * s], [-.36 * s, 1.84 * s], [-.36 * s, 1.56 * s], [-.48 * s, 1.6 * s]], '#141a26'); bmFill([[.46 * s, 1.84 * s], [.36 * s, 1.84 * s], [.36 * s, 1.56 * s], [.48 * s, 1.6 * s]], '#141a26');
  bmPath([[-.37 * s, 2.0 * s], [.37 * s, 2.0 * s], [.35 * s, 1.68 * s], [.18 * s, 1.58 * s], [-.18 * s, 1.58 * s], [-.35 * s, 1.68 * s]]); g.closePath(); g.fillStyle = 'rgba(165,195,225,.5)'; g.fill(); g.strokeStyle = '#dfe8f2'; g.lineWidth = bmW(.045 * s); g.stroke();
  bmLine([[-.4 * s, 2.02 * s], [.4 * s, 2.02 * s]], .07 * s, '#0e121c'); if (det) { bmLine([[-.26 * s, 1.92 * s], [.02 * s, 1.94 * s]], .03 * s, 'rgba(255,255,255,.75)'); bmDot(-.41 * s, 1.98 * s, .045 * s, '#9aa6bc'); bmDot(.41 * s, 1.98 * s, .045 * s, '#9aa6bc'); }
  // free arm: a baton at rest, then a palm out over the board on "paid", coins stacking in it
  const sh = [-.25 * s, 1.3 * s];
  if (palm > 0) { const hand = [lerp(-.35, -1.05, palm) * s, lerp(1.0, 1.55, palm) * s], el = bmJoint(sh, hand, .45 * s, .45 * s, -.3, -1);
    bmLine([sh, el, hand], .13 * s, '#1a1a20'); bmOval(hand[0], hand[1], .15 * s, .06 * s, '#2a2a30');
    for (let j = 0; j < coins; j++) { const cy = hand[1] + (.04 + j * .08) * s; bmFill([[hand[0] - .14 * s, cy], [hand[0] + .14 * s, cy], [hand[0] + .14 * s, cy + .07 * s], [hand[0] - .14 * s, cy + .07 * s]], '#a87a1a'); bmOval(hand[0], cy + .07 * s, .14 * s, .045 * s, '#f6d050'); } }
  else { const hand = [-.62 * s, .75 * s]; bmLine([sh, [-.55 * s, 1.0 * s], hand], .13 * s, '#1a1a20'); bmLine([[hand[0], hand[1] + .05 * s], [hand[0] - .1 * s, hand[1] - .6 * s]], .07 * s, '#0a0a0c'); }
  // riot shield: a smoked rectangle with a pale rim and a grip bar, held low across the body
  const sx0 = -.5 * s, sx1 = .5 * s, sy0 = .22 * s, sy1 = 1.36 * s; bmPath([[sx0, sy0], [sx1, sy0], [sx1, sy1 - .1 * s], [sx1 - .08 * s, sy1], [sx0 + .08 * s, sy1], [sx0, sy1 - .1 * s]]); g.closePath();
  g.fillStyle = 'rgba(46,58,80,.8)'; g.fill(); g.strokeStyle = '#c9d4e0'; g.lineWidth = bmW(.07 * s); g.stroke();
  if (det) { bmFill([[sx0 + .08 * s, 1.04 * s], [sx1 - .08 * s, 1.04 * s], [sx1 - .08 * s, 1.16 * s], [sx0 + .08 * s, 1.16 * s]], 'rgba(150,175,205,.55)'); bmLine([[sx0 + .14 * s, 1.26 * s], [sx0 + .28 * s, .34 * s]], .05 * s, 'rgba(255,255,255,.3)'); bmDot(sx1 - .02 * s, .8 * s, .08 * s, '#1a1a20'); }
  g.restore();
}
function bmCopsInto(t, list) {
  const s = L_(28).s, cop = wt(28, 'cop'), paid = wt(28, 'paid'), end = L_(30).s - .32; if (t < s - .2 || t > end) return; const n = 7;
  for (let i = 0; i < n; i++) { const land = s + .3 + i * ((cop - .2 - s - .3) / (n - 1)), dt = t - land; if (dt < -.55) continue;
    const Y = dt < 0 ? 9 * (dt / .55) * (dt / .55) : 0, sq = dt >= 0 ? Math.max(0, Math.sin(clamp(dt / .35) * Math.PI)) * (1 - clamp(dt / .35)) * 2 : 0;
    const rel = -6.3 + i * 2.1, Z = 7 + (i % 2) * .6, fl = ease(t, wt(29, 'perverse') - .05 + i * .06, wt(29, 'perverse') + .45 + i * .06) * (1 - ease(t, L_(30).s - .4, L_(30).s + .2)), X = carX(t) + rel, palm = ease(t, paid - .6 + i * .05, paid - .1 + i * .05);
    const coinT = (j) => paid + .1 + i * .07 + j * .26, nLanded = [0, 1, 2, 3, 4].filter((j) => t > coinT(j) + .55).length;
    list.push({ z: P(X, 0, Z)[2], draw: () => { const q = P(X, Y, Z), k = kAt(q); if (q[2] < 1) return; bmPawn(q[0], q[1], k, t, i, palm, nLanded, sq, fl);
        if (sq > 0 && Y === 0) { const pg = P(X, 0, Z), kg = kAt(pg); g.fillStyle = `rgba(220,190,140,${.4 * sq})`; g.beginPath(); g.ellipse(pg[0], pg[1], 1.4 * kg * (1 + clamp(dt / .35)), .3 * kg, 0, 0, TAU); g.fill(); }
        // coins in flight: from the table up into the palm
        const s2 = 1.36, hand = [X + lerp(-.35, -1.05, palm) * s2, lerp(1.0, 1.55, palm) * s2 + .1, Z - .05];
        for (let j = 0; j < 5; j++) { const u = clamp((t - coinT(j)) / .55); if (u <= 0 || u >= 1) continue; const a = PL(clamp(rel - .3, -TL + .4, TL - .4), TOP + .1, 1.2), b = P(...hand), kk = kAt(b);
          const cx = lerp(a[0], b[0], u), cy = lerp(a[1], b[1], u) - Math.sin(u * Math.PI) * 1.6 * kk, spin = Math.abs(Math.cos(t * 14 + j + i)); g.fillStyle = '#f0c84a'; g.beginPath(); g.ellipse(cx, cy, Math.max(2.5, .17 * kk * (.35 + .65 * spin)), Math.max(2.5, .17 * kk), 0, 0, TAU); g.fill(); g.strokeStyle = '#a87a1a'; g.lineWidth = Math.max(1, .03 * kk); g.stroke(); } },
      shadow: () => { if (Y < 1) shadowOf([[X - .8, 0, Z], [X + .8, 0, Z], [X - .4, 3.1, Z], [X + .4, 3.1, Z]], t); } }); }
}

// ---------- camps: vary along the road ----------
const BM_KINDS = ['dome', 'tent', 'yurt', 'dome', 'sail', 'chairs', 'drip', 'eye', 'speakers', 'arch', 'flags', 'dome', 'tent', 'yurt'];
const BM_CAMPS = []; { const R = mulberry(78); let last = ''; for (let X = -100; X < 440; X += 11 + R() * 11) { let kind = BM_KINDS[Math.floor(R() * BM_KINDS.length)]; if (kind === last) kind = BM_KINDS[(BM_KINDS.indexOf(kind) + 3) % BM_KINDS.length]; last = kind;
  BM_CAMPS.push({ X, Z: 50 + R() * 38, kind, r: 4 + R() * 4, col: ['#d8452f', '#2f6fb5', '#e8b23a', '#7a3c8c', '#f2ede0', '#3c8c5a'][Math.floor(R() * 6)], col2: ['#f2ede0', '#e8b23a', '#d8452f'][Math.floor(R() * 3)], seed: Math.floor(R() * 1e4) }); } }
// a sparse near ring between the road and the camps, kept clear of the other builders' installations
{ const R = mulberry(91), skip = [[-24, 8], [52, 84], [88, 152], [210, 262]], NEAR = ['parked', 'sail', 'flags', 'umbrella', 'parked', 'chairs', 'speakers'];
  for (let X = -80; X < 420; X += 26 + R() * 22) { if (skip.some(([a, b]) => X > a && X < b)) continue; BM_CAMPS.push({ X, Z: 31 + R() * 8, kind: NEAR[Math.floor(R() * NEAR.length)], r: 2.4 + R() * 1.6, col: ['#d8452f', '#2f6fb5', '#e8b23a', '#7a3c8c', '#3c8c5a'][Math.floor(R() * 5)], col2: '#f2ede0', seed: Math.floor(R() * 1e4) }); } }
function bmCamp(c, t, p) {
  const k = kAt(p), r = c.r; bmBegin(p[0], p[1], k, 1); const det = k > 5;
  if (c.kind === 'dome') { // geodesic: a shaded half disc, triangulated struts, a few fabric panels
    g.beginPath(); g.arc(0, 0, r, Math.PI, TAU); g.closePath(); g.fillStyle = bmLG(-r, r, r, 0, ['#fbf4e4', '#d9cdb6', '#a99c86']); g.fill();
    g.save(); g.clip(); for (let i = 0; i < 3; i++) { const a0 = Math.PI + (.15 + i * .28 + (c.seed % 7) * .02) * Math.PI; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a0, a0 + .16 * Math.PI); g.closePath(); g.fillStyle = i === 1 ? c.col2 : c.col; g.globalAlpha = .6; g.fill(); } g.restore(); g.globalAlpha = 1;
    if (det) { g.strokeStyle = 'rgba(90,70,50,.5)'; g.lineWidth = bmW(.05); const rows = 4; for (let j = 1; j <= rows; j++) { const y0 = Math.sin((j - 1) / rows * Math.PI / 2) * r, y1 = Math.sin(j / rows * Math.PI / 2) * r, w0 = Math.sqrt(Math.max(0, r * r - y0 * y0)), w1 = Math.sqrt(Math.max(0, r * r - y1 * y1)), n = 10 - j * 2;
      g.beginPath(); g.moveTo(-w1, -y1); g.lineTo(w1, -y1); for (let i = 0; i <= n; i++) { const xa = lerp(-w0, w0, i / n), xb = lerp(-w1, w1, (i + .5) / (n + 1)); g.moveTo(xa, -y0); g.lineTo(xb, -y1); if (i < n) { g.lineTo(lerp(-w0, w0, (i + 1) / n), -y0); } } g.stroke(); } }
    bmFill([[-r * .12, 0], [r * .12, 0], [r * .12, r * .32], [-r * .12, r * .32]], 'rgba(40,28,20,.55)');
  } else if (c.kind === 'tent') { const sag = Math.sin(t * .9 + c.seed) * .04 * r; for (const dx of [-1, -.3, .4, 1]) bmLine([[dx * r, 0], [dx * r, .62 * r]], .1, '#6d5a44');
    g.beginPath(); g.moveTo(-r * 1.12, -.62 * r); g.quadraticCurveTo(0, -.46 * r - sag, r * 1.12, -.62 * r); g.lineTo(r * .95, -.8 * r); g.quadraticCurveTo(0, -.64 * r - sag, -r * .95, -.8 * r); g.closePath(); g.fillStyle = c.col; g.fill();
    if (det) for (let i = 0; i < 5; i++) { const x0 = -r + i * r * .45; bmFill([[x0, .62 * r], [x0 + r * .2, .62 * r], [x0 + r * .18, .78 * r], [x0 - .02 * r, .78 * r]], c.col2); }
    bmFill([[-r * .8, 0], [r * .7, 0], [r * .75, .05 * r], [-r * .75, .05 * r]], '#8a3a2c');
  } else if (c.kind === 'yurt') { const w = r * .9, h = r * .55; bmFill([[-w, 0], [w, 0], [w, h], [-w, h]], bmLG(-w, 0, w, 0, ['#f4f1ea', '#c4c4c0'])); bmFill([[-w * 1.05, h], [w * 1.05, h], [0, h + r * .5]], bmLG(-w, 0, w, 0, ['#e8e6e0', '#a8a8a4'])); g.strokeStyle = 'rgba(80,80,80,.4)'; g.lineWidth = bmW(.05); g.beginPath(); for (const dx of [-.5, 0, .5]) { g.moveTo(dx * w, 0); g.lineTo(dx * w, -h); g.lineTo(0, -(h + r * .5)); } g.stroke(); bmFill([[-w * .15, 0], [w * .15, 0], [w * .15, h * .7], [-w * .15, h * .7]], c.col);
  } else if (c.kind === 'sail') { bmCrutch([-r, 0], [-r * .8, r * .9], .1); bmCrutch([r * .9, 0], [r * .7, r * .55], .09); bmCrutch([.1 * r, 0], [.2 * r, r * 1.15], .1); g.beginPath(); g.moveTo(-r * .8, -r * .9); g.quadraticCurveTo(-.2 * r, -r * .62 + Math.sin(t + c.seed) * .05 * r, r * .7, -r * .55); g.quadraticCurveTo(.3 * r, -r * .82, .2 * r, -r * 1.15); g.quadraticCurveTo(-.2 * r, -r * .95, -r * .8, -r * .9); g.fillStyle = c.col; g.fill();
  } else if (c.kind === 'chairs') { // a crooked tower of boardroom chairs
    let cy = 0, cx = 0; for (let i = 0; i < 8; i++) { const lean = Math.sin(i * 1.9 + c.seed) * .25 + Math.sin(t * .5 + c.seed) * .02 * i; g.save(); g.translate(cx, -cy); g.rotate(lean); const s2 = .9 - i * .04, wood = i % 2 ? '#a8743e' : '#8a5a2c';
      bmLine([[-.45 * s2, 0], [-.45 * s2, .55 * s2]], .07, wood); bmLine([[.45 * s2, 0], [.45 * s2, .55 * s2]], .07, wood); bmFill([[-.55 * s2, .55 * s2], [.55 * s2, .55 * s2], [.55 * s2, .65 * s2], [-.55 * s2, .65 * s2]], '#5c3a1c'); bmFill([[-.5 * s2, .65 * s2], [-.38 * s2, .65 * s2], [-.38 * s2, 1.4 * s2], [-.5 * s2, 1.4 * s2]], wood); bmFill([[-.55 * s2, 1.25 * s2], [.1 * s2, 1.25 * s2], [.1 * s2, 1.4 * s2], [-.55 * s2, 1.4 * s2]], wood);
      g.restore(); cx += Math.sin(lean) * .9; cy += 1.0 * s2; }
    bmCrutch([1.6, 0], [cx + .3, cy * .6], .08);
  } else if (c.kind === 'drip') { // a tall candle tower melting at the top, propped
    const h = r * 1.6, w = r * .22; bmFill([[-w, 0], [w, 0], [w * .9, h], [-w * .9, h]], bmLG(-w, 0, w, 0, ['#f6ecd2', '#d8c9a4', '#b4a07a']));
    for (let i = 0; i < 5; i++) { const dx = -w * .8 + i * w * .4, L = (.15 + .3 * rnd(c.seed, i)) * h * (.8 + .2 * Math.sin(t * .4 + i)); bmPath([[dx - w * .12, h], [dx + w * .12, h], [dx + w * .06, h - L], [dx, h - L - w * .15], [dx - w * .06, h - L]]); g.closePath(); g.fillStyle = '#efe2c2'; g.fill(); }
    bmOval(0, h + .25 * w, w * .9, w * .3, '#efe2c2'); bmLine([[0, h + .3 * w], [0, h + .7 * w]], .06, '#2a2420'); bmOval(Math.sin(t * 7) * .03, h + 1.0 * w, w * .16, w * .32, 'rgba(255,190,90,.85)');
    bmCrutch([w * 3.2, 0], [w * 1.0, h * .55], .1);
  } else if (c.kind === 'eye') { // a giant eye on a tripod; it follows the board as it drives by
    const ey = r * 1.25, er = r * .42; bmLine([[-er, 0], [0, ey - er * .6], [er, 0]], .14, '#5a4a3a'); bmLine([[0, 0], [0, ey - er]], .12, '#4a3a2c');
    bmDot(0, ey, er, bmLG(-er * .6, ey + er * .6, er * .6, ey - er * .6, ['#ffffff', '#e8e2d6', '#b8b0a2'])); const look = clamp((carX(t) - c.X) / 40, -1, 1) * er * .45; bmDot(look, ey - er * .05, er * .42, '#2f6fb5'); bmDot(look * 1.08, ey - er * .05, er * .2, '#0e0c10'); bmDot(look - er * .12, ey + er * .1, er * .07, 'rgba(255,255,255,.9)');
    g.strokeStyle = '#3a2a20'; g.lineWidth = bmW(.08); g.beginPath(); g.arc(0, -ey, er * 1.02, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  } else if (c.kind === 'speakers') { // a sound camp: a speaker wall under a striped awning; the cones pump
    const pump = 1 + .08 * Math.max(0, Math.sin(t * TAU * 2)); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const x0 = -r * .7 + i * r * .48, y0 = j * r * .42; bmFill([[x0, y0], [x0 + r * .45, y0], [x0 + r * .45, y0 + r * .4], [x0, y0 + r * .4]], '#1c1a1e'); bmDot(x0 + r * .225, y0 + r * .2, r * .14 * pump, '#3a3640'); bmDot(x0 + r * .225, y0 + r * .2, r * .05, '#5a5662'); }
    for (const dx of [-1, 1]) bmLine([[dx * r, 0], [dx * r, r * 1.1]], .08, '#6d5a44'); for (let i = 0; i < 6; i++) bmFill([[-r + i * r / 3, r * 1.1], [-r + (i + 1) * r / 3, r * 1.1], [-r + (i + 1) * r / 3, r * 1.25], [-r + i * r / 3, r * 1.25]], i % 2 ? c.col : '#f2ede0');
  } else if (c.kind === 'arch') { // a wooden lattice arch strung with lanterns and pennants
    for (const dx of [-1, 1]) bmFill([[dx * r - .2, 0], [dx * r + .2, 0], [dx * r + .2, r * .9], [dx * r - .2, r * .9]], '#8a5a2c'); g.strokeStyle = '#8a5a2c'; g.lineWidth = bmW(.35); g.beginPath(); g.ellipse(0, -r * .9, r, r * .55, 0, Math.PI, TAU); g.stroke();
    if (det) { g.strokeStyle = 'rgba(138,90,44,.7)'; g.lineWidth = bmW(.06); g.beginPath(); for (let i = 1; i < 8; i++) { const a = Math.PI + i / 8 * Math.PI; g.moveTo(Math.cos(a) * r * .75, -r * .9 + Math.sin(a) * r * .4); g.lineTo(Math.cos(a) * r, -r * .9 + Math.sin(a) * r * .55); } g.stroke(); }
    for (let i = 0; i < 7; i++) { const a = Math.PI + (i + .5) / 7 * Math.PI, lxx = Math.cos(a) * r * .85, ly = r * .9 - Math.sin(a) * r * .47 - .4; bmLine([[lxx, ly + .4], [lxx, ly + .1]], .03, '#3a3028'); bmOval(lxx, ly, .2, .28, i % 2 ? c.col : '#e8b23a'); }
  } else if (c.kind === 'flags') { for (let i = 0; i < 4; i++) { const fx = -r * .6 + i * r * .4, h = r * (1.1 + .25 * (i % 2)), wv = Math.sin(t * 2 + i + c.seed) * .15; bmLine([[fx, 0], [fx, h]], .08, '#4a3a2c'); g.beginPath(); g.moveTo(fx, -h); g.quadraticCurveTo(fx + .9 + wv, -h + .3, fx + .6 + wv, -h * .45); g.lineTo(fx, -h * .42); g.closePath(); g.fillStyle = ['#d8452f', '#e8b23a', '#2f6fb5', c.col][i]; g.fill(); }
  } else if (c.kind === 'umbrella') { bmCrutch([.6, 0], [0, r * .9], .08); bmParasol(0, r * .5, { para: [c.col, '#f2ede0'], seed: c.seed % 97 }, t, det);
  } else if (c.kind === 'parked') { for (let i = 0; i < 4; i++) { const bx = -r + i * r * .65; g.save(); g.translate(bx, 0); g.rotate(-.12); bmWheel(-.5, .34, .34, 0, false); bmWheel(.5, .34, .34, 0, false); bmLine([[-.5, .34], [0, .32], [.42, .75], [-.18, .85], [-.5, .34]], .05, ['#c43a2a', '#2f6fb5', '#e8b23a', '#3c8c5a'][(i + c.seed) % 4]); bmLine([[.42, .75], [.5, .34]], .05, '#2a2622'); g.restore(); }
    bmLine([[-r - .6, .7], [r * 1.2, .7]], .06, '#6d5a44');
  }
  if (c.kind === 'dome' || c.kind === 'yurt' || c.kind === 'tent') { const fx = r * .3, top = r * 1.55, wv = (u) => Math.sin(u * 5 - t * 4 + c.seed) * .15; bmLine([[fx, r * .7], [fx, top]], .06, '#5a4a3a');
    const pts = []; for (let i = 0; i <= 6; i++) { const u = i / 6; pts.push([fx + u * 1.6, top - u * .1 + wv(u)]); } for (let i = 6; i >= 0; i--) { const u = i / 6; pts.push([fx + u * 1.6, top - .7 + u * .2 + wv(u)]); } bmFill(pts, ['#d8452f', '#e8b23a', '#2f6fb5'][c.seed % 3]); }
  g.restore();
}
const BM_CAMP_H = { dome: 1.6, tent: .9, yurt: 1.2, sail: 1.2, chairs: 1.5, drip: 1.7, eye: 1.7, speakers: 1.3, arch: 1.5, flags: 1.4, umbrella: 1.3, parked: .3 };
function bmCampsInto(t, list) {
  for (const c of BM_CAMPS) { const p = P(c.X, 0, c.Z); if (p[2] < 2) continue; const k = kAt(p); if (p[0] < -c.r * k * 2 - 400 || p[0] > W + c.r * k * 2 + 400) continue;
    list.push({ z: p[2], draw: () => bmCamp(c, t, p), shadow: () => shadowOf([[c.X - c.r, 0, c.Z], [c.X + c.r, 0, c.Z], [c.X, c.r * (BM_CAMP_H[c.kind] || 1), c.Z]], t) }); }
}

// ---------- installations the car passes, each tied to a line ----------
// "patent": a giant light bulb on crutches switches on; "time": a soft hourglass runs upward;
// "unfair": a seesaw, a chip tower on one end and an empty bowl on the other, slams down; a soft ballot box at dawn.
function bmInstall(kind, t, cue, X, Z, list) {
  const p = P(X, 0, Z); if (p[2] < 2 || p[0] < -900 || p[0] > W + 900) return;
  list.push({ z: p[2], draw: () => { const k = kAt(p); bmBegin(p[0], p[1], k, 1); const det = k > 5;
    if (kind === 'bulb') { const on = ease(t, cue - .1, cue + .25) * (1 - ease(t, cue + 4, cue + 6)) * (.85 + .15 * Math.sin(t * 9)), cy = 4.1, r = 1.5;
      bmCrutch([-2.2, 0], [-1.0, 3.0], .09); bmCrutch([2.1, 0], [1.0, 3.1], .09);
      bmFill([[-.6, 1.6], [.6, 1.6], [.7, 2.7], [-.7, 2.7]], bmLG(-.7, 0, .7, 0, ['#d8d0c0', '#8a8478'])); for (let i = 0; i < 4; i++) bmLine([[-.68, 1.75 + i * .25], [.68, 1.85 + i * .25]], .06, '#6a6458');
      if (on > 0) { const gl = g.createRadialGradient(0, -cy, 0, 0, -cy, r * 3.2); gl.addColorStop(0, `rgba(255,220,140,${.38 * on})`); gl.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gl; g.fillRect(-r * 3.2, -cy - r * 3.2, r * 6.4, r * 6.4); }
      bmPath([[-.7, 2.7], [-1.2, 3.2]]); g.beginPath(); g.moveTo(-.7, -2.7); g.quadraticCurveTo(-1.0, -3.2, -r, -cy); g.arc(0, -cy, r, Math.PI, TAU); g.quadraticCurveTo(1.0, -3.2, .7, -2.7); g.closePath(); g.fillStyle = on > 0 ? `rgba(255,${226 - 20 * (1 - on)},${150 + 60 * (1 - on)},${.55 + .3 * on})` : 'rgba(214,226,232,.55)'; g.fill(); g.strokeStyle = 'rgba(120,130,140,.6)'; g.lineWidth = bmW(.05); g.stroke();
      bmLine([[-.3, 2.8], [-.25, 3.8], [-.1, 4.2], [.1, 3.9], [.25, 4.2], [.3, 3.8], [.3, 2.8]], .05, on > 0 ? '#fff0b0' : '#6a5a40'); if (det) bmLine([[-.9, 4.8], [-.5, 5.3]], .12, 'rgba(255,255,255,.6)');
      const seal = ease(t, cue, cue + .4); if (seal > 0) { g.save(); g.translate(.75, -1.95); g.scale(seal, seal); rosette(0, 0, .28); g.restore(); }
    } else if (kind === 'hourglass') { const run = ease(t, cue - .1, cue + .4), m = .25 + .2 * Math.sin(t * .5), h = 5.4, w = 1.5;
      bmFill([[-w - .2, 0], [w + .2, 0], [w + .2, .35], [-w - .2, .35]], '#6a4426'); bmFill([[-w - .3, h], [w + .1, h - .1 - m * .4], [w + .1, h + .25 - m * .4], [-w - .3, h + .3]], '#6a4426');
      for (const dx of [-w, w]) bmLine([[dx, .35], [dx + (dx > 0 ? -m * .2 : 0), h]], .12, '#8a5a2c');
      g.beginPath(); g.moveTo(-w * .9, -.35); g.quadraticCurveTo(-w * .2, -h * .45, -.12, -h * .5); g.quadraticCurveTo(-w * .2, -h * .55, -w * .9 + m * .2, -(h - .05)); g.lineTo(w * .85 - m * .3, -(h - .1 - m * .4)); g.quadraticCurveTo(w * .2, -h * .55, .12, -h * .5); g.quadraticCurveTo(w * .2, -h * .45, w * .9, -.35); g.closePath(); g.fillStyle = 'rgba(214,226,232,.5)'; g.fill(); g.strokeStyle = 'rgba(120,130,140,.6)'; g.lineWidth = bmW(.05); g.stroke();
      const lo = 1 - run * clamp((t - cue) / 8) * .7, hi = 1 - lo; bmFill([[-w * .8 * lo, .4], [w * .8 * lo, .4], [0, .4 + 1.6 * lo]], '#d9b25a'); bmFill([[-w * .75, h - .2], [w * .75 - m * .3, h - .25 - m * .3], [0, h - .2 - 1.8 * hi]], '#d9b25a');
      if (run > 0) for (let i = 0; i < 9; i++) { const u = ((t * 1.3 + i / 9) % 1); bmDot(Math.sin(i * 3.1) * .04, lerp(h * .48, h - .4, u), .05, '#d9b25a'); }
      bmCrutch([w + 1.4, 0], [w * .6, h * .78], .08);
    } else if (kind === 'seesaw') { const slam = easeOutBack(clamp((t - cue + .05) / .35), 2), wob = Math.sin(t * 3) * .03 * (1 - slam), a = -.05 + wob - slam * .3, L = 4.2;
      bmFill([[-.8, 0], [.8, 0], [0, 1.4]], bmLG(-.8, 0, .8, 0, ['#a5713f', '#56381c']));
      g.save(); g.translate(0, -1.4); g.rotate(-a); bmFill([[-L, -.05], [L, -.05], [L, .18], [-L, .18]], '#8c6338');
      const cols = ['#c7362b', '#f2ede0', '#2f6fb5', '#1c1a1e']; for (let c = 0; c < 3; c++) for (let j = 0; j < 6 + c * 2; j++) { const cx = -L + .5 + c * .7, cy = .18 + j * .2; bmFill([[cx - .32, cy], [cx + .32, cy], [cx + .32, cy + .18], [cx - .32, cy + .18]], bmShade(cols[c], .8)); bmOval(cx, cy + .18, .32, .06, cols[c]); }
      const fly = ease(t, cue + .05, cue + .7), bx = L - .6, by = .25 + fly * 2.6; g.save(); g.translate(bx, -by); g.rotate(fly * 3.2); g.beginPath(); g.ellipse(0, 0, .42, .17, 0, 0, Math.PI); g.closePath(); g.fillStyle = '#8a5a2c'; g.fill(); g.beginPath(); g.ellipse(0, 0, .42, .08, 0, 0, TAU); g.fillStyle = '#4a2c14'; g.fill(); g.restore();
      g.restore();
    } else if (kind === 'ballot') { const sag = .5 + .2 * Math.sin(t * .6); bmCrutch([-2.4, 0], [-1.2, 2.6], .08); bmCrutch([2.2, 0], [1.3, 2.2], .08);
      bmPath([[-1.6, 1.2], [1.6, 1.2], [1.7, 3.3 - sag * .3], [1.2, 3.5], [-1.4, 3.6], [-1.7, 3.3]]); g.closePath(); g.fillStyle = bmLG(-1.6, 0, 1.6, 0, ['#f7f0de', '#c9bfa8']); g.fill();
      bmPath([[-1.6, 1.25], [1.6, 1.25], [1.5, .3 - sag * .2], [.6, 1.0 - sag], [-.4, .5 - sag * .4], [-1.5, .9]]); g.closePath(); g.fillStyle = '#e4dbc4'; g.fill();
      bmFill([[-.8, 3.4], [.8, 3.4], [.8, 3.52], [-.8, 3.52]], '#1a1a1a'); bmFill([[-.35, 3.5], [.35, 3.5], [.35, 4.3], [-.35, 4.3]], '#fbf7ec'); bmLine([[-.25, 3.8], [.2, 4.05]], .05, '#c7362b');
    }
    g.restore(); }, shadow: () => kind === 'seesaw' ? shadowOf([[X - 4.2, 0, Z], [X + 4.2, 0, Z], [X - 4.2, 2.2, Z], [X + 4.2, 1.6, Z]], t) : shadowStick(X, 0, 5.5, Z, 3, t) });
}
function bmInstallsInto(t, list) {
  const pat = wt(8, 'patent'), tim = wt(15, 'time'), unf = wt(18, 'unfair');
  bmInstall('ballot', t, 0, carX(9) + 13, 17, list);
  bmInstall('bulb', t, pat, carX(pat) - 7, 21, list);
  if (t < 136) bmInstall('hourglass', t, tim, carX(tim) + 9, 15, list);
  if (t > 126 && t < 134.3) bmInstall('seesaw', t, unf, carX(unf) + 12.5, 17, list);
}

// ---------- lamps (render.js draws them from LAMPS; soft-headed Dali street lamps that light at dusk) ----------
const LAMPS = []; for (let X = -80; X < 420; X += 20) LAMPS.push({ X, Z: 26 + (X % 40 ? 2 : 0), droop: .3 + .7 * rnd(X, 5) });
function lamp(l, t, emissive) {
  const p = P(l.X, 0, l.Z); if (p[2] < 2 || (p[2] < 6 && t > 236) || p[0] < -200 || p[0] > W + 200) return; const k = kAt(p), x = p[0], y = p[1], top = y - 5 * k, dr = l.droop || .5, hx = x + (.5 + dr * .25) * k, hy = top + dr * .55 * k;
  if (!emissive) { g.strokeStyle = '#4a3a2c'; g.lineWidth = Math.max(1, .14 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, top); g.quadraticCurveTo(x + .5 * k, top - .35 * k, hx, hy - .1 * k); g.stroke();
    g.fillStyle = '#e9dcb8'; g.beginPath(); g.moveTo(hx - .3 * k, hy); g.quadraticCurveTo(hx, hy - .45 * k, hx + .3 * k, hy); g.quadraticCurveTo(hx + .05 * k, hy + (.25 + dr * .35) * k, hx - .3 * k, hy); g.fill(); return; }
  const n = nightAmt(t); if (n <= .1) return; g.save(); g.globalCompositeOperation = 'lighter'; const R = 1.1 * k; const rg = g.createRadialGradient(hx, hy + .15 * k, 0, hx, hy + .15 * k, R); rg.addColorStop(0, `rgba(255,214,140,${.6 * n})`); rg.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = rg; g.fillRect(hx - R, hy + .15 * k - R, 2 * R, 2 * R); g.restore();
}

// ---------- dust devils (called by installs.js) ----------
function dustDevil(X, Z, t, amt, seed) { // a spinning column of playa dust, with grit and a scrap of paper caught in it
  const p = P(X, 0, Z); if (p[2] < 2 || amt <= 0) return; const k = kAt(p), H2 = 14 * amt;
  g.save();
  for (let i = 0; i < 30; i++) { const u = i / 30, y = p[1] - u * H2 * k, w = (.5 + u * u * 4.2) * k, a = t * 6 + u * 9 + seed, cx = p[0] + Math.sin(a) * w * .35 + n1(seed, t + u) * k;
    g.fillStyle = `rgba(${200 + 20 * u},${168 + 18 * u},${120 + 16 * u},${.15 * amt * (1 - u * .55)})`; g.beginPath(); g.ellipse(cx, y, w, .55 * k, 0, 0, TAU); g.fill();
    if (i % 3 === 0) { g.fillStyle = `rgba(140,104,64,${.25 * amt})`; g.beginPath(); g.ellipse(cx - Math.cos(a) * w * .8, y, .5 * k, .14 * k, 0, 0, TAU); g.fill(); } }
  g.strokeStyle = `rgba(150,112,70,${.22 * amt})`; g.lineWidth = Math.max(1, .12 * k); for (let j = 0; j < 3; j++) { g.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, a = t * 6 + u * 9 + seed + j * 2.1, w = (.5 + u * u * 4.2) * k; const px = p[0] + Math.cos(a) * w + n1(seed, t + u) * k, py = p[1] - u * H2 * k; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  for (let i = 0; i < 3; i++) { const u = ((t * .3 + i / 3 + seed * .1) % 1) * .9 + .05, a = t * 6 + u * 9 + seed + i, w = (.5 + u * u * 4.2) * k; g.save(); g.translate(p[0] + Math.cos(a) * w * .9, p[1] - u * H2 * k); g.rotate(t * 4 + i); g.fillStyle = `rgba(236,230,214,${.8 * amt})`; g.fillRect(-.3 * k, -.2 * k, .6 * k, .4 * k); g.restore(); }
  g.restore();
}

// ---------- draft-2 entry points that render.js still calls: kept empty, everything now goes through playaInto ----------
const ELEPHANTS = [];
function elephantsInto(t, list) {}
function poorPerson(t, list) {}
function cops(t, list) {}
const CAMPS = [];
function camp(c, t) {}
const BIKES = [];
function bike(b, t) { return null; }

// scene hook (draft 3): pushes {z, draw, shadow} into list.
function playaInto(t, list) {
  bmCampsInto(t, list); bmInstallsInto(t, list); bmElephantsInto(t, list); bmWarsInto(t, list);
  bmTraffic(t, list); bmFlockInto(t, list); bmParadeInto(t, list); bmPoorInto(t, list); bmCopsInto(t, list);
}
