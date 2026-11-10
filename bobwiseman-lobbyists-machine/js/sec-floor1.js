// Section 'floor1': band gap, verse 3a, verse 3, hook 3 (the Shoveller). Song 51.9-91.0. Owner: b3. Block (world units): x 1500..4300, y -1450..1150.
// Contract (BRIEF.md): the coin's first leg starts at t 51.9 at SEC.list exit point; its last leg ends at t 91.0 at SEC.floor1.exit.p.
// Layout: the coin leaves test 01's HITS cabinet by a COIN RETURN flap, rides a glass tube over the jukebox arch, lands on the
// PUBLIC OPINION ruler (top row), spirals down a DONATIONS funnel and a coil chute into the PRESS mortar (bottom row, floor y 900),
// ploughs the press-release drift, is juggled by the Shoveller, jumps off his snowshoe, perches on the blog's pie chart, and rolls
// down a gutter onto the price card of the big HITS cabinet. The Shoveller glides over and feeds that cabinet on hook 3.
(() => {
'use strict';
const T0 = 51.9, T1 = 91.0;
SEC['floor1'] = { exit: { t: T1, p: [4100, 1150] } };

// ---------- places ----------
// the riser goes up the clear gap at x -28, between hook 1's lettering column (right edge -126) and verse 2's first line (left edge 70)
const TUBE = [[-436, -650], [-28, -650], [-28, -1510], [1350, -1510], [1766, -1395], [1766, -1300]];
const RUL = { x: 2620, y: -1150, L: 880, th: 44 }, U_COIN = 0.97, HEADS = [0, 1, 2, 3, 4, 5, 6].map((i) => 0.12 + i * 0.125);
const FUN = [1700, -720], FUN_R = 120;
const COILP = COIL([1700, -590], [1840, 640], 4, 46);
const FLOOR = 900, PIVOT = [1770, 862], BARREL = -0.8, MUZ = [PIVOT[0] + Math.cos(BARREL) * 120, PIVOT[1] + Math.sin(BARREL) * 120];
const SHS = 0.9, SH0 = [2620, 860], SH1 = [3500, FLOOR];
const TOE = [[96, -6], [150, 8], [210, 22], [260, 26], [300, 14], [330, -14]].map(([x, y]) => [x * SHS, y * SHS]);
const BOARD = [3000, 560, 340, 300], PIE = [3170, 680], PIE_R = 82, WA0 = -100 * Math.PI / 180, WA1 = -40 * Math.PI / 180;
const R1 = [PIE[0] + Math.cos(WA1) * PIE_R, PIE[1] + Math.sin(WA1) * PIE_R], APEX = [PIE[0], PIE[1] - PIE_R - 21];
const GP = [[3330, 594], [3870, 598]];
const CAB = { x0: 3760, x1: 4096, y0: 300, y1: FLOOR }, MC = [3928, 520], CARD = [3880, 620, 100, 60], CARDC = [3930, 599], HOP = [3700, 470];
const EXG = [[4110, 839], [4170, 862], [4210, 920], [4212, 990], [4185, 1065], [4100, 1150]];

// ---------- times ----------
const TM = {};
function times() {
  const w = (l, i) => wt(l, i);
  Object.assign(TM, {
    and9: w(9, 0), quick: w(9, 1), bend: w(9, 7), nods: [2, 3, 4, 5, 6].map((i) => w(9, i)),
    then: w(10, 0), bliz: w(10, 6),
    two: w(11, 1), plat: w(11, 2), shov: w(11, 3), stood: w(11, 4),
    his: w(12, 0), snow: w(12, 1), trac: w(12, 4),
    piece: w(13, 8), action: w(13, 11),
    h3: C.hooks[2].ticks, a3: C.hooks[2].again,
  });
}
const hop = (a, b, k, h) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * h];
const rot = (p, c, a) => { const x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]; };
function offsetPoly(pts, d) { // a polyline shifted sideways by d (mitred at the corners)
  return pts.map((p, i) => {
    const nrm = (a, b) => { const l = dist(a, b) || 1; return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; };
    const n1 = i > 0 ? nrm(pts[i - 1], p) : nrm(p, pts[i + 1]), n2 = i < pts.length - 1 ? nrm(p, pts[i + 1]) : n1;
    let m = [n1[0] + n2[0], n1[1] + n2[1]]; const ml = Math.hypot(m[0], m[1]) || 1; m = [m[0] / ml, m[1] / ml];
    const s = d / Math.max(0.3, m[0] * n1[0] + m[1] * n1[1]); return [p[0] + m[0] * s, p[1] + m[1] * s];
  });
}

