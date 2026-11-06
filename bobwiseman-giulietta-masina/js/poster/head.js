// v2 heads: three-quarter view, poster-style chiaroscuro.
// The skin is shaded per pixel into a few flat tones with a sharp terminator (lit, half, warm edge,
// deep coloured shadow, reflected light), then gouache texture strokes on top at low alpha and a
// dry-brush pass round the silhouette. Features are drawn crisp over that.
// Local head units: r = 1, origin at the head centre, y down, the face turned to local +x.

const FACE_HER = [[.06, -.92], [.3, -.82], [.47, -.56], [.53, -.3], [.49, -.17], [.55, -.03], [.54, .14], [.5, .3], [.45, .44], [.42, .55], [.34, .7], [.2, .82], [.04, .86], [-.18, .8], [-.42, .6], [-.56, .36], [-.64, .08], [-.66, -.3], [-.54, -.66], [-.28, -.88]];
const FACE_MAN = [[.06, -.9], [.32, -.8], [.5, -.54], [.56, -.3], [.52, -.18], [.6, -.02], [.6, .16], [.56, .32], [.5, .46], [.48, .58], [.42, .74], [.26, .88], [.04, .92], [-.24, .86], [-.48, .66], [-.6, .38], [-.66, .08], [-.66, -.3], [-.54, -.66], [-.28, -.88]];
const PAL_HER = { hi: hex('#ffe6cc'), lit: hex('#f2b088'), half: hex('#e08a68'), warm: hex('#c4483a'), sh: hex('#4a2c5c'), rf: hex('#7a4664'), blush: hex('#ec7a6c') };
const PAL_MAN = { hi: hex('#f8cc94'), lit: hex('#d89462'), half: hex('#bc7048'), warm: hex('#9a3a28'), sh: hex('#261a34'), rf: hex('#5a3446'), blush: hex('#c86450') };

function headXf(F) { const c = Math.cos(F.tilt || 0), s = Math.sin(F.tilt || 0), m = F.facing || 1; return (lx, ly) => { const x = lx * m * F.r, y = ly * F.r; return [F.x + x * c - y * s, F.y + x * s + y * c]; }; }
function headInv(F) { const c = Math.cos(F.tilt || 0), s = Math.sin(F.tilt || 0), m = F.facing || 1; return (X, Y) => { const x = X - F.x, y = Y - F.y; return [(x * c + y * s) / F.r * m, (-x * s + y * c) / F.r]; }; }
const g2 = (x, y, cx, cy, sx, sy) => Math.exp(-((x - cx) ** 2) / (2 * sx * sx) - ((y - cy) ** 2) / (2 * sy * sy));

