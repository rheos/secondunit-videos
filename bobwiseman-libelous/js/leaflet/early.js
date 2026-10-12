// Round 2: stanzas 8 (the workers) and 9 (the factory farms), song 165.083333-213.458333, frames f3962-f5123.
// Two earlier pages of the couple's leaflet, made the same way as the stanza-10 page in main.js: typed copy,
// a rub-down headline, fineliner pictures in the ruled box, then run off on the copier (cream master copy,
// then copies on the page's own colour). Loaded BEFORE main.js; everything here runs at call time only, and
// uses main.js's layout (TW, MAST, PB, PASS, FS, ADV, LFS, EARLY) and scratch canvases (MS, PIC, XG).
// renderEarly(t) is a pure function of t like main.js's renderer. The one cache (EWK, the finished workers
// page copied three times, shown under the farm page in the pile) is a fixed render that never depends on t.
const T8 = 165.083333, T9 = 198.125, T10 = 213.458333; // T9 = song frame 4755, the stanza-9 boundary

// ---- words and times (all from source/lines.json via gen/leaflet_lines_early.js) -----------------------------
const LE = {}; LINES_E.forEach(l => { LE[l.i] = l; });
const wE = (i, k) => { const a = LE[i].words; return a[k < 0 ? a.length + k : k]; };
const sE = (i, k) => wE(i, k).s;
const EB = {
  policy: sE(65, 2), said: sE(65, 3), p1: sE(66, 0), happy: sE(66, 2), little: sE(66, 3), slaves: sE(66, 4),
  w1: sE(67, 0), work: sE(67, 2), night: sE(67, 4), shift: sE(67, 5), holidays: sE(67, 8),
  w2: sE(68, 0), women: sE(68, 3), less: sE(69, 2), twenty: sE(69, 4),
  w3: sE(70, 0), easy: sE(70, 2), train: sE(70, 4), smile: sE(70, 7), plenty: sE(70, 9),
  w4: sE(71, 0), clean: sE(71, 1), toilets: sE(71, 3), w4b: sE(72, 0), grill: sE(72, 3),
  w5: sE(73, 0), parttime: sE(73, 3), here: sE(74, 2), until: sE(74, 3), enlightened: sE(75, 2), union: sE(75, 5), ways: sE(75, 6),
  w6: sE(76, 0), fire: sE(76, 2), quickly: sE(76, 4), heard: sE(76, 7), say: sE(76, 9),
  w7: sE(77, 0), long: sE(77, 5), w7b: sE(78, 0), smelly: sE(78, 2), hot: sE(78, 4), w7c: sE(79, 0), never: sE(79, 3), w7d: sE(80, 0), wages: sE(80, 2), not: sE(80, 4),
  chickens: sE(81, 2), pigs: sE(81, 5), kings: sE(82, 2), factory: sE(82, 3), farms: sE(82, 4),
  f1: sE(83, 0), neverF: sE(83, 2), sun: sE(83, 5), only: sE(84, 0), harm: sE(84, 4),
  f2: sE(85, 0), dying: sE(85, 1), bloody: sE(85, 3), barbaric: sE(85, 5), cruel: sE(85, 7),
  f3: sE(86, 0), along: sE(86, 1), meat: sE(86, 4), urine: sE(86, 6), stool: sE(86, 8),
};
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };

// ---- the two pages ------------------------------------------------------------------------------------------
// gens: when each copy lands (gen 1 = the cream copy of the paste-up being made, then the run on the page's paper).
// head: the rub-down headline, [line, word] on the sung words. under: felt-marker underlines [line, word, double].
// carry: the last lines of the workers page continue at the top of the farm page's typed column (the text runs
// on from page to page), so they stay readable across the cut.
const EPAGES = [
  { t0: T8, t1: T9, lines: range(65, 80), carry: [], head: [[66, 2], [66, 3], [66, 4]], quotes: true,
    under: [[67, 4], [67, 5], [75, 5], [80, 2]], paper: [null, '#efebdf', '#cfdde8', '#c6d7e4'], gens: [T8, EB.w7, EB.w7d],
    panels: [T8, EB.w1, EB.w2, EB.w3, EB.w4, EB.w5, EB.w6, EB.w7],
    camT: [T8, EB.happy - .6, EB.w1, EB.w2, EB.w3, EB.w4, EB.w5, EB.w6, EB.w7], // the first framing is close; it widens for the headline
    cams: [[1000, 640, 1.06, 1.075], [1000, 575, .972, .985], [1000, 590, .99, 1.0], [1000, 590, 1.0, 1.01], [1000, 588, .99, 1.005], [1000, 590, 1.0, 1.01], [1000, 588, .995, 1.01], [1000, 590, 1.0, 1.015], [1000, 584, .985, 1.0]] },
  { t0: T9, t1: T10, lines: range(81, 86), carry: [79, 80], head: [[82, 2], [82, 3], [82, 4]], quotes: false,
    under: [[84, 4], [85, 7, true]], paper: [null, '#efebdf', '#d7e7c5', '#cee0b9'], gens: [T9, EB.f2, EB.f3],
    panels: [T9, EB.f1, EB.f2, EB.f3],
    cams: [[1000, 566, .965, .975], [1000, 592, 1.0, 1.025], [1000, 592, 1.03, 1.0], [1000, 562, .9, .915]] },
];
const pageOf = t => (t < T9 ? 0 : 1);

