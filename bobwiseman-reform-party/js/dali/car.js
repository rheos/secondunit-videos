// Reform Party, Dali look: the suits and the boardroom table car.
// ---------- figures ----------
function egg(x, y, k, front, grin) { // the party's faceless egg head
  const rx = .125 * k, ry = .155 * k, eg = g.createRadialGradient(x - rx * .4, y - ry * .45, rx * .1, x, y, ry * 1.2);
  eg.addColorStop(0, '#fffaf0'); eg.addColorStop(.55, PAL.egg); eg.addColorStop(1, '#b49a7c');
  g.fillStyle = eg; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill();
  if (front && grin > 0) { // a grin and nothing else
    g.save(); g.globalAlpha = grin; g.fillStyle = '#2b1c18'; g.beginPath(); g.ellipse(x, y + ry * .3, rx * .62, ry * .28, 0, 0, Math.PI); g.closePath(); g.fill();
    g.fillStyle = '#fbf3e3'; g.beginPath(); g.ellipse(x, y + ry * .3, rx * .55, ry * .1, 0, 0, Math.PI); g.closePath(); g.fill(); g.restore();
  }
}
function rosette(x, y, r) {
  g.fillStyle = PAL.rosette; g.beginPath(); g.moveTo(x - r * .4, y); g.lineTo(x - r * .7, y + r * 2.3); g.lineTo(x - r * .2, y + r * 2); g.lineTo(x, y); g.fill();
  g.beginPath(); g.moveTo(x + r * .2, y); g.lineTo(x + r * .3, y + r * 2.4); g.lineTo(x + r * .75, y + r * 2.1); g.lineTo(x + r * .5, y); g.fill();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.arc(x + Math.cos(a) * r * .75, y + Math.sin(a) * r * .75, r * .38, 0, TAU); g.fill(); }
  g.fillStyle = '#f6d8a0'; g.beginPath(); g.arc(x, y, r * .42, 0, TAU); g.fill();
}
function arm(sx, sy, hx, hy, k, col) { g.strokeStyle = col; g.lineWidth = .1 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + hx) / 2 + (hx > sx ? -1 : 1) * .03 * k, (sy + hy) / 2 + .05 * k, hx, hy); g.stroke(); g.fillStyle = PAL.egg; g.beginPath(); g.arc(hx, hy, .045 * k, 0, TAU); g.fill(); }
// A seated suit. (x, y) = screen point of the seat; k = px per metre.
// o: front, grin, arms ('rest'|'vote2'|'gavel'|'vogue'|'shrug'), lift, drawer (0..1), nod.
function suit(x, y, k, o) {
  const front = o.front, nod = (o.nod || 0) * .035 * k;
  const chairBack = () => { g.fillStyle = PAL.wood; g.fillRect(x - .27 * k, y - .66 * k, .54 * k, .08 * k); g.fillRect(x - .25 * k, y - .62 * k, .05 * k, .62 * k); g.fillRect(x + .2 * k, y - .62 * k, .05 * k, .62 * k); };
  if (front) chairBack();
  g.fillStyle = '#5c3a1c'; g.fillRect(x - .28 * k, y - .02 * k, .56 * k, .06 * k); // seat
  // legs dangling in mid-air
  g.fillStyle = PAL.suit; const sw = Math.sin(o.swing || 0) * .03 * k;
  g.fillRect(x - .19 * k, y - .03 * k, .17 * k, .14 * k); g.fillRect(x + .02 * k, y - .03 * k, .17 * k, .14 * k);
  g.fillRect(x - .17 * k + sw, y + .1 * k, .13 * k, .36 * k); g.fillRect(x + .04 * k - sw, y + .1 * k, .13 * k, .36 * k);
  g.fillStyle = '#141216'; g.beginPath(); g.ellipse(x - .11 * k + sw, y + .48 * k, .09 * k, .045 * k, 0, 0, TAU); g.ellipse(x + .11 * k - sw, y + .48 * k, .09 * k, .045 * k, 0, 0, TAU); g.fill();
  // torso
  const ty = y - .02 * k, sh = y - .62 * k;
  const jg = g.createLinearGradient(x - .26 * k, 0, x + .26 * k, 0); jg.addColorStop(0, PAL.suitLit); jg.addColorStop(1, PAL.suit);
  g.fillStyle = jg; g.beginPath(); g.moveTo(x - .2 * k, ty); g.lineTo(x - .27 * k, sh + .05 * k); g.quadraticCurveTo(x - .25 * k, sh, x - .16 * k, sh - .02 * k); g.lineTo(x + .16 * k, sh - .02 * k); g.quadraticCurveTo(x + .25 * k, sh, x + .27 * k, sh + .05 * k); g.lineTo(x + .2 * k, ty); g.closePath(); g.fill();
  if (front) {
    g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(x - .08 * k, sh - .01 * k); g.lineTo(x, sh + .3 * k); g.lineTo(x + .08 * k, sh - .01 * k); g.fill();
    g.fillStyle = '#8f1d1d'; g.beginPath(); g.moveTo(x - .02 * k, sh + .03 * k); g.lineTo(x + .02 * k, sh + .03 * k); g.lineTo(x + .03 * k, sh + .25 * k); g.lineTo(x, sh + .29 * k); g.lineTo(x - .03 * k, sh + .25 * k); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = .012 * k; g.beginPath(); g.moveTo(x - .08 * k, sh); g.lineTo(x - .02 * k, sh + .36 * k); g.moveTo(x + .08 * k, sh); g.lineTo(x + .02 * k, sh + .36 * k); g.stroke();
    if (o.drawer != null) drawers(x, sh, k, o.drawer);
    else rosette(x - .15 * k, sh + .12 * k, .035 * k);
  } else { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .012 * k; g.beginPath(); g.moveTo(x, sh + .05 * k); g.lineTo(x, ty); g.stroke(); chairBack(); }
  // arms
  const L = [x - .24 * k, sh + .06 * k], R = [x + .24 * k, sh + .06 * k], lift = o.lift || 0, a = o.arms || 'rest';
  let hl = [x - .2 * k, y - .12 * k], hr = [x + .2 * k, y - .12 * k];
  if (a === 'vote2') { hr = [x + lerp(.2, .32, lift) * k, lerp(y - .12 * k, sh - .62 * k, lift)]; hl = [x - lerp(.2, .32, lift) * k, lerp(y - .12 * k, sh - .62 * k, lift)]; }
  if (a === 'gavel') hr = [x + .34 * k, lerp(sh + .1 * k, sh - .45 * k, lift)];
  if (a === 'vogue') { hr = [x + .05 * k, sh - .28 * k]; hl = [x - .34 * k, lerp(y - .12 * k, sh - .25 * k, lift)]; }
  if (a === 'shrug') { hl = [x - .36 * k, sh + .02 * k - lift * .1 * k]; hr = [x + .36 * k, sh + .02 * k - lift * .1 * k]; }
  if (front || a !== 'rest') { arm(...L, ...hl, k, front ? PAL.suitLit : PAL.suit); arm(...R, ...hr, k, PAL.suit); } // from behind, resting hands are out of sight on the table
  if (a === 'gavel') { g.save(); g.translate(hr[0], hr[1]); g.rotate(-.5 + lift * .9); g.fillStyle = '#4a2a14'; g.fillRect(-.015 * k, -.25 * k, .03 * k, .27 * k); g.fillRect(-.09 * k, -.32 * k, .18 * k, .08 * k); g.restore(); }
  // neck + head
  g.fillStyle = '#d7c3a3'; g.fillRect(x - .04 * k, sh - .07 * k, .08 * k, .08 * k);
  egg(x, sh - .19 * k + nod, k, front, o.grin || 0);
}
function drawers(x, sh, k, open) { // a torso of drawers: the middle one slides out toward us
  for (let i = 0; i < 3; i++) {
    const dy = sh + (.1 + i * .14) * k, dw = .26 * k, dh = .1 * k, o = i === 1 ? open : 0;
    g.fillStyle = '#7b5530'; g.fillRect(x - dw / 2, dy, dw, dh); g.strokeStyle = '#3a2412'; g.lineWidth = .01 * k; g.strokeRect(x - dw / 2, dy, dw, dh);
    if (o > 0) { const d = o * .16 * k; g.fillStyle = '#2a1608'; g.fillRect(x - dw / 2, dy, dw, dh); g.fillStyle = '#a77a48'; g.beginPath(); g.moveTo(x - dw / 2, dy + dh); g.lineTo(x - dw / 2 - d * .3, dy + dh + d); g.lineTo(x + dw / 2 + d * .3, dy + dh + d); g.lineTo(x + dw / 2, dy + dh); g.fill();
      g.fillStyle = '#8c6338'; g.fillRect(x - dw / 2 - d * .3, dy + dh + d - .01 * k, dw + d * .6, dh * .9); g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(x, dy + dh + d + dh * .4, .014 * k, 0, TAU); g.fill(); }
    else { g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(x, dy + dh / 2, .014 * k, 0, TAU); g.fill(); }
  }
}

