// Round 3, tv-C: the wire copy for stanzas 12-13, the same canary teleprinter strip as stanza 11
// (r2_captions.js drawTP), copied here under new names so the shared file stays untouched. It carries on from
// stanza 11: lines 108-110 are already on the paper when the span opens, and the paper feeds up for line 111.
// From the refrain on the machine runs hot: the title word is struck in the red half of the ribbon, the head
// glows and the paper warms toward amber, a little more on every shout. Every row of every line stays on the
// paper until its read time; r3cCheckRows() proves it at load and logs an error if not.
const R3C_TP = { band: { x: 46, y: 468, w: 868, h: 214 }, nv: 3, rowH: 62, padTop: 20, x0: 74, cap: 36, maxCh: 26, rows: [] };
function r3cInitTP(g) {
  let fs = 40; for (; fs < 120; fs++) { g.font = tpFont(fs); if (g.measureText('H').actualBoundingBoxAscent >= R3C_TP.cap) break; }
  R3C_TP.fs = fs; g.font = tpFont(fs); R3C_TP.adv0 = g.measureText('M').width;
  R3C_TP.sx = Math.min(1, (R3C_TP.band.w - 2 * (R3C_TP.x0 - R3C_TP.band.x) - 6) / (R3C_TP.maxCh * R3C_TP.adv0));
  R3C_TP.adv = R3C_TP.adv0 * R3C_TP.sx;
  for (let li = 108; li <= 131; li++) {
    const ws = R3C_LN[li].words.map((w, k) => ({ w: w.w.toUpperCase(), s: w.s, li, k, red: li >= 125 && k === R3C_LN[li].words.length - 1 }));
    for (const r of splitRows(ws, s => s.length, R3C_TP.maxCh)) {
      let col = 0; const words = r.map((w) => { const o = { ...w, col }; col += w.w.length + 1; return o; });
      R3C_TP.rows.push({ words, s: r[0].s, line: li });
    }
  }
}
function r3cTPLayout(t) {
  const out = { rows: [], head: null }, R = R3C_TP.rows, nv = R3C_TP.nv;
  const started = R.filter(r => r.s <= t + 0.021);
  if (!started.length) return out;
  const next = R.find(r => r.s > t + 0.021);
  // line feed: the paper moves up one row over the 0.14 s before the next row's first word
  const feed = next ? R3C_TP.rowH * smooth(clamp((t - (next.s - 0.14)) / 0.14)) : 0;
  const vis = started.slice(-(nv + 1));
  vis.forEach((r, k) => {
    const slot = (nv - 1) - (vis.length - 1 - k);
    const top = R3C_TP.band.y + R3C_TP.padTop + slot * R3C_TP.rowH - feed;
    out.rows.push({ r, top, base: top + R3C_TP.cap + 10, ws: r.words.filter(w => w.s <= t + 0.021) });
  });
  const cur = out.rows[out.rows.length - 1];
  const lastW = cur.ws[cur.ws.length - 1];
  out.head = { x: R3C_TP.x0 + (lastW.col + lastW.w.length) * R3C_TP.adv + 4, base: cur.base, kick: Math.exp(-Math.max(0, t - lastW.s) * 18), red: lastW.red, since: t - lastW.s };
  return out;
}
// how hot the machine is running: 0 through the court report, up on every shout of the refrain
function r3cHeat(t) {
  let h = 0;
  for (const s of R3CQ.libelous) h += 0.16 * smooth(clamp((t - s) / 0.6));
  for (const s of R3CQ.held) h += 0.12 * smooth(clamp((t - s) / 1.5));
  return Math.min(1, h);
}
function r3cDrawTP(g, t) {
  const bd = R3C_TP.band, lay = r3cTPLayout(t), heat = r3cHeat(t);
  g.save();
  g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(bd.x + 6, bd.y + 8, bd.w, bd.h);
  const tear = (h) => { h.beginPath(); h.moveTo(bd.x, bd.y + bd.h); h.lineTo(bd.x, bd.y + 6);
    for (let x = bd.x, k = 0; x <= bd.x + bd.w; x += 14, k++) h.lineTo(x, bd.y + 6 - (k % 2 ? 5 : 0) - rnd(k, 5) * 4);
    h.lineTo(bd.x + bd.w, bd.y + bd.h); h.closePath(); };
  tear(g); g.fillStyle = '#f1e48e'; g.fill();
  g.save(); tear(g); g.clip();
  g.fillStyle = R3C_TP.paper; g.fillRect(bd.x, bd.y, bd.w, bd.h);
  // running hot: the paper warms toward amber, scorched a little along the torn edge
  if (heat > 0) {
    g.fillStyle = `rgba(240,150,40,${0.22 * heat})`; g.fillRect(bd.x, bd.y, bd.w, bd.h);
    const sg2 = g.createLinearGradient(0, bd.y, 0, bd.y + 26); sg2.addColorStop(0, `rgba(120,50,10,${0.55 * heat})`); sg2.addColorStop(1, 'rgba(120,50,10,0)');
    g.fillStyle = sg2; g.fillRect(bd.x, bd.y, bd.w, 26);
  }
  const yoff = lay.rows.length ? (lay.rows[lay.rows.length - 1].top % R3C_TP.rowH) : 0;
  g.strokeStyle = 'rgba(150,120,40,.18)'; g.lineWidth = 2;
  for (let y = bd.y + yoff - R3C_TP.rowH; y < bd.y + bd.h + R3C_TP.rowH; y += R3C_TP.rowH) { g.beginPath(); g.moveTo(bd.x, y + R3C_TP.rowH - 6); g.lineTo(bd.x + bd.w, y + R3C_TP.rowH - 6); g.stroke(); }
  g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.font = tpFont(R3C_TP.fs);
  g.beginPath(); g.rect(bd.x, bd.y + 8, bd.w, bd.h - 10); g.clip();
  for (const row of lay.rows) {
    for (const w of row.ws) {
      const inkC = w.red ? [176, 24, 30] : [28, 20, 34];
      for (let i = 0; i < w.w.length; i++) {
        const ci = w.col + i, x = R3C_TP.x0 + ci * R3C_TP.adv, jy = (rnd(row.r.line, ci, 3) - .5) * 2.4, ink = .8 + rnd(row.r.line, ci, 9) * .2;
        g.save(); g.translate(x, row.base + jy); g.scale(R3C_TP.sx, 1);
        g.fillStyle = rgb(inkC, ink); g.fillText(w.w[i], 0, 0);
        g.fillStyle = rgb(inkC, ink * .35); g.fillText(w.w[i], 1.2, .6);   // the hammer's double strike
        if (w.red) { g.fillStyle = rgb(inkC, ink * .3); g.fillText(w.w[i], -1, -.6); }   // struck hard: a third ghost
        g.restore();
      }
    }
  }
  g.restore();
  // the print head: grey, glowing red-hot for a moment after it strikes the red word
  if (lay.head) {
    const hx = Math.min(lay.head.x, bd.x + bd.w - 30), hy = lay.head.base - R3C_TP.cap - 8 - lay.head.kick * (lay.head.red ? 9 : 5);
    const glow = clamp(heat * .5 + (lay.head.red ? Math.exp(-Math.max(0, lay.head.since) * 1.2) * .8 : 0));
    g.fillStyle = rgb(mix([93, 97, 104], [230, 90, 30], glow)); g.strokeStyle = '#1e1f24'; g.lineWidth = 2.5;
    g.beginPath(); g.roundRect(hx, hy, 22, R3C_TP.cap + 18, 4); g.fill(); g.stroke();
    g.fillStyle = rgb(mix([154, 160, 168], [255, 200, 90], glow)); g.fillRect(hx + 4, hy + 4, 14, 6);
    g.fillStyle = '#2a2d33'; g.fillRect(hx + 8, hy + R3C_TP.cap + 6, 6, 10);
    if (glow > .05) { g.save(); g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(hx + 11, hy + 26, 2, hx + 11, hy + 26, 44); rg.addColorStop(0, `rgba(255,120,40,${.45 * glow})`); rg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = rg; g.fillRect(hx - 40, hy - 20, 102, 100); g.restore(); }
  }
  g.strokeStyle = 'rgba(120,96,30,.6)'; g.lineWidth = 2; tear(g); g.stroke();
  g.restore();
  if (PROBE.on) {
    g.save(); g.font = tpFont(R3C_TP.fs);
    for (const row of lay.rows) {
      if (row.top < bd.y || row.base > bd.y + bd.h) continue;   // a row mid-feed above the paper's top is leaving
      for (const w of row.ws) {
        probeWord(t, w.li, w.k, (tt) => w.s <= tt + 0.021);
        const x = R3C_TP.x0 + w.col * R3C_TP.adv;
        PROBE.box(g, 'teleprinter', x, row.base - R3C_TP.cap - 2, w.w.length * R3C_TP.adv, R3C_TP.cap + 12, { keep: true, inScreen: [bd.x, bd.y, bd.w, bd.h], margin: 6 });
      }
    }
    g.restore();
  }
}
// Self-check: every row of every line stays on the paper from its first word to its line's read time.
function r3cCheckRows() {
  const bad = [];
  for (let f = 6276; f < Math.round(R3CQ.stripOff * 24) + 1; f++) {
    const t = f / 24; if (t > R3CQ.stripOff) break;
    const lay = r3cTPLayout(t).rows;
    for (const r of R3C_TP.rows) {
      if (t < r.s - 0.021 || t > r3cReadUntil(r.line)) continue;
      const it = lay.find(x => x.r === r);
      if (!it || !(it.top >= R3C_TP.band.y && it.base + 12 <= R3C_TP.band.y + R3C_TP.band.h)) bad.push(f + ':' + r.line);
    }
  }
  if (bad.length) console.error('r3c caption row leaves before its read time: ' + [...new Set(bad)].slice(0, 30).join(' '));
  return bad;
}
