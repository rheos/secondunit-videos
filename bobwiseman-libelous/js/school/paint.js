// Painted backgrounds for the school look: gouache and watercolour on illustration board, NO outlines.
// Each background is painted once at load (seeded, deterministic) into its own canvas; the camera
// pans across it on the animation stand. Mark-making: soft-edged washes with a darker wet edge,
// opaque gouache shapes with irregular hand-cut edges, visible brush strokes inside every shape,
// dry-brush streaks, and the board's paper grain over everything.

let PAPER_TILE = null;
function paperTile() {
  if (PAPER_TILE) return PAPER_TILE;
  const s = 512, c = mkCanvas(s, s), g = c.getContext('2d'), d = g.createImageData(s, s), R = mulberry(4242);
  // value noise at two scales + fibres
  const lat = (cell) => { const n = Math.ceil(s / cell) + 1, L = []; for (let i = 0; i < n * n; i++) L.push(R()); return (x, y) => { const fx = x / cell, fy = y / cell, ix = Math.floor(fx), iy = Math.floor(fy), u = smooth(fx - ix), v = smooth(fy - iy); const at = (a, b) => L[((b % (n - 1)) * n) + (a % (n - 1))]; return lerp(lerp(at(ix, iy), at(ix + 1, iy), u), lerp(at(ix, iy + 1), at(ix + 1, iy + 1), u), v); }; };
  const a = lat(4), b = lat(16), c2 = lat(64);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const v = 200 + (a(x, y) - .5) * 40 + (b(x, y) - .5) * 26 + (c2(x, y) - .5) * 18 + (R() - .5) * 14;
    const i = (y * s + x) * 4; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  g.lineCap = 'round';
  for (let k = 0; k < 500; k++) { const x = R() * s, y = R() * s, an = R() * TAU, l = 4 + R() * 14; g.strokeStyle = R() < .5 ? 'rgba(255,255,255,.35)' : 'rgba(120,110,100,.25)'; g.lineWidth = .6 + R(); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(an) * l / 2 + (R() - .5) * 4, y + Math.sin(an) * l / 2 + (R() - .5) * 4, x + Math.cos(an) * l, y + Math.sin(an) * l); g.stroke(); }
  PAPER_TILE = c; return c;
}
function paperOver(g, w, h, amt = .5) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = amt;
  g.fillStyle = g.createPattern(paperTile(), 'repeat'); g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'soft-light'; g.globalAlpha = amt * .8; g.fillRect(0, 0, w, h); g.restore();
}
function shade(hexc, k) { const c = hex(hexc); return k >= 0 ? mix(c, [255, 250, 235], k) : mix(c, [30, 20, 40], -k); }
// an irregular hand-painted edge: smooth outline + seeded wobble along the normal
function paintEdge(pts, seed, rough = 3, n = 8) {
  // few control points = a hand-cut straight-sided shape (densified, corners kept); more = a curve
  let P;
  if (pts.length <= 7) { P = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], k = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 14)); for (let j = 0; j < k; j++) P.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]); } }
  else P = crPath(pts, true, n);
  return P.map((p, i) => { const q = P[(i + 1) % P.length], r = P[(i - 1 + P.length) % P.length]; let tx = q[0] - r[0], ty = q[1] - r[1]; const tl = Math.hypot(tx, ty) || 1; const d = (n1(seed, i * .35) * .7 + (rnd(seed, i) - .5) * .6) * rough; return [p[0] - ty / tl * d, p[1] + tx / tl * d]; });
}
function pathOf(g, P) { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) g.lineTo(P[i][0], P[i][1]); g.closePath(); }
// opaque gouache shape: flat colour, brush strokes inside, a slightly darker wet edge. o: {dir, strokes, var, edge, rough, sw}
function gouache(g, pts, col, seed, o = {}) {
  const P = paintEdge(pts, seed, o.rough != null ? o.rough : 3, o.n || 8);
  const R = mulberry(seed * 7 + 3);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of P) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
  const base = hex(col);
  g.save();
  pathOf(g, P); g.fillStyle = col; g.fill();
  g.clip();
  const area = (x1 - x0) * (y1 - y0), N = o.strokes != null ? o.strokes : Math.min(900, Math.max(14, area / 1800));
  const dir = o.dir != null ? o.dir : 0, sw = o.sw || Math.max(6, Math.min(34, Math.sqrt(area) / 14)), vr = o.var != null ? o.var : .09;
  g.lineCap = 'round';
  for (let k = 0; k < N; k++) {
    const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), a = dir + (R() - .5) * .5, l = sw * (2 + R() * 5);
    const v = (R() - .5) * 2 * vr; const c = v >= 0 ? mix(base, [255, 248, 230], v) : mix(base, [20, 15, 35], -v);
    g.strokeStyle = rgb(c, .18 + R() * .22); g.lineWidth = sw * (.5 + R() * .8);
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l / 2 + (R() - .5) * sw, y + Math.sin(a) * l / 2 + (R() - .5) * sw, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  // wet edge: pigment collects at the rim
  if (o.edge !== 0) { pathOf(g, P); g.strokeStyle = rgb(mix(base, [25, 15, 35], o.edge || .16), .55); g.lineWidth = o.edgeW || 5; g.filter = 'blur(1.5px)'; g.stroke(); g.filter = 'none'; }
  g.restore();
}
// soft watercolour wash: no hard edge, layered transparent passes
function softWash(g, pts, col, seed, alpha = .5, blur = 10) {
  g.save(); g.filter = `blur(${blur}px)`; g.globalAlpha = alpha; pathOf(g, paintEdge(pts, seed, 8)); g.fillStyle = col; g.fill(); g.restore();
}
function cloudPaint(g, cx, cy, s, seed) {
  const R = mulberry(seed);
  const blobs = []; const n = 5 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) { const u = i / (n - 1) - .5; blobs.push([cx + u * s * 2.1 + (R() - .5) * s * .2, cy - Math.cos(u * Math.PI) * s * .45 + (R() - .5) * s * .15, s * (.38 + Math.cos(u * Math.PI) * .32)]); }
  // underside shadow, then the white body, then a few dry highlights
  for (const [x, y, r] of blobs) gouache(g, ellPts(x + 6, y + r * .25, r * 1.02, r * .8, 9), '#c9dbe6', seed + x, { rough: 2.5, strokes: 10, var: .05, edge: .05 });
  for (const [x, y, r] of blobs) gouache(g, ellPts(x, y, r, r * .78, 9), '#fbf8ef', seed + y, { rough: 2.5, strokes: 12, var: .04, edge: .04 });
}
function skyPaint(g, x, y, w, h, top, bot, seed) {
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, top); gr.addColorStop(1, bot);
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  // horizontal wash strokes
  const R = mulberry(seed); g.lineCap = 'round';
  for (let k = 0; k < w * h / 9000; k++) {
    const px = x + R() * w, py = y + R() * h, u = (py - y) / h, c = mix(hex(top), hex(bot), u), v = (R() - .5) * .14;
    g.strokeStyle = rgb(v > 0 ? mix(c, [255, 255, 255], v) : mix(c, [20, 40, 90], -v), .2); g.lineWidth = 14 + R() * 30;
    g.beginPath(); g.moveTo(px, py); g.lineTo(px + 80 + R() * 220, py + (R() - .5) * 8); g.stroke();
  }
}
// dry-brush grass tufts along a ground line
function tufts(g, x0, x1, y, col, seed, dens = .03) {
  const R = mulberry(seed); g.lineCap = 'round';
  for (let k = 0; k < (x1 - x0) * dens; k++) {
    const x = x0 + R() * (x1 - x0), yy = y + R() * 40, h = 10 + R() * 22;
    g.strokeStyle = rgb(mix(hex(col), [20, 40, 20], R() * .3), .7); g.lineWidth = 3 + R() * 3;
    for (let j = -1; j <= 1; j++) { g.beginPath(); g.moveTo(x + j * 5, yy); g.quadraticCurveTo(x + j * 8, yy - h * .6, x + j * 12 + (R() - .5) * 6, yy - h); g.stroke(); }
  }
}

