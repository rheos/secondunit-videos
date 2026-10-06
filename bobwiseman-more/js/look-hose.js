// Look test 2: 1930s rubber-hose cartoon, verse 2 (65.5-97.5 s).
// Two-tone sepia ink-and-paint: thick clean outlines, noodle limbs, pie-cut eyes, white gloves,
// and everything in the diner bouncing on the 123 bpm beat. Film grain, gate weave, flicker,
// vignette and a rounded film gate go on top in screen space.
// Pure function of t: all motion is keyed off song time, word times and the beat grid.

// ---------- palette (warm two-tone sepia) ----------
const INK = '#17110b', PAPER = '#f3e9d3', L1 = '#ddd0b3', L1B = '#d2c4a5', L2 = '#bcac8e',
  MIDT = '#8f7f66', DK = '#5a4d3e', DEEP = '#2f271f', GLOVE = '#fbf5e8';
const FONT = (px) => `bold ${px}px Rockwell, "American Typewriter", Georgia, serif`;
const SNAP = 24; // song frames per second

// ---------- cue times, all from the sung words ----------
const V2 = (n, w) => wordTime('verse2', n, w);
const T0 = 65.5, TEND = 97.5;
const T_BOTTLE = V2(0, 'bottle'), T_SHOT = V2(0, 'shot');
const L1T = line('verse2', 1).t0, T_LITTLE = V2(1, 'little'), T_LOT = V2(1, 'lot');
const L2T = line('verse2', 2).t0, T_DONT = line('verse2', 2).words[1].t, T_RAIN = V2(2, 'rain'), T_DOWN = V2(2, 'downpour');
const L3T = line('verse2', 3).t0, T_LESS = V2(3, 'less'), T_MORE = V2(3, 'more');
const UPGRADES = [T_BOTTLE, T_LOT, T_DOWN, T_MORE];

// ---------- per-frame beat state (set at the top of drawFrame; pure per frame) ----------
let BI = 0, BP = 0, PU = 0, FI = 0;
const sway = (k = 0) => Math.sin(Math.PI * (BI + BP) + k); // +1/-1 alternating beats, continuous

// ---------- drawing primitives ----------
function ink(g, lw = 7) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); }
function fillInk(g, c, lw = 7) { g.fillStyle = c; g.fill(); ink(g, lw); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, TAU); }
// the rubber-hose dance: squash on the beat, stretch and hop between beats, lean alternate ways
function dance(g, x, y, k = 0, amp = 1) {
  const hop = Math.sin(Math.PI * BP);
  const sy = 1 - .12 * PU * amp + .035 * hop * amp, sx = 1 + .09 * PU * amp - .025 * hop * amp;
  g.translate(x, y - hop * 12 * amp); g.rotate(.045 * amp * sway() * (k % 2 ? 1 : -1)); g.scale(sx, sy);
}
// noodle limb: quadratic from shoulder to wrist; returns the tangent angle at the wrist
function hose(g, x0, y0, x1, y1, bend, w, fill) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend;
  g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1);
  g.lineCap = 'round'; g.lineWidth = w + 12; g.strokeStyle = INK; g.stroke();
  if (fill) { g.lineWidth = w; g.strokeStyle = fill; g.stroke(); }
  return Math.atan2(y1 - cy, x1 - cx);
}
// white four-finger cartoon glove pointing along +x after rotation
function glove(g, x, y, a, pose = 'open', s = 1) {
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
  if (Math.cos(a) < 0) g.scale(1, -1); // keep the thumb on top
  const lw = 5;
  if (pose === 'point') { ell(g, 46, -3, 22, 8.5); fillInk(g, GLOVE, lw); }
  else if (pose === 'open') { for (const fy of [-13, 0, 13]) { ell(g, 40, fy, 15, 7.5); fillInk(g, GLOVE, lw); } }
  ell(g, 16, -19, 9, 13, -.5); fillInk(g, GLOVE, lw);
  ell(g, 18, 0, 22, 19); fillInk(g, GLOVE, lw);
  if (pose !== 'open') { g.beginPath(); g.arc(30, 4, 9, -1.2, 1.6); g.moveTo(25, 13); g.arc(33, 14, 7, -1, 1.8); ink(g, 3.5); }
  g.beginPath(); for (const yy of [-7, 0, 7]) { g.moveTo(9, yy); g.lineTo(21, yy); } ink(g, 3);
  g.beginPath(); g.moveTo(-8, -18); g.lineTo(5, -23); g.lineTo(5, 23); g.lineTo(-8, 18); g.closePath(); fillInk(g, GLOVE, lw);
  g.restore();
}
// pie-cut eye: black oval with a pie-slice highlight, optional heavy lid
function pieEye(g, x, y, rx, ry, look = -2.3, lid = 0, skin = PAPER) {
  ell(g, x, y, rx, ry); g.fillStyle = INK; g.fill();
  g.beginPath(); g.moveTo(x + Math.cos(look) * rx * .2, y + Math.sin(look) * ry * .2);
  g.ellipse(x, y, rx * .86, ry * .86, 0, look - .45, look + .45); g.closePath(); g.fillStyle = skin; g.fill();
  if (lid > 0) {
    const ly = y - ry + 2 * ry * lid;
    g.save(); ell(g, x, y, rx + 2, ry + 2); g.clip(); g.fillStyle = skin; g.fillRect(x - rx - 4, y - ry - 4, 2 * rx + 8, ly - y + ry + 4); g.restore();
    g.beginPath(); g.moveTo(x - rx - 3, ly); g.lineTo(x + rx + 3, ly); ink(g, 4.5);
  }
}
// scalloped cloud with a single outer outline (stroke everything thick, then fill on top)
function cloudShape(g, puffs, fill, lw = 7) {
  g.beginPath(); for (const [x, y, r] of puffs) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); }
  g.lineWidth = lw * 2; g.strokeStyle = INK; g.stroke(); g.fillStyle = fill; g.fill();
}
// fit text inside maxW x maxH, centred on (0,0); returns the font px used
function fitText(g, s, maxW, maxH, px0 = 160) {
  g.font = FONT(px0); const m = g.measureText(s);
  const h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
  const px = Math.min(px0, px0 * maxW / m.width, px0 * maxH / h);
  g.font = FONT(px); const m2 = g.measureText(s);
  return { px, w: m2.width, asc: m2.actualBoundingBoxAscent, desc: m2.actualBoundingBoxDescent };
}

