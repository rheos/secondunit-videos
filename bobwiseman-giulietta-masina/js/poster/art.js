// The painted sheets. Each is painted once at load with seeded brush strokes.
// Sheet units = world px; canvases are RES x.
const gauss = (d, s) => Math.exp(-(d * d) / (2 * s * s));
function rotV(v, a) { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]; }
const CPU = { willReadFrequently: true };
function polyPathA(pts) { const P = new Path2D(); pts.forEach(([x, y], i) => i ? P.lineTo(x, y) : P.moveTo(x, y)); P.closePath(); return P; }
function sheetCanvas(w, h, res = RES) { const c = mkCanvas(Math.ceil(w * res), Math.ceil(h * res)), g = c.getContext('2d', CPU); g.scale(res, res); return [c, g]; }

// flat poster background: big loose strokes in a narrow band of one colour
function paintFlat(g, x0, y0, x1, y1, col, R, o = {}) {
  const pts = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  g.fillStyle = rgb(col); g.fillRect(x0, y0, x1 - x0, y1 - y0);
  const step = o.step ?? 22, var_ = o.var ?? 12, ang = o.ang ?? -.35;
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  for (let y = y0 - step; y < y1 + step; y += step * .8) for (let x = x0 - step; x < x1 + step; x += step * 1.4) {
    const k = (o.grad ? o.grad(x, y) : 0), c = [col[0] + k * 30 + (R() - .5) * var_, col[1] + k * 30 + (R() - .5) * var_, col[2] + k * 30 + (R() - .5) * var_];
    dab(g, x + R() * step, y + R() * step, ang + (R() - .5) * .5, step * (2.2 + R() * 2), step * (.8 + R() * .5), (o.colAt ? o.colAt(x, y, c) : c), R, { dry: .3, jit: 8 });
  }
  g.restore();
}

