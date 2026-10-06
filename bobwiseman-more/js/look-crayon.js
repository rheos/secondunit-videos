// Look test 1: CRAYON + GOUACHE OVER-PAINT. Count-in + verse 1, song time 0.0-35.5 s.
// A child's crayon drawing (waxy broken strokes, paper tooth, outlines that boil on every beat), overtaken
// on each line's upgrade word by wet gouache that floods over it while the crayon wax resists the paint.
// Every frame is a pure function of t: all randomness is seeded by element + boil index.
// Drawing space is 1920x1080 ("screen"); the scene lives in "world" coords mapped by a per-shot camera.

// ---------------- cue times (from the sung words) ----------------
const CUE = {
  indigo: wordTime('verse1', 0, 'indigo'),
  blue: wordTime('verse1', 0, 'blue'),
  tree: wordTime('verse1', 1, 'tree'),
  willow: wordTime('verse1', 1, 'willow'),
  l2: line('verse1', 1).t0,
  l3: line('verse1', 2).t0,
  sad: wordTime('verse1', 2, 'sad'),
  deep: wordTime('verse1', 2, 'deep'),
  l4: line('verse1', 3).t0,
  cry: wordTime('verse1', 3, 'cry'),
  weep: wordTime('verse1', 3, 'weep'),
};
// shot cuts land on the beat nearest each line start
const nearBeat = (x) => FEAT.beats.reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a);
CUE.cutC = nearBeat(CUE.l3);           // close on the customer
CUE.cutM = nearBeat(CUE.l4 - 0.2);     // medium: customer + willow

// ---------------- palette ----------------
const COL = {
  sky: '#2f86d6', hill: '#3e9e3a', hillDk: '#24692a', sun: '#f7c21a', sunDk: '#ef7f16',
  trunk: '#8b5a2b', crown: '#47a83f', crownDk: '#2b7a2e', coat: '#8f5a2c', coatDk: '#3f2a18',
  face: '#f0b48c', faceDk: '#b0603f', cap: '#4b4d58', ink: '#1f1d22', star: '#fff3b4', tear: '#5fb2ee',
  red: '#d8402f', blue: '#2c5fc0', grass: '#2f8a33',
};
const PIG = {
  indigo: ['#2a2870', '#15124a', '#4a4fa6'],
  willow: ['#8fa830', '#4d6a1a', '#d3b53a'],
  trunk: ['#6d4524', '#3e2410', '#9a6a3a'],
  water: ['#16739a', '#0b3f5e', '#4cb0d4'],
  tear: ['#74bdf5', '#2f6fbf', '#b4defc'],
};

// ---------------- textures (built once, at the canvas size) ----------------
let CW = 1920, CH = 1080, K = 1;
let paperTex, grainTex, layerC, layerW, cC, cW, MOT = {};
const DEF = [];   // deformed watercolour polygons (unit radius)

function vnoise2(x, y, seed) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash2(i, j, seed), b = hash2(i + 1, j, seed), c = hash2(i, j + 1, seed), d = hash2(i + 1, j + 1, seed);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function buildTextures() {
  const cv = document.getElementById('c'); CW = cv.width; CH = cv.height; K = CW / 1920;
  // paper: warm off-white, cloudy, with fibres and pits
  paperTex = mkCanvas(CW, CH);
  { const x = paperTex.getContext('2d'), im = x.createImageData(CW, CH), d = im.data; const R = rng(11);
    for (let py = 0; py < CH; py++) for (let px = 0; px < CW; px++) {
      const X = px / K, Y = py / K;
      const cloud = vnoise2(X / 260, Y / 260, 3) * .6 + vnoise2(X / 90, Y / 90, 4) * .4;
      const pit = vnoise2(X / 2.6, Y / 1.9, 5);
      const v = 236 + cloud * 12 - (pit > .72 ? (pit - .72) * 40 : 0) + (R() - .5) * 6;
      const o = (py * CW + px) * 4; d[o] = v + 6; d[o + 1] = v + 2; d[o + 2] = v - 10; d[o + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    x.globalAlpha = .07; x.strokeStyle = '#8a7a60'; x.lineWidth = K * .8;
    for (let i = 0; i < 900; i++) { const a = R() * TAU, l = (6 + R() * 22) * K, px = R() * CW, py = R() * CH; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + .6) * l * .5, py + Math.sin(a + .6) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  }
  // grain: alpha map of the paper's valleys. Knocks holes in crayon (tooth) and darkens paint (granulation).
  grainTex = mkCanvas(CW, CH);
  { const x = grainTex.getContext('2d'), im = x.createImageData(CW, CH), d = im.data; const R = rng(21);
    for (let py = 0; py < CH; py++) for (let px = 0; px < CW; px++) {
      const X = px / K, Y = py / K;
      const v = vnoise2(X / 3.1, Y / 2.2, 7) * .5 + vnoise2(X / 9, Y / 7, 8) * .3 + R() * .2;
      const a = clamp((v - .62) / .14);
      const o = (py * CW + px) * 4; d[o] = 30; d[o + 1] = 26; d[o + 2] = 40; d[o + 3] = a * 255;
    }
    x.putImageData(im, 0, 0);
  }
  // pigment mottle: soft blotches, tinted per pigment (dark + light)
  const MW = 400, MH = 240;
  const mot = (seed) => { const c = mkCanvas(MW, MH), x = c.getContext('2d'), im = x.createImageData(MW, MH), d = im.data;
    for (let py = 0; py < MH; py++) for (let px = 0; px < MW; px++) {
      let v = vnoise2(px / 26, py / 26, seed) * .55 + vnoise2(px / 9, py / 9, seed + 1) * .3 + vnoise2(px / 3.5, py / 3.5, seed + 2) * .15;
      v = clamp((v - .38) / .4); const o = (py * MW + px) * 4; d[o] = d[o + 1] = d[o + 2] = 255; d[o + 3] = v * 255;
    } x.putImageData(im, 0, 0); return c; };
  const mA = mot(31), mB = mot(41);
  const tint = (m, col) => { const c = mkCanvas(MW, MH), x = c.getContext('2d'); x.drawImage(m, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, MW, MH); return c; };
  for (const k in PIG) MOT[k] = { dk: tint(mA, PIG[k][1]), lt: tint(mB, PIG[k][2]) };
  // deformed polygons (Tyler Hobbs style recursive midpoint displacement)
  for (let s = 0; s < 10; s++) {
    const R = rng(100 + s); let pts = [];
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; pts.push([Math.cos(a), Math.sin(a), .9 + R() * .5]); }
    for (let d = 0; d < 5; d++) { const np = [];
      for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; np.push(p);
        const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const g = (R() + R() + R() - 1.5) * len * .55 * p[2], a = R() * TAU;
        np.push([mx + Math.cos(a) * g, my + Math.sin(a) * g, p[2] * (.8 + R() * .3)]); }
      pts = np; }
    const path = new Path2D(); pts.forEach((p, i) => i ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1])); path.closePath();
    DEF.push(path);
  }
  layerC = mkCanvas(CW, CH); cC = layerC.getContext('2d');
  layerW = mkCanvas(CW, CH); cW = layerW.getContext('2d');
}
window.LOOK_READY = new Promise((res) => setTimeout(() => { buildTextures(); res(); }, 0));

// ---------------- camera ----------------
let cam = { cx: 960, cy: 540, s: 1, sn: 1 };
function camAt(t) {
  if (t < CUE.cutC) { // wide; slow push toward the tree on line 2
    const u = ease.inOut(inv(CUE.l2 + .3, CUE.willow + .6, t));
    return { cx: lerp(960, 1050, u), cy: lerp(540, 520, u), s: lerp(1, 1.1, u), sn: 1 };
  }
  if (t < CUE.cutM) { // close on the customer; follows him down on "deep"
    const u = inv(CUE.cutC, CUE.cutM, t), d = ease.inOut(inv(CUE.deep, CUE.deep + 1.4, t));
    return { cx: 600, cy: lerp(455, 515, d), s: lerp(2.35, 2.5, u), sn: 2.4 };
  }
  const u = inv(CUE.cutM, 35.6, t); // medium: customer + willow, slow pull back
  return { cx: lerp(990, 1010, u), cy: lerp(585, 575, u), s: lerp(1.75, 1.58, ease.sine(u)), sn: 1.7 };
}
const S = (x, y) => [(x - cam.cx) * cam.s + 960, (y - cam.cy) * cam.s + 540];
const SP = (pts) => pts.map((p) => S(p[0], p[1]));
let BOIL = 0, AMUL = 1;

// ---------------- crayon marks ----------------
function resample(pts, step, closed) {
  const P = closed ? pts.concat([pts[0]]) : pts, out = [];
  let acc = 0;
  for (let i = 0; i < P.length - 1; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i + 1], L = Math.hypot(x1 - x0, y1 - y0); if (L < 1e-6) continue;
    let d = out.length ? step - acc : 0;
    while (d <= L) { const u = d / L; out.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, 0]); d += step; }
    acc = L - (d - step);
  }
  if (!closed) out.push([P[P.length - 1][0], P[P.length - 1][1]]);
  for (let i = 0; i < out.length; i++) out[i][2] = i * step;
  return out;
}
// A waxy crayon line: 2-3 thin overlapping passes, wobble that changes per boil, pressure gaps.
function crayon(c, pts, o = {}) {
  const w = o.w || 7, seed = o.seed || 1, step = o.step || 5, passes = o.passes || 3, jit = o.jit ?? 2.4;
  const al = o.alpha ?? .9, gap = o.gap ?? .14, b = (o.boil ?? BOIL) + seed * 3;
  let P = resample(pts, step, o.closed);
  if (o.reveal !== undefined) { if (o.reveal <= 0) return; P = P.slice(0, Math.max(2, Math.ceil(P.length * Math.min(1, o.reveal)))); }
  const n = P.length; if (n < 2) return;
  c.strokeStyle = o.col || COL.ink; c.lineCap = 'round'; c.lineJoin = 'round';
  // shared wobble (the boil): low-frequency perpendicular drift
  const wob = new Float32Array(n), nx = new Float32Array(n), ny = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], z = P[Math.min(n - 1, i + 1)]; let dx = z[0] - a[0], dy = z[1] - a[1]; const l = Math.hypot(dx, dy) || 1;
    nx[i] = -dy / l; ny[i] = dx / l;
    wob[i] = snoise(P[i][2] / 110 + seed * 1.7, b * 13 + 1) * jit + snoise(P[i][2] / 31, b * 7 + 2) * jit * .4;
  }
  for (let k = 0; k < passes; k++) {
    const ks = seed * 31 + k * 7 + b * 5;
    c.lineWidth = w * (passes > 1 ? .5 : .9) * (.85 + .3 * hash(ks + 1));
    c.globalAlpha = AMUL * al * (.62 + .38 * hash(ks + 2));
    const base = (k - (passes - 1) / 2) * w * .3;
    c.beginPath(); let pen = false;
    for (let i = 0; i < n; i++) {
      const s = P[i][2];
      if (gap > 0 && noise1(s / 38 + k * 5.3, ks) < gap) { pen = false; continue; }
      const off = wob[i] + base + snoise(s / 45, ks + 3) * w * .18;
      const x = P[i][0] + nx[i] * off, y = P[i][1] + ny[i] * off;
      if (!pen) { c.moveTo(x, y); pen = true; } else c.lineTo(x, y);
    }
    c.stroke();
  }
  c.globalAlpha = 1;
}
function erase(c, polys, a = 1) { if (a <= 0) return; c.save(); c.globalCompositeOperation = 'destination-out'; c.globalAlpha = a; c.fillStyle = '#000'; for (const p of polys) { c.beginPath(); polyPath(c, p); c.fill(); } c.restore(); }
function polyPath(c, pts) { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.closePath(); }
// Child's scribble fill: a back-and-forth zigzag clipped to the shape (screen-space poly).
function scribble(c, poly, o = {}) {
  const sp = o.sp || 16, a = o.ang ?? 1.2, seed = o.seed || 1, b = BOIL + seed;
  const dx = Math.cos(a), dy = Math.sin(a), qx = -dy, qy = dx;
  let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
  for (const [x, y] of poly) { const u = x * dx + y * dy, v = x * qx + y * qy; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
  // keep the hatch to the visible part of huge shapes (ranges intersected with the screen's)
  let i0 = 0;
  { let su0 = 1e9, su1 = -1e9, sv0 = 1e9, sv1 = -1e9;
    for (const [x, y] of [[-60, -60], [1980, -60], [1980, 1140], [-60, 1140]]) { const u = x * dx + y * dy, v = x * qx + y * qy; su0 = Math.min(su0, u); su1 = Math.max(su1, u); sv0 = Math.min(sv0, v); sv1 = Math.max(sv1, v); }
    // snap the visible start to the hatch grid so marks stay anchored to the shape
    const half = sp * .5; if (sv0 > v0) { const k0 = Math.floor((sv0 - v0) / half); v0 += k0 * half; i0 = k0; }
    u0 = Math.max(u0, su0); u1 = Math.min(u1, su1); v1 = Math.min(v1, sv1); if (u1 <= u0 || v1 <= v0) return; }
  const zz = [];
  const N = Math.ceil((v1 - v0) / (sp * .5)) + 1, lim = Math.floor(N * (o.reveal ?? 1));
  for (let i = 0; i <= lim; i++) {
    const ii = i + i0, r1 = hash2(ii, seed, b), r2 = hash2(ii, seed + 7, b);
    const v = v0 + i * sp * .5 + (r1 - .5) * sp * .35, end = ii % 2 ? u1 + (r2 - .3) * sp * 2 : u0 - (r2 - .3) * sp * 2;
    zz.push([end * dx + v * qx, end * dy + v * qy]);
  }
  if (zz.length < 2) return;
  c.save(); c.beginPath(); polyPath(c, poly); c.clip();
  crayon(c, zz, { col: o.col, w: o.w || sp * .95, seed, step: o.step || 11, passes: 2, jit: sp * .25, alpha: o.alpha ?? .6, gap: o.gap ?? .07 });
  c.restore();
}
function circlePts(cx, cy, r, n = 28, rot = 0, ry = r) { const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * ry]); } return p; }
function dot(c, x, y, r, col, seed) { // a pressed crayon dot
  c.fillStyle = col; const R = rng(seed * 91 + BOIL * 7);
  for (let k = 0; k < 4; k++) { c.globalAlpha = AMUL * (.55 + R() * .3); c.beginPath(); c.ellipse(x + (R() - .5) * r * .5, y + (R() - .5) * r * .5, r * (.7 + R() * .4), r * (.6 + R() * .4), R() * 3, 0, TAU); c.fill(); }
  c.globalAlpha = 1;
}