// ---------- the backgrounds ----------
const BG = {};
// The street: ink yard, the drain, the publishing house, and the tall sky above (camera tilts up it).
const STREET = { w: 5200, h: 2560, horizon: 1830, ground: 2150 };
function paintStreet() {
  const c = mkCanvas(STREET.w, STREET.h), g = c.getContext('2d');
  skyPaint(g, 0, 0, STREET.w, STREET.horizon + 40, '#2f6db3', '#b6dbe8', 11);
  // high clouds (seen on the tilt up) and low clouds (seen in the street framing)
  const R = mulberry(12);
  for (let k = 0; k < 16; k++) cloudPaint(g, 2500 + R() * 2600, 200 + R() * 1100, 70 + R() * 90, 100 + k);
  for (let k = 0; k < 9; k++) cloudPaint(g, 150 + k * 520 + R() * 200, 1480 + R() * 140, 50 + R() * 40, 200 + k);
  // far hills, two rows
  const hill = (y, amp, col, seed) => { const pts = [[-50, STREET.horizon + 120]]; for (let x = -50; x <= STREET.w + 50; x += 260) pts.push([x, y - Math.abs(Math.sin(x * .0021 + seed)) * amp - rnd(seed, x) * amp * .3]); pts.push([STREET.w + 50, STREET.horizon + 120]); gouache(g, pts, col, seed, { rough: 4, dir: 0, var: .07 }); };
  hill(STREET.horizon - 20, 150, '#86b9a6', 31); hill(STREET.horizon + 10, 90, '#5f9d7c', 32);
  // ground
  gouache(g, [[-40, STREET.horizon], [STREET.w + 40, STREET.horizon], [STREET.w + 40, STREET.h + 40], [-40, STREET.h + 40]], '#d8b46c', 33, { dir: 0, rough: 0, var: .08, edge: 0 });
  // the road / path band, lighter
  gouache(g, [[-40, 2080], [STREET.w + 40, 2060], [STREET.w + 40, 2330], [-40, 2350]], '#e6cf96', 34, { dir: 0, rough: 6, var: .06 });
  tufts(g, 0, STREET.w, STREET.horizon + 10, '#6d9c48', 35, .05);
  tufts(g, 0, STREET.w, 2370, '#7aa850', 36, .03);
  // yard fence (x 0-1900): planks, painted, no outlines
  for (let x = -20; x < 1880; x += 74) {
    const hgt = 250 + rnd(37, x) * 30;
    gouache(g, [[x, 2010 - hgt], [x + 34, 2010 - hgt - 18], [x + 68, 2010 - hgt], [x + 68, 2012], [x, 2012]], '#b97a45', 40 + x, { dir: Math.PI / 2, rough: 2, var: .1 });
  }
  gouache(g, [[-20, 1840], [1880, 1832], [1880, 1866], [-20, 1874]], '#9c6538', 41, { rough: 2, dir: 0 });
  gouache(g, [[-20, 1940], [1880, 1934], [1880, 1966], [-20, 1972]], '#9c6538', 42, { rough: 2, dir: 0 });
  // barrel shadows on the ground
  for (const b of YARD_BARRELS) softWash(g, ellPts(b.x + 14, b.y + 6, b.s * 105, b.s * 24, 10), '#8c6a3a', 50 + b.x, .55, 6);
  // the drain area: cobbles
  const R2 = mulberry(55);
  for (let k = 0; k < 120; k++) { const x = 1950 + R2() * 750, y = 2090 + R2() * 260; gouache(g, ellPts(x, y, 26 + R2() * 18, 12 + R2() * 6, 8), R2() < .5 ? '#cdb487' : '#d9c39a', 60 + k, { rough: 1.5, strokes: 3, edge: .1, edgeW: 3 }); }
  softWash(g, ellPts(DRAIN.x, DRAIN.y + 8, 190, 44, 12), '#6e5a3a', 61, .5, 8);
  // the street beyond: two background houses, a tree, a lamp post (painted, flat, muted)
  const house = (x, w, hgt, wall, roof, seed) => {
    gouache(g, [[x, STREET.ground - hgt], [x + w, STREET.ground - hgt], [x + w, STREET.ground], [x, STREET.ground]], wall, seed, { dir: Math.PI / 2, rough: 2.5 });
    gouache(g, [[x - 30, STREET.ground - hgt + 4], [x + w / 2, STREET.ground - hgt - w * .42], [x + w + 30, STREET.ground - hgt + 4]], roof, seed + 1, { rough: 2.5, dir: .3 });
    for (let wy = 0; wy < 2; wy++) for (let wx = 0; wx < 2; wx++) gouache(g, rrPts(x + w * .18 + wx * w * .4, STREET.ground - hgt + 50 + wy * hgt * .4, w * .24, hgt * .2, 6), '#3e5f7a', seed + 5 + wx + wy * 2, { rough: 1.5, strokes: 6 });
  };
  house(2650, 330, 420, '#c98f86', '#7d4a52', 70);
  house(4720, 300, 380, '#a9b98a', '#5a6b4a', 71);
  house(5080, 260, 300, '#9fb6cf', '#4a5a7a', 74);
  // tree
  gouache(g, [[3075, STREET.ground], [3090, 1880], [3110, 1880], [3127, STREET.ground]], '#7a5232', 72, { rough: 2, dir: Math.PI / 2 });
  for (let k = 0; k < 6; k++) gouache(g, ellPts(3100 + Math.cos(k) * 70, 1800 + Math.sin(k * 1.7) * 50, 95, 80, 9), k % 2 ? '#4f8f4a' : '#62a453', 73 + k, { rough: 4, dir: -.6 });
  // lamp post
  gouache(g, [[4455, STREET.ground], [4460, 1760], [4472, 1760], [4477, STREET.ground]], '#3d3b4a', 79, { rough: 1, strokes: 4 });
  gouache(g, ellPts(4466, 1748, 26, 22, 8), '#f1d27a', 80, { rough: 1, strokes: 6 });
  paperOver(g, STREET.w, STREET.h, .45);
  BG.street = c;
}

