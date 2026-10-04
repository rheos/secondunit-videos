// The junkyard kit: paper stocks, torn scraps, stop-motion jitter, junk. Top-level names are global.
// ---- paper stock, made once (seeded, so every worker gets the same sheets) ----
const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); fn(g, w, h); return c; };
const speck = (g, w, h, n, col, r0, r1, seed) => { const r = rng(seed); g.fillStyle = col; for (let i = 0; i < n; i++) { g.globalAlpha = .2 + r() * .5; g.beginPath(); g.arc(r() * w, r() * h, r0 + r() * (r1 - r0), 0, TAU); g.fill(); } g.globalAlpha = 1; };
const STOCK = {
  // newsprint: grey paper, columns of illegible "type" (dashes), a halftone photo block
  news: mk(512, 512, (g, w, h) => {
    g.fillStyle = '#d9d3c4'; g.fillRect(0, 0, w, h); const r = rng(11); g.fillStyle = '#3a3733';
    for (let col = 0; col < 3; col++) for (let y = 8; y < h; y += 11) { let x = 10 + col * 168; while (x < col * 168 + 158) { const L = 4 + r() * 22; if (r() > .08) g.fillRect(x, y, L, 3.2); x += L + 3; } }
    for (let y = 290; y < 470; y += 7) for (let x = 190; x < 330; x += 7) { const v = .5 + .5 * Math.sin(x * .05) * Math.cos(y * .04); g.beginPath(); g.arc(x, y, 3.4 * v, 0, TAU); g.fill(); }
    speck(g, w, h, 400, '#8a8270', .5, 1.6, 12);
  }),
  // kraft: brown paper with fibres
  kraft: mk(512, 512, (g, w, h) => {
    g.fillStyle = '#b48a5c'; g.fillRect(0, 0, w, h); const r = rng(21);
    for (let i = 0; i < 900; i++) { g.strokeStyle = r() > .5 ? 'rgba(90,60,30,.25)' : 'rgba(230,200,150,.25)'; g.lineWidth = .6 + r(); const x = r() * w, y = r() * h, a = r() * TAU, L = 6 + r() * 24; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  }),
  // brick: kraft printed with red brick courses
  brick: mk(512, 512, (g, w, h) => {
    g.fillStyle = '#7e3b2c'; g.fillRect(0, 0, w, h); const r = rng(31);
    for (let y = 0, row = 0; y < h; y += 34, row++) for (let x = (row % 2) * -40; x < w; x += 80) { g.fillStyle = `rgb(${150 + r() * 50 | 0},${60 + r() * 30 | 0},${45 + r() * 20 | 0})`; g.fillRect(x + 3, y + 3, 74, 28); }
    speck(g, w, h, 600, '#3a1a12', .5, 2, 32);
  }),
  // poster: faded red with yellow halftone
  poster: mk(512, 512, (g, w, h) => {
    g.fillStyle = '#c8392b'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2c14e';
    for (let y = 0; y < h; y += 12) for (let x = (y / 12 % 2) * 6; x < w; x += 12) { const v = .5 + .5 * Math.sin((x + y) * .02); g.beginPath(); g.arc(x, y, 4.2 * v, 0, TAU); g.fill(); }
    speck(g, w, h, 300, '#fff4d8', .5, 2.5, 41);
  }),
  // mustard: yellow stock for the bursts
  mustard: mk(256, 256, (g, w, h) => { g.fillStyle = '#e8b53a'; g.fillRect(0, 0, w, h); speck(g, w, h, 300, '#a8741a', .5, 2, 51); }),
  // tin: brushed silver with rust blooms
  tin: mk(512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#c9cdd0'); gr.addColorStop(.5, '#8d9499'); gr.addColorStop(1, '#d8dcde'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(61); for (let i = 0; i < 500; i++) { g.strokeStyle = `rgba(255,255,255,${r() * .3})`; g.beginPath(); const y = r() * h; g.moveTo(0, y); g.lineTo(w, y + r() * 6); g.stroke(); }
    for (let i = 0; i < 14; i++) { const x = r() * w, y = r() * h, R = 10 + r() * 40; const rg = g.createRadialGradient(x, y, 0, x, y, R); rg.addColorStop(0, 'rgba(150,70,25,.85)'); rg.addColorStop(1, 'rgba(150,70,25,0)'); g.fillStyle = rg; g.fillRect(x - R, y - R, R * 2, R * 2); }
  }),
  rust: mk(512, 512, (g, w, h) => { g.fillStyle = '#8c4a22'; g.fillRect(0, 0, w, h); speck(g, w, h, 1400, '#c9733a', .6, 3, 71); speck(g, w, h, 800, '#3e1e0c', .6, 2.5, 72); }),
  // blue tissue (translucent, drawn with alpha)
  tissue: mk(256, 256, (g, w, h) => { g.fillStyle = '#5d8ed6'; g.fillRect(0, 0, w, h); speck(g, w, h, 200, '#a9c6f0', 1, 4, 81); }),
  // bottle-green magazine stock
  green: mk(256, 256, (g, w, h) => { g.fillStyle = '#2f6b45'; g.fillRect(0, 0, w, h); g.fillStyle = '#5f9b6a'; for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill(); } }),
  // night: inky blue print
  night: mk(512, 512, (g, w, h) => { g.fillStyle = '#1d2a4a'; g.fillRect(0, 0, w, h); speck(g, w, h, 500, '#3a4f80', .6, 2.4, 91); speck(g, w, h, 120, '#e8e0c0', .4, 1.2, 92); }),
  cream: mk(256, 256, (g, w, h) => { g.fillStyle = '#efe6cf'; g.fillRect(0, 0, w, h); speck(g, w, h, 200, '#b8ab8a', .4, 1.4, 101); }),
};
const PAT = {}; let patFor = null;
function pat(name) { if (patFor !== s) { patFor = s; for (const k of Object.keys(STOCK)) PAT[k] = s.createPattern(STOCK[k], 'repeat'); } return PAT[name]; }

