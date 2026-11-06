// Round 3, leaf-C: the photocopied fact sheet, stanzas 11-14, song 240.916667-340.458333 (frames f5782-f8171).
// Three more pages of the couple's leaflet, made exactly like the stanza-10 page (js/leaflet/main.js) and the
// round-2 pages (early.js): typed copy, a rub-down headline, fineliner pictures in the ruled box, then run off
// on the copier, each copy event a generation further from the master. Loads the kit (xerox.js, ink.js,
// pictures.js) read-only; every name here is prefixed r3cLeaf / R3C.
//   page 11 (f5782-f6276): one Tuesday, the king, the phone, the legal teams       cream, then the lilac run
//   page 12 (f6276-f7112): the case, the judge, the five views                     cream, then the orange run
//   page 13 (f7112-f8171): the verdict, the refrain, then the tail                 cream, then a run on every
//        colour the leaflet has been printed on; the tail lands the last copies of every page on the desk.
// renderFrame(t) is a pure function of song time t. The two caches (the finished pages 11 and 12, run off three
// times, for the tail) are fixed renders that never depend on t.
const r3cOut = document.getElementById('c'); r3cOut.width = W; r3cOut.height = H;
const r3cG = r3cOut.getContext('2d');
const R3C_T0 = 5782 / 24, R3C_T12 = 6276 / 24, R3C_T13 = 7112 / 24, R3C_T14 = 7908 / 24, R3C_T1 = 8171 / 24;

// ---- words and times (all from source/lines.json via gen/r3c_leaf_lines.js) -------------------------------------
const R3C_L = {}; R3C_LEAF_LINES.forEach(l => { R3C_L[l.i] = l; });
const r3cW = (i, k) => { const a = R3C_L[i].words; return a[k < 0 ? a.length + k : k]; };
const r3cS = (i, k) => r3cW(i, k).s;
const r3cRange = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };
const R3T = {
  // page 11
  happened: r3cS(101, 1), one: r3cS(101, 2), tuesday: r3cS(101, 3),
  k1: r3cS(102, 0), mad: r3cS(102, 3), buying: r3cS(103, 2), patent: r3cS(103, 4), satellite: r3cS(103, 6), ads: r3cS(103, 7),
  c1: r3cS(104, 0), phone: r3cS(104, 2), did1: r3cS(104, 3), ring: r3cS(104, 4),
  c2: r3cS(105, 0), wife: r3cS(105, 2), scream: r3cS(105, 4),
  c3: r3cS(106, 0), cops: r3cS(106, 2), jump: r3cS(106, 4),
  l1: r3cS(107, 0), legal: r3cS(107, 2), teams: r3cS(107, 3), went: r3cS(108, 0), couple: r3cS(108, 5),
  n1: r3cS(109, 0), shown: r3cS(109, 2), nerve: r3cS(109, 4),
  s1: r3cS(110, 0), would: r3cS(110, 1), unfair: r3cS(110, 3), libel: r3cS(110, 4), laws: r3cS(110, 5), king: r3cS(110, 8), serve: r3cS(110, 9),
  // page 12
  caseW: r3cS(111, 2), longest: r3cS(111, 5), made: r3cS(111, 8),
  j1: r3cS(112, 0), jury: r3cS(112, 5), aid: r3cS(112, 9),
  b1: r3cS(113, 0), thirty: r3cS(113, 4), billions: r3cS(113, 5), dollars: r3cS(113, 6), spend: r3cS(113, 8),
  f1: r3cS(114, 0), crush: r3cS(114, 1), people: r3cS(114, 3), defend: r3cS(114, 6),
  r1: r3cS(115, 0), speak: r3cS(115, 3), truth: r3cS(115, 5), loud: r3cS(115, 7),
  m1: r3cS(116, 0), tv: r3cS(116, 1), newsprint: r3cS(116, 3), internet: r3cS(116, 5), crowds: r3cS(116, 6),
  jd: r3cS(117, 0), judge: r3cS(117, 2), agreed: r3cS(118, 2), coupleT: r3cS(118, 5),
  v: [119, 120, 121, 122, 123].map(i => r3cS(i, 0)), vw: [r3cS(119, 4), r3cS(120, 4), r3cS(121, 4), r3cS(122, 3), r3cS(123, 3)],
  // page 13
  fine: r3cS(124, 2), guilty: r3cS(124, 4), fuss: r3cS(124, 8),
  r125: r3cS(125, 0), r126: r3cS(126, 0), r127: r3cS(127, 0), r128: r3cS(128, 0), r129: r3cS(129, 0), r130: r3cS(130, 0), r131: r3cS(131, 0),
  lib: [r3cS(125, 6), r3cS(126, 5), r3cS(127, 5), r3cS(128, 0), r3cS(129, 5), r3cS(130, 5), r3cS(131, 0)],
  // the band's last hits in the tail (measured for the woodcut tail, js/woodcut/NOTES-end.md)
  hits: [331.61, 332.25, 332.67, 333.18, 333.73],
};
const R3C_EARLY = .035; // a letter may land up to one frame before its onset (as main.js)

