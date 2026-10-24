// The kite dream's world, painted in tone (luminance only) in frame units (1920 x 1038), for js/dream/film.js to print.
// High key: blown white sky and haze, grey sea with white surf, pale sand, black suits. Light: a high sun up and to the left.

// ---------- cloud sprites: cumulus puffs lit from above, grey undersides (seeded, built once; copied from js/dream/kite.js) ----------
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
function skyFill(g, top = .8, low = .975, y0 = 0, y1 = FH) { g.fillStyle = linG(g, 0, y0, 0, y1, [[0, top], [1, low]]); g.fillRect(-400, -400, FW + 800, FH + 800); }
// the sun: a blown disc of haze up and to the left, for the halation to bloom
function sunGlow(g, x, y, r, a = 1) { g.fillStyle = radG(g, x, y, 0, r, [[0, 1, a], [.25, 1, .8 * a], [1, 1, 0]]); g.fillRect(x - r, y - r, r * 2, r * 2); }

// ---------- sea from above: ripples on grey water (copied from js/dream/kite.js) ----------
const SEA = (() => {
  const c = mkCanvas(1024, 640), g = c.getContext('2d'), R = mulberry(808);
  g.fillStyle = gv(.5); g.fillRect(0, 0, 1024, 640);
  for (let i = 0; i < 2600; i++) {
    const x = R() * 1024, y = R() * 640, l = 6 + R() * 26, v = R() < .5 ? .36 + R() * .08 : .62 + R() * .1;
    g.strokeStyle = gv(v, .55); g.lineWidth = 1 + R() * 2.2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 2 - R() * 3, x + l, y + (R() - .5) * 2); g.stroke();
  }
  const b = mkCanvas(1024, 640), bg = b.getContext('2d'); bg.filter = 'blur(1.2px)'; bg.drawImage(c, 0, 0); return b;
})();

// Surf seen from the beach: broken foam lines, wider and brighter toward us, glitter near the horizon (from js/dream/kite.js).
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
// A whole beach plate: sky, sea, surf, wet sand mirror, dry sand with ripples. hy = horizon.
function beachPlate(g, t, hy, o = {}) {
  const depth = o.depth ?? 120;
  skyFill(g, .86, .985, hy - 900, hy);
  if (o.sun !== false) sunGlow(g, o.sunX ?? 520, hy - 520, 520, .9);
  if (o.clouds !== false) { cloud(g, 1, 380, hy - 380, 720, .45); cloud(g, 4, 1420, hy - 450, 900, .4); }
  g.fillStyle = linG(g, 0, hy, 0, hy + depth, [[0, .74], [1, .6]]); g.fillRect(-400, hy, FW + 800, depth + 5);
  surf(g, hy, depth, t, o.seed ?? 11);
  g.fillStyle = linG(g, 0, hy + depth, 0, hy + depth + 50, [[0, .9], [1, .82]]); g.fillRect(-400, hy + depth, FW + 800, 52);
  g.fillStyle = linG(g, 0, hy + depth + 48, 0, FH + 300, [[0, .86], [1, .7]]); g.fillRect(-400, hy + depth + 48, FW + 800, FH + 600);
  // sand ripples, denser far off
  g.strokeStyle = gv(.6, .2); g.lineWidth = 2; g.beginPath();
  for (let i = 0; i < 20; i++) { const y = hy + depth + 70 + i * i * 1.5; g.moveTo(-400, y); for (let x = -400; x <= FW + 400; x += 80) g.lineTo(x, y + 6 * Math.sin(x * .004 + i * 1.3)); }
  g.stroke();
}

