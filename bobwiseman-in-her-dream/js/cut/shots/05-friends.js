// 73.28-89.96  "In her dream her friends are alive and they're just down the street /
// & she knows she can see them later". A street of rowhouses, the end of the rose morning.
// The shot owns its way in: 04's halo (with her sky-head inside it) shrinks and sails into the street's
// low sun while the paper flats of the street rise up in their slots. She walks the near pavement;
// two old friends sit up on their stoop as pale tracing paper (lost to her), and on "alive" (a punch-in
// on the stoop) their own colour floods up into them. They stand, point to their door, wave her on;
// on "later" their round attic window lights gold and we push into it: it becomes 06's diner clock.
(() => {
const T = {
  a: 73.28, dream: wordAt('dream', 0, 75), friends: wordAt('friends', 0, 75), alive: wordAt('alive', 0, 75),
  theyre: wordAt("they're", 0, 75), just: wordAt('just', 0, 75), down: wordAt('down', 0, 75), street: wordAt('street', 0, 75),
  knows: wordAt('knows', 0, 75), can: wordAt('can', 0, 86), see: wordAt('see', 0, 75), them: wordAt('them', 0, 75), later: wordAt('later', 0, 75), b: 89.96,
};
const GROUND = 930, WALK_Y = 1012;         // facade line (stoop foot) and her pavement lane (nearer, lower)
const SHE = .56, FS = .46;                 // her scale; the friends' scale (set back on their stoop)
const STEP = 40, NSTEP = 4;                // the friends' stoop: four steps of 40
const FEET_F = GROUND - STEP;              // the friends' feet: on the first step
const plant = (s, h = 1) => 24 * s * h;   // puppet() feet sit ~24 units above y; this plants them

// rose family only (the ground); accents are navy (her), plum, teal, gold
const P = { skyTop: '#e29e93', skyMid: '#eeb7a3', skyLow: '#f6d5b3', far: '#d9958a', farWin: '#c98479',
  h1: '#b4605d', h2: '#a5524f', h3: '#d8958a', h4: '#ad5a57', win: '#7a3a45', sill: '#c97a72', pave: '#cd8077', kerb: '#a85a59', step: '#9c4f4d' };

// ---------- the seam from 04: its halo (centre, outer radius as drawn at 73.28) into our sun ----------
const HALO = { x: 1048, y: 421, r: 528 };
const SUN = { r: 168 };
const SEAM = { t0: T.a, t1: T.a + 1.08, fade: .4 };
const B04 = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; })();
function draw04(t) {
  const sh = SHOTS.find((s) => s.name === 'sky');
  if (!sh) return false;
  const keep = g, o = B04.getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.globalCompositeOperation = 'source-over'; o.filter = 'none';
  o.clearRect(0, 0, W, H);
  g = o; try { sh.fn(t, clamp((t - sh.a) / (sh.b - sh.a)), t - sh.a, t); } catch (e) { console.error('05 seam', e); } finally { g = keep; }
  return true;
}
// the street flats rise in their slots, staggered (far row, near row, then the pavement with her)
const riseOff = (t, t0, dur = .6) => { const k = clamp((t - t0) / dur); return k >= 1 ? 0 : 720 * (1 - eio(k)) - 16 * bump(k, .6, .4); };

// ---------- the camera: a punch-in on the stoop for "alive", and the push into the round window ----------
const ROUND = { x: 1490, y: 236, r: 72 };          // the friends' attic window (stage coords)
const CLOCK_AT = { x: 1000, y: 290 };              // where 06's diner clock sits on screen
const ZE = 1.3;
const END = { z: ZE, fx: ROUND.x - (CLOCK_AT.x - W / 2) / ZE, fy: ROUND.y - (CLOCK_AT.y - H / 2) / ZE, t0: 89.12 };
function view(t) {
  const pin = eio(clamp((t - 80.22) / .5)) * (1 - eio(clamp((t - 82.3) / .75)));
  const out = eio(clamp((t - END.t0) / (T.b - END.t0)));
  let z = lerp(1, 1.62, pin), fx = lerp(W / 2, 1450, pin), fy = lerp(H / 2, 615, pin);
  z = lerp(z, END.z, out); fx = lerp(fx, END.fx, out); fy = lerp(fy, END.fy, out);
  return { z, fx, fy };
}

