// Round 3, leaf-A: the photocopied fact sheet from the top of the song, 0-95.916667 s, song frames f0-f2302.
// The intro (instrumental) and stanzas 1-5 as six pages of the couple's leaflet, made the way the round-1/2 pages are
// (js/leaflet/main.js, early.js): typed copy, a rub-down headline on the sung words, fineliner pictures in the ruled
// box, then run off on the copier (a cream copy of the paste-up, then copies on the page's own paper).
// Loads the kit read-only (core.js, xerox.js, ink.js, pictures.js, early.js for its small drawings); every name here
// starts with r3a / R3A. The pictures are in r3a-pics.js (loaded before this file).
// renderFrame (r3aRender) is a pure function of song time t. The one cache (the stanza-4 page run off three times,
// lying under the stanza-5 page in the pile) is a fixed render that never depends on t.
const r3aOut = document.getElementById('c'); r3aOut.width = W; r3aOut.height = H;
const r3aG = r3aOut.getContext('2d');
const R3A_T0 = 0, R3A_T1 = 95.916667;
const R3A_EARLY = .035; // a letter may land up to one frame before its onset (same as the round-1 page)

// ---- words and times (all from source/lines.json via gen/r3a_lines.js) ---------------------------------------
const r3aLN = {}; R3A_LINES.forEach(l => { r3aLN[l.i] = l; });
const r3aW = (i, k) => { const a = r3aLN[i].words; return a[k < 0 ? a.length + k : k]; };
const r3aS = (i, k) => r3aW(i, k).s;
const r3aL = i => r3aLN[i].s;
const r3aRange = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };

