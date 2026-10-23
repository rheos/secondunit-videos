// Engraved figures for the medical-chart look. Each draws in its own local coords (caller translates/scales).

// ---------- heart (valentine silhouette with coronary vessels; reads instantly at any size) ----------
const HEART = (() => {
  const p = new Path2D();
  p.moveTo(0, 92); p.bezierCurveTo(-62, 52, -112, 2, -96, -46); p.bezierCurveTo(-82, -96, -22, -98, 0, -56);
  p.bezierCurveTo(22, -98, 86, -96, 98, -44); p.bezierCurveTo(108, 4, 62, 52, 0, 92); p.closePath(); return p;
})();
function drawHeart(g, o = {}) {
  plateShape(g, HEART, { fill: C.red, hatch: [[.7, 7, 1, .35], [-.5, 9, 1, .18]], box: [-110, -100, 220, 200], lw: o.lw || 2.4,
    shade: (q) => { const gr = q.createRadialGradient(-35, -45, 5, -20, -20, 110); gr.addColorStop(0, 'rgba(255,200,180,.45)'); gr.addColorStop(1, 'rgba(60,10,10,.25)'); q.fillStyle = gr; q.fillRect(-110, -100, 220, 200); } });
  if (o.vessels !== false) {
    g.save(); g.clip(HEART); g.lineCap = 'round';
    g.strokeStyle = rgb(C.blue, .85); g.lineWidth = 3.2; g.beginPath(); g.moveTo(-8, -60); g.bezierCurveTo(-20, -10, 0, 30, -6, 80); g.moveTo(-10, -10); g.lineTo(-45, 15); g.moveTo(-4, 30); g.lineTo(28, 48); g.stroke();
    g.strokeStyle = rgb([230, 120, 100], .8); g.lineWidth = 2.4; g.beginPath(); g.moveTo(20, -66); g.bezierCurveTo(40, -20, 30, 20, 50, 40); g.moveTo(32, -20); g.lineTo(70, -10); g.stroke();
    g.restore();
  }
}

// ---------- the woman (stand-in figure, anatomical "window" plate: gown, chest cut away to show ribs + heart) ----------
const WOMAN = (() => {
  const P = {};
  const gown = new Path2D();
  gown.moveTo(-92, -246); gown.lineTo(-60, -212); gown.quadraticCurveTo(0, -192, 60, -212); gown.lineTo(92, -246);
  gown.bezierCurveTo(80, -170, 66, -120, 62, -60); gown.bezierCurveTo(60, -20, 70, 20, 82, 60);
  gown.bezierCurveTo(110, 170, 138, 300, 152, 402); gown.bezierCurveTo(60, 418, -60, 418, -152, 402);
  gown.bezierCurveTo(-138, 300, -110, 170, -82, 60); gown.bezierCurveTo(-70, 20, -60, -20, -62, -60);
  gown.bezierCurveTo(-66, -120, -80, -170, -92, -246); gown.closePath(); P.gown = gown;
  const neck = new Path2D();
  neck.moveTo(-96, -244); neck.quadraticCurveTo(-42, -262, -18, -284); neck.lineTo(-17, -306); neck.lineTo(17, -306); neck.lineTo(18, -284);
  neck.quadraticCurveTo(42, -262, 96, -244); neck.lineTo(60, -205); neck.quadraticCurveTo(0, -185, -60, -205); neck.closePath(); P.neck = neck;
  const arm = (s) => { const a = new Path2D(); a.moveTo(s * 90, -246); a.bezierCurveTo(s * 116, -238, s * 124, -170, s * 122, -100); a.bezierCurveTo(s * 121, -30, s * 120, 20, s * 118, 58);
    a.lineTo(s * 98, 58); a.bezierCurveTo(s * 99, 10, s * 98, -60, s * 92, -110); a.bezierCurveTo(s * 88, -150, s * 84, -190, s * 76, -224); a.closePath(); return a; };
  P.armL = arm(-1); P.armR = arm(1);
  const win = new Path2D();
  win.moveTo(-50, -200); win.lineTo(-30, -206); win.lineTo(-12, -199); win.lineTo(8, -207); win.lineTo(30, -199); win.lineTo(52, -204);
  win.bezierCurveTo(56, -160, 50, -120, 34, -92); win.lineTo(20, -84); win.lineTo(6, -76); win.lineTo(-10, -82); win.lineTo(-30, -92);
  win.bezierCurveTo(-48, -120, -56, -160, -50, -200); win.closePath(); P.win = win;
  const hair = new Path2D();
  hair.ellipse(0, -352, 41, 50, 0, Math.PI * 1.02, Math.PI * 1.98); hair.lineTo(40, -330); hair.quadraticCurveTo(30, -372, 0, -380); hair.quadraticCurveTo(-30, -372, -40, -330); hair.closePath();
  P.hair = hair;
  const bun = new Path2D(); bun.ellipse(0, -404, 30, 22, 0, 0, TAU); P.bun = bun;
  const head = new Path2D(); head.ellipse(0, -342, 37, 49, 0, 0, TAU); P.head = head;
  return P;
})();
function drawWoman(g, t, o = {}) {
  const P = WOMAN;
  // feet
  g.fillStyle = rgb(C.ink, .9); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 36, 414, 24, 9, 0, 0, TAU); g.fill(); }
  // arms (still, at her sides)
  for (const a of [P.armL, P.armR]) plateShape(g, a, { fill: C.flesh, hatch: [.9, 6, 1, .3], box: [-140, -250, 280, 320], lw: 1.8 });
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 109, 70, 13, 17, 0, 0, TAU); g.fillStyle = rgb(C.flesh); g.fill(); g.strokeStyle = rgb(C.ink); g.lineWidth = 1.6; g.stroke(); }
  plateShape(g, P.neck, { fill: C.flesh, lw: 1.8, shade: (q) => sideHatch(q, P.neck, -20, -310, 40, 40, .2, 4, .9, .35) });
  // gown: pale litho tint, long fold lines, hatched shadow side
  plateShape(g, P.gown, { fill: C.gown, lw: 2.2, shade: (q) => {
    hatchFill(q, 30, -250, 140, 670, 1.45, 5, 1, .4);
    q.strokeStyle = rgb(C.ink, .45); q.lineWidth = 1.3; q.beginPath();
    for (let k = -3; k <= 3; k++) { q.moveTo(k * 16, -60); q.bezierCurveTo(k * 18, 80, k * 30, 250, k * 40 + 4 * Math.sign(k), 405); }
    q.stroke();
  } });
  // chest window: flesh, ribs, sternum, heart
  const beat = o.beat || 0;
  plateShape(g, P.win, { fill: C.flesh2, lw: 2, shade: (q) => {
    q.strokeStyle = rgb(C.bone); q.lineCap = 'round';
    for (let k = 0; k < 5; k++) { const y = -188 + k * 24; q.lineWidth = 8; q.beginPath(); q.moveTo(-60, y + 4); q.quadraticCurveTo(-30, y + 16, -6, y + 2); q.moveTo(6, y + 2); q.quadraticCurveTo(30, y + 16, 60, y + 4); q.stroke(); }
    q.fillStyle = rgb(C.bone); q.fillRect(-7, -206, 14, 120);
    q.save(); q.translate(14, -136); const sc = .3 * (1 + beat * .07); q.scale(sc, sc); drawHeart(q, { lw: 6 }); q.restore();
  } });
  // head
  plateShape(g, P.head, { fill: C.flesh, lw: 2, shade: (q) => sideHatch(q, P.head, 12, -400, 40, 110, .3, 4.5, .9, .4) });
  g.strokeStyle = rgb(C.ink, .9); g.lineWidth = 1.7; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-22, -350); g.quadraticCurveTo(-15, -354, -8, -350); g.moveTo(8, -350); g.quadraticCurveTo(15, -354, 22, -350); // lids, lowered
  g.moveTo(-24, -362); g.quadraticCurveTo(-15, -367, -6, -363); g.moveTo(6, -363); g.quadraticCurveTo(15, -367, 24, -362);
  g.moveTo(0, -348); g.lineTo(-3, -330); g.lineTo(3, -328); g.stroke();
  g.beginPath(); g.moveTo(-10, -313); g.quadraticCurveTo(0, -310, 10, -313); g.strokeStyle = rgb(C.red, .9); g.lineWidth = 2.2; g.stroke();
  plateShape(g, P.hair, { fill: C.hair, hatch: [[.6, 3.5, 1, .5]], box: [-50, -410, 100, 90], lw: 1.8 });
  plateShape(g, P.bun, { fill: C.hair, hatch: [[-.5, 3.5, 1, .5]], box: [-35, -430, 70, 50], lw: 1.8 });
}
// world (local) position of her heart, used by the doctor's stethoscope
const WOMAN_HEART = [14, -136];

