// The beach, 77.1-92.5 (v2): the next childhood memory in 8 1/2. High-key daylight, sun from the upper left.
// Moving forward through one place: the schoolboys run over a dune, crouch behind an upturned fishing boat, watch a
// big woman in a black dress and shawl dance on the sand by an old bunker hut; the camera drifts on along the shore,
// and on "Giulietta" a small woman in white looks up at a tiny kite-like figure high in the sky.
// Figures are modelled in tone (lit side, shade side, reflected light, cast shadow) in the farmhouse's figure language.
// Replaces kite.js on this page (kite.js is kept for the kite look, which now lives in verse 1: js/kite).

const SUN = [-.72, -.69]; // screen direction toward the sun

// ---------- shading helpers ----------
// A round tapered form from a to b (radii ra, rb): bright on the side facing the sun, turning into shade,
// a little reflected light at the far edge.
function limb(g, a, b, ra, rb, tone, la = .6, edge = 0) {
  let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1e-6; dx /= d; dy /= d;
  const nx = -dy, ny = dx, an = Math.atan2(ny, nx), dot = nx * SUN[0] + ny * SUN[1], lit = dot >= 0 ? 1 : -1;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, r = Math.max(ra, rb), s = la * (.45 + .55 * Math.abs(dot));
  g.beginPath(); g.moveTo(a[0] + nx * ra, a[1] + ny * ra); g.lineTo(b[0] + nx * rb, b[1] + ny * rb);
  g.arc(b[0], b[1], rb, an, an - Math.PI, true); g.lineTo(a[0] - nx * ra, a[1] - ny * ra);
  g.arc(a[0], a[1], ra, an - Math.PI, an - 2 * Math.PI, true); g.closePath();
  g.fillStyle = linG(g, mx + lit * nx * r, my + lit * ny * r, mx - lit * nx * r, my - lit * ny * r,
    [[0, tone + .2 * s], [.35, tone + .07 * s], [.78, tone - .13 * s], [1, tone - .06 * s]]);
  g.fill();
  if (edge) { g.strokeStyle = gv(.42, edge); g.lineWidth = r * .14; g.stroke(); }
}
// Fill the current path as a rounded form: a hot spot toward the sun, falling off into shade, reflected light at the rim.
function modelFill(g, cx, cy, R, hi, mid, lo) {
  g.fillStyle = radG(g, cx, cy, R * .04, R * 1.12, [[0, hi], [.42, mid], [.86, lo], [1, lo + .04]], SUN[0] * R * .55, SUN[1] * R * .55);
  g.fill();
}
// Shade the half of the current path away from the sun (call after fill, path still current).
function shadeAway(g, cx, cy, R, a) {
  g.save(); g.clip();
  g.fillStyle = linG(g, cx + SUN[0] * R * .1, cy + SUN[1] * R * .1, cx - SUN[0] * R, cy - SUN[1] * R, [[0, 0, 0], [1, 0, a]]);
  g.fillRect(cx - R * 2, cy - R * 2, R * 4, R * 4); g.restore();
}
// A soft cast shadow on the sand: the sun is up-left, so it falls down-right, short and a little toward us.
function castShadow(g, x, y, len, w, a = .3) {
  softFill(g, Math.max(2, w * .9), () => { g.fillStyle = gv(.22, a); ell(g, x + len * .45, y + w * .25, len * .55 + w, w, .05); g.fill(); });
}
function mitten(g, x, y, r, skin, rot = 0) {
  g.fillStyle = radG(g, x, y, r * .1, r * 1.2, [[0, skin + .1], [.6, skin], [1, skin - .2]], SUN[0] * r * .5, SUN[1] * r * .5);
  ell(g, x, y, r, r * .82, rot); g.fill();
}

// ---------- sky, clouds, sea, sand ----------
const BCLOUDS = [];
(function buildBeachClouds() {
  for (let k = 0; k < 4; k++) {
    const c = mkCanvas(700, 340), g = c.getContext('2d'), R = mulberry(640 + k * 29);
    const n = 40 + Math.floor(R() * 12);
    for (let i = 0; i < n; i++) {
      const u = R(), env = Math.sin(u * Math.PI), x = 70 + u * 560, r = 20 + R() * 44 * (.4 + env), y = 250 - r * .5 - env * (30 + R() * 70) - R() * 25;
      const rg = g.createRadialGradient(x - r * .3, y - r * .5, r * .05, x, y, r);
      rg.addColorStop(0, 'rgba(255,255,255,.95)'); rg.addColorStop(.5, 'rgba(240,240,240,.7)'); rg.addColorStop(.85, 'rgba(214,214,214,.35)'); rg.addColorStop(1, 'rgba(205,205,205,0)');
      g.fillStyle = rg; ell(g, x, y, r * 1.2, r * .8); g.fill();
    }
    const b = mkCanvas(700, 340), bg = b.getContext('2d'); bg.filter = 'blur(8px)'; bg.drawImage(c, 0, 0); bg.filter = 'blur(1.5px)'; bg.globalAlpha = .6; bg.drawImage(c, 0, 0);
    BCLOUDS.push(b);
  }
})();
function bcloud(g, k, x, y, w, a = 1) { g.save(); g.globalAlpha = a; g.drawImage(BCLOUDS[k % BCLOUDS.length], x - w / 2, y - w * .34, w, w * 340 / 700); g.restore(); }

