// Props and cast, each drawable in ILL (o.sch falsy) or SCH (o.sch true, linework + stipple in o.col).
// Local units: the traveller stands ~360 tall at s=1, feet at (x,y).
'use strict';

// sch-aware fill/outline/shade helpers, local to a prop's scale k = 1/s
function sty(o, k) {
  const sch = !!o.sch, col = o.col || C.lav;
  return {
    sch, col, INK: sch ? col : C.ink,
    F: (p, c, a = 1) => fillP(p, sch ? C.navy : c, sch ? .93 : a),
    OL: (cx, cy, rx, ry, r = 0, w = 2.4, a = 1) => iE(cx, cy, rx, ry, r, sch ? col : C.ink, (sch ? 1.2 : w) * k, sch ? .9 * a : a, !sch, .9 * k),
    OP: (pts, closed = true, w = 2.4, a = 1) => iP(pts, closed, sch ? col : C.ink, (sch ? 1.2 : w) * k, sch ? .9 * a : a, !sch, .9 * k),
    SH: (p, cx, cy, rad, cr, ang = .8, sp = 5, dens2 = .06) => {
      if (sch) { const L = Math.hypot(cr[0], cr[1]) || 1; stip(p, cx, cy, rad, rad * rad * dens2, col, .85, 1.5 * k, [-cr[0] / L, -cr[1] / L], .45); }
      else { hatch(p, cx, cy, rad, ang, sp * k, C.ink, .95 * k, .7, cr); hatch(p, cx, cy, rad, ang + 1.25, sp * 1.35 * k, C.ink, .85 * k, .5, [cr[0] * 1.9, cr[1] * 1.9]); }
    },
  };
}
function limb(pts, w, o, k, col) { // a tapered limb: thick ink stroke + inner colour
  const S = sty(o, k);
  X.beginPath(); wP(pts, false, .6 * k); stroke(S.INK, (w + 3.2) * k, 1);
  if (!S.sch) { X.beginPath(); wP(pts, false, .4 * k); stroke(col, w * k, 1); X.beginPath(); wP(pts.map(([a, b]) => [a + 2 * k, b + 1.5 * k]), false, .5 * k); stroke(C.ink, 1 * k, .35); }
  else { X.beginPath(); wP(pts, false, .4 * k); stroke(C.navy, w * k, .95); }
}
// Two-bone IK: keep the hand where the pose puts it and choose the elbow that bends naturally (down and outward),
// so a raised hand never gets a forearm hanging from an elbow above it.
function ik(sx, sy, hx, hy, side, L1 = 70, L2 = 66) {
  let dx = hx - sx, dy = hy - sy, d = Math.hypot(dx, dy); const dmax = L1 + L2 - .5;
  if (d > dmax) { hx = sx + dx / d * dmax; hy = sy + dy / d * dmax; dx = hx - sx; dy = hy - sy; d = dmax; }
  d = Math.max(d, Math.abs(L1 - L2) + 1);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a)), mx = sx + dx / d * a, my = sy + dy / d * a, nx = -dy / d, ny = dx / d;
  const e1 = [mx + nx * h, my + ny * h], e2 = [mx - nx * h, my - ny * h], sc = (e) => e[1] + .35 * side * e[0];
  return [[sx, sy], sc(e1) >= sc(e2) ? e1 : e2, [hx, hy]];
}
const armIK = (sx, sy, a1, a2, side, target) => { const fk = arm(sx, sy, a1, a2); const hnd = target || fk[2]; return ik(sx, sy, hnd[0], hnd[1], side); };
const arm = (sx, sy, a1, a2, L1 = 70, L2 = 66) => { const ex = sx + Math.sin(a1) * L1, ey = sy + Math.cos(a1) * L1; return [[sx, sy], [ex, ey], [ex + Math.sin(a1 + a2) * L2, ey + Math.cos(a1 + a2) * L2]]; };

