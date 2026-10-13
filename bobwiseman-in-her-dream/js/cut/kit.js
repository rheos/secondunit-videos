// In Her Dream, cut-paper kit. Shared by every shot file in js/cut/shots/.
// Look: flat paper layers with soft drop shadows, visible grain and mottling, people as jointed
// silhouette puppets (one colour per person, joints hidden by the colour), paper moving on twos.
// Everything is a pure function of song time t. Drawing goes to the global context `g`
// (main.js points it at the right buffer before each shot draws).
const W = 1920, H = 1080;
let g = null;

// ---------------- palette ----------------
const C = {
  // dream papers
  rose: '#e6a096', roseDeep: '#d4847c', roseDark: '#c46f69', cream: '#f4ead6', creamDeep: '#eadbbd',
  navy: '#1d2852', ink: '#141c3d', sky0: '#17204a', sky1: '#2c2f6e', sky2: '#5b4588', sky3: '#9a5a8c',
  gold: '#f1b23a', goldPale: '#f7d27e', sun: '#f6dfb0', mint: '#bfe0d2', teal: '#2f7f7a', tealDeep: '#245f5c',
  orange: '#e8743b', red: '#c8463c', leaf: '#5f8f5a', leafDeep: '#3f6b45', plum: '#6b3a5e', sand: '#e9c99a',
  white: '#f8f4ec', chrome: '#c9ccd3',
  // waking papers (cool, low)
  w0: '#2a3042', w1: '#3e4760', w2: '#5d6780', w3: '#8a93a8', w4: '#b9bfcc', lamp: '#f3d9a0', lampDeep: '#e4bf74',
};

// ---------------- maths ----------------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eo = (k) => 1 - Math.pow(1 - clamp(k), 3);
const ei = (k) => Math.pow(clamp(k), 3);
const eio = (k) => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const back = (k) => { k = clamp(k); const c = 1.6; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const twos = (t) => Math.floor(t * 12) / 12;                                          // paper moves on twos
const jit = (t, k, a = 1.2) => (hash(Math.floor(t * 12) * 7.3 + k) - .5) * 2 * a;   // hand-placed wobble
// a pop: 0 before t0, overshoots to 1 over dur
const pop = (t, t0, dur = .5) => t < t0 ? 0 : back((t - t0) / dur);
// a bump that peaks at t0 + dur/2 and is 0 outside [t0, t0+dur]
const bump = (t, t0, dur) => (t < t0 || t > t0 + dur) ? 0 : Math.sin((t - t0) / dur * Math.PI);

// ---------------- paper textures (made once) ----------------
function grainCanvas(seed, w = W, h = H) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  const id = x.createImageData(w, h); const d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 128 + (hash(i * .25 + seed) - .5) * 70; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  x.putImageData(id, 0, 0);
  x.globalAlpha = .07; x.lineWidth = 1;
  const nf = Math.round(2600 * w * h / (W * H));
  for (let i = 0; i < nf; i++) {
    const px = hash(i + seed) * w, py = hash(i * 3.1 + seed) * h, a = hash(i * 5.7 + seed) * Math.PI, l = 8 + hash(i * 9.1) * 30;
    x.strokeStyle = hash(i * 2.3) > .5 ? '#fff' : '#000';
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + .4) * l * .5, py + Math.sin(a + .4) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  return c;
}
const GRAIN = grainCanvas(1.7), GRAIN2 = grainCanvas(9.3);
const MOTTLE = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const s = grainCanvas(4.4, 96, 54); x.filter = 'blur(18px)'; x.drawImage(s, -40, -40, W + 80, H + 80); return c; })();

