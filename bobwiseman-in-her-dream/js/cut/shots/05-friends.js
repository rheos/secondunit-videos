// 73.28-89.96  "In her dream her friends are alive and they're just down the street /
// & she knows she can see them later". A street of rowhouses at dusk, two depths of paper.
// She walks the pavement; two old friends sit on a stoop as pale tracing paper (lost to her),
// and on "alive" their own colour floods up into them. They stand, wave, point to their lit door;
// she waves and walks on, and their window lights gold on "later".
(() => {
const T = {
  a: 73.28, dream: wordAt('dream', 0, 75), friends: wordAt('friends', 0, 75), alive: wordAt('alive', 0, 75),
  theyre: wordAt("they're", 0, 75), just: wordAt('just', 0, 75), down: wordAt('down', 0, 75), street: wordAt('street', 0, 75),
  knows: wordAt('knows', 0, 75), can: wordAt('can', 0, 86), see: wordAt('see', 0, 75), them: wordAt('them', 0, 75), later: wordAt('later', 0, 75), b: 89.96,
};
const GROUND = 930, WALK_Y = 968;          // facade line (stoop foot) and her pavement line
const SHE = .52;
const plant = (s, h = 1) => 24 * s * h;   // puppet() feet sit ~24 units above y; this plants them

// rose family only (the ground); accents are navy (her), plum, teal, gold
const P = { skyTop: '#e29e93', skyMid: '#eeb7a3', skyLow: '#f6d5b3', far: '#d9958a', farWin: '#c98479',
  h1: '#b4605d', h2: '#a5524f', h3: '#d8958a', h4: '#ad5a57', win: '#7a3a45', sill: '#c97a72', pave: '#cd8077', kerb: '#a85a59', step: '#9c4f4d' };

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
const herX = (t) => t < GO ? glide(t, T.a - 1, -1650, T.friends + .25, 600, 1.3) : launch(t, GO, 600, GO_V, .8);
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
// a seated -> standing pose with the feet held still: returns the x offset the hips need
function rise(a, extra = {}) {
  return { pose: { legs: [[a, a * 1.02], [a * .94, a]], bob: 266 * (1 - Math.cos(a)) - 6, lean: Math.sin(a * 2) * .1, ...extra }, dx: 266 * Math.sin(a) };
}

// ---------- offscreen paper (ghost and colour versions of the friends) ----------
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const GHOST = mk(), SOLID = mk();
function into(buf, fn) {
  const keep = g, o = buf.getContext('2d');
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalAlpha = 1; o.clearRect(0, 0, W, H); o.setTransform(keep.getTransform());
  g = o; try { fn(); } finally { g = keep; }
}
function blit(buf, alpha = 1, clipPath) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha *= alpha; if (clipPath) g.clip(clipPath); g.drawImage(buf, 0, 0); g.restore();
}

// ---------- the set ----------
function sky(t) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  const gr = g.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, P.skyTop); gr.addColorStop(.55, P.skyMid); gr.addColorStop(1, P.skyLow);
  g.fillStyle = gr; g.fillRect(-10, -10, W + 20, H + 20);
  g.globalAlpha *= .16; g.globalCompositeOperation = 'soft-light'; g.drawImage(GRAIN, 0, 0); g.restore();
}
// the far row: one long cut silhouette of roofs and chimneys
const FAR = (() => {
  const p = new Path2D(); let x = -1600; p.moveTo(x, 900);
  let i = 0;
  while (x < 2600) {
    const w = 240 + hash(i * 3.1) * 200, h = 330 + hash(i * 5.3) * 110, top = 800 - h;
    p.lineTo(x, top);
    if (hash(i * 7.7) > .45) { const cx = x + w * (.2 + hash(i) * .5); p.lineTo(cx, top); p.lineTo(cx, top - 40); p.lineTo(cx + 30, top - 40); p.lineTo(cx + 30, top); }
    p.lineTo(x + w, top); x += w; i++;
  }
  p.lineTo(x, 900); p.closePath(); return p;
})();
const FAR_WINS = (() => { const p = new Path2D(); for (let i = 0; i < 46; i++) { const x = -1500 + i * 90 + hash(i * 2.2) * 40, y = 500 + hash(i * 4.4) * 60; if (hash(i * 6.6) > .5) p.rect(x, y, 20, 32); } return p; })();