// ---------------- faces ----------------
// her: round face, big eyes, high thin brows, short dark curls, a small crooked smile.
// man: wider jaw, squinting smiling eyes, a big grin, a hat on.
function paintFace(g, f) {
  const { r, R } = f, her = f.kind === 'her', turn = f.turn || 0;
  g.save(); g.translate(f.x, f.y); g.rotate(f.tilt || 0);
  const Ll = rotV(LIGHT, -(f.tilt || 0)), ramp_ = her ? SKIN : SKIN_M;
  const rx = r * (her ? .8 : .8), ry = r, fx = turn * r * .12;
  const skin = (d) => ramp(ramp_, d);
  // neck (in the face's shadow)
  if (f.neck !== false) {
    const nk = [[-.3 * r, .55 * r], [.3 * r, .55 * r], [.36 * r, 1.45 * r], [-.36 * r, 1.45 * r]];
    paintArea(g, nk, { R: mulberry(990 + Math.round(r)), base: skin(.25), shade: (x, y) => skin(clamp(.18 + .35 * (-x / r) * -1 * -1 + (y > r * .95 ? .15 : 0) - (x / r) * .3, .05, .6)), dir: () => Math.PI / 2, step: r * .07, len: r * .25, w: r * .09, edge: false });
  }
  const outline = ellipsePts(fx * .3, 0, rx, ry, 48, 0, (x, y) => { if (y > 0) { const k = y / ry; x *= 1 - (her ? .26 : .12) * k * k; } return [x, y * 1.02]; });
  const eyes = [[-.33 * r + fx, -.04 * r], [.33 * r + fx, -.04 * r]];
  const shade = (x, y) => {
    let d = ellShade(x, y, fx * .5, -r * .08, rx * 1.08, ry * 1.08, Ll);
    for (const [ex, ey] of eyes) d -= .1 * gauss(Math.hypot(x - ex, (y - ey - .03 * r) * 1.3), .13 * r);
    d -= .12 * gauss(Math.hypot(x - fx * 1.1, y - .66 * r), .1 * r); // under the lip
    d = Math.floor(d * 6) / 6 + smooth((d * 6 % 1 - .65) / .35) / 6; // soft-stepped planes, gouache-style
    let c = skin(d);
    const bl = her ? .42 : .25;
    for (const s of [-1, 1]) c = mix(c, hex('#e0706a'), bl * gauss(Math.hypot(x - (s * .42 * r + fx), y - .28 * r), .15 * r) * (her ? 1 : .8));
    if (!her && y > .4 * r) c = mix(c, hex('#7a5a5a'), .12 * clamp((y - .4 * r) / (.5 * r))); // stubble shadow
    return c;
  };
  paintArea(g, outline, { R, base: skin(.5), shade, dir: (x, y) => Math.atan2(y / ry, x / rx) + Math.PI / 2, step: r * .045, len: r * .2, w: r * .075, dry: .1, edgeW: r * .035, edgeStep: r * .07, edgeDry: .4 });
  // soft cool shadow along the far (night) side, a thin warm reflected light at the jaw
  for (let i = 0; i < 26; i++) { const a = -.9 + i / 25 * 2.0; dab(g, Math.cos(a) * rx * .9 + fx * .3, Math.sin(a) * ry * .92, a + Math.PI / 2, r * .22, r * .06, mix(hex('#6d6390'), hex('#9a6c86'), R()), R, { alpha: .35, dry: .4 }); }
  if (!her) for (const s of [-1, 1]) { // ears
    const ex = s * rx * .98 + fx * .2, ear = ellipsePts(ex, .02 * r, .12 * r, .2 * r, 14);
    paintArea(g, ear, { R, base: skin(s < 0 ? .5 : .22), shade: (x) => skin(s < 0 ? .45 + (ex - x) / r : .2), step: r * .04, len: r * .1, w: r * .05, edgeW: r * .025, edgeStep: r * .05 });
  }
  // eyes
  for (let k = 0; k < 2; k++) {
    const [ex, ey] = eyes[k], far = (k === 1 && turn > 0) || (k === 0 && turn < 0), sc = far ? 1 - Math.abs(turn) * .25 : 1;
    if (her) paintEyeBig(g, ex, ey, r * .3 * sc, r * .2, f.gaze || [0, 0], R, k, f.wet);
    else paintEyeSmile(g, ex, ey, r * .24 * sc, r, R, k);
    // brows
    const s = k ? 1 : -1, bi = ex - s * r * .12, bo = ex + s * r * .16;
    if (her) brushLine(g, quadPts(bi, ey - .29 * r, bo, ey - .25 * r, (k ? -1 : 1) * .08 * r, 10), r * .035, hex('#3a2622'), R, { dry: .3 });
    else brushLine(g, quadPts(bi, ey - .2 * r, bo, ey - .24 * r, (k ? 1 : -1) * .05 * r, 8), r * .07, hex('#2a1e1c'), R, { dry: .25 });
  }
  // nose
  const nx = fx * 1.2;
  if (her) {
    brushLine(g, quadPts(nx + .05 * r, -.02 * r, nx + .08 * r, .22 * r, -.03 * r, 8), r * .03, hex('#c07a64'), R, { alpha: .5, dry: .5 });
    brushLine(g, quadPts(nx - .07 * r, .29 * r, nx + .08 * r, .29 * r, .03 * r, 8), r * .03, hex('#b0645a'), R, { alpha: .45, dry: .5 }); // under the nose
    dab(g, nx - .015 * r, .21 * r, 0, r * .04, r * .025, hex('#ffe6d2'), R, { alpha: .5 });
    for (const s of [-1, 1]) dab(g, nx + s * .05 * r, .27 * r, s * .4, r * .035, r * .02, hex('#94504a'), R, { alpha: .7 });
  } else {
    brushLine(g, quadPts(nx + .07 * r, -.05 * r, nx + .13 * r, .3 * r, -.06 * r, 8), r * .06, hex('#94584a'), R, { alpha: .7, dry: .4 });
    paintArea(g, ellipsePts(nx, .3 * r, .14 * r, .09 * r, 14), { R, base: skin(.55), shade: (x, y) => skin(.75 - (x - nx) / r * 2), step: r * .03, len: r * .08, w: r * .04, edgeW: r * .02, edgeStep: r * .04 });
    for (const s of [-1, 1]) dab(g, nx + s * .07 * r, .36 * r, s * .4, r * .06, r * .03, hex('#6e3a34'), R, { alpha: .8 });
  }
  // mouth
  const mx = fx * 1.1, my = (her ? .55 : .58) * r;
  if (her) paintMouthCrooked(g, mx, my, r, R, f.smile ?? 1);
  else paintGrin(g, mx, my, r, R, f.mustache);
  // hair
  if (her) paintCurls(g, r, rx, R, fx);
  g.restore();
}

