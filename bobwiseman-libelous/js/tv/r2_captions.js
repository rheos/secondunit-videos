// Round 2 captions, drawn into the broadcast signal (960x720) like round 1's, so the tube renders them.
// Stanza 7: the decoder's closed captions again (5x7 dot-matrix capitals, white on black, roll-up), four rows at
//   the top of the picture: the lesson's flannel board fills the rest. At most 27 characters a row.
// Stanza 11: the news bulletin's wire copy: a strip of canary teleprinter paper across the lower third, the copy
//   typed in capitals on each word's onset, the print head riding along, the paper feeding up a line per row.
// Both keep every row of a line on screen until its read time (next line's start, or 1.2 s after its last word,
// whichever is later); checkRows2() proves it at load and logs an error if not.
CC_GLYPHS['"'] = '01010010100000000000000000000000000';
CC_GLYPHS[','] = CC_GLYPHS[','] || '00000000000000000000011000010001000';

// split a line's words into the fewest rows that fit maxW, balanced (up to 3 rows)
function splitRows(words, measure, maxW) {
  const n = words.length, txt = (a, b) => words.slice(a, b).map(w => w.w).join(' ');
  for (let k = 1; k <= 3; k++) {
    let best = null;
    const rec = (cuts) => {
      if (cuts.length === k - 1) {
        const parts = []; let p = 0; for (const c of [...cuts, n]) { parts.push([p, c]); p = c; }
        const w = parts.map(([a, b]) => measure(txt(a, b))); if (Math.max(...w) > maxW) return;
        const sc = Math.max(...w) + 0.15 * (Math.max(...w) - Math.min(...w));
        if (!best || sc < best.sc) best = { sc, parts };
        return;
      }
      for (let c = (cuts.length ? cuts[cuts.length - 1] : 0) + 1; c < n; c++) rec([...cuts, c]);
    };
    rec([]);
    if (best) return best.parts.map(([a, b]) => words.slice(a, b));
  }
  throw new Error('line does not fit in three rows: ' + txt(0, n));
}

// ---------- stanza 7: closed captions, roll-up, 4 rows at the top ----------
const CC2 = { nv: 4, rows: [] };
function initCC2() {
  for (let li = 50; li <= 64; li++) {
    const ws = LN2[li].words.map((w, k) => ({ w: w.w.toUpperCase(), s: w.s, li, k }));
    for (const r of splitRows(ws, s => s.length, CC.maxCh)) CC2.rows.push({ words: r, s: r[0].s, line: li });
  }
}
function cc2Layout(t) {
  const out = [], R = CC2.rows, nv = CC2.nv;
  const started = R.filter(r => r.s <= t + 0.021);
  if (!started.length) return out;
  const next = R.find(r => r.s > t + 0.021);
  // the next row rolls in over the 0.2 s before its first word (never before the stanza's first frame)
  const scroll = next && started.length >= 1 ? CC.rowH * smooth(clamp((t - Math.max(S7[0], next.s - 0.2)) / Math.min(0.2, next.s - S7[0]))) : 0;
  const vis = started.slice(-(nv + 1));
  const clip = [CC.yTop, CC.yTop + nv * CC.rowH];
  vis.forEach((r, k) => {
    const slot = (nv - 1) - (vis.length - 1 - k);
    const y = CC.yTop + slot * CC.rowH - scroll;
    const ws = r.words.filter(w => w.s <= t + 0.021);
    out.push({ y, txt: ws.map(w => w.w).join(' '), ws, clip, r });
  });
  return out;
}
function drawCC2(g, t) {
  for (const r of cc2Layout(t)) {
    if (!r.txt) continue;
    g.save(); g.beginPath(); g.rect(0, r.clip[0], SIG_W, r.clip[1] - r.clip[0]); g.clip();
    const w = (r.txt.length + 2) * CC.cell;
    g.fillStyle = '#000'; g.fillRect(CC.x0 - CC.cell, r.y, w, CC.rowH);
    g.fillStyle = '#f4f4ee'; ccText(g, r.txt, CC.x0, r.y + CC.dotH);
    g.restore();
    if (PROBE.on) {
      for (const w of r.ws) probeWord(t, w.li, w.k, (tt) => w.s <= tt + 0.021);
      if (r.y >= r.clip[0] - 0.5 && r.y + CC.rowH <= r.clip[1] + 0.5) PROBE.box(g, 'closed caption', CC.x0 - CC.cell, r.y, w, CC.rowH, { keep: true });
    }
  }
}

