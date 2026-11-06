// The living loop, Mark's world: what the elves make and show (glyphs, sigils, solids, the funnel's inside, the
// console display) is drawn in Mark Von Ulrich's early colour Mac language, after the brief in
// references/mark-von-ulrich/STYLE-BRIEF.txt: saturated colour, one-pixel black contours, the fixed 256-colour
// system palette (here its 6x6x6 colour cube) and a 4x4 ordered dither. Each element is painted into a small
// offscreen raster at one output pixel per pixel, its alpha cut hard and its colour quantized through the cube with
// the dither anchored in the element's own raster, so the texture travels with it and never sparkles.
// It is a reconstruction of the look Robin asked for, not Mark's documented method.

import { surface } from '../vendor/paper-fox/core/canvas.js';
import { solidFaces } from './loop-shapes.js';

const TAU = Math.PI * 2;
export const MK = {
  magenta: '#ff00cc', pink: '#ff66cc', red: '#ff3300', orange: '#ff9900', yellow: '#ffff00', lime: '#99ff00',
  green: '#00cc66', cyan: '#00ffff', sky: '#3399ff', blue: '#3300ff', violet: '#9900ff', ink: '#000000', deep: '#000033', white: '#ffffff',
};
export const MK_RAMP = [MK.magenta, MK.cyan, MK.yellow, MK.lime, MK.orange, MK.violet, MK.sky, MK.pink];

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
// authored px per raster pixel: one output pixel at the 1280 px render
export const PS = 1.5;
const pool = new Map();
function buffer(w, h) {
  const k = `${w}x${h}`;
  if (!pool.has(k)) { const s = surface(w, h); s.ctx.willReadFrequently = true; pool.set(k, s); }
  return pool.get(k);
}

// Paint draw(g) (authored coordinates) into a raster around (cx, cy) of size w x h authored px, quantize it, and
// lay it onto ctx with nearest-neighbour sampling. alpha fades the finished raster.
export function markLayer(ctx, cx, cy, w, h, draw, { alpha = 1 } = {}) {
  if (alpha <= 0.01) return;
  const W = Math.max(2, Math.ceil(w / PS)), H = Math.max(2, Math.ceil(h / PS)), { canvas, ctx: g } = buffer(W, H);
  const x0 = cx - (W * PS) / 2, y0 = cy - (H * PS) / 2;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
  g.setTransform(1 / PS, 0, 0, 1 / PS, -x0 / PS, -y0 / PS);
  draw(g);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const img = g.getImageData(0, 0, W, H), d = img.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, a = d[i + 3];
    if (a < 110) { d[i + 3] = 0; continue; }
    const th = BAYER[(y & 3) * 4 + (x & 3)];
    // getImageData gives straight (not premultiplied) colour
    for (let c = 0; c < 3; c++) { const v = d[i + c] / 51; d[i + c] = Math.min(5, Math.floor(v + th)) * 51; }
    d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, x0, y0, W * PS, H * PS);
  ctx.restore();
}

// A solid in Mark's colours: each face its own saturated hue, lit faces toward white, unlit toward deep blue,
// a one-pixel black contour round every face.
export function paintMarkSolid(g, kind, x, y, r, ang, hue = 0) {
  const { V, faces } = solidFaces(kind, ang);
  faces.forEach((F, i) => {
    const base = MK_RAMP[(hue + i) % MK_RAMP.length];
    g.beginPath(); F.f.forEach((v, k) => { const px = x + V[v][0] * r, py = y + V[v][1] * r; k ? g.lineTo(px, py) : g.moveTo(px, py); }); g.closePath();
    const gr = g.createLinearGradient(x - r, y - r, x + r, y + r);
    gr.addColorStop(0, F.lit > 0 ? mixHex(base, '#ffffff', 0.25 + F.lit * 0.3) : base);
    gr.addColorStop(1, F.lit > 0 ? base : mixHex(base, MK.deep, 0.35 - F.lit * 0.3));
    g.fillStyle = gr; g.fill();
    g.strokeStyle = MK.ink; g.lineWidth = PS; g.lineJoin = 'miter'; g.stroke();
  });
}
export function markSolid(ctx, kind, x, y, r, ang, { hue = 0, alpha = 1 } = {}) {
  if (r < 0.5) return;
  markLayer(ctx, x, y, r * 2.6 + 6, r * 2.6 + 6, (g) => paintMarkSolid(g, kind, x, y, r, ang, hue), { alpha });
}

// A sawtooth starburst, Mark's way of staging a focal object: yellow points round a red-orange core.
export function paintBurst(g, x, y, r, n = 18, rot = 0) {
  for (const [k, col] of [[1, MK.yellow], [0.62, MK.orange]]) {
    g.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU, rr = r * k * (i % 2 ? 0.62 : 1); g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = MK.ink; g.lineWidth = PS; g.stroke();
  }
}

// Tiny glyphs for the sung stream: square, cross, zigzag, dot ring, triangle, eye. s is the glyph's size.
export function paintGlyph(g, kind, x, y, s, col, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = col; g.strokeStyle = MK.ink; g.lineWidth = PS; g.lineJoin = 'miter';
  const h = s / 2;
  g.beginPath();
  if (kind === 0) g.rect(-h * 0.8, -h * 0.8, h * 1.6, h * 1.6);
  else if (kind === 1) { g.rect(-h, -h * 0.3, h * 2, h * 0.6); g.rect(-h * 0.3, -h, h * 0.6, h * 2); }
  else if (kind === 2) { g.moveTo(-h, h * 0.4); for (let i = 1; i <= 4; i++) g.lineTo(-h + i * h / 2, i % 2 ? -h * 0.4 : h * 0.4); g.lineWidth = PS * 2.4; g.strokeStyle = col; g.stroke(); g.restore(); return; }
  else if (kind === 3) { g.arc(0, 0, h, 0, TAU); g.moveTo(h * 0.4, 0); g.arc(0, 0, h * 0.4, 0, TAU, true); }
  else if (kind === 4) { g.moveTo(0, -h); g.lineTo(h, h * 0.8); g.lineTo(-h, h * 0.8); g.closePath(); }
  else { g.ellipse(0, 0, h, h * 0.55, 0, 0, TAU); }
  g.fill('evenodd'); g.stroke();
  if (kind === 5) { g.fillStyle = MK.ink; g.beginPath(); g.arc(0, 0, h * 0.3, 0, TAU); g.fill(); }
  g.restore();
}

// Lines in Mark's manner: a black contour, a saturated body, a hot core.
export function paintLines(g, paths, width, col, core = MK.white) {
  g.lineCap = 'square'; g.lineJoin = 'miter';
  for (const [w, c] of [[width + PS * 2, MK.ink], [width, col], [Math.max(PS, width * 0.34), core]]) {
    g.strokeStyle = c; g.lineWidth = w;
    for (const p of paths) { g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
  }
}

export function mixHex(a, b, t) {
  const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)), A = h(a), B = h(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join('');
}
