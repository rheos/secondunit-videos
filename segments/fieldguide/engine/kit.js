// cleanline kit: the drawing primitives. Every mark in a clean-line film is one of these on the W x H canvas X.
// Hand lines wobble with jit() off the shared stream R, so they boil between held drawings and hold within one.
// Looks (cleanline/looks/*.js) restyle the film by wrapping these (stroke, fillP, hatch ...) in their init();
// films call them by their plain names, so a wrapped primitive reaches every caller.
// Grounds (paper, stripes, schBG, schFrame ...) are not here: the look that owns them provides them.
'use strict';
const C = {}; // the palette. Each selected look merges its palette in; a film adds its own colours in film.config.js.
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

// ---------- stroking ----------
function stroke(col, w, a = 1) { X.strokeStyle = col; X.lineWidth = w * LW; X.globalAlpha = a; X.lineCap = 'round'; X.lineJoin = 'round'; X.stroke(); X.globalAlpha = 1; }
function fillP(p, col, a = 1) { X.globalAlpha = a; X.fillStyle = col; X.fill(p); X.globalAlpha = 1; }
// a wobbly straight line: n jittered segments
function wl(x1, y1, x2, y2, j = 1, n) {
  n = n || Math.max(2, Math.hypot(x2 - x1, y2 - y1) / 40 | 0);
  X.moveTo(x1 + jit(j), y1 + jit(j));
  for (let i = 1; i <= n; i++) { const t = i / n; X.lineTo(lerp(x1, x2, t) + jit(j), lerp(y1, y2, t) + jit(j)); }
}
// an ink line, doubled by default (a fainter second pass that misses the first a little)
function iline(x1, y1, x2, y2, col = C.ink, w = 2, a = 1, dbl = true, j = 1) {
  X.beginPath(); wl(x1, y1, x2, y2, j); stroke(col, w, a);
  if (dbl) { X.beginPath(); wl(x1, y1, x2, y2, j * 1.7); stroke(col, w * .5, a * .55); }
}
function wE(cx, cy, rx, ry, rot = 0, j = 1, n = 40, a0 = 0, a1 = TAU) {
  const c = Math.cos(rot), s = Math.sin(rot), closed = a1 - a0 >= TAU - 1e-3;
  const N = closed ? n : Math.max(4, n * (a1 - a0) / TAU | 0); let fx, fy;
  for (let i = 0; i <= N; i++) {
    const a = a0 + (a1 - a0) * i / N, k = 1 + jit(j / Math.max(4, Math.max(rx, ry)));
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k, px = cx + x * c - y * s, py = cy + x * s + y * c;
    if (i === 0) { X.moveTo(px, py); fx = px; fy = py; } else if (closed && i === N) X.lineTo(fx, fy); else X.lineTo(px, py);
  }
}
function iE(cx, cy, rx, ry, rot = 0, col = C.ink, w = 2, a = 1, dbl = true, j = 1, a0, a1) {
  X.beginPath(); wE(cx, cy, rx, ry, rot, j, 40, a0 ?? 0, a1 ?? TAU); stroke(col, w, a);
  if (dbl) { X.beginPath(); wE(cx + jit(1.6), cy + jit(1.6), rx, ry, rot, j * 1.4, 40, a0 ?? 0, a1 ?? TAU); stroke(col, w * .5, a * .5); }
}
function wP(pts, closed, j = 1) { pts.forEach((p, i) => { const x = p[0] + jit(j), y = p[1] + jit(j); i ? X.lineTo(x, y) : X.moveTo(x, y); }); if (closed) X.closePath(); }
function iP(pts, closed, col = C.ink, w = 2, a = 1, dbl = true, j = 1) {
  X.beginPath(); wP(pts, closed, j); stroke(col, w, a);
  if (dbl) { X.beginPath(); wP(pts, closed, j * 1.8); stroke(col, w * .5, a * .5); }
}
// densify a polyline so wobble reads as hand-drawn rather than as kinks at corners
function dens(pts, step = 30, closed = false) {
  const o = []; const P = closed ? pts.concat([pts[0]]) : pts;
  for (let i = 0; i < P.length - 1; i++) {
    const [x1, y1] = P[i], [x2, y2] = P[i + 1], n = Math.max(1, Math.hypot(x2 - x1, y2 - y1) / step | 0);
    for (let k = 0; k < n; k++) o.push([lerp(x1, x2, k / n), lerp(y1, y2, k / n)]);
  }
  if (!closed) o.push(P[P.length - 1]); return o;
}
function iBox(x, y, w, h, col = C.ink, lw = 2, a = 1, dbl = true) { iP(dens([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 40, true), true, col, lw, a, dbl); }

// ---------- shapes (Path2D, exact, used for fills and clips) ----------
const PE = (cx, cy, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(cx, cy, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU); return p; };
const PP = (pts) => { const p = new Path2D(); pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); p.closePath(); return p; };
const PR = (x, y, w, h) => { const p = new Path2D(); p.rect(x, y, w, h); return p; };
const hexPts = (cx, cy, r, rot = -Math.PI / 2) => { const a = []; for (let i = 0; i < 6; i++) { const t = rot + i * TAU / 6; a.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); } return a; };
function shifted(shape, dx, dy) { const q = new Path2D(); q.addPath(shape); q.addPath(shape, new DOMMatrix([1, 0, 0, 1, dx, dy])); return q; }

