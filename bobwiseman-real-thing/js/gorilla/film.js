// Real Thing look test: the gorilla and the banana (song time 21.0-49.3, end of intro + verse 1).
// Bob's note on draft 1 asked for an entirely different story; his own example is a gorilla who can't open a banana.
// Look after Kevin Ngo's One Ring film: outlined chibi characters drawn as whole poses (bendy tube limbs, big heads,
// faces doing the acting) on painted backgrounds with NO outlines (layered gradients, light rays, a stepped sun halo,
// scattered flowers), one paper grain over the frame. drawFrame(g, t) is a pure function of song time t.
'use strict';
const W = 1920, H = 1080, TAU = Math.PI * 2;
const INK = '#2b211c', LW = 5;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => cl((t - a) / (b - a));
const eio = (t) => { t = cl(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eo = (t) => 1 - Math.pow(1 - cl(t), 3), ei = (t) => Math.pow(cl(t), 2.2);
const back = (t) => { t = cl(t); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
// a damped wobble that starts at 1 and settles to 0 after an impact at t = 0
const ring = (t, f = 9, d = 7) => (t < 0 ? 0 : Math.exp(-d * t) * Math.cos(f * t));
function M32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------------------------------------------------------------- paper grain (made once)
let GRAIN = null;
function buildTextures() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); const r = M32(31);
  for (let i = 0; i < 9000; i++) { // horizontal fibres, light and dark
    const y = r() * H, x = r() * W, l = 20 + r() * 140;
    g.strokeStyle = r() < .5 ? `rgba(255,248,230,${.05 + r() * .06})` : `rgba(60,40,20,${.03 + r() * .05})`;
    g.lineWidth = .6 + r() * 1.1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (r() - .5) * 2); g.stroke();
  }
  for (let i = 0; i < 26000; i++) { g.fillStyle = r() < .5 ? 'rgba(255,250,235,.07)' : 'rgba(50,35,20,.06)'; const s = .8 + r() * 1.6; g.fillRect(r() * W, r() * H, s, s); }
  GRAIN = c;
}

// ---------------------------------------------------------------- outlined shapes (characters only)
// line widths are given in screen pixels whatever the current transform (camera zoom, character scale)
const sc = (g) => { const m = g.getTransform(); return Math.hypot(m.a, m.b) || 1; };
function ol(g, path, fill, lw = LW) { g.beginPath(); path(); g.fillStyle = fill; g.fill(); g.lineWidth = lw / sc(g); g.strokeStyle = INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
const ell = (g, x, y, rx, ry, rot = 0) => () => g.ellipse(x, y, Math.max(1e-4, rx), Math.max(1e-4, ry), rot, 0, TAU);
// a tube limb from p0 to p1 bent by `bend` (pixels, sideways): ink stroke under a colour stroke, round ends
function limb(g, p0, p1, bend, w, fill) {
  const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend;
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = INK; g.lineWidth = w + LW * 2; g.stroke();
  g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
}
function sparkle(g, x, y, r, a = 1, col = '#fff6c8') {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.fillStyle = col; g.beginPath();
  for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * .28 : r; g.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); }
  g.closePath(); g.fill(); g.restore();
}

// ---------------------------------------------------------------- the banana
const BAN = '#f3cf45', BAN2 = '#d9a722', TIP = '#5c3d22';
// a closed banana, centred at the origin, length L, angle a (radians), bent by k; `squeeze` flattens it when gripped
function banana(g, x, y, L, a = 0, k = 1, squeeze = 0) {
  g.save(); g.translate(x, y); g.rotate(a); g.scale(1, 1 - squeeze * .25);
  const h = L * .17 * k;
  ol(g, () => { g.moveTo(-L / 2, 0); g.quadraticCurveTo(0, -h * 2.2, L / 2, -h * .2); g.quadraticCurveTo(L * .08, h * .4, -L / 2, 0); }, BAN);
  g.beginPath(); g.moveTo(-L * .42, -h * .05); g.quadraticCurveTo(0, -h * 1.45, L * .44, -h * .3); g.strokeStyle = BAN2; g.lineWidth = L * .05; g.lineCap = 'round'; g.stroke();
  ol(g, ell(g, L / 2 - L * .02, -h * .22, L * .035, L * .03), TIP, 3);
  ol(g, () => { g.moveTo(-L / 2, 0); g.lineTo(-L / 2 - L * .1, -L * .06); g.lineTo(-L / 2 - L * .07, L * .02); g.closePath(); }, '#8a6a2c', 3);
  g.restore();
}
// the monkey's banana: peel open by `p` (0 shut .. 1 three strips hanging), fruit eaten down by `eat`
function peeled(g, x, y, L, a, p, eat) {
  g.save(); g.translate(x, y); g.rotate(a);
  const top = -L * (1 - eat * .5);
  if (p > .02) {
    const fr = L * .14;
    ol(g, () => { g.moveTo(-fr, -L * .1); g.quadraticCurveTo(-fr * 1.1, top * .6, 0, top); g.quadraticCurveTo(fr * 1.1, top * .6, fr, -L * .1); g.closePath(); }, '#fbf3d6', 3.5);
    if (eat > .05) ol(g, () => { g.moveTo(-fr * .8, top + fr * .3); g.quadraticCurveTo(0, top + fr * .9, fr * .8, top + fr * .3); }, '#fbf3d6', 3);
  }
  for (const s of [-1, 0, 1]) { // three strips
    const sw = s * p * 1.25 + (s === 0 ? p * .25 : 0);
    g.save(); g.translate(s * L * .09, -L * .12); g.rotate(sw * (s === 0 ? 1 : 1) + (s === 0 ? Math.PI * p : 0));
    ol(g, () => { g.moveTo(-L * .08, 0); g.quadraticCurveTo(-L * .1, -L * .45, 0, -L * .62); g.quadraticCurveTo(L * .1, -L * .45, L * .08, 0); g.closePath(); }, BAN, 3.5);
    g.restore();
  }
  ol(g, () => { g.moveTo(-L * .14, -L * .1); g.lineTo(L * .14, -L * .1); g.lineTo(L * .1, L * .12); g.lineTo(-L * .1, L * .12); g.closePath(); }, BAN, 3.5);
  ol(g, ell(g, 0, L * .14, L * .05, L * .035), TIP, 3);
  g.restore();
}

