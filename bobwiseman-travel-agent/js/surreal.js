// Draft 3: the world gets stranger as the song goes on. Each act breaks one more rule:
//   1 grounded (0-59) · 2 one impossible thing per scene (59-116) · 3 physics bends (116-188)
//   4 the world won't hold still (188-276) · 5 scale and identity collapse, the blueprint starts burning
//   through the paper (276-365) · 6 dissolution, then the snow settles back into the opening shopfront.
// Long shots here carry their change inside the shot (p drives it), so they can run 4-8 s.
'use strict';

// ---------- the merge: the blueprint burns through the paper (ill shots, last third) ----------
const LEAK_T0 = 272, LEAK_T1 = 392;
function leak(a) {
  if (a <= 0) return; const r = M32(4040 + DSEED * 13);
  for (let i = 0; i < 9; i++) {
    // holes keep to the edges of frame so the subject stays readable; they grow and multiply as the merge takes over
    let x = r() * W, y = r() * H; const dx = (x - W / 2) / (W * .46), dy = (y - H / 2) / (H * .46), d = Math.hypot(dx, dy); if (d < 1) { x = W / 2 + dx / (d || 1) * W * .46; y = H / 2 + dy / (d || 1) * H * .46; }
    const R0 = (50 + r() * 150) * cl(a * 1.8 - i * .14), sd = r(); if (R0 < 5) continue;
    const pts = []; for (let k = 0; k < 28; k++) { const an = k / 28 * TAU, rr = R0 * (.78 + .22 * Math.sin(an * 3 + i * 1.7) + .12 * Math.sin(an * 7 + sd * 9)); pts.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); }
    const hp = PP(pts);
    X.save(); X.clip(PE(x, y, R0 * 1.3, R0 * 1.3)); hatch(PE(x, y, R0 * 1.3, R0 * 1.3), x, y, R0 * 1.3, .9 + i, 4, C.dark, 1, .45); X.restore(); // scorch
    X.save(); X.clip(hp); X.fillStyle = C.navy; X.fillRect(x - R0 * 1.4, y - R0 * 1.4, R0 * 2.8, R0 * 2.8);
    lattice(x, y, 24, Math.ceil(R0 / 32) + 1, C.lav, .35); stip(null, x, y, R0, R0 * 4, C.lav, .55, 1.3); if (R0 > 60) star(x + R0 * .2, y - R0 * .1, 3 + R0 * .02, C.white, .8); gc(x, y, R0 * .6, C.lav, .3, 1, [3, 6]); X.restore();
    iP(pts, true, C.ink, 3, 1, true, 1.4);
  }
  X.beginPath(); for (let i = 0; i < 7; i++) { const y = r() * H, L = W * cl(a * 1.5 - i * .1), dy = (r() - .5) * 400; X.moveTo(0, y); X.lineTo(L, y + dy * L / W); } stroke(C.lav, 1.4, .55 * cl(a * 2));
  for (let i = 0; i < 4; i++) { const x = r() * W, y = r() * H; gc(x, y, (160 + r() * 360) * cl(a * 1.4 - i * .1), C.lav, .45 * cl(a * 2), 1.2, [4, 6]); }
  for (let i = 0; i < 5; i++) { const x = r() * W, y = r() * H; if (a > .3 + i * .1) { X.beginPath(); X.moveTo(x - 12, y); X.lineTo(x + 12, y); X.moveTo(x, y - 12); X.lineTo(x, y + 12); stroke(C.lav, 1.2, .7); } }
}

