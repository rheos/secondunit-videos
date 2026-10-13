// 215.4-225.86  "No one's a slave to the puppet payola machine".
// A grey radio-console machine with a crane boom of gears works three musicians on marionette strings.
// Opens on a match cut: 13's gold ball/score disc is a coin, which drops into the machine's slot as the
// camera pulls back. Coins drop, the gears tick, the puppets jerk through the machine's tune. On "No" they
// brace against the strings; "slave", "to the", "puppet" snap each one free (one punch-in, on "slave": a
// close on the strings snapping, the cut ends recoiling into springy curls on a spinning reel); each freed
// musician drops at the knees, then straightens. On "pay-o-la" the slot spits the coins back up and each one
// lands on a gear as it flips over into a sunflower, becoming its seed disc; on "machine" the speaker flips
// too, and the three walk off in step, playing their own instruments, while the camera lifts to the
// sunflowers (gear 2 ends where 15's moon irises in).
(() => {
const T = { c0: 215.84, c1: 216.59, no: 217.28, ones: 217.84, slave: 218.38, to: 219.25, puppet: 219.98,
  loose: 220.2, payola: 221.08, machine: 222.64, walk: 222.3, end: 225.86 };
const BEATS = [215.08, 215.84, 216.59, 217.35, 218.17, 218.93, 219.68, 220.44, 221.14, 221.93, 222.69, 223.48,
  224.25, 225.02, 225.76, 226.52, 227.29];
function beatPh(t) { for (let i = BEATS.length - 2; i >= 0; i--) if (t >= BEATS[i]) return { i, ph: clamp((t - BEATS[i]) / (BEATS[i + 1] - BEATS[i])) }; return { i: -1, ph: 0 }; }
const FLOOR = 950;
// the machine's tick: the gears step one tooth at a time (half beats), then strain on "No"
const TICKS = [215.84, 216.21, 216.59, 216.97];
const COINS = [215.84, 216.59, 217.28];
const SLOT = [403, 411];

// ---------------- the gear train along the boom ----------------
const PITCH = 2 * Math.PI * 85 / 12;
const GY = 274;                        // draft 1 had 214; dropped to close the dead band above the trio
const GEARS = []; (() => {
  let x = 560;
  const ns = [15, 12, 15, 12, 15, 12, 15];
  let prevTooth = null;
  ns.forEach((n, i) => {
    const r = n * PITCH / (2 * Math.PI);
    if (i > 0) x += GEARS[i - 1].r + r;
    // mesh: if the previous gear has a tooth at angle 0, this one needs a gap at PI, and vice versa
    const step = 2 * Math.PI / n;
    let off = 0;
    if (i > 0) { const want = prevTooth ? .5 : 0; off = Math.PI - want * step; }
    const f = ((0 - off) / step) % 1, fr = (f + 1) % 1;
    prevTooth = fr < .25 || fr > .75;
    GEARS.push({ x, r, n, off, step, main: i % 2 === 1, droop: 6 + hash(i * 3.3) * 8 });
  });
})();
function gearPath(r, n) {
  const p = new Path2D(); const step = 2 * Math.PI / n, ro = r + 9, ri = r - 9;
  for (let k = 0; k < n; k++) {
    const a = k * step;
    const pts = [[ri, a - step * .5], [ri, a - step * .27], [ro, a - step * .17], [ro, a + step * .17], [ri, a + step * .27]];
    pts.forEach(([rr, aa], j) => { const X = Math.cos(aa) * rr, Y = Math.sin(aa) * rr; if (k === 0 && j === 0) p.moveTo(X, Y); else p.lineTo(X, Y); });
  }
  p.closePath();
  p.moveTo(r * .2, 0); p.arc(0, 0, r * .2, 0, Math.PI * 2);
  for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5 + .3, X = Math.cos(a) * r * .58, Y = Math.sin(a) * r * .58; p.moveTo(X + r * .17, Y); p.arc(X, Y, r * .17, 0, Math.PI * 2); }
  return p;
}
function petals(r, n, rot) {
  const p = new Path2D();
  for (let k = 0; k < n; k++) {
    const a = rot + k * Math.PI * 2 / n, c = Math.cos(a), s = Math.sin(a), r0 = r * .3, r1 = r, rm = r * .66, w = r * .15;
    p.moveTo(c * r0, s * r0);
    p.quadraticCurveTo(c * rm - s * w, s * rm + c * w, c * r1, s * r1);
    p.quadraticCurveTo(c * rm + s * w, s * rm - c * w, c * r0, s * r0);
    p.closePath();
  }
  return p;
}
GEARS.forEach((G) => { G.path = gearPath(G.r, G.n); G.pet0 = petals(G.r * 1.04, 13, Math.PI / 13); G.pet1 = petals(G.r * .98, 13, 0); });
// the seed disc (also the back face of a coin)
function seedDisc(r, A0) {
  cut(circle(0, 0, r), C.w0, { sh: .5, grain: .25 });
  g.save(); g.globalAlpha = A0 * .55; g.fillStyle = C.goldPale;
  for (let k = 0; k < 13; k++) { const a = k * 2.4; const rr = r * .8 * Math.sqrt((k + .5) / 13); g.fill(circle(Math.cos(a) * rr, Math.sin(a) * rr, r * .074)); }
  g.restore();
}
function sunflower(r, P0, P1, A0, disc = true) {
  cut(P0, C.goldPale, { sh: .5, grain: .2 });
  cut(P1, C.gold, { sh: .5, grain: .22 });
  if (disc) seedDisc(r * .38, A0);
}
// a coin: gold face, its back is a seed disc. spin = the coin's turn angle (cos < 0 shows the back)
function coin(x, y, r, spin, A0, plain = false) {
  const c = Math.cos(spin);
  g.save(); g.translate(x, y); g.scale(Math.max(.14, Math.abs(c)), 1);
  if (c >= 0) { cut(circle(0, 0, r), C.gold, { sh: .6, grain: .15 }); if (!plain) cut(circle(0, 0, r * .64), C.goldPale, { sh: 0, grain: .1 }); }
  else seedDisc(r, A0);
  g.restore();
}
// the train turns by arc length; ticks step one tooth with a mechanical overshoot
function trainArc(t) {
  let s = 0;
  TICKS.forEach((tk) => { s += PITCH * back((t - tk) / .16); });
  s += PITCH * .45 * bump(t, T.no, .5);
  const strain = ss(T.no, T.no + .2, t) * (1 - ss(T.puppet, T.puppet + .3, t));
  s += strain * (hash(Math.floor(t * 12) * 3.1) - .5) * 7;
  [T.slave, T.to, T.puppet].forEach((sn, i) => { s += PITCH * (1.4 + i * .3) * eo((t - sn) / .6); });
  s += PITCH * 2.2 * eo((t - T.loose) / 1.6);
  return s;
}
const FLIP = GEARS.map((_, i) => T.payola + i * .17);

// ---------------- the camera ----------------
// a camera state is [z, Fx, Fy, Sx, Sy]: world point F is drawn at screen point S, scaled z
const camLerp = (A, B, k) => [Math.exp(lerp(Math.log(A[0]), Math.log(B[0]), k)), lerp(A[1], B[1], k), lerp(A[2], B[2], k), lerp(A[3], B[3], k), lerp(A[4], B[4], k)];
const COIN0 = [SLOT[0], 214];               // where the match-cut coin hangs at the first frame
const CAM_COIN = [70 / 22, COIN0[0], COIN0[1], 960, 500];
const CAM_WIDE = [1, 980, 700, 980, 700];
const CAM_PUSH = [1.06, 980, 700, 980, 700];
const G2 = GEARS[2];
const CAM_END = [1, G2.x, GY + G2.droop, 942, 214]; // gear 2's sunflower lands on 15's iris centre (942, 214)
const PUNCH = { a: 218.12, b: 219.04 };
const CAM_CLOSE = [2.35, 716, 404, 960, 540];   // the guitarist's three strings, the reel at the top
function camAt(t) {
  if (t >= PUNCH.a && t < PUNCH.b) return CAM_CLOSE;
  let c = camLerp(CAM_WIDE, CAM_PUSH, eio((t - 216.2) / (222.6 - 216.2)));
  c = camLerp(c, CAM_END, eio((t - 222.7) / (225.3 - 222.7)));
  return camLerp(CAM_COIN, c, eo((t - 215.4) / .8));
}

// ---------------- the musicians ----------------
const S = .5;
const L1 = 168, L2 = 176;
function ik(sx, sy, tx, ty) {
  const dx = tx - sx, dy = ty - sy; const d = clamp(Math.hypot(dx, dy), 60, L1 + L2 - 2);
  const phi = Math.atan2(dx, dy);
  const a = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const b = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  return [phi - a, Math.PI - b];
}
// guitar: local frame along the neck
const GU = { x: 6, y: -468, a: -.42 };
const gp = (u, v) => [GU.x + u * Math.cos(GU.a) - v * Math.sin(GU.a), GU.y + u * Math.sin(GU.a) + v * Math.cos(GU.a)];
const GUITAR = (() => {
  const body = blob([[-100, 0], [-92, -58], [-50, -90], [10, -82], [55, -62], [92, -70], [140, -56], [160, 0], [140, 56], [92, 70], [55, 62], [10, 82], [-50, 90], [-92, 58]], .55);
  const neck = new Path2D(); neck.rect(150, -15, 230, 30); neck.roundRect(372, -21, 70, 42, 8);
  return { body, neck };
})();
function drawGuitar(A0) {
  g.save(); g.translate(GU.x, GU.y); g.rotate(GU.a);
  cut(GUITAR.neck, C.gold, { sh: .45, grain: .2 });
  cut(GUITAR.body, C.gold, { sh: .55, grain: .22 });
  cut(circle(66, 0, 27), C.w0, { sh: 0, grain: .1 });
  cut(rrect(-62, -30, 16, 60, 4), C.w0, { sh: 0, grain: .1 });
  g.save(); g.globalAlpha = A0 * .5; g.strokeStyle = C.goldPale; g.lineWidth = 2.2;
  for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(-54, k * 7); g.lineTo(400, k * 6); g.stroke(); }
  g.restore();
  g.restore();
}
// accordion: keyboard end against the chest, bass end in the near hand. w = bellows width at the top;
// the bellows fan open toward the bottom as they widen, so a squeeze reads as a squeeze.
const AC = { x0: 40, y0: -742, h: 270 };
const acFan = (w) => (w - 100) * .55;
function drawAccordion(w) {
  const { x0, y0, h } = AC, fan = acFan(w);
  const n = 9, bx0 = x0 + 30, tx1 = x0 + w, bxb = x0 + w + fan;
  const top = (u) => [lerp(bx0, tx1, u), y0 + 12], bot = (u) => [lerp(bx0, bxb, u), y0 + h - 12];
  cut(poly([top(0), top(1), bot(1), bot(0)]), C.goldPale, { sh: .5, grain: .2 });
  g.save(); g.fillStyle = C.gold;
  for (let k = 0; k < n; k++) { const u0 = k / n, u1 = (k + .5) / n;
    g.fill(poly([top(u0), [top(u1)[0], y0 + 20], [bot(u1)[0], y0 + h - 20], bot(u0)])); }
  g.restore();
  cut(cutRect(x0 - 6, y0 - 6, 42, h + 12, 33, 1.5), C.gold, { sh: .55, grain: .2 });
  g.save(); g.fillStyle = C.w0; for (let k = 0; k < 7; k++) g.fill(rect(x0 + 20, y0 + 22 + k * 34, 12, 15)); g.restore();
  // the bass end hinges with the fan
  const ang = Math.atan2(fan, h);
  g.save(); g.translate(tx1, y0 - 4); g.rotate(-ang);
  cut(cutRect(-6, 0, 46, h + 8, 34, 1.5), C.gold, { sh: .6, grain: .2 });
  g.restore();
}
const acHand = (w) => [AC.x0 + w + acFan(w) * .55 + 16, AC.y0 + AC.h * .55];
// drum: hung on the near hip, the head is its top edge; sticks strike it on the beat
const DR = { x: 178, y: -446, w: 176, h: 116 };
const DR_TOP = DR.y - DR.h / 2;
const STICK = 150;
// stroke u: 0 = tip on the head, 1 = stick up
function stickPose(u, far) {
  const tipX = far ? DR.x - 20 : DR.x + 34, aHit = far ? .95 : .78;
  const hx = tipX - STICK * Math.cos(aHit) + u * 10, hy = DR_TOP - STICK * Math.sin(aHit) - u * 70;
  return { hx, hy, a: lerp(aHit, -.45, u) };
}
function drawDrum() {
  g.save(); g.strokeStyle = C.w0; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-26, -770); g.lineTo(DR.x - DR.w / 2 + 6, DR.y - DR.h / 2 + 4); g.stroke(); g.restore();
  const x = DR.x - DR.w / 2, y = DR.y - DR.h / 2;
  cut(cutRect(x, y, DR.w, DR.h, 41, 1.5), C.gold, { sh: .6, grain: .22 });
  g.save(); g.strokeStyle = C.w0; g.lineWidth = 4; g.beginPath();
  for (let k = 0; k <= 6; k++) { const xx = x + 12 + k * (DR.w - 24) / 6; g.lineTo(xx, k % 2 ? y + DR.h - 18 : y + 18); }
  g.stroke(); g.restore();
  cut(cutRect(x - 8, y - 8, DR.w + 16, 20, 42, 1), C.goldPale, { sh: .4, grain: .15 });
  cut(cutRect(x - 8, y + DR.h - 12, DR.w + 16, 20, 43, 1), C.goldPale, { sh: .4, grain: .15 });
}
// two accent papers for the trio (draft 1 had three): rust and teal, gold for every instrument
const MUS = [
  { kind: 'guitar', spec: { col: C.red, kind: 'shirt', head: 'short', height: 1 }, x: 690, gear: 1, snap: T.slave },
  { kind: 'accordion', spec: { col: C.teal, kind: 'dress', head: 'short', hair: 'bob', height: .95 }, x: 1080, gear: 3, snap: T.to },
  { kind: 'drum', spec: { col: C.red, kind: 'shirt', head: 'short', hair: 'curls', height: 1.03 }, x: 1470, gear: 5, snap: T.puppet },
];
function playTargets(kind, inst) {
  if (kind === 'guitar') { const n = gp(36, inst), f = gp(318, -4); return [n[0], n[1], f[0], f[1]]; }
  if (kind === 'accordion') { const h = acHand(inst); return [h[0], h[1], 120, -610]; }
  const n = stickPose(inst, false), f = stickPose(1 - inst, true);
  return [n.hx, n.hy, f.hx, f.hy];
}
function stateAt(m, st, t) {
  const bp = beatPh(t);
  if (st === 'limp') {
    const inst = m.kind === 'accordion' ? 112 : 0;
    const sway = Math.sin(t * 2.2 + m.x) * .03;
    const tg = m.kind === 'guitar' ? [40, -430, 10, -436] : m.kind === 'accordion' ? [...acHand(inst), 110, -590] : playTargets('drum', 0);
    return [...tg, inst, -.42, .08 + sway, .14, .34, .02, .2];
  }
  if (st === 'machA' || st === 'machB') {
    const a = st === 'machA';
    const inst = m.kind === 'guitar' ? (a ? -38 : 38) : m.kind === 'accordion' ? (a ? 120 : 220) : (a ? 1 : 0);
    const tg = playTargets(m.kind, inst);
    tg[1] -= a ? 26 : 0;
    return [...tg, inst, a ? .14 : -.06, a ? -.03 : .02, a ? .62 : 0, a ? 1.15 : .04, a ? 0 : .3, a ? .04 : .5];
  }
  if (st === 'resist' || st === 'resist2') {
    // sinking back against the strings (draft 1's pose, protected)
    const deep = st === 'resist2' ? 1 : 0;
    const inst = m.kind === 'accordion' ? 112 : 0;
    const tg = m.kind === 'guitar' ? [20, -470, -10, -480] : m.kind === 'accordion' ? [...acHand(inst), 100, -570] : playTargets('drum', 0);
    const sh = (hash(Math.floor(t * 12) + m.x) - .5) * .04;
    return [...tg, inst, -.34 - deep * .08, -.11 - deep * .05 + sh, .42 + deep * .12, .8 + deep * .2, .28, .62 + deep * .15];
  }
  // free: playing their own music in place, foot tapping on the beat
  const ph = bp.ph, k8 = (t - BEATS[Math.max(0, bp.i)]) / ((BEATS[bp.i + 1] - BEATS[bp.i]) / 2) % 1;
  let inst;
  if (m.kind === 'guitar') inst = Math.sin(k8 * Math.PI * 2) * 38;
  else if (m.kind === 'accordion') inst = 165 + Math.sin((bp.i + ph) * Math.PI) * 70;
  else inst = Math.pow(Math.sin(ph * Math.PI), 1.2);
  const tg = playTargets(m.kind, inst);
  const tap = bump(t, BEATS[Math.max(0, bp.i)] - .02, .3) * (m.kind === 'drum' ? 0 : 1);
  const nod = Math.sin(ph * Math.PI);
  return [...tg, inst, .02 + nod * .07, .02 - nod * .02, .06 + tap * .3, .1 + tap * .6, .02, .06];
}
function keysFor(m) {
  return [
    { t: -1e9, st: 'limp' },
    { t: TICKS[0], st: 'machA', d: .12, e: back }, { t: TICKS[1], st: 'machB', d: .1, e: back },
    { t: TICKS[2], st: 'machA', d: .12, e: back }, { t: TICKS[3], st: 'machB', d: .1, e: back },
    { t: T.no, st: 'resist', d: .3, e: eo }, { t: T.ones, st: 'resist2', d: .25, e: eo },
    { t: m.snap, st: 'free', d: .45, e: eo },
  ];
}
MUS.forEach((m) => { m.keys = keysFor(m); });
function legVert(h, k) { return 266 * Math.cos(h) + 250 * Math.cos(h - k); }
function musicianPose(m, t) {
  const K = m.keys; let i = 0; for (let j = 0; j < K.length; j++) if (t >= K[j].t) i = j;
  let P = stateAt(m, K[i].st, t);
  if (i > 0) { const A = stateAt(m, K[i - 1].st, t), w = K[i].e((t - K[i].t) / K[i].d); P = A.map((a, j) => lerp(a, P[j], w)); }
  // the snap: free of the strings, they drop at the knees, then straighten up
  const dd = t - m.snap;
  if (dd >= 0) {
    const dip = dd < .14 ? eo(dd / .14) : 1 - eio((dd - .14) / .55);
    P = P.slice(); P[7] += .5 * dip; P[8] += .9 * dip; P[9] += .45 * dip; P[10] += .85 * dip; P[5] -= .16 * dip; P[6] += .06 * dip;
  }
  return P;
}