// ---------------- the paper primitive ----------------
// cut(path, fill, opts): one layer of cut paper. sh = shadow strength, lift = height above the layer
// below (bigger, softer shadow), grain = how much paper texture shows on it.
function cut(path, fill, { sh = 1, grain = .22, lift = 0, alpha = 1, rule = 'nonzero' } = {}) {
  g.save();
  if (alpha < 1) g.globalAlpha *= alpha;
  if (sh > 0) { g.shadowColor = `rgba(20,16,30,${.32 * sh})`; g.shadowBlur = 16 + lift * 12; g.shadowOffsetX = 4 + lift * 4; g.shadowOffsetY = 7 + lift * 6; }
  g.fillStyle = fill; g.fill(path, rule);
  g.restore();
  if (grain) {
    g.save(); g.clip(path, rule); g.globalAlpha *= grain * alpha; g.globalCompositeOperation = 'soft-light';
    const m = g.getTransform(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(GRAIN2, 0, 0);
    g.globalAlpha = Math.min(1, g.globalAlpha * 1.6); g.drawImage(MOTTLE, 0, 0); g.setTransform(m);
    g.restore();
  }
}
// fill the whole frame with one sheet of paper
function sheet(col, alpha = 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha *= alpha; g.fillStyle = col; g.fillRect(-10, -10, W + 20, H + 20); g.restore(); }

// ---------------- path helpers ----------------
// cubic point list: [x0,y0, c1x,c1y,c2x,c2y,x,y, ...]
function pathOf(pts) {
  const p = new Path2D(); p.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 6) p.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]);
  p.closePath(); return p;
}
// smooth closed shape through points (Catmull-Rom), with optional per-point hand wobble
function blob(pts, tension = .5) {
  const p = new Path2D(); const n = pts.length;
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3,
      p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
  p.closePath(); return p;
}
function poly(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
function circle(x, y, r) { const p = new Path2D(); p.arc(x, y, Math.max(.1, r), 0, Math.PI * 2); return p; }
function ellipse(x, y, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, Math.PI * 2); return p; }
function rect(x, y, w, h) { const p = new Path2D(); p.rect(x, y, w, h); return p; }
function rrect(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; }
// a rectangle with slightly irregular, hand-cut edges (seeded so it is stable)
function cutRect(x, y, w, h, seed = 0, wob = 2.5) {
  const pts = []; const n = Math.max(2, Math.round(w / 90)), m = Math.max(2, Math.round(h / 90));
  for (let i = 0; i <= n; i++) pts.push([x + w * i / n, y + (hash(seed + i) - .5) * wob]);
  for (let i = 1; i <= m; i++) pts.push([x + w + (hash(seed + 50 + i) - .5) * wob, y + h * i / m]);
  for (let i = n - 1; i >= 0; i--) pts.push([x + w * i / n, y + h + (hash(seed + 100 + i) - .5) * wob]);
  for (let i = m - 1; i > 0; i--) pts.push([x + (hash(seed + 150 + i) - .5) * wob, y + h * i / m]);
  return poly(pts);
}
function star4(x, y, r) {
  const p = new Path2D(); const k = r * .28;
  p.moveTo(x, y - r); p.quadraticCurveTo(x + k * .4, y - k * .4, x + r, y); p.quadraticCurveTo(x + k * .4, y + k * .4, x, y + r);
  p.quadraticCurveTo(x - k * .4, y + k * .4, x - r, y); p.quadraticCurveTo(x - k * .4, y - k * .4, x, y - r); p.closePath(); return p;
}
function crescent(x, y, r, phase = .55, rot = 0) {
  // phase: how far the inner circle is offset (0 = thin sliver, 1 = nearly full)
  const p = new Path2D(); const c = Math.cos(rot), s = Math.sin(rot);
  const N = 40, pts = [];
  for (let i = 0; i <= N; i++) { const a = -Math.PI / 2 + Math.PI * i / N; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  for (let i = N; i >= 0; i--) { const a = -Math.PI / 2 + Math.PI * i / N; pts.push([Math.cos(a) * r * (1 - 2 * phase), Math.sin(a) * r]); }
  p.moveTo(x + pts[0][0] * c - pts[0][1] * s, y + pts[0][0] * s + pts[0][1] * c);
  for (const [px, py] of pts) p.lineTo(x + px * c - py * s, y + px * s + py * c);
  p.closePath(); return p;
}
// a torn-paper ribbon from x0 to x1 at height y
function ribbon(x0, x1, y, th, ph, wave = 22) {
  const p = new Path2D(); const n = 24; const pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0, x1, u), y + Math.sin(u * 5 + ph) * wave]); }
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= n; i++) { const u = i / n; p.lineTo(pts[i][0], pts[i][1] - th * Math.sin(u * Math.PI) * .5 + (hash(i + ph) - .5) * 2); }
  for (let i = n; i >= 0; i--) { const u = i / n; p.lineTo(pts[i][0], pts[i][1] + th * Math.sin(u * Math.PI) * .5 + (hash(i * 3 + ph) - .5) * 2); }
  p.closePath(); return p;
}
// a ribbon along an arbitrary polyline of [x,y] points with width w (tapered ends)
function ribbonAlong(pts, w) {
  const L = [], R = []; const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const ww = w * .5 * Math.sin(Math.PI * (i / (n - 1)) * .999 + .001) ** .5;
    L.push([pts[i][0] - dy * ww, pts[i][1] + dx * ww]); R.push([pts[i][0] + dy * ww, pts[i][1] - dx * ww]);
  }
  return poly(L.concat(R.reverse()));
}
// a scalloped cloud: centre x,y, width w, height h
function cloud(x, y, w, h, seed = 0) {
  const pts = []; const n = 9;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n; const bump = .82 + hash(seed + i) * .3;
    pts.push([x + Math.cos(a) * w * .5 * bump, y + Math.sin(a) * h * .5 * (a > 0 && a < Math.PI ? .55 : bump)]);
  }
  return blob(pts, .9);
}
// a five-petal paper flower
function flowerPath(x, y, r, petals = 5, rot = 0) {
  const p = new Path2D();
  for (let i = 0; i < petals; i++) { const a = rot + Math.PI * 2 * i / petals; p.ellipse(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .5, r * .3, a, 0, Math.PI * 2); }
  return p;
}
function flower(x, y, r, col, centre = C.gold, rot = 0, opts = {}) { cut(flowerPath(x, y, r, 5, rot), col, { sh: .6, ...opts }); cut(circle(x, y, r * .26), centre, { sh: .3, grain: .1 }); }
// a little paper bird (wings flap with ph)
function bird(x, y, s, ph, col = C.cream, dir = 1) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  const f = Math.sin(ph) * 0.9;
  cut(blob([[-40, 0], [-10, -10], [30, -6], [46, 0], [30, 8], [-10, 10]], .7), col, { sh: .6 });
  cut(poly([[-6, -4], [16, -4], [4, -4 - 46 * f - 10]]), col, { sh: .5 });
  g.restore();
}
// laughter / joy: gold rings riding out from a point (the motif from the look test)
function laughRings(t, x, y, at, { n = 3, dir = -.35, spread = .75, reach = 520, life = 2.4, w0 = 14, scale = 1 } = {}) {
  for (let r = 0; r < n; r++) {
    const d = t - at - r * .16; if (d < 0 || d > life) continue;
    const k = d / life;
    g.save(); g.translate(x, y); g.rotate(dir);
    g.globalAlpha *= (1 - k) * .95; g.strokeStyle = r % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(w0, 3, k) * scale; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, (30 + k * reach) * scale, -spread, spread); g.stroke();
    g.restore();
  }
}

