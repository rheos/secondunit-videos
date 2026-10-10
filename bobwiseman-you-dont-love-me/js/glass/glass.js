// Stained-glass drawing kit: palette, glass texture, panes (fill + per-pane colour variation + edge shading),
// lead cames, grisaille paint. Everything is drawn live in world coordinates under the camera transform.

const C = {
  ruby: [178, 22, 38], ruby2: [140, 12, 40], blue: [28, 62, 170], blue2: [16, 36, 120], sky: [80, 145, 215],
  green: [24, 128, 62], green2: [70, 150, 40], gold: [238, 172, 32], amber: [214, 118, 22], purple: [98, 34, 120],
  murrey: [124, 28, 66], flesh: [240, 212, 188], white: [226, 230, 214], clear: [196, 206, 198], sand: [236, 198, 96],
  sand2: [222, 156, 58], sand3: [196, 112, 40], brown: [112, 58, 24], hair: [92, 44, 18], grey: [196, 196, 188],
  pink: [222, 70, 130], night: [10, 14, 34],
};
const LEAD = '#14100d';

// Glass texture: a mid-grey tile with mottle, streaks (drawn glass) and seed bubbles, applied as an overlay.
let TEX = null, TEXPAT = null;
function buildTex() {
  const s = 512, c = mkCanvas(s, s), x = c.getContext('2d'), R = mulberry(4242);
  x.fillStyle = 'rgb(128,128,128)'; x.fillRect(0, 0, s, s);
  for (let k = 0; k < 140; k++) { // mottle
    const px = R() * s, py = R() * s, r = 20 + R() * 70, v = R() < .5 ? 0 : 255;
    for (const [ox, oy] of [[0, 0], [s, 0], [-s, 0], [0, s], [0, -s]]) {
      const rg = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, r);
      rg.addColorStop(0, `rgba(${v},${v},${v},${.05 + R() * .07})`); rg.addColorStop(1, `rgba(${v},${v},${v},0)`);
      x.fillStyle = rg; x.fillRect(px + ox - r, py + oy - r, r * 2, r * 2);
    }
  }
  x.lineCap = 'round';
  for (let k = 0; k < 70; k++) { // streaks, roughly horizontal
    const y0 = R() * s, v = R() < .5 ? 40 : 230; x.strokeStyle = `rgba(${v},${v},${v},${.05 + R() * .08})`; x.lineWidth = 1 + R() * 5;
    x.beginPath(); for (let i = 0; i <= 16; i++) { const px = i / 16 * (s + 40) - 20, py = y0 + Math.sin(i * .7 + k) * 6 + (R() - .5) * 3; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
  }
  for (let k = 0; k < 260; k++) { // seeds
    const px = R() * s, py = R() * s, r = .8 + R() * 2.6;
    x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = .8; x.beginPath(); x.arc(px + .6, py + .6, r, 0, TAU); x.stroke();
  }
  TEX = c;
}
function texPattern(g) { if (!TEX) buildTex(); if (!TEXPAT) TEXPAT = g.createPattern(TEX, 'repeat'); return TEXPAT; }

// Colour of a pane: base colour with a seeded shift in value and hue (no two pieces of glass are alike).
function vary(col, seed, amt = 1) {
  const v = 1 + (rnd(seed, 1.3) - .5) * .26 * amt, h = (rnd(seed, 2.7) - .5) * 26 * amt;
  return [col[0] * v + h, col[1] * v + h * .2, col[2] * v - h];
}
// One piece of glass: filled, shaded darker toward its lead (light reads brightest mid-pane), then leaded.
function pane(g, path, col, seed, o = {}) {
  const c = o.exact ? col : vary(col, seed, o.amt ?? 1);
  g.fillStyle = rgb(c, o.alpha ?? 1); g.fill(path);
  if (o.shade !== 0) {
    g.save(); g.clip(path);
    g.lineWidth = o.ew || 26; g.strokeStyle = `rgba(12,4,18,${o.shade ?? .3})`; g.stroke(path);
    g.lineWidth = (o.ew || 26) * .4; g.strokeStyle = `rgba(12,4,18,${(o.shade ?? .3) * .8})`; g.stroke(path);
    g.restore();
  }
  if (o.lead !== 0) lead(g, path, o.lw || 9);
}
function lead(g, path, w = 9) {
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.lineWidth = w; g.strokeStyle = LEAD; g.stroke(path);
  g.lineWidth = w * .22; g.strokeStyle = 'rgba(92,84,74,.55)'; g.stroke(path);
}
// Grisaille: dark brown vitreous paint lines.
function paint(g, w = 4, a = .9) { g.lineWidth = w; g.strokeStyle = `rgba(42,24,12,${a})`; g.lineCap = 'round'; g.lineJoin = 'round'; }

// Path helpers
function polyPath(pts, close = true) { const p = new Path2D(); pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); if (close) p.closePath(); return p; }
function ellPath(x, y, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, TAU); return p; }
function circPath(x, y, r) { const p = new Path2D(); p.arc(x, y, r, 0, TAU); return p; }
// A smooth closed blob through points (Catmull-Rom as beziers).
function smoothPath(pts, close = true) {
  const p = new Path2D(), n = pts.length, P = (i) => pts[close ? (i + n) % n : clamp(i, 0, n - 1)];
  p.moveTo(...P(0));
  for (let i = 0; i < (close ? n : n - 1); i++) {
    const a = P(i - 1), b = P(i), c = P(i + 1), d = P(i + 2);
    p.bezierCurveTo(b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6, c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6, c[0], c[1]);
  }
  if (close) p.closePath(); return p;
}
// A tapered limb/stem along a polyline: widths per point.
function limbPts(pts, ws) {
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    L.push([pts[i][0] - dy * ws[i] / 2, pts[i][1] + dx * ws[i] / 2]); R.push([pts[i][0] + dy * ws[i] / 2, pts[i][1] - dx * ws[i] / 2]);
  }
  return L.concat(R.reverse());
}
function heartPts(cx, cy, w, h, n = 48) { // classic heart, top notch at (cx, cy - h*.32), tip at (cx, cy + h*.5)
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, x = 16 * Math.pow(Math.sin(a), 3), y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    pts.push([cx + x / 32 * w, cy + (y + 2) / 30 * h]);
  }
  return pts;
}
