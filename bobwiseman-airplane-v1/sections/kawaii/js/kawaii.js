// Kawaii kit: wobbly felt-marker shapes over flat pastel washes, kaomoji faces, and the cast
// (the plane head-on / side-on / top-down, boxy cars, props). Fills go to the paint canvas `s`,
// outlines go to the ink canvas `k`; both share every transform.
const INK = '#1e1a1d';
const PAL = {
  sky1: '#f6c3c6', sky2: '#fbe2ae', sky3: '#cfe3f3', mint: '#bfe6cf', lilac: '#d6c6ec', lemon: '#fbe08a',
  road: '#cbc2d8', dash: '#fffaf0', cream: '#fff1d2', wing: '#bfe8d8', teal: '#86cfc4', pink: '#f6a3b7',
  coral: '#f2877f', blue: '#bfe0f4', tyre: '#5b5268', hub: '#ece6f2', gold: '#f2c55a', carpet: '#dd5a64',
  velvet: '#a92c45', grass: '#c3e5b2', peach: '#f9c9a0', white: '#fffaf2', blush: '#f58ea2', berry: '#e9739a',
};

// ---- transforms on both layers ----
const both = (f) => { f(s); f(k); };
const push = () => { s.save(); k.save(); }, pop = () => { s.restore(); k.restore(); };
const tr = (x, y) => both((c) => c.translate(x, y));
const sc = (a, b = a) => both((c) => c.scale(a, b));
const rot = (a) => both((c) => c.rotate(a));
const alpha = (a) => both((c) => { c.globalAlpha = a; });
function curK() { const m = s.getTransform(); return Math.hypot(m.a, m.b) / RS; }
let TB = 0; // the boil frame (twos), set per frame by the shot
const seedAt = (n) => { SEEDC = n; };

// ---- geometry: point lists in local units ----
function resample(pts, closed, step) {
  const out = [], n = pts.length, segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(1, Math.ceil(L / step));
    for (let j = 0; j < m; j++) out.push([lerp(a[0], b[0], j / m), lerp(a[1], b[1], j / m)]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
function rrect(x, y, w, h, r, sd = 0) { // a box with slightly unequal, imperfect corners
  const pts = [], rs = [0, 1, 2, 3].map((i) => Math.min(w / 2, h / 2, r * (.75 + .5 * hash(i * 31 + sd * 7 + 3))));
  const C = [[x + w - rs[0], y + rs[0], -Math.PI / 2], [x + w - rs[1], y + h - rs[1], 0], [x + rs[2], y + h - rs[2], Math.PI / 2], [x + rs[3], y + rs[3], Math.PI]];
  C.forEach(([cx, cy, a0], i) => { const R = rs[i]; for (let j = 0; j <= 6; j++) { const a = a0 + j / 6 * Math.PI / 2; pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); } });
  return pts;
}
function ell(cx, cy, rx, ry, n = 28) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
function heartPts(cx, cy, sz) {
  const p = [];
  for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); p.push([cx + x * sz / 17, cy - y * sz / 17]); }
  return p;
}
function quadPts(a, c, b, n = 10) { const p = []; for (let i = 0; i <= n; i++) { const u = i / n, v = 1 - u; p.push([v * v * a[0] + 2 * u * v * c[0] + u * u * b[0], v * v * a[1] + 2 * u * v * c[1] + u * u * b[1]]); } return p; }
function xform(pts, x, y, a = 0, sx = 1, sy = sx) { const c = Math.cos(a), sn = Math.sin(a); return pts.map(([px, py]) => [x + (px * c - py * sn) * sx, y + (px * sn + py * c) * sy]); }

