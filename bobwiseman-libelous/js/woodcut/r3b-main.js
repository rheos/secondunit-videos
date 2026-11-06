// Round 3, wood-B: the woodcut chapbook, stanzas 8-11 (frames 3962-6276). renderFrame is a pure function of song
// time. Built on the stanza-1 kit (woodcut.js, print.js, figures.js) and the round-2 figure files, all loaded
// read-only; the camera, caption slots and page furniture are copies of end-main.js / story.js under r3b names.
// One long uncut sheet of 24 pages on the table, block to block, as in every other woodcut chapter.
const r3bOut = document.getElementById('c'); r3bOut.width = W; r3bOut.height = H;
const r3bG = r3bOut.getContext('2d', { willReadFrequently: true }); // CPU canvas throughout (see main.js)
const r3bACC = mkCanvas(W, H), r3bAG = r3bACC.getContext('2d');

const r3bPW = 2080;
const r3bSHEET = { x0: -230, x1: (r3bNPAGES - 1) * r3bPW + 1920 + 230, y0: -64, y1: 1144 };
const r3bBLK = { x: 604, y: 140 };
const r3bCOL = { x: 84, y: 166, w: 470, y1: 728 };
const r3bFONT = 92;

// ---------------- type layers: CPU-backed (a copy of story.js STYPE: GPU layers drew big initials order-dependently) ----------------
const r3bTYPE = (() => {
  const mk = () => { const c = mkCanvas(W, H); return [c, c.getContext('2d', { willReadFrequently: true })]; };
  const [TL, TLg] = mk(), [RL, RLg] = mk();
  function beginType() { for (const g of [TLg, RLg]) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H); } }
  function endType(g, cam) {
    const m = new DOMMatrix([cam.s, 0, 0, cam.s, (0 - cam.x) * cam.s + W / 2, (0 - cam.y) * cam.s + H / 2]);
    for (const L of [TLg, RLg]) {
      L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = 'destination-out';
      const pt = L.createPattern(PR.speck, 'repeat'); pt.setTransform(m); L.fillStyle = pt; L.globalAlpha = .9; L.fillRect(0, 0, W, H);
      L.globalAlpha = 1; L.globalCompositeOperation = 'source-over';
    }
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    const o = Math.max(1, 1.8 * cam.s);
    g.globalAlpha = .16; g.drawImage(TL, o, o); g.drawImage(RL, o + 3 * cam.s, o - 2 * cam.s);
    g.globalAlpha = .95; g.globalCompositeOperation = 'multiply';
    g.drawImage(RL, 3 * cam.s, -2 * cam.s);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = .96; g.drawImage(TL, 0, 0);
    g.restore();
  }
  return { TLg, RLg, beginType, endType };
})();

// ---------------- camera: whip pans (or straight cuts) between pages, as stanzas 1-5 and 12-14 ----------------
const r3bPANS = [];
for (let i = 1; i < r3bLY.length; i++) if (r3bPAGE[i] !== r3bPAGE[i - 1]) {
  const lw = r3bLY[i - 1].words[r3bLY[i - 1].words.length - 1].s, b = r3bLY[i].s;
  r3bPANS.push({ b, from: r3bPAGE[i - 1], to: r3bPAGE[i], cut: b - lw < .45, a: b - .3 });
}
const r3bSmoother = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
function r3bCam(t) {
  let page = 0;
  for (const p of r3bPANS) {
    if (p.cut) { if (t >= p.b - r3bF) page = p.to; }
    else if (t >= p.a) page = p.from + (p.to - p.from) * r3bSmoother((t - p.a) / (p.b - r3bF - p.a));
  }
  return { x: page * r3bPW + 960, y: 540, s: 1 };
}

