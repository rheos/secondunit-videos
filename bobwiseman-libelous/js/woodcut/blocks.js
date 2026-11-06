// The nine woodblocks of the chain. Each is drawFn(g, P, t): paints the tone map for song time t.
// Times come from B (timing.js), which reads them off the word onsets in lines.json.

// ---- shared backgrounds ----
function bgGlow(g, P, cx, cy, r, t0 = .93, t1 = .1, sp = 10, ang = 0) {
  const id = P.lin(ang, sp, { wob: .16, jit: .3 });
  g.fillStyle = WC.RG(g, cx, cy, 10, cx, cy, r, [[0, t0], [.55, (t0 + t1) / 2], [1, t1]], id); g.fillRect(0, 0, BW, BH);
}
function bgRays(g, P, cx, cy, n, r = 820, t0 = .95, t1 = .05) {
  const id = P.ray(cx, cy, n, { jit: .35, wob: .2 });
  g.fillStyle = WC.RG(g, cx, cy, 20, cx, cy, r, [[0, t0], [.4, .55], [1, t1]], id); g.fillRect(0, 0, BW, BH);
}
function groundFlicks(g, P, y0, tone = .5) {
  const id = P.dash(0, 9, 70, .8, { jit: .35 });
  g.fillStyle = WC.LG(g, 0, y0, 0, BH, [[0, tone + .2], [1, tone - .25]], id); g.fillRect(0, y0, BW, BH - y0);
  line(g, 0, y0, BW, y0); ink(g, 5);
}

// ---------- 0. the king on his throne ----------
function blockKing(g, P, t) {
  // drapery: vertical gouges, folds by tone
  const pCur = P.lin(90, 11, { wob: .25, jit: .3 });
  const st = []; for (let k = 0; k <= 16; k++) st.push([k / 16, k % 2 ? .62 : .14]);
  g.fillStyle = WC.LG(g, 0, 0, BW, 0, st, pCur); g.fillRect(0, 0, BW, 470);
  // valance: scallops cut along the top
  g.fillStyle = Cw(0); g.fillRect(0, 0, BW, 70);
  for (let x = 0; x < BW; x += 62) { g.beginPath(); g.arc(x + 31, 62, 31, 0, Math.PI); fillWith(g, Cw(0)); g.beginPath(); g.arc(x + 31, 62, 24, .2, Math.PI - .2); cutl(g, 3); ell(g, x + 31, 104, 5, 9); fillWith(g, Cw(0)); line(g, x + 31, 92, x + 31, 96); ink(g, 2); }
  line(g, 0, 30, BW, 30); cutl(g, 2.5); line(g, 0, 40, BW, 40); cutl(g, 1.2);
  // floor: checkers in perspective
  const vx = 620, vy = 210, y0 = 462, y1 = BH;
  const pTile = P.lin(0, 7, { wob: .1, jit: .2 });
  g.fillStyle = WC.C(.78, pTile); g.fillRect(0, y0, BW, y1 - y0);
  const ys = [462, 482, 510, 548, 600];
  const xAt = (xb, y) => vx + (xb - vx) * (y - vy) / (y1 - vy);
  for (let r = 0; r < ys.length - 1; r++) for (let c = -8; c < 8; c++) {
    if ((r + c) & 1) continue;
    const xa = 620 + c * 150, xb = xa + 150;
    pth(g, [[xAt(xa, ys[r]), ys[r]], [xAt(xb, ys[r]), ys[r]], [xAt(xb, ys[r + 1]), ys[r + 1]], [xAt(xa, ys[r + 1]), ys[r + 1]]]); fillWith(g, Cw(0));
  }
  line(g, 0, y0, BW, y0); ink(g, 4);
  // dais
  g.beginPath(); g.rect(360, 432, 520, 32); fillWith(g, WC.LG(g, 0, 432, 0, 464, [[0, .7], [1, .25]], pTile)); ink(g, 4); line(g, 362, 436, 878, 436); cutl(g, 3);
  // throne back: a black arch with a glory of rays cut into it
  const kx = 620, ky = 392, ks = 1.02;
  const pGl = P.ray(kx, ky - 176 * ks, 64, { jit: .3, wob: .15 });
  g.beginPath(); g.moveTo(kx - 168, 440); g.lineTo(kx - 168, 150); g.quadraticCurveTo(kx - 168, 60, kx, 52); g.quadraticCurveTo(kx + 168, 60, kx + 168, 150); g.lineTo(kx + 168, 440); g.closePath(); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(kx - 138, 430); g.lineTo(kx - 138, 158); g.quadraticCurveTo(kx - 138, 88, kx, 82); g.quadraticCurveTo(kx + 138, 88, kx + 138, 158); g.lineTo(kx + 138, 430); g.closePath();
  fillWith(g, WC.RG(g, kx, ky - 180, 10, kx, ky - 180, 330, [[0, .96], [.5, .62], [1, .2]], pGl)); ink(g, 4);
  g.beginPath(); g.moveTo(kx - 152, 436); g.lineTo(kx - 152, 156); g.quadraticCurveTo(kx - 152, 74, kx, 67); g.quadraticCurveTo(kx + 152, 74, kx + 152, 156); g.lineTo(kx + 152, 436); cutl(g, 2.5);
  // posts with finials
  for (const s of [-1, 1]) {
    const px = kx + s * 186;
    g.beginPath(); g.rect(px - 15, 120, 30, 330); fillWith(g, WC.LG(g, px - 15, 0, px + 15, 0, [[0, .1], [.4, .75], [1, .05]], pCur)); ink(g, 4);
    ell(g, px, 104, 24, 24); fillWith(g, WC.RG(g, px - 8, 96, 2, px - 8, 96, 30, [[0, 1], [.5, .55], [1, .05]], pTile)); ink(g, 4);
    for (const yy of [170, 300, 420]) { line(g, px - 15, yy, px + 15, yy); cutl(g, 3); }
  }
  // seat
  g.beginPath(); g.rect(kx - 170, 386, 340, 30); fillWith(g, WC.LG(g, 0, 386, 0, 416, [[0, .75], [1, .2]], pTile)); ink(g, 4);
  // the king: crown hops on "king"
  const hop = Math.max(0, Math.sin(clamp((t - B.king) / .3) * Math.PI)) * 12;
  drawKing(g, P, kx, ky, ks, { crownUp: hop, bob: -hop * .3 });
}

