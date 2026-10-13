// 190.7-207.64  "In her dream the rent's not increased and her skirt's not torn at the seam"
// 12a: she walks home to her green front door. A rent notice is taped to it. Through the long held
// "dream" a vine climbs the door frame and the fanlight warms (the breath). On "rent's" the notice shivers,
// on "not increased" its figure loses digits, then the sheet peels off, folds into a paper bird and flies.
// 12b: close on her skirt: a tear at the seam is stitched shut by a running gold thread on "torn ... seam",
// then flowers bloom along the seam and the hem swings.
// Colours: leaf (door, leaves), cream (notice, bird, flowers, needle), navy (her), gold (glow, thread).
(() => {
const T = { dream: 192.14, rents: 198.78, not: 199.2, incr: 199.52, peel: 200.1, fold: 200.32, fly: 200.52,
  cut: 201.3, skirt: 201.43, torn: 202.79, seam: 204.41, end: 207.64 };
const BEAT = (t0, n) => [...Array(n).keys()].map((i) => t0 + i * .39);

// ---- local FK / IK (the kit has no hand-position helper) ----
const DEG = 180 / Math.PI;
function rootM(x, y, s, dir, spec, pose) {
  const h = spec.height || 1;
  return new DOMMatrix().translateSelf(x, y + (pose.bob || 0) * s).scaleSelf(s * h * dir, s * h).rotateSelf((pose.lean || 0) * DEG);
}
const armRoot = (M, near) => M.multiply(new DOMMatrix().translateSelf(near ? 8 : -8, -752));
function ik(M, near, P) {
  const L1 = 168, L2 = 190;
  const q = armRoot(M, near).inverse().transformPoint(new DOMPoint(P.x, P.y));
  let d = clamp(Math.hypot(q.x, q.y), 40, L1 + L2 - .5);
  const a1 = Math.atan2(q.x, q.y) - Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return [a1, Math.atan2(q.x - L1 * Math.sin(a1), q.y - L1 * Math.cos(a1)) - a1];
}
const mixP = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });

