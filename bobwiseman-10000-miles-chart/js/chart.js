// Warm isometric chart world, one chart: a town cutaway, a rocket, and a graph of how big your problems look from up there.
// Pure function of song seconds s. Lyrics come from work/cues.js (gitignored); every other word here is ours.
const W = 1280, H = 720; let X, C, PAPER;
const INK = '#4a3f34', RED = '#b5473c', CREAM = '#f8f3e9', TAN = '#ddd5bf', SOFT = '#8a7d6c';
const PAL = { wall: '#f1e9d8', floor: '#e9dfc8', wood: '#cdb083', stone: '#c0bbb0', road: '#b3afa5', lawn: '#d3dcb6', green: '#9dbb9f', mustard: '#dfc07a', brick: '#c07f70', blue: '#a3b5c8', roof: '#b07c6c', sky: '#d3dfe3', slab: '#d6d0c2', water: '#b5cad6', skin: '#ebc7a6', rug: '#d9a99a', tile: '#dbe2dc', plank: '#dcc7a0', sand: '#ecdcb9' };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function shade(hex, k) { const n = parseInt(hex.slice(1), 16), f = (v) => Math.round(clamp(v * k, 0, 255)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }

// ---- the climb: altitude in miles against song time
const ALT = [[16.9, 0], [18.1, 0.3], [20.4, 2], [21.3, 60], [26.9, 500], [27.8, 1000], [44.9, 2500], [47.8, 10000]];
function altAt(s) {
  if (s <= ALT[0][0]) return 0;
  for (let i = 1; i < ALT.length; i++) if (s < ALT[i][0]) {
    const [a, x] = ALT[i - 1], [b, y] = ALT[i], l0 = Math.log10(1 + x), l1 = Math.log10(1 + y);
    return Math.pow(10, lerp(l0, l1, ss(a, b, s))) - 1;
  }
  return 10000;
}
const lgOf = (a) => Math.log10(1 + a);
const zoomAt = (a) => Math.pow(10, -lgOf(a) * 0.55);
const sizeFrac = (a) => Math.pow(Math.max(0, 1 - lgOf(a) / 4.0), 1.6);

// ---- projection: world units, x down-right, y down-left, h up
let VIEW = { ax: 430, ay: 430, z: 1, yaw: 0 };
function proj(x, y, h = 0) {
  const c = Math.cos(VIEW.yaw), n = Math.sin(VIEW.yaw), rx = x * c - y * n, ry = x * n + y * c;
  return [VIEW.ax + (rx - ry) * 0.866 * VIEW.z, VIEW.ay + ((rx + ry) * 0.5 - h) * VIEW.z];
}
function depth(x, y, h = 0) { const c = Math.cos(VIEW.yaw), n = Math.sin(VIEW.yaw); return (x * c - y * n) + (x * n + y * c) + h * 0.5; }
function poly(pts, fill, ink = INK, lw = 0.7) {
  X.beginPath(); X.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) X.lineTo(pts[i][0], pts[i][1]); X.closePath();
  if (fill) { X.fillStyle = fill; X.fill(); }
  if (ink) { X.strokeStyle = ink; X.lineWidth = lw; X.lineJoin = 'round'; X.stroke(); }
}
// A box drawn by which faces turn toward the camera, so it survives the world turning.
function box(x0, y0, h0, x1, y1, h1, col, opt = {}) {
  const ink = VIEW.z < 0.14 ? null : (opt.ink === undefined ? INK : opt.ink), lw = VIEW.z < 0.4 ? 0.45 : 0.7;
  const c = Math.cos(VIEW.yaw), n = Math.sin(VIEW.yaw);
  const face = (nx, ny) => (nx * c - ny * n) + (nx * n + ny * c) > 1e-6;
  if (face(1, 0)) poly([proj(x1, y0, h0), proj(x1, y1, h0), proj(x1, y1, h1), proj(x1, y0, h1)], shade(col, 0.76), ink, lw);
  if (face(-1, 0)) poly([proj(x0, y0, h0), proj(x0, y1, h0), proj(x0, y1, h1), proj(x0, y0, h1)], shade(col, 0.76), ink, lw);
  if (face(0, 1)) poly([proj(x0, y1, h0), proj(x1, y1, h0), proj(x1, y1, h1), proj(x0, y1, h1)], shade(col, 0.88), ink, lw);
  if (face(0, -1)) poly([proj(x0, y0, h0), proj(x1, y0, h0), proj(x1, y0, h1), proj(x0, y0, h1)], shade(col, 0.88), ink, lw);
  poly([proj(x0, y0, h1), proj(x1, y0, h1), proj(x1, y1, h1), proj(x0, y1, h1)], col, ink, lw);
}
function queue(list, x, y, h, fn) { list.push({ d: depth(x, y, h), fn }); }
function flush(list) { list.sort((a, b) => a.d - b.d); for (const q of list) q.fn(); }

// ---- text
function text(str, x, y, size, font = 'KSans', col = INK, align = 'left', alpha = 1) {
  X.save(); X.globalAlpha *= alpha; X.font = `${size}px ${font}`; X.fillStyle = col; X.textAlign = align; X.textBaseline = 'alphabetic';
  if (font === 'KSerif') { X.letterSpacing = `${-size * 0.022}px`; X.strokeStyle = col; X.lineWidth = size * 0.022; X.lineJoin = 'round'; X.strokeText(str, x, y); }
  X.fillText(str, x, y); X.restore();
}

// ---- tiny people: two heads tall, a round head, a bell of a coat, no marionette strings
function person(x, y, h, o = {}) {
  const k = (o.k || 1) * Math.max(VIEW.z, 0.2), [px, py] = proj(x, y, h), coat = o.coat || PAL.mustard, step = o.step || 0, hair = o.hair || '#4c3a2c';
  X.save(); X.translate(px, py); X.scale(k, k);
  X.fillStyle = 'rgba(58,49,40,.18)'; X.beginPath(); X.ellipse(0, 0, 7, 3, 0, 0, 7); X.fill();
  X.strokeStyle = INK; X.lineWidth = 2.2; X.lineCap = 'round';
  X.beginPath(); X.moveTo(-2.5, -6); X.lineTo(-2.5 + step * 2, 0); X.moveTo(2.5, -6); X.lineTo(2.5 - step * 2, 0); X.stroke();
  X.lineWidth = 1.9; X.beginPath();
  const armL = o.armL ?? 0.4, armR = o.armR ?? 0.4;
  X.moveTo(-4.5, -15); X.lineTo(-4.5 - 4 * Math.cos(armL), -15 + 7 * Math.sin(armL)); X.moveTo(4.5, -15); X.lineTo(4.5 + 4 * Math.cos(armR), -15 + 7 * Math.sin(armR)); X.stroke();
  poly([[-3.6, -18], [3.6, -18], [6.2, -5], [-6.2, -5]], coat, INK, 0.9);
  X.fillStyle = PAL.skin; X.strokeStyle = INK; X.lineWidth = 0.9; X.beginPath(); X.arc(0, -23, 5.6, 0, 7); X.fill(); X.stroke();
  X.fillStyle = hair; X.beginPath(); X.arc(0, -24, 5.7, Math.PI, 0); X.fill();
  if (o.bun) { X.beginPath(); X.arc(0, -30, 2.3, 0, 7); X.fill(); }
  X.fillStyle = INK; X.fillRect(-2.4, -22.8, 1, 1.2); X.fillRect(1.4, -22.8, 1, 1.2);
  X.restore();
}

