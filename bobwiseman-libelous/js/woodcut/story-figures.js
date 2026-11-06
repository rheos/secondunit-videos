// Round 2 woodcut figures (stanzas 2-5), painted into the tone map in block-local units like figures.js.
// Patterns are registered per block and passed in (pats), because they live in block units.

// a thick sleeve or limb through points: black, with a fine cut highlight along it
function limb(g, pts, w, hi = true) {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = Cw(0); g.lineWidth = w; g.stroke();
  if (hi) { g.strokeStyle = Cw(1); g.lineWidth = Math.max(1.5, w * .1); g.beginPath(); g.moveTo(pts[0][0] + 2, pts[0][1] - w * .2); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0] + 2, pts[i][1] - w * .2); g.stroke(); }
}
function mitten(g, x, y, r = 11, rot = 0) { ell(g, x, y, r, r * .82, rot); fillWith(g, Cw(1)); ink(g, 3); }
const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
// alternating -1/+1 on each onset (a marching step, a hop): eases from one to the next in 0.2 s
function stepPose(t, onsets) {
  let i = -1; for (let k = 0; k < onsets.length; k++) if (t >= onsets[k] - .03) i = k;
  if (i < 0) return 0;
  const prev = i ? ((i - 1) % 2 ? 1 : -1) : 0, cur = i % 2 ? 1 : -1;
  return lerp(prev, cur, smooth(clamp((t - onsets[i] + .03) / .2)));
}
// a one-shot pop 0 -> 1 -> 0 over d seconds starting a hair before s
const pop = (t, s, d = .3) => Math.max(0, Math.sin(clamp((t - s + .03) / d) * Math.PI));

// ---------- a military ruler, marching: feet origin, body front-on, head in profile facing right ----------
// o.step -1..1, o.salute 0..1, o.glint 0..1 (medals flash)
function drawGeneral(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y - Math.abs(o.step || 0) * 4); g.scale(k, k);
  const st = o.step || 0, sal = o.salute || 0;
  // back arm and the sabre at the hip
  limb(g, [[-38, -246], [-44, -196], [-36, -152]], 20);
  g.beginPath(); g.moveTo(-34, -150); g.lineTo(-92, -30); g.lineTo(-84, -26); g.lineTo(-26, -146); g.closePath(); fillWith(g, Cw(0)); line(g, -36, -140, -86, -34); cutl(g, 2);
  ell(g, -32, -152, 9, 7); fillWith(g, Cw(1)); ink(g, 2.5);
  // legs: trousers with a black stripe, boots
  for (const s of [-1, 1]) {
    g.save(); g.translate(s * 14, -130); g.rotate(-s * st * .2);
    pth(g, [[-12, 0], [12, 0], [11, 92], [-11, 92]]); fillWith(g, WC.C(.62, pats.legs)); ink(g, 2.5);
    line(g, 5, 4, 5, 88); ink(g, 4);
    g.beginPath(); g.moveTo(-12, 86); g.lineTo(12, 86); g.lineTo(13, 120); g.lineTo(30, 124); g.lineTo(30, 132); g.lineTo(-13, 132); g.closePath(); fillWith(g, Cw(0));
    line(g, -6, 94, -6, 124); cutl(g, 2);
    g.restore();
  }
  // tunic: black, cut folds, two rows of buttons, belt
  pth(g, [[-46, -258], [46, -258], [52, -124], [-52, -124]]); fillWith(g, WC.LG(g, -52, 0, 52, 0, [[0, .3], [.4, .06], [1, .02]], pats.coat)); ink(g, 3);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { ell(g, s * 12, -238 + i * 22, 3.5, 3.5); fillWith(g, Cw(1)); }
  g.beginPath(); g.rect(-50, -156, 100, 12); fillWith(g, Cw(1)); ink(g, 2.5); g.beginPath(); g.rect(-9, -159, 18, 18); fillWith(g, Cw(0)); g.beginPath(); g.rect(-5, -155, 10, 10); cutl(g, 2);
  // sash: a broad white band from the shoulder to the hip, cut with diagonal lines
  pth(g, [[24, -258], [44, -258], [-36, -160], [-52, -170]]); fillWith(g, WC.C(.82, pats.sash)); ink(g, 2.5);
  // medals on ribbons
  for (let i = 0; i < 3; i++) {
    const mx = 26 + (i - 1) * 13, my = -214;
    pth(g, [[mx - 4, my - 18], [mx + 4, my - 18], [mx + 3, my - 4], [mx - 3, my - 4]]); fillWith(g, Cw(1)); ink(g, 1.6);
    ell(g, mx, my + 2, 6, 6); fillWith(g, Cw(1)); ink(g, 2.4);
    if (o.glint > .05) for (let r = 0; r < 4; r++) { const a = r * Math.PI / 2 + .4; gouge(g, mx + Math.cos(a) * 8, my + 2 + Math.sin(a) * 8, mx + Math.cos(a) * (10 + 16 * o.glint), my + 2 + Math.sin(a) * (10 + 16 * o.glint), 2.4, 0); }
  }
  // epaulettes with fringe
  for (const s of [-1, 1]) {
    ell(g, s * 44, -258, 22, 9); fillWith(g, Cw(1)); ink(g, 3);
    for (let i = 0; i < 6; i++) { line(g, s * 44 - 18 + i * 7, -252, s * 44 - 19 + i * 7.4, -236); ink(g, 2.4); }
  }
  // head in profile, facing right: big moustache, stern brow
  ell(g, 0, -266, 11, 10); fillWith(g, Cw(1)); ink(g, 2.4); // neck / collar
  g.beginPath(); g.rect(-15, -276, 30, 14); fillWith(g, Cw(0)); line(g, -13, -270, 13, -270); cutl(g, 1.6);
  ell(g, 2, -300, 25, 29); fillWith(g, WC.LG(g, -24, 0, 28, 0, [[0, .55], [.4, 1], [1, 1]], pats.face)); ink(g, 3);
  ell(g, -6, -298, 5, 8); fillWith(g, Cw(1)); ink(g, 2); // ear
  g.beginPath(); g.moveTo(24, -306); g.quadraticCurveTo(36, -296, 26, -290); ink(g, 3); // nose
  ell(g, 14, -308, 3, 3.5); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(6, -317); g.lineTo(24, -313); ink(g, 4);
  g.beginPath(); g.moveTo(26, -286); g.quadraticCurveTo(16, -290, 4, -282); g.quadraticCurveTo(0, -276, 8, -276); g.quadraticCurveTo(20, -280, 30, -276); g.quadraticCurveTo(38, -280, 26, -286); g.closePath(); fillWith(g, Cw(0));
  // peaked cap: tall crown, band, black visor to the right, a plume
  pth(g, [[-26, -318], [30, -318], [40, -346], [-24, -350]]); fillWith(g, WC.LG(g, -26, 0, 40, 0, [[0, .2], [.5, .7], [1, .25]], pats.cap)); ink(g, 3);
  g.beginPath(); g.rect(-26, -326, 56, 9); fillWith(g, Cw(0)); line(g, -24, -322, 28, -322); cutl(g, 1.6);
  pth(g, [[20, -318], [48, -314], [44, -308], [18, -312]]); fillWith(g, Cw(0));
  ell(g, 8, -336, 6, 6); fillWith(g, Cw(1)); ink(g, 2);
  g.beginPath(); g.moveTo(-14, -348); g.bezierCurveTo(-34, -380, -10, -404, 4, -412); g.bezierCurveTo(-2, -390, -6, -370, -6, -348); g.closePath(); fillWith(g, WC.C(.4, pats.plume)); ink(g, 2.5);
  // front arm: down (swinging with the march) or up to the visor in a salute
  const sh = [38, -248];
  const el = lerp2([46 + st * 6, -198], [84, -270], sal), hd = lerp2([44 + st * 12, -152], [38, -318], sal);
  limb(g, [sh, el, hd], 20);
  mitten(g, hd[0], hd[1], 10, sal * -.6);
  g.restore();
}