// ---------- the set ----------
const COUNTER_Y = 612;
function drawWall(g, t) {
  g.fillStyle = L1; g.fillRect(-300, -300, 2520, 1000);
  g.fillStyle = L1B; for (let x = -300; x < 2220; x += 84) g.fillRect(x, -300, 30, 1000);
  // ceiling moulding
  g.fillStyle = L2; g.fillRect(-300, -300, 2520, 336); g.beginPath(); g.moveTo(-300, 36); g.lineTo(2220, 36); ink(g, 7);
  g.beginPath(); g.moveTo(-300, 20); g.lineTo(2220, 20); ink(g, 3);
  // shelves with dancing bottles
  shelf(g, 40, 900, 338, 8, 11); shelf(g, 1560, 1890, 338, 3, 37);
  // wall clock, pendulum on the beat
  g.save(); dance(g, 1730, 230, 1, .7);
  g.beginPath(); g.moveTo(0, -10); g.lineTo(sway() * 34, 70); ink(g, 5); ell(g, sway() * 34, 78, 14, 14); fillInk(g, MIDT, 5);
  ell(g, 0, -80, 64, 64); fillInk(g, PAPER, 8); ell(g, 0, -80, 50, 50); ink(g, 3);
  g.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.moveTo(Math.cos(a) * 40, -80 + Math.sin(a) * 40); g.lineTo(Math.cos(a) * 48, -80 + Math.sin(a) * 48); } ink(g, 4);
  const hm = t * .9, hh = t * .075;
  g.beginPath(); g.moveTo(0, -80); g.lineTo(Math.sin(hm) * 38, -80 - Math.cos(hm) * 38); g.moveTo(0, -80); g.lineTo(Math.sin(hh) * 24, -80 - Math.cos(hh) * 24); ink(g, 6);
  g.restore();
  // hanging lamp swinging on the beat
  g.save(); g.translate(250, 30); g.rotate(.13 * sway(.5));
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 110); ink(g, 5);
  g.beginPath(); g.moveTo(-18, 110); g.lineTo(18, 110); g.lineTo(62, 170); g.quadraticCurveTo(0, 182, -62, 170); g.closePath(); fillInk(g, DK, 7);
  ell(g, 0, 178, 18, 12); fillInk(g, GLOVE, 5);
  g.restore();
}
function shelf(g, x0, x1, y, n, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const bx = x0 + 40 + (x1 - x0 - 80) * (i + .5) / n, h = 70 + r() * 60, w = 30 + r() * 22, tone = [MIDT, DK, PAPER, L2][Math.floor(r() * 4)];
    g.save(); dance(g, bx, y, i, 1.2);
    g.beginPath(); g.roundRect(-w / 2, -h, w, h, 8); fillInk(g, tone, 6);
    g.beginPath(); g.roundRect(-w * .2, -h - 32, w * .4, 36, 4); fillInk(g, tone, 6);
    g.beginPath(); g.rect(-w / 2 + 5, -h * .62, w - 10, h * .3); fillInk(g, PAPER, 4);
    g.beginPath(); g.moveTo(-w / 2 + 8, -h + 10); g.lineTo(-w / 2 + 8, -h * .7); g.lineWidth = 4; g.strokeStyle = 'rgba(255,250,235,.7)'; g.stroke();
    g.restore();
  }
  g.beginPath(); g.rect(x0, y, x1 - x0, 18); fillInk(g, DK, 6);
  for (const bx of [x0 + 40, x1 - 40]) { g.beginPath(); g.moveTo(bx, y + 18); g.lineTo(bx, y + 54); g.lineTo(bx + 28, y + 18); ink(g, 6); }
}
function drawCounter(g) {
  const b = 9 * sway(1);
  g.beginPath(); g.moveTo(-300, 598); g.quadraticCurveTo(960, 598 + b, 2220, 598); g.lineTo(2220, 642);
  g.quadraticCurveTo(960, 642 + b, -300, 642); g.closePath(); fillInk(g, PAPER, 8);
  g.beginPath(); g.moveTo(-300, 628); g.quadraticCurveTo(960, 628 + b, 2220, 628); ink(g, 3);
  // front panel
  g.beginPath(); g.moveTo(-300, 642); g.quadraticCurveTo(960, 642 + b, 2220, 642); g.lineTo(2220, 930); g.lineTo(-300, 930); g.closePath(); fillInk(g, DK, 8);
  g.beginPath(); for (let x = -260; x < 2220; x += 160) { g.moveTo(x, 662 + b * .5); g.lineTo(x, 880); } g.lineWidth = 6; g.strokeStyle = MIDT; g.stroke();
  g.beginPath(); g.rect(-300, 880, 2520, 50); fillInk(g, DEEP, 7);
  // checker floor in perspective
  const vy = 300, rows = [1, 1.13, 1.28, 1.45, 1.64], tw = 120;
  for (let ri = 0; ri < rows.length - 1; ri++) {
    const s0 = rows[ri], s1 = rows[ri + 1], y0 = vy + 630 * s0, y1 = vy + 630 * s1;
    for (let c = -14; c < 14; c++) {
      g.beginPath(); g.moveTo(960 + c * tw * s0, y0); g.lineTo(960 + (c + 1) * tw * s0, y0); g.lineTo(960 + (c + 1) * tw * s1, y1); g.lineTo(960 + c * tw * s1, y1); g.closePath();
      g.fillStyle = (c + ri) & 1 ? DEEP : PAPER; g.fill();
    }
  }
  g.beginPath(); g.moveTo(-300, 930); g.lineTo(2220, 930); ink(g, 7);
}
function stool(g, x, k, amp) {
  g.save(); dance(g, x, 1012, k, amp);
  ell(g, 0, 0, 62, 16); fillInk(g, DEEP, 7);
  g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -232); g.lineWidth = 30; g.strokeStyle = INK; g.stroke(); g.lineWidth = 18; g.strokeStyle = L2; g.stroke();
  g.beginPath(); g.moveTo(-44, -60); g.quadraticCurveTo(0, -46, 44, -60); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.moveTo(-74, -246); g.lineTo(-70, -222); g.quadraticCurveTo(0, -206, 70, -222); g.lineTo(74, -246); g.closePath(); fillInk(g, DK, 7);
  ell(g, 0, -248, 76, 19); fillInk(g, MIDT, 7);
  g.restore();
}

