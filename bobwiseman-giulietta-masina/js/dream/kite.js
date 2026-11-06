// The kite dream, 77.1-92.5: high-key daylight, blown white sky and sea, black suits.
// Moving forward, down the rope: out of the stopped car into cloud, the rope, the beach with the rider and the
// scaffold, the tug, the fall to the sea seen from straight above, the woman in white looking up ("Giulietta").

// ---------- cloud sprites: cumulus puffs lit from above, grey undersides (seeded, built once) ----------
const CLOUDS = [];
(function buildClouds() {
  for (let k = 0; k < 5; k++) {
    const c = mkCanvas(700, 340), g = c.getContext('2d'), R = mulberry(600 + k * 13);
    g.filter = 'blur(14px)'; g.fillStyle = 'rgba(212,212,212,.55)'; ell(g, 350, 238, 270, 45); g.fill(); g.filter = 'none';
    const n = 46 + Math.floor(R() * 14);
    for (let i = 0; i < n; i++) {
      const u = R(), env = Math.sin(u * Math.PI), x = 70 + u * 560, r = 22 + R() * 48 * (.4 + env), y = 250 - r * .5 - env * (40 + R() * 80) - R() * 30;
      const rg = g.createRadialGradient(x - r * .25, y - r * .5, r * .05, x, y, r);
      rg.addColorStop(0, 'rgba(252,252,252,.9)'); rg.addColorStop(.45, 'rgba(240,240,240,.7)'); rg.addColorStop(.8, 'rgba(218,218,218,.35)'); rg.addColorStop(1, 'rgba(210,210,210,0)');
      g.fillStyle = rg; ell(g, x, y, r * 1.15, r * .85); g.fill();
    }
    const b = mkCanvas(700, 340), bg = b.getContext('2d'); bg.filter = 'blur(9px)'; bg.drawImage(c, 0, 0); bg.filter = 'blur(2px)'; bg.globalAlpha = .6; bg.drawImage(c, 0, 0);
    CLOUDS.push(b);
  }
})();
function cloud(g, k, x, y, w, a = 1) { g.save(); g.globalAlpha = a; g.drawImage(CLOUDS[k % CLOUDS.length], x - w / 2, y - w * .34, w, w * 340 / 700); g.restore(); }
function skyFill(g, top = .8, low = .975, y0 = 0, y1 = FH) { g.fillStyle = linG(g, 0, y0, 0, y1, [[0, top], [1, low]]); g.fillRect(0, 0, FW, FH); }

// ---------- sea texture (from above): ripples on grey water ----------
const SEA = (() => {
  const c = mkCanvas(1024, 640), g = c.getContext('2d'), R = mulberry(808);
  g.fillStyle = gv(.5); g.fillRect(0, 0, 1024, 640);
  for (let i = 0; i < 2600; i++) {
    const x = R() * 1024, y = R() * 640, l = 6 + R() * 26, v = R() < .5 ? .36 + R() * .08 : .62 + R() * .1;
    g.strokeStyle = gv(v, .55); g.lineWidth = 1 + R() * 2.2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 2 - R() * 3, x + l, y + (R() - .5) * 2); g.stroke();
  }
  const b = mkCanvas(1024, 640), bg = b.getContext('2d'); bg.filter = 'blur(1.2px)'; bg.drawImage(c, 0, 0); return b;
})();

