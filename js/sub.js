// Style kit for the pop-psychedelic look (in the manner of Edelmann, 1968): poster palette, op-art
// grounds, starbursts and rainbow arcs, whiplash curls, halftone collage, balloon lettering, and the cast
// (cloud delegates, the chairman, the ministry cut-out, planes, the sun). Everything is flat colour with
// a bold even black line; grounds usually go without a line. Pure functions of their arguments.

// ---- palette: full-saturation poster inks ----
const K = {
  MAG: '#ff2a8a', PINK: '#ff7ac8', ORA: '#ff7300', LEM: '#ffe41a', TUR: '#00c9bd', VIO: '#7b2cf5',
  LIME: '#8fdc00', RED: '#f2262f', SKY: '#2b9cff', CRM: '#fff3d1', BLK: '#141018', WHT: '#fffdf5',
  G1: '#9a9aa8', G2: '#6c6c7a', G3: '#45454f', G4: '#26262d', TEAL: '#00897f', PLUM: '#4a1a8c',
};
let OL = 7; // the standard character outline, in world px (delegate() scales it with the character)

// ---- path helpers ----
function circlesPath(pts) { s.beginPath(); for (const [x, y, r] of pts) { s.moveTo(x + r, y); s.arc(x, y, r, 0, TAU); } }
// a union of circles with a single bold outline: stroke all at 2*lw, then fill all
function blobs(pts, col, lw = OL) {
  s.lineJoin = 'round'; s.lineWidth = lw * 2; s.strokeStyle = K.BLK;
  for (const [x, y, r] of pts) { s.beginPath(); s.arc(x, y, r, 0, TAU); s.stroke(); }
  circlesPath(pts); s.fillStyle = col; s.fill();
}
function inked(pathFn, col, lw = OL) { pathFn(); s.fillStyle = col; s.fill(); s.lineWidth = lw; s.lineJoin = 'round'; s.strokeStyle = K.BLK; s.stroke(); }
function rectP(x, y, w, h, r = 0) { s.beginPath(); if (s.roundRect) s.roundRect(x, y, w, h, r); else s.rect(x, y, w, h); }
function ellP(x, y, rx, ry, a = 0) { s.beginPath(); s.ellipse(x, y, Math.abs(rx), Math.abs(ry), a, 0, TAU); }
const bounce2 = (t, seed, amp) => -Math.abs(Math.sin((onTwos(t) * 1.37 + hash(seed) * 5) * Math.PI)) * amp;

