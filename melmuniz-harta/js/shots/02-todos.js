// 02-todos (36.4 - 50.0): "muy cansada de atender / lo que todos quieren decirme / una y otra vez".
// The night kitchen continues from 01: her full navy puppet seated at the right end of the table, facing
// left, head down on her folded arms under the warm pendant lamp. Chores land on the beats, on the table
// and on her back (cups, a stack of plates, papers, a ringing phone; towels, a laundry basket, a box), and
// she sags under them. On "todos" a ring of profile heads in many colours pops up around her, all facing
// her; on "decirme" each one shoots an empty cream speech bubble at her. "una y otra vez": one bubble is
// stamped on "una", an identical copy on "otra", a third on "vez", then the copies keep stamping, faster and
// bigger, while the camera pushes in and the storm cloud comes down over the lot. Ends on her head boxed in
// by big close bubbles (03-harta2 cuts to her big close profile surrounded by bubbles).
(() => {
const T = { start: 36.4, muy: 36.69, cansada: 37.36, de: 38.27, atender: 38.65, lo: 40.05, todos: 40.68, quieren: 41.45,
  decirme: 42.07, una: 43.97, y: 44.698, otra: 45.13, vez: 45.54, end: 50.0 };
// band onsets (no_vocals stem) used for the back pile
const B = { b1: 37.91, b2: 39.10, b3: 39.47, b4: 39.85, b5: 40.24 };

// ---------- set geometry: copied from 01-bronca's kitchen block, keep the two in step ----------
// World units, one camera: g.translate(W/2, H/2); g.scale(KZ, KZ); g.translate(-KFX, -KFY) (01's fixed camera),
// which this section later pushes in on her head.
const KZ = 1.2, KFX = 803, KFY = 712.5;
const S = .78;
const FLOOR = 1000;
const HX = 700, HY = FLOOR - 270 * S;        // her hip pivot (seated), she faces RIGHT
const TY = 738, TB = 72;
const TX0 = 796, TX1 = 2600;
const LX = 1060, LSY = 330;
const WIN = { x: 110, y: 300, w: 300, h: 300 };
const KCOL = { wall: C.w2, floor: C.w1, table: C.w0, top: C.w4, cloth: C.w3, chair: C.w0, frame: C.w3, night: C.w0, moon: C.creamDeep };
const CL = { dark: '#4a4458', mid: '#5c566b', hi: '#6b6478' };

const BODICE = blob([[0, -806], [-24, -804], [-50, -790], [-62, -768], [-64, -730], [-62, -680], [-52, -620], [-46, -580],
  [-60, -540], [-48, -510], [36, -510], [56, -545], [44, -580], [52, -630], [70, -676], [68, -712], [56, -750], [40, -784], [22, -804]]
  .map(([x, y]) => [x, y + 540]), .45);
const LAP = blob([[-52, -74], [10, -78], [70, -58], [160, -44], [262, -40], [300, -6], [304, 80], [300, 158], [262, 168], [214, 162],
  [150, 96], [60, 64], [-30, 54], [-60, 18]], .5);
function sitter(p, layer) {
  const col = C.navy;
  g.save(); g.translate(HX, HY); g.scale(S, S);
  if (layer !== 'front') {
    g.save(); g.translate(-8, 0); leg(1.5, 1.42, col, null, false); g.restore();
    g.save(); g.translate(8, 0); leg(1.56, 1.5, col, null, false); g.restore();
    cut(LAP, col, { sh: .6, grain: .26, lift: .2 });
    g.save(); g.rotate(p.lean); cut(BODICE, col, { sh: .6, grain: .26, lift: .2 }); g.restore();
  }
  if (layer !== 'back') {
    g.save(); g.rotate(p.lean);
    g.save(); g.translate(-8, -212); arm(p.far[0], p.far[1], col); g.restore();
    g.save(); g.translate(10, -250); head('her', null, col, .265, p.head, 0); g.restore();
    g.translate(8, -212); arm(p.near[0], p.near[1], col);
    g.restore();
  }
  g.restore();
}
// a point in her leaned body frame (puppet units) -> world
function bodyPt(lean, px, py) {
  const c = Math.cos(lean), s = Math.sin(lean);
  return [HX + S * (px * c - py * s), HY + S * (px * s + py * c)];
}
function chair() {
  const x = HX, y = HY + 22, col = KCOL.chair;
  cut(cutRect(x - 96, y - 250, 18, 250 + FLOOR - y, 41, 1.5), col, { sh: .6 });
  cut(cutRect(x - 96, y - 250, 60, 16, 42, 1.5), col, { sh: .5 });
  cut(cutRect(x - 96, y - 150, 50, 12, 43, 1.5), col, { sh: .5 });
  cut(cutRect(x + 70, y, 16, FLOOR - y, 44, 1.5), col, { sh: .6 });
  cut(cutRect(x - 100, y - 8, 190, 18, 45, 1.5), col, { sh: .7 });
}
// the room as 01 leaves it: the moon drooped over (droop 1)
function room() {
  const droop = 1;
  g.save(); g.fillStyle = KCOL.wall; g.fillRect(-3000, -3000, 9000, 9000); g.restore();
  cut(cutRect(-3000, FLOOR, 9000, 2000, 5, 3), KCOL.floor, { sh: .5 });
  cut(cutRect(-3000, FLOOR - 16, 9000, 18, 6, 2), C.w0, { sh: .4, grain: .15 });
  const { x: wx, y: wy, w: ww, h: wh } = WIN;
  cut(cutRect(wx - 24, wy - 24, ww + 48, wh + 48, 21, 2), KCOL.frame, { sh: .8, lift: .2 });
  cut(cutRect(wx, wy, ww, wh, 22, 1.5), KCOL.night, { sh: 0, grain: .3 });
  g.save(); g.clip(rect(wx, wy, ww, wh));
  for (let i = 0; i < 6; i++) cut(star4(wx + 30 + hash(i * 3.7) * 250, wy + 30 + hash(i * 8.1) * 280, 5 + hash(i) * 4), C.w3, { sh: 0, grain: 0 });
  const mx = wx + ww * .75 + 4 - droop * 8, my = wy + 92 + droop * 78;
  cut(crescent(mx, my, 52, .25, lerp(.12, -1.25, droop)), KCOL.moon, { sh: .5, grain: .15, lift: .2 });
  g.restore();
  cut(rect(wx + ww / 2 - 8, wy, 16, wh), KCOL.frame, { sh: .5, grain: .12 });
  cut(cutRect(wx - 40, wy + wh + 18, ww + 80, 22, 23, 2), KCOL.frame, { sh: .7, lift: .2 });
}
function lamp(t, glow) {
  const A0 = g.globalAlpha, GY = LSY + 150;
  g.save(); g.globalAlpha = A0 * .5 * glow;
  const gr = g.createRadialGradient(LX, GY, 20, LX, GY, 340);
  gr.addColorStop(0, 'rgba(243,217,160,.85)'); gr.addColorStop(.55, 'rgba(243,217,160,.3)'); gr.addColorStop(1, 'rgba(243,217,160,0)');
  g.fillStyle = gr; g.fill(circle(LX, GY, 340)); g.restore();
  g.save();
  g.translate(LX, -60); g.rotate(Math.sin(t * .9) * .012); g.translate(-LX, 60);
  cut(cutRect(LX - 3, -200, 6, LSY + 200, 31, .8), C.w0, { sh: .4, grain: 0 });
  cut(poly([[LX - 32, LSY], [LX + 32, LSY], [LX + 100, LSY + 76], [LX - 100, LSY + 76]]), C.w0, { sh: .9, lift: .4 });
  cut(ellipse(LX, LSY + 78, 34, 14), C.lamp, { sh: 0, grain: .1 });
  g.restore();
  g.save(); g.globalAlpha = A0 * .24 * glow;
  const cg = g.createLinearGradient(0, LSY + 78, 0, TY);
  cg.addColorStop(0, 'rgba(243,217,160,.95)'); cg.addColorStop(1, 'rgba(243,217,160,.3)');
  g.fillStyle = cg; g.fill(poly([[LX - 92, LSY + 76], [LX + 92, LSY + 76], [LX + 300, TY], [LX - 300, TY - TB * .2]])); g.restore();
}
function kTable() {
  cut(cutRect(TX0 + 40, TY, 30, FLOOR - TY, 51), KCOL.table, { sh: .5 });
  cut(poly([[TX0 + 30, TY - TB], [TX1, TY - TB], [TX1, TY], [TX0, TY]]), KCOL.top, { sh: .5, grain: .2 });
  cut(cutRect(TX0 - 6, TY - 2, TX1 - TX0, 118, 52, 1.5), KCOL.cloth, { sh: .8, lift: .3 });
}

// ---------- chores ----------
// a drop: falls from above, lands ON t0, squashes once. Returns null before it starts.
function drop(t, t0, h = 340, dur = .2) {
  if (t < t0 - dur) return null;
  if (t < t0) { const k = (t - (t0 - dur)) / dur; return { dy: -h * (1 - k * k), sq: 1, a: clamp(k * 3) }; }
  const d = t - t0; const sq = 1 - .14 * bump(d, 0, .16) + .05 * bump(d, .16, .14);
  return { dy: 0, sq, a: 1 };
}
// draw at (x, y) = bottom-centre, squashed about the bottom
function atDrop(t, t0, x, y, rot, fn, h, dur) {
  const dr = drop(t, t0, h, dur); if (!dr) return;
  g.save(); g.globalAlpha *= dr.a; g.translate(x, y + dr.dy); g.rotate(rot); g.scale(2 - dr.sq, dr.sq); fn(); g.restore();
}
function cupShape(col) {
  cut(rrect(-24, -46, 48, 46, [4, 4, 12, 12]), col, { sh: .5 });
  g.save(); g.strokeStyle = col; g.lineWidth = 8; g.beginPath(); g.arc(-28, -24, 12, Math.PI - 1.3, Math.PI + 1.3); g.stroke(); g.restore();
}
function plates() {
  for (let i = 0; i < 7; i++) {
    const y = -12 - i * 15, x = (hash(i * 4.4) - .5) * 8;
    cut(ellipse(x, y, 74, 11), i % 2 ? C.w4 : C.white, { sh: .45, grain: .12 });
  }
}
function sheetPaper(w, h, seed) {
  cut(cutRect(-w / 2, -h, w, h, seed, 1.5), C.white, { sh: .45, grain: .12 });
  g.save(); g.strokeStyle = C.w3; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const y = -h + 14 + i * 12; g.beginPath(); g.moveTo(-w / 2 + 10, y); g.lineTo(-w / 2 + 10 + (w - 20) * (i === 3 ? .45 : .85), y); g.stroke(); }
  g.restore();
}
// an old desk phone: body, cradle, handset; it rings (jiggles on the frame) while ring > 0
function phone(t, ring) {
  const j = ring > 0 ? (Math.floor(t * 12) % 2 ? 1 : -1) * ring : 0;
  g.save(); g.rotate(j * .07); g.translate(0, -Math.abs(j) * 4);
  cut(blob([[-62, 0], [-54, -40], [-30, -56], [30, -56], [54, -40], [62, 0]], .5), C.w0, { sh: .6 });
  cut(circle(0, -30, 17), C.w3, { sh: .3, grain: .1 });
  cut(circle(0, -30, 6), C.w0, { sh: 0, grain: 0 });
  g.save(); g.translate(0, -66 - Math.abs(j) * 8); g.rotate(-j * .1);
  cut(blob([[-78, 6], [-70, -14], [-40, -12], [-30, -2], [30, -2], [40, -12], [70, -14], [78, 6], [44, 12], [32, 4], [-32, 4], [-44, 12]], .4), C.w0, { sh: .7, lift: .3 });
  g.restore();
  g.restore();
  if (ring > 0) {
    // the ringing: short warm strokes either side, on the frame
    g.save(); g.strokeStyle = C.lamp; g.lineCap = 'round'; g.lineWidth = 6; g.globalAlpha *= ring;
    const ph = Math.floor(t * 12) % 2;
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + sd * (.55 + i * .32), r0 = 92 + ph * 10, r1 = r0 + 26;
      g.beginPath(); g.moveTo(Math.cos(a) * r0, -50 + Math.sin(a) * r0); g.lineTo(Math.cos(a) * r1, -50 + Math.sin(a) * r1); g.stroke();
    }
    g.restore();
  }
}
function towels() {
  const cols = [C.cream, C.w4, C.cream];
  cols.forEach((c, i) => { cut(rrect(-74 + i * 3, -30 * (i + 1), 148, 30, 12), c, { sh: .45, grain: .15 });
    cut(rect(-74 + i * 3 + 22, -30 * (i + 1) + 4, 10, 22), C.w3, { sh: 0, grain: 0 }); });
}
function basket() {
  const p = poly([[-92, -86], [92, -86], [74, 0], [-74, 0]]);
  // clothes heaped over the rim
  cut(blob([[-84, -80], [-60, -122], [-10, -112], [30, -138], [76, -104], [88, -80]], .6), C.w4, { sh: .5, grain: .15 });
  cut(p, C.w3, { sh: .6 });
  g.save(); g.fillStyle = C.w1; for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) g.fill(rrect(-70 + i * 24 + r * 6, -68 + r * 30, 14, 16, 4)); g.restore();
  cut(rect(-96, -92, 192, 12), C.w3, { sh: .4, grain: .12 });
}
function box() {
  cut(cutRect(-70, -84, 140, 84, 71, 1.5), C.creamDeep, { sh: .55 });
  cut(rect(-70, -84, 140, 12), C.w4, { sh: .2, grain: .1 });
  cut(rect(-12, -84, 24, 84), C.w4, { sh: 0, grain: .1, alpha: .8 });
}
function books() {
  [[0, C.w1, 120], [1, C.w4, 104], [2, C.w0, 112]].forEach(([i, c, w]) =>
    cut(rrect(-w / 2 + (i - 1) * 6, -22 * (i + 1), w, 22, 4), c, { sh: .45, grain: .15 }));
}

