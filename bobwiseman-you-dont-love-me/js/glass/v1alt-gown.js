// Verse 1 alternative for lancet 1 (line V1.l2): she becomes the mountain.
// She stands in a valley beside one tall mountain. From V1.l2 her gown grows (hem spreads down and out, she
// rises) until on V1.high it IS a mountain: a leaded triangular skirt, snowfields on her shoulders, pine trim
// along the hem, her small deadpan head at the summit level with the real peak. On V1.which the gown flips
// through patterns (a clean change of panes and leads each time); on V1.dress it settles and the snow
// shoulders puff. Backing phrases: she sways, the real mountain looks at her sideways; settled before bk4 ends.
// Loads after v1-scenes.js; every top-level name is prefixed v1aGown.

const v1aGownM = { x: lx(1) + 610, y: 925, hw: 300, base: 1840, col: C.blue2, snow: 110, seed: 7400, eyeY: 50, es: 1.0 };
const v1aGownCX = lx(1) + 300, v1aGownHem = 1750;
const v1aGownH0 = { y: 1195, s: .5 }, v1aGownH1 = { y: 912, s: .56 };

// Camera: pull out while she grows so the whole gown fits, hold, then the stock truck to lancet 2.
// Only the three keys strictly inside 33.4-44.5 change; the edge keys (33.2, 44.5) are untouched.
// V1CAM is defined by v1-main.js, which loads after this file, so this runs once on the scene's first call
// (v1-main builds the floor pool at load, before any frame is rendered).
let v1aGownCamDone = false;
function v1aGownCam() {
  if (v1aGownCamDone) return; v1aGownCamDone = true;
  const k = V1CAM.findIndex((c) => c[0] === 36.4);
  if (k < 0 || V1CAM[k + 1][0] !== 37.8 || V1CAM[k + 2][0] !== 41.6) return;
  V1CAM[k].splice(0, 4, 35.0, 1450, 1255, 1.08);
  V1CAM[k + 1].splice(0, 4, 37.6, 1450, 1250, 1.1);
  V1CAM[k + 2].splice(0, 4, 41.6, 1460, 1260, 1.08);
}

// The gown's neckline sits just under her gold collar (drawWomanV1 local y), so she wears it.
const v1aGownNECK = 162;

// Growth 0..1 (a small settle after V1.high).
function v1aGownU(t) {
  const u = ease(t, V1.l2, V1.high), d = t - V1.high;
  return u + (d > 0 ? .035 * Math.sin(d * 9) * Math.exp(-d * 4) : 0);
}
// Profile helper: piecewise-linear lookup.
function v1aGownPL(xs, ys, x) {
  if (x <= xs[0]) return ys[0];
  for (let k = 1; k < xs.length; k++) if (x <= xs[k]) return lerp(ys[k - 1], ys[k], (x - xs[k - 1]) / (xs[k] - xs[k - 1]));
  return ys[ys.length - 1];
}
// Gown geometry at growth u: v runs 0 (neckline) to 1 (hem); s runs -1 (left edge) to 1 (right edge).
function v1aGownGeo(u) {
  const hy = lerp(v1aGownH0.y, v1aGownH1.y, u), hs = lerp(v1aGownH0.s, v1aGownH1.s, u);
  const top1 = v1aGownH1.y + v1aGownNECK * v1aGownH1.s;
  const y0 = (v) => v1aGownH0.y + (v1aGownNECK + v * (1330 - v1aGownNECK)) * v1aGownH0.s; // her mantle, as drawn by drawWomanV1
  const w0 = (v) => v1aGownPL([140, 170, 300, 700, 1100, 1330], [70, 140, 188, 206, 232, 252], v1aGownNECK + v * (1330 - v1aGownNECK)) * v1aGownH0.s;
  const y1 = (v) => lerp(top1, v1aGownHem, v);
  const w1 = (v) => v1aGownPL([0, .06, .14, .3, .55, .8, 1], [42, 66, 90, 135, 200, 258, 292], v);
  const y = (v) => lerp(y0(v), y1(v), u), w = (v) => lerp(w0(v), w1(v), u);
  return { u, hy, hs, y, w, P: (s, v) => [v1aGownCX + s * w(v), y(v)] };
}