// ---------------- world geometry ----------------
const hillY = (x) => 822 - 222 * Math.exp(-Math.pow((x - 600) / 330, 2)) - 14 * Math.sin(x / 150 + 1) - 8 * Math.sin(x / 61);
function hillLine(x0, x1, step = 30) { const p = []; for (let x = x0; x <= x1; x += step) p.push([x, hillY(x)]); return p; }
function visX() { return [cam.cx - 980 / cam.s - 120, cam.cx + 980 / cam.s + 120]; }
const SEAT = [600, 612];
const TREE = { x: 1400, top: 470, r: 130, base: 832 };
const SUN = [1690, 175];
const STARS = [[180, 120], [420, 260], [640, 90], [860, 210], [1060, 70], [1210, 280], [300, 420], [980, 400], [1560, 360], [760, 330], [120, 300], [1840, 420], [470, 60], [1380, 150]];
const POND = { cx: 600, cy: 726, rx: 560, ry: 150 };

// customer state at time t (pure)
function custState(t) {
  const st = { x: SEAT[0], y: SEAT[1], k: 1, mouth: 'flat', look: [0, 0], brow: 0, nod: 0, sink: 0, tear: 0 };
  st.y -= 5 * beatPulse(t, 9); // tiny hop on every beat
  st.squash = .025 * beatPulse(t, 9);
  if (t > CUE.blue - .1 && t < CUE.indigo + 1.6) st.look = [0, -1];
  if (t > CUE.l2 + 2.5 && t < CUE.willow + 2.2) st.look = [1, -.2];
  for (const [c, d] of [[CUE.indigo, .45], [CUE.willow, .6], [CUE.deep, 1.0], [CUE.weep, .6]]) {
    const u = (t - c - d); if (u > 0 && u < 2.2) st.brow = Math.max(st.brow, ease.out(u / .2) * (1 - inv(1.8, 2.2, u)));
    if (u > 0 && u < .5) st.nod = Math.sin(Math.PI * u / .5) * 9;
  }
  if (t >= CUE.cutC && t < CUE.deep + .3) st.mouth = 'frown';
  st.sink = 132 * ease.inOut(inv(CUE.deep, CUE.deep + 1.3, t)) + 3 * Math.sin(t * 2.1);
  if (t >= CUE.l4 + .6) st.tear = clamp((t - CUE.l4 - .6) / (CUE.cry - CUE.l4 - .4));
  return st;
}
// local -> world for the customer
function cw(st, lx, ly) { const sq = 1 + (st.squash || 0); return [st.x + lx * st.k * sq, st.y + st.sink + ly * st.k / sq]; }
const COAT = [[-24, -186], [-60, -174], [-70, -120], [-80, -40], [-86, -6], [-40, 2], [0, 4], [40, 2], [86, -6], [80, -40], [70, -120], [60, -174], [24, -186]];
const CAP = [[-50, -268], [-44, -290], [-20, -300], [18, -300], [42, -290], [50, -272], [74, -266], [70, -258], [40, -262], [-48, -260]];
function custSil(st) { // silhouette pieces in world (for paint knockouts)
  const hy = -236 + st.nod / st.k;
  return [COAT.map(([x, y]) => cw(st, x * 1.03, y - 2)), circlePts(...cw(st, 0, hy), 55 * st.k, 20), CAP.map(([x, y]) => cw(st, x * 1.04, y + st.nod / st.k - 1))];
}

function drawCustomer(c, t, st, rev = 1) {
  const sn = cam.sn, w = 7 * Math.pow(sn, .45), hsp = 9 * Math.pow(sn, .7);
  const W = (lx, ly) => S(...cw(st, lx, ly));
  const L = (arr) => arr.map(([x, y]) => W(x, y));
  if (rev <= 0) return;
  // coat
  const coat = L(COAT);
  scribble(c, coat, { col: COL.coat, sp: hsp, ang: 1.9, seed: 301, alpha: .75 * rev });
  crayon(c, coat, { col: COL.coatDk, w, seed: 302, closed: true, reveal: rev });
  crayon(c, L([[-60, -174], [-66, -110], [-60, -52], [-44, -40]]), { col: COL.coatDk, w: w * .8, seed: 303, reveal: rev }); // too-long sleeves
  crayon(c, L([[60, -174], [66, -110], [60, -52], [44, -40]]), { col: COL.coatDk, w: w * .8, seed: 304, reveal: rev });
  crayon(c, L([[-24, -186], [0, -146], [24, -186]]), { col: COL.coatDk, w: w * .8, seed: 305, reveal: rev });     // collar V
  for (let i = 0; i < 3; i++) { const [x, y] = W(2, -128 + i * 34); dot(c, x, y, 4.5 * sn ** .6, COL.ink, 310 + i); }
  for (const fx of [-30, 30]) { const [x, y] = W(fx, 4); dot(c, x, y, 9 * sn ** .6, COL.ink, 320 + fx); } // feet
  // head
  const hy = -236 + st.nod / st.k;
  const head = circlePts(...W(0, hy), 52 * st.k * cam.s, 26, .3);
  scribble(c, head, { col: COL.face, sp: hsp * .9, ang: .5, seed: 330, alpha: .55 * rev });
  crayon(c, head, { col: COL.faceDk, w: w * .85, seed: 331, closed: true, reveal: rev });
  // cap
  const cap = CAP.map(([x, y]) => W(x, y + st.nod / st.k));
  scribble(c, cap, { col: COL.cap, sp: hsp * .7, ang: .2, seed: 340, alpha: .85 * rev });
  crayon(c, cap, { col: COL.ink, w: w * .8, seed: 341, closed: true, reveal: rev });
  if (rev < 1) return;
  // face: two dot eyes, flat line mouth
  const ey = hy - 2 + st.look[1] * 5, ex = st.look[0] * 6;
  for (const sx of [-18, 18]) { const [x, y] = W(sx + ex, ey); dot(c, x, y, 5.2 * sn ** .7, COL.ink, 350 + sx); }
  if (st.brow > 0) for (const sx of [-18, 18]) crayon(c, L([[sx + ex - 9, ey - 16 - 9 * st.brow], [sx + ex + 9, ey - 17 - 9 * st.brow]]), { col: COL.ink, w: w * .55, seed: 360 + sx, passes: 2, gap: 0 });
  const my = hy + 24;
  if (st.mouth === 'frown') crayon(c, L([[-15, my + 5], [-8, my - 1], [0, my - 3], [8, my - 1], [15, my + 5]]), { col: COL.ink, w: w * .6, seed: 370, passes: 2, gap: 0 });
  else crayon(c, L([[-14, my], [14, my]]), { col: COL.ink, w: w * .6, seed: 371, passes: 2, gap: 0 });
  // the one neat tear
  if (st.tear > 0 && t < CUE.weep + .25) {
    const ty = ey + 10 + st.tear * 34, tx = 18 + ex + 3;
    const drop = []; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; drop.push([tx + 7 * Math.sin(a) * Math.sin(a / 2), ty - Math.cos(a) * 10]); }
    const dp = L(drop);
    c.save(); c.fillStyle = '#e8f6ff'; c.globalAlpha = .9; c.beginPath(); polyPath(c, dp); c.fill(); c.restore();
    crayon(c, dp, { col: COL.tear, w: w * .55, seed: 380, closed: true, passes: 2, gap: 0 });
  }
}

// ---------------- count-in: the scene scribbles itself onto the blank page on the beats ----------------
// (no title card: the platform carries the artist and song name)
const CB = FEAT.beats; // .53 .98 1.44 1.90 2.35 2.83 3.32 3.79
const BUILD = {
  hillLine: [CB[0], CB[0] + .42], hill: [CB[0], CB[2] + .1], grass: [CB[2], CB[2] + .35],
  sky: [CB[1], CB[4] + .55], tree: [CB[3], CB[3] + .42], sun: [CB[4], CB[4] + .42],
  cust: [CB[5], CB[5] + .45], stars: [CB[6], CB[6] + .25],
};
const built = (k, d = 0) => inv(BUILD[k][0] + d, BUILD[k][1] + d, CURT);
let CURT = 0;
// Organic reveal: the fill is clipped to a union of wobbly blobs that bloom out from a few points,
// each starting on a beat, so a scribbled area spreads like a kid colouring in patches.
const SKY_SEEDS = [[260, 160, 0], [1500, 260, 1], [820, 420, 1], [1150, 80, 2], [420, 520, 2], [1800, 560, 3], [1000, 260, 3]];
const HILL_SEEDS = [[600, 700, 0], [1500, 900, 1], [150, 900, 1], [1050, 950, 2]];
function blobMask(seeds, t0, t1, R) {
  const p = new Path2D(), span = t1 - t0;
  seeds.forEach(([x, y, b], i) => {
    const st = t0 + b * span * .2, g = ease.out(inv(st, st + span * .45, CURT)); if (g <= 0) return;
    const [sx, sy] = S(x, y); p.addPath(defPath(i + 2, sx, sy, R * g * cam.s, R * .8 * g * cam.s, i * 40));
  });
  return p;
}
function withMask(c, key, seeds, R, fn) {
  const [a, b] = BUILD[key];
  if (CURT >= b) { fn(); return; }
  if (CURT <= a) return;
  c.save(); c.clip(blobMask(seeds, a, b, R)); fn(); c.restore();
}