// ---------- 1. the king's plan: his arm holds a rolled scroll; on "plan" it unrolls rightward ----------
function planMarks(g, x0, y0, x1, y1) {
  // a map of the plan (no letters): coast, a castle, a dotted route, an arrow, a little fist
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  g.beginPath(); g.moveTo(x0 + 40, y0 + 210); for (let x = x0 + 40; x < x0 + 300; x += 20) g.lineTo(x, y0 + 200 - Math.sin(x * .05) * 18 - (x - x0) * .25); ink(g, 4);
  for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x0 + 40, y0 + 46 + k * 24); for (let x = x0 + 40; x < x0 + 250 - k * 40; x += 6) g.lineTo(x, y0 + 46 + k * 24 + Math.sin(x * .7 + k) * 4 + (x % 30 < 3 ? -6 : 0)); ink(g, 2.6); }
  // castle
  const cx = x0 + 170, cy = y0 + 160;
  pth(g, [[cx - 26, cy + 30], [cx - 26, cy - 10], [cx - 18, cy - 10], [cx - 18, cy - 4], [cx - 8, cy - 4], [cx - 8, cy - 10], [cx + 2, cy - 10], [cx + 2, cy - 4], [cx + 12, cy - 4], [cx + 12, cy - 10], [cx + 26, cy - 10], [cx + 26, cy + 30]]); fillWith(g, Cw(0));
  g.beginPath(); g.arc(cx, cy + 30, 8, Math.PI, 0); fillWith(g, Cw(1));
  // route
  g.setLineDash([10, 9]); g.beginPath(); g.moveTo(cx + 34, cy + 10); g.bezierCurveTo(cx + 180, cy - 90, cx + 320, cy + 90, cx + 520, cy - 20); ink(g, 4); g.setLineDash([]);
  pth(g, [[cx + 520, cy - 40], [cx + 560, cy - 18], [cx + 516, cy + 2]]); fillWith(g, Cw(0));
  // crosses (places marked) and a little fist at the end
  for (const [a, b] of [[cx + 260, cy - 10], [cx + 380, cy + 40]]) { line(g, a - 9, b - 9, a + 9, b + 9); ink(g, 4); line(g, a + 9, b - 9, a - 9, b + 9); ink(g, 4); }
  const fx = cx + 640, fy = cy - 40;
  g.beginPath(); g.roundRect(fx - 30, fy - 22, 60, 50, 12); ink(g, 4);
  for (let k = 1; k < 4; k++) { line(g, fx - 30 + k * 15, fy - 22, fx - 30 + k * 15, fy + 6); ink(g, 2.5); }
  g.beginPath(); g.moveTo(fx - 26, fy + 10); g.quadraticCurveTo(fx, fy + 4, fx + 20, fy + 16); ink(g, 3);
  g.beginPath(); g.rect(fx - 22, fy + 28, 44, 26); ink(g, 3);
  g.restore();
}
function scrollRoll(g, P, x, y0, y1, r, pShade) {
  g.beginPath(); g.rect(x - r, y0, 2 * r, y1 - y0); fillWith(g, WC.LG(g, x - r, 0, x + r, 0, [[0, .55], [.4, 1], [1, .45]], pShade)); ink(g, 3.5);
  ell(g, x, y0, r, r * .35); fillWith(g, Cw(1)); ink(g, 3); ell(g, x, y0, r * .4, r * .14); ink(g, 2);
  ell(g, x, y1, r, r * .35); fillWith(g, Cw(.6, pShade)); ink(g, 3);
}
function blockPlan(g, P, t) {
  bgRays(g, P, 700, 300, 72, 860, .9, .06);
  const lift = (1 - ease(t, B.l1 + .15, B.l1 + .75)) * 70;
  const u = ease(t, B.plan, B.plan + .26);
  const pSleeve = P.lin(60, 7, { wob: .15 });
  const pPaper = P.blk(90, 6, { jit: .2 });
  const y0 = 196 + lift, y1 = 452 + lift, hx = 300;
  const xr = hx + 22 + u * 860;
  // the unrolled sheet
  if (u > .01) {
    g.beginPath(); g.moveTo(hx, y0 + 6); g.lineTo(xr, y0 + 4); g.lineTo(xr, y1 - 4); g.lineTo(hx, y1 - 6); g.closePath();
    fillWith(g, WC.LG(g, hx, 0, xr, 0, [[0, 1], [Math.max(0, 1 - 60 / (xr - hx + 1)), 1], [1, .55]], pPaper)); ink(g, 3.5);
    planMarks(g, hx + 30, y0 + 10, xr - 26, y1 - 10);
    scrollRoll(g, P, xr, y0 - 4, y1 + 4, 24, pPaper);
  }
  // the king's arm from the left: sleeve, ermine cuff, mitten round the rolls
  g.beginPath(); g.moveTo(0, 230 + lift); g.quadraticCurveTo(140, 250 + lift, 236, 286 + lift); g.lineTo(236, 382 + lift); g.quadraticCurveTo(140, 410 + lift, 0, 470 + lift); g.closePath();
  fillWith(g, WC.LG(g, 0, 230 + lift, 0, 470 + lift, [[0, .75], [.5, .4], [1, .1]], pSleeve)); ink(g, 4);
  ell(g, 236, 334 + lift, 30, 58); ermineFill(g, 12, 18, 200, 270 + lift, 270, 400 + lift); ink(g, 4);
  scrollRoll(g, P, hx, y0 - 6, y1 + 6, 26, pPaper);
  // the hand grips the roll: four fingers wrapped round the front, thumb over the top
  g.beginPath(); g.roundRect(250, 290 + lift, 44, 80, 16); fillWith(g, Cw(1)); ink(g, 4);
  for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(268, 300 + i * 17 + lift, 54, 17, 8); fillWith(g, Cw(1)); ink(g, 3.2); }
  g.beginPath(); g.moveTo(262, 296 + lift); g.quadraticCurveTo(286, 270 + lift, 316, 282 + lift); g.quadraticCurveTo(322, 294 + lift, 306, 298 + lift); g.quadraticCurveTo(286, 292 + lift, 270, 304 + lift); g.closePath(); fillWith(g, Cw(1)); ink(g, 3.5);
}

