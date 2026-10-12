// Woodcut chapbook, the last chapter: the case, the judge, the verdict, the refrain, the tail (261.5 to the end).
// renderFrame(t) is a pure function of song time. Built on the stanza-1 kit (woodcut.js, print.js, figures.js,
// loaded read-only); the camera, slots and page furniture are copies of main.js under new names.
// One long uncut sheet of pages on the table, block to block, then a colophon page and a pull-back.
const outE = document.getElementById('c'); outE.width = W; outE.height = H;
const gE = outE.getContext('2d', { willReadFrequently: true }); // CPU canvas throughout (see main.js)
const ACCE = mkCanvas(W, H), AGE = ACCE.getContext('2d');

const PWE = 2080;
const SHEETE = { x0: -230, x1: (NPAGES_E - 1) * PWE + 1920 + 230, y0: -64, y1: 1144 };
const BLKE = { x: 604, y: 140 };
const COLE = { x: 84, y: 166, w: 470, y1: 728 };
const FONTE = 92, FONT_HELD = 156, HELD_BASE = 986;

// ---------------- camera ----------------
const PANSE = [];
for (let i = 1; i < LYE.length; i++) if (PAGE_E[i] !== PAGE_E[i - 1]) {
  const lw = LYE[i - 1].words[LYE[i - 1].words.length - 1].s, b = LYE[i].s;
  PANSE.push({ b, from: PAGE_E[i - 1], to: PAGE_E[i], cut: b - lw < .45, a: b - .3 });
}
PANSE.push({ b: BE.colPan, from: 6, to: 7, cut: false, a: BE.colPan - .55 }); // the tail: on to the colophon
const smootherE = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const PULLE = { a: BE.pullA, b: BE.pullB, s: .46, dx: -1040, dy: 20 };
function camE(t) {
  let page = 0;
  for (const p of PANSE) {
    if (p.cut) { if (t >= p.b - FE) page = p.to; }
    else if (t >= p.a) page = p.from + (p.to - p.from) * smootherE((t - p.a) / (p.b - FE - p.a));
  }
  let cx = page * PWE + 960, cy = 540;
  // the colophon print: a small jolt as the platen meets the paper
  const dT = t - BE.colPan; if (dT > 0) cy += 7 * Math.exp(-dT * 11) * Math.sin(dT * 70);
  const u = smootherE((t - PULLE.a) / (PULLE.b - PULLE.a));
  return { x: cx + PULLE.dx * u, y: cy + PULLE.dy * u, s: lerp(1, PULLE.s, u) };
}

