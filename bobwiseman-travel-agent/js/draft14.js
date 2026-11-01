// Draft 14 (2026-10-15): Bob's three notes on draft 13 (review item ta-draft-13).
// 1. Small embellishments by Mary Margaret O'Hara (voice) and Wayne Cass (electric guitar), touched here and there.
//    Cass: his licks draw themselves as a ribbon of smoke, its height following his notes (pitch-tracked off the Demucs
//    guitar stem), a guitar pick at the live tip. It starts as the smoke in his room (0.2 s, 3.5 s) and comes back on
//    the fork road (168.5 s) and over the film reel (257.2 s). O'Hara: her long high line at 314.5 joins the signed-off
//    echo (ohara-echo.js).
// 2. The first minute tells his depression: his room at noon, stoned under his cloud; then the trick he does on a stage
//    that makes another man rich and famous (the stick and carrot later make it plain). Replaces a_street, a_sTraveller.
// 3. The violin that comes out of nowhere (126.4-132.5, and 241.9-247.1; Bob heard 2:06-2:13 and 4:04) is seen: it rises
//    out of the record, is drawn in the groove schematic, plays over the mule; later it appears in the airfield sky and
//    in the boarding schematic. The bow turns on the notes (onsets off the instrumental stems).
// Loaded after the act files and before ohara-echo.js.
'use strict';

