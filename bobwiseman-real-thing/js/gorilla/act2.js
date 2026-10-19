// Act 2, refrain 1 + break (49.3-81.5). See STORYBOARD-gorilla.md. He gets up resolved; dreams of bananas through the
// held voice (51-63.77); the bubble pops and he is on the monkey's thin branch copying the flick; the branch cracks, he
// falls (thud 66.21, banana on his head 66.72); then over the harmonica solo the vine trick: he ties the banana to a vine,
// bends a young tree down, lets go (~75), is yanked up and swings, crashes into a bush (~79). The banana sways, shut.
'use strict';
const a2_TH = -Math.PI / 2 * .92; // the gorilla's own lie rotation (cast.js)

// ---------------------------------------------------------------- helpers
// the gorilla drawn with NO ground shadow, rotated `rot` about body point `piv` (default the feet), which sits at (x, y).
// It uses the lie pose and undoes its rotation, so the shadow (which only standing poses draw) never floats in the air.
// o.sq squashes about (x, y) in screen axes; o.flip mirrors him.
function a2_gor(g, x, y, s, P, o = {}) {
  const piv = o.piv || [0, 0];
  g.save(); g.translate(x, y);
  if (o.sq) g.scale(1 + o.sq * .6, 1 - o.sq);
  if (o.rot) g.rotate(o.rot);
  if (o.flip) g.scale(-1, 1);
  g.translate(-piv[0] * s, -piv[1] * s);
  g.rotate(-a2_TH); g.translate(0, .4 * s);
  gorilla(g, 0, 0, s, Object.assign({}, P, { lie: true, squash: 0, flip: 1 }));
  g.restore();
}
// where body point (bx, by) of an a2_gor(x, y, s, P, o) lands in world space
function a2_b2w(x, y, s, o, bx, by) {
  const piv = o.piv || [0, 0]; let px = (bx - piv[0]) * s, py = (by - piv[1]) * s;
  if (o.flip) px = -px;
  const r = o.rot || 0, c = Math.cos(r), sn = Math.sin(r);
  let wx = px * c - py * sn, wy = px * sn + py * c;
  if (o.sq) { wx *= 1 + o.sq * .6; wy *= 1 - o.sq; }
  return [x + wx, y + wy];
}
// a bent tube (ink under colour), outline LW on screen whatever the transform; units are whatever g is in
function a2_tube(g, p0, p1, bend, w, col) {
  const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend, lw = LW / sc(g);
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const [c, ww] of [[INK, w + lw * 2], [col, w]]) { g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = c; g.lineWidth = ww; g.stroke(); }
}
// a vine from p0 to p1 hanging `sagY` below the straight line, with two small leaves
function a2_vine(g, p0, p1, sagY, w, leaves = true) {
  const cx = (p0[0] + p1[0]) / 2, cy = (p0[1] + p1[1]) / 2 + sagY, lw = LW / sc(g);
  g.lineCap = 'round';
  for (const [c, ww] of [[INK, w + lw * 2], ['#4f8a3c', w]]) { g.beginPath(); g.moveTo(p0[0], p0[1]); g.quadraticCurveTo(cx, cy, p1[0], p1[1]); g.strokeStyle = c; g.lineWidth = ww; g.stroke(); }
  if (!leaves) return;
  for (const [u, side] of [[.3, 1], [.62, -1]]) {
    const x = a2_q(p0[0], cx, p1[0], u), y = a2_q(p0[1], cy, p1[1], u), a = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
    a2_leaf(g, x + Math.cos(a + side * 1.57) * w * 1.6, y + Math.sin(a + side * 1.57) * w * 1.6, w * 1.9, a + side * .9, '#62a552');
  }
}
function a2_leaf(g, x, y, s, a, col) { g.save(); g.translate(x, y); g.rotate(a); ol(g, () => { g.moveTo(-s, 0); g.quadraticCurveTo(0, -s * .72, s, 0); g.quadraticCurveTo(0, s * .72, -s, 0); }, col, 4); g.restore(); }
function a2_star(g, x, y, r, a, col = '#ffe066') {
  g.save(); g.translate(x, y); g.rotate(a);
  ol(g, () => { for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; i ? g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : g.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath(); }, col, 4);
  g.restore();
}
const a2_q = (a, b, c, u) => (1 - u) * (1 - u) * a + 2 * u * (1 - u) * b + u * u * c;
// the cartoon dust cloud (act1 shot 6 idiom): puffs that grow and fade, jittering on twos
function a2_dust(g, t, t0, cx, cy, w, h, n, seed, dur = .6, col = '#efe4cc') {
  if (t < t0 || t > t0 + dur) return;
  const f2 = Math.floor(t * 12) / 12, r = M32(((f2 * 1000) | 0) + seed), k = eo(seg(t, t0, t0 + dur * .45));
  g.save(); g.globalAlpha = 1 - seg(t, t0 + dur * .45, t0 + dur);
  for (let i = 0; i < n; i++) { // two plumes, one each side, rising and spreading
    const sd = i % 2 ? 1 : -1, j = i >> 1, m = n >> 1;
    const x = cx + sd * (w * .42 + j * w * .2 * (.4 + .6 * k)), y = cy - 8 - j * h * .3 * k - r() * 10, rr = (38 + r() * 18) * (.55 + .6 * k) * (1 - j * .12);
    ol(g, ell(g, x, y, rr, rr * .85), col);
  }
  g.restore();
}
// leaves bursting out of something at t0, drifting down with drag
function a2_leafBurst(g, t, t0, cx, cy, n, seed, v0 = 1) {
  const dt = t - t0; if (dt < 0 || dt > 1.8) return;
  const r = M32(seed), d = (1 - Math.exp(-3 * dt)) / 3;
  g.save(); g.globalAlpha = 1 - seg(dt, 1.2, 1.8);
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (.08 + .84 * r()), v = (380 + r() * 520) * v0, s = 13 + r() * 9, sp = (r() - .5) * 10, col = r() < .5 ? '#5aa05a' : '#7dbd63';
    a2_leaf(g, cx + Math.cos(a) * v * d + Math.sin(dt * 5 + i) * 12, cy + Math.sin(a) * v * d + 150 * dt * dt, s, a + sp * dt, col);
  }
  g.restore();
}

