/* The model: a wooden dial candy machine on a workbench, with the leftovers of one two-by-four round it.
   x = depth (front at x = W), y = width (+y goes screen left at the default view), z = up.
   Real process: lift the hatch and fill the hopper -> sweets settle down the funnel -> the top pocket of the dose wheel
   fills -> a quarter turn of the dial carries that pocket round the shaft -> at the bottom it empties into the chute ->
   the chute lands them in the tray. A ratchet and pawl stop the wheel running backwards; the limiter cam stops the
   shaft after two turns.
   Parts, each held by another:
   CASE    body . four feet on the bench . window in the front . fill hatch and knob on the top neck . service panel on the back
   STORE   drum behind the window . back disc of the drum . neck from the top of the case into the drum . funnel under the drum
   DOSE    dose wheel on the shaft . four pockets . front bearing in the front wall . rear bearing block on the back wall
   STOP    ratchet wheel on the shaft . pawl on a post on the back wall . spring from the pawl to the wall . limiter cam on the shaft . stop arm on a post
   OUT     chute from under the wheel through the front wall . tray on the front wall */
const W = 42, D = 70, BOARD_H = 2, FOOT = 2.4, Z0 = BOARD_H + FOOT, Z1 = 112;
const OUT = rrUV(0, Z0, D, Z1, 9);
const CY = D/2, DR_Z = 78, DR_R = 25, ROT_Z = 35, ROT_R = 15, DIAL_R = 12.5, NECK_X = 21, NECK_R = 8;
const BX = [-112, 136], BY = [-128, 196];
const MAH = { l:'#c98a56', m:'#a5683c', d:'#633820' }, BLOND = { l:'#ecc58c', m:'#d3a568', d:'#9a7442' }, STUB = { l:'#e3c394', m:'#c9a26b', d:'#8d6d43' };
const CUPM = { l:'#f3b6c0', m:'#dd8f9d', d:'#9c5563' }, GUN = { l:'#7c8389', m:'#5c6369', d:'#3b4146' }, CREAMM = { l:'#fff7e3', m:'#eee0bf', d:'#c6b48b' };
const SWEETS = ['#d8432f', '#f4b829', '#3f9d6c', '#4f7fd0', '#e8843a', '#8a5a33'];
const RECESS = '#2b2523';

// a small seeded random, so every frame draws the same sawdust and the same sweets
const rnd = seed => { let a = seed; return () => { a = (a*16807) % 2147483647; return (a - 1)/2147483646; }; };

/* a sweet: a round disc on screen with a highlight, at a real 3D place */
const unitPx = () => { const a = P(0, 0, 0), b = P(0, 0, 1); return Math.hypot(a[0] - b[0], a[1] - b[1])/Math.max(.2, Math.cos(PITCH*Math.PI/180)); };
function ball(x, y, z, r, c, w = .8){ const [X, Y] = P(x, y, z), R = r*unitPx(), lw = w*INK_K;
  return `<circle cx="${f(X)}" cy="${f(Y)}" r="${f(R)}" fill="${c}" stroke="${INK}" stroke-width="${f(lw)}"/><circle cx="${f(X - R*.3)}" cy="${f(Y - R*.34)}" r="${f(R*.26)}" fill="#ffffff" opacity=".72"/>`; }

/* the sweets in the drum, in three layers by depth; the seal of the window shows the front layer only */
const DRUM = (() => { const out = [], g = rnd(11); [W - 5, W - 14, W - 23, W - 32].forEach((x, li) => { const r0 = 4.1, st = r0*1.86;
    for (let zz = -DR_R; zz <= DR_R; zz += st*.87) for (let yy = -DR_R; yy <= DR_R; yy += st){ const y = yy + (Math.round((zz + DR_R)/(st*.87)) % 2)*st/2 + li*2.2, z = zz;
      if (Math.hypot(y, z) < DR_R - r0 - .4) out.push({ x, y:CY + y, z:DR_Z + z, c:SWEETS[Math.floor(g()*SWEETS.length)], li }); } }); return out; })();
const levelZ = lv => DR_Z - DR_R + 2*DR_R*lv;

