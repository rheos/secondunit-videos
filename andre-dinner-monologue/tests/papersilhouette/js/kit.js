// Paper-silhouette kit for the Andre dinner reel, 720x1280. Trimmed and re-sized from
// bobwiseman-in-her-dream/js/cut/kit.js (the paper, shadow, grain and puppet machinery); none of
// that film's props or motifs come along. Everything is a pure function of time t; drawing goes to
// the global context `g` (main.js points it at the right buffer before each shot draws).
const W = 720, H = 1280;
let g = null;
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };

// ---------------- palette (at most four of these in a frame besides the ground) ----------------
const C = {
  ground: '#f4ead6',   // cream paper
  fig: '#17204a',      // people
  wall: '#7e3b2f',     // bricks, and the second paper layer of the big head
  seed: '#f1b23a',     // the seed, the one accent
  tower: '#5c6b8c',    // the skyline
  pine: '#2f5d3a',     // the pine
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
// a spring from 0 to 1 as a pure function of time: zeta = damping ratio, hz = speed (motion-lab numbers)
function spring(t, zeta = .72, hz = 2) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * hz;
  if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
}
// an arrival: 0 before t0, springs to 1 (zeta .67 overshoots 6%)
const arrive = (t, t0, hz = 2.2, zeta = .67) => t < t0 ? 0 : spring(t - t0, zeta, hz);
// a bump that peaks at t0 + dur/2 and is 0 outside [t0, t0+dur]
const bump = (t, t0, dur) => (t < t0 || t > t0 + dur) ? 0 : Math.sin((t - t0) / dur * Math.PI);
const outBounce = (t) => { let u = clamp(t); const n = 7.5625, d = 2.75;
  if (u < 1 / d) return n * u * u; if (u < 2 / d) return n * (u -= 1.5 / d) * u + .75;
  if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + .9375; return n * (u -= 2.625 / d) * u + .984375; };

// ---------------- paper textures (made once, at canvas pixels) ----------------
function grainCanvas(seed, w = W, h = H) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  const id = x.createImageData(w, h); const d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 128 + (hash(i * .25 + seed) - .5) * 70; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  x.putImageData(id, 0, 0);
  x.globalAlpha = .07; x.lineWidth = 1;
  const nf = Math.round(1200 * w * h / (W * H));
  for (let i = 0; i < nf; i++) {
    const px = hash(i + seed) * w, py = hash(i * 3.1 + seed) * h, a = hash(i * 5.7 + seed) * Math.PI, l = 8 + hash(i * 9.1) * 30;
    x.strokeStyle = hash(i * 2.3) > .5 ? '#fff' : '#000';
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + .4) * l * .5, py + Math.sin(a + .4) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  return c;
}
const GRAIN = grainCanvas(1.7), GRAIN2 = grainCanvas(9.3);
const MOTTLE = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const s = grainCanvas(4.4, 36, 64); x.filter = 'blur(18px)'; x.drawImage(s, -40, -40, W + 80, H + 80); return c; })();