// ---------- the doctor (profile, facing left; frock coat, head mirror, stethoscope) ----------
const DOC = (() => {
  const P = {};
  const coat = new Path2D();
  coat.moveTo(-46, -262); coat.bezierCurveTo(-74, -160, -76, 40, -64, 172); coat.lineTo(-14, 176); coat.lineTo(-6, 120);
  coat.lineTo(40, 222); coat.lineTo(84, 210); coat.bezierCurveTo(68, 40, 62, -160, 36, -262); coat.quadraticCurveTo(-4, -278, -46, -262); coat.closePath(); P.coat = coat;
  const head = new Path2D();
  head.moveTo(-30, -372); head.bezierCurveTo(-10, -392, 40, -392, 44, -350); head.bezierCurveTo(48, -316, 34, -292, 18, -284);
  head.lineTo(-22, -290); head.lineTo(-36, -318); head.lineTo(-50, -330); head.lineTo(-38, -344); head.lineTo(-38, -360); head.closePath(); P.head = head;
  const beard = new Path2D();
  beard.moveTo(-38, -318); beard.bezierCurveTo(-46, -290, -36, -262, -16, -256); beard.bezierCurveTo(4, -258, 20, -276, 24, -300); beard.lineTo(6, -312); beard.lineTo(-22, -312); beard.closePath(); P.beard = beard;
  const hair = new Path2D(); hair.moveTo(-20, -384); hair.bezierCurveTo(10, -400, 50, -386, 46, -344); hair.lineTo(30, -330); hair.bezierCurveTo(28, -360, 10, -378, -20, -378); hair.closePath(); P.hair = hair;
  return P;
})();
// hand: target in local coords for the chestpiece; reach 0..1 lerps from rest.
function drawDoctor(g, t, hand, reach) {
  const P = DOC;
  // legs + shoes
  g.fillStyle = rgb([70, 64, 60]); g.strokeStyle = rgb(C.ink); g.lineWidth = 2;
  for (const [x0, x1] of [[-46, -12], [4, 34]]) { g.beginPath(); g.moveTo(x0, 160); g.lineTo(x0 - 4, 418); g.lineTo(x1 - 2, 418); g.lineTo(x1, 160); g.closePath(); g.fill(); g.stroke(); }
  g.save(); g.beginPath(); g.rect(-60, 160, 100, 260); g.clip(); hatchFill(g, -60, 160, 100, 260, 1.5, 5, 1, .5); g.restore();
  g.fillStyle = rgb(C.ink); for (const x of [-34, 14]) { g.beginPath(); g.ellipse(x - 14, 422, 30, 10, 0, 0, TAU); g.fill(); }
  // coat
  plateShape(g, P.coat, { fill: C.coat, hatch: [[1.2, 4, 1, .55], [-.4, 6, 1, .25]], box: [-90, -280, 190, 510], lw: 2.2 });
  g.fillStyle = rgb([244, 238, 222]); g.beginPath(); g.moveTo(-44, -262); g.lineTo(-22, -262); g.lineTo(-40, -190); g.closePath(); g.fill(); g.strokeStyle = rgb(C.ink); g.lineWidth = 1.5; g.stroke();
  // stethoscope: earpieces to Y, tube down to the hand
  const rest = [-46, 40], hx = lerp(rest[0], hand[0], reach), hy = lerp(rest[1], hand[1], reach);
  // arm: shoulder -> elbow -> hand
  const sh = [-18, -232], ex = lerp(-40, (sh[0] + hx) / 2 + 10, reach), ey = lerp(-60, (sh[1] + hy) / 2 + 60, reach);
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = rgb(C.ink); g.lineWidth = 50; g.beginPath(); g.moveTo(sh[0], sh[1]); g.lineTo(ex, ey); g.lineTo(hx + 18, hy); g.stroke();
  g.strokeStyle = rgb(C.coat); g.lineWidth = 45; g.stroke();
  g.save(); g.beginPath(); g.moveTo(sh[0], sh[1]); g.lineTo(ex, ey); g.lineTo(hx + 18, hy); g.lineWidth = 44; g.strokeStyle = 'rgba(0,0,0,0)';
  g.restore();
  // cuff + hand + chestpiece
  g.fillStyle = rgb([244, 238, 222]); g.beginPath(); g.ellipse(hx + 16, hy, 9, 20, 0, 0, TAU); g.fill(); g.strokeStyle = rgb(C.ink); g.lineWidth = 1.6; g.stroke();
  g.fillStyle = rgb(C.flesh); g.beginPath(); g.ellipse(hx + 2, hy, 16, 14, 0, 0, TAU); g.fill(); g.stroke();
  // tubing (dark rubber), drawn over the coat
  g.strokeStyle = rgb([28, 24, 22]); g.lineWidth = 6; g.beginPath(); g.moveTo(10, -336); g.bezierCurveTo(14, -300, 4, -270, -4, -246);
  g.bezierCurveTo(-10, -180, 30, -120, (hx - 4 + 10) / 2, hy + 70); g.quadraticCurveTo(hx - 30, hy + 40, hx - 10, hy); g.stroke();
  g.fillStyle = rgb([200, 202, 204]); g.beginPath(); g.ellipse(hx - 14, hy, 7, 16, 0, 0, TAU); g.fill(); g.strokeStyle = rgb(C.ink); g.lineWidth = 1.6; g.stroke();
  // head
  plateShape(g, P.head, { fill: C.flesh, lw: 2, shade: (q) => sideHatch(q, P.head, 10, -400, 50, 120, .4, 4.5, .9, .4) });
  plateShape(g, P.hair, { fill: [150, 146, 140], hatch: [.4, 3, 1, .5], box: [-30, -400, 90, 80], lw: 1.5 });
  plateShape(g, P.beard, { fill: [160, 156, 150], hatch: [[1.3, 3, .9, .55]], box: [-50, -320, 80, 70], lw: 1.6 });
  g.fillStyle = rgb(C.ink); g.beginPath(); g.arc(-24, -346, 2.6, 0, TAU); g.fill();
  g.strokeStyle = rgb(C.ink); g.lineWidth = 1.6; g.beginPath(); g.ellipse(18, -336, 8, 13, 0, 0, TAU); g.stroke();
  // head mirror: band + disc on the forehead
  g.strokeStyle = rgb([40, 34, 30]); g.lineWidth = 5; g.beginPath(); g.moveTo(-30, -368); g.quadraticCurveTo(10, -380, 44, -364); g.stroke();
  g.save(); g.translate(-40, -376); g.rotate(-.25);
  const mg = g.createLinearGradient(-12, -22, 12, 22); mg.addColorStop(0, '#f6f6f2'); mg.addColorStop(.5, '#9ea2a6'); mg.addColorStop(1, '#e8e8e2');
  g.fillStyle = mg; g.beginPath(); g.ellipse(0, 0, 11, 25, 0, 0, TAU); g.fill(); g.strokeStyle = rgb(C.ink); g.lineWidth = 1.8; g.stroke();
  g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fillStyle = rgb(C.ink); g.fill(); g.restore();
  // earpieces
  g.strokeStyle = rgb([180, 182, 184]); g.lineWidth = 3; g.beginPath(); g.moveTo(10, -336); g.lineTo(6, -350); g.stroke();
  return [hx - 14, hy];
}

