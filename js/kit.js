// Drawing kit for the hybrid exploration: geometry helpers, the woodcut marks (copied from
// bobwiseman-airplane-woodcut/js/wood.js), the scissor-cut paper pieces (after
// bobwiseman-airplane-cutout/js/cutout.js), and the three PENS that put a shape down in each look.
//
// Plane and world code describe shapes as point lists and ask the current PEN to lay them down by ROLE
// (body, dark, accent, glass, white, pupil, tongue, tyre, hub). The pen decides what that means:
//   WoodPen    flat black / white / red on s, chiselled corners, black outline; the shader prints it
//   CutPen     a scissor-cut piece of photocopied paper, white rim, cast shadow, slightly wonky edges
//   GouachePen a flat wash on the brushstroke renderer's underpainting, with a pencil underdrawing
//              (that doesn't quite line up) on its unbrushed ink layer; faces go straight on the ink layer
const step = (t, n = 12) => Math.floor(t * n + 1e-6) / n;          // limited animation
const wrap = (x, m) => ((x % m) + m) % m;
const tri = (x, w) => clamp(1 - Math.abs(x) / w);

// ---------------- geometry ----------------
function circPts(cx, cy, rx, ry = rx, n = 28, a0 = 0, a1 = TAU) { const p = []; const closed = Math.abs(a1 - a0 - TAU) < 1e-6; const m = closed ? n : n + 1; for (let i = 0; i < m; i++) { const a = a0 + (a1 - a0) * i / n; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
const arcPts = (cx, cy, rx, ry, a0, a1, n = 24) => circPts(cx, cy, rx, ry, n, a0, a1);
function quadPts(a, c, b, n = 10) { const p = []; for (let i = 0; i <= n; i++) { const u = i / n; p.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]); } return p; }
function rrectPts(x, y, w, h, r, n = 5) { const p = []; const cs = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]]; for (const [cx, cy, a] of cs) for (let i = 0; i <= n; i++) { const b = a + i / n * Math.PI / 2; p.push([cx + Math.cos(b) * r, cy + Math.sin(b) * r]); } return p; }
function pathOn(g, pts, smooth = false, closed = true) {
  g.beginPath();
  if (smooth && closed) { const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; g.moveTo(...m(pts[n - 1], pts[0])); for (let i = 0; i < n; i++) { const q = m(pts[i], pts[(i + 1) % n]); g.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); } }
  else pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  if (closed) g.closePath();
}
// jitter a polygon's corners and subdivide its long edges (chisel for wood, scissors for paper)
function chisel(pts, seed, amt = 4, seg = 70) {
  const r = rng(seed), out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    out.push([a[0] + (r() - .5) * amt, a[1] + (r() - .5) * amt]);
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.floor(l / seg);
    for (let j = 1; j <= k; j++) { const u = j / (k + 1); out.push([lerp(a[0], b[0], u) + (r() - .5) * amt, lerp(a[1], b[1], u) + (r() - .5) * amt]); }
  }
  return out;
}

// ---------------- woodcut marks (wood.js) ----------------
const INK = '#000', CUT = '#fff', RED = '#f00';
function flick(x, y, ang, len, w, c = CUT) {
  const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca;
  const mx = x + ca * len * .35, my = y + sa * len * .35, ex = x + ca * len, ey = y + sa * len;
  s.beginPath(); s.moveTo(x, y); s.quadraticCurveTo(mx + nx * w, my + ny * w, ex, ey); s.quadraticCurveTo(mx - nx * w, my - ny * w, x, y);
  s.fillStyle = c; s.fill();
}
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