// ---------- props ----------
// 1960s saloon in profile, facing right; origin at the ground under its middle, k = px per metre; v = haze (0 near .. 1 gone)
function drawCar(g, x, y, k, v = 0) {
  const tone = (a) => gv(lerp(a, .93, v));
  g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = tone(.08); g.beginPath(); g.moveTo(-2.1, -.35); g.quadraticCurveTo(-2.15, -.75, -1.85, -.8); g.lineTo(-1.0, -.85);
  g.quadraticCurveTo(-.75, -1.42, -.1, -1.45); g.lineTo(.45, -1.45); g.quadraticCurveTo(.95, -1.4, 1.15, -.9); g.lineTo(1.9, -.8); g.quadraticCurveTo(2.2, -.72, 2.15, -.35); g.closePath(); g.fill();
  // windows reflecting the sky, roof highlight, chrome strip
  g.fillStyle = tone(.72); g.beginPath(); g.moveTo(-.85, -.9); g.quadraticCurveTo(-.65, -1.33, -.12, -1.35); g.lineTo(.4, -1.35); g.quadraticCurveTo(.82, -1.3, 1.0, -.92); g.closePath(); g.fill();
  g.fillStyle = tone(.12); g.fillRect(.1, -1.36, .07, .46);
  g.strokeStyle = gv(lerp(.75, .95, v), .7); g.lineWidth = .04; g.beginPath(); g.moveTo(-.65, -1.42); g.quadraticCurveTo(0, -1.5, .7, -1.42); g.stroke();
  g.strokeStyle = gv(lerp(.85, .95, v), .8); g.lineWidth = .03; g.beginPath(); g.moveTo(-2.05, -.6); g.lineTo(2.1, -.6); g.stroke();
  for (const wx of [-1.35, 1.35]) { g.fillStyle = tone(.03); ell(g, wx, -.32, .33, .33); g.fill(); g.fillStyle = tone(.6); ell(g, wx, -.32, .13, .13); g.fill(); }
  g.fillStyle = gv(0, .25 * (1 - v)); ell(g, 0, 0, 2.2, .1); g.fill();
  g.restore();
}
// The bare steel launch-tower scaffold on the beach; origin at its foot, h = height in px, v = haze
function drawScaffold(g, x, y, h, v = .5) {
  const w0 = h * .26, w1 = h * .12, col = gv(lerp(.12, .9, v));
  g.save(); g.strokeStyle = col; g.lineCap = 'square';
  const L = (u) => [x - lerp(w0, w1, u) / 2, y - h * u], Rr = (u) => [x + lerp(w0, w1, u) / 2, y - h * u];
  g.lineWidth = Math.max(1.5, h * .012); g.beginPath(); g.moveTo(...L(0)); g.lineTo(...L(1)); g.moveTo(...Rr(0)); g.lineTo(...Rr(1)); g.moveTo(x - w0 * .1, y); g.lineTo(x - w1 * .1, y - h); g.stroke();
  g.lineWidth = Math.max(1, h * .005); g.beginPath();
  for (let i = 0; i < 14; i++) { const u0 = i / 14, u1 = (i + 1) / 14; g.moveTo(...L(u0)); g.lineTo(...Rr(u1)); g.moveTo(...Rr(u0)); g.lineTo(...L(u1)); g.moveTo(...L(u1)); g.lineTo(...Rr(u1)); }
  g.stroke();
  // platforms and a gantry arm at the top
  g.lineWidth = Math.max(1.5, h * .01); g.beginPath();
  for (const u of [.32, .64, .98]) { const a = L(u), b = Rr(u); g.moveTo(a[0] - h * .03, a[1]); g.lineTo(b[0] + h * .03, b[1]); }
  const top = Rr(.98); g.moveTo(top[0], top[1]); g.lineTo(top[0] + h * .2, top[1] + h * .03); g.moveTo(top[0] + h * .2, top[1] + h * .03); g.lineTo(top[0] + h * .2, top[1] + h * .12); g.stroke();
  g.restore();
}
function drawParasol(g, x, y, k, v) {
  g.save(); g.translate(x, y); g.scale(k, k);
  g.strokeStyle = gv(lerp(.2, .85, v)); g.lineWidth = .04; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -2.0); g.stroke();
  for (let i = 0; i < 6; i++) { const a0 = Math.PI + i / 6 * Math.PI, a1 = Math.PI + (i + 1) / 6 * Math.PI; g.fillStyle = gv(lerp(i % 2 ? .15 : .85, .9, v));
    g.beginPath(); g.moveTo(0, -2.35); g.lineTo(Math.cos(a0) * 1.0, -2.0 + Math.sin(a0) * -.0 - .02); g.lineTo(Math.cos(a1) * 1.0, -2.0); g.closePath(); g.fill(); }
  g.fillStyle = gv(0, .18 * (1 - v)); ell(g, .4, 0, 1.0, .12); g.fill();
  g.restore();
}
// Saraghina far off at the water's edge, dancing (tiny): dark dress, arms up
function drawDancer(g, x, y, k, t) {
  g.save(); g.translate(x, y); g.scale(k, k); const sw = Math.sin(t * 5.2) * .12, ar = Math.sin(t * 2.6) * .3;
  g.fillStyle = gv(.2); g.beginPath(); g.moveTo(-.1, -1.0); g.lineTo(.1, -1.0); g.lineTo(.32 + sw, -.25); g.lineTo(-.3 + sw, -.25); g.closePath(); g.fill();
  g.strokeStyle = gv(.25); g.lineWidth = .08; g.beginPath(); g.moveTo(-.08 + sw * .3, -.25); g.lineTo(-.12, 0); g.moveTo(.08 + sw * .3, -.25); g.lineTo(.14, 0);
  g.moveTo(-.1, -.95); g.lineTo(-.35, -1.45 + ar * .2); g.moveTo(.1, -.95); g.lineTo(.32, -1.5 - ar * .2); g.stroke();
  g.fillStyle = gv(.15); ell(g, 0, -1.15, .12, .13); g.fill();
  g.restore();
}
// The rope: a soft dark line through points, with a travelling wave (amp, centre c along 0..1)
function drawRope(g, pts, wv = null, width = 2.4, v = .1) {
  const n = 40, out = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, seg = u * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(seg)), f = seg - j;
    const p0 = pts[Math.max(0, j - 1)], p1 = pts[j], p2 = pts[j + 1], p3 = pts[Math.min(pts.length - 1, j + 2)];
    const cr = (a, b, c, d) => .5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
    let x = cr(p0[0], p1[0], p2[0], p3[0]), y = cr(p0[1], p1[1], p2[1], p3[1]);
    if (wv) { const d = Math.exp(-Math.pow((u - wv.c) / .07, 2)) * wv.amp; x += d * wv.nx; y += d * wv.ny; }
    out.push([x, y]);
  }
  g.save(); g.strokeStyle = gv(v); g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(out[0][0], out[0][1]); for (const p of out) g.lineTo(p[0], p[1]); g.stroke(); g.restore();
}