// ---------------- caption layout (as main.js: BIG, UPPER, COLUMN) ----------------
const MCE = mkCanvas(8, 8).getContext('2d');
function mwE(txt, size) { MCE.font = `${size}px "Big Caslon"`; return MCE.measureText(txt).width; }
let LAYE = {};
const SLOTE = { bigBase: 958, big2Base: 904, big2Lead: 100, upBase: 808, upSize: 64 };
function runsRowE(words, size, x, y, iniScale) {
  const sp = mwE(' ', size), R = [];
  const ini = words[0][0], isz = size * iniScale;
  R.push({ txt: ini, x, y, size: isz, red: true, wi: 0 }); x += mwE(ini, isz) + size * .02 + (KERN_INI[ini] || 0) * isz;
  words.forEach((w, k) => { const txt = k ? w : w.slice(1); if (k) x += sp; if (txt) R.push({ txt, x, y, size, red: false, wi: k }); x += mwE(txt, size); });
  return R;
}
const KERN_INI = { T: -.08, W: -.04, Y: -.06, P: -.02 }; // the big initials' overhang (a T leaves a hole under its arm)
function rowWE(words, size, iniScale) { const sp = mwE(' ', size); return mwE(words[0][0], size * iniScale) * (1 + (KERN_INI[words[0][0]] || 0)) + size * .02 + words.reduce((a, w, k) => a + (k ? sp : 0) + mwE(k ? w : w.slice(1), size), 0); }
function layBigE(li) {
  const key = 'B' + li; if (LAYE[key]) return LAYE[key];
  const words = LYE[li].words.map(w => w.w), maxW = 1700;
  let size = words.length === 1 ? FONT_HELD : FONTE, R;
  const ini = words.length === 1 ? 1.3 : 1.62;
  if (rowWE(words, size, ini) <= maxW) { const w = rowWE(words, size, ini); R = runsRowE(words, size, 960 - w / 2, words.length === 1 ? HELD_BASE : SLOTE.bigBase, ini); }
  else {
    size = 86; // two rows with a dropped initial spanning both
    let best = null;
    for (let k = 2; k < words.length; k++) { const a = words.slice(0, k), b = words.slice(k); const wa = rowWE(a, size, 1) - mwE(a[0][0], size), wb = rowWE(b, size, 1); const m = Math.max(wa, wb); if (!best || m < best.m) best = { k, m }; }
    const capSize = (SLOTE.big2Lead + size * .72) / .72, capW = mwE(words[0][0], capSize);
    const total = capW + 16 + best.m, x0 = 960 - total / 2, tx = x0 + capW + 16;
    R = [{ txt: words[0][0], x: x0, y: SLOTE.big2Base + SLOTE.big2Lead, size: capSize, red: true, wi: 0 }];
    const sp = mwE(' ', size);
    [words.slice(0, best.k), words.slice(best.k)].forEach((row, r) => {
      let x = tx;
      row.forEach((w, k) => { const gi = r ? best.k + k : k; const txt = gi ? w : w.slice(1); if (k) x += sp; R.push({ txt, x, y: SLOTE.big2Base + r * SLOTE.big2Lead, size, red: false, wi: gi }); x += mwE(txt, size); });
    });
  }
  return (LAYE[key] = R);
}
function layUpperE(li) {
  const key = 'U' + li; if (LAYE[key]) return LAYE[key];
  const words = LYE[li].words.map(w => w.w);
  let size = SLOTE.upSize; while (rowWE(words, size, 1.25) > 1700) size -= 2;
  const w = rowWE(words, size, 1.25);
  return (LAYE[key] = runsRowE(words, size, 960 - w / 2, SLOTE.upBase, 1.25));
}
// The side column holds the chain so far. This chapter has 21 lines, too many for one column, so each page's
// column starts as far back as still fits by the page's last line (the earliest lines drop off the top).
const COLSZE = 29, COLLEADE = 36;
function layColE(cs, li) {
  const key = 'C' + cs + '_' + li; if (LAYE[key]) return LAYE[key];
  let y = COLE.y + 34;
  for (let k = cs; k < li; k++) y += layColE(cs, k).rows * COLLEADE + 8;
  const words = LYE[li].words.map(w => w.w), sp = mwE(' ', COLSZE);
  const R = [{ txt: words[0][0], x: COLE.x, y, size: COLSZE * 1.45, red: true, wi: 0 }];
  let x = COLE.x + mwE(words[0][0], COLSZE * 1.45) + 1, row = 0;
  words.forEach((w, k) => {
    const txt = k ? w : w.slice(1), ww = mwE(txt, COLSZE);
    if (k && x + sp + ww > COLE.x + COLE.w) { row++; x = COLE.x + 22; } else if (k) x += sp;
    if (txt) R.push({ txt, x, y: y + row * COLLEADE, size: COLSZE, red: false, wi: k }); x += ww;
  });
  R.rows = row + 1; R.bottom = y + row * COLLEADE + 10;
  return (LAYE[key] = R);
}
const COLSTART = [];
function colStart(p) {
  if (COLSTART[p] != null) return COLSTART[p];
  const lines = PAGE_E.map((pp, i) => pp === p ? i : -1).filter(i => i >= 0);
  const last = lines[lines.length - 1] - 2;
  let cs = 0; while (cs < last && layColE(cs, last).bottom > COLE.y1) cs++;
  return (COLSTART[p] = cs);
}

