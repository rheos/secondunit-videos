// Verse 1 alternative for lancet 0 (line V1.l1, window 22.0-33.4): "the confession".
// She sits in a wooden confessional booth; its side window is a tall gold quatrefoil grille, and on the
// other side the three mountains crowd up to it and peer through the holes. On V1.trying she leans in and
// so do they; on V1.mountains they shift and their eyes slide away; on V1.confess / V1.fess the tall
// middle peak's snowcap blushes rose and one clear glass tear wells up. Backing bk1: eyes averted, the tear
// starts down the face. bk2: the tear lands in a little glass puddle on the ledge; the blush fades slowly.
// Loads after v1-scenes.js (uses V1_SKY, v1Upper, v1Clouds, v1RH, v1HalfW) and swaps V1SCENES[0].

// ---------------- layout (world units; lancet 0 field is x 196-904) ----------------
const v1aConfessG = { x0: 420, x1: 620, cx: 520, top: 900, rows: 9, cols: 3, fr: 20, hole: 18, base: 1430 };
v1aConfessG.cw = (v1aConfessG.x1 - v1aConfessG.x0 - 2 * v1aConfessG.fr) / v1aConfessG.cols; // 53.3
v1aConfessG.bot = v1aConfessG.top + v1aConfessG.rows * v1aConfessG.cw;                     // 1380
const v1aConfessLEDGE = 1428;
const v1aConfessW = { x: 318, y: 1160, s: .5 };
// right (furthest back), small one pressed behind the grille (its eyes sit on a row of holes), tall middle (front)
const v1aConfessM = [
  { x: 884, y: 1010, hw: 240, base: 1900, col: [60, 52, 140], snow: 74, seed: 3220, es: .95 },
  { x: 0, y: 0, hw: 230, base: 1900, col: C.blue2, snow: 70, seed: 3200, es: 1.212 },
  { x: 748, y: 828, hw: 300, base: 1900, col: C.purple, snow: 100, seed: 3210, es: 1.05 },
];
(() => { // put the small mountain's eyes exactly on two holes of row 3
  const G = v1aConfessG, m = v1aConfessM[1], c1 = G.x0 + G.fr + G.cw * 1.5, c2 = c1 + G.cw;
  m.es = G.cw / 44; m.x = (c1 + c2) / 2; m.y = G.top + G.cw * 3.5 - m.snow - 46;
})();

// ---------------- timing ----------------
function v1aConfessKeys(keys, t, dur = .32) { // keys [t0, a, b]: from t0 ease to (a, b) over dur
  let a = keys[0][1], b = keys[0][2];
  for (let k = 1; k < keys.length; k++) { const u = ease(t, keys[k][0], keys[k][0] + dur); if (u <= 0) break; a = lerp(a, keys[k][1], u); b = lerp(b, keys[k][2], u); }
  return [a, b];
}
const v1aConfessLOOK = [ // per mountain [t, pupil x (-1 = at her), pupil y (-1 up)]
  [[0, -.5, 0], [V1.trying + .25, -1, 0], [V1.mountains + .05, 1, 0], [V1.bk1 + .05, .6, -1], [V1.bk2 + .1, 1, .5], [32.0, 1, -.3]],
  [[0, -.6, 0], [V1.trying + .3, -1, .2], [V1.mountains + .1, 1, 0], [V1.bk1 + .1, 1, -1], [V1.bk2 + .15, -.1, -1], [31.6, 1, -.6]],
  [[0, -.3, 0], [V1.trying + .2, -1, 0], [V1.mountains, 1, -.3], [V1.confess, .1, 1], [V1.bk1, 1, -.8], [29.2, -1, .1], [29.7, 1, -.8], [V1.bk2, .3, -1], [31.9, 1, .3]],
];
function v1aConfessLean(t) { // skew of the mountains toward the grille (tops move left)
  const inn = ease(t, V1.trying + .15, V1.trying + .9), back = ease(t, V1.mountains - .05, V1.mountains + .45);
  return .06 * inn * (1 - .55 * back) * (1 - .45 * ease(t, V1.bk2 + .6, V1.bk2 + 2.2));
}
function v1aConfessShuffle(t, k) { // the guilty shuffle between V1.mountains and V1.confess
  const env = ease(t, V1.mountains, V1.mountains + .2) * (1 - ease(t, V1.confess - .2, V1.confess + .3));
  return .012 * env * Math.sin((t - V1.mountains) * 10 + k * 2.1);
}
function v1aConfessBlush(t) { return ease(t, V1.confess - .02, V1.fess + .3) * (1 - .82 * ease(t, V1.bk2 - .6, 33.6)); }
function v1aConfessHerLean(t) { return ease(t, V1.trying - .15, V1.trying + .55) * (1 - .8 * ease(t, 31.0, 32.6)); }
const v1aConfessTEAR = { well: V1.fess + .05, run: V1.bk1 + .1, land: V1.bk2 };