// ---- master layout (copy pixels, SW x SH), the same as main.js -----------------------------------------------
const R3C_MAST = { x: 130, base: 222, cap: 128 };
const R3C_PB = { x: 100, y: 255 };
const R3C_TW = { x: 165, y: 662, h: 420, base: 728, pitch: 104, cap: 54, right: 1850 };
let r3cFS = 94, r3cADV = 56, r3cLFS = 178;
const R3C_PASS = [null, // the same copier settings as the stanza-10 run
  { rot: -.0062, dx: -10, dy: 7, sc: .955, blur: 2.0, bright: .9, con: 5, edge: 2.2, sat: 2, satR: 4, satB: .543, satC: 2.3 },
  { rot: .0085, dx: 15, dy: -8, sc: 1.0, blur: 1.15, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: -.0068, dx: -17, dy: 10, sc: 1.0, blur: 1.15, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: .0058, dx: 9, dy: 12, sc: 1.0, blur: 1.2, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: -.0095, dx: -7, dy: -13, sc: 1.0, blur: 1.2, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: .0075, dx: 14, dy: 6, sc: 1.0, blur: 1.2, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
  { rot: -.0048, dx: -11, dy: -6, sc: 1.0, blur: 1.25, bright: .95, con: 7, sat: 1, satR: 2.5, satB: .58, satC: 1.46 },
];
const R3C_PAPER = { cream: '#efebdf', yellow: '#f5e58f', pink: '#f4bfcc', blue: '#cfdde8', green: '#d7e7c5', lilac: '#dcd3ea', lilac2: '#d3c9e4', orange: '#f6d3a6', orange2: '#f3c995' };

// ---- the three pages -----------------------------------------------------------------------------------------------
// gens: when each copy lands. head: the rub-down headline [line, word] on the sung words. under: marker underlines
// [line, word, double]. carry: the last lines of the page before run on at the top of the column, so they stay
// readable across the cut. cams: [cx, cy, z0, z1] per panel.
const R3C_PAGES = [
  { key: 11, t0: R3C_T0, t1: R3C_T12, lines: r3cRange(101, 110), carry: [99, 100], head: [[101, 2], [101, 3]],
    under: [[101, 3], [109, 4], [110, 3]], paper: [null, R3C_PAPER.cream, R3C_PAPER.lilac, R3C_PAPER.lilac2], gens: [R3C_T0, R3T.went, R3T.s1],
    panels: [R3C_T0, R3T.k1, R3T.c1, R3T.l1, R3T.n1, R3T.s1],
    cams: [[1000, 572, .975, .99], [1000, 590, 1.0, 1.015], [1000, 588, .99, 1.005], [1000, 575, .97, .95], [1000, 590, 1.02, 1.035], [1000, 562, .93, .915]] },
  { key: 12, t0: R3C_T12, t1: R3C_T13, lines: r3cRange(111, 123), carry: [109, 110], head: [[111, 1], [111, 2]],
    under: [[111, 5], [112, 5], [113, 5], [115, 5], [118, 2]], paper: [null, R3C_PAPER.cream, R3C_PAPER.orange, R3C_PAPER.orange2], gens: [R3C_T12, R3T.jd, R3T.v[0]],
    panels: [R3C_T12, R3T.j1, R3T.b1, R3T.f1, R3T.r1, R3T.m1, R3T.jd, R3T.v[0]],
    cams: [[1000, 572, .975, .99], [1000, 590, 1.0, 1.01], [1000, 588, .99, 1.005], [1000, 590, 1.0, 1.02], [1000, 592, 1.02, 1.035], [1000, 588, .99, 1.0], [1000, 575, .96, .975], [1000, 562, .93, .915]] },
  { key: 13, t0: R3C_T13, t1: R3C_T1, lines: r3cRange(124, 131), carry: [122, 123], head: [[125, 6]],
    under: [[124, 2], [125, 6, true], [128, 0, true], [131, 0, true]],
    paper: [null, R3C_PAPER.cream, R3C_PAPER.yellow, R3C_PAPER.pink, R3C_PAPER.blue, R3C_PAPER.green, R3C_PAPER.lilac, R3C_PAPER.orange],
    gens: [R3C_T13, R3T.r125, R3T.r126, R3T.r127, R3T.r129, R3T.r130, R3T.r131],
    panels: [R3C_T13, R3T.r125, R3T.r126, R3T.r127, R3T.r128, R3T.r129, R3T.r130, R3T.r131, R3C_T14],
    cams: [[1000, 600, 1.03, 1.05], [1000, 575, .97, .98], [1000, 568, .955, .96], [1000, 565, .945, .935], [1000, 562, .93, .92], [1000, 565, .94, .93], [1000, 562, .93, .925], [1000, 560, .925, .915], [1000, 560, .915, .915]] },
];
const r3cPageOf = t => (t < R3C_T12 ? 0 : t < R3C_T13 ? 1 : 2);
const r3cPanelOf = (P, t) => { let i = 0; while (i + 1 < P.panels.length && P.panels[i + 1] - R3C_EARLY <= t) i++; return i; };

// ---- typed rows (same rules as the other pages: four rows, feed up one row before a fifth starts) ------------------
function r3cLeafLayout(m) {
  m.font = TYPE_FONT.replace('{s}', 100); r3cFS = Math.round(R3C_TW.cap / (m.measureText('H').actualBoundingBoxAscent / 100) * 10) / 10;
  m.font = TYPE_FONT.replace('{s}', r3cFS); r3cADV = m.measureText('M').width;
  m.font = LETRA_FONT.replace('{s}', 100); r3cLFS = Math.round(R3C_MAST.cap / (m.measureText('H').actualBoundingBoxAscent / 100));
  m.font = TYPE_FONT.replace('{s}', r3cFS);
  const maxC = Math.floor((R3C_TW.right - R3C_TW.x) / r3cADV);
  for (const P of R3C_PAGES) {
    P.rows = []; let r = 0;
    for (const i of [...P.carry, ...P.lines]) {
      const l = R3C_L[i], carried = P.carry.includes(i);
      const words = l.words.map((w, k) => ({ w: w.w, s: w.s, e: w.e, k }));
      const total = words.reduce((a, w) => a + w.w.length, 0) + words.length - 1;
      let breaks = [];
      if (total > maxC) { // two rows, balanced
        let best = null;
        for (let k = 1; k < words.length; k++) {
          const a = words.slice(0, k).reduce((s, w) => s + w.w.length, 0) + k - 1, b = total - a - 1;
          if (a <= maxC && b <= maxC && (!best || Math.max(a, b) < best[1])) best = [k, Math.max(a, b)];
        }
        breaks = [best[0]];
      }
      const parts = []; let k0 = 0; for (const k of [...breaks, words.length]) { parts.push(words.slice(k0, k)); k0 = k; }
      for (const part of parts) {
        let col = 0;
        for (const w of part) { w.col = col; col += w.w.length + 1; w.dt = Math.min(.042, .75 * (w.e - w.s) / w.w.length); }
        P.rows.push({ r: r++, line: i, s: carried ? P.t0 - 10 : part[0].s, carried, words: part });
      }
    }
    const words = P.head.map(([i, k]) => r3cW(i, k).w.toUpperCase());
    let fs = r3cLFS; const fit = (s) => { let w = 0; words.forEach((x, j) => { w += letraWidth(m, x, s) + (j ? s * .28 : 0); }); return w; };
    while (fs > 60 && fit(fs) > 1880 - R3C_MAST.x - 20) fs -= 2;
    P.headFS = fs; P.headWords = words;
  }
}
function r3cLeafScroll(P, t) { let s = 0; for (const row of P.rows) if (row.r >= 4) s += smooth((t - (row.s - .2)) / .16); return s; }

function r3cLeafTyped(m, t, P) {
  const sp = r3cLeafScroll(P, t), TW = R3C_TW, EARLY = R3C_EARLY;
  m.save(); m.beginPath(); m.rect(0, TW.y, SW, TW.h); m.clip();
  m.textBaseline = 'alphabetic';
  for (const row of P.rows) {
    const slot = row.r - sp; if (slot < -1.05 || slot > 3.05 || t < row.s - EARLY) continue;
    const y = TW.base + slot * TW.pitch;
    for (const w of row.words) {
      if (PROBE.on && !row.carried && t >= w.s - EARLY) { // audit: first letter on its onset (never before this page is on screen)
        probeWord(t, row.line, w.k, (tt) => tt >= w.s - EARLY && tt >= row.s - EARLY && tt >= P.t0);
        if (slot > -0.01 && slot < 3.01) { m.font = TYPE_FONT.replace('{s}', r3cFS); m.textAlign = 'left'; PROBE.text(m, "typed caption", w.w, TW.x + w.col * r3cADV, y, [TW.x - 40, TW.y, TW.right - TW.x + 80, TW.h], { margin: 2 }); }
      }
      for (let j = 0; j < w.w.length; j++) {
        if (!row.carried && t < w.s + j * w.dt - EARLY) break;
        strike(m, w.w[j], TW.x + (w.col + j) * r3cADV, y, r3cFS, 7000 + row.line * 37 + w.col + j);
      }
      const ui = P.under.find(u => u[0] === row.line && u[1] === w.k);
      if (ui) {
        const x0 = TW.x + w.col * r3cADV - 6, x1 = TW.x + (w.col + w.w.length) * r3cADV + 4, u = row.carried ? 1 : pr(t, w.s + .12, .22);
        marker(m, seg(x0, y + 16, x1, y + 12 + (rnd(row.line, 3) - .5) * 6, 10), u, 9, row.line * 7);
        if (ui[2]) marker(m, seg(x0 + 10, y + 32, x1 - 6, y + 30, 10), row.carried ? 1 : pr(t, w.s + .3, .2), 8, row.line * 9);
      }
    }
  }
  m.restore();
}

// ---- the headline: rub-down letters on the sung words, a mittened hand with a burnisher rubbing them down ---------
function r3cLeafHeadline(m, t, P) {
  const fs = P.headFS, dt = .055, y = R3C_MAST.base, MX = R3C_MAST.x;
  pen(m, seg(MX, 240, 1880, 236, 30), pr(t, P.t0 - .3, .3), 5, 910 + P.key); pen(m, seg(MX, 248, 1880, 245, 30), pr(t, P.t0 - .25, .3), 3, 911 + P.key);
  const starts = P.head.map(([i, k]) => r3cS(i, k) - R3C_EARLY);
  let x = MX; const cur = [];
  P.headWords.forEach((wd, j) => {
    if (j) x += fs * .28;
    const a = letraWord(m, wd, x, y, fs, t, starts[j], dt, 1920 + j * 10 + P.key * 3);
    a.chars.forEach((c, n) => cur.push([c, starts[j] + n * dt])); x = a.x1;
  });
  P.headX1 = x;
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

// ---- small things ----------------------------------------------------------------------------------------------------
function r3cLeafHen(p, x, y, s, prog, seed, dir = 1) { // a hen, side on, feet at (x, y) (the farms page's hen)
  const items = [], bx = x, by = y - s * .55, D = (u, v) => [bx + dir * u * s, by + v * s];
  items.push({ p: poly([D(-.42, -.05), D(-.5, -.32), D(-.3, -.12), D(-.05, -.22), D(.18, -.2), D(.3, -.42), D(.42, -.48), D(.5, -.38), D(.46, -.2), D(.38, .08), D(.15, .25), D(-.2, .24), D(-.4, .1)], true), w: 4, white: true });
  items.push({ p: poly([D(.36, -.5), D(.39, -.6), D(.43, -.52), D(.47, -.62), D(.5, -.49)]), w: 3.5 });
  items.push({ p: poly([D(.5, -.4), D(.6, -.36), D(.5, -.32)]), w: 3.5 });
  items.push({ p: [D(.42, -.4)], dot: 2.6 });
  items.push({ p: quad(D(-.12, -.02), D(.05, .12), D(.18, -.04), 8), w: 3 });
  items.push({ p: seg(...D(-.02, .24), ...D(-.04, .55), 2), w: 3.5 }, { p: seg(...D(.1, .24), ...D(.12, .55), 2), w: 3.5 });
  drawSet(p, items, prog, seed, .7);
}
// White behind a figure so the ones behind it are hidden (drawn back to front).
function r3cLeafOcclude(p, o) {
  const r = o.h * .1, hx = o.x, hy = o.y - o.h + r, sy = hy + r * 1.25, sw = o.h * .13, hemY = o.y - o.h * .3, hw = o.woman ? o.h * .19 : o.h * .16;
  p.fillStyle = '#fff'; p.beginPath(); p.arc(hx, hy, r * 1.25, 0, TAU); p.fill();
  fillPoly(p, [[hx - sw * 1.1, sy - r * .3], [o.x - hw * 1.05, hemY], [o.x - hw * .5, o.y], [o.x + hw * .5, o.y], [o.x + hw * 1.05, hemY], [hx + sw * 1.1, sy - r * .3]]);
}
// Where a person's right mitten is (the kit's arm geometry), for a leaflet leaving the hand.
function r3cLeafHandR(o, spec) {
  const h = o.h, r = h * .1, hx = o.x, hy = o.y - h + r, sy = hy + r * 1.25, sw = h * .13;
  const [ang, bend] = spec, sx = hx + sw * .95, syy = sy + h * .04, l1 = h * .17, l2 = h * .16;
  const a1 = Math.PI / 2 - ang, ex = sx + Math.cos(a1) * l1, ey = syy + Math.sin(a1) * l1;
  const a2 = a1 - bend, hx2 = ex + Math.cos(a2) * l2, hy2 = ey + Math.sin(a2) * l2;
  return [hx2 + Math.cos(a2) * h * .06, hy2 + Math.sin(a2) * h * .06 - h * .07];
}

// ---- page 11: one Tuesday --------------------------------------------------------------------------------------------
function r3cLeafPic11(p, t, pi) {
  const E = R3C_EARLY;
  if (pi === 0) { // the wall calendar: last month's page tears off, a Tuesday is ringed in marker; their fact sheet pinned beside it
    const cx0 = 470, cw = 860, ch = 318, cy0 = 34;
    const cal = (seed, fall) => {
      p.save(); p.translate(cx0, cy0);
      if (fall > 0) { p.translate(0, fall * fall * 520); p.rotate(fall * .5); }
      p.fillStyle = '#fff'; p.fillRect(0, 0, cw, ch);
      pen(p, r3cLeafRect(0, 0, cw, ch), 1, 5, seed);
      p.fillStyle = '#000'; p.fillRect(30, 26, cw - 60, 30);
      const gx = 30, gy = 72, gw = (cw - 60) / 7, gh = (ch - 92) / 5;
      for (let c = 0; c <= 7; c++) pen(p, seg(gx + c * gw, gy, gx + c * gw, gy + 5 * gh, 4), 1, 3, seed + 1 + c);
      for (let r = 0; r <= 5; r++) pen(p, seg(gx, gy + r * gh, gx + 7 * gw, gy + r * gh, 6), 1, 3, seed + 10 + r);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) if (r * 7 + c > 1 && r * 7 + c < 33) pen(p, seg(gx + c * gw + 10, gy + r * gh + 12, gx + c * gw + 26 + (rnd(seed, r * 7 + c) * 8), gy + r * gh + 12, 2), 1, 3, null);
      p.restore();
    };
    cal(3010, 0);
    const fall = clamp((t - (R3T.happened - E)) / .6);
    if (fall < 1) cal(3030, fall);
    for (let k = 0; k < 6; k++) { p.fillStyle = '#fff'; p.beginPath(); p.arc(cx0 + 90 + k * 136, cy0, 11, 0, TAU); p.fill(); pen(p, ell(cx0 + 90 + k * 136, cy0, 11, 11), 1, 4, 3050 + k); }
    // the Tuesday: column two (weeks start on Monday), third week
    const gw = (cw - 60) / 7, gh = (ch - 92) / 5, mx = cx0 + 30 + gw * 1.5, my = cy0 + 72 + gh * 2.5;
    if (t >= R3T.one - E) marker(p, ell(mx, my, gw * .62, gh * .78, -2.2, -2.2 + TAU * 1.08), pr(t, R3T.one - E, R3T.tuesday + .25 - R3T.one), 8, 3060);
    r3cLeafSheet(p, 1560, 190, 160, 220, .05, 3070); // the fact sheet, pinned to the wall
    p.fillStyle = '#000'; p.beginPath(); p.arc(1556, 86, 8, 0, TAU); p.fill();
  } else if (pi === 1) { // the king at his desk, content; he buys the patent; the satellite; the ads beamed down
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 3101);
    const tilt = t >= R3T.mad - E ? Math.sin((t - R3T.mad) * 6) * .7 * clamp(1 - (t - R3T.mad) / 1.6) : 0;
    const reach = ease(t, R3T.buying - E, R3T.buying + .2) * (1 - ease(t, R3T.patent + .5, R3T.patent + .8));
    r3cLeafKing(p, 470, GY, 330, pr(t, R3T.k1 - E, .45), 3110, { tilt, armL: .45, armR: .45 + reach * 1.0 });
    r3cLeafDesk(p, 210, 830, 262, pr(t, R3T.k1 - E, .35), 3120);
    // the seller (top hat) with the patent, a scroll with a ribbon seal
    r3cLeafPerson(p, { x: 1040, y: GY, h: 300, tophat: true, mouth: 'smile', look: -1, facing: -1, armL: [1.25 - .3 * ease(t, R3T.patent - E, R3T.patent + .2), .3] }, pr(t, R3T.k1 + .1, .45), 3130);
    if (t >= R3T.buying - E) { // a money bag slides across the desk to him
      const u = ease(t, R3T.buying - E, R3T.buying + .45);
      r3cLeafBag(p, lerp(620, 860, u), 262 - Math.sin(u * Math.PI) * 30, 90, 1, 3140);
    }
    { // the patent: from his hand onto the desk on the sung word, sealed
      const u = ease(t, R3T.patent - E, R3T.patent + .35), x = lerp(930, 560, u), y = lerp(190, 236, u);
      p.save(); p.translate(x, y); p.rotate(lerp(-.25, .08, u));
      p.fillStyle = '#fff'; p.fillRect(-70, -44, 140, 88); pen(p, r3cLeafRect(-70, -44, 140, 88), pr(t, R3T.k1 + .3, .25), 4.5, 3150);
      for (let k = 0; k < 3; k++) pen(p, seg(-52, -24 + k * 18, 40, -24 + k * 18, 4), pr(t, R3T.k1 + .4, .2), 3, 3151 + k);
      p.restore();
      if (u >= 1) { p.fillStyle = '#000'; p.beginPath(); p.arc(x + 40, y + 26, 13, 0, TAU); p.fill(); pen(p, poly([[x + 34, y + 36], [x + 28, y + 62], [x + 40, y + 50], [x + 52, y + 62], [x + 46, y + 36]]), 1, 3.5, 3155); }
    }
    if (t >= R3T.satellite - E) { // the satellite: a body, two panels, a dish; its panel shows the crown
      const sx = 1500, sy = 82, u = pr(t, R3T.satellite - E, .35);
      pen(p, r3cLeafRect(sx - 40, sy - 30, 80, 60), u, 5, 3160);
      for (const sd of [-1, 1]) { pen(p, r3cLeafRect(sx + sd * 48 + (sd < 0 ? -150 : 0), sy - 22, 150, 44), u, 4.5, 3161 + sd); for (let k = 1; k < 5; k++) pen(p, seg(sx + sd * 48 + (sd < 0 ? -150 : 0) + k * 30, sy - 22, sx + sd * 48 + (sd < 0 ? -150 : 0) + k * 30, sy + 22, 2), u, 2.5, 3163 + k + sd * 5); }
      pen(p, ell(sx, sy + 48, 26, 12, 0, Math.PI), u, 4.5, 3175); pen(p, seg(sx, sy + 30, sx, sy + 48, 2), u, 4, 3176);
      if (t >= R3T.ads - E) {
        pen(p, poly(r3cLeafCrownPts(sx, sy + 14, 50, 22), true), pr(t, R3T.ads - E, .12), 3.5, 3177);
        for (let k = 0; k < 4; k++) { // beams fanning down to the houses, and their aerials
          const hx = 1300 + k * 140, u2 = pr(t, R3T.ads - E + k * .04, .2);
          for (let d = 0; d < 6; d++) { const a = d / 6, b = (d + .5) / 6; pen(p, seg(lerp(sx, hx, a), lerp(sy + 60, GY - 110, a), lerp(sx, hx, b), lerp(sy + 60, GY - 110, b), 1), u2, 3, null); }
        }
      }
      for (let k = 0; k < 4; k++) { // little houses with TV aerials
        const hx = 1300 + k * 140, u2 = pr(t, R3T.satellite + .15 + k * .05, .2);
        pen(p, poly([[hx - 50, GY], [hx - 50, GY - 60], [hx, GY - 98], [hx + 50, GY - 60], [hx + 50, GY]]), u2, 4.5, 3180 + k);
        pen(p, seg(hx + 20, GY - 82, hx + 20, GY - 120, 2), u2, 3.5, 3185 + k); pen(p, poly([[hx + 4, GY - 128], [hx + 20, GY - 116], [hx + 36, GY - 128]]), u2, 3.5, 3190 + k);
      }
    }
  } else if (pi === 2) { // three cells: the phone rings, his wife screams, his cops jump
    const cs = [R3T.c1, R3T.c2, R3T.c3];
    cs.forEach((ts, k) => { if (t >= ts - E) r3cLeafCell(p, k * 600, (k + 1) * 600, pr(t, ts - E, .2), 3200 + k); });
    { // the telephone on a little table
      pen(p, seg(16, GY - 6, 584, GY - 6, 20), 1, 4, 3210);
      pen(p, r3cLeafRect(150, 262, 300, 22), 1, 5, 3211); pen(p, seg(180, 284, 180, GY - 6, 2), 1, 5, 3212); pen(p, seg(420, 284, 420, GY - 6, 2), 1, 5, 3213);
      if (t >= R3T.phone - E) {
        const u = pr(t, R3T.phone - E, .3), shake = t >= R3T.did1 ? Math.sin(t * 70) * 4 : 0;
        const jump = t >= R3T.ring - E ? 38 * Math.abs(Math.sin((t - R3T.ring) * 14)) * clamp(1 - (t - R3T.ring) / 1.4) : 0;
        p.save(); p.translate(300 + shake, 262);
        pen(p, poly([[-95, 0], [95, 0], [70, -70], [-70, -70]], true), u, 5, 3220);
        pen(p, ell(0, -36, 24, 22), u, 4, 3221); p.fillStyle = '#000'; if (u >= 1) { p.beginPath(); p.arc(0, -36, 6, 0, TAU); p.fill(); }
        p.translate(0, -jump);
        p.fillStyle = '#fff'; fillPoly(p, [[-100, -70], [100, -70], [92, -96], [-92, -96]]);
        pen(p, poly([[-112, -66], [-100, -96], [100, -96], [112, -66], [76, -64], [70, -80], [-70, -80], [-76, -64]], true), u, 5, 3222);
        p.restore();
        pen(p, quad([395, 230], [500, 250], [470, 300], 10).concat(quad([470, 300], [450, 330], [560, 340], 10)), u, 3.5, 3223);
        if (t >= R3T.ring - E) for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { // ring marks
          const rr = 140 + k * 30; pen(p, ell(300, 140 - jump * .5, rr, rr * .7, sd > 0 ? -.5 : Math.PI - .5, sd > 0 ? .5 : Math.PI + .5), pr(t, R3T.ring - E + k * .05, .1), 4.5, 3225 + k + sd * 3);
        }
      }
    }
    if (t >= R3T.c2 - E) { // the king's wife screams
      const sc = t >= R3T.scream - E, up = ease(t, R3T.scream - E, R3T.scream + .12);
      pen(p, seg(616, GY - 6, 1184, GY - 6, 20), pr(t, R3T.c2 - E, .2), 4, 3240);
      r3cLeafQueen(p, { x: 900, y: GY - 6, h: 300, mouth: sc ? 'o' : 'line', look: 0, armL: [lerp(.15, 2.2, up), lerp(.1, 1.0, up)], armR: [lerp(.15, 2.2, up), lerp(.1, 1.0, up)] }, pr(t, R3T.wife - E, .45), 3250);
      if (sc) for (let k = 0; k < 6; k++) { // scream lines out from her head
        const a = -Math.PI / 2 + (k - 2.5) * .45, hx = 900, hy = GY - 6 - 300 + 30;
        pen(p, poly([[hx + Math.cos(a) * 75, hy + Math.sin(a) * 75], [hx + Math.cos(a + .08) * 95, hy + Math.sin(a + .08) * 95], [hx + Math.cos(a - .08) * 110, hy + Math.sin(a - .08) * 110], [hx + Math.cos(a) * 128, hy + Math.sin(a) * 128]]), pr(t, R3T.scream - E + k * .03, .1), 4.5, 3260 + k);
      }
    }
    if (t >= R3T.c3 - E) { // his cops jump up
      pen(p, seg(1216, GY - 6, 1784, GY - 6, 20), pr(t, R3T.c3 - E, .2), 4, 3270);
      const jy = t >= R3T.jump - E ? 48 * Math.sin(clamp((t - R3T.jump + E) / .5) * Math.PI) : 0;
      [[1390, 0], [1610, 1]].forEach(([x, k]) => {
        r3cLeafCop(p, { x, y: GY - 6 - jy, h: 240, mouth: jy > 4 ? 'o' : 'line', look: k ? -.4 : .4, armL: jy > 4 ? [1.4, .6] : [.15, .1], armR: jy > 4 ? [1.4, .6] : [.15, .1] }, pr(t, R3T.cops - E + k * .08, .4), 3280 + k * 20);
        if (jy > 10) for (let j = 0; j < 3; j++) pen(p, seg(x - 30 + j * 30, GY - 6 - jy + 18, x - 30 + j * 30, GY - 6 - jy + 40, 1), 1, 4, null);
      });
    }
  } else if (pi === 3) { // the legal teams: two rows of wigged barristers march on the couple
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 3301);
    const march = ease(t, R3T.went - E, R3T.couple + .5) * 360, walking = t > R3T.went - E && t < R3T.couple + .5;
    const team = (xs, y, h, ts, seed) => xs.forEach((x, k) => {
      const o = { x: x + march, y, h, mouth: 'line', look: 1, facing: 1, holdR: true, armR: [.5, .7], stride: walking ? t * 9 + k : 0 };
      if (t >= ts - E) { r3cLeafOcclude(p, o); r3cLeafWigged(p, o, pr(t, ts - E + k * .06, .35), seed + k * 17, false); }
    });
    team([270, 450, 630, 810], GY - 34, 225, R3T.teams, 3320);
    team([180, 380, 580, 780], GY, 285, R3T.legal, 3300);
    if (t >= R3T.couple - E) r3cLeafCouple(p, { x: 1560, y: GY, h: 230, look: -1, mouth: 'o', m: { holdR: true, armR: [.6, .5] }, w: { holdL: true, armL: [.6, .5] } }, pr(t, R3T.couple - E, .4), 3360);
  } else if (pi === 4) { // the couple stand their ground; the lawyers point
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 3401);
    [[300, 0], [530, 1], [760, 2]].forEach(([x, k]) => { const o = { x, y: GY, h: 285, mouth: 'o', look: 1, facing: 1, lean: .6, armR: [1.55, .05], armL: [.2, .1] }; r3cLeafOcclude(p, o); r3cLeafWigged(p, o, pr(t, R3T.n1 - E + k * .06, .35), 3410 + k * 17, false); });
    const fwd = ease(t, R3T.shown - E, R3T.shown + .15), high = ease(t, R3T.nerve - E, R3T.nerve + .12);
    const arm = [lerp(lerp(.3, 1.2, fwd), 2.6, high), lerp(lerp(.2, .35, fwd), -.2, high)];
    r3cLeafCouple(p, { x: 1300, y: GY, h: 290, look: -1, mouth: 'line', m: { holdR: true, armR: arm }, w: { holdL: true, armL: arm } }, pr(t, R3T.n1 - E, .4), 3450);
  } else { // the scales stand on the law book; the crown drops in and tips them
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 3501);
    const bx = 900, ub = pr(t, R3T.s1 - E, .3);
    pen(p, poly([[620, GY], [620, 292], [1180, 292], [1180, GY]]), ub, 6, 3502); // the book, lying flat
    for (let k = 1; k < 5; k++) pen(p, seg(640, 292 + k * 13, 1180, 292 + k * 13, 12), ub, 2.5, 3503 + k);
    pen(p, seg(620, 292, 1180, 292, 12), ub, 7, 3509);
    if (t >= R3T.laws - E) pen(p, poly(r3cLeafCrownPts(900, 352, 70, 26), true), pr(t, R3T.laws - E, .15), 4, 3510);
    const us = pr(t, R3T.would - E, .35), py = 74, L = 330;
    const tip = (t >= R3T.unfair - E ? .07 * Math.sin(clamp((t - R3T.unfair) / .4) * Math.PI) : 0) + (t >= R3T.king - E ? .2 * easeOutBack(pr(t, R3T.king - E, .18), 2) : 0);
    pen(p, seg(bx, 292, bx, py, 6), us, 6, 3520); pen(p, poly([[bx - 60, 292], [bx, 262], [bx + 60, 292]]), us, 5, 3521);
    const lx = bx - L * Math.cos(tip), ly = py + L * Math.sin(tip), rx = bx + L * Math.cos(tip), ry = py - L * Math.sin(tip);
    pen(p, seg(lx, ly, rx, ry, 10), us, 6, 3522); p.fillStyle = '#000'; if (us >= 1) { p.beginPath(); p.arc(bx, py, 10, 0, TAU); p.fill(); }
    const pan = (x, y, seed) => { pen(p, seg(x, y, x - 70, y + 130, 4), us, 3, seed); pen(p, seg(x, y, x + 70, y + 130, 4), us, 3, seed + 1); pen(p, ell(x, y + 130, 90, 26, 0, Math.PI), us, 5, seed + 2); pen(p, seg(x - 90, y + 130, x + 90, y + 130, 4), us, 4, seed + 3); };
    pan(lx, ly, 3530); pan(rx, ry, 3535);
    if (us >= 1) r3cLeafSheet(p, rx, ry + 100 - (t >= R3T.serve - E ? 26 * ease(t, R3T.serve - E, R3T.serve + .2) : 0), 70, 92, .05, 3540); // the couple's leaflet in one pan
    if (t >= R3T.king - E) { // the crown drops into the other
      const u = ease(t, R3T.king - E - .15, R3T.king - E + .02), cy2 = lerp(-60, ly + 122, u);
      p.fillStyle = '#fff'; fillPoly(p, r3cLeafCrownPts(lx, cy2, 110, 60)); pen(p, poly(r3cLeafCrownPts(lx, cy2, 110, 60), true), 1, 6, 3545);
      if (u >= 1) r3cLeafBang(p, lx, ly + 100, 70, pr(t, R3T.king, .12), 3546);
    }
  }
}