// ---------- the ruler: a cantilever, clamped on the right, free end on the left; theta grows (2u - u^2) toward the tip ----------
function rulTheta(t) {
  if (t < TM.quick - 0.02) return 0;
  const s = t - (TM.quick - 0.02);
  let th = 0.07 + 0.11 * Math.exp(-s * 2.6) * Math.sin(s * 13);
  TM.nods.forEach((n) => (th += 0.05 * pulse(t, n - 0.02, 0.3)));
  const b = ease(seg(t, TM.bend - 0.06, TM.bend + 0.22)); th += 0.55 * b;
  if (t > TM.bend + 0.22) { const r = t - TM.bend - 0.22; th += 0.07 * Math.exp(-r * 4) * Math.sin(r * 12); }
  return th;
}
function rulGeom(t) {
  const TH = rulTheta(t), n = 40, pts = [[RUL.x, RUL.y]], th = [0];
  for (let i = 1; i <= n; i++) { const u = (i - 0.5) / n, a = TH * (2 * u - u * u), p = pts[i - 1]; pts.push([p[0] - Math.cos(a) * RUL.L / n, p[1] + Math.sin(a) * RUL.L / n]); th.push(TH * (2 * (i / n) - (i / n) ** 2)); }
  const at = (u) => { const f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i; const p = [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)], a = lerp(th[i], th[i + 1], k); return { p, a, nrm: [-Math.sin(a), -Math.cos(a)] }; };
  return { pts, at, TH };
}
function rulCoin(t) { const g = rulGeom(t).at(U_COIN); return [g.p[0] + g.nrm[0] * 43, g.p[1] + g.nrm[1] * 43]; }

// ---------- the Shoveller: where he stands, his arms, his blades ----------
function shPos(t) { const k = ease(seg(t, TM.action + 0.13, TM.action + 1.45)); return along([SH0, [2700, 872], [2780, FLOOR], SH1], k); }
function armsAt(t) {
  let a = 0.3;
  [TM.two - 0.02, TM.plat - 0.25, TM.shov - 0.22].forEach((s) => (a += 0.2 * pulse(t, s, 0.28)));
  a += 0.5 * ease(seg(t, TM.stood - 0.3, TM.stood + 0.06)) * (1 - ease(seg(t, TM.stood + 1.7, TM.stood + 2.4)));
  a -= 0.3 * ease(seg(t, TM.his - 0.05, TM.his + 0.15));
  a += 0.55 * pulse(t, TM.trac, 0.5) + 0.5 * pulse(t, TM.piece, 0.45);
  if (t > TM.action) a = lerp(a, 0.05, ease(seg(t, TM.action, TM.action + 0.3)));
  if (t > TM.h3[0] - 0.6) { // the hook: one full swing per tick, blades up on the tick
    let sw = 0; TM.h3.forEach((tk) => { const d = Math.abs(t - tk); if (d < 0.27) sw = Math.max(sw, 0.5 + 0.5 * Math.cos(Math.PI * d / 0.27)); });
    a = lerp(a, 0.1 + 0.75 * sw, ease(seg(t, TM.h3[0] - 0.6, TM.h3[0] - 0.27)));
    a = lerp(a, 0.45 + 0.35 * pulse(t, TM.a3, 0.5), ease(seg(t, TM.h3[9] + 0.27, TM.a3)));
  }
  return clamp(a);
}
function bladeC(side, t) { const p = shPos(t), a = armsAt(t), hy = lerp(-200, -330, a); return [p[0] + side * 150 * SHS, p[1] + (hy - 170 - 32) * SHS]; }
function toeCoinPath(t) { const p = shPos(t), w = TOE.map(([x, y]) => [p[0] + x, p[1] + y]); return offsetPoly(w, -26); }

// ---------- the drift ----------
const driftGrow = (t) => ease(seg(t, TM.then + 0.12, TM.then + 1.1));
const driftH = (x, t) => (x < 1920 || x > 2560 ? 0 : 75 * Math.pow(Math.sin(Math.PI * (x - 1920) / 640), 0.8) * driftGrow(t));
const ploughY = (x, t) => FLOOR - 21 - 0.55 * driftH(x, t);

// ---------- the wedge ----------
const wedgePhi = (t) => 1.6 * ease(seg(t, TM.piece + 0.15, TM.piece + 0.75));
const wedgeDrop = (t) => 271 * seg(t, TM.piece + 0.6, TM.piece + 1.0) ** 2; // lands on the floor in front of the board
const coinOnWedge = (t) => rot(APEX, R1, wedgePhi(t));

