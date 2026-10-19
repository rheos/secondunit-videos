// Spotify Canvas loop (720x1280, 8 s, silent): a turning rose window in the film's stained-glass kit.
// Uses core.js (rnd, mulberry, mix, rgb, GRAIN tiles) and glass.js (palette C, pane, lead, paint, paths, texture)
// as they are; core.js's W/H (1920x1080) are not used for drawing here.
//
// The loop closes by rotational symmetry. Every moving ring is N-fold symmetric and turns by a whole number of its
// symmetry steps in PERIOD seconds:
//   inner ring : 12 lancet petals, each a cracked ruby heart          12-fold, +30 deg per 8 s (clockwise)
//   outer ring : 12 desert-flower roundels, 12 clear crowns, 12 foils 12-fold, -30 deg per 8 s (counter-clockwise)
//   the daisy  : the film's 27-petal daisy at the centre             27-fold, +13.33 deg per 8 s
// Anything seeded per pane is seeded by its place inside one sector, never by the sector number, so every sector is
// identical. The glass texture is laid per sector into its own layer (pieces that straddle a sector edge are re-laid
// whole), so the texture has the same symmetry. Light, glints, shafts, dust and grain are fixed in screen space or
// run on periods that divide 8 s. Frame t is a pure function of t mod 8.
(function () {
  const PERIOD = 8, FPS = 24;
  // Embedded in another page (draft 13: the bridge's backing run, bridge-rose.js): window.ROSE_EMBED = { w, h, k, cx, cy }
  // draws on an offscreen canvas of w x h with k px per design px and the rose centre at (cx, cy), ignores the page's
  // query and exposes window.roseLoop = { canvas, render(t) } in place of the page hooks. Unset, nothing changes.
  const EMB = window.ROSE_EMBED || null;
  const params = new URLSearchParams(EMB ? '' : location.search);
  // debug only, for the seam proof: nowrap=1 draws t without folding it into [0, 8); nograin=1 drops the grain
  const DBG_NOWRAP = params.has('nowrap'), DBG_NOGRAIN = params.has('nograin');
  const OW = EMB ? EMB.w : Math.max(16, parseInt(params.get('w') || '720', 10)), OH = EMB ? EMB.h : Math.max(16, parseInt(params.get('h') || '1280', 10));
  const out = EMB ? mkCanvas(OW, OH) : document.getElementById('c'); out.width = OW; out.height = OH;
  const g = out.getContext('2d');
  // texture layer (opaque grey texture, laid with the glass's symmetry, then overlaid onto the glass)
  const TL = mkCanvas(OW, OH), tl = TL.getContext('2d');

  // Layout: designed at 720x1280; other sizes scale uniformly and centre. World units: rose glass radius 1000.
  const K = EMB ? EMB.k : Math.min(OW / 720, OH / 1280), OX = EMB ? EMB.cx - 360 * K : (OW - 720 * K) / 2, OY = EMB ? EMB.cy - 568 * K : (OH - 1280 * K) / 2;
  const RS = .318 * K;                    // px per world unit
  const CX = OX + 360 * K, CY = OY + 568 * K; // rose centre on screen (Spotify's clear band is ~192-960 of 1280)
  const view = { x0: -CX / RS, x1: (OW - CX) / RS, y0: -CY / RS, y1: (OH - CY) / RS };
  const world = (c) => c.setTransform(RS, 0, 0, RS, CX, CY);

  // Rose radii (world units)
  const R = {
    dzBlue: 146, dzGold: 165, st1a: 168, st1b: 214,          // daisy, first stone ring
    inA: 214, inB: 562, st2a: 562, st2b: 612,               // inner ring, second stone ring
    outA: 612, bordA: 962, outB: 1000, hood: 1000,          // outer ring, border band, the opening
  };
  const N = 12, SEC = TAU / N, NDZ = 27;
  const SUN = -.62;                                         // the light comes from the upper left (radians from up, clockwise)
  const angIn = (t) => .07 + (t / PERIOD) * SEC;            // one sector step per loop, clockwise
  const angOut = (t) => -.11 - (t / PERIOD) * SEC;          // one sector step per loop, counter-clockwise
  const angDz = (t) => (t / PERIOD) * TAU / NDZ;            // one petal step per loop
  const wave = (t, n, ph = 0) => Math.sin(TAU * n * t / PERIOD + ph); // n whole cycles per loop
  const facing = (a, p) => Math.pow(Math.max(0, Math.cos(a - SUN)), p); // how squarely a piece faces the sun

  // local polar: angle phi from the sector's centre line (0 = outward), radius r. "Up" in a sector is outward.
  const pol = (r, phi) => [r * Math.sin(phi), -r * Math.cos(phi)];
  function wedge(r0, r1, a0, a1) { // annular wedge in local polar angles
    const p = new Path2D();
    p.arc(0, 0, r1, a0 - Math.PI / 2, a1 - Math.PI / 2); p.arc(0, 0, r0, a1 - Math.PI / 2, a0 - Math.PI / 2, true); p.closePath(); return p;
  }
  function ring(r0, r1) { const p = new Path2D(); p.arc(0, 0, r1, 0, TAU); p.moveTo(r0, 0); p.arc(0, 0, r0, 0, TAU, true); return p; }
  const deg = Math.PI / 180;

  // ---------------- inner ring: lancet petals with cracked hearts ----------------
  // A lancet petal along the sector's centre line: round inner end, straight sides, equilateral pointed tip.
  const PW = 72, PC = 332, PS = 426; // half width, inner round-end centre radius, where the pointed arch springs
  function petalPath(d) {
    const w = PW - d, ys = -PS, Ra = 2 * PW - d, p = new Path2D();
    p.moveTo(-w, -PC); p.lineTo(-w, ys);
    p.arc(PW, ys, Ra, Math.PI, TAU - Math.acos(-PW / Ra), false);   // left arc up to the apex
    p.arc(-PW, ys, Ra, TAU - Math.acos(PW / Ra), TAU, false);       // right arc down to the right side
    p.lineTo(w, -PC);
    p.arc(0, -PC, w, 0, Math.PI, false);                            // the round inner end
    p.closePath(); return p;
  }
  const PETAL0 = petalPath(0), PETAL1 = petalPath(15);
  const HEART_R = 386, HS = .52; // heart centre radius, scale of the film's heart drawing (film units -> world)
  const CRACK = [[0, 306], [-16, 340], [13, 372], [-12, 410], [10, 446], [-4, 480], [0, 492]]; // as the film's L1 heart
  const heartWhole = polyPath(heartPts(0, 330, 260, 236));
  const halfL = polyPath([[-400, 0], ...CRACK, [0, 700], [-400, 700]]), halfR = polyPath([[400, 0], ...CRACK, [0, 700], [400, 700]]);
  const crackLine = (() => { const p = new Path2D(); CRACK.forEach(([x, y], k) => k ? p.lineTo(x, y) : p.moveTo(x, y)); return p; })();
  const heartFrame = (c) => { c.translate(0, -HEART_R); c.scale(HS, HS); c.translate(0, -330); }; // film heart coords
  const SEP = 7; // the two halves stand a little apart: light shows through the crack

  function drawHeart(c) {
    c.save(); heartFrame(c);
    for (const [s, clip] of [[-1, halfL], [1, halfR]]) {
      c.save(); c.translate(s * SEP / 2, 0); c.clip(clip);
      pane(c, heartWhole, C.ruby, 600 + (s > 0 ? 1 : 0), { ew: 34, shade: .3, lw: 0, lead: 0 });
      c.save(); c.clip(heartWhole); // the internal leads stay inside the heart (in the film her arms hid their ends)
      const l1 = new Path2D(); l1.moveTo(-122, 300); l1.quadraticCurveTo(-60, 380, -70, 440); lead(c, l1, 13);
      const l2 = new Path2D(); l2.moveTo(122, 300); l2.quadraticCurveTo(60, 380, 70, 440); lead(c, l2, 13);
      paint(c, 6, .55); for (const x of [-80, 74]) { c.beginPath(); c.arc(x, 290, 28, Math.PI * 1.1, Math.PI * 1.7); c.stroke(); }
      lead(c, crackLine, 12); // each half's broken edge is leaded
      c.restore();
      lead(c, heartWhole, 16);
      c.restore();
    }
    c.restore();
  }
  function drawInnerSector(c) {
    pane(c, PETAL0, C.gold, 210, { ew: 14, shade: .3, lw: 12 });
    pane(c, PETAL1, C.blue, 211, { ew: 30, shade: .34, lw: 10 });
    // a gold boss in the pointed tip
    pane(c, circPath(0, -496, 20), C.gold, 213, { ew: 10, lw: 9 });
    paint(c, 4, .7); c.beginPath(); c.arc(0, -496, 8, 0, TAU); c.stroke();
    drawHeart(c);
  }
  const IN_PEARL = [circPath(...pol(530, -.16), 15), circPath(...pol(530, .16), 15)]; // gold pearls beside each petal tip
  function drawInnerRing(c, t) {
    const a = angIn(t);
    for (let k = 0; k < N; k++) { // ground first, so the spandrels drawn after are not covered by the next sector
      c.save(); c.rotate(a + k * SEC); pane(c, wedge(R.inA, R.inB, -SEC / 2, SEC / 2), C.ruby2, 200, { ew: 30, shade: .3, lw: 10 }); c.restore();
    }
    for (let k = 0; k < N; k++) {
      c.save(); c.rotate(a + k * SEC);
      IN_PEARL.forEach((p, j) => pane(c, p, C.gold, 216 + j, { ew: 8, lw: 7 }));
      drawInnerSector(c);
      c.restore();
    }
  }

  // ---------------- outer ring: desert-flower roundels, clear crowns, foils ----------------
  const RO_R = 787, RO = 150, RO_IN = 132;
  const CROWN_R = 893, FOIL_R = 654, FOIL_PHI = .185;
  const crownPath = (() => { const cw = 104, chh = 62, cy = 0; return polyPath([[-cw / 2, cy + chh / 2], [-cw / 2, cy - chh / 2], [-cw / 4, cy - 4], [0, cy - chh / 2 - 12], [cw / 4, cy - 4], [cw / 2, cy - chh / 2], [cw / 2, cy + chh / 2]]); })();
  const foilPath = (() => { const p = new Path2D(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; p.moveTo(Math.cos(a) * 11 + 9, Math.sin(a) * 11); p.arc(Math.cos(a) * 11, Math.sin(a) * 11, 9, 0, TAU); } return p; })();
  const foilOutline = circPath(0, 0, 25);
  function duneTop(j, x) { return [26, 58, 96][j] + 9 * Math.sin(x / 34 + j * 2.1) + 5 * Math.sin(x / 13 + j); }
  function dunePath(j) { const pts = []; for (let x = -RO; x <= RO; x += 10) pts.push([x, duneTop(j, x)]); pts.push([RO, RO], [-RO, RO]); return polyPath(pts); }
  const DUNE = [dunePath(0), dunePath(1), dunePath(2)];
  const FIELD = circPath(0, 0, RO_IN);
  // the flower: the film's L2 flower in small (7 pink petals, gold face, shut eyes, a round singing mouth)
  function drawFlower(c, t, lit) {
    const sing = .5 + .5 * Math.abs(wave(t, 6)); // 6 sung pulses a loop, all flowers in unison
    const sway = 3 * wave(t, 2);
    const hx = sway, hy = -34;
    const stem = [[0, 120], [-9, 44], [hx, hy]];
    pane(c, smoothPath(limbPts(stem, [13, 10, 8]), true), C.green2, 760, { ew: 7, lw: 6 });
    for (const s of [-1, 1]) {
      c.save(); c.translate(-5, 60 - (s > 0 ? 14 : 0)); c.rotate(s * .7);
      pane(c, ellPath(s * 21, 0, 22, 8), C.green, 761 + (s > 0 ? 1 : 0), { ew: 6, lw: 5 }); c.restore();
    }
    c.save(); c.translate(hx, hy);
    for (let k = 0; k < 7; k++) {
      const a = k * TAU / 7 - Math.PI / 2 + .12 * sing * Math.sin(TAU * 6 * t / PERIOD + k), r = 31;
      pane(c, ellPath(Math.cos(a) * r, Math.sin(a) * r, 24, 12, a), k % 2 ? C.pink : [236, 96, 160], 771 + k, { ew: 9, lw: 6 });
    }
    pane(c, circPath(0, 0, 21), C.gold, 780, { ew: 9, lw: 6 });
    paint(c, 3, .9);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 4, -6); c.lineTo(s * 12, -6); c.stroke(); }
    c.fillStyle = 'rgba(60,20,16,.9)'; c.beginPath(); c.ellipse(0, 7, 3.5 + 2 * sing, 2 + 6 * sing, 0, 0, TAU); c.fill();
    c.restore();
  }
  function drawRoundel(c, t) {
    pane(c, circPath(0, 0, RO), C.gold, 700, { ew: 14, shade: .3, lw: 12 });
    c.save(); c.clip(FIELD);
    pane(c, FIELD, C.sky, 701, { ew: 30, shade: .3, lead: 0 });
    // the desert sun, upper right of the roundel, rays as separate pieces
    const sx = 62, sy = -66;
    for (let k = 0; k < 8; k++) {
      const a = k * TAU / 8 + .2, p = polyPath([[sx + Math.cos(a - .2) * 24, sy + Math.sin(a - .2) * 24], [sx + Math.cos(a) * 42, sy + Math.sin(a) * 42], [sx + Math.cos(a + .2) * 24, sy + Math.sin(a + .2) * 24]]);
      pane(c, p, C.gold, 702 + k, { ew: 5, lw: 5, amt: .5 });
    }
    pane(c, circPath(sx, sy, 20), C.gold, 711, { ew: 8, lw: 6 });
    pane(c, DUNE[0], C.sand2, 712, { ew: 14, lw: 7 });
    pane(c, DUNE[1], C.sand, 713, { ew: 14, lw: 7 });
    pane(c, DUNE[2], C.sand3, 716, { ew: 12, lw: 7 });
    // a saguaro on the right, like the film's L2
    const cac = [[64, 92], [66, 50], [64, 6]];
    pane(c, smoothPath(limbPts(cac, [22, 22, 20]), true), C.green, 714, { ew: 8, lw: 6 });
    pane(c, smoothPath(limbPts([[66, 52], [86, 50], [88, 22]], [11, 11, 10]), true), C.green, 715, { ew: 5, lw: 5 });
    paint(c, 2, .4); c.beginPath(); c.moveTo(64, 12); c.lineTo(65, 86); c.stroke();
    drawFlower(c, t);
    c.restore();
    lead(c, FIELD, 10);
  }
  function drawCrown(c) {
    pane(c, crownPath, C.clear, 970, { ew: 16, shade: .2, amt: .3, lw: 10 });
    paint(c, 3, .5); c.beginPath(); c.moveTo(-46, 16); c.lineTo(46, 16); c.stroke();
  }
  function drawFoil(c) {
    pane(c, foilOutline, C.murrey, 730, { ew: 10, lw: 8 });
    pane(c, foilPath, C.gold, 731, { ew: 8, lw: 7 });
    pane(c, circPath(0, 0, 6), C.ruby, 732, { ew: 4, lw: 5 });
  }
  // border band at the rim: the film's ruby / gold / blue / gold run with a white pearl on each blue piece, 4 a sector
  const BCOL = [C.ruby, C.gold, C.blue, C.gold];
  function drawBorder(c) {
    for (let j = 0; j < 4; j++) {
      const a0 = -SEC / 2 + j * SEC / 4, a1 = a0 + SEC / 4;
      pane(c, wedge(R.bordA, R.outB, a0, a1), BCOL[j], 740 + j, { ew: 12, shade: .3, lw: 9 });
      if (j === 2) pane(c, circPath(...pol((R.bordA + R.outB) / 2, (a0 + a1) / 2), 11), C.white, 745, { ew: 6, lw: 5 });
    }
  }
  function sectorFrame(c, a, r, phi) { // move to (r, phi) of a sector rotated by a, "up" outward
    c.rotate(a); c.translate(...pol(r, phi)); c.rotate(phi);
  }
  function drawOuterRing(c, t) {
    const a = angOut(t);
    for (let k = 0; k < N; k++) {
      c.save(); c.rotate(a + k * SEC); pane(c, wedge(R.outA, R.bordA, -SEC / 2, SEC / 2), C.blue2, 720, { ew: 34, shade: .3, lw: 10 }); c.restore();
    }
    for (let k = 0; k < N; k++) { // radial leads on the sector edges (under the crown and foil, which sit on them)
      c.save(); c.rotate(a + k * SEC + SEC / 2); const p = new Path2D(); p.moveTo(0, -R.outA); p.lineTo(0, -R.bordA); lead(c, p, 10); c.restore();
    }
    for (let k = 0; k < N; k++) {
      const b = a + k * SEC;
      c.save(); c.rotate(b); drawBorder(c); c.restore();
      c.save(); sectorFrame(c, b, RO_R, 0); drawRoundel(c, t); c.restore();
      c.save(); sectorFrame(c, b, CROWN_R, SEC / 2); drawCrown(c); c.restore();
      for (const s of [-1, 1]) { c.save(); sectorFrame(c, b, FOIL_R, s * FOIL_PHI); drawFoil(c); c.restore(); }
    }
  }

  // ---------------- the daisy at the centre (the film's running device, all 27 petals on) ----------------
  // Proportions of the hanging daisy roundel in main.js, x 1.4. The blue disc and the petals turn; the gold ring
  // and the gold heart with its 7 seeds hold still (a 7-fold centre cannot turn by one 27th).
  const DZP = ellPath(0, -90, 55, 8.7, Math.PI / 2);
  function drawDaisy(c, t) {
    pane(c, circPath(0, 0, R.dzGold), C.gold, 1, { ew: 16, lw: 10 });
    pane(c, circPath(0, 0, R.dzBlue), [120, 170, 214], 2, { ew: 40, lw: 9 });
    const a = angDz(t);
    for (let k = 0; k < NDZ; k++) { c.save(); c.rotate(a + k * TAU / NDZ); pane(c, DZP, C.white, 10, { ew: 8, lw: 6.5, amt: .4 }); c.restore(); }
    pane(c, circPath(0, 0, 35), C.gold, 3, { ew: 14, lw: 9 });
    c.fillStyle = 'rgba(60,30,10,.7)'; for (let k = 0; k < 7; k++) { const b = k * TAU / 7; c.beginPath(); c.arc(Math.cos(b) * 17, Math.sin(b) * 17, 3.6, 0, TAU); c.fill(); }
  }

  // ---------------- the four lancets below (the film's window, under the rose; Spotify's UI sits over them) ----------------
  const LL = 440, LG = 80, LAR = LL * .85, LAPEX = 1300, LBORD = 34;
  const llx = (i) => -1000 + i * (LL + LG);
  const LYS = LAPEX + Math.sqrt(LAR * LAR - (LAR - LL / 2) * (LAR - LL / 2));
  const LCNT = [10, 14, 14, 10, 10];
  function lancetOutline(i, d) { // as window.js outline(), on this window's geometry
    const a = llx(i) + d, b = llx(i) + LL - d, mid = llx(i) + LL / 2, yb = view.y1 + 200, r = LAR - d, pts = [];
    const cL = llx(i) + LAR, phA = TAU - Math.acos(clamp((mid - cL) / r, -1, 1));
    for (let k = 0; k < LCNT[0]; k++) pts.push([a, lerp(yb, LYS, k / LCNT[0])]);
    for (let k = 0; k < LCNT[1]; k++) { const ph = lerp(Math.PI, phA, k / LCNT[1]); pts.push([cL + r * Math.cos(ph), LYS + r * Math.sin(ph)]); }
    const left = pts.slice(LCNT[0]);
    pts.push([mid, LYS + r * Math.sin(phA)]);
    for (let k = LCNT[2] - 1; k >= 1; k--) { const [x, y] = left[k]; pts.push([2 * mid - x, y]); }
    pts.push([b, LYS]);
    for (let k = 1; k <= LCNT[3]; k++) pts.push([b, lerp(LYS, yb, k / LCNT[3])]);
    for (let k = 1; k < LCNT[4]; k++) pts.push([lerp(b, a, k / LCNT[4]), yb]);
    return pts;
  }
  const LQ = [C.blue, [26, 108, 56], [196, 112, 40], C.murrey]; // the film's four lancets: blue, green, desert, murrey
  const LROS = [[C.ruby2, C.gold, C.green], [C.blue2, C.ruby, C.gold], [C.ruby, C.gold, C.blue], [C.gold, C.purple, C.green]];
  let LAN = null;
  function buildLancets() {
    LAN = [];
    for (let i = 0; i < 4; i++) {
      const o0 = lancetOutline(i, 0), o1 = lancetOutline(i, LBORD), n = o0.length, segs = [];
      for (let k = 0; k < n; k++) { const k2 = (k + 1) % n; segs.push({ path: polyPath([o0[k], o0[k2], o1[k2], o1[k]]), k, cx: (o0[k][0] + o1[k2][0]) / 2, cy: (o0[k][1] + o1[k2][1]) / 2 }); }
      const quarries = [], qw = 48, qh = 70, x0 = llx(i), x1 = llx(i) + LL;
      for (let row = 0, cy = LAPEX - 40; cy < view.y1 + qh; row++, cy += qh)
        for (let cx = x0 - qw * 2 + (row % 2) * qw; cx < x1 + qw * 2; cx += qw * 2)
          quarries.push({ path: polyPath([[cx - qw, cy], [cx, cy - qh], [cx + qw, cy], [cx, cy + qh]]), cx, cy, seed: 5000 + 700 * i + row * 31 + Math.round(cx) });
      LAN.push({ open: polyPath(o0), field: polyPath(o1), segs, quarries });
    }
  }
  function drawLancets(c) {
    for (let i = 0; i < 4; i++) {
      const L = LAN[i];
      c.save(); c.clip(L.open);
      c.save(); c.clip(L.field);
      for (const Q of L.quarries) {
        pane(c, Q.path, LQ[i], Q.seed, { ew: 20, shade: .34, lw: 8 });
        paint(c, 3, .55); c.beginPath(); c.arc(Q.cx, Q.cy, 13, 0, TAU); c.stroke();
        c.fillStyle = 'rgba(42,24,12,.6)'; c.beginPath(); c.arc(Q.cx, Q.cy, 4, 0, TAU); c.fill();
      }
      // the arch-top rosette, as window.js drawRosette
      const cx = llx(i) + LL / 2, cy = LAPEX + 250, cols = LROS[i];
      pane(c, circPath(cx, cy, 104), cols[0], 70 + i, { ew: 26 });
      for (let k = 0; k < 8; k++) { const a = k * TAU / 8 + Math.PI / 8, p = new Path2D(); p.ellipse(cx + Math.cos(a) * 57, cy + Math.sin(a) * 57, 40, 21, a, 0, TAU); pane(c, p, k % 2 ? cols[1] : cols[2], 80 + i * 10 + k, { ew: 12 }); }
      pane(c, circPath(cx, cy, 26), C.gold, 99 + i, { ew: 10 });
      c.restore();
      for (const S of L.segs) { pane(c, S.path, BCOL[S.k % 4], 1000 * i + S.k, { ew: 12, shade: .3, lw: 8 }); if (S.k % 4 === 2) pane(c, circPath(S.cx, S.cy, 9), C.white, 1000 * i + S.k + 3, { ew: 6, lw: 5 }); }
      c.restore();
    }
  }

  // ---------------- texture laid with the glass's symmetry ----------------
  let PAT = null;
  function layTexture(t) {
    tl.setTransform(1, 0, 0, 1, 0, 0); tl.globalCompositeOperation = 'source-over'; tl.fillStyle = 'rgb(128,128,128)'; tl.fillRect(0, 0, OW, OH);
    world(tl); tl.fillStyle = PAT;
    const fillTex = (path, rot, ox = 0, oy = 0) => { // the same texture patch, carried by the piece's rotation
      tl.save(); tl.rotate(rot); tl.clip(path); tl.translate(ox, oy); tl.fillRect(-1400, -1400, 2800, 2800); tl.restore();
    };
    // fixed parts: the lancets, the daisy's still gold ring and disc
    tl.save(); tl.translate(-37, 51); tl.fillRect(view.x0 - 100, view.y0 - 100, view.x1 - view.x0 + 200, view.y1 - view.y0 + 200); tl.restore();
    const ai = angIn(t), ao = angOut(t), ad = angDz(t);
    for (let k = 0; k < NDZ; k++) fillTex(DZP, ad + k * TAU / NDZ, 211, -13);
    for (let k = 0; k < N; k++) {
      fillTex(wedge(R.inA - 2, R.inB + 2, -SEC / 2, SEC / 2), ai + k * SEC, 90, 40);
      fillTex(wedge(R.outA - 2, R.outB + 2, -SEC / 2, SEC / 2), ao + k * SEC, -160, 260);
    }
    for (let k = 0; k < N; k++) { // the crown and foil straddle the sector edge: re-lay them whole
      for (const [r, path, ox] of [[CROWN_R, crownPath, 17]]) {
        tl.save(); sectorFrame(tl, ao + k * SEC, r, SEC / 2); tl.clip(path); tl.translate(ox, 0); tl.fillRect(-300, -300, 600, 600); tl.restore();
      }
    }
  }

  // ---------------- stone ----------------
  const WALL_L = .5;
  const stoneBase = mix([18, 16, 15], [64, 58, 52], WALL_L);
  const stoneLit = mix(stoneBase, [150, 140, 128], .35);
  function stoneRing(c, r0, r1) {
    c.fillStyle = rgb(mix(stoneBase, [120, 112, 102], .3)); c.fill(ring(r0, r1), 'evenodd');
    c.lineWidth = 12; c.strokeStyle = 'rgba(0,0,0,.5)';
    for (const r of [r0, r1]) { c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); }
    c.lineWidth = 5; c.strokeStyle = rgb(stoneLit); c.beginPath(); c.arc(0, 0, (r0 + r1) / 2 - 4, 0, TAU); c.stroke();
    c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(0, 0, (r0 + r1) / 2 + 3, 0, TAU); c.stroke();
  }
  // stone colonnettes on the sector edges: they turn with their ring and cover its radial joints
  function colonnette(c, r0, r1, w0, w1) {
    const body = polyPath([[-w0 / 2, -r0], [-w1 / 2, -r1], [w1 / 2, -r1], [w0 / 2, -r0]]);
    c.fillStyle = rgb(mix(stoneBase, [120, 112, 102], .3)); c.fill(body);
    c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,.55)'; c.stroke(body);
    c.lineWidth = 3; c.strokeStyle = rgb(stoneLit); c.beginPath(); c.moveTo(-w0 * .12, -r0); c.lineTo(-w1 * .12, -r1); c.stroke();
    for (const [r, w] of [[r1, w1 * 1.7]]) { // capital
      const cap = polyPath([[-w / 2, -r + 4], [-w / 2, -r - 14], [w / 2, -r - 14], [w / 2, -r + 4]]);
      c.fillStyle = rgb(stoneLit); c.fill(cap); c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.55)'; c.stroke(cap);
    }
  }
  function drawColonnettes(c, t) {
    const ai = angIn(t), ao = angOut(t);
    for (let k = 0; k < N; k++) {
      c.save(); c.rotate(ai + k * SEC + SEC / 2); colonnette(c, R.inA - 4, R.inB - 14, 16, 26); c.restore();
      c.save(); c.rotate(ao + k * SEC + SEC / 2); colonnette(c, R.outA - 4, CROWN_R - 58, 24, 30); c.restore();
    }
  }
  // the great pointed arch over the rose and lancets (its jambs sit just outside the frame)
  const ARCH = { x: 1185, y: 220, r: 2370 };
  function archPath(d) {
    const p = new Path2D(), r = ARCH.r - d, apA = Math.acos(ARCH.x / r);
    p.moveTo(-ARCH.x + d, view.y1 + 100); p.lineTo(-ARCH.x + d, ARCH.y);
    p.arc(ARCH.x, ARCH.y, r, Math.PI, Math.PI + apA, false);
    p.arc(-ARCH.x, ARCH.y, r, TAU - apA, TAU, false);
    p.lineTo(ARCH.x - d, view.y1 + 100); return p;
  }
  function drawWall(c, t, glow) {
    const p = new Path2D(); p.rect(view.x0 - 50, view.y0 - 50, view.x1 - view.x0 + 100, view.y1 - view.y0 + 100);
    p.addPath(circPath(0, 0, R.hood)); for (const L of LAN) p.addPath(L.open);
    c.fillStyle = rgb(stoneBase); c.fill(p, 'evenodd');
    c.save(); c.clip(p, 'evenodd');
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 4;
    const ch = 130;
    for (let y = Math.floor(view.y0 / ch) * ch; y < view.y1 + 50; y += ch) {
      c.beginPath(); c.moveTo(view.x0 - 50, y); c.lineTo(view.x1 + 50, y); c.stroke();
      const off = (Math.round(y / ch) % 2) * 170;
      for (let x = Math.floor((view.x0 - off) / 340) * 340 + off; x < view.x1 + 50; x += 340) {
        c.beginPath(); c.moveTo(x + (rnd(x, y) - .5) * 30, y); c.lineTo(x + (rnd(x, y) - .5) * 30, y + ch); c.stroke();
      }
    }
    // the arch's inner order is a shade darker (set back), its moulding catches the light
    c.fillStyle = 'rgba(0,0,0,.16)'; c.fill(archPath(60));
    c.globalCompositeOperation = 'screen';
    const rg = c.createRadialGradient(0, 0, 900, 0, 0, 2100); rg.addColorStop(0, `rgba(150,120,110,${.16 * glow})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = rg; c.fillRect(view.x0 - 50, view.y0 - 50, view.x1 - view.x0 + 100, view.y1 - view.y0 + 100);
    c.restore();
    c.lineJoin = 'round';
    for (const [d, w, col] of [[0, 40, rgb(stoneLit)], [0, 12, 'rgba(0,0,0,.5)'], [60, 22, rgb(mix(stoneBase, [150, 140, 128], .22))], [60, 8, 'rgba(0,0,0,.45)']]) {
      c.lineWidth = w; c.strokeStyle = col; c.stroke(archPath(d));
    }
    // the rose's own mouldings: chamfer at the glass, a roll moulding outside it
    for (const [r, w, col] of [[R.hood + 6, 40, rgb(stoneLit)], [R.hood, 12, 'rgba(0,0,0,.55)'], [R.hood + 62, 26, rgb(mix(stoneBase, [150, 140, 128], .25))], [R.hood + 62, 8, 'rgba(0,0,0,.45)']]) {
      c.lineWidth = w; c.strokeStyle = col; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
    }
    for (const L of LAN) { c.lineWidth = 30; c.strokeStyle = rgb(stoneLit); c.stroke(L.open); c.lineWidth = 9; c.strokeStyle = 'rgba(0,0,0,.5)'; c.stroke(L.open); }
    stoneRing(c, R.st1a, R.st1b);
    stoneRing(c, R.st2a, R.st2b);
  }

  // ---------------- light ----------------
  const GLASS = (() => { const p = new Path2D(); p.addPath(circPath(0, 0, R.outB)); return p; })();
  const light = (t) => .95 + .05 * wave(t, 1, .4); // the sun breathes once a loop
  function lightGlass(c, t) {
    const I = light(t);
    const all = new Path2D(); all.addPath(GLASS); for (const L of LAN) all.addPath(L.open);
    c.save(); c.clip(all);
    // texture overlay, laid with the glass's symmetry
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'overlay'; c.globalAlpha = .6; c.drawImage(TL, 0, 0);
    world(c); c.globalAlpha = 1; c.globalCompositeOperation = 'multiply';
    // daylight from the upper left: the panes brighten as they turn into it (fixed in screen space)
    const [sx, sy] = [Math.sin(SUN) * 900, -Math.cos(SUN) * 900];
    const rg = c.createRadialGradient(sx, sy, 0, sx, sy, 2700);
    const col = [255, 250, 238], st = [[0, 1], [.3, .97], [.62, .74], [1, .5]];
    for (const [u, v] of st) rg.addColorStop(u, rgb(col.map((x) => x * v * I)));
    c.fillStyle = rg; c.fill(GLASS);
    c.fillStyle = rgb(col.map((x) => x * .78 * I)); for (const L of LAN) c.fill(L.open);
    // a soft sunbeam hotspot circling slowly over the glass, once a loop
    c.globalCompositeOperation = 'screen';
    const hx = sx * .55 + 170 * Math.cos(TAU * t / PERIOD), hy = sy * .55 + 130 * Math.sin(TAU * t / PERIOD);
    const hg = c.createRadialGradient(hx, hy, 0, hx, hy, 780); hg.addColorStop(0, `rgba(255,240,210,${.2 * I})`); hg.addColorStop(1, 'rgba(255,240,210,0)');
    c.fillStyle = hg; c.fillRect(hx - 800, hy - 800, 1600, 1600);
    c.restore();
  }
  // light through the cracks, and glints on the hearts and crowns as they turn past the sun
  function drawGlints(c, t) {
    c.save(); c.globalCompositeOperation = 'screen';
    const ai = angIn(t), ao = angOut(t), pulse = .82 + .18 * wave(t, 2, 1.1);
    for (let k = 0; k < N; k++) {
      const b = ai + k * SEC, f = facing(b, 2);
      c.save(); c.rotate(b); heartFrame(c); c.save(); c.clip(heartWhole);
      // the crack: daylight showing between the two halves
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = `rgba(200,225,255,${(.55 + .4 * f) * pulse})`; c.lineWidth = 9; c.stroke(crackLine);
      c.strokeStyle = `rgba(255,255,255,${(.35 + .6 * f) * pulse})`; c.lineWidth = 3.5; c.stroke(crackLine);
      c.restore();
      // a glint on the upper lobes, strongest facing the sun
      const gf = facing(b, 6);
      if (gf > .01) {
        for (const x of [-72, 66]) {
          const gg = c.createRadialGradient(x, 288, 0, x, 288, 44); gg.addColorStop(0, `rgba(255,248,232,${.4 * gf})`); gg.addColorStop(1, 'rgba(255,248,232,0)');
          c.fillStyle = gg; c.fillRect(x - 44, 244, 88, 88);
        }
      }
      c.restore();
    }
    for (let k = 0; k < N; k++) { // the deadpan glint over each empty crown, sweeping as it passes the top
      const b = ao + k * SEC + SEC / 2, d = Math.atan2(Math.sin(b - SUN * .4), Math.cos(b - SUN * .4)); // signed angle past the glint line
      const u = d / (SEC * .55);
      if (Math.abs(u) > 1.2) continue;
      c.save(); sectorFrame(c, ao + k * SEC, CROWN_R, SEC / 2); c.clip(crownPath);
      const gx = -u * 90, lg = c.createLinearGradient(gx - 26, 0, gx + 26, 0);
      lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, `rgba(255,255,255,${.8 * (1 - Math.abs(u) / 1.2)})`); lg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = lg; c.fillRect(-90, -60, 180, 120); c.restore();
    }
    // the daisy's gold heart glows on the breath
    const dg = c.createRadialGradient(0, 0, 0, 0, 0, 120); dg.addColorStop(0, `rgba(255,236,170,${.22 + .1 * wave(t, 1, .4)})`); dg.addColorStop(1, 'rgba(255,236,170,0)');
    c.fillStyle = dg; c.fillRect(-120, -120, 240, 240);
    c.restore();
  }

  // ---------------- screen-space finishing (the film's bloom, shafts, dust, vignette, grain) ----------------
  const BW1 = Math.max(2, Math.round(OW / 8)), BH1 = Math.max(2, Math.round(OH / 8));
  const BL1 = mkCanvas(BW1, BH1), BL2 = mkCanvas(Math.max(2, Math.round(BW1 / 4)), Math.max(2, Math.round(BH1 / 4)));
  const bl1 = BL1.getContext('2d'), bl2 = BL2.getContext('2d');
  function bloom(c, amt) {
    bl1.imageSmoothingQuality = 'high'; bl1.drawImage(out, 0, 0, BL1.width, BL1.height); bl2.drawImage(BL1, 0, 0, BL2.width, BL2.height);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen'; c.imageSmoothingQuality = 'high';
    c.globalAlpha = .22 * amt; c.drawImage(BL1, 0, 0, OW, OH); c.globalAlpha = .3 * amt; c.drawImage(BL2, 0, 0, OW, OH); c.restore();
  }
  function drawShafts(c, t) {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen';
    const I = light(t);
    for (let k = 0; k < 3; k++) { // soft bands falling from the upper left toward us
      const x = (60 + k * 250 + 30 * wave(t, 1, k * 2.1)) * K + OX, w = (70 + 40 * rnd(k, 91)) * K;
      const lg = c.createLinearGradient(x, OY, x + 380 * K, OY + 1280 * K); lg.addColorStop(0, `rgba(255,240,215,${.032 * I})`); lg.addColorStop(1, 'rgba(255,240,215,0)');
      c.fillStyle = lg; c.beginPath(); c.moveTo(x - 200 * K, OY - 10); c.lineTo(x + w - 200 * K, OY - 10); c.lineTo(x + w + 360 * K, OY + 1290 * K); c.lineTo(x + 360 * K, OY + 1290 * K); c.closePath(); c.fill();
    }
    for (let k = 0; k < 46; k++) { // dust motes: each drifts round its own small loop, once or twice a loop
      const n = 1 + (k % 2), ph = rnd(k, 98) * TAU;
      const x = OX + K * (rnd(k, 92) * 720 + (14 + 30 * rnd(k, 93)) * Math.sin(TAU * n * t / PERIOD + ph));
      const y = OY + K * (200 + rnd(k, 94) * 760 + (10 + 26 * rnd(k, 95)) * Math.cos(TAU * n * t / PERIOD + ph * 1.3));
      const a = (.14 + .34 * rnd(k, 96)) * (.5 + .5 * wave(t, 1 + (k % 3), k)) * I;
      c.fillStyle = `rgba(255,246,225,${a})`; c.beginPath(); c.arc(x, y, (.9 + rnd(k, 97) * 1.6) * K, 0, TAU); c.fill();
    }
    c.restore();
  }
  let GPATS = null;
  function grain(c, t, alpha) { // core.js's grain tiles, on a frame index that wraps with the loop
    if (!GRAIN.length) buildGrain();
    if (!GPATS) GPATS = GRAIN.map((tile) => c.createPattern(tile, 'repeat'));
    const f = ((Math.round(t * FPS) % (PERIOD * FPS)) + PERIOD * FPS) % (PERIOD * FPS);
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = alpha; c.globalCompositeOperation = 'overlay';
    const ox = Math.floor(rnd(f, 3) * 512), oy = Math.floor(rnd(f, 7) * 512);
    c.translate(-ox, -oy); c.fillStyle = GPATS[f % GPATS.length]; c.fillRect(0, 0, OW + 512, OH + 512); c.restore();
  }

  function renderFrame(t) {
    if (!DBG_NOWRAP) { t = ((t % PERIOD) + PERIOD) % PERIOD; if (t > PERIOD - 1e-9) t = 0; }
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    g.fillStyle = '#000'; g.fillRect(0, 0, OW, OH);
    world(g);
    g.save(); g.clip(GLASS);
    drawOuterRing(g, t);
    drawInnerRing(g, t);
    drawDaisy(g, t);
    g.restore();
    drawLancets(g);
    layTexture(t);
    world(g); lightGlass(g, t);
    world(g); drawGlints(g, t);
    world(g); drawColonnettes(g, t);
    world(g); drawWall(g, t, light(t));
    bloom(g, light(t));
    drawShafts(g, t);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    const vg = g.createRadialGradient(CX, CY, 330 * K, CX, CY, 900 * K); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = vg; g.fillRect(0, 0, OW, OH);
    if (!DBG_NOGRAIN) grain(g, t, .12);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }

  if (!TEX) buildTex(); PAT = tl.createPattern(TEX, 'repeat'); if (!GRAIN.length) buildGrain(); buildLancets();
  if (EMB) { window.roseLoop = { canvas: out, render: renderFrame }; return; }
  window.__ready = Promise.resolve(true);
  window.__framePNG = (t) => { renderFrame(t); return out.toDataURL('image/png'); };
  window.__frameJPEG = (t, q = .93) => { renderFrame(t); return out.toDataURL('image/jpeg', q); };
  if (params.has('offline')) return;
  // live preview only (the render path above never reads a clock): ?t= holds one frame, else it plays
  if (params.has('t')) { renderFrame(parseFloat(params.get('t'))); return; }
  const t0 = performance.now();
  (function loop() { renderFrame(((performance.now() - t0) / 1000) % PERIOD); requestAnimationFrame(loop); })();
})();