// Surf seen from the beach: broken foam lines, wider and brighter toward us.
function bsurf(g, hy, depth, t, seed, x0 = -300, x1 = FW + 300) {
  const R = mulberry(seed);
  for (let i = 0; i < 90; i++) { const x = x0 + R() * (x1 - x0), y = hy + 2 + R() * depth * .3; g.fillStyle = gv(1, .4 + .5 * R()); g.fillRect(x, y, 3 + R() * 10, 1.5); }
  for (let row = 0; row < 6; row++) {
    const u = row / 5, y0 = hy + 5 + Math.pow(u, 1.5) * depth * .86 + 2.5 * Math.sin(t * 1.3 + row);
    let x = x0 - R() * 200;
    while (x < x1) {
      const len = 70 + R() * 380 * (.4 + u), gap = 20 + R() * 150 * (1 - u * .6);
      g.strokeStyle = gv(.99, .5 + .4 * R()); g.lineWidth = 1.3 + u * 5 * (.5 + R()); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y0);
      for (let k = 1; k <= 6; k++) g.lineTo(x + len * k / 6, y0 + 2.2 * n1(seed * 7 + row, (x + len * k / 6) * .01 + t * .4));
      g.stroke();
      if (u > .5) { g.strokeStyle = gv(.45, .22); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y0 + 4 + u * 3); g.lineTo(x + len, y0 + 4 + u * 3); g.stroke(); }
      x += len + gap;
    }
  }
}
// The whole beach behind the action: sky with a sun-glow at upper left, grey sea with surf, a wet band, dry sand.
// o: hy horizon, sy water's edge, seed, px (parallax pan of the far layers, px), wash (0..1 a fresh wave up the sand)
function beachBg(g, t, o) {
  const { hy, sy } = o, px = o.px || 0;
  g.fillStyle = linG(g, 0, -60, 0, hy, [[0, .8], [.6, .93], [1, .985]]); g.fillRect(-300, -300, FW + 600, hy + 302);
  g.fillStyle = radG(g, 120 - px * .05, -80, 10, 900, [[0, 1, .9], [.4, 1, .35], [1, 1, 0]]); g.fillRect(-300, -300, FW + 600, hy + 302);
  for (const [k, cx, cy, w, a] of o.clouds || []) bcloud(g, k, cx - px * .08, cy, w, a);
  // sea
  g.fillStyle = linG(g, 0, hy, 0, sy, [[0, .74], [.4, .66], [1, .6]]); g.fillRect(-300, hy, FW + 600, sy - hy + 2);
  g.fillStyle = gv(.55, .55); g.fillRect(-300, hy, FW + 600, 1.6);
  bsurf(g, hy, sy - hy, t, o.seed || 11);
  // the wet band mirrors the sky, then dry sand, darker toward us
  const wb = Math.max(14, (sy - hy) * .45);
  g.fillStyle = linG(g, 0, sy, 0, sy + wb, [[0, .93], [1, .83]]); g.fillRect(-300, sy, FW + 600, wb + 1);
  if (o.wash) { // a fresh wave sliding up the sand: lacy foam front, a sheen behind it
    const wy = sy + wb * (.2 + 1.3 * o.wash);
    g.fillStyle = gv(.97, .55); g.fillRect(-300, sy, FW + 600, wy - sy);
    g.strokeStyle = gv(1, .9); g.lineWidth = 3 + 3 * o.wash; g.beginPath();
    for (let x = -300; x <= FW + 300; x += 24) { const y = wy + 5 * n1(91, x * .02) + 3 * n1(92, x * .07); x === -300 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
  }
  g.fillStyle = linG(g, 0, sy + wb, 0, FH, [[0, .87], [.35, .82], [1, .68]]); g.fillRect(-300, sy + wb, FW + 600, FH + 300);
  // wind ripples on the dry sand, closer together into the distance
  g.strokeStyle = gv(.66, .22); g.lineWidth = 1.6; g.beginPath();
  for (let i = 0; i < 16; i++) { const y = sy + wb + 10 + i * i * 2.1; if (y > FH + 20) break; for (let x = -300; x <= FW + 300; x += 60) { const yy = y + 4 * Math.sin((x + px) * .011 + i * 1.7); x === -300 ? g.moveTo(x, yy) : g.lineTo(x, yy); } }
  g.stroke();
}

// ---------- the launch-tower scaffold, far off on the beach ----------
// A steel lattice tower: front face of three legs, a side face receding to the right, a hazy back face, X bracing,
// stair flights zigzagging up the left, planked platforms, a gantry arm at the top. (X, B) = foot of the front face.
function drawTower(g, X, B, Ht, v = .5) {
  const N = 8, S = Ht / N, sc = Math.max(.35, Ht / 360);
  const half = (y) => lerp(Ht * .135, Ht * .1, (B - y) / Ht), dep = (y) => half(y) * .62;
  const FL = (y) => [X - half(y), y], FM = (y) => [X, y], FR = (y) => [X + half(y), y];
  const SR = (y) => [X + half(y) + dep(y), y - dep(y) * .35], BL = (y) => [X - half(y) + dep(y), y - dep(y) * .35];
  const T = (a) => lerp(a, .95, v);
  g.save(); g.lineCap = 'round';
  // its shadow down to the right across the sand
  { const L = Ht * .75; g.beginPath(); g.moveTo(X - half(B), B + 1); g.lineTo(X + half(B) + dep(B), B - dep(B) * .35); g.lineTo(X + half(B) + dep(B) + L, B + L * .05); g.lineTo(X - half(B) + L * .9, B + L * .08); g.closePath();
    g.fillStyle = linG(g, X, 0, X + L, 0, [[0, T(.4), .4], [1, T(.4), .05]]); g.fill(); }
  const seg = (a, b, col, lw) => { g.strokeStyle = col; g.lineWidth = Math.max(.7, lw); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  const faces = [
    { legs: [BL], bays: [[BL, SR]], col: gv(T(.48), .75), lw: 2.2 },
    { legs: [SR], bays: [[FR, SR]], col: gv(T(.12)), lw: 3.2 },
    { legs: [FL, FM, FR], bays: [[FL, FM], [FM, FR]], col: gv(T(.2)), lw: 4, hi: gv(T(.72), .7) },
  ];
  for (const fc of faces) for (let i = 0; i < N; i++) {
    const yb = B - i * S, yt = yb - S;
    for (const leg of fc.legs) {
      if (fc.hi) seg([leg(yb)[0] - 2 * sc, yb], [leg(yt)[0] - 2 * sc, yt], fc.hi, 1.4 * sc);
      seg(leg(yb), leg(yt), fc.col, fc.lw * sc * (leg === FM ? .75 : 1.1));
    }
    for (const [l, r] of fc.bays) {
      seg(l(yt), r(yt), fc.col, fc.lw * sc * .8);
      if (fc.hi) seg([l(yt)[0], yt - 1.6 * sc], [r(yt)[0], yt - 1.6 * sc], fc.hi, 1.1 * sc);
      seg(l(yb), r(yt), fc.col, fc.lw * sc * .5); seg(r(yb), l(yt), fc.col, fc.lw * sc * .5);
    }
  }
  // stair flights up the outside of the left face, a landing at each storey
  for (let i = 0; i < 6; i++) {
    const yb = B - i * S, yt = yb - S, xo = FL(yb)[0], x0 = xo - Ht * .07, x1 = xo - Ht * .012, dir = i % 2;
    const a = [dir ? x1 : x0, yb - 2 * sc], b = [dir ? x0 : x1, yt + 2 * sc];
    seg(a, b, gv(T(.16)), 3 * sc);
    g.strokeStyle = gv(T(.2), .9); g.lineWidth = Math.max(.6, 1.4 * sc); g.beginPath();
    for (let k = 1; k < 9; k++) { const u = k / 9, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u); g.moveTo(x - 3 * sc, y); g.lineTo(x + 3 * sc, y); }
    g.stroke();
    seg([x0, yt + 2 * sc], [x1 + 4 * sc, yt + 2 * sc], gv(T(.14)), 2.6 * sc);
    seg([x0, yt + 2 * sc], [x0, yt - S * .25], gv(T(.3), .8), 1.3 * sc);
    seg([x0, yt - S * .25], [x1, yt - S * .25], gv(T(.3), .6), 1 * sc);
  }
  // planked platforms jutting out at storeys 2, 4 and 6, with a rail
  for (const i of [2, 4, 6]) {
    const y = B - i * S, xl = FL(y)[0] - Ht * .05, xr = SR(y)[0] + Ht * .04;
    g.fillStyle = gv(T(.14)); g.fillRect(xl, y - 3 * sc, xr - xl, 6 * sc);
    g.fillStyle = gv(T(.8), .8); g.fillRect(xl, y - 4 * sc, (xr - xl) * .55, 1.6 * sc);
    g.strokeStyle = gv(T(.26), .85); g.lineWidth = Math.max(.6, 1.3 * sc); g.beginPath(); g.moveTo(xl, y - S * .32); g.lineTo(xr, y - S * .32);
    for (let x = xl; x <= xr + .1; x += (xr - xl) / 6) { g.moveTo(x, y - 3 * sc); g.lineTo(x, y - S * .32); } g.stroke();
  }
  // the top: a cap platform, a short mast, the gantry arm with its cable and hook
  const yT = B - N * S, tr = FR(yT), tl = FL(yT);
  g.fillStyle = gv(T(.14)); g.fillRect(tl[0] - Ht * .03, yT - 4 * sc, (SR(yT)[0] - tl[0]) + Ht * .06, 7 * sc);
  seg([X, yT], [X, yT - S * .9], gv(T(.2)), 2.4 * sc);
  const ax = tr[0] + Ht * .3;
  seg([tr[0], yT - 2 * sc], [ax, yT + 2 * sc], gv(T(.18)), 3.4 * sc);
  seg([tr[0], yT - S * .6], [ax, yT + 2 * sc], gv(T(.22)), 1.6 * sc);
  seg([X, yT - S * .9], [tr[0], yT - S * .6], gv(T(.22)), 1.4 * sc);
  seg([ax - 3 * sc, yT + 2 * sc], [ax - 3 * sc, yT + S * 1.3], gv(T(.3), .9), 1 * sc);
  g.strokeStyle = gv(T(.2)); g.lineWidth = Math.max(.7, 1.8 * sc); g.beginPath(); g.arc(ax - 3 * sc, yT + S * 1.3 + 4 * sc, 4 * sc, -.2, Math.PI * .9); g.stroke();
  g.restore();
}

// ---------- the bunker hut: squat old concrete, a door ajar, a slot, sand drifted against it ----------
// (x, y) = the front face's bottom-left corner, k = px per metre, v = haze
function drawHut(g, x, y, k, v = 0) {
  const T = (a) => lerp(a, .93, v), W0 = 3.4, Hh = 2.0, D = 2.3, ox = .42, oy = -.2;
  g.save(); g.translate(x, y); g.scale(k, k);
  // shadow to the right on the sand
  softFill(g, .25 * k, () => { g.fillStyle = gv(T(.3), .4); poly(g, [[W0, 0], [W0 + D * ox, D * oy], [W0 + D * ox + 2.4, .25], [W0 + 1.6, .55], [.4, .3]]); g.fill(); });
  // side face (in shade)
  poly(g, [[W0, 0], [W0 + D * ox, D * oy], [W0 + D * ox, -Hh + D * oy], [W0, -Hh]]);
  g.fillStyle = linG(g, W0, 0, W0 + D * ox, 0, [[0, T(.56)], [1, T(.5)]]); g.fill();
  // front face (in sun), weathered: darker toward the ground, rain streaks under the roof edge
  g.fillStyle = linG(g, 0, -Hh, 0, 0, [[0, T(.86)], [.7, T(.8)], [1, T(.7)]]); g.fillRect(0, -Hh, W0, Hh);
  g.fillStyle = linG(g, 0, 0, W0, 0, [[0, 1, .12], [.5, 1, 0], [1, 0, .08]]); g.fillRect(0, -Hh, W0, Hh);
  const R = mulberry(4400);
  for (let i = 0; i < 9; i++) { const sx = R() * W0, w = .05 + R() * .18, l = .3 + R() * 1.1; g.fillStyle = linG(g, 0, -Hh, 0, -Hh + l, [[0, T(.35), .28], [1, T(.35), 0]]); g.fillRect(sx, -Hh, w, l); }
  g.strokeStyle = gv(T(.35), .5); g.lineWidth = .015; g.beginPath(); g.moveTo(2.3, -Hh); g.lineTo(2.2, -1.6); g.lineTo(2.32, -1.3); g.moveTo(.2, -.7); g.lineTo(.36, -.5); g.lineTo(.3, -.2); g.stroke();
  // doorway, and a plank door swung half open toward us
  g.fillStyle = gv(T(.05)); g.fillRect(.45, -1.62, .82, 1.62);
  g.fillStyle = linG(g, .45, 0, .45, -1.6, [[0, T(.12)], [1, T(.02)]]); g.fillRect(.5, -1.58, .72, 1.58);
  poly(g, [[.45, -1.62], [.02, -1.5], [.02, .06], [.45, 0]]); g.fillStyle = linG(g, .02, 0, .45, 0, [[0, T(.62)], [1, T(.42)]]); g.fill();
  g.strokeStyle = gv(T(.25), .7); g.lineWidth = .012; g.beginPath(); for (const u of [.25, .5, .75]) { g.moveTo(lerp(.45, .02, u), lerp(-1.62, -1.5, u)); g.lineTo(lerp(.45, .02, u), lerp(0, .06, u)); } g.stroke();
  // the gun slot, its lip catching the sun
  g.fillStyle = gv(T(.04)); g.fillRect(2.0, -1.38, 1.05, .2);
  g.fillStyle = gv(T(.95)); g.fillRect(1.96, -1.18, 1.13, .045);
  // roof slab: thick overhanging edge in sun, its top
  poly(g, [[-.14, -Hh - .24], [W0 + .14, -Hh - .24], [W0 + .14 + D * ox, -Hh - .24 + D * oy], [-.14 + D * ox, -Hh - .24 + D * oy]]); g.fillStyle = gv(T(.93)); g.fill();
  g.fillStyle = linG(g, 0, -Hh - .24, 0, -Hh, [[0, T(.9)], [1, T(.74)]]); g.fillRect(-.14, -Hh - .24, W0 + .28, .24);
  poly(g, [[W0 + .14, -Hh - .24], [W0 + .14 + D * ox, -Hh - .24 + D * oy], [W0 + .14 + D * ox, -Hh + D * oy], [W0 + .14, -Hh]]); g.fillStyle = gv(T(.6)); g.fill();
  g.fillStyle = gv(T(.3), .5); g.fillRect(-.14, -Hh, W0 + .28, .05); // the shadow line under the slab
  // a rusty stovepipe
  g.fillStyle = linG(g, 2.75, 0, 2.95, 0, [[0, T(.45)], [1, T(.15)]]); g.fillRect(2.75, -Hh - .9, .2, .7);
  g.fillStyle = gv(T(.1)); g.fillRect(2.7, -Hh - .95, .3, .07);
  // sand drifted against the foot of the walls
  g.beginPath(); g.moveTo(-.6, .08); g.quadraticCurveTo(-.2, -.05, .02, -.3); g.quadraticCurveTo(.1, -.04, .5, -.05); g.lineTo(1.3, -.04);
  g.quadraticCurveTo(2.2, -.32, 3.0, -.2); g.quadraticCurveTo(3.5, -.36, W0 + D * ox * .6, D * oy * .6 - .1); g.lineTo(W0 + D * ox + .5, .1); g.lineTo(-.6, .12); g.closePath();
  g.fillStyle = linG(g, 0, -.35, 0, .1, [[0, T(.93)], [1, T(.84)]]); g.fill();
  g.restore();
}

// ---------- the upturned fishing boat, in profile, bow to the right; origin = middle of its gunwale on the sand ----------
const keelV = (u) => -(.7 + .3 * (1 - Math.pow(u / 2.55, 2)));   // keel height (negative = up) along the hull, metres
function drawBoat(g, x, y, k, v = 0) {
  const T = (a) => lerp(a, .92, v);
  g.save(); g.translate(x, y); g.scale(k, k);
  // shadow on the sand, falling down-right
  softFill(g, .08 * k, () => { g.fillStyle = gv(.2, .35 * (1 - v)); poly(g, [[-2.5, -.02], [2.7, -.05], [3.6, .28], [-1.6, .34]]); g.fill(); });
  const hull = () => {
    g.beginPath(); g.moveTo(-2.55, 0); g.lineTo(-2.5, keelV(-2.5));
    for (let u = -2.4; u <= 2.45; u += .1) g.lineTo(u, keelV(u));
    g.quadraticCurveTo(2.8, -.62, 2.82, -.28); g.quadraticCurveTo(2.5, -.05, 1.7, -.02); g.lineTo(-2.55, 0); g.closePath();
  };
  hull(); g.fillStyle = linG(g, 0, -1.0, 0, 0, [[0, T(.52)], [.18, T(.34)], [.6, T(.22)], [1, T(.13)]]); g.fill();
  hull(); g.save(); g.clip();
  // the sun from the left: the stern half a touch brighter, the bow turning away
  g.fillStyle = linG(g, -2.6, 0, 2.8, 0, [[0, 1, .1], [.5, 1, 0], [1, 0, .15]]); g.fillRect(-3, -1.2, 6, 1.3);
  // strakes: overlapping planks, each lapped edge a dark line with a lit line above it
  for (let s = 1; s <= 4; s++) {
    const off = s * .16;
    g.strokeStyle = gv(T(.08), .55); g.lineWidth = .018; g.beginPath();
    for (let u = -2.55; u <= 2.7; u += .1) { const yy = Math.min(-.04, keelV(Math.min(u, 2.5)) + off); u === -2.55 ? g.moveTo(u, yy) : g.lineTo(u, yy); } g.stroke();
    g.strokeStyle = gv(T(.62), .35); g.lineWidth = .012; g.beginPath();
    for (let u = -2.55; u <= 2.7; u += .1) { const yy = Math.min(-.06, keelV(Math.min(u, 2.5)) + off - .025); u === -2.55 ? g.moveTo(u, yy) : g.lineTo(u, yy); } g.stroke();
  }
  // a pale painted band along the gunwale, scuffed
  g.fillStyle = linG(g, -2.6, 0, 2.8, 0, [[0, T(.88)], [1, T(.66)]]); g.fillRect(-2.6, -.2, 5.5, .11);
  for (let i = 0; i < 9; i++) { const u = -2.3 + i * .55 + .2 * Math.sin(i * 7), w = .12 + .2 * Math.abs(Math.sin(i * 3)); g.fillStyle = gv(T(.3), .18 + .1 * Math.abs(Math.sin(i * 5))); ell(g, u, -.15 + .03 * Math.sin(i * 2), w, .03 + .02 * Math.abs(Math.sin(i)), .1); g.fill(); }
  g.fillStyle = gv(T(.05), .8); g.fillRect(-2.6, -.09, 5.5, .02);
  g.restore();
  // keel strip along the top, its upper edge in the sun
  g.strokeStyle = gv(T(.08)); g.lineWidth = .07; g.beginPath(); for (let u = -2.5; u <= 2.5; u += .1) { u === -2.5 ? g.moveTo(u, keelV(u) - .02) : g.lineTo(u, keelV(u) - .02); } g.stroke();
  g.strokeStyle = gv(T(.85), .8); g.lineWidth = .02; g.beginPath(); for (let u = -2.5; u <= 2.3; u += .1) { u === -2.5 ? g.moveTo(u, keelV(u) - .06) : g.lineTo(u, keelV(u) - .06); } g.stroke();
  // the transom at the stern, facing the sun
  poly(g, [[-2.55, 0], [-2.5, keelV(-2.5)], [-2.38, keelV(-2.38) + .02], [-2.43, 0]]); g.fillStyle = gv(T(.62)); g.fill();
  // the gap under the bow where it rests on a chock
  g.fillStyle = gv(T(.06)); poly(g, [[1.6, -.01], [2.6, -.12], [2.7, 0]]); g.fill();
  g.fillStyle = linG(g, 2.1, 0, 2.35, 0, [[0, T(.6)], [1, T(.32)]]); g.fillRect(2.1, -.1, .25, .1);
  g.restore();
}
// Screen y of the keel top at screen x, for a boat drawn at (bx, by, k).
function boatTopY(bx, by, k, x) { const u = clamp((x - bx) / k, -2.5, 2.5); return by + (keelV(u) - .05) * k; }

// ---------- a schoolboy: dark smock, white round collar, short trousers, knee socks ----------
// (x, y) = ground between his feet, k = px per metre. o: face (1 right, -1 left), run (stride phase, radians) or
// null standing, lean (rad, forward), lift (m), hideLegs, hands: null (arms from the run/hang) or [[u, v], [u, v]]
// targets in metres (near hand, far hand), mouth, eyes, turn, tilt, look, hair, brows, tone, skin
function drawBoy(g, x, y, k, o = {}) {
  const f = o.face ?? 1, tone = o.tone ?? .14, skin = o.skin ?? .84, lean = o.lean || 0, ph = o.run;
  const legs = [];
  for (const side of [1, -1]) {
    let a, b;
    if (ph == null) { a = side * .05 - .02; b = .05; }
    else { const p = ph + (side < 0 ? Math.PI : 0); a = .6 * Math.sin(p); b = .12 + 1.1 * Math.pow(Math.max(0, Math.cos(p)), 1.3); }
    const kn = [Math.sin(a) * .3, -Math.cos(a) * .3], an = [kn[0] + Math.sin(a - b) * .29, kn[1] - Math.cos(a - b) * .29];
    legs.push({ side, a, b, kn, an });
  }
  const low = Math.min(legs[0].an[1], legs[1].an[1]);
  const hipV = (ph == null ? .62 : -low + .05) + (o.lift || 0), sV = hipV + .38;
  const P = (u, v) => [x + (u + lean * Math.max(0, v - hipV)) * k * f, y - v * k];
  const L = (u, v) => [x + u * k * f, y - v * k]; // legs: no lean
  const drawLeg = (lg, far) => {
    const dk = far ? .1 : 0, H = L(0, hipV), K = L(lg.kn[0], hipV + lg.kn[1]), A = L(lg.an[0], hipV + lg.an[1]);
    const mid = [lerp(K[0], A[0], .45), lerp(K[1], A[1], .45)];
    limb(g, H, K, .055 * k, .045 * k, skin - .06 - dk);                 // thigh
    limb(g, K, mid, .045 * k, .04 * k, skin - .04 - dk);                // shin, bare knee
    limb(g, mid, A, .042 * k, .036 * k, .52 - dk);                      // knee sock
    g.strokeStyle = gv(.75 - dk, .7); g.lineWidth = .012 * k; g.beginPath(); g.moveTo(mid[0] - .03 * k, mid[1]); g.lineTo(mid[0] + .03 * k, mid[1]); g.stroke();
    limb(g, H, [lerp(H[0], K[0], .55), lerp(H[1], K[1], .55)], .07 * k, .06 * k, tone + .02 - dk * .5); // short trousers
    const sa = lg.a - lg.b * .6, toe = [A[0] + Math.cos(sa) * .1 * k * f, A[1] + Math.sin(sa) * .1 * k * .4];
    limb(g, [A[0] - .02 * k * f, A[1] + .015 * k], toe, .035 * k, .03 * k, .07, .4); // shoe
  };
  // arm targets
  const arm = (side) => {
    const S = P(.01 * side, sV - .03);
    let E, Hd;
    if (o.hands) {
      const tg = o.hands[side > 0 ? 0 : 1], Tt = P(tg[0], tg[1]);
      const dx = Tt[0] - S[0], dy = Tt[1] - S[1], d = Math.min(Math.hypot(dx, dy), .39 * k), ang = Math.atan2(dy, dx);
      const h = Math.sqrt(Math.max(0, (.2 * k) ** 2 - (d / 2) ** 2)), bend = f; // elbow drops down
      E = [S[0] + Math.cos(ang) * d / 2 - Math.sin(ang) * h * bend, S[1] + Math.sin(ang) * d / 2 + Math.cos(ang) * h * bend];
      Hd = [S[0] + Math.cos(ang) * d, S[1] + Math.sin(ang) * d];
    } else {
      const p = ph == null ? 0 : ph + (side < 0 ? Math.PI : 0), ua = ph == null ? -.08 * side : -.8 * Math.sin(p), fa = ua + (ph == null ? .15 : 1.3);
      E = [S[0] + Math.sin(ua) * .2 * k * f, S[1] + Math.cos(ua) * .2 * k];
      Hd = [E[0] + Math.sin(fa) * .18 * k * f, E[1] + Math.cos(fa) * .18 * k];
    }
    return { S, E, Hd };
  };
  const drawArm = (a, far) => {
    const dk = far ? .07 : 0;
    limb(g, a.S, a.E, .05 * k, .043 * k, tone + .02 - dk);
    const w = [lerp(a.E[0], a.Hd[0], .8), lerp(a.E[1], a.Hd[1], .8)];
    limb(g, a.E, w, .043 * k, .038 * k, tone + .02 - dk);
    mitten(g, a.Hd[0], a.Hd[1], .04 * k, skin - dk * 1.5);
  };
  const aN = arm(1), aF = arm(-1);
  drawArm(aF, true);
  if (!o.hideLegs) { drawLeg(legs[1], true); drawLeg(legs[0], false); }
  // the smock: a dark A-line from the shoulders to above the knee, gathered at a yoke, lit from the upper left
  const sm = [P(-.06 * f, sV + .05), P(-.14, sV), P(-.19, hipV - .14), P(.18, hipV - .15), P(.13, sV), P(.06 * f, sV + .05)];
  g.beginPath(); g.moveTo(...sm[0]); g.quadraticCurveTo(...P(-.15, sV + .02), ...sm[1]); g.quadraticCurveTo(...P(-.18, sV - .2), ...sm[2]);
  g.quadraticCurveTo(...P(0, hipV - .19), ...sm[3]); g.quadraticCurveTo(...P(.17, sV - .2), ...sm[4]); g.quadraticCurveTo(...P(.12, sV + .03), ...sm[5]); g.closePath();
  const C = P(0, sV - .2);
  modelFill(g, C[0], C[1], .34 * k, tone + .2, tone + .05, tone - .06);
  shadeAway(g, C[0], C[1], .3 * k, .25);
  // folds hanging from the yoke
  g.save(); g.lineCap = 'round';
  for (const [u, v] of [[-.09, .5], [-.01, .35], [.08, .45]]) {
    const a = P(u, sV - .12), b = P(u * 1.3, hipV - .12);
    g.strokeStyle = gv(tone + .22, v); g.lineWidth = .014 * k; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0] + .02 * k, (a[1] + b[1]) / 2, b[0], b[1]); g.stroke();
    g.strokeStyle = gv(0, .35); g.lineWidth = .012 * k; g.beginPath(); g.moveTo(a[0] + .018 * k, a[1]); g.quadraticCurveTo(a[0] + .04 * k, (a[1] + b[1]) / 2, b[0] + .02 * k, b[1]); g.stroke();
  }
  const y0 = P(-.13, sV - .1), y1 = P(.12, sV - .1); g.strokeStyle = gv(tone + .25, .6); g.lineWidth = .01 * k; g.beginPath(); g.moveTo(y0[0], y0[1]); g.lineTo(y1[0], y1[1]); g.stroke();
  g.restore();
  drawArm(aN, false);
  // head
  const hc = P(.025, sV + .175);
  drawHead(g, hc[0], hc[1], .118 * k, { turn: o.turn ?? .45 * f, tilt: (o.tilt || 0) * f, skin: skin + .04, hair: o.hair ?? .1, style: 'boy', eyes: o.eyes ?? 1,
    look: o.look || [.7 * f, -.05], mouth: o.mouth || 0, L: SUN, la: .8, brows: o.brows || 0 });
  // round white collar over the neck of the smock
  const cc = P(.01, sV + .03);
  g.fillStyle = radG(g, cc[0], cc[1], .005 * k, .11 * k, [[0, .99], [.7, .9], [1, .62]], SUN[0] * .05 * k, SUN[1] * .03 * k);
  g.beginPath(); g.ellipse(cc[0], cc[1], .1 * k, .042 * k, lean * .3 * f, 0, Math.PI); g.lineTo(cc[0] - .1 * k, cc[1] - .012 * k); g.closePath(); g.fill();
  g.strokeStyle = gv(.5, .5); g.lineWidth = .006 * k; g.beginPath(); g.moveTo(cc[0], cc[1] - .005 * k); g.lineTo(cc[0], cc[1] + .04 * k); g.stroke();
  return { hands: [aN.Hd, aF.Hd], head: hc };
}