// The traveller: a deadpan everyman in a fedora and long coat. NOT Bob's likeness.
// o: {sch,col, armL:[a1,a2], armR:[a1,a2], legs:phase or null, look:-1..1, hat:true, case:true|false, sit, mouth}
function traveller(x, y, s, o = {}) {
  const k = 1 / s, S = sty(o, k);
  X.save(); X.translate(x, y); X.scale(o.flip ? -s : s, s);
  const ph = o.legs ?? null, sw = ph === null ? 0 : Math.sin(ph) * .42;
  const coat = S.sch ? C.navy : (o.coat || C.teal), trouser = o.trouser || '#4a3b33';
  // legs (seated: thighs forward)
  if (o.sit) { limb([[-14, -150], [52, -150], [56, -70], [60, -2]], 15, o, k, trouser); limb([[10, -150], [72, -146], [80, -70], [84, -2]], 15, o, k, trouser); }
  else {
    limb([[-12, -150], [-12 + Math.sin(-sw) * 70, -78], [-12 + Math.sin(-sw) * 150, -4]], 15, o, k, trouser);
    limb([[12, -150], [12 + Math.sin(sw) * 70, -78], [12 + Math.sin(sw) * 150, -4]], 15, o, k, trouser);
  }
  // shoes
  const fx1 = o.sit ? 60 : -12 + Math.sin(-sw) * 150, fx2 = o.sit ? 84 : 12 + Math.sin(sw) * 150;
  for (const fx of [fx1, fx2]) { const sp = PE(fx + 12, -6, 22, 9); S.F(sp, '#2b1d14'); S.OL(fx + 12, -6, 22, 9, 0, 2); }
  // back arm
  const aL = o.armL || [.15, -.2]; limb(armIK(-26, -262, aL[0], aL[1], -1), 13, o, k, o.sleeve || '#356c69');
  // coat
  const cp = [[-34, -276], [34, -276], [46, -130], [50, -118], [-50, -118], [-46, -130]];
  const cpath = PP(cp); S.F(cpath, coat); S.SH(cpath, 0, -200, 110, [16, -6], .9, 5.5); S.OP(dens(cp, 26, true));
  // lapel + buttons + belt
  X.beginPath(); wP([[0, -272], [-12, -236], [0, -186], [0, -124]], false, .7 * k); stroke(S.INK, 1.6 * k, .9);
  X.beginPath(); wP([[-40, -180], [42, -180]], false, .7 * k); stroke(S.INK, 2.4 * k, .9);
  for (const by of [-220, -200, -160]) { const b = PE(6, by, 3.4, 3.4); fillP(b, S.INK, .9); }
  // head
  const lk = (o.look || 0) * 6, hp = PE(lk, -306, 26, 31);
  S.F(hp, '#efd9b9'); S.SH(hp, lk, -306, 34, [8, -6], .6, 4.6); S.OL(lk, -306, 26, 31, 0, 2.2);
  // face: dot eyes, nose line, small mouth (deadpan)
  for (const ex of [-9, 9]) fillP(PE(lk + ex + lk * .4, -310, 2.4, 3), S.INK, 1);
  X.beginPath(); wP([[lk + 3 + lk * .6, -306], [lk + 6 + lk * .8, -294], [lk + 1, -292]], false, .3 * k); stroke(S.INK, 1.4 * k, .8);
  const mo = o.mouth || 0; if (mo > .05) { const m = PE(lk, -283, 5, 2 + mo * 5); fillP(m, S.INK, .9); } else { X.beginPath(); wP([[lk - 6, -284], [lk + 6, -284]], false, .4 * k); stroke(S.INK, 1.5 * k, .9); }
  // hat (fedora)
  if (o.hat !== false) {
    const hb = PE(lk, -330, 46, 8); S.F(hb, '#3d2a1f'); S.OL(lk, -330, 46, 8, 0, 2);
    const cr = [[lk - 26, -330], [lk - 22, -364], [lk, -358], [lk + 22, -364], [lk + 26, -330]]; const crp = PP(cr); S.F(crp, '#4b3426'); S.SH(crp, lk, -345, 34, [6, -4], .7, 4); S.OP(cr);
    X.beginPath(); wP([[lk - 25, -338], [lk + 25, -338]], false, .4 * k); stroke(S.sch ? S.col : C.ochre, 4 * k, .9);
  }
  // front arm + suitcase
  const aR = o.armR || [-.12, .25];
  // o.phone: 'handset' (a payphone receiver) or 'mobile' held against his right ear, his hand on it
  const ear = o.phone ? [lk + 36, -300] : null;
  const ap = armIK(26, -262, aR[0], aR[1], 1, ear ? [ear[0] + 6, ear[1] + 8] : null); limb(ap, 13, o, k, o.sleeve || '#3a7a76');
  if (o.phone === 'handset') { const top = [lk + 36, -328], bot = [lk + 30, -272]; X.beginPath(); X.moveTo(top[0], top[1]); X.lineTo(bot[0], bot[1]); stroke(S.INK, 11 * k / k, 1); for (const [cx, cy] of [top, bot]) { const cup = PE(cx + 4, cy, 9, 7, .2); S.F(cup, '#2b2420'); S.OL(cx + 4, cy, 9, 7, .2, 1.8); } }
  if (o.phone === 'mobile') { const mp = PP([[lk + 26, -326], [lk + 44, -324], [lk + 42, -284], [lk + 24, -286]]); S.F(mp, '#2b2420'); S.OP([[lk + 26, -326], [lk + 44, -324], [lk + 42, -284], [lk + 24, -286]], true, 1.8); if (!S.sch) fillP(PP([[lk + 28, -322], [lk + 41, -320], [lk + 40, -290], [lk + 27, -292]]), '#cfe6e2', .9); }
  const hx = ap[2][0], hy = ap[2][1];
  fillP(PE(hx, hy + 4, 8, 9), S.sch ? C.navy : '#efd9b9'); S.OL(hx, hy + 4, 8, 9, 0, 1.6);
  if (o.case) suitcase(hx, hy + 10, 1, { ...o, flip: false, handle: true }, k);
  X.restore();
}
// suitcase hung from (x,y) handle point; scale inherits the caller (k passed in local units)
function suitcase(x, y, sc = 1, o = {}, kk) {
  const k = kk || 1 / sc, S = sty(o, k); X.save(); X.translate(x, y); if (!kk) X.scale(sc, sc);
  const w = 120, h = 82, bx = -w / 2, by = 14, b = PR(bx, by, w, h);
  X.beginPath(); X.moveTo(-16, by); X.quadraticCurveTo(-16, 0, 0, 0); X.quadraticCurveTo(16, 0, 16, by); stroke(S.INK, 3.2 * k, 1);
  S.F(b, '#9a5a34'); S.SH(b, 0, by + h / 2, 80, [-14, -10], .75, 5); S.OP(dens([[bx, by], [bx + w, by], [bx + w, by + h], [bx, by + h]], 26, true));
  X.beginPath(); for (const sx of [-34, 34]) { X.moveTo(sx, by); X.lineTo(sx, by + h); } stroke(S.INK, 2.2 * k, .8);
  if (!S.sch) { const st = PE(18, by + 46, 14, 10, .3); fillP(st, C.cream); iE(18, by + 46, 14, 10, .3, C.ink, 1.2 * k, .9, false, .5); fillP(PE(-14, by + 30, 9, 9), C.rose); iE(-14, by + 30, 9, 9, 0, C.ink, 1.2 * k, .9, false); }
  X.restore();
}

