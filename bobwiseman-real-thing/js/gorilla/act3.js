// Act 3, verse 2 (81.5-105.8): everyone has advice. An owl professor, a crocodile, an elephant, a parrot.
// The four helpers live here (a3_ prefix: every file shares one global scope), drawn like cast.js: ol() outlines,
// round chibi heads, tube limbs bent in one curve, faces doing the acting. See STORYBOARD-gorilla.md.
'use strict';
// ---------------------------------------------------------------- shared helpers
// a tube in local units: ink stroke under a colour stroke; bend is sideways, in local units
function a3_tube(g, p0, p1, bend, w, col) {
  const LWs = LW / sc(g), mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend;
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = INK; g.lineWidth = w + LWs * 2; g.stroke();
  g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = col; g.lineWidth = w; g.stroke();
}
// a tapering tube along a quadratic curve p0 -> c -> p1 (the elephant's trunk), outlined, round tip
function a3_taper(g, p0, c, p1, w0, w1, col) {
  const N = 18, L = [], R = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, x = (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], y = (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1];
    const tx = 2 * (1 - u) * (c[0] - p0[0]) + 2 * u * (p1[0] - c[0]), ty = 2 * (1 - u) * (c[1] - p0[1]) + 2 * u * (p1[1] - c[1]), tl = Math.hypot(tx, ty) || 1;
    const w = lerp(w0, w1, u) / 2; L.push([x - ty / tl * w, y + tx / tl * w]); R.push([x + ty / tl * w, y - tx / tl * w]);
  }
  ol(g, () => { g.moveTo(...L[0]); for (const p of L) g.lineTo(...p); const f = R[N], dx = p1[0] - c[0], dy = p1[1] - c[1], dl = Math.hypot(dx, dy) || 1; g.quadraticCurveTo(p1[0] + dx / dl * w1 * 1.1, p1[1] + dy / dl * w1 * 1.1, ...f); for (let i = N; i >= 0; i--) g.lineTo(...R[i]); g.closePath(); }, col);
}
const a3_rot = (p, h, a) => { const c = Math.cos(a), s = Math.sin(a), dx = p[0] - h[0], dy = p[1] - h[1]; return [h[0] + dx * c - dy * s, h[1] + dx * s + dy * c]; };
// cartoon eyes shared by the helpers: open (white + pupil), happy (arc up), half (lidded), shut (arc down), wide (big, tiny pupil)
function a3_eye(g, x, y, rx, ry, kind, look, LWs) {
  if (kind === 'open' || kind === 'wide' || kind === 'half') {
    const k = kind === 'wide' ? 1.18 : 1;
    ol(g, ell(g, x, y, rx * k, ry * k), '#fbf6ea');
    const pr = kind === 'wide' ? .32 : .5;
    g.beginPath(); g.ellipse(x + look[0] * rx * .4, y + look[1] * ry * .35, rx * pr, ry * pr, 0, 0, TAU); g.fillStyle = INK; g.fill();
    g.beginPath(); g.arc(x + look[0] * rx * .4 + rx * .18, y + look[1] * ry * .35 - ry * .2, rx * .16, 0, TAU); g.fillStyle = '#fff'; g.fill();
    if (kind === 'half') { // a heavy lid over the top half
      ol(g, () => { g.moveTo(x - rx * 1.06, y + ry * .05); g.ellipse(x, y, rx * 1.06, ry * 1.06, 0, Math.PI, TAU); g.closePath(); }, g.__lid || '#888');
    }
  } else {
    g.beginPath();
    if (kind === 'happy') { g.moveTo(x - rx, y + ry * .3); g.quadraticCurveTo(x, y - ry * 1.1, x + rx, y + ry * .3); }
    else { g.moveTo(x - rx, y - ry * .1); g.quadraticCurveTo(x, y + ry * .7, x + rx, y - ry * .1); }
    g.strokeStyle = INK; g.lineWidth = LWs * 1.1; g.lineCap = 'round'; g.stroke();
  }
}