// a hand holder that records where the hand is in the frame (for the strings) and draws a prop
function holder(store, key, prop) {
  return () => {
    const m = g.getTransform(); const p = m.transformPoint(new DOMPoint(-4, -14)); store[key] = [p.x, p.y];
    if (prop) { g.save(); g.translate(-4, -14); prop(m); g.restore(); }
  };
}
function stick(m, ang, len = STICK + 14) {
  g.rotate(-Math.atan2(m.b, m.a) + ang);
  cut(rrect(-14, -6, len, 12, 6), C.w0, { sh: .4, grain: .1 });
  cut(circle(len - 14, 0, 10), C.w0, { sh: .2, grain: .1 });
}

// ---------------- strings, as thin cut-paper strips ----------------
function strand(pts, w) {
  const L = [], R = []; const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    L.push([pts[i][0] - dy * w / 2, pts[i][1] + dx * w / 2]); R.push([pts[i][0] + dy * w / 2, pts[i][1] - dx * w / 2]);
  }
  return poly(L.concat(R.reverse()));
}
const quadPts = (x0, y0, cx, cy, x1, y1, n = 10) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; o.push([v * v * x0 + 2 * u * v * cx + u * u * x1, v * v * y0 + 2 * u * v * cy + u * u * y1]); } return o; };
// a coil spring hanging from (x0,y0) along direction ang (0 = straight down), length len, coil amplitude amp
function coilPts(x0, y0, ang, len, amp, turns, ph) {
  const o = [], n = Math.round(turns * 10), c = Math.cos(ang), s = Math.sin(ang);
  for (let i = 0; i <= n; i++) {
    const u = i / n, ax = 0, ay = u * len, ex = amp * Math.sin(u * turns * Math.PI * 2 + ph) * Math.min(1, u * 6);
    o.push([x0 + (ax + ex) * c + ay * s, y0 - (ax + ex) * s + ay * c]);
  }
  return o;
}
const REEL = (() => { const p = new Path2D(); p.arc(0, 0, 25, 0, Math.PI * 2);
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; p.moveTo(Math.cos(a) * 14 + 6, Math.sin(a) * 14); p.arc(Math.cos(a) * 14, Math.sin(a) * 14, 6, 0, Math.PI * 2); }
  p.moveTo(4, 0); p.arc(0, 0, 4, 0, Math.PI * 2); return p; })();

