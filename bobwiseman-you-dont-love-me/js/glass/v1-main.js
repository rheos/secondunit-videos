// Look: stained glass, INTRO + VERSE 1 (song 0.0-71.7, rendered 0-72.5). Pure function of song time t.
// Intro: a dark nave at dawn, the window's colour pools crawl over the floor, pillars pass, tilt up to the
// whole window as the light sweeps up the glass, push in to lancet 1. Verse 1: one lancet per sung line,
// then the spell turns the whole window into spinning leaded rings and lets go.
// Copies of main.js helpers live here under v1 names (main.js itself is not loaded).
const v1out = document.getElementById('c'); v1out.width = W; v1out.height = H;
const v1g = v1out.getContext('2d');

// Camera keys: [t, x, y, scale]
const V1CAM = [
  [0.0, 2380, 3060, 1.04],
  [12.6, 1720, 3010, 1.0],
  [13.2, 1700, 2990, .98],
  [18.0, 1900, 1300, .44],
  [18.9, 1880, 1290, .45],
  [22.3, 470, 1235, 1.72],
  [24.6, 540, 1225, 1.62],
  [26.1, 600, 1110, 1.48],
  [27.8, 610, 1120, 1.48],
  [30.8, 660, 1160, 1.40],
  [33.2, 1430, 1240, 1.42],
  [36.4, 1470, 1180, 1.42],
  [37.8, 1520, 1300, 1.26],
  [41.6, 1540, 1320, 1.22],
  [44.5, 2420, 1840, 1.25],
  [46.3, 2290, 1080, 1.55],
  [48.6, 2252, 925, 2.85],
  [50.8, 2252, 925, 2.85],
  [53.6, 2340, 1160, 1.26],
  [55.3, 3250, 1260, 1.3],
  [58.4, 3250, 1300, 1.12],
  [60.7, 3250, 1320, .98],
  [63.6, 1900, 1270, .43],
  [69.0, 1900, 1250, .47],
  [70.2, 2500, 1220, .6],
  [72.5, 5300, 1090, 1.38],
];
function v1Cam(t) {
  let i = 0; while (i + 2 < V1CAM.length && V1CAM[i + 1][0] <= t) i++;
  const a = V1CAM[i], b = V1CAM[i + 1], u = ease(t, a[0], b[0]);
  return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), s: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)) };
}

// Light: dawn through the intro; each lancet brightest while its line is sung; all lit for the spell.
const V1ACTIVE = [[22.0, 33.4], [33.4, 44.5], [44.5, 55.3], [55.3, 60.7]];
function v1Lit(i, t) {
  const [a, b] = V1ACTIVE[i], on = ease(t, a - 1, a + .4) * (1 - ease(t, b - .3, b + 1.0));
  const intro = 1 - ease(t, 20.5, 22.5);
  return Math.max(.42 + .58 * on, ease(t, 60.0, 62.5), intro);
}
const V1TOD = [[0, [70, 92, 170], .05], [2.5, [84, 98, 176], .14], [7.5, [236, 150, 120], .52], [13.5, [255, 214, 170], .86], [22, [255, 246, 232], 1], [72.5, [255, 250, 240], 1]];
function v1Tod(t) {
  let i = 0; while (i + 2 < V1TOD.length && V1TOD[i + 1][0] <= t) i++;
  const a = V1TOD[i], b = V1TOD[i + 1], u = smooth(lin(t, a[0], b[0]));
  return { col: mix(a[1], b[1], u), I: lerp(a[2], b[2], u), night: 0 };
}
// The light sweeping up the glass as the sun clears the far wall (intro only): rows below the line are lit.
function v1SweepY(t) { return lerp(YB + 200, -400, ease(t, 2.2, 18.5)); }

function v1Backdrop(g, i) { g.fillStyle = 'rgb(246,242,228)'; g.fill(GEO[i].open); }
function v1DrawLancet(g, i, t, view) { // backdrop + picture (clipped to the field); borders come later
  g.save(); g.clip(GEO[i].open); v1Backdrop(g, i);
  g.save(); g.clip(GEO[i].field); V1SCENES[i](g, t, view); g.restore();
  g.restore();
}
function v1Borders(g, t, view) { for (let i = 0; i < NL; i++) if (lx(i) + LW > view.x0 && lx(i) < view.x1) { g.save(); g.clip(GEO[i].open); drawBorder(g, i, t, view); g.restore(); } }