// ---------- a lady of the elite, bust: neck-base origin, facing 3/4 left. o.fan 0..1, o.smile ----------
function drawLadyBust(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y); g.scale(k, k);
  // gown: black, off the shoulder, a pearl necklace
  g.beginPath(); g.moveTo(-70, 120); g.quadraticCurveTo(-74, 34, -40, 26); g.lineTo(40, 26); g.quadraticCurveTo(74, 34, 70, 120); g.closePath();
  fillWith(g, WC.LG(g, -70, 0, 70, 0, [[0, .35], [.5, .1], [1, .04]], pats.coat)); ink(g, 3);
  pth(g, [[-38, 26], [38, 26], [26, 6], [-26, 6]]); fillWith(g, Cw(1)); ink(g, 2); // shoulders
  for (let i = 0; i < 9; i++) { const a = Math.PI * (.15 + .7 * i / 8); ell(g, Math.cos(a) * 22, 4 + Math.sin(a) * 14, 3, 3); fillWith(g, Cw(1)); ink(g, 1.5); }
  // head
  ell(g, -2, -32, 26, 32); fillWith(g, WC.LG(g, -28, 0, 26, 0, [[0, 1], [.55, 1], [1, .6]], pats.face)); ink(g, 3);
  g.beginPath(); g.moveTo(-16, -40); g.quadraticCurveTo(-30, -26, -18, -22); ink(g, 2.6);
  ell(g, -10, -42, 3, 3.5); fillWith(g, Cw(0)); g.beginPath(); g.moveTo(-20, -51); g.quadraticCurveTo(-11, -55, -2, -50); ink(g, 2.4);
  if ((o.smile || 0) > .1) { g.beginPath(); g.moveTo(-20, -14); g.quadraticCurveTo(-10, -6, 0, -13); ink(g, 3); } else { line(g, -18, -12, -6, -13); ink(g, 2.6); }
  // hair piled high, a small tiara
  g.beginPath(); g.moveTo(-26, -40); g.quadraticCurveTo(-34, -78, -4, -84); g.quadraticCurveTo(28, -86, 26, -40); g.quadraticCurveTo(18, -60, -2, -62); g.quadraticCurveTo(-20, -60, -26, -40); g.closePath(); fillWith(g, WC.C(.25, pats.hair)); ink(g, 2.5);
  ell(g, 6, -100, 22, 20); fillWith(g, WC.C(.25, pats.hair)); ink(g, 2.5);
  g.beginPath(); g.moveTo(-22, -78); g.lineTo(-14, -94); g.lineTo(-6, -82); g.lineTo(2, -100); g.lineTo(10, -82); g.lineTo(18, -94); g.lineTo(24, -76); g.closePath(); fillWith(g, Cw(1)); ink(g, 2.4);
  // the fan, opening in front of her chin
  const f = o.fan || 0;
  if (f > .02) {
    const cx = -36, cy = 10, a0 = -Math.PI / 2 - .1 - f * 1.1, a1 = -Math.PI / 2 - .1 + f * .5;
    g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 58, a0, a1); g.closePath(); fillWith(g, Cw(1)); ink(g, 3);
    for (let i = 0; i <= 6; i++) { const a = lerp(a0, a1, i / 6); line(g, cx, cy, cx + Math.cos(a) * 56, cy + Math.sin(a) * 56); ink(g, 1.8); }
    g.beginPath(); g.arc(cx, cy, 44, a0, a1); ink(g, 1.6);
  }
  mitten(g, -36, 14, 10);
  g.restore();
}

