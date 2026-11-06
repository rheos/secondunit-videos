// All The Trees: wood-marquetry kit. Pictures are inlaid from cut veneers: each piece is filled with a
// procedural veneer whose grain is anchored to the piece (it travels and turns with it), pieces sit flush
// with a fine dark glue seam between them, and the whole panel carries a lacquer sheen. No drop shadows:
// inlay is flat. Every frame is a pure function of song time t.
const W = 1920, H = 1080;
let g = null;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const eo = (k) => 1 - Math.pow(1 - clamp(k), 3);
const eio = (k) => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const back = (k) => { k = clamp(k); const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const hash2 = (x, y) => hash(x * 157.31 + y * 311.97);
const twos = (t) => Math.floor(t * 12) / 12;

// ---------- value noise ----------
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function fbm(x, y, o = 4) { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); f *= 2; a *= .5; } return s; }

// ---------- veneers ----------
// Each species: light and dark colour, grain stripe frequency, warp, contrast, extra figure.
// Grain runs along the texture's Y axis; a piece's `ang` turns it.
const SPECIES = {
  maple:  { lo: [234, 214, 172], hi: [213, 184, 132], freq: .55, warp: 9, con: .55, fiddle: .35 },
  holly:  { lo: [243, 236, 218], hi: [226, 214, 190], freq: .35, warp: 6, con: .4 },
  ash:    { lo: [228, 205, 160], hi: [196, 160, 108], freq: .22, warp: 22, con: .8 },
  oak:    { lo: [204, 158, 98], hi: [158, 110, 58], freq: .3, warp: 16, con: .75, rays: true },
  cherry: { lo: [190, 108, 66], hi: [146, 72, 40], freq: .4, warp: 12, con: .6 },
  walnut: { lo: [118, 78, 50], hi: [70, 44, 26], freq: .28, warp: 20, con: .8 },
  ebony:  { lo: [44, 34, 28], hi: [22, 17, 14], freq: .6, warp: 8, con: .7 },
  padauk: { lo: [196, 82, 46], hi: [150, 50, 28], freq: .5, warp: 10, con: .55 },
  leaf:   { lo: [126, 140, 72], hi: [88, 102, 46], freq: .7, warp: 7, con: .55 },   // green-dyed sycamore
  leaf2:  { lo: [158, 160, 84], hi: [116, 122, 56], freq: .7, warp: 7, con: .55 },
  sky:    { lo: [150, 156, 158], hi: [118, 125, 130], freq: .2, warp: 30, con: .45, fiddle: .3 },   // harewood: silver-grey dyed sycamore
  burl:   { lo: [96, 62, 38], hi: [70, 44, 27], burl: true, con: .55 },
  brass:  { lo: [222, 186, 96], hi: [168, 128, 52], freq: 1.6, warp: 2, con: .35, metal: true },
};
const VSIZE = 512;
function makeVeneer(sp, seed) {
  const c = document.createElement('canvas'); c.width = c.height = VSIZE; const x = c.getContext('2d');
  const id = x.createImageData(VSIZE, VSIZE), d = id.data;
  for (let py = 0; py < VSIZE; py++) for (let px = 0; px < VSIZE; px++) {
    let v;
    if (sp.burl) {
      const n = fbm(px / 140 + seed, py / 140, 5);
      v = .5 + .5 * Math.sin(n * 22 + fbm(px / 40, py / 40 + seed, 3) * 4);
      v = Math.pow(v, 1.3) * .8 + fbm(px / 4, py / 4, 2) * .2;
    } else {
      const n = fbm(px / 90 + seed, py / 420 + seed * .3, 4);           // long in the grain direction
      v = .5 + .5 * Math.sin((px + n * sp.warp * 8) * sp.freq * .25);
      v = Math.pow(v, 3) * .8 + fbm(px / 3, py / 60 + seed, 2) * .35;    // sharp late-wood lines + fine pores
      if (sp.fiddle) v += Math.sin(py * .09 + fbm(px / 40, py / 40) * 3) * sp.fiddle * .25;
      if (sp.rays && hash2(Math.floor(px / 7), Math.floor(py / 26)) > .93) v += .35;   // oak ray flecks
    }
    v = clamp(.5 + (v - .5) * sp.con * 1.6);
    const i = (py * VSIZE + px) * 4;
    for (let k = 0; k < 3; k++) d[i + k] = lerp(sp.lo[k], sp.hi[k], v);
    d[i + 3] = 255;
  }
  x.putImageData(id, 0, 0);
  return c;
}
const VENEER = {};
let VPAT = {};
function initVeneers() { let s = 1; for (const k in SPECIES) VENEER[k] = makeVeneer(SPECIES[k], s++ * 3.7);
  VENEER.oyster = makeOyster([226, 188, 128], [168, 116, 62], 2.1); VENEER.oysterDark = makeOyster([176, 112, 66], [112, 66, 36], 5.3); }
