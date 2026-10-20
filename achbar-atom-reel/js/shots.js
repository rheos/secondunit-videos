// Romancing the Atom, graphics test, draft 6. Ten plates on the score's bars (score-library atom-drive take-02,
// 111 BPM; the first downbeat, where the drums enter, is B0). Main look: Travel Agent's schematic blueprint.
// Words: Airplane's kinetic type. Each plate hands over through one element at the same place on screen.
// The three plates added in draft 6 (the metaphors, the machine, p(doom)) live in js/plates6.js.
// Facts on screen, with sources: BUILD-STATE.md.
'use strict';
const B0 = 17.211, BEAT = 0.53574, BAR = 4 * BEAT, HB = BEAT / 2;
const bar = (n) => B0 + n * BAR, bt = (n) => B0 + n * BEAT;
const pr = (t, a, b) => cl((t - a) / (b - a));
C.mag = '#ff3d9a';
// plate starts (pass 2): title, the tapes, promise, metaphors, the fields, same lab, machine, scope, the day
// after, clock, the restart, p(doom), red flags, title block. The score is the 119 s take looped at bar lines
// (sfx.py BARMAP) so the music's own changes still land on the scope's sync loss and the p(doom) cards.
const PLATE = { A: 0, T: bar(4), B: bar(9), M: bar(14), X: bar(19), C: bar(24), N: bar(29), D: bar(34), Y: bar(39), E: bar(44), Z: bar(48), P: bar(53), F: bar(61), G: bar(66) };
const END = 175.0;
const FIG = { A: 'FIG. 0', T: 'FIG. 1', B: 'FIG. 2', M: 'FIG. 3', X: 'FIG. 4', C: 'FIG. 5', N: 'FIG. 6', D: 'FIG. 7', Y: 'FIG. 8', E: 'FIG. 9', Z: 'FIG. 10', P: 'FIG. 11', F: 'FIG. 12', G: 'SHEET 1' };
const TITLE = 'ROMANCING THE ATOM';
// chapter numbers, after The Corporation's clinical cards: diagnosis to prognosis
const CHAP = { 'SHEET 1': 'CH. 13' }; for (let i = 0; i <= 12; i++) CHAP['FIG. ' + i] = 'CH. ' + String(i).padStart(2, '0');

// ---------- shared marks ----------
function ellPt(cx, cy, rx, ry, rot, a) { const c = Math.cos(rot), s = Math.sin(rot), x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * c - y * s, cy + x * s + y * c]; }
function ellPts(cx, cy, rx, ry, rot, a0 = 0, a1 = TAU, n = 90) { const o = []; for (let i = 0; i <= n; i++) o.push(ellPt(cx, cy, rx, ry, rot, lerp(a0, a1, i / n))); return o; }
// the emblem: a nucleus and three orbits, drawn in to fraction k, electrons running at time t
function atom(cx, cy, rx, ry, k, t, o = {}) {
  const col = o.col || C.cyan, a = o.a ?? 1, rots = o.rots || [0, Math.PI / 3, -Math.PI / 3];
  rots.forEach((rot, i) => {
    const kk = eo(seg(k, i * .15, .7 + i * .15)); if (kk <= 0) return;
    path(ellPts(cx, cy, rx, ry, rot, -Math.PI / 2, -Math.PI / 2 + TAU * kk), col, 1.6, .9 * a);
    path(ellPts(cx + jit(1.2), cy + jit(1.2), rx, ry, rot, -Math.PI / 2, -Math.PI / 2 + TAU * kk, 60), col, .8, .35 * a);
    if (kk >= 1 && o.electrons !== false) { const e = ellPt(cx, cy, rx, ry, rot, t * (1.3 + i * .23) + i * 2.1); star(e[0], e[1], 3.2, C.white, .9 * a); }
  });
  if (o.nucleus !== false) star(cx, cy, (o.nr || 7) * (1 + .25 * Math.exp(-6 * Math.max(0, t - (o.pulse ?? -9)))), C.white, a * cl(k * 3));
}
// a leader from a point to a label, schematic style
function leader(x, y, lx, ly, title, sub, t, t0, o = {}) {
  if (t < t0) return;
  cue('L|' + title + '|' + t0.toFixed(3), 'zip', t0, o.size || 24);
  const k = eo(seg(t, t0, t0 + .35)), ex = lerp(x, lx, k), ey = lerp(y, ly, k), right = lx >= x;
  gl(x, y, ex, ey, o.col || C.white, .85, 1.2); gc(x, y, 7, o.col || C.white, .9, 1.2);
  if (k >= 1) {
    gl(lx, ly, lx + (right ? 40 : -40), ly, o.col || C.white, .85, 1.2);
    const tx = lx + (right ? 52 : -52), al = right ? 'left' : 'right';
    caption(title, right ? tx : tx - meas(title, { size: o.size || 24, weight: 700 }), ly + 8, t, t0 + .35, { size: o.size || 24, weight: 700, color: o.hot ? C.mag : C.white });
    if (sub) caption(sub, right ? tx : tx - meas(sub, { size: 17 }), ly + 38, t, t0 + .7, { size: 17, color: C.lav, alpha: .85 });
  }
}
// crosshair ring with turning ticks
function sight(x, y, r, t, a = 1, col = C.white) { gc(x, y, r, col, .8 * a, 1.2); ticks(x, y, r, 48, 6, col, .6 * a, 1, 4, t * .4, t * .4 + TAU); gl(x - r * 1.5, y, x - r * .6, y, col, .8 * a, 1.2); gl(x + r * .6, y, x + r * 1.5, y, col, .8 * a, 1.2); gl(x, y - r * 1.5, x, y - r * .6, col, .8 * a, 1.2); gl(x, y + r * .6, x, y + r * 1.5, col, .8 * a, 1.2); }
// blueprint ground, dressing re-labelled for this film
function schDress() {
  const r = M32(DSEED * 7 + 3);
  for (let i = 0; i < 3; i++) { const x = r() * W, y = r() * H, rr = 200 + r() * 600; gc(x, y, rr, C.lav, .08, 1, i ? [2, 9] : null); ticks(x, y, rr, 180, 4, C.lav, .1, 1, 15); }
  for (let i = 0; i < 2; i++) { const y1 = r() * H, y2 = r() * H; gl(-100, y1, W + 100, y2, C.lav, .08); }
  for (let i = 0; i < 2; i++) { const x = r() * W, y = r() * H, rr = 60 + r() * 120; stip(null, x, y, rr, 700, C.lav, .25, 1.3, [r() - .5, r() - .5], .5); gc(x, y, rr, C.lav, .14, 1, [3, 5]); }
  const tags = ['U-235', 'PU-239', 'KT', 'MEV', 'T+', 'REF', 'ΔX', 'ΔY', 'λ'];
  for (let i = 0; i < 9; i++) lab(W - 64, 150 + i * 22, (r() * 999).toFixed(1).padStart(6, '0') + ' ' + tags[i], C.lav, .24, 10, 'right');
  for (let i = 0; i < 6; i++) { const x = r() * W, y = r() * H; X.beginPath(); X.moveTo(x - 9, y); X.lineTo(x + 9, y); X.moveTo(x, y - 9); X.lineTo(x, y + 9); stroke(C.lav, 1, .3); }
  stipRect(0, 0, W, H, 600, C.lav, .22, 1.2);
}
function plateLabel(n, title, sub, t, t0) {
  n = CHAP[n] || n;
  lab(80, 74, n, C.lav, .85, 19); caption(title, 80 + meas(n, { size: 19 }) * 1.3 + 26, 74, t, t0, { size: 19, color: C.white, cps: 46 });
  if (sub) lab(80, 96, sub, C.lav, .55, 12);
  lab(W - 80, 74, TITLE, C.lav, .6, 16, 'right');
}
// a navy caption band along the bottom, typed
function band(t, t0, t1, title, sub) {
  const bk = pr(t, t0, t0 + .35) * (1 - pr(t, t1, t1 + .3)); if (bk <= 0) return;
  X.globalAlpha = .9 * bk; X.fillStyle = C.navy2; X.fillRect(0, 930, W * eo(pr(t, t0, t0 + .35)), 150); X.globalAlpha = 1;
  gl(0, 930, W * eo(pr(t, t0, t0 + .35)), 930, C.cyan, .8 * bk, 1.2);
  caption(title, 120, 990, t, t0 + .3, { size: 26, weight: 700, color: C.white, alpha: bk, cps: 60 });
  if (sub) caption(sub, 120, 1030, t, t0 + .5, { size: 17, color: C.lav, alpha: bk, cps: 150 });
}