// ---- 12a pieces ----
const DOOR = { x: 1090, y: 150, w: 330, h: 720 };      // arched top, bottom at y + h
const NOTE = { x: 1255, y: 505, w: 196, h: 256 };
function door(t, glow) {
  const { x, y, w, h } = DOOR, r = w / 2;
  // the frame: pilasters and an arch of the wall's own paper, a shade deeper
  const fr = new Path2D(); fr.moveTo(x - 46, y + h); fr.lineTo(x - 46, y + r); fr.arc(x + r, y + r, r + 46, Math.PI, 0); fr.lineTo(x + w + 46, y + h); fr.closePath();
  cut(fr, C.roseDeep, { sh: .7, lift: .2 });
  const d = new Path2D(); d.moveTo(x, y + h); d.lineTo(x, y + r); d.arc(x + r, y + r, r, Math.PI, 0); d.lineTo(x + w, y + h); d.closePath();
  cut(d, C.leaf, { sh: .9, lift: .4, grain: .3 });
  // fanlight: a half-round of warm light in the arch, with spokes
  const fan = new Path2D(); fan.moveTo(x + 26, y + r + 10); fan.arc(x + r, y + r + 10, r - 26, Math.PI, 0); fan.closePath();
  g.save(); g.fillStyle = C.leafDeep; g.fill(fan); g.restore();
  cut(fan, C.goldPale, { sh: 0, grain: .2, alpha: lerp(.55, 1, glow) });
  g.save(); g.clip(fan); g.strokeStyle = C.leafDeep; g.lineWidth = 9;
  for (let i = 1; i < 5; i++) { const a = Math.PI + Math.PI * i / 5; g.beginPath(); g.moveTo(x + r, y + r + 10); g.lineTo(x + r + Math.cos(a) * r, y + r + 10 + Math.sin(a) * r); g.stroke(); }
  g.restore();
  // glow spilling from the fanlight
  if (glow > 0) { g.save(); g.globalAlpha *= glow * .35; const gr = g.createRadialGradient(x + r, y + r, 20, x + r, y + r, 360);
    gr.addColorStop(0, 'rgba(247,210,126,.9)'); gr.addColorStop(1, 'rgba(247,210,126,0)'); g.fillStyle = gr; g.fill(circle(x + r, y + r, 360)); g.restore(); }
  // panels, tonal; a gold knob
  for (const [px, py, pw, ph] of [[x + 40, y + r + 50, w / 2 - 58, 170], [x + w / 2 + 18, y + r + 50, w / 2 - 58, 170],
    [x + 40, y + r + 260, w / 2 - 58, 250], [x + w / 2 + 18, y + r + 260, w / 2 - 58, 250]])
    cut(cutRect(px, py, pw, ph, px * .1), C.leafDeep, { sh: -0, grain: .2, alpha: .55 });
  cut(circle(x + w - 46, y + h - 330, 13), C.gold, { sh: .6 });
  // stoop: two steps
  cut(cutRect(x - 70, y + h, w + 140, 22, 31), C.roseDeep, { sh: .7, lift: .2 });
  cut(cutRect(x - 110, y + h + 20, w + 220, 26, 32), C.roseDeep, { sh: .7, lift: .2 });
}
// the vine that climbs the left pilaster during the held "dream"
const VINE = (() => { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([DOOR.x - 46 + Math.sin(u * 9) * 18, DOOR.y + DOOR.h + 30 - u * 640]); } return pts; })();
const LEAVES = BEAT(192.64, 13).map((at, i) => ({ at, u: .08 + i * .068, side: i % 2 ? 1 : -1 }));
function vine(t) {
  const grow = ss(192.3, 197.6, t); if (grow <= 0) return;
  const n = Math.max(2, Math.round(VINE.length * grow));
  g.save(); g.strokeStyle = C.leafDeep; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
  g.shadowColor = 'rgba(20,16,30,.25)'; g.shadowBlur = 8; g.shadowOffsetX = 3; g.shadowOffsetY = 5;
  g.beginPath(); VINE.slice(0, n).forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.stroke(); g.restore();
  for (const L of LEAVES) {
    const k = pop(t, L.at, .45); if (k <= 0 || L.u > grow) continue;
    const i = Math.round(L.u * 40), [px, py] = VINE[i];
    g.save(); g.translate(px, py); g.rotate(L.side * .9 - .2); g.scale(k, k);
    cut(ellipse(L.side * 26, 0, 28, 13), C.leaf, { sh: .6, grain: .2 }); g.restore();
  }
  // two small blossoms at the top end
  for (const [at, u] of [[196.15, .78], [197.0, .9]]) {
    const k = pop(t, at, .5); if (k <= 0) continue; const [px, py] = VINE[Math.round(u * 40)];
    g.save(); g.translate(px, py); g.scale(k, k); flower(0, 0, 34, C.cream, C.gold, t * .2); g.restore();
  }
}
// the notice in its own coords (origin at its centre). digits: how many of the figure's digits remain
function notice(t, digits, shrink) {
  const { w, h } = NOTE;
  cut(cutRect(-w / 2, -h / 2, w, h, 41, 3), C.cream, { sh: .8, lift: .3, grain: .3 });
  // a header rule and two lines of small print, as bars
  cut(rrect(-70, -h / 2 + 34, 140, 11, 5), C.navy, { sh: 0, grain: .1 });
  g.save(); g.globalAlpha *= .45;
  cut(rrect(-70, h / 2 - 66, 140, 7, 3), C.navy, { sh: 0, grain: 0 }); cut(rrect(-70, h / 2 - 48, 96, 7, 3), C.navy, { sh: 0, grain: 0 });
  g.restore();
  // the figure: "$" and digit blocks, shrinking
  const s = lerp(1, .62, shrink);
  g.save(); g.translate(0, -6); g.scale(s, s);
  const nd = 4, gap = 30, x0 = -34;
  g.save(); g.strokeStyle = C.navy; g.lineWidth = 10; g.lineCap = 'round';
  const dx = x0 - 30;
  g.beginPath(); g.moveTo(dx + 20, -26); g.bezierCurveTo(dx + 12, -38, dx - 22, -36, dx - 20, -16); g.bezierCurveTo(dx - 18, 2, dx + 22, -2, dx + 22, 18);
  g.bezierCurveTo(dx + 22, 38, dx - 14, 42, dx - 22, 26); g.moveTo(dx, -48); g.lineTo(dx, 48); g.stroke(); g.restore();
  for (let i = 0; i < nd; i++) {
    const k = clamp(digits - i); if (k <= 0) continue;
    g.save(); g.translate(x0 + 16 + i * gap, 0); g.scale(k, k);
    cut(rrect(-11, -32, 22, 64, 9), C.navy, { sh: 0, grain: .1 }); g.restore();
  }
  g.restore();
}
// a folded-paper bird (the kit bird reads as a hat at this size): long faceted wings, a forked tail
function paperBird(x, y, s, ph, dir = 1) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  const f = Math.sin(ph);
  cut(poly([[-6, -2], [22, -2], [-2 - 18 * f, -8 - 70 * f]]), C.creamDeep, { sh: .4, grain: .2 });       // far wing
  cut(poly([[-46, 0], [-74, -20], [-62, 0], [-76, 16], [-36, 6], [8, 10], [40, 2], [62, -6], [40, -6], [6, -12]]), C.cream, { sh: .7, lift: .4 });
  cut(poly([[-16, 0], [20, 0], [-10 - 24 * f, -6 - 84 * f]]), C.cream, { sh: .6, lift: .4, grain: .25 });  // near wing
  g.restore();
}
function tape(x, y, rot) { g.save(); g.translate(x, y); g.rotate(rot); cut(cutRect(-30, -11, 60, 22, x, 2), C.goldPale, { sh: .3, grain: .2, alpha: .85 }); g.restore(); }