// ---------- the table car ----------
const SEATS = [ // local x, z, faces camera at yaw 0, role
  ...[-3.6, -2.25, -.8, .55, 1.9, 3.25].map((x) => ({ x, z: 2.3, r: x === -.8 ? 'drawer' : 'b' })),
  ...[-3.6, -2.25, -.8, .55, 1.9, 3.25].map((x) => ({ x, z: -2.3, r: 'f' })),
  { x: -5.15, z: 0, r: 'chair' }, { x: 5.15, z: 0, r: 'end' },
];
function seatState(s, t, i) {
  const o = { arms: 'rest', grin: 0, nod: Math.sin(t * 1.3 + i * 1.7) * .3, swing: t * 2 + i };
  o.front = (s.r === 'chair' || s.r === 'end') ? 1 : (Math.cos(YAW) * Math.sign(s.z) > 0 ? 1 : 0); // as the table spins, who faces us flips
  for (const li of [5, 12, 33]) { const gr = wt(li, 'grin'); o.grin = Math.max(o.grin, ease(t, gr - .1, gr + .4) * (1 - ease(t, L_(li).e + 1, L_(li).e + 1.6))); }
  if (s.r === 'chair') { const law = wt(0, 'law'); if (t > law - 1.2 && t < law + 1.2) { o.arms = 'gavel'; o.lift = t < law ? ease(t, law - 1.1, law - .3) : 0; } }
  if (s.r === 'drawer') o.drawer = Math.max(ease(t, L_(2).s, L_(2).s + .6) * (1 - ease(t, L_(2).e - .2, L_(2).e + .3)), ease(t, wt(19, 'put') - .1, wt(19, 'put') + .5) * (1 - ease(t, wt(20, 'talk') - .1, wt(20, 'talk') + .25)));
  if (t > L_(14).s && t < L_(14).e + .2) { o.arms = 'vogue'; o.lift = .5 + .5 * Math.sin((t - L_(14).s) * 6 + i); }
  if (t > L_(17).s && t < L_(18).e) { o.arms = 'shrug'; o.lift = ease(t, L_(18).s, L_(18).s + .3); }
  if (t > L_(30).s && t < L_(30).e + .3) { const beat = (t - L_(30).s) * 1.6; o.nod = Math.abs(Math.sin(beat * Math.PI)) * 1.2; } // rehearsed: all nod as one
  const v0 = L_(36).s; if (t > v0 && t < 238) { o.arms = 'vote2'; o.lift = ease(t, v0 + .3 + i * .12, v0 + 1 + i * .12); }
  return o;
}
function seatGeom(s) { const out = Math.sign(s.z), by = SEAT - .06; if (!s.z) { const d = Math.sign(s.x); return { beamA: [d * TL, by, 0], beamB: [s.x - d * .1, by, 0], crutch: [[s.x, by - .05, 0], [s.x + d * .5, 0, .3]] }; }
  return { beamA: [s.x, by, out * TD], beamB: [s.x, by, s.z - out * .1], crutch: [[s.x, by - .05, s.z], [s.x + .3, 0, s.z + out * .5]] }; }