// ---------------------------------------------------------------- the monkey's branch (act1 shot 8; scenery, no outline)
const a2_bu = (x) => (800 - Math.sqrt(Math.max(0, 640000 - 240 * (1500 - x)))) / 120; // x -> curve parameter (0 trunk .. 1 tip)
function a2_bpt(u, sag, top) { return [a2_q(1500, 1100, 760, u), (top ? a2_q(330, 300, 340, u) : a2_q(360, 326, 362, u)) + sag * 90 * u * u]; }
const a2_btop = (x, sag) => a2_bpt(a2_bu(x), sag, true)[1];
const a2_UB = a2_bu(1040); // where it cracks
function a2_bpoly(g, u0, u1, sag) {
  const n = 20; g.beginPath();
  for (let i = 0; i <= n; i++) { const p = a2_bpt(lerp(u0, u1, i / n), sag, true); i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
  for (let i = n; i >= 0; i--) { const p = a2_bpt(lerp(u0, u1, i / n), sag, false); g.lineTo(p[0], p[1]); }
  g.closePath(); g.fill();
}
function a2_bleaves(g, sag) { g.fillStyle = '#4f8f57'; for (const [x, y, r] of [[780, 330, 46], [820, 300, 38], [760, 360, 30]]) { g.beginPath(); g.arc(x, y + sag * 90, r, 0, TAU); g.fill(); } }
// sagIn bends the part by the trunk, sagOut the thin end; brk = { a, dx, dy } snaps the thin end off at x 1040
function a2_branch(g, sagIn, sagOut, brk) {
  g.fillStyle = '#5a3f2b';
  if (!brk) { a2_bpoly(g, 0, 1, sagIn); a2_bleaves(g, sagIn); return; }
  a2_bpoly(g, 0, a2_UB, sagIn);
  const P = a2_bpt(a2_UB, sagOut, true);
  g.save(); g.translate(P[0] + brk.dx, P[1] + brk.dy); g.rotate(brk.a); g.translate(-P[0], -P[1]);
  g.fillStyle = '#5a3f2b'; a2_bpoly(g, a2_UB, 1, sagOut); a2_bleaves(g, sagOut); g.restore();
}

// ---------------------------------------------------------------- the young tree and the bush (props: outlined)
const a2_SB = [1250, 905], a2_SL = 760, a2_VL = 240, a2_BX = 1380; // tree base, tree height, vine length, bush centre
// a point on the young tree, bent into a circular arc whose tip turns by th radians (+ bends left), and its heading
function a2_spt(th, u) {
  const k = th / a2_SL, a = k * u;
  if (Math.abs(k) < 1e-6) return [a2_SB[0], a2_SB[1] - u, 0];
  return [a2_SB[0] - (1 - Math.cos(a)) / k, a2_SB[1] - Math.sin(a) / k, a];
}
const a2_tip = (th) => a2_spt(th, a2_SL);
// the bend at which the tip reaches height y (the tip drops as the tree bends left)
function a2_solveTh(y) { let lo = 0, hi = 2.8; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (a2_tip(m)[1] < y) lo = m; else hi = m; } return (lo + hi) / 2; }
function a2_sapling(g, th) {
  const n = 24, Lp = [], Rp = [];
  for (let i = 0; i <= n; i++) {
    const [x, y, a] = a2_spt(th, a2_SL * i / n), w = lerp(18, 6, i / n), nx = Math.cos(a), ny = -Math.sin(a);
    Lp.push([x - nx * w, y - ny * w]); Rp.push([x + nx * w, y + ny * w]);
  }
  for (const [f, side] of [[.48, -1], [.64, 1], [.8, -1]]) { // side shoots
    const [x, y, a] = a2_spt(th, a2_SL * f), ha = Math.atan2(-Math.cos(a), -Math.sin(a));
    a2_leaf(g, x + Math.cos(ha + side * 1.2) * 34, y + Math.sin(ha + side * 1.2) * 34, 28, ha + side * .9, '#5aa05a');
  }
  ol(g, () => { Lp.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = Rp.length - 1; i >= 0; i--) g.lineTo(Rp[i][0], Rp[i][1]); g.closePath(); }, '#7a5636');
  const [x, y, a] = a2_tip(th), ha = Math.atan2(-Math.cos(a), -Math.sin(a));
  for (let i = 0; i < 6; i++) { const la = ha + (i - 2.5) * .5; a2_leaf(g, x + Math.cos(la) * 40, y + Math.sin(la) * 40, 44, la, i % 2 ? '#4b9150' : '#5fa85a'); }
  return [x, y];
}
function a2_bush(g, cx, by, sq = 0) {
  const C = [];
  for (let i = 0; i <= 8; i++) { const f = i / 8, s = Math.sin(Math.PI * f); C.push([cx + (f - .5) * 400, by - 35 - s * 55, 42 + s * 30]); }
  C.push([cx, by - 80, 66], [cx - 80, by - 70, 58], [cx + 85, by - 66, 58]);
  g.save(); g.translate(cx, by); g.scale(1 + sq * .5, 1 - sq); g.translate(-cx, -by);
  g.save(); g.globalAlpha = .22; g.fillStyle = '#20301c'; g.beginPath(); g.ellipse(cx, by + 4, 270, 20, 0, 0, TAU); g.fill(); g.restore();
  g.beginPath(); for (const [x, y, r] of C) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); }
  g.strokeStyle = INK; g.lineWidth = LW * 2 / sc(g); g.stroke(); g.fillStyle = '#4a8a4c'; g.fill();
  g.fillStyle = '#5ea25b'; g.beginPath(); for (const [x, y, r] of C) { g.moveTo(x - r * .2 + r * .5, y - r * .28); g.arc(x - r * .2, y - r * .28, r * .5, 0, TAU); } g.fill();
  const fr = M32(41); for (let i = 0; i < 9; i++) { const [x, y] = C[(fr() * C.length) | 0]; sparkle(g, x + (fr() - .5) * 50, y + (fr() - .5) * 30, 9, 1, fr() < .5 ? '#f6c7d8' : '#fff1a8'); }
  g.restore();
}

