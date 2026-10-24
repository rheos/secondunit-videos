// LYRICS: every sung word carved into a paper label block cut into the print, struck on its onset.
// Loaded after the chapters (wood-cap.html, wood-9x16-cap.html); core.js calls OVERLAY(t) after the shot and before
// the look, so the label prints through the same woodcut shader (ragged edges, paper tooth, the red plate
// off register) and nothing in the shot can cross it.
//
// Words come from js/gen/lyrics.js (LYR, generated from source/lines.json by tools/make_lyrics.mjs; gitignored
// because it quotes the lyric). Each word prints on its first song frame (floor(s * 24)) with a 3-frame impression;
// words not yet sung are not on the block. The label is cut to the whole line's size when the line starts,
// so it never grows while it is read. Her name prints on the red plate.
//
// WHERE: kept off every face (Robin, 2026-10-13: "try to avoid putting them over people's faces"). The kit reports
// each drawn head (FACES, js/wkit.js); tools/place_captions.mjs scans every captioned frame and writes
// js/cap-place.js: per line, per stretch of frames, which layout and where. A label only moves on a shot cut or
// when a figure would otherwise pass under it. Without a placement it sits bottom centre.
//
// Sizes are in OUTPUT pixels of the aspect being made: 16:9 1920 x 1080, 9:16 1080 x 1920. A 9:16 pan-and-scan
// shot (vertical.mjs draws the 16:9 page at 1.7778x and crops a 1080 x 1920 window) sets window.__capCx, the window
// centre in 16:9 design px, per frame; the label is then laid out for the tall frame inside that window ('pan').
const CAP = {
  wide: { W: 1920, H: 1080, padX: 34, padY: 18, lead: 1.22, bottom: 1080 - 52, edge: 30 },
  // phone: default clear of the Reels/Shorts bottom bar (~25 %) and the right-hand buttons (~110 px)
  tall: { W: 1080, H: 1920, padX: 30, padY: 18, lead: 1.2, bottom: 1440, edge: 30, dx: -20 },
};
// the label's type and measure, widest first; the placer tries narrower ones to fit between figures
const CAP_LAYOUTS = {
  wide: [{ size: 56, maxW: 1500 }, { size: 56, maxW: 1060 }, { size: 54, maxW: 760 }, { size: 52, maxW: 560 }],
  tall: [{ size: 60, maxW: 860 }, { size: 58, maxW: 680 }, { size: 56, maxW: 540 }, { size: 54, maxW: 420 }],
};
const CAP_F = 24;
const capFrame = (t) => Math.round(t * CAP_F);
const capOn = (t, s) => capFrame(t) >= Math.floor(s * CAP_F + 1e-6);
const CPROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, edge() {} };
const capRed = (w) => /^(ellen|mcilwaine)/i.test(w.replace(/[^a-z]/gi, ''));
// carved in capitals like the video's own signs; 'Mc' keeps its small c (McILWAINE, as on the kids' cards)
const capText = (w) => w.toUpperCase().replace(/\bMC/g, 'Mc');
const CAP_BLEED = 7;
const CAP_CUTS = [35.0, 112.0, 187.0];   // the cuts that end verses 1-3 (js/wch chapter bounds)   // the chiselled edge and its 7 px rule reach this far outside the label box

// which line is up at t: from 0.25 s before its first word until the next line takes over, or its last word
// + a read hold (0.3 s a word + 0.5 s, at least 1.2 s) when the next line is far off
function capLine(t) {
  if (typeof LYR === 'undefined') return -1;
  for (let i = LYR.length - 1; i >= 0; i--) {
    const L = LYR[i], a = L.s - .25;
    if (t < a) continue;
    const hold = Math.max(1.2, .3 * L.words.length + .5) * .6, nx = LYR[i + 1];
    const cut = CAP_CUTS.find((c) => c > L.s) ?? Infinity;          // a verse's labels leave with the verse
    const b = Math.min(nx ? nx.s - .25 : Infinity, L.e + hold, cut);
    return t < b ? i : -1;
  }
  return -1;
}
const CMC = document.createElement('canvas').getContext('2d');
const capFont = (sz) => `900 ${sz}px "Superclarendon"`;
// rows of words that fit maxW, balanced: try every row count from the fewest, keep the most even split
function capLayout(li, key, n) {
  const P = CAP[key], Y = CAP_LAYOUTS[key][n];
  const words = LYR[li].words.map((w) => capText(w.w));
  CMC.font = capFont(Y.size); const sp = CMC.measureText(' ').width, ww = words.map((w) => CMC.measureText(w).width);
  const rowW = (a, b) => ww.slice(a, b).reduce((x, y) => x + y, 0) + sp * (b - a - 1);
  let best = null;
  for (let r = 1; r <= words.length && !best; r++) {
    const total = rowW(0, words.length);
    for (let tgt = Math.min(Y.maxW, total / r + Y.size * 2); tgt <= Y.maxW + 1; tgt += 10) {
      const rows = []; let a = 0;
      for (let i = 1; i <= words.length; i++) if (i === words.length || rowW(a, i + 1) > tgt) { rows.push([a, i]); a = i; }
      if (rows.length === r && rows.every(([x, y]) => rowW(x, y) <= Y.maxW)) { best = rows; break; }
    }
  }
  if (!best) best = words.map((_, i) => [i, i + 1]);
  const rw = best.map(([a, b]) => rowW(a, b)), w = Math.max(...rw), lh = Y.size * P.lead;
  const runs = [];
  best.forEach(([a, b], r) => { let x = -rw[r] / 2; for (let i = a; i < b; i++) { runs.push({ i, x, r }); x += ww[i] + sp; } });
  return { runs, size: Y.size, w: w + P.padX * 2, h: lh * best.length + P.padY * 2, lh, rows: best.length };
}
const CAP_LAY = {};
const capLay = (li, key, n) => CAP_LAY[`${key}${li}.${n}`] || (CAP_LAY[`${key}${li}.${n}`] = capLayout(li, key, n));
// where line li sits on song frame f: [layout, x0, y0] from js/cap-place.js, else the default
function capWhere(li, key, f) {
  const tab = typeof CAP_PLACE !== 'undefined' && CAP_PLACE[key] && CAP_PLACE[key][li];
  if (tab) { for (const [f0, f1, n, x0, y0] of tab) if (f >= f0 && f < f1) return [n, x0, y0, tab[0][0]]; return null; }   // placed lines show only where placed
  const k = key === 'pan' ? 'tall' : key, P = CAP[k], lay = capLay(li, k, 0), cx = P.W / 2 + (P.dx || 0);
  return [0, cx - lay.w / 2, P.bottom - lay.h, null];
}