// ---------- the violin ----------
// Local units ~mm: the body bottom (tail) at (0,0), the scroll at (0,-555). o: {sch, col, bow: -1..1 (bow travel)}
const VLN_R = [[0, 0], [42, -4], [78, -18], [98, -44], [104, -78], [98, -112], [82, -138], [62, -152], [56, -168], [56, -190], [62, -206], [78, -220], [86, -246], [84, -276], [72, -308], [48, -334], [20, -350], [0, -354]];
function violin(x, y, s, rot, o = {}) {
  if (s <= .01) return;
  const k = 1 / s, S = sty(o, k), sch = S.sch, wood = '#b5652b';
  X.save(); X.translate(x, y); X.rotate(rot); X.scale(s, s);
  const body = VLN_R.concat(VLN_R.slice(1, -1).reverse().map(([a, b]) => [-a, b])), bp = PP(body);
  // neck under the fingerboard, pegbox, scroll
  const nk = PP([[-12, -340], [12, -340], [9, -486], [-9, -486]]); S.F(nk, wood); S.OP([[-12, -340], [-9, -486], [9, -486], [12, -340]], false, 1.8);
  S.F(bp, wood); S.SH(bp, 0, -180, 200, [-18, 10], .7, 5); S.OP(dens(body, 18, true), true, 2.6);
  if (!sch) iP(dens(body.map(([a, b]) => [a * .93, -177 + (b + 177) * .95]), 18, true), true, '#5a3a22', 1 * k, .6, false, .5);
  else iP(dens(body.map(([a, b]) => [a * .93, -177 + (b + 177) * .95]), 18, true), true, S.col, .7 * k, .5, false, .3);
  // f-holes
  for (const sx of [-1, 1]) { X.beginPath(); wP([[sx * 34, -140], [sx * 28, -156], [sx * 34, -176], [sx * 44, -196], [sx * 38, -214]], false, .4 * k); stroke(S.INK, 3 * k, .95); fillP(PE(sx * 34, -140, 4, 4), S.INK, .95); fillP(PE(sx * 38, -214, 4, 4), S.INK, .95); }
  // tailpiece, bridge, fingerboard
  const tp = PP([[-13, -12], [13, -12], [19, -78], [-19, -78]]); S.F(tp, '#2a2320'); S.OP([[-13, -12], [13, -12], [19, -78], [-19, -78]], true, 1.6);
  const fb = PP([[-13, -176], [13, -176], [9, -486], [-9, -486]]); S.F(fb, '#2a2320'); S.OP([[-13, -176], [13, -176], [9, -486], [-9, -486]], true, 1.6);
  const br = PP([[-27, -128], [27, -128], [22, -144], [-22, -144]]); S.F(br, '#efd9b9'); S.OP([[-27, -128], [27, -128], [22, -144], [-22, -144]], true, 1.6);
  const pb = PP([[-10, -486], [10, -486], [8, -540], [-8, -540]]); S.F(pb, wood); S.OP([[-10, -486], [10, -486], [8, -540], [-8, -540]], true, 1.6);
  for (const [py, sx] of [[-496, -1], [-508, 1], [-520, -1], [-532, 1]]) { const pg = PE(sx * 17, py, 10, 4); S.F(pg, '#2a2320'); S.OL(sx * 17, py, 10, 4, 0, 1.4); }
  const sc = PE(1, -556, 17, 17); S.F(sc, wood); S.OL(1, -556, 17, 17, 0, 1.8);
  const sp = []; for (let i = 0; i <= 40; i++) { const t = i / 40, an = -Math.PI / 2 + t * TAU * 1.8, r = lerp(16, 2.5, t); sp.push([1 + Math.cos(an) * r, -556 + Math.sin(an) * r]); } S.OP(sp, false, 1.6);
  // strings: they shiver while the bow is on them
  const on = o.bow !== undefined;
  for (let i = 0; i < 4; i++) { const xb = lerp(-14, 14, i / 3), xt = lerp(-6, 6, i / 3); X.beginPath(); X.moveTo(xb, -78); X.lineTo(lerp(xb, xt, .5) + (on ? jit(1.6) : 0), -280); X.lineTo(xt, -486); stroke(sch ? S.col : C.cream, 1.1 * k, .9); }
  if (on) {
    // the bow: contact between the bridge and the fingerboard, travel u along its length
    const cy = -160, ba = .1, dx = Math.cos(ba), dy = Math.sin(ba), L = 330, cx0 = -o.bow * 250 * dx, cy0 = cy - o.bow * 250 * dy;
    const h0 = [cx0 - dx * L, cy0 - dy * L], h1 = [cx0 + dx * L, cy0 + dy * L], nx = dy, ny = -dx;
    X.beginPath(); X.moveTo(h0[0], h0[1]); X.lineTo(h1[0], h1[1]); stroke(sch ? S.col : '#f2ead6', 2.4 * k, .95);
    X.beginPath(); X.moveTo(h0[0] + nx * 16, h0[1] + ny * 16); X.quadraticCurveTo(cx0 + nx * 6, cy0 + ny * 6, h1[0] + nx * 12, h1[1] + ny * 12); stroke(S.INK, 4.4 * k, 1);
    X.beginPath(); X.moveTo(h1[0] + nx * 12, h1[1] + ny * 12); X.lineTo(h1[0], h1[1]); stroke(S.INK, 3 * k, 1);
    const fr = PP([[h0[0], h0[1]], [h0[0] + dx * 34, h0[1] + dy * 34], [h0[0] + dx * 34 + nx * 18, h0[1] + dy * 34 + ny * 18], [h0[0] + nx * 18, h0[1] + ny * 18]]);
    S.F(fr, '#2a2320'); S.OP([[h0[0], h0[1]], [h0[0] + dx * 34, h0[1] + dy * 34], [h0[0] + dx * 34 + nx * 18, h0[1] + dy * 34 + ny * 18], [h0[0] + nx * 18, h0[1] + ny * 18]], true, 1.4);
    // sound off the strings
    for (let i = 0; i < 3; i++) { const r = 70 + i * 34 + ((FD * 7) % 34); X.beginPath(); X.arc(0, cy, r, -.5, .5); stroke(sch ? S.col : C.teal, 1.8 * k, .7 - i * .18); X.beginPath(); X.arc(0, cy, r, Math.PI - .5, Math.PI + .5); stroke(sch ? S.col : C.teal, 1.8 * k, .7 - i * .18); }
  }
  X.restore();
}
// bow travel across a list of note onsets: the bow turns on each note
function bowU(T, ons) {
  if (T < ons[0]) return .8;
  for (let i = 0; i < ons.length - 1; i++) if (T < ons[i + 1]) { const f = eio((T - ons[i]) / (ons[i + 1] - ons[i])); return (i % 2 ? 1 : -1) * lerp(-.8, .8, f); }
  return (ons.length - 2) % 2 ? .8 : -.8;
}
// it comes out of nowhere: a pop of ink rings where it appears
function popRings(x, y, T, t0, col = C.ink, sz = 1) { const u = (T - t0) / .5; if (u < 0 || u > 1) return; for (let i = 0; i < 3; i++) { const r = (20 + i * 26 + u * 90) * sz; iE(x, y, r, r * .8, 0, col, 2, (1 - u) * (.9 - i * .25), false); } }
const V1 = [126.4, 127.3, 128.2, 128.6, 129.05, 129.6, 130.0, 130.45, 130.95, 131.8, 132.5];   // 2:06 - 2:13
const V2 = [242.0, 242.6, 243.22, 243.7, 244.1, 244.53, 244.95, 245.4, 245.82, 246.4, 247.1];  // 4:02 - 4:07

