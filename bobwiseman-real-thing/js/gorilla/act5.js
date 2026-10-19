// Act 5 (125.5-166.0): the turn, the bridge, the turnaround, the sunrise, the outro. See STORYBOARD-gorilla.md.
// He sits by a moonlit pond; she sits down beside him, turns the banana over and opens it from the other end with one
// pinch. Sunrise, the biggest and brightest image of the film; the jungle wakes. (No little Bob in this film: Robin, 2026-10-19.)
'use strict';
const a5_HER = { fur: '#7a6458', fur2: '#5e4a40', face: '#c9ad98', bellyCol: '#a48a7a', muzzle: '#d8bfab' };
const a5_HZ = 520;
// layouts: his x, her x, ground y, scale. LB = the pond bank (wide), LW = looking down into the water
const a5_LB = { hx: 820, sx: 1045, gy: 702, s: 230 };
const a5_LW = { hx: 700, sx: 1035, gy: 236, s: 330 };
const a5_LM = { hx: 780, sx: 1090, gy: 935, s: 300 }; // morning clearing
const a5_LO = { hx: 1190, sx: 1420, gy: 1000, s: 215 }; // outro

// ---------------------------------------------------------------- sky over the act
function a5_sky(t) {
  if (t < 142) return 'night';
  if (t < 144) return ['night', 'dawn', eio(seg(t, 142, 144))];
  if (t < 146.5) return ['dawn', 'day', .7 * eio(seg(t, 144, 146.5))];
  return 'day';
}
const a5_MORN = ['dawn', 'day', .78];

// ---------------------------------------------------------------- her: lighter, warmer fur, a pink flower, lashes
function a5_flower(g, x, y, r, col = '#f28fb8', ctr = '#ffd75e', lw = 4) {
  for (let i = 0; i < 5; i++) { const a = i * TAU / 5 - Math.PI / 2; ol(g, ell(g, x + Math.cos(a) * r * .62, y + Math.sin(a) * r * .62, r * .5, r * .38, a), col, lw); }
  ol(g, ell(g, x, y, r * .3, r * .3), ctr, lw * .8);
}
function a5_lashes(g, eyes) {
  g.strokeStyle = INK; g.lineWidth = LW * .8 / sc(g); g.lineCap = 'round'; g.beginPath();
  for (const ex of [-.085, .085]) {
    const o = Math.sign(ex);
    const bx = ex + o * .04, by = eyes === 'open' || eyes === 'cross' ? -.098 : -.06;
    for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + o * (.5 + i * .38); g.moveTo(bx - o * i * .012, by + i * .012); g.lineTo(bx - o * i * .012 + Math.cos(a) * .045, by + i * .012 + Math.sin(a) * .045); }
  }
  g.stroke();
}
function a5_her(g, x, y, s, P = {}) {
  const user = P.after;
  gorilla(g, x, y, s, Object.assign({}, a5_HER, P, { after: (gg, k) => {
    gg.save(); gg.translate(0, -.84); gg.rotate(P.tilt || 0);
    a5_lashes(gg, P.eyes || 'open');
    a5_flower(gg, .25, -.2, .075);
    gg.restore();
    if (user) user(gg, k);
  } }));
}
// his eyes go huge (drawn over the face in the after callback)
function a5_bigEyes(g, P, amt) {
  if (amt <= 0) return;
  g.save(); g.translate(0, -.84); g.rotate(P.tilt || 0);
  const lx = (P.look || [0, 0])[0] * .02, ly = (P.look || [0, 0])[1] * .02;
  for (const ex of [-.088, .088]) {
    ol(g, ell(g, ex, -.072, .052 + .022 * amt, .058 + .03 * amt), '#fbf6ea');
    g.beginPath(); g.ellipse(ex + lx, -.07 + ly, .02, .024, 0, 0, TAU); g.fillStyle = INK; g.fill();
    g.beginPath(); g.arc(ex + lx + .007, -.08 + ly, .007, 0, TAU); g.fillStyle = '#fff'; g.fill();
  }
  g.strokeStyle = INK; g.lineWidth = LW / sc(g); g.lineCap = 'round'; g.beginPath();
  g.moveTo(-.16, -.17 - .03 * amt); g.quadraticCurveTo(-.09, -.21 - .03 * amt, -.03, -.18 - .03 * amt);
  g.moveTo(.16, -.17 - .03 * amt); g.quadraticCurveTo(.09, -.21 - .03 * amt, .03, -.18 - .03 * amt); g.stroke();
  g.restore();
}

// ---------------------------------------------------------------- a banana opened from the other end (stem at the bottom)
// origin at the base of the strips; L length; p 0 shut .. 1 three strips sprung; eat bites the fruit down
function a5_open(g, x, y, L, a, p, eat = 0, droop = 0) {
  g.save(); g.translate(x, y); g.rotate(a);
  const top = -L * (.66 - eat * .34), fr = L * .13;
  if (p > .02) {
    ol(g, () => { g.moveTo(-fr, -L * .06); g.quadraticCurveTo(-fr * 1.15, top * .6, 0, top); g.quadraticCurveTo(fr * 1.15, top * .6, fr, -L * .06); g.closePath(); }, '#fbf3d6', 3.5);
    if (eat > .05) ol(g, () => { g.moveTo(-fr * .85, top + fr * .35); g.quadraticCurveTo(0, top + fr * 1.0, fr * .85, top + fr * .35); }, '#fbf3d6', 3);
  }
  for (const s of [-1, 1, 0]) { // three strips: two spring out to the sides, the middle one folds down in front
    const sw = s === 0 ? Math.PI * .93 * p : s * (p * 1.0 + droop * 1.45);
    g.save(); g.translate(s * L * .075, -L * .08); g.rotate(sw);
    ol(g, () => { g.moveTo(-L * .085, 0); g.quadraticCurveTo(-L * .1, -L * .45, 0, -L * .64); g.quadraticCurveTo(L * .1, -L * .45, L * .085, 0); g.closePath(); }, BAN, 3.5);
    if (s !== 0 || p < .5) { g.beginPath(); g.moveTo(0, -L * .05); g.quadraticCurveTo(L * .02, -L * .35, 0, -L * .55); g.strokeStyle = BAN2; g.lineWidth = L * .03; g.stroke(); }
    if (p < .15) ol(g, ell(g, 0, -L * .64, L * .03, L * .025), TIP, 3);
    g.restore();
  }
  ol(g, () => { g.moveTo(-L * .14, -L * .08); g.lineTo(L * .14, -L * .08); g.quadraticCurveTo(L * .12, L * .12, L * .05, L * .2); g.lineTo(-L * .05, L * .2); g.quadraticCurveTo(-L * .12, L * .12, -L * .14, -L * .08); g.closePath(); }, BAN, 3.5);
  ol(g, () => { g.moveTo(-L * .04, L * .19); g.lineTo(L * .04, L * .19); g.lineTo(L * .03, L * .32); g.lineTo(-L * .03, L * .32); g.closePath(); }, '#8a6a2c', 3);
  g.restore();
}