// ---------- her pose through the section ----------
const BACKS = [B.b2, B.b3, B.b4, B.b5];
function herPose(t) {
  // she starts as 01 leaves her: head down on folded forearms. Every load on her back pushes her lower.
  let lean = .66, headA = -.85;
  BACKS.forEach((b, i) => { lean += .035 * ss(b - .02, b + .12, t); lean += .05 * bump(t, b, .22); });
  for (const w of [T.cansada, T.atender]) lean += .03 * bump(t, w, .3);
  // "todos": the heads pop up and she lifts her head off her arms to look at them
  const look = ss(T.todos + .05, T.todos + .45, t);
  headA = lerp(headA, .32, look);
  // each bubble that hits her makes her flinch; the stamps on "una / otra / vez" push her head down
  for (let i = 0; i < 7; i++) headA -= .09 * bump(t, T.decirme + i * .07 + .42, .3);
  for (const w of [T.una, T.otra, T.vez]) headA -= .16 * bump(t, w, .35);
  // as the copies keep coming, she shrinks down between her shoulders
  headA -= .22 * ss(46.0, 49.0, t); lean += .04 * ss(46.0, 49.0, t);
  // the same breath 01 ends on (phase and depth), so the seam is continuous
  const br = Math.sin((t - (34.99 + .95)) * Math.PI * 2 / 3.6) * .014;
  lean += br; headA -= br * 1.1;
  return { lean, head: headA, near: [2.0 - br * .9, 3.15], far: [2.2 - br * .9, 2.9 - Math.PI * 2] };
}

