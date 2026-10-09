// Tarot engine: a Marseille-manner woodcut print, drawn per frame as a pure function of song time.
// Every card is printed in two passes on offscreen layers that share the card's transform:
//   PR.c  colour stencils (fills, each colour slipped off register by its own offset), mottled where ink starved
//   PR.l  the black key block (variable-width cut lines, hatching, lettering), speckled where paper tooth skipped
// Both are multiplied onto an aged card stock. Seeded randomness only.
const W = 1920, H = 1080, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = (t, a, b) => smooth((t - a) / (b - a));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const q8 = (t) => Math.floor(t * 8 + 1e-6) / 8; // woodcut puppets move on 8 fps steps
function rnd(a, b = 0, c = 0) { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + 0.37) * 43758.5453; return x - Math.floor(x); }
function n1(seed, x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(rnd(seed, i), rnd(seed, i + 1), u) * 2 - 1; }
function mulberry(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mkCanvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

const COL = {
  red: '#c8392b', yellow: '#eab52e', blue: '#4f7dbd', navy: '#22408a', flesh: '#f1c29a',
  green: '#5c9a4f', white: '#ffffff', ink: '#1a1410', pale: '#cfe0ee', brown: '#a8673a',
  black: '#2e2733', purple: '#6c4188', ghost: '#f6efe6', plum: '#5a1f3c', grey: '#9a9692', orange: '#e57f2c',
};
const FONT = '"Big Caslon", "Times New Roman", serif';

// ---------- seeded textures ----------
// tileable value noise: a small random grid tiled 3x3, upscaled with smoothing, centre cropped
function noiseTile(size, cells, seed) {
  // the grid is tiled 3x3 BEFORE one smooth upscale, so the interpolation wraps and the tile has no seams
  const R = mulberry(seed), g = mkCanvas(cells * 3, cells * 3), gg = g.getContext('2d'), id = gg.createImageData(cells * 3, cells * 3);
  const v = []; for (let i = 0; i < cells * cells; i++) v.push(R() * 255);
  for (let y = 0; y < cells * 3; y++) for (let x = 0; x < cells * 3; x++) { const k = v[(y % cells) * cells + (x % cells)]; id.data.set([k, k, k, 255], (y * cells * 3 + x) * 4); }
  gg.putImageData(id, 0, 0);
  const big = mkCanvas(size * 3, size * 3), bg = big.getContext('2d'); bg.imageSmoothingEnabled = true; bg.imageSmoothingQuality = 'high';
  bg.drawImage(g, 0, 0, size * 3, size * 3);
  const out = mkCanvas(size, size); out.getContext('2d').drawImage(big, size, size, size, size, 0, 0, size, size);
  return out.getContext('2d').getImageData(0, 0, size, size).data;
}
let STOCK, MOTTLE, TOOTH, CLOTH;
function buildTextures() {
  const S = 512, R = mulberry(7);
  const nA = noiseTile(S, 6, 11), nB = noiseTile(S, 24, 12), nC = noiseTile(S, 64, 13);
  // card stock: warm cream, mottled, with fibres and foxing
  STOCK = mkCanvas(S, S); { const g = STOCK.getContext('2d'), id = g.createImageData(S, S), d = id.data;
    for (let i = 0; i < S * S; i++) {
      const m = (nA[i * 4] / 255 - .5) * 18 + (nB[i * 4] / 255 - .5) * 10 + (R() - .5) * 12;
      d[i * 4] = 238 + m; d[i * 4 + 1] = 222 + m * .95; d[i * 4 + 2] = 184 + m * .8; d[i * 4 + 3] = 255;
    }
    g.putImageData(id, 0, 0); g.lineCap = 'round';
    for (let i = 0; i < 500; i++) {
      const x = R() * S, y = R() * S, l = 4 + R() * 16, a = R() * TAU;
      g.strokeStyle = R() < .5 ? 'rgba(130,100,60,.13)' : 'rgba(255,250,235,.35)'; g.lineWidth = .6 + R() * .8;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < 26; i++) { const x = R() * S, y = R() * S, r = 1 + R() * 4; g.fillStyle = `rgba(150,95,45,${.08 + R() * .16})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  }
  // colour mottle: alpha = how much ink is missing (blotchy starvation + fine specks)
  MOTTLE = mkCanvas(S, S); { const g = MOTTLE.getContext('2d'), id = g.createImageData(S, S), d = id.data;
    for (let i = 0; i < S * S; i++) {
      const x = i % S, y = (i / S) | 0, streak = Math.sin(y * .55 + n1(5, x / 37) * 3 + nA[i * 4] / 30) * .5 + .5;
      let a = clamp((nB[i * 4] / 255 - .5) * 1.2) * .22 + clamp((nC[i * 4] / 255 - .62) * 2) * .12 + streak * streak * .1;
      if (R() < .012) a = Math.max(a, .5 + R() * .5);
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255; d[i * 4 + 3] = a * 255;
    }
    g.putImageData(id, 0, 0);
  }
  // key-block tooth: sparse specks and short streaks where black ink skipped the paper
  TOOTH = mkCanvas(S, S); { const g = TOOTH.getContext('2d'), id = g.createImageData(S, S), d = id.data;
    for (let i = 0; i < S * S; i++) {
      let a = clamp((nC[i * 4] / 255 - .72) * 3.5) * .6;
      if (R() < .06) a = Math.max(a, .55 + R() * .45);
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255; d[i * 4 + 3] = a * 255;
    }
    g.putImageData(id, 0, 0);
  }
  // green baize: a woven cloth tile
  CLOTH = mkCanvas(S, S); { const g = CLOTH.getContext('2d'), id = g.createImageData(S, S), d = id.data;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const i = y * S + x, weave = ((x >> 1) + (y >> 1)) % 2 ? 3 : -3;
      const m = (nA[i * 4] / 255 - .5) * 10 + (nB[i * 4] / 255 - .5) * 8 + (R() - .5) * 9 + weave;
      d[i * 4] = 30 + m * .7; d[i * 4 + 1] = 58 + m; d[i * 4 + 2] = 44 + m * .8; d[i * 4 + 3] = 255;
    }
    g.putImageData(id, 0, 0);
  }
}

// ---------- geometry ----------
// affine m = [a,b,c,d,e,f]; ap applies it; mul(m1,m2) applies m2 first
const I = [1, 0, 0, 1, 0, 0];
const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const T = (x, y) => [1, 0, 0, 1, x, y];
const Rm = (r) => [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
const Sm = (sx, sy = sx) => [sx, 0, 0, sy, 0, 0];
const chain = (...ms) => ms.reduce((a, b) => mul(a, b), I);
const ap = (m, pts) => pts.map(([x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]);
const ap1 = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

function circ(cx, cy, r, n = 28, ry = r, a0 = 0) { const p = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * ry]); } return p; }
function arc(cx, cy, r, a0, a1, n = 16, ry = r) { const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * ry]); } return p; }
function rectP(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
// Catmull-Rom through control points
function spline(pts, closed = true, k = 6) {
  const n = pts.length, out = [], P = (i) => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let j = 0; j < k; j++) {
      const u = j / k, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((c) => .5 * (2 * p1[c] + (-p0[c] + p2[c]) * u + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * u2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * u3)));
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
function densify(pts, step = 10, closed = true) {
  const out = [], n = pts.length, m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) {
    const a = pts[i], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / step));
    for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
// hand-cut wobble, seeded by position in the part's own space (so moving parts never boil)
function rough(pts, seed, amp = 2, f = .035) {
  return pts.map(([x, y]) => [x + amp * n1(seed, x * f + y * f * .71), y + amp * n1(seed + 3.3, y * f - x * f * .63)]);
}

// ---------- printer ----------
const PR = { c: null, l: null, off: {}, lw: 1 };
function pathOn(g, pts, o = [0, 0]) { g.moveTo(pts[0][0] + o[0], pts[0][1] + o[1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] + o[0], pts[i][1] + o[1]); g.closePath(); }
function knock(pts) { const l = PR.l; l.save(); l.globalCompositeOperation = 'destination-out'; l.globalAlpha = 1; l.fillStyle = '#000'; l.beginPath(); pathOn(l, pts); l.fill(); l.restore(); }
// a stencil fill; the key block is cleared under it so lines behind a shape never show through
function pfill(col, pts, erase = true) {
  const g = PR.c, o = PR.off[col] || [0, 0];
  if (erase) knock(pts);
  g.fillStyle = COL[col] || col; g.beginPath(); pathOn(g, pts, o); g.fill();
}
// a cut line: width swells and thins along its length, tapers at open ends
function strokePoly(pts, w, seed, closed) {
  const n = pts.length; if (n < 2) return null;
  const s = [0]; for (let i = 1; i < n; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = s[n - 1] + (closed ? Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]) : 0);
  const left = [], right = [];
  for (let i = 0; i < n; i++) {
    const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    let ww = w * (.62 + .76 * (n1(seed, s[i] / 46) * .5 + .5));
    if (!closed) ww *= Math.min(1, .3 + s[i] / (w * 2.6), .3 + (L - s[i]) / (w * 2.6));
    left.push([pts[i][0] - dy * ww / 2, pts[i][1] + dx * ww / 2]); right.push([pts[i][0] + dy * ww / 2, pts[i][1] - dx * ww / 2]);
  }
  return [left, right];
}
function pline(pts, w = 4, seed = 1, closed = false) {
  const g = PR.l, r = strokePoly(pts, w * PR.lw, seed, closed); if (!r) return;
  g.fillStyle = COL.ink; g.beginPath();
  if (closed) { pathOn(g, r[0]); pathOn(g, r[1]); g.fill('evenodd'); }
  else { pathOn(g, r[0].concat(r[1].reverse())); g.fill(); }
}
// a printed part: stencil fill (own wobble, own register) + key-block outline
function part(m, ctrl, o = {}) {
  const seed = o.seed || 1, sm = o.smooth !== false, closed = o.closed !== false;
  let base = sm ? spline(ctrl, closed, o.k || 6) : densify(ctrl, o.step || 14, closed);
  const lp = ap(m, rough(base, seed, o.lamp == null ? 1.6 : o.lamp));
  if (o.fill) { if (closed) knock(lp); pfill(o.fill, ap(m, rough(base, seed + 101, o.famp == null ? 3 : o.famp)), false); }
  if (o.line !== 0) pline(lp, o.line || 4, seed, closed);
}
function lineP(m, ctrl, w = 3, seed = 1, sm = true) { const b = sm && ctrl.length > 2 ? spline(ctrl, false, 6) : densify(ctrl, 10, false); pline(ap(m, rough(b, seed, 1.3)), w, seed, false); }
// parallel woodcut hatching inside a region (region in m's space)
function hatch(m, region, ang, sp, w, seed, cover = 1) {
  const g = PR.l, reg = ap(m, region);
  g.save(); g.beginPath(); pathOn(g, reg); g.clip();
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of region) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4, ca = Math.cos(ang), sa = Math.sin(ang);
  let k = 0;
  for (let d = -R; d <= R; d += sp, k++) {
    if (rnd(seed, k, 5) > cover) continue;
    const l0 = -R * (.5 + rnd(seed, k) * .5), l1 = R * (.5 + rnd(seed, k, 2) * .5);
    const p = [[cx + ca * l0 - sa * d, cy + sa * l0 + ca * d], [cx + ca * l1 - sa * d, cy + sa * l1 + ca * d]];
    pline(ap(m, rough(densify(p, 14, false), seed + k, 1.1)), w, seed + k * 7, false);
  }
  g.restore();
}
// period lettering cut into the key block, fitted inside (bx..bx+bw) with margin, measured
function ptext(str, cx, cy, bw, bh, seed = 3, maxSize = 62) {
  const g = PR.l; g.save(); g.fillStyle = COL.ink; g.textBaseline = 'alphabetic';
  const track = .08;
  const widthAt = (sz) => { g.font = `${sz}px ${FONT}`; let w = 0; for (const ch of str) w += g.measureText(ch).width + sz * track; return w - sz * track; };
  const margin = 34, avail = bw - margin * 2;
  let sz = Math.min(maxSize, bh * .62); const w0 = widthAt(sz); if (w0 > avail) sz *= avail / w0;
  const tw = widthAt(sz); g.font = `${sz}px ${FONT}`;
  let x = cx - tw / 2; const base = cy + sz * .34; let i = 0;
  for (const ch of str) {
    const cw = g.measureText(ch).width;
    g.save(); g.translate(x + cw / 2, base + (rnd(seed, i) - .5) * 2.4); g.rotate((rnd(seed, i, 2) - .5) * .07);
    g.fillText(ch, -cw / 2, 0); g.fillText(ch, -cw / 2 + .9, .4); g.restore();
    x += cw + sz * track; i++;
  }
  g.restore();
  return { size: sz, width: tw };
}

// ---------- light oak table: the board game look's plank algorithm (copied from js/boardgame/art.js buildTable) ----------
// 0.5 px per table unit; planks run along x, 680 units wide; one canvas covers x -3072..3072, y -2048..2048.
let OAK, OAKR;
function buildOak() {
  const R = mulberry(7), NS = 512, nd = new Float32Array(NS * NS);
  const grid = (n) => { const a = []; for (let i = 0; i < (n + 1) * (n + 1); i++) a.push(R()); return a; };
  const oct = [[8, .5], [32, .3], [128, .2]].map(([n, w]) => ({ n, w, a: grid(n) }));
  for (let y = 0; y < NS; y++) for (let x = 0; x < NS; x++) {
    let v = 0;
    for (const o of oct) {
      const fx = x / NS * o.n, fy = y / NS * o.n, ix = Math.floor(fx), iy = Math.floor(fy), ux = smooth(fx - ix), uy = smooth(fy - iy);
      const A = (i, j) => o.a[(j % o.n) * (o.n + 1) + (i % o.n)];
      v += o.w * lerp(lerp(A(ix, iy), A(ix + 1, iy), ux), lerp(A(ix, iy + 1), A(ix + 1, iy + 1), ux), uy);
    }
    nd[y * NS + x] = v;
  }
  const N = (x, y) => nd[(((y | 0) & 511) * 512 + ((x | 0) & 511))];
  const w = 3072, h = 2048, c = mkCanvas(w, h), g = c.getContext('2d'), id = g.createImageData(w, h), d = id.data;
  const plank = 340;
  for (let y = 0; y < h; y++) {
    const pi = Math.floor(y / plank), py = y - pi * plank, tone = rnd(pi, 4) * .16 - .08, off = rnd(pi, 5) * 3000;
    const seam = py < 2 ? .55 : py < 4 ? .85 : 1;
    for (let x = 0; x < w; x++) {
      const warp = N(x * .08 + off, y * .5 + pi * 37) * 26 + N(x * .015 + off, y * .03) * 60;
      const gr = Math.sin((py + warp) * .09 + Math.sin(x * .004 + pi) * 2.2);
      const fine = N(x * 1.3 + off, y * 4.1) - .5;
      let v = .78 + tone + gr * .06 + fine * .12 + (gr > .82 ? -.12 * (gr - .82) / .18 : 0);
      const pore = N(x * 2.7, y * 9.3 + pi * 11) > .83 ? -.08 : 0; v = (v + pore) * seam;
      const k = (y * w + x) * 4; d[k] = 196 * v + 18; d[k + 1] = 140 * v + 10; d[k + 2] = 82 * v + 4; d[k + 3] = 255;
    }
  }
  g.putImageData(id, 0, 0);
  OAK = c; OAKR = { x0: -3072, y0: -2048, w: 6144, h: 4096 };
}