// The spell's rings: the picture inside the window turns in concentric leaded rings, each by its own angle.
const V1TW = mkCanvas(W, H), v1tw = V1TW.getContext('2d');
function v1RingAmt(t) { return ease(t, V1.lead1 + .1, V1.lead1 + 1.8) * (1 - ease(t, V1.unwind, V1.unwind + 1.3)); }
function v1Rings(g, t, cam) {
  const A = v1RingAmt(t); if (A <= 0.001) return;
  const s = cam.s, el = t - V1.lead1, N = 36, R = (LW / 2 - BORD - 6) * s, dr = R / N;
  v1tw.setTransform(1, 0, 0, 1, 0, 0); v1tw.clearRect(0, 0, W, H); v1tw.drawImage(g.canvas, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 3; i++) { // L0-L2 spin as discs; L3 has its own spiral
    const cx = W / 2 + (lcx(i) - cam.x) * s, cy = H / 2 + (1350 - cam.y) * s;
    if (cx + R < 0 || cx - R > W || cy + R < 0 || cy - R > H) continue;
    for (let k = 0; k < N; k++) {
      const r0 = k * dr, r1 = (k + 1) * dr, f = 1 - (k + .5) / N, band = Math.floor(k / 9), dir = (band + i) % 2 ? 1 : -1;
      const ang = A * (3.0 * Math.pow(f, 1.4) + dir * (.35 + .15 * rnd(band, i, 7)) * el);
      g.save(); const ring = new Path2D(); ring.arc(cx, cy, r1 + .6, 0, TAU); if (k) ring.arc(cx, cy, r0, 0, TAU, true); g.clip(ring);
      g.translate(cx, cy); g.rotate(ang); g.translate(-cx, -cy); g.drawImage(V1TW, 0, 0); g.restore();
    }
    g.strokeStyle = `rgba(20,16,13,${Math.min(1, A * 1.5)})`; g.lineWidth = Math.max(2.5, 10 * s);
    for (let b = 1; b <= N / 9; b++) { g.beginPath(); g.arc(cx, cy, b * 9 * dr, 0, TAU); g.stroke(); }
  }
  g.restore();
}

function v1GlassWorld(g, t, cam, opts = {}) {
  const s = cam.s;
  g.setTransform(s, 0, 0, s, W / 2 - cam.x * s, H / 2 - cam.y * s);
  const view = { x0: cam.x - W / 2 / s, x1: cam.x + W / 2 / s, y0: cam.y - H / 2 / s, y1: cam.y + H / 2 / s };
  const tod = opts.tod || v1Tod(t);
  if (view.y0 < YB + 60) {
    for (let i = 0; i < NL; i++) if (lx(i) + LW > view.x0 && lx(i) < view.x1) v1DrawLancet(g, i, t, view);
    if (!opts.noRings) v1Rings(g, t, cam);
    g.setTransform(s, 0, 0, s, W / 2 - cam.x * s, H / 2 - cam.y * s);
    v1Borders(g, t, view);
    if (lx(3) + LW > view.x0 && lx(3) < view.x1) { g.save(); g.clip(GEO[3].field); v1Spell3Figure(g, t); g.restore(); }
    const all = new Path2D(); for (let i = 0; i < NL; i++) all.addPath(GEO[i].open);
    g.save(); g.clip(all);
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .6; g.fillStyle = texPattern(g); g.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'multiply';
    for (let i = 0; i < NL; i++) { const L = (opts.flat ? 1 : v1Lit(i, t)) * tod.I; g.fillStyle = rgb(tod.col.map((v) => v * L)); g.fill(GEO[i].open); }
    if (!opts.flat && t < 21) { // the sunrise line climbing the glass
      const sy = v1SweepY(t), lg = g.createLinearGradient(0, sy - 500, 0, sy + 300);
      lg.addColorStop(0, 'rgb(40,40,60)'); lg.addColorStop(1, 'rgb(255,255,255)');
      g.fillStyle = lg; g.fillRect(view.x0, view.y0, view.x1 - view.x0, view.y1 - view.y0);
    }
    g.globalCompositeOperation = 'screen';
    for (let i = 0; i < NL; i++) {
      const L = v1Lit(i, t) * tod.I; if (L < .5 || opts.flat) continue;
      const hx = lcx(i) + Math.sin(t * .35 + i) * 220, hy = 1100 + Math.cos(t * .27 + i * 2) * 300;
      const rg = g.createRadialGradient(hx, hy, 0, hx, hy, 700); rg.addColorStop(0, `rgba(255,240,210,${.2 * (L - .4)})`); rg.addColorStop(1, 'rgba(255,240,210,0)');
      g.fillStyle = rg; g.fillRect(hx - 700, hy - 700, 1400, 1400);
    }
    g.restore();
  }
  return { view, tod };
}

