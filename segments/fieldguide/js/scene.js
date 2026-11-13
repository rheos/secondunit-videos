// The segment's scene: a gardener waters a seedling and it grows into a sunflower taller than him.
// Paper scenes ('ill', the fieldguide look) cut hard on the beat against two blueprint plates ('sch'): the
// growth dial and the seed head. The stripe colour shifts per act, and in the last seconds the blueprint
// burns through the paper. Every cut sits on the 120 bpm grid in clock.js.
// Drawn only with the kit (engine/kit.js): fillP + PE/PP shapes, iP/iE/iline ink, hatch/shade, stip.
'use strict';
const BT = 0.5; // one beat, seconds

// ---------- cast ----------
// The gardener: box coat, ellipse head, stick legs, a flat hat, a deadpan face. Feet at (x, y); about 380 tall at s = 1.
// o: { legs: walk phase or null, look: -1..1 (head turn), up: 0..1 (looks up), can: 0..1 (tips the can), armUp }
function gardener(x, y, s, o = {}) {
  X.save(); X.translate(x, y); X.scale(s, s);
  const ph = o.legs ?? null, sw = ph === null ? 0 : Math.sin(ph) * .38;
  // stick legs and shoes
  for (const [hx, k] of [[-12, -1], [12, 1]]) {
    const fx = hx + Math.sin(k * sw) * 120;
    iline(hx, -150, fx, -8, C.ink, 4, 1, true, .8);
    fillP(PE(fx + 12, -6, 20, 8), C.dark); iE(fx + 12, -6, 20, 8, 0, C.ink, 2);
  }
  // back arm
  iline(-30, -262, -46, -172 + Math.sin(ph || 0) * 6, C.ink, 4, 1, true, .8);
  // box coat
  const cp = [[-38, -282], [38, -282], [50, -140], [-50, -140]], coat = PP(cp);
  fillP(coat, C.teal); shade(coat, 0, -210, 120, [18, -6], .9, 6); iP(dens(cp, 26, true), true, C.ink, 2.4);
  iline(0, -276, 0, -146, C.ink, 1.4, .7, false, .6);                         // the coat's front edge
  for (const by of [-240, -205, -170]) { fillP(PE(8, by, 4, 4), C.cream); iE(8, by, 4, 4, 0, C.ink, 1.2); }
  // neck and head (a plain ellipse), deadpan: two dots and a flat mouth
  const up = o.up || 0, lk = (o.look || 0) * 8, hy = -322 - up * 6;
  fillP(PR(-9, -298, 18, 20), C.wax);
  const head = PE(lk, hy, 32, 38, up * -.15); fillP(head, '#e7c9a2'); shade(head, lk, hy, 40, [-8, 6], .5, 5); iE(lk, hy, 32, 38, up * -.15, C.ink, 2.2);
  for (const ex of [-11, 11]) fillP(PE(lk + ex + 4, hy - 4 - up * 10, 3, 3.4), C.ink);
  iline(lk - 6, hy + 16 - up * 8, lk + 12, hy + 16 - up * 8, C.ink, 1.8, 1, false, .4);
  // flat hat
  const brim = PE(lk, hy - 30 - up * 4, 50, 9, up * -.15); fillP(brim, C.ochre); iE(lk, hy - 30 - up * 4, 50, 9, up * -.15, C.ink, 2);
  const crown = PP([[lk - 28, hy - 32], [lk + 28, hy - 32], [lk + 24, hy - 60], [lk - 24, hy - 60]]); fillP(crown, C.ochre);
  hatch(crown, lk, hy - 46, 40, .9, 6, C.ink, 1, .55, [10, 0]); iP(dens([[lk - 28, hy - 32], [lk - 24, hy - 60], [lk + 24, hy - 60], [lk + 28, hy - 32]], 20), false, C.ink, 2);
  // front arm and the watering can
  const tip = (o.can || 0) * .55, ax = 64, ay = -196 - (o.armUp || 0) * 40;
  iline(30, -262, ax, ay, C.ink, 4, 1, true, .8);
  if (o.can !== undefined) {
    X.save(); X.translate(ax + 6, ay + 8); X.rotate(tip);
    const body = PR(0, 0, 70, 54); fillP(body, C.sage); shade(body, 35, 27, 50, [12, -4], .8, 5); iBox(0, 0, 70, 54, C.ink, 2.2);
    iP([[70, 14], [118, -16]], false, C.ink, 5); iE(124, -20, 9, 6, -.5, C.ink, 2);                       // spout and rose
    iE(10, -2, 16, 22, 0, C.ink, 3, 1, true, .8, Math.PI, TAU);                                          // handle
    X.restore();
  }
  X.restore();
}