// ---------------- printing helpers ----------------
const wordOnE = (t, s) => t >= s - FE;
const strikeE = (t, s) => { const k = (t - (s - FE)) * 24; return k < 0 ? -1 : k < 3 ? 1 - k / 3 : 0; };
const curLineE = (t) => { let i = -1; for (let k = 0; k < LYE.length; k++) if (t >= LYE[k].s - FE) i = k; return i; };

// the page furniture: border, rules and the stanza-1 ornaments (headers, corners, the caption rule's flowers)
const ORNE = [
  { ch: '❦', font: 'Big Caslon', x: 960, y: 100, size: 58 },
  { ch: 'r', x: 1080, y: 100, size: 56 }, { ch: 'r', x: 840, y: 100, size: 56, flip: true },
  { ch: 'C', x: 1260, y: 104, size: 60 }, { ch: 'C', x: 660, y: 104, size: 60, flip: true },
  { ch: '0', x: 1560, y: 92, size: 80 }, { ch: '0', x: 360, y: 92, size: 80 },
  { ch: '1', x: 92, y: 106, size: 62 }, { ch: '1', x: 1828, y: 106, size: 62 },
  { ch: '1', x: 1828, y: 1016, size: 62 }, { ch: '1', x: 92, y: 1016, size: 62 },
  { ch: 'q', x: 96, y: 752, size: 34 }, { ch: 'q', x: 1824, y: 752, size: 34, flip: true },
];
// the colophon page: the column's flowers (as on the first page of the book), and a tailpiece under the block
// that prints centre-out on the last hits of the band
const COLOPHON_ORN = [
  { ch: '❧', font: 'Big Caslon', x: 318, y: 262, size: 120 }, { ch: '0', x: 318, y: 312, size: 150 },
  { ch: 'I', x: 250, y: 430, size: 96 }, { ch: 'J', x: 386, y: 430, size: 96 },
  { ch: '0', x: 318, y: 488, size: 150 }, { ch: '❦', font: 'Big Caslon', x: 318, y: 712, size: 52 },
  { ch: '☞', font: 'Big Caslon', x: 318, y: 640, size: 190 },
  { t: 332.25, ch: '❦', font: 'Big Caslon', x: 960, y: 930, size: 110 },
  { t: 332.67, ch: 'r', x: 1110, y: 920, size: 84 }, { t: 332.67, ch: 'r', x: 810, y: 920, size: 84, flip: true },
  { t: 333.18, ch: 'C', x: 1330, y: 926, size: 84 }, { t: 333.18, ch: 'C', x: 590, y: 926, size: 84, flip: true },
  { t: 333.73, ch: '0', x: 1600, y: 912, size: 110 }, { t: 333.73, ch: '0', x: 320, y: 912, size: 110 },
];
function ornE(L, o, t) {
  if (o.t != null && t < o.t - FE) return;
  const k = o.t != null ? Math.max(0, strikeE(t, o.t)) : 0;
  L.save(); L.translate(o.x, o.y); const sc = 1 + k * .1; L.scale(sc * (o.flip ? -1 : 1), sc);
  PR.ornament(L, o.ch, 0, 0, o.size, { font: o.font }); L.restore();
}
function pageFrameE(L, p, t) {
  L.strokeStyle = PR.INK; L.lineWidth = 7; L.strokeRect(26, 26, 1868, 1028);
  L.lineWidth = 2.2; L.strokeRect(40, 40, 1840, 1000);
  L.lineWidth = 5; L.beginPath(); L.moveTo(56, 118); L.lineTo(1864, 118); L.stroke();
  L.lineWidth = 1.6; L.beginPath(); L.moveTo(56, 128); L.lineTo(1864, 128); L.stroke();
  L.lineWidth = 1.6; L.beginPath(); L.moveTo(56, 742); L.lineTo(1864, 742); L.stroke();
  L.beginPath(); L.moveTo(580, 146); L.lineTo(580, 730); L.stroke();
  for (const o of ORNE) ornE(L, o, t);
  if (p === 7) {
    for (const o of COLOPHON_ORN) ornE(L, o, t);
    if (t < BE.colPan - FE) { // registration marks round the empty block, as on the first page before the king
      L.strokeStyle = PR.INK; L.lineWidth = 3;
      for (const [x, y, dx, dy] of [[604, 140, 1, 1], [1844, 730, -1, -1], [1844, 140, -1, 1], [604, 730, 1, -1]]) { L.beginPath(); L.moveTo(x + dx * 34, y); L.lineTo(x, y); L.lineTo(x, y + dy * 34); L.stroke(); }
    }
  }
}