function paintEyeBig(g, ex, ey, ew, eh, gaze, R, k, wet) {
  const up = [], lo = [], n = 14;
  for (let i = 0; i <= n; i++) { const u = i / n, x = ex - ew / 2 + ew * u, s = Math.pow(Math.sin(Math.PI * u), .75); up.push([x, ey - eh * .62 * s - (k ? -1 : 1) * 0 ]); lo.push([x, ey + eh * .4 * s]); }
  const shape = [...up, ...lo.slice(1, -1).reverse()];
  paintArea(g, shape, { R, base: hex('#ece3da'), shade: (x, y) => mix(hex('#f4ede6'), hex('#a9a3bf'), clamp((ey - eh * .2 - y) / (eh * .5)) * .6 + .1), dir: () => 0, step: ew * .07, len: ew * .25, w: ew * .08, edge: false });
  // iris + pupil, clipped to the eye
  g.save(); g.clip(smoothPath(shape));
  const ix = ex + gaze[0] * ew * .17, iy = ey - eh * .08 + gaze[1] * eh * .15, ir = eh * .5;
  paintArea(g, ellipsePts(ix, iy, ir, ir, 24), { R, base: hex('#4a2c20'), shade: (x, y) => mix(hex('#2c1a16'), hex('#8a5a36'), clamp((y - iy + ir * .2) / (ir * 1.3)) * .9), dir: (x, y) => Math.atan2(y - iy, x - ix), step: ir * .18, len: ir * .45, w: ir * .14, edge: false });
  g.fillStyle = '#140c0c'; g.beginPath(); g.arc(ix, iy, ir * .48, 0, TAU); g.fill();
  // upper lid shadow on the eyeball
  for (let i = 0; i < 10; i++) { const u = .1 + i / 10 * .8, x = ex - ew / 2 + ew * u; dab(g, x, ey - eh * .5 * Math.sin(Math.PI * u) + eh * .12, 0, ew * .18, eh * .2, hex('#4a3a50'), R, { alpha: .35 }); }
  g.restore();
  // catchlights: the lamp
  g.fillStyle = 'rgba(255,252,240,.95)'; g.beginPath(); g.ellipse(ix - ir * .35, iy - ir * .38, ir * .2, ir * .16, -.4, 0, TAU); g.fill();
  g.beginPath(); g.arc(ix + ir * .38, iy + ir * .3, ir * .08, 0, TAU); g.fill();
  if (wet) brushLine(g, lo.slice(3, -3).map(([x, y]) => [x, y - eh * .06]), ew * .03, hex('#f6fbff'), R, { alpha: .8, dry: .4 });
  // lid lines: heavy upper (thick-thin), a crease, soft lower, a few lashes
  const s = k ? 1 : -1;
  brushLine(g, [...up.slice(1), [ex + s * ew * .58, ey - eh * .25 * 1]].sort((a, b) => s * (a[0] - b[0])).reverse(), ew * .075, hex('#25171a'), R, { dry: .2 });
  brushLine(g, up.slice(2, -2).map(([x, y]) => [x, y - eh * .38]), ew * .03, hex('#9a5e54'), R, { alpha: .7, dry: .5 });
  brushLine(g, lo.slice(2, -1), ew * .025, hex('#7a4a44'), R, { alpha: .6, dry: .6 });
  for (let i = 0; i < 4; i++) { const u = .55 + i * .12, idx = Math.round((k ? u : 1 - u) * n), [x, y] = up[idx]; brushLine(g, quadPts(x, y, x + s * ew * .08, y - eh * .22, -s * ew * .03, 4), ew * .025, hex('#25171a'), R, { dry: .1 }); }
}
function paintEyeSmile(g, ex, ey, ew, r, R, k) {
  // squinting, crinkled: a dark arc, a hint of iris under it, crow's feet
  const s = k ? 1 : -1;
  brushLine(g, quadPts(ex - ew / 2, ey + ew * .05, ex + ew / 2, ey + ew * .05, ew * .28, 10), ew * .12, hex('#2a1a18'), R, { dry: .15 });
  dab(g, ex + s * ew * .05, ey + ew * .1, 0, ew * .35, ew * .1, hex('#3a2420'), R, { alpha: .9 });
  brushLine(g, quadPts(ex - ew * .4, ey + ew * .3, ex + ew * .4, ey + ew * .3, -ew * .12, 8), ew * .05, hex('#a0604e'), R, { alpha: .7, dry: .5 });
  for (let i = 0; i < 3; i++) brushLine(g, quadPts(ex + s * ew * .55, ey + (i - 1) * ew * .14, ex + s * ew * .78, ey + (i - 1) * ew * .2, 0, 4), ew * .035, hex('#8a5048'), R, { alpha: .6, dry: .5 });
}
function paintMouthCrooked(g, mx, my, r, R, smile) {
  const w = .2 * r, lc = [mx - w, my + .015 * r], rc = [mx + w * 1.05, my - .055 * r * smile];
  const part = quadPts(lc[0], lc[1], rc[0], rc[1], .045 * r * smile, 12);
  const top = [lc, [mx - w * .5, my - .045 * r], [mx - w * .15, my - .07 * r], [mx + .01 * r, my - .05 * r], [mx + w * .25, my - .08 * r], [mx + w * .7, my - .07 * r], rc];
  const bot = quadPts(rc[0], rc[1], lc[0], lc[1], -.11 * r, 12);
  paintArea(g, [...top, ...part.slice(1, -1).reverse()], { R, base: hex('#b64a52'), shade: (x) => mix(hex('#c2545a'), hex('#8e3442'), clamp((x - mx) / (w * 2) + .3)), dir: () => 0, step: r * .025, len: r * .07, w: r * .03, edgeW: r * .018, edgeStep: r * .035 });
  paintArea(g, [...part, ...bot.slice(1, -1)], { R, base: hex('#d4686a'), shade: (x, y) => mix(hex('#e88a84'), hex('#a8464e'), clamp((x - mx) / (w * 2) + .35 + (y - my) / r)), dir: () => 0, step: r * .025, len: r * .07, w: r * .03, edgeW: r * .018, edgeStep: r * .035 });
  brushLine(g, part, r * .018, hex('#6a2028'), R, { dry: .25 });
  dab(g, mx - w * .2, my + .022 * r, 0, r * .06, r * .018, hex('#f5b0a4'), R, { alpha: .7 }); // lip shine
  brushLine(g, quadPts(rc[0] + .01 * r, rc[1] - .02 * r, rc[0] + .04 * r, rc[1] + .03 * r, .01 * r, 4), r * .015, hex('#a85a50'), R, { alpha: .7 }); // dimple
}
function paintGrin(g, mx, my, r, R, mustache) {
  const w = .4 * r, top = quadPts(mx - w, my - .07 * r, mx + w, my - .09 * r, .1 * r, 14), bot = quadPts(mx + w, my - .09 * r, mx - w, my - .07 * r, -.34 * r, 14);
  const shape = [...top, ...bot.slice(1, -1)];
  paintArea(g, shape, { R, base: hex('#3a1418'), shade: () => hex('#4a161c'), step: r * .03, len: r * .06, w: r * .03, edge: false });
  // teeth band
  g.save(); g.clip(smoothPath(shape));
  const tb = quadPts(mx - w, my + .0 * r, mx + w, my - .02 * r, -.07 * r, 14);
  bstroke(g, tb, r * .14, hex('#f2ead8'), R, { dry: .05, jit: 6, taper: false });
  for (let i = -3; i <= 3; i++) brushLine(g, [[mx + i * w * .27, my - .06 * r], [mx + i * w * .25, my + .06 * r]], r * .01, hex('#b0a890'), R, { alpha: .6 });
  g.restore();
  brushLine(g, top, r * .03, hex('#5a2226'), R, { dry: .2 });
  brushLine(g, bot.slice(3, -3), r * .025, hex('#8a3a38'), R, { dry: .4, alpha: .7 });
  for (const s of [-1, 1]) brushLine(g, quadPts(mx + s * w, my - .05 * r, mx + s * (w + .07 * r), my - .16 * r, 0, 4), r * .025, hex('#8a4a40'), R, { alpha: .7 });
  if (mustache) { const m = [[mx - w * .9, my - .1 * r], [mx, my - .2 * r], [mx + w * .9, my - .12 * r]]; brushLine(g, quadPts(mx - w * .85, my - .09 * r, mx, my - .17 * r, .03 * r, 6), r * .07, hex('#2a1a16'), R); brushLine(g, quadPts(mx, my - .17 * r, mx + w * .85, my - .1 * r, .03 * r, 6), r * .07, hex('#2a1a16'), R); }
}
function paintCurls(g, r, rx, R, fx) {
  // outer silhouette: curly bumps over the crown; inner: a curly fringe and the sides down to the jaw
  const outer = [], inner = [];
  for (let i = 0; i <= 30; i++) { const a = Math.PI * .9 + i / 30 * Math.PI * 1.2, b = 1 + .06 * Math.abs(Math.sin(i * 1.7 + .5)) + .025 * R();
    outer.push([Math.cos(a) * rx * 1.1 * b + fx * .2, Math.sin(a) * r * 1.0 * b - .1 * r]); }
  const fringe = [[rx * .98, .22 * r], [rx * .86, -.2 * r], [rx * .62, -.42 * r], [rx * .4, -.36 * r], [rx * .22, -.5 * r], [.0, -.4 * r], [-rx * .22, -.52 * r], [-rx * .45, -.38 * r], [-rx * .66, -.44 * r], [-rx * .88, -.2 * r], [-rx * .98, .22 * r]];
  for (const [x, y] of fringe) inner.push([x + fx * .3, y]);
  const pts = [...outer, ...inner];
  const hs = (x, y) => ramp([[0, hex('#1e1822')], [.35, hex('#3a2622')], [.6, hex('#5e3a2c')], [.85, hex('#8e5a3a')], [1, hex('#b07850')]], ellShade(x, y, 0, -.35 * r, rx * 1.3, r * 1.2) * 1.05 - .05);
  paintArea(g, pts, { R, base: hex('#2e2020'), shade: hs, dir: (x, y) => Math.atan2(y + .3 * r, x) + Math.PI / 2, step: r * .06, len: r * .14, w: r * .06, wob: 2.5, dry: .2, edgeW: r * .05, edgeStep: r * .07, edgeDry: .3 });
  // curls: clumps of short curved strokes of varying arc and size, lit ones on the lamp side
  const P = smoothPath(pts), m = g.getTransform();
  for (let i = 0; i < 110; i++) {
    const x = (R() - .5) * rx * 2.3, y = -r * 1.15 + R() * r * 1.35;
    if (!g.isPointInPath(P, x * m.a + y * m.c + m.e, x * m.b + y * m.d + m.f)) continue;
    const lit = ellShade(x, y, 0, -.35 * r, rx * 1.3, r * 1.2), c = lit > .62 ? hex('#a26a44') : lit > .38 ? hex('#5e3c2c') : hex('#1a1216');
    const a0 = R() * TAU, rr = r * (.03 + R() * .05), span = 1.4 + R() * 1.8, arc = [];
    for (let j = 0; j <= 7; j++) { const a = a0 + j / 7 * span; arc.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * (.7 + R() * .1)]); }
    bstroke(g, arc, r * (.025 + R() * .025), c, R, { dry: .3, n: 4 });
  }
}

