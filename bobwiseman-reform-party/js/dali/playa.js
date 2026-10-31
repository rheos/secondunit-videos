// Reform Party, Dali look: the playa (elephants, the poor person, the cops, camps, lamps, riders, art cars, dust devils).
// Draft 3 (b4): every playa figure is drawn in metres in a local frame (bmBegin), shaded, with long shadows, so detail
// holds up close and simplifies far off. Everything new goes through playaInto; the draft-2 entry points that
// render.js still calls (elephantsInto, poorPerson, cops, CAMPS, BIKES) are kept as empty stubs so nothing draws twice.

// ---------- local drawing frame: metres, y up, facing d (+1 right, -1 left) ----------
let bmK = 1;
function bmBegin(x, y, k, d) { g.save(); g.translate(x, y); g.scale((d || 1) * k, k); bmK = k; }
const bmW = (w) => Math.max(w, 1 / bmK);
function bmPath(pts) { g.beginPath(); for (let i = 0; i < pts.length; i++) i ? g.lineTo(pts[i][0], -pts[i][1]) : g.moveTo(pts[i][0], -pts[i][1]); }
function bmFill(pts, fill) { bmPath(pts); g.closePath(); g.fillStyle = fill; g.fill(); }
function bmLine(pts, w, col) { bmPath(pts); g.strokeStyle = col; g.lineWidth = bmW(w); g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); }
function bmDot(x, y, r, fill) { g.beginPath(); g.arc(x, -y, r, 0, TAU); g.fillStyle = fill; g.fill(); }
function bmOval(x, y, rx, ry, fill, rot) { g.beginPath(); g.ellipse(x, -y, Math.max(rx, 1e-4), Math.max(ry, 1e-4), rot || 0, 0, TAU); g.fillStyle = fill; g.fill(); }
function bmLG(x0, y0, x1, y1, cols) { const gr = g.createLinearGradient(x0, -y0, x1, -y1); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); return gr; }
function bmShade(h, f) { const c = hex(h); return rgb([c[0] * f, c[1] * f, c[2] * f]); }
function bmJoint(a, b, l1, l2, sx, sy) { // a two-bone joint (knee, elbow) between a and b; bends toward (sx, sy)
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.max(1e-4, Math.min(Math.hypot(dx, dy), l1 + l2 - 1e-4)), th = Math.atan2(dy, dx), A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const p = [a[0] + l1 * Math.cos(th + A), a[1] + l1 * Math.sin(th + A)], q = [a[0] + l1 * Math.cos(th - A), a[1] + l1 * Math.sin(th - A)];
  return p[0] * sx + p[1] * sy > q[0] * sx + q[1] * sy ? p : q;
}
function bmFur(pts, amp, seed) { // an outline broken into tufts: fur coats, fluffy hats
  const out = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / .055)), nx = -(b[1] - a[1]), ny = b[0] - a[0], L = Math.hypot(nx, ny) || 1;
    for (let j = 0; j < n; j++) { const u = j / n, o = (j % 2 ? amp : -amp * .25) * (.6 + .4 * rnd(seed, i, j)); out.push([lerp(a[0], b[0], u) + nx / L * o, lerp(a[1], b[1], u) + ny / L * o]); } }
  return out; }
function bmCrutch(a, b, w) { // a Dali crutch from foot a up to the fork b, with its padded cradle
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, m = [lerp(a[0], b[0], .62), lerp(a[1], b[1], .62)];
  bmLine([a, m], w, PAL.crutch); bmLine([m, [b[0] + nx * w * 1.6, b[1] + ny * w * 1.6]], w * .7, PAL.crutch); bmLine([m, [b[0] - nx * w * 1.6, b[1] - ny * w * 1.6]], w * .7, PAL.crutch);
  bmLine([[b[0] + nx * w * 2.6, b[1] + ny * w * 2.6], [b[0] - nx * w * 2.6, b[1] - ny * w * 2.6]], w * 1.4, '#e9dcc2');
  const hp = [lerp(a[0], b[0], .78), lerp(a[1], b[1], .78)]; bmLine([[hp[0] + nx * w * 1.2, hp[1] + ny * w * 1.2], [hp[0] - nx * w * 1.2, hp[1] - ny * w * 1.2]], w * .8, '#8a6a3c');
}
const bmVis = (p, m) => p[2] > 1 && p[0] > -m && p[0] < W + m;
const bmFade = (p) => clamp((p[2] - 4.5) / 3.5); // draft 10's near-lens fade. Draft 11: no playa body uses it (kept for scenes.js and artcars.js)

// ---------- draft 11: permanence and spacing (Robin: nobody passes through anybody, nothing blinks) ----------
// Every solid body here enters and leaves by moving. Where a body has a time window, the window is widened to the
// nearest moment it is out of shot (bmBorn, bmGone): it keeps moving along its own path until the camera of that moment
// cannot see it, and only then starts or stops. These scans use camAt, so they follow whatever flight camera.js flies.
const BM_CQ = new Map(); // camAt on a 20 fps grid, kept once worked out (a pure function of t, so this is only a memo)
function bmCam(s) { const k = Math.round(s * 20); let c = BM_CQ.get(k); if (!c) { c = camAt(k / 20); BM_CQ.set(k, c); } return c; }
function bmProj(c, X, Y, Z) { let dx = X - c.x, dz = Z - c.z; const dy = Y - c.y; if (c.sy) { const a = dx * c.cy - dz * c.sy; dz = dx * c.sy + dz * c.cy; dx = a; }
  const cp = Math.cos(c.p), sp = Math.sin(c.p), z = -dy * sp + dz * cp, y = dy * cp + dz * sp; return [W / 2 + c.f * dx / z, H / 2 - c.f * y / z, z]; }
function bmSeen(s, X, Z, r, h, Y0) { // could the camera of time s see any of the box round (X, Z), radius r, height h, from Y0 up
  const c = bmCam(s), y0 = Y0 || 0; let n = 0, a = 1e9, b = -1e9, u = 1e9, v = -1e9;
  for (const dx of [-r, r]) for (const dz of [-r, r]) for (const y of [y0, y0 + h]) { const q = bmProj(c, X + dx, y, Z + dz); if (q[2] < .3) continue; n++; a = Math.min(a, q[0]); b = Math.max(b, q[0]); u = Math.min(u, q[1]); v = Math.max(v, q[1]); }
  if (!n) return false; if (n < 8) return true; return b > -2 && a < W + 2 && v > -2 && u < H + 2; }
const BM_TQ = new Map();
// bmBorn: the latest time on the 20 fps grid at or before t0 at which the body at pos(s) = [X, Z, Y0] is out of shot.
// bmGone: the earliest at or after t1. The body exists from bmBorn to bmGone, so it starts and stops where no one sees.
function bmBorn(key, t0, pos, r, h, lim) { if (BM_TQ.has(key)) return BM_TQ.get(key); let s = Math.floor(t0 * 20) / 20; const end = Math.max(t0 - (lim || 90), -.05); // reaching the film's start means it was there all along
  for (; s > end; s -= .05) { const q = pos(s); if (!bmSeen(s, q[0], q[1], r, h, q[2])) break; } BM_TQ.set(key, s); return s; }
function bmGone(key, t1, pos, r, h, lim) { if (BM_TQ.has(key)) return BM_TQ.get(key); let s = Math.ceil(t1 * 20) / 20; const end = Math.min(t1 + (lim || 90), 269.5); // reaching the end: it stays till the black
  for (; s < end; s += .05) { const q = pos(s); if (!bmSeen(s, q[0], q[1], r, h, q[2])) break; } BM_TQ.set(key, s); return s; }
// bmAvoid: a body of radius rr on its own lane Z0 at X swings out round each obstacle {X, Z, r, side} it passes (a smooth
// bump along the road, so the swerve is a smooth function of time), on its own side of it, or on o.side if given.
function bmAvoid(X, Z0, rr, obs) {
  let up = 0, dn = 0;
  for (const o of obs) { const c = (o.r + rr) * .9 + .3, dx = Math.abs(X - o.X), L = 2.2 * c; if (dx >= L || Math.abs(Z0 - o.Z) >= c) continue; // only what the lane itself runs into
    const need = c * Math.cos(Math.PI / 2 * dx / L) ** 2, side = o.side || (Z0 >= o.Z ? 1 : -1);
    if (side > 0) up = Math.max(up, o.Z + need - Z0); else dn = Math.max(dn, Z0 - (o.Z - need)); }
  return Z0 + up - dn;
}

// ---------- stilt elephants ----------
// elephant(X, Z, t, s, ph, load) keeps its draft-2 signature; o (optional, last) adds: dir, grow (stilts 0..1), vogue, flip, chips (0..1), walk.
function elephant(X, Z, t, s, ph, load, o) {
  o = o || {}; const p = P(X, 0, Z); if (p[2] < 1.5) return; const k = kAt(p) * s; if (k < .25 || p[0] < -16 * k || p[0] > W + 16 * k) return;
  const d = o.dir || 1, grow = o.grow == null ? 1 : o.grow, legH = .9 + 9.6 * grow, flip = o.flip || 0, vog = o.vogue || 0, det = k > 6, lx = -d;
  const kn = o.kneel || 0, wk = (o.walk == null ? 1 : o.walk) * (1 - kn), w = Math.sin(t * 1.4 * wk + ph) * wk, bob = Math.abs(Math.cos(t * 1.4 * wk + ph)) * .12 * wk, B = legH * (1 - .5 * kn) + bob;
  bmBegin(p[0], p[1], k, d); if (o.alpha != null) g.globalAlpha = o.alpha;
  if (flip > 0) { const hp = (legH + 2.7) / 2; g.translate(0, -hp); g.rotate(Math.PI * flip); g.translate(0, hp); }
  const skin = PAL.elephant, lit = PAL.elephantLit, far = bmShade(PAL.elephant, .72);
  const leg = (hx, sw, col, lift) => { // a spindly insect leg with two knees and a small round foot
    const top = [hx, B + .35], foot = lift ? [hx + 1.2, legH * .42] : [hx + sw, 0], kb = kn * legH * (hx > 0 ? .3 : -.12), k1 = [lerp(top[0], foot[0], .38) + .28 + (lift ? .9 : 0) + kb, lerp(top[1], foot[1], .36) - kn * .4], k2 = [lerp(top[0], foot[0], .7) - .12 + kb * .55, lerp(top[1], foot[1], .7)]; // on "rehearsed" the knees fold: front ones forward
    bmLine([top, k1, k2, foot], .2, col); if (det) { bmDot(k1[0], k1[1], .17, col); bmDot(k2[0], k2[1], .13, col); } bmOval(foot[0], foot[1] + .08, .3, .11, col);
  };
  leg(-1.0, -w * 1.1, far); leg(1.85, w * 1.1, far);
  // tail
  bmLine([[-2.4, B + 1.5], [-2.75, B + .9 + w * .1], [-2.7, B + .45]], .07, skin); bmOval(-2.7, B + .38, .09, .16, '#4a4038');
  // body: a soft barrel that sags a little underneath
  const bg = bmLG(lx * 1.2, B + 2.6, -lx * 1.4, B + .2, [lit, skin, bmShade(PAL.elephant, .7)]);
  bmPath([[-2.55, B + 1.2], [-2.3, B + 2.15], [-1, B + 2.62], [1, B + 2.6], [2.35, B + 2.1], [2.6, B + 1.2], [2.1, B + .38], [.6, B + .05], [-.8, B + .08], [-2.15, B + .42]]); g.closePath(); g.fillStyle = bg; g.fill();
  if (det) { g.strokeStyle = 'rgba(60,50,45,.35)'; g.lineWidth = bmW(.05); for (const wx of [-1.7, -1.4, 1.5]) { g.beginPath(); g.moveTo(wx, -(B + .4)); g.quadraticCurveTo(wx + .15, -(B + 1.2), wx, -(B + 1.9)); g.stroke(); } }
  // saddle cloth with a fringe
  if (load === 'chips') { // draft 9: a casino-felt cloth and one giant chip hung on the flank, so the load reads as chips, not a sofa
    bmFill([[-1.25, B + 2.55], [1.25, B + 2.55], [1.3, B + 1.6], [-1.3, B + 1.6]], '#2f6b46'); bmBigChip(0, B + 1.55, 1.05, '#c7362b', det);
  } else { bmFill([[-1.35, B + 2.55], [1.35, B + 2.55], [1.45, B + 1.25], [-1.45, B + 1.25]], '#c7362b');
    bmFill([[-1.45, B + 1.32], [1.45, B + 1.32], [1.45, B + 1.18], [-1.45, B + 1.18]], '#d9b45a');
    if (det) { for (let i = 0; i < 10; i++) { const fx = -1.4 + i * .31; bmFill([[fx, B + 1.2], [fx + .3, B + 1.2], [fx + .15, B + .95]], '#d9b45a'); } } }
  // near legs (one lifts and the trunk goes up on "vogue")
  leg(-1.5, w * 1.1, skin); leg(1.35, -w * 1.1, skin, vog > .5);
  // head, ear, tusk, trunk
  const HX = 2.55, HY = B + 1.75 + vog * .2 - kn * (.35 + .3 * (o.nod || 0)); // kneeling, the head bows with the board's nod
  bmDot(HX, HY, .95, bmLG(HX + lx * .8, HY + .8, HX - lx * .8, HY - .8, [lit, skin]));
  const fl = Math.sin(t * 2.1 + ph) * .1; bmOval(HX - .45, HY - .05, .72 + fl * .3, 1.05, bmShade(PAL.elephant, .82), -.15 + fl); if (det) bmOval(HX - .45, HY - .05, .46, .74, 'rgba(210,150,140,.55)', -.15 + fl);
  bmDot(HX + .45, HY + .3, .075, '#1c1614');
  const tr = vog > 0 ? [[HX + .7, HY - .25], [HX + 1.5, HY + lerp(-.9, 1.4, vog)], [HX + lerp(1.1, 1.3, vog), HY + lerp(-2.6, 2.6, vog) + w * .12]] : [[HX + .7, HY - .25], [HX + 1.35, HY - 1.2], [HX + 1.05, HY - 2.6 + w * .12]];
  g.lineCap = 'round'; g.strokeStyle = skin; for (const [wd, u0] of [[.46, 0], [.34, .35], [.22, .7]]) { g.lineWidth = bmW(wd); g.beginPath(); const q = (u) => { const a = 1 - u; return [a * a * tr[0][0] + 2 * a * u * tr[1][0] + u * u * tr[2][0], a * a * tr[0][1] + 2 * a * u * tr[1][1] + u * u * tr[2][1]]; }; for (let i = 0; i <= 6; i++) { const pt = q(u0 + (1 - u0) * i / 6 * (wd === .46 ? .5 : 1)); i ? g.lineTo(pt[0], -pt[1]) : g.moveTo(pt[0], -pt[1]); } g.stroke(); }
  bmLine([[HX + .55, HY - .55], [HX + .95, HY - .75], [HX + 1.15, HY - .55]], .1, '#efe6d0');
  // the load on its back
  const top = B + 2.55;
  if (flip < .5) {
    if (load === 'papers') { for (let i = 0; i < 9; i++) bmFill([[-1.1 + Math.sin(i * 2.3) * .2, top + i * .38], [1.1 + Math.sin(i * 2.3) * .2, top + i * .38], [1.1 + Math.sin(i * 2.3) * .2, top + i * .38 + .34], [-1.1 + Math.sin(i * 2.3) * .2, top + i * .38 + .34]], i % 2 ? '#ece6d6' : '#d9d1bd'); }
    else if (load === 'ballot') { bmFill([[-1.2, top], [1.2, top], [1.2, top + 2.4], [-1.2, top + 2.4]], bmLG(-1.2 * lx, 0, 1.2 * lx, 0, ['#f7f0de', '#cfc5ad'])); bmFill([[-.7, top + 2.3], [.7, top + 2.3], [.7, top + 2.45], [-.7, top + 2.45]], '#1a1a1a'); const by = top + 2.5 + Math.abs(Math.sin(t * 2 + ph)) * .5; bmFill([[-.35, by], [.35, by], [.35, by + .9], [-.35, by + .9]], '#fbf7ec'); }
    else if (load === 'cash') { for (let i = 0; i < 6; i++) { bmFill([[-1.2, top + i * .32], [1.2, top + i * .32], [1.15, top + i * .32 + .3], [-1.25, top + i * .32 + .3]], i % 2 ? '#b9c99a' : '#9fb37e'); bmFill([[-.2, top + i * .32], [.2, top + i * .32], [.2, top + i * .32 + .3], [-.2, top + i * .32 + .3]], '#e8dcb0'); } }
    else if (load === 'chips') { // a howdah of casino chips: tall leaning stacks that grow on "bets", one propped on a crutch
      bmFill([[-1.8, top - .05], [1.8, top - .05], [1.7, top + .25], [-1.7, top + .25]], '#d9b45a'); const cols = ['#c7362b', '#2f6fb5', '#f2ede0', '#1c1a1e'], hs = [10, 15, 12, 17];
      for (let c = 0; c < 4; c++) { const n = Math.round(hs[c] * (.3 + .7 * clamp(o.chips == null ? 1 : o.chips))), cx = -1.3 + c * .87 + Math.sin(c * 1.7) * .05, lean = Math.sin(t * .9 + c + ph) * .018 * n;
        for (let j = 0; j < n; j++) { const cy = top + .25 + j * .23, cxx = cx + lean * j / Math.max(1, n), cc = cols[(c + (j % 5 === 4 ? 1 : 0)) % 4]; bmFill([[cxx - .42, cy], [cxx + .42, cy], [cxx + .42, cy + .21], [cxx - .42, cy + .21]], bmShade(cc, cc === '#f2ede0' ? .82 : .78));
          for (let q = j % 2; q < 4; q += 2) bmFill([[cxx - .36 + q * .22, cy], [cxx - .26 + q * .22, cy], [cxx - .26 + q * .22, cy + .21], [cxx - .36 + q * .22, cy + .21]], cc === '#f2ede0' ? '#c7362b' : '#f6f1e4'); bmOval(cxx, cy + .21, .42, .08, cc); } // edge stripes staggered chip to chip
        if (c === 3 && n > 6) bmCrutch([2.3, B + 1.4], [cx + lean + .44, top + .25 + n * .16], .06); }
    } else { // a soft tower that droops at the tip, with a red pennant
      bmFill([[-1, top], [1, top], [.3, top + 3.6], [.5, top + 3.9], [.15, top + 4.0], [-.3, top + 3.6]], bmLG(lx * .8, 0, -lx * .8, 0, ['#f1e4c4', '#c9b88f'])); bmLine([[.2, top + 3.9], [.2, top + 4.8]], .05, '#5a4a3a'); bmFill([[.2, top + 4.8], [1.1, top + 4.6 + Math.sin(t * 3 + ph) * .08], [.2, top + 4.4]], '#c7362b'); }
  }
  g.restore();
}
// day elephants: wrapped relative to the car so a few always walk the playa; bigger and nearer than draft 2.
// r0: start offset from the car, dv: speed relative to the car, Z: depth, s: scale.
// Draft 11: each on its own lane 7 m from the next (they never walk through each other), out past the parades
// (Z 36-41) and the wars elephants (Z 27-35); they swing round the playa's art pieces and give the Man a wide
// berth (bmHerdZ), so at night they walk behind the art-car ring, never through the burn crowd. They keep walking
// after the board parks (draft 10 had them walk backwards at night), and their wrap far ahead of or behind the board
// only happens on a lap whose two ends are out of shot (bmLapOK); a lap that would start or end in view is skipped.
const BM_ELEPHANTS = [
  { r0: 30, dv: -.55, Z: 57, s: 1.25, load: 'papers' }, { r0: -40, dv: .5, Z: 71, s: 1.15 }, { r0: 85, dv: -.8, Z: 85, s: 1.4, load: 'ballot' },
  { r0: 150, dv: -.4, Z: 64, s: 1.2 }, { r0: -110, dv: .65, Z: 92, s: 1.5, load: 'papers' }, { r0: 10, dv: -1.1, Z: 99, s: 1.6, load: 'ballot' },
  { r0: 205, dv: -.7, Z: 78, s: 1.3, load: 'cash' }, { r0: -170, dv: .35, Z: 50, s: 1.05 },
];
const bmHerdZ = (X, Z) => { const u = Math.abs(X - MAN.x) / 220; return Z + (u < 1 ? 110 * Math.cos(Math.PI / 2 * u) ** 2 : 0); }; // round the far side of the Man, at least 95 m out
// the static bodies the herd and the riders steer round: the playa's art pieces and installations, worked out once
// on first use (the installations' places hang on cue times)
let BM_STATIC_L = null;
function bmStatic() { if (BM_STATIC_L) return BM_STATIC_L; const L = [];
  BM_CAMPS.forEach((c) => { if (BM_PLAYA_ART[c.kind]) L.push({ X: c.X, Z: c.Z, r: BM_ART_R[c.kind] * c.r }); });
  for (const [kind, X, Z] of bmInstallPlaces()) L.push({ X, Z, r: BM_INST_R[kind] });
  return (BM_STATIC_L = L); }
// a body that wraps round a moving centre: u = u0 + v t, rel = mod(u, P) - P / 2, lap n = floor(u / P). The lap is
// drawn only if the camera cannot see the wrap at either end (posAt(s, rel) = [X, Z] in the world).
const BM_LAPQ = new Map();
function bmLapOK(key, n, u0, v, P, posAt, r, h) {
  const k = key + ':' + n; if (BM_LAPQ.has(k)) return BM_LAPQ.get(k);
  const ta = ((v > 0 ? n : n + 1) * P - u0) / v, tb = ((v > 0 ? n + 1 : n) * P - u0) / v, ra = v > 0 ? -P / 2 : P / 2;
  const seen = (s, rel) => { if (s < -.5 || s > 269.5) return false; const q = posAt(s, rel); return bmSeen(s, q[0], q[1], r, h); };
  const ok = !seen(ta, ra) && !seen(tb, -ra); BM_LAPQ.set(k, ok); return ok;
}
const bmHerdAt = (e) => (s, rel) => { const X = -40 + 1.6 * s + rel; return [X, bmAvoid(X, bmHerdZ(X, e.Z), 2.2 * e.s, bmStatic())]; };
// elephants that lead the table along the road: they walk just behind the car's line, a little slower, so the board
// drives past beneath their stilts. Each has a window [t0, t1] in which it is on the road; draft 11: they walk in and
// out of shot round that window (bmBorn, bmGone), on Z 15.2, 4.7 m behind the Instrument People's file.
const BM_ROAD = [{ t0: 24, t1: 58.5, r0: 30, dv: -.75, Z: 15.2, s: 1.2, load: 'papers' }, { t0: 141, t1: 154.4, r0: 26, dv: -.9, Z: 15.2, s: 1.15, load: 'cash' }];
const bmRoadAt = (e) => (s) => [carX(s) + e.r0 + e.dv * (s - e.t0) + 3 * Math.max(0, s - e.t1) ** 2, e.Z, 0]; // past its window it strides on ahead and out of shot
const bmVogue = (t) => { const v = wt(14, 'vogue'); return ease(t, v - .15, v + .35) * (1 - ease(t, v + 1.7, v + 2.3)); };
const bmFlip = (t) => { const pv = wt(29, 'perverse'); return easeOutBack(clamp((t - pv + .05) / .55), 1.2) * (1 - ease(t, L_(30).s - .5, L_(30).s + .1)); };
function bmBigChip(x, y, r, col, det) { // a casino chip face on: the coloured disc, six white edge spots, an inner ring
  bmDot(x, y, r, col); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .26; g.save(); g.translate(x + Math.cos(a) * r * .84, -(y + Math.sin(a) * r * .84)); g.rotate(-a); g.fillStyle = '#f6f1e4'; g.fillRect(-r * .13, -r * .1, r * .26, r * .2); g.restore(); }
  g.beginPath(); g.arc(x, -y, r * .6, 0, TAU); g.strokeStyle = '#f6f1e4'; g.lineWidth = bmW(r * .07); if (det) g.setLineDash([r * .12, r * .08]); g.stroke(); g.setLineDash([]); bmDot(x, y, r * .45, bmShade(col, .85)); }
// "rehearsed": every stilt elephant kneels in unison with the board's nod (car.js nods the row from L_(30).s), then rises
const bmKneel = (t) => { const r = wt(30, 'rehearsed'); return ease(t, r - .3, r + .15) * (1 - ease(t, L_(30).e + .1, L_(30).e + 1)); };
const bmNod = (t) => t > L_(30).s && t < L_(30).e + .3 ? Math.abs(Math.sin((t - L_(30).s) * 1.6 * Math.PI)) : 0;
function bmElephantEntry(X, Z, t, s, ph, load, o, list) {
  if (o.kneel == null) { o.kneel = bmKneel(t); o.nod = bmNod(t); }
  const p = P(X, 0, Z); if (p[2] < 2 || p[0] < -W * .7 || p[0] > W * 1.7) return; const lh = (.9 + 9.6 * (o.grow == null ? 1 : o.grow)) * (1 - .5 * o.kneel);
  if (o.id) ACT.note(o.id, X, Z, 2.2 * s, { h: (lh + 3) * s, a: o.alpha == null ? 1 : o.alpha, group: 'elephant' });
  list.push({ z: p[2], draw: () => elephant(X, Z, t, s, ph, load, o), shadow: () => { shadowOf([[X - 2.4 * s, (lh + .3) * s, Z], [X + 3.4 * s, (lh + .3) * s, Z], [X - 2.2 * s, (lh + 2.6) * s, Z], [X + 2.6 * s, (lh + 2.8) * s, Z]], t); for (const dx of [-1.5, -1, 1.35, 1.85]) shadowStick(X + dx * s, 0, lh * s, Z, .3 * s, t); } });
}
function bmRoadPos(e, i, t) { const at = bmRoadAt(e), h = 13 * e.s; if (t < bmBorn('road' + i, e.t0, at, 2.2 * e.s, h) || t > bmGone('road' + i + 'e', e.t1, at, 2.2 * e.s, h)) return null;
  const q = at(t); return [q[0], bmAvoid(q[0], q[1], 2.2 * e.s, bmForeign(t).filter((o) => /^installs:whirl/.test(o.id)).map((o) => ({ X: o.X, Z: o.Z, r: o.r, side: 1 }))), 0]; } // swings out round the whirl cars
function bmWarsPos(i, t) { const w = wt(21, 'wars'), at = bmWarsAt(i), s = 1.05 + (i % 3) * .1; if (t < w - 60 || t > 240 || t < bmBorn('wars' + i, w - 1.5, at, 2.2 * s, 6 * s) || t > bmGone('wars' + i + 'e', 150, at, 2.2 * s, 13 * s)) return null;
  const q = at(t), ob = []; BM_ROAD.forEach((e, j) => { const r = bmRoadPos(e, j, t); if (r) ob.push({ X: r[0], Z: r[1], r: 2.2 * e.s, side: 1 }); });
  for (const o of bmForeign(t)) if (!/^scenes:ant/.test(o.id)) ob.push(o); for (const o of bmStatic()) ob.push(o);
  return [q[0], bmAvoid(q[0], q[1], 2.2 * s, ob), 0]; }
function bmElephantsInto(t, list) {
  const vo = bmVogue(t), fl = bmFlip(t);
  BM_ELEPHANTS.forEach((e, i) => { const u = e.r0 + e.dv * t, n = Math.floor(u / 400), at = bmHerdAt(e); if (!bmLapOK('eleph:' + i, n, e.r0, e.dv, 400, at, 2.2 * e.s, 13 * e.s)) return;
    const rel = u - n * 400 - 200, [X, Z] = at(t, rel), v = 1.6 + e.dv; bmElephantEntry(X, Z, t, e.s, i * 2.1, e.load, { id: 'playa:eleph:' + i, dir: Math.sign(v) || 1, walk: clamp(Math.abs(v) / 1.4, .5, 1.3), vogue: vo, flip: fl }, list); });
  BM_ROAD.forEach((e, i) => { const q = bmRoadPos(e, i, t); if (!q) return;
    const [X, Z] = q; bmElephantEntry(X, Z, t, e.s, 7 + i, e.load, { id: 'playa:road:' + i, dir: 1, walk: .85, vogue: vo, flip: fl }, list); });
}
// "expand the wars": a stilt-elephant parade behind the table; their stilts shoot up out of the sand on "wars" and
// the chip towers on their backs grow with the bets. Draft 11: they walk in low from out of shot (no growing out of
// nothing), on lanes clear of the riders (Z 27.5-35.3), and run off on the far side until no camera sees them.
const bmWarsAt = (i) => (s) => { const w = wt(21, 'wars'), go = Math.max(0, s - 142.7); return [carX(w) - 17 + i * 9 + (s - w) * 1.95 + go * go * 5, [22, 18.5, 16.5, 20.5, 24][i] - go * go * 2, 0]; }; // draft 13: bearing in a little as they run off, clear of the head and the monolith (the rap camera looks their way now) // draft 11 merge: through the gap the ballot-ant file opens for the board, clear of the genie
function bmWarsInto(t, list) {
  const w = wt(21, 'wars'), bets = wt(22, 'bets'), fl = bmFlip(t);
  for (let i = 0; i < 5; i++) { const q = bmWarsPos(i, t), s = 1.05 + (i % 3) * .1; if (!q) continue;
    const [X, Z] = q, grow = (.02 + .98 * easeOutBack(clamp((t - w - i * .12) / .9), 1.4)) * (1 - .9 * ease(t, 142.6, 143.5)), chips = .25 + .75 * ease(t, bets - .4, bets + 1.6);
    bmElephantEntry(X, Z, t, s, 30 + i * 1.3, 'chips', { id: 'playa:wars:' + i, dir: 1, grow, chips, walk: .9 + .3 * grow, flip: fl }, list); }
}

