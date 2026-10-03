// v1 scenery kit for the kawaii verses: skies, a road in perspective, roadside props drawn flat
// (stage-set style) at their ground point, music notes, wind, dust, a contrail plane.
const wrapv = (x, m) => ((x % m) + m) % m;
const vocv = (t) => clamp((F('voc', t, 1) - .08) / .42);

function skyWash(y0, y1, c0, c1, sd, tint = [PAL.lilac, PAL.peach, PAL.pink, '#fff3d8']) {
  s.fillStyle = vgrad(y0, y1, [[0, c0], [1, c1]]); s.fillRect(-W, -H * 2, W * 3, H * 5);
  const r = rng(sd);
  for (let i = 0; i < 9; i++) {
    const x = r() * W, y = y0 + r() * (y1 - y0) * .85, rx = 260 + r() * 320, ry = 80 + r() * 100, col = tint[i % tint.length];
    s.save(); s.translate(x, y); s.scale(1, ry / rx); s.globalAlpha = .4; s.fillStyle = rgrad(0, 0, 0, rx, [[0, col], [.6, col + '99'], [1, col + '00']]); s.fillRect(-rx, -rx, rx * 2, rx * 2); s.restore();
  }
}
function hills(base, list, sd) { // list: [cx, rx, ry, col]
  list.forEach(([cx, rx, ry, col], i) => { seedAt(sd + i); const P = []; for (let j = 0; j <= 24; j++) { const a = Math.PI + j / 24 * Math.PI; P.push([cx + Math.cos(a) * rx, base + Math.sin(a) * ry]); } P.push([cx + rx, base + 80], [cx - rx, base + 80]); shape(P, col, 6); });
}
// the ground below the horizon, then the road strip(s) of the world camera
function groundRoad(cam, hz, o = {}) {
  const { z0 = -4000, z1 = 60000, lane = 380, passing = false, dashPh = 0, grass = PAL.grass, road = PAL.road, sd = 300 } = o;
  seedAt(sd); paint([[-400, hz], [W + 400, hz], [W + 400, H + 900], [-400, H + 900]], grass);
  ink([[-400, hz + 3], [W + 400, hz + 3]], false, 5);
  const xl = passing ? -lane * 3 : -lane;
  seedAt(sd + 1); paint(gstrip(cam, xl, lane, z0, z1, 60), road, 1, false);
  ink(gline(cam, xl, z0, z1, 60), false, 6); ink(gline(cam, lane, z0, z1, 60), false, 6);
  // centre dashes of his lane
  for (let i = 0; i < 60; i++) { const za = i * 900 - wrapv(dashPh, 900) + z0, zb = za + 420; const P = gstrip(cam, -14, 14, za, zb, 3); if (P.length >= 4) paint(P, PAL.dash, .95, false); }
  if (passing) for (let i = 0; i < 60; i++) { const za = i * 900 - wrapv(dashPh, 900) + z0, zb = za + 420; const P = gstrip(cam, -lane * 2 - 14, -lane * 2 + 14, za, zb, 3); if (P.length >= 4) paint(P, PAL.dash, .95, false); }
}
// draw a list of { x, y?, z, f(p) } props plus extra drawables, far to near
function drawWorld(cam, items) {
  items.map((it) => ({ it, p: cam(it.x, it.y || 0, it.z) })).filter((q) => q.p.d > 150).sort((a, b) => b.p.d - a.p.d).forEach((q) => { push(); q.it.f(q.p); pop(); });
}