// ---------- the big woman in the black dress and shawl (Saraghina stand-in), front view ----------
// (x, y) = ground between her feet, k = px per metre. o (from danceAt): sway (m, upper body over the standing foot),
// step (-1..1 which foot is lifted), hop (m), spin (radians about her vertical axis), fly (0..1 shawl flying out),
// arms (0 down holding the shawl .. 1 out for the rumba), wave (-1..1), sw (shawl swing), grin (0..1), turn
const HAIR_LUMPS = (() => { const R = mulberry(5150), a = []; for (let i = 0; i < 22; i++) a.push(.86 + R() * .32); return a; })();
function drawBigWoman(g, x, y, k, o = {}) {
  const sp = o.spin || 0, c = Math.cos(sp), sx = .2 + .8 * Math.abs(c), back = c < 0;
  const sway = o.sway || 0, hop = o.hop || 0, arms = o.arms || 0, wave = o.wave || 0, fly = o.fly || 0, sw = o.sw || 0, step = o.step || 0;
  const P = (u, v) => [x + (u * sx + sway * Math.pow(clamp(v / 1.6, 0, 1.2), 1.2)) * k, y - (v + hop) * k];
  const dress = .1, skin = .82, shawl = .3;
  // cast shadow (stays on the ground when she hops)
  castShadow(g, x, y, .9 * k * (1 - hop * 2), .07 * k, .32);
  // shawl flying out round her on the spin: the far half goes behind her
  const flyRing = (front) => {
    if (fly <= .02) return;
    const cy = y - (1.18 + hop) * k, rx = (.42 + .62 * fly) * k, ry = .13 * fly * k + 2;
    g.save(); g.beginPath(); g.ellipse(x + sway * k * .7, cy, rx, ry, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
    g.ellipse(x + sway * k * .7, cy + .16 * k * fly, rx * .96, ry * .9, 0, front ? Math.PI : TAU, front ? 0 : Math.PI, true); g.closePath();
    g.fillStyle = linG(g, x - rx, 0, x + rx, 0, [[0, shawl + .2], [.5, shawl + (front ? .05 : -.08)], [1, shawl - .1]]); g.fill();
    g.strokeStyle = gv(shawl - .1, .8); g.lineWidth = .012 * k; g.beginPath();
    for (let i = 0; i <= 26; i++) { const a = (front ? 0 : Math.PI) + i / 26 * Math.PI, ex = x + sway * k * .7 + Math.cos(a) * rx * .96, ey = cy + .16 * k * fly + Math.sin(a) * ry * .9;
      g.moveTo(ex, ey); g.lineTo(ex + Math.cos(a) * .04 * k, ey + .05 * k); } g.stroke();
    g.restore();
  };
  flyRing(false);
  // legs: sturdy calves under the hem, the lifted foot raised and out a little
  for (const s of [-1, 1]) {
    const lifted = Math.max(0, step * s), fu = s * (.13 + .05 * lifted), fv = .1 * lifted;
    const K = P(s * .12, .44), A = [x + fu * k, y - (fv + .08 + hop) * k];
    limb(g, K, A, .07 * k, .045 * k, skin - .14 - (s > 0 ? .06 : 0), .8);
    limb(g, [A[0] - s * .02 * k, A[1] + .03 * k], [A[0] + s * .07 * k, A[1] + .045 * k], .04 * k, .035 * k, .08, .4); // flat shoes
  }
  // skirt: a full bell from the waist, its hem lagging the sway, flaring on the spin
  const lag = -sway * .5, hw = .44 + .12 * fly;
  const skirt = () => {
    g.beginPath(); g.moveTo(...P(-.27, .98)); g.quadraticCurveTo(...P(-.42 + lag * .3, .78), ...P(-hw + lag, .41));
    for (let i = 1; i <= 8; i++) { const u = -hw + lag + i / 8 * hw * 2, vv = .41 - .035 * Math.sin(i * Math.PI / 4 + (o.tt || 0) * 3) * (.4 + Math.abs(sway) * 8 + fly); g.lineTo(...P(u, vv)); }
    g.quadraticCurveTo(...P(.42 + lag * .3, .78), ...P(.27, .98)); g.closePath();
  };
  skirt(); { const C = P(0, .72); modelFill(g, C[0], C[1], .55 * k * sx, dress + .2, dress + .05, dress - .06); }
  skirt(); { const C = P(0, .72); shadeAway(g, C[0], C[1], .5 * k, .3); }
  g.save(); g.lineCap = 'round';
  for (const [u, a] of [[-.28, .45], [-.12, .3], [.06, .22], [.22, .15]]) { // folds: lit ridges, dark troughs
    const t0 = P(u * .55, .95), b0 = P(u * 1.3 + lag, .44);
    g.strokeStyle = gv(dress + .32, a); g.lineWidth = .02 * k * sx; g.beginPath(); g.moveTo(t0[0], t0[1]); g.quadraticCurveTo(lerp(t0[0], b0[0], .5) - .02 * k, (t0[1] + b0[1]) / 2, b0[0], b0[1]); g.stroke();
    g.strokeStyle = gv(0, .45); g.lineWidth = .018 * k * sx; g.beginPath(); g.moveTo(t0[0] + .03 * k * sx, t0[1]); g.quadraticCurveTo(lerp(t0[0], b0[0], .5) + .02 * k, (t0[1] + b0[1]) / 2, b0[0] + .04 * k * sx, b0[1]); g.stroke();
  }
  g.restore();
  // bodice: a broad plain block, high round neckline
  const bod = () => { g.beginPath(); g.moveTo(...P(-.27, .97)); g.bezierCurveTo(...P(-.4, 1.08), ...P(-.38, 1.26), ...P(-.31, 1.35)); g.quadraticCurveTo(...P(-.2, 1.42), ...P(-.07, 1.45));
    g.quadraticCurveTo(...P(0, 1.43), ...P(.07, 1.45)); g.quadraticCurveTo(...P(.2, 1.42), ...P(.31, 1.35)); g.bezierCurveTo(...P(.38, 1.26), ...P(.4, 1.08), ...P(.27, .97)); g.closePath(); };
  bod(); { const C = P(-.02, 1.2); modelFill(g, C[0], C[1], .36 * k * sx, dress + .22, dress + .06, dress - .05); }
  bod(); { const C = P(0, 1.2); shadeAway(g, C[0], C[1], .32 * k, .3); }
  // arms: from the shoulders, out for the rumba with the forearms up, or down at her sides holding the shawl
  const armPts = (s) => {
    const wv = wave * s, S = P(s * .29, 1.33);
    const E = P(s * lerp(.36, .58, arms), lerp(1.06, 1.22 + .07 * wv, arms));
    const Hd = P(s * lerp(.37, .66, arms), lerp(.86, 1.5 + .14 * wv, arms));
    return { S, E, Hd };
  };
  const AL = armPts(-1), AR = armPts(1);
  // the shawl: across the shoulders and hanging from each arm like wings, fringed (fades as it flies out)
  const wing = (s, A) => {
    const hang = P(s * (.42 + .06 * arms) + sw * .1, lerp(.82, .88, arms)), body = P(s * .3, 1.0);
    g.beginPath(); g.moveTo(...P(s * .12, 1.45)); g.quadraticCurveTo(...P(s * .32, 1.44), ...A.S);
    g.quadraticCurveTo(A.E[0] + s * .02 * k, A.E[1] + .05 * k, A.Hd[0] - s * .02 * k, A.Hd[1] + .05 * k);
    g.quadraticCurveTo(lerp(A.Hd[0], hang[0], .5) + sw * .04 * k, lerp(A.Hd[1], hang[1], .6), hang[0], hang[1]);
    g.quadraticCurveTo(lerp(hang[0], body[0], .5), hang[1] - .02 * k, body[0], body[1]); g.lineTo(...P(s * .2, 1.3)); g.closePath();
    const C = P(s * .4, 1.18); modelFill(g, C[0], C[1], .4 * k, shawl + .2, shawl + .04, shawl - .08);
    // fringe along the hanging edge
    g.strokeStyle = gv(shawl - .05, .85); g.lineWidth = .01 * k; g.beginPath();
    for (let i = 0; i <= 10; i++) { const u = i / 10, ex = lerp(A.Hd[0], hang[0], u), ey = lerp(A.Hd[1] + .05 * k, hang[1], Math.pow(u, .7)); g.moveTo(ex, ey); g.lineTo(ex + sw * .02 * k, ey + .06 * k); }
    for (let i = 1; i <= 6; i++) { const u = i / 6, ex = lerp(hang[0], body[0], u), ey = lerp(hang[1], body[1], u); g.moveTo(ex, ey); g.lineTo(ex + sw * .02 * k, ey + .06 * k); }
    g.stroke();
    // a woven stripe near the edge
    g.strokeStyle = gv(shawl + .25, .5); g.lineWidth = .012 * k; g.beginPath(); g.moveTo(A.Hd[0], A.Hd[1] + .02 * k); g.quadraticCurveTo(lerp(A.Hd[0], hang[0], .5), lerp(A.Hd[1], hang[1], .55) - .03 * k, hang[0], hang[1] - .04 * k); g.stroke();
  };
  for (const [s, A] of [[-1, AL], [1, AR]]) {
    limb(g, A.S, A.E, .07 * k, .055 * k, dress + .06);                     // sleeve
    limb(g, A.E, A.Hd, .052 * k, .042 * k, skin - .02);                     // bare forearm
    mitten(g, A.Hd[0], A.Hd[1], .055 * k, skin);
  }
  g.save(); g.globalAlpha = 1 - fly; wing(-1, AL); wing(1, AR);
  // the band of shawl across the shoulders
  g.beginPath(); g.moveTo(...P(-.34, 1.34)); g.quadraticCurveTo(...P(-.3, 1.46), ...P(0, 1.47)); g.quadraticCurveTo(...P(.3, 1.46), ...P(.34, 1.34));
  g.quadraticCurveTo(...P(.16, 1.3), ...P(sw * .03, 1.14)); g.quadraticCurveTo(...P(-.16, 1.3), ...P(-.34, 1.34)); g.closePath();
  { const C = P(-.06, 1.36); modelFill(g, C[0], C[1], .32 * k, shawl + .24, shawl + .06, shawl - .07); }
  g.strokeStyle = gv(shawl - .06, .85); g.lineWidth = .009 * k; g.beginPath();
  for (let i = 0; i <= 12; i++) { const u = i / 12, side = u < .5 ? -1 : 1, w = Math.abs(u - .5) * 2, p = P(side * .34 * w + sw * .03 * (1 - w), lerp(1.14, 1.34, w) - .005);
    g.moveTo(p[0], p[1]); g.lineTo(p[0] + sw * .015 * k, p[1] + .05 * k); } g.stroke();
  g.restore();
  // head: big wild dark hair, a pale face with a wide grin; seen from behind halfway round the spin
  const hc = P(0, 1.6), r = .13 * k, turn = clamp(Math.sin(sp) * 1.1 + (o.turn || 0), -.9, .9);
  const hair = (scale) => { g.beginPath(); for (let i = 0; i <= 22; i++) { const a = i / 22 * TAU, rr = r * 1.45 * scale * HAIR_LUMPS[i % 22]; g.lineTo(hc[0] + Math.cos(a) * rr * 1.05, hc[1] - .1 * r + Math.sin(a) * rr * .95); } g.closePath(); };
  hair(1); modelFill(g, hc[0], hc[1] - .1 * r, r * 1.5, .3, .1, .05);
  g.strokeStyle = gv(.4, .5); g.lineWidth = .018 * k; for (let i = 0; i < 6; i++) { const a = Math.PI * (1.05 + i * .13); g.beginPath(); g.arc(hc[0] + Math.cos(a) * r * 1.05, hc[1] + Math.sin(a) * r * 1.0, r * .22, a - .6, a + 1.6); g.stroke(); }
  if (!back) {
    drawHead(g, hc[0], hc[1], r, { turn, tilt: (o.tilt || 0) + sway * .8, skin: skin + .04, hair: .07, style: 'woman', eyes: lerp(1, .55, o.grin || 0), look: [turn * .5, 0], L: SUN, la: .8, brows: .8, mouth: 0 });
    // the grin: a wide dark crescent, a line of teeth
    const gr = o.grin || 0;
    if (gr > .05) {
      g.save(); g.translate(hc[0], hc[1]); g.rotate((o.tilt || 0) + sway * .8); g.scale(r, r);
      const mx = turn * .42, my = .55;
      g.fillStyle = gv(.1); g.beginPath(); g.moveTo(mx - .3 * gr, my - .03); g.quadraticCurveTo(mx, my + .02, mx + .3 * gr, my - .03); g.quadraticCurveTo(mx, my + .3 * gr, mx - .3 * gr, my - .03); g.fill();
      g.fillStyle = gv(.95); g.beginPath(); g.moveTo(mx - .24 * gr, my - .01); g.quadraticCurveTo(mx, my + .04, mx + .24 * gr, my - .01); g.quadraticCurveTo(mx, my + .1 * gr, mx - .24 * gr, my - .01); g.fill();
      g.strokeStyle = gv(.3, .6); g.lineWidth = .03; for (const s of [-1, 1]) { g.beginPath(); g.arc(mx + s * .33 * gr, my - .06, .08, s > 0 ? -.2 : Math.PI * .7, s > 0 ? Math.PI * .3 : Math.PI * 1.2); g.stroke(); } // smile creases
      g.restore();
    }
    // front hair falling over the brow
    g.beginPath(); for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.08 + i / 10 * .84), rr = r * (1.08 + .1 * Math.sin(i * 2.3)); g.lineTo(hc[0] + Math.cos(a) * rr + turn * .12 * r, hc[1] - .05 * r + Math.sin(a) * rr); }
    for (let i = 6; i >= 0; i--) { const u = i / 6; g.quadraticCurveTo(hc[0] + lerp(-.85, .85, u) * r + .1 * r, hc[1] - .48 * r, hc[0] + lerp(-.85, .85, u) * r + turn * .12 * r, hc[1] - (.62 - (i % 2) * .1) * r); }
    g.closePath(); modelFill(g, hc[0], hc[1] - .6 * r, r * 1.1, .3, .12, .06);
  } else {
    hair(.95); modelFill(g, hc[0], hc[1] - .1 * r, r * 1.4, .28, .1, .05);
  }
  flyRing(true);
}

