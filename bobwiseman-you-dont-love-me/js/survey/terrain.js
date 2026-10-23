// The survey sheet's terrain: a height field (metres) over the sheet (world units), contoured once at load.
// Sheet = 4000 x 2600 world units; the map face sits inside the neatline at 150 units.
const SW = 4000, SH = 2600, NL = 150;                 // sheet size, neatline inset
const MX0 = NL, MY0 = NL, MX1 = SW - NL, MY1 = SH - NL;
const GS = 5;                                          // contouring grid step (world units)
const GX = Math.round((MX1 - MX0) / GS) + 1, GY = Math.round((MY1 - MY0) / GS) + 1;

const DAISY = [2300, 1500];
const COMPASS = [3460, 1020];
const PEAKS = [ // [x, y, amplitude, sigma, confession delay]
  [1010, 900, 1650, 200, .32],
  [1500, 690, 2250, 255, 0],
  [2030, 850, 1500, 190, .62],
];
const RIVER_RAW = [[1150, 1010], [1085, 1200], [1010, 1390], [1120, 1600], [1460, 1700], [1880, 1850], [2300, 1975], [2700, 2075], [3075, 2200]];
const PATH_RAW = [[430, 2300], [760, 1960], [1100, 1560], [1330, 1345], [1370, 1195], [1600, 1135], [1900, 1160], [2150, 1235], [2500, 1255], [2750, 1240], [2935, 1278]];
const WOODS = [[700, 1960, 260], [1980, 2200, 210], [2560, 860, 190], [560, 690, 170], [2620, 1700, 150]];

function vn(s, x, y) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return lerp(lerp(rnd(i, j, s), rnd(i + 1, j, s), u), lerp(rnd(i, j + 1, s), rnd(i + 1, j + 1, s), u), v) * 2 - 1;
}
function fbm(s, x, y, o = 4) { let a = 0, f = 1, w = .5; for (let k = 0; k < o; k++) { a += vn(s + k * 13, x * f, y * f) * w; f *= 2.03; w *= .5; } return a; }
function chaikin(pts, n = 2, closed = false) {
  for (let k = 0; k < n; k++) {
    const o = closed ? [] : [pts[0]];
    const m = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; o.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); }
    if (!closed) o.push(pts[pts.length - 1]);
    pts = o;
  }
  return pts;
}
const RIVER = chaikin(RIVER_RAW, 4);
const FOOTPATH = chaikin(PATH_RAW, 3);
function coastX(y) { return 3050 + 70 * n1(7, y / 260) + 40 * n1(8, y / 90) - 90 * Math.exp(-((y - 2250) ** 2) / (2 * 220 ** 2)); }
function cliffness(y) { return smooth((y - 900) / 120) * smooth((1760 - y) / 120); }
function distPoly(x, y, P) {
  let best = 1e9;
  for (let i = 0; i + 1 < P.length; i++) {
    const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = bx - ax, dy = by - ay;
    const u = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)), px = ax + u * dx - x, py = ay + u * dy - y;
    const d = px * px + py * py; if (d < best) best = d;
  }
  return Math.sqrt(best);
}
function landHeight(x, y) {
  let h = 260 + 190 * fbm(3, x / 520, y / 520) + 330 * Math.exp(-((x - 2680) ** 2) / (620 ** 2) - ((y - 1300) ** 2) / (520 ** 2));
  for (const [px, py, a, s] of PEAKS) {
    const r2 = (x - px) ** 2 + (y - py) ** 2;
    h += a * Math.exp(-r2 / (2 * s * s)) * (1 + .12 * fbm(11, x / 160, y / 160, 3));
  }
  // ridges between the summits, and broken spurs
  const rm = Math.exp(-((x - 1520) ** 2) / (720 ** 2) - ((y - 800) ** 2) / (330 ** 2));
  h += rm * 420 * (1 - Math.abs(fbm(21, x / 240, y / 240, 3))) ** 2;
  // the river valley
  if (x > 900 && x < 3150 && y > 950) {
    const dr = distPoly(x, y, RIVER_RAW);
    h -= 150 * Math.exp(-((dr / 80) ** 2)) + 110 * Math.exp(-((dr / 280) ** 2));
  }
  return Math.max(h, 20);
}
function heightAt(x, y) {
  const d = coastX(y) - x;
  if (d < 0) return d * .55 - 4;
  const c = cliffness(y), wid = lerp(380, 92, c), k = clamp(d / wid);
  return landHeight(x, y) * lerp(smooth(k), k, c);
}

