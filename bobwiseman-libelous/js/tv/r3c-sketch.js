// Round 3, tv-C: the court sketches the bulletin shows (stanzas 12-13). A court artist's pastel and conte on
// toned grey-blue paper: the paper's grain shows through, colour is laid in loose hatched strokes that miss the
// lines a little, the line work is fast and doubled, faces are summarised in a few marks, shadows are rubbed.
// Everything is prebaked once at load (seeded), so the drawings are fixed like real sketches; the news "moves"
// them the way 1970s bulletins did, with rostrum-camera pans and cuts between the artist's drawings.
const R3C_SK = {};
const R3C_SK_INK = '#2a2226';
// ---------- mark-making ----------
function r3cSkPaper(w, h, seed, base = '#7f8ea1') {
  const c = mkCanvas(w, h), g = c.getContext('2d'), R = mulberry(seed);
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 14; k++) { const x = R() * w, y = R() * h, r = 120 + R() * 420, rg = g.createRadialGradient(x, y, 0, x, y, r); const lt = R() < .5; rg.addColorStop(0, lt ? 'rgba(255,255,255,.06)' : 'rgba(20,30,50,.07)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  // the paper's tooth: coarse light and dark grains and short diagonal streaks the pastel catches on
  for (let i = 0; i < (w * h) / 260; i++) { g.fillStyle = R() < .5 ? 'rgba(255,255,255,.16)' : 'rgba(10,20,40,.16)'; g.fillRect(R() * w, R() * h, 2 + R() * 3, 2 + R() * 2); }
  for (let i = 0; i < (w * h) / 1400; i++) { g.strokeStyle = R() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(10,20,40,.08)'; g.lineWidth = 3 + R() * 4; const x = R() * w, y = R() * h, l = 20 + R() * 50; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l * .7, y - l * .7); g.stroke(); }
  const n = (w * h) / 90;
  for (let i = 0; i < n; i++) { g.fillStyle = R() < .5 ? 'rgba(255,255,255,.10)' : 'rgba(10,20,40,.10)'; g.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 1.5); }
  g.lineWidth = 1; for (let i = 0; i < n / 40; i++) { g.strokeStyle = R() < .5 ? 'rgba(255,255,255,.08)' : 'rgba(20,30,50,.08)'; const x = R() * w, y = R() * h, a = R() * TAU, l = 6 + R() * 18; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + 3, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  return c;
}
// a conte line: a polyline redrawn a few times, each pass a hair off, thinner and fainter
function r3cSkLine(g, R, pts, col = R3C_SK_INK, lw = 3, passes = 3, jit = 2.2, alpha = .75) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col;
  for (let p = 0; p < passes; p++) {
    g.globalAlpha = alpha * (p ? .55 : 1); g.lineWidth = lw * (p ? .55 + R() * .4 : 1);
    g.beginPath();
    const q = pts.map(([x, y]) => [x + (R() - .5) * jit * 2, y + (R() - .5) * jit * 2]);
    g.moveTo(q[0][0], q[0][1]);
    for (let i = 1; i < q.length - 1; i++) g.quadraticCurveTo(q[i][0], q[i][1], (q[i][0] + q[i + 1][0]) / 2, (q[i][1] + q[i + 1][1]) / 2);
    g.lineTo(q[q.length - 1][0], q[q.length - 1][1]);
    // a gesture line runs on a little past the end
    g.stroke();
  }
  g.restore();
}
// a closed shape outlined in conte: the path stroked a few times, shifted a little each pass
function r3cSkOutline(g, R, path, col = R3C_SK_INK, lw = 3, passes = 3, jit = 2.4, alpha = .75) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col;
  for (let p = 0; p < passes; p++) { g.save(); g.translate((R() - .5) * jit * 2, (R() - .5) * jit * 2); g.globalAlpha = alpha * (p ? .5 : 1); g.lineWidth = lw * (p ? .5 + R() * .4 : 1); path(g); g.stroke(); g.restore(); }
  g.restore();
}
// pastel colour laid in loose hatched strokes inside a shape, off-register by a few px; the paper shows through
function r3cSkFill(g, R, path, col, box, o = {}) {
  const [bx, by, bw, bh] = box, ang = o.ang ?? -.9, gap = (o.gap ?? 7) * 1.25, lw = (o.lw ?? 7) * 1.35, alpha = o.alpha ?? .55, c = hex(col);
  // first a soft rubbed layer (the artist's thumb), then the strokes over it
  g.save(); g.translate(o.dx ?? (R() - .5) * 12, o.dy ?? (R() - .5) * 12); g.filter = 'blur(5px)'; path(g); g.fillStyle = rgb(c, alpha * .45); g.fill(); g.filter = 'none'; g.restore();
  g.save(); g.translate(o.dx ?? (R() - .5) * 10, o.dy ?? (R() - .5) * 10); path(g); g.clip();
  g.lineCap = 'round';
  const cx = bx + bw / 2, cy = by + bh / 2, L = Math.hypot(bw, bh) / 2 + 20;
  for (const layer of [0, 1]) {
    const a2 = layer ? ang + .35 : ang, c2 = Math.cos(a2), s2 = Math.sin(a2);
    for (let d = -L; d <= L; d += gap * (layer ? 1.6 : 1) * (.7 + R() * .6)) {
      const v = (R() - .5) * 40, cc = mix(c, R() < .5 ? [255, 255, 255] : [0, 0, 0], R() * .12);
      g.strokeStyle = rgb(cc, alpha * (layer ? .55 : 1) * (.6 + R() * .5)); g.lineWidth = lw * (.6 + R() * .7);
      const ox = cx - s2 * d, oy = cy + c2 * d, l0 = L * (.6 + R() * .4);
      g.beginPath(); g.moveTo(ox - c2 * l0 + v * c2, oy - s2 * l0 + v * s2); g.lineTo(ox + c2 * l0 + v * c2, oy + s2 * l0 + v * s2); g.stroke();
    }
  }
  g.restore();
}
function r3cSkSmudge(g, x, y, rx, ry, col, a) {
  g.save(); g.translate(x, y); g.scale(1, ry / rx);
  const rg = g.createRadialGradient(0, 0, 0, 0, 0, rx); rg.addColorStop(0, rgb(hex(col), a)); rg.addColorStop(1, rgb(hex(col), 0));
  g.fillStyle = rg; g.fillRect(-rx, -rx, 2 * rx, 2 * rx); g.restore();
}
// chalk highlight strokes
function r3cSkChalk(g, R, x, y, w, h, n, col = '#f4efe2', alpha = .7) {
  g.save(); g.lineCap = 'round'; g.strokeStyle = col;
  for (let k = 0; k < n; k++) { g.globalAlpha = alpha * (.5 + R() * .5); g.lineWidth = 2 + R() * 3; const x0 = x + R() * w, y0 = y + R() * h; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 8 + R() * 18, y0 - 4 - R() * 10); g.stroke(); }
  g.restore();
}
const r3cSkEll = (x, y, rx, ry, a = 0) => (g) => { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, TAU); };
// straight edges drawn by hand: each edge cut into short runs that wander a pixel or three (seeded by position)
function r3cSkWobble(pts) {
  const out = [];
  pts.forEach(([x0, y0], i) => {
    const [x1, y1] = pts[(i + 1) % pts.length], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 50));
    for (let k = 0; k < n; k++) { const u = k / n, a = rnd(x0 * .37 + k, y0 * .53, 11), b = rnd(x1 * .41 + k, y1 * .29, 12), m = k ? 2.6 : .8; out.push([lerp(x0, x1, u) + (a - .5) * 2 * m, lerp(y0, y1, u) + (b - .5) * 2 * m]); }
  });
  return out;
}
const r3cSkPoly = (pts) => { const q = r3cSkWobble(pts); return (g) => { g.beginPath(); q.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }; };
const r3cSkRect = (x, y, w, h) => r3cSkPoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
// a summarised face: skin rubbed in, eyes as two marks, a nose stroke, a mouth stroke, rubbed cheeks
function r3cSkFace(g, R, x, y, rx, ry, skin, o = {}) {
  r3cSkFill(g, R, r3cSkEll(x, y, rx, ry), skin, [x - rx, y - ry, 2 * rx, 2 * ry], { gap: 5, lw: 6, alpha: .7 });
  r3cSkSmudge(g, x - rx * .5, y + ry * .25, rx * .35, ry * .25, '#c85a50', .35); r3cSkSmudge(g, x + rx * .5, y + ry * .25, rx * .35, ry * .25, '#c85a50', .35);
  r3cSkOutline(g, R, r3cSkEll(x, y, rx, ry), R3C_SK_INK, 2.6, 2, 1.6, .6);
  const ey = y - ry * .12 + (o.down ? ry * .1 : 0);
  for (const sd of [-1, 1]) {
    if (o.down) r3cSkLine(g, R, [[x + sd * rx * .42 - 6, ey], [x + sd * rx * .42, ey + 3], [x + sd * rx * .42 + 6, ey]], R3C_SK_INK, 2.6, 2, .8);
    else r3cSkLine(g, R, [[x + sd * rx * .42 - 5, ey], [x + sd * rx * .42 + 5, ey - 1]], R3C_SK_INK, 4, 2, .8);
  }
  r3cSkLine(g, R, [[x + 2, y - ry * .05], [x + 6, y + ry * .25], [x, y + ry * .32]], R3C_SK_INK, 2.2, 2, .8, .6);
  const my = y + ry * .55; r3cSkLine(g, R, o.open ? [[x - 8, my], [x, my + 8], [x + 8, my]] : [[x - 9, my], [x + 9, my + 1]], '#5a2224', 3, 2, .8, .8);
}
// ---------- figures, in pastel ----------
function r3cSkJudge(g, R, x, y, pose, clipY) {
  // y = centre of the face. pose: up, nod, gavelUp, gavelDown. clipY: the bench top he sits behind
  const nod = pose === 'nod' ? 1 : 0, fy = y + nod * 14;
  g.save(); if (clipY !== undefined) { g.beginPath(); g.rect(0, 0, 1e4, clipY); g.clip(); }
  // the red robe, the white fur trim and the bands at the neck
  const robe = r3cSkPoly([[x - 190, y + 260], [x - 160, y + 120], [x - 90, y + 80], [x + 90, y + 80], [x + 160, y + 120], [x + 190, y + 260]]);
  r3cSkFill(g, R, robe, '#b8303a', [x - 190, y + 80, 380, 180], { gap: 6, lw: 8, alpha: .7 });
  r3cSkSmudge(g, x, y + 230, 160, 40, '#3a1018', .4);
  r3cSkOutline(g, R, robe, R3C_SK_INK, 3.4, 3);
  for (const sd of [-1, 1]) r3cSkFill(g, R, r3cSkPoly([[x + sd * 30, y + 84], [x + sd * 54, y + 84], [x + sd * 50, y + 260], [x + sd * 24, y + 260]]), '#efe8da', [x - 60, y + 80, 120, 180], { gap: 5, lw: 6, alpha: .8 });
  r3cSkFill(g, R, r3cSkPoly([[x - 12, y + 70], [x - 2, y + 70], [x - 4, y + 112], [x - 16, y + 112]]), '#f8f4ea', [x - 20, y + 66, 40, 50], { gap: 4, lw: 5, alpha: .9, dx: 0, dy: 0 });
  r3cSkFill(g, R, r3cSkPoly([[x + 2, y + 70], [x + 12, y + 70], [x + 16, y + 112], [x + 4, y + 112]]), '#f8f4ea', [x - 20, y + 66, 40, 50], { gap: 4, lw: 5, alpha: .9, dx: 0, dy: 0 });
  // the full-bottomed wig: a dome over the head and two long lappets of curls to the shoulders
  g.save(); g.translate(0, nod * 14);
  const lap = (sd) => r3cSkPoly([[x + sd * 44, y - 30], [x + sd * 92, y - 10], [x + sd * 104, y + 70], [x + sd * 96, y + 140], [x + sd * 52, y + 130], [x + sd * 42, y + 40]]);
  for (const sd of [-1, 1]) { r3cSkFill(g, R, lap(sd), '#e9e2d2', [x - 110, y - 40, 220, 190], { gap: 5, lw: 7, alpha: .85 }); r3cSkOutline(g, R, lap(sd), '#4a4448', 2.4, 2); }
  for (const sd of [-1, 1]) for (let k = 0; k < 6; k++) r3cSkLine(g, R, [[x + sd * (56 + (k % 2) * 22), y - 8 + k * 24], [x + sd * (66 + (k % 2) * 22), y + 2 + k * 24], [x + sd * (58 + (k % 2) * 22), y + 12 + k * 24]], '#6a6266', 2.2, 1, 1, .7);
  const dome = r3cSkEll(x, y - 50, 70, 46);
  r3cSkFill(g, R, dome, '#ede6d6', [x - 70, y - 96, 140, 92], { gap: 5, lw: 7, alpha: .85 });
  for (let k = 0; k < 7; k++) r3cSkLine(g, R, [[x - 52 + k * 17, y - 62], [x - 46 + k * 17, y - 72], [x - 40 + k * 17, y - 62]], '#6a6266', 2, 1, 1, .6);
  r3cSkOutline(g, R, dome, '#4a4448', 2.4, 2);
  g.restore();
  r3cSkFace(g, R, x, fy, 40, 50, '#e6b48e', { down: nod });
  g.restore();
  if (clipY !== undefined) r3cSkJudgeHands(g, R, x, y, pose);
}
// his hands resting on the bench top (y + 130), and the gavel: raised high, or down on its block on the bench
function r3cSkJudgeHands(g, R, x, y, pose) {
  if (pose === 'gavelUp') {
    r3cSkLine(g, R, [[x + 112, y + 100], [x + 180, y + 40], [x + 214, y - 70]], '#b8303a', 26, 2, 2, .8);
    r3cSkFill(g, R, r3cSkEll(x + 216, y - 80, 22, 18), '#e6b48e', [x + 190, y - 100, 52, 40], { gap: 4, lw: 5, alpha: .8 });
    r3cSkOutline(g, R, r3cSkEll(x + 216, y - 80, 22, 18), R3C_SK_INK, 2.4, 2);
    g.save(); g.translate(x + 216, y - 80); g.rotate(-.5);
    r3cSkFill(g, R, r3cSkRect(-6, -110, 12, 110), '#7a4a26', [-8, -112, 16, 114], { gap: 4, lw: 5, alpha: .9, dx: 0, dy: 0 });
    r3cSkFill(g, R, r3cSkRect(-44, -150, 88, 40), '#6b3a1e', [-46, -152, 92, 44], { gap: 4, lw: 6, alpha: .9, dx: 0, dy: 0 });
    r3cSkOutline(g, R, r3cSkRect(-44, -150, 88, 40), R3C_SK_INK, 3, 2);
    g.restore();
  } else if (pose === 'gavelDown') {
    r3cSkLine(g, R, [[x + 110, y + 96], [x + 180, y + 108], [x + 226, y + 116]], '#b8303a', 26, 2, 2, .8);
    r3cSkFill(g, R, r3cSkRect(x + 226, y + 106, 70, 10), '#7a4a26', [x + 224, y + 104, 74, 14], { gap: 4, lw: 5, alpha: .9, dx: 0, dy: 0 });
    r3cSkFill(g, R, r3cSkRect(x + 288, y + 76, 30, 52), '#6b3a1e', [x + 286, y + 74, 34, 56], { gap: 4, lw: 6, alpha: .9, dx: 0, dy: 0 });
    r3cSkOutline(g, R, r3cSkRect(x + 288, y + 76, 30, 52), R3C_SK_INK, 3, 2);
    r3cSkFill(g, R, r3cSkEll(x + 226, y + 116, 22, 16), '#e6b48e', [x + 202, y + 98, 50, 36], { gap: 4, lw: 5, alpha: .85 });
    r3cSkOutline(g, R, r3cSkEll(x + 226, y + 116, 22, 16), R3C_SK_INK, 2.2, 2);
  }
  for (const sd of pose === 'up' || pose === 'nod' ? [-1, 1] : [-1]) {
    r3cSkFill(g, R, r3cSkEll(x + sd * 110, y + 122, 26, 16), '#e6b48e', [x + sd * 110 - 28, y + 104, 56, 36], { gap: 4, lw: 5, alpha: .85 });
    r3cSkOutline(g, R, r3cSkEll(x + sd * 110, y + 122, 26, 16), R3C_SK_INK, 2.2, 2);
  }
}
// one of the couple, seated or standing behind something, from the chest up. who: 'w' green coat + red scarf, 'm' duffel
function r3cSkActivist(g, R, x, y, who, o = {}) {
  const isW = who === 'w', coat = isW ? '#3f7a5a' : '#b0703a', skin = isW ? '#e8b890' : '#d8a078';
  const body = r3cSkPoly([[x - 70, y + 190], [x - 64, y + 70], [x - 30, y + 46], [x + 30, y + 46], [x + 64, y + 70], [x + 70, y + 190]]);
  r3cSkFill(g, R, body, coat, [x - 72, y + 44, 144, 150], { gap: 6, lw: 7, alpha: .75 });
  r3cSkOutline(g, R, body, R3C_SK_INK, 3, 3);
  if (isW) r3cSkFill(g, R, r3cSkPoly([[x - 30, y + 44], [x + 30, y + 44], [x + 26, y + 64], [x + 18, y + 120], [x + 4, y + 118], [x + 8, y + 62], [x - 26, y + 60]]), '#c8303c', [x - 32, y + 40, 64, 84], { gap: 4, lw: 6, alpha: .85 });
  else for (let b = 0; b < 2; b++) r3cSkLine(g, R, [[x - 12, y + 92 + b * 40], [x + 12, y + 92 + b * 40]], '#f2e6c8', 6, 2, 1, .8);
  r3cSkFace(g, R, x, y, 32, 38, skin, { down: o.down });
  const hair = isW ? r3cSkPoly([[x - 38, y + 16], [x - 42, y - 30], [x - 20, y - 46], [x + 20, y - 46], [x + 42, y - 30], [x + 38, y + 16], [x + 28, y - 14], [x, y - 30], [x - 28, y - 14]])
    : r3cSkPoly([[x - 34, y - 6], [x - 32, y - 36], [x, y - 46], [x + 32, y - 36], [x + 34, y - 6], [x + 20, y - 26], [x - 20, y - 26]]);
  r3cSkFill(g, R, hair, isW ? '#3a2418' : '#6a4a2a', [x - 44, y - 48, 88, 66], { gap: 4, lw: 6, alpha: .85 });
  r3cSkOutline(g, R, hair, R3C_SK_INK, 2.4, 2);
  if (o.shrug) for (const sd of [-1, 1]) {   // a shrug: both mittens up, palms out
    r3cSkLine(g, R, [[x + sd * 60, y + 90], [x + sd * 104, y + 70], [x + sd * 110, y + 20]], coat, 22, 2, 1.5, .85);
    r3cSkFill(g, R, r3cSkEll(x + sd * 112, y + 8, 18, 15), skin, [x + sd * 112 - 20, y - 8, 40, 32], { gap: 4, lw: 5, alpha: .85 });
    r3cSkOutline(g, R, r3cSkEll(x + sd * 112, y + 8, 18, 15), R3C_SK_INK, 2.2, 2);
  }
}
function r3cSkPaperStack(g, R, x, y, w, h) {
  r3cSkFill(g, R, r3cSkRect(x, y, w, h), '#efe9da', [x, y, w, h], { gap: 5, lw: 6, alpha: .8, ang: 0 });
  for (let yy = y + 6; yy < y + h; yy += 7 + R() * 5) r3cSkLine(g, R, [[x + 2, yy], [x + w * .5, yy + (R() - .5) * 3], [x + w - 2, yy]], '#7a7268', 1.4, 1, .8, .55);
  r3cSkOutline(g, R, r3cSkRect(x, y, w, h), R3C_SK_INK, 2.6, 2);
  r3cSkSmudge(g, x + w + 6, y + h * .6, 14, h * .45, '#202838', .3);
}
// ---------- the courtroom (one big sheet, panned by the rostrum camera) ----------
const R3C_SK_COURT = { w: 1920, h: 1440, judge: { x: 960, y: 300 }, heads: [] };
function r3cSkCourtBase() {
  const W2 = R3C_SK_COURT.w, H2 = R3C_SK_COURT.h, c = r3cSkPaper(W2, H2, 1997), g = c.getContext('2d'), R = mulberry(61997);
  // panelled wall, laid in loosely
  r3cSkFill(g, R, r3cSkRect(0, 0, W2, 640), '#7a5236', [0, 0, W2, 640], { gap: 13, lw: 9, alpha: .32, ang: -1.45 });
  for (let k = 0; k < 18; k++) { const x = R() * W2, y = R() * H2; r3cSkSmudge(g, x, y, 160 + R() * 260, 90 + R() * 160, R() < .5 ? '#c8b08a' : '#3a4a66', .16 + R() * .1); }
  for (let x = 90; x < W2; x += 190) r3cSkLine(g, R, [[x, 20], [x + 3, 300], [x - 2, 620]], '#3a2418', 3, 2, 3, .5);
  // the royal crest over the bench
  r3cSkFill(g, R, r3cSkEll(960, 120, 70, 66), '#d8a83a', [890, 54, 140, 132], { gap: 5, lw: 6, alpha: .75 });
  r3cSkOutline(g, R, r3cSkEll(960, 120, 70, 66), R3C_SK_INK, 3, 2);
  for (let k = 0; k < 5; k++) r3cSkLine(g, R, [[930 + k * 15, 90], [934 + k * 15, 150]], '#6a3a10', 3, 1, 2, .6);
  // the judge's high-backed chair
  const chair = r3cSkPoly([[840, 420], [846, 210], [880, 170], [1040, 170], [1074, 210], [1080, 420]]);
  r3cSkFill(g, R, chair, '#6a1a26', [840, 170, 240, 250], { gap: 7, lw: 8, alpha: .7 }); r3cSkOutline(g, R, chair, R3C_SK_INK, 3, 2);
  // the bench
  const bench = r3cSkRect(500, 430, 920, 220);
  r3cSkFill(g, R, bench, '#8a5a32', [500, 430, 920, 220], { gap: 8, lw: 9, alpha: .7, ang: -1.5 });
  r3cSkSmudge(g, 960, 640, 460, 40, '#20160e', .35);
  r3cSkOutline(g, R, bench, R3C_SK_INK, 3.6, 3);
  r3cSkLine(g, R, [[480, 432], [960, 428], [1440, 432]], R3C_SK_INK, 5, 3);
  for (let x = 560; x < 1400; x += 150) r3cSkOutline(g, R, r3cSkRect(x, 470, 110, 140), '#3a2418', 2, 2, 2, .55);
  // the jury box, empty: two tiers of green benches behind a rail
  for (const [yy, x0] of [[700, 80], [790, 100]]) { const b = r3cSkRect(x0, yy, 440, 46); r3cSkFill(g, R, b, '#3c6a4a', [x0, yy, 440, 46], { gap: 6, lw: 7, alpha: .7 }); r3cSkOutline(g, R, b, R3C_SK_INK, 2.6, 2); }
  const rail = r3cSkRect(60, 846, 500, 110);
  r3cSkFill(g, R, rail, '#8a5a32', [60, 846, 500, 110], { gap: 7, lw: 8, alpha: .7, ang: -1.5 }); r3cSkOutline(g, R, rail, R3C_SK_INK, 3.4, 3);
  r3cSkLine(g, R, [[50, 846], [570, 842]], R3C_SK_INK, 5, 3);
  r3cSkLine(g, R, [[60, 660], [60, 846]], R3C_SK_INK, 3, 2); r3cSkLine(g, R, [[560, 660], [560, 846]], R3C_SK_INK, 3, 2);
  r3cSkSmudge(g, 310, 760, 230, 80, '#1a2230', .25);
  // the floor
  r3cSkFill(g, R, r3cSkRect(0, 1000, W2, 440), '#5a4a40', [0, 1000, W2, 440], { gap: 16, lw: 10, alpha: .28, ang: -.2 });
  // the couple's table and their stacks of paper (they defended themselves)
  const table = r3cSkRect(1150, 930, 740, 150);
  r3cSkPaperStack(g, R, 1180, 640, 110, 290); r3cSkPaperStack(g, R, 1300, 760, 70, 170);
  r3cSkPaperStack(g, R, 1640, 690, 100, 240); r3cSkPaperStack(g, R, 1760, 600, 100, 330);
  r3cSkFill(g, R, table, '#8a5a32', [1150, 930, 740, 150], { gap: 8, lw: 9, alpha: .75, ang: -1.5 }); r3cSkOutline(g, R, table, R3C_SK_INK, 3.4, 3);
  r3cSkLine(g, R, [[1130, 932], [1510, 928], [1900, 934]], R3C_SK_INK, 5, 3);
  r3cSkSmudge(g, 1520, 1090, 380, 30, '#20160e', .35);
  return c;
}
// the couple at their table: their own layer, so the artist's second drawing (the shrug) can cut in
R3C_SK_COURT.couple = [[1440, 780, 'w'], [1560, 772, 'm']];
function r3cSkCoupleLayer(o) {
  const c = mkCanvas(R3C_SK_COURT.w, R3C_SK_COURT.h), g = c.getContext('2d'), R = mulberry(o.shrug ? 7171 : 7070);
  g.save(); g.beginPath(); g.rect(0, 0, R3C_SK_COURT.w, 931); g.clip();
  for (const [x, y, who] of R3C_SK_COURT.couple) r3cSkActivist(g, R, x, y, who, o);
  g.restore();
  // the table edge in front of them again, so they sit behind it
  const table = r3cSkRect(1150, 930, 740, 150);
  r3cSkFill(g, R, table, '#8a5a32', [1150, 930, 740, 150], { gap: 8, lw: 9, alpha: .75, ang: -1.5 }); r3cSkOutline(g, R, table, R3C_SK_INK, 3.4, 3);
  r3cSkLine(g, R, [[1130, 932], [1510, 928], [1900, 934]], R3C_SK_INK, 5, 3);
  return c;
}
function r3cSkJudgeLayer(pose) {
  const c = mkCanvas(R3C_SK_COURT.w, R3C_SK_COURT.h), g = c.getContext('2d'), R = mulberry({ up: 51, nod: 52, gavelUp: 53, gavelDown: 54 }[pose]);
  const J = R3C_SK_COURT.judge;
  r3cSkJudge(g, R, J.x, J.y, pose, 432);
  // the sounding block on the bench top
  r3cSkFill(g, R, r3cSkRect(J.x + 270, J.y + 120, 66, 12), '#5a3418', [J.x + 270, J.y + 120, 66, 12], { gap: 4, lw: 5, alpha: .9, dx: 0, dy: 0 }); r3cSkOutline(g, R, r3cSkRect(J.x + 270, J.y + 120, 66, 12), R3C_SK_INK, 2.4, 2);
  return c;
}
// the purse of the fine
function r3cSkPurse() {
  const c = mkCanvas(220, 200), g = c.getContext('2d'), R = mulberry(8080);
  const bag = r3cSkPoly([[30, 190], [20, 120], [60, 70], [160, 70], [200, 120], [190, 190]]);
  r3cSkFill(g, R, bag, '#7a2a30', [20, 70, 180, 120], { gap: 5, lw: 7, alpha: .85 }); r3cSkOutline(g, R, bag, R3C_SK_INK, 3, 3);
  r3cSkLine(g, R, [[60, 74], [110, 50], [160, 74]], '#d8a83a', 5, 2);
  for (let k = 0; k < 5; k++) { r3cSkFill(g, R, r3cSkEll(70 + k * 20, 62 - (k % 2) * 8, 13, 9), '#e8c050', [55 + k * 20, 50, 30, 24], { gap: 3, lw: 4, alpha: .9 }); r3cSkOutline(g, R, r3cSkEll(70 + k * 20, 62 - (k % 2) * 8, 13, 9), R3C_SK_INK, 2, 1); }
  return c;
}
// ---------- the five views (each a drawing for the big box at the desk: base + the key word's addition) ----------
const R3C_SK_VIEW = { w: 520, h: 404 };
function r3cSkView(k, part) {
  const { w, h } = R3C_SK_VIEW, c = part ? mkCanvas(w, h) : r3cSkPaper(w, h, 300 + k), g = c.getContext('2d'), R = mulberry(3300 + k * 10 + part);
  const cx = w / 2, cy = h / 2 + 10;
  if (k === 0) {   // greed: a bulging sack; then two hands clutch it and coins squeeze out
    if (!part) {
      const sack = r3cSkPoly([[cx - 110, cy + 140], [cx - 140, cy + 20], [cx - 70, cy - 90], [cx + 70, cy - 90], [cx + 140, cy + 20], [cx + 110, cy + 140]]);
      r3cSkFill(g, R, sack, '#b08a50', [cx - 140, cy - 92, 280, 234], { gap: 6, lw: 8, alpha: .75 }); r3cSkOutline(g, R, sack, R3C_SK_INK, 3.4, 3);
      r3cSkLine(g, R, [[cx - 70, cy - 90], [cx, cy - 110], [cx + 70, cy - 90]], '#5a3a18', 6, 2);
      r3cSkSmudge(g, cx, cy + 150, 160, 18, '#151a26', .45);
    } else {
      for (const sd of [-1, 1]) {
        r3cSkLine(g, R, [[cx + sd * 260, cy - 40], [cx + sd * 170, cy - 30], [cx + sd * 120, cy - 10]], '#3a3040', 30, 2, 2, .85);
        const m = r3cSkEll(cx + sd * 112, cy - 6, 34, 28, sd * .3);
        r3cSkFill(g, R, m, '#e6b48e', [cx + sd * 112 - 36, cy - 36, 72, 60], { gap: 4, lw: 6, alpha: .9 }); r3cSkOutline(g, R, m, R3C_SK_INK, 3, 2);
        r3cSkLine(g, R, [[cx + sd * 96, cy - 24], [cx + sd * 92, cy + 8]], R3C_SK_INK, 2.4, 2, 1);
      }
      for (let i = 0; i < 6; i++) { const x = cx - 50 + i * 20, y = cy - 120 - (i % 3) * 24; r3cSkFill(g, R, r3cSkEll(x, y, 13, 10), '#e8c050', [x - 14, y - 11, 28, 22], { gap: 3, lw: 4, alpha: .9 }); r3cSkOutline(g, R, r3cSkEll(x, y, 13, 10), R3C_SK_INK, 2, 1); }
      r3cSkLine(g, R, [[cx - 80, cy - 150], [cx - 60, cy - 170]], R3C_SK_INK, 2.5, 1); r3cSkLine(g, R, [[cx + 80, cy - 150], [cx + 60, cy - 170]], R3C_SK_INK, 2.5, 1);
    }
  } else if (k === 1) {   // workers: a grill and its steam; then the worker in a paper cap at it
    if (!part) {
      const grill = r3cSkRect(cx - 200, cy + 40, 400, 90);
      r3cSkFill(g, R, grill, '#4a4a52', [cx - 200, cy + 40, 400, 90], { gap: 6, lw: 8, alpha: .8 }); r3cSkOutline(g, R, grill, R3C_SK_INK, 3.4, 3);
      for (let i = 0; i < 5; i++) { const x = cx - 150 + i * 75; r3cSkFill(g, R, r3cSkEll(x, cy + 34, 28, 9), '#8a5030', [x - 30, cy + 24, 60, 20], { gap: 3, lw: 4, alpha: .9 }); }
      for (let i = 0; i < 4; i++) r3cSkLine(g, R, [[cx - 140 + i * 90, cy + 20], [cx - 150 + i * 90, cy - 30], [cx - 130 + i * 90, cy - 80], [cx - 145 + i * 90, cy - 130]], '#e8e4dc', 6, 2, 3, .55);
    } else {
      const x = cx + 120, y = cy - 70;
      const body = r3cSkPoly([[x - 70, y + 120], [x - 60, y + 50], [x - 26, y + 34], [x + 26, y + 34], [x + 60, y + 50], [x + 70, y + 120]]);
      r3cSkFill(g, R, body, '#e8e2d4', [x - 72, y + 30, 144, 92], { gap: 5, lw: 6, alpha: .85 }); r3cSkOutline(g, R, body, R3C_SK_INK, 3, 2);
      r3cSkFace(g, R, x, y, 30, 34, '#c89070', { down: 1 });
      const cap = r3cSkPoly([[x - 36, y - 20], [x - 30, y - 50], [x + 30, y - 50], [x + 36, y - 20]]);
      r3cSkFill(g, R, cap, '#f4f0e6', [x - 36, y - 52, 72, 34], { gap: 4, lw: 5, alpha: .95 }); r3cSkOutline(g, R, cap, R3C_SK_INK, 2.6, 2);
      r3cSkLine(g, R, [[x - 60, y + 60], [x - 110, y + 100], [x - 140, y + 104]], '#e8e2d4', 18, 2, 1.5, .85);
      r3cSkLine(g, R, [[x - 150, y + 106], [x - 200, y + 110]], '#8a8a90', 5, 2, 1);
      r3cSkSmudge(g, x - 120, y + 30, 50, 40, '#e8e4dc', .25);
    }
  } else if (k === 2) {   // wealth: a pillar of coin; then the crown set on top
    if (!part) {
      for (let i = 0; i < 12; i++) { const y = cy + 140 - i * 20; r3cSkFill(g, R, r3cSkEll(cx, y, 70, 14), i % 2 ? '#d8b040' : '#e8c858', [cx - 72, y - 15, 144, 30], { gap: 4, lw: 5, alpha: .9 }); r3cSkOutline(g, R, r3cSkEll(cx, y, 70, 14), R3C_SK_INK, 2.2, 1); }
      r3cSkSmudge(g, cx + 80, cy + 60, 30, 100, '#151a26', .35);
    } else {
      const y = cy - 112, cr = r3cSkPoly([[cx - 70, y], [cx - 70, y - 70], [cx - 40, y - 34], [cx - 18, y - 84], [cx, y - 40], [cx + 18, y - 84], [cx + 40, y - 34], [cx + 70, y - 70], [cx + 70, y]]);
      r3cSkFill(g, R, cr, '#f2c444', [cx - 72, y - 86, 144, 88], { gap: 4, lw: 6, alpha: .9 }); r3cSkOutline(g, R, cr, R3C_SK_INK, 3.4, 3);
      for (const [jx, col] of [[-36, '#3a6ac0'], [0, '#c0284a'], [36, '#2aa060']]) r3cSkFill(g, R, r3cSkEll(cx + jx, y - 16, 8, 8), col, [cx + jx - 9, y - 25, 18, 18], { gap: 3, lw: 4, alpha: .95, dx: 0, dy: 0 });
      r3cSkChalk(g, R, cx - 60, y - 80, 120, 40, 8);
    }
  } else if (k === 3) {   // torture: a small cage; then the hen in it, cramped (plain, no injury)
    if (!part) {
      r3cSkFill(g, R, r3cSkRect(cx - 120, cy - 60, 240, 170), '#2a3040', [cx - 120, cy - 60, 240, 170], { gap: 9, lw: 7, alpha: .25 });
    } else {
      const hen = r3cSkPoly([[cx - 100, cy + 100], [cx - 112, cy + 20], [cx - 70, cy - 30], [cx + 40, cy - 40], [cx + 96, cy - 50], [cx + 110, cy + 10], [cx + 100, cy + 100]]);
      r3cSkFill(g, R, hen, '#c8a070', [cx - 112, cy - 52, 224, 154], { gap: 5, lw: 7, alpha: .85 }); r3cSkOutline(g, R, hen, R3C_SK_INK, 3, 2);
      const hd = r3cSkEll(cx + 76, cy - 40, 24, 22);
      r3cSkFill(g, R, hd, '#c8a070', [cx + 50, cy - 64, 52, 46], { gap: 4, lw: 5, alpha: .85 }); r3cSkOutline(g, R, hd, R3C_SK_INK, 2.6, 2);
      r3cSkFill(g, R, r3cSkPoly([[cx + 66, cy - 58], [cx + 74, cy - 74], [cx + 84, cy - 60]]), '#c0283a', [cx + 62, cy - 76, 26, 20], { gap: 3, lw: 4, alpha: .95, dx: 0, dy: 0 });
      r3cSkFill(g, R, r3cSkPoly([[cx + 98, cy - 42], [cx + 116, cy - 36], [cx + 98, cy - 30]]), '#e8a830', [cx + 96, cy - 44, 22, 16], { gap: 3, lw: 4, alpha: .95, dx: 0, dy: 0 });
      r3cSkLine(g, R, [[cx + 80, cy - 46], [cx + 84, cy - 44]], R3C_SK_INK, 4, 1, .5);
    }
    // the bars, close together (over the hen once she is in): the cage is too small for her
    for (let x = cx - 120; x <= cx + 120; x += 22) r3cSkLine(g, R, [[x, cy - 60], [x + 1, cy + 110]], '#2a2a30', 4, 2, 1.2, .85);
    r3cSkLine(g, R, [[cx - 124, cy - 60], [cx + 124, cy - 60]], '#2a2a30', 6, 2, 1.2); r3cSkLine(g, R, [[cx - 124, cy + 110], [cx + 124, cy + 110]], '#2a2a30', 6, 2, 1.2);
  } else {   // health: a bun; then a cracked heart beside it
    if (!part) {
      const x = cx - 100;
      r3cSkFill(g, R, (q) => { q.beginPath(); q.ellipse(x, cy - 10, 90, 60, 0, Math.PI, TAU); q.closePath(); }, '#d89a50', [x - 90, cy - 70, 180, 62], { gap: 5, lw: 7, alpha: .85 });
      r3cSkFill(g, R, r3cSkRect(x - 92, cy, 184, 22), '#5a3020', [x - 92, cy, 184, 22], { gap: 4, lw: 6, alpha: .85 });
      r3cSkFill(g, R, r3cSkRect(x - 88, cy + 26, 176, 30), '#d89a50', [x - 88, cy + 26, 176, 30], { gap: 4, lw: 6, alpha: .85 });
      r3cSkOutline(g, R, (q) => { q.beginPath(); q.ellipse(x, cy - 10, 90, 60, 0, Math.PI, TAU); q.closePath(); }, R3C_SK_INK, 3, 2);
      r3cSkOutline(g, R, r3cSkRect(x - 88, cy + 26, 176, 30), R3C_SK_INK, 3, 2);
      for (let i = 0; i < 6; i++) r3cSkLine(g, R, [[x - 50 + i * 20, cy - 40 - (i % 2) * 8], [x - 46 + i * 20, cy - 44 - (i % 2) * 8]], '#f4efe2', 4, 1, .5);
    } else {
      const x = cx + 120, y = cy - 10;
      const heart = (q) => { q.beginPath(); q.moveTo(x, y + 80); q.bezierCurveTo(x - 110, y + 10, x - 70, y - 80, x, y - 30); q.bezierCurveTo(x + 70, y - 80, x + 110, y + 10, x, y + 80); q.closePath(); };
      r3cSkFill(g, R, heart, '#c0303c', [x - 100, y - 80, 200, 162], { gap: 5, lw: 7, alpha: .85 }); r3cSkOutline(g, R, heart, R3C_SK_INK, 3.4, 3);
      r3cSkLine(g, R, [[x + 4, y - 28], [x - 12, y], [x + 10, y + 22], [x - 6, y + 50], [x + 2, y + 76]], '#f4efe2', 5, 2, 1);
      r3cSkLine(g, R, [[x + 4, y - 28], [x - 12, y], [x + 10, y + 22], [x - 6, y + 50], [x + 2, y + 76]], R3C_SK_INK, 2.5, 2, 1);
    }
  }
  return c;
}
// the judge's portrait for the small box at the desk (the artist's head-and-shoulders study)
function r3cSkJudgePortrait() {
  const c = r3cSkPaper(340, 250, 4242), g = c.getContext('2d'), R = mulberry(4243);
  g.save(); g.translate(170, 92); g.scale(.62, .62); g.translate(-170, -92);
  r3cSkJudge(g, R, 170, 92, 'up');
  g.restore();
  return c;
}
function r3cInitSketch() {
  R3C_SK.court = r3cSkCourtBase();
  R3C_SK.couple = r3cSkCoupleLayer({}); R3C_SK.coupleShrug = r3cSkCoupleLayer({ shrug: 1 });
  R3C_SK.judge = {}; for (const p of ['up', 'nod', 'gavelUp', 'gavelDown']) R3C_SK.judge[p] = r3cSkJudgeLayer(p);
  R3C_SK.purse = r3cSkPurse();
  R3C_SK.views = [0, 1, 2, 3, 4].map(k => [r3cSkView(k, 0), r3cSkView(k, 1)]);
  R3C_SK.portrait = r3cSkJudgePortrait();
  // head boxes in court-sheet coordinates (for the captions-off-faces check)
  R3C_SK_COURT.heads = { judge: [915, 245, 90, 120], couple: R3C_SK_COURT.couple.map(([x, y]) => [x - 46, y - 50, 92, 92]) };
}