// ---------------------------------------------------------------- who does what, as a pure function of t (layout L)
const a5_hb = (L, x, X, Y) => [(X - x) / L.s, (Y - L.gy) / L.s];
// the banana in screen space: { X, Y, a, len, open, p, eat, who }
function a5_ban(t, L) {
  const s = L.s, len = .5 * s;
  const lap = [L.hx + .02 * s, L.gy - .3 * s], chest = [L.sx - .1 * s, L.gy - .44 * s], up = [L.sx - .16 * s, L.gy - .58 * s];
  const mouth = [L.hx + .06 * s, L.gy - .76 * s], share = [L.sx - .2 * s, L.gy - .55 * s];
  const lift = [L.hx + .3 * s, L.gy - .4 * s], lk = eio(seg(t, 132.95, 133.4));
  if (t < 126.6) { // carried in as he trudges in, then set in his lap as he sits
    const hx = lerp(L.hx - 1.1 * s, L.hx, eo(seg(t, 125.5, 126.3))), k = eio(seg(t, 126.25, 126.6)), ph = t * 2.3 * TAU;
    return { X: lerp(hx + .5 * s, lap[0], k), Y: lerp(L.gy - .26 * s - Math.sin(ph) * .05 * s, lap[1], k), a: lerp(1.3, -.08, k), len, open: false, who: 'him' };
  }
  if (t < 133.46) return { X: lerp(lap[0], lift[0], lk), Y: lerp(lap[1], lift[1], lk), a: lerp(-.08, .1, lk), len, open: false, who: 'him' };
  if (t < 134.62) {
    const u = eio(seg(t, 133.46, 133.89)), r = eio(seg(t, 133.89, 134.35)), v = eio(seg(t, 133.89, 134.35));
    const X = lerp(lerp(lift[0], chest[0], u), up[0], v), Y = lerp(lerp(lift[1], chest[1], u), up[1], v) - Math.sin(r * Math.PI) * .06 * s;
    return { X, Y, a: lerp(.1, -Math.PI / 2, r), len, open: false, who: 'her', squeeze: seg(t, 134.42, 134.6) };
  }
  // open: origin of a5_open sits .2 len above the stem end of the closed banana
  const p = back(seg(t, 134.62, 134.95));
  let X = up[0], Y = up[1] + .2 * len, eat = 0, a = 0;
  if (t >= 137.85) {
    const go = eio(seg(t, 137.85, 138.75)), ret = eio(seg(t, 139.35, 139.85));
    const ao = -1.0, mo = [mouth[0] + Math.sin(-ao) * .6 * len, mouth[1] + Math.cos(ao) * .6 * len];
    X = lerp(lerp(up[0], mo[0], go), share[0], ret); Y = lerp(lerp(up[1] + .2 * len, mo[1], go), share[1] + .2 * len, ret);
    a = lerp(lerp(0, ao, go), -.15, ret);
    eat = eo(seg(t, 139.15, 139.3)) * .3;
  }
  return { X, Y, a, len, open: true, p, eat, droop: eio(seg(t, 135.7, 136.4)), who: 'her' };
}
function a5_drawBan(g, x, gy, s, b) { // inside a character's callback (body units, flip 1)
  const bx = (b.X - x) / s, by = (b.Y - gy) / s, l = b.len / s;
  if (b.open) a5_open(g, bx, by, l, b.a, b.p, b.eat, b.droop || 0); else banana(g, bx, by, l, b.a, 1, b.squeeze || 0);
}
function a5_hisP(t, L) {
  const s = L.s;
  let x = L.hx;
  const P = { sit: true, handL: [-.32, -.32], handR: [.32, -.3], bendL: 30, bendR: -30, eyes: 'half', brow: -.7, mouth: 'frown', look: [0, 1], tilt: .1, big: 0 };
  if (t < 126.55) { // he trudges in and sits
    const u = seg(t, 125.5, 126.3), ph = t * 2.3 * TAU, w = 1 - seg(t, 126.1, 126.3);
    x = lerp(L.hx - 1.1 * s, L.hx, eo(u));
    const b = a5_ban(t, L);
    Object.assign(P, { sit: false, handL: [-.48, -.2 + Math.sin(ph) * .05 * w], handR: [(b.X - x) / s + .02, (b.Y - L.gy) / s + .06], bendL: -20, bendR: 20, lean: .04 * w,
      squash: Math.abs(Math.sin(ph)) * .03 * w + seg(t, 126.3, 126.55) * .07, look: [.4, .7], tilt: .05 });
  } else {
    P.squash = -ring(t - 126.55, 22, 8) * .06;
  }
  const sigh = Math.max(0, Math.sin(cl((t - 128.5) / 1.1) * Math.PI));
  if (t >= 126.55) P.squash += -sigh * .025;
  if (sigh > .3 && t < 130) P.mouth = 'o';
  if ((t % 4.1) > 3.98) P.eyes = 'shut';
  // her reflection: he sees it
  if (t >= 130.74) { const k = eo(seg(t, 130.74, 131.0)); P.eyes = 'open'; P.brow = lerp(-.7, .1, k); P.look = [lerp(0, .7, k), 1]; P.mouth = 'flat'; P.tilt = .1; }
  if (t >= 132.72) { const k = eo(seg(t, 132.72, 133.0)); P.look = [lerp(.7, 1, k), lerp(1, -.1, k)]; P.tilt = lerp(.1, -.08, k); P.brow = -.2; P.mouth = 'o'; }
  if (t >= 132.95 && t < 133.46) { const b = a5_ban(t, L), lk = eio(seg(t, 132.95, 133.4)); P.handR = [lerp(.32, (b.X - x) / s + .14, lk), lerp(-.3, (b.Y - L.gy) / s + .02, lk)]; P.bendR = -40; }
  if (t >= 133.46) { const k = eio(seg(t, 133.46, 133.8)); P.look = [.9, .2]; P.handL = [-.36, -.28]; P.handR = [lerp(.5, .4, k), lerp(-.38, -.32, k)]; P.mouth = 'flat'; P.brow = -.3; }
  if (t >= 134.62) { // the pop
    const k = eo(seg(t, 134.62, 134.8));
    P.big = k; P.mouth = 'o'; P.lean = -ring(t - 134.62, 14, 5) * .07 - .03 * k; P.look = [.8, -.2]; P.brow = 0;
    P.handL = [-.38, -.4 + .1 * k]; P.handR = [.42, -.42];
  }
  if (t >= 137.85) { // she offers; he leans in, bites, chews
    const lean = eio(seg(t, 138.1, 138.9)) * (1 - eio(seg(t, 139.4, 139.8)));
    P.lean = .1 * lean; P.big = t < 139.15 ? 1 : 1 - seg(t, 139.15, 139.4); P.look = [.6, .3];
    if (t >= 139.15) { P.mouth = 'chew'; P.chew = (t - 139.15) * 18; P.eyes = 'open'; }
  }
  if (t >= 139.75) { // he laughs
    const k = seg(t, 139.75, 141.5);
    P.big = 0; P.eyes = 'happy'; P.mouth = 'grin'; P.brow = 0; P.tilt = -.12 + Math.sin(t * 15) * .03 * (1 - k * .5); P.squash = Math.abs(Math.sin(t * 15)) * .035;
    P.handL = [-.42, -.42 + Math.abs(Math.sin(t * 15)) * .05]; P.handR = [.45, -.45];
  }
  if (t >= 141.5) { // dawn: he watches the light come up
    const k = eo(seg(t, 141.5, 142.5));
    P.eyes = t > 144 ? 'open' : 'happy'; P.mouth = 'smile'; P.tilt = lerp(-.12, -.14, k); P.squash = 0; P.look = [.9, -.7]; P.handL = [-.34, -.32]; P.handR = [.36, -.32];
  }
  P.x = x;
  return P;
}
function a5_herP(t, L) {
  if (t < 130.74) return null;
  const s = L.s;
  let x = L.sx;
  const P = { sit: true, handL: [-.32, -.32], handR: [.32, -.3], bendL: 30, bendR: -30, eyes: 'open', brow: .2, mouth: 'smile', look: [-.8, .6], tilt: .05 };
  if (t < 131.89) { // she walks in from the right, slows, stands
    const u = seg(t, 130.74, 131.55), ph = t * 2.3 * TAU, w = 1 - seg(t, 131.4, 131.6);
    x = lerp(L.sx + 1.4 * s, L.sx, eo(u));
    Object.assign(P, { sit: false, handL: [-.48, -.2 + Math.sin(ph) * .05 * w], handR: [.48, -.2 - Math.sin(ph) * .05 * w], bendL: -20, bendR: 20, lean: -.03 * w,
      squash: Math.abs(Math.sin(ph)) * .03 * w + seg(t, 131.65, 131.89) * .07, look: [-.9, .5], tilt: -.05 });
  } else P.squash = -ring(t - 131.89, 22, 8) * .06;
  if (t >= 132.35) { const k = eo(seg(t, 132.35, 132.6)); P.look = [lerp(-.8, -.9, k), lerp(.6, 1, k)]; P.tilt = .12 * k; P.brow = 0; }
  const b = a5_ban(t, L), hb = (X, Y) => a5_hb(L, x, X, Y);
  if (t >= 133.0 && t < 133.46) { // she reaches across, gently
    const k = eio(seg(t, 133.05, 133.42)); const tgt = hb(b.X - .02 * s, b.Y - .02 * s);
    P.handL = [lerp(-.32, tgt[0], k), lerp(-.32, tgt[1], k)]; P.bendL = lerp(30, 10, k); P.lean = -.05 * k;
  }
  if (t >= 133.46 && t < 134.62) {
    const ca = Math.cos(b.a), sa = Math.sin(b.a), hl = b.len * .36;
    P.handL = hb(b.X - ca * hl, b.Y - sa * hl); P.bendL = 20;
    const pinch = seg(t, 134.35, 134.55);
    const hr = hb(b.X + ca * hl, b.Y + sa * hl), tip = hb(b.X + ca * b.len * .52, b.Y + sa * b.len * .52);
    P.handR = [lerp(hr[0], tip[0], pinch), lerp(hr[1], tip[1], pinch)]; P.bendR = -20;
    P.look = [-.4, .2]; P.tilt = .06; P.brow = .3; P.mouth = 'smile';
  }
  if (t >= 134.62) {
    P.handL = hb(b.X, b.Y + b.len * .14); P.bendL = 25;
    const k = eo(seg(t, 134.62, 135.0));
    P.handR = [lerp(.1, .4, k), lerp(-.8, -.4, k)]; P.eyes = t > 135.1 ? 'happy' : 'open'; P.look = [-.9, -.1]; P.tilt = -.05; P.mouth = 'smile';
  }
  if (t >= 137.85) { P.handR = [.36, -.32]; P.eyes = 'open'; P.look = [-1, -.2]; P.tilt = .1; P.mouth = 'smile'; P.bendL = 10; }
  if (t >= 139.75) { P.eyes = 'happy'; P.mouth = 'grin'; P.tilt = .1 + Math.sin(t * 14 + 1) * .03; P.squash = Math.abs(Math.sin(t * 14 + 1)) * .03; }
  if (t >= 141.5) { P.eyes = t > 144.2 ? 'open' : 'happy'; P.mouth = 'smile'; P.tilt = -.1; P.squash = 0; P.look = [.6, -.7]; P.handR = [.34, -.32]; }
  P.x = x; P.ban = b;
  return P;
}
// both of them (and the banana) for layout L
function a5_cast(g, t, L) {
  const H0 = a5_hisP(t, L), S0 = a5_herP(t, L), b = a5_ban(t, L);
  gorilla(g, H0.x, L.gy, L.s, Object.assign({}, H0, { front: b.who === 'him' ? (gg) => a5_drawBan(gg, H0.x, L.gy, L.s, b) : null, after: (gg) => a5_bigEyes(gg, H0, H0.big) }));
  if (S0) a5_her(g, S0.x, L.gy, L.s, Object.assign({}, S0, { front: b.who === 'her' ? (gg) => a5_drawBan(gg, S0.x, L.gy, L.s, b) : null }));
}