// fedora, local to the head frame (call after the face, same transform)
function paintHat(g, x, y, r, tilt, col, R) {
  g.save(); g.translate(x, y); g.rotate(tilt);
  const Ll = rotV(LIGHT, -tilt), hs = (cx, cy, rx, ry) => (px, py) => ramp([[0, mix(col, [20, 20, 40], .7)], [.5, col], [1, mix(col, [255, 240, 210], .45)]], ellShade(px, py, cx, cy, rx, ry, Ll));
  const brim = ellipsePts(0, -.55 * r, 1.38 * r, .24 * r, 30);
  // back half of the brim then crown then the front lip of the brim
  paintArea(g, brim, { R, base: col, shade: hs(-.2 * r, -.7 * r, 1.4 * r, .5 * r), dir: () => 0, step: r * .06, len: r * .25, w: r * .07, edgeW: r * .04, edgeStep: r * .08 });
  const crown = [[-.82 * r, -.6 * r], [-.78 * r, -1.0 * r], [-.62 * r, -1.28 * r], [-.25 * r, -1.36 * r], [0, -1.24 * r], [.25 * r, -1.36 * r], [.62 * r, -1.28 * r], [.78 * r, -1.0 * r], [.82 * r, -.6 * r], [0, -.52 * r]];
  paintArea(g, crown, { R, base: col, shade: hs(-.1 * r, -.95 * r, .9 * r, .6 * r), dir: () => Math.PI / 2, step: r * .06, len: r * .22, w: r * .07, edgeW: r * .04, edgeStep: r * .08 });
  bstroke(g, quadPts(-.8 * r, -.72 * r, .8 * r, -.72 * r, -.06 * r, 12), r * .16, mix(col, [10, 10, 15], .65), R, { dry: .1, taper: false }); // band
  brushLine(g, quadPts(0, -1.24 * r, 0, -.9 * r, .04 * r, 5), r * .04, mix(col, [10, 10, 20], .5), R, { alpha: .8 }); // the dent
  brushLine(g, quadPts(-1.36 * r, -.52 * r, 1.36 * r, -.52 * r, -.18 * r, 16), r * .05, mix(col, [255, 240, 200], .35), R, { alpha: .6, dry: .5 }); // lit brim lip
  g.restore();
}

