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

// ---------------- title (count-in) ----------------
const LET = {
  B: { w: .68, s: [[[0, 0], [0, 1]], [[0, 0], [.42, .02], [.6, .14], [.56, .36], [.3, .47], [0, .48]], [[.2, .48], [.55, .53], [.68, .72], [.58, .94], [.3, 1], [0, 1]]] },
  O: { w: .8, s: [Array.from({ length: 23 }, (_, i) => { const a = -Math.PI / 2 - .25 + i / 21 * TAU; return [.4 + Math.cos(a) * .4, .5 + Math.sin(a) * .5]; })] },
  W: { w: 1.0, s: [[[0, 0], [.22, 1], [.5, .35], [.78, 1], [1, 0]]] },
  I: { w: .34, s: [[[.17, 0], [.17, 1]], [[0, .02], [.34, 0]], [[0, 1], [.34, .99]]] },
  S: { w: .66, s: [[[.64, .14], [.48, 0], [.18, .02], [.03, .2], [.14, .42], [.5, .55], [.66, .76], [.55, .96], [.24, 1], [0, .86]]] },
  E: { w: .6, s: [[[.6, 0], [0, 0], [0, 1], [.6, 1]], [[0, .5], [.46, .49]]] },
  M: { w: .95, s: [[[0, 1], [.05, 0], [.47, .62], [.9, 0], [.95, 1]]] },
  A: { w: .82, s: [[[0, 1], [.41, 0], [.82, 1]], [[.17, .62], [.66, .6]]] },
  N: { w: .72, s: [[[0, 1], [0, 0], [.72, 1], [.72, 0]]] },
  R: { w: .68, s: [[[0, 1], [0, 0], [.42, .02], [.62, .16], [.55, .4], [.3, .48], [0, .48]], [[.26, .48], [.68, 1]]] },
};
const TITLE_BOX = [300, 210, 1620, 880]; // the crayon sign the title lives in
function layoutWord(word, h, gapK = .2) { let x = 0; const out = [];
  for (const ch of word) { if (ch === ' ') { x += h * .45; continue; } out.push({ ch, x }); x += LET[ch].w * h + h * gapK; }
  return { items: out, width: x - h * gapK }; }
