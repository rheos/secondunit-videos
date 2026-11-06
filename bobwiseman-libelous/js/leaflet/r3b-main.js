// Round 3, agent leaf-B: stanzas 6 and 7 of the fact-sheet version, song 95.916667-165.083333, frames f2302-f3962.
// Two more pages of the couple's leaflet, made exactly like the workers and farms pages (js/leaflet/early.js) and
// the couple's page (main.js): typed copy that types itself on the sung words, a rub-down headline, fineliner
// pictures in the ruled box, the cream master copy, then the run on the page's own paper. Stanza 6 is the
// children's page (lilac), stanza 7 the book page (buff); hard cut between them at 123.125 (f2955), and at
// 165.083333 (f3962) the hard cut to the workers page as it already renders.
// Uses main.js's layout and scratch canvases (TW, MAST, PB, PASS, FS, ADV, LFS, EARLY, MS, mg, PIC, pg, XG, g) and
// early.js's generic copy, typing and camera helpers (drawTypedE, makeCopiesE, genAtE, panelOf, camAtE, passParams).
// Nothing in those files is edited. r3bLeafRenderFrame(t) is a pure function of t; the one cache (the finished stanza-6
// page run off three times, lying under the stanza-7 page in the pile) is a fixed render that never depends on t.

// ---- the two pages ------------------------------------------------------------------------------------------
const r3bLeafRange = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
const R3BLEAF_PAGES = [
  { t0: R3BLEAF_T6, t1: R3BLEAF_T7, lines: r3bLeafRange(41, 49), carry: [40], pic: r3bLeafPic6,
    head: [[43, 6], [43, 7], [43, 8], [43, 9], [43, 10]], quotes: false,
    under: [[44, 5], [47, 4], [47, 5], [49, 2]], paper: [null, '#efebdf', '#ddd2e8', '#d4c8e1'], gens: [R3BLEAF_T6, R3BLEAF.l46, R3BLEAF.l48],
    panels: [R3BLEAF_T6, R3BLEAF.l44, R3BLEAF.l45, R3BLEAF.l46, R3BLEAF.l47, R3BLEAF.l48, R3BLEAF.l49],
    camT: [R3BLEAF_T6, R3BLEAF.l43 + 1.0, R3BLEAF.l44, R3BLEAF.l45, R3BLEAF.l46, R3BLEAF.l47, R3BLEAF.l48, R3BLEAF.l49], // close first; widen for the headline
    cams: [[1000, 640, 1.06, 1.075], [1000, 576, .972, .985], [1000, 590, .99, 1.005], [1000, 588, 1.0, 1.012], [1000, 590, 1.0, 1.01], [1000, 588, .99, 1.005], [1000, 590, 1.0, 1.015], [1000, 586, .985, 1.0]] },
  { t0: R3BLEAF_T7, t1: R3BLEAF_T8, lines: r3bLeafRange(50, 64), carry: [49], pic: r3bLeafPic7,
    head: [[50, 2], [50, 3], [50, 4]], quotes: false,
    under: [[55, 7], [57, 1], [57, 2], [59, 9], [63, 5]], paper: [null, '#efebdf', '#efd6b6', '#e9cdab'], gens: [R3BLEAF_T7, R3BLEAF.l56, R3BLEAF.l64],
    panels: [R3BLEAF_T7, R3BLEAF.l52, R3BLEAF.l53, R3BLEAF.l55, R3BLEAF.l56, R3BLEAF.l58, R3BLEAF.l59, R3BLEAF.l60, R3BLEAF.l62, R3BLEAF.l64],
    camT: [R3BLEAF_T7, R3BLEAF.tons - .6, R3BLEAF.l52, R3BLEAF.l53, R3BLEAF.l55, R3BLEAF.l56, R3BLEAF.l58, R3BLEAF.l59, R3BLEAF.l60, R3BLEAF.l62, R3BLEAF.l64],
    cams: [[1000, 640, 1.06, 1.075], [1000, 576, .972, .985], [1000, 590, 1.0, 1.01], [1000, 588, .99, 1.005], [1000, 590, 1.0, 1.012], [1000, 586, 1.01, 1.0], [1000, 590, .995, 1.01], [1000, 588, 1.0, 1.012], [1000, 590, .99, 1.005], [1000, 588, 1.0, 1.01], [1000, 562, .9, .915]] },
];
const r3bLeafPageOf = t => (t < R3BLEAF_T7 ? 0 : 1);

