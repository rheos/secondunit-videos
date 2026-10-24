// The living room, seen front-on: wood-panelled wall, shag carpet, a floor lamp, a rubber plant, and the
// walnut console TV (screen left, brushed-metal knob panel and a fabric speaker grille right, tapered legs,
// rabbit ears). Prebaked once in world units with the screen cut out; the camera crops and scales it.
// The king (seen from behind in his wingback, crown catching the TV light) and his sack are a foreground
// layer with its own parallax.
const SCR = { x: 300, y: 140, w: 840, h: 630, r: 46 };
const ROOM = { RS: 1.4, X0: -420, Y0: -120, WW: 2440, WH: 1340 };
function screenPath(g, x, y, w, h, r, keep) { if (!keep) g.beginPath(); g.moveTo(x + r, y); g.quadraticCurveTo(x + w / 2, y - h * .012, x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.quadraticCurveTo(x + w + w * .008, y + h / 2, x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.quadraticCurveTo(x + w / 2, y + h + h * .012, x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.quadraticCurveTo(x - w * .008, y + h / 2, x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); }
function woodGrain(g, x, y, w, h, base, seed, horiz) {
  const R = mulberry(seed);
  g.fillStyle = base; g.fillRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let i = 0; i < (horiz ? h / 2.2 : w / 2.2); i++) {
    g.strokeStyle = R() < .5 ? 'rgba(30,14,4,.22)' : 'rgba(255,200,140,.07)'; g.lineWidth = .6 + R() * 1.6;
    g.beginPath();
    if (horiz) { const yy = y + R() * h, ph = R() * 10; g.moveTo(x, yy); for (let xx = x; xx <= x + w; xx += 30) g.lineTo(xx, yy + Math.sin(xx / 90 + ph) * 3 + Math.sin(xx / 23 + ph) * 1.2); }
    else { const xx = x + R() * w, ph = R() * 10; g.moveTo(xx, y); for (let yy = y; yy <= y + h; yy += 30) g.lineTo(xx + Math.sin(yy / 110 + ph) * 3 + Math.sin(yy / 31 + ph) * 1.4, yy); }
    g.stroke();
  }
  g.restore();
}
function initRoom() {
  const RS = ROOM.RS, c = mkCanvas(Math.ceil(ROOM.WW * RS), Math.ceil(ROOM.WH * RS)), g = c.getContext('2d');
  g.setTransform(RS, 0, 0, RS, -ROOM.X0 * RS, -ROOM.Y0 * RS);
  const R = mulberry(9001);
  // wall: walnut panelling, grooved boards
  for (let x = ROOM.X0; x < ROOM.X0 + ROOM.WW; x += 72) {
    const v = R(); woodGrain(g, x, ROOM.Y0, 72, 1060, `rgb(${92 + v * 22 | 0},${58 + v * 14 | 0},${34 + v * 8 | 0})`, 100 + x, false);
    g.fillStyle = 'rgba(15,6,2,.85)'; g.fillRect(x, ROOM.Y0, 3, 1060); g.fillStyle = 'rgba(255,190,120,.12)'; g.fillRect(x + 3, ROOM.Y0, 2, 1060);
  }
  // baseboard and shag carpet
  woodGrain(g, ROOM.X0, 900, ROOM.WW, 34, '#4a2c18', 77, true);
  g.fillStyle = '#7a4a1c'; g.fillRect(ROOM.X0, 932, ROOM.WW, 300);
  for (let i = 0; i < 26000; i++) { const x = ROOM.X0 + R() * ROOM.WW, y = 932 + R() * 300, l = 4 + R() * 8; g.strokeStyle = R() < .5 ? 'rgba(200,130,50,.5)' : 'rgba(50,25,8,.5)'; g.lineWidth = 1.4 + R() * 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 6, y - l); g.stroke(); }
  // floor lamp with a glowing shade, its light pooling on the panelling
  let rg = g.createRadialGradient(-150, 150, 20, -150, 220, 640); rg.addColorStop(0, 'rgba(255,190,110,.42)'); rg.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = rg; g.fillRect(ROOM.X0, ROOM.Y0, 1200, 1300);
  g.strokeStyle = '#2a2420'; g.lineWidth = 9; g.beginPath(); g.moveTo(-150, 230); g.lineTo(-150, 990); g.stroke();
  g.fillStyle = '#2a2420'; g.beginPath(); g.ellipse(-150, 992, 70, 14, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-230, 60); g.lineTo(-70, 60); g.lineTo(-20, 232); g.lineTo(-280, 232); g.closePath();
  let lg = g.createLinearGradient(-280, 0, -20, 0); lg.addColorStop(0, '#f6c98a'); lg.addColorStop(.5, '#ffe7bf'); lg.addColorStop(1, '#e8a860'); g.fillStyle = lg; g.fill();
  g.strokeStyle = 'rgba(120,70,20,.5)'; g.lineWidth = 3; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(-230 + k * 20, 60); g.lineTo(-280 + k * 32.5, 232); g.stroke(); }
  // rubber plant in a terracotta pot
  for (let k = 0; k < 11; k++) {
    const a = -Math.PI / 2 + (R() - .5) * 2.2, len = 140 + R() * 220, bx = 1820, by = 820;
    const ex = bx + Math.cos(a) * len * .5, ey = by + Math.sin(a) * len;
    g.strokeStyle = '#3e5a26'; g.lineWidth = 6; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx, ey + 60, ex, ey); g.stroke();
    g.save(); g.translate(ex, ey); g.rotate(a + Math.PI / 2 + (R() - .5)); g.fillStyle = R() < .5 ? '#2f5a2a' : '#3f7034'; g.beginPath(); g.ellipse(0, -40, 26, 52, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(150,200,120,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 10); g.lineTo(0, -88); g.stroke(); g.restore();
  }
  g.fillStyle = '#b4552c'; g.beginPath(); g.moveTo(1730, 810); g.lineTo(1910, 810); g.lineTo(1880, 950); g.lineTo(1760, 950); g.closePath(); g.fill();
  g.fillStyle = '#c86a3a'; g.fillRect(1722, 800, 196, 26);
  // ---- the console TV ----
  // rabbit ears
  g.strokeStyle = '#c8ccd0'; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(1080, 52); g.lineTo(860, -110); g.moveTo(1080, 52); g.lineTo(1330, -118); g.stroke();
  g.fillStyle = '#d8dce0'; for (const [x, y] of [[860, -110], [1330, -118]]) { g.beginPath(); g.arc(x, y, 7, 0, TAU); g.fill(); }
  g.fillStyle = '#2a2420'; g.beginPath(); g.ellipse(1080, 60, 48, 22, 0, Math.PI, TAU); g.fill();
  // cabinet
  woodGrain(g, 200, 90, 1320, 780, '#6b3f22', 501, true);
  woodGrain(g, 186, 62, 1348, 32, '#7d4b2a', 502, true);
  g.fillStyle = 'rgba(255,210,160,.25)'; g.fillRect(186, 62, 1348, 4); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(186, 92, 1348, 6);
  // screen surround: dark moulded plastic with a chrome trim
  g.fillStyle = '#211812'; g.beginPath(); g.roundRect(262, 106, 916, 702, 44); g.fill();
  let bg = g.createLinearGradient(262, 106, 262, 808); bg.addColorStop(0, 'rgba(255,255,255,.10)'); bg.addColorStop(.5, 'rgba(255,255,255,0)'); bg.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = bg; g.fill();
  g.strokeStyle = '#b9b2a6'; g.lineWidth = 4; screenPath(g, SCR.x - 8, SCR.y - 8, SCR.w + 16, SCR.h + 16, SCR.r + 6); g.stroke();
  g.strokeStyle = '#0c0806'; g.lineWidth = 8; screenPath(g, SCR.x - 2, SCR.y - 2, SCR.w + 4, SCR.h + 4, SCR.r + 2); g.stroke();
  // knob panel
  const px = 1206, pw = 286;
  let pg2 = g.createLinearGradient(px, 0, px + pw, 0); pg2.addColorStop(0, '#b6b0a2'); pg2.addColorStop(.5, '#d8d2c4'); pg2.addColorStop(1, '#a29c8e'); g.fillStyle = pg2;
  g.beginPath(); g.roundRect(px, 110, pw, 360, 16); g.fill();
  g.strokeStyle = 'rgba(80,70,60,.25)'; g.lineWidth = 1; for (let y = 116; y < 466; y += 3) { g.beginPath(); g.moveTo(px + 4, y); g.lineTo(px + pw - 4, y); g.stroke(); }
  g.strokeStyle = '#3a2a1e'; g.lineWidth = 4; g.beginPath(); g.roundRect(px, 110, pw, 360, 16); g.stroke();
  for (const [kx, ky, kr] of [[px + 143, 210, 64], [px + 143, 372, 52]]) {
    for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; g.fillStyle = '#3a3028'; g.beginPath(); g.arc(kx + Math.cos(a) * (kr + 14), ky + Math.sin(a) * (kr + 14), k % 2 ? 2 : 3.4, 0, TAU); g.fill(); }
    const kg = g.createRadialGradient(kx - kr * .3, ky - kr * .3, 4, kx, ky, kr); kg.addColorStop(0, '#6a4a32'); kg.addColorStop(1, '#2a1a10'); g.fillStyle = kg; g.beginPath(); g.arc(kx, ky, kr, 0, TAU); g.fill();
    g.strokeStyle = '#c9c2b4'; g.lineWidth = 5; g.beginPath(); g.arc(kx, ky, kr - 3, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; for (let k = 0; k < 36; k++) { const a = k / 36 * TAU; g.beginPath(); g.moveTo(kx + Math.cos(a) * (kr - 10), ky + Math.sin(a) * (kr - 10)); g.lineTo(kx + Math.cos(a) * (kr - 4), ky + Math.sin(a) * (kr - 4)); g.stroke(); }
    g.fillStyle = '#e8e2d4'; g.beginPath(); g.roundRect(kx - 6, ky - kr + 10, 12, kr * .7, 5); g.fill();
  }
  for (const [sx, sy] of [[px + 52, 445], [px + 234, 445]]) { g.fillStyle = '#2a1a10'; g.beginPath(); g.arc(sx, sy, 15, 0, TAU); g.fill(); g.strokeStyle = '#c9c2b4'; g.lineWidth = 3; g.stroke(); }
  g.fillStyle = '#ffb347'; g.beginPath(); g.arc(px + 143, 445, 7, 0, TAU); g.fill();
  // speaker grille: gold-brown weave behind wooden slats
  g.fillStyle = '#8a6a3a'; g.fillRect(px, 492, pw, 312);
  for (let y = 492; y < 804; y += 4) { g.fillStyle = y % 8 ? 'rgba(60,40,16,.35)' : 'rgba(220,180,110,.18)'; g.fillRect(px, y, pw, 2); }
  for (let x = px; x < px + pw; x += 4) { g.fillStyle = 'rgba(40,24,8,.18)'; g.fillRect(x, 492, 1.5, 312); }
  for (let k = 0; k < 7; k++) { const sx = px + 14 + k * 43; woodGrain(g, sx, 488, 16, 320, '#5e3a20', 600 + k, false); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(sx + 16, 488, 5, 320); }
  g.strokeStyle = '#2a1a10'; g.lineWidth = 5; g.strokeRect(px, 488, pw, 320);
  // base rail, brass strip, tapered legs
  g.fillStyle = '#c9a24a'; g.fillRect(200, 846, 1320, 6);
  for (const lx of [270, 560, 1170, 1450]) {
    g.fillStyle = '#4a2a16'; g.beginPath(); g.moveTo(lx - 22, 870); g.lineTo(lx + 22, 870); g.lineTo(lx + 9, 928); g.lineTo(lx - 9, 928); g.closePath(); g.fill();
    g.fillStyle = '#c9a24a'; g.fillRect(lx - 9, 920, 18, 10);
  }
  g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(860, 936, 760, 18, 0, 0, TAU); g.fill();
  // evening: the room falls off into the dark away from the lamp
  g.setTransform(1, 0, 0, 1, 0, 0);
  const dk = g.createRadialGradient((-150 - ROOM.X0) * RS, (300 - ROOM.Y0) * RS, 200 * RS, (700 - ROOM.X0) * RS, (500 - ROOM.Y0) * RS, 1500 * RS);
  dk.addColorStop(0, 'rgba(0,0,0,0)'); dk.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = dk; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 0, c.width, c.height);
  // cut the screen out
  g.setTransform(RS, 0, 0, RS, -ROOM.X0 * RS, -ROOM.Y0 * RS);
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; screenPath(g, SCR.x, SCR.y, SCR.w, SCR.h, SCR.r); g.fill();
  g.globalCompositeOperation = 'source-over'; g.setTransform(1, 0, 0, 1, 0, 0);
  ROOM.layer = c;
  // grille coins: deterministic emission list (a trickle on "Brought back", a flood by "30")
  ROOM.coins = []; const RC = mulberry(3030);
  for (let t = B.brought; t < T1 + .1;) {
    const rate = t < B.thirty ? lerp(5, 34, (t - B.brought) / (B.thirty - B.brought)) : (t >= B.quick ? 60 : 42);
    ROOM.coins.push({ t, x: 1220 + RC() * 258, y: 510 + RC() * 280, vx: (RC() - .5) * 160 - 30, vy: -60 - RC() * 140, sp: 6 + RC() * 10, ph: RC() * 6 });
    t += 1 / rate;
  }
  // coins the king spends: they hop out of the sack and fly into the set
  ROOM.spent = []; const RK = mulberry(4040);
  for (let t = B.coinsIn, k = 0; t < B.trick - .3; t += .14, k++) ROOM.spent.push({ t, hx: 330 + RK() * 300, hy: 300 + RK() * 160, ph: RK() * 6, dx: (RK() - .5) * 30 });
}
// world -> frame
function toFrame(cam, x, y) { return [(x - cam.x) * cam.z + 960, (y - cam.y) * cam.z + 540]; }
// signal (960x720) -> world, ignoring the tube's slight barrel
function sigToWorld(sx, sy) { const cx = (sx / 960 - .5) / .94, cy = (sy / 720 - .5) / .94; return [SCR.x + (cx + .5) * SCR.w, SCR.y + (cy + .5) * SCR.h]; }
function drawRoomLayer(g, cam) {
  const RS = ROOM.RS, w = 1920 / cam.z, h = 1080 / cam.z, wx = cam.x - w / 2, wy = cam.y - h / 2;
  g.drawImage(ROOM.layer, (wx - ROOM.X0) * RS, (wy - ROOM.Y0) * RS, w * RS, h * RS, 0, 0, 1920, 1080);
}
// TV light thrown into the room (outside the screen only)
function drawGlow(g, cam, glow, amt) {
  if (amt <= 0.001) return;
  const [cx, cy] = toFrame(cam, SCR.x + SCR.w / 2, SCR.y + SCR.h / 2), r = SCR.w * cam.z * 1.1;
  g.save();
  g.beginPath(); g.rect(0, 0, 1920, 1080); const [sx, sy] = toFrame(cam, SCR.x, SCR.y); screenPath(g, sx, sy, SCR.w * cam.z, SCR.h * cam.z, SCR.r * cam.z, true); g.clip('evenodd');
  g.globalCompositeOperation = 'screen';
  const rg = g.createRadialGradient(cx, cy, r * .45, cx, cy + r * .3, r * 1.4);
  rg.addColorStop(0, rgb(glow, .1 * amt)); rg.addColorStop(1, rgb(glow, 0));
  g.fillStyle = rg; g.fillRect(0, 0, 1920, 1080);
  g.restore();
}
// curved glass over the tube: an inner edge shadow and a soft window reflection
function drawGlass(g, cam) {
  const [sx, sy] = toFrame(cam, SCR.x, SCR.y), sw = SCR.w * cam.z, sh = SCR.h * cam.z;
  g.save(); screenPath(g, sx, sy, sw, sh, SCR.r * cam.z); g.clip();
  const e = g.createRadialGradient(sx + sw / 2, sy + sh / 2, sh * .42, sx + sw / 2, sy + sh / 2, sh * .78);
  e.addColorStop(0, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,.42)'); g.fillStyle = e; g.fillRect(sx, sy, sw, sh);
  g.globalCompositeOperation = 'screen';
  const r = g.createLinearGradient(sx, sy, sx + sw * .5, sy + sh * .5);
  r.addColorStop(0, 'rgba(255,240,220,.10)'); r.addColorStop(.35, 'rgba(255,240,220,.03)'); r.addColorStop(.36, 'rgba(255,240,220,0)'); r.addColorStop(1, 'rgba(255,240,220,0)');
  g.fillStyle = r; g.fillRect(sx, sy, sw, sh);
  g.fillStyle = 'rgba(255,230,200,.05)'; g.beginPath(); g.ellipse(sx + sw * .2, sy + sh * .14, sw * .16, sh * .05, -.35, 0, TAU); g.fill();
  g.restore();
}
function coin(g, x, y, r, spin, glow) {
  const w = Math.max(.12, Math.abs(Math.cos(spin)));
  g.fillStyle = '#7a5410'; g.beginPath(); g.ellipse(x, y, r * w + 1.5, r + 1.5, 0, 0, TAU); g.fill();
  g.fillStyle = Math.cos(spin) > 0 ? '#f2c444' : '#d9a52c'; g.beginPath(); g.ellipse(x, y, r * w, r, 0, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,250,210,.8)'; g.beginPath(); g.ellipse(x - r * w * .3, y - r * .35, r * w * .3, r * .22, 0, 0, TAU); g.fill();
  if (glow) { g.fillStyle = rgb(glow, .25); g.beginPath(); g.ellipse(x, y, r * w, r, 0, 0, TAU); g.fill(); }
}
// coins pouring out of the speaker grille (world plane of the TV), and the pile they make
function drawGrilleCoins(g, cam, t) {
  if (t < B.brought) return;
  let n = 0;
  for (const c of ROOM.coins) {
    if (c.t > t) break; n++;
    const u = t - c.t, x = c.x + c.vx * u, y = c.y + c.vy * u + 900 * u * u;
    if (y > 1000) continue;
    const s = 1 + u * .35, [fx, fy] = toFrame(cam, x, y);
    coin(g, fx, fy, 11 * cam.z * s, c.ph + c.sp * u);
  }
  // the pile in front of the cabinet grows with every coin
  const hgt = Math.min(240, Math.sqrt(n) * 17), base = 950;
  if (hgt > 2) {
    const R = mulberry(77), [mx, my] = toFrame(cam, 1340, base), wpx = (180 + hgt * 1.3) * cam.z, hpx = hgt * cam.z;
    g.fillStyle = '#9a6c18'; g.beginPath(); g.moveTo(mx - wpx, my); g.quadraticCurveTo(mx - wpx * .3, my - hpx * 1.1, mx, my - hpx); g.quadraticCurveTo(mx + wpx * .3, my - hpx * 1.1, mx + wpx, my); g.closePath(); g.fill();
    const m = Math.min(260, n * 2);
    for (let k = 0; k < m; k++) {
      const a = R(), b = R(), x = mx + (a * 2 - 1) * wpx * (1 - b * .55), y = my - hpx * (1 - Math.abs(a * 2 - 1) ** 1.6) * b;
      coin(g, x, y, 10 * cam.z, R() * 6);
    }
  }
}
// foreground parallax: the chair is about half as far from the camera as the TV
function fgXf(cam) {
  const q = cam.z / 1.36, d = 1 - 1 / q, den = .55 - d; if (den < .06) return null;
  const qf = .55 / den;
  return { qf, ox: -(cam.x - 860) * cam.z * 1.8, oy: -(cam.y - 515) * cam.z * 1.8 + Math.max(0, qf - 1) * 900 };
}
function fgPt(xf, x, y) { return [960 + (x - 960) * xf.qf + xf.ox, 540 + (y - 540) * xf.qf + xf.oy]; }
function drawKing(g, cam, t, glow, lit) {
  const xf = fgXf(cam); if (!xf) return;
  // on the pull-back he rises into frame only once the sing-along band has left the screen (never over its words)
  const late = t > B.pullBack - .1 ? 520 * (1 - smooth(clamp((t - (B.bandOut - .1)) / .55))) : 0;
  const [hx, hy0] = fgPt(xf, 330, 930), hy = hy0 + late; if (hy > 1300) return;
  g.save(); g.translate(hx, hy); g.scale(xf.qf, xf.qf);
  const rim = rgb(mix(glow, [255, 255, 255], .2), .55 * lit + .08);
  // wingback chair, plum velvet with piping and button tufting
  g.fillStyle = '#2a1424'; g.beginPath(); g.moveTo(-250, 300); g.lineTo(-250, 40); g.quadraticCurveTo(-250, -16, -190, -20); g.quadraticCurveTo(-120, -2, -110, 10); g.quadraticCurveTo(0, -12, 110, 10); g.quadraticCurveTo(120, -2, 190, -20); g.quadraticCurveTo(250, -16, 250, 40); g.lineTo(250, 300); g.closePath(); g.fill();
  g.strokeStyle = rim; g.lineWidth = 4; g.stroke();
  g.fillStyle = 'rgba(0,0,0,.4)'; for (const [bx, by] of [[-60, 70], [60, 70], [0, 120], [-120, 130], [120, 130]]) { g.beginPath(); g.arc(bx, by, 6, 0, TAU); g.fill(); }
  // ermine collar peeking over the chair back
  g.fillStyle = '#d8d2c8'; g.beginPath(); g.ellipse(0, 6, 92, 22, 0, Math.PI, TAU); g.fill();
  g.fillStyle = '#1a1214'; for (const bx of [-60, -20, 24, 64]) { g.beginPath(); g.moveTo(bx, -8); g.lineTo(bx - 4, 4); g.lineTo(bx + 4, 4); g.closePath(); g.fill(); }
  g.fillStyle = rgb(glow, .15 * lit); g.beginPath(); g.ellipse(0, 6, 92, 22, 0, Math.PI, TAU); g.fill();
  // the back of his head, grey curls
  g.fillStyle = '#17121a'; g.beginPath(); g.ellipse(0, -52, 58, 64, 0, 0, TAU); g.fill();
  g.fillStyle = '#3a3438'; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(-44 + k * 11, -10 + Math.sin(k) * 4, 9, 0, TAU); g.fill(); }
  g.strokeStyle = rim; g.lineWidth = 4; g.beginPath(); g.ellipse(0, -52, 58, 64, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  // ears catching the light
  for (const sd of [-1, 1]) { g.fillStyle = '#2a1e22'; g.beginPath(); g.ellipse(sd * 58, -46, 9, 16, 0, 0, TAU); g.fill(); g.strokeStyle = rim; g.lineWidth = 3; g.stroke(); }
  // the crown: points lit by the screen, a glint on "king"
  g.beginPath(); g.moveTo(-50, -96);
  for (let i = 0; i <= 8; i++) g.lineTo(-50 + i * 12.5, -96 - (i % 2 ? 18 : 52));
  g.lineTo(50, -96); g.closePath();
  const cg = g.createLinearGradient(0, -150, 0, -90); cg.addColorStop(0, rgb(mix([240, 196, 70], glow, .35))); cg.addColorStop(1, '#6a4a10');
  g.fillStyle = cg; g.fill(); g.strokeStyle = rim; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#4a2a0a'; g.fillRect(-52, -104, 104, 14);
  for (const [jx, col] of [[-30, '#3a8ad9'], [0, '#c0284a'], [30, '#2aa060']]) { g.fillStyle = col; g.beginPath(); g.arc(jx, -97, 5, 0, TAU); g.fill(); }
  const gl = t >= B.king ? Math.exp(-(t - B.king) * 3) : 0;
  if (gl > .02) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,240,190,${gl})`; star(g, 26, -146, 36 * gl + 8, 4, 4); g.fill(); g.restore(); }
  // his sack of gold beside the chair
  g.translate(310, 90);
  g.fillStyle = '#8a6a3c'; g.beginPath(); g.moveTo(-60, 120); g.quadraticCurveTo(-80, 20, -36, -20); g.lineTo(36, -20); g.quadraticCurveTo(80, 20, 60, 120); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(40,25,10,.6)'; g.lineWidth = 2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 18, -16); g.quadraticCurveTo(k * 24, 50, k * 20, 118); g.stroke(); }
  g.fillStyle = '#5a3e1e'; g.beginPath(); g.ellipse(0, -22, 40, 12, 0, 0, TAU); g.fill();
  const shine = t >= B.gold ? .4 + .6 * Math.exp(-(t - B.gold) * 2) : .25;
  for (let k = 0; k < 6; k++) coin(g, -26 + k * 10, -24 + (k % 2) * 4, 8, k, null);
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,220,120,${.35 * shine})`; g.beginPath(); g.ellipse(0, -26, 44, 16, 0, 0, TAU); g.fill(); g.restore();
  g.strokeStyle = rim; g.lineWidth = 3; g.beginPath(); g.moveTo(-36, -20); g.quadraticCurveTo(-80, 20, -60, 120); g.stroke();
  g.restore();
}
// the gold the king spends: coins hop out of the sack and fly into the screen (getting smaller as they go)
function spentCoins(g, cam, t) {
  const xf = fgXf(cam), hits = [];
  if (!xf) return hits;
  for (const c of ROOM.spent) {
    const u = (t - c.t) / .42;
    if (u >= 1) hits.push({ t: c.t + .42, x: c.hx, y: c.hy });
    if (u < 0 || u >= 1) continue;
    const [sx, sy] = fgPt(xf, 640 + c.dx, 995), [wx, wy] = sigToWorld(c.hx, c.hy), [ex, ey] = toFrame(cam, wx, wy);
    const cx = (sx + ex) / 2, cy = Math.min(sy, ey) - 140;
    const x = (1 - u) ** 2 * sx + 2 * u * (1 - u) * cx + u * u * ex, y = (1 - u) ** 2 * sy + 2 * u * (1 - u) * cy + u * u * ey;
    coin(g, x, y, 15 * xf.qf * lerp(1, .32, u), c.ph + u * 14);
  }
  return hits;
}
