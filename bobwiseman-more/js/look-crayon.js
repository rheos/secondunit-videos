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
// Bob's scene: the weep scene drains off the page to reveal an enormous empty crayon room with one elderly
// tortoise. On the drums it makes one painfully slow dance step; then a rabbit, two flamingos, a dog,
// chickens, an elephant and a mouse arrive, each wanting more movement than the last, and from 52 s everyone
// dances at once. The last ~3 s drain to sepia and close an iris on the customer in the doorway, on the
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

// ---- the cast (a child's crayon drawings) ----
function tortoise(c, x, y, sz, lift, look = 0) {
  const s = sz * ps(y), T = TF(x, y, s, 1, -lift * .07), L = '#2d5a20';
  line2(c, T, [[-14, -14], [-15, 0]], '#7f965f', 13, 2001, s); line2(c, T, [[22, -14], [24, 0]], '#7f965f', 13, 2002, s);
  line2(c, T, [[-32, -14], [-35, 0]], '#93ab72', 14, 2003, s);
  line2(c, T, [[36, -14], [40 + lift * 16, -lift * 30]], '#93ab72', 14, 2004, s); // the dancing foot
  const shell = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; shell.push([Math.cos(a) * 52, -14 + Math.sin(a) * 40]); }
  part(c, T, shell, '#5c9a3e', L, 2010, s, { w: 6 });
  line2(c, T, [[-36, -18], [-24, -40], [0, -48], [24, -40], [36, -18]], L, 4, 2012, s);
  line2(c, T, [[-6, -48], [-10, -18]], L, 4, 2013, s); line2(c, T, [[14, -46], [12, -18]], L, 4, 2014, s);
  line2(c, T, [[-52, -14], [-60, -8]], '#93ab72', 8, 2015, s);
  line2(c, T, [[46, -22], [56, -30]], '#a3b884', 13, 2016, s);
  part(c, T, eli(64, -32, 15, 13), '#a8bd88', '#4c6234', 2020, s, { sp: 6 });
  dotT(c, T, 68 + look * 2, -35, 2.6, COL.ink, 2022, s);
  crayon(c, eli(68 + look * 2, -35, 6.5, 6.5, 12).map((p) => T(p[0], p[1])), { col: COL.ink, w: 1.8 * Math.sqrt(s * cam.s), seed: 2023, closed: true, gap: 0, passes: 1, jit: .5 }); // spectacles
  line2(c, T, [[62, -44], [72, -45]], '#f2f2f2', 3, 2024, s); // white eyebrow
  line2(c, T, [[71, -26], [77, -27]], COL.ink, 2.4, 2025, s);
}
function rabbit(c, x, y, sz, dir, o = {}) {
  const s = sz * ps(y), T = TF(x, y - (o.hop || 0) * s, s, dir), G = '#6b665f', F = '#cfc9c0';
  part(c, T, eli(-6, -5, 18, 6), F, G, 2101, s, { sp: 6 });
  part(c, T, eli(-26, -32, 10, 10, 12), '#f3f1ec', G, 2102, s, { sp: 5 });
  part(c, T, eli(0, -40, 26, 32), F, G, 2103, s);
  const tap = o.tap || 0, lift = o.lift || 0, ft = eli(18, -4, 18, 6).map(([px, py]) => { const a = -tap * .55, dx = px - 2, dy = py + 2; return [2 + dx * Math.cos(a) - dy * Math.sin(a) + lift * 10, -2 + dx * Math.sin(a) + dy * Math.cos(a) - lift * 26]; });
  part(c, T, ft, F, G, 2104, s, { sp: 6 });
  const ear = (o.ear || 0) * .25;
  part(c, T, eli(4, -124, 7, 27, 14, -.18 - ear), F, G, 2105, s, { sp: 5 }); part(c, T, eli(22, -122, 7, 27, 14, .2 + ear), F, G, 2106, s, { sp: 5 });
  line2(c, T, [[4, -140], [5, -112]], '#f29bb3', 3.5, 2107, s); line2(c, T, [[22, -138], [21, -110]], '#f29bb3', 3.5, 2108, s);
  part(c, T, eli(14, -86, 20, 19), F, G, 2109, s);
  dotT(c, T, 22, -90, 2.8, COL.ink, 2110, s); dotT(c, T, 33, -84, 2.6, '#e86f93', 2111, s);
  line2(c, T, [[30, -80], [44, -82]], G, 1.6, 2112, s); line2(c, T, [[30, -78], [43, -74]], G, 1.6, 2113, s);
  line2(c, T, [[4, -60], [22, -54], [8, -48]], G, 4, 2114, s); // arms folded high on the chest, still
}
function flamingo(c, x, y, sz, dir, o = {}) {
  const s = sz * ps(y), T = TF(x, y - (o.bob || 0) * s, s, dir, o.rot || 0, o.sx ?? 1), P = '#f48fb6', D = '#c0457a', LG = '#e2779e';
  line2(c, T, [[0, 0], [3, -46], [0, -92]], LG, 5, 2201, s); line2(c, T, [[-6, 0], [10, 0]], LG, 4, 2202, s);
  const k = o.kick || 0, tuck = [[0, -92], [16, -72], [4, -60]], kick = [[0, -92], [36, -86], [72, -96]];
  line2(c, T, tuck.map((p, i) => [lerp(p[0], kick[i][0], k), lerp(p[1], kick[i][1], k)]), LG, 5, 2203, s);
  part(c, T, eli(0, -112, 40, 22, 18, -.15), P, D, 2204, s);
  const f = o.flap || 0;
  part(c, T, [[-14, -118], [-34 + f * 6, -122 - f * 46], [12, -124]], '#f7b3cd', D, 2205, s, { sp: 5 });
  const w = o.sway || 0, neck = [[28, -120], [38 + w * 8, -146], [22 + w * 18, -172], [30 + w * 24, -196]];
  line2(c, T, neck, P, 9, 2206, s); line2(c, T, neck, D, 2.2, 2207, s);
  part(c, T, eli(40 + w * 26, -200, 11, 10), P, D, 2208, s, { sp: 5 });
  line2(c, T, [[48 + w * 26, -202], [60 + w * 26, -192], [55 + w * 26, -184]], COL.ink, 5, 2209, s);
  dotT(c, T, 42 + w * 26, -203, 2.2, COL.ink, 2210, s);
}
function dog(c, x, y, sz, dir, o = {}) {
  const s = sz * ps(y), T = TF(x, y - (o.jump || 0) * s, s, dir, o.rot || 0), B = '#c98d4f', D = '#6e4520', la = o.legs || [0, 0, 0, 0];
  [[-30, -24], [30, -24], [-22, -24], [38, -24]].forEach(([hx, hy], i) => line2(c, T, [[hx, hy], [hx + Math.sin(la[i]) * 20, hy + Math.cos(la[i]) * 24]], i < 2 ? '#a8733c' : B, 9, 2301 + i, s));
  const wag = o.wag || 0; line2(c, T, [[-42, -46], [-56, -58], [-60 + wag * 14, -76]], B, 7, 2306, s);
  part(c, T, eli(0, -42, 44, 22), B, D, 2307, s);
  dotT(c, T, -12, -48, 6, D, 2308, s); dotT(c, T, 14, -36, 5, D, 2309, s);
  part(c, T, eli(46, -66, 20, 19), B, D, 2310, s);
  part(c, T, eli(36, -58, 8, 16, 12, .5 + wag * .2), '#7a4a22', D, 2311, s, { sp: 5 });
  dotT(c, T, 54, -72, 2.8, COL.ink, 2312, s); dotT(c, T, 66, -66, 4, COL.ink, 2313, s);
  if (o.tongue) part(c, T, eli(58, -50, 5, 9, 10), '#ef6f8f', '#b23a5a', 2314, s, { sp: 4, noSil: true });
}
function chicken(c, x, y, sz, dir, o = {}, seed = 0) {
  const s = sz * ps(y), T = TF(x, y - (o.bob || 0) * s, s, dir), Y = '#e0a21a', G = '#7a756c';
  const leg = (hx, k, sd) => { const a = k * 1.35; const fx = hx + Math.sin(a) * 18, fy = -14 + Math.cos(a) * 14; line2(c, T, [[hx, -14], [fx, fy]], Y, 4, sd, s); line2(c, T, [[fx - 5, fy], [fx + 7, fy - (k > .3 ? 4 : 0)]], Y, 3, sd + 50, s); };
  leg(-6, o.kickL || 0, 2401 + seed); leg(6, o.kickR || 0, 2402 + seed);
  line2(c, T, [[-20, -40], [-32, -56]], G, 3, 2403 + seed, s); line2(c, T, [[-22, -36], [-36, -46]], G, 3, 2404 + seed, s);
  part(c, T, eli(0, -34, 24, 19), '#e2ddd3', G, 2405 + seed, s, { sp: 6 });
  part(c, T, eli(-2, -36, 12, 7, 12, -(o.wing || 0) * .9), '#d2ccc1', G, 2406 + seed, s, { sp: 4 });
  const hb = o.peck || 0;
  part(c, T, eli(16 + hb * 4, -58 + hb * 8, 11, 11), '#e2ddd3', G, 2407 + seed, s, { sp: 5 });
  for (const [cx, cy] of [[12, -70], [17, -72], [22, -70]]) dotT(c, T, cx + hb * 4, cy + hb * 8, 3.4, '#d8402f', 2408 + seed, s);
  part(c, T, [[26 + hb * 4, -60 + hb * 8], [35 + hb * 4, -56 + hb * 8], [26 + hb * 4, -53 + hb * 8]], Y, '#a8740c', 2409 + seed, s, { sp: 3, noSil: true });
  dotT(c, T, 25 + hb * 4, -50 + hb * 8, 3, '#d8402f', 2410 + seed, s); dotT(c, T, 19 + hb * 4, -61 + hb * 8, 2.2, COL.ink, 2411 + seed, s);
}
function elephantT(x, y, sz, dir, o = {}) { const s = sz * ps(y); return { s, T: TF(x, y, s, dir, o.tilt || 0, o.sx ?? 1) }; }
function elephant(c, x, y, sz, dir, o = {}) {
  const { s, T } = elephantT(x, y, sz, dir, o), G = '#a3a9b0', D = '#4f555c', ll = o.legLift || 0, bl = o.backLift || 0;
  line2(c, T, [[-38, -40], [-38, 0]], '#8a9098', 24, 2501, s); line2(c, T, [[42, -40], [42, 0]], '#8a9098', 24, 2502, s);
  line2(c, T, [[-78, -84], [-92, -62]], D, 4, 2503, s);
  part(c, T, eli(0, -80, 78, 52), G, D, 2504, s, { sp: 9 });
  line2(c, T, [[-56, -40], [-56 - bl * 46, -bl * 40]], G, 26, 2505, s);
  line2(c, T, [[56, -40], [56 + ll * 26, -ll * 40]], G, 26, 2506, s);
  if (o.tutu > 0) { const tt = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU, r = 1 + .14 * (i % 2); tt.push([Math.cos(a) * 96 * r * o.tutu, -52 + Math.sin(a) * 18 * r * o.tutu]); } part(c, T, tt, '#f6a6c8', '#d0568e', 2507, s, { sp: 6 }); }
  part(c, T, eli(48, -104, 26, 36, 16, -.1), '#8e949c', D, 2508, s, { sp: 7 });
  part(c, T, eli(74, -110, 38, 36), G, D, 2509, s, { sp: 8 });
  const tr = o.trunk || 0, trunk = [[104, -100], [120, -74 - tr * 30], [118 + tr * 10, -46 - tr * 60], [130 + tr * 6, -34 - tr * 80]];
  line2(c, T, trunk, D, 20, 2510, s); line2(c, T, trunk, G, 13, 2511, s);
  line2(c, T, [[100, -90], [112, -82]], '#fbf8ee', 5, 2512, s);
  dotT(c, T, 88, -120, 3.4, COL.ink, 2513, s);
}
function mouse(c, x, y, sz, dir, o = {}) {
  const s = sz * ps(o.py ?? y), T = TF(x, y - (o.hop || 0) * s, s, dir), G = '#9b968f', D = '#4d4a46';
  line2(c, T, [[-12, -6], [-24, -2], [-30, -12]], D, 2.5, 2601, s);
  part(c, T, eli(0, -9, 13, 9), G, D, 2602, s, { sp: 4 });
  part(c, T, [[9, -14], [24, -9], [9, -3]], G, D, 2603, s, { sp: 3 });
  part(c, T, eli(7, -18, 6, 6, 10), '#f2a7bd', D, 2604, s, { sp: 3 });
  dotT(c, T, 16, -10, 1.8, COL.ink, 2605, s); dotT(c, T, 24, -9, 1.8, '#e86f93', 2606, s);
}