// ---------- 2. the plan has a fist: an armoured gauntlet punches up through the plan ----------
function gauntletFist(g, P, x, y, k, pMetal, pCuff) {
  g.save(); g.translate(x, y); g.scale(k, k);
  // cuff behind (bell)
  pth(g, [[-130, 70], [130, 70], [178, 240], [-178, 240]]); fillWith(g, WC.LG(g, -178, 0, 178, 0, [[0, .1], [.3, .7], [.55, .2], [1, .05]], pCuff)); ink(g, 5);
  for (const yy of [120, 170, 214]) { const w = 130 + (yy - 70) * .28; line(g, -w, yy, w, yy); cutl(g, 3); for (const sx of [-w + 16, w - 16]) { ell(g, sx, yy - 10, 4, 4); fillWith(g, Cw(1)); } }
  // back of the hand
  g.beginPath(); g.roundRect(-140, -40, 280, 120, 26); fillWith(g, WC.LG(g, -140, 0, 140, 0, [[0, .15], [.35, .8], [.6, .25], [1, .08]], pMetal)); ink(g, 5);
  // four curled fingers seen from the front: knuckle plates and middle plates
  for (let i = 0; i < 4; i++) {
    const fx = -105 + i * 70;
    for (const [a, b] of [[-150, -78], [-78, -12]]) {
      g.beginPath(); g.roundRect(fx - 32, a, 64, b - a, a === -150 ? [30, 30, 6, 6] : 8);
      fillWith(g, WC.LG(g, fx - 32, 0, fx + 32, 0, [[0, .04], [.36, .78], [.6, .25], [1, .03]], pMetal)); ink(g, 4.5);
    }
    ell(g, fx, -136, 4.5, 4.5); fillWith(g, Cw(1));
    line(g, fx - 26, -84, fx + 26, -84); cutl(g, 2.5);
  }
  // thumb across the front
  g.beginPath(); g.moveTo(-150, 6); g.quadraticCurveTo(-160, -40, -110, -40); g.lineTo(40, -30); g.quadraticCurveTo(76, -20, 70, 10); g.quadraticCurveTo(60, 34, 30, 30); g.lineTo(-110, 40); g.quadraticCurveTo(-146, 40, -150, 6); g.closePath();
  fillWith(g, WC.LG(g, 0, -40, 0, 40, [[0, .9], [.45, .35], [1, .05]], pCuff)); ink(g, 5);
  line(g, -40, -36, -44, 36); cutl(g, 3);
  g.restore();
}
function blockFist(g, P, t) {
  const burst = ease(t, B.fist - .03, B.fist + .14);
  bgRays(g, P, 620, 300, 80, 900, .55 + burst * .42, .05);
  const pPaper = P.blk(90, 6, { jit: .2 });
  const pDome = P.brad(620, 320, 9, { jit: .2 });
  const pMetal = P.lin(90, 9, { wob: .1, jit: .2 });
  const pCuff = P.lin(0, 9, { wob: .1, jit: .2 });
  // the plan sheet continues from the last block, a roll at the right end
  const y0 = 196, y1 = 452, shake = t < B.fist ? Math.sin(t * 90) * 2.5 * ease(t, B.l2 + .5, B.fist) : 0;
  g.save(); g.translate(0, shake);
  g.beginPath(); g.moveTo(0, y0 + 4); g.lineTo(1150, y0 + 6); g.lineTo(1150, y1 - 6); g.lineTo(0, y1 - 4); g.closePath();
  // the paper bulges in the middle before it tears (contour shading of a dome)
  const dome = ease(t, B.l2 + .3, B.fist);
  fillWith(g, Cw(1)); ink(g, 3.5);
  if (dome > 0 && burst < .02) { ell(g, 620, 320, 120 + dome * 80, 70 + dome * 50); fillWith(g, WC.RG(g, 600, 300, 10, 620, 320, 120 + dome * 90, [[0, 1], [.5, 1 - dome * .25], [1, 1 - dome * .5]], pDome)); }
  planMarks(g, -330, y0 + 10, 1124, y1 - 10);
  scrollRoll(g, P, 1150, y0 - 4, y1 + 4, 24, pPaper);
  // the tear
  if (burst > 0) {
    const R = 60 + burst * 190;
    g.beginPath();
    for (let k = 0; k <= 22; k++) { const a = k / 22 * TAU, rr = R * (.72 + .45 * rnd(k, 33)); const px = 620 + Math.cos(a) * rr * 1.25, py = 320 + Math.sin(a) * rr * .8; k ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.closePath(); fillWith(g, Cw(0));
    // flaps of torn paper curling outward
    for (let k = 0; k < 9; k++) {
      const a = k / 9 * TAU + .3, rr = R * (.95 + .3 * rnd(k, 34)), px = 620 + Math.cos(a) * rr * 1.25, py = 320 + Math.sin(a) * rr * .8;
      const ex = px + Math.cos(a) * 60 * burst, ey = py + Math.sin(a) * 40 * burst;
      pth(g, [[px - Math.sin(a) * 34, py + Math.cos(a) * 22], [ex, ey], [px + Math.sin(a) * 34, py - Math.cos(a) * 22]]); fillWith(g, Cw(.85, pPaper)); ink(g, 3);
    }
  }
  g.restore();
  if (burst > 0) {
    const k = lerp(.35, 1.05, easeOutBack(clamp((t - B.fist + .03) / .2), 1.4));
    gauntletFist(g, P, 620, 330 - burst * 40, k, pMetal, pCuff);
    // impact cuts around the fist
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * TAU + .2, r0 = 250 * k, r1 = r0 + 70 + 50 * rnd(i, 3);
      gouge(g, 620 + Math.cos(a) * r0, 300 + Math.sin(a) * r0 * .75, 620 + Math.cos(a) * r1, 300 + Math.sin(a) * r1 * .75, 6 * burst, 1);
    }
  }
}