// ---- page 12: the case ------------------------------------------------------------------------------------------------
function r3cLeafCourtCouple(p, t, seed, mouth = 'line', stacks = 1) { // the couple at their own table, paper piled on it
  const o = { x: 1330, y: GY, h: 250, look: -1, mouth };
  r3cLeafCouple(p, o, 1, seed);
  r3cLeafDesk(p, 1050, 1620, 272, 1, seed + 90);
  const n = Math.round(4 + 12 * stacks);
  [[1110, 0], [1190, 1], [1490, 2], [1565, 3]].forEach(([x, k]) => r3cLeafStack(p, x, 272, 66, Math.max(2, n - k * 2), seed + 100 + k));
}
function r3cLeafJudge(p, x, t, prog, seed, o = {}) { r3cLeafWigged(p, Object.assign({ x, y: GY, h: 300, mouth: 'line', look: .3 }, o), prog, seed, true); }

function r3cLeafPic12(p, t, pi) {
  const E = R3C_EARLY;
  if (pi === 0) { // a tear-off calendar sheds its days; the couple's paper piles up
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4001);
    const pad = (seed) => { p.fillStyle = '#fff'; p.fillRect(-150, 0, 300, 250); pen(p, r3cLeafRect(-150, 0, 300, 250), 1, 5, seed); p.fillStyle = '#000'; p.fillRect(-120, 22, 240, 26); for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) pen(p, r3cLeafRect(-118 + c * 48, 64 + r * 44, 40, 34), 1, 3, seed + 1 + r * 5 + c); };
    p.save(); p.translate(330, 50); pad(4010); p.restore();
    const flips = 18;
    for (let k = 0; k < flips; k++) { // pages torn off, flying away, one after another from the sung word
      const t0 = R3T.longest - E + k * .1, u = (t - t0) / .55; if (u < 0 || u > 1) continue;
      p.save(); p.translate(330 - u * 420 + rnd(k, 3) * 60, 50 - u * 160 + u * u * 420); p.rotate(-u * (1.5 + rnd(k, 4))); pad(4040 + k); p.restore();
    }
    for (let k = 0; k < 5; k++) { p.fillStyle = '#fff'; p.beginPath(); p.arc(230 + k * 50, 50, 9, 0, TAU); p.fill(); pen(p, ell(230 + k * 50, 50, 9, 9), 1, 3.5, 4070 + k); }
    r3cLeafCourtCouple(p, t, 4100, 'line', ease(t, R3T.caseW - E, R3T.made + .4));
  } else if (pi === 1) { // the jury box stands empty; no lawyer's chair at their table
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4201);
    const u = pr(t, R3T.j1 - E, .4);
    for (let row = 0; row < 2; row++) for (let k = 0; k < 6; k++) { // chair backs, two rows
      const x = 150 + k * 118 + row * 50, y = row ? 150 : 104;
      pen(p, poly([[x, y + 70], [x, y + 10], [x + 18, y], [x + 62, y], [x + 80, y + 10], [x + 80, y + 70]]), pr(t, R3T.j1 - E + (row * 6 + k) * .02, .15), 4, 4210 + row * 6 + k);
    }
    if (u >= 1) { p.fillStyle = '#fff'; p.fillRect(110, 214, 790, GY - 214); }
    pen(p, poly([[110, GY], [110, 214], [900, 214], [900, GY]]), u, 6, 4230); pen(p, seg(94, 214, 916, 214, 20), u, 8, 4231);
    for (let k = 0; k < 4; k++) pen(p, r3cLeafRect(130 + k * 192, 236, 168, GY - 254), pr(t, R3T.j1 + .2, .3), 3, 4232 + k);
    if (t >= R3T.jury - E) { marker(p, seg(140, 90, 870, 340, 10), pr(t, R3T.jury - E, .12), 14, 4240); marker(p, seg(870, 90, 140, 340, 10), pr(t, R3T.jury - E + .08, .12), 14, 4241); }
    r3cLeafCourtCouple(p, t, 4100, 'line', 1);
    const cx = 1715; pen(p, poly([[cx - 40, GY], [cx - 40, 270], [cx + 40, 270]]), u, 5, 4250); pen(p, poly([[cx + 40, GY], [cx + 40, 180], [cx - 30, 172], [cx - 40, 270]]), u, 5, 4251); // an empty chair
    if (t >= R3T.aid - E) { marker(p, seg(cx - 70, 170, cx + 70, 340, 8), pr(t, R3T.aid - E, .1), 12, 4252); marker(p, seg(cx + 70, 170, cx - 70, 340, 8), pr(t, R3T.aid - E + .06, .1), 12, 4253); }
  } else if (pi === 2) { // the king with his money bags, a heap on the sung number
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4301);
    const toss = ease(t, R3T.spend - E, R3T.spend + .1);
    r3cLeafKing(p, 380, GY, 330, pr(t, R3T.b1 - E, .45), 4310, { armL: .45, armR: lerp(.5, 2.2, toss) });
    const HEAP = []; for (let r = 0; r < 4; r++) for (let k = 0; k < 6 - r; k++) HEAP.push([700 + k * 150 + r * 75 + (rnd(r, k) - .5) * 20, GY - r * 72]);
    const n = t < R3T.thirty - E ? 0 : t < R3T.billions - E ? 3 : Math.min(HEAP.length, 3 + Math.floor(15 * clamp((t - R3T.billions + E) / .6)));
    for (let i = 0; i < n; i++) { const [x, y] = HEAP[i], ts = i < 3 ? R3T.thirty - E + i * .06 : R3T.billions - E + (i - 3) * .04; const u = easeOutBack(pr(t, ts, .14), 2); if (u > 0) { p.save(); p.translate(x, y); p.scale(u, u); r3cLeafBag(p, 0, 0, 110, 1, 4320 + i); p.restore(); } }
    if (t >= R3T.dollars - E) for (let k = 0; k < 12; k++) r3cLeafCoin(p, 660 + rnd(k, 5) * 1000, GY - 8 - rnd(k, 6) * 14, 18, pr(t, R3T.dollars - E + k * .03, .1), 4350 + k);
    if (t >= R3T.spend - E) { const u = ease(t, R3T.spend - E, R3T.spend + .5); r3cLeafBag(p, lerp(520, 1720, u), lerp(140, 100, u) - Math.sin(u * Math.PI) * 90, 90, 1, 4370); }
  } else if (pi === 3) { // the big fist comes down over the people; they hold up their leaflets and it stops
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4401);
    const def = ease(t, R3T.defend - E, R3T.defend + .2);
    const xs = [430, 570, 710, 850, 990, 1130, 1270, 1410];
    xs.forEach((x, k) => {
      const arm = [lerp(.3, 2.6, def), lerp(.3, -.2, def)], woman = k % 3 === 1;
      r3cLeafPerson(p, { x, y: GY, h: 125, woman, scarf: k === 4, mouth: def > .5 ? 'line' : 'o', look: 0, holdR: true, armR: arm }, pr(t, R3T.people - E + Math.abs(k - 3.5) * .04, .35), 4410 + k * 13);
    });
    if (t >= R3T.crush - E) { // it stops short of them, and goes back up when they hold up their leaflets
      const down = easeOutBack(pr(t, R3T.crush - E, .3), 1.3), y = lerp(-260, 46, down) - 80 * def + Math.sin(t * 50) * 3 * (1 - def);
      r3cLeafFist(p, 920, y, 210, 1, 4450);
      if (down > .9 && def < .5) for (let k = 0; k < 4; k++) pen(p, seg(780 + k * 95, y + 196, 780 + k * 95 + (k - 1.5) * 10, y + 222, 1), 1, 4, null);
    }
  } else if (pi === 4) { // free speech: she speaks through a megaphone; out comes a leaflet
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4501);
    r3cLeafPerson(p, { x: 520, y: GY, h: 290, mouth: 'line', look: 1, holdR: true, armR: [.9, .5] }, pr(t, R3T.r1 - E, .4), 4510);
    r3cLeafPerson(p, { x: 760, y: GY, h: 280, woman: true, scarf: true, mouth: 'o', look: 1, facing: 1, armR: [1.45, .1] }, pr(t, R3T.r1 - E + .1, .4), 4530);
    const hx = 760, hy = GY - 280 + 28, um = pr(t, R3T.r1 + .15, .3);
    p.fillStyle = '#fff'; if (um >= 1) fillPoly(p, [[hx + 34, hy + 2], [hx + 34, hy + 26], [hx + 230, hy + 72], [hx + 230, hy - 44]]);
    pen(p, poly([[hx + 34, hy + 2], [hx + 230, hy - 44], [hx + 230, hy + 72], [hx + 34, hy + 26]], true), um, 5, 4540);
    pen(p, ell(hx + 230, hy + 14, 14, 58), um, 4.5, 4541);
    const arcs = (n, t0, big) => { for (let k = 0; k < n; k++) { const rr = 70 + k * (big ? 52 : 38); pen(p, ell(hx + 230, hy + 14, rr * .55, rr, -.9, .9), pr(t, t0 + k * .05, .1), big ? 6 : 4, 4550 + k + (big ? 10 : 0)); } };
    if (t >= R3T.speak - E && t < R3T.loud - E) arcs(3, R3T.speak - E, false);
    if (t >= R3T.loud - E) arcs(5, R3T.loud - E, true);
    if (t >= R3T.truth - E) { const u = ease(t, R3T.truth - E, R3T.truth + .45); r3cLeafSheet(p, lerp(hx + 240, 1560, u), lerp(hy + 14, 190, u) - Math.sin(u * Math.PI) * 50, lerp(40, 170, u), lerp(54, 230, u), (1 - u) * 1.4 + .04, 4570); }
  } else if (pi === 5) { // to TV, newsprint and the internet; a crowd under each
    const ts = [R3T.tv, R3T.newsprint, R3T.internet];
    for (let k = 0; k < 3; k++) r3cLeafCell(p, k * 600, (k + 1) * 600, pr(t, R3T.m1 - E + k * .05, .2), 4600 + k);
    if (t >= ts[0] - E) { const u = pr(t, ts[0] - E, .3); // the television
      pen(p, r3cLeafRect(150, 52, 300, 200), u, 6, 4610); pen(p, r3cLeafRect(172, 72, 210, 160), u, 4.5, 4611);
      pen(p, ell(415, 110, 14, 14), u, 4, 4612); pen(p, ell(415, 160, 14, 14), u, 4, 4613);
      pen(p, poly([[230, 18], [300, 52], [370, 18]]), u, 4, 4614); pen(p, seg(190, 252, 180, 282, 2), u, 5, 4615); pen(p, seg(410, 252, 420, 282, 2), u, 5, 4616);
      if (u >= 1) r3cLeafSheet(p, 277, 152, 92, 124, .02, 4617); }
    if (t >= ts[1] - E) { const u = pr(t, ts[1] - E, .3); // the newspaper
      p.save(); p.translate(900, 160); p.rotate(-.04); p.fillStyle = '#fff'; p.fillRect(-170, -120, 340, 240);
      pen(p, r3cLeafRect(-170, -120, 340, 240), u, 5, 4620); p.fillStyle = '#000'; if (u >= 1) p.fillRect(-150, -104, 300, 34);
      for (let c = 0; c < 2; c++) for (let k = 0; k < 7; k++) pen(p, seg(-150 + c * 80, -50 + k * 22, -86 + c * 80, -50 + k * 22, 3), u, 3, 4621 + c * 7 + k);
      if (u >= 1) r3cLeafSheet(p, 70, 22, 110, 140, 0, 4640);
      p.restore(); }
    if (t >= ts[2] - E) { const u = pr(t, ts[2] - E, .3); // the computer
      pen(p, r3cLeafRect(1360, 40, 290, 200), u, 6, 4650); pen(p, r3cLeafRect(1382, 60, 246, 160), u, 4.5, 4651);
      pen(p, poly([[1470, 240], [1450, 262], [1560, 262], [1540, 240]]), u, 5, 4652); pen(p, r3cLeafRect(1350, 270, 310, 22), u, 5, 4653);
      for (let k = 0; k < 10; k++) pen(p, seg(1362 + k * 29, 281, 1380 + k * 29, 281, 1), u, 3, 4654 + k);
      if (u >= 1) r3cLeafSheet(p, 1505, 140, 88, 120, -.02, 4670); }
    if (t >= R3T.crowds - E) for (let k = 0; k < 24; k++) { // the crowds: heads and shoulders along the bottom of every cell
      const cellK = Math.floor(k / 8), x = cellK * 600 + 60 + (k % 8) * 68 + (rnd(k, 7) - .5) * 14, y = 332 + (k % 2) * 8, u = pr(t, R3T.crowds - E + (k % 8) * .025, .12);
      if (u <= 0) continue;
      p.fillStyle = '#fff'; p.beginPath(); p.arc(x, y - 22, 17, 0, TAU); p.fill(); fillPoly(p, [[x - 32, y + 20], [x - 28, y], [x + 28, y], [x + 32, y + 20]]);
      pen(p, ell(x, y - 22, 15, 16), u, 4, 4680 + k); pen(p, quad([x - 32, y + 24], [x, y - 14], [x + 32, y + 24], 10), u, 4, 4710 + k);
      r3cLeafHead(x - 18, y - 40, 36, 36);
    }
  } else if (pi === 6) { // the judge on the bench; he agrees with the couple
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 4801);
    const nod = t >= R3T.agreed - E ? 1.6 * Math.abs(Math.sin(clamp((t - R3T.agreed + E) / .7) * TAU)) : 0;
    const look = t >= R3T.coupleT - E ? 1 : .3;
    r3cLeafJudge(p, 530, t, pr(t, R3T.judge - E, .5), 4810, { hunch: nod, look, mouth: t >= R3T.agreed ? 'smile' : 'line' });
    r3cLeafBench(p, 160, 900, 210, pr(t, R3T.jd - E, .4), 4850);
    r3cLeafCourtCouple(p, t, 4100, t >= R3T.agreed ? 'smile' : 'line', 1);
    if (t >= R3T.agreed - E) r3cLeafTick(p, 760, 92, 90, pr(t, R3T.agreed + .3, .2), 4860);
  } else { // the five views: a strip of five cells, each drawn on its word and ticked
    for (let k = 0; k < 5; k++) {
      const x0 = k * 360, x1 = x0 + 360, ts = R3T.v[k], tw = R3T.vw[k];
      if (t < ts - E) continue;
      r3cLeafCell(p, x0, x1, pr(t, ts - E, .2), 4900 + k);
      const u = pr(t, tw - E, .3), cx = x0 + 180;
      if (k === 0) { r3cLeafBag(p, cx, GY - 10, 210, u, 4910); if (t >= tw - E) for (let j = 0; j < 6; j++) r3cLeafCoin(p, cx - 130 + j * 50 + rnd(j, 3) * 10, GY - 14 - (j % 2) * 10, 17, pr(t, tw - E + .1 + j * .04, .1), 4920 + j); }
      if (k === 1) r3cLeafPerson(p, { x: cx, y: GY - 10, h: 270, cap: true, apron: true, mouth: 'line', look: 0 }, u, 4930);
      if (k === 2) { for (let j = 0; j < 8; j++) r3cLeafCoin(p, cx + (rnd(j, 9) - .5) * 10, GY - 30 - j * 22, 60, pr(u, j / 10, .3), 4940 + j); pen(p, poly(r3cLeafCrownPts(cx, GY - 210, 110, 54), true), pr(u, .75, .25), 5, 4950); }
      if (k === 3) { // a hen in a cage too small for her
        pen(p, r3cLeafRect(cx - 80, 170, 160, 170), u, 5, 4960); r3cLeafHen(p, cx, 336, 190, u, 4961);
        for (let j = 1; j < 6; j++) pen(p, seg(cx - 80 + j * 27, 170, cx - 80 + j * 27, 340, 2), pr(u, .4, .6), 4, 4965 + j);
      }
      if (k === 4) { // a heart, cracked
        const hp = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; hp.push([cx + 16 * Math.pow(Math.sin(a), 3) * 6.2, 210 - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 6.2]); }
        pen(p, hp, u, 6, 4970); pen(p, poly([[cx - 6, 150], [cx + 14, 190], [cx - 12, 222], [cx + 10, 262], [cx - 4, 290]]), pr(t, tw + .15, .2), 5, 4971);
      }
      if (t >= tw - E) r3cLeafTick(p, x1 - 62, 56, 70, pr(t, tw + .3, .15), 4980 + k);
    }
  }
}