// ---------------- watercolour / gouache ----------------
function drawMottle(c, pig, alpha, ox, oy) {
  const m = MOT[pig]; const [x, y] = S(-700 + ox, -500 + oy), w = 3400 * cam.s, h = 2040 * cam.s;
  c.globalAlpha = alpha; c.drawImage(m.dk, x, y, w, h);
  c.globalAlpha = alpha * .8; const [x2, y2] = S(-650 - ox * .7, -460 + oy * .5); c.drawImage(m.lt, x2, y2, w * 1.07, h * 1.07);
  c.globalAlpha = 1;
}
function defPath(i, x, y, r, ry = r, rot = 0) { const p = new Path2D(); const m = new DOMMatrix().translateSelf(x, y).rotateSelf(rot).scaleSelf(r, ry); p.addPath(DEF[i % DEF.length], m); return p; }
// Flood a region with a wash that grows from an origin (world), with a dark wet edge, tide marks,
// pigment pooling at the region's border, settling mottle and late cauliflower blooms.
function flood(c, t, o) {
  if (t < o.t0) return;
  const FA = o.fade ?? 1;
  const p = ease.out(clamp((t - o.t0) / o.dur));
  const [ox, oy] = S(...o.origin), R = o.R * cam.s * (.04 + .96 * p), ry = (o.ry || 1);
  c.save();
  if (o.region) { const rp = new Path2D(); polyPath(rp, o.region); c.clip(rp); o._rp = rp; }
  const fp = defPath(o.seed, ox, oy, R, R * ry, o.rot || 0);
  c.clip(fp);
  const P = PIG[o.pig];
  c.fillStyle = P[0]; c.globalAlpha = FA * (o.alpha ?? .8); c.fillRect(-50, -50, 2020, 1180);
  const settle = 1 - ease.out(clamp((t - o.t0) / 3));
  drawMottle(c, o.pig, .55 * FA, (o.seed * 137) % 400 + settle * 60, (o.seed * 71) % 300 + settle * 25);
  // pigment concentration rings inside (deformed layers)
  c.fillStyle = P[1];
  for (let i = 0; i < 4; i++) { c.globalAlpha = FA * (.07); c.fill(defPath(o.seed + i + 1, ox, oy, R * (.25 + i * .18), R * (.25 + i * .18) * ry)); }
  // tide marks left by earlier positions of the front
  c.strokeStyle = P[1];
  for (const f of [.42, .7]) if (p > f + .05) { c.globalAlpha = FA * (.22); c.lineWidth = 2.5; c.stroke(defPath(o.seed + 5, ox, oy, o.R * cam.s * f, o.R * cam.s * f * ry)); }
  // pooling against the region border
  if (o._rp) { c.globalAlpha = FA * (.28); c.lineWidth = 34; c.stroke(o._rp); c.globalAlpha = FA * (.35); c.lineWidth = 7; c.stroke(o._rp); }
  // wet front: dark edge
  if (p < 1) { c.globalAlpha = FA * (.4 * (1 - p * .5)); c.lineWidth = 16; c.stroke(fp); c.globalAlpha = FA * (.55); c.lineWidth = 4; c.stroke(fp); }
  // blooms (backruns): pale centre, dark cauliflower rim
  (o.blooms || []).forEach(([bx, by, br], i) => {
    const tb = o.t0 + o.dur * .7 + i * .35, g = ease.out(clamp((t - tb) / 1.3)); if (g <= 0) return;
    const [sx, sy] = S(bx, by), bp = defPath(o.seed + 3 + i, sx, sy, br * cam.s * g);
    c.globalCompositeOperation = 'destination-out'; c.globalAlpha = FA * (.16); c.fill(bp);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = FA * (.55); c.lineWidth = 3; c.stroke(bp);
  });
  c.restore(); c.globalAlpha = 1;
}
// A ribbon of paint along a polyline (screen), tapered, layered in passes.
function ribbon(c, pts, w0, w1, col, alpha, seed, passes = 3) {
  const n = pts.length; if (n < 2) return;
  for (let k = 0; k < passes; k++) {
    const L = [], Rr = [];
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], z = pts[Math.min(n - 1, i + 1)]; const dx = z[0] - a[0], dy = z[1] - a[1], l = Math.hypot(dx, dy) || 1;
      const u = i / (n - 1), w = lerp(w0, w1, u) * (.75 + .5 * noise1(i * .5 + k * 9, seed + k)) * .5;
      const j = snoise(i * .3, seed * 3 + k) * w * .25;
      L.push([pts[i][0] - dy / l * w + j, pts[i][1] + dx / l * w]); Rr.push([pts[i][0] + dy / l * w + j, pts[i][1] - dx / l * w]);
    }
    const poly = L.concat(Rr.reverse());
    c.globalAlpha = alpha; c.fillStyle = col; c.beginPath(); polyPath(c, poly); c.fill();
    if (k === 0) { c.globalAlpha = alpha * .6; c.strokeStyle = shade(col); c.lineWidth = 2; c.stroke(); }
  }
  c.globalAlpha = 1;
}
const SHADE = {}; function shade(col) { if (SHADE[col]) return SHADE[col]; const n = parseInt(col.slice(1), 16); const f = (v) => Math.round(v * .6).toString(16).padStart(2, '0'); return SHADE[col] = '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); }

// ---------------- the willow (wash) ----------------
function willowStrands(t, grow) {
  const out = [], N = 40, ph = beatPhase(t), bp = beatPulse(t, 4), bi = beatIndex(t);
  for (let k = 0; k < N; k++) {
    const d = ((k + .5) / N) * 2 - 1, side = Math.sign(d) || 1, ad = Math.abs(d);
    const ax = TREE.x + d * TREE.r * .45, ay = TREE.top - TREE.r * (.55 - .25 * ad * ad) + hash(k * 5) * 20;
    const reach = TREE.r * (.35 + ad * .9) + hash(k * 3 + 1) * 30;          // how far the arch carries outward
    const fall = (TREE.base - 30 - ay) * (.75 + hash(k * 3 + 5) * .3);
    const gk = clamp(grow * 1.35 - hash(k) * .35); if (gk <= .02) continue;
    const pts = []; const M = 16;
    for (let i = 0; i <= M * gk; i++) {
      const u = i / M;
      // sway: a slow swing that flips each beat + a kick on the beat, stronger toward the tip
      const swing = Math.sin((bi + ph) * Math.PI + k * .35) * 14 + (bi % 2 ? 1 : -1) * bp * 20;
      let x, y;
      if (u < .3) { const v = u / .3; x = ax + side * reach * Math.sin(v * Math.PI / 2); y = ay - 28 * Math.sin(v * Math.PI) * (1 - v * .4) + v * 18; }
      else { const v = (u - .3) / .7; x = ax + side * (reach + 22 * v) + swing * v * v; y = ay + 18 + fall * v; }
      pts.push(S(x, y));
    }
    out.push({ pts, k });
  }
  return out;
}
function drawWillowWash(c, t) {
  const g = clamp((t - CUE.willow) / 1.5); if (g <= 0) return;
  const s = cam.s;
  // trunk
  ribbon(c, [S(TREE.x - 4, TREE.base + 10), S(TREE.x + 6, (TREE.base + TREE.top) / 2), S(TREE.x - 10, TREE.top + 40)], 46 * s, 30 * s, PIG.trunk[0], .55 * Math.min(1, g * 3), 5, 2);
  // crown dome floods first
  const cg = ease.out(clamp(g * 3));
  const [ccx, ccy] = S(TREE.x, TREE.top + 10);
  c.save(); const dp = defPath(7, ccx, ccy - TREE.r * .15 * s, TREE.r * 1.25 * s * (.2 + .8 * cg), TREE.r * .8 * s * (.2 + .8 * cg));
  c.clip(dp);
  c.fillStyle = PIG.willow[1]; c.globalAlpha = .5; c.fillRect(0, 0, 1920, 1080);
  drawMottle(c, 'willow', .6, 120, 60);
  c.restore();
  // strands pour down
  const pal = [PIG.willow[0], PIG.willow[2], '#6f9a2a', '#b9b23a', '#5f8a24'];
  for (const st of willowStrands(t, ease.out(clamp((g - .1) / .9)))) ribbon(c, st.pts, 24 * s, 7 * s, pal[st.k % pal.length], .62, 40 + st.k, 2);
}

// ---------------- page drips (on "weep") ----------------
function drips(c, t) {
  const u0 = t - CUE.weep; if (u0 <= 0) return;
  for (let i = 0; i < 18; i++) {
    const x = 60 + (i + hash(i * 5 + 1) * .8) / 18 * 1800, st = hash(i * 9 + 2) * 1.1, v = 260 + hash(i * 13 + 3) * 420;
    const u = u0 - st; if (u <= 0) continue;
    const len = Math.min(1150, v * u * (1 - .15 * Math.min(1, u / 3))), w = 9 + hash(i * 17) * 14;
    const col = i % 3 === 1 ? PIG.willow[2] : PIG.tear[i % 2 ? 0 : 2];
    const pts = []; for (let k = 0; k <= 10; k++) { const y = -20 + len * k / 10; pts.push([x + snoise(y / 140, i) * 6, y]); }
    ribbon(c, pts, w * 1.2, w * .8, col, .7, 500 + i, 2);
    const e = pts[pts.length - 1]; c.globalAlpha = .65; c.fillStyle = col; c.beginPath(); c.ellipse(e[0], e[1] + w * .3, w * .75, w * 1.0, 0, 0, TAU); c.fill(); c.globalAlpha = 1;
  }
}

// ---------------- frame ----------------
function drawVerse(g, t) {
  cam = camAt(t); BOIL = t >= INS.drop ? 1000 + beatIndex(t) * 2 + (beatPhase(t) > .5 ? 1 : 0) : Math.max(0, beatIndex(t) + 1);
  const base = [K, 0, 0, K, 0, 0];
  // paper
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paperTex, 0, 0); g.setTransform(...base);

  // ===== crayon layer =====
  const c = cC; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, CW, CH); c.setTransform(...base);
  CURT = t;
  const showScene = t > BUILD.hillLine[0];
  const st = custState(t);
  if (showScene) {
    const [vx0, vx1] = visX();
    const hl = hillLine(vx0, vx1, 30 / Math.max(1, cam.s * .8));
    // sky scribble (blue crayon), then stars in pale wax
    const skyPoly = SP([[vx0, -900]].concat(hl, [[vx1, -900]]));
    withMask(c, 'sky', SKY_SEEDS, 720, () => scribble(c, skyPoly, { col: COL.sky, sp: 21 * cam.sn ** .5, ang: 1.25, seed: 11, alpha: .62, reveal: 1 }));
    if (t > CUE.blue) scribble(c, skyPoly, { col: '#4fa3e8', sp: 30 * cam.sn ** .5, ang: .35, seed: 12, alpha: .35, reveal: inv(CUE.blue, CUE.blue + .45, t) });
    STARS.forEach(([x, y], i) => {
      const r = (16 + hash(i) * 10) * cam.s ** .6 * (1 + .25 * beatPulse(t - i * .03, 5)), [sx, sy] = S(x, y), rot = hash(i + 4) + (BOIL % 2) * .15;
      const pts = []; for (let k = 0; k < 10; k++) { const a = rot + k / 10 * TAU, rr = k % 2 ? r * .45 : r; pts.push([sx + Math.cos(a) * rr, sy + Math.sin(a) * rr]); }
      crayon(c, pts, { col: COL.star, w: 7 * cam.sn ** .4, seed: 40 + i, closed: true, reveal: built('stars', i * .03), alpha: 1, passes: 2, gap: .05 });
    });
    // sun: rays tick round one notch per beat
    { const [sx, sy] = S(...SUN), r = 64 * cam.s, rb = built('sun');
      erase(c, [circlePts(sx, sy, r * 1.02, 20)], inv(.8, 1, rb));
      const sp = circlePts(sx, sy, r, 24); scribble(c, sp, { col: COL.sun, sp: 13, ang: .8, seed: 60, alpha: .8, reveal: rb });
      crayon(c, sp, { col: COL.sunDk, w: 8, seed: 61, closed: true, reveal: rb });
      const rot = (BOIL + ease.out(beatPhase(t) * 3)) * TAU / 20;
      for (let k = 0; k < 10; k++) { const a = rot + k / 10 * TAU, l = (k % 2 ? 1.75 : 2.05) + .12 * beatPulse(t, 6);
        crayon(c, [[sx + Math.cos(a) * r * 1.3, sy + Math.sin(a) * r * 1.3], [sx + Math.cos(a) * r * l, sy + Math.sin(a) * r * l]], { col: COL.sunDk, w: 8, seed: 62 + k, reveal: rb * 1.2 - k * .02, passes: 2 }); } }
    // hill
    const hillPoly = SP(hl.concat([[vx1, 1500], [vx0, 1500]]));
    // after "deep" the ground under him opens: the hill wax fades inside the pond so the water reads deep
    const pondPath = t >= CUE.deep ? (() => { const sp2 = ease.inOut(inv(CUE.weep + .3, CUE.weep + 2, t)); const pp = new Path2D(); polyPath(pp, SP(circlePts(POND.cx + sp2 * 220, POND.cy, POND.rx + sp2 * 330, 60, 0, POND.ry))); return pp; })() : null;
    const hillFade = 1 - .8 * ease.out(inv(CUE.deep, CUE.deep + 1, t));
    if (pondPath) { c.save(); const op = new Path2D(); op.rect(-100, -100, 2200, 1300); op.addPath(pondPath); c.clip(op, 'evenodd'); }
    withMask(c, 'hill', HILL_SEEDS, 760, () => scribble(c, hillPoly, { col: COL.hill, sp: 18 * cam.sn ** .5, ang: .25, seed: 21, alpha: .66, reveal: 1 }));
    if (pondPath) { c.restore(); c.save(); c.clip(pondPath); AMUL = hillFade; scribble(c, hillPoly, { col: COL.hill, sp: 18 * cam.sn ** .5, ang: .25, seed: 21, alpha: .66 }); AMUL = 1; c.restore(); }
    if (pondPath) { c.save(); const op = new Path2D(); op.rect(-100, -100, 2200, 1300); op.addPath(pondPath); c.clip(op, 'evenodd'); }
    crayon(c, SP(hl), { col: COL.hillDk, w: 9 * cam.sn ** .4, seed: 22, reveal: built('hillLine'), step: 6 });
    if (pondPath) c.restore();
    // grass tufts nod on the beat
    for (let x = Math.ceil(vx0 / 70) * 70; x < vx1; x += 70) { if (t > CUE.deep && Math.hypot((x - POND.cx) / (POND.rx + 40), (hillY(x) - POND.cy) / (POND.ry + 30)) < 1) continue;
      const y = hillY(x), lean = ((BOIL + x / 70) % 2 ? 1 : -1) * 8 * (.4 + beatPulse(t, 5));
      for (const dx of [-8, 0, 8]) crayon(c, SP([[x + dx, y + 4], [x + dx * 1.6 + lean, y - 26 - hash(x + dx) * 12]]), { col: COL.grass, w: 6 * cam.sn ** .4, seed: x + dx, passes: 2, reveal: built('grass') }); }
    // clear the sky wax behind the tree and the customer (a child colours around them)
    erase(c, [SP(circlePts(TREE.x, TREE.top, TREE.r, 24)), SP([[TREE.x - 16, TREE.base], [TREE.x - 16, TREE.top], [TREE.x + 16, TREE.top], [TREE.x + 16, TREE.base]])], inv(.8, 1, built('tree')));
    erase(c, custSil(st).map(SP), inv(.8, 1, built('cust')));
    // the lollipop tree (droops on "willow")
    { const droop = ease.out(inv(CUE.willow, CUE.willow + .5, t)), hop = 10 * hit(t, CUE.tree, 5) * Math.sin((t - CUE.tree) * 18);
      const tr = SP([[TREE.x - 16, TREE.base + 6], [TREE.x - 12, TREE.top + TREE.r * .8 + hop], [TREE.x + 12, TREE.top + TREE.r * .8 + hop], [TREE.x + 16, TREE.base + 6]]);
      const rb = built('tree');
      scribble(c, tr, { col: COL.trunk, sp: 9, ang: 1.5, seed: 70, alpha: .8, reveal: rb });
      crayon(c, tr, { col: '#5a3518', w: 7 * cam.sn ** .4, seed: 71, closed: true, reveal: rb });
      const cr = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU, sg = Math.max(0, Math.sin(a)); cr.push([TREE.x + Math.cos(a) * TREE.r * (1 + .08 * sg * droop), TREE.top - hop * .3 + Math.sin(a) * TREE.r * (1 + .45 * sg * sg * droop) * (1 + .04 * hit(t, CUE.tree, 4))]); }
      const crs = SP(cr);
      AMUL = 1 - .75 * droop;
      scribble(c, crs, { col: COL.crown, sp: 15 * cam.sn ** .5, ang: .9, seed: 72, alpha: .72, reveal: rb });
      crayon(c, crs, { col: COL.crownDk, w: 8 * cam.sn ** .4, seed: 73, closed: true, reveal: rb }); AMUL = 1; }
    // the customer pops in under "the sky's"
    if (t < CUE.deep) drawCustomer(c, t, st, built('cust'));
    else { // below the waterline he is only a faint crayon ghost under the paint
      const pondP = new Path2D(); polyPath(pondP, SP(circlePts(POND.cx, POND.cy, POND.rx, 60, 0, POND.ry)));
      const sub = ease.out(inv(CUE.deep, CUE.deep + 1.2, t));
      c.save(); const outP = new Path2D(); outP.rect(-100, -100, 2200, 1300); outP.addPath(pondP); c.clip(outP, 'evenodd'); drawCustomer(c, t, st); c.restore();
      c.save(); c.clip(pondP); AMUL = 1 - .7 * sub; drawCustomer(c, t, st); AMUL = 1; c.restore();
    }
  }
  // paper tooth breaks the wax
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-out'; c.globalAlpha = .92; c.drawImage(grainTex, 0, 0);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(layerC, 0, 0);

  // ===== paint layer =====
  const w = cW; w.setTransform(1, 0, 0, 1, 0, 0); w.clearRect(0, 0, CW, CH); w.setTransform(...base);
  let paint = false;
  if (t >= CUE.indigo) {
    paint = true;
    const [vx0, vx1] = visX(), hl = hillLine(vx0, vx1, 30);
    flood(w, t, { t0: CUE.indigo, dur: 1.0, origin: [900, -260], R: 2100, ry: .75, seed: 1, pig: 'indigo', alpha: .86,
      region: SP([[vx0, -900]].concat(hl, [[vx1, -900]])), blooms: [[330, 300, 70], [1180, 180, 85], [760, 470, 55], [1600, 520, 65]] });
    // keep the customer, the tree and the sun clear of the sky wash (child paints around them)
    w.save(); w.globalCompositeOperation = 'destination-out'; w.fillStyle = '#000';
    for (const pc of custSil(st)) { w.beginPath(); polyPath(w, SP(pc)); w.fill(); }
    w.beginPath(); polyPath(w, SP(circlePts(TREE.x, TREE.top, TREE.r * 1.07, 24))); w.fill();
    w.beginPath(); polyPath(w, SP([[TREE.x - 22, TREE.base], [TREE.x - 22, TREE.top], [TREE.x + 22, TREE.top], [TREE.x + 22, TREE.base]])); w.fill();
    w.globalAlpha = .55; w.beginPath(); polyPath(w, SP(circlePts(...SUN, 70, 20))); w.fill();
    w.restore();
  }
  if (t >= CUE.deep) {
    // the ground opens into a deep pond; on "weep" it spreads out to the willow
    const spread = ease.inOut(inv(CUE.weep + .3, CUE.weep + 2, t));
    const P = { cx: POND.cx + spread * 220, rx: POND.rx + spread * 330 };
    flood(w, t, { t0: CUE.deep - .05, dur: 1.1, origin: [600, 700], R: 1300, ry: .45, seed: 4, pig: 'water', alpha: .96,
      region: SP(circlePts(P.cx, POND.cy, P.rx, 60, 0, POND.ry)), blooms: [] });
    // ripples ring out from his neck on every beat
    const bi = beatIndex(t), [nx, ny] = [600, POND.cy - POND.ry + 22];
    w.save(); w.beginPath(); polyPath(w, SP(circlePts(P.cx, POND.cy, P.rx, 60, 0, POND.ry))); w.clip();
    for (let k = 0; k < 3; k++) { const b = FEAT.beats[bi - k]; if (b === undefined || b < CUE.deep + .4) continue; const u = (t - b) / 1.6; if (u > 1) continue;
      const [sx, sy] = S(nx, ny); w.strokeStyle = '#a9d2f4'; w.globalAlpha = .6 * (1 - u); w.lineWidth = 5 * cam.s ** .5;
      w.beginPath(); w.ellipse(sx, sy, (70 + u * 260) * cam.s, (14 + u * 50) * cam.s, 0, 0, TAU); w.stroke(); }
    w.restore(); w.globalAlpha = 1;
  }
  if (t >= CUE.willow) { paint = true; drawWillowWash(w, t); }
  if (t >= CUE.weep) {
    drips(w, t);
  }
  if (paint || t >= CUE.deep) {
    // granulation: pigment settles in the paper's valleys
    w.setTransform(1, 0, 0, 1, 0, 0);
    w.globalCompositeOperation = 'source-atop'; w.globalAlpha = .16; w.drawImage(grainTex, 0, 0);
    // wax resist: the crayon pushes the paint off
    w.globalCompositeOperation = 'destination-out'; w.globalAlpha = .82; w.drawImage(layerC, 0, 0);
    w.globalCompositeOperation = 'source-over'; w.globalAlpha = 1;
    w.setTransform(...base);
    if (t >= CUE.weep) {
      // the tear becomes a cascade: two streams from the eyes down into the pond (on top of the wax)
      const u = t - CUE.weep, ey = -238;
        for (const sx of [-18, 18]) {
        const len = Math.min(1, u / .7), pts = [];
        for (let k = 0; k <= 12; k++) { const v = k / 12 * len; const [wx, wy] = cw(st, sx + sx * .25 * v * 3 + snoise(v * 4 + t * 3, sx + 50) * 4, ey + 8 + v * 150); pts.push(S(wx, wy)); }
        const wild = t > INS.t0 ? 1 + 3 * ease.in(inv(INS.t0, INS.drop, t)) + 2 * ease.out(inv(INS.drop, INS.sceneEnd, t)) : 1;
        ribbon(w, pts, 10 * cam.s * wild, (16 + 10 * beatPulse(t, 5)) * cam.s * Math.min(1, u * 2) * wild, PIG.tear[0], .6, 600 + sx, 3);
        // splash at the pond
        if (u > .6) { const [px, py] = S(...cw(st, sx * 1.4, ey + 158)); w.strokeStyle = PIG.tear[2]; w.globalAlpha = .7 * (1 - beatPhase(t)); w.lineWidth = 4; w.beginPath(); w.ellipse(px, py, (20 + 30 * beatPhase(t)) * cam.s, (5 + 8 * beatPhase(t)) * cam.s, 0, 0, TAU); w.stroke(); w.globalAlpha = 1; }
      }
    }
    if (t > INS.t0) wildDrips(w, t);
    w.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(layerW, 0, 0);
  }
  // sit everything in the paper
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .45; g.drawImage(paperTex, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.setTransform(...base);
}

