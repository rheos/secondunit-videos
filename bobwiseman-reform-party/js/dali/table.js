// Reform Party, Dali look: the props on the table.
// ---------- things on the table ----------
function drape(pts, y0) { return pts.map(([x, z]) => z < -TD ? [x, y0 - (-TD - z) * 1.05, -TD - .015] : [x, y0, z]); } // a soft object hangs over the front edge
function melt(t) { return clamp((t - 20) / 200) * .55 + ease(t, L_(1).s, L_(1).e) * .12; } // the heat softens the props through the day
// "scientists can't speak": under the tape X the speakerphone slumps like a soft watch and runs over the table edge
// draft 13 (Robin on d12: you can't absorb it melting): it starts to soften on "scientists" and is fully melted over the
// table's edge by 26.0, while the camera holds on it; when the tape comes off it springs only partly back (it stays soft)
const phoneSlump = (t) => ease(t, wt(1, 'scientists') + .3, L_(1).s + 3.9) * (1 - .35 * ease(t, L_(2).s + .3, L_(2).s + 1));
// draft 11 (Robin: it went out of frame as it melted): the phone sits 0.25 m nearer the hat hole and 0.4 m further from
// the front edge, so in the low shot that turns from it to the Instrument People (24-27.6) it stays in the lower middle
// of the frame while it slumps, instead of sliding off the bottom right corner
const PHONE = { x: .95, z: -.55 };
// draft 16: the mute button on the far edge and the puff (the arm and button are drawn by muteButton, after the props)
const PUFF = { t: () => wt(1, 'can') - .12, bx: 1.25, bz: 1.18, seat: 4 };
// draft 17 (Robin on d16: "more like bubbles ... should be darker and a bit more of it", the "this message will
// self destruct" smoke): a short fizz of sparks off the phone, then a dense charcoal plume that billows, curls up and
// hangs, drifting off to the right. Each puff is a ragged cluster of soft blobs (radial falloff, no hard round edge).
// Alpha is smoke only. The phone still melts under it.
function phonePuff(t, cx, cz, sl) {
  const u0 = t - PUFF.t(); g.save();
  if (u0 > 0 && u0 < .55) { g.globalCompositeOperation = 'lighter'; const b = PL(cx, TOP + .12 + sl * .02, cz - .08); if (b[2] > .2) { const k = kAt(b);
    for (let i = 0; i < 9; i++) { const st = i * .03, u = u0 - st; if (u < 0 || u > .35) continue; const a = rnd(i, 81) * TAU, v = .5 + .7 * rnd(i, 82), x = b[0] + Math.cos(a) * v * u * k, y = b[1] - (Math.abs(Math.sin(a)) * v * u + 1.6 * u * u * -1) * k;
      g.fillStyle = `rgba(255,${180 + 60 * rnd(i, 83) | 0},90,${.9 * (1 - u / .35)})`; g.beginPath(); g.arc(x, y, Math.max(1.2, .018 * k), 0, TAU); g.fill(); } }
    g.globalCompositeOperation = 'source-over'; }
  const N = 30, LIFE = 4.6, gag = wt(2, 'gag'), clear = 1 - .85 * ease(t, gag - 1.0, gag + .3); // it thins and drifts right as the padlocked lips come in on "gag", so they stay clear
  for (let i = N - 1; i >= 0; i--) { const u = u0 - .12 - i * .085; if (u < 0 || u > LIFE) continue; const f = u / LIFE, e = 1 - (1 - f) ** 2.2;
    const curl = Math.sin(u * 1.7 + i * 1.3) * .14 * e, x = cx + (rnd(i, 71) - .5) * .18 + e * (.55 + .35 * rnd(i, 72)) + .5 * ease(t, gag - 1.4, gag + .6) + curl, y = TOP + .1 + sl * .02 + e * (1.5 + .7 * rnd(i, 73)), z = cz - .08 + (rnd(i, 74) - .5) * .25 + e * .3 + Math.cos(u * 1.3 + i) * .08 * e;
    const q = PL(x, y, z); if (q[2] < .2) continue; const k = kAt(q), R = (.09 + .42 * e) * (.85 + .35 * rnd(i, 75)) * k;
    const al = .78 * clear * clamp(u / .15) * (1 - clamp((f - .5) / .5)), sh = 34 + 50 * e + 22 * rnd(i, 76) | 0; // charcoal at the source, smoky grey as it opens out
    for (let j = 0; j < 5; j++) { const a = rnd(i * 7 + j, 77) * TAU + u * .4 * (j % 2 ? 1 : -1), d = j ? R * (.35 + .3 * rnd(i * 7 + j, 78)) : 0, r = R * (j ? .55 + .3 * rnd(i * 7 + j, 79) : .8);
      const bx = q[0] + Math.cos(a) * d, by = q[1] + Math.sin(a) * d * .8, gr = g.createRadialGradient(bx, by, 0, bx, by, r), c = sh + (j % 3) * 6;
      gr.addColorStop(0, `rgba(${c},${c - 2},${c - 4},${al})`); gr.addColorStop(.55, `rgba(${c},${c - 2},${c - 4},${al * .75})`); gr.addColorStop(1, `rgba(${c},${c - 2},${c - 4},0)`);
      g.fillStyle = gr; g.beginPath(); g.arc(bx, by, r, 0, TAU); g.fill(); } }
  g.restore(); }
// the far-row suit's reach: the hand goes out from the shoulder, presses the button on PUFF.t() and comes back
function muteButton(t) {
  const tp = PUFF.t(); if (t < 15 || t > L_(2).e + 2) return; const { bx, bz } = PUFF;
  const reach = ease(t, tp - .75, tp - .12) * (1 - ease(t, tp + .35, tp + 1.0)), push = ease(t, tp - .2, tp - .05) * (1 - ease(t, tp + .15, tp + .35));
  const box = (x0, x1, y0, y1, z0, z1, col) => { poly([PL(x0, y1, z0), PL(x1, y1, z0), PL(x1, y1, z1), PL(x0, y1, z1)], col, '#17181b', 1); poly([PL(x0, y0, z0), PL(x1, y0, z0), PL(x1, y1, z0), PL(x0, y1, z0)], '#1f2024', '#17181b', 1); };
  box(bx - .14, bx + .14, TOP, TOP + .08, bz - .1, bz + .1, '#e8c23a');
  const dy = .05 - .035 * push, top = []; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; top.push(PL(bx + Math.cos(a) * .08, TOP + .08 + dy, bz + Math.sin(a) * .08)); }
  const side = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; side.push(PL(bx + Math.cos(a) * .08, TOP + .08, bz - Math.sin(a) * .08)); } for (let i = 8; i >= 0; i--) { const a = i / 8 * Math.PI; side.push(PL(bx + Math.cos(a) * .08, TOP + .08 + dy, bz - Math.sin(a) * .08)); }
  poly(side, '#9e1a12'); poly(top, '#e0291c', '#7a120c', 1);
  if (reach <= 0) return; const h = typeof suitHeadLocal === 'function' ? suitHeadLocal(PUFF.seat, t) : [SEATS[PUFF.seat].x, 1.9, 2.3];
  const sh = [h[0] - .24, h[1] - .25, h[2] - .05], rest = [h[0] - .3, h[1] - .5, h[2] - .2], hand = [bx, TOP + .08 + dy + .06, bz];
  const H = [lerp(rest[0], hand[0], reach), lerp(rest[1], hand[1], reach) + .12 * Math.sin(reach * Math.PI), lerp(rest[2], hand[2], reach)];
  const a = PL(...sh), b = PL(...H); if (a[2] < .2 || b[2] < .2) return; const k = kAt(b);
  const ka = (kAt(a) + k) / 2; g.save(); g.lineCap = 'round'; g.strokeStyle = '#141419'; g.lineWidth = .16 * ka; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); // a dark edge so the sleeve reads over his own jacket
  g.strokeStyle = PAL.suitLit; g.lineWidth = .12 * ka; g.stroke(); const c = [lerp(a[0], b[0], .86), lerp(a[1], b[1], .86)]; g.strokeStyle = '#f4efe2'; g.lineWidth = .1 * ka; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(lerp(a[0], b[0], .93), lerp(a[1], b[1], .93)); g.stroke(); g.restore(); // the shirt cuff
  g.fillStyle = PAL.egg; g.beginPath(); g.ellipse(b[0], b[1] + .01 * k, .055 * k, .045 * k, 0, 0, TAU); g.fill();
}
function speakerphone(t) {
  const m = melt(t), cz = PHONE.z - m * .75, cx = PHONE.x, sl = phoneSlump(t), pts = [];
  const flow = (x, z, f = 1) => { const dx = x - cx, dz = z - cz, front = clamp(-dz / .3), side = 1 - .55 * (dx / .4) ** 2; // front points run toward the edge
    return [cx + dx * (1 + .25 * sl * f), z - sl * f * (.15 + 1.05 * front * side)]; };
  // draft 9: it read as a beetle at phone size (a dark rounded shell with two "eyes"). Now a conference phone: a flat
  // triangle with straight sides and blunt corner mic pods, a pale speaker bezel and grille in the middle, a lit LCD
  // strip, and a coiled cord running off the back. Same size, same place, same slump and tape X.
  const ph = (a) => { const d = ((a - .5 - TAU / 6) % (TAU / 3) + TAU / 3) % (TAU / 3) - TAU / 6; return Math.min(.25 / Math.cos(d), .41); }; // flat sides, blunt corners
  for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, r = ph(a) * (1 + sl * .06 * n1(5, a * 2)); pts.push(flow(cx + Math.cos(a) * r, cz + Math.sin(a) * r * .9)); }
  const P3 = drape(pts, TOP + .04).map((p) => PL(...p)); if (!ok(P3)) return;
  { const cord = []; for (let i = 0; i <= 90; i++) { const u = i / 90, bx = lerp(cx + Math.cos(1.55) * .2, cx + .95, u), bz = lerp(cz + Math.sin(1.55) * .2, cz + 1.05, u) + .25 * Math.sin(u * Math.PI) * (1 - u), w = u * 7 * TAU; // the coiled cord
      cord.push(PL(...drape([flow(bx + Math.cos(w) * .06 * Math.sin(u * Math.PI), bz + Math.sin(w) * .045 * Math.sin(u * Math.PI), .2)], TOP + .02)[0])); }
    if (ok(cord)) { g.strokeStyle = '#1b1c20'; g.lineWidth = Math.max(1.2, .02 * kAt(cord[0])); g.lineJoin = 'round'; g.beginPath(); cord.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); } }
  poly(P3, '#2f3136', '#17181b', Math.max(1, .012 * kAt(P3[0])));
  if (sl > 0) for (let i = 0; i < 4; i++) { // drips off the front edge
    const x = cx - .2 + i * .13, ov = -TD - flow(x, cz - .3)[1]; if (ov <= .03) continue; const len = sl * (.18 + .32 * rnd(i, 61)) * (1 + .15 * Math.sin(t * 2 + i)), ytop = TOP + .04 - ov * 1.05 + .03, ylow = ytop - len;
    poly([PL(x - .035, ytop, -TD - .016), PL(x + .035, ytop, -TD - .016), PL(x + .015, ylow, -TD - .016), PL(x - .015, ylow, -TD - .016)], '#2f3136');
    const q = PL(x, ylow, -TD - .017); if (q[2] > .2) { g.fillStyle = '#2f3136'; g.beginPath(); g.arc(q[0], q[1], .03 * kAt(q), 0, TAU); g.fill(); } }
  if (sl > 0 && P3.every((p) => p[2] > .15)) { const hl = []; for (let i = 0; i <= 12; i++) { const a = 3.7 + i / 12 * 1.9; hl.push(PL(...drape([flow(cx + Math.cos(a) * .27, cz + Math.sin(a) * .22)], TOP + .055)[0])); } // a soft highlight on its back
    g.save(); g.globalAlpha = .35 * sl; g.strokeStyle = '#8a8e96'; g.lineWidth = .025 * kAt(hl[6]); g.beginPath(); hl.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore(); }
  const ring = (r, dz = 0) => drape(Array.from({ length: 28 }, (_, i) => { const a = i / 28 * TAU; return flow(cx + Math.cos(a) * r, cz + Math.sin(a) * r * .9 - dz, .5); }), TOP + .05).map((p) => PL(...p));
  for (let c = 0; c < 3; c++) { const a = .5 + TAU / 6 + c * TAU / 3, pod = []; for (let i = 0; i < 12; i++) { const b = i / 12 * TAU; pod.push(PL(...drape([flow(cx + Math.cos(a) * .3 + Math.cos(b) * .07, cz + (Math.sin(a) * .3 + Math.sin(b) * .07) * .9)], TOP + .05)[0])); } poly(pod, '#4a4e56'); } // corner mic pods
  poly(ring(.16, sl * .05), '#a7acb4'); poly(ring(.125, sl * .05), '#25272b'); // the speaker: a pale bezel and a dark grille
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; const q = PL(...drape([flow(cx + Math.cos(a) * .075, cz + Math.sin(a) * .068 - sl * .05, .5)], TOP + .06)[0]); if (q[2] < .15) continue; g.fillStyle = '#80858d'; g.beginPath(); g.arc(q[0], q[1], .011 * kAt(q), 0, TAU); g.fill(); }
  { const lz = cz + Math.sin(1.55) * .19 * .9, lx = cx + Math.cos(1.55) * .19, S = (x, z) => PL(...drape([flow(x, z, .3)], TOP + .055)[0]); // the LCD strip on the back edge
    poly([S(lx - .13, lz - .03), S(lx + .13, lz - .03), S(lx + .13, lz + .03), S(lx - .13, lz + .03)], '#bcd9a4', '#17181b', 1);
    for (let j = 0; j < 3; j++) seg(S(lx - .1 + j * .07, lz), S(lx - .05 + j * .07, lz), 1.5, '#3c4a34'); }
  // LEDs: green while it may speak; red, with tape across, once the scientists can't
  const cant = wt(1, 'can'), red = t > cant && t < L_(2).s + .5;
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5 + TAU / 6, r = .3; const q = PL(...drape([flow(cx + Math.cos(a) * r, cz + Math.sin(a) * r * .9)], TOP + .06)[0]); if (q[2] < .15) continue; g.fillStyle = red ? '#ff3b2a' : '#57e07a'; g.beginPath(); g.arc(q[0], q[1], .028 * kAt(q), 0, TAU); g.fill(); }
  // draft 16 (Robin, 0:24: "instead of an X appearing ... someone on the other side can push a button and a puff of
  // smoke comes up from the teleconference phone"): the tape X is gone; the far-row suit at seat 4 presses a red
  // button on the far edge just before "can't", and the phone gives off a puff of smoke (smoke may fade; it is alpha)
  if (t > PUFF.t() - .3 && t < PUFF.t() + 7.5) phonePuff(t, cx, cz, sl);
  // the soundbite (draft 9: on "soundbite", not "patent", which has the notary seal now): rings go out across the
  // table and the last one has a bite taken out, right where the table's edge gets bitten (tableBite)
  const sb = wt(8, 'soundbite') - .45; if (t > sb - .3 && t < L_(8).e + .6) for (let r = 0; r < 4; r++) { const age = ((t - sb + .3) * 1.4 - r * .35); if (age < 0 || age > 1.6) continue; const R = .4 + age * .9, ring = [];
    for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; if (r === 3 && a > 3.45 && a < 4.15) continue; ring.push(PL(cx + Math.cos(a) * R, TOP + .06, cz + Math.sin(a) * R * .9)); }
    g.save(); g.globalAlpha = clamp(1.6 - age); g.strokeStyle = '#f8ecd0'; g.lineWidth = 3; g.beginPath(); ring.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore(); }
}
// ---------- draft 9: the bite, the ants, the notary seal ----------
// "soundbite" (Dali): the table's front edge gets a bite taken out of it, and a file of ants walks out of the bite.
// They settle in a ring on the table (Dali's ants on the soft watch); on "dime" the dime lands in their ring and they
// walk it toward the hat hole.
const BITE = { x: .6, R: .22, at: () => wt(8, 'soundbite') + .3 };
function tableBite(t) {
  const b = BITE.at(); if (t < b) return; const grow = easeOutBack(clamp((t - b) / .14)), R = BITE.R * grow, N = 22;
  const arc = []; for (let i = 0; i <= N; i++) { const a = i / N * Math.PI, sc = 1 + .1 * Math.abs(Math.sin(a * 3.5)); arc.push([BITE.x + Math.cos(a) * R * sc, -TD + Math.sin(a) * R * .85 * sc]); }
  const top = arc.map(([x, z]) => PL(x, TOP + .003, z)); if (!ok(top)) return;
  poly([...top, PL(BITE.x - R, TOP - .22, -TD), PL(BITE.x + R, TOP - .22, -TD)], '#1a0905'); // the bitten-out wood shows the dark under the top
  poly(top, '#1a0905'); g.save(); g.lineJoin = 'round'; poly(top, null, '#c58a52', Math.max(1.5, .03 * kAt(top[N >> 1]))); g.restore(); // raw wood round the tooth marks
  if (t < b + .6) for (let i = 0; i < 5; i++) { const u = (t - b) / .6, q = PL(BITE.x + (rnd(i, 41) - .5) * .5, TOP + .05 + Math.sin(u * Math.PI) * .25 * rnd(i, 42), -TD - u * .4 * rnd(i, 43)); if (q[2] < .2) continue; // crumbs
    g.fillStyle = '#7a4424'; g.fillRect(q[0] - .015 * kAt(q), q[1] - .015 * kAt(q), .03 * kAt(q), .03 * kAt(q)); }
}
const ANT_N = 20, ANT_PATH = [[.6, -1.42], [.35, -1.2], [-.1, -1.28], [-.5, -1.06], [-.8, -1.08], [-1.06, -.81], [-1.298, -.557]], ANT_V = .22;
const ANT_PL = (() => { const len = [0]; for (let i = 1; i < ANT_PATH.length; i++) len.push(len[i - 1] + Math.hypot(ANT_PATH[i][0] - ANT_PATH[i - 1][0], ANT_PATH[i][1] - ANT_PATH[i - 1][1])); return len; })();
function dimeSpot(t) { // where the dime (and the ants' ring) is: its landing spot, then walked toward the hat hole
  const d = wt(15, 'dime'), u = ease(t, d + .15, d + 1.9), x0 = -1.55, z0 = -.75; return [lerp(x0, -.62, u), lerp(z0, -.32, u)]; }