// ---------- engraved snowflake ----------
function snowflake(g, x, y, r, rot, a = 1) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha *= a;
  g.lineCap = 'round';
  for (const [col, lw] of [[C.ink, r * .16 + 1.6], [[252, 252, 250], r * .16]]) {
    g.strokeStyle = rgb(col); g.lineWidth = lw; g.beginPath();
    for (let k = 0; k < 6; k++) {
      const c = Math.cos(k * TAU / 6), s = Math.sin(k * TAU / 6);
      g.moveTo(0, 0); g.lineTo(c * r, s * r);
      for (const f of [.45, .72]) { const bx = c * r * f, by = s * r * f, l = r * (f < .5 ? .32 : .22);
        for (const sg of [-1, 1]) { const a2 = k * TAU / 6 + sg * .9; g.moveTo(bx, by); g.lineTo(bx + Math.cos(a2) * l, by + Math.sin(a2) * l); } }
    }
    g.stroke();
  }
  g.restore();
}

// ---------- skin block diagram (dermatology plate): front face layers, top surface with hairs ----------
function skinBlock(g, x, y, w, h, dx, dy, seed) {
  const ep = h * .07, de = h * .55;
  // top face
  const top = new Path2D(); top.moveTo(x, y); top.lineTo(x + dx, y + dy); top.lineTo(x + w + dx, y + dy); top.lineTo(x + w, y); top.closePath();
  plateShape(g, top, { fill: [236, 190, 168], hatch: [0, 7, .8, .2], box: [x, y + dy, w + dx, -dy], lw: 2 });
  // pores + hairs
  g.strokeStyle = rgb(C.ink, .85); g.lineWidth = 1.4; g.beginPath();
  for (let i = 0; i < 26; i++) { const u = rnd(seed, i), v = rnd(seed, i, 1), px = x + u * w + v * dx, py = y + v * dy; g.moveTo(px, py); g.quadraticCurveTo(px + 4, py - 14, px + 10 * (rnd(seed, i, 2) - .2), py - 26 - 12 * rnd(seed, i, 3)); }
  g.stroke();
  // side face
  const side = new Path2D(); side.moveTo(x + w, y); side.lineTo(x + w + dx, y + dy); side.lineTo(x + w + dx, y + dy + h); side.lineTo(x + w, y + h); side.closePath();
  plateShape(g, side, { fill: [214, 150, 130], hatch: [[1.2, 5, 1, .45]], box: [x + w, y + dy, dx, h - dy], lw: 2 });
  // front face: three layers
  const front = new Path2D(); front.rect(x, y, w, h);
  g.save(); g.clip(front);
  g.fillStyle = rgb(C.fat); g.fillRect(x, y, w, h);
  // hypodermis fat globules
  g.strokeStyle = rgb(C.ink, .55); g.lineWidth = 1.2;
  for (let i = 0; i < 70; i++) { const px = x + rnd(seed, i, 5) * w, py = y + ep + de + rnd(seed, i, 6) * (h - ep - de) + 6, r = 9 + rnd(seed, i, 7) * 12; g.beginPath(); g.arc(px, py, r, 0, TAU); g.fillStyle = rgb([243, 222, 150], .8); g.fill(); g.stroke(); }
  // dermis with wavy papillae
  const dm = new Path2D(); dm.moveTo(x, y + ep + 8);
  for (let k = 0; k <= 40; k++) { const px = x + k / 40 * w; dm.lineTo(px, y + ep + 6 + Math.sin(k * 1.7) * 6); }
  dm.lineTo(x + w, y + ep + de); for (let k = 40; k >= 0; k--) dm.lineTo(x + k / 40 * w, y + ep + de + Math.sin(k * .9 + 1) * 8); dm.closePath();
  plateShape(g, dm, { fill: [228, 150, 140], hatch: [-.35, 6, .9, .22], box: [x, y, w, h], lw: 1.4 });
  // vessels: red/blue loops rising into papillae
  for (let k = 0; k < 7; k++) {
    const vx = x + (k + .5) / 7 * w;
    g.lineWidth = 3; g.strokeStyle = rgb(C.red, .85); g.beginPath(); g.moveTo(vx - 10, y + ep + de); g.bezierCurveTo(vx - 14, y + ep + de * .5, vx - 4, y + ep + 20, vx, y + ep + 16); g.stroke();
    g.strokeStyle = rgb(C.blue, .85); g.beginPath(); g.moveTo(vx, y + ep + 16); g.bezierCurveTo(vx + 4, y + ep + 20, vx + 14, y + ep + de * .5, vx + 10, y + ep + de); g.stroke();
  }
  // hair follicles
  g.strokeStyle = rgb(C.ink, .8); g.lineWidth = 2;
  for (let k = 0; k < 4; k++) { const fx = x + (k + .3) / 4 * w; g.beginPath(); g.moveTo(fx, y); g.quadraticCurveTo(fx + 8, y + de * .4, fx + 4, y + ep + de * .75); g.stroke(); g.beginPath(); g.ellipse(fx + 4, y + ep + de * .78, 7, 11, 0, 0, TAU); g.fillStyle = rgb(C.hair); g.fill(); }
  // epidermis band
  g.fillStyle = rgb([238, 196, 170]); g.fillRect(x, y, w, ep + 4);
  hatchFill(g, x, y, w, ep + 4, 0, 3, .7, .35);
  g.restore();
  g.strokeStyle = rgb(C.ink); g.lineWidth = 2.2; g.stroke(front);
  return { ep, de };
}

