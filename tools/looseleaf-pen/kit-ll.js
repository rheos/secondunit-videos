// Swaps a kit.js film's ink lines (iline, iE, iP, iBox) for the Looseleaf pen engine.
// Load after kit.js and looseleaf-pen.js, before the acts. Hatching, stipple and fills are untouched.
// The pen is seeded from the kit's own RNG, so lines boil on twos exactly where the kit's did.
// ?pen=felt (default) | pencil | brush | fine, &penw=<width multiplier>, &penwob=<wobble multiplier>
'use strict';
(() => {
  const q = new URLSearchParams(location.search);
  const PEN = { felt: 'ink', pencil: 'pencil', brush: 'ink.brush', fine: 'ink.fine' }[q.get('pen') || 'felt'] || q.get('pen');
  const WK = Number(q.get('penw') || 1), WOB = Number(q.get('penwob') || 1);
  const spec = LLPen.pen(PEN);
  const cache = new Map();
  const p2d = (d) => { let p = cache.get(d); if (!p) { p = new Path2D(d); if (cache.size > 4000) cache.clear(); cache.set(d, p); } return p; };

  // One pen stroke along pts (poly: follow the points, fillet corners by `round` px; the pen's
  // default spline overshoots wildly on sparse corner points such as a 4-point box), coloured col; w is the kit's line width in film px.
  function ink(pts, col, w, a, round = 3) {
    if (pts.length < 2) return;
    const k = (w / spec.W) * WK;
    const r = LLPen.stroke(pts, PEN, LLPen.makeRng((R() * 2 ** 31) | 0), { width: k, wobble: WOB * Math.sqrt(k), tier: 'hi', poly: true, round });
    X.save(); X.fillStyle = col;
    for (const L of r.layers) { X.globalAlpha = Math.min(1, L.op * a); X.fill(p2d(L.d), L.rule || 'nonzero'); }
    X.restore();
  }
  const line = (x1, y1, x2, y2) => dens([[x1, y1], [x2, y2]], 12);
  function ell(cx, cy, rx, ry, rot, a0, a1) {
    const c = Math.cos(rot), s = Math.sin(rot), n = Math.max(12, Math.ceil(Math.max(rx, ry) * Math.abs(a1 - a0) / 8)), o = [];
    for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n, x = Math.cos(t) * rx, y = Math.sin(t) * ry; o.push([cx + x * c - y * s, cy + x * s + y * c]); }
    return o;
  }

  window.iline = function (x1, y1, x2, y2, col = C.ink, w = 2, a = 1) { ink(line(x1, y1, x2, y2), col, w, a); };
  window.iE = function (cx, cy, rx, ry, rot = 0, col = C.ink, w = 2, a = 1, dbl, j, a0, a1) { ink(ell(cx, cy, rx, ry, rot, a0 ?? 0, a1 ?? TAU), col, w, a); };
  window.iP = function (pts, closed, col = C.ink, w = 2, a = 1) { ink(closed ? pts.concat([pts[0]]) : pts, col, w, a); };
  window.iBox = function (x, y, w, h, col = C.ink, lw = 2, a = 1) { iP([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true, col, lw, a); };
  window.__pen = PEN;
})();
