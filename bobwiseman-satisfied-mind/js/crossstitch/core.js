// Cross-stitch engine: Aida linen, thread sprites (two twisted strands per leg), backstitch,
// needle, coins, wooden hoop. World units are stitch cells; integer coordinates are fabric holes.
// Everything seeded; no Math.random, no Date, no state carried between frames.
const W = 1920, H = 1080, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = (t, a, b) => smooth((t - a) / (b - a));
const lin = (t, a, b) => clamp((t - a) / (b - a));
function rnd(a, b = 0, c = 0) { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + 0.37) * 43758.5453; return x - Math.floor(x); }
function n1(seed, x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(rnd(seed, i), rnd(seed, i + 1), u) * 2 - 1; }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mkCanvas(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function rgb(c, a = 1) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }
function mix(c, d, u) { return [lerp(c[0], d[0], u), lerp(c[1], d[1], u), lerp(c[2], d[2], u)]; }

// ---------------- thread palette (DMC-ish) ----------------
const PAL = {
  K: '#232026', W: '#f6f3ea', w: '#e9dcc0', g: '#c3c0bb', G: '#8d8a87', s: '#eab696', S: '#c98a6c',
  b: '#86532e', B: '#4f2f1b', n: '#c79a5e', r: '#bd2a30', R: '#7d1a20', p: '#e47f88',
  u: '#2f62a8', U: '#1f2f5e', i: '#a8d6f0', I: '#e2f3fb', c: '#5c9fd6', e: '#4a8c3c', E: '#2b5a2a',
  y: '#e8b83a', Y: '#a5781e', o: '#d8692a', v: '#6e3f8e', m: '#c9a540', l: '#848239', h: '#3b2b20',
  q: '#94704c', x: '#ad5a33', f: '#7f97b2', j: '#d9c79b', // q/x/f/j/l/m: patch cloths
};
const PALK = Object.keys(PAL);