// light value at a local point (before toning)
function headLight(F, lx, ly, neck) {
  const L = F.L, man = F.kind === 'man';
  let nx, ny, nz;
  if (neck) { nx = (lx - .02) / .36; ny = .15; nz = Math.sqrt(Math.max(0, 1 - nx * nx)); }
  else { nx = (lx + .04) / .66; ny = (ly + .02) / .94; nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny)); nx = nx * .9 + .1; }
  let d = nx * L[0] + ny * L[1] + nz * L[2];
  if (neck) { d -= .5 * clamp((.95 - ly) / .3); return d; } // the chin's cast shadow on the neck
  // eye sockets, the nose planes and its cast shadow, under the lip, under the chin
  d -= .2 * g2(lx, ly, -.12, -.15, .13, .08) + .14 * g2(lx, ly, .36, -.16, .08, .07);
  const ridge = .24 + (ly + .2) * .32;
  if (ly > -.22 && ly < .27 && lx < ridge && lx > ridge - .14 * clamp((ly + .3) / .5)) d = Math.min(d, L[0] > 0 ? .34 : d + .1);
  if (ly > -.2 && ly < .24 && lx >= ridge && lx < ridge + .07) d += L[0] > 0 ? .28 : .05;
  if (L[1] < .3) d -= .28 * g2(lx, ly, .22 - L[0] * .06, .34, .09, .03); // under-nose shadow (key from above)
  else d -= .45 * g2(lx, ly, .28, .2, .07, .1); // lit from below: shadow above the nose wing
  d -= .3 * g2(lx, ly, .22, .62, .1, .03);
  if (L[1] < .3) d -= clamp((ly - .74) * 2.5); else d += .15 * clamp((ly - .5) * 2);
  if (man && L[1] >= .3) d -= .4 * clamp((-.5 - ly) * 4); // the hat brim's shadow across the brow (lit from below it's the forehead that goes dark)
  return d;
}
function headTone(F, d, lx, ly, P, edge) {
  if (d > .64) return P.hi;
  if (d > .42) return P.lit;
  if (d > .28) return P.half;
  if (d > .2) return P.warm;
  return edge ? P.rf : P.sh;
}
function paintHeadSkin(g, F, poly, neck) {
  const P = F.kind === 'man' ? PAL_MAN : PAL_HER, xf = headXf(F), inv = headInv(F), m = g.getTransform();
  const pts = poly.map(([x, y]) => xf(x, y));
  const [x0, y0, x1, y1] = polyBBox(pts), dx0 = Math.floor(x0 * m.a + m.e) - 2, dy0 = Math.floor(y0 * m.d + m.f) - 2;
  const dw = Math.ceil((x1 - x0) * m.a) + 4, dh = Math.ceil((y1 - y0) * m.d) + 4;
  const t = mkCanvas(dw, dh), tg = t.getContext('2d', { willReadFrequently: true });
  tg.setTransform(m.a, 0, 0, m.d, m.e - dx0, m.f - dy0); tg.fillStyle = '#fff'; tg.fill(polyPathA(pts));
  const id = tg.getImageData(0, 0, dw, dh), dd = id.data, sd = (F.seed || 1) * 7.1;
  for (let py = 0; py < dh; py++) for (let px = 0; px < dw; px++) {
    const i = (py * dw + px) * 4; if (!dd[i + 3]) continue;
    const X = (px + dx0 - m.e) / m.a, Y = (py + dy0 - m.f) / m.d, [lx, ly] = inv(X, Y);
    let d = headLight(F, lx, ly, neck) + .035 * n1(sd, lx * 9 + ly * 4) + .02 * n1(sd + 1, ly * 13);
    const edgeSide = !neck && (lx * F.L[0] < 0 ? Math.abs(lx) > .5 : false);
    let c = headTone(F, d, lx, ly, P, edgeSide);
    if (!neck && c !== P.sh && c !== P.rf) c = mix(c, P.blush, .35 * g2(lx, ly, -.2, .2, .13, .1) + .2 * g2(lx, ly, .44, .18, .06, .08));
    dd[i] = c[0]; dd[i + 1] = c[1]; dd[i + 2] = c[2];
  }
  tg.putImageData(id, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(t, dx0, dy0); g.restore();
  // gouache texture: short strokes in the local tone, along the form, light alpha so the planes stay clean
  const R = mulberry((F.seed || 1) * 31 + (neck ? 5 : 0)), step = F.r * .045;
  g.save(); g.clip(polyPathA(pts));
  for (let y = y0; y < y1; y += step) for (let x = x0; x < x1; x += step) {
    const px = x + (R() - .5) * step, py = y + (R() - .5) * step, [lx, ly] = inv(px, py);
    const c = headTone(F, headLight(F, lx, ly, neck), lx, ly, P, false);
    dab(g, px, py, Math.atan2(ly, lx) + Math.PI / 2 + (F.tilt || 0), F.r * .12, F.r * .04, c, R, { alpha: .28, dry: .3, jit: 8 });
  }
  g.restore();
  // dry-brush round the silhouette in the edge tone
  const L = resample(closedLoop(pts), F.r * .05);
  for (const [x, y, an] of L) { const [lx, ly] = inv(x, y); dab(g, x, y, an, F.r * .1, F.r * .022, headTone(F, headLight(F, lx * .96, ly * .96, neck), lx, ly, P, true), R, { dry: .6, jit: 6 }); }
}

function paintHead34(g, F) {
  const xf = headXf(F), R = mulberry((F.seed || 1) * 13 + 3), man = F.kind === 'man', r = F.r, P = man ? PAL_MAN : PAL_HER;
  const X = (pts) => pts.map(([x, y]) => xf(x, y));
  const line = (pts, w, col, o = {}) => brushLine(g, X(pts), w * r, col, R, o);
  if (F.neck !== false) paintHeadSkin(g, F, [[-.28, .5], [.3, .5], [.34, F.neckLen ?? 1.2], [-.36, F.neckLen ?? 1.2]], true);
  if (man) { // ear, behind the cheek
    const ear = [[-.56, -.14], [-.48, -.2], [-.42, -.05], [-.44, .14], [-.52, .2], [-.6, .06]];
    paintArea(g, X(ear), { R, base: P.warm, shade: () => mix(P.warm, P.half, R() * .5), step: r * .04, len: r * .08, w: r * .04, edgeW: r * .02, edgeStep: r * .05 });
  }
  paintHeadSkin(g, F, man ? FACE_MAN : FACE_HER, false);
  // eyes: near (bigger) and far (foreshortened)
  const gz = F.gaze || [.5, 0];
  paintEye34(g, F, xf, -.13, -.13, .27, .15, gz, F.lid ?? 0, R, false);
  paintEye34(g, F, xf, .37, -.14, .15, .13, gz, F.lid ?? 0, R, true);
  // brows: expression from F.brow = [nearInnerLift, farLift]
  const bw = F.brow || [.06, 0], bc = man ? hex('#1e1416') : hex('#2e1c1a');
  line([[-.38, -.27], [-.28, -.33 - bw[0] * .2], [-.14, -.355 - bw[0] * .4], [.02, -.33 - bw[0]]], man ? .06 : .03, bc, { dry: .2 });
  line([[.28, -.33 - bw[1] * .8], [.36, -.355 - bw[1]], [.44, -.35 - bw[1] * .8], [.5, -.31 - bw[1] * .4]], man ? .05 : .025, bc, { dry: .2 });
  // nose: ridge highlight, the wing, nostril, the tip
  const lit = F.L[0] > 0;
  line([[.22, -.16], [.3, .02], [.36, .16]], .022, lit ? P.hi : P.half, { alpha: .9, dry: .3 });
  line([[.38, .16], [.36, .24], [.28, .27]], .03, P.warm, { alpha: .9, dry: .2 });
  line([[.13, .2], [.12, .25], [.18, .29], [.24, .28]], .035, mix(P.sh, P.warm, .4), { dry: .15 });
  { const [nx, ny] = xf(.24, .265); g.fillStyle = rgb(mix(P.sh, [0, 0, 0], .3)); g.beginPath(); g.ellipse(nx, ny, r * .03, r * .016, (F.tilt || 0) + .3 * (F.facing || 1), 0, TAU); g.fill(); }
  { const [tx, ty] = xf(.35, .13); g.fillStyle = rgb(P.hi, .8); g.beginPath(); g.ellipse(tx, ty, r * .03, r * .02, 0, 0, TAU); g.fill(); }
  // mouth
  if (man) paintGrin34(g, F, xf, R); else paintSmile34(g, F, xf, R);
  if (man) line([[.14, .27], [.06, .38], [.02, .5]], .022, P.warm, { alpha: .8, dry: .3 }); // smile fold
  if (F.mustache) { paintArea(g, X([[.02, .37], [.2, .33], [.4, .36], [.42, .41], [.22, .4], [.04, .43]]), { R, base: hex('#1e1416'), shade: () => hex('#2a1c1a'), step: r * .025, len: r * .06, w: r * .025, edgeW: r * .015, edgeStep: r * .03, edgeDry: .7 }); }
  if (!man) paintHair34(g, F, xf, R);
}

function paintEye34(g, F, xf, cx, cy, w, h, gaze, lid, R, far) {
  const man = F.kind === 'man', P = man ? PAL_MAN : PAL_HER, r = F.r, n = 12, up = [], lo = [];
  for (let i = 0; i <= n; i++) { const u = i / n, x = cx - w / 2 + w * u, s = Math.pow(Math.sin(Math.PI * u), .8), sk = (u - .5) * .04;
    up.push([x, cy - h * .58 * s + sk]); lo.push([x, cy + h * .42 * s + sk * .5]); }
  const shape = [...up, ...lo.slice(1, -1).reverse()], S = shape.map(([x, y]) => xf(x, y));
  g.save(); g.fillStyle = rgb(man ? hex('#e8dccc') : hex('#f2e8de')); g.fill(polyPathA(S)); g.clip(polyPathA(S));
  // iris + pupil
  const [ix, iy] = xf(cx + gaze[0] * w * .22, cy + gaze[1] * h * .2), ir = h * .5 * r;
  g.fillStyle = rgb(man ? hex('#3a2418') : hex('#5a3420')); g.beginPath(); g.arc(ix, iy, ir, 0, TAU); g.fill();
  g.fillStyle = rgb(man ? hex('#6a4426') : hex('#9a6036')); g.beginPath(); g.arc(ix, iy + ir * .25, ir * .7, 0, TAU); g.fill();
  g.fillStyle = '#120a0a'; g.beginPath(); g.arc(ix, iy, ir * .45, 0, TAU); g.fill();
  // the upper lid's shadow on the eyeball, and a lowered lid (sly) as skin over the top of the eye
  g.fillStyle = 'rgba(40,24,50,.45)'; g.fill(polyPathA([...up.map(([x, y]) => xf(x, y)), ...up.slice().reverse().map(([x, y]) => xf(x, y + h * .3))]));
  if (lid > 0) { g.fillStyle = rgb(mix(P.lit, P.half, .5)); g.fill(polyPathA([...up.map(([x, y]) => xf(x, y - .02)), ...up.slice().reverse().map(([x, y]) => xf(x, lerp(y, cy + h * .1, lid)))])); }
  g.restore();
  const lidLine = lid > 0 ? up.map(([x, y]) => [x, lerp(y, cy + h * .1, lid)]) : up;
  // catchlight from the key
  if (lid < .6) { const [kx, ky] = xf(cx + gaze[0] * w * .22 + (F.L[0] > 0 ? .02 : -.02), cy - h * .12); g.fillStyle = 'rgba(255,252,240,.95)'; g.beginPath(); g.arc(kx, ky, ir * .22, 0, TAU); g.fill(); }
  // lid fold above (a plane in the half tone), a defined crease, heavy upper lid line, softer lower lid
  const crease = up.slice(1, -1).map(([x, y]) => [x, y - h * .38]);
  g.fillStyle = rgb(mix(P.half, P.warm, .3), .8); g.fill(polyPathA([...up.slice(1, -1).map(([x, y]) => xf(x, y)), ...crease.slice().reverse().map(([x, y]) => xf(x, y))]));
  brushLine(g, crease.map(([x, y]) => xf(x, y)), r * .016, mix(P.warm, P.sh, .4), R, { alpha: .9, dry: .3 });
  const outer = far ? 1 : 0; // outer corner: far eye's is at +x end, near eye's at -x end
  const lidPts = lidLine.map(([x, y]) => xf(x, y)); const flick = xf(outer ? cx + w * .62 : cx - w * .62, cy - h * .3);
  brushLine(g, outer ? [...lidPts, flick] : [flick, ...lidPts], r * (man ? .03 : .036), hex('#1e1216'), R, { dry: .15 });
  brushLine(g, lo.slice(2, -1).map(([x, y]) => xf(x, y)), r * .012, mix(P.warm, P.sh, .3), R, { alpha: .8, dry: .4 });
  if (F.wet) brushLine(g, lo.slice(3, -3).map(([x, y]) => xf(x, y - h * .1)), r * .01, hex('#f6fbff'), R, { alpha: .9, dry: .3 });
  if (!man) for (let i = 0; i < 2; i++) { const idx = outer ? n - 1 - i : 1 + i, [x, y] = lidLine[idx]; brushLine(g, [xf(x, y), xf(x + (outer ? .03 : -.03), y - .05)], r * .01, hex('#1e1216'), R, { dry: .1 }); }
}
function paintSmile34(g, F, xf, R) {
  const r = F.r, sm = F.smile ?? 1, X = (p) => p.map(([x, y]) => xf(x, y));
  const nc = [.06, .47 - .04 * sm], fc = [.37, .455 - .015 * sm];
  const part = [nc, [.14, .49], [.22, .495], [.3, .48], fc];
  const top = [nc, [.12, .44], [.19, .425], [.23, .44], [.28, .425], [.34, .44], fc];
  const bot = [fc, [.31, .53], [.21, .56], [.12, .53], nc];
  g.fillStyle = rgb(hex('#a83646')); g.fill(polyPathA(X([...top, ...part.slice(1, -1).reverse()])));
  g.fillStyle = rgb(hex('#d4605a')); g.fill(polyPathA(X([...part, ...bot.slice(1, -1)])));
  g.fillStyle = rgb(hex('#f0a090'), .9); g.beginPath(); { const [x, y] = xf(.2, .52); g.ellipse(x, y, r * .045, r * .012, F.tilt || 0, 0, TAU); } g.fill();
  brushLine(g, X(part), r * .014, hex('#5a1a24'), R, { dry: .2 });
  brushLine(g, X([[nc[0] - .01, nc[1] - .03], [nc[0] - .035, nc[1] + .02]]), r * .012, hex('#b0584a'), R, { alpha: .8 }); // the crooked corner's dimple
}
function paintGrin34(g, F, xf, R) {
  const r = F.r, X = (p) => p.map(([x, y]) => xf(x, y));
  const nc = [-.06, .38], fc = [.44, .48];
  const top = [nc, [.06, .45], [.2, .47], [.34, .47], fc], bot = [fc, [.34, .6], [.18, .64], [.04, .57], nc];
  g.fillStyle = rgb(hex('#3a1216')); g.fill(polyPathA(X([...top, ...bot.slice(1, -1)])));
  g.save(); g.clip(polyPathA(X([...top, ...bot.slice(1, -1)])));
  g.fillStyle = rgb(hex('#f0e6d2')); g.fill(polyPathA(X([[-.06, .38], [.44, .48], [.42, .54], [0, .5]])));
  for (let i = 1; i < 6; i++) brushLine(g, X([[i * .075 - .03, .46], [i * .075 - .03, .53]]), r * .006, hex('#a89880'), R, { alpha: .6 });
  g.restore();
  brushLine(g, X(top), r * .02, hex('#6a2a26'), R, { dry: .15 });
  brushLine(g, X(bot.slice(1, -1)), r * .014, hex('#8a3a32'), R, { alpha: .7, dry: .3 });
  brushLine(g, X([[-.08, .32], [-.11, .42]]), r * .016, hex('#7a3a2c'), R, { alpha: .8 }); // the cheek pushed up at the high corner
}
function paintHair34(g, F, xf, R) {
  const r = F.r, outer = [], inner = [[.42, -.52], [.32, -.44], [.22, -.52], [.1, -.42], [-.04, -.5], [-.18, -.4], [-.32, -.48], [-.46, -.36], [-.54, -.14], [-.6, .16]];
  for (let i = 0; i <= 26; i++) { const a = -Math.PI * .28 - i / 26 * Math.PI * 1.02, b = 1 + .07 * Math.abs(Math.sin(i * 2.1)) + .02 * R();
    outer.push([.02 + Math.cos(a) * .76 * b - .06, -.1 + Math.sin(a) * .98 * b * (a < -Math.PI ? .9 : 1)]); }
  outer.push([-.66, .14], [-.6, .16]);
  const pts = [...outer, ...inner.slice().reverse()].map(([x, y]) => xf(x, y));
  const lit = (lx, ly) => (lx * F.L[0] * (F.facing || 1) * 0 + lx * F.L[0] - ly * .5) > .1;
  // warm platinum blonde (Bob 2026-10-12: she is not dark haired); same strokes and seeds as before, new colours
  g.fillStyle = rgb(hex('#d2ae66')); g.fill(polyPathA(pts));
  paintArea(g, pts, { R, base: hex('#d2ae66'), shade: () => mix(hex('#c49c58'), hex('#e4c684'), R()), dir: (x, y) => R() * TAU, step: r * .06, len: r * .1, w: r * .04, wob: 3, dry: .4, alpha: .6, edgeW: r * .035, edgeStep: r * .06, edgeDry: .5 });
  // curls as crisp lit crescents on the key side, dark separations elsewhere
  g.save(); g.clip(polyPathA(pts));
  const inv = headInv(F);
  for (let i = 0; i < 46; i++) { // curls as clumps: a mid-tone lump, a dark underside, a lit rim on the key side
    const lx = -.68 + R() * 1.06, ly = -1.04 + R() * 1.0, [x, y] = xf(lx, ly), cr = r * (.06 + R() * .035);
    const isLit = (lx * F.L[0] - ly * .4 - .1) > 0, k = F.L[0] * (F.facing || 1) > 0 ? 1 : -1;
    g.fillStyle = rgb(isLit ? hex('#f0d898') : hex('#b89050')); g.beginPath(); g.ellipse(x, y, cr, cr * .8, R(), 0, TAU); g.fill();
    g.strokeStyle = rgb(hex('#6e4a2a'), .85); g.lineWidth = cr * .28; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, cr * .85, .3, 2.6); g.stroke();
    if (isLit) { g.strokeStyle = rgb(mix(hex('#fff0c4'), hex('#fffbea'), R())); g.lineWidth = cr * .3; g.beginPath(); g.arc(x, y, cr * .7, k > 0 ? -1.6 : Math.PI + .2, k > 0 ? -.2 : Math.PI + 1.6); g.stroke(); }
  }
  g.restore();
}