// Patterns: 0 mountain rock, 1 autumn forest, 2 striped strata, 3 starry night, 4 polka-dot snow, 5 alpine meadow.
const v1aGownPAT = [
  { rows: 6, c0: 2, ck: .7, jit: .22, cols: [[104, 96, 160], [86, 82, 146], [120, 112, 172], [74, 70, 132]] },
  { rows: 5, c0: 2, ck: .9, jit: .3, cols: [C.amber, C.ruby, C.gold, [190, 84, 24], [150, 60, 24]] },
  { rows: 8, c0: 1, ck: .3, jit: .05, cols: [C.sand2, C.sand3, [176, 84, 50], [214, 170, 96], [140, 70, 48], [196, 124, 64]] },
  { rows: 5, c0: 2, ck: .8, jit: .25, cols: [C.night, [22, 34, 92], C.blue2, [30, 26, 80]] },
  { rows: 5, c0: 2, ck: .8, jit: .12, cols: [C.white, [206, 224, 240], [236, 238, 244]] },
  { rows: 5, c0: 2, ck: .8, jit: .25, cols: [C.green, C.green2, [40, 140, 70], [30, 110, 56]] },
];
const v1aGownFLIPS = [[V1.which, 1], [V1.which + .175, 2], [V1.which + .35, 3], [V1.which + .525, 4], [V1.dress, 5]];
function v1aGownPat(t) { let p = 0, t0 = -1; for (const [ft, k] of v1aGownFLIPS) if (t >= ft) { p = k; t0 = ft; } return [p, t0]; }

// The pane grid for a pattern: rows, each split into columns with seeded (fixed) lead jitter.
function v1aGownGrid(p) {
  const P = v1aGownPAT[p], rows = [];
  for (let j = 0; j < P.rows; j++) {
    const a = j ? j / P.rows + (rnd(p, j, 71) - .5) * .04 : 0, b = j + 1 < P.rows ? (j + 1) / P.rows + (rnd(p, j + 1, 71) - .5) * .04 : 1;
    const n = Math.max(1, Math.round(P.c0 + j * P.ck * (6 / P.rows))), st = [], sb = [];
    for (let i = 0; i <= n; i++) {
      const base = -1 + 2 * i / n, edge = i === 0 || i === n;
      st.push(edge ? base : base + (rnd(p, j, i * 3 + 1) - .5) * P.jit * 2 / n);
      sb.push(edge ? base : base + (rnd(p, j, i * 3 + 2) - .5) * P.jit * 2 / n);
    }
    rows.push({ a, b, st, sb });
  }
  return rows;
}
const v1aGownGRIDS = v1aGownPAT.map((_, p) => v1aGownGrid(p));

// One pane: left and right edges sampled so the outer edges follow the gown's outline.
function v1aGownPanePts(G, R, i) {
  const pts = [];
  for (let k = 0; k <= 4; k++) { const f = k / 4; pts.push(G.P(lerp(R.st[i], R.sb[i], f), lerp(R.a, R.b, f))); }
  for (let k = 4; k >= 0; k--) { const f = k / 4; pts.push(G.P(lerp(R.st[i + 1], R.sb[i + 1], f), lerp(R.a, R.b, f))); }
  return pts;
}
function v1aGownStar(x, y, r) { const pts = []; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 - Math.PI / 2, rr = k % 2 ? r * .4 : r; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } return polyPath(pts); }