// ---- marker + wash ----
function wob(pts, closed, sd, ampS, ampB, ks) {
  const step = 14 / ks, R = resample(pts, closed, step); let u = 0;
  return R.map((p, i) => {
    if (i) u += Math.hypot(p[0] - R[i - 1][0], p[1] - R[i - 1][1]) * ks;
    const fb = sd * 13 + TB * 7;
    return [p[0] + (snoise(u * .011, sd) * ampS + snoise(u * .04, fb) * ampB) / ks, p[1] + (snoise(u * .011, sd + 50) * ampS + snoise(u * .04, fb + 50) * ampB) / ks];
  });
}
function ink(pts, closed = true, w = 6, o = {}) {
  const sd = o.seed ?? ++SEEDC, ks = curK(), lw = w * Math.pow(ks, .35) / ks;
  let P = wob(pts, closed, sd, o.wob ?? 2.2, 1.1, ks);
  if (closed) { const m = Math.max(2, Math.ceil(P.length * .05)); const d = (1.6 + 2 * hash(sd)) / ks; for (let j = 0; j < m; j++) P.push([P[j][0] + d * (j + 1) / m, P[j][1] - d * .5 * (j + 1) / m]); }
  k.lineCap = 'round'; k.lineJoin = 'round'; k.strokeStyle = o.col || INK;
  k.lineWidth = lw; k.beginPath(); P.forEach(([x, y], i) => i ? k.lineTo(x, y) : k.moveTo(x, y)); k.stroke();
  k.globalAlpha *= .55; k.lineWidth = lw * .55; k.beginPath(); P.forEach(([x, y], i) => i ? k.lineTo(x + .9 / ks, y + .7 / ks) : k.moveTo(x + .9 / ks, y + .7 / ks)); k.stroke(); k.globalAlpha /= .55;
}
function inkFill(pts, col = INK, o = {}) { const sd = o.seed ?? ++SEEDC, ks = curK(); const P = wob(pts, true, sd, 1.2, .6, ks); k.fillStyle = col; k.beginPath(); P.forEach(([x, y], i) => i ? k.lineTo(x, y) : k.moveTo(x, y)); k.closePath(); k.fill(); }
function wash(pts, col, o = {}) {
  const sd = (o.seed ?? SEEDC) + 900, ks = curK(); const P = wob(pts, true, sd, 2, 0, ks); const off = 1.6 / ks;
  s.fillStyle = col; s.beginPath(); P.forEach(([x, y], i) => i ? s.lineTo(x + off, y + off * .6) : s.moveTo(x + off, y + off * .6)); s.closePath(); s.fill();
  if (o.erase && s.globalAlpha > .9) { // an opaque wash hides the marker lines drawn under it
    k.save(); k.globalCompositeOperation = 'destination-out'; k.globalAlpha = 1; k.fillStyle = '#000'; k.beginPath(); P.forEach(([x, y], i) => i ? k.lineTo(x, y) : k.moveTo(x, y)); k.closePath(); k.fill(); k.restore();
  }
}
function shape(pts, col, w = 6, o = {}) { const sd = ++SEEDC; if (col) wash(pts, col, { seed: sd, erase: o.erase ?? true }); if (w) ink(pts, true, w, { ...o, seed: sd }); }
function paint(pts, col, a = 1, erase = a >= 1) { const ga = s.globalAlpha; s.globalAlpha = ga * a; wash(pts, col, { seed: ++SEEDC, erase }); s.globalAlpha = ga; }
function heart(cx, cy, sz, col = PAL.pink, w = 5) { shape(heartPts(cx, cy, sz), col, w); const ga = s.globalAlpha; s.globalAlpha = ga * .8; wash(ell(cx - sz * .38, cy - sz * .42, sz * .14, sz * .09), '#fff8f4'); s.globalAlpha = ga; }