// The dance: a big clumsy rumba shuffle on the eighth-note grid of the guitar pulse (1.496 / 4 s), a hop on each
// pulse from 82.34, a spin on the 83.79 accent with the shawl flying out.
const EIGHTH = 1.496 / 4, DANCE0 = 82.34;
const HOPS = [82.34, 85.33, 86.87, 88.39, 89.84];
function danceAt(t) {
  if (t < DANCE0 - .04) return { sway: .015 * Math.sin(t * 1.7), step: 0, arms: 0, wave: 0, sw: .2 * Math.sin(t * 1.7 - .5), hop: 0, spin: 0, fly: 0, grin: .25, turn: -.25, tt: t };
  const ph = (t - DANCE0) / EIGHTH, st = Math.sin(Math.PI * ph), arms = ease(t, DANCE0 - .04, DANCE0 + .22);
  let hop = 0;
  for (const h of HOPS) { const d = t - h; if (d >= 0 && d < .34) hop = Math.max(hop, .13 * Math.sin(d / .34 * Math.PI)); }
  const su = (t - ACCENT) / .6, spinning = su > 0 && su < 1;
  const spin = spinning ? TAU * (1 - Math.pow(1 - su, 2.2)) : 0, fly = spinning ? Math.pow(Math.sin(Math.PI * su), .7) : 0;
  if (su > 0 && su < .55) hop = Math.max(hop, .09 * Math.sin(su / .55 * Math.PI));
  return { sway: -.07 * st * arms * (1 - fly), step: st * (1 - fly), arms, wave: st, sw: .9 * Math.sin(Math.PI * (ph - .4)), hop, spin, fly,
    grin: .6 + .4 * arms, turn: .12 * st, tilt: .06 * Math.sin(Math.PI * ph * .5), tt: t };
}