// ---------- 3. the fist knew a man: the gauntlet's finger points at a small man ----------
function gauntletPoint(g, P, ext, pMetal, pCuff) {
  // cuff from the left edge
  pth(g, [[0, 214], [214, 262], [214, 402], [0, 452]]); fillWith(g, WC.LG(g, 0, 214, 0, 452, [[0, .85], [.35, .3], [1, .05]], pCuff)); ink(g, 5);
  for (const xx of [70, 140]) { line(g, xx, 228 + xx * .2, xx, 438 - xx * .2); cutl(g, 3); ell(g, xx + 14, 250 + xx * .2, 4, 4); fillWith(g, Cw(1)); }
  // back of the hand
  g.beginPath(); g.moveTo(206, 262); g.quadraticCurveTo(300, 240, 392, 262); g.lineTo(412, 330); g.quadraticCurveTo(330, 410, 206, 396); g.closePath();
  fillWith(g, WC.LG(g, 0, 250, 0, 400, [[0, .9], [.4, .45], [1, .08]], pCuff)); ink(g, 5);
  // three curled fingers under the pointing one
  for (let i = 0; i < 3; i++) {
    g.beginPath(); g.roundRect(330, 318 + i * 30, 96 - i * 6, 32, 16); fillWith(g, WC.LG(g, 0, 318 + i * 30, 0, 350 + i * 30, [[0, .85], [1, .1]], pCuff)); ink(g, 4);
    line(g, 372 - i * 3, 320 + i * 30, 372 - i * 3, 348 + i * 30); cutl(g, 2.4);
  }
  // the index finger, segment by segment, sliding out on "knew"
  const segs = [[392, 76, 46], [468, 66, 42], [534, 56, 38]];
  for (let i = 0; i < 3; i++) {
    const [sx, len, th] = segs[i]; const L = len * ext; const x = 392 + (sx - 392) * ext;
    if (L < 2) continue;
    g.beginPath(); g.roundRect(x - 4, 284 - th / 2, L + 8, th, i === 2 ? [6, th / 2, th / 2, 6] : 7);
    fillWith(g, WC.LG(g, 0, 284 - th / 2, 0, 284 + th / 2, [[0, .05], [.3, .78], [.55, .2], [1, .02]], pMetal)); ink(g, 4.5);
  }
  // thumb along the top
  g.beginPath(); g.moveTo(262, 262); g.quadraticCurveTo(300, 222, 380, 236); g.quadraticCurveTo(410, 246, 396, 266); g.quadraticCurveTo(330, 262, 262, 274); g.closePath();
  fillWith(g, WC.LG(g, 0, 226, 0, 272, [[0, .8], [1, .12]], pMetal)); ink(g, 4.5);
}
function blockMan(g, P, t) {
  bgGlow(g, P, 900, 250, 760, .95, .15, 10, 0);
  // far hills (wavy cuts) and ground
  const pHill = P.wave(0, 7, 4, 40, { jit: .3 });
  g.beginPath(); g.moveTo(0, 470); for (let x = 0; x <= BW; x += 40) g.lineTo(x, 430 - Math.sin(x * .006 + 1) * 30 - Math.sin(x * .017) * 10); g.lineTo(BW, 470); g.closePath();
  fillWith(g, WC.LG(g, 0, 380, 0, 470, [[0, .55], [1, .25]], pHill)); ink(g, 3.5);
  groundFlicks(g, P, 470, .55);
  const pMetal = P.lin(0, 9, { wob: .1, jit: .2 });
  const pCuff = P.lin(90, 9, { wob: .1, jit: .2 });
  const ext = easeOutBack(clamp((t - B.knew + .04) / .26), 1.2);
  gauntletPoint(g, P, ext, pMetal, pCuff);
  // the man: hops and throws up his arms on "man"
  const m = clamp((t - B.man + .02) / .28);
  const hop = Math.sin(m * Math.PI) * 26;
  const pats = { coat: P.lin(90, 8, { wob: .15 }), legs: P.lin(90, 7, {}), face: P.blk(120, 7, {}) };
  drawFrockMan(g, P, 960, 492, 1.42, { hop, armsUp: m > 0 ? Math.min(1, m * 4) : 0 }, pats);
  // little cuts of surprise around his head
  if (m > 0 && m < 1) for (let i = 0; i < 3; i++) { const a = -2.2 + i * .45; gouge(g, 960 + Math.cos(a) * 52, 492 - 230 * 1.42 - hop + Math.sin(a) * 40, 960 + Math.cos(a) * 92, 492 - 230 * 1.42 - hop + Math.sin(a) * 70, 5, 0); }
}

