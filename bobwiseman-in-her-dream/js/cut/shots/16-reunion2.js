// 236.6-268.4  "In her dream there's a big reunion gonna come" x3, the loudest stretch of the song. The climax.
// A rhyme of 09's paper-doll medallion, bigger, and at night turning to sunrise. Her navy family is the hub,
// heads in round the sun (her profile cameo on it, the iris match from 15). On each sung line a new TIER of
// paper slides out from under the hub, pushing the older tiers outward and bigger (so the whole thing grows
// like rings in a tree, never swapping plates):
//   line 1 (236.8, night):    oranges + moon cradles; the plum-hat and teal-curls friends and the doctors,
//                             holding hands; a crown of night houses whose windows flash on the downbeats.
//   line 2 (248.75, dawn):    paper birds + red wallets; the three musicians playing guitar, accordion, drum.
//   line 3 (260.7, sunrise):  sunflowers (centres flash on downbeats); the street-hockey kids, sticks crossed
//                             overhead in pairs.
// The ground and the outer papers go navy > violet > rose > gold. By ~255 the medallion is past the frame
// edges and we are inside it; people are up and biggest 260.7-266. From 265.6 the tiers slide back under one
// another, outermost first, the hub folds under the sun, and the sun flies to 17's lamp and flattens into
// its bulb (ellipse 34x14 at 1000,314) during 267.9-268.4.
// Rings of people and objects are cached paper sprites (each frame is still a pure function of t).
(() => {
const CX = W / 2, CY = H / 2;
const LAMP = { x: 1000, y: 314, rx: 34, ry: 14 };      // 17's bulb at its opening framing (LX, LSY + 78)
// beat grid measured from the no-vocals stem (draft 1): 161.5 bpm, B0 a downbeat (strongest of four)
const P = .37233, B0 = 230.3;
const beatX = (t) => (t - B0) / P;
const sinceBeat = (t) => { const x = beatX(t); return (x - Math.floor(x)) * P; };
const sinceBar = (t) => { const x = beatX(t) / 4; return (x - Math.floor(x)) * 4 * P; };
const barN = (t) => Math.floor(beatX(t) / 4);
const hit = (d, tau = .13) => d < 0 ? 0 : Math.exp(-d / tau);
const ratchet = (t, every = 2) => { const x = beatX(t) / every, n = Math.floor(x); return n + eo((x - n) * 2.6); };
const W_ = (w, n, f) => { const v = wordAt(w, n, 236); return isNaN(v) ? f : v; };

const T = { a: 236.6, in1: 236.807, her1: 236.987, dream1: 237.988, big1: W_('big', 0, 239.93), ru1: W_('reunion', 0, 240.33),
  come1: 243.371, in2: 248.754, dream2: 249.094, big2: W_('big', 1, 251.86), ru2: W_('reunion', 1, 252.26), come2: 255.158,
  in3: 260.7, dream3: 261.04, theres3: 261.901, big3: W_('big', 2, 263.8), ru3: W_('reunion', 2, 264.2), end: 268.4 };
const RU = [T.ru1, T.ru2, T.ru3];
const BIGS = [T.big1, T.big2, T.big3];

// ---------------- colour ----------------
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixc = (a, b, k) => { k = clamp(k); const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
const ramp = (stops, t) => { if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) if (t < stops[i][0]) return mixc(stops[i - 1][1], stops[i][1], ss(stops[i - 1][0], stops[i][0], t));
  return stops[stops.length - 1][1]; };
// the ground: 15's night navy, blooming violet > rose > gold across the three lines
const GROUND = [[236.6, C.navy], [246.5, C.sky1], [250.5, '#5b4588'], [254.5, '#b56a86'], [259.5, '#e2917a'], [262, '#f0b04e']];
const dawn = (t) => ss(248, 261.5, t);
const PAL = {
  lav: '#c9bde2', peach: '#f3d4c2', night: '#283066', mauve: '#8f5579', crown: '#141c3d', crownD: '#5a3a68',
  house: '#3b3f7c', houseD: '#8a4e72', brown: '#5b3a29', redD: '#a8382f',
};

// ---------------- the camera ----------------
// Zc: how big the medallion is drawn. Line 1 a full image with margin; each new tier pushes the old ones out
// while we pull back a little; by ~255 the disc runs >8% past every edge; the peak 261-266 sits inside it.
const ZK = [[236.6, .72], [243.4, .73], [248.7, .79], [249.7, .62], [255.4, 1.04], [260.55, 1.08], [261.6, .8], [263.75, .86], [264.45, .97],
  [265.6, .93], [267.2, .86]];
function Zc(t) {
  if (t <= ZK[0][0]) return ZK[0][1];
  for (let i = 1; i < ZK.length; i++) if (t < ZK[i][0]) return lerp(ZK[i - 1][1], ZK[i][1], eio((t - ZK[i - 1][0]) / (ZK[i][0] - ZK[i - 1][0])));
  return ZK[ZK.length - 1][1];
}
// the beat: 3.5% on each downbeat, 1% on the other beats; the hub breathes harder on "big"
function pulse(t) {
  const on = ss(T.a + .3, T.a + 1.2, t) * (1 - ss(266.6, 267.3, t));
  return 1 + on * (.035 * hit(sinceBar(t), .16) + .01 * hit(sinceBeat(t), .1));
}

// ---------------- tiers ----------------
const HUBR = 330;                          // hub plate radius (world px at Zc 1)
const SPAN = [1.95, 1.74, 1.95];           // outer / inner radius of each tier
const BORN = [[237.12, .6], [248.72, .85], [260.66, .85]];
const GONE = [[265.6, .85], [266.05, .85], [266.5, .8]];
const hubE = (t) => (t < 236.86 ? 0 : back((t - 236.86) / .42)) * (1 - ei((t - 266.9) / .6));
const eT = (k, t) => { const [a, d] = BORN[k], [c, dc] = GONE[k]; return (t < a ? 0 : back((t - a) / d)) * (1 - ei((t - c) / dc)); };
const spinUp = (k, t) => { const [c, dc] = GONE[k]; const x = clamp((t - c) / dc); return x * x * 2.4; };
// inner radius of tier k (world px): sits outside every newer tier; at e=0 it is hidden under the next one in
function rIn(k, t, hubR) {
  let r = hubR * Math.pow(SPAN[k], eT(k, t) - 1);
  for (let j = k + 1; j < 3; j++) r *= Math.pow(SPAN[j], eT(j, t));
  return r;
}

// ---------------- sprites (cut once, drawn many times) ----------------
const PX = .42;                            // sprite pixels per drawing unit
const SPR = new Map();
function sprite(key, x0, y0, x1, y1, draw, px = PX) {
  let s = SPR.get(key); if (s) return s;
  const cv = document.createElement('canvas'); cv.width = Math.ceil((x1 - x0) * px); cv.height = Math.ceil((y1 - y0) * px);
  const ctx = cv.getContext('2d'); const g0 = g; g = ctx;
  ctx.setTransform(px, 0, 0, px, -x0 * px, -y0 * px);
  try { draw(); } finally { g = g0; }
  s = { cv, x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; SPR.set(key, s); return s;
}
const blit = (s) => g.drawImage(s.cv, s.x, s.y, s.w, s.h);
const shadowOn = (k = 1) => { g.shadowColor = `rgba(20,16,30,${.34 * k})`; g.shadowBlur = 12; g.shadowOffsetX = 5; g.shadowOffsetY = 8; };
const shadowOff = () => { g.shadowColor = 'rgba(0,0,0,0)'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0; };

// two-link arm IK in the puppet's arm space (+x forward, +y down, units). Returns [sh, el].
function reach(fx, fy, bk) {
  const a1 = 168, a2 = 176; let d = Math.hypot(fx, fy); d = Math.min(d, a1 + a2 - .5); d = Math.max(d, 40);
  const th = Math.atan2(fx, fy);
  const E = Math.acos(clamp((d * d - a1 * a1 - a2 * a2) / (2 * a1 * a2), -1, 1)) * (bk ? -1 : 1);
  return [th - Math.atan2(a2 * Math.sin(E), a1 + a2 * Math.cos(E)), E];
}
const lerpArm = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
// joined-hands and arms-up poses for a ring of N puppets (feet at radius F units, standing out, or heads in
// when out = -1), solved once; poses repeat with the unit, so one per unit member
function solveChain(unit, N, F, out, s = 1) {
  const ppl = [];
  for (let i = 0; i < N; i++) {
    const spec = unit[i % unit.length], h = spec.height || 1;
    let m = new DOMMatrix().rotate(360 * i / N).translate(0, -F); if (out < 0) m = m.scale(1, -1);
    const mp = m.scale(s * h, s * h);
    ppl.push({ mp, near: mp.transformPoint(new DOMPoint(8, -752)), far: mp.transformPoint(new DOMPoint(-8, -752)),
      top: mp.transformPoint(new DOMPoint(20, -1010)) });
  }
  const meet = (q, r) => new DOMPoint((q.x + r.x) / 2, (q.y + r.y) / 2);
  return ppl.map((p, i) => {
    const nx = ppl[(i + 1) % N], pv = ppl[(i - 1 + N) % N];
    const inv = p.mp.translate(8, -752).inverse(), invF = p.mp.translate(-8, -752).inverse();
    let A1 = inv.transformPoint(meet(p.near, nx.far)), A2 = invF.transformPoint(meet(p.far, pv.near)), swap = false;
    if (A1.x < 0) { swap = true; [A1, A2] = [invF.transformPoint(meet(p.far, nx.near)), inv.transformPoint(meet(p.near, pv.far))]; }
    let U1 = inv.transformPoint(meet(p.top, nx.top)), U2 = invF.transformPoint(meet(p.top, pv.top));
    if (swap) { U1 = invF.transformPoint(meet(p.top, nx.top)); U2 = inv.transformPoint(meet(p.top, pv.top)); }
    return { joined: [reach(A1.x, A1.y + 30, false), reach(A2.x, A2.y + 30, true)],
      up: [reach(U1.x, U1.y - 50, false), reach(U2.x, U2.y - 50, true)] };
  });
}

// ---------------- the cast ----------------
const ex = (col, kind, head, hair, height, more = {}) => ({ col, kind, head, hair, height, ...more });
const mirror = () => { cut(ellipse(44, -112, 8, 22), C.chrome, { sh: .4, grain: .1 }); };
const DOC_A = { ...CAST.doctor, col: C.ink, headAcc: mirror };                                       // bald, ink
const DOC_B = { ...CAST.doctor, col: '#6a7189', hair: 'bob', height: 1.0, headAcc: mirror };        // grey bob
const FRIENDS = [CAST.friendA, DOC_A, CAST.friendB, DOC_B];
const FAMILY = [CAST.her, CAST.girl11, CAST.boy8, CAST.girl3];
const MUS = [
  { kind: 'guitar', spec: ex(C.red, 'shirt', 'short', null, 1) },
  { kind: 'accordion', spec: ex(C.teal, 'dress', 'short', 'bob', .96) },
  { kind: 'drum', spec: ex(C.plum, 'shirt', 'short', 'curls', 1.02) },
];
const KIDS = [ex(C.tealDeep, 'shirt', 'child', 'cap', .66, { headK: .31 }), ex(C.red, 'dressShort', 'child', 'pony', .7, { headK: .3 }),
  ex(C.red, 'shirt', 'child', 'cap', .64, { headK: .31 }), ex(C.tealDeep, 'dressShort', 'child', 'pigtail', .68, { headK: .32 })];

// ring definitions in tier units (B = the tier's inner radius): feet radius, height of an h=1 person
const RING = {
  friends: { unit: FRIENDS, N: 36, feet: 1.235, hk: .45 },
  mus: { N: 24, feet: 1.25, hk: .47 },
  kids: { unit: KIDS, N: 28, feet: 1.245, hk: .95 },
};
const PB = [-560, -1560, 600, 140];        // puppet sprite bounds (units)

// friends and doctors: joined (0), half (1), arms up (2)
let FR_POSE = null;
function friendSprite(si, lvl) {
  if (!FR_POSE) FR_POSE = solveChain(FRIENDS, RING.friends.N, RING.friends.feet / RING.friends.hk * 1000, 1);
  return sprite('fr' + si + ':' + lvl, ...PB, () => {
    const p = FR_POSE[si], k = lvl / 2;
    puppet(0, 0, 1, 1, FRIENDS[si], { arms: [lerpArm(p.joined[0], p.up[0], k), lerpArm(p.joined[1], p.up[1], k)], head: -.06 * k });
  });
}

// the musicians (instruments are local copies of 14's, simplified): play frames 0/1, and 2 = cheer
// (instrument raised)
function ikT(tx, ty, sx, sy, bk) { return reach(tx - sx, ty - sy, bk); }
function guitar() {
  g.save(); g.translate(6, -468); g.rotate(-.42);
  const neck = new Path2D(); neck.rect(150, -15, 230, 30); neck.roundRect(372, -21, 70, 42, 8);
  cut(neck, C.gold, { sh: .45, grain: .2 });
  cut(blob([[-100, 0], [-92, -58], [-50, -90], [10, -82], [55, -62], [92, -70], [140, -56], [160, 0], [140, 56], [92, 70], [55, 62], [10, 82], [-50, 90], [-92, 58]], .55), C.gold, { sh: .55, grain: .22 });
  cut(circle(66, 0, 27), C.ink, { sh: 0, grain: .1 });
  g.restore();
}
function accordion(w) {
  const x0 = 46, y0 = -716, h = 236, n = 8, bx0 = x0 + 26, bx1 = x0 + w - 4;
  cut(cutRect(bx0, y0 + 10, bx1 - bx0, h - 20, 31, 1.5), C.goldPale, { sh: .5, grain: .2 });
  g.save(); g.fillStyle = C.gold;
  for (let k = 0; k < n; k++) { const xa = lerp(bx0, bx1, k / n); g.fill(poly([[xa, y0 + 10], [xa + (bx1 - bx0) / n * .5, y0 + 18], [xa + (bx1 - bx0) / n * .5, y0 + h - 18], [xa, y0 + h - 10]])); }
  g.restore();
  cut(cutRect(x0 - 6, y0 - 6, 40, h + 12, 33, 1.5), C.gold, { sh: .55, grain: .2 });
  cut(cutRect(x0 + w - 8, y0 - 4, 44, h + 8, 34, 1.5), C.gold, { sh: .6, grain: .2 });
}
const DR = { x: 236, y: -430, w: 190, h: 120 };
function drum() {
  const x = DR.x - DR.w / 2, y = DR.y - DR.h / 2;
  cut(poly([[-30, -760], [-10, -790], [DR.x - 60, y + 6], [DR.x - 90, y + 20]]), C.ink, { sh: .3, grain: .1 });     // strap
  cut(cutRect(x, y, DR.w, DR.h, 41, 1.5), C.gold, { sh: .6, grain: .22 });
  cut(cutRect(x - 8, y - 10, DR.w + 16, 22, 42, 1), C.goldPale, { sh: .4, grain: .15 });
  cut(cutRect(x - 8, y + DR.h - 12, DR.w + 16, 22, 43, 1), C.goldPale, { sh: .4, grain: .15 });
}
const drumStick = (ang) => () => { g.save(); g.rotate(ang); cut(rrect(-7, -10, 14, 190, 7), C.ink, { sh: .3, grain: .1 }); cut(circle(0, 184, 14), C.ink, { sh: 0, grain: 0 }); g.restore(); };
function musSprite(mi, fr) {
  return sprite('mu' + mi + ':' + fr, ...PB, () => {
    const m = MUS[mi], sh = [8, -752], shF = [-8, -752];
    let arms, acc, holdNear, holdFar, head = 0, lean = 0;
    if (m.kind === 'guitar') {
      const gp = (u, v) => [6 + u * Math.cos(-.42) - v * Math.sin(-.42), -468 + u * Math.sin(-.42) + v * Math.cos(-.42)];
      const n = gp(36, fr === 1 ? 34 : -30), f = gp(318, -4);
      arms = [ikT(n[0], n[1] + 10, ...sh, true), ikT(f[0], f[1], ...shF, false)];
      if (fr === 2) { lean = -.12; head = -.16; }
      acc = guitar;
    } else if (m.kind === 'accordion') {
      const w = fr === 1 ? 120 : fr === 2 ? 236 : 200;
      arms = [ikT(46 + w + 24, -600, ...sh, true), ikT(52, -640, ...shF, true)];
      if (fr === 2) head = -.16;
      acc = () => accordion(w);
    } else {
      const upN = fr === 1, upF = fr === 0;
      arms = [ikT(upN ? 150 : 190, upN ? -600 : -520, ...sh, true), ikT(upF ? 130 : 170, upF ? -610 : -526, ...shF, true)];
      if (fr === 2) { arms = [reach(120, -300, false), reach(60, -320, false)]; head = -.16; }
      holdNear = drumStick(fr === 2 ? -2.6 : upN ? -1.9 : -1.15); holdFar = drumStick(fr === 2 ? -2.9 : upF ? -1.9 : -1.15);
      acc = drum;
    }
    puppet(0, 0, 1, 1, { ...m.spec, acc: [acc] }, { arms, head, lean, holdNear, holdFar,
      legs: fr === 2 ? [[.25, .5], [-.1, .1]] : [[.04, .02], [-.04, .02]] });
  });
}

// street-hockey kids: stick down at the ready (0), half (1), sticks up and crossed with the partner (2).
// Pairs face each other (even faces clockwise, odd back), so the raised blades cross between them.
const stickArt = (len, ang) => () => {
  g.save(); g.rotate(ang);
  cut(rrect(-11, -30, 22, len, 9), C.ink, { sh: .35, grain: .15 });
  cut(blob([[-12, len - 50], [14, len - 46], [70, len - 18], [74, len + 4], [-8, len + 10], [-16, len - 20]], .5), C.ink, { sh: .35, grain: .15 });
  g.restore();
};
function kidSprite(si, lvl) {
  return sprite('kd' + si + ':' + lvl, ...PB, () => {
    const k = lvl / 2, spec = KIDS[si];
    // ready: stick angled down to the ground ahead; up: thrust up-forward ~50 deg, blade crossing the partner's
    const near = lerpArm([.45, .3], [2.1, .2], k), far = lerpArm([.25, .35], [.55, 1.5], k);
    const ang = lerp(.25, .3, k);
    puppet(0, 0, 1, 1, spec, { arms: [near, far], holdNear: stickArt(lerp(450, 280, k), ang), head: -.12 * k,
      lean: lerp(.02, -.04, k), legs: [[lerp(.2, .1, k), lerp(.3, .15, k)], [lerp(-.12, -.05, k), lerp(.15, .05, k)]] });
  });
}

// ---------------- objects (drawn ~100 units across, facing +x along the ring) ----------------
const OB = [-130, -130, 130, 130];
const S_ORANGE = () => sprite('orange', ...OB, () => orange(0, 4, 46));
const S_CRADLE = () => sprite('cradle', ...OB, () => {
  cut(crescent(0, -6, 58, .32, Math.PI / 2), C.gold, { sh: .6, grain: .15 });
  cut(blob([[-26, -16], [10, -26], [40, -18], [44, -6], [-20, -4]], .6), C.cream, { sh: .4, grain: .1 });
  cut(circle(-30, -22, 13), C.ink, { sh: .3, grain: .1 });
  g.save(); g.fillStyle = C.creamDeep; for (let i = 0; i < 4; i++) g.fill(circle(-6 + i * 12, -10, 3.2)); g.restore();   // the doily blanket
});
// a paper bird in profile with a swept, curved wing (not a triangle): f = 1 wing up .. -1 wing down
function birdArt(f, col) {
  // a pointed sickle: convex leading edge out to the tip, concave trailing edge back to the root
  const wing = new Path2D(); wing.moveTo(14, -6);
  wing.quadraticCurveTo(4, -6 - 70 * f, -58, -8 - 84 * f);
  wing.quadraticCurveTo(-26, -6 - 34 * f, -24, -4); wing.closePath();
  if (f < 0) cut(wing, col, { sh: .4, grain: .12 });
  cut(poly([[-34, -4], [-84, -24], [-66, 2], [-86, 22], [-34, 8]]), col, { sh: .45, grain: .12 });
  cut(blob([[-46, 0], [-20, -14], [16, -14], [44, -6], [62, 0], [44, 6], [16, 14], [-20, 12]], .6), col, { sh: .5, grain: .14 });
  cut(poly([[58, -4], [76, 1], [58, 5]]), C.gold, { sh: .2, grain: 0 });
  if (f >= 0) cut(wing, col, { sh: .4, grain: .12 });
}
const S_BIRD = (fr) => sprite('bird' + fr, ...OB, () => birdArt([1, .45, -.35, .45][fr], C.cream));
const S_WALLET = () => sprite('wallet', ...OB, () => {
  cut(rrect(-50, -36, 100, 70, 12), C.red, { sh: .6, grain: .2 });
  cut(blob([[-50, -34], [50, -34], [50, -6], [10, 10], [-50, -2]], .3), PAL.redD, { sh: .45, grain: .2 });
  cut(circle(18, 2, 8), C.gold, { sh: .3, grain: .1 });
});
const S_SUNFLOWER = () => sprite('sunflower', ...OB, () => {
  const p = new Path2D(), n = 14;
  for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n, x = Math.cos(a) * 58, y = Math.sin(a) * 58;
    p.moveTo(x + Math.cos(a) * 38, y + Math.sin(a) * 38); p.ellipse(x, y, 40, 15, a, 0, Math.PI * 2); }
  cut(p, C.gold, { sh: .55, grain: .2 });
  const q = new Path2D();
  for (let i = 0; i < n; i++) { const a = Math.PI * 2 * (i + .5) / n, x = Math.cos(a) * 46, y = Math.sin(a) * 46;
    q.moveTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); q.ellipse(x, y, 28, 11, a, 0, Math.PI * 2); }
  cut(q, C.goldPale, { sh: .3, grain: .15 });
  cut(circle(0, 0, 34), PAL.brown, { sh: .4, grain: .25 });
});
// a crown house (gable), with two windows (drawn live so they can flash)
const S_HOUSE = (col) => sprite('house' + col, ...OB, () => cut(poly([[-46, 40], [-46, -30], [0, -76], [46, -30], [46, 40]]), col, { sh: .6, grain: .2 }));
const HOUSE_WIN = [[-30, -18, 22, 26], [8, -18, 22, 26], [-11, 14, 22, 26]];

// ---------------- the drawing helpers ----------------
function scallop(r, n, depth, rot = 0) {
  const p = new Path2D(); const N = n * 8;
  for (let i = 0; i <= N; i++) { const a = rot + i / N * Math.PI * 2; const rr = r * (1 - depth + depth * Math.abs(Math.cos(a * n / 2)));
    i ? p.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : p.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  p.closePath(); return p;
}
// a band of paper: full disc of radius r (screen px) at the centre
function band(r, col, n, depth, rot, lift = .3, sh = .9) {
  if (r < 2) return;
  g.setTransform(1, 0, 0, 1, CX, CY);
  cut(scallop(r, n, depth, rot), col, { sh, lift });
  g.setTransform(1, 0, 0, 1, 0, 0);
}
// a ring of sprites. at(i) -> { spr, k (pop scale), bob (units), rot (own), skip }
function ringOf(N, rot, radius, scale, at) {
  for (let i = 0; i < N; i++) {
    const o = at(i); if (!o || o.k <= .01) continue;
    g.setTransform(1, 0, 0, 1, CX, CY); g.rotate(rot + Math.PI * 2 * i / N); g.translate(0, -radius);
    g.scale(scale * o.k, scale * o.k);
    if (o.bob) g.translate(0, o.bob);
    if (o.spin) g.rotate(o.spin);
    if (o.flip) g.scale(-1, 1);
    blit(o.spr);
    if (o.after) o.after();
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
}
// arms-up envelope: raised on "big"/"reunion", held through the loud peak; ph staggers it round the ring
const UPW = [[T.big1 - .1, T.ru1 + 2.1], [T.come1 - .05, T.come1 + 1.3], [T.big2 - .1, T.ru2 + 2.0], [T.come2 - .1, T.come2 + .7],
  [T.in3 + .05, 265.75]];
const upEnv = (t, ph = 0) => { let u = 0; for (const [a, b] of UPW) u = Math.max(u, eo((t - a - ph) / .32) * (1 - ei((t - b - ph) / .4))); return u; };
// the crown's houses light up one after another round the ring, a beat at a time, through the held "come"
// (all lit by ~248.5: nobody's gotta say goodnight)
const LIT0 = B0 + Math.ceil(beatX(T.come1)) * P, LITN = 14;
const litAt = (i) => LIT0 + Math.floor(i * LITN / 40) * P;
const hop = (t, I = 1) => (hit(sinceBeat(t), .11) + .8 * hit(sinceBar(t), .14)) * I;

SHOT(T.a, T.end, 'reunion2', (t) => {
  const A0 = g.globalAlpha;
  const Z = Zc(t) * pulse(t);
  const hubR = lerp(118, HUBR, hubE(t));
  const loud = ss(T.in2, T.come2, t) * .5 + .5;

  // ---------------- the ground ----------------
  const grd = ramp(GROUND, t);
  sheet(grd);
  // the sunrise rays (tonal), arriving with the dawn and gone with the collapse
  const rays = ss(246.5, 251, t) * (1 - ss(266.7, 267.6, t));
  if (rays > 0) {
    g.save(); g.globalAlpha = A0 * rays * .5; g.translate(CX, CY); g.rotate(t * .03);
    const p = new Path2D(); const n = 28;
    for (let i = 0; i < n; i++) { const a0 = Math.PI * 2 * i / n, a1 = a0 + Math.PI / n; p.moveTo(0, 0); p.arc(0, 0, 1500, a0, a1); p.closePath(); }
    cut(p, mixc(grd, '#ffe7b0', .22), { sh: 0, grain: .15 });
    g.restore(); g.globalAlpha = A0;
  }
  // 15's stars, going out with the dawn
  const starsOn = 1 - ss(247, 251, t);
  if (starsOn > 0) for (let i = 0; i < 22; i++) {
    const a = hash(i * 3.7) * Math.PI * 2, r = 560 + hash(i * 5.3) * 560;
    const sx = CX + Math.cos(a) * r * 1.3, sy = CY + Math.sin(a) * r * .9;
    if (sx < 20 || sx > W - 20 || sy < 20 || sy > H - 20) continue;
    const tw = .7 + .3 * Math.sin(t * 2.3 + i * 1.9);
    g.globalAlpha = A0 * starsOn * .9; g.fillStyle = hash(i * 1.7) > .7 ? C.goldPale : C.cream;
    g.fill(star4(sx, sy, (hash(i * 7.1) > .75 ? 11 : 6) * tw));
  }
  g.globalAlpha = A0;
  // gold ripples off the medallion's rim on the downbeats (seen while the rim is in frame)
  const rim0 = rIn(0, t, hubR) * SPAN[0] * eT(0, t) * Z;
  const rip = ss(T.a + .8, T.a + 1.6, t) * (1 - ss(254, 255.5, t)) + ss(265.4, 266, t) * (1 - ss(266.6, 267.2, t));
  if (rip > 0 && rim0 > 10) for (let j = 0; j < 3; j++) {
    const x = barN(t) - j, d = t - (B0 + x * 4 * P), life = 2.2; if (d < 0 || d > life) continue;
    const k = d / life;
    g.save(); g.globalAlpha = A0 * rip * (1 - k) * .55; g.strokeStyle = C.gold; g.lineWidth = lerp(10, 2, k);
    g.beginPath(); g.arc(CX, CY, rim0 + 24 + k * 560, 0, Math.PI * 2); g.stroke(); g.restore();
  }

  // the waking world closes in: a grey sheet with a shrinking round hole, the sunrise left inside it
  const shut = eio((t - 266.75) / .85);
  if (shut > 0) {
    const hr = lerp(1250, 0, shut), p = new Path2D(); p.rect(-20, -20, W + 40, H + 40);
    if (hr > 1) { p.moveTo(CX + hr, CY); p.arc(CX, CY, hr, 0, Math.PI * 2, true); }
    cut(p, C.w0, { sh: 1, lift: .8, rule: 'evenodd' });
  }
  const dw = dawn(t);
  const rotP = (t - T.a) * .05;                    // people rings drift; object rings tick on the beat
  const tick = (every, n) => ratchet(t, every) * Math.PI * 2 / n;

  // ---------------- TIER 1 (night): crown of houses, friends + doctors, oranges + moon cradles ----------------
  if (eT(0, t) > 0) {
    const B = rIn(0, t, hubR) * Z, su = spinUp(0, t);
    // the crown: night houses round the rim, windows flashing on the downbeats
    const rot = -tick(4, 40) * .5 - su;
    band(B * 1.95, mixc(PAL.crown, PAL.crownD, dw), 40, .035, rot);
    const hs = .00145 * B;
    const flash = hit(sinceBar(t), .2), bar = barN(t);
    const hcol = mixc(PAL.house, PAL.houseD, dw);
    const S_H = S_HOUSE(hcol.slice(0, 7));
    g.save(); shadowOn(.8);
    ringOf(40, rot, B * 1.835, hs, (i) => ({ spr: S_H, k: pop(t, BORN[0][0] + .35 + i * .008, .35),
      after: () => { shadowOff(); for (let w = 0; w < 3; w++) { const [wx, wy, ww, wh] = HOUSE_WIN[w];
        const base = i % 5 === 0 && w !== 2;
        const lt = litAt(i), lit = base || t >= lt;
        if (!lit) { g.fillStyle = '#0b1029'; g.fillRect(wx, wy, ww, wh); continue; }
        const fresh = base ? 0 : hit(t - lt, .25);
        g.fillStyle = mixc(C.gold, '#fff6dc', Math.max(flash, fresh)); g.fillRect(wx, wy, ww, wh); }
        g.globalAlpha = A0; shadowOn(.8); } }));
    shadowOff(); g.restore();
    // friends and doctors, holding hands, standing out from the lavender band
    band(B * 1.72, mixc(PAL.lav, PAL.peach, dw), 36, .02, -rotP * .5, .4);
    const RF = RING.friends;
    g.save(); shadowOn();
    ringOf(RF.N, rotP + su * 1.3, B * RF.feet, RF.hk * B / 1000, (i) => {
      const ph = i / RF.N * .45;
      const lvl = Math.round(upEnv(t, ph) * 2);
      return { spr: friendSprite(i % 4, lvl), k: pop(t, 237.42 + ((i * 7) % RF.N) / RF.N * .45, .42),
        bob: -hop(t, loud) * 34 * (1 + lvl * .3) };
    });
    shadowOff(); g.restore();
    // oranges and moon cradles on the night band
    band(B * 1.235, mixc(PAL.night, PAL.mauve, dw), 30, .03, rot * .5, .5);
    g.save(); shadowOn(.8);
    const ob = .00108 * B, rock = Math.sin(beatX(t) * Math.PI) * .28;
    ringOf(24, -tick(2, 24) - su * 1.6, B * 1.118, ob, (i) => ({ spr: i % 2 ? S_ORANGE() : S_CRADLE(),
      k: pop(t, 237.3 + i * .015, .4), spin: i % 2 ? Math.PI / 2 + i : rock * (i % 4 ? 1 : -1) }));
    shadowOff(); g.restore();
  }

  // ---------------- TIER 2 (dawn): the musicians, birds and wallets ----------------
  if (eT(1, t) > 0) {
    const B = rIn(1, t, hubR) * Z, su = spinUp(1, t);
    band(B * 1.74, mixc(C.rose, '#f2b08f', ss(255, 262, t)), 30, .025, rotP * .4, .45);
    const RM = RING.mus;
    g.save(); shadowOn();
    ringOf(RM.N, -rotP * 1.2 - su * 1.3, B * RM.feet, RM.hk * B / 1000, (i) => {
      const mi = i % 3, cheer = upEnv(t, i / RM.N * .4) > .5 && (t > T.in3);
      const fr = cheer ? 2 : ((Math.floor(beatX(t) * (t > 252 ? 2 : 1)) + mi) % 2);
      return { spr: musSprite(mi, fr), k: pop(t, T.dream2 + .2 + ((i * 5) % RM.N) / RM.N * .5, .42), bob: -hop(t, loud) * 30 };
    });
    shadowOff(); g.restore();
    band(B * 1.25, mixc('#5b4588', '#7a4c86', dw), 26, .03, -rotP, .5);
    g.save(); shadowOn(.8);
    const ob = .00122 * B, fr = Math.floor(beatX(t) * 2) % 4;
    ringOf(26, tick(2, 26) + rotP * .6 + su * 1.6, B * 1.125, ob, (i) => ({ spr: i % 2 ? S_WALLET() : S_BIRD((fr + i) % 4),
      k: pop(t, T.dream2 + i * .014, .4), spin: i % 2 ? Math.PI / 2 : 0 }));
    shadowOff(); g.restore();
  }

  // ---------------- TIER 3 (sunrise): the hockey kids, sunflowers ----------------
  if (eT(2, t) > 0) {
    const B = rIn(2, t, hubR) * Z, su = spinUp(2, t);
    band(B * 1.95, C.goldPale, 28, .025, -rotP * .4, .45);
    const RK = RING.kids;
    g.save(); shadowOn();
    ringOf(RK.N, rotP * 1.4 + su * 1.3, B * RK.feet, RK.hk * B / 1000, (i) => {
      const up = eo((t - T.theres3 - (i >> 1) / (RK.N / 2) * .35) / .3) * (1 - .5 * bump(t, T.big3 - .05, .4));
      return { spr: kidSprite(i % 4, Math.round(up * 2)), k: pop(t, 260.95 + (((i >> 1) * 5) % (RK.N / 2)) / (RK.N / 2) * .3, .42),
        bob: -hop(t) * 40, flip: i % 2 === 1 };
    });
    shadowOff(); g.restore();
    band(B * 1.245, C.leaf, 24, .03, rotP, .5);
    g.save(); shadowOn(.8);
    const ob = .00112 * B, flash = hit(sinceBar(t), .22), bl = 1 + .1 * hit(sinceBar(t), .25);
    ringOf(20, -tick(4, 20) - su * 1.6, B * 1.122, ob, (i) => ({ spr: S_SUNFLOWER(), k: pop(t, T.dream3 + i * .02, .45) * bl, spin: t * .4 + i,
      after: () => { if (flash > .02) { shadowOff(); g.globalAlpha = A0 * flash; g.fillStyle = (barN(t) + i) % 2 ? C.orange : C.goldPale;
        g.fill(circle(0, 0, 30)); g.globalAlpha = A0; shadowOn(.8); } } }));
    shadowOff(); g.restore();
  }

  // ---------------- the hub: her navy family, heads in round the sun ----------------
  const hE = hubE(t);
  if (hE > .001) {
    const hr = hubR * Z;
    band(hr, C.cream, 30, .03, -rotP * .6, .5, 1);
    // family, live puppets (8): feet on the hub's rim, heads to the sun
    const fold = ss(266.85, 267.35, t);
    if (fold < 1) {
      const N = 12, s = .2, F = (HUBR - 14);
      if (!familyRing.poses) familyRing.poses = solveChain(FAMILY, N, F, -1, s);
      const rot = rotP * -.8 - spinUp(2, t) * 1.5;
      g.save();
      for (let i = 0; i < N; i++) {
        const pk = pop(t, T.her1 + .05 + i * .03, .42) * (1 - fold); if (pk <= .01) continue;
        const spec = FAMILY[i % 4], pz = familyRing.poses[i];
        const up = upEnv(t, i / N * .3);
        g.setTransform(1, 0, 0, 1, CX, CY); g.scale(hr / HUBR, hr / HUBR);
        g.rotate(rot + Math.PI * 2 * i / N); g.translate(0, -F); g.scale(1, -1); g.scale(pk, pk);
        const sway = Math.sin(beatX(t) * Math.PI) * .14;
        puppet(0, 0, s, 1, spec, { arms: [lerpArm(pz.joined[0], pz.up[0], up), lerpArm(pz.joined[1], pz.up[1], up)],
          bob: -hop(t, loud) * 30, head: -.05 * up, legs: [[sway, Math.max(0, sway) * .6], [-sway, Math.max(0, -sway) * .6]] });
      }
      g.restore(); g.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  // ---------------- the sun with her profile (the iris match from 15). It becomes 17's lamp. ----------------
  {
    const sunK = pop(t, T.a - .1, .5);
    let big = 0; for (const b of BIGS) big = Math.max(big, bump(t, b - .05, .7));
    const fly = eio((t - 267.15) / .85);                         // to the lamp
    const pz = 1 + .03 * hit(sinceBeat(t)) + .09 * big;
    const sz = Zc(t) * pulse(t) * pz * sunK;
    const rS = lerp(96 * sz, LAMP.rx, fly);
    const x = lerp(CX, LAMP.x, fly), y = lerp(CY, LAMP.y, fly);
    const flat = lerp(1, LAMP.ry / LAMP.rx, ss(267.9, 268.4, t));
    const eK = 1 - ss(267.0, 267.5, t);                          // the gold ring folds into the sun
    g.setTransform(1, 0, 0, 1, x, y);
    if (eK > .01) cut(circle(0, 0, lerp(96 * sz, 118 * sz, eK)), C.gold, { sh: .8, lift: .3, alpha: eK });
    const warm = ss(266.9, 267.9, t);
    if (flat < .999) cut(ellipse(0, 0, rS, rS * flat), mixc(C.sun, C.lamp, warm), { sh: 0, grain: .1 });
    else cut(circle(0, 0, rS), mixc(C.sun, C.lamp, warm), { sh: .6 * (1 - fly), grain: .2 });
    const camK = 1 - ss(266.75, 267.3, t);                       // she lowers her head out of the sun (back to sleep)
    if (camK > 0) {
      g.save(); g.clip(circle(0, 0, rS - 1));
      let up = 0; for (const r of RU) up = Math.max(up, bump(t, r - .1, 1.6));
      g.scale(sz, sz); g.translate(-6, 30 + 130 * ei(1 - camK)); g.rotate(-.12 * up + .3 * (1 - camK)); g.scale(.155, .155); g.translate(-540, -600);
      cut(HEADS.her, C.navy, { sh: .4, grain: .2 });
      g.restore();
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    // the lamp's glow, arriving as the medallion is gone (17's veil glow: r 300, .6)
    const glow = ss(267.4, 268.4, t);
    if (glow > 0) {
      g.save(); g.globalAlpha = A0 * glow * .6;
      const gr = g.createRadialGradient(x, y, 10, x, y, 300);
      gr.addColorStop(0, 'rgba(243,217,160,.75)'); gr.addColorStop(1, 'rgba(243,217,160,0)');
      g.fillStyle = gr; g.fill(circle(x, y, 300)); g.restore();
    }
  }

  // gold laugh rings from the sun's rim on each "reunion" (the chorus' joy), bigger on the last
  RU.forEach((r, n) => { for (let j = 0; j < 3; j++) {
    const d = t - r - j * .16, life = 2.2; if (d < 0 || d > life) continue;
    const k = d / life, sc = n === 2 ? 1.4 : 1;
    g.save(); g.globalAlpha = A0 * (1 - k) * .9; g.strokeStyle = j % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(18, 3, k) * sc;
    g.beginPath(); g.arc(CX, CY, (124 + eo(k) * 760 * sc) * Z, 0, Math.PI * 2); g.stroke(); g.restore();
  } });
}, { xin: 1.1, tr: 'iris' });
function familyRing() {}
})();