// ---- typed rows: same typewriter, rows and feed as the other pages; a long line breaks into the fewest rows
// that fit, balanced (two or three) ------------------------------------------------------------------------------
function r3bLeafSplit(words, maxC) {
  const len = (a, b) => words.slice(a, b).reduce((s, w) => s + w.w.length, 0) + (b - a - 1);
  for (let n = 1; n <= 4; n++) { // the fewest rows, then the split whose longest row is shortest
    let best = null;
    const go = (start, left, cuts, worst) => {
      if (left === 1) { const l = len(start, words.length); if (l <= maxC && (!best || Math.max(worst, l) < best[0])) best = [Math.max(worst, l), cuts.slice()]; return; }
      for (let k = start + 1; k <= words.length - left + 1; k++) { const l = len(start, k); if (l > maxC) break; cuts.push(k); go(k, left - 1, cuts, Math.max(worst, l)); cuts.pop(); }
    };
    go(0, n, [], 0);
    if (best) return best[1];
  }
  throw new Error('line too long for the typed window');
}
function r3bLeafLayout(m) {
  m.font = TYPE_FONT.replace('{s}', FS);
  const maxC = Math.floor((TW.right - TW.x) / ADV);
  for (const P of R3BLEAF_PAGES) {
    P.rows = []; let r = 0;
    for (const i of [...P.carry, ...P.lines]) {
      const l = R3BLEAF_L[i], carried = P.carry.includes(i);
      const words = l.words.map((w, k) => ({ w: w.w, s: w.s, e: w.e, k }));
      const parts = []; let k0 = 0; for (const k of [...r3bLeafSplit(words, maxC), words.length]) { parts.push(words.slice(k0, k)); k0 = k; }
      for (const part of parts) {
        let col = 0;
        for (const w of part) { w.col = col; col += w.w.length + 1; w.dt = Math.min(.042, .75 * (w.e - w.s) / w.w.length); }
        P.rows.push({ r: r++, line: i, s: carried ? P.t0 - 10 : part[0].s, carried, words: part });
      }
    }
    const words = P.head.map(([i, k]) => r3bLeafUP(i, k));
    let fs = LFS; const fit = (s) => { let w = 0; words.forEach((x, j) => { w += letraWidth(m, x, s) + (j ? s * .28 : 0); }); return w; };
    while (fs > 60 && fit(fs) > 1880 - MAST.x - 20) fs -= 2;
    P.headFS = fs; P.headWords = words;
  }
}