function drawRunsE(L, R, li, A, Bl, u, t, live, toCol = false) {
  const words = LYE[li].words;
  A.forEach((ra, k) => {
    const w = words[ra.wi]; if (!wordOnE(t, w.s)) return;
    const rb = Bl ? Bl[k] : ra;
    const ux = toCol ? ease(u, 0, .45) : ease(u, .45, 1), uy = toCol ? ease(u, .3, .8) : ease(u, .45, 1);
    const x = lerp(ra.x, rb.x, ux), y = lerp(ra.y, rb.y, uy), size = lerp(ra.size, rb.size, ux);
    const kk = live ? Math.max(0, strikeE(t, w.s)) : 0;
    const C = ra.red ? R : L;
    if (PROBE.on) { // audit: on its onset, inside the page's inner border, and the sung line on screen
      probeWord(t, LYE[li].i, ra.wi, (tt) => wordOnE(tt, w.s));
      C.font = `${size}px "Big Caslon"`; C.textAlign = 'left'; C.textBaseline = 'alphabetic';
      const c0 = camE(t - 1 / 96), c1 = camE(t + 1 / 96), settled = Math.abs((c1.x - c0.x) * c1.s) < 3 && Math.abs(c1.s - c0.s) < 1e-3;
      PROBE.text(C, 'woodcut caption', ra.txt, x, y, [40, 40, 1840, 1000], { keep: li === curLineE(t) && settled, margin: 4 });
    }
    C.save(); C.translate(x, y); C.scale(1 + kk * .06, 1 + kk * .06);
    PR.typeText(C, ra.txt, 0, 0, size, ra.red ? { color: PR.RED } : {});
    if (kk > .3 && !ra.red) PR.typeText(C, ra.txt, 0, 0, size);
    C.restore();
  });
}
const MOVEE = .3;
function pageTypeE(L, R, p, t) {
  const lines = PAGE_E.map((pp, i) => pp === p ? i : -1).filter(i => i >= 0);
  if (!lines.length) return;
  const cl = curLineE(t);
  const big = lines.includes(cl) ? cl : (cl > lines[lines.length - 1] ? lines[lines.length - 1] : lines[0]);
  const nx = big + 1, moving = lines.includes(nx) && t >= LYE[nx].s - FE - MOVEE;
  const u = moving ? lin(t, LYE[nx].s - FE - MOVEE, LYE[nx].s - FE - .02) : 0;
  const cs = colStart(p);
  for (let li = cs; li < big - 1; li++) drawRunsE(L, R, li, layColE(cs, li), null, 0, t, false);
  if (big >= 1) drawRunsE(L, R, big - 1, layUpperE(big - 1), moving ? layColE(cs, big - 1) : null, u, t, false, true);
  drawRunsE(L, R, big, layBigE(big), moving ? layUpperE(big) : null, u, t, !moving);
}

