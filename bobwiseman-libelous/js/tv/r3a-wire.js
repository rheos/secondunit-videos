// Round 3, tv-A: the wire copy. The same canary teleprinter strip as stanza 11 (js/tv/r2_captions.js: Courier
// New Bold capitals, cap 36 signal px, typed on each word's onset with ink jitter and a double strike, the grey
// print head riding the row, a 0.14 s line feed before each new row), drawn into the broadcast signal so the
// tube renders it. These stanzas are sung almost wall to wall in short lines, so the strip is one row taller
// (four rows) and takes 28 columns, or a line's rows would feed off the paper before their read time.
// r3aTvCheckRows() proves every row stays on the paper until its read time and logs an error if not.
const r3aTvTP = { band: { x: 46, y: 442, w: 868, h: 240 }, nv: 4, rowH: 54, padTop: 16, x0: 74, cap: 36, maxCh: 28, rows: [] };
function r3aTvFont(s) { return `bold ${s}px "Courier New", Courier, monospace`; }
// split a line's words into the fewest rows that fit maxW, balanced (copied from r2_captions.js splitRows)
function r3aTvSplitRows(words, measure, maxW) {
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
function r3aTvInitWire(g) {
  const TP = r3aTvTP;
  let fs = 40; for (; fs < 120; fs++) { g.font = r3aTvFont(fs); if (g.measureText('H').actualBoundingBoxAscent >= TP.cap) break; }
  TP.fs = fs; g.font = r3aTvFont(fs); TP.adv0 = g.measureText('M').width;
  TP.sx = Math.min(1, (TP.band.w - 2 * (TP.x0 - TP.band.x) - 6) / (TP.maxCh * TP.adv0));
  TP.adv = TP.adv0 * TP.sx;
  for (const L of r3aTvLINES) {
    const ws = L.words.map((w, k) => ({ w: w.w.toUpperCase(), s: w.s, li: L.i, k }));
    for (const r of r3aTvSplitRows(ws, s => s.length, TP.maxCh)) {
      let col = 0; const words = r.map((w) => { const o = { ...w, col }; col += w.w.length + 1; return o; });
      TP.rows.push({ words, s: r[0].s, line: L.i });
    }
  }
  const c = mkCanvas(256, 256), h = c.getContext('2d'), R = mulberry(5150);
  h.fillStyle = '#f1e48e'; h.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { h.fillStyle = R() < .5 ? 'rgba(255,255,230,.25)' : 'rgba(170,140,50,.12)'; h.fillRect(R() * 256, R() * 256, 1 + R() * 3, 1); }
  TP.paperTile = c;
}
// the paper rises into the lower third just before the first word, and stays
function r3aTvPaperY(t) { return (1 - smooth(clamp((t - r3aTvC.paperUp) / 0.5))) * 300; }
function r3aTvWireLayout(t) {
  const TP = r3aTvTP, out = { rows: [], head: null }, R = TP.rows, nv = TP.nv;
  const started = R.filter(r => r.s <= t + 0.021);
  const next = R.find(r => r.s > t + 0.021);
  // line feed: the paper moves up one row over the 0.14 s before the next row's first word (not before the first)
  // (if the row the feed pushes off the top is still inside its read time, the feed waits and runs quicker)
  let feed = 0;
  if (next && started.length) {
    const leaving = R[R.indexOf(next) - nv];
    let f0 = next.s - 0.14; if (leaving) f0 = Math.max(f0, Math.min(r3aTvReadUntil(leaving.line) + 0.001, next.s - 1 / 48));
    feed = TP.rowH * smooth(clamp((t - f0) / (next.s - f0)));
  }
  const vis = started.slice(-(nv + 1));
  vis.forEach((r, k) => {
    const slot = (nv - 1) - (vis.length - 1 - k);
    const top = TP.band.y + TP.padTop + slot * TP.rowH - feed;
    out.rows.push({ r, top, base: top + TP.cap + 10, ws: r.words.filter(w => w.s <= t + 0.021) });
  });
  if (out.rows.length) {
    const cur = out.rows[out.rows.length - 1], lastW = cur.ws[cur.ws.length - 1];
    out.head = { x: TP.x0 + (lastW.col + lastW.w.length) * TP.adv + 4, base: cur.base, kick: Math.exp(-Math.max(0, t - lastW.s) * 18) };
  } else {
    // waiting on the first word: the head parked at the start of the bottom row
    const base = TP.band.y + TP.padTop + (nv - 1) * TP.rowH + TP.cap + 10;
    out.head = { x: TP.x0 - 6, base, kick: 0 };
  }
  return out;
}
// face boxes the program registered this frame (program coords), so the copy can be tested against them
const r3aTvHeads = [];
function r3aTvHead(x0, y0, x1, y1) { r3aTvHeads.push([x0, y0, x1, y1]); }
function r3aTvDrawWire(g, t) {
  if (t < r3aTvC.paperUp) return;
  const TP = r3aTvTP, bd = TP.band, lay = r3aTvWireLayout(t), dy = r3aTvPaperY(t);
  g.save(); g.translate(0, dy);
  g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(bd.x + 6, bd.y + 8, bd.w, bd.h);
  const tear = (h) => { h.beginPath(); h.moveTo(bd.x, bd.y + bd.h); h.lineTo(bd.x, bd.y + 6);
    for (let x = bd.x, k = 0; x <= bd.x + bd.w; x += 14, k++) h.lineTo(x, bd.y + 6 - (k % 2 ? 5 : 0) - rnd(k, 5) * 4);
    h.lineTo(bd.x + bd.w, bd.y + bd.h); h.closePath(); };
  tear(g); g.fillStyle = '#f1e48e'; g.fill();
  g.save(); tear(g); g.clip();
  g.fillStyle = g.createPattern(TP.paperTile, 'repeat'); g.fillRect(bd.x, bd.y, bd.w, bd.h);
  const yoff = lay.rows.length ? (lay.rows[lay.rows.length - 1].top % TP.rowH) : 0;
  g.strokeStyle = 'rgba(150,120,40,.18)'; g.lineWidth = 2;
  for (let y = bd.y + yoff - TP.rowH; y < bd.y + bd.h + TP.rowH; y += TP.rowH) { g.beginPath(); g.moveTo(bd.x, y + TP.rowH - 6); g.lineTo(bd.x + bd.w, y + TP.rowH - 6); g.stroke(); }
  g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.font = r3aTvFont(TP.fs);
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
    g.save(); g.font = r3aTvFont(TP.fs);
    let hits = 0;
    for (const row of lay.rows) {
      if (row.top < bd.y || row.base > bd.y + bd.h) continue;   // a row mid-feed above the paper's top is leaving
      for (const w of row.ws) {
        probeWord(t, w.li, w.k, (tt) => w.s <= tt + 0.021);
        const x = TP.x0 + w.col * TP.adv, y = row.base - TP.cap - 2, ww = w.w.length * TP.adv, hh = TP.cap + 12;
        PROBE.box(g, 'teleprinter', x, y, ww, hh, { keep: true, inScreen: [bd.x, bd.y, bd.w, bd.h], margin: 6 });
        for (const [a0, b0, a1, b1] of r3aTvHeads) if (x < a1 && x + ww > a0 && y < b1 && y + hh > b0) hits++;
      }
    }
    // the paper itself must not cover a face either
    for (const [a0, b0, a1, b1] of r3aTvHeads) if (b1 > bd.y + dy && a1 > bd.x && a0 < bd.x + bd.w) hits++;
    PROBE.value('r3a faces under copy', hits);
    g.restore();
  }
}
// Self-check: every row of every line stays fully on the paper from its first word to its line's read time.
function r3aTvCheckRows() {
  const TP = r3aTvTP, bad = [];
  for (let f = Math.ceil(r3aTvC.l0 * 24); f < Math.round(r3aTvT1 * 24); f++) {
    const t = f / 24, lay = r3aTvWireLayout(t).rows;
    for (const r of TP.rows) {
      const ru = Math.min(r3aTvReadUntil(r.line), r3aTvT1);
      if (t < r.s - 0.021 || t > ru) continue;
      const it = lay.find(x => x.r === r);
      if (!it || !(it.top >= TP.band.y && it.base + 12 <= TP.band.y + TP.band.h)) bad.push(f + ':' + r.line);
    }
  }
  if (bad.length) console.error('r3a wire row leaves before its read time: ' + [...new Set(bad)].slice(0, 30).join(' '));
  return bad;
}
