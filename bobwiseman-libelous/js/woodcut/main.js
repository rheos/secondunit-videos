// Look 1: woodcut chapbook, intro + the king's chain (0-34.42). renderFrame(t) is a pure function of song time.
// One long uncut sheet of chapbook pages, laid side by side. Each page: a woodblock, the chain so far set in a
// side column (The House That Jack Built), and the current line set big beneath the block with a red initial.
const out = document.getElementById('c'); out.width = W; out.height = H;
const g = out.getContext('2d', { willReadFrequently: true }); // CPU canvas throughout: Chrome moves a read-back canvas from GPU to CPU mid-run, which shifted pixels by a few levels
const ACC = mkCanvas(W, H), AG = ACC.getContext('2d');

const PW = 2080;                       // page pitch on the sheet (1920 page + 160 gutter)
const NPAGES = 9;
const SHEET = { x0: -230, x1: (NPAGES - 1) * PW + 1920 + 230, y0: -64, y1: 1144 };
const BLK = { x: 604, y: 140 };        // block position on a page (block is BW x BH)
const CAP = { x0: 80, x1: 1840, cx: 960 };
const COL = { x: 84, y: 166, w: 470 };
const FONT = 92, FONT_LAST = 120;      // caption sizes (Big Caslon cap height = .72 em)

// ---------------- camera ----------------
// Moving to the next block: a whip pan that lands as the new line starts. Where the old line's key word is sung
// too close to the change (mouth, smiled) there is no time to pan, so it is a straight cut forward on the line.
const PANS = [];
for (let i = 1; i < LYR.length; i++) if (PAGE_OF[i] !== PAGE_OF[i - 1]) {
  const lastWord = LYR[i - 1].words[LYR[i - 1].words.length - 1].s, b = LYR[i].s;
  PANS.push({ b, from: PAGE_OF[i - 1], to: PAGE_OF[i], cut: b - lastWord < .45, a: b - .3 });
}
const smoother = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const PULL = { a: 33.45, b: T1 - .08, s: .56, dx: -640 };
function camAt(t) {
  let s = 1, cx = 960, cy = 540;
  if (t < B.l0) {
    s = t < B.thump ? .84 : lerp(.84, .88, ease(t, B.thump, 10.9));
    s = lerp(s, 1, ease(t, 10.96, 12.6));
    if (t > B.thump) cy += 9 * Math.exp(-(t - B.thump) * 11) * Math.sin((t - B.thump) * 70);
    return { x: cx, y: cy, s };
  }
  let page = 0;
  for (const p of PANS) {
    if (p.cut) { if (t >= p.b - F1) page = p.to; }
    else if (t >= p.a) page = p.from + (p.to - p.from) * smoother((t - p.a) / (p.b - F1 - p.a));
  }
  cx = page * PW + 960;
  const u = smoother((t - PULL.a) / (PULL.b - PULL.a));
  s = lerp(1, PULL.s, u); cx += PULL.dx * u; cy += 30 * u;
  return { x: cx, y: cy, s };
}

