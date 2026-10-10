// Things drawn on top of the sheet, in world units: the surveyor (a small engraved woman, a stand-in),
// the theodolite, the summit confessions, the dress of contour lines, the compass rose, the pressed daisy.
const PAPERC = '#f3ead3';

function strokeLimb(g, pts, w) { // an outlined limb: ink stroke, then paper inside
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.strokeStyle = INK; g.lineWidth = w; g.stroke(); g.strokeStyle = PAPERC; g.lineWidth = w - 1.5; g.stroke();
}
function hatch(g, x0, y0, x1, y1, step, ang, lw) { // parallel engraving lines over a box (call inside a clip)
  g.beginPath(); const c = Math.cos(ang), s = Math.sin(ang), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2;
  for (let d = -R; d <= R; d += step) { g.moveTo(cx + c * d - s * R, cy + s * d + c * R); g.lineTo(cx + c * d + s * R, cy + s * d - c * R); }
  g.lineWidth = lw; g.strokeStyle = INK; g.stroke();
}

// The surveyor. Feet at (x, y); s = scale (1 = 100 units tall). Faces right.
// P: {arm: 'down'|'point'|'scope'|'behind', armA: angle of the pointing arm, lean, eyes: 0 open..1 shut, pucker 0..1, bow 0..1}
function drawSurveyor(g, x, y, s, P) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const lw = 1.25;
  g.fillStyle = 'rgba(60,40,20,.2)'; g.beginPath(); g.ellipse(2, 0, 30, 6, 0, 0, TAU); g.fill();
  // skirt
  const skirt = new Path2D(); skirt.moveTo(-8.5, -52); skirt.bezierCurveTo(-12, -35, -20, -15, -23, -1); skirt.quadraticCurveTo(-12, 2, 0, 0); skirt.quadraticCurveTo(12, 2, 25, -1); skirt.bezierCurveTo(20, -15, 13, -35, 8.5, -52); skirt.closePath();
  g.fillStyle = PAPERC; g.fill(skirt);
  g.save(); g.clip(skirt); hatch(g, -26, -54, 26, 2, 2.4, .5, .55); g.fillStyle = 'rgba(243,234,211,.55)'; g.fillRect(-2, -54, 30, 58);
  g.beginPath(); for (const k of [-.55, -.2, .2, .55]) { g.moveTo(k * 15, -50); g.quadraticCurveTo(k * 20, -25, k * 34, 0); } g.lineWidth = .6; g.strokeStyle = INK; g.stroke(); g.restore();
  g.lineWidth = lw; g.strokeStyle = INK; g.stroke(skirt);
  // shoes
  g.fillStyle = INK; g.beginPath(); g.ellipse(9, -.5, 5, 2, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(-4, -.5, 4.5, 1.8, 0, 0, TAU); g.fill();
  // upper body pivots at the waist
  g.save(); g.translate(0, -52); g.rotate(P.lean || 0); g.translate(0, 52);
  const backArm = P.arm === 'behind' ? [[-4, -71], [-10, -60], [-5, -53]] : [[-4, -71], [-9, -60], [-8, -49]];
  strokeLimb(g, backArm, 5.2);
  const bod = new Path2D(); bod.moveTo(-8.5, -52); bod.lineTo(-7.5, -72); bod.quadraticCurveTo(0, -76, 7, -72); bod.lineTo(8.5, -52); bod.quadraticCurveTo(0, -50, -8.5, -52); bod.closePath();
  g.fillStyle = PAPERC; g.fill(bod); g.save(); g.clip(bod); hatch(g, -10, -78, 10, -50, 2.2, -.5, .5); g.restore(); g.lineWidth = lw; g.stroke(bod);
  // belt
  g.fillStyle = INK; g.fillRect(-8.6, -54.5, 17.2, 2.6);
  // head (bows forward when bow > 0)
  const bow = P.bow || 0;
  g.save(); g.translate(0, -76); g.rotate(bow * .55); g.translate(0, 76);
  g.lineWidth = lw; g.strokeStyle = INK; g.beginPath(); g.moveTo(-1.5, -74); g.lineTo(-1.5, -79); g.moveTo(2.5, -74); g.lineTo(2.5, -79); g.stroke();
  const hx = 1, hy = -85.5;
  g.beginPath(); g.arc(hx, hy, 7.6, 0, TAU); g.fillStyle = PAPERC; g.fill(); g.stroke();
  // nose and chin profile
  g.beginPath(); g.moveTo(hx + 7.2, hy - 2.5); g.lineTo(hx + 9.6, hy + .8); g.lineTo(hx + 7.4, hy + 1.6); g.stroke();
  // hair: swept back into a bun
  const hair = new Path2D(); hair.moveTo(hx + 6.5, hy - 4.5); hair.bezierCurveTo(hx + 4, hy - 10.5, hx - 7, hy - 10, hx - 8, hy - 2); hair.bezierCurveTo(hx - 8, hy + 3, hx - 5, hy + 5.5, hx - 3, hy + 6); hair.quadraticCurveTo(hx - 3, hy - 1, hx + 6.5, hy - 4.5); hair.closePath();
  g.fillStyle = INK; g.fill(hair);
  g.beginPath(); g.arc(hx - 9.5, hy - 5, 4.4, 0, TAU); g.fill();
  g.strokeStyle = PAPERC; g.lineWidth = .45; g.beginPath(); for (let k = 0; k < 4; k++) { g.moveTo(hx - 12 + k * 1.6, hy - 8); g.quadraticCurveTo(hx - 9 + k, hy - 5, hx - 11 + k * 1.8, hy - 1.5); } g.stroke();
  // eye
  g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = .9;
  if ((P.eyes || 0) > .5) { g.beginPath(); g.arc(hx + 4.2, hy - 1.6, 1.4, .2, Math.PI - .2); g.stroke(); }
  else { g.beginPath(); g.arc(hx + 4.4, hy - 1.4, 1.05, 0, TAU); g.fill(); }
  g.beginPath(); g.moveTo(hx + 2.4, hy - 3.9); g.lineTo(hx + 5.8, hy - 4.2); g.stroke(); // brow
  // mouth / pucker
  const pk = P.pucker || 0;
  if (pk > .05) { const lx = hx + 7.4 + pk * 2.2; g.beginPath(); g.ellipse(lx, hy + 2.6, 1.3 + pk * .9, 1.05, -.15, 0, TAU); g.ellipse(lx - .2, hy + 4.5, 1.2 + pk * .8, 1.0, .15, 0, TAU); g.fillStyle = INK; g.fill(); }
  else { g.beginPath(); g.moveTo(hx + 5.6, hy + 3.6); g.lineTo(hx + 8.2, hy + 3.3); g.lineWidth = .9; g.stroke(); }
  g.restore();
  // front arm
  if (P.arm === 'point') {
    const a = P.armA, sx = 3, sy = -71, e = [sx + Math.cos(a) * 14, sy + Math.sin(a) * 14], h = [sx + Math.cos(a) * 28, sy + Math.sin(a) * 28];
    strokeLimb(g, [[sx, sy], e, h], 5.2);
    g.beginPath(); g.arc(h[0], h[1], 2.6, 0, TAU); g.fillStyle = PAPERC; g.fill(); g.lineWidth = 1; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.moveTo(h[0], h[1]); g.lineTo(h[0] + Math.cos(a) * 6.5, h[1] + Math.sin(a) * 6.5); g.lineWidth = 1.8; g.stroke();
  } else if (P.arm === 'scope') strokeLimb(g, [[3, -71], [12, -66], [19, -72]], 5.2);
  else if (P.arm === 'behind') strokeLimb(g, [[3, -71], [-1, -61], [-6, -54]], 5.2);
  else strokeLimb(g, [[3, -71], [6, -60], [5, -49]], 5.2);
  g.restore();
  g.restore();
}

