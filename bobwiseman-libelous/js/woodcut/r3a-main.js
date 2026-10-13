// Woodcut chapbook, round 3 (agent wood-A): stanzas 6 and 7 on the same long sheet, 95.9167-165.0833.
// renderFrame is a pure function of song time. The kit (woodcut.js, print.js, figures.js, blocks.js,
// story-figures.js, story.js) is loaded read-only; the camera, slots and page furniture here are copies of
// main.js and story.js under r3a names, so the pages read exactly like stanzas 1-5.
// The span opens on page 28 (stanza 5's last block, drawn by story.js's own blockFacts), then whips to page 29.
const r3aOut = document.getElementById('c'); r3aOut.width = W; r3aOut.height = H;
const r3aG = r3aOut.getContext('2d', { willReadFrequently: true }); // CPU canvas throughout (see main.js)
const R3A_ACC = mkCanvas(W, H), R3A_AG = R3A_ACC.getContext('2d');

const R3A_PW = 2080;
const R3A_SHEET = { x0: -230, x1: (R3A_NPAGES - 1) * R3A_PW + 1920 + 230, y0: -64, y1: 1144 };
const R3A_BLK = { x: 604, y: 140 };
const R3A_COL = { x: 84, y: 166, w: 470, y1: 728 };
const R3A_FONT = 92;

// ---------------- camera: the same whip pans (or straight cuts) as stanzas 1-5 ----------------
const R3A_PANS = [];
for (let i = 41; i <= R3A_LINE1; i++) if (R3A_PAGE[i] !== R3A_PAGE[i - 1]) {
  const lw = r3aLast(i - 1), b = r3aL(i).s;
  R3A_PANS.push({ b, from: R3A_PAGE[i - 1], to: R3A_PAGE[i], cut: b - lw < .45, a: b - .3 });
}
const r3aSmoother = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
function r3aCam(t) {
  let page = R3A_FIRST_PAGE;
  for (const p of R3A_PANS) {
    if (p.cut) { if (t >= p.b - R3A_F) page = p.to; }
    else if (t >= p.a) page = p.from + (p.to - p.from) * r3aSmoother((t - p.a) / (p.b - R3A_F - p.a));
  }
  return { x: page * R3A_PW + 960, y: 540, s: 1 };
}