// ---------------- caption layout (BIG = the line being sung, UPPER = the line before, COLUMN = the stanza so far) ----------------
const r3bMC = mkCanvas(8, 8).getContext('2d');
function r3bMw(txt, size) { r3bMC.font = `${size}px "Big Caslon"`; return r3bMC.measureText(txt).width; }
let r3bLAY = {};
const r3bSLOT = { bigBase: 958, big2Base: 904, big2Lead: 100, upBase: 808, upSize: 64 };
const r3bKERN = { T: -.08, W: -.04, Y: -.06, P: -.02 }; // the big initials' overhang (as end-main.js)
function r3bRunsRow(words, size, x, y, iniScale) {
  const sp = r3bMw(' ', size), R = [];
  const ini = words[0][0], isz = size * iniScale;
  R.push({ txt: ini, x, y, size: isz, red: true, wi: 0 }); x += r3bMw(ini, isz) + size * .02 + (r3bKERN[ini] || 0) * isz;
  words.forEach((w, k) => { const txt = k ? w : w.slice(1); if (k) x += sp; if (txt) R.push({ txt, x, y, size, red: false, wi: k }); x += r3bMw(txt, size); });
  return R;
}
function r3bRowW(words, size, iniScale) { const sp = r3bMw(' ', size); return r3bMw(words[0][0], size * iniScale) * (1 + (r3bKERN[words[0][0]] || 0)) + size * .02 + words.reduce((a, w, k) => a + (k ? sp : 0) + r3bMw(k ? w : w.slice(1), size), 0); }
function r3bLayBig(li) {
  const key = 'B' + li; if (r3bLAY[key]) return r3bLAY[key];
  const words = r3bLY[li].words.map(w => w.w), maxW = 1700;
  let size = r3bFONT, R;
  const ini = 1.62;
  if (r3bRowW(words, size, ini) <= maxW) { const w = r3bRowW(words, size, ini); R = r3bRunsRow(words, size, 960 - w / 2, r3bSLOT.bigBase, ini); }
  else {
    size = 86; // two rows with a dropped initial spanning both
    let best = null;
    for (let k = 2; k < words.length; k++) { const a = words.slice(0, k), b = words.slice(k); const wa = r3bRowW(a, size, 1) - r3bMw(a[0][0], size), wb = r3bRowW(b, size, 1); const m = Math.max(wa, wb); if (!best || m < best.m) best = { k, m }; }
    const capSize = (r3bSLOT.big2Lead + size * .72) / .72, capW = r3bMw(words[0][0], capSize);
    const total = capW + 16 + best.m, x0 = 960 - total / 2, tx = x0 + capW + 16;
    R = [{ txt: words[0][0], x: x0, y: r3bSLOT.big2Base + r3bSLOT.big2Lead, size: capSize, red: true, wi: 0 }];
    const sp = r3bMw(' ', size);
    [words.slice(0, best.k), words.slice(best.k)].forEach((row, r) => {
      let x = tx;
      row.forEach((w, k) => { const gi = r ? best.k + k : k; const txt = gi ? w : w.slice(1); if (k) x += sp; R.push({ txt, x, y: r3bSLOT.big2Base + r * r3bSLOT.big2Lead, size, red: false, wi: gi }); x += r3bMw(txt, size); });
    });
  }
  return (r3bLAY[key] = R);
}
function r3bLayUpper(li) {
  const key = 'U' + li; if (r3bLAY[key]) return r3bLAY[key];
  const words = r3bLY[li].words.map(w => w.w);
  let size = r3bSLOT.upSize; while (r3bRowW(words, size, 1.25) > 1700) size -= 2;
  const w = r3bRowW(words, size, 1.25);
  return (r3bLAY[key] = r3bRunsRow(words, size, 960 - w / 2, r3bSLOT.upBase, 1.25));
}
// The side column holds the stanza so far, restarting with each stanza (as story.js). Stanza 8 has 16 lines, too
// many for one column, so a page's column starts as far into its stanza as still fits by the page's last line
// (as end-main.js: the earliest lines drop off the top).
const r3bCOLSZ = 29, r3bCOLLEAD = 36;
function r3bLayCol(cs, li) {
  const key = 'C' + cs + '_' + li; if (r3bLAY[key]) return r3bLAY[key];
  let y = r3bCOL.y + 34;
  for (let k = cs; k < li; k++) y += r3bLayCol(cs, k).rows * r3bCOLLEAD + 8;
  const words = r3bLY[li].words.map(w => w.w), sp = r3bMw(' ', r3bCOLSZ);
  const R = [{ txt: words[0][0], x: r3bCOL.x, y, size: r3bCOLSZ * 1.45, red: true, wi: 0 }];
  let x = r3bCOL.x + r3bMw(words[0][0], r3bCOLSZ * 1.45) + 1, row = 0;
  words.forEach((w, k) => {
    const txt = k ? w : w.slice(1), ww = r3bMw(txt, r3bCOLSZ);
    if (k && x + sp + ww > r3bCOL.x + r3bCOL.w) { row++; x = r3bCOL.x + 22; } else if (k) x += sp;
    if (txt) R.push({ txt, x, y: y + row * r3bCOLLEAD, size: r3bCOLSZ, red: false, wi: k }); x += ww;
  });
  R.rows = row + 1; R.bottom = y + row * r3bCOLLEAD + 10;
  return (r3bLAY[key] = R);
}
const r3bStanzaFirst = (li) => { const gi = r3bLY[li].i; return r3bSTANZA.filter(f => f <= gi).pop() - r3bI0; };
const r3bCOLSTART = [];
function r3bColStart(p) {
  if (r3bCOLSTART[p] != null) return r3bCOLSTART[p];
  const lines = r3bPAGE.map((pp, i) => pp === p ? i : -1).filter(i => i >= 0);
  const last = lines[lines.length - 1] - 2;
  let cs = r3bStanzaFirst(lines[0]); while (cs < last && r3bLayCol(cs, last).bottom > r3bCOL.y1) cs++;
  return (r3bCOLSTART[p] = cs);
}