// ---------- engraved honey bee (facing left), wingPhase flaps, stingK 0..1 drops the abdomen ----------
function drawBee(g, wingPhase, stingK = 0) {
  // wings (behind)
  const wa = Math.sin(wingPhase) * .5;
  for (const [ox, oy, sc, a] of [[10, -34, 1, .55], [26, -30, .75, .45]]) {
    g.save(); g.translate(ox, oy); g.rotate(-.5 + wa); g.scale(sc, sc);
    g.beginPath(); g.ellipse(48, -18, 58, 22, -.25, 0, TAU); g.fillStyle = `rgba(240,244,248,${a})`; g.fill();
    g.strokeStyle = rgb(C.ink, .85); g.lineWidth = 1.5; g.stroke();
    g.lineWidth = .9; g.beginPath(); g.moveTo(0, 0); g.lineTo(90, -30); g.moveTo(30, -10); g.lineTo(40, -36); g.moveTo(55, -18); g.lineTo(70, -2); g.stroke();
    g.restore();
  }
  // legs
  g.strokeStyle = rgb(C.ink); g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath();
  for (const [x0, k] of [[-20, 0], [0, 1], [18, 2]]) { g.moveTo(x0, 14); g.lineTo(x0 - 14 + k * 6, 34); g.lineTo(x0 - 18 + k * 8, 50); }
  g.stroke();
  // abdomen (stripes), pivoting down for the sting
  g.save(); g.translate(30, 0); g.rotate(stingK * .55);
  const ab = new Path2D(); ab.ellipse(52, 4, 56, 34, 0, 0, TAU);
  g.fillStyle = rgb(C.yellow); g.fill(ab);
  g.save(); g.clip(ab);
  for (let k = 0; k < 4; k++) { g.fillStyle = rgb([40, 28, 18]); g.fillRect(14 + k * 22, -40, 11, 90); }
  hatchFill(g, 0, -40, 120, 90, 1.3, 4, .9, .35); g.restore();
  g.strokeStyle = rgb(C.ink); g.lineWidth = 2.2; g.stroke(ab);
  // stinger
  g.beginPath(); g.moveTo(106, 6); g.lineTo(106 + 22 + stingK * 8, 12); g.lineTo(106, 14); g.closePath(); g.fillStyle = rgb(C.ink); g.fill();
  g.restore();
  // thorax (fuzzy) + head
  const th = new Path2D(); th.ellipse(4, 0, 32, 28, 0, 0, TAU);
  plateShape(g, th, { fill: [150, 108, 50], hatch: [[.4, 3, .9, .6], [-.8, 4, .9, .4]], box: [-30, -30, 70, 60], lw: 2 });
  g.strokeStyle = rgb(C.ink, .7); g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 28; k++) { const a = k / 28 * TAU; g.moveTo(4 + Math.cos(a) * 30, Math.sin(a) * 26); g.lineTo(4 + Math.cos(a) * 37, Math.sin(a) * 33); } g.stroke();
  const hd = new Path2D(); hd.ellipse(-38, 4, 20, 22, 0, 0, TAU);
  plateShape(g, hd, { fill: [70, 50, 30], hatch: [.6, 3, .8, .5], box: [-60, -20, 45, 50], lw: 2 });
  g.fillStyle = rgb([20, 14, 10]); g.beginPath(); g.ellipse(-44, 0, 8, 12, -.2, 0, TAU); g.fill();
  g.strokeStyle = rgb(C.ink); g.lineWidth = 2; g.beginPath(); g.moveTo(-46, -14); g.quadraticCurveTo(-60, -40, -76, -42); g.moveTo(-40, -16); g.quadraticCurveTo(-48, -44, -62, -52); g.stroke();
}