// ---------- costumed riders ----------
const BM_COATS = [['#f4b0cf', '#b05a84'], ['#f6f0e2', '#b3a690'], ['#9a68dc', '#4b2a80'], ['#47c1ba', '#1d6f6a'], ['#ee9a42', '#9a4f16'], ['#e3cb82', '#8a6a2c'], ['#e0533a', '#7a1d12'], ['#3a3442', '#141218']];
const BM_PARAS = [['#d8452f', '#f6efe0'], ['#2f6fb5', '#e8b23a'], ['#7a3c8c', '#f4b0cf'], ['#3c8c5a', '#f6efe0'], ['#e8b23a', '#d8452f'], ['#1c1a1e', '#e8b23a']];
function bmCostume(seed, force) {
  const R = mulberry(seed), pick = (a) => a[Math.floor(R() * a.length)], c = {
    coat: pick(BM_COATS), fur: R() < .72, spots: R() < .22, trim: pick(['#fbf6ea', '#f4b0cf', '#e8b23a', '#1c1a1e', '#47c1ba']), legs: pick(['#2a2420', '#e8d4b4', '#3a3048', '#c43a2a', '#1c1a1e']), stripes: R() < .3,
    skin: pick(['#e8cfae', '#c99a72', '#8a5a3c', '#f1dcc4', '#6a4630']), hat: pick(['top', 'fluff', 'bopper', 'sun', 'none', 'top', 'fluff']), lens: pick(['#f0b030', '#3fc0e0', '#c060e0', '#e05a3a']),
    para: R() < .38 ? pick(BM_PARAS) : null, flag: R() < .5 ? { h: 3 + R() * 1.7, col: pick(['#d8452f', '#e8b23a', '#2f6fb5', '#f6efe0', '#7a3c8c', '#3c8c5a']), col2: pick(['#f6efe0', '#1c1a1e', '#e8b23a']) } : null,
    frame: pick(['#c43a2a', '#2f6fb5', '#e8b23a', '#3c8c5a', '#d9d2c2', '#1c1a1e', '#9a68dc']), bike: 'plain', seed: seed % 97 }; // every special art bike is one of a kind (Robin): only BM_FLOCK forces the four
  return Object.assign(c, force || {});
}
function bmWheel(cx, cy, r, ang, det, rimCol) {
  g.beginPath(); g.arc(cx, -cy, r, 0, TAU); g.strokeStyle = '#1b1714'; g.lineWidth = bmW(.055); g.stroke();
  g.beginPath(); g.arc(cx, -cy, r - .045, 0, TAU); g.strokeStyle = rimCol || '#a49a8c'; g.lineWidth = bmW(.018); g.stroke();
  if (det) { g.strokeStyle = 'rgba(70,64,58,.75)'; g.lineWidth = bmW(.008); g.beginPath(); for (let i = 0; i < 8; i++) { const a = ang + i * Math.PI / 8; g.moveTo(cx + Math.cos(a) * (r - .05), -cy - Math.sin(a) * (r - .05)); g.lineTo(cx - Math.cos(a) * (r - .05), -cy + Math.sin(a) * (r - .05)); } g.stroke(); }
  bmDot(cx, cy, .035, '#3a342e');
}
function bmParasol(hx, hy, c, t, det) { // a fringed parasol held up from the hand
  g.save(); g.translate(hx, -hy); g.rotate(-.22 + n1(c.seed + 9, t * .7) * .1); bmLine([[0, -.2], [0, 1.0]], .025, '#3a3028');
  g.translate(0, -1.0); const R = .82, Hh = .46, n = 8, rim = [];
  for (let i = 0; i <= n; i++) rim.push([-Math.cos(i / n * Math.PI) * R, 0]);
  for (let i = 0; i < n; i++) { g.beginPath(); g.moveTo(0, -Hh); g.lineTo(rim[i][0], 0); g.quadraticCurveTo((rim[i][0] + rim[i + 1][0]) / 2, .09, rim[i + 1][0], 0); g.closePath(); g.fillStyle = c.para[i % 2]; g.fill(); }
  const sh = g.createLinearGradient(-R, 0, R, 0); sh.addColorStop(0, 'rgba(255,250,235,.18)'); sh.addColorStop(1, 'rgba(30,20,30,.32)'); g.beginPath(); g.moveTo(-R, 0); g.quadraticCurveTo(-R * .9, -Hh * 1.2, 0, -Hh); g.quadraticCurveTo(R * .9, -Hh * 1.2, R, 0); g.closePath(); g.fillStyle = sh; g.fill();
  if (det) { g.strokeStyle = c.para[1]; g.lineWidth = bmW(.012); g.beginPath(); for (let i = 0; i <= 24; i++) { const x = -R + i / 24 * 2 * R; g.moveTo(x, .04); g.lineTo(x + Math.sin(t * 4 + i) * .01, .13); } g.stroke(); }
  bmDot(0, Hh + .05, .04, '#d9b45a'); g.restore();
}
// A rider on a bike, side on. (x, y) = ground point under the bottom bracket, k px per metre, d direction, sp metres travelled.
function bmRider(x, y, k, d, sp, t, c, alpha) {
  if (k < .9) return; bmBegin(x, y, k, d); if (alpha != null && alpha < 1) g.globalAlpha = alpha;
  const det = k > 15, lx = -d, ink = '#1b1714', up = c.bike === 'tall' ? 1.0 : 0, cw = c.bike === 'clock', rf = cw ? .46 : .34, RW = [-.55, .34], FW = [cw ? .72 : .57, rf], ang = -sp / .34;
  const BB = [-.04, .3 + up], SEAT = [-.2, .88 + up], HT = [.4, .9 + up], HB = [.45, .72 + up], G = [.27, 1.1 + up], H0 = [-.2, .98 + up], S = [H0[0] + .13, H0[1] + .56], HD = [S[0] + .05, S[1] + .23];
  const ca = ang * .55 + c.seed, P1 = [BB[0] + Math.cos(ca) * .17, BB[1] + Math.sin(ca) * .17], P2 = [BB[0] - Math.cos(ca) * .17, BB[1] - Math.sin(ca) * .17];
  if (k < 5) { // far away: a coloured rider on a dark bike, enough to read as traffic
    bmWheel(RW[0], RW[1], .34, 0, false); bmWheel(FW[0], FW[1], rf, 0, false); bmLine([RW, BB, HB, FW], .08, c.frame); bmFill([[S[0] - .2, S[1]], [S[0] + .14, S[1]], [H0[0] + .25, H0[1] - .3], [H0[0] - .3, H0[1] - .35]], c.coat[0]); bmDot(HD[0], HD[1], .13, c.skin);
    if (c.flag) bmLine([[-.62, .6], [-.66, c.flag.h + up]], .06, c.flag.col); if (c.para) bmOval(S[0] - .1, S[1] + 1.25, .8, .3, c.para[0]); g.restore(); return; }
  // flag pole on the rear rack, its pennant streaming back
  if (c.flag) { const top = c.flag.h + up, n = 10, pts = []; bmLine([[-.6, .62 + up * .5], [-.66, top]], .03, '#3a3028');
    for (let i = 0; i <= n; i++) { const u = i / n; pts.push([-.66 - u * 1.35, top - u * .14 + Math.sin(u * 5 - t * 7 + c.seed) * .1 * u]); }
    for (let i = n; i >= 0; i--) { const u = i / n; pts.push([-.66 - u * 1.35, top - .52 + u * .38 + Math.sin(u * 5 - t * 7 + c.seed) * .1 * u]); }
    bmFill(pts, c.flag.col); if (det) { const st = pts.slice(0, n + 1); bmFill(st.concat(st.slice().reverse().map(([a, b], j) => [a, b - .13 * (1 - (n - j) / n * .7)])), c.flag.col2); } bmDot(-.66, top + .05, .06, '#e8c04a'); }
  // a giant snail shell towed over the back wheel
  if (c.bike === 'snail') { const sx = -.75, sy = 1.15 + up; bmDot(sx, sy, .66, bmLG(sx + lx * .5, sy + .5, sx - lx * .6, sy - .5, ['#f0d9a8', '#b07a3a', '#6e4420'])); g.strokeStyle = 'rgba(80,46,20,.8)'; g.lineWidth = bmW(.05); g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU * 2.2, r = .62 * (1 - i / 46); i ? g.lineTo(sx + Math.cos(a) * r, -sy - Math.sin(a) * r) : g.moveTo(sx + Math.cos(a) * r, -sy - Math.sin(a) * r); } g.stroke(); }
  // far leg and the far crank
  const legCol = c.legs, farLeg = bmShade(c.legs, .62), K2 = bmJoint(H0, P2, .47, .48, 1, .2);
  bmLine([H0, K2, P2], .13, farLeg); bmOval(P2[0] + .04, P2[1], .1, .055, c.fur ? bmShade(c.trim, .7) : ink);
  // wheels
  bmWheel(RW[0], RW[1], .34, ang, det);
  if (cw) { bmDot(FW[0], FW[1], rf, bmLG(FW[0] - .4, FW[1] + .4, FW[0] + .4, FW[1] - .4, ['#fbf1d0', '#d9c48a'])); g.strokeStyle = '#b08a3a'; g.lineWidth = bmW(.05); g.beginPath(); g.arc(FW[0], -FW[1], rf, 0, TAU); g.stroke(); g.strokeStyle = '#3a2a1a';
    for (let i = 0; i < 12; i++) { const a = ang * .74 + i / 12 * TAU; g.lineWidth = bmW(.025); g.beginPath(); g.moveTo(FW[0] + Math.cos(a) * rf * .78, -FW[1] - Math.sin(a) * rf * .78); g.lineTo(FW[0] + Math.cos(a) * rf * .9, -FW[1] - Math.sin(a) * rf * .9); g.stroke(); }
    for (const [L, sp2, wd] of [[.24, 1, .03], [.36, 12, .018]]) { const a = t * sp2 * .5; bmLine([FW, [FW[0] + Math.cos(a) * L, FW[1] + Math.sin(a) * L]], wd, '#1a1412'); } }
  else bmWheel(FW[0], FW[1], rf, ang, det);
  // frame (a tall bike welds a second frame on top)
  const fc = c.frame, tube = .045; bmLine([RW, [BB[0], .3], [SEAT[0], .88], RW], tube, fc); bmLine([[BB[0], .3], [HB[0], .72], [HT[0], .9], [SEAT[0], .88]], tube, fc); bmLine([[HB[0], .72], FW], tube, fc);
  if (up) { bmLine([[SEAT[0], .88], [BB[0], BB[1]], SEAT, HT, HB, [BB[0], BB[1]]], tube, fc); bmLine([[HT[0], .9], HB], tube, fc); bmLine([BB, [RW[0], RW[1] + .02]], .015, '#3a342e'); }
  else bmLine([BB, RW], .015, '#3a342e'); // chain
  bmLine([HT, [HT[0] - .02, HT[1] + .16], [G[0], G[1]]], .035, '#2a2622'); bmOval(SEAT[0] - .02, SEAT[1] + .07, .14, .035, '#3a2416');
  // a fish shell around the bike: the rider pops out of its back
  if (c.bike === 'fish') { const fy = .92 + up, fcol = c.frame; bmPath([[1.1, fy], [.7, fy + .42], [-.6, fy + .45], [-1.1, fy + .1], [-1.55, fy + .45], [-1.45, fy - .05], [-1.55, fy - .5], [-1.1, fy - .12], [-.6, fy - .42], [.7, fy - .36]]); g.closePath(); g.fillStyle = bmLG(0, fy + .45, 0, fy - .45, ['#f6efe0', fcol, bmShade(fcol, .6)]); g.fill();
    bmFill([[-.3, fy + .42], [.2, fy + .78], [.35, fy + .4]], bmShade(fcol, .8)); if (det) { g.strokeStyle = 'rgba(255,250,235,.45)'; g.lineWidth = bmW(.02); for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-.5 + i * .25, -fy, .15, -1, 1); g.stroke(); } } bmDot(.82, fy + .08, .07, '#fbf7ec'); bmDot(.84, fy + .08, .035, ink); }
  // near crank, pedal, near leg with a furry boot
  bmLine([BB, P1], .03, '#5a524a'); const K1 = bmJoint(H0, P1, .47, .48, 1, .2);
  if (c.bike !== 'fish') { bmLine([H0, K1, P1], .14, legCol); if (det && c.stripes) { g.strokeStyle = 'rgba(255,250,235,.7)'; g.lineWidth = bmW(.03); g.setLineDash([.04, .05]); g.beginPath(); g.moveTo(K1[0], -K1[1]); g.lineTo(P1[0], -P1[1]); g.stroke(); g.setLineDash([]); } }
  bmOval(P1[0] + .04, P1[1] + .01, .11, .065, c.fur ? c.trim : ink);
  // far arm (to the grip) behind the coat
  if (!c.sax) { const E2 = bmJoint(S, G, .3, .31, 0, -1); bmLine([S, E2, G], .1, bmShade(c.coat[1], .75)); }
  // the coat: fur breaks the edge into tufts, light from the left
  const coat = [[S[0] - .17, S[1] + .03], [S[0] + .12, S[1] + .03], [S[0] + .17, S[1] - .25], [H0[0] + .3, H0[1] - .1], [H0[0] + .24, H0[1] - .36], [H0[0] - .34, H0[1] - .44], [H0[0] - .27, H0[1] + .06]];
  bmPath(c.fur && det ? bmFur(coat, .035, c.seed) : coat); g.closePath(); g.fillStyle = bmLG(lx * .45 + S[0], 0, -lx * .35 + S[0], 0, [c.coat[0], c.coat[0], c.coat[1]]); g.fill();
  if (det && c.spots) { for (let i = 0; i < 9; i++) bmOval(H0[0] - .2 + rnd(c.seed, i, 1) * .4, H0[1] - .3 + rnd(c.seed, i, 2) * .75, .035, .025, 'rgba(40,24,14,.7)'); }
  if (det && c.fur) { g.strokeStyle = 'rgba(255,250,240,.25)'; g.lineWidth = bmW(.012); g.beginPath(); for (let i = 0; i < 8; i++) { const fx = H0[0] - .25 + i * .07; g.moveTo(fx, -(H0[1] - .3)); g.lineTo(fx + .03, -(H0[1] + .2)); } g.stroke(); }
  bmOval(S[0] - .02, S[1] - .01, .18, .075, c.fur ? c.trim : bmShade(c.coat[1], .8));
  if (c.ranger) { bmOval(S[0] + .02, S[1] - .17, .055, .045, '#5a3a20'); bmLine([[H0[0] + .2, H0[1] - .02], [H0[0] + .23, H0[1] - .24]], .06, '#151517'); bmOval(H0[0] + .235, H0[1] - .26, .04, .025, '#e8ecef'); } // the Ranger mark on the chest, a flashlight on the belt
  // near arm: to the grip, or up holding a parasol
  if (c.sax) { /* both hands on the sax, drawn after the head */ }
  else if (c.para) { const Hn = [S[0] + .14, S[1] + .32], E1 = bmJoint(S, Hn, .3, .3, 1, -.5); bmLine([S, E1, Hn], .1, c.coat[0]); bmDot(Hn[0], Hn[1], .045, c.skin); }
  else if (c.drink) { const Hn = [S[0] + .24, S[1] + .1], E1 = bmJoint(S, Hn, .3, .3, 1, -.8); bmLine([S, E1, Hn], .1, c.coat[0]); bmCan(Hn[0] - .01, Hn[1] - .04); bmDot(Hn[0], Hn[1], .045, c.skin); } // a cold drink, one hand on the bars
  else { const E1 = bmJoint(S, G, .3, .31, 0, -1); bmLine([S, E1, G], .1, c.coat[0]); bmDot(G[0], G[1], .045, c.skin); }
  // head: goggles, a hat
  bmLine([[S[0] + .02, S[1]], [HD[0], HD[1] - .05]], .07, c.skin);
  bmOval(HD[0], HD[1], .11, .125, bmLG(HD[0] + lx * .1, HD[1] + .1, HD[0] - lx * .12, HD[1] - .1, ['#fff3e0', c.skin, bmShade(c.skin, .7)]));
  if (c.hat === 'top') { bmFill([[HD[0] - .1, HD[1] + .08], [HD[0] + .1, HD[1] + .08], [HD[0] + .11, HD[1] + .38], [HD[0] - .09, HD[1] + .38]], '#1c1a1e'); bmFill([[HD[0] - .1, HD[1] + .1], [HD[0] + .1, HD[1] + .1], [HD[0] + .1, HD[1] + .15], [HD[0] - .1, HD[1] + .15]], c.coat[0]); bmOval(HD[0], HD[1] + .08, .19, .03, '#1c1a1e'); }
  else if (c.hat === 'fluff') { bmPath(bmFur([[HD[0] - .16, HD[1] + .02], [HD[0] - .1, HD[1] + .22], [HD[0] + .12, HD[1] + .22], [HD[0] + .17, HD[1] + .02]], .03, c.seed + 3)); g.closePath(); g.fillStyle = c.trim; g.fill(); }
  else if (c.hat === 'sun') { bmOval(HD[0], HD[1] + .09, .3, .045, '#e2c88a'); bmFill([[HD[0] - .1, HD[1] + .09], [HD[0] + .1, HD[1] + .09], [HD[0] + .08, HD[1] + .22], [HD[0] - .08, HD[1] + .22]], '#d4b670'); bmFill([[HD[0] - .1, HD[1] + .1], [HD[0] + .1, HD[1] + .1], [HD[0] + .1, HD[1] + .14], [HD[0] - .1, HD[1] + .14]], c.coat[0]); }
  else if (c.hat === 'ranger') { bmOval(HD[0], HD[1] + .08, .27, .045, '#6e5032'); bmFill([[HD[0] - .1, HD[1] + .08], [HD[0] + .1, HD[1] + .08], [HD[0] + .085, HD[1] + .23], [HD[0] - .085, HD[1] + .23]], '#86643e'); bmFill([[HD[0] - .1, HD[1] + .09], [HD[0] + .1, HD[1] + .09], [HD[0] + .1, HD[1] + .12], [HD[0] - .1, HD[1] + .12]], '#3a2a1a'); }
  else if (c.hat === 'bopper') { for (const s2 of [-1, 1]) { const tip = [HD[0] + s2 * .1 + Math.sin(t * 6 + s2) * .03, HD[1] + .4]; bmLine([[HD[0] + s2 * .05, HD[1] + .1], tip], .015, '#2a2420'); bmDot(tip[0], tip[1], .05, c.lens); } }
  bmLine([[HD[0] - .11, HD[1] + .01], [HD[0] + .1, HD[1] + .02]], .035, '#2a2420'); bmDot(HD[0] + .075, HD[1] + .02, .05, bmLG(HD[0] + .03, HD[1] + .07, HD[0] + .12, HD[1] - .03, ['#ffffff', c.lens, bmShade(c.lens, .5)])); if (det) bmDot(HD[0] + .06, HD[1] + .04, .013, 'rgba(255,255,255,.9)');
  if (c.bike === 'snail') for (const s2 of [0, .08]) { const tip = [G[0] + .12 + s2, G[1] + .42]; bmLine([[G[0] + .02, G[1] + .03], tip], .02, '#8a5a2a'); bmDot(tip[0], tip[1], .04, '#e8d4b4'); }
  if (c.para) bmParasol(S[0] + .14, S[1] + .32, c, t, det);
  if (c.sax) bmSax(S, HD, t, det, c);
  g.restore();
}
function bmRiderShadow(X, Z, c, t) { const top = 1.95 + (c.bike === 'tall' ? 1 : 0); shadowOf([[X - .9, 0, Z], [X + .9, 0, Z], [X - .35, top, Z], [X + .3, top, Z]], t); if (c.flag) shadowStick(X - .66, 0, c.flag.h, Z, .06, t); if (c.para) shadowOf([[X - .7, top + .9, Z], [X + .9, top + .9, Z], [X, top + 1.3, Z]], t); }
function bmRiderEntry(X, Z, d, sp, t, c, list, fadeNear, id) {
  const p = P(X, 0, Z); if (p[2] < 1.2 || p[0] < -400 || p[0] > W + 400) return; const a = 1; // draft 11: no near-lens fade; riders pass the lens by moving (fadeNear is kept for the callers)
  if (id) ACT.note(id, X, Z, .8, { h: c.bike === 'tall' ? 2.9 : 1.95, a, group: 'rider' });
  list.push({ z: p[2], draw: () => { const q = P(X, 0, Z); bmRider(q[0], q[1], kAt(q), d, sp, t, c, a); }, shadow: () => bmRiderShadow(X, Z, c, t) });
}
// traffic: riders crossing all day on lanes behind the car (and a few in front), wrapped relative to the car far off-screen.
// Draft 11: every rider has a lane of its own (1.6 m apart, behind the Instrument People's file at z 10.5 and its road
// elephants, or out in front), swings round anything bigger it meets (bmObs) and round the riders already placed, and
// never blinks: a lap whose wrap the camera could see is skipped whole, and the rules that clear the foreground (the
// quiet windows, night) take a rider away only once it has ridden out of shot, and bring it back the same way.
const BM_LANES = [8, 11.5, 15, 19, 23.5, 28, 33, 39, -19, -24]; // draft 10's lanes (kept for anything that reads them)
const BM_FRONT = [8, 9, 18, 19], BM_LANE11 = (i) => { const f = BM_FRONT.indexOf(i); if (f >= 0) return -19 - f * 2; let k = 0; for (let j = 0; j < i; j++) if (BM_FRONT.indexOf(j) < 0) k++; return 17.5 + k * 1.6; };
const BM_BIKES = [...Array(22)].map((_, i) => { const R = mulberry(4000 + i * 17), v = (R() < .5 ? -1 : 1) * (2.3 + R() * 2.4); R(); return { Z: BM_LANE11(i), v, off: R() * 240, c: bmCostume(500 + i * 31), i }; });
const BM_QUIET = [[84, 99], [127, 135.5], [155.5, 171]]; // keep the foreground clear for the poor person and the cops
const bmRiderAt = (b) => (s, rel) => { if (rel == null) rel = ((((b.v * s + b.off) % 240) + 240) % 240) - 120; return [carX(clamp(s, 14, 238)) + rel, b.Z, 0]; };
// hidden from the first moment after a that the body is out of shot until the last moment before b that it is (b >= 269.5: for good)
function bmOffDuring(key, t, a, b, pos, r, h) { if (t < a) return false; const ga = bmGone(key + '>', a, pos, r, h); if (t < ga) return false; if (b >= 269.5) return true; const bb = bmBorn(key + '<', b, pos, r, h); return bb < ga || t <= bb; }
function bmRiderOff(b, t) { const at = bmRiderAt(b), k = 'rider' + b.i;
  if (b.Z < 0) { for (const [a, e] of BM_QUIET) if (t > a && bmOffDuring(k + 'q' + a, t, a, e, at, .8, 2.9)) return true; if (bmOffDuring(k + 'n', t, 200, 270, at, .8, 2.9)) return true; }
  if (b.i % 2 && bmOffDuring(k + 'n2', t, 205, 270, at, .8, 2.9)) return true;
  const n = Math.floor((b.v * t + b.off) / 240); if (bmLapAnts(b, n)) return true; return !bmLapOK('rider:' + b.i, n, b.off, b.v, 240, at, .8, 2.9); }
// the ballot-ant column (scenes.js) is a file across the whole road (and the spin whirl, BM_ZONES) at x 163-167 from 117 to about 158: a rider lap that
// would ride through it then is skipped whole (its two ends are out of shot), so riders never cut through the file
const BM_ANTQ = new Map();
// [t0, t1, x0, x1]: the ant file (scenes.js) and the spin whirl's spiral of riders as it opens out (scenes.js, 189-200)
const BM_ZONES = [[115, 160, 160.5, 169.5], [189, 200.5, 222, 338]];
function bmLapAnts(b, n) { const k = b.i + ':' + n; if (BM_ANTQ.has(k)) return BM_ANTQ.get(k); if (b.Z < -16) { BM_ANTQ.set(k, false); return false; }
  const ta = ((b.v > 0 ? n : n + 1) * 240 - b.off) / b.v, tb = ((b.v > 0 ? n + 1 : n) * 240 - b.off) / b.v; let hit = false;
  for (const [z0, z1, xa, xb] of BM_ZONES) for (let s = Math.max(ta, z0); s <= Math.min(tb, z1) && !hit; s += .2) { const X = bmRiderAt(b)(s)[0]; if (X > xa && X < xb) hit = true; }
  BM_ANTQ.set(k, hit); return hit; }
function bmTraffic(t, list) {
  const cx = carX(clamp(t, 14, 238)), obs = bmObs(t), placed = [];
  for (const b of BM_BIKES) { if (bmRiderOff(b, t)) continue;
    const rel = ((((b.v * t + b.off) % 240) + 240) % 240) - 120, vw = b.v + (t > 14 && t < 200 ? 1.6 : 0), X = cx + rel; let Z = bmAvoid(X, b.Z, .8, obs.concat(placed)); if (obs.some((o) => Math.hypot(o.X - X, o.Z - Z) < (o.r + .8) * .95)) Z = bmAvoid(X, b.Z, .8, obs); // the bigger bodies win over the riders already placed
    placed.push({ X, Z, r: .8 }); bmRiderEntry(X, Z, Math.sign(vw) || 1, Math.abs(vw) * t, t, b.c, list, undefined, 'playa:rider:' + b.i); }
}
// everything bigger than a rider that a rider steers round this frame: the board, the Instrument People's file, the
// elephants on the road and in the wars, the parade cars, the octopus, the drum circle and the art
const BM_TABLE_R = 6; // the table car with its end chairs, from its centre
// draft 11 merge: the other builders' bodies at time t, read from their own ACT.note calls. Their scene hooks are run
// into a scratch list with the actor registry switched on for the call (nothing they push is drawn), then the
// registry is put back exactly as it was. One sample per frame (kept for the last t only). Skips the burn crowd
// (bBurn parts it) and anything of ours.
let BM_FOR = { t: NaN, L: [] };
function bmForeign(t) {
  if (BM_FOR.t === t) return BM_FOR.L; const on = ACT.on, keep = ACT.list; ACT.on = true; ACT.list = [];
  const junk = [], call = (f) => { try { if (typeof f === 'function') f(t, junk); } catch (e) { } };
  call(typeof clockCar !== 'undefined' && clockCar); call(typeof giantChess !== 'undefined' && giantChess); call(typeof installsInto !== 'undefined' && installsInto);
  call(typeof scenesInto !== 'undefined' && scenesInto); call(typeof artcarsInto !== 'undefined' && artcarsInto); call(typeof artpiecesInto !== 'undefined' && artpiecesInto); call(typeof burnInto !== 'undefined' && burnInto);
  const L = ACT.list.filter((a) => !/^playa:|^burn:crowd/.test(a.id) && a.a > .02).map((a) => ({ X: a.X, Z: a.Z, r: a.r, id: a.id }));
  ACT.on = on; ACT.list = keep; BM_FOR = { t, L }; return L; }
function bmObs(t) {
  const L = bmStatic().slice(); L.push({ X: carX(t), Z: carZ(t), r: BM_TABLE_R });
  if (t < 203 && typeof IP_OFF !== 'undefined') for (const k in IP_OFF) L.push({ X: carX(t) + IP_OFF[k], Z: IP_ZW, r: .3 });
  BM_ROAD.forEach((e, i) => { const q = bmRoadPos(e, i, t); if (q) L.push({ X: q[0], Z: q[1], r: 2.2 * e.s }); });
  for (let i = 0; i < 5; i++) { const q = bmWarsPos(i, t); if (q) L.push({ X: q[0], Z: q[1], r: 2.2 * (1.05 + (i % 3) * .1) }); }
  BM_PARADE.forEach((e, i) => { const q = bmParadePos(i, t); if (q) L.push({ X: q[0], Z: q[1], r: q[2] }); });
  const st = octPose(t); if (st) L.push({ X: st.X, Z: st.Z, r: 5.5 });
  if (t >= bmDrumT0()) L.push({ X: DRUM.x, Z: DRUM.z, r: DRUM.r + .5 });
  if (typeof extrasEach === 'function') extrasEach(t, (e) => { if (e.alpha == null || e.alpha > .02) L.push({ X: e.X, Z: e.Z, r: .3, id: e.id }); }); // burn.js's Rangers and the poor woman
  bmStiltObs(t, L); // draft 21: the stilt walkers
  if (typeof MAN !== 'undefined') L.push({ X: MAN.x, Z: MAN.z, r: 12.5 }); // the Man's base (burn.js notes it from theMan, which draws directly)
  return L.concat(bmForeign(t)); }
// a costumed flock crossing in front of the camera in the first instrumental (it replaces draft 2's foreground block).
// Draft 11: between the board's far seats and the Instrument People (z 5.4-8.3, it was 7-10.2, through the file), and
// it rides in from and out to wherever no camera sees it.
const BM_FLOCK = [...Array(8)].map((_, i) => ({ dx: -i * 2.6 - (i % 2) * .9, dz: (i % 3) * 1.6, c: bmCostume(9100 + i * 7, { bike: ['tall', 'plain', 'fish', 'plain', 'clock', 'plain', 'snail', 'plain'][i], para: i % 2 ? null : BM_PARAS[i % 6], flag: i % 2 ? { h: 4 + (i % 3) * .5, col: ['#e8b23a', '#d8452f', '#2f6fb5', '#f6efe0'][i % 4], col2: '#1c1a1e' } : null }) }));
const bmFlockAt = (f) => (s) => [carX(s) - 26 + (s - 63.5) * 3.6 + f.dx, 5.4 + f.dz * .9, 0];
function bmFlockInto(t, list) { if (t < 40 || t > 110) return;
  BM_FLOCK.forEach((f, i) => { const at = bmFlockAt(f); if (t < bmBorn('flock' + i, 63.5, at, .8, 2.9) || t > bmGone('flock' + i + 'e', 75, at, .8, 2.9)) return;
    const [X, Z] = at(t); bmRiderEntry(X, Z, 1, (1.6 + 3.6) * t, t, f.c, list, undefined, 'playa:flock:' + i); }); }


// Bob's note on draft 2 (1:05): the first sax lick comes in with a rider who is playing it. No hands on the bars.
const SAX_IN = 65.0; // Bob's time for the first sax lick; nudge here if it lands early or late by ear
function bmSax(S, HD, t, det, c) { // drawn in the rider's local units (y up), inside bmRider's transform
  const sw = Math.sin(t * 7.5) * .025, gold = bmLG(S[0] - .1, S[1] + .2, S[0] + .5, S[1] - .6, ['#fbe7a0', '#d9a63a', '#8a5a14']);
  const M = [HD[0] + .1, HD[1] - .06], N = [HD[0] + .25, HD[1] - .14 + sw], B1 = [S[0] + .3, S[1] - .5 + sw], U = [S[0] + .36, S[1] - .66 + sw], B2 = [S[0] + .48, S[1] - .48 + sw], BELL = [S[0] + .55, S[1] - .26 + sw];
  // arms to the keys
  const K1 = [S[0] + .3, S[1] - .22 + sw], K2 = [S[0] + .34, S[1] - .45 + sw];
  bmLine([S, bmJoint(S, K2, .3, .31, 0, -1), K2], .1, bmShade(c.coat[1], .75));
  bmLine([M, N, B1, U, B2, BELL], .085, gold); bmLine([M, N], .03, '#1c1a1e');
  bmOval(BELL[0] + .03, BELL[1] + .05, .13, .06, '#f2d27a'); bmOval(BELL[0] + .03, BELL[1] + .05, .08, .035, '#6a4410');
  if (det) for (let i = 0; i < 5; i++) { const u = .15 + i * .15; bmDot(lerp(N[0], B1[0], u), lerp(N[1], B1[1], u), .022, '#fff3c4'); }
  bmLine([S, bmJoint(S, K1, .3, .3, 1, -.6), K1], .1, c.coat[0]); bmDot(K1[0], K1[1], .045, c.skin); bmDot(K2[0], K2[1], .045, c.skin);
  // notes puff out of the bell once the lick starts; none come out while the bell is corked (draft 9)
  if (t >= SAX_IN) for (let i = 0; i < 4; i++) { const age = ((t - SAX_IN) * 1.6 + i * .25) % 1, te = t - age / 1.6; if (te > SAX_CORK[0] - .04 && te < SAX_CORK[1]) continue; if (te > 200 && (te < SAX_OUTRO.lick - .05 || te > SAX_OUTRO.last + .4)) continue; // draft 37: at the end, notes only during the lick
    const nx = BELL[0] + .1 - age * .9, ny = BELL[1] + .25 + age * .9 + Math.sin(age * 9 + i) * .06;
    const nc = t > 200 ? '#fff0d0' : '#1c1a1e'; // cream at night, so they read against the dark playa
    g.save(); g.globalAlpha *= (1 - age) * clamp((t - SAX_IN) * 4); bmOval(nx, ny, .06, .045, nc); bmLine([[nx + .055, ny], [nx + .055, ny + .2]], .018, nc); if (i % 2) bmLine([[nx + .055, ny + .2], [nx + .14, ny + .14]], .018, nc); g.restore(); }
  // the brass mute: in the bell from the cork to the pop, then it flies off spinning
  const M0 = [BELL[0] + .03, BELL[1] + .05];
  if (t >= SAX_CORK[0] && t < SAX_CORK[1]) bmMute(M0[0], M0[1] - .03, .12 + Math.sin(t * 7.5) * .03);
  else if (t >= SAX_CORK[1] && t < SAX_CORK[1] + 1) { const u = t - SAX_CORK[1]; g.save(); g.globalAlpha *= 1 - smooth((u - .6) / .4); bmMute(M0[0] + .5 * u, M0[1] + 2.4 * u - 2.6 * u * u, .12 + u * 9); g.restore(); }
}
// the corked lick (draft 9, critic A): about 69 a suit leans out of his seat and corks the bell with a brass mute, the
// notes stop; about 70.5 the rider pops it out and a burst of six notes spills over the board.
const SAX_CORK = [69.0, 70.5];
function bmMute(x, y, rot) { // a straight mute, 0.3 m: a brass cone, narrow end down in the bell, a cork band; local metres, y up
  g.save(); g.translate(x, -y); g.rotate(rot); bmFill([[-.045, 0], [.045, 0], [.1, .3], [-.1, .3]], bmLG(-.1, 0, .1, 0, ['#fbe7a0', '#d9a63a', '#8a5a14']));
  bmFill([[-.05, .02], [.05, .02], [.058, .07], [-.058, .07]], '#b98a5a'); bmOval(0, .3, .1, .03, '#f2d27a'); g.restore(); }
function bmNote(x, y, s, flag) { // a black quaver at a screen point, s px per metre
  g.fillStyle = '#1c1a1e'; g.beginPath(); g.ellipse(x, y, .075 * s, .055 * s, -.35, 0, TAU); g.fill();
  g.strokeStyle = '#1c1a1e'; g.lineWidth = Math.max(1.2, .022 * s); g.lineCap = 'round'; g.beginPath(); g.moveTo(x + .068 * s, y); g.lineTo(x + .068 * s, y - .25 * s); if (flag) g.lineTo(x + .17 * s, y - .17 * s); g.stroke(); }
// a tracking shot: he rides alongside the drone, D m in front of it. He enters from the left edge on SAX_IN, settles left
// of centre for the lick, then pulls ahead and out to the right.
// draft 17 (Robin on d16: "that saxaphone has left but he is still playing.. the camera should still see him"): the sax
// part runs to 74.2 (the vocal stem's sax bleed and the 0.7-3 kHz band of the backing both drop there; "they're" comes
// in at 74.53). From SAX_LOOP he leaves the tracking framing, swings round the back end of the table (crossing the frame right to left)
// as the drone turns onto it, and rides back along the far side the other way (left to right), still playing, behind
// the board and the chart, and only rides out of frame on the right after the lick ends. Keys are [t, lx, lz] in the car's own frame
// (lz < 0 is the drone's side), joined by a Catmull-Rom curve so he never jerks.
const SAX_LOOP = 71.0, SAX_END = 74.2, SAX_BACK = 72.35; // from SAX_BACK (passing the table's back end) he is drawn in the scene, behind the car layer
const SAX_KEYS = [[71.6, -4.4, -6.4], [72.1, -6.6, -2.6], [72.5, -6.6, 1.0], [72.9, -4.2, 3.6], [73.3, -1.0, 3.7], [73.7, .6, 3.7], [74.1, 1.1, 3.7], [74.5, 3.0, 3.7], [75.0, 8, 3.7], [75.7, 15, 3.7]]; // the far-side lane at lz 3.7: clear of the far-row chairs (2.3) and inside the bike flock's lanes (5.4 and out); he eases off so he holds the left of the chart shot until the lick ends, then rides off behind the chart
function bmSaxTrack(t) {  const c = camAt(t), fw = [Math.sin(c.yaw), Math.cos(c.yaw)], rt = [Math.cos(c.yaw), -Math.sin(c.yaw)], D = 2.8, half = D * (W / 2) / c.f;
  const u = t - SAX_IN, lat = u < 1.6 ? lerp(-half - .9, -half * .3, smooth((u + .6) / 2.2)) : u < 6.5 ? -half * .3 + (u - 1.6) * .08 : -half * .3 + 4.9 * .08 + (u - 6.5) * (.8 + 3.6 * (u - 6.5)); // draft 11: he pulls out right sooner and faster, clear before the drone comes down to the seat line
  const X = c.x + fw[0] * D + rt[0] * lat, Z = c.z + fw[1] * D + rt[1] * lat;
  // draft 11: he stays in a world lane at least 1 m outside the seats' reach. In the car's frame his distance from the
  // centreline is held at 4.4 m or more on the camera's side while he is alongside the table (it eases off past the ends).
  const X0 = carX(t), Z0 = carZ(t), a = yaw(t), cs = Math.cos(a), sn = Math.sin(a), dX = X - X0, dZ = Z - Z0, lx = dX * cs + dZ * sn, lz = -dX * sn + dZ * cs;
  const side = Math.sign(-(c.x - X0) * sn + (c.z - Z0) * cs) || -1, w = Math.cos(Math.PI / 2 * clamp((Math.abs(lx) - 5.6) / 4)) ** 2, lz2 = side * Math.max(side * lz, 4.4 * w);
  return [X0 + lx * cs - lz2 * sn, Z0 + lx * sn + lz2 * cs];
}
const bmSaxLocal = (t) => { const [X, Z] = bmSaxTrack(t), X0 = carX(t), Z0 = carZ(t), a = yaw(t), cs = Math.cos(a), sn = Math.sin(a); return [t, (X - X0) * cs + (Z - Z0) * sn, -(X - X0) * sn + (Z - Z0) * cs]; };
let SAX_K = null;
function bmSaxPos(t) {
  if (t <= SAX_LOOP) return bmSaxTrack(t);
  if (!SAX_K) SAX_K = [bmSaxLocal(SAX_LOOP - .5), bmSaxLocal(SAX_LOOP), ...SAX_KEYS]; // a constant, worked out once from the pure flight
  const K = SAX_K; let i = 1; while (i < K.length - 2 && t > K[i + 1][0]) i++;
  const p0 = K[i - 1], p1 = K[i], p2 = K[i + 1], p3 = K[Math.min(K.length - 1, i + 2)], u = clamp((t - p1[0]) / (p2[0] - p1[0])), u2 = u * u, u3 = u2 * u;
  const cr = (j) => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3);
  let lx = cr(1), lz = cr(2); if (t > K[K.length - 1][0]) { lx = K[K.length - 1][1] + (t - K[K.length - 1][0]) * 6; lz = K[K.length - 1][2]; }
  const X0 = carX(t), Z0 = carZ(t), a = yaw(t), cs = Math.cos(a), sn = Math.sin(a); return [X0 + lx * cs - lz * sn, Z0 + lx * sn + lz * cs];
}
const bmSaxAt = (s) => { const q = bmSaxPos(s); return [q[0], q[1], 0]; };
function bmSaxInto(t, list) {
  if (t < SAX_IN - 20 || t > SAX_IN + 30 || t < bmBorn('sax', SAX_IN - .6, bmSaxAt, .8, 2.2, 20) || t > bmGone('saxe', SAX_END + .2, bmSaxAt, .8, 2.2, 20)) return;
  const [X, Z] = bmSaxPos(t);
  const q0 = P(X, 0, Z), [X2, Z2] = bmSaxPos(t + .05), q1 = P(X2, 0, Z2), d = t <= SAX_LOOP || q0[2] < .5 || q1[2] < .5 ? 1 : Math.sign(q1[0] - q0[0]) || 1; // he faces the way he rides on screen
  bmRiderEntry(X, Z, d, (t - SAX_IN) * 4 + 40, t, BM_SAX, list, false, 'playa:sax');
}
function bmSaxFront(t) { // over the car layer (render.js front hook)
  const l = []; if (t < SAX_BACK) bmSaxInto(t, l); for (const o of l) { o.shadow(); o.draw(); }
  if (t < SAX_CORK[0] - .7 || t > SAX_CORK[1] + 1.8) return;
  const [X, Z] = bmSaxPos(t), q = P(X, 0, Z); if (q[2] < .5) return; const k = kAt(q), sw = Math.sin(t * 7.5) * .025, bell = [q[0] + k * .51, q[1] - k * (1.33 + sw)];
  // the suit who corks it: the nearest seat on screen to the right of the bell leans out with one long arm
  const reach = ease(t, SAX_CORK[0] - .65, SAX_CORK[0]), back = ease(t, SAX_CORK[0] + .15, SAX_CORK[0] + .7);
  if (reach > 0 && back < 1 && typeof SEATS !== 'undefined') {
    let best = null, bd = 1e9; for (const s of SEATS) { const w = carLocalToWorld(t, s.x, s.z), sh = P(w[0], SEAT + TORSO - .08, w[1]); if (sh[2] < 1.5 || sh[0] < bell[0] + .2 * k) continue; const dd = Math.hypot(sh[0] - bell[0], sh[1] - bell[1]); if (dd < bd) { bd = dd; best = sh; } }
    const sh = best ? [best[0], best[1]] : [W + 40, bell[1] + .3 * k], ks = best ? kAt(best) : k, u = reach * (1 - back), hand = [lerp(sh[0], bell[0], u), lerp(sh[1], bell[1] - .1 * k, u)];
    const el = [(sh[0] + hand[0]) / 2 + .05 * ks, Math.max(sh[1], hand[1]) + .12 * ks * u]; // the elbow sags: a long Dali arm
    g.strokeStyle = PAL.suit; g.lineWidth = Math.max(2, .13 * ks); g.lineCap = 'round'; g.beginPath(); g.moveTo(sh[0], sh[1]); g.quadraticCurveTo(el[0], el[1], hand[0], hand[1]); g.stroke();
    g.fillStyle = '#f3efe6'; g.beginPath(); g.arc(hand[0] + .02 * k, hand[1], .055 * Math.max(k, ks), 0, TAU); g.fill(); // a white cuff
    g.fillStyle = PAL.egg; g.beginPath(); g.arc(hand[0], hand[1], .05 * Math.max(k, ks), 0, TAU); g.fill();
    if (t < SAX_CORK[0]) { g.save(); g.translate(hand[0], hand[1]); g.scale(k, k); bmMute(-.02, .02, -.5); g.restore(); } // the mute in his hand on the way in
  }
  // the pop: six notes burst out of the bell and spill over the board
  const u0 = t - SAX_CORK[1]; if (u0 > 0 && u0 < 1.8) { const tb = PL(0, TOP + .9, 0), tk = tb[2] > .5 ? kAt(tb) : k;
    for (let i = 0; i < 6; i++) { const u = clamp((u0 - i * .07) / 1.6); if (u <= 0 || u >= 1) continue; const sp = (i - 2.5) * 1.3, ex = tb[2] > .5 ? tb[0] + sp * tk : bell[0] + (3 + sp) * k, ey = tb[2] > .5 ? tb[1] + (.1 + .22 * (i % 3)) * tk : bell[1] - k;
      const x = lerp(bell[0], ex, smooth(u)), y = lerp(bell[1], ey, u * u) - Math.sin(u * Math.PI) * (.35 + .1 * (i % 2)) * k, s = lerp(k, tk, u) * 1.15;
      g.save(); g.globalAlpha = 1 - smooth((u - .65) / .35); g.translate(x, y); g.rotate(Math.sin(t * 6 + i) * .3); bmNote(0, 0, s, i % 2 === 0); g.restore(); } }
}
const BM_SAX = bmCostume(6501, { sax: true, bike: 'plain', para: null, flag: { h: 3.6, col: '#e8b23a', col2: '#1c1a1e' }, hat: 'top', coat: ['#7a3c8c', '#4a2058'], fur: true, trim: '#e8b23a' });

