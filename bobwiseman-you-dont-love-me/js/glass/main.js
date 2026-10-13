// Look: stained glass, verse 3 + outro (151.0-233.04). Pure function of song time t.
// One place, the window, moving forward: out of the teacup roundel (v3-portal.js) -> L0 (spell) -> L1 (heart)
// -> L2 (desert) -> L3 (king) -> pull back -> night -> still image; Bob from Satisfied Mind walks across the nave
// floor with his piano and Junos (outro-bob.js), then a short fade to black.
const out = document.getElementById('c'); out.width = W; out.height = H;
const g = out.getContext('2d');

// Camera keys: [t, x, y, scale]; eased between consecutive keys.
const CAM = [
  [PORTAL.t1, lcx(0), 1010, 1.5], // before this the pull-back out of the teacup roundel (camAt)
  [153.8, lcx(0), 1040, 1.58],
  [156.9, lcx(0), 1080, 1.66],
  [159.3, lcx(0) + 60, 1090, 1.64],
  [161.9, lcx(1), 1080, 1.6],
  [163.0, lcx(1), 1110, 1.68],
  [167.6, lcx(1), 1180, 1.9],
  [170.5, lcx(1) + 30, 1260, 1.9],
  [173.4, lcx(2), 1320, 1.5],
  [177.4, lcx(2), 1360, 1.62],
  [181.9, lcx(2) + 10, 1210, 1.36],
  [184.4, lcx(3), 1250, 1.38],
  [190.6, lcx(3) - 20, 1290, 1.5],
  [191.6, lcx(3) - 30, 1290, 1.5],
  [199.0, WIN_W / 2, 1560, .385],
  [215.0, WIN_W / 2, 1600, .37],
  [B.still, WIN_W / 2, 1630, .352], // outro: a last slow drift back, then rest
];
function camAt(t) {
  if (t < PORTAL.t1) { // pull back out of the roundel: fast at the cut, easing onto her (reverse of verse 2's push)
    const k = CAM[0], u = lin(t, PORTAL.t0, PORTAL.t1), v = 1 - u, e = 1 - v * v * (2.2 - 1.2 * v);
    const s = Math.exp(lerp(Math.log(RC.sF), Math.log(k[3]), e)), f = (k[3] / s) * e;
    return { x: RC.x + (k[1] - RC.x) * f, y: RC.y + (k[2] - RC.y) * f, s };
  }
  let i = 0; while (i + 2 < CAM.length && CAM[i + 1][0] <= t) i++;
  const a = CAM[i], b = CAM[i + 1], u = ease(t, a[0], b[0]);
  // scale eased in log space so pull-backs feel even
  const c = { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), s: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)) };
  // handheld-free, but a small jolt on the crack and on the glue failing
  for (const [t0, amp] of [[B.crack, 16], [B.bk3, 7]]) {
    const k = t - t0; if (k > 0 && k < .5) { const d = amp * (1 - k / .5); c.x += Math.sin(k * 70) * d; c.y += Math.cos(k * 53) * d * .7; }
  }
  return c;
}

// Light. Each lancet glows brightest while its line is sung; the whole window goes day -> golden -> dusk -> night at the end.
const ACTIVE = [[149.5, 160.6], [160.6, 171.4], [171.4, 183.2], [183.2, 191.6]];
function lancetLit(i, t) {
  const [a, b] = ACTIVE[i], on = ease(t, a - 1, a + .4) * (1 - ease(t, b - .3, b + 1.0));
  return Math.max(.42 + .58 * on, ease(t, 191.6, 195.5));
}
const TOD = [[0, [255, 252, 244], 1], [194.5, [255, 252, 244], 1], [199.5, [255, 196, 128], .95], [204.5, [210, 100, 120], .68], [209.5, [70, 84, 150], .3], [215, [60, 72, 140], .24], [217.2, [76, 90, 166], .3]]; // outro: a little moonlight (world time stops near 217.2)
function todAt(t) {
  let i = 0; while (i + 2 < TOD.length && TOD[i + 1][0] <= t) i++;
  const a = TOD[i], b = TOD[i + 1], u = smooth(lin(t, a[0], b[0]));
  return { col: mix(a[1], b[1], u), I: lerp(a[2], b[2], u), night: smooth(lin(t, 203, 210)) };
}