// ---------------------------------------------------------------- the owl professor (feet at 0, ~1.1 tall with the cap)
const A3_OWL = '#a27b52', A3_OWL2 = '#7a5838', A3_OWLF = '#efe0c2', A3_OWLB = '#dcc49a', A3_BEAK = '#e9a03e', A3_CAP = '#34303b';
function a3_owl(g, x, y, s, P) {
  P = Object.assign({ eyes: 'open', brow: 0, beak: 'shut', look: [0, 0], tilt: 0, handL: [-.36, -.3], handR: [.36, -.3], bendL: .05, bendR: -.05,
    squash: 0, hold: null, tassel: 0, glint: 0 }, P);
  g.save(); g.translate(x, y); g.scale(s, s * (1 - P.squash)); const LWs = LW / sc(g);
  const wing = (sh, h, bend) => {
    a3_tube(g, sh, h, bend, .11, A3_OWL2);
    const a = Math.atan2(h[1] - sh[1], h[0] - sh[0]);
    for (const da of [-.45, 0, .45]) ol(g, ell(g, h[0] + Math.cos(a + da) * .04, h[1] + Math.sin(a + da) * .04, .07, .035, a + da), A3_OWL2);
  };
  for (const fx of [-.09, .09]) { ol(g, ell(g, fx - .03, -.02, .04, .03), A3_BEAK); ol(g, ell(g, fx + .03, -.02, .04, .03), A3_BEAK); }
  wing([-.24, -.45], P.handL, P.bendL);
  ol(g, () => { g.moveTo(0, -.64); g.bezierCurveTo(.36, -.64, .38, -.03, 0, -.03); g.bezierCurveTo(-.38, -.03, -.36, -.64, 0, -.64); }, A3_OWL);
  g.beginPath(); g.ellipse(0, -.27, .2, .21, 0, 0, TAU); g.fillStyle = A3_OWLB; g.fill();
  g.strokeStyle = A3_OWL2; g.lineWidth = LWs * .7; g.lineCap = 'round';
  for (const [rx, ry] of [[-.09, -.36], [.03, -.36], [-.03, -.27], [.09, -.27], [-.09, -.18], [.03, -.18]]) { g.beginPath(); g.moveTo(rx - .03, ry); g.quadraticCurveTo(rx, ry + .035, rx + .03, ry); g.stroke(); }
  // head
  g.save(); g.translate(0, -.76); g.rotate(P.tilt);
  for (const sx of [-1, 1]) ol(g, () => { g.moveTo(sx * .3, -.06); g.quadraticCurveTo(sx * .34, -.24, sx * .3, -.33); g.quadraticCurveTo(sx * .2, -.22, sx * .12, -.2); g.closePath(); }, A3_OWL2);
  ol(g, ell(g, 0, 0, .32, .27), A3_OWL);
  ol(g, () => { g.moveTo(0, -.09); g.bezierCurveTo(-.08, -.2, -.28, -.17, -.27, .02); g.bezierCurveTo(-.26, .17, -.07, .21, 0, .15); g.bezierCurveTo(.07, .21, .26, .17, .27, .02); g.bezierCurveTo(.28, -.17, .08, -.2, 0, -.09); }, A3_OWLF);
  g.__lid = A3_OWL;
  for (const ex of [-.115, .115]) a3_eye(g, ex, .0, .07, .075, P.eyes, P.look, LWs);
  // round spectacles
  g.strokeStyle = INK; g.lineWidth = LWs * .9;
  for (const ex of [-.115, .115]) { g.beginPath(); g.arc(ex, 0, .1, 0, TAU); g.stroke(); }
  g.beginPath(); g.moveTo(-.02, -.01); g.quadraticCurveTo(0, -.035, .02, -.01); g.moveTo(-.215, -.01); g.lineTo(-.29, -.04); g.moveTo(.215, -.01); g.lineTo(.29, -.04); g.stroke();
  if (P.glint > 0) for (const ex of [-.115, .115]) sparkle(g, ex + .045, -.045, .045, P.glint);
  // feather brows: up = surprised, down toward the middle = cross, sad = tilted out
  g.strokeStyle = A3_OWL2; g.lineWidth = .03;
  for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * .2, -.13 + Math.min(0, P.brow) * -.03); g.quadraticCurveTo(sx * .12, -.17 - P.brow * -.02, sx * .03, -.11 + P.brow * .035); g.stroke(); }
  // beak
  if (P.beak === 'open') { ol(g, () => { g.moveTo(-.045, .06); g.lineTo(.045, .06); g.lineTo(0, .12); g.closePath(); }, A3_BEAK); ol(g, () => { g.moveTo(-.03, .135); g.lineTo(.03, .135); g.lineTo(0, .17); g.closePath(); }, '#c97f2c'); }
  else ol(g, () => { g.moveTo(-.045, .06); g.lineTo(.045, .06); g.lineTo(0, .15); g.closePath(); }, A3_BEAK);
  // mortarboard
  ol(g, () => { g.moveTo(-.16, -.23); g.lineTo(-.15, -.33); g.lineTo(.15, -.33); g.lineTo(.16, -.23); g.quadraticCurveTo(0, -.19, -.16, -.23); }, A3_CAP);
  ol(g, () => { g.moveTo(-.36, -.34); g.lineTo(.0, -.43); g.lineTo(.36, -.34); g.lineTo(0, -.27); g.closePath(); }, A3_CAP);
  const tx = .28, ty = -.21, sw = Math.sin(P.tassel) * .03;
  g.strokeStyle = '#e8b93a'; g.lineWidth = LWs * .9; g.beginPath(); g.moveTo(0, -.35); g.lineTo(tx, -.33); g.quadraticCurveTo(tx + sw * .5, -.27, tx + sw, ty); g.stroke();
  ol(g, ell(g, tx + sw, ty + .03, .022, .04), '#e8b93a', 3); ol(g, ell(g, 0, -.35, .022, .014), '#e8b93a', 3);
  g.restore();
  if (P.hold) P.hold(g);
  wing([.24, -.45], P.handR, P.bendR);
  g.restore();
}
// the stump he stands on and the slate on its easel (props: outlined)
function a3_stump(g, x, y, w, h) {
  ol(g, () => { g.moveTo(x - w / 2, y - h); g.lineTo(x - w / 2 - 6, y - 6); g.quadraticCurveTo(x - w / 2 - 30, y + 4, x - w / 2 - 34, y + 6); g.lineTo(x + w / 2 + 34, y + 6); g.quadraticCurveTo(x + w / 2 + 30, y + 4, x + w / 2 + 6, y - 6); g.lineTo(x + w / 2, y - h); g.closePath(); }, '#7a563a');
  g.strokeStyle = 'rgba(43,33,28,.35)'; g.lineWidth = 3; for (const k of [-.25, .1, .3]) { g.beginPath(); g.moveTo(x + k * w, y - h + 14); g.lineTo(x + k * w * 1.05, y - 12); g.stroke(); }
  ol(g, ell(g, x, y - h, w / 2, w * .13), '#c9a172');
  g.strokeStyle = '#a27c52'; g.lineWidth = 3; for (const r0 of [.32, .2, .08]) { g.beginPath(); g.ellipse(x, y - h, w * r0, w * r0 * .26, 0, 0, TAU); g.stroke(); }
}
// the chalk diagram: a list of strokes in slate units (0..1 across, 0..1 down), each with a start time; drawn up to t
const A3_DIAG = (() => {
  const S = [];
  const pts = (f, n = 24) => [...Array(n + 1)].map((_, i) => f(i / n));
  // a banana, its stem at the left
  S.push({ t0: 82.02, d: .4, p: pts((u) => [.07 + u * .2, .27 - Math.sin(u * Math.PI) * .1 + u * .02]) });
  S.push({ t0: 82.16, d: .3, p: pts((u) => [.27 - u * .2, .29 - Math.sin(u * Math.PI) * .03 + u * .0]) });
  // a curling arrow over it: turn it upside down
  S.push({ t0: 82.58, d: .35, p: pts((u) => [.12 + u * .3, .2 - Math.sin(u * Math.PI) * .14]) });
  S.push({ t0: 82.9, d: .1, p: [[.36, .1], [.42, .2], [.33, .19]] });
  // the upside-down banana
  S.push({ t0: 82.96, d: .35, p: pts((u) => [.46 + u * .2, .14 + Math.sin(u * Math.PI) * .1]) });
  S.push({ t0: 83.2, d: .25, p: pts((u) => [.66 - u * .2, .14 + Math.sin(u * Math.PI) * .03]) });
  // a spiral: twirl it
  S.push({ t0: 83.74, d: .7, p: pts((u) => { const a = u * TAU * 2.3, r = .02 + u * .1; return [.82 + Math.cos(a) * r, .25 + Math.sin(a) * r * 1.3]; }, 50) });
  // a long looping arrow along the bottom, to three tap marks
  S.push({ t0: 84.53, d: .55, p: pts((u) => [.08 + u * .62, .66 + Math.sin(u * TAU * 2) * .06 - (u > .5 ? Math.sin((u - .5) * TAU * 2) * .08 : 0)], 40) });
  S.push({ t0: 85.05, d: .1, p: [[.64, .58], [.71, .66], [.63, .72]] });
  for (let i = 0; i < 3; i++) S.push({ t0: 84.9 + i * .14, d: .08, p: [[.78 + i * .06, .6], [.8 + i * .06, .72]] });
  // a big circle round the lot, underlined twice
  S.push({ t0: 85.31, d: .6, p: pts((u) => { const a = -1.2 + u * TAU * 1.03; return [.5 + Math.cos(a) * .46, .44 + Math.sin(a) * .4]; }, 50) });
  S.push({ t0: 85.95, d: .2, p: [[.2, .92], [.8, .92]] }); S.push({ t0: 86.2, d: .2, p: [[.25, .96], [.75, .96]] });
  return S;
})();
// returns where the chalk is right now (slate units) or null
function a3_chalkAt(t) { let at = null; for (const s of A3_DIAG) { const u = (t - s.t0) / s.d; if (u >= 0 && u <= 1) { const i = Math.min(s.p.length - 1, Math.floor(u * (s.p.length - 1))); at = s.p[i]; } } return at; }
function a3_slate(g, x, y, w, h, t, tip = 0) {
  // easel legs behind, then the board; tip lays it down flat on its back (0 upright .. 1 flat)
  g.save(); g.translate(x, y); g.scale(1, Math.max(.06, Math.cos(tip * Math.PI * .5))); g.translate(-x, -y);
  const top = y - h - 210;
  ol(g, () => { g.moveTo(x - w * .32, y); g.lineTo(x - w * .22, top); g.lineTo(x - w * .19, top); g.lineTo(x - w * .27, y); g.closePath(); }, '#8a6440', 4);
  ol(g, () => { g.moveTo(x + w * .32, y); g.lineTo(x + w * .22, top); g.lineTo(x + w * .19, top); g.lineTo(x + w * .27, y); g.closePath(); }, '#8a6440', 4);
  const bx = x - w / 2, by = top + 20;
  ol(g, () => g.roundRect(bx - 16, by - 16, w + 32, h + 32, 12), '#a8794c');
  ol(g, () => g.rect(bx, by, w, h), '#38464a', 4);
  ol(g, () => g.rect(bx - 24, by + h + 10, w + 48, 16), '#8a6440', 4); // chalk ledge
  // the diagram
  g.save(); g.beginPath(); g.rect(bx, by, w, h); g.clip();
  g.strokeStyle = 'rgba(240,238,226,.92)'; g.lineWidth = 6; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const s of A3_DIAG) {
    const u = cl((t - s.t0) / s.d); if (u <= 0) continue;
    const n = (s.p.length - 1) * u, k = Math.floor(n);
    g.beginPath(); g.moveTo(bx + s.p[0][0] * w, by + s.p[0][1] * h);
    for (let i = 1; i <= k; i++) g.lineTo(bx + s.p[i][0] * w, by + s.p[i][1] * h);
    if (k < s.p.length - 1) { const a = s.p[k], b = s.p[k + 1], f = n - k; g.lineTo(bx + lerp(a[0], b[0], f) * w, by + lerp(a[1], b[1], f) * h); }
    g.stroke();
  }
  g.restore();
  g.restore();
  return { bx, by, w, h };
}

