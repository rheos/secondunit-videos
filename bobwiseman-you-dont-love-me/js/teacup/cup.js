// Drawing primitives for the teacup look. World units: px at camera scale 1, origin = cup centre.
// Everything is deterministic (rnd/n1 from core.js), nothing is cached between frames except static tiles.
const CUP = { rim: 300, band: 268, bottom: 176, saucer: 470, well: 330 };
const COL = {
  cloth1: hex('#efe3cf'), cloth2: hex('#c9675b'), china: hex('#fbf7ee'), chinaShade: hex('#d9d2c3'),
  gold: hex('#c69a3e'), blue: hex('#5f86b8'), pink: hex('#e48aa0'), green: hex('#6f9a5a'),
  leaf: hex('#3a2414'), leaf2: hex('#5b3a1e'), tea: hex('#b06a2a'), stain: hex('#4a2c16'),
  skin: hex('#e9b897'), skinLine: hex('#a8705a'), nail: hex('#c0293a'),
};

// hand-drawn circle: radius wobbles a little (seeded), so lines never look compass-perfect
function wobCircle(g, r, seed, amp = 1.2, n = 90) {
  g.beginPath();
  for (let k = 0; k <= n; k++) {
    const a = k / n * TAU, rr = r + n1(seed, k % n * .35) * amp;
    k ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  g.closePath();
}

// gingham oilcloth tile (pattern follows the camera transform, so it turns with the table)
let CLOTH = null;
function clothTile() {
  if (CLOTH) return CLOTH;
  const s = 160, c = mkCanvas(s, s), x = c.getContext('2d');
  x.fillStyle = rgb(COL.cloth1); x.fillRect(0, 0, s, s);
  x.fillStyle = rgb(COL.cloth2, .42); x.fillRect(0, 0, s / 2, s); x.fillRect(0, 0, s, s / 2);
  // hand-printed wobble on the stripe edges + weave
  const R = mulberry(77);
  x.strokeStyle = rgb(COL.cloth2, .25); x.lineWidth = 1;
  for (let i = 0; i < 70; i++) { const y = R() * s; x.beginPath(); x.moveTo(0, y); x.lineTo(s, y + (R() - .5) * 2); x.stroke(); }
  for (let i = 0; i < 70; i++) { const xx = R() * s; x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx + (R() - .5) * 2, s); x.stroke(); }
  x.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 300; i++) x.fillRect(R() * s, R() * s, 2, 2);
  CLOTH = c; return c;
}
function drawTable(g, cam) {
  g.save(); g.fillStyle = g.createPattern(clothTile(), 'repeat');
  const R = Math.hypot(W, H) / cam.s; g.fillRect(cam.x - R, cam.y - R, 2 * R, 2 * R); g.restore();
}

// a little painted daisy (china decoration), centre at 0,0
function chinaDaisy(g, r, petal, centre, k) {
  g.fillStyle = rgb(petal, .9);
  for (let p = 0; p < 8; p++) { g.save(); g.rotate(p / 8 * TAU + k); g.beginPath(); g.ellipse(r * .62, 0, r * .45, r * .2, 0, 0, TAU); g.fill(); g.restore(); }
  g.fillStyle = rgb(centre); g.beginPath(); g.arc(0, 0, r * .26, 0, TAU); g.fill();
}
// a band of daisies and sprigs around a circle
function daisyBand(g, r, n, size, rot, seed) {
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + rot;
    g.save(); g.rotate(a); g.translate(r, 0);
    chinaDaisy(g, size, i % 2 ? COL.blue : COL.pink, COL.gold, i * .7);
    g.restore();
    // green sprig between daisies
    const b = a + TAU / n / 2;
    g.save(); g.rotate(b); g.translate(r, 0); g.fillStyle = rgb(COL.green, .85);
    g.beginPath(); g.ellipse(0, -size * .35, size * .45, size * .16, .6, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(0, size * .35, size * .45, size * .16, -.6, 0, TAU); g.fill();
    g.restore();
  }
}