SHOT(190.7, T.cut, 'rent-door', (t, k) => {
  sheet(C.rose);
  // a faint coursing of the wall paper, tonal
  g.save(); g.globalAlpha *= .22; for (let r = 0; r < 9; r++) cut(rect(-10, 60 + r * 96, W + 20, 4), C.roseDeep, { sh: 0, grain: 0 }); g.restore();
  const push = eio(ss(192.6, 198.6, t));
  const zoom = lerp(1, 1.14, push);
  g.save(); g.translate(1060, 520); g.scale(zoom, zoom); g.translate(-1060, -520);
  // pavement
  cut(cutRect(-60, 905, W + 120, 240, 51, 4), C.roseDark, { sh: .7, lift: .2 });

  const glow = ss(192.4, 196.5, t);
  door(t, glow);
  vine(t);

  // ---- the notice: shiver, lose digits, peel, fold, fly ----
  const shiver = bump(t, T.rents - .05, .5);
  const digits = 4 - [T.not, T.incr, T.incr + .32].reduce((a, w) => a + ss(w - .02, w + .16, t), 0);
  const shrink = ss(T.not, T.incr + .5, t);
  const peel = ss(T.peel, T.fold, t), fold = ss(T.fold, T.fly, t);
  if (t < T.fly) {
    const tl = { x: NOTE.x - NOTE.w / 2 + 10, y: NOTE.y - NOTE.h / 2 + 8 };
    g.save(); g.translate(tl.x, tl.y);
    g.rotate(-.03 + Math.sin(t * 40) * .02 * shiver + peel * .5 + fold * .5);
    g.translate(peel * 30, -peel * 20 - fold * 40);
    g.scale(lerp(1, .25, eio(fold)), lerp(1, .5, eio(fold)));
    g.translate(NOTE.w / 2 - 10, NOTE.h / 2 - 8);
    notice(t, digits, shrink);
    g.restore();
    tape(tl.x + 4, tl.y - 2, -.6);
    if (peel < .3) tape(NOTE.x + NOTE.w / 2 - 14, NOTE.y - NOTE.h / 2 + 4, .55);
  }
  // the bird it became
  if (t >= T.fly - .02) {
    const f = eo((t - T.fly) / 1.5), ph = (t - T.fly) * 15;
    const bx = lerp(NOTE.x, 1740, f), by = lerp(NOTE.y - 40, 300, f) - Math.pow(Math.sin(f * Math.PI), .6) * 150;
    paperBird(bx, by, lerp(1.1, 1.9, ss(0, .25, f)), ph, 1);
  }

  // ---- her ----
  const ARR = 192.55, X1 = 880, X0 = -220;
  const walkK = clamp((t - 190.7) / (ARR - 190.7));
  const x = lerp(X0, X1, 1 - Math.pow(1 - walkK, 1.6));
  const stride = 2 * Math.PI / (610 * .66);
  const amp = 1 - ss(ARR - .35, ARR + .05, t);
  const pose = POSE.walk((x - X0) * stride, amp);
  const M = rootM(x, 905, .66, 1, CAST.her, pose);
  // worry on "rent's": both hands to her chest; relief as the digits go; she looks up after the bird
  const worry = ss(T.rents - .25, T.rents + .1, t) * (1 - ss(T.incr + .3, T.peel + .2, t));
  const chestN = M.transformPoint(new DOMPoint(110, -600)), chestF = M.transformPoint(new DOMPoint(90, -620));
  const restN = M.transformPoint(new DOMPoint(30, -390)), restF = M.transformPoint(new DOMPoint(-20, -390));
  if (amp < .01) {
    const watch = ss(T.fly, T.fly + .5, t);
    const up = M.transformPoint(new DOMPoint(260, -1120));
    let PN = mixP(mixP(restN, chestN, worry), up, watch * .9);
    const PF = mixP(restF, chestF, worry);
    pose.arms = [ik(M, true, PN), ik(M, false, PF)];
    if (watch > 0) pose.arms[0][1] += Math.sin((t - T.fly) * 12) * .25 * watch;
    pose.head = lerp(.12 * ss(193.4, 194.4, t), .45, ss(T.fly, T.fly + .6, t)) - .1 * worry;
    pose.laugh = watch * .5;
    pose.bob = Math.sin((t - ARR) * 1.6) * 3 * ss(ARR, ARR + 1, t);   // a breath
  }
  puppet(x, 905, .66, 1, CAST.her, pose);
  g.restore();
}, { xin: .8, tr: 'slide' });