// ---------- Wayne Cass: the ribbon ----------
// Notes [t0, t1, midi] from the guitar stem (pyin). The ribbon draws on in time, a held note gets a vibrato wave,
// a short gap between notes is a bend; it drifts up and fades after the lick.
const CASS = {
  room1: [[0.17, 0.24, 65.2], [0.25, 0.62, 69.1], [0.63, 1.28, 71.3], [1.36, 1.48, 57.3], [1.47, 1.62, 59.2], [1.62, 1.74, 57.3], [1.75, 1.99, 53.4], [1.98, 2.03, 52.4], [2.04, 2.29, 56.2], [2.28, 2.6, 54.1], [2.61, 2.77, 55.5], [2.76, 3.01, 56.5]],
  room2: [[3.51, 3.67, 71.1], [3.7, 3.88, 69.1], [4.01, 4.9, 52.2]],
  fork: [[168.47, 168.53, 52.0], [168.53, 168.66, 53.0], [168.65, 168.8, 52.2], [168.8, 168.85, 55.7], [168.84, 168.93, 55.0], [169.01, 169.17, 55.2], [169.18, 169.3, 52.2], [169.34, 169.51, 62.2], [169.5, 169.57, 61.2], [169.59, 170.52, 57.5]],
  reel: [[257.17, 257.3, 60.2], [257.3, 257.35, 63.1], [257.34, 257.42, 64.7], [257.43, 257.57, 67.1], [257.6, 257.81, 74.2], [257.81, 258.17, 71.2], [258.42, 258.49, 68.5], [258.48, 258.56, 67.8], [258.55, 258.67, 66.9], [258.75, 258.85, 64.8], [258.9, 259.0, 67.1], [259.08, 259.14, 61.8], [259.13, 259.38, 60.0], [259.37, 259.43, 59.1]],
};
function guitarPick(x, y, r, a = 1) {
  X.beginPath(); X.moveTo(x, y + r * 1.15); X.quadraticCurveTo(x - r * 1.25, y - r * .1, x - r * .62, y - r * .86); X.quadraticCurveTo(x, y - r * 1.2, x + r * .62, y - r * .86); X.quadraticCurveTo(x + r * 1.25, y - r * .1, x, y + r * 1.15);
  X.globalAlpha = a; X.fillStyle = C.orange; X.fill(); X.globalAlpha = 1; stroke(C.ink, 2, a);
}
function cassRibbon(notes, T, o) {
  if (T < notes[0][0]) return;
  const end = notes[notes.length - 1][1], fade = 1 - cl((T - end - (o.hold ?? .5)) / .9); if (fade <= 0) return;
  // o.vert: time runs up the screen (smoke rising) and pitch sways it sideways; otherwise time runs left to right
  const pos = (t, m) => o.vert ? [o.x0 + (m - o.m0) * o.pym, o.y0 - (t - o.t0) * o.pxs] : [o.x0 + (t - o.t0) * o.pxs, o.y0 - (m - o.m0) * o.pym];
  const segs = []; let cur = [], live = false;
  notes.forEach(([a, b, m], i) => {
    if (a > T) return;
    const prev = notes[i - 1];
    if (prev && a - prev[1] > .12) { if (cur.length) segs.push(cur); cur = []; }
    const bb = Math.min(b, T); if (T >= a && T <= b + .03) live = true;
    for (let t = a; t <= bb + 1e-6; t += .02) {
      const vib = b - a > .25 ? Math.sin((t - a) * 34) * .45 * cl((t - a) / .2) : 0, [x, y] = pos(t, m + vib), age = T - t;
      cur.push(o.vert ? [x + Math.sin(t * 3 + T) * age * (o.drift || 0), y - age * (o.rise || 0)] : [x, y - age * (o.drift || 0)]);
    }
  });
  if (cur.length) segs.push(cur);
  // soften: a note change becomes a bend, not a step
  const soft = (sg) => sg.map((_, i) => { let sx = 0, sy = 0, n = 0; for (let j = Math.max(0, i - 6); j <= Math.min(sg.length - 1, i + 6); j++) { sx += sg[j][0]; sy += sg[j][1]; n++; } return [sx / n + jit(.6), sy / n + jit(.6)]; });
  const out = segs.filter((sg) => sg.length > 1).map(soft);
  for (const sg of out) {
    // an outlined ribbon of smoke: ink edge, pale body, a thin second line down its middle
    path(sg, C.ink, o.w * 6.4, .85 * fade);
    path(sg, o.under || '#ece6d6', o.w * 4.8, fade);
    path(sg.map(([x, y]) => [x + jit(.8), y + jit(.8)]), '#b9b0a0', o.w * .6, .7 * fade);
  }
  if (live && out.length) { const sg = out[out.length - 1], [tx, ty] = sg[sg.length - 1]; guitarPick(tx + 2, ty - 6, o.pick || 13, fade); }
}