// ---------------- printing helpers ----------------
const r3bWordOn = (t, s) => t >= s - r3bF;                                                        // a word prints one frame before its onset
const r3bStrike = (t, s) => { const k = (t - (s - r3bF)) * 24; return k < 0 ? -1 : k < 3 ? 1 - k / 3 : 0; }; // impression, 3 frames
const r3bCurLine = (t) => { let i = -1; for (let k = 0; k < r3bLY.length; k++) if (t >= r3bLY[k].s - r3bF) i = k; return i; };

// the page furniture: border, rules and the stanza-1 ornaments (copied from end-main.js)
const r3bORN = [
  { ch: '❦', font: 'Big Caslon', x: 960, y: 100, size: 58 },
  { ch: 'r', x: 1080, y: 100, size: 56 }, { ch: 'r', x: 840, y: 100, size: 56, flip: true },
  { ch: 'C', x: 1260, y: 104, size: 60 }, { ch: 'C', x: 660, y: 104, size: 60, flip: true },
  { ch: '0', x: 1560, y: 92, size: 80 }, { ch: '0', x: 360, y: 92, size: 80 },
  { ch: '1', x: 92, y: 106, size: 62 }, { ch: '1', x: 1828, y: 106, size: 62 },
  { ch: '1', x: 1828, y: 1016, size: 62 }, { ch: '1', x: 92, y: 1016, size: 62 },
  { ch: 'q', x: 96, y: 752, size: 34 }, { ch: 'q', x: 1824, y: 752, size: 34, flip: true },
];
function r3bOrn(L, o) {
  L.save(); L.translate(o.x, o.y); L.scale(o.flip ? -1 : 1, 1);
  PR.ornament(L, o.ch, 0, 0, o.size, { font: o.font }); L.restore();
}
function r3bPageFrame(L, p) {
  L.strokeStyle = PR.INK; L.lineWidth = 7; L.strokeRect(26, 26, 1868, 1028);
  L.lineWidth = 2.2; L.strokeRect(40, 40, 1840, 1000);
  L.lineWidth = 5; L.beginPath(); L.moveTo(56, 118); L.lineTo(1864, 118); L.stroke();
  L.lineWidth = 1.6; L.beginPath(); L.moveTo(56, 128); L.lineTo(1864, 128); L.stroke();
  L.lineWidth = 1.6; L.beginPath(); L.moveTo(56, 742); L.lineTo(1864, 742); L.stroke();
  L.beginPath(); L.moveTo(580, 146); L.lineTo(580, 730); L.stroke();
  for (const o of r3bORN) r3bOrn(L, o);
  if (r3bFLOWERS.includes(p)) { // the column's flowers on a stanza's first page (the same sorts as story.js)
    const c = [['❧', 'Big Caslon', 318, 262, 120], ['0', 0, 318, 312, 150], ['I', 0, 250, 430, 96], ['J', 0, 386, 430, 96], ['0', 0, 318, 488, 150], ['❦', 'Big Caslon', 318, 640, 60]];
    for (const [ch, font, x, y, size] of c) PR.ornament(L, ch, x, y, size, font ? { font } : {});
  }
}

