// The opening: HAER Trinity Site sheet 3, "The Bomb, conceptual illustration" (drawn 1985 for the Historic American
// Engineering Record, after Lansing Lamont's Day of Trinity, 1965; public domain, Library of Congress), drafted
// in animation: construction, the two halves' outlines, the lens faces inked in from the centre, the core, the
// initiator, the casing's detonators, the wires, the labels and the title. It draws only what that public sheet
// shows. Geometry is read off the scan in its cropped frame (CROP below), so the original matches when it sweeps in.
'use strict';
CROP['trinity-haer-bomb'] = [.62, .075, .935, .475];
const BB = { key: 'trinity-haer-bomb', PW: 1180, PY: 552 };
const bz_ = (t) => lerp(1, 1.04, pr(t, 0, 16));
// crop-preview pixels (the 1300 px wide study crop of the sheet) -> the print's (u, v)
const CP = (x, y) => [.12698 + x * .0007326, -.0375 + y * .00086633];
const BP_ = (x, y, t) => printPt(BB.key, 960, BB.PY, BB.PW, ...CP(x, y), { z: bz_(t) });
function ellPx(cx, cy, a, b, rot, a0 = 0, a1 = TAU, n = 72) { const o = []; for (let i = 0; i <= n; i++) { const q = lerp(a0, a1, i / n); o.push([cx + Math.cos(q) * a * Math.cos(rot) - Math.sin(q) * b * Math.sin(rot), cy + Math.cos(q) * a * Math.sin(rot) + Math.sin(q) * b * Math.cos(rot)]); } return o; }
function hull(P) {
  const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
// the drawing's parts, in study-crop pixels
const LID = { rim: ellPx(378, 490, 222, 135, -.96), dome: [[500, 305], [420, 280], [300, 285], [215, 340], [180, 420], [185, 520], [205, 600], [245, 670]], c: [380, 482] };
const BOWL = { rim: ellPx(480, 778, 215, 88, 0), body: [[265, 790], [285, 880], [330, 950], [400, 995], [490, 1007], [580, 985], [650, 935], [688, 870], [697, 790]], c: [480, 772] };
const CUP = { rim: ellPx(480, 676, 74, 22, 0), body: [[408, 680], [425, 720], [480, 742], [535, 720], [552, 680]] };
const LID_SIL = hull(LID.rim.concat(LID.dome)), BOWL_SIL = hull(BOWL.rim.concat(BOWL.body)), CUP_SIL = hull(CUP.rim.concat(CUP.body));
const WIRES = [
  [[0, 975], [90, 960], [150, 820], [140, 560], [150, 360], [230, 300]],
  [[0, 978], [100, 955], [175, 760], [175, 520], [200, 420]],
  [[0, 982], [120, 960], [210, 900], [300, 885]],
  [[0, 985], [140, 975], [260, 960], [370, 968]],
  [[0, 988], [160, 990], [330, 1000], [515, 990]],
];
const LABELS = [   // [text lines, text x, y, leader from (x, y) to (x, y)], study-crop pixels; wording from the sheet
  [['SPHERICAL BOMB CASING', '(ABOUT 54" DIAMETER)'], 330, 180, [325, 175, 312, 285]],
  [['DETONATORS'], 585, 248, [578, 242, 372, 300]],
  [['HIGH EXPLOSIVE LENSES', 'IN TWO LAYERS'], 660, 338, [652, 332, 470, 345]],
  [["U-238 'TUBEALLOY' TAMPER", '(SPHERE)'], 755, 428, [748, 437, 405, 468]],
  [['SUBCRITICAL', 'PLUTONIUM', 'HEMISPHERES'], 840, 522, [833, 517, 455, 520]],
  [['INITIATOR'], 560, 572, [553, 566, 480, 602]],
  [["U-238 'TUBEALLOY'", 'TAMPER'], 835, 662, [828, 655, 525, 688]],
  [['HIGH EXPLOSIVE', 'LENSES'], 835, 766, [828, 760, 640, 775]],
];
const toS = (pts, t) => pts.map(([x, y]) => BP_(x, y, t));
function clipPoly(pts) { X.beginPath(); pts.forEach((p, i) => (i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]))); X.closePath(); X.clip(); }
// the sheet's own ink, as blueprint linework, inside a region and a growing circle (an inking pass)
function inkIn(t, silPx, cPx, k, alpha) {
  if (k <= 0) return;
  const c = BP_(...cPx, t), sil = toS(silPx, t), R = Math.max(...sil.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1]))) * 1.05, r = R * eo(k);
  X.save(); clipPoly(sil); X.beginPath(); X.arc(c[0], c[1], Math.max(0, r), 0, TAU); X.clip();
  print(BB.key, 960, BB.PY, BB.PW, { z: bz_(t), mount: 0, lines: true, alpha });
  X.restore();
  if (k < 1) { X.save(); clipPoly(sil); gc(c[0], c[1], r, C.cyan, .7 * alpha, 1.5); X.restore(); for (let i = 0; i < 3; i++) { const a = t * 5 + i * 2.1; star(c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, 3, C.white, .8 * alpha); } }
}
function draftBomb(t, o = {}) {
  const A = o.alpha ?? 1, ink = C.white, fine = C.lav;
  // 1. construction: the axes of both halves, and the sphere they make, dashed
  const ck = pr(t, 1.6, 2.7), ca = .5 * A * (1 - pr(t, 9.4, 10.8));
  if (ck > 0) {
    X.setLineDash([12, 8]);
    const ax = [[[250, 690], [505, 300]], [[230, 778], [730, 778]], [[480, 560], [480, 1040]]];
    ax.forEach(([a, b], i) => { const kk = eo(seg(ck, i * .2, .6 + i * .2)); if (kk <= 0) return; const p = BP_(...a, t), q = BP_(...b, t); path([p, [lerp(p[0], q[0], kk), lerp(p[1], q[1], kk)]], fine, 1, ca); });
    X.setLineDash([4, 6]); strokeTo(toS(ellPx(480, 778, 222, 222, 0, -Math.PI, Math.PI), t), seg(ck, .3, 1), fine, 1, ca * .8, false); X.setLineDash([]);
  }
  // 2. outlines: the bowl's rim and body, the lid's rim and dome, the floating cup
  const ok = pr(t, 2.4, 3.9);
  strokeTo(toS(BOWL.rim, t), seg(ok, 0, .3), ink, 2.4, .95 * A, true);
  strokeTo(toS(BOWL.body, t), seg(ok, .2, .45), ink, 2.4, .95 * A, true);
  strokeTo(toS(LID.rim, t), seg(ok, .4, .75), ink, 2.4, .95 * A, true);
  strokeTo(toS(LID.dome, t), seg(ok, .65, .9), ink, 2.4, .95 * A, true);
  strokeTo(toS(CUP.rim.concat(CUP.body.slice().reverse()), t), seg(ok, .85, 1), ink, 1.8, .9 * A, true);
  // 3. the lens faces and the core, inked in from the centre of each half
  inkIn(t, LID.rim, LID.c, pr(t, 3.8, 5.4), A);
  inkIn(t, BOWL.rim, BOWL.c, pr(t, 4.9, 6.4), A);
  inkIn(t, CUP_SIL, [480, 700], pr(t, 6.2, 6.9), A);
  // 4. the initiator, dropped in on its dashed line
  const ik = pr(t, 6.8, 7.4);
  if (ik > 0) { const p = BP_(478, 605, t), q = BP_(478, 660, t); X.setLineDash([4, 4]); path([p, [p[0], lerp(p[1], q[1], eo(ik))]], ink, 1.4, .9 * A); X.setLineDash([]); gc(p[0], p[1] - 4 * (1 - eo(ik)), 9, ink, .95 * A * eo(ik), 1.6); }
  // 5. the casing outside: detonators and shading, inked from the top down
  const sk = pr(t, 7.2, 8.6);
  if (sk > 0) {
    const sil = toS(LID_SIL.concat(BOWL_SIL), t), ys = sil.map((p) => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys), yy = lerp(y0, y1, eo(sk));
    for (const S of [LID_SIL, BOWL_SIL]) { X.save(); clipPoly(toS(S, t)); X.beginPath(); X.rect(0, 0, W, yy); X.clip(); print(BB.key, 960, BB.PY, BB.PW, { z: bz_(t), mount: 0, lines: true, alpha: A }); X.restore(); }
    if (sk < 1) gl(BP_(150, 0, t)[0], yy, BP_(760, 0, t)[0], yy, C.cyan, .6 * A, 1.2);
  }
  // 6. the detonator wires, gathered into the cable at the left
  const wk = pr(t, 8.4, 9.6);
  WIRES.forEach((w, i) => { const pts = []; for (let k = 0; k < w.length - 1; k++) for (let j = 0; j < 8; j++) { const q = j / 8; pts.push([lerp(w[k][0], w[k + 1][0], q), lerp(w[k][1], w[k + 1][1], q)]); } pts.push(w[w.length - 1]); strokeTo(toS(pts, t), seg(wk, i * .1, .6 + i * .1), fine, 1.4, .85 * A, true); });
  if (wk > .5) { const p = BP_(20, 1000, t); lab(p[0] - 6, p[1] + 28, 'TO CONTROL', fine, .8 * A, 15); }
  // 7. labels, in the sheet's wording, with leaders
  LABELS.forEach(([lines, x, y, ld], i) => {
    const t0 = 9.4 + i * .19; if (t < t0) return;
    const a = BP_(ld[0], ld[1], t), b = BP_(ld[2], ld[3], t), k = eo(pr(t, t0, t0 + .25));
    path([a, [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]], fine, 1, .8 * A); if (k >= 1) gc(b[0], b[1], 3, fine, .9 * A, 1.2);
    lines.forEach((ln, j) => { const p = BP_(x, y + j * 24, t); caption(ln, p[0], p[1] + 4, t, t0 + .1 + j * .08, { size: 16, color: ink, cps: 90, alpha: A }); });
  });
  // 8. heading and title
  const hk = pr(t, 10.4, 11.4);
  if (hk > 0) {
    const h = BP_(285, 100, t); caption('CONCEPTUAL ILLUSTRATION', h[0], h[1], t, 10.4, { size: 22, color: ink, cps: 40, alpha: A });
    if (hk > .7) { const w = meas('CONCEPTUAL ILLUSTRATION', { size: 22 }); gl(h[0], h[1] + 8, h[0] + w * eo(pr(hk, .7, 1)), h[1] + 8, ink, .9 * A, 1.4); }
    const tb = BP_(70, 1170, t); kin('THE BOMB', tb[0], tb[1], t, 10.8, { fam: FT.s, size: 104, weight: 400, stag: .05, style: 'rise', dur: .3, alpha: A, color: ink });
  }
}
// the accent: the core ringed, and where its plutonium came from (B Reactor, Hanford)
function coreNote(t, t0, a = 1) {
  if (t < t0) return;
  const k = eo(pr(t, t0, t0 + .35)), c = BP_(380, 482, t), r = 70 * k;
  gc(c[0], c[1], r, C.mag, a, 3); ticks(c[0], c[1], r + 4, 36, 6, C.mag, .8 * a * k, 1.5, 0, t * .5, t * .5 + TAU);
  if (k >= 1) {
    const l = [c[0] - 330, c[1] - 170]; path([[c[0] - 52, c[1] - 48], [l[0] + 300, l[1]], l], C.mag, 2, a);
    caption('PLUTONIUM FROM THE HANFORD B REACTOR', l[0] - 4, l[1] - 12, t, t0 + .35, { size: 17, weight: 700, color: C.mag, cps: 70, alpha: a, align: 'left' });
  }
}