// ---------------- shapes ----------------
// n-foil outline as points: n lobes of radius r at distance d from the centre (r + d = R), first lobe at a0.
function v1aConfessFoil(cx, cy, R, n = 4, a0 = 0, m = 56) {
  const d = R * (n === 3 ? .4 : .42), r = R - d, pts = [];
  for (let i = 0; i < m; i++) {
    const th = i / m * TAU; let best = 0;
    for (let k = 0; k < n; k++) { const ph = th - (a0 + k * TAU / n), s = Math.sin(ph); best = Math.max(best, d * Math.cos(ph) + Math.sqrt(Math.max(0, r * r - d * d * s * s))); }
    pts.push([cx + Math.cos(th) * best, cy + Math.sin(th) * best]);
  }
  return pts;
}
function v1aConfessHolePath(pts, p = new Path2D()) { // appended reversed so it cuts a hole under nonzero fill
  const q = pts.slice().reverse(); q.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); return p;
}
function v1aConfessHoles() {
  const G = v1aConfessG, out = [];
  for (let r = 0; r < G.rows; r++) for (let c = 0; c < G.cols; c++) {
    const x0 = G.x0 + G.fr + c * G.cw, y0 = G.top + r * G.cw;
    out.push({ r, c, x0, y0, cx: x0 + G.cw / 2, cy: y0 + G.cw / 2 });
  }
  return out;
}
const v1aConfessHOLES = v1aConfessHoles();