// ---------- act 2: one impossible thing ----------
SU.roadCarpet = { mode: 'ill', f(q, p, a, T) { // the road rolls itself up behind the car
  stripes(C.paper, '#e6d9b8', 140, -.62, 0, C.tan); cam(960, 540, lerp(1.05, 1, eo(p)));
  const hz = 520, u = cl(lerp(a.from || 0, a.to || 1, p));
  const h1 = PE(500, hz + 260, 900, 280); fillP(h1, '#b9b98a'); hatch(h1, 500, hz + 100, 900, .5, 8, C.ink, .9, .35, [40, 30]); iE(500, hz + 260, 900, 280, 0, C.ink, 2.2, 1, true, 1, Math.PI, TAU);
  const h2 = PE(1500, hz + 300, 800, 300); fillP(h2, C.sage); hatch(h2, 1500, hz + 100, 800, -.5, 7, C.ink, .9, .35, [-40, 30]); iE(1500, hz + 300, 800, 300, 0, C.ink, 2.2, 1, true, 1, Math.PI, TAU);
  const gnd = PR(-200, hz + 120, W + 400, 600); fillP(gnd, '#a8a878'); hatch(gnd, 960, hz + 400, 1400, -.2, 9, C.ink, .8, .3);
  const ry = lerp(hz + 125, 980, eo(u)), tt = (ry - (hz + 120)) / (H + 40 - hz - 120);
  const lx = lerp(930, 420, tt), rx = lerp(990, 1500, tt);
  // bare paper where the road was: just its construction lines
  X.setLineDash([6, 8]); X.beginPath(); X.moveTo(930, hz + 120); X.lineTo(lx, ry); X.moveTo(990, hz + 120); X.lineTo(rx, ry); stroke(C.ink, 1.2, .5); X.setLineDash([]);
  fillP(PP([[930, hz + 120], [990, hz + 120], [rx, ry], [lx, ry]]), C.paper, .9);
  const rd = PP([[lx, ry], [rx, ry], [1500, H + 40], [420, H + 40]]); fillP(rd, '#8a8172'); hatch(rd, 960, 900, 600, .1, 6, C.ink, .9, .5); iP([[lx, ry], [420, H + 40]], false); iP([[rx, ry], [1500, H + 40]], false);
  for (let i = 0; i < 6; i++) { const t2 = ((i / 6 + T * .3) % 1), y = lerp(ry + 10, H + 40, t2 * t2); fillP(PR(958 - 6 * t2, y, 4 + 14 * t2, 8 + 40 * t2), C.cream); }
  // the roll
  const rr = lerp(10, 70, tt) + u * 30, rl = PR(lx - 10, ry - rr * 2, rx - lx + 20, rr * 2); fillP(rl, '#7d7466'); hatch(rl, 960, ry - rr, rx - lx, 0, 4, C.ink, .9, .55); iBox(lx - 10, ry - rr * 2, rx - lx + 20, rr * 2, C.ink, 2.4);
  const ex2 = PE(lx - 10, ry - rr, rr * .45, rr); fillP(ex2, '#9a9080'); iE(lx - 10, ry - rr, rr * .45, rr, 0, C.ink, 2.2);
  X.beginPath(); for (let k = 0; k < 60; k++) { const th = k / 60 * 6 * Math.PI, s2 = k / 60; X.lineTo(lx - 10 + Math.cos(th) * rr * .45 * s2, ry - rr + Math.sin(th) * rr * s2); } stroke(C.ink, 1.2, .8);
  for (let i = 0; i < 3; i++) gc(960, ry - rr, rr * 2 + 40 + i * 30, C.orange, .6, 1.6, null, Math.PI * 1.1, Math.PI * 1.9);
  // the car keeps just ahead of it
  const cy = Math.min(H + 60, ry + 120 + u * 140), cs = lerp(.4, 1.6, cl((cy - hz) / (H - hz))); car(lerp(960, 820, cs / 1.6), cy, cs);
  traveller(260, 1060, 1.15, { look: 1, mouth: sing(T) }); cloud(260, 520, .62, { rain: true });
  consL([[0, hz + 120, W, hz + 120], [960, hz + 120, 0, H], [960, hz + 120, W, H]]);
} };
SU.stampWorld = { mode: 'ill', f(q, p, a, T) { // a giant rubber stamp comes down on the landscape
  const hit = .34, shake = p > hit && p < hit + .12 ? 1 : 0;
  stripes(C.paper, '#e6d9b8', 140, -.62, 0, C.tan); cam(960 + jit(14 * shake), 540 + jit(14 * shake), 1);
  const hz = 560; const h1 = PE(600, hz + 280, 1000, 300); fillP(h1, C.sage); hatch(h1, 600, hz + 100, 1000, .5, 8, C.ink, .9, .35, [40, 30]); iE(600, hz + 280, 1000, 300, 0, C.ink, 2.2, 1, true, 1, Math.PI, TAU);
  const h2 = PE(1500, hz + 320, 800, 300); fillP(h2, '#b9b98a'); hatch(h2, 1500, hz + 120, 800, -.5, 7, C.ink, .9, .35, [-40, 30]); iE(1500, hz + 320, 800, 300, 0, C.ink, 2.2, 1, true, 1, Math.PI, TAU);
  const g = PR(-200, hz + 140, W + 400, 500); fillP(g, '#a8a878'); hatch(g, 960, hz + 400, 1400, -.2, 9, C.ink, .8, .3);
  traveller(330, 1040, .9, { look: 1, mouth: sing(T) }); cloud(330, 620, .5, { rain: true }); kioskMini(1600, 1000, .55);
  if (p > hit) stampMark(1000, 720, 360, a.mark || 'URGENT', C.brick, -.12, .92);
  const sy = p < hit ? lerp(-900, 380, eo(p / hit)) : lerp(380, -900, eo((p - hit - .12) / .5)), sx = 1000;
  if (sy > -880) { const b = PR(sx - 380, sy, 760, 120); fillP(b, '#3b2a22'); iBox(sx - 380, sy, 760, 120, C.ink, 3); const nk = PR(sx - 70, sy - 380, 140, 380); fillP(nk, '#8a5530'); shade(nk, sx, sy - 190, 200, [20, 0], .9, 5); iBox(sx - 70, sy - 380, 140, 380, C.ink, 3); const kb = PE(sx, sy - 430, 190, 110); fillP(kb, '#a5703f'); shade(kb, sx, sy - 430, 200, [30, -20], .7, 5); iE(sx, sy - 430, 190, 110, 0, C.ink, 3); }
  if (shake) for (let i = 0; i < 4; i++) gc(1000, 760, 400 + i * 70 + (p - hit) * 900, C.orange, .8, 3, null, Math.PI, TAU);
  consL([[0, hz + 140, W, hz + 140], [1000, 0, 1000, H]]);
} };
function kioskMini(x, y, s) { X.save(); X.translate(x, y); X.scale(s, s); agent(0, 0, 1, { look: -.7 }); desk(0, 0, 360, 1); iline(150, 0, 150, -330, C.ink, 5); const can = PP([[-140, -330], [440, -330], [150, -460]]); fillP(can, C.orange); iP([[-140, -330], [440, -330], [150, -460]], true, C.ink, 2.4); X.restore(); }