// ---------- a sailing ship (small, side on, heading right) ----------
function drawShip(g, x, y, k, pats, roll = 0) {
  g.save(); g.translate(x, y); g.rotate(roll); g.scale(k, k);
  g.beginPath(); g.moveTo(-60, -10); g.lineTo(64, -10); g.quadraticCurveTo(56, 18, 40, 22); g.lineTo(-44, 22); g.quadraticCurveTo(-58, 12, -60, -10); g.closePath(); fillWith(g, Cw(0));
  line(g, -50, 0, 56, 0); cutl(g, 2); for (let i = 0; i < 5; i++) { ell(g, -36 + i * 18, 10, 2.6, 2.6); fillWith(g, Cw(1)); }
  line(g, -6, -10, -6, -110); ink(g, 4); line(g, 30, -10, 30, -80); ink(g, 3.5);
  for (const [mx, top, h, w] of [[-6, -104, 76, 42], [30, -76, 52, 30]]) {
    g.beginPath(); g.moveTo(mx - w, top); g.quadraticCurveTo(mx, top - 6, mx + w, top); g.quadraticCurveTo(mx + w + 8, top + h * .5, mx + w, top + h); g.lineTo(mx - w, top + h); g.quadraticCurveTo(mx - w + 6, top + h * .5, mx - w, top); g.closePath();
    fillWith(g, WC.LG(g, mx - w, 0, mx + w, 0, [[0, .55], [.5, 1], [1, .75]], pats.sail)); ink(g, 2.6);
  }
  pth(g, [[-6, -110], [-6, -126], [24, -118]]); fillWith(g, Cw(0)); line(g, -4, -118, 18, -118); cutl(g, 2);
  g.restore();
}

// ---------- a bowl, seen from slightly above ----------
function drawBowl(g, x, y, r, pats) {
  g.beginPath(); g.moveTo(x - r, y); g.quadraticCurveTo(x - r * .9, y + r * .8, x, y + r * .8); g.quadraticCurveTo(x + r * .9, y + r * .8, x + r, y); g.closePath();
  fillWith(g, WC.LG(g, x - r, 0, x + r, 0, [[0, .2], [.35, .85], [1, .1]], pats.bowl)); ink(g, 3.5);
  ell(g, x, y, r, r * .28); fillWith(g, Cw(1)); ink(g, 3.5);
  ell(g, x, y + 2, r * .82, r * .2); fillWith(g, WC.C(.75, pats.inside)); ink(g, 1.8); // the empty inside: bare to the bottom
  ell(g, x, y + 4, r * .4, r * .09); ink(g, 1.6);
  g.beginPath(); g.rect(x - r * .32, y + r * .78, r * .64, r * .12); fillWith(g, Cw(0));
}

// ---------- a ticket: notched ends, a border, a crown mark ----------
function drawTicket(g, x, y, rot, s) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.beginPath(); g.moveTo(-36, -18); g.lineTo(36, -18); g.arc(36, 0, 7, -Math.PI / 2, Math.PI / 2, true); g.lineTo(36, 18); g.lineTo(-36, 18); g.arc(-36, 0, 7, Math.PI / 2, -Math.PI / 2, true); g.closePath();
  fillWith(g, Cw(1)); ink(g, 2.6);
  g.beginPath(); g.rect(-24, -11, 48, 22); ink(g, 1.5);
  coinCrown(g, 0, 0, 10, 8);
  g.restore();
}

// ---------- a cow, facing left: feet origin (front feet at x-60, back at x+60) ----------
function drawCow(g, x, y, k, pats, o = {}) {
  g.save(); g.translate(x, y); g.scale(k, k);
  const graze = o.graze || 0;
  for (const lx of [-58, -40, 48, 64]) { pth(g, [[lx - 7, -62], [lx + 7, -62], [lx + 6, -4], [lx - 6, -4]]); fillWith(g, Cw(1)); ink(g, 2.4); g.beginPath(); g.rect(lx - 7, -8, 14, 8); fillWith(g, Cw(0)); }
  g.beginPath(); g.moveTo(84, -110); g.quadraticCurveTo(100, -70, 92, -40); ink(g, 3); ell(g, 92, -36, 5, 9); fillWith(g, Cw(0)); // tail
  g.beginPath(); g.roundRect(-80, -128, 172, 74, 30); fillWith(g, WC.LG(g, 0, -128, 0, -54, [[0, 1], [.7, .9], [1, .6]], pats.hide)); ink(g, 3);
  g.save(); g.beginPath(); g.roundRect(-80, -128, 172, 74, 30); g.clip();
  for (const [px, py, rx, ry] of [[-30, -112, 26, 18], [40, -96, 30, 22], [80, -122, 18, 14], [-6, -66, 16, 10]]) { g.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * TAU, rr = 1 + .22 * Math.sin(a * 3 + px); const qx = px + Math.cos(a) * rx * rr, qy = py + Math.sin(a) * ry * rr; i ? g.lineTo(qx, qy) : g.moveTo(qx, qy); } g.closePath(); fillWith(g, Cw(0)); }
  g.restore();
  // head: down when grazing
  g.save(); g.translate(-78, -112); g.rotate(-graze * .7);
  ell(g, -26, 6, 28, 24, -.3); fillWith(g, Cw(1)); ink(g, 3);
  ell(g, -46, 20, 16, 13); fillWith(g, Cw(.8, pats.hide)); ink(g, 2.4); ell(g, -50, 18, 2.5, 2); fillWith(g, Cw(0));
  ell(g, -22, -2, 3, 3.5); fillWith(g, Cw(0));
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(-14 + s * 8, -14); g.quadraticCurveTo(-6 + s * 22, -36, 4 + s * 14, -40); g.quadraticCurveTo(-4 + s * 16, -28, -8 + s * 6, -12); g.closePath(); fillWith(g, Cw(1)); ink(g, 2); }
  ell(g, 0, -4, 12, 6, .4); fillWith(g, Cw(0));
  g.restore();
  g.restore();
}