// ---------------------------------------------------------------- the gorilla
const FUR = '#3e3735', FUR2 = '#2e2827', FACE = '#9b8676', BELLY = '#6f625a';
// face expressions: eyes 'open'|'happy'|'squint'|'cross'|'half'|'shut', brow -1 sad .. 0 .. 1 cross, mouth 'smile'|'grin'|'grit'|'o'|'flat'|'frown'|'chew'
function gorilla(g, x, y, s, P) {
  P = Object.assign({ lean: 0, squash: 0, sit: false, lie: false, look: [0, 0], eyes: 'open', brow: 0, mouth: 'flat', tilt: 0,
    handL: [-.55, -.25], handR: [.55, -.25], bendL: -30, bendR: 30, front: null, sweat: 0, flip: 1 }, P);
  g.save(); g.translate(x, y); g.scale(s * P.flip, s * (1 - P.squash)); g.scale(1, 1);
  const k = 1 / s, LWs = LW / sc(g); // outline weight in body units
  // on his back: body +x points up the screen, so a hand at body (.6, -.68) is held up to the sky
  if (P.lie) { g.translate(0, -.4); g.rotate(-Math.PI / 2 * .92); }
  g.rotate(P.lean);
  // ground shadow
  if (!P.lie) { g.save(); g.globalAlpha = .22; g.fillStyle = '#20301c'; g.beginPath(); g.ellipse(0, 4 * k, .55, .07, 0, 0, TAU); g.fill(); g.restore(); }
  const W2 = (w) => w; // widths are in body units
  // back arm (left)
  const shL = [-.27, -.62], shR = [.27, -.62];
  const lw = (u) => u; g.lineWidth = LWs;
  const tube = (p0, p1, bend, w, col) => {
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
    const b = bend / 300, cx = mx - dy / L * b, cy = my + dx / L * b;
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = INK; g.lineWidth = w + LWs * 2; g.stroke();
    g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = col; g.lineWidth = w; g.stroke();
  };
  const olk = (path, fill) => ol(g, path, fill, LW);
  const mitt = (p) => olk(ell(g, p[0], p[1], .085, .075), FUR);
  tube(shL, P.handL, P.bendL, .12, FUR); mitt(P.handL);
  // legs
  if (P.sit) {
    tube([-.16, -.12], [-.36, -.02], 10, .14, FUR); tube([.16, -.12], [.36, -.02], -10, .14, FUR);
    olk(ell(g, -.42, -.03, .1, .06), FUR2); olk(ell(g, .42, -.03, .1, .06), FUR2);
  } else {
    tube([-.15, -.2], [-.18, -.04], 0, .15, FUR); tube([.15, -.2], [.18, -.04], 0, .15, FUR);
    olk(ell(g, -.21, -.03, .12, .055), FUR2); olk(ell(g, .21, -.03, .12, .055), FUR2);
  }
  // body: a pear, then the belly patch
  olk(() => { g.moveTo(0, -.78); g.bezierCurveTo(.38, -.8, .44, -.12, .26, -.1); g.quadraticCurveTo(0, -.04, -.26, -.1); g.bezierCurveTo(-.44, -.12, -.38, -.8, 0, -.78); }, FUR);
  g.beginPath(); g.ellipse(0, -.36, .19, .22, 0, 0, TAU); g.fillStyle = BELLY; g.fill();
  if (P.belly) { g.save(); g.globalAlpha = P.belly; g.strokeStyle = INK; g.lineWidth = LWs * .7; for (const r0 of [.27, .33]) { g.beginPath(); g.arc(.0, -.36, r0, -.5, .5); g.stroke(); g.beginPath(); g.arc(0, -.36, r0, Math.PI - .5, Math.PI + .5); g.stroke(); } g.restore(); }
  // head (big): crest, face mask, features
  g.save(); g.translate(0, -.84); g.rotate(P.tilt);
  olk(() => { g.moveTo(-.29, .02); g.bezierCurveTo(-.33, -.3, -.1, -.37, 0, -.36); g.bezierCurveTo(.1, -.37, .33, -.3, .29, .02); g.bezierCurveTo(.3, .22, -.3, .22, -.29, .02); }, FUR);
  olk(() => { g.moveTo(-.2, -.06); g.bezierCurveTo(-.22, -.18, -.04, -.17, 0, -.1); g.bezierCurveTo(.04, -.17, .22, -.18, .2, -.06); g.bezierCurveTo(.24, .17, -.24, .17, -.2, -.06); }, FACE);
  const lx = P.look[0] * .03, ly = P.look[1] * .025;
  for (const ex of [-.085, .085]) {
    if (P.eyes === 'open' || P.eyes === 'cross') {
      olk(ell(g, ex, -.06, .052, .058), '#fbf6ea');
      const px = P.eyes === 'cross' ? -Math.sign(ex) * .022 : lx;
      g.beginPath(); g.ellipse(ex + px, -.055 + ly, .024, .028, 0, 0, TAU); g.fillStyle = INK; g.fill();
      g.beginPath(); g.arc(ex + px + .008, -.066 + ly, .008, 0, TAU); g.fillStyle = '#fff'; g.fill();
    } else if (P.eyes === 'half') {
      olk(() => { g.moveTo(ex - .05, -.055); g.quadraticCurveTo(ex, -.005, ex + .05, -.055); g.closePath(); }, '#fbf6ea');
      g.beginPath(); g.arc(ex + lx, -.04, .018, 0, TAU); g.fillStyle = INK; g.fill();
    } else {
      g.beginPath();
      if (P.eyes === 'happy') { g.moveTo(ex - .045, -.045); g.quadraticCurveTo(ex, -.1, ex + .045, -.045); }
      else if (P.eyes === 'squint') { g.moveTo(ex - .048, -.07 + (ex < 0 ? -.012 : .012)); g.lineTo(ex + .048, -.07 + (ex < 0 ? .012 : -.012)); g.moveTo(ex - .044, -.035); g.quadraticCurveTo(ex, -.05, ex + .044, -.035); }
      else { g.moveTo(ex - .045, -.06); g.quadraticCurveTo(ex, -.035, ex + .045, -.06); }
      g.strokeStyle = INK; g.lineWidth = LWs * 1.1; g.lineCap = 'round'; g.stroke();
    }
  }
  // brow ridge
  g.beginPath(); g.moveTo(-.16, -.13 - P.brow * -.0 + (P.brow < 0 ? -.01 : 0)); g.quadraticCurveTo(-.08, -.16 + P.brow * .035, -.01, -.12 + P.brow * .03);
  g.moveTo(.16, -.13 + (P.brow < 0 ? -.01 : 0)); g.quadraticCurveTo(.08, -.16 + P.brow * .035, .01, -.12 + P.brow * .03);
  g.strokeStyle = FUR2; g.lineWidth = .035; g.lineCap = 'round'; g.stroke();
  // muzzle, nostrils
  olk(ell(g, 0, .055, .115, .075), '#ad9787');
  g.fillStyle = INK; for (const nx of [-.025, .025]) { g.beginPath(); g.ellipse(nx, .03, .012, .009, 0, 0, TAU); g.fill(); }
  // mouth
  g.strokeStyle = INK; g.lineWidth = LWs; g.lineCap = 'round'; g.beginPath();
  const m = P.mouth;
  if (m === 'smile') { g.moveTo(-.05, .075); g.quadraticCurveTo(0, .11, .05, .075); g.stroke(); }
  else if (m === 'grin') { olk(() => { g.moveTo(-.065, .07); g.quadraticCurveTo(0, .14, .065, .07); g.closePath(); }, '#7a2f2a'); }
  else if (m === 'grit') { olk(() => { g.rect(-.06, .065, .12, .04); }, '#fbf6ea'); g.beginPath(); for (const tx of [-.03, 0, .03]) { g.moveTo(tx, .065); g.lineTo(tx, .105); } g.moveTo(-.06, .085); g.lineTo(.06, .085); g.lineWidth = LWs * .6; g.stroke(); }
  else if (m === 'o') { olk(ell(g, 0, .09, .025, .03), '#5a2421'); }
  else if (m === 'frown') { g.moveTo(-.045, .1); g.quadraticCurveTo(0, .07, .045, .1); g.stroke(); }
  else if (m === 'chew') { g.moveTo(-.04, .085); g.quadraticCurveTo(0, .07 + Math.sin(P.chew || 0) * .02, .04, .085); g.stroke(); }
  else { g.moveTo(-.04, .085); g.lineTo(.04, .085); g.stroke(); }
  if (P.sweat > 0) { g.save(); g.globalAlpha = P.sweat; olk(() => { g.moveTo(.27, -.2); g.quadraticCurveTo(.32, -.12, .27, -.1); g.quadraticCurveTo(.22, -.12, .27, -.2); }, '#bfe7f5'); g.restore(); }
  g.restore();
  // front arm (right) and whatever it holds
  if (P.front) P.front(g, k);
  tube(shR, P.handR, P.bendR, .12, FUR); mitt(P.handR);
  if (P.after) P.after(g, k);
  g.restore();
}

