// v2 layout: landscape posters that fill the frame (wall only at the edges), big three-quarter heads,
// chiaroscuro, one saturated flat ground per poster, a small full figure as the second element.
// World px; each poster sits at P (its sheets are cut from one painted canvas).
const P = { x: 360, y: 278, w: 1680, h: 944 };
const P1 = { ...P, cut: 860 };
const P2 = { ...P, cuts: [0, 322, 636, 944] };
const KEY_R = [.78, -.38, .5];   // her poster key light: hard, from the right
const LAMP_L = [-.62, -.42, .66]; // character poster: the street lamp on the left
const UPLIGHT = [.3, .72, .62];  // the men: lit from below

// flat poster ground: one colour, a few long low-contrast strokes, no swirls
function paintFlat2(g, x0, y0, x1, y1, col, R, o = {}) {
  g.fillStyle = rgb(col); g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  const st = o.step ?? 46, ang = o.ang ?? -.5;
  for (let y = y0 - st; y < y1 + st; y += st * .7) for (let x = x0 - st * 2; x < x1 + st; x += st * 2.2) {
    const k = (R() - .5) * (o.var ?? 7), c = [col[0] + k, col[1] + k, col[2] + k * 1.2];
    dab(g, x + R() * st, y + R() * st * .5, ang + (R() - .5) * .08, st * (3 + R() * 2), st * .7, o.colAt ? o.colAt(x, y, c) : c, R, { dry: .25, jit: 5, alpha: .45, bend: 0 });
  }
  g.restore();
}
// a clean painted band (for the lettering), dry-brushed edges
function paintBand(g, x, y, w, h, col, R) {
  g.fillStyle = rgb(col); g.fillRect(x, y, w, h);
  for (let i = 0; i < 6; i++) bstroke(g, [[x + 4, y + h * (i + .5) / 6], [x + w - 4, y + h * (i + .5) / 6 + (R() - .5) * 3]], h / 5, mix(col, [255, 250, 230], .12 * R()), R, { dry: .25, jit: 4, alpha: .5, taper: false });
  for (const yy of [y, y + h]) bstroke(g, [[x, yy], [x + w, yy]], 6, col, R, { dry: .6, jit: 4 });
  for (const xx of [x, x + w]) bstroke(g, [[xx, y], [xx, y + h]], 6, col, R, { dry: .6, jit: 4 });
}