// ---------------- mountains (a copy of v1Mountain with a blushing cap, pupils that look up/down, lids) ----------------
function v1aConfessMountain(g, m, t, f) {
  const pts = v1MountainPts(m), body = polyPath(pts);
  pane(g, body, m.col, m.seed, { ew: 40, shade: .34 });
  g.save(); g.clip(body);
  paint(g, 5, .32);
  g.beginPath(); g.moveTo(m.x, m.y); g.lineTo(m.x + m.hw * .12, m.y + (m.base - m.y) * .5); g.lineTo(m.x + m.hw * .05, m.base); g.stroke();
  g.beginPath(); g.moveTo(m.x - m.hw * .2, m.y + (m.base - m.y) * .22); g.lineTo(m.x - m.hw * .32, m.base); g.stroke();
  g.restore();
  const sy = m.y + m.snow, w = v1HalfW(m, sy), blush = f.blush || 0;
  const capPts = [[m.x - w - 4, sy], [m.x - 18, m.y + 26], [m.x, m.y], [m.x + 22, m.y + 30], [m.x + w + 4, sy]];
  for (let k = 5; k >= 1; k--) capPts.push([lerp(m.x - w, m.x + w, k / 6), sy + (k % 2 ? 26 : -4)]);
  const cap = polyPath(capPts);
  g.save(); g.clip(body); pane(g, cap, mix(C.white, [246, 128, 162], blush), m.seed + 1, { ew: 16, amt: .4, lw: 7 }); g.restore();
  if (blush > .02) { // the flush glows a little in the glass
    g.save(); g.clip(body); g.clip(cap); g.globalCompositeOperation = 'lighter';
    const rg = g.createRadialGradient(m.x, m.y + m.snow * .55, 0, m.x, m.y + m.snow * .55, w + 30);
    rg.addColorStop(0, `rgba(255,120,150,${.28 * blush})`); rg.addColorStop(1, 'rgba(255,120,150,0)');
    g.fillStyle = rg; g.fillRect(m.x - w - 40, m.y - 10, 2 * w + 80, m.snow + 40); g.restore();
  }
  const ey = m.y + m.snow + 46, es = m.es || 1, lx_ = (f.look || 0) * 5, ly_ = (f.lookY || 0) * 3.5, wide = f.wide || 0, lid = f.lid || 0;
  g.save(); g.translate(m.x, ey); g.scale(es, es);
  if (blush > .02) { g.fillStyle = `rgba(236,96,130,${.5 * blush})`; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 30, 20, 13, 6, 0, 0, TAU); g.fill(); } }
  for (const s of [-1, 1]) {
    const eye = ellPath(s * 22, 0, 15, 10);
    pane(g, eye, [236, 232, 222], m.seed + 4 + s, { ew: 5, lw: 4, shade: .2, amt: .2 });
    g.save(); g.clip(eye);
    g.fillStyle = 'rgba(42,24,12,.92)'; g.beginPath(); g.arc(s * 22 + lx_, 2 + ly_, 5, 0, TAU); g.fill();
    if (lid > .01) { g.fillStyle = rgb(mix(m.col, [0, 0, 0], .12)); g.fillRect(s * 22 - 16, -11, 32, 2 + lid * 13); }
    g.restore();
    paint(g, 4.5); g.beginPath(); g.moveTo(s * 22 - 16, -2 - wide * 6 + lid * 9); g.quadraticCurveTo(s * 22, -10 - wide * 8 + lid * 9, s * 22 + 16, -2 - wide * 6 + lid * 9); g.stroke();
    g.lineWidth = 3.5; g.beginPath(); g.moveTo(s * 22 - 18, -18 - wide * 6); g.lineTo(s * 22 + 14, -18 - wide * 6 + s * (f.worry || 0) * -5); g.stroke();
  }
  paint(g, 4); g.beginPath(); g.moveTo(-14, 34); g.lineTo(14, 34); g.stroke();
  g.restore();
}
// Skew about the base so the mountain leans: tops move left by k per unit of height.
function v1aConfessSkewX(x, y, m, k) { return x + k * (y - m.base); }