// near-row houses (world x). The friends' house is the pale one.
const HOUSES = [
  { x: -2700, w: 470, h: 470, col: P.h2 }, { x: -2230, w: 520, h: 440, col: P.h1 }, { x: -1710, w: 460, h: 500, col: P.h4 },
  { x: -1250, w: 500, h: 455, col: P.h2 }, { x: -750, w: 480, h: 490, col: P.h1 }, { x: -270, w: 520, h: 445, col: P.h4 },
  { x: 250, w: 470, h: 480, col: P.h2 }, { x: 720, w: 470, h: 450, col: P.h1 }, { x: 1190, w: 600, h: 520, col: P.h3, friends: true },
  { x: 1790, w: 500, h: 460, col: P.h4 },
];
function sash(x, y, w, h, lit, seed) {
  cut(rect(x, y, w, h), P.win, { sh: 0, grain: .2 });
  if (lit > 0) { g.save(); g.globalAlpha *= clamp(lit); cut(rect(x, y, w, h), C.goldPale, { sh: 0, grain: .2 });
    g.fillStyle = 'rgba(241,178,58,.55)'; g.fillRect(x, y + h * .5, w, h * .5); g.restore(); }
  cut(cutRect(x - 8, y + h, w + 16, 12, seed), P.sill, { sh: .35, grain: .15 });
}
function rowHouse(hh, t, glow) {
  const { x, w, h, col } = hh, seed = Math.round(x);
  cut(cutRect(x, GROUND - h, w, h + 6, seed), col, { sh: .7, lift: .25 });
  cut(cutRect(x - 8, GROUND - h - 16, w + 16, 20, seed + 3), P.step, { sh: .5 });             // cornice
  const doorX = hh.friends ? x + w - 196 : x + 64;
  // upper floor; the friends' middle window is the one that lights on "later"
  const upper = hh.friends ? [x + 76, x + 250, x + w - 186] : [x + 76, x + w - 148];
  upper.forEach((wx, i) => sash(wx, GROUND - h + 56, 72, 104, hh.friends && i === 0 ? glow : 0, seed + i));
  sash(hh.friends ? x + 76 : x + w - 148, GROUND - 262, 72, 132, 0, seed + 10);
  // door with a fanlight, up a stoop
  const stoop = hh.friends ? 3 : 2, sh = 44;
  const dY = GROUND - stoop * sh;
  cut(rrect(doorX - 8, dY - 214, 108, 214, [54, 54, 0, 0]), P.step, { sh: .4 });
  cut(rrect(doorX, dY - 206, 92, 206, [46, 46, 0, 0]), P.win, { sh: 0, grain: .2 });
  if (hh.friends && glow > 0) { g.save(); g.globalAlpha *= clamp(glow * 1.6 - .6); cut(rrect(doorX + 10, dY - 196, 72, 50, [36, 36, 0, 0]), C.goldPale, { sh: 0, grain: .2 }); g.restore(); }
  for (let i = 0; i < stoop; i++) {
    const sw = (hh.friends ? 380 : 170) - i * (hh.friends ? 56 : 30), cx = doorX + 46;
    cut(cutRect(cx - sw / 2, GROUND - (i + 1) * sh, sw, sh + 2, seed + 20 + i), i % 2 ? P.kerb : P.step, { sh: .55, lift: .1 });
  }
}
function streetLampAt(x, t, onAt) {
  const on = clamp((t - onAt) / .25);
  const flick = on > 0 && on < 1 ? (hash(Math.floor(t * 12) + x) > .4 ? 1 : .3) : 1;
  streetLamp(x, WALK_Y + 4, 470, on * flick * .9);
}