function drawSaucer(g, ox, oy) {
  g.save(); g.translate(ox, oy);
  // soft shadow on the cloth
  g.fillStyle = 'rgba(60,30,20,.22)'; g.beginPath(); g.ellipse(26, 34, CUP.saucer + 10, CUP.saucer + 6, 0, 0, TAU); g.fill();
  const gr = g.createRadialGradient(-120, -140, 40, 0, 0, CUP.saucer);
  gr.addColorStop(0, rgb(COL.china)); gr.addColorStop(.75, rgb(COL.china)); gr.addColorStop(1, rgb(COL.chinaShade));
  g.fillStyle = gr; wobCircle(g, CUP.saucer, 11, 1.5); g.fill();
  g.strokeStyle = rgb(COL.gold, .9); g.lineWidth = 4; wobCircle(g, CUP.saucer - 6, 12, 1); g.stroke();
  g.lineWidth = 2; wobCircle(g, CUP.saucer - 44, 13, 1); g.stroke();
  daisyBand(g, CUP.saucer - 25, 26, 13, .1, 3);
  // the well
  g.strokeStyle = rgb(COL.chinaShade, .9); g.lineWidth = 3; wobCircle(g, CUP.well, 14, 1); g.stroke();
  g.restore();
}

function drawSpoon(g, ox, oy, a) {
  g.save(); g.translate(ox, oy); g.rotate(a);
  g.fillStyle = 'rgba(60,30,20,.25)'; g.beginPath(); g.ellipse(12, 10, 46, 30, 0, 0, TAU); g.fill(); g.fillRect(40, 4, 150, 14);
  const gr = g.createLinearGradient(0, -30, 0, 30); gr.addColorStop(0, '#f4f1ea'); gr.addColorStop(.5, '#a9a59c'); gr.addColorStop(1, '#e2ddd2');
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 46, 30, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(40, -6); g.lineTo(190, -9); g.quadraticCurveTo(205, 0, 190, 9); g.lineTo(40, 6); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(-8, -6, 26, 14, 0, 3.6, 5.2); g.stroke();
  g.restore();
}

// cup: shadow, handle, outer lip, decorated band, interior. Contents drawn by the caller inside clip.
function drawCupBody(g, rot) {
  g.fillStyle = 'rgba(70,35,20,.28)'; g.beginPath(); g.arc(30, 36, CUP.rim + 6, 0, TAU); g.fill();
  // handle (seen from above: a loop sticking out to the right), turns with the cup
  g.save(); g.rotate(rot - .25);
  g.fillStyle = 'rgba(70,35,20,.25)'; g.beginPath(); g.ellipse(CUP.rim + 70, 36, 78, 34, 0, 0, TAU); g.fill();
  g.fillStyle = rgb(COL.china); g.strokeStyle = rgb(COL.chinaShade); g.lineWidth = 3;
  g.beginPath(); g.ellipse(CUP.rim + 50, 0, 80, 30, 0, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = rgb(COL.gold, .9); g.beginPath(); g.ellipse(CUP.rim + 50, 0, 80, 30, 0, -.2, .2); g.lineTo(CUP.rim + 50, 0); g.fill();
  g.strokeStyle = rgb(COL.gold); g.lineWidth = 3; g.beginPath(); g.moveTo(CUP.rim + 10, 0); g.lineTo(CUP.rim + 124, 0); g.stroke();
  g.restore();
  // outer lip
  g.fillStyle = rgb(COL.china); wobCircle(g, CUP.rim, 21, 1); g.fill();
  g.strokeStyle = rgb(COL.chinaShade); g.lineWidth = 3; g.stroke();
  // interior: white glaze, shading deeper toward the foot ring
  const gr = g.createRadialGradient(-30, -40, 10, 0, 0, CUP.band);
  gr.addColorStop(0, '#fbf6ea'); gr.addColorStop(.55, '#f3ecdc'); gr.addColorStop(.66, '#ddd3bf'); gr.addColorStop(.72, '#f1e9d8'); gr.addColorStop(1, '#e2d9c6');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, CUP.band, 0, TAU); g.fill();
  // depth: the lip shades the near (top-left) wall
  const sh = g.createRadialGradient(34, 44, CUP.band * .62, 34, 44, CUP.band * 1.12);
  sh.addColorStop(0, 'rgba(90,60,30,0)'); sh.addColorStop(1, 'rgba(90,60,30,.32)');
  g.fillStyle = sh; g.beginPath(); g.arc(0, 0, CUP.band, 0, TAU); g.fill();
  // decorated band on the inside lip
  g.save(); g.rotate(rot);
  g.strokeStyle = rgb(COL.gold); g.lineWidth = 4; wobCircle(g, CUP.rim - 4, 22, .8); g.stroke();
  g.lineWidth = 2; wobCircle(g, CUP.band + 1, 23, .8); g.stroke();
  daisyBand(g, (CUP.rim + CUP.band) / 2, 18, 11, 0, 5);
  g.restore();
  // foot ring
  g.strokeStyle = 'rgba(150,130,100,.35)'; g.lineWidth = 5; wobCircle(g, CUP.bottom, 24, 1.2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; wobCircle(g, CUP.bottom - 4, 25, 1.2); g.stroke();
}

// tea dregs: an amber puddle with a wet rim, plus tea stain ring on the wall
function drawPuddle(g, rot, t, grow = 0, ripples = []) {
  g.save(); g.rotate(rot);
  const r0 = 78 + grow * 90;
  g.fillStyle = rgb(COL.tea, .12); wobCircle(g, CUP.band - 30, 31, 3); g.fill();
  g.beginPath();
  for (let k = 0; k <= 60; k++) { const a = k / 60 * TAU, rr = r0 + n1(41, a * 1.6) * 16 + n1(42, a * 4) * 5; k ? g.lineTo(Math.cos(a) * rr + 6, Math.sin(a) * rr + 10) : g.moveTo(Math.cos(a) * rr + 6, Math.sin(a) * rr + 10); }
  g.closePath();
  const gr = g.createRadialGradient(10, 10, 5, 6, 10, r0 + 16); gr.addColorStop(0, rgb(COL.tea, .78)); gr.addColorStop(.8, rgb(COL.tea, .55)); gr.addColorStop(1, rgb(COL.tea, .2));
  g.fillStyle = gr; g.fill(); g.strokeStyle = rgb(COL.stain, .35); g.lineWidth = 2; g.stroke();
  g.restore();
  for (const rp of ripples) {
    g.strokeStyle = `rgba(255,240,215,${.6 * (1 - rp)})`; g.lineWidth = 3; wobCircle(g, 10 + rp * (r0 + 20), 51, 1.5); g.stroke();
  }
}

// glaze highlights: fixed to the light (top-left), never turn with the cup
function drawGlaze(g) {
  g.save(); g.lineCap = 'round';
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, CUP.rim - 10, 3.55, 4.25); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, CUP.rim - 12, 4.4, 4.6); g.stroke();
  // window reflection on the far wall (bottom-right inside)
  g.translate(150, 150); g.rotate(-.78); g.fillStyle = 'rgba(255,255,255,.32)';
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) g.fillRect(-34 + i * 36, -22 + j * 24, 32, 20);
  g.restore();
  const gr = g.createRadialGradient(-150, -150, 10, -150, -150, 160); gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, CUP.band, 0, TAU); g.fill();
}

