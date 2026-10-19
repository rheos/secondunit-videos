// The opening: the 1945 Hanford drawing "External isometric view of graphite assembly" (HTM 1945-405) drafted
// in animation, in the order a draughtsman would work: construction lines, the box, the graphite layers, the
// cutaway, centrelines, the control-rod openings, the water-tube detail, dimensions, lettering, the stamp.
// All geometry is read off the scan (assets/pd/breactor-pile.jpg) in its cropped (u, v) frame, so when the
// original fades in under the drafted lines it matches. Positions are approximate; nothing here is a
// measurement beyond the 36'-0" the drawing itself prints.
'use strict';
const DR = { PW: 1340, PY: 548 };
const dz = (t) => lerp(1, 1.05, pr(t, 0, 16));
const UV = (u, v, t) => printPt('breactor-pile', 960, DR.PY, DR.PW, u, v, { z: dz(t) });
// the box, in the scan's cropped frame
const FL = { u0: .18, u1: .552, v0: .327, v1: .883 };            // front face
const BK = { lt: [.366, .099], rt: [.788, .117], rb: [.788, .671] };
const face = (fu, fv) => [lerp(FL.u0, FL.u1, fu), lerp(FL.v0, FL.v1, fv)];            // front face point
const side = (s, fv) => { const a = face(1, fv), b = [BK.rt[0], lerp(BK.rt[1], BK.rb[1], fv)]; return [lerp(a[0], b[0], s), lerp(a[1], b[1], s)]; };
const topf = (fu, s) => { const a = face(fu, 0), b = [lerp(BK.lt[0], BK.rt[0], fu), lerp(BK.lt[1], BK.rt[1], fu)]; return [lerp(a[0], b[0], s), lerp(a[1], b[1], s)]; };
// the cutaway's two lobes in front-face coordinates (rough broken edge added when drawn)
const LOBE_UP = [[.29, .087], [.40, .08], [.55, .085], [.717, .087], [.75, .15], [.80, .22], [.827, .316], [.82, .40], [.82, .485], [.17, .485], [.165, .42], [.16, .316], [.20, .22], [.25, .15]];
const LOBE_DN = [[.18, .515], [.82, .515], [.83, .62], [.82, .75], [.80, .86], [.70, .905], [.50, .91], [.30, .905], [.20, .86], [.17, .75], [.165, .62]];
function rough(poly, seed) {
  const r = M32(seed), out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    for (let k = 0; k < 6; k++) { const q = k / 6; out.push([lerp(a[0], b[0], q) + (r() - .5) * .012, lerp(a[1], b[1], q) + (r() - .5) * .01]); }
  }
  return out;
}
const CUT = [rough(LOBE_UP, 11), rough(LOBE_DN, 23)];
// a stroke drawn to fraction k with a bright nib at its tip
function strokeTo(pts, k, col, w, a, nib = true) {
  if (k <= 0 || pts.length < 2) return;
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const d = L[L.length - 1] * cl(k), P = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (L[i] <= d) P.push(pts[i]); else { const q = (d - L[i - 1]) / (L[i] - L[i - 1]); P.push([lerp(pts[i - 1][0], pts[i][0], q), lerp(pts[i - 1][1], pts[i][1], q)]); break; } }
  path(P, col, w, a);
  if (nib && k < 1) star(P[P.length - 1][0], P[P.length - 1][1], 3.4, C.white, .95);
}
const S = (uv, t) => UV(uv[0], uv[1], t);
// the whole drawing at time t; o.alpha dims it, o.done draws it finished
function draftPile(t, o = {}) {
  const A = o.alpha ?? 1, T = (a, b) => (o.done ? 1 : pr(t, a, b));
  const ink = C.white, fine = C.lav;
  // 1. construction lines: the isometric axes through the corners, dashed, running past the box
  const ck = T(1.6, 2.7);
  if (ck > 0 && !o.done) {
    const ca = .5 * A * (1 - pr(t, 9.5, 11));
    const ext = (p, q, e) => [[lerp(p[0], q[0], -e), lerp(p[1], q[1], -e)], [lerp(p[0], q[0], 1 + e), lerp(p[1], q[1], 1 + e)]];
    [[face(0, 0), face(1, 0)], [face(0, 1), face(1, 1)], [face(0, 0), face(0, 1)], [face(1, 0), face(1, 1)], [face(0, 0), BK.lt], [face(1, 0), BK.rt], [face(1, 1), BK.rb]].forEach(([p, q], i) => {
      const [a, b] = ext(p, q, .35), kk = eo(seg(ck, i * .08, .45 + i * .08)); if (kk <= 0) return;
      X.setLineDash([10, 8]); path([S(a, t), [lerp(S(a, t)[0], S(b, t)[0], kk), lerp(S(a, t)[1], S(b, t)[1], kk)]], fine, 1, ca); X.setLineDash([]);
    });
  }
  // 2. the box: nine edges in drafting order
  const edges = [[face(0, 0), face(1, 0)], [face(1, 0), face(1, 1)], [face(1, 1), face(0, 1)], [face(0, 1), face(0, 0)], [face(0, 0), BK.lt], [BK.lt, BK.rt], [BK.rt, face(1, 0)], [BK.rt, BK.rb], [BK.rb, face(1, 1)]];
  const ek = T(2.4, 3.9);
  edges.forEach(([a, b], i) => strokeTo([S(a, t), S(b, t)], seg(ek, i / 9 * .8, i / 9 * .8 + .2), ink, 2.6, .95 * A, !o.done));
  // 3. graphite layers: front rows and the matching courses round the right side, top hatched
  const N = 56, lk = T(3.7, 6.1);
  for (let k = 1; k < N; k++) {
    const kk = seg(lk, k / N * .75, k / N * .75 + .25); if (kk <= 0) continue;
    const fv = k / N;
    strokeTo([S(face(0, fv), t), S(face(1, fv), t)], kk, fine, 1, .55 * A, false);
    strokeTo([S(side(0, fv), t), S(side(1, fv), t)], kk, fine, 1, .5 * A, false);
    if (k % 4 === 0 && kk >= 1) { for (let j = 1; j < 12; j++) { const p = S(face(j / 12, fv), t); gl(p[0], p[1] - 3, p[0], p[1] + 3, fine, .35 * A, 1); } }
  }
  const hk = T(4.8, 6.4);
  for (let j = 1; j < 60; j++) {
    const kk = seg(hk, j / 60 * .7, j / 60 * .7 + .3); if (kk <= 0) continue;
    const fu = j / 60, edge = Math.min(fu, 1 - fu) < .14;
    strokeTo([S(topf(fu, 0), t), S(topf(fu, 1), t)], kk, fine, 1, (edge ? .55 : .25) * A, false);
  }
  // 4. the cutaway: a broken edge drawn round each lobe, then the inside cleared
  const ck2 = T(6.0, 7.3);
  CUT.forEach((poly, li) => {
    const kk = seg(ck2, li * .35, .65 + li * .35); if (kk <= 0) return;
    const pts = poly.map((p) => S(face(p[0], p[1]), t)); pts.push(pts[0]);
    if (kk >= 1 || o.done) { X.save(); X.globalAlpha = A; X.fillStyle = C.navy; X.beginPath(); pts.forEach((p, i) => (i ? X.lineTo(p[0], p[1]) : X.moveTo(p[0], p[1]))); X.fill(); X.restore(); }
    strokeTo(pts, kk, ink, 1.8, .9 * A, !o.done);
  });
  // 5. centrelines and the central course of blocks
  const cl2 = T(7.0, 8.0);
  if (cl2 > 0) {
    X.setLineDash([26, 6, 4, 6]);
    strokeTo([S(face(.5, .07), t), S(face(.5, .93), t)], cl2, fine, 1.2, .8 * A, false);
    X.setLineDash([]);
    strokeTo([S(face(0, .487), t), S(face(1, .487), t)], cl2, ink, 1.4, .85 * A, false);
    strokeTo([S(face(0, .512), t), S(face(1, .512), t)], cl2, ink, 1.4, .85 * A, false);
    if (cl2 >= 1) { for (let j = 1; j < 40; j++) { const p = S(face(j / 40, .5), t); gl(p[0], p[1] - 6, p[0], p[1] + 6, fine, .55 * A, 1); } const c = S(face(.53, .2), t); lab(c[0], c[1], '℄ OF GRAPHITE', fine, .85 * A * (o.done ? 1 : pr(t, 7.8, 8.2)), 13); }
  }
  // 6. control-rod openings on the top: a grid of short double marks
  const rk = T(7.8, 9.0);
  let n = 0;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    const kk = seg(rk, n / 24 * .8, n / 24 * .8 + .2); n++; if (kk <= 0) continue;
    const fu = .27 + c * .1 + r * .01, s = .32 + r * .12, p = S(topf(fu, s), t), q = S(topf(fu + .045, s), t);
    path([p, [lerp(p[0], q[0], eo(kk)), lerp(p[1], q[1], eo(kk))]], ink, 2.2, .9 * A); path([[p[0], p[1] + 5], [lerp(p[0], q[0], eo(kk)), lerp(p[1], q[1], eo(kk)) + 5]], fine, 1, .7 * A);
  }
  // 7. the water-tube detail inset in the lower cutaway
  const ik = T(8.6, 9.6);
  if (ik > 0) {
    const a = S([.382, .658], t), b = S([.44, .768], t), w = b[0] - a[0], h = b[1] - a[1];
    X.save(); X.globalAlpha = A * eo(ik); X.strokeStyle = ink; X.lineWidth = 1.4;
    for (const [cx, cy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const x = a[0] + cx * w / 2, y = a[1] + cy * h * .58, bw = w / 2, bh = h * .42;
      X.strokeRect(x, y, bw, bh); X.beginPath(); X.moveTo(x, y); X.lineTo(x + bw, y + bh); X.moveTo(x + bw, y); X.lineTo(x, y + bh); X.stroke();
      X.beginPath(); X.arc(x + bw / 2, y + bh / 2, Math.min(bw, bh) * .18, 0, TAU); X.stroke();
    }
    X.restore();
    if (ik >= 1) lab(b[0] + 20, b[1] - 6, 'WATER TUBE HOLES', fine, .85 * A, 12);
  }
  // 8. dimensions: the 36'-0" the drawing prints along the top and down the right side
  const mk = T(9.2, 10.4);
  if (mk > 0) {
    const off = .035, p0 = S([BK.lt[0], BK.lt[1] - off], t), p1 = S([BK.rt[0], BK.rt[1] - off], t);
    const q0 = S([BK.rt[0] + .04, BK.rt[1]], t), q1 = S([BK.rb[0] + .04, BK.rb[1]], t);
    strokeTo([p0, p1], eo(seg(mk, 0, .6)), ink, 1.2, .9 * A, false); strokeTo([q0, q1], eo(seg(mk, .3, .9)), ink, 1.2, .9 * A, false);
    for (const [a, b] of [[S(BK.lt, t), p0], [S(BK.rt, t), p1]]) gl(a[0], a[1], b[0], b[1] - 8, fine, .6 * A * mk, 1);
    if (mk > .6) { const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]; lab(m[0], m[1] - 10, '36\'-0"', ink, A * pr(mk, .6, .8), 18, 'center'); }
    if (mk > .9) { const m = [(q0[0] + q1[0]) / 2 + 16, (q0[1] + q1[1]) / 2]; X.save(); X.translate(m[0], m[1]); X.rotate(-Math.PI / 2); lab(0, 0, '36\'-0"', ink, A * pr(mk, .9, 1), 18, 'center'); X.restore(); }
  }
  // 9. lettering: the title, side names, the discharge end, the sheet number
  const tk = T(10.0, 11.3);
  if (tk > 0) {
    const tp = S([.42, -.004], t);
    caption('EXTERNAL ISOMETRIC VIEW OF GRAPHITE ASSEMBLY', tp[0], tp[1], o.done ? 99 : t, 10.0, { size: 22, color: ink, cps: 44, alpha: A });
    if (tk > .7) { const w = meas('EXTERNAL ISOMETRIC VIEW OF GRAPHITE ASSEMBLY', { size: 22 }); gl(tp[0], tp[1] + 8, tp[0] + w * eo(pr(tk, .7, 1)), tp[1] + 8, ink, .9 * A, 1.4); }
    const ls = S(topf(.06, .5), t), rs = S(side(.55, .02), t), de = S(face(.48, .97), t), sn = S([.6, .985], t);
    if (tk > .3) { lab(ls[0] - 70, ls[1] + 10, 'LEFT SIDE', fine, .85 * A, 13); lab(rs[0], rs[1] - 14, 'RIGHT SIDE', fine, .85 * A, 13); }
    if (tk > .5) lab(de[0], de[1] + 22, 'DISCHARGE END', fine, .85 * A, 13, 'center');
    if (tk > .8) lab(sn[0], sn[1], '— 405 —', ink, .8 * A, 15, 'center');
  }
}
// the DECLASSIFIED stamp, where the original has it
function stampDeclassified(t, t0, a = 1) {
  if (t < t0) return;
  const k = eo(pr(t, t0, t0 + .16)), p = S([.13, .03], t);
  X.save(); X.translate(p[0] + 40, p[1] + 6); X.rotate(-.03); X.scale(lerp(1.7, 1, k), lerp(1.7, 1, k));
  txt('DECLASSIFIED', 0, 0, { fam: FT.d, size: 44, weight: 900, stretch: 'condensed', color: C.mag, align: 'center', alpha: k * a });
  X.globalAlpha = k * a; X.strokeStyle = C.mag; X.lineWidth = 3; const w = meas('DECLASSIFIED', { fam: FT.d, size: 44, weight: 900, stretch: 'condensed' }); X.strokeRect(-w / 2 - 12, -44, w + 24, 56);
  X.restore();
}