// ---- the five problems. Icons are held in screen scale against the world, swelling on the sung line.
function iconEnvelope(k) { poly([[-14, -9], [14, -9], [14, 9], [-14, 9]], '#f6efdf', INK, 1 / k); X.beginPath(); X.moveTo(-14, -9); X.lineTo(0, 2); X.lineTo(14, -9); X.strokeStyle = INK; X.lineWidth = 1 / k; X.stroke(); poly([[3, -2 + 2], [12, 2], [12, 7], [3, 7]], PAL.brick, INK, 0.7 / k); }
function iconTooth(k) { X.beginPath(); X.moveTo(-11, -9); X.bezierCurveTo(-6, -14, -2, -10, 0, -9); X.bezierCurveTo(2, -10, 6, -14, 11, -9); X.bezierCurveTo(13, -1, 9, 3, 8, 7); X.bezierCurveTo(7, 14, 3, 13, 2, 6); X.bezierCurveTo(1, 3, -1, 3, -2, 6); X.bezierCurveTo(-3, 13, -7, 14, -8, 7); X.bezierCurveTo(-9, 3, -13, -1, -11, -9); X.closePath(); X.fillStyle = '#fbf8ef'; X.fill(); X.strokeStyle = INK; X.lineWidth = 1 / k; X.stroke(); X.beginPath(); X.moveTo(5, -8); X.lineTo(2, -3); X.lineTo(6, -1); X.strokeStyle = RED; X.lineWidth = 1.2 / k; X.stroke(); }
function iconPhone(k, s) { const r = Math.sin(s * 22) * (s < 44 ? 1.4 : 0); X.save(); X.rotate(r * 0.05); poly([[-12, 8], [12, 8], [9, -3], [-9, -3]], PAL.brick, INK, 1 / k); X.beginPath(); X.moveTo(-14, -4); X.quadraticCurveTo(0, -13, 14, -4); X.lineTo(14, -1); X.lineTo(8, -1); X.lineTo(7, -4); X.quadraticCurveTo(0, -7, -7, -4); X.lineTo(-8, -1); X.lineTo(-14, -1); X.closePath(); X.fillStyle = shade(PAL.brick, 0.86); X.fill(); X.strokeStyle = INK; X.lineWidth = 1 / k; X.stroke(); X.beginPath(); X.arc(0, 3, 3.4, 0, 7); X.fillStyle = CREAM; X.fill(); X.stroke(); X.restore(); X.strokeStyle = RED; X.lineWidth = 1 / k; for (const q of [-1, 1]) { X.beginPath(); X.arc(q * 16, -8, 3 + Math.abs(r) * 1.2, q > 0 ? -1 : 2.2, q > 0 ? 0.6 : 3.9); X.stroke(); } }
function iconCloud(k, s) { X.beginPath(); X.arc(-7, 1, 7, 0, 7); X.arc(1, -3, 9, 0, 7); X.arc(9, 2, 6, 0, 7); X.fillStyle = PAL.blue; X.fill(); X.strokeStyle = INK; X.lineWidth = 1 / k; X.beginPath(); X.arc(-7, 1, 7, 1.6, 5); X.arc(1, -3, 9, 3.6, 6); X.arc(9, 2, 6, 4.6, 7.7); X.closePath(); X.fill(); X.stroke(); X.strokeStyle = shade(PAL.blue, 0.8); X.lineWidth = 1.2 / k; for (let i = 0; i < 5; i++) { const q = (s * 1.6 + i * 0.37) % 1, xx = -10 + i * 5; X.beginPath(); X.moveTo(xx, 8 + q * 12); X.lineTo(xx - 1, 11 + q * 12); X.stroke(); } }
function iconSmoke(k, s) { X.fillStyle = '#b6b0a6'; X.strokeStyle = INK; X.lineWidth = 0.9 / k; for (let i = 0; i < 3; i++) { const q = ((s * 0.5 + i / 3) % 1), rr = 3 + q * 8; X.globalAlpha = 1 - q * 0.8; X.beginPath(); X.arc(q * 7 - 2, 6 - q * 22, rr, 0, 7); X.fill(); X.stroke(); } X.globalAlpha = 1; }
const PROBLEMS = [
  { key: 'rent', title: 'THE RENT', sub: 'due friday', at: [-135, -125, 96], lx: 505, ly: 150, icon: iconEnvelope, cue: 13.8, kill: 55.3 },
  { key: 'tooth', title: 'THE TOOTH', sub: 'upper left', at: [0, -125, 96], lx: 690, ly: 216, icon: iconTooth, cue: 14.2, kill: 55.9 },
  { key: 'ex', title: 'THE EX', sub: 'still calling', at: [135, -125, 96], lx: 700, ly: 522, icon: iconPhone, cue: 14.6, kill: 56.5 },
  { key: 'roof', title: 'THE ROOF', sub: 'one cloud, ours', at: [-135, 12, 104], lx: 48, ly: 248, icon: iconCloud, cue: 15.1, kill: 57.1 },
  { key: 'car', title: 'THE CAR', sub: "won't start", at: [-112, 165, 34], lx: 48, ly: 586, icon: iconSmoke, cue: 15.6, kill: 57.7 },
];

// ---- world pieces
function tree(L, x, y, k = 1) {
  queue(L, x, y, 8, () => { const a = proj(x, y, 0), b = proj(x, y, 26 * k), r = 13 * k * VIEW.z;
    X.strokeStyle = INK; X.lineWidth = Math.max(0.6, 2.4 * VIEW.z); X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); X.stroke();
    X.beginPath(); X.arc(b[0], b[1] - r * 0.6, r, 0, 7); X.fillStyle = PAL.green; X.fill(); if (VIEW.z > 0.14) { X.strokeStyle = INK; X.lineWidth = 0.9; X.stroke(); } });
}
function car(L, x, y, col, open) {
  queue(L, x, y, 6, () => {
    if (VIEW.z > 0.3) for (const wx of [x - 14, x + 14]) { const q = proj(wx, y + 11, 3.5); X.beginPath(); X.ellipse(q[0], q[1], 4 * VIEW.z, 4.4 * VIEW.z, 0, 0, 7); X.fillStyle = '#5a5148'; X.fill(); }
    box(x - 25, y - 11, 4, x + 25, y + 11, 12, col); box(x - 13, y - 10, 12, x + 11, y + 10, 21, PAL.sky); box(x - 14, y - 11, 21, x + 12, y + 11, 23, col);
    if (open) poly([proj(x + 14, y - 11, 12), proj(x + 14, y + 11, 12), proj(x + 21, y + 11, 25), proj(x + 21, y - 11, 25)], col, INK, 0.6); });
}
function shade2(hex) { const n = parseInt(hex.slice(1), 16), f = (v) => Math.round(clamp(v * 1.12, 0, 255)).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); }

const TOWN = []; (function () { for (let i = 0; i < 150; i++) { const a = hash(i) * 6.283, r = 300 + Math.sqrt(hash(i + 400)) * 840, x = Math.cos(a) * r, y = Math.sin(a) * r; TOWN.push({ x, y, w: 26 + hash(i + 50) * 40, d: 26 + hash(i + 90) * 40, h: 18 + hash(i + 130) * 46, c: [PAL.wall, PAL.floor, PAL.brick, PAL.wood, PAL.stone, PAL.green][Math.floor(hash(i + 170) * 6)], tree: hash(i + 210) < 0.3 }); } })();

function town(s, a) {
  const k = ss(9, 20, a); if (k <= 0) return;
  X.save(); X.globalAlpha *= k;
  const ring = [], bot = []; for (let i = 0; i < 72; i++) { const th = i / 72 * 6.283; ring.push(proj(Math.cos(th) * 1200, Math.sin(th) * 1200, 0)); bot.push(proj(Math.cos(th) * 1200, Math.sin(th) * 1200, -70)); }
  poly(bot, shade(PAL.slab, 0.74), VIEW.z > 0.03 ? INK : null); poly(ring, PAL.lawn, VIEW.z > 0.03 ? INK : null);
  X.strokeStyle = PAL.road; X.lineWidth = Math.max(1, 70 * VIEW.z);
  for (const [p, q] of [[[-1150, 165], [1150, 165]], [[260, -1150], [260, 1150]]]) { const u = proj(p[0], p[1]), v = proj(q[0], q[1]); X.beginPath(); X.moveTo(u[0], u[1]); X.lineTo(v[0], v[1]); X.stroke(); }
  const w0 = proj(-1000, -620), w1 = proj(-300, -880), w2 = proj(100, -1050); X.strokeStyle = PAL.water; X.lineWidth = Math.max(1, 46 * VIEW.z); X.beginPath(); X.moveTo(w0[0], w0[1]); X.quadraticCurveTo(w1[0], w1[1], w2[0], w2[1]); X.stroke();
  const L = []; for (const b of TOWN) { if (b.tree) tree(L, b.x, b.y, 1.6); else queue(L, b.x, b.y, 0, () => box(b.x - b.w / 2, b.y - b.d / 2, 0, b.x + b.w / 2, b.y + b.d / 2, b.h, b.c)); }
  flush(L); X.restore();
}