// The sea seen from straight above, in frame units: foam bands rolling to a beach on the right (x > shoreX).
const shoreX = (y) => 1560 + y * .35;
function seaTop(g, t, lt) {
  g.drawImage(SEA, -300, -300, FW + 600, FH + 600);
  // breakers: foam bands running diagonally, rolling shoreward (to the lower right); pulses bring a fresh one
  const bands = [];
  for (let i = 0; i < 6; i++) bands.push(600 + i * 190 + 60 * Math.sin(i * 2.3) - lt * 26);
  const hits = [86.87, 88.39];
  hits.forEach((h, j) => { if (t > h - .1) bands.push(380 + 200 * j + (t - h) * 40); });
  bands.forEach((b, i) => {
    const fresh = i >= 6 ? Math.exp(-(t - hits[i - 6]) / .6) : 0;
    const x0 = shoreX(0) - b;
    softFill(g, 18, () => { g.strokeStyle = gv(.96, .45 + .2 * Math.sin(i * 1.7 + 1) ** 2 + .4 * fresh); g.lineWidth = 22 + 26 * Math.abs(Math.sin(i * 1.3)) + 30 * fresh; g.beginPath();
      for (let y = -300; y <= FH + 300; y += 40) { const x = x0 + y * .35 + 18 * n1(700 + i, y * .01); y === -300 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); });
    g.fillStyle = gv(1, .75); const R = mulberry(900 + i);
    for (let k = 0; k < 70; k++) { const y = -300 + R() * (FH + 600), x = x0 + y * .35 + (R() - .3) * 50; ell(g, x, y, 3 + R() * 9, 2 + R() * 4, .4); g.fill(); }
  });
  // the beach in the lower-right corner
  g.save(); g.beginPath(); g.moveTo(shoreX(-300), -300); for (let y = -300; y <= FH + 300; y += 40) g.lineTo(shoreX(y) + 14 * n1(777, y * .01), y); g.lineTo(FW + 400, FH + 300); g.lineTo(FW + 400, -300); g.closePath();
  g.fillStyle = gv(.93); g.fill(); g.restore();
  g.fillStyle = gv(.7, .7); for (let y = -300; y <= FH + 300; y += 6) { const x = shoreX(y) + 14 * n1(777, y * .01); g.fillRect(x, y, 22, 6); }
}

