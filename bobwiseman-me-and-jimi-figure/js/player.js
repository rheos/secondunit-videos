/* The model: a belt-drive record player on a board, a toy train round it, a radio, a power strip.
   x = depth (front at x = W), y = width (+y goes screen left at the default view), z = up. About 2 units a cm.
   Real process: mains -> switch -> motor -> pulley -> belt -> sub-platter -> platter -> record; stylus in the groove ->
   cartridge -> arm wires -> preamp -> RCA jacks at the back.
   Parts, each held by another:
   CASE     plinth . four feet on the board . deck plate . hinged clear cover on two hinges at the back
   DRIVE    motor on the plinth floor . pulley on its shaft . belt round pulley and sub-platter . bearing well on the floor .
            sub-platter on the bearing's spindle . platter on the sub-platter . mat . spindle through it all
   ARM      pivot post on the deck . gimbal . arm tube . counterweight on the tube . headshell . cartridge . stylus . rest . cue lever
   POWER    mains lead through a grommet at the back . transformer on the floor . board with switch at the front . LED
   SIGNAL   arm wires down the pivot post . preamp board on standoffs . RCA jacks on the back panel */
const W = 90, D = 120, BOARD_H = 2, FOOT = 3, PZ0 = BOARD_H + FOOT, PZ1 = PZ0 + 20, COVER = PZ1 + 16;
const OUT = rrUV(0, PZ0, D, PZ1, 3);
const PLAT = [46, 48, 37], PIV = [15, 104], ARM_L = 73, ARM_REST = 2, ARM_PLAY = 34;
const BX = [-46, 128], BY = [-66, 160];
const RED = '#d8432f', CREAM = '#fff4d6', RECESS = '#2b2523';
const TRAINM = { l:'#ef6a4c', m:'#cf5038', d:'#7c2c1e' }, CARM = { l:'#76a0e2', m:'#5a82c6', d:'#2c3f70' };
const PCB = matOf('#3f7d5c'), COPPER = { l:'#f0b07a', m:'#d08a52', d:'#9a5a2c' }, GUN = { l:'#7c8389', m:'#5c6369', d:'#3b4146' }, RUB = { l:'#4a4640', m:'#35312c', d:'#221f1b' };

/* ---------- the train's path: a loop round the player, d = 0 at the switch on the near side, then a straight spur ---------- */
const LR = 16, X0 = -20, X1 = 110, Y0 = -20, Y1 = 140;
const SEG = [ { k:'l', a:[X1 - LR, Y0], h:[1, 0], n:0 }, { k:'c', c:[X1 - LR, Y0 + LR], a0:-90 }, { k:'l', a:[X1, Y0 + LR], h:[0, 1], n:Y1 - Y0 - 2*LR },
  { k:'c', c:[X1 - LR, Y1 - LR], a0:0 }, { k:'l', a:[X1 - LR, Y1], h:[-1, 0], n:X1 - X0 - 2*LR }, { k:'c', c:[X0 + LR, Y1 - LR], a0:90 },
  { k:'l', a:[X0, Y1 - LR], h:[0, -1], n:Y1 - Y0 - 2*LR }, { k:'c', c:[X0 + LR, Y0 + LR], a0:180 }, { k:'l', a:[X0 + LR, Y0], h:[1, 0], n:X1 - X0 - 2*LR } ];
const ARC = Math.PI * LR / 2;
const PERIM = SEG.reduce((a, s) => a + (s.k === 'l' ? s.n : ARC), 0);
function loopAt(d){ d = ((d % PERIM) + PERIM) % PERIM;
  for (const s of SEG){ const n = s.k === 'l' ? s.n : ARC; if (d <= n){
      if (s.k === 'l') return { x:s.a[0] + s.h[0]*d, y:s.a[1] + s.h[1]*d, hx:s.h[0], hy:s.h[1] };
      const a = (s.a0 + 90*d/ARC)*Math.PI/180; return { x:s.c[0] + LR*Math.cos(a), y:s.c[1] + LR*Math.sin(a), hx:-Math.sin(a), hy:Math.cos(a) }; }
    d -= n; } return loopAt(0); }
// d >= 0 is the spur (the train has left), d < 0 is still the loop
const trackAt = d => d >= 0 ? { x:X1 - LR + d, y:Y0, hx:1, hy:0 } : loopAt(d);
const groundZ = x => x <= BX[1] ? BOARD_H : x >= BX[1] + 12 ? 0 : BOARD_H*(1 - (x - BX[1])/12);