// Theodolite on its tripod; (x, y) = tripod foot centre, s scale, aim = telescope angle.
function drawTheodolite(g, x, y, s, aim) {
  g.save(); g.translate(x, y); g.scale(s, s); g.lineCap = 'round';
  g.fillStyle = 'rgba(60,40,20,.18)'; g.beginPath(); g.ellipse(0, 0, 22, 5, 0, 0, TAU); g.fill();
  g.strokeStyle = INK; g.lineWidth = 2.4;
  g.beginPath(); g.moveTo(0, -60); g.lineTo(-15, 0); g.moveTo(0, -60); g.lineTo(2, 2); g.moveTo(0, -60); g.lineTo(16, -1); g.stroke();
  g.lineWidth = .7; g.beginPath(); g.moveTo(-7, -30); g.lineTo(8, -30); g.stroke();
  g.fillStyle = PAPERC; g.lineWidth = 1.2;
  g.beginPath(); g.rect(-7, -64, 14, 4); g.fill(); g.stroke();
  g.beginPath(); g.rect(-4.5, -76, 9, 12); g.fill(); g.stroke();
  g.save(); g.clip(); hatch(g, -5, -77, 5, -63, 1.6, .9, .45); g.restore();
  g.save(); g.translate(0, -76); g.rotate(aim);
  g.beginPath(); g.rect(-10, -3.2, 26, 6.4); g.fill(); g.stroke();
  g.beginPath(); g.rect(16, -4.2, 4, 8.4); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-10, 0); g.lineTo(-14, 0); g.lineWidth = 2.4; g.stroke();
  g.restore();
  g.beginPath(); g.arc(0, -76, 2.2, 0, TAU); g.fillStyle = INK; g.fill();
  g.restore();
}