// ---- master layout (copy pixels, SW x SH): the same sheet as the round-1/2 pages -------------------------------
const R3A_MAST = { x: 130, base: 222, cap: 128 };
const R3A_PB = { x: 100, y: 255 };
const R3A_TW = { x: 165, y: 662, h: 420, base: 728, pitch: 104, cap: 54, right: 1850 };
let r3aFS = 94, r3aADV = 56, r3aLFS = 178;
// per copy pass (copied from main.js PASS): how the sheet lay on the glass and how hard the drum bit
const R3A_PASS = [null,
  { rot: -.0062, dx: -10, dy: 7, sc: .955, blur: 2.0, bright: .9, con: 5, edge: 2.2, sat: 2, satR: 4, satB: .543, satC: 2.3 },
  { rot: .0085, dx: 15, dy: -8, sc: 1.0, blur: 1.15, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: -.0068, dx: -17, dy: 10, sc: 1.0, blur: 1.15, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: .0058, dx: 9, dy: 12, sc: 1.0, blur: 1.2, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: -.0095, dx: -7, dy: -13, sc: 1.0, blur: 1.2, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
];

// ---- the intro's beats: onset analysis of the mix (the same grid the woodcut intro uses, js/woodcut/timing.js) --
const R3A_THUMP = 1.48;
const R3A_ORN = [2.51, 3.16, 3.81, 4.46, 5.10, 5.75, 6.41, 7.05, 7.71, 8.36, 9.01, 9.65, 10.30, 10.96, 11.61, 12.26, 12.90];

// ---- the pages ---------------------------------------------------------------------------------------------------
// t0/t1: the page is on the glass (hard cuts between pages). lines: typed on this page. carry: the last line of the
// page before, already typed at the top of the column (the text runs on, so it stays readable across the cut).
// head: the rub-down headline [line, word] on the sung words; cross: a marker strikes the headline through.
// under: felt-marker underlines [line, word, double]. gens: when each copy lands (gen 1 = the cream copy of the
// paste-up, then the run on the page's paper). panels: cuts inside the picture box. cams: [cx, cy, z0, z1] per camT.
const R3A_PAGES = [
  { key: 'intro', t0: 0, t1: r3aL(0) - R3A_EARLY, lines: [], carry: [], head: [], under: [],
    paper: [null, '#efebdf', '#eee9dc', '#ece6d7', '#eae3d3', '#e8e0cf'], gens: [0, R3A_THUMP, R3A_ORN[4], R3A_ORN[8], R3A_ORN[12]],
    panels: [0], camT: [0], cams: [[1000, 452, 1.16, .985, 600]] },
  { key: 'chain', t0: r3aL(0) - R3A_EARLY, t1: 34.416667, lines: r3aRange(0, 10), carry: [],
    head: [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5]], under: [[0, 4], [9, 5]],
    paper: [null, '#efebdf', '#dcd3e9', '#d6cce6'], gens: [r3aL(0) - R3A_EARLY, r3aL(5), r3aL(9)],
    panels: [r3aL(0) - R3A_EARLY, r3aL(5), r3aL(8)],
    camT: [r3aL(0) - R3A_EARLY, r3aS(1, 1) - .6, r3aL(5), r3aL(8)],
    cams: [[1000, 640, 1.06, 1.075], [1000, 575, .972, .985], [1000, 590, .99, 1.005], [1000, 586, 1.0, .985]] },
  { key: 'ball', t0: 34.416667, t1: 48.375, lines: r3aRange(11, 16), carry: [10],
    head: [[15, 6], [15, 7], [15, 8]], under: [[11, 3], [15, 7]],
    paper: [null, '#efebdf', '#f3cfb9', '#f0c8b0'], gens: [34.416667, r3aL(15), r3aL(16)],
    panels: [34.416667, r3aL(13), r3aL(15), r3aL(16)],
    camT: [34.416667, r3aL(13), r3aL(15), r3aS(15, 6) - .6, r3aL(16)],
    cams: [[1000, 640, 1.06, 1.075], [1000, 636, 1.07, 1.055], [1000, 632, 1.05, 1.06], [1000, 575, .972, .98], [1000, 588, .99, 1.005]] },
  { key: 'land', t0: 48.375, t1: 62.083333, lines: r3aRange(17, 22), carry: [16],
    head: [[19, 6], [19, 7], [19, 8], [19, 9]], under: [[20, 0], [22, 2]],
    paper: [null, '#efebdf', '#efd58e', '#ecce80'], gens: [48.375, r3aL(19), r3aL(21)],
    panels: [48.375, r3aL(19), r3aL(20)],
    camT: [48.375, r3aL(19), r3aS(19, 6) - .6, r3aL(20)],
    cams: [[1000, 640, 1.06, 1.075], [1000, 634, 1.06, 1.05], [1000, 575, .972, .98], [1000, 588, .99, 1.008]] },
  { key: 'easy', t0: 62.083333, t1: 75.416667, lines: r3aRange(23, 30), carry: [22],
    head: [[23, 1], [23, 2], [23, 3], [23, 4]], under: [[28, 4], [30, 4]],
    paper: [null, '#efebdf', '#dcdcd6', '#d4d4ce'], gens: [62.083333, r3aL(27), r3aL(29)],
    panels: [62.083333, r3aL(25), r3aL(27), r3aL(29)],
    cams: [[1000, 575, .972, .985], [1000, 590, .99, 1.0], [1000, 590, 1.0, 1.012], [1000, 586, .99, 1.005]] },
  { key: 'farm', t0: 75.416667, t1: 95.916667, lines: r3aRange(31, 40), carry: [30],
    head: [[31, 0], [31, 1], [31, 2]], cross: r3aS(33, 1), under: [[33, 1], [37, 9], [40, 7, true]],
    paper: [null, '#efebdf', '#cfe5e1', '#c6dfda'], gens: [75.416667, r3aL(33), r3aL(37)],
    panels: [75.416667, r3aL(33), r3aL(35), r3aL(37), r3aL(38), r3aL(40)],
    pile: r3aL(40),
    cams: [[1000, 575, .972, .985], [1000, 590, .99, 1.005], [1000, 590, 1.0, 1.012], [1000, 588, .99, 1.003], [1000, 590, 1.0, 1.01], [1000, 562, .9, .915]] },
];
const r3aPageOf = t => { let i = 0; while (i + 1 < R3A_PAGES.length && R3A_PAGES[i + 1].t0 <= t) i++; return R3A_PAGES[i]; };
const r3aPanelOf = (P, t) => { let i = 0; while (i + 1 < P.panels.length && P.panels[i + 1] - R3A_EARLY <= t) i++; return i; };

