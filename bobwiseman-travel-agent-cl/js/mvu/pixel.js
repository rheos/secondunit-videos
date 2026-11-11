// The world behind the glass (Mark Von Ulrich as guest art director, MVU-DIRECTION.md).
// Draft 7 (Robin 2026-10-13): NOT chunky 8-bit blocks. His pictures were illustrations made the way an early colour
// Mac made them ("more like it was drawn in old 1989 MacPaint than in ASCII"): ~72-dpi stepped edges, the 216-colour
// system cube with ordered-dither tones and gradients, 1-px outlines, pattern fills. So each world is drawn at the
// size it is SHOWN (about 2.5 screen px per pixel), then snapped to the colour cube through a 4x4 Bayer dither
// (stable from frame to frame, unlike diffusion dither, which would shimmer in animation), and scaled up with
// nearest-neighbour. Callers keep their small coordinate systems; blitPix decides the real resolution.
// Used ONLY inside device screens; schematics are never pixelated. No piece of his is reproduced.
'use strict';
const PXPAL = [
  ['k', '#241d52'], ['b', '#2f45c4'], ['n', '#1d2a78'], ['c', '#33bfe0'], ['r', '#de3a32'], ['y', '#ffd23a'],
  ['o', '#ff8a2a'], ['g', '#4cbf48'], ['m', '#e04a9a'], ['w', '#f8f4e6'], ['p', '#ffa4ae'], ['u', '#8f553a'],
  ['t', '#2a9a92'], ['f', '#ffe48a'],
];
const PX = Object.fromEntries(PXPAL);
const PXCACHE = {}; let PXK = 1;           // PXK: device pixels per caller unit while a world is being drawn
const PX_SCREEN = 2.5;                       // target screen px per world pixel (the 72-dpi feel at 1080p)
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
// A world is drawn lazily, at the resolution blitPix finds it will be shown at.
function pixWorld(key, w, h, drawFn) { return { px: true, key, w, h, drawFn }; }
function pxRender(o, k) {
  const W2 = Math.max(1, Math.round(o.w * k)), H2 = Math.max(1, Math.round(o.h * k)), id0 = o.key + W2 + 'x' + H2;
  let c = PXCACHE[id0]; if (!c) { c = PXCACHE[id0] = document.createElement('canvas'); c.width = W2; c.height = H2; }
  const g = c.getContext('2d', { willReadFrequently: true }); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W2, H2);
  g.globalAlpha = 1; g.lineCap = 'butt'; g.lineJoin = 'miter'; g.scale(W2 / o.w, H2 / o.h); PXK = W2 / o.w;
  o.drawFn(g, o.w, o.h); PXK = 1;
  const im = g.getImageData(0, 0, W2, H2), d = im.data;
  for (let y = 0, i = 0; y < H2; y++) for (let x = 0; x < W2; x++, i += 4) {
    if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
    const t = (BAYER4[(y & 3) * 4 + (x & 3)] + .5) / 16 - .5;          // -0.47 .. 0.47 of one cube step
    for (let ch = 0; ch < 3; ch++) d[i + ch] = Math.max(0, Math.min(5, Math.round(d[i + ch] / 51 + t))) * 51;
    d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); return c;
}
function blitPix(o, x, y, w, h) {
  X.save(); X.imageSmoothingEnabled = false;
  if (o && o.px) {
    const m = X.getTransform(), sx = Math.hypot(m.a, m.b) || 1, onScreen = w * sx;
    const k = Math.max(1, Math.min(onScreen / (o.w * PX_SCREEN), 1150 / o.w));
    X.drawImage(pxRender(o, k), x, y, w, h);
  } else X.drawImage(o, x, y, w, h);
  X.restore();
}
const pxStep = (T, fps = 8) => Math.floor(T * fps + 1e-6); // stepped motion, like hinged cut-outs
const pxInk = (col) => { const v = [1, 3, 5].map((i) => parseInt(col.slice(i, i + 2), 16) * .42); return 'rgb(' + v.map(Math.round).join(',') + ')'; };