// Motifs drawn inside each pane (small leaded pieces or grisaille), per pattern.
function v1aGownMotif(g, p, x, y, sz, seed, j, rowN) {
  const r = rnd(seed, 5);
  if (p === 0) { // rock: grisaille ridge strokes
    paint(g, 3.5, .4); g.beginPath(); g.moveTo(x - sz * .7, y + sz * .4); g.lineTo(x - sz * .1, y - sz * .3); g.lineTo(x + sz * .5, y + sz * .2); g.stroke();
  } else if (p === 1) { // autumn forest: a round tree on a trunk
    const tr = sz * .42;
    paint(g, 5, .7); g.beginPath(); g.moveTo(x, y + tr * .4); g.lineTo(x, y + tr * 1.5); g.stroke();
    pane(g, circPath(x, y - tr * .2, tr), [C.gold, [230, 120, 30], C.ruby, [250, 200, 60]][Math.floor(r * 4)], seed + 1, { ew: 6, lw: 5, shade: .25 });
  } else if (p === 2) { // strata: a wavy grisaille line through the band
    paint(g, 3, .45); g.beginPath(); for (let k = 0; k <= 8; k++) { const xx = x - sz * 1.6 + k * sz * .4; k ? g.lineTo(xx, y + Math.sin(k * 1.4 + j) * sz * .12) : g.moveTo(xx, y); } g.stroke();
  } else if (p === 3) { // starry night: gold stars in most panes
    if (r < .75) pane(g, v1aGownStar(x + (rnd(seed, 6) - .5) * sz * .5, y, sz * .34), [250, 214, 80], seed + 1, { ew: 5, lw: 4, shade: .15 });
    g.fillStyle = 'rgba(255,240,190,.8)'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + (rnd(seed, k, 7) - .5) * sz * 1.4, y + (rnd(seed, k, 8) - .5) * sz, 2.5, 0, TAU); g.fill(); }
  } else if (p === 4) { // polka-dot snow
    pane(g, circPath(x, y, sz * .28), [C.ruby, C.pink, C.blue, [40, 140, 200]][Math.floor(r * 4)], seed + 1, { ew: 6, lw: 5, shade: .2 });
  } else if (p === 5) { // meadow: a flower of small petal panes round a gold eye
    const fr = sz * .2, fc = r < .5 ? [244, 236, 236] : r < .8 ? C.pink : [190, 150, 230];
    for (let k = 0; k < 5; k++) { const a = k * TAU / 5 + r; pane(g, ellPath(x + Math.cos(a) * fr * 1.1, y + Math.sin(a) * fr * 1.1, fr * .9, fr * .55, a), fc, seed + 2 + k, { ew: 4, lw: 3.5, shade: .15, amt: .4 }); }
    pane(g, circPath(x, y, fr * .6), C.gold, seed + 8, { ew: 4, lw: 3.5, shade: .1 });
  }
}