// Triangulation pillar symbol (triangle with a centre dot)
function trig(g, x, y, r, flash = 0) {
  g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * .87, y + r * .5); g.lineTo(x - r * .87, y + r * .5); g.closePath();
  g.fillStyle = flash > 0 ? `rgba(255,248,225,${.9})` : PAPERC; g.fill(); g.lineWidth = r * .22; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.arc(x, y + r * .05, r * .2, 0, TAU); g.fillStyle = INK; g.fill();
}
function label(g, txt, x, y, size, a = 1, sc = 1, align = 'center') {
  g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha *= a;
  g.font = NUMFONT.replace('{s}', size); g.textAlign = align; g.textBaseline = 'alphabetic';
  g.lineWidth = size * .22; g.strokeStyle = 'rgba(243,234,211,.9)'; g.strokeText(txt, 0, 0);
  g.fillStyle = INK; g.fillText(txt, 0, 0); g.restore();
}

// The summits confess: rings pulse out, the trig pillar flashes, the height pops up.
function drawConfessions(g, t) {
  T.peaks.forEach((p) => {
    const [x, y] = wp(p.x, p.y), t0 = B.confess + p.dl, u = t - t0;
    if (u > 0 && u < 1.6) for (let k = 0; k < 3; k++) {
      const v = clamp((u - k * .16) / 1.1); if (v <= 0 || v >= 1) continue;
      g.beginPath(); g.arc(x, y, 30 + v * 230, 0, TAU); g.strokeStyle = `rgba(138,66,32,${(1 - v) * .85})`; g.lineWidth = 3.5 * (1 - v) + 1; g.stroke();
    }
    trig(g, x, y, 15, u > 0 && u < .25 ? 1 : 0);
    if (u > 0) label(g, String(Math.round(p.h)), x, y - 30, 44, 1, easeOutBack(clamp(u / .35), 2.4));
  });
  T.spots.forEach((s) => {
    const u = t - s.tt; if (u <= 0) return;
    const [x, y] = wp(s.x, s.y), k = easeOutBack(clamp(u / .3), 2.2);
    g.beginPath(); g.arc(x, y, 3.5 * k, 0, TAU); g.fillStyle = INK; g.fill();
    label(g, String(Math.round(s.h)), x + 7, y - 6, 22, clamp(u / .15), k, 'left');
  });
}