// ---- typed rows (same rules as the stanza-10 page: four rows, feed up one row before a fifth starts) ------------
function layoutEarly(m) {
  m.font = TYPE_FONT.replace('{s}', FS);
  const maxC = Math.floor((TW.right - TW.x) / ADV);
  for (const P of EPAGES) {
    P.rows = []; let r = 0;
    for (const i of [...P.carry, ...P.lines]) {
      const l = LE[i], carried = P.carry.includes(i);
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
    // headline: measured once, shrunk to fit between the margins
    const words = P.head.map(([i, k]) => wE(i, k).w.toUpperCase());
    let fs = LFS; const fit = (s) => { let w = 0; words.forEach((x, j) => { w += letraWidth(m, x, s) + (j ? s * .28 : 0); }); if (P.quotes) w += 2 * (letraWidth(m, '“', s) + s * .06); return w; };
    while (fs > 60 && fit(fs) > 1880 - MAST.x - 20) fs -= 2;
    P.headFS = fs; P.headWords = words;
  }
}
function scrollPosE(P, t) { let s = 0; for (const row of P.rows) if (row.r >= 4) s += smooth((t - (row.s - .2)) / .16); return s; }

function drawTypedE(m, t, P) {
  const sp = scrollPosE(P, t);
  m.save(); m.beginPath(); m.rect(0, TW.y, SW, TW.h); m.clip();
  m.textBaseline = 'alphabetic';
  for (const row of P.rows) {
    const slot = row.r - sp; if (slot < -1.05 || slot > 3.05 || t < row.s - EARLY) continue;
    const y = TW.base + slot * TW.pitch;
    for (const w of row.words) {
      if (PROBE.on && !row.carried && t >= w.s - EARLY) { // audit: first letter on its onset (and never before this page is on screen)
        probeWord(t, row.line, w.k, (tt) => tt >= w.s - EARLY && tt >= row.s - EARLY && tt >= P.t0);
        if (slot > -0.01 && slot < 3.01) { m.font = TYPE_FONT.replace('{s}', FS); m.textAlign = 'left'; PROBE.text(m, "typed caption", w.w, TW.x + w.col * ADV, y, [TW.x - 40, TW.y, TW.right - TW.x + 80, TW.h], { margin: 2 }); }
      }
      for (let j = 0; j < w.w.length; j++) {
        if (!row.carried && t < w.s + j * w.dt - EARLY) break;
        strike(m, w.w[j], TW.x + (w.col + j) * ADV, y, FS, 5000 + row.line * 37 + w.col + j);
      }
      const ui = P.under.find(u => u[0] === row.line && u[1] === w.k);
      if (ui) {
        const x0 = TW.x + w.col * ADV - 6, x1 = TW.x + (w.col + w.w.length) * ADV + 4, u = row.carried ? 1 : pr(t, w.s + .12, .22);
        marker(m, seg(x0, y + 16, x1, y + 12 + (rnd(row.line, 3) - .5) * 6, 10), u, 9, row.line * 7);
        if (ui[2]) marker(m, seg(x0 + 10, y + 32, x1 - 6, y + 30, 10), row.carried ? 1 : pr(t, w.s + .3, .2), 8, row.line * 9);
      }
    }
  }
  m.restore();
}

// ---- the headline: rub-down letters on the sung words, a mittened hand with a burnisher rubbing them down -----
function drawHeadE(m, t, P) {
  const fs = P.headFS, dt = .055, y = MAST.base;
  pen(m, seg(MAST.x, 240, 1880, 236, 30), pr(t, P.t0 - .3, .3), 5, 910 + P.t0); pen(m, seg(MAST.x, 248, 1880, 245, 30), pr(t, P.t0 - .25, .3), 3, 911 + P.t0);
  const starts = P.head.map(([i, k]) => sE(i, k) - EARLY);
  let x = MAST.x; const cur = []; // every letter's x-span and time, for the hand
  if (P.quotes) { const q = letraWord(m, '“', x, y, fs, t, starts[0], 0, 960); cur.push([q.chars[0], starts[0]]); x = q.x1 + fs * .06; }
  P.headWords.forEach((wd, j) => {
    if (j) x += fs * .28;
    const a = letraWord(m, wd, x, y, fs, t, starts[j], dt, 920 + j * 10 + P.t0);
    a.chars.forEach((c, n) => cur.push([c, starts[j] + n * dt])); x = a.x1;
  });
  const tLast = starts[starts.length - 1] + (P.headWords[P.headWords.length - 1].length - 1) * dt;
  if (P.quotes) { const q = letraWord(m, '”', x + fs * .04, y, fs, t, tLast + .09, 0, 970); cur.push([q.chars[0], tLast + .09]); }
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

// ---- small fineliner things for these pages ----------------------------------------------------------------------
function crownPts(cx, cy, w, h) { return [[cx - w / 2, cy], [cx - w / 2, cy - h], [cx - w / 4, cy - h * .45], [cx, cy - h * 1.15], [cx + w / 4, cy - h * .45], [cx + w / 2, cy - h], [cx + w / 2, cy]]; }
function rect(x, y, w, h) { return poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true); }
function chicken(p, x, y, s, prog, seed, dir = 1) { // a hen, side on, feet at (x, y), body length ~s
  const items = [], bx = x, by = y - s * .55, D = (u, v) => [bx + dir * u * s, by + v * s];
  items.push({ p: poly([D(-.42, -.05), D(-.5, -.32), D(-.3, -.12), D(-.05, -.22), D(.18, -.2), D(.3, -.42), D(.42, -.48), D(.5, -.38), D(.46, -.2), D(.38, .08), D(.15, .25), D(-.2, .24), D(-.4, .1)], true), w: 4, white: true });
  items.push({ p: poly([D(.36, -.5), D(.39, -.6), D(.43, -.52), D(.47, -.62), D(.5, -.49)]), w: 3.5 });
  items.push({ p: poly([D(.5, -.4), D(.6, -.36), D(.5, -.32)]), w: 3.5 });
  items.push({ p: [D(.42, -.4)], dot: 2.6 });
  items.push({ p: quad(D(-.12, -.02), D(.05, .12), D(.18, -.04), 8), w: 3 });
  items.push({ p: seg(...D(-.02, .24), ...D(-.04, .55), 2), w: 3.5 }, { p: seg(...D(.1, .24), ...D(.12, .55), 2), w: 3.5 });
  drawSet(p, items, prog, seed, .7);
}
function pig(p, x, y, s, prog, seed, dir = 1) { // a pig, side on, feet at (x, y), body length ~s
  const items = [], cx = x, cy = y - s * .42, D = (u, v) => [cx + dir * u * s, cy + v * s];
  items.push({ p: ell(cx, cy, s * .5, s * .3), w: 4, white: true });
  items.push({ p: ell(D(.5, -.04)[0], D(.5, -.04)[1], s * .07, s * .1), w: 3.5, white: true });
  items.push({ p: [D(.49, -.06)], dot: 2 }, { p: [D(.51, -.01)], dot: 2 });
  items.push({ p: poly([D(.3, -.24), D(.36, -.42), D(.42, -.2)]), w: 3.5 });
  items.push({ p: [D(.34, -.1)], dot: 2.6 });
  items.push({ p: quad(D(-.5, -.06), D(-.66, -.24), D(-.6, .0), 8), w: 3 });
  for (const u of [-.32, -.18, .18, .32]) items.push({ p: seg(...D(u, .26), ...D(u, .42), 2), w: 4 });
  drawSet(p, items, prog, seed, .7);
}
function cell(p, x0, x1, prog, seed) { pen(p, rect(x0 + 6, 6, x1 - x0 - 12, PBH - 12), prog, 4.5, seed, 1.2); }
function handLetters(p, word, x, y, fs, t, t0, seed, dt = .03) { // hand-lettered caps on a label, letter by letter
  p.save(); p.font = HAND_FONT.replace('{s}', fs); p.fillStyle = '#000'; p.textBaseline = 'alphabetic';
  let cx = x; for (let i = 0; i < word.length; i++) { const cw = p.measureText(word[i]).width; if (t >= t0 + i * dt) { p.save(); p.translate(cx, y + (rnd(seed, i) - .5) * 4); p.rotate((rnd(seed + 1, i) - .5) * .07); p.fillText(word[i], 0, 0); p.restore(); } cx += cw * 1.04; }
  p.restore(); return cx;
}
function handWidth(p, word, fs) { p.save(); p.font = HAND_FONT.replace('{s}', fs); const w = p.measureText(word).width * 1.04; p.restore(); return w; }
function counterFront(p, x0, x1, y, prog, seed) { // a shop counter: white front hides legs, top edge, panel lines
  if (prog >= 1) { p.fillStyle = '#fff'; p.fillRect(x0, y, x1 - x0, GY - y); }
  pen(p, poly([[x0, GY], [x0, y], [x1, y], [x1, GY]]), prog, 5, seed); pen(p, seg(x0 - 14, y, x1 + 14, y, 20), prog, 7, seed + 1);
  for (let k = 1; k < 4; k++) pen(p, seg(lerp(x0, x1, k / 4), y + 14, lerp(x0, x1, k / 4), GY - 6, 3), pr(prog, .5, .5), 3, seed + 2 + k);
}
const W_FIG = { cap: true, apron: true }; // a worker: paper cap, apron

// ---- the workers page, panel by panel (picture box coordinates, PBW x PBH, ground at GY) -------------------------
function drawWorkPic(p, t, pi) {
  if (pi === 0) { // the notice board with the policy, the crew lined up under it
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 1001);
    pen(p, rect(110, 26, 470, 300), 1, 5, 1002); pen(p, rect(124, 40, 442, 272), 1, 3, 1003); // cork board
    p.save(); p.translate(345, 176); p.rotate(-.03);
    p.fillStyle = '#fff'; p.fillRect(-150, -126, 300, 252); pen(p, rect(-150, -126, 300, 252), 1, 4.5, 1004);
    for (let k = 0; k < 7; k++) pen(p, seg(-118, -40 + k * 22, 118 - (k === 6) * 90, -40 + k * 22, 6), 1, 4, 1005 + k); // the policy's lines
    pen(p, poly(crownPts(0, -64, 92, 42), true), pr(t, EB.policy - EARLY, .25), 5, 1015); // the king's seal on it
    p.beginPath(); p.arc(0, -126, 8, 0, TAU); p.fillStyle = '#000'; p.fill(); // the pin
    p.restore();
    if (t >= EB.said - EARLY) pen(p, poly([[600, 150], [700, 170], [772, 200]]).concat(poly([[748, 178], [772, 200], [742, 210]])), pr(t, EB.said - EARLY, .25), 5, 1020);
    const grin = t >= EB.happy - EARLY;
    [[880, 0], [1110, 1], [1340, 0], [1570, 1]].forEach(([x, wmn], k) => {
      person(p, Object.assign({ x, y: GY, h: 300, woman: !!wmn, pony: !!wmn, mouth: grin ? 'grin' : 'line', look: -.5 }, W_FIG), 1, 1030 + k * 11);
      if (t >= EB.slaves - EARLY) { // a crown badge stamped on every cap
        const r = 30, hx = x, hy = GY - 300 + r;
        pen(p, poly(crownPts(hx, hy - r * .88, 30, 14), true), pr(t, EB.slaves - EARLY + k * .06, .12), 3.5, 1080 + k);
      }
    });
  } else if (pi === 1) { // the counter at night, through the holidays
    pen(p, rect(90, 24, 300, 190), pr(t, EB.w1 - EARLY, .3), 5, 1101); pen(p, seg(240, 24, 240, 214, 6), pr(t, EB.w1, .2), 4, 1102); pen(p, seg(90, 119, 390, 119, 6), pr(t, EB.w1, .2), 4, 1103);
    if (t >= EB.night - EARLY) { // the window goes dark: hatching, a moon, stars
      hatch(p, [[90, 24], [390, 24], [390, 214], [90, 214]], .8, 13, pr(t, EB.night - EARLY, .3), 3, 1104);
      p.fillStyle = '#fff'; p.beginPath(); p.arc(170, 74, 34, 0, TAU); p.fill(); p.fillStyle = '#000'; p.beginPath(); p.arc(186, 66, 30, 0, TAU); p.fill();
      pen(p, ell(170, 74, 34, 34, .9, 5.4), 1, 4, 1105);
      for (const [sx, sy] of [[300, 60], [330, 160], [140, 170]]) { p.fillStyle = '#fff'; p.beginPath(); p.arc(sx, sy, 14, 0, TAU); p.fill(); pen(p, seg(sx - 12, sy, sx + 12, sy, 2), 1, 4, sx); pen(p, seg(sx, sy - 12, sx, sy + 12, 2), 1, 4, sy); }
    }
    { // the clock: it reads three, the hand steps round on "shift"
      const cx = 1640, cy = 110, R = 70, u = ease(t, EB.shift - EARLY, EB.shift + .25);
      pen(p, ell(cx, cy, R, R), pr(t, EB.w1, .3), 5, 1110);
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; pen(p, seg(cx + Math.cos(a) * (R - 8), cy + Math.sin(a) * (R - 8), cx + Math.cos(a) * (R - 18), cy + Math.sin(a) * (R - 18), 1), pr(t, EB.w1 + .1, .2), 3.5, 1111 + k); }
      const am = -Math.PI / 2 + u * TAU, ah = -Math.PI / 2 + (3 + u) / 12 * TAU;
      pen(p, seg(cx, cy, cx + Math.cos(am) * R * .78, cy + Math.sin(am) * R * .78, 3), 1, 5, 1125, .4); pen(p, seg(cx, cy, cx + Math.cos(ah) * R * .5, cy + Math.sin(ah) * R * .5, 3), 1, 7, 1126, .4);
    }
    [[700, 0], [960, 1], [1220, 0]].forEach(([x, wmn], k) => person(p, Object.assign({ x, y: GY, h: 290, woman: !!wmn, pony: !!wmn, mouth: 'line', look: (k - 1) * .4 }, W_FIG), pr(t, EB.w1 - EARLY + k * .08, .35), 1130 + k * 11));
    if (t >= EB.work - EARLY) for (let k = 0; k < 3; k++) { // trays held up over the counter
      const x = 700 + k * 260, y = 196 - 8 * Math.sin(clamp((t - EB.work) * 6 - k * .5) * Math.PI);
      pen(p, seg(x - 70, y, x + 70, y, 6), pr(t, EB.work - EARLY + k * .06, .12), 5, 1160 + k);
      for (let j = 0; j < 2; j++) pen(p, ell(x - 26 + j * 52, y - 13, 22, 12, Math.PI, TAU), pr(t, EB.work + .05 + k * .06, .1), 4, 1165 + k * 2 + j);
    }
    counterFront(p, 520, 1420, 214, pr(t, EB.w1 - EARLY, .4), 1170);
    if (t >= EB.holidays - EARLY) { // bunting strung across the top
      const pts = quad([430, 14], [960, 74], [1520, 14], 24); pen(p, pts, pr(t, EB.holidays - EARLY, .2), 4, 1180);
      for (let k = 1; k < 12; k++) { const a = pts[k * 2], u = pr(t, EB.holidays + k * .03, .06); if (u > 0) pen(p, poly([[a[0] - 18, a[1]], [a[0], a[1] + 38], [a[0] + 18, a[1]]], true), u, 4, 1181 + k); if (u >= 1 && k % 2) { p.fillStyle = '#000'; fillPoly(p, [[a[0] - 18, a[1]], [a[0], a[1] + 38], [a[0] + 18, a[1]]]); } }
    }
  } else if (pi === 2) { // mostly women, young: three of them, satchels at their feet
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 1201);
    [[560, 300], [900, 285], [1240, 305]].forEach(([x, h], k) => {
      person(p, Object.assign({ x, y: GY, h, woman: true, pony: true, mouth: t >= EB.less ? 'smile' : 'line', look: (k - 1) * -.3 }, W_FIG), pr(t, EB.w2 - EARLY + k * .1, .4), 1210 + k * 13);
      if (t >= EB.twenty - EARLY) { // a school satchel by each one's feet
        const bx = x + 95, by = GY - 4, u = pr(t, EB.twenty - EARLY + k * .07, .2);
        pen(p, rect(bx - 34, by - 60, 68, 60), u, 4.5, 1250 + k); pen(p, poly([[bx - 34, by - 44], [bx, by - 26], [bx + 34, by - 44]]), u, 4, 1255 + k);
        pen(p, ell(bx, by - 62, 18, 14, Math.PI, TAU), u, 4, 1260 + k);
      }
    });
  } else if (pi === 3) { // the training chart: the boss taps it, the smile is drawn, then copied onto them
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 1301);
    pen(p, rect(170, 18, 440, 300), pr(t, EB.w3 - EARLY, .3), 5, 1302); // the chart on its easel
    pen(p, seg(250, 318, 210, GY, 3), pr(t, EB.w3, .2), 5, 1303); pen(p, seg(530, 318, 570, GY, 3), pr(t, EB.w3, .2), 5, 1304);
    const cx = 390, cy = 160; pen(p, ell(cx, cy, 108, 108), pr(t, EB.w3, .3), 5, 1305);
    p.fillStyle = '#000'; if (t > EB.w3 + .2) { p.beginPath(); p.arc(cx - 38, cy - 30, 10, 0, TAU); p.arc(cx + 38, cy - 30, 10, 0, TAU); p.fill(); }
    pen(p, quad([cx - 62, cy + 20], [cx, cy + 92], [cx + 62, cy + 20], 14), pr(t, EB.train - EARLY, .3), 7, 1306); // the smile, on "train"
    if (t >= EB.train) for (const sd of [-1, 1]) pen(p, poly([[cx + sd * 150, cy + 90], [cx + sd * 78, cy + 30]]).concat(poly([[cx + sd * 96, cy + 34], [cx + sd * 78, cy + 30], [cx + sd * 82, cy + 50]])), pr(t, EB.train + .15, .2), 4, 1307 + sd);
    if (t >= EB.plenty - EARLY) for (let k = 0; k < 4; k++) { // plenty: little smiles stamped round the chart
      const sx = [215, 565, 215, 565][k], sy = [48, 48, 290, 290][k], u = pr(t, EB.plenty - EARLY + k * .05, .1);
      pen(p, ell(sx, sy, 22, 22), u, 3.5, 1310 + k); pen(p, quad([sx - 12, sy + 3], [sx, sy + 16], [sx + 12, sy + 3], 6), u, 3, 1315 + k);
    }
    const tap = t >= EB.easy - EARLY ? Math.abs(Math.sin((t - EB.easy) * 9)) * clamp(1 - (t - EB.easy) / 1.2) : 0;
    person(p, { x: 800, y: GY, h: 320, tophat: true, mouth: 'line', look: -1, facing: -1, armL: [1.55 + tap * .2, .15] }, pr(t, EB.w3 - EARLY, .45), 1320);
    pen(p, seg(705, 160 - tap * 10, 545, 120 - tap * 18, 3), pr(t, EB.w3 + .2, .2), 4, 1321); // his pointer
    const sm = t >= EB.smile - EARLY;
    [[1160, 300], [1440, 290]].forEach(([x, h], k) => person(p, Object.assign({ x, y: GY, h, woman: true, pony: true, mouth: sm ? 'grin' : 'line', look: -.8 }, W_FIG), pr(t, EB.w3 + .1 + k * .1, .4), 1330 + k * 13));
  } else if (pi === 4) { // two cells: the toilets, then the grill
    cell(p, 0, 900, pr(t, EB.w4 - EARLY, .25), 1401); cell(p, 900, PBW, pr(t, EB.w4b - EARLY, .25), 1402);
    pen(p, seg(16, GY - 6, 884, GY - 6, 20), 1, 4, 1403);
    if (t >= EB.toilets - EARLY) for (let k = 0; k < 3; k++) { // three cubicle doors, gaps at the bottom
      const x = 50 + k * 150, u = pr(t, EB.toilets - EARLY + k * .06, .2);
      pen(p, poly([[x, GY - 30], [x, 40], [x + 130, 40], [x + 130, GY - 30]], true), u, 4.5, 1410 + k);
      pen(p, ell(x + 105, 190, 7, 7), u, 3.5, 1415 + k); pen(p, rect(x + 40, 62, 50, 14), u, 3, 1418 + k);
    }
    const sw = t >= EB.clean - EARLY ? Math.sin((t - EB.clean) * 7) : 0, mx = 700 + sw * 40;
    person(p, Object.assign({ x: 640, y: GY - 6, h: 280, mouth: 'line', look: .5, armR: [.55, .3], armL: [.35, .5] }, W_FIG), pr(t, EB.w4 - EARLY, .4), 1420);
    pen(p, seg(mx + 40, 120, mx, GY - 22, 4), pr(t, EB.w4 + .2, .2), 5, 1421); // mop handle
    for (let k = 0; k < 6; k++) pen(p, seg(mx - 22, GY - 22, mx - 34 + k * 14, GY - 4, 2), pr(t, EB.w4 + .3, .1), 4, 1422 + k);
    if (t >= EB.clean - EARLY) for (let k = 0; k < 3; k++) pen(p, quad([530 + k * 60, GY - 8], [600 + k * 60, GY - 20], [670 + k * 60, GY - 8], 8), pr(t, EB.clean - EARLY + k * .1, .2), 3, 1430 + k); // wet swirls
    if (t >= EB.w4b - EARLY) { // the grill, a worker with a slice, patties; smoke and a flip on "grill"
      const gx = 1330, gy = 236, flip = ease(t, EB.grill - EARLY, EB.grill + .3);
      pen(p, rect(gx - 230, gy, 460, 40), pr(t, EB.w4b - EARLY, .25), 5, 1440); pen(p, seg(gx - 210, gy + 40, gx - 210, GY - 6, 3), pr(t, EB.w4b, .2), 5, 1441); pen(p, seg(gx + 210, gy + 40, gx + 210, GY - 6, 3), pr(t, EB.w4b, .2), 5, 1442);
      for (let k = 0; k < 9; k++) pen(p, seg(gx - 210 + k * 52, gy + 8, gx - 210 + k * 52, gy + 32, 1), pr(t, EB.w4b + .1, .2), 3, 1443 + k);
      for (let k = 0; k < 4; k++) { const px = gx - 150 + k * 100, lift = k === 1 ? Math.sin(flip * Math.PI) * 70 : 0; p.save(); p.translate(px, gy - 10 - lift); p.rotate(k === 1 ? flip * Math.PI : 0); pen(p, ell(0, 0, 38, 11), pr(t, EB.w4b + .15 + k * .05, .15), 4.5, 1455 + k); p.restore(); }
      person(p, Object.assign({ x: 1700, y: GY - 6, h: 270, woman: true, pony: true, mouth: 'line', look: -1, facing: -1, armL: [1.2 + flip * .3, .5] }, W_FIG), pr(t, EB.w4b - EARLY, .4), 1460);
      if (t >= EB.grill - EARLY) for (let k = 0; k < 4; k++) { const x0 = gx - 160 + k * 105, s = []; for (let i = 0; i <= 12; i++) s.push([x0 + Math.sin(i * .8 + t * 6 + k) * 12, gy - 30 - i * 15]); pen(p, s, pr(t, EB.grill - EARLY + k * .06, .3), 3.5, null); }
    }
  } else if (pi === 5) { // the time clock; the bulb; arms linked for the union
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 1501);
    const cx0 = 150, u0 = pr(t, EB.w5 - EARLY, .3);
    pen(p, rect(cx0 - 80, 60, 160, 210), u0, 5, 1502); pen(p, ell(cx0, 130, 50, 50), u0, 4.5, 1503); pen(p, rect(cx0 - 40, 210, 80, 22), u0, 4, 1504);
    const spin = ease(t, EB.here - .1, EB.until + .6) * 2 * TAU; // the hands go round and round
    pen(p, seg(cx0, 130, cx0 + Math.sin(spin) * 40, 130 - Math.cos(spin) * 40, 2), 1, 4.5, 1505, .3); pen(p, seg(cx0, 130, cx0 + Math.sin(spin / 12 + 2) * 26, 130 - Math.cos(spin / 12 + 2) * 26, 2), 1, 6, 1506, .3);
    for (let k = 0; k < 5; k++) pen(p, rect(270 + k * 26, 90, 20, 110), pr(t, EB.w5 + k * .05, .15), 3, 1507 + k); // the card rack
    const card = ease(t, EB.parttime - EARLY - .2, EB.parttime + .05), punched = t >= EB.parttime - EARLY;
    person(p, Object.assign({ x: 470, y: GY, h: 290, mouth: 'line', look: -1, facing: -1, armL: [1.3 + .2 * card, .3] }, W_FIG), pr(t, EB.w5 - EARLY, .4), 1515);
    p.save(); p.translate(lerp(330, cx0 + 6, card), lerp(210, 222, card)); p.rotate(-.1 * (1 - card)); p.fillStyle = '#fff'; p.fillRect(-14, -50, 28, 70); pen(p, rect(-14, -50, 28, 70), 1, 3.5, 1516); p.restore();
    if (punched) for (let k = 0; k < 3; k++) pen(p, seg(cx0 + 90 + k * 6, 200 - k * 26, cx0 + 120 + k * 10, 186 - k * 30, 2), pr(t, EB.parttime - EARLY + k * .03, .08), 4, 1517 + k); // clunk
    const lit = t >= EB.enlightened - EARLY, linked = ease(t, EB.union - EARLY, EB.union + .25);
    [[860, 0], [1110, 1], [1360, 0], [1610, 1]].forEach(([x, wmn], k) => {
      const up = [lerp(.15, 2.75, linked), lerp(.1, -.25, linked), false];
      person(p, Object.assign({ x, y: GY, h: 250, woman: !!wmn, pony: !!wmn, mouth: lit ? 'smile' : 'line', look: 0, armL: k ? up : [.15, .1], armR: k < 3 ? up : [.15, .1] }, W_FIG), pr(t, EB.w5 + .1 + k * .08, .4), 1520 + k * 13);
    });
    if (lit) { // a light bulb over the first one's head
      const bx = 860, by = 50, u = pr(t, EB.enlightened - EARLY, .2);
      pen(p, ell(bx, by + 4, 24, 26), u, 4.5, 1570); pen(p, rect(bx - 12, by + 28, 24, 16), u, 4, 1571);
      for (let k = 0; k < 7; k++) { const a = Math.PI + k / 6 * Math.PI; pen(p, seg(bx + Math.cos(a) * 36, by + 4 + Math.sin(a) * 36, bx + Math.cos(a) * 56, by + 4 + Math.sin(a) * 56, 1), pr(t, EB.enlightened + .1 + k * .03, .06), 4, 1572 + k); }
    }
    if (t >= EB.union - EARLY) { // a strip of card held up between their mittens, hand-lettered with the sung word
      const wd = wE(75, 5).w.toUpperCase(), u = pr(t, EB.union - EARLY, .2);
      pen(p, poly([[1060, 14], [1660, 8], [1660, 84], [1060, 90]], true), u, 5, 1580);
      if (t >= EB.union - EARLY + .05) { const fs = 62, ww = handWidth(p, wd, fs); handLetters(p, wd, 1360 - ww / 2, 72, fs, t, EB.union - EARLY + .05, 1581, .04); }
    }
  } else if (pi === 6) { // fired: the boss points at the door, out goes the one with ideas; the wall has ears
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 1601);
    pen(p, poly([[1490, GY], [1490, 40], [1700, 40], [1700, GY]]), pr(t, EB.w6 - EARLY, .3), 6, 1602);
    const open = ease(t, EB.fire, EB.fire + .3); pen(p, poly([[1490, GY], [1490, 40], [1490 + 210 * (1 - .75 * open), 56 * open + 40], [1490 + 210 * (1 - .75 * open), GY - 12 * open]], true), pr(t, EB.w6, .3), 5, 1603);
    if (open > .05) hatch(p, [[1490 + 210 * (1 - .75 * open), 40 + 56 * open], [1700, 40], [1700, GY], [1490 + 210 * (1 - .75 * open), GY - 12 * open]], .9, 10, 1, 3, 1604);
    const pt = ease(t, EB.fire - EARLY, EB.fire + .12);
    person(p, { x: 420, y: GY, h: 330, tophat: true, mouth: t >= EB.fire - EARLY ? 'o' : 'line', look: 1, facing: 1, armR: [lerp(.2, 1.62, pt), lerp(.1, 0, pt)] }, pr(t, EB.w6 - EARLY, .4), 1610);
    const go = ease(t, EB.quickly - EARLY, EB.quickly + .5), wx = lerp(900, 1600, go);
    if (go < 1) {
      person(p, Object.assign({ x: wx, y: GY, h: 280, mouth: 'frown', look: 1, facing: 1, stride: go > 0 ? t * 14 : 0, armL: [.7, 1.2], armR: [.7, 1.2] }, W_FIG), pr(t, EB.w6 - EARLY + .1, .4), 1620);
      p.fillStyle = '#fff'; p.fillRect(wx - 62, GY - 190, 124, 74); pen(p, rect(wx - 62, GY - 190, 124, 74), pr(t, EB.w6 + .2, .2), 4.5, 1621); // a cardboard box of their things
      pen(p, poly([[wx - 62, GY - 190], [wx - 40, GY - 214], [wx + 40, GY - 214], [wx + 62, GY - 190]]), pr(t, EB.w6 + .3, .2), 4, 1622);
      if (go > 0) for (let k = 0; k < 4; k++) pen(p, seg(wx - 170 - k * 20, GY - 220 + k * 50, wx - 100 - k * 20, GY - 220 + k * 50, 2), 1, 4, 1623 + k); // speed lines
    }
    if (t >= EB.heard - EARLY) { // an ear on the wall
      const ex = 1000, ey = 130, u = pr(t, EB.heard - EARLY, .25);
      const rim = []; for (let i = 0; i <= 28; i++) { const a = -2.6 + i / 28 * 3.9, r = 62 - Math.max(0, a - .6) * 18; rim.push([ex + Math.cos(a) * r * .72, ey + Math.sin(a) * r]); }
      rim.push([ex - 6, ey + 64], [ex - 22, ey + 56], [ex - 30, ey + 36]);
      pen(p, rim, u, 6, 1630);
      pen(p, quad([ex - 18, ey - 30], [ex + 26, ey - 46], [ex + 26, ey + 4], 10).concat(quad([ex + 26, ey + 4], [ex + 22, ey + 24], [ex + 2, ey + 22], 6)), pr(t, EB.heard - EARLY + .1, .2), 4.5, 1631);
      pen(p, ell(ex - 4, ey + 4, 9, 12), pr(t, EB.heard + .2, .1), 4, 1632);
    }
    if (t >= EB.say - EARLY) { // a worker at the back says something: an empty speech balloon
      person(p, Object.assign({ x: 1250, y: GY, h: 250, woman: true, pony: true, mouth: 'o', look: -1, facing: -1 }, W_FIG), 1, 1640);
      pen(p, ell(1180, 60, 70, 40).concat(poly([[1190, 100], [1215, 140], [1220, 98]])), pr(t, EB.say - EARLY, .15), 4.5, 1641);
      for (let k = 0; k < 3; k++) { p.fillStyle = '#000'; p.beginPath(); p.arc(1150 + k * 30, 60, 6, 0, TAU); if (t >= EB.say + k * .04) p.fill(); }
    } else person(p, Object.assign({ x: 1250, y: GY, h: 250, woman: true, pony: true, mouth: 'line', look: -1, facing: -1 }, W_FIG), pr(t, EB.w6, .4), 1640);
  } else { // a strip of four cells, one per complaint
    const C = [[0, 450, EB.w7], [450, 900, EB.w7b], [900, 1350, EB.w7c], [1350, PBW, EB.w7d]];
    C.forEach(([a, b, ts], k) => { if (t >= ts - EARLY) cell(p, a, b, pr(t, ts - EARLY, .2), 1701 + k); });
    { // shifts too long: a clock, a drooping worker; on "long" the time card streams out
      const cx = 140, cy = 120, R = 70, spin = ease(t, EB.long - EARLY, EB.long + .6) * 3 * TAU;
      pen(p, ell(cx, cy, R, R), pr(t, EB.w7, .25), 5, 1710);
      pen(p, seg(cx, cy, cx + Math.sin(spin) * R * .8, cy - Math.cos(spin) * R * .8, 2), 1, 4.5, 1711, .3); pen(p, seg(cx, cy, cx + Math.sin(spin / 12 + 2.5) * R * .5, cy - Math.cos(spin / 12 + 2.5) * R * .5, 2), 1, 6, 1712, .3);
      person(p, Object.assign({ x: 330, y: GY - 10, h: 240, mouth: 'o', look: -.6, hunch: 1 }, W_FIG), pr(t, EB.w7 + .05, .35), 1713);
      if (t >= EB.long - EARLY) { // a long paper time card unrolls out of the clock and across the floor
        p.save(); p.beginPath(); p.rect(10, 10, 432, PBH - 20); p.clip(); // stays inside its cell
        const u = pr(t, EB.long - EARLY, .45), c = []; for (let i = 0; i <= 30; i++) c.push([cx - 30 + i * 13, cy + 84 + Math.min(i, 9) * 15 + Math.sin(i * .6) * 6]);
        pen(p, c, u, 4, 1714, .4); pen(p, c.map(([x, y]) => [x + 8, y - 22]), u, 4, 1715, .4);
        for (let i = 2; i < 30; i += 3) if (i / 30 < u) pen(p, seg(c[i][0], c[i][1], c[i][0] + 8, c[i][1] - 22, 1), 1, 2.5, null);
        p.restore(); }
    }
    if (t >= EB.w7b - EARLY) { // smelly and hot: the fryer
      const fx = 640, fy = 230, u = pr(t, EB.w7b - EARLY, .25);
      pen(p, poly([[fx - 120, fy], [fx + 120, fy], [fx + 100, GY - 14], [fx - 100, GY - 14]], true), u, 5, 1720);
      pen(p, rect(fx - 90, fy - 50, 120, 46), u, 4, 1721); pen(p, seg(fx + 30, fy - 40, fx + 150, fy - 90, 3), u, 4.5, 1722);
      if (t >= EB.smelly - EARLY) for (let k = 0; k < 3; k++) { const s = []; for (let i = 0; i <= 12; i++) s.push([fx - 80 + k * 60 + Math.sin(i * .9 + k) * 14, fy - 60 - i * 11]); pen(p, s, pr(t, EB.smelly - EARLY + k * .08, .3), 4, 1723 + k); }
      person(p, Object.assign({ x: 820, y: GY - 10, h: 230, woman: true, pony: true, mouth: t >= EB.hot ? 'o' : 'line', look: -.8 }, W_FIG), pr(t, EB.w7b, .35), 1726);
      if (t >= EB.hot - EARLY) for (let k = 0; k < 4; k++) { const a = -2.2 + k * .5, hx = 820, hy = GY - 10 - 230 + 23; pen(p, poly([[hx + Math.cos(a) * 44, hy + Math.sin(a) * 44], [hx + Math.cos(a) * 58 + 5, hy + Math.sin(a) * 58], [hx + Math.cos(a) * 72, hy + Math.sin(a) * 72]]), pr(t, EB.hot - EARLY + k * .04, .08), 4, 1727 + k); } // heat marks
    }
    if (t >= EB.w7c - EARLY) { // promotions never: a ladder with no rungs past the first
      const lx = 1120, u = pr(t, EB.w7c - EARLY, .25);
      pen(p, seg(lx - 50, GY - 10, lx - 40, 30, 10), u, 5, 1730); pen(p, seg(lx + 50, GY - 10, lx + 40, 30, 10), u, 5, 1731);
      pen(p, seg(lx - 48, GY - 60, lx + 48, GY - 60, 3), u, 5, 1732);
      for (let k = 1; k < 6; k++) { const y = GY - 60 - k * 48; pen(p, seg(lx - 46, y, lx - 30, y, 1), u, 4, 1733 + k); pen(p, seg(lx + 30, y, lx + 46, y, 1), u, 4, 1739 + k); } // stubs where the rungs were
      person(p, Object.assign({ x: 1250, y: GY - 10, h: 220, mouth: 'line', look: -.6 }, W_FIG), pr(t, EB.w7c + .05, .3), 1745);
      if (t >= EB.never - EARLY) { marker(p, seg(lx - 90, 40, lx + 90, 200, 8), pr(t, EB.never - EARLY, .1), 12, 1746); marker(p, seg(lx + 90, 40, lx - 90, 200, 8), pr(t, EB.never - EARLY + .06, .1), 12, 1747); }
    }
    if (t >= EB.w7d - EARLY) { // the wages: a pay packet, one small coin, then a moth
      const ex = 1560, ey = 200, u = pr(t, EB.w7d - EARLY, .2), op = ease(t, EB.wages - EARLY, EB.wages + .15);
      pen(p, rect(ex - 110, ey - 50, 220, 130), u, 5, 1750); pen(p, poly([[ex - 110, ey - 50], [ex, ey - 50 - 70 * op + 40 * (1 - op)], [ex + 110, ey - 50]]), u, 4.5, 1751);
      if (t >= EB.wages - EARLY) { const fall = ease(t, EB.wages, EB.wages + .25); pen(p, ell(ex + 150, lerp(ey - 40, GY - 26, fall), 14, 14), 1, 4, 1752); }
      if (t >= EB.not - EARLY) { const mt = t - EB.not, mx = ex - 20 + mt * 160, my = ey - 90 - mt * 120 + Math.sin(mt * 30) * 6, fl = Math.abs(Math.sin(mt * 40)); // the moth
        pen(p, ell(mx, my, 6, 12), 1, 4, 1753); pen(p, poly([[mx, my - 4], [mx - 26, my - 18 * fl - 4], [mx - 22, my + 10], [mx, my + 4]]), 1, 3.5, 1754); pen(p, poly([[mx, my - 4], [mx + 26, my - 18 * fl - 4], [mx + 22, my + 10], [mx, my + 4]]), 1, 3.5, 1755); }
    }
  }
}