// The travel agent at her desk: bun, cat-eye glasses, rose blouse, phone; desk top at y, centre x.
// o: {sch,col, talk:0..1, point:0..1, stamp:0..1, look}
function agent(x, y, s, o = {}) {
  const k = 1 / s, S = sty(o, k); X.save(); X.translate(x, y); X.scale(s, s);
  // torso behind desk
  const tp = [[-62, 0], [-54, -120], [-30, -150], [30, -150], [54, -120], [62, 0]], t = PP(tp);
  S.F(t, C.rose); S.SH(t, 0, -80, 120, [-16, -6], .9, 5); S.OP(dens(tp, 24));
  X.beginPath(); wP([[-14, -150], [0, -126], [14, -150]], false, .5 * k); stroke(S.INK, 1.8 * k, .9);
  // neck + head
  fillP(PR(-10, -170, 20, 24), S.sch ? C.navy : '#e7c9a2'); S.OP([[-10, -170], [-10, -148]], false, 1.6); S.OP([[10, -170], [10, -148]], false, 1.6);
  const lk = (o.look || 0) * 6, h = PE(lk, -200, 30, 36); S.F(h, '#e7c9a2'); S.SH(h, lk, -200, 40, [-8, -6], .5, 4.6); S.OL(lk, -200, 30, 36, 0, 2.2);
  // hair: cap + bun
  const hair = PE(lk, -222, 33, 22); S.F(hair, '#3b2a22'); S.SH(hair, lk, -222, 36, [-6, 4], .3, 3.6); S.OL(lk, -222, 33, 22, 0, 2);
  const bun = PE(lk - 6, -258, 18, 15); S.F(bun, '#3b2a22'); S.SH(bun, lk - 6, -258, 20, [-4, 3], .3, 3.6); S.OL(lk - 6, -258, 18, 15, 0, 2);
  // pencil in the bun
  S.OP([[lk - 30, -272], [lk + 20, -244]], false, 3); X.beginPath(); wP([[lk - 30, -272], [lk + 20, -244]], false, .3 * k); stroke(S.sch ? C.navy : C.ochre, 1.6 * k, 1);
  // cat-eye glasses
  for (const sx of [-1, 1]) { const gx = lk + sx * 13; X.beginPath(); X.moveTo(gx - 10, -198); X.quadraticCurveTo(gx - 10, -210, gx + sx * 14, -212); X.quadraticCurveTo(gx + 10, -196, gx - 10, -198); stroke(S.INK, 2.2 * k, 1); fillP(PE(gx, -202, 2.4, 2.4), S.INK); }
  // mouth
  const tk = o.talk || 0; if (tk > .05) fillP(PE(lk, -176, 6, 2 + tk * 5), S.sch ? S.col : C.brick, .9); else { X.beginPath(); wP([[lk - 7, -177], [lk + 7, -177]], false, .3 * k); stroke(S.INK, 1.6 * k); }
  // arms: one on desk, one points/stamps
  limb([[-50, -118], [-80, -40], [-30, -6]], 14, o, k, '#b8766b');
  const pt = o.point || 0, st = o.stamp || 0;
  const hx = lerp(40, 150, pt) , hy = lerp(-10, -150, pt) - st * 60;
  limb([[50, -118], [lerp(84, 110, pt), lerp(-40, -110, pt) - st * 50], [hx, hy]], 14, o, k, '#b8766b');
  fillP(PE(hx, hy, 10, 9), S.sch ? C.navy : '#e7c9a2'); S.OL(hx, hy, 10, 9, 0, 1.6);
  if (pt > .5) { S.OP([[hx + 6, hy - 2], [hx + 24, hy - 10]], false, 3); }
  if (st > 0) { const sp = PR(hx - 12, hy + 8, 24, 30); S.F(sp, '#5a3a22'); S.OP([[hx - 12, hy + 8], [hx + 12, hy + 8], [hx + 12, hy + 38], [hx - 12, hy + 38]], true, 1.8); }
  X.restore();
}
function desk(x, y, w, s = 1, o = {}) { // top edge at y
  const k = 1 / s, S = sty(o, k), top = PP([[x - w / 2 - 20, y - 18], [x + w / 2 + 20, y - 18], [x + w / 2, y], [x - w / 2, y]]), front = PR(x - w / 2, y, w, 260);
  S.F(front, '#a5703f'); S.SH(front, x, y + 130, w * .6, [w * .12, -30], .85, 6); S.OP(dens([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + 260], [x - w / 2, y + 260]], 40, true));
  if (!S.sch) { X.beginPath(); for (let i = 0; i < 9; i++) { const yy = y + 30 + i * 26; X.moveTo(x - w / 2 + 10, yy); for (let xx = x - w / 2 + 10; xx < x + w / 2 - 10; xx += 40) X.lineTo(xx + 40, yy + Math.sin(xx * .05 + i) * 3 + jit(1)); } stroke(C.ink, .9, .4); }
  S.F(top, '#c08a50'); S.OP([[x - w / 2 - 20, y - 18], [x + w / 2 + 20, y - 18], [x + w / 2, y], [x - w / 2, y]], true, 2.2);
  // sign plate
  const pl = PR(x - 110, y + 40, 220, 46); S.F(pl, S.sch ? C.navy : C.cream); S.OP([[x - 110, y + 40], [x + 110, y + 40], [x + 110, y + 86], [x - 110, y + 86]], true, 2);
  lab(x, y + 70, 'TRAVEL', S.INK, .9, 20, 'center', 'alphabetic', 'bold');
}