SHOT(T.a, T.b, 'friends', (t) => {
  const A0 = g.globalAlpha;
  const cam = camX(t);
  sky(t);
  // the low sun, a cream disc with a gold rim (the halo, now setting), almost fixed (far parallax)
  const sunX = 1120 - cam * .06, sunY = 372 + (t - T.a) * 4;
  cut(circle(sunX, sunY, 168), C.goldPale, { sh: .25, grain: .25 });
  cut(circle(sunX, sunY, 148), C.sun, { sh: .3, grain: .25 });
  // far row (parallax .45)
  g.save(); g.translate(-cam * .45, 0);
  cut(FAR, P.far, { sh: .5, lift: .1 });
  g.save(); g.globalAlpha *= .8; g.fillStyle = P.farWin; g.fill(FAR_WINS); g.restore();
  g.restore();

  // near row (parallax 1)
  const glow = pop(t, T.later - .05, .45);
  g.save(); g.translate(-cam, 0);
  for (const hh of HOUSES) { if (hh.x - cam > W + 40 || hh.x + hh.w - cam < -40) continue; rowHouse(hh, t, glow); }
  g.restore();
  // pavement and kerb
  cut(cutRect(-20, GROUND - 2, W + 40, 200, 41), P.pave, { sh: .6, lift: .1 });
  cut(cutRect(-20, 1032, W + 40, 60, 42), P.kerb, { sh: .5 });
  // street lamps along the kerb pop on, one after another, on "dream"
  g.save(); g.translate(-cam, 0);
  [-1900, -800, 260, 1900].forEach((lx, i) => { if (lx - cam > -300 && lx - cam < W + 300) streetLampAt(lx, t, T.dream + i * .22); });
  g.restore();

  // ---------- the friends ----------
  const fx = (wx) => wx - cam;
  const stepTop = GROUND - 3 * 44;               // seat height (top step) and the ground under their feet
  const s = .5;
  // rising: a goes 1.55 -> 0 just after "alive"
  const up = eio(clamp((t - (T.alive + .55)) / .8));
  const a = 1.55 * (1 - up);
  const waveA = t > T.theyre - .1 ? 1 : 0;
  const pointK = bump(t, T.down - .15, T.street + .7 - T.down);
  const friends = [
    { spec: CAST.friendA, footX: 1452, h: .97, wph: 0 },
    { spec: CAST.friendB, footX: 1596, h: .95, wph: 1.7 },
  ];
  const drawFriends = (solid) => friends.forEach((f, i) => {
    const r = rise(a);
    const turned = herX(t) > f.footX + 30;           // each turns to wave her down the street as she passes
    const facing = turned ? 1 : -1;
    let arms = [[.25 + .2 * (1 - up), .9 * (1 - up) + .2], [.1 + .2 * (1 - up), .8 * (1 - up) + .2]];   // hands on knees while seated
    let headA = -.05;
    if (t > T.friends - .2 && t < T.alive + .6) headA = .12 * ss(T.friends - .2, T.friends + .4, t);  // they lift their heads to her
    if (waveA && pointK < .05) { const w = POSE.wave(t + f.wph, 8).arms; arms = [w[0], arms[1]]; }
    if (pointK > .05) arms = [[lerp(arms[0][0], -2.35, pointK), lerp(arms[0][1], -.1, pointK)], arms[1]];  // point back up at their door
    if (turned) arms = [[2.45 + Math.sin((t + f.wph) * 8) * .22, .25 + Math.sin((t + f.wph) * 8 + 1) * .2], [.08, .2]];   // a high wave, clear of each other
    // the moment the colour arrives they laugh (heads back), then rise
    const lg = bump(t, T.alive + .15 + i * .08, 1.1);
    headA += .06 * lg;
    const spec = friendSpec(f.spec, a);
    const x = fx(f.footX) - facing * r.dx * s * f.h;
    // seated hips sit on the top step: feet are 1 step + ground below (feet land on the pavement)
    puppet(x, GROUND + plant(s, f.h), s, facing, spec, { ...r.pose, arms, head: headA, laugh: lg });
  });
  // ghosts: pale tracing paper, slightly translucent, until "alive"; colour floods up from the feet
  const flood = clamp((t - T.alive) / .55);
  if (flood < 1) { into(GHOST, () => drawFriends(false)); }
  if (flood > 0) into(SOLID, () => drawFriends(true));
  if (flood < 1) {
    // tint the ghost buffer to cream tracing paper
    const o = GHOST.getContext('2d'); o.save(); o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-atop';
    o.fillStyle = C.cream; o.globalAlpha = .93; o.fillRect(0, 0, W, H); o.restore();
    blit(GHOST, .56 + .05 * Math.sin(t * 2.2));
  }
  if (flood > 0) {
    const yTop = lerp(GROUND + 30, GROUND - 600, eo(flood));
    const p = new Path2D(); p.moveTo(-10, H + 10); p.lineTo(-10, yTop);
    for (let x = 0; x <= W + 20; x += 40) p.lineTo(x, yTop + Math.sin(x / 37 + t * 9) * 10 + (hash(x) - .5) * 8);
    p.lineTo(W + 10, H + 10); p.closePath();
    blit(SOLID, 1, flood < 1 ? p : null);
  }
  // ---------- HER ----------
  const hx = herX(t) - cam, dist = herX(t) + 1650;
  // walk amplitude settles to standing as she stops, and grows (a longer, happier stride) as she sets off again
  const amp = t < GO ? 1 - ss(T.friends - .5, T.friends + .25, t) : GO_AMP * ss(GO, GO + .5, t);
  const ph = t < GO ? walkPh(dist, SHE) : walkPh(2250, SHE) - (herX(t) - 600) / (STRIDE * SHE * GO_AMP) * Math.PI;
  let pose = POSE.walk(ph, amp);
  pose.legs = pose.legs.map(([h, k]) => [h, k]);
  // "just": she points at them; "knows": a small nod; then a wave as she sets off
  const pt = bump(t, T.just - .1, T.down - T.just + .5);
  if (pt > 0) pose.arms = [[lerp(pose.arms[0][0], 1.45, pt), lerp(pose.arms[0][1], .02, pt)], pose.arms[1]];
  const wv = ss(T.knows - .2, T.knows + .15, t) * (1 - ss(T.can, T.see + .1, t));
  if (wv > 0) { const w = POSE.wave(t, 7).arms[0]; pose.arms = [[lerp(pose.arms[0][0], w[0] * .92, wv), lerp(pose.arms[0][1], w[1], wv)], pose.arms[1]]; }
  pose.head = (pose.head || 0) + bump(t, T.knows - .05, .55) * .14 + ss(T.friends - .4, T.friends + .2, t) * (1 - ss(T.knows, T.knows + .4, t)) * .04;
  // on "alive" she rises onto her toes a little (joy), a lift of the whole body by the ankles
  pose.bob = (pose.bob || 0) - bump(t, T.alive + .1, .6) * 14;
  if (hx > -300 && hx < W + 300) puppet(hx, WALK_Y + plant(SHE), SHE, 1, CAST.her, pose);
  g.globalAlpha = A0;
}, { xin: 1.0, tr: 'slide' });
})();