// flat things on a floor, and small dressings for rooms and yards
function flat(x0, y0, x1, y1, col, h = 3.1, ink = INK) { poly([proj(x0, y0, h), proj(x1, y0, h), proj(x1, y1, h), proj(x0, y1, h)], col, ink, 0.5); }
function planks(x0, y0, x1, y1, n, col) { X.strokeStyle = col; X.lineWidth = 0.5; for (let i = 1; i < n; i++) { const y = lerp(y0, y1, i / n), u = proj(x0, y, 3.1), v = proj(x1, y, 3.1); X.beginPath(); X.moveTo(u[0], u[1]); X.lineTo(v[0], v[1]); X.stroke(); } }
function shadow(S, x0, y0, x1, y1, h) { const o = Math.min(h, 40) * 0.5; S.push(() => poly([proj(x1, y0, 3.2), proj(x1 + o, y0 + o * 0.25, 3.2), proj(x1 + o, y1 + o * 0.25, 3.2), proj(x0 + o, y1 + o * 0.25, 3.2), proj(x0, y1, 3.2), proj(x1, y1, 3.2)], 'rgba(74,63,52,.13)', null)); }
function item(L, S, x0, y0, h0, x1, y1, h1, col, after) { shadow(S, x0, y0, x1, y1, h1); queue(L, (x0 + x1) / 2, (y0 + y1) / 2, h0, () => { box(x0, y0, h0, x1, y1, h1, col); if (after) after(); }); }
function plant(L, S, x, y, h = 3, k = 1) { shadow(S, x - 4, y - 4, x + 4, y + 4, 12); queue(L, x, y, h, () => { box(x - 3.5, y - 3.5, h, x + 3.5, y + 3.5, h + 8, PAL.brick); const q = proj(x, y, h + 15 * k); X.fillStyle = PAL.green; X.strokeStyle = INK; X.lineWidth = 0.6; for (const [ox, oy, r] of [[-4, 1, 5], [4, 1, 5], [0, -4, 6]]) { X.beginPath(); X.arc(q[0] + ox * VIEW.z * k, q[1] + oy * VIEW.z * k, r * VIEW.z * k, 0, 7); X.fill(); X.stroke(); } }); }
function lamp(L, x, y, h = 3, tall = 34, lit = true) { queue(L, x, y, h, () => { const a = proj(x, y, h), b = proj(x, y, h + tall); X.strokeStyle = INK; X.lineWidth = Math.max(0.6, 1.2 * VIEW.z); X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(b[0], b[1]); X.stroke(); const z = VIEW.z; poly([[b[0] - 3 * z, b[1]], [b[0] + 3 * z, b[1]], [b[0] + 6 * z, b[1] + 7 * z], [b[0] - 6 * z, b[1] + 7 * z]], lit ? PAL.mustard : PAL.stone, INK, 0.5); }); }
function books(x0, y, h0, x1, h1) { const n = 8; for (let r = 0; r < 3; r++) { const hb = lerp(h0, h1, (r + 0.12) / 3), ht = lerp(h0, h1, (r + 0.82) / 3); for (let i = 0; i < n; i++) { const a = lerp(x0 + 1.5, x1 - 1.5, i / n), b = lerp(x0 + 1.5, x1 - 1.5, (i + 0.8) / n), c = [PAL.brick, PAL.blue, PAL.mustard, PAL.green, PAL.wall][Math.floor(hash(i * 7 + r * 31 + x0) * 5)]; poly([proj(a, y + 0.1, hb), proj(b, y + 0.1, hb), proj(b, y + 0.1, ht), proj(a, y + 0.1, ht)], c, null); } } }
function frameOnWallY(x0, x1, y, h0, h1, col) { poly([proj(x0, y, h0), proj(x1, y, h0), proj(x1, y, h1), proj(x0, y, h1)], col, INK, 0.5); }
function frameOnWallX(y0, y1, x, h0, h1, col) { poly([proj(x, y0, h0), proj(x, y1, h0), proj(x, y1, h1), proj(x, y0, h1)], col, INK, 0.5); }
function roomDress(L, S, cx, cy, kind) {
  const X0 = cx - 58, Y0 = cy - 58, wx = X0 + 4.2, wy = Y0 + 4.2;
  if (kind === 0) { // the rent room: a kitchen table, a shelf of unpaid things, a fridge
    planks(X0 + 4, Y0 + 4, cx + 58, cy + 58, 9, 'rgba(74,63,52,.2)');
    flat(cx - 30, cy - 8, cx + 18, cy + 34, PAL.rug);
    item(L, S, cx - 22, cy + 2, 3, cx + 8, cy + 24, 15, PAL.wood, () => { for (let i = 0; i < 4; i++) poly([proj(cx - 18 + i * 5, cy + 6 + i * 3, 15.2), proj(cx - 8 + i * 5, cy + 6 + i * 3, 15.2), proj(cx - 8 + i * 5, cy + 13 + i * 3, 15.2), proj(cx - 18 + i * 5, cy + 13 + i * 3, 15.2)], '#fbf7ec', INK, 0.4); });
    item(L, S, cx - 32, cy + 6, 3, cx - 26, cy + 14, 11, PAL.plank); item(L, S, cx + 12, cy + 8, 3, cx + 18, cy + 16, 11, PAL.plank);
    item(L, S, cx + 26, cy - 54, 3, cx + 46, cy - 36, 42, '#e8eef0', () => { const u = proj(cx + 26, cy - 40, 28), v = proj(cx + 46, cy - 36, 28); });
    item(L, S, cx - 8, cy - 54, 3, cx + 20, cy - 42, 24, PAL.wood, () => { for (let i = 0; i < 3; i++) box(cx - 5 + i * 8, cy - 50, 24, cx + i * 8, cy - 46, 27 + (i % 2) * 3, [PAL.brick, PAL.blue, PAL.mustard][i]); });
    frameOnWallX(cy - 34, cy - 14, wx, 28, 44, PAL.mustard); frameOnWallX(cy + 6, cy + 22, wx, 24, 40, PAL.sky);
    plant(L, S, cx + 46, cy + 40);
  }
  if (kind === 1) { // the tooth room: a bed nobody sleeps in, a bookcase
    planks(X0 + 4, Y0 + 4, cx + 58, cy + 58, 3, 'rgba(74,63,52,.1)');
    flat(cx - 36, cy - 4, cx + 26, cy + 46, PAL.mustard);
    item(L, S, cx + 8, cy - 54, 3, cx + 46, cy - 6, 13, PAL.plank, () => { box(cx + 10, cy - 52, 13, cx + 44, cy - 38, 17, '#fbf7ec'); box(cx + 10, cy - 36, 13, cx + 44, cy - 8, 16, PAL.rug); });
    item(L, S, cx - 50, cy - 54, 3, cx - 14, cy - 46, 46, PAL.wood, () => books(cx - 50, cy - 46, 5, cx - 14, 44));
    item(L, S, cx - 52, cy - 12, 3, cx - 40, cy + 2, 16, PAL.wood); lamp(L, cx - 46, cy - 5, 16, 14);
    frameOnWallX(cy - 8, cy + 18, wx, 26, 46, PAL.rug); plant(L, S, cx + 46, cy + 44);
  }
  if (kind === 2) { // the ex's room: sofa, a low table, a telephone table, a television
    planks(X0 + 4, Y0 + 4, cx + 58, cy + 58, 8, 'rgba(74,63,52,.18)');
    flat(cx - 26, cy - 14, cx + 30, cy + 30, PAL.tile);
    item(L, S, cx - 52, cy - 34, 3, cx - 28, cy + 26, 13, PAL.green, () => { box(cx - 52, cy - 34, 13, cx - 44, cy + 26, 26, PAL.green); for (let i = 0; i < 2; i++) box(cx - 43, cy - 30 + i * 28, 13, cx - 30, cy - 6 + i * 28, 16, shade2(PAL.green)); });
    item(L, S, cx - 8, cy - 2, 3, cx + 20, cy + 18, 10, PAL.wood);
    item(L, S, cx + 12, cy - 54, 3, cx + 48, cy - 44, 16, PAL.wood, () => box(cx + 18, cy - 53, 16, cx + 42, cy - 48, 33, '#6d675f'));
    frameOnWallX(cy - 40, cy - 24, wx, 30, 46, PAL.brick); frameOnWallX(cy - 18, cy - 2, wx, 30, 46, PAL.blue); frameOnWallX(cy + 4, cy + 20, wx, 30, 46, PAL.mustard);
    lamp(L, cx - 46, cy + 42, 3, 40); plant(L, S, cx + 46, cy + 44);
  }
  if (kind === 3) { // the roof room: buckets under the cloud, a table, a bath towel of hope
    planks(X0 + 4, Y0 + 4, cx + 58, cy + 58, 4, 'rgba(74,63,52,.1)');
    item(L, S, cx - 54, cy - 54, 3, cx - 10, cy - 28, 17, PAL.blue, () => { box(cx - 52, cy - 52, 17, cx - 40, cy - 30, 21, '#fbf7ec'); });
    for (const [bx, by] of [[cx + 8, cy - 8], [cx + 26, cy + 8], [cx - 14, cy + 2]]) { item(L, S, bx - 4, by - 4, 3, bx + 4, by + 4, 11, PAL.stone, () => flat(bx - 3, by - 3, bx + 3, by + 3, PAL.water, 11.1, null)); }
    item(L, S, cx + 22, cy - 54, 3, cx + 50, cy - 44, 30, PAL.wood, () => books(cx + 22, cy - 44, 5, cx + 50, 28));
    frameOnWallX(cy + 18, cy + 38, wx, 26, 44, PAL.green); plant(L, S, cx - 46, cy + 44);
  }
}
function slab(s, a) {
  const z = VIEW.z, Z = 210, L = [], S = [], t = s, wob = (f) => Math.sin(t * f), detail = z > 0.3;
  // the ground, with a band of soil on its cut faces
  box(-Z, -Z, -28, Z, Z, 0, PAL.slab);
  if (detail) { for (const y of [Z]) poly([proj(-Z, y, -9), proj(Z, y, -9), proj(Z, y, -2), proj(-Z, y, -2)], shade(PAL.wood, 0.9), null); poly([proj(Z, -Z, -9), proj(Z, Z, -9), proj(Z, Z, -2), proj(Z, -Z, -2)], shade(PAL.wood, 0.8), null); }
  poly([proj(-Z, -Z), proj(Z, -Z), proj(Z, 120), proj(-Z, 120)], PAL.sand, INK, 0.5);
  poly([proj(-Z, 120), proj(Z, 120), proj(Z, Z), proj(-Z, Z)], PAL.road, INK, 0.5);
  poly([proj(-Z, 112), proj(Z, 112), proj(Z, 122), proj(-Z, 122)], PAL.stone, INK, 0.5);
  poly([proj(-44, -10), proj(106, -10), proj(106, 100), proj(-44, 100)], PAL.lawn, INK, 0.5);
  if (detail) {
    X.setLineDash([9 * z, 8 * z]); X.strokeStyle = '#f7f2e6'; X.lineWidth = 1.5 * z; const u = proj(-Z, 165), v = proj(Z, 165); X.beginPath(); X.moveTo(u[0], u[1]); X.lineTo(v[0], v[1]); X.stroke(); X.setLineDash([]);
    for (let i = 0; i < 6; i++) { const yy = 126 + i * 13.4; poly([proj(30, yy), proj(62, yy), proj(62, yy + 7), proj(30, yy + 7)], '#f7f2e6', null); }
    // a vegetable plot and a path to the pad
    poly([proj(116, 40), proj(196, 40), proj(196, 100), proj(116, 100)], PAL.wood, INK, 0.5);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) { const q = proj(122 + c * 10, 48 + r * 14, 3); X.fillStyle = shade(PAL.green, r % 2 ? 0.86 : 1); X.beginPath(); X.arc(q[0], q[1], 2.8 * z, 0, 7); X.fill(); }
  }
  // rooms: floors first, then every shadow, then everything standing, by depth
  const rooms = [[-135, -125, 0, PAL.wall, PAL.plank], [0, -125, 1, '#ece3cf', PAL.tile], [135, -125, 2, PAL.wall, PAL.plank], [-135, 12, 3, '#ece3cf', PAL.tile]];
  for (const [cx, cy, , , fl] of rooms) box(cx - 58, cy - 58, 0, cx + 58, cy + 58, 3, fl);
  for (const [cx, cy, kind, wall] of rooms) {
    const x0 = cx - 58, x1 = cx + 58, y0 = cy - 58, y1 = cy + 58, hw = 62;
    queue(L, x0, cy, -120, () => box(x0, y0, 3, x0 + 4, y1, hw, wall));
    queue(L, cx, y0, -120, () => { box(x0, y0, 3, x1, y0 + 4, hw, wall);
      poly([proj(cx - 26, y0 + 4.1, 26), proj(cx + 2, y0 + 4.1, 26), proj(cx + 2, y0 + 4.1, 50), proj(cx - 26, y0 + 4.1, 50)], PAL.sky, INK, 0.6);
      const m = proj(cx - 12, y0 + 4.1, 26), n = proj(cx - 12, y0 + 4.1, 50); X.strokeStyle = INK; X.lineWidth = 0.5; X.beginPath(); X.moveTo(m[0], m[1]); X.lineTo(n[0], n[1]); X.stroke(); });
    if (detail) { queue(L, x0 - 1, cy, -119, () => {}); roomDressQueue(L, S, cx, cy, kind); }
  }
  // the pad, its gantry and the yard
  item(L, S, 8, 18, 0, 52, 62, 4, PAL.stone);
  if (detail) {
    item(L, S, 56, 25, 0, 60, 29, 92, PAL.stone, () => { X.strokeStyle = INK; X.lineWidth = 0.6; for (let i = 1; i < 9; i++) { const a0 = proj(52, 29.1, i * 10), b0 = proj(60, 29.1, i * 10); X.beginPath(); X.moveTo(a0[0], a0[1]); X.lineTo(b0[0], b0[1]); X.stroke(); } });
    item(L, S, 42, 25, 62, 60, 29, 65, PAL.stone);
    item(L, S, -32, 70, 0, -4, 76, 12, PAL.wood); // bench
    item(L, S, 84, -4, 0, 100, 8, 8, PAL.wood); item(L, S, 86, 10, 0, 98, 20, 12, PAL.plank); // crates
    item(L, S, 196, 100, 0, 204, 108, 16, PAL.brick); // mailbox
    item(L, S, -66, 108, 0, -60, 114, 9, PAL.brick); // hydrant
    // a fence along the back of the yard
    for (let i = 0; i < 9; i++) { const fx = -32 + i * 16; queue(L, fx, -18, 0, () => box(fx, -20, 0, fx + 3, -17, 12, PAL.wall)); }
    queue(L, 40, -18, 1, () => box(-32, -19, 8, 100, -18, 10, PAL.wall));
    lamp(L, -196, 114, 0, 52); lamp(L, 6, 116, 0, 52, false); lamp(L, 186, 116, 0, 52);
    // a bus shelter and its bus stop sign
    item(L, S, 124, 100, 0, 170, 110, 3, PAL.stone); queue(L, 146, 102, 0, () => { box(124, 100, 3, 170, 102, 28, PAL.sky); box(122, 98, 28, 172, 112, 31, PAL.blue); });
    tree(L, 200, -8); tree(L, -18, 104, 0.9); tree(L, -196, 92, 0.9); tree(L, 112, 22, 0.8); tree(L, 196, 28, 1.1);
    for (const [hx, hy] of [[-68, 76], [-56, 92], [-76, 94]]) { queue(L, hx, hy, 0, () => { const q = proj(hx, hy, 6); X.beginPath(); X.arc(q[0], q[1], 6.5 * z, 0, 7); X.fillStyle = shade(PAL.green, 0.92); X.fill(); X.strokeStyle = INK; X.lineWidth = 0.5; X.stroke(); }); }
  } else { tree(L, 150, 20); tree(L, -18, 104); }
  // cars: one broken, one parked, one that keeps going whatever happens to anyone
  car(L, -112, 165, PAL.blue, true); car(L, 150, 140, PAL.mustard, false);
  const tx = -190 + ((s * 26) % 380); car(L, tx, 188, PAL.rug, false);
  if (detail) { for (let i = 0; i < 3; i++) { const cx = -74 + i * 9; queue(L, cx, 150 + i, 4, () => { const a0 = proj(cx - 3, 150 + i, 0), b0 = proj(cx + 3, 150 + i, 0), c0 = proj(cx, 150 + i, 10); poly([a0, b0, c0], '#d98f5e', INK, 0.4); }); } }
  // the people and their troubles
  if (z > 0.2) {
    const pp = (x, y, h, o) => queue(L, x, y, h + 4, () => person(x, y, h, o));
    pp(-135 + wob(1.3) * 24, -102, 3, { coat: PAL.mustard, hair: '#6b3f2a', step: wob(9), bun: true, armL: 1.1, armR: -0.8 });
    pp(-14, -90, 3 + Math.abs(wob(5)) * 2, { coat: PAL.green, hair: '#2e2620', armR: -1.4 });
    pp(146, -92, 3, { coat: PAL.rug, hair: '#7a5a3a', armL: -1.4, armR: -1.4 });
    pp(-108 + wob(.9) * 8, 48, 3, { coat: PAL.blue, hair: '#443a33', step: wob(7) * 0.6, armL: -1.2, armR: -1.2 });
    pp(-146, 146, 0, { coat: '#b8a07a', hair: '#555', step: Math.max(0, wob(6)) * 1.6, armR: 0.2 });
    pp(-20 + wob(.4) * 3, 72, 0, { coat: PAL.brick, hair: '#ddd', k: 1, armL: 0.6, armR: 0.6 }); // on the bench, unbothered
    pp(160 + wob(.5) * 18, 60, 3, { coat: PAL.wall, hair: '#3d3229', step: wob(8), bun: true }); // in the plot
    const dx = -40 + ((s * 9) % 120); queue(L, dx, 96, 5, () => { const q = proj(dx, 96, 0), k = Math.max(z, .2); X.save(); X.translate(q[0], q[1]); X.scale(k, k); poly([[-7, -8], [6, -8], [7, -3], [-6, -3]], PAL.wood, INK, .5); X.fillStyle = INK; X.fillRect(-6, -3, 1.4, 3); X.fillRect(4, -3, 1.4, 3); X.beginPath(); X.arc(8, -10, 3.2, 0, 7); X.fillStyle = PAL.wood; X.fill(); X.strokeStyle = INK; X.lineWidth = .5; X.stroke(); X.restore(); });
    if (s < 12.2) { const w = ss(9.4, 11.1, s), climb = ss(11.1, 12.2, s), px = lerp(-20, 44, w), py = lerp(90, 34, w);
      pp(px, py, 3 + climb * 48, { coat: RED, hair: '#4c3a2c', step: w > 0 && w < 1 ? wob(12) : 0, armL: climb ? -1 : .4, armR: climb ? -1 : .4 }); }
  }
  for (const f of S) f();
  flush(L);
}
function roomDressQueue(L, S, cx, cy, kind) { roomDress(L, S, cx, cy, kind); }

