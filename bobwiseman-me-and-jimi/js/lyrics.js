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
// Sizes are in OUTPUT pixels of the aspect being made: 16:9 1920 x 1080, 9:16 1080 x 1920. A 9:16 pan-and-scan
// shot (vertical.mjs draws the 16:9 page at 1.7778x and crops a 1080 x 1920 window) sets window.__capCx, the window
// centre in 16:9 design px, per frame; the label is then laid out for the tall frame inside that window.
const CAP = {
  wide: { size: 56, maxW: 1500, padX: 34, padY: 18, lead: 1.22, bottom: 1080 - 52, top: 52, edge: 30 },
  // phone: clear of the Reels/Shorts bottom bar (~25 %) and the right-hand buttons (~110 px)
  tall: { size: 60, maxW: 860, padX: 30, padY: 18, lead: 1.2, bottom: 1440, top: 230, edge: 30, dx: -20 },
};
// lines that would hide something the shot says (kids spelling her name, signs at the foot): label at the top.
// Keyed by line index in LYR (no lyric here). Separate tables per aspect.
const CAP_TOP = { wide: [12, 13], tall: [] };
const CAP_F = 24;
const capFrame = (t) => Math.round(t * CAP_F);
const capOn = (t, s) => capFrame(t) >= Math.floor(s * CAP_F + 1e-6);
const CPROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, edge() {} };
const capRed = (w) => /^(ellen|mcilwaine)/i.test(w.replace(/[^a-z]/gi, ''));
// carved in capitals like the video's own signs; 'Mc' keeps its small c (McILWAINE, as on the kids' cards)
const capText = (w) => w.toUpperCase().replace(/\bMC/g, 'Mc');

// which line is up at t: from 0.25 s before its first word until the next line takes over, or its last word
// + a read hold (0.3 s a word + 0.5 s, at least 1.2 s) when the next line is far off
function capLine(t) {
  if (typeof LYR === 'undefined') return -1;
  for (let i = LYR.length - 1; i >= 0; i--) {
    const L = LYR[i], a = L.s - .25;
    if (t < a) continue;
    const hold = Math.max(1.2, .3 * L.words.length + .5) * .6, nx = LYR[i + 1];
    const b = Math.min(nx ? nx.s - .25 : Infinity, L.e + hold);
    return t < b ? i : -1;
  }
  return -1;
}
const CMC = document.createElement('canvas').getContext('2d');
const capFont = (sz) => `900 ${sz}px "Superclarendon"`;
// rows of words that fit maxW, balanced: try every row count from the fewest, keep the most even split
function capLayout(li, P) {
  const words = LYR[li].words.map((w) => capText(w.w));
  CMC.font = capFont(P.size); const sp = CMC.measureText(' ').width, ww = words.map((w) => CMC.measureText(w).width);
  const rowW = (a, b) => ww.slice(a, b).reduce((x, y) => x + y, 0) + sp * (b - a - 1);
  let best = null;
  for (let n = 1; n <= words.length && !best; n++) {
    // greedy at a target width, shrinking the target to balance
    const total = rowW(0, words.length);
    for (let tgt = Math.min(P.maxW, total / n + P.size * 2); tgt <= P.maxW + 1; tgt += 10) {
      const rows = []; let a = 0;
      for (let i = 1; i <= words.length; i++) if (i === words.length || rowW(a, i + 1) > tgt) { rows.push([a, i]); a = i; }
      if (rows.length === n && rows.every(([x, y]) => rowW(x, y) <= P.maxW)) { best = rows; break; }
    }
  }
  if (!best) best = words.map((_, i) => [i, i + 1]);
  const rw = best.map(([a, b]) => rowW(a, b)), w = Math.max(...rw), lh = P.size * P.lead;
  const runs = [];
  best.forEach(([a, b], r) => { let x = -rw[r] / 2; for (let i = a; i < b; i++) { runs.push({ i, x, r }); x += ww[i] + sp; } });
  return { runs, w: w + P.padX * 2, h: lh * best.length + P.padY * 2, lh, rows: best.length };
}
const CAP_LAY = {};

function OVERLAY(t) {
  const li = capLine(t); if (li < 0) return;
  const pan = window.__capCx !== undefined, tall = PORTRAIT || pan, key = tall ? 'tall' : 'wide', P = CAP[key];
  const OW = tall ? 1080 : 1920;
  const L = LYR[li], lay = CAP_LAY[key + li] || (CAP_LAY[key + li] = capLayout(li, P));
  const top = CAP_TOP[key].includes(li);
  const cx = OW / 2 + (P.dx || 0), y0 = top ? P.top : P.bottom - lay.h, x0 = cx - lay.w / 2;
  withT(() => {
    if (pan) { const k = 1080 / 1920; s.translate(window.__capCx - 540 * k, 0); s.scale(k, k); }
    // the label block prints in left to right over 3 frames (a new pull each frame), then holds
    const fIn = capFrame(t) - Math.floor((L.s - .25) * CAP_F + 1e-6), u = clamp((fIn + 1) / 3);
    const blk = [[x0, y0], [x0 + lay.w, y0], [x0 + lay.w, y0 + lay.h], [x0, y0 + lay.h]];
    withT(() => {
      s.beginPath(); s.rect(x0 - 12, y0 - 12, (lay.w + 24) * u, lay.h + 24); s.clip();
      shape(() => pathOf(chisel(blk, 4000 + li, 3)), CUT, 7, INK);                               // the block, black-edged
      shape(() => pathOf(chisel([[x0 + 11, y0 + 11], [x0 + lay.w - 11, y0 + 11], [x0 + lay.w - 11, y0 + lay.h - 11], [x0 + 11, y0 + lay.h - 11]], 4100 + li, 1.5)), null, 2.2, INK);
      // two gouge nicks in the outer rule at each end, like a carver's stop cuts
      for (const ex of [x0 + 26, x0 + lay.w - 26]) { flick(ex, y0 + 1, Math.PI / 2, 9, 3, CUT); flick(ex, y0 + lay.h - 1, -Math.PI / 2, 9, 3, CUT); }
    });
    CPROBE.box(s, 'lyric label', x0, y0, lay.w, lay.h, { keep: true });
    s.font = capFont(P.size); s.textAlign = 'left'; s.textBaseline = 'alphabetic';
    const base = y0 + P.padY + lay.lh * .5 + P.size * .36;   // Superclarendon caps ~.72 em: centre the cap height in the row
    for (const R of lay.runs) {
      const W_ = L.words[R.i], x = cx + R.x, y = base + R.r * lay.lh;
      const on = capOn(t, W_.s);
      CPROBE.edge(`word#${li}.${R.i}`, on, typeof ML !== 'undefined' && capOn(ML.prevT(t), W_.s));
      if (!on) continue;
      const k = capFrame(t) - Math.floor(W_.s * CAP_F + 1e-6), sc = k < 3 ? 1 + .07 * (1 - k / 3) : 1; // the impression
      const txt = capText(W_.w), wd = s.measureText(txt).width;
      withT(() => { s.translate(x + wd / 2, y - P.size * .36); s.scale(sc, sc); s.fillStyle = capRed(W_.w) ? RED : INK;
        s.fillText(txt, -wd / 2, P.size * .36); });
      CPROBE.text(s, 'lyric', txt, x, y, [x0, y0, lay.w, lay.h], { margin: 14 * (pan ? 1080 / 1920 : 1) * RS });
    }
  });
}
