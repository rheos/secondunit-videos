// Board game look: shared math, seeded noise, and the "print shop" that builds every printed texture
// (board, box lid, cards, money, standees) as separate spot-colour plates with halftone tints,
// misregistration, ink voids and wear. Everything is built once at init from seeded randomness.
const W = 1920, H = 1080, TAU = Math.PI * 2, DEG = Math.PI / 180;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = (t, a, b) => smooth((t - a) / (b - a));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = (x) => Math.pow(clamp(x), 2);
function rnd(a, b = 0, c = 0) { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + 0.37) * 43758.5453; return x - Math.floor(x); }
function n1(seed, x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(rnd(seed, i), rnd(seed, i + 1), u) * 2 - 1; }
function prng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function mkCanvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = Math.round(w); c.height = Math.round(h); return c; }

// period spot inks (slightly off, as printed on cream board)
const INK = {
  red: '#c3372b', blue: '#22599f', yellow: '#efbd2c', green: '#2c8546', black: '#221d1a',
  pink: '#de7f8e', orange: '#e57f2c', sky: '#79aed6', cream: '#efe3c4', gold: '#c99a2e', grey: '#8d8a82',
};
const FONT = { slab: 'Rockwell', clar: 'Superclarendon', cond: 'DIN Condensed', copper: 'Copperplate', phos: 'Phosphate', fut: 'Futura' };