// ---- rocket: a small drawn object, not to scale, and it says so
function rocket(s, x, y, k, a) {
  const f = ss(16.3, 16.9, s);
  X.save(); X.translate(x, y); X.scale(k, k);
  if (f > 0) { const fl = 1 + Math.sin(s * 47) * 0.2; X.beginPath(); X.moveTo(-9, 26); X.quadraticCurveTo(0, 26 + 44 * f * fl, 9, 26); X.closePath(); X.fillStyle = PAL.mustard; X.fill(); X.strokeStyle = INK; X.lineWidth = 0.9; X.stroke(); X.beginPath(); X.moveTo(-4.5, 26); X.quadraticCurveTo(0, 26 + 22 * f * fl, 4.5, 26); X.closePath(); X.fillStyle = RED; X.fill(); }
  poly([[-13, 12], [-25, 30], [-11, 26]], PAL.brick); poly([[13, 12], [25, 30], [11, 26]], PAL.brick);
  X.beginPath(); X.moveTo(0, -46); X.bezierCurveTo(17, -28, 16, 8, 11, 26); X.lineTo(-11, 26); X.bezierCurveTo(-16, 8, -17, -28, 0, -46); X.closePath(); X.fillStyle = '#fbf7ec'; X.fill(); X.strokeStyle = INK; X.lineWidth = 1; X.stroke();
  X.beginPath(); X.moveTo(0, -46); X.bezierCurveTo(7, -39, 10, -32, 11.5, -26); X.lineTo(-11.5, -26); X.bezierCurveTo(-10, -32, -7, -39, 0, -46); X.closePath(); X.fillStyle = RED; X.fill(); X.stroke();
  X.beginPath(); X.arc(0, -8, 7, 0, 7); X.fillStyle = PAL.sky; X.fill(); X.stroke();
  if (s >= 12.2) { X.beginPath(); X.arc(0, -8, 3.6, 0, 7); X.fillStyle = PAL.skin; X.fill(); X.lineWidth = .6; X.stroke(); }
  X.restore();
}