// ---------------- photocopied paper sheets (for the collage) ----------------
// Each sheet is a 512 px tile: a base colour, toner noise, copier streaks, the odd fibre. Baked once
// (deterministic), used as fill patterns.
const SHEET_DEF = {
  cream: ['#ece2c8', .55], pink: ['#dfa593', .5], toner: ['#252123', .25], red: ['#cf2a28', .45], sky: ['#a7bfca', .6],
  grey: ['#a9a397', .6], ochre: ['#d7a24a', .5], white: ['#f5efe0', .25], glass: ['#7d8f9b', .55], green: ['#9aa58a', .6], road: ['#4a4646', .5],
};
const SHEETS = {};
function sheet(name) {
  if (SHEETS[name]) return SHEETS[name];
  const [base, amt] = SHEET_DEF[name], c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d'), r = rng(name.length * 977 + name.charCodeAt(0) * 31);
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5200 * amt; i++) { const x = r() * 512, y = r() * 512, rr = .4 + r() * r() * 2.2; g.fillStyle = `rgba(20,18,20,${.15 + r() * .45})`; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); }
  for (let i = 0; i < 9; i++) { const x = r() * 512, w = 1 + r() * 7; g.fillStyle = `rgba(30,28,30,${.04 + r() * .07})`; g.fillRect(x, 0, w, 512); }
  for (let i = 0; i < 40; i++) { const x = r() * 512, y = r() * 512, a = r() * TAU, l = 6 + r() * 18; g.strokeStyle = `rgba(255,252,240,${.15 + r() * .2})`; g.lineWidth = .8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  // a soft blotch where the copier ran out of toner
  const bx = r() * 512, by = r() * 512, gr = g.createRadialGradient(bx, by, 10, bx, by, 220); gr.addColorStop(0, 'rgba(255,250,235,.18)'); gr.addColorStop(1, 'rgba(255,250,235,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  return (SHEETS[name] = s.createPattern(c, 'repeat'));
}

// ---------------- pens ----------------
// all pens: ctxs (for transforms), fill(pts, role, o), line(pts, w, role, o), dotp(x, y, r, role, o)
function TX(pen, x, y, k, rot, fn) { for (const g of pen.ctxs()) { g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(k, k); } try { fn(); } finally { for (const g of pen.ctxs()) g.restore(); } }

const WoodPen = {
  name: 'wood', ctxs: () => [s],
  col: { body: CUT, dark: INK, accent: RED, glass: INK, white: CUT, pupil: INK, tongue: RED, tyre: INK, hub: CUT, sky: INK, ground: INK },
  fill(pts, role, o = {}) {
    const P = o.seed !== undefined ? chisel(pts, o.seed, o.amt ?? 4) : pts;
    pathOn(s, P, o.smooth); s.fillStyle = this.col[role] || CUT; s.fill();
    if (o.shade) { s.save(); pathOn(s, P, o.smooth); s.clip(); const ys = P.map((p) => p[1]), xs = P.map((p) => p[0]); const y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs);
      for (let i = 0; i < 9; i++) { const y = y1 - 6 - i * (y1 - y0) * .045; taper([[x0 - 10, y], [x1 + 10, y - 3]], 9 * Math.pow(1 - i / 9, 1.3), 9 * Math.pow(1 - i / 9, 1.3), INK); } s.restore(); }
    // black parts get a carved keyline (pink on navy) so they never sink into a black ground, as on The Legend
    const dk = this.col[role] === INK && role !== 'pupil' && !o.noRim;
    const lw = dk ? Math.max(o.lw ?? 5, 4.5) : (o.lw ?? (role === 'pupil' ? 0 : 7));
    if (lw) { pathOn(s, P, o.smooth); s.lineWidth = lw; s.lineJoin = 'miter'; s.miterLimit = 3; s.strokeStyle = dk ? CUT : INK; s.stroke(); }
  },
  line(pts, w, role = 'dark', o = {}) { if (o.taper) taper(pts, o.taper[0], o.taper[1], this.col[role]); else { pathOn(s, pts, false, false); s.lineWidth = w; s.lineCap = 'round'; s.lineJoin = 'round'; s.strokeStyle = this.col[role]; s.stroke(); } },
  dotp(x, y, r, role, o = {}) { this.fill(circPts(x, y, r, r, 24), role, { lw: o.lw ?? 0 }); },
};

