// Shared drawing kit for the lobbyists machine: the rescue machine's pen, wax and shape helpers (bobwiseman-rescue-machine/js/ring.js),
// lifted out so the cast and the machine draw with the same hand. Classic script: these globals are shared by cast.js and machine.js.
'use strict';
const W = 1280, H = 720, TAU = Math.PI * 2;
const INK = '#2a2320', PAPER = '#f4ecdc', RED = '#cf3a2c', GILT = '#d9b463', TAN = '#c79d6a', OX = '#6b2328', LAMP = '#ffd36b', BALL = '#2f4f8f', GLASS = '#cfe0da', PENCIL = '#8d8478', GREY = '#a9a39a';
const SKIN = '#e9b98f', NAVY = '#3b3550', SNOW = '#fbf7ee', GREEN = '#7d9a5a';
let X = null, SEED = 1, T = 0, VIEW = null;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const pulse = (t, a, d = 0.35) => (t < a || t > a + d ? 0 : Math.sin(Math.PI * (t - a) / d));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const plen = (pts) => pts.slice(1).reduce((s, p, i) => s + dist(p, pts[i]), 0);
function along(pts, k) {
  let d = plen(pts) * clamp(k);
  for (let i = 1; i < pts.length; i++) { const l = dist(pts[i], pts[i - 1]); if (d <= l || i === pts.length - 1) { const f = l ? d / l : 0; return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; } d -= l; }
  return pts[0];
}

function rng(tag) { let h = 2166136261 ^ SEED; for (const c of String(tag)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return LLPen.makeRng(h >>> 0); }
function ink(pts, tag, { col = INK, w = 1.5, pen = 'ink', poly = false, a = 1 } = {}) {
  if (pts.length < 2) return;
  const r = LLPen.stroke(pts, pen, rng(tag), { width: w, wobble: 1.1, tier: 'lo', poly, round: 2 });
  X.save(); X.fillStyle = col;
  for (const l of r.layers) { X.globalAlpha = Math.min(1, l.op * a); X.fill(new Path2D(l.d), l.rule || 'nonzero'); }
  X.restore();
}
function crayon(path, col, tag, a = 1) { // scenery: flat wax a touch off the line, plus strokes across it
  X.save(); X.translate(2, 1.5); X.globalAlpha = a * 0.9; X.fillStyle = col; X.fill(path); X.clip(path);
  const r = rng(tag + 'c'); X.globalAlpha = 0.28; X.strokeStyle = '#000'; X.globalCompositeOperation = 'soft-light'; X.lineWidth = 3.5; X.beginPath();
  for (let k = -3400; k < 3400; k += 9) { const o = k + (r() - 0.5) * 4; X.moveTo(o - 700, -2400); X.lineTo(o + 700, 2400); }
  X.stroke(); X.restore();
}
function wax(path, col, tag) { // characters: opaque, so overlapping parts hide each other's outlines
  X.save(); X.fillStyle = col; X.fill(path); X.clip(path);
  const r = rng(tag + 'w'); X.globalAlpha = 0.22; X.strokeStyle = '#000'; X.globalCompositeOperation = 'soft-light'; X.lineWidth = 3; X.beginPath();
  for (let k = -3400; k < 3400; k += 8) { const o = k + (r() - 0.5) * 4; X.moveTo(o - 700, -2400); X.lineTo(o + 700, 2400); }
  X.stroke(); X.restore();
}
const circ = (cx, cy, rx, ry = rx, a0 = 0, a1 = TAU, n = 30) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
const box = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
const pathOf = (pts) => { const p = new Path2D(); pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); p.closePath(); return p; };
function shape(pts, fill, tag, w = 2) { if (fill) crayon(pathOf(pts), fill, tag); ink(pts, tag + 'o', { w, poly: true }); }
function blob(pts, fill, tag, w = 2) { if (fill) crayon(pathOf(pts), fill, tag); ink(pts, tag + 'o', { w }); }
function dot(x, y, r, col = INK) { X.fillStyle = col; X.beginPath(); X.arc(x, y, r, 0, TAU); X.fill(); }
function hatch(x, y, w, h, tag, sp = 11, a = 0.55) { X.save(); X.beginPath(); X.rect(x, y, w, h); X.clip(); const r = rng(tag); for (let k = -h; k < w; k += sp) ink([[x + k, y + h + 2], [x + k + h + r() * 3, y - 2]], tag + k, { w: 0.7, a, pen: 'ink.fine' }); X.restore(); }
function label(txt, x, y, size, col = INK, rot = 0, align = 'center') { X.save(); X.translate(x, y); X.rotate(rot); X.font = `${size}px KevinSans`; X.fillStyle = col; X.textAlign = align; X.textBaseline = 'middle'; X.fillText(txt, 0, 0); X.restore(); }
// a label shrunk to fit its box with margin (text-fits-container): returns the size used
function fitLabel(txt, x, y, maxW, size, col = INK, rot = 0) { X.save(); X.font = `${size}px KevinSans`; const w = X.measureText(txt).width; X.restore(); const s = w > maxW ? size * maxW / w : size; label(txt, x, y, s, col, rot); return s; }
const near = (x, y, r = 500) => !VIEW || (x > VIEW[0] - r && x < VIEW[2] + r && y > VIEW[1] - r && y < VIEW[3] + r);
function paper() {
  X.fillStyle = PAPER; X.fillRect(0, 0, W, H);
  const r = LLPen.makeRng(11); X.globalAlpha = 0.05; X.fillStyle = '#5a4a38';
  for (let i = 0; i < 2600; i++) X.fillRect(r() * W, r() * H, 1.4, 1.4);
  X.globalAlpha = 1;
}
// quadratic curve sampled: a bendy tube limb from a to b, bent sideways by `bend` (units, + = left of a->b)
function bend(a, b, k = 0, n = 10) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, d = dist(a, b) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d, c = [mx + nx * k, my + ny * k], o = [];
  for (let i = 0; i <= n; i++) { const s = i / n; o.push([(1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * c[0] + s * s * b[0], (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * c[1] + s * s * b[1]]); }
  return o;
}
