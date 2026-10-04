// Woodcut drawing kit. Everything is drawn in three flat values (INK black, CUT white, RED accent);
// look.js roughens and prints them. Marks are the carver's: tapered V-gouge flicks, parallel cut
// lines that thin into the light, chiselled (faceted) outlines.
const INK = '#000', CUT = '#fff', RED = '#f00';
const step = (t, n = 12) => Math.floor(t * n + 1e-6) / n;          // limited animation: a new block per step
const wrap = (x, m) => ((x % m) + m) % m;
const tri = (x, w) => clamp(1 - Math.abs(x) / w);

// a tapered gouge stroke from (x, y) along ang: thin in, fat at 35 %, pointed out
function flick(x, y, ang, len, w, c = CUT) {
  const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca;
  const mx = x + ca * len * .35, my = y + sa * len * .35, ex = x + ca * len, ey = y + sa * len;
  s.beginPath(); s.moveTo(x, y); s.quadraticCurveTo(mx + nx * w, my + ny * w, ex, ey); s.quadraticCurveTo(mx - nx * w, my - ny * w, x, y);
  s.fillStyle = c; s.fill();
}
// a stroke whose width runs w0 -> w1 along a polyline (filled polygon, so it prints solid)
function taper(pts, w0, w1, c = INK) {
  const n = pts.length; if (n < 2) return;
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const w = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  s.beginPath(); L.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); for (let i = n - 1; i >= 0; i--) s.lineTo(...R[i]); s.closePath();
  s.fillStyle = c; s.fill();
}
// sample a quadratic/curve as points
function arcPts(cx, cy, rx, ry, a0, a1, n = 24) { const p = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
// chisel a polygon: jitter its corners and subdivide the long edges a little, deterministically
function chisel(pts, seed, amt = 4) {
  const r = rng(seed), out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    out.push([a[0] + (r() - .5) * amt, a[1] + (r() - .5) * amt]);
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.floor(l / 70);
    for (let j = 1; j <= k; j++) { const u = j / (k + 1); out.push([lerp(a[0], b[0], u) + (r() - .5) * amt, lerp(a[1], b[1], u) + (r() - .5) * amt]); }
  }
  return out;
}
function pathOf(pts) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); }
const smoothPath = (pts) => { const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; s.beginPath(); s.moveTo(...m(pts[n - 1], pts[0]));
  for (let i = 0; i < n; i++) { const q = m(pts[i], pts[(i + 1) % n]); s.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); } s.closePath(); };
// fill + outline a path built by mk()
function shape(mk, fillC, lw = 0, lineC = INK) { mk(); if (fillC) { s.fillStyle = fillC; s.fill(); } if (lw) { mk(); s.lineWidth = lw; s.lineJoin = 'miter'; s.miterLimit = 3; s.strokeStyle = lineC; s.stroke(); } }
function clipTo(mk, fn) { withT(() => { mk(); s.clip(); fn(); }); }
// parallel cut lines inside the current clip: rows across a box, perpendicular to `ang`;
// width per row from wf(u) with u = 0 at the box's start edge -> 1 at its end
function rows(x0, y0, x1, y1, ang, gap, wf, c = INK, wob = 0, seed = 0) {
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 10;
  withT(() => { s.translate(cx, cy); s.rotate(ang);
    for (let y = -R, i = 0; y <= R; y += gap, i++) {
      const w = wf((y + R) / (2 * R)); if (w <= .4) continue;
      const pts = []; for (let x = -R; x <= R; x += 40) pts.push([x, y + Math.sin(x * .02 + i * 1.7 + seed) * wob]);
      s.lineWidth = w; s.strokeStyle = c; s.lineCap = 'butt'; s.beginPath(); pts.forEach(([a, b], j) => j ? s.lineTo(a, b) : s.moveTo(a, b)); s.stroke();
    }
  });
}
// scattered gouge flicks inside a box (texture for solids): direction ang +- spread
function flicks(x0, y0, x1, y1, n, ang, len, w, seed, c = CUT, spread = .25) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()); flick(x, y, ang + (r() - .5) * spread, len * (.6 + .6 * r()), w * (.7 + .5 * r()), c); }
}