// ---------------- the grille ----------------
function v1aConfessArch(side, R, sx, cxArc) { // pointed-arch half: points from the springing up to the apex
  const pts = []; for (let k = 0; k <= 10; k++) { const a = lerp(-Math.PI, -2 * Math.PI / 3, k / 10); pts.push([cxArc + R * Math.cos(a), v1aConfessG.top + R * Math.sin(a)]); }
  return side < 0 ? pts : pts.map(([x, y]) => [2 * v1aConfessG.cx - x, y]);
}
function v1aConfessGrille(g, t) {
  const G = v1aConfessG, cw = G.cw;
  // the lattice: one gold piece per cell, each pierced by a quatrefoil
  for (const H of v1aConfessHOLES) {
    const p = polyPath([[H.x0, H.y0], [H.x0 + cw, H.y0], [H.x0 + cw, H.y0 + cw], [H.x0, H.y0 + cw]]);
    v1aConfessHolePath(v1aConfessFoil(H.cx, H.cy, G.hole), p);
    pane(g, p, (H.r + H.c) % 2 ? C.gold : [232, 184, 52], 3800 + H.r * 7 + H.c, { ew: 12, lw: 5, shade: .28, amt: .5 });
  }
  // grisaille: a traced line round each hole and a dot where four pieces meet
  paint(g, 2.2, .5);
  for (const H of v1aConfessHOLES) { g.stroke(polyPath(v1aConfessFoil(H.cx, H.cy, G.hole + 6))); }
  g.fillStyle = 'rgba(42,24,12,.75)';
  for (let r = 1; r < G.rows; r++) for (let c = 1; c < G.cols; c++) { const x = G.x0 + G.fr + c * cw, y = G.top + r * cw; g.beginPath(); g.moveTo(x, y - 6); g.lineTo(x + 6, y); g.lineTo(x, y + 6); g.lineTo(x - 6, y); g.closePath(); g.fill(); }
  // light coming through the holes
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const H of v1aConfessHOLES) { g.fillStyle = 'rgba(255,240,196,.16)'; g.fill(polyPath(v1aConfessFoil(H.cx, H.cy, G.hole - 2))); }
  g.restore();
  // stiles: alternating amber and gold pieces with ruby beads at the joins
  for (const [a, b] of [[G.x0, G.x0 + G.fr], [G.x1 - G.fr, G.x1]]) {
    const n = 6;
    for (let k = 0; k < n; k++) { const y0 = lerp(G.top, G.base, k / n), y1 = lerp(G.top, G.base, (k + 1) / n); pane(g, polyPath([[a, y0], [b, y0], [b, y1], [a, y1]]), k % 2 ? C.amber : C.gold, 3830 + k + (a > G.cx ? 10 : 0), { ew: 8, lw: 6 }); }
    for (let k = 1; k < n; k++) pane(g, circPath((a + b) / 2, lerp(G.top, G.base, k / n), 7), C.ruby, 3850 + k + (a > G.cx ? 10 : 0), { ew: 4, lw: 4 });
  }
  // bottom rail between the lattice and the ledge
  const rn = 5;
  for (let k = 0; k < rn; k++) { const a = lerp(G.x0 + G.fr, G.x1 - G.fr, k / rn), b = lerp(G.x0 + G.fr, G.x1 - G.fr, (k + 1) / rn); pane(g, polyPath([[a, G.bot], [b, G.bot], [b, G.base], [a, G.base]]), k % 2 ? C.ruby : C.gold, 3870 + k, { ew: 10, lw: 6 }); }
  // tympanum under the arch: blue ground with a ruby trefoil in a gold ring
  const inL = v1aConfessArch(-1, 160, 0, G.x1 - G.fr), inR = v1aConfessArch(1, 160, 0, G.x1 - G.fr).reverse();
  pane(g, polyPath([...inL, ...inR.slice(1)]), C.blue, 3880, { ew: 22, lw: 6 });
  const ty = G.top - 62;
  pane(g, circPath(G.cx, ty, 36), C.gold, 3881, { ew: 10, lw: 6 });
  pane(g, polyPath(v1aConfessFoil(G.cx, ty, 30, 3, -Math.PI / 2)), C.ruby, 3882, { ew: 10, lw: 5 });
  pane(g, circPath(G.cx, ty + 3, 8), C.gold, 3883, { ew: 4, lw: 4 });
  // the arch band in pieces, with gold crockets along its back
  for (const side of [-1, 1]) {
    const out = v1aConfessArch(side, 200, 0, G.x1), inn = v1aConfessArch(side, 160, 0, G.x1 - G.fr);
    for (let k = 0; k < 5; k++) {
      const i0 = k * 2, i1 = k * 2 + 2, q = [out[i0], out[i1], inn[i1], inn[i0]];
      pane(g, polyPath(q), k % 2 ? C.amber : C.gold, 3890 + k + (side > 0 ? 10 : 0), { ew: 8, lw: 6 });
    }
    for (const k of [3, 6, 9]) { // crockets: small leaves pointing outward
      const [x, y] = out[k], [x2, y2] = out[k - 1], nx = (y - y2), ny = -(x - x2), l = Math.hypot(nx, ny) || 1, s = side < 0 ? 1 : -1;
      const ux = s * nx / l, uy = s * ny / l;
      pane(g, ellPath(x + ux * 12, y + uy * 12, 13, 7, Math.atan2(uy, ux)), C.gold, 3910 + k + (side > 0 ? 20 : 0), { ew: 5, lw: 4 });
    }
  }
  // finial: a small gold trefoil on the apex with a ruby bead
  const ax = G.cx, ay = G.top - 200 * Math.sin(Math.PI / 3);
  pane(g, polyPath(v1aConfessFoil(ax, ay - 16, 17, 3, -Math.PI / 2)), C.gold, 3940, { ew: 6, lw: 5 });
  pane(g, circPath(ax, ay - 13, 5.5), C.ruby, 3941, { ew: 3, lw: 3 });
  // a glint runs down the gold on "confess"
  const gu = lin(t, V1.confess - .1, V1.confess + .7);
  if (gu > 0 && gu < 1) {
    g.save(); const all = new Path2D(); all.rect(G.x0, G.top - 180, G.x1 - G.x0, G.base - G.top + 180); g.clip(all);
    g.globalCompositeOperation = 'lighter'; const y = lerp(G.top - 200, G.base + 60, gu);
    const lg = g.createLinearGradient(0, y - 60, 0, y + 60); lg.addColorStop(0, 'rgba(255,240,190,0)'); lg.addColorStop(.5, `rgba(255,240,190,${.32 * Math.sin(Math.PI * gu)})`); lg.addColorStop(1, 'rgba(255,240,190,0)');
    g.fillStyle = lg; g.fillRect(G.x0, y - 60, G.x1 - G.x0, 120); g.restore();
  }
}
// Quatrefoil patches of light thrown through the grille onto her side (booth wall and her).
function v1aConfessSpots(g, t, a) {
  const G = v1aConfessG;
  g.save(); const cl = new Path2D(); cl.rect(lx(0) + BORD - 10, G.top - 40, G.x0 - lx(0) - BORD + 10, G.base - G.top + 40); g.clip(cl);
  g.globalCompositeOperation = 'lighter';
  for (const H of v1aConfessHOLES) {
    const x = H.cx - 176 + H.r * 4, y = H.cy + 46;
    g.fillStyle = `rgba(255,226,150,${a})`; g.fill(polyPath(v1aConfessFoil(x, y, G.hole * 1.15, 4, 0, 32)));
  }
  g.restore();
}