// ---------- stanza 11: the teleprinter strip ----------
const TP = { band: { x: 46, y: 468, w: 868, h: 214 }, nv: 3, rowH: 62, padTop: 20, x0: 74, cap: 36, maxCh: 26, rows: [] };
function tpFont(s) { return `bold ${s}px "Courier New", Courier, monospace`; }
function initTP(g) {
  let fs = 40; for (; fs < 120; fs++) { g.font = tpFont(fs); if (g.measureText('H').actualBoundingBoxAscent >= TP.cap) break; }
  TP.fs = fs; g.font = tpFont(fs); TP.adv0 = g.measureText('M').width;
  TP.sx = Math.min(1, (TP.band.w - 2 * (TP.x0 - TP.band.x) - 6) / (TP.maxCh * TP.adv0));
  TP.adv = TP.adv0 * TP.sx;
  for (let li = 101; li <= 110; li++) {
    const ws = LN2[li].words.map((w, k) => ({ w: w.w.toUpperCase(), s: w.s, li, k }));
    for (const r of splitRows(ws, s => s.length, TP.maxCh)) {
      let col = 0; const words = r.map((w) => { const o = { ...w, col }; col += w.w.length + 1; return o; });
      TP.rows.push({ words, s: r[0].s, line: li });
    }
  }
}
// where every row sits at time t (row 0 of the band = top), plus the print head
function tpLayout(t) {
  const out = { rows: [], head: null }, R = TP.rows, nv = TP.nv;
  const started = R.filter(r => r.s <= t + 0.021);
  if (!started.length) return out;
  const next = R.find(r => r.s > t + 0.021);
  // line feed: the paper moves up one row over the 0.14 s before the next row's first word
  const feed = next ? TP.rowH * smooth(clamp((t - Math.max(S11[0], next.s - 0.14)) / Math.min(0.14, next.s - S11[0]))) : 0;
  const vis = started.slice(-(nv + 1));
  vis.forEach((r, k) => {
    const slot = (nv - 1) - (vis.length - 1 - k);
    const top = TP.band.y + TP.padTop + slot * TP.rowH - feed;
    out.rows.push({ r, top, base: top + TP.cap + 10, ws: r.words.filter(w => w.s <= t + 0.021) });
  });
  const cur = out.rows[out.rows.length - 1];
  const lastW = cur.ws[cur.ws.length - 1];
  const sinceType = t - lastW.s;
  out.head = { x: TP.x0 + (lastW.col + lastW.w.length) * TP.adv + 4, base: cur.base, kick: Math.exp(-Math.max(0, sinceType) * 18) };
  return out;
}
function drawTP(g, t) {
  const bd = TP.band, lay = tpLayout(t);
  g.save();
  // the paper: canary yellow, a torn top edge, a soft shadow on the picture under it
  g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(bd.x + 6, bd.y + 8, bd.w, bd.h);
  const tear = (h) => { h.beginPath(); h.moveTo(bd.x, bd.y + bd.h); h.lineTo(bd.x, bd.y + 6);
    for (let x = bd.x, k = 0; x <= bd.x + bd.w; x += 14, k++) h.lineTo(x, bd.y + 6 - (k % 2 ? 5 : 0) - rnd(k, 5) * 4);
    h.lineTo(bd.x + bd.w, bd.y + bd.h); h.closePath(); };
  tear(g); g.fillStyle = '#f1e48e'; g.fill();
  g.save(); tear(g); g.clip();
  // paper fibre and the faint feed lines the platen leaves
  g.fillStyle = TP.paper; g.fillRect(bd.x, bd.y, bd.w, bd.h);
  const yoff = lay.rows.length ? (lay.rows[lay.rows.length - 1].top % TP.rowH) : 0;
  g.strokeStyle = 'rgba(150,120,40,.18)'; g.lineWidth = 2;
  for (let y = bd.y + yoff - TP.rowH; y < bd.y + bd.h + TP.rowH; y += TP.rowH) { g.beginPath(); g.moveTo(bd.x, y + TP.rowH - 6); g.lineTo(bd.x + bd.w, y + TP.rowH - 6); g.stroke(); }
  // the copy
  g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.font = tpFont(TP.fs);
  g.beginPath(); g.rect(bd.x, bd.y + 8, bd.w, bd.h - 10); g.clip();
  for (const row of lay.rows) {
    for (const w of row.ws) {
      for (let i = 0; i < w.w.length; i++) {
        const ci = w.col + i, x = TP.x0 + ci * TP.adv, jy = (rnd(row.r.line, ci, 3) - .5) * 2.4, ink = .78 + rnd(row.r.line, ci, 9) * .22;
        g.save(); g.translate(x, row.base + jy); g.scale(TP.sx, 1);
        g.fillStyle = `rgba(28,20,34,${ink})`; g.fillText(w.w[i], 0, 0);
        g.fillStyle = `rgba(28,20,34,${ink * .35})`; g.fillText(w.w[i], 1.2, .6);   // the hammer's double strike
        g.restore();
      }
    }
  }
  g.restore();
  // the print head: a little grey type box riding the current row, it kicks when it types
  if (lay.head) {
    const hx = Math.min(lay.head.x, bd.x + bd.w - 30), hy = lay.head.base - TP.cap - 8 - lay.head.kick * 5;
    g.fillStyle = '#5d6168'; g.strokeStyle = '#1e1f24'; g.lineWidth = 2.5;
    g.beginPath(); g.roundRect(hx, hy, 22, TP.cap + 18, 4); g.fill(); g.stroke();
    g.fillStyle = '#9aa0a8'; g.fillRect(hx + 4, hy + 4, 14, 6);
    g.fillStyle = '#2a2d33'; g.fillRect(hx + 8, hy + TP.cap + 6, 6, 10);
  }
  g.strokeStyle = 'rgba(120,96,30,.6)'; g.lineWidth = 2; tear(g); g.stroke();
  g.restore();
  if (PROBE.on) {
    g.save(); g.font = tpFont(TP.fs);
    for (const row of lay.rows) {
      if (row.top < bd.y || row.base > bd.y + bd.h) continue;   // a row mid-feed above the paper's top is leaving
      for (const w of row.ws) {
        probeWord(t, w.li, w.k, (tt) => w.s <= tt + 0.021);
        const x = TP.x0 + w.col * TP.adv;
        PROBE.box(g, 'teleprinter', x, row.base - TP.cap - 2, w.w.length * TP.adv, TP.cap + 12, { keep: true, inScreen: [bd.x, bd.y, bd.w, bd.h], margin: 6 });
      }
    }
    g.restore();
  }
}
function initTPPaper() {
  const c = mkCanvas(256, 256), h = c.getContext('2d'), R = mulberry(5150);
  h.fillStyle = '#f1e48e'; h.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { h.fillStyle = R() < .5 ? 'rgba(255,255,230,.25)' : 'rgba(170,140,50,.12)'; h.fillRect(R() * 256, R() * 256, 1 + R() * 3, 1); }
  return c;
}
// Self-check: every row of every line stays fully on screen from its first word to its line's read time.
function checkRows2() {
  const bad = [];
  const test = (rows, layout, inside, a, b) => {
    for (let f = Math.ceil(a * 24); f < Math.round(b * 24); f++) {
      const t = f / 24, lay = layout(t);
      for (const r of rows) {
        const ru = readUntil2(r.line);
        if (t < r.s - 0.021 || t > ru) continue;
        const it = lay.find(x => x.r === r);
        if (!it || !inside(it)) bad.push(f + ':' + r.line);
      }
    }
  };
  test(CC2.rows, (t) => cc2Layout(t), (it) => it.y >= it.clip[0] - 0.5 && it.y + CC.rowH <= it.clip[1] + 0.5, S7[0], S7[1]);
  test(TP.rows, (t) => tpLayout(t).rows, (it) => it.top >= TP.band.y && it.base + 12 <= TP.band.y + TP.band.h, S11[0], S11[1]);
  if (bad.length) console.error('caption row leaves before its read time: ' + [...new Set(bad)].slice(0, 30).join(' '));
  return bad;
}