// ---------------- caption layout ----------------
// Three slots per page, like a page of The House That Jack Built:
//   BIG   the line being sung, under the block, red initial (dropped over two rows when the line is long)
//   UPPER the line before it, smaller, just above (so it stays readable after the next line starts)
//   COLUMN every line before that, small, in the side column
// A layout is a list of runs {txt, x, y, size, red, wi}; moves between slots interpolate run by run.
const MC = mkCanvas(8, 8).getContext('2d');
function mw(txt, size) { MC.font = `${size}px "Big Caslon"`; return MC.measureText(txt).width; }
let LAY = {};
const SLOT = { bigBase: 958, big2Base: 904, big2Lead: 100, upBase: 808, upSize: 64 };
function runsRow(words, size, x, y, iniScale) {
  const sp = mw(' ', size), R = [];
  const ini = words[0][0], isz = size * iniScale;
  R.push({ txt: ini, x, y, size: isz, red: true, wi: 0 }); x += mw(ini, isz) + size * .02;
  words.forEach((w, k) => { const txt = k ? w : w.slice(1); if (k) x += sp; if (txt) R.push({ txt, x, y, size, red: false, wi: k }); x += mw(txt, size); });
  return R;
}
function rowW(words, size, iniScale) { const sp = mw(' ', size); return mw(words[0][0], size * iniScale) + size * .02 + words.reduce((a, w, k) => a + (k ? sp : 0) + mw(k ? w : w.slice(1), size), 0); }
function layBig(li) {
  const key = 'B' + li; if (LAY[key]) return LAY[key];
  const words = LYR[li].words.map(w => w.w), maxW = 1700;
  let size = li === LYR.length - 1 ? FONT_LAST : FONT;
  let R;
  if (rowW(words, size, 1.62) <= maxW) { const w = rowW(words, size, 1.62); R = runsRow(words, size, 960 - w / 2, SLOT.bigBase, 1.62); }
  else {
    size = 86; // two rows with a dropped initial spanning both
    let best = null;
    for (let k = 2; k < words.length; k++) { const a = words.slice(0, k), b = words.slice(k); const wa = rowW(a, size, 1) - mw(a[0][0], size), wb = rowW(b, size, 1) - mw(b[0][0], size) + mw(b[0][0], size); const m = Math.max(wa, wb); if (!best || m < best.m) best = { k, m }; }
    const capSize = (SLOT.big2Lead + size * .72) / .72, capW = mw(words[0][0], capSize);
    const total = capW + 16 + best.m, x0 = 960 - total / 2, tx = x0 + capW + 16;
    R = [{ txt: words[0][0], x: x0, y: SLOT.big2Base + SLOT.big2Lead, size: capSize, red: true, wi: 0 }];
    const sp = mw(' ', size);
    [words.slice(0, best.k), words.slice(best.k)].forEach((row, r) => {
      let x = tx;
      row.forEach((w, k) => { const gi = r ? best.k + k : k; const txt = gi ? w : w.slice(1); if (k) x += sp; R.push({ txt, x, y: SLOT.big2Base + r * SLOT.big2Lead, size, red: false, wi: gi }); x += mw(txt, size); });
    });
  }
  return (LAY[key] = R);
}
function layUpper(li) {
  const key = 'U' + li; if (LAY[key]) return LAY[key];
  const words = LYR[li].words.map(w => w.w);
  let size = SLOT.upSize; while (rowW(words, size, 1.25) > 1700) size -= 2;
  const w = rowW(words, size, 1.25);
  return (LAY[key] = runsRow(words, size, 960 - w / 2, SLOT.upBase, 1.25));
}
const COLSZ = 29, COLLEAD = 36;
function layCol(li) {
  const key = 'C' + li; if (LAY[key]) return LAY[key];
  let y = COL.y + 34;
  for (let k = 0; k < li; k++) y += layCol(k).rows * COLLEAD + 8;
  const words = LYR[li].words.map(w => w.w), sp = mw(' ', COLSZ);
  const R = [{ txt: words[0][0], x: COL.x, y, size: COLSZ * 1.45, red: true, wi: 0 }];
  let x = COL.x + mw(words[0][0], COLSZ * 1.45) + 1, row = 0;
  words.forEach((w, k) => {
    const txt = k ? w : w.slice(1), ww = mw(txt, COLSZ);
    if (k && x + sp + ww > COL.x + COL.w) { row++; x = COL.x + 22; } else if (k) x += sp;
    if (txt) R.push({ txt, x, y: y + row * COLLEAD, size: COLSZ, red: false, wi: k }); x += ww;
  });
  R.rows = row + 1;
  return (LAY[key] = R);
}

// ---------------- printing helpers ----------------
const F1 = 1 / 24;
const wordOn = (t, s) => t >= s - F1;                       // a word prints one frame before its onset
const strike = (t, s) => { const k = (t - (s - F1)) * 24; return k < 0 ? -1 : k < 3 ? 1 - k / 3 : 0; }; // impression, 3 frames

