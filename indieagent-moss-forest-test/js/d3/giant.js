// d3 giant: an upright piano the forest grew over, drawn as a cel: flat tones, one shadow shape per mass,
// a soft dark line on the silhouette and the big shapes, a backlit rim. It wakes, rises and takes one step.
const FLOOR = 592, BX0 = 772, HIPX = 92, STANCE = 122, LEG0 = 92, BY1 = 506;
const T = { stir: 3.0, fb0: 3.6, fb1: 110 / 24, lid0: 4.2, lid1: 5.0, dip: 5.0, rise0: 5.4, rise1: 8.6, settle: 9.2,
  lean1: 9.8, lLift: 9.8, lPlant: 262 / 24, rLift: 11.6, rPlant: 302 / 24 };
const CEL = {
  wood: hex('#6f5548'), woodS: hex('#463c44'), woodD: hex('#2a2228'), line: 'rgba(40,28,30,.58)', inner: 'rgba(48,34,32,.42)',
  stone: hex('#8d8478'), stoneS: hex('#6a645f'), rust: hex('#b4532f'), rustS: hex('#7c3a2a'), ivory: hex('#eadfc4'),
  ivoryS: hex('#b9ad98'), kblk: hex('#3b302e'), dark: hex('#2b2226'), gold: hex('#d9b56a'), candle: hex('#efe6d0'),
  moss: hex('#4c7434'), mossS: hex('#28483e'), mossL: hex('#7fa23a'), mossH: hex('#b9cf52'), mossLine: 'rgba(30,46,36,.55)', rim: hex('#ffe6a6'),
};
const CLODC = new Map();
function clod(g, x, y, r, land = 0, seed = 1) {
  const key = seed; let c = CLODC.get(key);
  if (!c) { const R = Math.ceil(r) + 8; c = canvas(R * 4, R * 3); const q = c.getContext('2d'); q.translate(R * 2, R * 1.5); mossMass(q, -r * 1.5, r * 1.5, (u) => -r * .7 * Math.sqrt(Math.max(0, 1 - u * u / (r * r * 2.25))), (u) => r * .55 * Math.sqrt(Math.max(0, 1 - u * u / (r * r * 2.25))), 50 + seed); CLODC.set(key, c); }
  g.save(); g.translate(x, y); g.scale(1 + land * .15, 1 - land * .45); g.drawImage(c, -c.width / 2, -c.height / 2); g.restore();
}
const SUNDIR = [-.5, -.86]; // toward the sun from the giant, in its own coordinates