// ---- typed rows (the round-1/2 rules: four rows, the column feeds up one row before a fifth starts) --------------
function r3aLayout(m) {
  m.font = TYPE_FONT.replace('{s}', 100); r3aFS = Math.round(R3A_TW.cap / (m.measureText('H').actualBoundingBoxAscent / 100) * 10) / 10;
  m.font = TYPE_FONT.replace('{s}', r3aFS); r3aADV = m.measureText('M').width;
  m.font = LETRA_FONT.replace('{s}', 100); r3aLFS = Math.round(R3A_MAST.cap / (m.measureText('H').actualBoundingBoxAscent / 100));
  m.font = TYPE_FONT.replace('{s}', r3aFS);
  const maxC = Math.floor((R3A_TW.right - R3A_TW.x) / r3aADV);
  for (const P of R3A_PAGES) {
    P.rows = []; let r = 0;
    for (const i of [...P.carry, ...P.lines]) {
      const l = r3aLN[i], carried = P.carry.includes(i);
      const words = l.words.map((w, k) => ({ w: w.w, s: w.s, e: w.e, k }));
      const total = words.reduce((a, w) => a + w.w.length, 0) + words.length - 1;
      let breaks = [];
      if (total > maxC) { // two rows (three if it must), balanced: the breaks that make the longest row shortest
        const len = (a, b) => words.slice(a, b).reduce((s, w) => s + w.w.length, 0) + (b - a - 1);
        let best = null;
        for (let k = 1; k < words.length; k++) { const m = Math.max(len(0, k), len(k, words.length)); if (m <= maxC && (!best || m < best[1])) best = [[k], m]; }
        if (!best) for (let k = 1; k < words.length - 1; k++) for (let j = k + 1; j < words.length; j++) { const m = Math.max(len(0, k), len(k, j), len(j, words.length)); if (m <= maxC && (!best || m < best[1])) best = [[k, j], m]; }
        breaks = best[0];
      }
      const parts = []; let k0 = 0; for (const k of [...breaks, words.length]) { parts.push(words.slice(k0, k)); k0 = k; }
      for (const part of parts) {
        let col = 0;
        for (const w of part) { w.col = col; col += w.w.length + 1; w.dt = Math.min(.042, .75 * (w.e - w.s) / w.w.length); }
        P.rows.push({ r: r++, line: i, s: carried ? P.t0 - 10 : part[0].s, carried, words: part });
      }
    }
    // headline: measured once, shrunk to fit between the margins
    P.headWords = P.head.map(([i, k]) => r3aW(i, k).w.toUpperCase());
    let fs = r3aLFS; const fit = (s) => { let w = 0; P.headWords.forEach((x, j) => { w += letraWidth(m, x, s) + (j ? s * .28 : 0); }); return w; };
    while (P.headWords.length && fs > 60 && fit(fs) > 1880 - R3A_MAST.x - 20) fs -= 2;
    P.headFS = fs;
  }
}
function r3aScroll(P, t) { let s = 0; for (const row of P.rows) if (row.r >= 4) s += smooth((t - (row.s - .2)) / .16); return s; }