// ---- the farms page -------------------------------------------------------------------------------------------------
function drawFarmPic(p, t, pi) {
  if (pi === 0) { // the king's long shed in cut-away: hens in cages, pigs in crates, a crown over the door, chimneys
    const u0 = pr(t, T9 - .05, .45);
    pen(p, seg(0, GY, PBW, GY, 30), u0, 5, 2001);
    pen(p, poly([[90, GY], [90, 110], [700, 40], [1310, 110], [1310, GY]]), u0, 6, 2002);
    pen(p, seg(110, 236, 1290, 236, 20), pr(t, T9 + .2, .3), 4, 2003); // a floor between the two tiers
    if (t >= EB.chickens - EARLY) for (let k = 0; k < 7; k++) { // two tiers of wire cages, a hen in each
      const x = 130 + k * 82, u = pr(t, EB.chickens - EARLY + k * .025, .12);
      pen(p, rect(x, 140, 76, 88), u, 3.5, 2010 + k); chicken(p, x + 38, 224, 64, u, 2030 + k, k % 2 ? -1 : 1);
      for (let j = 1; j < 4; j++) pen(p, seg(x + j * 19, 140, x + j * 19, 228, 2), u, 2.5, 2050 + k * 3 + j);
    }
    if (t >= EB.chickens - EARLY) for (let k = 0; k < 7; k++) { const x = 130 + k * 82, u = pr(t, EB.chickens + .1 + k * .025, .12); pen(p, rect(x, 250, 76, 100), u, 3.5, 2080 + k); chicken(p, x + 38, 346, 64, u, 2090 + k, k % 2 ? 1 : -1); for (let j = 1; j < 4; j++) pen(p, seg(x + j * 19, 250, x + j * 19, 350, 2), u, 2.5, 2100 + k * 3 + j); }
    if (t >= EB.pigs - EARLY) for (let k = 0; k < 6; k++) for (let row = 0; row < 2; row++) { // narrow crates, a pig in each
      const x = 720 + k * 96, y0 = row ? 250 : 140, y1 = row ? 350 : 228, u = pr(t, EB.pigs - EARLY + (k + row * 6) * .02, .12);
      pig(p, x + 46, y1 - 2, 82, u, 2120 + k + row * 10, row ? -1 : 1); pen(p, seg(x, y0, x, y1, 4), u, 4, 2140 + k + row * 10); pen(p, seg(x + 92, y0, x + 92, y1, 4), u, 4, 2160 + k + row * 10);
      for (let j = 1; j < 3; j++) pen(p, seg(x, y0 + j * (y1 - y0) / 3, x + 92, y0 + j * (y1 - y0) / 3, 4), u, 2.5, 2180 + k * 3 + j + row * 20);
    }
    if (t >= EB.kings - EARLY) { const u = pr(t, EB.kings - EARLY, .25); pen(p, rect(590, 66, 220, 64), u, 5, 2200); pen(p, poly(crownPts(700, 120, 110, 44), true), u, 5, 2201); } // the crown sign
    if (t >= EB.factory - EARLY) for (let k = 0; k < 2; k++) { // chimneys, smoke
      const cx = 210 + k * 990, u = pr(t, EB.factory - EARLY + k * .08, .2); // near the eaves, where the roof is low enough to fit them in the box
      const roofY = cx < 700 ? 110 - (cx - 90) * 70 / 610 : 40 + (cx - 700) * 70 / 610;
      pen(p, poly([[cx - 22, roofY + 4], [cx - 22, roofY - 50], [cx + 22, roofY - 50], [cx + 22, roofY - 4]]), u, 5, 2210 + k);
      const s = []; for (let i = 0; i <= 14; i++) s.push([cx + 6 + i * 14, roofY - 60 - i * 1.6 + Math.sin(i * .9 - t * 4) * 6]); pen(p, s, pr(t, EB.factory + .1 + k * .08, .3), 5, null);
    }
    if (t >= EB.farms - EARLY) for (let k = 0; k < 3; k++) { // more sheds, all the way back
      const x = 1360 + k * 145, u = pr(t, EB.farms - EARLY + k * .06, .2), h = 120 - k * 18;
      pen(p, poly([[x, GY], [x, GY - h], [x + 65, GY - h - 40], [x + 130, GY - h], [x + 130, GY]]), u, 4.5, 2220 + k);
      pen(p, poly(crownPts(x + 65, GY - h - 4, 34, 16), true), u, 3, 2225 + k);
    }
  } else if (pi === 1) { // outside: no windows; the sun shines on the roof and stops there; inside, bars
    pen(p, seg(0, GY, PBW, GY, 30), 1, 5, 2301);
    const sx0 = 160, sx1 = 1100, sy0 = 120, u = pr(t, EB.f1 - EARLY, .35);
    pen(p, poly([[sx0, GY], [sx0, sy0], [sx1, sy0], [sx1, GY]]), u, 6, 2302); pen(p, poly([[sx0 - 30, sy0 + 4], [630, 40], [sx1 + 30, sy0 + 4]]), u, 6, 2303);
    pen(p, poly(crownPts(630, 100, 80, 34), true), pr(t, EB.f1, .2), 4.5, 2304);
    if (t >= EB.neverF - EARLY) hatch(p, [[sx0, sy0], [sx1, sy0], [sx1, GY], [sx0, GY]], .78, 12, pr(t, EB.neverF - EARLY, .4), 3.5, 2305); // the blind walls darken
    if (t >= EB.sun - EARLY) { // the sun, rays that stop on the roof
      const cx = 1500, cy = 110, R = 60, us = pr(t, EB.sun - EARLY, .2);
      pen(p, ell(cx, cy, R, R), us, 6, 2310);
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + .13, l = (a > 2.2 && a < 3.6) ? 120 : 50; pen(p, seg(cx + Math.cos(a) * (R + 12), cy + Math.sin(a) * (R + 12), cx + Math.cos(a) * (R + 12 + l), cy + Math.sin(a) * (R + 12 + l), 2), pr(t, EB.sun + .04 + k * .015, .08), 5, 2311 + k); }
    }
    if (t >= EB.only - EARLY) { // a round peep-hole cut into the wall: one hen, then bars across her
      const hx = 640, hy = 248, R = 92, uh = pr(t, EB.only - EARLY, .25);
      if (uh >= 1) { p.fillStyle = '#fff'; p.beginPath(); p.arc(hx, hy, R, 0, TAU); p.fill(); }
      pen(p, ell(hx, hy, R, R), uh, 6, 2320);
      if (uh >= 1) { p.save(); p.beginPath(); p.arc(hx, hy, R - 4, 0, TAU); p.clip(); chicken(p, hx, hy + 60, 130, pr(t, EB.only + .1, .3), 2321);
        if (t >= EB.harm - EARLY) for (let k = 0; k < 7; k++) pen(p, seg(hx - 90 + k * 30, hy - 100, hx - 90 + k * 30, hy + 100, 4), pr(t, EB.harm - EARLY + k * .03, .1), 6, 2330 + k);
        p.restore(); }
    }
  } else if (pi === 2) { // four rows of animals; a black marker bar blots out one row on each word
    const rows = [EB.dying, EB.bloody, EB.barbaric, EB.cruel];
    for (let r = 0; r < 4; r++) {
      const y = 92 + r * 86, u = pr(t, EB.f2 - EARLY + r * .05, .3);
      for (let k = 0; k < 11; k++) { const x = 150 + k * 150; if (r % 2) pig(p, x, y - 2, 74, u, 2400 + r * 20 + k, 1); else chicken(p, x, y - 2, 66, u, 2400 + r * 20 + k, 1); }
      if (t >= rows[r] - EARLY) { // the bar goes down in one stroke, left to right
        const b = pr(t, rows[r] - EARLY, .14), x0 = 70, x1 = lerp(x0, 1730, b);
        p.fillStyle = '#000'; p.beginPath(); p.moveTo(x0, y - 70); for (let k = 0; k <= 16; k++) p.lineTo(lerp(x0, x1, k / 16), y - 70 + (rnd(r, k) - .5) * 8);
        for (let k = 16; k >= 0; k--) p.lineTo(lerp(x0, x1, k / 16), y + 4 + (rnd(r + 9, k) - .5) * 8); p.closePath(); p.fill();
      }
    }
  } else { // along with the meat: a plain diagram, shed to bun; leader lines with hand-lettered labels
    const u0 = pr(t, EB.f3 - EARLY, .3), bx = 900, by = 200;
    pen(p, seg(0, GY, PBW, GY, 30), u0, 5, 2501);
    pen(p, poly([[90, GY], [90, 230], [190, 170], [290, 230], [290, GY]]), u0, 5, 2502); pen(p, poly(crownPts(190, 222, 50, 22), true), u0, 4, 2503); // a small shed
    if (t >= EB.along - EARLY) pen(p, poly([[320, 280], [520, 250], [610, 224]]).concat(poly([[580, 210], [610, 224], [586, 246]])), pr(t, EB.along - EARLY, .3), 6, 2504);
    const ub = pr(t, EB.f3, .4);
    pen(p, ell(bx, by - 30, 250, 110, Math.PI, TAU), ub, 6, 2510); pen(p, seg(bx - 250, by - 30, bx + 250, by - 30, 12), ub, 6, 2511); // top bun
    for (let k = 0; k < 6; k++) pen(p, ell(bx - 140 + k * 56, by - 90 - (k % 2) * 18, 9, 5), ub, 3.5, 2512 + k); // seeds
    { const s = []; for (let i = 0; i <= 24; i++) s.push([bx - 262 + i * 22, by - 18 + Math.sin(i * 1.4) * 9]); pen(p, s, ub, 5, 2520); } // lettuce
    pen(p, rect(bx - 240, by - 4, 480, 58), ub, 6, 2521); // the patty
    pen(p, poly([[bx - 250, by + 66], [bx + 250, by + 66], [bx + 236, by + 128], [bx - 236, by + 128]], true), ub, 6, 2522); // bottom bun
    const label = (li, k, ts, lx, ly, ax, ay, seed) => { // a leader line from the patty to the label, then the word lettered
      if (t < ts - EARLY) return;
      pen(p, seg(ax, ay, lx, ly - 18, 8), pr(t, ts - EARLY, .12), 3.5, seed); p.fillStyle = '#000'; p.beginPath(); p.arc(ax, ay, 6, 0, TAU); p.fill();
      const wd = wE(li, k).w.toUpperCase(), fs = 60, ww = handWidth(p, wd, fs), left = lx < bx;
      handLetters(p, wd, left ? lx - ww - 6 : lx + 6, ly + 4, fs, t, ts - EARLY + .04, seed + 1);
      pen(p, seg(left ? lx - ww - 10 : lx + 2, ly + 16, left ? lx + 2 : lx + ww + 10, ly + 16, 6), pr(t, ts + .1, .15), 3, seed + 2);
    };
    label(86, 4, EB.meat, 590, 96, bx - 170, by + 26, 2530);
    if (t >= EB.urine - EARLY) for (let k = 0; k < 14; k++) { p.fillStyle = '#000'; p.beginPath(); p.arc(bx + 30 + rnd(k, 31) * 90, by + 10 + rnd(k, 32) * 36, 3.5, 0, TAU); if (t >= EB.urine - EARLY + k * .01) p.fill(); } // stippled specks
    label(86, 6, EB.urine, 1250, 70, bx + 80, by + 18, 2540);
    if (t >= EB.stool - EARLY) for (let k = 0; k < 10; k++) { p.fillStyle = '#000'; p.beginPath(); p.arc(bx + 150 + rnd(k, 41) * 70, by + 12 + rnd(k, 42) * 34, 4.5, 0, TAU); if (t >= EB.stool - EARLY + k * .012) p.fill(); }
    label(86, 8, EB.stool, 1290, 300, bx + 190, by + 36, 2550);
  }
}