// ---------- the launch-tower scaffold (after picScaffold in js/leader/pictures.js; finished, not growing) ----------
// Foot centre (x, y), h = height in px, v = haze (0 sharp .. 1 gone). Three legs on the lit front face, a side face receding,
// X bracing per storey, an outside stair zigzagging up the left, planked platforms with rails, a gantry arm on top.
function drawScaffold(g, x, y, h, v = .4) {
  const N = 8, SHt = h / N, tone = (a) => gv(lerp(a, .92, v)), A = 1 - v * .5;
  const half = (yy) => lerp(h * .115, h * .085, (y - yy) / h), dep = (yy) => half(yy) * .62;
  const FL = (yy) => [x - half(yy), yy], FM = (yy) => [x, yy], FR = (yy) => [x + half(yy), yy];
  const SR = (yy) => [x + half(yy) + dep(yy), yy - dep(yy) * .35], BL = (yy) => [x - half(yy) + dep(yy), yy - dep(yy) * .35];
  const lw = Math.max(1, h * .006);
  const line = (a, b, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  g.save(); g.lineCap = 'round';
  // shadow on the sand, down to the right (sun up and to the left)
  g.fillStyle = gv(lerp(.25, .9, v), .3 * (1 - v)); poly(g, [[x - half(y), y + 1], [x + half(y) + dep(y), y - dep(y) * .35], [x + h * .75, y + h * .07], [x + h * .55, y + h * .1]]); g.fill();
  const faces = [{ legs: [BL], bays: [[BL, SR]], col: tone(.5), w: lw * .7 }, { legs: [SR], bays: [[FR, SR]], col: tone(.1), w: lw }, { legs: [FL, FM, FR], bays: [[FL, FM], [FM, FR]], col: tone(.16), w: lw * 1.25, hi: gv(lerp(.7, .95, v), .5 * A) }];
  for (const fc of faces) {
    for (const leg of fc.legs) { if (fc.hi) line([leg(y)[0] - lw * .6, y], [leg(y - h)[0] - lw * .6, y - h], fc.hi, lw * .5); line(leg(y), leg(y - h), fc.col, fc.w * (leg === FM ? .8 : 1.15)); }
    for (let i = 0; i < N; i++) {
      const yb = y - i * SHt, yt = yb - SHt;
      for (const [l, r] of fc.bays) { line(l(yt), r(yt), fc.col, fc.w * .85); line(l(yb), r(yt), fc.col, fc.w * .55); line(r(yb), l(yt), fc.col, fc.w * .55); }
    }
  }
  // outside stair on the left: a flight per storey, zigzagging, a landing and a rail post at each
  for (let i = 0; i < N - 1; i++) {
    const yb = y - i * SHt, yt = yb - SHt, xo = FL(yb)[0], x0 = xo - h * .07, x1 = xo - h * .012, dir = i % 2;
    const a = [dir ? x1 : x0, yb - SHt * .05], b = [dir ? x0 : x1, yt + SHt * .04];
    line(a, b, tone(.14), lw * 1.1);
    g.strokeStyle = tone(.2); g.lineWidth = lw * .6; g.beginPath();
    for (let k = 1; k < 8; k++) { const u = k / 8, xx = lerp(a[0], b[0], u), yy = lerp(a[1], b[1], u); g.moveTo(xx - h * .006, yy); g.lineTo(xx + h * .006, yy); } g.stroke();
    line([x0, yt + SHt * .04], [x1 + h * .006, yt + SHt * .04], tone(.12), lw * 1.1);
    line([x0, yt + SHt * .04], [x0, yt - SHt * .22], tone(.3), lw * .5);
    line([x0, yt - SHt * .2], [lerp(x0, x1, .5), lerp(yt, yb, .5) - SHt * .2], tone(.3), lw * .45); // hand rail
  }
  // planked platforms jutting out at storeys 2, 4, 6 and the top, with rails
  for (const i of [2, 4, 6, 8]) {
    const yy = y - i * SHt, xl = FL(yy)[0] - h * .05, xr = SR(yy)[0] + h * .045;
    g.fillStyle = tone(.12); g.fillRect(xl, yy - h * .006, xr - xl, h * .014);
    g.fillStyle = gv(lerp(.75, .95, v), .7 * A); g.fillRect(xl, yy - h * .008, (xr - xl) * .55, Math.max(1, h * .003));
    g.strokeStyle = tone(.22); g.lineWidth = lw * .55; g.beginPath(); g.moveTo(xl, yy - h * .035); g.lineTo(xr, yy - h * .035);
    for (let k = 0; k <= 6; k++) { const xx = lerp(xl, xr, k / 6); g.moveTo(xx, yy - h * .006); g.lineTo(xx, yy - h * .035); } g.stroke();
  }
  // gantry arm and a hanging hook at the top
  const top = SR(y - h);
  line(top, [top[0] + h * .24, top[1] + h * .02], tone(.12), lw * 1.2);
  line([top[0], top[1] + h * .05], [top[0] + h * .24, top[1] + h * .02], tone(.2), lw * .6);
  line([top[0] + h * .23, top[1] + h * .02], [top[0] + h * .23, top[1] + h * .11], tone(.25), lw * .5);
  g.restore();
}

// ---------- a beach parasol: striped canopy in perspective, pole, its shadow; origin at the pole foot ----------
function drawParasol(g, x, y, k, v = 0, tilt = 0, seed = 1) {
  g.save(); g.translate(x, y); g.scale(k, k);
  const tone = (a) => gv(lerp(a, .92, v));
  g.fillStyle = gv(.3, .28 * (1 - v)); ell(g, .55, .05, 1.15, .2); g.fill(); // shadow pool to the right
  g.strokeStyle = tone(.25); g.lineWidth = .05; g.beginPath(); g.moveTo(0, 0); g.lineTo(tilt * .3, -2.05); g.stroke();
  g.translate(tilt * .3, -2.05); g.rotate(tilt * .15);
  const n = 8, R = 1.05, top = -.42;
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, front = Math.sin((a0 + a1) / 2) > 0;
    const p = (a) => [Math.cos(a) * R, Math.sin(a) * R * .28];
    const lit = .5 + .5 * Math.cos((a0 + a1) / 2 + 2.4); // the panels facing up-left catch the sun
    const base = i % 2 ? .18 : .9;
    g.fillStyle = tone(clamp(base * (.72 + .3 * lit) + (front ? 0 : -.06)));
    g.beginPath(); g.moveTo(0, top); g.lineTo(...p(a0)); g.quadraticCurveTo(Math.cos((a0 + a1) / 2) * R * 1.03, Math.sin((a0 + a1) / 2) * R * .3 + .06, ...p(a1)); g.closePath(); g.fill();
  }
  // scalloped valance under the rim, dark underside showing at the front
  g.fillStyle = gv(lerp(.1, .9, v), .55); g.beginPath(); g.ellipse(0, .02, R * .98, R * .24, 0, 0, Math.PI); g.fill();
  g.restore();
}