// ---- the headline: rub-down letters on the sung words, a mittened hand with a burnisher (as early.js) ---------
function r3bLeafDrawHead(m, t, P) {
  const fs = P.headFS, dt = .055, y = MAST.base;
  pen(m, seg(MAST.x, 240, 1880, 236, 30), pr(t, P.t0 - .3, .3), 5, 910 + P.t0); pen(m, seg(MAST.x, 248, 1880, 245, 30), pr(t, P.t0 - .25, .3), 3, 911 + P.t0);
  const starts = P.head.map(([i, k]) => r3bLeafS(i, k) - EARLY);
  let x = MAST.x; const cur = [];
  P.headWords.forEach((wd, j) => {
    if (j) x += fs * .28;
    const a = letraWord(m, wd, x, y, fs, t, starts[j], dt, 920 + j * 10 + P.t0);
    a.chars.forEach((c, n) => cur.push([c, starts[j] + n * dt])); x = a.x1;
  });
  if (R3BLEAF_BOX.on && t >= starts[0]) R3BLEAF_BOX.labels.push([MAST.x, y - fs * .78, x - MAST.x, fs * .8, 'headline', true]);
  const tEnd = cur[cur.length - 1][1] + .1, tIn = starts[0] - .55;
  if (t > tIn && t < tEnd + .5) {
    let c = cur[0][0]; for (const [cc, tt] of cur) if (t >= tt) c = cc;
    const tx = (c[0] + c[1]) / 2 + Math.sin(t * 70) * 10;
    const come = ease(t, tIn, starts[0] - .05), go = ease(t, tEnd, tEnd + .4);
    const hx = lerp(2300, tx, come) + go * 900, hy = y - 50;
    m.save(); m.translate(hx, hy);
    const wx = 150, wy2 = -70, ang = Math.atan2(-wy2, -wx), items = [];
    m.fillStyle = '#fff'; fillPoly(m, [[wx - 10, wy2 - 42], [wx + 14, wy2 + 40], [720, -10], [720, -150]]);
    items.push({ p: seg(2, 0, 88, -42, 4), w: 8, amp: .5 });
    items.push({ p: seg(wx - 10, wy2 - 42, 720, -150, 10), w: 5.5 }, { p: seg(wx + 14, wy2 + 40, 720, -10, 10), w: 5.5 });
    items.push({ p: seg(wx + 4, wy2 - 46, wx + 26, wy2 + 42, 3), w: 5 });
    mitten(items, wx, wy2, ang, 95 / .13, 5.5, false, -1);
    drawSet(m, items, 1, 940);
    m.restore();
  }
}

// ---- the master paste-up for a page ---------------------------------------------------------------------------
function r3bLeafDrawMaster(P, t) {
  const m = mg; m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = 1; m.globalCompositeOperation = 'source-over'; m.filter = 'none';
  m.fillStyle = '#fff'; m.fillRect(0, 0, SW, SH);
  drawTypedE(m, t, P);
  const p = pg, pi = panelOf(P, t);
  p.setTransform(1, 0, 0, 1, 0, 0); p.globalAlpha = 1; p.globalCompositeOperation = 'source-over'; p.fillStyle = '#fff'; p.fillRect(0, 0, PBW, PBH);
  P.pic(p, t, pi);
  m.save(); m.translate(PB.x, PB.y);
  m.strokeStyle = 'rgba(0,0,0,.45)'; m.lineWidth = 1.6; m.strokeRect(-14, -12, PBW + 28, PBH + 22);
  m.drawImage(PIC, 0, 0);
  pen(m, poly([[0, 0], [PBW, 0], [PBW, PBH], [0, PBH]], true), pr(t, P.t0 - .5, .4), 6, 900 + P.t0, 1.2);
  m.restore();
  r3bLeafDrawHead(m, t, P);
}

// The finished stanza-6 page run off three times: it lies under the stanza-7 page in the pile. Fixed render.
const R3BLEAF_P6 = { cv: null };
function r3bLeafP6Copy() {
  if (R3BLEAF_P6.cv) return R3BLEAF_P6.cv;
  const P = R3BLEAF_PAGES[0], t = R3BLEAF_T7 - 1 / 24, pi = panelOf(P, t);
  r3bLeafDrawMaster(P, t);
  for (let k = 1; k <= 3; k++) xpass(XG[k - 1], XG[k], passParams(P, k, false, pi, 0), null);
  const c = mkCanvas(SW, SH); c.getContext('2d').drawImage(XG[3], 0, 0); solidAreas(c, .32, 3, 150, 90);
  R3BLEAF_P6.cv = c; return c;
}