// ---- kaomoji face: centred at (x, y), u = half the eye spacing ----
// eyes: happy ^ ^ | dot | wide | worried | spiral | flat (sly squint, glancing) | heart | squeeze > < | shades | smug
function face(x, y, u, o = {}) {
  const { eyes = 'happy', mouth = 'smile', open = 0, look = 0, lookY = 0, t = 0, blush = 1, w = 6, brow = 0, es = 1, mouthDy = .55, blushDy = .45, blushX = 1.35, hatch = true, mshape = 'ah', mw0 = 1 } = o;
  const er = u * .32 * es;
  for (const sgn of [-1, 1]) {
    const ex = x + sgn * u, ey = y;
    if (eyes === 'happy') ink(quadPts([ex - er, ey + er * .5], [ex, ey - er * 1.4], [ex + er, ey + er * .5]), false, w * 1.1);
    else if (eyes === 'squeeze') ink([[ex - sgn * er, ey - er * .8], [ex + sgn * er * .7, ey], [ex - sgn * er, ey + er * .8]], false, w * 1.1);
    else if (eyes === 'dot') { inkFill(ell(ex + look * er * .5, ey + lookY * er * .45, er * .42, er * .62, 16)); inkFill(ell(ex + look * er * .5 - er * .13, ey + lookY * er * .45 - er * .25, er * .13, er * .15, 10), '#fffaf2'); }
    else if (eyes === 'wide') { shape(ell(ex, ey, er * .8, er, 20), PAL.white, w * .8); inkFill(ell(ex + look * er * .35, ey + er * .1 + lookY * er * .4, er * .38, er * .5, 14)); }
    else if (eyes === 'worried') {
      inkFill(ell(ex, ey + er * .15, er * .4, er * .55, 14));
      ink([[ex - sgn * er * .9, ey - er * 1.75], [ex + sgn * er * 1.0, ey - er * 1.15]], false, w * .9);
    } else if (eyes === 'spiral') {
      const P = [], sp = t * 9 * sgn;
      for (let a = 0; a < TAU * 2.4; a += .25) { const r = a / (TAU * 2.4) * er * 1.05; P.push([ex + Math.cos(a + sp) * r, ey + Math.sin(a + sp) * r]); }
      ink(P, false, w * .85);
    } else if (eyes === 'flat') { // a heavy lid line and a half-disc glancing sideways under it
      const lx = look * er * .5;
      ink([[ex - er * 1.05, ey - er * .1], [ex + er * 1.05, ey - er * .1]], false, w * 1.15);
      const P = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI; P.push([ex + lx + Math.cos(a) * er * .5, ey - er * .1 + Math.sin(a) * er * .55]); }
      inkFill(P);
      ink([[ex - sgn * er * 1.2, ey - er * 1.2 + brow * er * .5], [ex + sgn * er * .9, ey - er * .75 + brow * er * .5]], false, w * .9); // lowered, cross brows
    } else if (eyes === 'heart') { heart(ex, ey, er * 1.3, PAL.berry, w * .8); }
    else if (eyes === 'shades') { shape(rrect(ex - er * 1.2, ey - er * .7, er * 2.4, er * 1.3, er * .5), INK, w * .7); paint(rrect(ex - er * .8, ey - er * .5, er * .6, er * .25, 2), '#ffffff', .9); }
    else if (eyes === 'smug') ink(quadPts([ex - er, ey - er * .2], [ex, ey + er * .5], [ex + er, ey - er * .2]), false, w * 1.1);
  }
  if (eyes === 'shades') ink([[x - u + er * 1.2, y - er * .3], [x + u - er * 1.2, y - er * .3]], false, w * .7);
  if (blush > 0) {
    const ga = s.globalAlpha; s.globalAlpha = ga * .75 * blush;
    for (const sgn of [-1, 1]) { const bx = x + sgn * u * blushX, by = y + u * blushDy; wash(ell(bx, by, u * .32, u * .17), PAL.blush); }
    s.globalAlpha = ga;
    if (hatch) for (const sgn of [-1, 1]) for (let i = -1; i <= 1; i++) { const bx = x + sgn * u * blushX + i * u * .13, by = y + u * blushDy; ink([[bx + u * .04, by - u * .07], [bx - u * .04, by + u * .07]], false, w * .45); }
  }
  const my = y + u * mouthDy, mw = u * .42 * mw0;
  if (open > .1 && mshape === 'o') { // a round "oo": small, tall
    const P = ell(x, my + mw * .3, mw * (.32 + .12 * open), mw * (.3 + .55 * open), 18), sd = ++SEEDC; wash(P, '#7b2b3a', { seed: sd }); ink(P, true, w * .9, { seed: sd });
  } else if (open > .1 && mshape === 'ee') { // a wide, flat "ee"
    const hh = mw * (.18 + .4 * open), P = [...quadPts([x - mw * 1.1, my], [x, my - hh * .5], [x + mw * 1.1, my], 8), ...quadPts([x + mw * 1.1, my], [x, my + hh * 1.6], [x - mw * 1.1, my], 8).slice(1)];
    const sd = ++SEEDC; wash(P, '#7b2b3a', { seed: sd }); ink(P, true, w * .9, { seed: sd });
  } else if (open > .1) {
    const h = mw * (.4 + 1.3 * open);
    const P = [...quadPts([x - mw, my - mw * .1], [x, my - mw * .35], [x + mw, my - mw * .1], 6), ...quadPts([x + mw, my - mw * .1], [x, my + h * 1.6], [x - mw, my - mw * .1], 10).slice(1)];
    const sd = ++SEEDC; wash(P, '#7b2b3a', { seed: sd });
    push(); s.beginPath(); P.forEach(([px, py], i) => i ? s.lineTo(px, py) : s.moveTo(px, py)); s.clip(); s.fillStyle = '#f08a9a'; s.beginPath(); s.ellipse(x, my + h * .95, mw * .6, h * .45, 0, 0, TAU); s.fill(); pop();
    ink(P, true, w * .9, { seed: sd });
  } else if (mouth === 'smile') ink(quadPts([x - mw * .8, my - mw * .1], [x, my + mw * .55], [x + mw * .8, my - mw * .1]), false, w);
  else if (mouth === 'cat') { ink(quadPts([x - mw, my], [x - mw * .5, my + mw * .6], [x, my]), false, w); ink(quadPts([x, my], [x + mw * .5, my + mw * .6], [x + mw, my]), false, w); }
  else if (mouth === 'smirk') ink(quadPts([x - mw * .9, my + mw * .05], [x + mw * .1, my + mw * .45], [x + mw * 1.1, my - mw * .35]), false, w);
  else if (mouth === 'flat') ink([[x - mw * .7, my + mw * .1], [x + mw * .7, my + mw * .05]], false, w);
  else if (mouth === 'wavy') { const P = []; for (let i = 0; i <= 12; i++) P.push([x - mw + i / 12 * mw * 2, my + Math.sin(i / 12 * TAU * 1.5) * mw * .18]); ink(P, false, w * .9); }
  else if (mouth === 'o') shape(ell(x, my + mw * .15, mw * .35, mw * .45, 16), '#7b2b3a', w * .8);
}