// ---------- act 3: physics bends ----------
SU.tinyPlanet = { mode: 'ill', f(q, p, a, T) { // he walks on a planet the size of a roundabout; his cloud is its moon
  stripes(C.paper, '#e3d9c0', 150, -.62, T * 20, C.tan); cam(960, 560, lerp(a.z0 || 1, a.z1 || 1.1, eo(p)));
  const cx = 960, cy = 1180, r = 560, rot = T * .45;
  const ma = -Math.PI / 2 + T * .9, mx = cx + Math.cos(ma) * 860, my = cy + Math.sin(ma) * 860 * .78; if (Math.sin(ma) < 0) cloud(mx, my, .6, { rain: true });
  gc(cx, cy, 860, C.teal, .5, 1.4, [8, 8]);
  globe(cx, cy, r, rot);
  const onRim = (ang, fn) => { const an = ((ang % TAU) + TAU) % TAU, d = an > Math.PI ? an - TAU : an; if (Math.abs(d) > 1.35) return; X.save(); X.translate(cx, cy); X.rotate(d); X.translate(0, -r + 6); fn(); X.restore(); };
  onRim(-rot + 1.0, () => kioskMini(0, 0, .42));
  onRim(-rot + 2.2, () => palm(0, 0, .7));
  onRim(-rot + 3.4, () => { iline(0, 0, 0, -260, C.ink, 5); iE(40, -250, 18, 14, 0, C.ink, 2); });
  onRim(-rot + 4.6, () => { const b = PR(-110, -180, 220, 180); fillP(b, C.brick); iBox(-110, -180, 220, 180, C.ink, 2.4); lab(0, -150, 'TRAVEL', C.cream, 1, 22, 'center', 'alphabetic', 'bold'); });
  onRim(-rot + 5.6, () => car(0, 0, .6));
  traveller(cx, cy - r + 8, .95, { legs: walkPh() * 1.3, case: true, look: 1, mouth: sing(T) });
  if (Math.sin(ma) >= 0) cloud(mx, my, .6, { rain: true });
  for (let i = 0; i < 6; i++) { const an = -Math.PI / 2 - .3 - i * .14; X.save(); X.translate(cx + Math.cos(an) * (r + 24), cy + Math.sin(an) * (r + 24)); X.rotate(an + Math.PI / 2); X.beginPath(); X.moveTo(-8, -6); X.lineTo(0, 0); X.lineTo(-8, 6); stroke(C.brick, 2.4, .9 - i * .13); X.restore(); }
  consC([[cx, cy, r + 120]]); consL([[0, cy - r, W, cy - r], [cx, 0, cx, H]]);
} };
SU.muleCircle = { mode: 'ill', f(q, p, a, T) { // the queue of mules closes into a ring: each chases the carrot hung by the one ahead
  stripes(C.paper, '#e6d3a8', 140, -.62, 0, C.ochre); cam(960, 600, lerp(a.z0 || 1, a.z1 || 1.08, eo(p)));
  const cx = 960, cy = 760, rx = 640, ry = 200, n = 8, base = T * .35;
  const gp = PE(cx, cy, rx + 80, ry + 40); fillP(gp, '#c4ae84'); hatch(gp, cx, cy, rx, .2, 7, C.ink, .8, .3); iE(cx, cy, rx + 80, ry + 40, 0, C.ink, 2.4);
  X.setLineDash([12, 10]); iE(cx, cy, rx, ry, 0, C.orange, 2.4, .9, false); X.setLineDash([]);
  const items = []; for (let i = 0; i < n; i++) { const an = base + i * TAU / n; items.push([Math.sin(an), an, i]); } items.sort((u, v) => u[0] - v[0]);
  for (const [sn, an, i] of items) {
    const x = cx + Math.cos(an) * rx, y = cy + Math.sin(an) * ry, s = lerp(.45, .78, (sn + 1) / 2), dir = -Math.sin(an) >= 0 ? 1 : -1;
    const me = i === 0;
    traveller(x, y, s, { legs: walkPh() * 1.3 + i, look: dir, coat: me ? C.teal : [C.plum, C.sage, C.ochre, C.rose, C.brick, '#6b7a8f', C.tan][i % 7], mouth: me ? sing(T) : 0 });
    const hx = x + 10 * s, hy = y - 360 * s, px = hx + dir * 230 * s, py = hy - 50 * s;
    iline(hx, hy, px, py, C.ink, 3 * s + 1); iline(px, py, px, py + 120 * s, C.ink, 1.2, 1, false); carrot(px, py + 120 * s, .6 * s);
    if (me) gc(x, y - 200 * s, 230 * s, C.orange, .8, 2);
  }
  lab(cx, cy + ry + 120, 'NO ONE IS FIRST', C.brick, .9, 18, 'center', 'alphabetic', 'bold');
  consL([[0, cy, W, cy], [cx, 0, cx, H]]);
} };
SU.corkMoon = { mode: 'ill', f(q, p, a, T) { // the cork leaves the diner and becomes the moon
  stripes('#d9cbb2', '#c9b79a', 150, -.62, 0, C.plum); cam(960, 540, 1);
  for (let i = 0; i < 60; i++) { const r2 = M32(i + 3), x = r2() * W, y = r2() * 600; fillP(PE(x, y, 2.2, 2.2), C.ink, .7); }
  const u = eo(p), up = cl(p / .45), cx = lerp(1000, 960, u), cy = lerp(980, 330, eo(up)), sz = lerp(20, 210, eo(cl((p - .25) / .6))), face = cl((p - .3) / .4);
  X.save(); X.translate(cx, cy); X.rotate((1 - face) * T * 5);
  if (face < 1) { const c = PR(-sz * .5, -sz * .7 * (1 - face) - sz * .02, sz, sz * 1.4 * (1 - face) + 4); fillP(c, C.tan); shade(c, 0, 0, sz, [sz * .2, -sz * .2], .6, 4); iBox(-sz * .5, -sz * .7 * (1 - face) - sz * .02, sz, sz * 1.4 * (1 - face) + 4, C.ink, 2.4); }
  const m = PE(0, 0, sz * .5 + face * sz * .5, sz * .5 + face * sz * .5); fillP(m, '#e9d9a8'); hatch(m, 0, 0, sz, .8, 5, C.ink, .9, .55, [sz * .3 * face, -sz * .3 * face]);
  if (face > .3) { const r2 = M32(19); for (let i = 0; i < 9; i++) { const an = r2() * TAU, rr = r2() * sz * .7, cr = 8 + r2() * sz * .14; iE(Math.cos(an) * rr, Math.sin(an) * rr, cr, cr * .8, 0, C.ink, 1.6, face, false); } stip(m, 0, 0, sz, 600 * face, C.ink, .5, 1.6); }
  iE(0, 0, sz * .5 + face * sz * .5, sz * .5 + face * sz * .5, 0, C.ink, 2.8);
  X.restore();
  path(bzPts([1000, 980], [1040, 700], [960, 600], [cx, cy], 0, 1, 30), C.orange, 2, .8, [8, 8]);
  const tb = PR(560, 900, 800, 40); fillP(tb, C.cream); iBox(560, 900, 800, 40, C.ink, 2); traveller(820, 1080, .55, { hat: false, look: 1, sit: 0, coat: C.plum }); traveller(1180, 1080, .55, { look: -1, mouth: sing(T) }); cloud(1180, 800, .3, {});
  cloud(lerp(-200, 2100, (T * .03) % 1), 260, .9, {});
  if (face > .9) lab(cx + 260, cy + 10, 'CORK · 384,400 KM', C.ink, .9, 16, 'left', 'alphabetic', 'bold');
  consC([[cx, cy, 300]]);
} };