// ---------------------------------------------------------------- the pond (no outlines; drawn into jungle's land layer)
let a5_RB = null;
function a5_reflect(g, wy, t, alpha, tint, fn) {
  if (!a5_RB) { a5_RB = document.createElement('canvas'); a5_RB.width = W; a5_RB.height = H; }
  const r = a5_RB.getContext('2d'), m = g.getTransform();
  r.setTransform(1, 0, 0, 1, 0, 0); r.clearRect(0, 0, W, H); r.setTransform(m); r.translate(0, 2 * wy); r.scale(1, -1);
  fn(r);
  r.setTransform(1, 0, 0, 1, 0, 0); r.globalCompositeOperation = 'source-atop'; r.fillStyle = tint; r.fillRect(0, 0, W, H); r.globalCompositeOperation = 'source-over';
  const sy0 = m.d * wy + m.f, band = 3;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha;
  for (let y = Math.max(0, Math.floor(sy0)); y < H; y += band) {
    const d = (y - sy0) / m.d, off = Math.sin(y * .06 / m.d - t * 2.6) * (1 + d * .012) * m.d;
    g.drawImage(a5_RB, 0, y, W, band, off, y, W, band);
  }
  g.restore();
}
function a5_lily(g, x, y, r, rot, col) { g.fillStyle = col; g.beginPath(); g.moveTo(x, y); g.ellipse(x, y, r, r * .32, 0, rot + .35, rot + TAU - .35); g.closePath(); g.fill(); }
function a5_lotus(g, x, y, r, open, col = '#f7b6cf') {
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * (.18 + .3 * open), len = r * (1.1 - Math.abs(i - 3) * .08);
    g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2); g.fillStyle = i % 2 ? col : mixHex(col, '#ffffff', .35);
    g.beginPath(); g.ellipse(0, -len * .5, len * .22, len * .5, 0, 0, TAU); g.fill(); g.restore();
  }
  if (open > .3) { g.fillStyle = '#ffd75e'; g.beginPath(); g.arc(x, y - r * .15, r * .18 * open, 0, TAU); g.fill(); }
}
function a5_water(g, t, wy, pal, bloom) {
  g.fillStyle = vgrad(g, wy, H, [[0, mixHex(pal.sky[2], '#ffffff', .12)], [.35, pal.sky[1]], [1, pal.sky[0]]]);
  g.beginPath(); g.moveTo(-60, wy + 4);
  for (let i = 0; i <= 12; i++) { const x = i * 170 - 60; g.quadraticCurveTo(x + 85, wy + 4 + (i % 2 ? 5 : -3), x + 170, wy + 4); }
  g.lineTo(W + 60, H + 60); g.lineTo(-60, H + 60); g.closePath(); g.fill();
  // soft horizontal ripple bands
  g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 2; const rr = M32(51);
  for (let i = 0; i < 40; i++) { const y = wy + 20 + rr() * (H - wy), x = rr() * W, l = 40 + rr() * 140, dx = Math.sin(t * .7 + i) * 12; g.beginPath(); g.moveTo(x + dx, y); g.lineTo(x + dx + l, y); g.stroke(); }
  // lily pads, some with lotus that open at sunrise
  const lr = M32(52);
  for (let i = 0; i < 9; i++) {
    const x = 100 + lr() * 1720, y = wy + 150 + lr() * (H - wy - 160), r = 34 + lr() * 30 * (y / H), rot = lr() * TAU;
    if (x > 560 && x < 1300 && y < wy + 300) continue;
    a5_lily(g, x, y + Math.sin(t * .8 + i) * 2, r, rot, i % 2 ? '#3f7a4c' : '#4f8f57');
    if (i % 3 === 0) a5_lotus(g, x + r * .2, y - 6, r * .55, cl(bloom - i * .04));
  }
}
function a5_bank(g, t, wy) {
  // the far bank's lip and reeds; the near-bank reeds in the corners
  g.fillStyle = '#4c7d3a'; g.beginPath(); g.moveTo(-60, wy + 6); for (let i = 0; i <= 24; i++) { const x = i * 85 - 60; g.quadraticCurveTo(x + 42, wy - 4, x + 85, wy + 6); } g.lineTo(W + 60, wy - 12); g.lineTo(-60, wy - 12); g.closePath(); g.fill();
  const reed = (x, y, h, lean, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x - 5, y); g.quadraticCurveTo(x + lean * .4, y - h * .6, x + lean, y - h); g.quadraticCurveTo(x + lean * .4 + 2, y - h * .6, x + 5, y); g.closePath(); g.fill(); };
  const rr = M32(61);
  for (let i = 0; i < 40; i++) { const x = rr() * W; if (x > 600 && x < 1300) continue; reed(x, wy + 4, 40 + rr() * 70, (rr() - .5) * 30 + Math.sin(t * 1.1 + i) * 4, rr() < .5 ? '#3e7140' : '#56914f'); }
  for (const [x0, dir] of [[40, 1], [W - 40, -1]]) for (let i = 0; i < 16; i++) {
    const x = x0 + dir * i * 16 + Math.sin(i * 2.3) * 10, h = 200 + (i * 37) % 160;
    reed(x, H + 20, h, dir * (20 + i * 3) + Math.sin(t * 1.2 + i) * 6, i % 2 ? '#2f5a34' : '#3e7140');
    if (i % 4 === 1) { g.fillStyle = '#6a4b33'; g.beginPath(); g.ellipse(x + dir * (20 + i * 3) * .85, H + 20 - h * .85, 9, 26, dir * .2, 0, TAU); g.fill(); }
  }
}
// lights on the water, drawn over the washed land so they stay bright: the moon (or sun) path, star glints, fireflies
function a5_waterLights(g, t, wy, pal, o) {
  const sx = o.sunX, isNight = pal.stars;
  g.save(); g.globalCompositeOperation = 'screen';
  const col = o.pathCol || pal.sun, rr = M32(71);
  for (let i = 0; i < 26; i++) {
    const y = wy + 18 + i * i * .62, w = (16 + i * 4.2) * (o.pathW || 1), x = sx + Math.sin(t * 2 + i * 1.9) * (8 + i * 1.5) + (rr() - .5) * 20;
    g.globalAlpha = (.55 - i * .015) * (o.pathA ?? 1); g.fillStyle = col; g.beginPath(); g.ellipse(x, y, w, 2.5 + i * .12, 0, 0, TAU); g.fill();
  }
  if (isNight > 0) {
    const sr = M32(72); g.fillStyle = '#fffbe8';
    for (let i = 0; i < 50; i++) { const x = sr() * W, y = wy + 30 + sr() * (H - wy - 40); g.globalAlpha = isNight * .5 * (.3 + .7 * Math.abs(Math.sin(t * (.6 + sr()) + i))); g.fillRect(x + Math.sin(t + i) * 3, y, 2.4, 1.2); }
  }
  g.restore();
  if (o.flies) a5_fireflies(g, t, o.flies, o.box);
}
function a5_fireflies(g, t, a, box) {
  const r = M32(81); g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 22; i++) {
    const x0 = r() * W, y0 = 300 + r() * 520, sp = .3 + r() * .5, ph = r() * TAU;
    const x = x0 + Math.sin(t * sp + ph) * 60 + Math.sin(t * sp * 2.3 + i) * 20, y = y0 + Math.cos(t * sp * 1.3 + ph) * 40;
    let fl = a * (.4 + .6 * Math.max(0, Math.sin(t * (1.5 + r()) + ph)));
    if (box && x > box[0] && x < box[2] && y > box[1] && y < box[3]) fl = 0;
    if (fl <= 0) continue;
    const gr = g.createRadialGradient(x, y, 0, x, y, 22); gr.addColorStop(0, `rgba(230,255,150,${fl * .9})`); gr.addColorStop(1, 'rgba(230,255,150,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, 22, 0, TAU); g.fill();
    g.fillStyle = `rgba(250,255,210,${fl})`; g.beginPath(); g.arc(x, y, 2.6, 0, TAU); g.fill();
  }
  g.restore();
}
function a5_glow(g, x, y, r, a, col = '255,214,140') {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = 'screen';
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.45, `rgba(${col},${a * .4})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}
// the pond scene: jungle + water + both of them and their reflections in the land layer, lights on top
function a5_pond(g, t, L, o = {}) {
  const sky = o.sky ?? a5_sky(t), pal = palette(sky), wy = L.gy + 3, night = pal.stars;
  const sunX = o.sunX ?? 1430, sunY = o.sunY ?? 165, sunR = o.sunR ?? 56;
  jungle(g, t, { sky, hz: o.hz ?? a5_HZ, treeX: o.treeX ?? 150, tree: o.tree, ferns: false, sunX, sunY, sunR, rays: o.rays ?? 0, raysX: o.raysX, land: (lg) => {
    if (o.preLand) o.preLand(lg);
    a5_water(lg, t, wy, pal, o.bloom || 0);
    const tint = `rgba(${Math.round(lerp(40, 255, 1 - night))},${Math.round(lerp(60, 230, 1 - night))},${Math.round(lerp(110, 200, 1 - night))},${lerp(.3, .18, 1 - night)})`;
    a5_reflect(lg, wy, t, o.reflA ?? .6, tint, (rg) => a5_cast(rg, t, L));
    a5_bank(lg, t, wy);
    a5_cast(lg, t, L);
    if (o.postLand) o.postLand(lg);
  } });
  // once it is open the banana glows: draw it again over the night wash so it reads bright
  if (t >= 134.62 && o.litBan !== false) {
    const S0 = a5_herP(t, L), b = a5_ban(t, L);
    if (S0) { g.save(); g.translate(S0.x, L.gy); g.scale(L.s, L.s * (1 - (S0.squash || 0))); g.rotate(S0.lean || 0); a5_drawBan(g, S0.x, L.gy, L.s, b); g.restore(); }
  }
  a5_waterLights(g, t, wy, pal, { sunX, flies: o.flies ?? night * .9, box: o.box ?? [L.hx - .9 * L.s, L.gy - 1.5 * L.s, L.sx + .9 * L.s, L.gy + 1.4 * L.s], pathCol: o.pathCol, pathA: o.pathA, pathW: o.pathW });
}

// ---------------------------------------------------------------- the canopy at sunrise (a painted world, no outlines)
function a5_bird(g, x, y, s, flap, col) {
  const w = Math.sin(flap);
  g.fillStyle = col; g.beginPath();
  for (const d of [-1, 1]) { g.moveTo(0, -s * .05); g.quadraticCurveTo(d * s * .45, -s * .5 * w - s * .18, d * s, -s * .6 * w); g.quadraticCurveTo(d * s * .45, -s * .3 * w + s * .02, 0, s * .16); }
  g.fill(); g.beginPath(); g.ellipse(0, s * .04, s * .1, s * .16, 0, 0, TAU); g.fill();
}
function a5_birdAt(g, x, y, s, flap, col) { g.save(); g.translate(x, y); a5_bird(g, 0, 0, s, flap, col); g.restore(); }
function a5_bloom(g, x, y, r, open, col) {
  if (open <= 0) return;
  const rr = r * (.35 + .65 * open);
  g.fillStyle = col;
  for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + open * .5; g.beginPath(); g.ellipse(x + Math.cos(a) * rr * .55, y + Math.sin(a) * rr * .55, rr * .45 * open + rr * .12, rr * .3, a, 0, TAU); g.fill(); }
  g.fillStyle = '#ffe07a'; g.beginPath(); g.arc(x, y, rr * .26, 0, TAU); g.fill();
}
function a5_sunRays(g, t, cx, cy, a0) {
  g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 16; i++) {
    const a = i * TAU / 16 + t * .05, w = .07 + .03 * Math.sin(t * .8 + i * 2.1);
    g.fillStyle = `rgba(255,226,150,${(.09 + .05 * Math.sin(t * 1.1 + i)) * a0})`;
    g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 2600, a - w, a + w); g.closePath(); g.fill();
  }
  g.restore();
}
function a5_sunrise(g, t, cx, cy, r, glow) {
  // turning rays, stepped gold halo, disc
  a5_sunRays(g, t, cx, cy, glow);
  for (let i = 6; i >= 1; i--) { g.fillStyle = `rgba(255,${236 - i * 7},${180 - i * 16},${(.1 + (6 - i) * .05) * glow})`; g.beginPath(); g.arc(cx, cy, r * (1 + i * .55), 0, TAU); g.fill(); }
  a5_glow(g, cx, cy, r * 9, .55 * glow, '255,196,110');
  g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  g.fillStyle = '#fff6d2'; g.beginPath(); g.arc(cx, cy, r * .84, 0, TAU); g.fill();
}
// rise: 0 = down among the treetops .. 1 = above the canopy. The sun is far, so it stays put; the crowns sink as the camera climbs.
function a5_canopy(g, t, rise, o = {}) {
  g.fillStyle = vgrad(g, -200, 760, [[0, '#62afcc'], [.3, '#b8e0d8'], [.58, '#ffe6a6'], [.82, '#ffc77c'], [1, '#ffb266']]); g.fillRect(-W, -H, 3 * W, 3 * H);
  const sx = 960, sy = 420 + (o.sunDy || 0);
  a5_sunrise(g, t, sx, sy, 128, o.glow ?? 1);
  const layers = [
    { base: 610, D: 280, col: '#d9e3bf', lit: '#fff0c4', seed: 1, n: 30, r: 44, mist: 0 },
    { base: 700, D: 310, col: '#b6d2a2', lit: '#ffe6a8', seed: 2, n: 22, r: 66, mist: .28 },
    { base: 820, D: 350, col: '#8dbb84', lit: '#f6dc92', seed: 3, n: 16, r: 96, mist: .22 },
    { base: 1000, D: 400, col: '#62a067', lit: '#e3d57e', seed: 4, n: 12, r: 135, mist: .16 },
    { base: 1250, D: 430, col: '#3f7a4c', lit: '#a9c766', seed: 5, n: 9, r: 200, mist: 0 },
  ];
  layers.forEach((Lr, li) => {
    const Y = Lr.base - (1 - rise) * Lr.D;
    const r = M32(Lr.seed * 11), pts = [...Array(Lr.n + 2)].map((_, i) => [i * (W + 200) / Lr.n - 100 + (r() - .5) * Lr.r * .6, Y - r() * Lr.r * .7, Lr.r * (.75 + r() * .5)]);
    blobs(g, pts.map(([x, y2, rr]) => [x + rr * .06, y2 - rr * .1, rr * .93]), Lr.lit); // lit rims toward the sun
    blobs(g, pts.map(([x, y2, rr]) => [x, y2 + rr * .06, rr]), Lr.col);
    g.fillStyle = Lr.col; g.fillRect(-100, Y + Lr.r * .2, W + 200, H * 3);
    // leaf clusters in the body of the nearer layers
    if (li >= 2) for (const [dy, k] of [[1.25, .1], [2.5, .18]]) { // lower tiers of crowns inside the layer
      const cr = M32(Lr.seed * 17 + dy * 10), row = [...Array(Lr.n + 2)].map((_, i) => [i * (W + 200) / Lr.n - 100 + Lr.r * .5 + (cr() - .5) * Lr.r * .6, Y + Lr.r * dy - cr() * Lr.r * .4, Lr.r * (.7 + cr() * .4)]);
      blobs(g, row.map(([x, y2, rr]) => [x + rr * .06, y2 - rr * .1, rr * .93]), mixHex(Lr.lit, Lr.col, .55));
      blobs(g, row.map(([x, y2, rr]) => [x, y2 + rr * .06, rr]), mixHex(Lr.col, '#1d3a24', k));
      g.fillStyle = mixHex(Lr.col, '#1d3a24', k); g.fillRect(-100, Y + Lr.r * (dy + .3), W + 200, H * 3);
    }
    // blossoms opening across the crowns
    const fr = M32(Lr.seed * 23), cols = ['#f7b6cf', '#ffffff', '#f2a65a', '#f28fb8', '#fff1a8'];
    for (let i = 0; i < Lr.n * 2; i++) {
      const [x, y2, rr] = pts[(fr() * pts.length) | 0], a = -Math.PI * (.15 + fr() * .7), d = rr * (.55 + fr() * .35);
      const t0 = (o.bloomT ?? 147) + fr() * 3.5 + li * .3;
      a5_bloom(g, x + Math.cos(a) * d, y2 + Math.sin(a) * d + rr * .2, 6 + li * 4 + fr() * 6, back(seg(t, t0, t0 + .5)), cols[(fr() * cols.length) | 0]);
    }
    if (Lr.mist > 0) { g.fillStyle = vgrad(g, Y - Lr.r, Y + Lr.r * 2, [[0, 'rgba(255,236,200,0)'], [.5, `rgba(255,236,200,${Lr.mist})`], [1, 'rgba(255,236,200,0)']]); g.fillRect(-100, Y - Lr.r, W + 200, Lr.r * 3); }
    if (o.onLayer) o.onLayer(g, li, Y, rise);
  });
  const lit = o.light ?? 1;
  a5_sunRays(g, t, sx, sy, .7 * lit);
  a5_glow(g, sx, sy + 140, 1500, .42 * lit, '255,190,100');
  a5_glow(g, sx, sy, 600, .45 * lit, '255,236,180');
}

// ---------------------------------------------------------------- little Bob, in this look (faces +x)
function a5_bob(g, x, gy, s, t) {
  const ph = t * 2.4 * TAU, bob = -Math.abs(Math.sin(ph)) * .03, sw = Math.sin(ph) * .38;
  const HAT = '#c8352b', TUN = '#3d6fa8', LEG = '#f0c23a', SKIN = '#f3c9a0', SHOE = '#2f2a33', PIANO = '#8a5a35', PANEL = '#f1c84a', GOLD = '#e0b13a';
  g.save(); g.translate(x, gy); g.scale(s, s);
  const k = 1 / s, olk = (p, f, lw = LW) => ol(g, p, f, lw);
  const tube = (p0, p1, bend, w, col) => { const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1, cx = mx - dy / L * bend, cy = my + dx / L * bend;
    for (const [c, w2] of [[INK, w + LW * 2 * k], [col, w]]) { g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = c; g.lineWidth = w2; g.lineCap = 'round'; g.stroke(); } };
  // the toy piano on a rope, and the three Junos hopping behind it
  const px = -1.05, pj = Math.sin(ph * 2) * .008;
  for (let i = 0; i < 3; i++) {
    const jx = px - .55 - i * .3, hop = Math.abs(Math.sin(ph * .9 + i * 1.3)) * .12;
    g.save(); g.translate(jx, -hop); g.rotate(Math.sin(ph * .9 + i * 1.3) * .08);
    olk(() => g.rect(-.075, -.05, .15, .05), '#2e2a30', 4);
    olk(() => { g.moveTo(-.025, -.05); g.lineTo(.025, -.05); g.lineTo(.02, -.17); g.lineTo(.075, -.3); g.lineTo(.05, -.31); g.lineTo(.005, -.22); g.lineTo(-.005, -.22); g.lineTo(-.05, -.31); g.lineTo(-.075, -.3); g.lineTo(-.02, -.17); g.closePath(); }, GOLD, 3.5);
    olk(ell(g, 0, -.255, .032, .032), GOLD, 3.5);
    g.restore();
  }
  g.strokeStyle = INK; g.lineWidth = 3 * k; g.beginPath(); g.moveTo(px - .3, -.05 + pj); g.quadraticCurveTo(px - .42, .0, px - .55, -.03); g.stroke();
  for (const wx of [-.2, .2]) olk(ell(g, px + wx, -.045 + pj, .045, .045), SHOE, 4);
  olk(() => g.rect(px - .3, -.48 + pj, .6, .4), PIANO);
  olk(() => g.rect(px - .22, -.44 + pj, .44, .13), PANEL, 4);
  olk(() => g.rect(px - .32, -.28 + pj, .64, .07), '#fbf6ea', 4);
  g.strokeStyle = INK; g.lineWidth = 2.5 * k; g.beginPath(); for (let i = -4; i <= 4; i++) { g.moveTo(px + i * .065, -.28 + pj); g.lineTo(px + i * .065, -.24 + pj); } g.stroke();
  // the rope from his back hand to the piano
  const hipY = -.32 + bob, shY = -.6 + bob;
  const backHand = [-.2, -.42 + bob];
  g.strokeStyle = '#7a5a3a'; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(backHand[0], backHand[1]); g.quadraticCurveTo(-.55, -.3, px + .3, -.4 + pj); g.stroke();
  // back arm, back leg
  tube([-.05, shY + .04], backHand, .04, .075, HAT); olk(ell(g, backHand[0], backHand[1], .04, .04), SKIN, 4);
  const foot = (a) => [Math.sin(a) * .2, -.02];
  const fb = foot(-sw), ff = foot(sw);
  tube([-.04, hipY], [fb[0], fb[1] - .03 - Math.max(0, -Math.sin(ph)) * .04], -.02, .08, LEG); olk(ell(g, fb[0] + .03, fb[1] - .01 - Math.max(0, -Math.sin(ph)) * .04, .07, .035), SHOE, 4);
  tube([.04, hipY], [ff[0], ff[1] - .03 - Math.max(0, Math.sin(ph)) * .04], .02, .08, LEG); olk(ell(g, ff[0] + .03, ff[1] - .01 - Math.max(0, Math.sin(ph)) * .04, .07, .035), SHOE, 4);
  // tunic
  olk(() => { g.moveTo(-.1, shY); g.lineTo(.1, shY); g.quadraticCurveTo(.15, hipY - .05, .16, hipY + .02); g.lineTo(-.16, hipY + .02); g.quadraticCurveTo(-.15, hipY - .05, -.1, shY); g.closePath(); }, TUN);
  // the bundle on a stick over his front shoulder
  const fh = [.12, -.5 + bob], bt = [-.4, -1.0 + bob];
  g.strokeStyle = INK; g.lineWidth = .028 + LW * 2 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(fh[0] + .05, fh[1] + .04); g.lineTo(bt[0], bt[1]); g.stroke();
  g.strokeStyle = '#8a6a3c'; g.lineWidth = .028; g.stroke();
  olk(() => { g.moveTo(bt[0] - .1, bt[1] + .02); g.quadraticCurveTo(bt[0] - .12, bt[1] - .12, bt[0], bt[1] - .1); g.quadraticCurveTo(bt[0] + .1, bt[1] - .1, bt[0] + .08, bt[1] + .04); g.quadraticCurveTo(bt[0] + .02, bt[1] + .14, bt[0] - .1, bt[1] + .02); }, HAT);
  // head (chibi), profile to the right
  const hy = -.8 + bob;
  olk(ell(g, .02, hy, .17, .16), SKIN);
  olk(ell(g, .19, hy + .02, .035, .03), SKIN, 4);
  g.beginPath(); g.ellipse(.1, hy - .015, .02, .026, 0, 0, TAU); g.fillStyle = INK; g.fill();
  g.beginPath(); g.arc(.106, hy - .025, .007, 0, TAU); g.fillStyle = '#fff'; g.fill();
  g.strokeStyle = INK; g.lineWidth = LW * .8 * k; g.beginPath(); g.moveTo(.08, hy + .08); g.quadraticCurveTo(.12, hy + .1, .15, hy + .07); g.stroke();
  g.fillStyle = 'rgba(230,120,110,.5)'; g.beginPath(); g.ellipse(.05, hy + .05, .03, .02, 0, 0, TAU); g.fill();
  // red brimmed hat
  olk(() => { g.moveTo(-.12, hy - .08); g.quadraticCurveTo(-.13, hy - .29, .02, hy - .3); g.quadraticCurveTo(.16, hy - .29, .15, hy - .08); g.closePath(); }, HAT);
  olk(ell(g, .03, hy - .08, .26, .05, -.05), HAT);
  // front arm: sleeve to the hand holding the stick
  tube([.06, shY + .04], fh, -.05, .075, HAT); olk(ell(g, fh[0], fh[1], .04, .04), SKIN, 4);
  g.restore();
}

// ---------------------------------------------------------------- the shots
ACTS.push(...[
  // 1. (turn) night: a moonlit pond; he trudges in and sits on the far bank, the banana in his lap
  { t0: 125.5, t1: 128.0, draw(g, t, lt) {
    cam(g, lt, 2.5, 1.0, 1.08, 860, 560);
    a5_pond(g, t, a5_LB, {});
  } },
  // 2. closer: he looks down at his reflection, the moon in the water; a sigh
  { t0: 128.0, t1: 130.4, draw(g, t, lt) {
    cam(g, lt, 2.4, 1.75, 1.85, 860, 640);
    a5_pond(g, t, a5_LB, {});
    // a firefly touches the water; rings spread
    const tt = 129.4; if (t > tt) { const u = seg(t, tt, tt + 1.0); g.save(); g.strokeStyle = `rgba(220,240,255,${.5 * (1 - u)})`; g.lineWidth = 3; for (const k of [1, .6]) { g.beginPath(); g.ellipse(980, 780, 10 + u * 110 * k, 3 + u * 26 * k, 0, 0, TAU); g.stroke(); } g.restore(); }
  } },
  // 3. (bridge) the water: in the reflection a second gorilla appears beside his and sits down
  { t0: 130.4, t1: 132.2, draw(g, t, lt) {
    cam(g, lt, 1.8, 1.0, 1.04, 900, 400);
    a5_pond(g, t, a5_LW, { hz: -400, tree: false, sunX: 1480, reflA: .8, flies: .45 });
    // the moon in the water
    a5_glow(g, 1480, 700, 160, .35, '200,215,255');
    g.fillStyle = '#f2f0dc'; for (let i = 0; i < 9; i++) { const yy = 664 + i * 9, w = Math.sqrt(Math.max(0, 1 - Math.pow((i - 4) / 4.6, 2))) * 52; g.fillRect(1480 - w + Math.sin(t * 3 + i * 1.7) * 6, yy, w * 2, 5); }
    const k = seg(t, 130.74, 131.2); if (k > 0 && k < 1) for (let i = 0; i < 4; i++) sparkle(g, 1300 + Math.cos(i * 1.7) * 90, 560 + Math.sin(i * 1.7) * 60, 14 * (1 - k), 1 - k, '#eef3ff');
  } },
  // 4. the bank: she sits beside him, looks at the banana, takes it gently, turns it over
  { t0: 132.2, t1: 134.3, draw(g, t, lt) {
    cam(g, lt, 2.1, 1.6, 1.7, 940, 560);
    a5_pond(g, t, a5_LB, {});
  } },
  // 5. close: she pinches the other end; it opens, three strips spring, sparkles, a warm glow in the night
  { t0: 134.3, t1: 136.4, draw(g, t, lt) {
    cam(g, lt, 2.1, 2.5, 2.62, 985, 540);
    a5_pond(g, t, a5_LB, {});
    const b = a5_ban(t, a5_LB), pop = 134.62;
    if (t >= pop) {
      const u = seg(t, pop, pop + .7), cy = b.Y - b.len * .45;
      a5_glow(g, b.X, cy, 190, .42 * (1 - u * .4), '255,200,110');
      if (u < 1) { g.save(); g.strokeStyle = `rgba(255,240,190,${1 - u})`; g.lineCap = 'round'; g.lineWidth = 4; g.beginPath();
        for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + .3, r0 = 40 + eo(u) * 60, r1 = r0 + 26 * (1 - u) + 6; g.moveTo(b.X + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(b.X + Math.cos(a) * r1, cy + Math.sin(a) * r1); }
        g.stroke(); g.restore(); }
      for (let i = 0; i < 9; i++) { const ph = ((t - pop) * .9 + i / 9) % 1, a = i * 2.4; sparkle(g, b.X + Math.cos(a) * (40 + ph * 120), cy + Math.sin(a) * (30 + ph * 90) - ph * 30, 15 * (1 - ph) + 3, (1 - ph) * (t < pop + 2.4 ? 1 : .5)); }
    }
  } },
  // 6. his face: eyes huge
  { t0: 136.4, t1: 137.8, draw(g, t, lt) {
    cam(g, lt, 1.4, 2.9, 3.05, 815, 470);
    a5_pond(g, t, a5_LB, {});
    const b = a5_ban(t, a5_LB); a5_glow(g, b.X, b.Y - b.len * .45, 170, .3, '255,200,110');
    for (let i = 0; i < 4; i++) { const ph = (t * .8 + i / 4) % 1; sparkle(g, b.X + Math.cos(i * 1.9) * 70, b.Y - b.len * .5 + Math.sin(i * 1.9) * 50 - ph * 30, 11 * (1 - ph), 1 - ph); }
  } },
  // 7. (turnaround) she offers him the first bite
  { t0: 137.8, t1: 139.75, draw(g, t, lt) {
    cam(g, lt, 1.95, 2.0, 2.15, 920, 520);
    a5_pond(g, t, a5_LB, {});
    const b = a5_ban(t, a5_LB); a5_glow(g, b.X, b.Y - b.len * .4, 160, .28, '255,200,110');
  } },
  // 8. he laughs; she laughs
  { t0: 139.75, t1: 141.5, draw(g, t, lt) {
    cam(g, lt, 1.75, 2.0, 2.2, 930, 500);
    a5_pond(g, t, a5_LB, {});
    for (let i = 0; i < 7; i++) { const ph = ((t - 139.75) * 1.2 + i / 7) % 1; sparkle(g, 930 + Math.cos(i * 1.3) * (180 + ph * 80), 380 + Math.sin(i * 1.3) * (70 + ph * 40) - ph * 40, 13 * (1 - ph), 1 - ph); }
  } },
  // 9. (refrain 3) sunrise: the sky blooms night -> dawn -> day over the pond; the moon goes, the sun comes up
  { t0: 141.5, t1: 146.5, draw(g, t, lt) {
    cam(g, lt, 5.0, 1.12, 1.0, 960, 560);
    const up = eio(seg(t, 142.0, 146.3)), sunY = lerp(640, 230, up), sunR = lerp(60, 105, up);
    a5_pond(g, t, a5_LB, { sunX: 1450, sunY, sunR, rays: seg(t, 144, 146.5), raysX: 600, bloom: seg(t, 144.5, 146.3), flies: .9 * (1 - seg(t, 142, 143.5)),
      pathCol: mixHex('#f2f0dc', '#ffd27a', seg(t, 142.5, 144)), pathW: lerp(1, 1.8, up), reflA: .6 });
    // the moon sinks and fades; the dawn glow swells round the rising sun
    const mo = 1 - seg(t, 142, 144.5);
    if (mo > 0) { g.save(); g.globalAlpha = mo; g.fillStyle = '#f2f0dc'; g.beginPath(); g.arc(1430, 165 - (1 - mo) * 40, 56, 0, TAU); g.fill(); g.restore(); }
    const gl = eo(seg(t, 142.3, 145.6));
    a5_glow(g, 1450, sunY, 1400, .5 * gl, '255,170,90');
    a5_glow(g, 1450, sunY, 380, .55 * gl, '255,226,160');
    if (gl > 0) { g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < 14; i++) { const a = i * TAU / 14 + t * .04, w = .05 + .02 * Math.sin(t + i * 2.1); g.fillStyle = `rgba(255,222,150,${.08 * gl * seg(t, 143.5, 146)})`; g.beginPath(); g.moveTo(1450, sunY); g.arc(1450, sunY, 2400, a - w, a + w); g.closePath(); g.fill(); } g.restore(); }
    // birds lift off the far canopy
    const br = M32(91);
    for (let i = 0; i < 9; i++) { const t0 = 144.6 + br() * 1.4, u = seg(t, t0, t0 + 2.2); if (u <= 0) continue; const x = 300 + br() * 1300 + u * (200 + br() * 300), y = 470 - eo(u) * (250 + br() * 200); a5_birdAt(g, x, y, 14 + br() * 8, t * 14 + i, '#4a4038'); }
  } },
  // 10. the camera rises out of the trees over the canopy into the sunrise; birds lift, flowers open, the monkey opens
  //     his own banana from the bottom and nods; then the whole jungle lies under the sun (one long flowing move)
  { t0: 146.5, t1: 155.56, draw(g, t, lt) {
    const rise = eio(seg(t, 146.5, 152.0));
    cam(g, lt, 9.06, 1.0, 1.1, 960, 470);
    a5_canopy(g, t, rise, { bloomT: 147.2, glow: lerp(.8, 1.2, eo(seg(t, 146.5, 150))), light: lerp(.45, 1, eo(seg(t, 147.5, 151.5))) * (1 - .25 * seg(t, 154, 155.56)), onLayer: (gg, li, Y) => {
      if (li === 4) { // the monkey on a branch of an emergent tree, against the sky
        const bx = 1420, by = Y - 330;
        gg.fillStyle = '#5d4431'; gg.fillRect(bx - 22, by, 44, H * 2);
        gg.beginPath(); gg.moveTo(bx, by + 20); gg.quadraticCurveTo(bx - 140, by - 10, bx - 260, by + 6); gg.lineTo(bx - 260, by + 22); gg.quadraticCurveTo(bx - 140, by + 8, bx, by + 44); gg.closePath(); gg.fill();
        blobs(gg, [[bx + 30, by - 30, 70], [bx - 40, by - 50, 60], [bx + 90, by + 10, 55], [bx - 270, by + 4, 38]], '#d9d27e');
        blobs(gg, [[bx + 30, by - 22, 66], [bx - 40, by - 42, 56], [bx + 90, by + 18, 52], [bx - 270, by + 10, 34]], '#5c9a63');
        const op = 148.14, nod = 148.72;
        const p = t >= op ? back(seg(t, op, op + .32)) : 0, eat = t >= 149.4 ? eo(seg(t, 149.4, 149.6)) * .5 : 0;
        const nd = t >= nod ? Math.sin(cl((t - nod) / .9) * Math.PI * 3) * .18 * (1 - seg(t, nod, nod + .9)) : 0;
        monkey(gg, bx - 130, by + 8, 190, { eyes: t > op + .2 && t < 150.2 ? 'happy' : 'open', mouth: t > 149.6 ? 'chew' : 'smile', chew: (t - 149.6) * 16,
          look: t > nod ? [-.6, .6] : [.3, .4], tilt: nd + (t > nod ? -.1 : 0), handL: [.0, -.42], handR: [.16, -.36],
          hold: (h) => { if (p > 0) a5_open(h, .08, -.44, .32, -.15, p, eat, eio(seg(t, op + .6, op + 1.1))); else banana(h, .08, -.48, .32, -Math.PI / 2 - .15, 1, seg(t, op - .2, op)); } });
        if (t >= op && t < op + .5) sparkle(gg, bx - 115, by - 120, 26, 1 - seg(t, op, op + .5));
      }
    } });
    // birds lifting out of the canopy toward the light, then a flock across the sun
    const br = M32(93);
    for (let i = 0; i < 16; i++) {
      const t0 = 147.0 + br() * 3.5, u = seg(t, t0, t0 + 3.0), side = br() < .5 ? -1 : 1; if (u <= 0 || u >= 1) { br(); br(); br(); continue; }
      const x0 = 200 + br() * 1520, y0 = 760 + br() * 200, s0 = 10 + br() * 12;
      a5_birdAt(g, x0 + side * u * 260, y0 - eo(u) * 620, s0 * (1 + u * .3), t * 15 + i * 1.3, i % 3 ? '#4a4038' : '#fffaf0');
    }
    const fl = seg(t, 151.8, 155.4);
    if (fl > 0 && fl < 1) for (let i = 0; i < 9; i++) { const row = Math.abs(i - 4); a5_birdAt(g, lerp(-200, 2200, fl) - row * 70, 360 + row * 34 - fl * 60 + (i < 4 ? -row * 4 : 0), 16, t * 13 + i * .7, '#5a4636'); }
  } },
  // 11. back down in the clearing in morning light: the two of them with a little pile of bananas, opening them from the bottom
  { t0: 155.56, t1: 158.76, draw(g, t, lt) {
    cam(g, lt, 3.2, 1.08, 1.16, 940, 640);
    a5_morning(g, t, a5_LM, {});
  } },
  // 12. close: laughing, peels piling up
  { t0: 158.76, t1: 160.6, draw(g, t, lt) {
    cam(g, lt, 1.84, 1.55, 1.65, 940, 600);
    a5_morning(g, t, a5_LM, {});
  } },
  // 13. (outro) the two of them in the morning clearing; they lean together; fade to black
  { t0: 160.6, t1: 166.0, draw(g, t, lt) {
    cam(g, lt, 5.4, 1.05, 1.75, 1578, 1047); // a slow push in on the two of them: zooming about this point brings them to about (1100, 720)
    a5_morning(g, t, a5_LO, {});
    const f = seg(t, 165, 166); if (f > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(0,0,0,${f})`; g.fillRect(0, 0, W, H); g.restore(); }
  } },
]);