// The classroom: a mustard wall, a chalkboard, a portrait of the king, the teacher's desk.
const ROOM = { deskTop: 652, deskX0: 380, deskX1: 1180 };
function paintClassroom() {
  const c = mkCanvas(2080, H), g = c.getContext('2d');
  gouache(g, [[-20, -20], [2100, -20], [2100, 700], [-20, 700]], '#e4b45a', 90, { rough: 0, dir: Math.PI / 2, var: .07, edge: 0 });
  gouache(g, [[-20, 640], [2100, 640], [2100, 900], [-20, 900]], '#3f8e86', 91, { rough: 2, dir: 0, var: .07 });
  gouache(g, [[-20, 628], [2100, 628], [2100, 650], [-20, 650]], '#2f6d66', 92, { rough: 1.5, dir: 0 });
  gouache(g, [[-20, 880], [2100, 880], [2100, H + 20], [-20, H + 20]], '#9a6640', 93, { rough: 2, dir: 0, var: .1 });
  // chalkboard in its wooden frame
  gouache(g, rrPts(150, 92, 1130, 452, 10), '#9b6a3e', 94, { rough: 2, dir: 0 });
  gouache(g, rrPts(178, 118, 1074, 398, 6), '#2f5a4a', 95, { rough: 2, dir: .1, var: .1 });
  // chalk smudges and chalk doodles (no words): an apple, a sun, arrows
  g.save(); g.filter = 'blur(6px)'; g.globalAlpha = .18; g.fillStyle = '#dfe8de';
  for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(260 + k * 140, 230 + Math.sin(k) * 80, 120, 40, .1, 0, TAU); g.fill(); }
  g.restore();
  const chalk = (pts, w, seed) => { g.save(); g.globalAlpha = .62; g.strokeStyle = '#eef2e6'; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; const P = crPath(pts, false, 6); g.beginPath(); P.forEach((p, i) => { const q = [p[0] + (rnd(seed, i) - .5) * 2, p[1] + (rnd(seed, i, 1) - .5) * 2]; i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke(); g.restore(); };
  chalk(crPath(ellPts(330, 300, 70, 64, 9), true, 2).concat([[330, 236]]), 6, 1); chalk([[330, 236], [338, 210], [352, 196]], 6, 2); chalk([[340, 222], [372, 206], [388, 222], [350, 230]], 5, 3);
  chalk(crPath(ellPts(1040, 230, 50, 50, 9), true, 2), 6, 4);
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; chalk([[1040 + Math.cos(a) * 66, 230 + Math.sin(a) * 66], [1040 + Math.cos(a) * 92, 230 + Math.sin(a) * 92]], 5, 5 + k); }
  chalk([[520, 420], [640, 380], [760, 410]], 6, 20); chalk([[735, 392], [760, 410], [738, 428]], 6, 21);
  gouache(g, [[170, 516], [1262, 516], [1262, 538], [170, 538]], '#86593a', 96, { rough: 1.5, dir: 0 });
  // the king's portrait, gilt frame (the king peeks in once, as a painting)
  gouache(g, rrPts(1440, 86, 300, 360, 14), '#c9932c', 97, { rough: 2, dir: .5, var: .14 });
  gouache(g, rrPts(1470, 116, 240, 300, 6), '#5c4a72', 98, { rough: 1.5, dir: .2, var: .1 });
  gouache(g, ellPts(1590, 400, 120, 90, 10), '#8c2f45', 99, { rough: 2 });          // robe
  gouache(g, ellPts(1590, 336, 28, 22, 8), '#f1ece0', 100, { rough: 1.5 });         // ermine collar
  gouache(g, ellPts(1590, 262, 62, 66, 10), '#e7ad86', 101, { rough: 1.5 });        // face
  gouache(g, ellPts(1560, 254, 9, 7, 6), '#3a2a2a', 102, { rough: .5, strokes: 1 }); gouache(g, ellPts(1618, 254, 9, 7, 6), '#3a2a2a', 103, { rough: .5, strokes: 1 });
  gouache(g, [[1562, 290], [1590, 298], [1620, 288], [1612, 296], [1590, 306], [1568, 298]], '#7b3a3a', 104, { rough: .8, strokes: 2 });
  gouache(g, [[1536, 214], [1546, 162], [1568, 196], [1590, 152], [1612, 196], [1634, 162], [1644, 214]], '#f2c230', 105, { rough: 1.2, var: .12 });
  // the teacher's desk
  gouache(g, [[ROOM.deskX0 - 20, ROOM.deskTop - 6], [ROOM.deskX1 + 20, ROOM.deskTop - 6], [ROOM.deskX1 + 20, ROOM.deskTop + 26], [ROOM.deskX0 - 20, ROOM.deskTop + 26]], '#7b4a2a', 106, { rough: 1.5, dir: 0 });
  gouache(g, [[ROOM.deskX0, ROOM.deskTop + 26], [ROOM.deskX1, ROOM.deskTop + 26], [ROOM.deskX1, H + 20], [ROOM.deskX0, H + 20]], '#a8693a', 107, { rough: 2, dir: Math.PI / 2, var: .1 });
  gouache(g, rrPts(ROOM.deskX0 + 50, ROOM.deskTop + 70, ROOM.deskX1 - ROOM.deskX0 - 100, 150, 10), '#95592f', 108, { rough: 1.5, dir: 0 });
  softWash(g, [[ROOM.deskX0 - 60, 905], [ROOM.deskX1 + 60, 905], [ROOM.deskX1 + 80, 960], [ROOM.deskX0 - 80, 960]], '#4a2e1c', 109, .45, 12);
  paperOver(g, 2080, H, .45);
  BG.room = c;
}

