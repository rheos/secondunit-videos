// Reform Party, Dali look: the props on the table.
// ---------- things on the table ----------
function drape(pts, y0) { return pts.map(([x, z]) => z < -TD ? [x, y0 - (-TD - z) * 1.05, -TD - .015] : [x, y0, z]); } // a soft object hangs over the front edge
function melt(t) { return clamp((t - 20) / 200) * .55 + ease(t, L_(1).s, L_(1).e) * .12; } // the heat softens the props through the day
// "scientists can't speak": under the tape X the speakerphone slumps like a soft watch and runs over the table edge
const phoneSlump = (t) => ease(t, wt(1, 'can') + .45, L_(1).e + .7) * (1 - .72 * ease(t, L_(2).s + .3, L_(2).s + 1)); // springs most of the way back when the tape comes off
function speakerphone(t) {
  const m = melt(t), cz = -.95 - m * .75, cx = 1.2, sl = phoneSlump(t), pts = [];
  const flow = (x, z, f = 1) => { const dx = x - cx, dz = z - cz, front = clamp(-dz / .3), side = 1 - .55 * (dx / .4) ** 2; // front points run toward the edge
    return [cx + dx * (1 + .2 * sl * f), z - sl * f * (.12 + .78 * front * side)]; };
  for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, r = .34 * (1 + .14 * Math.cos(3 * a)) * (1 + sl * .06 * n1(5, a * 2)); pts.push(flow(cx + Math.cos(a + .5) * r, cz + Math.sin(a + .5) * r * .9)); }
  const P3 = drape(pts, TOP + .04).map((p) => PL(...p)); if (!ok(P3)) return;
  poly(P3, '#2f3136');
  if (sl > 0) for (let i = 0; i < 4; i++) { // drips off the front edge
    const x = cx - .2 + i * .13, ov = -TD - flow(x, cz - .3)[1]; if (ov <= .03) continue; const len = sl * (.1 + .2 * rnd(i, 61)) * (1 + .15 * Math.sin(t * 2 + i)), ytop = TOP + .04 - ov * 1.05 + .03, ylow = ytop - len;
    poly([PL(x - .035, ytop, -TD - .016), PL(x + .035, ytop, -TD - .016), PL(x + .015, ylow, -TD - .016), PL(x - .015, ylow, -TD - .016)], '#2f3136');
    const q = PL(x, ylow, -TD - .017); if (q[2] > .2) { g.fillStyle = '#2f3136'; g.beginPath(); g.arc(q[0], q[1], .03 * kAt(q), 0, TAU); g.fill(); } }
  if (sl > 0 && P3.every((p) => p[2] > .15)) { const hl = []; for (let i = 0; i <= 12; i++) { const a = 3.7 + i / 12 * 1.9; hl.push(PL(...drape([flow(cx + Math.cos(a) * .27, cz + Math.sin(a) * .22)], TOP + .055)[0])); } // a soft highlight on its back
    g.save(); g.globalAlpha = .35 * sl; g.strokeStyle = '#8a8e96'; g.lineWidth = .025 * kAt(hl[6]); g.beginPath(); hl.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore(); }
  poly(drape(pts.map(([x, z]) => [cx + (x - cx) * .55, cz + (z - cz) * .55 - sl * .05]), TOP + .05).map((p) => PL(...p)), '#3f4248');
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; const q = PL(...drape([flow(cx + Math.cos(a) * .1, cz + Math.sin(a) * .09, .5)], TOP + .06)[0]); if (q[2] < .15) continue; g.fillStyle = '#16171a'; g.beginPath(); g.arc(q[0], q[1], .012 * kAt(q), 0, TAU); g.fill(); }
  // LEDs: green while it may speak; red, with tape across, once the scientists can't
  const cant = wt(1, 'can'), red = t > cant && t < L_(2).s + .5;
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5, r = .3; const q = PL(...drape([flow(cx + Math.cos(a) * r * .8, cz + Math.sin(a) * r * .72)], TOP + .06)[0]); if (q[2] < .15) continue; g.fillStyle = red ? '#ff3b2a' : '#57e07a'; g.beginPath(); g.arc(q[0], q[1], .02 * kAt(q), 0, TAU); g.fill(); }
  const tape = ease(t, cant - .05, cant + .2) * (1 - ease(t, L_(2).s + .3, L_(2).s + .6));
  if (tape > 0) for (const d of [1, -1]) { const s1 = drape([flow(cx - .3 * tape, cz - .25 * d * tape, .35), flow(cx + .3 * tape, cz + .25 * d * tape, .35)], TOP + .07).map((p) => PL(...p)); seg(s1[0], s1[1], .09 * kAt(s1[0]), '#e6d7b0'); }
  // the soundbite: rings go out across the table and the last one has a bite taken out
  const sb = wt(8, 'patent'); if (t > sb - .3 && t < L_(8).e + .4) for (let r = 0; r < 4; r++) { const age = ((t - sb + .3) * 1.4 - r * .35); if (age < 0 || age > 1.6) continue; const R = .4 + age * .9, ring = [];
    for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; if (r === 3 && a > 4.2 && a < 4.9) continue; ring.push(PL(cx + Math.cos(a) * R, TOP + .06, cz + Math.sin(a) * R * .9)); }
    g.save(); g.globalAlpha = clamp(1.6 - age); g.strokeStyle = '#f8ecd0'; g.lineWidth = 3; g.beginPath(); ring.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore(); }
}
function boardMap() { // whiteboard on an easel at the right end of the table
  const x0 = 2.45, x1 = 3.95, z = .25, y0 = TOP + 1.55, y1 = TOP + .45;
  return { tl: PL(x0, y0, z), tr: PL(x1, y0, z), bl: PL(x0, y1, z), br: PL(x1, y1, z), legs: [[x0 + .1, z], [x1 - .1, z], [(x0 + x1) / 2, z + .5]], y0 };
}
// verse 2, the Gilliam chain (G05): chart bars -> cell bars on "crime" (board) -> on "soundbite" the board's bars turn to
// rows of teeth and wind-up teeth hop out of the speakerphone onto the table -> a red drape drops over them, they
// stretch under it, and on "unveiled" it whips off a jail model in the teeth's spot -> on "jails" the model rises on
// stilts while real cells shoot up on the playa.
function chainState(t) {
  const crime = wt(7, 'crime'), right = wt(7, 'right'), sb = wt(8, 'soundbite'), un = wt(9, 'unveiled'), back = L_(10).s;
  return { bars: ease(t, crime - .2, crime + .6) * (1 - ease(t, back + .3, back + .6)), wire: ease(t, right - .1, right + .35) * (1 - ease(t, back + .3, back + .6)),
    teeth: ease(t, sb - .15, sb + .2) * (1 - ease(t, un - .3, un + .05)), sb };
}
function whiteboard(t, emissive) {
  const B = boardMap(); if (!ok([B.tl, B.tr, B.bl, B.br])) return;
  if (!emissive) for (const [x, z] of B.legs) seg(PL(x, B.y0 + .1, .25), PL(x, TOP, z), .04 * kAt(B.tl), '#6b4a2a');
  const a = B.tr[0] - B.tl[0], b = B.tr[1] - B.tl[1], c = B.bl[0] - B.tl[0], d = B.bl[1] - B.tl[1];
  if (a * d - b * c <= 0) { if (!emissive) poly([B.tl, B.tr, B.br, B.bl], '#8a8f96'); return; } // its back, mid-spin
  g.save(); g.setTransform(a, b, c, d, B.tl[0], B.tl[1]);
  const m = melt(t), burn = ease(t, L_(35).s - .5, L_(35).s + 4);
  if (emissive) { if (burn > 0 && t < L_(35).s + 18) boardFire(t, burn); g.restore(); return; }
  // the board, its bottom edge sagging and dripping in the heat
  const sag = (u, i, k) => 1 + m * (.1 + .32 * u * u) * k + (i % 3 === 1 ? m * .2 * k * Math.sin(i * 7) ** 2 : 0);
  g.beginPath(); g.moveTo(-.04, -.05); g.lineTo(1.04, -.05); for (let i = 10; i >= 0; i--) { const u = i / 10; g.lineTo(u * 1.08 - .04, sag(u, i, 1.15) + .02); } g.closePath(); g.fillStyle = '#b8b1a2'; g.fill();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(1, 0); for (let i = 10; i >= 0; i--) { const u = i / 10; g.lineTo(u, sag(u, i, 1)); } g.closePath(); paintSheet();
  const ch = chainState(t);
  g.save(); g.clip(); charts(t, 1, ch); if (ch.bars > .5) cellBars(t, ch); if (!ch.wire && !ch.teeth && burn <= 0) chartClimbers(t); boardBurnPaper(t); g.restore();
  g.restore();
}
function paintSheet() { const wg = g.createLinearGradient(0, 0, 1, 1); wg.addColorStop(0, '#fbfbf6'); wg.addColorStop(1, '#d9dbd6'); g.fillStyle = wg; g.fill(); }
function cellBars(t, ch) { // the bar chart's bars as the bars of a cell; on "soundbite" each bar splits into three rows of chattering teeth
  const m = ch.teeth, fade = 1; if (ch.bars <= .5 && !m) return;
  g.save(); g.globalAlpha = fade * clamp((ch.bars - .5) * 2); const dark = [42, 42, 46], ivory = [251, 246, 232];
  g.strokeStyle = rgb(dark, 1 - m); g.lineWidth = .02; g.strokeRect(.05, .06, .45, .84);
  for (let r = 0; r < 3; r++) {
    const rowTop = .08 + r * .275, rowH = .25, mid = rowTop + rowH / 2, open = m * (.025 + .045 * (.5 + .5 * Math.sin((t - ch.sb) * 26 + r * 2.1))), up = open / 2;
    const s0 = .08 + r * .82 / 3, s1 = s0 + .82 / 3, sm = (s0 + s1) / 2;
    if (m > 0) { g.fillStyle = rgb([224, 122, 138], m); // gums, then a wind-up key and two little feet
      g.beginPath(); g.ellipse(.275, rowTop + .03 - up, .215, .045, 0, Math.PI, TAU); g.fill(); g.fillRect(.06, rowTop + .03 - up, .43, .03);
      g.beginPath(); g.ellipse(.275, rowTop + rowH - .03 + up, .215, .045, 0, 0, Math.PI); g.fill(); g.fillRect(.06, rowTop + rowH - .06 + up, .43, .03);
      g.strokeStyle = rgb([201, 164, 58], m); g.lineWidth = .012; g.save(); g.translate(.51, mid); g.rotate((t - ch.sb) * 7 + r); g.beginPath(); g.moveTo(-.025, 0); g.lineTo(.025, 0); g.moveTo(0, -.03); g.lineTo(0, .03); g.stroke(); g.restore();
      g.fillStyle = rgb([232, 140, 40], m); for (const fx of [.14, .41]) { g.beginPath(); g.ellipse(fx + .015 * Math.sin((t - ch.sb) * 26 + fx * 9), rowTop + rowH + up + .005, .03, .012, 0, 0, TAU); g.fill(); } }
    if (m > 0) { g.fillStyle = rgb([70, 18, 26], m); g.fillRect(.07, mid - up - .01, .41, open + .02); } // the open mouth behind the teeth
    for (let i = 0; i < 5; i++) { const x = lerp(.08 + i * .085, .075 + i * .083, m), w = lerp(.025, .074, m), col = rgb(mix(dark, ivory, m));
      g.fillStyle = col; const u0 = lerp(s0, rowTop + .05 - up, m), u1 = lerp(sm, mid - up, m), l0 = lerp(sm, mid + up, m), l1 = lerp(s1, rowTop + rowH - .05 + up, m);
      g.fillRect(x, u0, w, u1 - u0 + .001); g.fillRect(x, l0 - .001, w, l1 - l0);
      if (m > .3) { g.strokeStyle = 'rgba(120,100,90,.4)'; g.lineWidth = .003; g.strokeRect(x, u0, w, u1 - u0); g.strokeRect(x, l0, w, l1 - l0); } }
  }
  g.restore();
}
function charts(t, al, ch) {
  ch = ch || chainState(t); g.globalAlpha = al; g.lineCap = 'round'; g.lineJoin = 'round';
  const bars = ch.bars;
  const wars = wt(21, 'wars'), soar = ease(t, wars - .2, L_(21).e) * (1 - ease(t, L_(22).e, L_(22).e + .5));
  const pieA = ease(t, L_(22).e - .4, L_(22).e) * (1 - ease(t, L_(23).s + .4, L_(23).s + .9));
  // bar chart (left): on "crime" its bars become the bars of a cell (cellBars draws them once they turn)
  const hs = [.25, .38, .3, .5, .62];
  if (bars <= .5) for (let i = 0; i < 5; i++) { const x = .08 + i * .085, h = lerp(hs[i] + .05 * Math.sin(t * .7 + i), .82, bars); g.fillStyle = ['#2f6fb5', '#c7362b', '#2f6fb5', '#c7362b', '#2f6fb5'][i]; g.fillRect(x, .9 - h, lerp(.06, .025, bars), h); }
  // line chart (right) that only goes up; on "that's right" it kinks into barbed wire; on "wars" it climbs off the board
  g.strokeStyle = '#2a2a2e'; g.lineWidth = .012; g.beginPath(); g.moveTo(.56, .1); g.lineTo(.56, .9); g.lineTo(.96, .9); g.stroke();
  const pts = [[.58, .8], [.66, .72], [.73, .76], [.8, .58], [.87, .5], [.93, .34]].map(([x, y], i) => [x, y - soar * i * i * .09 - ch.wire * i * i * .012]);
  const wire = ch.wire, line = [];
  for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 4; k++) { const u = k / 4, a = pts[i], b = pts[i + 1], nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny), z = (k % 2 ? 1 : -1) * .028 * wire * (k ? 1 : 0);
    line.push([lerp(a[0], b[0], u) + nx / nl * z, lerp(a[1], b[1], u) + ny / nl * z]); }
  line.push(pts[pts.length - 1]);
  g.strokeStyle = rgb(mix([199, 54, 43], [58, 56, 62], wire)); g.lineWidth = lerp(.02, .012, wire); g.beginPath(); line.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
  if (wire > 0) { g.lineWidth = .007; for (let i = 1; i < line.length - 1; i += 2) { const [x, y] = line[i], s = .022 * wire; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y + s); g.moveTo(x + s, y - s); g.lineTo(x - s, y + s); g.stroke(); } }
  if (pieA > 0) { g.globalAlpha = al * pieA; g.fillStyle = '#fbfbf6'; g.fillRect(.04, .04, .92, .92); g.fillStyle = '#2f6fb5'; g.beginPath(); g.moveTo(.5, .5); g.arc(.5, .5, .32, 0, 5); g.fill(); g.fillStyle = '#c7362b'; g.beginPath(); g.moveTo(.53, .48); g.arc(.53, .48, .32, 5, TAU); g.fill(); }
  g.globalAlpha = 1;
}
// the outro: the board's paper burns from the bottom up. burnFront(u) is the height (board units, 0 top, 1 bottom) the
// flame has eaten up to at x = u; below it the paper is charred black, just above it scorched brown and curling.
function burnFront(t, u) { const b = ease(t, L_(35).s - .5, L_(35).s + 9); return Math.max(-.01, 1.08 - b * 1.15 + .1 * n1(73, u * 4) + .05 * n1(74, u * 11 + t * .7)); }
function boardBurnPaper(t, sag) { // non-emissive: scorch band and char below the front (called with the board transform set)
  const b = ease(t, L_(35).s - .5, L_(35).s + 9); if (b <= 0) return; const N = 24;
  const path = (dy) => { g.beginPath(); g.moveTo(-.05, 1.3); for (let i = 0; i <= N; i++) { const u = i / N; g.lineTo(u * 1.1 - .05, burnFront(t, u) - dy); } g.lineTo(1.05, 1.3); g.closePath(); };
  path(.07); g.fillStyle = 'rgba(120,70,30,.55)'; g.fill(); path(.035); g.fillStyle = 'rgba(70,35,15,.8)'; g.fill(); path(0); g.fillStyle = '#16100e'; g.fill();
  if (b > .15 && b < 1) { const cu = ease(b, .15, .6); g.fillStyle = '#e9e1cc'; g.strokeStyle = 'rgba(60,30,10,.6)'; g.lineWidth = .006; // the top corners curl over
    for (const [x0, sx] of [[0, 1], [1, -1]]) { const s2 = .18 * cu; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + sx * s2, 0); g.quadraticCurveTo(x0 + sx * s2 * .2, s2 * .2, x0, s2); g.closePath(); g.fillStyle = '#5a3a24'; g.fill();
      g.beginPath(); g.moveTo(x0 + sx * s2, 0); g.quadraticCurveTo(x0 + sx * s2 * 1.1, s2 * 1.1, x0, s2); g.quadraticCurveTo(x0 + sx * s2 * .45, s2 * .45, x0 + sx * s2, 0); g.fillStyle = '#d8ccb0'; g.fill(); g.stroke(); } }
}
function boardFire(t, burn) { // emissive: the glowing edge, irregular flame tongues on it, sparks flying up over the boardroom, then embers
  const s = L_(35).s, b = ease(t, s - .5, s + 9), die = 1 - ease(t, s + 7.6, s + 10), glow = 1 - ease(t, s + 10, s + 18); if (glow <= 0) return;
  g.save(); g.beginPath(); g.rect(-.06, -.6, 1.12, 1.9); g.clip(); g.globalCompositeOperation = 'lighter';
  const N = 24, fr = (u) => burnFront(t, u);
  if (die > 0) { g.lineWidth = .025; g.strokeStyle = `rgba(255,140,40,${.8 * die})`; g.beginPath(); for (let i = 0; i <= N; i++) { const u = i / N; g.lineTo(u * 1.1 - .05, fr(u * 1.1 - .05)); } g.stroke();
    g.lineWidth = .01; g.strokeStyle = `rgba(255,230,150,${.9 * die})`; g.stroke();
    const amt = clamp(b * 3) * die;
    g.beginPath(); for (let i = 0; i <= N; i++) { const u = i / N; g.lineTo(u * 1.1 - .05, fr(u * 1.1 - .05)); } for (let i = N; i >= 0; i--) { const u = i / N; g.lineTo(u * 1.1 - .05, fr(u * 1.1 - .05) + .3); } g.closePath();
    { const yb = fr(.5), gg = g.createLinearGradient(0, yb, 0, yb + .3); gg.addColorStop(0, `rgba(255,120,30,${.5 * amt})`); gg.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gg; g.fill(); } // the hot char just behind the front
    for (let i = 0; i < 17; i++) { const u = (i + .5 + .35 * (rnd(i, 81) - .5)) / 17, y0 = fr(u) + .02, h = clamp((y0 + .02) / .15) * amt * 1.6 * (.07 + .2 * rnd(i, 82) + .1 * (.5 + .5 * n1(83 + i, t * 2.6))) * (1.2 - .4 * Math.abs(u - .5)), w = .025 + .035 * rnd(i, 84), sw = .04 * n1(85 + i, t * 3.1);
      if (h < .01) continue; const fg = g.createLinearGradient(0, y0, 0, y0 - h); fg.addColorStop(0, 'rgba(255,225,130,.95)'); fg.addColorStop(.45, 'rgba(255,125,35,.65)'); fg.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = fg;
      g.beginPath(); g.moveTo(u - w, y0); g.bezierCurveTo(u - w * 1.2, y0 - h * .4, u - w * .3 + sw, y0 - h * .7, u + sw * 1.6, y0 - h); g.bezierCurveTo(u + w * .5 + sw, y0 - h * .6, u + w * 1.2, y0 - h * .35, u + w, y0); g.fill(); }
    for (let i = 0; i < 46; i++) { const per = .9 + rnd(i, 91) * 1.1, ph = rnd(i, 92), age = ((t / per + ph) % 1), cyc = Math.floor(t / per + ph), u = rnd(i, cyc, 93); // sparks
      const y = fr(u) - age * (.5 + .7 * rnd(i, 94)), x = u + .08 * n1(95 + i, t * 1.5 + age * 3) * age, a = (1 - age) * amt * .9; if (a <= .02) continue;
      g.fillStyle = `rgba(255,${190 + 50 * rnd(i, 96) | 0},110,${a})`; g.fillRect(x - .004, y - .006, .008, .012); } }
  for (let i = 0; i < 26; i++) { const u = rnd(i, 101), v = .1 + rnd(i, 102) * .85; if (v < fr(u) + .03) continue; // embers in the char
    const p = .5 + .5 * Math.sin(t * (1.5 + rnd(i, 103) * 2) + i), a = glow * (.25 + .45 * p) * clamp(b * 2); g.fillStyle = `rgba(255,${90 + 60 * p | 0},30,${a})`; g.beginPath(); g.ellipse(u, v, .012 + .01 * rnd(i, 104), .006, 0, 0, TAU); g.fill(); }
  g.restore();
}
// "every tape recorder": four reel-to-reel recorders sit on the far half of the table, recording; on "every" they hop one
// by one, shrinking, into the open drawer in the drawer-torso suit's chest, and stack there until it shuts.
const TAPE_N = 4, TAPE_AT = [[-2.05, 1.0], [-1.35, .75], [-.2, .8], [.35, 1.05]];
function tapeHop(t, i) { const st = wt(2, 'every') - .1 + i * .32; return clamp((t - st) / .75); }
function tapeRecorderPos(t, i) { // local car coords of recorder i while it is on the table (b5's tape lines can start here); null once it has hopped
  if (t < L_(2).s - .3 || t > L_(2).e + .3 || tapeHop(t, i) > 0) return null; const [x, z] = TAPE_AT[i]; return [x, TOP + .12, z]; }