function r3aDrawTyped(m, t, P) {
  const sp = r3aScroll(P, t), TW = R3A_TW;
  m.save(); m.beginPath(); m.rect(0, TW.y, SW, TW.h); m.clip();
  m.textBaseline = 'alphabetic';
  if (P.key === 'intro') { // the typist tries the ribbon: a centred row of asterisks, one on every beat (no words)
    const n = R3A_ORN.length, x0 = TW.x + (Math.floor((R3A_TW.right - TW.x) / r3aADV) - (2 * n - 1)) / 2 * r3aADV;
    R3A_ORN.forEach((bt, k) => { if (t >= bt - R3A_EARLY) strike(m, '*', x0 + 2 * k * r3aADV, TW.base + TW.pitch, r3aFS, 7100 + k); });
  }
  for (const row of P.rows) {
    const slot = row.r - sp; if (slot < -1.05 || slot > 3.05 || t < row.s - R3A_EARLY) continue;
    const y = TW.base + slot * TW.pitch;
    for (const w of row.words) {
      if (PROBE.on && !row.carried && t >= w.s - R3A_EARLY) { // audit: first letter on its onset, and a settled row inside the typed window
        probeWord(t, row.line, w.k, (tt) => tt >= w.s - R3A_EARLY && tt >= row.s - R3A_EARLY && tt >= P.t0);
        if (slot > -0.01 && slot < 3.01) { m.font = TYPE_FONT.replace('{s}', r3aFS); m.textAlign = 'left'; PROBE.text(m, "typed caption", w.w, TW.x + w.col * r3aADV, y, [TW.x - 40, TW.y, TW.right - TW.x + 80, TW.h], { margin: 2 }); }
      }
      for (let j = 0; j < w.w.length; j++) {
        if (!row.carried && t < w.s + j * w.dt - R3A_EARLY) break;
        strike(m, w.w[j], TW.x + (w.col + j) * r3aADV, y, r3aFS, 9000 + row.line * 37 + w.col + j);
      }
      const ui = P.under.find(u => u[0] === row.line && u[1] === w.k);
      if (ui) {
        const x0 = TW.x + w.col * r3aADV - 6, x1 = TW.x + (w.col + w.w.length) * r3aADV + 4, u = row.carried ? 1 : pr(t, w.s + .12, .22);
        marker(m, seg(x0, y + 16, x1, y + 12 + (rnd(row.line, 3) - .5) * 6, 10), u, 9, row.line * 7 + 3);
        if (ui[2]) marker(m, seg(x0 + 10, y + 32, x1 - 6, y + 30, 10), row.carried ? 1 : pr(t, w.s + .3, .2), 8, row.line * 9 + 3);
      }
    }
  }
  m.restore();
}

