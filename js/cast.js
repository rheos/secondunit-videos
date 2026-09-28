// Scenery helpers (sky, clouds, stars, moon: from functional-emotions-video, MIT) and this
// video's own cast: the sheep, the sleeper and the bedroom.

function sky(top = P.night0, mid = P.night1, low = P.dusk, horizon = 760) {
  s.fillStyle = vgrad(s, 0, horizon, [[0, top], [.55, mid], [1, low]]); s.fillRect(-100, -100, W + 200, horizon + 100);
  s.fillStyle = low; s.fillRect(-100, horizon, W + 200, H);
}
function clouds(t, seed, y0, y1, col, n = 7, speed = 6) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = ((r() * (W + 800) + t * speed * (.5 + r())) % (W + 800)) - 400, y = lerp(y0, y1, r()), w = 260 + r() * 520, h = 40 + r() * 70;
    s.fillStyle = col; s.beginPath(); s.ellipse(x, y, w / 2, h / 2, 0, 0, TAU); s.fill();
  }
}
function stars(t, seed, n = 140, yMax = 600, a = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) { const x = r() * W, y = r() * yMax, tw = .5 + .5 * Math.sin(t * (1 + r() * 3) + i); dot(f, x, y, .8 + r() * 1.6, `rgba(255,240,220,${a * (.25 + .6 * tw) * r()})`); }
}
function moon(x, y, r, a = 1) {
  dot(s, x, y, r, P.cream); dot(s, x + r * .38, y - r * .12, r * .92, '#18234e');
  glow(x, y, r * 5, `rgba(255,230,190,${.22 * a})`);
}
function fullMoon(x, y, r, a = 1) {
  dot(s, x, y, r, P.cream);
  dot(s, x - r * .28, y - r * .12, r * .2, '#d8c9a6'); dot(s, x + r * .3, y + r * .24, r * .14, '#d8c9a6'); dot(s, x + r * .1, y - r * .42, r * .09, '#d8c9a6');
  glow(x, y, r * 2.6, `rgba(255,235,200,${.14 * a})`);
}

