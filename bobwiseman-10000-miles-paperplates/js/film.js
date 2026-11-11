// 10,000 Miles chorus 1 in painted paper layers. Every picture is a painted layer (work/plates.js); every move is here.
// Two shots: 'rise' (the rocket rumbles on the rooftop, lifts on the first sung word, the camera climbs with it through
// cloud banks until a cloud sheet closes over the frame) and 'world' (the rocket tears through that sheet; below it the
// town is a small paper world that shrinks away; the rocket swoops down and circles it).
// Depth: each layer moves with the camera by its own factor d, and every sheet casts a soft shadow on the one behind,
// so the layers read as separate papers.
'use strict';
const IMG = {};
for (const [k, p] of Object.entries(typeof PLATES === 'object' ? PLATES : {})) {
  const im = new Image(); im.src = p.src; im.pw = p.w; im.ph = p.h; IMG[k] = im;
}
const T0 = 43.375, LIFT = 49.58, TEAR = 54.18, ORBIT = 58.96, END = 62.833;
const HOPS = [43.46, 45.42, 47.30];      // the rocket hops on the chorus's first three hits
const PAD_X = 1450, PAD_Y = 1012;        // where the rocket stands on the roof (screen, camera at rest)
const SHADOW = 'rgba(28,14,44,0.40)';

// ---------- drawing a painted sheet ----------
function sheet(k, x, y, w, o = {}) {      // top-left at x,y, width w; returns the drawn height
  const im = IMG[k]; if (!im || !im.pw) return 0;
  const h = o.h || w * im.ph / im.pw;
  X.save();
  if (o.shadow !== false) { X.shadowColor = o.shadowColor || SHADOW; X.shadowBlur = o.blur ?? 22; X.shadowOffsetX = o.dx ?? 5; X.shadowOffsetY = o.dy ?? 11; }
  if (o.alpha != null) X.globalAlpha = o.alpha;
  X.drawImage(im, x, y, w, h); X.restore(); return h;
}
function sprite(k, cx, cy, h, rot = 0, o = {}) { // centred on cx,cy (or on its bottom centre with o.base), height h
  const im = IMG[k]; if (!im || !im.pw) return;
  const w = h * im.pw / im.ph;
  X.save(); X.translate(cx, cy); X.rotate(rot); if (o.sx) X.scale(o.sx, o.sy || 1);
  if (o.shadow !== false) { X.shadowColor = SHADOW; X.shadowBlur = o.blur ?? 16; X.shadowOffsetX = 4; X.shadowOffsetY = 8; }
  if (o.alpha != null) X.globalAlpha = o.alpha;
  X.drawImage(im, -w / 2, o.base ? -h : (o.top ? 0 : -h / 2), w, h); X.restore();
}

// ---------- the climb ----------
function rise(t) { const u = Math.max(0, t - LIFT); return 260 * u * u + 70 * u; }      // rocket height above the pad, px
function camY(t) { const r = rise(t); return r - 650 * (1 - Math.exp(-r / 650)); }       // the camera lags, then follows
function hop(t) { let y = 0; for (const h of HOPS) { const s = (t - h) / 0.3; if (s > 0 && s < 1) y += 16 * Math.sin(Math.PI * s); } return y; }
function rocketX(t) { return lerp(PAD_X, 1080, eio(seg(t, LIFT + 0.4, LIFT + 3.6))); }

// a puff of smoke, born at ts at a world point; pure function of t and its index
function puff(i, ts, wx, wy, t, cy, big = 1) {
  const age = t - ts; if (age < 0 || age > 2.6) return;
  const r = M32(i * 7919 + 13), dir = (r() - .5) * 2, sz = (80 + 70 * r()) * big;
  const x = wx + dir * (40 + 90 * age), y = wy - 18 * age + cy;
  const h = sz * (0.45 + 0.9 * eo(age / 1.2)), a = 1 - cl((age - 1.3) / 1.3);
  sprite('puff', x, y, h, dir * 0.6 + age * dir * 0.3, { alpha: a, blur: 10 });
}
function puffs(t, cy) {
  let i = 0;
  for (const h of HOPS) for (let k = 0; k < 3; k++) puff(i++, h + k * 0.06, PAD_X + 40 * (k - 1), PAD_Y - 20, t, 0, 0.8);
  for (let ts = 48.6; ts < Math.min(t, TEAR); ts += 0.12) {          // ignition, then a trail from the nozzle
    const wy = PAD_Y - 10 - rise(ts);
    puff(i++, ts, rocketX(ts), wy, t, cy, ts < LIFT ? 1.1 : 1.35);
  }
}
function flameUnder(cx, nozzleY, len, rot = 0) {
  if (len <= 0) return;
  const fl = len * (0.86 + 0.28 * R());                               // flickers per drawing (on twos)
  sprite('flame', cx, nozzleY, fl, rot, { top: true, shadow: false, sx: 0.9 + 0.2 * R() });
}