// ---------- motion helpers ----------
// constant speed from x0, then a quadratic stop that lands exactly on x1 at t1
function glide(t, t0, x0, t1, x1, dec) {
  const v = (x1 - x0) / ((t1 - t0) - dec / 2);
  if (t <= t0) return x0;
  if (t < t1 - dec) return x0 + v * (t - t0);
  const u = Math.min(t, t1) - (t1 - dec);
  return x0 + v * (t1 - dec - t0) + v * u - v * u * u / (2 * dec);
}
// start from rest at t0 (ease in over acc seconds), then constant speed v
function launch(t, t0, x0, v, acc) {
  if (t <= t0) return x0;
  const u = t - t0;
  return u < acc ? x0 + v * u * u / (2 * acc) : x0 + v * acc / 2 + v * (u - acc);
}
// POSE.walk swings the straight leg forward as phase grows, so forward travel runs the phase backward.
const STRIDE = 305;                        // units the planted foot travels per half cycle
const walkPh = (dist, s) => -dist / (STRIDE * s) * Math.PI;

// her path (world x) and the camera
const GO = T.knows + .05, GO_V = 560, GO_AMP = 1.3;
const herX = (t) => t < GO ? glide(t, T.a + .6, -1900, T.friends + .25, 560, 1.3) : launch(t, GO, 560, GO_V, .8);
const camX = (t) => glide(t, T.a - 1, -2240, T.friends - .1, 0, 2.2);

// ---------- a skirt that works seated, rising and standing ----------
// a = thigh angle (1.55 seated .. 0 standing). Drawn in puppet units inside puppet() via spec.acc.
function skirtPath(a, flare = 1) {
  const sA = clamp(a / 1.55), d = [Math.sin(a), Math.cos(a)], n = [d[1], -d[0]];
  const H = [6, -540], at = (u, v) => [H[0] + u * d[0] + v * n[0], H[1] + u * d[1] + v * n[1]];
  const M = at(140, 50), KT = at(268, 42), KF = at(300, 4);
  const hemY = KF[1] + lerp(95, 92, sA);
  const HF = [KF[0] + lerp(70 * flare, 10, sA), hemY], HB = [lerp(-112 * flare, KF[0] - 86, sA), hemY];
  const U0 = at(118, -40), U = [lerp(-100 * flare, U0[0], sA), lerp(-320, U0[1], sA)];
  const B = [lerp(-80, -58, sA), lerp(-450, -520, sA)];
  const pts = [[44, -630], [lerp(64, 68, sA), lerp(-560, -592, sA)], M, KT, KF];
  const nS = 6; for (let i = 0; i <= nS; i++) { const u = i / nS; pts.push([lerp(HF[0], HB[0], u), hemY + (i % 2 ? 9 : -2)]); }
  pts.push(U, B, [-62, -600], [-50, -640]);
  return blob(pts, .4);
}
function friendSpec(base, a) {
  if (a < .06) return base;
  return { ...base, kind: 'shirt', acc: [() => cut(skirtPath(a, .9), base.col, { sh: .5, grain: .26, lift: .2 })] };
}
// a seated -> standing pose with the feet held still: returns the x offset the hips need.
// The lean comes forward early in the rise (weight over the feet), then the back straightens.
function rise(a, extra = {}) {
  const u = 1 - a / 1.55;
  const lean = Math.sin(clamp(u * 1.4) * Math.PI) * .16 * (1 - u * .4);
  return { pose: { legs: [[a, a * 1.02], [a * .94, a]], bob: 266 * (1 - Math.cos(a)) - 6, lean, head: -lean * .5, ...extra }, dx: 266 * Math.sin(a) };
}