// ---- 12b: the hem ----
const SEAM_X = 1120, TEAR = { y0: 290, y1: 610 };
function skirtPath(t, sway, legX) {
  const clear = (x) => legX.every((lx) => Math.abs(x - lx) > 62);
  // waist off the top of the frame, flaring to a scalloped hem around y 760; sway shifts the hem sideways
  const pts = [[700, -60], [1540, -60], [1610, 200], [1700, 520]];
  const hemL = 330 + sway, hemR = 1770 + sway, n = 11;
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(hemR, hemL, u), 770 + (i % 2 ? 26 : -4)]); }
  pts.push([380 + sway * .7, 520], [560, 200]);
  const p = blob(pts, .4);
  // lace: two rows of round cut-outs above the hem, as on her dress
  for (let i = 0; i < 12; i++) { const x = 440 + i * 112 + sway * .9, y = 690 + (i % 2) * 14; if (clear(x)) { p.moveTo(x + 22, y); p.arc(x, y, 22, 0, Math.PI * 2); } }
  for (let i = 0; i < 11; i++) { const x = 496 + i * 112 + sway * .85, y = 600; if (clear(x)) { p.moveTo(x + 11, y); p.arc(x, y, 11, 0, Math.PI * 2); } }
  return p;
}
// the tear: a jagged lens along the seam; open (0..1) per height, closing from the bottom as it is stitched
function tearPath(openAt, sway) {
  const N = 16, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, y = lerp(TEAR.y1, TEAR.y0, u), sx = SEAM_X + sway * lerp(.85, .55, u);
    const w = Math.sin(u * Math.PI) * 34 * openAt(y) + .1;
    const j = (hash(i * 3.1) - .5) * 14 * Math.min(1, w / 10);
    L.push([sx - w + j, y]); R.push([sx + w * .8 + j * .6, y + (hash(i * 7.7) - .5) * 6]);
  }
  return poly(L.concat(R.reverse()));
}
const STITCH = [...Array(8).keys()].map((i) => ({ at: T.torn + .1 + i * .195, y: lerp(TEAR.y1 - 12, TEAR.y0 + 12, i / 7) }));
const BLOOMS = BEAT(204.67, 6).map((at, i) => ({ at, y: lerp(640, 250, i / 5) + (i % 2) * 18, side: i % 2 ? 1 : -1, r: 40 - i * 2 }));