function drawRise(t) {
  const cy = camY(t), lift = rise(t);
  sheet('sky', 0, 820 - 2880 + cy * 0.22, 1920, { h: 2880, shadow: false });
  sheet('hills', -140, 235 + cy * 0.38, 2200);
  sheet('cloud_warm', -240, -2050 + cy * 0.8, 2400);
  sheet('town', -190, 385 + cy * 0.6, 2300);
  const roofH = IMG.roof && IMG.roof.pw ? 2400 * IMG.roof.ph / IMG.roof.pw : 0;
  sheet('roof', -240, 1125 - roofH + cy, 2400);
  puffs(t, cy);
  // the rocket: rumble before lift-off, hops on the hits, then climbs; it stands on the roof, so it moves with d = 1
  const rh = 330, rx = rocketX(t) + (t < LIFT && t > 48.6 ? jit(3) : 0);
  const base = PAD_Y - hop(t) - lift + cy;
  const tilt = t > LIFT ? 0.10 * Math.sin((t - LIFT) * 1.7) * (1 - seg(t, LIFT + 3, TEAR)) - 0.12 * eio(seg(t, LIFT + 0.4, LIFT + 2)) * (1 - seg(t, LIFT + 2.5, LIFT + 3.8)) : 0;
  const ignite = t > 48.6 ? lerp(70, 120, seg(t, 48.6, LIFT)) : 0;
  const len = t < LIFT ? ignite : lerp(120, 300, eo(seg(t, LIFT, LIFT + 1)));
  X.save(); X.translate(rx, base); X.rotate(tilt);
  flameUnder(0, -8, len);
  sprite('rocket', 0, 0, rh, 0, { base: true });
  X.restore();
  sheet('cloud_cool', -300, -4050 + cy * 1.35, 2520);               // a nearer bank passes in front of the rocket
  // a cloud sheet closes over the frame; the rocket is behind it when the next shot tears it open
  const s = eio(seg(t, 53.15, 53.95));
  if (s > 0) sheet('cloud_sheet', -20, lerp(-1380, -60, s), 1960, { h: 1240, blur: 30, dy: 18 });
}