// ---- the master paste-up for a page ---------------------------------------------------------------------------
const panelOf = (P, t) => { let i = 0; while (i + 1 < P.panels.length && P.panels[i + 1] - EARLY <= t) i++; return i; };
function drawMasterE(P, t) {
  const m = mg; m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = 1; m.globalCompositeOperation = 'source-over'; m.filter = 'none';
  m.fillStyle = '#fff'; m.fillRect(0, 0, SW, SH);
  drawTypedE(m, t, P);
  const p = pg, pi = panelOf(P, t);
  p.setTransform(1, 0, 0, 1, 0, 0); p.fillStyle = '#fff'; p.fillRect(0, 0, PBW, PBH);
  if (P === EPAGES[0]) drawWorkPic(p, t, pi); else drawFarmPic(p, t, pi);
  m.save(); m.translate(PB.x, PB.y);
  m.strokeStyle = 'rgba(0,0,0,.45)'; m.lineWidth = 1.6; m.strokeRect(-14, -12, PBW + 28, PBH + 22);
  m.drawImage(PIC, 0, 0);
  pen(m, poly([[0, 0], [PBW, 0], [PBW, PBH], [0, PBH]], true), pr(t, P.t0 - .5, .4), 6, 900 + P.t0, 1.2);
  m.restore();
  drawHeadE(m, t, P);
}