// ---------- phrenology bust (profile facing left), cap hinges open on `capA`, a record spins inside ----------
const PHREN = (() => {
  const p = new Path2D();
  p.moveTo(-150, -20); p.bezierCurveTo(-170, -120, -100, -205, 0, -205); p.bezierCurveTo(110, -205, 176, -110, 170, 0);
  p.bezierCurveTo(166, 80, 122, 140, 92, 190); p.lineTo(96, 300); p.bezierCurveTo(140, 318, 226, 338, 250, 400); p.lineTo(-230, 400);
  p.bezierCurveTo(-210, 340, -124, 320, -80, 300); p.lineTo(-72, 232); p.bezierCurveTo(-92, 222, -112, 216, -122, 202);
  p.bezierCurveTo(-140, 196, -150, 182, -146, 166); p.lineTo(-156, 142); p.lineTo(-150, 130); p.lineTo(-160, 117); p.lineTo(-152, 102);
  p.lineTo(-162, 70); p.lineTo(-192, 40); p.lineTo(-166, 28); p.bezierCurveTo(-162, 6, -156, -8, -150, -20); p.closePath();
  return p;
})();
// cap line: y on the cranium where the lid separates (a gentle curve), hinge at the back
const CAP_Y = (x) => -70 + (x + 160) * .06;
const CAP_REGION = (() => { const p = new Path2D(); p.moveTo(-220, CAP_Y(-220)); for (let x = -220; x <= 220; x += 20) p.lineTo(x, CAP_Y(x)); p.lineTo(220, -260); p.lineTo(-220, -260); p.closePath(); return p; })();
const BELOW_CAP = (() => { const p = new Path2D(); p.moveTo(-260, CAP_Y(-260)); for (let x = -260; x <= 280; x += 20) p.lineTo(x, CAP_Y(x)); p.lineTo(280, 480); p.lineTo(-260, 480); p.closePath(); return p; })();
const CAP_HINGE = [168, CAP_Y(168)];
// regions on the cranium (curved dividers) and numeral spots
const PHREN_LINES = [[[-120, -150], [-40, -120], [10, -200]], [[-40, -120], [60, -110], [120, -170]], [[60, -110], [110, -40], [168, -40]],
  [[-150, -40], [-80, -70], [-40, -120]], [[-80, -70], [0, -60], [60, -110]], [[0, -60], [40, 20], [20, 100]], [[40, 20], [110, 30], [150, 90]], [[-150, 10], [-60, 20], [0, -60]]];