// ---- tea leaves ----
const NL = 260;
const LEAF = [...Array(NL)].map((_, i) => {
  const sz = 4.5 + rnd(i, 1) * 6.5 + (rnd(i, 2) < .12 ? 5 : 0);
  const pts = [...Array(6)].map((_, k) => { const a = k / 6 * TAU, rr = (k % 3 === 0 ? 1.25 : .6) * (.7 + rnd(i, 10 + k) * .5); return [Math.cos(a) * rr * (k % 3 === 0 ? 1.4 : 1), Math.sin(a) * rr]; });
  return { sz, pts, c: mix(COL.leaf, COL.leaf2, rnd(i, 3)), a0: rnd(i, 4) * TAU, d: rnd(i, 5) };
});
function leafPath(g, L) { g.beginPath(); L.pts.forEach(([x, y], k) => k ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
// P = [{x,y,a,z}] per leaf in cup-local coords
function drawLeaves(g, P, alpha = 1) {
  g.fillStyle = `rgba(40,20,10,${.28 * alpha})`;
  for (let i = 0; i < NL; i++) { const p = P[i], L = LEAF[i]; if (p.z < .5) continue; g.save(); g.translate(p.x + p.z * .35, p.y + p.z * .5); g.rotate(p.a); g.scale(L.sz, L.sz); leafPath(g, L); g.fill(); g.restore(); }
  for (let i = 0; i < NL; i++) {
    const p = P[i], L = LEAF[i], s = L.sz * (1 + p.z / 70);
    g.save(); g.translate(p.x - p.z * .12, p.y - p.z * .2); g.rotate(p.a); g.scale(s, s);
    leafPath(g, L); g.fillStyle = rgb(L.c, alpha); g.fill();
    g.strokeStyle = `rgba(120,80,40,${.5 * alpha})`; g.lineWidth = .18; g.stroke();
    g.restore();
  }
}

// ---- pictograms the reader sees (tea-stain silhouettes) ----
// woman: feet at 0,0, faces +x when dir=1. walk = phase (radians) or null. h ~ 62*size
function drawWoman(g, x, y, size, dir, walk, alpha, rot = 0, z = 0) {
  if (alpha <= .01) return;
  for (const pass of [0, 1]) womanPass(g, x, y, size, dir, walk, alpha, rot, z, pass);
}
function womanPass(g, x, y, size, dir, walk, alpha, rot, z, pass) {
  g.save(); g.translate(x, y - z * .3); g.rotate(rot); g.scale(size * dir, size);
  const ink = pass ? rgb(COL.stain, .92 * alpha) : `rgba(250,244,230,${.85 * alpha})`;
  g.strokeStyle = ink; g.fillStyle = ink; g.lineCap = 'round'; g.lineJoin = 'round';
  const ex = pass ? 0 : 4.5; const _st = g.stroke.bind(g), _fi = g.fill.bind(g);
  const stroke = () => { const lw = g.lineWidth; g.lineWidth = lw + ex; _st(); g.lineWidth = lw; };
  const fill = () => { _fi(); if (!pass) { g.lineWidth = ex; _st(); } };
  const sw = walk == null ? 0 : Math.sin(walk);
  // legs
  g.lineWidth = 3.4; g.beginPath(); g.moveTo(-3, -16); g.lineTo(-3 - sw * 6, 0); g.moveTo(3, -16); g.lineTo(3 + sw * 6, 0); stroke();
  // dress
  g.beginPath(); g.moveTo(-6, -42); g.quadraticCurveTo(-9, -30, -16, -15); g.quadraticCurveTo(0, -12, 16, -15); g.quadraticCurveTo(9, -30, 6, -42); g.closePath(); fill();
  // arms
  g.lineWidth = 3; g.beginPath(); g.moveTo(-5, -40); g.lineTo(-9 + sw * 4, -26); g.moveTo(5, -40); g.lineTo(9 - sw * 4, -26); stroke();
  // head, bun, nose
  g.beginPath(); g.arc(0, -50, 7.5, 0, TAU); fill();
  g.beginPath(); g.arc(-7, -55, 4, 0, TAU); fill();
  g.beginPath(); g.moveTo(6.5, -51); g.lineTo(10, -49); g.lineTo(6.5, -47.5); fill();
  // leaf-flake edge so she reads as made of dregs
  if (pass) { g.fillStyle = rgb(COL.leaf2, .8 * alpha);
  for (let k = 0; k < 9; k++) { g.beginPath(); g.ellipse(-14 + rnd(k, 7) * 28, -14 - rnd(k, 8) * 30, 2.2, 1.2, rnd(k, 9) * 3, 0, TAU); g.fill(); } }
  g.restore();
}
function drawHat(g, x, y, size, alpha, rot = 0) {
  if (alpha <= .01) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(size, size);
  g.fillStyle = rgb(COL.stain, .92 * alpha);
  g.beginPath(); g.ellipse(0, 0, 24, 5, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-13, -1); g.quadraticCurveTo(-14, -22, -4, -24); g.quadraticCurveTo(0, -20, 4, -24); g.quadraticCurveTo(14, -22, 13, -1); g.closePath(); g.fill();
  g.fillStyle = rgb(COL.tea, .8 * alpha); g.fillRect(-13, -8, 26, 4);
  g.restore();
}

// ---- the reader's hand, seen from above. fingertip at 0,0; arm runs toward -y ----
function drawHand(g, press = 0) {
  g.save(); g.lineJoin = 'round'; g.lineCap = 'round';
  // shadow (closer when pressing on the rim)
  const so = 34 * (1 - press) + 8;
  g.save(); g.translate(so * .8, so); g.fillStyle = 'rgba(50,25,15,.25)'; handShape(g, true); g.restore();
  handShape(g, false);
  g.restore();
}
function handShape(g, flat) {
  const sk = flat ? null : rgb(COL.skin), ln = flat ? null : rgb(COL.skinLine);
  const fillS = () => { if (flat) g.fill(); else { g.fillStyle = sk; g.fill(); g.strokeStyle = ln; g.lineWidth = 3; g.stroke(); } };
  // sleeve
  g.beginPath(); g.moveTo(-60, -250); g.lineTo(170, -250); g.lineTo(200, -900); g.lineTo(-90, -900); g.closePath();
  if (flat) g.fill(); else {
    g.fillStyle = '#3d4f7a'; g.fill();
    g.save(); g.clip(); g.fillStyle = '#e8c35a';
    for (let i = 0; i < 40; i++) { const x = -90 + (i % 6) * 52 + (Math.floor(i / 6) % 2) * 26, y = -280 - Math.floor(i / 6) * 60; g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); }
    g.restore();
    // lace cuff
    g.fillStyle = '#f6efe2'; g.beginPath(); g.moveTo(-66, -238);
    for (let k = 0; k <= 12; k++) { const x = lerp(-66, 176, k / 12); g.quadraticCurveTo(x - 10, -222, x, -238); }
    g.lineTo(178, -262); g.lineTo(-64, -262); g.closePath(); g.fill();
  }
  // palm
  g.beginPath(); g.moveTo(-14, -110); g.bezierCurveTo(-30, -160, -40, -230, -30, -255); g.lineTo(150, -255); g.bezierCurveTo(165, -200, 160, -140, 140, -110); g.closePath(); fillS();
  // curled fingers (knuckles)
  for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(36 + k * 38, -108 + k * 6, 20, 26, 0, 0, TAU); fillS(); }
  // thumb
  g.beginPath(); g.moveTo(-26, -200); g.bezierCurveTo(-60, -180, -62, -140, -40, -128); g.bezierCurveTo(-26, -122, -14, -140, -10, -165); g.closePath(); fillS();
  // index finger
  g.beginPath(); g.moveTo(-16, -120); g.lineTo(-14, -14); g.arc(0, -14, 14, Math.PI, 0); g.lineTo(16, -120); g.closePath(); fillS();
  if (!flat) {
    g.fillStyle = rgb(COL.nail); g.beginPath(); g.ellipse(0, -18, 9, 13, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-3, -22, 2.5, 5, 0, 0, TAU); g.fill();
    // knuckle creases + ring
    g.strokeStyle = ln; g.lineWidth = 2; g.beginPath(); g.moveTo(-8, -58); g.lineTo(8, -58); g.moveTo(-8, -64); g.lineTo(6, -64); g.stroke();
    g.fillStyle = '#d6aa3c'; g.fillRect(-17, -96, 34, 10); g.fillStyle = '#7fd0c8'; g.beginPath(); g.arc(0, -91, 7, 0, TAU); g.fill();
  }
}