/* the dose, from the wheel's bottom pocket, down the chute, into the tray */
const TRAY_X0 = W, TRAY_X1 = W + 17, TRAY_Y0 = CY - 18, TRAY_Y1 = CY + 18, TRAY_Z = Z0 + .6;
const traySlot = i => { const c = i % 10, layer = Math.floor(i/10), col = c % 5, row = Math.floor(c/5);
  return [TRAY_X0 + 5 + row*6.2 + (layer ? 2.4 : 0), TRAY_Y0 + 6 + col*6 + (layer ? 3 : 0), TRAY_Z + 3.4 + layer*4.2]; };
const chuteAt = (u, y) => { const a = [W/2, y, ROT_Z - ROT_R - 1], b = [W - 1, y, Z0 + 9]; return u < .5 ? [a[0] + (b[0] - a[0])*u*2, y, a[2] + (b[2] - a[2])*u*2] : null; };

/* ---------- the case ---------- */
function windowFace(st){ const x = W + .15; let s = shape(on(PX(x), ellUV(CY, DR_Z, DR_R + 2.4, DR_R + 2.4, 48)), BLOND.m, 1.6) + fill(pd(on(PX(x + .02), ellUV(CY, DR_Z, DR_R, DR_R, 48))), '#2f2a25');
  const lim = levelZ(st.level);
  for (const b of DRUM) if (b.li === 0 && b.z <= lim) s += ball(x + .05, b.y, b.z, 4, b.c, .7);
  s += fill(pd(on(PX(x + .1), ellUV(CY, DR_Z, DR_R, DR_R, 48))), '#dff1f5', 'opacity=".14"');
  // two streaks on the glass
  for (const [y0, w] of [[CY + 14, 3.5], [CY + 6, 1.8]]) s += fill(pd([[x + .12, y0, DR_Z + 17], [x + .12, y0 - w, DR_Z + 17], [x + .12, y0 - w - 11, DR_Z - 14], [x + .12, y0 - 11, DR_Z - 14]]), '#ffffff', 'opacity=".38"');
  return s + ink(pd(on(PX(x + .12), ellUV(CY, DR_Z, DR_R, DR_R, 48))), 1.6); }
function dial(st){ const a = st.rot*Math.PI/2 + st.jiggle, x = W + 5.4;
  let s = cylX(W, W + 5, CY, ROT_Z, DIAL_R, BLOND, toneI, 1.4, 32);
  if (facing([1, 0, 0])){ // knurled rim marks, then the grip bar that shows the turn
    let g = ''; for (let i = 0; i < 16; i++){ const t = i/16*2*Math.PI; g += pd([[x, CY + (DIAL_R - .4)*Math.cos(t), ROT_Z + (DIAL_R - .4)*Math.sin(t)], [x, CY + (DIAL_R - 2)*Math.cos(t), ROT_Z + (DIAL_R - 2)*Math.sin(t)]], false); }
    s += `<path d="${g}" fill="none" stroke="${INK}" stroke-width=".7"/>`;
    const c = Math.cos(a), n = Math.sin(a), l = DIAL_R - 2.8, wd = 1.7;
    s += shape([[x + .05, CY + l*n + wd*c, ROT_Z + l*c - wd*n], [x + .05, CY + l*n - wd*c, ROT_Z + l*c + wd*n], [x + .05, CY - l*n - wd*c, ROT_Z - l*c + wd*n], [x + .05, CY - l*n + wd*c, ROT_Z - l*c - wd*n]], MAH.m, .9);
    s += fill(pd(on(PX(x + .08), ellUV(CY + (l - 1.8)*n, ROT_Z + (l - 1.8)*c, 1, 1, 10))), '#fff4d6');
  }
  return s; }
function trayPart(){ let s = box(TRAY_X0, TRAY_Y0, Z0, TRAY_X1, TRAY_Y1, TRAY_Z, BLOND, toneI, 1.1);
  const lip = [[TRAY_X1 - 1.4, TRAY_Y0, TRAY_X1, TRAY_Y1], [TRAY_X0, TRAY_Y0, TRAY_X1, TRAY_Y0 + 1.4], [TRAY_X0, TRAY_Y1 - 1.4, TRAY_X1, TRAY_Y1]];
  return { base:s, lips:lip.map(([a, b, c, d]) => box(a, b, TRAY_Z, c, d, TRAY_Z + 4.4, BLOND, toneI, .8)).join('') }; }