// ---- props (drawn at ground point (0,0) after tr(p.x, p.y); sc(p.k)) ----
function at(p, fn) { tr(p.x, p.y); sc(p.k); fn(); }
function propTree(sd, col, h = 520) { lollipopTree(0, 0, h, col, sd); }
function propPine(sd, col = '#9fd3b0', h = 560) { seedAt(sd); shape(rrect(-20, -h * .22, 40, h * .22, 10, sd), '#d9a77c', 5); for (let i = 0; i < 3; i++) { const w = h * (.42 - i * .1), y0 = -h * (.18 + i * .24); shape([[-w, y0], [w, y0], [w * .12, y0 - h * .34], [-w * .12, y0 - h * .34]], col, 6); } }
function propFence(sd) { seedAt(sd); shape(rrect(-14, -150, 28, 150, 8, sd), '#e8cfa9', 5); }
function propPole(sd) { seedAt(sd); shape(rrect(-14, -900, 28, 900, 8, sd), '#c9a27e', 5); shape(rrect(-120, -860, 240, 22, 8, sd + 1), '#c9a27e', 5); for (const x of [-100, 100]) shape(ell(x, -872, 10, 12, 10), PAL.blue, 3.5); }
function propMailbox(sd, flag = 0, lid = 0) {
  seedAt(sd); shape(rrect(-12, -200, 24, 200, 6, sd), '#c9a27e', 5);
  shape(rrect(-70, -290, 140, 92, 40, sd + 1), PAL.sky1, 6);
  push(); tr(66, -260); rot(-flag * 1.4); shape(rrect(-6, -70, 12, 70, 4, sd + 2), PAL.coral, 4); shape(rrect(-6, -70, 44, 26, 4, sd + 3), PAL.coral, 4); pop();
  push(); tr(-70, -200); rot(-lid * 1.2); shape(rrect(-10, -88, 16, 88, 8, sd + 4), '#f9b7c3', 5); pop();
  face(0, -246, 18, { eyes: lid > .3 ? 'squeeze' : 'happy', mouth: lid > .3 ? 'o' : 'smile', w: 4, blush: .8 });
}
function propSign(sd, spin = 0, sym = 'curve') { // a yellow diamond road sign that can spin on its post
  seedAt(sd); shape(rrect(-12, -330, 24, 330, 6, sd), '#b9b2c6', 5);
  push(); tr(0, -400); sc(Math.cos(spin), 1); rot(Math.PI / 4);
  shape(rrect(-90, -90, 180, 180, 22, sd + 1), PAL.lemon, 6); pop();
  push(); tr(0, -400); sc(Math.cos(spin), 1);
  if (Math.cos(spin) > 0) { if (sym === 'curve') ink([[-30, 50], [-30, 0], [10, -30], [10, -60]], false, 9); else { ink([[-60, 10], [60, 10]], false, 9); ink([[0, -40], [0, 40]], false, 9); } }
  pop();
}
function propFlowers(sd, n = 5) { const r = rng(sd); for (let i = 0; i < n; i++) { const x = (r() - .5) * 260, h = 30 + r() * 30; seedAt(sd + i); ink([[x, 0], [x, -h]], false, 4); const rr = 16; for (let p = 0; p < 5; p++) { const a = p / 5 * TAU; shape(ell(x + Math.cos(a) * rr, -h + Math.sin(a) * rr, rr * .62, rr * .62, 10), [PAL.pink, PAL.lemon, '#ffffff'][i % 3], 3.5); } shape(ell(x, -h, rr * .5, rr * .5, 10), PAL.coral, 3); } }
function propBush(sd, col = '#a9dcb5') { seedAt(sd); const P = []; for (let i = 0; i < 40; i++) { const a = Math.PI + i / 39 * Math.PI; const r = 120 + 18 * Math.sin(a * 5 + sd); P.push([Math.cos(a) * r * 1.3, Math.sin(a) * r * .8]); } shape(P, col, 6); }
function propCactus(sd, h = 380) { seedAt(sd); shape(rrect(-40, -h, 80, h, 40, sd), '#9fd3b0', 6); shape(rrect(-120, -h * .7, 60, h * .35, 30, sd + 1), '#9fd3b0', 5); shape(rrect(60, -h * .82, 60, h * .3, 30, sd + 2), '#9fd3b0', 5); shape(ell(0, -h - 6, 20, 16, 12), PAL.pink, 4); }
// billboard: kind = 'pie' | 'car' | 'plane' | 'shades'
function propBillboard(sd, kind, t, look = 0) {
  seedAt(sd);
  for (const x of [-200, 200]) shape(rrect(x - 16, -560, 32, 560, 8, sd + x), '#c9a27e', 5);
  shape(rrect(-330, -900, 660, 380, 30, sd + 1), PAL.white, 7);
  const ins = rrect(-300, -872, 600, 324, 22, sd + 2);
  if (kind === 'plane') {
    shape(ins, PAL.sky3, 5);
    push(); s.save(); k.save(); [s, k].forEach((c) => { c.beginPath(); ins.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.clip(); });
    cloud(-150 + Math.sin(t * .7) * 20, -800, .55, sd + 3); cloud(170, -630, .4, sd + 4);
    const fx = -60 + Math.sin(t * 1.3) * 90, fy = -720 + Math.sin(t * 2.1) * 26; // a little plane, flying, with a contrail
    seedAt(sd + 5); paint(rrect(-320, fy - 6, 260 + fx, 12, 6), '#ffffff', .9, false);
    tr(fx, fy); rot(Math.sin(t * 2.1 + 1) * .12);
    shape(rrect(-26, -70, 52, 140, 20, sd + 6), PAL.wing, 4.5); shape(rrect(-80, -16, 160, 36, 16, sd + 7), PAL.cream, 5); shape([[-80, -14], [-112, -50], [-92, -52], [-66, -14]], PAL.teal, 4); face(46, 2, 10, { eyes: 'happy', w: 3, blush: .9 });
    s.restore(); k.restore(); pop();
  } else if (kind === 'pie') {
    shape(ins, PAL.peach, 5); seedAt(sd + 8); shape(ell(0, -690, 170, 70, 26), '#e9b46f', 6); shape(ell(0, -712, 150, 50, 24), PAL.berry, 5); face(0, -690, 26, { eyes: 'happy', w: 4.5 });
    for (let i = 0; i < 3; i++) ink(quadPts([-60 + i * 60, -790], [-40 + i * 60 + Math.sin(t * 3 + i) * 20, -830], [-60 + i * 60, -860]), false, 5);
  } else if (kind === 'shades') {
    shape(ins, PAL.lemon, 5); push(); tr(0, -640); sc(.8); carSide(0, 0, 1, { col: PAL.pink, len: 340, t, sd: sd + 9, eyes: 'shades', mouth: 'smirk' }); pop();
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t; ink([[220 + Math.cos(a) * 40, -800 + Math.sin(a) * 40], [220 + Math.cos(a) * 62, -800 + Math.sin(a) * 62]], false, 5); }
  }
}
function propDiner(sd, t) {
  seedAt(sd);
  shape(rrect(-520, -330, 1040, 330, 60, sd), '#dfe9f2', 7);
  shape(rrect(-520, -150, 1040, 44, 16, sd + 1), PAL.coral, 5);
  for (let i = 0; i < 5; i++) { shape(rrect(-450 + i * 180, -290, 140, 110, 20, sd + 2 + i), PAL.lemon, 5); paint(rrect(-440 + i * 180, -280, 40, 14, 6), '#ffffff', .8, false); }
  shape(rrect(-60, -100, 120, 100, 14, sd + 9), PAL.pink, 5);
  shape(rrect(380, -720, 26, 400, 8, sd + 10), '#b9b2c6', 5);                       // the cup sign on its pole
  const glow = .7 + .3 * Math.sin(t * 6);
  shape(ell(393, -800, 130 * 1, 100, 26), '#ffe7a8', 6); seedAt(sd + 11);
  shape(rrect(330, -850, 110, 90, 26, sd + 12), PAL.white, 5); ink(ell(452, -808, 22, 26, 14), true, 6);
  for (let i = 0; i < 3; i++) ink(quadPts([350 + i * 30, -870], [365 + i * 30 + Math.sin(t * 4 + i) * 10, -900], [350 + i * 30, -930]), false, 4);
  alpha(glow * .5); paint(ell(393, -800, 170, 140), '#fff2b0', .5, false); alpha(1);
  face(0, -400, 30, { eyes: 'happy', w: 4.5 });
}
function propMotel(sd, t) {
  seedAt(sd);
  shape(rrect(-700, -260, 1400, 260, 30, sd), '#f6d6c8', 7);
  shape([[-760, -250], [760, -250], [700, -320], [-700, -320]], PAL.teal, 6);
  for (let i = 0; i < 6; i++) { const x = -620 + i * 240; shape(rrect(x, -200, 90, 200, 14, sd + 1 + i), i % 2 ? PAL.lilac : PAL.blue, 5); inkFill(ell(x + 72, -100, 7, 7, 8)); shape(rrect(x + 110, -190, 90, 70, 12, sd + 10 + i), PAL.lemon, 4.5); }
  shape(rrect(760, -980, 30, 980, 8, sd + 20), '#b9b2c6', 5);                     // star sign with blinking bulbs
  seedAt(sd + 21); const st = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i / 10 * TAU, r = i % 2 ? 70 : 160; st.push([775 + Math.cos(a) * r, -1080 + Math.sin(a) * r]); } shape(st, PAL.gold, 6);
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i / 5 * TAU, on = (Math.floor(t * 6) + i) % 2; shape(ell(775 + Math.cos(a) * 140, -1080 + Math.sin(a) * 140, 14, 14, 10), on ? '#fff6c8' : PAL.coral, 3.5); }
  shape(ell(775, -1080, 34, 34, 14), PAL.coral, 4); // a bed-shaped glyph under the star
  shape(rrect(700, -900, 150, 60, 14, sd + 22), PAL.white, 4.5); shape(rrect(712, -890, 40, 26, 10, sd + 23), PAL.pink, 3.5);
}
function propBarn(sd) { seedAt(sd); shape([[-260, 0], [-260, -300], [0, -440], [260, -300], [260, 0]], PAL.coral, 7); shape(rrect(-90, -200, 180, 200, 12, sd + 1), PAL.cream, 5); ink([[-90, -200], [90, 0]], false, 5); ink([[90, -200], [-90, 0]], false, 5); shape(ell(0, -320, 40, 40, 16), PAL.cream, 5); }
function propWindmill(sd, t) {
  seedAt(sd); shape([[-60, 0], [-34, -520], [34, -520], [60, 0]], PAL.white, 6);
  push(); tr(0, -520); rot(t * 1.6);
  for (let i = 0; i < 4; i++) { push(); rot(i * Math.PI / 2); shape(rrect(-20, -300, 40, 290, 12, sd + i), PAL.pink, 5); pop(); }
  pop(); shape(ell(0, -520, 22, 22, 12), PAL.coral, 4);
}