// ---------- 4. the man had a mouth: close on him; on "mouth" his mouth grows huge ----------
function bigMouth(g, P, cx, cy, open, pTongue) {
  if (open < .03) { g.beginPath(); g.moveTo(cx - 40, cy); g.quadraticCurveTo(cx, cy + 6, cx + 40, cy); ink(g, 6); return; }
  const w = 50 + open * 230, h = 8 + open * 150;
  ell(g, cx, cy, w, h / 2); fillWith(g, Cw(0));
  // teeth: top row and bottom row, cut white
  g.save(); ell(g, cx, cy, w - 10, h / 2 - 8); g.clip();
  const n = 8, tw = (2 * w) / n;
  for (let i = 0; i < n; i++) {
    const tx = cx - w + i * tw;
    g.beginPath(); g.roundRect(tx + 3, cy - h / 2 - 4, tw - 6, h * .22 + 6, 4); fillWith(g, Cw(1));
    g.beginPath(); g.roundRect(tx + 3, cy + h / 2 - h * .2, tw - 6, h * .22, 4); fillWith(g, Cw(1));
  }
  ell(g, cx, cy + h * .32, w * .6, h * .26); fillWith(g, WC.RG(g, cx - 20, cy + h * .25, 4, cx, cy + h * .3, w * .6, [[0, .85], [1, .3]], pTongue));
  line(g, cx, cy + h * .14, cx, cy + h * .45); ink(g, 3);
  g.restore();
  // lips
  ell(g, cx, cy, w + 6, h / 2 + 6); ink(g, 12);
  g.beginPath(); g.ellipse(cx, cy, w + 14, h / 2 + 14, 0, .3, Math.PI - .3); cutl(g, 3);
}
function blockMouth(g, P, t) {
  bgRays(g, P, 620, 300, 90, 900, .8, .05);
  const pFace = P.blk(118, 8, { jit: .2 });
  const pHair = P.dash(70, 6, 18, .7, { jit: .3 });
  const pCoat = P.lin(90, 8, { wob: .2 });
  const pTongue = P.rad(600, 430, 6);
  // shoulders: frock coat, lapels, collar and cravat
  g.beginPath(); g.moveTo(240, BH); g.quadraticCurveTo(300, 480, 470, 462); g.lineTo(770, 462); g.quadraticCurveTo(940, 480, 1000, BH); g.closePath();
  fillWith(g, WC.LG(g, 240, 0, 1000, 0, [[0, .35], [.4, .08], [1, .02]], pCoat)); ink(g, 4);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(620 + s * 60, 470); g.lineTo(620 + s * 130, 590); cutl(g, 4); g.beginPath(); g.moveTo(620 + s * 150, 466); g.lineTo(620 + s * 110, 540); g.lineTo(620 + s * 170, 590); cutl(g, 3); }
  pth(g, [[560, 430], [680, 430], [700, 500], [620, 520], [540, 500]]); fillWith(g, Cw(1)); ink(g, 3);
  g.beginPath(); g.moveTo(620, 488); g.lineTo(570, 470); g.lineTo(574, 510); g.closePath(); g.moveTo(620, 488); g.lineTo(670, 470); g.lineTo(666, 510); g.closePath(); fillWith(g, Cw(1)); ink(g, 3);
  ell(g, 620, 490, 12, 12); fillWith(g, Cw(1)); ink(g, 3);
  // ears, face
  for (const s of [-1, 1]) { ell(g, 620 + s * 150, 270, 24, 42); fillWith(g, Cw(1)); ink(g, 4); g.beginPath(); g.arc(620 + s * 152, 270, 14, s > 0 ? -1.2 : 1.9, s > 0 ? 1.2 : 4.3); ink(g, 2.5); }
  ell(g, 620, 262, 150, 190); fillWith(g, WC.LG(g, 470, 0, 770, 0, [[0, 1], [.5, 1], [1, .5]], pFace)); ink(g, 5);
  // hair on top and side whiskers
  g.beginPath(); g.moveTo(468, 250); g.quadraticCurveTo(452, 80, 620, 66); g.quadraticCurveTo(790, 80, 772, 250); g.quadraticCurveTo(752, 140, 650, 128); g.quadraticCurveTo(560, 150, 540, 120); g.quadraticCurveTo(500, 150, 468, 250); g.closePath();
  fillWith(g, WC.C(.28, pHair)); ink(g, 3);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(620 + s * 146, 240); g.quadraticCurveTo(620 + s * 156, 360, 620 + s * 104, 410); g.quadraticCurveTo(620 + s * 118, 330, 620 + s * 120, 250); g.closePath(); fillWith(g, WC.C(.25, pHair)); ink(g, 3); }
  // brows, eyes, nose
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(620 + s * 22, 196); g.quadraticCurveTo(620 + s * 60, 176, 620 + s * 104, 194); ink(g, 9);
    g.beginPath(); g.moveTo(620 + s * 30, 228); g.quadraticCurveTo(620 + s * 62, 208, 620 + s * 96, 228); g.quadraticCurveTo(620 + s * 62, 244, 620 + s * 30, 228); fillWith(g, Cw(1)); ink(g, 4);
    ell(g, 620 + s * 60, 228, 11, 12); fillWith(g, Cw(0)); ell(g, 620 + s * 57, 224, 3, 3); fillWith(g, Cw(1));
  }
  g.beginPath(); g.moveTo(612, 236); g.quadraticCurveTo(600, 300, 590, 320); g.quadraticCurveTo(612, 336, 640, 322); ink(g, 4);
  ell(g, 600, 322, 6, 4); fillWith(g, Cw(0)); ell(g, 632, 322, 6, 4); fillWith(g, Cw(0));
  // the mouth
  const op = easeOutBack(clamp((t - B.mouth + .02) / .2), 1.3);
  const talk = op > .9 ? .85 + .15 * Math.sin((t - B.mouth) * 26) : op;
  bigMouth(g, P, 620, 392 + op * 10, talk, pTongue);
}