// ---------- the coin's path ----------
function legs(add, land) {
  const T = TM, a = SEC['list'].exit.p;
  add(T0, 52.2, (k) => [a[0], lerp(a[1], -650, k * k)]);
  add(52.2, 52.45, (k) => [lerp(a[0], TUBE[0][0], k), -650]);
  add(52.45, 55.35, (k) => along(TUBE, 0.5 - 0.5 * Math.cos(Math.PI * k)));
  add(55.35, T.quick - 0.02, (k, t) => { const b = rulCoin(T.quick - 0.02); return [TUBE[5][0], lerp(TUBE[5][1], b[1], k * k)]; });
  add(T.quick - 0.02, T.bend + 0.06, (k, t) => rulCoin(t));
  // off the bent tip, along its slope, into the funnel
  const tip0 = () => rulCoin(T.bend + 0.06), tipA = () => rulGeom(T.bend + 0.06).TH;
  add(T.bend + 0.06, T.bend + 0.36, (k) => { const p = tip0(), th = tipA(); return [p[0] - Math.cos(th) * 110 * k * k, p[1] + Math.sin(th) * 110 * k * k + 30 * k * k]; });
  const a0 = -0.3, sp0 = [FUN[0] + Math.cos(a0) * 105, FUN[1] + Math.sin(a0) * 24];
  add(T.bend + 0.36, T.bend + 0.6, (k) => { const th = tipA(), p = tip0(), q = [p[0] - Math.cos(th) * 110, p[1] + Math.sin(th) * 110 + 30]; return [lerp(q[0], sp0[0], k), lerp(q[1], sp0[1], k * k)]; });
  const spiral = (k) => { const r = lerp(105, 12, k ** 1.3), an = a0 + TAU * 3.2 * k ** 1.6; return [FUN[0] + Math.cos(an) * r, FUN[1] + Math.sin(an) * r * 0.22 + k * 80]; };
  add(T.bend + 0.6, 63.95, spiral);
  add(63.95, 64.1, (k) => { const p = spiral(1); return [lerp(p[0], COILP[0][0], k), lerp(p[1], COILP[0][1], k)]; });
  add(64.1, 66.05, (k) => along(COILP, k ** 1.25));
  const mz = [MUZ[0], MUZ[1] + 8], ce = COILP[COILP.length - 1];
  add(66.05, 66.3, (k) => [lerp(ce[0], mz[0], k), lerp(ce[1], mz[1], k * k)]);
  add(66.3, T.then, (k, t) => [mz[0], mz[1] + Math.sin(t * 60) * 1.5]);
  const d0 = [1990, ploughY(1990, T.then + 0.54)];
  add(T.then, T.then + 0.54, (k) => hop(mz, d0, k, 230));
  // plough through the drift, slowed by the paper
  const px = (k) => lerp(1990, 2470, k - Math.sin(k * TAU * 3) * 0.02);
  add(T.then + 0.54, T.two - 0.56, (k, t) => { const x = px(k); return [x, ploughY(x, t) + Math.sin(k * 40) * 2]; });
  add(T.two - 0.56, T.two, (k, t) => hop([2470, ploughY(2470, T.two - 0.56)], bladeC(-1, T.two), k, 60));
  // shovel to shovel: left on "two", right on "platinum", left on "shovels", right on "stood"
  const flips = [[T.two, T.plat - 0.25, -1], [T.plat, T.shov - 0.22, 1], [T.shov, T.stood - 0.29, -1], [T.stood, T.his, 1]];
  flips.forEach(([c, f, side], i) => {
    add(c, f, (k, t) => bladeC(side, t));
    if (i < 3) { const nx = flips[i + 1]; add(f, nx[0], (k) => hop(bladeC(side, f), bladeC(-side, nx[0]), k, i === 2 ? 50 : 45)); } // low hops: the coin stays under the frame's top edge
  });
  // off the blade onto the snowshoe's long toe, rock in its dip, grip on "traction" and launch
  add(T.his, T.snow, (k) => { const a = bladeC(1, T.his), b = along(toeCoinPath(T.snow), 0.2); return [lerp(a[0], b[0], k), lerp(a[1], b[1], k * k)]; });
  const rock = [[T.snow, 0.2], [T.snow + 0.47, 0.66], [T.snow + 0.87, 0.45], [T.snow + 1.17, 0.72], [T.trac, 0.55]];
  for (let i = 0; i < rock.length - 1; i++) { const [ta, fa] = rock[i], [tb, fb] = rock[i + 1]; add(ta, tb, (k, t) => along(toeCoinPath(t), lerp(fa, fb, ease(k)))); }
  add(T.trac, T.trac + 0.15, (k, t) => along(toeCoinPath(t), lerp(0.55, 1, k * k)));
  add(T.trac + 0.15, T.trac + 0.77, (k) => hop(along(toeCoinPath(T.trac + 0.15), 1), APEX, k, 170));
  // the pie's apex: it teeters, the timer runs down, the cutter slices on "piece"
  const tl = T.trac + 0.77;
  add(tl, T.piece + 0.15, (k, t) => [APEX[0] + Math.sin((t - tl) * 9) * 5 * Math.exp(-(t - tl) * 1.2), APEX[1]]);
  add(T.piece + 0.15, T.piece + 0.45, (k, t) => coinOnWedge(t));
  add(T.piece + 0.45, T.piece + 0.8, (k) => hop(coinOnWedge(T.piece + 0.45), GP[0], k, 40));
  add(T.piece + 0.8, T.action + 1.03, (k) => along(GP, k ** 1.2));
  add(T.action + 1.03, T.action + 1.23, (k) => hop(GP[1], CARDC, k, 26));
  add(T.action + 1.23, T.a3, (k, t) => [CARDC[0], CARDC[1] + shudder(t) * 2]);
  // "Again": the card flips, the coin drops into the slot, falls behind the glass, out of the return and down the chute
  add(T.a3, T.a3 + 0.2, (k) => [CARDC[0], lerp(CARDC[1], 640, k * k)]);
  add(T.a3 + 0.2, T.a3 + 0.55, (k) => [CARDC[0], lerp(640, 839, k * k)]);
  add(T.a3 + 0.55, T.a3 + 0.9, (k) => [lerp(CARDC[0], EXG[0][0], ease(k)), 839]);
  add(T.a3 + 0.9, T1, (k) => along(EXG, k ** 1.3));
  [['ruler', T.quick - 0.02], ['mortar', 66.3], ['drift', T.then + 0.54], ['blade', T.two], ['toe', T.snow], ['pie', tl], ['card', T.action + 1.23]].forEach(([n, tt]) => land(n, tt));
}
const shudder = (t) => TM.h3.reduce((m, tk) => m + pulse(t, tk + 0.35, 0.16), 0);
const coinFree = (t) => t > 52.45 && t < 55.3; // inside the tube, seen wide on b7's camera