// a cel lump of moss: outline, flat base, one shadow crescent away from the sun, one lit crescent toward it
function lump(g, x, y, r, o = {}) {
  const base = o.base || CEL.moss, sh = o.shade || CEL.mossS, lt = o.lit || CEL.mossL;
  g.lineWidth = o.lw || 3.6; g.strokeStyle = o.line || CEL.mossLine; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
  g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip();
  g.fillStyle = css(sh); g.fillRect(x - r - 2, y - r - 2, 2 * r + 4, 2 * r + 4);
  g.fillStyle = css(base); g.beginPath(); g.arc(x + SUNDIR[0] * r * .34, y + SUNDIR[1] * r * .34, r, 0, TAU); g.fill();
  g.fillStyle = css(lt); g.beginPath(); g.arc(x + SUNDIR[0] * r * .8, y + SUNDIR[1] * r * .8, r * .92, 0, TAU); g.fill();
  g.restore();
}
// a blanket of moss: one shape with a lumpy top and a scalloped hem, flat base, one dark band under the hem,
// flat lit patches on the sun side, a few small tufts. Cel, not bubbles.
function mossMass(g, x0, x1, top, bot, seed = 1) {
  const n = Math.max(14, Math.round((x1 - x0) / 7)), pts = [], hem = [];
  for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n), k = Math.sin(Math.PI * i / n);
    const amp = Math.min(1, (x1 - x0) / 130), yt = top(x) - amp * k * (4 * vn2(x * .08, 1, seed) + 7 * Math.abs(Math.sin(x * .058 + seed * 1.7))), yb = bot(x) + amp * k * (Math.abs(Math.sin(x * .11 + seed)) * 9 + (vn2(x * .05, 2, seed) - .5) * 14);
    const ym = (yt + yb) / 2, rnd = Math.pow(k, .3); // ends close in a round shoulder, never a cut edge
    pts.push([x, ym + (yt - ym) * rnd]); hem.push([x, ym + (yb - ym) * rnd]); }
  const shape = (dy = 0, dx = 0) => {
    const ring = [...pts, ...hem.slice().reverse()], m = ring.length, p = new Path2D();
    const mid = (a, b) => [(a[0] + b[0]) / 2 + dx, (a[1] + b[1]) / 2 + dy];
    p.moveTo(...mid(ring[m - 1], ring[0]));
    for (let i = 0; i < m; i++) p.quadraticCurveTo(ring[i][0] + dx, ring[i][1] + dy, ...mid(ring[i], ring[(i + 1) % m]));
    p.closePath(); return p; };
  const P0 = shape(); g.lineJoin = 'round';
  { g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(28,20,26,.34)'; g.fill(shape(9, 4)); g.restore(); }
  g.lineWidth = 4; g.strokeStyle = CEL.mossLine; g.stroke(P0);
  g.fillStyle = css(CEL.mossS); g.fill(P0);
  g.save(); g.clip(P0);
  g.fillStyle = css(CEL.moss); g.fill(shape(-11, -5));
  // flat lit patches, thick toward the top and the sun-side, each a little cloud of two or three overlapping ovals
  const yMin = Math.min(...pts.map((q) => q[1])), yMax = Math.max(...hem.map((q) => q[1])), span = yMax - yMin, A = (x1 - x0) * span / 170;
  for (let i = 0; i < A; i++) {
    const x = lerp(x0, x1, h2(i, 1, seed)), v = Math.pow(h2(i, 2, seed), 1.5), y = yMin + v * span, sunny = (1 - v) * .75 + .4 * (1 - (x - x0) / (x1 - x0));
    if (h2(i, 3, seed) > sunny * .72) continue;
    const r = 5 + h2(i, 4, seed) * 11, hi = h2(i, 5, seed) < .16;
    g.fillStyle = css(hi ? CEL.mossH : CEL.mossL);
    for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(x + (k - 1) * r * .85, y + (h2(i, k + 6, seed) - .5) * r * .7, r * (.7 + h2(i, k + 9, seed) * .4), r * .42, (h2(i, k + 12, seed) - .5) * .6, 0, TAU); g.fill(); }
  }
  // tufts: small dark flecks that give it scale
  for (let i = 0; i < A * .9; i++) { const x = lerp(x0, x1, h2(i, 21, seed)), y = lerp(yMin, yMax, h2(i, 22, seed)); g.fillStyle = css(CEL.mossS, .8); g.beginPath(); g.ellipse(x, y, 2 + h2(i, 23, seed) * 3, 1.2, (h2(i, 24, seed) - .5), 0, TAU); g.fill(); }
  for (let i = 0; i < A * .55; i++) { const x = lerp(x0, x1, h2(i, 31, seed)), y = lerp(yMin, yMax, h2(i, 32, seed)), r = 3 + h2(i, 33, seed) * 6, a0 = h2(i, 34, seed) * TAU, pts = []; for (let k = 0; k <= 6; k++) { const a = a0 + k / 6 * 2.2; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * .65]); } ink(g, pts, 1.5, .3, 'rgba(24,38,32,.55)'); }
  g.restore();
}
function ink(g, pts, w0, w1, col = 'rgba(34,24,26,.72)') {
  const n = pts.length - 1, L = [], R = [];
  pts.forEach((q, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, k = i / n, w = lerp(w0, w1, k) * Math.sin(Math.PI * clamp(k * .92 + .06)) * .5 + .05; L.push([q[0] - dy / d * w, q[1] + dx / d * w]); R.push([q[0] + dy / d * w, q[1] - dx / d * w]); });
  g.fillStyle = col; g.beginPath(); L.forEach((q, i) => (i ? g.lineTo : g.moveTo).call(g, q[0], q[1])); for (let i = n; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fill();
}
function grain(g, x0, y0, x1, y1, n, seed) { // hand-drawn wood grain, cracks and scratches, running with the panel
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, h2(i, 1, seed)), y = lerp(y0, y1, h2(i, 2, seed)), len = 22 + h2(i, 3, seed) * 80, pts = [], heavy = h2(i, 4, seed) < .13;
    for (let k = 0; k <= 8; k++) pts.push([x + 3.2 * Math.sin(k * .8 + i) * (k / 8), Math.min(y1, y + len * k / 8)]);
    ink(g, pts, heavy ? 2.1 : 1, .3, heavy ? 'rgba(30,20,22,.62)' : 'rgba(34,24,26,.3)');
  }
}
function flowers(g, list, seed) { // wildflowers in the moss: a stem, five flat petals, an inked edge
  list.forEach(([x, y], i) => {
    const c = hex(['#f4efe0', '#e9c64a', '#c0582f', '#f4efe0', '#d9a7c0'][(i + seed) % 5]), r = 2.6 + h2(i, 1, seed) * 2.2;
    g.strokeStyle = css(CEL.mossS); g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y + 8); g.lineTo(x, y); g.stroke();
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + i; g.beginPath(); g.ellipse(x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .65, r * .72, r * .45, a, 0, TAU); g.fillStyle = css(c); g.fill(); g.lineWidth = .7; g.strokeStyle = 'rgba(34,24,26,.5)'; g.stroke(); }
    g.fillStyle = '#c9972f'; g.beginPath(); g.arc(x, y, r * .32, 0, TAU); g.fill();
  });
}
function rrect(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; }
function celFill(g, p, base, line = CEL.line, lw = 4) { g.lineWidth = lw; g.strokeStyle = line; g.lineJoin = 'round'; g.stroke(p); g.fillStyle = css(base); g.fill(p); }
// a fern frond: a curved midrib with paired leaflets, flat cel green
function frond(g, x, y, len, ang, curl, R0) {
  const pts = []; for (let i = 0; i <= 14; i++) { const k = i / 14, a = ang + curl * k * k; pts.push([x + Math.cos(a) * len * k, y + Math.sin(a) * len * k, a]); }
  const leaf = (lw, col) => pts.forEach(([px, py, a], i) => {
    if (i < 2) return; const s = (1 - i / 14) * 11 + 3;
    for (const sd of [-1, 1]) { const b = a + sd * 1.25; g.fillStyle = col; g.strokeStyle = CEL.mossLine; g.lineWidth = lw;
      g.beginPath(); g.ellipse(px + Math.cos(b) * s * .55, py + Math.sin(b) * s * .55, s * .62, s * .22, b, 0, TAU); lw ? g.stroke() : g.fill(); }
  });
  leaf(2.4, null); leaf(0, css(CEL.moss));
  pts.forEach(([px, py, a], i) => { if (i < 5) return; const s = (1 - i / 14) * 11 + 3, b = a - 1.25; g.fillStyle = css(CEL.mossL); g.beginPath(); g.ellipse(px + Math.cos(b) * s * .6, py + Math.sin(b) * s * .6, s * .4, s * .14, b, 0, TAU); g.fill(); });
}

