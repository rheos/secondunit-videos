// 18.5-31.5 "In her dream the kids are laughing and crowded around the table".
// The SAME table as 01, now in dream paper. On "dream" the bills fold into paper birds and fly off and she
// lifts her head; the cloth unrolls to the floor in scallops; the camera pulls back along the table.
// "kids": her three pop up behind the table like toy-theatre flats. "laughing": heads tip back in a ripple,
// each throwing small gold rings. "crowded": more kids in other colours squeeze in from both sides until
// the row is shoulder to shoulder. "table": everyone slaps the table, a gold ring runs along it.
(() => {
// ---------- shared set geometry (copied from 01-kitchen.js; keep the two in step) ----------
const S = .78;                 // puppet scale
const FLOOR = 1000;
const HX = 700, HY = FLOOR - 270 * S;        // her hip pivot (seated)
const TY = 738, TB = 72;       // table front edge, depth of the top band (naive perspective)
const TX0 = 796, TX1 = 2600;   // table runs out of frame on the right
const LX = 1000, LSY = 236;    // lamp: x, shade top
const HALO = { x: 985, y: 492, r: 300 };
// beats of the band (no_vocals stem), used for hand moves
const BEAT = (n) => 2.28 + n * .3935;
const BEAT_ = BEAT;

// ---------- small local helpers ----------
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => { k = clamp(k); const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
const keys = (t, ks) => {             // piecewise eased keyframes: ks = [[t, value], ...] (value: number or array)
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) {
    const [t0, a] = ks[i - 1], [t1, b] = ks[i]; const e = eio((t - t0) / (t1 - t0));
    return Array.isArray(a) ? a.map((v, j) => Array.isArray(v) ? v.map((w, q) => lerp(w, b[j][q], e)) : lerp(v, b[j], e)) : lerp(a, b, e);
  }
  return ks[ks.length - 1][1];
};

// her seated body, in hip-local units (hips at 0,0; puppet units, y up is negative)
const BODICE = blob([[0, -806], [-24, -804], [-50, -790], [-62, -768], [-64, -730], [-62, -680], [-52, -620], [-46, -580],
  [-60, -540], [-48, -510], [36, -510], [56, -545], [44, -580], [52, -630], [70, -676], [68, -712], [56, -750], [40, -784], [22, -804]]
  .map(([x, y]) => [x, y + 540]), .45);
const LAP = blob([[-52, -74], [10, -78], [70, -58], [160, -44], [262, -40], [300, -6], [304, 80], [300, 158], [262, 168], [214, 162],
  [150, 96], [60, 64], [-30, 54], [-60, 18]], .5);
function sitter(x, y, s, col, p, layer) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (layer !== 'front') {
    g.save(); g.translate(-8, 0); leg(1.5, 1.42, col, null, false); g.restore();
    g.save(); g.translate(8, 0); leg(1.56, 1.5, col, null, false); g.restore();
    if (!p.farFront) { g.save(); g.rotate(p.lean); g.translate(-8, -212); arm(p.far[0], p.far[1], col, p.holdFar); g.restore(); }
    cut(LAP, col, { sh: .6, grain: .26, lift: .2 });
    g.save(); g.rotate(p.lean); cut(BODICE, col, { sh: .6, grain: .26, lift: .2 }); if (p.age) oldBack(col, 540, p.age); g.restore();
  }
  if (layer !== 'back') {
    g.save(); g.rotate(p.lean);
    if (p.farFront) { g.save(); g.translate(-8, -212); arm(p.far[0], p.far[1], col, p.holdFar); g.restore(); }
    g.save(); g.translate(10, -250); if (p.age) oldNeck(p.age); head('her', null, col, .265, p.head || 0, 0, p.age || 0); g.restore();
    g.translate(8, -212); arm(p.near[0], p.near[1], col, p.holdNear);
    g.restore();
  }
  g.restore();
}
// a chair seen from the side (she sits on it facing right)
function chair(col) {
  const x = HX, y = HY + 22;
  cut(cutRect(x - 96, y - 250, 18, 250 + FLOOR - y, 41, 1.5), col, { sh: .6 });          // back post to the floor
  cut(cutRect(x - 96, y - 250, 60, 16, 42, 1.5), col, { sh: .5 });                      // top rail
  cut(cutRect(x - 96, y - 150, 50, 12, 43, 1.5), col, { sh: .5 });
  cut(cutRect(x + 70, y, 16, FLOOR - y, 44, 1.5), col, { sh: .6 });                      // front leg
  cut(cutRect(x - 100, y - 8, 190, 18, 45, 1.5), col, { sh: .7 });                      // seat
}
// one bill: a small pale sheet with grey lines (no readable text)
function bill(w, h, col, line) {
  cut(cutRect(-w / 2, -h / 2, w, h, w * 3.1, 1.2), col, { sh: .45, grain: .12 });
  g.save(); g.strokeStyle = line; g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-w / 2 + 8, -h / 2 + 10 + i * 8); g.lineTo(-w / 2 + 8 + (w - 16) * (i === 2 ? .5 : .85), -h / 2 + 10 + i * 8); g.stroke(); }
  g.beginPath(); g.moveTo(w / 2 - 22, h / 2 - 9); g.lineTo(w / 2 - 8, h / 2 - 9); g.stroke();
  g.restore();
}
// the child's drawing pinned to the wall: a sun and four figures (her and three kids), in crayon strokes
function drawing(x, y, paper, ink, sun) {
  cut(cutRect(x, y, 118, 146, 61, 2), paper, { sh: .6, grain: .2 });
  cut(circle(x + 59, y + 6, 5), ink, { sh: .3, grain: 0 });
  g.save(); g.lineCap = 'round'; g.strokeStyle = sun; g.lineWidth = 4;
  g.beginPath(); g.arc(x + 82, y + 38, 14, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(x + 82 + Math.cos(a) * 20, y + 38 + Math.sin(a) * 20); g.lineTo(x + 82 + Math.cos(a) * 27, y + 38 + Math.sin(a) * 27); g.stroke(); }
  g.strokeStyle = ink; g.lineWidth = 3.4;
  g.beginPath(); g.moveTo(x + 10, y + 126); g.lineTo(x + 108, y + 124); g.stroke();
  [[24, 52], [48, 36], [66, 30], [84, 22]].forEach(([fx0, h]) => { const fx = x + fx0;
    g.beginPath(); g.moveTo(fx - 7, y + 124); g.lineTo(fx, y + 124 - h); g.lineTo(fx + 7, y + 124); g.stroke();
    g.beginPath(); g.arc(fx, y + 124 - h - 6, 5.5, 0, Math.PI * 2); g.stroke();
  });
  g.restore();
}
// the wall, the floor, the window with its moon, the drawing; d = 0 waking, 1 dream
function room(d) {
  const wall = d ? C.rose : C.w2, floor = d ? C.roseDeep : C.w1;
  g.save(); g.fillStyle = wall; g.fillRect(-3000, -3000, 9000, 9000); g.restore();
  cut(cutRect(-3000, FLOOR, 9000, 2000, 5, 3), floor, { sh: .5 });
  cut(cutRect(-3000, FLOOR - 16, 9000, 18, 6, 2), d ? C.roseDark : C.w1, { sh: .4, grain: .15 });
  // window: night panes, a moon, a cross of mullions, a sill
  const wx = 110, wy = 130, ww = 290, wh = 370;
  cut(cutRect(wx - 24, wy - 24, ww + 48, wh + 48, 21, 2), d ? C.cream : C.w3, { sh: .8, lift: .2 });
  cut(cutRect(wx, wy, ww, wh, 22, 1.5), d ? C.sky0 : C.w0, { sh: 0, grain: .3 });
  g.save(); g.clip(rect(wx, wy, ww, wh));
  cut(crescent(wx + 214, wy + 96, 40, .3, -.35), d ? C.gold : C.w4, { sh: .3, grain: .15 });
  for (let i = 0; i < 5; i++) cut(star4(wx + 40 + hash(i * 3.7) * 250, wy + 30 + hash(i * 8.1) * 330, 5 + hash(i) * 4), d ? C.goldPale : C.w3, { sh: 0, grain: 0 });
  g.restore();
  const fr = d ? C.cream : C.w3;
  cut(rect(wx + ww / 2 - 8, wy, 16, wh), fr, { sh: .5, grain: .12 });
  cut(rect(wx, wy + wh * .42 - 8, ww, 16), fr, { sh: .5, grain: .12 });
  cut(cutRect(wx - 40, wy + wh + 18, ww + 80, 22, 23, 2), fr, { sh: .7, lift: .2 });
  drawing(486, 214, d ? C.cream : C.w4, d ? C.roseDark : C.w2, d ? C.gold : C.w2);
}
// ---------- 02 ----------
function handAt(lean, sh, el) {
  const x = 8 + Math.sin(sh) * 168 + Math.sin(sh + el) * 182, y = -212 + Math.cos(sh) * 168 + Math.cos(sh + el) * 182;
  return [HX + (x * Math.cos(lean) - y * Math.sin(lean)) * S, HY + (x * Math.sin(lean) + y * Math.cos(lean)) * S];
}
const pileA = handAt(.12, 1.06, .62), pileB = handAt(.3, 1.42, .24);
const BW = 96, BH = 68;
function billHard(w, h, col, line, sh = 1) {
  const p = cutRect(-w / 2, -h / 2, w, h, w * 3.1, 1.2);
  if (sh > 0) { g.save(); g.translate(4, 5); g.fillStyle = `rgba(20,16,30,${.34 * sh})`; g.fill(p); g.restore(); }
  cut(p, col, { sh: .3, grain: .12 });
  g.save(); g.strokeStyle = line; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const y = -h / 2 + 12 + i * 11; g.beginPath(); g.moveTo(-w / 2 + 10, y); g.lineTo(-w / 2 + 10 + (w - 20) * (i === 3 ? .45 : i === 0 ? .6 : .85), y); g.stroke(); }
  g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2 - 30, h / 2 - 12); g.lineTo(w / 2 - 10, h / 2 - 12); g.stroke();
  g.restore();
}
// her doze pose at the end of 01 (see out/d2/notes/doze-pose.md)
const DOZE = { lean: .66, head: -.85, near: [2.0, 3.15], far: [2.2, 2.9 - Math.PI * 2] };
// the six bills exactly where 01 left them: [x, y, rot]
const BILLS = [[pileA[0] - 14, TY - 22, .05], [pileA[0] - 6, TY - 27, -.07], [pileB[0] + 30, TY - 30, .04],
  [pileB[0] + 30, TY - 34, (hash(4) - .5) * .2], [pileB[0] + 34, TY - 37, (hash(5) - .5) * .2], [pileA[0] + 86, TY - 16, .1]];