// ---------------- caption layout: main.js's BIG / UPPER / COLUMN slots ----------------
const R3A_MC = mkCanvas(8, 8).getContext('2d');
function r3aMw(txt, size) { R3A_MC.font = `${size}px "Big Caslon"`; return R3A_MC.measureText(txt).width; }
let R3A_LAY = {};
const R3A_SLOT = { bigBase: 958, big2Base: 904, big2Lead: 100, upBase: 808, upSize: 64 };
function r3aRunsRow(words, size, x, y, iniScale) {
  const sp = r3aMw(' ', size), R = [];
  const ini = words[0][0], isz = size * iniScale;
  R.push({ txt: ini, x, y, size: isz, red: true, wi: 0 }); x += r3aMw(ini, isz) + size * .02;
  words.forEach((w, k) => { const txt = k ? w : w.slice(1); if (k) x += sp; if (txt) R.push({ txt, x, y, size, red: false, wi: k }); x += r3aMw(txt, size); });
  return R;
}
function r3aRowW(words, size, iniScale) { const sp = r3aMw(' ', size); return r3aMw(words[0][0], size * iniScale) + size * .02 + words.reduce((a, w, k) => a + (k ? sp : 0) + r3aMw(k ? w : w.slice(1), size), 0); }
function r3aLayBig(li) {
  const key = 'B' + li; if (R3A_LAY[key]) return R3A_LAY[key];
  const words = r3aL(li).words.map(w => w.w), maxW = 1700;
  let size = R3A_FONT, R;
  if (r3aRowW(words, size, 1.62) <= maxW) { const w = r3aRowW(words, size, 1.62); R = r3aRunsRow(words, size, 960 - w / 2, R3A_SLOT.bigBase, 1.62); }
  else {
    size = 86; // two rows with a dropped initial spanning both
    let best = null;
    for (let k = 2; k < words.length; k++) { const a = words.slice(0, k), b = words.slice(k); const wa = r3aRowW(a, size, 1) - r3aMw(a[0][0], size), wb = r3aRowW(b, size, 1); const m = Math.max(wa, wb); if (!best || m < best.m) best = { k, m }; }
    const capSize = (R3A_SLOT.big2Lead + size * .72) / .72, capW = r3aMw(words[0][0], capSize);
    const total = capW + 16 + best.m, x0 = 960 - total / 2, tx = x0 + capW + 16;
    R = [{ txt: words[0][0], x: x0, y: R3A_SLOT.big2Base + R3A_SLOT.big2Lead, size: capSize, red: true, wi: 0 }];
    const sp = r3aMw(' ', size);
    [words.slice(0, best.k), words.slice(best.k)].forEach((row, r) => {
      let x = tx;
      row.forEach((w, k) => { const gi = r ? best.k + k : k; const txt = gi ? w : w.slice(1); if (k) x += sp; R.push({ txt, x, y: R3A_SLOT.big2Base + r * R3A_SLOT.big2Lead, size, red: false, wi: gi }); x += r3aMw(txt, size); });
    });
  }
  return (R3A_LAY[key] = R);
}
function r3aLayUpper(li) {
  const key = 'U' + li; if (R3A_LAY[key]) return R3A_LAY[key];
  const words = r3aL(li).words.map(w => w.w);
  let size = R3A_SLOT.upSize; while (r3aRowW(words, size, 1.25) > 1700) size -= 2;
  const w = r3aRowW(words, size, 1.25);
  return (R3A_LAY[key] = r3aRunsRow(words, size, 960 - w / 2, R3A_SLOT.upBase, 1.25));
}
// the side column: the stanza's chain so far, from line cs (the stanza's first line, or later when the column is full)
const R3A_COLSZ = 29, R3A_COLLEAD = 36;
function r3aLayCol(cs, li) {
  const key = 'C' + cs + '_' + li; if (R3A_LAY[key]) return R3A_LAY[key];
  let y = R3A_COL.y + 34;
  for (let k = cs; k < li; k++) y += r3aLayCol(cs, k).rows * R3A_COLLEAD + 8;
  const words = r3aL(li).words.map(w => w.w), sp = r3aMw(' ', R3A_COLSZ);
  const R = [{ txt: words[0][0], x: R3A_COL.x, y, size: R3A_COLSZ * 1.45, red: true, wi: 0 }];
  let x = R3A_COL.x + r3aMw(words[0][0], R3A_COLSZ * 1.45) + 1, row = 0;
  words.forEach((w, k) => {
    const txt = k ? w : w.slice(1), ww = r3aMw(txt, R3A_COLSZ);
    if (k && x + sp + ww > R3A_COL.x + R3A_COL.w) { row++; x = R3A_COL.x + 22; } else if (k) x += sp;
    if (txt) R.push({ txt, x, y: y + row * R3A_COLLEAD, size: R3A_COLSZ, red: false, wi: k }); x += ww;
  });
  R.rows = row + 1; R.bottom = y + row * R3A_COLLEAD + 10;
  return (R3A_LAY[key] = R);
}
const r3aLinesOn = (p) => { const L = []; for (let i = 31; i <= R3A_LINE1; i++) if (R3A_PAGE[i] === p) L.push(i); return L; };
const r3aStanzaFirst = (li) => R3A_STANZA_FIRST.filter(f => f <= li).pop();
// Stanza 7 has 15 lines, more than one column holds: a page's column starts as far back as still fits by the page's
// last line, the earliest lines dropping off the top (as in the last chapter). Where the whole stanza fits, cs is the
// stanza's first line and the column is set exactly as story.js sets it.
const R3A_COLSTART = {};
function r3aColStart(p) {
  if (R3A_COLSTART[p] != null) return R3A_COLSTART[p];
  const lines = r3aLinesOn(p), first = r3aStanzaFirst(lines[0]), last = lines[lines.length - 1] - 2;
  let cs = first; while (cs < last && r3aLayCol(cs, last).bottom > R3A_COL.y1) cs++;
  return (R3A_COLSTART[p] = cs);
}

// ---------------- printing helpers ----------------
const r3aWordOn = (t, s) => t >= s - R3A_F;                                       // a word prints one frame before its onset
const r3aStrike = (t, s) => { const k = (t - (s - R3A_F)) * 24; return k < 0 ? -1 : k < 3 ? 1 - k / 3 : 0; }; // impression, 3 frames
const r3aCurLine = (t) => { let i = -1; for (let k = 31; k <= R3A_LINE1; k++) if (t >= r3aL(k).s - R3A_F) i = k; return i; };