// ---------- a cattle rancher: feet origin, wide hat, long coat, a coiled rope. o.step, o.wide (grows) ----------
function drawRancher(g, x, y, k, o, pats) {
  const wd = 1 + (o.wide || 0) * .4;
  g.save(); g.translate(x, y); g.scale(k * wd, k);
  const st = o.step || 0;
  for (const s of [-1, 1]) {
    g.save(); g.translate(s * 14, -120); g.rotate(-s * st * .18);
    pth(g, [[-11, 0], [11, 0], [10, 84], [-10, 84]]); fillWith(g, WC.C(.6, pats.legs)); ink(g, 2.4);
    g.beginPath(); g.moveTo(-11, 84); g.lineTo(11, 84); g.lineTo(12, 112); g.lineTo(-26, 116); g.lineTo(-26, 110); g.lineTo(-12, 106); g.closePath(); fillWith(g, Cw(0));
    g.restore();
  }
  // long coat
  pth(g, [[-40, -250], [40, -250], [56, -96], [-56, -96]]); fillWith(g, WC.LG(g, -56, 0, 56, 0, [[0, .32], [.45, .08], [1, .03]], pats.coat)); ink(g, 3);
  line(g, 0, -244, 0, -98); cutl(g, 2.5);
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 6, -248); g.lineTo(s * 24, -200); cutl(g, 2.5); }
  g.beginPath(); g.rect(-50, -150, 100, 10); fillWith(g, Cw(1)); ink(g, 2);
  // arms: one holds a long stick
  limb(g, [[-38, -240], [-50, -190], [-46, -150]], 18); mitten(g, -46, -148, 9);
  limb(g, [[36, -240], [52, -196], [70, -176]], 18); mitten(g, 72, -176, 9);
  line(g, 90, -270, 52, -60); ink(g, 5);
  // head: face 3/4 left, moustache, then the hat
  ell(g, 0, -278, 24, 28); fillWith(g, WC.LG(g, -24, 0, 26, 0, [[0, 1], [.55, 1], [1, .55]], pats.face)); ink(g, 3);
  ell(g, -10, -284, 3, 3.5); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(-26, -264); g.quadraticCurveTo(-8, -272, 10, -262); g.quadraticCurveTo(-4, -256, -26, -264); g.closePath(); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(-14, -282); g.quadraticCurveTo(-24, -272, -16, -270); ink(g, 2.4);
  ell(g, 0, -302, 58, 10); fillWith(g, Cw(0)); g.beginPath(); g.ellipse(0, -303, 54, 7, 0, 0, Math.PI); cutl(g, 1.8);
  g.beginPath(); g.moveTo(-28, -304); g.quadraticCurveTo(-30, -340, -6, -342); g.quadraticCurveTo(0, -334, 6, -342); g.quadraticCurveTo(30, -340, 28, -304); g.closePath(); fillWith(g, WC.LG(g, -28, 0, 28, 0, [[0, .15], [.4, .6], [1, .1]], pats.hat)); ink(g, 3);
  g.beginPath(); g.rect(-28, -314, 56, 8); fillWith(g, Cw(1)); ink(g, 2);
  g.restore();
}