function antAt(t, i) { // local [x, z, heading] of ant i, or null before it comes out
  const t0 = BITE.at() + .15 + i * .3; if (t < t0) return null; const d = (t - t0) * ANT_V, Lp = ANT_PL[ANT_PL.length - 1], wob = .025 * n1(300 + i, t * 1.7);
  if (d < Lp) { let j = 1; while (j < ANT_PL.length - 1 && ANT_PL[j] < d) j++; const a = ANT_PATH[j - 1], b = ANT_PATH[j], u = (d - ANT_PL[j - 1]) / (ANT_PL[j] - ANT_PL[j - 1]), h = Math.atan2(b[1] - a[1], b[0] - a[0]);
    return [lerp(a[0], b[0], u) - Math.sin(h) * wob, lerp(a[1], b[1], u) + Math.cos(h) * wob, h]; }
  const [sx, sz] = dimeSpot(t), dm = wt(15, 'dime'), squeeze = 1 + .2 * ease(t, dm - .1, dm + .3), ang = .7 + (d - Lp) / .33; // round the ring, entering it along the file
  return [sx + Math.cos(ang) * .33 * squeeze + .015 * wob, sz + Math.sin(ang) * .3 * squeeze, ang + Math.PI / 2]; }
function ants(t) {
  if (t < BITE.at() || t > L_(16).e + .6) return; const al = 1 - ease(t, L_(16).e, L_(16).e + .6); if (al <= 0) return;
  g.save(); g.globalAlpha = al; g.fillStyle = '#141012'; g.strokeStyle = '#141012';
  for (let i = 0; i < ANT_N; i++) { const a = antAt(t, i); if (!a) continue; const [x, z, h] = a, c = Math.cos(h), s = Math.sin(h), at = (f, l) => PL(x + c * f - s * l, TOP + .012, z + s * f + c * l);
    const q = at(0, 0); if (q[2] < .2) continue; const k = kAt(q); if (k * .1 < 1.2) continue;
    for (const [f, r] of [[.035, .012], [0, .013], [-.04, .021]]) { const p = at(f, 0); g.beginPath(); g.arc(p[0], p[1], r * k * 1.1, 0, TAU); g.fill(); } // head, thorax, abdomen
    g.lineWidth = Math.max(.8, .006 * k); g.beginPath(); for (let l = 0; l < 3; l++) for (const sd of [-1, 1]) { const st = .02 * Math.sin(t * 22 + i + l * 2 + (sd > 0 ? Math.PI : 0)), r0 = at(.012 - l * .012, 0), r1 = at(.02 - l * .02 + st, sd * .03); g.moveTo(r0[0], r0[1]); g.lineTo(r1[0], r1[1]); } g.stroke(); }
  g.restore();
}
// "patent" (critic B; Gilliam's stamp): the lead set of wind-up teeth hops out first, and a red wax notary seal with a
// gold ribbon stamps down onto it on the word and stays. Drawn face on, in screen space, at the teeth's spot.
function waxSeal(x, y, k, t, st, fl = 1, fallPx) { // centre (x, y), k px per metre, st = the stamp time, fl < 1 squashes it flat (lying on top of something); fallPx: the caller's own drop (draft 11)
  const u = clamp((t - st + .22) / .22), drop = fallPx != null ? fallPx : (1 - u * u) * 2.2 * k, sq = t > st ? Math.exp(-(t - st) * 9) * Math.sin((t - st) * 30) * .12 : 0, r = .25 * k;
  if (fallPx == null && u <= 0) return; const cy = y - drop;
  g.save(); g.translate(x, cy);
  g.fillStyle = '#d9b45a'; for (const d of [-1, 1]) { g.beginPath(); g.moveTo(d * .05 * k, .1 * k); g.lineTo(d * .2 * k, .52 * k); g.lineTo(d * .13 * k, .46 * k); g.lineTo(d * .09 * k, .55 * k); g.lineTo(-d * .04 * k, .12 * k); g.fill(); } // the ribbon tails
  g.scale(1 + sq, (1 - sq) * fl);
  g.fillStyle = '#b5302a'; g.beginPath(); for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, rr = r * (1 + .07 * Math.sin(a * 9) * (t > st ? 1 : .3)); i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(rr, 0); } g.fill(); // wax, squeezed out at the rim
  g.strokeStyle = '#7e1c18'; g.lineWidth = Math.max(1, .025 * k); g.beginPath(); g.arc(0, 0, r * .7, 0, TAU); g.stroke();
  g.fillStyle = '#d65a4c'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i / 10 * TAU, rr = (i % 2 ? .07 : .15) * k; i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.fill(); // a star in the wax
  g.fillStyle = 'rgba(255,220,200,.35)'; g.beginPath(); g.ellipse(-r * .35, -r * .45, r * .3, r * .12, -.5, 0, TAU); g.fill();
  g.restore();
  if (t > st && t < st + .45) { const v = (t - st) / .45; g.save(); g.strokeStyle = `rgba(250,236,210,${.55 * (1 - v)})`; g.lineWidth = Math.max(1, .03 * k); for (let i = 0; i < 6; i++) { const a = Math.PI + i / 5 * Math.PI, r0 = r * (1.15 + v * .3), r1 = r * (1.5 + v * .6); g.beginPath(); g.moveTo(x + Math.cos(a) * r0, cy + Math.sin(a) * r0 * .7); g.lineTo(x + Math.cos(a) * r1, cy + Math.sin(a) * r1 * .7); g.stroke(); } g.restore(); } // the stamp's thump
}
// draft 9 (critic A, refrain 1): on "facts" the chart slides down off the board and puddles on the table top, the board
// blank by 53.0; on "spin" the board turns twice on its easel in 1.4 s (its back is a pale board too, so the turn is not
// a light/dark flicker) and comes back with the chart drawn steeper. Refrain 2 (critic B): the cell bars and the barbed
// wire stay up through the refrain; on "facts" the bars pop off one by one into the nearest dust devil; at the end of the
// spin the board comes back with a fresh chart, steeper again.
const WBX0 = 2.45, WBX1 = 3.95, WBZ = .25;
const WB_T = { f1: () => wt(6, 'facts'), s1: () => wt(6, 'spin'), r1: () => wt(6, 'spin') + .98, f2: () => wt(13, 'facts'), r2: () => L_(13).e - .5 };
function wbTurn(t) { const s = WB_T.s1(); return 2 * TAU * ease(t, s - .05, s + 1.35); } // the easel turns on the table, twice
function boardMap(t) { // whiteboard on an easel at the right end of the table (t optional: the easel's own turn on "spin" 1)
  const sg = t !== undefined && typeof tableSag === 'function' ? tableSag(3.2, t) : 0; // draft 9: the easel rides the soft table down in the outro (car.js)
  const x0 = WBX0, x1 = WBX1, z = WBZ, y0 = TOP + 1.55 - sg, y1 = TOP + .45 - sg, xc = (x0 + x1) / 2, th = t === undefined ? 0 : wbTurn(t), c = Math.cos(th), s = Math.sin(th);
  const R = (x, y, zz = z) => PL(xc + (x - xc) * c - (zz - z) * s, y, z + (x - xc) * s + (zz - z) * c);
  return { tl: R(x0, y0), tr: R(x1, y0), bl: R(x0, y1), br: R(x1, y1), legs: [[x0 + .1, z], [x1 - .1, z], [(x0 + x1) / 2, z + .5]], y0, R, sg };
}
// verse 2, the Gilliam chain (G05): chart bars -> cell bars on "crime" (board) -> on "soundbite" the board's bars turn to
// rows of teeth and wind-up teeth hop out of the speakerphone onto the table -> a red drape drops over them, they
// stretch under it, and on "unveiled" it whips off a jail model in the teeth's spot -> on "jails" the model rises on
// stilts while real cells shoot up on the playa. Draft 9: the cell bars and the wire then stay until spin 2.
function chainState(t) {
  const crime = wt(7, 'crime'), right = wt(7, 'right'), sb = wt(8, 'soundbite'), un = wt(9, 'unveiled'), f1 = WB_T.f1(), r1 = WB_T.r1(), f2 = WB_T.f2(), r2 = WB_T.r2(), off = r2 - .25;
  return { bars: ease(t, crime - .2, crime + .6) * (1 - ease(t, off, off + .25)), wire: ease(t, right - .1, right + .35) * (1 - ease(t, off, r2 + .2)),
    teeth: ease(t, sb - .15, sb + .2) * (1 - ease(t, un - .3, un + .05)), sb,
    melt: (i) => t > r1 ? 0 : ease(t, f1 - .12 + i * .06, f1 + .3 + i * .06), // bars 0-4, then 5: the line chart and its axes
    steep: t < r1 ? 0 : t < r2 ? 1 : 2, grow: t > off && t < r2 + .7 ? ease(t, r2, r2 + .7) : 1, pop: (i) => f2 + i * .17 };
}
const WB_SHEAR = [0, .45, .7]; // how much steeper the line chart is after each spin
const WB_TT = 1 + .45 / 1.1; // the table top, in board units below the board's top edge
function whiteboard(t, emissive) {
  const B = boardMap(t); if (!ok([B.tl, B.tr, B.bl, B.br])) return;
  if (!emissive) for (const [x, z] of B.legs) seg(B.R(x, B.y0 + .1, WBZ), B.R(x, TOP - B.sg, z), .04 * kAt(B.tl), '#6b4a2a');
  const a = B.tr[0] - B.tl[0], b = B.tr[1] - B.tl[1], c = B.bl[0] - B.tl[0], d = B.bl[1] - B.tl[1];
  if (a * d - b * c <= 0) { if (!emissive) { poly([B.tl, B.tr, B.br, B.bl], '#dcd6c6', '#8a7458', 2); const kk = .03 * kAt(B.tl); for (const v of [.3, .7]) seg([lerp(B.tl[0], B.bl[0], v), lerp(B.tl[1], B.bl[1], v), B.tl[2]], [lerp(B.tr[0], B.br[0], v), lerp(B.tr[1], B.br[1], v), B.tr[2]], kk, '#9a7e58'); } return; } // its back: a pale board with a wooden brace, so a turn never flickers light/dark
  g.save(); g.setTransform(a, b, c, d, B.tl[0], B.tl[1]);
  const m = melt(t), burn = ease(t, L_(35).s - .5, L_(35).s + 4);
  if (emissive) { if (burn > 0 && t < L_(35).s + 18) boardFire(t, burn); g.restore(); return; }
  // the board, its bottom edge sagging and dripping in the heat
  const sag = (u, i, k) => 1 + m * (.1 + .32 * u * u) * k + (i % 3 === 1 ? m * .2 * k * Math.sin(i * 7) ** 2 : 0);
  g.beginPath(); g.moveTo(-.04, -.05); g.lineTo(1.04, -.05); for (let i = 10; i >= 0; i--) { const u = i / 10; g.lineTo(u * 1.08 - .04, sag(u, i, 1.15) + .02); } g.closePath(); g.fillStyle = '#b8b1a2'; g.fill();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(1, 0); for (let i = 10; i >= 0; i--) { const u = i / 10; g.lineTo(u, sag(u, i, 1)); } g.closePath(); paintSheet();
  const ch = chainState(t);
  g.save(); g.clip(); charts(t, 1, ch); if (ch.bars > .5) cellBars(t, ch);
  if (!ch.wire && !ch.teeth && burn <= 0 && ch.melt(5) <= 0) { const k = WB_SHEAR[ch.steep]; g.save(); g.transform(1, -k, 0, 1, 0, k * .58); chartClimbers(t); g.restore(); } // the climbers keep to the steeper line
  boardBurnPaper(t); g.restore();
  meltStreams(t, ch);
  g.restore();
}
const WB_COLS = ['#2f6fb5', '#c7362b', '#2f6fb5', '#c7362b', '#2f6fb5'];
function meltStreams(t, ch) { // board units, unclipped: the melted bars run off the sheet's bottom edge down to the table top
  for (let i = 0; i < 5; i++) { const mt = ch.melt(i); if (mt < .25 || mt >= 1) continue; const x = .08 + i * .085 + .03, w = .03 * (1 - ease(mt, .7, 1)), foot = Math.min(WB_TT, 1.02 + (mt - .25) * 1.4);
    g.fillStyle = WB_COLS[i]; g.beginPath(); g.moveTo(x - w, 1.0); g.lineTo(x + w, 1.0); g.lineTo(x + w * .6, foot); g.lineTo(x - w * .6, foot); g.closePath(); g.fill(); }
}
function wbPuddles(t) { // the melted chart lies in puddles on the table top under the easel, then dries up in the instrumental
  const f1 = WB_T.f1(); if (t < f1 + .2 || t > 64) return; const dry = 1 - ease(t, 61, 63.5);
  const P5 = [...WB_COLS, '#c7362b'], X = [0, 1, 2, 3, 4].map((i) => WBX0 + 1.5 * (.08 + i * .085 + .03)).concat([WBX0 + 1.5 * .76]);
  for (let i = 0; i < 6; i++) { const pu = ease(t, f1 + .3 + i * .06, f1 + .8 + i * .06) * dry; if (pu <= 0) continue; const r = (.1 + .05 * rnd(i, 7)) * pu, cx = X[i], cz = WBZ - .1 - .08 * rnd(i, 8);
    const pts = []; for (let j = 0; j < 18; j++) { const a = j / 18 * TAU, rr = r * (1 + .2 * n1(140 + i, a * 1.6)); pts.push(PL(cx + Math.cos(a) * rr * 1.3, TOP + .004, cz + Math.sin(a) * rr * .8)); }
    if (!ok(pts)) continue; poly(pts, P5[i]); const hp = PL(cx - r * .4, TOP + .005, cz + r * .2); if (hp[2] > .2) { g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(hp[0], hp[1], r * .35 * kAt(hp), r * .1 * kAt(hp), 0, 0, TAU); g.fill(); } }
}
function wbPops(t) { // refrain 2 "facts": the cell bars pop off the board one by one and fly into the nearest dust devil
  const ch = chainState(t), f2 = WB_T.f2(); if (t < f2 || t > f2 + 3) return;
  const devils = typeof whirlItems === 'function' ? whirlItems(t).filter((o) => o.kind === 'devil') : [];
  for (let i = 0; i < 5; i++) { const u = (t - ch.pop(i)) / 1.8; if (u < 0 || u > 1) continue;
    const lx = WBX0 + 1.5 * (.0925 + i * .085), S = Lw(lx, TOP + 1.04, WBZ - .03), pe = easeOutBack(clamp(u / .14)), pop = Lw(lx + .1 * (i - 2), TOP + 1.04 + .35 * pe, WBZ - .03 - .6 * pe);
    let D = null, best = 1e9; for (const o of devils) { const dd = Math.hypot(o.X - S[0], o.Z - S[2]); if (dd < best) { best = dd; D = [o.X, 0, o.Z]; } }
    if (!D) D = [S[0] + 6, 0, S[2] + 8];
    const v = smooth(clamp((u - .14) / .86)), orb = 1.4 * (1 - v * .6), an = t * 7 + i * 1.3, tgt = [D[0] + Math.cos(an) * orb, 2 + 7 * v, D[2] + Math.sin(an) * orb * .8];
    const X = lerp(pop[0], tgt[0], v), Y = lerp(pop[1], tgt[1], v * v), Z = lerp(pop[2], tgt[2], v), q = P(X, Y, Z); if (q[2] < .3) continue; const k = kAt(q), ang = u * 9 + i, L = .45 * k * (1 - .4 * v);
    seg([q[0] - Math.sin(ang) * L, q[1] - Math.cos(ang) * L, q[2]], [q[0] + Math.sin(ang) * L, q[1] + Math.cos(ang) * L, q[2]], Math.max(3, .09 * k), '#2a2a2e'); }
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
    for (let i = 0; i < 5; i++) { if (t > ch.pop(i)) continue; const x = lerp(.08 + i * .085, .075 + i * .083, m), w = lerp(.025, .074, m), col = rgb(mix(dark, ivory, m)); // popped bars are in the air (wbPops)
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
  const hs = [[.25, .38, .3, .5, .62], [.2, .34, .44, .6, .78], [.16, .3, .47, .66, .86]][ch.steep]; // steeper after each spin
  if (bars <= .5) for (let i = 0; i < 5; i++) { const x = .08 + i * .085, h = lerp(hs[i] + .05 * Math.sin(t * .7 + i), .82, bars) * ch.grow, w = lerp(.06, .025, bars), mt = ch.melt(i); g.fillStyle = WB_COLS[i];
    if (mt <= 0) { g.fillRect(x, .9 - h, w, h); continue; }
    const top = .9 - h + mt * (h + .3), bot = .9 + mt * 1.6 * (h + .3); if (top > 1.15) continue; // "facts": it slides down off the board, its foot running ahead like a drip
    g.beginPath(); g.moveTo(x, top); g.lineTo(x + w, top); g.lineTo(x + w * .82, bot); g.quadraticCurveTo(x + w / 2, bot + .04, x + w * .18, bot); g.closePath(); g.fill(); }
  // line chart (right) that only goes up; on "that's right" it kinks into barbed wire; on "wars" it climbs off the board
  const ml = ch.melt(5) * 1.1, sk = WB_SHEAR[ch.steep]; if (ml > 0) { g.save(); g.translate(0, ml); }
  g.strokeStyle = '#2a2a2e'; g.lineWidth = .012; g.beginPath(); g.moveTo(.56, .1); g.lineTo(.56, .9); g.lineTo(.96, .9); g.stroke();
  const pts = [[.58, .8], [.66, .72], [.73, .76], [.8, .58], [.87, .5], [.93, .34]].map(([x, y], i) => [x, y - sk * (x - .58) - soar * i * i * .09 - ch.wire * i * i * .012]);
  const wire = ch.wire, line = [];
  for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 4; k++) { const u = k / 4, a = pts[i], b = pts[i + 1], nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny), z = (k % 2 ? 1 : -1) * .028 * wire * (k ? 1 : 0);
    line.push([lerp(a[0], b[0], u) + nx / nl * z, lerp(a[1], b[1], u) + ny / nl * z]); }
  line.push(pts[pts.length - 1]);
  g.strokeStyle = rgb(mix([199, 54, 43], [58, 56, 62], wire)); g.lineWidth = lerp(.02, .012, wire); g.beginPath(); line.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
  if (wire > 0) { g.lineWidth = .007; for (let i = 1; i < line.length - 1; i += 2) { const [x, y] = line[i], s = .022 * wire; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y + s); g.moveTo(x + s, y - s); g.lineTo(x - s, y + s); g.stroke(); } }
  if (ml > 0) g.restore();
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
  const s = L_(2).s; if (t > L_(2).e + .3) return; // draft 11: no fade in; each drops onto the table from out of frame (dropHeight) and lands by s + .3
  const land = (i) => s - .2 + i * .14, fallAt = (i) => { const [x, z] = TAPE_AT[i]; return dropY(t, land(i), dropHeight('tape' + i, land(i), x, TOP + .12, z)); };
  if (t < s - 6) return;
  const D = SEATS[2], dp = PL(D.x, SEAT, D.z); if (dp[2] < .25) return; const dk = kAt(dp), ev = wt(2, 'every');
  // the top drawer of the drawer-torso suit (the one that clears the table edge) pulls out to take them; car.js's middle drawer is hidden by the table here
  const open = ease(t, ev - .45, ev - .05) * (1 - ease(t, L_(2).e - .1, L_(2).e + .25)), T = typeof TORSO !== 'undefined' ? TORSO : .59, sh = dp[1] - (T + .03) * dk, dy = sh + (T > .6 ? .08 : .1) * dk, dw = .26 * dk, dh = .1 * dk, d = open * .2 * dk;
  const tray = [dp[0], dy + dh + d * .6];
  if (open > 0) { g.fillStyle = '#2a1608'; g.fillRect(dp[0] - dw / 2, dy, dw, dh); g.fillStyle = '#a77a48'; g.beginPath(); g.moveTo(dp[0] - dw / 2, dy + dh); g.lineTo(dp[0] - dw / 2 - d * .3, dy + dh + d); g.lineTo(dp[0] + dw / 2 + d * .3, dy + dh + d); g.lineTo(dp[0] + dw / 2, dy + dh); g.fill();
    g.fillStyle = '#5a3a1c'; g.fillRect(dp[0] - dw / 2 - d * .25, dy + dh + d * .15, dw + d * .5, d * .7); } // the tray, open toward us
  let inTray = 0;
  for (let i = 0; i < TAPE_N; i++) { const u = tapeHop(t, i), [x, z] = TAPE_AT[i], fy = fallAt(i); if (fy === null) continue; const p = PL(x, TOP + fy, z); if (p[2] < .25) continue; const k = kAt(p);
    if (u >= 1) { inTray++; continue; }
    const e = u * u * (3 - 2 * u), sx = lerp(p[0], tray[0], e), sy = lerp(p[1], tray[1], e) - Math.sin(u * Math.PI) * .07 * k, sk = lerp(k, dk * .4, e);
    g.save(); g.translate(sx, sy); g.rotate(Math.sin(u * Math.PI) * (i % 2 ? .35 : -.35)); recorder(0, 0, sk * (u > 0 ? 1 : 1 + .04 * Math.sin(t * 12 + i)), t, i, u === 0 && t > s + .2); g.restore(); }
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
// draft 11: after its window a press goes on rising until the lens has lost it (it vanished in one frame, 45.3), and its
// faces are cut at the near plane, not dropped, when the drone passes close (polyN / segN in car.js)
function newsPress(t) { for (const [li, lv] of NEWS) { const s = L_(li).s, e = L_(li + 1).s + .3; if (lv < 3 && t > s - .3 && (t < e || seenSpan(t, s, e, (u) => { const [X, Z] = carLocalToWorld(u, -1.25, -1.0); return [X, TOP + 1 + newsLift(u, li, lv), Z, 1.6]; }, 6, .05))) newsOne(t, li, lv); } }
function newsLift(t, li, lv) { const ex = L_(li + 1).s - (lv < 3 ? .25 : .45); return clamp((t - ex) / (lv < 3 ? .4 : .6), 0, 4) ** 2 * 16; } // refrain 3 (the playa press in its cage): a 0.6 s rise (it was yanked out in three frames, 180.1)
function newsOne(t, li, lv) { // refrain 3 is seen from the driver's hole: a press four times the size, out on the playa beyond the far row
  // draft 9: no alpha fade any more (it left a translucent grey slab, 0:45.5): the papers drop in from high up, and at the
  // end the whole press lifts straight up out of frame in 0.4 s. Dark outlines keep it readable through the dust haze.
  const s = L_(li).s, n = wt(li, 'news'), lift = newsLift(t, li, lv);
  const px = -1.25, pz = -1.0, hw = 1.05, up = easeOutBack(clamp((t - s - .65) / .6)), postH = 1.85 * up;
  const S = lv < 3 ? 1 : 4, X0 = lv < 3 ? 0 : carX(n) - CX, Z0 = 14;
  const Q = (x, y, z) => lv < 3 ? PL(x, y + lift, z) : PL(X0 + (x - px) * S, (y + lift - TOP) * S, Z0 + (z - pz) * S), kS = (p) => kAt(p) * S;
  const slam = t < n - .14 ? 0 : t < n ? ease(t, n - .14, n) : 1 - .06 * Math.sin((t - n) * 18) * Math.exp(-(t - n) * 6), plateY = TOP + lerp(1.3, .08, slam) * up; // the plate hits on the word
  g.save();
  const iron = '#34302e', ironLit = '#5c5550', brass = '#c9a24a', edge = '#141110', ew = lv < 3 ? 2 : 2.5;
  const box = (x0, x1, y0, y1, z0, z1, top, front, side) => { polyN([Q(x0, y1, z0), Q(x1, y1, z0), Q(x1, y1, z1), Q(x0, y1, z1)], top, edge, ew); polyN([Q(x1, y0, z0), Q(x1, y1, z0), Q(x1, y1, z1), Q(x1, y0, z1)], side, edge, ew); polyN([Q(x0, y0, z0), Q(x1, y0, z0), Q(x1, y1, z0), Q(x0, y1, z0)], front, edge, ew); };
  if (up > 0) { // base, posts, crossbar, screw and wheel
    box(px - hw - .12, px + hw + .12, TOP, TOP + .06, pz - .42, pz + .42, ironLit, iron, '#221f1e');
    for (const d of [-1, 1]) box(px + d * hw - .07, px + d * hw + .07, TOP, TOP + postH, pz - .07, pz + .07, ironLit, iron, '#221f1e');
    box(px - hw - .12, px + hw + .12, TOP + postH - .16, TOP + postH, pz - .1, pz + .1, ironLit, iron, '#221f1e');
    const sa = Q(px, TOP + postH + .25, pz), sb = Q(px, plateY + .12, pz); segN(sa, sb, .07 * kS(sa), brass);
    for (let k = 0; k < 7; k++) { const yy = lerp(plateY + .12, TOP + postH, k / 7), q0 = Q(px - .05, yy, pz - .04), q1 = Q(px + .05, yy + .05, pz - .04); segN(q0, q1, 2, 'rgba(90,60,20,.6)'); } // the thread
    const wc = Q(px, TOP + postH + .25, pz), wk = kS(wc), spin = slam * 6 + (t - s) * .5; if (wc[2] > .2) { g.strokeStyle = brass; g.lineWidth = .04 * wk; g.beginPath(); g.ellipse(wc[0], wc[1], .42 * wk, .12 * wk, 0, 0, TAU); g.stroke();
    for (let k = 0; k < 4; k++) { const a = spin + k / 4 * TAU; g.beginPath(); g.moveTo(wc[0], wc[1]); g.lineTo(wc[0] + Math.cos(a) * .42 * wk, wc[1] + Math.sin(a) * .12 * wk); g.stroke(); } } }
  // the papers: three broadsheets, upright and fluttering in the air, then flattened under the plate and squeezed over the edge
  for (let i = 0; i < 3; i++) {
    const land = s + .5 + i * .45, fall = ease(t, land - 1.2, land), flat = ease(t, n - .14, n), sq = ease(t, n, n + .7);
    const fl = (1 - flat) * (1 - .6 * fall), cx = lerp(px - .7 + i * .7 + 1.5 * (i - 1) * (1 - fall), px - .45 + i * .45, flat), cy = lerp(TOP + 9 - i * .4, TOP + .5 + .25 * (i % 2), fall) + .12 * fl * Math.sin(t * 3.3 + i * 2), cz = lerp(pz - .1, pz - .15 - sq * .2, flat);
    const psi = fl * .7 * Math.sin(t * 2.4 + i * 1.7) + (1 - fall) * (i - 1) * .6, tilt = lerp(.15 * Math.sin(t * 2 + i), Math.PI / 2, flat), w = .95 * (1 + sq * .2), h = .7;
    const U = [Math.cos(psi), 0, Math.sin(psi)], V = [0, Math.cos(tilt), Math.sin(tilt) * -1];
    const at = (a, b) => { let x = cx + U[0] * a * w + V[0] * b * h, y = cy + U[1] * a * w + V[1] * b * h, z = cz + U[2] * a * w + V[2] * b * h; if (flat > 0) y = lerp(y, TOP + .07 + i * .005, flat); return Q(...(z < -TD && flat > .5 ? drape([[x, z]], y)[0] : [x, y, z])); };
    const sheet = (a0, b0, a1, b1, col) => polyN([at(a0, b0), at(a1, b0), at(a1, b1), at(a0, b1)], col);
    // flattened: the front half is squeezed out (b < 0 runs toward the edge) and droops over it
    const bs = (b) => flat > 0 && b < 0 ? b * (1 + sq * 1.4) : b;
    polyN([at(-.5, bs(-.5)), at(.5, bs(-.5)), at(.5, .5), at(-.5, .5)], '#efe9d9', '#2a2520', 1.5); if (fl > .05 || flat < 1) sheet(-.5, .38, .5, .5, '#26221f');
    for (let r = 0; r < 2; r++) sheet(-.42, .25 - r * .12, .3 - r * .2, .31 - r * .12, '#3b3632');
    for (let c = 0; c < 4; c++) for (let r = 0; r < 5; r++) { const b0 = bs(.06 - r * .11); sheet(-.44 + c * .23, b0 - .045, -.26 + c * .23, b0, 'rgba(120,110,95,.55)'); }
  }
  if (up > 0) { box(px - hw + .1, px + hw - .1, plateY, plateY + .12, pz - .38, pz + .38, ironLit, iron, '#221f1e'); } // the plate, over the papers
  if (lv >= 2) { // a cell drops over the press
    const dropT = n + .45, cd = t < dropT - .35 ? 0 : t < dropT ? ease(t, dropT - .35, dropT) : 1, cy = (1 - cd) * 3.5 + (t > dropT ? .08 * Math.abs(Math.sin((t - dropT) * 14)) * Math.exp(-(t - dropT) * 5) : 0);
    if (cd > 0) { const x0 = px - hw - .3, x1 = px + hw + .3, z0 = pz - .55, z1 = pz + .55, y0 = TOP + cy, y1 = TOP + 2.45 + cy;
      for (let k = 0; k <= 9; k++) { const x = lerp(x0, x1, k / 9); segN(Q(x, y0, z0), Q(x, y1, z0), .05 * kS(Q(x, y0, z0)), '#2a2226'); segN(Q(x, y0, z1), Q(x, y1, z1), .04 * kS(Q(x, y0, z1)), '#2a2226'); }
      for (const y of [y0, y1, (y0 + y1) / 2]) { segN(Q(x0, y, z0), Q(x1, y, z0), .07 * kS(Q(x0, y, z0)), '#3b3232'); segN(Q(x1, y, z0), Q(x1, y, z1), .06 * kS(Q(x1, y, z0)), '#3b3232'); } } }
  if (lv >= 3) { // and a chain with a padlock
    const lockT = n + .85, lk = ease(t, lockT - .3, lockT), x0 = px - hw - .3, x1 = px + hw + .3, z0 = pz - .58;
    if (lk > 0) { for (const [ya, yb] of [[.2, 2.2], [2.2, .2]]) for (let k = 0; k < 18 * lk; k++) { const u = k / 18, q = Q(lerp(x0, x1, u), TOP + lerp(ya, yb, u), z0), kk = kS(q); if (q[2] < .2) continue; g.strokeStyle = '#8f8a80'; g.lineWidth = .025 * kk; g.beginPath(); g.ellipse(q[0], q[1], .07 * kk, .04 * kk, (ya < yb ? -1 : 1) * .5 + (k % 2) * 1.2, 0, TAU); g.stroke(); }
      const q = Q(px, TOP + 1.2 - (1 - lk) * 1.5, z0 - .05), kk = kS(q), shut = ease(t, lockT, lockT + .15); if (q[2] > .2) { g.strokeStyle = '#b8b2a6'; g.lineWidth = .06 * kk; g.beginPath(); g.arc(q[0], q[1] - .22 * kk - (1 - shut) * .1 * kk, .16 * kk, Math.PI, TAU); g.stroke();
      g.fillStyle = brass; g.fillRect(q[0] - .24 * kk, q[1] - .22 * kk, .48 * kk, .4 * kk); g.fillStyle = '#2a1e10'; g.beginPath(); g.arc(q[0], q[1] - .04 * kk, .05 * kk, 0, TAU); g.fill(); g.fillRect(q[0] - .02 * kk, q[1] - .04 * kk, .04 * kk, .12 * kk); } } }
  g.restore();
}
function cage(p, k, legs, who, t) { // a cell on spindly stilt legs; p = ground point, k = px per metre; legs 0..1 grows the stilts; who (optional) = its prisoner
  if (p[2] < .2) return; const L = 7 * legs, x = p[0], y = p[1];
  g.strokeStyle = '#3b3232'; g.lineWidth = Math.max(1, .12 * k); g.lineCap = 'round';
  for (const d of [-1, -.4, .4, 1]) { g.beginPath(); g.moveTo(x + d * 1.1 * k, y - L * k); g.quadraticCurveTo(x + d * 1.4 * k, y - L * .5 * k, x + d * 1.5 * k, y); g.stroke(); }
  const cy = y - L * k; g.fillStyle = '#6d6058'; g.fillRect(x - 1.3 * k, cy - .25 * k, 2.6 * k, .25 * k); g.fillRect(x - 1.3 * k, cy - 2.75 * k, 2.6 * k, .3 * k);
  g.fillStyle = 'rgba(40,30,30,.35)'; g.fillRect(x - 1.2 * k, cy - 2.45 * k, 2.4 * k, 2.2 * k);
  if (who !== undefined && legs > .3) prisoner(who, x, cy - .25 * k, k, t || 0);
  g.lineWidth = Math.max(1, .09 * k); for (let i = 0; i <= 7; i++) { const bx = x - 1.2 * k + i * 2.4 / 7 * k; g.beginPath(); g.moveTo(bx, cy - 2.45 * k); g.lineTo(bx, cy - .25 * k); g.stroke(); }
}
// draft 9 (Nakamura): each cell holds one of the people the song is about, a flat cut-out behind the bars, no faces:
// the scientist, the press, the poor, the bluebird, the burner with a guitar case. (x, y) = the cell floor, k px per metre.
function prisoner(who, x, y, k, t) {
  const sw = Math.sin(t * 1.3 + who * 2) * .03, skin = '#e8d4b4', head = (hx, hy, r) => { g.fillStyle = skin; g.beginPath(); g.arc(hx, hy, r * k, 0, TAU); g.fill(); };
  const legs = (col, w = .09) => { g.strokeStyle = col; g.lineWidth = Math.max(1, w * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(x - .12 * k, y - .75 * k); g.lineTo(x - .14 * k, y); g.moveTo(x + .12 * k, y - .75 * k); g.lineTo(x + .14 * k, y); g.stroke(); };
  g.save(); g.translate(x, y); g.rotate(sw); g.translate(-x, -y);
  if (who === 0) { // the scientist: a white lab coat, a clipboard held to the chest
    legs('#3a3a44'); g.fillStyle = '#f4f1e8'; g.beginPath(); g.moveTo(x - .22 * k, y - 1.42 * k); g.lineTo(x + .22 * k, y - 1.42 * k); g.lineTo(x + .3 * k, y - .55 * k); g.lineTo(x - .3 * k, y - .55 * k); g.fill();
    g.strokeStyle = '#c9c4b6'; g.lineWidth = Math.max(1, .02 * k); g.beginPath(); g.moveTo(x, y - 1.4 * k); g.lineTo(x, y - .58 * k); g.stroke();
    g.fillStyle = '#a77a48'; g.fillRect(x - .2 * k, y - 1.2 * k, .24 * k, .32 * k); g.fillStyle = '#f8f4ea'; g.fillRect(x - .17 * k, y - 1.15 * k, .18 * k, .24 * k);
    head(x, y - 1.58 * k, .14); g.fillStyle = '#26303a'; g.fillRect(x - .15 * k, y - 1.62 * k, .3 * k, .06 * k); } // safety goggles
  else if (who === 1) { // the press: trench coat, hat with a card in the band, a big press camera with its flash pan
    legs('#2e2a26'); g.fillStyle = '#7d6a52'; g.beginPath(); g.moveTo(x - .22 * k, y - 1.4 * k); g.lineTo(x + .22 * k, y - 1.4 * k); g.lineTo(x + .32 * k, y - .55 * k); g.lineTo(x - .32 * k, y - .55 * k); g.fill();
    head(x, y - 1.56 * k, .13); g.fillStyle = '#3a3128'; g.fillRect(x - .22 * k, y - 1.68 * k, .44 * k, .05 * k); g.fillRect(x - .13 * k, y - 1.84 * k, .26 * k, .17 * k); g.fillStyle = '#f2ede0'; g.fillRect(x + .02 * k, y - 1.78 * k, .1 * k, .06 * k);
    g.fillStyle = '#26221f'; g.fillRect(x - .3 * k, y - 1.32 * k, .36 * k, .26 * k); g.fillStyle = '#5d7f9a'; g.beginPath(); g.arc(x - .12 * k, y - 1.19 * k, .09 * k, 0, TAU); g.fill();
    g.strokeStyle = '#c9a46a'; g.lineWidth = Math.max(1, .03 * k); g.beginPath(); g.moveTo(x + .02 * k, y - 1.32 * k); g.lineTo(x + .02 * k, y - 1.55 * k); g.stroke(); g.fillStyle = '#c9a46a'; g.beginPath(); g.ellipse(x + .02 * k, y - 1.58 * k, .13 * k, .05 * k, 0, 0, TAU); g.fill(); }
  else if (who === 2) { // the poor: a patched coat, a cap, an empty wooden bowl held out
    legs('#4b4a5a'); g.fillStyle = '#6b6a78'; g.beginPath(); g.moveTo(x - .22 * k, y - 1.38 * k); g.lineTo(x + .22 * k, y - 1.38 * k); g.lineTo(x + .28 * k, y - .62 * k); g.lineTo(x - .28 * k, y - .62 * k); g.fill();
    g.fillStyle = '#8a7a5c'; g.fillRect(x - .16 * k, y - 1.02 * k, .12 * k, .12 * k); head(x, y - 1.53 * k, .13); g.fillStyle = '#3d3c48'; g.beginPath(); g.ellipse(x + .02 * k, y - 1.63 * k, .16 * k, .06 * k, 0, Math.PI, TAU); g.fill();
    g.fillStyle = '#8a5a30'; g.beginPath(); g.ellipse(x + .02 * k, y - 1.05 * k, .22 * k, .13 * k, 0, 0, Math.PI); g.fill(); g.fillStyle = '#5a3418'; g.beginPath(); g.ellipse(x + .02 * k, y - 1.05 * k, .22 * k, .05 * k, 0, 0, TAU); g.fill(); }
  else if (who === 3) { // the bluebird, on a swing perch
    const py = y - 1.25 * k; g.strokeStyle = '#8f6d48'; g.lineWidth = Math.max(1, .03 * k); g.beginPath(); g.moveTo(x - .45 * k, py); g.lineTo(x + .45 * k, py); g.moveTo(x - .43 * k, py); g.lineTo(x - .43 * k, y - 2.2 * k); g.moveTo(x + .43 * k, py); g.lineTo(x + .43 * k, y - 2.2 * k); g.stroke();
    g.translate(x, py); g.scale(1.8, 1.8); g.translate(-x, -py); // a big bird, so it reads in the cell
    g.fillStyle = '#3f78c8'; g.beginPath(); g.ellipse(x, py - .22 * k, .2 * k, .24 * k, -.2, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x + .1 * k, py - .1 * k); g.lineTo(x + .38 * k, py + .12 * k); g.lineTo(x + .22 * k, py - .02 * k); g.fill(); // body and tail
    g.fillStyle = '#d9783a'; g.beginPath(); g.ellipse(x - .06 * k, py - .14 * k, .12 * k, .13 * k, -.2, 0, TAU); g.fill(); // its rusty breast
    g.fillStyle = '#3f78c8'; g.beginPath(); g.arc(x - .1 * k, py - .5 * k, .13 * k, 0, TAU); g.fill(); g.fillStyle = '#e8b23a'; g.beginPath(); g.moveTo(x - .22 * k, py - .52 * k); g.lineTo(x - .34 * k, py - .48 * k); g.lineTo(x - .22 * k, py - .45 * k); g.fill();
    g.fillStyle = '#2c5a9a'; g.beginPath(); g.ellipse(x + .06 * k, py - .26 * k, .14 * k, .08 * k, .5, 0, TAU); g.fill(); }
  else { // the burner: fur coat and goggles, a guitar case stood on end beside them
    g.fillStyle = '#3a2618'; g.beginPath(); g.ellipse(x + .38 * k, y - .28 * k, .17 * k, .26 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x + .38 * k, y - .72 * k, .12 * k, .18 * k, 0, 0, TAU); g.fill(); g.fillRect(x + .33 * k, y - 1.12 * k, .1 * k, .4 * k);
    g.fillStyle = '#c9a46a'; g.fillRect(x + .36 * k, y - .5 * k, .04 * k, .06 * k);
    legs('#2a2228'); g.fillStyle = '#d8452f'; g.beginPath(); g.moveTo(x - .26 * k, y - 1.4 * k); g.lineTo(x + .22 * k, y - 1.4 * k); g.lineTo(x + .32 * k, y - .62 * k); g.lineTo(x - .36 * k, y - .62 * k); g.fill();
    g.strokeStyle = '#f0b23a'; g.lineWidth = Math.max(1, .05 * k); g.beginPath(); g.moveTo(x - .3 * k, y - 1.36 * k); g.lineTo(x + .2 * k, y - .66 * k); g.stroke(); // a sash
    head(x, y - 1.56 * k, .13); g.fillStyle = '#1e1a22'; g.fillRect(x - .15 * k, y - 1.6 * k, .3 * k, .07 * k); g.fillStyle = '#e8b23a'; g.beginPath(); g.arc(x, y - 1.72 * k, .07 * k, 0, TAU); g.fill(); }
  g.restore();
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
const TEETH_LEAD = 7; // the front-right set, nearest the speakerphone: it hops out first, on "patent", and gets the seal
function windupTeeth(x, y, k, ch, t, i) { // a pair of wind-up chattering teeth, face on; (x, y) = feet on the table
  const w = .2 * k, open = ch * .09 * k, gy = y - .1 * k;
  g.fillStyle = '#e8902e'; for (const d of [-1, 1]) { g.beginPath(); g.ellipse(x + d * .1 * k + .015 * k * Math.sin(t * 22 + i + d), y - .015 * k, .045 * k, .02 * k, 0, 0, TAU); g.fill(); }
  g.fillStyle = '#4a1218'; g.fillRect(x - w * .8, gy - .14 * k - open, w * 1.6, .1 * k + open);
  g.fillStyle = '#e07a8a'; g.beginPath(); g.ellipse(x, gy, w, .05 * k, 0, 0, Math.PI); g.fill(); g.fillRect(x - w, gy - .03 * k, 2 * w, .03 * k);
  g.beginPath(); g.ellipse(x, gy - .17 * k - open, w, .055 * k, 0, Math.PI, TAU); g.fill(); g.fillRect(x - w, gy - .17 * k - open, 2 * w, .03 * k);
  g.fillStyle = '#fbf6e8'; for (let j = 0; j < 5; j++) { const tx = x - w * .82 + j * w * .34; g.fillRect(tx, gy - .075 * k, w * .3, .05 * k); g.fillRect(tx, gy - .14 * k - open, w * .3, .05 * k); }
  g.strokeStyle = '#c9a43a'; g.lineWidth = Math.max(1, .02 * k); g.save(); g.translate(x + w * 1.15, gy - .07 * k); g.rotate(t * 6 + i); g.beginPath(); g.moveTo(-.05 * k, 0); g.lineTo(.05 * k, 0); g.moveTo(0, -.05 * k); g.lineTo(0, .05 * k); g.stroke(); g.restore();
}
function jailModel(t, onPlaya) { // onPlaya: the depth-sorted call from tableInto, once the model has stepped off past the far row (draft 11)
  const sb = wt(8, 'soundbite'), pat = wt(8, 'patent'), s9 = L_(9).s, un = wt(9, 'unveiled'), jl = wt(9, 'jails'), back = L_(10).s;
  const sealH = dropHeight('patent', pat, TEETH[TEETH_LEAD].x, TOP + .45, TEETH[TEETH_LEAD].z); if (t < Math.min(pat - .7, pat - Math.sqrt(2 * sealH / 9.8))) return;
  // draft 11: no fade at the end. After "they want" the model steps off the far edge on its stilts and is left standing on the
  // playa among the real cells; it is drawn until the lens has lost it (JM_WALK, jmWorld)
  if (t > JM_WALK.t1() && !seenSpan(t, 0, JM_WALK.t1(), (u) => { const [X, Z] = jmWorld(u); return [X, 1.5, Z, 1.6]; }, 40, .2)) return;
  g.save();
  const drop = ease(t, s9 + .1, s9 + .55), whip = ease(t, un - .05, un + .55), grow = ease(t, un - .8, un - .1);
  // the teeth: hop out of the speakerphone on "soundbite" and chatter in two rows; hidden once the drape is down
  const hemClip = !onPlaya && drop > 0 && drop < 1 ? drapeHem(t, drop, whip, grow) : null; if (hemClip) { g.save(); g.beginPath(); hemClip.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.lineTo(hemClip[hemClip.length - 1][0], H + 4e3); g.lineTo(hemClip[0][0], H + 4e3); g.closePath(); g.clip(); } // draft 11: the drape falls over them, so only what is under its hem shows, and nothing is left sticking out when it lands
  if (!onPlaya && drop < 1) { const pc = PL(PHONE.x, TOP + .1, PHONE.z - melt(t) * .75 - .1);
    for (const T of TEETH) { const lead = T.i === TEETH_LEAD, st = lead ? pat - .55 : sb - .1 + T.i * .07, u = clamp((t - st) / .45), p = PL(T.x, TOP, T.z);
      if (lead && u < 1 && p[2] > .2) { const fh = dropY(t, pat, sealH); if (fh !== null) waxSeal(p[0], p[1] - .34 * kAt(p) * 1.3, kAt(p), t, pat, .5, fh * kAt(p)); } // draft 11: the seal falls from out of frame onto the spot the lead set hops to
      if (u <= 0) continue; if (p[2] < .2 || pc[2] < .2) continue;
      const e = u * u * (3 - 2 * u), x = lerp(pc[0], p[0], e), y = lerp(pc[1], p[1], e) - Math.sin(u * Math.PI) * .5 * kAt(p) - (u >= 1 ? Math.abs(Math.sin(t * 11 + T.i)) * .04 * kAt(p) : 0), k = lerp(kAt(pc) * .5, kAt(p), e);
      windupTeeth(x, y, k * 1.3, Math.abs(Math.sin(t * 22 + T.i * 1.3)), t, T.i);
      if (lead && u >= 1) { const fh = t < pat ? dropY(t, pat, sealH) : 0; if (fh !== null) waxSeal(x, y - .34 * k * 1.3, k, t, pat, .5, fh * k); } } } // the patented original wears the notary seal
  if (hemClip) g.restore();
  // the jail model, revealed on "unveiled"; on "jails" it rises on stilt legs
  const jwz = jmOffset(t)[2] + (JM.z0 + JM.z1) / 2 > 2.9; // past the far row: drawn with the playa, behind the car layer
  if (whip > 0 && jwz === !!onPlaya) { const lift = t > jl - .1 ? easeOutBack(clamp((t - jl + .1) / .7)) * 1.3 : 0, pop = easeOutBack(clamp((t - un + .05) / .4)), h = .62 * pop, jw = jmOffset(t), y0 = TOP + lift + jw[1];
    const x0 = JM.x0 + jw[0], x1 = JM.x1 + jw[0], z0 = JM.z0 + jw[2], z1 = JM.z1 + jw[2], legY = jw[4] + TOP; // the stilts reach down to the playa once it is past the edge // jw: the walk off the table (draft 11)
    if (lift > 0) for (const [lx, lz] of [[x0 + .1, z0 + .08], [x1 - .1, z0 + .08], [x0 + .1, z1 - .08], [x1 - .1, z1 - .08]]) { const st = jw[3] ? Math.sin(t * 9 + lx * 3) * .12 * jw[3] : 0, a = PL(lx, y0, lz), b = PL(lx + (lx < x0 + .75 ? -.12 : .12), legY + Math.max(0, st), lz - .05 + st); seg(a, b, .035 * kAt(a), '#2a2226'); } // stepping while it walks
    box3(x0, x1, y0, y0 + h, z0, z1, ['#a49d91', '#7f786e', '#c9c3b6', '#3b3530']);
    const fp = PL(x0, y0, z0), fq = PL(x1, y0 + h, z0); if (fp[2] > .2 && fq[2] > .2 && h > .2) for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { // the cells' barred windows
      const cx0 = x0 + .06 + c * .36, cy0 = y0 + .06 + r * h / 2, cw = .28, chh = h / 2 - .1;
      poly([PL(cx0, cy0, z0 - .002), PL(cx0 + cw, cy0, z0 - .002), PL(cx0 + cw, cy0 + chh, z0 - .002), PL(cx0, cy0 + chh, z0 - .002)], '#231c1e');
      for (let k = 1; k < 5; k++) { const bx = cx0 + k * cw / 5, a = PL(bx, cy0, z0 - .004); seg(a, PL(bx, cy0 + chh, z0 - .004), .018 * kAt(a), '#d8d2c4'); } }
    if (h > .3) { const sp = PL(x1 - .22, y0 + h * .62, z0 - .01); if (sp[2] > .2) waxSeal(sp[0], sp[1], kAt(sp) * .6, t, un - 9); } // the plan carries the same seal
    const fl = PL(x0 + .2, y0 + h, (z0 + z1) / 2), ft = PL(x0 + .2, y0 + h + .35, (z0 + z1) / 2); if (fl[2] > .2 && h > .3) { seg(fl, ft, .015 * kAt(fl), '#3b3232'); const fk = kAt(ft); g.fillStyle = PAL.rosette; g.beginPath(); g.moveTo(ft[0], ft[1]); g.lineTo(ft[0] + (.22 + .02 * Math.sin(t * 6)) * fk, ft[1] + .06 * fk); g.lineTo(ft[0], ft[1] + .13 * fk); g.fill(); } }
  if (!onPlaya) drapeDraw(t, drop, whip, grow);
  g.restore();
}
// draft 11: the drape is tall enough to cover the teeth and the seal on the lead set (it used to land lower than them, and
// they vanished sticking out of it, 85.3)
function drapeShape(t, drop, whip, grow) { const { x0, x1, z0, z1 } = JM, up = (1 - drop) * 1.6 + whip * whip * 3.2, back2 = whip * 2.2, hh = lerp(.74, .8, grow), N = 12;
  const lump = (u) => hh * (.82 + .12 * Math.abs(Math.sin(u * 4 * Math.PI))) + .03 * Math.abs(Math.sin(t * 22 + u * 9)) * (1 - grow);
  const hem = (u) => .02 + .04 * Math.sin(u * 17 + t * 3) * (1 - drop * .5) + whip * .3 * Math.sin(u * 6 + t * 12);
  const at = (x, y, z) => PL(x, y + up, z + back2), top = [], front = [];
  for (let i = 0; i <= N; i++) { const u = i / N, x = lerp(x0 - .08, x1 + .08, u); top.push([x, TOP + lump(u), z0 - .02]); }
  for (let i = 0; i <= N; i++) { const u = i / N, x = lerp(x0 - .1, x1 + .1, u); front.push(at(x, TOP + hem(u), z0 - .1 - .04 * Math.sin(u * 13))); }
  return { top, front, at, N, z1 }; }
function drapeHem(t, drop, whip, grow) { const d = drapeShape(t, drop, whip, grow); return ok(d.front) ? d.front : null; }
function drapeDraw(t, drop, whip, grow) {
  // the drape: red velvet that drops over the teeth on "their grand plan", jiggles as they chatter and stretch under it,
  // then whips up and away (back, over the far row) on "unveiled"
  if (drop > 0 && whip < 1) { const { top, front, at, N, z1 } = drapeShape(t, drop, whip, grow);
    const vel = '#8e1b22', velLit = '#b8323a';
    poly([...top.map((p) => at(p[0], p[1], z1 + .02)).reverse(), ...top.map((p) => at(...p))], velLit); // the top of the drape
    poly([...top.map((p) => at(...p)), ...front.slice().reverse()], vel);
    for (let i = 1; i < N; i += 2) seg(at(top[i][0], top[i][1], top[i][2]), front[i], 2, 'rgba(40,5,8,.35)'); // folds
    for (let i = 0; i < N; i++) { const a = front[i]; if (a[2] > .2) seg(a, front[i + 1], .04 * kAt(a), '#d6a632'); } }
}
// the jail model's walk off the table: after "they want" it strides on its stilts to the far edge, steps down to the
// playa and stays there (world-fixed) while the table rolls on
const JM_WALK = { t0: () => L_(10).s - .2, t1: () => L_(10).s + 2.2, z: 4.3 }; // it strides high over the far row on its stilts (their tops are 2.45 m up, the eggs 1.6 m), and lands 1.7 m beyond the chairs
let jmRest = null;
function jmGround() { if (jmRest) return jmRest; const t1 = JM_WALK.t1(); return (jmRest = carLocalToWorld(t1, (JM.x0 + JM.x1) / 2, JM_WALK.z)); }
function jmWorld(u) { if (u >= JM_WALK.t1()) return jmGround(); const o = jmOffset(u); return carLocalToWorld(u, (JM.x0 + JM.x1) / 2 + o[0], (JM.z0 + JM.z1) / 2 + o[2]); }
function jmOffset(t) { // [dx, dy, dz, stepping] from the model's place on the table, car-local
  const t0 = JM_WALK.t0(), t1 = JM_WALK.t1(); if (t <= t0) return [0, 0, 0, 0, 0];
  const cx = (JM.x0 + JM.x1) / 2, cz = (JM.z0 + JM.z1) / 2;
  if (t < t1) { const u = ease(t, t0, t1), dz = lerp(0, JM_WALK.z - cz, u), down = smooth(clamp((cz + dz - 2.9) / (JM_WALK.z - 2.9))), feet = smooth(clamp((cz + dz - TD + .3) / .6)); return [0, -TOP * down, dz, 1 - ease(t, t1 - .3, t1), -TOP * feet]; }
  const [X, Z] = jmGround(), lc = worldToLocal(X, Z); return [lc[0] - cx, -TOP, lc[1] - cz, 0, -TOP]; }
const JAILS = [[4, 7, 1], [-5, 8.5, .9], [11, 10, 1.05], [-8.5, 13, 1], [15.5, 14, .95], [-1.5, 15, 1.1], [7.5, 18, 1], [-6, 20, .9], [13, 22, 1.15], [1.5, 24, 1.2]]; // inside JAILW's frame (local x -9..17), under 25 m back
function jails(t, list) { const j = wt(9, 'jails'); if (t < j - .1) return; const base = carX(j);
  JAILS.forEach(([x, z, s], i) => { const legs = easeOutBack(clamp((t - j + .1 - i * .09) / .8)) * s, X = base + x;
    list.push({ z: P(X, 0, z)[2], draw: () => { const p = P(X, 0, z); cage(p, kAt(p), legs, i % 5, t); }, shadow: () => shadowStick(X, 0, 7 * legs + 2.8, z, 2.6, t) }); }); }
function chips(t) { // "expand the wars and the military bets": casino chip stacks in red, white and blue grow on the table (draft 9: twice draft 7's size)
  const s = L_(21).s, e = L_(21).e, bets = wt(21, 'bets'); if (t < s || t > e + 1.2) return; const sink = 1 - ease(t, e + .2, e + 1.2);
  const ST = [...Array(6)].map((_, i) => ({ x: 1.2 + i * .33, z: -.65 + (i % 2) * .36, col: [['#c7362b', '#8e221b'], ['#f4efe6', '#c9c2b2'], ['#2f6fb5', '#1f4c80']][i % 3], i }))
    .sort((a, b) => PL(b.x, TOP, b.z)[2] - PL(a.x, TOP, a.z)[2]);
  for (const S of ST) { const n = Math.floor(clamp((t - s - S.i * .12) / 1.5) * 13 * sink) + Math.floor(ease(t, bets - .05, bets + .25) * 4 * sink), r = .2, th = .05;
    for (let c = 0; c < n; c++) { const y = TOP + c * th, p0 = PL(S.x, y, S.z), p1 = PL(S.x, y + th * .9, S.z); if (p0[2] < .15) continue; const k = kAt(p0), rx = r * k, qz = PL(S.x, y, S.z + r), ry = Math.max(Math.abs(qz[1] - p0[1]), .03 * k);
      g.fillStyle = S.col[1]; g.beginPath(); g.ellipse(p0[0], p0[1], rx, ry, 0, 0, Math.PI); g.lineTo(p1[0] - rx, p1[1]); g.ellipse(p1[0], p1[1], rx, ry, 0, Math.PI, 0, true); g.closePath(); g.fill(); // the edge
      g.fillStyle = S.i % 3 === 1 ? '#c7362b' : '#f4efe6'; for (let m = 0; m < 4; m++) { const mx = p0[0] + rx * (-.75 + m * .5); g.fillRect(mx - rx * .07, p1[1] + ry * .55, rx * .14, Math.max(1, (p0[1] - p1[1]) * .8)); } // edge stripes, so they read as chips
      g.fillStyle = S.col[0]; g.beginPath(); g.ellipse(p1[0], p1[1], rx, ry, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.stroke();
      g.strokeStyle = S.i % 3 === 1 ? 'rgba(199,54,43,.7)' : 'rgba(244,239,230,.7)'; g.lineWidth = Math.max(1, .012 * k); g.beginPath(); g.ellipse(p1[0], p1[1], rx * .62, ry * .62, 0, 0, TAU); g.stroke(); } }
}
// draft 11: no fade. The pie drops onto the table from out of frame; after the line it slides off the near edge, falls
// to the playa and lies there while the table rolls on (drawn until the lens has lost it).
const PIE_T = { x: -.15, z: -.95, land: () => L_(23).s - .05, slide: () => L_(23).e + .3, off: () => L_(23).e + .85, down: () => L_(23).e + .85 + Math.sqrt(2 * (TOP + .04) / 9.8) };
let pieRest = null; // where it lies on the playa (world X, Z): a constant from the car's own path, worked out once
function pieGround() { if (pieRest) return pieRest; const to = PIE_T.off(); return (pieRest = carLocalToWorld(to, PIE_T.x, -TD - .45)); }
function pieWorld(u) { // [X, Y, Z] of the pie's middle at song time u (for the lens test)
  if (u < PIE_T.off()) { const [X, Z] = carLocalToWorld(u, PIE_T.x, lerp(PIE_T.z, -TD - .45, ease(u, PIE_T.slide(), PIE_T.off()))); return [X, TOP + .06, Z]; }
  const [X, Z] = pieGround(), f = u - PIE_T.off(); return [X, Math.max(.03, TOP + .06 - 4.9 * f * f), Z]; }
function pie(t) { // "how many lies can you bake in this pie?": a real pie, one slice slumping over the edge
  const s = L_(23).s, e = L_(23).e, land = PIE_T.land(), H = dropHeight('pie', land, PIE_T.x, TOP + .06, PIE_T.z), fy = dropY(t, land, H); if (fy === null) return;
  if (t > PIE_T.down() + .5 && !seenSpan(t, 0, PIE_T.down() + .5, (u) => [...pieWorld(u), .5], 40, .2)) return;
  const sl = ease(t, wt(23, 'pie') - .5, e + .3), off = t >= PIE_T.off();
  let cx = PIE_T.x, cz = lerp(PIE_T.z, -TD - .45, ease(t, PIE_T.slide(), PIE_T.off())), y = TOP + .06 + fy;
  if (off) { const [X, Z] = pieGround(), lc = worldToLocal(X, Z); cx = lc[0]; cz = lc[1]; y = pieWorld(t)[1]; }
  const tip = off ? ease(t, PIE_T.off(), PIE_T.down()) * .5 : 0, flat = off || cz - .42 < -TD - .4; // over the edge it tips, then lies flat on the sand
  const disc = (r, a0, a1, oz, yy) => { const ps = [[cx, cz + oz]]; for (let i = 0; i <= 20; i++) { const a = lerp(a0, a1, i / 20); ps.push([cx + Math.cos(a) * r, cz + oz + Math.sin(a) * r * (1 - tip)]); } return (flat ? ps.map(([x, z]) => [x, yy, z]) : drape(ps, yy)).map((p) => PL(...p)); };
  poly(disc(.42, -1.1, 4.6, 0, y), '#c98a3e'); poly(disc(.36, -1.1, 4.6, 0, y + .01), '#e2b267');
  for (let i = 0; i < 6; i++) { const a = -1.1 + i * .95; seg(PL(cx, y + .015, cz), PL(cx + Math.cos(a) * .36, y + .015, cz + Math.sin(a) * .36 * (1 - tip)), 2, 'rgba(120,70,20,.5)'); }
  poly(disc(.42, -1.6, -1.1, -sl * .75 * (off ? 0 : 1), y), '#c98a3e');
}
function book(t) { // "it's a mystery book the way you look": an open book whose pages keep turning
  return; // draft 9: the board holds the book up as a mask (car.js), so the table copy stays hidden. Kept callable.
  const s = L_(25).s, e = L_(26).s; if (t < s - .2 || t > e + .5) return; const al = ease(t, s - .2, s + .2) * (1 - ease(t, e, e + .5)), cx = -1.5, cz = -.8;
  const pg = (ang) => { const c = Math.cos(ang), sn = Math.sin(ang); return [PL(cx, TOP + .05, cz - .3), PL(cx, TOP + .05, cz + .3), PL(cx + .45 * c, TOP + .05 + .45 * sn, cz + .3), PL(cx + .45 * c, TOP + .05 + .45 * sn, cz - .3)]; };
  g.save(); g.globalAlpha = al; poly([PL(cx - .5, TOP + .02, cz - .33), PL(cx + .5, TOP + .02, cz - .33), PL(cx + .5, TOP + .02, cz + .33), PL(cx - .5, TOP + .02, cz + .33)], '#5c1f2a');
  poly(pg(Math.PI), '#f2ead6', 'rgba(0,0,0,.2)', 1); poly(pg(0), '#f2ead6', 'rgba(0,0,0,.2)', 1);
  const turn = ((t - s) * 1.3) % 1; poly(pg(turn * Math.PI), '#fbf5e6', 'rgba(0,0,0,.25)', 1); g.restore();
}
function dime(t) { // "people had a dime": a real dime (silver, milled edge, a torch on its face) drops on the word, rattles flat, glints
  const d = wt(15, 'dime'); if (t < d - .4 || t > L_(16).e + .6) return; const al = 1 - ease(t, L_(16).e, L_(16).e + .6);
  const r = .3, th = .04, [cx, cz] = dimeSpot(t), fall = clamp((t - d + .4) / .4), land = t - d;
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
// "life's unfair" (draft 9, Gilliam S6): a seesaw on the table, big enough to read from the poor person's framing. One
// suit sits on the low end. From "share" eight tiny burners climb onto the high end, one per syllable, the eighth on
// "unfair", and the plank does not move. On "era" a crutch slides under the high end and props it there for good.
// (Called scales for the old balance it replaces.)
const SAW = { x: -1.2, z: .4, half: 2.5, hc: 1.05 };
function sawY(x, fold) { const a = Math.asin((SAW.hc - .05) / SAW.half); return TOP + (SAW.hc + (x - SAW.x) * Math.tan(a)) * fold; } // the plank's top at x (left end low)
function scales(t) {
  const sh = wt(17, 'share'), uf = wt(18, 'unfair'), era = wt(18, 'era'), s19 = L_(19).s; if (t < sh - .3 || t > s19 + 1) return;
  const up = easeOutBack(clamp((t - sh + .3) / .5)) * (1 - ease(t, s19 + .5, s19 + .95)); if (up <= .01) return; // pops up out of the table, folds flat after
  const { x: cx, z: cz, half } = SAW, x0 = cx - half * Math.cos(Math.asin((SAW.hc - .05) / half)), x1 = cx + half * Math.cos(Math.asin((SAW.hc - .05) / half)), dark = '#3a2412', wood = PAL.wood;
  const Y = (x) => sawY(x, up);
  // the trestle under the pivot
  for (const dz of [-.2, .2]) { const top = PL(cx, Y(cx) - .06, cz + dz); for (const dx of [-.45, .45]) { const ft = PL(cx + dx, TOP, cz + dz); seg(top, ft, .07 * kAt(top), dark); } }
  // the crutch, slid under the high end on "era" (drawn first: it is behind the plank's edge)
  const cr = ease(t, era - .15, era + .3); if (cr > 0) { const hx = x1 - .35, a = [hx, Y(hx) - .05, cz], b = [hx + .55 - (1 - cr) * 1.6, TOP, cz - .25 - (1 - cr) * .4]; crutch([lerp(b[0], a[0], cr), lerp(b[1], a[1], cr), lerp(b[2], a[2], cr)], b, .6); }
  // the plank: top face and front edge, outlined so it reads against the playa
  const w = .17, T0 = PL(x0, Y(x0), cz - w), T1 = PL(x1, Y(x1), cz - w), T2 = PL(x1, Y(x1), cz + w), T3 = PL(x0, Y(x0), cz + w), F0 = PL(x0, Y(x0) - .09, cz - w), F1 = PL(x1, Y(x1) - .09, cz - w);
  if (!ok([T0, T1, T2, T3, F0, F1])) return;
  poly([T0, T1, F1, F0], '#7d5228', dark, 2); poly([T0, T1, T2, T3], wood, dark, 2);
  const pv = PL(cx, Y(cx) - .05, cz - w - .01); g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(pv[0], pv[1], .07 * kAt(pv), 0, TAU); g.fill();
  // the one suit on the low end, heavy and calm
  // (a big heavy suit, head and shoulders over the far row)
  { const sx = x0 + .45, p = PL(sx, Y(sx), cz), k = kAt(p) * up * 1.5; if (p[2] > .2) { const bw = .3 * k, bh = .62 * k;
    g.strokeStyle = PAL.suit; g.lineWidth = .13 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(p[0] - .08 * k, p[1] - .05 * k); g.lineTo(p[0] - .12 * k, p[1] + .38 * k); g.moveTo(p[0] + .1 * k, p[1] - .05 * k); g.lineTo(p[0] + .14 * k, p[1] + .38 * k); g.stroke();
    g.fillStyle = PAL.suit; g.beginPath(); g.moveTo(p[0] - bw * .85, p[1] - bh); g.lineTo(p[0] + bw * .85, p[1] - bh); g.lineTo(p[0] + bw * 1.15, p[1]); g.lineTo(p[0] - bw * 1.15, p[1]); g.closePath(); g.fill();
    g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(p[0] - .06 * k, p[1] - bh); g.lineTo(p[0] + .06 * k, p[1] - bh); g.lineTo(p[0], p[1] - bh + .2 * k); g.fill(); g.fillStyle = '#b52c22'; g.fillRect(p[0] - .02 * k, p[1] - bh + .02 * k, .04 * k, .24 * k);
    g.fillStyle = PAL.rosette; g.beginPath(); g.arc(p[0] - .17 * k, p[1] - bh + .16 * k, .06 * k, 0, TAU); g.fill();
    egg(p[0], p[1] - bh - .17 * k, k * 1.1, true, 0); } }
  // eight tiny burners on the high end: hop up one per syllable, then stand there; on "unfair" all jump once, nothing moves
  const hop0 = sh - .02, gap = (uf - hop0) / 7;
  for (let j = 7; j >= 0; j--) { const at = hop0 + j * gap, hu = clamp((t - at + .3) / .3); if (hu <= 0) continue;
    const row = j < 5 ? 0 : 1, bx = x1 - .12 - (row ? (j - 5) * .28 + .14 : j * .24), by = Y(bx) + (row ? .46 : 0), from = [bx + .2, TOP, cz - .5], jump = t > uf ? Math.max(0, Math.sin(clamp((t - uf) / .35) * Math.PI)) * .2 : 0;
    const X = lerp(from[0], bx, hu), Yy = lerp(from[1], by, hu) + Math.sin(hu * Math.PI) * .5 + jump, Z = lerp(from[2], cz - .02 * j, hu), p = PL(X, Yy, Z); if (p[2] < .2) continue; const k = kAt(p) * up, col = ['#d8452f', '#2f6fb5', '#e8b23a', '#3c8c5a', '#7a3c8c', '#f2ede0', '#d8452f', '#2f6fb5'][j];
    g.strokeStyle = '#2a2228'; g.lineWidth = Math.max(1, .06 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(p[0] - .05 * k, p[1] - .2 * k); g.lineTo(p[0] - .06 * k, p[1]); g.moveTo(p[0] + .05 * k, p[1] - .2 * k); g.lineTo(p[0] + .06 * k, p[1]); g.stroke();
    g.fillStyle = col; g.beginPath(); g.moveTo(p[0] - .09 * k, p[1] - .42 * k); g.lineTo(p[0] + .09 * k, p[1] - .42 * k); g.lineTo(p[0] + .12 * k, p[1] - .18 * k); g.lineTo(p[0] - .12 * k, p[1] - .18 * k); g.fill();
    g.strokeStyle = col; g.lineWidth = Math.max(1, .05 * k); g.beginPath(); g.moveTo(p[0] - .08 * k, p[1] - .4 * k); g.lineTo(p[0] - .16 * k, p[1] - (t > uf ? .62 : .28) * k); g.moveTo(p[0] + .08 * k, p[1] - .4 * k); g.lineTo(p[0] + .16 * k, p[1] - (t > uf ? .62 : .28) * k); g.stroke(); // arms up on "unfair"
    g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(p[0], p[1] - .5 * k, .075 * k, 0, TAU); g.fill(); g.fillStyle = '#1e1a22'; g.fillRect(p[0] - .08 * k, p[1] - .53 * k, .16 * k, .035 * k); }
}
// "and limit the questions the media gets" (draft 9): three boom mics reach in over the table, each a pole with a grey
// mic hanging from a shock mount and a "?" flag; on "limit" the three poles tie themselves together in a knot and the
// mics hang from it in a bunch. micKnot() is the knot's centre in car-local metres (b7 flies the MIC head into it).
// draft 16 (Robin, 2:23: "the microphones just disappear. they should retract again before disappear"): after the line
// the knotted bundle is reeled back the way it came, out past the near end of the table and up out of frame (MIC_OUT),
// with the MIC head still hanging under it; nothing vanishes in view.
const MIC_KNOT = [-2.9, 2.75, -.95];
const MIC_OUT = { t0: () => L_(22).e + .1, dur: 1.5, d: [-16, 3.5, -2.5] };
const micOut = (t) => { const u = clamp((t - MIC_OUT.t0()) / MIC_OUT.dur); return u * u * (3 - 2 * u) * (.6 + .4 * u); }; // slow to start, then quick
function micKnot(t) { const o = t == null ? 0 : micOut(t); return MIC_KNOT.map((v, c) => v + MIC_OUT.d[c] * o); }
function micBooms(t) {
  const s = L_(22).s, e = L_(22).e; if (t < s - .6 || t > MIC_OUT.t0() + MIC_OUT.dur + .05) return; const lim = wt(22, 'limit'), K = MIC_KNOT, out = micOut(t), OFF = MIC_OUT.d.map((v) => v * out);
  const reach = ease(t, s - .6, s + .1), N = 28;
  const poles = [0, 1, 2].map((i) => { const kn = ease(t, lim - .05 + i * .07, lim + .5 + i * .07), a = [-9.5, 3.1 - i * .35, -3.2 + i * .9], tip = [lerp(-9, -3.4 + i * .55, reach), 2.3 - i * .15, -1.6 + i * .55], ph = i * TAU / 3, rho = .48;
    const E1 = [[0, 1, 0], [.8, 0, .6], [.6, .6, -.5]][i], E2 = [[0, 0, 1], [0, 1, 0], [-.5, .5, .7]][i], AX = [[1, 0, 0], [0, 0, 1], [0, 1, 0]][i]; // each pole loops in its own plane, so they tangle
    const ring = (f, r, v) => [0, 1, 2].map((c) => K[c] + r * (Math.cos(f) * E1[c] + Math.sin(f) * E2[c]) + (v - .5) * .35 * AX[c]);
    const entry = ring(ph, rho, 0), pts = [];
    for (let k = 0; k <= N; k++) { const u = k / N, S = [lerp(a[0], tip[0], u), lerp(a[1], tip[1], u) + Math.sin(u * Math.PI) * .3, lerp(a[2], tip[2], u)];
      let Kp; if (u < .5) { const v = u / .5; Kp = [lerp(a[0], entry[0], v), lerp(a[1], entry[1], v) + Math.sin(v * Math.PI) * .25, lerp(a[2], entry[2], v)]; }
      else { const v = (u - .5) / .5; Kp = ring(ph + v * 1.4 * TAU, rho * (1 - .2 * v), v); } // round and round, through the others
      pts.push([lerp(S[0], Kp[0], kn) + OFF[0], lerp(S[1], Kp[1], kn) + OFF[1] * u, lerp(S[2], Kp[2], kn) + OFF[2]]); } // reeled out: the bundle slides back along the poles, the tips lifting
    return { i, kn, pts }; });
  const segs = []; for (const pl of poles) for (let k = 0; k < N; k++) { const A = PL(...pl.pts[k]), B = PL(...pl.pts[k + 1]); segs.push([(A[2] + B[2]) / 2, A, B, k % 4 ? '#a3a7ae' : '#7e828a']); }
  segs.sort((a, b) => b[0] - a[0]); for (const [, A, B, col] of segs) { seg(A, B, .055 * kAt(A), '#3c3f45'); seg(A, B, .035 * kAt(A), col); } // poles, back to front so the knot crosses itself
  for (const pl of poles) { const E = pl.pts[N], dir = [lerp(.42, 0, pl.kn), lerp(-.9, -1, pl.kn), lerp(.15, (pl.i - 1) * .12, pl.kn)], dl = Math.hypot(...dir), d = dir.map((v) => v / dl), sw = Math.sin(t * 3 + pl.i) * .04 * pl.kn;
    const top = [E[0] + sw, E[1] - .08, E[2]], bot = [top[0] + d[0] * .6, top[1] + d[1] * .6, top[2] + d[2] * .6], A = PL(...top), B = PL(...bot); if (A[2] < .2 || B[2] < .2) continue; const k = kAt(A);
    seg(PL(...E), A, .03 * k, '#3c3f45'); // the shock mount
    g.lineCap = 'round'; seg(A, B, .2 * k, '#2c2e33'); seg(A, B, .16 * k, '#6b6f77'); seg([lerp(A[0], B[0], .1) - .03 * k, lerp(A[1], B[1], .1), A[2]], [lerp(A[0], B[0], .8) - .03 * k, lerp(A[1], B[1], .8), A[2]], .04 * k, '#9ea2aa'); // the mic, a long grey capsule
    seg([lerp(A[0], B[0], .25), lerp(A[1], B[1], .25), A[2]], [lerp(A[0], B[0], .3), lerp(A[1], B[1], .3), A[2]], .21 * k, '#1f2024'); } // its ring
  for (const pl of poles) { const fp = PL(...pl.pts[Math.round(N * .42)]); if (fp[2] < .2) continue; const fk = kAt(fp); g.save(); g.translate(fp[0], fp[1]); g.rotate(pl.kn * (pl.i - 1) * .6); // the "?" flag cube on the pole
    g.fillStyle = ['#d8452f', '#2f6fb5', '#e8b23a'][pl.i]; g.fillRect(-.16 * fk, -.16 * fk, .32 * fk, .32 * fk); g.fillStyle = '#fbf3e3'; g.font = `bold ${Math.max(6, .3 * fk) | 0}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 0, .01 * fk); g.restore(); }
}
// draft 11: no fade. The two pieces drop onto the board from out of frame (dropHeight); after "foul play" the stomped rook is
// kicked off the near edge and the knight hops down after it; they lie on the playa where they land while the table rolls
// on, drawn with the playa (tableInto) until the lens has lost them.
const CHESS = { s: () => L_(26).s, e: () => L_(27).e, foul: () => wt(27, 'foul'), knightOff: () => L_(27).e + .2 };
let chessRest = null; // where the two pieces come to rest on the playa (world X, Z): constants from the car's path. Draft 11: 1.1 m beyond the near row's chairs (z -2.3), so the chairs roll past them instead of through them
function chessGround() { if (chessRest) return chessRest; const f = CHESS.foul(), ko = CHESS.knightOff(); return (chessRest = { rook: carLocalToWorld(f + 1.3, 1.4, -3.4), knight: carLocalToWorld(ko + .6, 2.5, -3.6) }); }
function chessPieceDraw(kind, p, k, rot, sqx, sqy) { // the small pieces, face on; p = screen point of the base, k px per metre (already x1.5)
  g.save(); g.translate(p[0], p[1]); g.rotate(rot);
  if (kind === 'rook') { const kr = k * 1.5; g.scale(sqx, sqy); g.fillStyle = '#efe6cf'; g.fillRect(-.16 * kr, -.55 * kr, .32 * kr, .55 * kr); g.fillRect(-.2 * kr, -.66 * kr, .4 * kr, .12 * kr); for (let i = 0; i < 3; i++) g.fillRect((-.2 + i * .15) * kr, -.76 * kr, .1 * kr, .1 * kr);
    g.strokeStyle = 'rgba(60,50,40,.4)'; g.lineWidth = Math.max(1, .015 * kr); g.strokeRect(-.16 * kr, -.55 * kr, .32 * kr, .55 * kr); }
  else { const kk = k; g.fillStyle = '#1d1a1a'; g.beginPath(); g.moveTo(-.2 * kk, 0); g.lineTo(.2 * kk, 0); g.lineTo(.12 * kk, -.3 * kk); g.quadraticCurveTo(.28 * kk, -.5 * kk, .05 * kk, -.78 * kk); g.lineTo(-.22 * kk, -.55 * kk); g.lineTo(-.02 * kk, -.5 * kk); g.lineTo(-.12 * kk, -.3 * kk); g.fill();
    g.fillStyle = '#efe6cf'; g.beginPath(); g.arc(.02 * kk, -.6 * kk, .025 * kk, 0, TAU); g.fill(); }
  g.restore(); }
function chessGroundSeen(t, which) { const G = chessGround()[which], b = which === 'rook' ? CHESS.foul() + 1.3 : CHESS.knightOff() + .6; return t <= b || seenSpan(t, 0, b, () => [G[0], .4, G[1], .9], 40, .2); }
function chessOnPlaya(t, list) { // the pieces lying on the playa (from tableInto)
  const S = 1.5; for (const which of ['rook', 'knight']) { const b = which === 'rook' ? CHESS.foul() + 1.3 : CHESS.knightOff() + .6; if (t < b || !chessGroundSeen(t, which)) continue; const [X, Z] = chessGround()[which];
    ACT.note('table:chess:' + which, X, Z, .5, { h: .4, group: 'chessSmall' });
    list.push({ z: P(X, 0, Z)[2], draw: () => { const q = P(X, .02, Z); if (q[2] < .3) return; const k = kAt(q) * S; if (which === 'rook') chessPieceDraw('rook', q, k, 5, 1.6, .28); else chessPieceDraw('knight', q, k, 1.45, 1, 1); } }); } }
function chessPieces(t) { // the knight hops to the rook; on "foul play" it jumps two squares too far, stomps the rook flat and kicks it off the board
  const s = CHESS.s(), e = CHESS.e(); if (t < s - 6 || t > e + 1.4) return;
  const rook = wt(26, 'rook'), foul = CHESS.foul(), S = 1.5, ko = CHESS.knightOff();
  const kH = dropHeight('chessK', s, -2.5, TOP, -.4), rH = dropHeight('chessR', s - .3, 2.0, TOP, .4), kf = dropY(t, s, kH), rf = dropY(t, s - .3, rH);
  const ku = ease(t, s, rook), hop1 = Math.sin(ku * Math.PI) * .6, fu = clamp((t - foul + .25) / .45), stomp = fu >= 1 ? 1 : 0;
  let kx = lerp(-2.5, 1.0, ku), kz = lerp(-.4, .4, ku), ky = TOP + hop1 + (kf || 0);
  if (fu > 0) { kx = lerp(1.0, 2.0, fu); kz = .4; ky = TOP + Math.sin(fu * Math.PI) * 1.6; } // the illegal leap, high and long
  const off = clamp((t - ko) / .6); if (off > 0) { kx = lerp(2.0, 2.5, off); kz = lerp(.4, -3.6, off); ky = lerp(TOP, 0, off * off) + Math.sin(off * Math.PI) * .7; } // it hops down off the near edge after the rook
  const squash = ease(t, foul + .2, foul + .3), kick = ease(t, foul + .55, foul + 1.3);
  if (rf !== null && kick < 1) { const rx = lerp(2.0, 1.4, kick), ry = TOP + (rf || 0) + Math.sin(kick * Math.PI) * .9 - (kick > .75 ? (kick - .75) * 4.6 : 0), pr = PL(rx, ry, .4 - kick * 3.8); if (pr[2] > .2) { const kr = kAt(pr) * S * 1.5; // draft 9: the rook 1.5x
    chessPieceDraw('rook', pr, kAt(pr) * S, kick * 5, 1 + squash * .6, 1 - squash * .72);
    if (squash > 0 && kick < .3) { g.strokeStyle = `rgba(240,230,210,${.6 * (1 - kick / .3)})`; g.lineWidth = Math.max(1, .03 * kr); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI + Math.PI, r0 = .4 * kr, r1 = (.6 + squash * .3) * kr; g.beginPath(); g.moveTo(pr[0] + Math.cos(a) * r0, pr[1] + Math.sin(a) * r0 * .5); g.lineTo(pr[0] + Math.cos(a) * r1, pr[1] + Math.sin(a) * r1 * .5); g.stroke(); } } } } // the stomp's dust lines
  if (kf !== null && off < 1) { const pk = PL(kx, ky + (squash > 0 && kick === 0 ? -.05 : 0) + squash * .25 * (1 - kick) * (1 - off), kz); if (pk[2] > .2) chessPieceDraw('knight', pk, kAt(pk) * S, fu > 0 && fu < 1 ? -.4 * Math.sin(fu * Math.PI) : kick > 0 && kick < .4 ? .5 : off > 0 ? 1.45 * ease(off, .5, 1) : 0, 1, 1); }
}
function truth(t, emissive) { // "put the truth in a box": a small light carried into the open drawer
  return; // draft 9: the 8 cm light is retired; the LENS head goes into nested crates instead (instruments.js). Kept callable.
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
  // once the dime is down the ants walk round its rim, drawn over it
  const dm = wt(15, 'dime'); tableBite(t); chessPieces(t); speakerphone(t); muteButton(t); if (t < dm) ants(t); tapeRecorders(t); dime(t); if (t >= dm) ants(t); scales(t); pie(t); book(t); chips(t); jailModel(t); newsPress(t);
  wbPuddles(t); whiteboard(t, false); wbPops(t);
}
function tablePropsFront(t) { truth(t, false); micBooms(t); }
// scene hook: table-chain things that live on the playa. Pushes {z, draw, shadow} into list.
function tableInto(t, list) {
  const li = 32, s = L_(li).s, e = L_(li + 1).s + .3; // the refrain-3 press stands on the playa, depth-sorted with it
  if (t > s - .3 && (t < e || seenSpan(t, s, e, (u) => [carX(wt(li, 'news')), 4 + newsLift(u, li, 3) * 4, carZ(u) + 14, 5], 6, .05))) list.push({ z: P(carX(wt(li, 'news')), 0, CZ + 14)[2], draw: () => newsOne(t, li, 3) }), ACT.note('table:press', carX(wt(li, 'news')), carZ(t) + 14, 4.7, { h: 10 + newsLift(t, li, 3) * 4, group: 'press' });
  if (t > JM_WALK.t0() && (t <= JM_WALK.t1() || seenSpan(t, 0, JM_WALK.t1(), (u) => { const [X, Z] = jmWorld(u); return [X, 1.5, Z, 1.6]; }, 40, .2))) { const [X, Z] = jmWorld(t); if (jmOffset(t)[2] + (JM.z0 + JM.z1) / 2 > 2.9) ACT.note('table:jail', X, Z, .8, { h: 2.2, group: 'jail' }); list.push({ z: P(X, 0, Z)[2], draw: () => jailModel(t, true) }); } // the jail model once it has stepped off the table
  chessOnPlaya(t, list);
}