// ---- confetti and floaters (paint only) ----
const CONF = [PAL.coral, PAL.lemon, '#8ec9e8', '#b49be0', PAL.teal, PAL.pink];
function confetti(x0, y0, t0, t, n, seed, spread = 600, life = 2.6) {
  const dt = t - t0; if (dt < 0 || dt > life) return;
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const an = -Math.PI / 2 + (r() - .5) * 2.4, sp = spread * (.4 + r() * .8), vx = Math.cos(an) * sp, vy = Math.sin(an) * sp;
    const drag = 1 - Math.exp(-dt * 2.2), x = x0 + vx * drag / 2.2 + Math.sin(dt * 5 + i) * 14, y = y0 + vy * drag / 2.2 + dt * dt * 160;
    const c = CONF[i % CONF.length], a = r() * TAU + dt * (4 + r() * 6), ww = 14 + r() * 10, hh = 6 + r() * 4;
    s.save(); s.translate(x, y); s.rotate(a); s.scale(1, .4 + .6 * Math.abs(Math.cos(dt * 7 + i))); s.globalAlpha = clamp((life - dt) * 2); s.fillStyle = c; s.fillRect(-ww / 2, -hh / 2, ww, hh); s.restore();
  }
}
function fallingConfetti(t, x0, x1, y0, y1, n, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const fx = x0 + r() * (x1 - x0), sp = 60 + r() * 70, ph = r(), yy = y0 + ((ph * (y1 - y0) + t * sp) % (y1 - y0));
    const x = fx + Math.sin(t * 2 + i) * 22, a = t * (2 + r() * 3) + i, c = CONF[i % CONF.length];
    s.save(); s.translate(x, yy); s.rotate(a); s.scale(1, .3 + .7 * Math.abs(Math.cos(t * 3 + i))); s.fillStyle = c; s.fillRect(-10, -4, 20, 8); s.restore();
  }
}