function r3bLeafRenderFrame(t) {
  const f = Math.round(t * 24), P = R3BLEAF_PAGES[r3bLeafPageOf(t)];
  buildXerox();
  const [G0] = genAtE(P, t), pile = P === R3BLEAF_PAGES[1] && G0 >= 3;
  const p6 = pile ? r3bLeafP6Copy() : null; // before this frame's master: it borrows the scratch canvases
  r3bLeafDrawMaster(P, t);
  const G = makeCopiesE(P, t, f);
  const [, tsG] = genAtE(P, t);
  const cam = camAtE(P, t);
  const land = 1 + .028 * (1 - smooth((t - tsG) / .12)) * (tsG > P.t0 ? 1 : 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  const bg = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200); bg.addColorStop(0, '#3a3631'); bg.addColorStop(1, '#1d1b19');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  if (pile) { // the pile: the finished children's page (lilac) under this page's earlier copy (buff)
    const sheets = [[p6, R3BLEAF_PAGES[0].paper[3], { dx: -74, dy: 40, r: -.026 }, 3], [XG[2], P.paper[2], { dx: 58, dy: -34, r: .017 }, 2]];
    for (const [cv, paper, us, k] of sheets) {
      g.save(); g.translate(SW / 2 + us.dx, SH / 2 + us.dy); g.rotate(us.r); g.translate(-SW / 2, -SH / 2);
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 4; g.fillStyle = paper; g.fillRect(0, 0, SW, SH); g.shadowColor = 'transparent';
      printCopy(g, cv, paper, .05, k * 40 + 13, k * 70 + 29); g.restore();
    }
  }
  g.save(); g.translate(SW / 2, SH / 2); g.scale(land, land); g.translate(-SW / 2, -SH / 2);
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 22; g.shadowOffsetY = 6; g.fillStyle = P.paper[G]; g.fillRect(0, 0, SW, SH); g.shadowColor = 'transparent';
  printCopy(g, XG[G], P.paper[G], .04 + G * .012, G * 40, G * 70);
  if (pile) { // a staple through the pile, top left
    g.save(); g.translate(70, 64); g.rotate(-.62);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-36, 3, 74, 7);
    const sg = g.createLinearGradient(0, -4, 0, 4); sg.addColorStop(0, '#d8d8d4'); sg.addColorStop(.5, '#8d8d88'); sg.addColorStop(1, '#55554f');
    g.fillStyle = sg; g.fillRect(-38, -3, 76, 6); g.restore();
  }
  g.restore();
  g.restore();
  drawGrain(g, t, .05);
}

