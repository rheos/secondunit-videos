// Frame assembly. Every frame is a pure function of song time t.
const out = document.getElementById('c'); out.width = W; out.height = H;
const octx = out.getContext('2d');
const SC = mkCanvas(), g = SC.getContext('2d');
const SM = mkCanvas(W / 4, H / 4), smg = SM.getContext('2d');
const SM2 = mkCanvas(W / 4, H / 4), sm2g = SM2.getContext('2d');
const BL = mkCanvas(), blg = BL.getContext('2d');
const MASK = mkCanvas(1, H / 4), mkg = MASK.getContext('2d');
let GRAIN = [];

function buildExtras() {
  // soft rectangle for contact shadows
  const s = mkCanvas(320, 220), sg = s.getContext('2d'); sg.filter = 'blur(16px)'; sg.fillStyle = '#000'; sg.fillRect(40, 40, 240, 140); TEX.softRect = s;
  const w = mkCanvas(600, 400), wg = w.getContext('2d'); wg.drawImage(TEX.window, 0, 0); wg.globalCompositeOperation = 'source-in'; wg.fillStyle = 'rgb(255,196,120)'; wg.fillRect(0, 0, 600, 400); TEX.windowWarm = w;
  const r = prng(99);
  for (let k = 0; k < 4; k++) {
    const c = mkCanvas(W / 2, H / 2), cg = c.getContext('2d'), id = cg.createImageData(W / 2, H / 2);
    for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() - .5) * 120; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    cg.putImageData(id, 0, 0); GRAIN.push(c);
  }
}

const SPOT = { x: 210, y: 226 };
function spotOn(t) {
  if (t < 14.3 || t >= 40.98) return 0;
  if (t < 14.46) return [1, 0, 1, .3, 1, 1, 1, 0][Math.floor((t - 14.3) / .02)] ?? 1;
  return 1;
}
function windowLight(t) { return smooth(lin(t, 56.6, 60.6)); }

function softRectGround(x0, x1, y0, y1, z, a) {
  // the soft rect texture has its 240x140 core in a 320x220 canvas: expand the quad to match
  const mx = (x1 - x0) * (40 / 240), my = (y1 - y0) * (40 / 140);
  g.globalAlpha = a; drawGround(g, TEX.softRect, x0 - mx, x1 + mx, y0 - my, y1 + my, z, { noOverlap: true }); g.globalAlpha = 1;
}

function noteQuad(img, x, y, z, rot, tilt, w = 64, h = 32, n = 2) {
  const c = Math.cos(rot), s = Math.sin(rot), ct = Math.cos(tilt), st = Math.sin(tilt);
  const P = (u, v) => { const vy = v * ct, vz = v * st; return [x + u * c - vy * s, y + u * s + vy * c, z + vz]; };
  drawQuad(g, img, P(-w / 2, h / 2), P(w / 2, h / 2), P(-w / 2, -h / 2), n * 2, n);
}