// ---------- the chatterers ----------
// head art units: neck pivot at (580, 800), facing right. A bust with shoulders, cut like a cameo.
const BUST = blob([[620, 720], [700, 760], [740, 860], [860, 900], [960, 980], [990, 1110], [180, 1110], [200, 980], [300, 900], [440, 860], [520, 760]], .5);
const RING = [
  // [x, y (world, neck pivot), size, colour, head kind, hair]
  [300, 650, .2, C.plum, 'her', 'bob'],
  [430, 450, .19, C.teal, 'short', 'curls'],
  [680, 420, .18, C.sand, 'short', 'hat'],
  [1040, 410, .19, C.leaf, 'her', 'pony'],
  [1310, 470, .2, C.chrome, 'short', 'cap'],
  [1460, 640, .21, C.plum, 'short', 'hat'],
  [1200, 690, .19, C.leaf, 'her', 'bob'],
];
const RC = { x: 840, y: 600, rx: 540, ry: 215 };   // ring centre (her lifted head, world) and radii
const ringPos = (i) => [RING[i][0], RING[i][1]];
const popAt = (i) => T.todos - .04 + i * .07;
const shootAt = (i) => T.decirme + i * .07;
// mouth of a bust (world), given its pose
function mouthOf(i) {
  const [x, y] = ringPos(i), k = RING[i][2], dir = x < RC.x ? 1 : -1;
  return [x + dir * 210 * k, y - 120 * k];
}
function bust(t, i) {
  const [x0, y0] = ringPos(i), [, , k, col, kind, hair] = RING[i];
  const t0 = popAt(i); if (t < t0) return;
  const pk = back((t - t0) / .38);
  const dir = x0 < RC.x ? 1 : -1;
  // all of them lean toward her: "quieren", each shot, each stamp
  const vx = RC.x - x0, vy = RC.y - y0, vl = Math.hypot(vx, vy);
  let jut = .5 * bump(t, T.quieren - .05, .6) + bump(t, shootAt(i) - .08, .3);
  for (const w of [T.una, T.otra, T.vez]) jut += .7 * bump(t, w - .1, .3);
  jut += .4 * ss(46, 47, t) * (.5 + .5 * Math.sin((t - 46) * 9 + i * 1.3));
  const x = x0 + vx / vl * 26 * jut, y = y0 + vy / vl * 26 * jut + (1 - clamp(pk)) * 60;
  // the nose points at her: tilt by the angle to her head, eased in
  const tilt = clamp(Math.atan2(vy, Math.abs(vx)), -.45, .45) * dir;
  g.save(); g.translate(x + jit(t, i * 3, .8), y + jit(t, i * 3 + 1, .8)); g.scale(dir * k * pk, k * pk); g.rotate(tilt * dir + jut * .05);
  g.translate(-580, -800);
  cut(BUST, col, { sh: .9, lift: .6, grain: .24 });
  cut(HEADS[kind], col, { sh: .5, grain: .24 });
  if (hair && HAIR[hair]) cut(HAIR[hair], col, { sh: .3, grain: .2 });
  g.restore();
}