const W_ = (w, n = 0) => wordAt(w, n, 18);
const T = { dream: W_('dream'), kids: W_('kids'), laughing: W_('laughing'), crowded: W_('crowded'), around: W_('around'), table: W_('table') };
// 18.5 bills -> birds on "dream", she lifts her head; "kids" her three pop up; "laughing" a ripple of heads;
// "crowded" more kids squeeze in from both sides; "table" everyone slaps the table.

// a scalloped dream tablecloth with a row of punched lace holes above the hem
// swag 0..1: the corner at her end is drawn up like a theatre curtain, so her knees and shins show
function scallopCloth(x0, x1, y, drop, col, swag = 0) {
  const r = 22, p = new Path2D(), lowest = y + drop, top = y + 98;
  const hem = (x) => lowest - swag * Math.max(0, lowest - top) * Math.pow(Math.max(0, 1 - (x - x0) / 430), 1.6);
  p.moveTo(x0, y); p.lineTo(x1, y); p.lineTo(x1, hem(x1));
  for (let x = x1; x > x0 + 1; x -= 2 * r) { const xm = x - r, xa = x - 2 * r; const ya = hem(x), yb = hem(Math.max(x0, xa)), ym = hem(xm);
    p.quadraticCurveTo(xm, ym + r * 1.9, Math.max(x0, xa), yb); }
  p.lineTo(x0, y); p.closePath();
  if (drop > 70) for (let x = x0 + r; x < x1; x += 2 * r) { const hy = hem(x) - 22; p.moveTo(x + 6, hy); p.arc(x, hy, 6, 0, Math.PI * 2); }
  cut(p, col, { sh: .8, lift: .3, rule: 'evenodd' });
}
// an origami bird (the bills fold into these): a long folded body, two triangle wings that flap
function paperBird(x, y, s, ph, col, under) {
  const f = Math.sin(ph);
  g.save(); g.translate(x, y); g.scale(s, s);
  cut(poly([[-6, -2], [22, -2], [4, -2 + 44 * f * .8 - 6]]), under, { sh: .4, grain: .1 });          // far wing
  cut(poly([[-46, -10], [-8, 4], [30, 2], [52, -14], [40, 6], [-4, 12]]), col, { sh: .6, grain: .15 }); // body, tail, head
  cut(poly([[-10, -2], [20, -2], [0, -2 - 50 * f - 4]]), col, { sh: .5, grain: .15 });               // near wing
  g.restore();
}
// the kids: [spec, final x, facing, pop time, entry] ; entry: 'pop' rises from behind the table,
// 'R' slides in along the slot from the right, 'L' rises behind her chair
const KF = FLOOR - 36;   // they stand behind the table
const KA = '#c96c3f', KB = '#cf9324';   // the friends' kids: two tints of one warm family (the fruit stays the only true orange)
const KIDS = [
  { spec: CAST.girl11, x0: 1150, x: 1012, dir: -1, at: T.kids, entry: 'pop' },
  { spec: CAST.boy8, x0: 1372, x: 1140, dir: -1, at: T.kids + .22, entry: 'pop' },
  { spec: CAST.girl3, x0: 1590, x: 1262, dir: -1, at: T.kids + .44, entry: 'pop', lift: 118 },
  { spec: { col: KA, kind: 'shirt', head: 'child', hair: 'curls', height: .66, headK: .3 }, x: 1376, dir: -1, at: T.crowded + .05, entry: 'R' },
  { spec: { col: KB, kind: 'dressShort', head: 'child', hair: 'bob', height: .72, headK: .3 }, x: 1470, dir: -1, at: T.crowded + .2, entry: 'R' },
  { spec: { col: KA, kind: 'shirt', head: 'child', hair: 'cap', height: .6, headK: .31 }, x: 1560, dir: -1, at: T.crowded + .35, entry: 'R', lift: 30 },
  { spec: { col: KB, kind: 'dressShort', head: 'child', hair: 'pony', height: .7, headK: .3 }, x: 1652, dir: -1, at: T.crowded + .5, entry: 'R' },
  { spec: { col: KA, kind: 'shirt', head: 'child', hair: null, height: .64, headK: .31 }, x: 1744, dir: -1, at: T.crowded + .65, entry: 'R' },
  { spec: { col: KB, kind: 'dressShort', head: 'child', hair: 'pigtail', height: .58, headK: .36 }, x: 1830, dir: -1, at: T.crowded + .8, entry: 'R', lift: 40 },
  { spec: { col: KA, kind: 'dressShort', head: 'child', hair: 'bob', height: .62, headK: .32 }, x: 560, dir: 1, at: T.crowded + .3, entry: 'L', floor: FLOOR - 4 },
];