function drawBox(t) {
  // interior walls, tray, contents, outer walls
  const K = TEX.kraft, KI = TEX.kraftIn;
  const quads = [
    { q: [[-252, 557, 50], [252, 557, 50], [-252, 557, 8]], img: KI, inner: true },
    { q: [[-252, 293, 50], [-252, 557, 50], [-252, 293, 8]], img: KI, inner: true },
    { q: [[252, 557, 50], [252, 293, 50], [252, 557, 8]], img: KI, inner: true },
  ];
  for (const w of quads) if (quadFacing(...w.q)) { drawQuad(g, w.img, ...w.q, 4, 2); g.globalAlpha = .25; fillQuad(g, [w.q[0], w.q[1], [w.q[1][0] + w.q[2][0] - w.q[0][0], w.q[1][1] + w.q[2][1] - w.q[0][1], w.q[2][2]], w.q[2]], '#000'); g.globalAlpha = 1; }
  drawQuad(g, TEX.tray, [-252, 557, 8], [252, 557, 8], [-252, 293, 8], 6, 4);
  // bank: a stack of each denomination
  for (let i = 0; i < 7; i++) {
    const cx = -221 + 50 * i, cy = 501;
    for (let k = 0; k < 6; k++) {
      const z = 8.2 + k * .8, j = rnd(i, k) - .5;
      g.globalAlpha = 1; drawQuad(g, TEX.notes[i], [cx - 16 + j, cy - 32, z], [cx - 16 + j, cy + 32, z], [cx + 16 + j, cy - 32, z], 2, 2);
      if (k < 5) { g.globalAlpha = .18; fillQuad(g, [[cx - 16, cy - 32, z + .4], [cx + 16, cy - 32, z + .4], [cx + 16, cy + 32, z + .4], [cx - 16, cy + 32, z + .4]], '#000'); g.globalAlpha = 1; }
    }
  }
  // spare chance deck in the tray
  for (let k = 0; k < 5; k++) drawQuad(g, TEX.cardBack, [138, 532, 8.3 + k * .5], [228, 532, 8.3 + k * .5], [138, 472, 8.3 + k * .5], 2, 2);
  shadowBlob(g, 165, 390, 8, 12, 10, .35); shadowBlob(g, 205, 378, 8, 12, 10, .35);
  drawDie(g, 162, 386, 16.1, 16, .35, 4, 2, 6);
  drawDie(g, 203, 374, 16.1, 16, -.6, 1, 5, 3);
  // spare pawns
  for (const sp of [{ x: -170, y: 360, col: [42, 86, 172] }, { x: -112, y: 345, col: [226, 178, 36] }, { x: -54, y: 362, col: [44, 132, 70] }]) {
    const pose = { x: sp.x, y: sp.y, z: 8, floor: 8, ax: [0, 0, 1] }; pawnShadow(g, pose, .7); drawPawn(g, pose, sp.col);
  }
  const outer = [
    { q: [[-255, 290, 50], [255, 290, 50], [-255, 290, 0]] },
    { q: [[-255, 560, 50], [-255, 290, 50], [-255, 560, 0]] },
    { q: [[255, 290, 50], [255, 560, 50], [255, 290, 0]] },
  ];
  for (const w of outer) if (quadFacing(...w.q)) drawQuad(g, K, ...w.q, 4, 2);
  // rims
  g.fillStyle = '#c9b48f';
  fillQuad(g, [[-255, 290, 50], [255, 290, 50], [255, 293, 50], [-255, 293, 50]], '#cdb994');
  fillQuad(g, [[-255, 557, 50], [255, 557, 50], [255, 560, 50], [-255, 560, 50]], '#cdb994');
  fillQuad(g, [[-255, 290, 50], [-252, 290, 50], [-252, 560, 50], [-255, 560, 50]], '#cdb994');
  fillQuad(g, [[252, 290, 50], [255, 290, 50], [255, 560, 50], [252, 560, 50]], '#cdb994');
}

function drawLid(t) {
  const L = lidPose(t); if (L.x > 1400) return;
  const cx = L.x, cy = L.y, cz = L.z + 30;
  const cr = Math.cos(L.rx), sr = Math.sin(L.rx), cy2 = Math.cos(L.ry), sy2 = Math.sin(L.ry), cz2 = Math.cos(L.rz), sz2 = Math.sin(L.rz);
  const T = (x, y, z) => {
    z -= 30;
    let y1 = y * cr - z * sr, z1 = y * sr + z * cr; let x1 = x;
    let x2 = x1 * cy2 + z1 * sy2, z2 = -x1 * sy2 + z1 * cy2; let y2 = y1;
    let x3 = x2 * cz2 - y2 * sz2, y3 = x2 * sz2 + y2 * cz2;
    return [cx + x3, cy + y3, cz + z2];
  };
  const a = 258, b = 138, top = 53, bot = 8;
  // shadow
  const lift = L.z; softRectGround(cx - a + lift * .3, cx + a + lift * .3, cy - b + lift * .45, cy + b + lift * .45, lift > 40 ? 0 : 50, .5 * clamp(1 - lift / 700));
  const sides = [
    { q: [T(-a, -b, top), T(a, -b, top), T(-a, -b, bot)], f: 1 },
    { q: [T(a, -b, top), T(a, b, top), T(a, -b, bot)], f: .55 },
    { q: [T(-a, b, top), T(-a, -b, top), T(-a, b, bot)], f: .55 },
    { q: [T(a, b, top), T(-a, b, top), T(a, b, bot)], f: 1 },
  ];
  for (const s of sides) if (quadFacing(...s.q)) drawQuad(g, TEX.lidSide, ...s.q, 6, 1, [0, 0, TEX.lidSide.width * s.f, TEX.lidSide.height]);
  const tq = [T(-a, b, top), T(a, b, top), T(-a, -b, top)];
  if (quadFacing(...tq)) drawQuad(g, TEX.lid, ...tq, 8, 6);
}