// Globe at (x,y) radius r, rotation rot (radians of longitude). Land = fixed blobs on the sphere.
const LAND = (() => { const r = M32(4242), L = []; for (let i = 0; i < 9; i++) { const lon = r() * TAU, lat = (r() - .5) * 2.2, pts = []; const n = 14, sz = .25 + r() * .45; for (let j = 0; j < n; j++) { const a = j / n * TAU, rr = sz * (.6 + r() * .5); pts.push([lon + Math.cos(a) * rr * 1.3, lat + Math.sin(a) * rr]); } L.push(pts); } return L; })();
function proj(lon, lat, rot, tilt = .35) { // orthographic, returns [x,y,visible]
  const l = lon + rot, x = Math.cos(lat) * Math.sin(l), y0 = Math.sin(lat), z0 = Math.cos(lat) * Math.cos(l);
  const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt), z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt); return [x, -y, z > 0];
}
function globe(x, y, r, rot, o = {}) {
  const sch = !!o.sch, col = o.col || C.lav, disk = PE(x, y, r, r);
  if (!sch) { fillP(disk, C.sky); }
  else fillP(disk, C.navy, .95);
  // graticule
  X.beginPath();
  for (let m = 0; m < 12; m++) { let first = true; for (let la = -1.5; la <= 1.51; la += .1) { const [px, py, v] = proj(m * TAU / 12, la, rot); if (v) { first ? X.moveTo(x + px * r, y + py * r) : X.lineTo(x + px * r, y + py * r); first = false; } else first = true; } }
  for (let pa = -1.2; pa <= 1.21; pa += .3) { let first = true; for (let lo = 0; lo <= TAU + .01; lo += .08) { const [px, py, v] = proj(lo, pa, rot); if (v) { first ? X.moveTo(x + px * r, y + py * r) : X.lineTo(x + px * r, y + py * r); first = false; } else first = true; } }
  stroke(sch ? col : C.ink, 1, sch ? .4 : .35);
  // land
  for (const L of LAND) {
    const pts = L.map(([lo, la]) => proj(lo, la, rot)); if (pts.filter((p) => p[2]).length < pts.length * .6) continue;
    const sp = pts.map(([px, py]) => [x + px * r, y + py * r]), lp = PP(sp);
    if (sch) { stip(lp, sp[0][0], sp[0][1], r * .6, 260, col, .9, 1.6); iP(sp, true, col, 1, .8, false, .5); }
    else { fillP(lp, C.sage); hatch(lp, x, y, r, .6, 4.5, C.ink, .9, .55); iP(sp, true, C.ink, 1.6, 1, false, .7); }
  }
  if (!sch) { hatch(disk, x, y, r, .8, 5, C.ink, 1, .6, [r * .22, -r * .16]); hatch(disk, x, y, r, -.5, 6.5, C.ink, .9, .45, [r * .45, -r * .32]); iE(x, y, r, r, 0, C.ink, 2.6); }
  else { iE(x, y, r, r, 0, col, 1.4, .9, false, .5); }
}