// ---------- art cars ----------
function bmSitter(x, y, col, hat, t, ph, wave) { // a small passenger on an art car's roof
  bmFill([[x - .17, y], [x + .17, y], [x + .14, y + .5], [x - .14, y + .5]], col); bmDot(x, y + .64, .12, '#e8cfae');
  if (hat) bmFill([[x - .1, y + .72], [x + .1, y + .72], [x + .09, y + .92], [x - .09, y + .92]], hat);
  if (wave) { const a = Math.sin(t * 5 + ph) * .4; bmLine([[x + .12, y + .45], [x + .3 + Math.sin(a) * .1, y + .8 + Math.cos(a) * .1]], .07, col); }
}
function bmCarWheels(xs, r, ang, det) { for (const x of xs) bmWheel(x, r, r, ang, det, '#7a6a58'); }
function bmArtCar(kind, x, y, k, d, t, sp, seed, sc) {
  bmBegin(x, y, k * (sc || 1), d); const det = k > 6, lx = -d, ang = -sp / .5;
  if (kind === 'drawers') { // a chest of drawers on cabriole legs; its drawers slide in and out, papers spill, a crutch props one open
    bmCarWheels([-2.5, 2.5], .34, ang, det);
    for (const lgx of [-2.7, 2.7]) bmLine([[lgx, 1.0], [lgx + .3 * Math.sign(lgx), .62], [lgx, .4]], .26, '#5a3418');
    bmFill([[-3, .95], [3, .95], [3, 4.05], [-3, 4.05]], bmLG(lx * 3, 0, -lx * 3, 0, ['#a5713f', '#7b5530', '#56381c']));
    bmFill([[-3.25, 4.0], [3.25, 4.0], [3.1, 4.3], [-3.1, 4.3]], '#8c6338');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const i = r * 2 + c, x0 = -2.8 + c * 2.85, y0 = 1.15 + r * 0.95, o = Math.pow(Math.max(0, Math.sin(t * .9 + i * 1.7 + seed)), 3) * .35 + (i === 4 ? .3 : 0);
      bmFill([[x0, y0], [x0 + 2.75, y0], [x0 + 2.75, y0 + .8], [x0, y0 + .8]], '#2a1608');
      bmFill([[x0 + o * .3, y0 - o], [x0 + 2.75 + o * .3, y0 - o], [x0 + 2.75 + o * .3, y0 + .8 - o * .6], [x0 + o * .3, y0 + .8 - o * .6]], bmLG(x0, y0 + .8, x0, y0 - o, ['#b07c48', '#7e5730']));
      bmDot(x0 + 1.37 + o * .3, y0 + .4 - o * .8, .09, '#d9b45a');
      if (o > .25 && det) for (let q = 0; q < 3; q++) { const u = (t * .7 + q * .33 + i * .1) % 1, px = x0 + 1 + q * .4 - u * 1.4, py = y0 + .8 + u * 2.2; g.save(); g.translate(px, -py); g.rotate(t * 3 + q); g.fillStyle = '#ece6d6'; g.fillRect(-.22, -.15, .44, .3); g.restore(); } }
    bmCrutch([-3.9, 0], [-2.6, 2.95], .07);
    bmSitter(-1.7, 4.3, '#e0533a', '#1c1a1e', t, 1, true); bmSitter(1.4, 4.3, '#47c1ba', null, t, 2, false); bmParasol(1.6, 4.9, { para: BM_PARAS[2], seed: 7 }, t, det);
    bmLine([[2.9, 4.3], [2.95, 7.6]], .05, '#3a3028'); bmFill([[2.95, 7.6], [1.6, 7.45 + Math.sin(t * 5) * .1], [2.95, 7.1]], '#e8b23a');
  } else if (kind === 'phone') { // a rotary telephone on wheels with a giant lobster lying across its cradle
    bmCarWheels([-2.1, 2.1], .32, ang, det);
    bmPath([[-2.8, .55], [2.8, .55], [2.35, 1.9], [1.7, 2.45], [-1.7, 2.45], [-2.35, 1.9]]); g.closePath(); g.fillStyle = bmLG(lx * 2, 2.4, -lx * 2.4, .6, ['#4a4a52', '#1d1d22', '#0c0c0e']); g.fill();
    bmLine([[-1.8, 2.2], [-.4, 2.38]], .06, 'rgba(255,255,255,.25)');
    const dr = .78, dc = [.25, 1.35]; bmDot(dc[0], dc[1], dr, '#efe6d0'); for (let i = 0; i < 10; i++) { const a = t * .5 + i / 10 * 5.2 + 1; bmDot(dc[0] + Math.cos(a) * dr * .7, dc[1] + Math.sin(a) * dr * .7, .12, '#24242a'); } bmDot(dc[0], dc[1], .3, '#c7362b');
    for (const cx2 of [-1.45, 1.45]) { bmLine([[cx2, 2.4], [cx2, 2.8]], .14, '#1d1d22'); bmLine([[cx2 - .2, 2.85], [cx2 + .2, 2.85]], .1, '#1d1d22'); }
    g.strokeStyle = '#1d1d22'; g.lineWidth = bmW(.05); g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, px = lerp(-2.6, -3.2, u) + Math.cos(u * 30) * .15, py = lerp(1.2, 2.9, u) + Math.sin(u * 30) * .1; i ? g.lineTo(px, -py) : g.moveTo(px, -py); } g.stroke();
    const red = bmLG(0, 3.4, 0, 2.5, ['#f0703c', '#d23a1e', '#8a1e0e']);
    for (let i = 0; i < 6; i++) bmOval(-2.6 + i * .42, 3.0 + Math.sin(i * .6) * .05, .34 - i * .015, .3 - i * .01, red);
    bmFill([[-2.9, 3.0], [-3.55, 3.5], [-3.7, 3.0], [-3.55, 2.5]], '#c7362b');
    bmOval(.7, 3.05, 1.15, .45, red); bmOval(1.85, 3.0, .38, .3, red); bmDot(2.05, 3.18, .06, '#1c1614');
    for (const s2 of [0, 1]) { const ax = Math.sin(t * 1.3 + s2) * .25; g.strokeStyle = '#a8301a'; g.lineWidth = bmW(.04); g.beginPath(); g.moveTo(2.15, -3.15); g.quadraticCurveTo(3.4, -(4.4 + s2 * .3), 3.6 + ax, -(5.4 - s2 * .6)); g.stroke(); }
    for (const [ox, oy, sc] of [[1.9, 1.95, 1], [1.2, 1.75, .85]]) { bmLine([[1.4, 2.75], [ox, oy + .5]], .17 * sc, '#c13a20'); const op = .2 + .2 * Math.max(0, Math.sin(t * 2 + ox)); bmOval(ox + .1, oy + .25, .42 * sc, .3 * sc, red, .4); bmFill([[ox + .35, oy + .35], [ox + .95 * sc, oy + .2 + op], [ox + .5, oy + .05]], '#d23a1e'); bmFill([[ox + .35, oy + .1], [ox + .95 * sc, oy - op * .5], [ox + .5, oy + .3]], '#b02a14'); }
    if (det) for (let i = 0; i < 4; i++) bmLine([[.2 + i * .35, 2.7], [.1 + i * .35 + Math.sin(t * 6 + i) * .05, 2.45]], .04, '#a8301a');
    bmSitter(-1.2, 3.3, '#f6f0e2', '#c7362b', t, 3, true);
  } else if (kind === 'bus') { // a bus going soft: its roof sags and drips, a soft clock on its side, its nose propped on a crutch
    bmCarWheels([-2.7, 2.6], .55, ang, det); const m = .5 + .5 * Math.sin(t * .4 + seed);
    const roof = [[-4.1, 3.0], [-3, 3.42], [-1, 3.36 - m * .1], [1, 3.3 - m * .15], [3, 3.05 - m * .2], [4.05, 2.55 - m * .25]];
    bmPath([[-4.1, .75], [4.3, .75], [4.35, 1.6], ...roof.slice().reverse()]); g.closePath(); g.fillStyle = bmLG(lx * 4, 3.3, -lx * 4, .8, ['#f6c45a', '#e09a2a', '#9a5a14']); g.fill();
    for (let i = 0; i < 9; i++) { const dx = -3.6 + i * .9 + Math.sin(i * 2.1) * .2, top = lerp(3.0, 2.6, (dx + 4) / 8) - .05, L = .3 + .5 * (.5 + .5 * Math.sin(t * .6 + i * 1.9)) * (.4 + .6 * m); bmPath([[dx - .16, top], [dx + .16, top], [dx + .07, top - L], [dx, top - L - .12], [dx - .07, top - L]]); g.closePath(); g.fillStyle = '#e8a83a'; g.fill(); }
    for (let i = 0; i < 6; i++) { const wx = -3.5 + i * 1.05, wy = 1.95; bmFill([[wx, wy], [wx + .85, wy], [wx + .85, wy + .62 - i * .03], [wx, wy + .62 - i * .03]], '#3b4a5e'); if (i % 2 === 0) { bmDot(wx + .42, wy + .32, .14, '#e8cfae'); bmFill([[wx + .3, wy + .1], [wx + .55, wy + .1], [wx + .55, wy + .2], [wx + .3, wy + .2]], '#1c1a1e'); } }
    bmFill([[3.0, 1.9], [3.95, 1.9], [4.05, 2.45 - m * .2], [3.0, 2.6]], '#4a5a70');
    const cc = [-.6, 1.25]; bmPath([]); g.beginPath(); for (let i = 0; i <= 36; i++) { const a = i / 36 * TAU, sag = Math.max(0, -Math.sin(a)) * (.25 + .35 * m); const px = cc[0] + Math.cos(a) * .85, py = cc[1] + Math.sin(a) * .5 - sag; i ? g.lineTo(px, -py) : g.moveTo(px, -py); } g.closePath(); g.fillStyle = '#f2e6c0'; g.fill(); g.strokeStyle = '#a07a2a'; g.lineWidth = bmW(.06); g.stroke();
    for (const [L, s2, wd] of [[.32, .25, .06], [.5, 3, .035]]) { const a = -t * s2; bmLine([cc, [cc[0] + Math.cos(a) * L, cc[1] + Math.sin(a) * L * .6]], wd, '#2a1a10'); }
    bmCrutch([5.0, 0], [4.25, 1.05], .07);
    bmSitter(-2.4, 3.36, '#9a68dc', null, t, 4, true); bmSitter(-.8, 3.32, '#f4b0cf', '#1c1a1e', t, 5, false); bmSitter(.9, 3.25, '#e3cb82', null, t, 6, true);
    bmLine([[-3.6, 3.2], [-3.7, 6.6]], .05, '#3a3028'); bmFill([[-3.7, 6.6], [-5.2, 6.4 + Math.sin(t * 5 + 2) * .1], [-3.7, 6.05]], '#2f6fb5');
  } else if (kind === 'swan') { // a swan whose head is an elephant's, gliding on a painted lake skirt
    const by = .55, bc = bmLG(lx * 3, 3, -lx * 3, .6, ['#fffaf0', '#e4ddcf', '#a9a294']);
    bmPath([[-3.4, by + 2.1], [-2.6, by + .7], [-1, by + .25], [1.5, by + .3], [2.8, by + .9], [3.1, by + 1.6], [2.4, by + 1.85], [.5, by + 1.7], [-1.6, by + 1.9]]); g.closePath(); g.fillStyle = bc; g.fill();
    const wf = Math.sin(t * 1.6 + seed) * .25; bmPath([[-2.1, by + 1.8], [-1.6, by + 3.3 + wf], [-.6, by + 3.9 + wf], [.6, by + 3.4 + wf * .6], [1.4, by + 1.9]]); g.closePath(); g.fillStyle = bmLG(0, by + 3.9, 0, by + 1.8, ['#fbf6ec', '#d9d0c0']); g.fill();
    if (det) { g.strokeStyle = 'rgba(120,110,95,.5)'; g.lineWidth = bmW(.04); for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-1.7 + i * .55, -(by + 2.0)); g.quadraticCurveTo(-1.5 + i * .5, -(by + 2.9 + wf), -1.2 + i * .45, -(by + 3.5 + wf * .8)); g.stroke(); } }
    g.strokeStyle = '#efe8da'; g.lineCap = 'round'; for (const [wd, a0] of [[.62, 0], [.45, .45]]) { g.lineWidth = bmW(wd); g.beginPath(); const pts = [[2.5, by + 1.6], [3.4, by + 2.8], [2.7, by + 4.0], [3.1, by + 5.0]]; const q = (u) => { const a = 1 - u; return [a * a * a * pts[0][0] + 3 * a * a * u * pts[1][0] + 3 * a * u * u * pts[2][0] + u * u * u * pts[3][0], a * a * a * pts[0][1] + 3 * a * a * u * pts[1][1] + 3 * a * u * u * pts[2][1] + u * u * u * pts[3][1]]; }; for (let i = 0; i <= 12; i++) { const pt = q(a0 + (1 - a0) * i / 12); i ? g.lineTo(pt[0], -pt[1]) : g.moveTo(pt[0], -pt[1]); } g.stroke(); }
    const hc = [3.3, by + 5.3]; bmDot(hc[0], hc[1], .62, bmLG(hc[0] + lx * .5, hc[1] + .5, hc[0] - lx * .5, hc[1] - .5, [PAL.elephantLit, PAL.elephant])); bmOval(hc[0] - .35, hc[1] - .05, .45, .62, bmShade(PAL.elephant, .82), -.2 + Math.sin(t * 2) * .1); bmDot(hc[0] + .28, hc[1] + .2, .06, '#1c1614');
    g.strokeStyle = PAL.elephant; g.lineWidth = bmW(.24); g.beginPath(); g.moveTo(hc[0] + .45, -(hc[1] - .2)); g.quadraticCurveTo(hc[0] + 1.3, -(hc[1] - .6), hc[0] + 1.1 + Math.sin(t * 1.5) * .15, -(hc[1] - 1.6)); g.stroke(); bmLine([[hc[0] + .35, hc[1] - .35], [hc[0] + .75, hc[1] - .5]], .07, '#efe6d0');
    bmFill([[-.9, by + 1.7], [.7, by + 1.7], [.6, by + 2.4], [-.8, by + 2.4]], '#c7362b'); bmLine([[-.85, by + 2.4], [-.85, by + 3.1]], .05, '#d9b45a'); bmLine([[.65, by + 2.4], [.65, by + 3.1]], .05, '#d9b45a'); bmPath([[-1.05, by + 3.05], [.85, by + 3.05], [-.1, by + 3.6]]); g.closePath(); g.fillStyle = '#d9b45a'; g.fill();
    bmSitter(-.45, by + 2.4, '#47c1ba', null, t, 8, true); bmSitter(.25, by + 2.4, '#e0533a', '#1c1a1e', t, 9, false);
    bmPath([[-3.6, 0]]); g.beginPath(); g.moveTo(-3.7, 0); for (let i = 0; i <= 24; i++) { const u = i / 24, px = -3.7 + u * 7.4; g.lineTo(px, -(.65 + Math.sin(u * 14 - t * 3 + seed) * .07)); } g.lineTo(3.7, 0); g.closePath(); g.fillStyle = bmLG(0, .7, 0, 0, ['#8fb8d8', '#3f6f9a', '#2a4f74']); g.fill();
    if (det) { g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = bmW(.03); for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-3 + i * 1.7, -.35); g.lineTo(-2.4 + i * 1.7, -.35); g.stroke(); } }
  }
  g.restore();
}
const BM_CAR_SIZE = { drawers: [4.2, 7.8], phone: [3.8, 5.5], bus: [5.2, 6.8], swan: [4.6, 6] }; // half length, height
// the parades: one per instrumental, each car on a lane behind the table, entering and leaving off-screen.
// [kind, lane Z, enter time, offset from the car at entry, speed relative to the car, leave time]
const BM_PARADE = [
  ['drawers', 18, 59.4, 36, -4.4, 75.5, 1.6], ['phone', 25, 61.6, 38, -4.4, 77, 1.7], ['bus', 18, 63.8, 40, -4.4, 79, 1.5],
  ['swan', 27, 116.9, -34, 6.2, 126.5, 1.3], ['drawers', 34, 117.6, -42, 6.2, 127, 1.2], ['bus', 39, 118.3, -48, 6.2, 128, 1.2], // draft 11 merge: beyond the head of the ballot-ant file as each crosses x 165
];
// draft 11: the parade lanes are out behind the Instrument People's file and the road elephants (z 18-28, they were 14-24),
// each car swings out round the playa's art and installations on their far side, and it drives on in and out of shot
// round its window (no near-lens fade).
const bmParadeAt = (i) => (s) => { const [kind, Z, t0, r0, vr] = BM_PARADE[i]; return [carX(s) + r0 + vr * (s - t0), Z, 0]; };
function bmParadePos(i, t) { const [kind, Z0, t0, , , t1, sc] = BM_PARADE[i], sz = BM_CAR_SIZE[kind].map((v) => v * sc), at = bmParadeAt(i);
  if (t < t0 - 40 || t > t1 + 40 || t < bmBorn('parade' + i, t0, at, sz[0], sz[1], 40) || t > bmGone('parade' + i + 'e', t1, at, sz[0], sz[1], 40)) return null;
  const X = at(t)[0], fo = bmForeign(t).filter((o) => !/^scenes:ant/.test(o.id)).map((o) => ({ X: o.X, Z: o.Z, r: o.r, side: 1 }));
  return [X, bmAvoid(X, Z0, sz[0], bmStatic().map((o) => ({ X: o.X, Z: o.Z, r: o.r, side: 1 })).concat(fo)), sz[0]]; }
function bmParadeInto(t, list) {
  BM_PARADE.forEach(([kind, Z0, t0, r0, vr, t1, sc], i) => { const q = bmParadePos(i, t); if (!q) return; const X = q[0], Z = q[1], vw = 1.6 + vr, p = P(X, 0, Z), sz = BM_CAR_SIZE[kind].map((v) => v * sc); if (p[2] < 2) return; const k = kAt(p); if (p[0] < -sz[0] * k * 1.5 - 300 || p[0] > W + sz[0] * k * 1.5 + 300) return;
    const d = Math.sign(vw) || 1, a = 1; ACT.note('playa:parade:' + i, X, Z, sz[0], { h: sz[1], a, group: 'artcar' });
    list.push({ z: p[2], draw: () => { g.save(); g.globalAlpha = a; bmArtCar(kind, p[0], p[1], k, d, t, Math.abs(vw) * t / sc, i, sc); g.restore(); }, shadow: () => shadowOf([[X - sz[0], 0, Z], [X + sz[0], 0, Z], [X - sz[0] * .8, sz[1] * .6, Z], [X + sz[0] * .8, sz[1] * .55, Z]], t) }); });
}

// ---------- the poor person (129.54 "poor", 131.32 "share", 132.32 "unfair") ----------
// on foot, a bowl held out: she walks up to the end of the table, holds the bowl up to the end seat and walks
// with the table; on "unfair" she stops, the board rolls on, and her bowl turns over: empty.
function bmPoorInto(t, list) {
  const poor = wt(17, 'poor'), share = wt(17, 'share'), unfair = wt(18, 'unfair'), s = L_(16).s - .6, e = L_(19).s + 1.6; if (t < s - 30 || t > e + 30) return;
  const poorAt = (u) => { const tt = Math.min(u, unfair + .15); return [carX(tt) + lerp(11, 6.15, ease(tt, s, poor - .05)), -3, 0]; }; // draft 11: in and out where no camera sees
  if (t < bmBorn('poor', s, poorAt, .3, 1.8, 30) || t > bmGone('poore', e, poorAt, .3, 1.8, 30)) return;
  const stop = unfair + .15, tt = Math.min(t, stop), rel = lerp(11, 6.15, ease(tt, s, poor - .05)), X = carX(tt) + rel, Z = -3.0;
  const walking = t < poor ? 1 : t < stop ? .55 : 0, phase = t * 5.2, ask = ease(t, poor - .3, poor + .25), more = ease(t, share - .2, share + .3), drop = ease(t, unfair + .35, unfair + 1.5), tip = ease(t, unfair - .05, unfair + .45), turn = t > stop + .5 ? 1 : -1;
  const p = P(X, 0, Z); if (p[2] < 1.5) return; ACT.note('playa:poor', X, Z, .3, { h: 1.8, group: 'scene' });
  list.push({ z: p[2], draw: () => { const q = P(X, 0, Z), k = kAt(q); bmBegin(q[0], q[1], k, turn); const lx = -turn, det = k > 14;
    const st = Math.sin(phase) * .2 * walking, coat = '#7d6248', coatD = '#4e3c2c';
    for (const [sgn, col] of [[-1, '#3a2e26'], [1, '#55453a']]) { const hip = [0, .88], foot = [sgn * st + .02, .02], kn = bmJoint(hip, foot, .45, .45, 1, 0); bmLine([hip, kn, foot], .12, col); bmOval(foot[0] + .06, .04, .1, .045, '#2a201a'); }
    const ink = 'rgba(36,22,14,.75)', inkW = bmW(.022); // draft 9: a dark edge so she holds up at phone size against the playa
    bmPath([[-.2, 1.42], [.16, 1.42], [.25, .92], [.3, .5], [.05, .46], [-.15, .52], [-.32, .5], [-.27, .95]]); g.closePath(); g.fillStyle = bmLG(lx * .35, 0, -lx * .35, 0, [coat, coatD]); g.fill(); g.strokeStyle = ink; g.lineWidth = inkW; g.lineJoin = 'round'; g.stroke();
    if (det) { bmFill([[-.15, .7], [.02, .7], [.02, .86], [-.15, .86]], '#9a8462'); bmFill([[.08, 1.05], [.2, 1.05], [.2, 1.16], [.08, 1.16]], '#5e5a48'); g.strokeStyle = 'rgba(30,20,10,.5)'; g.lineWidth = bmW(.012); g.setLineDash([.025, .02]); g.strokeRect(-.15, -.86, .17, .16); g.setLineDash([]); }
    bmFill([[-.24, 1.45], [.2, 1.45], [.26, 1.1], [-.3, 1.05]], '#8a3a2c'); g.strokeStyle = ink; g.lineWidth = inkW; g.stroke(); // a shawl
    const sh = [.08, 1.36], hand = [lerp(.3, .5, ask) + more * .08 - drop * .25, lerp(1.0, 1.42, ask) + more * .2 - drop * .45], el = bmJoint(sh, hand, .3, .3, .2, -1);
    bmLine([[-.12, 1.36], [-.08, 1.1], [.06, 1.06]], .09, coatD); bmLine([sh, el, hand], .095, coat); bmDot(hand[0], hand[1], .045, '#c99a72');
    g.save(); g.translate(hand[0] + .12, -(hand[1] + .04)); g.rotate(tip * 2.6); g.beginPath(); g.ellipse(0, 0, .3, .12, 0, 0, Math.PI); g.closePath(); g.fillStyle = '#8a5a2c'; g.fill(); g.strokeStyle = ink; g.lineWidth = inkW; g.stroke(); g.beginPath(); g.ellipse(0, 0, .3, .06, 0, 0, TAU); g.fillStyle = '#4a2c14'; g.fill(); g.restore(); // the bowl, a little bigger
    bmLine([[.02, 1.45], [.04, 1.52]], .07, '#c99a72'); bmOval(.05, 1.64, .1, .12, bmLG(.05 + lx * .1, 1.75, .05 - lx * .1, 1.55, ['#e2b88e', '#9a6a46'])); g.strokeStyle = ink; g.lineWidth = inkW; g.stroke();
    bmPath([[-.08, 1.62], [-.02, 1.8], [.14, 1.78], [.16, 1.66], [.05, 1.74], [-.02, 1.55], [-.12, 1.42]]); g.closePath(); g.fillStyle = '#a04a3a'; g.fill(); // headscarf
    g.restore(); }, shadow: () => shadowOf([[X - .3, 0, Z], [X + .3, 0, Z], [X - .15, 1.75, Z], [X + .2, 1.75, Z]], t) });
}