function rails(){ const off = 4; let a = [], b = [], sl = '';
  for (let d = 0; d < PERIM; d += 3){ const p = loopAt(d), nx = -p.hy, ny = p.hx; a.push([p.x + nx*off, p.y + ny*off, BOARD_H + .15]); b.push([p.x - nx*off, p.y - ny*off, BOARD_H + .15]); }
  for (let d = 0; d < PERIM; d += 9){ const p = loopAt(d), nx = -p.hy, ny = p.hx;
    sl += shape([[p.x + nx*6.2 - p.hx*1.3, p.y + ny*6.2 - p.hy*1.3, BOARD_H + .1], [p.x + nx*6.2 + p.hx*1.3, p.y + ny*6.2 + p.hy*1.3, BOARD_H + .1], [p.x - nx*6.2 + p.hx*1.3, p.y - ny*6.2 + p.hy*1.3, BOARD_H + .1], [p.x - nx*6.2 - p.hx*1.3, p.y - ny*6.2 - p.hy*1.3, BOARD_H + .1]], '#a97f52', .4); }
  // the spur runs straight off the board and over the paper, out of frame
  for (let x = X1 - LR + 12; x < 460; x += 9){ const z = groundZ(x) + .1; sl += shape([[x - 1.3, Y0 + 6.2, z], [x + 1.3, Y0 + 6.2, z], [x + 1.3, Y0 - 6.2, z], [x - 1.3, Y0 - 6.2, z]], '#a97f52', .4); }
  const spur = o => { const q = []; for (let x = X1 - LR; x < 460; x += 12) q.push([x, Y0 + o, groundZ(x) + .15]); return q; };
  return sl + ink(pd(a), 1.1) + ink(pd(b), 1.1) + ink(pd(spur(off), false), 1.1) + ink(pd(spur(-off), false), 1.1); }

/* an oriented box for a train car: centre (x, y), heading (hx, hy), length L, width Wd, from z0 to z1 */
function carCorners(c, L, Wd){ const nx = -c.hy, ny = c.hx, a = L/2, b = Wd/2;
  return [[c.x + c.hx*a + nx*b, c.y + c.hy*a + ny*b], [c.x - c.hx*a + nx*b, c.y - c.hy*a + ny*b], [c.x - c.hx*a - nx*b, c.y - c.hy*a - ny*b], [c.x + c.hx*a - nx*b, c.y + c.hy*a - ny*b]]; }