// ================= INSTRUMENTAL 1 (35.5-65.5): abstract, in the look's own materials =================
// Bob's scene: the weep scene drains off the page to reveal an enormous crayon room and six elders (the same six
// who return in cut paper in instrumental 2). On the drums they break into unexpected coordinated gymnastics,
// escalating every bar, while their shadows are their bendier younger selves. A clock drops in (hands left
// alone: the cane payoff is saved for 2:29); they glance and carry on, then form geometric designs seen from above. The last ~3 s drain to sepia and close an iris on the customer in the doorway, on the
// rubber-hose diner's opening iris.
const INS = (() => {
  let drop = 37.5;
  for (let f = Math.round(35.5 * FEAT.fps); f < FEAT.drums.length; f++) if (FEAT.drums[f] > .3) { drop = nearBeat(f / FEAT.fps); break; }
  const di = lastBeat(drop + .01), bar = (n) => FEAT.beats[di + 4 * n];
  return { t0: 35.5, drop, di, bar, sceneEnd: bar(1), drain: 62.5, sepia1: 63.7, irisA: 63.9, irisB: 1571 / 24, end: 65.5,
    IRIS: [1300, 470, 420] }; // matches look-hose.js: arc(1300, 470, lerp(420, ...)) at 65.5
})();
PIG.verm = ['#d9472b', '#8e2412', '#f39a6c'];
PIG.gold = ['#e3b21f', '#9a6a08', '#f7da7a'];
// the sheet of paint that pours out of him on the drop and later slides off the page
let TMP = null;
function wildDrips(c, t) { sheet(c, t, 0); }
function sheet(c, t, dy) {
  if (dy > 1250) return;
  const te = Math.min(t, INS.sceneEnd), keep = cam; cam = camAt(te);
  const [ex, ey] = S(...cw(custState(te), 18, -238)); cam = keep;
  c.save(); c.translate(0, dy);
  const p = ease.in(inv(INS.drop - .1, INS.sceneEnd - .15, t));
  if (p > 0) {
    c.save(); const R = 2500 * p, fp = defPath(3, ex, ey, R, R * .85); c.clip(fp);
    c.globalAlpha = .9; c.fillStyle = PIG.tear[0]; c.fillRect(-50, -50, 2020, 1400);
    c.globalAlpha = .55; c.drawImage(MOT.tear.dk, -300, -200, 2600, 1600); c.globalAlpha = .45; c.drawImage(MOT.verm.lt, -500, -300, 2900, 1700);
    c.restore();
    if (p < 1) { c.strokeStyle = PIG.tear[1]; c.globalAlpha = .5; c.lineWidth = 14; c.stroke(defPath(3, ex, ey, 2500 * p, 2500 * p * .85)); }
  }
  // drips: a few start before the drop, then the whole page goes
  const cols = [PIG.tear[2], PIG.willow[2], PIG.indigo[2], PIG.gold[0], PIG.water[2], PIG.verm[0], PIG.tear[1]];
  for (let i = 0; i < 90; i++) {
    const early = i % 7 === 0, st = early ? INS.t0 + hash(i * 3 + 1) * (INS.drop - INS.t0) : INS.drop - .1 + hash(i * 5 + 2) * 1.5;
    const u = t - st; if (u <= 0) continue;
    const x = -20 + (i + hash(i * 7) * .9) / 90 * 1960, v = (early ? 380 : 800) + hash(i * 11 + 4) * 800, w0 = early ? 14 + hash(i) * 12 : 22 + hash(i * 13) * 30;
    const len = Math.min(1250, v * u), col = cols[i % cols.length], pts = [];
    for (let k = 0; k <= 12; k++) { const y = -30 + len * k / 12; pts.push([x + snoise(y / 150 + t * .6, i + 70) * 12, y]); }
    ribbon(c, pts, w0 * 1.15, w0 * .85, col, .85, 800 + i, 2);
    if (len < 1240) { const e = pts[pts.length - 1]; c.globalAlpha = .85; c.fillStyle = col; c.beginPath(); c.ellipse(e[0], e[1] + w0 * .3, w0 * .7, w0 * .95, 0, 0, TAU); c.fill(); }
  }
  c.globalAlpha = 1; c.restore();
}