// ---------- act 4: the world won't hold still ----------
SU.corridorInf = { mode: 'ill', f(q, p, a, T) { // the corridor keeps adding doors; the end never arrives
  paper('#e8e2d0'); cam(960, 540, 1);
  const vx = 960, vy = 470, ph = (T * .5) % 1;
  const flp = PP([[0, H], [W, H], [vx + 20, vy + 6], [vx - 20, vy + 6]]); fillP(flp, '#c9c2a8');
  X.save(); X.clip(flp); X.beginPath(); for (let i = -14; i <= 14; i++) { X.moveTo(vx + i * 2, vy); X.lineTo(vx + i * 160, H); } for (let k = 0; k < 14; k++) { const d = (k + ph) / 14, t2 = Math.pow(d, 3), y = lerp(vy, H, t2); X.moveTo(0, y); X.lineTo(W, y); } stroke(C.ink, 1, .45); X.restore();
  const lw = PP([[0, 0], [vx - 20, vy - 20], [vx - 20, vy + 6], [0, H]]), rw = PP([[W, 0], [vx + 20, vy - 20], [vx + 20, vy + 6], [W, H]]); fillP(lw, '#ddd6c2'); fillP(rw, '#d4ccb6'); hatch(lw, 400, 500, 700, .9, 8, C.ink, .8, .3); hatch(rw, 1500, 500, 700, -.9, 7, C.ink, .8, .4);
  fillP(PP([[0, 0], [W, 0], [vx + 20, vy - 20], [vx - 20, vy - 20]]), '#efe9d8');
  for (let k = 13; k >= 0; k--) { const d0 = (k + ph) / 14, d1 = (k + ph + .45) / 14, t0 = Math.pow(d0, 3), t1 = Math.pow(d1, 3); for (const sd of [-1, 1]) { const ex0 = sd < 0 ? lerp(vx - 20, 0, t0) : lerp(vx + 20, W, t0), ex1 = sd < 0 ? lerp(vx - 20, 0, t1) : lerp(vx + 20, W, t1); const top0 = lerp(vy - 14, 120, t0), top1 = lerp(vy - 14, 120, t1), b0 = lerp(vy + 6, H, t0), b1 = lerp(vy + 6, H, t1); const dp = PP([[ex0, top0], [ex1, top1], [ex1, b1], [ex0, b0]]); fillP(dp, C.sage); if (t1 > .05) iP([[ex0, top0], [ex1, top1], [ex1, b1], [ex0, b0]], true, C.ink, lerp(.8, 2.4, t1)); }
    const lt = lerp(vy - 20, 0, Math.pow((k + ph + .2) / 14, 3)), lw2 = lerp(4, 380, Math.pow((k + ph + .2) / 14, 3)); fillP(PR(vx - lw2 / 2, lt, lw2, 6 + lw2 * .03), C.cream); }
  gc(vx, vy, 30 + 20 * Math.sin(T * 3), C.orange, .8, 2); lab(vx, vy - 60, 'EXIT', C.sage, .9, 16, 'center');
  if (!a.empty) { const d = .55, y = 840, x = 960; traveller(x - 120 * d, y, d, { hat: false, legs: walkPh(), coat: '#f4f1e8', sleeve: '#f4f1e8' }); traveller(x, y + 6, d, { hat: false, legs: walkPh() + 1, coat: C.plum }); traveller(x + 120 * d, y, d, { hat: false, legs: walkPh() + 2, coat: '#f4f1e8', sleeve: '#f4f1e8' }); }
  consL([[0, 0, vx, vy], [W, 0, vx, vy], [0, H, vx, vy], [W, H, vx, vy]], .12);
} };
SU.deskFloat = { mode: 'ill', f(q, p, a, T) { // her desk on a floating island; he drifts up to it, hanging from his own rain cloud
  stripes('#e9e4d0', '#cfe0da', 150, -.62, T * 30, C.teal); cam(a.fx2 || 960, a.fy2 || 540, lerp(a.z0 || 1, a.z1 || 1.06, eo(p)));
  for (let i = 0; i < 3; i++) cloud(((i * 700 + T * 40) % (W + 600)) - 300, 160 + i * 300, .7, {});
  const bob = Math.sin(T * 1.2) * 18, ix = 1280, iy = 640 + bob;
  const isl = [[ix - 380, iy], [ix + 380, iy], [ix + 300, iy + 90], [ix + 150, iy + 260], [ix, iy + 340], [ix - 160, iy + 240], [ix - 320, iy + 80]], ip = PP(isl);
  fillP(ip, '#b9925f'); hatch(ip, ix, iy + 160, 380, .9, 5, C.ink, 1, .6, [0, -40]); hatch(ip, ix, iy + 160, 380, -.6, 7, C.ink, .9, .4); iP(dens(isl, 30, true), true, C.ink, 2.6);
  const top = PE(ix, iy, 380, 40); fillP(top, C.sage); iE(ix, iy, 380, 40, 0, C.ink, 2.4);
  agent(ix + 60, iy - 10, .9, { look: -.7, talk: a.talk ? Math.abs(Math.sin(T * 9)) * .9 : 0, point: a.point ? eo(p) : 0 }); desk(ix + 60, iy - 10, 420, .9); souvenirsOn(ix - 120, iy - 26, T, .7);
  const hx = lerp(420, 860, eo(a.reach ? 1 : p * .8)), hy = lerp(760, 470, eo(a.reach ? 1 : p * .8)) + Math.sin(T * 1.7) * 14;
  cloud(hx, hy - 380, .8, { rain: true }); iline(hx, hy - 330, hx + 20, hy - 290, C.ink, 1.4, 1, false);
  traveller(hx, hy, .95, { look: 1, mouth: sing(T), armR: [3.0, .1], armL: [.4, .2], case: true });
  path([[hx - 300, hy + 200], [hx, hy]], C.orange, 2, .7, [8, 8]);
  consC([[ix, iy + 100, 480]]);
} };
SU.screenWindow = { mode: 'ill', f(q, p, a, T) { // the cinema screen is a window onto the beach; he climbs through it
  stripes('#e2d2c4', '#d4bfae', 140, -.62, 0, C.plum); cam(1300, 500, lerp(1.25, 1.35, eo(p)));
  const sx = 1060, sy = 140, sw = 760, sh = 460, scr = PR(sx, sy, sw, sh);
  fillP(PR(sx - 40, sy - 40, 40, sh + 80), '#7a2a3a'); fillP(PR(sx + sw, sy - 40, 40, sh + 80), '#7a2a3a');
  X.save(); X.clip(scr); fillP(scr, '#f1e1bd'); stripes('#f1e1bd', '#ead197', 80, -.62, 0, C.ochre); sunIll(sx + 600, sy + 120, 70, C.orange, 1); const sea = PR(sx, sy + 280, sw, 70); fillP(sea, C.teal); hatch(sea, sx + sw / 2, sy + 315, 500, .05, 6, C.ink, .9, .5); fillP(PR(sx, sy + 350, sw, 120), C.tan); stipRect(sx, sy + 350, sw, 120, 600, C.ink, .5, 2); palm(sx + 140, sy + 420, .6);
  const inn = eo(cl(p * (a.late ? 1 : .8) + (a.late ? .6 : 0))); traveller(lerp(sx + 120, sx + 420, inn), lerp(sy + 560, sy + 440, inn), .7, { look: 1, legs: walkPh(), mouth: sing(T) }); X.restore();
  iBox(sx, sy, sw, sh, C.ink, 3); hatch(PR(sx - 40, sy - 40, 40, sh + 80), sx - 20, sy + sh / 2, 300, 1.57, 8, C.ink, 1, .5); hatch(PR(sx + sw, sy - 40, 40, sh + 80), sx + sw + 20, sy + sh / 2, 300, 1.57, 8, C.ink, 1, .5);
  const inn2 = eo(cl(p * (a.late ? 1 : .8) + (a.late ? .6 : 0))); if (inn2 < .5) { X.save(); X.beginPath(); X.rect(0, sy + sh, W, H); X.clip(); limb([[sx + 140, sy + sh - 20], [sx + 120, sy + sh + 90], [sx + 100, sy + sh + 190]], 15, {}, 1, '#4a3b33'); limb([[sx + 170, sy + sh - 20], [sx + 180, sy + sh + 100], [sx + 170, sy + sh + 200]], 15, {}, 1, '#4a3b33'); X.restore(); }
  for (let r2 = 0; r2 < 2; r2++) for (let i = 0; i < 9; i++) { const x2 = 600 + i * 200 + r2 * 60, y2 = 720 + r2 * 120, st = PP([[x2, y2], [x2 + 170, y2], [x2 + 180, y2 + 140], [x2 - 10, y2 + 140]]); fillP(st, '#8a3a3a'); shade(st, x2 + 85, y2 + 70, 110, [10, -10], .8, 5); iP([[x2, y2], [x2 + 170, y2], [x2 + 180, y2 + 140], [x2 - 10, y2 + 140]], true, C.ink, 2); }
  cloud(lerp(sx + 160, sx + 420, inn2), sy - 60, .5, { rain: true });
} };