// The window's light on the floor, from a low-res copy of the glass made once at load.
let V1POOL = null;
let V1_POOLING = false;
function v1BuildPool() {
  V1_POOLING = true;
  const s = .1, c = mkCanvas(Math.round(WIN_W * s), Math.round((YB - 120) * s)), x = c.getContext('2d');
  const view = { x0: -100, x1: WIN_W + 100, y0: 0, y1: YB + 100 }, tt = [24.5, 38.2, 44.0, 55.0];
  x.setTransform(s, 0, 0, s, 0, -120 * s);
  for (let i = 0; i < NL; i++) { v1DrawLancet(x, i, tt[i], view); x.save(); x.clip(GEO[i].open); drawBorder(x, i, 0, view); x.restore(); }
  x.save(); x.clip(GEO[3].field); v1Spell3Figure(x, 55.0); x.restore();
  V1POOL = c; V1_POOLING = false;
}
// Window (x, y) -> floor. As the sun climbs the pools shorten and crawl toward the wall and across the flags.
function v1PM(t) {
  const u = ease(t, 1, 22), k = lerp(.66, .4, u), sh = lerp(-.62, -.24, u), off = lerp(1350, 120, u);
  return [1, 0, sh, -k, off, FLOOR_Y + 60 + k * YB];
}
function v1Pool(g, view, tod, t) {
  if (view.y1 < FLOOR_Y) return;
  const PMt = v1PM(t), L = tod.I, P = (x, y) => [PMt[0] * x + PMt[2] * y + PMt[4], PMt[1] * x + PMt[3] * y + PMt[5]];
  g.save();
  const fl = new Path2D(); fl.rect(view.x0 - 50, FLOOR_Y + 10, view.x1 - view.x0 + 100, view.y1 - FLOOR_Y + 50); g.clip(fl);
  g.globalCompositeOperation = 'screen';
  for (let i = 0; i < NL; i++) { // dusty light from each lancet down to its patch
    const [ax, ay] = P(lx(i), 260), [bx, by] = P(lx(i) + LW, 260);
    const lg = g.createLinearGradient(0, FLOOR_Y, 0, ay); lg.addColorStop(0, `rgba(255,236,200,${.05 * L})`); lg.addColorStop(1, `rgba(255,236,200,${.12 * L})`);
    g.fillStyle = lg; g.beginPath(); g.moveTo(lx(i), FLOOR_Y); g.lineTo(lx(i) + LW, FLOOR_Y); g.lineTo(bx, by); g.lineTo(ax, ay); g.closePath(); g.fill();
  }
  g.transform(PMt[0], PMt[1], PMt[2], PMt[3], PMt[4], PMt[5]);
  // the sunrise line climbs the glass, so the pool fills in from the window's bottom row to its top
  const sy = v1SweepY(t);
  if (sy < YB) { g.beginPath(); g.rect(0, Math.max(120, sy - 100), WIN_W, YB); g.clip(); }
  else { g.beginPath(); g.rect(0, 0, 0, 0); g.clip(); }
  g.globalAlpha = .85 * L; g.filter = 'blur(2px)';
  g.drawImage(V1POOL, 0, 120, WIN_W, YB - 120);
  g.restore(); g.filter = 'none';
  g.save(); g.clip(fl); g.globalCompositeOperation = 'multiply'; g.fillStyle = rgb(tod.col); g.fillRect(view.x0, FLOOR_Y, view.x1 - view.x0, view.y1 - FLOOR_Y); g.restore();
}
// Foreground pillars of the nave sliding past in the intro (dark, out of focus, rim-lit by the window).
function v1Pillars(g, t, cam, tod) {
  const a = 1 - ease(t, 12.6, 14.2); if (a <= 0) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  for (const [px, w] of [[2950, 300], [2050, 340]]) {
    const x = W / 2 + (px - cam.x) * cam.s * 1.9; if (x < -w || x > W + w) continue;
    const lg = g.createLinearGradient(x - w / 2 - 40, 0, x + w / 2 + 40, 0);
    const rim = rgb(mix([0, 0, 0], tod.col, .35 * tod.I), 1);
    lg.addColorStop(0, 'rgba(4,3,3,0)'); lg.addColorStop(.12, 'rgba(4,3,3,.97)'); lg.addColorStop(.8, 'rgba(6,5,5,.97)'); lg.addColorStop(.9, rim); lg.addColorStop(1, 'rgba(4,3,3,0)');
    g.fillStyle = lg; g.fillRect(x - w / 2 - 40, -10, w + 80, H + 20);
  }
  g.restore();
}
function v1Shafts(g, t, tod) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen';
  const L = tod.I, boost = 1 + 1.4 * (1 - ease(t, 14, 20));
  for (let k = 0; k < 3; k++) {
    const x = 300 + k * 620 + Math.sin(t * .2 + k) * 80, w = 160 + 80 * rnd(k, 91);
    const lg = g.createLinearGradient(x, 0, x + 700, H); lg.addColorStop(0, `rgba(255,232,200,${.06 * L * boost})`); lg.addColorStop(1, 'rgba(255,240,215,0)');
    g.fillStyle = lg; g.beginPath(); g.moveTo(x, -10); g.lineTo(x + w, -10); g.lineTo(x + w + 650, H + 10); g.lineTo(x + 650, H + 10); g.closePath(); g.fill();
  }
  for (let k = 0; k < 80; k++) {
    const x = ((rnd(k, 92) * W + t * (8 + rnd(k, 93) * 18) + 40 * Math.sin(t * .3 + k)) % W + W) % W;
    const y = ((rnd(k, 94) * H + t * (5 + rnd(k, 95) * 9) + 30 * Math.cos(t * .23 + k * 2)) % H + H) % H;
    const a = (.15 + .35 * rnd(k, 96)) * (.5 + .5 * Math.sin(t * 1.3 + k)) * Math.max(L, .15) * boost * .8;
    g.fillStyle = `rgba(255,246,225,${a})`; g.beginPath(); g.arc(x, y, 1.2 + rnd(k, 97) * 2.2, 0, TAU); g.fill();
  }
  g.restore();
}
const V1BL1 = mkCanvas(240, 135), V1BL2 = mkCanvas(60, 34), v1bl1 = V1BL1.getContext('2d'), v1bl2 = V1BL2.getContext('2d');
function v1Bloom(g, amt) {
  v1bl1.imageSmoothingQuality = 'high'; v1bl1.drawImage(v1out, 0, 0, 240, 135); v1bl2.drawImage(V1BL1, 0, 0, 60, 34);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'screen'; g.imageSmoothingQuality = 'high';
  g.globalAlpha = .22 * amt; g.drawImage(V1BL1, 0, 0, W, H); g.globalAlpha = .3 * amt; g.drawImage(V1BL2, 0, 0, W, H); g.restore();
}