function drawBoard(t) {
  const BI = boardIntro(t);
  if (!BI) {
    softRectGround(-246, 258, -244, 258, 0, .45);
    drawGround(g, TEX.board, -250, 250, -250, 250, 3);
    const edges = [
      [[-250, -250, 3], [250, -250, 3], [-250, -250, 0]],
      [[250, -250, 3], [250, 250, 3], [250, -250, 0]],
      [[-250, 250, 3], [-250, -250, 3], [-250, 250, 0]],
    ];
    for (const e of edges) if (quadFacing(...e)) drawQuad(g, TEX.boardEdge, ...e, 8, 1);
    return;
  }
  const { ox, oy, oz, a } = BI; const ar = a * DEG;
  softRectGround(-246 + ox + oz * .3, 258 + ox + oz * .3, (a > 90 ? 6 : -244) + oy + oz * .45, 258 + oy + oz * .45, oz > 20 ? 0 : 0, .45 * clamp(1 - oz / 300));
  const S = TEX.board.width;
  drawQuad(g, TEX.board, [-250 + ox, 250 + oy, 3 + oz], [250 + ox, 250 + oy, 3 + oz], [-250 + ox, oy, 3 + oz], 6, 4, [0, 0, S, S / 2]);
  const zh = 3 + oz + 3 * (a / 180);
  const TL = [-250 + ox, oy, zh], TR = [250 + ox, oy, zh], BLp = [-250 + ox, oy - 250 * Math.cos(ar), zh + 250 * Math.sin(ar)];
  if (quadFacing(TL, TR, BLp)) drawQuad(g, TEX.board, TL, TR, BLp, 8, 8, [0, S / 2, S, S / 2]);
  else { const BR = [TR[0] + BLp[0] - TL[0], TR[1] + BLp[1] - TL[1], TR[2] + BLp[2] - TL[2]]; drawQuad(g, TEX.boardBack, TR, TL, BR, 8, 8); }
}