// ---- the globe, past the point where a town can be drawn
const LAND = []; (function () { for (let i = 0; i < 26; i++) LAND.push({ lon: hash(i + 700) * 6.283, lat: (hash(i + 730) - 0.5) * 2.1, r: 0.16 + hash(i + 760) * 0.34 }); })();
function globePoint(lon, lat, g) { const l = lon + g.rot, c = Math.cos(lat), xx = Math.sin(l) * c, yy = Math.sin(lat), zz = Math.cos(l) * c; return { x: g.x + xx * g.r, y: g.y - yy * g.r, front: zz }; }
function globe(s, a, g) {
  X.save(); X.globalAlpha *= g.k;
  X.beginPath(); X.arc(g.x, g.y, g.r, 0, 7); X.fillStyle = PAL.water; X.fill();
  X.save(); X.clip();
  const blobs = []; for (const c of LAND) { const pts = []; let vis = 0; for (let i = 0; i < 28; i++) { const th = i / 28 * 6.283, rr = c.r * (0.82 + 0.26 * Math.sin(th * 3 + c.lon * 9) + 0.12 * Math.sin(th * 7 + c.lat * 11)), p = globePoint(c.lon + Math.cos(th) * rr, c.lat + Math.sin(th) * rr * 0.8, g); if (p.front > 0) vis++; const d = Math.hypot(p.x - g.x, p.y - g.y) || 1; pts.push(p.front > 0 ? [p.x, p.y] : [g.x + (p.x - g.x) / d * g.r * 1.02, g.y + (p.y - g.y) / d * g.r * 1.02]); } if (vis > 2) blobs.push(pts); }
  const blobPath = (pts) => { X.beginPath(); const m = (a0, b0) => [(a0[0] + b0[0]) / 2, (a0[1] + b0[1]) / 2]; const st = m(pts[0], pts[pts.length - 1]); X.moveTo(st[0], st[1]); for (let i = 0; i < pts.length; i++) { const nx = m(pts[i], pts[(i + 1) % pts.length]); X.quadraticCurveTo(pts[i][0], pts[i][1], nx[0], nx[1]); } X.closePath(); };
  for (const pts of blobs) { blobPath(pts); X.strokeStyle = shade(PAL.green, 0.66); X.lineWidth = 1.5; X.stroke(); }
  for (const pts of blobs) { blobPath(pts); X.fillStyle = PAL.green; X.fill(); }
  X.strokeStyle = 'rgba(74,63,52,.2)'; X.lineWidth = 0.6;
  for (let m = 0; m < 12; m++) { X.beginPath(); let pen = false; for (let i = 0; i <= 40; i++) { const lat = -1.57 + i / 40 * 3.14, p = globePoint(m / 12 * 6.283, lat, g); if (p.front > 0) { if (pen) X.lineTo(p.x, p.y); else X.moveTo(p.x, p.y); pen = true; } else pen = false; } X.stroke(); }
  for (const la of [-0.9, -0.45, 0, 0.45, 0.9]) { X.beginPath(); let pen = false; for (let i = 0; i <= 80; i++) { const p = globePoint(i / 80 * 6.283, la, g); if (p.front > 0) { if (pen) X.lineTo(p.x, p.y); else X.moveTo(p.x, p.y); pen = true; } else pen = false; } X.stroke(); }
  const gr = X.createRadialGradient(g.x - g.r * 0.35, g.y - g.r * 0.35, g.r * 0.2, g.x, g.y, g.r * 1.02); gr.addColorStop(0, 'rgba(255,250,235,.16)'); gr.addColorStop(0.7, 'rgba(58,49,40,0)'); gr.addColorStop(1, 'rgba(58,49,40,.24)'); X.fillStyle = gr; X.fillRect(g.x - g.r, g.y - g.r, g.r * 2, g.r * 2);
  X.restore(); X.beginPath(); X.arc(g.x, g.y, g.r, 0, 7); X.strokeStyle = INK; X.lineWidth = 1; X.stroke();
  X.restore();
}