// ---------------- the paper primitive ----------------
// cut(path, fill, opts): one layer of cut paper. sh = shadow strength, lift = height above the layer
// below (bigger, softer shadow), grain = how much paper texture shows on it.
function cut(path, fill, { sh = 1, grain = .22, lift = 0, alpha = 1, rule = 'nonzero' } = {}) {
  { const m = g.getTransform(); if (Math.abs(m.a * m.d - m.b * m.c) < 1e-6) return; }
  g.save();
  if (alpha < 1) g.globalAlpha *= alpha;
  if (sh > 0) { g.shadowColor = `rgba(20,16,30,${.32 * sh})`; g.shadowBlur = 12 + lift * 10; g.shadowOffsetX = 3 + lift * 3; g.shadowOffsetY = 5 + lift * 5; }
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
function sheet(col, alpha = 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha *= alpha; g.fillStyle = col; g.fillRect(-10, -10, W * 4, H * 4); g.restore(); }

// ---------------- path helpers ----------------
function pathOf(pts) {
  const p = new Path2D(); p.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 6) p.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]);
  p.closePath(); return p;
}
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
// a rectangle with slightly irregular, hand-cut edges (seeded so it is stable)
function cutRect(x, y, w, h, seed = 0, wob = 2.5) {
  const pts = []; const n = Math.max(2, Math.round(w / 60)), m = Math.max(2, Math.round(h / 60));
  for (let i = 0; i <= n; i++) pts.push([x + w * i / n, y + (hash(seed + i) - .5) * wob]);
  for (let i = 1; i <= m; i++) pts.push([x + w + (hash(seed + 50 + i) - .5) * wob, y + h * i / m]);
  for (let i = n - 1; i >= 0; i--) pts.push([x + w * i / n, y + h + (hash(seed + 100 + i) - .5) * wob]);
  for (let i = m - 1; i > 0; i--) pts.push([x + (hash(seed + 150 + i) - .5) * wob, y + h * i / m]);
  return poly(pts);
}
// a closed-eye crescent: a short stroke in the ground colour, the one feature allowed on a big head
function eyeCrescent(x, y, r, col, w) {
  g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round';
  g.beginPath(); g.arc(x, y, r, Math.PI * .12, Math.PI * .88); g.stroke(); g.restore();
}

// ---------------- the head ----------------
// Profile facing RIGHT in a ~1000 unit box, neck pivot at (580, 800). Short hair, no bun.
const HEAD_BASE = [
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
const HEAD_SHORT = HEAD_BASE.slice();
(() => { const s = (k) => 2 + k * 6; const set = (k, a) => a.forEach((v, j) => HEAD_SHORT[s(k) + j] = v);
  set(1, [384, 812, 372, 790, 360, 760]); set(2, [342, 720, 326, 690, 322, 650]); set(3, [318, 610, 318, 580, 326, 540]); })();
const HEAD = pathOf(HEAD_SHORT);
const EYE = { x: 700, y: 478 };    // head units
// the guard's kepi, head units: a flat crown and a short peak over the brow
const KEPI = (() => { const p = new Path2D();
  p.addPath(blob([[306, 440], [316, 270], [400, 150], [560, 110], [700, 140], [770, 230], [780, 390], [740, 410], [520, 370]], .45));
  p.addPath(poly([[730, 365], [905, 388], [905, 422], [720, 418]]));
  return p; })();
// the lower edge of the kepi (for the cut line that separates cap from head)
const KEPI_EDGE = [[312, 425], [420, 388], [560, 370], [700, 390], [740, 407], [905, 422]];

function head(col, k, angle, { cap = 0, capCol = col, eyeCol = null, eyeW = 7, ground = C.ground } = {}) {
  g.save(); g.rotate(-angle * .9); g.scale(k, k); g.translate(-580, -800);
  g.save(); g.beginPath(); g.rect(-200, -200, 1400, 1040); g.clip();
  cut(HEAD, col, { sh: .5, grain: .25 });
  if (cap > 0) { g.save(); g.translate(0, (1 - cap) * -120); g.scale(1, Math.max(.05, cap)); cut(KEPI, capCol, { sh: .5, grain: .2, lift: .2 });
    g.strokeStyle = ground; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); KEPI_EDGE.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore(); }
  if (eyeCol) eyeCrescent(EYE.x, EYE.y, 20, eyeCol, eyeW);
  g.restore(); g.restore();
}