// ---------- a farmer: feet origin, facing right. o.bend 0..1 (stooped over the hoe), o.wave 0..1, o.woman ----------
function drawFarmer(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y - (o.hop || 0)); g.scale(o.flip ? -k : k, k);
  const st = o.step || 0, bend = o.bend || 0;
  for (const s of [-1, 1]) {
    g.save(); g.translate(s * 10, -100); g.rotate(-s * st * .2);
    if (!o.woman) { pth(g, [[-9, 0], [9, 0], [8, 92], [-8, 92]]); fillWith(g, WC.C(.55, pats.legs)); ink(g, 2.4); }
    else { line(g, 0, 40, 0, 92); ink(g, 9); }
    ell(g, 8, 96, 14, 6); fillWith(g, Cw(0));
    g.restore();
  }
  g.save(); g.translate(0, -100); g.rotate(bend * .55);
  // smock (or a long skirt), rope belt
  if (o.woman) { pth(g, [[-30, -110], [30, -110], [50, 50], [-50, 50]]); }
  else { pth(g, [[-32, -110], [32, -110], [42, 20], [-42, 20]]); }
  fillWith(g, WC.LG(g, -50, 0, 50, 0, [[0, .7], [.5, .95], [1, .45]], pats.smock)); ink(g, 3);
  for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 14, -100); g.lineTo(i * 18, 10); ink(g, 1.8); }
  line(g, -36, -50, 36, -50); ink(g, 4);
  // basket on the woman's hip
  if (o.woman) { g.beginPath(); g.moveTo(26, -60); g.lineTo(70, -60); g.lineTo(62, -24); g.lineTo(32, -24); g.closePath(); fillWith(g, WC.C(.55, pats.weave)); ink(g, 2.6); g.beginPath(); g.arc(48, -60, 20, Math.PI, 0); ink(g, 3); }
  // head: bare, a straw hat or a headscarf
  ell(g, 6, -138, 22, 26); fillWith(g, WC.LG(g, -16, 0, 30, 0, [[0, .55], [.4, 1], [1, 1]], pats.face)); ink(g, 3);
  ell(g, 16, -144, 3, 3.5); fillWith(g, Cw(0)); g.beginPath(); g.moveTo(26, -142); g.quadraticCurveTo(34, -132, 26, -128); ink(g, 2.4);
  g.beginPath(); g.moveTo(14, -122); g.quadraticCurveTo(20, -118, 26, -122); ink(g, 2.2);
  if (o.woman) { g.beginPath(); g.moveTo(-20, -130); g.quadraticCurveTo(-24, -170, 8, -170); g.quadraticCurveTo(32, -168, 30, -150); g.lineTo(-2, -150); g.quadraticCurveTo(-10, -140, -14, -112); g.closePath(); fillWith(g, WC.C(.35, pats.scarf)); ink(g, 2.4); }
  else { ell(g, 6, -158, 44, 9, -.05); fillWith(g, WC.C(.75, pats.weave)); ink(g, 2.6); g.beginPath(); g.moveTo(-14, -160); g.quadraticCurveTo(-12, -184, 6, -184); g.quadraticCurveTo(26, -184, 26, -160); g.closePath(); fillWith(g, WC.C(.75, pats.weave)); ink(g, 2.6); line(g, -14, -164, 26, -164); ink(g, 3); }
  // arms: holding the tool, or one arm up waving
  const wv = o.wave || 0;
  const tool = o.tool !== false && !o.woman;
  if (tool) {
    limb(g, [[-14, -104], [10, -70], [34, -60]], 15); mitten(g, 36, -60, 8);
    limb(g, [[16, -104], [lerp(30, 34, wv), lerp(-80, -140, wv)], [lerp(46, 40, wv), lerp(-66, -190, wv)]], 15); mitten(g, lerp(46, 40, wv), lerp(-66, -190, wv), 8);
  } else {
    limb(g, [[-16, -104], [-20, -70], [-10, -40]], 15); mitten(g, -10, -38, 8);
    limb(g, [[16, -104], [lerp(30, 40, wv), lerp(-72, -140, wv)], [lerp(34, 46, wv), lerp(-46, -186, wv)]], 15); mitten(g, lerp(34, 46, wv), lerp(-46, -186, wv), 8);
  }
  g.restore();
  // the hoe (drawn unrotated, from the hands down to the soil)
  if (o.tool !== false && !o.woman) {
    const hx = 36, hy = -160 + bend * 30;
    const tx = 90 + bend * 30, ty = -2;
    line(g, hx - 30 + wv * 20, hy - 40 - wv * 60, tx, ty); ink(g, 5);
    pth(g, [[tx - 4, ty - 8], [tx + 30, ty - 4], [tx + 28, ty + 4], [tx - 4, ty + 2]]); fillWith(g, Cw(0));
  }
  if (o.bundle) { // eviction: a bundle on a stick over the shoulder
    line(g, 0, -196, -96, -238); ink(g, 4.5); // the stick rests on the shoulder, the bundle hangs behind
    ell(g, -104, -222, 30, 26); fillWith(g, WC.LG(g, -134, 0, -74, 0, [[0, .2], [.5, .55], [1, .1]], pats.smock)); ink(g, 3);
    pth(g, [[-116, -246], [-124, -262], [-108, -252], [-94, -266], [-98, -244]]); fillWith(g, Cw(0));
  }
  g.restore();
}