// ---- scenery pieces ----
function lollipopTree(x, y, h, col, sd, bend = 0) {
  seedAt(sd);
  push(); tr(x, y); rot(bend);
  shape(rrect(-h * .05, -h * .62, h * .1, h * .62, h * .03, sd), '#d9a77c', 5);
  shape(ell(0, -h * .78, h * .3, h * .27, 26), col, 6);
  paint(ell(-h * .1, -h * .86, h * .08, h * .05), '#ffffff', .55);
  pop();
}
function cloud(x, y, sc0, sd, faceOn = false, t = 0, col = PAL.white) {
  seedAt(sd); push(); tr(x, y); sc(sc0);
  const P = [];
  const bumps = [[-90, 0, 60], [-30, -40, 70], [50, -30, 64], [100, 5, 50], [0, 20, 60]];
  for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; let best = 0; for (const [bx, by, br] of bumps) { const dx = Math.cos(a), dy = Math.sin(a); const b = bx * dx + by * dy, c = bx * bx + by * by - br * br, d = b * b - c; if (d > 0) best = Math.max(best, b + Math.sqrt(d)); } P.push([Math.cos(a) * best, Math.sin(a) * best * .8]); }
  shape(P, col, 5);
  if (faceOn) face(0, -5, 28, { eyes: 'happy', mouth: 'smile', w: 4, blush: .8 });
  pop();
}
function sun(x, y, r, t, sd) {
  seedAt(sd); push(); tr(x, y);
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .3; ink([[Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25], [Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5]], false, 5); }
  shape(ell(0, 0, r, r, 30), PAL.lemon, 6);
  face(0, 0, r * .38, { eyes: 'happy', mouth: 'smile', w: 5, blush: 1 });
  pop();
}

// ---- tyres ----
function tyreFront(x, y, w, h, sd) { shape(rrect(x - w / 2, y - h, w, h, w * .3, sd), PAL.tyre, 6); shape(rrect(x - w * .22, y - h * .7, w * .44, h * .4, w * .12, sd + 1), PAL.hub, 4); }
function tyreSide(x, y, r, spin, sd) {
  shape(ell(x, y - r, r, r, 26), PAL.tyre, 6); shape(ell(x, y - r, r * .48, r * .48, 18), PAL.hub, 4);
  for (let i = 0; i < 3; i++) { const a = spin + i * TAU / 3; inkFill(ell(x + Math.cos(a) * r * .26, y - r + Math.sin(a) * r * .26, r * .07, r * .07, 8)); }
}