// ---- page 13: the verdict, the refrain, the tail ----------------------------------------------------------------------
// The street crowd: who stands where, back row first, and when each one draws on (on "people", "like", "you").
const R3C_CROWD = (() => {
  const C = [], add = (xs, y, h, times) => xs.forEach((x, k) => C.push({ x, y, h, t: times[Math.min(times.length - 1, Math.floor(k * times.length / xs.length))], woman: (k * 7 + Math.round(h)) % 3 === 0, k: C.length }));
  add([380, 600, 820, 1060, 1280, 1500, 1680], GY - 78, 128, [r3cS(127, 0), r3cS(127, 1), r3cS(127, 2)]);
  add([470, 700, 1180, 1400, 1600, 360], GY - 40, 176, [r3cS(126, 0), r3cS(126, 1), r3cS(126, 2)]);
  add([640, 1160, 470, 1340, 330, 1530], GY, 238, [r3cS(125, 1), r3cS(125, 2), r3cS(125, 3)]);
  return C;
})();
const R3C_THROW = [r3cS(128, 0) + .7, r3cS(131, 0) + .5]; // leaflets thrown in the air (out of the box; then up and back down)
function r3cLeafArmsUp(t) {
  for (const L of R3T.lib) if (t >= L - R3C_EARLY && t < L + 1.8) return ease(t, L - R3C_EARLY, L + .12) * (1 - ease(t, L + 1.5, L + 1.8));
  if (t >= R3T.r128 - R3C_EARLY && t < R3T.r129 - .4) return 1;
  return 0;
}
function r3cLeafStreet(p, t, pi) {
  const E = R3C_EARLY;
  pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 5101); pen(p, seg(0, GY - 22, PBW, GY - 22, 30), 1, 3.5, 5102);
  { // the court behind them, small, at the far left: a pediment, columns, steps
    const items = [{ p: poly([[30, 140], [150, 70], [270, 140]], true), w: 5 }, { p: seg(30, 150, 270, 150, 6), w: 5 }];
    for (let k = 0; k < 4; k++) items.push({ p: seg(52 + k * 64, 156, 52 + k * 64, 300, 4), w: 5 });
    for (let k = 0; k < 3; k++) items.push({ p: seg(20 - k * 8, 306 + k * 14, 280 + k * 8, 306 + k * 14, 6), w: 4 });
    items.push({ p: poly(r3cLeafCrownPts(150, 128, 50, 22), true), w: 3.5 });
    drawSet(p, items, 1, 5110);
  }
  const up = r3cLeafArmsUp(t), armUp = [lerp(.35, 2.6, up), lerp(.3, -.25, up)];
  // a figure holds a leaflet unless it has just thrown it (until the next line, when new copies go round)
  const holding = (fig) => !((t >= R3C_THROW[0] && t < R3T.r129 - .2) || t >= R3C_THROW[1]);
  const figs = R3C_CROWD.filter(c => t >= c.t - E && pi >= 1);
  figs.push({ couple: true });
  for (const c of figs) {
    if (c.couple) {
      const oM = { x: 900 - 255 * .22, y: GY, h: 255 * 1.04, mouth: up > .5 ? 'o' : 'line', look: 0, holdR: holding(), armR: armUp }, oW = { x: 900 + 255 * .22, y: GY, h: 255 * .97, woman: true, scarf: true, mouth: up > .5 ? 'o' : 'line', look: 0, holdR: holding(), armR: armUp };
      r3cLeafOcclude(p, oM); r3cLeafOcclude(p, oW);
      r3cLeafPerson(p, oM, 1, 5150); r3cLeafPerson(p, oW, 1, 5200);
      continue;
    }
    const o = { x: c.x, y: c.y, h: c.h, woman: c.woman, pony: c.woman && c.k % 2 === 0, mouth: up > .5 ? 'o' : 'line', look: (900 - c.x) / 900 * .8, holdR: holding(c), armR: armUp };
    r3cLeafOcclude(p, o);
    r3cLeafPerson(p, o, pr(t, c.t - E, .3), 5300 + c.k * 13);
  }
  // thrown leaflets: one per figure, from the raised hand
  const all = R3C_CROWD.filter(c => c.t <= R3C_THROW[0]).concat([{ x: 900 - 255 * .22, y: GY, h: 255 * 1.04, k: 90 }, { x: 900 + 255 * .22, y: GY, h: 255 * .97, k: 91 }]);
  for (let j = 0; j < 2; j++) {
    const T = R3C_THROW[j], u = t - T; if (u < 0) continue;
    if (j === 0 && t >= R3T.r129 - .2) continue;
    const who = j === 0 ? all : R3C_CROWD.concat([{ x: 900 - 255 * .22, y: GY, h: 255 * 1.04, k: 90 }, { x: 900 + 255 * .22, y: GY, h: 255 * .97, k: 91 }]);
    for (const c of who) {
      const [hx0, hy0] = r3cLeafHandR({ x: c.x, y: c.y, h: c.h }, [2.6, -.25]), v = 620 + rnd(c.k, 41) * 380, dx = (rnd(c.k, 42) - .5) * 300, sz = c.h / 238;
      let x = hx0 + dx * u, y, rot = u * (3 + rnd(c.k, 43) * 4) * (c.k % 2 ? 1 : -1), flat = false;
      if (j === 0) y = hy0 - v * u;
      else { // up, then down like falling paper, then lying on the ground
        const gTop = hy0 - v * .55 + 160 * .55 * .55, tFall = .55, ground = (c.y || GY) - 4 + rnd(c.k, 44) * 8;
        if (u < tFall) y = hy0 - v * u + 160 * u * u;
        else { const w = u - tFall, fy = gTop + 150 * w; y = Math.min(ground, fy); x = hx0 + dx * tFall + Math.sin(w * 4 + c.k) * 40 + dx * .3 * w; if (fy >= ground) { flat = true; x = hx0 + dx * tFall + Math.sin(((ground - gTop) / 150) * 4 + c.k) * 40 + dx * .3 * (ground - gTop) / 150; } }
      }
      if (flat) { p.fillStyle = '#fff'; fillPoly(p, [[x - 26 * sz, y], [x + 22 * sz, y - 3], [x + 28 * sz, y - 11 * sz], [x - 20 * sz, y - 8 * sz]]); pen(p, poly([[x - 26 * sz, y], [x + 22 * sz, y - 3], [x + 28 * sz, y - 11 * sz], [x - 20 * sz, y - 8 * sz]], true), 1, 3.5, 5600 + c.k); }
      else if (y > -60) r3cLeafSheet(p, x, y, 40 * sz, 54 * sz, rot, 5600 + c.k);
    }
  }
}
function r3cLeafPic13(p, t, pi) {
  const E = R3C_EARLY;
  if (pi === 0) { // the verdict: three strokes of the gavel; the fine slides to them; they shrug
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 5001);
    r3cLeafJudge(p, 500, t, 1, 5010, { look: 1, mouth: 'line' });
    r3cLeafBench(p, 140, 880, 210, 1, 5050);
    const strikes = [R3T.fine, R3T.guilty, R3T.fuss]; let a = .6, hit = -1;
    for (const [k, s] of strikes.entries()) {
      if (t >= s - .24 && t < s) a = lerp(.6, -.6, Math.pow((t - (s - .24)) / .24, 2));
      else if (t >= s && t < s + .26) { a = lerp(-.6, .6, ease(t, s + .06, s + .26)); hit = k; }
    }
    const gx = 700, gy = 140;
    pen(p, poly([[545, 150], [620, 168], [gx - 10, gy + 6]]), 1, 5, 5060);
    r3cLeafGavel(p, gx, gy, a, 5061);
    { const items = []; mitten(items, gx, gy, a + Math.PI, 300, 4.5, false, 1); drawSet(p, items, 1, 5065); }
    if (hit >= 0) r3cLeafBang(p, gx - 125 * Math.cos(-.6), gy - 125 * Math.sin(-.6) + 20, 40, pr(t, strikes[hit], .08), 5070 + hit);
    const shrug = ease(t, R3T.fuss - E, R3T.fuss + .15), oo = t >= R3T.guilty - E && t < R3T.fuss - E;
    r3cLeafCouple(p, { x: 1350, y: GY, h: 270, look: -1, mouth: oo ? 'o' : 'line', m: { armL: [lerp(.15, 1.0, shrug), lerp(.1, -1.6, shrug)], armR: [lerp(.15, 1.0, shrug), lerp(.1, -1.6, shrug)] }, w: { armL: [lerp(.15, 1.0, shrug), lerp(.1, -1.6, shrug)], armR: [lerp(.15, 1.0, shrug), lerp(.1, -1.6, shrug)] } }, 1, 5080);
    if (t >= R3T.fine - E) { // the fine: a slip with the crown seal, sliding to their feet
      const u = ease(t, R3T.fine - E, R3T.fine + .45), x = lerp(760, 1180, u), y = lerp(205, GY - 14, u) - Math.sin(u * Math.PI) * 70;
      p.save(); p.translate(x, y); p.rotate(lerp(-.6, -.04, u)); p.fillStyle = '#fff'; p.fillRect(-60, -24, 120, 48); pen(p, r3cLeafRect(-60, -24, 120, 48), 1, 4, 5090);
      pen(p, poly(r3cLeafCrownPts(-30, 10, 34, 16), true), 1, 3, 5091); for (let k = 0; k < 2; k++) pen(p, seg(0, -6 + k * 16, 46, -6 + k * 16, 3), 1, 3, 5092 + k); p.restore();
    }
  } else r3cLeafStreet(p, t, pi);
}