// ---------- the rope: a soft dark line through points, with a travelling wave (from js/dream/kite.js) ----------
function drawRope(g, pts, wv = null, width = 2.4, v = .1) {
  const n = 48, out = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, seg = u * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(seg)), f = seg - j;
    const p0 = pts[Math.max(0, j - 1)], p1 = pts[j], p2 = pts[j + 1], p3 = pts[Math.min(pts.length - 1, j + 2)];
    const cr = (a, b, c, d) => .5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
    let x = cr(p0[0], p1[0], p2[0], p3[0]), y = cr(p0[1], p1[1], p2[1], p3[1]);
    if (wv) { const d = Math.exp(-Math.pow((u - wv.c) / .07, 2)) * wv.amp; x += d * wv.nx; y += d * wv.ny; }
    out.push([x, y]);
  }
  g.save(); g.strokeStyle = gv(v); g.lineWidth = width; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(out[0][0], out[0][1]); for (const p of out) g.lineTo(p[0], p[1]); g.stroke();
  if (width > 4) { // a twisted-fibre highlight on a thick rope
    g.strokeStyle = gv(.6, .35); g.lineWidth = width * .22; g.setLineDash([width * .5, width * .7]); g.beginPath(); g.moveTo(out[0][0] - width * .2, out[0][1]); for (const p of out) g.lineTo(p[0] - width * .2, p[1]); g.stroke();
  }
  g.restore();
}

// ---------- the award: a generic gilt statuette (standing figure, arms at its sides, a stepped base). No logo, no lettering. ----------
// Origin at the bottom of the base, s = px per unit (the whole thing is 1 unit tall). glint 0..1.
function drawAward(g, x, y, s, rot = 0, glint = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const gold = (x0, x1) => { const l = g.createLinearGradient(x0, 0, x1, 0); [[0, .3], [.18, .95], [.32, .62], [.55, .22], [.75, .5], [1, .14]].forEach(([o, v]) => l.addColorStop(o, gv(v))); return l; };
  // stepped base
  g.fillStyle = gv(.08); g.fillRect(-.2, -.12, .4, .12);
  g.fillStyle = gold(-.15, .15); g.fillRect(-.15, -.2, .3, .08); g.fillRect(-.11, -.26, .22, .06);
  // figure: legs together, body, arms down along it, head
  g.fillStyle = gold(-.08, .08);
  g.beginPath(); g.moveTo(-.05, -.26); g.lineTo(-.06, -.55); g.quadraticCurveTo(-.09, -.72, -.07, -.8); g.lineTo(.07, -.8); g.quadraticCurveTo(.09, -.72, .06, -.55); g.lineTo(.05, -.26); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-.07, -.8); g.quadraticCurveTo(-.1, -.86, -.06, -.88); g.lineTo(.06, -.88); g.quadraticCurveTo(.1, -.86, .07, -.8); g.closePath(); g.fill();
  ell(g, 0, -.94, .045, .055); g.fillStyle = gold(-.045, .045); g.fill();
  g.strokeStyle = gv(.12, .6); g.lineWidth = .008; g.beginPath(); g.moveTo(-.045, -.78); g.lineTo(-.05, -.6); g.moveTo(.045, -.78); g.lineTo(.05, -.6); g.moveTo(0, -.5); g.lineTo(0, -.28); g.stroke();
  g.restore();
  if (glint > 0) { // the sun catches it: a hard four-point star on the head (halation in the print spreads it)
    const gx = x + Math.sin(rot) * .9 * s, gy = y - Math.cos(rot) * .9 * s, r = s * (.25 + .9 * glint);
    g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = radG(g, gx, gy, 0, r * .5, [[0, 1, glint], [1, 1, 0]]); g.fillRect(gx - r, gy - r, r * 2, r * 2);
    for (const a of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) {
      const L = r * (a % (Math.PI / 2) ? .7 : 1.8), w = r * .05;
      g.save(); g.translate(gx, gy); g.rotate(a); g.fillStyle = linG(g, -L, 0, L, 0, [[0, 1, 0], [.5, 1, glint], [1, 1, 0]]);
      g.beginPath(); g.moveTo(-L, 0); g.lineTo(0, -w); g.lineTo(L, 0); g.lineTo(0, w); g.closePath(); g.fill(); g.restore();
    }
    g.restore();
  }
}