function drawPrize(p, t, phase) {
  const a = prizeAngle(p, t); if (a === null) return;
  const st = TEX.st[p.k]; const w = st.w, h = st.h; const ar = a * DEG;
  let sw = null, dx = 0, dy = 0, dz = 0;
  if (M5) { const r = slideRest(t, p.sweep, p.seed * 13, p.x, p.y, 1.7); if (r) { sw = r; dx = r.x - p.x; dy = r.y - p.y; dz = r.y < -251 ? -3 : 0; } }
  else { sw = sweepOffset(t, p.sweep, p.seed * 13, p.y); if (sw) { dx = sw.dx; dy = sw.dy; dz = sw.dz + (p.y + sw.dy < -251 ? -3 : 0); if (dz < -500) return; } }
  const x = p.x + dx, y = p.y + dy, z0 = 3 + dz + (a > 85 ? .3 : 0);
  if (phase === 'shadow') {
    if (sw) return; const k = Math.cos(ar);
    if (k < .05) return;
    g.globalAlpha = .38 * k;
    drawQuad(g, st.sh, [x - w / 2 + h * .22 * k, y + h * (.6 * k + Math.sin(ar)), 3.05], [x + w / 2 + h * .22 * k, y + h * (.6 * k + Math.sin(ar)), 3.05], [x - w / 2, y, 3.05], 2, 2);
    g.globalAlpha = 1; return;
  }
  const TL = [x - w / 2, y + h * Math.sin(ar), z0 + h * Math.cos(ar)], TR = [x + w / 2, y + h * Math.sin(ar), z0 + h * Math.cos(ar)], BLq = [x - w / 2, y, z0];
  if (quadFacing(TL, TR, BLq)) {
    drawQuad(g, st.tex, TL, TR, BLq, 3, 3);
    // a little light falloff toward the bottom of the card when standing
    if (a < 60) { g.globalAlpha = .12; drawQuad(g, st.sh, TL, TR, BLq, 1, 1); g.globalAlpha = 1; }
  } else { g.globalAlpha = .9; drawQuad(g, silhouette ? st.sh : st.sh, TR, TL, [TR[0], BLq[1], BLq[2]], 2, 2); g.globalAlpha = 1; }
  if (a < 50 && !sw) { // plastic stand
    fillQuad(g, [[x - 9, y - 4, 9], [x + 9, y - 4, 9], [x + 9, y - 4, 3], [x - 9, y - 4, 3]], '#26272b');
    fillQuad(g, [[x - 9, y - 4, 9], [x + 9, y - 4, 9], [x + 9, y + 4, 9], [x - 9, y + 4, 9]], '#4a4c52');
  }
}