// ---------------------------------------------------------------- the monkey (small capuchin)
function monkey(g, x, y, s, P) {
  P = Object.assign({ eyes: 'open', mouth: 'smile', look: [0, 0], handL: [-.3, -.45], handR: [.3, -.5], tail: 0, chew: 0, tilt: 0 }, P);
  g.save(); g.translate(x, y); g.scale(s, s); const k = 1 / s, LWs = LW / sc(g);
  const olk = (p, f) => ol(g, p, f, LW), BR = '#8a5a35', CR = '#efd7b0';
  g.lineCap = 'round';
  // tail curling down from the branch
  g.beginPath(); g.moveTo(-.12, -.12); g.bezierCurveTo(-.5, .1, -.55, .65 + P.tail * .05, -.25, .7); g.bezierCurveTo(-.05, .74, -.08, .55, -.2, .55);
  g.strokeStyle = INK; g.lineWidth = .07 + LWs * 2; g.stroke(); g.strokeStyle = BR; g.lineWidth = .07; g.stroke();
  // legs dangling
  for (const [a, b] of [[[-.08, -.08], [-.1, .2]], [[.08, -.08], [.12, .2]]]) { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.strokeStyle = INK; g.lineWidth = .08 + LWs * 2; g.stroke(); g.strokeStyle = BR; g.lineWidth = .08; g.stroke(); }
  olk(() => { g.ellipse(0, -.25, .17, .2, 0, 0, TAU); }, BR);
  g.beginPath(); g.ellipse(0, -.22, .1, .13, 0, 0, TAU); g.fillStyle = CR; g.fill();
  const arm = (sh, h) => { g.beginPath(); g.moveTo(...sh); g.quadraticCurveTo((sh[0] + h[0]) / 2 + .05, (sh[1] + h[1]) / 2 + .08, h[0], h[1]); g.strokeStyle = INK; g.lineWidth = .07 + LWs * 2; g.stroke(); g.strokeStyle = BR; g.lineWidth = .07; g.stroke(); olk(ell(g, h[0], h[1], .045, .04), CR); };
  arm([-.12, -.36], P.handL);
  g.save(); g.translate(0, -.55); g.rotate(P.tilt);
  olk(ell(g, 0, 0, .2, .18), BR);
  for (const ex of [-.19, .19]) olk(ell(g, ex, -.01, .055, .06), CR);
  olk(() => { g.moveTo(-.13, -.02); g.bezierCurveTo(-.15, -.14, .15, -.14, .13, -.02); g.bezierCurveTo(.16, .15, -.16, .15, -.13, -.02); }, CR);
  for (const ex of [-.055, .055]) {
    if (P.eyes === 'happy') { g.beginPath(); g.moveTo(ex - .03, -.02); g.quadraticCurveTo(ex, -.06, ex + .03, -.02); g.strokeStyle = INK; g.lineWidth = LWs; g.stroke(); }
    else { g.beginPath(); g.ellipse(ex + P.look[0] * .015, -.03 + P.look[1] * .012, .02, .024, 0, 0, TAU); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(ex + P.look[0] * .015 + .006, -.04 + P.look[1] * .012, .006, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
  }
  g.beginPath(); g.ellipse(0, .03, .012, .008, 0, 0, TAU); g.fillStyle = INK; g.fill();
  g.beginPath(); if (P.mouth === 'chew') { g.moveTo(-.035, .07); g.quadraticCurveTo(0, .06 + Math.sin(P.chew) * .02, .035, .07); } else { g.moveTo(-.035, .06); g.quadraticCurveTo(0, .09, .035, .06); }
  g.strokeStyle = INK; g.lineWidth = LWs; g.stroke();
  g.restore();
  if (P.hold) P.hold(g, k);
  arm([.12, -.36], P.handR);
  g.restore();
}

// ---------------------------------------------------------------- painted backgrounds (no outlines)
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function blobs(g, list, col) { g.fillStyle = col; g.beginPath(); for (const [x, y, r] of list) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); } g.fill(); }
function sunHalo(g, x, y, r, t) {
  for (let i = 4; i >= 1; i--) { g.fillStyle = `rgba(255,246,214,${.07 + (4 - i) * .03})`; g.beginPath(); g.arc(x, y, r * (1 + i * .55), 0, TAU); g.fill(); }
  g.fillStyle = '#fff4cf'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
}
function rays(g, t, x0, alpha = 1) {
  g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < 5; i++) {
    const x = x0 + i * 230, a = (.05 + .035 * Math.sin(t * .9 + i * 1.7)) * alpha, w = 90 + i * 20;
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, `rgba(255,250,220,${a * 1.6})`); gr.addColorStop(1, 'rgba(255,250,220,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x, -20); g.lineTo(x + w, -20); g.lineTo(x + w + 380, H); g.lineTo(x + 380, H); g.closePath(); g.fill();
  }
  g.restore();
}
function flowers(g, seed, n, y0, y1, cols) {
  const r = M32(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = y0 + r() * (y1 - y0), s = 5 + r() * 7 * (y / H), c = cols[(r() * cols.length) | 0];
    g.fillStyle = c; g.beginPath();
    for (let j = 0; j < 10; j++) { const a = j * Math.PI / 5, rr = j % 2 ? s * .4 : s; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    g.closePath(); g.fill();
  }
}
function tufts(g, seed, n, y0, y1, col) {
  const r = M32(seed); g.strokeStyle = col; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const x = r() * W, y = y0 + r() * (y1 - y0), h = 8 + r() * 16 * (y / H); g.lineWidth = 2; g.beginPath(); g.moveTo(x - 5, y); g.lineTo(x - 7, y - h * .7); g.moveTo(x, y); g.lineTo(x + 1, y - h); g.moveTo(x + 5, y); g.lineTo(x + 8, y - h * .6); g.stroke(); }
}
// the jungle clearing; `hz` is the horizon line, `sunX` the sun
function jungle(g, t, o = {}) {
  const hz = o.hz ?? 620;
  g.fillStyle = vgrad(g, 0, hz, [[0, '#9fcfc4'], [.55, '#d8ead0'], [1, '#f6e7bf']]); g.fillRect(0, 0, W, hz + 2);
  sunHalo(g, o.sunX ?? 1460, o.sunY ?? 230, 70, t);
  // far canopy, then mid, then near (lighter and bluer with distance)
  const far = M32(5), mid = M32(6), near = M32(7);
  blobs(g, [...Array(26)].map((_, i) => [i * 80 + far() * 40, hz - 60 - far() * 70, 70 + far() * 40]), '#9cc4a5');
  g.fillStyle = '#9cc4a5'; g.fillRect(0, hz - 70, W, 80);
  blobs(g, [...Array(18)].map((_, i) => [i * 115 + mid() * 50, hz - 10 - mid() * 60, 85 + mid() * 50]), '#6fa47c');
  g.fillStyle = '#6fa47c'; g.fillRect(0, hz - 20, W, 40);
  // ground
  g.fillStyle = vgrad(g, hz, H, [[0, '#7fae5c'], [1, '#5c8f45']]); g.fillRect(0, hz, W, H - hz);
  g.fillStyle = 'rgba(40,70,30,.12)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(near() * W, hz + 120 + near() * 300, 300 + near() * 200, 30, 0, 0, TAU); g.fill(); }
  tufts(g, 11, 160, hz + 20, H, '#4c7d3a'); flowers(g, 12, 120, hz + 40, H, ['#f6c7d8', '#fff1a8', '#ffffff', '#f2a65a', '#cdb8ef']);
  // the tree on the left: trunk with a light side, canopy blobs, vines
  if (o.tree !== false) {
    const tx = o.treeX ?? 300;
    g.fillStyle = vgrad(g, 0, hz + 60, [[0, '#6a4b33'], [1, '#4c3424']]); g.beginPath(); g.moveTo(tx - 60, hz + 60); g.lineTo(tx - 38, -20); g.lineTo(tx + 38, -20); g.lineTo(tx + 70, hz + 60); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,230,180,.16)'; g.beginPath(); g.moveTo(tx + 10, hz + 60); g.lineTo(tx + 12, -20); g.lineTo(tx + 38, -20); g.lineTo(tx + 70, hz + 60); g.closePath(); g.fill();
    const cn = M32(8);
    blobs(g, [...Array(14)].map(() => [tx - 260 + cn() * 620, 20 + cn() * 170, 90 + cn() * 70]), '#3f7a4c');
    blobs(g, [...Array(10)].map(() => [tx - 200 + cn() * 520, 10 + cn() * 120, 70 + cn() * 50]), '#4f8f57');
    blobs(g, [...Array(7)].map(() => [tx - 160 + cn() * 420, cn() * 90, 50 + cn() * 40]), '#66a865');
    g.strokeStyle = '#335f3b'; g.lineWidth = 6; for (let i = 0; i < 4; i++) { const vx = tx - 150 + i * 120; g.beginPath(); g.moveTo(vx, 120); g.quadraticCurveTo(vx + 30 * Math.sin(t * .8 + i), 300, vx + 10, 380 + i * 40); g.stroke(); }
  }
  // big near ferns in the corners
  const fern = (x, y, s, a, col) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = col; for (let i = 0; i < 7; i++) { g.save(); g.rotate((i - 3) * .28); g.beginPath(); g.ellipse(0, -s * .55, s * .12, s * .55, 0, 0, TAU); g.fill(); g.restore(); } g.restore(); };
  if (o.ferns !== false) { fern(80, H + 30, 300, .2, '#3e7140'); fern(W - 60, H + 40, 340, -.25, '#3a6a3c'); fern(W - 260, H + 60, 220, .1, '#4d8a4c'); }
  rays(g, t, o.raysX ?? 380, o.rays ?? 1);
}
function rock(g, x, y, s, split = 0) {
  const half = (dir) => { g.save(); g.translate(dir * split * 60, split * 10); g.rotate(dir * split * .2);
    g.fillStyle = '#8e8a84'; g.beginPath(); g.moveTo(x, y - s * .9); g.quadraticCurveTo(x + dir * s * 1.1, y - s * .9, x + dir * s * 1.2, y); g.lineTo(x, y); g.closePath(); g.fill();
    g.fillStyle = '#a7a39c'; g.beginPath(); g.moveTo(x, y - s * .9); g.quadraticCurveTo(x + dir * s * .7, y - s * .85, x + dir * s * .65, y - s * .45); g.lineTo(x, y - s * .5); g.closePath(); g.fill(); g.restore(); };
  g.fillStyle = 'rgba(30,45,25,.22)'; g.beginPath(); g.ellipse(x, y + 4, s * 1.4, s * .14, 0, 0, TAU); g.fill();
  half(-1); half(1);
  if (split > 0 && split < .35) { g.strokeStyle = '#4a4744'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, y - s * .9); g.lineTo(x - 10, y - s * .5); g.lineTo(x + 8, y - s * .3); g.lineTo(x, y); g.stroke(); }
}