// ---------- props ----------
function shotX(t) {
  if (t < T0) return 590;
  if (t < 66.25) return lerp(590, 1170, ease.out(inv(T0, 66.25, t)));
  if (t < 66.62) return 1170;
  return lerp(1170, 985, ease.out(inv(66.62, 67.05, t)));
}
function drawShot(g, t) {
  let x = shotX(t), y = COUNTER_Y, rot = 0;
  y -= 46 * Math.sin(Math.PI * inv(T_BOTTLE, T_BOTTLE + .28, t));
  const d = t - T_SHOT;
  if (d > 0) { if (d > 1.1) return; x -= 1350 * d / 1.1; y += -560 * d + 900 * d * d; rot = -11 * d; }
  g.save(); g.translate(x, y); if (d <= 0) dance(g, 0, 0, 2, 1.3); g.rotate(rot); if (d > 0) g.translate(0, -25);
  g.beginPath(); g.moveTo(-24, -56); g.lineTo(24, -56); g.lineTo(18, 0); g.lineTo(-18, 0); g.closePath(); fillInk(g, L1, 6);
  g.beginPath(); g.moveTo(-21, -32); g.lineTo(21, -32); g.lineTo(18, -6); g.lineTo(-18, -6); g.closePath(); g.fillStyle = DK; g.fill();
  g.beginPath(); g.moveTo(-24, -56); g.lineTo(24, -56); g.lineTo(18, 0); g.lineTo(-18, 0); g.closePath(); ink(g, 6);
  g.beginPath(); g.moveTo(-12, -48); g.lineTo(-10, -12); g.lineWidth = 4; g.strokeStyle = PAPER; g.stroke();
  g.restore();
}
function drawBottle(g, t) {
  const d = t - T_BOTTLE;
  if (d < -.24) return;
  const x = 1185;
  let y = COUNTER_Y, sx = 1, sy = 1;
  if (d < 0) { y -= 1300 * Math.pow(-d / .24, 2); sy = 1.18; sx = .9; } // falling, stretched
  else { const j = Math.exp(-6 * d) * Math.cos(d * 26); sy = 1 - .3 * j; sx = 1 + .22 * j; }
  // speed lines while falling
  if (d < 0) {
    g.beginPath(); for (const o of [-90, -30, 30, 90]) { g.moveTo(x + o, y - 600); g.lineTo(x + o, y - 600 - 260); } ink(g, 5);
  }
  g.save(); g.translate(x, y); if (d > .4) dance(g, 0, 0, 3, .8); g.scale(sx, sy);
  g.beginPath(); g.moveTo(-115, -20); g.lineTo(-115, -300); g.bezierCurveTo(-115, -390, -38, -380, -36, -430); g.lineTo(-36, -520);
  g.lineTo(36, -520); g.lineTo(36, -430); g.bezierCurveTo(38, -380, 115, -390, 115, -300); g.lineTo(115, -20); g.quadraticCurveTo(115, 0, 95, 0); g.lineTo(-95, 0); g.quadraticCurveTo(-115, 0, -115, -20); g.closePath();
  fillInk(g, DK, 9);
  g.beginPath(); g.moveTo(-85, -40); g.lineTo(-85, -300); g.lineWidth = 14; g.strokeStyle = 'rgba(243,233,211,.55)'; g.stroke();
  g.beginPath(); g.moveTo(-22, -420); g.lineTo(-22, -505); g.lineWidth = 8; g.stroke();
  g.beginPath(); g.roundRect(-44, -556, 88, 40, 8); fillInk(g, L2, 7); // cork
  g.beginPath(); g.rect(-46, -530, 92, 18); fillInk(g, PAPER, 6);
  // label with XXX, fitted inside with margin
  g.beginPath(); g.roundRect(-88, -250, 176, 140, 12); fillInk(g, PAPER, 7);
  g.beginPath(); g.roundRect(-76, -238, 152, 116, 8); ink(g, 3);
  const ft = fitText(g, 'XXX', 152 - 36, 116 - 40, 90);
  g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText('XXX', 0, -180 + (ft.asc - ft.desc) / 2);
  g.restore();
  // dust on the slam
  if (d >= 0 && d < .8) puffs(g, x, COUNTER_Y - 6, d, 5, 150, 11);
}
function puffs(g, x, y, d, n, spread, seed) {
  const k = d / .8, a = 1 - k;
  g.save(); g.globalAlpha = clamp(a * 1.3);
  for (let i = 0; i < n * 2; i++) {
    const side = i % 2 ? 1 : -1, j = Math.floor(i / 2), r0 = hash2(seed, i);
    const px = x + side * (spread * .5 + j * 40 + ease.out(k) * (150 + r0 * 120)), py = y - 20 - j * 14 - ease.out(k) * (30 + r0 * 50);
    const r = (16 + r0 * 16) * (.6 + k);
    cloudShape(g, [[px, py, r], [px + r * .7, py + r * .2, r * .7], [px - r * .6, py + r * .25, r * .65]], PAPER, 4);
  }
  g.restore();
}
function drawPlate(g, t) {
  if (t < L1T + .1) return;
  // the waiter carries it in from his hand, sets it down on "little"
  const x = t < T_LITTLE ? lerp(600, 950, ease.inOut(inv(L1T + .1, T_LITTLE - .05, t))) : 950;
  g.save(); g.translate(x, COUNTER_Y - 2); dance(g, 0, 0, 4, .6);
  ell(g, 0, 0, 92, 21); fillInk(g, PAPER, 7); ell(g, 0, -1, 58, 12); ink(g, 3);
  const land = hit(t, T_LITTLE, 9);
  const py = -12 - 30 * Math.abs(Math.sin((t - T_LITTLE) * 14)) * land;
  ell(g, 0, py, 10, 10); fillInk(g, MIDT, 4); ell(g, -3, py - 3, 3, 3); g.fillStyle = PAPER; g.fill();
  g.restore();
}
function mountainX(t) {
  if (t < 77.85) return -2000;
  return lerp(-430, 740, Math.pow(inv(77.85, T_LOT, t), 1.6));
}
function drawMountain(g, t) {
  const mx = mountainX(t);
  if (mx < -900) return;
  const d = t - T_LOT;
  let shear = 0, sy = 1;
  if (d < 0) shear = -.22 * inv(77.85, 78.2, t);
  else { shear = .3 * Math.exp(-4 * d) * Math.sin(d * 17) - .22 * Math.exp(-14 * d); sy = 1 - .2 * Math.exp(-5 * d) * Math.cos(d * 22); }
  g.save(); g.translate(mx, COUNTER_Y); if (d > .6) dance(g, 0, 0, 5, .7); g.transform(1, 0, shear, sy, 0, 0); g.scale(1.12, 1.22);
  // platter
  ell(g, 0, -8, 320, 34); fillInk(g, PAPER, 8); ell(g, 0, -12, 270, 24); ink(g, 3);
  const r = rng(77);
  const rows = [7, 7, 6, 5, 4, 3, 2];
  for (let ri = 0; ri < rows.length; ri++) {
    const n = rows[ri], wrow = 280 - ri * 36, yrow = -40 - ri * 58;
    const wob = Math.sin(Math.PI * (BI + BP) + ri * .7) * ri * 4;
    for (let i = 0; i < n; i++) {
      const lx = -wrow + (2 * wrow) * (i + .5) / n + (r() - .5) * 30 + wob, ly = yrow + (r() - .5) * 18, kind = [0, 0, 1, 1, 2, 2, 3][Math.floor(r() * 7)], s = 38 + r() * 18;
      food(g, lx, ly, s, kind, r());
    }
  }
  // roast bird on top, bouncing on the beat
  g.save(); g.translate(0, -470 - 18 * Math.sin(Math.PI * BP)); g.rotate(.08 * sway());
  ell(g, 0, 0, 86, 54); fillInk(g, L2, 8);
  for (const sd of [-1, 1]) {
    g.beginPath(); g.moveTo(sd * 40, -30); g.lineTo(sd * 92, -84); ink(g, 22); g.lineWidth = 12; g.strokeStyle = L2; g.stroke();
    ell(g, sd * 98, -92, 14, 14); fillInk(g, GLOVE, 5);
  }
  g.beginPath(); g.moveTo(-50, 10); g.quadraticCurveTo(0, 30, 50, 10); ink(g, 3);
  g.restore();
  g.restore();
  // a few peas jump off on the landing
  if (d > 0 && d < 1.6) {
    for (let i = 0; i < 6; i++) {
      const vx = (hash2(i, 3) - .5) * 900, vy = -500 - hash2(i, 4) * 500, x0 = mx + (hash2(i, 5) - .5) * 300, y0 = COUNTER_Y - 200 - hash2(i, 6) * 200;
      let py = y0 + vy * d + 1100 * d * d; const px = x0 + vx * d;
      if (py > COUNTER_Y - 10) py = COUNTER_Y - 10;
      ell(g, px, py, 10, 10); fillInk(g, MIDT, 4);
    }
  }
}
function food(g, x, y, s, kind, v) {
  if (kind === 0) { ell(g, x, y, s * .8, s * .72); fillInk(g, MIDT, 6); ell(g, x - s * .3, y - s * .3, s * .16, s * .12); g.fillStyle = PAPER; g.fill(); }
  else if (kind === 1) { g.beginPath(); g.roundRect(x - s * 1.1, y - s * .38, s * 2.2, s * .76, s * .38); fillInk(g, DK, 6); g.beginPath(); g.moveTo(x - s * .6, y - s * .1); g.lineTo(x + s * .5, y - s * .1); g.lineWidth = 4; g.strokeStyle = MIDT; g.stroke(); }
  else if (kind === 2) { g.beginPath(); g.ellipse(x, y + s * .2, s, s * .75, 0, Math.PI, 0); g.closePath(); fillInk(g, L2, 6); g.beginPath(); for (const o of [-.4, 0, .4]) { g.moveTo(x + o * s - 6, y - s * .2); g.lineTo(x + o * s + 6, y - s * .3); } ink(g, 3.5); }
  else { ell(g, x, y, s * .9, s * .62, v - .5); fillInk(g, PAPER, 6); ell(g, x, y, s * .35, s * .24, v - .5); ink(g, 4); }
}