function pageFrame(L, p, t) { // rules, border and ornaments of page p (L = type layer, in page units)
  if (t < B.thump) return;
  L.strokeStyle = PR.INK; L.lineWidth = 7; L.strokeRect(26, 26, 1868, 1028);
  L.lineWidth = 2.2; L.strokeRect(40, 40, 1840, 1000);
  L.lineWidth = 5; L.beginPath(); L.moveTo(56, 118); L.lineTo(1864, 118); L.stroke();
  L.lineWidth = 1.6; L.beginPath(); L.moveTo(56, 128); L.lineTo(1864, 128); L.stroke();
  L.lineWidth = 1.6; L.beginPath(); L.moveTo(56, 742); L.lineTo(1864, 742); L.stroke();
  L.beginPath(); L.moveTo(580, 146); L.lineTo(580, 730); L.stroke();
  const items = ORN;
  for (const o of items) {
    if (o.p0 && p !== 0) continue;
    const te = p === 0 ? o.t : B.thump;
    if (t < te) continue;
    const k = p === 0 ? strike(t, te + F1) : 0;
    L.save(); L.translate(o.x, o.y); const sc = 1 + Math.max(0, k) * .1; L.scale(sc * (o.flip ? -1 : 1), sc);
    if (o.draw) o.draw(L); else PR.ornament(L, o.ch, 0, 0, o.size, { font: o.font });
    L.restore();
  }
}
// the ornaments: header flourishes, corner pieces, the column's flowers and the printer's hand
const ORN = (() => {
  const L = [], T = B.orn;
  L.push({ t: T[0], ch: '❦', font: 'Big Caslon', x: 960, y: 100, size: 58 });
  L.push({ t: T[1], ch: 'r', x: 1080, y: 100, size: 56 }); L.push({ t: T[1], ch: 'r', x: 840, y: 100, size: 56, flip: true });
  L.push({ t: T[2], ch: 'C', x: 1260, y: 104, size: 60 }); L.push({ t: T[2], ch: 'C', x: 660, y: 104, size: 60, flip: true });
  L.push({ t: T[3], ch: '0', x: 1560, y: 92, size: 80 }); L.push({ t: T[3], ch: '0', x: 360, y: 92, size: 80 });
  L.push({ t: T[4], ch: '1', x: 92, y: 106, size: 62 }); L.push({ t: T[5], ch: '1', x: 1828, y: 106, size: 62 });
  L.push({ t: T[6], ch: '1', x: 1828, y: 1016, size: 62 }); L.push({ t: T[7], ch: '1', x: 92, y: 1016, size: 62 });
  // column flowers (page 0 only: other pages carry the chain of words there)
  const col = [
    { t: T[8], ch: '❧', font: 'Big Caslon', x: 318, y: 262, size: 120 },
    { t: T[9], ch: '0', x: 318, y: 312, size: 150 },
    { t: T[10], ch: 'I', x: 250, y: 430, size: 96 }, { t: T[10], ch: 'J', x: 386, y: 430, size: 96 },
    { t: T[11], ch: '0', x: 318, y: 488, size: 150 },
    { t: T[13], ch: '☞', font: 'Big Caslon', x: 318, y: 640, size: 190 },
    { t: T[12], ch: '❦', font: 'Big Caslon', x: 318, y: 712, size: 52 },
  ];
  for (const c of col) { c.p0 = true; L.push(c); }
  // registration marks round the empty block, then the caption rule's flowers
  const mk = (x, y, dx, dy) => (Lg) => { Lg.strokeStyle = PR.INK; Lg.lineWidth = 3; Lg.beginPath(); Lg.moveTo(dx * 34, 0); Lg.lineTo(0, 0); Lg.lineTo(0, dy * 34); Lg.stroke(); };
  L.push({ t: T[14], x: 604, y: 140, draw: mk(0, 0, 1, 1), p0: true }); L.push({ t: T[14], x: 1844, y: 730, draw: mk(0, 0, -1, -1), p0: true });
  L.push({ t: T[15], x: 1844, y: 140, draw: mk(0, 0, -1, 1), p0: true }); L.push({ t: T[15], x: 604, y: 730, draw: mk(0, 0, 1, -1), p0: true });
  L.push({ t: T[16], ch: 'q', x: 96, y: 752, size: 34 }); L.push({ t: T[16], ch: 'q', x: 1824, y: 752, size: 34, flip: true });
  return L;
})();