function trayContents(st, closed){ let s = ''; const { doses } = st;
  for (const d of doses) for (let i = 0; i < d.n; i++){ const u = clampU((st.t - d.t0 - i*.055)/.62); if (u <= 0) continue; const [tx_, ty_, tz_] = traySlot(d.base + i), y = ty_, c = SWEETS[(d.base + i*3) % SWEETS.length];
      if (u >= 1){ s += ball(tx_, ty_, tz_, 2.8, c, .7); continue; }
      const e = u*u, x0 = W/2, z0 = ROT_Z - ROT_R - 1, x = x0 + (tx_ - x0)*e, z = z0 + (tz_ - z0)*e - 4*Math.sin(u*Math.PI)*.2;
      if (closed && x < W) continue; s += ball(x, y, z, 2.8, c, .7); }
  return s; }
const clampU = u => Math.max(0, Math.min(1, u));
function lid(st){ const z = Z1 + st.hatch*15, tilt = st.hatch*7; // lifted straight off, a little to the back
  const x = NECK_X - tilt; let s = cyl(NECK_X, CY, Z1 - 1, Z1 + 2.2, NECK_R, BLOND, toneI, 1.1, 28);
  if (st.hatch > 0) s += fill(pd(on(PZ(Z1 + 2.25), ellUV(NECK_X, CY, NECK_R - 1.6, NECK_R - 1.6, 24))), RECESS);
  s += cyl(x, CY, z + 2.2, z + 5, NECK_R + 1.8, MAH, toneI, 1.2, 28) + cyl(x, CY, z + 5, z + 8.6, 2.6, BLOND, toneI, .9, 16);
  return s; }
function feet(){ const pts = [[6, 8], [6, D - 8], [W - 6, 8], [W - 6, D - 8]];
  return byDepth(pts.map(([x, y]) => ({ box:[[x - 4, y - 4, BOARD_H], [x + 4, y + 4, Z0]], svg:cyl(x, y, BOARD_H, Z0, 3.6, DARK, toneI, .8, 14) }))); }
function caseBody(st, withWindow = true){ const FRONT = facing([1, 0, 0]), BACK = facing([-1, 0, 0]);
  let s = extrude(OUT, 0, W, MAH);
  if (FRONT){ s += fill(pd(on(PX(W), OUT)), tone([1, 0, 0], MAH)) + ink(pd(on(PX(W), OUT)), 2.2);
    if (withWindow) s += windowFace(st);
    // the seat of the dial and the two marks it turns between
    s += shape(on(PX(W + .1), ellUV(CY, ROT_Z, DIAL_R + 2.2, DIAL_R + 2.2, 36)), BLOND.d, 1);
    // slot the chute comes out of
    s += shape(on(PX(W + .1), rrUV(TRAY_Y0 + 2, Z0 + 4.8, TRAY_Y1 - 2, Z0 + 11, 1.6, 3)), RECESS, 1);
  }
  if (BACK){ s += fill(pd(on(PX(0), OUT)), tone([-1, 0, 0], MAH)) + ink(pd(on(PX(0), OUT)), 2.2);
    // service panel on four screws, and a burned-in maker's plate
    s += shape(on(PX(-.15), rrUV(12, 22, D - 12, 92, 3, 3)), MAH.l, 1);
    for (const [y, z] of [[17, 27], [D - 17, 27], [17, 87], [D - 17, 87]]) s += shape(on(PX(-.2), ellUV(y, z, 1.5, 1.5, 10)), METAL.m, .6);
    s += fill(pd(on(PX(-.2), rrUV(22, 60, D - 22, 72, 1, 2))), MAH.d);
  }
  // the top neck the hatch sits on is drawn with the lid
  return s + hullInk([...on(PX(0), OUT), ...on(PX(W), OUT)], 2.8); }

/* the whole closed machine, front parts before or after the case by which way it faces */
function closedMachine(st){ const FRONT = facing([1, 0, 0]), tr = trayPart();
  const front = () => tr.base + trayContents(st, true) + tr.lips + dial(st);
  return feet() + (FRONT ? '' : front()) + caseBody(st) + (FRONT ? front() : '') + lid(st); }

