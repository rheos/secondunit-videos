// tv-B captions: the news bulletin's wire copy for stanzas 6-10, the same strip of canary teleprinter paper as
// round 2's stanza 11 (js/tv/r2_captions.js), so the two read as one bulletin: Courier New Bold capitals squeezed
// to 26 columns, cap 36 signal px, each word typed on its onset with a little ink jitter and a double strike,
// the grey print head riding the row, a 0.14 s line feed before each new row. Drawn into the broadcast signal
// (960x720), so the tube renders it. Every row of a line stays on the paper until the line's read time (next
// line's start, or 1.2 s after its last word, whichever is later); r3bTvCheckRows() proves it at load.
const R3BTV_TP = { band: { x: 46, y: 430, w: 868, h: 252 }, nv: 4, rowH: 58, padTop: 14, x0: 74, cap: 36, maxCh: 26, rows: [] };
function r3bTvInitTP(g) {
  const P = R3BTV_TP;
  let fs = 40; for (; fs < 120; fs++) { g.font = tpFont(fs); if (g.measureText('H').actualBoundingBoxAscent >= P.cap) break; }
  P.fs = fs; g.font = tpFont(fs); P.adv0 = g.measureText('M').width;
  P.sx = Math.min(1, (P.band.w - 2 * (P.x0 - P.band.x) - 6) / (P.maxCh * P.adv0));
  P.adv = P.adv0 * P.sx;
  for (const l of R3BTV_LINES) {
    const ws = l.words.map((w, k) => ({ w: w.w.toUpperCase(), s: w.s, li: l.i, k }));
    for (const r of splitRows(ws, s => s.length, P.maxCh)) {
      let col = 0; const words = r.map((w) => { const o = { ...w, col }; col += w.w.length + 1; return o; });
      P.rows.push({ words, s: r[0].s, line: l.i });
    }
  }
}
// where every row sits at time t (slot 0 = top of the paper), plus the print head
function r3bTvTPLayout(t) {
  const P = R3BTV_TP, out = { rows: [], head: null }, R = P.rows, nv = P.nv;
  const started = R.filter(r => r.s <= t + 0.021);
  if (!started.length) return out;
  const next = R.find(r => r.s > t + 0.021);
  const feed = next ? P.rowH * smooth(clamp((t - Math.max(R3BTV_T0, next.s - 0.14)) / Math.min(0.14, next.s - R3BTV_T0))) : 0;
  const vis = started.slice(-(nv + 1));
  vis.forEach((r, k) => {
    const slot = (nv - 1) - (vis.length - 1 - k);
    const top = P.band.y + P.padTop + slot * P.rowH - feed;
    out.rows.push({ r, top, base: top + P.cap + 10, ws: r.words.filter(w => w.s <= t + 0.021) });
  });
  const cur = out.rows[out.rows.length - 1];
  const lastW = cur.ws[cur.ws.length - 1];
  out.head = { x: P.x0 + (lastW.col + lastW.w.length) * P.adv + 4, base: cur.base, kick: Math.exp(-Math.max(0, t - lastW.s) * 18) };
  return out;
}
// the boxes the copy occupies at time t (signal px), for the faces check
function r3bTvTPBoxes(t) {
  const P = R3BTV_TP, lay = r3bTvTPLayout(t), out = [];
  for (const row of lay.rows) for (const w of row.ws) out.push([P.x0 + w.col * P.adv, row.base - P.cap - 2, P.x0 + (w.col + w.w.length) * P.adv, row.base + 10]);
  return out;
}
function r3bTvDrawTP(g, t) {
  const P = R3BTV_TP, bd = P.band, lay = r3bTvTPLayout(t);
  g.save();
  g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(bd.x + 6, bd.y + 8, bd.w, bd.h);
  const tear = (h) => { h.beginPath(); h.moveTo(bd.x, bd.y + bd.h); h.lineTo(bd.x, bd.y + 6);
    for (let x = bd.x, k = 0; x <= bd.x + bd.w; x += 14, k++) h.lineTo(x, bd.y + 6 - (k % 2 ? 5 : 0) - rnd(k, 5) * 4);
    h.lineTo(bd.x + bd.w, bd.y + bd.h); h.closePath(); };
  tear(g); g.fillStyle = '#f1e48e'; g.fill();
  g.save(); tear(g); g.clip();
  g.fillStyle = P.paper; g.fillRect(bd.x, bd.y, bd.w, bd.h);
  const yoff = lay.rows.length ? (lay.rows[lay.rows.length - 1].top % P.rowH) : 0;
  g.strokeStyle = 'rgba(150,120,40,.18)'; g.lineWidth = 2;
  for (let y = bd.y + yoff - P.rowH; y < bd.y + bd.h + P.rowH; y += P.rowH) { g.beginPath(); g.moveTo(bd.x, y + P.rowH - 6); g.lineTo(bd.x + bd.w, y + P.rowH - 6); g.stroke(); }
  g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.font = tpFont(P.fs);
  g.beginPath(); g.rect(bd.x, bd.y + 8, bd.w, bd.h - 10); g.clip();
  for (const row of lay.rows) {
    for (const w of row.ws) {
      for (let i = 0; i < w.w.length; i++) {
        const ci = w.col + i, x = P.x0 + ci * P.adv, jy = (rnd(row.r.line, ci, 3) - .5) * 2.4, ink = .78 + rnd(row.r.line, ci, 9) * .22;
        g.save(); g.translate(x, row.base + jy); g.scale(P.sx, 1);
        g.fillStyle = `rgba(28,20,34,${ink})`; g.fillText(w.w[i], 0, 0);
        g.fillStyle = `rgba(28,20,34,${ink * .35})`; g.fillText(w.w[i], 1.2, .6);
        g.restore();
      }
    }
  }
  g.restore();
  if (lay.head) {
    const hx = Math.min(lay.head.x, bd.x + bd.w - 30), hy = lay.head.base - P.cap - 8 - lay.head.kick * 5;
    g.fillStyle = '#5d6168'; g.strokeStyle = '#1e1f24'; g.lineWidth = 2.5;
    g.beginPath(); g.roundRect(hx, hy, 22, P.cap + 18, 4); g.fill(); g.stroke();
    g.fillStyle = '#9aa0a8'; g.fillRect(hx + 4, hy + 4, 14, 6);
    g.fillStyle = '#2a2d33'; g.fillRect(hx + 8, hy + P.cap + 6, 6, 10);
  }
  g.strokeStyle = 'rgba(120,96,30,.6)'; g.lineWidth = 2; tear(g); g.stroke();
  g.restore();
  if (PROBE.on) {
    g.save(); g.font = tpFont(P.fs);
    for (const row of lay.rows) {
      if (row.top < bd.y || row.base > bd.y + bd.h) continue;   // a row mid-feed above the paper's top is leaving
      for (const w of row.ws) {
        probeWord(t, w.li, w.k, (tt) => w.s <= tt + 0.021);
        PROBE.box(g, 'teleprinter', P.x0 + w.col * P.adv, row.base - P.cap - 2, w.w.length * P.adv, P.cap + 12, { keep: true, inScreen: [bd.x, bd.y, bd.w, bd.h], margin: 6 });
      }
    }
    g.restore();
  }
}
// Self-check: every row of every line stays fully on the paper from its first word to its line's read time.
function r3bTvCheckRows() {
  const P = R3BTV_TP, bad = [];
  for (let f = Math.ceil(R3BTV_T0 * 24); f < Math.round(R3BTV_T1 * 24); f++) {
    const t = f / 24, lay = r3bTvTPLayout(t).rows;
    for (const r of P.rows) {
      if (t < r.s - 0.021 || t > r3bTvReadUntil(r.line)) continue;
      const it = lay.find(x => x.r === r);
      if (!it || !(it.top >= P.band.y && it.base + 12 <= P.band.y + P.band.h)) bad.push(f + ':' + r.line);
    }
  }
  if (bad.length) console.error('tv-B caption row leaves before its read time: ' + bad.length + ' frames, ' + [...new Set(bad.map(b => b.split(':')[1]))].join(','));
  return bad;
}