// The plant in its pot. Pot base at (x, y); the stem is h tall; bloom 0..1 opens the flower head.
function plant(x, y, h, o = {}) {
  const sway = Math.sin(TNOW * 1.6) * Math.min(18, h * .05), top = [x + sway, y - 70 - h];
  // pot
  const pp = [[x - 46, y - 74], [x + 46, y - 74], [x + 36, y], [x - 36, y]], pot = PP(pp);
  fillP(pot, C.brick); shade(pot, x, y - 37, 60, [14, -4], .9, 5); iP(dens(pp, 20, true), true, C.ink, 2.2);
  const rim = PR(x - 52, y - 88, 104, 16); fillP(rim, C.orange); iBox(x - 52, y - 88, 104, 16, C.ink, 2);
  // stem: a gentle S, drawn as a thick ink line with green inside
  const a = [x, y - 80], b = [x - 30, y - 80 - h * .35], c = [x + 30 + sway, y - 80 - h * .7], d = top;
  const pts = bzPts(a, b, c, d, 0, 1, 24);
  X.beginPath(); wP(pts, false, .6); stroke(C.ink, 11, 1); X.beginPath(); wP(pts, false, .4); stroke(C.sage, 7, 1);
  // leaves along it, pairs, each a filled ellipse with a hatched underside and a midrib
  const nl = Math.min(6, Math.floor(h / 70));
  for (let i = 0; i < nl; i++) {
    const u = (i + 1) / (nl + 1), [lx, ly] = bz(a, b, c, d, u), side = i % 2 ? 1 : -1, L = 34 + 26 * Math.min(1, h / 400);
    const cx = lx + side * L * .9, cy = ly - 6, rot = side * -.45, leaf = PE(cx, cy, L, L * .38, rot);
    fillP(leaf, C.sage); hatch(leaf, cx, cy, L, rot + 1.2, 5, C.ink, .9, .5, [0, -6]); iE(cx, cy, L, L * .38, rot, C.ink, 2);
    iline(lx, ly, cx + side * L * .7, cy - side * L * .25 * -1, C.ink, 1.2, .6, false, .4);
  }
  // the flower head
  const bl = o.bloom || 0;
  if (bl > 0) {
    const r = 26 + 54 * bl, np = 16;
    for (let i = 0; i < np; i++) {
      const t = i / np * TAU + .1, pr = r * (.9 + .5 * bl), px = top[0] + Math.cos(t) * pr, py = top[1] + Math.sin(t) * pr;
      const pet = PE(px, py, r * .55 * bl + 4, r * .2 + 3, t); fillP(pet, C.ochre); iE(px, py, r * .55 * bl + 4, r * .2 + 3, t, C.ink, 1.8);
    }
    const disc = PE(top[0], top[1], r, r); fillP(disc, C.dark); stip(disc, top[0], top[1], r, r * r * .12, C.wax, .8, 2.2);
    iE(top[0], top[1], r, r, 0, C.ink, 2.4);
  } else {
    const bud = PE(top[0], top[1], 12, 16); fillP(bud, C.sage); iE(top[0], top[1], 12, 16, 0, C.ink, 2);
  }
  return top;
}

// water from the can's rose: short falling dashes
function water(x, y, T, n = 14) {
  X.beginPath(); const r = M32(31);
  for (let i = 0; i < n; i++) { const x0 = x + r() * 50 - 25, sp = 300 + r() * 200, yy = y + ((r() * 160 + T * sp) % 160); X.moveTo(x0, yy); X.lineTo(x0 - 4, yy + 16); }
  stroke(C.teal, 2, .85);
}

// ---------- the blueprint plates ----------
function plateGrowth(p, lt) {
  schBG(); schFrame('01', 'GROWTH', 'STEM HEIGHT, DAY 1 TO DAY 40');
  const cx = 760, cy = 600, rr = 260, a0 = Math.PI * .8, a1 = Math.PI * 2.2;
  gc(cx, cy, rr, C.lav, .55, 1.4, null, a0, a1); ticks(cx, cy, rr, 40, 10, C.lav, .7, 1, 5, a0, a1);
  for (let i = 0; i <= 8; i++) { const t = a0 + (a1 - a0) * i / 8; lab(cx + Math.cos(t) * (rr + 46), cy + Math.sin(t) * (rr + 46) + 5, String(i * 50), C.lav, .7, 13, 'center'); }
  gc(cx, cy, rr * .62, C.cyan, .3, 1, [3, 6]);
  const v = eo(seg(p, .1, .85)), na = a0 + (a1 - a0) * (.02 + .9 * v);
  gl(cx, cy, cx + Math.cos(na) * rr * .92, cy + Math.sin(na) * rr * .92, C.mag, .95, 3);
  gc(cx, cy, 10, C.mag, .9, 2);
  lab(cx, cy + 120, String(Math.round(2 + 380 * v)).padStart(3, '0') + ' CM', C.white, .95, 34, 'center');
  // the stem as a measured line, drawing itself in
  const sx = 1340, sy = 860, top = sy - 520 * v;
  gl(sx, sy, sx, top, C.cyan, .9, 2); bracket(sx + 60, sy, sx + 60, top, C.lav, .8, 'H');
  for (let i = 0; i < 6; i++) { const y = sy - i * 100; if (y < top) break; gl(sx - 30, y, sx, y, C.lav, .6); lab(sx - 40, y + 4, 'D' + i * 8, C.lav, .6, 11, 'right'); }
  star(sx, top, 4, C.mag, .9);
}
function plateSeeds(p, lt) {
  schBG(); schFrame('02', 'SEED HEAD', 'FLORETS IN A HEX PACK, OPENING FROM THE RIM');
  const cx = 960, cy = 560, r = 34, rings = 6, shown = Math.floor(seg(p, 0, .7) * 127);
  let k = 0;
  hexGrid(cx, cy, r, rings, (x, y, q, s, ring) => {
    k++; if (k > shown) return;
    const pts = hexPts(x, y, r * .95); X.beginPath(); pts.forEach((pt, i) => (i ? X.lineTo(pt[0], pt[1]) : X.moveTo(pt[0], pt[1]))); X.closePath();
    const open = ring >= rings - Math.floor(seg(p, .45, 1) * 4);
    stroke(open ? C.mag : C.lav, open ? 1.6 : 1, open ? .95 : .55);
    if (!open) stip(null, x, y, r * .5, 14, C.lav, .5, 1.2);
  });
  gc(cx, cy, r * 1.75 * rings, C.cyan, .35, 1, [2, 8]); ticks(cx, cy, r * 1.75 * rings, 120, 6, C.cyan, .4, 1, 10);
  bracket(cx - r * 1.73 * rings, cy + r * 1.6 * rings + 40, cx + r * 1.73 * rings, cy + r * 1.6 * rings + 40, C.lav, .8, '0.36 M');
}