// ---------------- heads ----------------
// All heads face RIGHT, drawn in a ~1000 unit box, neck pivot at (580, 800).
const HEAD_HER = [
  150, 1180,
  220, 1040, 330, 950, 372, 850,
  384, 812, 378, 782, 356, 760,
  292, 756, 240, 712, 246, 648,
  252, 590, 296, 560, 338, 556,
  326, 470, 350, 360, 420, 284,
  492, 204, 612, 190, 682, 250,
  732, 292, 748, 346, 744, 398,
  742, 424, 736, 440, 740, 456,
  760, 494, 788, 532, 803, 562,
  808, 575, 799, 585, 783, 587,
  771, 589, 766, 596, 769, 606,
  772, 616, 780, 620, 779, 630,
  780, 637, 770, 640, 765, 643,
  771, 650, 777, 656, 773, 668,
  771, 680, 758, 684, 762, 698,
  769, 720, 760, 744, 731, 754,
  700, 763, 660, 757, 630, 764,
  614, 794, 611, 834, 630, 884,
  652, 934, 724, 964, 806, 994,
  860, 1020, 900, 1080, 920, 1180,
];
// same face, short hair, no bun (men, older friends with a hat on)
const HEAD_SHORT = HEAD_HER.slice();
(() => { const s = (k) => 2 + k * 6; const set = (k, a) => a.forEach((v, j) => HEAD_SHORT[s(k) + j] = v);
  set(1, [384, 812, 372, 790, 360, 760]); set(2, [342, 720, 326, 690, 322, 650]); set(3, [318, 610, 318, 580, 326, 540]); })();