// ---------------------------------------------------------------- the crocodile (waterline at 0, facing left)
const A3_CROC = '#6f9e4b', A3_CROC2 = '#557e37', A3_CROCB = '#d9d59b', A3_MOUTH = '#c95f6a';
function a3_croc(g, x, y, s, P) {
  P = Object.assign({ open: 0, eyes: 'open', brow: 0, look: [-1, 0], rise: 1, tail: 0, lean: 0, blush: 0 }, P);
  g.save(); g.translate(x, y + (1 - P.rise) * .55 * s); g.scale(s, s); g.rotate(P.lean); const LWs = LW / sc(g);
  // back and tail, low in the water, with scutes
  ol(g, () => { g.moveTo(.2, .08); g.bezierCurveTo(.4, -.2, 1.0, -.17, 1.35, -.04); g.quadraticCurveTo(1.62, -.02 + P.tail, 1.86, -.09 + P.tail * 1.6); g.quadraticCurveTo(1.66, .06, 1.3, .08); g.closePath(); }, A3_CROC);
  for (let i = 0; i < 7; i++) { const u = i / 6, bx = .45 + u * 1.15, by = -.15 + u * u * .1 + (u > .8 ? P.tail * (u - .8) * 4 : 0); ol(g, ell(g, bx, by, .045, .035), A3_CROC2, 3.5); }
  const H0 = [.28, -.06], aU = P.open * .46, aL = -P.open * .14;
  // upper jaw's lower edge and lower jaw's upper edge (closed), from snout tip to hinge
  const upE = [[-.78, -.06], [-.6, -.055], [-.4, -.05], [-.2, -.05], [0, -.055], [.2, -.06], [.28, -.06]];
  const loE = [[-.76, -.04], [-.6, -.045], [-.4, -.045], [-.2, -.045], [0, -.05], [.2, -.055], [.28, -.06]];
  const U = upE.map((p) => a3_rot(p, H0, aU)), Lo = loE.map((p) => a3_rot(p, H0, aL));
  if (P.open > .02) { // the mouth: pink, a tongue
    ol(g, () => { g.moveTo(...U[0]); for (const p of U) g.lineTo(...p); for (let i = Lo.length - 1; i >= 0; i--) g.lineTo(...Lo[i]); g.closePath(); }, A3_MOUTH, 4);
    const tg = a3_rot([-.25, -.06], H0, aL);
    g.beginPath(); g.ellipse(tg[0], tg[1] - .01, .26, .045 + P.open * .03, aL, Math.PI, TAU); g.fillStyle = '#e88f98'; g.fill();
  }
  // teeth: big, friendly, white; the lower row first
  const tooth = (p, a, dir, sz) => ol(g, () => { const q = a3_rot([p[0] - sz * .5, p[1]], p, 0), r = [p[0] + sz * .5, p[1]], tp = [p[0], p[1] + dir * sz * 1.2];
    const A = a3_rot(q, p, a), B = a3_rot(r, p, a), C = a3_rot(tp, p, a); g.moveTo(...A); g.lineTo(...C); g.lineTo(...B); g.closePath(); }, '#fbf8ee', 3);
  for (let i = 0; i < 6; i++) { const p = a3_rot([-.66 + i * .15, -.045], H0, aL); tooth(p, aL, -1, .05 + P.open * .02); }
  // lower jaw
  const lj = () => { const a = a3_rot([-.78, -.04], H0, aL), b = a3_rot([-.84, .02], H0, aL), c = a3_rot([-.6, .1], H0, aL), d = a3_rot([.2, .12], H0, aL), e = a3_rot([.34, 0], H0, aL);
    g.moveTo(...Lo[0]); for (const p of Lo) g.lineTo(...p); g.lineTo(...e); g.quadraticCurveTo(...d, ...c); g.quadraticCurveTo(...b, ...a); g.closePath(); };
  ol(g, lj, A3_CROC);
  for (let i = 0; i < 7; i++) { const p = a3_rot([-.72 + i * .15 + (i % 2) * .02, -.065], H0, aU); tooth(p, aU, 1, .055 + P.open * .025); }
  // upper head: snout, skull, the eye domes ride on it
  g.save(); g.translate(H0[0], H0[1]); g.rotate(aU); g.translate(-H0[0], -H0[1]);
  ol(g, () => { g.moveTo(-.78, -.06); g.quadraticCurveTo(-.86, -.1, -.8, -.16); g.quadraticCurveTo(-.72, -.21, -.6, -.18); g.bezierCurveTo(-.3, -.15, -.1, -.24, .08, -.3); g.bezierCurveTo(.24, -.34, .42, -.24, .4, -.08); g.quadraticCurveTo(.36, -.04, .28, -.06); g.lineTo(-.78, -.06); g.closePath(); }, A3_CROC);
  ol(g, ell(g, -.7, -.19, .055, .035), A3_CROC, 3.5); // nostril bump
  g.fillStyle = INK; g.beginPath(); g.ellipse(-.71, -.2, .014, .01, 0, 0, TAU); g.fill();
  // the long sweet grin along the jaw, curling up at the cheek
  g.strokeStyle = INK; g.lineWidth = LWs * 1.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(-.74, -.07); g.quadraticCurveTo(-.2, -.06, .22, -.09); g.quadraticCurveTo(.3, -.11, .3, -.17); g.stroke();
  if (P.blush > 0) { g.save(); g.globalAlpha = P.blush * .5; g.fillStyle = '#e88f98'; g.beginPath(); g.ellipse(.18, -.16, .06, .03, 0, 0, TAU); g.fill(); g.restore(); }
  // eye domes with sweet eyes and lashes
  g.__lid = A3_CROC;
  for (const [ex, ey, r] of [[.03, -.33, .085], [.22, -.36, .095]]) {
    ol(g, ell(g, ex, ey + .02, r * 1.12, r * 1.05), A3_CROC);
    a3_eye(g, ex, ey, r * .78, r * .8, P.eyes, P.look, LWs);
    if (P.eyes !== 'shut') { g.strokeStyle = INK; g.lineWidth = LWs * .8; g.beginPath(); for (const la of [-2.2, -1.75, -1.3]) { const lx = ex + Math.cos(la) * r * .85, ly = ey + Math.sin(la) * r * .85 + (P.eyes === 'happy' ? r * .2 : 0); g.moveTo(lx, ly); g.lineTo(lx + Math.cos(la) * r * .35, ly + Math.sin(la) * r * .35); } g.stroke(); }
    g.strokeStyle = A3_CROC2; g.lineWidth = .025; g.beginPath(); g.moveTo(ex - r * .9, ey - r * 1.15 - P.brow * .02); g.quadraticCurveTo(ex, ey - r * 1.45 + P.brow * .03, ex + r * .9, ey - r * 1.15 + P.brow * .02); g.stroke();
  }
  g.restore();
  g.restore();
}
// the river (land layer, no outlines): a band across the clearing between y0 and y1
function a3_river(g, t, y0, y1) {
  g.fillStyle = vgrad(g, y0, y1, [[0, '#9fd0c6'], [.4, '#6fb2b4'], [1, '#4f97a6']]);
  g.beginPath(); g.moveTo(0, y0 + 10); for (let x = 0; x <= W; x += 60) g.lineTo(x, y0 + Math.sin(x * .004) * 12);
  g.lineTo(W, y1); for (let x = W; x >= 0; x -= 60) g.lineTo(x, y1 + Math.sin(x * .003 + 1) * 14); g.closePath(); g.fill();
  g.fillStyle = 'rgba(70,110,50,.35)'; g.beginPath(); for (let x = W; x >= 0; x -= 60) g.lineTo(x, y1 + Math.sin(x * .003 + 1) * 14); g.lineTo(0, y1 + 34); g.lineTo(W, y1 + 34); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; g.lineCap = 'round';
  const r = M32(41); for (let i = 0; i < 22; i++) { const x = r() * W, y = y0 + 20 + r() * (y1 - y0 - 30), l = 30 + r() * 60, dx = Math.sin(t * .8 + i) * 14; g.beginPath(); g.moveTo(x + dx, y); g.lineTo(x + dx + l, y); g.stroke(); }
}
// water over the submerged part of the croc (no outlines), plus rings round him
function a3_waterFront(g, t, x, wl, y1, ripple) {
  g.save(); g.fillStyle = 'rgba(86,160,170,.86)';
  g.beginPath(); g.moveTo(x - 420, wl); for (let i = 0; i <= 24; i++) { const xx = x - 420 + i * 55; g.lineTo(xx, wl + Math.sin(xx * .03 + t * 3) * 4); } g.lineTo(x + 900, y1 + 40); g.lineTo(x - 420, y1 + 40); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 4;
  for (let i = 0; i < 3; i++) { const ph = (t * .6 + i / 3) % 1, rr = 120 + ph * 260 + ripple * 120; g.globalAlpha = (1 - ph) * .8; g.beginPath(); g.ellipse(x - 60, wl + 6, rr, rr * .09, 0, 0, TAU); g.stroke(); }
  g.restore();
}