// ---------------- the booth (her side) ----------------
function v1aConfessBooth(g) {
  const G = v1aConfessG, x0 = lx(0) + BORD - 20, x1 = G.x0, top = G.top - 30, pw = (x1 - x0) / 4;
  const wood = [[96, 52, 26], [112, 60, 28], [86, 46, 24], [104, 56, 30]];
  for (let k = 0; k < 4; k++) pane(g, polyPath([[x0 + k * pw, top], [x0 + (k + 1) * pw, top], [x0 + (k + 1) * pw, v1aConfessLEDGE], [x0 + k * pw, v1aConfessLEDGE]]), wood[k], 3960 + k, { ew: 26, shade: .4, lw: 7 });
  paint(g, 3, .35); // wood grain
  for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) { const x = x0 + k * pw + pw * (.25 + j * .25); g.beginPath(); g.moveTo(x, top + 20); g.bezierCurveTo(x + 6, top + 200, x - 6, top + 380, x + 3, v1aConfessLEDGE - 10); g.stroke(); }
  // a murrey curtain at the booth's open side, gathered on a gold rod
  const cx0 = lx(0) + BORD - 20, cx1 = cx0 + 74;
  const cur = smoothPath([[cx0, top + 8], [cx1, top + 8], [cx1 - 6, top + 160], [cx1 + 10, top + 330], [cx1 - 4, v1aConfessLEDGE + 30], [cx0, v1aConfessLEDGE + 30]]);
  pane(g, cur, C.murrey, 3970, { ew: 26, shade: .4 });
  g.save(); g.clip(cur); paint(g, 8, .25); for (const f of [.3, .62]) { g.beginPath(); g.moveTo(lerp(cx0, cx1, f), top + 20); g.quadraticCurveTo(lerp(cx0, cx1, f) + 10, top + 300, lerp(cx0, cx1, f) - 4, v1aConfessLEDGE + 20); g.stroke(); } g.restore();
  // cornice: a gold crenellated band over the booth, meeting the grille's stile
  const cy = top - 34, n = 7;
  for (let k = 0; k < n; k++) { const a = lerp(x0, x1 + 4, k / n), b = lerp(x0, x1 + 4, (k + 1) / n); pane(g, polyPath([[a, cy], [b, cy], [b, top + 8], [a, top + 8]]), k % 2 ? C.amber : C.gold, 3980 + k, { ew: 10, lw: 6 }); }
  for (let k = 0; k < n; k += 2) { const a = lerp(x0, x1 + 4, k / n), b = lerp(x0, x1 + 4, (k + 1) / n); pane(g, polyPath([[a + 4, cy - 26], [b - 4, cy - 26], [b - 4, cy], [a + 4, cy]]), C.gold, 3990 + k, { ew: 8, lw: 6 }); }
}
function v1aConfessLedge(g) {
  const x0 = lx(0) - 20, x1 = lx(0) + LW + 20, y = v1aConfessLEDGE;
  // panelled front below the ledge
  pane(g, polyPath([[x0, y + 50], [x1, y + 50], [x1, YB + 40], [x0, YB + 40]]), [92, 50, 24], 4000, { ew: 40, shade: .4 });
  for (let k = 0; k < 3; k++) {
    const a = lx(0) + 70 + k * 230, b = a + 190;
    pane(g, polyPath([[a, y + 110], [b, y + 110], [b, y + 520], [a, y + 520]]), [120, 66, 30], 4001 + k, { ew: 30, shade: .45, lw: 7 });
    pane(g, polyPath(v1aConfessFoil((a + b) / 2, y + 220, 34)), C.gold, 4005 + k, { ew: 10, lw: 6 });
  }
  pane(g, polyPath([[x0, y], [x1, y], [x1, y + 22], [x0, y + 22]]), [206, 146, 72], 4010, { ew: 10, lw: 7, shade: .2 });
  pane(g, polyPath([[x0, y + 22], [x1, y + 22], [x1, y + 52], [x0, y + 52]]), [134, 72, 30], 4011, { ew: 14, lw: 7 });
}