// ---------- a queen standing: feet origin, facing right; bell gown, ermine cape, red crown ----------
function drawQueen(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y - (o.hop || 0)); g.scale(k, k);
  g.beginPath(); g.moveTo(-26, -170); g.lineTo(26, -170); g.quadraticCurveTo(74, -60, 86, 0); g.lineTo(-86, 0); g.quadraticCurveTo(-74, -60, -26, -170); g.closePath();
  fillWith(g, WC.LG(g, -86, 0, 86, 0, [[0, .25], [.45, .8], [.7, .3], [1, .08]], pats.gown)); ink(g, 3.5);
  for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 8, -160); g.quadraticCurveTo(i * 22, -80, i * 32, -6); cutl(g, 2); }
  g.beginPath(); g.moveTo(-86, 0); for (let i = 0; i <= 12; i++) g.lineTo(-86 + i * 172 / 12, i % 2 ? -10 : 0); g.lineTo(86, 0); ink(g, 3);
  // bodice and ermine cape
  pth(g, [[-26, -238], [26, -238], [26, -168], [-26, -168]]); fillWith(g, WC.C(.18, pats.gown)); ink(g, 3);
  g.beginPath(); g.moveTo(-50, -232); g.quadraticCurveTo(0, -262, 50, -232); g.quadraticCurveTo(46, -196, 30, -196); g.quadraticCurveTo(0, -214, -30, -196); g.quadraticCurveTo(-46, -196, -50, -232); g.closePath();
  ermineFill(g, 41, 16, -54, -262, 54, -190); ink(g, 3);
  // hands folded at the waist
  mitten(g, 6, -170, 10); mitten(g, 18, -166, 10);
  // head, long hair down the back, red crown
  g.beginPath(); g.moveTo(-26, -290); g.quadraticCurveTo(-40, -230, -30, -190); g.lineTo(-10, -200); g.quadraticCurveTo(-18, -240, -8, -290); g.closePath(); fillWith(g, WC.C(.25, pats.hair)); ink(g, 2.4);
  ell(g, 0, -278, 24, 28); fillWith(g, WC.LG(g, -24, 0, 26, 0, [[0, .55], [.4, 1], [1, 1]], pats.face)); ink(g, 3);
  ell(g, 10, -282, 3, 3.5); fillWith(g, Cw(0)); g.beginPath(); g.moveTo(22, -280); g.quadraticCurveTo(30, -270, 22, -266); ink(g, 2.4);
  g.beginPath(); g.moveTo(8, -258); g.quadraticCurveTo(14, -254, 20, -259); ink(g, 2.2);
  g.beginPath(); g.moveTo(-24, -290); g.quadraticCurveTo(-4, -312, 22, -296); g.quadraticCurveTo(4, -300, -6, -292); g.closePath(); fillWith(g, WC.C(.25, pats.hair));
  g.beginPath(); g.moveTo(-18, -300); g.lineTo(-18, -322); g.lineTo(-8, -310); g.lineTo(2, -328); g.lineTo(12, -310); g.lineTo(20, -322); g.lineTo(20, -300); g.closePath(); fillWith(g, Cw(1, 0, 1)); ink(g, 2.6);
  g.restore();
}
// ---------- a child: feet origin, facing right; small red crown. o.hop, o.glass (spyglass to the eye) ----------
function drawChild(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y - (o.hop || 0)); g.scale(k, k);
  for (const s of [-1, 1]) { line(g, s * 8, -60, s * 9, -6); ink(g, 8); ell(g, s * 9 + 5, -3, 10, 5); fillWith(g, Cw(0)); }
  pth(g, [[-22, -130], [22, -130], [36, -54], [-36, -54]]); fillWith(g, WC.LG(g, -36, 0, 36, 0, [[0, .3], [.5, .85], [1, .2]], pats.gown)); ink(g, 3);
  g.beginPath(); g.rect(-36, -60, 72, 8); fillWith(g, Cw(1)); ink(g, 2);
  ell(g, 2, -152, 20, 22); fillWith(g, WC.LG(g, -20, 0, 22, 0, [[0, .55], [.4, 1], [1, 1]], pats.face)); ink(g, 3);
  g.beginPath(); g.moveTo(-18, -160); g.quadraticCurveTo(-10, -180, 16, -172); g.quadraticCurveTo(0, -170, -8, -162); g.closePath(); fillWith(g, Cw(0));
  ell(g, 10, -154, 2.6, 3); fillWith(g, Cw(0));
  g.beginPath(); g.moveTo(8, -138); g.quadraticCurveTo(13, -134, 18, -138); ink(g, 2);
  g.beginPath(); g.moveTo(-12, -170); g.lineTo(-12, -186); g.lineTo(-4, -178); g.lineTo(4, -190); g.lineTo(12, -178); g.lineTo(18, -186); g.lineTo(18, -168); g.closePath(); fillWith(g, Cw(1, 0, 1)); ink(g, 2.2);
  const gl = o.glass || 0;
  if (gl > .02) {
    const ex = 12, ey = -154, L = 70 * gl;
    limb(g, [[16, -124], [30, -132], [ex + 10, ey + 8]], 12); mitten(g, ex + 12, ey + 6, 7);
    g.beginPath(); g.moveTo(ex + 4, ey - 7); g.lineTo(ex + 4 + L, ey - 11); g.lineTo(ex + 4 + L, ey + 9); g.lineTo(ex + 4, ey + 6); g.closePath(); fillWith(g, Cw(0));
    line(g, ex + 20, ey - 8, ex + 20, ey + 7); cutl(g, 2); line(g, ex + 4 + L * .6, ey - 9, ex + 4 + L * .6, ey + 8); cutl(g, 2);
  } else { limb(g, [[16, -124], [22, -96], [24, -74]], 12); mitten(g, 24, -72, 7); }
  g.restore();
}

// ---------- a winged poison bottle (skull and crossbones on the label) ----------
function drawPoisonBottle(g, x, y, k, flap, rot, pats) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  for (const s of [-1, 1]) { // wings, feathers cut
    g.save(); g.translate(0, -20); g.rotate(s * (.5 + flap * .6)); g.scale(s, 1);
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(40, -60, 96, -56); g.quadraticCurveTo(80, -40, 88, -30); g.quadraticCurveTo(66, -24, 74, -12); g.quadraticCurveTo(40, -6, 0, 6); g.closePath(); fillWith(g, WC.C(.7, pats.wing)); ink(g, 2.6);
    for (let i = 0; i < 3; i++) { line(g, 20 + i * 18, -10 - i * 6, 54 + i * 14, -44 + i * 8); ink(g, 1.6); }
    g.restore();
  }
  g.beginPath(); g.roundRect(-30, -50, 60, 96, 14); fillWith(g, WC.LG(g, -30, 0, 30, 0, [[0, .1], [.3, .6], [.5, .15], [1, .05]], pats.glass)); ink(g, 3);
  g.beginPath(); g.rect(-11, -76, 22, 28); fillWith(g, Cw(0)); g.beginPath(); g.rect(-14, -88, 28, 14); fillWith(g, Cw(.75, pats.glass)); ink(g, 2.4);
  g.beginPath(); g.rect(-24, -24, 48, 52); fillWith(g, Cw(1)); ink(g, 2.4);
  ell(g, 0, -6, 11, 10); fillWith(g, Cw(0)); g.beginPath(); g.rect(-6, 2, 12, 7); fillWith(g, Cw(0));
  ell(g, -4, -7, 3, 3); fillWith(g, Cw(1)); ell(g, 4, -7, 3, 3); fillWith(g, Cw(1));
  line(g, -14, 12, 14, 24); ink(g, 4); line(g, 14, 12, -14, 24); ink(g, 4);
  g.restore();
}