// ---------- 0. the drafting, then the title ----------
function plateA(t) {
  schBG(); X.globalAlpha = 1;
  // HAER sheet 3, the Trinity bomb, drafted in animation (js/bomb.js), then the original swept in to match
  draftBomb(t, { alpha: lerp(1, .3, eio(pr(t, 13.9, 14.7))) * (1 - pr(t, 14.6, 15.4)) });
  const PZ = bz_(t), PH0 = printH(BB.key, BB.PW) * PZ, xa = 960 - BB.PW * PZ / 2 - 30, xb = 960 + BB.PW * PZ / 2 + 30;
  const sweep = eio(pr(t, 12.6, 13.5)), lift = pr(t, 13.95, 14.55), sx = lerp(xa, xb, sweep);
  const sx2 = lerp(xb, xa, eio(lift));   // the paper is swept off again, right to left
  if (sweep > 0 && lift < 1) print(BB.key, 960, BB.PY, BB.PW, { z: PZ, mount: 10, clip: [0, 0, Math.min(sx, sx2), H] });
  if (lift > 0 && lift < 1) { const y0 = BB.PY - PH0 / 2 - 20, y1 = BB.PY + PH0 / 2 + 20; gl(sx2, y0, sx2, y1, C.white, .95, 2.5); }
  if (sweep > 0 && sweep < 1) { const y0 = BB.PY - PH0 / 2 - 20, y1 = BB.PY + PH0 / 2 + 20; X.save(); X.globalCompositeOperation = 'lighter'; const g = X.createLinearGradient(sx, 0, sx + 90, 0); g.addColorStop(0, 'rgba(143,227,255,.35)'); g.addColorStop(1, 'rgba(143,227,255,0)'); X.fillStyle = g; X.fillRect(sx, y0, 90, y1 - y0); X.restore(); gl(sx, y0, sx, y1, C.white, .95, 2.5); }
  coreNote(t, 11.2, 1 - pr(t, 14.0, 14.5));
  band(t, 12.8, 14.3, 'THE ORIGINAL: TRINITY SITE, SHEET 3, “THE BOMB”', 'HISTORIC AMERICAN ENGINEERING RECORD, 1985 · LIBRARY OF CONGRESS · AFTER LANSING LAMONT, DAY OF TRINITY (1965)');
  schFrame('0', '', '', C.lav);
  plateLabel('FIG. 0', t < 12.6 ? 'DRAFTING, AFTER HAER TRINITY SITE SHEET 3' : 'ROMANCING THE ATOM · A GRAPHICS TEST', '', t, t < 12.6 ? .8 : 12.7);
  titleSeq(t);
}
// the title: the atom draws itself before the drums, ROMANCING slams on the first downbeat
function titleSeq(t) {
  const ax = 960, ay = 430, T0 = bar(0);
  const k = pr(t, 14.8, 17.3), out = pr(t, bar(3) + BEAT, bar(3) + 2 * BEAT);   // the words leave; the atom stays for the tapes
  if (k <= 0) return;
  atom(ax, ay, 360, 118, k, t, { pulse: T0, a: 1 - out * .6 });
  if (k > .4) { bracket(ax - 360, ay + 190, ax + 360, ay + 190, C.lav, .6 * pr(t, 15.8, 16.4) * (1 - out), 'ORBIT  r = 360'); bracket(ax + 420, ay - 118, ax + 420, ay + 118, C.lav, .6 * pr(t, 16.1, 16.7) * (1 - out), '236'); }
  // romance, constructed: a heart built from two circles and two tangents around the nucleus
  const hk = pr(t, bar(1), bar(1) + 1.0), hx = ax, hy = ay - 8, hr = 34;
  if (hk > 0) {
    gc(hx - hr * .72, hy - hr * .35, hr * .75, C.lav, .5 * (1 - out), 1, [3, 4]); gc(hx + hr * .72, hy - hr * .35, hr * .75, C.lav, .5 * (1 - out), 1, [3, 4]);
    const Hh = []; for (let i = 0; i <= 80; i++) { const a = i / 80 * TAU; Hh.push([hx + 16 * Math.pow(Math.sin(a), 3) * hr / 15, hy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * hr / 15]); }
    path(Hh.slice(0, Math.max(2, Math.round(80 * eo(hk)))), C.mag, 2.4, 1 - out);
    if (hk >= 1) lab(hx + 70, hy - 62, 'ROMANCE (CONSTRUCTED)', C.mag, .9 * (1 - out), 14);
  }
  const tsz = fit('ROMANCING', 1240, 200, { fam: FT.d, weight: 900, stretch: 'expanded' });
  kin('ROMANCING', 960, 790, t, T0, { size: tsz, weight: 900, stretch: 'expanded', align: 'center', stag: .045, out: bar(3) + BEAT });
  kin('the atom', 960, 905, t, T0 + 2 * BEAT, { fam: FT.s, size: 120, weight: 400, italic: true, align: 'center', style: 'rise', stag: .05, dur: .35, out: bar(3) + BEAT + .1 });
}