const T1 = layoutWord('BOB WISEMAN', 128), T2 = layoutWord('MORE', 300, .16);
const TITLE_FIT = (() => { // measured fit inside the sign, with margin
  const inner = TITLE_BOX[2] - TITLE_BOX[0], margin = 80;
  const sc = Math.min(1, (inner - 2 * margin) / Math.max(T1.width, T2.width));
  return { sc, margin1: (inner - T1.width * sc) / 2, margin2: (inner - T2.width * sc) / 2, h: 128 * sc + 300 * sc + 70 };
})();
window.__TITLE_FIT = TITLE_FIT;
function drawTitle(c, t, dy) {
  const B = FEAT.beats, box = TITLE_BOX, fit = TITLE_FIT;
  const pulse = 1 + .03 * beatPulse(t, 7);
  const cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2 + dy;
  const T = (x, y) => [cx + (x - cx) * pulse, cy + (y - (box[1] + box[3]) / 2) * pulse];
  // the sign
  const rb = inv(.05, .5, t);
  crayon(c, [[box[0], box[1]], [box[2], box[1] + 6], [box[2] - 4, box[3]], [box[0] + 6, box[3] - 4]].map(([x, y]) => T(x, y)), { col: '#e07a20', w: 10, seed: 900, closed: true, reveal: rb });
  // letters: BOB on beat 1, WISEMAN across beats 2-3, MORE one letter per half beat from beat 4
  const totalH = fit.h, top = (box[1] + box[3]) / 2 - totalH / 2;
  const rows = [
    { lay: T1, h: 128 * fit.sc, y: top, x0: box[0] + fit.margin1, col: COL.red, w: 11, start: B[0], per: (B[2] - B[0]) / 10 },
    { lay: T2, h: 300 * fit.sc, y: top + 128 * fit.sc + 70, x0: box[0] + fit.margin2, col: COL.blue, w: 19, start: B[3], per: (B[5] - B[3]) / 4 },
  ];
  let li = 0;
  for (const r of rows) r.lay.items.forEach((it, i) => {
    const t0 = r.start + i * r.per, u = clamp((t - t0) / (r.per * .9)); li++;
    if (u <= 0) return;
    const L = LET[it.ch], hop = (i % 2 ? 1 : -1) * 6 * beatPulse(t, 8);
    L.s.forEach((st, k) => {
      const ku = clamp(u * L.s.length - k);
      const pts = st.map(([x, y]) => T(r.x0 + it.x * fit.sc + x * r.h, r.y + y * r.h + hop));
      crayon(c, pts, { col: r.col, w: r.w, seed: 700 + li * 9 + k, reveal: ku, jit: 3 });
    });
  });
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
  const p = ease.out(clamp((t - o.t0) / o.dur));
  const [ox, oy] = S(...o.origin), R = o.R * cam.s * (.04 + .96 * p), ry = (o.ry || 1);
  c.save();
  if (o.region) { const rp = new Path2D(); polyPath(rp, o.region); c.clip(rp); o._rp = rp; }
  const fp = defPath(o.seed, ox, oy, R, R * ry, o.rot || 0);
  c.clip(fp);
  const P = PIG[o.pig];
  c.fillStyle = P[0]; c.globalAlpha = o.alpha ?? .8; c.fillRect(-50, -50, 2020, 1180);
  const settle = 1 - ease.out(clamp((t - o.t0) / 3));
  drawMottle(c, o.pig, .55, (o.seed * 137) % 400 + settle * 60, (o.seed * 71) % 300 + settle * 25);
  // pigment concentration rings inside (deformed layers)
  c.fillStyle = P[1];
  for (let i = 0; i < 4; i++) { c.globalAlpha = .07; c.fill(defPath(o.seed + i + 1, ox, oy, R * (.25 + i * .18), R * (.25 + i * .18) * ry)); }
  // tide marks left by earlier positions of the front
  c.strokeStyle = P[1];
  for (const f of [.42, .7]) if (p > f + .05) { c.globalAlpha = .22; c.lineWidth = 2.5; c.stroke(defPath(o.seed + 5, ox, oy, o.R * cam.s * f, o.R * cam.s * f * ry)); }
  // pooling against the region border
  if (o._rp) { c.globalAlpha = .28; c.lineWidth = 34; c.stroke(o._rp); c.globalAlpha = .35; c.lineWidth = 7; c.stroke(o._rp); }
  // wet front: dark edge
  if (p < 1) { c.globalAlpha = .4 * (1 - p * .5); c.lineWidth = 16; c.stroke(fp); c.globalAlpha = .55; c.lineWidth = 4; c.stroke(fp); }
  // blooms (backruns): pale centre, dark cauliflower rim
  (o.blooms || []).forEach(([bx, by, br], i) => {
    const tb = o.t0 + o.dur * .7 + i * .35, g = ease.out(clamp((t - tb) / 1.3)); if (g <= 0) return;
    const [sx, sy] = S(bx, by), bp = defPath(o.seed + 3 + i, sx, sy, br * cam.s * g);
    c.globalCompositeOperation = 'destination-out'; c.globalAlpha = .16; c.fill(bp);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = .55; c.lineWidth = 3; c.stroke(bp);
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
function drawFrame(g, t) {
  cam = camAt(t); BOIL = Math.max(0, beatIndex(t) + 1);
  const base = [K, 0, 0, K, 0, 0];
  // paper
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(paperTex, 0, 0); g.setTransform(...base);

  // ===== crayon layer =====
  const c = cC; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, CW, CH); c.setTransform(...base);
  const titleOut = ease.in(inv(3.32, 3.75, t));
  const sceneT = t; const built = (a, b) => inv(a, b, sceneT);
  const showScene = t > 3.25;
  const st = custState(t);
  if (showScene) {
    const [vx0, vx1] = visX();
    const hl = hillLine(vx0, vx1, 30 / Math.max(1, cam.s * .8));
    // sky scribble (blue crayon), then stars in pale wax
    const skyPoly = SP([[vx0, -900]].concat(hl, [[vx1, -900]]));
    scribble(c, skyPoly, { col: COL.sky, sp: 21 * cam.sn ** .5, ang: 1.25, seed: 11, alpha: .62, reveal: built(3.3, 4.6) });
    if (t > CUE.blue) scribble(c, skyPoly, { col: '#4fa3e8', sp: 30 * cam.sn ** .5, ang: .35, seed: 12, alpha: .35, reveal: inv(CUE.blue, CUE.blue + .45, t) });
    STARS.forEach(([x, y], i) => {
      const r = (16 + hash(i) * 10) * cam.s ** .6 * (1 + .25 * beatPulse(t - i * .03, 5)), [sx, sy] = S(x, y), rot = hash(i + 4) + (BOIL % 2) * .15;
      const pts = []; for (let k = 0; k < 10; k++) { const a = rot + k / 10 * TAU, rr = k % 2 ? r * .45 : r; pts.push([sx + Math.cos(a) * rr, sy + Math.sin(a) * rr]); }
      crayon(c, pts, { col: COL.star, w: 7 * cam.sn ** .4, seed: 40 + i, closed: true, reveal: built(4.4 + i * .05, 4.9 + i * .05), alpha: 1, passes: 2, gap: .05 });
    });
    // sun: rays tick round one notch per beat
    { const [sx, sy] = S(...SUN), r = 64 * cam.s, rb = built(4.3, 4.9);
      erase(c, [circlePts(sx, sy, r * 1.02, 20)], rb);
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
    scribble(c, hillPoly, { col: COL.hill, sp: 18 * cam.sn ** .5, ang: .25, seed: 21, alpha: .66, reveal: built(3.3, 3.95) });
    if (pondPath) { c.restore(); c.save(); c.clip(pondPath); AMUL = hillFade; scribble(c, hillPoly, { col: COL.hill, sp: 18 * cam.sn ** .5, ang: .25, seed: 21, alpha: .66 }); AMUL = 1; c.restore(); }
    if (pondPath) { c.save(); const op = new Path2D(); op.rect(-100, -100, 2200, 1300); op.addPath(pondPath); c.clip(op, 'evenodd'); }
    crayon(c, SP(hl), { col: COL.hillDk, w: 9 * cam.sn ** .4, seed: 22, reveal: built(3.3, 3.8), step: 6 });
    if (pondPath) c.restore();
    // grass tufts nod on the beat
    for (let x = Math.ceil(vx0 / 70) * 70; x < vx1; x += 70) { if (t > CUE.deep && Math.hypot((x - POND.cx) / (POND.rx + 40), (hillY(x) - POND.cy) / (POND.ry + 30)) < 1) continue;
      const y = hillY(x), lean = ((BOIL + x / 70) % 2 ? 1 : -1) * 8 * (.4 + beatPulse(t, 5));
      for (const dx of [-8, 0, 8]) crayon(c, SP([[x + dx, y + 4], [x + dx * 1.6 + lean, y - 26 - hash(x + dx) * 12]]), { col: COL.grass, w: 6 * cam.sn ** .4, seed: x + dx, passes: 2, reveal: built(3.6, 4.1) }); }
    // clear the sky wax behind the tree and the customer (a child colours around them)
    erase(c, [SP(circlePts(TREE.x, TREE.top, TREE.r, 24)), SP([[TREE.x - 16, TREE.base], [TREE.x - 16, TREE.top], [TREE.x + 16, TREE.top], [TREE.x + 16, TREE.base]])], built(3.9, 4.4));
    erase(c, custSil(st).map(SP), built(3.6, 4.15));
    // the lollipop tree (droops on "willow")
    { const droop = ease.out(inv(CUE.willow, CUE.willow + .5, t)), hop = 10 * hit(t, CUE.tree, 5) * Math.sin((t - CUE.tree) * 18);
      const tr = SP([[TREE.x - 16, TREE.base + 6], [TREE.x - 12, TREE.top + TREE.r * .8 + hop], [TREE.x + 12, TREE.top + TREE.r * .8 + hop], [TREE.x + 16, TREE.base + 6]]);
      const rb = built(3.9, 4.4);
      scribble(c, tr, { col: COL.trunk, sp: 9, ang: 1.5, seed: 70, alpha: .8, reveal: rb });
      crayon(c, tr, { col: '#5a3518', w: 7 * cam.sn ** .4, seed: 71, closed: true, reveal: rb });
      const cr = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU, sg = Math.max(0, Math.sin(a)); cr.push([TREE.x + Math.cos(a) * TREE.r * (1 + .08 * sg * droop), TREE.top - hop * .3 + Math.sin(a) * TREE.r * (1 + .45 * sg * sg * droop) * (1 + .04 * hit(t, CUE.tree, 4))]); }
      const crs = SP(cr);
      AMUL = 1 - .75 * droop;
      scribble(c, crs, { col: COL.crown, sp: 15 * cam.sn ** .5, ang: .9, seed: 72, alpha: .72, reveal: rb });
      crayon(c, crs, { col: COL.crownDk, w: 8 * cam.sn ** .4, seed: 73, closed: true, reveal: rb }); AMUL = 1; }
    // the customer pops in under "the sky's"
    if (t < CUE.deep) drawCustomer(c, t, st, built(3.6, 4.15));
    else { // below the waterline he is only a faint crayon ghost under the paint
      const pondP = new Path2D(); polyPath(pondP, SP(circlePts(POND.cx, POND.cy, POND.rx, 60, 0, POND.ry)));
      const sub = ease.out(inv(CUE.deep, CUE.deep + 1.2, t));
      c.save(); const outP = new Path2D(); outP.rect(-100, -100, 2200, 1300); outP.addPath(pondP); c.clip(outP, 'evenodd'); drawCustomer(c, t, st); c.restore();
      c.save(); c.clip(pondP); AMUL = 1 - .7 * sub; drawCustomer(c, t, st); AMUL = 1; c.restore();
    }
  }
  if (t < 3.8) { c.save(); c.translate(0, -titleOut * 1100); drawTitle(c, t, 0); c.restore(); }
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
        ribbon(w, pts, 10 * cam.s, (16 + 10 * beatPulse(t, 5)) * cam.s * Math.min(1, u * 2), PIG.tear[0], .6, 600 + sx, 3);
        // splash at the pond
        if (u > .6) { const [px, py] = S(...cw(st, sx * 1.4, ey + 158)); w.strokeStyle = PIG.tear[2]; w.globalAlpha = .7 * (1 - beatPhase(t)); w.lineWidth = 4; w.beginPath(); w.ellipse(px, py, (20 + 30 * beatPhase(t)) * cam.s, (5 + 8 * beatPhase(t)) * cam.s, 0, 0, TAU); w.stroke(); w.globalAlpha = 1; }
      }
    }
    w.setTransform(1, 0, 0, 1, 0, 0);
    g.drawImage(layerW, 0, 0);
  }
  // sit everything in the paper
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .45; g.drawImage(paperTex, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.setTransform(...base);
}