// ---------------- the tear ----------------
// Returns {x, y, r, a} of the bead in world coords, or null. It wells at the outer corner of the middle
// peak's right eye, rolls down the face in fits and starts, and drops onto the ledge on bk2.
function v1aConfessTear(t, k) {
  const m = v1aConfessM[2], T = v1aConfessTEAR, es = m.es, ey = m.y + m.snow + 46;
  if (t < T.well) return null;
  const ex = m.x + 32 * es, y0 = ey + 9 * es;
  if (t < T.run) { const u = ease(t, T.well, T.well + .5); return { x: v1aConfessSkewX(ex, y0, m, k), y: y0 + 4 * u, r: lerp(2, 12, u), a: 1 }; }
  if (t < T.land) {
    const u = lin(t, T.run, T.land), p = Math.pow(u + .07 * Math.sin(u * Math.PI * 4) / (Math.PI * 4) * 4, 1.25);
    const x = ex + 8 * Math.sin(p * 2.6), y = lerp(y0 + 4, v1aConfessLEDGE - 7, clamp(p));
    return { x: v1aConfessSkewX(x, y, m, k), y, r: 12 + 2 * p, a: 1, p };
  }
  return null;
}
function v1aConfessBead(g, x, y, r, a, seed) {
  g.save(); g.globalAlpha = a;
  pane(g, smoothPath([[x, y - r * 1.5], [x + r * .9, y], [x, y + r], [x - r * .9, y]]), [196, 226, 244], seed, { ew: 4, lw: 3.2, shade: .15, amt: .2 });
  g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(x - r * .3, y - r * .25, r * .26, 0, TAU); g.fill();
  g.restore();
}
function v1aConfessTearDraw(g, t, k) {
  const m = v1aConfessM[2], T = v1aConfessTEAR, ex = m.x + 32 * m.es, y0 = m.y + m.snow + 46 + 9 * m.es;
  const b = v1aConfessTear(t, k);
  if (b && t >= T.run) { // a wet glint trailing behind the bead
    g.save(); g.lineCap = 'round'; g.strokeStyle = 'rgba(230,244,255,.45)'; g.lineWidth = 3.5; g.beginPath();
    for (let q = 0; q <= 1.0001; q += .05) { const p = q * b.p, x = ex + 8 * Math.sin(p * 2.6), y = lerp(y0 + 4, v1aConfessLEDGE - 7, clamp(p)), X = v1aConfessSkewX(x, y, m, k); q ? g.lineTo(X, y) : g.moveTo(X, y); }
    g.stroke(); g.restore();
  }
  if (b) v1aConfessBead(g, b.x, b.y, b.r, b.a, 4020);
  if (t >= T.land) { // the puddle on the ledge, and a little splash
    const lx_ = v1aConfessSkewX(ex + 8 * Math.sin(2.6), v1aConfessLEDGE - 7, m, k), u = easeOutBack(lin(t, T.land, T.land + .45), 1.6);
    const py = v1aConfessLEDGE + 9;
    pane(g, ellPath(lx_, py, 46 * u + .5, 9 * u + .3), [150, 200, 236], 4021, { ew: 4, lw: 3.2, shade: .15, amt: .2 });
    g.fillStyle = `rgba(255,255,255,${.75 * u})`; g.beginPath(); g.ellipse(lx_ - 10 * u, py - 2 * u, 9 * u + .1, 2 * u + .1, 0, 0, TAU); g.fill();
    const s = t - T.land;
    if (s < .5) for (let j = 0; j < 3; j++) {
      const dir = (j - 1) * 1.1, vx = dir * 38, vy = -150 - 40 * (j % 2);
      v1aConfessBead(g, lx_ + vx * s, py + vy * s + 600 * s * s, 4, 1 - lin(s, .3, .5), 4030 + j);
    }
  }
}