// ---------- 0.0 his room at noon (new) ----------
// The curtains drawn on a bright day, the cloud under his own ceiling, rain on the couch; a joint in the ashtray, and
// its smoke is the guitar line. Stoned and stuck, before the song asks for anywhere.
SU.a_room = { mode: 'ill', f(q, p, a, T) {
  stripes('#d6c9ac', '#c9b998', 110, 1.5708, 0, C.dark);
  cam(900, 560, lerp(1.0, 1.07, eio(p)));
  const fy = 900;
  // ceiling cornice
  const cn = PR(-200, -200, W + 400, 330); fillP(cn, '#cbbb98'); hatch(cn, 960, 40, 1400, 0, 9, C.ink, .8, .35); iline(-200, 130, W + 200, 130, C.ink, 2.6); iline(-200, 146, W + 200, 146, C.ink, 1.4, .7, false);
  // the window, curtains drawn; one blade of daylight through the gap
  const wx = 1380, ww = 430, wy = 210, wh = 520;
  fillP(PR(wx, wy, ww, wh), '#f3e3b8'); iBox(wx - 12, wy - 12, ww + 24, wh + 24, C.ink, 2.6);
  const gap = 1590 + Math.sin(T * 1.3) * 3;
  for (const [x0, x1] of [[wx - 60, gap - 6], [gap + 6, wx + ww + 60]]) {
    const cp = PP([[x0, wy - 40], [x1, wy - 40], [x1 + (x1 > gap ? 10 : -4), wy + wh + 60], [x0, wy + wh + 60]]); fillP(cp, C.brick); shade(cp, (x0 + x1) / 2, wy + 300, 400, [x1 > gap ? 18 : -18, 0], 1.57, 6);
    X.beginPath(); for (let fx = x0 + 34; fx < x1 - 10; fx += 46) { X.moveTo(fx, wy - 30); X.quadraticCurveTo(fx + 8, wy + 260, fx - 4, wy + wh + 56); } stroke(C.ink, 1.6, .55);
    iP(dens([[x0, wy - 40], [x1, wy - 40], [x1, wy + wh + 60], [x0, wy + wh + 60]], 40, true), true, C.ink, 2.4);
  }
  iline(wx - 90, wy - 44, wx + ww + 90, wy - 44, C.ink, 6); for (const rx of [wx - 90, wx + ww + 90]) fillP(PE(rx, wy - 44, 9, 9), C.ink);
  // floor and skirting
  const fl = PR(-200, fy, W + 400, 400); fillP(fl, '#8f7656'); hatch(fl, 960, fy + 120, 1400, 0, 7, C.ink, .9, .45);
  X.beginPath(); for (let i = -10; i < 22; i++) { X.moveTo(i * 120, fy); X.lineTo(i * 120 - 260, H + 120); } stroke(C.ink, 1.2, .4);
  fillP(PR(-200, fy - 34, W + 400, 34), '#b39b74'); iline(-200, fy - 34, W + 200, fy - 34, C.ink, 1.8); iline(-200, fy, W + 200, fy, C.ink, 3);
  fillP(PP([[gap - 18, fy], [gap + 18, fy], [gap - 300, H + 60], [gap - 420, H + 60]]), C.wax, .6);
  // the clock: mid-afternoon
  const ckx = 1160, cky = 330; fillP(PE(ckx, cky, 54, 54), C.cream); iE(ckx, cky, 54, 54, 0, C.ink, 3); ticks(ckx, cky, 44, 12, 6, C.ink, .9, 1.6);
  iline(ckx, cky, ckx + 26, cky - 15, C.ink, 4, 1, false); iline(ckx, cky, ckx + 22, cky - 38, C.ink, 2.4, 1, false); fillP(PE(ckx, cky, 5, 5), C.ink);
  // unopened mail by the wall
  for (const [ex, ey, er] of [[150, 950, .1], [230, 978, -.2], [118, 1010, .3]]) { X.save(); X.translate(ex, ey); X.rotate(er); fillP(PR(-46, -26, 92, 52), C.cream); iBox(-46, -26, 92, 52, C.ink, 1.8); iP([[-46, -26], [0, 4], [46, -26]], false, C.ink, 1.2, .7, false); fillP(PR(26, -20, 14, 16), C.rose); X.restore(); }
  // the couch
  const sx0 = 500, sx1 = 1110, seat = 750;
  const bk = PP([[sx0 + 20, seat], [sx0 + 26, 584], [(sx0 + sx1) / 2, 560], [sx1 - 26, 584], [sx1 - 20, seat]]); fillP(bk, C.plum); shade(bk, (sx0 + sx1) / 2, 650, 340, [0, -18], .9, 6); iP(dens([[sx0 + 20, seat], [sx0 + 26, 584], [(sx0 + sx1) / 2, 560], [sx1 - 26, 584], [sx1 - 20, seat]], 30), false, C.ink, 2.6);
  const st = PR(sx0, seat, sx1 - sx0, 70); fillP(st, '#6e4c5d'); hatch(st, (sx0 + sx1) / 2, seat + 35, 340, .9, 6, C.ink, .9, .4); iBox(sx0, seat, sx1 - sx0, 70, C.ink, 2.4); iline((sx0 + sx1) / 2, seat + 6, (sx0 + sx1) / 2, seat + 64, C.ink, 1.6, .7, false);
  for (const ax of [sx0 - 34, sx1 - 36]) { const ar = PP([[ax, 676], [ax + 70, 676], [ax + 70, seat + 70], [ax, seat + 70]]); fillP(ar, C.plum); shade(ar, ax + 35, 720, 80, [-10, 0], .9, 5); iP(dens([[ax, seat + 70], [ax, 690], [ax + 8, 672], [ax + 62, 672], [ax + 70, 690], [ax + 70, seat + 70]], 20), false, C.ink, 2.4); }
  for (const lx of [sx0 - 20, sx1 + 16]) { fillP(PR(lx, seat + 70, 14, fy - seat - 70), '#3a2617'); }
  // rain off the couch: the puddle grows
  const pd = PE(800, fy + 34, lerp(220, 300, p), 20); fillP(pd, C.sky); hatch(pd, 800, fy + 34, 300, 0, 4, C.cream, 1.2, .6); iE(800, fy + 34, lerp(220, 300, p), 20, 0, C.ink, 1.6, .9, false);
  for (let i = 0; i < 5; i++) { const r2 = M32(i * 31 + 7), rx = 620 + r2() * 360, ph = ((T * 1.4 + r2()) % 1); iE(rx, fy + 34, 6 + ph * 40, (6 + ph * 40) * .25, 0, C.teal, 1.4, (1 - ph) * .8, false); }
  // him, slumped into the cushions, hat on, looking at nothing
  X.save(); X.translate(780, seat); X.rotate(-.09); X.translate(-780, -seat);
  traveller(780, fy, 1, { sit: true, look: -.5, armL: [.02, -.05], armR: [.08, .35], case: false });
  X.restore();
  cloud(800, 418, .82, { rain: true });
  // the side table, the ashtray, the joint
  const tx = 330, ty = 712; iline(tx, ty + 10, tx, fy - 4, C.ink, 7); iline(tx - 50, fy - 4, tx + 50, fy - 4, C.ink, 5);
  const tt = PE(tx, ty, 96, 20); fillP(tt, '#7a5434'); hatch(tt, tx, ty, 100, .2, 5, C.ink, .9, .35, [0, -6]); iE(tx, ty, 96, 20, 0, C.ink, 2.4);
  const at = PE(tx, ty - 8, 38, 10); fillP(at, '#9aa0a8'); iE(tx, ty - 8, 38, 10, 0, C.ink, 2); fillP(PE(tx, ty - 9, 24, 5), '#5b5f66');
  const jx0 = tx + 4, jy0 = ty - 13, jx1 = tx + 58, jy1 = ty - 22; iline(jx0, jy0, jx1, jy1, C.ink, 8, 1, false); iline(jx0, jy0, jx1, jy1, '#efe5cd', 5, 1, false); fillP(PE(jx1, jy1, 4.5, 4.5), C.orange); iE(jx1, jy1, 5, 5, 0, C.ink, 1.4, 1, false);
  // smoke: a lazy curl up from the joint, and from 0.17 s on it is Wayne Cass's lick
  const sm = []; for (let i = 0; i <= 20; i++) { const u = i / 20; sm.push([jx1 + Math.sin(u * 6 + T * 1.6) * 10 * u, jy1 - u * 60]); }
  path(sm, '#e9e3d4', 8, .5); path(sm, C.ink, 1.2, .55);
  // the smoke rises from the joint; Cass's notes sway it (high = to the right)
  cassRibbon(CASS.room1, T, { vert: 1, x0: jx1 - 40, t0: .1, pxs: 150, y0: jy1 - 60, m0: 60, pym: 9, w: 2, drift: 6, rise: 22 });
  cassRibbon(CASS.room2, T, { vert: 1, x0: jx1 - 40, t0: 3.45, pxs: 150, y0: jy1 - 60, m0: 60, pym: 9, w: 2, drift: 6, rise: 22 });
  // haze hanging under the ceiling
  for (let i = 0; i < 4; i++) { const hy = 190 + i * 34, pts = []; for (let x = -100; x <= W + 100; x += 40) pts.push([x, hy + Math.sin(x * .006 + T * .5 + i * 1.7) * 14]); path(pts, '#efe5cd', 16, .22); }
  consL([[0, fy, W, fy], [780, 0, 780, H], [0, seat, W, seat]]);
} };