function drawRuns(L, R, li, A, Bl, u, t, live, toCol = false) {
  // A -> Bl interpolated by u (Bl null = no move). live: words strike in on their onsets
  const words = LYR[li].words;
  A.forEach((ra, k) => {
    const w = words[ra.wi]; if (!wordOn(t, w.s)) return;
    const rb = Bl ? Bl[k] : ra;
    // into the column: slide left and shrink first, then rise, so the words never cross the block
    // (the other line rises into the upper slot only after this one has cleared it)
    const ux = toCol ? ease(u, 0, .45) : ease(u, .45, 1), uy = toCol ? ease(u, .3, .8) : ease(u, .45, 1);
    const x = lerp(ra.x, rb.x, ux), y = lerp(ra.y, rb.y, uy), size = lerp(ra.size, rb.size, ux);
    const kk = live ? Math.max(0, strike(t, w.s)) : 0;
    const C = ra.red ? R : L;
    C.save(); C.translate(x, y); C.scale(1 + kk * .06, 1 + kk * .06);
    PR.typeText(C, ra.txt, 0, 0, size, ra.red ? { color: PR.RED } : {});
    if (kk > .3 && !ra.red) PR.typeText(C, ra.txt, 0, 0, size);
    C.restore();
  });
}
// the type on page p at time t: which line is in which slot, and any slot-to-slot move in progress
const MOVE = .3;
function pageType(L, R, p, t) {
  const lines = PAGE_OF.map((pp, i) => pp === p ? i : -1).filter(i => i >= 0);
  const cl = curLine(t);
  let big = lines.includes(cl) ? cl : (cl > lines[lines.length - 1] ? lines[lines.length - 1] : lines[0]);
  if (big < 0) return;
  // a move within this page: the next line is on this page too and is about to start
  const nx = big + 1, moving = lines.includes(nx) && t >= LYR[nx].s - F1 - MOVE;
  const u = moving ? lin(t, LYR[nx].s - F1 - MOVE, LYR[nx].s - F1 - .02) : 0;
  const colUpto = moving ? big - 1 : big - 1; // lines below this index sit in the column
  for (let li = 0; li < colUpto; li++) drawRuns(L, R, li, layCol(li), null, 0, t, false);
  if (big >= 1) drawRuns(L, R, big - 1, layUpper(big - 1), moving ? layCol(big - 1) : null, u, t, false, true);
  drawRuns(L, R, big, layBig(big), moving ? layUpper(big) : null, u, t, !moving);
}
const curLine = (t) => { let i = -1; for (let k = 0; k < LYR.length; k++) if (t >= LYR[k].s - F1) i = k; return i; };