// ---- grounds ----
function flat(col) { s.fillStyle = col; s.fillRect(-200, -200, W + 400, H + 400); }
// radiating bands from (cx, cy), alternating colours, rotating
function rays(cx, cy, n, rot, cols, R = 3000) {
  for (let i = 0; i < n; i++) { const a0 = rot + i / n * TAU, a1 = rot + (i + 1) / n * TAU;
    s.beginPath(); s.moveTo(cx, cy); s.arc(cx, cy, R, a0, a1); s.closePath(); s.fillStyle = cols[i % cols.length]; s.fill(); }
}
// concentric rings that flow outward (phase in ring units), colours cycling
function rings(cx, cy, step, phase, cols, R = 2600) {
  const n = Math.ceil(R / step) + 2, f = phase - Math.floor(phase);
  for (let i = n; i >= 0; i--) { const r = (i + f) * step; if (r <= 0) continue; const ci = ((i - Math.floor(phase)) % cols.length + cols.length * 1000) % cols.length;
    s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.fillStyle = cols[ci]; s.fill(); }
}
// diagonal stripes
function stripes(ang, w, phase, cols) {
  withT(() => { s.translate(W / 2, H / 2); s.rotate(ang); const L = 2400, n = Math.ceil(L * 2 / w) + 2;
    for (let i = 0; i < n; i++) { const x = -L + (i + (phase % 1)) * w - w; s.fillStyle = cols[(i + Math.floor(-phase) * 0 + cols.length * 100) % cols.length]; s.fillRect(x, -L, w + 1, L * 2); } });
}
// moire: two sets of thin rings whose interference crawls as the centres drift
function moire(c1, c2, step, col, lw) {
  s.strokeStyle = col; s.lineWidth = lw;
  for (const [cx, cy] of [c1, c2]) { s.beginPath(); for (let r = step; r < 2400; r += step) { s.moveTo(cx + r, cy); s.arc(cx, cy, r, 0, TAU); } s.stroke(); }
}
// checker tunnel: rings x sectors alternating, rings flowing inward
function checkerTunnel(cx, cy, n, phase, rot, c1, c2, R = 2400) {
  for (let i = 0; i < 26; i++) { const r = R * Math.pow(.84, i - (phase % 1)); const rr = R * Math.pow(.84, i + 1 - (phase % 1));
    for (let j = 0; j < n; j++) { const a0 = rot + j / n * TAU, a1 = rot + (j + 1) / n * TAU;
      s.beginPath(); s.arc(cx, cy, r, a0, a1); s.arc(cx, cy, rr, a1, a0, true); s.closePath();
      s.fillStyle = ((i + j + Math.floor(phase)) % 2) ? c1 : c2; s.fill(); } }
}
// Peter Max starburst: spiky star with alternating long/short points, layered
function starburst(x, y, r0, r1, n, rot, cols, lw = 0) {
  cols.forEach((c, k) => { const sc = 1 - k * .22; s.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU + k * .08, rr = i % 2 ? r0 * sc : r1 * sc * (i % 4 === 0 ? 1 : .78); s.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    s.closePath(); s.fillStyle = c; s.fill(); if (lw && k === 0) { s.lineWidth = lw; s.strokeStyle = K.BLK; s.lineJoin = 'round'; s.stroke(); } });
}
// rainbow arcs (outer first), each band one flat colour
function rainbow(x, y, r, bw, cols, a0 = Math.PI, a1 = TAU, lw = 0) {
  cols.forEach((c, i) => { const ro = r - i * bw, ri = ro - bw; if (ri <= 0) return;
    s.beginPath(); s.arc(x, y, ro, a0, a1); s.arc(x, y, ri, a1, a0, true); s.closePath(); s.fillStyle = c; s.fill();
    if (lw) { s.lineWidth = lw; s.strokeStyle = K.BLK; s.stroke(); } });
}
// whiplash curl: an Art Nouveau spiral stroke from (x, y), unwinding along angle a
function curl(x, y, r, turns, a, col, w, dir = 1) {
  const pts = []; const N = 60;
  for (let i = 0; i <= N; i++) { const u = i / N, th = a + dir * u * turns * TAU, rr = r * (1 - u) ** 1.4; pts.push([x + Math.cos(th) * rr - Math.cos(a) * r * (1 - u) * 0, y + Math.sin(th) * rr]); }
  s.lineCap = 'round'; s.lineJoin = 'round';
  if (w > 0) { s.lineWidth = w + OL * 1.4; s.strokeStyle = K.BLK; s.beginPath(); pts.forEach(([px, py], i) => i ? s.lineTo(px, py) : s.moveTo(px, py)); s.stroke(); }
  s.lineWidth = Math.abs(w); s.strokeStyle = col; s.beginPath(); pts.forEach(([px, py], i) => i ? s.lineTo(px, py) : s.moveTo(px, py)); s.stroke();
}
// a halftone patch: dot size follows f(u, v) in 0..1 (the collage element, drawn as print dots)
function halftone(x, y, w, h, cell, f, col, ang = .26) {
  s.fillStyle = col; s.beginPath(); const ca = Math.cos(ang), sa = Math.sin(ang);
  const cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2 + cell;
  for (let i = -R; i <= R; i += cell) for (let j = -R; j <= R; j += cell) {
    const px = cx + i * ca - j * sa, py = cy + i * sa + j * ca; if (px < x || px > x + w || py < y || py > y + h) continue;
    const v = clamp(f((px - x) / w, (py - y) / h)); if (v < .04) continue; const r = cell * .62 * Math.sqrt(v);
    s.moveTo(px + r, py); s.arc(px, py, r, 0, TAU); }
  s.fill();
}

