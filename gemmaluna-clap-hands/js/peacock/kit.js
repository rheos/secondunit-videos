// Clap Hands, cut-paper peacock look. Paper primitives ported from In Her Dream's js/cut/kit.js.
// Look: flat paper layers with soft drop shadows, visible grain and mottling, people as jointed
// silhouette puppets (one colour per person, joints hidden by the colour), paper moving on twos.
// Everything is a pure function of song time t. Drawing goes to the global context `g`
// (main.js points it at the right buffer before each shot draws).
const W = 1080, H = 1920; // 9:16
let g = null;

// ---------------- palette: PEACOCK (look bible: PEACOCK.md) ----------------
// Four papers only: teal ground, antique gold, plum, cream. Each in three weights. One accent,
// peacock blue, lives only in the eye of a feather.
const C = {
  tealInk: '#0c3133', tealDeep: '#134b4c', teal: '#1b6662', tealLight: '#2f8a80',
  goldDeep: '#9c7426', gold: '#c99c3c', goldPale: '#e8cd86',
  plumDeep: '#3a1836', plum: '#62294f', plumLight: '#8a4a72',
  creamDeep: '#ddcca4', cream: '#f0e5c8', white: '#f8f1de',
  blue: '#1f4e78',
};

// ---------------- maths ----------------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eo = (k) => 1 - Math.pow(1 - clamp(k), 3);
const ei = (k) => Math.pow(clamp(k), 3);
const eio = (k) => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const back = (k) => { k = clamp(k); const c = 1.6; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const twos = (t) => Math.floor(t * 12) / 12;                                          // paper moves on twos
const jit = (t, k, a = 1.2) => (hash(Math.floor(t * 12) * 7.3 + k) - .5) * 2 * a;   // hand-placed wobble
// a pop: 0 before t0, overshoots to 1 over dur
const pop = (t, t0, dur = .5) => t < t0 ? 0 : back((t - t0) / dur);
// a bump that peaks at t0 + dur/2 and is 0 outside [t0, t0+dur]
const bump = (t, t0, dur) => (t < t0 || t > t0 + dur) ? 0 : Math.sin((t - t0) / dur * Math.PI);

// ---------------- paper textures (made once) ----------------
function grainCanvas(seed, w = W, h = H) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  const id = x.createImageData(w, h); const d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 128 + (hash(i * .25 + seed) - .5) * 70; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  x.putImageData(id, 0, 0);
  x.globalAlpha = .07; x.lineWidth = 1;
  const nf = Math.round(2600 * w * h / (W * H));
  for (let i = 0; i < nf; i++) {
    const px = hash(i + seed) * w, py = hash(i * 3.1 + seed) * h, a = hash(i * 5.7 + seed) * Math.PI, l = 8 + hash(i * 9.1) * 30;
    x.strokeStyle = hash(i * 2.3) > .5 ? '#fff' : '#000';
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + .4) * l * .5, py + Math.sin(a + .4) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  return c;
}
const GRAIN = grainCanvas(1.7), GRAIN2 = grainCanvas(9.3);
const MOTTLE = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const s = grainCanvas(4.4, 96, 54); x.filter = 'blur(18px)'; x.drawImage(s, -40, -40, W + 80, H + 80); return c; })();

