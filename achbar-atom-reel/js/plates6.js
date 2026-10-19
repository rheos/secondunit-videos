// Draft 6 plates: the metaphors (2), the machine (4) and p(doom) (7). Each plate carries its own graphic
// language on the blueprint ground, since this is a demo reel: a 1950s civil-defence poster against a 2020s
// keynote slide; a neural network drafted in the same pen as the bomb, with a rolling parameter readout;
// a declassified report as an archival print, then trading cards after Manufacturing Consent's Philosopher
// All-Stars (MC10). Every line on screen is dated and sourced in BUILD-STATE.md. Pure functions of t.
'use strict';

// ---------- 2. the metaphors (TC03): ask everyone the same question ----------
const MQ = [   // side, lines, hot word, attribution, beat
  ['A', ['“THIS IS THE GREATEST', 'THING IN HISTORY”'], 'GREATEST', 'HARRY TRUMAN, 6 AUGUST 1945 · PER ADM. LEAHY, I WAS THERE (1950)', 2],
  ['I', ['“WITH ARTIFICIAL INTELLIGENCE', 'WE’RE SUMMONING THE DEMON”'], 'DEMON', 'ELON MUSK · MIT AEROASTRO SYMPOSIUM, 24 OCTOBER 2014', 4],
  ['A', ['“ATOMS FOR PEACE”'], 'PEACE', 'DWIGHT EISENHOWER · UN GENERAL ASSEMBLY, 8 DECEMBER 1953', 6],
  ['I', ['“COUNTRY OF GENIUSES', 'IN A DATACENTER”'], 'GENIUSES', 'DARIO AMODEI, ANTHROPIC · “MACHINES OF LOVING GRACE”, OCTOBER 2024', 8],
  ['A', ['“NOW I AM BECOME DEATH,', 'THE DESTROYER OF WORLDS”'], 'DEATH', 'J. ROBERT OPPENHEIMER, RECALLING TRINITY · NBC, 5 JANUARY 1965', 10],
  ['I', ['“WE ARE LIKE SOMEBODY WHO HAS', 'THIS REALLY CUTE TIGER CUB”'], 'TIGER CUB', 'GEOFFREY HINTON · CBS SATURDAY MORNING, 26 APRIL 2025', 12],
];
const PAN = { A: [120, 900], I: [1020, 1800], y0: 150, y1: 920 };
function plateM(t) {
  const t0 = PLATE.M, b = (n) => t0 + n * BEAT; schBG(); schFrame('2', '', '', C.lav);
  // the promise's output node runs to the top and rules the divider down the middle
  const k1 = eo(pr(t, t0, t0 + .35)), k2 = eo(pr(t, t0 + .3, t0 + .8)), ek = eio(pr(t, b(16) - .5, b(16)));
  const dx = lerp(1580, 960, k1), dy = lerp(470, 120, k1);
  if (k1 < 1) { gl(1580, 470, dx, dy, C.cyan, .8, 1.5); star(dx, dy, 6, C.white, 1); }
  else { gl(960, 120, 960, lerp(120, 960, k2), C.cyan, .8 * (1 - ek), 1.5); if (k2 < 1) star(960, lerp(120, 960, k2), 6, C.white, 1); }
  caption('ONE QUESTION FOR EVERYONE: WHAT IS IT?', 960 - meas('ONE QUESTION FOR EVERYONE: WHAT IS IT?', { size: 22, weight: 700 }) / 2, 110, t, b(1), { size: 22, weight: 700, color: C.white, alpha: 1 - ek });
  const pk = eo(pr(t, t0 + .5, t0 + 1.1));
  // left: a civil-defence poster. right: a keynote slide.
  for (const side of ['A', 'I']) {
    const [x0, x1] = PAN[side], w = x1 - x0, off = side === 'A' ? lerp(-w - 160, 0, pk) + lerp(0, -w - 160, ek) : lerp(w + 160, 0, pk) + lerp(0, w + 160, ek);
    X.save(); X.translate(off, 0);
    if (side === 'A') {
      X.fillStyle = 'rgba(0,0,0,.35)'; X.fillRect(x0 + 10, PAN.y0 + 14, w, PAN.y1 - PAN.y0);
      X.fillStyle = C.paper; X.fillRect(x0, PAN.y0, w, PAN.y1 - PAN.y0);
      stipRect(x0, PAN.y0, w, PAN.y1 - PAN.y0, 500, C.ink, .12, 1.1);
      iBox(x0 + 14, PAN.y0 + 14, w - 28, PAN.y1 - PAN.y0 - 28, C.ink, 2.2, .9, true);
      X.fillStyle = C.brick; X.fillRect(x0 + 14, PAN.y0 + 14, w - 28, 72);
      txt('THE ATOM', x0 + w / 2, PAN.y0 + 66, { fam: FT.d, size: 44, weight: 900, stretch: 'expanded', color: C.paper, align: 'center', ls: 6 });
      for (let i = 0; i < 9; i++) { X.fillStyle = C.ink; X.globalAlpha = .9; X.fillRect(x0 + 40 + i * 80, PAN.y1 - 46, 40, 10); X.globalAlpha = 1; }
    } else {
      X.fillStyle = '#000'; X.fillRect(x0, PAN.y0, w, PAN.y1 - PAN.y0);
      X.strokeStyle = 'rgba(255,255,255,.18)'; X.lineWidth = 1; X.strokeRect(x0 + .5, PAN.y0 + .5, w - 1, PAN.y1 - PAN.y0 - 1);
      txt('AI', x0 + 40, PAN.y0 + 66, { fam: FT.d, size: 36, weight: 400, color: C.white, ls: 2 });
      gl(x0 + 40, PAN.y0 + 86, x1 - 40, PAN.y0 + 86, '#777', .9, 1);
      txt('keynotes, podcasts, essays · 2014-2025', x1 - 40, PAN.y0 + 66, { fam: FT.d, size: 18, weight: 400, color: '#9a9a9a', align: 'right' });
      if (Math.floor(t * 2) % 2 === 0) { X.fillStyle = C.white; X.fillRect(x0 + 40, PAN.y1 - 70, 14, 26); }
      lab(x1 - 40, PAN.y1 - 50, (Math.floor(pr(t, b(2), b(12)) * 2) + 1) + ' / 3', '#9a9a9a', .9, 14, 'right');
    }
    // the quotes, in the panel's own type
    MQ.filter((q) => q[0] === side).forEach(([, lines, hot, attr, beat], row) => {
      const tq = b(beat); if (t < tq) return;
      const poster = side === 'A', px = x0 + 50, y = PAN.y0 + 150 + row * 210;
      const sty = poster ? { fam: FT.d, weight: 900, stretch: 'semi-condensed' } : { fam: FT.d, weight: 400 };
      const size = Math.min(48, ...lines.map((ln) => fit(ln, w - 100, 48, sty)));
      lines.forEach((ln, j) => { const h = ln.indexOf(hot); kin(ln, px, y + j * size * 1.12, t, tq + j * .14, { ...sty, size, color: poster ? C.ink : C.white, hot: h >= 0 ? [h, h + hot.length, poster ? C.brick : C.mag] : undefined, stag: .02 }); });
      caption(attr, px, y + lines.length * size * 1.12 + 18, t, tq + .3, { size: 14, color: poster ? C.ink : '#9a9a9a', alpha: poster ? .8 : 1, cps: 160 });
    });
    X.restore();
  }
  band(t, b(14), b(16) - .45, 'THE METAPHOR DESCRIBES THE SPEAKER', 'AFTER THE CORPORATION (2003): EVERY CEO AND CRITIC WAS ASKED FOR THEIR IMAGE OF THE CORPORATION, AND THE ANSWERS WERE CUT TOGETHER');
  plateLabel('FIG. 2', 'THE METAPHORS', '', t, t0 + .2);
}