// ---------- 5. the meeting hall: the mouth at a lectern, rows of shareholders in top hats ----------
const HALL_ROWS = [ // back to front: [head y, scale, xs]
  { y: 262, k: .8, xs: [545, 695, 845, 995, 1145] },
  { y: 352, k: 1.02, xs: [470, 620, 770, 920, 1070, 1210] },
  { y: 462, k: 1.3, xs: [545, 735, 925, 1115] },
];
function hallOrder() { // greeting order: a wave from the front row left to the back row right
  const L = []; HALL_ROWS.forEach((r, ri) => r.xs.forEach((x, xi) => L.push({ ri, xi, x })));
  L.sort((a, b) => (b.ri - a.ri) * 1000 + (a.x - b.x)); return L;
}
const HALL_ORDER = hallOrder();
function speechTalk(t) { // mouth opening from the sung word onsets while the mouth is "speaking"
  let v = 0;
  for (const w of B.speakWords) { const d = t - w; if (d >= -.03 && d < .35) v = Math.max(v, Math.sin(clamp((d + .03) / .33) * Math.PI)); }
  return v;
}
function blockHall(g, P, t) {
  const pWall = P.lin(90, 12, { wob: .2, jit: .3 });
  g.fillStyle = WC.RG(g, 330, 140, 10, 330, 140, 1000, [[0, .9], [.5, .5], [1, .18]], pWall); g.fillRect(0, 0, BW, BH);
  // tall windows (light cut away) on the back wall
  for (const wx of [520, 760, 1000]) { g.beginPath(); g.moveTo(wx - 50, 210); g.lineTo(wx - 50, 90); g.arc(wx, 90, 50, Math.PI, 0); g.lineTo(wx + 50, 210); g.closePath(); fillWith(g, Cw(0)); g.beginPath(); g.moveTo(wx - 38, 200); g.lineTo(wx - 38, 92); g.arc(wx, 92, 38, Math.PI, 0); g.lineTo(wx + 38, 200); g.closePath(); fillWith(g, Cw(.9, pWall)); line(g, wx, 54, wx, 200); ink(g, 5); line(g, wx - 40, 130, wx + 40, 130); ink(g, 5); }
  const pWood = P.lin(0, 7, { wob: .15 });
  const pCoat = P.lin(90, 8, { wob: .15 });
  const pFace = P.blk(120, 6.5, { jit: .2 });
  const pHat = P.lin(90, 6.5, { wob: .1 });
  const pats = { coat: pCoat, face: pFace, hat: pHat };
  // rows of shareholders rise behind their benches on "meetings"
  HALL_ROWS.forEach((row, ri) => {
    const rise = 1 - ease(t, B.meetings + ri * .07 - .02, B.meetings + ri * .07 + .26);
    const benchY = row.y + 130 * row.k;
    g.save(); g.beginPath(); g.rect(380, 0, BW, benchY + (ri === 2 ? 400 : 0)); g.clip();
    row.xs.forEach((x, xi) => {
      const oi = HALL_ORDER.findIndex(o => o.ri === ri && o.xi === xi);
      const tg = B.greetStart + oi * B.greetStep;
      const lift = ease(t, tg, tg + .16) * (1 - ease(t, tg + .75, tg + 1.0));
      const ts = B.smiled - .02 + oi * .012;
      const smile = ease(t, ts, ts + .1);
      drawShareholder(g, P, x, row.y + 56 * row.k + rise * 220 * row.k, row.k, { lift, bow: lift * .8, smile }, pats);
    });
    g.restore();
    if (ri < 2) { g.beginPath(); g.rect(380, benchY - 4, BW, 26 * row.k + 8); fillWith(g, WC.LG(g, 0, benchY, 0, benchY + 30, [[0, .8], [1, .2]], pWood)); ink(g, 4); }
  });
  // the speaker behind the lectern: the man, all mouth
  const talk = speechTalk(t);
  const hx = 214, hy = 168;
  g.beginPath(); g.moveTo(110, 330); g.quadraticCurveTo(130, 250, 214, 246); g.quadraticCurveTo(298, 250, 318, 330); g.closePath(); fillWith(g, WC.C(.1, pCoat)); ink(g, 3);
  pth(g, [[196, 246], [232, 246], [222, 284], [206, 284]]); fillWith(g, Cw(1)); ink(g, 2);
  for (const s of [-1, 1]) { ell(g, hx + s * 62, hy + 2, 12, 20); fillWith(g, Cw(1)); ink(g, 3); }
  ell(g, hx, hy, 62, 76); fillWith(g, WC.LG(g, hx - 62, 0, hx + 62, 0, [[0, 1], [.5, 1], [1, .5]], pFace)); ink(g, 4);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(hx + s * 60, hy - 14); g.quadraticCurveTo(hx + s * 66, hy + 40, hx + s * 40, hy + 58); g.quadraticCurveTo(hx + s * 46, hy + 20, hx + s * 46, hy - 12); g.closePath(); fillWith(g, Cw(0)); }
  g.beginPath(); g.moveTo(hx - 4, hy - 14); g.quadraticCurveTo(hx - 10, hy + 6, hx - 14, hy + 12); g.quadraticCurveTo(hx, hy + 18, hx + 10, hy + 10); ink(g, 3);
  g.beginPath(); g.moveTo(hx - 60, hy - 10); g.quadraticCurveTo(hx - 60, hy - 86, hx, hy - 82); g.quadraticCurveTo(hx + 62, hy - 86, hx + 60, hy - 10); g.quadraticCurveTo(hx + 40, hy - 56, hx, hy - 54); g.quadraticCurveTo(hx - 40, hy - 56, hx - 60, hy - 10); g.closePath(); fillWith(g, Cw(0));
  for (const s of [-1, 1]) { ell(g, hx + s * 24, hy - 22, 6, 7); fillWith(g, Cw(0)); g.beginPath(); g.moveTo(hx + s * 10, hy - 36); g.lineTo(hx + s * 38, hy - 40); ink(g, 5); }
  bigMouthSmall(g, hx, hy + 30, .25 + talk * .75, B.smiled <= t ? 1 : 0);
  // speech: cut rays fly from the mouth toward the rows
  if (talk > .1) for (let i = 0; i < 5; i++) { const a = -.5 + i * .25, r0 = 90, r1 = 150 + talk * 60; gouge(g, hx + Math.cos(a) * r0, hy + 30 + Math.sin(a) * r0, hx + Math.cos(a) * r1, hy + 30 + Math.sin(a) * r1, 5 * talk, 1); }
  // the lectern
  pth(g, [[90, 300], [338, 282], [338, 318], [90, 338]]); fillWith(g, WC.LG(g, 0, 282, 0, 338, [[0, .9], [1, .4]], pWood)); ink(g, 4);
  for (const s of [-1, 1]) { ell(g, hx + s * 86, 300, 18, 13); fillWith(g, Cw(1)); ink(g, 3); }
  g.beginPath(); g.rect(140, 330, 150, 200); fillWith(g, WC.LG(g, 140, 0, 290, 0, [[0, .15], [.4, .7], [1, .05]], pCoat)); ink(g, 4);
  g.beginPath(); g.rect(162, 350, 106, 150); cutl(g, 3); ell(g, 215, 425, 30, 40); cutl(g, 3);
  g.beginPath(); g.rect(110, 528, 210, 48); fillWith(g, WC.LG(g, 0, 528, 0, 576, [[0, .75], [1, .2]], pWood)); ink(g, 4);
}
function bigMouthSmall(g, cx, cy, open, grin) {
  const w = 34 + open * 18, h = 6 + open * 38;
  ell(g, cx, cy, w, h / 2); fillWith(g, Cw(0));
  g.save(); ell(g, cx, cy, w - 4, h / 2 - 3); g.clip();
  for (let i = 0; i < 5; i++) { const tx = cx - w + i * (2 * w / 5); g.beginPath(); g.rect(tx + 2, cy - h / 2 - 2, 2 * w / 5 - 4, h * .26 + 2); fillWith(g, Cw(1)); }
  g.restore();
  ell(g, cx, cy, w + 3, h / 2 + 3); ink(g, 6);
}