// ---- the stamp: the king's seal with the sung word, red on the copy it lands on, then black on every copy after -------
const R3C_STAMP = { red: null, black: null };
function r3cLeafMakeStamp() {
  const w = 700, h = 270, c = mkCanvas(w, h), s = c.getContext('2d');
  s.strokeStyle = s.fillStyle = '#000';
  s.lineWidth = 14; s.strokeRect(10, 10, w - 20, h - 20); s.lineWidth = 5; s.strokeRect(30, 30, w - 60, h - 60);
  const cx = 120, cy = 140; s.beginPath(); s.moveTo(cx - 54, cy + 36); s.lineTo(cx - 54, cy - 26); s.lineTo(cx - 27, cy + 4); s.lineTo(cx, cy - 46); s.lineTo(cx + 27, cy + 4); s.lineTo(cx + 54, cy - 26); s.lineTo(cx + 54, cy + 36); s.closePath(); s.fill(); s.fillRect(cx - 58, cy + 44, 116, 14);
  const word = r3cW(128, 0).w.toUpperCase(); const fs = fitText(s, word, w - 260, 150, LETRA_FONT); s.textBaseline = 'middle'; s.fillText(word, 210, h / 2 + 6);
  R3C_STAMP.box = [w, h, fs];
  s.globalCompositeOperation = 'destination-out'; const R = mulberry(8181);
  for (let i = 0; i < 1400; i++) { s.globalAlpha = .4 + R() * .6; s.beginPath(); s.arc(R() * w, R() * h, .8 + R() * 2.6, 0, TAU); s.fill(); }
  const dg = s.createLinearGradient(0, 0, w, h); dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(.8, 'rgba(0,0,0,0)'); dg.addColorStop(1, 'rgba(0,0,0,.6)');
  s.globalAlpha = 1; s.fillStyle = dg; s.fillRect(0, 0, w, h);
  s.globalCompositeOperation = 'source-over';
  const r = mkCanvas(w, h), rs = r.getContext('2d'); rs.drawImage(c, 0, 0); rs.globalCompositeOperation = 'source-in'; rs.fillStyle = '#c4161c'; rs.fillRect(0, 0, w, h);
  R3C_STAMP.black = c; R3C_STAMP.red = r;
}
const R3C_STAMP_AT = { x: 1530, y: 140, rot: -.07, sc: .82 }; // over the masthead, right of the headline, clear of the picture
function r3cLeafStampDraw(g, t, red) {
  if (!R3C_STAMP.red) r3cLeafMakeStamp();
  const u = pr(t, R3T.r128 - R3C_EARLY, .09), sc = R3C_STAMP_AT.sc * (red ? lerp(1.35, 1, u) : 1);
  if (red && u <= 0) return;
  g.save(); g.translate(R3C_STAMP_AT.x, R3C_STAMP_AT.y); g.rotate(R3C_STAMP_AT.rot); g.scale(sc, sc);
  if (red) { g.globalCompositeOperation = 'multiply'; g.globalAlpha = .9; }
  g.drawImage(red ? R3C_STAMP.red : R3C_STAMP.black, -350, -135); g.restore();
}