// Inside the book: an open picture-book spread filling the frame.
function paintPage() {
  const c = mkCanvas(W, H), g = c.getContext('2d');
  gouache(g, [[-20, -20], [W + 20, -20], [W + 20, H + 20], [-20, H + 20]], '#7a4a2c', 120, { rough: 0, dir: 0, edge: 0 });
  gouache(g, [[40, 70], [940, 40], [960, 60], [980, 40], [1880, 70], [1890, 1060], [980, 1040], [960, 1060], [940, 1040], [30, 1060]], '#f1e3bd', 121, { rough: 2, dir: 0, var: .05, edge: .08 });
  // gutter shadow
  softWash(g, [[900, 50], [1020, 50], [1020, 1060], [900, 1060]], '#b29a6a', 122, .5, 26);
  softWash(g, [[945, 50], [975, 50], [975, 1060], [945, 1060]], '#8a7450', 123, .5, 8);
  // little painted page decorations: a soft green ground for the burger, a blue wash for the drinks
  softWash(g, ellPts(470, 640, 330, 70, 12), '#a8cf86', 124, .55, 10);
  softWash(g, ellPts(1450, 640, 330, 70, 12), '#9cc6dc', 125, .55, 10);
  paperOver(g, W, H, .5);
  BG.page = c;
}