// ---------------- fabric (Aida even-weave) ----------------
const FAB_LEVELS = [128, 64, 32, 16, 8];
const FAB = {}; // level -> tile canvas (8x8 cells)
function buildFabric() {
  const L = 128, N = 8, S = L * N, c = mkCanvas(S, S), g = c.getContext('2d');
  const R = mulberry(77);
  g.fillStyle = '#e4d9c1'; g.fillRect(0, 0, S, S);
  const q = L / 4;
  for (let cj = 0; cj < N; cj++) for (let ci = 0; ci < N; ci++) {
    for (let b = 0; b < 4; b++) for (let a = 0; a < 4; a++) {
      const x0 = ci * L + a * q, y0 = cj * L + b * q, hor = (a + b) % 2 === 0;
      const v = 222 + (R() - .5) * 16;
      g.fillStyle = `rgb(${v + 6},${v - 1},${v - 20})`; g.fillRect(x0, y0, q, q);
      // three fibres per sub-square, rounded by a dark edge and light core
      for (let k = 0; k < 3; k++) {
        const o = (k + .5) * q / 3;
        g.lineWidth = q / 3.1; g.strokeStyle = `rgba(150,128,95,${.28 + R() * .12})`;
        g.beginPath(); if (hor) { g.moveTo(x0, y0 + o); g.lineTo(x0 + q, y0 + o); } else { g.moveTo(x0 + o, y0); g.lineTo(x0 + o, y0 + q); } g.stroke();
        g.lineWidth = q / 7; g.strokeStyle = `rgba(255,250,236,${.35 + R() * .2})`;
        g.beginPath(); if (hor) { g.moveTo(x0, y0 + o - 1.5); g.lineTo(x0 + q, y0 + o - 1.5); } else { g.moveTo(x0 + o - 1.5, y0); g.lineTo(x0 + o - 1.5, y0 + q); } g.stroke();
      }
      // fibre fuzz
      for (let k = 0; k < 5; k++) {
        g.strokeStyle = `rgba(${R() < .5 ? '120,100,70' : '255,250,235'},${.15 + R() * .15})`; g.lineWidth = 1;
        const fx = x0 + R() * q, fy = y0 + R() * q, an = (hor ? 0 : Math.PI / 2) + (R() - .5) * .6, l = 4 + R() * 9;
        g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(an) * l, fy + Math.sin(an) * l); g.stroke();
      }
    }
    // block relief: raised centre, channels at the cell edges
    const rg = g.createRadialGradient(ci * L + L * .45, cj * L + L * .42, L * .1, ci * L + L / 2, cj * L + L / 2, L * .72);
    rg.addColorStop(0, 'rgba(255,252,240,.16)'); rg.addColorStop(.7, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(80,60,35,.22)');
    g.fillStyle = rg; g.fillRect(ci * L, cj * L, L, L);
  }
  // channels between blocks
  g.strokeStyle = 'rgba(110,90,60,.28)'; g.lineWidth = 5;
  for (let k = 0; k <= N; k++) { g.beginPath(); g.moveTo(k * L, 0); g.lineTo(k * L, S); g.moveTo(0, k * L); g.lineTo(S, k * L); g.stroke(); }
  // holes at every grid corner
  for (let cj = 0; cj <= N; cj++) for (let ci = 0; ci <= N; ci++) {
    const x = ci * L + (R() - .5) * 3, y = cj * L + (R() - .5) * 3, r = L * (.12 + R() * .025);
    const hg = g.createRadialGradient(x + 2, y + 2, 0, x, y, r);
    hg.addColorStop(0, 'rgba(48,36,22,.95)'); hg.addColorStop(.55, 'rgba(70,55,35,.8)'); hg.addColorStop(1, 'rgba(90,70,45,0)');
    g.fillStyle = hg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // grain noise
  const id = g.getImageData(0, 0, S, S), d = id.data;
  for (let k = 0; k < d.length; k += 4) { const nn = (R() - .5) * 14; d[k] += nn; d[k + 1] += nn; d[k + 2] += nn; }
  g.putImageData(id, 0, 0);
  FAB[128] = c;
  let prev = c;
  for (const l of FAB_LEVELS.slice(1)) {
    const cc = mkCanvas(l * N, l * N), gg = cc.getContext('2d'); gg.imageSmoothingQuality = 'high';
    gg.drawImage(prev, 0, 0, l * N, l * N); FAB[l] = cc; prev = cc;
  }
}
const levelFor = (s, levels) => { let best = levels[0]; for (const l of levels) if (l >= s * .85) best = l; return best; };

// ---------------- thread sprites ----------------
const SPR_L = 128, SPR_M = 20, SPR_S = SPR_L + 2 * SPR_M; // sprite covers cell plus margin
const SPR_LEVELS = [128, 64, 32, 16];
const SPR = {}; // key `${col}${v}${leg}` -> {128: canvas, 64: ...}
function capsule(g, x0, x1, w, taper = .55) {
  const h = w / 2, e = w * .55;
  g.beginPath();
  g.moveTo(x0, 0);
  g.bezierCurveTo(x0, -h * taper, x0 + e * .5, -h, x0 + e, -h);
  g.lineTo(x1 - e, -h);
  g.bezierCurveTo(x1 - e * .5, -h, x1, -h * taper, x1, 0);
  g.bezierCurveTo(x1, h * taper, x1 - e * .5, h, x1 - e, h);
  g.lineTo(x0 + e, h);
  g.bezierCurveTo(x0 + e * .5, h, x0, h * taper, x0, 0);
  g.closePath();
}
function drawLeg(g, base, leg, v, alpha = 1) {
  const R = mulberry(1000 + v * 31 + leg * 7 + base[0] * 3 + base[1]);
  const ang = (leg ? 1 : -1) * Math.PI / 4 + (R() - .5) * .05;
  const half = SPR_L * Math.SQRT1_2 * .93, w = SPR_L * (.36 + (R() - .5) * .04);
  const dark = mix(base, [20, 12, 8], .5), light = mix(base, [255, 252, 245], .42);
  const sheen = leg ? 1 : .6;
  g.save(); g.translate(SPR_S / 2 + (R() - .5) * 3, SPR_S / 2 + (R() - .5) * 3);
  // cast shadow onto the fabric / the under leg
  g.save(); g.translate(3, 6); g.rotate(ang); g.filter = 'blur(5px)'; g.fillStyle = `rgba(30,20,10,${.5 * alpha})`; capsule(g, -half, half, w * 1.08); g.fill(); g.restore();
  g.rotate(ang);
  for (let k = 0; k < 2; k++) {
    const yo = (k - .5) * w * .46, sw = w * .56;
    g.save(); g.translate(0, yo);
    const bow = (R() - .5) * 4;
    capsule(g, -half + 2, half - 2, sw, .45);
    const gr = g.createLinearGradient(0, -sw / 2, 0, sw / 2);
    gr.addColorStop(0, rgb(dark, alpha)); gr.addColorStop(.28, rgb(light, alpha)); gr.addColorStop(.55, rgb(base, alpha)); gr.addColorStop(1, rgb(dark, alpha));
    g.fillStyle = gr; g.fill();
    g.save(); g.clip();
    // ply twist
    const step = sw * .5;
    for (let x = -half - sw; x < half + sw; x += step) {
      g.strokeStyle = rgb(dark, .38 * alpha); g.lineWidth = sw * .14;
      g.beginPath(); g.moveTo(x - sw * .4, -sw / 2 + bow * .1); g.lineTo(x + sw * .4, sw / 2); g.stroke();
      g.strokeStyle = `rgba(255,255,255,${.16 * sheen * alpha})`; g.lineWidth = sw * .07;
      g.beginPath(); g.moveTo(x - sw * .25 + step * .4, -sw / 2); g.lineTo(x + sw * .5 + step * .4, sw / 2); g.stroke();
    }
    // satin sheen streak
    const sh = g.createLinearGradient(-half, 0, half, 0);
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.5, `rgba(255,255,250,${.22 * sheen * alpha})`); sh.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sh; g.fillRect(-half, -sw * .32, half * 2, sw * .2);
    g.restore(); g.restore();
  }
  // the thread dives into the holes at both ends
  for (const ex of [-half, half]) {
    const eg = g.createRadialGradient(ex, 0, 0, ex, 0, w * .55);
    eg.addColorStop(0, `rgba(25,15,8,${.55 * alpha})`); eg.addColorStop(1, 'rgba(25,15,8,0)');
    g.fillStyle = eg; g.fillRect(ex - w, -w, w * 2, w * 2);
  }
  g.restore();
}
function buildSprites(keys) {
  for (const k of keys) {
    const base = hex(PAL[k]);
    for (let v = 0; v < 4; v++) for (let leg = 0; leg < 2; leg++) {
      const c = mkCanvas(SPR_S, SPR_S), g = c.getContext('2d');
      drawLeg(g, base, leg, v);
      const lv = { 128: c }; let prev = c;
      for (const l of SPR_LEVELS.slice(1)) {
        const sz = Math.round(SPR_S * l / SPR_L), cc = mkCanvas(sz, sz), gg = cc.getContext('2d'); gg.imageSmoothingQuality = 'high';
        gg.drawImage(prev, 0, 0, sz, sz); lv[l] = cc; prev = cc;
      }
      SPR[k + v + leg] = lv;
    }
  }
}