// ---------- speech bubbles: one cream paper sprite, cut once ----------
const BW = 600, BH = 440;
let BUB = null;
function makeBubble() {
  const c = document.createElement('canvas'); c.width = BW; c.height = BH;
  const keep = g; g = c.getContext('2d');
  // the oval and its tail (down and to the left), cut as two pieces so their windings never cancel
  const tail = new Path2D(); tail.moveTo(170, 290); tail.quadraticCurveTo(150, 370, 92, 420); tail.quadraticCurveTo(190, 392, 260, 320); tail.closePath();
  cut(tail, C.cream, { sh: 0, grain: .3 });
  cut(ellipse(300, 190, 250, 160), C.cream, { sh: 0, grain: .3 });
  g.save(); g.strokeStyle = C.creamDeep; g.lineWidth = 7; g.beginPath(); g.ellipse(300, 190, 222, 134, 0, 0, Math.PI * 2); g.stroke(); g.restore();
  g = keep; return c;
}
// draw a bubble centred (on its oval) at x, y; s = scale (1 = 500 px wide oval); fx = -1 flips the tail right
function bubble(x, y, s, rot, fx, lift = .4) {
  if (!BUB) BUB = makeBubble();
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * fx, s);
  g.shadowColor = `rgba(20,16,30,${.34 + lift * .08})`; g.shadowBlur = 14 + lift * 26; g.shadowOffsetX = 5 + lift * 10; g.shadowOffsetY = 8 + lift * 14;
  g.drawImage(BUB, -300, -190);
  g.restore();
}
// a stamp: it comes down from above the paper (bigger, high shadow), lands ON t0 with a thump
function stampK(t, t0) {
  if (t < t0 - .16) return null;
  if (t < t0) { const k = (t - (t0 - .16)) / .16; return { s: lerp(1.45, 1, k * k), lift: lerp(2.2, .4, k * k), a: clamp(k * 2.5) }; }
  const d = t - t0; return { s: 1 - .06 * bump(d, 0, .14), lift: .4, a: 1 };
}
// the first three stamped copies: in a row in front of her face, all the same
const ROW = [[586, 470], [886, 450], [1186, 430]];   // world: a row across the top, left to right
const STAMP_S = .62;
// the copies that keep coming after "vez": faster and faster, bigger and bigger, filling the frame around her
const MORE = (() => {
  const out = []; let t = T.vez + .42, dt = .4, k = 0;
  while (t < 49.72) {
    const a = 2.39996 * k + .7, r = 300 + 40 * Math.sqrt(k) * 5 * (.75 + hash(k * 3.1) * .5);
    let x = RC.x + Math.cos(a) * r * 1.6, y = RC.y - 40 + Math.sin(a) * r * .8;
    x = clamp(x, 40, 1570); y = clamp(y, 330, 900);
    // keep her head clear
    const dx = x - RC.x, dy = y - RC.y, d = Math.hypot(dx / 1.3, dy);
    if (d < 260) { x = RC.x + dx / d * 260 * 1.3; y = RC.y + dy / d * 260; }
    out.push({ t, x, y, s: lerp(.42, .8, clamp(k / 26)) * (.9 + hash(k * 5.3) * .2), rot: (hash(k * 2.7) - .5) * .3, fx: x > RC.x ? -1 : 1 });
    t += dt; dt = Math.max(.11, dt * .87); k++;
  }
  return out;
})();
// last, big and close: screen-space bubbles right up at the lens, around the edges (her head stays clear)
const NEAR = [
  { t: 48.35, x: 260, y: 300, s: 1.25, rot: -.12, fx: 1 }, { t: 48.6, x: 1700, y: 690, s: 1.35, rot: .1, fx: -1 },
  { t: 48.85, x: 230, y: 740, s: 1.3, rot: .08, fx: 1 }, { t: 49.05, x: 1660, y: 300, s: 1.2, rot: -.06, fx: -1 },
  { t: 49.25, x: 900, y: 860, s: 1.15, rot: .04, fx: 1 }, { t: 49.42, x: 760, y: 150, s: 1.05, rot: -.1, fx: 1 },
  { t: 49.58, x: 1280, y: 880, s: 1.1, rot: .12, fx: -1 },
];