// ---------- the small world ----------
function worldAt(t) {
  const a = eo(seg(t, TEAR, ORBIT + 0.6)), b = eio(seg(t, ORBIT + 0.6, END));
  return { x: 960, y: lerp(lerp(1450, 600, a), 575, b), d: lerp(lerp(2300, 640, a), 580, b), rot: 0.035 * Math.sin((t - TEAR) * 1.3) };
}
const OMEGA = TAU / 3.4;
function orbitAt(t, wd) {
  const th = (t - ORBIT) * OMEGA, rx = wd.d * 0.76, ry = wd.d * 0.24;
  return { x: wd.x + rx * Math.cos(th), y: wd.y + ry * Math.sin(th), dx: -rx * Math.sin(th) * OMEGA, dy: ry * Math.cos(th) * OMEGA, near: Math.sin(th) };
}
function bez(a, b, c, d, u) { const v = 1 - u; return v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d; }
function rocketWorld(t, wd) {
  if (t >= ORBIT) { const o = orbitAt(t, wd); return { x: o.x, y: o.y, rot: Math.atan2(o.dy, o.dx) + Math.PI / 2, h: lerp(150, 175, (o.near + 1) / 2) * lerp(1, 0.78, (1 - o.near) / 2), near: o.near }; }
  const o = orbitAt(ORBIT, worldAt(ORBIT)), u = eio(seg(t, TEAR, ORBIT));
  const px = [960, 1260, o.x + 40, o.x], py = [600, 60, o.y - 380, o.y];
  const x = bez(...px, u), y = bez(...py, u), e = 0.01;
  const dx = bez(...px, Math.min(1, u + e)) - bez(...px, Math.max(0, u - e)), dy = bez(...py, Math.min(1, u + e)) - bez(...py, Math.max(0, u - e));
  return { x, y, rot: Math.atan2(dy, dx) + Math.PI / 2, h: lerp(300, 150, u), near: 1 };
}
function drawRocketAt(r, len) {
  X.save(); X.translate(r.x, r.y); X.rotate(r.rot);
  flameUnder(0, r.h * 0.46, len);
  sprite('rocket', 0, 0, r.h);
  X.restore();
}
// a jagged tear outline, fixed for the whole film so the torn edge holds still while it grows
const TEAR_N = 160, TEAR_JAG = (() => { const r = M32(4242), ph = [r() * TAU, r() * TAU, r() * TAU]; return Array.from({ length: TEAR_N }, (_, i) => { const a = (i / TEAR_N) * TAU; return [0.07 * Math.sin(3 * a + ph[0]) + 0.04 * Math.sin(7 * a + ph[1]) + 0.025 * Math.sin(17 * a + ph[2]), r()]; }); })();
function tearPath(ctx, cx, cy, rad, k) {
  ctx.beginPath();
  TEAR_JAG.forEach(([a, b], i) => {
    const th = (i / TEAR_N) * TAU, rr = rad * (1 + a) + (b - 0.5) * (6 + 0.012 * rad) + k * Math.sin(i * 1.9) * 4;
    i ? ctx.lineTo(cx + rr * Math.cos(th), cy + rr * 0.82 * Math.sin(th)) : ctx.moveTo(cx + rr * Math.cos(th), cy + rr * 0.82 * Math.sin(th));
  });
  ctx.closePath();
}
let TMP = null;
function drawWorld(t) {
  const wd = worldAt(t);
  sheet('night', -40, -60 - (t - TEAR) * 6, 2000, { h: 1300, shadow: false });
  const r = rocketWorld(t, wd), len = r.h * (t >= ORBIT ? 0.75 : 0.95);
  if (r.near < 0) drawRocketAt(r, len);                               // behind the world on the far side of its orbit
  // a warm glow round the little world, then the world itself, turning slowly
  const g = X.createRadialGradient(wd.x, wd.y, wd.d * 0.42, wd.x, wd.y, wd.d * 0.75);
  g.addColorStop(0, 'rgba(255,196,120,0.30)'); g.addColorStop(1, 'rgba(255,196,120,0)');
  X.fillStyle = g; X.fillRect(0, 0, W, H);
  sprite('world', wd.x, wd.y, wd.d, wd.rot, { blur: 34 });
  if (r.near >= 0) drawRocketAt(r, len);
  // the cloud sheet from the last shot, torn open from the middle where the rocket punches through
  const s = seg(t, TEAR, TEAR + 0.95);
  if (s < 1) {
    if (!TMP) { TMP = document.createElement('canvas'); TMP.width = W; TMP.height = H; }
    const c = TMP.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H);
    const im = IMG.cloud_sheet; if (im && im.pw) c.drawImage(im, -20, -60, 1960, 1240);
    const rad = 30 + 1500 * Math.pow(eo(s), 1.4);
    c.fillStyle = '#efe4cf'; tearPath(c, 960, 560, rad + 9 + 6 * s, 1.5); c.fill();   // the torn paper's pale core
    c.globalCompositeOperation = 'destination-out'; tearPath(c, 960, 560, rad, 0); c.fill();
    X.save(); X.shadowColor = SHADOW; X.shadowBlur = 30; X.shadowOffsetY = 16; X.drawImage(TMP, 0, 0); X.restore();
  }
}

function buildShots() {
  return [
    { t0: T0, t1: TEAR, mode: 'pp', key: 'rise', draw: () => drawRise(TNOW) },
    { t0: TEAR, t1: END + 2, mode: 'pp', key: 'world', draw: () => drawWorld(TNOW) },
  ];
}