// ---------------- her full figure (designed in the v1 figure frame, centred x 372, head at y 246) ----------------
const FIG_HEAD = { x: 372, y: 246, r: 50, tilt: .08, facing: 1 };
function figXf(F) { return (x, y) => [F.ox + (x - 372) * F.s, F.oy + (y - 196) * F.s]; }
function paintFigure(g, F, L, seed) {
  g.save(); g.translate(F.ox - 372 * F.s, F.oy - 196 * F.s); g.scale(F.s, F.s);
  const RF = mulberry(seed), lit = L[0] < 0 ? 1 : -1; // +1: lit from the left
  g.fillStyle = 'rgba(10,8,24,.5)'; g.beginPath(); g.ellipse(380 + lit * -40, 730, 110, 13, 0, 0, TAU); g.fill();
  const umb = [[300, 418], [312, 424], [284, 700], [278, 700]];
  paintArea(g, umb, { R: RF, base: hex('#1e3a32'), shade: (x, y) => mix(hex('#4e7a62'), hex('#10201c'), clamp((x - 280 - (y - 418) * -.08) / 14)), dir: () => 1.67, step: 4, len: 26, w: 5, edgeW: 3, edgeStep: 8 });
  bstroke(g, [[281, 700], [279, 722]], 3, hex('#c8c0a8'), RF, { taper: false });
  bstroke(g, quadPts(300, 420, 318, 402, 10, 6), 4, hex('#5a3420'), RF, { taper: false });
  const legT = (x, x1) => lit > 0 ? (x < x1 - 1 ? PAL_HER.lit : PAL_HER.sh) : (x > x1 + 1 ? PAL_HER.lit : PAL_HER.sh);
  for (const [x0, x1, x2, s] of [[352, 356, 346, -1], [392, 390, 402, 1]]) {
    paintArea(g, [[x0 - 8, 548], [x0 + 8, 548], [x1 + 7, 640], [x2 + 6, 700], [x2 - 6, 700], [x1 - 8, 640]], { R: RF, base: PAL_HER.half, shade: (x) => legT(x, x1), dir: () => Math.PI / 2, step: 3, len: 18, w: 4, edgeW: 2, edgeStep: 6, alpha: .9 });
    paintArea(g, [[x2 - 9, 688], [x2 + 9, 688], [x2 + 10, 716], [x2 - 10, 716]], { R: RF, base: hex('#f2eee6'), shade: (x) => (lit > 0 ? x < x2 + 2 : x > x2 - 2) ? hex('#fffaf2') : hex('#8e8cb4'), dir: () => 0, step: 3, len: 10, w: 4, edgeW: 2.5, edgeStep: 4, edgeDry: .7 });
    paintArea(g, ellipsePts(x2 + s * 12, 724, 22, 9, 18, s * .12), { R: RF, base: hex('#141018'), shade: (x, y) => y < 720 ? hex('#4a4250') : hex('#0e0a10'), dir: () => 0, step: 3, len: 12, w: 4, edgeW: 2.5, edgeStep: 5 });
  }
  // coat: two flat tones split by a hard terminator, light from the lamp side
  const coat = [[322, 312], [420, 312], [436, 380], [446, 470], [452, 560], [296, 560], [302, 470], [308, 380]];
  const term = (y) => 372 + lit * -6 + (y - 312) * .05 * lit;
  const coatS = (x, y) => (lit > 0 ? x < term(y) + 30 : x > term(y) - 30) ? (Math.abs(x - term(y) - lit * -50) > 60 ? hex('#f0b840') : hex('#d89a2c')) : hex('#6a4a3a');
  paintArea(g, coat, { R: RF, base: hex('#b8842c'), shade: coatS, dir: () => Math.PI / 2, step: 5, len: 22, w: 6, edgeW: 4, edgeStep: 9, jit: 6 });
  bstroke(g, quadPts(300, 478, 448, 478, 4, 10), 12, hex('#5a3a1c'), RF, { taper: false, dry: .1 });
  brushLine(g, [[372, 330], [374, 560]], 3, hex('#7a5424'), RF, { alpha: .8 });
  for (const y of [440, 510]) { g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(382, y, 3.5, 0, TAU); g.fill(); }
  for (const s of [-1, 1]) {
    const sh = [372 + s * 46, 330], el = [372 + s * 70, 420], hd = [372 + s * 24, 418], c = s * lit < 0 ? hex('#e8ac38') : hex('#6a4a3a');
    bstroke(g, [sh, [372 + s * 62, 372], el], 30, c, RF, { dry: .1, jit: 6 });
    bstroke(g, [el, [372 + s * 48, 426], hd], 26, c, RF, { dry: .1, jit: 6 });
  }
  brushLine(g, quadPts(436, 426, 462, 448, -8, 6), 3, hex('#18141a'), RF);
  paintArea(g, [[426, 450], [470, 450], [474, 488], [422, 488]], { R: RF, base: hex('#1a161c'), shade: (x, y) => mix(hex('#5a5468'), hex('#0e0c10'), clamp((x - 424) / 50 + (y - 450) / 80)), dir: () => 0, step: 4, len: 16, w: 5, edgeW: 3, edgeStep: 6 });
  bstroke(g, [[428, 456], [450, 454]], 3, hex('#9a94b4'), RF, { alpha: .8 });
  g.fillStyle = '#d8b24a'; g.fillRect(445, 448, 6, 5);
  paintArea(g, [[312, 300], [372, 318], [432, 300], [444, 330], [420, 350], [372, 340], [324, 350], [300, 330]], { R: RF, base: hex('#e6d2d8'), shade: (x) => (lit > 0 ? x < 380 : x > 364) ? hex('#fbf0ee') : hex('#9a8ab4'), dir: (x, y) => Math.atan2(y - 380, x - 372), step: 4, len: 14, w: 4, wob: 1.2, dry: .35, edgeW: 3, edgeStep: 4, edgeDry: .7 });
  paintHeart(g, 372, 404, 1.55, RF);
  paintMitten(g, 348, 418, -.5, 22, RF, SKIN, 1);
  paintMitten(g, 396, 418, .5, 22, RF, SKIN, -1);
  paintHead34(g, { ...FIG_HEAD, L, kind: 'her', seed: seed + 1, gaze: [-.1, -.35], brow: [.14, .06], smile: 1.6, wet: true });
  g.restore();
}