// ---------- the customer ----------
const CX = 1440, CY = 762, CS = 1.2;
const toC = (x, y) => [(x - CX) / CS, (y - CY) / CS];
const REST_COUNTER = toC(1255, 606), REST_BOTTLE = toC(1278, 572), REST_KNEE = [72, -14];
function signPose(t) {
  // hanging sign: drops in to land on "less", swings, flips on "more", grows into the chorus
  const drop = inv(89.75, T_LESS, t);
  let y = lerp(-320, 300, ease.in(drop));
  const d = t - T_LESS;
  if (d > 0) y = 300 + 26 * Math.exp(-5 * d) * Math.sin(d * 20);
  let ang = .035 * sway(.3);
  if (d > 0) ang += .13 * Math.exp(-1.4 * d) * Math.sin(d * 5.2);
  let k = 0; for (const b of FEAT.beats) { if (b < T_MORE + .7) continue; if (b > t) break; k += ease.back(inv(b, b + .2, t)); }
  const sc = 1 + .11 * k;
  const flip = t < T_MORE ? 0 : 3 * Math.PI * ease.out(inv(T_MORE, T_MORE + .85, t));
  return { x: 1010, y, ang, sc, flip, on: t > 89.75 };
}
function customerPose(t) {
  const st = {};
  let pl = 0; for (const u of UPGRADES) pl = Math.max(pl, smooth(inv(u, u + .25, t)) * (1 - smooth(inv(u + 2.2, u + 3.2, t))));
  st.pleased = pl;
  let nod = 0; for (const u of UPGRADES) { const q = inv(u + .3, u + .95, t); if (q > 0 && q < 1) nod = Math.sin(Math.PI * q) * 16; }
  st.nod = nod;
  // glances to camera: deadpan look at the audience after each plain thing
  let cam = 0; for (const [a, b] of [[T_LITTLE + .5, 77.4], [83.6, 85.6], [T_LESS + .55, 92.6]]) cam = Math.max(cam, smooth(inv(a, a + .25, t)) * (1 - smooth(inv(b - .25, b, t))));
  st.cam = cam;
  st.lid = lerp(.42, .16, pl);
  // left (near) arm
  const gx = shotX(t);
  const glassWrist = toC(gx + 96, 590);
  let L = REST_COUNTER, Lp = 'open';
  if (t < 66.4) L = REST_COUNTER;
  else if (t < 66.62) { L = lerpA(REST_COUNTER, toC(1170 + 96, 590), ease.inOut(inv(66.4, 66.62, t))); Lp = 'point'; }
  else if (t < 67.3) { L = glassWrist; Lp = 'point'; }
  else if (t < 67.9) { L = lerpA(glassWrist, REST_BOTTLE, ease.inOut(inv(67.45, 67.9, t))); Lp = t < 67.6 ? 'point' : 'open'; }
  else if (t < 70.55) L = REST_BOTTLE;
  else if (t < 71.4) {
    const tgt = toC(985 + 96, 590), wind = toC(985 + 112, 588), fl = toC(985 + 60, 594);
    if (t < 70.95) L = lerpA(REST_BOTTLE, tgt, ease.inOut(inv(70.55, 70.95, t)));
    else if (t < T_SHOT) L = lerpA(tgt, wind, ease.out(inv(70.95, T_SHOT, t)));
    else L = lerpA(wind, fl, ease.out(inv(T_SHOT, T_SHOT + .08, t)));
    Lp = 'point';
  }
  else if (t < 92.9) L = lerpA(toC(985 + 60, 594), REST_BOTTLE, ease.inOut(inv(71.4, 71.9, t)));
  else {
    const sp = signPose(t), corner = toC(sp.x + 240, sp.y + 140), flick = toC(sp.x + 120, sp.y + 175);
    if (t < 93.9) { L = lerpA(REST_BOTTLE, corner, ease.inOut(inv(92.9, 93.9, t))); Lp = 'point'; }
    else if (t < T_MORE) { L = corner; Lp = 'point'; }
    else if (t < T_MORE + .5) { L = lerpA(corner, flick, ease.out(inv(T_MORE, T_MORE + .12, t))); Lp = 'point'; }
    else L = lerpA(flick, REST_BOTTLE, ease.inOut(inv(T_MORE + .5, T_MORE + 1.0, t)));
  }
  st.L = L; st.Lp = Lp;
  // far arm: knee, or tipping the cap on the downpour
  const capOn = [8, -330], capUp = [46, -440];
  let R = REST_KNEE, cap = null;
  const c0 = T_DOWN + .08;
  if (t > c0 && t < c0 + 2.6) {
    if (t < c0 + .3) R = lerpA(REST_KNEE, capOn, ease.inOut(inv(c0, c0 + .3, t)));
    else if (t < c0 + .75) { R = lerpA(capOn, capUp, ease.out(inv(c0 + .3, c0 + .75, t))); cap = R; }
    else if (t < c0 + 1.8) { R = capUp; cap = R; }
    else if (t < c0 + 2.15) { R = lerpA(capUp, capOn, ease.inOut(inv(c0 + 1.8, c0 + 2.15, t))); cap = R; }
    else R = lerpA(capOn, REST_KNEE, ease.inOut(inv(c0 + 2.15, c0 + 2.6, t)));
  }
  st.R = R; st.cap = cap;
  return st;
}
const lerpA = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
function drawCustomer(g, t) {
  const st = customerPose(t);
  stool(g, CX, 6, .5);
  g.save(); g.translate(CX, CY - Math.sin(Math.PI * BP) * 5); g.scale(CS * (1 + .03 * PU), CS * (1 - .035 * PU));
  const lw = 6;
  // legs dangling, swinging alternately on the beat
  const sw = sway() * 12;
  for (const [hx, fx, fy, dir] of [[-26, -44 + sw, 128, -1], [24, 32 - sw, 132, 1]]) {
    g.beginPath(); g.moveTo(hx, 20); g.quadraticCurveTo(hx + dir * 6, 80, fx, fy); g.lineWidth = 26; g.strokeStyle = INK; g.stroke();
    ell(g, fx + dir * 20, fy + 10, 36, 18, dir * .08); fillInk(g, INK, lw); ell(g, fx + dir * 30, fy + 3, 10, 5); g.fillStyle = MIDT; g.fill();
  }
  // overcoat, too big
  g.beginPath(); g.moveTo(-58, -196); g.bezierCurveTo(-124, -182, -142, -40, -134, 44); g.quadraticCurveTo(0, 68, 134, 44);
  g.bezierCurveTo(142, -40, 124, -182, 58, -196); g.quadraticCurveTo(0, -210, -58, -196); g.closePath(); fillInk(g, DK, lw + 1);
  g.beginPath(); g.moveTo(-36, -196); g.lineTo(-6, -92); g.lineTo(-6, 54); g.moveTo(36, -196); g.lineTo(-6, -92); g.moveTo(-96, -10); g.lineTo(-56, -6); ink(g, 4);
  for (const by of [-66, -10]) { ell(g, -22, by, 7, 7); fillInk(g, PAPER, 4); }
  // head (nods once on each upgrade), face turned toward the counter or to camera
  const hy = -252 + st.nod, fx = lerp(-13, 0, st.cam);
  ell(g, 56, hy + 2, 13, 19); fillInk(g, PAPER, lw);
  ell(g, -4, hy, 62, 60); fillInk(g, PAPER, lw);
  const look = lerp(-2.35, -1.2, st.cam);
  for (const ex of [-27, 7]) pieEye(g, ex + fx, hy - 10, 8.5, 14, look, st.lid);
  const by = hy - 33 - st.pleased * 9;
  g.beginPath(); for (const ex of [-27, 7]) { g.moveTo(ex + fx - 10, by + st.pleased * 2); g.lineTo(ex + fx + 10, by - st.pleased * 2); } ink(g, 5);
  ell(g, -12 + fx * 1.4, hy + 13, 13, 10); g.fillStyle = INK; g.fill(); ell(g, -16 + fx * 1.4, hy + 9, 4, 3); g.fillStyle = PAPER; g.fill();
  g.beginPath(); g.moveTo(-34 + fx, hy + 36); g.lineTo(-2 + fx, hy + 36 - st.pleased * 3); ink(g, 5);
  // cap: on his head, or in his far hand
  g.save();
  if (st.cap) { g.translate(st.cap[0] - 10, st.cap[1] - 2); g.rotate(-.35); }
  else { g.translate(-4, hy - 50); g.rotate(-.06); }
  g.beginPath(); g.moveTo(-58, 2); g.quadraticCurveTo(-54, -32, 0, -36); g.quadraticCurveTo(54, -34, 62, 0); g.quadraticCurveTo(0, 12, -58, 2); g.closePath(); fillInk(g, DEEP, lw);
  g.beginPath(); g.ellipse(-62, 4, 40, 10, -.08, 0, TAU); fillInk(g, DEEP, lw);
  ell(g, 0, -36, 8, 5); fillInk(g, MIDT, 4);
  g.beginPath(); g.moveTo(-10, -32); g.quadraticCurveTo(10, -18, 40, -8); g.lineWidth = 3; g.strokeStyle = MIDT; g.stroke();
  g.restore();
  // turned-up collar swallowing the chin
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 64, -194); g.lineTo(s * 76, -238); g.lineTo(s * 18, -204); g.closePath(); fillInk(g, DK, lw); }
  // arms: far one first if resting, near one on top
  const drawArm = (sh, wr, pose, bend) => { const a = hose(g, sh[0], sh[1], wr[0], wr[1], bend, 22, DK); ell(g, wr[0] - Math.cos(a) * 6, wr[1] - Math.sin(a) * 6, 15, 15); fillInk(g, DK, 5); glove(g, wr[0], wr[1], a, pose, 1.05); };
  drawArm([62, -168], st.R, st.cap ? 'fist' : 'open', st.cap ? -30 : 40);
  drawArm([-60, -170], st.L, st.Lp, st.L[1] < -260 ? 40 : -50);
  g.restore();
}