// ---------------- the enormous room ----------------
const VP = [960, 425], RTL = [700, 250], RTR = [1220, 250], RBL = [700, 600], RBR = [1220, 600];
const rdir = (P, k) => [VP[0] + (P[0] - VP[0]) * k, VP[1] + (P[1] - VP[1]) * k];
// a point on a side wall: k = distance multiplier out from the back corner (1 = back corner), h = 0 floor .. 1 ceiling
const wallPt = (right, k, h) => { const b = rdir(right ? RBR : RBL, k), u = rdir(right ? RTR : RTL, k); return [lerp(b[0], u[0], h), lerp(b[1], u[1], h)]; };
const ROOM = {
  ceil: [rdir(RTL, 7), rdir(RTR, 7), RTR, RTL], back: [RTL, RTR, RBR, RBL],
  left: [RTL, RBL, rdir(RBL, 7), rdir(RTL, 7)], right: [RTR, rdir(RTR, 7), rdir(RBR, 7), RBR],
  floor: [RBL, RBR, rdir(RBR, 7), rdir(RBL, 7)],
};
const DOOR = [wallPt(true, 1.16, 0), wallPt(true, 1.16, .56), wallPt(true, 1.55, .56), wallPt(true, 1.55, 0)];
const ps = (y) => clamp((y - VP[1]) / 375, .3, 2.2); // perspective scale on the floor (1 at y = 800)
const fbeat = (t) => lastBeat(t) + beatPhase(t) - INS.di; // beats since the drop (fractional)
const bt = (i) => FEAT.beats[INS.di + i];
let SIL = [];

function camRoom(t) {
  let cx = 960, cy = 540, s = 1;
  const push = ease.inOut(inv(INS.bar(1), INS.bar(8), t)); s = lerp(1, 1.32, push); cy = lerp(540, 745, push);
  if (t > INS.bar(8)) s += .012 * beatPulse(t, 7);
  { const fp = fbeat(t), up = ease.inOut(inv(11.4, 12.6, fp)) * (1 - ease.inOut(inv(15.4, 16.6, fp))); cy -= 190 * up; s -= .12 * up; }
  // the elephant's stomps shake the room
  const f = fbeat(t); if (f > 26 && f < 32) { const k = Math.floor(f); cy += 9 * hit(t, bt(k), 9) * Math.sin((t - bt(k)) * 60); }
  // the final push onto the customer in the doorway, landing on the diner's iris centre
  const u = ease.inOut(inv(INS.drain, INS.irisB, t));
  if (u > 0) { const sF = 1.9, W = [1312, 497]; const cxF = W[0] - (INS.IRIS[0] - 960) / sF, cyF = W[1] - (INS.IRIS[1] - 540) / sF;
    cx = lerp(cx, cxF, u); cy = lerp(cy, cyF, u); s = lerp(s, sF, u); }
  return { cx, cy, s, sn: 1 };
}

// local -> screen for a drawn creature: feet at (ax, ay), size s, facing dir, tilt rot, x-squash sx (spins)
function TF(ax, ay, s, dir = 1, rot = 0, sx = 1) { const c = Math.cos(rot * dir), n = Math.sin(rot * dir);
  return (lx, ly) => { const x = lx * sx * dir, y = ly; return S(ax + (x * c - y * n) * s, ay + (x * n + y * c) * s); }; }
const eli = (cx, cy, rx, ry, n = 18, rot = 0) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); } return p; };
function part(c, T, pts, fill, line, seed, sc, o = {}) {
  const sp = pts.map((p) => T(p[0], p[1])), k = Math.sqrt(sc * cam.s);
  if (fill) scribble(c, sp, { col: fill, sp: (o.sp || 7) * k, ang: o.ang ?? .4 + (seed % 5) * .5, seed, alpha: o.alpha ?? .9, w: (o.sp || 7) * k * 1.05 });
  if (line) crayon(c, sp, { col: line, w: (o.w || 5) * k, seed: seed + 1, closed: true, jit: 1.3 * k, gap: .04, passes: 2 });
  if (!o.noSil) SIL.push(sp);
  return sp;
}
function line2(c, T, pts, col, w, seed, sc) { const k = Math.sqrt(sc * cam.s); crayon(c, pts.map((p) => T(p[0], p[1])), { col, w: w * k, seed, jit: 1.2 * k, gap: .03, passes: 2 }); }
function dotT(c, T, x, y, r, col, seed, sc) { const [X, Y] = T(x, y); dot(c, X, Y, r * Math.sqrt(sc * cam.s) * 1.15, col, seed); }

// ---- the six elders (the same six who come back in cut paper in instrumental 2), as a child draws them ----
const ELDERS = [
  { name: 'Edna', body: '#f49ab6', skirt: '#e4422b', legs: '#f3c3a4', skin: '#f3c3a4', hair: 'bun', hairC: '#f1ede4', glasses: true, young: 'pony' },
  { name: 'Walt', body: '#2553c9', legs: '#5b4a3c', skin: '#e7ad88', hair: 'tufts', hairC: '#f1ede4', hat: 'flatcap', hatC: '#7a5a3a', bushy: true, mous: true, young: 'quiff' },
  { name: 'Rosa', body: '#3c9a3d', skirt: '#2f8a36', legs: '#c98a62', skin: '#c98a62', hair: 'curly', hairC: '#c9c7d2', hat: 'cloche', hatC: '#f7d01c', young: 'curls' },
  { name: 'Bert', body: '#e4422b', legs: '#3d4a6b', skin: '#f6d2bc', hair: 'tufts', hairC: '#f1ede4', glasses: true, cane: true, young: 'full' },
  { name: 'June', body: '#2553c9', skirt: '#1d3fa0', legs: '#a8714f', skin: '#a8714f', hair: 'bob', hairC: '#d4d5e0', hat: 'beret', hatC: '#f49ab6', pearls: true, young: 'bob' },
  { name: 'Sam', body: '#f7d01c', legs: '#2f3a2f', skin: '#f0bfa0', hair: 'side', hairC: '#bdbdc4', glasses: true, cane: true, young: 'afro' },
];
const DIM_OLD = { tor: 92, shw: 30, hipw: 20, ua: 46, fa: 42, th: 56, sh: 54, hr: 31 };
const DIM_YNG = { tor: 102, shw: 28, hipw: 17, ua: 56, fa: 52, th: 70, sh: 68, hr: 26 };
const SHADOW_COL = '#2b2557';
const R2 = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const STANDP = () => ({ aL: .14, aR: .14, eL: 0, eR: 0, lL: .05, lR: .05, kL: 0, kR: 0, lean: 0, rot: 0, lift: 0, dx: 0, dy: 0, look: [0, 0], brow: 0, smile: .4, cane: 0 });
function mixP(A, B, u) { if (u <= 0) return A; if (u >= 1) return B; const o = {}; for (const k in A) { const a = A[k], b = B[k] ?? a; o[k] = Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], u)) : typeof a === 'number' ? lerp(a, b, u) : (u < .5 ? a : b); } return o; }
// the skeleton: returns world points. Grounded figures sit their lowest point on groundY; others are placed by hip.
function rig(P, x, groundY, sz, young, grounded = true) {
  const D = young ? DIM_YNG : DIM_OLD, L = P.lean, rot = P.rot;
  const bf = (vx, vy) => R2(vx, vy, L);
  const N = bf(0, -D.tor), SR = [N[0] + bf(D.shw, 6)[0], N[1] + bf(D.shw, 6)[1]], SL = [N[0] + bf(-D.shw, 6)[0], N[1] + bf(-D.shw, 6)[1]];
  const head = [N[0] + bf(0, -(D.hr + 6))[0], N[1] + bf(0, -(D.hr + 6))[1]];
  const arm = (S, s, a, e) => { const d1 = bf(s * Math.sin(a), Math.cos(a)), d2 = bf(s * Math.sin(a + e), Math.cos(a + e)); const E = [S[0] + d1[0] * D.ua, S[1] + d1[1] * D.ua]; return [E, [E[0] + d2[0] * D.fa, E[1] + d2[1] * D.fa]]; };
  const [ER, HR] = arm(SR, 1, P.aR, P.eR), [EL, HL] = arm(SL, -1, P.aL, P.eL);
  const leg = (hx, s, l, k) => { const K = [hx + s * Math.sin(l) * D.th, Math.cos(l) * D.th]; return [K, [K[0] + s * Math.sin(l - k) * D.sh, K[1] + Math.cos(l - k) * D.sh]]; };
  const [KR, FR] = leg(D.hipw, 1, P.lR, P.kR), [KL, FL] = leg(-D.hipw, -1, P.lL, P.kL);
  const loc = { H: [0, 0], N, SR, SL, head, ER, HR, EL, HL, hR: [D.hipw, 0], hL: [-D.hipw, 0], KR, FR, KL, FL };
  // rotate the whole body about mid-torso, scale
  const piv = [0, -D.tor * .5], W = {};
  for (const k in loc) { const r = R2(loc[k][0] - piv[0], loc[k][1] - piv[1], rot); W[k] = [r[0] * sz, r[1] * sz]; }
  let oy;
  if (grounded) { let my = -1e9; for (const k of ['FR', 'FL', 'HR', 'HL', 'KR', 'KL']) my = Math.max(my, W[k][1]); my = Math.max(my, W.head[1] + D.hr * sz); oy = groundY - my - P.lift * sz; }
  else oy = groundY;
  for (const k in W) W[k] = [W[k][0] + x + P.dx * sz, W[k][1] + oy + P.dy * sz];
  W.ang = L + rot; W.sz = sz; W.D = D;
  return W;
}
function drawElder(c, i, P, x, groundY, sz, o = {}) {
  const E = ELDERS[i], young = !!o.shadow, W = rig(P, x, groundY, sz, young, o.grounded !== false), D = W.D;
  const pr = o.proj || ((p) => p), Tw = (px, py) => S(...pr([px, py]));
  const col = (q) => (young ? SHADOW_COL : q), sc = sz;
  const lw = (w) => w * (young ? .95 : 1);
  if (young) AMUL = o.alpha ?? .5;
  // legs (and shoes)
  for (const [h, K, F] of [[W.hL, W.KL, W.FL], [W.hR, W.KR, W.FR]]) { line2(c, Tw, [h, K, F], col(E.legs), lw(15), 4001 + i * 20 + (h === W.hL ? 0 : 1), sc); if (!young) { const [fx, fy] = Tw(...F); dot(c, fx, fy, 8 * Math.sqrt(sc * cam.s), COL.ink, 4005 + i * 20); } }
  // skirt / torso
  const up = R2(0, -1, W.ang), rt = R2(1, 0, W.ang);
  const at = (p, a, b) => [p[0] + rt[0] * a * sz + up[0] * b * sz, p[1] + rt[1] * a * sz + up[1] * b * sz];
  if (E.skirt) { const sk = [at(W.H, -D.hipw - 6, 8), at(W.H, D.hipw + 6, 8), at(W.H, D.hipw + 34, -52), at(W.H, -D.hipw - 34, -52)]; part(c, Tw, sk, col(E.skirt), young ? null : shade(E.skirt), 4010 + i * 20, sc, { sp: 7, noSil: young }); }
  const torso = [W.SL, W.SR, at(W.H, D.hipw + 8, -2), at(W.H, -D.hipw - 8, -2)];
  part(c, Tw, torso, col(E.body), young ? null : shade(E.body), 4012 + i * 20, sc, { sp: 7, noSil: young });
  if (!young && !E.skirt) for (let k = 0; k < 3; k++) { const b = at(W.H, 0, 20 + k * 22); const [bx, by] = Tw(...b); dot(c, bx, by, 3 * Math.sqrt(sc * cam.s), '#fbf6ea', 4014 + i * 20 + k); }
  // arms (sleeves) and hands
  for (const [S0, El, Hd, s] of [[W.SL, W.EL, W.HL, 0], [W.SR, W.ER, W.HR, 1]]) { line2(c, Tw, [S0, El, Hd], col(E.body), lw(13), 4016 + i * 20 + s, sc); if (!young) { const [hx, hy] = Tw(...Hd); dot(c, hx, hy, 7 * Math.sqrt(sc * cam.s), E.skin, 4018 + i * 20 + s); } }
  // cane: held in the right hand, along the forearm, unless it is planted as a vault pole
  if (E.cane && !young) { const dir = [W.HR[0] - W.ER[0], W.HR[1] - W.ER[1]], l = Math.hypot(...dir) || 1, cl = (o.caneLen || 1) * 120 * sz;
    const tip = o.caneTip || [W.HR[0] + dir[0] / l * cl, W.HR[1] + dir[1] / l * cl];
    line2(c, Tw, [[W.HR[0] - dir[0] / l * 14 * sz, W.HR[1] - dir[1] / l * 14 * sz], tip], '#6b4226', 7, 4019 + i * 20, sc); }
  // head (child style), in head-local units (radius 31)
  const hs = sz * D.hr / 31, HT = (lx, ly) => { const r = R2(lx, ly, W.ang); return Tw(W.head[0] + r[0] * hs, W.head[1] + r[1] * hs); };
  const hairKey = young ? E.young : E.hair, HC = col(E.hairC), HL = young ? null : '#8c8a86';
  if (hairKey === 'bun') part(c, HT, eli(0, -38, 14, 12, 12), HC, HL, 4030 + i, hs, { sp: 4, noSil: young });
  if (hairKey === 'pony') part(c, HT, eli(30, -20, 10, 26, 12, .5), HC, null, 4031 + i, hs, { sp: 4, noSil: true });
  if (hairKey === 'bob') part(c, HT, [[-38, 18], [-40, -14], [-26, -38], [26, -38], [40, -14], [38, 18]], HC, HL, 4032 + i, hs, { sp: 5, noSil: young });
  if (hairKey === 'afro' || hairKey === 'curls') part(c, HT, eli(0, -8, 44, 42, 16), HC, null, 4033 + i, hs, { sp: 6, noSil: true });
  part(c, HT, eli(0, 0, 31, 32, 18), col(E.skin), young ? null : shade(E.skin), 4034 + i * 3, hs, { sp: 5, noSil: young });
  if (!young) {
    const [ex, ey] = P.look || [0, 0];
    for (const s of [-1, 1]) { const [qx, qy] = HT(s * 11 + ex * 3, -2 + ey * 3); dot(c, qx, qy, 3.2 * Math.sqrt(hs * cam.s), COL.ink, 4040 + i * 3 + s); }
    if (E.glasses) for (const s of [-1, 1]) crayon(c, eli(s * 11, -2, 8, 8, 12).map((p) => HT(...p)), { col: COL.ink, w: 2.2 * Math.sqrt(hs * cam.s), seed: 4045 + i * 3 + s, closed: true, gap: 0, passes: 1, jit: .4 });
    const bw = E.bushy ? 4.5 : 2.2, bc = E.bushy ? '#ffffff' : '#7d7676', br = P.brow || 0;
    for (const s of [-1, 1]) line2(c, HT, [[s * 5, -14 - br * 6], [s * 17, -15 - br * 6]], bc, bw, 4050 + i * 3 + s, hs);
    for (const s of [-1, 1]) { const [qx, qy] = HT(s * 19, 9); dot(c, qx, qy, 4 * Math.sqrt(hs * cam.s), '#f19a9a', 4055 + i * 3 + s); }
    if (E.mous) { line2(c, HT, [[-14, 14], [-2, 11]], '#ffffff', 6, 4060, hs); line2(c, HT, [[2, 11], [14, 14]], '#ffffff', 6, 4061, hs); }
    const sm = P.smile ?? .4; line2(c, HT, [[-7, 19], [0, 19 + sm * 5], [7, 19]], COL.ink, 2.4, 4062 + i, hs);
    if (E.pearls) for (let k = 0; k < 7; k++) { const [qx, qy] = HT(-18 + k * 6, 40 + Math.sin(k / 6 * Math.PI) * 6); dot(c, qx, qy, 2.4 * Math.sqrt(hs * cam.s), '#fbf6ea', 4070 + k); }
  }
  if (hairKey === 'bun' || hairKey === 'side' || hairKey === 'bob' || hairKey === 'pony' || hairKey === 'full') part(c, HT, [[-32, -4], [-30, -22], [-14, -34], [14, -34], [30, -22], [32, -4], [20, -18], [hairKey === 'side' ? -4 : 0, -24], [-20, -16]], HC, HL, 4080 + i, hs, { sp: 4, noSil: young });
  if (hairKey === 'tufts') for (const s of [-1, 1]) part(c, HT, eli(s * 30, -6, 7, 10, 10), HC, HL, 4082 + i + s, hs, { sp: 3, noSil: young });
  if (hairKey === 'curly' || hairKey === 'curls') for (let q = 0; q < 5; q++) { const a = Math.PI * (1.08 + .84 * q / 4); const [qx, qy] = HT(Math.cos(a) * 31, Math.sin(a) * 31); dot(c, qx, qy, 8 * Math.sqrt(hs * cam.s), HC, 4085 + q); }
  if (hairKey === 'quiff') part(c, HT, [[-30, -10], [-26, -32], [0, -48], [28, -38], [30, -10], [12, -24], [-12, -20]], HC, null, 4090 + i, hs, { sp: 4, noSil: true });
  if (E.hat === 'flatcap' && !young) part(c, HT, [[-36, -16], [-32, -30], [-18, -38], [8, -40], [30, -32], [46, -20], [36, -14]], col(E.hatC), '#4a3622', 4092, hs, { sp: 4 });
  if (E.hat === 'cloche' && !young) { part(c, HT, [[-38, -2], [-34, -22], [-18, -38], [18, -38], [34, -22], [38, -2]], col(E.hatC), '#b8950c', 4094, hs, { sp: 4 }); line2(c, HT, [[-36, -8], [36, -8]], '#e4422b', 4, 4095, hs); }
  if (E.hat === 'beret' && !young) { part(c, HT, eli(6, -30, 32, 11, 14, .18), col(E.hatC), '#c0457a', 4096, hs, { sp: 4 }); line2(c, HT, [[8, -40], [10, -48]], E.hatC, 3, 4097, hs); }
  AMUL = 1;
  return W;
}