// ---------- 4. the machine: a neural network drafted in the bomb's pen ----------
const NET = { xs: [430, 790, 1150, 1510], ns: [3, 5, 5, 2], cy: 500, dy: 108, r: 22 };
const netNode = (L, i) => [NET.xs[L], NET.cy + (i - (NET.ns[L] - 1) / 2) * NET.dy];
function miniNet(cx, cy, w, h, col, a, t) {
  const xs = [cx - w / 2, cx, cx + w / 2], ns = [3, 4, 2];
  const P = (L, i) => [xs[L], cy + (i - (ns[L] - 1) / 2) * (h / 3.2)];
  for (let L = 0; L < 2; L++) for (let i = 0; i < ns[L]; i++) for (let j = 0; j < ns[L + 1]; j++) { const p = P(L, i), q = P(L + 1, j); gl(p[0], p[1], q[0], q[1], col, .35 * a, 1); }
  for (let L = 0; L < 3; L++) for (let i = 0; i < ns[L]; i++) { const p = P(L, i); gc(p[0], p[1], 7, col, .9 * a, 1.4); if (t !== undefined) star(p[0], p[1], 2.5 * (1 + Math.exp(-8 * ((t - B0) % BEAT))), col, .8 * a); }
}
function plateN(t) {
  const t0 = PLATE.N, b = (n) => t0 + n * BEAT, tEnd = PLATE.D; schBG(); schFrame('4', '', '', C.lav);
  const ink = C.white, fine = C.lav, col = eio(pr(t, b(19), b(20)));   // col: the net collapses to the scope's beam spot
  const at = (p) => [lerp(p[0], 960, col), lerp(p[1], 520, col)], fade = 1 - col;
  // 1. construction: a dashed axis per layer and the centre line
  const ck = pr(t, t0, t0 + .9);
  if (ck > 0 && col < 1) {
    X.setLineDash([12, 8]);
    NET.xs.forEach((x, L) => { const kk = eo(seg(ck, L * .15, .55 + L * .15)); if (kk > 0) path([at([x, 250]), at([x, lerp(250, 760, kk)])], fine, 1, .5 * fade); });
    const kk = eo(seg(ck, .5, 1)); if (kk > 0) path([at([340, NET.cy]), at([lerp(340, 1600, kk), NET.cy])], fine, 1, .4 * fade);
    X.setLineDash([]);
  }
  // 2. nodes, layer by layer; 3. weights, inked between the layers
  const stage = t < b(13) ? 0 : t < b(15) ? pr(t, b(13), b(14)) : t < b(17.5) ? 1 + pr(t, b(15), b(16.5)) : 2;   // parameter stages thicken the weights
  for (let L = 0; L < 3; L++) {
    const wk = pr(t, t0 + 1.6 + L * .5, t0 + 2.3 + L * .5); if (wk <= 0) continue;
    for (let i = 0; i < NET.ns[L]; i++) for (let j = 0; j < NET.ns[L + 1]; j++) {
      const p = at(netNode(L, i)), q = at(netNode(L + 1, j)), kk = seg(wk, (i * NET.ns[L + 1] + j) * .03, .5 + (i * NET.ns[L + 1] + j) * .03);
      strokeTo([p, q], kk, fine, 1 + .5 * Math.min(stage, 2) / 2, (.55 + .2 * Math.min(stage, 2) / 2) * fade, kk < 1);
    }
  }
  for (let L = 0; L < 4; L++) for (let i = 0; i < NET.ns[L]; i++) {
    const nk = pr(t, t0 + .6 + L * .35 + i * .06, t0 + 1.0 + L * .35 + i * .06); if (nk <= 0) continue;
    const p = at(netNode(L, i)), pts = ellPts(p[0], p[1], NET.r, NET.r, 0, -Math.PI / 2, -Math.PI / 2 + TAU, 48);
    if (t >= b(8)) { const f = Math.exp(-7 * ((t - B0) % BEAT)) * (.25 + .75 * hash1(L * 7 + i * 13 + Math.floor((t - B0) / BEAT))); X.globalAlpha = .55 * f * fade; X.fillStyle = C.cyan; X.beginPath(); X.arc(p[0], p[1], NET.r - 3, 0, TAU); X.fill(); X.globalAlpha = 1; }
    strokeTo(pts, nk, ink, 2.2, .95 * fade, nk < 1);
  }
  // signals running along the weights once the labels are up
  if (t >= b(8) && col < 1) for (let s = 0; s < 9; s++) { const ph = (t * 1.1 + s / 9) % 1, L = Math.floor(ph * 3), u = ph * 3 - L; const i = (s * 5 + 1) % NET.ns[L], j = (s * 7 + 2) % NET.ns[L + 1], p = at(netNode(L, i)), q = at(netNode(L + 1, j)); star(lerp(p[0], q[0], u), lerp(p[1], q[1], u), 3, C.cyan, .95 * fade); }
  // 4. labels in the sheet's manner, with leaders
  if (col < 1) {
    const lk = b(6);
    leader(...netNode(0, 0).map((v, k) => v + (k ? -NET.r - 4 : 0)), 300, 230, 'INPUT', 'ONE NUMBER PER NEURON', t, lk, { size: 20 });
    leader(970, netNode(1, 0)[1] - NET.r - 6, 880, 190, 'HIDDEN LAYERS', 'EACH NEURON SUMS ITS INPUTS AND FIRES', t, lk + .2, { size: 20 });
    leader(...netNode(3, 0).map((v, k) => v + (k ? -NET.r - 4 : 0)), 1620, 370, 'OUTPUT', 'THE ANSWER', t, lk + .4, { size: 20 });
    const wm = [(NET.xs[1] + NET.xs[2]) / 2, (netNode(1, 4)[1] + netNode(2, 4)[1]) / 2];
    leader(wm[0], wm[1], 760, 860, 'WEIGHT', 'ONE NUMBER PER LINE, ADJUSTED IN TRAINING', t, lk + .6, { size: 20 });
    const hk = pr(t, b(5), b(6)); if (hk > 0) { caption('CONCEPTUAL ILLUSTRATION', 300, 170, t, b(5), { size: 22, color: ink, cps: 40 }); if (hk > .7) { const w = meas('CONCEPTUAL ILLUSTRATION', { size: 22 }); gl(300, 178, 300 + w * eo(pr(hk, .7, 1)), 178, ink, .9, 1.4); } }
    kin('THE MACHINE', 1620, 880, t, b(7), { fam: FT.s, size: 96, weight: 400, stag: .05, style: 'rise', dur: .3, color: ink, align: 'right' });
  }
  // 5. 1958: the promise, from the newspaper of record
  band(t, b(8), b(13) - .3, '“… WILL BE ABLE TO WALK, TALK, SEE, WRITE, REPRODUCE ITSELF AND BE CONSCIOUS OF ITS EXISTENCE”', '8 JULY 1958 · THE NEW YORK TIMES ON THE PERCEPTRON · ROSENBLATT, CORNELL AERONAUTICAL LABORATORY, FUNDED BY THE U.S. OFFICE OF NAVAL RESEARCH');
  // 6. the parameter count, rolling, then redacted
  if (t >= b(13) && col < 1) {
    const bx = 1320, by = 130, bw = 520, bh = 180, ba = pr(t, b(13), b(13) + .3) * fade;
    X.globalAlpha = .85 * ba; X.fillStyle = C.navy2; X.fillRect(bx, by, bw, bh); X.globalAlpha = 1; iBox(bx, by, bw, bh, C.lav, 1.2, .7 * ba, false);
    lab(bx + 24, by + 34, 'PARAMETERS (WEIGHTS)', C.lav, .85 * ba, 15);
    let n, who;
    if (t < b(15)) { n = 1.5e9 * eo(pr(t, b(13), b(14))); who = 'GPT-2 · OPENAI, 2019'; }
    else if (t < b(17.5)) { n = lerp(1.5e9, 175e9, eo(pr(t, b(15), b(16.5)))); who = 'GPT-3 · OPENAI, 2020'; }
    else { n = 175e9; who = 'GPT-4 · OPENAI, 2023'; }
    lab(bx + bw - 24, by + 34, who, C.white, .95 * ba, 16, 'right');
    txt(fmt(n), bx + bw - 24, by + 118, { fam: FT.m, size: 44, weight: 700, color: C.cyan, align: 'right', alpha: ba });
    if (t >= b(17.5)) {
      const rk = eo(pr(t, b(17.5), b(17.5) + .4));
      X.globalAlpha = ba; X.fillStyle = '#000'; X.fillRect(bx + bw - 24 - 460 * rk, by + 74, 460 * rk, 58); X.globalAlpha = 1;
      if (rk >= 1) { lab(bx + bw - 24, by + 114, 'NOT DISCLOSED', C.white, .95 * ba, 30, 'right'); caption('“NO FURTHER DETAILS ABOUT THE ARCHITECTURE (INCLUDING MODEL SIZE)” · GPT-4 TECHNICAL REPORT', bx + 24, by + 158, t, b(17.5) + .4, { size: 13, color: C.lav, cps: 200, alpha: ba }); }
    } else lab(bx + 24, by + 158, t < b(15) ? '“A 1.5B PARAMETER TRANSFORMER” · RADFORD ET AL.' : '“175 BILLION PARAMETERS” · BROWN ET AL.', C.lav, .8 * ba, 13);
  }
  if (col > .85) star(960, 520, 6 * cl((col - .85) / .15), C.white, 1);
  plateLabel('FIG. 4', 'THE MACHINE', '', t, t0 + .2);
}