// ---------- the cops: coin-operated pawns (155.94 on, "cop" 158.3, "paid" 159.38) ----------
// Draft 9 (critic C, the scout): giant black chess pawns that read as police: boots under the base, a duty belt, a
// silver badge, a black baton held up, and for a head a parking meter in a peaked cap, its red EXPIRED flag up in the
// window. They drop onto the playa one by one behind the table and keep pace like an escort. On "paid" the board flips
// a coin into each slot in a domino (.1 s apart): the red flag drops and a gold PAID flag snaps up. On "perverse" they
// go over onto their caps; on "rehearsed" they spring back up into the sky, tumbling, the way they came.
// Meanwhile two real Rangers (khaki, flashlights on their belts, unpaid volunteers) ride past behind them the other
// way, and a burner by a cooler hands each of them a cold drink.
const COP = { boot: .34, s: 1.36 };
COP.neck = COP.boot + 1.58 * COP.s; COP.m0 = COP.neck + .2; COP.slot = COP.m0 + .3; COP.top = COP.m0 + 1.15;
function bmPawn(x, y, k, t, i, o) { // front view, about 3.9 m to the top of the cap; o: sq (landing squash), flip (turns), pay (0..1 flag swap), baton (0..1 raise)
  bmBegin(x, y, k, 1); const s = COP.s, det = k > 5, blk = bmLG(-.6 * s, 0, .6 * s, 0, ['#55555f', '#1c1c22', '#08080a']);
  g.scale(1 + o.sq * .12, 1 - o.sq * .12); if (o.flip) { const hp = COP.top / 2; g.translate(0, -hp); g.rotate(Math.PI * o.flip); g.translate(0, hp); }
  // boots: two black riot boots under the base, a shine on each toe
  for (const sx of [-1, 1]) { const bx = sx * .27; bmFill([[bx - .14, .08], [bx + .14, .08], [bx + .12, COP.boot + .06], [bx - .12, COP.boot + .06]], bmLG(bx - .14, 0, bx + .14, 0, ['#34343c', '#121216', '#050507']));
    bmOval(bx + sx * .03, .1, .2, .1, '#0c0c10'); bmFill([[bx - .2, 0], [bx + .23, 0], [bx + .23, .035], [bx - .2, .035]], '#3a2a1e');
    bmOval(bx - .05, .14, .06, .025, 'rgba(255,255,255,.5)'); if (det) bmLine([[bx - .08, .16], [bx - .07, COP.boot]], .025, 'rgba(255,255,255,.3)'); }
  g.save(); g.translate(0, -COP.boot);
  // the pawn: base, column, collar
  bmPath([[-.62 * s, 0], [.62 * s, 0], [.56 * s, .16 * s], [.42 * s, .24 * s], [.46 * s, .34 * s], [.26 * s, .4 * s], [.18 * s, 1.42 * s], [.32 * s, 1.5 * s], [.24 * s, 1.58 * s], [-.24 * s, 1.58 * s], [-.32 * s, 1.5 * s], [-.18 * s, 1.42 * s], [-.26 * s, .4 * s], [-.46 * s, .34 * s], [-.42 * s, .24 * s], [-.56 * s, .16 * s]]); g.closePath(); g.fillStyle = blk; g.fill();
  if (det) bmLine([[-.12 * s, .5 * s], [-.08 * s, 1.35 * s]], .04 * s, 'rgba(255,255,255,.18)');
  // the duty belt and buckle, the badge
  const bw = (y) => (.26 - .08 * (y - .4) / 1.02) * s + .02; bmFill([[-bw(.74), .74 * s], [bw(.74), .74 * s], [bw(.84), .84 * s], [-bw(.84), .84 * s]], '#3a2a1c'); bmFill([[-.07, .75 * s], [.07, .75 * s], [.07, .83 * s], [-.07, .83 * s]], '#c9cdd2');
  { const cx = .02, cy = 1.24 * s, R = .11, pts = []; for (let j = 0; j < 10; j++) { const a = Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? R * .45 : R; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } bmFill(pts, '#dfe3e8'); }
  // the baton arm: out to the side, the black baton held up (lifted on "cop")
  { const sh = [-.2 * s, 1.36 * s], hand = [-.66 * s, (1.0 + .18 * o.baton) * s], el = bmJoint(sh, hand, .4 * s, .4 * s, -1, -1), a = 1.0 - .35 * o.baton;
    bmLine([sh, el, hand], .13 * s, '#1a1a20'); bmLine([[hand[0] + Math.sin(a) * .12, hand[1] - Math.cos(a) * .12], [hand[0] - Math.sin(a) * .78, hand[1] + Math.cos(a) * .78]], .075 * s, '#0a0a0c');
    bmLine([[hand[0] + Math.sin(a) * .02, hand[1] - Math.cos(a) * .02], [hand[0] - Math.sin(a) * .1 + .12, hand[1] + Math.cos(a) * .1]], .05, '#0a0a0c'); bmDot(hand[0], hand[1], .07 * s, '#1a1a20'); }
  g.restore();
  // the head: a parking meter on its post, a peaked cap on top
  const m0 = COP.m0, steel = bmLG(-.4, 0, .4, 0, ['#c9ced4', '#8c939b', '#545a62']), cy = m0 + .5;
  bmFill([[-.07, COP.neck - .02], [.07, COP.neck - .02], [.07, m0 + .02], [-.07, m0 + .02]], '#6d737b');
  bmPath([[-.4, m0 + .06], [-.34, m0], [.34, m0], [.4, m0 + .06], [.4, cy]]); g.arc(0, -cy, .4, 0, Math.PI, true); g.closePath(); g.fillStyle = steel; g.fill();
  g.save(); g.beginPath(); g.arc(0, -(cy + .02), .31, Math.PI, TAU); g.closePath(); g.fillStyle = '#e8eef0'; g.fill(); g.clip(); // the window
  const red = 1 - ease(o.pay, 0, .5), gold = easeOutBack(clamp(o.pay * 1.6 - .4), 2.2);
  // the flags swing on one pivot under the window's middle: red EXPIRED drops away to the left, gold PAID snaps up from the right
  const flag = (rot, c1, c2) => { g.save(); g.translate(0, -(cy + .01)); g.rotate(rot); bmFill([[-.12, 0], [.12, 0], [.12, .29], [-.12, .29]], c1); bmFill([[-.12, .22], [.12, .22], [.12, .29], [-.12, .29]], c2); g.restore(); };
  if (red > 0) flag(-(1 - red) * Math.PI, '#d0281f', '#8e1a14');
  if (gold > 0) flag((1 - gold) * Math.PI, '#f2c230', '#a87a1a');
  if (det) { g.strokeStyle = 'rgba(40,40,46,.6)'; g.lineWidth = bmW(.015); g.beginPath(); g.arc(0, -(cy + .02), .22, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
  g.restore(); g.beginPath(); g.arc(0, -(cy + .02), .31, Math.PI, TAU); g.closePath(); g.strokeStyle = '#3a3f46'; g.lineWidth = bmW(.04); g.stroke();
  bmFill([[-.09, m0 + .29], [.09, m0 + .29], [.09, m0 + .33], [-.09, m0 + .33]], '#15171a'); bmDot(0, m0 + .14, .055, '#dfe3e8'); // the coin slot and the knob
  // the peaked cap: navy crown, dark band, black visor, a small gold badge
  const c0 = cy + .32; bmFill([[-.3, c0], [.3, c0], [.38, c0 + .2], [-.38, c0 + .2]], '#1f2a44'); bmFill([[-.3, c0], [.3, c0], [.31, c0 + .07], [-.31, c0 + .07]], '#0e1220');
  bmOval(.04, c0 - .01, .32, .055, '#08080c'); bmDot(0, c0 + .13, .05, '#d9b45a');
  g.restore();
}
function bmCopsInto(t, list) {
  const s = L_(28).s, cop = wt(28, 'cop'), paid = wt(28, 'paid'), pv = wt(29, 'perverse'), r30 = L_(30).s, end = r30 + 1.2; if (t < s - 1 || t > end) return; const n = 7;
  for (let i = 0; i < n; i++) { const land = s + .3 + i * ((cop - .2 - s - .3) / (n - 1)), dt = t - land; if (dt < -1.05) continue; // draft 11: they fall in from 33 m up, above every frame (same fall, begun higher)
    const ue = clamp((t - (r30 - .45 + i * .05)) / .8), Y = (dt < 0 ? 9 * (dt / .55) * (dt / .55) : 0) + 26 * ue * ue, sq = dt >= 0 ? Math.max(0, Math.sin(clamp(dt / .35) * Math.PI)) * (1 - clamp(dt / .35)) * 2 : 0;
    const rel = -6.3 + i * 2.1, Z = 7 + (i % 2) * .6, X = carX(t) + rel, fl = ease(t, pv - .05 + i * .06, pv + .45 + i * .06) + 1.4 * ue * ue;
    const cl = paid + i * .1, pay = clamp((t - cl - .02) / .25), baton = ease(t, cop - .15, cop + .1) * (1 - ease(t, cop + .5, cop + .9));
    if (Y > 40) continue; // gone up out of every frame
    ACT.note('playa:cop:' + i, X, Z, .85, { h: 3.9, group: 'scene' });
    list.push({ z: P(X, 0, Z)[2], draw: () => { const q = P(X, Y, Z), k = kAt(q); if (q[2] < 1) return; bmPawn(q[0], q[1], k, t, i, { sq, flip: fl, pay, baton });
        if (sq > 0 && Y === 0) { const pg = P(X, 0, Z), kg = kAt(pg); g.fillStyle = `rgba(220,190,140,${.4 * sq})`; g.beginPath(); g.ellipse(pg[0], pg[1], 1.4 * kg * (1 + clamp(dt / .35)), .3 * kg, 0, 0, TAU); g.fill(); }
        // the coin: flipped up from the far edge of the table, it drops into the slot on its beat
        const u = clamp((t - cl + .5) / .5); if (u > 0 && u < 1) { const a = PL(clamp(rel - .3, -TL + .4, TL - .4), TOP + .1, 1.2), b = P(X, COP.slot + .03, Z - .05), kk = kAt(b);
          const cx = lerp(a[0], b[0], u), cy = lerp(a[1], b[1], u) - Math.sin(u * Math.PI) * 1.4 * kk, spin = Math.abs(Math.cos(t * 14 + i)); g.fillStyle = '#f0c84a'; g.beginPath(); g.ellipse(cx, cy, Math.max(2.5, .15 * kk * (.35 + .65 * spin)), Math.max(2.5, .15 * kk), 0, 0, TAU); g.fill(); g.strokeStyle = '#a87a1a'; g.lineWidth = Math.max(1, .03 * kk); g.stroke(); } },
      shadow: () => { if (Y < 1) shadowOf([[X - .8, 0, Z], [X + .8, 0, Z], [X - .4, 3.6, Z], [X + .4, 3.6, Z]], t); } }); }
  // draft 11: the Rangers and the giver are called from playaInto now, so the cops' window no longer cuts them off
}
// the Rangers and the burner with the cooler: they pass him right on "paid" (one drink each, .42 s apart)
const BM_RANGERS = [0, 1].map((j) => bmCostume(7710 + j * 7, { coat: ['#c2ab80', '#8a7650'], fur: false, spots: false, stripes: false, legs: j ? '#4e3c2a' : '#5a4632', skin: j ? '#e8cfae' : '#8a5a3c', hat: 'ranger', para: null, flag: null, frame: j ? '#2f3a2a' : '#5a4632', bike: 'plain', ranger: true, trim: '#3a2c20' }));
const BM_GIVER = bmCostume(7733, { coat: ['#47c1ba', '#1d6f6a'], fur: true, trim: '#f4b0cf', hat: 'fluff', legs: '#e8d4b4' });
function bmRangersInto(t, list) {
  const paid = wt(28, 'paid'); if (t < paid - 40 || t > paid + 40) return; const Xg = carX(paid) + 9.5, Zg = 11.4; // draft 11: he and the Rangers are behind the Instrument People's file (z 10.5), not through it
  let held = 2; const rAt = (j) => (s) => { const u = s - (paid + .05 + j * .42); return [Xg + .3 - (3 * u - 1.76 * Math.tanh(u / .8)), 12.6 + j * 1.7, 0]; };
  [0, 1].forEach((j) => { const tj = paid + .05 + j * .42, u = t - tj, dx = 3 * u - 1.76 * Math.tanh(u / .8), X = Xg + .3 - dx, Z = 12.6 + j * 1.7; if (u > 0) held--;
    if (t < bmBorn('ranger' + j, paid - 5, rAt(j), .8, 2.2, 35) || t > bmGone('ranger' + j + 'e', paid + 4, rAt(j), .8, 2.2, 35)) return; // draft 11: they ride in and out of shot
    bmRiderEntry(X, Z, -1, 60 + dx, t, Object.assign({}, BM_RANGERS[j], { drink: u > 0 ? 1 : 0 }), list, undefined, 'playa:ranger:' + j); });
  const gAt = () => [Xg, Zg, 0]; if (t < bmBorn('giver', paid - 5, gAt, .9, 1.9, 35) || t > bmGone('givere', paid + 4, gAt, .9, 1.9, 35)) return; // he is there before the shot finds him and after it leaves
  const p = P(Xg, 0, Zg); if (p[2] < 1.5) return; ACT.note('playa:giver', Xg, Zg, .45, { h: 1.9, group: 'scene' }); const reach = Math.max(0, 1 - Math.abs(t - (paid + .26)) / .55);
  list.push({ z: p[2], draw: () => { const q = P(Xg, 0, Zg), k = kAt(q); if (k < 1) return; bmGiver(q[0], q[1], k, t, held, reach); }, shadow: () => shadowOf([[Xg - .5, 0, Zg], [Xg + .9, 0, Zg], [Xg, 1.9, Zg]], t) });
}
function bmGiver(x, y, k, t, held, reach) { // a burner in a fur coat by a cooler, holding cold cans up to the riders going by
  const c = BM_GIVER, det = k > 12; bmBegin(x, y, k, 1);
  bmFill([[-.75, 0], [-.15, 0], [-.15, .42], [-.75, .42]], bmLG(-.75, 0, -.15, 0, ['#f6f2ea', '#c9c4ba'])); bmFill([[-.78, .42], [-.12, .42], [-.12, .5], [-.78, .5]], '#c7362b'); // the cooler
  for (const [fx, col] of [[-.06, bmShade(c.legs, .7)], [.1, c.legs]]) bmLine([[fx * .5 + .02, .9], [fx, .05]], .12, col);
  const coat = [[-.2, 1.45], [.2, 1.45], [.26, .82], [-.24, .82]]; bmPath(det ? bmFur(coat, .03, c.seed) : coat); g.closePath(); g.fillStyle = bmLG(-.25, 0, .25, 0, [c.coat[0], c.coat[1]]); g.fill();
  bmLine([[0, 1.45], [.02, 1.53]], .07, c.skin); bmOval(.02, 1.66, .11, .13, c.skin); bmPath(bmFur([[-.14, 1.68], [-.09, 1.88], [.13, 1.88], [.18, 1.68]], .03, c.seed + 3)); g.closePath(); g.fillStyle = c.trim; g.fill();
  bmLine([[-.11, 1.67], [.13, 1.68]], .035, '#2a2420');
  const sh = [.14, 1.38], hand = [lerp(.38, .55, reach), lerp(1.15, 1.75, reach)], el = bmJoint(sh, hand, .3, .3, 1, -1); bmLine([sh, el, hand], .09, c.coat[0]); bmDot(hand[0], hand[1], .045, c.skin);
  for (let j = 0; j < held; j++) bmCan(hand[0] - .02 + j * .09, hand[1] - .02);
  g.restore();
}
function bmCan(x, y) { bmFill([[x - .04, y], [x + .04, y], [x + .04, y + .14], [x - .04, y + .14]], bmLG(x - .04, 0, x + .04, 0, ['#7fc0ec', '#2f6fb5', '#1c4f86'])); bmFill([[x - .04, y + .12], [x + .04, y + .12], [x + .04, y + .145], [x - .04, y + .145]], '#d9dde2'); bmDot(x - .015, y + .06, .012, 'rgba(255,255,255,.85)'); bmDot(x + .015, y + .09, .01, 'rgba(255,255,255,.85)'); }

// ---------- camps: vary along the road ----------
const BM_KINDS = ['dome', 'tent', 'yurt', 'dome', 'sail', 'chairs', 'drip', 'eye', 'speakers', 'arch', 'flags', 'dome', 'tent', 'yurt'];
const BM_CAMPS = []; { const R = mulberry(78); let last = ''; for (let X = -100; X < 440; X += 11 + R() * 11) { let kind = BM_KINDS[Math.floor(R() * BM_KINDS.length)]; if (kind === last) kind = BM_KINDS[(BM_KINDS.indexOf(kind) + 3) % BM_KINDS.length]; last = kind;
  BM_CAMPS.push({ X, Z: 50 + R() * 38, kind, r: 4 + R() * 4, col: ['#d8452f', '#2f6fb5', '#e8b23a', '#7a3c8c', '#f2ede0', '#3c8c5a'][Math.floor(R() * 6)], col2: ['#f2ede0', '#e8b23a', '#d8452f'][Math.floor(R() * 3)], seed: Math.floor(R() * 1e4) }); } }
// a sparse near ring between the road and the camps, kept clear of the other builders' installations
{ const R = mulberry(91), skip = [[-24, 8], [52, 84], [88, 152], [210, 262]], NEAR = ['parked', 'sail', 'flags', 'umbrella', 'parked', 'chairs', 'speakers'];
  for (let X = -80; X < 420; X += 26 + R() * 22) { if (skip.some(([a, b]) => X > a && X < b)) continue; BM_CAMPS.push({ X, Z: 31 + R() * 8, kind: NEAR[Math.floor(R() * NEAR.length)], r: 2.4 + R() * 1.6, col: ['#d8452f', '#2f6fb5', '#e8b23a', '#7a3c8c', '#3c8c5a'][Math.floor(R() * 5)], col2: '#f2ede0', seed: Math.floor(R() * 1e4) }); } }
BM_CAMPS[19].X = 149; BM_CAMPS[19].Z = 98; // draft 21 (Robin: no art in the fire circle): out to 160 m from the Man, 8:20 (was 232, 58, 69 m). Draft 11: draft 11 merge: the chairs piece moves clear of the monolith, the ring its visitors walk, and the burn ring cars (artpieces.js)
function bmCamp(c, t, p) {
  const k = kAt(p), r = c.r; bmBegin(p[0], p[1], k, 1); const det = k > 5;
  if (c.kind === 'dome') { // geodesic: a shaded half disc, triangulated struts, a few fabric panels
    g.beginPath(); g.arc(0, 0, r, Math.PI, TAU); g.closePath(); g.fillStyle = bmLG(-r, r, r, 0, ['#fbf4e4', '#d9cdb6', '#a99c86']); g.fill();
    g.save(); g.clip(); for (let i = 0; i < 3; i++) { const a0 = Math.PI + (.15 + i * .28 + (c.seed % 7) * .02) * Math.PI; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, a0, a0 + .16 * Math.PI); g.closePath(); g.fillStyle = i === 1 ? c.col2 : c.col; g.globalAlpha = .6; g.fill(); } g.restore(); g.globalAlpha = 1;
    if (det) { g.strokeStyle = 'rgba(90,70,50,.5)'; g.lineWidth = bmW(.05); const rows = 4; for (let j = 1; j <= rows; j++) { const y0 = Math.sin((j - 1) / rows * Math.PI / 2) * r, y1 = Math.sin(j / rows * Math.PI / 2) * r, w0 = Math.sqrt(Math.max(0, r * r - y0 * y0)), w1 = Math.sqrt(Math.max(0, r * r - y1 * y1)), n = 10 - j * 2;
      g.beginPath(); g.moveTo(-w1, -y1); g.lineTo(w1, -y1); for (let i = 0; i <= n; i++) { const xa = lerp(-w0, w0, i / n), xb = lerp(-w1, w1, (i + .5) / (n + 1)); g.moveTo(xa, -y0); g.lineTo(xb, -y1); if (i < n) { g.lineTo(lerp(-w0, w0, (i + 1) / n), -y0); } } g.stroke(); } }
    bmFill([[-r * .12, 0], [r * .12, 0], [r * .12, r * .32], [-r * .12, r * .32]], 'rgba(40,28,20,.55)');
  } else if (c.kind === 'tent') { const sag = Math.sin(t * .9 + c.seed) * .04 * r; for (const dx of [-1, -.3, .4, 1]) bmLine([[dx * r, 0], [dx * r, .62 * r]], .1, '#6d5a44');
    g.beginPath(); g.moveTo(-r * 1.12, -.62 * r); g.quadraticCurveTo(0, -.46 * r - sag, r * 1.12, -.62 * r); g.lineTo(r * .95, -.8 * r); g.quadraticCurveTo(0, -.64 * r - sag, -r * .95, -.8 * r); g.closePath(); g.fillStyle = c.col; g.fill();
    if (det) for (let i = 0; i < 5; i++) { const x0 = -r + i * r * .45; bmFill([[x0, .62 * r], [x0 + r * .2, .62 * r], [x0 + r * .18, .78 * r], [x0 - .02 * r, .78 * r]], c.col2); }
    bmFill([[-r * .8, 0], [r * .7, 0], [r * .75, .05 * r], [-r * .75, .05 * r]], '#8a3a2c');
  } else if (c.kind === 'yurt') { const w = r * .9, h = r * .55; bmFill([[-w, 0], [w, 0], [w, h], [-w, h]], bmLG(-w, 0, w, 0, ['#f4f1ea', '#c4c4c0'])); bmFill([[-w * 1.05, h], [w * 1.05, h], [0, h + r * .5]], bmLG(-w, 0, w, 0, ['#e8e6e0', '#a8a8a4'])); g.strokeStyle = 'rgba(80,80,80,.4)'; g.lineWidth = bmW(.05); g.beginPath(); for (const dx of [-.5, 0, .5]) { g.moveTo(dx * w, 0); g.lineTo(dx * w, -h); g.lineTo(0, -(h + r * .5)); } g.stroke(); bmFill([[-w * .15, 0], [w * .15, 0], [w * .15, h * .7], [-w * .15, h * .7]], c.col);
  } else if (c.kind === 'sail') { bmCrutch([-r, 0], [-r * .8, r * .9], .1); bmCrutch([r * .9, 0], [r * .7, r * .55], .09); bmCrutch([.1 * r, 0], [.2 * r, r * 1.15], .1); g.beginPath(); g.moveTo(-r * .8, -r * .9); g.quadraticCurveTo(-.2 * r, -r * .62 + Math.sin(t + c.seed) * .05 * r, r * .7, -r * .55); g.quadraticCurveTo(.3 * r, -r * .82, .2 * r, -r * 1.15); g.quadraticCurveTo(-.2 * r, -r * .95, -r * .8, -r * .9); g.fillStyle = c.col; g.fill();
  } else if (c.kind === 'chairs') { // a crooked tower of boardroom chairs
    let cy = 0, cx = 0; for (let i = 0; i < 8; i++) { const lean = Math.sin(i * 1.9 + c.seed) * .25 + Math.sin(t * .5 + c.seed) * .02 * i; g.save(); g.translate(cx, -cy); g.rotate(lean); const s2 = .9 - i * .04, wood = i % 2 ? '#a8743e' : '#8a5a2c';
      bmLine([[-.45 * s2, 0], [-.45 * s2, .55 * s2]], .07, wood); bmLine([[.45 * s2, 0], [.45 * s2, .55 * s2]], .07, wood); bmFill([[-.55 * s2, .55 * s2], [.55 * s2, .55 * s2], [.55 * s2, .65 * s2], [-.55 * s2, .65 * s2]], '#5c3a1c'); bmFill([[-.5 * s2, .65 * s2], [-.38 * s2, .65 * s2], [-.38 * s2, 1.4 * s2], [-.5 * s2, 1.4 * s2]], wood); bmFill([[-.55 * s2, 1.25 * s2], [.1 * s2, 1.25 * s2], [.1 * s2, 1.4 * s2], [-.55 * s2, 1.4 * s2]], wood);
      g.restore(); cx += Math.sin(lean) * .9; cy += 1.0 * s2; }
    bmCrutch([1.6, 0], [cx + .3, cy * .6], .08);
  } else if (c.kind === 'drip') { // a tall candle tower melting at the top, propped
    const h = r * 1.6, w = r * .22; bmFill([[-w, 0], [w, 0], [w * .9, h], [-w * .9, h]], bmLG(-w, 0, w, 0, ['#f6ecd2', '#d8c9a4', '#b4a07a']));
    for (let i = 0; i < 5; i++) { const dx = -w * .8 + i * w * .4, L = (.15 + .3 * rnd(c.seed, i)) * h * (.8 + .2 * Math.sin(t * .4 + i)); bmPath([[dx - w * .12, h], [dx + w * .12, h], [dx + w * .06, h - L], [dx, h - L - w * .15], [dx - w * .06, h - L]]); g.closePath(); g.fillStyle = '#efe2c2'; g.fill(); }
    bmOval(0, h + .25 * w, w * .9, w * .3, '#efe2c2'); bmLine([[0, h + .3 * w], [0, h + .7 * w]], .06, '#2a2420'); bmOval(Math.sin(t * 7) * .03, h + 1.0 * w, w * .16, w * .32, 'rgba(255,190,90,.85)');
    bmCrutch([w * 3.2, 0], [w * 1.0, h * .55], .1);
  } else if (c.kind === 'eye') { // a giant eye on a tripod; it follows the board as it drives by
    const ey = r * 1.25, er = r * .42; bmLine([[-er, 0], [0, ey - er * .6], [er, 0]], .14, '#5a4a3a'); bmLine([[0, 0], [0, ey - er]], .12, '#4a3a2c');
    bmDot(0, ey, er, bmLG(-er * .6, ey + er * .6, er * .6, ey - er * .6, ['#ffffff', '#e8e2d6', '#b8b0a2'])); const look = clamp((carX(t) - c.X) / 40, -1, 1) * er * .45; bmDot(look, ey - er * .05, er * .42, '#2f6fb5'); bmDot(look * 1.08, ey - er * .05, er * .2, '#0e0c10'); bmDot(look - er * .12, ey + er * .1, er * .07, 'rgba(255,255,255,.9)');
    g.strokeStyle = '#3a2a20'; g.lineWidth = bmW(.08); g.beginPath(); g.arc(0, -ey, er * 1.02, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
    // refrain 2 "restrict" (b4's request): the lid drops over the eye, then lifts once the line is over
    const rl = ease(t, wt(11, 'restrict') - .05, wt(11, 'restrict') + .15) * (1 - ease(t, L_(11).e, L_(11).e + .5)); if (rl > 0) { g.save(); g.beginPath(); g.arc(0, -ey, er * 1.02, 0, TAU); g.clip(); g.fillStyle = '#c9a07a'; g.fillRect(-er * 1.1, -ey - er * 1.1, er * 2.2, rl * er * 2.2); g.fillStyle = '#3a2a20'; g.fillRect(-er * 1.1, -ey - er * 1.1 + rl * er * 2.2 - bmW(.06), er * 2.2, bmW(.06)); g.restore(); }
  } else if (c.kind === 'speakers') { // a sound camp: a speaker wall under a striped awning; the cones pump
    const pump = 1 + .08 * Math.max(0, Math.sin(t * TAU * 2)); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const x0 = -r * .7 + i * r * .48, y0 = j * r * .42; bmFill([[x0, y0], [x0 + r * .45, y0], [x0 + r * .45, y0 + r * .4], [x0, y0 + r * .4]], '#1c1a1e'); bmDot(x0 + r * .225, y0 + r * .2, r * .14 * pump, '#3a3640'); bmDot(x0 + r * .225, y0 + r * .2, r * .05, '#5a5662'); }
    for (const dx of [-1, 1]) bmLine([[dx * r, 0], [dx * r, r * 1.1]], .08, '#6d5a44'); for (let i = 0; i < 6; i++) bmFill([[-r + i * r / 3, r * 1.1], [-r + (i + 1) * r / 3, r * 1.1], [-r + (i + 1) * r / 3, r * 1.25], [-r + i * r / 3, r * 1.25]], i % 2 ? c.col : '#f2ede0');
  } else if (c.kind === 'arch') { // a wooden lattice arch strung with lanterns and pennants
    for (const dx of [-1, 1]) bmFill([[dx * r - .2, 0], [dx * r + .2, 0], [dx * r + .2, r * .9], [dx * r - .2, r * .9]], '#8a5a2c'); g.strokeStyle = '#8a5a2c'; g.lineWidth = bmW(.35); g.beginPath(); g.ellipse(0, -r * .9, r, r * .55, 0, Math.PI, TAU); g.stroke();
    if (det) { g.strokeStyle = 'rgba(138,90,44,.7)'; g.lineWidth = bmW(.06); g.beginPath(); for (let i = 1; i < 8; i++) { const a = Math.PI + i / 8 * Math.PI; g.moveTo(Math.cos(a) * r * .75, -r * .9 + Math.sin(a) * r * .4); g.lineTo(Math.cos(a) * r, -r * .9 + Math.sin(a) * r * .55); } g.stroke(); }
    for (let i = 0; i < 7; i++) { const a = Math.PI + (i + .5) / 7 * Math.PI, lxx = Math.cos(a) * r * .85, ly = r * .9 - Math.sin(a) * r * .47 - .4; bmLine([[lxx, ly + .4], [lxx, ly + .1]], .03, '#3a3028'); bmOval(lxx, ly, .2, .28, i % 2 ? c.col : '#e8b23a'); }
  } else if (c.kind === 'flags') { for (let i = 0; i < 4; i++) { const fx = -r * .6 + i * r * .4, h = r * (1.1 + .25 * (i % 2)), wv = Math.sin(t * 2 + i + c.seed) * .15; bmLine([[fx, 0], [fx, h]], .08, '#4a3a2c'); g.beginPath(); g.moveTo(fx, -h); g.quadraticCurveTo(fx + .9 + wv, -h + .3, fx + .6 + wv, -h * .45); g.lineTo(fx, -h * .42); g.closePath(); g.fillStyle = ['#d8452f', '#e8b23a', '#2f6fb5', c.col][i]; g.fill(); }
  } else if (c.kind === 'umbrella') { bmCrutch([.6, 0], [0, r * .9], .08); bmParasol(0, r * .5, { para: [c.col, '#f2ede0'], seed: c.seed % 97 }, t, det);
  } else if (c.kind === 'parked') { for (let i = 0; i < 4; i++) { const bx = -r + i * r * .65; g.save(); g.translate(bx, 0); g.rotate(-.12); bmWheel(-.5, .34, .34, 0, false); bmWheel(.5, .34, .34, 0, false); bmLine([[-.5, .34], [0, .32], [.42, .75], [-.18, .85], [-.5, .34]], .05, ['#c43a2a', '#2f6fb5', '#e8b23a', '#3c8c5a'][(i + c.seed) % 4]); bmLine([[.42, .75], [.5, .34]], .05, '#2a2622'); g.restore(); }
    bmLine([[-r - .6, .7], [r * 1.2, .7]], .06, '#6d5a44');
  }
  if (c.kind === 'dome' || c.kind === 'yurt' || c.kind === 'tent') { const fx = r * .3, top = r * 1.55, wv = (u) => Math.sin(u * 5 - t * 4 + c.seed) * .15; bmLine([[fx, r * .7], [fx, top]], .06, '#5a4a3a');
    const pts = []; for (let i = 0; i <= 6; i++) { const u = i / 6; pts.push([fx + u * 1.6, top - u * .1 + wv(u)]); } for (let i = 6; i >= 0; i--) { const u = i / 6; pts.push([fx + u * 1.6, top - .7 + u * .2 + wv(u)]); } bmFill(pts, ['#d8452f', '#e8b23a', '#2f6fb5'][c.seed % 3]); }
  g.restore();
}
const BM_CAMP_H = { dome: 1.6, tent: .9, yurt: 1.2, sail: 1.2, chairs: 1.5, drip: 1.7, eye: 1.7, speakers: 1.3, arch: 1.5, flags: 1.4, umbrella: 1.3, parked: .3 };
// draft 4: the open playa holds art, not camps. Only the art pieces of draft 3's row stay where they were (the chair
// tower, the melting candle, the eye on its tripod, the lantern arch); the domes, tents, sails, flags, sound camps and
// parked props now live in Black Rock City (brcGround / brcAir below).
const BM_PLAYA_ART = { chairs: 1, drip: 1, eye: 1, arch: 1 };
function bmCampsInto(t, list) {
  BM_CAMPS.forEach((c, ci) => { if (!BM_PLAYA_ART[c.kind]) return; const p = P(c.X, 0, c.Z); if (p[2] < 2) return; const k = kAt(p); if (p[0] < -c.r * k * 2 - 400 || p[0] > W + c.r * k * 2 + 400) return;
    ACT.note('playa:art:' + ci, c.X, c.Z, BM_ART_R[c.kind] * c.r, { h: c.r * (BM_CAMP_H[c.kind] || 1), group: 'install' });
    list.push({ z: p[2], draw: () => bmCamp(c, t, p), shadow: () => shadowOf([[c.X - c.r, 0, c.Z], [c.X + c.r, 0, c.Z], [c.X, c.r * (BM_CAMP_H[c.kind] || 1), c.Z]], t) }); });
}
const BM_ART_R = { chairs: .3, drip: .25, eye: .45, arch: 1 }; // footprint radius as a share of c.r, for the actor registry

// ---------- installations the car passes, each tied to a line ----------
// "patent": a giant light bulb on crutches switches on; "time": a soft hourglass runs upward;
// "unfair": a seesaw, a chip tower on one end and an empty bowl on the other, slams down; a soft ballot box at dawn.
function bmInstall(kind, t, cue, X, Z, list) {
  const p = P(X, 0, Z); if (p[2] < 2 || p[0] < -900 || p[0] > W + 900) return;
  // the hourglass slumps flat into the playa (a Dali melt, seen happening, as Robin asked of the speakerphone): it keeps
  // its footprint and loses its height, so it is noted at full scale with its height going down
  ACT.note('playa:inst:' + kind, X, Z, BM_INST_R[kind], { h: { bulb: 5.6, hourglass: 5.4, seesaw: 2.5, ballot: 4.3 }[kind] * (kind === 'hourglass' ? 1 - .88 * ease(t, 128.6, 130.2) : 1), group: 'install' });
  list.push({ z: p[2], draw: () => { const k = kAt(p); bmBegin(p[0], p[1], k, 1); const det = k > 5;
    if (kind === 'bulb') { const on = ease(t, cue - .1, cue + .25) * (1 - ease(t, cue + 4, cue + 6)) * (.85 + .15 * Math.sin(t * 9)), cy = 4.1, r = 1.5;
      bmCrutch([-2.2, 0], [-1.0, 3.0], .09); bmCrutch([2.1, 0], [1.0, 3.1], .09);
      bmFill([[-.6, 1.6], [.6, 1.6], [.7, 2.7], [-.7, 2.7]], bmLG(-.7, 0, .7, 0, ['#d8d0c0', '#8a8478'])); for (let i = 0; i < 4; i++) bmLine([[-.68, 1.75 + i * .25], [.68, 1.85 + i * .25]], .06, '#6a6458');
      if (on > 0) { const gl = g.createRadialGradient(0, -cy, 0, 0, -cy, r * 3.2); gl.addColorStop(0, `rgba(255,220,140,${.38 * on})`); gl.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gl; g.fillRect(-r * 3.2, -cy - r * 3.2, r * 6.4, r * 6.4); }
      bmPath([[-.7, 2.7], [-1.2, 3.2]]); g.beginPath(); g.moveTo(-.7, -2.7); g.quadraticCurveTo(-1.0, -3.2, -r, -cy); g.arc(0, -cy, r, Math.PI, TAU); g.quadraticCurveTo(1.0, -3.2, .7, -2.7); g.closePath(); g.fillStyle = on > 0 ? `rgba(255,${226 - 20 * (1 - on)},${150 + 60 * (1 - on)},${.55 + .3 * on})` : 'rgba(214,226,232,.55)'; g.fill(); g.strokeStyle = 'rgba(120,130,140,.6)'; g.lineWidth = bmW(.05); g.stroke();
      bmLine([[-.3, 2.8], [-.25, 3.8], [-.1, 4.2], [.1, 3.9], [.25, 4.2], [.3, 3.8], [.3, 2.8]], .05, on > 0 ? '#fff0b0' : '#6a5a40'); if (det) bmLine([[-.9, 4.8], [-.5, 5.3]], .12, 'rgba(255,255,255,.6)');
      const seal = ease(t, cue, cue + .4); if (seal > 0) { g.save(); g.translate(.75, -1.95); g.scale(seal, seal); rosette(0, 0, .28); g.restore(); }
    } else if (kind === 'hourglass') { const run = ease(t, cue - .1, cue + .4), m = .25 + .2 * Math.sin(t * .5), h = 5.4, w = 1.5, melt = .88 * ease(t, 128.6, 130.2); if (melt > 0) g.scale(1 + .5 * melt, 1 - melt); // Dali: once its line is sung the hourglass slumps into the ground
      bmFill([[-w - .2, 0], [w + .2, 0], [w + .2, .35], [-w - .2, .35]], '#6a4426'); bmFill([[-w - .3, h], [w + .1, h - .1 - m * .4], [w + .1, h + .25 - m * .4], [-w - .3, h + .3]], '#6a4426');
      for (const dx of [-w, w]) bmLine([[dx, .35], [dx + (dx > 0 ? -m * .2 : 0), h]], .12, '#8a5a2c');
      g.beginPath(); g.moveTo(-w * .9, -.35); g.quadraticCurveTo(-w * .2, -h * .45, -.12, -h * .5); g.quadraticCurveTo(-w * .2, -h * .55, -w * .9 + m * .2, -(h - .05)); g.lineTo(w * .85 - m * .3, -(h - .1 - m * .4)); g.quadraticCurveTo(w * .2, -h * .55, .12, -h * .5); g.quadraticCurveTo(w * .2, -h * .45, w * .9, -.35); g.closePath(); g.fillStyle = 'rgba(214,226,232,.5)'; g.fill(); g.strokeStyle = 'rgba(120,130,140,.6)'; g.lineWidth = bmW(.05); g.stroke();
      const lo = 1 - run * clamp((t - cue) / 8) * .7, hi = 1 - lo; bmFill([[-w * .8 * lo, .4], [w * .8 * lo, .4], [0, .4 + 1.6 * lo]], '#d9b25a'); bmFill([[-w * .75, h - .2], [w * .75 - m * .3, h - .25 - m * .3], [0, h - .2 - 1.8 * hi]], '#d9b25a');
      if (run > 0) for (let i = 0; i < 9; i++) { const u = ((t * 1.3 + i / 9) % 1); bmDot(Math.sin(i * 3.1) * .04, lerp(h * .48, h - .4, u), .05, '#d9b25a'); }
      bmCrutch([w + 1.4, 0], [w * .6, h * .78], .08);
    } else if (kind === 'seesaw') { const slam = easeOutBack(clamp((t - cue + .05) / .35), 2), wob = Math.sin(t * 3) * .03 * (1 - slam), a = -.05 + wob - slam * .3, L = 4.2;
      bmFill([[-.8, 0], [.8, 0], [0, 1.4]], bmLG(-.8, 0, .8, 0, ['#a5713f', '#56381c']));
      g.save(); g.translate(0, -1.4); g.rotate(-a); bmFill([[-L, -.05], [L, -.05], [L, .18], [-L, .18]], '#8c6338');
      const cols = ['#c7362b', '#f2ede0', '#2f6fb5', '#1c1a1e']; for (let c = 0; c < 3; c++) for (let j = 0; j < 6 + c * 2; j++) { const cx = -L + .5 + c * .7, cy = .18 + j * .2; bmFill([[cx - .32, cy], [cx + .32, cy], [cx + .32, cy + .18], [cx - .32, cy + .18]], bmShade(cols[c], .8)); bmOval(cx, cy + .18, .32, .06, cols[c]); }
      const fly = ease(t, cue + .05, cue + .7), bx = L - .6, by = .25 + fly * 2.6; g.save(); g.translate(bx, -by); g.rotate(fly * 3.2); g.beginPath(); g.ellipse(0, 0, .42, .17, 0, 0, Math.PI); g.closePath(); g.fillStyle = '#8a5a2c'; g.fill(); g.beginPath(); g.ellipse(0, 0, .42, .08, 0, 0, TAU); g.fillStyle = '#4a2c14'; g.fill(); g.restore();
      g.restore();
    } else if (kind === 'ballot') { const sag = .5 + .2 * Math.sin(t * .6); bmCrutch([-2.4, 0], [-1.2, 2.6], .08); bmCrutch([2.2, 0], [1.3, 2.2], .08);
      bmPath([[-1.6, 1.2], [1.6, 1.2], [1.7, 3.3 - sag * .3], [1.2, 3.5], [-1.4, 3.6], [-1.7, 3.3]]); g.closePath(); g.fillStyle = bmLG(-1.6, 0, 1.6, 0, ['#f7f0de', '#c9bfa8']); g.fill();
      bmPath([[-1.6, 1.25], [1.6, 1.25], [1.5, .3 - sag * .2], [.6, 1.0 - sag], [-.4, .5 - sag * .4], [-1.5, .9]]); g.closePath(); g.fillStyle = '#e4dbc4'; g.fill();
      bmFill([[-.8, 3.4], [.8, 3.4], [.8, 3.52], [-.8, 3.52]], '#1a1a1a'); bmFill([[-.35, 3.5], [.35, 3.5], [.35, 4.3], [-.35, 4.3]], '#fbf7ec'); bmLine([[-.25, 3.8], [.2, 4.05]], .05, '#c7362b');
    }
    g.restore(); }, shadow: () => kind === 'seesaw' ? shadowOf([[X - 4.2, 0, Z], [X + 4.2, 0, Z], [X - 4.2, 2.2, Z], [X + 4.2, 1.6, Z]], t) : shadowStick(X, 0, 5.5, Z, 3, t) });
}
const BM_INST_R = { bulb: 2.2, hourglass: 1.7, seesaw: 4.2, ballot: 2.4 };
function bmInstallPlaces() { const pat = wt(8, 'patent'), tim = wt(15, 'time'); return [['ballot', carX(9) + 13, 17, 0], ['bulb', carX(pat) - 7, 21, pat], ['hourglass', carX(tim) + 9, 15, tim]]; }
function bmInstallsInto(t, list) {
  const [b, u, h] = bmInstallPlaces();
  bmInstall('ballot', t, b[3], b[1], b[2], list);
  bmInstall('bulb', t, u[3], u[1], u[2], list);
  bmInstall('hourglass', t, h[3], h[1], h[2], list); // it melts into a low puddle by 130.2 (draft 9) and stays there (draft 11: it no longer vanishes), clear of the bridge's seesaw
  // draft 9: the seesaw on "unfair" is table.js's now; the playa one is gone so the two don't duplicate
}

// ---------- Black Rock City (draft 4): the real city plan round the Man ----------
// The Man is the centre of a circle. The city is a 240 degree arc of camps from 2:00 to 10:00, open toward 12:00, where
// the Temple stands on the open playa 760 m out. Radial streets every half hour, named by the clock; concentric
// streets: the Esplanade (760 m, the camps along it face the open playa), then A, B, C ... out to about 1.7 km. Center
// Camp, a big round shade structure, sits on the Esplanade at 6:00, with the keyhole and Gate Road out at 6:00. Plazas
// at 3:00, 4:30, 7:30 and 9:00 on G street. Four promenades lined with lampposts run from the Man to the Temple (12:00),
// to Center Camp (6:00) and toward 3:00 and 9:00. The trash fence is a pentagon round everything; the airport is
// outside it near 5:00.
// Clock angle a in hours: direction from the Man = (sin(a TAU/12), -cos(a TAU/12)) in (x, z), so 12:00 = -z (the side
// the car drives on), 3:00 = +x, 6:00 = +z (behind the Man in most shots), 9:00 = -x.
// Two levels of drawing: from the ground the city is a band of tiny camps on the horizon (brcGround); from the air
// (camera above about 80 m) it is a map (brcAir). Camp lights come on at dusk and are drawn after the grade
// (brcEmissive), hidden wherever something nearer was drawn over the city (a per-frame pixel mask, brcMaskA/B).
const brcDir = (a) => [Math.sin(a * TAU / 12), -Math.cos(a * TAU / 12)];
const brcAt = (a, r) => { const d = brcDir(a); return [MAN.x + d[0] * r, MAN.z + d[1] * r]; };
const brcClock = (X, Z) => { const a = Math.atan2(X - MAN.x, -(Z - MAN.z)) / TAU * 12; return a < 0 ? a + 12 : a; };
const BRC = {
  ESP: 760, RINGS: [760, 890, 965, 1040, 1115, 1190, 1265, 1340, 1415, 1490, 1565, 1640], EDGE: 1715, ST: 12, // Esplanade, A..K, the outer edge; streets 12 m wide
  CC: { a: 6, r: 900, R: 45, rod: 140 },                       // Center Camp: the shade structure (R) inside Rod's Road (rod)
  PLAZAS: [3, 4.5, 7.5, 9].map((a) => ({ a, r: 1340, R: 55 })), // on G street
  KEY: { a: 6, r: 1690, R: 70 },                                 // the keyhole where Gate Road comes in
  TEMPLE: { a: 12, r: 760 }, FENCE: 2420, AIRPORT: { a: 5, r: 2520, L: 1100 },
};
const TEMPLE_XZ = brcAt(BRC.TEMPLE.a, BRC.TEMPLE.r);
// camp fabric and paint: silver shade cloth, white, canvas, then a few strong colours, black, RV white, raw wood
const BRC_COLS = ['#d3d6d6', '#efe9dc', '#cdb88e', '#b8452f', '#d27a3c', '#43699a', '#6e4a86', '#55805a', '#dcb24c', '#34302f', '#e8e4da', '#8f6d48'];
const BRC_LCOL = [[255, 206, 140], [255, 160, 72], [255, 122, 196], [122, 214, 255], [150, 255, 172], [192, 142, 255], [255, 98, 72]]; // light colours: warm white most
const K_SHADE = 0, K_DOME = 1, K_HEXA = 2, K_TENT = 3, K_RV = 4, K_FLAG = 5, K_TOWER = 6, K_STAGE = 7, K_ART = 8, K_YURT = 9, K_TRUCK = 10, K_CC = 11;
const BRC_ITEMS = [], BRC_BLOCKS = [];
(() => {
  const R = mulberry(1986), ST = BRC.ST, rings = BRC.RINGS.concat([BRC.EDGE]);
  const ccC = brcAt(6, BRC.CC.r), keyC = brcAt(6, BRC.KEY.r), plz = BRC.PLAZAS.map((p) => brcAt(p.a, p.r));
  const pick = (ws) => { let s = 0; for (const w of ws) s += w; let x = R() * s; for (let i = 0; i < ws.length; i++) { x -= ws[i]; if (x <= 0) return i; } return ws.length - 1; };
  const FAB = [5, 4, 3, 1.1, 1, 1, .7, .6, .8, .45, 0, 0], BRIGHT = [1, 1, 1, 2, 2, 2, 1.5, 1.4, 1.6, .5, 0, 0], LW = [55, 20, 6, 6, 5, 4, 4];
  const frame = (a, r) => { const th = a * TAU / 12, c = Math.cos(th), s = Math.sin(th); return { cx: MAN.x + s * r, cz: MAN.z - c * r, tx: c, tz: s, rx: s, rz: -c }; }; // t = along the clock, r = outward
  const blocked = (X, Z, pad) => {
    if (Math.hypot(X - ccC[0], Z - ccC[1]) < BRC.CC.rod + 7 + pad) return true;
    if (Math.hypot(X - keyC[0], Z - keyC[1]) < BRC.KEY.R + pad) return true;
    for (const p of plz) if (Math.hypot(X - p[0], Z - p[1]) < 55 + pad) return true;
    const r = Math.hypot(X - MAN.x, Z - MAN.z), a = brcClock(X, Z);
    return r > BRC.CC.r && Math.abs(a - 6) * TAU / 12 * r < 13 + pad; // the wide 6:00 road from Center Camp out to the keyhole
  };
  const add = (b, X, Z, k, w, d, h, c, lc, L, v) => { const dx = X - b.cx, dz = Z - b.cz;
    const it = { X, Z, r: Math.hypot(X - MAN.x, Z - MAN.z), ring: b.ring, k, w, d, h, c, lc, L: L || [], u: dx * b.tx + dz * b.tz, v: dx * b.rx + dz * b.rz, tall: h >= 12, on: R(), al: R() < .6, ph: R() * TAU, vr: v == null ? [0, 0, 0, 3, 3, 3, 4, 4, 1, 2][Math.floor(R() * 10)] : v };
    b.items.push(it); BRC_ITEMS.push(it); return it; };
  // one camp on a lot: w along the street, dd deep, centred at clock a, radius r
  const camp = (b, a, r, w, dd, zone) => {
    const f = frame(a, r), lc = pick(LW), hw = w / 2, hd = dd / 2;
    const put = (lu, lv, k, ww, d, h, c, L, v) => { const X = f.cx + f.tx * lu + f.rx * lv, Z = f.cz + f.tz * lu + f.rz * lv; if (blocked(X, Z, Math.max(ww, d) * .5)) return null; return add(b, X, Z, k, ww, d, h, c, lc, L, v); };
    const shade = (lu, lv, sw, sd, h) => put(lu, lv, K_SHADE, sw, sd, h, pick(FAB), [[-sw * .42, h], [0, h + .1], [sw * .42, h]]);
    const flag = (lu, lv) => { const h = 6 + R() * 5; put(lu, lv, K_FLAG, .6, .6, h, 3 + Math.floor(R() * 6), R() < .3 ? [[0, h]] : null); };
    const rv = (lu, lv) => { const along = R() < .7; put(lu, lv, K_RV, along ? 9 : 3, along ? 3 : 9, 3.3, 10, [[along ? 1.8 : 0, 2.1]]); };
    const tent = (lu, lv) => { const tw = 2.4 + R() * 2; put(lu, lv, K_TENT, tw, tw, 1.3 + R() * .9, pick(BRIGHT), R() < .35 ? [[0, .7]] : null); };
    const hexa = (lu, lv) => put(lu, lv, K_HEXA, 4.6, 4.6, 3.6, R() < .7 ? 1 : 0, [[0, 1.4]]);
    const dome = (lu, lv, rr) => put(lu, lv, K_DOME, rr * 2, rr * 2, rr, R() < .7 ? pick([4, 4, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0]) : pick(BRIGHT), [[0, rr * .45], [rr * .4, rr * .3]]);
    const ends = a < 3.5 || a > 8.5;
    const W_ = zone === 'esp' ? [4, 0, 0, 2, 0, ends ? 1.6 : .25, 1.3, .4] : zone === 'in' ? [2.2, 3, 2, 1.2, 1.4, .08, .25, 0] : [.9, 4, 2.6, .5, 2, .02, .08, 0];
    const type = ['theme', 'rv', 'tents', 'dome', 'hexa', 'sound', 'art', 'rvb'][pick(W_)];
    const front = -hd + 2, back = hd - 2;
    if (type === 'theme') { const sw = Math.min(w - 4, 12 + R() * 14), sd = Math.min(dd - 6, 8 + R() * 9); shade((R() - .5) * (w - sw - 2), front + sd / 2, sw, sd, 3.6 + R());
      if (R() < .7) dome((R() - .5) * w * .5, back - 6, 3.5 + R() * 4); for (let i = 0, n = 1 + Math.floor(R() * 3); i < n; i++) flag(-hw + 1 + R() * (w - 2), front + R() * 3);
      if (R() < .5) for (let i = 0, n = 1 + Math.floor(R() * 2); i < n; i++) hexa(-hw + 3 + R() * (w - 6), back - 3); else if (R() < .6) rv(-hw + 5 + R() * (w - 10), back - 2);
    } else if (type === 'rv' || type === 'rvb') { for (let i = 0, n = 1 + Math.floor(R() * 3); i < n; i++) rv(-hw + 5 + i * 10 + R() * 2, back - 2 - R() * 3);
      if (R() < .8) shade((R() - .5) * 4, front + 5, Math.min(w - 4, 7 + R() * 6), 7, 3.1); for (let i = 0, n = Math.floor(R() * 3); i < n; i++) tent(-hw + 2 + R() * (w - 4), front + 8 + R() * 6); if (R() < .3) flag(-hw + 1, front + 1);
      if (R() < .25) put(hw - 5, back - 8, K_TRUCK, 8, 2.6, 3.8, R() < .5 ? 10 : 0);
    } else if (type === 'tents') { for (let i = 0, n = 3 + Math.floor(R() * 5); i < n; i++) tent(-hw + 2 + R() * (w - 4), -hd + 3 + R() * (dd - 6)); if (R() < .5) shade(0, front + 4, Math.min(w - 4, 6 + R() * 4), 6, 2.8); if (R() < .2) flag(0, front + 1);
    } else if (type === 'dome') { dome((R() - .5) * w * .3, (R() - .5) * dd * .2, 4 + R() * 4.5); for (let i = 0, n = 1 + Math.floor(R() * 3); i < n; i++) tent(-hw + 2 + R() * (w - 4), back - 2); if (R() < .5) flag(-hw + 2, front + 1); if (R() < .4) shade(hw - 5, front + 4, 7, 6, 3);
    } else if (type === 'hexa') { const n = 3 + Math.floor(R() * 4); for (let i = 0; i < n; i++) hexa(-hw + 3 + (i % 3) * 5.4 + R(), back - 3 - Math.floor(i / 3) * 6); if (R() < .6) shade(0, front + 4, Math.min(w - 4, 8), 6, 3);
    } else if (type === 'sound') { // a sound camp: a truss tower or two, a stage, its shade
      const sw = Math.min(w - 4, 12 + R() * 6); put(0, (front + back) / 2, K_STAGE, sw, 8, 6 + R() * 2.5, R() < .5 ? 9 : 11, [[-sw * .4, 5.5], [0, 7], [sw * .4, 5.5], [0, 3]]);
      for (const s of R() < .6 ? [-1, 1] : [1]) { const h = 10 + R() * 6; put(s * (sw / 2 + 2), (front + back) / 2, K_TOWER, 3, 3, h, 9, [[0, h], [0, h * .7], [0, h * .45]]); }
      shade(0, front + 4, Math.min(w - 4, 14), 7, 3.6); flag(-hw + 1, front + 1); flag(hw - 1, front + 1);
    } else { const h = 12 + R() * 13, aw = 7 + R() * 7; put(0, 0, K_ART, aw, aw, h, pick([0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 3]) === 0 ? 11 : pick([1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1]), [[-aw * .3, h * .5], [0, h], [aw * .3, h * .5], [0, h * .75]]); if (R() < .6) flag(-hw + 2, front + 1); }
  };
  // the blocks between streets, filled with lots
  for (let i = 0; i < rings.length - 1; i++) {
    const r0 = rings[i] + ST / 2, r1 = rings[i + 1] - (i + 2 < rings.length ? ST / 2 : 0), rm = (r0 + r1) / 2;
    for (let s = 0; s < 16; s++) {
      const am = 2.25 + s * .5, ga0 = (ST / 2) / r0 * 12 / TAU, ga1 = (ST / 2) / r1 * 12 / TAU, f = frame(am, rm);
      const b = Object.assign({ ring: i, items: [], r0, r1, a0: am - .25, a1: am + .25 }, f), poly = [];
      for (let j = 0; j <= 6; j++) { const a = am - .25 + ga0 + (.5 - 2 * ga0) * j / 6; poly.push(brcAt(a, r0)); }
      for (let j = 6; j >= 0; j--) { const a = am - .25 + ga1 + (.5 - 2 * ga1) * j / 6; poly.push(brcAt(a, r1)); }
      b.poly = poly; BRC_BLOCKS.push(b);
      const rows = i === 0 ? [[0, .36, 'esp'], [.36, .68, 'in'], [.68, 1, 'in']] : [[0, .5, i < 5 ? 'in' : 'out'], [.5, 1, i < 5 ? 'in' : 'out']];
      for (const [u0, u1, zone] of rows) {
        const ra = r0 + (r1 - r0) * u0 + 1.5, rb = r0 + (r1 - r0) * u1 - 1.5, rr = (ra + rb) / 2, gl = ga0 + 1 / rr * 12 / TAU, L = (.5 - 2 * gl) * TAU / 12 * rr;
        let s0 = 0; while (s0 < L - 8) { const w = Math.min(L - s0, (zone === 'esp' ? 22 : 14) + R() * (zone === 'esp' ? 30 : 26)); const a = am - .25 + gl + (s0 + w / 2) / rr * 12 / TAU; camp(b, a, rr, w - 2, rb - ra, zone); s0 += w; }
      }
    }
  }
  // Center Camp: the big round shade structure, a ring of camps inside Rod's Road, its opening toward the Man and the keyhole
  { const f = frame(6, BRC.CC.r), b = Object.assign({ ring: 1, items: [], poly: null }, f), lc = 0; BRC_BLOCKS.push(b);
    add(b, ccC[0], ccC[1], K_CC, BRC.CC.R * 2, BRC.CC.R * 2, 14, 1, 0, [[-40, 3.3], [-26, 3.3], [-12, 3.3], [12, 3.3], [26, 3.3], [40, 3.3], [0, 14.5]], 0);
    for (let j = 0; j < 30; j++) { const ang = (j + .5) / 30 * TAU, cs = Math.cos(ang), sn = Math.sin(ang); if (Math.abs(sn) > .93) continue; // keep the axis toward the Man and out to the keyhole open
      const rr = 100 + R() * 12, X = ccC[0] + (f.tx * cs + f.rx * sn) * rr, Z = ccC[1] + (f.tz * cs + f.rz * sn) * rr, kk = R();
      if (kk < .45) add(b, X, Z, K_SHADE, 8 + R() * 8, 7, 3.4, pick(FAB), pick(LW), [[-4, 3.4], [4, 3.4]]); else if (kk < .7) add(b, X, Z, K_DOME, 8 + R() * 6, 8 + R() * 6, 5, pick(FAB), pick(LW), [[0, 2]]);
      else if (kk < .85) add(b, X, Z, K_FLAG, .6, .6, 8 + R() * 3, 3 + Math.floor(R() * 6), pick(LW), [[0, 9]]); else add(b, X, Z, K_HEXA, 4.6, 4.6, 3.6, 1, pick(LW), [[0, 1.4]]); } }
  // the plazas: an open circle with an art piece in the middle
  BRC.PLAZAS.forEach((pz, j) => { const f = frame(pz.a, pz.r), b = Object.assign({ ring: 7, items: [], poly: null }, f); BRC_BLOCKS.push(b); const h = 13 + R() * 6; add(b, f.cx, f.cz, K_ART, 9, 9, h, 11, 1 + j, [[-3, h * .5], [0, h], [3, h * .5]], j % 5); });
  BRC_ITEMS.sort((a, b) => b.r - a.r); // far to near from the Man: also far to near from any camera on the open playa
})();
// fence, Gate Road, airport (world points)
const BRC_FENCE = [0, 1, 2, 3, 4, 5].map((i) => brcAt(12 + i * 2.4, BRC.FENCE));
const BRC_GATE = [brcAt(6, BRC.KEY.r + BRC.KEY.R - 10), brcAt(6, 2600), brcAt(6.08, 3400), brcAt(6.25, 5200)];

// ---------- the promenade spires (render.js draws LAMPS through lamp()) ----------
// Real infrastructure: tall wooden spires on both sides of each promenade, every 20 m from 60 m out from the Man. Along
// the processional (the 6:00 promenade from Center Camp to the Man, and the 12:00 one on out to the Temple) each spire
// carries four lanterns on a cross of arms; on the 3:00 and 9:00 promenades two. By day the hooks are empty: the
// Lamplighters carry the lanterns out at dusk and hang them by hand, at a walk, from Center Camp toward the Man and on
// out toward the Temple, so it is dark ahead of them and lit behind. burn.js (b6) times that: lampLitT(X, Z) is when
// the spire at (X, Z) gets lit. Without it the draft-7 timing stays (lampTime). lampLit(l, t) is 0..1.
const LAMP_T0 = 198, LAMP_D0 = 60, LAMP_V = 52, LAMP_H = 4.8, LAMP_ARM = 4.45, LAMP_TIP = 5.5, LAMP_REACH = .92;
const PROMS = [{ a: 12, r1: 722 }, { a: 6, r1: 846 }, { a: 3, r1: BRC.ESP }, { a: 9, r1: BRC.ESP }];
const LAMPS = [];
PROMS.forEach((pr) => { const d = brcDir(pr.a), n = [-d[1], d[0]];
  for (let r = LAMP_D0; r <= pr.r1; r += 20) for (const s of [-1, 1]) LAMPS.push({ X: MAN.x + d[0] * r + n[0] * 6 * s, Z: MAN.z + d[1] * r + n[1] * 6 * s, d: r, a: pr.a, side: s, ax: -n[0] * s, az: -n[1] * s, ux: d[0], uz: d[1], four: pr.a === 12 || pr.a === 6, lt: LAMP_T0 + (r - LAMP_D0) / LAMP_V + (s > 0 ? .2 : 0), i: LAMPS.length }); });
const lampTime = (l) => l.lt;
function lampLitAt(l) { // when this spire is lit: the Lamplighters' time from burn.js when it exists (cached, it depends on the spot only)
  if (l.ltt === undefined) { const v = typeof lampLitT === 'function' ? lampLitT(l.X, l.Z) : NaN; l.ltt = typeof v === 'number' && !Number.isNaN(v) ? v : null; }
  return l.ltt == null ? l.lt : l.ltt; }
function lampLit(l, t) { return smooth((t - lampLitAt(l)) / .5); }
function lampArms(l) { // the hook directions: in toward the promenade (where burn.js's pole reaches), out, and along it on the processional
  return l.four ? [[l.ax, l.az], [-l.ax, -l.az], [l.ux, l.uz], [-l.ux, -l.uz]] : [[l.ax, l.az], [-l.ax, -l.az]]; }
function lantern(q, k, lit, emissive, t, i) { // a box lantern hanging below the hook point q
  const s = Math.max(k, 6) * 1.35, x = q[0], y = q[1], fl = .88 + .12 * n1(970 + i, t * 3.1);
  if (!emissive) { g.strokeStyle = '#2a2420'; g.lineWidth = Math.max(1, .02 * k); g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + .06 * k); g.stroke();
    g.fillStyle = '#2e2622'; g.beginPath(); g.moveTo(x - .14 * s, y + .12 * s); g.lineTo(x, y + .05 * s); g.lineTo(x + .14 * s, y + .12 * s); g.closePath(); g.fill(); // cap
    g.fillStyle = lit > 0 ? '#f2cf86' : '#b9b2a4'; g.fillRect(x - .1 * s, y + .12 * s, .2 * s, .26 * s); // glass
    g.fillStyle = '#2e2622'; g.fillRect(x - .12 * s, y + .37 * s, .24 * s, .05 * s); if (k > 25) { g.fillRect(x - .1 * s, y + .12 * s, .02 * s, .26 * s); g.fillRect(x + .08 * s, y + .12 * s, .02 * s, .26 * s); }
    return; }
  const a = lit * fl, R = Math.min(Math.max(1.4 * k, 5), 120), cy = y + .25 * s;
  const rg = g.createRadialGradient(x, cy, 0, x, cy, R); rg.addColorStop(0, `rgba(255,206,128,${.55 * a})`); rg.addColorStop(.35, `rgba(255,170,80,${.2 * a})`); rg.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = rg; g.fillRect(x - R, cy - R, 2 * R, 2 * R);
  g.fillStyle = `rgba(255,226,160,${.8 * a})`; g.fillRect(x - .08 * s, y + .14 * s, .16 * s, .22 * s);
}
function lamp(l, t, emissive) {
  if (emissive && l.i === 0) brcEmissive(t); // the city's lights ride on the first lamp's call, after the grade
  if (Math.hypot(l.X - C.x, l.Z - C.z) < 3) return; // a spire right under the drone would draw as a line across the frame
  const p = P(l.X, 0, l.Z); if (p[2] < 2 || (p[2] < 6 && t > 236) || p[0] < -300 || p[0] > W + 300) return;
  const k = kAt(p), t0 = lampLitAt(l), lit = smooth((t - t0) / .5); if (k < .3 && !lit) return;
  const arms = lampArms(l), hookAt = (j) => P(l.X + arms[j][0] * LAMP_REACH, LAMP_ARM, l.Z + arms[j][1] * LAMP_REACH), litJ = (j) => smooth((t - t0 - j * .3) / .5); // hung one after another
  if (emissive) { const night = .35 + .65 * nightAmt(t);
    if (k < 3) { const h = P(l.X, LAMP_ARM, l.Z); if (lit > 0 && h[2] > 1) lantern(h, kAt(h) * 1.2, lit * night, true, t, l.i); return; } // far off: one glow for the spire
    for (let j = 0; j < arms.length; j++) { const lj = litJ(j), h = hookAt(j); if (lj > 0 && h[2] > 1) lantern(h, kAt(h), lj * night, true, t, l.i * 4 + j); } return; }
  const top = P(l.X, LAMP_H, l.Z), tip = P(l.X, LAMP_TIP, l.Z), wood = '#5b4632', w = .16 * k;
  seg(p, top, w, wood); seg(top, tip, w * .55, wood); if (k > 8) { g.globalAlpha = .35; seg(P(l.X - .03 * l.az, 0, l.Z + .03 * l.ax), P(l.X - .03 * l.az, LAMP_H, l.Z + .03 * l.ax), w * .3, '#8a6c4a'); g.globalAlpha = 1; } // lit edge of the post
  if (k > 3) { const fin = P(l.X, LAMP_TIP + .3, l.Z); seg(tip, fin, w * .25, '#3a2c20'); }
  const c0 = P(l.X, LAMP_ARM + .02, l.Z);
  for (let j = 0; j < arms.length; j++) { const [ax, az] = arms[j], e = P(l.X + ax * (LAMP_REACH + .1), LAMP_ARM + .1, l.Z + az * (LAMP_REACH + .1)); seg(c0, e, .11 * k, wood); // the cross of arms, tips turned up a little
    if (k > 5) seg(P(l.X, LAMP_ARM - .55, l.Z), P(l.X + ax * .5, LAMP_ARM, l.Z + az * .5), .06 * k, wood); // a brace under each
    const h = hookAt(j); if (k > 4) seg(P(l.X + ax * LAMP_REACH, LAMP_ARM + .06, l.Z + az * LAMP_REACH), h, .02 * k, '#2a2420');
    const lj = litJ(j); if (lj > 0 && h[2] > 1) { g.globalAlpha = clamp(lj * 3); lantern([h[0], h[1]], kAt(h), lj, false, t, l.i * 4 + j); g.globalAlpha = 1; } }
}