function recorder(x, y, k, t, i, rec) { // a reel-to-reel recorder, face on; (x, y) = bottom centre
  g.fillStyle = '#2c2c31'; g.fillRect(x - .16 * k, y - .2 * k, .32 * k, .2 * k); g.fillStyle = '#46464e'; g.fillRect(x - .16 * k, y - .2 * k, .32 * k, .03 * k);
  for (const d of [-1, 1]) { const rx = x + d * .075 * k, ry = y - .115 * k; g.fillStyle = '#d8d0bc'; g.beginPath(); g.arc(rx, ry, .062 * k, 0, TAU); g.fill();
    g.strokeStyle = '#2c2c31'; g.lineWidth = Math.max(1, .012 * k); for (let s = 0; s < 3; s++) { const a = s / 3 * TAU + t * 5 * (rec ? 1 : 0) + i; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx + Math.cos(a) * .05 * k, ry + Math.sin(a) * .05 * k); g.stroke(); }
    g.fillStyle = '#5a3a24'; g.beginPath(); g.arc(rx, ry, .025 * k, 0, TAU); g.fill(); }
  g.strokeStyle = '#5a3a24'; g.lineWidth = Math.max(1, .01 * k); g.beginPath(); g.moveTo(x - .075 * k, y - .053 * k); g.lineTo(x + .075 * k, y - .053 * k); g.stroke();
  if (rec) { g.fillStyle = Math.sin(t * 9 + i) > 0 ? '#ff3b2a' : '#7a1a14'; g.beginPath(); g.arc(x + .13 * k, y - .03 * k, .014 * k, 0, TAU); g.fill(); }
}
function tapeRecorders(t) {
  const s = L_(2).s; if (t < s - .3 || t > L_(2).e + .3) return; const appear = ease(t, s - .3, s + .3);
  const D = SEATS[2], dp = PL(D.x, SEAT, D.z); if (dp[2] < .25) return; const dk = kAt(dp), ev = wt(2, 'every');
  // the top drawer of the drawer-torso suit (the one that clears the table edge) pulls out to take them; car.js's middle drawer is hidden by the table here
  const open = ease(t, ev - .45, ev - .05) * (1 - ease(t, L_(2).e - .1, L_(2).e + .25)), T = typeof TORSO !== 'undefined' ? TORSO : .59, sh = dp[1] - (T + .03) * dk, dy = sh + (T > .6 ? .08 : .1) * dk, dw = .26 * dk, dh = .1 * dk, d = open * .2 * dk;
  const tray = [dp[0], dy + dh + d * .6];
  if (open > 0) { g.fillStyle = '#2a1608'; g.fillRect(dp[0] - dw / 2, dy, dw, dh); g.fillStyle = '#a77a48'; g.beginPath(); g.moveTo(dp[0] - dw / 2, dy + dh); g.lineTo(dp[0] - dw / 2 - d * .3, dy + dh + d); g.lineTo(dp[0] + dw / 2 + d * .3, dy + dh + d); g.lineTo(dp[0] + dw / 2, dy + dh); g.fill();
    g.fillStyle = '#5a3a1c'; g.fillRect(dp[0] - dw / 2 - d * .25, dy + dh + d * .15, dw + d * .5, d * .7); } // the tray, open toward us
  let inTray = 0;
  for (let i = 0; i < TAPE_N; i++) { const u = tapeHop(t, i), [x, z] = TAPE_AT[i], p = PL(x, TOP, z); if (p[2] < .25) continue; const k = kAt(p);
    if (u >= 1) { inTray++; continue; }
    const e = u * u * (3 - 2 * u), sx = lerp(p[0], tray[0], e), sy = lerp(p[1], tray[1], e) - Math.sin(u * Math.PI) * .07 * k, sk = lerp(k, dk * .4, e);
    g.save(); g.globalAlpha = appear; g.translate(sx, sy); g.rotate(Math.sin(u * Math.PI) * (i % 2 ? .35 : -.35)); recorder(0, 0, sk * (u > 0 ? 1 : 1 + .04 * Math.sin(t * 12 + i)), t, i, u === 0 && t > s + .2); g.restore(); }
  if (open > 0) { // the ones already filed sit in the tray behind its front, then the drawer slides shut on them
    g.save(); g.beginPath(); g.rect(dp[0] - .3 * dk, dy, .6 * dk, dh + d); g.clip();
    for (let j = 0; j < inTray; j++) recorder(dp[0] + (j - (inTray - 1) / 2) * .085 * dk, dy + dh + d * .8 - (j % 2) * .02 * dk, dk * .4, t, j, false);
    g.restore();
    g.fillStyle = '#8c6338'; g.fillRect(dp[0] - dw / 2 - d * .3, dy + dh + d - .01 * dk, dw + d * .6, dh * .9); g.strokeStyle = '#3a2412'; g.lineWidth = .01 * dk; g.strokeRect(dp[0] - dw / 2 - d * .3, dy + dh + d - .01 * dk, dw + d * .6, dh * .9);
    g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(dp[0], dy + dh + d + dh * .4, .016 * dk, 0, TAU); g.fill(); }
}
// "restrict access to news": broadsheets flutter down over the table, are swept under a screw press and, on "news", the
// plate slams down and squeezes them out over the edge. Each refrain escalates: 1 the press; 2 a cell drops over it;
// 3 a chain and a padlock on top of that.
const NEWS = [[4, 1], [11, 2], [32, 3]];
function newsPress(t) { for (const [li, lv] of NEWS) { const s = L_(li).s, e = L_(li + 1).s + .3; if (lv < 3 && t > s - .3 && t < e) newsOne(t, li, lv); } }
function newsOne(t, li, lv) { // refrain 3 is seen from the driver's hole: a press four times the size, out on the playa beyond the far row
  const s = L_(li).s, n = wt(li, 'news'), al = ease(t, s - .3, s + .1) * (1 - ease(t, L_(li + 1).s - .2, L_(li + 1).s + .3));
  const px = -1.25, pz = -1.0, hw = 1.05, up = easeOutBack(clamp((t - s - .65) / .6)), postH = 1.85 * up;
  const S = lv < 3 ? 1 : 4, X0 = lv < 3 ? 0 : carX(n) - CX, Z0 = 14;
  const Q = (x, y, z) => lv < 3 ? PL(x, y, z) : PL(X0 + (x - px) * S, (y - TOP) * S, Z0 + (z - pz) * S), kS = (p) => kAt(p) * S;
  const slam = t < n - .12 ? 0 : t < n + .05 ? ease(t, n - .12, n + .05) : 1 - .06 * Math.sin((t - n - .05) * 18) * Math.exp(-(t - n) * 6), plateY = TOP + lerp(1.3, .08, slam) * up;
  g.save(); g.globalAlpha = al;
  const iron = '#34302e', ironLit = '#5c5550', brass = '#c9a24a';
  const box = (x0, x1, y0, y1, z0, z1, top, front, side) => { poly([Q(x0, y1, z0), Q(x1, y1, z0), Q(x1, y1, z1), Q(x0, y1, z1)], top); poly([Q(x1, y0, z0), Q(x1, y1, z0), Q(x1, y1, z1), Q(x1, y0, z1)], side); poly([Q(x0, y0, z0), Q(x1, y0, z0), Q(x1, y1, z0), Q(x0, y1, z0)], front); };
  if (up > 0) { // base, posts, crossbar, screw and wheel
    box(px - hw - .12, px + hw + .12, TOP, TOP + .06, pz - .42, pz + .42, ironLit, iron, '#221f1e');
    for (const d of [-1, 1]) box(px + d * hw - .07, px + d * hw + .07, TOP, TOP + postH, pz - .07, pz + .07, ironLit, iron, '#221f1e');
    box(px - hw - .12, px + hw + .12, TOP + postH - .16, TOP + postH, pz - .1, pz + .1, ironLit, iron, '#221f1e');
    const sa = Q(px, TOP + postH + .25, pz), sb = Q(px, plateY + .12, pz); seg(sa, sb, .07 * kS(sa), brass);
    for (let k = 0; k < 7; k++) { const yy = lerp(plateY + .12, TOP + postH, k / 7), q0 = Q(px - .05, yy, pz - .04), q1 = Q(px + .05, yy + .05, pz - .04); seg(q0, q1, 2, 'rgba(90,60,20,.6)'); } // the thread
    const wc = Q(px, TOP + postH + .25, pz), wk = kS(wc), spin = slam * 6 + (t - s) * .5; if (wc[2] > .2) { g.strokeStyle = brass; g.lineWidth = .04 * wk; g.beginPath(); g.ellipse(wc[0], wc[1], .42 * wk, .12 * wk, 0, 0, TAU); g.stroke();
    for (let k = 0; k < 4; k++) { const a = spin + k / 4 * TAU; g.beginPath(); g.moveTo(wc[0], wc[1]); g.lineTo(wc[0] + Math.cos(a) * .42 * wk, wc[1] + Math.sin(a) * .12 * wk); g.stroke(); } } }
  // the papers: three broadsheets, upright and fluttering in the air, then flattened under the plate and squeezed over the edge
  for (let i = 0; i < 3; i++) {
    const land = s + .5 + i * .45, fall = ease(t, land - 1.2, land), flat = ease(t, n - .12, n + .05), sq = ease(t, n, n + .7);
    const fl = (1 - flat) * (1 - .6 * fall), cx = lerp(px - .7 + i * .7 + 1.5 * (i - 1) * (1 - fall), px - .45 + i * .45, flat), cy = lerp(TOP + 4.2 - i * .4, TOP + .5 + .25 * (i % 2), fall) + .12 * fl * Math.sin(t * 3.3 + i * 2), cz = lerp(pz - .1, pz - .15 - sq * .2, flat);
    const psi = fl * .7 * Math.sin(t * 2.4 + i * 1.7) + (1 - fall) * (i - 1) * .6, tilt = lerp(.15 * Math.sin(t * 2 + i), Math.PI / 2, flat), w = .95 * (1 + sq * .2), h = .7;
    const U = [Math.cos(psi), 0, Math.sin(psi)], V = [0, Math.cos(tilt), Math.sin(tilt) * -1];
    const at = (a, b) => { let x = cx + U[0] * a * w + V[0] * b * h, y = cy + U[1] * a * w + V[1] * b * h, z = cz + U[2] * a * w + V[2] * b * h; if (flat > 0) y = lerp(y, TOP + .07 + i * .005, flat); return Q(...(z < -TD && flat > .5 ? drape([[x, z]], y)[0] : [x, y, z])); };
    const sheet = (a0, b0, a1, b1, col) => poly([at(a0, b0), at(a1, b0), at(a1, b1), at(a0, b1)], col);
    // flattened: the front half is squeezed out (b < 0 runs toward the edge) and droops over it
    const bs = (b) => flat > 0 && b < 0 ? b * (1 + sq * 1.4) : b;
    sheet(-.5, bs(-.5), .5, .5, '#efe9d9'); if (fl > .05 || flat < 1) sheet(-.5, .38, .5, .5, '#26221f');
    for (let r = 0; r < 2; r++) sheet(-.42, .25 - r * .12, .3 - r * .2, .31 - r * .12, '#3b3632');
    for (let c = 0; c < 4; c++) for (let r = 0; r < 5; r++) { const b0 = bs(.06 - r * .11); sheet(-.44 + c * .23, b0 - .045, -.26 + c * .23, b0, 'rgba(120,110,95,.55)'); }
  }
  if (up > 0) { box(px - hw + .1, px + hw - .1, plateY, plateY + .12, pz - .38, pz + .38, ironLit, iron, '#221f1e'); } // the plate, over the papers
  if (lv >= 2) { // a cell drops over the press
    const dropT = n + .45, cd = t < dropT - .35 ? 0 : t < dropT ? ease(t, dropT - .35, dropT) : 1, cy = (1 - cd) * 3.5 + (t > dropT ? .08 * Math.abs(Math.sin((t - dropT) * 14)) * Math.exp(-(t - dropT) * 5) : 0);
    if (cd > 0) { const x0 = px - hw - .3, x1 = px + hw + .3, z0 = pz - .55, z1 = pz + .55, y0 = TOP + cy, y1 = TOP + 2.45 + cy;
      for (let k = 0; k <= 9; k++) { const x = lerp(x0, x1, k / 9); seg(Q(x, y0, z0), Q(x, y1, z0), .05 * kS(Q(x, y0, z0)), '#2a2226'); seg(Q(x, y0, z1), Q(x, y1, z1), .04 * kS(Q(x, y0, z1)), '#2a2226'); }
      for (const y of [y0, y1, (y0 + y1) / 2]) { seg(Q(x0, y, z0), Q(x1, y, z0), .07 * kS(Q(x0, y, z0)), '#3b3232'); seg(Q(x1, y, z0), Q(x1, y, z1), .06 * kS(Q(x1, y, z0)), '#3b3232'); } } }
  if (lv >= 3) { // and a chain with a padlock
    const lockT = n + .85, lk = ease(t, lockT - .3, lockT), x0 = px - hw - .3, x1 = px + hw + .3, z0 = pz - .58;
    if (lk > 0) { for (const [ya, yb] of [[.2, 2.2], [2.2, .2]]) for (let k = 0; k < 18 * lk; k++) { const u = k / 18, q = Q(lerp(x0, x1, u), TOP + lerp(ya, yb, u), z0), kk = kS(q); if (q[2] < .2) continue; g.strokeStyle = '#8f8a80'; g.lineWidth = .025 * kk; g.beginPath(); g.ellipse(q[0], q[1], .07 * kk, .04 * kk, (ya < yb ? -1 : 1) * .5 + (k % 2) * 1.2, 0, TAU); g.stroke(); }
      const q = Q(px, TOP + 1.2 - (1 - lk) * 1.5, z0 - .05), kk = kS(q), shut = ease(t, lockT, lockT + .15); if (q[2] > .2) { g.strokeStyle = '#b8b2a6'; g.lineWidth = .06 * kk; g.beginPath(); g.arc(q[0], q[1] - .22 * kk - (1 - shut) * .1 * kk, .16 * kk, Math.PI, TAU); g.stroke();
      g.fillStyle = brass; g.fillRect(q[0] - .24 * kk, q[1] - .22 * kk, .48 * kk, .4 * kk); g.fillStyle = '#2a1e10'; g.beginPath(); g.arc(q[0], q[1] - .04 * kk, .05 * kk, 0, TAU); g.fill(); g.fillRect(q[0] - .02 * kk, q[1] - .04 * kk, .04 * kk, .12 * kk); } } }
  g.restore();
}
function cage(p, k, legs) { // a cell on spindly stilt legs; p = ground point, k = px per metre; legs 0..1 grows the stilts
  if (p[2] < .2) return; const L = 7 * legs, x = p[0], y = p[1];
  g.strokeStyle = '#3b3232'; g.lineWidth = Math.max(1, .12 * k); g.lineCap = 'round';
  for (const d of [-1, -.4, .4, 1]) { g.beginPath(); g.moveTo(x + d * 1.1 * k, y - L * k); g.quadraticCurveTo(x + d * 1.4 * k, y - L * .5 * k, x + d * 1.5 * k, y); g.stroke(); }
  const cy = y - L * k; g.fillStyle = '#6d6058'; g.fillRect(x - 1.3 * k, cy - .25 * k, 2.6 * k, .25 * k); g.fillRect(x - 1.3 * k, cy - 2.75 * k, 2.6 * k, .3 * k);
  g.fillStyle = 'rgba(40,30,30,.35)'; g.fillRect(x - 1.2 * k, cy - 2.45 * k, 2.4 * k, 2.2 * k);
  g.lineWidth = Math.max(1, .09 * k); for (let i = 0; i <= 7; i++) { const bx = x - 1.2 * k + i * 2.4 / 7 * k; g.beginPath(); g.moveTo(bx, cy - 2.45 * k); g.lineTo(bx, cy - .25 * k); g.stroke(); }
}
// "build more jails": cells on stilts shoot up all round the car, near enough to read, one right behind the board
// a box in table coords, drawn with back faces culled; cols = [front, side, top, bottom, back]
function box3(x0, x1, y0, y1, z0, z1, cols) {
  const F = (a, b, c, d, col) => { const q = [PL(...a), PL(...b), PL(...c), PL(...d)]; if (!ok(q)) return; let ar = 0; for (let i = 0; i < 4; i++) { const p = q[i], n = q[(i + 1) % 4]; ar += p[0] * n[1] - n[0] * p[1]; } if (ar < 0) poly(q, col); };
  const [fr, sd, tp, bt, bk] = cols;
  F([x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1], bk || sd);
  F([x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0], bt || sd);
  F([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], sd); F([x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1], sd);
  F([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], tp); F([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], fr);
}
const JM = { x0: -1.75, x1: -.25, z0: .55, z1: 1.05 }; // the jail model's footprint on the table (left of the hat hole, far half)
const TEETH = [...Array(8)].map((_, i) => ({ x: -1.55 + (i % 4) * .43, z: i < 4 ? .95 : .66, i })); // back row first
function windupTeeth(x, y, k, ch, t, i) { // a pair of wind-up chattering teeth, face on; (x, y) = feet on the table
  const w = .2 * k, open = ch * .09 * k, gy = y - .1 * k;
  g.fillStyle = '#e8902e'; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * .1 * k + .015 * k * Math.sin(t * 22 + i + d), y - .015 * k, .045 * k, .02 * k, 0, 0, TAU); g.fill(); }
  g.fillStyle = '#4a1218'; g.fillRect(x - w * .8, gy - .14 * k - open, w * 1.6, .1 * k + open);
  g.fillStyle = '#e07a8a'; g.beginPath(); g.ellipse(x, gy, w, .05 * k, 0, 0, Math.PI); g.fill(); g.fillRect(x - w, gy - .03 * k, 2 * w, .03 * k);
  g.beginPath(); g.ellipse(x, gy - .17 * k - open, w, .055 * k, 0, Math.PI, TAU); g.fill(); g.fillRect(x - w, gy - .17 * k - open, 2 * w, .03 * k);
  g.fillStyle = '#fbf6e8'; for (let j = 0; j < 5; j++) { const tx = x - w * .82 + j * w * .34; g.fillRect(tx, gy - .075 * k, w * .3, .05 * k); g.fillRect(tx, gy - .14 * k - open, w * .3, .05 * k); }
  g.strokeStyle = '#c9a43a'; g.lineWidth = Math.max(1, .02 * k); g.save(); g.translate(x + w * 1.15, gy - .07 * k); g.rotate(t * 6 + i); g.beginPath(); g.moveTo(-.05 * k, 0); g.lineTo(.05 * k, 0); g.moveTo(0, -.05 * k); g.lineTo(0, .05 * k); g.stroke(); g.restore();
}
function jailModel(t) {
  const sb = wt(8, 'soundbite'), s9 = L_(9).s, un = wt(9, 'unveiled'), jl = wt(9, 'jails'), back = L_(10).s; if (t < sb - .2 || t > back + .6) return;
  const al = 1 - ease(t, back - .1, back + .4); g.save(); g.globalAlpha = al;
  const drop = ease(t, s9 + .1, s9 + .55), whip = ease(t, un - .05, un + .55), grow = ease(t, un - .8, un - .1);
  // the teeth: hop out of the speakerphone on "soundbite" and chatter in two rows; hidden once the drape is down
  if (drop < 1) { const pc = PL(1.2, TOP + .1, -1.05);
    for (const T of TEETH) { const st = sb - .1 + T.i * .07, u = clamp((t - st) / .45); if (u <= 0) continue; const p = PL(T.x, TOP, T.z); if (p[2] < .2 || pc[2] < .2) continue;
      const e = u * u * (3 - 2 * u), x = lerp(pc[0], p[0], e), y = lerp(pc[1], p[1], e) - Math.sin(u * Math.PI) * .5 * kAt(p) - (u >= 1 ? Math.abs(Math.sin(t * 11 + T.i)) * .04 * kAt(p) : 0), k = lerp(kAt(pc) * .5, kAt(p), e);
      windupTeeth(x, y, k * 1.3, Math.abs(Math.sin(t * 22 + T.i * 1.3)), t, T.i); } }
  // the jail model, revealed on "unveiled"; on "jails" it rises on stilt legs
  if (whip > 0) { const lift = t > jl - .1 ? easeOutBack(clamp((t - jl + .1) / .7)) * 1.3 : 0, pop = easeOutBack(clamp((t - un + .05) / .4)), h = .62 * pop, y0 = TOP + lift, { x0, x1, z0, z1 } = JM;
    if (lift > 0) for (const [lx, lz] of [[x0 + .1, z0 + .08], [x1 - .1, z0 + .08], [x0 + .1, z1 - .08], [x1 - .1, z1 - .08]]) { const a = PL(lx, y0, lz), b = PL(lx + (lx < -1 ? -.12 : .12), TOP, lz - .05); seg(a, b, .035 * kAt(a), '#2a2226'); }
    box3(x0, x1, y0, y0 + h, z0, z1, ['#a49d91', '#7f786e', '#c9c3b6', '#3b3530']);
    const fp = PL(x0, y0, z0), fq = PL(x1, y0 + h, z0); if (fp[2] > .2 && fq[2] > .2 && h > .2) for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { // the cells' barred windows
      const cx0 = x0 + .06 + c * .36, cy0 = y0 + .06 + r * h / 2, cw = .28, chh = h / 2 - .1;
      poly([PL(cx0, cy0, z0 - .002), PL(cx0 + cw, cy0, z0 - .002), PL(cx0 + cw, cy0 + chh, z0 - .002), PL(cx0, cy0 + chh, z0 - .002)], '#231c1e');
      for (let k = 1; k < 5; k++) { const bx = cx0 + k * cw / 5, a = PL(bx, cy0, z0 - .004); seg(a, PL(bx, cy0 + chh, z0 - .004), .018 * kAt(a), '#d8d2c4'); } }
    const fl = PL(x0 + .2, y0 + h, (z0 + z1) / 2), ft = PL(x0 + .2, y0 + h + .35, (z0 + z1) / 2); if (fl[2] > .2 && h > .3) { seg(fl, ft, .015 * kAt(fl), '#3b3232'); const fk = kAt(ft); g.fillStyle = PAL.rosette; g.beginPath(); g.moveTo(ft[0], ft[1]); g.lineTo(ft[0] + (.22 + .02 * Math.sin(t * 6)) * fk, ft[1] + .06 * fk); g.lineTo(ft[0], ft[1] + .13 * fk); g.fill(); } }
  // the drape: red velvet that drops over the teeth on "their grand plan", jiggles as they chatter and stretch under it,
  // then whips up and away (back, over the far row) on "unveiled"
  if (drop > 0 && whip < 1) { const { x0, x1, z0, z1 } = JM, up = (1 - drop) * 1.6 + whip * whip * 3.2, back2 = whip * 2.2, hh = lerp(.32, .66, grow), N = 12;
    const lump = (u) => hh * (.82 + .12 * Math.abs(Math.sin(u * 4 * Math.PI))) + .03 * Math.abs(Math.sin(t * 22 + u * 9)) * (1 - grow);
    const hem = (u) => .02 + .04 * Math.sin(u * 17 + t * 3) * (1 - drop * .5) + whip * .3 * Math.sin(u * 6 + t * 12);
    const at = (x, y, z) => PL(x, y + up, z + back2);
    const top = [], front = [];
    for (let i = 0; i <= N; i++) { const u = i / N, x = lerp(x0 - .08, x1 + .08, u); top.push([x, TOP + lump(u), z0 - .02]); }
    for (let i = 0; i <= N; i++) { const u = i / N, x = lerp(x0 - .1, x1 + .1, u); front.push(at(x, TOP + hem(u), z0 - .1 - .04 * Math.sin(u * 13))); }
    const vel = '#8e1b22', velLit = '#b8323a';
    poly([...top.map((p) => at(p[0], p[1], z1 + .02)).reverse(), ...top.map((p) => at(...p))], velLit); // the top of the drape
    poly([...top.map((p) => at(...p)), ...front.slice().reverse()], vel);
    for (let i = 1; i < N; i += 2) seg(at(top[i][0], top[i][1], top[i][2]), front[i], 2, 'rgba(40,5,8,.35)'); // folds
    for (let i = 0; i < N; i++) { const a = front[i]; if (a[2] > .2) seg(a, front[i + 1], .04 * kAt(a), '#d6a632'); } }
  g.restore();
}
const JAILS = [[4, 7, 1], [-5, 8.5, .9], [11, 10, 1.05], [-8.5, 13, 1], [15.5, 14, .95], [-1.5, 15, 1.1], [7.5, 18, 1], [-6, 20, .9], [13, 22, 1.15], [1.5, 24, 1.2]]; // inside JAILW's frame (local x -9..17), under 25 m back
function jails(t, list) { const j = wt(9, 'jails'); if (t < j - .1) return; const base = carX(j);
  JAILS.forEach(([x, z, s], i) => { const legs = easeOutBack(clamp((t - j + .1 - i * .09) / .8)) * s, X = base + x;
    list.push({ z: P(X, 0, z)[2], draw: () => { const p = P(X, 0, z); cage(p, kAt(p), legs); }, shadow: () => shadowStick(X, 0, 7 * legs + 2.8, z, 2.6, t) }); }); }
