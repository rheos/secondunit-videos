// The world behind the glass (draft 6 look test, Mark Von Ulrich as guest art director).
// Drawn small on a low-res canvas, every pixel snapped to a fixed saturated palette, then scaled up with
// nearest-neighbour so contours stay stepped and jagged. Used ONLY inside device screens; the paper world and
// the blueprint schematics are never pixelated. Original images in his spirit; no piece of his is reproduced.
'use strict';
const PXPAL = [
  ['k', '#0b0b12'], ['b', '#1f2fbf'], ['n', '#101a6e'], ['c', '#22c6e8'], ['r', '#e3262b'], ['y', '#ffd21a'],
  ['o', '#ff7a1a'], ['g', '#3fc43a'], ['m', '#e5399b'], ['w', '#fbfbf2'], ['p', '#ff9aa8'], ['u', '#8a4b2a'],
  ['t', '#1c9c94'], ['f', '#ffe680'],
];
const PX = Object.fromEntries(PXPAL); const PXRGB = PXPAL.map(([, h]) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
const PXCACHE = {};
// Draw into a w x h low-res canvas, quantize to the palette, return the canvas (blit with blitPix).
function pixWorld(key, w, h, drawFn) {
  const id0 = key + w + 'x' + h; let c = PXCACHE[id0]; if (!c) { c = PXCACHE[id0] = document.createElement('canvas'); c.width = w; c.height = h; }
  const g = c.getContext('2d', { willReadFrequently: true }); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); g.globalAlpha = 1; g.lineCap = 'butt'; g.lineJoin = 'miter';
  drawFn(g, w, h);
  const im = g.getImageData(0, 0, w, h), d = im.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
    let best = 0, bd = 1e9; for (let j = 0; j < PXRGB.length; j++) { const q = PXRGB[j], e = (d[i] - q[0]) ** 2 * 3 + (d[i + 1] - q[1]) ** 2 * 4 + (d[i + 2] - q[2]) ** 2 * 2; if (e < bd) { bd = e; best = j; } }
    const q = PXRGB[best]; d[i] = q[0]; d[i + 1] = q[1]; d[i + 2] = q[2]; d[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); return c;
}
function blitPix(c, x, y, w, h) { X.save(); X.imageSmoothingEnabled = false; X.drawImage(c, x, y, w, h); X.restore(); }
const pxStep = (T, fps = 8) => Math.floor(T * fps + 1e-6); // stepped motion, like hinged cut-outs

// ---------- low-res drawing helpers (g = low-res context) ----------
function pR(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function pP(g, pts, col) { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
function pC(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); g.arc(x, y, Math.max(.6, r), 0, TAU); g.fill(); }
function pL(g, pts, col, lw = 1) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
function pBurst(g, cx, cy, r0, r1, n, rot, c1, c2) {
  for (let i = 0; i < n; i++) { const a0 = rot + i / n * TAU, a1 = rot + (i + .5) / n * TAU, a2 = rot + (i + 1) / n * TAU;
    pP(g, [[cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0], [cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1], [cx + Math.cos(a2) * r0, cy + Math.sin(a2) * r0]], i % 2 ? c2 : c1); }
  pC(g, cx, cy, r0 + .5, c1);
}
function pZig(g, x, y, w, amp, per, col, lw = 1, ph = 0) { const pts = []; for (let k = 0; k <= w / per * 2 + 1; k++) pts.push([x + k * per / 2 - (ph % per), y + (k % 2 ? amp : -amp)]); pL(g, pts, col, lw); }
function pDots(g, x, y, w, h, step, col, off = 0) { g.fillStyle = col; for (let yy = y; yy < y + h; yy += step) for (let xx = x + ((yy / step) % 2 ? off : 0); xx < x + w; xx += step) g.fillRect(xx, yy, 1, 1); }
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
  pR(g, cx - 16 * s, cy - 58 * s, 32 * s, 38 * s, PX.f); pR(g, cx - 16 * s, cy - 58 * s, 32 * s, 7 * s, PX.r);
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
  pR(g, 0, 0, w, h, PX.k); pDots(g, 1, 1, w, h * .55, 4, PX.g, 2);
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
  pR(g, 0, 0, w, h, PX.k); pDots(g, 1, 1, w, h, 3, PX.n, 1);
  for (let i = 0; i < 3; i++) pZig(g, 0, h * (.08 + i * .03), w, 1.5, 6, [PX.c, PX.m, PX.y][i], 1, st * (i + 1));
  pxAgent(g, w / 2, h * .62, w / 120, T, { talk: true });
  for (let i = 0; i < 3; i++) { const an = st * .25 + i * TAU / 3, ox = w / 2 + Math.cos(an) * w * .38, oy = h * .4 + Math.sin(an) * h * .1; pR(g, ox - 4, oy - 1, 8, 2, PX.w); pR(g, ox - 1, oy - 3, 2, 6, PX.w); }
  pR(g, w * .1, h * .88, w * .8, h * .07, PX.r); pText(g, w / 2, h * .915, 'BOOK', PX.w, Math.max(5, w / 10));
}