// ---- what they do: unexpected coordinated gymnastics, in unison, escalating every bar ----
const LINEY = 835, LINEX = (i) => 330 + i * 214, ESZ = () => 1.12 * ps(LINEY);
const ARMSEQ = [Math.PI * .96, Math.PI / 2, Math.PI * .96, .15];
function elderPose(i, f, t) {
  let P = STANDP(); const fl = Math.floor(f), fr = f - fl, bar = Math.floor(f / 4), q = ((f % 4) + 4) % 4;
  let x = LINEX(i), gy = LINEY, grounded = true, caneTip = null;
  if (f < 0) return { P, x, gy, grounded };
  const ez = (u) => ease.inOut(clamp(u));
  if (bar === 0) { // synchronised arm sweeps, heels up on the beat
    const k = Math.floor(q), from = k ? ARMSEQ[k - 1] : .14, a = lerp(from, ARMSEQ[k], ez(fr * 2.2));
    P.aL = P.aR = a; P.lift = 6 * Math.sin(Math.PI * fr); P.smile = .6;
  } else if (bar === 1) { // the group lunge: right, then left
    const side = q < 2 ? 1 : -1, u = ez((q % 2) * 1.0 + fr * 2.2);
    const L = { ...STANDP(), lR: side > 0 ? .75 : .3, kR: side > 0 ? .78 : 0, lL: side > 0 ? .3 : .75, kL: side > 0 ? 0 : .78, aR: side > 0 ? 2.5 : 1.45, aL: side > 0 ? 1.45 : 2.5, lean: side * .12, smile: .8 };
    P = mixP(STANDP(), L, q % 2 < 1 ? ez(fr * 2.5) : 1);
  } else if (bar === 2) { // a cartwheel passed down the line
    const s0 = 8 + i * .5, u = (f - s0) / 1.3;
    P.aL = P.aR = Math.PI / 2 + .35 * Math.sin(f * Math.PI); P.smile = .7;
    if (u > 0 && u < 1) { const e = ez(u); P = { ...STANDP(), rot: TAU * e, aL: Math.PI * .92, aR: Math.PI * .92, lL: .62, lR: .62, lift: 20 * Math.sin(Math.PI * u), dx: 80 * e, smile: 1 }; }
    else if (u >= 1) { P.dx = 80 * (1 - ez((f - 11.6) / .4)); P.aL = P.aR = 2.4; }
  } else if (bar === 3) { // human pyramid, with a wobble
    const ROLE = [[960, 2], [760, 0], [860, 1], [960, 0], [1060, 1], [1160, 0]]; // Edna on top, Rosa+June middle, Walt+Bert+Sam below
    const [px, row] = ROLE[i], S = ESZ(), lvl = 188 * S;
    const inU = ez((f - 12) / .9), outU = ez((f - 15.4) / .6), u = inU * (1 - outU);
    const wob = Math.sin(f * Math.PI * 1.5) * (row + 1) * .035 * u;
    x = lerp(LINEX(i), px, u) + wob * 300 * row; gy = LINEY - lvl * row * u - Math.sin(Math.PI * inU) * (row ? 60 : 0) * (1 - outU);
    P.lean = wob; P.aL = P.aR = row === 2 ? lerp(.14, q >= 2 ? 2.6 : 1.6, u) : row === 1 ? lerp(.14, 1.55, u) : lerp(.14, 2.9, u * .5); P.lL = P.lR = row === 2 ? .1 : lerp(.05, .5, u); P.kL = P.kR = row === 2 ? 0 : lerp(0, .95, u); P.smile = .5 + .5 * u; P.brow = row === 0 ? .5 * u : 0;
  } else if (bar === 4) { // Bert's cane becomes a vault pole
    P.aL = P.aR = lerp(.14, 2.7, ez(fr * 2)) * (fl % 2 ? 1 : .6); P.smile = .7;
    if (i === 3) { const u = clamp((f - 16.5) / 2.2), plant = [LINEX(3) + 110, LINEY];
      if (f >= 16 && f < 16.5) { P.aR = 2.2; P.aL = .5; }
      if (u > 0 && u < 1) { const e = ez(u); grounded = false; x = lerp(LINEX(3), LINEX(4) + 130, e); gy = LINEY - 120 * ESZ() - Math.sin(Math.PI * e) * 300; P.rot = -Math.PI / 2 * Math.sin(Math.PI * e); P.aR = P.aL = Math.PI; P.lL = P.lR = .15; caneTip = plant; }
      else if (u >= 1) { x = lerp(LINEX(4) + 130, LINEX(3), ez((f - 18.7) / 1.2)); }
    }
    if (i === 4 && f > 17.2 && f < 18.6) P.lean = .55 * Math.sin(Math.PI * (f - 17.2) / 1.4); // June ducks
    if (i !== 3 && f > 16.6 && f < 19) P.look = [clamp((f - 16.6) - 1, -1, 1), -.6];
  } else if (bar === 5) { // the kick line, arms linked
    const kick = Math.sin(Math.PI * fr) * 1.35; if (fl % 2) P.lR = kick; else P.lL = kick; P.aL = P.aR = Math.PI / 2 + .05; P.smile = 1;
  } else if (bar === 6) { // star jumps; the clock lands on beat 3; they glance, then carry on
    const glance = f >= 26 && f < 27.4;
    if (!glance) { const u = Math.sin(Math.PI * fr); P.aL = P.aR = lerp(.14, Math.PI * .8, u); P.lL = P.lR = lerp(.05, .5, u); P.lift = 40 * u; P.smile = .9; }
    else { const g = ez((f - 26) / .3); P.look = [-1 * g, -.4 * g]; P.brow = g; P.smile = 0; P.lean = -.06 * g; }
  } else if (bar === 7) { // handstands, then a walkover
    const u = ez((f - 28) / 1), hold = f >= 29 && f < 30.5, w = ez((f - 30.5) / 1);
    P.rot = Math.PI * u + Math.PI * w; P.aL = P.aR = Math.PI * .95 * Math.sin(Math.PI * Math.min(1, u + w) / 1) + .14; if (hold) { P.aL = P.aR = Math.PI * .97; P.lL = .25 + .1 * Math.sin(f * 7 + i); P.lR = .25 + .1 * Math.sin(f * 7 + i + 2); }
    if (f >= 31.5) { P.rot = 0; P.aL = P.aR = 2.5; P.smile = 1; }
  } else if (f >= 52) { // back in the room: a final "ta-da" line, shifted clear of the doorway
    x = 300 + i * 165; P.aL = P.aR = lerp(.14, 2.5, ez((f - 52) / .5)); P.smile = 1;
  }
  return { P, x, gy, grounded, caneTip };
}
// the young shadow: the same move, bigger and bendier
function youngPose(P, f) {
  const Y = { ...P, look: [0, 0] };
  const amp = (a, k) => .14 + (a - .14) * k;
  Y.aL = Math.min(Math.PI * 1.05, amp(P.aL, 1.15)); Y.aR = Math.min(Math.PI * 1.05, amp(P.aR, 1.15));
  Y.lL = Math.min(1.57, P.lL * 1.9 + (P.kL > .3 ? .5 : 0)); Y.lR = Math.min(1.57, P.lR * 1.9 + (P.kR > .3 ? .5 : 0)); Y.kL = 0; Y.kR = 0;
  Y.lean = P.lean * 2.2 - .25 * Math.max(0, Math.sin(Math.PI * (f % 2) / 2)) * (f > 0 ? 1 : 0); // a little back-bend on the beat
  Y.lift = P.lift * 1.6;
  return Y;
}
// the clock: drops in on beat 26 (bar 6, beat 3), crashes, bounces; nobody touches the hands
const CLOCK = { x: 960, y: 450, r: 140 };
function clockState(t) { const tl = bt(26); if (t < tl - .55) return null;
  if (t < tl) { const u = (t - (tl - .55)) / .55; return { y: lerp(-500, CLOCK.y, u * u), sq: 1 }; }
  const a = t - tl; return { y: CLOCK.y - Math.abs(Math.sin(a * 9)) * 70 * Math.exp(-a * 4.5), sq: 1 - .18 * Math.exp(-a * 14) }; }