// ---------- the waiter ----------
const WS = 1.2;
function waiterX(t) {
  if (t < 75.5) return 470;
  if (t < 77.85) return lerp(470, -320, ease.in(inv(75.5, 76.9, t)));
  return mountainX(t) - 430;
}
function drawWaiter(g, t) {
  const wx = waiterX(t);
  const toW = (x, y) => [(x - wx) / WS, (y - COUNTER_Y) / WS];
  let jump = 70 * Math.sin(Math.PI * inv(T_BOTTLE, T_BOTTLE + .42, t));
  const walking = t > 75.5 && t < T_LOT + .1;
  if (walking) jump += Math.abs(Math.sin(t * 13)) * 16;
  const startle = Math.max(inv(T_BOTTLE, T_BOTTLE + .05, t) * (1 - inv(T_BOTTLE + .8, T_BOTTLE + 1.1, t)), inv(T_LOT, T_LOT + .05, t) * (1 - inv(T_LOT + .6, T_LOT + .9, t)));
  let lean = walking ? .12 : 0;
  if (t > 77.85 && t < T_LOT + .3) lean = .26;
  g.save(); g.translate(wx, COUNTER_Y - jump); g.scale(WS * (1 + .03 * PU), WS * (1 - .03 * PU)); g.rotate(lean + .03 * sway(1.3));
  const lw = 6;
  // right arm (toward the customer)
  let R = [96, -14], Rp = 'open';
  if (t < 66.7) { const [gx] = [shotX(t)]; const atGlass = toW(gx - 34, COUNTER_Y - 18); R = t < 66.25 ? atGlass : lerpA(atGlass, [96, -14], ease.inOut(inv(66.25, 66.7, t))); }
  else if (t > L1T && t < T_LITTLE + .5) { const px = lerp(600, 950, ease.inOut(inv(L1T + .1, T_LITTLE - .05, t))); const at = toW(px - 100, COUNTER_Y - 14); R = t < T_LITTLE ? lerpA([96, -14], at, inv(L1T, L1T + .1, t)) : lerpA(at, [96, -14], ease.inOut(inv(T_LITTLE + .1, T_LITTLE + .5, t))); }
  else if (t > 77.85 && t < T_LOT + .5) R = [104, -70];
  else if (t > T_MORE + .3) { R = lerpA([96, -14], [44, -300], ease.inOut(inv(T_MORE + .3, T_MORE + .75, t))); Rp = 'open'; }
  // left arm: hip with towel, pushing, mopping the brow, towel on head in the flood
  let Lw = [-70, -84], towel = 'arm';
  if (t > 77.85 && t < T_LOT + .5) Lw = [100, -150];
  else if (t > T_LOT + .5 && t < T_LOT + 2.2) { const q = inv(T_LOT + .5, T_LOT + 2.2, t); Lw = lerpA([-70, -84], [-10, -352], Math.sin(Math.PI * q)); towel = 'hand'; }
  else if (t > T_DOWN + .1 && t < 90.2) { const q = inv(T_DOWN + .1, T_DOWN + .45, t), r = inv(89.8, 90.2, t); Lw = lerpA([-70, -84], [-10, -385], ease.inOut(q) * (1 - ease.inOut(r))); towel = q > .9 && r < .1 ? 'head' : 'hand'; }
  // jacket, vest, bow tie
  g.beginPath(); g.moveTo(-58, -214); g.lineTo(58, -214); g.quadraticCurveTo(74, -100, 68, 40); g.lineTo(-68, 40); g.quadraticCurveTo(-74, -100, -58, -214); g.closePath(); fillInk(g, PAPER, lw);
  g.beginPath(); g.moveTo(-32, -214); g.lineTo(0, -110); g.lineTo(32, -214); g.closePath(); fillInk(g, DEEP, lw);
  for (const by of [-90, -50]) { ell(g, 0, by, 6, 6); fillInk(g, DEEP, 3); }
  g.beginPath(); g.rect(-14, -246, 28, 36); fillInk(g, PAPER, lw);
  g.beginPath(); g.moveTo(0, -216); g.lineTo(-26, -230); g.lineTo(-26, -202); g.closePath(); g.moveTo(0, -216); g.lineTo(26, -230); g.lineTo(26, -202); g.closePath(); fillInk(g, DEEP, 4);
  // head: long egg, bald with three hairs, long nose, droopy moustache, heavy lids, sad brows
  const hy = -306;
  ell(g, -42, hy + 4, 12, 18); fillInk(g, PAPER, lw);
  ell(g, 0, hy, 46, 62); fillInk(g, PAPER, lw);
  g.beginPath(); for (const o of [-10, 0, 10]) { g.moveTo(o - 4, hy - 60); g.quadraticCurveTo(o + 10 * Math.sin(t * 3 + o), hy - 92, o + 8, hy - 84); } ink(g, 3.5);
  const lid = lerp(.56, 0, startle), er = 1 + .35 * startle;
  for (const ex of [12, 34]) pieEye(g, ex, hy - 14, 8.5 * er, 15 * er, -.9, lid);
  g.beginPath(); g.moveTo(1, hy - 34 - 14 * startle); g.lineTo(19, hy - 42 - 14 * startle); g.moveTo(27, hy - 42 - 14 * startle); g.lineTo(45, hy - 34 - 14 * startle); ink(g, 4.5);
  g.beginPath(); g.moveTo(34, hy + 22); g.bezierCurveTo(26, hy + 42, 6, hy + 60, -4, hy + 64); g.bezierCurveTo(14, hy + 40, 30, hy + 30, 44, hy + 22);
  g.bezierCurveTo(58, hy + 30, 72, hy + 46, 82, hy + 64); g.bezierCurveTo(66, hy + 58, 52, hy + 42, 44, hy + 22); g.closePath(); g.fillStyle = INK; g.fill();
  ell(g, 50, hy + 6, 30, 15, .4); fillInk(g, PAPER, lw);
  if (towel === 'head') { g.beginPath(); g.moveTo(-52, hy - 40); g.quadraticCurveTo(0, hy - 92, 52, hy - 40); g.lineTo(46, hy + 6); g.lineTo(-58, hy + 4); g.closePath(); fillInk(g, GLOVE, 5); g.beginPath(); g.moveTo(-50, hy - 26); g.lineTo(48, hy - 26); g.moveTo(-54, hy - 14); g.lineTo(47, hy - 14); g.lineWidth = 3; g.strokeStyle = MIDT; g.stroke(); }
  // arms: white sleeves
  const arm = (sh, wr, pose, bend) => { const a = hose(g, sh[0], sh[1], wr[0], wr[1], bend, 18, PAPER); glove(g, wr[0], wr[1], a, pose, 1); return a; };
  arm([-52, -196], Lw, 'open', -40);
  if (towel === 'arm') { g.beginPath(); g.moveTo(Lw[0] - 30, Lw[1] - 14); g.lineTo(Lw[0] + 6, Lw[1] - 14); g.lineTo(Lw[0] + 10, Lw[1] + 70); g.lineTo(Lw[0] - 34, Lw[1] + 64); g.closePath(); fillInk(g, GLOVE, 5); g.beginPath(); g.moveTo(Lw[0] - 30, Lw[1] + 44); g.lineTo(Lw[0] + 8, Lw[1] + 48); g.lineWidth = 3; g.strokeStyle = MIDT; g.stroke(); }
  if (towel === 'hand') { g.beginPath(); g.moveTo(Lw[0] - 4, Lw[1] - 10); g.quadraticCurveTo(Lw[0] - 40, Lw[1] + 30, Lw[0] - 20, Lw[1] + 76); g.lineTo(Lw[0] + 20, Lw[1] + 70); g.quadraticCurveTo(Lw[0] + 10, Lw[1] + 30, Lw[0] + 22, Lw[1] - 4); g.closePath(); fillInk(g, GLOVE, 5); }
  arm([52, -196], R, Rp, 40);
  g.restore();
}