// Hatch inside a shape. cres=[dx,dy] keeps only the crescent the shape loses when shifted by (dx,dy):
// that is the shadow side, so hatching stays directional (no gradients).
function hatch(shape, cx, cy, rad, ang, sp, col = C.ink, w = 1, a = .75, cres, broken = 0) {
  X.save(); X.clip(shape);
  if (cres) X.clip(shifted(shape, cres[0], cres[1]), 'evenodd');
  const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca; X.beginPath();
  for (let k = -rad; k <= rad; k += sp) {
    const o = k + jit(sp * .22), px = cx + nx * o, py = cy + ny * o;
    const s0 = -rad + jit(rad * .08), s1 = rad + jit(rad * .08);
    if (broken && R() < broken) {
      const m = rnd(s0, s1); X.moveTo(px + ca * s0, py + sa * s0); X.lineTo(px + ca * (m - sp), py + sa * (m - sp)); X.moveTo(px + ca * (m + sp), py + sa * (m + sp));
    } else X.moveTo(px + ca * s0, py + sa * s0);
    X.lineTo(px + ca * s1 + jit(.8), py + sa * s1 + jit(.8));
  }
  stroke(col, w, a); X.restore();
}
// two-pass shading: hatch on the shadow crescent, cross-hatch on its core
function shade(shape, cx, cy, rad, cr, ang = .8, sp = 5, col = C.ink, a = .7) {
  hatch(shape, cx, cy, rad, ang, sp, col, 1, a, cr);
  hatch(shape, cx, cy, rad, ang + 1.25, sp * 1.35, col, .9, a * .75, [cr[0] * 1.9, cr[1] * 1.9]);
}
function stip(shape, cx, cy, rad, n, col, a = 1, sz = 1.6, dir = null, bias = 0) {
  X.save(); if (shape) X.clip(shape); X.fillStyle = col; X.globalAlpha = a;
  for (let i = 0; i < n; i++) {
    const t = R() * TAU, r = Math.sqrt(R()) * rad, x = cx + Math.cos(t) * r, y = cy + Math.sin(t) * r;
    if (dir) { const d = ((x - cx) * dir[0] + (y - cy) * dir[1]) / rad; if (R() > .5 + d * bias) continue; }
    const s = sz * (.5 + R()); X.fillRect(x - s / 2, y - s / 2, s, s);
  }
  X.restore(); X.globalAlpha = 1;
}
function stipRect(x, y, w, h, n, col, a = 1, sz = 1.6) { X.fillStyle = col; X.globalAlpha = a; for (let i = 0; i < n; i++) { const s = sz * (.5 + R()); X.fillRect(x + R() * w, y + R() * h, s, s); } X.globalAlpha = 1; }

