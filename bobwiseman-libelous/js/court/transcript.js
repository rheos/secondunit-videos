// The court transcript: a typed page across the lower part of the frame, line numbers in the margin,
// "THE JUDGE:" on the judge's lines only. Each word types onto the page on its onset (lines.json).
// The current line is big (82 px Courier, cap height ~47 px); when the next line starts the page
// scrolls up and the old line shrinks to a smaller size it keeps while it is still the previous line.

const TR = {
  top: 702, topJudge: 636, x0: 70, x1: 1850, num: 184, rule: 206, tx: 236, tmax: 1590, // tmax: text width at big size
  BIG: 82, MID: 50, SMALL: 34, lead: 1.13, bottom: 1046,
  font: (s) => `bold ${s}px "Courier New", Courier, monospace`,
};
// the speaker label goes on the first line of the judge's speech only (125 continues it, as in a transcript)
const JUDGE_LINES = new Set([124]);
// the sheet slides up a little when the judge speaks, so his labelled line and the next both fit
function sheetTop(t) { const s124 = LINES.find(l => l.i === 124).s; return lerp(TR.top, TR.topJudge, ease(t, s124 - .35, s124 - .05)); }
const TICK_LINES = { 119: 'greed', 120: 'workers', 121: 'wealth', 122: 'torture', 123: 'health' };
let SHEET = null, TLAY = null;