// ---------- weather ----------
function stormEnv(t) { return smooth(inv(T_DOWN - .25, T_DOWN, t)) * (1 - smooth(inv(89.2, 90.3, t))); }
function waterLevel(t) {
  if (t < T_DOWN) return 1200;
  return lerp(1120, 650, ease.out(inv(T_DOWN, T_DOWN + 1.2, t))) + 5 * Math.sin(t * 3.1);
}
function drawSmallCloud(g, t) {
  const a = inv(80.9, 81.35, t);
  if (a <= 0 || t > T_DOWN + .4) return;
  const s = ease.back(a) * (1 + .06 * PU) * (1 - inv(T_DOWN, T_DOWN + .4, t));
  if (s <= 0) return;
  const x = 1430, y = 190 + 8 * sway();
  // drizzle: a few neat drops landing on his cap
  if (t > T_RAIN - .3) {
    for (let i = 0; i < 6; i++) {
      const per = .55, ph = (t - T_RAIN + .3 + hash2(i, 9) * per) % per / per;
      const dx = x - 70 + i * 28, dy = lerp(y + 40, 382, ph);
      g.beginPath(); g.moveTo(dx, dy - 16); g.quadraticCurveTo(dx + 8, dy + 2, dx, dy + 6); g.quadraticCurveTo(dx - 8, dy + 2, dx, dy - 16); fillInk(g, PAPER, 3.5);
      if (ph > .82) { g.beginPath(); g.moveTo(dx - 14, 386); g.lineTo(dx - 22, 376); g.moveTo(dx + 14, 386); g.lineTo(dx + 22, 376); ink(g, 3); }
    }
  }
  g.save(); g.translate(x, y); g.scale(s, s * (1 - .05 * PU));
  cloudShape(g, [[-70, 12, 44], [-28, -18, 54], [28, -22, 50], [74, 8, 42], [0, 18, 50]], L2, 6);
  g.beginPath(); g.moveTo(-90, 46); g.lineTo(96, 46); ink(g, 5);
  g.restore();
}
function drawStorm(g, t) {
  const e = stormEnv(t);
  if (e <= 0) return;
  // the whole sky: a cloud bank fills the ceiling, buckets tip, rain everywhere
  const by = lerp(-330, 70, ease.out(inv(T_DOWN - .25, T_DOWN, t))) - 400 * smooth(inv(89.3, 90.3, t));
  const wl = Math.min(waterLevel(t), 1080);
  g.save(); g.globalAlpha = clamp(e * 1.6);
  // rain streaks in one path
  g.beginPath();
  for (let i = 0; i < 230; i++) {
    const x0 = hash2(i, 1) * 2400 - 300, sp = 2300 + hash2(i, 2) * 900, ph = hash2(i, 3);
    const span = wl - by + 200, y = by + ((ph * span + (t - T_DOWN) * sp) % span), x = x0 + (y - by) * .12;
    g.moveTo(x, y); g.lineTo(x + 10, y + 70);
  }
  g.lineWidth = 4.5; g.strokeStyle = 'rgba(248,240,222,.85)'; g.stroke();
  const puffsArr = []; for (let i = 0; i < 18; i++) puffsArr.push([i * 130 - 170, by + 22 * Math.sin(i * 1.7) + 10 * sway(i * .7), 115 + 30 * hash2(i, 8)]);
  cloudShape(g, puffsArr, DK, 8);
  // buckets pouring out of the cloud bank
  for (const [bx, k] of [[330, 0], [1760, 1]]) {
    const tip = 1.9 + .25 * sway(k);
    g.save(); g.translate(bx, by + 150);
    g.beginPath(); g.moveTo(26, 20); g.bezierCurveTo(70 + 20 * sway(k + 1), 300, -40, 600, 30 + 40 * sway(k), wl - by - 150); g.lineWidth = 46; g.strokeStyle = INK; g.stroke(); g.lineWidth = 34; g.strokeStyle = L1; g.stroke();
    g.rotate(tip - Math.PI / 2);
    g.beginPath(); g.moveTo(-50, -60); g.lineTo(50, -60); g.lineTo(38, 50); g.lineTo(-38, 50); g.closePath(); fillInk(g, MIDT, 7);
    g.beginPath(); g.moveTo(-48, -40); g.lineTo(48, -40); g.moveTo(-42, 20); g.lineTo(42, 20); ink(g, 4);
    g.beginPath(); g.arc(0, -60, 54, Math.PI, 0); ink(g, 6);
    g.restore();
  }
  g.restore();
}
function drawWater(g, t) {
  const wl = waterLevel(t);
  if (wl > 1100) return;
  g.save();
  g.beginPath(); g.moveTo(-300, 1300); g.lineTo(-300, wl);
  for (let x = -300; x <= 2220; x += 40) g.lineTo(x, wl + 9 * Math.sin(x * .011 + t * 5) + 7 * sway(x * .004));
  g.lineTo(2220, 1300); g.closePath();
  g.fillStyle = 'rgba(120,106,84,.9)'; g.fill(); ink(g, 7);
  g.beginPath();
  for (let i = 0; i < 26; i++) { const x = ((hash2(i, 21) * 2400 + t * (40 + 60 * hash2(i, 22))) % 2400) - 300, y = wl + 40 + hash2(i, 23) * 400; g.moveTo(x, y); g.lineTo(x + 40 + 30 * hash2(i, 24), y); }
  g.lineWidth = 5; g.strokeStyle = 'rgba(243,233,211,.75)'; g.stroke();
  // rings around the customer
  for (let i = 0; i < 2; i++) { const q = ((t * .8 + i * .5) % 1); ell(g, CX, wl + 8, 150 + q * 160, 14 + q * 12); g.lineWidth = 4; g.strokeStyle = `rgba(243,233,211,${.7 * (1 - q)})`; g.stroke(); }
  g.restore();
}