// ---- the headline: rub-down letters on the sung words; a mittened hand with a burnisher rubs each one down ------
function r3aDrawHead(m, t, P) {
  const y = R3A_MAST.base, dt = .055;
  pen(m, seg(R3A_MAST.x, 240, 1880, 236, 30), pr(t, P.t0 - .3, .3), 5, 910 + P.t0); pen(m, seg(R3A_MAST.x, 248, 1880, 245, 30), pr(t, P.t0 - .25, .3), 3, 911 + P.t0);
  if (!P.head.length) return;
  const fs = P.headFS, starts = P.head.map(([i, k]) => r3aS(i, k) - R3A_EARLY);
  let x = R3A_MAST.x; const cur = [], spans = [];
  P.headWords.forEach((wd, j) => {
    if (j) x += fs * .28;
    const a = letraWord(m, wd, x, y, fs, t, starts[j], dt, 3920 + j * 10 + P.t0);
    a.chars.forEach((c, n) => cur.push([c, starts[j] + n * dt])); spans.push([x, a.x1]); x = a.x1;
  });
  if (P.cross && t >= P.cross - R3A_EARLY) { // a felt marker strikes the headline through, word by word
    const x0 = spans[0][0] - 14, x1 = spans[spans.length - 1][1] + 10, yy = y - fs * .36;
    marker(m, seg(x0, yy + 6, x1, yy - 8, 16), pr(t, P.cross - R3A_EARLY, .3), 16, 4401);
    marker(m, seg(x0 + 20, yy + 30, x1 - 16, yy + 18, 16), pr(t, P.cross + .25, .3), 13, 4402);
  }
  const tEnd = cur[cur.length - 1][1] + .1, tIn = starts[0] - .55;
  if (t > tIn && t < tEnd + .5) {
    let c = cur[0][0]; for (const [cc, tt] of cur) if (t >= tt) c = cc;
    const tx = (c[0] + c[1]) / 2 + Math.sin(t * 70) * 10;
    const come = ease(t, tIn, starts[0] - .05), go = ease(t, tEnd, tEnd + .4);
    const hx = lerp(2300, tx, come) + go * 900, hy = y - 50;
    m.save(); m.translate(hx, hy); // burnisher tip at (0,0); a mitten grips it; the sleeve runs off the top right
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

// ---- the master paste-up ---------------------------------------------------------------------------------------
const R3A_MS = mkCanvas(SW, SH), r3aMG = R3A_MS.getContext('2d');
const R3A_PIC = mkCanvas(PBW, PBH), r3aPG = R3A_PIC.getContext('2d');
function r3aDrawMaster(P, t) {
  const m = r3aMG; m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = 1; m.globalCompositeOperation = 'source-over'; m.filter = 'none';
  m.fillStyle = '#fff'; m.fillRect(0, 0, SW, SH);
  r3aDrawTyped(m, t, P);
  const p = r3aPG, pi = r3aPanelOf(P, t);
  p.setTransform(1, 0, 0, 1, 0, 0); p.globalAlpha = 1; p.fillStyle = '#fff'; p.fillRect(0, 0, PBW, PBH);
  R3A_PICS[P.key](p, t, pi, P);
  m.save(); m.translate(R3A_PB.x, R3A_PB.y);
  m.strokeStyle = 'rgba(0,0,0,.45)'; m.lineWidth = 1.6; m.strokeRect(-14, -12, PBW + 28, PBH + 22);
  m.drawImage(R3A_PIC, 0, 0);
  pen(m, poly([[0, 0], [PBW, 0], [PBW, PBH], [0, PBH]], true), P.key === 'intro' ? 1 : pr(t, P.t0 - .5, .4), 6, 3900 + P.t0, 1.2);
  m.restore();
  r3aDrawHead(m, t, P);
}

// ---- copies ------------------------------------------------------------------------------------------------------
const R3A_XG = [R3A_MS]; for (let k = 1; k < R3A_PASS.length; k++) R3A_XG.push(mkCanvas(SW, SH));
function r3aGenAt(P, t) { let G = 1, ts = P.t0; P.gens.forEach((gt, k) => { if (t >= gt - R3A_EARLY) { G = k + 1; ts = gt; } }); return [G, ts]; }
function r3aPass(P, k, last, pi, f2) {
  const Q = Object.assign({}, R3A_PASS[k]), jit = pi + 40 + R3A_PAGES.indexOf(P) * 10;
  if (k === 1) { Q.rot += (rnd(jit, 61) - .5) * .003; Q.dx += (rnd(jit, 62) - .5) * 8; Q.dy += (rnd(jit, 63) - .5) * 6; } // re-laid on the glass for each new paste-up
  if (last) { Q.dx += (rnd(f2, 64) - .5) * 1.4; Q.dy += (rnd(f2, 65) - .5) * 1.4; Q.rot += (rnd(f2, 66) - .5) * .0004; } // every copy sits a hair differently
  Q.nIdx = last ? f2 % 8 : k * 3 + 2; Q.nx = last ? rnd(f2, 67) * 1024 : k * 247; Q.ny = last ? rnd(f2, 68) * 1024 : k * 181;
  return Q;
}
function r3aCopies(P, t, f) {
  const [G] = r3aGenAt(P, t), pi = r3aPanelOf(P, t), f2 = Math.floor(f / 2);
  for (let k = 1; k <= G; k++) xpass(R3A_XG[k - 1], R3A_XG[k], r3aPass(P, k, k === G, pi, f2), null);
  solidAreas(R3A_XG[G], .32, G, G * 50, G * 30);
  return G;
}
// The finished stanza-4 page, run off three times: it lies under the stanza-5 page in the pile. A fixed render
// (the page as it stands on its last frame, fixed noise), built once on first use; never depends on t.
const R3A_UNDER = { cv: null };
function r3aUnderCopy() {
  if (R3A_UNDER.cv) return R3A_UNDER.cv;
  const P = R3A_PAGES[4], t = P.t1 - 1 / 24, pi = r3aPanelOf(P, t);
  r3aDrawMaster(P, t);
  for (let k = 1; k <= 3; k++) xpass(R3A_XG[k - 1], R3A_XG[k], r3aPass(P, k, false, pi, 0), null);
  const c = mkCanvas(SW, SH); c.getContext('2d').drawImage(R3A_XG[3], 0, 0); solidAreas(c, .32, 3, 150, 90);
  R3A_UNDER.cv = c; return c;
}

// ---- camera ------------------------------------------------------------------------------------------------------
function r3aCam(P, t) {
  const T = P.camT || P.panels; let i = 0; while (i + 1 < T.length && T[i + 1] - R3A_EARLY <= t) i++;
  const c = P.cams[i], a = T[i], b = T[i + 1] || P.t1, u = smooth((t - a) / (b - a));
  return { cx: c[0], cy: c[4] !== undefined ? lerp(c[1], c[4], u) : c[1], z: lerp(c[2], c[3], u) };
}

// The red rubber stamp (the king's crown seal), as on the round-1 page; here it lands once, in stanza 3.
const R3A_STAMP = mkCanvas(300, 300);
let r3aStampMade = false;
function r3aMakeStamp() {
  const s = R3A_STAMP.getContext('2d'), c = 150; s.clearRect(0, 0, 300, 300);
  s.strokeStyle = s.fillStyle = '#000';
  s.lineWidth = 14; s.beginPath(); s.arc(c, c, 128, 0, TAU); s.stroke();
  s.lineWidth = 6; s.beginPath(); s.arc(c, c, 104, 0, TAU); s.stroke();
  s.beginPath(); s.moveTo(c - 62, c + 40); s.lineTo(c - 62, c - 30); s.lineTo(c - 31, c + 5); s.lineTo(c, c - 52); s.lineTo(c + 31, c + 5); s.lineTo(c + 62, c - 30); s.lineTo(c + 62, c + 40); s.closePath(); s.fill();
  s.fillRect(c - 66, c + 50, 132, 16);
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; s.beginPath(); s.arc(c + Math.cos(a) * 116, c + Math.sin(a) * 116, 4, 0, TAU); s.fill(); }
  s.globalCompositeOperation = 'destination-out'; const R = mulberry(8181);
  for (let i = 0; i < 900; i++) { const a = R() * TAU, rr = R() * 140; s.globalAlpha = .4 + R() * .6; s.beginPath(); s.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, .8 + R() * 2.4, 0, TAU); s.fill(); }
  const dg = s.createLinearGradient(300, 0, 0, 300); dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(.75, 'rgba(0,0,0,0)'); dg.addColorStop(1, 'rgba(0,0,0,.65)');
  s.globalAlpha = 1; s.fillStyle = dg; s.fillRect(0, 0, 300, 300);
  s.globalCompositeOperation = 'source-in'; s.fillStyle = '#c4161c'; s.fillRect(0, 0, 300, 300);
  r3aStampMade = true;
}
function r3aDrawStamp(g, t, ts, x, y, rot) {
  if (!r3aStampMade) r3aMakeStamp();
  const u = pr(t, ts - R3A_EARLY, .09), sc = lerp(1.35, 1, u), al = u <= 0 ? 0 : .88;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = al; g.drawImage(R3A_STAMP, -150, -150); g.restore();
}

