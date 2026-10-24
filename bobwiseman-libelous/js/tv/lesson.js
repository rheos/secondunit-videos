// Stanza 7 (123.125-165.083): the kids' show is back from the break with its learning segment, done the way
// 1970s studio shows did them: a flannel board. Scissor-cut felt pieces are stuck onto the board by the host's
// felt hand (striped knit sleeve, mitten), or pop on stop-motion style, on twos, under hot studio lights.
// Studio video (no film look). The board sits under the four closed-caption rows at the top of the picture, so
// every piece lives below program y 280. Pure: a function of song time t only.
const LS = {};
function initLesson() {
  const T = (seed, base, light, dark) => lsFeltTile(seed, base, light, dark);
  LS.felt = {
    board: T(301, '#3f73a6', '#6d9bcb', '#2c5784'), board2: T(302, '#2f8f86', '#5cb9ae', '#1f6c64'),
    grass: T(303, '#4f9a3c', '#7cc463', '#357026'), ink: T(304, '#1c1f2c', '#3a4058', '#0b0c12'),
    hoop: T(305, '#8a5a2c', '#b98650', '#5e3a18'), brick: T(306, '#b04a32', '#d97a5c', '#7e2f1e'),
    roof: T(307, '#5a3a6a', '#8a66a0', '#3a2448'), white: T(308, '#f4efe4', '#ffffff', '#cfc6b4'),
    cream: T(309, '#f3e2b5', '#fff3d2', '#cdb78a'), grey: T(310, '#6a6f78', '#9097a2', '#474b52'),
    skin: T(311, '#f0b48f', '#ffd7bd', '#c98a68'), skin2: T(312, '#9a6440', '#c08860', '#6e4428'), skin3: T(313, '#d9a06e', '#f0c08f', '#a9734a'),
    brown: T(314, '#7a4a24', '#a8743f', '#523014'), red: T(315, '#c8303c', '#ee6670', '#8e1c26'),
    yellow: T(316, '#f2c230', '#ffe07a', '#c8941a'), green: T(317, '#5aa55a', '#8fd08a', '#3a7a3c'),
    orange: T(318, '#ee8a2a', '#ffb56a', '#b8601a'), teal: T(319, '#1fa6a0', '#62d0c8', '#127a75'),
    purple: T(320, '#7b54a6', '#a585cc', '#583a7c'), pink: T(321, '#ff7fb0', '#ffb3d0', '#d24f86'),
    black: T(322, '#18161c', '#38343e', '#050406'), blue: T(323, '#3d8bd9', '#86bdf2', '#2563a8'),
    knit: T(324, '#c8303c', '#ee6670', '#8e1c26'), tan: T(325, '#d9a35a', '#f2c88a', '#a8763a'),
    lettuce: T(326, '#6cc04a', '#a6e88a', '#3f8a2a'), cola: T(327, '#4a2414', '#6e3a20', '#2a1008'),
    gold: T(328, '#e8b630', '#ffe07a', '#b8861a'), mauve: T(329, '#b0567a', '#d88aa8', '#7c3656'),
  };
  // the boards (prebaked): flannel, a felt sun and clouds behind the caption rows, a felt ground strip
  const mk = (base, ground, opts = {}) => {
    const c = mkCanvas(960, 720), g = c.getContext('2d');
    g.fillStyle = g.createPattern(LS.felt[base], 'repeat'); g.fillRect(0, 0, 960, 720);
    if (opts.sun) { lsPiece(g, (h) => wobblyCircle(h, 860, 120, 58, 41, 1.6), 'yellow', '#b0801a');
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; lsPiece(g, (h) => { h.beginPath(); h.moveTo(860 + Math.cos(a - .12) * 70, 120 + Math.sin(a - .12) * 70); h.lineTo(860 + Math.cos(a) * 100, 120 + Math.sin(a) * 100); h.lineTo(860 + Math.cos(a + .12) * 70, 120 + Math.sin(a + .12) * 70); h.closePath(); }, 'yellow', '#b0801a'); } }
    if (opts.clouds) for (const [cx, cy, s] of [[120, 110, 1], [480, 70, .8]]) lsPiece(g, (h) => { h.beginPath(); for (let k = 0; k < 5; k++) h.ellipse(cx + (k - 2) * 34 * s, cy + (k % 2 ? -10 : 6) * s, 40 * s, 28 * s, 0, 0, TAU); }, 'white', '#a9a090');
    if (ground) lsPiece(g, (h) => { h.beginPath(); h.moveTo(0, 720); for (let x = 0; x <= 960; x += 24) h.lineTo(x, opts.gy + Math.sin(x / 120) * 8 + n1(77, x / 40) * 3); h.lineTo(960, 720); h.closePath(); }, ground, '#2a2a2a', false);
    return c;
  };
  LS.boardSky = mk('board', 'grass', { sun: true, clouds: true, gy: 640 });
  LS.boardShop = mk('board', 'brown', { clouds: true, gy: 650 });
  LS.boardPlain = mk('board2', null, {});
  LS.boardPeople = mk('board', 'brown', { sun: true, gy: 660 });
  // studio light: a hot spot on the board, falling off to the corners
  const L = mkCanvas(960, 720), lg = L.getContext('2d');
  const rg = lg.createRadialGradient(480, 430, 120, 480, 430, 720); rg.addColorStop(0, 'rgba(255,245,220,.10)'); rg.addColorStop(.6, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.42)');
  lg.fillStyle = rg; lg.fillRect(0, 0, 960, 720); LS.light = L;
}
// felt, big enough to survive the tube's 240 lines: blotchy mottling plus long, contrasty fibres
function lsFeltTile(seed, base, light, dark) {
  const c = mkCanvas(256, 256), g = c.getContext('2d'), R = mulberry(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 60; i++) {
    const x = R() * 256, y = R() * 256, r = 10 + R() * 34, col = R() < .5 ? light : dark;
    for (const [ox, oy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) {
      const rg = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = .16 + R() * .1; g.fillStyle = rg; g.fillRect(x + ox - r, y + oy - r, 2 * r, 2 * r);
    }
  }
  for (let i = 0; i < 2200; i++) {
    const x = R() * 256, y = R() * 256, a = R() * TAU, l = 5 + R() * 12, bend = (R() - .5) * 6;
    g.strokeStyle = R() < .5 ? light : dark; g.globalAlpha = .18 + R() * .26; g.lineWidth = .9 + R() * 1.1;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l / 2 + bend, y + Math.sin(a) * l / 2 - bend, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  g.globalAlpha = 1;
  return c;
}
// a felt piece: scissor-cut felt with a soft shadow on the flannel under the studio lights, a darker inner edge,
// and fibres fuzzing its outline
function lsPiece(g, pathFn, felt, edge, shadow = true) {
  const P = (h) => { h.beginPath(); pathFn(h); };
  g.save();
  if (shadow) { g.shadowColor = 'rgba(8,12,30,.42)'; g.shadowBlur = 9; g.shadowOffsetX = 3; g.shadowOffsetY = 6; }
  P(g); g.fillStyle = g.createPattern(LS.felt[felt], 'repeat'); g.fill();
  g.restore();
  g.save(); P(g); g.clip(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 7; P(g); g.stroke(); g.restore();
  g.save(); P(g); g.strokeStyle = edge; g.globalAlpha = .6; g.lineWidth = 2.6; g.setLineDash([1.6, 2.2]); g.stroke(); g.restore();
}
const lsOn = (t, t0) => t >= t0 - 0.02;
// stop-motion pop: a felt piece slapped on is a hair big for two frames
function lsPop(t, t0) { if (!lsOn(t, t0)) return 0; return two2(t) - t0 < 0.08 ? 1.07 : 1; }
function lsScaled(g, x, y, s, fn) { g.save(); g.translate(x, y); g.scale(s, s); g.translate(-x, -y); fn(); g.restore(); }
// The host's hand: a striped knit sleeve from the bottom of the picture and a felt mitten.
function lsHand(g, x, y, a = 0) {
  g.save(); g.translate(x, y); g.rotate(a);
  lsPiece(g, (h) => { h.beginPath(); h.moveTo(-34, 30); h.lineTo(34, 30); h.lineTo(44, 480); h.lineTo(-44, 480); h.closePath(); }, 'knit', '#6a1018');
  g.save(); g.beginPath(); g.moveTo(-34, 30); g.lineTo(34, 30); g.lineTo(44, 480); g.lineTo(-44, 480); g.closePath(); g.clip();
  g.fillStyle = 'rgba(245,235,215,.85)'; for (let k = 0; k < 9; k++) g.fillRect(-50, 60 + k * 50, 100, 18); g.restore();
  lsPiece(g, (h) => { h.beginPath(); h.roundRect(-38, 18, 76, 24, 10); }, 'cream', '#9a8a6a', false);
  lsPiece(g, (h) => { h.beginPath(); h.ellipse(0, -10, 34, 38, 0, 0, TAU); h.moveTo(-26, -6); h.ellipse(-36, -14, 12, 22, -.5, 0, TAU); }, 'skin', '#b0704f', false);
  g.strokeStyle = 'rgba(150,80,50,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-10, -40); g.quadraticCurveTo(-6, -24, -12, -8); g.stroke();
  g.restore();
}
// Carrying a piece in: the hand brings it up from below the picture, sticks it on at t0, lets go and leaves.
// Returns where to draw the piece (null before the hand comes in) and draws the hand after fn draws the piece.
function lsCarry(g, t, t0, x, y, fn, o = {}) {
  const tq = two2(t), inT = o.inT || .42, from = o.from || [x + 60, 900];
  if (tq < t0 - inT) return;
  let px = x, py = y;
  if (tq < t0) { const u = smooth(clamp((tq - (t0 - inT)) / inT)); px = lerp(from[0], x, u); py = lerp(from[1], y, u); }
  const press = tq >= t0 && tq - t0 < .09 ? 1.06 : 1;
  lsScaled(g, px, py, press, () => fn(px, py));
  // the hand: under the piece's lower edge while carrying, pressing it on, then away down the picture
  const grip = o.grip || [0, 40];
  const out = tq < t0 + .12 ? 0 : smooth(clamp((tq - t0 - .12) / .34));
  if (out >= 1) return;
  const hx = px + grip[0] + out * (from[0] - x) * .4, hy = py + grip[1] + out * (from[1] - y);
  lsHand(g, hx, hy, o.a || 0);
}
function lsBump(t, cues) { let b = 0; for (const c of cues) if (t >= c && t - c < .5) b += Math.exp(-(t - c) * 12) * Math.sin((t - c) * 60); return b; }

// ---------- pieces ----------
function lsBarrel(g, x, y, s, seed) {
  // y = bottom of the barrel
  g.save(); g.translate(x, y); g.scale(s, s);
  const body = (h) => { h.beginPath(); h.moveTo(-50, 0); h.quadraticCurveTo(-64, -75, -50, -150); h.lineTo(50, -150); h.quadraticCurveTo(64, -75, 50, 0); h.closePath(); };
  lsPiece(g, body, 'ink', '#000');
  for (const hy of [-28, -122]) lsPiece(g, (h) => { h.beginPath(); h.moveTo(-58, hy - 9); h.quadraticCurveTo(0, hy - 2, 58, hy - 9); h.lineTo(58, hy + 9); h.quadraticCurveTo(0, hy + 16, -58, hy + 9); h.closePath(); }, 'hoop', '#3a2410', false);
  lsPiece(g, (h) => { h.beginPath(); h.ellipse(0, -150, 50, 12, 0, 0, TAU); }, 'black', '#000', false);
  // a felt drip down the side
  lsPiece(g, (h) => { h.beginPath(); h.moveTo(-30 + seed * 6, -152); h.quadraticCurveTo(-34 + seed * 6, -110, -26 + seed * 6, -96); h.arc(-28 + seed * 6, -96, 7, 0, Math.PI); h.quadraticCurveTo(-40 + seed * 6, -120, -40 + seed * 6, -152); h.closePath(); }, 'black', '#000', false);
  g.restore();
}
function lsDrop(g, x, y, s = 1) { lsPiece(g, (h) => { h.beginPath(); h.moveTo(x, y - 22 * s); h.quadraticCurveTo(x + 15 * s, y - 2 * s, x + 12 * s, y + 6 * s); h.arc(x, y + 6 * s, 12 * s, 0, Math.PI); h.quadraticCurveTo(x - 15 * s, y - 2 * s, x, y - 22 * s); h.closePath(); }, 'black', '#000'); }
function sceneInk(g, t) {
  const tq = two2(t);
  g.drawImage(LS.boardSky, 0, 0);
  // the drain in the ground, bottom right
  lsPiece(g, (h) => { h.beginPath(); h.ellipse(800, 668, 62, 20, 0, 0, TAU); }, 'grey', '#2a2c30', false);
  g.fillStyle = '#121216'; for (let k = -3; k <= 3; k++) { g.beginPath(); g.roundRect(800 + k * 15 - 4, 658, 8, 20, 3); g.fill(); }
  // the ink puddle grows after the spill, then turns in a spiral and drains away
  const grow = lsOn(t, C.spill) ? Math.min(1, Math.floor((tq - C.spill) * 12 + 1) / 8) : 0;
  const drainU = lsOn(t, C.drain) ? clamp((tq - C.drain) / (LN2[51].e - C.drain + .1)) : 0;
  if (grow > 0) {
    const pw = 200 * grow * (1 - drainU * .75), ph = 26 * grow * (1 - drainU * .6), px = lerp(500, 760, drainU * .8);
    lsPiece(g, (h) => { h.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU, r = 1 + n1(91, i * .7) * .12; i ? h.lineTo(px + Math.cos(a) * pw * r, 650 + Math.sin(a) * ph * r) : h.moveTo(px + Math.cos(a) * pw * r, 650 + Math.sin(a) * ph * r); } h.closePath(); }, 'ink', '#000', false);
    // a grey felt spiral on the puddle as it goes down the drain
    if (drainU > 0) { g.save(); g.translate(px, 650); g.scale(1, ph / Math.max(1, pw)); g.rotate(-tq * 6); g.strokeStyle = 'rgba(140,150,170,.9)'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); for (let a = 0; a < 4 * Math.PI; a += .2) { const r = 6 + a * pw * .055; a ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0); } g.stroke(); g.restore(); }
  }
  // drops hop from the puddle to the drain, one every quarter second
  if (lsOn(t, C.drip)) for (let k = 0; k < 12; k++) {
    const t0 = C.drip + k * .25, u = (tq - t0) / .42; if (u < 0 || u >= 1) continue;
    lsDrop(g, lerp(620, 800, u), lerp(630, 648, u) - Math.sin(u * Math.PI) * 70, .9);
  }
  // three barrels: the middle one is the big one and thumps down
  const b1 = lsPop(t, C.barrel1); if (b1) lsScaled(g, 230, 640, b1, () => lsBarrel(g, 230, 640, 1, 0));
  const b3 = lsPop(t, C.barrel3); if (b3) lsScaled(g, 735, 640, b3, () => lsBarrel(g, 735, 640, 1, 2));
  lsCarry(g, t, C.tons, 480, 650, (x, y) => lsBarrel(g, x, y, 1.75, 1), { inT: .34, from: [560, 980], grip: [96, -70], a: -.35 });
  // the spill: an ink splash over the big barrel's rim
  if (lsOn(t, C.spill)) {
    const s = Math.min(1, Math.floor((tq - C.spill) * 12 + 1) / 3);
    lsPiece(g, (h) => { h.beginPath(); h.moveTo(400, 392); for (let k = 0; k <= 8; k++) { const x = 400 + k * 20, up = (k % 2 ? 36 : 12) * s; h.lineTo(x, 392 - up); } h.lineTo(560, 392); h.quadraticCurveTo(590, 450, 568, 520); h.arc(560, 520, 9, 0, Math.PI); h.lineTo(548, 420); h.closePath(); }, 'ink', '#000', false);
  }
}
function lsHouse(g, smokeT, tq) {
  // the publishing house: brick front, purple roof, a round window with the press wheel turning, a door
  lsPiece(g, (h) => { h.beginPath(); h.rect(70, 430, 210, 200); }, 'brick', '#5e1a10');
  g.strokeStyle = 'rgba(80,20,10,.4)'; g.lineWidth = 2; for (let y = 450; y < 630; y += 20) { g.beginPath(); g.moveTo(72, y); g.lineTo(278, y); g.stroke(); }
  lsPiece(g, (h) => { h.beginPath(); h.rect(222, 330, 30, 70); }, 'brick', '#5e1a10');
  lsPiece(g, (h) => { h.beginPath(); h.moveTo(50, 440); h.lineTo(175, 340); h.lineTo(300, 440); h.closePath(); }, 'roof', '#2a1438');
  lsPiece(g, (h) => { h.beginPath(); h.roundRect(146, 540, 58, 90, [28, 28, 0, 0]); }, 'brown', '#3a1e0a', false);
  lsPiece(g, (h) => h.arc(175, 485, 36, 0, TAU), 'cream', '#9a8a6a', false);
  g.save(); g.translate(175, 485); g.rotate(smokeT >= 0 ? -two2(smokeT) * 3 : 0);
  g.strokeStyle = '#3a2410'; g.lineWidth = 6; g.lineCap = 'round'; for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI; g.beginPath(); g.moveTo(Math.cos(a) * -26, Math.sin(a) * -26); g.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); g.stroke(); }
  g.fillStyle = '#3a2410'; g.beginPath(); g.arc(0, 0, 8, 0, TAU); g.fill(); g.restore();
  // smoke puffs: one per beat once the presses start
  if (smokeT >= 0) for (let k = 0; k < 20; k++) {
    const t0 = k * .48, u = (tq - (smokeT + t0)) / 1.6; if (u < 0 || u >= 1) continue;
    const r = 16 + u * 22, x = 238 + u * 60 + Math.sin(u * 5 + k) * 8, y = 316 - u * 30;
    if (y - r < 282) continue;
    lsPiece(g, (h) => wobblyCircle(h, x, y, r, 60 + k, 2), 'white', '#a9a090', false);
  }
}
function lsMan(g, t, tq) {
  // the man: round charcoal suit, top hat, a smug little smile; on his cue one fist becomes enormous
  const x = 400, fistU = lsOn(t, C.fist) ? (tq - C.fist < .08 ? 1.12 : 1) : 0;
  for (const s of [-1, 1]) lsPiece(g, (h) => { h.beginPath(); h.rect(x + s * 18 - 11, 560, 22, 70); }, 'grey', '#2a2c30');
  for (const s of [-1, 1]) lsPiece(g, (h) => { h.beginPath(); h.ellipse(x + s * 22, 632, 22, 10, 0, 0, TAU); }, 'black', '#000', false);
  lsPiece(g, (h) => { h.beginPath(); h.ellipse(x, 510, 62, 70, 0, 0, TAU); }, 'grey', '#2a2c30');
  lsPiece(g, (h) => { h.beginPath(); h.moveTo(x - 22, 446); h.lineTo(x, 500); h.lineTo(x + 22, 446); h.closePath(); }, 'white', '#a9a090', false);
  lsPiece(g, (h) => { h.beginPath(); h.moveTo(x - 7, 452); h.lineTo(x + 7, 452); h.lineTo(x + 9, 498); h.lineTo(x, 508); h.lineTo(x - 9, 498); h.closePath(); }, 'red', '#6a1018', false);
  // left arm and small mitten
  lsPiece(g, (h) => { h.beginPath(); h.moveTo(x - 52, 470); h.quadraticCurveTo(x - 92, 520, x - 78, 560); h.lineTo(x - 60, 556); h.quadraticCurveTo(x - 70, 520, x - 40, 490); h.closePath(); }, 'grey', '#2a2c30', false);
  lsPiece(g, (h) => wobblyCircle(h, x - 70, 566, 15, 3, 1), 'skin', '#b0704f', false);
  // head, hat
  lsPiece(g, (h) => wobblyCircle(h, x, 410, 36, 5, 1), 'skin', '#b0704f');
  for (const s of [-1, 1]) { g.fillStyle = '#121014'; g.beginPath(); g.arc(x + s * 13, 404, 5.5, 0, TAU); g.fill(); }
  g.strokeStyle = '#5a1a1a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 12, 426); g.quadraticCurveTo(x + 2, 434, x + 14, 422); g.stroke();
  lsPiece(g, (h) => { h.beginPath(); h.ellipse(x, 380, 52, 10, 0, 0, TAU); }, 'black', '#000', false);
  lsPiece(g, (h) => { h.beginPath(); h.rect(x - 32, 304, 64, 76); }, 'black', '#000', false);
  lsPiece(g, (h) => { h.beginPath(); h.rect(x - 32, 360, 64, 10); }, 'red', '#6a1018', false);
  // right arm: a little fist, then the giant one raised
  if (!fistU) {
    lsPiece(g, (h) => { h.beginPath(); h.moveTo(x + 52, 470); h.quadraticCurveTo(x + 92, 520, x + 78, 560); h.lineTo(x + 60, 556); h.quadraticCurveTo(x + 70, 520, x + 40, 490); h.closePath(); }, 'grey', '#2a2c30', false);
    lsPiece(g, (h) => wobblyCircle(h, x + 70, 566, 15, 4, 1), 'skin', '#b0704f', false);
  } else {
    lsScaled(g, x + 50, 480, fistU, () => {
      lsPiece(g, (h) => { h.beginPath(); h.moveTo(x + 40, 470); h.quadraticCurveTo(x + 90, 450, x + 110, 400); h.lineTo(x + 146, 412); h.quadraticCurveTo(x + 116, 480, x + 52, 506); h.closePath(); }, 'grey', '#2a2c30', false);
      lsPiece(g, (h) => { h.beginPath(); h.roundRect(x + 106, 410, 52, 22, 8); }, 'white', '#9a9284', false);
      lsPiece(g, (h) => { h.beginPath(); h.roundRect(x + 72, 320, 120, 98, 34); }, 'skin', '#b0704f');
      for (let k = 0; k < 4; k++) lsPiece(g, (h) => h.ellipse(x + 90 + k * 28, 324, 17, 15, 0, 0, TAU), 'skin', '#b0704f', false);
      g.strokeStyle = 'rgba(140,70,40,.75)'; g.lineWidth = 3.5; g.lineCap = 'round';
      for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x + 76 + k * 28, 318); g.lineTo(x + 76 + k * 28, 350); g.stroke(); }
      lsPiece(g, (h) => { h.moveTo(x + 76, 366); h.quadraticCurveTo(x + 120, 350, x + 160, 368); h.quadraticCurveTo(x + 162, 386, x + 140, 388); h.quadraticCurveTo(x + 110, 380, x + 80, 390); h.closePath(); }, 'skin', '#9a5a3a', false);
    });
  }
}
function lsWallet(g, t, tq) {
  if (!lsOn(t, C.wallet - .3)) return;
  // slides in from the right, grows on its cue, gets wheels, rolls up, its lid works up and down then opens
  const slide = smooth(clamp((tq - (C.wallet - .3)) / .3));
  const roll = smooth(clamp((tq - C.rolls) / (C.rollEnd - C.rolls)));
  const x = lerp(1120, 790, slide) - 50 * roll;
  const big = lsOn(t, C.big) ? (tq - C.big < .08 ? 1.3 : 1.22) : 1;
  const wh = lsOn(t, C.wheels) ? 1 : 0, y = 630 - wh * 62;
  // lid: hinged at the back edge, stepping up and down on the syllables, then open on the last cue
  const steps = [[C.adjust, .35], [C.adjust + .27, .1], [C.adjust + .54, .55], [C.adjust + .82, .2], [C.lid, 1.25]];
  let lid = 0; for (const [s, v] of steps) if (lsOn(t, s)) lid = v;
  lsScaled(g, x, y, big, () => {
    if (wh) for (const s of [-1, 1]) {
      const cx = x + s * 62, cy = y + 30;
      lsPiece(g, (h) => h.arc(cx, cy, 30, 0, TAU), 'black', '#000');
      g.save(); g.translate(cx, cy); g.rotate(-roll * 7); g.strokeStyle = '#8a8f98'; g.lineWidth = 5; for (let k = 0; k < 3; k++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(-20, 0); g.lineTo(20, 0); g.stroke(); } g.restore();
    }
    // green felt bills inside, seen when the lid lifts
    if (lid > .05) for (let k = 0; k < 4; k++) lsPiece(g, (h) => { h.beginPath(); h.roundRect(x - 80 + k * 38, y - 176 - lid * 26 + (k % 2) * 8, 46, 60, 4); }, 'green', '#245a24', false);
    lsPiece(g, (h) => { h.beginPath(); h.roundRect(x - 105, y - 165, 210, 165, 18); }, 'brown', '#3a1e0a');
    g.strokeStyle = 'rgba(250,230,190,.75)'; g.lineWidth = 3; g.setLineDash([9, 7]); g.beginPath(); g.roundRect(x - 94, y - 154, 188, 143, 12); g.stroke(); g.setLineDash([]);
    // the lid
    g.save(); g.translate(x + 105, y - 165); g.rotate(-lid * .55);
    lsPiece(g, (h) => { h.beginPath(); h.moveTo(0, 0); h.lineTo(-210, 0); h.quadraticCurveTo(-214, 50, -170, 66); h.lineTo(-40, 66); h.quadraticCurveTo(0, 50, 0, 0); h.closePath(); }, 'brown', '#3a1e0a', false);
    lsPiece(g, (h) => h.arc(-105, 56, 11, 0, TAU), 'gold', '#7a5a10', false);
    g.restore();
  });
}
function sceneShop(g, t) {
  const tq = two2(t);
  g.drawImage(LS.boardShop, 0, 0);
  // the house comes in on the hand; the presses turn and the chimney puffs once it's up
  lsCarry(g, t, C.house - .3, 0, 0, (x, y) => { g.save(); g.translate(x, y); lsHouse(g, lsOn(t, C.smoke) ? C.smoke : -1, tq); g.restore(); }, { inT: .36, from: [0, 420], grip: [292, 560], a: -.3 });
  // the order slip, then a red pin stuck in it
  if (lsOn(t, C.slip)) {
    const p = lsPop(t, C.slip);
    lsScaled(g, 316, 520, p, () => {
      g.save(); g.translate(316, 520); g.rotate(-.08);
      lsPiece(g, (h) => { h.beginPath(); h.rect(-30, -38, 60, 76); }, 'white', '#a9a090');
      g.strokeStyle = '#2a2a3a'; g.lineWidth = 3; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-20, -22 + k * 14); for (let x = -20; x <= 18; x += 6) g.lineTo(x, -22 + k * 14 + Math.sin(x * .5 + k) * 2.5); g.stroke(); }
      g.restore();
    });
  }
  if (lsOn(t, C.pin)) lsPiece(g, (h) => h.arc(312, 486, 9, 0, TAU), 'red', '#6a1018', false);
  // the man pops on
  if (lsOn(t, C.man)) { const p = lsPop(t, C.man); lsScaled(g, 400, 630, p, () => lsMan(g, t, tq)); }
  lsWallet(g, t, tq);
}
function sceneStacks(g, t) {
  const tq = two2(t);
  g.drawImage(LS.boardShop, 0, 0);
  const cols = ['red', 'yellow', 'teal', 'orange', 'purple', 'green', 'pink', 'blue'];
  const book = (x, y, k) => lsPiece(g, (h) => { h.beginPath(); h.roundRect(x - 34, y - 18, 68, 18, 3); }, cols[k % cols.length], '#1a1a1a', false);
  // a couple of small stacks, a few more, then millions: stacks all over the board, growing to just under the
  // caption rows (book height 18, ground 646)
  const stacks = [];
  if (lsOn(t, C.couple1)) stacks.push([430, 4], [530, 3]);
  if (lsOn(t, C.hundred)) stacks.push([330, 5], [630, 4], [230, 3]);
  if (lsOn(t, C.couple2)) stacks.push([730, 4], [130, 3]);
  const grow = lsOn(t, C.million) ? clamp((tq - C.million) / (C.stacks + .25 - C.million)) : 0;
  if (lsOn(t, C.million)) for (let k = 0; k < 11; k++) { const x = 80 + k * 80; if (!stacks.some(s => Math.abs(s[0] - x) < 30)) stacks.push([x, 2]); }
  stacks.sort((a, b) => a[0] - b[0]);
  for (const [x, n0] of stacks) {
    const n = Math.round(lerp(n0, 19, grow * (0.75 + .25 * rnd(x, 3))));
    const wob = lsOn(t, C.stacks) ? Math.sin((tq - C.stacks) * 14 + x) * 3 * Math.exp(-(tq - C.stacks) * 2) : 0;
    for (let i = 0; i < n; i++) book(x + (rnd(x, i) - .5) * 8 + wob * i / 10, 646 - i * 18, i + Math.round(x / 80));
  }
}
function lsFeltWord(g, txt, x, y, size, maxW, felt, edge, t, t0, t1) {
  // felt letters, cut one by one: each pops on in turn across the sung word
  const font = 'bold {s}px "Cooper Lt BT", "Cooper Black", Georgia, serif';
  const s = fitText(g, txt, maxW, size, font); g.font = font.replace('{s}', s);
  const w = g.measureText(txt).width; let cx = x - w / 2;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i], cw = g.measureText(ch).width;
    const ti = t0 + (t1 - t0) * .8 * i / Math.max(1, txt.length - 1);
    if (ch !== ' ' && lsOn(t, ti)) {
      const pop = two2(t) - ti < .08 ? 1.12 : 1, rot = (rnd(i, txt.length, 5) - .5) * .12;
      g.save(); g.translate(cx + cw / 2, y); g.rotate(rot); g.scale(pop, pop);
      g.fillStyle = 'rgba(0,0,0,.28)'; g.fillText(ch, -cw / 2 + 2, 4);
      g.fillStyle = g.createPattern(LS.felt[felt], 'repeat'); g.fillText(ch, -cw / 2, 0);
      g.strokeStyle = edge; g.lineWidth = 1.4; g.globalAlpha = .6; g.strokeText(ch, -cw / 2, 0);
      g.restore();
    }
    cx += cw;
  }
}
function lsBook(g, x, y, w, h, t, small) {
  // the book: red felt cover, a yellow border, a darker spine
  lsPiece(g, (q) => { q.beginPath(); q.roundRect(x, y, w, h, 8); }, 'red', '#5a0c14');
  lsPiece(g, (q) => { q.beginPath(); q.rect(x, y, w * .09, h); }, 'mauve', '#5a0c14', false);
  g.strokeStyle = '#f2c230'; g.lineWidth = small ? 4 : 7; g.beginPath(); g.roundRect(x + w * .14, y + h * .05, w * .8, h * .9, 6); g.stroke();
  const t1 = LN2[57].words[1], t2 = LN2[57].words[2];
  lsFeltWord(g, t1.w.toUpperCase(), x + w * .54, y + h * .27, small ? 22 : 50, w * .74, 'cream', '#8a7a50', t, t1.s, t1.e);
  lsFeltWord(g, t2.w.toUpperCase(), x + w * .54, y + h * .45, small ? 30 : 66, w * .6, 'cream', '#8a7a50', t, t2.s, t2.e);
}
function lsDoctor(g, t, tq, x) {
  // the doctor: stork-thin, white coat, a head mirror, a stethoscope, round glasses
  for (const s of [-1, 1]) lsPiece(g, (h) => { h.beginPath(); h.rect(x + s * 14 - 6, 560, 12, 72); }, 'black', '#000', false);
  for (const s of [-1, 1]) lsPiece(g, (h) => { h.beginPath(); h.ellipse(x + s * 20, 634, 20, 8, 0, 0, TAU); }, 'brown', '#3a1e0a', false);
  lsPiece(g, (h) => { h.beginPath(); h.moveTo(x - 34, 380); h.lineTo(x + 34, 380); h.lineTo(x + 52, 574); h.lineTo(x - 52, 574); h.closePath(); }, 'white', '#9a9284');
  lsPiece(g, (h) => { h.beginPath(); h.moveTo(x - 10, 380); h.lineTo(x + 10, 380); h.lineTo(x, 420); h.closePath(); }, 'blue', '#1a3a6a', false);
  g.strokeStyle = '#26232a'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 20, 384); g.quadraticCurveTo(x - 26, 440, x - 4, 456); g.moveTo(x + 20, 384); g.quadraticCurveTo(x + 22, 430, x + 2, 456); g.stroke();
  lsPiece(g, (h) => h.arc(x, 460, 9, 0, TAU), 'grey', '#2a2c30', false);
  lsPiece(g, (h) => { h.beginPath(); h.rect(x - 7, 350, 14, 32); }, 'skin3', '#8a5a30', false);
  lsPiece(g, (h) => { h.beginPath(); h.ellipse(x, 330, 30, 34, 0, 0, TAU); }, 'skin3', '#8a5a30');
  lsPiece(g, (h) => { h.beginPath(); h.ellipse(x, 304, 30, 12, 0, Math.PI, TAU); }, 'grey', '#2a2c30', false);
  g.strokeStyle = '#2a2a2a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 30, 306); g.quadraticCurveTo(x, 296, x + 30, 306); g.stroke();
  lsPiece(g, (h) => h.arc(x + 4, 306, 13, 0, TAU), 'grey', '#2a2c30', false);
  g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(x + 1, 303, 5, 0, TAU); g.fill();
  for (const s of [-1, 1]) { g.strokeStyle = '#1a1a1a'; g.lineWidth = 2.5; g.beginPath(); g.arc(x + s * 12, 334, 9, 0, TAU); g.stroke(); g.fillStyle = '#121014'; g.beginPath(); g.arc(x + s * 12, 335, 3.5, 0, TAU); g.fill(); }
  g.beginPath(); g.moveTo(x - 3, 334); g.lineTo(x + 3, 334); g.stroke();
  g.strokeStyle = '#5a1a1a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 9, 352); g.quadraticCurveTo(x, 357, x + 9, 352); g.stroke();
}
function sceneBook(g, t) {
  const tq = two2(t);
  g.drawImage(LS.boardPlain, 0, 0);
  // the book comes in on the hand, the title cut in felt letter by letter, then the doctor and his diploma
  lsCarry(g, t, C.book, 110, 290, (x, y) => lsBook(g, x, y, 360, 400, t, false), { inT: .5, from: [110, 760], grip: [372, 330], a: -.4 });
  // the doctor's scribble on the cover (the intro): a felt-tip line that grows on twos while he writes
  let pen = null;
  if (lsOn(t, C.wrote)) {
    const pts = []; for (let k = 0; k <= 46; k++) { const u = k / 46; pts.push([170 + (u > .5 ? u - .5 : u) * 2 * 250 + Math.sin(u * 40) * 6, 560 + (u > .5 ? 34 : 0) + Math.cos(u * 36) * 9]); }
    const n = Math.floor(clamp((tq - C.wrote) / (C.intro + .3 - C.wrote)) * (pts.length - 1)) + 1;
    g.strokeStyle = '#141018'; g.lineWidth = 4.5; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
    pts.slice(0, n).forEach(([px, py], i) => (i && i !== 24) ? g.lineTo(px, py) : g.moveTo(px, py)); g.stroke();
    pen = pts[n - 1];
  }
  if (lsOn(t, C.doctor - .3)) {
    const slide = smooth(clamp((tq - (C.doctor - .3)) / .3)), dx = lerp(1060, 690, slide);
    const writing = tq >= C.wrote - .25 && tq < C.intro + .45;
    // right arm: holding the pen toward the cover while he writes
    if (writing) {
      const [px, py] = pen || [170, 560];
      g.strokeStyle = '#26232a'; g.lineWidth = 22 + 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(dx - 30, 400); g.quadraticCurveTo(dx - 120, 470, px + 18, py - 8); g.stroke();
      g.strokeStyle = '#f4efe4'; g.lineWidth = 22; g.stroke();
      lsPiece(g, (h) => { h.beginPath(); h.moveTo(px, py); h.lineTo(px + 26, py - 40); h.lineTo(px + 36, py - 34); h.lineTo(px + 6, py + 4); h.closePath(); }, 'blue', '#1a3a6a', false);
      lsPiece(g, (h) => wobblyCircle(h, px + 22, py - 14, 14, 9, 1), 'skin3', '#8a5a30', false);
    }
    lsDoctor(g, t, tq, dx);
    // left arm up with the diploma once it's his
    const dip = lsOn(t, C.phd);
    g.strokeStyle = '#9a9284'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(dx + 30, 400); g.quadraticCurveTo(dx + 70, dip ? 380 : 470, dx + (dip ? 76 : 54), dip ? 330 : 540); g.stroke();
    g.strokeStyle = '#f4efe4'; g.lineWidth = 20; g.stroke();
    if (dip) {
      const p = lsPop(t, C.phd);
      lsScaled(g, dx + 120, 316, p, () => {
        lsPiece(g, (h) => { h.beginPath(); h.roundRect(dx + 40, 290, 160, 64, 8); }, 'cream', '#8a7a50');
        lsPiece(g, (h) => { h.beginPath(); h.ellipse(dx + 40, 322, 10, 32, 0, 0, TAU); h.moveTo(dx + 210, 322); h.ellipse(dx + 200, 322, 10, 32, 0, 0, TAU); }, 'tan', '#8a5a30', false);
        const w = LN2[58].words[7];
        lsFeltWord(g, w.w.toUpperCase(), dx + 120, 340, 40, 120, 'red', '#5a0c14', t, w.s, w.s + .02);
      });
    }
    lsPiece(g, (h) => wobblyCircle(h, dx + (dip ? 76 : 54), dip ? 324 : 546, 14, 8, 1), 'skin3', '#8a5a30', false);
  }
  // the price tag swings on from the cover's corner
  if (lsOn(t, C.free)) {
    const u = tq - C.free, sw = Math.exp(-u * 2.2) * Math.cos(u * 9) * .5 + (u < .09 ? -.5 : 0);
    const w = LN2[59].words[9];
    g.save(); g.translate(458, 304); g.rotate(-.5 + sw);
    g.strokeStyle = '#f4efe4'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 46); g.stroke();
    lsPiece(g, (h) => { h.beginPath(); h.moveTo(-14, 46); h.lineTo(14, 46); h.lineTo(70, 66); h.lineTo(70, 136); h.lineTo(-70, 136); h.lineTo(-70, 66); h.closePath(); }, 'yellow', '#8a6a10');
    g.fillStyle = '#2a1a10'; g.beginPath(); g.arc(0, 58, 5, 0, TAU); g.fill();
    lsFeltWord(g, w.w.toUpperCase(), 0, 118, 44, 120, 'red', '#5a0c14', t, w.s, w.s + .02);
    g.restore();
  }
}
// the open book: two white felt pages on the board
function lsSpread(g) {
  lsPiece(g, (h) => { h.beginPath(); h.roundRect(52, 286, 856, 420, 12); }, 'red', '#5a0c14');
  for (const [x0, x1] of [[70, 478], [482, 890]]) lsPiece(g, (h) => { h.beginPath(); h.moveTo(x0, 300); h.quadraticCurveTo((x0 + x1) / 2, 292, x1, 300); h.lineTo(x1, 690); h.quadraticCurveTo((x0 + x1) / 2, 682, x0, 690); h.closePath(); }, 'white', '#a9a090', false);
  g.strokeStyle = 'rgba(120,100,80,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(480, 296); g.lineTo(480, 692); g.stroke();
}
function lsBun(g, x, y, top) {
  if (top) { lsPiece(g, (h) => { h.beginPath(); h.moveTo(x - 100, y); h.quadraticCurveTo(x - 100, y - 76, x, y - 78); h.quadraticCurveTo(x + 100, y - 76, x + 100, y); h.closePath(); }, 'tan', '#7a4a1a');
    g.fillStyle = '#fff3d2'; for (const [sx, sy] of [[-40, -40], [0, -56], [38, -42], [-12, -26], [20, -24]]) { g.beginPath(); g.ellipse(x + sx, y + sy, 7, 4, .4, 0, TAU); g.fill(); } }
  else lsPiece(g, (h) => { h.beginPath(); h.moveTo(x - 96, y); h.lineTo(x + 96, y); h.quadraticCurveTo(x + 96, y + 40, x, y + 42); h.quadraticCurveTo(x - 96, y + 40, x - 96, y); h.closePath(); }, 'tan', '#7a4a1a');
}
function lsHeart(g, x, y, s, stern) {
  g.save(); g.translate(x, y); g.scale(s, s);
  lsPiece(g, (h) => { h.beginPath(); h.moveTo(0, 70); h.bezierCurveTo(-110, 0, -70, -86, 0, -40); h.bezierCurveTo(70, -86, 110, 0, 0, 70); h.closePath(); }, 'red', '#5a0c14');
  for (const sd of [-1, 1]) { g.fillStyle = '#121014'; g.beginPath(); g.arc(sd * 22, -12, 7, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(sd * 22 - 2, -14, 2, 0, TAU); g.fill(); }
  g.strokeStyle = '#2a0a10'; g.lineWidth = 4; g.lineCap = 'round';
  if (stern) { for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 34, -32); g.lineTo(sd * 12, -24); g.stroke(); } g.beginPath(); g.moveTo(-14, 18); g.lineTo(14, 18); g.stroke(); }
  else { g.beginPath(); g.arc(0, 8, 14, .2 * Math.PI, .8 * Math.PI); g.stroke(); }
  g.restore();
}
function lsGlass(g, x, y, fill, drink) {
  // a drinking glass: pale outline, the drink inside rises with fill
  const top = y - 150, h = 150;
  if (fill > 0) lsPiece(g, (q) => { q.beginPath(); const ft = y - h * fill * .9; q.moveTo(x - 46 + (1 - fill) * 2, ft); q.lineTo(x + 46 - (1 - fill) * 2, ft); q.lineTo(x + 38, y - 4); q.lineTo(x - 38, y - 4); q.closePath(); }, drink, '#1a2a4a', false);
  g.strokeStyle = 'rgba(220,240,255,.95)'; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x - 50, top); g.lineTo(x - 40, y); g.lineTo(x + 40, y); g.lineTo(x + 50, top); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 32, top + 20); g.lineTo(x - 26, y - 20); g.stroke();
}
function lsCup(g, x, y, fill, tq, fizzT) {
  // a generic paper cup: cream with orange bands, a bendy straw; dark fizzy drink once it fills
  if (fill > 0) { lsPiece(g, (q) => { q.beginPath(); q.ellipse(x, y - 160, 54, 12, 0, 0, TAU); }, 'cola', '#000', false); }
  lsPiece(g, (q) => { q.beginPath(); q.moveTo(x - 58, y - 160); q.lineTo(x + 58, y - 160); q.lineTo(x + 44, y); q.lineTo(x - 44, y); q.closePath(); }, 'cream', '#8a7a50');
  g.save(); g.beginPath(); g.moveTo(x - 58, y - 160); g.lineTo(x + 58, y - 160); g.lineTo(x + 44, y); g.lineTo(x - 44, y); g.closePath(); g.clip();
  g.fillStyle = '#ee8a2a'; g.fillRect(x - 70, y - 118, 140, 22); g.fillStyle = '#f2c230'; g.fillRect(x - 70, y - 90, 140, 10); g.restore();
  if (fill > 0) {
    g.strokeStyle = '#121014'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 10, y - 160); g.lineTo(x + 22, y - 230); g.lineTo(x + 50, y - 246); g.stroke();
    g.strokeStyle = '#3d8bd9'; g.lineWidth = 6; g.stroke();
    // fizz: white felt bubbles hopping up out of the top, on twos
    for (let k = 0; k < 8; k++) { const u = ((tq - fizzT) * 1.4 + k / 8) % 1; const bx = x - 34 + (k * 23) % 70, by = y - 166 - u * 70; if (by < 290) continue; lsPiece(g, (q) => q.arc(bx, by, 5 + (k % 3) * 2, 0, TAU), 'white', '#a9a090', false); }
  }
}
function sceneEat(g, t) {
  const tq = two2(t);
  g.drawImage(LS.boardPlain, 0, 0);
  lsSpread(g);
  if (t < C.l61 - .08) {
    // left page: the bun, the lettuce slapped on, the top bun dropped on; the pointer taps the lettuce
    lsBun(g, 275, 600, false);
    if (lsOn(t, C.lettuce)) { const p = lsPop(t, C.lettuce); lsScaled(g, 275, 590, p, () => lsPiece(g, (h) => { h.beginPath(); h.moveTo(160, 600); for (let k = 0; k <= 12; k++) h.lineTo(160 + k * 19, 588 - (k % 2 ? 22 : 4)); h.lineTo(392, 604); h.quadraticCurveTo(275, 620, 160, 600); h.closePath(); }, 'lettuce', '#2a5a1a')); }
    if (lsOn(t, C.bun - .2)) { const u = clamp((tq - (C.bun - .2)) / .2); lsBun(g, 275, lerp(380, 584, u * u), true); }
    if (lsOn(t, C.lettuce) && tq < C.bun + .4) {
      const tap = Math.max(0, Math.sin((tq - C.lettuce) * 18)) * 12;
      g.strokeStyle = '#3a2410'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, 760); g.lineTo(250 - tap, 584 - tap * .6); g.stroke();
      g.strokeStyle = '#b98650'; g.lineWidth = 5; g.stroke();
      g.fillStyle = '#e8e0d0'; g.beginPath(); g.arc(252 - tap, 583 - tap * .6, 6, 0, TAU); g.fill();
    }
    // right page: a felt heart that turns stern on its cue and wags
    if (lsOn(t, C.health)) { const p = lsPop(t, C.health), stern = lsOn(t, C.joke); const wag = stern ? Math.sin((tq - C.joke) * 16) * .12 * Math.exp(-(tq - C.joke) * 1.5) : 0;
      g.save(); g.translate(685, 520); g.rotate(wag); lsHeart(g, 0, 0, 1.25 * p, stern); g.restore(); }
  } else {
    // the page turns: a glass of water, then a paper cup that a drop of water hops into, then it fills dark and fizzes
    const water = lsOn(t, C.water1) ? clamp((tq - C.water1) / .34) : 0;
    { const p = lsPop(t, LN2[61].words[2].s); if (p) lsScaled(g, 275, 640, p, () => lsGlass(g, 275, 640, water, 'blue')); }
    const cupOn = lsOn(t, LN2[61].words[5].s);
    const cola = lsOn(t, C.coke) ? 1 : 0;
    if (cupOn) { const p = lsPop(t, LN2[61].words[5].s); lsScaled(g, 685, 640, p, () => lsCup(g, 685, 640, cola, tq, C.coke)); }
    if (lsOn(t, C.water2 - .1)) { const u = clamp((tq - (C.water2 - .1)) / .5); if (u < 1) lsPiece(g, (h) => { const x = lerp(290, 680, u), y = lerp(520, 480, u) - Math.sin(u * Math.PI) * 150; h.beginPath(); h.moveTo(x, y - 20); h.quadraticCurveTo(x + 14, y, x + 11, y + 6); h.arc(x, y + 6, 11, 0, Math.PI); h.quadraticCurveTo(x - 14, y, x, y - 20); h.closePath(); }, 'blue', '#1a3a6a'); }
    // the page flip: a white page sweeping across the spread for three frames
    const fu = (tq - (C.l61 - .08)) / .25;
    if (fu >= 0 && fu < 1) { const x = lerp(890, 70, fu); lsPiece(g, (h) => { h.beginPath(); h.moveTo(480, 300); h.quadraticCurveTo((480 + x) / 2, 250, x, 310); h.lineTo(x, 680); h.quadraticCurveTo((480 + x) / 2, 700, 480, 690); h.closePath(); }, 'white', '#a9a090'); }
  }
}
function lsPerson(g, x, y, k, o) {
  const P = [{ body: 'orange', skin: 'skin', hair: 'brown' }, { body: 'teal', skin: 'skin2', hair: 'black' }, { body: 'purple', skin: 'skin3', hair: 'yellow' }, { body: 'yellow', skin: 'skin', hair: 'red' }][k];
  const bob = o.bounce ? -Math.abs(Math.sin(o.bounce * 9 + k)) * 10 * Math.exp(-o.bounce * 1.5) : 0;
  g.save(); g.translate(0, bob);
  for (const s of [-1, 1]) lsPiece(g, (h) => { h.beginPath(); h.rect(x + s * 14 - 8, y + 100, 16, 50); }, 'blue', '#1a3a6a', false);
  lsPiece(g, (h) => { h.beginPath(); h.roundRect(x - 36, y + 10, 72, 100, 24); }, P.body, '#2a2a2a');
  if (P.hair === 'yellow' || P.hair === 'red') lsPiece(g, (h) => { h.beginPath(); h.ellipse(x, y - 34, 40, 38, 0, 0, TAU); }, P.hair, '#3a2a10', false);
  lsPiece(g, (h) => wobblyCircle(h, x, y - 26, 32, 20 + k, 1), P.skin, '#7a4a30');
  if (P.hair === 'brown' || P.hair === 'black') lsPiece(g, (h) => { h.beginPath(); h.arc(x, y - 30, 33, Math.PI * 1.05, Math.PI * 1.95); h.quadraticCurveTo(x, y - 44, x - 31, y - 40); h.closePath(); }, P.hair, '#1a1a1a', false);
  for (const s of [-1, 1]) { g.fillStyle = '#121014'; g.beginPath(); g.arc(x + s * 11, y - 30, 4.5, 0, TAU); g.fill(); }
  g.strokeStyle = '#5a1a1a'; g.lineWidth = 3.5; g.lineCap = 'round'; g.beginPath();
  if (o.smile) g.arc(x, y - 18, 13, .15 * Math.PI, .85 * Math.PI); else { g.moveTo(x - 8, y - 12); g.lineTo(x + 8, y - 12); }
  g.stroke();
  // a fry carton in one mitten once they've ordered
  if (o.fries) { lsScaled(g, x + 40, y + 50, o.fries, () => lsFries(g, x + 44, y + 64, .7)); }
  lsPiece(g, (h) => wobblyCircle(h, x + 40, y + 70, 12, 30 + k, 1), P.skin, '#7a4a30', false);
  g.restore();
}
function lsFries(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  for (let i = -3; i <= 3; i++) lsPiece(g, (h) => { h.beginPath(); h.rect(i * 10 - 4, -76 + Math.abs(i) * 6, 9, 50); }, 'yellow', '#8a6a10', false);
  lsPiece(g, (h) => { h.beginPath(); h.moveTo(-38, -40); h.lineTo(38, -40); h.lineTo(28, 30); h.lineTo(-28, 30); h.closePath(); }, 'red', '#5a0c14', false);
  g.restore();
}
function scenePeople(g, t) {
  const tq = two2(t);
  g.drawImage(LS.boardPeople, 0, 0);
  // the book, small, up on the right; a felt stamp slides in and stamps it; a gold star
  lsBook(g, 690, 300, 200, 250, t, true);
  if (lsOn(t, C.legit)) {
    const w = LN2[63].words[5];
    g.save(); g.translate(796, 470); g.rotate(-.22);
    lsPiece(g, (h) => { h.beginPath(); h.roundRect(-84, -30, 168, 60, 6); }, 'white', '#a9a090', false);
    lsFeltWord(g, w.w.toUpperCase(), 0, 20, 44, 150, 'red', '#5a0c14', t, w.s, w.s + .02);
    g.restore();
    if (lsOn(t, C.legit + .17)) { const p = lsPop(t, C.legit + .17); lsScaled(g, 870, 320, p, () => lsPiece(g, (h) => star(h, 870, 320, 40, 18, 5), 'gold', '#7a5a10')); }
  }
  if (lsOn(t, C.print) && tq < C.legit + .5) {
    const inU = smooth(clamp((tq - C.print) / (C.legit - .1 - C.print))), down = tq >= C.legit - .02 && tq < C.legit + .2 ? 1 : 0;
    const x = lerp(1060, 800, inU), y = 382 + down * 40 - (tq >= C.legit + .2 ? smooth(clamp((tq - C.legit - .2) / .2)) * 120 : 0);
    lsPiece(g, (h) => { h.beginPath(); h.roundRect(x - 20, y - 118, 40, 76, 14); }, 'brown', '#3a1e0a');
    lsPiece(g, (h) => { h.beginPath(); h.ellipse(x, y - 122, 34, 16, 0, 0, TAU); }, 'brown', '#3a1e0a', false);
    lsPiece(g, (h) => { h.beginPath(); h.roundRect(x - 80, y - 46, 160, 40, 6); }, 'grey', '#2a2c30');
    lsPiece(g, (h) => { h.beginPath(); h.rect(x - 76, y - 8, 152, 12); }, 'red', '#5a0c14', false);
  }
  // the people, one after another, smile on their cue; little felt hearts rise
  const ppl = [[300, 480], [420, 470], [540, 482], [660, 476]];
  ppl.forEach(([x, y], k) => {
    const t0 = C.people - .08 + k * .085; if (!lsOn(t, t0)) return;
    const p = lsPop(t, t0), fr = lsOn(t, C.ordered + k * .085) ? lsPop(t, C.ordered + k * .085) : 0;
    lsScaled(g, x, y + 150, p, () => lsPerson(g, x, y, k, { smile: lsOn(t, C.felt), bounce: lsOn(t, C.felt) ? tq - C.felt : 0, fries: fr }));
  });
  if (lsOn(t, C.good)) ppl.forEach(([x, y], k) => { const u = clamp((tq - C.good - k * .06) / .5); if (u <= 0) return; lsHeart(g, x + 18, y - 82 - u * 80, .26, false); });
  // more fries: cartons pile up on the counter in front of them
  if (lsOn(t, C.fries)) { const n = Math.min(9, 1 + Math.floor((tq - C.fries) * 12 / 1.5)); for (let k = 0; k < n; k++) lsFries(g, 300 + (k % 5) * 80 + (k >= 5 ? 40 : 0), 686 - (k >= 5 ? 44 : 0), .62); }
  // the tip jar: glass with a tin lid and a slot, empty; a felt fly circles it
  if (lsOn(t, C.never)) {
    const p = lsPop(t, C.never);
    lsScaled(g, 820, 690, p, () => {
      g.fillStyle = 'rgba(200,230,255,.28)'; g.beginPath(); g.moveTo(770, 586); g.lineTo(770, 688); g.quadraticCurveTo(820, 702, 870, 688); g.lineTo(870, 586); g.closePath(); g.fill();
      g.strokeStyle = '#1b2a44'; g.lineWidth = 9; g.lineJoin = 'round'; g.stroke();
      g.strokeStyle = 'rgba(235,248,255,.95)'; g.lineWidth = 4; g.stroke();
      lsPiece(g, (h) => h.roundRect(762, 566, 116, 24, 6), 'grey', '#2a2c30', false);
      g.fillStyle = '#121216'; g.fillRect(806, 572, 28, 6);
      g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 5; g.beginPath(); g.moveTo(786, 604); g.lineTo(786, 672); g.stroke();
    });
  }
  if (lsOn(t, C.tip)) {
    const a = (tq - C.tip) * 9, fx = 820 + Math.cos(a) * 84, fy = 530 + Math.sin(a) * 26;
    g.strokeStyle = 'rgba(20,20,30,.7)'; g.lineWidth = 3; g.setLineDash([6, 6]); g.beginPath(); g.ellipse(820, 530, 84, 26, 0, a - 1.8, a - .25); g.stroke(); g.setLineDash([]);
    for (const s of [-1, 1]) lsPiece(g, (h) => h.ellipse(fx + s * 12, fy - 14, 13, 8, s * .5, 0, TAU), 'white', '#7a7a7a', false);
    lsPiece(g, (h) => h.ellipse(fx, fy, 16, 11, 0, 0, TAU), 'black', '#000', false);
    g.fillStyle = '#c8303c'; for (const s of [-1, 1]) { g.beginPath(); g.arc(fx + 12, fy + s * 5, 3.5, 0, TAU); g.fill(); }
  }
}
// The lesson program at time t (960x720): which board is up, the studio camera's small creeps and bumps.
function drawLesson(g, t) {
  const sc = t < C.l52 - .12 ? 0 : t < C.couple1 - .1 ? 1 : t < C.l56 - .12 ? 2 : t < W2(60, 2) - .04 ? 3 : t < C.l62 - .05 ? 4 : 5;
  const starts = [S7[0], C.l52 - .12, C.couple1 - .1, C.l56 - .12, W2(60, 2) - .04, C.l62 - .05];
  const bump = lsBump(t, [C.tons, C.big, C.lid, C.legit]) * 4;
  const creep = 1 + .025 * clamp((t - starts[sc]) / 6);
  g.save();
  g.translate(480, 500 + bump); g.scale(creep, creep); g.translate(-480, -500);
  [sceneInk, sceneShop, sceneStacks, sceneBook, sceneEat, scenePeople][sc](g, t);
  g.restore();
  g.drawImage(LS.light, 0, 0);
}