// ---------- the LESS / MORE sign ----------
function drawSign(g, t) {
  const sp = signPose(t);
  if (!sp.on) return;
  const P = [sp.x, -80], Lc = sp.y - P[1];
  g.save(); g.translate(P[0], P[1]); g.rotate(sp.ang);
  // chains
  const w = 280, h = 120;
  for (const s of [-1, 1]) {
    const ax = s * 200 * sp.sc, ay = Lc - h * sp.sc, bx = s * 70, by = -20, n = Math.ceil(Math.hypot(ax - bx, ay - by) / 26);
    const ang = Math.atan2(ay - by, ax - bx);
    for (let i = 0; i <= n; i++) { const q = i / n; ell(g, lerp(bx, ax, q), lerp(by, ay, q), i % 2 ? 13 : 5, i % 2 ? 6 : 9, ang); ink(g, 4.5); }
  }
  g.translate(0, Lc); g.scale(sp.sc * (1 + .06 * PU), sp.sc * (1 - .07 * PU));
  const c = Math.cos(sp.flip), face = Math.floor((sp.flip + Math.PI / 2) / Math.PI) % 2;
  g.scale(Math.max(.02, Math.abs(c)), 1);
  for (const s of [-1, 1]) { ell(g, s * 200, -h - 2, 12, 12); fillInk(g, MIDT, 5); }
  g.beginPath(); g.roundRect(-w, -h, 2 * w, 2 * h, 22); fillInk(g, face ? DEEP : PAPER, 9);
  g.beginPath(); g.roundRect(-w + 20, -h + 20, 2 * w - 40, 2 * h - 40, 12); g.lineWidth = 5; g.strokeStyle = face ? PAPER : DEEP; g.stroke();
  const word = face ? 'MORE' : 'LESS';
  if (face) {
    // marquee bulbs chasing on the beat
    const pts = []; for (let i = 0; i < 9; i++) { const x = -224 + i * 56; pts.push([x, -h + 2], [x, h - 2]); } for (const y of [-40, 40]) pts.push([-w + 2, y], [w - 2, y]);
    pts.forEach(([x, y], i) => {
      const lit = (i + BI) % 2 === 0;
      if (lit) { ell(g, x, y, 24, 24); g.fillStyle = 'rgba(255,248,226,.35)'; g.fill(); }
      ell(g, x, y, 11, 11); fillInk(g, lit ? GLOVE : MIDT, 4);
    });
  }
  // text fitted with margin: 60 px each side, 50 px top and bottom (inside the bulbs)
  const ft = fitText(g, word, 2 * w - 120, 2 * h - 100, 170);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const ty = (ft.asc - ft.desc) / 2;
  if (face) { g.lineWidth = 10; g.strokeStyle = INK; g.strokeText(word, 0, ty); g.fillStyle = GLOVE; g.fillText(word, 0, ty); }
  else { g.fillStyle = DEEP; g.fillText(word, 0, ty); }
  g.restore();
}