// ---- the master paste-up for a page --------------------------------------------------------------------------------
const R3C_MS = mkCanvas(SW, SH), r3cMG = R3C_MS.getContext('2d');
const R3C_PIC = mkCanvas(PBW, PBH), r3cPG = R3C_PIC.getContext('2d');
function r3cLeafPicture(P, t) {
  const p = r3cPG, pi = r3cPanelOf(P, t);
  p.setTransform(1, 0, 0, 1, 0, 0); p.globalAlpha = 1; p.globalCompositeOperation = 'source-over'; p.fillStyle = '#fff'; p.fillRect(0, 0, PBW, PBH);
  if (P.key === 11) r3cLeafPic11(p, t, pi); else if (P.key === 12) r3cLeafPic12(p, t, pi); else r3cLeafPic13(p, t, pi);
}
function r3cLeafMaster(P, t) {
  const m = r3cMG; m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = 1; m.globalCompositeOperation = 'source-over'; m.filter = 'none';
  m.fillStyle = '#fff'; m.fillRect(0, 0, SW, SH);
  r3cLeafTyped(m, t, P);
  r3cLeafPicture(P, t);
  m.save(); m.translate(R3C_PB.x, R3C_PB.y);
  m.strokeStyle = 'rgba(0,0,0,.45)'; m.lineWidth = 1.6; m.strokeRect(-14, -12, PBW + 28, PBH + 22);
  m.drawImage(R3C_PIC, 0, 0);
  pen(m, poly([[0, 0], [PBW, 0], [PBW, PBH], [0, PBH]], true), pr(t, P.t0 - .5, .4), 6, 900 + P.key, 1.2);
  m.restore();
  r3cLeafHeadline(m, t, P);
}