// ---------- low-res drawing helpers (g = low-res context) ----------
function pR(g, x, y, w, h, col, o) {
  // a whole-screen backdrop in the dark ink becomes a dithered indigo gradient (his painted grounds), never flat black
  if (col === PX.k && x <= 0 && y <= 0 && w * PXK >= g.canvas.width * .98 && h * PXK >= g.canvas.height * .98) { pGrad(g, (q) => q.rect(x, y, w, h), 0, y, w * .25, y + h, '#2a2470', '#43489e'); return; }
  g.fillStyle = col; g.fillRect(x, y, w, h); if (o !== false && w * PXK > 6 && h * PXK > 6) { g.strokeStyle = pxInk(col); g.lineWidth = 1 / PXK; g.strokeRect(x + .5 / PXK, y + .5 / PXK, w - 1 / PXK, h - 1 / PXK); } }
function pP(g, pts, col, o) { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); if (o !== false) { g.strokeStyle = pxInk(col); g.lineWidth = 1 / PXK; g.stroke(); } }
function pC(g, x, y, r, col, o) { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(.6, r), 0, TAU); g.fill(); if (o !== false && r * PXK > 3) { g.strokeStyle = pxInk(col); g.lineWidth = 1 / PXK; g.stroke(); } }
function pL(g, pts, col, lw = 1) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
function pBurst(g, cx, cy, r0, r1, n, rot, c1, c2) {
  for (let i = 0; i < n; i++) { const a0 = rot + i / n * TAU, a1 = rot + (i + .5) / n * TAU, a2 = rot + (i + 1) / n * TAU;
    pP(g, [[cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0], [cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1], [cx + Math.cos(a2) * r0, cy + Math.sin(a2) * r0]], i % 2 ? c2 : c1); }
  pC(g, cx, cy, r0 + .5, c1);
}
function pZig(g, x, y, w, amp, per, col, lw = 1, ph = 0) { const pts = []; for (let k = 0; k <= w / per * 2 + 1; k++) pts.push([x + k * per / 2 - (ph % per), y + (k % 2 ? amp : -amp)]); pL(g, pts, col, lw); }
function pDots(g, x, y, w, h, step, col, off = 0) { g.fillStyle = col; const d = Math.max(1 / PXK, .5); for (let yy = y; yy < y + h; yy += step) for (let xx = x + ((yy / step) % 2 ? off : 0); xx < x + w; xx += step) g.fillRect(xx, yy, d, d); }
function pRings(g, cx, cy, rs, cols) { rs.forEach((r, i) => pC(g, cx, cy, r, cols[i % cols.length])); }
function pText(g, x, y, t, col, sz = 7) { g.fillStyle = col; g.font = `bold ${sz}px ${MONO}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, x, y); }

// ---------- the agent, as she is behind the glass: a frontal emblem ----------
// Bun + pencil and cat-eye glasses keep her identity; headset, stamp and ticket make her the operator.
function pxAgent(g, cx, cy, s, T, o = {}) {
  const st = pxStep(T), up = st % 4 < 2;
  if (o.burst !== false) pBurst(g, cx, cy - 38 * s, 26 * s, 58 * s, 18, st * .09, PX.y, PX.o);
  pL(g, [[cx - 22 * s, cy - 40 * s], [cx - 22 * s, cy - 66 * s], [cx + 22 * s, cy - 66 * s], [cx + 22 * s, cy - 40 * s]], PX.b, 3 * s);
  pR(g, cx - 26 * s, cy - 46 * s, 6 * s, 12 * s, PX.b); pR(g, cx + 20 * s, cy - 46 * s, 6 * s, 12 * s, PX.b);
  pC(g, cx, cy - 66 * s, 9 * s, PX.r); pL(g, [[cx - 12 * s, cy - 74 * s], [cx + 10 * s, cy - 58 * s]], PX.y, 2 * s);
  pGrad(g, (q) => q.rect(cx - 16 * s, cy - 58 * s, 32 * s, 38 * s), 0, cy - 58 * s, 0, cy - 20 * s, '#ffe48a', '#f2a24a'); g.strokeStyle = pxInk('#f2a24a'); g.lineWidth = 1 / PXK; g.strokeRect(cx - 16 * s, cy - 58 * s, 32 * s, 38 * s); pR(g, cx - 16 * s, cy - 58 * s, 32 * s, 7 * s, PX.r);
  for (const sx of [-1, 1]) { const ex = cx + sx * 8 * s, ey = cy - 42 * s; pC(g, ex, ey, 6.5 * s, PX.k); pC(g, ex, ey, 5 * s, PX.w); pC(g, ex + (st % 6 === 0 ? 0 : sx), ey, 2.2 * s, PX.b); pP(g, [[ex + sx * 5 * s, ey - 5 * s], [ex + sx * 10 * s, ey - 9 * s], [ex + sx * 7 * s, ey - 3 * s]], PX.k); }
  const talk = o.talk ? (st % 2 ? 4 : 1) : 2; pR(g, cx - 6 * s, cy - 31 * s, 12 * s, (2 + talk) * s, PX.r); pR(g, cx - 5 * s, cy - 31 * s, 10 * s, 1 * s, PX.w);
  pL(g, [[cx + 22 * s, cy - 40 * s], [cx + 14 * s, cy - 30 * s], [cx + 7 * s, cy - 29 * s]], PX.k, 1.2 * s); pC(g, cx + 7 * s, cy - 29 * s, 1.6 * s, PX.m);
  pR(g, cx - 4 * s, cy - 20 * s, 8 * s, 4 * s, PX.f);
  pP(g, [[cx - 22 * s, cy - 16 * s], [cx + 22 * s, cy - 16 * s], [cx + 30 * s, cy + 22 * s], [cx - 30 * s, cy + 22 * s]], PX.r);
  pZig(g, cx - 20 * s, cy - 10 * s, 40 * s, 2 * s, 5 * s, PX.y, 1.4 * s); pDots(g, cx - 24 * s, cy - 2 * s, 48 * s, 22 * s, 3, PX.m);
  const ay = up ? -30 : -12;
  pL(g, [[cx - 22 * s, cy - 12 * s], [cx - 40 * s, cy - 12 * s], [cx - 40 * s, cy + ay * s]], PX.p, 5 * s); pR(g, cx - 47 * s, cy + (ay - 10) * s, 14 * s, 9 * s, PX.u); pR(g, cx - 44 * s, cy + (ay - 16) * s, 8 * s, 7 * s, PX.u);
  pL(g, [[cx + 22 * s, cy - 12 * s], [cx + 40 * s, cy - 12 * s], [cx + 40 * s, cy + (up ? -12 : -30) * s]], PX.p, 5 * s); pR(g, cx + 33 * s, cy + ((up ? -12 : -30) - 12) * s, 22 * s, 12 * s, PX.w); pR(g, cx + 33 * s, cy + ((up ? -12 : -30) - 12) * s, 22 * s, 3 * s, PX.r);
  if (o.desk !== false) { pR(g, cx - 52 * s, cy + 18 * s, 104 * s, 28 * s, PX.b); pZig(g, cx - 50 * s, cy + 26 * s, 100 * s, 2 * s, 6 * s, PX.c, 1.2 * s, st); pR(g, cx - 18 * s, cy + 32 * s, 36 * s, 9 * s, PX.w); pText(g, cx, cy + 36.5 * s, 'TRAVEL', PX.k, Math.max(4, 5.5 * s)); }
}
// ---------- the traveller, as he becomes behind the glass ----------
function pxTraveller(g, x, y, s, T, o = {}) {
  const st = pxStep(T), a = o.walk ? (st % 2 ? 4 : -4) : 0;
  pR(g, x - 6 * s + a * s, y - 18 * s, 4 * s, 18 * s, PX.k); pR(g, x + 2 * s - a * s, y - 18 * s, 4 * s, 18 * s, PX.k);
  pP(g, [[x - 9 * s, y - 46 * s], [x + 9 * s, y - 46 * s], [x + 12 * s, y - 16 * s], [x - 12 * s, y - 16 * s]], PX.t);
  pL(g, [[x, y - 46 * s], [x, y - 16 * s]], PX.n, 1); pR(g, x - 6 * s, y - 60 * s, 12 * s, 14 * s, PX.f);
  pC(g, x - 2.5 * s, y - 54 * s, 1 * s, PX.k); pC(g, x + 2.5 * s, y - 54 * s, 1 * s, PX.k);
  pR(g, x - 11 * s, y - 62 * s, 22 * s, 3 * s, PX.k); pR(g, x - 6 * s, y - 70 * s, 12 * s, 8 * s, PX.k); pR(g, x - 6 * s, y - 64 * s, 12 * s, 1.5 * s, PX.o);
  if (o.case !== false) { pR(g, x + 10 * s, y - 20 * s, 12 * s, 9 * s, PX.u); pR(g, x + 13 * s, y - 22 * s, 6 * s, 2 * s, PX.k); }
  if (o.cloud !== false) { for (const [dx, r] of [[-6, 5], [0, 7], [7, 5]]) pC(g, x + dx * s, y - 84 * s, r * s, PX.b); for (let i = 0; i < 4; i++) pR(g, x + (-6 + i * 4) * s, y - 78 * s + ((st + i) % 3) * 3 * s, 1, 3 * s, PX.c); }
}
// ---------- the beach on the far side of the cinema screen ----------
function pxBeach(g, w, h, T, o = {}) {
  const st = pxStep(T);
  pGrad(g, (q) => q.rect(0, 0, w, h * .6), 0, 0, 0, h * .58, '#232060', '#b04a86'); pDots(g, 1, 1, w, h * .5, 4, PX.c, 2);
  const sx = w * .74, sy = h * .3; pBurst(g, sx, sy, h * .17, h * .3, 22, st * .07, PX.y, PX.o); pRings(g, sx, sy, [h * .16, h * .12, h * .08, h * .04], [PX.r, PX.o, PX.y, PX.w]);
  for (let i = 0; i < 5; i++) { const yy = h * (.56 + i * .035); pR(g, 0, yy, w, h * .036, i % 2 ? PX.b : PX.n); pZig(g, 0, yy + 1, w, 1.2, 6 + i, i % 2 ? PX.c : PX.b, 1, st * (i + 1)); }
  pR(g, 0, h * .74, w, h * .26, PX.y); pDots(g, 0, h * .76, w, h * .24, 3, PX.o, 1);
  const px = w * .16, py = h * .76; for (let i = 0; i < 7; i++) pR(g, px + (i % 2), py - (i + 1) * h * .06, 4, h * .06 - 1, i % 2 ? PX.u : PX.o);
  for (let i = 0; i < 6; i++) { const an = -Math.PI * .9 + i * .38, L = h * .18; pL(g, [[px + 2, py - h * .42], [px + 2 + Math.cos(an) * L * .5, py - h * .42 + Math.sin(an) * L * .5 - 2], [px + 2 + Math.cos(an) * L, py - h * .42 + Math.sin(an) * L + 3]], PX.g, 2.4); }
  for (let i = 0; i < 4; i++) { const gx = (w * (.3 + i * .12) + st * (1 + i * .3)) % w, gy = h * (.12 + (i % 2) * .08); pL(g, [[gx - 3, gy - 2], [gx, gy], [gx + 3, gy - 2]], PX.w, 1); }
  if (o.agentSun) pxAgent(g, sx, sy + h * .06, h / 220, T, { burst: false, desk: false });
}
// ---------- the app world (portrait, inside his phone) ----------
function pxApp(g, w, h, T) {
  const st = pxStep(T);
  pGrad(g, (q) => q.rect(0, 0, w, h), 0, 0, 0, h, '#2a2470', '#3a5ab8'); pDots(g, 1, 1, w, h, 3, PX.n, 1);
  for (let i = 0; i < 3; i++) pZig(g, 0, h * (.08 + i * .03), w, 1.5, 6, [PX.c, PX.m, PX.y][i], 1, st * (i + 1));
  pxAgent(g, w / 2, h * .62, w / 120, T, { talk: true });
  for (let i = 0; i < 3; i++) { const an = st * .25 + i * TAU / 3, ox = w / 2 + Math.cos(an) * w * .38, oy = h * .4 + Math.sin(an) * h * .1; pR(g, ox - 4, oy - 1, 8, 2, PX.w); pR(g, ox - 1, oy - 3, 2, 6, PX.w); }
  pR(g, w * .1, h * .88, w * .8, h * .07, PX.r); pText(g, w / 2, h * .915, 'BOOK', PX.w, Math.max(5, w / 10));
}

// a gradient inside a shape, as he painted them; the Bayer dither turns it into a stepped Mac-style tone ramp
function pGrad(g, pathFn, x0, y0, x1, y1, c0, c1) { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); pathFn(g); g.fill(); }