// ---------------- the scene ----------------
// Camera: one key strictly inside this line's window is reframed (pulled up and back a little) so the
// grille's arch and the tall peak's cap are in frame by V1.mountains. Done once, on the first draw (V1CAM
// lives in v1-main.js, which loads after this file); the window-edge keys 22.3 and 33.2 are untouched.
let v1aConfessCamSet = false;
function v1aConfessCam() {
  if (v1aConfessCamSet || typeof V1CAM === 'undefined') return;
  for (const K of V1CAM) if (K[0] === 24.6) { K[1] = 556; K[2] = 1135; K[3] = 1.52; }
  v1aConfessCamSet = true;
}
function sceneV1AltConfess(g, t, view) {
  v1aConfessCam();
  v1Upper(g, 0, t, view, [40, 70, 150], [C.ruby2, C.gold, C.blue]);
  for (const P of V1_SKY[0]) fpane(g, P, mix([118, 172, 226], [214, 232, 246], P.light * .5), t, { ew: 26 });
  v1Clouds(g, 0, t, [[120, 790, 210, 9, 3400], [560, 880, 160, 6, 3401]]);
  const lean = v1aConfessLean(t), worry = ease(t, V1.mountains - .1, V1.mountains + .3), blush = v1aConfessBlush(t);
  let kMid = 0;
  for (let n = 0; n < 3; n++) {
    const m = v1aConfessM[n], k = lean * (n === 1 ? .3 : 1) + v1aConfessShuffle(t, n);
    if (n === 2) kMid = k;
    const [look, lookY] = v1aConfessKeys(v1aConfessLOOK[n], t);
    const lid = n === 2 ? .55 * ease(t, V1.confess, V1.confess + .3) * (1 - .5 * ease(t, V1.bk1 + .8, V1.bk1 + 1.4)) : .25 * worry;
    g.save(); g.transform(1, 0, k, 1, -k * m.base, 0);
    v1aConfessMountain(g, m, t, { look, lookY, worry, lid, blush: n === 2 ? blush : 0, wide: n === 2 ? .6 * ease(t, V1.trying + .1, V1.trying + .5) * (1 - ease(t, V1.mountains - .1, V1.mountains + .3)) : 0 });
    g.restore();
  }
  v1aConfessBooth(g);
  v1aConfessSpots(g, t, .09);
  // the woman on her side of the grille; on V1.trying she leans her ear and mouth to it
  const hl = v1aConfessHerLean(t);
  g.save(); g.translate(v1aConfessW.x + 40 * hl, v1aConfessW.y + 8 * hl); g.scale(v1aConfessW.s, v1aConfessW.s);
  drawWomanV1(g, {
    dress: C.ruby, mantle: C.green, seed: 3330, mouth: v1Mouth(t), look: lerp(.2, 1, hl) * (t > V1.bk2 + .1 && t < 31.2 ? -.2 : 1),
    head: [34 * hl, 14 * hl, .2 * hl],
    hands: [[-30 - 80 * hl, 528 - 16 * hl, 0], [150 - 80 * hl, 520 - 16 * hl, v1RH(-.06)]], elbows: [[-200, 430], [240, 400]],
  });
  g.restore();
  v1aConfessGrille(g, t);
  v1aConfessLedge(g);
  v1aConfessTearDraw(g, t, kMid);
}

V1SCENES[0] = sceneV1AltConfess;
