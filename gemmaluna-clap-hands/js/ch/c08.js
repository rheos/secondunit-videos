// c08 · VERSE 3 AGAIN (SEC.v3b 142.48 - SEC.b2 165.0) · an empty Art Nouveau theatre.
// Opens under the dome's glass oculus (c07 pushed into its lantern), tilts down to the curtain;
// the curtains part on a painted backdrop of dreams, one spotlight finds the jeans on a costume rail,
// the helmet with the note on a stool, catches Mr. Knickerbocker slipping out, a chair turning; the curtains close.
// Hand-off: the closed curtain with a seam of light down the middle (x 540).
(() => {
  // ---- private helpers ----
  const lighter = (fn) => { f.save(); f.globalCompositeOperation = 'lighter'; fn(); f.restore(); };
  const RUBY2 = '#7e3024', HOUSE = '#2c1f2e', STEEL = '#8a9898', STEEL2 = '#6c7a7c', DENIM = '#3f5578', DENIM2 = '#304262';
  const arch = (x0, x1, yTop, yBot) => { const r = (x1 - x0) / 2, cx = (x0 + x1) / 2; return [[x0, yBot], [x0, yTop + r], ...circle(cx, yTop + r, r, 60).filter(([, py]) => py <= yTop + r + .1).sort((a, b) => a[0] - b[0]), [x1, yTop + r], [x1, yBot]]; };
  // the spotlight: a soft beam from high stage right down to a pool; the pool is also lightened in the underpainting
  function spotPool(x, y, rx, ry, a) { if (a <= .01) return; s.save(); s.globalAlpha = .38 * a; s.fillStyle = rgrad(x, y, 0, rx, [[0, C.cream], [.7, C.parch], [1, 'rgba(226,204,156,0)']]); s.beginPath(); s.ellipse(x, y, rx, ry, 0, 0, TAU); s.fill(); s.restore(); }
  function spotLight(sx, sy, x, y, rx, ry, a) {
    if (a <= .01) return;
    lighter(() => {
      const g = f.createLinearGradient(sx, sy, x, y); g.addColorStop(0, `rgba(255,240,205,${.03 * a})`); g.addColorStop(1, `rgba(255,236,200,${.09 * a})`);
      const ang = Math.atan2(y - sy, x - sx), nx = -Math.sin(ang), ny = Math.cos(ang);
      f.fillStyle = g; f.beginPath(); f.moveTo(sx + nx * 30, sy + ny * 30); f.lineTo(x + nx * rx, y + ny * ry); f.lineTo(x - nx * rx, y - ny * ry); f.lineTo(sx - nx * 30, sy - ny * 30); f.closePath(); f.fill();
      f.save(); f.translate(x, y); f.scale(1, ry / rx); const pg = f.createRadialGradient(0, 0, 0, 0, 0, rx); pg.addColorStop(0, `rgba(255,244,215,${.2 * a})`); pg.addColorStop(.75, `rgba(255,230,180,${.12 * a})`); pg.addColorStop(1, 'rgba(0,0,0,0)'); f.fillStyle = pg; f.beginPath(); f.arc(0, 0, rx, 0, TAU); f.fill(); f.restore();
    });
  }
  // dust motes drifting in the beam
  function motes(t, sx, sy, x, y, n, a) {
    const r = rng(61);
    lighter(() => { for (let i = 0; i < n; i++) { const u = (r() + t * .05 * (r() + .5)) % 1, w = (r() - .5) * 2, px = lerp(sx, x, u) + w * lerp(20, 150, u) + Math.sin(t + i) * 8, py = lerp(sy, y, u) + Math.cos(t * .7 + i) * 10;
      f.fillStyle = `rgba(255,240,210,${a * (.3 + .4 * r())})`; f.beginPath(); f.arc(px, py, 2 + r() * 3, 0, TAU); f.fill(); } });
  }
  // a Lalique dragonfly silhouette (used as a shadow)
  function dragonflyPts(x, y, sc, ang, flap) {
    const c = Math.cos(ang), sn = Math.sin(ang), R = ([px, py]) => [x + (px * c - py * sn) * sc, y + (px * sn + py * c) * sc], out = [];
    const body = [[1, 0], [.88, .07], [.7, .05], [.3, .035], [-.6, .02], [-.9, 0], [-.6, -.02], [.3, -.035], [.7, -.05], [.88, -.07]].map(R);
    const wings = [[.45, 1, 1], [.45, -1, 1], [.2, 1, .85], [.2, -1, .85]].map(([bx, side, L]) => { const a = side * (1.25 - flap * .35) + (bx < .3 ? side * .25 : 0); const d = [Math.cos(a), Math.sin(a)];
      return cub([bx, 0], [bx + d[0] * .4 * L + .12, d[1] * .4 * L], [bx + d[0] * .85 * L + .08, d[1] * .85 * L], [bx + d[0] * .9 * L - .06, d[1] * .9 * L], 10).concat(cub([bx + d[0] * .9 * L - .06, d[1] * .9 * L], [bx + d[0] * .6 * L - .14, d[1] * .6 * L], [bx + d[0] * .2 * L - .1, d[1] * .2 * L], [bx - .02, 0], 10)).map(R); });
    return [body, ...wings];
  }
  function dragonShadow(x, y, sc, ang, flap) {
    for (const p of dragonflyPts(x, y, sc, ang, flap)) { s.save(); s.globalAlpha = .6; shape(s, p, C.umber, null); s.restore(); f.save(); f.fillStyle = '#000'; f.globalAlpha = .85; P(f, p); f.closePath(); f.fill(); f.restore(); }
  }
  // the painted backdrop of dreams: a whiplash vortex, a crescent moon, painted stars and lilies, cloud scrolls
  function backdrop(t, x0, x1, y0, y1, glowK = 1) {
    s.fillStyle = vgrad(y0, y1, [[0, '#24304a'], [1, '#3a3554']]); s.fillRect(x0, y0, x1 - x0, y1 - y0);
    const cx = (x0 + x1) / 2, cy = lerp(y0, y1, .42), sw = Math.sin(t * .6) * 6;
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + t * .05, R = 360 - i * 40;
      vine(s, whip([cx + Math.cos(a) * R * 1.4 + sw, cy + Math.sin(a) * R], [cx + Math.cos(a + .8) * R + sw, cy + Math.sin(a + .8) * R * .8], [cx + Math.cos(a + 1.6) * R * .5, cy + Math.sin(a + 1.6) * R * .5], [cx + Math.cos(a + 2.4) * 60, cy + Math.sin(a + 2.4) * 60], 1, 1, 30), 70 - i * 8, 18, [C.dusk, C.teal, '#5a4a6e', C.glass][i], 1); }
    // crescent moon
    const mx = lerp(x0, x1, .22), my = lerp(y0, y1, .16);
    shape(s, [...circle(mx, my, 110, 50).slice(10, 41), ...circle(mx + 50, my - 25, 90, 50).slice(10, 41).reverse()], C.gold, C.umber, 14);
    const r = rng(17); for (let i = 0; i < 9; i++) { const sx = lerp(x0 + 60, x1 - 60, r()), sy = lerp(y0 + 60, y1 - 280, r()); shape(s, starPts(sx, sy, 22 + r() * 16, .3), C.parch, C.umber, 8); }
    // painted cloud scrolls along the bottom of the drop
    for (let i = 0; i < 4; i++) { const bx = lerp(x0, x1, i / 3), dir = i % 2 ? 1 : -1; shape(s, blobPts(bx, y1 - 140, 220, 110, i + 3, .1, 40), i % 2 ? C.plum : '#4b4466', C.umber, 14); vine(s, whip([bx - 120, y1 - 160], [bx - 40, y1 - 260], [bx + 80, y1 - 230], [bx + 60, y1 - 170], .8, dir, 24), 22, 8, C.blush, 1); }
    for (let i = 0; i < 3; i++) lily(s, lerp(x0 + 160, x1 - 160, i / 2), y1 - 330 + (i % 2) * 40, -Math.PI / 2 + (i - 1) * .3, 110, .8, [C.blush, C.cream]);
    glowAt(mx, my, 260, `rgba(255,220,150,${.12 * glowK})`);
  }
  function starPts(x, y, r, rot = 0) {
    const o = [];
    for (let i = 0; i < 4; i++) { const a0 = rot + i / 4 * TAU, a1 = rot + (i + 1) / 4 * TAU, am = (a0 + a1) / 2;
      const p0 = [x + Math.cos(a0) * r, y + Math.sin(a0) * r], p3 = [x + Math.cos(a1) * r, y + Math.sin(a1) * r], c = [x + Math.cos(am) * r * .16, y + Math.sin(am) * r * .16];
      o.push(...cub(p0, c, c, p3, 8).slice(0, -1)); }
    return o;
  }
  // stage curtains: two velvet panels of folds; open 0 = closed (meeting at x 540) .. 1 = drawn back and tied
  const OX0 = 150, OX1 = 930, OTOP = 370, FLOOR = 1500;
  function curtains(t, open, seam = 0, rustle = 0) {
    const sway0 = Math.sin(t * 1.3) * 6 * (1 - open) + Math.sin(t * 4) * 10 * open * (1 - open) * 4;
    for (const side of [-1, 1]) {
      const outer = side < 0 ? OX0 - 20 : OX1 + 20, inner = (y) => { // inner edge, swept back to a tie point when open
        const u = clamp((y - OTOP) / (FLOOR - OTOP)), tie = Math.exp(-Math.pow((u - .58) / .3, 2));
        const pull = open * lerp(.62, .95, tie) + open * open * .02, xi = lerp(540, outer, pull);
        const sway = sway0 + (side > 0 ? rustle * Math.sin(t * 7) * 40 * u : 0);
        return xi + sway * (u * u) * side;
      };
      const n = 8, ys = [...Array(15)].map((_, j) => lerp(OTOP - 10, FLOOR + 12, j / 14));
      const fold = (i) => ys.map((y, j) => { const xi = inner(y), k = i / n; return [lerp(outer, xi, k) + Math.sin(j * .9 + i * 1.7 + t * .8) * 6 * (1 - Math.abs(.5 - k)), y + (j === 14 ? Math.sin(i * 2.1) * 10 : 0)]; });
      for (let i = 0; i < n; i++) {
        const a = fold(i), b = fold(i + 1);
        shape(s, [...a, ...b.reverse()], [C.ruby, RUBY2, '#b6553f', RUBY2][i % 4], C.umber, 12);
      }
      // gold hem band and an embroidered whiplash
      const hemA = fold(0).slice(-2), hemB = fold(n).slice(-2);
      shape(s, [[hemA[0][0], FLOOR - 60], [hemB[0][0], FLOOR - 60], [hemB[1][0], FLOOR + 12], [hemA[1][0], FLOOR + 12]], C.gold, C.umber, 12);
      const ex = lerp(outer, inner(1250), .5);
      if (open < .5) { const stem = cub([ex - side * 40, FLOOR - 60], [ex - side * 70, 1300], [ex + side * 40, 1150], [ex + side * 10, 1020], 24); vine(s, stem, 18, 10, C.gold); lily(s, ex + side * 10, 1020, -Math.PI / 2, 120, .75, [C.gold, C.ochre]); petal(s, ...stem[8], -Math.PI / 2 - side * .9, 110, 26, C.gold, C.umber, 9); }
      if (open > .9) { // tie-back cord and tassel
        const ty = lerp(OTOP, FLOOR, .58), tx = inner(ty);
        vine(s, cub([outer, ty - 40], [lerp(outer, tx, .5), ty + 20], [tx, ty + 10], [tx - side * 10, ty], 12), 16, 14, C.gold);
        shape(s, [[tx - 16, ty + 10], [tx + 16, ty + 10], [tx + 26, ty + 110], [tx - 26, ty + 110]], C.gold, C.umber, 10);
      }
    }
    if (seam > 0) lighter(() => { // light from behind the closed curtain, through the seam
      const g = f.createLinearGradient(500, 0, 580, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, `rgba(255,230,170,${.9 * seam})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      f.fillStyle = g; f.fillRect(500, OTOP + 90, 80, FLOOR - OTOP - 90); f.fillStyle = `rgba(255,248,225,${seam})`; f.fillRect(536, OTOP + 100, 8, FLOOR - OTOP - 100);
      glowAt(540, FLOOR - 40, 260 * seam, `rgba(255,220,150,${.5 * seam})`);
    });
  }
  // the valance across the top of the opening: ruby swags with a gold fringe
  function valance() {
    for (let i = 0; i < 5; i++) { const x0 = OX0 + i * (OX1 - OX0) / 5, x1 = x0 + (OX1 - OX0) / 5;
      shape(s, [[x0, OTOP - 40], [x1, OTOP - 40], ...cub([x1, OTOP - 40], [x1, OTOP + 90], [x0, OTOP + 90], [x0, OTOP - 40], 16)], i % 2 ? C.ruby : RUBY2, C.umber, 12);
      vine(s, cub([x1, OTOP + 10], [x1 - 20, OTOP + 80], [x0 + 20, OTOP + 80], [x0, OTOP + 10], 16), 14, 14, C.gold); }
  }
  // the proscenium: a gold arch with mosaic, whiplash scrolls and a halo crest; loges; the footlights; the house
  function proscenium(t, foot) {
    s.beginPath(); s.rect(-400, 40, 1880, 2560); arch(OX0, OX1, OTOP - 60, FLOOR).forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = '#3a2838'; s.fill('evenodd');
    // loges either side: arched boxes with gold rails
    for (const sx of [-1, 1]) for (let j = 0; j < 2; j++) { const lx = sx < 0 ? -240 : 1100, ly = 620 + j * 480;
      shape(s, arch(lx - 70, lx + 220 - 80, ly, ly + 330), '#4a2a35', C.umber, 14); shape(s, [[lx - 90, ly + 300], [lx + 160, ly + 300], [lx + 160, ly + 370], [lx - 90, ly + 370]], C.gold, C.umber, 12); }
    const band = [...arch(OX0 - 80, OX1 + 80, OTOP - 140, FLOOR), ...arch(OX0, OX1, OTOP - 60, FLOOR).reverse()];
    shape(s, band, C.gold, C.umber, 18);
    const cx = 540, cyA = OTOP - 140 + (OX1 - OX0 + 160) / 2, R0 = (OX1 - OX0 + 160) / 2, R1 = (OX1 - OX0) / 2;
    for (let i = 0; i < 18; i++) { const a0 = Math.PI + i / 18 * Math.PI, a1 = a0 + Math.PI / 18 * .75, rm = (R0 + R1) / 2 + 2, rr = [R0 - 14, rm + 4, rm - 4, R1 + 14];
      shape(s, [[cx + Math.cos(a0) * rr[0], cyA + Math.sin(a0) * rr[0]], [cx + Math.cos(a1) * rr[0], cyA + Math.sin(a1) * rr[0]], [cx + Math.cos(a1) * rr[3], cyA + Math.sin(a1) * rr[3]], [cx + Math.cos(a0) * rr[3], cyA + Math.sin(a0) * rr[3]]], i % 2 ? C.sage : C.rose, C.umber, 7); }
    for (const sx of [-1, 1]) { const x0 = sx < 0 ? OX0 - 40 : OX1 + 40; for (let j = 0; j < 3; j++) petal(s, x0, 1000 + j * 170, -Math.PI / 2 + sx * .2, 120, 34, j % 2 ? C.sage : C.olive, C.umber, 10);
      vine(s, whip([540 + sx * 120, OTOP - 150], [540 + sx * 260, OTOP - 260], [540 + sx * 420, OTOP - 180], [540 + sx * 480, OTOP - 60], .9, -sx, 36), 26, 10, C.olive, 1); }
    halo(540, OTOP - 150, 130, t * .1, .2);
    // the stage apron and footlights (shell lamps); `foot` 0..1, or per-lamp via a function
    shape(s, [[OX0 - 90, FLOOR], [OX1 + 90, FLOOR], [OX1 + 130, FLOOR + 90], [OX0 - 130, FLOOR + 90]], C.ochre, C.umber, 14);
    for (let i = 0; i < 9; i++) { const x = OX0 - 20 + i * (OX1 - OX0 + 40) / 8, on = typeof foot === 'function' ? foot(i) : foot;
      shape(s, [...cub([x - 34, FLOOR + 12], [x - 30, FLOOR - 40], [x + 30, FLOOR - 40], [x + 34, FLOOR + 12], 12)], on > .1 ? C.amber : C.ochre, C.umber, 10);
      if (on > 0) { glowAt(x, FLOOR - 10, 200, `rgba(255,190,110,${.35 * on})`); glowAt(x, FLOOR - 10, 40, `rgba(255,240,200,${.8 * on})`); } }
    // the empty house: rows of seat backs
    for (let row = 0; row < 3; row++) for (let i = -1; i < 12; i++) { const x = i * 100 + (row % 2) * 50, y = FLOOR + 190 + row * 150;
      shape(s, [[x - 40, y + 140], ...cub([x - 40, y + 30], [x - 38, y - 30], [x + 38, y - 30], [x + 40, y + 30], 12), [x + 40, y + 140]], row % 2 ? RUBY2 : C.ruby, C.umber, 12); }
  }
  // stage floor inside the opening
  function stageFloor() {
    shape(s, [[OX0, FLOOR - 140], [OX1, FLOOR - 140], [OX1 + 20, FLOOR], [OX0 - 20, FLOOR]], '#6a4a2c', C.umber, 12);
    for (let i = 1; i < 8; i++) { const x = lerp(OX0, OX1, i / 8); line([[lerp(540, x, .85), FLOOR - 140], [lerp(540, x, 1.05), FLOOR]], C.umber, 8); }
  }
  // the props, small, for the wide shots (the close shots draw them big)
  function propsWide(t, k) {
    // costume rail stage left
    vine(s, [[220, 1440], [220, 1180]], 12, 12, C.gold); vine(s, [[420, 1440], [420, 1180]], 12, 12, C.gold); vine(s, [[200, 1180], [440, 1180]], 12, 12, C.gold);
    [[255, C.rose], [310, C.plum], [365, DENIM]].forEach(([x, c], i) => shape(s, [[x - 22, 1190], [x + 22, 1190], [x + 30, 1360 - i * 30], [x - 30, 1360 - i * 30]], c, C.umber, 10));
    // the stool and helmet stage right
    shape(s, [[740, 1330], [840, 1330], [830, 1350], [750, 1350]], C.ochre, C.umber, 10); vine(s, [[760, 1350], [745, 1440]], 10, 10, C.ochre); vine(s, [[820, 1350], [835, 1440]], 10, 10, C.ochre);
    shape(s, blobPts(790, 1290, 42, 44, 3, .05, 24), STEEL, C.umber, 10);
  }
  // a bentwood chair turning about its vertical axis (theta), seen from slightly above
  function chair(cx, cy, sc, th, lw = 14) {
    const P3 = ([x, y, z]) => { const c = Math.cos(th), sn = Math.sin(th), X = x * c - z * sn, Z = x * sn + z * c; return { p: [cx + X * sc, cy - y * sc + Z * sc * .28], z: Z }; };
    const parts = [];
    const legs = [[-.42, -.42], [.42, -.42], [.42, .42], [-.42, .42]];
    legs.forEach(([x, z], i) => { const a = P3([x * .92, 0, z * .92]), b = P3([x * 1.15, -1.0, z * 1.15]); parts.push({ z: (a.z + b.z) / 2, d: () => vine(s, cub(a.p, [lerp(a.p[0], b.p[0], .3), lerp(a.p[1], b.p[1], .4)], [lerp(a.p[0], b.p[0], .8), lerp(a.p[1], b.p[1], .6)], b.p, 10), lw * 1.3, lw * .9, C.ochre) }); });
    // the ring under the seat
    const ring = [...Array(33)].map((_, i) => P3([Math.cos(i / 32 * TAU) * .62, -.62, Math.sin(i / 32 * TAU) * .62]).p);
    parts.push({ z: -.01, d: () => { line(ring, C.umber, lw * 1.2); line(ring, C.ochre, lw * .5); } });
    // the seat (round)
    const seat = [...Array(40)].map((_, i) => P3([Math.cos(i / 40 * TAU) * .55, 0, Math.sin(i / 40 * TAU) * .55]).p);
    const seatIn = seat.map(([x, y]) => [lerp(x, cx, .25), lerp(y, P3([0, 0, 0]).p[1], .25)]);
    parts.push({ z: 0, d: () => { shape(s, seat, C.ochre, C.umber, lw); shape(s, seatIn, C.sage, C.umber, lw * .6); } });
    // the back: two bent posts rising into a hoop with an inner whiplash loop (behind the seat at z = -.5 in chair space)
    const bz = (y) => -.42 - .14 * clamp(y / 1.55);
    const back = [...cub([-.42, 0], [-.52, .9], [-.42, 1.5], [0, 1.58], 20), ...cub([0, 1.58], [.42, 1.5], [.52, .9], [.42, 0], 20)].map(([x, y]) => P3([x, y, bz(y)]).p);
    const loop = whip([-.22, .3], [-.36, .9], [.12, 1.32], [.2, .85], .8, 1, 20).map(([x, y]) => P3([x, y, bz(y) + .02]).p);
    parts.push({ z: P3([0, 1, -.5]).z, d: () => { line(back, C.umber, lw * 2.2); line(back, C.ochre, lw * 1.2); line(loop, C.umber, lw * 1.6); line(loop, C.gold, lw * .7); } });
    parts.sort((a, b) => a.z - b.z).forEach((q) => q.d());
    return P3([0, 0, 0]).p;
  }

  // ---- shots ----
  // 142.48: under the dome's stained-glass oculus, starlight pouring in; tilt down to the closed curtain; footlights come on
  function house(t, lt, dur) {
    const cy = kf(lt, [[0, -260], [.5, -200], [dur, 960]], ease.inOut), z = kf(lt, [[0, 1.5], [dur, 1.0]], ease.inOut);
    cam(540, cy, z);
    s.fillStyle = HOUSE; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    // the dome interior: ribbed plum vault with gold ribs, the oculus at its crown
    shape(s, blobPts(540, -260, 1100, 700, 2, 0, 60), '#45293d', C.umber, 18);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; vine(s, cub([540 + Math.cos(a) * 250, -260 + Math.sin(a) * 250], [540 + Math.cos(a + .2) * 600, -260 + Math.sin(a + .2) * 420], [540 + Math.cos(a + .3) * 900, -260 + Math.sin(a + .3) * 600], [540 + Math.cos(a + .35) * 1100, -260 + Math.sin(a + .35) * 700], 24), 22, 12, C.gold); }
    oculus(t, 540, -260, 240);
    lighter(() => { const g = f.createLinearGradient(540, -260, 540, 1500); g.addColorStop(0, 'rgba(200,220,255,.16)'); g.addColorStop(1, 'rgba(200,220,255,0)'); f.fillStyle = g; f.beginPath(); f.moveTo(380, -260); f.lineTo(700, -260); f.lineTo(900, 1500); f.lineTo(180, 1500); f.closePath(); f.fill(); });
    proscenium(t, (i) => clamp(inv(143.3 + Math.abs(i - 4) * .25, 143.4 + Math.abs(i - 4) * .25, t)) * (.85 + .15 * Math.sin(t * 13 + i)));
    curtains(t, 0, 0); valance();
    border(t, 1);
  }
  function oculus(t, x, y, R) {
    shape(s, circle(x, y, R + 40, 60), C.gold, C.umber, 18);
    const cols = [C.amber, C.glass, C.rose, C.sage, C.gold, C.teal];
    for (let i = 0; i < 12; i++) { const a0 = i / 12 * TAU + t * .02, a1 = (i + 1) / 12 * TAU + t * .02;
      shape(s, [[x + Math.cos(a0) * R * .35, y + Math.sin(a0) * R * .35], [x + Math.cos(a0) * R, y + Math.sin(a0) * R], [x + Math.cos((a0 + a1) / 2) * R * 1.02, y + Math.sin((a0 + a1) / 2) * R * 1.02], [x + Math.cos(a1) * R, y + Math.sin(a1) * R], [x + Math.cos(a1) * R * .35, y + Math.sin(a1) * R * .35]], cols[i % 6], C.umber, 12); }
    shape(s, circle(x, y, R * .35, 40), C.cream, C.umber, 12);
    lily(s, x, y + R * .18, -Math.PI / 2, R * .3, .7, [C.blush, C.cream]);
    glowAt(x, y, R * 1.6, 'rgba(220,230,255,.22)'); glowAt(x, y, R * .45, 'rgba(255,245,225,.25)');
  }
  // 145.3: the curtains part on the painted backdrop of dreams; the spotlight snaps on; dragonfly shadows cross it
  function parting(t, lt, dur) {
    cam(540, kf(lt, [[0, 960], [dur, 900]]), kf(lt, [[0, 1.0], [dur, 1.14]], ease.inOut));
    const open = ease.inOut(inv(145.4, 146.9, t)), on = clamp(inv(146.84, 146.92, t)) * (.92 + .08 * Math.sin(t * 9));
    s.fillStyle = HOUSE; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    backdrop(t, OX0, OX1, OTOP - 60, FLOOR - 140, on); stageFloor(); propsWide(t);
    const px = 560 + Math.sin(t * .7) * 30, py = 900;
    spotPool(px, py, 300, 340, on);
    spotLight(1000, 120, px, py, 300, 340, on);
    // dragonfly shadows cross the pool on "dreams"
    [[147.0, -1, 820, 1.2], [147.3, 1, 1000, .9], [147.65, -1, 700, 1.5], [147.9, 1, 900, 1.1], [148.1, -1, 1050, .8]].forEach(([t0, dir, yy, sc], i) => { const u = inv(t0, t0 + .9, t); if (u <= 0 || u >= 1) return;
      const x = lerp(540 - dir * 620, 540 + dir * 620, u), y = yy + Math.sin(u * 7 + i) * 60, ang = (dir > 0 ? 0 : Math.PI) + Math.cos(u * 7 + i) * .25;
      dragonShadow(x, y, 200 * sc, ang, .5 + .5 * Math.sin(t * 38 + i * 2)); });
    proscenium(t, 1); curtains(t, open, 0); valance();
    border(t, 1);
  }
  // 148.65: the spotlight hunts across the boards and finds the Harlem walker strutting across the stage;
  // the pistol is only a butt peeking from his back pocket (it glints once)
  function walker(t, lt, dur) {
    const SC = 1000, ph = (beatPhase(t) - beatPhase(148.65)) / 2, wx = -60 + ph * walkStride(SC, { who: 'walker', stride: 1.05 });
    const cx = lerp(380, wx + 120, ease.inOut(inv(148.65, 149.6, t))), z = kf(t, [[148.65, 1.0], [150.9, 1.08], [152.45, 1.0]], ease.inOut);
    cam(cx, 1080, z);
    s.fillStyle = '#2e2a44'; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    backdrop(t, -900, 3200, -300, 1600, .3);
    shape(s, [[-1200, 1600], [3400, 1600], [3400, 2600], [-1200, 2600]], '#5a3f28', C.umber, 16);
    for (let i = 0; i < 16; i++) line([[-900 + i * 280, 1600], [-1400 + i * 360, 2600]], C.umber, 9);
    // painted cloud scrolls of the dream backdrop behind him
    for (let i = 0; i < 6; i++) shape(s, blobPts(-200 + i * 520, 1460, 320, 170, i + 9, .1, 40), i % 2 ? '#3d3456' : '#463a5c', C.umber, 16);
    // the spot: hunting, then locked on him from the sung place-name
    const lock = ease.inOut(inv(149.3, 149.84, t)), sx = lerp(kf(t, [[148.65, 900], [149.3, 300]]), wx, lock), on = clamp(inv(148.65, 148.85, t));
    spotPool(sx, 1300, 420, 700, on);
    const J = harlemWalker(t, wx, 1720, SC, { ph, facing: 1 });
    const pk = [J.pel[0] - .075 * J.h, J.pel[1] + .05 * J.h], g = hit(t, 150.9, 3);
    if (g > .02) glowAt(pk[0], pk[1], 110, `rgba(255,235,190,${.7 * g})`);
    spotLight(sx + 400, -500, sx, 1300, 420, 700, on);
    border(t, 1);
  }
  function hanger(x, y, rot) {
    s.save(); s.translate(x, y); s.rotate(rot);
    vine(s, whip([0, 0], [10, -40], [30, -50], [26, -28], .6, 1, 12), 10, 8, C.umber, 1, null);
    line([[-130, 90], [0, 20], [130, 90]], C.umber, 20); line([[-130, 90], [0, 20], [130, 90]], C.ochre, 9);
    s.restore();
  }
  function costume(x, y, rot, kind) {
    s.save(); s.translate(x, y); s.rotate(rot);
    if (kind === 'gown') { shape(s, [[-120, 0], [120, 0], [90, 260], [200, 1000], [-200, 1000], [-90, 260]], C.rose, C.umber, 16); for (let i = 0; i < 3; i++) vine(s, cub([-160 + i * 160, 1000], [-120 + i * 140, 800], [-60 + i * 60, 500], [-10 + i * 10, 280], 14), 14, 8, C.blush); }
    else if (kind === 'cape') { shape(s, [[-110, 0], [110, 0], [240, 900], [0, 960], [-240, 900]], C.plum, C.umber, 16); shape(s, [[-110, 0], [110, 0], [80, 70], [-80, 70]], C.gold, C.umber, 12); }
    else { shape(s, [[-130, 0], [130, 0], [150, 520], [0, 600], [-150, 520]], C.olive, C.umber, 16); line([[0, 20], [0, 590]], C.umber, 12); for (let i = 0; i < 4; i++) shape(s, circle(30, 100 + i * 110, 14, 14), C.gold, C.umber, 8); }
    s.restore();
  }
  // a pair of jeans hung by the waistband: two legs, seams, a front pocket with a pistol grip showing (an object, still)
  function jeansPair(t, x, y, rot, glint = true) {
    s.save(); s.translate(x, y); s.rotate(rot);
    const legs = [[-150, 0], [150, 0], [160, 120], [175, 1060], [20, 1060], [0, 300], [-20, 1060], [-175, 1060], [-160, 120]];
    shape(s, legs, DENIM, C.umber, 18);
    shape(s, [[-152, 0], [152, 0], [156, 60], [-156, 60]], DENIM2, C.umber, 14);
    for (const bx of [-110, -10, 90]) shape(s, [[bx, -14], [bx + 22, -14], [bx + 22, 66], [bx, 66]], DENIM2, C.umber, 8);
    shape(s, circle(0, 32, 14, 16), C.gold, C.umber, 8);
    // seams and cuffs in gold thread
    line([[-100, 150], [-110, 1040]], C.gold, 6); line([[100, 150], [110, 1040]], C.gold, 6);
    shape(s, [[-175, 1000], [-20, 1000], [-20, 1060], [-175, 1060]], DENIM2, C.umber, 12); shape(s, [[20, 1000], [175, 1000], [175, 1060], [20, 1060]], DENIM2, C.umber, 12);
    // the pistol grip: a curved wooden grip with a brass cap, standing out of the front pocket
    shape(s, [[60, 150], [70, 70], [110, 20], [150, 30], [140, 70], [120, 150]], '#6b4a2c', C.umber, 14);
    for (let i = 0; i < 3; i++) line([[78 + i * 14, 120], [98 + i * 14, 60]], C.umber, 5);
    shape(s, circle(132, 40, 12, 14), C.gold, C.umber, 7);
    shape(s, [...cub([40, 140], [70, 230], [140, 230], [160, 140], 14), [160, 150], [40, 150]], DENIM2, C.umber, 12); // pocket lip over the grip
    s.restore();
    const a = glint ? hit(t, 150.9, 3) : 0; if (a > .02) glowAt(x + 130 * Math.cos(rot) - 40 * Math.sin(rot), y + 40 * Math.cos(rot) + 130 * Math.sin(rot), 90, `rgba(255,235,190,${.7 * a})`);
  }
  // 152.45: the spot snaps onto a stool: a knight's helmet, a plain green note tucked in its visor
  function helmet(t, lt, dur) {
    cam(kf(lt, [[0, 520], [dur, 560]]), kf(lt, [[0, 1000], [dur, 900]]), kf(lt, [[0, 1.0], [dur, 1.18]], ease.inOut), kf(lt, [[0, -.02], [dur, .015]]));
    s.fillStyle = '#2e2a44'; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    for (let i = 0; i < 4; i++) shape(s, blobPts(-100 + i * 420, 1350, 280, 170, i + 21, .1, 40), i % 2 ? '#3d3456' : '#463a5c', C.umber, 16);
    shape(s, [[-800, 1480], [2000, 1480], [2000, 2600], [-800, 2600]], '#5a3f28', C.umber, 16);
    for (let i = 0; i < 9; i++) line([[-400 + i * 230, 1480], [-700 + i * 300, 2600]], C.umber, 9);
    const on = clamp(inv(152.45, 152.55, t)) * (.94 + .06 * Math.sin(t * 7));
    spotPool(540, 1080, 420, 620, on);
    // the stool: bentwood, round seat, splayed legs with a ring
    shape(s, [[330, 1300], [750, 1300], [730, 1360], [350, 1360]], C.ochre, C.umber, 16);
    for (const [a, b] of [[380, 300], [700, 780], [470, 450], [610, 640]]) vine(s, cub([a, 1360], [a + (b - a) * .3, 1500], [b, 1700], [b, 1880], 12), 26, 22, C.ochre);
    line(cub([330, 1650], [450, 1700], [630, 1700], [760, 1650], 16), C.umber, 22); line(cub([330, 1650], [450, 1700], [630, 1700], [760, 1650], 16), C.ochre, 10);
    // the helmet: domed armet with a visor; a rose plume curling up from the crest
    const bill = ease.back(inv(153.5, 153.85, t)), plume = ease.back(inv(155.04, 155.4, t)), clank = hit(t, 155.7, 6), bob = -12 * hit(t, 155.7, 8);
    plumeDraw(t, 590, 690 + bob, plume);
    const hx = 540, hy = 1010 + bob;
    // gorget flare at the base, then the rounded skull with a raised comb
    shape(s, [[hx - 250, hy + 300], [hx + 250, hy + 300], [hx + 200, hy + 200], [hx - 200, hy + 200]], STEEL2, C.umber, 16);
    shape(s, [...cub([hx - 210, hy + 220], [hx - 270, hy - 120], [hx - 130, hy - 310], [hx, hy - 310], 20), ...cub([hx, hy - 310], [hx + 130, hy - 310], [hx + 270, hy - 120], [hx + 210, hy + 220], 20)], STEEL, C.umber, 18);
    vine(s, cub([hx - 150, hy - 250], [hx - 60, hy - 330], [hx + 60, hy - 330], [hx + 150, hy - 250], 16), 22, 22, STEEL2);
    for (const sx of [-1, 1]) shape(s, circle(hx + sx * 175, hy + 20, 26, 16), C.gold, C.umber, 10);
    // the visor: a pointed beak, lifted a touch, slammed shut on the clank; the note is tucked in its eye slit
    const vis = lerp(-.1, 0, ease.in(inv(155.55, 155.7, t))) + .03 * clank * Math.sin((t - 155.7) * 40);
    s.save(); s.translate(hx - 190, hy - 60); s.rotate(vis);
    shape(s, [[0, 0], [380, 0], [380, 36], [0, 36]], STEEL2, C.umber, 14);            // brow plate above the slit
    shape(s, [[20, 36], [360, 36], [360, 66], [20, 66]], '#232a33', C.umber, 10);       // the eye slit
    // the note: a plain green slip, poking up out of the slit
    s.save(); s.translate(250, 52); s.rotate(-.5 + bill * .2 + .04 * Math.sin(t * 2.2));
    const nh = 110 + bill * 70;
    shape(s, [[-70, 20], [70, 20], [70, -nh], [-70, -nh]], C.sage, C.umber, 12);
    shape(s, [[-46, 0], [46, 0], [46, -nh + 24], [-46, -nh + 24]], null, C.olive, 8);
    shape(s, blobPts(0, -nh * .55, 20, 24, 5, .04, 18), C.olive, C.umber, 7);
    s.restore();
    shape(s, [[0, 66], [380, 66], [370, 130], [260, 190], [190, 280], [120, 190], [10, 130]], STEEL, C.umber, 16); // the beak below the slit
    vine(s, [[190, 80], [190, 260]], 10, 6, STEEL2);
    for (let i = 0; i < 3; i++) for (const sx of [-1, 1]) shape(s, circle(190 + sx * (60 + i * 40), 110 + i * 14, 9, 12), '#3d4848', C.umber, 5);
    s.restore();
    const nx = hx + 60, ny = hy - 30 - bill * 70;
    if (clank > .02) { glowAt(hx - 160, hy - 20, 200, `rgba(255,240,210,${.8 * clank})`); glowAt(hx + 200, hy - 120, 120, `rgba(255,240,210,${.6 * clank})`); }
    glowAt(nx, ny, 160, `rgba(190,255,190,${.25 * hit(t, 153.5, 3)})`);
    spotLight(1100, -500, 540, 1080, 420, 620, on);
    border(t, 1);
  }
  function plumeDraw(t, x, y, open) {
    for (let i = 0; i < 3; i++) { const dir = i % 2 ? 1 : -1, L = lerp(160, 420, open) * (1 - i * .18), a = -1.2 + i * .35 + Math.sin(t * 2 + i) * .05;
      vine(s, whip([x, y], [x + Math.cos(a) * L * .4, y + Math.sin(a) * L * .6], [x + Math.cos(a + .5) * L * .8, y + Math.sin(a + .5) * L], [x + Math.cos(a + 1.1) * L, y + Math.sin(a + .9) * L * .8], .8, dir, 30), 70 - i * 14, 14, [C.rose, C.blush, C.ruby][i]); }
  }
  // 156.1: close on stage right: the spot searches and catches Mr. Knickerbocker from behind just as he
  // slips out between the curtain and the wing; he is gone, the curtain rustles, the empty spot stays
  function knicker(t, lt, dur) {
    cam(kf(lt, [[0, 760], [dur, 820]]), kf(lt, [[0, 1110], [dur, 1090]]), kf(lt, [[0, 1.85], [dur, 2.05]], ease.inOut));
    s.fillStyle = HOUSE; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    backdrop(t, OX0, OX1, OTOP - 60, FLOOR - 140, .5); stageFloor(); propsWide(t);
    const px = kf(t, [[156.1, 420], [156.45, 640], [156.75, 760], [157.9, 930], [158.6, 900]], ease.inOut) + Math.sin(t * 2.3) * 12 * (t < 156.75 ? 1 : .3);
    const py = kf(t, [[156.1, 1420], [156.75, 1440], [157.9, 1400]], ease.inOut);
    spotPool(px, py - 120, 150, 230, .55);
    const k = ease.inOut(inv(156.3, 157.9, t));
    if (k < 1) knickerbocker(t, lerp(690, 1000, k), lerp(1470, 1400, k), lerp(330, 290, k), { ph: t * .8 });
    spotLight(1000, 120, px, py - 120, 150, 230, 1);
    proscenium(t, .5); curtains(t, 1, 0, hit(t, 157.6, 1.6) * (t > 157.6 ? 1 : 0)); valance();
    border(t, 1);
  }
  // 158.6: close and low: the empty chair turning in the spot, dust in the beam; the beam narrows
  function chairClose(t, lt, dur) {
    cam(540, kf(lt, [[0, 1180], [dur, 1120]]), kf(lt, [[0, 1.0], [dur, 1.12]], ease.inOut), Math.sin(t * .4) * .02);
    s.fillStyle = '#2e2a44'; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    for (let i = 0; i < 4; i++) shape(s, blobPts(-100 + i * 420, 1200, 280, 170, i + 31, .1, 40), i % 2 ? '#3d3456' : '#463a5c', C.umber, 16);
    shape(s, [[-800, 1330], [2000, 1330], [2000, 2600], [-800, 2600]], '#5a3f28', C.umber, 16);
    for (let i = 0; i < 9; i++) line([[-400 + i * 230, 1330], [-800 + i * 310, 2600]], C.umber, 9);
    const nar = kf(t, [[158.6, 1], [161.0, .82], [161.5, .7]]);
    spotPool(540, 1830, 470 * nar, 200 * nar, .7);
    // a long shadow of the chair on the boards (from the high spot)
    s.save(); s.globalAlpha = .45; shape(s, blobPts(400, 1880, 260, 60, 4, .1, 30, -.1), C.umber, null); s.restore();
    chair(540, 1420, 420, t * .55 + .4, 16);
    // the bowler, left on the boards by the chair leg
    const bx = 870, by = 1860;
    shape(s, [[bx - 120, by], [bx + 120, by], ...cub([bx + 120, by], [bx + 130, by + 30], [bx - 130, by + 30], [bx - 120, by], 12)], '#3a3038', C.umber, 12);
    shape(s, [[bx - 80, by], ...cub([bx - 80, by], [bx - 90, by - 150], [bx + 90, by - 150], [bx + 80, by], 16)], '#433742', C.umber, 14);
    shape(s, [[bx - 80, by - 30], [bx + 80, by - 30], [bx + 80, by - 6], [bx - 80, by - 6]], C.plum, C.umber, 8);
    motes(t, 1100, -300, 540, 1830, 50, nar);
    spotLight(1100, -300, 540, 1830, 470 * nar, 200 * nar, 1);
    border(t, 1);
  }
  // 161.5: wide: the curtains sweep shut, the spot goes out, a seam of light is left down the middle
  function closing(t, lt, dur) {
    cam(540, kf(lt, [[0, 1000], [dur, 940]]), kf(lt, [[0, 1.05], [2.0, 1.12], [dur, 1.5]], ease.inOut));
    s.fillStyle = HOUSE; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    const open = 1 - ease.inOut(inv(161.6, 163.5, t)), spot = 1 - clamp(inv(163.2, 163.6, t)), foot = 1 - .75 * ease.inOut(inv(163.8, 164.9, t)), seam = ease.out(inv(163.4, 164.6, t));
    backdrop(t, OX0, OX1, OTOP - 60, FLOOR - 140, .4); stageFloor(); propsWide(t);
    chair(540, 1340, 120, t * .55, 9);
    spotPool(540, 1360, 170, 120, spot);
    spotLight(1000, 120, 540, 1360, 170, 120, spot);
    proscenium(t, foot); curtains(t, open, seam); valance();
    border(t, 1);
  }
  chapter('c08', SEC.v3b, SEC.b2, [
    [SEC.v3b, house],
    [145.3, parting],
    [148.65, walker],
    [152.45, helmet],
    [156.1, knicker],
    [158.6, chairClose],
    [161.5, closing],
  ], { fx: PAINT });
})();
