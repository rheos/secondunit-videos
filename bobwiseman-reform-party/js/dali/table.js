// Reform Party, Dali look: the props on the table.
// ---------- things on the table ----------
function drape(pts, y0) { return pts.map(([x, z]) => z < -TD ? [x, y0 - (-TD - z) * 1.05, -TD - .015] : [x, y0, z]); } // a soft object hangs over the front edge
function melt(t) { return clamp((t - 20) / 200) * .55 + ease(t, L_(1).s, L_(1).e) * .12; } // the heat softens the props through the day
function speakerphone(t) {
  const m = melt(t), cz = -.95 - m * .75, cx = 1.2, pts = [];
  for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, r = .34 * (1 + .14 * Math.cos(3 * a)); pts.push([cx + Math.cos(a + .5) * r, cz + Math.sin(a + .5) * r * .9]); }
  const P3 = drape(pts, TOP + .04).map((p) => PL(...p)); if (!ok(P3)) return;
  poly(P3, '#2f3136'); poly(drape(pts.map(([x, z]) => [cx + (x - cx) * .55, cz + (z - cz) * .55]), TOP + .05).map((p) => PL(...p)), '#3f4248');
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; const q = PL(...drape([[cx + Math.cos(a) * .1, cz + Math.sin(a) * .09]], TOP + .06)[0]); g.fillStyle = '#16171a'; g.beginPath(); g.arc(q[0], q[1], .012 * kAt(q), 0, TAU); g.fill(); }
  // LEDs: green while it may speak; red, with tape across, once the scientists can't
  const cant = wt(1, 'can'), red = t > cant && t < L_(2).s + .5;
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5, r = .3; const q = PL(...drape([[cx + Math.cos(a) * r * .8, cz + Math.sin(a) * r * .72]], TOP + .06)[0]); g.fillStyle = red ? '#ff3b2a' : '#57e07a'; g.beginPath(); g.arc(q[0], q[1], .02 * kAt(q), 0, TAU); g.fill(); }
  const tape = ease(t, cant - .05, cant + .2) * (1 - ease(t, L_(2).s + .3, L_(2).s + .6));
  if (tape > 0) for (const d of [1, -1]) { const s1 = drape([[cx - .3 * tape, cz - .25 * d * tape], [cx + .3 * tape, cz + .25 * d * tape]], TOP + .07).map((p) => PL(...p)); seg(s1[0], s1[1], .09 * kAt(s1[0]), '#e6d7b0'); }
  // the soundbite: rings go out across the table and the last one has a bite taken out
  const sb = wt(8, 'patent'); if (t > sb - .3 && t < L_(8).e + .4) for (let r = 0; r < 4; r++) { const age = ((t - sb + .3) * 1.4 - r * .35); if (age < 0 || age > 1.6) continue; const R = .4 + age * .9, ring = [];
    for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; if (r === 3 && a > 4.2 && a < 4.9) continue; ring.push(PL(cx + Math.cos(a) * R, TOP + .06, cz + Math.sin(a) * R * .9)); }
    g.save(); g.globalAlpha = clamp(1.6 - age); g.strokeStyle = '#f8ecd0'; g.lineWidth = 3; g.beginPath(); ring.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore(); }
}
function boardMap() { // whiteboard on an easel at the right end of the table
  const x0 = 2.45, x1 = 3.95, z = .25, y0 = TOP + 1.55, y1 = TOP + .45;
  return { tl: PL(x0, y0, z), tr: PL(x1, y0, z), bl: PL(x0, y1, z), br: PL(x1, y1, z), legs: [[x0 + .1, z], [x1 - .1, z], [(x0 + x1) / 2, z + .5]], y0 };
}
function whiteboard(t, emissive) {
  const B = boardMap(); if (!ok([B.tl, B.tr, B.bl, B.br])) return;
  if (!emissive) for (const [x, z] of B.legs) seg(PL(x, B.y0 + .1, .25), PL(x, TOP, z), .04 * kAt(B.tl), '#6b4a2a');
  const a = B.tr[0] - B.tl[0], b = B.tr[1] - B.tl[1], c = B.bl[0] - B.tl[0], d = B.bl[1] - B.tl[1];
  if (a * d - b * c <= 0) { if (!emissive) poly([B.tl, B.tr, B.br, B.bl], '#8a8f96'); return; } // its back, mid-spin
  g.save(); g.setTransform(a, b, c, d, B.tl[0], B.tl[1]);
  const m = melt(t), burn = ease(t, L_(35).s - .5, L_(35).s + 4);
  if (emissive) { if (burn > 0 && t < L_(35).s + 9) boardFire(t, burn); g.restore(); return; }
  // the board, its bottom edge sagging and dripping in the heat
  const sag = (u, i, k) => 1 + m * (.1 + .32 * u * u) * k + (i % 3 === 1 ? m * .2 * k * Math.sin(i * 7) ** 2 : 0);
  g.beginPath(); g.moveTo(-.04, -.05); g.lineTo(1.04, -.05); for (let i = 10; i >= 0; i--) { const u = i / 10; g.lineTo(u * 1.08 - .04, sag(u, i, 1.15) + .02); } g.closePath(); g.fillStyle = '#b8b1a2'; g.fill();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(1, 0); for (let i = 10; i >= 0; i--) { const u = i / 10; g.lineTo(u, sag(u, i, 1)); } g.closePath();
  const wg = g.createLinearGradient(0, 0, 1, 1); wg.addColorStop(0, '#fbfbf6'); wg.addColorStop(1, '#d9dbd6'); g.fillStyle = wg; g.fill();
  if (burn > .2) { g.globalAlpha = clamp(burn); g.fillStyle = '#1b1210'; g.fill(); g.globalAlpha = 1; }
  if (burn < .6) { charts(t, 1 - burn / .6); chartClimbers(t); }
  g.restore();
}
function charts(t, al) {
  g.globalAlpha = al; g.lineCap = 'round'; g.lineJoin = 'round';
  const crime = wt(7, 'crime'), bars = ease(t, crime - .2, crime + .6) * (1 - ease(t, L_(8).s + .2, L_(8).s + .8));
  const wars = wt(21, 'wars'), soar = ease(t, wars - .2, L_(21).e) * (1 - ease(t, L_(22).e, L_(22).e + .5));
  const pieA = ease(t, L_(22).e - .4, L_(22).e) * (1 - ease(t, L_(23).s + .4, L_(23).s + .9));
  // bar chart (left): on "crime" its bars become the bars of a cell
  const hs = [.25, .38, .3, .5, .62];
  for (let i = 0; i < 5; i++) { const x = .08 + i * .085, h = lerp(hs[i] + .05 * Math.sin(t * .7 + i), .82, bars); g.fillStyle = bars > .5 ? '#2a2a2e' : ['#2f6fb5', '#c7362b', '#2f6fb5', '#c7362b', '#2f6fb5'][i]; g.fillRect(x, .9 - h, lerp(.06, .025, bars), h); }
  if (bars > .5) { g.strokeStyle = '#2a2a2e'; g.lineWidth = .02; g.globalAlpha = al * (bars - .5) * 2; g.strokeRect(.05, .06, .45, .84); g.globalAlpha = al; }
  // line chart (right) that only goes up; on "wars" it climbs off the board
  g.strokeStyle = '#2a2a2e'; g.lineWidth = .012; g.beginPath(); g.moveTo(.56, .1); g.lineTo(.56, .9); g.lineTo(.96, .9); g.stroke();
  g.strokeStyle = '#c7362b'; g.lineWidth = .02; g.beginPath(); const pts = [[.58, .8], [.66, .72], [.73, .76], [.8, .58], [.87, .5], [.93, .34]];
  pts.forEach(([x, y], i) => { const yy = y - soar * i * i * .09; i ? g.lineTo(x, yy) : g.moveTo(x, yy); }); g.stroke();
  if (pieA > 0) { g.globalAlpha = al * pieA; g.fillStyle = '#fbfbf6'; g.fillRect(.04, .04, .92, .92); g.fillStyle = '#2f6fb5'; g.beginPath(); g.moveTo(.5, .5); g.arc(.5, .5, .32, 0, 5); g.fill(); g.fillStyle = '#c7362b'; g.beginPath(); g.moveTo(.53, .48); g.arc(.53, .48, .32, 5, TAU); g.fill(); }
  g.globalAlpha = 1;
}
function boardFire(t, burn) {
  g.globalCompositeOperation = 'lighter'; const die = 1 - ease(t, L_(35).s + 5, L_(35).s + 9);
  for (let i = 0; i < 14; i++) { const x = .04 + i * .07, h = (.25 + .6 * clamp(burn * 1.4)) * (.6 + .4 * n1(70 + i, t * 3)) * die;
    const fg = g.createLinearGradient(0, 1.05, 0, 1.05 - h); fg.addColorStop(0, 'rgba(255,220,120,.9)'); fg.addColorStop(.5, 'rgba(255,120,30,.6)'); fg.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = fg;
    g.beginPath(); g.moveTo(x - .06, 1.05); g.quadraticCurveTo(x - .04 + .03 * n1(80 + i, t * 4), 1.05 - h * .6, x + .02 * n1(90 + i, t * 5), 1.05 - h); g.quadraticCurveTo(x + .05, 1.05 - h * .5, x + .06, 1.05); g.fill(); }
  g.globalCompositeOperation = 'source-over';
}
function tapeRecorders(t) { // "every tape recorder" goes into the drawer
  const t0 = wt(2, 'every') - .2; if (t < t0 || t > L_(2).e + .2) return; const dr = [-.8, SEAT + .4, 2.05];
  for (let i = 0; i < 4; i++) { const st = t0 + i * .35, u = clamp((t - st) / .9); if (t < st || u >= 1) continue;
    const s = [-2.6 + i * 1.1, TOP + .05, -.8 + (i % 2) * .5]; const x = lerp(s[0], dr[0], u), z = lerp(s[2], dr[2], u), y = lerp(s[1], dr[1], u) + Math.sin(u * Math.PI) * .6;
    const p = PL(x, y, z); if (p[2] < .2) continue; const k = kAt(p) * (1 - u * .4);
    g.save(); g.translate(p[0], p[1]); g.rotate(u * 3 + i); g.fillStyle = '#3a3a40'; g.fillRect(-.12 * k, -.075 * k, .24 * k, .15 * k); g.fillStyle = '#d8d0bc';
    for (const dx of [-.05, .05]) { g.beginPath(); g.arc(dx * k, -.01 * k, .03 * k, 0, TAU); g.fill(); } g.restore(); }
}
function newspapers(t) { // "restrict access to news": the papers come down and wilt over the edge, blank
  const s = L_(4).s; if (t < s - .2 || t > L_(5).s + .3) return; const fade = 1 - ease(t, L_(5).s - .2, L_(5).s + .3);
  for (let i = 0; i < 3; i++) { const land = s + .6 + i * .5, u = ease(t, land - 1.1, land), cx = -2.7 + i * 1.5, len = .55 * u + .45 * ease(t, land, land + 1);
    const sheet = []; for (let a = 0; a <= 6; a++) sheet.push([cx - .35 + a * .117, -1.05]); for (let a = 6; a >= 0; a--) sheet.push([cx - .35 + a * .117, -1.05 - len]);
    const lift = (1 - u) * 3.2, sw = (1 - u) * Math.sin(t * 5 + i) * .4;
    const P3 = drape(sheet.map(([x, z]) => [x + sw, z]), TOP + .03).map(([x, y, z]) => PL(x, y + lift, z)); g.save(); g.globalAlpha = fade; poly(P3, '#ece6d6', 'rgba(60,50,40,.4)', 1.2);
    for (let c = 0; c < 3; c++) { const col = drape([[cx - .25 + c * .22, -1.15], [cx - .25 + c * .22, -1.05 - len * .9]], TOP + .035).map(([x, y, z]) => PL(x + sw, y + lift, z)); seg(col[0], col[1], .1 * kAt(col[0]), 'rgba(150,140,125,.45)'); }
    g.restore(); }
}
function cage(p, k, legs) { // a cell on spindly stilt legs; p = ground point, k = px per metre; legs 0..1 grows the stilts
  if (p[2] < .2) return; const L = 7 * legs, x = p[0], y = p[1];
  g.strokeStyle = '#3b3232'; g.lineWidth = Math.max(1, .12 * k); g.lineCap = 'round';
  for (const d of [-1, -.4, .4, 1]) { g.beginPath(); g.moveTo(x + d * 1.1 * k, y - L * k); g.quadraticCurveTo(x + d * 1.4 * k, y - L * .5 * k, x + d * 1.5 * k, y); g.stroke(); }
  const cy = y - L * k; g.fillStyle = '#6d6058'; g.fillRect(x - 1.3 * k, cy - .25 * k, 2.6 * k, .25 * k); g.fillRect(x - 1.3 * k, cy - 2.75 * k, 2.6 * k, .3 * k);
  g.fillStyle = 'rgba(40,30,30,.35)'; g.fillRect(x - 1.2 * k, cy - 2.45 * k, 2.4 * k, 2.2 * k);
  g.lineWidth = Math.max(1, .09 * k); for (let i = 0; i <= 7; i++) { const bx = x - 1.2 * k + i * 2.4 / 7 * k; g.beginPath(); g.moveTo(bx, cy - 2.45 * k); g.lineTo(bx, cy - .25 * k); g.stroke(); }
}
function jailModel(t) { // "their grand plan unveiled": a cloth lifts off three little cells on stilts
  const s = L_(9).s, un = wt(9, 'unveiled'); if (t < s - .3 || t > L_(9).e + 1) return; const fade = 1 - ease(t, L_(9).e + .3, L_(9).e + 1);
  g.save(); g.globalAlpha = fade;
  for (let i = 0; i < 3; i++) { const p = PL(-1.8 + i * .9, TOP, -.4); cage(p, kAt(p) * .13, 1); }
  const lift = ease(t, un - .2, un + .7); if (lift < 1) { const cl = []; for (let i = 0; i <= 10; i++) cl.push(PL(-2.4 + i * .24, TOP + 1.4 + lift * 2 + .1 * Math.sin(i * 1.3 + t * 4), -.4)); for (let i = 10; i >= 0; i--) cl.push(PL(-2.4 + i * .24 + lift * .5, TOP + .02 + lift * 2.5, -.6)); g.globalAlpha = fade * (1 - lift); poly(cl, '#efe7d4'); }
  g.restore();
}
const JAILS = [[-14, 30], [-2, 46], [9, 26], [22, 52], [34, 33]];
function jails(t, list) { const j = wt(9, 'jails'); if (t < j - .1) return; const base = carX(j);
  JAILS.forEach(([x, z], i) => { const legs = easeOutBack(clamp((t - j - i * .18) / .9)), X = base + x + 8;
    list.push({ z: P(X, 0, z)[2], draw: () => { const p = P(X, 0, z); cage(p, kAt(p), legs); }, shadow: () => shadowStick(X, 0, 7 * legs + 2.8, z, 2.6, t) }); }); }