// ---------- camera ----------
function followAt(t) { let x = 0, y = 0, sum = 0; for (let j = -10; j <= 14; j++) { const w = 1 - Math.abs(j - 2) / 14, b = ballAt(t + j * 0.04); x += b[0] * w; y += b[1] * w; sum += w; } return [x / sum, y / sum - 30]; }
function cam(hold, t, st) {
  // from 55 the framing is mine: whatever was framed at 55 (the pull-back) eases into the ruler, then each framing
  // cross-fades straight into the next (no follow-cam between them), and the last one hands back to the follow-cam by 90.2
  if (t < 55.0) return;
  const f = followAt(t), K = [
    [2170, -950, 0.95, 55.0, 57.2], // public opinion: ruler, heads, funnel
    [2180, 660, 0.95, 63.2, 66.5], // down the coil to the press, the drift, the shovels
    [3000, 700, 0.97, 74.4, 76.0], // the snowshoe and the blog
    [3650, 640, 0.85, TM.action + 0.08, TM.action + 1.73], // the big cabinet for hook 3
    [null, 0, 0, 89.0, 90.2], // back to the follow-cam for the hand-off (aimed a little low at first, so hook 3's red rows stay in)
  ];
  let x = st.x, y = st.y, z = st.z;
  for (const [cx, cy, cz, a, b] of K) {
    if (t < a) break;
    // out of the wide pull-back the pan leads and the zoom follows, so line 9's first words stay in frame
    const e = ease(seg(t, a, a === 55.0 ? 56.3 : b)), ez = a === 55.0 ? ease(seg(t, 55.3, b)) : e;
    const tx = cx === null ? f[0] : cx, ty = cx === null ? f[1] + 110 * (1 - seg(t, a, b)) : cy, tz = cx === null ? 1.1 : cz;
    x = lerp(x, tx, e); y = lerp(y, ty, e); z = Math.exp(lerp(Math.log(z), Math.log(tz), ez));
  }
  st.x = x; st.y = y; st.z = z;
}

