// Characters and props, drawn on the kit's context X. Everything is a pure function of the time it is given.
'use strict';
const P = {
  skin: '#e8b48f', skin2: '#cf9874', stub: 'rgba(120,80,60,.28)', shirt: '#3f7d5c', shirt2: '#336a4d', pants: '#474c5a', pants2: '#3a3e4a',
  shoe: '#26262c', line: '#1b2433', gold: '#FFC531', gold2: '#F3B52C', night: '#0A0E24', cream: '#f4ecd8', mint: '#7fe0c3', coral: '#ff7a59',
};
function rr(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; }
function fillPath(p, col, a = 1) { X.globalAlpha = a; X.fillStyle = col; X.fill(p); X.globalAlpha = 1; }
function limb(x1, y1, x2, y2, w, col) { X.beginPath(); X.moveTo(x1, y1); X.lineTo(x2, y2); X.lineCap = 'round'; X.lineWidth = w; X.strokeStyle = col; X.stroke(); }
function limb2(x1, y1, xk, yk, x2, y2, w, col) { X.beginPath(); X.moveTo(x1, y1); X.lineTo(xk, yk); X.lineTo(x2, y2); X.lineCap = 'round'; X.lineJoin = 'round'; X.lineWidth = w; X.strokeStyle = col; X.stroke(); }