// ---------------------------------------------------------------- the morning clearing (shots 11-13)
// bananas they open in turn: { who, t0 (pick up), op (pinch open), end }
const a5_PILE = [
  { who: 'her', t0: 155.56, op: 155.94 },
  { who: 'him', t0: 156.5, op: 157.09 },
  { who: 'her', t0: 158.0, op: 158.76 },
  { who: 'him', t0: 159.2, op: 159.75 },
  { who: 'her', t0: 161.0, op: 161.6 },
  { who: 'him', t0: 162.4, op: 163.0 },
];
function a5_morning(g, t, L, o) {
  const s = L.s;
  jungle(g, t, { sky: a5_MORN, treeX: 300, sunX: 1520, sunY: 190, sunR: 80, raysX: 500, land: (lg) => {
    // a path across the back of the clearing
    lg.fillStyle = 'rgba(214,190,140,.55)'; lg.beginPath(); lg.moveTo(-50, 700); lg.quadraticCurveTo(960, 655, W + 50, 690); lg.lineTo(W + 50, 735); lg.quadraticCurveTo(960, 700, -50, 748); lg.closePath(); lg.fill();
    if (o.bob) {
      const bx = lerp(-80, 2000, seg(t, 160.6, 166.0));
      a5_bob(lg, bx, 712, 180, t);
    }
    a5_cast2(lg, t, L);
  } });
  a5_glow(g, 1520, 190, 900, .35, '255,226,160');
}
function a5_cast2(g, t, L) {
  const s = L.s;
  // the little pile between them: unopened bananas still in the pile, and the peels
  const mid = (L.hx + L.sx) / 2, gy = L.gy;
  const pr = M32(101), pile = [[-.22, -.04, .3], [-.02, -.06, -.2], [.2, -.04, .4], [-.12, -.15, -.1], [.1, -.16, .25], [-.02, -.25, .1], [.24, -.13, -.3], [-.26, -.12, .5], [.0, -.34, -.15]];
  const taken = a5_PILE.filter((b) => t >= b.t0).length; // the top ones go first
  const drawPile = () => { for (let i = 0; i < pile.length - taken; i++) { const [px, py, a] = pile[i]; banana(g, mid + px * s * .8, gy + (py + .16) * s, .36 * s, a, 1); } };
  // spent peels on the grass
  a5_PILE.forEach((b, i) => { if (t < b.op + 1.6) return; const side = b.who === 'him' ? -1 : 1; g.save(); g.translate(mid + side * (.62 + i * .05) * s, gy + .02 * s); a5_open(g, 0, 0, .28 * s, side * 1.45, 1, .95, .6); g.restore(); });
  const cur = (who) => { let c = null; for (const b of a5_PILE) if (b.who === who && t >= b.t0) c = b; return c; };
  const laughAt = (tt) => (tt >= 157.92 && tt < 160.9) || (tt >= 161.9 && tt < 162.9);
  for (const who of ['him', 'her']) {
    const b = cur(who), x = who === 'him' ? L.hx : L.sx, dir = who === 'him' ? 1 : -1;
    const P = { sit: true, handL: [-.32, -.32], handR: [.32, -.3], bendL: 30, bendR: -30, eyes: 'open', mouth: 'smile', look: [dir * .6, .2], tilt: 0 };
    let front = null;
    if (b && t < b.op + 1.6) {
      const pick = eio(seg(t, b.t0, b.t0 + .3)), turn = eio(seg(t, b.t0 + .3, b.op - .1)), p = t >= b.op ? back(seg(t, b.op, b.op + .3)) : 0;
      const eat = t >= b.op + .6 ? eo(seg(t, b.op + .6, b.op + 1.4)) * .9 : 0;
      const hx = dir * .12, hy = lerp(-.25, -.55, pick) - (t > b.op + .5 ? eio(seg(t, b.op + .5, b.op + .8)) * .2 : 0);
      const a = lerp(dir * -.3, -Math.PI / 2, turn), len = .4;
      P.handL = [hx - .12, hy + .12]; P.handR = t >= b.op - .25 ? [hx + .02, hy - len * .45] : [hx + .14, hy + .05]; P.bendL = 30; P.bendR = -30;
      P.look = [dir * .2, .5]; P.tilt = dir * -.05;
      if (t >= b.op) { P.handR = [lerp(hx, .4, eo(seg(t, b.op, b.op + .3))), lerp(hy - len * .5, -.4, eo(seg(t, b.op, b.op + .3)))]; P.handL = [hx, hy + .1]; P.eyes = 'happy'; P.mouth = eat > 0 ? 'chew' : 'grin'; P.chew = t * 16; }
      front = (gg) => { if (t < b.op) banana(gg, hx, hy, len, a, 1, seg(t, b.op - .2, b.op)); else a5_open(gg, hx, hy + len * .2, len, 0, p, eat, eio(seg(t, b.op + .5, b.op + .9))); };
      if (t >= b.op && t < b.op + .5) { const u = seg(t, b.op, b.op + .5); sparkle(g, x + hx * s, L.gy + (hy - .3) * s, 26 * (1 - u) + 6, 1 - u); }
    }
    if (laughAt(t) && !(b && t >= b.t0 && t < b.op)) { P.eyes = 'happy'; P.mouth = P.mouth === 'chew' ? 'chew' : 'grin'; P.tilt = dir * -.08 + Math.sin(t * 14 + (dir > 0 ? 0 : 1)) * .035; P.squash = Math.abs(Math.sin(t * 14 + (dir > 0 ? 0 : 1))) * .03; }
    if (t >= 163.4 && L === a5_LO && !(b && t >= b.t0 && t < b.op + .6)) { // they look at each other and lean together
      const k = eio(seg(t, 163.4, 164.2)); P.look = [dir * .9, .1]; P.tilt = dir * -.14 * k; P.lean = dir * .06 * k; P.eyes = t > 164.4 ? 'happy' : 'open'; P.mouth = 'smile';
    }
    if (who === 'him') gorilla(g, x, L.gy, s, Object.assign(P, { front }));
    else a5_her(g, x, L.gy, s, Object.assign(P, { front }));
  }
  drawPile();
}