function bakeSheet() {
  const c = mkCanvas(W, H - TR.topJudge + 40), g = c.getContext('2d'), w = c.width, h = c.height;
  const d = g.createImageData(w, h), R = mulberry(4040);
  for (let i = 0; i < w * h; i++) {
    const x = i % w, y = (i / w) | 0;
    const v = 1 + (R() - .5) * .035 + n1(3, x / 140 + y / 400) * .012;
    d.data[i * 4] = 238 * v; d.data[i * 4 + 1] = 233 * v; d.data[i * 4 + 2] = 220 * v; d.data[i * 4 + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  // the margin rule (double) and a light right-hand rule, as on a transcript page
  g.fillStyle = 'rgba(70,70,78,.55)'; g.fillRect(TR.rule - TR.x0, 0, 2, h); g.fillRect(TR.rule - TR.x0 + 6, 0, 2, h);
  g.fillStyle = 'rgba(70,70,78,.25)'; g.fillRect(TR.x1 - TR.x0 - 28, 0, 1.5, h);
  SHEET = c;
}

// Layout at the BIG size: wrap into one or two balanced rows; char advance from measureText.
function layoutTranscript() {
  if (TLAY) return TLAY;
  const g = mkCanvas(10, 10).getContext('2d');
  g.font = TR.font(TR.BIG);
  const adv = g.measureText('MMMMMMMMMM').width / 10;
  const cap = g.measureText('H').actualBoundingBoxAscent;
  TLAY = { adv, cap, lines: {} };
  for (const L of LINES) {
    const words = L.words.map(w => w.w);
    const len = (a, b) => words.slice(a, b).join(' ').length * adv;
    let rows;
    if (len(0, words.length) <= TR.tmax) rows = [[0, words.length]];
    else { let best = 1, bw = 1e9; for (let k = 1; k < words.length; k++) { const m = Math.max(len(0, k), len(k, words.length)); if (m < bw) { bw = m; best = k; } } rows = [[0, best], [best, words.length]]; }
    // word positions (in big-size px, relative to the line's text origin)
    const pos = []; rows.forEach(([a, b], r) => { let col = 0; for (let k = a; k < b; k++) { pos[k] = { r, col }; col += words[k].length + 1; } });
    const width = Math.max(...rows.map(([a, b]) => len(a, b)));
    TLAY.lines[L.i] = { L, rows, pos, width, lastOn: L.words[L.words.length - 1].s };
  }
  return TLAY;
}

// size of line k at time t, in px of font: big while current, MID while it is the previous line and
// still within 1.2 s of its last word (or until the next line after that starts), then SMALL.
function lineSize(idx, t) {
  const k = LINES.findIndex(l => l.i === idx), L = LINES[k], nx = LINES[k + 1], nn = LINES[k + 2];
  const lay = TLAY.lines[idx];
  const tNext = nx ? nx.s : 1e9;
  let s = TR.BIG;
  // shrink BIG -> MID just before the next line starts (the slot opens for the next line's first word)
  s = lerp(TR.BIG, TR.MID, ease(t, tNext - .3, tNext - .08)); // done before the next line's first word types on
  // MID -> SMALL once it has been read: 1.2 s after its last word AND after the following line has started
  const tSmall = Math.max(lay.lastOn + 1.2, nn ? nn.s - .2 : 1e9);
  s = lerp(s, TR.SMALL, ease(t, tSmall, tSmall + .22));
  return s;
}

function drawTranscript(g, t) {
  if (!SHEET) bakeSheet();
  const lay = layoutTranscript();
  // the sheet and its shadow on the pastel paper
  const top = sheetTop(t);
  g.save();
  const sh = g.createLinearGradient(0, top - 26, 0, top + 2); sh.addColorStop(0, 'rgba(20,24,30,0)'); sh.addColorStop(1, 'rgba(20,24,30,.42)');
  g.fillStyle = sh; g.fillRect(TR.x0 + 8, top - 26, TR.x1 - TR.x0, 28);
  g.fillStyle = 'rgba(20,24,30,.3)'; g.fillRect(TR.x0 - 6, top, 6, H - top);
  g.drawImage(SHEET, TR.x0, top);
  g.beginPath(); g.rect(TR.x0, top + 3, TR.x1 - TR.x0, H - top); g.clip();
  const dbg = window.__trDebug = {};

  // stack from the bottom: the latest line that has started (its first word up to 2 frames early) sits lowest
  const lead = 1.5 / 24;
  const shown = LINES.filter(l => l.s - lead <= t);
  let y = TR.bottom;
  for (let k = shown.length - 1; k >= 0 && y > top - 40; k--) {
    const L = shown[k], ly = lay.lines[L.i], sz = lineSize(L.i, t), sc = sz / TR.BIG;
    const rowH = TR.BIG * TR.lead * sc, judge = JUDGE_LINES.has(L.i);
    const labelH = judge ? 40 * Math.min(1, sc * 1.6) * 1.15 : 0;
    const blockH = ly.rows.length * rowH + labelH;
    const btop = y - blockH; // block occupies [btop, y]
    // a line scrolling off the top of the sheet fades rather than being cut in half
    const vis = clamp((btop - top - 2) / 26); dbg[L.i] = { vis, sz }; if (vis <= 0) break;
    g.globalAlpha = vis;
    // speaker label on its own row above the words
    if (judge) {
      g.font = TR.font(Math.round(40 * Math.min(1, sc * 1.6))); g.fillStyle = 'rgba(25,25,30,.9)'; g.textBaseline = 'alphabetic';
      g.fillText('THE JUDGE:', TR.tx, btop + labelH * .82);
    }
    // line number in the margin, at the first row
    const base0 = btop + labelH + rowH * .78;
    g.font = TR.font(Math.round(Math.min(30, sz * .55))); g.fillStyle = 'rgba(90,90,98,.85)'; g.textAlign = 'right';
    g.fillText(String(L.i - 98), TR.num, base0); g.textAlign = 'left';
    // margin tick in red pencil on the "their view of" lines, on the noun
    const nounW = TICK_LINES[L.i];
    if (nounW) { const wd = L.words.find(w => w.w === nounW); if (wd && t >= wd.s - lead) drawTick(g, TR.num - 92, base0 - 22 * Math.min(1, sc * 1.4), Math.min(1, sc * 1.4), clamp((t - wd.s + lead) / .14), L.i); }
    // words
    g.save(); g.translate(TR.tx, btop + labelH); g.scale(sc, sc);
    g.font = TR.font(TR.BIG); g.textBaseline = 'alphabetic';
    L.words.forEach((wd, wi) => {
      if (t < wd.s - lead) return;
      const p = ly.pos[wi], fresh = clamp(1 - (t - (wd.s - lead)) / (3 / 24));
      const bx = p.col * lay.adv, by = p.r * TR.BIG * TR.lead + TR.BIG * .86;
      if (PROBE.on) { // audit: each word on its onset, inside the visible sheet
        probeWord(t, L.i, wi, (tt) => tt >= wd.s - lead);
        PROBE.text(g, 'transcript', wd.w, bx, by, null, { keep: true, inScreen: [TR.x0, top + 3, TR.x1 - TR.x0, H - top - 3], margin: 6 });
      }
      for (let ci = 0; ci < wd.w.length; ci++) {
        const ch = wd.w[ci], jr = rnd(L.i, wi * 31 + ci), jy = (rnd(L.i, wi * 31 + ci, 2) - .5) * 2.4;
        const ink = .84 + jr * .16;
        g.fillStyle = `rgba(20,20,24,${ink})`;
        g.fillText(ch, bx + ci * lay.adv + (jr - .5) * 1.2, by + jy - fresh * 3);
        if (fresh > 0) { g.fillStyle = `rgba(20,20,24,${.25 * fresh})`; g.fillText(ch, bx + ci * lay.adv + 1.6, by + jy - fresh * 3 + 1.2); }
      }
    });
    g.restore();
    y = btop - 10 * sc - 6;
  }
  g.globalAlpha = 1;
  g.restore();
}

function drawTick(g, x, y, s, u, seed) {
  if (u <= 0) return;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.lineCap = 'round'; g.strokeStyle = 'rgba(178,34,30,.92)';
  const a = [[0, 14], [12, 30], [44, -8]], L1 = Math.hypot(12, 16), L2 = Math.hypot(32, 38), tot = (L1 + L2) * u;
  for (let pass = 0; pass < 3; pass++) {
    g.lineWidth = 7 - pass * 2; g.globalAlpha = .5 + pass * .2;
    const o = (rnd(seed, pass) - .5) * 2;
    g.beginPath(); g.moveTo(a[0][0] + o, a[0][1]);
    const f1 = Math.min(1, tot / L1); g.lineTo(lerp(a[0][0], a[1][0], f1) + o, lerp(a[0][1], a[1][1], f1));
    if (tot > L1) { const f2 = Math.min(1, (tot - L1) / L2); g.lineTo(lerp(a[1][0], a[2][0], f2) + o, lerp(a[1][1], a[2][1], f2) + o * .5); }
    g.stroke();
  }
  g.restore();
}

// "Libelous": a red rubber stamp slammed across the transcript, above the current line so it never
// covers the words being read. Ink is uneven (seeded speckle), the stamp lands with a small overshoot.
let STAMP = null;
function bakeStamp() {
  const word = LINES.find(l => l.i === 125).words.slice(-1)[0].w.toUpperCase();
  const c = mkCanvas(1240, 260), g = c.getContext('2d');
  g.fillStyle = '#b3241f'; g.strokeStyle = '#b3241f';
  const size = fitText(g, word, 1240 - 120, 190, 'bold {s}px "Arial Black", Impact, sans-serif');
  g.lineWidth = 14; g.strokeRect(14, 14, 1240 - 28, 260 - 28); g.lineWidth = 5; g.strokeRect(34, 34, 1240 - 68, 260 - 68);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(word, 620, 136);
  // uneven ink: knock out specks and a few dry streaks
  g.globalCompositeOperation = 'destination-out';
  const R = mulberry(555);
  for (let k = 0; k < 2600; k++) { g.globalAlpha = .4 + R() * .6; const r = .8 + R() * 2.6; g.beginPath(); g.arc(R() * 1240, R() * 260, r, 0, TAU); g.fill(); }
  for (let k = 0; k < 14; k++) { g.globalAlpha = .25 + R() * .3; g.fillRect(R() * 1240, R() * 260, 60 + R() * 260, 2 + R() * 4); }
  STAMP = { c, size };
}
function drawStamp(g, t) {
  const L = LINES.find(l => l.i === 125), w = L.words[L.words.length - 1], t0 = w.s - 1.5 / 24;
  if (t < t0) return;
  if (!STAMP) bakeStamp();
  const k = clamp((t - t0) / (3 / 24)), sc = lerp(1.22, 1, k * k), a = clamp(k * 3);
  g.save(); g.translate(1000, 540); g.rotate(-.07); g.scale(sc, sc);
  g.globalAlpha = .9 * a; g.globalCompositeOperation = 'multiply';
  g.drawImage(STAMP.c, -620, -130);
  g.restore();
}