// ---------------- P1: the star poster ----------------
const P1HEAD = { x: 540, y: 430, r: 300, tilt: -.1, facing: 1 };
const FIG1 = { ox: 1262, oy: 150, s: .8 };
const P1BAND = { cx: 1172, cy: 770, w: 600, h: 250, rot: -.06 };
function buildP1() {
  const [c, g] = sheetCanvas(P1.w, P1.h), R = mulberry(101);
  paintFlat2(g, 0, 0, P1.w, P1.h, hex('#9a1420'), R);
  // a diagonal shaft of hotter red behind her, bottom left to top right
  g.save(); g.clip(polyPathA([[0, 944], [0, 700], [1160, -10], [1500, -10], [300, 944]])); paintFlat2(g, 0, 0, P1.w, P1.h, hex('#c8301e'), R, { var: 6 }); g.restore();
  // dress, then the stole across the bottom left
  paintArea(g, [[-20, 790], [200, 730], [420, 712], [700, 730], [900, 830], [900, 960], [-20, 960]], { R, base: hex('#2a1430'), shade: (x) => x > 560 ? hex('#5a2c4a') : hex('#24102a'), dir: () => .3, step: 14, len: 50, w: 14, edge: false, alpha: .8 });
  const stole = [[-20, 800], [140, 752], [330, 760], [470, 800], [600, 770], [780, 820], [930, 944], [-20, 960]];
  paintArea(g, stole, { R, base: hex('#d6c6d6'), shade: (x, y) => x > 400 + (y - 760) * .5 ? (y < 830 ? hex('#ffffff') : hex('#f2e4e6')) : hex('#7a6894'), dir: (x, y) => Math.atan2(y - 1100, x - 400), step: 9, len: 30, w: 8, wob: 1, dry: .35, edgeW: 7, edgeStep: 9, edgeDry: .7 });
  paintHead34(g, { ...P1HEAD, neckLen: 1.15, L: KEY_R, kind: 'her', seed: 102, gaze: [.6, -.55], brow: [.16, .08], smile: 1.4, wet: true });
  // the small full figure in the corner: her again, tiny, walking under her own name
  paintFigure(g, FIG1, [.6, -.4, .7], 150);
  // name band
  g.save(); g.translate(P1BAND.cx, P1BAND.cy); g.rotate(P1BAND.rot);
  paintBand(g, -P1BAND.w / 2, -P1BAND.h / 2, P1BAND.w, P1BAND.h, hex('#f4c232'), R);
  const L1 = brushLettering('GIULIETTA', { seed: 11, size: 220, col: hex('#1a0e12'), col2: hex('#3a1a1e'), shadow: hex('#b8201e'), lean: .14 });
  const L2 = brushLettering('MASINA', { seed: 12, size: 220, col: hex('#1a0e12'), col2: hex('#3a1a1e'), shadow: hex('#b8201e'), lean: .14 });
  P1.name = [placeLettering(g, L1, -P1BAND.w / 2 + 14, -P1BAND.h / 2 + 10, P1BAND.w - 28, 120, .04), placeLettering(g, L2, -P1BAND.w / 2 + 14, -P1BAND.h / 2 + 124, P1BAND.w - 28, 118, .04)];
  g.restore();
  paperize(g, c.width, c.height, .8);
  return c;
}
// ---------------- the older poster under P1's right edge: a gold statuette ----------------
const PS = { x: P.x + P.w - 210, y: P.y, w: 212, h: P.h };
function buildStatuette() {
  const [c, g] = sheetCanvas(PS.w, PS.h), R = mulberry(201);
  paintFlat2(g, 0, 0, PS.w, PS.h, hex('#2e1a1e'), R, { step: 30 });
  g.save(); g.translate(PS.w / 2 - 128 * 1.25, 60); g.scale(1.25, 1.25);
  const cx = 128, cr = 250;
  for (let i = 0; i < 36; i += 2) { const a = i / 36 * TAU; g.fillStyle = 'rgba(122,70,36,.8)'; g.beginPath(); g.moveTo(cx, cr); g.lineTo(cx + Math.cos(a - .08) * 700, cr + Math.sin(a - .08) * 700); g.lineTo(cx + Math.cos(a + .08) * 700, cr + Math.sin(a + .08) * 700); g.fill(); }
  const gold = (x, ax, wid) => (x - ax) / wid > -.05 ? ((x - ax) / wid > .32 ? hex('#7a4c16') : hex('#e6b444')) : ((x - ax) / wid > -.22 ? hex('#fff0b8') : hex('#c08a24'));
  const body = [[cx - 9, 128], [cx + 9, 128], [cx + 34, 146], [cx + 34, 176], [cx + 26, 250], [cx + 21, 330], [cx + 17, 420], [cx + 15, 488], [cx - 15, 488], [cx - 17, 420], [cx - 21, 330], [cx - 26, 250], [cx - 34, 176], [cx - 34, 146]];
  paintArea(g, body, { R, base: hex('#c08a24'), shade: (x) => gold(x, cx, 60), dir: () => Math.PI / 2, step: 4, len: 20, w: 5, edgeW: 3, edgeStep: 6, jit: 6 });
  paintArea(g, ellipsePts(cx, 110, 13, 17, 20), { R, base: hex('#c08a24'), shade: (x) => gold(x, cx, 26), dir: () => Math.PI / 2, step: 3, len: 10, w: 4, edgeW: 2.5, edgeStep: 5 });
  bstroke(g, quadPts(cx - 30, 200, cx + 30, 196, -4, 8), 20, hex('#b07c22'), R, { dry: .1 });
  brushLine(g, quadPts(cx - 28, 209, cx + 28, 206, -3, 6), 2.5, hex('#3a200c'), R, { alpha: .8 });
  bstroke(g, [[cx + 1, 210], [cx + 1, 470]], 5, hex('#f6d06a'), R, { dry: .1, taper: false });
  brushLine(g, [[cx - 2, 330], [cx - 2, 486]], 2, hex('#4a2a10'), R, { alpha: .7 });
  for (const [y0, y1, w0] of [[488, 512, 30], [512, 560, 44], [560, 586, 52]]) {
    paintArea(g, [[cx - w0, y0], [cx + w0, y0], [cx + w0, y1], [cx - w0, y1]], { R, base: hex('#a8741e'), shade: (x) => gold(x, cx, w0 * 1.8), dir: () => 0, step: 4, len: 18, w: 5, edgeW: 3, edgeStep: 6 });
    brushLine(g, [[cx - w0, y1], [cx + w0, y1]], 3, hex('#4a2a10'), R, { alpha: .8 });
  }
  g.restore();
  paperize(g, c.width, c.height, .8);
  return c;
}