// ---------- Robin, flat vector ----------
// o: {s scale (1 = 470 px tall), dir 1|-1, ph walk phase (rad), wk walk amount 0..1, reach 0..1 (front arm out to a door),
//     point 0..1, look -1..1 head turn toward camera (0 = profile in dir), alpha}
// draw fn() at alpha a as one layer (the figures reset globalAlpha per part, so fade them as a whole)
let SC = null;
function layer(a, fn) {
  if (a >= .999) return fn(); if (a <= .001) return;
  if (!SC) { SC = document.createElement('canvas'); SC.width = W; SC.height = H; }
  const prev = X, g = SC.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.setTransform(prev.getTransform());
  X = g; try { fn(); } finally { X = prev; }
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = a; X.drawImage(SC, 0, 0); X.restore();
}
function robin(x, y, o = {}) { const a = o.alpha ?? 1; layer(a, () => robinDraw(x, y, { ...o, alpha: 1 })); }
function robinDraw(x, y, o = {}) {
  if (o.back) return robinBack(x, y, o);
  const s = o.s ?? 1, dir = o.dir ?? 1, ph = o.ph ?? 0, wk = o.wk ?? 0, reach = o.reach ?? 0, point = o.point ?? 0, look = o.look ?? 0;
  X.save(); X.translate(x, y); X.scale(s * dir, s); X.globalAlpha = o.alpha ?? 1;
  const bob = -Math.abs(Math.sin(ph)) * 9 * wk;
  // shadow
  X.globalAlpha = (o.alpha ?? 1) * .18; X.fillStyle = '#000'; X.beginPath(); X.ellipse(0, 4, 80, 12, 0, 0, TAU); X.fill(); X.globalAlpha = o.alpha ?? 1;
  const hipY = -205 + bob, shY = -360 + bob;
  const leg = (sgn, col) => {
    const sw = Math.sin(ph + (sgn > 0 ? 0 : Math.PI)) * wk, lift = Math.max(0, Math.cos(ph + (sgn > 0 ? 0 : Math.PI))) * 26 * wk;
    const fx = sw * 62, fy = -lift, kx = sw * 30 + 10 * wk, ky = (hipY + fy) / 2 - 4;
    limb2(sgn * 4, hipY, kx, ky, fx, fy - 20, 44, col);
    X.fillStyle = P.shoe; X.beginPath(); X.roundRect(fx - 22, fy - 26, 62, 26, 12); X.fill();
  };
  const arm = (back) => {
    const sw = back ? Math.sin(ph) * .55 * wk : -Math.sin(ph) * .55 * wk;
    let a1 = .12 + sw, a2 = a1 + .25;
    if (!back) { a1 = lerp(a1, 1.3, reach); a2 = lerp(a2, 1.45, reach); a1 = lerp(a1, 1.5, point); a2 = lerp(a2, 1.58, point); }
    const sx = back ? -8 : 10, sy = shY + 12;
    const ex = sx + Math.sin(a1) * 78, ey = sy + Math.cos(a1) * 78, hx = ex + Math.sin(a2) * 74, hy = ey + Math.cos(a2) * 74;
    limb2(sx, sy, ex, ey, hx, hy, 30, back ? P.shirt2 : P.shirt);
    limb(ex, ey, hx, hy, 24, back ? P.skin2 : P.skin);
    X.fillStyle = back ? P.skin2 : P.skin; X.beginPath(); X.arc(hx, hy, 15, 0, TAU); X.fill();
  };
  arm(true); leg(-1, P.pants2); leg(1, P.pants);
  // torso
  fillPath(rr(-62, shY - 18, 120, hipY - shY + 40, 34), P.shirt);
  fillPath(rr(-62, hipY - 4, 120, 30, 10), P.pants);
  X.fillStyle = P.shirt2; X.globalAlpha = (o.alpha ?? 1) * .5; X.fillRect(-62, shY + 30, 22, hipY - shY - 20); X.globalAlpha = o.alpha ?? 1;
  // neck + head
  X.fillStyle = P.skin2; X.fillRect(-14, shY - 44, 30, 36);
  const hx = 6 + look * -4, hy = shY - 92;
  X.fillStyle = P.skin; X.beginPath(); X.ellipse(hx, hy, 54, 62, 0, 0, TAU); X.fill();
  X.fillStyle = P.stub; X.beginPath(); X.ellipse(hx + 4, hy + 22, 50, 40, 0, .1, Math.PI - .1); X.fill();
  X.fillStyle = 'rgba(255,255,255,.28)'; X.beginPath(); X.ellipse(hx - 10, hy - 34, 24, 13, -.3, 0, TAU); X.fill();
  X.fillStyle = P.skin2; X.beginPath(); X.ellipse(hx - 30 - look * 14, hy + 4, 11, 16, 0, 0, TAU); X.fill();
  // face toward dir, turning to camera with look
  const fx = hx + lerp(30, 0, Math.abs(look));
  X.fillStyle = P.line; for (const ex of look ? [-17, 17] : [0]) { X.beginPath(); X.ellipse(fx + ex, hy - 6, 5, 6.5, 0, 0, TAU); X.fill(); }
  X.strokeStyle = P.line; X.lineWidth = 4; X.lineCap = 'round'; X.beginPath();
  for (const ex of look ? [-17, 17] : [0]) { X.moveTo(fx + ex - 10, hy - 22); X.lineTo(fx + ex + 9, hy - 24); } X.stroke();
  X.lineWidth = 3.5; X.beginPath(); X.moveTo(fx + (look ? -10 : 2), hy + 30); X.quadraticCurveTo(fx + (look ? 0 : 10), hy + 36, fx + (look ? 12 : 18), hy + 29); X.stroke();
  if (!look) { X.fillStyle = P.skin2; X.beginPath(); X.moveTo(hx + 50, hy - 4); X.lineTo(hx + 62, hy + 14); X.lineTo(hx + 48, hy + 16); X.fill(); }
  arm(false);
  X.restore();
}
// Robin from behind, walking away from us into the door
function robinBack(x, y, o) {
  const s = o.s ?? 1, ph = o.ph ?? 0, wk = o.wk ?? 0;
  X.save(); X.translate(x, y); X.scale(s, s);
  const bob = -Math.abs(Math.sin(ph)) * 8 * wk, hipY = -205 + bob, shY = -360 + bob;
  X.globalAlpha = .18; X.fillStyle = '#000'; X.beginPath(); X.ellipse(0, 4, 80, 12, 0, 0, TAU); X.fill(); X.globalAlpha = 1;
  for (const sgn of [-1, 1]) {
    const lift = Math.max(0, Math.sin(ph + (sgn > 0 ? 0 : Math.PI))) * 30 * wk;
    limb(sgn * 24, hipY, sgn * 26, -lift - 18, 44, sgn > 0 ? P.pants : P.pants2);
    X.fillStyle = P.shoe; X.beginPath(); X.roundRect(sgn * 26 - 22, -lift - 22, 44, 24, 10); X.fill();
  }
  for (const sgn of [-1, 1]) {
    const sw = Math.sin(ph + (sgn > 0 ? Math.PI : 0)) * 14 * wk;
    limb2(sgn * 60, shY + 14, sgn * 70, shY + 90 + sw, sgn * 68, shY + 160 + sw * 1.5, 30, P.shirt2);
    X.fillStyle = P.skin2; X.beginPath(); X.arc(sgn * 68, shY + 168 + sw * 1.5, 15, 0, TAU); X.fill();
  }
  fillPath(rr(-64, shY - 18, 128, hipY - shY + 40, 34), P.shirt); fillPath(rr(-64, hipY - 4, 128, 30, 10), P.pants);
  X.fillStyle = P.skin2; X.fillRect(-15, shY - 44, 30, 36);
  X.fillStyle = P.skin2; for (const sgn of [-1, 1]) { X.beginPath(); X.ellipse(sgn * 54, shY - 88, 11, 16, 0, 0, TAU); X.fill(); }
  X.fillStyle = P.skin; X.beginPath(); X.ellipse(0, shY - 92, 54, 62, 0, 0, TAU); X.fill();
  X.fillStyle = 'rgba(255,255,255,.25)'; X.beginPath(); X.ellipse(-12, shY - 126, 24, 13, -.2, 0, TAU); X.fill();
  X.fillStyle = P.stub; X.beginPath(); X.ellipse(0, shY - 52, 46, 16, 0, 0, TAU); X.fill();
  X.restore();
}
// head centre of robin() at a given placement, for the morph to the gold figure
const robinHead = (x, y, s, dir = 1) => [x + 6 * s * dir, y + (-360 - 92) * s];