// ---- copies ---------------------------------------------------------------------------------------------------------
function genAtE(P, t) { let G = 1, ts = P.t0; P.gens.forEach((gt, k) => { if (t >= gt - EARLY) { G = k + 1; ts = gt; } }); return [G, ts]; }
function passParams(P, k, last, pi, f2) {
  const Q = Object.assign({}, PASS[k]), jit = pi + 20 + (P === EPAGES[0] ? 0 : 20);
  if (k === 1) { Q.rot += (rnd(jit, 61) - .5) * .003; Q.dx += (rnd(jit, 62) - .5) * 8; Q.dy += (rnd(jit, 63) - .5) * 6; } // re-laid on the glass for each new paste-up
  if (last) { Q.dx += (rnd(f2, 64) - .5) * 1.4; Q.dy += (rnd(f2, 65) - .5) * 1.4; Q.rot += (rnd(f2, 66) - .5) * .0004; }
  Q.nIdx = last ? f2 % 8 : k * 3 + 1; Q.nx = last ? rnd(f2, 67) * 1024 : k * 233; Q.ny = last ? rnd(f2, 68) * 1024 : k * 171;
  return Q;
}
function makeCopiesE(P, t, f) {
  const [G] = genAtE(P, t), pi = panelOf(P, t), f2 = Math.floor(f / 2);
  for (let k = 1; k <= G; k++) xpass(XG[k - 1], XG[k], passParams(P, k, k === G, pi, f2), null);
  solidAreas(XG[G], .32, G, G * 50, G * 30);
  return G;
}
// The finished workers page, run off three times: it lies under the farm page in the pile. A fixed render
// (the page as it stands at its last frame, fixed noise), built once on first use; never depends on t.
const EWK = { cv: null };
function workCopy() {
  if (EWK.cv) return EWK.cv;
  const P = EPAGES[0], t = T9 - 1 / 24, pi = panelOf(P, t);
  drawMasterE(P, t);
  for (let k = 1; k <= 3; k++) xpass(XG[k - 1], XG[k], passParams(P, k, false, pi, 0), null);
  const c = mkCanvas(SW, SH); c.getContext('2d').drawImage(XG[3], 0, 0); solidAreas(c, .32, 3, 150, 90);
  EWK.cv = c; return c;
}