// ---------- grounds: shared pieces (the grounds themselves come from looks) ----------
// groundTint(c) runs on every ground colour a look paints. Identity here; a film replaces it to shift its grounds
// over time (a colour arc across acts), so figures and ink keep their colours while the paper changes.
function groundTint(c) { return c; }
const hexRGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgbHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function paperOnly(c) { X.fillStyle = c; X.fillRect(-W, -H, 3 * W, 3 * H); }
// construction lines and circles that run past the forms
function consL(lines, a = .17, col = C.ink) { X.beginPath(); for (const [x1, y1, x2, y2] of lines) wl(x1, y1, x2, y2, .7); stroke(col, 1, a); }
function consC(circles, a = .15, col = C.ink) { for (const [x, y, r] of circles) iE(x, y, r, r, 0, col, 1, a, false, .8); }

// ---------- crisp marks: guides, ticks, labels, brackets (used by schematic looks, and labels everywhere) ----------
function gl(x1, y1, x2, y2, col, a = .3, w = 1, dash) { X.beginPath(); X.moveTo(x1, y1); X.lineTo(x2, y2); if (dash) X.setLineDash(dash); stroke(col, w, a); X.setLineDash([]); }
function gc(x, y, r, col, a = .3, w = 1, dash, a0 = 0, a1 = TAU) { if (r <= 0) return; X.beginPath(); X.arc(x, y, r, a0, a1); if (dash) X.setLineDash(dash); stroke(col, w, a); X.setLineDash([]); }
function ticks(x, y, r, n, len, col, a = .6, w = 1, major = 0, a0 = 0, a1 = TAU) {
  const full = Math.abs(a1 - a0 - TAU) < 1e-6; X.beginPath();
  for (let i = 0; i < (full ? n : n + 1); i++) {
    const t = a0 + (a1 - a0) * i / n, L = major && i % major === 0 ? len * 2 : len;
    X.moveTo(x + Math.cos(t) * r, y + Math.sin(t) * r); X.lineTo(x + Math.cos(t) * (r + L), y + Math.sin(t) * (r + L));
  }
  stroke(col, w, a);
}
function lab(x, y, t, col, a = 1, sz = 15, al = 'left', bl = 'alphabetic', wt = '') {
  X.font = `${wt} ${sz}px ${MONO}`; try { X.letterSpacing = (sz * .16).toFixed(1) + 'px'; } catch (e) {}
  X.textAlign = al; X.textBaseline = bl; X.globalAlpha = a; X.fillStyle = col; X.fillText(t, x, y); X.globalAlpha = 1;
  try { X.letterSpacing = '0px'; } catch (e) {}
}
function bracket(x1, y1, x2, y2, col, a = .8, txt, off = 0) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L; X.beginPath(); X.moveTo(x1, y1); X.lineTo(x2, y2);
  for (const [px, py] of [[x1, y1], [x2, y2]]) { X.moveTo(px - nx * 10, py - ny * 10); X.lineTo(px + nx * 10, py + ny * 10); }
  const n = Math.max(2, L / 12 | 0); for (let i = 1; i < n; i++) { const t = i / n; X.moveTo(x1 + dx * t, y1 + dy * t); X.lineTo(x1 + dx * t + nx * (i % 5 ? 4 : 8), y1 + dy * t + ny * (i % 5 ? 4 : 8)); }
  stroke(col, 1, a);
  if (txt) { X.save(); X.translate((x1 + x2) / 2 + nx * (22 + off), (y1 + y2) / 2 + ny * (22 + off)); let ang = Math.atan2(dy, dx); if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI; X.rotate(ang); lab(0, 0, txt, col, a, 13, 'center', 'middle'); X.restore(); }
}
// a glowing nucleus with radial ticks
function star(x, y, r, col = C.white, a = 1) {
  X.save(); X.globalCompositeOperation = 'lighter';
  const g = X.createRadialGradient(x, y, 0, x, y, r * 5); g.addColorStop(0, col); g.addColorStop(.12, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  X.globalAlpha = a * .5; X.fillStyle = g; X.beginPath(); X.arc(x, y, r * 5, 0, TAU); X.fill(); X.restore();
  X.globalAlpha = a; X.fillStyle = col; X.beginPath(); X.arc(x, y, r * .6, 0, TAU); X.fill(); X.globalAlpha = 1;
  X.beginPath(); for (let i = 0; i < 4; i++) { const t = i * TAU / 4; X.moveTo(x + Math.cos(t) * r * .9, y + Math.sin(t) * r * .9); X.lineTo(x + Math.cos(t) * r * 3.4, y + Math.sin(t) * r * 3.4); }
  stroke(col, 1, a * .9); ticks(x, y, r * 2, 24, r * .5, col, a * .7, 1);
}
function hexGrid(cx, cy, r, rings, fn) {
  for (let q = -rings; q <= rings; q++) for (let s = Math.max(-rings, -q - rings); s <= Math.min(rings, -q + rings); s++) {
    fn(cx + r * Math.sqrt(3) * (q + s / 2), cy + r * 1.5 * s, q, s, Math.max(Math.abs(q), Math.abs(s), Math.abs(-q - s)));
  }
}
function lattice(cx, cy, r, rings, col, a, w = 1) {
  X.beginPath(); hexGrid(cx, cy, r, rings, (x, y) => { hexPts(x, y, r * .97).forEach((p, i) => (i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]))); X.closePath(); }); stroke(col, w, a);
}
function graticule(cx, cy, w, h, step, col, a, wd = 1) { X.beginPath(); for (let x = cx - w / 2; x <= cx + w / 2 + .1; x += step) { X.moveTo(x, cy - h / 2); X.lineTo(x, cy + h / 2); } for (let y = cy - h / 2; y <= cy + h / 2 + .1; y += step) { X.moveTo(cx - w / 2, y); X.lineTo(cx + w / 2, y); } stroke(col, wd, a); }