// ---------- the gold figure: Robin as the administrator beat draws him (AdminB.figure, scale 2.6 at frame 0) ----------
function goldFig(cx, oy, k, a = 1, ring = 0) {
  X.save(); X.globalAlpha = a; X.shadowColor = P.gold; X.shadowBlur = 18;
  X.fillStyle = P.gold2; X.beginPath(); X.arc(cx, oy - 68 * k, 34 * k, 0, TAU); X.fill();
  X.strokeStyle = P.gold; X.lineWidth = 3.4; X.lineCap = 'round';
  X.beginPath(); X.moveTo(cx - 62 * k, oy + 72 * k); X.bezierCurveTo(cx - 58 * k, oy - 22 * k, cx + 58 * k, oy - 22 * k, cx + 62 * k, oy + 72 * k); X.stroke();
  X.restore();
}
const GOLD_END = { cx: 960, oy: 461.8, k: 2.6 };

// ---------- agents ----------
// flat vector agent: a rounded body with a screen face, blinking, its antenna lagging behind its hop
function bot(x, y, s, t, o = {}) {
  const seed = o.seed ?? 0, col = o.col || P.mint, hop = o.hop ?? 1;
  const hp = Math.abs(Math.sin(t * 7 + seed)) * 18 * hop, sq = 1 + Math.cos(t * 14 + seed * 2) * .04 * hop;
  X.save(); X.translate(x, y - hp * s); X.scale(s / sq, s * sq);
  X.globalAlpha = .2; X.fillStyle = '#000'; X.beginPath(); X.ellipse(0, hp, 48, 9, 0, 0, TAU); X.fill(); X.globalAlpha = 1;
  X.fillStyle = col; X.beginPath(); X.roundRect(-48, -100, 96, 92, 26); X.fill();
  X.fillStyle = '#16233a'; X.beginPath(); X.roundRect(-36, -86, 72, 48, 14); X.fill();
  const blink = ((t * 1.3 + seed * .37) % 2.7) < .12 ? .15 : 1;
  X.fillStyle = o.eye || '#9ff6ff'; for (const ex of [-14, 14]) { X.beginPath(); X.roundRect(ex - 6 + (o.lookX || 0) * 6, -70 - 9 * blink, 12, 18 * blink, 5); X.fill(); }
  const sway = Math.sin(t * 7 + seed - .9) * .35 * hop;
  X.strokeStyle = col; X.lineWidth = 5; X.lineCap = 'round'; X.beginPath(); X.moveTo(0, -100); X.lineTo(Math.sin(sway) * 30, -100 - Math.cos(sway) * 30); X.stroke();
  X.fillStyle = o.bulb || P.gold; X.beginPath(); X.arc(Math.sin(sway) * 30, -100 - Math.cos(sway) * 30, 8, 0, TAU); X.fill();
  X.fillStyle = col; for (const lx of [-24, 24]) { X.beginPath(); X.roundRect(lx - 9, -12, 18, 16, 6); X.fill(); }
  if (o.arms) { X.strokeStyle = col; X.lineWidth = 12; X.beginPath(); X.moveTo(-46, -60); X.lineTo(-62, -40 + Math.sin(t * 9 + seed) * 10); X.moveTo(46, -60); X.lineTo(64, -46 + o.arms); X.stroke(); }
  X.restore();
}