function heartPts(cx, cy, s, n = 40) { const p = []; for (let i = 0; i < n; i++) { const t = i / n * TAU; p.push([cx + 16 * Math.pow(Math.sin(t), 3) * s, cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s]); } return p; }
function paintHeart(g, cx, cy, s, R) {
  paintArea(g, heartPts(cx, cy, s), { R, base: hex('#c81e2a'), shade: (x, y) => ramp([[0, hex('#5e0e22')], [.4, hex('#b01828')], [.75, hex('#e43a3a')], [1, hex('#ffb0a0')]], ellShade(x, y, cx, cy - 2 * s, 17 * s, 15 * s)), dir: (x, y) => Math.atan2(y - cy, x - cx) + Math.PI / 2, step: s * 1.6, len: s * 5, w: s * 2, edgeW: s * 1, edgeStep: s * 2.5 });
  dab(g, cx - 7 * s, cy - 6 * s, -.6, s * 5, s * 1.6, hex('#ffd8c8'), R, { alpha: .9 });
}
// a mitten hand: rounded block with a thumb, shaded like skin
function paintMitten(g, x, y, ang, sz, R, skinRamp = SKIN, flip = 1) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(flip, 1);
  const palm = [[-.5 * sz, -.45 * sz], [.35 * sz, -.55 * sz], [.62 * sz, -.2 * sz], [.62 * sz, .25 * sz], [.3 * sz, .5 * sz], [-.5 * sz, .45 * sz]];
  const sh = (px, py) => ramp(skinRamp, ellShade(px, py, 0, 0, .7 * sz, .6 * sz));
  paintArea(g, palm, { R, base: ramp(skinRamp, .5), shade: sh, dir: () => 0, step: sz * .14, len: sz * .4, w: sz * .16, edgeW: sz * .08, edgeStep: sz * .15 });
  const th = [[-.1 * sz, -.4 * sz], [.15 * sz, -.75 * sz], [.38 * sz, -.78 * sz], [.38 * sz, -.5 * sz]];
  paintArea(g, th, { R, base: ramp(skinRamp, .6), shade: sh, dir: () => -1, step: sz * .12, len: sz * .3, w: sz * .14, edgeW: sz * .07, edgeStep: sz * .12 });
  brushLine(g, quadPts(.05 * sz, -.42 * sz, .4 * sz, -.45 * sz, .05 * sz, 4), sz * .05, hex('#a05a4a'), R, { alpha: .7 });
  g.restore();
}