// ---------------- the scene ----------------
function drawScene(t, dst) {
  const cam = camAt(t), s = cam.s;
  const sx = (x) => (x - cam.x) * s + W / 2, sy = (y) => (y - cam.y) * s + H / 2;
  dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha = 1; dst.globalCompositeOperation = 'source-over'; dst.filter = 'none';
  // table and sheet
  dst.fillStyle = PR.woodPattern(dst, cam); dst.fillRect(0, 0, W, H);
  dst.save(); dst.shadowColor = 'rgba(0,0,0,.55)'; dst.shadowBlur = 30 * s; dst.shadowOffsetY = 8 * s;
  dst.fillStyle = PR.paperPattern(dst, cam);
  dst.beginPath();
  const nE = 60;
  for (let k = 0; k <= nE; k++) { const x = lerp(SHEET.x0, SHEET.x1, k / nE); const y = SHEET.y0 + rnd(k, 1) * 6; k ? dst.lineTo(sx(x), sy(y)) : dst.moveTo(sx(x), sy(y)); }
  for (let k = nE; k >= 0; k--) { const x = lerp(SHEET.x0, SHEET.x1, k / nE); dst.lineTo(sx(x), sy(SHEET.y1 - rnd(k, 2) * 6)); }
  dst.closePath(); dst.fill(); dst.restore();

  const vis0 = cam.x - W / 2 / s, vis1 = cam.x + W / 2 / s;
  PR.beginType();
  for (let p = 0; p < NPAGES; p++) {
    const px = p * PW; if (px + 1920 < vis0 || px > vis1) continue;
    const ox = sx(px), oy = sy(0);
    // the woodblock
    const bx = ox + BLK.x * s, by = oy + BLK.y * s;
    if (p > 0 ? t >= B.thump : t >= B.l0 - F1) {
      const k = p === 0 ? Math.max(0, strike(t, B.l0)) : 0;
      WC.block(dst, bx, by, s, BW, BH, (gg, P) => BLOCKS[p](gg, P, t), { seed: 11 + p * 7, inkAmt: 1 + k * .08 });
    } else if (p === 0 && t >= B.blockDown) { // the inked block comes down onto the paper
      const u = ease(t, B.blockDown, B.l0 - F1);
      dst.save(); dst.globalCompositeOperation = 'multiply'; dst.fillStyle = `rgba(20,16,12,${.25 + .7 * u})`;
      const e = (1 - u) * 26 * s; dst.fillRect(bx - e, by - e, BW * s + 2 * e, BH * s + 2 * e); dst.restore();
    }
    // type: frame, column, caption
    for (const L of [PR.TLg, PR.RLg]) L.setTransform(s, 0, 0, s, ox, oy);
    pageFrame(PR.TLg, p, t);
    if (p === 0 && t < B.l0 - F1) continue;
    pageType(PR.TLg, PR.RLg, p, t);
  }
  PR.endType(dst, cam);

  // the press: the platen's shadow comes down, thumps, lifts
  if (t < 2.4) {
    const a = t < .55 ? 0 : t < B.thump - .04 ? .8 * Math.pow(ease(t, .55, B.thump - .04), 1.6) : t < B.thump + .08 ? .94 : .94 * (1 - ease(t, B.thump + .08, 2.3));
    if (a > 0) {
      dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0);
      dst.fillStyle = `rgba(14,10,7,${a * .55})`; dst.fillRect(0, 0, W, H);
      const blur = (1 - a) * 120 + 10;
      dst.shadowColor = `rgba(8,6,4,${a})`; dst.shadowBlur = blur; dst.fillStyle = `rgba(8,6,4,${a * .8})`;
      dst.fillRect(sx(-120), sy(-40), 2160 * s, 1160 * s); dst.restore();
    }
  }
  // light falloff and grain
  dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0);
  const vg = dst.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.15); vg.addColorStop(0, 'rgba(60,40,20,0)'); vg.addColorStop(1, 'rgba(60,40,20,.28)');
  dst.globalCompositeOperation = 'multiply'; dst.fillStyle = vg; dst.fillRect(0, 0, W, H); dst.restore();
  drawGrain(dst, t, .07);
}

function renderFrame(t) {
  drawScene(t, g);
  // fast pans: the sheet moves rigidly, so smear the one exposure along the pan (a 180-degree shutter)
  const c0 = camAt(t - 1 / 96), c1 = camAt(t + 1 / 96);
  if (Math.abs(c1.s - c0.s) > 1e-4) return; // the pull-back is slow enough to need no smear
  const d = (c0.x - c1.x) * c1.s;
  const n = Math.min(40, Math.ceil(Math.abs(d) / 3));
  if (n < 3) return;
  AG.setTransform(1, 0, 0, 1, 0, 0); AG.globalAlpha = 1; AG.globalCompositeOperation = 'copy'; AG.drawImage(out, 0, 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
  for (let k = 0; k < n; k++) { g.globalAlpha = 1 / (k + 1); g.drawImage(ACC, d * (k / (n - 1) - .5), 0); }
  g.globalAlpha = 1;
}

const ready = document.fonts.load('92px "Big Caslon"').then(() => document.fonts.load('60px "Hoefler Text Ornaments"')).then(() => { LAY = {}; renderFrame(3); renderFrame(26); return true; }); // warm-up: the very first draw (fresh tiles) came out a few levels off
startPage(out, renderFrame, T0, T1, ready);