// ---- THE PLANE ----
// o: { t, eyes, mouth, open, look, bob, spin, tilt, brow, blush }
function propFront(x, y, R, spin, sd) {
  paint(ell(x, y, R, R, 30), '#ffffff', .4);
  ink(ell(x, y, R, R, 30), true, 2.5, { col: 'rgba(30,26,29,.35)' });
  for (let i = 0; i < 2; i++) { const a = spin + i * Math.PI; const P = xform(rrect(-R * .14, -R, R * .28, R, R * .12, sd + i), x, y, a); shape(P, '#9c8fb0', 5); }
  shape(ell(x, y, R * .2, R * .2, 16), PAL.coral, 5);
}
function planeFront(x, y, kk, o) {
  const { t = 0, bob = 0, spin = t * 18, tilt = 0 } = o;
  push(); tr(x, y); sc(kk);
  seedAt(1000);
  paint(ell(0, -4, 300, 26), '#6b5a7a', .22);                                              // shadow
  tyreFront(-88, 0, 70, 78, 1001); tyreFront(88, 0, 70, 78, 1003);
  tr(0, bob); rot(tilt);
  seedAt(1010);
  shape(rrect(-24, -395, 48, 160, 20, 1010), PAL.teal, 6);                                 // tail fin, behind
  heart(0, -350, 18, PAL.pink, 4);
  shape(rrect(-165, -318, 330, 30, 14, 1012), PAL.wing, 6);                                // tailplane
  seedAt(1020);
  shape(rrect(-640, -178, 1280, 50, 24, 1020), PAL.wing, 6);                               // the wings: level, far too long
  for (const sgn of [-1, 1]) { shape(rrect(sgn > 0 ? 560 : -640, -178, 80, 50, 24, 1021 + sgn), PAL.pink, 6); }
  for (const ex of [-430, -250, 250, 430]) {
    seedAt(1030 + ex);
    shape(ell(ex, -153, 48, 46, 24), PAL.cream, 6);
    propFront(ex, -153, 82, spin * (ex > 0 ? 1 : -1) + ex, 1040 + ex);
  }
  seedAt(1100);
  shape(rrect(-150, -300, 300, 262, 78, 1100), PAL.cream, 7);                              // the body
  shape(rrect(-86, -284, 172, 42, 18, 1101), PAL.blue, 6);                                 // windscreen, like a hat brim
  paint(rrect(-70, -278, 40, 10, 4), '#ffffff', .8);
  face(0, -196, 64, { ...o, w: 7 });
  pop();
}
function planeSide(x, y, kk, o) { // facing right, face on the flank by the nose
  const { t = 0, bob = 0, spin = t * 18, roll = t * 8 } = o;
  push(); tr(x, y); sc(kk);
  seedAt(2000);
  paint(ell(-10, -4, 340, 24), '#6b5a7a', .22);
  push(); tr(0, bob);
  seedAt(2005);
  shape([[-250, -270], [-300, -420], [-232, -425], [-150, -270]], PAL.teal, 6);            // tail fin
  heart(-250, -360, 20, PAL.pink, 4);
  shape(rrect(-330, -300, 640, 205, 96, 2006), PAL.cream, 7);                              // fuselage, a rounded box
  shape([[150, -296], [228, -272], [250, -246], [170, -252]], PAL.blue, 5);                // windscreen on the brow
  for (let i = 0; i < 4; i++) { shape(ell(-210 + i * 70, -222, 19, 19, 16), PAL.blue, 5); paint(ell(-216 + i * 70, -228, 6, 4), '#ffffff', .85); }
  shape(rrect(-390, -262, 130, 34, 16, 2020), PAL.wing, 5);                                // stabiliser
  seedAt(2030);
  shape(rrect(-270, -176, 300, 52, 24, 2030), PAL.wing, 6);                                // near wing, level with the body
  shape(rrect(-50, -186, 110, 72, 30, 2031), PAL.cream, 6);                                 // engine
  paint(ell(76, -150, 14, 92), '#ffffff', .45);
  const bl = Math.cos(spin) * 88; shape(rrect(68, -150 - Math.abs(bl), 16, Math.abs(bl) * 2 + 2, 7, 2032), '#9c8fb0', 4);
  shape(ell(70, -150, 16, 16, 12), PAL.coral, 4);
  face(205, -192, 50, { ...o, w: 6.5 });
  pop();
  tyreSide(-170, 0, 50, roll, 2040); tyreSide(170, 0, 50, roll, 2044);
  pop();
}
function planeTop(x, y, kk, o) { // seen from above, nose to the right, his face looking up at us
  const { t = 0, spin = t * 18 } = o;
  push(); tr(x, y); sc(kk);
  seedAt(3000);
  paint(rrect(-60, -510, 140, 1080, 50), '#6b5a7a', .18); paint(rrect(-290, -60, 640, 192, 90), '#6b5a7a', .18);
  for (const tx of [-130, 140]) for (const sy of [-1, 1]) shape(rrect(tx - 34, sy > 0 ? 60 : -88, 68, 28, 8, 3001 + tx + sy), PAL.tyre, 5);
  seedAt(3010);
  shape(rrect(-90, -540, 140, 1080, 50, 3010), PAL.wing, 7);                               // the wing, longer than the lane is wide
  for (const sy of [-1, 1]) shape(rrect(-90, sy > 0 ? 470 : -540, 140, 70, 34, 3011 + sy), PAL.pink, 6);
  for (const ey of [-350, -190, 190, 350]) {
    seedAt(3020 + ey);
    shape(rrect(10, ey - 26, 110, 52, 22, 3020 + ey), PAL.cream, 6);
    paint(ell(128, ey, 9, 70), '#ffffff', .45);
    const bl = Math.cos(spin + ey) * 70; shape(rrect(122, ey - Math.abs(bl), 14, Math.abs(bl) * 2 + 2, 6, 3021 + ey), '#9c8fb0', 4);
  }
  seedAt(3100);
  shape(rrect(-300, -170, 80, 340, 30, 3100), PAL.wing, 6);                                // tailplane
  shape(rrect(-320, -96, 640, 192, 92, 3101), PAL.cream, 7);                               // fuselage
  shape(rrect(-330, -14, 120, 28, 12, 3102), PAL.teal, 5);                                 // fin, from above
  shape(rrect(100, -62, 36, 124, 16, 3103), PAL.blue, 5);                                  // windscreen
  face(220, 4, 46, { ...o, w: 6.5 });
  pop();
}