function r3bDrawRuns(L, R, li, A, Bl, u, t, live, toCol = false) {
  const words = r3bLY[li].words;
  A.forEach((ra, k) => {
    const w = words[ra.wi]; if (!r3bWordOn(t, w.s)) return;
    const rb = Bl ? Bl[k] : ra;
    const ux = toCol ? ease(u, 0, .45) : ease(u, .45, 1), uy = toCol ? ease(u, .3, .8) : ease(u, .45, 1);
    const x = lerp(ra.x, rb.x, ux), y = lerp(ra.y, rb.y, uy), size = lerp(ra.size, rb.size, ux);
    const kk = live ? Math.max(0, r3bStrike(t, w.s)) : 0;
    const C = ra.red ? R : L;
    if (PROBE.on) { // audit: on its onset, inside the page's inner border, and the sung line on screen
      probeWord(t, r3bLY[li].i, ra.wi, (tt) => r3bWordOn(tt, w.s));
      C.font = `${size}px "Big Caslon"`; C.textAlign = 'left'; C.textBaseline = 'alphabetic';
      const c0 = r3bCam(t - 1 / 96), c1 = r3bCam(t + 1 / 96), settled = Math.abs((c1.x - c0.x) * c1.s) < 3 && Math.abs(c1.s - c0.s) < 1e-3;
      PROBE.text(C, 'woodcut caption', ra.txt, x, y, [40, 40, 1840, 1000], { keep: li === r3bCurLine(t) && settled, margin: 4 });
    }
    C.save(); C.translate(x, y); C.scale(1 + kk * .06, 1 + kk * .06);
    PR.typeText(C, ra.txt, 0, 0, size, ra.red ? { color: PR.RED } : {});
    if (kk > .3 && !ra.red) PR.typeText(C, ra.txt, 0, 0, size);
    C.restore();
  });
}
const r3bMOVE = .3;
function r3bPageType(L, R, p, t) {
  const lines = r3bPAGE.map((pp, i) => pp === p ? i : -1).filter(i => i >= 0);
  const first = r3bStanzaFirst(lines[0]);
  const cl = r3bCurLine(t);
  const big = lines.includes(cl) ? cl : (cl > lines[lines.length - 1] ? lines[lines.length - 1] : lines[0]);
  const nx = big + 1, moving = lines.includes(nx) && t >= r3bLY[nx].s - r3bF - r3bMOVE;
  const u = moving ? lin(t, r3bLY[nx].s - r3bF - r3bMOVE, r3bLY[nx].s - r3bF - .02) : 0;
  const cs = r3bColStart(p);
  for (let li = cs; li < big - 1; li++) r3bDrawRuns(L, R, li, r3bLayCol(cs, li), null, 0, t, false);
  if (big - 1 >= first) r3bDrawRuns(L, R, big - 1, r3bLayUpper(big - 1), moving ? r3bLayCol(cs, big - 1) : null, u, t, false, true);
  r3bDrawRuns(L, R, big, r3bLayBig(big), moving ? r3bLayUpper(big) : null, u, t, !moving);
}

// ---------------- faces, for the audit: every head a block draws is reported as a screen box ----------------
// r3bHead(g, x, y, rx, ry) is called by the blocks in block-local units; drawScene maps them to the screen and,
// in an audit only, reports them with PROBE.box so the spec can keep captions off faces.
let r3bHEADS = [], r3bOFF = [0, 0];
function r3bHead(g, x, y, rx, ry) {
  if (!PROBE.on) return;
  const m = g.getTransform();
  const pts = [[x - rx, y - ry], [x + rx, y - ry], [x - rx, y + ry], [x + rx, y + ry]].map(([px, py]) => [m.a * px + m.c * py + m.e + r3bOFF[0], m.b * px + m.d * py + m.f + r3bOFF[1]]);
  r3bHEADS.push([Math.min(...pts.map(q => q[0])), Math.min(...pts.map(q => q[1])), Math.max(...pts.map(q => q[0])), Math.max(...pts.map(q => q[1]))]);
}