// ---- panels
function chart(s, a) {
  const x = 856, y = 112, w = 386, h = 322, ox = x + 74, oy = y + h - 44, pw = w - 108, ph = h - 92;
  roundCard(x, y, w, h);
  text('how big your problems look', x + 14, y + 26, 16, 'KSansB');
  const xOf = (al) => ox + pw * (lgOf(al) / 4), yOf = (f) => oy - ph * f;
  const yt = [['a house', 1], ['a bus', 0.55], ['a loaf', 0.27], ['a pea', 0.11]];
  for (const [t, f] of yt) { X.strokeStyle = 'rgba(58,49,40,.16)'; X.lineWidth = 0.8; X.beginPath(); X.moveTo(ox, yOf(f)); X.lineTo(ox + pw, yOf(f)); X.stroke(); text(t, ox - 8, yOf(f) + 5, 13.5, 'KSans', SOFT, 'right'); }
  text('nothing', ox - 8, oy + 5, 13.5, 'KSans', SOFT, 'right');
  for (const v of [0, 10, 100, 1000, 10000]) { const xx = xOf(v); X.strokeStyle = 'rgba(58,49,40,.16)'; X.beginPath(); X.moveTo(xx, oy); X.lineTo(xx, oy - ph); X.stroke(); X.strokeStyle = INK; X.beginPath(); X.moveTo(xx, oy); X.lineTo(xx, oy + 5); X.stroke(); text(v.toLocaleString('en-US'), xx, oy + 21, 13.5, 'KSans', SOFT, 'center'); }
  text('miles up', ox + pw * 0.45, oy + 37, 13.5, 'KSans', SOFT, 'center');
  X.strokeStyle = INK; X.lineWidth = 1.1; X.beginPath(); X.moveTo(ox, oy - ph - 6); X.lineTo(ox, oy); X.lineTo(ox + pw + 6, oy); X.stroke();
  // the curve, drawn only as far as we've climbed
  const lg = lgOf(a); X.strokeStyle = RED; X.lineWidth = 2; X.lineJoin = 'round'; X.beginPath(); for (let i = 0; i <= 80; i++) { const q = i / 80 * lg, al = Math.pow(10, q) - 1; const px = xOf(al), py = yOf(sizeFrac(al)); if (i) X.lineTo(px, py); else X.moveTo(px, py); } X.stroke();
  const dx = xOf(a), dy = yOf(sizeFrac(a)); X.setLineDash([3, 3]); X.strokeStyle = RED; X.lineWidth = 0.9; X.beginPath(); X.moveTo(dx, dy); X.lineTo(dx, oy); X.stroke(); X.setLineDash([]);
  X.beginPath(); X.arc(dx, dy, 5.5, 0, 7); X.fillStyle = RED; X.fill(); X.strokeStyle = CREAM; X.lineWidth = 1.5; X.stroke();
  // two of Bob's words on the chart itself
  const L2 = C.lines[2], wt = (i) => L2.words[i].s, on = ss(wt(0), wt(0) + 0.3, s), nw = ss(wt(3), wt(3) + 0.3, s);
  if (s > wt(0)) text(L2.words.slice(0, 3).map((w) => w.w).join(' '), xOf(1.3) + 12, yOf(sizeFrac(1.3)) - 6, 20, 'KSerif', INK, 'left', on);
  if (s > wt(3)) text(L2.words.slice(3).map((w) => w.w).join(' '), xOf(60) + 8, yOf(sizeFrac(60)) - 14, 20, 'KSerif', RED, 'left', nw);
  // 10,000 gets its ring when it is sung
  if (s > 44.9) { const rr = ss(44.9, 45.6, s); X.beginPath(); X.arc(xOf(10000), oy + 15, 21, -1.6, -1.6 + 6.3 * rr); X.strokeStyle = RED; X.lineWidth = 1.5; X.stroke(); }
}
function roundCard(x, y, w, h, fill = '#fdfaf2') { X.beginPath(); X.roundRect(x, y, w, h, 8); X.fillStyle = fill; X.fill(); X.strokeStyle = 'rgba(58,49,40,.55)'; X.lineWidth = 1; X.stroke(); }