// ---------------- small machine helpers ----------------
function greyRings(t, x, y, at, A0) {
  for (let r = 0; r < 2; r++) {
    const d = t - at - r * .14; if (d < 0 || d > 1.3) continue;
    const k = d / 1.3;
    g.save(); g.globalAlpha = A0 * (1 - k) * .9; g.strokeStyle = C.w2; g.lineWidth = lerp(10, 3, k); g.lineCap = 'round';
    for (const side of [0, Math.PI]) { g.beginPath(); g.arc(x, y, 26 + k * 230, side - .55, side + .55); g.stroke(); }
    g.restore();
  }
}
const SPEAKER = (() => { const p = new Path2D(); [120, 106, 92, 78, 64, 50, 36, 22].forEach((r) => { p.moveTo(270 + r, 650); p.arc(270, 650, r, 0, Math.PI * 2); }); return p; })();
const CABINET = (() => { const p = new Path2D(); p.moveTo(70, FLOOR - 40); p.lineTo(70, 560); p.arc(270, 560, 200, Math.PI, 0); p.lineTo(470, FLOOR - 40); p.closePath(); return p; })();
const MAST = (() => {
  const p = new Path2D(); p.moveTo(236, 372); p.lineTo(262, 92); p.lineTo(278, 92); p.lineTo(304, 372); p.closePath();
  const yAt = (y) => lerp(34, 8, (372 - y) / 280);
  for (let k = 0; k < 6; k++) {
    const ya = 362 - k * 44, yb = ya - 38, wa = yAt(ya) - 7, wb = yAt(yb) - 7;
    if (k % 2) { p.moveTo(270 - wa, ya); p.lineTo(270 + wa, ya); p.lineTo(270, yb + 4); p.closePath(); }
    else { p.moveTo(270 - wb, yb); p.lineTo(270 + wb, yb); p.lineTo(270, ya - 4); p.closePath(); }
  }
  return p;
})();
const SUN_SPK = petals(138, 17, 0), SUN_SPK0 = petals(146, 17, Math.PI / 17);
// the spat coins: one per gear, out of the slot, arcing up, landing as the gear finishes flipping
const SPIT = GEARS.map((G, i) => ({ t0: FLIP[i] - .22, t1: FLIP[i] + .36 }));