// ---- the bud vase and the daisy on the table ----
function drawVase(g, x, y, petals, fallen, wob = 0) {
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(60,30,20,.22)'; g.beginPath(); g.arc(20, 26, 70, 0, TAU); g.fill();
  const gr = g.createRadialGradient(-20, -20, 4, 0, 0, 66); gr.addColorStop(0, '#d9efe9'); gr.addColorStop(.7, '#8cbfb6'); gr.addColorStop(1, '#5e8f88');
  g.fillStyle = gr; wobCircle(g, 64, 61, 1.5); g.fill();
  g.fillStyle = '#2e4f4a'; g.beginPath(); g.arc(0, 0, 20, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 52, 3.6, 4.4); g.stroke();
  g.restore();
  // stalk leaning out of the vase toward the cup, head lying above the cloth
  const hx = x + 115 + wob * 4, hy = y - 105 + wob * 3;
  g.strokeStyle = '#4f7a3a'; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 70, y - 20, hx, hy); g.stroke();
  g.fillStyle = '#5f8f45'; g.beginPath(); g.ellipse(x + 50, y - 30, 30, 10, -.9, 0, TAU); g.fill();
  daisyHead(g, hx, hy, petals, .3);
  for (const f of fallen) daisyPetal(g, f.x, f.y, f.a, 1);
}
function daisyPetal(g, x, y, a, alpha) {
  g.save(); g.translate(x, y); g.rotate(a);
  g.fillStyle = 'rgba(60,30,20,.18)'; g.beginPath(); g.ellipse(26, 6, 24, 8, 0, 0, TAU); g.fill();
  g.fillStyle = `rgba(255,253,246,${alpha})`; g.beginPath(); g.ellipse(22, 0, 24, 8, 0, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(200,190,170,.8)'; g.lineWidth = 1.5; g.stroke();
  g.restore();
}
// petals: array of angles still attached
function daisyHead(g, x, y, petals, rot) {
  for (const a of petals) daisyPetal(g, x + Math.cos(a + rot) * 10, y + Math.sin(a + rot) * 10, a + rot, 1);
  g.fillStyle = '#f0b62a'; g.beginPath(); g.arc(x, y, 17, 0, TAU); g.fill();
  g.fillStyle = '#c98a14'; for (let k = 0; k < 14; k++) { const a = k * 2.4, r = Math.sqrt(k / 14) * 13; g.beginPath(); g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 2, 0, TAU); g.fill(); }
}