// ---------- offscreen paper (ghost and colour versions of the friends) ----------
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const GHOST = mk(), SOLID = mk();
function into(buf, fn) {
  const keep = g, o = buf.getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.clearRect(0, 0, W, H); o.setTransform(keep.getTransform());
  g = o; try { fn(); } finally { g = keep; }
}
// draw a whole-frame buffer; clipPath is in the current (stage) coordinates
function blit(buf, alpha = 1, clipPath) {
  g.save(); if (clipPath) g.clip(clipPath); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha *= alpha; g.drawImage(buf, 0, 0); g.restore();
}

// ---------- the set ----------
function sky() {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const gr = g.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, P.skyTop); gr.addColorStop(.55, P.skyMid); gr.addColorStop(1, P.skyLow);
  g.fillStyle = gr; g.fillRect(-10, -10, W + 20, H + 20);
  g.globalAlpha *= .16; g.globalCompositeOperation = 'soft-light'; g.drawImage(GRAIN, 0, 0); g.restore();
}
// the far row: one long cut silhouette of roofs and chimneys
const FAR = (() => {
  const p = new Path2D(); let x = -1600; p.moveTo(x, 900);
  let i = 0;
  while (x < 3400) {
    const w = 240 + hash(i * 3.1) * 200, h = 330 + hash(i * 5.3) * 110, top = 800 - h;
    p.lineTo(x, top);
    if (hash(i * 7.7) > .45) { const cx = x + w * (.2 + hash(i) * .5); p.lineTo(cx, top); p.lineTo(cx, top - 40); p.lineTo(cx + 30, top - 40); p.lineTo(cx + 30, top); }
    p.lineTo(x + w, top); x += w; i++;
  }
  p.lineTo(x, 900); p.closePath(); return p;
})();
const FAR_WINS = (() => { const p = new Path2D(); for (let i = 0; i < 56; i++) { const x = -1500 + i * 90 + hash(i * 2.2) * 40, y = 500 + hash(i * 4.4) * 60; if (hash(i * 6.6) > .5) p.rect(x, y, 20, 32); } return p; })();