function obox(c, L, Wd, z0, z1, m, w = .8){ const q = carCorners(c, L, Wd), nx = -c.hy, ny = c.hx;
  const sides = [[[c.hx, c.hy, 0], q[0], q[3]], [[nx, ny, 0], q[1], q[0]], [[-c.hx, -c.hy, 0], q[2], q[1]], [[-nx, -ny, 0], q[3], q[2]]];
  let s = '';
  for (const [n, a, b] of sides) if (vis(n)) s += shape([[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], toneI(n, m), w);
  return s + shape(q.map(([x, y]) => [x, y, z1]), toneI([0, 0, 1], m), w); }
function trainParts(dHead){ const out = [];
  const head = trackAt(dHead), g = groundZ(head.x);
  // two passenger cars behind the locomotive, each rebuilt from the track so they round the corners
  for (const [off, kind] of [[0, 'loco'], [25, 'car'], [47, 'car']]){
    const c = trackAt(dHead - off), z = groundZ(c.x), L = kind === 'loco' ? 22 : 19, q = carCorners(c, L, 11);
    if (c.x > 470) continue;
    const xs = q.map(p => p[0]), ys = q.map(p => p[1]), top = z + (kind === 'loco' ? 19 : 13);
    let s = obox(c, L + 2, 10, z + 2, z + 4, RUB, .6);
    if (kind === 'loco'){
      s += obox({ ...c, x:c.x - c.hx*6.5, y:c.y - c.hy*6.5 }, 9, 11, z + 4, z + 16, TRAINM);
      s += obox({ ...c, x:c.x - c.hx*6.5, y:c.y - c.hy*6.5 }, 10.5, 12, z + 16, z + 17.2, RUB, .6);
      const a = [c.x - c.hx*1.5, c.y - c.hy*1.5, z + 9], b = [c.x + c.hx*10.5, c.y + c.hy*10.5, z + 9];
      s += rod(a, b, 5, TRAINM, toneI, .9);
      s += cyl(c.x + c.hx*7, c.y + c.hy*7, z + 13, z + 19, 2, RUB, toneI, .7, 12);
    } else {
      s += obox(c, L, 10, z + 4, z + 11.5, CARM);
      s += obox(c, L + .8, 11, z + 11.5, z + 13, { l:'#fff4d6', m:'#e6dcbd', d:'#bfb390' }, .6);
    }
    out.push({ box:[[Math.min(...xs), Math.min(...ys), z], [Math.max(...xs), Math.max(...ys), top]], svg:s });
  }
  return out; }

/* ---------- the record player ---------- */
const ring = (cx, cy, z, r, n = 40) => on(PZ(z), ellUV(cx, cy, r, r, n));
function feet(){ const p = [[8, 10], [8, D - 10], [W - 8, 10], [W - 8, D - 10]];
  return byDepth(p.map(([x, y]) => ({ box:[[x - 6, y - 6, BOARD_H], [x + 6, y + 6, PZ0]], svg:cyl(x, y, BOARD_H, PZ0, 5.5, RUB, toneI, .9, 18) }))); }
function plinth(st, m){ const FRONT = facing([1,0,0]), BACK = facing([-1,0,0]), SIDEL = facing([0,1,0]), SIDER = facing([0,-1,0]);
  let s = extrude(OUT, 0, W, m);
  if (FRONT){ s += fill(pd(on(PX(W), OUT)), tone([1,0,0], m)) + ink(pd(on(PX(W), OUT)), 2.2);
    // front: the maker's name, the cheque slot, power knob, 33/45, LED
    s += tx(W + .3, 100, PZ0 + 11, 'SPIN', 8.5, INK, 800) + tx(W + .3, 100, PZ0 + 6, 'STEREO', 3.4, INK, 700);
    s += shape(on(PX(W + .2), rrUV(24, PZ0 + 12, 88, PZ0 + 16, 1.4, 3)), RECESS, 1);
    s += cylX(W, W + 2.6, 15, PZ0 + 9, 4.6, CERAMIC, toneI, 1, 20);
    if (FRONT) s += ink(pd([[W + 2.7, 15, PZ0 + 9], [W + 2.7, 15 + 3.6*Math.sin(st.power*1.2 - .6), PZ0 + 9 + 3.6*Math.cos(st.power*1.2 - .6)]], false), 1);
    s += shape(on(PX(W + .2), ellUV(26, PZ0 + 6, 1.4, 1.4, 10)), st.power > .5 ? '#ff5b3a' : '#7b3a2c', .6);
    s += tx(W + .3, 66, PZ0 + 6.5, '33', 4, INK, 800) + tx(W + .3, 56, PZ0 + 6.5, '45', 4, mix(INK, tone([1,0,0], m), .5), 800);
  }
  if (BACK){ s += fill(pd(on(PX(0), OUT)), tone([-1,0,0], m)) + ink(pd(on(PX(0), OUT)), 2.2);
    // back panel: rating plate and RCA jacks
    s += shape(on(PX(-.2), rrUV(60, PZ0 + 5, 96, PZ0 + 15, 1.5, 3)), '#f3f0e6', .8);
    for (const [y, c] of [[72, '#e8e4da'], [84, '#c93a2a']]) s += cylX(-2.5, 0, y, PZ0 + 10, 2, matOf(c), toneI, .7, 12);
  }
  if (SIDEL) s += txY(W/2, D + .3, PZ0 + 7, 'SPIN', 7, mix(tone([0,1,0], m), '#000000', .5), 800);
  // deck plate on the top
  s += shape(on(PZ(PZ1 + .1), rrUV(5, 5, W - 5, D - 5, 3, 4)), mix(m.l, '#ffffff', .18), 1);
  return s + hullInk([...on(PX(0), OUT), ...on(PX(W), OUT)], 2.8); }
function platter(st){ const [cx, cy, r] = PLAT, z0 = PZ1 + .2, z1 = z0 + 4, zr = z1 + .8, a = st.spin;
  let s = cyl(cx, cy, z0, z1, r, METAL, toneI, 1.4, 48);
  // the strobe dots on the platter's rim go round, so a turning platter shows
  let dots = ''; for (let i = 0; i < 28; i++){ const t = a + i/28*2*Math.PI; const n = [Math.cos(t), Math.sin(t), 0];
    if (vis(n)) dots += fill(pd([[cx + r*n[0] + .1*n[0], cy + r*n[1] + .1*n[1], z0 + 1.4], [cx + r*n[0], cy + r*n[1], z0 + 2.8], [cx + r*Math.cos(t + .05), cy + r*Math.sin(t + .05), z0 + 2.8], [cx + r*Math.cos(t + .05), cy + r*Math.sin(t + .05), z0 + 1.4]]), INK); }
  s += dots;
  // the record: black, grooves, a highlight that holds still, a red label that turns
  const rr = r - 3; s += cyl(cx, cy, z1, zr, rr, DARK, toneI, 1, 48);
  for (const g of [.92, .8, .66, .52]) s += `<path d="${pd(ring(cx, cy, zr + .02, rr*g))}" fill="none" stroke="#6d675f" stroke-width=".5"/>`;
  const sh = (t0, t1, c) => { const q = [[cx + 12*Math.cos(t0), cy + 12*Math.sin(t0), zr + .03]]; for (let i = 0; i <= 8; i++){ const t = t0 + (t1 - t0)*i/8; q.push([cx + rr*.97*Math.cos(t), cy + rr*.97*Math.sin(t), zr + .03]); } q.push([cx + 12*Math.cos(t1), cy + 12*Math.sin(t1), zr + .03]); return fill(pd(q), c, 'opacity=".26"'); };
  s += sh(2.5, 3.0, '#ffffff') + sh(5.65, 6.15, '#ffffff');
  s += shape(ring(cx, cy, zr + .05, 11.5, 28), st.labelLit > 0 ? mix(RED, '#ff8a4a', st.labelLit) : RED, .8);
  s += fill(pd(ring(cx, cy, zr + .06, 8, 24)), mix(RED, '#ffffff', .2));
  const lb = (t, l) => fill(pd([[cx + 3.5*Math.cos(t - l), cy + 3.5*Math.sin(t - l), zr + .07], [cx + 10.6*Math.cos(t - l*.4), cy + 10.6*Math.sin(t - l*.4), zr + .07], [cx + 10.6*Math.cos(t + l*.4), cy + 10.6*Math.sin(t + l*.4), zr + .07], [cx + 3.5*Math.cos(t + l), cy + 3.5*Math.sin(t + l), zr + .07]]), CREAM);
  s += lb(a, .55) + lb(a + Math.PI, .55);
  s += cyl(cx, cy, zr, zr + 2.2, 1, METAL, toneI, .6, 10);
  return { box:[[cx - r, cy - r, z0], [cx + r, cy + r, zr + 2.2]], svg:s }; }
function armParts(st){ const [px, py] = PIV, z0 = PZ1 + .2, zTube = z0 + 8.4 + st.lift*2.6, ang = (ARM_REST + (ARM_PLAY - ARM_REST)*st.arm)*Math.PI/180;
  const dx = Math.cos(ang), dy = -Math.sin(ang), tip = [px + dx*ARM_L, py + dy*ARM_L], back = [px - dx*15, py - dy*15];
  const parts = [];
  parts.push({ box:[[px - 8, py - 8, z0], [px + 8, py + 8, z0 + 8]], svg:cyl(px, py, z0, z0 + 3, 7.4, DARK, toneI, 1.1, 22) + cyl(px, py, z0 + 3, z0 + 8, 2.6, METAL, toneI, .9, 14) });
  // the rest on its post, and the cue lever beside it
  parts.push({ box:[[px + 56, py - 1.5, z0], [px + 60, py + 1.5, z0 + 7]], svg:cyl(px + 58, py, z0, z0 + 7, 1.3, DARK, toneI, .7, 10) });
  parts.push({ box:[[px + 12, py + 5, z0], [px + 28, py + 9, z0 + 2]], svg:box(px + 12, py + 5, z0, px + 28, py + 9, z0 + 1.6, METAL, toneI, .7) });
  const tubeBox = [[Math.min(back[0], tip[0]) - 3, Math.min(back[1], tip[1]) - 3, zTube - 3], [Math.max(back[0], tip[0]) + 3, Math.max(back[1], tip[1]) + 3, zTube + 3]];
  // counterweight, tube and headshell go in the order the viewer needs: the end toward the viewer last
  const weight = rod([px - dx*8, py - dy*8, zTube], [px - dx*15, py - dy*15, zTube], 3.8, DARK, toneI, 1);
  const tube = rod([px - dx*8, py - dy*8, zTube], [tip[0] - dx*8, tip[1] - dy*8, zTube], .9, METAL, toneI, .8);
  const hx = tip[0] - dx*4, hy = tip[1] - dy*4, shell = obox({ x:hx, y:hy, hx:dx, hy:dy }, 11, 5, zTube - 1.4, zTube + .3, CARM, .7);
  const cart = obox({ x:hx + dx, y:hy + dy, hx:dx, hy:dy }, 6, 3.4, zTube - 3.4, zTube - 1.4, RUB, .5);
  const towardTip = vis([dx, dy, 0]);
  parts.push({ box:tubeBox, svg:towardTip ? weight + tube + cart + shell : cart + shell + tube + weight });
  parts.tip = [tip[0], tip[1], zTube];
  return parts; }
function cover(st, far){ const x0 = 1, x1 = W - 1, y0 = 1, y1 = D - 1, z0 = PZ1 + .4, z1 = COVER;
  const F = [ [[0,1,0], [[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]]], [[1,0,0], [[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]]],
    [[0,-1,0], [[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]]], [[-1,0,0], [[x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1]]] ];
  let s = ''; for (const [n, q] of F) if (vis(n) !== far) s += fill(pd(q), far ? '#cfe9f0' : '#dff1f5', `opacity="${far ? .18 : .16}"`) + `<path d="${pd(q)}" fill="none" stroke="${INK}" stroke-width="${far ? .7 : 1.1}" stroke-linejoin="round"/>`;
  if (far) return s;
  const top = [[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
  s += fill(pd(top), '#e4f4f7', 'opacity=".26"') + `<path d="${pd(top)}" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
  // two white streaks on the glass
  s += fill(pd([[20, 26, z1], [34, 26, z1], [70, 72, z1], [56, 72, z1]]), '#ffffff', 'opacity=".34"') + fill(pd([[40, 22, z1], [45, 22, z1], [79, 66, z1], [74, 66, z1]]), '#ffffff', 'opacity=".28"');
  // dust settles on the top: fixed specks, more of them as the years go by
  let d = ''; const n = Math.round(st.dust * DUST.length); for (let i = 0; i < n; i++){ const [x, y, r] = DUST[i]; d += pd([[x - r, y - r, z1], [x + r, y - r, z1], [x + r, y + r, z1], [x - r, y + r, z1]]); }
  if (d) s += fill(d, '#8d8571', 'opacity=".62"');
  return s; }
let rnd = 7; const R = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
const DUST = Array.from({ length:1500 }, () => [x0d(), 3 + R()*(D - 6), .25 + R()*.45]); function x0d(){ return 3 + R()*(W - 6); }

/* ---------- see-through: what is really inside ---------- */
const MZ = PZ0 + 1.6;
let MECH_ITEMS = [];
function wire(pts, col, w = .5){ const d = pd(pts, false); const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), zs = pts.map(p => p[2]);
  return { box:[[Math.min(...xs) - 1, Math.min(...ys) - 1, Math.min(...zs) - 1], [Math.max(...xs) + 1, Math.max(...ys) + 1, Math.max(...zs) + 1]],
    svg:`<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(2*w + 1)}" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${f(2*w)}" stroke-linejoin="round" stroke-linecap="round"/>` }; }
function mech(st){ const parts = [], put = (b, svg) => parts.push({ box:b, svg }), bx = (x0, y0, z0, x1, y1, z1, m, w = .8) => put([[x0, y0, z0], [x1, y1, z1]], box(x0, y0, z0, x1, y1, z1, m, toneI, w));
  const [cx, cy] = PLAT, on_ = st.power > .5, motor = [13, 13], live = on_ ? '#ff6a2a' : '#8a3a24', audio = st.arm > .9 && on_;
  // floor pan
  bx(4, 4, PZ0 + .6, W - 4, D - 4, MZ, matOf('#d7d2c4'), .6);
  // sub-platter on its bearing
  put([[cx - 7, cy - 7, MZ], [cx + 7, cy + 7, PZ1 - 7]], cyl(cx, cy, MZ, PZ1 - 7, 4.4, GUN, toneI, .9, 20));
  put([[cx - 26, cy - 26, PZ1 - 7], [cx + 26, cy + 26, PZ1 - 2]], cyl(cx, cy, PZ1 - 7, PZ1 - 2, 25, METAL, toneI, 1, 40));
  // motor, shaft, pulley
  put([[motor[0] - 8, motor[1] - 8, MZ], [motor[0] + 8, motor[1] + 8, PZ1 - 9]], cyl(motor[0], motor[1], MZ, PZ1 - 9, 7.5, COPPER, toneI, 1, 20));
  put([[motor[0] - 2.5, motor[1] - 2.5, PZ1 - 9], [motor[0] + 2.5, motor[1] + 2.5, PZ1 - 3.5]], cyl(motor[0], motor[1], PZ1 - 9, PZ1 - 3.5, 2.2, METAL, toneI, .7, 12));
  // the belt: two straight runs tangent to pulley and sub-platter
  { const zb = PZ1 - 5, dxb = cx - motor[0], dyb = cy - motor[1], L = Math.hypot(dxb, dyb), ux = dxb/L, uy = dyb/L, nx = -uy, ny = ux;
    const run = s => [[motor[0] + nx*2.4*s, motor[1] + ny*2.4*s, zb], [cx + nx*25*s, cy + ny*25*s, zb]];
    const col = on_ ? '#1e1b18' : '#35312c';
    parts.push(wire(run(1), col, .55)); parts.push(wire(run(-1), col, .55)); }
  // transformer and mains lead in at the back
  bx(10, 56, MZ, 26, 76, PZ1 - 8, GUN, 1); bx(13, 58, PZ1 - 8, 23, 74, PZ1 - 6.5, COPPER, .7);
  parts.push(wire([[0, 20, PZ0 + 7], [6, 20, MZ + .4], [6, 62, MZ + .4], [10, 62, MZ + 3]], live));
  // switch at the front, on a small board
  bx(W - 12, 9, MZ, W - 4, 22, PZ0 + 13, matOf('#e8e4da'), .7);
  put([[W - 4, 13, PZ0 + 7], [W, 17, PZ0 + 11]], rod([W - 4, 15, PZ0 + 9], [W, 15, PZ0 + 9], 1, METAL, toneI, .6));
  parts.push(wire([[26, 66, PZ1 - 8], [40, 92, MZ + .4], [W - 8, 92, MZ + .4], [W - 8, 20, MZ + .4]], live));
  parts.push(wire([[W - 8, 12, MZ + .4], [36, 12, MZ + .4], [motor[0] + 7, motor[1] - 4, MZ + 3]], live));
  // preamp board on standoffs with capacitors and chips
  for (const [x, y] of [[48, 88], [48, 110], [76, 88], [76, 110]]) put([[x - 1, y - 1, MZ], [x + 1, y + 1, MZ + 4]], cyl(x, y, MZ, MZ + 4, .8, METAL, toneI, .4, 8));
  bx(46, 86, MZ + 4, 78, 112, MZ + 5, PCB, .8);
  for (const [x, y, h, c] of [[52, 92, 6, CARM], [60, 92, 6, CARM], [68, 92, 4, TRAINM], [52, 104, 4, TRAINM]]) put([[x - 2.5, y - 2.5, MZ + 5], [x + 2.5, y + 2.5, MZ + 5 + h]], cyl(x, y, MZ + 5, MZ + 5 + h, 2.2, c, toneI, .6, 12));
  bx(60, 100, MZ + 5, 72, 108, MZ + 7, RUB, .6);
  // arm wires down the pivot post to the preamp, then out to the RCA jacks at the back
  parts.push(wire([[PIV[0], PIV[1], PZ1], [PIV[0], PIV[1], MZ + 3], [46, 104, MZ + 5.4]], audio ? '#ffb340' : '#c93a2a', .4));
  parts.push(wire([[48, 96, MZ + 5.4], [6, 84, MZ + 3], [0, 84, PZ0 + 10]], audio ? '#ffb340' : '#c93a2a', .4));
  parts.push(wire([[48, 94, MZ + 5.4], [8, 72, MZ + 3], [0, 72, PZ0 + 10]], audio ? '#ffb340' : '#efe9da', .4));
  const sb = byDepth(parts);
  MECH_ITEMS = [
    { at:[motor[0], motor[1], PZ1 - 12], text:'MOTOR', on:on_ }, { at:[motor[0] + 3, motor[1] + 10, PZ1 - 5], text:'BELT', on:on_ },
    { at:[10, 66, PZ1 - 8], text:'TRANSFORMER', on:on_ }, { at:[W - 8, 12, PZ0 + 13], text:'SWITCH', on:on_ },
    { at:[PIV[0] + 40, PIV[1] - 12, PZ1 + 10], text:'TONEARM', on:st.arm > .05 }, { at:[62, 110, MZ + 5], text:'PREAMP', on:audio },
    { at:[0, 84, PZ0 + 10], text:'RCA JACKS', on:audio } ];
  return sb; }