// ---------- 7. p(doom): the first one came from Los Alamos ----------
const CARDS = [   // year, name, role, banner colour, number lines, qualifier, source lines, odds (fraction), mark
  { yr: '1945', name: 'ARTHUR COMPTON', role: 'PHYSICIST · MANHATTAN PROJECT', col: C.brick, num: ['< 3 IN', 'A MILLION'], q: 'CEILING FOR IGNITING THE ATMOSPHERE', src: ['AS TOLD TO PEARL S. BUCK', 'THE AMERICAN WEEKLY, 1959'], odds: 3e-6, mark: 'atom' },
  { yr: '2024', name: 'GEOFFREY HINTON', role: 'NOBEL LAUREATE · “GODFATHER OF AI”', col: C.teal, num: ['10-20%'], q: 'EXTINCTION WITHIN 30 YEARS', src: ['BBC RADIO 4 TODAY', '27 DECEMBER 2024'], odds: .15, mark: 'net' },
  { yr: '2023', name: 'DARIO AMODEI', role: 'CEO, ANTHROPIC', col: C.plum, num: ['10-25%'], q: '“SOMETHING GOES CATASTROPHICALLY WRONG”', src: ['THE LOGAN BARTLETT SHOW', 'OCTOBER 2023'], odds: .175, mark: 'net' },
  { yr: '2024', name: 'ELON MUSK', role: 'CEO, xAI AND TESLA', col: C.orange, num: ['10 OR 20%'], q: '“OR SOMETHING LIKE THAT”', src: ['GREAT AI DEBATE, ABUNDANCE SUMMIT', 'MARCH 2024'], odds: .15, mark: 'net' },
  { yr: '2024', name: 'YANN LECUN', role: 'CHIEF AI SCIENTIST, META', col: C.sage, num: ['—'], q: '“COMPLETE B.S.”', src: ['TECHCRUNCH', '12 OCTOBER 2024'], odds: null, mark: 'net' },
];
const CW = 300, CH = 420;
function cardFront(c, t, a = 1) {
  X.save(); X.globalAlpha = a;
  X.fillStyle = 'rgba(0,0,0,.4)'; X.beginPath(); X.roundRect(-CW / 2 + 8, -CH / 2 + 10, CW, CH, 14); X.fill();
  X.fillStyle = C.paper; X.beginPath(); X.roundRect(-CW / 2, -CH / 2, CW, CH, 14); X.fill();
  X.strokeStyle = C.ink; X.lineWidth = 2; X.beginPath(); X.roundRect(-CW / 2 + 10, -CH / 2 + 10, CW - 20, CH - 20, 8); X.stroke();
  X.fillStyle = c.col; X.fillRect(-CW / 2 + 10, -CH / 2 + 10, CW - 20, 48);
  txt(c.name, 0, -CH / 2 + 44, { fam: FT.d, size: fit(c.name, CW - 44, 26, { fam: FT.d, weight: 900 }), weight: 900, color: C.paper, align: 'center' });
  // the portrait box: no likeness, the person's instrument instead
  X.fillStyle = C.navy; X.fillRect(-CW / 2 + 22, -CH / 2 + 70, CW - 44, 140);
  if (c.mark === 'atom') atom(0, -CH / 2 + 140, 92, 30, 1, t, { electrons: false, nr: 4, col: C.cyan }); else miniNet(0, -CH / 2 + 140, 170, 100, C.cyan, 1, t);
  txt(c.yr, CW / 2 - 30, -CH / 2 + 100, { fam: FT.m, size: 20, weight: 700, color: C.white, align: 'right' });
  txt(c.role, 0, -CH / 2 + 236, { fam: FT.m, size: fit(c.role, CW - 44, 12), weight: 700, color: C.ink, align: 'center' });
  const ns = Math.min(64, ...c.num.map((s) => fit(s, CW - 50, 64, { fam: FT.d, weight: 900, stretch: 'semi-condensed' })));
  c.num.forEach((s, i) => txt(s, 0, -CH / 2 + 300 + i * ns * .95 - (c.num.length - 1) * 16, { fam: FT.d, size: ns, weight: 900, stretch: 'semi-condensed', color: c.odds === null ? C.ink : C.brick, align: 'center' }));
  txt(c.q, 0, CH / 2 - 60, { fam: FT.m, size: fit(c.q, CW - 44, 12), weight: 400, color: C.ink, align: 'center' });
  lab(0, CH / 2 - 28, 'p(doom) ALL-STARS · SERIES 1', C.ink, .6, 10, 'center');
  X.restore();
}
function cardBack(c, t, a = 1) {
  X.save(); X.globalAlpha = a;
  X.fillStyle = 'rgba(0,0,0,.4)'; X.beginPath(); X.roundRect(-CW / 2 + 8, -CH / 2 + 10, CW, CH, 14); X.fill();
  X.fillStyle = C.paper; X.beginPath(); X.roundRect(-CW / 2, -CH / 2, CW, CH, 14); X.fill();
  X.save(); X.beginPath(); X.roundRect(-CW / 2 + 10, -CH / 2 + 10, CW - 20, CH - 20, 8); X.clip();
  X.fillStyle = c ? c.col : C.navy; X.fillRect(-CW, -CH, 2 * CW, 2 * CH);
  X.strokeStyle = 'rgba(255,255,255,.25)'; X.lineWidth = 1; X.beginPath(); for (let k = -CH; k < CH; k += 16) { X.moveTo(-CW, k); X.lineTo(CW, k + CW * .7); } X.stroke();
  X.restore();
  X.fillStyle = C.paper; X.fillRect(-CW / 2 + 24, -CH / 2 + 60, CW - 48, CH - 120);
  if (!c) { txt('p(doom)', 0, -20, { fam: FT.d, size: 56, weight: 900, color: C.ink, align: 'center' }); txt('ALL-STARS', 0, 30, { fam: FT.d, size: 34, weight: 900, stretch: 'expanded', color: C.ink, align: 'center' }); lab(0, 90, 'SERIES 1 · 1945-2024', C.ink, .7, 12, 'center'); X.restore(); return; }
  txt('STATS', 0, -CH / 2 + 100, { fam: FT.d, size: 26, weight: 900, color: C.ink, align: 'center' });
  gl(-CW / 2 + 40, -CH / 2 + 112, CW / 2 - 40, -CH / 2 + 112, C.ink, .8, 1.2);
  lab(-CW / 2 + 40, -CH / 2 + 150, 'CHANCE OF CATASTROPHE', C.ink, .8, 11);
  // the odds as a bar on a 0-100 scale: Compton's is thinner than a line
  const bw = CW - 80; X.strokeStyle = C.ink; X.lineWidth = 1.2; X.globalAlpha = .8 * a; X.strokeRect(-CW / 2 + 40, -CH / 2 + 162, bw, 22); X.globalAlpha = a;
  if (c.odds !== null) { X.fillStyle = C.brick; X.fillRect(-CW / 2 + 40, -CH / 2 + 162, Math.max(0, bw * c.odds), 22); }
  for (let i = 0; i <= 10; i++) gl(-CW / 2 + 40 + i * bw / 10, -CH / 2 + 184, -CW / 2 + 40 + i * bw / 10, -CH / 2 + 190, C.ink, .7, 1);
  lab(-CW / 2 + 40, -CH / 2 + 206, '0%', C.ink, .7, 10); lab(CW / 2 - 40, -CH / 2 + 206, '100%', C.ink, .7, 10, 'right');
  const note = c.odds === null ? 'DID NOT PLAY' : c.odds < .001 ? (c.odds * 100).toFixed(4) + '% · NOT VISIBLE AT THIS SCALE' : (c.odds * 100) + '% (MIDPOINT)';
  txt(note, 0, -CH / 2 + 240, { fam: FT.m, size: fit(note, CW - 60, 12), weight: 700, color: C.brick, align: 'center' });
  lab(-CW / 2 + 40, -CH / 2 + 290, 'SOURCE', C.ink, .8, 11);
  c.src.forEach((s, i) => txt(s, -CW / 2 + 40, -CH / 2 + 314 + i * 22, { fam: FT.m, size: fit(s, CW - 80, 12), weight: 400, color: C.ink }));
  lab(0, CH / 2 - 28, 'p(doom) ALL-STARS · SERIES 1', C.ink, .6, 10, 'center');
  X.restore();
}
// a card at (x, y), facing f (1 front, -1 back) with scale s and rotation rot
function card(c, x, y, f, s, rot, t, a = 1) {
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(Math.max(.02, Math.abs(f)) * s, s);
  if (f >= 0) cardFront(c, t, a); else cardBack(c, t, a);
  X.restore();
}
const slotX = (i) => 240 + i * 360, SLOT_Y = 560;
function cardStack(k, t, a = 1) {   // the five cards gathered into one stack, backs up
  CARDS.forEach((c, i) => { const x = lerp(slotX(i), 960, k), y = lerp(SLOT_Y, 560, k), rot = lerp(0, (i - 2) * .06, k); card(c, x, y, -1, lerp(1, .92, k), rot, t, a); });
  if (k >= 1) card(null, 960, 560, -1, .92, 0, t, a);
}
function cardStackBack(t, a) { cardStack(1, t, a); }
function plateP(t) {
  const t0 = PLATE.P, b = (n) => t0 + n * BEAT; schBG(); schFrame('7', '', '', C.lav);
  const shut = eio(pr(t, b(11), b(12)));
  if (shut < 1) {
    // part 1: the report, irised open from the clock's centre on the scoreboard
    const open = eo(pr(t, t0, t0 + .9)), ix = lerp(960, 960, open), iy = lerp(444, 470, open), ir = lerp(8, 1400, open) * (1 - shut) + 2 * shut;
    const z = lerp(1, 1.05, pr(t, t0, b(11))), dim = lerp(1, .3, eio(pr(t, b(8) - .2, b(8) + .3)));
    X.save(); X.beginPath(); X.arc(ix, iy, Math.max(0, ir), 0, TAU); X.clip();
    print('la-602', 960, 470, 1000, { z, mount: 10, alpha: dim });
    const tl = printPt('la-602', 960, 470, 1000, .5, .525, { z });
    if (open >= 1 && t < b(8)) sight(tl[0], tl[1], 60, t, pr(t, t0 + .9, t0 + 1.2));
    const hs = fit('THE FIRST p(doom)', 1500, 78, { fam: FT.d, weight: 900 });
    kin('THE FIRST p(doom)', 960, 128, t, b(4), { size: hs, weight: 900, align: 'center', hot: [10, 17, C.mag], stag: .03 });
    if (t >= b(8)) {
      X.globalAlpha = .9 * pr(t, b(8) - .15, b(8)); X.fillStyle = C.navy; X.fillRect(0, 420, W, 300); X.globalAlpha = 1;
      const ns = fit('< 3 IN 1,000,000', 1500, 190, { fam: FT.d, weight: 900, stretch: 'semi-condensed' });
      kin('< 3 IN 1,000,000', 960, 600, t, b(8), { size: ns, weight: 900, stretch: 'semi-condensed', align: 'center', color: C.mag, stag: .03 });
      const cq = 'ARTHUR COMPTON’S CEILING FOR THE CHANCE OF IGNITING THE ATMOSPHERE · AS TOLD TO PEARL S. BUCK, THE AMERICAN WEEKLY, 1959';
            caption(cq, 960 - meas(cq, { size: 18 }) / 2, 680, t, b(9), { size: 18, color: C.white, cps: 200 });
    }
    X.restore();
    gc(ix, iy, ir, C.cyan, .8, 1.5);
    band(t, t0 + 1.0, b(7) + .4, 'LA-602 · “IGNITION OF THE ATMOSPHERE WITH NUCLEAR BOMBS” · LOS ALAMOS, 14 AUGUST 1946', 'KONOPINSKI, MARVIN, TELLER · DECLASSIFIED 1979 · TELLER RAISED THE QUESTION AT BERKELEY IN 1942; BETHE FOUND IT WILDLY UNLIKELY; FERMI TOOK BETS AT TRINITY (U.S. DOE HISTORY)');
    if (shut > .8) star(ix, iy, 6, C.white, 1);
  }
  // part 2: the cards, dealt from the dot
  if (t >= b(12)) {
    const stack = eio(pr(t, b(26.5), b(28) - .1));
    if (stack < 1) CARDS.forEach((c, i) => {
      const td = b(12 + 1.5 * i), k = eio(pr(t, td, td + .5)); if (k <= 0) return;
      const flipBack = eio(pr(t, b(21) + i * .25, b(21) + i * .25 + .4));
      const f = Math.cos(Math.PI * (1 - k) + Math.PI * flipBack);
      const x = lerp(960, slotX(i), k), y = lerp(560, SLOT_Y, k), s = lerp(.3, 1, k);
      card(c, lerp(x, 960, stack), lerp(y, 560, stack), f, lerp(s, .92, stack), lerp(0, (i - 2) * .06, stack), t, 1);
    });
    if (stack >= 1) cardStack(1, t, 1);
    if (t < b(12.4)) star(960, 560, 6 * (1 - pr(t, b(12), b(12.4))), C.white, 1);
    const hs = fit('p(doom) ALL-STARS', 1100, 86, { fam: FT.d, weight: 900, stretch: 'expanded' });
    kin('p(doom) ALL-STARS', 960, 180, t, b(19), { size: hs, weight: 900, stretch: 'expanded', align: 'center', hot: [0, 7, C.mag], stag: .03, out: b(26.5) });
    const sub = 'A SET, AFTER MANUFACTURING CONSENT’S PHILOSOPHER ALL-STARS (1992) · NO LIKENESSES, EACH PERSON’S INSTRUMENT INSTEAD';
    caption(sub, 960 - meas(sub, { size: 15 }) / 2, 222, t, b(19) + .3, { size: 15, color: C.lav, cps: 220, alpha: 1 - pr(t, b(26.5), b(26.8)) });
    band(t, b(23), b(28) - .4, 'THE FIRST NUMBER CAME FROM THE PEOPLE BUILDING THE BOMB. THE NEW ONES COME FROM THE PEOPLE BUILDING AI.', 'EVERY FIGURE AS THE PERSON SAID IT, DATED AND SOURCED ON THE BACK OF THE CARD');
  }
  plateLabel('FIG. 7', 'p(doom)', '', t, t0 + .2);
}