// the storm cloud (lobes after 00-intro's cloud), screen space, coming down over the top of the frame
const LOBES = [[-90, -60, 170], [80, -50, 160], [0, 20, 150], [-220, 0, 130], [220, 10, 130], [-330, 30, 100], [330, 30, 100],
  [-150, -150, 120], [150, -140, 120], [-420, 60, 80], [420, 55, 85], [0, -190, 110], [-280, -90, 110], [470, -20, 95],
  [-500, 70, 80], [300, -150, 100], [-390, -140, 90], [100, -235, 100], [540, 55, 72], [-560, 45, 70]];
function lobes(t, grow, dy, minY = -1e9) {
  const p = new Path2D();
  LOBES.forEach(([x, y, r], i) => { const cx = x + Math.sin(t * .55 + i * 1.7) * 7, cy = y + Math.cos(t * .5 + i * 2.3) * 5 + dy;
    if (cy < minY) return; const rr = r + grow; p.moveTo(cx + rr, cy); p.arc(cx, cy, Math.max(.1, rr), 0, Math.PI * 2); });
  return p;
}
function stormCloud(t) {
  const slab = blob([[-600, 60], [-560, 20], [560, 20], [600, 60], [570, 118], [0, 126], [-570, 118]], .6);
  const bk = lobes(t, 14, 10); bk.addPath(slab);
  cut(bk, CL.dark, { sh: 1.1, lift: 1.2, grain: .28 });
  g.save(); g.beginPath(); g.rect(-900, -700, 1800, 758); g.clip(); cut(lobes(t, 0, -6), CL.mid, { sh: .5, lift: .3, grain: .26 }); g.restore();
  cut(lobes(t, -46, -34, -120), CL.hi, { sh: .35, lift: .1, grain: .22 });
}