// ---------- the city: per-frame state, colours ----------
const BRC_F = { t: NaN, pts: [], air: [], box: null, A: null };
const brcLightAmt = (t) => ease(t, 197.5, 213); // how much of the city has switched its lights on
const BRC_LC = mkCanvas(), brcLg = BRC_LC.getContext('2d'), BRC_MC = mkCanvas(), brcMg = BRC_MC.getContext('2d');
const BRC_GLOW = BRC_LCOL.map((c) => { const cv = mkCanvas(32, 32), b = cv.getContext('2d'), rg = b.createRadialGradient(16, 16, 0, 16, 16, 16);
  rg.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},1)`); rg.addColorStop(.2, `rgba(${c[0]},${c[1]},${c[2]},.7)`); rg.addColorStop(.5, `rgba(${c[0]},${c[1]},${c[2]},.14)`); rg.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
  b.fillStyle = rg; b.fillRect(0, 0, 32, 32); return cv; });
const BRC_HZ = BRC.RINGS.map((r, i) => .2 + i * .028).concat([.53]); // haze by ring: far camps sink into the sky colour
const BRC_RGB = BRC_COLS.map(hex);
const brcAirPlaya = () => mix(PAL.groundFar, PAL.groundNear, .22);
const brcAirAmt = () => smooth((C.y - 70) / 80);      // the map fades in from 70 m up
const brcGroundAmt = () => 1 - smooth((C.y - 110) / 90); // the skyline band fades out by 200 m

// ---------- from the ground: the skyline band ----------
function brcBill(it, x, y, k, c1, c2, dk) { // one camp structure seen from the open playa, base centre (x, y), k px per metre
  const w = Math.max(it.w * k, 1), h = it.h * k, pw = Math.max(1, .14 * k);
  switch (it.k) {
    case K_SHADE: g.fillStyle = dk; g.fillRect(x - w / 2, y - h, pw, h); g.fillRect(x + w / 2 - pw, y - h, pw, h); if (w > 8) g.fillRect(x - pw / 2, y - h, pw, h);
      if (it.vr < 2) { g.fillStyle = c2; g.fillRect(x - w / 2, y - h, w * (it.vr ? .4 : .7), h * .75); } // a shade-cloth wall on one side
      g.fillStyle = c1; g.fillRect(x - w / 2 - .3 * k, y - h - .35 * k, w + .6 * k, Math.max(1, .55 * k)); break;
    case K_DOME: { const r = w / 2; g.fillStyle = c1; g.beginPath(); g.moveTo(x - r, y); g.arc(x, y, r, Math.PI, TAU); g.fill(); if (r > 2) { g.fillStyle = c2; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, -Math.PI / 2, 0); g.fill(); } break; }
    case K_HEXA: g.fillStyle = c1; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h * .62); g.lineTo(x - w * .22, y - h); g.lineTo(x + w * .22, y - h); g.lineTo(x + w / 2, y - h * .62); g.lineTo(x + w / 2, y); g.fill();
      if (w > 3) { g.fillStyle = c2; g.fillRect(x + w * .12, y - h * .62, w * .38, h * .62); } break;
    case K_TENT: g.fillStyle = c1; g.beginPath(); if (it.vr < 3) { g.moveTo(x - w / 2, y); g.lineTo(x, y - h); g.lineTo(x + w / 2, y); } else { g.moveTo(x - w / 2, y); g.quadraticCurveTo(x, y - h * 1.6, x + w / 2, y); } g.fill(); break;
    case K_RV: g.fillStyle = c1; g.fillRect(x - w / 2, y - h, w, h * .84); if (w > 3) { g.fillStyle = c2; g.fillRect(x - w / 2, y - h * .5, w, Math.max(1, .3 * k)); g.fillStyle = dk; g.fillRect(x - w / 2, y - h * .16, w, h * .16); } break;
    case K_TRUCK: g.fillStyle = c1; g.fillRect(x - w / 2, y - h, w * .74, h * .84); g.fillStyle = c2; g.fillRect(x + w * .26, y - h * .62, w * .24, h * .46); break;
    case K_FLAG: g.fillStyle = dk; g.fillRect(x - pw / 2, y - h, pw, h); g.fillStyle = c1; g.fillRect(x, y - h, Math.max(2, 1.5 * k), Math.max(1.5, .9 * k)); break;
    case K_TOWER: g.fillStyle = dk; g.fillRect(x - w / 2, y - h, pw, h); g.fillRect(x + w / 2 - pw, y - h, pw, h); if (k > 2) for (let j = 1; j < 5; j++) g.fillRect(x - w / 2, y - h * j / 5, w, pw * .7);
      g.fillRect(x - w * .45, y - h - 1.4 * k, w * .9, 1.4 * k); break; // the speaker stack on top
    case K_STAGE: g.fillStyle = dk; g.fillRect(x - w / 2, y - h * .72, w, h * .72); g.fillStyle = c1; g.beginPath(); g.moveTo(x - w / 2 - .5 * k, y - h * .7); g.quadraticCurveTo(x, y - h * 1.25, x + w / 2 + .5 * k, y - h * .7); g.fill(); break;
    case K_YURT: g.fillStyle = c1; g.fillRect(x - w / 2, y - h * .6, w, h * .6); g.beginPath(); g.moveTo(x - w / 2 - .2 * k, y - h * .6); g.lineTo(x, y - h); g.lineTo(x + w / 2 + .2 * k, y - h * .6); g.fill(); break;
    case K_ART: brcArtBill(it, x, y, k, c1, c2, dk); break;
    case K_CC: { const R = w / 2; g.fillStyle = c2; g.fillRect(x - R, y - 3.5 * k, 2 * R, 3.5 * k); // Center Camp: the dark shade under the round canopy, then the peaked roof and its mast
      g.fillStyle = c1; g.beginPath(); g.moveTo(x - R - k, y - 3.2 * k); g.lineTo(x - R * .55, y - 8 * k); g.lineTo(x - R * .14, y - 12.2 * k); g.lineTo(x, y - h); g.lineTo(x + R * .14, y - 12.2 * k); g.lineTo(x + R * .55, y - 8 * k); g.lineTo(x + R + k, y - 3.2 * k); g.fill();
      g.fillStyle = c2; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + R * .14, y - 12.2 * k); g.lineTo(x + R * .55, y - 8 * k); g.lineTo(x + R + k, y - 3.2 * k); g.lineTo(x + R * .3, y - 3.2 * k); g.fill();
      if (k > 1) { g.fillStyle = dk; for (let j = -4; j <= 4; j++) g.fillRect(x + j * R / 4.5 - pw / 2, y - 3.5 * k, pw, 3.5 * k); }
      g.fillStyle = dk; g.fillRect(x - pw / 2, y - h - 4 * k, pw, 4 * k); g.fillStyle = '#b8452f'; g.fillRect(x, y - h - 4 * k, Math.max(2, 2 * k), Math.max(1.5, 1.2 * k)); break; }
  }
}
function brcArtBill(it, x, y, k, c1, c2, dk) { // the odd big art piece in the city: a spire, a ring, a wheel, a stack, an arch
  const w = it.w * k, h = it.h * k, pw = Math.max(1, .3 * k);
  if (it.vr === 0) { g.fillStyle = c1; g.beginPath(); g.moveTo(x - w * .3, y); g.lineTo(x, y - h); g.lineTo(x + w * .3, y); g.fill(); g.fillStyle = c2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.lineTo(x + w * .3, y); g.fill(); }
  else if (it.vr === 1) { g.strokeStyle = c1; g.lineWidth = Math.max(1, .8 * k); g.beginPath(); g.arc(x, y - h * .55, Math.max(1, h * .42), 0, TAU); g.stroke(); g.fillStyle = dk; g.fillRect(x - w * .2, y - h * .14, w * .4, h * .14); }
  else if (it.vr === 2) { const r = h * .45; g.strokeStyle = c1; g.lineWidth = Math.max(1, .4 * k); g.beginPath(); g.arc(x, y - h * .52, r, 0, TAU); for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI; g.moveTo(x + Math.cos(a) * r, y - h * .52 + Math.sin(a) * r); g.lineTo(x - Math.cos(a) * r, y - h * .52 - Math.sin(a) * r); } g.stroke(); g.fillStyle = dk; g.fillRect(x - pw, y - h * .52, 2 * pw, h * .52); }
  else if (it.vr === 3) { g.fillStyle = c1; let yy = y; for (let j = 0; j < 4; j++) { const bw = w * (.9 - j * .17), bh = h / 4.2; g.fillRect(x - bw / 2 + (j % 2 ? 1 : -1) * w * .06, yy - bh, bw, bh); yy -= bh; } g.fillStyle = c2; g.fillRect(x + w * .1, y - h * .9, w * .2, h * .9); }
  else { g.strokeStyle = c1; g.lineWidth = Math.max(1, .9 * k); g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x - w / 2, y - h * .5); g.arc(x, y - h * .5, w / 2, Math.PI, TAU); g.lineTo(x + w / 2, y); g.stroke(); }
}
function brcGround(t, alpha, lights) {
  const low = skyCols(t)[1], cache = [], lim = 3.2 + C.y / 5, hy = H / 2 - C.f * Math.tan(C.p);
  if (hy < -60 || hy > H + 200) return; // the horizon is out of frame: the band is too
  for (let ri = 0; ri < BRC_HZ.length; ri++) { const hz = BRC_HZ[ri]; cache.push(BRC_RGB.map((c) => [rgb(mix(c, low, hz)), rgb(mix([c[0] * .62, c[1] * .6, c[2] * .62], low, hz)), rgb(mix([66, 52, 44], low, hz))])); }
  const la = lights ? brcLightAmt(t) : 0, pts = BRC_F.pts; g.globalAlpha = alpha;
  for (const it of BRC_ITEMS) {
    if (it.ring > lim && !it.tall) continue;
    const p = P(it.X, 0, it.Z); if (p[2] < 20) continue; const k = C.f / p[2], hw = it.w * .5 * k + 2; if (p[0] + hw < 0 || p[0] - hw > W) continue;
    const hp = (it.h + 4) * k; if (hp < .7 || p[1] - hp > H || p[1] < -2) continue;
    const cc = cache[Math.min(it.ring, BRC_HZ.length - 1)][it.c]; brcBill(it, p[0], p[1], k, cc[0], cc[1], cc[2]);
    if (la > it.on * 1.3 && it.L.length) { const f = clamp((la - it.on * 1.3) * 8) * (1.25 - BRC_HZ[Math.min(it.ring, 12)] * 1.1) * (it.ring > 1 && !it.tall ? .7 : 1), sz = clamp(.5 * k, 1.1, 2.6) * (it.tall ? 1.3 : 1);
      for (let j = 0; j < it.L.length; j++) { const L = it.L[j], tw = .82 + .18 * Math.sin(t * (1.3 + j * .4) + it.ph + j); pts.push(p[0] + L[0] * k, p[1] - L[1] * k, sz, it.k === K_FLAG || it.k === K_RV || it.k === K_HEXA ? 0 : (it.lc + j * (it.k === K_TOWER || it.k === K_ART ? 1 : 0)) % 7, f * tw); } }
  }
  g.globalAlpha = 1;
  // playa dust over the foot of the band
  if (hy > -20 && hy < H) { const gr = g.createLinearGradient(0, hy - 6, 0, hy + 10); gr.addColorStop(0, rgb(low, 0)); gr.addColorStop(.45, rgb(low, .35 * alpha)); gr.addColorStop(1, rgb(low, 0)); g.fillStyle = gr; g.fillRect(0, hy - 6, W, 16); }
}

// ---------- from the air: the map ----------
function brcPoly(pts, fill) { g.beginPath(); for (let i = 0; i < pts.length; i++) { const q = P(pts[i][0], 0, pts[i][1]); if (q[2] < 1) return false; i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } g.closePath(); g.fillStyle = fill; g.fill(); return true; }
function brcCircle(cx, cz, r, n) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } return pts; }
function brcBand(a, b, half) { const dx = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dx, dz) || 1, nx = -dz / n * half, nz = dx / n * half; return [[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]]; }
function brcLine(pts, w, col, closed) { g.beginPath(); for (let i = 0; i < pts.length; i++) { const q = P(pts[i][0], 0, pts[i][1]); if (q[2] < 1) return; i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } if (closed) g.closePath(); g.strokeStyle = col; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); }
function brcAir(t, alpha, lights) {
  const pl = brcAirPlaya(), hy = H / 2 - C.f * Math.tan(C.p), sv = sunVec(t), sa = shadowA(t), la = lights ? brcLightAmt(t) : 0, air = BRC_F.air;
  const kc = C.f / Math.max(1, Math.hypot(C.x - MAN.x, C.y, C.z - MAN.z)); // px per metre round the Man
  g.save(); g.globalAlpha = alpha;
  // the playa itself, flat and even from up here (only below the horizon)
  const rep = smooth((C.y - 150) / 250); if (rep > 0 && hy < H) { g.globalAlpha = alpha * rep; g.fillStyle = rgb(pl); g.fillRect(0, Math.max(0, hy), W, H - Math.max(0, hy)); g.globalAlpha = alpha; }
  const playa = rgb(pl), blockC = rgb(mix(pl, [128, 112, 98], .32)), road = rgb(mix(pl, [250, 244, 230], .35)), dark = rgb(mix(pl, [60, 44, 34], .5));
  // a paler worn disc round the Man and down the promenades (foot traffic and art cars)
  brcPoly(brcCircle(MAN.x, MAN.z, 95, 28), rgb(mix(pl, [250, 242, 222], .18)));
  for (const pr of PROMS) brcPoly(brcBand(brcAt(pr.a, 40), brcAt(pr.a, pr.r1 + 8), 7), road);
  // the blocks: darker, filled with camps; the streets stay pale between them
  for (const b of BRC_BLOCKS) if (b.poly) brcPoly(b.poly, blockC);
  // Center Camp's plaza and Rod's Road, the plazas, the keyhole and the wide 6:00 road out to it, Gate Road
  const cc = brcAt(6, BRC.CC.r), key = brcAt(6, BRC.KEY.r);
  brcPoly(brcCircle(cc[0], cc[1], BRC.CC.rod + 7, 40), road); brcPoly(brcCircle(cc[0], cc[1], BRC.CC.rod - 6, 40), playa);
  brcPoly(brcBand(brcAt(6, BRC.CC.r + BRC.CC.rod - 4), brcAt(6, BRC.KEY.r), 13), road); brcPoly(brcCircle(key[0], key[1], BRC.KEY.R, 28), road); brcPoly(brcCircle(key[0], key[1], BRC.KEY.R - 14, 28), playa);
  for (const pz of BRC.PLAZAS) { const c = brcAt(pz.a, pz.r); brcPoly(brcCircle(c[0], c[1], pz.R + 6, 24), road); brcPoly(brcCircle(c[0], c[1], pz.R - 4, 24), playa); }
  for (let i = 0; i + 1 < BRC_GATE.length; i++) brcPoly(brcBand(BRC_GATE[i], BRC_GATE[i + 1], 9), road);
  // the airport outside the fence near 5:00: a graded strip, a centre line, an apron with small planes
  { const ap = brcAt(BRC.AIRPORT.a, BRC.AIRPORT.r), d = brcDir(BRC.AIRPORT.a), tn = [-d[1], d[0]], L = BRC.AIRPORT.L / 2, a0 = [ap[0] - tn[0] * L, ap[1] - tn[1] * L], a1 = [ap[0] + tn[0] * L, ap[1] + tn[1] * L];
    brcPoly(brcBand(a0, a1, 22), rgb(mix(pl, [120, 104, 88], .28))); for (let j = 0; j < 14; j++) { const u0 = -L + 40 + j * 75; brcPoly(brcBand([ap[0] + tn[0] * u0, ap[1] + tn[1] * u0], [ap[0] + tn[0] * (u0 + 35), ap[1] + tn[1] * (u0 + 35)], 1.2), road); }
    const apr = [ap[0] + d[0] * 60, ap[1] + d[1] * 60]; brcPoly(brcBand([apr[0] - tn[0] * 90, apr[1] - tn[1] * 90], [apr[0] + tn[0] * 90, apr[1] + tn[1] * 90], 30), rgb(mix(pl, [120, 104, 88], .2)));
    for (let j = 0; j < 7; j++) { const c = [apr[0] + tn[0] * (-75 + j * 25) + d[0] * (j % 2 ? 8 : -8), apr[1] + tn[1] * (-75 + j * 25) + d[1] * (j % 2 ? 8 : -8)]; brcPoly(brcBand([c[0] - d[0] * 5, c[1] - d[1] * 5], [c[0] + d[0] * 5, c[1] + d[1] * 5], 1), '#f2efe6'); brcPoly(brcBand([c[0] - tn[0] * 6, c[1] - tn[1] * 6], [c[0] + tn[0] * 6, c[1] + tn[1] * 6], 1), '#f2efe6'); } }
  // the trash fence: a pentagon round everything
  brcLine(BRC_FENCE, Math.max(1.2, 2.2 * kc), 'rgba(122,82,52,.85)');
  // the camps: shadows on the playa first, then the structures, block by block in that block's own frame
  for (const b of BRC_BLOCKS) {
    const o = P(b.cx, 0, b.cz); if (o[2] < 40) continue; const pa = P(b.cx + b.tx, 0, b.cz + b.tz), pb = P(b.cx + b.rx, 0, b.cz + b.rz);
    if (b.poly && [0, 6, 7, 13].some((j) => P(b.poly[j][0], 0, b.poly[j][1])[2] < 20)) continue; // a block reaching behind the lens: its local frame would smear
    const ex0 = pa[0] - o[0], ex1 = pa[1] - o[1], ey0 = pb[0] - o[0], ey1 = pb[1] - o[1], kk = Math.sqrt(Math.abs(ex0 * ey1 - ex1 * ey0)); if (kk < .05) continue;
    if (o[0] < -400 * kk - 50 || o[0] > W + 400 * kk + 50 || o[1] < -400 * kk - 50 || o[1] > H + 400 * kk + 50) continue;
    g.setTransform(ex0, ex1, ey0, ey1, o[0], o[1]);
    if (sa > .02) { const su = sv[0] * b.tx + sv[1] * b.tz, sw = sv[0] * b.rx + sv[1] * b.rz; g.fillStyle = `rgba(52,34,58,${sa * .75})`; g.beginPath();
      for (const it of b.items) { if (it.h < 2.5) continue; const hh = Math.min(it.h, 9), du = su * hh, dv = sw * hh; if (it.k === K_FLAG || it.k === K_TOWER) { g.moveTo(it.u, it.v); g.lineTo(it.u + su * it.h, it.v + sw * it.h); g.lineTo(it.u + su * it.h + .6, it.v + sw * it.h); g.lineTo(it.u + .6, it.v); continue; }
        g.rect(Math.min(it.u - it.w / 2, it.u - it.w / 2 + du), Math.min(it.v - it.d / 2, it.v - it.d / 2 + dv), it.w + Math.abs(du), it.d + Math.abs(dv)); }
      g.fill(); }
    for (const it of b.items) { const c = BRC_COLS[it.c];
      if (it.k === K_DOME || it.k === K_YURT) { g.fillStyle = c; g.beginPath(); g.arc(it.u, it.v, it.w / 2, 0, TAU); g.fill(); if (it.w * kk > 5) { g.fillStyle = 'rgba(60,44,40,.25)'; g.beginPath(); g.arc(it.u, it.v, it.w / 2, -Math.PI / 4, Math.PI * .75); g.fill(); } }
      else if (it.k === K_CC) { const R = it.w / 2; g.fillStyle = '#efe6d2'; g.beginPath(); g.arc(it.u, it.v, R, 0, TAU); g.fill(); g.strokeStyle = 'rgba(120,96,70,.5)'; g.lineWidth = 1.2; g.beginPath(); for (let j = 0; j < 16; j++) { const a = j / 16 * TAU; g.moveTo(it.u, it.v); g.lineTo(it.u + Math.cos(a) * R, it.v + Math.sin(a) * R); } g.stroke(); g.beginPath(); g.arc(it.u, it.v, R * .55, 0, TAU); g.stroke(); g.fillStyle = '#8f6d48'; g.beginPath(); g.arc(it.u, it.v, 2.5, 0, TAU); g.fill(); }
      else if (it.k === K_ART) { g.fillStyle = c; g.beginPath(); g.arc(it.u, it.v, it.w * .35, 0, TAU); g.fill(); g.fillStyle = '#34302f'; g.fillRect(it.u - 1, it.v - 1, 2, 2); }
      else if (it.k === K_FLAG) { g.fillStyle = c; g.fillRect(it.u - .8, it.v - .8, 1.6, 1.6); }
      else if (it.k === K_TOWER) { g.fillStyle = '#34302f'; g.fillRect(it.u - 1.5, it.v - 1.5, 3, 3); }
      else { g.fillStyle = c; g.fillRect(it.u - it.w / 2, it.v - it.d / 2, it.w, it.d); if (it.k === K_SHADE && it.w * kk > 6) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(it.u - it.w / 2, it.v - it.d / 2, it.w, it.d * .35); } } }
    if (la > 0) for (const it of b.items) { if (!it.al || la < it.on * 1.2 || it.k === K_CC) continue; const f = clamp((la - it.on * 1.2) * 8);
      air.push(o[0] + ex0 * it.u + ey0 * it.v, o[1] + ex1 * it.u + ey1 * it.v, clamp(kk * (it.k === K_SHADE || it.k === K_ART || it.k === K_STAGE ? 3.4 : 2.4), 1.3, 3.8), it.lc, f * (.85 + .15 * Math.sin(t * 1.7 + it.ph))); }
    if (la > 0 && b.items.length && b.items[0].k === K_CC) for (let j = 0; j < 16; j++) { const a = j / 16 * TAU, u = b.items[0].u + Math.cos(a) * 44, v = b.items[0].v + Math.sin(a) * 44; air.push(o[0] + ex0 * u + ey0 * v, o[1] + ex1 * u + ey1 * v, clamp(kk * 4, 1.5, 5), 0, la); }
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  // draft 9: from high up the streets are drawn again over the camps, paler and wider than life, so the grid reads
  const hi = smooth((C.y - 250) / 1300); if (hi > 0) { const sw = Math.max(BRC.ST * kc, lerp(BRC.ST * kc, 4.6, hi)), sc = rgb(mix(pl, [252, 246, 232], .55)); g.globalAlpha = alpha * hi * .9;
    for (const r of BRC.RINGS) { const pts = []; for (let j = 0; j <= 64; j++) pts.push(brcAt(2 + 8 * j / 64, r)); brcLine(pts, r === BRC.ESP ? sw * 1.3 : sw, sc); }
    for (let a = 2; a <= 10.001; a += .5) { if (Math.abs(a - 6) < .01) continue; brcLine([brcAt(a, BRC.ESP), brcAt(a, BRC.EDGE)], sw, sc); } // 6:00 is Center Camp's road, already drawn
    g.globalAlpha = alpha; }
  BRC_F.cars = la > 0 && hi > 0 ? alpha * hi : 0;
  g.restore();
}
// burn night: art cars stream in from the camps along the radial streets toward the Man and park round the burn
// (draft 9, critic D). Seen only from the aerial, as warm points 1-2 px across; their pace is sped up so it reads from 5 km.
const BRC_CARS = [...Array(200)].map((_, i) => { const R = mulberry(5150 + i * 7); return { a: 2 + .5 * Math.floor(R() * 17), r0: 900 + R() * 780, v: 28 + R() * 20, ts: 199 + R() * 6, stop: 78 + R() * 30, lat: (R() - .5) * 8, c: R() < .7 ? 0 : 1 + Math.floor(R() * 3) }; });
function brcCarLights(t) {
  const m = BRC_F.cars || 0; if (m <= .01) return; const cols = ['255,214,150', '255,170,90', '255,130,190', '150,220,255'];
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const o of BRC_CARS) { const r = Math.max(o.stop, o.r0 - o.v * Math.max(0, t - o.ts)), d = brcDir(o.a), X = MAN.x + d[0] * r - d[1] * o.lat, Z = MAN.z + d[1] * r + d[0] * o.lat, q = P(X, 0, Z); if (q[2] < 1 || q[0] < -4 || q[0] > W + 4 || q[1] < -4 || q[1] > H + 4) continue;
    const a = m * (.75 + .25 * Math.sin(t * 3 + o.r0)); g.fillStyle = `rgba(${cols[o.c]},${.22 * a})`; g.fillRect(q[0] - 3, q[1] - 3, 6, 6); g.fillStyle = `rgba(${cols[o.c]},${.95 * a})`; g.fillRect(q[0] - 1.2, q[1] - 1.2, 2.4, 2.4); }
  g.restore();
}
// draft 16 (Robin's photo robin-2026-10-18/12.jpg): the Temple is a tiered wooden pagoda, not any one year's design: a wide
// low pavilion with a lattice roof and prayer flags strung along its eaves, four flared roof tiers above it with rows of
// paper lanterns hanging from every eave, and a spire. Same spot and size class as before (about 46 m across, 30 m tall).
const TPL_TIERS = [[11, 6.2, 9.0, 16.5, 11.2], [9.0, 11.2, 13.2, 13.5, 15.4], [7.0, 15.4, 17.2, 10.8, 19.2], [5.0, 19.2, 20.8, 8.0, 23.4]]; // [body half width, body y0, y1, eave half width, roof top]
function pagodaAir(t, k) { // draft 21: the pagoda (the Temple until draft 20) from above: the pavilion's lattice square, the tiers' roofs stepping in, the spire; lantern points at night
  const [X, Z] = PAGODA_XZ, sv = sunVec(t), sa = shadowA(t), sq = (h, col) => brcPoly([[X - h, Z - h], [X + h, Z - h], [X + h, Z + h], [X - h, Z + h]], col);
  if (sa > .02) { g.save(); g.globalAlpha = sa * .9; brcPoly([[X - 17, Z - 17], [X + 17, Z - 17], [X + 17 + sv[0] * 24, Z + 17 + sv[1] * 24], [X - 17 + sv[0] * 24, Z + 17 + sv[1] * 24]], 'rgb(52,34,58)'); g.restore(); }
  sq(23, '#cdb48a'); sq(21.5, '#b89a6c');
  TPL_TIERS.forEach(([, , , e], i) => { sq(e, i % 2 ? '#a8875e' : '#8f7048'); sq(e * .72, i % 2 ? '#c6a678' : '#b39064'); });
  brcPoly([[X - e1(0), Z - .6], [X + e1(0), Z - .6], [X + e1(0), Z + .6], [X - e1(0), Z + .6]], '#7a5c3c'); brcPoly([[X - .6, Z - e1(0)], [X + .6, Z - e1(0)], [X + .6, Z + e1(0)], [X - .6, Z + e1(0)]], '#7a5c3c'); // the hips of the roofs
  sq(1.2, '#5a4430');
  const n = nightAmt(t); if (n > .05) { g.save(); g.globalCompositeOperation = 'lighter'; for (const [, , , e] of TPL_TIERS) for (let j = 0; j < 16; j++) { const u = j / 16 * 4, sd = Math.floor(u), f = (u - sd) * 2 - 1, cx = [f * e, e, -f * e, -e][sd], cz = [-e, f * e, e, -f * e][sd], q = P(X + cx, 8, Z + cz);
      if (q[2] < 1) continue; g.fillStyle = `rgba(255,214,150,${.8 * n})`; g.fillRect(q[0] - 1, q[1] - 1, 2, 2); } g.restore(); }
  function e1() { return TPL_TIERS[0][3]; }
}

// ---------- the pagoda, seen from the playa (draft 21: no longer the Temple, an art piece out on deep playa) ----------
function pagodaBill(t, p, k) {
  bmBegin(p[0], p[1], k, 1); const wood = '#d8b98a', shade = '#a8875e', deep = '#4a3626', roofC = '#8f7048', det = k > 2.5, n = nightAmt(t), lit = clamp((t - 196) / 4) * Math.max(.7, Math.min(1, n * 3)); // draft 18: lanterns lit warm from dusk
  // the low base pavilion: posts, a lattice roof sloping out to wide eaves, prayer flags along it
  bmFill([[-21, 0], [21, 0], [21, .5], [-21, .5]], bmShade('#c9a878', .85));
  for (let x = -20; x <= 20; x += 2.5) bmLine([[x, .5], [x, 4.6]], .45, x % 5 === 0 ? shade : '#b8976a');
  bmFill([[-11, .5], [11, .5], [11, 6.2], [-11, 6.2]], bmLG(-11, 0, 11, 0, [wood, wood, shade])); // the hall in the middle
  if (det) { for (let x = -10; x <= 10; x += 2) bmFill([[x - .5, .5], [x + .5, .5], [x + .5, 4.0], [x - .5, 4.0]], deep); }
  bmPath([[-23.5, 4.2], [-21, 4.9], [-11, 6.4], [11, 6.4], [21, 4.9], [23.5, 4.2], [21, 4.55], [-21, 4.55]]); g.closePath(); g.fillStyle = '#c9ac80'; g.fill();
  if (det) { g.strokeStyle = 'rgba(110,80,50,.55)'; g.lineWidth = bmW(.12); g.beginPath(); for (let x = -21; x <= 21; x += 1.4) { const y0 = 4.55 + 1.85 * (1 - Math.min(1, Math.abs(x) / 21)) * .5; g.moveTo(x, -4.6); g.lineTo(x + 1.2, -Math.min(6.3, y0 + 1)); g.moveTo(x + 1.2, -4.6); g.lineTo(x, -Math.min(6.3, y0 + 1)); } g.stroke(); } // the lattice
  if (det) { const cols = ['#d8452f', '#2f6fb5', '#e8b23a', '#3c8c5a', '#f2ede0']; for (let j = 0; j < 30; j++) { const x = -20 + j * 40 / 29, y = 4.4 - .35 * Math.sin((j % 10) / 9 * Math.PI); bmFill([[x - .45, y], [x + .45, y], [x, y - 1.0]], cols[j % 5]); } } // prayer flags on their string
  // the tiers: a body, then a roof flaring out to upturned eaves, a row of paper lanterns under each eave
  TPL_TIERS.forEach(([bw, y0, y1, e, top], i) => {
    bmFill([[-bw, y0], [bw, y0], [bw, y1], [-bw, y1]], bmLG(-bw, 0, bw, 0, [wood, wood, shade]));
    if (det) { g.strokeStyle = 'rgba(80,56,36,.5)'; g.lineWidth = bmW(.12); g.beginPath(); for (let x = -bw + 1; x < bw; x += 1.2) { g.moveTo(x, -y0); g.lineTo(x, -y1); } g.stroke(); }
    const ey = y1 - .4; bmPath([[-e - .8, ey + .9], [-e, ey + .35], [-bw, y1 + .2], [-bw * .45, top], [bw * .45, top], [bw, y1 + .2], [e, ey + .35], [e + .8, ey + .9], [e, ey], [-e, ey]]); g.closePath(); g.fillStyle = bmLG(0, top, 0, ey, [bmShade(roofC, 1.05), roofC, bmShade(roofC, .8)]); g.fill();
    if (det) { g.strokeStyle = 'rgba(60,42,26,.45)'; g.lineWidth = bmW(.1); g.beginPath(); for (let x = -e; x <= e; x += 1.1) { g.moveTo(x, -ey); g.lineTo(x * .45, -top); } g.stroke(); }
    const m = Math.round(e * 2 / 2.1); for (let j = 0; j <= m; j++) { const x = -e + .6 + j * (2 * e - 1.2) / m, ly = ey - .9 - .25 * Math.sin(j * 1.7 + i); if (det) bmLine([[x, ey], [x, ly + .5]], .04, '#5a4430');
      if (lit > 0) { g.save(); g.globalCompositeOperation = 'lighter'; bmOval(x, ly, 1.1, 1.2, `rgba(255,170,90,${.28 * lit})`); g.restore(); } bmOval(x, ly, .42, .5, lit > 0 ? `rgb(255,${Math.round(226 - 30 * lit)},${Math.round(170 - 70 * lit)})` : '#f2ead6'); if (det) bmLine([[x - .36, ly], [x + .36, ly]], .05, n > .05 ? 'rgba(200,120,60,.6)' : 'rgba(170,150,120,.6)'); } });
  // the spire: a slim cone with rings, a finial
  bmFill([[-2.4, 23.4], [2.4, 23.4], [.2, 30.5], [-.2, 30.5]], bmLG(-2.4, 0, 2.4, 0, [wood, shade])); if (det) for (const y of [24.6, 26, 27.4, 28.8]) { const hw = 2.4 * (30.5 - y) / 7.1; bmLine([[-hw, y], [hw, y]], .14, deep); }
  bmLine([[0, 30.4], [0, 32.2]], .1, deep);
  g.restore();
}
// ---------- draft 21: this year's Temple (Robin's photos robin-2026-10-18/22-26.jpg) ----------
// A tall open gateway tower, black and white all over: a wide square base platform on four ornate pillars with a big
// open archway (the sunset shows through it) and a staircase up the front; an upper tier on four slimmer pillars with
// onion domes and spires at its corners; on top a big onion dome on a tetrapod of striped legs, ending in a needle
// spire, about 35 m up; small domes and spires on the base platform's corners; guy cables to the ground. The pattern
// is suggested, not drawn: rows of small rosette circles, zig-zags and barber stripes. It never burns in this film.
const PAGODA_XZ = [362, -430]; // the pagoda, out on deep playa beyond the Man, 34 m right of the 12:00 line, where the fly-out passes it
const TPL_INK = '#1b1719', TPL_LACE = '#ece6da';
function tplDome(cx, y0, r, sp, det, med) { // an onion dome sitting at y0, widest r, with a spire sp metres above its point
  bmPath([[cx - r * .32, y0], [cx - r * .95, y0 + r * .55], [cx - r, y0 + r * .95], [cx - r * .7, y0 + r * 1.55], [cx - r * .18, y0 + r * 2.1], [cx, y0 + r * 2.35], [cx + r * .18, y0 + r * 2.1], [cx + r * .7, y0 + r * 1.55], [cx + r, y0 + r * .95], [cx + r * .95, y0 + r * .55], [cx + r * .32, y0]]); g.closePath(); g.fillStyle = TPL_INK; g.fill();
  if (det) { const n = Math.max(3, Math.round(r * 2.4)); for (let j = 0; j < n; j++) { const x = cx - r * .7 + j * 1.4 * r / (n - 1); bmDot(x, y0 + r * .95, r * .1, TPL_LACE); } // the rosette row round its waist
    if (med) { bmDot(cx, y0 + r * 1.05, r * .34, TPL_LACE); bmDot(cx, y0 + r * 1.05, r * .24, TPL_INK); for (let j = 0; j < 8; j++) { const a = j / 8 * TAU; bmDot(cx + Math.cos(a) * r * .29, y0 + r * 1.05 + Math.sin(a) * r * .29, r * .045, TPL_LACE); } bmDot(cx, y0 + r * 1.05, r * .08, TPL_LACE); }
    bmLine([[cx - r * .55, y0 + r * 1.6], [cx + r * .55, y0 + r * 1.6]], r * .05, TPL_LACE); }
  bmFill([[cx - r * .07, y0 + r * 2.3], [cx + r * .07, y0 + r * 2.3], [cx, y0 + r * 2.35 + sp]], TPL_INK); if (det) bmDot(cx, y0 + r * 2.35 + sp * .3, r * .09, TPL_INK);
}
function tplPillar(x0, x1, y0, y1, det, zig) { // an ornate black pillar with lace: a white edge stripe, rosettes or zig-zags up its face
  bmFill([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], TPL_INK); if (!det) return; const w = x1 - x0, cx = (x0 + x1) / 2;
  if (zig) { g.strokeStyle = TPL_LACE; g.lineWidth = bmW(w * .06); g.beginPath(); for (let y = y0 + .3, i = 0; y < y1 - .2; y += w * .35, i++) { const x = cx + (i % 2 ? .3 : -.3) * w; y === y0 + .3 ? g.moveTo(x, -y) : g.lineTo(x, -y); } g.stroke(); }
  else for (let y = y0 + w * .5; y < y1 - w * .3; y += w * .75) { bmDot(cx, y, w * .26, TPL_LACE); bmDot(cx, y, w * .15, TPL_INK); bmDot(cx, y, w * .06, TPL_LACE); }
  bmLine([[x0 + w * .08, y0], [x0 + w * .08, y1]], w * .05, TPL_LACE); bmLine([[x1 - w * .08, y0], [x1 - w * .08, y1]], w * .05, TPL_LACE);
}
function tplRail(x0, x1, y, h, det) { // a barber-striped edge band
  bmFill([[x0, y], [x1, y], [x1, y + h], [x0, y + h]], TPL_INK); if (!det) return; g.save(); bmPath([[x0, y], [x1, y], [x1, y + h], [x0, y + h]]); g.closePath(); g.clip(); g.strokeStyle = TPL_LACE; g.lineWidth = bmW(h * .28); g.beginPath();
  for (let x = x0 - h; x < x1 + h; x += h * .9) { g.moveTo(x, -y); g.lineTo(x + h, -(y + h)); } g.stroke(); g.restore();
}
function templeBill(t, p, k) {
  bmBegin(p[0], p[1], k, .62); /* drawn 0.62 narrow: tall and slim, about 17 m across the base, 36 m up */ const det = k > 2.2, fine = k > 5;
  // guy cables first, behind everything: from the upper tier and the crown out to the ground
  g.strokeStyle = 'rgba(30,24,28,.55)'; g.lineWidth = bmW(.05); g.beginPath(); for (const s of [-1, 1]) { g.moveTo(s * 7.5, -18.5); g.lineTo(s * 34, 0); g.moveTo(s * 3, -27); g.lineTo(s * 40, 0); g.moveTo(s * 12, -10); g.lineTo(s * 24, 0); } g.stroke();
  // the base platform: two big ornate pillar pairs, the deck across them, the open arch between (the sky shows through)
  for (const s of [-1, 1]) { tplPillar(s * 12.5 - (s > 0 ? 2.2 : 0), s * 12.5 + (s < 0 ? 2.2 : 0), 0, 9, det, false); tplPillar(s * 8.6 - (s > 0 ? 1.8 : 0), s * 8.6 + (s < 0 ? 1.8 : 0), 0, 9, det, true);
    bmFill([[s * 10.3 - .5, 0], [s * 10.3 + .5, 0], [s * 10.3 + .5, 9], [s * 10.3 - .5, 9]], TPL_INK); // the web between each pair
    if (fine) for (let y = 1; y < 8.5; y += 1.2) bmDot(s * 10.3, y, .32, TPL_LACE); }
  tplRail(-13, 13, 8.2, .9, det); bmFill([[-13.4, 9.1], [13.4, 9.1], [13.4, 9.7], [-13.4, 9.7]], TPL_INK); tplRail(-13.4, 13.4, 9.7, .55, det); // the deck and its striped rail
  bmPath([[-6.8, 8.2], [-6.8, 6.6], [-4.5, 7.6], [0, 8.05], [4.5, 7.6], [6.8, 6.6], [6.8, 8.2]]); g.closePath(); g.fillStyle = TPL_INK; g.fill(); // the arch's crown under the deck
  if (fine) for (let j = 0; j < 11; j++) bmDot(-5.5 + j * 1.1, 7.75 - .5 * Math.pow((j - 5) / 5, 2), .18, TPL_LACE);
  // the staircase up the front, under the arch
  for (let j = 0; j < 6; j++) { const y = j * .32, hw = 3.4 - j * .25; bmFill([[-hw, y], [hw, y], [hw, y + .32], [-hw, y + .32]], j % 2 ? '#2a2427' : TPL_INK); if (det) bmLine([[-hw, y + .32], [hw, y + .32]], .05, TPL_LACE); }
  // small domes with spires on the base platform's corners
  for (const s of [-1, 1]) tplDome(s * 12.3, 10.25, 1.15, 2.4, fine, false);
  // the upper tier: four slimmer pillars (three show side on), its deck and rail
  for (const x of [-6.8, 0, 6.8]) tplPillar(x - .55, x + .55, 10.25, 17.3, det, x === 0);
  tplRail(-8.2, 8.2, 17.3, .7, det); bmFill([[-8.6, 18.0], [8.6, 18.0], [8.6, 18.5], [-8.6, 18.5]], TPL_INK);
  // onion domes with spires at the upper tier's corners (a pair each side, one in the middle behind the crown's legs)
  for (const s of [-1, 1]) { tplDome(s * 7.6, 18.5, 1.5, 3.4, fine, true); tplDome(s * 6.0, 18.5, 1.05, 3.0, fine, false); }
  tplDome(0, 18.5, 1.45, 1.2, fine, true);
  // the crown: a tetrapod of striped legs up to a big onion dome, then the very tall needle spire
  for (const [a, b] of [[-5.2, -.9], [5.2, .9], [-2.2, -.5], [2.2, .5]]) { bmLine([[a, 18.5], [b, 23.6]], .38, TPL_INK); if (det) for (let j = 0; j < 10; j += 2) { const u0 = j / 10, u1 = (j + 1) / 10; bmLine([[lerp(a, b, u0), lerp(18.5, 23.6, u0)], [lerp(a, b, u1), lerp(18.5, 23.6, u1)]], .3, TPL_LACE); } }
  bmFill([[-1.1, 23.3], [1.1, 23.3], [.9, 24.2], [-.9, 24.2]], TPL_INK);
  tplDome(0, 24.0, 3.0, 1.0, det, true);
  bmFill([[-.42, 31.0], [.42, 31.0], [0, 36.0]], TPL_INK); bmDot(0, 31.6, .45, TPL_INK); if (fine) { bmDot(0, 31.6, .22, TPL_LACE); bmLine([[-.3, 32.6], [.3, 32.6]], .06, TPL_LACE); }
  g.restore();
}
function templeAir(t, k) { // the Temple from above: the square base deck, the upper tier, the crown's dome and its rosette ring; the guy lines
  const [X, Z] = TEMPLE_XZ, sv = sunVec(t), sa = shadowA(t), sq = (h, col) => brcPoly([[X - h, Z - h], [X + h, Z - h], [X + h, Z + h], [X - h, Z + h]], col);
  if (sa > .02) { g.save(); g.globalAlpha = sa * .9; brcPoly([[X - 13, Z - 13], [X + 13, Z - 13], [X + 13 + sv[0] * 30, Z + 13 + sv[1] * 30], [X - 13 + sv[0] * 30, Z + 13 + sv[1] * 30]], 'rgb(52,34,58)'); g.restore(); }
  for (const [a, b] of [[34, 0], [-34, 0], [0, 34], [0, -34]]) brcLine([[X, Z], [X + a, Z + b]], 1, 'rgba(30,24,28,.5)');
  sq(13.4, TPL_INK); sq(12.4, TPL_LACE); sq(11.6, TPL_INK); sq(8.6, '#2a2427'); sq(7.6, TPL_LACE); sq(7.0, TPL_INK);
  brcPoly(brcCircle(X, Z, 3, 14), TPL_LACE); brcPoly(brcCircle(X, Z, 2.3, 14), TPL_INK); brcPoly(brcCircle(X, Z, .8, 8), TPL_LACE);
  for (const [a, b] of [[-12.3, -12.3], [12.3, -12.3], [12.3, 12.3], [-12.3, 12.3], [-7.6, -7.6], [7.6, -7.6], [7.6, 7.6], [-7.6, 7.6]]) brcPoly(brcCircle(X + a, Z + b, 1.3, 8), TPL_INK);
}
function templeInto(t, list) {
  const [X, Z] = TEMPLE_XZ, p = P(X, 0, Z); // draft 21: drawn down to 3 m deep (the fly-out passes it close, it must not drop out of frame)
  if (p[2] >= 3) { const k = kAt(p); if (p[0] > -45 * k && p[0] < W + 45 * k)
    list.push({ z: p[2], draw: () => { const air = brcAirAmt(); if (air > 0) { g.save(); g.globalAlpha = air; templeAir(t, k); g.restore(); } if (air < 1) { g.save(); g.globalAlpha = 1 - air; templeBill(t, p, k); g.restore(); } },
      shadow: () => { if (brcAirAmt() < 1) shadowOf([[X - 13, 0, Z], [X + 13, 0, Z], [X - 8, 18, Z], [X + 8, 18, Z], [X, 36, Z]], t); } }); }
  const [PX, PZ] = PAGODA_XZ, q = P(PX, 0, PZ); // the pagoda, now an art piece on deep playa
  if (q[2] >= 3) { const k = kAt(q); if (q[0] > -45 * k && q[0] < W + 45 * k)
    list.push({ z: q[2], draw: () => { const air = brcAirAmt(); if (air > 0) { g.save(); g.globalAlpha = air; pagodaAir(t, k); g.restore(); } if (air < 1) { g.save(); g.globalAlpha = 1 - air; pagodaBill(t, q, k); g.restore(); } },
      shadow: () => { if (brcAirAmt() < 1) shadowOf([[PX - 22, 0, PZ], [PX + 22, 0, PZ], [PX - 16, 6, PZ], [PX + 16, 6, PZ], [PX, 32, PZ]], t); } }); }
}

// ---------- art on the open playa (draft 4): a few big pieces between the road and the Esplanade, none of them camps ----------
const BRC_ART = [[4, 330, 'tower'], [5.25, 450, 'sphere'], [7.5, 310, 'ring'], [8.25, 520, 'flower'], [6.75, 600, 'pyramid'], [2.5, 420, 'arches'], [9.75, 380, 'tower'], [11, 300, 'sphere'], [1, 450, 'ring'], [3.75, 600, 'flower'], [5.5, 190, 'arches'], [10.5, 560, 'pyramid']]
  .map(([a, r, kind], i) => { const [X, Z] = brcAt(a, r); return { X, Z, kind, i, s: .9 + .3 * rnd(i, 7) }; });
// draft 21: a few more out along the fly-out to the Temple (201-206), left and right of its line, each a different
// size and turn from the city's ones so no two read the same; deep playa, off the 12:00 promenade
[[268, -235, 'ring', 1.35], [338, -330, 'flower', 1.5], [262, -480, 'sphere', .75], [336, -575, 'pyramid', .7], [270, -640, 'arches', 1.25]].forEach(([X, Z, kind, s], j) => BRC_ART.push({ X, Z, kind, i: 12 + j, s, deep: true }));
function brcArtDraw(o, t, p, k) {
  const s = o.s; bmBegin(p[0], p[1], k * s, 1); const det = k > 4, wood = '#b38452', woodD = '#7a5634', steel = '#8d8f94', steelD = '#585a60';
  if (o.kind === 'tower') { // an open wooden lattice tower with a platform
    for (const sx of [-1, 1]) bmLine([[sx * 3.2, 0], [sx * 1.2, 15]], .35, sx < 0 ? wood : woodD);
    for (let j = 1; j < 6; j++) { const y = j * 2.6, hw = 3.2 - 2 * y / 15; bmLine([[-hw, y], [hw, y]], .22, woodD); if (det) bmLine([[-hw, y], [hw - .15, y + 2.6]], .12, woodD); }
    bmFill([[-2.2, 15], [2.2, 15], [2.2, 15.5], [-2.2, 15.5]], wood); bmFill([[-2, 15.5], [2, 15.5], [0, 17.8]], woodD);
  } else if (o.kind === 'sphere') { // a geodesic sphere on three legs
    for (const sx of [-1, 0, 1]) bmLine([[sx * 3.4, 0], [sx * .8, 5]], .25, steelD);
    bmDot(0, 8.5, 4.2, bmLG(-3, 11, 3, 6, ['#e8e2d4', steel, steelD])); if (det) { g.strokeStyle = 'rgba(40,40,46,.5)'; g.lineWidth = bmW(.08); g.beginPath(); for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI; g.ellipse(0, -8.5, 4.2 * Math.abs(Math.cos(a)), 4.2, 0, 0, TAU); } g.moveTo(-4.2, -8.5); g.lineTo(4.2, -8.5); g.stroke(); }
  } else if (o.kind === 'ring') { // a steel ring standing on edge, bolted to a footing
    g.strokeStyle = bmLG(-6, 12, 6, 0, ['#c9c4b8', steel, steelD]); g.lineWidth = bmW(.9); g.beginPath(); g.arc(0, -6.6, 6, 0, TAU); g.stroke(); bmFill([[-2.4, 0], [2.4, 0], [1.6, .9], [-1.6, .9]], steelD);
  } else if (o.kind === 'flower') { // a giant metal flower
    bmLine([[0, 0], [.6, 4], [0, 8.4]], .3, '#4f6a46'); bmFill([[.3, 3.6], [2.6, 4.8], [.5, 4.4]], '#5f7f52');
    for (let j = 0; j < 8; j++) { const a = j / 8 * TAU + .2; bmOval(Math.cos(a) * 1.8, 9 + Math.sin(a) * 1.8, 1.5, .7, j % 2 ? '#d27a3c' : '#c8452f', a); } bmDot(0, 9, 1, '#e8c04a');
  } else if (o.kind === 'pyramid') { // a wooden pyramid of open frames
    bmFill([[-7, 0], [7, 0], [0, 11]], bmLG(-6, 0, 6, 0, [wood, woodD])); if (det) { g.strokeStyle = 'rgba(60,40,24,.55)'; g.lineWidth = bmW(.15); g.beginPath(); for (let j = 1; j < 5; j++) { const y = j * 2.2, hw = 7 * (1 - y / 11); g.moveTo(-hw, -y); g.lineTo(hw, -y); } g.moveTo(0, 0); g.lineTo(0, -11); g.stroke(); }
    bmFill([[-1.4, 0], [1.4, 0], [1.4, 2.6], [-1.4, 2.6]], '#4a3626');
  } else { // three arches in a row
    for (let j = -1; j <= 1; j++) { g.strokeStyle = j ? woodD : wood; g.lineWidth = bmW(.6); g.beginPath(); g.moveTo(j * 6 - 2.4, 0); g.lineTo(j * 6 - 2.4, -4.5); g.arc(j * 6, -4.5, 2.4, Math.PI, TAU); g.lineTo(j * 6 + 2.4, 0); g.stroke(); }
  }
  g.restore();
}
const BRC_ART_H = { tower: 17, sphere: 12.7, ring: 12.6, flower: 10.8, pyramid: 11, arches: 7 };
function brcArtInto(t, list) {
  for (const o of BRC_ART) { const p = P(o.X, 0, o.Z); if (p[2] < (o.deep ? 2 : 8)) continue; const k = kAt(p), h = BRC_ART_H[o.kind] * o.s; if (p[0] < -10 * k - 100 || p[0] > W + 10 * k + 100 || h * k < 1) continue;
    list.push({ z: p[2], draw: () => brcArtDraw(o, t, p, k), shadow: () => shadowOf([[o.X - 5 * o.s, 0, o.Z], [o.X + 5 * o.s, 0, o.Z], [o.X, h, o.Z]], t) }); }
}

// ---------- the city in the scene list, and its lights ----------
function brcMaskA() { // after the city is drawn: keep the pixels round its lights, to find out later what was drawn over them
  const pts = BRC_F.pts; BRC_F.box = null; BRC_F.A = null; if (!pts.length) return;
  let x0 = W, y0 = H, x1 = 0, y1 = 0; for (let i = 0; i < pts.length; i += 5) { const r = pts[i + 2] * 2 + 2; x0 = Math.min(x0, pts[i] - r); x1 = Math.max(x1, pts[i] + r); y0 = Math.min(y0, pts[i + 1] - r); y1 = Math.max(y1, pts[i + 1] + r); }
  x0 = Math.max(0, Math.floor(x0)); y0 = Math.max(0, Math.floor(y0)); x1 = Math.min(W, Math.ceil(x1)); y1 = Math.min(H, Math.ceil(y1)); if (x1 - x0 < 1 || y1 - y0 < 1) return;
  BRC_F.box = [x0, y0, x1 - x0, y1 - y0]; BRC_F.A = g.getImageData(x0, y0, x1 - x0, y1 - y0).data;
}
function brcMaskB(t) { // after everything nearer is drawn: the mask is 1 where the city still shows
  if (BRC_F.t !== t || !BRC_F.box) return; const [x0, y0, w, h] = BRC_F.box, A = BRC_F.A, B = g.getImageData(x0, y0, w, h).data, M = brcMg.createImageData(w, h), m = M.data;
  for (let i = 0; i < A.length; i += 4) { const d = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]); m[i] = m[i + 1] = m[i + 2] = 255; m[i + 3] = d > 6 ? 0 : 255; }
  brcMg.clearRect(0, 0, W, H); brcMg.putImageData(M, 0, 0); BRC_F.masked = true;
}
function brcDots(c, pts, ox, oy, m) { m = m == null ? 1 : m; for (let i = 0; i < pts.length; i += 5) { const s = pts[i + 2] * 1.7; c.globalAlpha = clamp(pts[i + 4]) * m; c.drawImage(BRC_GLOW[pts[i + 3]], pts[i] - s - ox, pts[i + 1] - s - oy, 2 * s, 2 * s); } c.globalAlpha = 1; }
function brcEmissive(t) { // called once a frame after the grade (through lamp() for LAMPS[0])
  if (BRC_F.t !== t) return; const night = .6 + .4 * nightAmt(t);
  if (BRC_F.pts.length && BRC_F.box && BRC_F.masked) { const [x0, y0, w, h] = BRC_F.box; brcLg.setTransform(1, 0, 0, 1, 0, 0); brcLg.globalCompositeOperation = 'source-over'; brcLg.clearRect(0, 0, w + 2, h + 2);
    brcLg.globalCompositeOperation = 'lighter'; brcDots(brcLg, BRC_F.pts, x0, y0); brcLg.globalCompositeOperation = 'destination-in'; brcLg.drawImage(BRC_MC, 0, 0, w, h, 0, 0, w, h); brcLg.globalCompositeOperation = 'source-over';
    g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = night; g.drawImage(BRC_LC, 0, 0, w, h, x0, y0, w, h); g.restore(); } // screen, not lighter: warm points stay warm on the violet dusk
  if (BRC_F.air.length) { g.save(); g.globalCompositeOperation = 'screen'; brcDots(g, BRC_F.air, 0, 0, night); g.globalCompositeOperation = 'lighter'; brcDots(g, BRC_F.air, 0, 0, .45 * night * nightAmt(t)); g.restore(); } // from the air: screen keeps them warm, a light lighter pass lets them glow as night falls
  brcCarLights(t);
  // the Temple keeps a soft warm light inside it at night
  const tn = nightAmt(t); if (tn > 0) { const p = P(TEMPLE_XZ[0], 6, TEMPLE_XZ[1]); if (p[2] > 30 && p[0] > -200 && p[0] < W + 200) { const k = kAt(p), R = Math.max(18 * k, 6); g.save(); g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], R); rg.addColorStop(0, `rgba(255,190,120,${.35 * tn})`); rg.addColorStop(1, 'rgba(255,160,90,0)'); g.fillStyle = rg; g.fillRect(p[0] - R, p[1] - R, 2 * R, 2 * R); g.restore(); } }
}
function brcInto(t, list) {
  list.push({ z: 1e7, draw: () => { BRC_F.t = t; BRC_F.pts = []; BRC_F.air = []; BRC_F.box = null; BRC_F.masked = false; BRC_F.cars = 0;
    const ga = brcGroundAmt(), aa = brcAirAmt(), lights = t > 196;
    if (aa > 0) brcAir(t, aa, lights);
    if (ga > 0) { brcGround(t, ga, lights); if (BRC_F.pts.length) brcMaskA(); } } });
  list.push({ z: .31, draw: () => brcMaskB(t) }); // drawn after everything else in the list
  templeInto(t, list); brcArtInto(t, list);
}

// ---------- dust devils (called by installs.js) ----------
function dustDevil(X, Z, t, amt, seed) { // a spinning column of playa dust, with grit and a scrap of paper caught in it
  const p = P(X, 0, Z); if (p[2] < 2 || amt <= 0) return; const k = kAt(p), H2 = 14 * amt;
  g.save();
  for (let i = 0; i < 30; i++) { const u = i / 30, y = p[1] - u * H2 * k, w = (.5 + u * u * 4.2) * k, a = t * 6 + u * 9 + seed, cx = p[0] + Math.sin(a) * w * .35 + n1(seed, t + u) * k;
    g.fillStyle = `rgba(${200 + 20 * u},${168 + 18 * u},${120 + 16 * u},${.15 * amt * (1 - u * .55)})`; g.beginPath(); g.ellipse(cx, y, w, .55 * k, 0, 0, TAU); g.fill();
    if (i % 3 === 0) { g.fillStyle = `rgba(140,104,64,${.25 * amt})`; g.beginPath(); g.ellipse(cx - Math.cos(a) * w * .8, y, .5 * k, .14 * k, 0, 0, TAU); g.fill(); } }
  g.strokeStyle = `rgba(150,112,70,${.22 * amt})`; g.lineWidth = Math.max(1, .12 * k); for (let j = 0; j < 3; j++) { g.beginPath(); for (let i = 0; i <= 20; i++) { const u = i / 20, a = t * 6 + u * 9 + seed + j * 2.1, w = (.5 + u * u * 4.2) * k; const px = p[0] + Math.cos(a) * w + n1(seed, t + u) * k, py = p[1] - u * H2 * k; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  for (let i = 0; i < 3; i++) { const u = ((t * .3 + i / 3 + seed * .1) % 1) * .9 + .05, a = t * 6 + u * 9 + seed + i, w = (.5 + u * u * 4.2) * k; g.save(); g.translate(p[0] + Math.cos(a) * w * .9, p[1] - u * H2 * k); g.rotate(t * 4 + i); g.fillStyle = `rgba(236,230,214,${.8 * amt})`; g.fillRect(-.3 * k, -.2 * k, .6 * k, .4 * k); g.restore(); }
  g.restore();
}

// ---------- draft-2 entry points that render.js still calls: kept empty, everything now goes through playaInto ----------
const ELEPHANTS = [];
function elephantsInto(t, list) {}
function poorPerson(t, list) {}
function cops(t, list) {}
const CAMPS = [];
function camp(c, t) {}
const BIKES = [];
function bike(b, t) { return null; }

// scene hook (draft 3): pushes {z, draw, shadow} into list.

// ---------- the drum circle (Robin, after draft 6) ----------
// Hand drums play under the outro from about 3:25 on, so a small circle of djembe players sits on the playa beside where
// the board parks, the whole night. The camera does not go looking for them; it just passes them now and then.
const DRUM = { x: 282, z: 21, r: 2.6, t0: 205, beat: .6, phase: 206.47 }; // draft 9: in the Fire Conclave's ring, 30 m from the Man toward the board (it was beside the board). 100 bpm from the hand-drum onsets (no_vocals stem)
const DRUMMERS = [...Array(11)].map((_, i) => ({ a: i / 11 * TAU + .2, c: bmCostume(7300 + i * 13), i }));
// draft 11: the circle sits down while no camera sees its place (the latest such moment at or before 205: the aerial)
function bmDrumT0() { return bmBorn('drum', DRUM.t0, () => [DRUM.x, DRUM.z, 0], DRUM.r + .5, 1.3, 60); }
function drummer(d, t) {
  const X = DRUM.x + Math.cos(d.a) * DRUM.r, Z = DRUM.z + Math.sin(d.a) * DRUM.r, p = P(X, 0, Z); if (p[2] < 1.2 || p[0] < -200 || p[0] > W + 200) return null;
  return { z: p[2], draw: () => { const q = P(X, 0, Z), k = kAt(q); if (k < 1.2) return; const x = q[0], y = q[1], c = d.c;
    const n = (t - DRUM.phase) / (DRUM.beat / 2), step = Math.floor(n), f = n - step, hand = (step + d.i) % 2, hit = Math.max(0, 1 - f * 3); // a hit on every half beat, hands alternating
    const lift = (h) => (h === hand ? (1 - hit) * .22 : .12) * k;
    // the drum: a wooden goblet with a pale skin, between the knees
    const dx = x, dy = y; g.fillStyle = '#7b4a24'; g.beginPath(); g.moveTo(dx - .2 * k, dy - .62 * k); g.lineTo(dx + .2 * k, dy - .62 * k); g.lineTo(dx + .08 * k, dy - .3 * k); g.lineTo(dx + .14 * k, dy); g.lineTo(dx - .14 * k, dy); g.lineTo(dx - .08 * k, dy - .3 * k); g.fill();
    g.fillStyle = '#e9d9b4'; g.beginPath(); g.ellipse(dx, dy - .62 * k, .2 * k, .06 * k, 0, 0, TAU); g.fill();
    // sitting on the ground behind it: crossed legs, body, head, hat
    const bx = x, by = y - .05 * k; g.fillStyle = c.legs; g.beginPath(); g.ellipse(bx, by - .08 * k, .42 * k, .12 * k, 0, 0, TAU); g.fill();
    g.fillStyle = c.coat[0]; g.beginPath(); g.moveTo(bx - .24 * k, by - .15 * k); g.lineTo(bx + .24 * k, by - .15 * k); g.lineTo(bx + .19 * k, by - .78 * k); g.lineTo(bx - .19 * k, by - .78 * k); g.fill();
    g.fillStyle = c.skin; g.beginPath(); g.arc(bx, by - .92 * k + (hit * .02 * k), .12 * k, 0, TAU); g.fill();
    if (c.hat === 'top' || c.hat === 'fluff') { g.fillStyle = c.hat === 'top' ? '#1c1a1e' : c.trim; g.fillRect(bx - .1 * k, by - 1.18 * k, .2 * k, .17 * k); }
    // arms: shoulders to the drum skin, the hitting hand slaps down on the half beat
    g.strokeStyle = c.coat[1]; g.lineWidth = Math.max(1, .07 * k); g.lineCap = 'round';
    for (const h of [0, 1]) { const sx = bx + (h ? .17 : -.17) * k, hx = dx + (h ? .09 : -.09) * k, hy = dy - .64 * k - lift(h); g.beginPath(); g.moveTo(sx, by - .7 * k); g.quadraticCurveTo(sx + (h ? .1 : -.1) * k, by - .5 * k, hx, hy); g.stroke(); g.fillStyle = c.skin; g.beginPath(); g.arc(hx, hy, .045 * k, 0, TAU); g.fill(); }
  }, shadow: () => shadowStick(X, 0, 1.1, Z, .5, t) };
}

// after the night grade: the lantern pool and the drummers again at part strength, so they read at night (render.js)
function drumGlow(t) {
  octGlow(t); // the octopus art car's fire (draft 8) rides on this after-the-grade call
  if (t < bmDrumT0()) return; const n = ease(t, 199, 216); if (n <= 0) return; const pit = P(DRUM.x, 0, DRUM.z); if (pit[2] < 1.2) return; const k = kAt(pit); if (k < 1.2) return;
  g.save(); g.globalCompositeOperation = 'lighter'; const R = 4 * k, rg = g.createRadialGradient(pit[0], pit[1] - .3 * k, 0, pit[0], pit[1] - .3 * k, R); rg.addColorStop(0, `rgba(255,190,110,${.5 * n})`); rg.addColorStop(1, 'rgba(255,140,60,0)'); g.fillStyle = rg; g.fillRect(pit[0] - R, pit[1] - R, 2 * R, 2 * R); g.restore();
  const l = []; for (const d of DRUMMERS) { const o = drummer(d, t); if (o) l.push(o); } l.sort((a, b) => b.z - a.z);
  g.save(); g.globalAlpha = .62 * n; for (const o of l) o.draw(); g.restore();
}
function drumCircleInto(t, list) {
  if (t < bmDrumT0()) return;
  const pit = P(DRUM.x, 0, DRUM.z); if (pit[2] > 1.2) list.push({ z: pit[2] + .01, draw: () => { const k = kAt(pit); if (k < 1.2) return; // a lantern on a rug in the middle
    g.fillStyle = '#8c2a28'; g.beginPath(); g.ellipse(pit[0], pit[1], 1.2 * k, .35 * k, 0, 0, TAU); g.fill(); g.fillStyle = '#e8b23a'; g.fillRect(pit[0] - .08 * k, pit[1] - .35 * k, .16 * k, .3 * k);
    const rg = g.createRadialGradient(pit[0], pit[1] - .2 * k, 0, pit[0], pit[1] - .2 * k, 1.6 * k); rg.addColorStop(0, 'rgba(255,214,140,.55)'); rg.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = rg; g.fillRect(pit[0] - 1.6 * k, pit[1] - 1.8 * k, 3.2 * k, 3.2 * k); } });
  for (const d of DRUMMERS) { const o = drummer(d, t); if (o) { list.push(o); ACT.note('playa:drum:' + d.i, DRUM.x + Math.cos(d.a) * DRUM.r, DRUM.z + Math.sin(d.a) * DRUM.r, .35, { h: 1.2, group: 'scene' }); } }
}

// ---------- the fire-breathing octopus art car (Robin's notes on draft 7) ----------
// An homage to a real scrap-metal octopus art car, drawn from Robin's photos; no name on screen. About 8 m tall: a domed,
// riveted pewter head with a crown of brass spikes and a ring on top, a row of four goggle eyes (two big brass-rimmed ones
// in the middle, smaller ones out at the sides) and a shark-tooth mouth under each big eye; below it an open steel-rod
// cage; eight tentacles of segmented pipe that curl down, out and up, each ending in an upturned flame cannon with a small
// ring. Each tentacle is cranked up and down on its own rhythm (Robin: not in unison), and fires near the top of its lift.
// The vehicle is a long low chassis of hammered plate and kitchenware, an anglerfish head at the front with spiked teeth
// and a lure, a spiny fin at the back, riders on the deck. By day it rolls right to left behind the first instrumental's
// parade; at night it is parked in the art-car ring behind the burn crowd and fires on the beat.
// Fire is drawn after the grade (drumGlow below), masked by whatever nearer was drawn over the car, so it lights up the
// night without showing through the crowd. Flash rule: the hot cores stay at .38 alpha, bursts land on beats (about
// 100 bpm) and swell and fade over most of a second, and the car is never near the lens.
const OCT = {
  day: { t0: 56.5, t1: 67, X: 82, Z0: 12, v: 2.2, tr: 59 },  // crosses the board's road 18 m ahead of it, far side to near, at playa speed (5 mph)
  park: (() => { const d = brcDir(4.4), r = 65; return { X: MAN.x + d[0] * r, Z: MAN.z + d[1] * r, hx: -d[1], hz: d[0], t0: 150 }; })(), // 4:30, just inside the art-car ring
  VOTES: [220.65, 230.25, 239.93, 249.47],
  ARMS_UP: 215.97,
  X0: -.5, // the octopus stands on the deck a little behind the chassis centre (local x, front = +x)
};
// the beats: a steady 100 bpm grid through the instrumental, and the tracked beats through dusk and the burn (song.wav)
const OCT_BEATS = (() => { const out = []; for (let b = 58.18; b < 77; b += .59978) out.push(b);
  return out.concat([194.37, 194.98, 195.58, 196.19, 196.79, 197.37, 197.97, 198.58, 199.18, 199.76, 200.36, 200.97, 201.57, 202.18, 202.76, 203.36, 203.96, 204.57, 205.17, 205.78, 206.38, 206.98, 207.56, 208.17, 208.77, 209.37, 209.95, 210.58, 211.16, 211.77, 212.37, 212.97, 213.58, 214.18, 214.76, 215.37, 215.97, 216.57, 217.18, 217.78, 218.36, 218.96, 219.57, 220.17, 220.78, 221.36, 221.96, 222.56, 223.17, 223.77, 224.37, 224.98, 225.56, 226.05, 226.63, 227.21, 227.81, 228.41, 229.02, 229.62, 230.23, 230.83, 231.43, 232.04, 232.62, 233.2, 233.82, 234.43, 235.03, 235.61, 236.22, 236.82, 237.42, 238, 238.63, 239.24, 239.82, 240.42, 241.16, 241.79, 242.37, 242.97, 243.58, 244.18, 244.78, 245.39, 245.97, 246.57, 247.18, 247.78, 248.36, 248.96, 249.57, 250.17, 250.78, 251.38, 251.98, 252.59, 253.17, 253.77, 254.37, 254.98, 255.58]); })();
const OCT_I0 = OCT_BEATS.indexOf(215.97); // the arms-up beat; every other beat from it is the strong one
// eight tentacles: side, layer (0 behind the cage, 1 round it, 2 hanging in front), shoulder, length, width, start angle,
// droop, tip angle (radians, right-hand side; the left side mirrors), and each its own crank: period and phase
const OCT_ARMS = [
  [-1, 0, .55, 5.35, 3.9, .66, .1, 1.0, 1.2], [1, 0, .55, 5.35, 3.9, .66, .1, 1.0, 1.2],
  [-1, 1, .95, 5.2, 4.8, .86, -.3, 1.25, 1.35], [1, 1, .95, 5.2, 4.8, .86, -.3, 1.25, 1.35],
  [-1, 1, 1.0, 5.0, 4.0, .78, -.55, .95, 1.5], [1, 1, 1.0, 5.0, 4.0, .78, -.55, .95, 1.5],
  [-1, 2, .5, 4.95, 3.3, .68, -1.5, 0, 1.2], [1, 2, .5, 4.95, 3.3, .68, -1.5, 0, 1.2],
].map(([s, layer, sx, sy, L, w0, a0, dr, tip], j) => ({ j, s, layer, sx, sy, L, w0, a0, dr, tip, per: [4.6, 3.7, 5.3, 4.1, 3.3, 5.9, 4.9, 3.9][j], ph: rnd(j, 51) * TAU }));
function octLift(o, t) { // a smooth crank, a little irregular (a hand on the lever), dwelling at the top and the bottom; never runs backward
  const ph = TAU * t / o.per + o.ph + .7 * Math.sin(TAU * t / (o.per * 2.9) + o.j * 1.3);
  return smooth(.5 - .5 * Math.cos(ph));
}
function octArm(o, lift) { // the tentacle's centre line and widths in local metres (x from the octopus axis), and its tip direction
  const N = 9, pts = [], ws = [], a0 = o.a0 + .5 * lift, dr = o.dr * (1 - .35 * lift), tip = o.tip - .1 * lift, up = tip - a0 + dr, ds = o.L / N;
  let x = o.s * o.sx, y = o.sy;
  for (let i = 0; i <= N; i++) { const u = i / N; pts.push([x, y]); ws.push(o.w0 * (1 - .55 * u));
    const a = a0 - dr * Math.sin(Math.min(u / .4, 1) * Math.PI / 2) + up * smooth((u - .3) / .7); x += o.s * Math.cos(a) * ds; y += Math.sin(a) * ds; }
  const dir = [o.s * Math.cos(tip), Math.sin(tip)], e = pts[N]; return { pts, ws, dir, noz: [e[0] + dir[0] * .95, e[1] + dir[1] * .95] };
}
// Draft 9 (Robin: "make the octopus closer at night, roll by in the background between the table and the man"): it waits
// at its 4:30 spot until the aerial has climbed, drives in while the camera is kilometres up, and from 211.5 rolls at a
// crawl right to left along z = 30, 15 m in front of the Man and to the right of him from the board's cameras, so it
// never stands between them and the Man, the drum circle or the front row. As the fire takes hold (226.5) it turns away,
// out past the Man's right side toward 4:00 (the fire is drawn over anything in front of it, so it must not linger there).
const OCT_N = { t0: 203.2, t1: 211.5, P1: [320, 30], turn: 226.5 }; // turn: it heads off before the Man's fire grows wide enough to swallow it on screen
const octAng = (a, b, s) => { let d = b - a; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return a + d * s; };
function octNight(t) { // the night path: {X, Z, hx, hz, sp (metres driven, for the wheels), mv (moving)}
  const P0 = [OCT.park.X, OCT.park.Z], th00 = Math.atan2(OCT.park.hz, OCT.park.hx); if (t < OCT_N.t0) return { X: P0[0], Z: P0[1], hx: OCT.park.hx, hz: OCT.park.hz, sp: 0, mv: false };
  const dx = OCT_N.P1[0] - P0[0], dz = OCT_N.P1[1] - P0[1], L = Math.hypot(dx, dz), th0 = Math.atan2(dz, dx);
  if (t < OCT_N.t1) { const u = smooth((t - OCT_N.t0) / (OCT_N.t1 - OCT_N.t0)), th = octAng(th00, th0, smooth(u * 4)); return { X: P0[0] + dx * u, Z: P0[1] + dz * u, hx: Math.cos(th), hz: Math.sin(th), sp: L * u, mv: true }; }
  const v = (s) => (1 - smooth((s - 255) / 3)) * (s < 213 ? .45 * smooth((s - OCT_N.t1) / (213 - OCT_N.t1)) : s < OCT_N.turn ? .45 : .45 + 2.15 * smooth((s - OCT_N.turn) / 3.5)); // draft 11 merge: it rolls to a stop by 258 and stays lit to the black
  const th = (s) => s < 213 ? octAng(th0, Math.PI, smooth((s - OCT_N.t1) / (213 - OCT_N.t1))) : s < OCT_N.turn ? Math.PI : lerp(Math.PI, .55, smooth((s - OCT_N.turn) / 5)); // the turn goes through +z: away from the lens
  let X = OCT_N.P1[0], Z = OCT_N.P1[1], sp = L; const dt = .05;
  for (let s = OCT_N.t1; s < t; s += dt) { const h = Math.min(dt, t - s), m = s + h / 2, a = th(m), d = v(m) * h; X += Math.cos(a) * d; Z += Math.sin(a) * d; sp += d; }
  const a = th(t); return { X, Z, hx: Math.cos(a), hz: Math.sin(a), sp, mv: v(t) > .2 };
}
function octPose(t) { // where it is and which way it is heading, or null
  // draft 11: by day it drives on in and out of shot round its window; at the end it drives off along its night path
  // until no camera sees it (no fade), or on to the black
  const dayAt = (s) => { const Z = OCT.day.Z0 - OCT.day.v * (s - OCT.day.tr); return [bmAvoid(Z, OCT.day.X, 5.5, bmStatic().map((o) => ({ X: o.Z, Z: o.X, r: o.r }))), Z, 0]; }; // it swings round the playa's art on its way across
  if (t > OCT.day.t0 - 30 && t < OCT.day.t1 + 30 && t >= bmBorn('octday', OCT.day.t0, dayAt, 5.5, 8.5, 30) && t <= bmGone('octdaye', OCT.day.t1, dayAt, 5.5, 8.5, 30)) return { X: dayAt(t)[0], Z: dayAt(t)[1], hx: 0, hz: -1, sp: OCT.day.v * t, a: 1, night: 0, mv: true };
  if (t >= OCT.park.t0) { const a = 1; const n = octNight(t); return { X: n.X, Z: n.Z, hx: n.hx, hz: n.hz, sp: n.sp, mv: n.mv, a, night: typeof nightAmt === 'function' ? nightAmt(t) : 0 }; }
  return null;
}
// ---------- drawing (local metres, y up, front = +x; bmBegin flips it) ----------
const OCT_STEEL0 = ['#efede6', '#b7b8b5', '#6b6d71'], OCT_WARM = ['#ffe2b0', '#d8a070', '#6a4232'], OCT_BRASS = ['#f6e2a0', '#c99a42', '#6e4c18'];
let OCT_STEEL = OCT_STEEL0;
const octHex = (a) => '#' + a.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
function octSetPal(w) { OCT_STEEL = w > 0 ? OCT_STEEL0.map((c, i) => octHex(mix(hex(c), hex(OCT_WARM[i]), w))) : OCT_STEEL0; } // by night the metal takes the firelight
function octPipe(arm, f, det) { // segmented duct: tapered sections of hammered plate, a dark collar at each joint, a brass band now and then
  const { pts, ws } = arm, n = pts.length, cols = OCT_STEEL.map((c) => bmShade(c, f)), alt = OCT_STEEL.map((c) => bmShade(c, f * .93));
  for (let i = 1; i < n; i++) bmDot(pts[i][0], pts[i][1], ws[i] / 2, cols[1]);
  for (let i = 0; i < n - 1; i++) { const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; let nx = -dy / L, ny = dx / L; if (ny < 0) { nx = -nx; ny = -ny; } // n points up: the lit side
    const w0 = ws[i] / 2, w1 = ws[i + 1] / 2, c = i % 2 ? alt : cols;
    bmFill([[a[0] + nx * w0, a[1] + ny * w0], [b[0] + nx * w1, b[1] + ny * w1], [b[0] - nx * w1, b[1] - ny * w1], [a[0] - nx * w0, a[1] - ny * w0]], bmLG(a[0] + nx * w0, a[1] + ny * w0, a[0] - nx * w0, a[1] - ny * w0, [c[0], c[1], c[2]]));
    if (det) for (const u of [.3, .7]) bmDot(lerp(a[0], b[0], u) + nx * w0 * .45, lerp(a[1], b[1], u) + ny * w0 * .45, .025, 'rgba(70,70,74,.7)'); // rivets
    bmLine([[b[0] + nx * w1 * 1.06, b[1] + ny * w1 * 1.06], [b[0] - nx * w1 * 1.06, b[1] - ny * w1 * 1.06]], i % 4 === 2 ? .09 : .055, i % 4 === 2 ? bmShade('#b8913e', f) : bmShade('#505156', f)); }
  const e = pts[n - 1]; bmLine([e, arm.noz], .13, bmShade('#8d8f93', f)); bmLine([[lerp(e[0], arm.noz[0], .45), lerp(e[1], arm.noz[1], .45)], [lerp(e[0], arm.noz[0], .55), lerp(e[1], arm.noz[1], .55)]], .19, bmShade('#45464b', f)); // the cannon and its valve
  const rc = [arm.noz[0] + arm.dir[0] * .12, arm.noz[1] + arm.dir[1] * .12]; g.beginPath(); g.arc(rc[0], -rc[1], .11, 0, TAU); g.strokeStyle = bmShade('#3a3a3e', f); g.lineWidth = bmW(.04); g.stroke(); // the little ring on top
}
function octCage(x0, front, det) { // the open steel-rod cage under the head; front = the near half
  const y0 = 1.2, y1 = 5.35, hw = (y) => 1.3 + .22 * Math.sin(Math.PI * Math.pow(clamp((y - y0) / (y1 - y0)), .8)), col = front ? '#4b4d53' : '#3a3b40', lw = front ? .055 : .045;
  g.strokeStyle = col; g.lineWidth = bmW(lw); g.lineCap = 'round';
  const RINGS = [1.75, 2.55, 3.35, 4.15, 4.9], TH = [...Array(10)].map((_, i) => i / 10 * TAU + .3);
  for (const y of RINGS) { const r = hw(y); g.beginPath(); g.ellipse(x0, -y, r, r * .2, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); g.stroke(); }
  for (const th of TH) { if ((Math.sin(th) > 0) !== front) continue; g.beginPath(); for (let i = 0; i <= 10; i++) { const y = lerp(y0, y1, i / 10), r = hw(y), px = x0 + r * Math.cos(th), py = y - r * .2 * Math.sin(th); i ? g.lineTo(px, -py) : g.moveTo(px, -py); } g.stroke(); }
  if (det || front) for (let ri = 0; ri < RINGS.length - 1; ri++) for (let i = 0; i < TH.length; i++) { const a = TH[i], b = TH[(i + 1) % TH.length]; if ((Math.sin(a) > 0) !== front || (Math.sin(b) > 0) !== front) continue;
    const ya = RINGS[ri], yb = RINGS[ri + 1], fl = (ri + i) % 2, pa = [x0 + hw(ya) * Math.cos(fl ? a : b), ya - hw(ya) * .2 * Math.sin(fl ? a : b)], pb = [x0 + hw(yb) * Math.cos(fl ? b : a), yb - hw(yb) * .2 * Math.sin(fl ? b : a)];
    g.beginPath(); g.moveTo(pa[0], -pa[1]); g.lineTo(pb[0], -pb[1]); g.lineWidth = bmW(lw * .7); g.stroke(); }
}
function octHead(x0, det) {
  const cy = 6.75, rx = 1.32, ry = 1.18;
  // the dome and the face below it, hammered pewter lit from the upper left
  g.beginPath(); g.ellipse(x0, -cy, rx, ry, 0, Math.PI, TAU); g.lineTo(x0 + rx * .98, -(cy - .32)); g.quadraticCurveTo(x0 + rx * .9, -5.75, x0 + .78, -5.5); g.lineTo(x0 - .78, -5.5); g.quadraticCurveTo(x0 - rx * .9, -5.75, x0 - rx * .98, -(cy - .32)); g.closePath();
  const hg = g.createRadialGradient(x0 - .5, -(cy + .55), .1, x0, -cy, 2.1); hg.addColorStop(0, OCT_STEEL[0]); hg.addColorStop(.5, OCT_STEEL[1]); hg.addColorStop(1, OCT_STEEL[2]); g.fillStyle = hg; g.fill();
  if (det) { // plate seams, rivets and a few odd patches
    g.save(); g.clip(); g.strokeStyle = 'rgba(80,82,88,.55)'; g.lineWidth = bmW(.03);
    for (const m of [-.66, -.33, 0, .33, .66]) { g.beginPath(); g.ellipse(x0, -cy, Math.abs(m) * rx + .01, ry, 0, m < 0 ? Math.PI / 2 : -Math.PI / 2, m < 0 ? Math.PI * 1.5 : Math.PI / 2); g.stroke(); }
    for (const y of [7.35, 6.3]) { g.beginPath(); g.moveTo(x0 - rx, -y); g.quadraticCurveTo(x0, -(y - .12), x0 + rx, -y); g.stroke(); }
    for (let i = 0; i < 7; i++) { const px = x0 + (rnd(i, 61) - .5) * 2, py = 6.1 + rnd(i, 62) * 1.6; bmFill([[px, py], [px + .32, py + .05], [px + .3, py + .3], [px - .02, py + .26]], i % 2 ? 'rgba(255,250,236,.16)' : 'rgba(40,40,46,.14)'); }
    for (let i = 0; i < 26; i++) { const a = Math.PI + (i + .5) / 26 * Math.PI; bmDot(x0 + Math.cos(a) * rx * .9, cy - Math.sin(a) * ry * .9, .028, 'rgba(70,70,76,.75)'); }
    g.restore(); }
  // the crown: small brass spikes round the top, a cap, a stem and the ring
  for (let i = 0; i < 9; i++) { const lx = (i - 4) * .13, by = cy + ry * Math.sqrt(1 - (lx / rx) ** 2) - .04;
    bmFill([[x0 + lx - .065, by], [x0 + lx + .065, by], [x0 + lx * 1.35, by + .27 - Math.abs(i - 4) * .025]], i % 2 ? OCT_BRASS[1] : '#a87e30'); }
  bmOval(x0, cy + ry - .03, .34, .14, bmLG(x0 - .3, 0, x0 + .3, 0, OCT_BRASS)); bmLine([[x0, cy + ry + .05], [x0, cy + ry + .36]], .07, '#55565b');
  g.beginPath(); g.arc(x0, -(cy + ry + .5), .14, 0, TAU); g.strokeStyle = '#3a3b40'; g.lineWidth = bmW(.05); g.stroke();
  // a collar of spikes under the jaw
  for (let i = 0; i < 9; i++) { const px = x0 - .9 + i * .225; bmFill([[px - .07, 5.55], [px + .07, 5.55], [px + .01, 5.28]], '#55575c'); }
  // the four goggle eyes
  for (const s of [-1, 1]) { const ex = x0 + s * 1.3, ey = 6.72; // the small ones stick out at the sides on short barrels
    bmFill([[ex - s * .14, ey - .16], [ex + s * .2, ey - .16], [ex + s * .2, ey + .16], [ex - s * .14, ey + .16]], bmLG(0, ey + .16, 0, ey - .16, OCT_STEEL)); bmDot(ex + s * .24, ey, .16, bmLG(ex, ey + .16, ex + s * .3, ey - .16, OCT_BRASS)); }
  for (const s of [-1, 1]) { const ex = x0 + s * .55, ey = 6.95;
    bmDot(ex, ey, .4, '#2a2a2e'); g.beginPath(); g.arc(ex, -ey, .38, 0, TAU); g.strokeStyle = '#c19a48'; g.lineWidth = bmW(.09); g.stroke();
    bmDot(ex + s * .03, ey - .02, .25, bmLG(ex - .2, ey + .2, ex + .2, ey - .2, OCT_BRASS)); bmDot(ex - .08, ey + .09, .06, 'rgba(255,252,240,.85)'); }
  // a shark-tooth mouth under each big eye, and the ridge between them
  bmLine([[x0, 6.62], [x0, 5.85]], .09, '#9a9c9f');
  for (const s of [-1, 1]) { const mx = x0 + s * .5, top = 6.42, bot = 5.82;
    bmFill([[mx - .4, top], [mx + .4, top], [mx + .33, 5.98], [mx, bot], [mx - .33, 5.98]], '#1d1617');
    for (let i = 0; i < 5; i++) { const tx = mx - .32 + i * .16; bmFill([[tx - .07, top - .01], [tx + .07, top - .01], [tx, top - .24]], '#ece8de'); }
    for (let i = 0; i < 4; i++) { const tx = mx - .22 + i * .15, ty = lerp(5.97, bot + .03, 1 - Math.abs(tx - mx) / .36); bmFill([[tx - .06, ty], [tx + .06, ty], [tx, ty + .2]], '#ddd8cc'); }
    bmPath([[mx - .42, top + .02], [mx + .42, top + .02], [mx + .35, 5.97], [mx, bot - .03], [mx - .35, 5.97]]); g.closePath(); g.strokeStyle = '#8e9094'; g.lineWidth = bmW(.05); g.stroke(); }
}
function octChassis(t, sp, det, moving) { // the vehicle, side on: hammered plate and kitchenware, the anglerfish at the front, the fin at the back
  const ang = -sp / .42;
  if (moving) for (let i = 0; i < 6; i++) { const u = ((t * .9 + i / 6) % 1); bmOval(-4.6 - u * 3.2, .25 + u * .5, .4 + u * 1.1, .2 + u * .45, `rgba(214,184,140,${.22 * (1 - u)})`); } // dust off the back wheel
  // the fin: spiny ribs fanned out behind, a scalloped steel web between them
  const fb = [-4.2, 1.35], tips = [[-5.6, 2.55], [-6.0, 2.0], [-6.05, 1.45], [-5.75, .9], [-5.2, .55]];
  bmPath([[-4.25, 1.95], ...tips, [-4.3, .75]]); g.closePath(); g.fillStyle = bmLG(-6, 2.5, -4.2, .8, ['#d6d6d2', '#9fa0a0', '#66686c']); g.fill();
  for (const tp of tips) bmLine([fb, [tp[0] - .12, tp[1] + (tp[1] - fb[1]) * .08]], .065, '#46474c');
  // wheels and fenders
  for (const wx of [1.5, -2.8]) { bmDot(wx, .42, .42, '#17130f'); bmDot(wx, .42, .25, bmLG(wx - .2, .62, wx + .2, .22, OCT_STEEL)); if (det) for (let i = 0; i < 5; i++) { const a = ang + i / 5 * TAU; bmLine([[wx, .42], [wx + Math.cos(a) * .22, .42 + Math.sin(a) * .22]], .03, '#55575c'); } bmDot(wx, .42, .06, '#3a3b40');
    g.beginPath(); g.arc(wx, -.42, .56, Math.PI * 1.05, Math.PI * 1.95); g.strokeStyle = '#8b8d90'; g.lineWidth = bmW(.1); g.stroke(); }
  // the body: plate panels, a grille, rows of pot lids and hubcaps
  bmPath([[-4.45, .5], [2.05, .5], [2.25, 1.18], [-4.35, 1.22]]); g.closePath(); g.fillStyle = bmLG(0, 1.22, 0, .5, ['#e2e1db', '#aeafac', '#6f7175']); g.fill();
  if (det) { g.strokeStyle = 'rgba(70,72,78,.55)'; g.lineWidth = bmW(.025); for (const sx of [-3.4, -2.2, -.2, .9]) { g.beginPath(); g.moveTo(sx, -.52); g.lineTo(sx, -1.2); g.stroke(); }
    for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-1.95 + i * .19, -.62); g.lineTo(-1.95 + i * .19, -1.1); g.stroke(); } }
  for (let i = 0; i < 11; i++) { const lx = -4.1 + i * .58 + (i % 3) * .05, r = .13 + .1 * rnd(i, 71); if (lx > -2.05 && lx < -.15) continue; bmDot(lx, .86 + (i % 2) * .08, r, bmLG(lx - r, .86 + r, lx + r, .86 - r, ['#f4f3ee', '#a9aaa8', '#77797d'])); if (det) bmDot(lx, .86 + (i % 2) * .08, r * .25, '#5b5d61'); }
  bmLine([[-4.35, 1.25], [1.7, 1.25]], .08, '#4a4b50'); // the deck edge
  // rails and a bench at the back, riders, the driver at the front, a speaker stack
  for (const rx of [-4.25, -3.65, -3.05, -2.45]) bmLine([[rx, 1.25], [rx, 2.0]], .04, '#55565b'); bmLine([[-4.25, 2.0], [-2.45, 2.0]], .05, '#55565b');
  bmSitter(-3.85, 1.27, '#2f6fb5', '#1c1a1e', t, 11, false); bmSitter(-3.25, 1.27, '#e0533a', null, t, 12, true); bmSitter(-2.75, 1.27, '#e8b23a', '#f2ede0', t, 13, false);
  bmFill([[-1.95, 1.25], [-1.45, 1.25], [-1.45, 2.05], [-1.95, 2.05]], '#1c1a1e'); bmDot(-1.7, 1.48, .14, '#3a3640'); bmDot(-1.7, 1.83, .1, '#3a3640');
  bmSitter(1.25, 1.24, '#3a3442', '#e2c88a', t, 14, false); bmLine([[1.65, 1.25], [1.85, 1.75]], .05, 'rgba(160,190,210,.8)'); // the driver behind a little windscreen
  // the anglerfish: a big jaw of riveted plate, spiked teeth, bubble scales along its back, an eye and the lure
  bmPath([[1.8, 2.05], [2.7, 2.3], [3.6, 2.05], [4.6, 1.4], [5.2, .98], [4.75, .82], [2.0, .78]]); g.closePath(); g.fillStyle = bmLG(3, 2.3, 3, .8, ['#ecebe4', '#b2b3b0', '#727478']); g.fill();
  bmPath([[2.0, .74], [4.9, .62], [5.55, .45], [5.4, .22], [2.3, .3]]); g.closePath(); g.fillStyle = bmLG(3, .74, 3, .22, ['#c6c6c2', '#7c7e82']); g.fill();
  for (let i = 0; i < 9; i++) { const tx = 2.5 + i * .3; bmFill([[tx - .1, .82 - (tx - 2.5) * .03], [tx + .1, .82 - (tx - 2.5) * .03], [tx, .55 - (tx - 2.5) * .03]], '#e9e5da'); } // upper teeth, down
  for (let i = 0; i < 8; i++) { const tx = 4.35 + i * .15; bmFill([[tx - .06, .58 - (tx - 4.35) * .1], [tx + .06, .58 - (tx - 4.35) * .1], [tx + .03, .98 - (tx - 4.35) * .05]], '#d9d5ca'); } // the row of spikes up at the jaw's tip
  if (det) for (let i = 0; i < 5; i++) { const bx = 2.45 + i * .38, by = 2.22 - Math.max(0, i - 1.5) * .17; bmDot(bx, by, .15, bmLG(bx - .15, by + .15, bx + .15, by - .15, ['#f7f6f1', '#a9aaa8'])); }
  bmDot(3.35, 1.62, .17, bmLG(3.2, 1.78, 3.5, 1.46, OCT_BRASS)); bmDot(3.38, 1.6, .07, '#1c1a1e');
  g.beginPath(); g.moveTo(2.55, -2.25); g.bezierCurveTo(2.9, -3.5, 4.1, -3.55, 4.35, -2.75); g.strokeStyle = '#77797d'; g.lineWidth = bmW(.07); g.stroke(); bmDot(4.37, 2.62, .14, bmLG(4.25, 2.75, 4.5, 2.5, OCT_BRASS));
}
function octDraw(st, t, p, k, d, sq, lit) {
  const det = k > 12, x0 = OCT.X0 * sq; if (!lit) octSetPal(.55 * st.night);
  bmBegin(p[0], p[1], k, d); if (st.a < 1) g.globalAlpha = st.a;
  g.save(); g.scale(sq, 1); octChassis(t, st.sp, det, st.mv); g.restore();
  const arms = OCT_ARMS.map((o) => octArm(o, octLift(o, t)));
  g.save(); g.translate(x0, 0);
  OCT_ARMS.forEach((o, j) => { if (o.layer === 0) octPipe(arms[j], .72, det); });
  octCage(0, false, det);
  for (let i = 0; i < 9; i++) { const y = 1.35 + i * .45, w = .32 + .12 * Math.sin(i * 1.7); bmOval(0, y, w, w * .3, i % 3 ? bmShade('#b9bab7', .8) : '#a98c4c'); } // a column of stacked pots up the middle
  for (const sx of [-.95, .8]) { bmFill([[sx - .26, 2.95], [sx + .26, 2.95], [sx + .26, 3.7], [sx - .26, 3.7]], '#1c1a1e'); bmDot(sx, 3.18, .15, '#3a3640'); bmDot(sx, 3.5, .08, '#3a3640'); } // speakers in the cage
  g.save(); g.translate(.35, -1.25); g.scale(1.45, 1.45); bmSitter(0, 0, '#7a3c8c', '#1c1a1e', t, 15, true); g.restore(); // a rider standing in the cage
  octCage(0, true, det);
  OCT_ARMS.forEach((o, j) => { if (o.layer === 1) octPipe(arms[j], 1, det); });
  OCT_ARMS.forEach((o, j) => { if (o.layer === 2) octPipe(arms[j], .94, det); });
  octHead(0, det);
  g.restore(); g.restore();
  return arms;
}
// ---------- the fire ----------
function octFires(o, b, show) { // does nozzle o fire on beat b: near the top of its lift, on the beat closest to the peak (two beats at full show)
  const l0 = octLift(o, b), lp = octLift(o, b - .6), ln = octLift(o, b + .6);
  if (l0 < (show >= 1 ? .8 : .86)) return false;
  return (l0 >= lp && l0 >= ln) || (show >= 1 && ln > l0 && l0 > .9);
}
function octShow(b) { // how much fire a beat gets: day bursts are few and small; at night it is a show, held off the votes
  if (b < 80) return b > 59.5 && b < 74.2 && !(b > 64.3 && b < 66.9) ? .4 : 0; // not while the sax rider comes in (65.0)
  if (b < 202) return b > 197.5 && b < 201.2 ? .4 : 0; // the golden wide: a puff or two
  for (const v of OCT.VOTES) if (Math.abs(b - v) < .75) return 0;
  return b < 213.4 ? 0 : b < 215.8 ? .6 : b < 220.3 ? 1 : b < 254.6 ? .8 : 0;
}
function octBursts(t) { // every burst still alive at t: {j (8 = the head), tb, size (m), open (s)}
  const out = [];
  for (let i = 0; i < OCT_BEATS.length; i++) { const b = OCT_BEATS[i]; if (b > t) break; if (b < t - 1.3) continue; const show = octShow(b); if (!show) continue;
    const day = show < .5, strong = i >= OCT_I0 ? (i - OCT_I0) % 2 === 0 : false;
    for (const o of OCT_ARMS) { if (!octFires(o, b, show)) continue; if (day && rnd(o.j, i, 57) > .55) continue; if (show < 1 && show >= .5 && !strong && rnd(o.j, i, 58) > .5) continue;
      out.push({ j: o.j, tb: b, size: day ? 2.1 : 3.6 + .9 * rnd(o.j, i, 59), open: day ? .2 : .3 }); }
    const head = Math.abs(b - OCT.ARMS_UP) < .05 || (show >= 1 && strong && (i - OCT_I0) % 4 === 0) || (show >= .8 && show < 1 && (i - OCT_I0) % 8 === 4) || (day && i % 9 === 4);
    if (head) out.push({ j: 8, tb: b, size: day ? 2.8 : Math.abs(b - OCT.ARMS_UP) < .05 ? 7 : 5.6, open: day ? .22 : .38 });
  }
  return out;
}
function octFlame(x, y, dx, dy, k, u, size, open, seed, t, fade) { // one burst from a nozzle at (x, y) px, heading (dx, dy) on screen
  const af = u < open ? 1 : 1 - smooth((u - open) / fade); if (af <= 0) return null;
  const grow = smooth(u / .09), off = u > open ? (u - open) * 11 : 0, s1 = size * grow + (u > open ? (u - open) * 6 : 0), N = 24, P0 = [];
  let px = x, py = y, vx = dx, vy = dy, prev = 0;
  for (let i = 0; i < N; i++) { const fr = i / (N - 1), s = lerp(off, s1, fr), ds = s - prev; prev = s; const bend = clamp(s / (size * 1.6)) * .55; vx = lerp(dx, 0, bend); vy = lerp(dy, -1, bend); const L = Math.hypot(vx, vy) || 1; px += vx / L * ds * k; py += vy / L * ds * k;
    const r = ((.055 + .16 * Math.pow(fr, .75)) * (1 + .3 * n1(seed * 13 + i, t * 9)) + (u > open ? (u - open) * .3 : 0)) * size * k, j = .11 * size * k * Math.pow(fr, 1.2) * n1(seed * 13 + 40, i * .35 - t * 8); // a wiggle that travels up the jet
    P0.push([px - vy / L * j, py + vx / L * j, r, fr]); }
  const layer = (rm, fmax, col, a) => { g.fillStyle = `rgba(${col},${a * af})`; g.beginPath(); for (const [qx, qy, r, fr] of P0) { if (fr > fmax) continue; g.moveTo(qx + r * rm, qy); g.arc(qx, qy, Math.max(.6, r * rm), 0, TAU); } g.fill(); };
  const rm = P0.reduce((a, q) => a + q[2], 0) / N; g.filter = `blur(${Math.max(1, rm * .45).toFixed(1)}px)`; layer(1.4, 1, '200,58,16', .36); g.filter = 'none'; // a soft red edge
  g.fillStyle = `rgba(250,128,30,${.5 * af})`; g.beginPath(); for (let i = 5; i < N; i++) { const [qx, qy, r] = P0[i]; for (const sd of [-1, 1]) { const o = r * (.75 + .35 * n1(seed * 7 + i + sd * 50, t * 11)), tx = qx + sd * o, ty = qy - r * .3 * (1 + n1(seed * 5 + i, t * 9)), tr = r * (.28 + .12 * n1(seed + i * 3 + sd, t * 13)); g.moveTo(tx + tr, ty); g.arc(tx, ty, Math.max(.5, tr), 0, TAU); } } g.fill(); // ragged tongues along the sides
  layer(1, 1, '250,118,26', .6); layer(.7, .8, '255,176,58', .7); layer(.4, .5, '255,236,190', .38); // the hot core stays at .38
  const m = P0[Math.floor(N / 2)]; return [m[0], m[1], size * k, af];
}
// ---------- per frame: the occlusion mask, then the fire after the grade ----------
const OCT_F = { t: NaN, box: null, A: null, st: null, geo: null }, OCT_LC = mkCanvas(), octLg = OCT_LC.getContext('2d'), OCT_MC = mkCanvas(), octMg = OCT_MC.getContext('2d');
function octMaskA(k, p) { const x0 = Math.max(0, Math.floor(p[0] - 11 * k)), x1 = Math.min(W, Math.ceil(p[0] + 11 * k)), y0 = Math.max(0, Math.floor(p[1] - 21 * k)), y1 = Math.min(H, Math.ceil(p[1] + .5 * k));
  OCT_F.box = null; OCT_F.A = null; if (x1 - x0 < 2 || y1 - y0 < 2) return; OCT_F.box = [x0, y0, x1 - x0, y1 - y0]; OCT_F.A = g.getImageData(x0, y0, x1 - x0, y1 - y0).data; }
function octMaskB(t) { if (OCT_F.t !== t || !OCT_F.box) return; const [x0, y0, w, h] = OCT_F.box, A = OCT_F.A, B = g.getImageData(x0, y0, w, h).data, M = octMg.createImageData(w, h), m = M.data;
  for (let i = 0; i < A.length; i += 4) { const dd = Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]); m[i] = m[i + 1] = m[i + 2] = 255; m[i + 3] = dd > 6 ? 0 : 255; }
  octMg.clearRect(0, 0, W, H); octMg.putImageData(M, x0, y0); OCT_F.masked = true; }
function octInto(t, list) {
  OCT_F.t = NaN; const st = octPose(t); if (!st) return; const p = P(st.X, 0, st.Z); if (p[2] < 3) return; const k = kAt(p); if (k < .6 || p[0] < -12 * k || p[0] > W + 12 * k) return;
  ACT.note('playa:oct', st.X, st.Z, 5.5, { h: 8.5, a: st.a, group: 'artcar' });
  const ah = P(st.X + st.hx, 0, st.Z + st.hz), d = Math.sign(ah[0] - p[0]) || -1, vx = st.X - C.x, vz = st.Z - C.z, sq = Math.max(.42, Math.abs(st.hx * vz - st.hz * vx) / (Math.hypot(vx, vz) || 1));
  list.push({ z: p[2], draw: () => { const arms = octDraw(st, t, p, k, d, sq); OCT_F.t = t; OCT_F.st = st; OCT_F.geo = { p, k, d, sq, arms }; OCT_F.masked = false; octMaskA(k, p); },
    shadow: () => shadowOf([[st.X - st.hx * 5.5, 0, st.Z - st.hz * 5.5], [st.X + st.hx * 5.5, 0, st.Z + st.hz * 5.5], [st.X - 1.4, 5.5, st.Z], [st.X + 1.4, 5.5, st.Z], [st.X, 8.2, st.Z]], t) });
  list.push({ z: .305, draw: () => octMaskB(t) }); // after everything nearer: where the car still shows
}
function octGlow(t) { // after the grade: the bursts, the warm light they throw on the metal, masked to where the car shows
  if (OCT_F.t !== t || !OCT_F.box || !OCT_F.masked) return; const { p, k, d, sq, arms } = OCT_F.geo, st = OCT_F.st, x0 = OCT.X0 * sq;
  const S = (lx, ly) => [p[0] + d * k * (x0 + lx), p[1] - k * ly];
  const bursts = octBursts(t), nt = st.night; if (!bursts.length && nt < .02) return;
  const [bx, by, bw, bh] = OCT_F.box; octLg.setTransform(1, 0, 0, 1, 0, 0); octLg.globalCompositeOperation = 'source-over'; octLg.clearRect(bx, by, bw, bh);
  const g0 = g; g = octLg; const glows = [];
  const fire = bursts.reduce((a, b) => a + (t - b.tb < b.open + .3 ? 1 : 0), 0); // how many cannons are going
  if (nt > .02) { octSetPal(.8); octDraw({ ...st, a: 1, mv: false }, t, p, k, d, sq, true); octSetPal(0); g.save(); g.globalCompositeOperation = 'destination-in'; g.fillStyle = `rgba(0,0,0,${nt * (.52 + .1 * Math.min(3, fire))})`; g.fillRect(bx, by, bw, bh); g.restore(); // the metal in its own firelight, at part strength
    g.save(); for (const y of [1.3, 1.75, 4.9]) for (let i = 0; i < 9; i++) { const lx = (i - 4) * (y < 2 ? .62 : .26), q = S(lx, y), tw = .6 + .4 * Math.sin(t * 4 + i * 1.7 + y); g.fillStyle = `rgba(255,${190 + (i % 3) * 20},${110 + (i % 2) * 60},${.9 * nt * tw})`; const s2 = Math.max(1.6, .09 * k); g.fillRect(q[0] - s2 / 2, q[1] - s2 / 2, s2, s2); } g.restore(); } // its strings of deck and cage lights
  for (const b of bursts) { let q, dir; if (b.j === 8) { q = S(0, 8.4); dir = [0, -1]; } else { const a = arms[b.j]; q = S(a.noz[0] + a.dir[0] * .15, a.noz[1] + a.dir[1] * .15); dir = [d * a.dir[0], -a.dir[1]]; }
    const r = octFlame(q[0], q[1], dir[0], dir[1], k, t - b.tb, b.size, b.open, b.j + 1, t, lerp(.28, .45, nt)); if (r) glows.push(r); } // by day a burst burns off faster
  g = g0;
  octLg.globalCompositeOperation = 'destination-in'; octLg.drawImage(OCT_MC, bx, by, bw, bh, bx, by, bw, bh); octLg.globalCompositeOperation = 'source-over';
  g.save(); g.globalAlpha = st.a;
  if (glows.length) { g.globalCompositeOperation = 'screen'; for (const [gx, gy, R0, af] of glows) { const R = R0 * 1.5, rg = g.createRadialGradient(gx, gy, 0, gx, gy, R); rg.addColorStop(0, `rgba(255,150,60,${(.1 + .22 * nt) * af})`); rg.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = rg; g.fillRect(gx - R, gy - R, 2 * R, 2 * R); } }
  g.globalCompositeOperation = 'source-over'; g.drawImage(OCT_LC, bx, by, bw, bh, bx, by, bw, bh); g.restore();
}

function playaInto(t, list) {
  brcInto(t, list); bmCampsInto(t, list); bmInstallsInto(t, list); bmElephantsInto(t, list); bmWarsInto(t, list);
  bmTraffic(t, list); bmFlockInto(t, list); bmParadeInto(t, list); bmPoorInto(t, list); bmCopsInto(t, list); bmRangersInto(t, list); drumCircleInto(t, list); octInto(t, list); bmStiltsInto(t, list);
  if (t >= SAX_BACK) bmSaxInto(t, list); // draft 17: the sax rider on the table's far side
}
function playaFront(t) { bmSaxFront(t); } // render.js front hook: things that pass between the drone and the car

// ---------- draft 21: the stilt walkers (Robin's photos robin-2026-10-18/27-28.jpg) ----------
// A pair walking hand in hand on tall stilts across the open playa behind the board, verse 2 into the bridge: one in
// a rainbow-striped bodysuit with a flower crown and a ruffled jacket; the other in purple and pink, long flared
// purple-and-pink stilt covers like inverted cones, a pink-trimmed jacket and spiky purple hair. They walk in from and
// out to where no camera sees them (bmBorn / bmGone), in the gap the near camps leave at x 210-262, z 34.
const STILT = { t0: 147, t1: 186, x0: 203, v: .75, Z: 34, gap: 1.5 };
const bmStiltAt = (j) => (s) => [STILT.x0 + (s - STILT.t0) * STILT.v + j * STILT.gap, STILT.Z + j * .35, 0];
function bmStiltOn(t) { const a = bmStiltAt(0); return t >= bmBorn('stilt', STILT.t0, a, 2.4, 4.6) && t <= bmGone('stilte', STILT.t1, a, 2.4, 4.6); }
function bmStiltObs(t, L) { if (!bmStiltOn(t)) return; for (const j of [0, 1]) { const [X, Z] = bmStiltAt(j)(t); L.push({ X, Z, r: .6 }); } }
function bmStilter(j, x, y, k, t, hand) { // one walker, front on, feet of the stilts at (x, y), k px per metre; hand: the screen point of the joined hands
  const st = Math.sin(t * 3.4 + j * Math.PI) * .09, det = k > 14; bmBegin(x, y, k, 1);
  const stripe = (a, b, w, cols, n) => { for (let i = 0; i < n; i++) bmLine([[lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)], [lerp(a[0], b[0], (i + 1) / n), lerp(a[1], b[1], (i + 1) / n)]], w, cols[i % cols.length]); };
  if (j === 0) { // rainbow: black stilt poles under rainbow-striped legs, ruffled pink-and-purple cuffs, the ruffled jacket, a flower crown
    for (const s of [-1, 1]) { const f = [s * .13 + s * st, 0], kn = [s * .11, 1.35]; bmLine([f, kn], .05, '#1c1a1e'); if (det) bmLine([[f[0], .05], [f[0], .14]], .06, '#e8b23a');
      bmFill([[kn[0] - .2, 1.2], [kn[0] + .2, 1.2], [kn[0] + .08, 1.5], [kn[0] - .08, 1.5]], s < 0 ? '#e85aa8' : '#9a68dc');
      stripe([kn[0], 1.45], [s * .08, 2.35], .14, DRESS_RAINBOW, det ? 12 : 4); }
    stripe([0, 2.35], [0, 3.0], .36, DRESS_RAINBOW, det ? 8 : 3);
    for (const s of [-1, 1]) { bmFill([[s * .19, 3.02], [s * .34, 2.95], [s * .3, 2.55], [s * .22, 2.6]], '#f6efe0'); if (det) for (let i = 0; i < 4; i++) bmDot(s * (.3 - i * .01), 2.95 - i * .11, .045, ['#e85aa8', '#47c1ba', '#e8b23a', '#9a68dc'][i]); } // the ruffled jacket
    bmLine([[-.2, 2.98], [-.38, 2.6], [-.42, 2.3]], .08, '#e8b23a'); // the free arm, down
    if (det) bmLine([[.22, 2.98], [.38, 2.62]], .08, '#47c1ba');
    bmLine([[0, 3.0], [0, 3.1]], .07, '#e2c4a4'); bmOval(0, 3.2, .11, .13, '#e8cfae'); bmOval(0, 3.27, .12, .07, '#e8d070');
    for (let i = 0; i < 6; i++) bmDot(-.12 + i * .048, 3.32 + Math.sin(i * 1.3) * .02, .045, ['#e8452f', '#e8b23a', '#7fd04a', '#e85aa8', '#ee9a42', '#f6efe0'][i]); }
  else { // purple and pink: flared cone covers over the stilts, pink-trimmed jacket, spiky purple hair, one arm up
    for (const s of [-1, 1]) { const f = [s * .16 + s * st, 0]; bmLine([f, [f[0], .45]], .05, '#1c1a1e');
      bmFill([[f[0] - .24, .42], [f[0] + .24, .42], [s * .11 + .09, 2.2], [s * .11 - .09, 2.2]], bmLG(f[0] - .24, 0, f[0] + .24, 0, ['#c24ad0', '#8a3cb0', '#5a2a80']));
      bmFill([[f[0] - .26, .42], [f[0] - .3, .3], [f[0] - .1, .48], [f[0] + .1, .48], [f[0] + .3, .3], [f[0] + .26, .42]], '#ff6ec0'); // the pink flare at the hem
      if (det) bmLine([[f[0] - .17, .9], [s * .11 - .07, 2.1]], .03, '#ff6ec0'); }
    bmFill([[-.17, 2.2], [.17, 2.2], [.2, 2.95], [-.2, 2.95]], '#9a3cc0'); bmFill([[-.18, 2.2], [.18, 2.2], [.16, 2.38], [-.16, 2.38]], '#ff6ec0');
    for (const s of [-1, 1]) bmLine([[s * .2, 2.95], [s * .23, 2.4]], .07, '#ff6ec0'); // the jacket's pink trim
    bmLine([[.2, 2.95], [.42, 3.2], [.38, 3.55]], .08, '#9a3cc0'); bmDot(.38, 3.58, .05, '#e8cfae'); // the free arm, up and waving
    bmLine([[0, 2.95], [0, 3.05]], .07, '#e8cfae'); bmOval(0, 3.15, .11, .13, '#f1dcc4');
    for (let i = 0; i < 7; i++) { const a = Math.PI * (.12 + i * .127); bmFill([[Math.cos(a) * .09, 3.2 + Math.sin(a) * .1], [Math.cos(a) * .26, 3.2 + Math.sin(a) * .28], [Math.cos(a + .2) * .09, 3.2 + Math.sin(a + .2) * .1]], i % 2 ? '#a64dff' : '#7a2ab0'); } }
  g.restore();
  if (hand) { g.strokeStyle = j === 0 ? '#e8b23a' : '#9a3cc0'; g.lineWidth = Math.max(1, .08 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(x + (j === 0 ? -.22 : .2) * k * (j === 0 ? -1 : -1), y - 2.95 * k); g.lineTo(hand[0], hand[1]); g.stroke(); }
}
function bmStiltsInto(t, list) {
  if (t < STILT.t0 - 60 || t > STILT.t1 + 60 || !bmStiltOn(t)) return;
  const pts = [0, 1].map((j) => bmStiltAt(j)(t)), pr = pts.map(([X, Z]) => P(X, 0, Z)); if (pr.some((p) => p[2] < 1.5)) return;
  const hp = P((pts[0][0] + pts[1][0]) / 2, 2.55, (pts[0][1] + pts[1][1]) / 2); // where the hands meet
  pts.forEach(([X, Z], j) => { ACT.note('playa:stilt:' + j, X, Z, .5, { h: 3.6, group: 'scene' });
    const p = pr[j]; if (p[0] < -200 || p[0] > W + 200) return;
    list.push({ z: p[2], draw: () => { const k = kAt(p); if (k < .6) return; bmStilter(j, p[0], p[1], k, t, null); }, shadow: () => shadowStick(X, 0, 3.4, Z, .35, t) }); });
  // the joined hands: each near arm from its shoulder down to where the hands meet, drawn after both bodies
  list.push({ z: Math.min(pr[0][2], pr[1][2]) - .02, draw: () => { const sd = Math.sign(pr[1][0] - pr[0][0]) || 1;
    [0, 1].forEach((j) => { const k = kAt(pr[j]), sx = pr[j][0] + (j ? -sd : sd) * .2 * k, sy = pr[j][1] - 2.95 * k; if (k < 2) return;
      g.strokeStyle = j ? '#9a3cc0' : '#47c1ba'; g.lineWidth = Math.max(1, .08 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + (hp[0] - sx) * .3, hp[1] - .1 * k, hp[0], hp[1]); g.stroke(); });
    const k = kAt(hp); if (k > 2) { g.fillStyle = '#e8cfae'; g.beginPath(); g.arc(hp[0], hp[1], .07 * k, 0, TAU); g.fill(); } } });
}