// ---------------- the daisy roundel (same design and place as verse 3) ----------------
// 27 thin white petals for the whole song, full in the intro; verse 1 drops 1-10 (V1_DROPS).
const V1NPET = 27;
const V1PET_ORDER = [...Array(V1NPET).keys()]; // drop order: clockwise from the top (same as verse 2)
function v1Daisy(g, t, tod) {
  const ax = 1800, ay = -10, len = 238 + 4 * Math.sin(t * .9);
  const sw = .05 * Math.sin(t * .8) + .03 * Math.sin(t * 1.9 + 1) + V1_DROPS.reduce((s, d) => s + (t > d ? .05 * Math.exp(-(t - d) * 2.2) * Math.sin((t - d) * 9) : 0), 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.translate(ax, ay); g.rotate(sw);
  const L = .35 + .65 * tod.I;
  g.strokeStyle = '#1a1612'; g.lineWidth = 4;
  for (let y = 0; y < len - 120; y += 22) { g.beginPath(); g.ellipse(0, y + 11, (y / 22) % 2 ? 3 : 7, 10, 0, 0, TAU); g.stroke(); }
  g.translate(0, len);
  const lit = (c) => mix([0, 0, 0], c.map((v, k) => v * tod.col[k] / 255), L);
  pane(g, circPath(0, 0, 118), lit(C.gold), 1, { ew: 12, lw: 7 });
  pane(g, circPath(0, 0, 104), lit([120, 170, 214]), 2, { ew: 30, lw: 7 });
  const dropAt = {}; V1_DROPS.forEach((d, n) => { dropAt[V1PET_ORDER[n]] = d; });
  for (let k = 0; k < V1NPET; k++) {
    const a = -Math.PI / 2 + k * TAU / V1NPET, p = ellPath(Math.cos(a) * 64, Math.sin(a) * 64, 39, 6.2, a);
    const dt = dropAt[k] !== undefined ? t - dropAt[k] : -1;
    if (dt < 0) { pane(g, p, lit(C.white), 10 + k, { ew: 6, lw: 4.5, amt: .4 }); continue; }
    g.fillStyle = 'rgba(16,18,28,.92)'; g.fill(p); lead(g, p, 4.5);
    if (dt < .5) { g.fillStyle = `rgba(255,250,220,${.8 * (1 - dt / .5)})`; g.fill(p); }
    if (dt < 1.9) { // the fall starts in its slot, where the Pip's fingers hold it (pip-plucker.js)
      const [fx, fy, fr] = plkFall(k, a, sw, dt);
      g.save(); g.rotate(-sw); g.translate(fx, fy);
      g.rotate(fr); g.globalAlpha = 1 - lin(dt, 1.3, 1.9);
      pane(g, ellPath(0, 0, 39, 6.2), lit(C.white), 10 + k, { ew: 6, lw: 4.5, amt: .4 });
      g.restore();
    }
  }
  probeDrops(t, V1_DROPS, 0, 0);
  pane(g, circPath(0, 0, 25), lit(C.gold), 3, { ew: 10, lw: 7 });
  g.fillStyle = 'rgba(60,30,10,.7)'; for (let k = 0; k < 7; k++) { const a = k * TAU / 7; g.beginPath(); g.arc(Math.cos(a) * 12, Math.sin(a) * 12, 2.6, 0, TAU); g.fill(); }
  drawPipPlucker(g, t, sw, tod, V1_DROPS, 0); // the Pip who plucks them (pip-plucker.js)
  g.restore();
}

const V1DZ = mkCanvas(W, H), v1dz = V1DZ.getContext('2d'); // the daisy's own layer while the nave comes up from black
// Draft 12: the intro opens outside the church (v1-exterior.js). Before EX.mix0 only the outside is drawn; from
// EX.mix0 to EX.t1 the interior is drawn under the outside's camera and the outside dissolves off it, so the window
// (the same lancets in the same place) is what carries us in.
const V1EXC = mkCanvas(W, H), v1exc = V1EXC.getContext('2d');
function v1Render(t) {
  const g = v1g;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (t < EX.mix0) { v1RenderOutside(g, t); return; }
  const cam = t < EX.t1 ? exCam(t) : v1Cam(t);
  const { view, tod } = v1GlassWorld(g, t, cam);
  const wallL = .55 * tod.I + .08;
  drawWall(g, view, wallL);
  drawFloor(g, view, wallL, tod);
  v1Pool(g, view, tod, t);
  v1Bloom(g, tod.I);
  v1Shafts(g, t, tod);
  // up from black: the nave only. The Pips bring their own follow spot, so they are drawn over it (draft 8).
  const black = t < 3 ? 1 - ease(t, 0, 3) : 0;
  if (black > 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(0,0,0,${black})`; g.fillRect(0, 0, W, H); }
  // draft 12: no intro cameo (v1-pips.js is no longer drawn; Bob: "the first time we see them will be when they first
  // enter singing")
  v1Pillars(g, t, cam, tod);
  if (black > 0) { // the daisy still comes up out of the black with the nave
    v1dz.setTransform(1, 0, 0, 1, 0, 0); v1dz.clearRect(0, 0, W, H); v1Daisy(v1dz, t, tod);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - black; g.drawImage(V1DZ, 0, 0); g.restore();
  } else v1Daisy(g, t, tod);
  drawPipHeads(g, t, tod); // the refrains: the Pips stick their heads in (pip-heads.js)
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .65); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  if (t < EX.t1) { // the outside dissolving away around the window
    v1exc.setTransform(1, 0, 0, 1, 0, 0); v1exc.clearRect(0, 0, W, H); drawExterior(v1exc, t, cam); v1OutsideVignette(v1exc);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - ease(t, EX.mix0, EX.t1); g.drawImage(V1EXC, 0, 0); g.restore();
    v1Daisy(g, t, tod);
  }
  drawGrain(g, t, .12);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
// The outside (draft 12): church, up from black as the nave used to come up, the daisy on its own layer as before.
function v1OutsideVignette(g) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .65); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
function v1RenderOutside(g, t) {
  drawExterior(g, t, exCam(t)); v1OutsideVignette(g);
  const tod = v1Tod(t), black = t < 3 ? 1 - ease(t, 0, 3) : 0;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
  if (black > 0) { g.fillStyle = `rgba(0,0,0,${black})`; g.fillRect(0, 0, W, H); }
  if (black > 0) {
    v1dz.setTransform(1, 0, 0, 1, 0, 0); v1dz.clearRect(0, 0, W, H); v1Daisy(v1dz, t, tod);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - black; g.drawImage(V1DZ, 0, 0); g.restore();
  } else v1Daisy(g, t, tod);
  drawGrain(g, t, .12);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

buildGeo(); v1BuildScenes(); buildTex(); v1BuildPool();
startPage(v1out, v1Render, V1.T0, V1.T1, document.fonts ? document.fonts.ready : Promise.resolve(true));