// ---------- 1. the promise ----------
function plateB(t) {
  const t0 = PLATE.B, b = (n) => t0 + n * BEAT; schBG(); schFrame('2', '', '', C.lav);
  plateLabel(FIG.B, 'THE PROMISE', '', t, t0 + .1);
  // orbits from the title shrink onto the stamp's printed orbits
  const m = eio(pr(t, t0, t0 + .9)), sp = eio(pr(t, b(8), b(8) + .9));
  const sw = lerp(760, 470, sp), sx = lerp(600, 330, sp), sy = lerp(470, 470, sp);
  print('atoms-for-peace-stamp', sx, sy, sw, { alpha: pr(t, t0 + .25, t0 + .8), mount: 0 });
  // (the tapes plate hands over by moving the photograph onto this spot; the stamp prints over it)
  const ann = pr(t, t0 + 1, t0 + 1.4) * (1 - sp);
  if (ann > 0) { const h = printH('atoms-for-peace-stamp', sw); bracket(sx - sw / 2, sy + h / 2 + 34, sx + sw / 2, sy + h / 2 + 34, C.white, .8 * ann, '3¢ U.S. POSTAGE · ATOMS FOR PEACE · 1955'); }
  // quote 1: Lewis Strauss, 1954
  const q1o = b(8) - .4;
  caption('1954 · LEWIS STRAUSS, CHAIRMAN, U.S. ATOMIC ENERGY COMMISSION', 1060, 300, t, t0 + 1.0, { size: 18, color: C.lav, alpha: (1 - pr(t, q1o, q1o + .3)) * .95 });
  const qs = fit('“ELECTRICAL ENERGY', 760, 96, { fam: FT.d, weight: 800, stretch: 'semi-condensed' });
  const L1 = { size: qs, weight: 800, stretch: 'semi-condensed', out: q1o };
  kin('“ELECTRICAL ENERGY', 1060, 420, t, b(2), L1);
  kin('TOO CHEAP', 1060, 420 + qs * 1.08, t, b(3), { ...L1, color: C.mag });
  kin('TO METER.”', 1060, 420 + qs * 2.16, t, b(4), { ...L1, color: C.mag });
  // the stamp's orbits run out into a network
  const nk = pr(t, b(8) + .3, b(8) + 1.8), nodes = [];
  const cols = [[760, 4], [960, 6], [1160, 6], [1360, 4], [1580, 1]];
  cols.forEach(([x, n], c) => { for (let i = 0; i < n; i++) nodes.push({ x, y: 470 + (i - (n - 1) / 2) * 92, c }); });
  if (nk > 0) {
    const src = [sx + sw * .3, sy];
    nodes.filter((d) => d.c === 0).forEach((d, i) => { const kk = eo(seg(nk, i * .04, .25 + i * .04)); path([src, [lerp(src[0], d.x, kk), lerp(src[1], d.y, kk)]], C.cyan, 1.2, .7); });
    for (let c = 0; c < cols.length - 1; c++) {
      const A = nodes.filter((d) => d.c === c), Bn = nodes.filter((d) => d.c === c + 1), kk = eo(seg(nk, .2 + c * .18, .45 + c * .18));
      if (kk > 0) A.forEach((a) => Bn.forEach((b2) => gl(a.x, a.y, lerp(a.x, b2.x, kk), lerp(a.y, b2.y, kk), C.cyan, .28, 1)));
    }
    nodes.forEach((d) => { const kk = seg(nk, .1 + d.c * .18, .3 + d.c * .18); if (kk <= 0) return; if (d.c === 4) { star(d.x, d.y, 7 * (1 + .6 * pr(t, b(20) - .6, b(20))), C.white, kk); } else { const hp = hexPts(d.x, d.y, 16 * eo(kk)); fillP(PP(hp), C.navy); iP(hp, true, C.white, 1.3, .9, false, .3); } });
    // signals running through on the beat
    if (nk >= 1) for (let s = 0; s < 6; s++) { const ph = (t * .9 + s / 6) % 1, c = Math.floor(ph * 4), u = ph * 4 - c, A = nodes.filter((d) => d.c === c), Bn = nodes.filter((d) => d.c === c + 1); if (!A.length || !Bn.length) continue; const a = A[(s * 3 + 1) % A.length], b2 = Bn[(s * 5 + 2) % Bn.length]; star(lerp(a.x, b2.x, u), lerp(a.y, b2.y, u), 2.4, C.cyan, .9); }
    if (nk > .6) lab(1580, 380, 'OUTPUT', C.lav, .7 * pr(nk, .6, 1), 12, 'center');
  }
  // the same four words, 71 years apart: both quotes set as strips with the shared words aligned, then measured
  const QS = { fam: FT.d, size: 54, weight: 800, stretch: 'semi-condensed' }, QX = 990;
  const pA = '“ELECTRICAL ENERGY ', pB = '“INTELLIGENCE ', tail = 'TOO CHEAP TO METER', eA = '.”', eB = ' …”';
  const wA = meas(pA, QS), wB = meas(pB, QS), wT = meas(tail, QS);
  const s1 = b(8) + .3, s2 = b(10), qo = b(20) - .45, y1 = 830, y2 = 980, qa = 1 - pr(t, qo, qo + .3);
  const cA1 = '1954 · LEWIS STRAUSS, ATOMIC ENERGY COMMISSION', cB1 = '2025 · SAM ALTMAN, OPENAI, “THE GENTLE SINGULARITY”';
  caption(cA1, QX - 30 - meas(cA1, { size: 17 }), y1 - 62, t, s1 - .2, { size: 17, color: C.lav, alpha: qa });
  kin(pA + tail + eA, QX - wA, y1, t, s1, { ...QS, stag: .018, hot: [pA.length, pA.length + tail.length, C.mag], out: qo });
  caption(cB1, QX - 30 - meas(cB1, { size: 17 }), y2 - 62, t, s2 - .2, { size: 17, color: C.lav, alpha: qa });
  kin(pB + tail + eB, QX - wB, y2, t, s2, { ...QS, stag: .018, hot: [pB.length, pB.length + tail.length, C.mag], out: qo });
  const mk = eo(pr(t, b(12), b(12) + .45)) * qa;
  if (mk > 0) {
    const bx0 = QX - 14, bx1 = QX + wT + 14, by0 = y1 - 50, by1 = y2 + 16;
    X.setLineDash([6, 5]); X.strokeStyle = C.white; X.lineWidth = 1.6; X.globalAlpha = .9 * mk;
    X.strokeRect(bx0, by0, (bx1 - bx0) * mk, by1 - by0); X.setLineDash([]); X.globalAlpha = 1;
    if (mk > .9) { lab(bx1 + 70, (by0 + by1) / 2 - 6, 'SAME FOUR WORDS', C.white, qa, 22); lab(bx1 + 70, (by0 + by1) / 2 + 26, '71 YEARS APART', C.lav, .85 * qa, 22); gl(bx1, (by0 + by1) / 2, bx1 + 56, (by0 + by1) / 2 - 12, C.white, .8 * qa, 1.2); }
  }
}