// ---------------- P2: the character poster, night blue ----------------
const FIG2 = { ox: 640, oy: 80, s: 1.5 };
const P2HEART = (() => { const [x, y] = figXf(FIG2)(372, 404); return { x, y }; })();
const P2HEAD = (() => { const [x, y] = figXf(FIG2)(FIG_HEAD.x, FIG_HEAD.y); return { x, y, r: FIG_HEAD.r * FIG2.s, tilt: FIG_HEAD.tilt, facing: 1 }; })();
const P2BAG = (() => { const [x, y] = figXf(FIG2)(448, 468); return { x, y }; })();
const P2BAND = { x: 760, y: 40, w: 820, h: 130 };
function buildP2() {
  const [c, g] = sheetCanvas(P2.w, P2.h), R = mulberry(301);
  paintFlat2(g, 0, 0, P2.w, P2.h, hex('#1c2668'), R);
  paintFlat2(g, 0, 820, P2.w, P2.h, hex('#262448'), R, { ang: 0 });
  // the lamp: a clean painted glow (concentric flat rings), lantern, post; a pool of light at her feet
  for (let k = 14; k >= 1; k--) { g.fillStyle = rgb(mix(hex('#1c2668'), hex('#ffd878'), Math.pow((15 - k) / 15, 1.6) * .6)); g.beginPath(); g.arc(200, 110, 30 + k * 18, 0, TAU); g.fill(); }
  g.fillStyle = rgb(mix(hex('#262448'), hex('#c8965a'), .6)); g.beginPath(); g.ellipse(560, 876, 420, 46, 0, 0, TAU); g.fill();
  paintArea(g, [[192, 150], [208, 150], [212, 860], [222, 900], [178, 900], [188, 860]], { R, base: hex('#181c24'), shade: (x) => x < 200 ? hex('#4e5a5e') : hex('#101218'), dir: () => Math.PI / 2, step: 4, len: 30, w: 5, edgeW: 3, edgeStep: 8 });
  paintArea(g, [[166, 70], [234, 70], [222, 148], [178, 148]], { R, base: hex('#fff0b0'), shade: (x, y) => y < 120 ? hex('#fffbe8') : hex('#ffd060'), dir: () => Math.PI / 2, step: 5, len: 16, w: 6, edgeW: 3, edgeStep: 6 });
  bstroke(g, [[156, 70], [244, 70]], 10, hex('#14161c'), R, { taper: false }); bstroke(g, [[170, 150], [230, 150]], 8, hex('#14161c'), R, { taper: false });
  // credit band
  paintBand(g, P2BAND.x, P2BAND.y, P2BAND.w, P2BAND.h, hex('#f2e4c0'), R);
  const LC = brushLettering('GIULIETTA MASINA', { seed: 21, size: 200, col: hex('#b01c22'), col2: hex('#c83026'), shadow: hex('#1c2668'), lean: .14 });
  P2.credit = placeLettering(g, LC, P2BAND.x + 12, P2BAND.y + 6, P2BAND.w - 24, P2BAND.h - 12, .05);
  paintFigure(g, FIG2, LAMP_L, 302);
  paperize(g, c.width, c.height, .8);
  return c;
}
// her head at 5x for the last close-up (same strokes; transparent outside)
const HEADBOX = { x: P2HEAD.x - 130, y: P2HEAD.y - 130, w: 260, h: 260, res: 5 };
function buildP2Head() {
  const [c, g] = sheetCanvas(HEADBOX.w, HEADBOX.h, HEADBOX.res);
  g.translate(-HEADBOX.x, -HEADBOX.y); g.translate(FIG2.ox - 372 * FIG2.s, FIG2.oy - 196 * FIG2.s); g.scale(FIG2.s, FIG2.s);
  paintHead34(g, { ...FIG_HEAD, L: LAMP_L, kind: 'her', seed: 303, gaze: [-.1, -.35], brow: [.14, .06], smile: 1.6, wet: true, neck: false });
  paperize(g, c.width, c.height, .6, true);
  return c;
}
function buildGlow() {
  const [c, g] = sheetCanvas(300, 300), R = mulberry(311);
  for (let k = 12; k >= 1; k--) { g.fillStyle = `rgba(255,${200 + k * 3},${110 + k * 6},.07)`; g.beginPath(); g.arc(150, 150, 24 + k * 9, 0, TAU); g.fill(); }
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + R() * .1; bstroke(g, [[150 + Math.cos(a) * 46, 150 + Math.sin(a) * 46], [150 + Math.cos(a) * (96 + R() * 30), 150 + Math.sin(a) * (96 + R() * 30)]], 5, hex('#fff0a0'), R, { alpha: .7, dry: .3 }); }
  return c;
}