// ---- the frame ---------------------------------------------------------------------------------------------------
function r3aRender(t) {
  const f = Math.round(t * 24), P = r3aPageOf(t), g = r3aG;
  buildXerox();
  const [G0] = r3aGenAt(P, t), pile = P.pile !== undefined && t >= P.pile - R3A_EARLY;
  const under = pile ? r3aUnderCopy() : null; // before this frame's master: it borrows the scratch canvases
  r3aDrawMaster(P, t);
  const G = r3aCopies(P, t, f);
  const [, tsG] = r3aGenAt(P, t);
  const cam = r3aCam(P, t);
  const land = 1 + .028 * (1 - smooth((t - tsG) / .12)) * (tsG > P.t0 ? 1 : 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  const bg = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200); bg.addColorStop(0, '#3a3631'); bg.addColorStop(1, '#1d1b19');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  if (pile) { // the pile: the finished stanza-4 page (grey) under this page's earlier copy
    const sheets = [[under, R3A_PAGES[4].paper[3], { dx: -74, dy: 40, r: -.026 }, 3], [R3A_XG[2], P.paper[2], { dx: 58, dy: -34, r: .017 }, 2]];
    for (const [cv, paper, us, k] of sheets) {
      g.save(); g.translate(SW / 2 + us.dx, SH / 2 + us.dy); g.rotate(us.r); g.translate(-SW / 2, -SH / 2);
      g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 4; g.fillStyle = paper; g.fillRect(0, 0, SW, SH); g.shadowColor = 'transparent';
      printCopy(g, cv, paper, .05, k * 40 + 17, k * 70 + 31); g.restore();
    }
  }
  g.save(); g.translate(SW / 2, SH / 2); g.scale(land, land); g.translate(-SW / 2, -SH / 2);
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 22; g.shadowOffsetY = 6; g.fillStyle = P.paper[G]; g.fillRect(0, 0, SW, SH); g.shadowColor = 'transparent';
  printCopy(g, R3A_XG[G], P.paper[G], .04 + G * .012, G * 40, G * 70);
  if (pile) { // a staple through the pile, top left
    g.save(); g.translate(70, 64); g.rotate(-.62);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-36, 3, 74, 7);
    const sg = g.createLinearGradient(0, -4, 0, 4); sg.addColorStop(0, '#d8d8d4'); sg.addColorStop(.5, '#8d8d88'); sg.addColorStop(1, '#55554f');
    g.fillStyle = sg; g.fillRect(-38, -3, 76, 6); g.restore();
  }
  if (P.key === 'land' && t >= r3aS(22, 4) - R3A_EARLY) r3aDrawStamp(g, t, r3aS(22, 4), 1690, 520, .18); // "do": the seal lands on the parcel
  g.restore();
  g.restore();
  drawGrain(g, t, .05);
}