// ---------- build ----------
const FIELD = new Float32Array(GX * GY);
function fieldAt(x, y) { // bilinear
  const fx = clamp((x - MX0) / GS, 0, GX - 1.001), fy = clamp((y - MY0) / GS, 0, GY - 1.001), i = fx | 0, j = fy | 0, u = fx - i, v = fy - j;
  const a = FIELD[j * GX + i], b = FIELD[j * GX + i + 1], c = FIELD[(j + 1) * GX + i], d = FIELD[(j + 1) * GX + i + 1];
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function gradAt(x, y) { const e = 6; return [(fieldAt(x + e, y) - fieldAt(x - e, y)) / (2 * e), (fieldAt(x, y + e) - fieldAt(x, y - e)) / (2 * e)]; }

// Marching squares + chain linking. Returns [{pts: Float32Array (x,y,...), closed, bb}]
function contourLevel(L) {
  const keyPt = new Map(); const segA = [], segB = [];
  const ept = (key) => {
    if (keyPt.has(key)) return;
    const e = key >> 1, i = e % GX, j = (e / GX) | 0;
    const a = FIELD[j * GX + i];
    if ((key & 1) === 0) { const b = FIELD[j * GX + i + 1], u = (L - a) / (b - a); keyPt.set(key, [MX0 + (i + u) * GS, MY0 + j * GS]); }
    else { const b = FIELD[(j + 1) * GX + i], u = (L - a) / (b - a); keyPt.set(key, [MX0 + i * GS, MY0 + (j + u) * GS]); }
  };
  for (let j = 0; j < GY - 1; j++) for (let i = 0; i < GX - 1; i++) {
    const a = FIELD[j * GX + i], b = FIELD[j * GX + i + 1], c = FIELD[(j + 1) * GX + i + 1], d = FIELD[(j + 1) * GX + i];
    const sa = a > L, sb = b > L, sc = c > L, sd = d > L;
    if (sa === sb && sb === sc && sc === sd) continue;
    const top = ((j * GX + i) << 1), right = ((j * GX + i + 1) << 1) | 1, bottom = (((j + 1) * GX + i) << 1), left = ((j * GX + i) << 1) | 1;
    const E = [];
    if (sa !== sb) E.push(top); if (sb !== sc) E.push(right); if (sd !== sc) E.push(bottom); if (sa !== sd) E.push(left);
    for (const k of E) ept(k);
    if (E.length === 2) { segA.push(E[0]); segB.push(E[1]); }
    else if (E.length === 4) {
      const sm = (a + b + c + d) / 4 > L;
      if (sa !== sm) { segA.push(top, right); segB.push(left, bottom); } else { segA.push(top, bottom); segB.push(right, left); }
    }
  }
  const adj = new Map(); const add = (k, s) => { const l = adj.get(k); if (l) l.push(s); else adj.set(k, [s]); };
  for (let s = 0; s < segA.length; s++) { add(segA[s], s); add(segB[s], s); }
  const used = new Uint8Array(segA.length), out = [];
  const other = (s, k) => segA[s] === k ? segB[s] : segA[s];
  const walk = (s0, k0) => { const keys = []; let s = s0, k = k0; while (true) { keys.push(k); const nl = adj.get(k); let nx = -1; for (const q of nl) if (!used[q]) { nx = q; break; } if (nx < 0) break; used[nx] = 1; k = other(nx, k); s = nx; } return keys; };
  for (let s = 0; s < segA.length; s++) {
    if (used[s]) continue; used[s] = 1;
    const fwd = walk(s, segB[s]), back = walk(s, segA[s]);
    const keys = back.reverse().concat(fwd);
    const closed = keys[0] === keys[keys.length - 1];
    let pts = keys.map((k) => keyPt.get(k));
    if (pts.length < 3) continue;
    if (closed) pts.pop();
    pts = chaikin(pts, 1, closed);
    const f = new Float32Array(pts.length * 2); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    pts.forEach(([x, y], q) => { f[q * 2] = x; f[q * 2 + 1] = y; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    out.push({ pts: f, closed, bb: [x0, y0, x1, y1] });
  }
  return out;
}

const T = { contours: [], sea: [], hach: null, trees: [], spots: [], peaks: [], coast: null, cliffTeeth: [] };
function buildTerrain() {
  for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) FIELD[j * GX + i] = heightAt(MX0 + i * GS, MY0 + j * GS);
  for (let L = 50; L <= 4200; L += 50) { const idx = L % 250 === 0; for (const c of contourLevel(L)) { c.lv = L; c.idx = idx; T.contours.push(c); } }
  for (const L of [-10, -28, -55, -95, -150]) for (const c of contourLevel(L)) { c.lv = L; T.sea.push(c); }
  // coastline polyline (land/sea boundary used for the sea fill)
  const cp = []; for (let y = MY0; y <= MY1; y += 6) cp.push(coastX(y), y); T.coast = new Float32Array(cp);
  // summits: field maximum near each peak centre
  PEAKS.forEach(([px, py, , , dl]) => {
    let best = -1, bx = px, by = py;
    for (let y = py - 90; y <= py + 90; y += GS) for (let x = px - 90; x <= px + 90; x += GS) { const h = fieldAt(x, y); if (h > best) { best = h; bx = x; by = y; } }
    T.peaks.push({ x: bx, y: by, h: best, dl });
  });
  // hachures: short strokes down the fall line where the ground is steep (cliff and high crags)
  const R = mulberry(4242), hs = [];
  for (let y = MY0 + 4; y < MY1 - 4; y += 7) for (let x = MX0 + 4; x < MX1 - 4; x += 7) {
    const px = x + (R() - .5) * 6, py = y + (R() - .5) * 6, h = fieldAt(px, py);
    if (h < 30) continue;
    const [gx, gy] = gradAt(px, py), sl = Math.hypot(gx, gy);
    const cliffy = cliffness(py) > .3 && coastX(py) - px < 130;
    const thr = cliffy ? 1.6 : 4.2;
    if (sl < thr || (!cliffy && h < 1000)) continue;
    if (R() > clamp((sl - thr) / 2.5) * (cliffy ? 1 : .3)) continue;
    const len = cliffy ? 5 + R() * 9 : 4 + Math.min(10, sl * 1.4) * R();
    const ux = -gx / sl, uy = -gy / sl;
    hs.push(px, py, px + ux * len + (R() - .5) * 1.5, py + uy * len + (R() - .5) * 1.5);
  }
  T.hach = new Float32Array(hs);
  // cliff teeth along the top edge (rock symbol)
  for (let y = 900; y <= 1770; y += 9) { const c = cliffness(y); if (c < .6) continue; const x = coastX(y) - lerp(380, 92, c) * .96; T.cliffTeeth.push([x, y, c]); }
  // woods: deciduous tree symbols, jittered, kept off water, steep ground and the river
  const RT = mulberry(77);
  for (const [cx, cy, r] of WOODS) for (let y = cy - r; y <= cy + r; y += 30) for (let x = cx - r; x <= cx + r; x += 30) {
    const px = x + (RT() - .5) * 22, py = y + (RT() - .5) * 22, dd = Math.hypot(px - cx, py - cy) / r + .25 * vn(55, px / 90, py / 90);
    if (dd > 1) continue;
    const h = fieldAt(px, py); if (h < 15) continue;
    const [gx, gy] = gradAt(px, py); if (Math.hypot(gx, gy) > 1.4) continue;
    if (distPoly(px, py, RIVER_RAW) < 45 || distPoly(px, py, PATH_RAW) < 25 || Math.hypot(px - DAISY[0], py - DAISY[1]) < 260) continue;
    T.trees.push([px, py, .8 + RT() * .45]);
  }
  // spot heights (revealed in a cascade after the summits confess)
  const RS = mulberry(919);
  let n = 0, tries = 0;
  while (n < 26 && tries++ < 4000) {
    const x = 260 + RS() * 2700, y = 260 + RS() * 2080, h = fieldAt(x, y);
    if (h < 60) continue;
    if (Math.hypot(x - DAISY[0], y - DAISY[1]) < 300) continue;
    if (T.spots.some((s) => Math.hypot(s.x - x, s.y - y) < 260)) continue;
    if (T.peaks.some((p) => Math.hypot(p.x - x, p.y - y) < 200)) continue;
    T.spots.push({ x, y, h, tt: B.confess + .55 + RS() * 1.6 }); n++;
  }
}