// ---------------- the scene ----------------
function r3bDrawScene(t, dst) {
  const cam = r3bCam(t), s = cam.s;
  const sx = (x) => (x - cam.x) * s + W / 2, sy = (y) => (y - cam.y) * s + H / 2;
  dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha = 1; dst.globalCompositeOperation = 'source-over'; dst.filter = 'none';
  dst.fillStyle = PR.woodPattern(dst, cam); dst.fillRect(0, 0, W, H);
  dst.save(); dst.shadowColor = 'rgba(0,0,0,.55)'; dst.shadowBlur = 30 * s; dst.shadowOffsetY = 8 * s;
  dst.fillStyle = PR.paperPattern(dst, cam);
  dst.beginPath();
  const nE = 200;
  for (let k = 0; k <= nE; k++) { const x = lerp(r3bSHEET.x0, r3bSHEET.x1, k / nE); const y = r3bSHEET.y0 + rnd(k, 1) * 6; k ? dst.lineTo(sx(x), sy(y)) : dst.moveTo(sx(x), sy(y)); }
  for (let k = nE; k >= 0; k--) { const x = lerp(r3bSHEET.x0, r3bSHEET.x1, k / nE); dst.lineTo(sx(x), sy(r3bSHEET.y1 - rnd(k, 2) * 6)); }
  dst.closePath(); dst.fill(); dst.restore();

  const vis0 = cam.x - W / 2 / s, vis1 = cam.x + W / 2 / s;
  r3bTYPE.beginType();
  r3bHEADS = [];
  for (let p = 0; p < r3bNPAGES; p++) {
    const px = p * r3bPW; if (px + 1920 < vis0 || px > vis1) continue;
    const ox = sx(px), oy = sy(0);
    const bx = ox + r3bBLK.x * s, by = oy + r3bBLK.y * s;
    r3bOFF = [Math.floor(Math.max(0, bx - 6)), Math.floor(Math.max(0, by - 6))];
    WC.block(dst, bx, by, s, BW, BH, (gg, P) => r3bBLOCKS[p](gg, P, t), { seed: 131 + p * 7 });
    for (const L of [r3bTYPE.TLg, r3bTYPE.RLg]) L.setTransform(s, 0, 0, s, ox, oy);
    r3bPageFrame(r3bTYPE.TLg, p);
    r3bPageType(r3bTYPE.TLg, r3bTYPE.RLg, p, t);
  }
  if (PROBE.on) { // heads, clipped to the block window they print in
    dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0);
    for (const [x0, y0, x1, y1] of r3bHEADS) PROBE.box(dst, 'r3b face', x0, y0, x1 - x0, y1 - y0);
    dst.restore();
  }
  r3bTYPE.endType(dst, cam);
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0);
  const vg = dst.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.15); vg.addColorStop(0, 'rgba(60,40,20,0)'); vg.addColorStop(1, 'rgba(60,40,20,.28)');
  dst.globalCompositeOperation = 'multiply'; dst.fillStyle = vg; dst.fillRect(0, 0, W, H); dst.restore();
  drawGrain(dst, t, .07);
}

function r3bRenderFrame(t) {
  r3bDrawScene(t, r3bG);
  // whip pans: the sheet moves rigidly, so smear the one exposure along the pan (a 180-degree shutter)
  const c0 = r3bCam(t - 1 / 96), c1 = r3bCam(t + 1 / 96);
  const d = (c0.x - c1.x) * c1.s;
  const n = Math.min(40, Math.ceil(Math.abs(d) / 3));
  if (n < 3) return;
  r3bAG.setTransform(1, 0, 0, 1, 0, 0); r3bAG.globalAlpha = 1; r3bAG.globalCompositeOperation = 'copy'; r3bAG.drawImage(r3bOut, 0, 0);
  r3bG.setTransform(1, 0, 0, 1, 0, 0); r3bG.globalCompositeOperation = 'source-over';
  for (let k = 0; k < n; k++) { r3bG.globalAlpha = 1 / (k + 1); r3bG.drawImage(r3bACC, d * (k / (n - 1) - .5), 0); }
  r3bG.globalAlpha = 1;
}

const r3bReady = document.fonts.load('92px "Big Caslon"').then(() => document.fonts.load('60px "Hoefler Text Ornaments"')).then(() => { r3bLAY = {}; r3bCOLSTART.length = 0; r3bRenderFrame(166); r3bRenderFrame(230); return true; });
startPage(r3bOut, r3bRenderFrame, r3bT0, r3bT1, r3bReady);