// ---- copies -----------------------------------------------------------------------------------------------------------
const R3C_XG = [R3C_MS]; for (let k = 1; k <= 7; k++) R3C_XG.push(mkCanvas(SW, SH));
function r3cLeafGen(P, t) { let G = 1, ts = P.t0; P.gens.forEach((gt, k) => { if (t >= gt - R3C_EARLY) { G = k + 1; ts = gt; } }); return [G, ts]; }
function r3cLeafPass(P, k, last, pi, f2) {
  const Q = Object.assign({}, R3C_PASS[k]), jit = pi + 60 + P.key * 20;
  if (k === 1) { Q.rot += (rnd(jit, 61) - .5) * .003; Q.dx += (rnd(jit, 62) - .5) * 8; Q.dy += (rnd(jit, 63) - .5) * 6; } // re-laid on the glass for each new paste-up
  if (last) { Q.dx += (rnd(f2, 64) - .5) * 1.4; Q.dy += (rnd(f2, 65) - .5) * 1.4; Q.rot += (rnd(f2, 66) - .5) * .0004; }
  Q.nIdx = last ? f2 % 8 : k * 3 + 2; Q.nx = last ? rnd(f2, 67) * 1024 : k * 241 + P.key * 7; Q.ny = last ? rnd(f2, 68) * 1024 : k * 163 + P.key * 5;
  return Q;
}
const R3C_STAMP_GEN = 4; // the stamp lands on the gen-4 copy (the blue run); every copy made from it carries it
function r3cLeafCopies(P, t, f) {
  const [G] = r3cLeafGen(P, t), pi = r3cPanelOf(P, t), f2 = Math.floor(f / 2);
  for (let k = 1; k <= G; k++) {
    const glass = P.key === 13 && k === R3C_STAMP_GEN + 1 ? (A) => r3cLeafStampDraw(A, t, false) : null;
    xpass(R3C_XG[k - 1], R3C_XG[k], r3cLeafPass(P, k, k === G, pi, f2), glass);
  }
  solidAreas(R3C_XG[G], .32, G, G * 50, G * 30);
  return G;
}
// The finished pages 11 and 12, run off three times, for the tail. Fixed renders, built once on first use.
const R3C_CACHE = {};
function r3cLeafCache(idx) {
  if (R3C_CACHE[idx]) return R3C_CACHE[idx];
  const P = R3C_PAGES[idx], t = P.t1 - 1 / 24, pi = r3cPanelOf(P, t);
  r3cLeafMaster(P, t);
  for (let k = 1; k <= 3; k++) xpass(R3C_XG[k - 1], R3C_XG[k], r3cLeafPass(P, k, false, pi, 0), null);
  const c = mkCanvas(SW, SH); c.getContext('2d').drawImage(R3C_XG[3], 0, 0); solidAreas(c, .32, 3, 150 + idx * 20, 90 + idx * 10);
  R3C_CACHE[idx] = c; return c;
}

// ---- camera and frame -------------------------------------------------------------------------------------------------
function r3cLeafCam(P, t) {
  if (P.key === 13 && t >= R3C_T14) { const u = ease(t, 333.2, 337.4); return { cx: lerp(1000, 1000, u), cy: lerp(560, 600, u), z: lerp(.915, .47, u) }; }
  const T = P.panels; let i = 0; while (i + 1 < T.length && T[i + 1] - R3C_EARLY <= t) i++;
  const c = P.cams[i], a = T[i], b = T[i + 1] || P.t1, u = smooth((t - a) / (b - a)); return { cx: c[0], cy: c[1], z: lerp(c[2], c[3], u) };
}
const R3C_UNDER = [{ dx: -70, dy: 34, r: -.024 }, { dx: 62, dy: -30, r: .018 }, { dx: -34, dy: -50, r: .012 }, { dx: 80, dy: 44, r: -.015 }, { dx: -48, dy: 58, r: .026 }];
// The tail: on each of the band's last hits another copy lands on the desk, fanned round the pile.
const R3C_TAILSHEETS = [
  { src: 'p11', paper: R3C_PAPER.lilac2, dx: -1180, dy: -560, r: -.09, from: [-2600, -900] },
  { src: 'p12', paper: R3C_PAPER.orange2, dx: 1200, dy: -520, r: .07, from: [2700, -800] },
  { src: 5, paper: R3C_PAPER.green, dx: -1130, dy: 600, r: .05, from: [-2700, 1200] },
  { src: 3, paper: R3C_PAPER.pink, dx: 1170, dy: 620, r: -.08, from: [2700, 1300] },
  { src: 2, paper: R3C_PAPER.yellow, dx: 40, dy: -1020, r: .03, from: [300, -2600] },
];
function r3cLeafSheetOnDesk(g, cv, paper, dx, dy, r, k, shadow = .45) {
  g.save(); g.translate(SW / 2 + dx, SH / 2 + dy); g.rotate(r); g.translate(-SW / 2, -SH / 2);
  g.shadowColor = `rgba(0,0,0,${shadow})`; g.shadowBlur = 18; g.shadowOffsetY = 4; g.fillStyle = paper; g.fillRect(0, 0, SW, SH); g.shadowColor = 'transparent';
  printCopy(g, cv, paper, .05, k * 40 + 17, k * 70 + 31); g.restore();
}