// ---------------- the men: one per sheet, lit from below, sly ----------------
const MEN = [
  { id: 'm1', x: 640, y: 330, w: 250, h: 820, head: [136, 150, 82], tilt: .14, facing: 1, hat: '#5a4030', coat: '#2e2e3a', reach: [[150, 330], [210, 360], [250, 390]], hand: [246, 392, .2], brow: [-.05, .2], mustache: true },
  { id: 'm2', x: 1140, y: 466, w: 260, h: 720, head: [140, 140, 82], tilt: -.12, facing: -1, hat: '#4e525a', coat: '#232836', reach: [[120, 300], [60, 300], [6, 312]], hand: [6, 312, Math.PI], brow: [-.1, .25], mustache: false },
  { id: 'm3', x: 1420, y: 466, w: 290, h: 740, head: [150, 150, 84], tilt: -.2, facing: -1, hat: '#1a1a20', coat: '#3e2e2a', reach: null, brow: [0, .3], mustache: true },
];
function buildMan(M, k) {
  const [c, g] = sheetCanvas(M.w, M.h), R = mulberry(401 + k * 17);
  paintFlat2(g, 0, 0, M.w, M.h, hex(['#1e2a6c', '#22286a', '#1a2462'][k]), R, { step: 36 });
  // a warm uplight on the sheet's ground, from the lamp pool below
  const gr = g.createLinearGradient(0, M.h, 0, M.h * .4); gr.addColorStop(0, 'rgba(200,150,90,.35)'); gr.addColorStop(1, 'rgba(200,150,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, M.w, M.h);
  const [hx, hy, r] = M.head, q = r / 72, col = hex(M.coat), side = M.facing;
  const cs = (x, y) => (x - hx) * side > (50 - (y - hy) * .08) * q ? mix(col, [230, 170, 110], .38) : ((x - hx) * side > (30 - (y - hy) * .08) * q ? mix(col, [120, 80, 60], .25) : mix(col, [8, 6, 16], .4));
  g.save(); g.translate(hx, hy + 486 * q); g.rotate(side * .07); g.translate(-hx, -(hy + 486 * q)); // leaning in toward her
  const sh = [[hx - 74 * q, hy + 86 * q], [hx - 22 * q, hy + 70 * q], [hx + 22 * q, hy + 70 * q], [hx + 74 * q, hy + 86 * q], [hx + 92 * q, hy + 140 * q], [hx + 96 * q, hy + 340 * q], [hx - 96 * q, hy + 340 * q], [hx - 92 * q, hy + 140 * q]];
  for (const sx of [-1, 1]) {
    paintArea(g, [[hx + sx * 10 * q, hy + 330 * q], [hx + sx * 52 * q, hy + 330 * q], [hx + sx * 50 * q, hy + 478 * q], [hx + sx * 14 * q, hy + 478 * q]], { R, base: mix(col, [20, 20, 30], .4), shade: (x) => (x - hx) * side > 0 ? mix(col, [230, 170, 110], .25) : mix(col, [8, 6, 16], .5), dir: () => Math.PI / 2, step: 7, len: 30, w: 9, edgeW: 4, edgeStep: 9 });
    paintArea(g, ellipsePts(hx + sx * 38 * q, hy + 486 * q, 30 * q, 12 * q, 16), { R, base: hex('#16121a'), shade: (x, y) => y > hy + 486 * q ? hex('#6a5450') : hex('#0e0a10'), dir: () => 0, step: 4, len: 14, w: 5, edgeW: 3, edgeStep: 6 });
  }
  paintArea(g, sh, { R, base: col, shade: cs, dir: () => Math.PI / 2, step: 8, len: 34, w: 10, edgeW: 5, edgeStep: 10, jit: 6 });
  brushLine(g, [[hx - 20 * q, hy + 90 * q], [hx - 44 * q, hy + 220 * q]], 5, mix(col, [10, 10, 20], .6), R); brushLine(g, [[hx + 20 * q, hy + 90 * q], [hx + 44 * q, hy + 220 * q]], 5, mix(col, [10, 10, 20], .6), R);
  paintArea(g, [[hx - 8 * q, hy + 92 * q], [hx + 8 * q, hy + 92 * q], [hx + 12 * q, hy + 200 * q], [hx, hy + 214 * q], [hx - 12 * q, hy + 200 * q]], { R, base: hex(k === 1 ? '#8a2a2a' : '#2a5a4a'), shade: () => hex(k === 1 ? '#a83630' : '#347060'), step: 4, len: 14, w: 5, edgeW: 2, edgeStep: 5 });
  bstroke(g, [[hx - 24 * q, hy + 86 * q], [hx, hy + 100 * q], [hx + 24 * q, hy + 86 * q]], 9 * q, hex('#eae0d0'), R, { dry: .1 });
  paintHead34(g, { x: hx, y: hy, r, tilt: M.tilt, facing: M.facing, L: UPLIGHT, kind: 'man', seed: 450 + k, gaze: [.85, .05], lid: .38, brow: M.brow, mustache: M.mustache });
  paintHat(g, hx - side * r * .08, hy - r * .02, r, M.tilt, hex(M.hat), R);
  // the brim's underside catches the uplight
  { g.save(); g.translate(hx - side * r * .08, hy - r * .02); g.rotate(M.tilt); bstroke(g, quadPts(-1.3 * r, -.5 * r, 1.3 * r, -.5 * r, .12 * r, 14), r * .07, mix(hex(M.hat), [240, 180, 110], .45), R, { dry: .4, alpha: .8 }); g.restore(); }
  if (M.reach) {
    bstroke(g, M.reach, 34 * q * .8, mix(col, [230, 170, 110], .2), R, { dry: .1 });
    const [ax, ay, aa] = M.hand; bstroke(g, [[ax - Math.cos(aa) * 22, ay - Math.sin(aa) * 22], [ax, ay]], 30, hex('#eae0d0'), R, { taper: false });
    paintMitten(g, ax + Math.cos(aa) * 16, ay + Math.sin(aa) * 16, aa, 26, R, SKIN_M, 1);
  }
  g.restore();
  paperize(g, c.width, c.height, .8);
  return c;
}
// a small sheet: a man's sleeve and mitten hand on her bag strap; the bag is repainted on it so it tears away with it
const HANDP = { x: P.x + P2BAG.x - 96, y: P.y + P2BAG.y - 92, w: 190, h: 170 };
function buildHandPatch() {
  const [c, g] = sheetCanvas(HANDP.w, HANDP.h), R = mulberry(501);
  paintFlat2(g, 0, 0, HANDP.w, HANDP.h, hex('#1e2a6c'), R, { step: 20 });
  const bx = P.x + P2BAG.x - HANDP.x, by = P.y + P2BAG.y - HANDP.y, s = FIG2.s;
  brushLine(g, quadPts(bx - 12 * s, by - 42 * s, bx + 14 * s, by - 20 * s, -8 * s, 6), 3 * s, hex('#18141a'), R);
  paintArea(g, [[bx - 22 * s, by - 18 * s], [bx + 22 * s, by - 18 * s], [bx + 26 * s, by + 20 * s], [bx - 26 * s, by + 20 * s]], { R, base: hex('#1a161c'), shade: (x, y) => mix(hex('#5a5468'), hex('#0e0c10'), clamp((x - bx + 24 * s) / (50 * s) + (y - by + 18 * s) / (80 * s))), dir: () => 0, step: 4, len: 16, w: 5, edgeW: 3, edgeStep: 6 });
  g.fillStyle = '#d8b24a'; g.fillRect(bx - 4, by - 20 * s, 8, 6);
  bstroke(g, [[HANDP.w + 10, 40], [bx + 60, 32], [bx + 26, by - 44]], 36, hex('#3a4256'), R, { dry: .1 });
  bstroke(g, [[bx + 48, by - 38], [bx + 26, by - 44]], 32, hex('#eae0d0'), R, { taper: false });
  paintMitten(g, bx + 12, by - 48, Math.PI + .5, 24, R, SKIN_M, 1);
  for (let i = 0; i < 3; i++) paintArea(g, [[bx - 20 + i * 12, by - 28], [bx - 6 + i * 12, by - 52 - i * 4], [bx + 10 + i * 12, by - 46 - i * 4], [bx + i * 12, by - 26]], { R, base: hex('#9ab08a'), shade: () => mix(hex('#c4d4a8'), hex('#7a906a'), R()), step: 3, len: 8, w: 3, edgeW: 1.5, edgeStep: 4 });
  paperize(g, c.width, c.height, .8);
  return c;
}