// ---------- camera ----------
function camera(t) {
  const K = [
    [T0, [960, 540, 1]], [69.7, [960, 540, 1]], [70.4, [1140, 470, 1.3]], [72.5, [1140, 470, 1.3]], [73.2, [960, 540, 1]],
    [T_LITTLE + .1, [960, 540, 1]], [T_LITTLE + .6, [1180, 480, 1.4]], [77.5, [1180, 480, 1.4]], [77.85, [960, 540, 1]],
    [80.8, [960, 540, 1]], [81.6, [1360, 400, 1.5]], [T_DOWN - .05, [1360, 400, 1.5]], [T_DOWN + .35, [1140, 520, 1.12]],
    [89.4, [1140, 520, 1.12]], [90.2, [990, 520, 1]], [92.6, [990, 520, 1]], [93.5, [1130, 430, 1.18]], [T_MORE + .7, [1130, 430, 1.18]],
    [TEND - .05, [1010, 300, 1.85]],
  ];
  let [cx, cy, z] = kf(t, K);
  const sh = 16 * (hit(t, T_BOTTLE, 7) + hit(t, T_LOT, 7) + .6 * hit(t, T_DOWN, 4));
  cx += sh * Math.sin(t * 97); cy += sh * Math.cos(t * 83);
  cx = clamp(cx, 960 / z, 1920 - 960 / z); cy = clamp(cy, 540 / z, 1080 - 540 / z);
  return [cx, cy, z];
}

// ---------- film ----------
const TILES = [];
window.LOOK_READY = (async () => {
  try { await document.fonts.load(FONT(100), 'LESSMORX'); } catch (e) { }
  const r = rng(1930);
  for (let k = 0; k < 8; k++) {
    const c = document.createElement('canvas'); c.width = 960; c.height = 540;
    const x = c.getContext('2d'), im = x.createImageData(960, 540), d = im.data;
    for (let i = 0; i < d.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 150; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    x.putImageData(im, 0, 0); TILES.push(c);
  }
})();
function drawFilm(g, t) {
  // grain
  if (TILES.length) {
    g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .3;
    g.drawImage(TILES[Math.floor(hash(FI * 13 + 5) * TILES.length)], -hash2(FI, 1) * 160, -hash2(FI, 2) * 90, 2080, 1170);
    g.restore();
  }
  // flicker
  const f = (hash(FI * 3 + 1) - .5) * .07 + snoise(t * 5, 2) * .03;
  g.fillStyle = f > 0 ? `rgba(255,248,230,${f})` : `rgba(0,0,0,${-f})`; g.fillRect(0, 0, 1920, 1080);
  // scratches that linger a few frames, dust and hairs
  const sc = Math.floor(FI / 3);
  if (hash(sc * 5 + 2) < .6) {
    const x = hash(sc * 5 + 3) * 1920 + (hash(FI) - .5) * 6;
    g.beginPath(); g.moveTo(x, -10); g.quadraticCurveTo(x + 14 * snoise(sc, 3), 540, x + 6, 1090);
    g.lineWidth = 1.5 + hash(sc * 5 + 4) * 2; g.strokeStyle = hash(sc * 7) < .5 ? 'rgba(255,248,230,.45)' : 'rgba(10,6,2,.35)'; g.stroke();
  }
  const nd = Math.floor(hash(FI * 7 + 9) * 5);
  for (let i = 0; i < nd; i++) {
    const x = hash2(FI, i * 3 + 10) * 1920, y = hash2(FI, i * 3 + 11) * 1080, s = 2 + hash2(FI, i * 3 + 12) * 5;
    if (i === 0 && hash(FI * 11) < .3) { g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 30, y - 20, x + 10, y + 40, x + 50, y + 30); g.lineWidth = 2; g.strokeStyle = 'rgba(10,6,2,.6)'; g.stroke(); }
    else { ell(g, x, y, s, s * .8); g.fillStyle = 'rgba(10,6,2,.7)'; g.fill(); }
  }
  // vignette and a rounded film gate
  const vg = g.createRadialGradient(960, 540, 420, 960, 540, 1180);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(12,7,2,.72)');
  g.fillStyle = vg; g.fillRect(0, 0, 1920, 1080);
  g.beginPath(); g.rect(-20, -20, 1960, 1120); g.roundRect(14, 10, 1892, 1060, 70); g.fillStyle = '#0b0805'; g.fill('evenodd');
}

// ---------- frame ----------
function drawFrame(g, t) {
  FI = Math.round(t * SNAP); BI = beatIndex(t); BP = beatPhase(t); PU = beatPulse(t, 7);
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.fillStyle = '#0b0805'; g.fillRect(0, 0, 1920, 1080);
  g.save();
  // gate weave
  g.translate(snoise(t * 1.3, 3) * 3 + (hash2(FI, 31) - .5) * 2.4, snoise(t * 1.1, 4) * 3.5 + (hash2(FI, 32) - .5) * 3);
  const [cx, cy, z] = camera(t);
  g.translate(960, 540); g.scale(z, z); g.translate(-cx, -cy);
  drawWall(g, t);
  drawWaiter(g, t);
  drawCounter(g);
  drawPlate(g, t);
  drawMountain(g, t);
  drawShot(g, t);
  drawBottle(g, t);
  stool(g, 760, 1, 1.5); stool(g, 1040, 2, 1.5);
  drawCustomer(g, t);
  drawWater(g, t);
  const e = stormEnv(t);
  if (e > 0) { g.fillStyle = `rgba(20,12,4,${.32 * e})`; g.fillRect(-300, -300, 2520, 1700); }
  drawSmallCloud(g, t);
  drawStorm(g, t);
  drawSign(g, t);
  g.restore();
  // iris in at the top of the section
  const ir = inv(T0, T0 + .3, t);
  if (ir < 1) { g.beginPath(); g.rect(-20, -20, 1960, 1120); g.arc(1300, 470, lerp(420, 1500, ease.in(ir)), 0, TAU); g.fillStyle = '#0b0805'; g.fill('evenodd'); }
  drawFilm(g, t);
}