// ---------------------------------------------------------------- shots (song time)
// camera: zoom about a point, eased across the shot
function cam(g, lt, d, z0, z1, fx, fy) { const z = lerp(z0, z1, eio(lt / d)); g.translate(fx, fy); g.scale(z, z); g.translate(-fx, -fy); }
const GROUND = 905;
const SHOTS = [
  // 1. the clearing at morning; he sits under the tree; his belly rumbles; he looks up at the one banana
  { t0: 21.0, t1: 25.84, draw(g, t, lt) {
    cam(g, lt, 4.84, 1.0, 1.06, 700, 640);
    jungle(g, t, { treeX: 420 });
    const hang = 1 + .04 * Math.sin(t * 2.2); banana(g, 560, 300 + Math.sin(t * 1.6) * 6, 60, 1.3 * hang, 1);
    g.strokeStyle = '#3c6b3f'; g.lineWidth = 5; g.beginPath(); g.moveTo(540, 210); g.quadraticCurveTo(552, 260, 548, 282); g.stroke();
    const rum = [23.1, 23.45, 23.8].reduce((a, tt) => a + Math.max(0, ring(t - tt, 30, 9)) * .05, 0);
    const look = eo(seg(t, 24.2, 24.8));
    gorilla(g, 620, GROUND, 330, { sit: true, squash: rum, belly: cl(rum * 18), handL: [-.32, -.32], handR: [.32, -.3], bendL: 30, bendR: -30,
      look: [lerp(.3, .6, look), lerp(0, -1, look)], tilt: lerp(0, -.18, look), eyes: (t % 3.7) < .12 ? 'shut' : 'open', mouth: rum > .01 ? 'o' : 'flat', brow: -.4 * look });
    if (rum > .004) { g.strokeStyle = 'rgba(43,33,28,.7)'; g.lineWidth = 4; for (const r0 of [70, 95]) { g.beginPath(); g.arc(620, GROUND - 120, r0, -.4, .4); g.stroke(); } }
  } },
  // 2. the banana falls, bonks his head on "settle", bounces into his hands; he holds it up, delighted
  { t0: 25.84, t1: 28.72, draw(g, t, lt) {
    cam(g, lt, 2.88, 1.18, 1.22, 760, 600);
    jungle(g, t, { treeX: 420 });
    const hit = 26.38, catchT = 26.92, up = 27.56;
    const head = [760, GROUND - 330 * .84 - 330 * .3];
    let bx, by, ba;
    if (t < hit) { const u = ei(seg(t, 25.84, hit)); bx = lerp(800, head[0] + 10, u); by = lerp(120, head[1] - 20, u); ba = lerp(1.2, 2.4, u); }
    else if (t < catchT) { const u = seg(t, hit, catchT); bx = lerp(head[0] + 10, 830, u); by = head[1] - 20 - Math.sin(u * Math.PI) * 120 + u * 230; ba = 2.4 + u * 3.5; }
    else { bx = null; }
    const bonk = t >= hit ? ring(t - hit, 26, 8) : 0;
    const joy = seg(t, 27.9, 28.05);
    const held = t >= catchT;
    const hR = held ? [lerp(.3, .45, eo(seg(t, up, up + .4))), lerp(-.25, -1.15, eo(seg(t, up, up + .4)))] : [.45, -.35];
    gorilla(g, 760, GROUND, 330, { squash: bonk * .1, handL: [-.4, -.3], handR: hR, bendL: 40, bendR: -40,
      eyes: t >= hit && t < hit + .35 ? 'squint' : (joy > 0 ? 'happy' : 'open'), mouth: joy > 0 ? 'grin' : (t >= hit && t < hit + .35 ? 'grit' : 'o'),
      look: held ? [.6, -.8] : [.2, -1], tilt: bonk * .12,
      after: held ? (gg) => banana(gg, hR[0] + .02, hR[1] - .1, .34, -.5 + eo(seg(t, up, up + .4)) * .3) : null });
    if (bx !== null) banana(g, bx, by, 110, ba);
    if (t >= hit && t < hit + .5) { const a = 1 - seg(t, hit, hit + .5); for (let i = 0; i < 4; i++) sparkle(g, head[0] + Math.cos(i * 1.6 + t * 6) * 80, head[1] - 40 + Math.sin(i * 1.6 + t * 6) * 26, 16, a); }
    const hx = 760 + hR[0] * 330, hy = GROUND + hR[1] * 330;
    if (joy > 0) for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i * .2) % 1; sparkle(g, hx + Math.cos(i * 1.25) * (60 + ph * 50), hy - 30 + Math.sin(i * 1.25) * (40 + ph * 40), 14 * (1 - ph), 1 - ph); }
  } },
  // 3. close: he tugs at the stem, three times, harder each time; the banana does not care
  { t0: 28.72, t1: 32.04, draw(g, t, lt) {
    cam(g, lt, 3.32, 1.7, 1.76, 900, 520);
    jungle(g, t, { treeX: 300, ferns: false });
    const tugs = [29.13, 30.0, 30.9].map((tt, i) => Math.max(0, Math.sin(cl((t - tt) / .45) * Math.PI)) * (1 + i * .4));
    const pull = Math.max(...tugs), strain = seg(t, 29.9, 31.2);
    gorilla(g, 900, GROUND, 330, { lean: -pull * .08, handL: [-.1 - pull * .12, -.62], handR: [.32 + pull * .1, -.6], bendL: 30, bendR: -30,
      eyes: strain > .5 ? 'squint' : 'open', brow: .4 + strain * .6, mouth: pull > .3 ? 'grit' : 'flat', look: [.3, .4], sweat: seg(t, 31.2, 31.5),
      front: (gg) => { banana(gg, .12 + pull * .02, -.63, .5, -.05, 1, 0); } });
    if (pull > .4) { g.strokeStyle = 'rgba(43,33,28,.6)'; g.lineWidth = 5; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(1120 + i * 12, 610 + i * 30); g.lineTo(1170 + i * 12, 600 + i * 30); g.stroke(); } }
  } },
  // 4. he bites it: clink on "on", eyes cross; again, harder, on "lake"
  { t0: 32.04, t1: 36.5, draw(g, t, lt) {
    cam(g, lt, 4.46, 1.42, 1.46, 820, 560);
    jungle(g, t, { treeX: 260 });
    const b1 = 33.05, b2 = 34.65;
    const toMouth = Math.max(eio(seg(t, 32.2, b1)) * (t < b1 + .25 ? 1 : 1 - eio(seg(t, b1 + .25, b1 + .6))), eio(seg(t, 34.0, b2)) * (t < b2 + .3 ? 1 : 1 - eio(seg(t, b2 + .3, b2 + .8))));
    const jolt = ring(t - b1, 30, 8) * (t >= b1 ? 1 : 0) + ring(t - b2, 30, 7) * (t >= b2 ? 1.4 : 0);
    const dizzy = (t > b1 && t < b1 + .8) || (t > b2 && t < b2 + 1.1);
    const side = seg(t, 35.8, 36.0);
    const by = lerp(-.55, -.78, toMouth), bx = lerp(.35, .1, toMouth);
    gorilla(g, 820, GROUND, 330, { tilt: -jolt * .15, handL: [bx - .18, by + .02], handR: [bx + .22, by + .03], bendL: 30, bendR: -30,
      eyes: dizzy ? 'cross' : (side > 0 ? 'half' : 'open'), brow: dizzy ? -.6 : .3, mouth: toMouth > .7 ? 'grit' : (dizzy ? 'o' : 'flat'), look: side > 0 ? [.8, .3] : [.2, .3],
      front: (gg) => banana(gg, bx, by, .48, 0, 1) });
    for (const [bt, s] of [[b1, 1], [b2, 1.5]]) if (t >= bt && t < bt + .4) { const a = 1 - seg(t, bt, bt + .4); sparkle(g, 820 + 30, GROUND - 330 * .78, 34 * s, a, '#ffffff'); }
  } },
  // 5. the harmonica answers: he smashes it on a rock; the rock splits; the banana is fine
  { t0: 36.5, t1: 38.2, draw(g, t, lt) {
    cam(g, lt, 1.7, 1.0, 1.02, 960, 640);
    jungle(g, t, { treeX: 1650, sunX: 420, raysX: 900 });
    const smash = 37.05, raise = eio(seg(t, 36.5, 36.95)), down = t >= smash ? 1 : eo(seg(t, 36.95, smash));
    const arm = t < smash ? lerp(-.6, -1.25, raise) + down * .0 : lerp(-1.25, -.25, eo(seg(t, 36.95, smash)));
    const hy = t < 36.95 ? lerp(-.6, -1.25, raise) : lerp(-1.25, -.3, eo(seg(t, 36.95, smash)));
    const split = t >= smash ? eo(seg(t, smash, smash + .35)) : 0;
    rock(g, 1130, GROUND, 120, split);
    gorilla(g, 900, GROUND, 300, { handL: [-.4, -.3], handR: [.55, hy], bendR: -50, eyes: t > smash + .2 ? 'open' : 'squint', brow: .8, mouth: 'grit', look: [.9, .4],
      lean: t >= smash ? ring(t - smash, 20, 6) * .05 : 0,
      after: (gg) => banana(gg, .62, hy - .05, .42, t >= smash ? .25 : -.4, 1) });
    if (t >= smash && t < smash + .5) { const a = 1 - seg(t, smash, smash + .5); for (let i = 0; i < 6; i++) sparkle(g, 1130 + Math.cos(i) * 140 * (1 - a + .3), GROUND - 100 + Math.sin(i) * 60, 18, a, '#f3eee0'); }
  } },
  // 6. he wrestles it: the cartoon dust cloud, limbs and the banana poking out
  { t0: 38.2, t1: 42.64, draw(g, t, lt) {
    cam(g, lt, 4.44, 1.06, 1.12, 960, 700);
    jungle(g, t, { treeX: 260 });
    const f2 = Math.floor(t * 12) / 12, r = M32((f2 * 1000) | 0); // jitter on twos
    const fade = 1 - seg(t, 42.2, 42.64), cx = 960 + Math.sin(t * 1.3) * 60, cy = GROUND - 170;
    g.save(); g.globalAlpha = fade;
    // limbs poking out (drawn before the cloud so the cloud covers their roots)
    const pokes = [[-.9, 'arm'], [.2, 'foot'], [2.3, 'arm'], [3.6, 'banana'], [4.6, 'foot']];
    for (const [a0, kind] of pokes) {
      const a = a0 + Math.sin(f2 * 7 + a0) * .5, R = 190 + r() * 30, x1 = cx + Math.cos(a) * R, y1 = cy + Math.sin(a) * R * .7;
      if (kind === 'banana') { banana(g, x1, y1, 120, a + 1.4); continue; }
      limb(g, [cx + Math.cos(a) * 80, cy + Math.sin(a) * 60], [x1, y1], (r() - .5) * 40, 36, FUR);
      ol(g, ell(g, x1, y1, kind === 'foot' ? 30 : 26, kind === 'foot' ? 18 : 24, a), FUR2);
    }
    const puffs = [...Array(11)].map((_, i) => { const a = i / 11 * TAU + f2 * .4; return [cx + Math.cos(a) * (120 + r() * 50), cy + Math.sin(a) * (80 + r() * 30), 80 + r() * 40]; });
    for (const [x, y, rr] of puffs) ol(g, ell(g, x, y, rr, rr * .85), '#efe4cc');
    ol(g, ell(g, cx, cy, 150, 110), '#efe4cc');
    g.strokeStyle = 'rgba(43,33,28,.5)'; g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx + (r() - .5) * 120, cy + (r() - .5) * 60, 30 + r() * 30, r() * 6, r() * 6 + 2); g.stroke(); }
    for (let i = 0; i < 4; i++) sparkle(g, cx + (r() - .5) * 460, cy - 120 + (r() - .5) * 160, 16 + r() * 10, 1, '#fff6c8');
    g.restore();
    if (t > 42.2) gorilla(g, 960, GROUND, 300, { lie: true, handL: [-.35, -.3], handR: [.6, -.68], bendR: -20, eyes: 'half', mouth: 'frown', look: [1, 0], squash: 0,
      after: (gg) => banana(gg, .67, -.77, .42, 1.2) });
  } },
  // 7. on his back in the grass, the banana held up to the sky; a sigh; a leaf lands on his belly
  { t0: 42.64, t1: 46.0, draw(g, t, lt) {
    cam(g, lt, 3.36, 1.25, 1.3, 960, 760);
    jungle(g, t, { treeX: 200, sunX: 1200, sunY: 200 });
    const sigh = Math.max(0, Math.sin(cl((t - 43.4) / 1.0) * Math.PI));
    gorilla(g, 980, GROUND - 10, 300, { lie: true, squash: -sigh * .03, handL: [-.35, -.3], handR: [.6 + sigh * .03, -.68], bendR: -20, eyes: 'half', brow: -.8, mouth: sigh > .3 ? 'o' : 'frown', look: [1, 0],
      after: (gg) => banana(gg, .67 + sigh * .03, -.77, .42, 1.2) });
    if (sigh > .05) { g.save(); g.globalAlpha = sigh * .8; for (let i = 0; i < 3; i++) { g.fillStyle = '#f4efe0'; g.beginPath(); g.arc(1030 + i * 30 + sigh * 60, 700 - i * 22 - sigh * 40, 16 - i * 3, 0, TAU); g.fill(); } g.restore(); }
    const lu = seg(t, 44.0, 45.3), lx = 1100 + Math.sin(lu * 9) * 70 - lu * 80, ly = lerp(80, 800, eio(lu));
    g.save(); g.translate(lx, ly); g.rotate(Math.sin(lu * 9) * .7); ol(g, () => { g.moveTo(-30, 0); g.quadraticCurveTo(0, -22, 30, 0); g.quadraticCurveTo(0, 22, -30, 0); }, '#6caa58', 4); g.restore();
  } },
  // 8. above him on a branch, a little monkey opens one with a flick on "government" and eats it
  { t0: 46.0, t1: 49.3, draw(g, t, lt) {
    cam(g, lt, 3.3, 1.0, 1.03, 960, 540);
    jungle(g, t, { treeX: 1500, sunX: 520, raysX: 200 });
    g.fillStyle = '#5a3f2b'; g.beginPath(); g.moveTo(1500, 330); g.quadraticCurveTo(1100, 300, 760, 340); g.lineTo(760, 362); g.quadraticCurveTo(1100, 326, 1500, 360); g.closePath(); g.fill();
    g.fillStyle = '#4f8f57'; for (const [x, y, r] of [[780, 330, 46], [820, 300, 38], [760, 360, 30]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    const flick = 46.43, bite = 47.24, glance = 48.2;
    const p = t >= flick ? back(seg(t, flick, flick + .3)) : 0, eat = t >= bite ? eo(seg(t, bite, bite + .2)) : 0;
    const chew = t > bite + .2 ? (t - bite) * 16 : 0, look = eo(seg(t, glance, glance + .3));
    monkey(g, 1040, 330, 260, { eyes: t > bite && t < glance ? 'happy' : 'open', mouth: chew ? 'chew' : 'smile', chew, look: [lerp(.6, .2, look), lerp(0, 1, look)], tilt: look * .25,
      handL: [.06, -.5], handR: [.2, -.4], hold: (gg) => peeled(gg, .2, -.44, .36, -.2, p, eat) });
    const up = eo(seg(t, 48.0, 48.6));
    gorilla(g, 760, GROUND - 6, 230, { lie: true, handL: [-.35, -.3], handR: [.6, -.68], bendR: -20, eyes: up > .5 ? 'open' : 'half', brow: -.5, mouth: 'flat', look: up > .5 ? [1, .6] : [1, 0], tilt: up * .25,
      after: (gg) => banana(gg, .67, -.77, .42, 1.2) });
    if (t >= flick && t < flick + .4) sparkle(g, 1040 - 13, 330 - 260 * .62 - 70, 26, 1 - seg(t, flick, flick + .4));
  } },
];

function drawFrame(g, t) {
  const f = Math.floor(t * 24 + 1e-6); t = f / 24; // the song grid
  const sh = SHOTS.find((s) => t >= s.t0 && t < s.t1) || SHOTS[t < SHOTS[0].t0 ? 0 : SHOTS.length - 1];
  g.save(); sh.draw(g, t, Math.max(0, t - sh.t0)); g.restore();
  g.drawImage(GRAIN, 0, 0);
  // a soft vignette
  const vg = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(40,25,15,.28)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
}