// ---------- 4.02 the trick (new) ----------
// On a little stage he pulls a star out of his own hat. It flies to a man in a top hat, the spotlight goes with it, and
// the man rises on a stack of coins while the applause turns his way. He is left in the dark under his cloud.
function d14star(x, y, r, rot = 0, a = 1) {
  const pts = []; for (let i = 0; i < 10; i++) { const an = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; pts.push([x + Math.cos(an) * rr, y + Math.sin(an) * rr]); }
  fillP(PP(pts), C.wax, a); hatch(PP(pts), x, y, r, .8, 4, C.ochre, 1.2, .7 * a, [r * .2, -r * .2]); iP(pts, true, C.ink, 2.2, a);
}
SU.a_trick = { mode: 'ill', f(q, p, a, T) {
  stripes('#5e4250', '#523946', 110, 1.5708, 0, C.ink);
  cam(960, 540, lerp(1, 1.05, eo(p)));
  const sy = 822, mx = 1300, hx0 = 560;
  const spot = eo(seg(T, 5.25, 5.75)), riseH = 250 * eio(seg(T, 5.5, 7.3)), my = sy - riseH;
  // the valance and the marquee: lights and a sign that holds only stars, no name
  const va = PR(-200, -100, W + 400, 200); fillP(va, C.brick); shade(va, 960, 40, 1200, [0, 20], 1.57, 6);
  const sc = new Path2D(); for (let x = -200; x < W + 200; x += 120) { sc.moveTo(x, 100); sc.quadraticCurveTo(x + 60, 150, x + 120, 100); sc.lineTo(x + 120, 90); sc.lineTo(x, 90); sc.closePath(); } fillP(sc, C.brick);
  X.beginPath(); for (let x = -200; x < W + 200; x += 120) { X.moveTo(x, 100); X.quadraticCurveTo(x + 60, 150, x + 120, 100); } stroke(C.ink, 2.4);
  const sgn = PR(720, 18, 480, 92); fillP(sgn, C.cream); iBox(720, 18, 480, 92, C.ink, 2.6); for (let i = 0; i < 3; i++) d14star(820 + i * 140, 64, 30, 0, lerp(.35, 1, spot));
  for (let i = 0; i < 26; i++) { const bx = 120 + i * 68, by = 168, lit = spot > 0 && ((i + (FD >> 1)) % 3 !== 0); fillP(PE(bx, by, 11, 11), lit ? C.wax : '#8a7a66'); iE(bx, by, 11, 11, 0, C.ink, 1.6, 1, false); }
  // curtains, drawn back
  for (const [x0, x1, sd] of [[-120, 250, 1], [1670, 2040, -1]]) { const cp = PP([[x0, 100], [x1, 100], [sd > 0 ? x1 - 90 : x0 + 90, sy], [sd > 0 ? x0 : x1, sy]]); fillP(cp, C.brick); shade(cp, (x0 + x1) / 2, 460, 300, [sd * -20, 0], 1.57, 5); X.beginPath(); for (let fx = x0 + 40; fx < x1 - 20; fx += 52) { X.moveTo(fx, 110); X.quadraticCurveTo(fx + sd * 30, 500, fx - sd * 20, sy); } stroke(C.ink, 1.6, .6); iP(dens([[x0, 100], [x1, 100], [sd > 0 ? x1 - 90 : x0 + 90, sy], [sd > 0 ? x0 : x1, sy]], 40, true), true, C.ink, 2.4); }
  // the stage
  const stg = PR(-200, sy, W + 400, 70); fillP(stg, '#b08a5a'); hatch(stg, 960, sy + 35, 1400, 0, 6, C.ink, .8, .35); X.beginPath(); for (let x = -200; x < W + 200; x += 150) { X.moveTo(x, sy); X.lineTo(x - 30, sy + 70); } stroke(C.ink, 1.1, .45);
  iline(-200, sy, W + 200, sy, C.ink, 2.8); const lip = PR(-200, sy + 70, W + 400, 300); fillP(lip, '#4a3426'); hatch(lip, 960, sy + 150, 1400, .6, 7, C.ink, .9, .5); iline(-200, sy + 70, W + 200, sy + 70, C.ink, 2.6);
  for (let x = 150; x < 1800; x += 140) { const hd = PE(x, sy + 70, 34, 14); fillP(hd, '#2b2017'); iE(x, sy + 70, 34, 14, 0, C.ink, 1.6, 1, false, 1, Math.PI, TAU); }
  // the spotlight swings to the other man; the side he stands on goes dark
  if (spot > 0) {
    const cone = PP([[mx - 40, -80], [mx + 40, -80], [mx + 200, sy + 20], [mx - 200, sy + 20]]); fillP(cone, '#fbf1d0', .26 * spot); iline(mx - 40, -80, mx - 200, sy + 20, C.ink, 1.2, .35 * spot, false); iline(mx + 40, -80, mx + 200, sy + 20, C.ink, 1.2, .35 * spot, false);
    fillP(PE(mx, sy + 14, 210, 26), '#fbf1d0', .5 * spot);
  }
  // the coin stack he rises on, coins still dropping in
  if (riseH > 2) { const n = Math.floor(riseH / 13); for (let i = 0; i < n; i++) { const cy = sy - 6 - i * 13, cx = mx + Math.sin(i * 1.7) * 6; const c = PE(cx, cy, 70, 12); fillP(c, C.ochre); hatch(c, cx, cy, 70, 1.4, 5, C.ink, .8, .4, [10, 0]); iE(cx, cy, 70, 12, 0, C.ink, 1.6, 1, false); }
    for (let i = 0; i < 5; i++) { const ph = ((T - 5.5) * 1.3 + i / 5) % 1; if (T < 5.5 + i * .15) continue; const cx = mx + (i - 2) * 50, cy = lerp(160, my - 40, ph); X.save(); X.translate(cx, cy); X.rotate(ph * 9); fillP(PE(0, 0, 16, 6), C.ochre); iE(0, 0, 16, 6, 0, C.ink, 1.4, 1, false); X.restore(); } }
  // the other man: dark suit, top hat; the star held up over his head
  const mHand = [36, -392], mhx = mx + mHand[0] * .95, mhy = my + mHand[1] * .95, starOn = T >= 5.45;
  traveller(mx, my, .95, { hat: false, coat: '#2b2420', sleeve: '#3a302c', trouser: '#231a15', look: -.6, handTo: starOn ? mHand : null, armR: [-.1, .2], armL: [.3, -.2] });
  { const hx = mx - 3 * .95, hy = my - 332 * .95; const cr = PR(hx - 25, hy - 74, 50, 74); fillP(cr, '#1d1714'); iBox(hx - 25, hy - 74, 50, 74, C.ink, 2); fillP(PR(hx - 25, hy - 18, 50, 9), C.brick); fillP(PE(hx, hy, 46, 8), '#1d1714'); iE(hx, hy, 46, 8, 0, C.ink, 2); }
  // him: hat in hand, held out like a trick; the star comes out of it
  const hHand = [72, -246], hhx = hx0 + hHand[0] * .95, hhy = sy + hHand[1] * .95;
  traveller(hx0, sy, .95, { hat: false, look: 1, handTo: hHand, armL: [.25, -.15], case: false });
  { const bx = hhx + 8, by = hhy - 4; const cr = PP([[bx - 24, by], [bx - 18, by + 34], [bx + 18, by + 34], [bx + 24, by]]); fillP(cr, '#4b3426'); iP([[bx - 24, by], [bx - 18, by + 34], [bx + 18, by + 34], [bx + 24, by]], true, C.ink, 2); fillP(PE(bx, by, 44, 8), '#3d2a1f'); iE(bx, by, 44, 8, 0, C.ink, 2); }
  cloud(hx0 - 4, sy - 452, .56, { rain: true });
  // the star: out of his hat (4.45), over the stage, into the other man's hand (5.45)
  const f = seg(T, 4.45, 5.45);
  if (T >= 4.3 && f < 1) { const pt = bz([hhx + 8, hhy - 10], [hhx + 160, hhy - 520], [mhx - 260, mhy - 440], [mhx, mhy - 30], eio(f)); const r0 = 30 * eo(seg(T, 4.3, 4.6));
    for (let i = 1; i < 6; i++) { const q2 = bz([hhx + 8, hhy - 10], [hhx + 160, hhy - 520], [mhx - 260, mhy - 440], [mhx, mhy - 30], eio(Math.max(0, f - i * .04))); fillP(PE(q2[0], q2[1], 5 - i * .7, 5 - i * .7), C.wax, .8 - i * .12); }
    d14star(pt[0], pt[1], r0, f * 6); }
  if (starOn) { d14star(mhx, mhy - 30, 30, Math.sin(T * 3) * .15); for (let i = 0; i < 8; i++) { const an = i * TAU / 8 + T * .5; iline(mhx + Math.cos(an) * 44, mhy - 30 + Math.sin(an) * 44, mhx + Math.cos(an) * (58 + (FD % 3) * 6), mhy - 30 + Math.sin(an) * (58 + (FD % 3) * 6), C.ochre, 2.4, .9, false); } }
  // his side of the stage goes dark when the light leaves
  if (spot > 0) { X.save(); X.clip(PR(-200, -200, mx - 200 + 200, H + 400)); hatch(PR(-200, -200, mx, H + 400), (mx - 200) / 2, 540, 1100, .9, 6, C.ink, 1, .32 * spot); hatch(PR(-200, -200, mx, H + 400), (mx - 200) / 2, 540, 1100, -.6, 9, C.ink, .9, .2 * spot); X.restore(); }
  // the audience, from behind; the hands go up for the other man
  for (let i = 0; i < 14; i++) { const r2 = M32(i * 13 + 5), ax = -40 + i * 148 + r2() * 30, ay = 1048 + r2() * 20, hs = 50 + r2() * 10;
    if (spot > .5 && ax > 700) for (const sd of [-1, 1]) { const up = flap() ? 0 : 10; fillP(PE(ax + sd * (34 - up * .6), ay - 96 - up, 13, 17), '#2b2420'); }
    fillP(PE(ax, ay, hs, hs * 1.15), '#2b2420'); iE(ax, ay, hs, hs * 1.15, 0, C.ink, 2, 1, false); fillP(PR(ax - hs * 1.3, ay + hs * .8, hs * 2.6, 100), '#2b2420'); }
  consL([[0, sy, W, sy], [mx, 0, mx, H], [hx0, 0, hx0, H]]);
} };