const PHREN_NUM = [[-80, -160], [30, -165], [110, -100], [-110, -95], [0, -95], [80, -40], [-60, -20], [95, 70], [120, 150]];
function drawPhrenology(g, t, o = {}) {
  const capA = o.capA || 0, bump = o.bump || 0, nums = o.nums ?? 1, spin = o.spin || 0, rec = o.record || 0;
  const bustFill = [242, 236, 222];
  // plinth
  g.fillStyle = rgb([226, 216, 196]); g.fillRect(-250, 398, 510, 46); g.strokeStyle = rgb(C.ink); g.lineWidth = 2.2; g.strokeRect(-250, 398, 510, 46);
  g.save(); g.beginPath(); g.rect(-250, 398, 510, 46); g.clip(); hatchFill(g, -250, 398, 510, 46, 0, 5, .8, .4); g.restore();
  const body = (q, clipBelow) => {
    q.save(); q.clip(clipBelow ? BELOW_CAP : CAP_REGION);
    plateShape(q, PHREN, { fill: bustFill, lw: 2.6, shade: (z) => {
      // shading: back of head + under jaw, engraved
      z.save(); z.beginPath(); z.ellipse(120, 60, 120, 260, 0, 0, TAU); z.clip(); hatchFill(z, 0, -220, 300, 640, .9, 5, 1, .45); z.restore();
      z.save(); z.beginPath(); z.rect(-240, 200, 480, 220); z.clip(); hatchFill(z, -240, 200, 480, 220, -.6, 6, 1, .3); z.restore();
      // region divider lines
      z.strokeStyle = rgb(C.ink, .8); z.lineWidth = 1.8; z.beginPath();
      for (const [a, b, c] of PHREN_LINES) { z.moveTo(a[0], a[1]); z.quadraticCurveTo(b[0], b[1], c[0], c[1]); } z.stroke();
    } });
    // the bump grows on the forehead region (on the cap)
    if (bump > 0 && !clipBelow) {
      const bp = new Path2D(); bp.ellipse(-70, -188, 30 * bump, 24 * bump, -.3, Math.PI, TAU); bp.closePath();
      plateShape(q, bp, { fill: bustFill, hatch: [.8, 4, .8, .4], box: [-110, -230, 80, 50], lw: 2.2 });
    }
    // numerals
    if (nums > 0) {
      q.fillStyle = rgb(C.ink, .9); q.textAlign = 'center'; q.textBaseline = 'middle';
      PHREN_NUM.forEach(([x, y], i) => { const k = clamp(nums * PHREN_NUM.length - i); if (k <= 0) return; if ((y < CAP_Y(x)) === clipBelow) return;
        q.save(); q.translate(x, y); q.scale(k, k); q.font = SERIF_I.replace('{s}', 26); q.fillText(String(i + 1), 0, 0); q.restore(); });
    }
    q.restore();
  };
  body(g, true);
  // the cavity + record (revealed when the cap opens)
  if (capA > .01 || rec > 0) {
    const cy = CAP_Y(0);
    g.save(); g.clip(PHREN); g.fillStyle = rgb([60, 40, 34]); g.beginPath(); g.ellipse(0, cy + 6, 160, 18, .06, 0, TAU); g.fill(); g.restore();
    if (rec > 0) {
      const ry = cy - 10 - rec * 70;
      g.save(); g.translate(4, ry);
      g.fillStyle = '#121010'; g.beginPath(); g.ellipse(0, 0, 150, 34, .06, 0, TAU); g.fill();
      g.fillStyle = '#121010'; g.fillRect(-150, 0, 300, 7); g.beginPath(); g.ellipse(0, 7, 150, 34, .06, 0, Math.PI); g.fill();
      g.strokeStyle = 'rgba(160,150,140,.28)'; g.lineWidth = 1; for (let r = 40; r < 146; r += 9) { g.beginPath(); g.ellipse(0, 0, r, r * .227, .06, 0, TAU); g.stroke(); }
      // glint sweeping round as it spins
      for (const off of [0, Math.PI]) { const a = spin + off; g.strokeStyle = 'rgba(250,245,235,.55)'; g.lineWidth = 5; g.beginPath(); g.ellipse(0, 0, 112, 25.4, .06, a - .25, a + .25); g.stroke(); }
      g.fillStyle = rgb(C.red); g.beginPath(); g.ellipse(0, 0, 40, 9.1, .06, 0, TAU); g.fill();
      g.fillStyle = rgb(C.paper); g.beginPath(); g.ellipse(0, 0, 4, 1.4, .06, 0, TAU); g.fill();
      // label mark spinning
      g.strokeStyle = rgb(C.paper, .8); g.lineWidth = 2; g.beginPath(); g.moveTo(Math.cos(spin) * 14, Math.sin(spin) * 3.2); g.lineTo(Math.cos(spin) * 32, Math.sin(spin) * 7.3); g.stroke();
      g.restore();
    }
  }
  // the cap, hinged at the back
  g.save(); g.translate(CAP_HINGE[0], CAP_HINGE[1]); g.rotate(capA); g.translate(-CAP_HINGE[0], -CAP_HINGE[1]);
  body(g, false);
  g.strokeStyle = rgb(C.ink); g.lineWidth = 2.4; g.beginPath(); g.moveTo(-158, CAP_Y(-158)); for (let x = -150; x <= 168; x += 14) g.lineTo(x, CAP_Y(x)); g.stroke();
  g.restore();
  // eye + ear
  g.strokeStyle = rgb(C.ink); g.lineWidth = 2; g.beginPath(); g.moveTo(-128, 6); g.quadraticCurveTo(-112, -6, -98, 6); g.quadraticCurveTo(-112, 12, -128, 6); g.stroke();
  g.beginPath(); g.ellipse(40, 40, 20, 34, .15, 0, TAU); g.stroke(); g.beginPath(); g.ellipse(42, 42, 9, 20, .15, 0, TAU); g.stroke();
}