// ---------------- the scene ----------------
function drawSceneE(t, dst) {
  const cam = camE(t), s = cam.s;
  const sx = (x) => (x - cam.x) * s + W / 2, sy = (y) => (y - cam.y) * s + H / 2;
  dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha = 1; dst.globalCompositeOperation = 'source-over'; dst.filter = 'none';
  dst.fillStyle = PR.woodPattern(dst, cam); dst.fillRect(0, 0, W, H);
  dst.save(); dst.shadowColor = 'rgba(0,0,0,.55)'; dst.shadowBlur = 30 * s; dst.shadowOffsetY = 8 * s;
  dst.fillStyle = PR.paperPattern(dst, cam);
  dst.beginPath();
  const nE = 80;
  for (let k = 0; k <= nE; k++) { const x = lerp(SHEETE.x0, SHEETE.x1, k / nE); const y = SHEETE.y0 + rnd(k, 1) * 6; k ? dst.lineTo(sx(x), sy(y)) : dst.moveTo(sx(x), sy(y)); }
  for (let k = nE; k >= 0; k--) { const x = lerp(SHEETE.x0, SHEETE.x1, k / nE); dst.lineTo(sx(x), sy(SHEETE.y1 - rnd(k, 2) * 6)); }
  dst.closePath(); dst.fill(); dst.restore();

  const vis0 = cam.x - W / 2 / s, vis1 = cam.x + W / 2 / s;
  PR.beginType();
  for (let p = 0; p < NPAGES_E; p++) {
    const px = p * PWE; if (px + 1920 < vis0 || px > vis1) continue;
    const ox = sx(px), oy = sy(0);
    const bx = ox + BLKE.x * s, by = oy + BLKE.y * s;
    if (p < 7 || t >= BE.colPan - FE) {
      const k = p === 7 ? Math.max(0, strikeE(t, BE.colPan)) : 0;
      WC.block(dst, bx, by, s, BW, BH, (gg, P) => BLOCKS_E[p](gg, P, t), { seed: 71 + p * 7, inkAmt: 1 + k * .08 });
    } else if (t >= BE.colPan - .1) { // the inked block comes down onto the paper
      const u = ease(t, BE.colPan - .1, BE.colPan - FE);
      dst.save(); dst.globalCompositeOperation = 'multiply'; dst.fillStyle = `rgba(20,16,12,${.25 + .7 * u})`;
      const e = (1 - u) * 26 * s; dst.fillRect(bx - e, by - e, BW * s + 2 * e, BH * s + 2 * e); dst.restore();
    }
    for (const L of [PR.TLg, PR.RLg]) L.setTransform(s, 0, 0, s, ox, oy);
    pageFrameE(PR.TLg, p, t);
    pageTypeE(PR.TLg, PR.RLg, p, t);
  }
  PR.endType(dst, cam);
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0);
  const vg = dst.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.15); vg.addColorStop(0, 'rgba(60,40,20,0)'); vg.addColorStop(1, 'rgba(60,40,20,.28)');
  dst.globalCompositeOperation = 'multiply'; dst.fillStyle = vg; dst.fillRect(0, 0, W, H); dst.restore();
  drawGrain(dst, t, .07);
}

function renderFrameE(t) {
  drawSceneE(t, gE);
  // whip pans: the sheet moves rigidly, so smear the one exposure along the pan (a 180-degree shutter)
  const c0 = camE(t - 1 / 96), c1 = camE(t + 1 / 96);
  if (Math.abs(c1.s - c0.s) > 1e-4) return;
  const d = (c0.x - c1.x) * c1.s;
  const n = Math.min(40, Math.ceil(Math.abs(d) / 3));
  if (n < 3) return;
  AGE.setTransform(1, 0, 0, 1, 0, 0); AGE.globalAlpha = 1; AGE.globalCompositeOperation = 'copy'; AGE.drawImage(outE, 0, 0);
  gE.setTransform(1, 0, 0, 1, 0, 0); gE.globalCompositeOperation = 'source-over';
  for (let k = 0; k < n; k++) { gE.globalAlpha = 1 / (k + 1); gE.drawImage(ACCE, d * (k / (n - 1) - .5), 0); }
  gE.globalAlpha = 1;
}

const readyE = document.fonts.load('92px "Big Caslon"').then(() => document.fonts.load('60px "Hoefler Text Ornaments"')).then(() => { LAYE = {}; COLSTART.length = 0; renderFrameE(262); renderFrameE(300); return true; });
startPage(outE, renderFrameE, TE0, TE1, readyE);