// ---------- 6. "for a reason": a big pointing hand ----------
function pointingHand(g, P, x, y, k, pShade, pCoat) {
  g.save(); g.translate(x, y); g.scale(k, k);
  // coat sleeve from the left edge
  pth(g, [[-700, -110], [-40, -96], [-40, 96], [-700, 120]]); fillWith(g, WC.LG(g, 0, -110, 0, 120, [[0, .55], [.4, .12], [1, .03]], pCoat)); ink(g, 5);
  for (let i = 0; i < 4; i++) gouge(g, -600 + i * 130, -60 + i * 8, -520 + i * 130, 60 - i * 6, 4, 1, 14);
  // lace cuff: scalloped frills
  for (let r = 0; r < 3; r++) {
    g.beginPath(); const cx = -30 + r * 22;
    for (let k2 = 0; k2 <= 10; k2++) { const a = -1.45 + k2 / 10 * 2.9, rr = 108 - r * 14 + (k2 % 2 ? 14 : 0); const px = cx + Math.cos(a) * rr * .35, py = Math.sin(a) * rr; k2 ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.lineTo(cx - 40, 90); g.lineTo(cx - 40, -90); g.closePath(); fillWith(g, WC.LG(g, cx - 40, 0, cx + 30, 0, [[0, .7], [1, 1]], pShade)); ink(g, 3);
  }
  // the hand: back of the hand, index finger out, three fingers curled below, thumb along the top
  g.beginPath(); g.moveTo(20, -64); g.quadraticCurveTo(110, -78, 190, -62); g.lineTo(200, 20); g.quadraticCurveTo(110, 70, 20, 64); g.closePath();
  fillWith(g, WC.LG(g, 0, -70, 0, 70, [[0, 1], [.55, .92], [1, .6]], pShade)); ink(g, 5);
  for (let i = 0; i < 3; i++) {
    g.beginPath(); g.roundRect(120, -4 + i * 34, 120 - i * 10, 36, 18); fillWith(g, WC.LG(g, 0, -4 + i * 34, 0, 32 + i * 34, [[0, 1], [1, .6]], pShade)); ink(g, 4.5);
    g.beginPath(); g.arc(218 - i * 10, 14 + i * 34, 9, -1.3, 1.3); ink(g, 2.5);
  }
  g.beginPath(); g.roundRect(170, -70, 300, 48, [10, 24, 24, 10]); fillWith(g, WC.LG(g, 0, -70, 0, -22, [[0, 1], [.6, .95], [1, .6]], pShade)); ink(g, 5);
  g.beginPath(); g.roundRect(420, -64, 40, 30, [4, 14, 14, 4]); ink(g, 2.5); // nail
  line(g, 300, -68, 304, -26); ink(g, 2.4); line(g, 380, -68, 382, -26); ink(g, 2.4); // knuckle creases
  g.beginPath(); g.moveTo(80, -66); g.quadraticCurveTo(150, -100, 236, -80); g.quadraticCurveTo(250, -66, 236, -56); g.quadraticCurveTo(160, -50, 96, -40); g.closePath(); fillWith(g, Cw(1)); ink(g, 4.5);
  g.restore();
}
function blockReason(g, P, t) {
  bgGlow(g, P, 1050, 290, 900, .96, .08, 10, 0);
  const pCoat = P.lin(90, 8, { wob: .15 }), pFace = P.blk(120, 6.5, {}), pHat = P.lin(90, 6.5, {});
  // the shareholders watch from below (their hats)
  for (let i = 0; i < 9; i++) drawShareholder(g, P, 80 + i * 140, 560, .55, { smile: 1 }, { coat: pCoat, face: pFace, hat: pHat });
  const pShade = P.blk(100, 8, { jit: .2 });
  const jab = easeOutBack(clamp((t - B.reason + .03) / .22), 1.6) * (1 - ease(t, B.reason + .5, B.reason + .9) * .4);
  const tap = Math.max(0, Math.sin(clamp((t - B.chose + .02) / .2) * Math.PI)) + Math.max(0, Math.sin(clamp((t - B.thisW + .02) / .2) * Math.PI));
  const x = 240 + jab * 150, y = 250 + tap * 10;
  if (jab > .05) for (let i = 0; i < 4; i++) gouge(g, x + 220 - 90 - i * 10, y - 120 + i * 40, x + 220 - 260 - i * 30, y - 120 + i * 40, 4 * jab, 1);
  pointingHand(g, P, x, y, .95, pShade, pCoat);
  // the point lands: rays from the fingertip toward the next block
  if (jab > .2) for (let i = 0; i < 5; i++) { const a = -.5 + i * .25; gouge(g, x + 470 + Math.cos(a) * 30, y - 44 + Math.sin(a) * 30, x + 470 + Math.cos(a) * (110 + 40 * jab), y - 44 + Math.sin(a) * (110 + 40 * jab), 7, 1); }
}

// ---------- 7. the cash: sacks of coin; on "cash" they burst and coins cascade ----------
const COINS = (() => { const L = [], R = mulberry(2020); for (let i = 0; i < 46; i++) L.push({ s: R() * 3, vx: (R() - .3) * 900, vy: -500 - R() * 650, r: 16 + R() * 12, spin: R() * 20, sx: [420, 640, 860][i % 3], dl: R() * .18 }); return L; })();
function blockCash(g, P, t) {
  bgRays(g, P, 640, 120, 70, 900, .9, .08);
  groundFlicks(g, P, 500, .45);
  const pSack = P.rad(560, 330, 7, { wob: .1 });
  const pSack2 = P.rad(380, 380, 7, { wob: .1 });
  const pSack3 = P.rad(830, 380, 7, { wob: .1 });
  const pEdge = P.lin(90, 4, {});
  const open = t >= B.cash - .02;
  // the cascade: coins pour from above into the middle sack
  for (let i = 0; i < 16; i++) {
    const ph = ((t - B.l9) * 1.6 + i / 16) % 1; if (t < B.l9) continue;
    const y = -40 + ph * 330, x = 640 + Math.sin(i * 2.1) * 30;
    if (!open || ph < .3) drawCoin(g, x, y, 17, t * 9 + i, pEdge);
  }
  drawSack(g, P, 400, 520, 250, 230, pSack2, open);
  drawSack(g, P, 860, 520, 250, 230, pSack3, open);
  drawSack(g, P, 640, 540, 330, 330, pSack, open);
  // coins on the ground
  for (let i = 0; i < 10; i++) drawCoin(g, 230 + i * 85 + (i % 3) * 14, 548 + (i % 2) * 14, 16, 1.2 + i * .4, pEdge);
  // the burst on "cash": a fountain of coins out of the sacks, raining down, flying off to the right
  if (open) for (const c of COINS) {
    const d = t - B.cash + .02 - c.dl; if (d < 0) continue;
    const x = c.sx + c.vx * d, y = 300 - (c.sx === 640 ? 80 : 0) + c.vy * d + 1500 * d * d;
    if (y > 620 || x > 1300) continue;
    drawCoin(g, x, y, c.r, c.spin + d * 18, pEdge);
  }
  if (open) { const k = 1 - ease(t, B.cash, B.cash + .3); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i - 4.5) * .2; gouge(g, 640 + Math.cos(a) * 160, 220 + Math.sin(a) * 60, 640 + Math.cos(a) * 300, 220 + Math.sin(a) * 160, 7 * k + 1, 1); } }
}