/* ---------- inside: real parts, each with a box so they sort ---------- */
const RATCH = { x:7, r:13 }, LIMIT = { x:W - 7, r:9 };
function pocketPts(a, r0, r1, half){ const q = []; for (let i = 0; i <= 6; i++){ const t = a - half + 2*half*i/6; q.push([CY + r1*Math.sin(t), ROT_Z + r1*Math.cos(t)]); } for (let i = 6; i >= 0; i--){ const t = a - half + 2*half*i/6; q.push([CY + r0*Math.sin(t), ROT_Z + r0*Math.cos(t)]); } return q; }
function mechParts(st){ const out = [], a = st.rot*Math.PI/2 + st.jiggle, FRONT = facing([1, 0, 0]);
  const bx = (x0, y0, z0, x1, y1, z1, svg) => out.push({ box:[[x0, y0, z0], [x1, y1, z1]], svg });
  // rear bearing block on the back wall, front bearing in the front wall
  bx(0, CY - 7, ROT_Z - 7, 3.5, CY + 7, ROT_Z + 7, box(0, CY - 7, ROT_Z - 7, 3.5, CY + 7, ROT_Z + 7, GUN, toneI, .9));
  bx(W - 3, CY - 6, ROT_Z - 6, W, CY + 6, ROT_Z + 6, cylX(W - 3, W, CY, ROT_Z, 6, GUN, toneI, .9, 18));
  // the shaft, in sections either side of what it passes through
  for (const [x0, x1] of [[3.5, RATCH.x - 1.5], [RATCH.x + 1.5, 12], [W - 9, LIMIT.x - 1], [LIMIT.x + 1, W]]) bx(x0, CY - 2, ROT_Z - 2, x1, CY + 2, ROT_Z + 2, cylX(x0, x1, CY, ROT_Z, 1.9, METAL, toneI, .8, 12));
  // the dose wheel, with its four pockets; the top pocket is full unless it has just gone round
  let wheel = cylX(12, W - 9, CY, ROT_Z, ROT_R, BLOND, toneI, 1.3, 40);
  const capX = FRONT ? W - 9 + .1 : 12 - .1;
  for (let i = 0; i < 4; i++){ const t = a + i*Math.PI/2; wheel += shape(pocketPts(t, 7, ROT_R - 1.4, .42).map(([y, z]) => [capX, y, z]), RECESS, .8);
    const hgt = Math.cos(t); // sweets ride in the pockets while the pocket is above the chute
    if (hgt > -.3) for (const [k, dt] of [[0, -.18], [1, .18]]){ const rr = ROT_R - 4.6, y = CY + rr*Math.sin(t + dt), z = ROT_Z + rr*Math.cos(t + dt); wheel += ball(capX + (FRONT ? .1 : -.1), y, z, 2.3, SWEETS[(i*2 + k) % SWEETS.length], .6); } }
  wheel += shape(on(PX(capX + (FRONT ? .08 : -.08)), ellUV(CY, ROT_Z, 3.6, 3.6, 16)), METAL.m, .7);
  bx(12, CY - ROT_R, ROT_Z - ROT_R, W - 9, CY + ROT_R, ROT_Z + ROT_R, wheel);
  // the ratchet wheel on the shaft, cut with sixteen teeth, and its pawl on a post, with a spring
  let rat = cylX(RATCH.x - 1.5, RATCH.x + 1.5, CY, ROT_Z, RATCH.r - 1.4, METAL, toneI, 1, 32);
  const face = FRONT ? RATCH.x + 1.55 : RATCH.x - 1.55; let tooth = ''; for (let i = 0; i < 16; i++){ const t = a + i/16*2*Math.PI; tooth += pd([[face, CY + (RATCH.r - 1.4)*Math.sin(t), ROT_Z + (RATCH.r - 1.4)*Math.cos(t)], [face, CY + RATCH.r*Math.sin(t + .13), ROT_Z + RATCH.r*Math.cos(t + .13)], [face, CY + (RATCH.r - 1.4)*Math.sin(t + .39), ROT_Z + (RATCH.r - 1.4)*Math.cos(t + .39)]], false); }
  rat += `<path d="${tooth}" fill="none" stroke="${INK}" stroke-width=".8"/>`;
  bx(RATCH.x - 1.5, CY - RATCH.r, ROT_Z - RATCH.r, RATCH.x + 1.5, CY + RATCH.r, ROT_Z + RATCH.r, rat);
  const post = [RATCH.x, CY + 20, ROT_Z + 16], tip = [RATCH.x, CY + 8.2 + st.pawl*1.2, ROT_Z + 10.3 + st.pawl*1.8];
  bx(0, post[1] - 2, post[2] - 2, RATCH.x + 1, post[1] + 2, post[2] + 2, rod([0, post[1], post[2]], [RATCH.x + 1, post[1], post[2]], 1.5, GUN, toneI, .7));
  bx(RATCH.x - 1, tip[1] - 1, tip[2] - 1, RATCH.x + 1, post[1] + 1, post[2] + 1, rod(post, tip, 1.1, GUN, toneI, .8));
  // spring: short pieces from the pawl's middle to a pin on the side wall
  const m0 = [RATCH.x, (post[1] + tip[1])/2, (post[2] + tip[2])/2], m1 = [RATCH.x, D - 2, ROT_Z + 25]; let sp = [];
  for (let i = 0; i <= 14; i++){ const u = i/14, o = i === 0 || i === 14 ? 0 : (i % 2 ? 1.3 : -1.3); sp.push([RATCH.x, m0[1] + (m1[1] - m0[1])*u - o*.5, m0[2] + (m1[2] - m0[2])*u + o]); }
  bx(RATCH.x - .5, m0[1], m0[2], RATCH.x + .5, m1[1], m1[2], ink(pd(sp, false), .9));
  // the limiter cam on the shaft and the stop arm that drops into its notch after two turns
  let cam = cylX(LIMIT.x - 1, LIMIT.x + 1, CY, ROT_Z, LIMIT.r, { l:'#e36a4d', m:'#c64f33', d:'#7c2c1e' }, toneI, .9, 26);
  bx(LIMIT.x - 1, CY - LIMIT.r, ROT_Z - LIMIT.r, LIMIT.x + 1, CY + LIMIT.r, ROT_Z + LIMIT.r, cam);
  const sp0 = [LIMIT.x + 1.6, CY - 21, ROT_Z - 5], sp1 = [LIMIT.x + 1.6, CY - LIMIT.r + 1 + (1 - st.stop)*-3, ROT_Z + 2];
  bx(LIMIT.x + 1, sp0[1] - 2, sp0[2] - 2, W, sp0[1] + 2, sp0[2] + 2, rod([W, sp0[1], sp0[2]], sp0, 1.3, GUN, toneI, .7));
  bx(LIMIT.x + 1, sp0[1], sp0[2] - 1, LIMIT.x + 2.2, sp1[1], sp1[2] + 1, rod(sp0, sp1, 1.1, { l:'#f4b829', m:'#d39c1e', d:'#8c6510' }, toneI, .8));
  // the funnel from the drum to the top of the wheel
  const fT = DR_Z - DR_R + 2, fB = ROT_Z + ROT_R + .8;
  const fun = [[[CY - 18, fT], [CY - 5, fB], [CY - 8, fB], [CY - 21, fT]], [[CY + 18, fT], [CY + 5, fB], [CY + 8, fB], [CY + 21, fT]]];
  fun.forEach(q => bx(10, q[3][0] < CY ? CY - 21 : CY + 5, fB, W - 7, q[3][0] < CY ? CY - 5 : CY + 21, fT, extrude(q, 10, W - 7, METAL, toneI) + ink(pd(on(PX(FRONT ? W - 7 : 10), q)), 1)));
  // the chute: a square trough from under the wheel, out through the front wall
  const chute = (y0, y1) => { const q = [[W/2 - 7, ROT_Z - ROT_R - 2], [W - .2, Z0 + 6], [W - .2, Z0 + 4.2], [W/2 - 7, ROT_Z - ROT_R - 3.8]]; const pts = (y) => q.map(([x, z]) => [x, y, z]);
    return loft(pts(y0), pts(y1), n => toneI(n, METAL)) + ink(pd(pts(y1)), 1) + ink(pd(pts(y0)), 1); };
  bx(W/2 - 7, CY - 14, Z0 + 4, W, CY + 14, ROT_Z - ROT_R - 2, chute(CY - 14, CY + 14));
  // the drum: back disc, sweets by layer, a ring at each end
  const rims = [...on(PX(5.5), ellUV(CY, DR_Z, DR_R, DR_R, 40)), ...on(PX(W - 1), ellUV(CY, DR_Z, DR_R, DR_R, 40))], tube = hull(rims.map(q => P(...q)));
  bx(5, CY - DR_R, DR_Z - DR_R, 6, CY + DR_R, DR_Z + DR_R, `<path d="M${tube.map(q => f(q[0]) + ' ' + f(q[1])).join('L')}Z" fill="#cfe9f0" opacity=".42"/>` + shape(on(PX(5.5), ellUV(CY, DR_Z, DR_R, DR_R, 48)), '#8ea5a8', 1.1) + hullInk(rims, 1.1));
  const lim = levelZ(st.level);
  for (const b of DRUM) if (b.z <= lim){ const hz = b.z + (st.hop || 0)*(1 + (Math.round(b.x + b.y) % 3)); bx(b.x - 4, b.y - 4, hz - 4, b.x + 4, b.y + 4, hz + 4, ball(b.x, b.y, hz, 4, b.c, .7)); }
  // the neck from the top of the case down into the drum
  bx(NECK_X - NECK_R, CY - NECK_R, DR_Z + 18, NECK_X + NECK_R, CY + NECK_R, Z1, rod([NECK_X, CY, DR_Z + 19], [NECK_X, CY, Z1], NECK_R, CLEAR, toneI, .9));
  return out; }