// ---------------------------------------------------------------- the elephant (ground at 0, facing left, ~1.4 tall)
const A3_ELE = '#a7aec0', A3_ELE2 = '#8a91a4', A3_EAR = '#e3aab2', A3_NAIL = '#f2e9d6';
// The elephant, redrawn after Kevin Ngo's characters (Robin, 2026-10-19: "make the elephant better"): ONE outer outline
// round the whole silhouette (every part is stroked thick first, then every part filled over it, so no seams where
// head, body, legs and trunk meet), thin lines inside, one soft shadow tone and a highlight, a big chibi head with big
// ears. Feet at y 0, facing left, about 1.45 tall. P is unchanged: eyes, brow, mouth, look, ear (flap), trunk/trunkC
// (tip and curve point, body units), foot/footBend (the near front foot: the stepper), tilt, squash, lean.
const A3_ELE_SH = '#8b93a8', A3_ELE_HI = 'rgba(255,255,255,.22)', A3_ELE_IN = 'rgba(43,33,28,.55)';
// path builders (no fill, no stroke) so a silhouette can be outlined as one
const a3e_circle = (g, x, y, rx, ry) => () => g.ellipse(x, y, rx, ry, 0, 0, TAU);
function a3e_capsule(g, p0, p1, r0, r1) { // a leg: round top, flat-bottomed foot pad
  return () => {
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    g.moveTo(p0[0] + nx * r0, p0[1] + ny * r0);
    g.lineTo(p1[0] + nx * r1, p1[1] + ny * r1 - r1 * .25);
    g.quadraticCurveTo(p1[0] + nx * r1, p1[1] + ny * r1 + r1 * .1, p1[0], p1[1] + r1 * .1);
    g.quadraticCurveTo(p1[0] - nx * r1, p1[1] - ny * r1 + r1 * .1, p1[0] - nx * r1, p1[1] - ny * r1 - r1 * .25);
    g.lineTo(p0[0] - nx * r0, p0[1] - ny * r0);
    g.arc(p0[0], p0[1], r0, Math.atan2(-ny, -nx), Math.atan2(ny, nx), true);
    g.closePath();
  };
}
function a3e_trunk(g, p0, c, p1, w0, w1) { // tapering along a quadratic curve, round tip
  const N = 20, Lf = [], Rt = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, x = (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], y = (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1];
    const tx = 2 * (1 - u) * (c[0] - p0[0]) + 2 * u * (p1[0] - c[0]), ty = 2 * (1 - u) * (c[1] - p0[1]) + 2 * u * (p1[1] - c[1]), tl = Math.hypot(tx, ty) || 1;
    const w = lerp(w0, w1, Math.pow(u, .8)) / 2; Lf.push([x - ty / tl * w, y + tx / tl * w]); Rt.push([x + ty / tl * w, y - tx / tl * w]);
  }
  const path = () => { g.moveTo(...Lf[0]); for (const p of Lf) g.lineTo(...p); g.arc(p1[0], p1[1], w1 / 2, Math.atan2(Lf[N][1] - p1[1], Lf[N][0] - p1[0]), Math.atan2(Rt[N][1] - p1[1], Rt[N][0] - p1[0]), false); for (let i = N; i >= 0; i--) g.lineTo(...Rt[i]); g.closePath(); };
  path.mid = (u) => { const x = (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0], y = (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1]; return [x, y, lerp(w0, w1, Math.pow(u, .8)) / 2]; };
  return path;
}
// stroke every part thick, then fill every part: one outline round the union
function a3e_union(g, parts, col, LWs) {
  g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = LWs * 2;
  for (const p of parts) { g.beginPath(); p(); g.stroke(); }
  g.fillStyle = col; for (const p of parts) { g.beginPath(); p(); g.fill(); }
}
const a3e_clip = (g, parts) => { g.beginPath(); for (const p of parts) p(); g.clip(); };
function a3_ele(g, x, y, s, P) {
  P = Object.assign({ eyes: 'open', brow: 0, mouth: 'smile', look: [-1, .2], ear: 0, trunk: [-.8, -.45], trunkC: [-.8, -.8], foot: [-.42, 0], footBend: .05,
    tilt: 0, squash: 0, lean: 0 }, P);
  g.save(); g.translate(x, y); g.scale(s, s * (1 - P.squash)); g.rotate(P.lean); const LWs = LW / sc(g);
  // ground shadow
  g.save(); g.globalAlpha = .22; g.fillStyle = '#20301c'; g.beginPath(); g.ellipse(.12, .01, .92, .07, 0, 0, TAU); g.fill(); g.restore();
  const nails = (p, k = 1) => { g.fillStyle = A3_NAIL; for (const nx of [-.075, 0, .075]) { g.beginPath(); g.ellipse(p[0] + nx * k - .03, p[1] - .035, .03, .022, 0, 0, TAU); g.fill(); } };
  // far legs and the tail: their own silhouette, a shade darker, behind everything
  const far = [a3e_capsule(g, [.58, -.5], [.62, -.02], .12, .13), a3e_capsule(g, [-.02, -.5], [-.1, -.02], .12, .13)];
  a3e_union(g, far, A3_ELE_SH, LWs); nails([.62, 0], .9); nails([-.1, 0], .9);
  g.strokeStyle = INK; g.lineWidth = .05 + LWs * 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(.86, -.74); g.quadraticCurveTo(.98, -.6, .97, -.44); g.stroke();
  g.strokeStyle = A3_ELE; g.lineWidth = .05; g.stroke();
  ol(g, () => { g.moveTo(.97, -.47); g.lineTo(1.02, -.36); g.lineTo(.97, -.38); g.lineTo(.92, -.35); g.closePath(); }, '#4a4744', 3);
  // the main silhouette: body, near legs, head and trunk, one outline
  const H = [-.42, -.98], hr = .4;
  // P.trunk/trunkC keep their old meaning: head-local points offset by (.38, 1.0), now on this head
  const tkC = [P.trunkC[0] + .38 + H[0], P.trunkC[1] + 1.0 + H[1]], tkP = [P.trunk[0] + .38 + H[0], P.trunk[1] + 1.0 + H[1]];
  const rot = (p) => a3_rot(p, H, P.tilt);
  const tk = a3e_trunk(g, rot([H[0] - .14, H[1] + .1]), rot(tkC), rot(tkP), .26, .1);
  const body = () => { g.moveTo(-.2, -1.02); g.bezierCurveTo(.25, -1.2, .98, -1.02, .95, -.62); g.bezierCurveTo(.93, -.32, .55, -.28, .22, -.3); g.bezierCurveTo(-.12, -.3, -.36, -.46, -.28, -.8); g.closePath(); };
  const legB = a3e_capsule(g, [.48, -.46], [.5, -.02], .13, .145);
  const legF = a3e_capsule(g, [-.1, -.5], [P.foot[0], P.foot[1] - .02], .13, .145);
  const head = () => { g.save(); g.translate(...H); g.rotate(P.tilt); g.moveTo(hr, 0); g.ellipse(0, 0, hr, hr * .93, 0, 0, TAU); g.restore(); };
  const parts = [body, legB, legF, head, tk];
  a3e_union(g, parts, A3_ELE, LWs);
  // one soft shadow tone low on every mass, a highlight up on the head (both clipped to the silhouette)
  g.save(); a3e_clip(g, parts);
  g.fillStyle = A3_ELE_SH; g.globalAlpha = .35;
  g.beginPath(); g.ellipse(.36, -.27, .7, .1, -.03, 0, TAU); g.fill(); // a faint shadow under the belly, nothing more
  g.globalAlpha = 1; g.fillStyle = A3_ELE_HI; g.beginPath(); g.ellipse(H[0] - .12, H[1] - .22, .17, .085, -.35, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(.25, -.98, .28, .05, -.1, 0, TAU); g.fill();
  g.restore();
  nails([.5, 0]); nails([P.foot[0], P.foot[1]]);
  // thin inside lines: the near front leg against the body, trunk wrinkles, a crease at the shoulder
  g.strokeStyle = A3_ELE_IN; g.lineWidth = LWs * .6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-.02, -.5); g.quadraticCurveTo(.05, -.38, .04, -.28); g.stroke();
  for (const u of [.3, .45, .6, .74]) { const [mx, my, w] = tk.mid(u); g.beginPath(); g.moveTo(mx - w * .8, my - w * .2); g.quadraticCurveTo(mx, my + w * .35, mx + w * .8, my - w * .2); g.stroke(); }
  // the near ear: a big fan in front of the body, flapping from its root behind the cheek
  g.save(); g.translate(H[0] + .24, H[1] - .04); g.rotate(-.12 + P.ear * .25 + P.tilt); g.scale(1 + P.ear * .12, 1);
  ol(g, () => { g.moveTo(-.02, -.3); g.bezierCurveTo(.3, -.44, .5, -.08, .42, .12); g.bezierCurveTo(.36, .34, .1, .4, .02, .26); g.bezierCurveTo(-.06, .12, -.06, -.12, -.02, -.3); g.closePath(); }, A3_ELE);
  g.beginPath(); g.moveTo(.04, -.22); g.bezierCurveTo(.28, -.32, .4, -.06, .34, .1); g.bezierCurveTo(.28, .26, .12, .3, .07, .2); g.bezierCurveTo(.02, .1, .01, -.1, .04, -.22); g.closePath();
  const eg = g.createLinearGradient(0, -.3, .3, .3); eg.addColorStop(0, '#f2c2c9'); eg.addColorStop(1, A3_EAR); g.fillStyle = eg; g.fill();
  g.strokeStyle = A3_ELE_IN; g.lineWidth = LWs * .6; g.beginPath(); g.moveTo(.06, -.12); g.quadraticCurveTo(.2, .02, .14, .2); g.stroke();
  g.restore();
  // face
  g.save(); g.translate(...H); g.rotate(P.tilt);
  ol(g, () => { g.moveTo(-.12, .2); g.quadraticCurveTo(-.26, .32, -.36, .27); g.quadraticCurveTo(-.24, .25, -.17, .14); g.closePath(); }, A3_NAIL, 3);
  g.__lid = A3_ELE;
  for (const [ex, ey, er] of [[-.2, -.06, .055], [.04, -.04, .065]]) a3_eye(g, ex, ey, er, er * 1.2, P.eyes, P.look, LWs);
  g.strokeStyle = A3_ELE_IN; g.lineWidth = .028; g.lineCap = 'round';
  for (const [ex, ey, sx] of [[-.2, -.06, 1], [.04, -.04, -1]]) { g.beginPath(); g.moveTo(ex - .055, ey - .1 - P.brow * .025 * sx); g.quadraticCurveTo(ex, ey - .13, ex + .055, ey - .1 + P.brow * .025 * sx); g.stroke(); }
  g.fillStyle = 'rgba(232,140,152,.5)'; g.beginPath(); g.ellipse(.14, .07, .065, .035, 0, 0, TAU); g.fill();
  g.strokeStyle = INK; g.lineWidth = LWs; g.lineCap = 'round'; g.beginPath();
  if (P.mouth === 'smile') { g.moveTo(.0, .2); g.quadraticCurveTo(.08, .27, .16, .19); }
  else if (P.mouth === 'o') { g.ellipse(.07, .23, .028, .034, 0, 0, TAU); }
  else { g.moveTo(.01, .23); g.quadraticCurveTo(.08, .2, .15, .23); }
  g.stroke();
  g.restore();
  g.restore();
}