// The gown: pattern panes, snow shoulders, pine trim, outline lead, and the flash of a change.
function v1aGownDraw(g, G, t) {
  const u = clamp(G.u), [p, ft] = v1aGownPat(t), grid = v1aGownGRIDS[p], P = v1aGownPAT[p];
  const toPat = ease(u, .15, .75);
  const outline = []; for (let k = 0; k <= 24; k++) outline.push(G.P(-1, k / 24)); for (let k = 24; k >= 0; k--) outline.push(G.P(1, k / 24));
  const body = polyPath(outline);
  g.save(); g.clip(body);
  for (let j = 0; j < grid.length; j++) {
    const R = grid[j];
    for (let i = 0; i < R.st.length - 1; i++) {
      const seed = 7000 + p * 500 + j * 40 + i, sc = (R.st[i] + R.st[i + 1] + R.sb[i] + R.sb[i + 1]) / 4;
      let col = p === 2 ? P.cols[j % P.cols.length] : P.cols[Math.floor(rnd(seed, 3) * P.cols.length)];
      if (p === 0 && toPat < 1) col = mix(Math.abs(sc) < .5 ? C.gold : C.blue, col, toPat); // her dress and mantle turning to rock
      pane(g, polyPath(v1aGownPanePts(G, R, i)), col, seed, { ew: 26, shade: .32, lw: 8 });
      if ((p !== 0 || toPat > .6) && (j < grid.length - 1 || p === 2)) { // the bottom row is left to the pine trim
        const vc = (R.a + R.b) / 2, [x, y] = G.P(sc, vc), hgt = G.y(R.b) - G.y(R.a), wid = G.w(vc) * 2 / (R.st.length - 1);
        g.save(); if (p === 0) g.globalAlpha = lin(toPat, .6, 1);
        v1aGownMotif(g, p, x, y, Math.min(hgt, wid) * .5, seed, j, grid.length);
        g.restore();
      }
    }
  }
  if (p === 3) { // a crescent moon on the starry gown
    const [mx, my] = G.P(.4, .42), r = G.w(.42) * .17, pts = [];
    for (let k = 0; k <= 12; k++) { const a = lerp(-2.2, 2.2, k / 12); pts.push([mx + Math.cos(a) * r, my + Math.sin(a) * r]); }
    for (let k = 12; k >= 0; k--) { const a = lerp(-2.2, 2.2, k / 12); pts.push([mx - r * .35 + Math.cos(a) * r * .8, my + Math.sin(a) * r * .86]); }
    pane(g, polyPath(pts), [250, 230, 150], 7990, { ew: 8, lw: 5, shade: .15 });
  }
  // pine trim along the hem: trees sprout as the gown finishes growing
  const ph = ease(u, .55, 1);
  if (ph > 0) {
    const n = 9, wb = G.w(1), base = G.y(1) - 2;
    for (let k = 0; k < n; k++) {
      const x = G.P(-.92 + 1.84 * (k + .5) / n, 1)[0], wd = wb * 2 / n * .78, h = 92 * ph * (.85 + .3 * rnd(k, 61));
      pane(g, polyPath([[x - 5, base], [x + 5, base], [x + 5, base - h * .2], [x - 5, base - h * .2]]), C.brown, 7900 + k, { ew: 4, lw: 4, shade: .2 });
      pane(g, polyPath([[x - wd / 2, base - h * .18], [x + wd / 2, base - h * .18], [x, base - h * .75]]), [22, 96, 54], 7910 + k, { ew: 10, lw: 6, shade: .3 });
      pane(g, polyPath([[x - wd * .36, base - h * .5], [x + wd * .36, base - h * .5], [x, base - h]]), [30, 112, 60], 7920 + k, { ew: 8, lw: 6, shade: .3 });
    }
  }
  g.restore();
  // snowfields on her shoulders: they creep down from the neck as she grows, and puff on V1.dress
  const vs = .12 * ease(u, .3, 1);
  if (vs > .01) {
    const pf = lin(t, V1.dress, V1.dress + .55), puff = pf > 0 && pf < 1 ? Math.sin(Math.PI * pf) * (1 - pf * .4) : 0;
    const [nx, ny] = G.P(0, 0);
    g.save(); g.translate(nx, ny); g.scale(1 + .28 * puff, 1 + .16 * puff); g.translate(-nx, -ny);
    for (const side of [-1, 1]) {
      const pts = [G.P(0, 0), G.P(side, 0)];
      for (let k = 1; k <= 4; k++) pts.push(G.P(side, vs * k / 4));
      for (let k = 6; k >= 0; k--) { const s = side * k / 6, dv = (k % 2 ? .05 : -.015) * (vs / .12); pts.push(G.P(s, vs + (k === 6 ? 0 : dv))); }
      pane(g, polyPath(pts), C.white, 7950 + side, { ew: 14, amt: .4, lw: 7, shade: .22 });
    }
    g.restore();
  }
  lead(g, body, 10);
  // a glint on every change of pattern
  if (ft > 0 && t - ft < .14) { g.save(); g.clip(body); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,250,220,${.55 * (1 - (t - ft) / .14)})`; g.fill(body); g.restore(); }
}

function sceneV1AltGown(g, t, view) {
  v1aGownCam();
  v1Upper(g, 1, t, view, [128, 40, 70], [C.blue2, C.gold, C.ruby]);
  for (const P of V1_SKY[1]) fpane(g, P, mix([110, 168, 224], [206, 228, 246], P.light * .5), t, { ew: 26 });
  v1Clouds(g, 1, t, [[200, 795, 160, 6, 7450], [650, 1130, 120, 4, 7451]]);
  const u = v1aGownU(t);
  // the real mountain: watches her grow, then glances at her sideways during the backing phrases
  const side = (a, b) => ease(t, a, a + .3) * (1 - ease(t, b, b + .3));
  const look = t < V1.l2 ? 0 : t < V1.high + .4 ? -1 * ease(t, V1.l2, V1.l2 + .3) : -(side(V1.bk3 + .3, V1.bk3 + 1.7) + side(V1.bk4 + .4, V1.bk4 + 1.6));
  const wide = Math.max(ease(t, V1.l2 + .2, V1.high) * (1 - ease(t, V1.high + .6, V1.high + 1.2)), ease(t, V1.dress, V1.dress + .15) * (1 - ease(t, V1.dress + .7, V1.dress + 1.2)));
  v1Mountain(g, v1aGownM, t, { look, wide });
  v1Ground(g, 1, 1755, [60, 128, 54], 7460);
  // she sways a little through the backing and is still again before bk4 ends
  const sway = .02 * Math.sin((t - V1.dress) * 2.3) * ease(t, V1.dress + .2, V1.bk3 + .4) * (1 - ease(t, V1.bk4 + 1.6, V1.bk4 + 2.5));
  const G = v1aGownGeo(u);
  g.save(); g.translate(v1aGownCX, G.y(1)); g.rotate(sway); g.translate(-v1aGownCX, -G.y(1));
  const glance = ease(t, V1.high + .1, V1.high + .4) * (1 - ease(t, V1.high + 1.3, V1.high + 1.6));
  const her = () => { g.save(); g.translate(v1aGownCX, G.hy); g.scale(G.hs, G.hs);
    drawWomanV1(g, { dress: C.gold, mantle: C.blue, seed: 7470, mouth: v1Mouth(t), look: glance,
      hands: [[-110, 520, .4], [110, 520, .4]], elbows: [[-196, 420], [196, 420]] }); g.restore(); };
  if (u <= .001) her();
  else {
    v1aGownDraw(g, G, t);
    const L = (x, y) => [v1aGownCX + x * G.hs, G.hy + y * G.hs], top = G.y(0);
    // her head, neck and gold collar on the summit: everything above the shoulders, and the collar band
    // down to the neckline (the mantle and dress below go under the gown's glass)
    g.save(); const cl = new Path2D(); const [ax] = L(-74, 0), [bx] = L(74, 0);
    cl.rect(v1aGownCX - 600, 0, 1200, L(0, 112)[1]); cl.rect(ax, 0, bx - ax, top); g.clip(cl); her(); g.restore();
    // early in the growth her sleeves and folded hands stay on, then merge into the slopes
    const arms = 1 - ease(u, .1, .38);
    if (arms > 0) {
      const ac = new Path2D();
      for (const sd of [-1, 1]) { // tube round each sleeve (same joints as drawWomanV1's), plus the hand
        ac.addPath(smoothPath(limbPts([[sd * 132, 180], [sd * 196, 420], [sd * 118, 516]], [112, 104, 84]), true));
        ac.addPath(circPath(sd * 112, 520, 50));
      }
      g.save(); g.globalAlpha = arms; g.translate(v1aGownCX, G.hy); g.scale(G.hs, G.hs); g.clip(ac); g.scale(1 / G.hs, 1 / G.hs); g.translate(-v1aGownCX, -G.hy); her(); g.restore();
    }
    // her hair falls over the snow on her shoulders and ends in a curve
    g.save(); g.translate(v1aGownCX, G.hy); g.scale(G.hs, G.hs);
    for (const sd of [-1, 1]) {
      const lock = smoothPath([[sd * 50, 104], [sd * 78, 96], [sd * 100, 128], [sd * 108, 190], [sd * 98, 234], [sd * 74, 244], [sd * 64, 214], [sd * 60, 160]]);
      pane(g, lock, C.hair, 7480 + sd, { ew: 18, amt: .5 });
      paint(g, 3, .45); g.beginPath(); g.moveTo(sd * 70, 120); g.quadraticCurveTo(sd * 88, 170, sd * 78, 226); g.stroke();
    }
    g.restore();
  }
  g.restore();
}

V1SCENES[1] = sceneV1AltGown;