SHOT(T.cut, T.end, 'rent-seam', (t) => {
  sheet(C.rose);
  cut(cutRect(-60, 935, W + 120, 200, 61, 4), C.roseDark, { sh: .7, lift: .2 });
  // the hem breathes; after the flowers, a little twirl of joy
  const twirl = ss(205.4, 206.2, t);
  const sway = Math.sin(t * 2.2) * 10 + Math.sin((t - 205.4) * 5.2) * 46 * twirl;
  // her shins and shoes under the hem; a heel lifts with the twirl
  const step = Math.max(0, Math.sin((t - 205.4) * 5.2)) * twirl;
  g.save(); g.translate(870 + sway * .3, -99); g.scale(2.1, 2.1); leg(.04, .04 + step * .35, C.navy); g.restore();
  g.save(); g.translate(1230 + sway * .3, -99); g.scale(2.1, 2.1); leg(-.02, .02, C.navy); g.restore();

  // the skirt with its tear (the tear is a real hole: evenodd with the skirt)
  const front = (y) => {           // 0 = still open, 1 = stitched shut at height y
    let c = 0; for (const s of STITCH) if (t > s.at && y >= s.y - 22) c = Math.max(c, ss(s.at, s.at + .18, t));
    return c;
  };
  const tight = ss(T.seam - .05, T.seam + .15, t);
  const openAt = (y) => (1 - front(y) * .82) * (1 - tight) * lerp(1, .9, ss(T.skirt, T.torn, t)) + 0;
  const sk = skirtPath(t, sway, [870 + sway * .3, 1230 + sway * .3]);
  if (tight < 1) sk.addPath(tearPath(openAt, sway));
  cut(sk, C.navy, { sh: 1, lift: .6, grain: .3, rule: 'evenodd' });

  // ---- gold running stitch ----
  const sx = (y) => SEAM_X + sway * lerp(.85, .55, (TEAR.y1 - y) / (TEAR.y1 - TEAR.y0));
  g.save(); g.lineCap = 'round';
  let last = null;
  for (const s of STITCH) {
    const k = ss(s.at, s.at + .1, t); if (k <= 0) continue;
    const x = sx(s.y), wv = 26 * (1 - tight * .4);
    g.strokeStyle = C.gold; g.lineWidth = 6;
    g.shadowColor = 'rgba(20,16,30,.35)'; g.shadowBlur = 4; g.shadowOffsetX = 2; g.shadowOffsetY = 3;
    g.beginPath(); g.moveTo(x - wv, s.y + 12); g.lineTo(lerp(x - wv, x + wv, k), lerp(s.y + 12, s.y - 12, k)); g.stroke();
    last = { x: x + wv, y: s.y - 12 };
  }
  g.restore();
  // the needle, leading the thread, gone after the last pull
  const nOn = ss(T.torn - .15, T.torn + .05, t) * (1 - ss(T.seam + .1, T.seam + .45, t));
  if (nOn > 0) {
    const i = clamp(Math.floor((t - T.torn - .1) / .195), 0, 7), s = STITCH[i];
    const ph = clamp((t - s.at) / .195);
    const nx = sx(s.y) + lerp(-30, 40, ph), ny = s.y - lerp(-10, 40, Math.sin(ph * Math.PI)) - 10;
    const rise = ss(T.seam - .1, T.seam + .3, t);
    g.save(); g.globalAlpha *= nOn; g.translate(nx + rise * 60, ny - rise * 150); g.rotate(-.7 - rise * .3);
    const nd = new Path2D(); nd.moveTo(0, -70); nd.quadraticCurveTo(6, 0, 0, 52); nd.quadraticCurveTo(-6, 0, 0, -70); nd.moveTo(1.5, -56); nd.ellipse(0, -56, 1.6, 7, 0, 0, Math.PI * 2);
    cut(nd, C.cream, { sh: .7, lift: .5, grain: 0, rule: 'evenodd' });
    g.restore();
    // the thread from the last stitch to the needle's eye
    if (last) { g.save(); g.globalAlpha *= nOn; g.strokeStyle = C.gold; g.lineWidth = 4; g.lineCap = 'round';
      const ex = nx + rise * 60 + Math.sin(-.7 - rise * .3) * 56, ey = ny - rise * 150 - Math.cos(-.7 - rise * .3) * 56;
      g.beginPath(); g.moveTo(last.x, last.y); g.quadraticCurveTo((last.x + ex) / 2 + 20, Math.max(last.y, ey) + 30 * (1 - tight), ex, ey); g.stroke(); g.restore(); }
  }
  // on "seam": a glint where the thread pulls tight
  const gl = bump(t, T.seam, .6);
  if (gl > 0) cut(star4(sx(TEAR.y0) + 30, TEAR.y0 - 10, 34 * gl), C.goldPale, { sh: .2, grain: 0 });

  // ---- flowers bloom along the mended seam ----
  for (const b of BLOOMS) {
    const k = pop(t, b.at, .5); if (k <= 0) continue;
    const x = sx(clamp(b.y, TEAR.y0, TEAR.y1)) + b.side * 30 + (b.y > TEAR.y1 ? sway * .2 : 0);
    g.save(); g.translate(x, b.y); g.scale(k, k);
    for (const sd of [-1, 1]) { g.save(); g.rotate(sd * .9 + b.side * .3); cut(ellipse(0, 46, 14, 30), C.leaf, { sh: .5, grain: .2 }); g.restore(); }
    flower(0, 0, b.r, C.cream, C.gold, b.at * 1.7);
    g.restore();
  }
}, { xin: .3, tr: 'rise' });
})();