// ---- the sheep ----
// An original character: a round cloud of wool, a black face, droopy ears and heavy,
// unimpressed lids. (x, y) = the ground under its middle; sc ~ half the body width in px.
// o.air: null standing, else 0..1 through a leap (nose up on take-off, down on landing).
// o.sil: a dark silhouette (against the moon); add black: true and g: f to occlude light with it.
// o.sit: 0..1 sits back on its haunches.
const WOOL = '#ece6d6', WOOL_SH = '#a39d93', WOOL_HI = '#fbf8ef', FACE = '#17141c';
function sheep(t, x, y, sc, o = {}) {
  const { air = null, dir = 1, lids = .55, look = [0, 0], seed = 1, sil = false, black = false, sit = 0, bob = 0, g = s } = o;
  const dk = black ? '#000' : '#0b0c1a';
  const wool = sil ? dk : WOOL, shade = sil ? dk : WOOL_SH, hi = sil ? dk : WOOL_HI, face = sil ? (black ? '#000' : '#07070f') : FACE;
  const legL = .62 * sc;
  const bx = x, by = y - legL * (1 - .5 * sit) - .42 * sc + bob;
  const rot = air === null ? -dir * .12 * sit : dir * .34 * (2 * air - 1);
  g.save(); g.translate(bx, by); g.rotate(rot);
  // legs, behind the body
  const legs = [[dir * .5, air === null ? 0 : dir * 1.05], [dir * .36, air === null ? 0 : dir * .85],
                [-dir * .5, air === null ? -dir * 1.3 * sit : -dir * 1.05], [-dir * .36, air === null ? -dir * 1.3 * sit : -dir * .85]];
  for (const [lx, a] of legs) {
    const top = [lx * sc, .3 * sc], end = [top[0] + Math.sin(a) * legL, top[1] + Math.cos(a) * legL];
    taper(g, top, end, .075 * sc, .055 * sc, face);
  }
  // body: shaded belly, then a ring of wool puffs, then the top
  g.fillStyle = shade; g.beginPath(); g.ellipse(0, .1 * sc, 1.02 * sc, .52 * sc, 0, 0, TAU); g.fill();
  const r = rng(seed * 31 + 7);
  for (let i = 0; i < 12; i++) {
    const ang = i / 12 * TAU + r() * .3, px = Math.cos(ang) * .8 * sc, py = Math.sin(ang) * .34 * sc - .04 * sc, rad = (.3 + .12 * r()) * sc;
    dot(g, px, py, rad, Math.sin(ang) > .35 ? shade : wool);
  }
  g.fillStyle = wool; g.beginPath(); g.ellipse(0, -.06 * sc, .86 * sc, .42 * sc, 0, 0, TAU); g.fill();
  for (let i = 0; i < 4; i++) dot(g, (-.45 + i * .3) * sc, (-.36 + .06 * Math.sin(i * 2.1)) * sc, (.16 + .05 * r()) * sc, hi);
  // head
  const hx = dir * .98 * sc, hy = -.26 * sc;
  g.save(); g.translate(hx, hy); g.rotate(dir * .12);
  for (const d of [-1, 1]) { g.save(); g.translate(d * .27 * sc, -.06 * sc); g.rotate(d * .55); g.fillStyle = face; g.beginPath(); g.ellipse(0, 0, .19 * sc, .065 * sc, 0, 0, TAU); g.fill(); g.restore(); }
  g.fillStyle = face; g.beginPath(); g.ellipse(0, 0, .26 * sc, .35 * sc, 0, 0, TAU); g.fill();
  for (let i = 0; i < 3; i++) dot(g, (i - 1) * .11 * sc, -.33 * sc - (i === 1 ? .04 * sc : 0), .12 * sc, wool);
  if (!sil) {
    for (const d of [-1, 1]) {
      const ex = d * .11 * sc + dir * .03 * sc, ey = -.05 * sc, rx = .078 * sc, ry = .06 * sc;
      g.save(); g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, TAU); g.clip();
      g.fillStyle = '#f2eee4'; g.fillRect(ex - rx, ey - ry, rx * 2, ry * 2);
      dot(g, ex + look[0] * .03 * sc, ey + .012 * sc + look[1] * .02 * sc, .036 * sc, '#0a0a0f');
      g.fillStyle = face; g.fillRect(ex - rx, ey - ry, rx * 2, ry * 2 * lids);
      g.restore();
      stroke(g, [[ex - rx, ey - ry + ry * 2 * lids], [ex + rx, ey - ry + ry * 2 * lids]], '#4a4452', .018 * sc);
    }
    stroke(g, [[-.06 * sc, .2 * sc], [.06 * sc, .21 * sc]], '#5d5563', .02 * sc);
  }
  g.restore(); g.restore();
  const c = Math.cos(rot), sn = Math.sin(rot);
  return { head: [bx + c * hx - sn * hy, by + sn * hx + c * hy], body: [bx, by] };
}

// a fence: posts and two rails, standing on yGround
function fence(g, x0, x1, yGround, h, col = '#6b5a4a', post = 150) {
  for (const k of [.35, .75]) { g.fillStyle = col; g.fillRect(x0, yGround - h * k - h * .05, x1 - x0, h * .1); }
  for (let x = x0; x <= x1; x += post) { g.fillStyle = col; g.fillRect(x - h * .06, yGround - h, h * .12, h); }
}