// near-row houses (world x). The friends' house is the pale gabled one with the round attic window.
// A few facades differ (a gable, a bay window, arched windows) so the walk is not one repeated house.
const HOUSES = [
  { x: -2700, w: 470, h: 470, col: P.h2 }, { x: -2230, w: 520, h: 420, col: P.h1, gable: true }, { x: -1710, w: 460, h: 500, col: P.h4, arch: true },
  { x: -1250, w: 500, h: 455, col: P.h2, bay: true }, { x: -750, w: 480, h: 490, col: P.h1, dream: true }, { x: -270, w: 520, h: 445, col: P.h4, arch: true },
  { x: 250, w: 470, h: 480, col: P.h2, bay: true }, { x: 720, w: 470, h: 450, col: P.h1 }, { x: 1190, w: 600, h: 620, col: P.h3, friends: true },
  { x: 1790, w: 500, h: 470, col: P.h4, arch: true }, { x: 2290, w: 480, h: 440, col: P.h1, gable: true },
];
function sash(x, y, w, h, lit, seed, arch = false) {
  const shape = arch ? rrect(x, y, w, h, [w / 2, w / 2, 0, 0]) : rect(x, y, w, h);
  cut(shape, P.win, { sh: 0, grain: .2 });
  if (lit > 0) { g.save(); g.globalAlpha *= clamp(lit); cut(shape, C.goldPale, { sh: 0, grain: .2 });
    g.save(); g.clip(shape); g.fillStyle = 'rgba(241,178,58,.55)'; g.fillRect(x, y + h * .5, w, h * .5); g.restore(); g.restore(); }
  cut(cutRect(x - 8, y + h, w + 16, 12, seed), P.sill, { sh: .35, grain: .15 });
}
function roundWindow(x, y, r, lit) {
  cut(circle(x, y, r + 11), P.step, { sh: .45, grain: .2 });
  cut(circle(x, y, r), P.win, { sh: 0, grain: .2 });
  if (lit > 0) { g.save(); g.globalAlpha *= clamp(lit); cut(circle(x, y, r), C.goldPale, { sh: 0, grain: .2 });
    g.save(); g.clip(circle(x, y, r)); g.fillStyle = 'rgba(241,178,58,.45)'; g.fillRect(x - r, y + r * .2, r * 2, r); g.restore(); g.restore(); }
  // a cross of glazing bars
  cut(rect(x - r, y - 4, r * 2, 8), P.step, { sh: .2, grain: .1 });
  cut(rect(x - 4, y - r, 8, r * 2), P.step, { sh: .2, grain: .1 });
}
function rowHouse(hh, t, glow, dreamLit) {
  const { x, w, h, col } = hh, seed = Math.round(x);
  const top = GROUND - h;
  if (hh.gable || hh.friends) {
    // a pediment: the body plus a shallow triangle, with a dark cornice strip along its eaves
    const peak = top - w * .3;
    cut(poly([[x - 12, top + 2], [x + w / 2, peak - 14], [x + w + 12, top + 2]]), P.step, { sh: .5, lift: .1 });
    cut(poly([[x, top + 4], [x + w / 2, peak], [x + w, top + 4], [x + w, GROUND + 6], [x, GROUND + 6]]), col, { sh: .7, lift: .25 });
    cut(cutRect(x - 8, top - 4, w + 16, 14, seed + 3), P.step, { sh: .4 });
    if (!hh.friends) cut(ellipse(x + w / 2, top - w * .12, 26, 34), P.win, { sh: 0, grain: .2 });
  } else {
    cut(cutRect(x, top, w, h + 6, seed), col, { sh: .7, lift: .25 });
    cut(cutRect(x - 8, top - 16, w + 16, 20, seed + 3), P.step, { sh: .5 });             // cornice
  }
  if (hh.friends) {
    // the friends' house: door in the middle up a four-step stoop, windows kept to the far edges
    const cx = x + w / 2, doorX = cx - 46, dY = GROUND - NSTEP * STEP;
    roundWindow(ROUND.x, ROUND.y, ROUND.r, glow);
    sash(x + 34, GROUND - 262, 72, 132, 0, seed + 10, true); sash(x + w - 106, GROUND - 262, 72, 132, 0, seed + 11, true);
    cut(rrect(doorX - 8, dY - 214, 108, 214, [54, 54, 0, 0]), P.step, { sh: .4 });
    cut(rrect(doorX, dY - 206, 92, 206, [46, 46, 0, 0]), P.win, { sh: 0, grain: .2 });
    if (glow > 0) { g.save(); g.globalAlpha *= clamp(glow * 1.6 - .6); cut(rrect(doorX + 10, dY - 196, 72, 50, [36, 36, 0, 0]), C.goldPale, { sh: 0, grain: .2 }); g.restore(); }
    for (let i = 0; i < NSTEP; i++) {
      const sw = 480 - i * 50;
      cut(cutRect(cx - sw / 2, GROUND - (i + 1) * STEP, sw, STEP + 2, seed + 20 + i), i % 2 ? P.kerb : P.step, { sh: .55, lift: .1 });
    }
    return;
  }
  const doorX = x + 64;
  const upper = [x + 76, x + w - 148];
  upper.forEach((wx, i) => sash(wx, top + 56, 72, 104, 0, seed + i, hh.arch));
  if (hh.bay) {
    // a bay window on the ground floor: a projecting box with three narrow lights
    const bx = x + w - 230, by = GROUND - 300;
    cut(cutRect(bx, by, 200, 250, seed + 30), P.step, { sh: .6, lift: .2 });
    cut(cutRect(bx - 10, by - 16, 220, 18, seed + 31), P.kerb, { sh: .4 });
    for (let i = 0; i < 3; i++) cut(rect(bx + 18 + i * 62, by + 26, 42, 150), P.win, { sh: 0, grain: .2 });
    cut(cutRect(bx - 6, by + 186, 212, 14, seed + 32), P.sill, { sh: .35 });
  } else {
    sash(x + w - 148, GROUND - 262, 72, 132, hh.dream ? dreamLit : 0, seed + 10, hh.arch);
  }
  // door with a fanlight, up a stoop
  const stoop = 2, sh = 44;
  const dY = GROUND - stoop * sh;
  cut(rrect(doorX - 8, dY - 214, 108, 214, [54, 54, 0, 0]), P.step, { sh: .4 });
  cut(rrect(doorX, dY - 206, 92, 206, [46, 46, 0, 0]), P.win, { sh: 0, grain: .2 });
  for (let i = 0; i < stoop; i++) {
    const sw = 170 - i * 30, cx = doorX + 46;
    cut(cutRect(cx - sw / 2, GROUND - (i + 1) * sh, sw, sh + 2, seed + 20 + i), i % 2 ? P.kerb : P.step, { sh: .55, lift: .1 });
  }
}
function streetLampAt(x, t, onAt) {
  const on = clamp((t - onAt) / .25);
  const flick = on > 0 && on < 1 ? (hash(Math.floor(t * 12) + x) > .4 ? 1 : .3) : 1;
  streetLamp(x, WALK_Y + 18, 480, on * flick * .9);
}