// ---------------- backstitch / running stitch / loose thread ----------------
function threadSeg(g, x0, y0, x1, y1, col, w = .2, alpha = 1) {
  const base = hex(PAL[col] || col), dark = mix(base, [20, 12, 8], .5), light = mix(base, [255, 252, 245], .45);
  g.lineCap = 'round';
  g.strokeStyle = `rgba(30,20,10,${.35 * alpha})`; g.lineWidth = w * 1.3;
  g.beginPath(); g.moveTo(x0 + .05, y0 + .09); g.lineTo(x1 + .05, y1 + .09); g.stroke();
  g.strokeStyle = rgb(dark, alpha); g.lineWidth = w;
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = rgb(base, alpha); g.lineWidth = w * .66;
  g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = rgb(light, .55 * alpha); g.lineWidth = w * .2;
  g.beginPath(); g.moveTo(x0 - w * .12, y0 - w * .12); g.lineTo(x1 - w * .12, y1 - w * .12); g.stroke();
}
function threadCurve(g, pts, col, w = .24, alpha = 1) { // pts: [[x,y]...] smooth polyline
  const base = hex(PAL[col] || col), dark = mix(base, [20, 12, 8], .45), light = mix(base, [255, 252, 245], .45);
  const path = (dx, dy) => { g.beginPath(); g.moveTo(pts[0][0] + dx, pts[0][1] + dy); for (let k = 1; k < pts.length - 1; k++) { const mx = (pts[k][0] + pts[k + 1][0]) / 2, my = (pts[k][1] + pts[k + 1][1]) / 2; g.quadraticCurveTo(pts[k][0] + dx, pts[k][1] + dy, mx + dx, my + dy); } const l = pts[pts.length - 1]; g.lineTo(l[0] + dx, l[1] + dy); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  path(.25, .4); g.strokeStyle = `rgba(30,20,10,${.22 * alpha})`; g.lineWidth = w * 1.4; g.stroke();
  path(0, 0); g.strokeStyle = rgb(dark, alpha); g.lineWidth = w; g.stroke();
  g.strokeStyle = rgb(base, alpha); g.lineWidth = w * .62; g.stroke();
  path(-w * .12, -w * .12); g.strokeStyle = rgb(light, .5 * alpha); g.lineWidth = w * .18; g.stroke();
}
function holeDot(g, x, y, a = .5) { g.fillStyle = `rgba(40,28,15,${a})`; g.beginPath(); g.arc(x, y, .17, 0, TAU); g.fill(); }

// ---------------- needle ----------------
// A tapestry needle: blunt-ish taper, long eye, polished steel. p = where it pierces the cloth (or the tip, when it is
// wholly above it); the eye sits vis cells along ang. The working thread comes up out of the hole at origin and runs
// to the eye with weight: it lies on the cloth near the hole and lifts toward the needle; it trails behind motion (lag).
const NEEDLE_L = 17, NEEDLE_HW = .3;
function needlePath(g, x0) { // needle coordinates (0 = tip, NEEDLE_L = head), shifted by x0
  const L = NEEDLE_L, hw = NEEDLE_HW, tp = 4.2;
  g.beginPath();
  g.moveTo(x0 + 0, 0);
  g.bezierCurveTo(x0 + tp * .25, -hw * .25, x0 + tp * .6, -hw * .9, x0 + tp, -hw);
  g.lineTo(x0 + L - 2.6, -hw);
  g.bezierCurveTo(x0 + L - 1.9, -hw * 1.25, x0 + L - .3, -hw * 1.2, x0 + L, -hw * .45);
  g.quadraticCurveTo(x0 + L + .12, 0, x0 + L, hw * .45);
  g.bezierCurveTo(x0 + L - .3, hw * 1.2, x0 + L - 1.9, hw * 1.25, x0 + L - 2.6, hw);
  g.lineTo(x0 + tp, hw);
  g.bezierCurveTo(x0 + tp * .6, hw * .9, x0 + tp * .25, hw * .25, x0 + 0, 0);
  g.closePath();
  // the eye: a long slot cut right through
  const ec = x0 + L - 1.15;
  g.moveTo(ec + .62, 0); g.bezierCurveTo(ec + .62, -.11, ec - .62, -.11, ec - .62, 0); g.bezierCurveTo(ec - .62, .11, ec + .62, .11, ec + .62, 0); g.closePath();
}
function drawNeedle(g, px, py, ang, vis, lift, threadCol, origin, lagD, taut = 0) {
  const L = NEEDLE_L, ca = Math.cos(ang), sa = Math.sin(ang);
  const tipVis = vis >= L - .01;
  const x0 = vis - L; // needle coordinate of the pierce point is -x0
  const eyeC = vis - 1.15, ex = px + ca * eyeC, ey = py + sa * eyeC;
  const shx = .5 + lift * 1.5, shy = .75 + lift * 2.1;
  // working thread: hole -> eye, a quadratic that sags with slack and swings behind the motion
  if (threadCol && origin) {
    const [ox, oy] = origin, dx = ex - ox, dy = ey - oy, dist = Math.hypot(dx, dy) || 1;
    const slack = (1 - taut) * Math.min(4, .18 * dist + .6);
    const nxp = -dy / dist, nyp = dx / dist, side = nyp > 0 ? 1 : -1; // bow toward screen-down: thread weight
    let cx = (ox + ex) / 2 + nxp * side * slack + lagD[0] * .5 * (1 - taut), cy = (oy + ey) / 2 + nyp * side * slack + lagD[1] * .5 * (1 - taut);
    const pts = [], sh = [];
    for (let k = 0; k <= 16; k++) {
      const u = k / 16, x = (1 - u) * (1 - u) * ox + 2 * u * (1 - u) * cx + u * u * ex, y = (1 - u) * (1 - u) * oy + 2 * u * (1 - u) * cy + u * u * ey;
      pts.push([x, y]); const h = Math.pow(u, 1.6) * (1 + lift * 1.5) * (taut ? 1.3 : 1); sh.push([x + .15 + h * .45, y + .2 + h * .65]);
    }
    threadHang(g, pts, sh, threadCol, .28, taut);
    // the short tail through the eye, lying back along the shaft
    const tail = [[ex, ey], [ex + ca * .9 - sa * .35, ey + sa * .9 + ca * .35], [ex + ca * 1.8 - sa * .9 + lagD[0] * .3, ey + sa * 1.8 + ca * .9 + lagD[1] * .3], [ex + ca * 2.3 - sa * 1.6 + lagD[0] * .5, ey + sa * 2.3 + ca * 1.6 + lagD[1] * .5]];
    const tsh = tail.map(([x, y], k) => [x + .4 + lift * 1.5, y + .6 + lift * 2]);
    threadHang(g, tail, tsh, threadCol, .26, 0);
  }
  g.save(); g.translate(px, py); g.rotate(ang);
  if (!tipVis) { g.beginPath(); g.rect(0, -2, L + 2, 4); g.clip(); }
  // soft shadow on the cloth (two passes), offset by height
  g.save(); g.rotate(-ang); g.translate(shx, shy); g.rotate(ang);
  g.fillStyle = `rgba(30,20,10,${.16 / (1 + lift * .6)})`; g.lineWidth = .35; g.strokeStyle = g.fillStyle;
  needlePath(g, x0); g.fill('evenodd'); g.stroke();
  g.restore();
  // polished steel: dark edges, a hard specular line, warm reflected light from the linen underneath
  const grd = g.createLinearGradient(0, -NEEDLE_HW * 1.2, 0, NEEDLE_HW * 1.2);
  grd.addColorStop(0, '#3c3f44'); grd.addColorStop(.18, '#9aa0a7'); grd.addColorStop(.32, '#ffffff'); grd.addColorStop(.42, '#cfd3d8');
  grd.addColorStop(.7, '#7a7f86'); grd.addColorStop(.88, '#b9ab93'); grd.addColorStop(1, '#2f3236');
  g.fillStyle = grd; needlePath(g, x0); g.fill('evenodd');
  g.strokeStyle = 'rgba(25,27,30,.6)'; g.lineWidth = .045; g.stroke();
  // glints that slide as the needle moves
  const gl = x0 + 6 + ((px * .7 + py * .3) % 6 + 6) % 6;
  const gg = g.createRadialGradient(gl, -NEEDLE_HW * .35, 0, gl, -NEEDLE_HW * .35, 1.6);
  gg.addColorStop(0, 'rgba(255,255,255,.9)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gg; g.fillRect(gl - 1.6, -NEEDLE_HW, 3.2, NEEDLE_HW * .9);
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .035;
  g.beginPath(); g.moveTo(x0 + 4.4, -NEEDLE_HW * .42); g.lineTo(x0 + L - 2.8, -NEEDLE_HW * .42); g.stroke();
  g.restore();
  if (!tipVis) { // where it enters the cloth: a dimple
    const dg = g.createRadialGradient(px, py, 0, px, py, .6); dg.addColorStop(0, 'rgba(40,28,15,.55)'); dg.addColorStop(1, 'rgba(40,28,15,0)');
    g.fillStyle = dg; g.beginPath(); g.arc(px, py, .6, 0, TAU); g.fill();
  }
}
function threadHang(g, pts, sh, col, w, taut) {
  const base = hex(PAL[col] || col), dark = mix(base, [20, 12, 8], .45), light = mix(base, [255, 252, 245], .5);
  const path = (P) => { g.beginPath(); g.moveTo(P[0][0], P[0][1]); for (let k = 1; k < P.length; k++) g.lineTo(P[k][0], P[k][1]); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  path(sh); g.strokeStyle = 'rgba(30,20,10,.2)'; g.lineWidth = w * 1.5; g.stroke();
  path(pts); g.strokeStyle = rgb(dark); g.lineWidth = w; g.stroke();
  g.strokeStyle = rgb(base); g.lineWidth = w * .64; g.stroke();
  g.save(); g.translate(-w * .12, -w * .12); path(pts); g.strokeStyle = rgb(light, .45 + .35 * taut); g.lineWidth = w * .18; g.stroke(); g.restore();
  // ply twist ticks
  g.strokeStyle = rgb(dark, .5); g.lineWidth = w * .12;
  for (let k = 0; k < pts.length - 1; k++) { const [x0, y0] = pts[k], [x1, y1] = pts[k + 1], d = Math.hypot(x1 - x0, y1 - y0) || 1, n = Math.floor(d / (w * .9)); for (let q = 0; q < n; q++) { const u = (q + .5) / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u), tx = (x1 - x0) / d, ty = (y1 - y0) / d; g.beginPath(); g.moveTo(x - ty * w * .45 - tx * w * .2, y + tx * w * .45 - ty * w * .2); g.lineTo(x + ty * w * .45 + tx * w * .2, y - tx * w * .45 + ty * w * .2); g.stroke(); } }
}

// ---------------- coins ----------------
let COIN = [];
function buildCoins() {
  const mk = (metal, seed, label) => {
    const S = 256, c = mkCanvas(S, S), g = c.getContext('2d'), R = mulberry(seed), r = S / 2 - 4;
    const base = metal === 'gold' ? [205, 160, 70] : [192, 196, 200], dk = mix(base, [30, 25, 20], .55), lt = mix(base, [255, 255, 250], .6);
    const gr = g.createRadialGradient(S * .38, S * .34, 4, S / 2, S / 2, r);
    gr.addColorStop(0, rgb(lt)); gr.addColorStop(.6, rgb(base)); gr.addColorStop(1, rgb(dk));
    g.fillStyle = gr; g.beginPath(); g.arc(S / 2, S / 2, r, 0, TAU); g.fill();
    // milled edge
    g.strokeStyle = rgb(dk, .7); g.lineWidth = 2;
    for (let k = 0; k < 120; k++) { const a = k / 120 * TAU; g.beginPath(); g.moveTo(S / 2 + Math.cos(a) * (r - 1), S / 2 + Math.sin(a) * (r - 1)); g.lineTo(S / 2 + Math.cos(a) * (r - 9), S / 2 + Math.sin(a) * (r - 9)); g.stroke(); }
    // raised rim
    g.lineWidth = 6; g.strokeStyle = rgb(lt, .6); g.beginPath(); g.arc(S / 2 - 1, S / 2 - 1, r - 16, 0, TAU); g.stroke();
    g.strokeStyle = rgb(dk, .6); g.beginPath(); g.arc(S / 2 + 2, S / 2 + 2, r - 16, 0, TAU); g.stroke();
    // embossed number + beads
    g.font = 'bold 110px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = rgb(dk, .7); g.fillText(label, S / 2 + 3, S / 2 + 6);
    g.fillStyle = rgb(lt, .9); g.fillText(label, S / 2 - 1, S / 2 + 2);
    for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; g.fillStyle = rgb(k % 2 ? lt : dk, .7); g.beginPath(); g.arc(S / 2 + Math.cos(a) * (r - 34), S / 2 + Math.sin(a) * (r - 34), 4, 0, TAU); g.fill(); }
    // wear scratches
    for (let k = 0; k < 30; k++) { g.strokeStyle = `rgba(255,255,255,${R() * .2})`; g.lineWidth = 1; const x = 40 + R() * 176, y = 40 + R() * 176; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 40, y + (R() - .5) * 10); g.stroke(); }
    return { c, base, dk };
  };
  COIN = [mk('silver', 3, '25'), mk('gold', 5, '1'), mk('silver', 9, '10')];
}
// coin: world centre, diameter d, tilt (0 flat .. ~.8 on edge), heading (roll direction), spin (face rotation), lift
function drawCoin(g, k, x, y, d, tilt, heading, spin, lift) {
  const C = COIN[k], sq = Math.cos(tilt);
  // shadow
  g.save(); g.translate(x + .4 + lift * 2, y + .7 + lift * 3); g.rotate(heading); g.scale(1, Math.max(sq, .35));
  g.fillStyle = `rgba(30,20,10,${.35 / (1 + lift * .7)})`; g.beginPath(); g.arc(0, 0, d / 2 * (1 + lift * .15), 0, TAU); g.fill(); g.restore();
  g.save(); g.translate(x, y - lift); g.rotate(heading); g.scale(1, sq);
  // edge thickness when tilted
  if (tilt > .05) { g.fillStyle = rgb(C.dk); for (let k = 1; k <= 3; k++) { g.beginPath(); g.arc(0, d * .045 * k * Math.sin(tilt) / sq, d / 2, 0, TAU); g.fill(); } }
  g.rotate(spin); g.drawImage(C.c, -d / 2, -d / 2, d, d);
  g.restore();
}