// ---- the sleeper and the bedroom (side view) ----
// lamp 0..1: warm lamplight. eye: 0 shut .. 1 wide open. Everything in world coords 1920x1080.
const SKIN = '#e0b08c', HAIR = '#231a1c', BLANKET = '#3b4d8e';
const EYE = [612, 578];
function bedroom(t, { lamp = 1, eye = 1, moonA = 1 } = {}) {
  // walls: moonlit blue, warmed by the lamp
  fill(s, '#0d1233');
  if (lamp > 0) { s.save(); s.globalAlpha = lamp; s.fillStyle = rgrad(s, 310, 520, 40, 1100, [[0, '#7a5548'], [.45, '#3a2f4c'], [1, '#161b44']]); s.fillRect(-50, -50, W + 100, H + 100); s.restore(); }
  // window with the night outside
  const wx = 1180, wy = 170, ww = 440, wh = 420;
  s.fillStyle = vgrad(s, wy, wy + wh, [[0, '#0b1540'], [1, '#2c2f6a']]); s.fillRect(wx, wy, ww, wh);
  moon(wx + 320, wy + 110, 46, moonA); stars(t, 11, 18, wy + wh, .7 * moonA);
  s.fillStyle = '#10142e'; ridge(s, wy + wh - 60, 50, .004, 3, '#141a40', wx, wx + ww, wy + wh);
  s.strokeStyle = '#080a1c'; s.lineWidth = 22; s.strokeRect(wx, wy, ww, wh);
  s.lineWidth = 10; s.beginPath(); s.moveTo(wx + ww / 2, wy); s.lineTo(wx + ww / 2, wy + wh); s.moveTo(wx, wy + wh / 2); s.lineTo(wx + ww, wy + wh / 2); s.stroke();
  // moonlight falling across the bed and floor
  s.save(); s.globalAlpha = .18 * moonA; poly(s, [[wx, wy + wh], [wx + ww, wy + wh], [wx + ww - 260, H + 40], [wx - 560, H + 40]], '#9fb4ff'); s.restore();
  // floor
  s.fillStyle = '#12163a'; s.fillRect(-50, 830, W + 100, 300);
  // nightstand + lamp
  s.fillStyle = '#271c2c'; s.fillRect(190, 650, 240, 180);
  s.fillStyle = '#1a1320'; s.fillRect(310 - 40, 630, 80, 22); stroke(s, [[310, 632], [310, 540]], '#1a1320', 10);
  poly(s, [[250, 470], [370, 470], [395, 545], [225, 545]], lamp > .5 ? '#f0d19a' : '#3d3446');
  if (lamp > 0) { glow(310, 520, 420, `rgba(255,170,90,${.28 * lamp})`); glow(310, 510, 90, `rgba(255,230,180,${.8 * lamp})`); }
  // bed: headboard, mattress, pillow
  s.fillStyle = '#35263a'; s.fillRect(470, 470, 56, 360);
  s.fillStyle = '#d9d2c0'; s.fillRect(500, 700, 1030, 90);
  s.fillStyle = '#281d2e'; s.fillRect(500, 790, 1030, 40);
  s.fillStyle = '#ece6d6'; s.beginPath(); s.ellipse(620, 668, 115, 46, -.05, 0, TAU); s.fill();
  // the sleeper: on their back, face to the ceiling, so the profile runs along the top of the head
  s.fillStyle = HAIR; s.beginPath(); s.ellipse(572, 624, 30, 44, .2, 0, TAU); s.fill();            // hair, on the pillow behind
  s.fillStyle = SKIN; s.beginPath(); s.ellipse(630, 610, 74, 50, -.06, 0, TAU); s.fill();          // face, turned to the ceiling
  poly(s, [[640, 568], [660, 530], [676, 570]], SKIN);                                            // nose, pointing up
  stroke(s, [[680, 584], [700, 590]], '#6a3a36', 5);                                              // mouth
  s.fillStyle = BLANKET; s.beginPath(); s.moveTo(640, 700); s.bezierCurveTo(700, 610, 900, 600, 1100, 630);
  s.bezierCurveTo(1300, 650, 1420, 610, 1480, 640); s.lineTo(1530, 720); s.lineTo(640, 720); s.closePath(); s.fill();
  stroke(s, [[760, 650], [980, 660], [1180, 690]], '#2c3b74', 8);
  // the open eye
  const [ex, ey] = EYE, open = clamp(eye);
  s.fillStyle = '#f4efe4'; s.beginPath(); s.ellipse(ex, ey, 19, 11 * open + .5, 0, 0, TAU); s.fill();
  if (open > .15) dot(s, ex + 5, ey - 1, 7.5 * open, '#1a1216');
  stroke(s, [[ex - 16, ey - 9 * open - 2], [ex + 15, ey - 10 * open - 2]], '#3a2a2a', 3);
  stroke(s, [[ex - 14, ey - 20], [ex + 14, ey - 22]], HAIR, 5);                                    // brow
}
// two glints where the sleeper's eye is, for the dark
function eyeGlint(eye, a = 1) { if (eye > .15) { dot(f, EYE[0] + 3, EYE[1] - 1, 3.2, `rgba(235,240,255,${.9 * a})`); glow(EYE[0], EYE[1], 26, `rgba(190,205,255,${.35 * a})`); } }