function drawCardStack(t) {
  const { x, y } = CARDPOS;
  shadowBlob(g, x + 4, y + 4, 3, 52, 36, .35);
  for (let k = 0; k < 6; k++) { const z = 3.2 + k * .3, j = (rnd(k, 3) - .5) * 1.6; drawQuad(g, TEX.cardBack, [x - 45 + j, y + 30, z], [x + 45 + j, y + 30, z], [x - 45 + j, y - 30, z], 2, 2); }
  g.globalAlpha = .5; fillQuad(g, [[x - 45, y - 30, 5], [x + 45, y - 30, 5], [x + 45, y - 30, 3], [x - 45, y - 30, 3]], '#d8ccb2'); g.globalAlpha = 1;
}
function drawTopCard(t) {
  const c = cardPose(t); const cf = Math.cos(c.flip), sf = Math.sin(c.flip), cr = Math.cos(c.rot), sr = Math.sin(c.rot);
  const P = (u, v) => { const vy = v * cf, vz = v * sf; return [c.x + u * cr - vy * sr, c.y + u * sr + vy * cr, c.z + vz]; };
  if (c.z > 6) shadowBlob(g, c.x + (c.z - 5) * .35, c.y + (c.z - 5) * .5, 5, 50 * (.5 + .5 * Math.abs(cf)), 34, .35 * clamp(1 - c.z / 120));
  const bTL = P(-45, 30), bTR = P(45, 30), bBL = P(-45, -30);
  if (quadFacing(bTL, bTR, bBL)) drawQuad(g, TEX.cardBack, bTL, bTR, bBL, 6, 4);
  else drawQuad(g, TEX.cardFront, P(-45, -30), P(45, -30), P(-45, 30), 6, 4);
}
function drawTarotCard(t) {
  const c = cardPose5(t); const cf = Math.cos(c.flip), sf = Math.sin(c.flip), cr = Math.cos(c.rot), sr = Math.sin(c.rot);
  const w = TCARD[0] / 2, h = TCARD[1] / 2;
  const P = (u, v) => { const vy = v * cf, vz = v * sf; return [c.x + u * cr - vy * sr, c.y + u * sr + vy * cr, c.z + vz]; };
  shadowBlob(g, c.x + 2 + Math.max(0, c.z - 5) * .35, c.y + 3 + Math.max(0, c.z - 5) * .5, 5, 40 * (.5 + .5 * Math.abs(cf)), 62, .35 * clamp(1 - c.z / 120));
  const bTL = P(-w, h), bTR = P(w, h), bBL = P(-w, -h);
  if (quadFacing(bTL, bTR, bBL)) drawQuad(g, EXT.back, bTL, bTR, bBL, 10, 16);
  else drawQuad(g, EXT.wheel, P(-w, -h), P(w, -h), P(-w, h), 10, 16);
}
function tarotQuad(img, tx, ty, rot, z) {
  const [x, y] = tarotToWorld(tx, ty), a = -rot, c = Math.cos(a), s = Math.sin(a), w = TCARD[0] / 2, h = TCARD[1] / 2;
  const P = (u, v) => [x + u * c - v * s, y + u * s + v * c, z];
  shadowBlob(g, x + 2, y - 3, z - .5, 40, 64, .3, a);
  drawQuad(g, img, P(-w, h), P(w, h), P(-w, -h), 3, 4);
}
function drawTableProps5(t) {
  const hm = MAT_MM / 2;
  softRectGround(MAT.x - hm + 5, MAT.x + hm + 8, MAT.y - hm - 6, MAT.y + hm - 2, 0, .5);
  drawGround(g, EXT.mat, MAT.x - hm, MAT.x + hm, MAT.y - hm, MAT.y + hm, .8, { noOverlap: true });
  // the thin felt edge, near side
  fillQuad(g, [[MAT.x - hm, MAT.y - hm, .8], [MAT.x + hm, MAT.y - hm, .8], [MAT.x + hm, MAT.y - hm, 0], [MAT.x - hm, MAT.y - hm, 0]], '#0f2219');
  const SPR = JSON.parse(window.EXT_TEX.spread);
  tarotQuad(EXT.back, SPR.DECK[0] - 9.6, SPR.DECK[1] - 13.2, SPR.DECK[2], 3.2);
  ['wheel', 'hourglass', 'company', 'fool', 'star'].forEach((k, i) => { const R = SPR.REST[i]; tarotQuad(EXT[k], R[0], R[1], R[2], 1.4); });
  // the finished sampler, lying on the oak
  const S = SAMPLER;
  softRectGround(S.x - S.w / 2 + 3, S.x + S.w / 2 + 6, S.y - S.h / 2 - 5, S.y + S.h / 2 - 2, 0, .4);
  drawGround(g, EXT.sampler, S.x - S.w / 2, S.x + S.w / 2, S.y - S.h / 2, S.y + S.h / 2, 1.2, { noOverlap: true });
}
function drawSpinner(t) {
  const th = M5 ? spinAngle5(t) : spinAngle(t), d = [Math.cos(th), Math.sin(th)], n = [-Math.sin(th), Math.cos(th)];
  const P = (along, across, z) => [SPIN.x + d[0] * along + n[0] * across, SPIN.y + d[1] * along + n[1] * across, z];
  g.globalAlpha = .35; drawQuad(g, TEX.arrowSh, P(-44 + 1.5, 11 - 2, 3.05), P(66 + 1.5, 11 - 2, 3.05), P(-44 + 1.5, -11 - 2, 3.05), 2, 2); g.globalAlpha = 1;
  drawQuad(g, TEX.arrow, P(-44, 11, 4.2), P(66, 11, 4.2), P(-44, -11, 4.2), 3, 2);
}