// Surf seen from the beach: broken foam lines, wider and brighter toward us, glitter near the horizon.
function surf(g, hy, depth, t, seed) {
  const R = mulberry(seed);
  for (let i = 0; i < 70; i++) { const x = R() * FW, y = hy + 2 + R() * depth * .3; g.fillStyle = gv(1, .5 + .5 * R()); g.fillRect(x, y, 3 + R() * 10, 1.5); }
  for (let row = 0; row < 7; row++) {
    const u = row / 6, y0 = hy + 6 + Math.pow(u, 1.5) * depth * .92 + 3 * Math.sin(t * 1.3 + row);
    let x = -60 - R() * 200;
    while (x < FW + 60) {
      const len = 80 + R() * 420 * (.4 + u), gap = 20 + R() * 160 * (1 - u * .6);
      g.strokeStyle = gv(.99, .55 + .4 * R()); g.lineWidth = 1.5 + u * 6 * (.5 + R()); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y0);
      for (let k = 1; k <= 6; k++) g.lineTo(x + len * k / 6, y0 + 2.5 * n1(seed * 7 + row, (x + len * k / 6) * .01 + t * .4));
      g.stroke();
      if (u > .5) { g.strokeStyle = gv(.4, .25); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y0 + 4 + u * 4); g.lineTo(x + len, y0 + 4 + u * 4); g.stroke(); }
      x += len + gap;
    }
  }
}

// ---------- the shots ----------
const DREAM_SHOTS = [
  { t: SH.rise, f: shotRise }, { t: SH.rope, f: shotRope }, { t: SH.beach, f: shotBeach },
  { t: SH.tip, f: shotTip }, { t: SH.fall, f: shotFall }, { t: SH.giu, f: shotGiu },
];
function drawDream(g, t) { const [sh, lt] = shotAt(DREAM_SHOTS, t); sh.f(g, t, lt); }

// 77.1-79.37: he floats up out of a stopped car in a jam, arms opening, into bright cloud.
function shotRise(g, t) {
  const rise = 40 + 120 * ease(t, 77.1, 77.87) + 1250 * Math.pow(ease(t, 77.87, 79.6), 1.5) + 30 * kick(PULSE, t, .3);
  const ty = Math.max(0, rise - 330) * .92;        // the camera tilts up after him
  const hy = 640 + ty * .25;                        // horizon (far, slow)
  skyFill(g, .8, .97, -200 + ty * .2, hy);
  cloud(g, 0, 300, 230 + ty * .35, 760, .9); cloud(g, 2, 1500, 140 + ty * .35, 900, .85); cloud(g, 3, 980, 420 + ty * .4, 620, .7);
  // haze band and the far road
  g.fillStyle = linG(g, 0, hy - 40, 0, FH + ty, [[0, .96], [.2, .88], [1, .6]]); g.fillRect(0, hy - 2, FW, FH + ty);
  // the jam: rows of cars receding into the haze
  for (const [row, yy, k, v] of [[0, hy + 26, 34, .8], [1, hy + 70, 60, .62], [2, hy + 150, 105, .4]]) {
    for (let i = -1; i < 12; i++) { const x = ((i * 4.9 + row * 2.1) * k) % (FW + 6 * k) - 2 * k; drawCar(g, x, yy + ty * (.4 + row * .2), k, v); }
  }
  // him (behind the hero car so the roof hides his legs at first)
  const k = 230, bx = 905 + 25 * n1(401, t * .5), by = 930 + ty - rise;
  const arms = lerp(.35, 1.55, ease(t, 77.2, 77.95)) + .35 * ease(t, 78.3, 79.3);
  drawDreamer(g, bx, by, k, { arms, legs: .1 + .15 * ease(t, 78, 79), flutter: .6, time: t, tilt: .04 * n1(402, t * .8), head: [0, -.3 * ease(t, 78, 79)], armWave: true });
  drawCar(g, 930, 1150 + ty, 250, 0);
  // white of the dream clearing as we arrive
  const wh = 1 - ease(t, 77.1, 77.75);
  if (wh > 0) { g.fillStyle = gv(1, wh); g.fillRect(0, 0, FW, FH); }
}