function drawClockC(c, t) {
  const cs = clockState(t); if (!cs) return;
  const { x, r } = CLOCK, y = cs.y, rr = r * cs.sq;
  // legs it stands on
  line2(c, (a, b) => S(a, b), [[x - r * .55, y + r * .8], [x - r * .7, y + r * 1.12]], '#2a3f9a', 10, 4200, 1); line2(c, (a, b) => S(a, b), [[x + r * .55, y + r * .8], [x + r * .7, y + r * 1.12]], '#2a3f9a', 10, 4201, 1);
  const rim = SP(eli(x, y, r * 1.08, rr * 1.08, 30)); scribble(c, rim, { col: '#2553c9', sp: 12 * cam.s ** .5, ang: .6, seed: 4202, alpha: .9 });
  const face = SP(eli(x, y, r * .9, rr * .9, 30)); erase(c, [face]); scribble(c, face, { col: '#fbf6ea', sp: 9, ang: 1.1, seed: 4203, alpha: .9 }); crayon(c, face, { col: '#1a2a6a', w: 6 * cam.s ** .4, seed: 4204, closed: true });
  SIL.push(rim);
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, l = k % 3 ? .12 : .2; crayon(c, SP([[x + Math.sin(a) * r * .84, y - Math.cos(a) * rr * .84], [x + Math.sin(a) * r * (.84 - l), y - Math.cos(a) * rr * (.84 - l)]]), { col: COL.ink, w: (k % 3 ? 4 : 7) * cam.s ** .4, seed: 4210 + k, passes: 1, gap: 0 }); }
  const sk = beatIndex(t) + ease.back(clamp(beatPhase(t) * 5)), sa = sk / 60 * TAU * 2;
  const hand = (a, l, w, col, sd) => crayon(c, SP([[x, y], [x + Math.sin(a) * r * l, y - Math.cos(a) * rr * l]]), { col, w: w * cam.s ** .4, seed: sd, passes: 2, gap: 0 });
  hand(-1.2, .45, 9, COL.ink, 4230); hand(.55, .72, 6, COL.ink, 4231); hand(sa, .78, 3, '#e4422b', 4232); // hour, minute (untouched), second ticking on the beat
  dot(c, ...S(x, y), 7 * cam.s, COL.ink, 4233);
  // crash lines on landing
  const a = t - bt(26); if (a > 0 && a < .6) for (let k = 0; k < 9; k++) { const ang = Math.PI * (.9 + k / 8 * 1.2), d0 = r * 1.2, d1 = r * (1.35 + a * 1.4); crayon(c, SP([[x + Math.cos(ang) * d0, y + r * 1.1 + Math.sin(ang) * d0 * .25 - 10], [x + Math.cos(ang) * d1, y + r * 1.1 + Math.sin(ang) * d1 * .25 - 10]]), { col: COL.ink, w: 5, seed: 4240 + k, passes: 1, gap: 0, alpha: 1 - a / .6 }); }
}

// ---- the overhead kaleidoscope (52.3 - 61.5): lying on the floor, seen from above, a new design every bar ----
const KC = [960, 540];
function formation(f) { // returns per-elder {x, y, rot, P} on the floor, and the design radius
  const bar = Math.floor((f - 32) / 4), q = (f - 32) % 4, fr = f - Math.floor(f), fl = Math.floor(f), out = [];
  const spin = (f - 32) * Math.PI / 16, open = Math.sin(Math.PI * fr);
  const mk = (b, i) => { const P = STANDP(); let x, y, rot, R;
    if (b === 0) { const a = i / 6 * TAU + spin; R = 330; x = KC[0] + Math.cos(a) * 170; y = KC[1] + Math.sin(a) * 170; rot = a - Math.PI / 2 + Math.PI; P.aL = P.aR = Math.PI * .97; const k = fl % 2 ? open : 0; P.lL = P.lR = .1 + .55 * k; }
    else if (b === 1) { const a = i / 6 * TAU - spin * 1.4; R = 360; x = KC[0] + Math.cos(a) * 250; y = KC[1] + Math.sin(a) * 250; rot = a + Math.PI; P.aL = P.aR = Math.PI / 2; const k = (fl + i) % 2 ? open : 0; P.lL = .1 + .7 * k; P.lR = .1 + .7 * (open - k); }
    else if (b === 2) { const V = [[0, -300], [260, 0], [0, 300], [-260, 0]], e = i < 4 ? i : i - 4, mid = i >= 4; const A = V[mid ? e * 2 % 4 : e], B = V[mid ? (e * 2 + 1) % 4 : (e + 1) % 4];
      const u = mid ? .5 : .5; x = KC[0] + lerp(A[0], B[0], mid ? .5 : .5); y = KC[1] + lerp(A[1], B[1], u); if (!mid) { x = KC[0] + A[0] * .55 + B[0] * .45; y = KC[1] + A[1] * .55 + B[1] * .45; }
      rot = Math.atan2(B[1] - A[1], B[0] - A[0]) + Math.PI / 2; R = 330; P.aL = P.aR = Math.PI * .99; P.lL = P.lR = .05 + .3 * open; }
    else if (b === 3) { const a = i * 1.05 + spin * 2.2, rr = 70 + i * 40; R = 330; x = KC[0] + Math.cos(a) * rr; y = KC[1] + Math.sin(a) * rr; rot = a + .3; P.aL = Math.PI * .8; P.aR = .6 + .8 * open; P.lL = .6; P.lR = .1 + .6 * open; P.lean = .3 * Math.sin(f * Math.PI); }
    else { const a = i / 6 * TAU - spin; R = 380; x = KC[0] + Math.cos(a) * 250; y = KC[1] + Math.sin(a) * 250; rot = a - Math.PI / 2; P.aL = P.aR = Math.PI / 2 + .4 * open; P.lL = P.lR = .08 + .25 * open; }
    P.smile = 1; return { x, y, rot, P, R }; };
  for (let i = 0; i < 6; i++) { const cur = mk(bar, i); if (bar > 0 && q < .6) { const pv = mk(bar - 1, i), u = ease.inOut(q / .6); let dr = cur.rot - pv.rot; dr = Math.atan2(Math.sin(dr), Math.cos(dr));
      out.push({ x: lerp(pv.x, cur.x, u), y: lerp(pv.y, cur.y, u), rot: pv.rot + dr * u, P: mixP(pv.P, cur.P, u), R: lerp(pv.R, cur.R, u) }); } else out.push(cur); }
  return out;
}
const KALE_PIGS = ['verm', 'gold', 'water', 'willow', 'tear', 'indigo'];
function drawOverhead(g, t) {
  cam = { cx: 960, cy: 540, s: 1, sn: 1 }; BOIL = 3000 + beatIndex(t) * 2 + (beatPhase(t) > .5 ? 1 : 0); SIL = [];
  const base = [K, 0, 0, K, 0, 0], f = fbeat(t), F = formation(f).map((e) => ({ ...e, x: KC[0] + (e.x - KC[0]) * 1.3, y: KC[1] + (e.y - KC[1]) * 1.3, R: e.R * 1.3 })), sz = 1.5;
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paperTex, 0, 0); g.setTransform(...base);
  const c = cC; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, CW, CH); c.setTransform(...base);
  // the floor from above: boards
  scribble(c, [[-20, -20], [1940, -20], [1940, 1100], [-20, 1100]], { col: '#c08a52', sp: 24, ang: .02, seed: 4301, alpha: .4 });
  for (let y = 40, k = 0; y < 1080; y += 78, k++) crayon(c, [[-20, y], [1940, y + 4]], { col: '#8a5a2e', w: 4, seed: 4310 + k, alpha: .7, passes: 2, gap: .12 });
  for (let k = 0; k < 40; k++) { const y = 40 + (k % 13) * 78, x = (hash(k * 7) * 1900); crayon(c, [[x, y], [x + 2, y + 78]], { col: '#8a5a2e', w: 3, seed: 4360 + k, alpha: .5, passes: 1 }); }
  // shadows first: their young selves, offset and bendier
  const proj = (p) => [p[0] + 34, p[1] + 26];
  F.forEach((e, i) => drawElder(c, i, { ...youngPose(e.P, f), rot: e.rot }, e.x, e.y, sz * 1.1, { shadow: true, grounded: false, proj, alpha: .42 }));
  F.forEach((e, i) => drawElder(c, i, { ...e.P, rot: e.rot }, e.x, e.y, sz, { grounded: false }));
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-out'; c.globalAlpha = .92; c.drawImage(grainTex, 0, 0);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(layerC, 0, 0);
  // gouache colours the design on every beat: a centre bloom plus a six-fold ring of blooms (kaleidoscope)
  const w = cW; w.setTransform(1, 0, 0, 1, 0, 0); w.clearRect(0, 0, CW, CH); w.setTransform(...base);
  w.fillStyle = PIG.trunk[2]; w.globalAlpha = .28; w.fillRect(0, 0, 1920, 1080); w.globalAlpha = 1;
  const last = Math.floor(f);
  for (let k = Math.max(32, last - 5); k <= last; k++) { const old = last - k, fade = old >= 4 ? 1 - (old - 3) * .45 : 1, pig = KALE_PIGS[k % 6], R = F[0].R;
    flood(w, t, { t0: bt(k), dur: .4, origin: KC, R: R * (.55 + .1 * (k % 3)), ry: 1, seed: k % 10, pig, alpha: .55, fade, blooms: [] });
    for (let j = 0; j < 6; j++) { const a = j / 6 * TAU + k * .5 + (f - 32) * Math.PI / 16; flood(w, t, { t0: bt(k) + .05, dur: .35, origin: [KC[0] + Math.cos(a) * R * .95, KC[1] + Math.sin(a) * R * .95], R: 70 + 30 * (k % 2), ry: 1, seed: (k + j) % 10, pig: KALE_PIGS[(k + 3) % 6], alpha: .7, fade, blooms: [] }); } }
  w.save(); w.globalCompositeOperation = 'destination-out'; w.fillStyle = '#000'; for (const p of SIL) { w.beginPath(); polyPath(w, p); w.fill(); } w.restore();
  w.setTransform(1, 0, 0, 1, 0, 0);
  w.globalCompositeOperation = 'source-atop'; w.globalAlpha = .16; w.drawImage(grainTex, 0, 0);
  w.globalCompositeOperation = 'destination-out'; w.globalAlpha = .82; w.drawImage(layerC, 0, 0);
  w.globalCompositeOperation = 'source-over'; w.globalAlpha = 1;
  g.drawImage(layerW, 0, 0);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .45; g.drawImage(paperTex, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.setTransform(...base);
}
function drawEldersRoom(c, t) {
  const f = fbeat(t), S0 = ESZ();
  const shear = (F) => (p) => [p[0] + (F[1] - p[1]) * .42, F[1] - (F[1] - p[1]) * .78];
  const st = ELDERS.map((_, i) => elderPose(i, f, t));
  // shadows on the floor and up the back wall: their younger, bendier selves (attached at the feet)
  st.forEach((s, i) => { const F = [s.x + (s.P.dx || 0) * S0, s.gy]; drawElder(c, i, youngPose(s.P, f), s.x, s.gy, S0 * 1.05, { shadow: true, grounded: s.grounded, proj: shear(F), alpha: .45 }); });
  // draw order: lower rows (bigger y) last so the pyramid stacks right
  st.map((s, i) => [s, i]).sort((a, b) => a[0].gy - b[0].gy).forEach(([s, i]) => drawElder(c, i, s.P, s.x, s.gy, S0, { grounded: s.grounded, caneTip: s.caneTip, caneLen: s.caneTip ? 2 : 1 }));
}