function drawBeam(s) {
  if (s <= 0) return;
  const top = proj(SPOT.x - 40, SPOT.y + 60, 900), top2 = proj(SPOT.x + 40, SPOT.y + 60, 900);
  const l = proj(SPOT.x - 78, SPOT.y, 3), r = proj(SPOT.x + 78, SPOT.y, 3);
  if (top[2] < 250 || l[2] < 60 || Math.abs(top[0] - W / 2) > 4000 || top[1] < -6000) return;
  g.save(); g.globalCompositeOperation = 'screen';
  for (const [k, al] of [[1.25, .05], [1, .06], [.75, .07]]) {
    const t1 = proj(SPOT.x - 40 * k, SPOT.y + 60, 900), t2 = proj(SPOT.x + 40 * k, SPOT.y + 60, 900), l1 = proj(SPOT.x - 78 * k, SPOT.y, 3), r1 = proj(SPOT.x + 78 * k, SPOT.y, 3);
    const gr = g.createLinearGradient(0, Math.min(t1[1], t2[1]), 0, Math.max(l1[1], r1[1]));
    gr.addColorStop(0, 'rgba(255,236,190,0)'); gr.addColorStop(1, `rgba(255,236,190,${al * s})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(t1[0], t1[1]); g.lineTo(t2[0], t2[1]); g.lineTo(r1[0], r1[1]); g.lineTo(l1[0], l1[1]); g.closePath(); g.fill();
  }
  g.restore();
}

function rowDepth(r) { const yy = r - H / 2, den = CAM.f * CAM.sp + yy * CAM.cp; return den > 0 ? (CAM.z - 1.5) * CAM.f / den : 1e9; }
function applyDOF(zf, A) {
  if (!A) return;
  mkg.clearRect(0, 0, 1, H / 4);
  for (let i = 0; i < H / 4; i++) { const d = rowDepth(i * 4 + 2); const b = clamp(A * Math.abs(1 - zf / d) * 1.6); mkg.fillStyle = `rgba(0,0,0,${b})`; mkg.fillRect(0, i, 1, 1); }
  smg.filter = 'none'; smg.drawImage(SC, 0, 0, W / 4, H / 4);
  sm2g.filter = 'blur(3.5px)'; sm2g.clearRect(0, 0, W / 4, H / 4); sm2g.drawImage(SM, 0, 0); sm2g.filter = 'none';
  blg.globalCompositeOperation = 'source-over'; blg.clearRect(0, 0, W, H); blg.imageSmoothingQuality = 'high'; blg.drawImage(SM2, 0, 0, W, H);
  blg.globalCompositeOperation = 'destination-in'; blg.drawImage(MASK, 0, 0, W, H); blg.globalCompositeOperation = 'source-over';
  g.drawImage(BL, 0, 0);
}

let M5 = false;
function renderFrame(t) {
  M5 = t >= V5 - 1e-6;
  const sh = M5 ? shotAt5(t) : shotAt(t); setCamera(sh.cam(t));
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2a1f17'); bg.addColorStop(1, '#120d09'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // soft room glow above the horizon in low shots
  if (CAM.phi < 25 * DEG) { const hz = H / 2 - CAM.f * Math.tan(CAM.phi); const rg = g.createRadialGradient(W * .25, hz - 200, 20, W * .25, hz - 200, 900); rg.addColorStop(0, 'rgba(120,92,60,.5)'); rg.addColorStop(1, 'rgba(120,92,60,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); }
  const TR = TEX.tableRect;
  drawGround(g, TEX.table, TR.x0, TR.x1, TR.y0, TR.y1, 0);
  if (quadFacing([-900, -400, 0], [1500, -400, 0], [-900, -400, -40])) drawQuad(g, TEX.tableEdge, [-900, -400, 0], [1500, -400, 0], [-900, -400, -40], 14, 1);
  const wl = M5 ? window5(t) : windowLight(t);
  if (wl > 0) {
    g.globalCompositeOperation = 'screen'; g.globalAlpha = .62 * wl;
    if (M5) drawGround(g, TEX.windowWarm, 960, 1450, -420, 40, 0.1, { noOverlap: true }); else drawGround(g, TEX.windowWarm, 225, 535, -395, -135, 0.1, { noOverlap: true });
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  if (M5) drawTableProps5(t);
  else { const dp = divePose(t); if (dp) { shadowBlob(g, dp.x + 3, dp.y + 4, 0, 60, 30, .3, dp.rot); noteQuad(EXT.note2, dp.x, dp.y, dp.z, dp.rot, 0, DIVE.w, DIVE.h, 8); } }
  // box shadow, box
  softRectGround(-250, 268, 292, 572, 0, .55);
  drawBox(t);
  drawBoard(t);
  const intro = t < 7.9;
  const NOTESX = M5 ? NOTES5 : NOTES, PRIZESX = M5 ? PRIZES5 : PRIZES, nPose = M5 ? notePose5 : notePose;
  if (!intro) {
    const s = M5 ? spotOn5(t) : spotOn(t);
    if (s > 0 && !params.has("noglow")) glowBlob(g, SPOT.x, SPOT.y, 3.1, 82, 66, '255,226,170', .5 * s);
    drawSpinner(t);
    drawCardStack(t);
    // money piles: shadows then notes in z order (landed and sliding)
    for (const p of PILES) { const n = NOTESX.filter((nt) => nt.p === PILES.indexOf(p) && t >= nt.tl && t < nt.sw).length; if (n) shadowBlob(g, p[0] + 3, p[1] + 4, 3, 40, 30, Math.min(.35, n * .03)); }
    if (!params.has('noprsh')) for (const p of PRIZESX) drawPrize(p, t, 'shadow');
  }
  // uprights and flying things, sorted far to near
  const items = [];
  if (!intro) {
    for (const nt of NOTESX) { const q = nPose(nt, t); if (!q) continue; items.push({ d: depthOf(q.x, q.y, q.z), z: q.z, flat: q.z < 8 && !q.tilt, fn: () => M5 ? noteQuad(nt.d ? EXT.note2 : EXT.note1, q.x, q.y, q.z, q.rot, q.tilt, NOTE_MM[0], NOTE_MM[1], 4) : noteQuad(TEX.notes[nt.d], q.x, q.y, q.z, q.rot, q.tilt) }); }
    for (const p of PRIZESX) { const a = prizeAngle(p, t); if (a === null) continue; items.push({ d: depthOf(p.x, p.y, 10), fn: () => drawPrize(p, t, 'card'), prize: true }); }
    items.push({ d: depthOf(CARDPOS.x, CARDPOS.y, 5), fn: () => M5 ? drawTarotCard(t) : drawTopCard(t), flat: (M5 ? cardPose5(t) : cardPose(t)).z < 6.5 });
  }
  const pp = M5 ? pawnPose5(t) : pawnPose(t);
  if (pp) items.push({ d: depthOf(pp.x, pp.y, pp.z + 15), pawn: true, fn: () => { pawnShadow(g, pp, 1 - .3 * wl); const k = 1 + .35 * wl; drawPawn(g, pp, [178 * k, 42 * k * 1.05, 34 * k]); } });
  // flat things first (z order), then the rest by depth
  const flats = items.filter((i) => i.flat).sort((a, b) => (a.z || 0) - (b.z || 0));
  const ups = items.filter((i) => !i.flat).sort((a, b) => b.d - a.d);
  for (const it of flats) it.fn();
  const dofp = typeof sh.dof === 'function' ? sh.dof(t) : null;
  let zf = dofp ? dofp.zf : 0; if (dofp && !zf && pp) zf = depthOf(pp.x, pp.y, pp.z + 15);
  const sharpR = sh.sharp || zf * .35;
  const late = [];
  for (const it of ups) { if (dofp && dofp.A && Math.abs(it.d - zf) < sharpR) late.push(it); else it.fn(); }
  if (dofp) applyDOF(zf, dofp.A);
  for (const it of late) it.fn();
  // (volumetric beam dropped: it smeared across the frame in low shots)
  if (t < 5.3) drawLid(t);
  // spotlight falloff: the rest of the table dims while the light is on
  const s = !intro && !params.has("nodark") ? (M5 ? spotOn5(t) : spotOn(t)) : 0;
  if (s > 0) {
    const c = proj(SPOT.x, SPOT.y, 3); const rad = Math.max(260, CAM.f * 150 / Math.max(c[2], 50));
    const onScreen = c[0] > -400 && c[0] < W + 400 && c[1] > -400 && c[1] < H + 400 ? 1 : .35;
    const vg = g.createRadialGradient(c[0], c[1], rad * .35, c[0], c[1], rad * 2.2); vg.addColorStop(0, 'rgba(10,6,20,0)'); vg.addColorStop(1, `rgba(10,6,20,${.38 * s * onScreen})`);
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
  }
  grade(t);
  // output with camera roll
  octx.setTransform(1, 0, 0, 1, 0, 0); octx.fillStyle = '#000'; octx.fillRect(0, 0, W, H);
  const rl = CAM.roll; const sc = 1 + Math.abs(Math.sin(rl)) * 1.2;
  octx.translate(W / 2, H / 2); octx.rotate(rl); octx.scale(sc, sc); octx.drawImage(SC, -W / 2, -H / 2); octx.setTransform(1, 0, 0, 1, 0, 0);
}

function grade(t) {
  const warm = M5 ? Math.max(window5(t), evening5(t)) : windowLight(t), dim = M5 ? 0 : smooth(lin(t, 43.6, 44.4)) * (1 - smooth(lin(t, 46.5, 47.3)));
  if (M5) {
    const ev = evening5(t);
    if (ev > 0) { g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(255,${200 - 40 * ev},${150 - 70 * ev},${.45 * ev})`; g.fillRect(0, 0, W, H); }
  }
  g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,${170 + 20 * (1 - warm)},${100},${.18 + .3 * warm})`; g.fillRect(0, 0, W, H);
  if (dim > 0) { g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(${200},${205},${225},${dim * .6})`; g.fillRect(0, 0, W, H); }
  g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .66); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(12,6,2,${.42 - .1 * warm})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const fi = Math.round(t * 24); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .07;
  g.drawImage(GRAIN[fi % 4], (fi * 37) % 40 - 40, (fi * 53) % 30 - 30, W + 80, H + 60); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  if (M5) { const lo = lightsOut5(t); if (lo > 0) { g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(${lerp(255, 22, lo)},${lerp(255, 26, lo)},${lerp(255, 40, lo)},1)`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; } }
}

buildArt(); buildExtras();
const params = new URLSearchParams(location.search);
window.__frameJPEG = (t, q = .93) => { renderFrame(t); return out.toDataURL('image/jpeg', q); };
const EXT = {};
window.__ready = (async () => {
  const src = window.EXT_TEX || {};
  for (const k of ['mat', 'wheel', 'hourglass', 'company', 'fool', 'star', 'back', 'note1', 'note2', 'sampler']) {
    if (!src[k]) { console.error('missing texture ' + k + ' (run node js/boardgame/capture.mjs)'); EXT[k] = mkCanvas(8, 8); continue; }
    const im = new Image(); im.src = src[k]; await im.decode();
    const c = mkCanvas(im.width, im.height), cg = c.getContext('2d');
    if (['wheel', 'hourglass', 'company', 'fool', 'star', 'back'].includes(k)) { cg.beginPath(); cg.roundRect(0, 0, im.width, im.height, im.width * 30 / 700); cg.clip(); }
    cg.drawImage(im, 0, 0); EXT[k] = c;
  }
  return true;
})();
if (!params.has('offline')) {
  const audio = document.getElementById('a');
  const T0 = parseFloat(params.get('a') || 0), T1 = parseFloat(params.get('b') || 62.5);
  audio.currentTime = params.has('t') ? parseFloat(params.get('t')) : T0;
  (function loop() { let t = audio.currentTime || T0; if (t >= T1) { audio.currentTime = T0; t = T0; } renderFrame(t); requestAnimationFrame(loop); })();
  const toggle = () => audio.paused ? audio.play() : audio.pause();
  out.onclick = toggle; window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggle(); } });
}