const R3A_READY = (async () => {
  try { await Promise.all([document.fonts.load('100px "LetraBC"'), document.fonts.load('100px "Courier New"'), document.fonts.load('64px "Marker Felt"')]); } catch (e) { }
  r3aLayout(mkCanvas(10, 10).getContext('2d'));
  buildXerox();
  return true;
})();

// ---- caption audit (debug only, draws nothing) ------------------------------------------------------------------
// For every frame: every line, from its first onset to the later of the next line's start and 1.2 s after its last
// word (cut at the span's end), sits whole inside the frame with cap height >= 44 px; and no caption box (the typed
// rows on screen, the headline) overlaps any figure's head drawn in the picture box (r3aHeads, logged by r3a-pics.js).
window.__auditR3A = () => {
  const bad = [], C = [SW / 2, SH / 2]; let minCap = 1e9, minMargin = 1e9, headPairs = 0, nHeads = 0;
  const all = R3A_LINES;
  const need = all.map((l, i) => [l.words[0].s - R3A_EARLY, Math.min(R3A_T1, Math.max(i + 1 < all.length ? all[i + 1].s : R3A_T1, l.words[l.words.length - 1].e + 1.2))]);
  const f0 = Math.round(R3A_T0 * 24), f1 = Math.round(R3A_T1 * 24);
  for (let fi = f0; fi < f1; fi++) {
    const t = fi / 24, P = r3aPageOf(t), [G, tsG] = r3aGenAt(P, t), pi = r3aPanelOf(P, t), cam = r3aCam(P, t), sp = r3aScroll(P, t);
    const land = 1 + .028 * (1 - smooth((t - tsG) / .12)) * (tsG > P.t0 ? 1 : 0);
    const map = (x, y) => { for (let k = 1; k <= G; k++) { const Q = r3aPass(P, k, false, pi, 0); // the per-frame jitter (under 1 px) is left out
        const ux = (x - C[0]) * Q.sc, uy = (y - C[1]) * Q.sc; x = C[0] + Q.dx + ux * Math.cos(Q.rot) - uy * Math.sin(Q.rot); y = C[1] + Q.dy + ux * Math.sin(Q.rot) + uy * Math.cos(Q.rot); }
      x = (x - C[0]) * land + C[0]; y = (y - C[1]) * land + C[1]; return [(x - cam.cx) * cam.z + W / 2, (y - cam.cy) * cam.z + H / 2]; };
    let sc = land * cam.z; for (let k = 1; k <= G; k++) sc *= R3A_PASS[k].sc; if (P.lines.length) minCap = Math.min(minCap, R3A_TW.cap * sc);
    const capBoxes = []; // master coords
    all.forEach((l, li) => {
      if (t < need[li][0] || t > need[li][1]) return;
      const rows = P.rows.filter(r => r.line === l.i && t >= r.s - R3A_EARLY);
      if (!rows.length) { bad.push({ t: +t.toFixed(3), line: l.i, why: 'not on this page' }); return; }
      for (const row of rows) {
        const slot = row.r - sp, y = R3A_TW.base + slot * R3A_TW.pitch, last = row.words[row.words.length - 1], x1 = R3A_TW.x + (last.col + last.w.length) * r3aADV;
        if (slot < -.001 || slot > 3.001) { bad.push({ t: +t.toFixed(3), line: l.i, row: row.r, why: 'scrolled out', slot: +slot.toFixed(2) }); continue; }
        for (const [px, py] of [[R3A_TW.x, y - R3A_TW.cap - 6], [x1, y - R3A_TW.cap - 6], [R3A_TW.x, y + r3aFS * .24], [x1, y + r3aFS * .24]]) {
          const [sx, sy] = map(px, py), mm = Math.min(sx, W - sx, sy, H - sy); minMargin = Math.min(minMargin, mm);
          if (mm < 10) bad.push({ t: +t.toFixed(3), line: l.i, row: row.r, why: 'off frame', sx: Math.round(sx), sy: Math.round(sy) });
        }
      }
    });
    for (const row of P.rows) { const slot = row.r - sp; if (slot < -1.05 || slot > 3.05 || t < row.s - R3A_EARLY) continue; const y = R3A_TW.base + slot * R3A_TW.pitch; capBoxes.push([R3A_TW.x, Math.max(R3A_TW.y, y - R3A_TW.cap - 8), R3A_TW.right, Math.min(R3A_TW.y + R3A_TW.h, y + r3aFS * .26)]); }
    if (P.head.length && t >= r3aS(P.head[0][0], P.head[0][1]) - R3A_EARLY) capBoxes.push([R3A_MAST.x, R3A_MAST.base - R3A_MAST.cap - 12, 1880, R3A_MAST.base + 12]);
    // the heads drawn this frame (pic coords -> master coords)
    r3aHeads.length = 0; r3aLogHeads = true; r3aPG.setTransform(1, 0, 0, 1, 0, 0); r3aPG.fillStyle = '#fff'; r3aPG.fillRect(0, 0, PBW, PBH);
    R3A_PICS[P.key](r3aPG, t, pi, P); r3aLogHeads = false;
    for (const [hx0, hy0, hx1, hy1] of r3aHeads) {
      nHeads++;
      const a = [Math.max(0, hx0) + R3A_PB.x, Math.max(0, hy0) + R3A_PB.y, Math.min(PBW, hx1) + R3A_PB.x, Math.min(PBH, hy1) + R3A_PB.y];
      if (a[2] <= a[0] || a[3] <= a[1]) continue; // clipped out of the box
      for (const b of capBoxes) { headPairs++; if (a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3]) bad.push({ t: +t.toFixed(3), why: 'caption over a face', head: a.map(Math.round), cap: b.map(Math.round) }); }
    }
  }
  return { bad: bad.slice(0, 40), nBad: bad.length, minCap: +minCap.toFixed(1), minMargin: Math.round(minMargin), headsChecked: nHeads, headCaptionPairs: headPairs };
};
window.__rowsR3A = () => R3A_PAGES.map(P => P.rows.map(r => ({ r: r.r, line: r.line, s: r.s, carried: r.carried, text: r.words.map(w => w.w).join(' ') })));
startPage(r3aOut, r3aRender, R3A_T0, R3A_T1, R3A_READY);