// ---------- overlays on existing set-ups (drawn after the set-up, in screen space) ----------
function d14post(key, fn) {
  const su = SU[key], f0 = su.f;
  SU[key] = { mode: su.mode, f(q, p, a, T) { f0.call(su, q, p, a, T); X.save(); screen(); fn(q, p, a, T); X.restore(); } };
}
// Violin 1 (126.4): it rises out of the record, beside him, and plays itself
d14post('b_groove', (q, p, a, T) => {
  if (T < 126.3) return; const e = eo(seg(T, 126.3, 126.8));
  popRings(600, 800, T, 126.3, C.cream, 1.2);
  violin(600, 800 + (1 - e) * 140, .62 * e, -.2, { bow: bowU(T, V1) });
});
// ...drawn in the groove schematic: its scroll is the same spiral as the groove
d14post('b_sGroove', (q, p, a, T) => {
  const vx = 1560, vy = 930, vs = .8, vr = -.12;
  violin(vx, vy, vs, vr, { sch: 1, col: C.cyan, bow: bowU(T, V1) });
  const sy2 = vy - 556 * vs * Math.cos(vr), scx = vx + 556 * vs * Math.sin(vr);
  gc(scx, sy2, 34, C.mag, .9, 1.6); lab(scx - 50, sy2 - 6, 'SCROLL = GROOVE', C.mag, .95, 14, 'right', 'middle', 'bold');
  lab(vx, vy + 50, 'VIOLIN · SOURCE: NOWHERE', C.cyan, .9, 13, 'center');
});
// ...and plays over the mule's head until 132.5, then lifts away
d14post('b_luggage', (q, p, a, T) => {
  if (T > 133.3) return; const up = eio(seg(T, 132.5, 133.25));
  violin(1540, 640 - up * 900, .5, .16 - up * .4, T < 132.5 ? { bow: bowU(T, V1) } : {});
});
// Violin 2 (241.9, Bob's 4:04): it appears in the airfield sky as the plane leaves without him
d14post('c_stairs', (q, p, a, T) => {
  const e = eo(seg(T, 242.35, 242.85)); if (e <= 0) return;
  popRings(330, 520, T, 242.35, C.ink, 1);
  violin(330, 680, .54 * e, .1, { bow: bowU(T, V2) });
});
d14post('sPlaneW', (q, p, a, T) => {
  const e = 1 - eio(seg(T, 247.0, 247.28)); if (e <= 0) return;
  violin(1560, 880, .7 * e, -.1, { sch: 1, col: C.cyan, bow: bowU(T, V2) });
  if (e > .95) lab(1560, 940, 'VIOLIN · NO SEAT REQUIRED', C.cyan, .9, 13, 'center');
});
// Wayne Cass on the fork road (168.5): the lick draws itself in the sky off the far poplar
d14post('b_forkRoad', (q, p, a, T) => {
  cassRibbon(CASS.fork, T, { x0: 180, t0: 168.47, pxs: 300, y0: 352, m0: 51, pym: 15, w: 2.4, drift: 14 });
});
// ...and over the spilled film reel (257.2): a run up and a fall
d14post('c_reelSpill', (q, p, a, T) => {
  cassRibbon(CASS.reel, T, { x0: 1000, t0: 257.17, pxs: 340, y0: 520, m0: 59, pym: 17, w: 2.4, drift: 10 });
});