KIDS.forEach((kd) => {
  const h = kd.spec.height, sh = (kd.floor || KF) - (kd.lift || 0) - 752 * h * S, len = 330 * h * S;
  kd.reach = kd.entry === 'L' ? .3 : Math.acos(clamp((TY - TB * .5 - sh) / len, -1, 1)) * .85;
});

// thick deep-gold laugh rings (they read on the cream halo); same motion as kit laughRings
const DG = '#d38a1c';
function rings(t, x, y, at, { n = 3, dir = -.35, spread = .7, reach = 300, life = 1.6, w0 = 14 } = {}) {
  for (let r = 0; r < n; r++) {
    const d = t - at - r * .14; if (d < 0 || d > life) continue;
    const k = d / life;
    g.save(); g.translate(x, y); g.rotate(dir);
    g.globalAlpha *= (1 - k * k); g.strokeStyle = r % 2 ? C.gold : DG; g.lineWidth = lerp(w0, 4, k); g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, 18 + k * reach, -spread, spread); g.stroke();
    g.restore();
  }
}
// where each figure sits along the row, for the laugh ripple (her first, then outward)
const ROW = [1, 2, 3, 4, 5, 6, 7, 8, 9, .5];
const HALF = .3935 / 2;
const tipAt = (t, idx) => { const t0 = T.laughing + idx * HALF; return bump(t, t0, .5) + .8 * bump(t, t0 + .787, .5); };
// raised over .3 s, held through the crane into 03 (their hands come back down there, carrying the dishes)
const cheerK = (t, d = 0) => eio(ss(T.table - .3 + d, T.table + d, t));