// ---------- 3. the same lab ----------
const TRI = { cx: 960, cy: 530, w: 1560, u: .48, v: .43 };
const ENI = { cx: 960, cy: 545, w: 1170, u: .36, v: .42 };
function plateC(t) {
  const t0 = PLATE.C, b = (n) => t0 + n * BEAT; schBG(); schFrame('5', '', '', C.lav);
  const swap = b(8), close1 = swap - .8, tEnd = PLATE.N; // fireball closes to a point, ENIAC opens from it
  // Trinity: an iris opens from the metaphors' divider onto HAER sheet 4 (1985), whose drawn fireball is
  // set at the same place and size as the photograph's; the drawing's panel then becomes the photograph
  if (t < swap) {
    const z = lerp(1, 1.07, pr(t, t0, swap)), fb = printPt('trinity', TRI.cx, TRI.cy, TRI.w, TRI.u, TRI.v, { z, fx: TRI.u, fy: TRI.v });
    const SW = 1190, SH = printH('trinity-haer-fireball', SW), scx = fb[0], scy = fb[1] + .03 * SH;
    const open = eo(pr(t, t0, t0 + .9)), shut = eio(pr(t, close1, swap));
    const ix = lerp(LA_PIN[0], fb[0], open), iy = lerp(LA_PIN[1], fb[1], open), ir = lerp(8, 1150, open) * (1 - shut) + 2 * shut;
    const ph0 = t0 + 1.6, phk = eio(pr(t, ph0 + .25, ph0 + .85));
    const S = (u, v) => printPt('trinity-haer-fireball', scx, scy, SW, u, v);
    if (phk < 1) print('trinity-haer-fireball', scx, scy, SW, { iris: { x: ix, y: iy, r: ir }, mount: 8 });
    if (t > ph0) {
      const p0 = S(.28, .18), p1 = S(.72, .72), clip = [lerp(p0[0], 0, phk), lerp(p0[1], 0, phk), lerp(p1[0] - p0[0], W, phk), lerp(p1[1] - p0[1], H, phk)];
      X.save(); X.beginPath(); X.arc(ix, iy, Math.max(0, ir), 0, TAU); X.clip();
      print('trinity', TRI.cx, TRI.cy, TRI.w, { z, fx: TRI.u, fy: TRI.v, clip, mount: 0, alpha: pr(t, ph0, ph0 + .3) });
      if (phk < 1) { X.strokeStyle = C.cyan; X.lineWidth = 1.5; X.globalAlpha = .8; X.strokeRect(...clip); X.globalAlpha = 1; }
      X.restore();
    }
    gc(ix, iy, ir, C.cyan, .8, 1.5);
    if (open >= 1 && t < ph0) { const gz = S(.5, .61); sight(gz[0], gz[1], 46, t, pr(t, t0 + .9, t0 + 1.2)); }
    band(t, t0 + .7, ph0 + .7, 'JULY 16, 1945 · TRINITY SITE, SHEET 4', 'DRAWN 1985 BY ROSSANA H. SANTOS · HISTORIC AMERICAN ENGINEERING RECORD, LIBRARY OF CONGRESS');
    if (phk >= 1 && shut === 0) {
      sight(fb[0], fb[1], 120, t, pr(t, ph0 + .85, ph0 + 1.1));
      leader(fb[0] + 120, fb[1] - 60, 1340, 230, 'TRINITY · NEW MEXICO', '16 JULY 1945 · 05:29 · U.S. DEPT. OF ENERGY PHOTO', t, ph0 + .9);
    }
    if (shut > .8) star(fb[0], fb[1], 6, C.white, 1);
  } else {
    const z = lerp(1.0, 1.06, pr(t, swap, tEnd)), pt = printPt('eniac-beck-snyder', ENI.cx, ENI.cy, ENI.w, ENI.u, ENI.v, { z, fx: ENI.u, fy: ENI.v });
    const open = eo(pr(t, swap, swap + .9)), shut = eio(pr(t, tEnd - .75, tEnd));
    const fbEnd = printPt('trinity', TRI.cx, TRI.cy, TRI.w, TRI.u, TRI.v, { z: 1.07, fx: TRI.u, fy: TRI.v });
    const ix = lerp(fbEnd[0], pt[0], open), iy = lerp(fbEnd[1], pt[1], open);
    const cx = lerp(ix, 960, shut), cy = lerp(iy, 520, shut), ir = lerp(2, 1150, open) * (1 - shut) + 2 * shut;
    print('eniac-beck-snyder', ENI.cx, ENI.cy, ENI.w, { z, fx: ENI.u, fy: ENI.v, iris: { x: cx, y: cy, r: ir }, mount: 0 });
    gc(cx, cy, ir, C.cyan, .8, 1.5);
    if (open >= 1 && shut === 0) {
      leader(pt[0] + 40, pt[1] - 120, 560, 200, 'ENIAC', 'U.S. ARMY PHOTO', t, swap + .9, { size: 28 });
      // the caption band
      const bk = pr(t, swap + .95, swap + 1.3), by = 880;
      X.globalAlpha = .88 * bk; X.fillStyle = C.navy; X.fillRect(0, by - 92, W * eo(bk), 190); X.globalAlpha = 1;
      if (bk > 0) gl(0, by - 92, W * eo(bk), by - 92, C.cyan, .8, 1.2);
      const cs = fit('A SECRET PROBLEM FROM LOS ALAMOS', 1500, 74, { fam: FT.d, weight: 800, stretch: 'semi-condensed' });
      caption('DECEMBER 1945 · ITS FIRST JOB:', 210, by - 34, t, swap + 1.2, { size: 26, color: C.lav });
      kin('A SECRET PROBLEM FROM LOS ALAMOS', 210, by + 52, t, swap + 1.6, { size: cs, weight: 800, stretch: 'semi-condensed', hot: [22, 32, C.mag], out: tEnd - .95 });
      // the case file's purpose field: redacted, and the bar never lifts (the program is still classified)
      const rk = pr(t, swap + 2.1, swap + 2.45), ra = 1 - pr(t, tEnd - .95, tEnd - .65);
      if (rk > 0) {
        txt('PURPOSE:', 1250, by - 34, { size: 26, color: C.lav, alpha: ra });
        X.globalAlpha = ra; X.fillStyle = '#000'; X.fillRect(1395, by - 58, 250 * eo(rk), 32); X.globalAlpha = 1;
        if (rk >= 1) lab(1662, by - 36, 'STILL CLASSIFIED', C.white, .9 * ra, 16);
      }
    }
    if (shut > .7) star(cx, cy, 6, C.white, 1);
  }
  plateLabel(FIG.C, 'THE SAME LAB', '', t, t0 + .2);
}