// ---------------------------------------------------------------- the parrot (feet on the branch at 0, facing left, ~.95 tall)
const A3_RED = '#d8443a', A3_RED2 = '#b03229', A3_BLUE = '#3d78c2', A3_YEL = '#f2c23a', A3_BK = '#f2e6c8';
function a3_parrot(g, x, y, s, P) {
  P = Object.assign({ open: 0, eyes: 'open', brow: 0, look: [-1, 0], wing: 0, wingB: null, tilt: 0, lean: 0, squash: 0 }, P);
  const wB = P.wingB ?? P.wing;
  g.save(); g.translate(x, y); g.scale(s, s * (1 - P.squash)); g.rotate(P.lean); const LWs = LW / sc(g);
  // long tail feathers
  ol(g, () => { g.moveTo(.06, -.2); g.quadraticCurveTo(.3, .1, .36, .5); g.quadraticCurveTo(.26, .45, .02, -.1); g.closePath(); }, A3_BLUE);
  ol(g, () => { g.moveTo(.02, -.2); g.quadraticCurveTo(.18, .14, .2, .56); g.quadraticCurveTo(.1, .5, -.06, -.12); g.closePath(); }, A3_RED);
  // far wing
  const wingShape = (sh, a, len, col, col2) => { g.save(); g.translate(...sh); g.rotate(a);
    ol(g, () => { g.moveTo(0, 0); g.quadraticCurveTo(len * .55, -.13, len, 0); g.quadraticCurveTo(len * .55, .1, 0, .04); g.closePath(); }, col);
    g.beginPath(); g.moveTo(0, .0); g.quadraticCurveTo(len * .3, -.08, len * .45, -.02); g.quadraticCurveTo(len * .3, .06, 0, .03); g.fillStyle = col2; g.fill();
    g.strokeStyle = 'rgba(43,33,28,.45)'; g.lineWidth = LWs * .6; for (const u of [.6, .75, .9]) { g.beginPath(); g.moveTo(len * u, -.05); g.lineTo(len * (u + .06), .03); g.stroke(); } g.restore(); };
  wingShape([.06, -.48], lerp(1.25, -1.9, wB), .5, A3_BLUE, A3_YEL);
  // feet gripping
  for (const fx of [-.06, .06]) ol(g, ell(g, fx, -.015, .05, .03), '#8f8a86', 3.5);
  // body
  ol(g, () => { g.moveTo(-.05, -.62); g.bezierCurveTo(.22, -.62, .24, -.1, .04, -.04); g.bezierCurveTo(-.18, .0, -.24, -.5, -.05, -.62); }, A3_RED);
  g.beginPath(); g.ellipse(-.06, -.28, .1, .17, .15, 0, TAU); g.fillStyle = '#e66a5c'; g.fill();
  // head
  g.save(); g.translate(-.04, -.7); g.rotate(P.tilt);
  for (const [cx, cy, a] of [[.02, -.17, -.3], [.09, -.15, .2], [.14, -.1, .7]]) ol(g, ell(g, cx, cy, .035, .08, a), A3_RED, 3.5);
  ol(g, ell(g, 0, 0, .19, .18), A3_RED);
  ol(g, ell(g, -.07, -.02, .085, .07), '#fbf3e6', 3.5);
  g.__lid = A3_RED;
  a3_eye(g, -.07, -.025, .04, .045, P.eyes, P.look, LWs);
  g.strokeStyle = A3_RED2; g.lineWidth = .025; g.lineCap = 'round'; g.beginPath(); g.moveTo(-.13, -.1 - P.brow * .015); g.quadraticCurveTo(-.07, -.13 + P.brow * .02, -.01, -.1 + P.brow * .03); g.stroke();
  // beak: the hooked upper half, the lower half drops open
  const HB = [-.13, .03], aL = -P.open * .6;
  const lo = [[-.14, .03], [-.27, .06], [-.25, .12], [-.14, .1]].map((p) => a3_rot(p, HB, aL));
  if (P.open > .05) { const m1 = a3_rot([-.26, .06], HB, aL * .5); ol(g, () => { g.moveTo(-.13, .02); g.lineTo(-.3, .04); g.lineTo(...m1); g.lineTo(...lo[1]); g.closePath(); }, '#5a2421', 3); }
  ol(g, () => { g.moveTo(...lo[0]); g.lineTo(...lo[1]); g.quadraticCurveTo(...lo[2], ...lo[3]); g.closePath(); }, '#3b3433', 3.5);
  ol(g, () => { g.moveTo(-.12, -.07); g.bezierCurveTo(-.3, -.1, -.38, .02, -.31, .12); g.quadraticCurveTo(-.3, .05, -.26, .04); g.lineTo(-.12, .04); g.closePath(); }, A3_BK);
  g.restore();
  // near wing
  wingShape([.0, -.46], lerp(1.35, -2.0, P.wing), .52, A3_BLUE, A3_YEL);
  g.restore();
}
// a shout bubble with a "!" or "?" in it, popping in at t0
function a3_bubble(g, x, y, r, mark, t, t0, tailTo) {
  if (t < t0) return; const u = back(seg(t, t0, t0 + .18)), wob = 1 + ring(t - t0, 22, 7) * .08;
  g.save(); g.translate(x, y); g.scale(u * wob, u * wob);
  if (tailTo) { const dx = tailTo[0] - x, dy = tailTo[1] - y, a = Math.atan2(dy, dx), d = Math.min(Math.hypot(dx, dy) * .55, r * 1.7);
    ol(g, () => { g.moveTo(Math.cos(a + .35) * r * .8, Math.sin(a + .35) * r * .8); g.lineTo(Math.cos(a) * d, Math.sin(a) * d); g.lineTo(Math.cos(a - .35) * r * .8, Math.sin(a - .35) * r * .8); g.closePath(); }, '#fffdf3'); }
  ol(g, () => { const n = 9; for (let i = 0; i <= n; i++) { const a0 = i / n * TAU, a1 = (i + .5) / n * TAU; const p0 = [Math.cos(a0) * r, Math.sin(a0) * r * .82]; if (!i) g.moveTo(...p0); g.quadraticCurveTo(Math.cos(a1) * r * 1.22, Math.sin(a1) * r * 1.0, Math.cos((i + 1) / n * TAU) * r, Math.sin((i + 1) / n * TAU) * r * .82); } g.closePath(); }, '#fffdf3');
  g.fillStyle = INK; g.font = `900 ${Math.round(r * 1.25)}px "Arial Black", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(mark, 0, r * .06);
  g.restore();
}
// a loose feather drifting down (outlined prop)
function a3_feather(g, x, y, L, a, col) { g.save(); g.translate(x, y); g.rotate(a); ol(g, () => { g.moveTo(-L / 2, 0); g.quadraticCurveTo(0, -L * .28, L / 2, 0); g.quadraticCurveTo(0, L * .2, -L / 2, 0); }, col, 3.5); g.strokeStyle = 'rgba(43,33,28,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-L * .55, 0); g.lineTo(L * .45, -L * .02); g.stroke(); g.restore(); }
// the cartoon dust cloud (act1 shot 6 idiom): puffs jittering on twos around (cx, cy)
function a3_dust(g, t, cx, cy, sz, a, seed, col = '#efe4cc') {
  const f2 = Math.floor(t * 12) / 12, r = M32(((f2 * 1000) | 0) + seed);
  g.save(); g.globalAlpha = a;
  const puffs = [...Array(10)].map((_, i) => { const an = i / 10 * TAU + f2 * .4; return [cx + Math.cos(an) * (sz * .75 + r() * sz * .3), cy + Math.sin(an) * (sz * .45 + r() * sz * .2), sz * (.45 + r() * .25)]; });
  for (const [x, y, rr] of puffs) ol(g, ell(g, x, y, rr, rr * .85), col);
  ol(g, ell(g, cx, cy, sz * .9, sz * .65), col);
  g.strokeStyle = 'rgba(43,33,28,.5)'; g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx + (r() - .5) * sz * .7, cy + (r() - .5) * sz * .35, sz * (.18 + r() * .18), r() * 6, r() * 6 + 2); g.stroke(); }
  for (let i = 0; i < 4; i++) sparkle(g, cx + (r() - .5) * sz * 2.8, cy - sz * .7 + (r() - .5) * sz, 14 + r() * 10, 1, '#fff6c8');
  g.restore();
}
// motion lines: short ink strokes
function a3_whoosh(g, x, y, a, n, len, alpha = .6) { g.save(); g.strokeStyle = `rgba(43,33,28,${alpha})`; g.lineWidth = 5; g.lineCap = 'round'; for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 26; g.beginPath(); g.moveTo(x - Math.sin(a) * o, y + Math.cos(a) * o); g.lineTo(x - Math.sin(a) * o + Math.cos(a) * len, y + Math.cos(a) * o + Math.sin(a) * len); g.stroke(); } g.restore(); }

// ---------------------------------------------------------------- sets
// the parrot's branch, from the tree on the right (background: no outlines)
function a3_branch(g, y) {
  g.fillStyle = '#5a3f2b'; g.beginPath(); g.moveTo(1780, y - 30); g.quadraticCurveTo(1500, y - 40, 1230, y); g.lineTo(1230, y + 20); g.quadraticCurveTo(1500, y - 14, 1780, y); g.closePath(); g.fill();
  g.fillStyle = '#4f8f57'; for (const [x, yy, r] of [[1245, y - 8, 40], [1280, y - 34, 34], [1225, y + 20, 26]]) { g.beginPath(); g.arc(x, yy, r, 0, TAU); g.fill(); }
}
const A3_STUMP = [380, 150, 170], A3_SLATE = [830, 560, 330]; // stump x, height, width; slate centre x, board w, h
function a3_classroom(g, t) { jungle(g, t, { treeX: 1650, sunX: 520, raysX: 300 }); }
function a3_riverSet(g, t) { jungle(g, t, { treeX: 180, sunX: 1500, ferns: false, land: (gg) => a3_river(gg, t, 690, 840) }); }
const A3_WL = 770, A3_RIVER1 = 838; // the croc's waterline; the near bank
const A3_EX = 1300, A3_BANX = 1300 - .8 * 330; // the elephant, and where the banana lies under his foot

ACTS.push(...[
  // 1. L5: the owl professor on his stump taps the slate, then chalks a long diagram; the gorilla sits and follows the chalk
  { t0: 81.5, t1: 84.53, draw(g, t, lt) {
    cam(g, lt, 3.03, 1.0, 1.07, 860, 600);
    a3_classroom(g, t);
    const [sx, sh, sw] = A3_STUMP, [cx, bw, bh] = A3_SLATE;
    a3_stump(g, sx, GROUND, sw, sh);
    const B = a3_slate(g, cx, GROUND, bw, bh, t);
    const ch = a3_chalkAt(t), tapping = t < 82.02 ? Math.abs(Math.sin((t - 81.5) * 12)) : 0;
    const tip = ch ? [B.bx + ch[0] * B.w, B.by + ch[1] * B.h] : [B.bx + 40 - tapping * 18, B.by + 60 + tapping * 10];
    const ox = sx, oy = GROUND - sh, os = 270;
    const hand = [ox + 120 + (tip[0] - ox) * .12, oy - 150 + (tip[1] - oy + 150) * .1];
    const hR = [(hand[0] - ox) / os, (hand[1] - oy) / os];
    const talk = t > 82.02 && Math.sin(t * 15) > .2;
    a3_owl(g, ox, oy, os, { handR: hR, bendR: -.08, handL: [-.36, -.22], look: [.9, -.2], eyes: 'open', brow: .2, beak: talk ? 'open' : 'shut', tassel: t * 3, tilt: .06 * Math.sin(t * 2.4),
      glint: t > 81.7 && t < 82.0 ? 1 - seg(t, 81.7, 82.0) : 0 });
    // the long pointer with chalk on its tip, from his wing to the board
    g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(...hand); g.lineTo(...tip); g.stroke();
    g.strokeStyle = '#c99a5e'; g.lineWidth = 6; g.beginPath(); g.moveTo(...hand); g.lineTo(...tip); g.stroke();
    ol(g, ell(g, tip[0], tip[1], 9, 9), '#f4f1e6', 4);
    if (ch) { const r = M32((t * 24) | 0); g.fillStyle = 'rgba(245,242,230,.75)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(tip[0] + (r() - .5) * 30, tip[1] + r() * 40, 2 + r() * 3, 0, TAU); g.fill(); } }
    ol(g, ell(g, hand[0], hand[1], 26, 18, -.4), A3_OWL2); // his wingtip over the pointer
    // the gorilla, sitting, banana in his lap, eyes following the chalk
    const gx = 1430, look = ch ? [-(1 - (tip[0] - B.bx) / B.w * .4), cl((tip[1] - 520) / 200, -1, 1)] : [-.8, -.2];
    gorilla(g, gx, GROUND, 300, { sit: true, handL: [-.24, -.3], handR: [.26, -.28], bendL: 30, bendR: -30, look, tilt: .1 * Math.sin(t * 3.1) + (ch ? -.06 : 0),
      eyes: (t % 3.3) < .1 ? 'shut' : 'open', brow: .25 + .3 * seg(t, 83, 84.4), mouth: t > 83.6 ? 'o' : 'flat',
      front: (gg) => banana(gg, 0, -.3, .44, .1, 1) });
  } },
  // 2. close on the gorilla in front of the slate: upside down on 84.53, twirl on 84.90, tap tap tap from 85.31. Nothing.
  { t0: 84.53, t1: 87.66, draw(g, t, lt) {
    cam(g, lt, 3.13, 1.5, 1.56, 1180, 640);
    a3_classroom(g, t);
    a3_slate(g, A3_SLATE[0], GROUND, A3_SLATE[1], A3_SLATE[2], t);
    const flipT = 84.53, twT = 84.9, tapT = 85.31, stare = 86.3;
    const flip = eo(seg(t, flipT, flipT + .2)), twirl = eio(seg(t, twT, twT + .38)) * TAU * 2;
    const taps = [0, .17, .34].map((d) => Math.max(0, Math.sin(cl((t - tapT - d) / .12) * Math.PI)));
    const tp = Math.max(...taps);
    const hold = [.42, -1.02];
    const blink = t > stare && t < stare + .08;
    const shrug = Math.max(0, Math.sin(cl((t - 86.85) / .7) * Math.PI));
    gorilla(g, 1300, GROUND, 330, { handR: [hold[0] + .2, hold[1] + .02 - shrug * .1], bendR: -40, handL: t > tapT - .2 && t < tapT + .7 ? [.2 + tp * .06, -.9 - tp * .1] : [-.4 - shrug * .1, -.36 - shrug * .25], bendL: -30,
      look: t < stare ? [.3, -.6] : (t < 86.8 ? [0, -.5] : [-.6, -.1]), eyes: blink ? 'shut' : (t > stare && t < 86.8 ? 'half' : 'open'), brow: t > stare ? -.5 : .5, mouth: t > stare ? (shrug > .2 ? 'frown' : 'flat') : (tp > .3 ? 'o' : 'flat'),
      tilt: t < stare ? .12 * Math.sin(twirl * .5) : -.1 * shrug, squash: -shrug * .03,
      after: (gg) => banana(gg, hold[0] + .2, hold[1] - .06 - shrug * .1, .44, -.1 + flip * Math.PI + twirl, 1) });
    // twirl lines round the banana, tap stars
    if (t > twT && t < twT + .45) for (let i = 0; i < 3; i++) { const a = twirl + i * 2.1; g.strokeStyle = 'rgba(43,33,28,.55)'; g.lineWidth = 5; g.beginPath(); g.arc(1300 + .62 * 330, GROUND - 1.08 * 330, 110, a, a + .9); g.stroke(); }
    for (let i = 0; i < 3; i++) { const tt = tapT + i * .17 + .06; if (t >= tt && t < tt + .25) sparkle(g, 1300 + .5 * 330, GROUND - 1.12 * 330, 22, 1 - seg(t, tt, tt + .25), '#ffffff'); }
    // the owl's pointer pokes in from the left, tapping the board expectantly
    if (t > 86.0) { const u = eo(seg(t, 86.0, 86.4)), tk = Math.abs(Math.sin((t - 86.4) * 9)) * (t > 86.4 ? 1 : 0); const x1 = lerp(500, 900 - tk * 12, u), y1 = 560 + tk * 8;
      g.lineCap = 'round'; g.strokeStyle = INK; g.lineWidth = 14; g.beginPath(); g.moveTo(400, 700); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = '#c99a5e'; g.lineWidth = 6; g.beginPath(); g.moveTo(400, 700); g.lineTo(x1, y1); g.stroke(); ol(g, ell(g, x1, y1, 9, 9), '#f4f1e6', 4); }
    if (t > 86.85 && t < 87.6) { const a = seg(t, 86.85, 87.0) * (1 - seg(t, 87.4, 87.6)); g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(43,33,28,.7)'; g.lineWidth = 5; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(1300 + sx * 175, GROUND - 430); g.lineTo(1300 + sx * 200, GROUND - 470); g.stroke(); } g.restore(); }
  } },
  // 3. L6: the river. A crocodile surfaces with a huge sweet grin and opens wide: let me. The gorilla leans in.
  { t0: 87.66, t1: 89.96, draw(g, t, lt) {
    cam(g, lt, 2.3, 1.0, 1.06, 900, 700);
    a3_riverSet(g, t);
    const rise = eo(seg(t, 87.66, 88.2)), open = back(seg(t, 88.39, 88.85)) * .95;
    const cx = 1100, cs = 400;
    g.save(); g.beginPath(); g.rect(-W, -H, 3 * W, A3_RIVER1 + H); g.clip();
    a3_croc(g, cx, A3_WL, cs, { rise, open, eyes: t < 88.02 ? 'open' : (t < 88.39 ? 'happy' : 'half'), look: [-1, .2], brow: -.3, blush: seg(t, 88.0, 88.3), tail: Math.sin(t * 3) * .03, lean: -open * .05 });
    a3_waterFront(g, t, cx, A3_WL + 8, A3_RIVER1, 1 - rise);
    g.restore();
    if (t > 87.66 && t < 88.3) for (let i = 0; i < 6; i++) { const r = M32(i + 3), ph = seg(t, 87.66 + r() * .2, 88.3); ol(g, ell(g, cx - 300 + r() * 600, A3_WL - ph * 120 - r() * 40, 10 + r() * 8, 10 + r() * 8), '#e6f6f3', 3); }
    const lean = eio(seg(t, 88.75, 89.9));
    gorilla(g, 640, 975, 300, { lean: lean * .22, handR: [.55 + lean * .3, -.55 - lean * .05], bendR: -30, handL: [-.4, -.35], look: [1, .2], eyes: 'open', brow: .2 - lean * .4, mouth: lean > .4 ? 'smile' : 'o', tilt: lean * .1,
      after: (gg) => banana(gg, .6 + lean * .32, -.6 - lean * .05, .42, -.2, 1) });
  } },
  // 4. close: he sees the teeth and pulls back on 90.11; the jaws snap shut on air on 90.92; the croc sinks, still sweet
  { t0: 89.96, t1: 93.3, draw(g, t, lt) {
    cam(g, lt, 3.34, 1.45, 1.5, 960, 640);
    a3_riverSet(g, t);
    const pull = 90.11, snap = 90.92;
    const open = t < snap ? .95 + Math.sin(t * 5) * .03 : 0;
    const sink = eio(seg(t, 92.0, 93.3));
    const cx = 1100, cs = 400;
    g.save(); g.beginPath(); g.rect(-W, -H, 3 * W, A3_RIVER1 + H); g.clip();
    const jolt = t >= snap ? ring(t - snap, 30, 7) : 0;
    a3_croc(g, cx + jolt * 10, A3_WL, cs, { rise: 1 - sink * .9, open, eyes: t < snap ? 'half' : (t < snap + .5 ? 'open' : 'happy'), look: t < snap ? [-1, .3] : [-1, -.2], brow: t < snap ? -.3 : .2, blush: t > snap + .4 ? 1 : .6, lean: -open * .05 + jolt * .04 });
    a3_waterFront(g, t, cx, A3_WL + 8, A3_RIVER1, sink);
    g.restore();
    if (t > 90.0 && t < pull + .35) { const a = 1 - seg(t, pull, pull + .35); for (const [x, y] of [[cx - 160, A3_WL - 70], [cx + 20, A3_WL - 90]]) sparkle(g, x, y, 26, a, '#ffffff'); }
    if (t >= snap && t < snap + .45) { const a = 1 - seg(t, snap, snap + .45); for (let i = 0; i < 6; i++) { const an = -Math.PI / 2 + (i - 2.5) * .45; a3_whoosh(g, cx - 160 + Math.cos(an) * 170, A3_WL - 110 + Math.sin(an) * 90, an, 1, 40, .7 * a); } sparkle(g, cx - 160, A3_WL - 120, 40, a, '#ffffff'); }
    if (sink > .1) for (let i = 0; i < 5; i++) { const r = M32(i + 20), ph = ((t - 92.1) * .9 + r()) % 1; ol(g, ell(g, cx - 200 + r() * 420, A3_WL - ph * 60, 7 + r() * 6, 7 + r() * 6), '#e6f6f3', 3); }
    const back0 = eo(seg(t, pull, pull + .22)), hug = eio(seg(t, pull + .1, pull + .5));
    const lean = .22 * (1 - back0) - .1 * back0 + (t > snap ? ring(t - snap, 20, 6) * -.04 : 0);
    gorilla(g, 640, 975, 300, { lean, handR: [lerp(.85, .12, hug), lerp(-.6, -.5, hug)], bendR: -30, handL: [lerp(-.4, -.12, hug), lerp(-.35, -.48, hug)], bendL: 30,
      look: [1, .2], eyes: t < pull ? 'open' : 'open', brow: t < pull ? -.2 : -1, mouth: t < pull ? 'smile' : (t < snap + .2 ? 'o' : 'grit'), sweat: seg(t, pull + .1, pull + .3), squash: -back0 * (1 - seg(t, pull + .2, pull + .5)) * .06,
      after: (gg) => banana(gg, lerp(.92, .02, hug), lerp(-.65, -.55, hug), .42, lerp(-.2, .5, hug), 1) });
    if (t > pull && t < pull + .5) a3_whoosh(g, 640 + 230, 975 - 200, Math.PI, 3, 70, .6 * (1 - seg(t, pull + .2, pull + .5)));
  } },
  // 5. L7: back in the clearing an elephant kindly offers (94.44); the gorilla sets the banana down on the grass (95.37)
  { t0: 93.3, t1: 96.13, draw(g, t, lt) {
    cam(g, lt, 2.83, 1.0, 1.05, 960, 640);
    jungle(g, t, { treeX: 260, sunX: 1250, raysX: 600 });
    const offer = eio(seg(t, 94.44, 94.9)), nod = Math.sin(cl((t - 95.0) / .5) * Math.PI) * (t > 95 ? 1 : 0);
    const down = eio(seg(t, 95.0, 95.37)), stepBack = eio(seg(t, 95.5, 96.0)), lift = eio(seg(t, 95.65, 96.13));
    const walk = 1 - eo(seg(t, 93.3, 94.2)), ex = A3_EX + walk * 320, bob = Math.abs(Math.sin(t * 7)) * walk;
    const banX = A3_BANX, banY = GROUND - 14;
    a3_ele(g, ex, GROUND, 330, { eyes: t > 94.44 && t < 95.4 ? 'happy' : 'open', brow: -.3, mouth: 'smile', ear: Math.sin(t * 2.5) * .5 * (1 - walk) + bob * .3, squash: bob * .02,
      trunk: [lerp(-.85, -.95, offer) - nod * .05, lerp(-.45, -.85, offer) + nod * .15], trunkC: [lerp(-.8, -1.05, offer), lerp(-.75, -.35, offer)],
      foot: [lerp(-.42, -.8, lift) + walk * Math.sin(t * 7) * .06, -lift * .6], footBend: lerp(.05, -.2, lift), look: [-1, lerp(.1, .5, down)], tilt: offer * -.05 });
    const gx = 760 - stepBack * 100, gs = 300, gl = down * .28 * (1 - stepBack);
    // where his hand must be (body units, before his lean) for the banana to land on (banX, banY)
    const tgt = a3_rot([(banX - 760) / gs - .05, (banY - GROUND) / gs + .05], [0, 0], -.28);
    const bH = down < 1 ? [lerp(.5, tgt[0], down), lerp(-.5, tgt[1], down)] : [lerp(tgt[0], .55, stepBack), lerp(tgt[1], -.4, stepBack)];
    gorilla(g, gx, GROUND, gs, { lean: gl, handR: bH, bendR: -30, handL: [-.4, -.3], look: t < 94.44 ? [1, -.4] : [1, lerp(-.3, .5, down)],
      eyes: 'open', brow: t > 95.6 ? -.4 : .1, mouth: t > 95.6 ? 'o' : (t > 94.6 ? 'smile' : 'flat'), tilt: t < 94.44 ? -.1 : 0,
      after: down < 1 ? (gg) => banana(gg, bH[0] + .05, bH[1] - .05, .42, -.1, 1) : null });
    if (down >= 1) banana(g, banX, banY, 130, -.05, 1);
    if (t > 94.44 && t < 95.2) { const a = 1 - seg(t, 94.9, 95.2); sparkle(g, ex - 1.3 * 330, GROUND - .95 * 330 - 40, 22, a); }
  } },
  // 6. stomp on 96.57: dust cloud; the banana pops out of it unharmed on 97.70 and drops into his hands. Still shut.
  { t0: 96.13, t1: 99.0, draw(g, t, lt) {
    cam(g, lt, 2.87, 1.28, 1.32, 960, 660);
    jungle(g, t, { treeX: 260, sunX: 1250, raysX: 600 });
    const st = 96.57, pop = 97.7, catchT = 98.25;
    const ex = A3_EX, banX = A3_BANX, banY = GROUND - 14;
    const fall = t < st ? ei(seg(t, 96.13, st)) : 1, lift = t > 97.9 ? eio(seg(t, 97.9, 98.4)) : 0;
    const shake = t >= st ? ring(t - st, 34, 6) : 0;
    g.save(); g.translate(0, shake * 10);
    const peek = seg(t, 98.3, 98.6);
    a3_ele(g, ex, GROUND, 330, { eyes: t < st ? 'shut' : (t < pop ? 'shut' : (t < 98.3 ? 'wide' : 'happy')), brow: t < pop ? .3 : -.4, mouth: t > pop && t < 98.3 ? 'o' : 'smile', ear: t > st ? ring(t - st, 18, 5) * .8 : 0,
      trunk: [-.95, lerp(-1.05, -.6, fall)], trunkC: [-1.0, -.5], foot: [-.8 + lift * .12, lerp(-.6, 0, fall) - lift * .3], footBend: lerp(-.2, .02, fall), look: [-1, .5 - peek * .3], squash: shake * .02, tilt: -peek * .06 });
    if (t < st) banana(g, banX, banY, 130, -.05, 1);
    if (t >= st && t < pop + .4) a3_dust(g, t, banX, GROUND - 80, 140, 1 - seg(t, pop + .1, pop + .4), 7);
    if (t >= st && t < st + .4) for (let i = 0; i < 5; i++) { const a = 1 - seg(t, st, st + .4); sparkle(g, banX + (i - 2) * 90, GROUND - 20 - Math.abs(i - 2) * 25, 20, a, '#f3eee0'); }
    // the banana flies out, spinning, sparkling, into his hands
    const gx = 660, catchP = [gx + .45 * 300, GROUND - .55 * 300];
    let held = t >= catchT;
    if (t >= pop && !held) { const u = seg(t, pop, catchT); const bx = lerp(banX, catchP[0], u), by = lerp(GROUND - 120, catchP[1], u) - Math.sin(u * Math.PI) * 300; banana(g, bx, by, 130, u * TAU * 1.5, 1);
      for (let i = 0; i < 4; i++) sparkle(g, bx + Math.cos(i * 1.7 + t * 9) * 80, by + Math.sin(i * 1.7 + t * 9) * 60, 16, 1 - u * .5); }
    g.restore();
    const inspect = seg(t, 98.4, 98.7);
    gorilla(g, gx, GROUND, 300, { squash: t >= st ? shake * .04 : 0, handR: held ? [lerp(.45, .25, inspect), lerp(-.55, -.8, inspect)] : [t > pop ? .5 : .35, t > pop ? -.6 : -.4], bendR: -30, handL: held ? [lerp(-.2, -.05, inspect), lerp(-.5, -.78, inspect)] : (t < st ? [-.2, -.95] : [-.45, -.5]), bendL: 30,
      eyes: t < st ? 'shut' : (held && inspect > .5 ? 'half' : 'open'), brow: held && inspect > .5 ? -.8 : -.2, mouth: t < pop ? 'grit' : (held ? (inspect > .5 ? 'frown' : 'smile') : 'o'),
      look: held ? [.3, -.2] : (t > pop ? [1, -.8] : [1, .3]), tilt: t < st ? .15 : 0, lean: t < st ? -.06 : 0,
      after: held ? (gg) => banana(gg, lerp(.4, .12, inspect), lerp(-.62, -.86, inspect), .42, lerp(.3, -.1, inspect), 1) : null });
  } },
  // 7. L8: a parrot lands on a branch and shouts advice ("!" "?"); he tries everything at once, faster and faster
  { t0: 99.0, t1: 102.33, draw(g, t, lt) {
    cam(g, lt, 3.33, 1.1, 1.18, 960, 620);
    jungle(g, t, { treeX: 1750, sunX: 420, raysX: 150 });
    a3_branch(g, 470);
    const land = eo(seg(t, 99.0, 99.7)), px = lerp(1980, 1420, land), py = lerp(220, 470, land) - Math.sin(land * Math.PI) * 90, ps = 240;
    const shouts = [100.66, 100.84, 101.21, 101.64, 102.0];
    const sh = shouts.reduce((a, s0) => Math.max(a, Math.max(0, Math.sin(cl((t - s0) / .2) * Math.PI))), 0);
    const flap = land < 1 ? Math.sin(t * 30) * .5 + .5 : sh * (Math.sin(t * 26) * .5 + .5);
    a3_parrot(g, px, py, ps, { open: sh, wing: flap, wingB: flap * .9, eyes: land < 1 ? 'open' : (sh > .3 ? 'wide' : 'open'), brow: sh > .3 ? .8 : 0, look: [-1, .7], lean: -sh * .14 + (land < 1 ? -.25 : 0), squash: -sh * .06, tilt: sh * .12 });
    // shout bubbles: only marks, no words
    const tail = [px - .3 * ps, py - .66 * ps];
    a3_bubble(g, 1130, 300, 62, '!', t, shouts[0], tail);
    a3_bubble(g, 1330, 200, 54, '?', t, shouts[1], tail);
    a3_bubble(g, 960, 420, 58, '!', t, shouts[2], tail);
    a3_bubble(g, 1600, 250, 56, '?', t, shouts[3], tail);
    a3_bubble(g, 1660, 410, 50, '!', t, shouts[4], tail);
    // loose feathers off the flapping
    for (let i = 0; i < 6; i++) { const r = M32(i + 61), t0 = 100.66 + i * .25; if (t < t0) continue; const u = t - t0; a3_feather(g, px + (r() - .5) * 90 - u * 50, py - 140 + u * 120 + Math.sin(u * 5 + i) * 10, 34, Math.sin(u * 4 + i) * .9, i % 2 ? A3_RED : A3_BLUE); }
    // the gorilla: listens, then everything at once, poses on twos, faster and dizzier
    const gx = 760, frenzy = t >= 100.84;
    if (!frenzy) {
      const u = seg(t, 99.3, 99.8);
      gorilla(g, gx, GROUND, 310, { handR: [.45, -.5], handL: [-.45, -.35], look: [1, lerp(.2, -1, u)], tilt: -u * .15, eyes: 'open', brow: t > 100.66 ? -.6 : 0, mouth: t > 100.66 ? 'o' : 'flat',
        after: (gg) => banana(gg, .5, -.58, .42, -.2, 1) });
    } else {
      const rate = lerp(8, 14, seg(t, 100.84, 102.2)), k = Math.floor((t - 100.84) * rate), pose = k % 5, bounce = Math.abs(Math.sin((t - 100.84) * rate * Math.PI));
      const P = { flip: (k % 2) ? -1 : 1, squash: bounce * .05, eyes: 'cross', brow: .6, sweat: 1, look: [0, 0], tilt: (k % 3 - 1) * .15 };
      let bp = [.4, -.6], ba = 0;
      if (pose === 0) { Object.assign(P, { handR: [.15, -1.25], handL: [-.4, -.5], mouth: 'grit' }); bp = [.15, -1.35]; ba = k * 1.3 + Math.PI; }      // upside down, twirling over his head
      else if (pose === 1) { Object.assign(P, { handR: [.12, -.82], handL: [-.12, -.8], mouth: 'grit' }); bp = [.0, -.86]; ba = 0; }              // biting
      else if (pose === 2) { Object.assign(P, { handR: [.6, -.6], handL: [-.45, -.62], lean: .1, mouth: 'grit' }); bp = [.25, -.62]; ba = 0; }     // tugging
      else if (pose === 3) { Object.assign(P, { handR: [.2, -1.15], handL: [-.4, -.4], mouth: 'o' }); bp = [.12, -1.12]; ba = -.6; }            // bonking his head
      else { Object.assign(P, { handR: [.6, -.3], handL: [-.6, -.3], mouth: 'o', squash: -.04 }); bp = [.65, -.38]; ba = 1.2; }                 // shaking it
      P.after = (gg) => banana(gg, bp[0], bp[1], .42, ba, 1);
      gorilla(g, gx + (k % 2 ? 12 : -12), GROUND - bounce * 20, 310, P);
      for (let i = 0; i < 3; i++) { const a = t * 9 + i * 2.1; g.strokeStyle = 'rgba(43,33,28,.5)'; g.lineWidth = 5; g.beginPath(); g.ellipse(gx, GROUND - 200, 240, 90, 0, a, a + .8); g.stroke(); }
      if (t > 101.6) for (let i = 0; i < 4; i++) { const a = t * 6 + i * TAU / 4; sparkle(g, gx + Math.cos(a) * 110, GROUND - 450 + Math.sin(a) * 26, 18, 1); }
    }
  } },
  // 8. 102.33: he collapses in a heap; the slate falls flat and puffs chalk dust; feathers settle; everyone looks on
  { t0: 102.33, t1: 105.8, draw(g, t, lt) {
    const c0 = 102.33;
    cam(g, lt, 3.47, 1.3, 1.02, 940, 760);
    jungle(g, t, { treeX: 1750, sunX: 420, raysX: 150 });
    a3_branch(g, 370);
    // the owl on his stump, at the left
    const sx = 330, startle = t < c0 + .5;
    a3_stump(g, sx, GROUND, 150, 130);
    a3_owl(g, sx, GROUND - 130, 230, { eyes: startle ? 'wide' : 'open', brow: startle ? -.6 : -.9, beak: startle ? 'open' : 'shut', look: [1, .6], tassel: t * 3,
      handL: [-.36, -.25], handR: t > 104.2 && t < 105.0 ? [.12, -.78] : [.36, -.3], bendR: -.08, tilt: .1, squash: startle ? -.05 : 0, glint: t > 104.3 && t < 104.7 ? 1 - seg(t, 104.3, 104.7) : 0 });
    // the slate falls flat on its back and lands with a puff of chalk dust
    const tip = ei(seg(t, c0, c0 + .4)), landT = c0 + .4;
    a3_slate(g, 650, GROUND, 300, 180, 999, tip);
    if (t >= landT) { const a = 1 - seg(t, landT + .2, landT + .9); if (a > 0) a3_dust(g, t, 650, GROUND - 50, 110, a, 13, '#f4f1e8'); }
    // chalk dust motes settling
    for (let i = 0; i < 26; i++) { const r = M32(i + 101), t0 = landT + r() * .3; if (t < t0) continue; const u = t - t0, x = 480 + r() * 340 + Math.sin(u * 2 + i) * 20, y = GROUND - 220 - r() * 160 + u * 50 * (1 + r()); if (y > GROUND - 5) continue;
      g.fillStyle = `rgba(246,243,232,${.7 * (1 - seg(t, 104.8, 105.8)) + .2})`; g.beginPath(); g.arc(x, y, 3 + r() * 4, 0, TAU); g.fill(); }
    // the elephant at the right, sympathetic, trunk drooping
    const droop = eio(seg(t, 103.0, 104.0));
    a3_ele(g, 1580, GROUND, 290, { eyes: startle ? 'wide' : (t > 103.4 ? 'half' : 'open'), brow: -.8, mouth: droop > .5 ? 'flat' : 'o', look: [-1, .6], ear: -.2 + Math.sin(t * 2) * .2,
      trunk: [-.75, lerp(-.35, -.08, droop)], trunkC: [-.95, -.6], foot: [-.42, 0], tilt: droop * .08 });
    // the parrot on the branch, quiet now
    const hush = seg(t, 103.2, 103.5);
    a3_parrot(g, 1330, 370, 200, { open: startle ? .6 : 0, eyes: startle ? 'wide' : (hush > .5 ? 'half' : 'open'), look: [-1, .9], wing: startle ? .6 : 0, tilt: hush * .2, lean: -hush * .05 });
    // him, in a heap on his back, the banana still shut on his belly
    const hit = ring(t - c0, 16, 6), blink = t > 104.1 && t < 104.2, gx = 1010;
    gorilla(g, gx, GROUND + 6, 300, { lie: true, squash: hit * .12, handL: [-.45, -.5], handR: [.5, -.32], bendL: 40, bendR: -40, look: [.6, 0], tilt: .2,
      eyes: t < 103.9 ? 'cross' : (blink ? 'shut' : 'half'), brow: -.8, mouth: t < 103.9 ? 'o' : 'frown',
      after: (gg) => banana(gg, -.03, -.42, .42, 1.45, 1) });
    if (t < c0 + 1.6) for (let i = 0; i < 4; i++) { const a = t * 5 + i * TAU / 4, fa = 1 - seg(t, c0 + 1.1, c0 + 1.6); sparkle(g, gx - 230 + Math.cos(a) * 90, GROUND - 260 + Math.sin(a) * 22, 18, fa); }
    if (t < c0 + .4) for (let i = 0; i < 5; i++) sparkle(g, gx + (i - 2) * 110, GROUND - 10 - Math.abs(i - 2) * 22, 20, 1 - seg(t, c0, c0 + .4), '#f3eee0');
    // feathers drifting down, the last few landing on him
    for (let i = 0; i < 7; i++) { const r = M32(i + 141), t0 = c0 - .3 + r() * .8, rest = GROUND - 40 - r() * 110, y0 = 300 + r() * 150, x0 = 820 + r() * 560;
      const uu = Math.min(Math.max(0, t - t0), (rest - y0) / 150), sw = Math.sin(uu * 3 + i);
      a3_feather(g, x0 + sw * 40, y0 + uu * 150, 34, sw * .9, i % 2 ? A3_RED : A3_BLUE); }
  } },
]);