// ---------- a pine tree: base origin, falls by angle fall (radians, + to the right) ----------
function drawPine(g, x, y, h, fall, pats) {
  g.save(); g.translate(x, y); g.rotate(fall);
  g.beginPath(); g.rect(-9, -h * .25, 18, h * .25 + 2); fillWith(g, WC.C(.2, pats.bark)); ink(g, 2.4);
  for (let i = 0; i < 4; i++) {
    const y0 = -h * (.2 + i * .19), w = h * (.26 - i * .05), ht = h * .32;
    pth(g, [[-w, y0], [w, y0], [0, y0 - ht]]); fillWith(g, WC.LG(g, -w, 0, w, 0, [[0, .55], [.5, .25], [1, .08]], pats.needle)); ink(g, 3);
    g.beginPath(); for (let j = 0; j <= 6; j++) { const u = j / 6; g.lineTo(lerp(-w, w, u), y0 + (j % 2 ? -8 : 0)); } ink(g, 2);
  }
  g.restore();
}
// ---------- a round house with a conical thatch roof ----------
function drawHut(g, x, y, w, pats) {
  g.beginPath(); g.rect(x - w / 2, y - w * .55, w, w * .55); fillWith(g, WC.LG(g, x - w / 2, 0, x + w / 2, 0, [[0, .45], [.5, .95], [1, .35]], pats.wall)); ink(g, 3);
  g.beginPath(); g.roundRect(x - w * .1, y - w * .34, w * .2, w * .34, [w * .1, w * .1, 0, 0]); fillWith(g, Cw(0));
  pth(g, [[x - w * .66, y - w * .5], [x + w * .66, y - w * .5], [x, y - w * 1.25]]); fillWith(g, WC.LG(g, 0, y - w * 1.25, 0, y - w * .5, [[0, .3], [1, .7]], pats.thatch)); ink(g, 3);
}
// ---------- a castle on a hill (small, far off) ----------
function drawCastle(g, x, y, s, pats, crown = true) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const bat = (x0, y0, w) => { for (let i = 0; i < w / 14; i++) if (i % 2 === 0) { g.beginPath(); g.rect(x0 + i * 14, y0 - 12, 14, 12); fillWith(g, Cw(0)); } };
  g.beginPath(); g.rect(-90, -110, 180, 110); fillWith(g, WC.LG(g, -90, 0, 90, 0, [[0, .7], [.5, .95], [1, .4]], pats.stone)); ink(g, 3); bat(-90, -110, 180);
  for (const tx of [-110, 80]) { g.beginPath(); g.rect(tx, -170, 30, 170); fillWith(g, WC.LG(g, tx, 0, tx + 30, 0, [[0, .3], [.5, .85], [1, .25]], pats.stone)); ink(g, 3); bat(tx, -170, 30); }
  g.beginPath(); g.rect(-24, -210, 48, 210); fillWith(g, WC.LG(g, -24, 0, 24, 0, [[0, .3], [.5, .9], [1, .2]], pats.stone)); ink(g, 3); bat(-24, -210, 48);
  g.beginPath(); g.roundRect(-20, -50, 40, 50, [20, 20, 0, 0]); fillWith(g, Cw(0));
  for (const [wx, wy] of [[-60, -80], [50, -80], [-5, -150], [-98, -130], [92, -130]]) { g.beginPath(); g.rect(wx, wy, 10, 18); fillWith(g, Cw(0)); }
  if (crown) { line(g, 0, -222, 0, -270); ink(g, 3); g.beginPath(); g.moveTo(0, -268); g.lineTo(-2, -244); g.lineTo(36, -256); g.closePath(); fillWith(g, Cw(1, 0, 1)); ink(g, 2); }
  g.restore();
}
// ---------- a shareholder seen from behind (a head, top hat, shoulders) ----------
function drawHeadBehind(g, x, y, k, kind, pats) {
  g.save(); g.translate(x, y); g.scale(k, k);
  g.beginPath(); g.moveTo(-60, 80); g.quadraticCurveTo(-60, 10, -18, 4); g.lineTo(18, 4); g.quadraticCurveTo(60, 10, 60, 80); g.closePath(); fillWith(g, WC.LG(g, -60, 0, 60, 0, [[0, .3], [.5, .08], [1, .02]], pats.coat)); ink(g, 3);
  ell(g, 0, -24, 26, 30); fillWith(g, WC.C(.3, pats.hair)); ink(g, 3);
  for (const s of [-1, 1]) { ell(g, s * 26, -20, 6, 10); fillWith(g, Cw(1)); ink(g, 2); }
  if (kind === 'cap') { // a ruler's peaked cap and plume, seen from behind
    pth(g, [[-30, -44], [30, -44], [34, -72], [-34, -72]]); fillWith(g, WC.C(.5, pats.cap)); ink(g, 2.6); g.beginPath(); g.rect(-30, -52, 60, 9); fillWith(g, Cw(0));
    g.beginPath(); g.moveTo(-6, -72); g.bezierCurveTo(-24, -100, -2, -120, 8, -126); g.bezierCurveTo(4, -104, 2, -88, 4, -72); g.closePath(); fillWith(g, WC.C(.4, pats.plume)); ink(g, 2);
  } else if (kind === 'hat') {
    pth(g, [[-25, -40], [25, -40], [22, -112], [-22, -112]]); fillWith(g, WC.LG(g, -25, 0, 25, 0, [[0, .05], [.3, .5], [.45, .1], [1, 0]], pats.cap)); ink(g, 2.6);
    ell(g, 0, -40, 38, 7); fillWith(g, Cw(0));
  } else { // a lady's bun and tiara
    ell(g, 0, -56, 18, 16); fillWith(g, WC.C(.3, pats.hair)); ink(g, 2.4);
    g.beginPath(); g.moveTo(-20, -44); g.lineTo(-12, -58); g.lineTo(-4, -46); g.lineTo(4, -62); g.lineTo(12, -46); g.lineTo(20, -58); g.lineTo(24, -40); g.closePath(); fillWith(g, Cw(1)); ink(g, 2);
  }
  g.restore();
}
// ---------- a bidding paddle (a blank round paddle, a crown mark) ----------
function drawPaddle(g, x, y, r, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.rect(-4, 0, 8, r * 1.8); fillWith(g, Cw(0));
  ell(g, 0, -r * .2, r, r); fillWith(g, Cw(1)); ink(g, 3); ell(g, 0, -r * .2, r * .76, r * .76); ink(g, 1.6);
  coinCrown(g, 0, -r * .2, r * .4, r * .36);
  g.restore();
}
// ---------- a twisted cord (the package's string) from (x0,y0) to (x1,y1) ----------
function cord(g, x0, y0, x1, y1, w = 14) {
  line(g, x0, y0, x1, y1); g.strokeStyle = Cw(0); g.lineWidth = w; g.lineCap = 'butt'; g.stroke(); g.lineCap = 'round';
  const L = Math.hypot(x1 - x0, y1 - y0), n = Math.floor(L / (w * .9)), ux = (x1 - x0) / L, uy = (y1 - y0) / L;
  for (let i = 0; i < n; i++) { const cx = x0 + ux * (i + .5) * w * .9, cy = y0 + uy * (i + .5) * w * .9; line(g, cx - ux * w * .3 - uy * w * .35, cy - uy * w * .3 + ux * w * .35, cx + ux * w * .3 + uy * w * .35, cy + uy * w * .3 - ux * w * .35); cutl(g, 2.2); }
}
// ---------- a red wax seal with a crown struck in it ----------
function waxSeal(g, x, y, r) {
  g.beginPath(); for (let i = 0; i <= 16; i++) { const a = i / 16 * TAU, rr = r * (1 + .1 * Math.sin(i * 2.7)); i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath();
  fillWith(g, Cw(1, 0, 1)); ink(g, 3);
  ell(g, x, y, r * .7, r * .7); ink(g, 2);
  g.beginPath(); g.moveTo(x - r * .4, y + r * .25); g.lineTo(x - r * .4, y - r * .2); g.lineTo(x - r * .2, y); g.lineTo(x, y - r * .32); g.lineTo(x + r * .2, y); g.lineTo(x + r * .4, y - r * .2); g.lineTo(x + r * .4, y + r * .25); g.closePath(); fillWith(g, Cw(0, 0, 1));
}
// ---------- a mouse sitting up, facing left. o.look 0..1 (looks out at us), o.hush 0..1 (paws over its mouth) ----------
function drawMouse(g, x, y, k, o, pats) {
  g.save(); g.translate(x, y); g.scale(k, k);
  g.beginPath(); g.moveTo(30, -8); g.bezierCurveTo(90, 0, 100, -40, 70, -60); ink(g, 3);
  ell(g, 6, -40, 34, 42); fillWith(g, WC.LG(g, -30, 0, 40, 0, [[0, .9], [1, .4]], pats.fur)); ink(g, 3);
  ell(g, -8, -28, 18, 22); fillWith(g, Cw(1)); ink(g, 1.6); // belly
  const lk = o.look || 0;
  g.save(); g.translate(-6, -86); g.rotate(-.2 + lk * .2);
  for (const s of [-1, 1]) { ell(g, s * 20 + 4, -22, 15, 16); fillWith(g, Cw(1)); ink(g, 3); ell(g, s * 20 + 4, -22, 8, 9); fillWith(g, Cw(.7, pats.fur)); }
  g.beginPath(); g.moveTo(-22, 0); g.quadraticCurveTo(-16, -24, 6, -22); g.quadraticCurveTo(30, -20, 26, 4); g.quadraticCurveTo(10, 22, lerp(-42, -22, lk), lerp(14, 20, lk)); g.closePath(); fillWith(g, WC.LG(g, -40, 0, 30, 0, [[0, .95], [1, .5]], pats.fur)); ink(g, 3);
  ell(g, lerp(-42, -22, lk), lerp(13, 19, lk), 5, 4); fillWith(g, Cw(0));
  for (const s of (lk > .5 ? [-1, 1] : [-1])) { ell(g, lerp(-8, -4 + s * 12, lk), -4, 4, 5); fillWith(g, Cw(0)); ell(g, lerp(-9, -5 + s * 12, lk), -6, 1.4, 1.4); fillWith(g, Cw(1)); }
  for (let i = -1; i <= 1; i++) { line(g, lerp(-34, -16, lk), lerp(14, 20, lk), lerp(-56, -40, lk), lerp(10, 20, lk) + i * 7); ink(g, 1.3); }
  g.restore();
  const h = o.hush || 0; // paws: at the chest, or up over the mouth
  for (const s of [-1, 1]) { const px = lerp(-12 + s * 10, -28 + s * 6, h), py = lerp(-34, -70, h); ell(g, px, py, 7, 6); fillWith(g, Cw(1)); ink(g, 2.4); }
  ell(g, -14, -2, 12, 6); fillWith(g, Cw(1)); ink(g, 2.4); ell(g, 16, -2, 12, 6); fillWith(g, Cw(1)); ink(g, 2.4);
  g.restore();
}