// end grain: a branch cut across ("oyster" veneer): growth rings round the pith, warped, with radial checks
function makeOyster(lo, hi, seed) {
  const c = document.createElement('canvas'); c.width = c.height = VSIZE; const x = c.getContext('2d');
  const id = x.createImageData(VSIZE, VSIZE), d = id.data, C = VSIZE / 2;
  for (let py = 0; py < VSIZE; py++) for (let px = 0; px < VSIZE; px++) {
    const dx = px - C, dy = py - C, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    const warp = fbm(Math.cos(a) * 2 + seed, Math.sin(a) * 2 + seed, 3) * 18 + fbm(px / 50, py / 50 + seed, 3) * 8;
    let v = .5 + .5 * Math.sin((r + warp) * .23);
    v = Math.pow(v, 4) * .9 + fbm(px / 3, py / 3, 2) * .25;
    const check = Math.pow(Math.max(0, Math.cos(a * 9 + seed + fbm(r / 30, seed, 2) * 2)), 60) * clamp(r / 120);
    v = clamp(v + check * .5);
    const i = (py * VSIZE + px) * 4; for (let k = 0; k < 3; k++) d[i + k] = lerp(lo[k], hi[k], v); d[i + 3] = 255;
  }
  x.putImageData(id, 0, 0); return c;
}

// ---------- the inlay primitive ----------
// piece(path, sp, { ang, ox, oy, tone, seam }): fills path with veneer `sp`, grain turned by `ang`,
// anchored at (ox, oy) in the current transform so the grain moves with the piece.
function piece(path, sp, { ang = 0, ox = 0, oy = 0, tone = 0, seam = 1.6, alpha = 1, scale = 1 } = {}) {
  if (!VPAT[sp]) VPAT[sp] = g.createPattern(VENEER[sp], 'repeat');
  const pat = VPAT[sp];
  const m = g.getTransform();
  // pattern lives in the current user space: anchor at the piece, turn with its grain, then hand back
  pat.setTransform(new DOMMatrix().translateSelf(ox, oy).rotateSelf(ang * 180 / Math.PI).scaleSelf(scale, scale).translateSelf(-VSIZE / 2, -VSIZE / 2));
  g.save(); if (alpha < 1) g.globalAlpha *= alpha;
  g.fillStyle = pat; g.fill(path);
  if (tone) { g.fillStyle = tone > 0 ? `rgba(255,248,230,${tone})` : `rgba(30,16,6,${-tone})`; g.fill(path); }
  if (seam) { g.lineWidth = seam / Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) ; g.strokeStyle = 'rgba(34,20,10,.82)'; g.lineJoin = 'round'; g.stroke(path); }
  g.restore();
}

// ---------- path helpers ----------
function poly(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
function blob(pts, tension = .5) {
  const p = new Path2D(); const n = pts.length; p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3,
      p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
  p.closePath(); return p;
}
function circle(x, y, r) { const p = new Path2D(); p.arc(x, y, Math.max(.1, r), 0, Math.PI * 2); return p; }
function ellipse(x, y, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, Math.PI * 2); return p; }
function ring(x, y, r0, r1) { const p = new Path2D(); p.arc(x, y, r1, 0, Math.PI * 2); p.moveTo(x + r0, y); p.arc(x, y, r0, 0, Math.PI * 2, true); return p; }
// a leaf: pointed oval along its axis (length L, width w), centred at 0,0 pointing up
function leafPath(L, w) { const p = new Path2D(); p.moveTo(0, -L / 2); p.quadraticCurveTo(w, -L * .05, 0, L / 2); p.quadraticCurveTo(-w, -L * .05, 0, -L / 2); p.closePath(); return p; }
// a tapered band along a polyline (roots, boughs): widths w0 -> w1
function band(pts, w0, w1) {
  const L = [], R = []; const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  return blob(L.concat(R.reverse()), .35);
}
// sample a cubic from p0 to p3 into n points
function curve(p0, p1, p2, p3, n = 14) {
  const out = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u;
    out.push([v*v*v*p0[0] + 3*v*v*u*p1[0] + 3*v*u*u*p2[0] + u*u*u*p3[0], v*v*v*p0[1] + 3*v*v*u*p1[1] + 3*v*u*u*p2[1] + u*u*u*p3[1]]); }
  return out;
}

// an inlay "press-in": a piece appears at t0 by settling into its cavity (tiny overshoot)
const inlay = (t, t0, dur = .25) => t < t0 ? 0 : back((t - t0) / dur);