// ---------- patent-medicine bottle (origin: bottom centre) with a swinging price tag ----------
function drawBottle(g, t, o = {}) {
  const body = new Path2D(); body.roundRect(-72, -300, 144, 300, 16);
  const shoulder = new Path2D(); shoulder.moveTo(-72, -286); shoulder.bezierCurveTo(-72, -330, -26, -330, -24, -352); shoulder.lineTo(24, -352); shoulder.bezierCurveTo(26, -330, 72, -330, 72, -286); shoulder.closePath();
  const neck = new Path2D(); neck.rect(-24, -394, 48, 44);
  const glass = [168, 92, 30];
  for (const p of [shoulder, body, neck]) plateShape(g, p, { fill: glass, fa: .92, lw: 2.4, shade: (q) => { q.fillStyle = 'rgba(40,14,0,.35)'; q.fillRect(30, -400, 50, 410); hatchFill(q, 30, -400, 50, 410, 1.4, 4, 1, .4); } });
  // lip + cork
  g.fillStyle = rgb([150, 80, 26]); g.fillRect(-30, -404, 60, 14); g.strokeStyle = rgb(C.ink); g.lineWidth = 2; g.strokeRect(-30, -404, 60, 14);
  const cork = new Path2D(); cork.moveTo(-20, -404); cork.lineTo(-23, -438); cork.lineTo(23, -438); cork.lineTo(20, -404); cork.closePath();
  plateShape(g, cork, { fill: [196, 160, 112], hatch: [0, 4, .8, .4], box: [-25, -440, 50, 40], lw: 2 });
  // highlights
  g.fillStyle = 'rgba(255,240,215,.55)'; g.fillRect(-58, -280, 10, 260); g.fillRect(-40, -280, 4, 260); g.fillRect(-18, -390, 6, 36);
  // label (no words: ornament + heart emblem)
  g.fillStyle = rgb([244, 234, 206]); g.fillRect(-60, -250, 120, 180); g.strokeStyle = rgb(C.ink); g.lineWidth = 2; g.strokeRect(-60, -250, 120, 180);
  g.lineWidth = 1; g.strokeRect(-54, -244, 108, 168);
  g.strokeStyle = rgb(C.red, .9); g.lineWidth = 1.4; g.beginPath(); for (let k = 0; k < 12; k++) { const x = -48 + k * 8.7; g.moveTo(x, -236); g.quadraticCurveTo(x + 4, -230, x + 8.7, -236); g.moveTo(x, -84); g.quadraticCurveTo(x + 4, -90, x + 8.7, -84); } g.stroke();
  g.save(); g.translate(0, -160); g.scale(.36, .36); drawHeart(g, { lw: 5 }); g.restore();
  g.strokeStyle = rgb(C.ink, .8); g.lineWidth = 1.2; g.beginPath(); g.moveTo(-40, -110); g.lineTo(40, -110); g.moveTo(-30, -100); g.lineTo(30, -100); g.stroke();
  // price tag on a string from the neck
  const sw = o.swing || 0, flip = o.flip ?? 0; // flip: -1 blank back .. 1 shows $0
  const sx = 24, sy = -372, L = 120, ang = .5 + sw;
  const tx = sx + Math.sin(ang) * L, ty = sy + Math.cos(ang) * L;
  g.strokeStyle = rgb([120, 90, 60]); g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 40, sy + 10, tx, ty); g.stroke();
  g.save(); g.translate(tx, ty); g.rotate(-ang * .6 + .2); g.scale(Math.max(.04, Math.abs(flip)), 1);
  const tag = new Path2D(); tag.moveTo(0, -24); tag.lineTo(96, -24); tag.lineTo(96, 24); tag.lineTo(0, 24); tag.lineTo(-18, 0); tag.closePath();
  plateShape(g, tag, { fill: [246, 238, 214], lw: 2 });
  g.beginPath(); g.arc(-4, 0, 5, 0, TAU); g.strokeStyle = rgb(C.ink); g.lineWidth = 1.6; g.stroke();
  if (flip > 0) { const s = fitText(g, '$0', 68, 40, 'bold ' + SERIF); g.fillStyle = rgb(C.ink); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$0', 50, 2); }
  g.restore();
}