// ---------- the small woman in white (Masina stand-in), modelled: short platinum curls (Bob 2026-10-12), big eyes, a belted white coat ----------
// Origin at her feet, k = px per metre, facing the viewer's left. o: up (face lifted to the sky), hand (near hand up
// to shade her eyes), gust (wind), tt
function drawGiulietta(g, x, y, k, o = {}) {
  const up = o.up || 0, hand = o.hand || 0, gust = o.gust || 0, tt = o.tt || 0;
  castShadow(g, x, y, .75 * k, .05 * k, .3);
  g.save(); g.translate(x, y); g.scale(k, k);
  // legs: slim dark stockings, small heeled shoes, the far leg a touch behind
  for (const [lx, v] of [[.05, .2], [-.05, .3]]) {
    limb(g, [lx, -.44], [lx - .01, -.07], .042, .026, v, .7);
    g.fillStyle = linG(g, lx - .07, -.06, lx + .04, 0, [[0, .2], [1, .03]]); g.beginPath(); g.moveTo(lx - .075, -.005); g.quadraticCurveTo(lx - .07, -.06, lx - .02, -.07); g.lineTo(lx + .03, -.06); g.lineTo(lx + .03, 0); g.closePath(); g.fill();
  }
  // the coat's skirt, flaring, its hem lifting in the wind
  const hw = .025 * Math.sin(tt * 4.5) + gust * .09;
  const skirt = () => { g.beginPath(); g.moveTo(-.13, -1.0); g.lineTo(.13, -1.0); g.quadraticCurveTo(.22, -.75, .27 + hw, -.42 - gust * .05);
    g.quadraticCurveTo(.02, -.37 + .015 * Math.sin(tt * 6), -.25 + hw * .4, -.43); g.quadraticCurveTo(-.2, -.75, -.13, -1.0); g.closePath(); };
  skirt(); modelFill(g, -.06, -.8, .55, 1, .9, .64);
  skirt(); shadeAway(g, 0, -.72, .35, .28); g.strokeStyle = gv(.45, .45); g.lineWidth = .007; g.stroke();
  g.save(); skirt(); g.clip();
  softFill(g, .02 * k, () => { g.lineCap = 'round';
    for (const [x0, x1, a] of [[.02, .12, .35], [-.08, -.16, .28], [.09, .2, .3]]) { g.strokeStyle = gv(.45, a); g.lineWidth = .025; g.beginPath(); g.moveTo(x0, -.96); g.quadraticCurveTo(lerp(x0, x1, .5) + .02, -.7, x1 + hw * (x1 > 0 ? 1 : .4), -.42); g.stroke();
      g.strokeStyle = gv(1, .6); g.lineWidth = .018; g.beginPath(); g.moveTo(x0 - .03, -.96); g.quadraticCurveTo(lerp(x0, x1, .5) - .02, -.7, x1 - .03 + hw * .5, -.42); g.stroke(); } });
  g.restore();
  // bodice and shoulders, belt, three dark buttons
  const bod = () => { g.beginPath(); g.moveTo(-.04, -1.36); g.quadraticCurveTo(-.17, -1.34, -.18, -1.25); g.lineTo(-.13, -.98); g.lineTo(.13, -.98); g.lineTo(.17, -1.25); g.quadraticCurveTo(.16, -1.34, .04, -1.36); g.closePath(); };
  bod(); modelFill(g, -.06, -1.22, .3, 1, .9, .66);
  bod(); shadeAway(g, 0, -1.18, .2, .25); g.strokeStyle = gv(.45, .45); g.lineWidth = .007; g.stroke();
  g.fillStyle = linG(g, -.14, 0, .14, 0, [[0, .9], [1, .62]]); g.fillRect(-.14, -1.03, .28, .045);
  g.fillStyle = linG(g, -.02, 0, .02, 0, [[0, .45], [1, .2]]); g.fillRect(-.022, -1.037, .044, .055);
  for (const by of [-1.25, -1.16, -.9]) { g.fillStyle = gv(.1); ell(g, 0, by, .012, .012); g.fill(); g.fillStyle = gv(.6, .7); ell(g, -.004, by - .004, .004, .004); g.fill(); }
  // round white collar
  g.beginPath(); g.moveTo(-.1, -1.37); g.quadraticCurveTo(-.09, -1.3, 0, -1.29); g.quadraticCurveTo(.09, -1.3, .1, -1.37); g.quadraticCurveTo(0, -1.4, -.1, -1.37);
  modelFill(g, -.03, -1.35, .1, 1, .95, .7);
  g.strokeStyle = gv(.5, .5); g.lineWidth = .006; g.stroke();
  // far arm down along the coat
  limb(g, [.14, -1.29], [.18, -.84], .04, .034, .8, .8, .4);
  mitten(g, .18, -.79, .032, .8);
  // head, tipped back to look up into the sky
  drawHead(g, -.01 - up * .03, -1.47, .105, { turn: -.55, tilt: .1 + up * .5, lift: up * 1.2, skin: .86, hair: .84, style: 'woman', eyes: 1, look: [-.35, -.75 * up - .1], L: SUN, la: .75, brows: .7, mouth: 0 });
  // near arm: down by her side, rising to shade her eyes
  const sx = -.14, sy = -1.29, ex = lerp(-.19, -.3, hand), ey = lerp(-1.05, -1.38, hand), hx = lerp(-.17, -.19, hand), hy = lerp(-.82, -1.52 - up * .02, hand);
  limb(g, [sx, sy], [ex, ey], .042, .036, .9, .9, .5);
  limb(g, [ex, ey], [hx, hy], .036, .03, .9, .9, .5);
  g.save(); g.translate(hx, hy); g.rotate(lerp(0, -1.3, hand)); mitten(g, 0, 0, .034, .86); g.restore();
  g.restore();
}