// the blueprint burning through the paper: a ragged hole that grows from a point, with a scorched rim
function burnThrough(cx, cy, rad) {
  if (rad <= 0) return;
  const r = M32(DSEED * 3 + 1), n = 48, pts = [];
  for (let i = 0; i < n; i++) { const t = i / n * TAU, k = 1 + (r() - .5) * .28 + Math.sin(t * 5 + 1) * .06; pts.push([cx + Math.cos(t) * rad * k, cy + Math.sin(t) * rad * k]); }
  const hole = PP(pts);
  X.save(); X.clip(hole); schBG(); lattice(cx, cy, 40, 8, C.lav, .5); gc(cx, cy, rad * .7, C.mag, .8, 2, [4, 8]); lab(cx, cy + 6, 'FIG. 03', C.white, .9, 18, 'center'); X.restore();
  iP(dens(pts.concat([pts[0]]), 14), true, C.dark, 7, .9, true, 1.4);
  iP(dens(pts.map(([x, y]) => [cx + (x - cx) * 1.06, cy + (y - cy) * 1.06]).concat([[cx + (pts[0][0] - cx) * 1.06, cy + (pts[0][1] - cy) * 1.06]]), 14), true, C.orange, 3, .55, false, 1.6);
}

// ---------- the shots ----------
function buildShots() {
  return [
    // act 1: sage stripes, he walks in and waters a seedling
    { t0: 0, t1: 8 * BT, mode: 'ill', key: 'water', draw: (p, lt) => {
      stripes(C.paper, '#dfe3c4', 150, -.62, 0, C.sage);
      const walk = seg(lt, 0, 2.2), gx = lerp(220, 760, eio(walk));
      plant(1000, 960, 40, {});
      const tipping = seg(lt, 2.4, 2.8);
      gardener(gx, 980, 1.25, { legs: walk < 1 ? lt * 7 : null, can: tipping, look: .4 });
      if (lt > 2.8) water(gx + 232, 980 - 175, lt - 2.8);   // under the can's rose once it has tipped
    } },
    { t0: 8 * BT, t1: 11 * BT, mode: 'sch', key: 'plate-growth', draw: plateGrowth },
    // act 2: ochre stripes, the plant is up past his head; he looks up, deadpan
    { t0: 11 * BT, t1: 18 * BT, mode: 'ill', key: 'tall', draw: (p, lt) => {
      stripes(C.paper, '#ecd3a0', 150, -.62, 0, C.ochre);
      const h = lerp(330, 470, eo(p));
      plant(1080, 980, h, {});
      gardener(780, 990, 1.25, { up: eo(seg(lt, .6, 1.4)), look: .6, can: 0 });
      lab(1580, 120, 'DAY 21', C.ink, .7, 22, 'center');
    } },
    { t0: 18 * BT, t1: 21 * BT, mode: 'sch', key: 'plate-seeds', draw: plateSeeds },
    // act 3: rose stripes, the flower opens over him; the blueprint burns through at the end
    { t0: 21 * BT, t1: 30 * BT, mode: 'ill', key: 'bloom', draw: (p, lt) => {
      stripes(C.paper, '#ecc8bd', 150, -.62, 0, C.rose);
      const top = plant(1060, 990, 640, { bloom: eo(seg(lt, .2, 1.6)) });
      gardener(760, 1000, .9, { up: 1, look: .7, can: 0 });
      burnThrough(380, 330, 380 * Math.pow(seg(lt, 2.3, 4.5), 1.4));
    } },
  ];
}
