// Real Thing: the gorilla and the banana. kit.js = maths, paper grain, outlines, sparkles, the banana. See STORYBOARD-gorilla.md.
// Bob's note on draft 1 asked for an entirely different story; his own example is a gorilla who can't open a banana.
// Look after Kevin Ngo's One Ring film: outlined chibi characters drawn as whole poses (bendy tube limbs, big heads,
// faces doing the acting) on painted backgrounds with NO outlines (layered gradients, light rays, a stepped sun halo,
// scattered flowers), one paper grain over the frame. drawFrame(g, t) is a pure function of song time t.
'use strict';
const W = 1920, H = 1080, TAU = Math.PI * 2;
let INK = '#2b211c', LW = 5; // let, so a restyle (js/styles/) can swap the ink and line weight
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


// every act file pushes its shots here: { t0, t1, draw(g, t, lt) }
const ACTS = [];