// Backdrop behind the glass (seen where panes have fallen out): daylight, then a night sky with a few stars.
function backdrop(g, i, tod, view) {
  g.fillStyle = rgb(mix([250, 246, 230], C.night, tod.night)); g.fill(GEO[i].open);
  if (tod.night > .05) for (let k = 0; k < 26; k++) {
    const x = lx(i) + rnd(i, k, 1) * LW, y = 200 + rnd(i, k, 2) * 1900, r = 2 + rnd(i, k, 3) * 4;
    g.fillStyle = `rgba(240,240,255,${tod.night * (.5 + .5 * rnd(i, k, 4))})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
}
function drawLancet(g, i, t, view, tod) {
  g.save(); g.clip(GEO[i].open);
  backdrop(g, i, tod, view);
  g.save(); g.clip(GEO[i].field); SCENES[i](g, t, view); g.restore();
  drawBorder(g, i, t, view);
  g.restore();
}
function drawGlassWorld(g, t, cam, opts = {}) {
  const s = cam.s;
  g.setTransform(s, 0, 0, s, W / 2 - cam.x * s, H / 2 - cam.y * s);
  const view = { x0: cam.x - W / 2 / s, x1: cam.x + W / 2 / s, y0: cam.y - H / 2 / s, y1: cam.y + H / 2 / s };
  const tod = todAt(t);
  for (let i = 0; i < NL; i++) if (lx(i) + LW > view.x0 && lx(i) < view.x1) drawLancet(g, i, t, view, tod);
  // glass texture (world-anchored), then the light through each lancet
  const all = new Path2D(); for (let i = 0; i < NL; i++) all.addPath(GEO[i].open);
  g.save(); g.clip(all);
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .6; g.fillStyle = texPattern(g); g.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'multiply';
  for (let i = 0; i < NL; i++) {
    const L = (opts.flat ? 1 : lancetLit(i, t)) * tod.I;
    g.fillStyle = rgb(tod.col.map((v) => v * L)); g.fill(GEO[i].open);
  }
  // a slow sunbeam hotspot drifting across the active lancet
  g.globalCompositeOperation = 'screen';
  for (let i = 0; i < NL; i++) {
    const L = lancetLit(i, t) * tod.I; if (L < .5 || opts.flat) continue;
    const hx = lcx(i) + Math.sin(t * .35 + i) * 220, hy = 1000 + Math.cos(t * .27 + i * 2) * 300;
    const rg = g.createRadialGradient(hx, hy, 0, hx, hy, 700); rg.addColorStop(0, `rgba(255,240,210,${.22 * (L - .4)})`); rg.addColorStop(1, 'rgba(255,240,210,0)');
    g.fillStyle = rg; g.fillRect(hx - 700, hy - 700, 1400, 1400);
  }
  g.restore();
  return { view, tod };
}

// The window's light on the floor, from a low-res copy of the glass made once at load.
let POOL = null;
function buildPool() {
  const s = .1, c = mkCanvas(Math.round(WIN_W * s), Math.round((YB - 120) * s)), x = c.getContext('2d');
  const tod = todAt(150), view = { x0: -100, x1: WIN_W + 100, y0: 0, y1: YB + 100 };
  x.setTransform(s, 0, 0, s, 0, -120 * s);
  for (let i = 0; i < NL; i++) drawLancet(x, i, 172.0 + i * 3, view, tod);
  POOL = c;
}
// Affine map window (x, y) -> floor: the top of the window lands nearest us, sheared by a low sun on the left.
const PM = [1, 0, -.28, -.42, 560, FLOOR_Y + 60 + .42 * YB];
function poolXY(x, y) { return [PM[0] * x + PM[2] * y + PM[4], PM[1] * x + PM[3] * y + PM[5]]; }
function drawPool(g, view, tod, t) {
  if (view.y1 < FLOOR_Y) return;
  const L = tod.I * (1 - tod.night * .85);
  g.save();
  const fl = new Path2D(); fl.rect(view.x0 - 50, FLOOR_Y + 10, view.x1 - view.x0 + 100, view.y1 - FLOOR_Y + 50); g.clip(fl);
  g.globalCompositeOperation = 'screen';
  // light shafts from each lancet down to its patch
  for (let i = 0; i < NL; i++) {
    const [ax, ay] = poolXY(lx(i), 260), [bx, by] = poolXY(lx(i) + LW, 260);
    const lg = g.createLinearGradient(0, FLOOR_Y, 0, ay); lg.addColorStop(0, `rgba(255,236,200,${.05 * L})`); lg.addColorStop(1, `rgba(255,236,200,${.12 * L})`);
    g.fillStyle = lg; g.beginPath(); g.moveTo(lx(i), FLOOR_Y); g.lineTo(lx(i) + LW, FLOOR_Y); g.lineTo(bx, by); g.lineTo(ax, ay); g.closePath(); g.fill();
  }
  g.transform(PM[0], PM[1], PM[2], PM[3], PM[4], PM[5]);
  g.globalAlpha = .75 * L; g.filter = 'blur(3px)';
  g.drawImage(POOL, 0, 120, WIN_W, YB - 120);
  g.restore(); g.filter = 'none';
  // the floor takes the colour of the hour
  g.save(); g.clip(fl); g.globalCompositeOperation = 'multiply'; g.fillStyle = rgb(tod.col); g.fillRect(view.x0, FLOOR_Y, view.x1 - view.x0, view.y1 - FLOOR_Y); g.restore();
}
// Light shafts from the window toward us in the close shots: soft diagonal bands with dust in them.
function drawShafts(g, t, tod, fade = 1) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen';
  const L = tod.I * (1 - tod.night) * fade;
  for (let k = 0; k < 3; k++) {
    const x = 300 + k * 620 + Math.sin(t * .2 + k) * 80, w = 160 + 80 * rnd(k, 91);
    const lg = g.createLinearGradient(x, 0, x + 700, H); lg.addColorStop(0, `rgba(255,240,215,${.06 * L})`); lg.addColorStop(1, 'rgba(255,240,215,0)');
    g.fillStyle = lg; g.beginPath(); g.moveTo(x, -10); g.lineTo(x + w, -10); g.lineTo(x + w + 650, H + 10); g.lineTo(x + 650, H + 10); g.closePath(); g.fill();
  }
  for (let k = 0; k < 60; k++) { // dust motes
    const x = ((rnd(k, 92) * W + t * (8 + rnd(k, 93) * 18) + 40 * Math.sin(t * .3 + k)) % W + W) % W;
    const y = ((rnd(k, 94) * H + t * (5 + rnd(k, 95) * 9) + 30 * Math.cos(t * .23 + k * 2)) % H + H) % H;
    const a = (.15 + .35 * rnd(k, 96)) * (.5 + .5 * Math.sin(t * 1.3 + k)) * L;
    g.fillStyle = `rgba(255,246,225,${a})`; g.beginPath(); g.arc(x, y, 1.2 + rnd(k, 97) * 2.2, 0, TAU); g.fill();
  }
  g.restore();
}

// Bloom: a soft halo from a tiny copy of the frame.
const BL1 = mkCanvas(240, 135), BL2 = mkCanvas(60, 34), bl1 = BL1.getContext('2d'), bl2 = BL2.getContext('2d');
function bloom(g, amt) {
  bl1.imageSmoothingQuality = 'high'; bl1.drawImage(out, 0, 0, 240, 135); bl2.drawImage(BL1, 0, 0, 60, 34);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen'; g.imageSmoothingQuality = 'high';
  g.globalAlpha = .22 * amt; g.drawImage(BL1, 0, 0, W, H); g.globalAlpha = .3 * amt; g.drawImage(BL2, 0, 0, W, H); g.restore();
}

// ---------------- the daisy roundel (the running device) ----------------
// Same design and screen place as verse 1 and 2 (v2-main.js): 27 thin ray petals (39 x 6.2 at radius 64, lead 4.5),
// dropped clockwise from the top. 19 are gone before verse 3; 20-27 drop here, the 27th on the held phrase's "me".
// At the cut it swings down into frame from where verse 2's push-in sent it (top right), as the camera pulls back past it.
const NPET = 27, PREGONE = 19;
function drawDaisy(g, t, tod, rt) { // t = world time (slowed in the outro), rt = real song time
  const pass = 1 - smooth(lin(rt, PORTAL.t0, PORTAL.t0 + .8));
  const ax = 1800 + 520 * pass, ay = -10 - 900 * pass * pass, sc = 1 + 1.4 * pass;
  const calm = 1 - ease(rt, B.tail, B.still); // the outro: the roundel stops swaying
  const len = 238 + 4 * Math.sin(t * .9) * calm;
  const sw = calm * (.05 * Math.sin(t * .8) + .03 * Math.sin(t * 1.9 + 1)) + DROPS.reduce((s, d) => s + (t > d ? .05 * Math.exp(-(t - d) * 2.2) * Math.sin((t - d) * 9) : 0), 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = lin(rt, PORTAL.t0 + .03, PORTAL.t0 + .3); g.translate(ax, ay); g.scale(sc, sc); g.rotate(sw);
  const L = .35 + .65 * tod.I;
  g.strokeStyle = '#1a1612'; g.lineWidth = 4;
  for (let y = 0; y < len - 120; y += 22) { g.beginPath(); g.ellipse(0, y + 11, (y / 22) % 2 ? 3 : 7, 10, 0, 0, TAU); g.stroke(); }
  g.translate(0, len);
  const lit = (c) => mix([0, 0, 0], c.map((v, k) => v * tod.col[k] / 255), L);
  pane(g, circPath(0, 0, 118), lit(C.gold), 1, { ew: 12, lw: 7 });
  pane(g, circPath(0, 0, 104), lit([120, 170, 214]), 2, { ew: 30, lw: 7 });
  for (let k = 0; k < NPET; k++) {
    const a = -Math.PI / 2 + k * TAU / NPET, p = ellPath(Math.cos(a) * 64, Math.sin(a) * 64, 39, 6.2, a);
    const di = k - PREGONE, dt = di < 0 ? 99 : di < DROPS.length ? t - DROPS[di] : -1;
    if (dt < 0) { pane(g, p, lit(C.white), 10 + k, { ew: 6, lw: 4.5, amt: .4 }); continue; }
    g.fillStyle = 'rgba(16,18,28,.92)'; g.fill(p); lead(g, p, 4.5);
    if (dt < .5) { g.fillStyle = `rgba(255,250,220,${.8 * (1 - dt / .5)})`; g.fill(p); }
    if (dt < 1.9) { // the fall starts in its slot, where the Pip's fingers hold it (pip-plucker.js)
      const [fx, fy, fr] = plkFall(k, a, sw, dt);
      g.save(); g.rotate(-sw); g.translate(fx, fy);
      g.rotate(fr); g.globalAlpha *= 1 - lin(dt, 1.3, 1.9);
      pane(g, ellPath(0, 0, 39, 6.2), lit(C.white), 10 + k, { ew: 6, lw: 4.5, amt: .4 });
      g.restore();
    }
  }
  probeDrops(rt, DROPS, PREGONE, PREGONE, worldT);
  pane(g, circPath(0, 0, 25), lit(C.gold), 3, { ew: 10, lw: 7 });
  g.fillStyle = 'rgba(60,30,10,.7)'; for (let k = 0; k < 7; k++) { const a = k * TAU / 7; g.beginPath(); g.arc(Math.cos(a) * 12, Math.sin(a) * 12, 2.6, 0, TAU); g.fill(); }
  drawPipPlucker(g, t, sw, tod, DROPS, PREGONE); // the Pip who plucks them (pip-plucker.js)
  g.restore();
}

// World time: real time until the tail, then it slows to a stop (the window, the scenes, the daisy freeze into a
// still image by ~224) while the grain keeps running.
function worldT(t) { const a = 215.0, T = 2.2; return t <= a ? t : a + T * (1 - Math.exp(-(t - a) / T)); }

function renderFrame(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const rt = t; t = worldT(rt);
  const cam = camAt(rt);
  const { view, tod } = drawGlassWorld(g, t, cam);
  const wallL = .55 * tod.I + .1;
  drawWall(g, view, wallL);
  drawFloor(g, view, wallL, tod);
  drawPool(g, view, tod, t);
  // the outro cameo: moonlight on the floor and Bob crossing it (nothing is drawn before OB.in)
  if (rt >= OB.in) { OUTRO_BOB.drawPool(g, view, rt); OUTRO_BOB.draw(g, rt, cam); }
  // the church light comes back as we leave the roundel (the bridge's frame is flat: no bloom, shafts, vignette)
  const fin = 1 - smooth(lin(rt, PORTAL.t0, PORTAL.t0 + .75));
  bloom(g, tod.I * (1 - .7 * fin));
  drawShafts(g, t, tod, 1 - fin);
  drawDaisy(g, t, tod, rt);
  // vignette + grain
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .65); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${.5 * (1 - fin)})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  drawGrain(g, rt, .12 * (1 - .5 * fin));
  // the end: once the last Juno has rattled out of frame, a short fade to black, black to the last frame
  const fade = smooth(lin(rt, B.fade0, B.fade1));
  if (fade > 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = `rgba(0,0,0,${fade})`; g.fillRect(0, 0, W, H); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

buildGeo(); buildScenes(); buildTex(); buildPool();
startPage(out, renderFrame, B.T0, B.T1, document.fonts ? document.fonts.ready : Promise.resolve(true));