// ---------- daisy specimen jar (card-local coords) ----------
const PETAL_N = 9;
const PETAL_ORDER = [0, 5, 2, 7, 4, 8, 3, 6, 1]; // drop k removes petal PETAL_ORDER[k]
const FLOWER = [280, 372];
function petalShape(g, len, wid) { g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(len * .3, -wid, len * .9, -wid * .8, len, 0); g.bezierCurveTo(len * .9, wid * .8, len * .3, wid, 0, 0); g.closePath(); }
function drawPetal(g, len, wid) {
  petalShape(g, len, wid); g.fillStyle = rgb([252, 250, 244]); g.fill(); g.strokeStyle = rgb(C.ink, .95); g.lineWidth = 1.8; g.stroke();
  g.strokeStyle = rgb(C.ink, .35); g.lineWidth = 1; g.beginPath(); g.moveTo(len * .15, 0); g.lineTo(len * .85, 0); g.moveTo(len * .3, -wid * .3); g.lineTo(len * .8, -wid * .2); g.stroke();
}
function drawJarCard(g, t) {
  // jar back wall + liquid
  const jx = 100, jw = 360, jt = 200, jb = 800, ry = 34;
  const liquidTop = 262;
  g.save();
  g.fillStyle = 'rgba(196,214,190,.35)'; g.fillRect(jx, liquidTop, jw, jb - liquidTop);
  g.fillStyle = 'rgba(170,196,170,.35)'; g.beginPath(); g.ellipse(jx + jw / 2, jb, jw / 2, ry, 0, 0, TAU); g.fill();
  // back hatching through the glass (soft)
  g.save(); g.beginPath(); g.rect(jx, jt, jw, jb - jt); g.clip(); hatchFill(g, jx, jt, jw, jb - jt, 1.57, 9, .7, .12); g.restore();
  // stem + leaves
  const [fx, fy] = FLOWER, sway = n1(5, t * .4) * 4;
  g.strokeStyle = rgb(C.green); g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(276, jb - 4); g.bezierCurveTo(290, 640, 262 + sway, 480, fx + sway, fy + 30); g.stroke();
  g.strokeStyle = rgb(C.ink, .8); g.lineWidth = 1.4; g.stroke();
  for (const [lx, ly, a, s] of [[282, 640, -.7, 1], [272, 560, .6, -1]]) {
    g.save(); g.translate(lx, ly); g.rotate(a); g.scale(s, 1);
    g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(30, -26, 80, -24, 110, 0); g.bezierCurveTo(80, 18, 30, 18, 0, 0); g.closePath();
    g.fillStyle = rgb([110, 146, 92]); g.fill(); g.strokeStyle = rgb(C.ink); g.lineWidth = 1.6; g.stroke();
    g.beginPath(); g.moveTo(4, 0); g.lineTo(104, 0); for (let k = 1; k < 5; k++) { g.moveTo(k * 22, 0); g.lineTo(k * 22 + 12, -10); g.moveTo(k * 22, 0); g.lineTo(k * 22 + 12, 9); } g.lineWidth = .9; g.stroke();
    g.restore();
  }
  // petals: attached ones round the disc, dropped ones sink and settle on the floor
  const cx = fx + sway, cy = fy;
  for (let k = 0; k < PETAL_N; k++) {
    const i = PETAL_ORDER[k], D = PETAL_DROPS[k], a0 = i * TAU / PETAL_N - Math.PI / 2 + .1;
    const lt = t - D;
    if (lt < 0) continue; // attached: drawn below
    // tremble 0..0.22 s, then a slow sink with a side-to-side drift (it's in liquid)
    const fall = clamp((lt - .22) / 2.6), fe = 1 - Math.pow(1 - fall, 1.6);
    const rest = [150 + ((k * 37) % 9) * 30, jb - 6 - (k % 3) * 5];
    const px = lerp(cx + Math.cos(a0) * 34, rest[0], fe) + Math.sin(lt * 2.6 + k) * 22 * (1 - fall) * (lt > .22 ? 1 : 0);
    const py = lerp(cy + Math.sin(a0) * 34, rest[1], fe);
    const ang = lerp(a0, (k % 2 ? .08 : Math.PI - .08), fe) + Math.sin(lt * 3.1 + k) * .6 * (1 - fall) + (lt < .22 ? Math.sin(lt * 90) * .12 : 0);
    g.save(); g.translate(px, py); g.rotate(ang); g.scale(1, lerp(1, .55, fe)); drawPetal(g, 92, 20); g.restore();
  }
  for (let i = 0; i < PETAL_N; i++) {
    const k = PETAL_ORDER.indexOf(i), D = PETAL_DROPS[k];
    if (t >= D) continue;
    const a0 = i * TAU / PETAL_N - Math.PI / 2 + .1 + n1(10 + i, t * .5) * .03;
    g.save(); g.translate(cx + Math.cos(a0) * 30, cy + Math.sin(a0) * 30); g.rotate(a0); drawPetal(g, 92, 20); g.restore();
  }
  // disc: stippled yellow
  const disc = new Path2D(); disc.arc(cx, cy, 34, 0, TAU);
  plateShape(g, disc, { fill: C.yellow, lw: 2, shade: (q) => { stipple(q, disc, cx - 34, cy - 34, 68, 68, 140, 1.6, .6, [120, 80, 20], 17); } });
  // bubbles rising
  for (let b = 0; b < 9; b++) { const per = 3 + rnd(b, 40) * 3, ph = ((t + rnd(b, 41) * per) % per) / per; const bx = jx + 30 + rnd(b, 42) * (jw - 60) + Math.sin(t * 2 + b) * 5, by = lerp(jb - 20, liquidTop + 8, ph);
    g.beginPath(); g.arc(bx, by, 3 + rnd(b, 43) * 4, 0, TAU); g.strokeStyle = rgb(C.ink, .55 * (1 - ph * .5)); g.lineWidth = 1.2; g.stroke(); }
  // glass front: outline, rims, highlights
  g.strokeStyle = rgb(C.ink); g.lineWidth = 2.6;
  g.beginPath(); g.moveTo(jx, jt); g.lineTo(jx, jb); g.moveTo(jx + jw, jt); g.lineTo(jx + jw, jb); g.stroke();
  g.beginPath(); g.ellipse(jx + jw / 2, jb, jw / 2, ry, 0, 0, Math.PI); g.stroke();
  g.lineWidth = 1.4; g.beginPath(); g.ellipse(jx + jw / 2, liquidTop, jw / 2, ry * .8, 0, 0, TAU); g.strokeStyle = rgb(C.ink, .5); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(jx + 22, jt + 30, 14, jb - jt - 60); g.fillRect(jx + 44, jt + 30, 5, jb - jt - 60); g.fillRect(jx + jw - 40, jt + 50, 8, jb - jt - 100);
  // lid: glass stopper
  g.fillStyle = rgb([200, 210, 200]); g.beginPath(); g.ellipse(jx + jw / 2, jt, jw / 2 + 8, ry, 0, 0, TAU); g.fill(); g.strokeStyle = rgb(C.ink); g.lineWidth = 2.4; g.stroke();
  g.beginPath(); g.moveTo(jx + jw / 2 - 60, jt - 10); g.bezierCurveTo(jx + jw / 2 - 60, jt - 80, jx + jw / 2 + 60, jt - 80, jx + jw / 2 + 60, jt - 10); g.fillStyle = rgb([210, 220, 210]); g.fill(); g.stroke();
  g.beginPath(); g.arc(jx + jw / 2, jt - 86, 16, 0, TAU); g.fill(); g.stroke();
  // paper label on the jar (blank, ruled)
  g.fillStyle = rgb([244, 234, 206]); g.fillRect(jx + 90, 690, 180, 70); g.strokeStyle = rgb(C.ink); g.lineWidth = 1.8; g.strokeRect(jx + 90, 690, 180, 70);
  g.lineWidth = 1; g.strokeRect(jx + 96, 696, 168, 58); g.beginPath(); g.moveTo(jx + 110, 736); g.lineTo(jx + 250, 736); g.stroke();
  g.restore();
}