// a child: rounder skull, high forehead, small nose, soft chin
const HEAD_CHILD = [
  380, 1060,
  398, 960, 420, 880, 410, 812,
  300, 780, 246, 650, 266, 520,
  286, 360, 420, 246, 566, 246,
  690, 246, 770, 330, 778, 432,
  780, 462, 776, 482, 782, 497,
  796, 522, 814, 545, 815, 560,
  815, 574, 803, 580, 792, 580,
  787, 590, 792, 600, 794, 610,
  792, 620, 784, 625, 782, 630,
  790, 640, 790, 650, 782, 662,
  774, 672, 772, 680, 777, 700,
  780, 726, 760, 746, 730, 752,
  690, 758, 640, 762, 622, 794,
  612, 846, 616, 920, 640, 1060,
];
const HEADS = { her: pathOf(HEAD_HER), short: pathOf(HEAD_SHORT), child: pathOf(HEAD_CHILD) };
// hair pieces added on top of a head (same head units)
const HAIR = {
  bun: null,
  pony: blob([[300, 460], [200, 520], [150, 640], [170, 760], [215, 700], [250, 600], [320, 540]], .6),
  pigtail: blob([[300, 520], [210, 560], [170, 640], [205, 690], [250, 640], [310, 600]], .6),
  bob: blob([[300, 300], [470, 210], [640, 230], [700, 300], [600, 280], [460, 300], [380, 420], [350, 640], [400, 760], [300, 770], [240, 640], [250, 430]], .5),
  curls: (() => { const p = new Path2D(); for (let i = 0; i < 9; i++) { const a = Math.PI * (.95 + i * .13); p.arc(500 + Math.cos(a) * 250, 500 + Math.sin(a) * 250, 70, 0, Math.PI * 2); } return p; })(),
  hat: blob([[230, 380], [330, 230], [500, 170], [660, 210], [740, 330], [790, 380], [760, 400], [500, 360], [260, 420]], .5),
  cap: blob([[290, 330], [420, 220], [600, 220], [720, 300], [880, 330], [870, 350], [700, 360], [320, 400]], .45),
};

