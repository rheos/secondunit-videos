// 06-oro, 127.0-146.6  "Es difícil darse cuenta lo que una vale, como oro vale" + the "Ah" (141-147).
// THE CLIMAX. A big old balance scale fills the frame (ink post, beam, needle and dial; cream pans on chains).
// Left pan: the singed half-size storm cloud and a heap of speech bubbles. Right pan: her, carmine, small.
// "Es": the cloud drops onto the left pan and the beam swings level. Bubbles tumble onto the heap.
// "difícil": the beam wobbles, she throws her arms out to balance. "darse cuenta": hand to chin, she looks at
// the heap. "una": hand on her chest. "vale": the scale tips to the heap and lifts her up, small.
// "como": she turns away from the heap, chin up, and starts to glow. "oro": gold paper wipes up her body,
// sparkles. "vale": the scale SLAMS down on her side and flings the cloud and bubbles off the left pan, out of frame.
// "Ah": a gold sun halo opens behind her, rays and gold rings pour out (the brightest frame of the film); then
// the camera pushes into her head and lands exactly on 04-sky's big close profile with the halo, for 07.
// Local helpers (no kit edits): matrix maths for her head, camera push, chains, cloud, bubbles, pose keys.
(() => {
const T = { start: 127.0, es: 127.51, dif: 129.29, darse: 131.25, cuenta: 132.76, una: 135.032, vale1: 135.51,
  como: 136.51, oro: 138.217, vale2: 138.71, ah: 141.0, push0: 143.7, push1: 146.3, end: 146.6 };
const CARMINE = '#b3262e';
const CLOUD0 = '#4a4458', CLOUD1 = '#5c566b', CHAR = '#3a3446';
const DEG = 180 / Math.PI;
// the scale (world units = screen pixels before the push)
const P0 = { x: 960, y: 190 }, L = 560, CH = 440, PW = 175, PD = 50;
const PS = .30, HK = .265;                                  // her puppet scale, head scale inside the puppet
// 04-sky big close profile (ox 470, oy -150, zoom 1.3, tilt 0, push 1): head units -> screen
const BIG = new DOMMatrix([1.3, 0, 0, 1.3, 470, -150]);

// ---------------- the beam angle (positive = her side, the right, goes down) ----------------
const spring = (d, k = 5, w = 12) => d <= 0 ? 0 : 1 - Math.exp(-k * d) * Math.cos(w * d);
const BUB = [   // speech bubbles: heap slot on the left pan (rim centre = 0,0), size, tilt, landing time, fling
  { x: -150, y: -46, w: 118, h: 78, r: -.18, f: 1 }, { x: 152, y: -48, w: 114, h: 76, r: .2, f: -1 },
  { x: -142, y: -140, w: 108, h: 72, r: -.32, f: 1 }, { x: 146, y: -142, w: 108, h: 72, r: .3, f: -1 },
  { x: -64, y: -236, w: 112, h: 74, r: -.14, f: 1 }, { x: 70, y: -240, w: 108, h: 72, r: .16, f: -1 },
  { x: 4, y: -318, w: 104, h: 68, r: .04, f: 1 },
].map((b, i) => ({ ...b, land: 127.82 + i * .2, vx: -650 - hash(i * 3.1) * 1000, vy: -1500 - hash(i * 5.3) * 1300, spin: (hash(i * 7.7) - .5) * 14 }));
function slam(d) {
  if (d < -.13) return 0;
  if (d < 0) { const k = (d + .13) / .13; return k * k; }
  return 1 - .16 * Math.exp(-4.2 * d) * Math.abs(Math.sin(d * 13));
}
function wob(t) { const d = t - T.dif; return d > 0 ? .15 * Math.exp(-d * 1.05) * Math.sin(d * Math.PI * 2 * 1.25) : 0; }
function theta(t) {
  let th = .20;
  if (t < T.es) th += Math.abs(Math.sin((t - T.start) * Math.PI / .17)) * .025;            // her dance steps bounce the pan
  th -= .17 * spring(t - T.es + .02, 5, 12);                                                  // the cloud lands: level
  BUB.forEach((b) => { th -= .016 * spring(t - b.land, 6, 14); });                           // the heap grows heavier
  th += wob(t);                                                                               // "difícil"
  th += .035 * Math.sin((t - 131.2) * Math.PI * 2 / 1.7) * ss(131.0, 131.8, t) * (1 - ss(134.9, 135.4, t));  // undecided
  th -= .20 * spring(t - T.vale1 + .06, 4.5, 10);                                             // "vale": tips to the heap
  th += .58 * slam(t - T.vale2);                                                              // "vale": SLAM on her side
  return th;
}
// pans swing a little on the hits (pendulum on their chains), still by the "Ah"
function sway(t, side) {
  const ring = (t0, a, k = 3.5, w = 9) => { const d = t - t0; return d > 0 ? a * Math.exp(-k * d) * Math.sin(w * d) : 0; };
  let s = ring(T.es, side > 0 ? .03 : -.05) + ring(T.dif, .03) + ring(T.vale1, side * .05) + ring(T.vale2, side > 0 ? -.07 : .09, 3, 10);
  return s * (1 - ss(140.4, 141, t));
}
function hook(t, side) {
  const th = theta(t), c = Math.cos(th), s = Math.sin(th);
  return { x: P0.x + side * L * c - 24 * s, y: P0.y + side * L * s + 24 * c, sw: sway(t, side) };
}
const panM = (t, side) => { const h = hook(t, side); return new DOMMatrix().translateSelf(h.x, h.y).rotateSelf(h.sw * DEG).translateSelf(0, CH); };

// ---------------- her pose ----------------
const ARMS_REST = [[.12, .22], [-.08, .22]];
const P = {
  danceA: { arms: [[2.5, .3], [-2.25, .35]], legs: [[.38, .55], [-.16, .1]], head: .1 },
  danceB: { arms: [[2.2, .6], [-2.5, .2]], legs: [[-.14, .1], [.36, .55]], head: .04 },
  stand:  { arms: ARMS_REST, legs: [[0, 0], [0, 0]], head: 0 },
  flinch: { arms: [[.3, .5], [-.25, .4]], legs: [[0, 0], [0, 0]], head: .06 },
  watch:  { arms: ARMS_REST, legs: [[0, 0], [0, 0]], head: -.08 },
  balance:{ arms: [[1.45, .12], [-1.3, .12]], legs: [[.16, .3], [-.12, .26]], head: .02 },
  chin:   { arms: [[1.55, 1.95], [-.06, .25]], legs: [[.05, 0], [-.04, 0]], head: -.05, lean: .07 },
  chest:  { arms: [[.9, -2.35], [-.06, .25]], legs: [[0, 0], [0, 0]], head: .02 },
  lifted: { arms: [[.7, .35], [-.6, .35]], legs: [[0, 0], [0, 0]], head: .08 },
  sag:    { arms: [[.03, .08], [-.03, .08]], legs: [[0, 0], [0, 0]], head: -.16 },
  rise:   { arms: [[.45, .15], [-.36, .15]], legs: [[0, 0], [0, 0]], head: .14 },
  open:   { arms: [[.95, .12], [-.85, .12]], legs: [[0, 0], [0, 0]], head: .15 },
  brace:  { arms: [[1.25, .3], [-1.1, .3]], legs: [[.3, .62], [-.18, .5]], head: .02 },
  proud:  { arms: [[.75, .1], [-.65, .1]], legs: [[.1, 0], [-.08, 0]], head: .13 },
  ah:     { arms: [[2.45, .22], [-2.3, .25]], legs: [[.12, 0], [-.1, 0]], head: .15 },
  down:   { arms: [[.25, .15], [-.2, .15]], legs: [[.12, 0], [-.1, 0]], head: .15 },
};
// key poses: [time, pose]; between keys the paper eases from one drawing to the next
const KEYS = [
  [127.0, P.danceA], [127.17, P.danceB], [127.34, P.danceA], [127.47, P.stand], [127.56, P.flinch], [127.85, P.watch],
  [129.12, P.watch], [129.4, P.balance], [130.9, P.balance], [131.4, P.watch], [132.6, P.chin], [134.6, P.chin],
  [135.0, P.chest], [135.42, P.chest], [135.62, P.lifted], [136.1, P.sag], [136.5, P.sag], [137.1, P.rise],
  [138.2, P.open], [138.6, P.open], [138.76, P.brace], [139.2, P.brace], [139.7, P.proud], [140.85, P.proud],
  [141.35, P.ah], [143.5, P.ah], [144.5, P.down],
];
function footDrop(legs) { const y = (l) => 266 * Math.cos(l[0]) + 250 * Math.cos(l[1] - l[0]); return 516 - Math.max(y(legs[0]), y(legs[1])); }
function poseAt(t) {
  let i = 0; while (i < KEYS.length - 1 && KEYS[i + 1][0] <= t) i++;
  const [ta, a] = KEYS[i], nx = KEYS[i + 1];
  const k = nx ? eio((t - ta) / (nx[0] - ta)) : 0, b = nx ? nx[1] : a;
  const m2 = (x, y) => x.map((r, j) => [lerp(r[0], y[j][0], k), lerp(r[1], y[j][1], k)]);
  const pose = { arms: m2(a.arms, b.arms), legs: m2(a.legs, b.legs), head: lerp(a.head, b.head, k) };
  pose.lean = lerp(a.lean || 0, b.lean || 0, k) - wob(t) * .55;                                     // she counter-balances the wobble
  pose.bob = footDrop(pose.legs);                                // feet stay on the pan when knees bend
  if (t < T.es) pose.bob -= Math.abs(Math.sin((t - T.start) * Math.PI / .17)) * 26;   // dance hops
  return pose;
}
// facing: -1 (left, toward the heap) until "como", then she turns away from it to face right
function facing(t) {
  const t0 = T.como - .02, TURN = .2;
  if (t < t0) return -1; if (t >= t0 + TURN) return 1;
  const c = Math.cos(Math.PI * (t - t0) / TURN); let d = -c; if (Math.abs(d) < .45) d = (c > 0 ? -1 : 1) * .45; return d;
}
// her head (head units) -> world, mirroring puppet() + head() in kit.js
function headM(t, pose, dir) {
  return panM(t, 1).translate(0, -4).translate(0, (pose.bob || 0) * PS).scale(PS * dir, PS).rotate((pose.lean || 0) * DEG)
    .translate(10, -790).rotate(-(pose.head || 0) * .9 * DEG).scale(HK, HK).translate(-580, -800);
}

// ---------------- the camera push into her head (lands on the 04-sky framing) ----------------
let CAM = null;
function camSetup() {
  if (CAM) return CAM;
  const Mh = headM(T.end, poseAt(T.end), 1);
  const E = BIG.multiply(Mh.inverse());
  const Hw = Mh.transformPoint(new DOMPoint(560, 560)), Ht = E.transformPoint(Hw);
  CAM = { S: Math.hypot(E.a, E.b), r: Math.atan2(E.b, E.a), Hw, Ht };
  return CAM;
}
function camAt(u) {
  const c = camSetup(); if (u <= 0) return new DOMMatrix();
  const S = Math.pow(c.S, u), r = c.r * u;
  return new DOMMatrix().translateSelf(lerp(c.Hw.x, c.Ht.x, u), lerp(c.Hw.y, c.Ht.y, u)).rotateSelf(r * DEG).scaleSelf(S, S).translateSelf(-c.Hw.x, -c.Hw.y);
}

// ---------------- drawing pieces ----------------
function chain(x0, y0, x1, y1, col = C.ink) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(d / 17)), a = Math.atan2(y1 - y0, x1 - x0);
  g.save(); g.strokeStyle = col; g.lineWidth = 3.2; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u);
    g.beginPath();
    if (i % 2 === 0) g.ellipse(x, y, 9.5, 5, a, 0, Math.PI * 2);
    else { g.moveTo(x - Math.cos(a) * 9, y - Math.sin(a) * 9); g.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); }
    g.stroke();
  }
  g.restore();
}
const BOWL = (() => { const p = new Path2D(); p.moveTo(-PW - 4, -2); p.bezierCurveTo(-PW + 14, PD + 10, PW - 14, PD + 10, PW + 4, -2); p.closePath(); return p; })();
function panBack(h) {  // chains and the hook ring, in the hook frame
  g.save(); g.translate(h.x, h.y); g.rotate(h.sw);
  chain(0, 8, 0, CH - 6, '#2b3157');
  chain(0, 8, -PW + 6, CH - 6); chain(0, 8, PW - 6, CH - 6);
  g.strokeStyle = C.ink; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 10, 0, Math.PI * 2); g.stroke();
  g.restore();
}
function panFront(h) {
  g.save(); g.translate(h.x, h.y); g.rotate(h.sw); g.translate(0, CH);
  cut(BOWL, C.cream, { sh: .9, lift: .3, grain: .25 });
  cut(rrect(-PW - 12, -9, 2 * PW + 24, 14, 7), C.creamDeep, { sh: .5, grain: .2 });
  cut(ellipse(0, PD + 4, 30, 8), C.ink, { sh: .3, grain: .1 });
  g.restore();
}
const BEAM = blob([[-L - 4, -8], [-L * .5, -12], [-60, -19], [0, -22], [60, -19], [L * .5, -12], [L + 4, -8],
  [L + 4, 8], [L * .5, 10], [60, 16], [0, 19], [-60, 16], [-L * .5, 10], [-L - 4, 8]], .35);