// ---------------- the silhouette puppet ----------------
// feet at (0,0), an adult is 1000 units tall. puppet(x, y, s, dir, spec, pose).
// pose: { head, lean, bob, arms: [[sh, el], [sh, el]] (near, far), legs: [[hip, knee], [hip, knee]], cap }
// Angles: radians, 0 = limb hanging straight down, positive = swung FORWARD (toward the way it faces).
function limb(L, w0, w1) {
  const p = new Path2D();
  p.moveTo(-w0 / 2, 0); p.lineTo(-w1 / 2, L); p.arc(0, L, w1 / 2, Math.PI, 0, true); p.lineTo(w0 / 2, 0); p.arc(0, 0, w0 / 2, 0, Math.PI, true);
  p.closePath(); return p;
}
// shin with a calf: knee at 0, ankle at 250, calf bulging to the back (-x)
function shinPath(w = 1) {
  return blob([[-24 * w, 0], [-30 * w, 50], [-31 * w, 100], [-22 * w, 170], [-13 * w, 238], [-12 * w, 252], [12 * w, 252], [14 * w, 220],
    [17 * w, 140], [22 * w, 60], [24 * w, 0], [0, -22 * w]], .5);
}
const PARTS = {
  upper: limb(170, 46, 36), fore: limb(160, 36, 26), hand: blob([[-14, 0], [14, 0], [20, 26], [12, 48], [-4, 52], [-16, 30]], .6),
  thigh: limb(270, 66, 48), shin: shinPath(1),
  boot: blob([[-16, -14], [26, -16], [60, -4], [62, 10], [-18, 12], [-22, 0]], .4),
  // a work shirt: shoulders, a waist, a short tail; the collar point at the back of the neck is the craft cut
  shirt: blob([[0, -806], [-30, -804], [-58, -790], [-66, -768], [-70, -720], [-64, -640], [-56, -560], [-62, -470], [58, -470], [52, -560],
    [58, -640], [66, -700], [60, -750], [44, -786], [30, -820], [22, -804]], .4),
  hips: ellipse(0, -500, 58, 60),
};
function arm(sh, el, col, holding) {
  g.save(); g.rotate(-sh); cut(PARTS.upper, col, { sh: .45, grain: .2 });
  g.translate(0, 168); g.rotate(-el); cut(PARTS.fore, col, { sh: .4, grain: .2 });
  g.translate(0, 150); cut(PARTS.hand, col, { sh: .35, grain: .15 });
  if (holding) { g.save(); g.translate(4, 40); holding(); g.restore(); }
  g.restore();
}
function leg(hip, knee, col) {
  g.save(); g.rotate(-hip); cut(PARTS.thigh, col, { sh: .45, grain: .2 });
  g.translate(0, 266); g.rotate(knee); cut(PARTS.shin, col, { sh: .4, grain: .2 });
  g.translate(0, 250); g.rotate(hip - knee); cut(PARTS.boot, col, { sh: .35, grain: .2 });
  g.restore();
}
function puppet(x, y, s, dir, spec, pose = {}) {
  const col = spec.col || C.fig;
  const hk = spec.headK || .265;
  const arms = pose.arms || [[0, .15], [0, .15]], legs = pose.legs || [[0, 0], [0, 0]];
  g.save(); g.translate(x, y + (pose.bob || 0) * s); g.scale(s * (spec.height || 1) * dir, s * (spec.height || 1));
  g.rotate(pose.lean || 0);
  g.save(); g.translate(-6, -540); leg(legs[1][0], legs[1][1], col); g.restore();
  g.save(); g.translate(-8, -752); arm(arms[1][0], arms[1][1], col, pose.holdFar); g.restore();
  g.save(); g.translate(6, -540); leg(legs[0][0], legs[0][1], col); g.restore();
  cut(PARTS.hips, col, { sh: .3, grain: .2 });
  cut(PARTS.shirt, col, { sh: .6, grain: .26, lift: .2 });
  g.save(); g.translate(10, -790); head(col, hk, pose.head || 0, { cap: pose.cap || 0 }); g.restore();
  g.save(); g.translate(8, -752); arm(arms[0][0], arms[0][1], col, pose.holdNear); g.restore();
  g.restore();
}
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
};
// body travel per half walk cycle, in canvas px, for a puppet at scale s (no moonwalking)
const STRIDE = (s) => 2 * 516 * s * Math.sin(.3);

// ---------------- shot registry ----------------
const SHOTS = [];
function SHOT(a, b, name, fn, opts = {}) { SHOTS.push({ a, b, name, fn, o: opts }); SHOTS.sort((x, y) => x.a - y.a); }