// ---------------- the silhouette puppet ----------------
// spec: { col, kind: 'dress'|'shirt'|'coat'|'skirt', head: 'her'|'short'|'child', hair, height (1 = adult),
//          headK (head scale), coatCol (a second paper colour for a coat/apron), acc: [...] }
// pose: { head, lean, bob, arms: [[sh, el], [sh, el]] (near, far), legs: [[hip, knee], [hip, knee]], sit }
// Angles: radians, 0 = limb hanging straight down, positive = swung FORWARD (toward the way she faces).
// The puppet's feet stand at (0,0); an adult is 1000 units tall. Use puppet(x, y, s, dir, spec, pose).
function limb(L, w0, w1) {
  // a tapered capsule pointing down from the pivot
  const p = new Path2D();
  p.moveTo(-w0 / 2, 0); p.lineTo(-w1 / 2, L); p.arc(0, L, w1 / 2, Math.PI, 0, true); p.lineTo(w0 / 2, 0); p.arc(0, 0, w0 / 2, 0, Math.PI, true);
  p.closePath(); return p;
}
// shin with a calf: knee at 0, ankle at 250, calf bulging to the back (-x)
function shinPath(w = 1) {
  return blob([[-24 * w, 0], [-30 * w, 50], [-31 * w, 100], [-22 * w, 170], [-13 * w, 238], [-12 * w, 252], [12 * w, 252], [14 * w, 220],
    [17 * w, 140], [22 * w, 60], [24 * w, 0], [0, -22 * w]], .5);
}
function dressPath(hem = -175, flare = 1) {
  // shoulders, bust, waist, a flared skirt with a softly scalloped hem
  const pts = [[0, -806], [-24, -804], [-50, -790], [-62, -768], [-64, -730], [-62, -680], [-52, -620], [-44, -580],
    [-60, -520], [-84 * flare, -420], [-108 * flare, -300], [-122 * flare, hem + 10]];
  const n = 7; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(-122 * flare, 116 * flare, u), hem + (i % 2 ? 10 : -2)]); }
  pts.push([100 * flare, -300], [78 * flare, -420], [52, -520], [40, -580], [52, -630], [70, -676], [68, -712], [56, -750], [40, -784], [22, -804]);
  return blob(pts, .45);
}
const PARTS = {
  upper: limb(170, 46, 36), fore: limb(160, 36, 26), hand: blob([[-14, 0], [14, 0], [20, 26], [12, 48], [-4, 52], [-16, 30]], .6),
  thigh: limb(270, 66, 48), shin: shinPath(1), shinKid: shinPath(1.25),
  shoe: blob([[-16, -12], [24, -14], [58, -4], [60, 8], [-18, 10]], .4),
  dress: dressPath(-175, 1),
  dressShort: dressPath(-300, .9),
  shirt: blob([[0, -806], [-24, -804], [-50, -790], [-62, -768], [-66, -720], [-62, -640], [-56, -540], [-58, -470], [56, -470], [52, -540],
    [58, -640], [64, -700], [58, -750], [40, -786], [22, -804]], .4),
  coat: blob([[0, -806], [-26, -804], [-54, -790], [-66, -766], [-70, -720], [-70, -600], [-74, -460], [-82, -300], [-86, -250], [84, -250],
    [80, -300], [72, -460], [66, -600], [70, -690], [62, -750], [42, -788], [22, -804]], .4),
  hips: ellipse(0, -500, 58, 60),
};
// her lace: a row of small cut-outs near the hem and a scalloped collar, Reiniger style
const LACE = (() => { const p = new Path2D(); p.addPath(PARTS.dress);
  for (let i = 0; i < 7; i++) { const x = -96 + i * 30, y = -232 + (i % 2) * 6; p.moveTo(x + 9, y); p.arc(x, y, 9, 0, Math.PI * 2); }
  for (let i = 0; i < 6; i++) { const x = -84 + i * 32, y = -272; p.moveTo(x + 5, y); p.arc(x, y, 5, 0, Math.PI * 2); }
  return p; })();