const looks = (f) => (f > 0.75 ? 'a house' : f > 0.4 ? 'a bus' : f > 0.18 ? 'a loaf' : f > 0.012 ? 'a pea' : 'nothing');
function ledger(s, a) {
  const x = 856, y = 446, w = 386, h = 250; roundCard(x, y, w, h);
  text('the problem', x + 14, y + 24, 14, 'KSans', SOFT); text('looks like', x + w - 14, y + 24, 14, 'KSans', SOFT, 'right');
  X.strokeStyle = 'rgba(58,49,40,.4)'; X.lineWidth = 0.8; X.beginPath(); X.moveTo(x + 14, y + 32); X.lineTo(x + w - 14, y + 32); X.stroke();
  PROBLEMS.forEach((p, i) => {
    const ry = y + 58 + i * 31, on = ss(p.cue, p.cue + 0.25, s);
    if (on <= 0) return;
    const f = sizeFrac(a); text(p.title, x + 14, ry, 17, 'KSansB', INK, 'left', on); text(looks(f), x + w - 14, ry, 17, 'KSans', INK, 'right', on);
    const k = ss(p.kill, p.kill + 0.45, s); if (k > 0) { const y2 = ry - 5; X.strokeStyle = RED; X.lineWidth = 1.8; X.beginPath(); X.moveTo(x + 12, y2 + 1); X.lineTo(x + 12 + (w - 24) * k, y2 - 1); X.stroke(); }
  });
  const ry = y + 58 + 5 * 31 + 6; X.strokeStyle = 'rgba(58,49,40,.4)'; X.lineWidth = 0.8; X.beginPath(); X.moveTo(x + 14, ry - 24); X.lineTo(x + w - 14, ry - 24); X.stroke();
  if (s > 15.6) { text('tears required', x + 14, ry, 17, 'KSansB', INK, 'left', ss(15.6, 15.9, s)); const n = s > 60.4 ? '0' : s > 59.7 ? '1' : s > 59.2 ? '2' : '3'; text(n, x + w - 14, ry, s > 60.4 ? 21 : 17, 'KSansB', s > 60.4 ? RED : INK, 'right', ss(15.6, 15.9, s)); }
}
function readout(s, a) {
  const x = 1242, n = Math.round(a >= 10 ? a : a * 10) / (a >= 10 ? 1 : 10), val = (a >= 1000 ? Math.round(a / 10) * 10 : n).toLocaleString('en-US');
  text(`${val} mile${val === '1' ? '' : 's'}`, x, 66, 34, 'KSerif', INK, 'right');
  const note = a <= 0 ? 'parked' : a < 5 ? 'above the wires' : a < 100 ? 'above the weather' : a < 1000 ? 'above the news' : a < 9999 ? 'above the neighbours' : 'above it';
  text(note, x, 92, 18, 'KSans', RED, 'right');
}
function caption(s) {
  let li = -1; for (let i = 0; i < C.lines.length; i++) if (s >= C.lines[i].words[0].s - 0.05) li = i;
  if (li < 0) return; const L = C.lines[li], wEnd = L.words[L.words.length - 1].s;
  const next = C.lines[li + 1] ? C.lines[li + 1].words[0].s : 99; const a = 1 - ss(Math.max(wEnd + 1.6, next - 0.25), Math.max(wEnd + 1.9, next - 0.02), s); if (a <= 0) return;
  const size = 25, maxW = 370, x0 = 48; let x = x0, y = 142; X.save(); X.font = `${size}px KSans`; const sp = size * 0.3;
  L.words.forEach((w) => { const ww = X.measureText(w.w).width; if (x + ww > x0 + maxW) { x = x0; y += size * 1.2; } const on = ss(w.s - 0.03, w.s + 0.1, s); const isRed = w.w.replace(/[,]/g, '') === L.red; if (on > 0) text(w.w, x, y, size, isRed ? 'KSansB' : 'KSans', isRed ? RED : INK, 'left', on * a); x += ww + sp; });
  X.restore();
}
function labels(s, a, pts) {
  for (const p of PROBLEMS) {
    const on = ss(p.cue, p.cue + 0.3, s), gone = 1 - ss(p.kill, p.kill + 0.5, s), al = on * gone; if (al <= 0) continue;
    const t = pts[p.key]; X.save(); X.globalAlpha = al;
    const ww = (X.font = '16px KSansB', X.measureText(p.title).width), lxEnd = p.lx > t[0] ? p.lx - 6 : p.lx + Math.max(ww, 96) + 6, lyMid = p.ly - 5;
    X.strokeStyle = 'rgba(58,49,40,.7)'; X.lineWidth = 0.8; X.beginPath(); X.moveTo(lxEnd, lyMid); X.lineTo(t[0], t[1]); X.stroke(); X.beginPath(); X.arc(t[0], t[1], 1.7, 0, 7); X.fillStyle = INK; X.fill();
    text(p.title, p.lx, p.ly, 16, 'KSansB'); text(p.sub, p.lx, p.ly + 18, 14.5, 'KSans', SOFT); X.restore();
  }
}
function bubble(cx, cy, r, tx, ty, fn, alpha) {
  X.save(); X.globalAlpha = alpha; X.strokeStyle = 'rgba(58,49,40,.7)'; X.lineWidth = 0.8; const d = Math.hypot(tx - cx, ty - cy) || 1; X.beginPath(); X.moveTo(cx + (tx - cx) / d * r, cy + (ty - cy) / d * r); X.lineTo(tx, ty); X.stroke();
  X.beginPath(); X.arc(cx, cy, r, 0, 7); X.fillStyle = '#fdfaf2'; X.fill(); X.save(); X.clip(); fn(); X.restore(); X.beginPath(); X.arc(cx, cy, r, 0, 7); X.lineWidth = 1.2; X.strokeStyle = INK; X.stroke(); X.restore();
}
function windowScene(s, cx, cy, r) { // the smile: drawn up close, then the same drawing from further and further away
  const away = ss(31.4, 33.2, s), k = 1.9 * Math.pow(10, -away * 2.6);
  X.save(); X.translate(cx, cy + 6); X.scale(k, k);
  poly([[-44, -44], [44, -44], [44, 44], [-44, 44]], PAL.wall); poly([[-29, -30], [29, -30], [29, 24], [-29, 24]], '#f3d98e');
  X.strokeStyle = INK; X.lineWidth = 1; X.fillStyle = PAL.skin; X.beginPath(); X.arc(0, -4, 15, 0, 7); X.fill(); X.stroke();
  X.fillStyle = '#4c3a2c'; X.beginPath(); X.arc(0, -8, 15.2, Math.PI, 0); X.fill(); poly([[-13, 11], [13, 11], [18, 24], [-18, 24]], PAL.blue);
  X.fillStyle = INK; X.fillRect(-6, -5, 2, 2.6); X.fillRect(4, -5, 2, 2.6);
  const sm = ss(30.4, 31.0, s); X.strokeStyle = INK; X.lineWidth = 1.2; X.beginPath(); X.moveTo(-5, 2 ); X.quadraticCurveTo(0, 2 + 5 * sm, 5, 2); X.stroke();
  X.restore();
  const n = ss(32.6, 33.2, s); if (n > 0) { X.beginPath(); X.arc(cx, cy - 12, 1.5, 0, 7); X.fillStyle = '#d9a93f'; X.globalAlpha *= n; X.fill(); X.globalAlpha = 1; text('still smiling', cx, cy + 22, 15, 'KSans', SOFT, 'center', n); text('(we checked)', cx, cy + 40, 13, 'KSans', SOFT, 'center', n); }
}
function careFlow(s) {
  const a = ss(35.6, 36.2, s) * (1 - ss(43.4, 43.9, s)); if (a <= 0) return;
  const x = 590, y = 628; X.save(); X.globalAlpha = a;
  poly([[x, y - 26], [x + 44, y], [x, y + 26], [x - 44, y]], '#fdfaf2'); text('care?', x, y + 6, 16, 'KSansB', INK, 'center');
  const rows = [['you will', y - 44, 37.0], ["you won't", y + 44, 39.2]];
  for (const [t, ry, cue] of rows) { X.strokeStyle = INK; X.lineWidth = 0.9; X.beginPath(); X.moveTo(x + 26, y + (ry < y ? -12 : 12)); X.lineTo(x + 84, ry); X.lineTo(x + 112, ry); X.stroke(); X.beginPath(); X.roundRect(x + 112, ry - 15, 104, 30, 6); X.fillStyle = s > cue ? '#f4e2c6' : '#fdfaf2'; X.fill(); X.stroke(); text(t, x + 164, ry + 6, 16, 'KSans', INK, 'center'); }
  const px = (s < 37 ? lerp(x - 44, x, ss(36.1, 36.9, s)) : s < 38.7 ? lerp(x, x + 150, ss(36.9, 37.5, s)) : s < 39.2 ? x + 150 : x + 150), py = (s < 37 ? y : s < 38.7 ? lerp(y, y - 44, ss(36.9, 37.5, s)) : lerp(y - 44, y + 44, ss(38.7, 39.5, s))) + ss(41.8, 42.9, s) * 90;
  X.beginPath(); X.arc(px, py, 6, 0, 7); X.fillStyle = RED; X.fill(); X.strokeStyle = CREAM; X.lineWidth = 1.2; X.stroke(); X.restore();
}