// the page furniture: border, rules and the header / corner / caption-rule ornaments (as every page after the first)
const R3A_ORN = [
  { ch: '❦', font: 'Big Caslon', x: 960, y: 100, size: 58 },
  { ch: 'r', x: 1080, y: 100, size: 56 }, { ch: 'r', x: 840, y: 100, size: 56, flip: true },
  { ch: 'C', x: 1260, y: 104, size: 60 }, { ch: 'C', x: 660, y: 104, size: 60, flip: true },
  { ch: '0', x: 1560, y: 92, size: 80 }, { ch: '0', x: 360, y: 92, size: 80 },
  { ch: '1', x: 92, y: 106, size: 62 }, { ch: '1', x: 1828, y: 106, size: 62 },
  { ch: '1', x: 1828, y: 1016, size: 62 }, { ch: '1', x: 92, y: 1016, size: 62 },
  { ch: 'q', x: 96, y: 752, size: 34 }, { ch: 'q', x: 1824, y: 752, size: 34, flip: true },
];
function r3aPageFrame(L) {
  L.strokeStyle = PR.INK; L.lineWidth = 7; L.strokeRect(26, 26, 1868, 1028);
  L.lineWidth = 2.2; L.strokeRect(40, 40, 1840, 1000);
  L.lineWidth = 5; L.beginPath(); L.moveTo(56, 118); L.lineTo(1864, 118); L.stroke();
  L.lineWidth = 1.6; L.beginPath(); L.moveTo(56, 128); L.lineTo(1864, 128); L.stroke();
  L.lineWidth = 1.6; L.beginPath(); L.moveTo(56, 742); L.lineTo(1864, 742); L.stroke();
  L.beginPath(); L.moveTo(580, 146); L.lineTo(580, 730); L.stroke();
  for (const o of R3A_ORN) {
    L.save(); L.translate(o.x, o.y); L.scale(o.flip ? -1 : 1, 1);
    PR.ornament(L, o.ch, 0, 0, o.size, { font: o.font }); L.restore();
  }
}
// the column's flowers on a stanza's first page (the same sorts as story.js's)
function r3aColFlowers(L) {
  const c = [['❧', 'Big Caslon', 318, 262, 120], ['0', 0, 318, 312, 150], ['I', 0, 250, 430, 96], ['J', 0, 386, 430, 96], ['0', 0, 318, 488, 150], ['❦', 'Big Caslon', 318, 640, 60]];
  for (const [ch, font, x, y, size] of c) PR.ornament(L, ch, x, y, size, font ? { font } : {});
}

function r3aDrawRuns(L, R, li, A, Bl, u, t, live, toCol = false) {
  const words = r3aL(li).words;
  A.forEach((ra, k) => {
    const w = words[ra.wi]; if (!r3aWordOn(t, w.s)) return;
    const rb = Bl ? Bl[k] : ra;
    // into the column: slide left and shrink first, then rise, so the words never cross the block
    const ux = toCol ? ease(u, 0, .45) : ease(u, .45, 1), uy = toCol ? ease(u, .3, .8) : ease(u, .45, 1);
    const x = lerp(ra.x, rb.x, ux), y = lerp(ra.y, rb.y, uy), size = lerp(ra.size, rb.size, ux);
    const kk = live ? Math.max(0, r3aStrike(t, w.s)) : 0;
    const C = ra.red ? R : L;
    if (PROBE.on) { // audit: on its onset, inside the page's inner border, and the sung line on screen
      if (li >= R3A_LINE0) probeWord(t, li, ra.wi, (tt) => r3aWordOn(tt, w.s));
      C.font = `${size}px "Big Caslon"`; C.textAlign = 'left'; C.textBaseline = 'alphabetic';
      const c0 = r3aCam(t - 1 / 96), c1 = r3aCam(t + 1 / 96), settled = Math.abs((c1.x - c0.x) * c1.s) < 3 && Math.abs(c1.s - c0.s) < 1e-3;
      PROBE.text(C, 'woodcut caption', ra.txt, x, y, [40, 40, 1840, 1000], { keep: li === r3aCurLine(t) && settled, margin: 4 });
    }
    C.save(); C.translate(x, y); C.scale(1 + kk * .06, 1 + kk * .06);
    PR.typeText(C, ra.txt, 0, 0, size, ra.red ? { color: PR.RED } : {});
    if (kk > .3 && !ra.red) PR.typeText(C, ra.txt, 0, 0, size);
    C.restore();
  });
}
const R3A_MOVE = .3;
function r3aPageType(L, R, p, t) {
  const lines = r3aLinesOn(p);
  const first = r3aStanzaFirst(lines[0]);
  const cl = r3aCurLine(t);
  const big = lines.includes(cl) ? cl : (cl > lines[lines.length - 1] ? lines[lines.length - 1] : lines[0]);
  const nx = big + 1, moving = lines.includes(nx) && t >= r3aL(nx).s - R3A_F - R3A_MOVE;
  const u = moving ? lin(t, r3aL(nx).s - R3A_F - R3A_MOVE, r3aL(nx).s - R3A_F - .02) : 0;
  const cs = r3aColStart(p);
  for (let li = cs; li < big - 1; li++) r3aDrawRuns(L, R, li, r3aLayCol(cs, li), null, 0, t, false);
  if (big - 1 >= first) r3aDrawRuns(L, R, big - 1, r3aLayUpper(big - 1), moving ? r3aLayCol(cs, big - 1) : null, u, t, false, true);
  r3aDrawRuns(L, R, big, r3aLayBig(big), moving ? r3aLayUpper(big) : null, u, t, !moving);
  if (R3A_FLOWER_PAGES.includes(p)) r3aColFlowers(L);
}