// ---------- the shots ----------
const BEACH = { dune: 77.1, boat: 80.89, her: 84.58, boys: 86.87, shore: 88.39, giu: 89.84 };
const BEACH_SHOTS = [
  { t: BEACH.dune, f: shotDune }, { t: BEACH.boat, f: shotBoat }, { t: BEACH.her, f: shotHer },
  { t: BEACH.boys, f: shotBoys }, { t: BEACH.shore, f: shotShore }, { t: BEACH.giu, f: shotGiu },
];
function drawDream(g, t) { const [sh, lt] = shotAt(BEACH_SHOTS, t); sh.f(g, t, lt); }

// The five boys: hair tone, skin, smock tone (all dark smocks, a little variety).
const LADS = [
  { hair: .08, skin: .84, tone: .12 }, { hair: .22, skin: .8, tone: .16 }, { hair: .05, skin: .86, tone: .1 },
  { hair: .14, skin: .82, tone: .14 }, { hair: .3, skin: .85, tone: .12 },
];
// Over the crest, on the pulse and the picked notes after it.
const CREST = [77.87, 78.21, 78.58, 78.97, 79.37];

// 77.1-80.89: a dune against the white sky, marram grass on the crest. The boys come over it one after another
// and run down toward us; the camera pans right after them and the beach opens out.
const duneY = (x) => 300 + .00042 * (x - 640) ** 2 + 7 * n1(51, x * .01);
function shotDune(g, t) {
  const pan = 640 * ease(t, 78.8, 81.0), zoom = 1 + .04 * ease(t, 77.1, 80.89);
  g.save(); g.translate(FW / 2, FH * .6); g.scale(zoom, zoom); g.translate(-FW / 2, -FH * .6);
  // far: the sky, the sea and the beach beyond the dune (slow parallax)
  g.save(); g.translate(-pan * .45, 0);
  beachBg(g, t, { hy: 470, sy: 512, seed: 19, px: pan * .45, clouds: [[0, 420, 150, 760, .55], [2, 1500, 120, 900, .5], [3, 2300, 210, 700, .45]] });
  drawTower(g, 2320, 492, 270, .62);
  g.restore();
  g.translate(-pan, 0);
  // the boys still behind the crest rise into view (the dune hides their legs); the rest run down in front of it
  const boys = CREST.map((c, i) => {
    const lt = t - c, x0 = 470 + i * 72, y0 = duneY(x0), x1 = 1520 + i * 120, y1 = 930 + (i % 2) * 46;
    const u = Math.pow(clamp(lt / 2.35), 1.12), k = lerp(92, 215, u);
    const rise = clamp(-lt / .4);                                             // 1 hidden .. 0 on the crest
    return { i, lt, x: lerp(x0, x1, u), y: lerp(y0, y1, u) + rise * 1.4 * 92 + (lt < 0 ? 0 : 0), k, behind: lt < 0, show: lt > -.4, u, x0, y0 };
  });
  const drawLad = (b) => {
    const L = LADS[b.i], ph = b.lt * TAU * 2.3 + b.i;
    castShadow(g, b.x, b.y, .5 * b.k, .045 * b.k, b.behind ? 0 : .28);
    drawBoy(g, b.x, b.y, b.k, { face: 1, run: b.behind ? ph * .5 : ph, lean: .22, hair: L.hair, skin: L.skin, tone: L.tone, turn: .55, mouth: .35 + .25 * Math.sin(b.lt * 7 + b.i), eyes: 1, look: [.6, .1], brows: .4 });
  };
  for (const b of boys) if (b.show && b.behind) drawLad(b);
  // the dune: lit on the slope facing the sun, the right flank turning into shade, wind ripples, footprints
  g.beginPath(); g.moveTo(-400, duneY(-400)); for (let x = -400; x <= 2700; x += 25) g.lineTo(x, duneY(x)); g.lineTo(2700, FH + 300); g.lineTo(-400, FH + 300); g.closePath();
  g.fillStyle = linG(g, 0, 280, 0, FH, [[0, .87], [.5, .8], [1, .68]]); g.fill();
  g.save(); g.clip();
  g.fillStyle = linG(g, 700, 0, 1900, 0, [[0, 0, 0], [.6, 0, .14], [1, 0, .22]]); g.fillRect(-400, 0, 3200, FH + 300);
  g.fillStyle = radG(g, 300, 380, 20, 700, [[0, 1, .22], [1, 1, 0]]); g.fillRect(-400, 0, 3200, FH + 300);
  g.strokeStyle = gv(.62, .25); g.lineWidth = 1.6; g.beginPath();
  for (let i = 0; i < 22; i++) { const y = 330 + i * 34 + i * i * .9; for (let x = -400; x <= 2700; x += 50) { const yy = Math.max(duneY(x) + 14, y) + 5 * Math.sin(x * .013 + i * 1.3); x === -400 ? g.moveTo(x, yy) : g.lineTo(x, yy); } }
  g.stroke();
  // footprints down the slope behind each boy that has crossed
  g.fillStyle = gv(.55, .55);
  for (const b of boys) if (!b.behind) for (let u = .02; u < b.u - .03; u += .035) {
    const fx = lerp(b.x0, 1520 + b.i * 120, Math.pow(u, 1 / 1.12) ** 1.12) + (u * 100 % 2 < 1 ? -5 : 5), fy = lerp(b.y0, 930 + (b.i % 2) * 46, u), kk = lerp(92, 215, u);
    ell(g, fx, fy, .045 * kk, .016 * kk); g.fill();
  }
  g.restore();
  // marram grass along the crest, dark against the sky, combed by the wind
  g.lineCap = 'round';
  for (let x = -380; x < 1500; x += 38) {
    const base = duneY(x) + 4, R = mulberry(Math.floor(x + 1000)), n = 5 + Math.floor(R() * 4), wind = .25 + .12 * n1(60, t * .9 + x * .002);
    for (let j = 0; j < n; j++) {
      const bx = x + (R() - .5) * 22, h = 30 + R() * 50, lean = wind + (R() - .5) * .4;
      g.strokeStyle = gv(.32 + R() * .15, .9); g.lineWidth = 1.4 + R() * 1.4; g.beginPath(); g.moveTo(bx, base);
      g.quadraticCurveTo(bx + lean * h * .3, base - h * .6, bx + lean * h * .8, base - h); g.stroke();
    }
  }
  for (const b of boys) if (b.show && !b.behind) drawLad(b);
  g.restore();
  const wh = 1 - ease(t, 77.1, 77.75);
  if (wh > 0) { g.fillStyle = gv(1, wh); g.fillRect(0, 0, FW, FH); }
}