// ---- gouache: the room floods with colour on the drop, a splash every bar, the clock's crash, bursts at the end ----
const BURSTP = ['verm', 'gold', 'water', 'willow', 'tear', 'indigo'];
function roomWash(w, t) {
  const f = fbeat(t), reg = (k) => SP(ROOM[k]);
  flood(w, t, { t0: INS.drop, dur: 1.6, origin: [960, 425], R: 900, ry: .7, seed: 2, pig: 'water', alpha: .55, region: reg('back'), blooms: [[820, 330, 60], [1120, 520, 50]] });
  flood(w, t, { t0: INS.drop + .23, dur: 1.7, origin: [350, 420], R: 1300, ry: .9, seed: 6, pig: 'gold', alpha: .5, region: reg('left'), blooms: [[300, 300, 90]] });
  flood(w, t, { t0: INS.drop + .47, dur: 1.7, origin: [1570, 420], R: 1300, ry: .9, seed: 8, pig: 'gold', alpha: .5, region: reg('right'), blooms: [[1650, 600, 80]] });
  flood(w, t, { t0: INS.drop + .7, dur: 1.9, origin: [960, 760], R: 1500, ry: .5, seed: 3, pig: 'trunk', alpha: .42, region: reg('floor'), blooms: [[600, 980, 90], [1400, 860, 70]] });
  // window light falling on the floor
  const lg = ease.out(inv(INS.drop + 1.2, INS.drop + 2.6, t));
  if (lg > 0) { w.fillStyle = PIG.gold[2]; w.globalAlpha = .32 * lg;
    for (const wx of [790, 960, 1130]) { const fx = 960 + (wx - 960) * 1.6; w.beginPath(); polyPath(w, SP([[wx - 34, 600], [wx + 34, 600], [fx + 80, 1000], [fx - 80, 1000]])); w.fill(); }
    w.globalAlpha = 1; }
  // a splash behind the line on every bar downbeat, bigger each bar
  for (let b = 0; b < 8; b++) if (f >= b * 4) flood(w, t, { t0: bt(b * 4), dur: .55, origin: [960 + (b % 2 ? 260 : -260), 860], R: 170 + b * 45, ry: .4, seed: b % 10, pig: BURSTP[b % BURSTP.length], alpha: .6, blooms: [[960, 870, 50]] });
  // the clock's crash splash
  if (t >= bt(26)) flood(w, t, { t0: bt(26), dur: .45, origin: [CLOCK.x, CLOCK.y + CLOCK.r * 1.1], R: 260, ry: .35, seed: 7, pig: 'indigo', alpha: .7, blooms: [[CLOCK.x + 60, CLOCK.y + 140, 50]] });
  // the big dance: a burst on every beat (fading after ten)
  if (f >= 52) { const last = Math.min(Math.floor(f), 60);
    for (let k = Math.max(32, last - 9); k <= last; k++) { const old = last - k, x = 960 + 620 * Math.sin(k * .77 + .4), y = 760 + 200 * Math.sin(k * 1.31 + 1);
      flood(w, t, { t0: bt(k), dur: .45, origin: [x, y], R: (150 + 90 * hash(k)) * ps(y) * 1.3, ry: .55, seed: k % 10, pig: BURSTP[k % BURSTP.length], alpha: .7, fade: old >= 7 ? 1 - (old - 6) * .28 : 1, blooms: [[x, y, 40]] }); } }
}

function drawRoomScene(g, t) {
  cam = camRoom(t); BOIL = 2000 + beatIndex(t) * (t >= INS.bar(8) ? 2 : 1) + (t >= INS.bar(8) && beatPhase(t) > .5 ? 1 : 0); SIL = [];
  const base = [K, 0, 0, K, 0, 0];
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paperTex, 0, 0); g.setTransform(...base);
  const c = cC; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, CW, CH); c.setTransform(...base);
  // room in crayon
  scribble(c, SP(ROOM.ceil), { col: '#e8dcbc', sp: 30, ang: .1, seed: 3001, alpha: .4 });
  scribble(c, SP(ROOM.left), { col: '#e2c98e', sp: 26, ang: 1.45, seed: 3002, alpha: .45 });
  scribble(c, SP(ROOM.right), { col: '#e2c98e', sp: 26, ang: 1.7, seed: 3003, alpha: .45 });
  scribble(c, SP(ROOM.back), { col: '#cfdcc6', sp: 20, ang: 1.3, seed: 3004, alpha: .5 });
  scribble(c, SP(ROOM.floor), { col: '#c08a52', sp: 22, ang: .05, seed: 3005, alpha: .5 });
  for (let x = 700, i = 0; x <= 1220; x += 26, i++) crayon(c, SP([[x, 600], rdir([x, 600], 6)]), { col: '#8a5a2e', w: 4.5, seed: 3010 + i, alpha: .75, passes: 2, gap: .1 });
  for (const k of [1.12, 1.3, 1.6, 2.1]) crayon(c, SP([rdir(RBL, k), rdir(RBR, k)]), { col: '#8a5a2e', w: 3.5, seed: 3040 + k * 10, alpha: .5, passes: 1, gap: .25 });
  const edge = '#6b4a2a';
  for (const [a, b] of [[RTL, RTR], [RTR, RBR], [RBR, RBL], [RBL, RTL], [RTL, rdir(RTL, 7)], [RTR, rdir(RTR, 7)], [RBL, rdir(RBL, 7)], [RBR, rdir(RBR, 7)]]) crayon(c, SP([a, b]), { col: edge, w: 7, seed: 3060 + a[0] + b[1], passes: 2 });
  crayon(c, SP([wallPt(false, 6, .2), wallPt(false, 1, .2), wallPt(true, 1, .2), wallPt(true, 6, .2)]), { col: '#9a6a3a', w: 5, seed: 3070, passes: 2 }); // dado rail
  // tall arched windows on the back wall, tall panes on the side walls
  [790, 960, 1130].forEach((wx, i) => { const win = [[wx - 38, 520]]; for (let k = 0; k <= 10; k++) { const a = Math.PI + k / 10 * Math.PI; win.push([wx + Math.cos(a) * 38, 330 + Math.sin(a) * 38]); } win.push([wx + 38, 520]);
    const sw = SP(win); scribble(c, sw, { col: '#9fd0f0', sp: 9, ang: 1, seed: 3080 + i, alpha: .8 }); crayon(c, sw, { col: '#7a5a3a', w: 6, seed: 3085 + i, closed: true });
    crayon(c, SP([[wx, 296], [wx, 520]]), { col: '#7a5a3a', w: 4, seed: 3090 + i }); crayon(c, SP([[wx - 38, 420], [wx + 38, 420]]), { col: '#7a5a3a', w: 4, seed: 3093 + i }); });
  for (const right of [false, true]) for (const [k0, k1, j] of [[1.3, 1.7, 0], [2.2, 3.0, 1]]) { if (right && j === 0) continue;
    const q = [wallPt(right, k0, .22), wallPt(right, k0, .86), wallPt(right, k1, .86), wallPt(right, k1, .22)], sq = SP(q), sd = 3100 + j + (right ? 5 : 0);
    scribble(c, sq, { col: '#9fd0f0', sp: 12, ang: right ? 1.9 : 1.2, seed: sd, alpha: .75 }); crayon(c, sq, { col: '#7a5a3a', w: 7, seed: sd + 10, closed: true });
    const km = (k0 + k1) / 2; crayon(c, SP([wallPt(right, km, .22), wallPt(right, km, .86)]), { col: '#7a5a3a', w: 5, seed: sd + 20 }); }
  // the doorway (right wall), a lit hallway beyond
  const sdr = SP(DOOR); scribble(c, sdr, { col: '#f3df8a', sp: 10, ang: 1.5, seed: 3130, alpha: .85 }); crayon(c, sdr, { col: '#6b4a2a', w: 7, seed: 3131, closed: true }); SIL.push(sdr);
  // a lone light bulb hanging from the far ceiling, swinging on the beat
  { const sw = Math.sin((beatIndex(t) + ease.inOut(beatPhase(t))) * Math.PI) * .12, top = [960, 120], L = 150, bx = top[0] + Math.sin(sw) * L, by = top[1] + Math.cos(sw) * L;
    crayon(c, SP([[960, -200], top, [bx, by]]), { col: COL.ink, w: 3, seed: 3140, passes: 1, gap: 0 });
    const bulb = SP(eli(bx, by + 14, 11, 14, 14)); scribble(c, bulb, { col: '#f7e27a', sp: 5, seed: 3141, alpha: .9 }); crayon(c, bulb, { col: '#c79a1a', w: 3, seed: 3142, closed: true }); }
  // the cast, back to front
  drawClockC(c, t);
  drawEldersRoom(c, t);
  // the customer watches from the doorway (bar 10 on), faintly satisfied at the end
  const cIn = inv(INS.bar(5), INS.bar(5) + .5, t);
  if (cIn > 0) { const st = { x: lerp(1395, 1325, ease.out(cIn)), y: 652, k: .62, mouth: 'flat', look: [-1, 0], brow: 0, nod: 0, sink: 0, tear: 0, squash: .02 * beatPulse(t, 9) };
    const u = t - INS.bar(13) - .2; if (u > 0 && u < 2.4) { st.brow = ease.out(u / .2) * (1 - inv(2, 2.4, u)); if (u < .5) st.nod = Math.sin(Math.PI * u / .5) * 8; }
    if (t > INS.drain) st.look = [0, 0];
    c.save(); c.beginPath(); polyPath(c, sdr); c.clip(); const sn = cam.sn; cam.sn = .75 * cam.s; drawCustomer(c, t, st); cam.sn = sn; c.restore(); }
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-out'; c.globalAlpha = .92; c.drawImage(grainTex, 0, 0);
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(layerC, 0, 0);
  // gouache
  const w = cW; w.setTransform(1, 0, 0, 1, 0, 0); w.clearRect(0, 0, CW, CH); w.setTransform(...base);
  if (t >= INS.drop) {
    roomWash(w, t);
    w.save(); w.globalCompositeOperation = 'destination-out'; w.fillStyle = '#000'; for (const p of SIL) { w.beginPath(); polyPath(w, p); w.fill(); } w.restore();
    w.setTransform(1, 0, 0, 1, 0, 0);
    w.globalCompositeOperation = 'source-atop'; w.globalAlpha = .16; w.drawImage(grainTex, 0, 0);
    w.globalCompositeOperation = 'destination-out'; w.globalAlpha = .82; w.drawImage(layerC, 0, 0);
    w.globalCompositeOperation = 'source-over'; w.globalAlpha = 1;
    g.drawImage(layerW, 0, 0);
  }
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .45; g.drawImage(paperTex, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.setTransform(...base);
}
// 35.5 to the drop: the weep scene runs off the page in wet strips, uncovering the room
function drawRoom(g, t) {
  const fb = fbeat(t); if (fb >= 32 && fb < 52) { drawOverhead(g, t); return; }
  if (t >= INS.drop) { drawRoomScene(g, t); return; }
  if (!TMP) TMP = mkCanvas(CW, CH);
  const tc = TMP.getContext('2d'); drawVerse(tc, t);
  drawRoomScene(g, t);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const N = 40, sw = CW / N;
  for (let i = 0; i < N; i++) {
    const d = hash(i * 17 + 3) * .75 + Math.abs(i - N * .35) / N * .5, u = ease.in(inv(INS.t0 + d * .9, INS.drop - .25 + d * .2, t)), dy = u * CH * 1.25;
    if (dy >= CH) continue;
    g.drawImage(TMP, i * sw, 0, sw + 1, CH - dy, i * sw, dy, sw + 1, CH - dy);
    if (dy > 2) { g.globalAlpha = .55; g.fillStyle = i % 3 ? PIG.indigo[0] : PIG.tear[0]; const tw = sw * (.35 + .4 * hash(i)); const L = 160 * K * u; g.fillRect(i * sw + (sw - tw) / 2, Math.max(0, dy - L), tw, Math.min(dy, L)); g.globalAlpha = 1; }
  }
  g.restore();
}
// drain to two-tone sepia + grain, then the iris closes onto the diner's opening iris
function finish(g, t) {
  if (t < INS.drain) return;
  const a = ease.inOut(inv(INS.drain, INS.sepia1, t));
  if (!TMP) TMP = mkCanvas(CW, CH);
  const tc = TMP.getContext('2d'); tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, CW, CH); tc.drawImage(g.canvas, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.filter = 'grayscale(1) sepia(.85) contrast(1.75) brightness(1.04)'; g.globalAlpha = a; g.drawImage(TMP, 0, 0); g.filter = 'none';
  g.globalAlpha = .45 * a; g.drawImage(grainTex, 0, 0);
  const fl = hash(Math.round(t * 24) * 7 + 3) - .5; g.globalAlpha = Math.abs(fl) * .12 * a; g.fillStyle = fl > 0 ? '#fff4dc' : '#1a1209'; g.fillRect(0, 0, CW, CH);
  g.restore();
  if (t >= INS.irisA) {
    const [ix, iy, ir] = INS.IRIS, r = lerp(1400, ir, ease.inOut(inv(INS.irisA, INS.irisB, t)));
    g.beginPath(); g.rect(-20, -20, 1960, 1120); g.arc(ix, iy, r, 0, TAU); g.fillStyle = '#0b0805'; g.fill('evenodd');
  }
}
function drawFrame(g, t) {
  if (t < INS.t0) drawVerse(g, t); else drawRoom(g, t);
  finish(g, t);
}