function r3cLeafRenderFrame(t) {
  const f = Math.round(t * 24), P = R3C_PAGES[r3cPageOf(t)], g = r3cG;
  buildXerox();
  const tail = P.key === 13 && t >= R3T.hits[0] - .35;
  const caches = tail ? { p11: r3cLeafCache(0), p12: r3cLeafCache(1) } : null; // before this frame's master: they borrow the scratch canvases
  r3cLeafMaster(P, t);
  const G = r3cLeafCopies(P, t, f);
  const [, tsG] = r3cLeafGen(P, t);
  const cam = r3cLeafCam(P, t);
  const land = 1 + .028 * (1 - smooth((t - tsG) / .12)) * (tsG > P.t0 ? 1 : 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  const bg = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200); bg.addColorStop(0, '#3a3631'); bg.addColorStop(1, '#1d1b19');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  if (cam.z < .99 && G > 1) { // earlier copies in the pile
    const n = Math.min(G - 1, P.key === 13 ? 3 : 2);
    for (let j = n; j >= 1; j--) { const k = G - j, us = R3C_UNDER[(k + P.key) % R3C_UNDER.length]; r3cLeafSheetOnDesk(g, R3C_XG[k], P.paper[k], us.dx, us.dy, us.r, k); }
  }
  if (tail) R3C_TAILSHEETS.forEach((s, i) => {
    const th = R3T.hits[i], u = ease(t, th - .3, th); if (t < th - .3) return;
    const cv = typeof s.src === 'string' ? caches[s.src] : R3C_XG[s.src];
    const dx = lerp(s.from[0], s.dx, u), dy = lerp(s.from[1], s.dy, u), r = s.r + (1 - u) * (i % 2 ? .5 : -.5);
    r3cLeafSheetOnDesk(g, cv, s.paper, dx, dy, r, 10 + i);
  });
  g.save(); g.translate(SW / 2, SH / 2); g.scale(land, land); g.translate(-SW / 2, -SH / 2);
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 22; g.shadowOffsetY = 6; g.fillStyle = P.paper[G]; g.fillRect(0, 0, SW, SH); g.shadowColor = 'transparent';
  printCopy(g, R3C_XG[G], P.paper[G], .04 + G * .012, G * 40, G * 70);
  if (G >= 2) { // a staple through the pile, top left
    g.save(); g.translate(70, 64); g.rotate(-.62);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-36, 3, 74, 7);
    const sg = g.createLinearGradient(0, -4, 0, 4); sg.addColorStop(0, '#d8d8d4'); sg.addColorStop(.5, '#8d8d88'); sg.addColorStop(1, '#55554f');
    g.fillStyle = sg; g.fillRect(-38, -3, 76, 6); g.restore();
  }
  if (P.key === 13 && G === R3C_STAMP_GEN) r3cLeafStampDraw(g, t, true);
  g.restore();
  g.restore();
  drawGrain(g, t, .05);
}

const R3C_READY = (async () => {
  try { await Promise.all([document.fonts.load('100px "LetraBC"'), document.fonts.load('100px "Courier New"'), document.fonts.load('64px "Marker Felt"')]); } catch (e) { }
  r3cLeafLayout(mkCanvas(10, 10).getContext('2d'));
  buildXerox(); r3cLeafMakeStamp();
  return true;
})();

// Caption audit (debug only, draws nothing): every line from its first onset to the later of the next line's start and
// 1.2 s after its last word must sit whole in the frame with cap >= 44 px; and no caption box may cover a head.
window.__auditR3c = () => {
  const bad = [], C = [SW / 2, SH / 2]; let minCap = 1e9, minMargin = 1e9;
  const all = R3C_LEAF_LINES;
  const need = all.map((l, i) => [Math.max(R3C_T0, l.words[0].s - R3C_EARLY), Math.min(R3C_T1, Math.max(i + 1 < all.length ? all[i + 1].s : R3C_T1, l.words[l.words.length - 1].e + 1.2))]);
  const f0 = 5782, f1 = 8171;
  for (let fi = f0; fi < f1; fi++) {
    const t = fi / 24, P = R3C_PAGES[r3cPageOf(t)], [G, tsG] = r3cLeafGen(P, t), pi = r3cPanelOf(P, t), cam = r3cLeafCam(P, t), sp = r3cLeafScroll(P, t);
    const land = 1 + .028 * (1 - smooth((t - tsG) / .12)) * (tsG > P.t0 ? 1 : 0);
    const map = (x, y) => { for (let k = 1; k <= G; k++) { const Q = r3cLeafPass(P, k, false, pi, 0);
        const ux = (x - C[0]) * Q.sc, uy = (y - C[1]) * Q.sc; x = C[0] + Q.dx + ux * Math.cos(Q.rot) - uy * Math.sin(Q.rot); y = C[1] + Q.dy + ux * Math.sin(Q.rot) + uy * Math.cos(Q.rot); }
      x = (x - C[0]) * land + C[0]; y = (y - C[1]) * land + C[1]; return [(x - cam.cx) * cam.z + W / 2, (y - cam.cy) * cam.z + H / 2]; };
    let sc = land * cam.z; for (let k = 1; k <= G; k++) sc *= R3C_PASS[k].sc;
    all.forEach((l, li) => {
      if (t < need[li][0] || t > need[li][1]) return;
      minCap = Math.min(minCap, R3C_TW.cap * sc);
      const rows = P.rows.filter(r => r.line === l.i && t >= r.s - R3C_EARLY);
      if (!rows.length) { bad.push({ t: +t.toFixed(3), line: l.i, why: 'missing' }); return; }
      for (const row of rows) {
        const slot = row.r - sp, y = R3C_TW.base + slot * R3C_TW.pitch, last = row.words[row.words.length - 1], x1 = R3C_TW.x + (last.col + last.w.length) * r3cADV;
        if (slot < -.001 || slot > 3.001) { bad.push({ t: +t.toFixed(3), line: l.i, row: row.r, why: 'scrolled out', slot: +slot.toFixed(2) }); continue; }
        for (const [px, py] of [[R3C_TW.x, y - R3C_TW.cap - 6], [x1, y - R3C_TW.cap - 6], [R3C_TW.x, y + r3cFS * .24], [x1, y + r3cFS * .24]]) {
          const [sx, sy] = map(px, py), mm = Math.min(sx, W - sx, sy, H - sy); minMargin = Math.min(minMargin, mm);
          if (mm < 10) bad.push({ t: +t.toFixed(3), line: l.i, row: row.r, why: 'off frame', sx: Math.round(sx), sy: Math.round(sy) });
        }
      }
    });
  }
  return { bad: bad.slice(0, 40), nBad: bad.length, minCap: +minCap.toFixed(1), minMargin: Math.round(minMargin) };
};
// Faces: every frame (step 1), draw the picture with head boxes recorded and test them (in master coordinates)
// against every caption box: the typed window, the headline once it is down, and the stamp.
window.__facesR3c = (step = 1) => {
  const hits = []; let nHeads = 0, minGap = 1e9;
  const inter = (a, b) => !(a[0] + a[2] <= b[0] || b[0] + b[2] <= a[0] || a[1] + a[3] <= b[1] || b[1] + b[3] <= a[1]);
  for (let fi = 5782; fi < 8171; fi += step) {
    const t = fi / 24, P = R3C_PAGES[r3cPageOf(t)];
    R3C_HEADS.on = true; R3C_HEADS.list = []; r3cLeafPicture(P, t); R3C_HEADS.on = false;
    const caps = [['typed window', [R3C_TW.x - 40, R3C_TW.y, R3C_TW.right - R3C_TW.x + 80, R3C_TW.h]]];
    const hs = P.head.map(([i, k]) => r3cS(i, k)); if (t >= hs[0] - R3C_EARLY) caps.push(['headline', [R3C_MAST.x, R3C_MAST.base - R3C_MAST.cap - 12, 1750, R3C_MAST.cap + 40]]);
    if (P.key === 13 && t >= R3T.r128 - R3C_EARLY) { const [w, h] = R3C_STAMP.box, s = R3C_STAMP_AT.sc * 1.35; caps.push(['stamp', [R3C_STAMP_AT.x - w / 2 * s, R3C_STAMP_AT.y - h / 2 * s, w * s, h * s]]); }
    for (const hb of R3C_HEADS.list) {
      nHeads++;
      const vis = [Math.max(0, hb[0]), Math.max(0, hb[1]), Math.min(PBW, hb[0] + hb[2]) - Math.max(0, hb[0]), Math.min(PBH, hb[1] + hb[3]) - Math.max(0, hb[1])]; // the box clips the picture
      if (vis[2] <= 0 || vis[3] <= 0) continue;
      const mb = [vis[0] + R3C_PB.x, vis[1] + R3C_PB.y, vis[2], vis[3]];
      for (const [name, cb] of caps) { if (inter(mb, cb)) hits.push({ f: fi, cap: name, head: mb.map(Math.round) }); else minGap = Math.min(minGap, Math.max(cb[1] - (mb[1] + mb[3]), mb[1] - (cb[1] + cb[3]), cb[0] - (mb[0] + mb[2]), mb[0] - (cb[0] + cb[2]))); }
    }
  }
  return { nHeads, nHits: hits.length, hits: hits.slice(0, 20), minGap: Math.round(minGap) };
};
window.__rowsR3c = () => R3C_PAGES.map(P => P.rows.map(r => ({ r: r.r, line: r.line, s: r.s, carried: r.carried, text: r.words.map(w => w.w).join(' ') })));
startPage(r3cOut, r3cLeafRenderFrame, R3C_T0, R3C_T1, R3C_READY);