// Airliner, side view, nose to +x; length ~ 520 at s=1. o.sch for wireframe.
function plane(x, y, s, rot = 0, o = {}) {
  const k = 1 / s, S = sty(o, k); X.save(); X.translate(x, y); X.rotate(rot); X.scale(o.flip ? -s : s, s);
  const far = [[-40, 6], [40, -10], [70, -12], [10, 6]]; const fw = PP(far); S.F(fw, '#c9c0aa'); S.OP(far, true, 1.8, .7);
  const body = [[-260, -28], [-200, -40], [180, -40], [236, -26], [262, 0], [236, 22], [180, 30], [-200, 30], [-258, 6]];
  const b = PP(body); S.F(b, C.cream); S.SH(b, 0, 0, 280, [0, -16], .2, 5.5); S.OP(dens(body, 30, true));
  if (!S.sch) { const st = PP([[-230, 2], [230, 2], [250, 10], [-236, 12]]); fillP(st, C.orange); }
  const tail = [[-250, -30], [-292, -122], [-262, -124], [-200, -38]]; const tp = PP(tail); S.F(tp, S.sch ? C.navy : C.teal); S.SH(tp, -250, -80, 60, [6, -6], .9, 4); S.OP(tail);
  const wing = [[-30, 12], [80, 12], [10, 88], [-40, 88]]; const wp = PP(wing); S.F(wp, '#d8d0bb'); S.SH(wp, 20, 50, 70, [10, -10], .6, 4.5); S.OP(wing);
  const eng = PE(30, 40, 34, 15); S.F(eng, '#b9b09a'); S.SH(eng, 30, 40, 36, [0, -6], .3, 3.6); S.OL(30, 40, 34, 15, 0, 2);
  for (let i = 0; i < 16; i++) { const wx = -170 + i * 21; fillP(PE(wx, -16, 4, 5), S.INK, .85); }
  X.beginPath(); wP([[196, -26], [222, -18], [214, -28]], true, .3 * k); stroke(S.INK, 1.6 * k, .9);
  X.restore();
}
// Blues cloud: a fixed lump of circles; rain optional. o.sch for stipple.
function cloud(x, y, s, o = {}) {
  const k = 1 / s, S = sty(o, k); X.save(); X.translate(x, y); X.scale(s, s);
  const bl = [[-80, 0, 52], [-30, -30, 64], [30, -22, 58], [80, 4, 46], [0, 12, 60]]; const u = new Path2D(); bl.forEach(([a, b, r]) => u.addPath(PE(a, b, r, r * .82)));
  if (o.rain) { X.beginPath(); for (let i = 0; i < 26; i++) { const rx = -110 + R() * 220, ry = 40 + R() * 40, L = 40 + R() * 70; X.moveTo(rx, ry); X.lineTo(rx - L * .18, ry + L); } stroke(S.sch ? S.col : C.teal, 1.6 * k, .85); }
  if (o.rain && !S.sch && typeof NOTES !== 'undefined' && NOTES > 0 && typeof noteRain === 'function') noteRain(-110, 60, 220, 110, NOTES);
  S.F(u, '#8d93a8'); S.SH(u, 0, 0, 150, [10, -22], .6, 5);
  bl.forEach(([a, b, r]) => iE(a, b, r, r * .82, 0, S.INK, (S.sch ? 1.1 : 2.2) * k, S.sch ? .8 : 1, false, .8 * k, Math.PI * .95, Math.PI * 2.05));
  X.restore();
}
function sunIll(x, y, r, col = C.ochre, loud = 0) {
  const p = PE(x, y, r, r); fillP(p, col, .95); hatch(p, x, y, r, .8, 5, C.ink, 1, .55, [-r * .2, -r * .2]); iE(x, y, r, r, 0, C.ink, 2.4);
  X.beginPath(); for (let i = 0; i < 44; i++) { const a = i / 44 * TAU + jit(.02), L = i % 4 ? 24 : 46; X.moveTo(x + Math.cos(a) * (r + 12), y + Math.sin(a) * (r + 12)); X.lineTo(x + Math.cos(a) * (r + L), y + Math.sin(a) * (r + L)); } stroke(C.ink, 1.5, .85);
  if (loud > 0) for (let i = 0; i < 5; i++) { const rr = r + 60 + ((FD * 6 + i * 50) % 250); gc(x, y, rr, C.orange, cl(1 - (rr - r) / 320) * loud * .9, 2.2); }
}
function palm(x, y, s, o = {}) {
  const k = 1 / s, S = sty(o, k); X.save(); X.translate(x, y); X.scale(s, s);
  const tr = []; for (let i = 0; i <= 10; i++) { const t = i / 10; tr.push([Math.sin(t * 2) * 40, -t * 320]); }
  for (let i = 0; i < 10; i++) { const [a, b] = tr[i], seg2 = PE(a, b - 16, 15 - i * .6, 18); S.F(seg2, '#9b7448'); S.OL(a, b - 16, 15 - i * .6, 18, 0, 1.6); }
  const top = tr[10];
  for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6 + (o.sway || 0) * .1, L = 150; const pts = []; for (let j = 0; j <= 8; j++) { const t = j / 8; pts.push([top[0] + Math.cos(a) * L * t, top[1] + Math.sin(a) * L * t + t * t * 70]); }
    const lf = PP(pts.concat(pts.slice().reverse().map(([a2, b2], j) => [a2 + Math.sin(a) * 18 * Math.sin(j / 8 * Math.PI), b2 - Math.cos(a) * 18 * Math.sin(j / 8 * Math.PI)])));
    S.F(lf, C.sage); if (!S.sch) hatch(lf, top[0], top[1], 160, a + 1.4, 4, C.ink, .8, .5); S.OP(pts, false, 2); }
  X.restore();
}
// Ticket / boarding pass, centred, w ~ 560 at s=1
function ticket(x, y, s, rot, o = {}) {
  const k = 1 / s, S = sty(o, k); X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
  const b = PR(-280, -110, 560, 220); S.F(b, S.sch ? C.navy : C.cream); if (!S.sch) hatch(b, 0, 0, 320, .7, 9, C.ink, .8, .15); S.OP(dens([[-280, -110], [280, -110], [280, 110], [-280, 110]], 40, true));
  X.beginPath(); X.setLineDash([6, 8]); X.moveTo(150, -110); X.lineTo(150, 110); stroke(S.INK, 1.4 * k, .8); X.setLineDash([]);
  const band = PR(-280, -110, 560, 44); S.F(band, S.sch ? C.navy : C.orange); S.OP([[-280, -66], [280, -66]], false, 1.6);
  lab(-260, -78, 'BOARDING PASS', S.sch ? S.col : C.cream, 1, 18, 'left', 'alphabetic', 'bold');
  lab(-260, -20, 'FROM', S.INK, .7, 13); lab(-260, 20, o.from || 'HERE', S.INK, 1, 34, 'left', 'alphabetic', 'bold');
  lab(-20, -20, 'TO', S.INK, .7, 13); lab(-20, 20, o.to || 'AWAY', S.INK, 1, 34, 'left', 'alphabetic', 'bold');
  lab(-260, 76, 'SEAT  ' + (o.seat || '13A') + '   GATE  ' + (o.gate || '0'), S.INK, .8, 15);
  X.beginPath(); for (let i = 0; i < 26; i++) { const bx2 = 170 + i * 3.7; X.moveTo(bx2, -40); X.lineTo(bx2, 80); } stroke(S.INK, 1.5 * k, .85);
  X.restore();
}
function stampMark(x, y, r, txt, col, rot = -.2, a = 1) { X.save(); X.translate(x, y); X.rotate(rot); iE(0, 0, r, r * .62, 0, col, 3, a, true, 1.4); iE(0, 0, r * .84, r * .5, 0, col, 1.5, a, false, 1); lab(0, 8, txt, col, a, r * .34, 'center', 'middle', 'bold'); X.restore(); }