function chips(t) { // "expand the wars and the military bets": chip stacks grow on the table
  const s = L_(21).s, e = L_(21).e; if (t < s || t > e + 1.2) return; const sink = 1 - ease(t, e + .2, e + 1.2);
  for (let i = 0; i < 4; i++) { const n = Math.floor(clamp((t - s - i * .25) / 1.8) * 14 * sink), x = 1.7 + i * .25, z = -.35 + (i % 2) * .22;
    for (let c = 0; c < n; c++) { const p = PL(x, TOP + c * .035, z), k = kAt(p); if (p[2] < .15) continue; g.fillStyle = ['#c7362b', '#f4efe6', '#2f6fb5', '#1c1c1c'][i]; g.beginPath(); g.ellipse(p[0], p[1], .14 * k, .05 * k, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.stroke(); } }
}
function pie(t) { // "how many lies can you bake in this pie?": a real pie, one slice slumping over the edge
  const s = L_(23).s, e = L_(23).e; if (t < s - .2 || t > e + 1) return; const al = ease(t, s - .2, s + .2) * (1 - ease(t, e + .3, e + 1)), cx = -.15, cz = -.95, sl = ease(t, wt(23, 'pie') - .5, e + .3);
  const disc = (r, a0, a1, oz, y) => { const ps = [[cx, cz + oz]]; for (let i = 0; i <= 20; i++) { const a = lerp(a0, a1, i / 20); ps.push([cx + Math.cos(a) * r, cz + oz + Math.sin(a) * r]); } return drape(ps, y).map((p) => PL(...p)); };
  g.save(); g.globalAlpha = al; poly(disc(.42, -1.1, 4.6, 0, TOP + .06), '#c98a3e'); poly(disc(.36, -1.1, 4.6, 0, TOP + .07), '#e2b267');
  for (let i = 0; i < 6; i++) { const a = -1.1 + i * .95; seg(PL(cx, TOP + .075, cz), PL(cx + Math.cos(a) * .36, TOP + .075, cz + Math.sin(a) * .36), 2, 'rgba(120,70,20,.5)'); }
  poly(disc(.42, -1.6, -1.1, -sl * .75, TOP + .06), '#c98a3e'); g.restore();
}
function book(t) { // "it's a mystery book the way you look": an open book whose pages keep turning
  const s = L_(25).s, e = L_(26).s; if (t < s - .2 || t > e + .5) return; const al = ease(t, s - .2, s + .2) * (1 - ease(t, e, e + .5)), cx = -1.5, cz = -.8;
  const pg = (ang) => { const c = Math.cos(ang), sn = Math.sin(ang); return [PL(cx, TOP + .05, cz - .3), PL(cx, TOP + .05, cz + .3), PL(cx + .45 * c, TOP + .05 + .45 * sn, cz + .3), PL(cx + .45 * c, TOP + .05 + .45 * sn, cz - .3)]; };
  g.save(); g.globalAlpha = al; poly([PL(cx - .5, TOP + .02, cz - .33), PL(cx + .5, TOP + .02, cz - .33), PL(cx + .5, TOP + .02, cz + .33), PL(cx - .5, TOP + .02, cz + .33)], '#5c1f2a');
  poly(pg(Math.PI), '#f2ead6', 'rgba(0,0,0,.2)', 1); poly(pg(0), '#f2ead6', 'rgba(0,0,0,.2)', 1);
  const turn = ((t - s) * 1.3) % 1; poly(pg(turn * Math.PI), '#fbf5e6', 'rgba(0,0,0,.25)', 1); g.restore();
}
function dime(t) { // "people had a dime": a real dime (silver, milled edge, a torch on its face) drops on the word, rattles flat, glints
  const d = wt(15, 'dime'); if (t < d - .4 || t > L_(16).e + .6) return; const al = 1 - ease(t, L_(16).e, L_(16).e + .6);
  const r = .3, th = .04, cx = -1.55, cz = -.75, fall = clamp((t - d + .4) / .4), land = t - d;
  let phi, theta, cy;
  if (land < 0) { phi = Math.PI / 2 - .25; theta = t * 14; cy = TOP + r + (1 - fall * fall) * 2.4; } // tumbling down, nearly on edge
  else { const u = clamp(land / .85); phi = lerp(1.2, 0, u * u * (3 - 2 * u)); theta = d * 14 + land * lerp(9, 30, u); cy = TOP + r * Math.sin(phi) + th / 2 + .08 * Math.abs(Math.sin(land * 9)) * Math.exp(-land * 7); }
  const n = [Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)], u3 = [-Math.sin(theta), 0, Math.cos(theta)], v3 = [n[1] * u3[2] - n[2] * u3[1], n[2] * u3[0] - n[0] * u3[2], n[0] * u3[1] - n[1] * u3[0]];
  const at = (a, b, off) => PL(cx + r * (a * u3[0] + b * v3[0]) + n[0] * off, cy + r * (a * u3[1] + b * v3[1]) + n[1] * off, cz + r * (a * u3[2] + b * v3[2]) + n[2] * off);
  const N = 40, rimA = [], rimB = []; for (let i = 0; i < N; i++) { const a = i / N * TAU; rimA.push(at(Math.cos(a), Math.sin(a), th / 2)); rimB.push(at(Math.cos(a), Math.sin(a), -th / 2)); }
  if (!ok(rimA) || !ok(rimB)) return;
  const area = (q) => { let s = 0; for (let i = 0; i < q.length; i++) { const p = q[i], m = q[(i + 1) % q.length]; s += p[0] * m[1] - m[0] * p[1]; } return s; };
  const topUp = area(rimA) < 0, face = topUp ? rimA : rimB, off = topUp ? th / 2 : -th / 2;
  g.save(); g.globalAlpha = al;
  poly(topUp ? rimB : rimA, '#77787f');
  for (let i = 0; i < N; i++) { const j = (i + 1) % N; poly([rimA[i], rimA[j], rimB[j], rimB[i]], i % 2 ? '#8d8f97' : '#c4c6cc'); } // the milled edge
  const c0 = at(0, 0, off), kc = kAt(c0); let mx = 0; for (const p of face) mx = Math.max(mx, Math.hypot(p[0] - c0[0], p[1] - c0[1]));
  const sg = g.createRadialGradient(c0[0] - mx * .3, c0[1] - mx * .3, mx * .05, c0[0], c0[1], mx); sg.addColorStop(0, '#f6f6f8'); sg.addColorStop(.6, '#c9cbd1'); sg.addColorStop(1, '#8e9098'); poly(face, sg);
  const ring = []; for (let i = 0; i < N; i++) { const a = i / N * TAU; ring.push(at(Math.cos(a) * .86, Math.sin(a) * .86, off * 1.01)); } poly(ring, null, 'rgba(90,92,100,.7)', Math.max(1, .008 * kc));
  const em = (pts, col) => poly(pts.map(([a, b]) => at(a, b, off * 1.02)), col); // the torch and two olive sprigs, in the coin's plane
  em([[-.06, -.55], [.06, -.55], [.05, .2], [-.05, .2]], '#7d7f87'); em([[-.14, .2], [.14, .2], [.1, .32], [-.1, .32]], '#7d7f87');
  em([[0, .32], [.1, .45], [.04, .58], [0, .7], [-.05, .56], [-.1, .44]], '#9a9ca4');
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) { const b = -.35 + k * .17; em([[sx * .12, b], [sx * .32, b + .1], [sx * .2, b + .12]], '#8a8c94'); }
  if (land > .45 && land < 1.6) { const gl = Math.sin(clamp((land - .45) / .6) * Math.PI), p = at(.55, .55, off); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,255,255,${.4 * gl})`; const s = .16 * kc * gl;
    g.beginPath(); g.moveTo(p[0], p[1] - s); g.lineTo(p[0] + s * .18, p[1] - s * .18); g.lineTo(p[0] + s, p[1]); g.lineTo(p[0] + s * .18, p[1] + s * .18); g.lineTo(p[0], p[1] + s); g.lineTo(p[0] - s * .18, p[1] + s * .18); g.lineTo(p[0] - s, p[1]); g.lineTo(p[0] - s * .18, p[1] - s * .18); g.fill(); g.restore(); }
  g.restore();
}
function scales(t) { // "life's unfair": a balance appears on "share"; on "unfair" the board's side slams down and a crutch props it there
  const sh = wt(17, 'share'), uf = wt(18, 'unfair'); if (t < sh - .3 || t > L_(19).s + .4) return; const al = ease(t, sh - .3, sh + .1) * (1 - ease(t, L_(19).s - .1, L_(19).s + .4));
  const cx = -1.2, cz = .3, H2 = 2.8, half = 1.6, up = easeOutBack(clamp((t - sh + .3) / .5));
  const tip = t < uf ? .06 * Math.sin((t - sh) * 4) : .5 * easeOutBack(clamp((t - uf) / .35), 3), ang = tip, bend = .18 * clamp((t - uf) / .3); // left (the board's gold) goes down
  const brass = '#c9a24a', dark = '#7a5a1c';
  g.save(); g.globalAlpha = al;
  const base = PL(cx, TOP, cz), top = PL(cx, TOP + H2 * up, cz); if (base[2] < .2 || top[2] < .2) { g.restore(); return; }
  seg(base, top, .08 * kAt(base), dark); const kb = kAt(base); g.fillStyle = dark; g.beginPath(); g.ellipse(base[0], base[1], .35 * kb, .08 * kb, 0, 0, TAU); g.fill();
  if (up < .6) { g.restore(); return; }
  const end = (s) => [cx + s * half * Math.cos(ang), TOP + H2 + s * half * Math.sin(ang) * -1 - bend * (1 - Math.abs(s)) * 0, cz];
  const L = end(-1), R = end(1), mid = [cx, TOP + H2 + bend * .2, cz]; // the beam sags soft in the middle
  const bp = []; for (let i = 0; i <= 10; i++) { const u = i / 10, s2 = u * 2 - 1, x = lerp(L[0], R[0], u), y = lerp(L[1], R[1], u) - Math.sin(u * Math.PI) * bend * .5; bp.push(PL(x, y, cz)); }
  for (let i = 0; i < 10; i++) seg(bp[i], bp[i + 1], .07 * kAt(bp[i]), brass);
  const pan = (E, load, swing) => { const hang = 1.2, px = E[0] + swing, py = E[1] - hang, a = PL(...E), b = PL(px, py, cz); if (b[2] < .2) return; const k = kAt(b);
    seg(a, PL(px - .3, py, cz), 1.5, '#5a4520'); seg(a, PL(px + .3, py, cz), 1.5, '#5a4520');
    if (load === 'gold') { for (let c = 0; c < 9; c++) { const q = PL(px + (c % 3 - 1) * .12, py + .03 + Math.floor(c / 3) * .07, cz), kq = kAt(q); g.fillStyle = c % 2 ? '#e6c25a' : '#c7362b'; g.beginPath(); g.ellipse(q[0], q[1], .1 * kq, .035 * kq, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 1; g.stroke(); } }
    else { const q = PL(px, py + .12, cz), kq = kAt(q); g.fillStyle = '#9a9692'; g.beginPath(); g.ellipse(q[0], q[1], .16 * kq, .07 * kq, 0, 0, Math.PI); g.fill(); }
    g.fillStyle = brass; g.beginPath(); g.ellipse(b[0], b[1], .5 * k, .12 * k, 0, 0, Math.PI); g.fill(); g.strokeStyle = dark; g.lineWidth = Math.max(1, .02 * k); g.beginPath(); g.ellipse(b[0], b[1], .5 * k, .12 * k, 0, 0, TAU); g.stroke(); };
  const sw = t > uf ? .12 * Math.sin((t - uf) * 9) * Math.exp(-(t - uf) * 3) : 0;
  pan(L, 'gold', sw); pan(R, 'bowl', -sw);
  const cr = ease(t, uf + .35, uf + .7); if (cr > 0) { const ca = [L[0] + .05, L[1] - .02, cz - .05], cb = [L[0] + .5, TOP, cz - .3]; crutch(ca, [lerp(ca[0], cb[0], cr), lerp(ca[1], cb[1], cr), lerp(ca[2], cb[2], cr)]); }
  const pt = PL(cx, TOP + H2 + .12, cz), kt = kAt(pt); g.fillStyle = brass; g.beginPath(); g.arc(pt[0], pt[1], .1 * kt, 0, TAU); g.fill();
  g.restore();
}
function micBooms(t) { // "and limit the questions the media gets": three furry boom mics with "?" flags reach in, then wilt like cut flowers on "limit"
  const s = L_(22).s, e = L_(22).e; if (t < s - .6 || t > e + .9) return; const lim = wt(22, 'limit');
  const reach = ease(t, s - .6, s + .1) * (1 - ease(t, e + .3, e + .9));
  for (let i = 0; i < 3; i++) { const droop = ease(t, lim + i * .15, lim + .9 + i * .15), a = [-9.5, 3.1 - i * .35, -3.2 + i * .9], tip0 = [lerp(-9, -3.4 + i * .55, reach), 2.3 - i * .15, -1.6 + i * .55];
    const pts = []; for (let k = 0; k <= 14; k++) { const u = k / 14, x = lerp(a[0], tip0[0], u), z = lerp(a[2], tip0[2], u), y0 = lerp(a[1], tip0[1], u) + Math.sin(u * Math.PI) * .35;
      const wilt = droop * (u * u * 2.6 + Math.sin(u * Math.PI) * .3); pts.push(PL(x - droop * u * u * .9, Math.max(.25, y0 - wilt), z)); } // the far half folds down toward the sand
    for (let k = 0; k < 14; k++) seg(pts[k], pts[k + 1], .07 * kAt(pts[k]), k % 3 ? '#8a8d93' : '#6c6f75');
    const p = pts[14], q = pts[13]; if (p[2] < .2) continue; const kk = kAt(p), ang = Math.atan2(p[1] - q[1], p[0] - q[0]);
    g.save(); g.translate(p[0], p[1]); g.rotate(ang); // the furry windscreen, hanging limp once wilted
    g.fillStyle = '#5b5e63'; g.beginPath(); g.ellipse(.25 * kk, 0, .34 * kk, .14 * kk * (1 - .25 * droop), 0, 0, TAU); g.fill();
    g.strokeStyle = '#7c7f86'; g.lineWidth = Math.max(1, .02 * kk); for (let f = 0; f < 16; f++) { const fa = f / 16 * TAU, fx = .25 * kk + Math.cos(fa) * .34 * kk, fy = Math.sin(fa) * .14 * kk; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(fa) * .07 * kk, fy + Math.sin(fa) * .07 * kk + droop * .04 * kk); g.stroke(); }
    g.restore();
    const fp = pts[11]; if (fp[2] > .2) { const fk = kAt(fp); g.save(); g.translate(fp[0], fp[1]); g.rotate(droop * .9); // the "?" flag cube on the pole
      g.fillStyle = ['#d8452f', '#2f6fb5', '#e8b23a'][i]; g.fillRect(-.14 * fk, -.14 * fk, .28 * fk, .28 * fk); g.fillStyle = '#fbf3e3'; g.font = `bold ${Math.max(6, .26 * fk) | 0}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 0, .01 * fk); g.restore(); } }
}
function chessPieces(t) { // the knight hops to the rook; on "foul play" it jumps two squares too far, stomps the rook flat and kicks it off the board
  const s = L_(26).s, e = L_(27).e; if (t < s - .2 || t > e + .8) return; const al = ease(t, s - .2, s + .1) * (1 - ease(t, e + .2, e + .8));
  const rook = wt(26, 'rook'), foul = wt(27, 'foul'), S = 1.5;
  const ku = ease(t, s, rook), hop1 = Math.sin(ku * Math.PI) * .6, fu = clamp((t - foul + .25) / .45), stomp = fu >= 1 ? 1 : 0;
  let kx = lerp(-2.5, 1.0, ku), kz = lerp(-.4, .4, ku), ky = TOP + hop1;
  if (fu > 0) { kx = lerp(1.0, 2.5, fu); kz = .4; ky = TOP + Math.sin(fu * Math.PI) * 1.6; } // the illegal leap, high and long
  const squash = ease(t, foul + .2, foul + .3), kick = ease(t, foul + .55, foul + 1.3);
  g.save(); g.globalAlpha = al;
  const rx = lerp(2.5, 1.9, kick), ry = TOP + Math.sin(kick * Math.PI) * .9 - (kick > .75 ? (kick - .75) * 5 : 0), pr = PL(rx, ry, .4 - kick * 2.6); if (pr[2] > .2) { const kr = kAt(pr) * S;
    g.save(); g.translate(pr[0], pr[1]); g.rotate(kick * 5); g.scale(1 + squash * .6, 1 - squash * .72);
    g.fillStyle = '#efe6cf'; g.fillRect(-.16 * kr, -.55 * kr, .32 * kr, .55 * kr); g.fillRect(-.2 * kr, -.66 * kr, .4 * kr, .12 * kr); for (let i = 0; i < 3; i++) g.fillRect((-.2 + i * .15) * kr, -.76 * kr, .1 * kr, .1 * kr);
    g.strokeStyle = 'rgba(60,50,40,.4)'; g.lineWidth = Math.max(1, .015 * kr); g.strokeRect(-.16 * kr, -.55 * kr, .32 * kr, .55 * kr); g.restore();
    if (squash > 0 && kick < .3) { g.strokeStyle = `rgba(240,230,210,${.6 * (1 - kick / .3)})`; g.lineWidth = Math.max(1, .03 * kr); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI + Math.PI, r0 = .4 * kr, r1 = (.6 + squash * .3) * kr; g.beginPath(); g.moveTo(pr[0] + Math.cos(a) * r0, pr[1] + Math.sin(a) * r0 * .5); g.lineTo(pr[0] + Math.cos(a) * r1, pr[1] + Math.sin(a) * r1 * .5); g.stroke(); } } } // the stomp's dust lines
  const pk = PL(kx, ky - stomp * 0 + (squash > 0 && kick === 0 ? -.05 : 0) + squash * .25 * (1 - kick), kz), kk = kAt(pk) * S; if (pk[2] > .2) { g.save(); g.translate(pk[0], pk[1]); g.rotate(fu > 0 && fu < 1 ? -.4 * Math.sin(fu * Math.PI) : kick > 0 && kick < .4 ? .5 : 0);
    g.fillStyle = '#1d1a1a'; g.beginPath(); g.moveTo(-.2 * kk, 0); g.lineTo(.2 * kk, 0); g.lineTo(.12 * kk, -.3 * kk); g.quadraticCurveTo(.28 * kk, -.5 * kk, .05 * kk, -.78 * kk); g.lineTo(-.22 * kk, -.55 * kk); g.lineTo(-.02 * kk, -.5 * kk); g.lineTo(-.12 * kk, -.3 * kk); g.fill();
    g.fillStyle = '#efe6cf'; g.beginPath(); g.arc(.02 * kk, -.6 * kk, .025 * kk, 0, TAU); g.fill(); g.restore(); }
  g.restore();
}
function truth(t, emissive) { // "put the truth in a box": a small light carried into the open drawer
  const s = wt(19, 'truth') - .2, e = wt(19, 'box') + .3; if (t < s || t > e) return; const u = ease(t, s, e);
  const dm = typeof drawerMouth === 'function' ? drawerMouth() : [-.8, SEAT + .4, 2.1], p = PL(lerp(.2, dm[0], u), lerp(TOP + .4, dm[1], u) + Math.sin(u * Math.PI) * .4, lerp(-.5, dm[2], u)); if (p[2] < .2) return; const k = kAt(p);
  if (emissive) { g.save(); g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], .22 * k); rg.addColorStop(0, 'rgba(255,240,190,.7)'); rg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = rg; g.fillRect(p[0] - .22 * k, p[1] - .22 * k, .44 * k, .44 * k); g.restore(); }
  else { g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(p[0], p[1], .08 * k, 0, TAU); g.fill(); }
}
function driverHat() { // the unseen driver: only a red hat brim showing in the hole
  const p = PL(0, TOP - .05, 0); if (p[2] < .2) return; const k = kAt(p);
  g.fillStyle = '#8f2018'; g.beginPath(); g.ellipse(p[0], p[1], .3 * k, .08 * k, 0, 0, TAU); g.fill();
  g.fillStyle = '#b52c22'; g.beginPath(); g.moveTo(p[0] - .15 * k, p[1]); g.lineTo(p[0] - .13 * k, p[1] - .16 * k); g.quadraticCurveTo(p[0], p[1] - .22 * k, p[0] + .13 * k, p[1] - .16 * k); g.lineTo(p[0] + .15 * k, p[1]); g.fill();
  g.fillStyle = '#3a1410'; g.fillRect(p[0] - .15 * k, p[1] - .05 * k, .3 * k, .035 * k);
}
// (moved from installs.js for draft 3: the bars -> cells -> teeth -> jail chain lives in this file)
// Gilliam, take the lyric literally: wind-up chattering teeth roll past on "soundbite"
function teeth(t, list) {} // draft 3: the soundbite teeth now chatter on the board (cellBars), in the cell bars' screen spot
// the table props in draw order (moved from render.js drawCar for draft 3): behind the near seats, then in front of them
function tablePropsBack(t) {
  chessPieces(t); speakerphone(t); tapeRecorders(t); dime(t); scales(t); pie(t); book(t); chips(t); jailModel(t); newsPress(t);
  whiteboard(t, false);
}
function tablePropsFront(t) { truth(t, false); micBooms(t); }
// scene hook: table-chain things that live on the playa. Pushes {z, draw, shadow} into list.
function tableInto(t, list) {
  const li = 32, s = L_(li).s, e = L_(li + 1).s + .3; // the refrain-3 press stands on the playa, depth-sorted with it
  if (t > s - .3 && t < e) list.push({ z: P(carX(wt(li, 'news')), 0, CZ + 14)[2], draw: () => newsOne(t, li, 3) });
}