function head(kind, hair, col, k, angle, laugh = 0) {
  g.save(); g.rotate(-angle * .9 - laugh * .18); g.scale(k, k); g.translate(-580, -800);
  g.save(); g.beginPath(); g.rect(-200, -200, 1400, 1040); g.clip();
  cut(HEADS[kind], col, { sh: .5, grain: .25 });
  if (hair && HAIR[hair]) cut(HAIR[hair], col, { sh: .3, grain: .2 });
  g.restore(); g.restore();
}
function arm(sh, el, col, holding) {
  g.save(); g.rotate(-sh); cut(PARTS.upper, col, { sh: .45, grain: .2 });
  g.translate(0, 168); g.rotate(-el); cut(PARTS.fore, col, { sh: .4, grain: .2 });
  g.translate(0, 150); cut(PARTS.hand, col, { sh: .35, grain: .15 });
  if (holding) { g.save(); g.translate(4, 40); holding(); g.restore(); }
  g.restore();
}
function leg(hip, knee, col, shoeCol, kid) {
  g.save(); g.rotate(-hip); cut(PARTS.thigh, col, { sh: .45, grain: .2 });
  g.translate(0, 266); g.rotate(knee); cut(kid ? PARTS.shinKid : PARTS.shin, col, { sh: .4, grain: .2 });
  g.translate(0, 250); g.rotate(hip - knee); cut(PARTS.shoe, shoeCol || col, { sh: .35, grain: .2 });
  g.restore();
}
function puppet(x, y, s, dir, spec, pose = {}) {
  const col = spec.col || C.navy, body = spec.bodyCol || col;
  const hk = spec.headK || (spec.head === 'child' ? .3 : .265);
  const arms = pose.arms || [[0, .15], [0, .15]], legs = pose.legs || [[0, 0], [0, 0]];
  g.save(); g.translate(x, y + (pose.bob || 0) * s); g.scale(s * (spec.height || 1) * dir, s * (spec.height || 1));
  if (pose.sit) {
    // seated: hips at chair height, thighs forward
    g.translate(0, 270);
  }
  g.rotate(pose.lean || 0);
  const legCol = spec.legCol || col;
  // far limbs first
  g.save(); g.translate(-6, -540); leg(legs[1][0], legs[1][1], legCol, spec.shoeCol, spec.head === 'child'); g.restore();
  g.save(); g.translate(-8, -752); arm(arms[1][0], arms[1][1], spec.armCol || body, pose.holdFar); g.restore();
  g.save(); g.translate(6, -540); leg(legs[0][0], legs[0][1], legCol, spec.shoeCol, spec.head === 'child'); g.restore();
  if (spec.kind === 'shirt') cut(PARTS.hips, legCol, { sh: .3, grain: .2 });
  if (spec.lace) cut(LACE, body, { sh: .6, grain: .26, lift: .2, rule: 'evenodd' });
  else cut(PARTS[spec.kind || 'dress'], body, { sh: .6, grain: .26, lift: .2 });
  if (spec.acc) spec.acc.forEach((a) => a(pose));
  g.save(); g.translate(10, -790); head(spec.head || 'her', spec.hair, spec.headCol || col, hk, pose.head || 0, pose.laugh || 0);
  if (spec.headAcc) spec.headAcc(pose);
  g.restore();
  g.save(); g.translate(8, -752); arm(arms[0][0], arms[0][1], spec.armCol || body, pose.holdNear); g.restore();
  g.restore();
}
// ready-made poses
const POSE = {
  stand: () => ({}),
  walk: (ph, amp = 1) => {
    const s = Math.sin(ph), c = Math.cos(ph);
    return {
      legs: [[.3 * s * amp, Math.max(0, -c) * .55 * amp + .04], [-.3 * s * amp, Math.max(0, c) * .55 * amp + .04]],
      arms: [[-.32 * s * amp, .22], [.32 * s * amp, .22]],
      bob: -Math.abs(Math.cos(ph)) * 10 * amp, head: .02 * Math.sin(ph * 2),
    };
  },
  wave: (t, f = 7) => ({ arms: [[1.55, 1.25 + Math.sin(t * f) * .3], [.05, .2]] }),
  sit: () => ({ sit: true, legs: [[1.55, 1.5], [1.5, 1.55]] }),
  // laughing: head back, shoulders bounce
  laugh: (t, k = 1) => ({ head: -.18 * k, laugh: k, bob: Math.abs(Math.sin(t * 9)) * -8 * k, lean: -.04 * k }),
};