// ---- checks (debug only, draw nothing on screen) --------------------------------------------------------------
// Captions: every line from its first onset (or this span's start) to the later of the next line's start and 1.2 s
// after its last word (cut at the span's end) sits whole in the frame on the page that's showing; cap >= 44 px.
window.__r3bLeafAudit = () => {
  const bad = [], C = [SW / 2, SH / 2]; let minCap = 1e9, minMargin = 1e9;
  const all = R3BLEAF_LINES.filter(l => l.i >= 40);
  const need = all.map((l, i) => [Math.max(R3BLEAF_T6, l.words[0].s - EARLY), Math.min(R3BLEAF_T8, Math.max(i + 1 < all.length ? all[i + 1].s : R3BLEAF_T8, l.words[l.words.length - 1].e + 1.2))]);
  const f0 = Math.round(R3BLEAF_T6 * 24), f1 = Math.round(R3BLEAF_T8 * 24);
  for (let fi = f0; fi < f1; fi++) {
    const t = fi / 24, P = R3BLEAF_PAGES[r3bLeafPageOf(t)], [G, tsG] = genAtE(P, t), pi = panelOf(P, t), cam = camAtE(P, t), sp = scrollPosE(P, t);
    const land = 1 + .028 * (1 - smooth((t - tsG) / .12)) * (tsG > P.t0 ? 1 : 0);
    const map = (x, y) => { for (let k = 1; k <= G; k++) { const Q = passParams(P, k, false, pi, 0);
        const ux = (x - C[0]) * Q.sc, uy = (y - C[1]) * Q.sc; x = C[0] + Q.dx + ux * Math.cos(Q.rot) - uy * Math.sin(Q.rot); y = C[1] + Q.dy + ux * Math.sin(Q.rot) + uy * Math.cos(Q.rot); }
      x = (x - C[0]) * land + C[0]; y = (y - C[1]) * land + C[1]; return [(x - cam.cx) * cam.z + W / 2, (y - cam.cy) * cam.z + H / 2]; };
    let sc = land * cam.z; for (let k = 1; k <= G; k++) sc *= PASS[k].sc; minCap = Math.min(minCap, TW.cap * sc);
    all.forEach((l, li) => {
      if (t < need[li][0] || t > need[li][1]) return;
      const rows = P.rows.filter(r => r.line === l.i && t >= r.s - EARLY);
      if (!rows.length) { bad.push({ t: +t.toFixed(3), line: l.i, why: 'missing' }); return; }
      for (const row of rows) {
        const slot = row.r - sp, y = TW.base + slot * TW.pitch, last = row.words[row.words.length - 1], x1 = TW.x + (last.col + last.w.length) * ADV;
        if (slot < -.001 || slot > 3.001) { bad.push({ t: +t.toFixed(3), line: l.i, row: row.r, why: 'scrolled out', slot: +slot.toFixed(2) }); continue; }
        for (const [px, py] of [[TW.x, y - TW.cap - 6], [x1, y - TW.cap - 6], [TW.x, y + FS * .24], [x1, y + FS * .24]]) {
          const [sx, sy] = map(px, py), mm = Math.min(sx, W - sx, sy, H - sy); minMargin = Math.min(minMargin, mm);
          if (mm < 10) bad.push({ t: +t.toFixed(3), line: l.i, row: row.r, why: 'off frame', sx: Math.round(sx), sy: Math.round(sy) });
        }
      }
    });
  }
  return { bad: bad.slice(0, 40), nBad: bad.length, minCap: +minCap.toFixed(1), minMargin: Math.round(minMargin) };
};
// Faces: on every frame, no caption (typed row, headline) and no lettering in the pictures crosses a head.
// Draws each frame's master only (no copies), collecting head and lettering boxes in master coordinates.
window.__r3bLeafFaces = (step = 1) => {
  const hits = []; let frames = 0, heads = 0, texts = 0;
  const f0 = Math.round(R3BLEAF_T6 * 24), f1 = Math.round(R3BLEAF_T8 * 24);
  const inter = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
  for (let fi = f0; fi < f1; fi += step) {
    const t = fi / 24, P = R3BLEAF_PAGES[r3bLeafPageOf(t)], sp = scrollPosE(P, t);
    R3BLEAF_BOX.on = true; R3BLEAF_BOX.heads = []; R3BLEAF_BOX.labels = [];
    r3bLeafDrawMaster(P, t);
    R3BLEAF_BOX.on = false;
    const H = R3BLEAF_BOX.heads.map(b => [b[0] + PB.x, b[1] + PB.y, b[2], b[3]]);
    const T = R3BLEAF_BOX.labels.map(b => b[5] ? b : [b[0] + PB.x, b[1] + PB.y, b[2], b[3], b[4]]);
    for (const row of P.rows) { const slot = row.r - sp; if (slot < -1.05 || slot > 3.05 || t < row.s - EARLY) continue; const y = TW.base + slot * TW.pitch, last = row.words[row.words.length - 1]; T.push([TW.x, Math.max(TW.y, y - TW.cap - 6), (last.col + last.w.length) * ADV, TW.cap + 6 + FS * .24, 'typed']); }
    frames++; heads += H.length; texts += T.length;
    for (const h of H) for (const x of T) if (inter(h, x)) hits.push({ f: fi, text: x[4], head: h.map(Math.round) });
  }
  return { frames, heads, texts, nHits: hits.length, hits: hits.slice(0, 30) };
};
window.__r3bLeafRows = () => R3BLEAF_PAGES.map(P => P.rows.map(r => ({ r: r.r, line: r.line, s: r.s, carried: r.carried, n: r.words.map(w => w.w).join(' ').length })));

const r3bLeafReady = READY.then(() => { r3bLeafLayout(mkCanvas(10, 10).getContext('2d')); return true; });
startPage = r3bLeafStartPage; // hand the harness back
r3bLeafStartPage(out, r3bLeafRenderFrame, R3BLEAF_T6, R3BLEAF_T8, r3bLeafReady);