const CUTCOL = { body: 'cream', dark: 'toner', accent: 'red', glass: 'glass', white: 'white', pupil: 'toner', tongue: 'red', tyre: 'toner', hub: 'grey', pink: 'pink', sky: 'sky', ochre: 'ochre', green: 'green', road: 'road', grey: 'grey', cream: 'cream', red: 'red', toner: 'toner' };
const CutPen = {
  name: 'cut', ctxs: () => [s], jig: 0,
  fill(pts, role, o = {}) {
    // scissor cut: subdivided, wobbled edges; the wobble is fixed per piece (cut once), the piece shivers on 12s
    const P = chisel(pts, (o.seed ?? 7) + 1000, o.amt ?? 5, o.seg ?? 34);
    const sh = o.shadow ?? 1, scale = s.getTransform().a / RS;
    s.save();
    if (sh) { s.shadowColor = 'rgba(28,20,12,.42)'; s.shadowBlur = 5 * RS * scale; s.shadowOffsetX = 5 * RS * scale * sh; s.shadowOffsetY = 6 * RS * scale * sh; }
    pathOn(s, P, o.smooth); s.fillStyle = '#f7f2e6'; s.lineJoin = 'round'; s.lineWidth = o.rim ?? 5; s.strokeStyle = '#f7f2e6'; if (o.rim !== 0) s.stroke(); s.fill();
    s.restore();
    pathOn(s, P, o.smooth); s.fillStyle = sheet(CUTCOL[role] || 'cream'); s.fill();
    if (o.edge !== 0) { s.lineWidth = o.edge ?? 2.4; s.strokeStyle = 'rgba(32,29,31,.5)'; s.lineJoin = 'round'; s.stroke(); }   // the copier's dark line round a cut edge
  },
  // marker / pencil lines drawn on the paper (features), a little wobbly
  line(pts, w, role = 'dark', o = {}) { const r = rng(o.seed ?? 3), P = pts.map(([x, y]) => [x + (r() - .5) * 2, y + (r() - .5) * 2]); pathOn(s, P, false, false); s.lineWidth = w; s.lineCap = 'round'; s.lineJoin = 'round'; s.strokeStyle = role === 'white' ? '#f5efe0' : role === 'accent' ? '#cf2a28' : '#1d1b1d'; s.stroke(); },
  dotp(x, y, r, role, o = {}) { if (o.flat) { s.beginPath(); s.arc(x, y, r, 0, TAU); s.fillStyle = role === 'white' ? '#f5efe0' : '#1d1b1d'; s.fill(); } else this.fill(circPts(x, y, r, r, 22), role, { ...o, seg: 999, amt: 2.5, rim: o.rim ?? 3, shadow: o.shadow ?? .5 }); },
};

// gouache palette (Real Thing): ochre, blue-grey wash, graphite grey, cream; red only on the plane
const GCOL = { body: '#e0a548', dark: '#55535a', accent: '#c8302c', glass: '#6f8290', white: '#f6f0e2', pupil: '#2a282c', tongue: '#c8302c', tyre: '#3c3a3c', hub: '#b8b0a2', sky: '#a6c0cb', pink: '#dba393', cream: '#efe5cf', grey: '#8d8a88', green: '#9da889' };
const FACE = new Set(['white', 'pupil', 'tongue']);
const GouachePen = {
  name: 'gouache', ctxs: () => [Gouache.sctx, Gouache.fctx, Gouache.ictx, Gouache.mctx],
  fill(pts, role, o = {}) {
    const S = Gouache.sctx, I = Gouache.ictx, M = Gouache.mctx, col = o.col || GCOL[role] || role;
    if (FACE.has(role) || o.ink) { pathOn(I, pts, o.smooth); I.fillStyle = col; I.fill(); }
    else {
      pathOn(S, pts, o.smooth); S.fillStyle = col; S.fill();
      // knock out any pencil already on the ink layer under this piece, so lines behind it don't show through
      if (o.knock !== false) { I.save(); I.globalCompositeOperation = 'destination-out'; pathOn(I, pts, o.smooth); I.fillStyle = '#000'; I.fill(); I.restore(); }
    }
    if (o.mask !== false) { pathOn(M, pts, o.smooth); M.fillStyle = o.maskCol || '#fff'; M.fill(); }
    if (o.pencil !== false) this.pencil(pts, o.smooth, true, o.seed ?? 5, o.pw ?? 2.8);
  },
  // the underdrawing: two wobbly graphite passes, slightly off the paint
  pencil(pts, smooth, closed, seed, w = 2.8, a = .78) {
    const I = Gouache.ictx;
    for (let pass = 0; pass < 2; pass++) {
      const r = rng(seed * 13 + pass), dx = (r() - .5) * 11, dy = (r() - .5) * 8;
      const P = pts.map(([x, y], i) => [x + dx + snoise(i * .7, seed + pass) * 2.2, y + dy + snoise(i * .7 + 9, seed + pass) * 2.2]);
      pathOn(I, P, smooth, closed); I.lineWidth = w * (pass ? .7 : 1); I.lineCap = 'round'; I.lineJoin = 'round'; I.strokeStyle = `rgba(58,54,52,${a * (pass ? .6 : 1)})`; I.stroke();
    }
  },
  line(pts, w, role = 'dark', o = {}) {
    if (o.pencilOnly) { this.pencil(pts, false, false, o.seed ?? 4, w * .5); return; }
    const g = FACE.has(role) || o.ink ? Gouache.ictx : Gouache.sctx;
    pathOn(g, pts, false, false); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = o.col || GCOL[role] || role; g.stroke();
    if (o.pencil !== false && !o.ink) this.pencil(pts, false, false, o.seed ?? 4, 2);
  },
  dotp(x, y, r, role, o = {}) { this.fill(circPts(x, y, r, r, 24), role, { ...o, smooth: false }); },
};
let PEN = WoodPen;