// 79.37-82.34: up in the cloud, arms out; on the 80.89 pulse the camera tilts down the rope to the beach far below.
function shotRope(g, t) {
  const cy = 3400 * Math.pow(ease(t, 80.89, 82.2), 1.2);
  skyFill(g, .84, .98);
  // cloud layers rush up as we tilt down (nearer layers faster)
  const layers = [[.5, .8, 620], [.8, .95, 820], [1.2, 1, 1100]];
  for (let li = 0; li < layers.length; li++) { const [par, a, w] = layers[li];
    for (let i = 0; i < 6; i++) { const x = (i * 517 + li * 233) % (FW + 400) - 200, y = 300 + i * 620 - cy * par; if (y > -500 && y < FH + 500) cloud(g, i + li, x, y, w, a); } }
  // the ground, far below (seen from high up, nearly straight down)
  const gy = 3550 - cy;

  // the cloud floor we tilt down into: denser and whiter the further down the rope we go
  if (gy < FH + 600) {
    for (let i = 0; i < 9; i++) cloud(g, i, (i * 263) % FW + 60, gy - 220 + (i % 3) * 120, 900 + (i % 4) * 160, 1);
    g.fillStyle = linG(g, 0, gy - 150, 0, gy + 350, [[0, .985, 0], [.6, .985, .9], [1, .99, 1]]); g.fillRect(0, gy - 150, FW, FH + 900);
  }
  const rider = { x: 1180, y: gy + 900 };
  // him and the rope
  const k = 230, mx = 900 + 30 * n1(411, t * .4), my = 420 - cy * 1.0 + 12 * Math.sin(t * 1.4);
  const ank = [mx + .3 * k, my + .92 * k];
  const wv = t > 80.89 ? { c: (t - 80.89) * .9, amp: 26 * Math.exp(-(t - 80.89) * 1.5), nx: 1, ny: 0 } : null;
  drawRope(g, [ank, [ank[0] + 60, ank[1] + 600], [ank[0] + 220, ank[1] + 1700], [ank[0] + 320, ank[1] + 2500], [rider.x, rider.y]], wv, 3, .12);
  drawDreamer(g, mx, my, k, { arms: 1.6 + .08 * Math.sin(t * 1.3), legs: .25, flutter: .8, time: t, tilt: .06 * Math.sin(t * .9), head: [.1, .45], rope: true });
}