// ---------- isometric ----------
function isoP(cx, cy, u) { const c = Math.cos(Math.PI / 6), s = .5; return (x, y, z) => [cx + (x - y) * u * c, cy + (x + y) * u * s - z * u]; }
function face(pts, col, edge, ew = 1.5, a = 1) { X.beginPath(); pts.forEach((q, i) => (i ? X.lineTo(q[0], q[1]) : X.moveTo(q[0], q[1]))); X.closePath(); X.globalAlpha = a; X.fillStyle = col; X.fill(); if (edge) { X.strokeStyle = edge; X.lineWidth = ew; X.lineJoin = 'round'; X.stroke(); } X.globalAlpha = 1; }
// a box from (x,y,z) of size (dx,dy,dz): top, front-left (y+dy plane) and front-right (x+dx plane)
function isoBox(p, x, y, z, dx, dy, dz, cols, edge, ew = 1.5, a = 1) {
  face([p(x, y, z + dz), p(x + dx, y, z + dz), p(x + dx, y + dy, z + dz), p(x, y + dy, z + dz)], cols[0], edge, ew, a);
  face([p(x, y + dy, z), p(x + dx, y + dy, z), p(x + dx, y + dy, z + dz), p(x, y + dy, z + dz)], cols[1], edge, ew, a);
  face([p(x + dx, y, z), p(x + dx, y + dy, z), p(x + dx, y + dy, z + dz), p(x + dx, y, z + dz)], cols[2], edge, ew, a);
}
const VOX = { top: '#9fe8ff', left: '#3d76b8', right: '#25497f', edge: '#cfe9ff', gtop: '#ffe28a', gleft: '#e0a21e', gright: '#b77c10' };
// a voxel agent: a cube with a face on its front-left side
function voxBot(p, x, y, z, t, seed = 0, sz = .9) {
  const hop = Math.abs(Math.sin(t * 8 + seed)) * .5;
  isoBox(p, x, y, z + hop, sz, sz, sz, ['#c2fff0', '#4fc3a1', '#2f8f78'], '#e8fff8', 1.5);
  const a = p(x + sz * .25, y + sz, z + hop + sz * .62), b = p(x + sz * .7, y + sz, z + hop + sz * .62);
  const blink = ((t * 1.1 + seed) % 2.3) < .1 ? .2 : 1;
  X.fillStyle = '#10223a'; for (const q of [a, b]) { X.beginPath(); X.ellipse(q[0], q[1], 5, 8 * blink, 0, 0, TAU); X.fill(); }
}

// ---------- props ----------
function bubble(x, y, w, str, rot = 0, a = 1, flip = false) {
  X.save(); X.translate(x, y); X.rotate(rot); X.globalAlpha = a;
  X.fillStyle = '#eef0ff'; X.beginPath(); X.roundRect(-w / 2, -30, w, 60, 22); X.fill();
  X.beginPath(); X.moveTo(flip ? w / 2 - 34 : -w / 2 + 22, 26); X.lineTo(flip ? w / 2 - 14 : -w / 2 + 10, 46); X.lineTo(flip ? w / 2 - 54 : -w / 2 + 42, 26); X.fill();
  X.globalAlpha = a; txt(str, 0, 8, { fam: FT.m, size: 21, color: '#16203d', align: 'center', alpha: a });
  X.restore();
}
// the change: a diff card with a gold edge
function changeCard(x, y, sc = 1, rot = 0, a = 1, t = 0) {
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(sc, sc); X.globalAlpha = a;
  X.shadowColor = P.gold; X.shadowBlur = 16;
  X.fillStyle = '#101a3c'; X.beginPath(); X.roundRect(-120, -78, 240, 156, 12); X.fill(); X.shadowBlur = 0;
  X.strokeStyle = P.gold; X.lineWidth = 3; X.stroke();
  txt('CHANGE', -100, -44, { fam: FT.m, size: 20, weight: 700, color: P.gold, alpha: a });
  const rows = [['+', '#8bff5e', 150], ['+', '#8bff5e', 110], ['-', '#ff6b6b', 130], ['+', '#8bff5e', 90]];
  rows.forEach(([g, c, wd], i) => { txt(g, -100, -10 + i * 26, { fam: FT.m, size: 20, weight: 700, color: c, alpha: a }); X.globalAlpha = a * .8; X.fillStyle = c; X.fillRect(-76, -24 + i * 26, wd, 9); });
  X.restore(); X.globalAlpha = 1;
}