SHOT(215.4, 225.86, 'payola', (t) => {
  const A0 = g.globalAlpha;
  const cam = camAt(t), z = cam[0];
  // ground: pale grey paper that warms once the gears have flowered
  const warm = ss(T.payola, T.machine + .6, t);
  sheet(C.w4); sheet(C.creamDeep, warm * .75);
  g.save(); g.translate(cam[3], cam[4]); g.scale(z, z); g.translate(-cam[1], -cam[2]);
  cut(cutRect(-200, FLOOR, W + 400, 300, 5, 3), C.w3, { sh: .6, lift: .2 });
  if (warm > 0) { g.save(); g.globalAlpha = A0 * warm * .55; cut(cutRect(-200, FLOOR, W + 400, 300, 5, 3), C.sand, { sh: 0, grain: .2 }); g.restore(); }

  // ---- mast ----
  cut(MAST, C.w1, { sh: .7, rule: 'evenodd', lift: .2 });
  cut(circle(270, 82, 15), C.w1, { sh: .5 });
  TICKS.forEach((tk) => greyRings(t, 270, 82, tk, A0));
  greyRings(t, 270, 82, T.no, A0 * .6);

  // ---- coins fall into the slot (the first is the match-cut coin, already hanging there) ----
  COINS.forEach((c, i) => {
    let y, spin, plain = false;
    if (i === 0) { const d = Math.max(0, t - 215.4), u = clamp(d / (c - 215.4)); if (u >= 1) return;
      y = lerp(COIN0[1], SLOT[1] + 8, u * u); spin = d * d * 34; plain = d < .1; }
    else { const d = t - (c - .5); if (d < 0 || d > .5) return; y = lerp(-60, SLOT[1] + 8, (d / .5) * (d / .5)); spin = d * 22 + i; }
    coin(SLOT[0], y, 22, spin, A0, plain);
  });
  // ---- the boom ----
  cut(cutRect(236, GY - 16, 1610, 32, 21, 1.5), C.w0, { sh: .8, lift: .4 });
  cut(rrect(1828, GY - 26, 26, 52, 6), C.w0, { sh: .6 });

  // ---- the cabinet ----
  cut(CABINET, C.w1, { sh: 1, lift: .5 });
  cut(cutRect(52, FLOOR - 46, 436, 46, 23, 1.5), C.w0, { sh: .7 });
  { const kick = bump(t, T.payola - .25, .3) * 6; cut(rrect(380, 404 - kick, 46, 14, 7), C.w0, { sh: 0 }); }
  { const dial = new Path2D(); dial.moveTo(190, 500); dial.arc(270, 500, 80, Math.PI, 0); dial.closePath();
    cut(dial, C.w0, { sh: 0, grain: .15 });
    const nk = TICKS.reduce((s, tk) => s + back((t - tk) / .16), 0) * .32 - 1.3 - ss(T.slave, T.puppet + .5, t) * .9;
    g.save(); g.strokeStyle = C.w3; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(270, 498);
    g.lineTo(270 + Math.sin(nk) * 66, 498 - Math.cos(nk) * 66); g.stroke(); g.restore();
    cut(circle(196, 826, 17), C.w0, { sh: .4 }); cut(circle(344, 826, 17), C.w0, { sh: .4 }); }
  const sf = clamp((t - T.machine) / .4), sx = Math.cos(eio(sf) * Math.PI), pop2 = sf >= 1 ? back(clamp((t - T.machine - .4) / .5)) : 1;
  g.save(); g.translate(270, 650); g.scale(Math.max(.02, Math.abs(sx)) * (sf > .5 ? lerp(.9, 1, pop2) : 1), 1);
  const nod0 = sf >= 1 ? Math.sin(beatPh(t).ph * Math.PI * 2) * .04 : 0; g.rotate(nod0);
  if (sf <= .5) { g.translate(-270, -650); cut(SPEAKER, C.w0, { sh: .4, rule: 'evenodd', lift: sf * 2 }); }
  else sunflower(140, SUN_SPK0, SUN_SPK, A0);
  g.restore();

  // ---- the gears ----
  const arc = trainArc(t);
  const looseK = ss(T.loose, T.loose + .8, t);
  GEARS.forEach((G, i) => {
    const sgn = i % 2 ? -1 : 1;
    const wob = Math.sin(t * 8 + i * 1.7) * .09 * bump(t, T.loose, 1.4);
    const ang = G.off + sgn * arc / G.r + wob;
    const droop = looseK * G.droop;
    const fk = clamp((t - FLIP[i]) / .36), sxx = Math.cos(eio(fk) * Math.PI);
    const pp = fk >= 1 ? back(clamp((t - FLIP[i] - .36) / .45)) : 1;
    G.cx = G.x; G.cy = GY + droop; G.ang = ang; G.flipped = fk > .5;
    g.save(); g.translate(G.cx, G.cy);
    g.scale(Math.max(.02, Math.abs(sxx)) * (fk > .5 ? lerp(.85, 1, pp) : 1), fk > .5 ? lerp(.85, 1, pp) : 1);
    if (fk <= .5) {
      g.rotate(ang); cut(G.path, C.w1, { sh: .8, rule: 'evenodd', lift: .3 + fk * 2 });
      cut(circle(0, 0, G.r * .13), C.w0, { sh: .3 });
    } else {
      const nod = Math.sin((beatPh(t).ph + i * .2) * Math.PI * 2) * .05;
      g.rotate(nod + i); sunflower(G.r, G.pet0, G.pet1, A0, t >= SPIT[i].t1);
    }
    g.restore();
  });

  // ---- the musicians ----
  MUS.forEach((m, mi) => {
    const P = musicianPose(m, t);
    // walking off, in step, from just before "machine"
    const dW = t - T.walk; const v = 470;
    const dist = dW <= 0 ? 0 : dW < .5 ? v * dW * dW : v * (dW - .25);
    const wk = ss(T.walk, T.walk + .5, t);
    const ph = dist / (S * 95 * m.spec.height);
    const walk = POSE.walk(ph, .95);
    const legs = [[lerp(P[7], walk.legs[0][0], wk), lerp(P[8], walk.legs[0][1], wk)], [lerp(P[9], walk.legs[1][0], wk), lerp(P[10], walk.legs[1][1], wk)]];
    const hgt = m.spec.height;
    const plant = (516 - Math.max(legVert(legs[0][0], legs[0][1]), legVert(legs[1][0], legs[1][1]))) * hgt;
    const bob = lerp(plant, walk.bob, wk);
    const nearSh = [8, -752], farSh = [-8, -752];
    const store = m.store = {};
    const inst = P[4];
    let holdNear, holdFar;
    if (m.kind === 'drum') {
      const u = clamp(inst);
      holdNear = holder(store, 'n', (mm) => stick(mm, stickPose(u, false).a));
      holdFar = holder(store, 'f', (mm) => stick(mm, stickPose(1 - u, true).a));
    } else { holdNear = holder(store, 'n'); holdFar = holder(store, 'f'); }
    const pose = { arms: [ik(nearSh[0], nearSh[1], P[0], P[1]), ik(farSh[0], farSh[1], P[2], P[3])], legs, head: P[5], lean: P[6], bob,
      holdNear, holdFar };
    const spec = { ...m.spec,
      acc: [() => {
        const mm = g.getTransform();
        if (m.kind === 'guitar') { drawGuitar(A0); const p = mm.transformPoint(new DOMPoint(...gp(80, 0))); store.i = [p.x, p.y]; }
        else if (m.kind === 'accordion') { const w = clamp(inst, 100, 250); drawAccordion(w); const p = mm.transformPoint(new DOMPoint(AC.x0 + w * .6, AC.y0 + 30)); store.i = [p.x, p.y]; }
        else { drawDrum(); const p = mm.transformPoint(new DOMPoint(DR.x + 30, DR_TOP)); store.i = [p.x, p.y]; }
      }],
      headAcc: () => { const a = -(P[5]) * .9, cx = 6, cy = -168; const mm = g.getTransform();
        const p = mm.transformPoint(new DOMPoint(cx * Math.cos(a) - cy * Math.sin(a), cx * Math.sin(a) + cy * Math.cos(a))); store.h = [p.x, p.y]; },
    };
    puppet(m.x + dist, FLOOR, S, 1, spec, pose);
    // their own music: small gold rings off the instrument on the beat, once free (the drum's on its hits)
    if (t > m.snap + .4 && store.i) {
      const inv = g.getTransform().inverse();
      const ip = inv.transformPoint(new DOMPoint(store.i[0], store.i[1]));
      for (const b of BEATS) if (b > m.snap + .4 && t - b < 1.6 && t >= b)
        laughRings(t, ip.x + (m.kind === 'drum' ? 0 : 30), ip.y - 10, b, { n: 2, dir: m.kind === 'drum' ? -.9 : -.5 - mi * .08, spread: .6, reach: 210, life: 1.4, w0: 10, scale: .95 });
    }
  });

  // ---- the strings ----
  const inv = g.getTransform().inverse();
  const wS = 6.6 / Math.sqrt(z);          // ~6.6 px wide; thicker (but not rope) in the close-up
  MUS.forEach((m) => {
    const G = GEARS[m.gear], st = m.store; if (!st.n || !st.f || !st.h) return;
    const W2L = (p) => { const q = inv.transformPoint(new DOMPoint(p[0], p[1])); return [q.x, q.y]; };
    const dS = t - m.snap;
    if (G.flipped) return;
    // the reel the strings wind on: turns with the train, then spins free after the snap
    const spin = dS < 0 ? 0 : 26 / 2.6 * (1 - Math.exp(-2.6 * dS));
    const reelA = -G.ang * .6 + spin;
    const tops = [-1, 0, 1].map((j) => [G.cx + j * 19, G.cy + 22 - Math.abs(j) * 5]);
    const ends = [W2L(st.f), W2L(st.h), W2L(st.n)].sort((a, b) => a[0] - b[0]);
    const taut = ss(T.no, T.no + .2, t) && dS < 0 ? 1 : 0;
    ends.forEach((e, j) => {
      const [x0, y0] = tops[j], [x1, y1] = e;
      if (dS < 0) {
        const jx = taut ? (hash(Math.floor(t * 12) * 1.7 + j) - .5) * 3 : 0;
        const sag = taut ? 0 : 10;
        cut(strand(quadPts(x0, y0, lerp(x0, x1, .5) + sag + jx, lerp(y0, y1, .5), x1, y1), wS), C.w0, { sh: .35, grain: 0 });
      } else {
        const bk = .42 + j * .06, bx = lerp(x0, x1, bk), by = lerp(y0, y1, bk);
        const Lu = Math.hypot(bx - x0, by - y0), dir0 = Math.atan2(bx - x0, by - y0);
        // upper piece: recoils into a springy curl that bounces on the reel and stays there
        const rest = 104 + j * 16;
        const len = Math.max(30, rest + (Lu - rest) * Math.exp(-4.5 * dS) * Math.cos(9 * dS) + rest * .22 * Math.exp(-2 * dS) * Math.sin(10 * dS));
        const amp = 10 * ss(.02, .2, dS) * (1 + .3 * Math.exp(-3 * dS) * Math.sin(20 * dS));
        const ang = lerp(dir0, (j - 1) * .12, ss(0, .45, dS)) + Math.sin(dS * 5 + j) * .12 * Math.exp(-1.5 * dS);
        cut(strand(coilPts(x0, y0, ang, len, amp, 4.5, j * 1.3), wS), C.w0, { sh: .35, grain: 0 });
        // lower piece: drops slack into the hand
        const dn = eo(dS / .35);
        if (dn < 1) { const sx2 = lerp(bx, x1, dn), sy2 = lerp(by, y1, dn) + Math.sin(dn * Math.PI) * 34;
          cut(strand(quadPts(sx2, sy2, (sx2 + x1) / 2 - 22 * (1 - dn), (sy2 + y1) / 2, x1, y1), wS), C.w0, { sh: .3, grain: 0 }); }
      }
    });
    g.save(); g.translate(G.cx, G.cy + 4); g.rotate(reelA); cut(REEL, C.w3, { sh: .5, grain: .1, rule: 'evenodd' }); g.restore();
  });

  // ---- "pay-o-la": the slot spits the coins back; each becomes a sunflower's seed disc ----
  GEARS.forEach((G, i) => {
    const { t0, t1 } = SPIT[i]; if (t < t0 || t >= t1) return;
    const u = (t - t0) / (t1 - t0), ue = eo(u);
    const x = lerp(SLOT[0], G.cx, ue), y = lerp(SLOT[1] - 10, G.cy, ue) - Math.sin(u * Math.PI) * (150 + i * 12);
    coin(x, y, lerp(22, G.r * .38, u), u * Math.PI * 3, A0);
  });
  g.restore();
});
})();