// ---- who is where, and doing what (pure functions of t) ----
const POS = { tort: [960, 800], rab: [775, 845], fl1: [1150, 752], fl2: [1270, 752], dog: [400, 935], ch: [[1165, 965], [1290, 965], [1415, 965]], ele: [610, 726] };
const MAG = 1.6;
const stepIn = (f, f0, n, a, b) => { const u = (f - f0), k = Math.floor(u), fr = u - k; return lerp(a, b, clamp((Math.min(k, n - 1) + ease.inOut(k >= n ? 1 : fr)) / n)); };
function castAt(t) {
  const f = fbeat(t), fr = f - Math.floor(f), fl = Math.floor(f), A = [];
  // tortoise: one slow step on the drop (2 beats up, 2 beats down); in the big dance it repeats, twice as slow
  let lift = f >= 0 && f < 4 ? (f < 2 ? ease.inOut(f / 2) : 1 - ease.inOut((f - 2) / 2)) : 0;
  if (f >= 32) lift = Math.sin(Math.PI * ((f - 32) % 8) / 8);
  A.push({ y: POS.tort[1], d: (c) => tortoise(c, POS.tort[0], POS.tort[1], 1.4 * MAG, lift, f > 4 && f < 32 ? Math.sin(f * .3) : 0) });
  // rabbit: hops in (bar 1), copies the step (2 beats), then taps its foot impatiently
  if (f >= 4) { const enter = f < 8, x = enter ? stepIn(f, 4, 4, -140, POS.rab[0]) : POS.rab[0];
    const o = { hop: enter ? Math.sin(Math.PI * fr) * 70 : 0 };
    if (f >= 8 && f < 10) o.lift = Math.sin(Math.PI * (f - 8) / 2);
    if (f >= 10) { o.tap = Math.abs(Math.sin(Math.PI * 2 * fr)); o.ear = Math.sin(f * Math.PI); }
    if (f >= 32) o.hop = (fl % 2 ? Math.sin(Math.PI * fr) * 34 : 0);
    A.push({ y: POS.rab[1], d: (c) => rabbit(c, x, POS.rab[1], MAG, 1, o) }); }
  // two flamingos: high-step in from the right, then one synchronized routine
  if (f >= 10) [POS.fl1, POS.fl2].forEach((P, i) => {
    const enter = f < 14, x = enter ? stepIn(f, 10, 4, 2060 + i * 120, P[0]) : P[0], o = {};
    if (enter) { o.kick = Math.sin(Math.PI * fr) * .55; o.bob = Math.sin(Math.PI * fr) * 6; }
    else if (f < 32) { o.sway = Math.sin(Math.PI * f / 2); o.flap = fl % 4 === 0 ? Math.sin(Math.PI * fr) : 0; }
    else { const m = fl % 4; o.sway = Math.sin(Math.PI * f / 2); o.kick = m === 0 || m === 2 ? Math.sin(Math.PI * fr) : 0; o.flap = m === 3 ? Math.sin(Math.PI * fr) : .15; o.rot = m === 1 ? -.15 * Math.sin(Math.PI * fr) : 0; }
    let dir = -1; if (f >= 32) { const bar = Math.floor((f - 32) / 4); dir = bar % 2 ? 1 : -1; const into = (f - 32) % 4; if (into < .5) o.sx = Math.max(.15, Math.sin(Math.PI / 2 * into / .5)); }
    A.push({ y: P[1], d: (c) => flamingo(c, x, P[1], MAG, dir, o) }); });
  // dog: bounds in, then jumps about; in the big dance, ecstatic and with no technique at all
  if (f >= 18) { const enter = f < 22; let x = enter ? stepIn(f, 18, 4, -170, POS.dog[0]) : POS.dog[0] + (f < 32 ? Math.sin(f * Math.PI / 2) * 60 : 0);
    const o = { wag: Math.sin(f * Math.PI * 4), legs: [Math.sin(f * 9) * .6, -Math.sin(f * 9) * .6, Math.cos(f * 9) * .6, -Math.cos(f * 9) * .6] };
    let dir = 1;
    if (enter || f < 32) o.jump = Math.sin(Math.PI * fr) * (enter ? 55 : 40);
    else { const h = hash(fl * 13 + 5); o.jump = Math.sin(Math.PI * fr) * (60 + h * 50); o.rot = (h - .5) * 1.4 * Math.sin(Math.PI * fr); dir = hash(fl * 7 + 1) > .5 ? 1 : -1; o.tongue = 1;
      const hb = Math.floor(f * 2); o.legs = [0, 1, 2, 3].map((i) => (hash2(hb, i, 3) - .5) * 2.6); x += (hash(fl * 3) - .5) * 90; }
    A.push({ y: POS.dog[1], d: (c) => dog(c, x, POS.dog[1], 1.05 * MAG, dir, o) }); }
  // chickens: trot in single file, peck on the beat, then a chorus-line kick line
  if (f >= 22) POS.ch.forEach((P, j) => {
    const enter = f < 26, x = enter ? stepIn(f, 22, 4, 2080 + j * 140, P[0]) : P[0] + (f >= 32 ? Math.sin(Math.PI * (f - 32) / 4) * 40 : 0), o = {};
    if (enter) { o.bob = Math.abs(Math.sin(Math.PI * 2 * fr)) * 8; o.kickL = Math.max(0, Math.sin(Math.PI * 2 * fr)) * .5; o.kickR = Math.max(0, -Math.sin(Math.PI * 2 * fr)) * .5; }
    else if (f < 32) { o.peck = fl % 2 ? Math.sin(Math.PI * fr) : 0; o.kickR = fl % 2 ? 0 : Math.sin(Math.PI * fr) * .7; }
    else { const k = Math.sin(Math.PI * fr); if (fl % 2) o.kickL = k * 1.15; else o.kickR = k * 1.15; o.wing = .7; }
    A.push({ y: P[1], d: (c) => chicken(c, x, P[1], .9 * MAG, -1, o, j * 20) }); });
  // elephant: stomps in (the room shakes), stomps in place, then attempts ballet in a tutu
  let ele = null;
  if (f >= 26) { const enter = f < 30, x = enter ? stepIn(f, 26, 4, -340, POS.ele[0]) : POS.ele[0], o = { trunk: 0 };
    if (f < 32) { o.legLift = fl % 2 ? Math.sin(Math.PI * fr) * .8 : 0; o.backLift = fl % 2 ? 0 : Math.sin(Math.PI * fr) * .5; if (!enter) o.trunk = Math.sin(Math.PI * fr) * .8; }
    else { o.tutu = ease.back(inv(INS.bar(8), INS.bar(8) + .4, t)); const bar = Math.floor((f - 32) / 4), into = (f - 32) % 4;
      if (bar % 2 === 0) { o.tilt = -.2 * ease.out(Math.min(1, into)) + Math.sin(t * 9) * .05; o.backLift = ease.out(Math.min(1, into)); o.trunk = .9; }
      else { const sp = ease.inOut(Math.min(1, into / 2)); o.sx = Math.cos(sp * TAU); o.tilt = Math.sin(t * 11) * .07; o.legLift = .6; o.trunk = .5 + .5 * Math.sin(f * Math.PI); } }
    if (o.sx !== undefined && Math.abs(o.sx) < .12) o.sx = .12 * (Math.sign(o.sx) || 1);
    ele = { x, y: POS.ele[1], o };
    A.push({ y: POS.ele[1], d: (c) => elephant(c, x, POS.ele[1], 1.45 * 1.3, 1, o) }); }
  // mouse: scurries in, leaps onto the elephant's head and spins there
  if (f >= 30) { let x, y, dir = -1; const o = { py: 990 };
    const head = ele ? elephantT(ele.x, ele.y, 1.45 * 1.3, 1, ele.o).T(74, -150) : S(700, 600);
    const W = [(head[0] - 960) / cam.s + cam.cx, (head[1] - 540) / cam.s + cam.cy];
    if (f < 32.5) { x = stepIn(f, 30, 10, 2010, 700); y = 990; o.hop = Math.abs(Math.sin(Math.PI * 4 * fr)) * 6; }
    else if (f < 33.5) { const u = ease.inOut(f - 32.5); x = lerp(700, W[0], u); y = lerp(990, W[1], u) - Math.sin(Math.PI * u) * 200; }
    else { x = W[0]; y = W[1]; dir = Math.floor(f * 2) % 2 ? 1 : -1; o.hop = Math.sin(Math.PI * ((f * 2) % 1)) * 10; }
    A.push({ y: f < 32.5 ? 990 : POS.ele[1] + .5, d: (c) => mouse(c, x, y, 1.15 * MAG, dir, o) }); }
  return A.sort((a, b) => a.y - b.y);
}

// ---- gouache: the room floods with colour on the drop, splashes on each arrival, bursts on every beat ----
const ARRIVE = [[4, 'tear', [775, 850], 150], [10, 'verm', [1210, 755], 190], [18, 'gold', [400, 935], 230], [22, 'willow', [1290, 965], 270], [26, 'indigo', [610, 730], 320], [30, 'verm', [700, 995], 150]];
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
  for (const [b, pig, P, R] of ARRIVE) if (f >= b) flood(w, t, { t0: bt(b), dur: .6, origin: P, R, ry: .45, seed: b % 10, pig, alpha: .62, blooms: [[P[0] + 40, P[1], R * .3]] });
  // the big dance: a burst on every beat (fading after ten)
  if (f >= 32) { const last = Math.min(Math.floor(f), 60);
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
  for (const a of castAt(t)) a.d(c);
  // the customer watches from the doorway (bar 10 on), faintly satisfied at the end
  const cIn = inv(INS.bar(10), INS.bar(10) + .5, t);
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