// sprites: body (cabinet, panels, keys, sconces, patches, side moss) and lid (slab and moss mound), with baked rims
const GO = { x: 240, y: 410 }; // sprite origin = body bottom centre
function sprite(w, h) { const c = canvas(w, h), g = c.getContext('2d'); g.translate(GO.x, GO.y); return [c, g]; }
function rimOf(c, dx, dy) {
  const r = canvas(c.width, c.height), q = r.getContext('2d');
  q.drawImage(c, 0, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = css(CEL.rim); q.fillRect(0, 0, r.width, r.height);
  q.globalCompositeOperation = 'destination-out'; q.drawImage(c, dx, dy);
  const o = blurred(r, .9), m = o.getContext('2d'); m.globalCompositeOperation = 'destination-in'; m.drawImage(c, 0, 0); return o;
}
function bakeBody() {
  const [c, g] = sprite(480, 470), R0 = rng(201);
  // the side of the cabinet, going back from the front face: this is what makes it a mass, not a card
  { const sp = new Path2D(); sp.moveTo(146, -226); sp.lineTo(208, -262); sp.quadraticCurveTo(216, -262, 216, -250); sp.lineTo(216, -30); sp.quadraticCurveTo(216, -22, 208, -18); sp.lineTo(146, 0); sp.closePath();
    celFill(g, sp, CEL.woodS, CEL.line, 5); g.save(); g.clip(sp); g.fillStyle = css(CEL.woodD, .55); g.beginPath(); g.moveTo(150, -110); g.lineTo(220, -150); g.lineTo(220, 10); g.lineTo(150, 10); g.fill(); g.restore(); }
  const cab = rrect(-150, -250, 300, 250, [42, 42, 8, 8]);
  celFill(g, cab, CEL.wood, CEL.line, 5);
  g.save(); g.clip(cab);
  // one shadow shape: the side away from the sun, the band under the keybed, the foot of the cabinet
  g.fillStyle = css(CEL.woodS); g.beginPath(); g.moveTo(74, -260); g.bezierCurveTo(96, -170, 84, -90, 104, 10); g.lineTo(170, 10); g.lineTo(170, -260); g.fill();
  g.fillRect(-160, -108, 330, 14); g.fillRect(-160, -24, 330, 30);
  // panels: carved insets, thin inner lines only
  g.strokeStyle = CEL.inner; g.lineWidth = 2;
  g.stroke(rrect(-124, -232, 248, 66, 8)); g.stroke(rrect(-118, -96, 236, 66, 8));
  // fretwork in the upper panel: a row of tall slots, asymmetric under the moss
  g.fillStyle = css(CEL.woodD);
  for (let i = 0; i < 13; i++) { const x = -108 + i * 17.5; g.beginPath(); g.roundRect(x, -222, 7, 46, 3.5); g.fill(); }
  // the moss mound's cast shadow across the top of the cabinet, and rain stains running down from it
  g.fillStyle = 'rgba(28,20,28,.5)'; g.beginPath(); g.moveTo(-170, -260); g.lineTo(170, -260); g.lineTo(170, -212); for (let x = 170; x >= -170; x -= 14) g.lineTo(x, -218 + 9 * Math.sin(x * .05) + 5 * vn2(x * .1, 3, 9)); g.closePath(); g.fill();
  for (let i = 0; i < 16; i++) { const x = -140 + h2(i, 1, 91) * 280, y = -214, l = 28 + h2(i, 2, 91) * 90; const gr = g.createLinearGradient(0, y, 0, y + l); gr.addColorStop(0, 'rgba(30,22,28,.34)'); gr.addColorStop(1, 'rgba(30,22,28,0)'); g.fillStyle = gr; g.fillRect(x, y, 3 + h2(i, 3, 91) * 9, l); }
  grain(g, -148, -246, 148, -160, 76, 93); grain(g, -148, -104, 148, -2, 86, 95);
  // weathered patches: veneer gone, the grey core showing
  for (const [x, y, rx, ry] of [[62, -206, 30, 17], [-96, -58, 26, 20], [-30, -238, 16, 7]]) {
    const p = new Path2D(); for (let i = 0; i <= 18; i++) { const a = i / 18 * TAU, k = .78 + .3 * vn2(i * .7, x, 3); (i ? p.lineTo : p.moveTo).call(p, x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k); }
    p.closePath(); g.fillStyle = css(CEL.stone); g.fill(p); g.save(); g.clip(p); g.fillStyle = css(CEL.stoneS); g.beginPath(); g.ellipse(x + rx * .45, y + ry * .5, rx, ry * .8, 0, 0, TAU); g.fill(); g.restore();
    g.strokeStyle = CEL.inner; g.lineWidth = 1.6; g.stroke(p);
  }
  // key recess and the keys behind the fallboard
  g.fillStyle = css(CEL.dark); g.fillRect(-142, -154, 284, 34);
  const kw = 276 / 52;
  for (let i = 0; i < 52; i++) {
    const x = -138 + i * kw, gone = h2(i, 1, 7) < .07, sunk = h2(i, 2, 7) < .12 ? 2.5 : 0;
    if (gone) continue;
    g.fillStyle = css(mixc(CEL.ivory, hex('#d8c48f'), h2(i, 3, 7) * .6)); g.fillRect(x + .5, -150 + sunk, kw - 1, 28);
    g.fillStyle = css(CEL.ivoryS); g.fillRect(x + .5, -150 + sunk, kw - 1, 5);
  }
  for (let i = 0; i < 51; i++) if ([0, 1, 3, 4, 5].includes(i % 7) && h2(i, 4, 7) > .08) { g.fillStyle = css(CEL.kblk); g.fillRect(-138 + (i + 1) * kw - 1.7, -150, 3.4, 16); }
  // pedals
  for (const x of [-16, 0, 16]) { g.fillStyle = css(CEL.rust); g.beginPath(); g.roundRect(x - 4, -16, 8, 10, 3); g.fill(); g.strokeStyle = CEL.inner; g.lineWidth = 1.2; g.stroke(); }
  g.restore();
  // inked edge lines: thick to thin along the big shapes, so they read as drawn, not as a vector stroke
  ink(g, [[-150, -208], [-146, -160], [-149, -120]], 3, 1); ink(g, [[150, -210], [147, -150], [150, -116]], 3.4, 1.2);
  ink(g, [[-124, -166], [-30, -163.5], [124, -166]], 2.4, .9); ink(g, [[-118, -30], [10, -28], [118, -30]], 2.6, 1);
  ink(g, [[146, -226], [180, -246], [208, -262]], 2.6, 1); ink(g, [[146, 0], [180, -8], [208, -18]], 3, 1);
  // key cheeks and the keybed shelf, in front of the cabinet
  for (const x of [-171, 141]) { const p = rrect(x, -164, 30, 60, 10); celFill(g, p, x > 0 ? CEL.woodS : CEL.wood); }
  const shelf = rrect(-174, -122, 348, 15, 5); celFill(g, shelf, CEL.wood);
  g.save(); g.clip(shelf); g.fillStyle = css(CEL.woodS); g.fillRect(-180, -113, 360, 10); g.fillRect(96, -124, 90, 20); g.restore();
  // sconces: one upright with its candle stub, one hanging broken
  const sconce = (pts, cup, broken) => {
    g.lineCap = 'round'; g.strokeStyle = CEL.line; g.lineWidth = 8; g.beginPath(); g.moveTo(...pts[0]); g.quadraticCurveTo(...pts[1], ...pts[2]); g.stroke();
    g.strokeStyle = css(CEL.rust); g.lineWidth = 4.5; g.stroke();
    if (!broken) { g.fillStyle = css(CEL.candle); g.strokeStyle = CEL.line; g.lineWidth = 2.5; g.beginPath(); g.roundRect(cup[0] - 3.5, cup[1] - 16, 7, 14, 2); g.stroke(); g.fill(); }
    g.fillStyle = css(CEL.rust); g.strokeStyle = CEL.line; g.lineWidth = 3; g.beginPath(); g.ellipse(cup[0], cup[1], 9, 4.5, broken ? 1.1 : 0, 0, TAU); g.stroke(); g.fill();
    g.fillStyle = css(CEL.rustS); g.beginPath(); g.ellipse(cup[0] + 2, cup[1] + 1.5, 6, 2.5, broken ? 1.1 : 0, 0, TAU); g.fill();
  };
  sconce([[-150, -186], [-178, -186], [-182, -200]], [-182, -202], false);
  sconce([[150, -186], [172, -180], [170, -158]], [170, -154], true);
  // moss: blankets over the shoulders and down the sun side, on the side plane, climbing the foot from the ground
  mossMass(g, -178, -92, (x) => -254 + (x + 178) * -.04, (x) => -118 - (x + 178) * 1.1, 3);
  mossMass(g, 104, 222, (x) => -262 - (x - 104) * .08, (x) => -196 + (x - 104) * .28, 5);
  mossMass(g, 150, 220, (x) => -130 - (x - 150) * .25, (x) => -86 - (x - 150) * .1, 11);
  mossMass(g, -176, -30, (x) => -44 - Math.max(0, -x - 60) * .62, (x) => 4, 7);
  mossMass(g, 96, 214, (x) => -30 - (x - 96) * .1, (x) => 2 - (x - 96) * .12, 9);
  mossMass(g, -180, -128, (x) => -132, (x) => -106, 13);
  mossMass(g, 138, 178, (x) => -128, (x) => -106, 15);
  for (let i = 0; i < 4; i++) frond(g, -146, -236, 46 + R0() * 26, -2.2 - i * .38, .9 + R0() * .3, R0);
  frond(g, 150, -236, 38, -1.0, -.8, R0);
  flowers(g, [[-160, -190], [-136, -150], [-128, -40], [-92, -24], [118, -226], [176, -218], [150, -176], [180, -14]], 2);
  return { c, rim: rimOf(c, 3, 5) };
}
function bakeLid() {
  const [c, g] = sprite(480, 470), R0 = rng(301);
  const slab = rrect(-166, -268, 332, 22, 10); celFill(g, slab, CEL.wood, CEL.line, 5);
  g.save(); g.clip(slab); g.fillStyle = css(CEL.woodS); g.fillRect(-170, -256, 340, 14); g.fillRect(80, -270, 90, 26); g.restore();
  const crest = (x) => -268 - 40 * Math.exp(-Math.pow((x + 30) / 130, 2)) - 22 * Math.exp(-Math.pow((x - 140) / 60, 2)) - 12 * Math.exp(-Math.pow((x + 130) / 40, 2));
  mossMass(g, -186, 216, crest, (x) => -236 + 14 * Math.sin(x * .021), 21);
  mossMass(g, -150, 40, (x) => crest(x) + 8, (x) => -258 + 6 * Math.sin(x * .05), 23);
  flowers(g, [[-150, -274], [-96, -300], [-58, -292], [-12, -304], [26, -298], [70, -284], [112, -272], [152, -278], [188, -266], [-34, -256], [64, -246]], 0);
  for (let i = 0; i < 3; i++) frond(g, -96 + i * 10, -296, 40 + R0() * 18, -1.9 - i * .45, .7, R0);
  return { c, rim: rimOf(c, 3, 5) };
}
function bakeCrown() {
  const c = canvas(190, 150), g = c.getContext('2d'); g.translate(95, 96);
  g.lineCap = 'round'; g.strokeStyle = '#5b4a40'; g.lineWidth = 4.5; g.beginPath(); g.moveTo(0, 30); g.quadraticCurveTo(-6, 10, -30, -8); g.moveTo(0, 30); g.quadraticCurveTo(10, 8, 30, -14); g.stroke();
  const lobe = (cx, cy, rx, ry, sd) => mossMass(g, cx - rx, cx + rx, (x) => cy - ry * Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / rx, 2))), (x) => cy + ry * .6 * Math.sqrt(Math.max(0, 1 - Math.pow((x - cx) / rx, 2))), sd);
  lobe(30, -22, 44, 30, 31); lobe(-34, -14, 40, 26, 33); lobe(-2, -40, 44, 30, 35);
  return { c, rim: rimOf(c, 2, 3) };
}
// sleep blankets: the big sheets of moss that cover the front while it sleeps and slide off as it wakes
const SHEETS = [{ x0: -128, x1: 74, y0: -244, y1: -160, tf: 4.05, seed: 41 }, { x0: -60, x1: 150, y0: -160, y1: -118, tf: 4.15, seed: 45 }, { x0: -70, x1: 140, y0: -104, y1: -26, tf: 5.7, seed: 43 }];
function bakeSheets() {
  for (const q of SHEETS) {
    const w = q.x1 - q.x0 + 40, h = q.y1 - q.y0 + 50, c = canvas(w, h), g = c.getContext('2d'); g.translate(20 - q.x0, 25 - q.y0);
    mossMass(g, q.x0, q.x1, (x) => q.y0, (x) => q.y1, q.seed); q.c = c; q.w = w; q.h = h;
  }
}
// clods: moss that falls as it wakes (local attach point, radius, fall time)
const CLODS = [
  [-120, -276, 15, 3.15], [70, -270, 13, 3.5], [-150, -214, 12, 3.8], [10, -262, 11, 4.25], [140, -228, 10, 4.5], [-60, -258, 12, 4.7], [-168, -170, 10, 4.9],
  [110, -262, 12, 5.8], [-140, -196, 11, 6.2], [40, -255, 9, 6.7], [152, -200, 10, 7.3], [-90, -262, 10, 7.9],
  [-166, -128, 12, 10.95], [-20, -258, 9, 11.0], [162, -124, 10, 12.62], [150, -244, 9, 12.7],
].map(([x, y, r, tf], i) => ({ x, y, r, tf, i, lid: y < -255 }));