// ---------- parts ----------
// glass tube: the money takes the pneumatic express over the jukebox, out of sight of the public
function tubePart(t) {
  if (t < T0 - 0.5) return;
  const a = offsetPoly(TUBE, 22), b = offsetPoly(TUBE, -22);
  crayon(pathOf(a.concat(b.slice().reverse())), GLASS, 'tubef', 0.5);
  ink(a, 'tubeA', { w: 1.8, poly: true }); ink(b, 'tubeB', { w: 1.8, poly: true });
  const L = plen(TUBE);
  for (let s = 140; s < L - 60; s += 170) { const p = along(TUBE, s / L), q = along(TUBE, (s + 4) / L), l = dist(p, q) || 1, nx = -(q[1] - p[1]) / l, ny = (q[0] - p[0]) / l; if (near(p[0], p[1], 200)) ink([[p[0] + nx * 24, p[1] + ny * 24], [p[0] - nx * 24, p[1] - ny * 24]], 'tr' + s, { w: 1.2, col: PENCIL }); }
  // the COIN RETURN flap on the cabinet's right side swings open as the coin goes out
  if (near(-436, -650)) {
    const o = pulse(t, 52.15, 0.55) * 1.2; ink([[-436, -674], [-436 + Math.sin(o) * 44, -674 + Math.cos(o) * 44]], 'flap', { w: 6, col: GILT });
    shape(box(-214, -830, 136, 28), PAPER, 'crl', 1.2); boxLabel('COIN RETURN', [-214, -830, 136, 28], 16, RED);
  }
  // the outlet over the ruler's free end
  if (near(1766, -1300)) shape(box(1736, -1306, 60, 14), GREY, 'tubeo', 1.6);
}
// public opinion: a crowd of identical cardboard heads on a springy ruler; one coin on its free end bends the lot
function rulerPart(t) {
  if (t < 54.5 || !near(2200, -1150, 700)) return;
  const g = rulGeom(t), top = [], bot = [];
  for (let i = 0; i <= 40; i++) { const q = g.at(i / 40); top.push([q.p[0] + q.nrm[0] * 22, q.p[1] + q.nrm[1] * 22]); bot.push([q.p[0] - q.nrm[0] * 22, q.p[1] - q.nrm[1] * 22]); }
  shape(box(2645, -1115, 30, 260), TAN, 'rpil', 1.6);
  shape(top.concat(bot.slice().reverse(), [top[0]]), GILT, 'rul', 2);
  for (let i = 4; i <= 39; i++) { const q = g.at(i / 40), l = i % 4 ? 8 : 16; ink([[q.p[0] + q.nrm[0] * 22, q.p[1] + q.nrm[1] * 22], [q.p[0] + q.nrm[0] * (22 - l), q.p[1] + q.nrm[1] * (22 - l)]], 'rt' + i, { w: 0.9 }); }
  shape(box(2606, -1190, 74, 80), GREY, 'rclamp', 2); ink([[2643, -1190], [2643, -1236]], 'rscrew', { w: 3 }); ink([[2620, -1236], [2666, -1236]], 'rscrh', { w: 3 });
  { const q = g.at(0.21); X.save(); X.translate(q.p[0], q.p[1]); X.rotate(-q.a); boxLabel('PUBLIC OPINION', [-118, -18, 236, 36], 24, OX); X.restore(); }
  // the heads nod on the sung words and all tilt together when it bends
  const nod = TM.nods.reduce((m, n) => m + pulse(t, n - 0.02, 0.3) * 0.12, 0), lean = 0.32 * ease(seg(t, TM.bend - 0.04, TM.bend + 0.3));
  HEADS.forEach((u, i) => { const q = g.at(u); opinionHead(q.p[0] + q.nrm[0] * 22, q.p[1] + q.nrm[1] * 22, 0.9, { tilt: -q.a - 0.06 - nod - lean, tag: 'p' + i }); });
}
// the coin's donation goes round and round the funnel before it disappears
function funnelPart(t) {
  if (t < 54.5 || !near(FUN[0], FUN[1], 400)) return;
  blob([[FUN[0] - FUN_R, FUN[1]], [FUN[0] + FUN_R, FUN[1]], [FUN[0] + 22, FUN[1] + 104], [FUN[0] - 22, FUN[1] + 104]], GILT, 'fun', 1.8);
  ink(circ(FUN[0], FUN[1], FUN_R, 26), 'funr', { w: 1.8 });
  shape(box(FUN[0] - 70, FUN[1] + 18, 140, 30), PAPER, 'fsign', 1.1); boxLabel('DONATIONS', [FUN[0] - 70, FUN[1] + 18, 140, 30], 20, OX);
  shape(box(FUN[0] - 18, FUN[1] + 104, 36, 26), GREY, 'fsp', 1.4);
}
function coilPart(t) {
  if (t < 62.5 || !near(1770, 0, 900)) return;
  ink(COILP.map(([x, y]) => [x - 2, y + 24]), 'coil', { w: 4.5, col: OX, poly: true });
  ink(COILP.map(([x, y]) => [x + 2, y + 27]), 'coil2', { w: 1.2, poly: true });
}
// the PRESS mortar: a coin goes in and a blizzard of press releases comes out
function mortarPart(t) {
  if (t < 63 || !near(1800, 820, 500)) return;
  const fire = pulse(t, TM.then, 0.3);
  X.save(); X.translate(PIVOT[0], PIVOT[1]); X.rotate(BARREL);
  shape([[-30, -30], [120 - fire * 10, -26], [120 - fire * 10, 26], [-30, 30], [-30, -30]], NAVY, 'barrel', 2.2);
  shape(box(110 - fire * 10, -32, 18, 64), GREY, 'muzz', 1.8); X.restore();
  shape(box(1690, 850, 160, 50), TAN, 'carr', 2); boxLabel('PRESS', [1700, 856, 100, 36], 26, RED);
  for (const wx of [1712, 1830]) { blob(circ(wx, 896, 22), GREY, 'mw' + wx, 1.8); dot(wx, 896, 4); }
  // the coin's arrival strikes the flint and the fuse burns down to "Then"
  const fk = seg(t, 66.3, TM.then), fuse = [[1745, 832], [1726, 812], [1712, 824], [1700, 806]];
  ink(fuse, 'fuse', { w: 1.6 });
  if (fk > 0 && fk < 1) { const p = along(fuse.slice().reverse(), 1 - fk); for (let i = 0; i < 5; i++) { const a = i * 1.3 + t * 30; ink([[p[0], p[1]], [p[0] + Math.cos(a) * 14, p[1] + Math.sin(a) * 14]], 'spk' + i, { w: 1.2, col: RED }); } dot(p[0], p[1], 4, LAMP); }
  // the boom: a puff of crayon smoke, no flash
  const pk = seg(t, TM.then, TM.then + 0.9);
  if (pk > 0 && pk < 1) { X.save(); X.globalAlpha = 0.6 * (1 - pk); for (let i = 0; i < 5; i++) { const a = -1.4 + i * 0.35; blob(circ(MUZ[0] + Math.cos(a) * 50 * pk + 20, MUZ[1] + Math.sin(a) * 50 * pk - 10, 22 + pk * 34), PAPER, 'puff' + i, 1.2); } X.restore(); }
}
function paperBit(x, y, r, s = 1) { X.save(); X.translate(x, y); X.rotate(r); X.scale(s, s); X.fillStyle = PAPER; X.fillRect(-9, -7, 18, 14); X.strokeStyle = INK; X.lineWidth = 1.3; X.strokeRect(-9, -7, 18, 14); X.strokeStyle = PENCIL; X.lineWidth = 1; X.beginPath(); X.moveTo(-6, -2); X.lineTo(6, -2); X.moveTo(-6, 2); X.lineTo(3, 2); X.stroke(); X.restore(); }
const PAPERS = [...Array(64)].map((_, i) => { const r = LLPen.makeRng(900 + i); return { t0: (i % 16) * 0.025 + Math.floor(i / 16) * 0.22, x1: 1940 + r() * 600, d: 0.75 + r() * 0.4, h: 150 + r() * 90, sp: (r() - 0.5) * 14 }; });
const FLAKES = [...Array(26)].map((_, i) => { const r = LLPen.makeRng(300 + i); return { x: 1930 + r() * 700, ph: r(), v: 70 + r() * 60, sp: (r() - 0.5) * 3 }; });
const HEAP = [...Array(30)].map((_, i) => { const r = LLPen.makeRng(500 + i); return { x: 1940 + r() * 600, f: r(), rt: (r() - 0.5) * 2 }; });
// the drift: the press releases pile up and the coin ploughs through them
function driftPart(t) {
  if (t < 65.5 || !near(2250, 860, 700)) return;
  // the Shoveller's snow mound
  blob([[2500, FLOOR], [2545, 862], [2700, 858], [2770, FLOOR]], SNOW, 'mound', 1.6);
  const g = driftGrow(t);
  if (g > 0) {
    const prof = []; for (let x = 1920; x <= 2560; x += 20) prof.push([x, FLOOR - driftH(x, t)]);
    blob(prof.concat([[2560, FLOOR], [1920, FLOOR]]), SNOW, 'drift', 1.6);
    HEAP.forEach((p, i) => { if (p.f < g * 1.1) paperBit(p.x, FLOOR - driftH(p.x, t) * (0.3 + 0.6 * p.f), p.rt, 0.9); });
  }
  // releases in flight from the muzzle
  PAPERS.forEach((p) => {
    const k = (t - TM.then - p.t0) / p.d; if (k < 0 || k > 1) return;
    const e = [p.x1, FLOOR - driftH(p.x1, TM.then + 1.1) - 6], q = hop(MUZ, e, k, p.h); paperBit(q[0], q[1], (t - TM.then) * p.sp, 1);
  });
  // a light blizzard keeps falling through lines 10 and 11
  const bk = seg(t, TM.then + 0.3, TM.then + 1) * (1 - seg(t, TM.stood + 1.5, TM.stood + 2.5));
  if (bk > 0) FLAKES.forEach((f, i) => { const y = 530 + ((f.ph * 360 + t * f.v) % 360), x = f.x + Math.sin(t * 1.4 + i) * 20; X.save(); X.globalAlpha = bk; paperBit(x, y, t * f.sp + i, 0.7); X.restore(); });
}
// the Shoveller, his long rhinestone toe (a ski jump), and the gold he shovels on hook 3
function shovellerPart(t) {
  if (t < 65.5) return;
  const p = shPos(t); if (!near(p[0], p[1] - 200, 600)) return;
  shoveller(p[0], p[1], SHS, { arms: armsAt(t) });
  const w = TOE.map(([x, y]) => [p[0] + x, p[1] + y]);
  ink(w, 'toeo', { w: 14, col: INK }); ink(w, 'toe', { w: 10, col: PLAT });
  // rhinestones light as the coin rolls over them, and all sparkle on "traction"
  const c = ballAt(t), sp = pulse(t, TM.trac - 0.02, 0.45);
  for (let i = 1; i <= 9; i++) {
    const q = along(w, i / 10), lit = (t > TM.snow && t < TM.trac + 0.3 && Math.abs(c[0] - q[0]) < 30) || sp > 0;
    dot(q[0], q[1] - 1, lit ? 3.6 : 2.4, lit ? LAMP : SNOW);
    if (sp > 0.05 && i % 2) { const r = 8 + sp * 16; ink([[q[0] - r, q[1] - 12], [q[0] + r, q[1] - 12]], 'sx' + i, { w: 1.4, col: GILT }); ink([[q[0], q[1] - 12 - r], [q[0], q[1] - 12 + r]], 'sy' + i, { w: 1.4, col: GILT }); }
  }
}
// his blog: a sandwich board with THE ACTION pie chart; a kitchen timer and a pizza cutter take a slice on "piece"
function boardPart(t) {
  if (t < 73.9 || !near(3170, 700, 600)) return;
  const [bx, by, bw, bh] = BOARD;
  for (const lx of [bx + 20, bx + bw - 20]) ink([[lx, by + bh], [lx + (lx < bx + 100 ? -14 : 14), FLOOR]], 'bl' + lx, { w: 3, col: TAN });
  shape(box(bx, by, bw, bh), PAPER, 'board', 2.2);
  shape(box(bx + 10, by + 258, 70, 34), TAN, 'blogp', 1.2); boxLabel('BLOG', [bx + 10, by + 258, 70, 34], 22, INK);
  shape(box(3090, 772, 200, 40), RED, 'actl', 1.6); boxLabel('THE ACTION', [3090, 772, 200, 40], 26, PAPER);
  // gallows for the cutter, the timer, the string from the apex peg
  ink([[3335, by], [3335, 520], [3290, 520]], 'gal', { w: 3, col: TAN });
  const rem = 1 - seg(t, TM.trac + 0.77, TM.piece), ta = -Math.PI / 2 + rem * TAU * 0.8;
  blob(circ(3305, 600, 20), PAPER, 'timer', 1.6); ink([[3305, 600], [3305 + Math.cos(ta) * 15, 600 + Math.sin(ta) * 15]], 'timh', { w: 1.8, col: RED });
  if (t < TM.piece + 0.15) ink([[PIE[0], PIE[1] - PIE_R + 2], [3240, 586], [3286, 596]], 'tstr', { w: 0.9, col: PENCIL });
  const dg = pulse(t, TM.piece - 0.03, 0.35); if (dg > 0) for (let i = 0; i < 3; i++) { const a = -2.2 + i * 0.6; ink([[3305 + Math.cos(a) * 26, 600 + Math.sin(a) * 26], [3305 + Math.cos(a) * (32 + dg * 10), 600 + Math.sin(a) * (32 + dg * 10)]], 'ding' + i, { w: 1.6 }); }
  // the pie: a thick disc with four slices; the gilt slice is the one he wants
  const slice = (a0, a1, col, tag, xf = (p) => p) => { const pts = [PIE]; for (let i = 0; i <= 12; i++) { const a = lerp(a0, a1, i / 12); pts.push([PIE[0] + Math.cos(a) * PIE_R, PIE[1] + Math.sin(a) * PIE_R]); } pts.push(PIE); shape(pts.map(xf), col, tag, 1.6); };
  blob(circ(PIE[0] + 4, PIE[1] + 7, PIE_R), OX, 'pieth', 1.6);
  slice(WA1, WA1 + 1.75, RED, 'ps1'); slice(WA1 + 1.75, WA1 + 3.66, GREEN, 'ps2'); slice(WA1 + 3.66, WA0 + TAU, TAN, 'ps3');
  if (t < TM.piece + 0.15) { ink([[PIE[0], PIE[1]], [PIE[0] + Math.cos(WA0) * PIE_R, PIE[1] + Math.sin(WA0) * PIE_R]], 'cutl', { w: 1, col: PENCIL }); }
  const ph = wedgePhi(t), dy = wedgeDrop(t);
  slice(WA0, WA1, GILT, 'wedge', (q) => { const r = rot(q, R1, ph); return [r[0], r[1] + dy]; });
  dot(PIE[0], PIE[1] - PIE_R + 2, 3); // the apex peg
  // the cutter: hangs, drops on "piece", rolls the cut line from the rim to the centre, is pulled back up
  const ck = seg(t, TM.piece, TM.piece + 0.05), cr = seg(t, TM.piece + 0.05, TM.piece + 0.16), cb = ease(seg(t, TM.piece + 0.35, TM.piece + 0.9));
  const rest = [3262, 568], start = [R1[0] + 8, R1[1] - 8], end = [lerp(R1[0], PIE[0], 0.9), lerp(R1[1], PIE[1], 0.9)];
  let wc = cr > 0 ? [lerp(start[0], end[0], cr), lerp(start[1], end[1], cr)] : [lerp(rest[0], start[0], ck), lerp(rest[1], start[1], ck)];
  wc = [lerp(wc[0], rest[0], cb), lerp(wc[1], rest[1], cb)];
  const he = [wc[0] + 30, wc[1] - 42];
  ink([[3290, 520], he], 'cstr', { w: 1, col: INK });
  ink([wc, he], 'chnd', { w: 6, col: OX }); blob(circ(wc[0], wc[1], 22), GREY, 'cwh', 1.8); dot(wc[0], wc[1], 3.5);
}
// the gutter from the board to the big cabinet's price card; drawn behind the Shoveller, its post clear of where he stands
function gutterPart(t) {
  if (t < 73.9 || !near(3600, 700, 500)) return;
  plank(GP, 'gut'); ink([[3740, 627], [3740, FLOOR]], 'gutp', { w: 3, col: TAN });
}
// hook 3: a second cabinet twice test 01's size, HITS at 50 cents; it eats a shovelful a tick and the price goes up on "Again"
function cabinetPart(t) {
  if (t < 81.3 || !near(3930, 600, 600)) return;
  const sx = shudder(t) * 3 * Math.sin(t * 90);
  X.save(); X.translate(sx, 0);
  // hopper on the left shoulder
  shape([[3628, 460], [3772, 460], [3772, 540], [3742, 540], [3628, 470], [3628, 460]], GREY, 'hop', 1.8);
  shape(box(CAB.x0, CAB.y0, CAB.x1 - CAB.x0, CAB.y1 - CAB.y0), RED, 'cab2', 2.6);
  shape(box(3780, 318, 296, 56), GILT, 'hits2', 2); boxLabel('HITS', [3780, 318, 296, 56], 40, OX);
  // the meter: one notch per shovelful, pins at MAX, then the needle bends up past the top of the dial
  blob(circ(MC[0], MC[1], 95, 95, Math.PI, TAU, 18).concat([[MC[0] + 95, MC[1]], [MC[0] - 95, MC[1]]]), PAPER, 'm2', 1.8);
  for (let i = 0; i <= 7; i++) { const a = Math.PI + (i / 7) * (Math.PI - 0.15); ink([[MC[0] + Math.cos(a) * 80, MC[1] + Math.sin(a) * 80], [MC[0] + Math.cos(a) * 92, MC[1] + Math.sin(a) * 92]], 'mt' + i, { w: i === 7 ? 3 : 1.2, col: i === 7 ? RED : INK }); }
  label('0', MC[0] - 70, MC[1] - 12, 18); label('MAX', MC[0] + 58, MC[1] - 12, 16, RED);
  const lv = TM.h3.reduce((m, tk) => m + ease(seg(t, tk + 0.3, tk + 0.42)), 0), kick = shudder(t) * 0.05;
  if (lv <= 7) { const a = Math.PI + (lv / 7) * (Math.PI - 0.15) + kick; ink([[MC[0], MC[1]], [MC[0] + Math.cos(a) * 82, MC[1] + Math.sin(a) * 82]], 'nd2', { w: 3, col: RED }); }
  else { const b = (lv - 7) / 3, a = TAU - 0.15 - b * 1.25, L = 82 + b * 62; ink(bend([MC[0], MC[1]], [MC[0] + Math.cos(a) * L, MC[1] + Math.sin(a) * L], -b * 46), 'nd2b', { w: 3, col: RED }); }
  dot(MC[0], MC[1], 6);
  // the slot behind the price card, the glass, the return
  shape(box(3895, 634, 70, 10), INK, 'slot2', 1);
  shape(box(3790, 750, 276, 110), GLASS, 'win2', 1.6);
  shape(box(CAB.x1 - 4, 818, 12, 42), GILT, 'ret2', 1.4);
  // the price card: hinged at its foot, flips on "Again" from 50 cents to a dollar
  const fk = ease(seg(t, TM.a3, TM.a3 + 0.25)), c = Math.cos(Math.PI * fk), [cx, cy, cw, ch] = CARD, hy = cy + ch, h = ch * Math.abs(c);
  if (h > 3) { const y0 = c >= 0 ? hy - h : hy; shape(box(cx, y0, cw, h), c >= 0 ? PAPER : GILT, 'card', 1.6); if (h > 34) boxLabel(c >= 0 ? '50¢' : '$1', [cx, y0, cw, h], 36, c >= 0 ? INK : RED); }
  X.restore();
  // the exit chute
  ink(offsetPoly(EXG, 25), 'exgA', { w: 3, col: OX }); ink(offsetPoly(EXG, -25), 'exgB', { w: 3, col: OX });
}
function throwsPart(t) {
  if (t < TM.h3[0] - 0.3 || t > TM.a3) return;
  // the shovelfuls: loaded on the right blade, dumped into the hopper on each tick
  TM.h3.forEach((tk, j) => {
    if (t < tk - 0.25 || t > tk + 0.45) return;
    const bl = bladeC(1, Math.min(t, tk));
    for (let i = 0; i < 5; i++) {
      const o = [(i - 2) * 9, -(i % 2) * 8 - 4];
      const p = t < tk ? [bl[0] + o[0], bl[1] + o[1]] : hop([bl[0] + o[0], bl[1] + o[1]], [HOP[0] + o[0] * 0.4, HOP[1] + 6], seg(t, tk, tk + 0.4 + i * 0.01), 50 + i * 6);
      if (t < tk + 0.42 + i * 0.01) { X.fillStyle = GILT; X.beginPath(); X.arc(p[0], p[1], 11, 0, TAU); X.fill(); X.strokeStyle = INK; X.lineWidth = 1.4; X.stroke(); }
    }
  });
}
function floorPart(t) {
  const segs = [[1600, 2780, 63], [2780, 3400, 73.9], [3400, 4200, 81.3]];
  segs.forEach(([a, b, from], i) => { if (t >= from && near((a + b) / 2, FLOOR, (b - a) / 2 + 300)) shape(box(a, FLOOR, b - a, 22), TAN, 'fl' + i, 1.8); });
}