// ---------- act 5: scale and identity collapse ----------
SU.marqueeBirds = { mode: 'ill', f(q, p, a, T) { // the marquee letters grow wings and leave
  SU.kiosk.f(q, p, { place: 'box', talk: 0 }, T);
  const L = 'TOURS'; X.save(); X.font = 'bold 84px Georgia, serif'; X.textAlign = 'center'; X.textBaseline = 'middle';
  const cover = PR(430, 118, 1060, 104); fillP(cover, C.cream);
  for (let i = 0; i < L.length; i++) { const st = eo(cl((p - i * .1) / .55)), x0 = 960 + (i - 2) * 70, y0 = 172, x = lerp(x0, x0 - 300 + i * 260, st), y = lerp(y0, -120 - i * 30, st) + Math.sin(T * 6 + i) * 10 * st;
    if (st > .02) { const wf = ((FD >> 1) + i) % 2 ? .6 : -.3; for (const s2 of [-1, 1]) { X.save(); X.translate(x + s2 * 30, y - 10); X.rotate(s2 * wf); const wg = PE(s2 * 34, -10, 40, 14, s2 * .4); fillP(wg, C.cream); hatch(wg, s2 * 34, -10, 42, .7, 4, C.ink, .8, .5); iE(s2 * 34, -10, 40, 14, s2 * .4, C.ink, 1.8); X.restore(); } }
    X.fillStyle = C.ink; X.fillText(L[i], x, y); }
  X.restore();
  for (let i = 0; i < 10; i++) { const st = eo(cl((p - .3 - i * .04) / .5)); if (st <= 0) continue; const bx = 340 + i * 120, x = bx + st * 200, y = 80 - st * 300; fillP(PE(x, y, 9, 9), '#ffe9a8'); iE(x, y, 9, 9, 0, C.ink, 1.2); gc(x, y, 16, C.orange, .5, 1.2); }
} };
SU.suitcasePlane = { mode: 'ill', f(q, p, a, T) { // his suitcase grows wings; he hangs from the handle, his cloud keeps up
  stripes('#e9e4d0', '#d7e2d0', 170, -.62, -T * 160, C.sage); cam(960, 540, lerp(a.z0 || 1, a.z1 || 1.1, eo(p)));
  const fl = PR(-200, 760, W + 400, 500); fillP(fl, '#b7b98c'); X.save(); X.clip(fl); const off = (T * 260) % 300; for (let i = -1; i < 9; i++) { const x0 = i * 300 - off; const pf = PP([[x0, 760], [x0 + 260, 760], [x0 + 320, H], [x0 - 60, H]]); fillP(pf, [C.sage, '#c9b47a', '#a8a878'][((i + Math.floor(T * 260 / 300)) % 3 + 3) % 3]); hatch(pf, x0 + 130, 900, 200, i % 2 ? .3 : -.6, 6, C.ink, .8, .4); iP([[x0, 760], [x0 + 260, 760], [x0 + 320, H], [x0 - 60, H]], true, C.ink, 1.4); } X.restore(); iline(-200, 760, W + 200, 760, C.ink, 2.4);
  const bob = Math.sin(T * 2) * 20, cx = 960, cy = 340 + bob;
  for (const s2 of [-1, 1]) { const wf = ((FD >> 1) % 2 ? -.35 : .25) * s2; X.save(); X.translate(cx + s2 * 60, cy + 40); X.rotate(wf); const wg = PP([[0, 0], [s2 * 280, -60], [s2 * 300, -20], [s2 * 40, 40]]); fillP(wg, '#d8d0bb'); hatch(wg, s2 * 150, -10, 160, .6, 5, C.ink, .9, .5, [0, -10]); iP([[0, 0], [s2 * 280, -60], [s2 * 300, -20], [s2 * 40, 40]], true, C.ink, 2.2); X.restore(); }
  suitcase(cx, cy - 20, 1.6);
  traveller(cx, cy + 440, 1.05, { look: 1, mouth: sing(T), armR: [2.95, -.05], armL: [3.2, .05], legs: Math.sin(T * 3) });
  cloud(cx - 520, cy - 40 + Math.sin(T * 1.6) * 30, .8, { rain: true }); gl(cx - 520, cy, cx - 100, cy + 40, C.teal, .7, 1.6, [8, 8]);
  path([[-100, 640], [400, 520], [cx - 200, cy + 100]], C.orange, 2.4, .9, [14, 10]);
  lab(cx + 200, cy + 300, 'CURE · 50%', C.brick, .95, 22, 'left', 'alphabetic', 'bold');
} };
SU.worldCage = { mode: 'ill', f(q, p, a, T) { // the globe's meridians are bars; he is inside, the bird sits on top, free
  stripes(C.paper, '#d9e0cf', 130, -.62, 0, C.sage); cam(a.fx2 || 960, a.fy2 || 560, lerp(a.z0 || 1, a.z1 || 1.08, eo(p)));
  const cx = 960, cy = 580, r = 420, rot = T * .4;
  const base = PE(cx, cy + r + 40, r * .7, 50); fillP(base, '#6b4a2e'); iE(cx, cy + r + 40, r * .7, 50, 0, C.ink, 2.6); iline(cx, cy + r, cx, cy + r + 40, C.ink, 8);
  const back = []; for (let m = 0; m < 14; m++) { const lo = m * TAU / 14 + rot, x = Math.sin(lo); back.push([Math.cos(lo) < 0, x]); }
  const bar = (frontSide) => { for (let m = 0; m < 14; m++) { const lo = m * TAU / 14 + rot, fr = Math.cos(lo) >= 0; if (fr !== frontSide) continue; const rx = Math.abs(Math.sin(lo)) * r; X.beginPath(); X.ellipse(cx, cy, Math.max(1, rx), r, 0, Math.sin(lo) > 0 ? -Math.PI / 2 : Math.PI / 2, Math.sin(lo) > 0 ? Math.PI / 2 : Math.PI * 1.5); stroke(C.ink, frontSide ? 5 : 2.4, frontSide ? 1 : .45); } };
  bar(false); for (const la of [-.6, 0, .6]) iE(cx, cy + Math.sin(la) * r, Math.cos(la) * r, Math.cos(la) * r * .12, 0, C.ink, 2, .45, false, 1, 0, Math.PI);
  const fl = PE(cx, cy + r * .55, r * .6, r * .08); fillP(fl, '#c4ae84'); iE(cx, cy + r * .55, r * .6, r * .08, 0, C.ink, 2);
  traveller(cx + Math.sin(T * .7) * 120, cy + r * .55, .62, { look: Math.sin(T * .7 + 1.57) > 0 ? 1 : -1, legs: walkPh(), mouth: sing(T), case: true }); cloud(cx + Math.sin(T * .7) * 120, cy + r * .55 - 300, .35, { rain: true });
  bar(true); for (const la of [-.6, 0, .6]) iE(cx, cy + Math.sin(la) * r, Math.cos(la) * r, Math.cos(la) * r * .12, 0, C.ink, 3.4, 1, false, 1, Math.PI, TAU);
  iE(cx, cy, r, r, 0, C.ink, 4); iline(cx, cy - r - 70, cx, cy - r, C.ink, 4); iE(cx, cy - r - 90, 22, 22, 0, C.ink, 3);
  bird(cx + 60, cy - r - 120, .9, (FD >> 2) % 2 ? .2 : 0); for (let i = 0; i < 3; i++) { const t2 = (T * .7 + i / 3) % 1; X.save(); X.translate(cx + 140 + t2 * 300, cy - r - 180 - t2 * 120); fillP(PE(0, 0, 9, 7, -.4), C.ink); iline(8, 0, 8, -34, C.ink, 2.2, 1, false); X.restore(); }
  consC([[cx, cy, r + 90]]); consL([[0, cy, W, cy], [cx, 0, cx, H]]);
} };