// ---------- 5. the oscilloscope ----------
const TB = { cx: 960, cy: 520, w: 1560, h: 800 };
const PX = (yr) => TB.cx - TB.w / 2 + 120 + (yr - 1945) / (2026 - 1945) * (TB.w - 240);
const PY = (n) => TB.cy + TB.h / 2 - 90 - n / 75000 * (TB.h - 200);
function wAt(yr) { const i = WARHEADS.findIndex((r) => r[0] >= yr); if (i <= 0) return WARHEADS[0][1]; const [y0, n0] = WARHEADS[i - 1], [y1, n1] = WARHEADS[i]; return lerp(n0, n1, (yr - y0) / (y1 - y0)); }
function curvePts(y1) { const o = []; for (const [yr, n] of WARHEADS) { if (yr > y1) break; o.push([PX(yr), PY(n)]); } if (y1 > 1945) o.push([PX(y1), PY(wAt(y1))]); return o; }
const fmt = (n) => Math.round(n).toLocaleString('en-US');
// three-orbit Lissajous atom the trace falls into when sync is lost
function lissPt(s, rx, ry) { const ring = Math.floor(s * 3) % 3, u = (s * 3) % 1, rot = [0, Math.PI / 3, -Math.PI / 3][ring]; return ellPt(TB.cx, TB.cy, rx, ry, rot, u * TAU); }
function plateD(t) {
  const t0 = PLATE.D, b = (n) => t0 + n * BEAT, tEnd = PLATE.Y;
  X.fillStyle = '#000'; X.fillRect(0, 0, W, H);
  const on = pr(t, t0, t0 + .8);
  tube(TB.cx, TB.cy, TB.w, TB.h, on);
  if (on < 1) { beamDot(TB.cx, TB.cy, 5, 1); if (on > .02) beam([[TB.cx - TB.w / 2 * eo(cl(on / .5)), TB.cy], [TB.cx + TB.w / 2 * eo(cl(on / .5)), TB.cy]], .9); }
  const y0 = 1945, d0 = t0 + 1.3, d1 = b(9), yr = lerp(y0, 2026, pr(t, d0, d1)), sync = eio(pr(t, b(16) - .2, b(16) + 1.4));
  const ax = pr(t, t0 + .9, t0 + 1.3);
  if (ax > 0) {
    ptxt('CH1  NUCLEAR WARHEADS, WORLD', TB.cx - TB.w / 2 + 60, TB.cy - TB.h / 2 + 66, { size: 24, alpha: ax * (1 - sync) });
    ptxt('FAS ESTIMATES VIA OUR WORLD IN DATA', TB.cx - TB.w / 2 + 60, TB.cy - TB.h / 2 + 98, { size: 17, alpha: .7 * ax * (1 - sync), blur: 8 });
    for (const y of [1945, 1986, 2026]) ptxt(String(y), PX(y), TB.cy + TB.h / 2 - 44, { size: 20, align: 'center', alpha: .85 * ax * (1 - sync), blur: 8 });
    for (const n of [0, 25000, 50000, 75000]) ptxt(n ? (n / 1000) + 'K' : '0', TB.cx - TB.w / 2 + 70, PY(n) + 7, { size: 17, align: 'right', alpha: .6 * ax * (1 - sync), blur: 6 });
  }
  if (t >= d0) {
    const P = curvePts(yr);
    if (sync <= 0) {
      for (let i = 1; i < P.length; i++) { const age = (P.length - i) / 14; beam([P[i - 1], P[i]], lerp(1, .38, cl(age)), PH.g, 2.8); }
      const hd = P[P.length - 1]; if (t < d1 + .05) beamDot(hd[0], hd[1], 6, 1);
    } else {
      const full = curvePts(2026), Q = [];
      const dense = []; for (let i = 1; i < full.length; i++) { const [a, bq] = [full[i - 1], full[i]], n = Math.max(1, Math.ceil(Math.hypot(bq[0] - a[0], bq[1] - a[1]) / 8)); for (let k = 0; k < n; k++) dense.push([lerp(a[0], bq[0], k / n), lerp(a[1], bq[1], k / n)]); }
      dense.forEach((p, i) => { const s = i / dense.length, l = lissPt(s + t * .05 * sync, 360, 118); const tear = (1 - sync) * sync * 4 * (hash1(Math.floor(p[1] / 6) + Math.floor(t * 30) * 101) - .5) * 160; Q.push([lerp(p[0], l[0], sync) + tear, lerp(p[1], l[1], sync)]); });
      for (let r = 0; r < 3; r++) beam(Q.filter((_, i) => Math.floor(((i / dense.length + t * .05 * sync) * 3)) % 3 === r && Math.abs(Q[i][0] - (Q[i - 1] || Q[i])[0]) < 400), 1, PH.g, 2.6);
      if (sync >= 1) beamDot(TB.cx, TB.cy, 7 * (1 + .4 * Math.exp(-5 * Math.max(0, t - tEnd + 1))), 1);
    }
    if (sync < 1) {
      const n = wAt(Math.min(yr, 2026)), ra = 1 - sync;
      ptxt(String(Math.floor(Math.min(yr, 2026))), TB.cx + TB.w / 2 - 70, TB.cy - TB.h / 2 + 70, { size: 26, align: 'right', alpha: ra });
      ptxt(fmt(n), TB.cx + TB.w / 2 - 70, TB.cy - TB.h / 2 + 150, { size: 72, align: 'right', alpha: ra, c: PH.g, blur: 22 });
      ptxt('WARHEADS', TB.cx + TB.w / 2 - 70, TB.cy - TB.h / 2 + 182, { size: 18, align: 'right', alpha: .75 * ra, blur: 8 });
      const tp = lerp(d0, d1, (1986 - y0) / (2026 - y0));
      if (t > tp) { const k = eo(pr(t, tp, tp + .3)); const x = PX(1986), y = PY(70374); beam([[x, y - 18], [x, y - 18 - 60 * k]], .8 * ra, PH.a, 1.6); if (k >= 1) ptxt('PEAK 70,374 · 1986', x + 16, y - 66, { size: 26, alpha: ra }); }
      if (t > d1) { const k = eo(pr(t, d1, d1 + .3)); const x = PX(2026), y = PY(12187); beam([[x, y - 18], [x, y - 18 - 70 * k]], .8 * ra, PH.a, 1.6); if (k >= 1) ptxt('12,187 · 2026', x - 14, y - 98, { size: 26, align: 'right', alpha: ra }); }
    }
  }
  // CH2: training compute of notable AI systems (Epoch AI via Our World in Data), log scale, amber, drawn after CH1
  const c0 = b(9) + .3, c1 = b(13.5), ck = pr(t, c0, c1), ra2 = (1 - sync) * pr(t, c0, c0 + .3);
  if (ck > 0 && sync < 1) {
    const CY = (pf) => TB.cy + TB.h / 2 - 90 - (Math.log10(pf) + 10) / 22 * (TB.h - 200);   // 1e-10 .. 1e12 petaFLOP
    const yrEnd = lerp(1950, 2026, ck), P = []; for (const [yr, pf] of COMPUTE) { if (yr > yrEnd) break; P.push([PX(yr), CY(pf)]); }
    for (let i = 1; i < P.length; i++) { const age = (P.length - i) / 10; beam([P[i - 1], P[i]], lerp(1, .4, cl(age)) * ra2, PH.a, 2.4); }
    if (P.length) { const hd = P[P.length - 1]; if (ck < 1) beamDot(hd[0], hd[1], 5, ra2, PH.a); }
    ptxt('CH2  TRAINING COMPUTE, NOTABLE AI SYSTEMS (LOG)', TB.cx - TB.w / 2 + 60, TB.cy - TB.h / 2 + 130, { size: 20, alpha: ra2, c: PH.a });
    ptxt('EPOCH AI VIA OUR WORLD IN DATA · PETAFLOP', TB.cx - TB.w / 2 + 60, TB.cy - TB.h / 2 + 158, { size: 15, alpha: .7 * ra2, c: PH.a, blur: 8 });
    for (const [nm, yr, pf] of [['PERCEPTRON', 1957, 6.95e-10], ['ALEXNET', 2012, 470], ['GPT-4', 2023, 2.1e10]]) if (yr <= yrEnd) { const x = PX(yr), y = CY(pf); beam([[x + 10, y], [x + 40, y - 20]], .7 * ra2, PH.a, 1.4); ptxt(nm, x + 46, y - 24, { size: 16, alpha: .9 * ra2, c: PH.a, blur: 8 }); }
    if (ck >= 1) { const mx = Math.max(...COMPUTE.map((r) => r[1])); ptxt('10^' + Math.round(Math.log10(mx / 6.95e-10)) + ' TIMES THE PERCEPTRON', TB.cx + TB.w / 2 - 70, TB.cy - TB.h / 2 + 230, { size: 20, align: 'right', alpha: ra2 * pr(t, c1, c1 + .3), c: PH.a }); }
  }
  tubeGlass(TB.cx, TB.cy, TB.w, TB.h, t);
}
function hash1(n) { n = (n ^ 61) ^ (n >>> 16); n = n + (n << 3); n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }

// ---------- 6. the clock, 8. red flags, 9. title block: one sheet, the camera travels down it ----------
const CK = { x: 960, y: 520, r: 330 };
const FORM_Y = 2100, BLOCK_Y = 3400;
function camAt(t) {
  const t0 = PLATE.E, tip = [CK.x, CK.y - CK.r]; let c = [960, 540, 1];
  const go = (k, to) => { c = [lerp(c[0], to[0], k), lerp(c[1], to[1], k), Math.exp(lerp(Math.log(c[2]), Math.log(to[2]), k))]; };
  go(eio(pr(t, t0 + 4.6, t0 + 5.9)), [tip[0] - 40, tip[1] + 50, 3.1]);
  go(eio(pr(t, t0 + 6.3, t0 + 7.3)), [960, 760, .4]);                                  // out: the clock is on a scoreboard
  go(eio(pr(t, PLATE.Z - .3, PLATE.Z)), [960, FORM_Y - 80 + 540, 1]);                  // (hidden behind the restart and p(doom) plates)
  go(eio(pr(t, PLATE.G - .05, PLATE.G + 1.0)), [960, BLOCK_Y - 170 + 540, 1]);
  return c;
}
// MC03 after Achbar: the clock plays on a stadium scoreboard between the score and the kiss cam, and the
// crowd under it is looking at its phones. Drawn in world space around the clock; revealed by the camera.
function scoreboard(t) {
  const sb = pr(t, PLATE.E + 6.2, PLATE.E + 7.2); if (sb <= 0) return;
  const draw = eo(sb), A = sb;
  X.save(); X.globalAlpha = A;
  X.fillStyle = C.navy2; X.fillRect(60, 120, 520, 810); X.fillRect(1340, 120, 520, 810); X.fillRect(560, 120, 800, 70); X.fillRect(560, 900, 800, 30);
  X.restore();
  iBox(60, 120, 1800 * draw, 810, C.white, 2, .9 * A, false); iBox(80, 140, 480, 770, C.lav, 1.2, .6 * A, false); iBox(1360, 140, 480, 770, C.lav, 1.2, .6 * A, false);
  for (const x of [400, 1520]) gl(x, 930, x, 1150, C.lav, .6 * A, 3);
  const led = (str, x, y, size, col = C.white) => txt(str, x, y, { fam: FT.m, size, weight: 700, color: col, align: 'center', alpha: A });
  if (sb > .3) { led('HOME', 320, 260, 46); led('3', 320, 440, 170); led('VISITORS', 320, 560, 40); led('1', 320, 740, 170); led('7TH INNING', 320, 860, 30, C.lav); }
  if (sb > .5) {
    led('KISS', 1600, 300, 92); led('CAM', 1600, 400, 92);
    const hx = 1600, hy = 600, hr = 110, P = []; for (let i = 0; i <= 80; i++) { const a = i / 80 * TAU; P.push([hx + 16 * Math.pow(Math.sin(a), 3) * hr / 15, hy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * hr / 15]); }
    path(P, C.white, 5, A); led('NEXT!', 1600, 840, 44, C.lav);
  }
  X.save(); X.globalAlpha = .35 * A; X.strokeStyle = C.navy2; X.lineWidth = 3; X.beginPath();
  for (const [x0, x1] of [[80, 560], [1360, 1840]]) { for (let y = 144; y < 910; y += 9) { X.moveTo(x0, y); X.lineTo(x1, y); } }
  X.stroke(); X.restore();
  // the crowd, heads down
  const r0 = M32(4242);
  for (let row = 0; row < 5; row++) {
    const y = 1220 + row * 78;
    for (let x = -460 + (row % 2) * 34; x < 2380; x += 68) {
      const jx = (r0() - .5) * 16, hx = x + jx, hy = y + (r0() - .5) * 8, ph = r0() < .8;
      const sh = new Path2D(); sh.ellipse(hx, hy + 44, 32, 24, 0, Math.PI, TAU); sh.closePath();
      X.save(); X.globalAlpha = A; X.fillStyle = C.navy; X.fill(sh); X.beginPath(); X.arc(hx, hy + 8, 17, 0, TAU); X.fill(); X.restore();
      X.globalAlpha = .7 * A; X.strokeStyle = C.lav; X.lineWidth = 1.5; X.stroke(sh); X.beginPath(); X.arc(hx, hy + 8, 17, 0, TAU); X.stroke(); X.globalAlpha = 1;
      if (ph) { X.save(); X.globalAlpha = A; X.fillStyle = C.cyan; X.fillRect(hx - 6, hy + 30, 12, 9); X.globalAlpha = .25 * A; X.beginPath(); X.arc(hx, hy + 30, 22, 0, TAU); X.fill(); X.restore(); }
    }
  }
}
function plateEFG(t) {
  const t0 = PLATE.E; schBG();
  const [cx, cy, z] = camAt(t);
  X.save(); cam(cx, cy, z);
  // the atom from the scope arrives in blueprint ink and flattens into the clock's rim
  const flat = eio(pr(t, t0 + .5, t0 + 1.5)), glass = 1 - pr(t, t0, t0 + .6);
  if (glass > 0) { X.globalAlpha = glass; X.fillStyle = '#000'; X.beginPath(); X.roundRect(TB.cx - TB.w / 2, TB.cy - TB.h / 2, TB.w, TB.h, 46); X.fill(); X.globalAlpha = 1; }
  if (flat < 1) atom(CK.x, CK.y, lerp(360, CK.r, flat), lerp(118, CK.r, flat), 1, t, { rots: [0, Math.PI / 3 * (1 - flat), -Math.PI / 3 * (1 - flat)], electrons: false, col: C.cyan });
  const dial = pr(t, t0 + 1.3, t0 + 2.0);
  if (flat >= 1) {
    gc(CK.x, CK.y, CK.r, C.white, .95, 2); gc(CK.x, CK.y, CK.r + 14, C.lav, .4, 1, [4, 5]);
    ticks(CK.x, CK.y, CK.r - 16, 60, 8, C.white, .8 * dial, 1.3, 5, -Math.PI / 2, -Math.PI / 2 + TAU * eo(dial));
    ticks(CK.x, CK.y, CK.r - 34, 36, 4, C.lav, .55 * pr(t, t0 + 4.6, t0 + 5.6), .6, 12, -Math.PI / 2 - 36 * TAU / 720, -Math.PI / 2);
    for (let h = 0; h < 12; h++) { const a = -Math.PI / 2 + h * TAU / 12; if (dial > h / 12) lab(CK.x + Math.cos(a) * (CK.r - 70), CK.y + Math.sin(a) * (CK.r - 70) + 6, String(h || 12), C.white, .9, 18, 'center'); }
    gl(CK.x - CK.r - 60, CK.y, CK.x + CK.r + 60, CK.y, C.lav, .2, 1, [3, 6]); gl(CK.x, CK.y - CK.r - 60, CK.x, CK.y + CK.r + 60, C.lav, .2, 1, [3, 6]);
    // hands: 1947, seven minutes to midnight; then 2026, 85 seconds
    const hk = pr(t, t0 + 1.8, t0 + 2.2), sweep = eio(pr(t, t0 + 3.3, t0 + 4.9)), hidH = 1 - eio(pr(t, t0 + 4.4, t0 + 4.9)) + eio(pr(t, t0 + 6.3, t0 + 6.9));
    const secs = lerp(7 * 60, 85, sweep), ma = -Math.PI / 2 - secs / 3600 * TAU, ha = -Math.PI / 2 - secs / 43200 * TAU;
    if (hk > 0) {
      X.lineCap = 'round';
      path([[CK.x, CK.y], [CK.x + Math.cos(ha) * CK.r * .55 * eo(hk), CK.y + Math.sin(ha) * CK.r * .55 * eo(hk)]], C.white, 7, .95 * hidH);
      path([[CK.x, CK.y], [CK.x + Math.cos(ma) * (CK.r - 40) * eo(hk), CK.y + Math.sin(ma) * (CK.r - 40) * eo(hk)]], C.mag, 4, 1);
      star(CK.x, CK.y, 5, C.white, 1);
      const arcA = pr(t, t0 + 4.8, t0 + 5.4);
      if (arcA > 0) { gc(CK.x, CK.y, CK.r - 58, C.mag, arcA, 3, null, ma, -Math.PI / 2); }
    }
    if (hk > 0 && t < t0 + 3.7) { const a1947 = 1 - pr(t, t0 + 3.2, t0 + 3.5); lab(CK.x + CK.r + 70, CK.y - 120, '1947', C.lav, a1947, 22); kin('7 MINUTES', CK.x + CK.r + 70, CK.y - 50, t, t0 + 2.2, { size: 72, weight: 800, stretch: 'semi-condensed', out: t0 + 3.2 }); }
    lab(CK.x, CK.y + CK.r + 60, 'DOOMSDAY CLOCK · BULLETIN OF THE ATOMIC SCIENTISTS', C.lav, .8 * dial * (1 - pr(t, t0 + 4.3, t0 + 4.7)), 18, 'center');
  }
  scoreboard(t);
  formRF(t);
  titleBlock(t);
  X.restore();
  // screen-space words for the clock
  if (t < PLATE.Z) {
    const k0 = t0 + 5.4, out = PLATE.Z - .45;
    caption('27 JANUARY 2026 · BULLETIN OF THE ATOMIC SCIENTISTS', 120, 878, t, k0, { size: 20, color: C.lav, alpha: 1 - pr(t, out, out + .3) });
    const s = fit('85 SECONDS TO MIDNIGHT', 1680, 130, { fam: FT.d, weight: 900, stretch: 'semi-condensed' });
    X.globalAlpha = .95 * pr(t, k0 - .2, k0 + .1) * (1 - pr(t, out, out + .4)); X.fillStyle = C.navy2; X.fillRect(0, 836, W, 244); X.globalAlpha = 1;
    kin('85 SECONDS TO MIDNIGHT', 120, 1000, t, k0 + .25, { size: s, weight: 900, stretch: 'semi-condensed', hot: [0, 2, C.mag], out });
    caption('THE CLOSEST IT HAS BEEN. THE BULLETIN’S STATEMENT CALLS FOR INTERNATIONAL GUIDELINES ON AI.', 120, 1050, t, k0 + .6, { size: 18, color: C.lav, cps: 150, alpha: 1 - pr(t, out, out + .3) });
  }
  // the p(doom) stack's back, fading out over the form it became
  if (t >= PLATE.F && t < PLATE.F + .5) cardStackBack(t, 1 - pr(t, PLATE.F, PLATE.F + .5));
  plateLabel(t < PLATE.Z ? FIG.E : t < PLATE.G ? FIG.F : FIG.G, t < PLATE.Z ? 'THE CLOCK' : t < PLATE.G ? 'RED FLAGS' : 'TITLE BLOCK', '', t, t < PLATE.Z ? t0 + .2 : t < PLATE.G ? PLATE.F + .5 : PLATE.G + .6);
  schFrame(t < PLATE.Z ? '9' : t < PLATE.G ? '12' : '13', '', '', C.lav);
}
const ROWS = [
  ['TOO CHEAP TO METER', 'ATOM: STRAUSS, AEC, 1954  ·  AI: ALTMAN, OPENAI, 2025'],
  ['BUILT IN SECRET', 'ATOM: MANHATTAN PROJECT, 1942-46  ·  AI: GPT-4 REPORT WITHHOLDS SIZE AND DATA, 2023'],
  ['AN ARMS RACE', 'ATOM: 70,374 WARHEADS BY 1986  ·  AI: “WINNING THE RACE”, U.S. AI ACTION PLAN, 2025'],
  ['ITS MAKERS WARNED US', 'ATOM: SZILARD PETITION, 70 SCIENTISTS, 1945  ·  AI: CAIS EXTINCTION-RISK STATEMENT, 2023'],
  ['ITS MAKERS GAVE IT ODDS', 'ATOM: COMPTON, UNDER 3 IN A MILLION, 1945  ·  AI: HINTON, 10 TO 20 PERCENT, 2024'],
];
function formRF(t) {
  const t0 = PLATE.F, b = (n) => t0 + n * BEAT, y0 = FORM_Y; if (t < t0 - 1) return;
  const x0 = 300, x1 = 1620, cA = 1260, cB = 1480, rh = 100, ty = y0 + 300;
  lab(x0, y0 + 60, 'FORM RF-1 · RELATIONSHIP ASSESSMENT · EVERY FLAG SOURCED', C.lav, .85, 19);
  const ts = fit('RED FLAGS', 900, 170, { fam: FT.d, weight: 900, stretch: 'expanded' });
  kin('RED FLAGS', x0 - 6, y0 + 190, t, t0 + .6, { size: ts, weight: 900, stretch: 'expanded', stag: .05 });
  const hk = pr(t, t0 + .9, t0 + 1.4);
  gl(x0, ty - 30, lerp(x0, x1, eo(hk)), ty - 30, C.white, .9, 1.6);
  if (hk > .5) { lab(cA, ty - 48, 'THE ATOM', C.white, .9, 19, 'center'); lab(cB, ty - 48, 'AI', C.white, .9, 19, 'center'); }
  ROWS.forEach(([r, src], i) => {
    const rt = b(3 + i * 2), y = ty + 56 + i * rh;
    if (t < rt - .2) return;
    gl(x0, y + 46, lerp(x0, x1, eo(pr(t, rt - .2, rt + .2))), y + 46, C.lav, .45, 1);
    kin(r, x0, y + 4, t, rt, { size: 46, weight: 800, stretch: 'semi-condensed', style: 'rise' });
    caption(src, x0, y + 34, t, rt + .2, { size: 16, color: C.lav, cps: 140 });
    [cA, cB].forEach((cx, j) => {
      // a red flag runs up its pole in the column, flutters, then folds down into the ticked box
      const d = j * .18, up = eo(pr(t, rt + .3 + d, rt + .65 + d)), fold = eio(pr(t, rt + 1.25 + d, rt + 1.6 + d));
      const bx = cx - 26, by = y - 30;
      if (fold < 1) { const pa = pr(t, rt, rt + .2) * (1 - fold); gl(cx - 8, y + 36, cx - 8, lerp(y - 32, y + 36, fold), C.white, .5 * pa, 1.6); flag(cx - 8, y + 36, 68 * (1 - fold), up, t, i * 7 + j * 11, 1 - fold); }
      if (fold > 0) { X.strokeStyle = C.white; X.lineWidth = 2; X.globalAlpha = .9 * fold; X.strokeRect(bx, by, 52 * fold, 52); X.globalAlpha = 1; }
      const ck = eo(pr(t, rt + 1.6 + d, rt + 1.85 + d));
      if (ck > 0) { const P = [[bx + 10, by + 28], [bx + 22, by + 41], [bx + 46, by + 8]]; const L1 = Math.hypot(12, 13), L2 = Math.hypot(24, 33), dd = ck * (L1 + L2); const pts = dd <= L1 ? [P[0], [lerp(P[0][0], P[1][0], dd / L1), lerp(P[0][1], P[1][1], dd / L1)]] : [P[0], P[1], [lerp(P[1][0], P[2][0], (dd - L1) / L2), lerp(P[1][1], P[2][1], (dd - L1) / L2)]]; path(pts, RED, 6, 1); }
    });
  });
  // the stamp
  const sk = b(13) + .1;
  if (t > sk) {
    const k = eo(pr(t, sk, sk + .18)); X.save(); X.translate(1260, ty + 600); X.rotate(-.12); X.scale(lerp(1.6, 1, k), lerp(1.6, 1, k)); X.globalAlpha = k;
    X.strokeStyle = C.mag; X.lineWidth = 5; X.strokeRect(-330, -62, 660, 124); X.lineWidth = 2; X.strokeRect(-318, -50, 636, 100);
    X.restore(); kinStamp(t, sk, ty);
  }
}
// a red flag: the pennant runs up the pole to fraction k and flutters
const RED = '#ff3b3b';
function flag(x, yBase, h, k, t, ph = 0, a = 1) {
  if (k <= 0 || a <= 0) return;
  gl(x, yBase, x, yBase - h, C.white, .9 * a, 2);
  const top = yBase - h * k, w = h * .9 * k, fh = h * .5 * k, P = [[x, top]];
  for (let i = 1; i <= 8; i++) { const u = i / 8; P.push([x + w * u, top + fh * .5 * u + Math.sin(t * 9 + ph + u * 4) * 3.5 * u * k]); }
  for (let i = 8; i >= 1; i--) { const u = i / 8; P.push([x + w * u, top + fh * (1 - .5 * u) + Math.sin(t * 9 + ph + u * 4 + .6) * 3.5 * u * k]); }
  P.push([x, top + fh]);
  fillP(PP(P), RED, .95 * a); path(P.concat([P[0]]), '#ffb3b3', 1, .5 * a);
  star(x, top, 3, C.white, .9 * a);
}
function kinStamp(t, sk, ty) {
  X.save(); X.translate(1260, ty + 600); X.rotate(-.12); const k = eo(pr(t, sk, sk + .18)); X.scale(lerp(1.6, 1, k), lerp(1.6, 1, k)); X.globalAlpha = k;
  txt('SOUND FAMILIAR?', 0, 22, { fam: FT.d, size: fit('SOUND FAMILIAR?', 600, 70, { fam: FT.d, weight: 900 }), weight: 900, color: C.mag, align: 'center' });
  X.restore();
}
function titleBlock(t) {
  const t0 = PLATE.G + .1, y = BLOCK_Y; if (t < t0 - 1.5) return;
  const x0 = 220, x1 = 1700, rows = [y + 210, y + 330, y + 410, y + 490, y + 570, y + 650], k = pr(t, t0 + .2, t0 + 1.2);
  X.strokeStyle = C.white; X.lineWidth = 2; X.globalAlpha = .9; X.strokeRect(x0, y + 60, (x1 - x0) * eo(k), 650 * eo(pr(t, t0 + .2, t0 + .9))); X.globalAlpha = 1;
  if (k > .5) rows.slice(1).forEach((ry, i) => gl(x0, ry - 70, lerp(x0, x1, eo(pr(t, t0 + .6 + i * .08, t0 + 1.1 + i * .08))), ry - 70, C.lav, .5, 1));
  gl(1380, y + 260, 1380, y + 710, C.lav, .5 * pr(t, t0 + .9, t0 + 1.2), 1);
  const s = fit('ROMANCING THE ATOM', 1360, 120, { fam: FT.d, weight: 900, stretch: 'expanded' });
  kin('ROMANCING THE ATOM', x0 + 34, y + 190, t, t0 + .5, { size: s, weight: 900, stretch: 'expanded', stag: .03 });
  caption('A GRAPHICS TEST FOR MARK ACHBAR’S DOCUMENTARY', x0 + 34, y + 305, t, t0 + .8, { cps: 70, size: 28, color: C.white });
  caption('DRAWN IN CODE BY NOVADIEM · NOVADIEM.COM', x0 + 34, y + 385, t, t0 + 1.2, { cps: 70, size: 27, color: C.cyan, weight: 700 });
  caption('ARCHIVAL: U.S. DOE, U.S. ARMY, U.S. POST OFFICE, LIBRARY OF CONGRESS, LOS ALAMOS (LA-602) · PUBLIC DOMAIN', x0 + 34, y + 465, t, t0 + 1.5, { size: 18, color: C.lav, cps: 110 });
  caption('DATA: FAS VIA OUR WORLD IN DATA · BULLETIN OF THE ATOMIC SCIENTISTS · APS NEWS · EVERY QUOTE DATED AND SOURCED', x0 + 34, y + 545, t, t0 + 1.8, { size: 18, color: C.lav, cps: 110 });
  caption('MUSIC: ATOM DRIVE, TAKE 3 (ELEVENLABS MUSIC), CUT AT THE BARS · SOUND SYNTHESISED IN CODE', x0 + 34, y + 625, t, t0 + 2.1, { size: 18, color: C.lav, cps: 110 });
  if (t > t0 + 1.3) { atom(1540, y + 470, 110, 36, pr(t, t0 + 1.3, t0 + 2.6), t, { nr: 4 }); lab(1540, y + 640, 'TEST 01 · DRAFT 7 · 2026-10-19', C.lav, .8 * pr(t, t0 + 2.4, t0 + 2.8), 16, 'center'); }
}

function buildShots() {
  return [
    { t0: 0, t1: PLATE.T, draw: plateA },
    { t0: PLATE.T, t1: PLATE.B, draw: plateT },
    { t0: PLATE.B, t1: PLATE.M, draw: plateB },
    { t0: PLATE.M, t1: PLATE.X, draw: plateM },
    { t0: PLATE.X, t1: PLATE.C, draw: plateX },
    { t0: PLATE.C, t1: PLATE.N, draw: plateC },
    { t0: PLATE.N, t1: PLATE.D, draw: plateN },
    { t0: PLATE.D, t1: PLATE.Y, draw: plateD, mode: 'scope' },
    { t0: PLATE.Y, t1: PLATE.E, draw: plateY },
    { t0: PLATE.E, t1: PLATE.Z, draw: plateEFG },
    { t0: PLATE.Z, t1: PLATE.P, draw: plateZ },
    { t0: PLATE.P, t1: PLATE.F, draw: plateP },
    { t0: PLATE.F, t1: END, draw: plateEFG },
  ];
}