// ---- pose: a pure function of t ----
function rise(t) {
  if (t < T.dip) return 0;
  if (t < T.rise0) return -.045 * ease.out(inv(T.dip, T.rise0, t));
  if (t < T.rise1) return lerp(-.045, 1.03, ease.inOut(inv(T.rise0, T.rise1, t)));
  return lerp(1.03, 1, ease.sine(inv(T.rise1, T.settle, t)));
}
function pose(t) {
  t = Math.floor(t * 12 + 1e-6) / 12; // the giant is animated on twos, 12 drawings a second, while the camera runs on ones
  const r = rise(t), stand = smooth(inv(.3, 1, r));
  const s1 = ease.inOut(inv(9.2, T.lean1, t)), b1 = ease.inOut(inv(10.0, 11.3, t)), b2 = ease.inOut(inv(11.7, 12.9, t));
  const heave = 4 * Math.sin(Math.PI * inv(T.stir, 3.9, t)) + 2.5 * Math.sin(Math.PI * inv(4.3, 5.0, t));
  let by = lerp(634, BY1, r) - heave + (1 - stand) * Math.sin(TAU * .25 * t) * 1.2;
  by += 7 * Math.sin(Math.PI * inv(T.lPlant, T.lPlant + .55, t)) + 4 * Math.sin(Math.PI * inv(T.rPlant, T.rPlant + .45, t));
  by += 2 * Math.sin(TAU * .3 * (t - 13)) * smooth(inv(13, 13.6, t));
  const bx = BX0 + 12 * s1 - 40 * b1 - 22 * b2;
  const th = lerp(-.052, 0, clamp(r)) + .012 * Math.sin(Math.PI * inv(T.stir, 3.9, t)) + .04 * s1 - .075 * b1 + .035 * b2;
  const sL = inv(T.lLift, T.lPlant, t), sR = inv(T.rLift, T.rPlant, t);
  const fl = { x: BX0 - STANCE - 50 * ease.inOut(sL), y: FLOOR - 34 * Math.sin(Math.PI * sL), down: !(t > T.lLift && t < T.lPlant) };
  const fr = { x: BX0 + STANCE - 50 * ease.inOut(sR), y: FLOOR - 30 * Math.sin(Math.PI * sR), down: !(t > T.rLift && t < T.rPlant) };
  return { bx, by, th, r, stand, fl, fr, fb: ease.out(inv(T.fb0, T.fb1, t)), lid: 15 * ease.out(inv(T.lid0, T.lid1, t)) - 9 * ease.sine(inv(9, 10.5, t)) };
}
const toW = (p, x, y) => { const c = Math.cos(p.th), s = Math.sin(p.th); return [p.bx + x * c - y * s, p.by + x * s + y * c]; };