// ---- balloon lettering: bulgy rounded letters, black outline, colour body, multicolour inline ----
const BFONT = (px) => `${px}px "Arial Rounded MT Bold", "Arial Rounded", "Helvetica Neue", Arial, sans-serif`;
const _bm = {};
function _metrics(str) {
  if (_bm[str]) return _bm[str]; s.save(); s.setTransform(1, 0, 0, 1, 0, 0); s.font = BFONT(100);
  const ws = [...str].map((ch) => s.measureText(ch).width); const m = s.measureText('HOXB'); s.restore();
  return (_bm[str] = { ws, cap: m.actualBoundingBoxAscent, desc: Math.max(0, m.actualBoundingBoxDescent) });
}
// fit `str` into a maxW x maxH box centred on (cx, cy); returns the drawn {w, h, size}. Everything
// (outline and inline included) stays inside the box.
function balloon(str, cx, cy, maxW, maxH, o = {}) {
  const cols = o.cols || [K.LEM, K.PINK, K.ORA, K.TUR], inl = o.inline || K.WHT, swell = o.swell ?? .22, wob = o.wob ?? 0;
  const M = _metrics(str), n = str.length, PAD = .12, TR = .015;
  const ys = [...str].map((_, i) => 1 + swell * Math.sin(Math.PI * (i + .5) / n)), xs = ys.map((y) => 1 + (y - 1) * .45);
  const sumW = M.ws.reduce((a, w, i) => a + w * xs[i], 0) / 100, maxY = Math.max(...ys);
  const S = Math.min(maxW / (sumW + 2 * PAD + TR * (n - 1)), maxH / (M.cap / 100 * maxY + 2 * PAD));
  const k = S / 100, pad = S * PAD, fat = S * .07, ol = S * .05, tw = sumW * S + TR * S * (n - 1);
  const cap = M.cap * k;
  const pos = []; let x = cx - tw / 2;
  for (let i = 0; i < n; i++) { const w = M.ws[i] * k * xs[i]; pos.push([x, w]); x += w + TR * S; }
  const draw = (pass) => {
    for (let i = 0; i < n; i++) { const ch = str[i]; if (ch === ' ') continue; const [lx] = pos[i];
      const r = wob ? snoise(onTwos(o.t || 0) * 3 + i * 1.7, 9) * wob : 0;
      withT(() => { s.translate(lx + pos[i][1] / 2, cy + cap * ys[i] / 2); s.rotate(r); s.scale(xs[i], ys[i]); s.translate(-pos[i][1] / xs[i] / 2, 0);
        s.font = BFONT(S); s.textAlign = 'left'; s.textBaseline = 'alphabetic'; s.lineJoin = 'round'; s.miterLimit = 2;
        const c = cols[(i + (o.cshift || 0)) % cols.length];
        if (pass === 0) { s.lineWidth = (fat + ol) * 2; s.strokeStyle = K.BLK; s.strokeText(ch, 0, 0); }
        if (pass === 1) { s.lineWidth = fat * 2; s.strokeStyle = c; s.strokeText(ch, 0, 0); s.fillStyle = c; s.fillText(ch, 0, 0); }
        if (pass === 2) { s.lineWidth = fat * .55; s.strokeStyle = inl; s.strokeText(ch, 0, 0); s.fillStyle = c; s.fillText(ch, 0, 0); }
      }); }
  };
  if (o.shadow) withT(() => { s.translate(pad * .55, pad * .55); s.globalAlpha = 1; const keep = cols; draw(0); });
  draw(0); draw(1); draw(2);
  return { w: tw + 2 * pad, h: cap * maxY + 2 * pad, size: S };
}