function mech(st){ return byDepth(mechParts(st)) + `<path d="${pd(on(PX(W - 1), ellUV(CY, DR_Z, DR_R, DR_R, 48)))}" fill="none" stroke="${INK}" stroke-width="1.5"/>`; }
const MECH_ITEMS = st => [
  { at:[NECK_X, CY - 2, 108], text:'FILL HATCH', on:st.hatch > 0, side:0 },
  { at:[W - 5, CY - 16, DR_Z + 10], text:'HOPPER', on:st.level < 1 || st.hatch > 0, side:1 },
  { at:[20, CY + 18, 50], text:'FUNNEL', on:st.moving, side:0 },
  { at:[W - 9, CY - 10, ROT_Z + 8], text:'DOSE WHEEL', on:st.moving, side:1 },
  { at:[RATCH.x, CY + 11, ROT_Z + 9], text:'RATCHET', on:st.moving, side:0 },
  { at:[LIMIT.x + 2, CY - 13, ROT_Z - 2], text:'LIMITER CAM', on:st.locked, side:1 },
  { at:[W - 10, CY + 12, Z0 + 10], text:'CHUTE', on:st.moving, side:0 },
  { at:[TRAY_X1 - 4, CY - 13, TRAY_Z + 2], text:'TRAY', on:st.moving, side:1 },
  { at:[W, CY + 22, 58], text:'FOOD SAFE FINISH', on:st.finish, side:0 },
];