// 82.34-84.58: on the beach. The rider holds the rope that runs up into the white sky; the scaffold far off,
// parasols, a woman dancing at the water's edge. 83.79 (the accent): he yanks it.
function shotBeach(g, t) {
  const yank = ease(t, ACCENT - .02, ACCENT + .14) * (1 - ease(t, 84.15, 84.55) * .6);
  const shake = Math.exp(-Math.max(0, t - ACCENT) / .14) * (t >= ACCENT ? 1 : 0);
  g.save(); g.translate(14 * shake * Math.sin(t * 70), 10 * shake * Math.cos(t * 63));
  const s = 1 + .03 * (t - SH.beach);           // slow push
  g.translate(FW * .4, FH * .7); g.scale(s, s); g.translate(-FW * .4, -FH * .7);
  const hy = 560;
  skyFill(g, .86, .985, -100, hy);
  cloud(g, 1, 400, 160, 700, .5); cloud(g, 4, 1350, 110, 900, .45);
  // sea: pale grey, white surf lines, the wet sand mirroring the sky
  g.fillStyle = linG(g, 0, hy, 0, hy + 120, [[0, .74], [1, .62]]); g.fillRect(-100, hy, FW + 200, 130);
  surf(g, hy, 120, t, 11);
  g.fillStyle = linG(g, 0, hy + 125, 0, hy + 175, [[0, .9], [1, .8]]); g.fillRect(-100, hy + 125, FW + 200, 50);
  g.fillStyle = linG(g, 0, hy + 170, 0, FH, [[0, .84], [1, .7]]); g.fillRect(-100, hy + 170, FW + 200, FH);
  // sand ripples and footprints
  g.strokeStyle = gv(.6, .25); g.lineWidth = 2; g.beginPath();
  for (let i = 0; i < 18; i++) { const y = hy + 200 + i * i * 1.3; g.moveTo(-100, y); g.quadraticCurveTo(FW / 2, y + 8 + i, FW + 100, y); } g.stroke();
  drawScaffold(g, 1560, hy + 40, 470, .55);
  for (const [x, k] of [[620, 22], [770, 24], [1180, 20]]) drawParasol(g, x, hy + 160, k, .45);
  drawDancer(g, 330, hy + 140, 32, t);
  // the rider, the rope going up out of frame toward the man in the sky
  const st = Math.exp(-Math.max(0, t - ACCENT) / .3) * (t >= ACCENT ? 1 : 0);
  g.fillStyle = gv(0, .25); ell(g, 840, 892, 210, 16); g.fill();
  const hand = drawRider(g, 820, 890, 165, { yank, toss: yank * .8 + .1 * Math.sin(t * 2), step: st });
  const wv = t > ACCENT ? { c: (t - ACCENT) * 2.2, amp: 70 * Math.exp(-(t - ACCENT) * 1.6), nx: .8, ny: .6 } : null;
  drawRope(g, [hand, [hand[0] - 60, hand[1] - 300], [hand[0] - 180, hand[1] - 700], [hand[0] - 330, -200]], wv, 3.2, .1);
  g.restore();
}

// 84.58-85.33: up in the sky, the rope snaps taut: he tips head-first and his hat comes off.
function shotTip(g, t) {
  const u = ease(t, SH.tip, SH.tip + .6);
  skyFill(g, .82, .98);
  const up = (t - SH.tip) * 900;
  cloud(g, 2, 380, 820 - up, 800, .9); cloud(g, 0, 1500, 600 - up * 1.3, 1000, .9); cloud(g, 3, 1100, 1200 - up * 1.5, 1100, 1);
  const k = 240, mx = 960 + 40 * u, my = 470 + 60 * u;
  const tilt = lerp(.1, 2.7, u);
  const ax = mx + Math.cos(tilt + Math.PI / 2) * .92 * k + .3 * k * Math.cos(tilt), ay = my + Math.sin(tilt + Math.PI / 2) * .92 * k + .3 * k * Math.sin(tilt);
  drawRope(g, [[ax, ay], [ax + 200 * (1 - u) + 50, ay + 500], [ax + 220, FH + 300]], null, 3.4, .1);
  drawDreamer(g, mx, my, k, { arms: lerp(1.6, 2.4, u), legs: .2, flutter: 1, time: t, tilt, hat: ease(t, SH.tip + .1, SH.tip + .7), head: [0, .3] });
}