const NEEDLE = poly([[-7, 0], [7, 0], [2, -150], [0, -168], [-2, -150]]);
function scaleBody(t) {
  // plinth and column (fixed)
  cut(cutRect(790, 890, 340, 28, 31), C.ink, { sh: .8, lift: .2 });
  cut(cutRect(842, 862, 236, 30, 32), C.ink, { sh: .6 });
  cut(cutRect(902, 836, 116, 28, 33), C.ink, { sh: .5 });
  cut(cutRect(939, 232, 42, 606, 34, 1.5), C.ink, { sh: .7, lift: .2 });
  for (const x of [950, 970]) { g.save(); g.strokeStyle = 'rgba(244,234,214,.16)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 250); g.lineTo(x, 828); g.stroke(); g.restore(); }
  cut(cutRect(916, 214, 88, 22, 35), C.ink, { sh: .6 });
  cut(poly([[928, 216], [992, 216], [976, 176], [944, 176]]), C.ink, { sh: .5 });
  // the dial plate above the pivot (fixed)
  const sector = (r0, r1, a) => { const p = new Path2D(); p.arc(P0.x, P0.y, r1, -Math.PI / 2 - a, -Math.PI / 2 + a); p.arc(P0.x, P0.y, r0, -Math.PI / 2 + a, -Math.PI / 2 - a, true); p.closePath(); return p; };
  cut(sector(86, 166, .56), C.ink, { sh: .7, lift: .2 });
  cut(sector(94, 158, .5), C.cream, { sh: .2, grain: .25 });
  g.save(); g.strokeStyle = C.ink; g.lineCap = 'round';
  for (let i = -4; i <= 4; i++) { const a = -Math.PI / 2 + i * .105, r0 = i === 0 ? 112 : 136; g.lineWidth = i === 0 ? 5 : 3;
    g.beginPath(); g.moveTo(P0.x + Math.cos(a) * r0, P0.y + Math.sin(a) * r0); g.lineTo(P0.x + Math.cos(a) * 154, P0.y + Math.sin(a) * 154); g.stroke(); }
  g.restore();
  // the beam, needle and hub (rotating)
  const th = theta(t);
  g.save(); g.translate(P0.x, P0.y); g.rotate(th);
  cut(BEAM, C.ink, { sh: 1, lift: .5, grain: .2 });
  for (const s of [-1, 1]) { cut(circle(s * (L + 8), 0, 17), C.ink, { sh: .6 }); cut(circle(s * (L + 8), 0, 6), C.cream, { sh: 0, grain: .1 }); }
  cut(NEEDLE, C.ink, { sh: .6, lift: .3 });
  cut(circle(0, 0, 26), C.ink, { sh: .7, lift: .4 });
  cut(circle(0, 0, 9), C.creamDeep, { sh: .2, grain: .1 });
  g.restore();
}
// the singed storm cloud: grey-violet, no face, a burnt underside, a thread of smoke
function stormCloud(x, y, sc, rot, t, smoke = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  if (smoke > 0) for (let i = 0; i < 2; i++) {
    const pts = []; for (let j = 0; j <= 10; j++) { const u = j / 10; pts.push([-40 + i * 90 + Math.sin(u * 5 + t * 2.4 + i * 2) * 18 * u, -60 - u * 190]); }
    g.save(); g.globalAlpha *= .38 * smoke; g.fillStyle = C.w3; g.fill(ribbonAlong(pts, 22)); g.restore();
  }
  const puffs = (list, base) => { const p = new Path2D(); list.forEach(([x, y, r]) => { p.moveTo(x + r, y); p.arc(x, y, r, 0, Math.PI * 2); });
    if (base) p.roundRect(-150, 0, 300, 62, 31); return p; };
  const back = puffs([[-98, 14, 56], [-46, -34, 72], [30, -52, 76], [96, -2, 58], [4, 14, 66]], true);
  cut(back, CLOUD0, { sh: 1, lift: .5, grain: .3 });
  g.save(); g.clip(back);
  const burnt = new Path2D(); burnt.moveTo(-200, 120);
  for (let i = 0; i <= 18; i++) burnt.lineTo(-170 + i * 20, 34 + (i % 2 ? 12 : -4) + hash(i * 2.7) * 12);
  burnt.lineTo(200, 120); burnt.closePath();
  g.fillStyle = CHAR; g.fill(burnt); g.restore();
  cut(puffs([[-54, -30, 52], [22, -50, 56], [-100, 14, 34]], false), CLOUD1, { sh: .7, lift: .2, grain: .28 });
  // scorched edge marks
  g.save(); g.strokeStyle = CHAR; g.lineWidth = 3; g.lineCap = 'round';
  for (const [a, b, c2] of [[-118, -40, -96], [-20, -80, 6], [96, -60, 118]]) { g.beginPath(); g.moveTo(a, b); g.lineTo(c2, b + 8); g.stroke(); }
  g.restore();
  g.restore();
}
function bubble(x, y, w, h, rot, flip, sq = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(flip / sq, sq);
  const p = new Path2D(); p.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  p.moveTo(-w * .26, h * .3); p.lineTo(-w * .5, h * .95); p.lineTo(-w * .02, h * .44); p.closePath();
  cut(p, C.cream, { sh: .8, lift: .3, grain: .22 });
  g.restore();
}
// rim-frame point -> world
const onPan = (M, x, y) => M.transformPoint(new DOMPoint(x, y));

// the heap on the left pan: cloud lands on "Es", bubbles tumble in, all fly off on the second "vale"
const FLING = T.vale2 + .02, GRAV = 2500;
function heap(t) {
  const M = panM(t, -1), sw = hook(t, -1).sw;
  const ML = t >= FLING ? panM(FLING, -1) : null, swL = t >= FLING ? hook(FLING, -1).sw : 0;
  const item = (slot, at, fall, vx, vy, spin, draw) => {
    if (t < at - fall) return;
    let p, r = sw;
    if (t < FLING) {
      const q = onPan(M, slot.x, slot.y);
      if (t < at) { const k = ei((t - (at - fall)) / fall); p = { x: lerp(q.x + 40, q.x, k), y: lerp(-260, q.y, k) }; r += (1 - k) * .4; }
      else p = q;
    } else {
      const q = onPan(ML, slot.x, slot.y), d = t - FLING;
      p = { x: q.x + vx * d, y: q.y + vy * d + .5 * GRAV * d * d }; r = swL + spin * d;
      if (p.x < -500 || p.y < -500 || p.y > H + 400) return;
    }
    const land = t >= at ? bump(t, at, .22) : 0;
    draw(p.x, p.y, r, 1 + land * .14);
  };
  item({ x: 0, y: -66 }, T.es, .3, -1250, -2050, -2.6, (x, y, r, sq) => stormCloud(x, y, 1 / Math.sqrt(sq), r, t, 1 - ss(T.vale2, T.vale2 + .3, t)));
  BUB.forEach((b) => item(b, b.land, .32, b.vx, b.vy, b.spin, (x, y, r, sq) => bubble(x, y, b.w, b.h, b.r + r, b.f, sq)));
}

// her, as a puppet on the right pan; the head is drawn by headAcc so it can be unclipped and scaled with the push
function drawHer(t, pose, dir, col, { headClipB = 840, eye = 0, A0 = g.globalAlpha, headAlpha = null, grow = 1 } = {}) {
  const M = panM(t, 1);
  const spec = { col, kind: 'dress', head: 'her', lace: true, headK: 1e-6,
    headAcc: () => {
      g.save(); if (headAlpha !== null) g.globalAlpha = headAlpha;
      g.rotate(-(pose.head || 0) * .9); g.scale(HK, HK); g.translate(-580, -800);
      g.save(); g.beginPath(); g.rect(-200, -200, 1400, headClipB + 200); g.clip();
      cut(HEADS.her, col, { sh: lerp(.5, 1.2, ss(.2, 1, eye)), lift: eye, grain: .26 });
      g.restore();
      if (eye > 0) { g.save(); g.globalAlpha *= eye; g.strokeStyle = C.rose; g.lineWidth = 7; g.lineCap = 'round';
        g.beginPath(); g.arc(706, 446, 18, Math.PI * .12, Math.PI * .88); g.stroke(); g.restore(); }
      g.restore();
    } };
  g.save(); g.setTransform(g.getTransform().multiply(M)); g.translate(0, -4);
  if (grow !== 1) { g.translate(0, -150 * PS); g.scale(grow, grow); g.translate(0, 150 * PS); }
  puppet(0, 0, PS, dir, spec, pose);
  g.restore();
}

// ---------------- background (screen space) ----------------
function hill(y, amp, ph, col) { const p = new Path2D(); p.moveTo(-20, H + 20); p.lineTo(-20, y);
  for (let x = 0; x <= W + 40; x += 40) p.lineTo(x, y + Math.sin(x / 260 + ph) * amp); p.lineTo(W + 40, H + 20); p.closePath(); cut(p, col, { sh: .6 }); }

SHOT(127.0, 146.6, '06-oro', (t) => {
  const A0 = g.globalAlpha;
  const pose = poseAt(t), dir = facing(t);
  const u = eio(clamp((t - T.push0) / (T.push1 - T.push0)));
  const cam = camAt(u);
  const Mh = cam.multiply(headM(t, pose, dir));
  const headS = Math.hypot(Mh.a, Mh.b);                         // her head's scale on screen (1.3 at the end)
  const ahK = ss(T.ah - .05, T.ah + .5, t);

  sheet(C.rose);
  hill(900, 26, 1.2, '#d9877f'); hill(975, 18, 3.4, '#c9746f');

  // her chest on screen (the halo and rings centre on it before the push)
  const chest = cam.multiply(panM(t, 1)).transformPoint(new DOMPoint(0, -4 - 560 * PS));
  const c = camSetup();
  const hc = { x: lerp(chest.x, 1081, u), y: lerp(chest.y, 461, u) };     // 04-sky halo centre = toHalo(470,470)

  // ---- the "Ah": paper sun rays, the halo, gold rings pouring out ----
  if (ahK > 0) {
    const rayA = ahK * (1 - ss(.35, .92, u));
    if (rayA > 0) {
      g.save(); g.globalAlpha *= rayA;
      const n = 18, rot = t * .06, R = 2300 * eo(clamp((t - T.ah) / .9));
      for (let i = 0; i < n; i++) {
        const a = rot + i * Math.PI * 2 / n, w = Math.PI / n * .62;
        cut(poly([[hc.x, hc.y], [hc.x + Math.cos(a - w) * R, hc.y + Math.sin(a - w) * R], [hc.x + Math.cos(a + w) * R, hc.y + Math.sin(a + w) * R]]),
          i % 2 ? C.goldPale : C.sun, { sh: .35, grain: .2 });
      }
      g.restore();
    }
    const open = clamp(back((t - T.ah) / .7), 0, 1.2);
    const sunR = 400 + Math.sin(t * .5) * 4;
    const rIn = lerp(250, 1.3 * sunR, u) * open, rOut = lerp(250 + 30, 1.3 * (sunR + 34), u) * open;
    cut(circle(hc.x, hc.y, rOut), C.goldPale, { sh: .5, grain: .25 });
    cut(circle(hc.x, hc.y, rIn), C.sun, { sh: .6, grain: .25 });
    // concentric gold rings riding out from her through the frame, before the push
    const ringA = 1 - ss(.15, .55, u);
    if (ringA > 0) for (let i = 0; i < 12; i++) {
      const at = T.ah + .1 + i * .3, d = t - at, life = 1.7; if (d < 0 || d > life) continue;
      const k = d / life;
      g.save(); g.globalAlpha *= (1 - k) * ringA * .95; g.strokeStyle = i % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(22, 5, k);
      g.beginPath(); g.arc(hc.x, hc.y, lerp(rIn * .6, 1500, eo(k)), 0, Math.PI * 2); g.stroke(); g.restore();
    }
  }
  // ---- "como": a warm glow gathers behind her ----
  const glow = ss(T.como, T.oro, t) * (1 - ahK * .85);
  if (glow > 0) {
    const R = 240 + 40 * Math.sin(t * 5);
    g.save(); g.globalAlpha *= glow; const gr = g.createRadialGradient(chest.x, chest.y, 10, chest.x, chest.y, R);
    gr.addColorStop(0, 'rgba(247,210,126,.95)'); gr.addColorStop(.5, 'rgba(241,178,58,.45)'); gr.addColorStop(1, 'rgba(241,178,58,0)');
    g.fillStyle = gr; g.fill(circle(chest.x, chest.y, R)); g.restore();
  }

  // ---- the world (scale, heap, her) under the camera ----
  g.save(); g.setTransform(cam);
  const sceneA = 1 - ss(.28, .55, u);                              // the scale has left the frame by then; skip drawing it
  if (sceneA > 0) {
    g.save(); g.globalAlpha *= sceneA;
    scaleBody(t);
    panBack(hook(t, -1)); panBack(hook(t, 1));
    heap(t);
    panFront(hook(t, -1));
    g.restore();
  }
  // her: carmine, then gold wiping up from her feet on "oro"
  const goldK = ss(T.oro, T.oro + .42, t);
  const bodyA = 1 - ss(145.5, 146.25, t);
  const clipB = lerp(840, 1300, ss(145.5, 146.25, t));
  const eye = ss(.25, .7, headS);
  const herOpts = { headClipB: clipB, eye, headAlpha: A0, A0 };
  g.save(); g.globalAlpha *= bodyA;
  if (glow > .02 && goldK < 1) { g.save(); g.globalAlpha *= glow * .75; drawHer(t, pose, dir, C.goldPale, { ...herOpts, headAlpha: A0 * glow * .75, grow: 1.07 }); g.restore(); }
  if (goldK < 1) drawHer(t, pose, dir, CARMINE, herOpts);
  if (goldK > 0) {
    const M = panM(t, 1), top = -4 - 340 * PS, bot = 10;
    const yW = lerp(bot, top, goldK);
    g.save();
    if (goldK < 1) {
      g.setTransform(cam.multiply(M));
      const p = new Path2D(); p.moveTo(-400, 400); p.lineTo(-400, yW);
      for (let x = -400; x <= 400; x += 14) p.lineTo(x, yW + (hash(x * .41 + 3) - .5) * 9 + Math.sin(x / 23) * 4);
      p.lineTo(400, 400); p.closePath(); g.clip(p); g.setTransform(cam);
    }
    drawHer(t, pose, dir, C.gold, herOpts);
    g.restore();
  }
  g.restore();
  if (sceneA > 0) { g.save(); g.globalAlpha *= sceneA; panFront(hook(t, 1)); g.restore(); }
  g.restore();

  // ---- sparkles: a few on "como", a burst on "oro", drifting through the "Ah" ----
  const sp = (x, y, r, col) => { g.save(); g.fillStyle = col; g.shadowColor = 'rgba(120,70,20,.35)'; g.shadowBlur = 6; g.shadowOffsetY = 2; g.fill(star4(x, y, r)); g.restore(); };
  if (t > T.como && u < .6) {
    const fade = 1 - ss(.2, .6, u);
    for (let i = 0; i < 16; i++) {
      const at = i < 4 ? T.como + .2 + i * .35 : T.oro + (i - 4) * .06;
      const d = t - at; if (d < 0) continue;
      const life = i < 4 ? 1.4 : 1.6, k = d / life; if (k > 1 && t < T.ah) continue;
      const a = hash(i * 3.7) * Math.PI * 2, rr = 60 + hash(i * 5.1) * 120;
      const rep = k > 1 ? ((t - at) % 1.6) / 1.6 : k;
      const r = (i % 3 ? 14 : 22) * Math.sin(Math.PI * clamp(rep)) * (1 + .2 * Math.sin(t * 9 + i));
      if (r <= .5) continue;
      sp(chest.x + Math.cos(a) * rr * (1 + rep * .3), chest.y + Math.sin(a) * rr * 1.3 * (1 + rep * .3) - rep * 30, r, i % 2 ? C.goldPale : C.cream);
      void fade;
    }
  }
  if (ahK > 0) for (let i = 0; i < 22; i++) {
    const per = 2.4 + hash(i * 2.2) * 1.4, ph = ((t - T.ah) / per + hash(i * 9.3)) % 1;
    const a = hash(i * 1.9) * Math.PI * 2, R = 200 + ph * 700;
    const r = (hash(i * 4.4) > .7 ? 20 : 11) * Math.sin(Math.PI * ph) * ahK * (1 - ss(.6, 1, u) * .6);
    if (r > .5) sp(hc.x + Math.cos(a) * R, hc.y + Math.sin(a) * R * .8, r, i % 3 ? C.goldPale : C.cream);
  }

  // ---- her voice: gold rings from her mouth through the "Ah" (04-sky's laugh rings; they grow with the push) ----
  if (t > T.ah) {
    const mouth = Mh.transformPoint(new DOMPoint(800, 640)), rot = Math.atan2(Mh.b, Mh.a) - .35, sc = Math.max(headS, .5);
    for (let i = 0; i < 12; i++) {
      const at = T.ah + .15 + i * .45; if (at > 145.6) break;
      const d = t - at; if (d < 0 || d > 2.4) continue; const k = d / 2.4;
      g.save(); g.translate(mouth.x, mouth.y); g.rotate(rot);
      g.globalAlpha *= (1 - k) * .95; g.strokeStyle = i % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(16, 4, k) * sc; g.lineCap = 'round';
      g.beginPath(); g.arc(0, 0, (40 + k * 520) * sc, -.75, .75); g.stroke(); g.restore();
    }
  }
  void c;
}, { xin: .5, tr: 'fade' });
})();