SHOT(18.5, 31.5, 'table', (t) => {
  const A0 = g.globalAlpha;
  // camera: holds on 01's last frame, pulls back to the whole table, then at the end cranes in onto the
  // table top so the cloth band lands exactly where 03's still life sits
  const cz = eio(ss(20.4, 25.2, t));
  const cr = eio(ss(30.95, 32.0, t));
  const Z = lerp(lerp(1.13, .98, cz), 2.29, cr), FX = lerp(lerp(900, 1010, cz), 1250, cr), FY = lerp(lerp(585, 545, cz), 551, cr);
  g.save(); g.translate(W / 2, H / 2); g.scale(Z, Z); g.translate(-FX, -FY);

  room(1);
  // the sun halo (01's lamp), drifting to sit over the whole table
  const hk = eio(ss(20.6, 25.4, t));
  const hxk = lerp(HALO.x, 1120, hk), hyk = lerp(HALO.y, 470, hk), hr = lerp(HALO.r, 336, hk) + Math.sin(t * .5) * 3;
  const thump = bump(t, T.table, .5) * 10;
  cut(circle(hxk, hyk, hr + 28 + thump), C.goldPale, { sh: .5, grain: .25 });
  cut(circle(hxk, hyk, hr + thump * .6), C.sun, { sh: .6, grain: .25 });
  // the pendant lamp stays where it hung in 01, now dream paper, inside the sun
  g.save(); g.translate(LX, -60); g.rotate(Math.sin(t * .9) * .012); g.translate(-LX, 60);
  cut(cutRect(LX - 3, -200, 6, LSY + 200, 31, .8), C.roseDark, { sh: .4, grain: 0 });
  cut(poly([[LX - 32, LSY], [LX + 32, LSY], [LX + 100, LSY + 76], [LX - 100, LSY + 76]]), C.roseDark, { sh: .9, lift: .4 });
  cut(ellipse(LX, LSY + 78, 34, 14), C.lamp, { sh: 0, grain: .1 });
  g.restore();

  // the cup's steam: behind the figures (drawn before them), the cup itself sits on the table later
  const jump = bump(t, T.table, .32) * 18;
  const steamK = ss(T.dream + .6, T.dream + 2, t);
  if (steamK > 0) for (let i = 0; i < 2; i++) {
    const pts = []; for (let j = 0; j <= 10; j++) { const u = j / 10; pts.push([1300 + i * 14 - 6 + Math.sin(u * 5 + t * 2.2 + i * 2) * 10, TY - 84 - jump - u * 110 * steamK]); }
    g.save(); g.globalAlpha *= steamK * .85; cut(ribbonAlong(pts, 12), C.white, { sh: .3, grain: .1 }); g.restore();
  }

  // ---- her: she lifts her head from the doze on "dream" ----
  const up = ss(T.dream - .1, T.dream + 1.1, t);
  const breath = Math.sin((t - 10.2) * Math.PI * 2 / 4.2) * .014 * (1 - up);
  const lk = ss(T.laughing - .1, T.laughing + .3, t);
  const lb = lk * Math.abs(Math.sin((t - T.laughing) * 7.6)) * (1 - ss(T.table + .6, T.table + 1.4, t) * .6);
  const tipH = tipAt(t, 0), cu = cheerK(t);
  let lean = lerp(DOZE.lean + breath, .06, up) - lb * .03 - tipH * .05 - cu * .05;
  let headA = lerp(DOZE.head - breath * 1.1, .02, up) + lk * .12 + lb * .08 + tipH * .3 + cu * .32;
  let near = [lerp(DOZE.near[0] - breath * .9, 1.02, up), lerp(DOZE.near[1], .62, up)];
  let far = [lerp(DOZE.far[0] - breath * .9, .98, up), lerp(DOZE.far[1], .6, up)];
  near = [lerp(near[0], 2.92, cu), lerp(near[1], .14, cu)]; far = [lerp(far[0], 2.7, cu), lerp(far[1], .24, cu)];
  const farFront = up < .55;

  // kids behind her chair and behind the table (drawn before the table top hides their lower halves)
  const packK = ss(T.crowded - .1, T.crowded + .9, t);
  const kidPose = (i, kd) => {
    const la = ss(T.laughing + .14 * (i + 1) - .1, T.laughing + .14 * (i + 1) + .25, t);
    const ph = t * 7.4 + i * 1.3;
    const bobv = Math.abs(Math.sin(ph)) * la * .6;
    const tip = tipAt(t, ROW[i]);
    const c = cheerK(t, i * .03);
    const swayK = bump(t, T.around - .1, 1.4) * Math.sin((t - T.around) * 5.2);
    const rest = [[.32, .3], [.22, .24]];
    return {
      head: .03 + la * .08 + tip * .34 + c * .22 + (hash(i * 3) - .5) * .06, laugh: la * .5 + tip * .5, bob: -bobv * 10 - tip * 8,
      lean: -.03 * la - tip * .03 + swayK * .05 * kd.dir,
      arms: [[lerp(rest[0][0], 2.95, c), lerp(rest[0][1], .12, c)], [lerp(rest[1][0], 2.78, c), lerp(rest[1][1], .2, c)]],
    };
  };
  const drawKid = (kd, i) => {
    if (t < kd.at - .05) return null;
    const s = S, k = (t - kd.at);
    let x = kd.x, y = (kd.floor || KF) - (kd.lift || 0);
    if (kd.entry === 'pop') { x = lerp(kd.x0, kd.x, packK); y += (1 - back(k / .5)) * 420; }
    else if (kd.entry === 'R') { const e = eo(k / .75); x = lerp(2250, kd.x, e); y -= Math.abs(Math.sin(k * 11)) * 16 * (1 - e); }
    else if (kd.entry === 'L') { const e = eo(k / .75); x = lerp(-320, kd.x, e); y -= Math.abs(Math.sin(k * 11)) * 16 * (1 - e); }
    const pose = kidPose(i, kd);
    if (kd.entry === 'L') { const hk = ss(kd.at + .6, kd.at + 1.1, t); const c = cheerK(t, .06);
      pose.arms = [[lerp(.2, 1.42, hk), lerp(.1, .55, hk)], [lerp(.1, 2.8, c), lerp(.15, .2, c)]]; }
    puppet(x, y, s, kd.dir, kd.spec, pose);
    return [x, y, pose];
  };
  g.save(); g.clip(rect(-3000, -3000, 9000, 3000 + FLOOR - 8));
  const placed = KIDS.map((kd, i) => kd.entry === 'L' ? null : drawKid(kd, i));
  g.restore();
  const placedL = drawKid(KIDS[KIDS.length - 1], KIDS.length - 1);
  placed[KIDS.length - 1] = placedL;
  cane(HX, HY + 22, C.creamDeep, AGE_KITCHEN(t));
  chair(C.navy);

  sitter(HX, HY, S, C.navy, { lean, head: headA, near, far, age: AGE_KITCHEN(t), farFront }, 'back');

  // the table: the top band and the cloth, which unrolls toward the floor in scallops; the corner at her
  // end is drawn up like a theatre curtain so her knees and shins stay in view
  const unroll = eo(ss(BEAT_(42.6), BEAT_(45), t));
  cut(cutRect(TX0 + 40, TY, 30, FLOOR - TY, 51), C.roseDark, { sh: .5 });
  cut(poly([[TX0 + 30, TY - TB], [TX1, TY - TB], [TX1, TY], [TX0, TY]]), C.creamDeep, { sh: .5, grain: .2 });
  if (t < BEAT_(42.6)) cut(cutRect(TX0 - 6, TY - 2, TX1 - TX0, 118, 52, 1.5), C.cream, { sh: .8, lift: .3 });
  else scallopCloth(TX0 - 6, TX1, TY - 2, lerp(118, FLOOR - TY - 6, unroll), C.cream, 1);

  cup(1300, TY - 26 - jump, 1.3, C.cream);
  // one orange arrives where the bills were (it comes back at the very end of the film)
  const oa = pop(t, BEAT_(53.1), .45);
  if (oa > 0) { g.save(); g.translate(pileA[0] + 30, TY - 38); g.scale(oa, oa); orange(0, 0, 24); g.restore(); }

  // the bills lift, fold into paper birds and fly off on "dream"
  BILLS.forEach(([bx, by, br], i) => {
    const t0 = T.dream + .05 + i * .16, d = t - t0;
    if (d < 0) { g.save(); g.translate(bx, by); g.rotate(br); g.scale(1, .42); billHard(BW, BH, C.white, C.creamDeep, .8); g.restore(); return; }
    const fold = ss(0, .35, d), fly = Math.max(0, d - .3);
    const x = bx + fly * (120 + i * 95) + fly * fly * 80, y = by - 30 * fold - fly * (360 - i * 28) - fly * fly * 70;
    if (y < -400) return;
    g.save(); g.translate(x, y);
    if (fold < 1) { g.save(); g.globalAlpha *= 1 - fold; g.rotate(br * (1 - fold)); g.scale(1 - fold * .4, lerp(.42, .9, fold)); billHard(BW, BH, C.white, C.creamDeep, .8 * (1 - fold)); g.restore(); }
    if (fold > 0) { g.globalAlpha *= fold; paperBird(0, 0, 1.1 * fold, t * 11 + i * 1.7, C.white, C.creamDeep); }
    g.restore();
  });

  // her near arm and head go over the table
  sitter(HX, HY, S, C.navy, { lean, head: headA, near, far, age: AGE_KITCHEN(t), farFront }, 'front');

  // laughter: deep gold rings from her, then from each kid as the ripple reaches them, on the beats
  if (t > T.laughing - .1) {
    const fx = HX + (Math.sin(lean) * 270 + 120) * S, fy = HY - Math.cos(lean) * 300 * S;
    for (const w of [T.laughing, T.laughing + .787, T.crowded + 1.0, T.table + .05]) rings(t, fx + 20, fy + 10, w, { n: 3, dir: -.5, reach: 300, life: 1.5, w0: 15 });
    placed.forEach((p, i) => {
      if (!p) return; const kd = KIDS[i]; const sc = S * kd.spec.height;
      // rings rise off the crown, tipped toward the way the kid faces
      const mx = p[0] + kd.dir * 30 * sc, my = p[1] + p[2].bob * sc - 1010 * sc;
      const a0 = -Math.PI / 2 + kd.dir * .35, t0 = T.laughing + ROW[i] * HALF;
      for (const w of [t0, t0 + .787, T.crowded + 1.1 + i * .09, T.table + .1 + i * .04]) rings(t, mx, my, w, { n: 2, dir: a0, spread: .6, reach: 160, life: 1.1, w0: 11 });
    });
  }
  // "table": a gold ring runs along the table top
  const sd = t - T.table;
  if (sd > 0 && sd < .9) { g.save(); g.clip(rect(TX0 + 30, TY - TB - 90, 3000, TB + 92)); g.globalAlpha *= (1 - sd / .9) * .9; g.strokeStyle = C.gold; g.lineWidth = lerp(12, 4, sd / .9); g.lineCap = 'round';
    g.beginPath(); g.ellipse(1300, TY - TB / 2, 60 + sd * 760, 12 + sd * 50, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.restore(); }

  g.restore();
});
})();