// ---------------- common props ----------------
// a cut-paper table seen from the side (top at y, from x0 to x1)
function table(x0, x1, y, col = C.roseDark, legH = 330, top = 26) {
  cut(cutRect(x0 + 30, y, 26, legH, 11), col, { sh: .5 });
  cut(cutRect(x1 - 56, y, 26, legH, 12), col, { sh: .5 });
  cut(cutRect(x0, y - top, x1 - x0, top + 6, 13), col, { sh: .8, lift: .3 });
}
function cloth(x0, x1, y, col, drop = 120, seed = 3) {
  const pts = [[x0 - 8, y - 4], [x1 + 8, y - 4]];
  const n = 10; for (let i = 0; i <= n; i++) { const u = 1 - i / n; pts.push([lerp(x0 - 8, x1 + 8, u), y + drop + (i % 2 ? 14 : 0) + (hash(seed + i) - .5) * 6]); }
  cut(poly(pts), col, { sh: .6, lift: .2 });
}
function bowl(x, y, r, col, fill) {
  if (fill) fill();
  const p = new Path2D(); p.moveTo(x - r, y); p.quadraticCurveTo(x, y + r * 1.25, x + r, y); p.closePath();
  cut(p, col, { sh: .6 });
}
function orange(x, y, r) { cut(circle(x, y, r), C.orange, { sh: .6 }); cut(ellipse(x + r * .25, y - r * .95, r * .3, r * .14, -.4), C.leaf, { sh: .3, grain: .1 }); }
function loaf(x, y, w) {
  cut(blob([[x - w / 2, y], [x - w * .45, y - w * .3], [x, y - w * .42], [x + w * .45, y - w * .3], [x + w / 2, y]], .7), C.sand, { sh: .6 });
  g.save(); g.strokeStyle = 'rgba(150,90,40,.45)'; g.lineWidth = 4; g.lineCap = 'round';
  for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * w * .22 - 10, y - w * .3); g.lineTo(x + i * w * .22 + 10, y - w * .18); g.stroke(); }
  g.restore();
}
function cup(x, y, s, col) {
  cut(rrect(x - 22 * s, y - 40 * s, 44 * s, 40 * s, 6 * s), col, { sh: .5 });
  g.save(); g.strokeStyle = col; g.lineWidth = 7 * s; g.beginPath(); g.arc(x + 26 * s, y - 22 * s, 11 * s, -1.4, 1.4); g.stroke(); g.restore();
}
// a house front for a street, with windows (lit = 0..1 warmth), door, stoop
function house(x, y, w, h, col, { roof = 'flat', lit = 0, seed = 0, door = true, winCol = C.goldPale, darkWin = C.ink } = {}) {
  const body = roof === 'gable' ? poly([[x, y], [x, y - h], [x + w / 2, y - h - w * .32], [x + w, y - h], [x + w, y]]) : cutRect(x, y - h, w, h, seed);
  cut(body, col, { sh: .8, lift: .3 });
  if (roof === 'flat') cut(cutRect(x - 10, y - h - 22, w + 20, 24, seed + 5), C.ink, { sh: .5, alpha: .55 });
  const cols = Math.max(2, Math.floor(w / 120)), rows = Math.max(1, Math.floor((h - 120) / 150));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (door && r === rows - 1 && c === 0) continue;
    const wx = x + (c + .5) * w / cols - 28, wy = y - h + 60 + r * 150;
    const on = clamp(lit * 1.4 - hash(seed + r * 7 + c) * .4);
    g.save(); g.fillStyle = darkWin; g.fill(rect(wx, wy, 56, 80)); g.globalAlpha *= on; cut(rect(wx, wy, 56, 80), winCol, { sh: 0, grain: .2 }); g.restore();
    cut(rect(wx - 6, wy + 78, 68, 8), C.cream, { sh: .3, grain: .1, alpha: .8 });
  }
  if (door) { cut(rrect(x + w / cols / 2 - 34, y - 150, 68, 150, [30, 30, 0, 0]), C.ink, { sh: .4 });
    cut(cutRect(x + w / cols / 2 - 60, y - 14, 120, 16, seed + 9), C.cream, { sh: .5, alpha: .9 }); }
}
// a street lamp
function streetLamp(x, y, h, on = 1) {
  cut(cutRect(x - 7, y - h, 14, h, 77), C.ink, { sh: .5 });
  cut(ellipse(x, y - h - 16, 34, 24), C.ink, { sh: .5 });
  if (on > 0) { g.save(); g.globalAlpha *= on * .55; const gr = g.createRadialGradient(x, y - h, 10, x, y - h, 260); gr.addColorStop(0, 'rgba(247,210,126,.9)'); gr.addColorStop(1, 'rgba(247,210,126,0)');
    g.fillStyle = gr; g.fill(circle(x, y - h, 260)); g.restore(); cut(circle(x, y - h, 16), C.goldPale, { sh: 0, grain: .1, alpha: on }); }
}

// ---------------- shot registry ----------------
// SHOT(a, b, name, fn, opts): fn(t, k, d) draws one frame at song time t; k = 0..1 through the shot, d = seconds in.
// opts.xin: seconds of transition INTO this shot from the previous one; opts.tr: 'fade' | 'slide' | 'wipe' | 'iris'
const SHOTS = [];
function SHOT(a, b, name, fn, opts = {}) { SHOTS.push({ a, b, name, fn, o: opts }); SHOTS.sort((x, y) => x.a - y.a); }