// ---------- act 6: dissolution ----------
// Droste zoom: his head holds a snow globe, which holds a cage, which holds her desk, which holds a portrait of his head...
const DK = 4.2; // each layer's opening is 1/DK of the frame
function drosteLayer(type, T) {
  const ow = W / DK, oh = H / DK, ox = (W - ow) / 2, oy = (H - oh) / 2;
  if (type === 0) { stripes(C.paper, '#e3dbc0', 120, -.62, 0, C.sage); const hp = PE(960, 600, 760, 820); fillP(hp, '#efd9b9'); hatch(hp, 960, 600, 800, .6, 7, C.ink, 1, .5, [120, -80]); iE(960, 600, 760, 820, 0, C.ink, 5);
    for (const ex2 of [560, 1360]) { fillP(PE(ex2, 470, 34, 42), C.ink); } X.beginPath(); wP([[990, 700], [1060, 860], [960, 880]], false, 2); stroke(C.ink, 6); X.beginPath(); wP([[860, 980], [1060, 980]], false, 2); stroke(C.ink, 6);
    const brim = PE(960, 40, 1100, 120); fillP(brim, '#3d2a1f'); iE(960, 40, 1100, 120, 0, C.ink, 5); iBox(ox - 20, oy - 20, ow + 40, oh + 40, C.ink, 5); }
  if (type === 1) { stripes('#e6e0d0', '#d8d0bd', 120, -.62, 0, C.sky); const b = PE(960, 520, 900, 900); fillP(b, '#dfe8e6'); hatch(b, 960, 520, 900, .8, 9, C.ink, 1, .35, [180, -180]); iE(960, 520, 900, 900, 0, C.ink, 6); snowFlakes(500, T, '#ffffff', .95, 6); iBox(ox - 20, oy - 20, ow + 40, oh + 40, C.ink, 5); }
  if (type === 2) { stripes(C.paper, '#d9e0cf', 120, -.62, 0, C.sage); cageBars(960, 1300, 1100, 1500, C.ink, 7, 1, [.36, .64]); iBox(ox - 20, oy - 20, ow + 40, oh + 40, C.ink, 5); }
  if (type === 3) { stripes(C.paper, '#ead6a6', 120, -.62, 0, C.ochre); agent(960, 1560, 2.7, { look: 0 }); desk(960, 1560, 1500, 2.7); const fr = PR(ox - 50, oy - 50, ow + 100, oh + 100); fillP(fr, '#8a5530'); iBox(ox - 50, oy - 50, ow + 100, oh + 100, C.ink, 5); }
}
SU.droste = { mode: 'ill', f(q, p, a, T) {
  const z = Math.pow(DK, p * (a.loops || 1)), start = Math.floor(p * (a.loops || 1)), zz = Math.pow(DK, (p * (a.loops || 1)) % 1);
  for (let i = 0; i < 4; i++) {
    const s = zz / Math.pow(DK, i); if (s * W < 8) break;
    X.save(); X.translate(W / 2, H / 2); X.scale(s, s); X.translate(-W / 2, -H / 2);
    if (i > 0) { X.beginPath(); X.rect((W - W / 1) / 2, 0, W, H); X.clip(); }
    drosteLayer((start + i) % 4, T); X.restore();
    // clip the next layer to this layer's opening
    const ow = W / DK * s, oh = H / DK * s; X.save(); X.beginPath(); X.rect(W / 2 - ow / 2, H / 2 - oh / 2, ow, oh); X.clip();
    X._clips = (X._clips || 0) + 1;
  }
  while (X._clips) { X.restore(); X._clips--; }
} };
SU.snowSettle = { mode: 'ill', f(q, p, a, T) { // the snow settles and draws the opening shopfront back into being
  paper('#ece6d6'); cam(960, 560, 1);
  const fx = 380, fy = 150, fw = 1160, fh = 760;
  const lines = [[[fx, fy + fh], [fx, fy], [fx + fw, fy], [fx + fw, fy + fh]], [[fx + 130, fy + 36], [fx + fw - 130, fy + 36], [fx + fw - 130, fy + 154], [fx + 130, fy + 154], [fx + 130, fy + 36]], [[fx + 60, fy + 190], [fx + fw - 60, fy + 190], [fx + fw - 20, fy + 290], [fx + 20, fy + 290], [fx + 60, fy + 190]], [[fx + 90, fy + 340], [fx + 710, fy + 340], [fx + 710, fy + 700], [fx + 90, fy + 700], [fx + 90, fy + 340]], [[fx + 800, fy + fh], [fx + 800, fy + 330], [fx + 1050, fy + 330], [fx + 1050, fy + fh]], [[-200, fy + fh], [W + 200, fy + fh]]];
  const all = lines.map((l) => dens(l, 12)), tot = all.reduce((s2, l) => s2 + l.length, 0), show = Math.floor(tot * eo(p * 1.15)); let used = 0;
  for (const l of all) { const n = Math.max(0, Math.min(l.length, show - used)); used += l.length; if (n > 1) iP(l.slice(0, n), false, C.ink, 2.6, 1, true, 1.2); if (n > 1 && n < l.length) { const [x, y] = l[n - 1]; star(x, y, 3, C.orange, .8); } }
  if (p > .6) { X.globalAlpha = eo((p - .6) / .4); X.font = 'bold 86px Georgia, serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = C.ink; X.fillText('TRAVEL  AGENT', 960, fy + 98); X.globalAlpha = 1; }
  const mound = PE(960, H + 60, 1300, 120 + 120 * p); fillP(mound, '#fbfbf6'); iE(960, H + 60, 1300, 120 + 120 * p, 0, C.ink, 2, 1, false, 1, Math.PI, TAU);
  snowFlakes(700, T, '#ffffff', .95, 4); X.fillStyle = C.ink; X.globalAlpha = .35; const r = M32(77); for (let i = 0; i < 700; i++) { const x0 = r() * W, sp = 40 + r() * 80, y = ((r() * H + T * sp) % (H + 40)) - 20; X.fillRect(x0 + Math.sin(T * 1.3 + i) * 20 - .5, y - .5, 1, 1); } X.globalAlpha = 1;
} };