function crutch(a, b) { // a Dali crutch: a long pole with a padded fork at the top
  const pa = PL(...a), pb = PL(...b); if (pa[2] < .1 || pb[2] < .1) return; const k = kAt(pa);
  seg(pa, pb, .05 * k, PAL.crutch);
  const fl = PL(a[0] - .18, a[1] - .1, a[2]), fr = PL(a[0] + .18, a[1] - .1, a[2]), fm = PL(a[0], a[1] - .3, a[2]);
  seg(fm, fl, .035 * k, PAL.crutch); seg(fm, fr, .035 * k, PAL.crutch);
  const pl = PL(a[0] - .22, a[1], a[2]), pr = PL(a[0] + .22, a[1], a[2]); seg(pl, pr, .08 * k, '#e9dcc2');
  g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(pb[0], pb[1], .05 * kAt(pb), 0, TAU); g.fill();
}
function tableShadow(t) {
  const pts = []; for (const [x, z] of [[-TL, -TD], [TL, -TD], [TL, TD], [-TL, TD]]) { pts.push(Lw(x, TOP, z)); pts.push(Lw(x * .97, .2, z * .9)); }
  shadowOf(pts, t);
  const sv = sunVec(t), a = shadowA(t); if (a < .01) return;
  for (const s of SEATS) { const G = seatGeom(s);
    shadowOf([Lw(s.x - .25, SEAT - .45, s.z), Lw(s.x + .25, SEAT - .45, s.z), Lw(s.x + .25, SEAT + .5, s.z), Lw(s.x - .25, SEAT + .5, s.z), Lw(s.x, SEAT + 1.05, s.z)], t);
    const pa = shadowPt(...Lw(...G.crutch[0]), sv), pb = shadowPt(...Lw(...G.crutch[1]), sv); seg(pa, pb, .05 * kAt(pa), `rgba(52,34,58,${a})`); }
}
function tableBody(t) {
  const c = PL;
  for (const [x, z] of [[-2.8, -1.2], [2.8, -1.2], [-2.8, 1.2], [2.8, 1.2]]) { const p = c(x, .2, z); if (p[2] < .2) continue; const k = kAt(p); g.fillStyle = '#17120f'; g.beginPath(); g.ellipse(p[0], p[1], .14 * k, .2 * k, 0, 0, TAU); g.fill(); }
  // skirt: four hanging cloth panels that hide the car, drawn back to front
  const faces = [[[-TL * .97, -TD * .93], [TL * .97, -TD * .93]], [[TL * .97, -TD * .93], [TL * .97, TD * .93]], [[TL * .97, TD * .93], [-TL * .97, TD * .93]], [[-TL * .97, TD * .93], [-TL * .97, -TD * .93]]];
  const fd = faces.map((f) => [c((f[0][0] + f[1][0]) / 2, 1.2, (f[0][1] + f[1][1]) / 2)[2], f]).sort((a, b) => b[0] - a[0]);
  const N = 14, hem = (u) => .24 + .05 * Math.sin(u * 20 + t * 1.5);
  for (const [, f] of fd) {
    const at = (u, y) => c(lerp(f[0][0], f[1][0], u), y, lerp(f[0][1], f[1][1], u));
    const pts = []; for (let i = 0; i <= N; i++) pts.push(at(i / N, TOP - .2)); for (let i = N; i >= 0; i--) pts.push(at(i / N, hem(i / N)));
    poly(pts, PAL.skirt);
    for (let i = 1; i < N; i++) seg(at(i / N, TOP - .23), at(i / N, .3), 2, 'rgba(0,0,0,.18)');
    for (let i = 0; i < N; i++) { const a = at(i / N, hem(i / N)); seg(a, at((i + 1) / N, hem((i + 1) / N)), .05 * kAt(a), '#d6a632'); }
  }
  const tc = [[-TL, -TD], [TL, -TD], [TL, TD], [-TL, TD]];
  for (let i = 0; i < 4; i++) { const a = tc[i], b = tc[(i + 1) % 4]; poly([c(a[0], TOP, a[1]), c(b[0], TOP, b[1]), c(b[0], TOP - .22, b[1]), c(a[0], TOP - .22, a[1])], '#3d170c'); }
  const topP = tc.map(([x, z]) => c(x, TOP, z)); if (!ok(topP)) return;
  const lg = g.createLinearGradient(topP[0][0], topP[0][1], topP[2][0], topP[2][1]); lg.addColorStop(0, PAL.mahoganyLit); lg.addColorStop(1, PAL.mahogany);
  poly(topP, lg);
  for (let i = 1; i < 9; i++) { const z = -TD + i * TD * 2 / 9; seg(c(-TL, TOP, z), c(TL, TOP, z + .05 * Math.sin(i)), 1.2, 'rgba(30,8,4,.22)'); }
  chess(t);
  // the hole in the middle: the driver's seat
  const ring = (rx, rz) => { const r = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; r.push(c(Math.cos(a) * rx, TOP, Math.sin(a) * rz)); } return r; };
  poly(ring(.55, .45), '#120806'); poly(ring(.62, .52), null, '#c9a24a', 2.5);
}
function chess(t) { // knight to queen's rook: the table top turns into a chessboard
  const s = L_(26).s, e = L_(27).e; const a = ease(t, s - .3, s + .2) * (1 - ease(t, e + .3, e + .8)); if (a <= 0) return;
  g.save(); g.globalAlpha = a * .85;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { if ((i + j) % 2) continue; const x0 = -TL + i, z0 = -TD + j * .75;
    poly([PL(x0, TOP + .001, z0), PL(x0 + 1, TOP + .001, z0), PL(x0 + 1, TOP + .001, z0 + .75), PL(x0, TOP + .001, z0 + .75)], '#efe3c6'); }
  g.restore();
}