/* ---------- what is left of the two-by-four, and the shop's small talk ---------- */
const stubBox = { x0:8, x1:34, y0:6, y1:64, z0:BOARD_H, z1:BOARD_H + 13 };
function stub(st){ const b = stubBox; let s = box(b.x0, b.y0, b.z0, b.x1, b.y1, b.z1, STUB, toneI, 1.8);
  if (facing([0, 0, 1])){ const z = b.z1 + .05, g = rnd(77); let gr = ''; for (let i = 0; i < 9; i++){ const y = b.y0 + 3 + g()*(b.y1 - b.y0 - 6); gr += pd([[b.x0 + 1 + g()*8, y, z], [b.x1 - 1 - g()*8, y + g()*2, z]], false); }
    s += `<path d="${gr}" fill="none" stroke="#8d6d43" stroke-width=".6" opacity=".7"/>`;
    if (st.chalk > 0){ const r = on(PZ(z + .02), rrUV(11, 12, 31, 58, 5, 4)), n = Math.ceil(r.length*st.chalk), part = r.slice(0, n); s += `<path d="${pd(part, n === r.length)}" fill="none" stroke="#fffdf2" stroke-width="1.6" stroke-dasharray="3 2"/>`;
      s += shape(on(PZ(z + .02), ellUV(21, 35, 5*st.chalk, 5*st.chalk, 14)), 'none', 0) + `<path d="${pd(on(PZ(z + .02), ellUV(21, 35, 5, 5, 16)).slice(0, Math.ceil(16*st.chalk)), st.chalk >= 1)}" fill="none" stroke="#fffdf2" stroke-width="1.3"/>`; } }
  return s; }