// ---- scraps ----
const Q = (t) => onTwos(t, 12);
// tear a polygon: subdivide, and rip the edge with fine jagged noise
function torn(pts, seed, rip = 5) {
  const o = [], n = pts.length;
  for (let i = 0; i < n; i++) { const p0 = pts[i], p1 = pts[(i + 1) % n], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), k = Math.max(2, Math.round(L / 9));
    for (let j = 0; j < k; j++) { const u = j / k, x = lerp(p0[0], p1[0], u), y = lerp(p0[1], p1[1], u), h = hash((i * 131 + j) * 7 + seed * 977); o.push([x + (h - .5) * rip + snoise(x * .03 + y * .02, seed) * rip * 1.4, y + (hash((i * 131 + j) * 11 + seed * 571) - .5) * rip + snoise(y * .03 - x * .01, seed + 2) * rip * 1.4]); } }
  return o;
}
const path = (pts) => { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); };
// a cut-out: shadow, a white torn rim, then the stock. o: { stock, seed, rim, shadow, alpha, ox, oy (pattern offset), scale }
function scrap(pts, o = {}) {
  const { stock = 'kraft', seed = 0, rim = 4, shadow = 1, alpha = 1, ox = 0, oy = 0, scale = 1, color = null, tear = 5 } = o;
  const tp = torn(pts, seed, tear);
  s.save(); s.globalAlpha = alpha;
  if (shadow) { s.shadowColor = 'rgba(20,12,6,.45)'; s.shadowBlur = 14 * shadow; s.shadowOffsetX = 5 * shadow; s.shadowOffsetY = 8 * shadow; }
  if (rim) { path(torn(pts.map(([x, y]) => [x, y]), seed + 5, tear + rim)); s.fillStyle = '#f4efe2'; s.fill(); }
  s.shadowColor = 'transparent';
  path(tp); s.save(); s.clip();
  if (color) { s.fillStyle = color; s.fill(); }
  else { s.translate(ox, oy); s.scale(scale, scale); s.fillStyle = pat(stock); s.fillRect(-4000, -4000, 8000, 8000); }
  s.restore(); s.restore();
}
const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const circ = (x, y, r, n = 40) => [...Array(n)].map((_, i) => [x + Math.cos(i / n * TAU) * r, y + Math.sin(i / n * TAU) * r]);
// stop-motion jitter for a piece: [dx, dy, drot], re-rolled each drawing
const jit = (t, id, amt = 1) => { const k = Math.floor(t * 12); return [(hash(k * 13 + id * 101) - .5) * 4 * amt, (hash(k * 17 + id * 103) - .5) * 4 * amt, (hash(k * 19 + id * 107) - .5) * .02 * amt]; };
function place(t, id, x, y, rot, fn, amt = 1) { const [dx, dy, dr] = jit(t, id, amt); s.save(); s.translate(x + dx, y + dy); s.rotate(rot + dr); fn(); s.restore(); }
// the table: kraft under everything, scraps of newsprint already glued down
function table(t, stock = 'kraft') { s.fillStyle = pat(stock); s.fillRect(-W, -H, W * 3, H * 3); }

// ---- junk ----
function hubcap(r, seed = 0) { scrap(circ(0, 0, r), { stock: 'tin', seed, scale: r / 260 }); for (const k of [.72, .45]) { s.strokeStyle = 'rgba(40,40,45,.5)'; s.lineWidth = Math.max(2, r * .03); s.beginPath(); s.arc(0, 0, r * k, 0, TAU); s.stroke(); } scrap(circ(0, 0, r * .18, 16), { stock: 'rust', seed: seed + 3, rim: 2, shadow: .4 }); }
function can(w, h, seed = 0) { scrap(rect(-w / 2, -h, w, h), { stock: 'tin', seed, scale: .5 }); scrap(rect(-w / 2, -h * .75, w, h * .45), { stock: seed % 2 ? 'poster' : 'news', seed: seed + 1, rim: 2, shadow: .3 }); }
function bottle(w, h, seed = 0, stock = 'green') {
  const b = [[-w / 2, 0], [-w / 2, -h * .62], [-w * .17, -h * .8], [-w * .15, -h], [w * .15, -h], [w * .17, -h * .8], [w / 2, -h * .62], [w / 2, 0]];
  scrap(b, { stock, seed, tear: 3 });
  s.fillStyle = 'rgba(255,255,255,.35)'; s.fillRect(-w * .32, -h * .58, w * .1, h * .45);
}
function lid(r, seed = 0) { scrap(circ(0, 0, r), { stock: 'rust', seed, scale: .6 }); scrap(rect(-r * .2, -r * .16, r * .4, r * .32), { stock: 'tin', seed: seed + 2, rim: 2, shadow: .6 }); }
function spoon(L, seed = 0) { scrap([[-L * .05, 0], [L * .05, 0], [L * .04, -L * .7], [L * .12, -L * .82], [L * .1, -L], [-L * .1, -L], [-L * .12, -L * .82], [-L * .04, -L * .7]], { stock: 'tin', seed, rim: 2, tear: 2 }); }