// ---- CARS ----
function carSide(x, y, kk, o) { // facing right
  const { col = PAL.lilac, len = 300, t = 0, sd = 4000, eyes = 'shades', mouth = 'smirk', open = 0, bow = false, bob = 0 } = o;
  push(); tr(x, y); sc(kk); seedAt(sd);
  paint(ell(0, -4, len * .55, 16), '#6b5a7a', .2);
  push(); tr(0, bob);
  shape(rrect(-len * .3, -186, len * .55, 74, 26, sd + 1), col, 6);
  shape(rrect(-len * .22, -172, len * .17, 48, 12, sd + 2), PAL.blue, 5); shape(rrect(len * .0, -172, len * .17, 48, 12, sd + 3), PAL.blue, 5);
  shape(rrect(-len / 2, -128, len, 90, 34, sd + 4), col, 6.5);
  paint(rrect(-len / 2 + 20, -118, len * .4, 10, 5), '#ffffff', .5);
  if (bow) { heart(-len * .05, -196, 26, PAL.berry, 5); }
  face(len / 2 - 70, -88, 28, { eyes, mouth, open, t, w: 5.5, blush: .9 });
  pop();
  tyreSide(-len * .3, 0, 32, t * 14, sd + 10); tyreSide(len * .3, 0, 32, t * 14, sd + 14);
  pop();
}
function carTop(x, y, kk, o) { // from above, facing right
  const { col = PAL.lilac, len = 260, wd = 130, sd = 5000, eyes = 'shades', mouth = 'smirk', hop = 0 } = o;
  push(); tr(x, y);
  seedAt(sd);
  paint(rrect(-len / 2 * kk + hop * 40, -wd / 2 * kk + hop * 50, len * kk, wd * kk, 30), '#6b5a7a', .2 * (1 - hop * .5));
  sc(kk * (1 + hop * .35));
  for (const tx of [-len * .3, len * .3]) for (const sy of [-1, 1]) shape(rrect(tx - 22, sy > 0 ? wd / 2 - 12 : -wd / 2 - 8, 44, 20, 6, sd + tx + sy), PAL.tyre, 4);
  shape(rrect(-len / 2, -wd / 2, len, wd, 34, sd + 1), col, 6.5);
  shape(rrect(-len * .25, -wd * .36, len * .42, wd * .72, 20, sd + 2), PAL.blue, 5);
  shape(rrect(-len * .18, -wd * .3, len * .28, wd * .6, 14, sd + 3), col, 5);
  face(len * .34, 0, 30, { eyes, mouth, w: 5, blush: .8 });
  pop();
}
function speedLines(x, y, h, t, sd) { for (let i = 0; i < 3; i++) { const yy = y - h * (.25 + i * .25), L = 50 + 40 * hash(sd + i + TB); ink([[x - 30 - L, yy], [x - 30, yy]], false, 4.5); } }