// ---------- words ----------
const faded = (a, b, fn) => { const k = 1 - seg(T, a, b); if (k <= 0) return; X.save(); X.globalAlpha = k; fn(); X.restore(); };
function words(t) {
  if (t < 55) return;
  letterWords(lineWords(9), 2200, -960, 46, INK, 410);
  // old lines fade once the camera moves on, so no half line hangs at a frame edge
  faded(74.4, 75.2, () => letterWords(lineWords(10), 1910, 420, 46, INK, 430));
  faded(74.4, 75.2, () => letterWords(lineWords(11), 1556, 985, 44, INK, 1230));
  faded(81.3, 82.1, () => letterWords(lineWords(12), 2860, 958, 44, INK, 640));
  letterWords(lineWords(13), 2950, 390, 44, INK, 430); // narrow, clear of his raised shovel in hook 3
  // hook 3 in red under the floor, one phrase per tick: low enough that the last ones stay in frame as the camera follows the coin down
  TM.h3.forEach((tk, i) => letterWords(phrase(C.hookText, tk), 2950 + (i % 5) * 236, 978 + Math.floor(i / 5) * 44, 36, RED, 232));
  letterWords([{ w: C.againText, t: TM.a3 }], 3850, 822, 44, RED, 200); // lit on the cabinet's window
}

section({
  id: 'floor1', range: [T0, T1],
  init() { times(); },
  legs, cam, coinFree,
  parts(t) { tubePart(t); funnelPart(t); coilPart(t); rulerPart(t); floorPart(t); mortarPart(t); driftPart(t); gutterPart(t); shovellerPart(t); boardPart(t); cabinetPart(t); throwsPart(t); },
  words,
});
})();