// ---------- camera and curves ----------
let CAMO = null; // per-cut framing override {fx, fy, fz}: re-frames any set-up without touching it
function cam(cx, cy, z, rot = 0) { if (CAMO) { if (CAMO.fx !== undefined) cx = CAMO.fx; if (CAMO.fy !== undefined) cy = CAMO.fy; if (CAMO.fz !== undefined) z *= CAMO.fz; } X.translate(W / 2, H / 2); X.scale(z, z); X.rotate(rot); X.translate(-cx, -cy); }
function screen() { X.setTransform(1, 0, 0, 1, 0, 0); }
function bz(a, b, c, d, t) { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; }
function bzPts(a, b, c, d, t0, t1, n = 60) { const o = []; for (let i = 0; i <= n; i++) o.push(bz(a, b, c, d, lerp(t0, t1, i / n))); return o; }
function path(pts, col, w, a, dash) { X.beginPath(); pts.forEach((q, i) => (i ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1]))); if (dash) X.setLineDash(dash); stroke(col, w, a); X.setLineDash([]); }

// ---------- grain (precomputed, cycled every frame so held drawings still breathe) ----------
// tone 'paper' = warm specks and fibres for light grounds; 'dark' = pale specks for navy/black grounds.
function grainCanvas(seed, light) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const r = M32(seed);
  const cols = light ? ['rgba(220,225,255,.08)', 'rgba(220,225,255,.16)', 'rgba(170,180,255,.06)'] : ['rgba(70,45,20,.09)', 'rgba(70,45,20,.18)', 'rgba(120,90,50,.08)', 'rgba(255,250,235,.22)'];
  for (const col of cols) { g.fillStyle = col; for (let i = 0; i < 16000; i++) { const s = r() * 1.8 + .4; g.fillRect(r() * W, r() * H, s, s); } }
  g.strokeStyle = light ? 'rgba(200,210,255,.05)' : 'rgba(90,60,30,.07)'; g.lineWidth = .7; g.beginPath();
  for (let i = 0; i < 1200; i++) { const x = r() * W, y = r() * H, a = r() * TAU, l = 4 + r() * 16; g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); }
  g.stroke(); return c;
}