function chips(t) { // "expand the wars and the military bets": chip stacks grow on the table
  const s = L_(21).s, e = L_(21).e; if (t < s || t > e + 1.2) return; const sink = 1 - ease(t, e + .2, e + 1.2);
  for (let i = 0; i < 4; i++) { const n = Math.floor(clamp((t - s - i * .25) / 1.8) * 14 * sink), x = 1.7 + i * .25, z = -.35 + (i % 2) * .22;
    for (let c = 0; c < n; c++) { const p = PL(x, TOP + c * .035, z), k = kAt(p); g.fillStyle = ['#c7362b', '#f4efe6', '#2f6fb5', '#1c1c1c'][i]; g.beginPath(); g.ellipse(p[0], p[1], .14 * k, .05 * k, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.stroke(); } }
}
function micBooms(t) { // "and limit the questions the media gets": the boom mics wilt before they reach the table
  const s = L_(22).s, e = L_(22).e; if (t < s - .5 || t > e + .8) return; const reach = ease(t, s - .5, s + .2) * (1 - ease(t, e + .2, e + .8)), droop = ease(t, wt(22, 'limit'), wt(22, 'limit') + .8);
  for (let i = 0; i < 2; i++) { const a = [-9, 2.8 - i * .5, -3.4 + i * .7], tip = [lerp(-9, -2.6 + i * .8, reach), lerp(2.2, .4, droop), -1.3 + i * .4];
    const pts = []; for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push(PL(lerp(a[0], tip[0], u), lerp(a[1], tip[1], u) + Math.sin(u * Math.PI) * (1 - droop) * .4 - droop * u * u * .4, lerp(a[2], tip[2], u))); }
    for (let k = 0; k < 12; k++) seg(pts[k], pts[k + 1], .05 * kAt(pts[k]), '#888b90');
    const p = pts[12]; if (p[2] < .2) continue; const kk = kAt(p); g.save(); g.translate(p[0], p[1]); g.rotate(droop * 1.2); g.fillStyle = '#5b5e63'; g.beginPath(); g.ellipse(0, 0, .3 * kk, .1 * kk, 0, 0, TAU); g.fill(); g.restore(); }
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
function chessPieces(t) { // the knight hops to the rook, then on "foul play" knocks it down
  const s = L_(26).s, e = L_(27).e; if (t < s - .2 || t > e + .8) return; const al = ease(t, s - .2, s + .1) * (1 - ease(t, e + .2, e + .8));
  const rook = wt(26, 'rook'), foul = wt(27, 'foul');
  const ku = ease(t, s, rook), kx = lerp(-2.5, 1.9, ku), kz = lerp(-.4, .4, ku), hop = Math.sin(ku * Math.PI) * .6, fall = ease(t, foul, foul + .4);
  g.save(); g.globalAlpha = al; const pr = PL(2.5, TOP, .4), kr = kAt(pr); g.save(); g.translate(pr[0], pr[1]); g.rotate(fall * 1.45);
  g.fillStyle = '#efe6cf'; g.fillRect(-.16 * kr, -.55 * kr, .32 * kr, .55 * kr); g.fillRect(-.2 * kr, -.66 * kr, .4 * kr, .12 * kr); for (let i = 0; i < 3; i++) g.fillRect((-.2 + i * .15) * kr, -.76 * kr, .1 * kr, .1 * kr); g.restore();
  const pk = PL(kx, TOP + hop, kz), kk = kAt(pk); g.fillStyle = '#1d1a1a'; g.beginPath(); g.moveTo(pk[0] - .2 * kk, pk[1]); g.lineTo(pk[0] + .2 * kk, pk[1]); g.lineTo(pk[0] + .12 * kk, pk[1] - .3 * kk); g.quadraticCurveTo(pk[0] + .28 * kk, pk[1] - .5 * kk, pk[0] + .05 * kk, pk[1] - .78 * kk); g.lineTo(pk[0] - .22 * kk, pk[1] - .55 * kk); g.lineTo(pk[0] - .02 * kk, pk[1] - .5 * kk); g.lineTo(pk[0] - .12 * kk, pk[1] - .3 * kk); g.fill(); g.restore();
}
function dime(t) { // "people had a dime": a coin rolls to the edge and goes soft over it
  const d = wt(15, 'dime'); if (t < d - .2 || t > L_(16).e + .6) return; const al = 1 - ease(t, L_(16).e, L_(16).e + .6);
  const u = ease(t, d - .2, d + 1.0), cx = lerp(-1.9, -1.5, u), sag = ease(t, d + .9, d + 1.8);
  g.save(); g.globalAlpha = al;
  if (sag <= 0) { const p = PL(cx, TOP + .14, -.9 - u * .55), k = kAt(p); g.fillStyle = '#c9c3b8'; g.beginPath(); g.ellipse(p[0], p[1], .05 * k + .09 * k * Math.abs(Math.cos(u * 9)), .14 * k, 0, 0, TAU); g.fill(); g.strokeStyle = '#7b766d'; g.lineWidth = 2; g.stroke(); }
  else { const ps = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; ps.push([cx + Math.cos(a) * .14, -1.45 - sag * .2 + Math.sin(a) * .14 * (1 + sag)]); } poly(drape(ps, TOP + .02).map((p) => PL(...p)), '#c9c3b8', '#7b766d', 2); }
  g.restore();
}
function truth(t, emissive) { // "put the truth in a box": a small light carried into the open drawer
  const s = wt(19, 'truth') - .2, e = wt(19, 'box') + .3; if (t < s || t > e) return; const u = ease(t, s, e);
  const p = PL(lerp(.2, -.8, u), lerp(TOP + .4, SEAT + .4, u) + Math.sin(u * Math.PI) * .4, lerp(-.5, 2.1, u)); if (p[2] < .2) return; const k = kAt(p);
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
function teeth(t, list) { const s = wt(8, 'patent') - .5; if (t < s || t > L_(9).s + 1) return; const X = carX(s) + 26 - (t - s) * 3.4, Z = 9; const p = P(X, 0, Z); if (p[2] < 1.5) return;
  list.push({ z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1] - .4 * k, ch = Math.abs(Math.sin(t * 14)) * .5 * k;
    g.fillStyle = '#e07a8a'; g.beginPath(); g.ellipse(x, y - .6 * k, 1.6 * k, .55 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x, y - 1.3 * k - ch, 1.6 * k, .55 * k, 0, 0, TAU); g.fill();
    g.fillStyle = '#fbf7ec'; for (let i = 0; i < 8; i++) { g.fillRect(x - 1.3 * k + i * .33 * k, y - 1 * k, .28 * k, .4 * k); g.fillRect(x - 1.3 * k + i * .33 * k, y - 1.3 * k - ch, .28 * k, .4 * k); }
    g.strokeStyle = '#c9a43a'; g.lineWidth = .12 * k; g.save(); g.translate(x + 1.9 * k, y - .9 * k); g.rotate(t * 5); g.beginPath(); g.moveTo(-.5 * k, 0); g.lineTo(.5 * k, 0); g.moveTo(0, -.5 * k); g.lineTo(0, .5 * k); g.stroke(); g.restore();
    g.fillStyle = '#1a1412'; g.beginPath(); g.arc(x - 1 * k, p[1] - .2 * k, .2 * k, 0, TAU); g.arc(x + 1 * k, p[1] - .2 * k, .2 * k, 0, TAU); g.fill(); }, shadow: () => shadowStick(X, 0, 2, Z, 3, t) }); }