// ---- music notes: drawn shapes, never type. kind 0 = quaver, 1 = beamed pair
function note(x, y, sz, a, col, kind, sd) {
  seedAt(sd); push(); tr(x, y); rot(a); sc(sz / 60);
  if (kind === 1) {
    shape(ell(-38, 0, 26, 19, 18).map(([px, py]) => [px, py]), col, 5.5); shape(ell(42, -14, 26, 19, 18), col, 5.5);
    ink([[-14, -4], [-14, -130]], false, 7); ink([[66, -18], [66, -144]], false, 7); inkFill([[-18, -136], [70, -150], [70, -124], [-18, -110]]);
  } else {
    shape(ell(0, 0, 28, 20, 18), col, 5.5); ink([[24, -6], [24, -140]], false, 7);
    ink(quadPts([24, -140], [70, -110], [56, -60]), false, 7);
  }
  paint(ell(-10, -6, 9, 5), '#ffffff', .8, false);
  pop();
}
// wind swirl lines sweeping across (screen space)
function windSwirls(t, t0, dur, y0, y1, sd, n = 7) {
  const r = rng(sd);
  for (let i = 0; i < n; i++) {
    const ts = t0 + r() * dur * .5, ph = (t - ts) / (dur * .6), yy = lerp(y0, y1, r()), L = 300 + r() * 300;
    if (ph < 0 || ph > 1) { r(); continue; }
    const x = lerp(-L, W + L, ph), P = [];
    for (let j = 0; j <= 30; j++) { const u = j / 30, px = x - L + u * L; P.push([px, yy + Math.sin(u * 7 + i) * 18]); }
    const curl = r() > .4; if (curl) { const cx = x, cyy = yy - 40; for (let j = 0; j <= 20; j++) { const a = Math.PI / 2 - j / 20 * TAU * .85; P.push([cx + Math.cos(a) * 40, cyy + Math.sin(a) * 40]); } }
    seedAt(sd + i); k.globalAlpha = .8 * Math.sin(Math.PI * ph); ink(P, false, 5); k.globalAlpha = 1;
  }
}
function dustPuffs(x, y, t, t0, sc0, sd) {
  const dt = t - t0; if (dt < 0 || dt > 1) return;
  for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * Math.PI, r = (40 + 220 * ease.out(dt)) * sc0; alpha(clamp(1 - dt)); cloud(x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * .3 - 10 * sc0, (.35 + .25 * dt) * sc0, sd + i, false, t, '#f3ece6'); alpha(1); }
}
function popRing(x, y, t, t0, r0, col, sd) {
  const dt = t - t0; if (dt < 0 || dt > .7) return; const g = ease.out(dt / .7);
  seedAt(sd); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r1 = r0 * (.5 + g * 1.1), r2 = r1 + r0 * .35 * (1 - g); alpha(1 - g); ink([[x + Math.cos(a) * r1, y + Math.sin(a) * r1], [x + Math.cos(a) * r2, y + Math.sin(a) * r2]], false, 7); alpha(1); }
}
function contrailPlane(x, y, sz, trailL, sd) {
  seedAt(sd);
  paint(rrect(x - trailL, y - 7 * sz, trailL, 14 * sz, 7 * sz), '#ffffff', .85, false);
  paint(rrect(x - trailL, y - 22 * sz, trailL * .9, 8 * sz, 4 * sz), '#ffffff', .5, false);
  push(); tr(x, y); sc(sz);
  shape(rrect(-40, -6, 80, 14, 7, sd + 1), PAL.white, 3); shape([[-8, 0], [-26, -36], [-14, -36], [10, 0]], PAL.white, 3); shape([[-8, 4], [-26, 36], [-14, 36], [10, 4]], PAL.white, 3);
  pop();
}
// a VIP car seen from the front (ground point at 0,0), ducks (squash 0..1) under a wing
function carFront(sd, col, duck = 0, eyes = 'shades', t = 0) {
  seedAt(sd); const hs = 1 - duck * .3, ws = 1 + duck * .25;
  paint(ell(0, -4, 230 * ws, 22), '#6b5a7a', .2, false);
  for (const x of [-150, 150]) shape(rrect(x * ws - 34, -70, 68, 74, 18, sd + x), PAL.tyre, 5);
  shape(rrect(-120 * ws, -230 * hs, 240 * ws, 90 * hs, 34, sd + 1), col, 6);
  shape(rrect(-96 * ws, -218 * hs, 192 * ws, 62 * hs, 18, sd + 2), PAL.blue, 5);
  shape(rrect(-200 * ws, -150 * hs, 400 * ws, 120 * hs + 20, 40, sd + 3), col, 6.5);
  for (const x of [-150, 150]) shape(ell(x * ws, -100 * hs, 26, 20, 12), '#fff6c8', 4);
  face(0, -98 * hs, 34, { eyes: duck > .4 ? 'squeeze' : eyes, mouth: duck > .4 ? 'o' : 'smirk', w: 5, blush: .8, t });
}