// ---- the frame
function background() {
  X.fillStyle = TAN; X.fillRect(0, 0, W, H); X.beginPath(); X.roundRect(16, 16, W - 32, H - 32, 14); X.fillStyle = CREAM; X.fill();
  X.save(); X.clip(); X.strokeStyle = 'rgba(58,49,40,.045)'; X.lineWidth = 1; for (let i = -40; i < 60; i++) { const d = i * 34; X.beginPath(); X.moveTo(d, 0); X.lineTo(d + 1247, 720); X.moveTo(d, 720); X.lineTo(d + 1247, 0); X.stroke(); } X.restore();
}
function draw(s) {
  const a = altAt(s), z = zoomAt(a), t = s;
  background();
  text('10,000 miles', 46, 72, 44, 'KSerif'); text('your problems, measured from the air', 48, 100, 18, 'KSans', SOFT);
  // the world
  const gk = ss(320, 1000, a), rg = lerp(240, 165, ss(2.5, 4, lgOf(a))), gl = { x: 420, y: 462, r: rg, k: gk, rot: 0 };
  gl.rot = -0.5 + (s - 22.4) * 0.035 + ss(44, 62, s) * 1.25 ; // the town rides round toward the limb and over it
  const townLon = 0.25, townLat = 0.42, tp = globePoint(townLon, townLat, gl);
  const ax = lerp(430, tp.x, gk), ay = lerp(430, tp.y, gk), yaw = ss(40, 500, a) * 0.5 + Math.max(0, s - 22.4) * (a < 1000 ? 0.11 : 0);
  VIEW = { ax, ay, z, yaw };
  if (gk > 0) globe(s, a, gl);
  const worldAlpha = 1 - ss(700, 1100, a);
  if (worldAlpha > 0) { X.save(); X.globalAlpha = worldAlpha; town(s, a); if (z > 0.04) slab(s, a); X.restore(); }
  // where each problem is now
  const pts = {}; const swell = 1 + 2.1 * ss(18.1, 19.4, s);
  for (const p of PROBLEMS) { const q = proj(p.at[0], p.at[1], p.at[2]); pts[p.key] = gk > 0.6 ? [tp.x, tp.y] : q; }
  // the icons sit above their rooms and grow with the sung line, the world then takes them away
  if (z > 0.06) for (const p of PROBLEMS) { const on = ss(p.cue - 0.4, p.cue, s) || 0.75, q = proj(p.at[0], p.at[1], p.at[2]), k = (p.key === 'car' ? 1.15 : 1.25) * z * swell; X.save(); X.globalAlpha = (s < p.cue ? 0.9 : 1) * worldAlpha; X.translate(q[0], q[1]); X.scale(k, k); p.icon(k, s); X.restore(); }
  // town dot on the globe, once a town can't be drawn
  if (gk > 0.5) { const vis = clamp(tp.front * 8); if (vis > 0) { X.beginPath(); X.arc(tp.x, tp.y, 2.8, 0, 7); X.fillStyle = RED; X.globalAlpha = vis; X.fill(); X.globalAlpha = 1; } }
  // flight line and rocket
  const up = ss(16.9, 19, s), rs = proj(30, 40, 4), rx = lerp(rs[0], 430, up), ry = lerp(rs[1] - 30 * VIEW.z * 1, 196, up), rk = lerp(0.82 * Math.max(z, 0.6), 0.9, up);
  if (up > 0) { const b = gk > 0.6 ? [tp.x, tp.y] : rs; X.setLineDash([4, 5]); X.strokeStyle = RED; X.lineWidth = 1; X.beginPath(); X.moveTo(rx, ry + 42 * rk); X.lineTo(b[0], b[1]); X.stroke(); X.setLineDash([]); }
  const mk = ss(47.8, 50.7, s); if (mk > 0) { X.save(); X.globalAlpha = mk; for (let i = 0; i < 46; i++) { const sx = 40 + hash(i + 900) * 780, sy = 190 + hash(i + 950) * 490, r = Math.hypot(sx - gl.x, sy - gl.y); if (r < gl.r + 8) continue; if (sx < 390 && sy < 200) continue; const tw = 0.5 + 0.5 * Math.sin(s * 2 + i); X.strokeStyle = `rgba(74,63,52,${0.25 + tw * 0.35})`; X.lineWidth = 0.7; X.beginPath(); X.moveTo(sx - 2.5, sy); X.lineTo(sx + 2.5, sy); X.moveTo(sx, sy - 2.5); X.lineTo(sx, sy + 2.5); X.stroke(); } X.restore();
    const mx = lerp(900, 700, ss(50.7, 53.4, s)), my = 300; X.beginPath(); X.arc(mx, my, 27, 0, 7); X.fillStyle = '#efe9da'; X.fill(); X.strokeStyle = INK; X.lineWidth = 0.9; X.stroke(); X.fillStyle = 'rgba(74,63,52,.14)'; for (const [cx, cy, r] of [[-8, -6, 6], [7, 4, 8], [-5, 11, 4], [10, -12, 3]]) { X.beginPath(); X.arc(mx + cx, my + cy, r, 0, 7); X.fill(); } const ml = ss(52, 52.6, s); if (ml > 0) { text('THE MOON', mx + 34, my - 2, 16, 'KSansB', INK, 'left', ml); text('fine, thanks', mx + 34, my + 16, 14.5, 'KSans', SOFT, 'left', ml); } }
  labels(s, a, pts);
  rocket(s, rx, ry, rk, a);
  text('rocket not to scale', rx - 30, ry + 22, 13.5, 'KSans', SOFT, 'right', ss(19, 19.6, s) * (1 - ss(26, 26.8, s)));
  // the smile in the window
  const b1 = ss(27.3, 27.9, s) * (1 - ss(34.6, 35.4, s)); if (b1 > 0) bubble(196, 352, 84, pts.rent[0], pts.rent[1], () => windowScene(s, 196, 352, 84), b1);
  careFlow(s);
  // you, in the porthole
  const b2 = ss(58.5, 59.1, s); if (b2 > 0) bubble(590, 190, 66, rx, ry - 8, () => { const cx = 590, cy = 198; X.fillStyle = PAL.sky; X.fillRect(cx - 80, cy - 80, 160, 160); X.fillStyle = PAL.skin; X.strokeStyle = INK; X.lineWidth = 1.1; X.beginPath(); X.arc(cx, cy, 30, 0, 7); X.fill(); X.stroke(); X.fillStyle = '#4c3a2c'; X.beginPath(); X.arc(cx, cy - 7, 30.4, Math.PI, 0); X.fill(); X.fillStyle = INK; X.fillRect(cx - 12, cy - 4, 3.4, 4.4); X.fillRect(cx + 9, cy - 4, 3.4, 4.4); const sm = ss(60.4, 61.2, s); X.lineWidth = 1.6; X.beginPath(); X.moveTo(cx - 9, cy + 13); X.quadraticCurveTo(cx, cy + 13 + (sm * 12 - 3), cx + 9, cy + 13); X.stroke(); const tear = 1 - ss(59.6, 60.4, s); if (tear > 0) { const ty = cy + 2 + (1 - tear) * 18; X.globalAlpha *= tear; X.fillStyle = PAL.water; X.beginPath(); X.moveTo(cx - 11, ty - 5); X.quadraticCurveTo(cx - 6, ty + 3, cx - 11, ty + 4); X.quadraticCurveTo(cx - 16, ty + 3, cx - 11, ty - 5); X.fill(); } }, b2);
  // panels, on top of everything
  readout(s, a); chart(s, a); ledger(s, a); caption(s);
  text('heights real, sizes a feeling.', 48, 688, 14.5, 'KSans', SOFT);
  if (PAPER) { X.save(); X.globalCompositeOperation = 'multiply'; X.drawImage(PAPER, 0, 0); X.restore(); }
}
function makePaper() { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); const im = g.getImageData(0, 0, W, H), d = im.data; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, n = hash(x * 13.1 + y * 71.7), lo = 0.5 + 0.5 * Math.sin(x * 0.013 + Math.sin(y * 0.021) * 2.1) * Math.sin(y * 0.017 + Math.sin(x * 0.011) * 1.7), v = 255 - n * 8 - lo * 3.5; d[i] = v; d[i + 1] = v - 0.6; d[i + 2] = v - 2; } g.putImageData(im, 0, 0); return c; }
window.setup = async () => { C = window.CUES; const c = document.getElementById('c'); c.width = W; c.height = H; X = c.getContext('2d'); await Promise.all(['20px KSans', '20px KSansB', '20px KSerif'].map((f) => document.fonts.load(f))); PAPER = makePaper(); };
window.__frameJPEG = (s, q = 0.93) => { draw(s); return document.getElementById('c').toDataURL('image/jpeg', q); };