// The dress: nested outlines like contours, worn by the highest summit, drawn on from the neckline down.
const DRESS = (() => {
  const P = [[-40, 26], [-30, 24], [-27, -6], [-23, -6], [-20, 22], [0, 40], [20, 22], [23, -6], [27, -6], [30, 24], [40, 26], [36, 120], [60, 190], [120, 300], [215, 392], [140, 405], [70, 395], [0, 410], [-70, 395], [-140, 405], [-215, 392], [-120, 300], [-60, 190], [-36, 120]];
  return chaikin(P, 2, true);
})();
function drawDress(g, t) {
  const u = ease(t, B.dress - .15, B.dress + .9); if (u <= 0) return;
  const p = T.peaks[1], [sx, sy] = wp(p.x, p.y), tw = WARP.amt * Math.exp(-((p.x - WARP.cx) ** 2 + (p.y - WARP.cy) ** 2) / WARP.R ** 2);
  g.save(); g.translate(sx, sy + 12); g.rotate(tw); g.scale(1.25, 1.25);
  g.beginPath(); g.rect(-260, -40, 520, 60 + u * 420); g.clip();
  // the cloth hides the ground's own contours a little
  g.beginPath(); DRESS.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = 'rgba(238,227,200,.72)'; g.fill();
  for (let k = 0; k < 7; k++) {
    const sc = 1 - k * .1, cy = 200;
    g.beginPath(); DRESS.forEach(([x, y], i) => { const X = x * sc, Y = cy + (y - cy) * sc; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath();
    g.strokeStyle = k === 0 ? 'rgba(138,66,32,.95)' : 'rgba(168,88,42,.8)'; g.lineWidth = k === 0 ? 3 : 1.6; g.stroke();
  }
  // a bow at the waist, also in contour line
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(sd * (20 - k * 2), 118, 20 - k * 5, 10 - k * 2.5, sd * .35, 0, TAU); g.strokeStyle = 'rgba(138,66,32,.9)'; g.lineWidth = 1.6; g.stroke(); }
  g.beginPath(); g.arc(0, 118, 5, 0, TAU); g.fillStyle = BROWN_D; g.fill();
  g.restore();
}

// The compass rose in the sea. ang = rotation of the whole rose.
function drawCompass(g, t, ang) {
  const [x, y] = COMPASS, R = 165;
  g.save(); g.translate(x, y);
  g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.stroke(); g.lineWidth = 1.2; g.beginPath(); g.arc(0, 0, R - 14, 0, TAU); g.stroke();
  g.rotate(ang);
  g.beginPath(); for (let k = 0; k < 72; k++) { const a = k / 72 * TAU, l = k % 9 === 0 ? 14 : k % 3 === 0 ? 9 : 5; g.moveTo(Math.cos(a) * (R - 14), Math.sin(a) * (R - 14)); g.lineTo(Math.cos(a) * (R - 14 - l), Math.sin(a) * (R - 14 - l)); } g.lineWidth = 1.1; g.stroke();
  const pt = (a, len, wd) => { // a two-tone star point
    const c = Math.cos(a), s = Math.sin(a), px = -s, py = c;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(c * len, s * len); g.lineTo(c * wd + px * wd, s * wd + py * wd); g.closePath(); g.fillStyle = INK; g.fill();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(c * len, s * len); g.lineTo(c * wd - px * wd, s * wd - py * wd); g.closePath(); g.fillStyle = PAPERC; g.fill(); g.lineWidth = 1; g.strokeStyle = INK; g.stroke();
  };
  for (let k = 0; k < 8; k++) pt(-Math.PI / 2 + Math.PI / 4 + k * Math.PI / 2 * (k < 4 ? 1 : 1), R * .5, 12);
  for (let k = 0; k < 4; k++) pt(-Math.PI / 2 + k * Math.PI / 2, R * .93, 20);
  // north arrowhead flourish
  g.beginPath(); g.moveTo(0, -R - 34); g.lineTo(13, -R - 6); g.lineTo(0, -R - 14); g.lineTo(-13, -R - 6); g.closePath(); g.fillStyle = INK; g.fill();
  g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.fillStyle = PAPERC; g.fill(); g.lineWidth = 1.6; g.stroke(); g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fillStyle = INK; g.fill();
  g.restore();
}

// ---------- the pressed daisy ----------
const NPET = 10, PET_L = 64, PET_W = 15;
const PET_A = [...Array(NPET)].map((_, i) => -Math.PI / 2 + i * TAU / NPET + (rnd(i, 5) - .5) * .12);
function petalShape(g, len, w) {
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(w * .7, len * .12, w * .62, len * .8, w * .16, len); g.lineTo(0, len * .96); g.lineTo(-w * .16, len);
  g.bezierCurveTo(-w * .62, len * .8, -w * .7, len * .12, 0, 0); g.closePath();
}
function drawPetal(g, x, y, a, lift, shade) {
  g.save(); g.translate(x, y); g.rotate(a - Math.PI / 2);
  const sc = 1 + lift * .14; g.scale(sc, sc);
  g.save(); g.translate(3 + lift * 16, 4 + lift * 20); petalShape(g, PET_L, PET_W); g.fillStyle = `rgba(50,35,20,${.16 - lift * .06})`; g.fill(); g.restore();
  petalShape(g, PET_L, PET_W);
  g.fillStyle = shade; g.fill(); g.lineWidth = .9; g.strokeStyle = 'rgba(120,105,80,.9)'; g.stroke();
  g.beginPath(); g.moveTo(0, 6); g.lineTo(0, PET_L * .85); g.moveTo(-3, 12); g.quadraticCurveTo(-4.5, PET_L * .5, -2.5, PET_L * .82); g.moveTo(3, 12); g.quadraticCurveTo(4.5, PET_L * .5, 2.5, PET_L * .82);
  g.lineWidth = .5; g.strokeStyle = 'rgba(150,135,105,.7)'; g.stroke();
  g.restore();
}
function petalState(i, t) { // where petal i is at time t: {x,y,a,lift,attached}
  const [cx, cy] = DAISY, a0 = PET_A[i], r0 = 15, td = PETALS[i];
  const base = { x: cx + Math.cos(a0) * r0, y: cy + Math.sin(a0) * r0, a: a0, lift: 0 };
  if (t < td - .2) return base;
  if (t < td) { const k = (t - td + .2) / .2; base.a += Math.sin(k * 40) * .05 * k; return base; }
  const u = clamp((t - td) / 1.15), e = 1 - (1 - u) ** 2.2;
  const side = rnd(i, 9) < .5 ? -1 : 1, dist = 95 + rnd(i, 10) * 60, ang = a0 + side * (.35 + rnd(i, 11) * .4);
  const ex = cx + Math.cos(ang) * dist, ey = cy + Math.sin(ang) * dist;
  const mx = (base.x + ex) / 2 - Math.sin(ang) * side * 40, my = (base.y + ey) / 2 + Math.cos(ang) * side * 40;
  const q = (p0, p1, p2) => (1 - e) * (1 - e) * p0 + 2 * (1 - e) * e * p1 + e * e * p2;
  return { x: q(base.x, mx, ex), y: q(base.y, my, ey), a: a0 + side * e * (1.8 + rnd(i, 12) * 1.6), lift: Math.sin(Math.PI * u) };
}
function drawDaisy(g, t) {
  const [cx, cy] = DAISY;
  g.save(); g.lineCap = 'round';
  // stem + leaves (pressed, olive-brown)
  const stem = [[cx, cy], [cx - 18, cy + 90], [cx - 50, cy + 170], [cx - 68, cy + 250]];
  g.strokeStyle = 'rgba(50,35,20,.15)'; g.lineWidth = 7; g.beginPath(); g.moveTo(stem[0][0] + 3, stem[0][1] + 4); g.bezierCurveTo(stem[1][0] + 3, stem[1][1] + 4, stem[2][0] + 3, stem[2][1] + 4, stem[3][0] + 3, stem[3][1] + 4); g.stroke();
  g.strokeStyle = '#7d7a45'; g.lineWidth = 5; g.beginPath(); g.moveTo(...stem[0]); g.bezierCurveTo(...stem[1], ...stem[2], ...stem[3]); g.stroke();
  for (const [lx, ly, la, ll] of [[cx - 30, cy + 140, -2.4, 70], [cx - 46, cy + 190, .5, 60]]) {
    g.save(); g.translate(lx, ly); g.rotate(la);
    g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(ll * .3, -14, ll * .75, -12, ll, 0); g.bezierCurveTo(ll * .7, 10, ll * .3, 11, 0, 0); g.fillStyle = '#8c8a52'; g.fill(); g.lineWidth = .9; g.strokeStyle = '#5b5a2e'; g.stroke();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(ll * .9, 0); g.lineWidth = .6; g.stroke(); g.restore();
  }
  // petals still on the flower first, fallen and falling ones after (they lie on top)
  const st = PET_A.map((_, i) => petalState(i, t));
  st.forEach((p, i) => { if (t < PETALS[i]) drawPetal(g, p.x, p.y, p.a, 0, '#fbf8ee'); });
  // disc
  g.beginPath(); g.arc(cx + 2, cy + 3, 21, 0, TAU); g.fillStyle = 'rgba(50,35,20,.18)'; g.fill();
  g.beginPath(); g.arc(cx, cy, 20, 0, TAU); g.fillStyle = '#d8a43c'; g.fill(); g.lineWidth = 1.2; g.strokeStyle = '#8d5e1c'; g.stroke();
  for (let k = 0; k < 70; k++) { const r = Math.sqrt(k / 70) * 17, a = k * 2.39996; g.beginPath(); g.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.1, 0, TAU); g.fillStyle = k % 3 ? '#a8721f' : '#e9c56a'; g.fill(); }
  st.forEach((p, i) => { if (t >= PETALS[i]) drawPetal(g, p.x, p.y, p.a, p.lift, '#f8f3e4'); });
  // a strip of old tape holding the stem
  g.save(); g.translate(cx - 38, cy + 150); g.rotate(-.35);
  g.fillStyle = 'rgba(232,218,170,.55)'; g.fillRect(-34, -11, 68, 22); g.strokeStyle = 'rgba(160,140,90,.5)'; g.lineWidth = .8; g.strokeRect(-34, -11, 68, 22);
  g.restore();
  g.restore();
}