// a bendy tube leg from hip to foot: the knee bows out (or up while folded) so the length stays LEG0
function leg(g, hip, foot, side, L, R0seed) {
  const dx = foot[0] - hip[0], dy = foot[1] - hip[1], d = Math.hypot(dx, dy) || 1, bend = Math.sqrt(Math.max(0, LEG0 * LEG0 - d * d)) * .5;
  let px = -dy / d, py = dx / d; if (px * side * .7 + py * -.7 < 0) { px = -px; py = -py; }
  const kx = (hip[0] + foot[0]) / 2 + px * bend * 2, ky = (hip[1] + foot[1]) / 2 + py * bend * 2;
  const N = 18, Lp = [], Rp = [], C = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N, x = (1 - s) * (1 - s) * hip[0] + 2 * s * (1 - s) * kx + s * s * foot[0], y = (1 - s) * (1 - s) * hip[1] + 2 * s * (1 - s) * ky + s * s * foot[1];
    const tx = 2 * (1 - s) * (kx - hip[0]) + 2 * s * (foot[0] - kx), ty = 2 * (1 - s) * (ky - hip[1]) + 2 * s * (foot[1] - ky), tl = Math.hypot(tx, ty) || 1;
    const w = (lerp(32, 25, s) + 4 * Math.sin(Math.PI * s)), nx = -ty / tl, ny = tx / tl;
    C.push([x, y]); Lp.push([x + nx * w, y + ny * w]); Rp.push([x - nx * w, y - ny * w]);
  }
  const p = new Path2D(); p.moveTo(...Lp[0]); Lp.forEach((q) => p.lineTo(...q)); for (let i = N; i >= 0; i--) p.lineTo(...Rp[i]); p.closePath();
  g.lineJoin = 'round'; g.lineWidth = 4.5; g.strokeStyle = CEL.line; g.stroke(p); g.fillStyle = css(CEL.wood); g.fill(p);
  // shadow: the half of the tube away from the sun (its right side on screen)
  const sideR = (Lp[N >> 1][0] > Rp[N >> 1][0]) ? Lp : Rp, sideL = sideR === Lp ? Rp : Lp;
  const sp = new Path2D(); sp.moveTo(...C[0]); C.forEach((q) => sp.lineTo(...q)); for (let i = N; i >= 0; i--) sp.lineTo(...sideR[i]); sp.closePath();
  g.save(); g.clip(p); g.fillStyle = css(CEL.woodS); g.translate(-3, 0); g.fill(sp); g.restore();
  return { lit: sideL, C, knee: [kx, ky] };
}
function foot(g, f) {
  const x = f.x, y = f.y;
  g.lineWidth = 4; g.strokeStyle = CEL.line;
  g.beginPath(); g.ellipse(x, y - 15, 40, 17, 0, 0, TAU); g.stroke(); g.fillStyle = css(CEL.wood); g.fill();
  g.save(); g.beginPath(); g.ellipse(x, y - 15, 40, 17, 0, 0, TAU); g.clip(); g.fillStyle = css(CEL.woodS); g.fillRect(x + 6, y - 34, 40, 34); g.restore();
  g.beginPath(); g.ellipse(x, y - 4, 41, 7, 0, 0, TAU); g.stroke(); g.fillStyle = css(CEL.rust); g.fill();
  g.fillStyle = css(CEL.rustS); g.beginPath(); g.ellipse(x + 10, y - 2, 27, 4, 0, 0, TAU); g.fill();
}