SHOT(T.a, T.b, 'friends', (t) => {
  const A0 = g.globalAlpha;
  const cam = camX(t);
  sky();
  const V = view(t);
  g.save(); g.translate(W / 2, H / 2); g.scale(V.z, V.z); g.translate(-V.fx, -V.fy);

  // ---------- the low sun, and the seam: 04's halo shrinking into it ----------
  const sunX = 1120 - cam * .06, sunY = 372 + (t - T.a) * 4;
  const seamE = eio(clamp((t - SEAM.t0) / (SEAM.t1 - SEAM.t0)));
  const cameoA = 1 - clamp((t - SEAM.t1) / SEAM.fade);
  const has04 = cameoA > 0 && draw04(t);
  if (!has04 || cameoA < 1) {
    cut(circle(sunX, sunY, SUN.r), C.goldPale, { sh: .25, grain: .25 });
    cut(circle(sunX, sunY, SUN.r - 20), C.sun, { sh: .3, grain: .25 });
  }
  if (has04) {
    // the halo travels from where 04 left it to the sun, scaling down to the sun's size; the window onto
    // 04 closes from the whole frame down to the halo's own rim, a paper disc with its shadow
    const s = lerp(1, SUN.r / HALO.r, seamE);
    const cx = lerp(HALO.x, sunX, seamE), cy = lerp(HALO.y, sunY, seamE);
    const m = s * HALO.r * lerp(3.4, 1, Math.pow(seamE, .7));
    g.save(); g.globalAlpha *= cameoA;
    if (seamE > .02) cut(circle(cx, cy, m), C.rose, { sh: .9, lift: .5, grain: 0 });
    g.save(); g.clip(circle(cx, cy, m));
    // 04's own ground (rose deepened by its dusk) fills the disc beyond the edges of its frame
    g.fillStyle = C.rose; g.fillRect(cx - m, cy - m, 2 * m, 2 * m);
    g.save(); g.globalAlpha *= .55; g.fillStyle = C.roseDeep; g.fillRect(cx - m, cy - m, 2 * m, 2 * m); g.restore();
    g.translate(cx, cy); g.scale(s, s); g.translate(-HALO.x, -HALO.y);
    g.drawImage(B04, 0, 0);
    g.restore();
    g.restore();
  }
  // toy theatre: the pavement rises first, then the near row and the far row come up from behind it
  const offPave = riseOff(t, SEAM.t0 + .02), offNear = riseOff(t, SEAM.t0 + .2), offFar = riseOff(t, SEAM.t0 + .36);

  // far row (parallax .45)
  g.save(); g.translate(-cam * .45, offFar);
  cut(FAR, P.far, { sh: .5, lift: .1 });
  g.save(); g.globalAlpha *= .8; g.fillStyle = P.farWin; g.fill(FAR_WINS); g.restore();
  g.restore();

  // near row (parallax 1)
  const glow = pop(t, T.later - .05, .45);
  const dreamLit = pop(t, T.dream + .05, .4);
  g.save(); g.translate(-cam, offNear);
  for (const hh of HOUSES) { if (hh.x - cam > W + 700 || hh.x + hh.w - cam < -500) continue; rowHouse(hh, t, glow, dreamLit); }
  g.restore();

  // ---------- the friends (drawn with the near row, before the pavement's front lane) ----------
  const fx = (wx) => wx - cam;
  // rising: a goes 1.55 -> 0 just after "alive"
  const up = eio(clamp((t - (T.alive + .55)) / .8));
  const a = 1.55 * (1 - up);
  const pointK = bump(t, T.down - .15, T.street + .7 - T.down);
  const friends = [
    { spec: CAST.friendA, footX: 1318, topX: 1345, h: .97, wph: 0, wf: 9.2 },
    { spec: CAST.friendB, footX: 1468, topX: 1652, h: .95, wph: 1.9, wf: 8.1 },
  ];
  // after "street" they hop up to the top step (in front of their door), so she can pass below them
  const HOP0 = T.street + .2;
  const drawFriends = () => friends.forEach((f, i) => {
    const r = rise(a);
    const turned = herX(t) > f.footX - 20;           // each turns to wave her down the street as she passes
    const facing = turned ? 1 : -1;
    let arms = [[.25 + .2 * (1 - up), .9 * (1 - up) + .2], [.1 + .2 * (1 - up), .8 * (1 - up) + .2]];   // hands on knees while seated
    let headA = r.pose.head;
    if (t > T.friends - .2 && t < T.alive + .6) headA += .12 * ss(T.friends - .2, T.friends + .4, t);  // they lift their heads to her
    // a real wave: upper arm raised, forearm swinging side to side from the elbow, each friend on her own beat
    const waveIn = ss(T.theyre - .15, T.theyre + .25, t);
    if (waveIn > 0) {
      // the one in front (in the direction they face) waves forward; the one behind waves straight up,
      // so no arm ever crosses the other friend
      const front = (facing < 0) === (i === 0);
      const el = front ? .62 + Math.sin((t + f.wph) * f.wf) * .42 : .1 + Math.sin((t + f.wph) * f.wf) * .3;
      arms = [[lerp(arms[0][0], front ? 1.9 : 2.95, waveIn), lerp(arms[0][1], el, waveIn)], [lerp(arms[1][0], .12, waveIn), lerp(arms[1][1], .25, waveIn)]];
    }
    // "just down the street": they point straight up at their own window (that is where they live)
    if (pointK > .05) arms = [[lerp(arms[0][0], i === 0 ? 3.05 : 2.95, pointK), lerp(arms[0][1], -.05, pointK)], arms[1]];
    // "the colour arrives": they laugh, heads back
    const lg = bump(t, T.alive + .15 + i * .08, 1.1);
    headA += .06 * lg;
    const spec = friendSpec(f.spec, a);
    const hk = clamp((t - HOP0 - i * .1) / .42), he = eio(hk);
    const fy = lerp(FEET_F, GROUND - NSTEP * STEP, he) - Math.sin(hk * Math.PI) * 46;
    const crouch = bump(t, HOP0 - .12 + i * .1, .24) + bump(t, HOP0 + .36 + i * .1, .24);
    const pose = { ...r.pose, arms, head: headA, laugh: lg };
    if (crouch > 0) { pose.legs = [[.5 * crouch, .9 * crouch], [.46 * crouch, .9 * crouch]]; pose.bob = (pose.bob || 0) + 40 * crouch; }
    const x = fx(lerp(f.footX, f.topX, he)) - facing * r.dx * FS * f.h;
    puppet(x, fy + offNear + plant(FS, f.h), FS, facing, spec, pose);
  });
  // ghosts: pale tracing paper, slightly translucent, until "alive"; colour floods up from the feet
  const flood = clamp((t - T.alive) / .55);
  if (flood < 1) { into(GHOST, drawFriends); }
  if (flood > 0) into(SOLID, drawFriends);
  if (flood < 1) {
    const o = GHOST.getContext('2d'); o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-atop';
    o.fillStyle = C.cream; o.globalAlpha = .93; o.fillRect(0, 0, W, H); o.restore();
    blit(GHOST, .56 + .05 * Math.sin(t * 2.2));
  }
  if (flood > 0) {
    const yTop = lerp(FEET_F + 30, FEET_F - 600, eo(flood));
    const p = new Path2D(); p.moveTo(-400, H + 400); p.lineTo(-400, yTop);
    for (let x = -400; x <= W + 900; x += 40) p.lineTo(x, yTop + Math.sin(x / 37 + t * 9) * 10 + (hash(x) - .5) * 8);
    p.lineTo(W + 900, H + 400); p.closePath();
    blit(SOLID, 1, flood < 1 ? p : null);
  }

  // pavement and kerb, rising with the near lane
  g.save(); g.translate(0, offPave);
  cut(cutRect(-500, GROUND - 2, W + 1400, 220, 41), P.pave, { sh: .6, lift: .1 });
  cut(cutRect(-500, 1046, W + 1400, 80, 42), P.kerb, { sh: .5 });
  // street lamps along the kerb pop on, one after another, on "dream"
  g.save(); g.translate(-cam, offNear - offPave);
  [-1900, -800, 260, 1900].forEach((lx, i) => { if (lx - cam > -500 && lx - cam < W + 700) streetLampAt(lx, t, T.dream + i * .22); });
  g.restore();

  // ---------- HER, on the near lane ----------
  const hx = herX(t) - cam, dist = herX(t) + 1650;
  // walk amplitude settles to standing as she stops, and grows (a longer, happier stride) as she sets off again
  const amp = t < GO ? 1 - ss(T.friends - .5, T.friends + .25, t) : GO_AMP * ss(GO, GO + .5, t);
  const ph = t < GO ? walkPh(dist, SHE) : walkPh(2210, SHE) - (herX(t) - 560) / (STRIDE * SHE * GO_AMP) * Math.PI;
  const pose = POSE.walk(ph, amp);
  // "just": she points at them; "knows": a small nod; then a wave as she sets off
  const pt = bump(t, T.just - .1, T.down - T.just + .5);
  if (pt > 0) pose.arms = [[lerp(pose.arms[0][0], 1.45, pt), lerp(pose.arms[0][1], .02, pt)], pose.arms[1]];
  const wv = ss(T.knows - .2, T.knows + .15, t) * (1 - ss(T.can, T.see + .1, t));
  if (wv > 0) { const el = .5 + Math.sin(t * 8.5) * .45; pose.arms = [[lerp(pose.arms[0][0], 2.45, wv), lerp(pose.arms[0][1], el, wv)], pose.arms[1]]; }
  pose.head = (pose.head || 0) + bump(t, T.knows - .05, .55) * .14 + ss(T.friends - .4, T.friends + .2, t) * (1 - ss(T.knows, T.knows + .4, t)) * .04;
  // on "alive" she rises onto her toes a little (joy)
  pose.bob = (pose.bob || 0) - bump(t, T.alive + .1, .6) * 14;
  if (hx > -400 && hx < W + 900) puppet(hx, WALK_Y + plant(SHE), SHE, 1, CAST.her, pose);
  g.restore();

  g.restore();
  g.globalAlpha = A0;
});
})();