// ---------------- the night wall ----------------
const WORLD = { w: 2400, h: 1500 };
function buildWall() {
  const res = 1, [c, g] = sheetCanvas(WORLD.w, WORLD.h, res), R = mulberry(601);
  paintFlat(g, 0, 0, WORLD.w, WORLD.h, hex('#5e524c'), R, { step: 64, var: 18, grad: (x, y) => n1(3, x / 300) * .4 + n1(4, y / 200) * .3 });
  // stone courses: big travertine blocks showing where the plaster has gone
  for (let i = 0; i < 26; i++) { const x = R() * WORLD.w, y = R() * WORLD.h, w = 140 + R() * 220, h = 60 + R() * 60;
    paintArea(g, [[x, y], [x + w, y + (R() - .5) * 6], [x + w + (R() - .5) * 8, y + h], [x, y + h]], { R, base: hex('#8e8070'), shade: () => mix(hex('#9a8a78'), hex('#6e6258'), R()), dir: () => 0, step: 24, len: 60, w: 18, edgeCol: hex('#4a403a'), edgeW: 3, edgeStep: 14 }); }
  // water stains running down
  for (let i = 0; i < 40; i++) { const x = R() * WORLD.w, y = R() * WORLD.h * .6; bstroke(g, [[x, y], [x + (R() - .5) * 20, y + 200 + R() * 400]], 20 + R() * 40, hex('#4e463e'), R, { alpha: .25, dry: .6 }); }
  // old poster remnants: rectangular sheets, layers of them, torn edges showing the white paper core
  const cols = ['#b8a47e', '#9a5a44', '#5a7480', '#c8b894', '#84423a', '#b09450', '#62806a', '#d0c4a8', '#7a6a8a'];
  const tornEdge = (x0, y0, x1, y1, torn, n = 14) => { const p = []; for (let i = 0; i < n; i++) { const u = i / n, j = torn ? (R() - .5) * 26 + n1(R() * 50, u * 5) * 18 : (R() - .5) * 2; const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy); p.push([x0 + dx * u - dy / L * j, y0 + dy * u + dx / L * j]); } return p; };
  for (let i = 0; i < 30; i++) {
    const w = 240 + R() * 420, h = 300 + R() * 460, x = 380 + R() * (1640 - w), y = 60 + R() * (1380 - h), col = mix(hex(cols[(R() * cols.length) | 0]), hex('#5a5048'), .45);
    const t = [R() < .5, R() < .5, R() < .6, R() < .5];
    const pts = [...tornEdge(x, y, x + w, y, t[0]), ...tornEdge(x + w, y, x + w, y + h, t[1]), ...tornEdge(x + w, y + h, x, y + h, t[2]), ...tornEdge(x, y + h, x, y, t[3])];
    g.fillStyle = '#b8b0a2'; g.fill(polyPathA(pts.map(([px, py]) => [px + (px - x - w / 2) * .012, py + (py - y - h / 2) * .012])));
    paintArea(g, pts, { R, base: col, shade: () => mix(col, hex('#9a8a78'), R() * .4), dir: () => (R() - .5) * .4, step: 30, len: 90, w: 28, dry: .4, edge: false });
    g.save(); g.clip(polyPathA(pts));
    const kind = R(), sc = mix(hex(cols[(R() * cols.length) | 0]), hex('#8a8070'), .3);
    if (kind < .35) for (let k = 0; k < 12; k++) bstroke(g, [[x + k * w / 6, y - 20], [x + k * w / 6 + w * .2, y + h + 20]], w / 14, sc, R, { alpha: .85, dry: .3 });
    else if (kind < .6) paintArea(g, ellipsePts(x + w * (.2 + R() * .6), y + h * (.3 + R() * .5), w * .45, w * .45, 30), { R, base: sc, shade: () => mix(sc, hex('#9a8a78'), R() * .3), dir: (px, py) => Math.atan2(py - y, px - x), step: 30, len: 80, w: 26, edge: false });
    else if (kind < .8) bstroke(g, [[x - 10, y + h * (.3 + R() * .4)], [x + w + 10, y + h * (.3 + R() * .4)]], h * .22, sc, R, { dry: .2 });
    // paste stains and scraped patches
    for (let k = 0; k < 6; k++) dab(g, x + R() * w, y + R() * h, R() * TAU, 60, 30, hex('#8a7a62'), R, { alpha: .25, dry: .6 });
    g.restore();
    if (R() < .5) { const sx = x + R() * w * .6, sy = y + R() * h * .6, sw = 60 + R() * 120, sh = 40 + R() * 100; // a scraped hole back to the wall
      const hp = [...tornEdge(sx, sy, sx + sw, sy, true, 6), ...tornEdge(sx + sw, sy, sx + sw, sy + sh, true, 6), ...tornEdge(sx + sw, sy + sh, sx, sy + sh, true, 6), ...tornEdge(sx, sy + sh, sx, sy, true, 6)];
      g.fillStyle = '#e6dccb'; g.fill(polyPathA(hp)); g.fillStyle = 'rgb(116,104,94)'; g.fill(polyPathA(hp.map(([px, py]) => [px + (sx + sw / 2 - px) * .06, py + (sy + sh / 2 - py) * .06]))); }
  }
  // grime and scrapes over everything
  for (let i = 0; i < 300; i++) { const x = R() * WORLD.w, y = R() * WORLD.h; dab(g, x, y, R() * TAU, 20 + R() * 60, 4 + R() * 10, hex('#3e3630'), R, { alpha: .18, dry: .7 }); }
  // cracks
  for (let i = 0; i < 18; i++) { let x = R() * WORLD.w, y = R() * WORLD.h; const p = [[x, y]]; for (let k = 0; k < 10; k++) { x += (R() - .5) * 60; y += 20 + R() * 30; p.push([x, y]); } brushLine(g, p, 2.5, hex('#2a2420'), R, { alpha: .7, dry: .5 }); }
  paperize(g, c.width, c.height, .6);
  return c;
}
// per-sheet wrinkle relief (neutral grey 128 = flat; for 'overlay')
function buildWrinkles(w, h, seed, amt = 1) {
  const c = mkCanvas(Math.ceil(w), Math.ceil(h)), g = c.getContext('2d', CPU), R = mulberry(seed);
  g.fillStyle = 'rgb(128,128,128)'; g.fillRect(0, 0, w, h);
  const ridge = (pts, wd, a) => {
    g.lineCap = 'round';
    g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = wd; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x - wd * .4, y - wd * .3) : g.moveTo(x - wd * .4, y - wd * .3)); g.stroke();
    g.strokeStyle = `rgba(0,0,0,${a})`; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + wd * .4, y + wd * .3) : g.moveTo(x + wd * .4, y + wd * .3)); g.stroke();
  };
  g.filter = 'blur(1.2px)';
  for (let i = 0; i < 9 * amt; i++) { const x = R() * w, y = R() * h * .7, p = []; let px = x, py = y; for (let k = 0; k < 6; k++) { p.push([px, py]); px += (R() - .5) * 30; py += 20 + R() * 40; } ridge(p, 2.5 + R() * 3, .35 + R() * .3); }
  for (let i = 0; i < 6 * amt; i++) { const x = R() * w, y = R() * h; ridge(quadPts(x, y, x + (R() - .5) * 140, y + (R() - .5) * 60, (R() - .5) * 20, 8), 1.5 + R() * 2, .3 + R() * .3); }
  // paste bubbles: lit top, shaded bottom
  for (let i = 0; i < 7 * amt; i++) { const x = R() * w, y = R() * h, rx = 15 + R() * 40, ry = 8 + R() * 22, gr = g.createLinearGradient(x, y - ry, x, y + ry);
    gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(.5, 'rgba(128,128,128,0)'); gr.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, (R() - .5) * .6, 0, TAU); g.fill(); }
  g.filter = 'none';
  return c;
}
// glossy wet-paste streaks along brush passes (for 'screen')
function buildSheen(w, h, seed) {
  const c = mkCanvas(Math.ceil(w), Math.ceil(h)), g = c.getContext('2d', CPU), R = mulberry(seed);
  g.filter = 'blur(3px)';
  for (let i = 0; i < 26; i++) { const x = R() * w, y0 = R() * h * .3, gr = g.createLinearGradient(x - 30, 0, x + 30, 0);
    gr.addColorStop(0, 'rgba(255,240,210,0)'); gr.addColorStop(.5, `rgba(255,240,210,${.25 + R() * .35})`); gr.addColorStop(1, 'rgba(255,240,210,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 6 - R() * 20, y0); g.lineTo(x + 6 + R() * 20, y0); g.lineTo(x + 10 + R() * 30, y0 + h * (.4 + R() * .6)); g.lineTo(x - 10 - R() * 30, y0 + h * (.4 + R() * .6)); g.fill(); }
  g.filter = 'none';
  return c;
}
// circus colour under the last tear: big-top stripes radiating, painted
function buildCircus() {
  // big-top canvas under the last tear: straight vertical stripes, bowed a little like tent cloth,
  // in the cream and yellow of the circus look (so the cut at 60.0 is seamless)
  const [c, g] = sheetCanvas(W, H, 1), R = mulberry(701), cream = hex('#f4ead2'), yel = hex('#edd386'), sw = 120;
  const xOff = (y) => 26 * Math.sin(y / H * Math.PI);
  g.fillStyle = rgb(cream); g.fillRect(0, 0, W, H);
  for (let k = -1; k < W / sw + 1; k++) { if (k % 2) continue; const x0 = k * sw, pts = [];
    for (let y = -10; y <= H + 10; y += 30) pts.push([x0 + xOff(y) * (x0 / W - .5) * 2, y]);
    for (let y = H + 10; y >= -10; y -= 30) pts.push([x0 + sw + xOff(y) * ((x0 + sw) / W - .5) * 2, y]);
    g.fillStyle = rgb(yel); g.fill(polyPathA(pts)); }
  for (let y = -20; y < H + 20; y += 26) for (let x = -20; x < W + 20; x += 40) { // canvas brushwork, along the stripes
    const px = x + R() * 30, py = y + R() * 20, k = Math.floor((px - xOff(py) * (px / W - .5) * 2) / sw);
    const col = (k % 2 + 2) % 2 === 0 ? mix(yel, hex('#e4c470'), R()) : mix(cream, hex('#ecdfc0'), R());
    dab(g, px, py, Math.PI / 2, 60 + R() * 40, 18, col, R, { dry: .3, jit: 6, alpha: .7, bend: 0 });
  }
  for (let k = 0; k < W / sw + 1; k++) { const x = k * sw; g.fillStyle = 'rgba(150,110,50,.12)'; g.fillRect(x - 6 + xOff(H / 2) * (x / W - .5) * 2, 0, 12, H); } // the seams' soft folds
  paperize(g, c.width, c.height);
  return c;
}
// the paste-up man's brush: a wide flat brush head on a long pole (head drawn at the origin, pointing up)
function buildBrush() {
  const [c, g] = sheetCanvas(220, 120, 2), R = mulberry(801);
  // bristles: pale with paste-wet tips
  for (let i = 0; i < 70; i++) { const x = 18 + i / 70 * 184; bstroke(g, [[x, 50], [x + (R() - .5) * 6, 112 + R() * 6]], 4, mix(hex('#d8c8a0'), hex('#8a7a5a'), R()), R, { dry: .2, n: 2 }); }
  paintArea(g, [[10, 8], [210, 8], [214, 54], [6, 54]], { R, base: hex('#6a4a2a'), shade: (x, y) => mix(hex('#a07040'), hex('#3a2414'), clamp((y - 8) / 50)), dir: () => 0, step: 6, len: 30, w: 8, edgeW: 3, edgeStep: 8 });
  bstroke(g, [[8, 48], [212, 48]], 8, hex('#9a9aa0'), R, { taper: false }); // ferrule band
  return c;
}
