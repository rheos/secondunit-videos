// Real Thing: painted backgrounds with NO outlines, and the camera.
'use strict';
// ---------------------------------------------------------------- painted backgrounds (no outlines)
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function blobs(g, list, col) { g.fillStyle = col; g.beginPath(); for (const [x, y, r] of list) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); } g.fill(); }
function sunHalo(g, x, y, r, t) {
  for (let i = 4; i >= 1; i--) { g.fillStyle = `rgba(255,246,214,${.07 + (4 - i) * .03})`; g.beginPath(); g.arc(x, y, r * (1 + i * .55), 0, TAU); g.fill(); }
  g.fillStyle = '#fff4cf'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
}
function rays(g, t, x0, alpha = 1) {
  g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 5; i++) {
    const x = x0 + i * 230, a = (.05 + .035 * Math.sin(t * .9 + i * 1.7)) * alpha, w = 90 + i * 20;
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, `rgba(255,250,220,${a * 1.6})`); gr.addColorStop(1, 'rgba(255,250,220,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x, -20); g.lineTo(x + w, -20); g.lineTo(x + w + 380, H); g.lineTo(x + 380, H); g.closePath(); g.fill();
  }
  g.restore();
}
function flowers(g, seed, n, y0, y1, cols) {
  const r = M32(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = y0 + r() * (y1 - y0), s = 5 + r() * 7 * (y / H), c = cols[(r() * cols.length) | 0];
    g.fillStyle = c; g.beginPath();
    for (let j = 0; j < 10; j++) { const a = j * Math.PI / 5, rr = j % 2 ? s * .4 : s; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fill();
  }
}
function tufts(g, seed, n, y0, y1, col) {
  const r = M32(seed); g.strokeStyle = col; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = r() * W, y = y0 + r() * (y1 - y0), h = 8 + r() * 16 * (y / H); g.lineWidth = 2; g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x - 7, y - h * .7); g.moveTo(x, y); g.lineTo(x + 1, y - h); g.moveTo(x + 5, y); g.lineTo(x + 8, y - h * .6); g.stroke(); }
}
// ---- sky palettes. o.sky = 'day' | 'dawn' | 'dusk' | 'night' | 'dream', or [from, to, k] to blend two of them.
// sky: three gradient stops; tint: an rgba wash laid over the land only (source-atop on an offscreen copy);
// sun: disc colour (the moon at night); halo: halo rgb; rays: light-ray strength; stars: star alpha.
const PAL = {
  day: { sky: ['#9fcfc4', '#d8ead0', '#f6e7bf'], tint: [0, 0, 0, 0], sun: '#fff4cf', halo: [255, 246, 214], rays: 1, stars: 0 },
  dawn: { sky: ['#6f86b8', '#d9a7b9', '#f7c99a'], tint: [60, 70, 135, .38], sun: '#ffd9a0', halo: [255, 214, 170], rays: .5, stars: .15 },
  dusk: { sky: ['#4b4f8f', '#d9779a', '#f6b26b'], tint: [125, 50, 75, .36], sun: '#ffb36b', halo: [255, 170, 110], rays: .7, stars: .1 },
  night: { sky: ['#0b1430', '#1c2a58', '#33467a'], tint: [30, 44, 96, .5], sun: '#f2f0dc', halo: [190, 205, 255], rays: 0, stars: 1 },
  dream: { sky: ['#c3a3ea', '#f3c3dc', '#ffe1c4'], tint: [225, 140, 210, .3], sun: '#fff0f8', halo: [255, 220, 245], rays: .8, stars: .3 },
};
const hx2 = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixHex = (a, b, k) => '#' + hx2(a).map((v, i) => Math.round(v + (hx2(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
function palette(sky) {
  if (!sky) return PAL.day; if (typeof sky === 'string') return PAL[sky];
  const [A, B, k0] = sky, a = PAL[A], b = PAL[B], k = cl(k0);
  return { sky: a.sky.map((c, i) => mixHex(c, b.sky[i], k)), tint: a.tint.map((v, i) => lerp(v, b.tint[i], k)), sun: mixHex(a.sun, b.sun, k),
    halo: a.halo.map((v, i) => lerp(v, b.halo[i], k)), rays: lerp(a.rays, b.rays, k), stars: lerp(a.stars, b.stars, k) };
}
let LAND = null;
// the jungle clearing; `hz` is the horizon line, `sunX` the sun, `sky` the palette (see PAL)
function jungle(g, t, o = {}) {
  const hz = o.hz ?? 620, pal = palette(o.sky);
  g.fillStyle = vgrad(g, 0, hz, [[0, pal.sky[0]], [.55, pal.sky[1]], [1, pal.sky[2]]]); g.fillRect(-W, -H, 3 * W, hz + 2 + H);
  if (pal.stars > 0) { const r = M32(77); g.fillStyle = '#fffbe8'; for (let i = 0; i < 140; i++) { const x = r() * W, y = r() * hz * .9, s = .8 + r() * 1.8; g.globalAlpha = pal.stars * (.4 + .6 * Math.abs(Math.sin(t * (.6 + r()) + i))); g.fillRect(x, y, s, s); } g.globalAlpha = 1; }
  const sx = o.sunX ?? 1460, sy = o.sunY ?? 230, sr = o.sunR ?? 70;
  for (let i = 4; i >= 1; i--) { g.fillStyle = `rgba(${pal.halo.map(Math.round).join(',')},${.07 + (4 - i) * .03})`; g.beginPath(); g.arc(sx, sy, sr * (1 + i * .55), 0, TAU); g.fill(); }
  g.fillStyle = pal.sun; g.beginPath(); g.arc(sx, sy, sr, 0, TAU); g.fill();
  // the land goes on an offscreen copy with the same camera, so the palette's wash tints it and not the sky
  if (!LAND) { LAND = document.createElement('canvas'); LAND.width = W; LAND.height = H; }
  const G0 = g; g = LAND.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H); g.setTransform(G0.getTransform());
  // far canopy, then mid, then near (lighter and bluer with distance)
  const far = M32(5), mid = M32(6), near = M32(7);
  blobs(g, [...Array(26)].map((_, i) => [i * 80 + far() * 40, hz - 60 - far() * 70, 70 + far() * 40]), '#9cc4a5');
  g.fillStyle = '#9cc4a5'; g.fillRect(0, hz - 70, W, 80);
  blobs(g, [...Array(18)].map((_, i) => [i * 115 + mid() * 50, hz - 10 - mid() * 60, 85 + mid() * 50]), '#6fa47c');
  g.fillStyle = '#6fa47c'; g.fillRect(0, hz - 20, W, 40);
  // ground
  g.fillStyle = vgrad(g, hz, H, [[0, '#7fae5c'], [1, '#5c8f45']]); g.fillRect(0, hz, W, H - hz);
  g.fillStyle = 'rgba(40,70,30,.12)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(near() * W, hz + 120 + near() * 300, 300 + near() * 200, 30, 0, 0, TAU); g.fill(); }
  tufts(g, 11, 160, hz + 20, H, '#4c7d3a'); flowers(g, 12, 120, hz + 40, H, ['#f6c7d8', '#fff1a8', '#ffffff', '#f2a65a', '#cdb8ef']);
  // the tree on the left: trunk with a light side, canopy blobs, vines
  if (o.tree !== false) {
    const tx = o.treeX ?? 300;
    g.fillStyle = vgrad(g, 0, hz + 60, [[0, '#6a4b33'], [1, '#4c3424']]); g.beginPath(); g.moveTo(tx - 60, hz + 60); g.lineTo(tx - 38, -20); g.lineTo(tx + 38, -20); g.lineTo(tx + 70, hz + 60); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,230,180,.16)'; g.beginPath(); g.moveTo(tx + 10, hz + 60); g.lineTo(tx + 12, -20); g.lineTo(tx + 38, -20); g.lineTo(tx + 70, hz + 60); g.closePath(); g.fill();
    const cn = M32(8);
    blobs(g, [...Array(14)].map(() => [tx - 260 + cn() * 620, 20 + cn() * 170, 90 + cn() * 70]), '#3f7a4c');
    blobs(g, [...Array(10)].map(() => [tx - 200 + cn() * 520, 10 + cn() * 120, 70 + cn() * 50]), '#4f8f57');
    blobs(g, [...Array(7)].map(() => [tx - 160 + cn() * 420, cn() * 90, 50 + cn() * 40]), '#66a865');
    g.strokeStyle = '#335f3b'; g.lineWidth = 6; for (let i = 0; i < 4; i++) { const vx = tx - 150 + i * 120; g.beginPath(); g.moveTo(vx, 120); g.quadraticCurveTo(vx + 30 * Math.sin(t * .8 + i), 300, vx + 10, 380 + i * 40); g.stroke(); }
  }
  // big near ferns in the corners
  const fern = (x, y, s, a, col) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; for (let i = 0; i < 7; i++) { g.save(); g.rotate((i - 3) * .28); g.beginPath(); g.ellipse(0, -s * .55, s * .12, s * .55, 0, 0, TAU); g.fill(); g.restore(); } g.restore(); };
  if (o.ferns !== false) { fern(80, H + 30, 300, .2, '#3e7140'); fern(W - 60, H + 40, 340, -.25, '#3a6a3c'); fern(W - 260, H + 60, 220, .1, '#4d8a4c'); }
  if (o.land) o.land(g); // an act can add its own scenery to the land layer (it gets the same wash)
  if (pal.tint[3] > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(${pal.tint.slice(0, 3).map(Math.round).join(',')},${pal.tint[3]})`; g.fillRect(0, 0, W, H); g.restore(); }
  G0.save(); G0.setTransform(1, 0, 0, 1, 0, 0); G0.drawImage(LAND, 0, 0); G0.restore();
  rays(G0, t, o.raysX ?? 380, (o.rays ?? 1) * pal.rays);
}
function rock(g, x, y, s, split = 0) {
  const half = (dir) => { g.save(); g.translate(dir * split * 60, split * 10); g.rotate(dir * split * .2);
    g.fillStyle = '#8e8a84'; g.beginPath(); g.moveTo(x, y - s * .9); g.quadraticCurveTo(x + dir * s * 1.1, y - s * .9, x + dir * s * 1.2, y); g.lineTo(x, y); g.closePath(); g.fill();
    g.fillStyle = '#a7a39c'; g.beginPath(); g.moveTo(x, y - s * .9); g.quadraticCurveTo(x + dir * s * .7, y - s * .85, x + dir * s * .65, y - s * .45); g.lineTo(x, y - s * .5); g.closePath(); g.fill(); g.restore(); };
  g.fillStyle = 'rgba(30,45,25,.22)'; g.beginPath(); g.ellipse(x, y + 4, s * 1.4, s * .14, 0, 0, TAU); g.fill();
  half(-1); half(1);
  if (split > 0 && split < .35) { g.strokeStyle = '#4a4744'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y - s * .9); g.lineTo(x - 10, y - s * .5); g.lineTo(x + 8, y - s * .3); g.lineTo(x, y); g.stroke(); }
}


// camera: zoom about a point, eased across the shot
function cam(g, lt, d, z0, z1, fx, fy) { const z = lerp(z0, z1, eio(lt / d)); g.translate(fx, fy); g.scale(z, z); g.translate(-fx, -fy); }
const GROUND = 905;