// The lunch counter: a teal wall with portholes, hanging lamps, the counter top and its front.
const CTR = { top: 600, front: 660 };
function paintCounter() {
  const c = mkCanvas(2100, H), g = c.getContext('2d');
  gouache(g, [[-20, -20], [2120, -20], [2120, 620], [-20, 620]], '#4f9aa0', 130, { rough: 0, dir: 0, var: .07, edge: 0 });
  gouache(g, [[-20, 300], [2120, 300], [2120, 360], [-20, 360]], '#e8762c', 131, { rough: 2, dir: 0 });
  gouache(g, [[-20, 372], [2120, 372], [2120, 398], [-20, 398]], '#e3a92a', 132, { rough: 2, dir: 0 });
  for (let k = 0; k < 4; k++) { const x = 220 + k * 520; gouache(g, ellPts(x, 170, 92, 92, 12), '#2e6f78', 133 + k, { rough: 2 }); gouache(g, ellPts(x, 170, 72, 72, 12), '#bfe2ec', 140 + k, { rough: 2 }); cloudPaint(g, x - 10, 186, 22, 150 + k); }
  for (let k = 0; k < 5; k++) { const x = 100 + k * 470; gouache(g, [[x - 3, -10], [x + 3, -10], [x + 3, 60], [x - 3, 60]], '#2a2a35', 160 + k, { rough: .5, strokes: 2 }); gouache(g, [[x - 60, 110], [x - 40, 64], [x, 54], [x + 40, 64], [x + 60, 110]], '#e3a92a', 170 + k, { rough: 1.5 }); softWash(g, ellPts(x, 150, 120, 40, 10), '#fff2b8', 180 + k, .35, 18); }
  // counter top and front
  gouache(g, [[-20, CTR.top], [2120, CTR.top], [2120, CTR.front], [-20, CTR.front]], '#efe0b8', 190, { rough: 1.5, dir: 0, var: .05 });
  gouache(g, [[-20, CTR.front], [2120, CTR.front], [2120, CTR.front + 18], [-20, CTR.front + 18]], '#b9893f', 191, { rough: 1, dir: 0 });
  gouache(g, [[-20, CTR.front + 18], [2120, CTR.front + 18], [2120, H + 20], [-20, H + 20]], '#e3a92a', 192, { rough: 0, dir: Math.PI / 2, var: .08, edge: 0 });
  for (let x = 40; x < 2100; x += 150) gouache(g, [[x, CTR.front + 40], [x + 70, CTR.front + 40], [x + 70, H + 20], [x, H + 20]], '#d8962a', 193 + x, { rough: 2, dir: Math.PI / 2 });
  paperOver(g, 2100, H, .45);
  BG.counter = c;
}