// ---------- 8. the cash was worth believing: coins stack into a pillar, the king sits on top ----------
const PILLAR_N = 24;
function blockPillar(g, P, t) {
  bgRays(g, P, 620, 160, 96, 900, .98, .06);
  groundFlicks(g, P, 520, .45);
  const pMill = P.lin(90, 4.2, { wob: .05, jit: .1 });
  const pEdge = P.lin(90, 4, {});
  const rx = 66, ry = 16, th = 13, base = 548;
  // coins land one by one
  let n = 0, top = base;
  for (let i = 0; i < PILLAR_N; i++) { const tl = B.l10 + .05 + i * B.coinStep; if (t >= tl) n = i + 1; }
  for (let i = 0; i < n; i++) { const y = base - (i + 1) * th; drawStackCoin(g, 620, y, rx, ry, th, pMill, i === n - 1); top = y; }
  // the coin in the air
  if (n < PILLAR_N) {
    const tl = B.l10 + .05 + n * B.coinStep, d = clamp(1 - (tl - t) / .14);
    if (t > tl - .14) { const y = lerp(-60, base - (n + 1) * th, d * d); drawStackCoin(g, 620, y, rx, ry, th, pMill, true); }
  }
  // scattered coins round the foot
  for (let i = 0; i < 9; i++) drawCoin(g, 330 + i * 70 + (i > 4 ? 120 : 0), 560 + (i % 2) * 10, 15, .9 + i * .5, pEdge);
  // the king drops onto the top on "believing" and sits
  const tk = B.believing - .02;
  if (t > tk - .16) {
    const d = clamp((t - (tk - .16)) / .16), land = t - tk;
    const sq = land > 0 ? Math.sin(clamp(land / .22) * Math.PI) * 6 * Math.exp(-land * 4) : 0;
    const ky = lerp(-260, top + 4, d * d) + sq;
    drawKing(g, P, 620, ky, .62, { hands: 'knees', smile: true });
  }
}

const BLOCKS = [blockKing, blockPlan, blockFist, blockMan, blockMouth, blockHall, blockReason, blockCash, blockPillar];
