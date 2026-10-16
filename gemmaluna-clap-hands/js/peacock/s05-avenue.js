// 89.7-111.8 VERSE 3: one avenue at night, tracking along it. Opens on the moon (the hatch's moon), tilts down.
// "a hundred bad dreams" (90.2-95.2) dragonflies and moths pour out of three dark windows and swarm;
// "Harlem with a pistol in his jeans" (95.2-99.5) jeans on a washing line between balconies, a grip in the
// pocket (an object only); "fifty dollar bill inside a paladin's hat" (99.5-103.3) a knight's helmet on a
// railing post, a plain note tucked in it; "nobody's sure where Mr. Knickerbocker's at" (103.3-108.5) a door
// ajar, an empty bowler and a cane on the steps, wet footprints leading off; then tilt up to the clock tower
// and push into the clock face (bridge 1 opens filling the frame with it).
// When the clock's hands turn. Shared with the bridge and chorus 3 (they meet at twelve on CLAPS[8]).
function clockAngles(t) {
  const k = CLAPS[8], t0 = 115.4, t1 = k - 1.0, u = eio(clamp((t - t0) / (t1 - t0)));
  const beats = (window.FEAT && FEAT.beats) || [];
  let tick = 0; for (const b of beats) { if (b < 108.0 || b > t0) continue; if (b > t) break; tick += eo(clamp((t - b) / .12)); }
  return { m: lerp(-TAU / 6 + tick * .05, TAU * 12 - .6, u), h: lerp(-TAU / 12 + tick * .006, -TAU * 2 + .6, u) };
}
const TOWER = { x: 4900, cy: -1100, r: 300 };
(() => {
  const MOON = { x: 700, y: -300, r: 90 };
  const SEGS = (() => { const out = []; let x = -260; let i = 0; while (x < 5500) { const w = 380 + hash(i * 7.1) * 160; out.push({ x, w, top: 160 + hash(i * 3.3) * 260, i }); x += w; i++; } return out; })();
  const DARK = [[300, 640], [560, 480], [800, 700]];       // the windows the bad dreams pour out of
  const BUGS = [...Array(40).keys()].map((i) => ({ b: 90.5 + i * .11, o: DARK[i % 3], kind: i % 3 === 1 ? 'moth' : 'fly', sp: 120 + hash(i * 2.3) * 200, up: 40 + hash(i * 5.1) * 120, ph: hash(i) * 6, s: .45 + hash(i * 9.7) * .35, dir: hash(i * 4.4) > .35 ? 1 : -1 }));
  function bugAt(B, t) {
    const τ = t - B.b, x = B.o[0] + B.dir * τ * B.sp + 90 * Math.sin(τ * 2.1 + B.ph), y = B.o[1] - τ * B.up + 70 * Math.sin(τ * 3.3 + B.ph * 1.7);
    return [x, y];
  }
  // draft 3 (the audit: the avenue was grids of identical arches): Horta and Guimard fronts. Each house has its
  // own organic arch (horseshoe, ogee, round), lit windows hold Tiffany glass (a leaded iris), alternate floors
  // get whiplash balconies, a mosaic band runs under each cornice, the shopfronts get Guimard iron springers
  function ogeePath(x, y, w, h) { const p = new Path2D(); p.moveTo(x, y + h); p.lineTo(x, y + w * .7); p.bezierCurveTo(x, y + w * .15, x + w * .48, y + w * .4, x + w / 2, y); p.bezierCurveTo(x + w * .52, y + w * .4, x + w, y + w * .15, x + w, y + w * .7); p.lineTo(x + w, y + h); p.closePath(); return p; }
  function winPath(kind, x, y, w, h) {
    if (kind === 0) { const p = new Path2D(); p.addPath(shoePath(600, 825), new DOMMatrix().translate(x, y).scale(w / 600, h / 825)); return p; }
    return kind === 1 ? ogeePath(x, y, w, h) : archPath(x, y, w, h);
  }
  function facade(S, t) {
    const { x, w, top, i } = S, col = i % 3 === 1 ? C.plumDeep : C.plum, kind = i % 3;
    if (x > TOWER.x - 300 && x < TOWER.x + 300) return;
    cut(cutRect(x, top, w + 4, 1700 - top, i * 13), col, { sh: .9, lift: .3 });
    cut(cutRect(x - 6, top - 6, w + 16, 22, i * 13 + 1), C.gold, { sh: .5 });
    for (let j = 0; j < Math.floor(w / 24); j++) { g.fillStyle = [C.gold, C.teal, C.plumLight, C.goldPale][(j + i) % 4]; g.fillRect(x + 6 + j * 24, top + 24, 16, 16); }
    const cols = Math.max(2, Math.floor(w / 150));
    for (let r = 0; top + 120 + r * 270 < 1200; r++) for (let c = 0; c < cols; c++) {
      const wx = x + (c + .5) * w / cols - 45, wy = top + 120 + r * 270;
      const dark = DARK.some(([dx, dy]) => Math.abs(dx - (wx + 45)) < 80 && Math.abs(dy - (wy + 80)) < 140);
      const lit = !dark && hash(i * 31 + r * 7 + c) > .66, wp = winPath(kind, wx, wy, 90, 170);
      cut(wp, lit ? C.goldPale : C.tealInk, { sh: .3, grain: .25 });
      if (lit) { glow(wx + 45, wy + 90, 140, '250,215,140', .25); g.save(); g.clip(wp); g.strokeStyle = C.goldDeep; g.lineWidth = 3; g.globalAlpha *= .6; g.beginPath(); g.moveTo(wx + 45, wy + 170); g.quadraticCurveTo(wx + 20, wy + 110, wx + 45, wy + 70); g.moveTo(wx, wy + 120); g.lineTo(wx + 90, wy + 100); g.stroke(); g.restore(); borderBloom(wx + 45, wy + 70, 18, 'iris', 1, 1); }
      g.save(); g.lineWidth = 8; g.strokeStyle = C.goldDeep; g.stroke(wp); g.restore();
      if (r % 2 === 1) tendril([[wx - 14, wy + 176], [wx + 20, wy + 196], [wx + 45, wy + 200], [wx + 70, wy + 196], [wx + 104, wy + 176]], 8, C.gold, { sh: .3, grain: 0 });
    }
    // the shopfront at street level, in a Guimard iron frame
    const sp = winPath(kind, x + w * .15, 1300, w * .7, 340);
    cut(sp, hash(i * 2.9) > .5 ? C.goldPale : C.tealInk, { sh: .3, grain: .25 });
    g.save(); g.lineWidth = 14; g.strokeStyle = C.gold; g.stroke(sp); g.restore();
    for (const sx of [0, 1]) { const ax = x + w * (.15 + .7 * sx); tendril(whipPts([ax, 1640], [ax + (sx ? 30 : -30), 1500], [ax + (sx ? -40 : 40), 1430], [ax + (sx ? -10 : 10), 1390], 16, sx ? 1 : -1), 9, C.tealDeep, { sh: .3, grain: 0 }); }
  }
  function balcony(x, y, w) {
    cut(rect(x, y, w, 18), C.cream, { sh: .8 });
    for (let i = 0; i < 3; i++) tendril(whipPts([x + 20 + i * (w - 40) / 2, y], [x + i * (w - 40) / 2, y - 60], [x + 40 + i * (w - 40) / 2, y - 90], [x + 60 + i * (w - 40) / 2, y - 60], 16, 1), 7, C.gold, { sh: .3 });
    cut(rect(x, y - 110, w, 8), C.gold, { sh: .4 });
  }
  SHOT(89.7, 111.8, 'avenue', (t, k, d) => {
    const out = eio(clamp((t - 89.7) / 1.9));
    const z0 = 3.73, sx0 = MOON.x - 168 / z0, sy0 = MOON.y + 112 / z0;
    let cx = kf3(t, [[91.6, 540], [94.4, 540], [95.95, 1600], [99.0, 1600], [100.6, 2880], [102.6, 2880], [104.2, 3990], [106.9, 3990], [108.7, TOWER.x]]);
    let cy = kf3(t, [[91.6, 1080], [94.4, 1080], [95.95, 860], [99.0, 860], [100.6, 1380], [102.6, 1380], [104.2, 1440], [106.9, 1440], [108.3, 1300], [111.0, TOWER.cy]]);
    let z = kf3(t, [[91.6, 1.0], [94.4, 1.0], [95.95, 1.4], [99.0, 1.4], [100.6, 1.55], [102.6, 1.55], [104.2, 1.35], [106.9, 1.35], [108.7, 1.0], [110.4, 1.0], [111.8, 1.8]]);
    // punch-ins on the key words: the grip on "pistol", the note on "bill", the footprints on the missing man
    for (const [t0, t1, px, py, pz] of [[97.8, 98.9, 1767, 822, 2.3], [100.45, 102.3, 2830, 1392, 2.4], [105.9, 106.8, 4060, 1660, 1.9]]) {
      const pk = eio(clamp((t - t0) / .45)) * (1 - eio(clamp((t - t1) / .4)));
      cx = lerp(cx, px, pk); cy = lerp(cy, py, pk); z = lerp(z, pz, pk);
    }
    if (t < 91.6) { cx = lerp(sx0, 540, out); cy = lerp(sy0, 1080, out); z = Math.exp(lerp(Math.log(z0), 0, out)); }
    g.save(); cam(cx, cy, z);
    sheet(C.tealInk);
    // sky: the moon, cloud cards, a few stars
    cut(circle(MOON.x, MOON.y, MOON.r), C.goldPale, { sh: .4, grain: .3 });
    for (let i = 0; i < 9; i++) cut(cloud(-200 + i * 700 + Math.sin(t * .2 + i) * 40, -500 + (i % 3) * 140, 560, 130, i + 40), i % 2 ? C.tealDeep : C.plumDeep, { sh: .7, lift: .3, alpha: .9 * ss(89.8, 90.5, t) });
    for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 130 + hash(i) * 120; g.save(); g.globalAlpha *= 1 - ss(90.0, 91.0, t); g.fillStyle = C.goldPale; g.fill(star4(MOON.x + Math.cos(a) * r, MOON.y + Math.sin(a) * r * .8, 8 + hash(i) * 7)); g.restore(); }
    // the clock tower (behind the street) at the far end
    cut(poly([[TOWER.x - 260, -1480], [TOWER.x, -1900], [TOWER.x + 260, -1480]]), C.plumDeep, { sh: .8, lift: .3 });
    cut(circle(TOWER.x, -1910, 18), C.gold, { sh: .4 });
    cut(cutRect(TOWER.x - 340, -1500, 680, 820, 301), C.plum, { sh: 1, lift: .4 });
    cut(cutRect(TOWER.x - 250, -700, 500, 2400, 302), C.plum, { sh: .9, lift: .3 });
    for (const y of [-1500, -700, -200, 400, 1000]) cut(rect(TOWER.x - 340, y - 10, 680, 20), C.gold, { sh: .4 });
    for (let r = 0; r < 4; r++) { cut(archPath(TOWER.x - 60, -560 + r * 520, 120, 260), r % 2 ? C.goldPale : C.tealInk, { sh: .3 }); archFrame(TOWER.x - 60, -560 + r * 520, 120, 260, 10, C.goldDeep); }
    const A = clockAngles(t);
    clockFace(TOWER.x, TOWER.cy, TOWER.r, t, 0);
    clockHand(TOWER.x, TOWER.cy, A.h, TOWER.r * .45, TOWER.r * .12);
    clockHand(TOWER.x, TOWER.cy, A.m, TOWER.r * .62, TOWER.r * .12);
    cut(circle(TOWER.x, TOWER.cy, 18), C.gold, { sh: .5 });
    // the street of façades
    for (const S of SEGS) facade(S, t);
    // balconies and the washing line: shirt, the jeans, a pair of socks
    balcony(1380, 820, 200); balcony(1760, 820, 200);
    const lineY = (x) => 700 + 50 * Math.sin(Math.PI * (x - 1480) / 380);
    g.save(); g.strokeStyle = C.creamDeep; g.lineWidth = 4; g.beginPath(); for (let x = 1480; x <= 1860; x += 20) g[x === 1480 ? 'moveTo' : 'lineTo'](x, lineY(x)); g.stroke(); g.restore();
    cut(archPath(1655, 760, 170, 300), C.goldPale, { sh: .3, grain: .3 }); glow(1740, 900, 200, '250,215,140', .3);
    const sw = Math.sin(t * 1.6) * .05;
    g.save(); g.translate(1610, lineY(1610)); g.rotate(sw); cut(blob([[-60, 0], [60, 0], [80, 40], [56, 60], [50, 200], [-50, 200], [-56, 60], [-80, 40]], .3), C.cream, { sh: .8, lift: .3 }); g.restore();
    g.save(); g.translate(1730, lineY(1730)); jeans(.75, sw * 1.2); g.restore();
    for (const sx of [1815, 1840]) { g.save(); g.translate(sx, lineY(sx)); g.rotate(sw * 1.4); cut(blob([[-12, 0], [12, 0], [14, 80], [40, 100], [36, 116], [-12, 108]], .4), C.goldPale, { sh: .5 }); g.restore(); }
    // the stoop railing and the paladin's helmet on its post
    tendril(whipPts([2560, 1620], [2600, 1480], [2700, 1440], [2760, 1460], 0), 12, C.gold, { sh: .5 });
    for (let i = 0; i < 4; i++) tendril(whipPts([2600 + i * 60, 1620], [2580 + i * 60, 1560], [2640 + i * 60, 1520], [2610 + i * 60, 1490], 14, 1), 7, C.goldDeep, { sh: .3 });
    cut(rect(2750, 1460, 26, 180), C.gold, { sh: .7 });
    cut(rrect(2640, 1180, 250, 300, [100, 100, 0, 0]), C.tealInk, { sh: .5 }); g.save(); g.lineWidth = 10; g.strokeStyle = C.gold; g.stroke(rrect(2640, 1180, 250, 300, [100, 100, 0, 0])); g.restore();
    g.save(); g.translate(2763, 1386); helmet(.62, ss(100.2, 100.7, t)); g.restore();
    // the door ajar, the steps, the empty bowler and cane, wet footprints leading off toward the tower
    cut(archPath(3770, 1190, 170, 420), C.goldPale, { sh: 0, grain: .3 });
    glow(3870, 1450, 320, '250,215,140', .4);
    cut(poly([[3770, 1610], [3770, 1240], [3822, 1262], [3822, 1626]]), C.plumDeep, { sh: .9, lift: .4 }); // the door leaf, swung in
    cut(circle(3810, 1440, 7), C.gold, { sh: .3 });
    archFrame(3770, 1190, 170, 420, 16, C.gold);
    g.save(); g.globalAlpha *= .35; cut(poly([[3830, 1610], [3940, 1610], [4120, 1700], [3860, 1700]]), C.goldPale, { sh: 0, grain: .2 }); g.restore();
    for (let i = 0; i < 3; i++) cut(rect(3700 - i * 30, 1610 + i * 22, 310 + i * 60, 24), C.cream, { sh: .7 });
    g.save(); g.translate(3930, 1560); g.rotate(-1.25); cane(160); g.restore();
    // pavement and the wet street
    cut(cutRect(-300, 1640, 5800, 60, 303), C.creamDeep, { sh: .7 });
    cut(cutRect(-300, 1700, 5800, 600, 304), C.tealDeep, { sh: .5 });
    for (let i = 0; i < 6; i++) cut(ribbon(-300, 5500, 1740 + i * 45, 6, i * 1.7 + t * .4, 5), C.teal, { sh: 0, grain: .2, alpha: .6 });
    const seen = ss(104.4, 106.4, t);
    for (let i = 0; i < 12; i++) { const fx = 4000 + i * 70, fy = 1712 + (i % 2) * 20; if ((i + 1) / 12 > seen) break; cut(ellipse(fx, fy - 40, 22, 10), C.plumDeep, { sh: 0, grain: .3, alpha: .7 }); cut(ellipse(fx + 24, fy - 40, 9, 8), C.plumDeep, { sh: 0, grain: .3, alpha: .7 }); cut(ellipse(fx - 4, fy - 43, 8, 3), C.cream, { sh: 0, grain: 0, alpha: .5 }); }
    for (const lx of [1100, 2200, 3300, 4400]) guimard(lx, 1650, 560, lx % 2200 ? -1 : 1, .9 + .1 * Math.sin(t * 13 + lx), Math.sin(t + lx) * 4);
    // Mark Von Ulrich (guest director): one empty bowler travels the street on different heads, hopping ahead
    // of the camera on each pan: pegged on the washing line, then on the paladin's helmet, then alone on the steps.
    {
      const P1 = [1515, lineY(1515) + 30], P2 = [2763, 1222], P3 = [3820, 1606];
      const hop = (a, b, t0, t1) => { const u = eio(clamp((t - t0) / (t1 - t0))); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - Math.sin(u * Math.PI) * 340, u]; };
      let x, y, rot = 0, sc = .62;
      if (t < 99.0) { [x, y] = P1; y += 40; rot = sw * 2; }
      else if (t < 100.6) { let u; [x, y, u] = hop([P1[0], P1[1] + 40], [P2[0], P2[1] + 36], 99.0, 100.6); rot = lerp(0, TAU * 2, u); }
      else if (t < 102.6) { [x, y] = P2; y += 36; rot = -.12 + Math.sin(t * 2) * .03; sc = .56; }
      else if (t < 104.2) { let u; [x, y, u] = hop([P2[0], P2[1] + 36], P3, 102.6, 104.2); rot = lerp(0, -TAU, u); }
      else { [x, y] = P3; }
      if (t < 99.0) { cut(rect(P1[0] - 5, lineY(P1[0]) - 10, 10, 40), C.creamDeep, { sh: .3 }); } // its peg
      for (const [a, b, t0, t1] of [[P1, P2, 99.0, 100.6], [P2, P3, 102.6, 104.2]]) if (t > t0 && t < t1 + .6) { g.save(); g.globalAlpha *= .5 * (1 - ss(t1, t1 + .6, t)); g.fillStyle = C.goldPale; for (let q = 0; q < 24; q++) { const u = q / 24; if (u > (t - t0) / (t1 - t0)) break; g.fill(circle(lerp(a[0], b[0], eio(u)), lerp(a[1], b[1], eio(u)) - Math.sin(eio(u) * Math.PI) * 340, 5)); } g.restore(); }
      g.save(); g.translate(x, y); g.rotate(rot); bowler(sc); g.restore();
    }
    // the bad dreams
    for (const B of BUGS) {
      if (t < B.b) continue;
      const [x, y] = bugAt(B, t), [x2, y2] = bugAt(B, t + .05), a = Math.atan2(y2 - y, x2 - x);
      if (B.kind === 'moth') moth(x, y, B.s * 1.1, a, t * 26 + B.ph); else dragonfly(x, y, B.s, a, t * 34 + B.ph, B.i % 2 ? C.tealLight : C.plumLight);
    }
    g.restore();
    rain(t, 40, 61, .3, .12);
  }, { smooth: true }); // the pans are fast: on twos they judder
})();