// Boys behind the boat (shared by the boat and boys shots): arriving, crouching, peeking, ducking, laughing, clapping.
// Returns per-boy { dx (arrival offset), drop (m below standing), run phase or null, mouth, eyes, tilt, brows, clap }
function ladState(i, t) {
  const a = BEACH.boat - .32 + i * .2, d = .7 + i * .1, u = clamp((t - a) / d);
  const arrive = 1 - Math.pow(1 - u, 2.2), crouch = ease(t, a + d - .05, a + d + .22);
  let drop = .26 * crouch + .02 * Math.sin(t * 2.1 + i * 1.9) * crouch;
  // the accent: she spins, they duck; then up again, laughing
  const duck = ease(t, ACCENT, ACCENT + .12) * (1 - ease(t, 84.12 + i * .04, 84.42 + i * .04));
  drop += .32 * duck;
  const after = ease(t, 84.2, 84.4);
  let mouth = .1 + (t > 82.5 ? .35 * Math.max(0, Math.sin((t - 82.5) * 5.3 + i * 2.1)) : 0), eyes = 1, brows = ease(t, 82.36, 82.55) * .9, tilt = 0;
  if (after > 0) { mouth = lerp(mouth, .55 + .35 * Math.abs(Math.sin(t * 9 + i)), after); eyes = lerp(1, .42, after); tilt = -.18 * after * Math.abs(Math.sin(t * 4.5 + i)); }
  // claps on the eighth-note grid from the 86.87 pulse
  let clap = 0, clapping = ease(t, 86.6, 86.87);
  if (t >= 86.6) { const b = Math.round((t - 86.87) / EIGHTH) * EIGHTH + 86.87, dd = t - b; clap = Math.exp(-Math.pow(dd / .06, 2)); }
  return { arrive, crouch, drop, run: u < 1 ? (t - a) * TAU * 2.4 + i : null, mouth, eyes, brows, tilt, clap, clapping };
}