// ---------------- the scene ----------------
function r3aDrawScene(t, dst) {
  const cam = r3aCam(t), s = cam.s;
  const sx = (x) => (x - cam.x) * s + W / 2, sy = (y) => (y - cam.y) * s + H / 2;
  dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha = 1; dst.globalCompositeOperation = 'source-over'; dst.filter = 'none';
  dst.fillStyle = PR.woodPattern(dst, cam); dst.fillRect(0, 0, W, H);
  dst.save(); dst.shadowColor = 'rgba(0,0,0,.55)'; dst.shadowBlur = 30 * s; dst.shadowOffsetY = 8 * s;
  dst.fillStyle = PR.paperPattern(dst, cam);
  dst.beginPath();
  const nE = 900;
  for (let k = 0; k <= nE; k++) { const x = lerp(R3A_SHEET.x0, R3A_SHEET.x1, k / nE); const y = R3A_SHEET.y0 + rnd(k, 1) * 6; k ? dst.lineTo(sx(x), sy(y)) : dst.moveTo(sx(x), sy(y)); }
  for (let k = nE; k >= 0; k--) { const x = lerp(R3A_SHEET.x0, R3A_SHEET.x1, k / nE); dst.lineTo(sx(x), sy(R3A_SHEET.y1 - rnd(k, 2) * 6)); }
  dst.closePath(); dst.fill(); dst.restore();

  const vis0 = cam.x - W / 2 / s, vis1 = cam.x + W / 2 / s;
  const TY = STYPE; // story.js's CPU-backed type layers (cleared each frame), as stanzas 2-5 use
  TY.beginType();
  for (let p = R3A_FIRST_PAGE; p < R3A_NPAGES; p++) {
    const px = p * R3A_PW; if (px + 1920 < vis0 || px > vis1) continue;
    const ox = sx(px), oy = sy(0);
    const bx = ox + R3A_BLK.x * s, by = oy + R3A_BLK.y * s;
    WC.block(dst, bx, by, s, BW, BH, (gg, P) => R3A_BLOCKS[p](gg, P, t), { seed: 11 + p * 7, inkAmt: 1 });
    for (const L of [TY.TLg, TY.RLg]) L.setTransform(s, 0, 0, s, ox, oy);
    if (PROBE.on) PROBE.box(TY.TLg, 'woodblock', R3A_BLK.x, R3A_BLK.y, BW, BH); // every face is drawn inside its block
    r3aPageFrame(TY.TLg);
    r3aPageType(TY.TLg, TY.RLg, p, t);
  }
  TY.endType(dst, cam);
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0);
  const vg = dst.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.15); vg.addColorStop(0, 'rgba(60,40,20,0)'); vg.addColorStop(1, 'rgba(60,40,20,.28)');
  dst.globalCompositeOperation = 'multiply'; dst.fillStyle = vg; dst.fillRect(0, 0, W, H); dst.restore();
  drawGrain(dst, t, .07);
}

function r3aRenderFrame(t) {
  r3aDrawScene(t, r3aG);
  // whip pans: the sheet moves rigidly, so smear the one exposure along the pan (a 180-degree shutter)
  const c0 = r3aCam(t - 1 / 96), c1 = r3aCam(t + 1 / 96);
  if (Math.abs(c1.s - c0.s) > 1e-4) return;
  const d = (c0.x - c1.x) * c1.s;
  const n = Math.min(40, Math.ceil(Math.abs(d) / 3));
  if (n < 3 || Math.abs(d) > 1000) return; // a straight cut between the two sample times is not a pan
  R3A_AG.setTransform(1, 0, 0, 1, 0, 0); R3A_AG.globalAlpha = 1; R3A_AG.globalCompositeOperation = 'copy'; R3A_AG.drawImage(r3aOut, 0, 0);
  r3aG.setTransform(1, 0, 0, 1, 0, 0); r3aG.globalCompositeOperation = 'source-over';
  for (let k = 0; k < n; k++) { r3aG.globalAlpha = 1 / (k + 1); r3aG.drawImage(R3A_ACC, d * (k / (n - 1) - .5), 0); }
  r3aG.globalAlpha = 1;
}

// warm-up: the very first draw (fresh tiles) comes out a few levels off (see main.js)
const r3aReady = document.fonts.load('92px "Big Caslon"').then(() => document.fonts.load('60px "Hoefler Text Ornaments"')).then(() => { R3A_LAY = {}; for (const k in R3A_COLSTART) delete R3A_COLSTART[k]; r3aRenderFrame(97.5); r3aRenderFrame(130); return true; });
startPage(r3aOut, r3aRenderFrame, R3A_T0, R3A_T1, r3aReady);