// ---------- shared noise canvases ----------
let NOISE, SPECK;
function buildNoise() {
  const r = prng(7);
  NOISE = mkCanvas(512, 512); const g = NOISE.getContext('2d'); const id = g.createImageData(512, 512);
  // value noise, 3 octaves
  const grid = (n) => { const a = []; for (let i = 0; i < (n + 1) * (n + 1); i++) a.push(r()); return a; };
  const oct = [[8, .5], [32, .3], [128, .2]].map(([n, w]) => ({ n, w, a: grid(n) }));
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    let v = 0;
    for (const o of oct) {
      const fx = x / 512 * o.n, fy = y / 512 * o.n, ix = Math.floor(fx), iy = Math.floor(fy), ux = smooth(fx - ix), uy = smooth(fy - iy);
      const A = (i, j) => o.a[(j % o.n) * (o.n + 1) + (i % o.n)];
      v += o.w * lerp(lerp(A(ix, iy), A(ix + 1, iy), ux), lerp(A(ix, iy + 1), A(ix + 1, iy + 1), ux), uy);
    }
    const k = (y * 512 + x) * 4; id.data[k] = id.data[k + 1] = id.data[k + 2] = v * 255; id.data[k + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  // ink voids: tiny white specks on transparent
  SPECK = mkCanvas(512, 512); const s = SPECK.getContext('2d');
  for (let i = 0; i < 2600; i++) {
    const big = r() < .06; s.fillStyle = `rgba(0,0,0,${.35 + r() * .65})`;
    s.beginPath(); s.ellipse(r() * 512, r() * 512, big ? 1.5 + r() * 3 : .5 + r() * 1.1, big ? 1 + r() * 2 : .4 + r() * .9, r() * 3, 0, TAU); s.fill();
  }
}

// halftone dot screen as a pattern. cov 0..1 ink coverage, pitch in px, angle in degrees
const HT = {};
function ht(g, cov, pitch = 7, angle = 45) {
  const key = cov.toFixed(2) + '|' + pitch + '|' + angle;
  let p = HT[key + g.canvas.width];
  const tile = mkCanvas(pitch, pitch), tg = tile.getContext('2d');
  tg.fillStyle = '#000';
  const rad = Math.sqrt(cov / Math.PI) * pitch;
  for (const [cx, cy] of [[0, 0], [pitch, 0], [0, pitch], [pitch, pitch], [pitch / 2, pitch / 2]]) {
    const rr = (cx === pitch / 2) ? rad : rad; tg.beginPath(); tg.arc(cx, cy, rr * (cx === pitch / 2 ? 1 : 1), 0, TAU); tg.fill();
  }
  // a pitch x pitch tile with dots at corners and centre: effective screen pitch/sqrt2 rotated 45 already
  p = g.createPattern(tile, 'repeat'); p.setTransform(new DOMMatrix().rotate(angle - 45));
  return p;
}

// fit text in a box: returns font size (px) so the measured width <= maxW and cap height <= maxH
function fitFont(g, text, family, weight, maxW, maxH, maxSize = 400) {
  let s = Math.min(maxSize, maxH / .72);
  for (let i = 0; i < 40; i++) {
    g.font = `${weight} ${s}px "${family}"`;
    const m = g.measureText(text); const w = m.width; const hh = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || s * .72;
    if (w <= maxW && hh <= maxH) break; s *= .95;
  }
  g.font = `${weight} ${s}px "${family}"`; return s;
}
// draw centred text fitted in the box (x,y centre). returns the measured box for checks
const FITLOG = [];
function fitText(g, text, cx, cy, maxW, maxH, family = FONT.slab, weight = 'bold', o = {}) {
  const s = fitFont(g, text, family, weight, maxW, maxH, o.maxSize);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const m = g.measureText(text); const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
  const y = cy + (asc - desc) / 2;
  if (o.stroke) { g.lineWidth = o.stroke; g.lineJoin = 'round'; g.strokeText(text, cx, y); } else g.fillText(text, cx, y);
  FITLOG.push({ text, w: m.width, maxW, h: asc + desc, maxH, ok: m.width <= maxW + .5 && asc + desc <= maxH + .5 });
  return { w: m.width, h: asc + desc, s };
}

// ---------- print shop ----------
// paper: base colour; inks: [{name, color, off:[dx,dy]}]; art(g, inkName, w, h) draws coverage for that ink
// o.wear: edge wear width in px, o.grain: paper grain strength, o.alpha: draw art for a cut-out (alpha mask fn)
function printSheet(w, h, paper, inks, art, o = {}) {
  const r = prng(o.seed ?? 11);
  const base = mkCanvas(w, h), g = base.getContext('2d');
  g.fillStyle = paper; g.fillRect(0, 0, w, h);
  // paper mottling + fibres
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = o.grain ?? .22;
  g.drawImage(NOISE, r() * 200, r() * 200, 300, 300, 0, 0, w, h);
  g.globalAlpha = (o.grain ?? .22) * .7;
  for (let x = 0; x < w; x += 512) for (let y = 0; y < h; y += 512) g.drawImage(NOISE, x, y, 512, 512);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const plate = mkCanvas(w, h), pg = plate.getContext('2d');
  for (const ink of inks) {
    pg.globalCompositeOperation = 'source-over'; pg.globalAlpha = 1; pg.setTransform(1, 0, 0, 1, 0, 0); pg.clearRect(0, 0, w, h);
    pg.fillStyle = '#000'; pg.strokeStyle = '#000';
    art(pg, ink.name, w, h);
    pg.setTransform(1, 0, 0, 1, 0, 0); pg.globalAlpha = 1;
    pg.globalCompositeOperation = 'source-in'; pg.fillStyle = ink.color; pg.fillRect(0, 0, w, h);
    // ink voids and uneven inking
    pg.globalCompositeOperation = 'destination-out';
    const sc = o.speckScale ?? 1;
    pg.globalAlpha = .55; for (let x = -r() * 512 * sc; x < w; x += 512 * sc) for (let y = -r() * 512 * sc; y < h; y += 512 * sc) pg.drawImage(SPECK, x, y, 512 * sc, 512 * sc);
    pg.globalAlpha = .16; pg.drawImage(NOISE, r() * 300, r() * 300, 200, 200, 0, 0, w, h);
    pg.globalAlpha = 1;
    g.globalCompositeOperation = 'multiply';
    const off = ink.off || [0, 0];
    g.drawImage(plate, off[0], off[1]);
  }
  g.globalCompositeOperation = 'source-over';
  if (o.wear) wearEdges(g, w, h, o.wear, o.seed ?? 11);
  if (o.scuffs) scuffs(g, w, h, o.scuffs, o.seed ?? 11);
  return base;
}
// worn corners/edges: paper fibre showing through (lighter, a bit grey)
function wearEdges(g, w, h, ew, seed) {
  const m = mkCanvas(w, h), mg = m.getContext('2d'); const id = mg.createImageData(w, h); const d = id.data;
  const nd = NOISE.getContext('2d').getImageData(0, 0, 512, 512).data;
  const ox = Math.floor(rnd(seed, 1) * 512), oy = Math.floor(rnd(seed, 2) * 512), band = Math.ceil(ew * 2.6), cr = ew * 2.5;
  const px = (x, y) => {
    const dx = Math.min(x, w - 1 - x), dy = Math.min(y, h - 1 - y), dd = Math.min(dx, dy);
    const n = nd[(((y * 3 + oy) & 511) * 512 + ((x * 3 + ox) & 511)) * 4] / 255;
    const n2 = nd[(((y + oy * 2) & 511) * 512 + ((x + ox) & 511)) * 4] / 255;
    const cor = Math.hypot(Math.max(0, cr - dx), Math.max(0, cr - dy)) / cr;
    let a = (1 - dd / ew) * .9 + (n - .5) * 1.3 + (n2 - .5) * .6 + (dx < cr && dy < cr ? cor * .55 : 0) - .25;
    a = clamp(a * 1.6); if (a <= 0) return;
    const k = (y * w + x) * 4; d[k] = 236; d[k + 1] = 228; d[k + 2] = 210; d[k + 3] = a * 235;
  };
  for (let y = 0; y < h; y++) {
    if (y < band || y >= h - band) { for (let x = 0; x < w; x++) px(x, y); }
    else { for (let x = 0; x < band; x++) px(x, y); for (let x = w - band; x < w; x++) px(x, y); }
  }
  mg.putImageData(id, 0, 0);
  g.drawImage(m, 0, 0);
}
function scuffs(g, w, h, n, seed) {
  const r = prng(seed * 3 + 1);
  g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, l = 6 + r() * 40, an = r() * TAU;
    g.strokeStyle = r() < .6 ? `rgba(245,238,222,${.2 + r() * .35})` : `rgba(60,45,30,${.06 + r() * .1})`;
    g.lineWidth = .6 + r() * 2.2;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(an) * l * .5 + r() * 6, y + Math.sin(an) * l * .5, x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke();
  }
  g.restore();
}
// cut a printed sheet to a shape (for standees): mask drawn by fn(g) in any colour
function cutOut(tex, fn) {
  const c = mkCanvas(tex.width, tex.height), g = c.getContext('2d');
  fn(g); g.globalCompositeOperation = 'source-in'; g.drawImage(tex, 0, 0); return c;
}
function silhouette(tex, blur = 0) {
  const c = mkCanvas(tex.width, tex.height), g = c.getContext('2d');
  if (blur) g.filter = `blur(${blur}px)`;
  g.drawImage(tex, 0, 0); g.filter = 'none';
  g.globalCompositeOperation = 'source-in'; g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height); return c;
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