function sawdust(){ const g = rnd(31); let s = ''; for (let i = 0; i < 90; i++){ const x = BX[0] + 12 + g()*(BX[1] - BX[0] - 24), y = BY[0] + 12 + g()*(BY[1] - BY[0] - 24), r = .5 + g()*1.3, c = g() < .5 ? '#f0d9ae' : '#b88f5c';
    s += fill(pd(on(PZ(BOARD_H + .03), ellUV(x, y, r*1.6, r, 6))), c); } return s; }
function coasters(x, y){ const n = 6; let s = ''; for (let i = 0; i < n; i++) s += cyl(x, y, BOARD_H + i*2.3, BOARD_H + (i + 1)*2.3 - .2, 11, i % 2 ? BLOND : MAH, toneI, .9, 24); return { box:[[x - 11, y - 11, BOARD_H], [x + 11, y + 11, BOARD_H + n*2.3]], svg:s }; }
function holder(x, y){ const s = box(x - 7, y - 11, BOARD_H, x + 7, y + 11, BOARD_H + 3.6, MAH, toneI, 1) + shape([[x - 6, y - 8, BOARD_H + 3.6], [x - 6, y + 8, BOARD_H + 3.6], [x - 9.5, y + 8, BOARD_H + 24], [x - 9.5, y - 8, BOARD_H + 24]], '#2f2a25', 1.1) + shape([[x - 5.8, y - 7, BOARD_H + 5.2], [x - 5.8, y + 7, BOARD_H + 5.2], [x - 9, y + 7, BOARD_H + 22.8], [x - 9, y - 7, BOARD_H + 22.8]], '#8fd1c4', .5);
  return { box:[[x - 10, y - 11, BOARD_H], [x + 7, y + 11, BOARD_H + 24]], svg:s }; }
function cupcake(x, y){ const z = BOARD_H; let s = rod([x, y, z], [x, y, z + 8], 6.2, CREAMM, toneI, 1, 8.2, 22);
  s += rod([x, y, z + 8], [x, y, z + 12.5], 9, CUPM, toneI, 1, 6, 22) + rod([x, y, z + 12.5], [x, y, z + 15.5], 6, CUPM, toneI, .9, 2.5, 18) + ball(x, y, z + 17.4, 2.1, '#d8432f', .8);
  return { box:[[x - 9, y - 9, z], [x + 9, y + 9, z + 19.5]], svg:s }; }
function pencil(x, y){ return { box:[[x, y - 1, BOARD_H], [x + 30, y + 8, BOARD_H + 2]], svg:rod([x, y, BOARD_H + 1], [x + 28, y + 6, BOARD_H + 1], .9, { l:'#f4b829', m:'#d39c1e', d:'#8c6510' }, toneI, .7) }; }

/* a rack of three tall test tubes. hot: 0..1 per tube, liquid goes from blue to the label colour. fx: what the test is doing now */
const TUBE_DY = [-12, 0, 12];
function testRack(x, y, hot, fx){ const z = BOARD_H; let s = box(x - 8, y - 19, z, x + 8, y + 19, z + 5, BLOND, toneI, 1.1);
  const tubes = TUBE_DY.map((dy, i) => { const yy = y + dy, liquid = mix('#7fb7d8', '#f4b829', hot[i]);
    let t = rod([x, yy, z + 4], [x, yy, z + 20], 3, matOf(liquid), toneI, .7);
    if (i === 1) for (let b = 0; b < 5; b++){ const u = (fx.bubble + b/5) % 1; if (fx.bubbling) t += ball(x + Math.sin(b*2.1)*1.2, yy + Math.cos(b*1.7)*1.2, z + 6 + 14*u, .7 + .3*b/5, '#ffffff', .4); }
    t += rod([x, yy, z + 4], [x, yy, z + 38], 3.7, CLEAR, (n, m) => m.l, 1).replace(/fill="#[0-9a-f]+"/g, 'fill="#dff1f5" fill-opacity=".26"');
    return { box:[[x - 4, yy - 4, z + 4], [x + 4, yy + 4, z + 38]], svg:t }; });
  s += byDepth(tubes);
  // the dropper over the first tube, and its drops
  if (fx.dropper > 0){ const yy = y + TUBE_DY[0], zT = z + 66 - 14*fx.dropper; s += `<g opacity="${f(fx.dropper)}">` + rod([x, yy, zT], [x, yy, zT - 16], 1.3, CLEAR, toneI, .8) + rod([x, yy, zT], [x, yy, zT + 7], 2.5, { l:'#e36a4d', m:'#c64f33', d:'#7c2c1e' }, toneI, .8) + '</g>';
    if (fx.drop >= 0) s += ball(x, yy, zT - 17 - (zT - 17 - (z + 20))*fx.drop*fx.drop, 1.2, '#7fd0a6', .5); }
  return s; }