// ---------------- the paper primitive ----------------
// cut(path, fill, opts): one layer of cut paper. sh = shadow strength, lift = height above the layer
// below (bigger, softer shadow), grain = how much paper texture shows on it.
function cut(path, fill, { sh = 1, grain = .22, lift = 0, alpha = 1, rule = 'nonzero' } = {}) {
  { const m = g.getTransform(); if (Math.abs(m.a * m.d - m.b * m.c) < 1e-6) return; }   // a shape scaled to nothing draws nothing
  g.save();
  if (alpha < 1) g.globalAlpha *= alpha;
  if (sh > 0) { g.shadowColor = `rgba(20,16,30,${.32 * sh})`; g.shadowBlur = 16 + lift * 12; g.shadowOffsetX = 4 + lift * 4; g.shadowOffsetY = 7 + lift * 6; }
  g.fillStyle = fill; g.fill(path, rule);
  g.restore();
  if (grain) {
    g.save(); g.clip(path, rule); g.globalAlpha *= grain * alpha; g.globalCompositeOperation = 'soft-light';
    const m = g.getTransform(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(GRAIN2, 0, 0);
    g.globalAlpha = Math.min(1, g.globalAlpha * 1.6); g.drawImage(MOTTLE, 0, 0); g.setTransform(m);
    g.restore();
  }
}
// fill the whole frame with one sheet of paper
function sheet(col, alpha = 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha *= alpha; g.fillStyle = col; g.fillRect(-10, -10, W + 20, H + 20); g.restore(); }

// ---------------- path helpers ----------------
// cubic point list: [x0,y0, c1x,c1y,c2x,c2y,x,y, ...]
function pathOf(pts) {
  const p = new Path2D(); p.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 6) p.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]);
  p.closePath(); return p;
}
// smooth closed shape through points (Catmull-Rom), with optional per-point hand wobble
function blob(pts, tension = .5) {
  const p = new Path2D(); const n = pts.length;
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3,
      p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
  p.closePath(); return p;
}
function poly(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
function circle(x, y, r) { const p = new Path2D(); p.arc(x, y, Math.max(.1, r), 0, Math.PI * 2); return p; }
function ellipse(x, y, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, Math.PI * 2); return p; }
function rect(x, y, w, h) { const p = new Path2D(); p.rect(x, y, w, h); return p; }
function rrect(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; }
// a rectangle with slightly irregular, hand-cut edges (seeded so it is stable)
function cutRect(x, y, w, h, seed = 0, wob = 2.5) {
  const pts = []; const n = Math.max(2, Math.round(w / 90)), m = Math.max(2, Math.round(h / 90));
  for (let i = 0; i <= n; i++) pts.push([x + w * i / n, y + (hash(seed + i) - .5) * wob]);
  for (let i = 1; i <= m; i++) pts.push([x + w + (hash(seed + 50 + i) - .5) * wob, y + h * i / m]);
  for (let i = n - 1; i >= 0; i--) pts.push([x + w * i / n, y + h + (hash(seed + 100 + i) - .5) * wob]);
  for (let i = m - 1; i > 0; i--) pts.push([x + (hash(seed + 150 + i) - .5) * wob, y + h * i / m]);
  return poly(pts);
}
function star4(x, y, r) {
  const p = new Path2D(); const k = r * .28;
  p.moveTo(x, y - r); p.quadraticCurveTo(x + k * .4, y - k * .4, x + r, y); p.quadraticCurveTo(x + k * .4, y + k * .4, x, y + r);
  p.quadraticCurveTo(x - k * .4, y + k * .4, x - r, y); p.quadraticCurveTo(x - k * .4, y - k * .4, x, y - r); p.closePath(); return p;
}
function crescent(x, y, r, phase = .55, rot = 0) {
  // phase: how far the inner circle is offset (0 = thin sliver, 1 = nearly full)
  const p = new Path2D(); const c = Math.cos(rot), s = Math.sin(rot);
  const N = 40, pts = [];
  for (let i = 0; i <= N; i++) { const a = -Math.PI / 2 + Math.PI * i / N; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  for (let i = N; i >= 0; i--) { const a = -Math.PI / 2 + Math.PI * i / N; pts.push([Math.cos(a) * r * (1 - 2 * phase), Math.sin(a) * r]); }
  p.moveTo(x + pts[0][0] * c - pts[0][1] * s, y + pts[0][0] * s + pts[0][1] * c);
  for (const [px, py] of pts) p.lineTo(x + px * c - py * s, y + px * s + py * c);
  p.closePath(); return p;
}
// a torn-paper ribbon from x0 to x1 at height y
function ribbon(x0, x1, y, th, ph, wave = 22) {
  const p = new Path2D(); const n = 24; const pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0, x1, u), y + Math.sin(u * 5 + ph) * wave]); }
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= n; i++) { const u = i / n; p.lineTo(pts[i][0], pts[i][1] - th * Math.sin(u * Math.PI) * .5 + (hash(i + ph) - .5) * 2); }
  for (let i = n; i >= 0; i--) { const u = i / n; p.lineTo(pts[i][0], pts[i][1] + th * Math.sin(u * Math.PI) * .5 + (hash(i * 3 + ph) - .5) * 2); }
  p.closePath(); return p;
}
// a ribbon along an arbitrary polyline of [x,y] points with width w (tapered ends)
function ribbonAlong(pts, w) {
  const L = [], R = []; const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const ww = w * .5 * Math.sin(Math.PI * (i / (n - 1)) * .999 + .001) ** .5;
    L.push([pts[i][0] - dy * ww, pts[i][1] + dx * ww]); R.push([pts[i][0] + dy * ww, pts[i][1] - dx * ww]);
  }
  return poly(L.concat(R.reverse()));
}
// a scalloped cloud: centre x,y, width w, height h
function cloud(x, y, w, h, seed = 0) {
  const pts = []; const n = 9;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n; const bump = .82 + hash(seed + i) * .3;
    pts.push([x + Math.cos(a) * w * .5 * bump, y + Math.sin(a) * h * .5 * (a > 0 && a < Math.PI ? .55 : bump)]);
  }
  return blob(pts, .9);
}
// a five-petal paper flower
function flowerPath(x, y, r, petals = 5, rot = 0) {
  const p = new Path2D();
  for (let i = 0; i < petals; i++) { const a = rot + Math.PI * 2 * i / petals; const ex = x + Math.cos(a) * r * .55, ey = y + Math.sin(a) * r * .55;
    p.moveTo(ex + Math.cos(a) * r * .5, ey + Math.sin(a) * r * .5); p.ellipse(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .55, r * .5, r * .3, a, 0, Math.PI * 2); }
  return p;
}
function flower(x, y, r, col, centre = C.gold, rot = 0, opts = {}) { cut(flowerPath(x, y, r, 5, rot), col, { sh: .6, ...opts }); cut(circle(x, y, r * .26), centre, { sh: .3, grain: .1 }); }
// a little paper bird (wings flap with ph)
function bird(x, y, s, ph, col = C.cream, dir = 1) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  const f = Math.sin(ph) * 0.9;
  cut(blob([[-40, 0], [-10, -10], [30, -6], [46, 0], [30, 8], [-10, 10]], .7), col, { sh: .6 });
  cut(poly([[-6, -4], [16, -4], [4, -4 - 46 * f - 10]]), col, { sh: .5 });
  g.restore();
}
// laughter / joy: gold rings riding out from a point (the motif from the look test)
function laughRings(t, x, y, at, { n = 3, dir = -.35, spread = .75, reach = 520, life = 2.4, w0 = 14, scale = 1 } = {}) {
  for (let r = 0; r < n; r++) {
    const d = t - at - r * .16; if (d < 0 || d > life) continue;
    const k = d / life;
    g.save(); g.translate(x, y); g.rotate(dir);
    g.globalAlpha *= (1 - k) * .95; g.strokeStyle = r % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(w0, 3, k) * scale; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, (30 + k * reach) * scale, -spread, spread); g.stroke();
    g.restore();
  }
}