// ---- camera and frame -------------------------------------------------------------------------------------------
function camAtE(P, t) { const T = P.camT || P.panels; let i = 0; while (i + 1 < T.length && T[i + 1] - EARLY <= t) i++; const c = P.cams[i], a = T[i], b = T[i + 1] || P.t1, u = smooth((t - a) / (b - a)); return { cx: c[0], cy: c[1], z: lerp(c[2], c[3], u) }; }

function renderEarly(t) {
  const f = Math.round(t * 24), P = EPAGES[pageOf(t)];
  buildXerox();
  const [G0] = genAtE(P, t), pile = P === EPAGES[1] && G0 >= 3;
  const wk = pile ? workCopy() : null; // before this frame's master: it borrows the scratch canvases
  drawMasterE(P, t);
  const G = makeCopiesE(P, t, f);
  const [, tsG] = genAtE(P, t);
  const cam = camAtE(P, t);
  const land = 1 + .028 * (1 - smooth((t - tsG) / .12)) * (tsG > P.t0 ? 1 : 0);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  const bg = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1200); bg.addColorStop(0, '#3a3631'); bg.addColorStop(1, '#1d1b19');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.cx, -cam.cy);
  if (pile) { // the pile: the finished workers page (blue) under the farm page's earlier copy (green)
    const sheets = [[wk, EPAGES[0].paper[3], { dx: -74, dy: 40, r: -.026 }, 3], [XG[2], P.paper[2], { dx: 58, dy: -34, r: .017 }, 2]];
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

// Caption audit for these pages (debug only, draws nothing): every line, from its first onset to the later of the
// next line's start and 1.2 s after its last word (cut at the page's end), must sit whole in the frame, cap >= 44 px.
window.__auditEarly = () => {
  const bad = [], C = [SW / 2, SH / 2]; let minCap = 1e9, minMargin = 1e9;
  const all = LINES_E;
  const need = all.map((l, i) => [l.words[0].s - EARLY, Math.max(i + 1 < all.length ? all[i + 1].s : T10, l.words[l.words.length - 1].e + 1.2)]);
  const f0 = Math.round(T8 * 24), f1 = Math.round(T10 * 24);
  for (let fi = f0; fi < f1; fi++) {
    const t = fi / 24, P = EPAGES[pageOf(t)], [G, tsG] = genAtE(P, t), pi = panelOf(P, t), cam = camAtE(P, t), sp = scrollPosE(P, t);
    const land = 1 + .028 * (1 - smooth((t - tsG) / .12)) * (tsG > P.t0 ? 1 : 0);
    const map = (x, y) => { for (let k = 1; k <= G; k++) { const Q = passParams(P, k, false, pi, 0); // the per-frame jitter (under 1 px) is left out
        const ux = (x - C[0]) * Q.sc, uy = (y - C[1]) * Q.sc; x = C[0] + Q.dx + ux * Math.cos(Q.rot) - uy * Math.sin(Q.rot); y = C[1] + Q.dy + ux * Math.sin(Q.rot) + uy * Math.cos(Q.rot); }
      x = (x - C[0]) * land + C[0]; y = (y - C[1]) * land + C[1]; return [(x - cam.cx) * cam.z + W / 2, (y - cam.cy) * cam.z + H / 2]; };
    let sc = land * cam.z; for (let k = 1; k <= G; k++) sc *= PASS[k].sc; minCap = Math.min(minCap, TW.cap * sc);
    all.forEach((l, li) => {
      if (t < need[li][0] || t > need[li][1]) return;
      const rows = P.rows.filter(r => r.line === l.i && t >= r.s - EARLY);
      if (!rows.length && t < P.t1) { if (t >= P.t0 + 1e-6 && (P.lines.includes(l.i) || P.carry.includes(l.i))) bad.push({ t: +t.toFixed(3), line: l.i, why: 'missing' }); else if (t < P.t1) bad.push({ t: +t.toFixed(3), line: l.i, why: 'not on this page' }); return; }
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
window.__rowsEarly = () => EPAGES.map(P => P.rows.map(r => ({ r: r.r, line: r.line, s: r.s, carried: r.carried, text: r.words.map(w => w.w).join(' ') })));