/* a poison bottle: brown glass, cork, and a skull and crossbones label that always faces us */
function poisonBottle(x, y){ const z = BOARD_H, G_ = { l:'#8b5a33', m:'#6b4326', d:'#3d2513' };
  let s = rod([x, y, z], [x, y, z + 26], 10, G_, toneI, 1.5) + rod([x, y, z + 26], [x, y, z + 33], 10, G_, toneI, 1.2, 3.6) + rod([x, y, z + 33], [x, y, z + 39], 3.6, G_, toneI, 1) + rod([x, y, z + 38], [x, y, z + 44], 4.1, BLOND, toneI, 1, 3.5);
  const [X, Y] = P(x, y, z + 14), u = unitPx(), lw = u*.55, sk = u*3.6, cy = Y - sk*.25;
  s += `<rect x="${f(X - u*8.4)}" y="${f(Y - u*9.6)}" width="${f(u*16.8)}" height="${f(u*19.2)}" rx="${f(u*1.4)}" fill="#fff4d6" stroke="${INK}" stroke-width="${f(lw)}"/>`;
  const bone = (a, b, c, d) => `<path d="M${f(X + a*u)} ${f(Y + b*u)}L${f(X + c*u)} ${f(Y + d*u)}" stroke="${INK}" stroke-width="${f(u*1.5)}" stroke-linecap="round"/>`;
  s += bone(-6, 3.4, 6, 8) + bone(6, 3.4, -6, 8);
  s += `<circle cx="${f(X)}" cy="${f(cy)}" r="${f(sk)}" fill="#ffffff" stroke="${INK}" stroke-width="${f(lw)}"/><rect x="${f(X - sk*.55)}" y="${f(cy + sk*.7)}" width="${f(sk*1.1)}" height="${f(sk*.6)}" fill="#ffffff" stroke="${INK}" stroke-width="${f(lw*.8)}"/>`;
  s += `<circle cx="${f(X - sk*.4)}" cy="${f(cy - sk*.05)}" r="${f(sk*.27)}" fill="${INK}"/><circle cx="${f(X + sk*.4)}" cy="${f(cy - sk*.05)}" r="${f(sk*.27)}" fill="${INK}"/><path d="M${f(X)} ${f(cy + sk*.22)}l${f(-sk*.13)} ${f(sk*.28)}h${f(sk*.26)}Z" fill="${INK}"/>`;
  return s; }
/* bundles of money in a growing pile: n bundles, three by two a layer */
const CASH = { l:'#8fc77f', m:'#68a65b', d:'#3b6f35' };
function cashPile(x, y, n){ const items = []; for (let i = 0; i < n; i++){ const c = i % 6, lay = Math.floor(i/6), col = c % 3, row = Math.floor(c/3), bx0 = x + (row - 1)*9 + (lay % 2 ? 1.5 : 0), by0 = y + (col - 1.5)*18 + (lay % 2 ? -1.5 : 0), z0 = BOARD_H + lay*3.7;
    let b = box(bx0, by0, z0, bx0 + 8.6, by0 + 17, z0 + 3.5, CASH, toneI, .75);
    b += fill(pd([[bx0 + .01, by0 + 6.6, z0 + 3.52], [bx0 + 8.6, by0 + 6.6, z0 + 3.52], [bx0 + 8.6, by0 + 10.4, z0 + 3.52], [bx0 + .01, by0 + 10.4, z0 + 3.52]]), '#fff4d6');
    items.push({ box:[[bx0, by0, z0], [bx0 + 8.6, by0 + 17, z0 + 3.5]], svg:b }); } return byDepth(items); }