// 80.89-84.58: wide, from behind the boys' end of the boat. They run in and drop behind it, heads over the keel.
// She stands by the bunker hut; 82.34 she starts to dance; 83.79 she spins, the shawl flies, the boys duck.
function shotBoat(g, t, lt) {
  const s = 1 + .025 * ease(t, BEACH.boat, BEACH.her);
  g.save(); g.translate(1000, 650); g.scale(s, s); g.translate(-1000, -650);
  beachBg(g, t, { hy: 450, sy: 528, seed: 31, clouds: [[1, 300, 140, 760, .5], [3, 1300, 90, 900, .45]] });
  drawTower(g, 1790, 482, 330, .6);
  drawHut(g, 1420, 612, 96, .12);
  drawBigWoman(g, 1255, 650, 122, danceAt(t));
  // boys behind the boat
  const BX = 600, BY = 884, BK = 178, groundY = 840, k = 166, hands = [];
  for (let i = 4; i >= 0; i--) {
    const st = ladState(i, t), L = LADS[i], slot = 250 + i * 172, x = lerp(-160, slot, st.arrive);
    const yy = groundY + st.drop * k, top = boatTopY(BX, BY, BK, x + .2 * k);
    const tgt = st.crouch > .5 ? [[.24, (groundY + st.drop * k - top) / k + .01], [.18, (groundY + st.drop * k - top) / k + .02]] : null;
    const r = drawBoy(g, x, yy, k, { face: 1, run: st.run, lean: st.run != null ? .18 : .1, hideLegs: st.crouch > .05, hands: tgt, hair: L.hair, skin: L.skin, tone: L.tone,
      turn: .5, look: [.85, .05], mouth: st.mouth, eyes: st.eyes, brows: st.brows, tilt: st.tilt });
    if (tgt) hands.push([r.hands[0], k, L.skin]);
  }
  drawBoat(g, BX, BY, BK, 0);
  for (const [h, kk, sk] of hands) mitten(g, h[0], h[1] - .01 * kk, .042 * kk, sk);
  g.restore();
}

// 84.58-86.87: medium-wide on her (full figure): the shuffle on the eighths, a hop on 85.33.
function shotHer(g, t, lt) {
  const s = 1 + .02 * ease(t, BEACH.her, BEACH.boys);
  g.save(); g.translate(860, 700); g.scale(s, s); g.translate(-860, -700);
  beachBg(g, t, { hy: 430, sy: 512, seed: 47, clouds: [[0, 500, 120, 800, .45], [2, 1600, 160, 700, .4]] });
  drawTower(g, 1830, 466, 370, .6);
  drawHut(g, 1180, 700, 128, .06);
  drawBigWoman(g, 800, 975, 318, danceAt(t));
  g.restore();
}

// 86.87-88.39: medium-wide on the boys behind the boat, clapping on the eighths and laughing; she dances small beyond.
function shotBoys(g, t, lt) {
  const s = 1 + .02 * ease(t, BEACH.boys, BEACH.shore);
  g.save(); g.translate(900, 700); g.scale(s, s); g.translate(-900, -700);
  beachBg(g, t, { hy: 392, sy: 460, seed: 59, clouds: [[1, 700, 90, 760, .45], [3, 1700, 60, 800, .4]] });
  drawTower(g, 1880, 420, 250, .64);
  drawHut(g, 1610, 520, 66, .2);
  drawBigWoman(g, 1490, 548, 86, danceAt(t));
  const BX = 520, BY = 1140, BK = 330, k = 300, groundY = 1004;
  for (let i = 3; i >= 0; i--) {
    const st = ladState(i, t), L = LADS[i], x = 130 + i * 290 + 8 * Math.sin(t * 2 + i);
    const gap = .1 * (1 - st.clap), cv = .9 + .03 * Math.sin(i * 1.7);
    const rock = i === 1 ? -.08 * Math.abs(Math.sin(t * 4.3)) : 0;
    drawBoy(g, x, groundY + .04 * k * Math.abs(Math.sin(t * 4.5 + i)), k, { face: 1, run: null, lean: .06 + rock, hideLegs: true, hands: [[.17 + gap / 2, cv], [.17 - gap / 2, cv + .01]],
      hair: L.hair, skin: L.skin, tone: L.tone, turn: .5, look: [.85, .05], mouth: st.mouth, eyes: st.eyes, brows: .6, tilt: st.tilt + rock });
  }
  drawBoat(g, BX, BY, BK, 0);
  g.restore();
}

// 88.39-89.84: the camera drifts on along the shore, low by the water: the dance and the boat slide away left,
// a fresh wave runs up the sand on the pulse, the scaffold comes round.
function shotShore(g, t, lt) {
  const pan = 560 * Math.pow(clamp(lt / (BEACH.giu - BEACH.shore + .3)), .9);
  const wd = t - BEACH.shore, wash = wd > 0 ? Math.sin(clamp(wd / 1.2) * Math.PI) * Math.exp(-wd * .4) : 0;
  g.save();
  g.save(); g.translate(-pan * .3, 0); beachBg(g, t, { hy: 470, sy: 545, seed: 71, px: pan * .3, wash, clouds: [[0, 600, 130, 800, .45], [2, 1700, 100, 900, .4], [1, 2400, 160, 700, .4]] });
  drawTower(g, 1700, 497, 330, .58); g.restore();
  g.translate(-pan * .7, 0);
  drawHut(g, 980, 640, 74, .12);
  drawBigWoman(g, 830, 668, 88, danceAt(t));
  for (let i = 4; i >= 0; i--) { const st = ladState(i, t), L = LADS[i];
    drawBoy(g, 250 + i * 72, 700 + .2 * 64, 64, { face: 1, run: null, hideLegs: true, hands: [[.24, .98], [.2, 1.0]], hair: L.hair, skin: L.skin, tone: L.tone, turn: .5, mouth: st.mouth, eyes: st.eyes, tilt: st.tilt }); }
  drawBoat(g, 400, 716, 72, .05);
  g.restore();
  // a soft cross-dissolve isn't wanted here: the cut to her lands on "Giu"
}

// 89.84-92.5: "Giulietta". The small woman in white on the same beach looks up: high and far, a tiny figure drifts
// on a line like a kite (verse 1's kite dream). "li" her face lifts, "et" she shades her eyes, "ta" a gust. Then dark.
function shotGiu(g, t) {
  const s = 1 + .035 * (t - SH.giu);
  g.save(); g.translate(1300, 700); g.scale(s, s); g.translate(-1300, -700);
  const hy = 610;
  beachBg(g, t, { hy, sy: 700, seed: 23, clouds: [[3, 1500, 180, 900, .45], [0, 250, 330, 700, .35]] });
  drawTower(g, 1700, 640, 300, .62);
  // the kite-like figure: a tiny man, arms out, drifting high on his line
  const fu = t - SH.giu, kx = 520 + fu * 16 + 6 * Math.sin(fu * 1.3), ky = 205 + 7 * Math.sin(fu * 1.1 + .5), rot = .25 + .12 * Math.sin(fu * 1.6);
  g.save(); g.translate(kx, ky); g.rotate(rot); drawDreamer(g, 0, 0, 15, { arms: 1.55 + .1 * Math.sin(fu * 2), legs: .35, flutter: .8, time: t, hat: 0 }); g.restore();
  const ank = [kx + Math.cos(rot + Math.PI / 2) * 13 - Math.sin(rot) * 2, ky + Math.sin(rot + Math.PI / 2) * 13];
  g.strokeStyle = gv(.3, .7); g.lineWidth = 1.3; g.beginPath(); g.moveTo(ank[0], ank[1]);
  g.bezierCurveTo(ank[0] - 30, ank[1] + 160, ank[0] - 170, ank[1] + 330, -80, 760 + 10 * Math.sin(fu)); g.stroke();
  // her
  const up = .45 * ease(t, SH.giu, SH.giu + .5) + .55 * ease(t, GIU.li, GIU.li + .35);
  const hand = ease(t, GIU.et, GIU.et + .38), gust = Math.exp(-Math.max(0, t - GIU.ta) / .45) * (t >= GIU.ta ? 1 : 0);
  drawGiulietta(g, 1310, 955, 420, { up, hand, gust, tt: t });
  g.restore();
}