// the frame's faces and signs, in design px (cleared every frame; read by the placer through __capScan)
let CAP_SEEN = { faces: [], signs: [] };
function OVERLAY(t) {
  CAP_SEEN = { faces: FACES.splice(0), signs: SIGNS.splice(0) };
  if (window.__showFaces) withT(() => { s.lineWidth = 4; s.strokeStyle = RED; for (const [a, b, c, d] of CAP_SEEN.faces) s.strokeRect(a, b, c - a, d - b); });
  const li = capLine(t); if (li < 0) return;
  const pan = window.__capCx !== undefined, tall = PORTRAIT || pan, key = tall ? 'tall' : 'wide', P = CAP[key];
  const where = capWhere(li, pan ? 'pan' : key, capFrame(t)); if (!where) return;
  const L = LYR[li], [n, x0, y0, fFirst] = where, lay = capLay(li, key, n), size = lay.size;
  const cx = x0 + lay.w / 2;
  withT(() => {
    if (pan) { const k = 1080 / 1920; s.translate(window.__capCx - 540 * k, 0); s.scale(k, k); }
    // the label block prints in left to right over 3 frames (a new pull each frame), then holds
    const fIn = capFrame(t) - Math.max(Math.floor((L.s - .25) * CAP_F + 1e-6), fFirst ?? -1e9), u = clamp((fIn + 1) / 3);
    const blk = [[x0, y0], [x0 + lay.w, y0], [x0 + lay.w, y0 + lay.h], [x0, y0 + lay.h]];
    withT(() => {
      s.beginPath(); s.rect(x0 - 12, y0 - 12, (lay.w + 24) * u, lay.h + 24); s.clip();
      shape(() => pathOf(chisel(blk, 4000 + li, 3)), CUT, 7, INK);                               // the block, black-edged
      shape(() => pathOf(chisel([[x0 + 11, y0 + 11], [x0 + lay.w - 11, y0 + 11], [x0 + lay.w - 11, y0 + lay.h - 11], [x0 + 11, y0 + lay.h - 11]], 4100 + li, 1.5)), null, 2.2, INK);
      // two gouge nicks in the outer rule at each end, like a carver's stop cuts
      for (const ex of [x0 + 26, x0 + lay.w - 26]) { flick(ex, y0 + 1, Math.PI / 2, 9, 3, CUT); flick(ex, y0 + lay.h - 1, -Math.PI / 2, 9, 3, CUT); }
    });
    CPROBE.box(s, 'lyric label', x0 - CAP_BLEED, y0 - CAP_BLEED, lay.w + 2 * CAP_BLEED, lay.h + 2 * CAP_BLEED, { keep: true });
    s.font = capFont(size); s.textAlign = 'left'; s.textBaseline = 'alphabetic';
    const base = y0 + P.padY + lay.lh * .5 + size * .36;   // Superclarendon caps ~.72 em: centre the cap height in the row
    for (const R of lay.runs) {
      const W_ = L.words[R.i], x = cx + R.x, y = base + R.r * lay.lh;
      const on = capOn(t, W_.s);
      CPROBE.edge(`word#${li}.${R.i}`, on, typeof ML !== 'undefined' && capOn(ML.prevT(t), W_.s));
      if (!on) continue;
      const k = capFrame(t) - Math.floor(W_.s * CAP_F + 1e-6), sc = k < 3 ? 1 + .07 * (1 - k / 3) : 1; // the impression
      const txt = capText(W_.w), wd = s.measureText(txt).width;
      withT(() => { s.translate(x + wd / 2, y - size * .36); s.scale(sc, sc); s.fillStyle = capRed(W_.w) ? RED : INK;
        s.fillText(txt, -wd / 2, size * .36); });
      CPROBE.text(s, 'lyric', txt, x, y, [x0, y0, lay.w, lay.h], { margin: 14 * (pan ? 1080 / 1920 : 1) * RS });
    }
  });
}

// for tools/place_captions.mjs: draw frame t (shot + look, no JPEG) and report the faces, signs, shot and the
// label sizes of every layout for the line up at t
window.__capScan = (t, key) => {
  renderFrame(t);
  const sh = SHOTS.find((x) => t >= x.a && t < x.b), li = capLine(t), k = key === 'pan' ? 'tall' : key;
  return { faces: CAP_SEEN.faces, signs: CAP_SEEN.signs, shot: sh ? sh.name : '', li, w0: li < 0 ? 0 : Math.floor(LYR[li].words[0].s * CAP_F + 1e-6),
    lays: li < 0 ? [] : CAP_LAYOUTS[k].map((_, n) => { const L = capLay(li, k, n); return [L.w, L.h]; }) };
};