// 85.33-89.84: the fall, seen from straight above: a tiny dark figure over grey water and white surf,
// shrinking toward the sea, his shadow coming up to meet him; new breakers on the pulses.
function shotFall(g, t) {
  const lt = t - SH.fall, zoom = 1 + .22 * ease(t, SH.fall, 89.84);
  g.save(); g.translate(FW / 2, FH / 2); g.scale(zoom, zoom); g.rotate(-.12); g.translate(-FW / 2, -FH / 2);
  seaTop(g, t, lt);
  g.restore();
  // him: shrinking as he falls away from us toward the water; his shadow converges from the lower right
  const fallU = Math.pow(ease(t, SH.fall, 90.0), 1.35), k = lerp(120, 34, fallU), h = 1 - fallU * .85;
  const mx = 900 + 50 * Math.sin(lt * .4), my = 480 + 20 * Math.sin(lt * .5), rot = .5 + lt * .32;
  softFill(g, 6 + 20 * h, () => { g.globalAlpha = .35; g.save(); g.translate(mx + 220 * h, my + 130 * h); g.rotate(rot); g.scale(30, 30); drawDreamerTop(g, { arms: 1.5, legs: .5 }); g.restore(); });
  const ank = [mx + Math.cos(rot + Math.PI / 2) * .95 * k, my + Math.sin(rot + Math.PI / 2) * .95 * k];
  drawRope(g, [ank, [ank[0] + 160, ank[1] + 120], [ank[0] + 420, ank[1] + 170], [FW + 100, FH + 50]], null, 2.4, .12);
  g.save(); g.translate(mx, my); g.rotate(rot); g.scale(k, k); drawDreamerTop(g, { arms: 1.5 + .1 * Math.sin(lt * 2), legs: .5 }); g.restore();
}

// 89.84-92.5: "Giulietta". A small woman in white, short dark hair, on the beach, lifts her face to the falling man;
// "li" she looks up, "et" her hand comes up to shade her eyes, "ta" (91.36, with the guitar) a gust. Then dark.
function shotGiu(g, t) {
  const s = 1 + .035 * (t - SH.giu);
  g.save(); g.translate(1300, 700); g.scale(s, s); g.translate(-1300, -700);
  const hy = 610;
  skyFill(g, .84, .985, -150, hy);
  cloud(g, 3, 1500, 180, 900, .45); cloud(g, 0, 250, 330, 700, .35);
  g.fillStyle = linG(g, 0, hy, 0, hy + 90, [[0, .76], [1, .64]]); g.fillRect(-100, hy, FW + 200, 95);
  surf(g, hy, 88, t, 23);
  g.fillStyle = linG(g, 0, hy + 92, 0, FH, [[0, .9], [.15, .84], [1, .68]]); g.fillRect(-100, hy + 92, FW + 200, FH);
  drawScaffold(g, 1700, hy + 30, 300, .62);
  // the falling man, tiny, high up on the left, tumbling
  const fu = t - SH.giu; g.save(); g.translate(560 + fu * 12, 200 + fu * 40); g.rotate(2.6 + fu * .5); g.scale(16, 16); drawDreamer(g, 0, 0, 1, { arms: 2.0, legs: .5, hat: 1, time: t }); g.restore();
  drawRope(g, [[560 + fu * 12 + 4, 214 + fu * 40], [700, 420], [900, 640], [1000, 880], [1100, FH + 100]], null, 1.6, .25);
  // her
  const up = .45 * ease(t, SH.giu, SH.giu + .5) + .55 * ease(t, GIU.li, GIU.li + .35);
  const hand = ease(t, GIU.et, GIU.et + .38), gust = Math.exp(-Math.max(0, t - GIU.ta) / .45) * (t >= GIU.ta ? 1 : 0);
  g.fillStyle = gv(0, .22); ell(g, 1340, 958, 120, 14); g.fill();
  drawWoman(g, 1310, 955, 420, { up, hand, gust, tt: t });
  g.restore();
}