// ---------------------------------------------------------------- the dream (pink jungle; bananas peel, dance, rain)
function a2_dreamLand(g, t) { // the dream's own land, painted over the clearing (takes the dream wash): lilac canopy, pink lawn, candy palms, clouds
  const hz = 620, far = M32(5), mid = M32(6);
  for (const [cx, cy, n, r0] of [[330, 170, 5, 46], [1260, 120, 6, 52], [1640, 300, 4, 38]]) blobs(g, [...Array(n)].map((_, i) => [cx + (i - n / 2) * r0 * 1.1 + 20 * Math.sin(t * .3 + i), cy - Math.sin(Math.PI * (i + .5) / n) * r0 * .7, r0 * (.8 + .4 * Math.sin(Math.PI * (i + .5) / n))]), 'rgba(255,244,252,.8)');
  blobs(g, [...Array(26)].map((_, i) => [i * 80 + far() * 40, hz - 60 - far() * 70, 70 + far() * 40]), '#dcbfe9'); g.fillStyle = '#dcbfe9'; g.fillRect(0, hz - 70, W, 80);
  blobs(g, [...Array(18)].map((_, i) => [i * 115 + mid() * 50, hz - 10 - mid() * 60, 85 + mid() * 50]), '#c9a2dc'); g.fillStyle = '#c9a2dc'; g.fillRect(0, hz - 20, W, 40);
  g.fillStyle = vgrad(g, hz, H, [[0, '#f0bfd9'], [1, '#df9fc6']]); g.fillRect(0, hz, W, H - hz);
  g.fillStyle = 'rgba(150,70,130,.1)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(mid() * W, hz + 120 + mid() * 300, 300 + mid() * 200, 30, 0, 0, TAU); g.fill(); }
  tufts(g, 61, 140, hz + 20, H, '#c784b4'); flowers(g, 62, 130, hz + 40, H, ['#fff1a8', '#ffffff', '#ffd0e6', '#cdb8ef', '#f9b27c']);
  for (const [x, h, ln] of [[110, 560, .22], [330, 400, .08], [1790, 500, -.2], [1560, 330, .1]]) {
    g.strokeStyle = '#b07aa0'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, 980); g.quadraticCurveTo(x + ln * 300, 980 - h * .5, x + ln * 420, 980 - h); g.stroke();
    const tx = x + ln * 420, ty = 980 - h;
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .45 + Math.sin(t * .9 + i) * .04; g.save(); g.translate(tx, ty); g.rotate(a); g.fillStyle = i % 2 ? '#b984cf' : '#d29fe0'; g.beginPath(); g.ellipse(70, 0, 80, 22, 0, 0, TAU); g.fill(); g.restore(); }
    g.fillStyle = '#f3cf45'; for (let j = 0; j < 3; j++) { g.beginPath(); g.ellipse(tx - 14 + j * 14, ty + 18, 7, 18, (j - 1) * .3, 0, TAU); g.fill(); }
  }
}
function a2_banFace(g, x, y, L, a, happy) {
  g.save(); g.translate(x, y); g.rotate(a); const lw = LW / sc(g) * .8;
  for (const ex of [-.05, .05]) {
    if (happy) { g.beginPath(); g.moveTo(ex * L - L * .03, -L * .47); g.quadraticCurveTo(ex * L, -L * .52, ex * L + L * .03, -L * .47); g.strokeStyle = INK; g.lineWidth = lw; g.lineCap = 'round'; g.stroke(); }
    else { g.beginPath(); g.arc(ex * L, -L * .48, L * .022, 0, TAU); g.fillStyle = INK; g.fill(); }
  }
  g.beginPath(); g.moveTo(-L * .035, -L * .41); g.quadraticCurveTo(0, -L * .37, L * .035, -L * .41); g.strokeStyle = INK; g.lineWidth = lw; g.stroke();
  g.restore();
}
// seven bananas in a line on the dream lawn: they peel themselves (53.1-55.7), then dance a kick line from 56.77
function a2_dancers(g, t) {
  const L = 96, legL = 46;
  for (let i = 0; i < 7; i++) {
    const tp = 53.1 + i * .4, x0 = 960 + (i - 3) * 235;
    let p = t < tp ? 0 : back(seg(t, tp, tp + .35));
    const dk = seg(t, 56.77, 57.05), b = (t - 56.77) / .5 - i * .1; // beats of the kick line, a ripple along it
    const hop = dk * Math.abs(Math.sin(Math.PI * b)) * 30, kick = dk * Math.sin(Math.PI * b / 2);
    const a = dk * .2 * Math.sin(Math.PI * b / 2) + (1 - dk) * .05 * Math.sin(t * 2 + i);
    if (p > .9) p += .1 * Math.sin(t * 7 + i);
    const fx = x0, fy = 905;
    g.save(); g.globalAlpha = .2; g.fillStyle = '#5a3050'; g.beginPath(); g.ellipse(fx, fy + 4, 44 - hop * .4, 8, 0, 0, TAU); g.fill(); g.restore();
    const by = fy - legL - hop; // the banana's base (its little feet stand at fy)
    g.save(); g.translate(fx, by); g.rotate(a);
    for (const sd of [-1, 1]) {
      const kx = sd === 1 ? Math.max(0, kick) * 30 : Math.max(0, -kick) * -30, ky = (sd === 1 ? Math.max(0, kick) : Math.max(0, -kick)) * 14;
      const ft = [sd * 14 + kx, L * .12 + legL - ky + (hop > 0 ? 0 : 0)];
      a2_tube(g, [sd * 7, L * .1], ft, sd * 4, 9, '#e9b93a'); ol(g, ell(g, ft[0] + sd * 8, ft[1] + 2, 14, 7), '#c88f2a', 4);
    }
    g.restore();
    peeled(g, fx, by, L, a, p, 0);
    a2_banFace(g, fx, by, L, a, p > .5);
    if (t >= tp && t < tp + .45) { const k = seg(t, tp, tp + .45); for (let j = 0; j < 4; j++) sparkle(g, fx + Math.cos(j * 1.6 + 1) * (40 + k * 50), by - L * .9 + Math.sin(j * 1.6 + 1) * (30 + k * 30), 14, 1 - k); }
  }
}
// peeled bananas raining softly from 57.91, swaying like falling leaves; the big ones in front, clear of his face
function a2_rain(g, t, front) {
  const r = M32(903);
  for (let i = 0; i < 36; i++) {
    const ts = 57.91 + i * .16 + r() * .1, v = 150 + r() * 80, L0 = 36 + r() * 56, ph = r() * 6, xa = r(), xb = r(), xs = L0 > 70 ? (xa < .5 ? xb * 640 : 1280 + xb * 640) : xb * 1920;
    if ((L0 > 70) !== front || t < ts) continue;
    const dt = t - ts, y = -120 + dt * v; if (y > 1180) continue;
    peeled(g, xs + 40 * Math.sin(1.1 * dt + ph), y, L0, .45 * Math.sin(1.3 * dt + ph), .72 + .12 * Math.sin(3 * dt + ph), 0);
  }
}
const a2_DG = (t) => ({ x: 960 + 45 * Math.sin(t * .42), y: 640 + 20 * Math.sin(t * 1.7) + (1 - eo(seg(t, 52.4, 54.8))) * 420, s: 250, rot: .08 * Math.sin(t * .9) });
// the whole dream, drawn in screen space with its own slow camera (used inside the bubble and full frame)
function a2_dream(g, t) {
  g.save();
  const z = 1.18 - .18 * eo(seg(t, 52.3, 54.6)) + .05 * eio(seg(t, 54.6, 58.2)) + .26 * eio(seg(t, 58.2, 63.6));
  const fy = lerp(600, 520, eio(seg(t, 58.2, 63.6)));
  g.translate(960, fy); g.scale(z, z); g.translate(-960, -fy);
  jungle(g, t, { sky: 'dream', tree: false, ferns: false, sunX: 960, sunY: 250, sunR: 85, raysX: 260, land: (gg) => a2_dreamLand(gg, t) });
  a2_rain(g, t, false);
  a2_dancers(g, t);
  const D = a2_DG(t), o = { rot: D.rot };
  const wave = (ph) => -.8 + .1 * Math.sin(t * 2.4 + ph);
  const toM = eio(seg(t, 62.3, 63.25)), caught = t >= 61.6;
  const hR = caught ? [lerp(.66, .26, toM), lerp(wave(1.3), -.66, toM)] : [.66, wave(1.3)];
  const near = toM > .6;
  const P = { handL: [-.66, wave(0)], handR: hR, bendL: 40, bendR: -40, eyes: near ? 'open' : 'happy', mouth: near ? 'o' : 'grin', brow: near ? -.3 : -.2, look: near ? [.5, .5] : [0, 0],
    tilt: .06 * Math.sin(t * 1.3),
    after: caught ? (gg) => peeled(gg, hR[0] + .02, hR[1] - .02, .3, lerp(.35, -.9, toM), 1, 0) : null };
  a2_gor(g, D.x, D.y, D.s, P, o);
  if (t >= 59.9 && !caught) { // the one that falls into his hand
    const hw = a2_b2w(D.x, D.y, D.s, o, hR[0] + .02, hR[1] - .02), k = eio(seg(t, 59.9, 61.6));
    peeled(g, lerp(1240, hw[0], k), lerp(-90, hw[1], k), 75, .35 + .4 * Math.sin(t * 2) * (1 - k), 1, 0);
  }
  a2_rain(g, t, true);
  const tw = M32(55); for (let i = 0; i < 14; i++) { const x = tw() * W, y = 80 + tw() * 700, ph = tw() * 6; sparkle(g, x, y, 12 + tw() * 10, .35 + .35 * Math.sin(t * 2.2 + ph), '#fff7fc'); }
  g.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); // a soft pink-white glow round the edge: this is a dream
  const vg = g.createRadialGradient(W / 2, H / 2, H * .42, W / 2, H / 2, H * 1.02); vg.addColorStop(0, 'rgba(255,238,250,0)'); vg.addColorStop(1, 'rgba(255,232,248,.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H); g.restore();
}
// the thought bubble (world space): a cloud of circles, outlined, the dream showing through it
function a2_bubble(g, t, cx, cy, R) {
  const C = [[cx, cy, R * .8]];
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .25; C.push([cx + Math.cos(a) * R * .78, cy + Math.sin(a) * R * .7, R * .3 * (1 + .07 * Math.sin(t * 3 + i * 2))]); }
  g.save();
  g.beginPath(); for (const [x, y, r] of C) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); }
  g.strokeStyle = INK; g.lineWidth = LW * 2 / sc(g); g.stroke();
  g.clip(); g.setTransform(1, 0, 0, 1, 0, 0); a2_dream(g, t);
  g.restore();
}
// the bubble popping: a flash and droplets flying out (screen space)
function a2_pop(g, lt) {
  if (lt > .6) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = `rgba(255,236,249,${.92 * (1 - eo(seg(lt, 0, .25)))})`; g.fillRect(0, 0, W, H);
  const k = eo(seg(lt, 0, .6)); g.globalAlpha = 1 - seg(lt, .3, .6);
  for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + .3, d = 240 + k * 880 + (i % 3) * 70, rr = 22 * (1 - k) + 5; ol(g, ell(g, 960 + Math.cos(a) * d, 520 + Math.sin(a) * d * .66, rr, rr), '#fde4f3', 4); }
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + .5; sparkle(g, 960 + Math.cos(a) * (150 + k * 500), 520 + Math.sin(a) * (110 + k * 330), 26 * (1 - k) + 6, 1, '#ffffff'); }
  g.restore();
}