// ---------------- table + hoop ----------------
let WOOD;
function buildWood() {
  const S = 1024, c = mkCanvas(S, S), g = c.getContext('2d'), R = mulberry(41);
  g.fillStyle = '#5a3a22'; g.fillRect(0, 0, S, S);
  // planks
  for (let p = 0; p < 4; p++) {
    const y0 = p * S / 4;
    for (let k = 0; k < 90; k++) {
      const y = y0 + R() * S / 4, a = .05 + R() * .12, dark = R() < .6;
      g.strokeStyle = dark ? `rgba(30,16,8,${a})` : `rgba(160,110,70,${a})`; g.lineWidth = 1 + R() * 3;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= S; x += 32) g.lineTo(x, y + Math.sin(x * .006 + k) * 4 + n1(k + p * 100, x / 140) * 5);
      g.stroke();
    }
    g.fillStyle = 'rgba(15,8,4,.6)'; g.fillRect(0, y0, S, 3);
  }
  WOOD = c;
}
// outer hoop ring in world units centred at (0,0): inner radius r0, width rw
function drawHoop(g, r0, rw, lift) {
  const rm = r0 + rw / 2;
  g.save();
  const sc = 1 + lift * .55;
  // shadow on the cloth/table
  const so = .8 + lift * 9;
  for (let k = 0; k < 4; k++) { g.strokeStyle = `rgba(20,12,6,${.12 * (1 - lift)})`; g.lineWidth = rw + 1.6 + k * 1.2 + lift * 6; g.beginPath(); g.arc(so * .6, so, rm * (1 + lift * .1), 0, TAU); g.stroke(); }
  g.translate(-lift * 10, -lift * lift * 190); g.scale(sc, sc);
  // body: concentric strokes give the rounded profile
  const prof = [[0, '#7a5230'], [.18, '#a77a4c'], [.38, '#d0a774'], [.55, '#c2955f'], [.78, '#9c6d41'], [1, '#6a4425']];
  const n = 14;
  for (let k = 0; k < n; k++) {
    const u = (k + .5) / n; let col = prof[0][1];
    for (let q = 1; q < prof.length; q++) if (u <= prof[q][0]) { const a = hex(prof[q - 1][1]), b = hex(prof[q][1]); col = rgb(mix(a, b, (u - prof[q - 1][0]) / (prof[q][0] - prof[q - 1][0]))); break; }
    g.strokeStyle = col; g.lineWidth = rw / n + .05; g.beginPath(); g.arc(0, 0, r0 + u * rw, 0, TAU); g.stroke();
  }
  // grain
  for (let k = 0; k < 40; k++) {
    const r = r0 + .2 + rnd(k, 1) * (rw - .4), a0 = rnd(k, 2) * TAU, al = .3 + rnd(k, 3) * 1.4;
    g.strokeStyle = `rgba(70,40,18,${.15 + rnd(k, 4) * .2})`; g.lineWidth = .06 + rnd(k, 5) * .1;
    g.beginPath(); g.arc(0, 0, r, a0, a0 + al); g.stroke();
  }
  // directional light: bright upper-left, dark lower-right
  const lg = g.createLinearGradient(-rm, -rm, rm, rm);
  lg.addColorStop(0, 'rgba(255,240,210,.22)'); lg.addColorStop(.5, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(20,10,0,.3)');
  g.strokeStyle = lg; g.lineWidth = rw; g.beginPath(); g.arc(0, 0, rm, 0, TAU); g.stroke();
  // brass clamp at the top
  g.save(); g.translate(0, -(r0 + rw));
  for (const sx of [-1, 1]) {
    const tg = g.createLinearGradient(sx * 1.6, -3, sx * 1.6, 1.5); tg.addColorStop(0, '#f2d58a'); tg.addColorStop(1, '#8a6420');
    g.fillStyle = tg; g.fillRect(sx > 0 ? .5 : -2.7, -3.2, 2.2, 4.6);
    g.fillStyle = 'rgba(40,25,5,.5)'; g.fillRect(sx > 0 ? .5 : -2.7, 1.1, 2.2, .3);
  }
  const sg = g.createLinearGradient(-4, -2.8, -4, -.8); sg.addColorStop(0, '#fff0bb'); sg.addColorStop(.5, '#c9a24a'); sg.addColorStop(1, '#6f4f12');
  g.fillStyle = sg; g.fillRect(-5.2, -2.6, 10.4, 1.7);
  g.fillStyle = '#b48c34'; g.beginPath(); g.ellipse(-5.6, -1.75, .7, 1.25, 0, 0, TAU); g.fill();
  g.fillStyle = '#e9c97a'; g.beginPath(); g.ellipse(-5.8, -2.1, .3, .5, 0, 0, TAU); g.fill();
  g.restore();
  g.restore();
}

let VIG;
function buildVignette() {
  VIG = mkCanvas(); const g = VIG.getContext('2d');
  const vg = g.createRadialGradient(W * .44, H * .4, H * .25, W / 2, H / 2, W * .66);
  vg.addColorStop(0, 'rgba(255,240,215,0)'); vg.addColorStop(1, 'rgba(40,20,5,.45)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const lg = g.createLinearGradient(0, 0, W, H); lg.addColorStop(0, 'rgba(255,230,190,.10)'); lg.addColorStop(1, 'rgba(0,0,0,.08)');
  g.fillStyle = lg; g.fillRect(0, 0, W, H);
}

// french knot: a little coil of thread sitting proud of the cloth
function drawKnot(g, x, y, col, r = .3) {
  const base = hex(PAL[col]), dark = mix(base, [0, 0, 0], .5), light = mix(base, [255, 255, 255], .5);
  g.fillStyle = 'rgba(30,20,10,.4)'; g.beginPath(); g.arc(x + .07, y + .1, r * 1.1, 0, TAU); g.fill();
  const gr = g.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r);
  gr.addColorStop(0, rgb(light)); gr.addColorStop(.5, rgb(base)); gr.addColorStop(1, rgb(dark));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.strokeStyle = rgb(dark, .7); g.lineWidth = r * .16;
  for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x, y, r * (.35 + k * .2), k * 2.1, k * 2.1 + 3.6); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(x - r * .38, y - r * .4, r * .16, 0, TAU); g.fill();
}