SHOT(T.start, T.end, '02-todos', (t) => {
  const A0 = g.globalAlpha;
  const P = herPose(t);
  // camera: 01's fixed kitchen camera, then a push in on her head as the copies keep coming
  const push = eio(ss(45.3, 50.0, t));
  const Z = KZ * (lerp(1, 1.4, push) + .02 * ss(36.4, 45, t));
  const FX = lerp(KFX, RC.x + 40, push), FY = lerp(KFY, RC.y + 10, push);
  let shake = 0; for (const w of [T.una, T.otra, T.vez]) shake += bump(t, w, .12);
  g.save(); g.translate(W / 2, H / 2 + shake * 5); g.scale(Z, Z); g.translate(-FX, -FY);

  room();
  lamp(t, 1);
  chair();
  sitter(P, 'back');
  kTable();

  // --- chores on the table: cups on "muy", plates on "cansada", a pot, papers on "de", the phone on "atender" ---
  cup(1330, TY - 26, 1.3, C.w3);                       // 01's cold cup, still there
  atDrop(t, T.muy, 1170, TY - 30, .04, () => cupShape(C.cream));
  atDrop(t, T.muy + .2, 1235, TY - 22, -.05, () => cupShape(C.w4));
  atDrop(t, T.cansada, 1525, TY - 30, 0, plates, 420, .22);
  atDrop(t, B.b1, 1425, TY - 28, .02, () => { cut(ellipse(0, -8, 64, 10), C.w4, { sh: .4, grain: .1 }); cut(rrect(-50, -52, 100, 44, [4, 4, 18, 18]), C.w1, { sh: .5 });
    cut(rect(-70, -40, 20, 8), C.w1, { sh: .3, grain: 0 }); cut(rect(50, -40, 20, 8), C.w1, { sh: .3, grain: 0 }); }, 400, .22);
  for (let i = 0; i < 4; i++) {
    const t0 = T.de - .05 + i * .07, d = t - (t0 - .45); if (d < 0) continue;
    const k = clamp(d / .45), x = 1215 + i * 24 + Math.sin(d * 14 + i) * 30 * (1 - k), y = lerp(TY - 560, TY - 26 - i * 3, eo(k));
    const rot = (1 - k) * Math.sin(d * 11 + i * 2) * .5 + (hash(i * 3.3) - .5) * .25;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(1, lerp(1, .4, k)); sheetPaper(104, 74, 30 + i); g.restore();
  }
  // the phone lands right by her head and rings until the people arrive
  const ring = ss(T.atender, T.atender + .05, t) * (1 - ss(T.todos - .2, T.todos + .1, t));
  atDrop(t, T.atender, 1060, TY - 26, 0, () => phone(t, ring), 420, .2);

  // --- the pile on her back: towels, a laundry basket, a box, books, each on a band beat ---
  {
    const [bx, by] = bodyPt(P.lean, -66, -150);
    let y = 0;
    const items = [[B.b2, towels, 90], [B.b3, basket, 92], [B.b4, box, 84], [B.b5, books, 66]];
    g.save(); g.translate(bx, by); g.rotate(P.lean * .28);
    items.forEach(([t0, fn, h], i) => { atDrop(t, t0, (hash(i * 7.7) - .5) * 18, y, (hash(i * 3.1) - .5) * .12, fn, 360, .2); y -= h; });
    g.restore();
  }
  sitter(P, 'front');

  // --- "todos": the ring of heads ---
  for (let i = 0; i < RING.length; i++) bust(t, i);

  // --- "decirme": each head shoots a bubble at her; they land in a ring round her head ---
  for (let i = 0; i < RING.length; i++) {
    const t0 = shootAt(i); if (t < t0) continue;
    const [mx, my] = mouthOf(i), k = eo((t - t0) / .42);
    const lx = lerp(mx, RC.x, .45), ly = lerp(my, RC.y - 30, .45) - 20;
    const x = lerp(mx, lx, k), y = lerp(my, ly, k) - Math.sin(k * Math.PI) * 40;
    const s = lerp(.08, .3, k) * (1 + .1 * bump(t, t0 + .42, .2));
    const fx = mx < RC.x ? 1 : -1;
    bubble(x + jit(t, i * 5, 1.2), y + jit(t, i * 5 + 2, 1.2) + Math.sin(t * 2 + i) * 3, s, (hash(i * 1.9) - .5) * .2, fx, .6 * (1 - k) + .3);
  }

  // --- "una", "otra", "vez": one stamped copy each, identical, in a row; then more and more copies ---
  for (const m of MORE) {
    const st = stampK(t, m.t); if (!st) continue;
    g.save(); g.globalAlpha *= st.a; bubble(m.x, m.y, m.s * st.s, m.rot, m.fx, st.lift); g.restore();
  }
  [T.una, T.otra, T.vez].forEach((w, i) => {
    const st = stampK(t, w); if (!st) return;
    g.save(); g.globalAlpha *= st.a; bubble(ROW[i][0], ROW[i][1], STAMP_S * st.s, 0, 1, st.lift); g.restore();
  });
  g.restore();

  // --- the storm cloud comes down over the lot and takes the light ---
  const cl = eio(ss(45.4, 47.4, t));
  if (cl > 0) {
    g.save(); g.globalAlpha = A0 * .22 * cl; g.globalCompositeOperation = 'multiply';
    const dg = g.createLinearGradient(0, 0, 0, H); dg.addColorStop(0, '#3a3448'); dg.addColorStop(1, '#8a8498');
    g.fillStyle = dg; g.fillRect(0, 0, W, H); g.restore();
    g.save(); g.translate(960 + Math.sin(t * .4) * 12, lerp(-430, 30, cl) + Math.sin(t * .7) * 5); g.scale(1.6, 1.05); stormCloud(t); g.restore();
  }
  // --- the last copies, big and close to the lens ---
  for (const n of NEAR) {
    const st = stampK(t, n.t); if (!st) continue;
    g.save(); g.globalAlpha *= st.a; bubble(n.x, n.y, n.s * st.s, n.rot, n.fx, st.lift + .8); g.restore();
  }
  g.globalAlpha = A0;
});
})();