// ---------------------------------------------------------------- the vine trick (shot 6 also feeds shot 7's start)
const a2_S = 230; // his size in the young-tree shots
function a2_s6(t) {
  const s = a2_S, hand = [.42, -1.35];
  const thG = a2_solveTh(905 + hand[1] * s); // the bend at which his dangling feet reach the grass
  let th = 1.3; for (const tb of [72.15, 72.65, 73.15]) th += .28 * eio(seg(t, tb, tb + .28));
  const ground = t >= 73.3 && th >= thG - 1e-3;
  th = Math.min(th, thG);
  let sq = 0;
  if (ground) { // feet on the grass: he crouches into it with all his weight, quivering
    const tq = Math.min(t, 74.85);
    sq = .07 * eio(seg(tq, 73.45, 73.9)) + .008 * Math.sin(tq * 40) * seg(tq, 73.9, 74.1);
    th = a2_solveTh(905 + hand[1] * s * (1 - sq));
  }
  const rel = eo(seg(t, 74.85, 75.0)), thHold = th; th = th - .3 * rel;
  return { s, hand, th, thHold, ground, sq, fx: a2_tip(thHold)[0] - hand[0] * s };
}

// ---------------------------------------------------------------- shots
ACTS.push(...[
  // 1. (continues act1's last frame) he springs up off the grass, lands, looks up at the monkey's branch, resolved
  { t0: 49.3, t1: 51.0, draw(g, t, lt) {
    cam(g, lt, 1.7, 1.03, 1.1, 960, 540);
    jungle(g, t, { treeX: 1500, sunX: 520, raysX: 200 });
    a2_branch(g, 0, 0, null);
    const bite = 47.24, back2 = eo(seg(t, 50.1, 50.4));
    monkey(g, 1040, 330, 260, { eyes: back2 > .5 ? 'happy' : 'open', mouth: 'chew', chew: (t - bite) * 16, look: [lerp(.2, .6, back2), lerp(1, 0, back2)], tilt: lerp(.25, 0, back2),
      handL: [.06, -.5], handR: [.2, -.4], hold: (gg) => peeled(gg, .2, -.44, .36, -.2, 1, 1) });
    const s = 230, x0 = 760, yl = GROUND - 6 - .4 * s, t0 = 49.42, t1 = 49.85;
    const u = seg(t, t0, t1), e = eio(u), up = t >= t1;
    const fist = eo(seg(t, 50.45, 50.65)), nod = t > 50.45 ? ring(t - 50.45, 14, 6) * .08 : 0;
    const hR = [lerp(.6, .42, e), lerp(-.68, -.42, e)];
    const P = { handL: [lerp(-.35, -.42, e) - fist * .08, lerp(-.3, -.3, e) - fist * .3], handR: hR, bendL: lerp(-30, 40, e), bendR: -20,
      eyes: t < t0 ? 'open' : (up ? 'open' : 'squint'), brow: t < t0 ? -.5 : .75, mouth: t < t0 ? 'flat' : (up ? (fist > .3 ? 'grit' : 'flat') : 'grit'),
      look: t < t0 ? [1, .6] : (up ? [.65, -1] : [.3, -.5]), tilt: t < t0 ? .25 : (up ? .1 + nod : lerp(.25, .1, e)),
      after: (gg) => banana(gg, hR[0] + lerp(.07, .06, e), hR[1] - lerp(.09, .08, e), .42, lerp(1.2, -.5, e)) };
    if (!up) a2_gor(g, x0, lerp(yl, GROUND, eo(u)), s, P, { rot: a2_TH * (1 - back(u)) });
    else gorilla(g, x0, GROUND, s, Object.assign(P, { squash: ring(t - t1, 20, 7) * .12 }));
    a2_dust(g, t, t1, x0, GROUND + 4, 190, 80, 6, 7, .5);
  } },
  // 2. (the held voice) he stares up; his eyes go soft; a thought bubble swells out of his head and fills the frame
  { t0: 51.0, t1: 54.6, draw(g, t, lt) {
    cam(g, lt, 3.6, 1.25, 1.32, 900, 600);
    jungle(g, t, { treeX: 1500, sunX: 520, raysX: 200 });
    a2_branch(g, 0, 0, null);
    const full = t > 51.7;
    monkey(g, 1040, 330, 260, { eyes: full ? 'happy' : 'open', mouth: full ? 'smile' : 'chew', chew: (t - 47.24) * 16, look: [.6, 0], tilt: 0,
      handL: [.06, -.5], handR: [.2, -.4], hold: (gg) => peeled(gg, .2, -.44, .36, -.2, 1, 1) });
    const soft = seg(t, 51.5, 51.7), dream = t > 52.2, drop = eio(seg(t, 51.0, 51.4));
    gorilla(g, 760, GROUND, 230, { handL: [lerp(-.5, -.42, drop), lerp(-.6, -.3, drop)], handR: [.42, -.42], bendL: 40, bendR: -20,
      eyes: dream ? 'happy' : (soft > 0 ? 'half' : 'open'), brow: lerp(.75, -.3, soft), mouth: dream ? (t > 52.8 ? 'grin' : 'smile') : 'flat', look: [.65, -1], tilt: lerp(.1, .18, soft) + .03 * Math.sin(t * 2),
      after: (gg) => banana(gg, .48, -.5, .42, -.5) });
    for (const [x, y, r, tt] of [[708, 588, 13, 51.55], [674, 543, 20, 51.8], [632, 485, 28, 52.05]]) if (t >= tt) { const k = back(seg(t, tt, tt + .25)); ol(g, ell(g, x, y + Math.sin(t * 3 + x) * 3, r * k, r * k), '#fff3fa'); }
    if (t >= 52.25) a2_bubble(g, t, 520, 330, 70 + 1700 * eio(seg(t, 52.25, 54.55)) + 8 * Math.sin(t * 5));
  } },
  // 3. the dream, full frame: bananas peeled, dancing a kick line, raining softly; he floats among them, blissful,
  //    catches one and brings it to his mouth... and the dream wobbles as the bubble is about to pop
  { t0: 54.6, t1: 63.77, draw(g, t, lt) {
    const wob = seg(t, 63.45, 63.77);
    if (wob > 0) { const k = wob * .05 * Math.sin((t - 63.45) * 60); g.translate(960, 540); g.scale(1 + k + wob * .03, 1 - k + wob * .03); g.translate(-960, -540); }
    a2_dream(g, t);
  } },
  // 4. POP: reality. He is up on the monkey's thin branch. The monkey flicks a banana open; he copies the flick: nothing.
  //    64.62 the branch creaks and bends
  { t0: 63.77, t1: 65.0, draw(g, t, lt) {
    cam(g, lt, 1.23, 1.45, 1.5, 1000, 100);
    jungle(g, t, { treeX: 1500, sunX: 520, raysX: 200 });
    const creak = 64.62, cr = t >= creak ? eo(seg(t, creak, creak + .25)) * .35 + .1 * ring(t - creak, 18, 5) : 0, sag = .45 + cr;
    a2_branch(g, sag, sag, null);
    const flick = 63.95, mbite = 64.35, mp = t >= flick ? back(seg(t, flick, flick + .3)) : 0, meat = t >= mbite ? eo(seg(t, mbite, mbite + .2)) : 0;
    monkey(g, 1200, a2_btop(1200, sag) + 11, 240, { eyes: t > mbite + .1 ? 'happy' : 'open', mouth: t > mbite + .2 ? 'chew' : 'smile', chew: (t - mbite) * 16,
      look: t > creak && t < creak + .3 ? [-.8, .3] : [.5, -.2], tilt: 0, handL: [.06, -.5], handR: [.2, -.4], hold: (gg) => peeled(gg, .2, -.44, .36, -.2, mp, meat) });
    if (t >= flick && t < flick + .4) sparkle(g, 1200 - 13 + .2 * 240, a2_btop(1200, sag) + 11 - .5 * 240 - 60, 24, 1 - seg(t, flick, flick + .4));
    const gf = 64.22, fk = t >= gf ? Math.sin(Math.PI * seg(t, gf, gf + .22)) : 0, after = t > gf + .22;
    const hR = [.4 + fk * .15, -.42 - fk * .3], wake = t < 63.97, down = t >= creak;
    a2_gor(g, 880, a2_btop(880, sag) + 4, 230, { sit: true, handL: [-.36, -.3], handR: hR, bendL: 30, bendR: -30,
      eyes: down ? 'open' : (after ? 'half' : 'open'), brow: down ? -.6 : (after ? -.4 : .2), mouth: wake ? 'o' : (down ? 'o' : 'flat'),
      look: wake ? [-.3, 0] : (down ? [0, 1] : (t < gf ? [.8, -.1] : [.6, -.3])), tilt: down ? -.05 : 0, sweat: down ? seg(t, creak + .1, creak + .25) : 0,
      after: (gg) => banana(gg, hR[0] + .05, hR[1] - .07, .42, -.4 + fk * 1.1) });
    if (fk > .2) { g.strokeStyle = 'rgba(43,33,28,.6)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(880 + 120, a2_btop(880, sag) - 150, 30 + i * 12, -2.4, -1.6); g.stroke(); } }
    if (down) { const P0 = a2_bpt(a2_UB, sag, true), a = 1 - seg(t, creak, creak + .38); g.strokeStyle = `rgba(43,33,28,${.75 * a})`; g.lineWidth = 3.5; for (const d of [-1, 1]) { g.beginPath(); g.arc(P0[0], P0[1] + 14, 28 + (1 - a) * 10, d < 0 ? 3.6 : -.5, d < 0 ? 4.2 : .1); g.stroke(); } }
    a2_pop(g, lt);
  } },
  // 5. CRACK: the thin end snaps; he hangs in the air a beat, looking at us; falls; THUD on 66.21; the banana lands on his
  //    head on 66.72; he sits up dazed, stars going round, the banana balanced on his head
  { t0: 65.0, t1: 68.9, draw(g, t, lt) {
    const z = 1.04 + .36 * eio(seg(t, 66.95, 67.9)), shake = t >= 66.21 ? 9 * ring(t - 66.21, 42, 9) : 0;
    g.translate(0, shake); g.translate(846, 780); g.scale(z, z); g.translate(-846, -780);
    jungle(g, t, { treeX: 1500, sunX: 520, raysX: 200 });
    const crack = 65.0, det = 65.4, land = 66.28, thud = 66.21, bonk = 66.72, s = 230;
    const sagI = .8 * ring(t - crack, 11, 4.5);
    const brk = { a: t < det ? -.5 * back(seg(t, crack, crack + .18)) : lerp(-.5, .1, eio(seg(t, det, land))) + (t > land ? .05 * ring(t - land, 16, 6) : 0),
      dx: 110 * seg(t, det, land), dy: t < det ? 0 : 560 * ei(seg(t, det, land)) - (t > land ? 14 * Math.abs(ring(t - land, 14, 6)) : 0) };
    a2_branch(g, sagI, .8, brk);
    if (t < crack + .3) { const P0 = a2_bpt(a2_UB, .8, true), k = seg(t, crack, crack + .3); for (let i = 0; i < 5; i++) sparkle(g, P0[0] + Math.cos(i * 1.3) * (20 + k * 70), P0[1] + 10 + Math.sin(i * 1.3) * (16 + k * 50), 18, 1 - k, '#fff6c8'); }
    // the monkey rides the springing branch, chewing, unbothered
    const glance = t > 66.3 && t < 67.2;
    monkey(g, 1200, a2_btop(1200, sagI) + 11, 240, { eyes: glance ? 'open' : 'happy', mouth: 'chew', chew: (t - 64.35) * 16, look: glance ? [-.6, 1] : [.5, -.2], tilt: glance ? .2 : 0,
      handL: [.06, -.5], handR: [.2, -.4], hold: (gg) => peeled(gg, .2, -.44, .36, -.2, 1, 1) });
    // the gorilla
    const gyS = a2_btop(880, .8) + 4, lieO = { rot: a2_TH }, lieY = GROUND - 6 - .4 * s;
    const H = a2_b2w(880, lieY, s, lieO, .33, -.86); // where the banana comes to rest, on the side of his head
    const sitU = back(seg(t, 67.0, 67.5)), sitting = t >= 67.0, sitE = eo(seg(t, 67.0, 67.5));
    const daze = seg(t, 67.3, 67.6), wob = sitting ? .13 * Math.sin(t * 4.6) * daze : 0;
    let P, o, x, y, flat = 0;
    if (t < det) { // hanging in the air
      const hop = 10 * Math.sin(Math.PI * seg(t, crack, crack + .2)), look = t > crack + .15;
      x = 880; y = gyS - hop; o = {};
      P = { sit: true, handL: [-.42, -.36], handR: [.5, -.5], bendL: 30, bendR: -30, eyes: look ? 'half' : 'open', mouth: look ? 'flat' : 'o', brow: look ? -.4 : -.2, look: look ? [0, 0] : [.3, -.4] };
    } else if (t < thud) { // falling
      const f = ei(seg(t, det, thud)); x = 880; y = lerp(gyS, lieY, f); o = { rot: a2_TH * eio(seg(t, 65.62, thud)) };
      P = { sit: true, handL: [-.55, -1.0 + .08 * Math.sin(t * 40)], handR: [.55, -1.0 + .08 * Math.sin(t * 40 + 2)], bendL: 30, bendR: -30, eyes: 'open', mouth: 'o', brow: -.6, look: [0, -1] };
    } else if (!sitting) { // flat on his back
      x = 880; y = lieY; o = lieO; flat = .22 * ring(t - thud, 26, 8) + (t >= bonk ? .07 * ring(t - bonk, 24, 8) : 0);
      const ow = t < 66.6, bk = t >= bonk;
      P = { sit: true, handL: [-.4, -.32], handR: [.52, -.36], bendL: 30, bendR: -30, eyes: ow || bk ? 'squint' : 'open', mouth: ow || bk ? 'grit' : 'o', brow: -.5, look: [1, 0] };
    } else { // sitting up about his hips
      const hipL = a2_b2w(880, lieY, s, lieO, 0, -.15), hipS = [hipL[0], GROUND - .15 * s];
      x = lerp(hipL[0], hipS[0], sitE); y = lerp(hipL[1], hipS[1], sitE); o = { piv: [0, -.15], rot: a2_TH * (1 - sitU) };
      const goofy = t > 68.1;
      P = { sit: true, handL: [lerp(-.4, -.32, sitE), -.32], handR: [lerp(.52, .32, sitE), lerp(-.36, -.3, sitE)], bendL: 30, bendR: -30, eyes: 'cross', mouth: goofy ? 'smile' : 'o', brow: -.6, look: [0, 0], tilt: wob };
    }
    if (t >= bonk) { // the banana rests on his head, then rides up to the top of it as he sits up
      const bb = sitting ? sitE : 0, rest = [lerp(.33, .02, bb), lerp(-.86, -1.22, bb)], bounce = .07 * Math.max(0, ring(t - bonk, 16, 6)) * (1 - bb);
      const c = Math.cos(wob), sn = Math.sin(wob), rx = rest[0] + bounce, ry = rest[1] + .84;
      P.after = (gg) => banana(gg, rx * c - ry * sn, rx * sn + ry * c - .84, .42, lerp(-a2_TH, -.12, bb) + wob + .2 * ring(t - bonk, 14, 5));
    }
    g.save(); if (flat) { g.translate(880, GROUND - 6); g.scale(1 + flat * .6, 1 - flat); g.translate(-880, -(GROUND - 6)); }
    a2_gor(g, x, y, s, P, o); g.restore();
    if (t < bonk) { // the banana, knocked out of his hand at the crack, tumbling down after him
      const x0 = 880 + .55 * s, y0 = gyS - .55 * s, bx = lerp(x0, H[0], seg(t, crack, bonk));
      const by = t < 65.7 ? lerp(y0, 110, eo(seg(t, crack, 65.7))) : lerp(110, H[1], ei(seg(t, 65.7, bonk)));
      banana(g, bx, by, .42 * s, 7 * (t - bonk));
    }
    if (t > det && t < thud) { const f = seg(t, det, thud); g.strokeStyle = `rgba(43,33,28,${.45 * f})`; g.lineWidth = 4; for (let i = 0; i < 4; i++) { const lx = 780 + i * 60, ly = lerp(gyS, lieY, ei(f)) - 300 - i * 20; g.beginPath(); g.moveTo(lx, ly - 90); g.lineTo(lx, ly - 10); g.stroke(); } }
    a2_dust(g, t, thud, 750, GROUND + 6, 380, 150, 10, 3, .7);
    if (t >= bonk && t < bonk + .45) { const k = seg(t, bonk, bonk + .45); for (let i = 0; i < 5; i++) sparkle(g, H[0] + Math.cos(i * 1.25 + t * 5) * (50 + k * 40), H[1] - 10 + Math.sin(i * 1.25 + t * 5) * (24 + k * 20), 16, 1 - k); }
    if (sitting && daze > 0) { // stars going round his head
      const hc = a2_b2w(x, y, s, o, 0, -1.3);
      for (let i = 0; i < 4; i++) { const a = t * 4.2 + i * TAU / 4; a2_star(g, hc[0] + Math.cos(a) * 95, hc[1] + Math.sin(a) * 20 - 14, 17, t * 3 + i, '#ffe066'); }
    }
  } },
  // 6. (harmonica solo) an idea: close on his hands as he loops the vine round the banana's stem, three turns, a tug,
  //    and a sly look at us
  { t0: 68.9, t1: 71.9, draw(g, t, lt) {
    cam(g, lt, 3.0, 1.5, 1.56, 950, 560);
    jungle(g, t, { treeX: 260, sunX: 1500, raysX: 600 });
    const idea = 69.3, grab = 69.65, tie0 = 70.0, tie1 = 71.08, tug = 71.1, done = 71.45;
    const knot = [.35, -.45], top = [.78, -3.3];
    const pull = Math.sin(Math.PI * seg(t, tug, done)), banY = pull * .05;
    const hL = [.0, -.47 + banY]; // his left hand, crossing in front, holds the banana; the right one ties
    const dangle = [.78 + .04 * Math.sin(t * 1.8), -.42], rest = [.5, -.26];
    const w = (t - tie0) * TAU / .36;
    let hR;
    if (t < grab) hR = rest;
    else if (t < tie0) { const k = eio(seg(t, grab, grab + .2)), k2 = eio(seg(t, grab + .2, tie0)); hR = [lerp(lerp(rest[0], dangle[0], k), knot[0], k2), lerp(lerp(rest[1], dangle[1], k), knot[1], k2)]; }
    else if (t < tie1) hR = [knot[0] + .08 * Math.cos(w), knot[1] - .02 + .04 * Math.sin(w)];
    else if (t < done) { const k = eio(seg(t, tie1, tug + .12)); hR = [lerp(knot[0] + .08, .55, k), lerp(knot[1] - .02, -.92, k)]; }
    else { const k = eio(seg(t, done, done + .3)); hR = [lerp(.55, rest[0], k), lerp(-.92, rest[1], k)]; }
    const end = t < grab + .2 ? dangle : (t < tie0 ? hR : [knot[0], knot[1] + banY]);
    const turns = t < tie0 ? 0 : Math.min(3, Math.floor((t - tie0) / .36) + 1), sly = t >= done + .1;
    const P = { handL: [-.1, -.4], handR: hR, bendL: 0, bendR: 20,
      eyes: t >= idea && t < grab ? 'happy' : (sly ? 'squint' : 'open'), mouth: t >= idea && t < grab ? 'grin' : (sly ? 'grin' : 'flat'), brow: sly ? .3 : (t >= grab ? .5 : 0),
      look: t < idea ? [.7, -1] : (sly ? [0, 0] : [.6, .8]), tilt: t < idea ? .12 : (sly ? -.06 : .05),
      front: (gg) => { // the banana across his chest, stem to the right; the vine down to it
        banana(gg, .07, -.46 + banY, .5, Math.PI, 1, pull * .3);
        a2_vine(gg, top, end, t >= tug ? 0 : .12, .045, true);
      },
      after: (gg) => {
        for (let i = 0; i < turns; i++) { const kx = knot[0] - .02 + i * .03, ky = knot[1] + banY; gg.lineWidth = .02 + LW * 2 / sc(gg); gg.strokeStyle = INK; gg.beginPath(); gg.ellipse(kx, ky, .016, .042, 0, 0, TAU); gg.stroke(); gg.lineWidth = .02; gg.strokeStyle = '#4f8a3c'; gg.beginPath(); gg.ellipse(kx, ky, .016, .042, 0, 0, TAU); gg.stroke(); }
        a2_tube(gg, [-.25, -.6], hL, .07, .12, FUR); ol(gg, ell(gg, hL[0], hL[1], .085, .075), FUR); // the left arm, in front of him
        if (t >= idea && t < idea + .5) sparkle(gg, .05, -1.36, .1 * (1 + seg(t, idea, idea + .15)), 1 - seg(t, idea + .25, idea + .5), '#fff6c8');
        if (t >= tug + .15 && t < tug + .55) sparkle(gg, knot[0] + .03, knot[1] - .02, .07, 1 - seg(t, tug + .15, tug + .55));
      } };
    gorilla(g, 900, GROUND, 330, P);
  } },
  // 7. wide: the vine runs to the top of a young tree. He hangs his whole weight on it, pulls it down in three bounces,
  //    plants his feet, crouches into it, looks at us; on the harmonica's peak he lets go of the tree
  { t0: 71.9, t1: 75.0, draw(g, t, lt) {
    cam(g, lt, 3.1, 1.12, 1.2, 950, 620);
    jungle(g, t, { treeX: 260, sunX: 1500, raysX: 600 });
    const S6 = a2_s6(t), s = S6.s;
    const T = a2_tip(S6.th);
    let gx, gy, o, normal = false;
    const looking = t > 74.3, sly = t > 74.5, rel = t >= 74.85;
    const P = { handL: [-.3, -.7], handR: rel ? [.5, -1.15] : S6.hand, bendL: 30, bendR: -10,
      eyes: looking ? (sly ? 'squint' : 'open') : 'squint', brow: looking ? .2 : .9, mouth: looking ? (sly ? 'smile' : 'flat') : 'grit', look: looking ? [0, 0] : [.5, -1],
      sweat: seg(t, 72.6, 72.9) * (looking ? 0 : 1) };
    if (!S6.ground) { const sw = .1 * Math.sin((t - 71.9) * 5) * (1 - seg(t, 73.1, 73.4)); gx = T[0]; gy = T[1]; o = { piv: S6.hand, rot: sw }; }
    else { normal = true; gx = S6.fx; gy = GROUND; }
    const hand = normal ? [gx + P.handL[0] * s, gy + P.handL[1] * s * (1 - S6.sq)] : a2_b2w(gx, gy, s, o, P.handL[0], P.handL[1]);
    a2_sapling(g, S6.th);
    // the banana in his left hand, its stem tied to the vine that runs to the tree's tip
    const dx = T[0] - hand[0], dy = T[1] - hand[1], dl = Math.hypot(dx, dy) || 1, ba = Math.atan2(-dy, -dx), L = .42 * s;
    const stem = [hand[0] + Math.cos(ba) * -.6 * L, hand[1] + Math.sin(ba) * -.6 * L];
    a2_vine(g, T, stem, Math.max(0, a2_VL - dl) * .5 + 8, 10);
    banana(g, hand[0], hand[1], L, ba);
    if (normal) gorilla(g, gx, gy, s, Object.assign(P, { squash: S6.sq }));
    else a2_gor(g, gx, gy, s, P, o);
    for (const tb of [72.15, 72.65, 73.15]) if (t >= tb + .2 && t < tb + .5) { const k = seg(t, tb + .2, tb + .5); g.strokeStyle = `rgba(43,33,28,${.55 * (1 - k)})`; g.lineWidth = 4; for (const d of [-1, 1]) { g.beginPath(); g.arc(T[0], T[1], 50 + k * 30, d < 0 ? 3.4 : -.6, d < 0 ? 4.0 : 0); g.stroke(); } }
    a2_bush(g, a2_BX, GROUND, 0);
  } },
  // 8. wide: the tree whips up and yanks him (still holding his banana) into the air; he swings back and forth across
  //    the clearing, skimming the bush; the tree sags under him on the last swing and down he goes
  { t0: 75.0, t1: 78.9, draw(g, t, lt) {
    cam(g, lt, 3.9, 1.0, 1.04, 1150, 500);
    jungle(g, t, { treeX: 260, sunX: 1500, raysX: 600 });
    const s = a2_S, t0 = 75.4, phi = (tt) => -1.1 * Math.cos(Math.PI * (tt - t0)) * Math.exp(-.12 * (tt - t0));
    const S6 = a2_s6(74.99), w = seg(t, 75.0, 75.16);
    const ph = t < t0 ? -1.1 : phi(t);
    const th = lerp(S6.th, 0, eo(w)) + (t > 75.16 ? -.38 * ring(t - 75.16, 13, 4.5) : 0) - .2 * Math.sin(ph) * seg(t, 75.3, 75.6) - .7 * eio(seg(t, 78.35, 78.9));
    const T = a2_tip(th);
    const B0 = [S6.fx - .3 * s, GROUND - .7 * s * (1 - S6.sq)], Bp = [T[0] + a2_VL * Math.sin(ph), T[1] + a2_VL * Math.cos(ph)];
    const B = t < t0 ? [lerp(B0[0], Bp[0], eo(seg(t, 75.02, t0))), lerp(B0[1], Bp[1], eo(seg(t, 75.02, t0)))] : Bp;
    const ang = Math.atan2(B[0] - T[0], B[1] - T[1]);
    a2_sapling(g, th);
    a2_vine(g, T, B, 0, 10, false);
    if (t > 75.16 && t < 75.6) { const k = seg(t, 75.16, 75.6); g.strokeStyle = `rgba(43,33,28,${.6 * (1 - k)})`; g.lineWidth = 4; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(T[0], T[1], 60 + i * 22 + k * 30, -2.6, -.5); g.stroke(); } }
    // speed lines behind him along the arc
    const v = t > t0 ? phi(t) - phi(t - .06) : 0;
    if (Math.abs(v) > .04) { g.strokeStyle = 'rgba(255,250,235,.7)'; g.lineWidth = 5; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const r0 = a2_VL + 150 + i * 70; g.beginPath(); g.arc(T[0], T[1], r0, Math.PI / 2 - ph + Math.sign(v) * .12, Math.PI / 2 - ph + Math.sign(v) * (.12 + Math.min(.5, Math.abs(v) * 4)), v < 0); g.stroke(); } }
    const scared = t < 76.5 || t > 78.3, whee = !scared;
    const P = { handL: [-.12, -1.5], handR: [.12, -1.5], bendL: 12, bendR: -12, eyes: whee ? 'happy' : 'open', mouth: whee ? 'grin' : 'o', brow: scared ? -.6 : 0, look: [Math.sign(v) * .6, scared && t > 78.3 ? 1 : -.2],
      after: (gg) => banana(gg, 0, -1.58, .44, Math.PI / 2) };
    a2_gor(g, B[0], B[1], s, P, { piv: [.02, -1.84], rot: -ang });
    for (const [tb, sd] of [[75.9, 1], [76.9, 2], [77.9, 3]]) { a2_leafBurst(g, t, tb, T[0] + 20, 760, 7, 70 + sd, .55); }
    const rus = [75.9, 76.9, 77.9].reduce((a, tb) => a + (t >= tb ? .05 * ring(t - tb, 18, 5) : 0), 0);
    a2_bush(g, a2_BX, GROUND, rus);
  } },
  // 9. CRASH into the bush. His feet stick up out of it, twitch, flop. Above it, still tied to its vine, the banana
  //    sways, shut
  { t0: 78.9, t1: 81.5, draw(g, t, lt) {
    cam(g, lt, 2.6, 1.42, 1.5, 1360, 680);
    jungle(g, t, { treeX: 260, sunX: 1500, raysX: 600 });
    const s = a2_S, crash = 79.0;
    const th = t < crash ? -.7 : lerp(-.7, -.3, eo(seg(t, crash, crash + .3))) + .25 * ring(t - crash - .3, 11, 3.5) * (t > crash + .3 ? 1 : 0);
    const T = a2_tip(th);
    a2_sapling(g, th);
    const psi = t < crash ? 0 : -.5 * Math.sin(3.4 * (t - crash)) * Math.exp(-.75 * (t - crash));
    const d = [Math.sin(psi), Math.cos(psi)], E = [T[0] + a2_VL * d[0], T[1] + a2_VL * d[1]];
    // his legs sticking up out of the bush (drawn first: the bush hides where they go in)
    const legs = back(seg(t, 79.35, 79.6)), flop = eio(seg(t, 80.9, 81.25));
    if (legs > 0) {
      for (const [sd, ph] of [[-1, 0], [1, 1.7]]) {
        const tw = Math.sin(t * 11 + ph) * .3 * seg(t, 79.7, 79.9) * (1 - seg(t, 80.5, 80.7));
        const root = [1405 + sd * 26, 820], ft = [1405 + sd * 50 + (sd > 0 ? flop * 70 : 0), lerp(820, 640 + (sd > 0 ? flop * 60 : 0), legs)];
        a2_tube(g, root, ft, sd * 26, 48, FUR); g.save(); g.translate(ft[0], ft[1]); g.rotate(sd * .45 + tw + (sd > 0 ? flop * .8 : 0)); ol(g, ell(g, sd * 22, -10, 50, 24), FUR2); g.restore();
      }
    }
    if (t < crash) { // the last frames of the dive, going in head first
      const k = eo(seg(t, 78.88, crash)), B = [lerp(1560, 1410, k), lerp(470, 800, k)];
      a2_vine(g, T, B, 0, 10, false);
      a2_gor(g, B[0], B[1], s, { handL: [-.12, -1.5], handR: [.12, -1.5], bendL: 12, bendR: -12, eyes: 'open', mouth: 'o', brow: -.7, look: [-.6, 1], after: (gg) => banana(gg, 0, -1.58, .44, Math.PI / 2) }, { piv: [.02, -1.84], rot: lerp(-.3, 2.75, k) }); // head first, feet up
    }
    a2_bush(g, a2_BX, GROUND, t >= crash ? .16 * ring(t - crash, 15, 4.5) : 0);
    if (t >= crash) { // the banana, let go, swings up out of the bush and sways above it
      const Lb = 100, C = [E[0] + d[0] * .6 * Lb, E[1] + d[1] * .6 * Lb];
      a2_vine(g, T, E, 0, 10, false);
      banana(g, C[0], C[1], Lb, Math.atan2(d[1], d[0]));
      ol(g, ell(g, E[0], E[1] + 6, 10, 6), '#4f8a3c', 4);
    }
    a2_dust(g, t, crash, a2_BX, 760, 300, 120, 8, 11, .6, '#e6efcf');
    a2_leafBurst(g, t, crash, a2_BX, 740, 18, 88, 1);
    a2_leafBurst(g, t, crash + .5, a2_BX - 40, 600, 5, 91, .25);
  } },
]);