// ---- cast ----
// The cloud body: scalloped puffs round an ellipse plus a big core. Returns circle list (local coords).
function cloudPts(R, seed, n = 9, sq = .62) {
  const r = rng(seed), pts = [[0, -R * .05, R * .66]];
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / n * TAU + (r() - .5) * .25; pts.push([Math.cos(a) * R * .8, Math.sin(a) * R * .8 * sq, R * (.3 + r() * .1)]); }
  return pts;
}
// pattern fill inside the current clip
function pattern(kind, R, col, t = 0) {
  s.fillStyle = col; s.strokeStyle = col;
  if (kind === 'stripes') for (let x = -R * 1.5; x < R * 1.5; x += R * .3) { s.fillRect(x, -R * 1.5, R * .13, R * 3); }
  if (kind === 'hoops') for (let y = -R; y < R; y += R * .28) { s.fillRect(-R * 1.5, y, R * 3, R * .12); }
  if (kind === 'dots') { s.beginPath(); for (let x = -R * 1.4; x < R * 1.4; x += R * .3) for (let y = -R; y < R; y += R * .3) { const xx = x + ((Math.round(y / (R * .3)) & 1) ? R * .15 : 0); s.moveTo(xx + R * .07, y); s.arc(xx, y, R * .07, 0, TAU); } s.fill(); }
  if (kind === 'rings') { s.lineWidth = R * .07; s.beginPath(); for (let r = R * .18; r < R * 1.6; r += R * .2) { s.moveTo(r, R * .25); s.arc(0, R * .25, r, 0, TAU); } s.stroke(); }
  if (kind === 'check') for (let x = -R * 1.5, i = 0; x < R * 1.5; x += R * .25, i++) for (let y = -R, j = 0; y < R; y += R * .25, j++) if ((i + j) & 1) s.fillRect(x, y, R * .25, R * .25);
  if (kind === 'zig') { s.lineWidth = R * .08; s.lineJoin = 'miter'; for (let y = -R; y < R; y += R * .3) { s.beginPath(); for (let x = -R * 1.5, i = 0; x < R * 1.5; x += R * .15, i++) s.lineTo(x, y + (i & 1) * R * .14); s.stroke(); } }
  if (kind === 'swirl') { s.lineWidth = R * .07; for (let k = 0; k < 3; k++) { s.beginPath(); for (let i = 0; i <= 50; i++) { const u = i / 50, a = u * 3 * TAU + k * TAU / 3, rr = u * R * 1.2; s.lineTo(Math.cos(a) * rr, R * .2 + Math.sin(a) * rr * .7); } s.stroke(); } }
}
function hat(kind, R, col, col2) {
  const lw = OL;
  if (kind === 'top') { inked(() => rectP(-R * .32, -R * .78, R * .64, R * .78, R * .04), col, lw); withT(() => { rectP(-R * .32, -R * .78, R * .64, R * .78); s.clip(); s.fillStyle = col2; for (let y = -R * .7; y < 0; y += R * .2) s.fillRect(-R, y, R * 2, R * .08); }); inked(() => rectP(-R * .32, -R * .78, R * .64, R * .78, R * .04), 'rgba(0,0,0,0)', lw); inked(() => ellP(0, 0, R * .55, R * .1), col, lw); }
  if (kind === 'bowler') { inked(() => { s.beginPath(); s.ellipse(0, 0, R * .34, R * .36, 0, Math.PI, TAU); s.closePath(); }, col, lw); inked(() => ellP(0, 0, R * .52, R * .09), col, lw); inked(() => rectP(-R * .34, -R * .12, R * .68, R * .08), col2, lw * .6); }
  if (kind === 'fez') { inked(() => { s.beginPath(); s.moveTo(-R * .26, 0); s.lineTo(-R * .2, -R * .42); s.lineTo(R * .2, -R * .42); s.lineTo(R * .26, 0); s.closePath(); }, col, lw); s.lineWidth = lw * .8; s.strokeStyle = K.BLK; s.beginPath(); s.moveTo(0, -R * .42); s.quadraticCurveTo(R * .3, -R * .5, R * .3, -R * .15); s.stroke(); dot(R * .3, -R * .12, R * .06, col2); }
  if (kind === 'boater') { inked(() => rectP(-R * .3, -R * .24, R * .6, R * .24), col, lw); inked(() => rectP(-R * .3, -R * .13, R * .6, R * .09), col2, lw * .6); inked(() => ellP(0, 0, R * .6, R * .08), col, lw); }
  if (kind === 'flower') { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; inked(() => ellP(Math.cos(a) * R * .17, -R * .2 + Math.sin(a) * R * .17, R * .12, R * .12), col, lw * .7); } inked(() => ellP(0, -R * .2, R * .11, R * .11), col2, lw * .7); s.lineWidth = lw * .8; s.strokeStyle = K.BLK; s.beginPath(); s.moveTo(0, -R * .05); s.lineTo(0, 0); s.stroke(); }
}
// almond / dot eyes, Edelmann style: big whites, tiny pupils looking somewhere
function eyes(R, look = [0, 0], kind = 'almond', shut = 0) {
  for (const sx of [-1, 1]) { const ex = sx * R * .22, ey = -R * .16;
    if (kind === 'dot') { dot(ex + look[0] * R * .03, ey, R * .055, K.BLK); continue; }
    const ry = R * .13 * (1 - shut * .9);
    inked(() => { s.beginPath(); s.ellipse(ex, ey, R * .1, Math.max(1, ry), 0, 0, TAU); }, K.WHT, OL * .7);
    if (shut < .6) dot(ex + look[0] * R * .045, ey + look[1] * R * .05, R * .04, K.BLK); }
}
function mouth(R, kind = 'smile', open = 0) {
  s.lineWidth = OL * .8; s.strokeStyle = K.BLK; s.lineCap = 'round';
  if (kind === 'smile') { s.beginPath(); s.arc(0, R * .05, R * .14, .25 * Math.PI, .75 * Math.PI); s.stroke(); }
  if (kind === 'o') inked(() => ellP(0, R * .1, R * .05 + open * R * .04, R * .06 + open * R * .07), K.RED, OL * .7);
  if (kind === 'huff') { s.beginPath(); s.arc(0, R * .2, R * .1, 1.2 * Math.PI, 1.8 * Math.PI); s.stroke(); }
  if (kind === 'grin') inked(() => { s.beginPath(); s.arc(0, R * .02, R * .17, .1 * Math.PI, .9 * Math.PI); s.closePath(); }, K.RED, OL * .7);
}
// a mitten hand that grows out of a cloud puff: k=0 a puff, k=1 an open hand with four fingers + thumb
function cloudHand(x, y, r, k, col, ang = 0) {
  withT(() => { s.translate(x, y); s.rotate(ang);
    const pts = [[0, 0, r]];
    for (let i = 0; i < 4; i++) { const fx = (i - 1.5) * r * .48, L = r * (.25 + k * (i === 1 || i === 2 ? 1.05 : .85));
      for (let j = 0; j <= 4; j++) pts.push([fx, -j / 4 * L - r * .3, r * .26]); }
    for (let j = 0; j <= 3; j++) pts.push([-r * .75 - j * r * .15 * k, r * .1 - j * r * .12 * k, r * .24]);
    blobs(pts, col, OL * .8);
    s.lineWidth = OL * .5; s.strokeStyle = K.BLK; s.beginPath(); s.arc(0, r * .15, r * .45, .15 * Math.PI, .85 * Math.PI); s.stroke(); });
}
// A cloud delegate. o: col, pcol, pat, hat, hcol, hcol2, eye, look, mouth, arm (0..1 raises right hand
// as a cloud hand), legs (true: standing on tiny feet), monocle, shut, t (for bounce on twos), seed
function delegate(x, y, R, o = {}) {
  const OL0 = OL; OL = 7 * clamp(R / 130, .85, 1.9);
  try { _delegate(x, y, R, o); } finally { OL = OL0; }
}
function _delegate(x, y, R, o) {
  const seed = o.seed || 1, by = o.t !== undefined && o.bounce !== 0 ? bounce2(o.t, seed, R * (o.bounce ?? .06)) : 0;
  withT(() => { s.translate(x, y + by); if (o.squash) s.scale(1 + o.squash, 1 - o.squash);
    if (o.flip) s.scale(-1, 1);
    if (o.legs) { s.lineWidth = OL * .9; s.strokeStyle = K.BLK; s.lineCap = 'round';
      for (const sx of [-1, 1]) { s.beginPath(); s.moveTo(sx * R * .22, R * .3); s.lineTo(sx * R * .24, R * .78); s.stroke(); inked(() => ellP(sx * R * .24 + sx * R * .06, R * .8, R * .11, R * .06), o.shoe || K.RED, OL * .7); } }
    const pts = cloudPts(R, seed, 9, o.sq ?? .62);
    blobs(pts, o.col || K.WHT);
    if (o.pat) withT(() => { circlesPath(pts); s.clip(); s.beginPath(); s.rect(-R * 2, R * .14, R * 4, R * 2); s.clip(); pattern(o.pat, R, o.pcol || K.LEM, o.t); s.lineWidth = OL; s.strokeStyle = K.BLK; s.beginPath(); s.moveTo(-R * 2, R * .14); s.lineTo(R * 2, R * .14); s.stroke(); });
    dot(-R * .38, R * .0, R * .07, o.cheek || K.PINK); dot(R * .38, R * .0, R * .07, o.cheek || K.PINK);
    eyes(R, o.look || [0, 0], o.eye || 'almond', o.shut || 0);
    if (o.monocle) { s.lineWidth = OL * .6; s.strokeStyle = K.BLK; s.beginPath(); s.arc(R * .22, -R * .16, R * .15, 0, TAU); s.stroke(); s.beginPath(); s.moveTo(R * .36, -R * .1); s.quadraticCurveTo(R * .5, R * .1, R * .42, R * .3); s.stroke(); }
    if (o.tache) { curl(-R * .02, R * -.0, R * .16, .9, 0, K.BLK, -OL * 1.1, -1); curl(R * .02, R * -.0, R * .16, .9, Math.PI, K.BLK, -OL * 1.1, 1); }
    mouth(R, o.mouth || 'smile', o.open || 0);
    if (o.hat) withT(() => { s.translate(o.hatX ?? R * .05, -R * .62); s.rotate(o.hatR ?? -.08); hat(o.hat, R, o.hcol || K.VIO, o.hcol2 || K.LEM); });
    if (o.arm !== undefined) { const k = o.arm, ax = R * .72, ay = R * .05, hx = ax + R * .25 + (1 - k) * R * .1, hy = lerp(ay + R * .2, -R * 1.15, ease.back(k));
      s.lineWidth = OL; s.strokeStyle = K.BLK; s.lineCap = 'round'; s.beginPath(); s.moveTo(ax, ay); s.quadraticCurveTo(ax + R * .35, lerp(ay, hy, .2), hx, hy + R * .2); s.stroke();
      cloudHand(hx, hy, R * .2 * (0.7 + k * .5), k, o.hand || K.WHT, lerp(.5, -.1, k)); }
  });
}
// the ministry as a pop-art cut-out: stepped grey blocks, black stacks, window grids; no outline
function ministry(x, base, w, h, o = {}) {
  const r = rng(o.seed || 7), blocks = [];
  let cx = x - w / 2; while (cx < x + w / 2) { const bw = w * (.08 + r() * .1), bh = h * (.45 + r() * .55); blocks.push([cx, bw, bh]); cx += bw; }
  blocks.forEach(([bx, bw, bh], i) => { s.fillStyle = [K.G2, K.G3, K.G1, K.G3][i % 4]; s.fillRect(bx, base - bh, bw + 1, bh + 400);
    s.fillStyle = i % 2 ? K.G4 : K.G2; for (let wy = base - bh + 30; wy < base - 20; wy += 46) for (let wx = bx + 16; wx < bx + bw - 26; wx += 34) s.fillRect(wx, wy, 14, 22);
    s.fillStyle = K.G4; s.fillRect(bx, base - bh, bw + 1, 10); });
  return blocks;
}
function stack(x, base, w, h, col = K.G4) { s.fillStyle = col; s.fillRect(x - w / 2, base - h, w, h + 400); s.fillStyle = K.BLK; s.fillRect(x - w * .62, base - h - 18, w * 1.24, 26); for (let y = base - h + 50; y < base; y += 70) { s.fillStyle = K.G3; s.fillRect(x - w / 2, y, w, 10); } }
// smoke as coloured swirls rising from (x, y): a chain of thick spiral puffs, scrolling up with t
function smoke(x, y, t, cols, scale = 1, lean = 0) {
  for (let i = 5; i >= 0; i--) { const u = i + (t * .9 % 1), py = y - u * 120 * scale, px = x + Math.sin(u * 1.3 + t) * 30 * scale + lean * u * 60 * scale, rr = (40 + u * 26) * scale;
    curl(px, py, rr, 1.6, u * 2 + t * 1.5, cols[(i + Math.floor(t * .9)) % cols.length], 22 * scale, i % 2 ? 1 : -1); }
}
// a pop-art plane cut-out, nose to the right; prop spins on twos
function plane(x, y, sc, t, col = K.G1) {
  withT(() => { s.translate(x, y); s.scale(sc, sc);
    inked(() => { s.beginPath(); s.moveTo(-160, -10); s.lineTo(-200, -70); s.lineTo(-165, -70); s.lineTo(-120, -22); s.lineTo(120, -26); s.quadraticCurveTo(175, -22, 180, 0); s.quadraticCurveTo(175, 24, 120, 26); s.lineTo(-150, 18); s.closePath(); }, col);
    inked(() => { s.beginPath(); s.moveTo(-20, 0); s.lineTo(40, 0); s.lineTo(-30, 95); s.lineTo(-70, 95); s.closePath(); }, K.G2);
    s.fillStyle = K.TUR; s.fillRect(-130, -6, 240, 10);
    for (let i = 0; i < 5; i++) inked(() => ellP(-60 + i * 34, -12, 8, 8), K.LEM, 4);
    const a = onTwos(t) * 40; s.lineWidth = 9; s.strokeStyle = K.BLK; s.beginPath(); s.moveTo(182, Math.sin(a) * 60); s.lineTo(182, -Math.sin(a) * 60); s.stroke(); dot(184, 0, 10, K.RED); });
}
// the sun, Edelmann-ish: a flat disc with a wavy ray crown and a sleepy face
function sun(x, y, r, t, o = {}) {
  withT(() => { s.translate(x, y); const n = 16, rot = (o.rot ?? t * .3);
    s.beginPath(); for (let i = 0; i <= n * 8; i++) { const a = rot + i / (n * 8) * TAU, rr = r * (1.35 + .22 * Math.sin(a * n - rot * 3)); s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } s.closePath();
    s.fillStyle = o.ray || K.ORA; s.fill(); s.lineWidth = OL; s.strokeStyle = K.BLK; s.lineJoin = 'round'; s.stroke();
    inked(() => ellP(0, 0, r, r), o.col || K.LEM);
    if (o.face !== false) { const sh = o.shut ?? 1; s.lineWidth = OL * .8; s.strokeStyle = K.BLK; s.lineCap = 'round';
      for (const sx of [-1, 1]) { if (sh > .5) { s.beginPath(); s.arc(sx * r * .32, -r * .12, r * .14, .1 * Math.PI, .9 * Math.PI); s.stroke(); } else { inked(() => ellP(sx * r * .32, -r * .12, r * .13, r * .16), K.WHT, OL * .7); dot(sx * r * .32, -r * .1, r * .05, K.BLK); } }
      dot(-r * .55, r * .18, r * .11, K.MAG); dot(r * .55, r * .18, r * .11, K.MAG);
      s.beginPath(); s.arc(0, r * .2, r * .26, .15 * Math.PI, .85 * Math.PI); s.stroke(); } });
}
// a gavel: head centred on (0,0) of local space after translate/rotate by caller; handle runs +y
function gavel(len, hw, hh, col = K.ORA, band = K.LEM) {
  inked(() => rectP(-hw * .12, 0, hw * .24, len, hw * .1), K.MAG);
  inked(() => rectP(-hw / 2, -hh / 2, hw, hh, hh * .25), col);
  inked(() => rectP(-hw * .5, -hh * .16, hw * .14, hh * .32), band, OL * .6); inked(() => rectP(hw * .36, -hh * .16, hw * .14, hh * .32), band, OL * .6);
}
// a sign with balloon lettering fitted inside with margin
function sign(x, y, w, h, str, o = {}) {
  withT(() => { s.translate(x, y); s.rotate(o.rot || 0); if (o.sc) s.scale(o.sc, o.sc);
    if (o.pole) { inked(() => rectP(-12, h / 2 - 4, 24, o.pole), K.ORA); }
    inked(() => rectP(-w / 2, -h / 2, w, h, o.r ?? 18), o.bg || K.WHT, OL);
    if (o.border) { s.lineWidth = OL * .7; s.strokeStyle = o.border; s.beginPath(); if (s.roundRect) s.roundRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 10); s.stroke(); }
    const m = o.m ?? .1; const lines = Array.isArray(str) ? str : [str], lh = (h * (1 - 2 * m)) / lines.length;
    lines.forEach((ln, i) => balloon(ln, 0, -h / 2 + h * m + lh * (i + .5), w * (1 - 2 * m), lh * .92, o)); });
}