let BODY, LID, CROWN;
function bakeGiant() { BODY = bakeBody(); LID = bakeLid(); CROWN = bakeCrown(); bakeSheets(); }
const topX = (t) => { const p = pose(t); return p.bx + 300 * Math.sin(p.th); };

function drawGiant(g, t, L) {
  const p = pose(t);
  // legs behind the body, feet on the floor
  for (const [side, f] of [[-1, p.fl], [1, p.fr]]) {
    const hip = toW(p, side * HIPX, -10), lg = leg(g, hip, [f.x, f.y - 12], side);
    // rim on the sun side of the tube
    g.save(); g.globalAlpha = .85 * L; g.strokeStyle = css(CEL.rim); g.lineWidth = 2.6; g.lineCap = 'round';
    g.beginPath(); lg.lit.slice(1, 13).forEach((q, i) => (i ? g.lineTo : g.moveTo).call(g, q[0] + 1.5, q[1] + 1.5)); g.stroke(); g.restore();
    mossMass(g, lg.C[2][0] - 34, lg.C[2][0] + 34, (x) => lg.C[2][1] - 16 - 7 * Math.sin((x - lg.C[2][0]) * .05 + side), (x) => lg.C[7][1] + 8 * Math.sin((x - lg.C[2][0]) * .09), 40 + side);
    foot(g, f);
  }
  // lid gap: the dark inside and the strings, when the lid lifts
  g.save(); g.translate(p.bx, p.by); g.rotate(p.th);
  if (p.lid > .3) {
    g.fillStyle = css(CEL.dark); g.fillRect(-146, -252 - p.lid, 292, p.lid + 6);
    g.strokeStyle = css(mixc(CEL.gold, hex('#fff0c0'), glowK(t)), .7 + .3 * glowK(t)); g.lineWidth = 1.2; for (let x = -140; x < 140; x += 6) { g.beginPath(); g.moveTo(x, -250 - p.lid); g.lineTo(x + 1, -248); g.stroke(); }
  }
  g.drawImage(BODY.c, -GO.x, -GO.y);
  // the glow inside: the fret slots light up from behind, then the keys, then the air around the panel
  { const gk = glowK(t), lt = mixc(hex('#f09a38'), hex('#ffd98a'), gk);
    if (gk > .01) {
      for (let i = 0; i < 13; i++) { const x = -108 + i * 17.5; const a = gk * (.72 + .28 * vn2(i * .7, t * 3, 211)), sg = g.createLinearGradient(0, -222, 0, -176); sg.addColorStop(0, css(mixc(lt, hex('#c8642a'), .55), a)); sg.addColorStop(.55, css(lt, a)); sg.addColorStop(1, css(mixc(lt, hex('#c8642a'), .4), a)); g.fillStyle = sg; g.beginPath(); g.roundRect(x, -222, 7, 46, 3.5); g.fill(); }
      g.save(); g.globalCompositeOperation = 'lighter';
      const rg = g.createRadialGradient(0, -196, 8, 0, -196, 165); rg.addColorStop(0, css(hex('#ff9d3a'), .38 * gk)); rg.addColorStop(1, css(hex('#ff9d3a'), 0)); g.fillStyle = rg; g.fillRect(-170, -260, 340, 170);
      g.fillStyle = css(hex('#ff9d3a'), .16 * gk * p.fb); g.fillRect(-140, -150, 280, 28); g.restore();
    } }
  // fallboard: closed over the keys, it folds up and back as it opens
  { const k = p.fb, top = -154 - 12 * k, h = 33 * (1 - k) + 9 * k, fbp = rrect(-143, top, 286, h, 3);
    celFill(g, fbp, CEL.wood, CEL.line, 3);
    g.save(); g.clip(fbp); g.fillStyle = css(CEL.woodS); g.fillRect(-150, top + h * .62, 300, h); g.fillRect(84, top - 2, 70, h + 4); g.restore();
    g.fillStyle = css(CEL.rust); g.fillRect(-60, top + 1.5, 120, 2.2); }
  // moss drapes under the shelf, swinging behind the body's motion
  const v = (topX(t - .1) - topX(t - .3)) / .2;
  for (const [x, len, wd] of [[-170, 40, 8], [-140, 17, 6], [168, 26, 7], [140, 44, 6]]) {
    const sw = clamp(-v * .05, -14, 14) + 2 * Math.sin(t * 1.1 + x), cy = -110 + len * .5, a = Math.atan2(sw, len);
    g.lineWidth = 3; g.strokeStyle = CEL.mossLine; g.beginPath(); g.ellipse(x + sw * .5, cy, wd, len * .55, -a, 0, TAU); g.stroke(); g.fillStyle = css(CEL.moss); g.fill();
    g.fillStyle = css(CEL.mossS); g.beginPath(); g.ellipse(x + sw * .5 + wd * .3, cy + len * .08, wd * .55, len * .4, -a, 0, TAU); g.fill();
  }
  g.globalAlpha = L; g.drawImage(BODY.rim, -GO.x, -GO.y); g.globalAlpha = 1;
  // lid and its mound, lifted from the back hinge
  g.save(); g.translate(0, -256 - p.lid); g.rotate(-.0012 * p.lid); g.translate(0, 256);
  // sapling: it lags the body (follow-through) and sways
  const ang = clamp(-v * .0016, -.35, .35) + .035 * Math.sin(TAU * .18 * t);
  const sx0 = -40, sy0 = -296, sx1 = sx0 + Math.sin(ang) * 46, sy1 = sy0 - Math.cos(ang) * 46;
  g.drawImage(LID.c, -GO.x, -GO.y); g.globalAlpha = L; g.drawImage(LID.rim, -GO.x, -GO.y); g.globalAlpha = 1;
  g.lineCap = 'round'; g.strokeStyle = CEL.line; g.lineWidth = 9.5; g.beginPath(); g.moveTo(sx0, sy0 + 12); g.quadraticCurveTo(sx0 + Math.sin(ang) * 18, sy0 - 22, sx1, sy1); g.stroke();
  g.strokeStyle = '#5b4a40'; g.lineWidth = 6; g.stroke();
  g.save(); g.translate(sx1, sy1); g.rotate(ang * 1.3); g.scale(.84, .84); g.drawImage(CROWN.c, -95, -126); g.globalAlpha = L; g.drawImage(CROWN.rim, -95, -126); g.restore();
  g.restore();
  // clods still attached
  for (const c of CLODS) if (t < c.tf) { const y = c.lid ? c.y - p.lid : c.y; clod(g, c.x, y, c.r, 0, c.i); }
  // sleep blankets still on the front
  for (const q of SHEETS) if (t < q.tf) g.drawImage(q.c, q.x0 - 20, q.y0 - 25);
  g.restore();
  // clods falling and fallen
  for (const c of CLODS) if (t >= c.tf) {
    const p0 = pose(c.tf), [x0, y0] = toW(p0, c.x, c.lid ? c.y - p0.lid : c.y), dt = t - c.tf, vx = (c.x / 150) * 40 + 10, yF = FLOOR + 4 + h2(c.i, 1, 61) * 18;
    const tl = (-(-40) + Math.sqrt(1600 + 2 * 900 * Math.max(0, yF - y0))) / 900, d = Math.min(dt, tl);
    const x = x0 + vx * d, y = Math.min(yF, y0 - 40 * d + 450 * d * d);
    clod(g, x, y, c.r, dt > tl ? 1 : 0, c.i);
  }
  // sleep blankets sliding off: they peel forward, drop, and lie where they land
  for (const q of SHEETS) if (t >= q.tf) {
    const p0 = pose(q.tf), cx = (q.x0 + q.x1) / 2, cy = (q.y0 + q.y1) / 2, [x0, y0] = toW(p0, cx, cy), dt = t - q.tf, yF = FLOOR + 10 + (q.seed % 3) * 5;
    const tl = Math.sqrt(2 * Math.max(0, yF - y0) / 620), d = Math.min(dt, tl), y = y0 + 310 * d * d, land = ease.out(inv(tl, tl + .22, dt));
    g.save(); g.translate(x0 + 14 * d + (q.seed % 2 ? 26 : -26) * d, y); g.rotate(((q.seed % 2 ? .22 : -.2)) * Math.min(1, d / tl)); g.scale(lerp(1, 1.06, land), lerp(1, .46, land));
    g.drawImage(q.c, -q.w / 2, -q.h / 2); g.restore();
  }
  soil(g, t);
  shoulderBird(g, t);
  // the first ray: a warm pool on the sun-side shoulder, wrapped to the giant's shape
  { const k = rayK(t) * (1 - .55 * smooth(inv(6, 9.5, t))); if (k > .01) { const [x, y] = toW(p, -60, -270 - p.lid), rg = g.createRadialGradient(x, y, 0, x, y, 210);
    rg.addColorStop(0, css(hex('#fff0b4'), .85 * k)); rg.addColorStop(.5, css(hex('#ffe08c'), .36 * k)); rg.addColorStop(1, css(hex('#ffe08c'), 0));
    g.save(); g.globalCompositeOperation = 'source-atop'; g.fillStyle = rg; g.fillRect(x - 210, y - 210, 420, 420); g.restore(); } }
  // dust and spores kicked up at each plant
  for (const [tp, f] of [[T.lPlant, p.fl], [T.rPlant, p.fr]]) {
    const k = inv(tp, tp + 1.1, t); if (k <= 0 || k >= 1) continue;
    for (let i = 0; i < 14; i++) {
      const a = Math.PI + (i / 13) * Math.PI, r = 18 + 70 * ease.out(k) * (.6 + h2(i, 3, 71) * .6), x = f.x + Math.cos(a) * r * 1.4, y = f.y - 6 + Math.sin(a) * r * .35 - 10 * k;
      const rg = g.createRadialGradient(x, y, 0, x, y, 16 + 20 * k); rg.addColorStop(0, css(FOG_WARM, .55 * (1 - k))); rg.addColorStop(1, css(FOG_WARM, 0));
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, 16 + 20 * k, 0, TAU); g.fill();
    }
  }
  return p;
}
