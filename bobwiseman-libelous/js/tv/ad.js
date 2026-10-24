// The commercial: 1970s cel animation. Flat bright paint, one thick ink line, characters animated on twos
// over painted backgrounds, shot on film (gate weave, dust). A generic clown: white face, BLUE ruffled collar,
// PURPLE pointed hat, green-and-white diamond suit, pink nose, no hair. No arches, no letter M, no name.
const INK = '#1b1530';
const PAL = { teal: '#1fa6a0', avocado: '#9bb53c', orange: '#f08a24', mustard: '#e8b630', pink: '#ff5d8f', cream: '#fff1c9', brown: '#6b3f1e', sky: '#79c7e3', purple: '#7b4bb5', navy: INK, blue: '#3d8bd9', lblue: '#8cc4f2', green: '#3fae5a', white: '#fbfaf4', lime: '#b5d334' };
const AD = {};
const two = (t) => Math.floor(t * 12 + 1e-6) / 12;   // animate on twos
function cel(g, fill, lw = 5) { g.fillStyle = fill; g.fill(); g.strokeStyle = INK; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
function ell(g, x, y, rx, ry, a = 0) { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, TAU); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); }
function mitten(g, x, y, r, a, fill = PAL.white) {
  g.save(); g.translate(x, y); g.rotate(a);
  g.beginPath(); g.ellipse(0, 0, r, r * .86, 0, 0, TAU); cel(g, fill, 4);
  g.beginPath(); g.ellipse(-r * .55, -r * .7, r * .38, r * .28, -.6, 0, TAU); cel(g, fill, 4);
  g.restore();
}
function tube(g, pts, w, fill) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.strokeStyle = INK; g.lineWidth = w + 10; g.stroke(); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
}
function sparkle(g, x, y, r, a = 1) { g.save(); g.globalAlpha = a; star(g, x, y, r, r * .28, 4); cel(g, '#ffffff', 3); g.restore(); }

// ---------- painted backgrounds (prebaked) ----------
function initAd() {
  // store: 70s supergraphic stripes, a pictogram menu board, a teal counter with chrome trim
  let c = mkCanvas(960, 720), g = c.getContext('2d');
  g.fillStyle = '#fbe3b8'; g.fillRect(0, 0, 960, 720);
  g.save(); g.translate(0, 120); g.rotate(-.32);
  [[PAL.orange, 0], [PAL.mustard, 34], [PAL.brown, 68]].forEach(([col, o]) => { g.fillStyle = col; g.fillRect(-200, 120 + o, 1500, 30); });
  g.restore();
  paintStrokes(g, 0, 0, 960, 330, '#c48a4a', 70, 211, .14, 60);
  g.fillStyle = '#4a2a14'; g.beginPath(); g.roundRect(250, 70, 460, 150, 14); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  for (let k = 0; k < 3; k++) {
    const x = 270 + k * 148; g.fillStyle = '#fff6dc'; g.beginPath(); g.roundRect(x, 88, 128, 114, 10); g.fill(); g.lineWidth = 4; g.stroke();
    g.save(); g.translate(x + 64, 145);
    if (k === 0) drawBurger(g, 0, 0, 1.0, 0);
    if (k === 1) { g.beginPath(); g.moveTo(-26, -6); g.lineTo(26, -6); g.lineTo(18, 40); g.lineTo(-18, 40); g.closePath(); cel(g, PAL.pink, 4); for (let i = -2; i <= 2; i++) { g.beginPath(); g.rect(i * 9 - 3, -36 + Math.abs(i) * 5, 7, 32); cel(g, PAL.mustard, 3); } }
    if (k === 2) { g.beginPath(); g.moveTo(-22, -30); g.lineTo(22, -30); g.lineTo(16, 40); g.lineTo(-16, 40); g.closePath(); cel(g, PAL.teal, 4); g.beginPath(); g.moveTo(6, -30); g.lineTo(16, -54); cel(g, PAL.white, 4); ell(g, 0, -30, 22, 6); cel(g, PAL.white, 4); }
    g.restore();
  }
  g.fillStyle = '#d7dde0'; g.fillRect(0, 318, 960, 22); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(-5, 318, 970, 22);
  g.fillStyle = PAL.teal; g.fillRect(0, 340, 960, 380); g.strokeRect(-5, 340, 970, 385);
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 4; for (let x = 20; x < 960; x += 46) { g.beginPath(); g.moveTo(x, 346); g.lineTo(x, 720); g.stroke(); }
  paintStrokes(g, 0, 340, 960, 380, '#0d6a66', 50, 212, .2, 50);
  AD.store = c;
  // party room: flower-power wallpaper, crepe-paper swags
  c = mkCanvas(960, 720); g = c.getContext('2d');
  g.fillStyle = '#fff1c9'; g.fillRect(0, 0, 960, 720);
  const R = mulberry(501);
  for (let y = 30; y < 720; y += 110) for (let x = (y / 110 % 2) * 60; x < 1000; x += 120) {
    const col = [PAL.orange, PAL.mustard, PAL.pink, PAL.avocado][Math.floor(R() * 4)];
    g.save(); g.translate(x, y); g.rotate(R());
    for (let p = 0; p < 5; p++) { g.rotate(TAU / 5); ell(g, 0, -20, 12, 18); g.fillStyle = col; g.fill(); }
    circ(g, 0, 0, 10); g.fillStyle = PAL.brown; g.fill(); g.restore();
  }
  paintStrokes(g, 0, 0, 960, 720, '#c9a46a', 60, 503, .12, 60);
  for (const [col, y0] of [[PAL.pink, 0], [PAL.teal, 18]]) { g.strokeStyle = col; g.lineWidth = 12; g.beginPath(); for (let x = -40; x < 1000; x += 160) { g.moveTo(x, y0 + 10); g.quadraticCurveTo(x + 80, y0 + 70, x + 160, y0 + 10); } g.stroke(); }
  AD.party = c;
}

// ---------- characters ----------
function drawBurger(g, x, y, s, bite = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (bite) { g.beginPath(); g.rect(-60, -60, 120, 120); g.arc(30, -14, 18 * bite, 0, TAU, true); g.clip(); }
  g.beginPath(); g.moveTo(-34, 10); g.quadraticCurveTo(0, 26, 34, 10); g.lineTo(32, 18); g.quadraticCurveTo(0, 34, -32, 18); g.closePath(); cel(g, '#e0a050', 3.5);
  g.beginPath(); g.roundRect(-36, -2, 72, 13, 6); cel(g, '#6b3a1e', 3.5);
  g.beginPath(); for (let i = 0; i <= 8; i++) g.lineTo(-36 + i * 9, -4 + (i % 2) * 6); g.lineTo(36, 2); g.lineTo(-36, 2); g.closePath(); cel(g, PAL.lime, 3);
  g.beginPath(); g.moveTo(-34, -4); g.quadraticCurveTo(-34, -34, 0, -34); g.quadraticCurveTo(34, -34, 34, -4); g.closePath(); cel(g, '#eda955', 3.5);
  g.fillStyle = '#fff6dc'; for (const [sx, sy] of [[-14, -22], [0, -27], [14, -21], [-6, -15], [9, -12]]) { ell(g, sx, sy, 2.6, 1.6, .4); g.fill(); }
  g.restore();
}
// o: {arm, armA, wink, burger, squash:[sx,sy], baton, lean}
function drawClown(g, x, y, s, o = {}) {
  const [sx, sy] = o.squash || [1, 1];
  g.save(); g.translate(x, y); g.scale(s * sx, s * sy); g.rotate(o.lean || 0);
  // legs and body: green-and-white diamond suit
  const body = (h) => { h.beginPath(); h.moveTo(-46, 4); h.lineTo(46, 4); h.lineTo(64, 170); h.lineTo(-64, 170); h.closePath(); };
  body(g); g.fillStyle = PAL.white; g.fill();
  g.save(); body(g); g.clip(); g.fillStyle = PAL.green;
  for (let row = 0; row < 7; row++) for (let col = -4; col <= 4; col++) { const cx = col * 30 + (row % 2) * 15, cy = row * 30; g.beginPath(); g.moveTo(cx, cy - 15); g.lineTo(cx + 15, cy); g.lineTo(cx, cy + 15); g.lineTo(cx - 15, cy); g.closePath(); if ((row + col) % 2 === 0) g.fill(); }
  g.restore();
  body(g); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  for (const by of [40, 82, 124]) { circ(g, 0, by, 9); cel(g, PAL.blue, 4); }
  // arms: shoulder -> elbow -> hand, angles in canvas space (0 = right, +pi/2 = down)
  const P = Math.PI, tw = two(o.t || 0);
  const poses = {
    none: [[P * .62, P * .55], [P * .38, P * .45]],
    wave: [[-P * .78 + Math.sin(tw * 9) * .2, -P * .58 + Math.sin(tw * 9) * .45], [P * .38, P * .45]],
    present: [[P * .66, P * .2], [-.12, -.32]],
    conduct: [[P * .62, P * .55], [-P * .22 + (o.armA || 0), -P * .5 + (o.armA || 0) * 1.6]],
  };
  const pose = poses[o.arm || 'none'] || poses.none;
  [[-44, 22], [44, 22]].forEach(([ax, ay], i) => {
    const [a1, a2] = pose[i];
    const el = [ax + 46 * Math.cos(a1), ay + 46 * Math.sin(a1)], hd = [el[0] + 44 * Math.cos(a2), el[1] + 44 * Math.sin(a2)];
    tube(g, [[ax, ay], el, hd], 22, PAL.green);
    circ(g, hd[0], hd[1], 13); cel(g, PAL.lblue, 3.5);
    if (o.arm === 'conduct' && i === 1) {
      const bx = hd[0] + 44 * Math.cos(a2 - .5), by = hd[1] + 44 * Math.sin(a2 - .5);
      g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(hd[0], hd[1]); g.lineTo(bx, by); g.stroke();
      g.strokeStyle = PAL.white; g.lineWidth = 3; g.stroke();
    }
    if (o.arm === 'present' && i === 1 && o.burger) { drawBurger(g, hd[0] + 30, hd[1] - 16, 1.0, 0); mitten(g, hd[0] + 6, hd[1], 15, .3); }
    else mitten(g, hd[0], hd[1], 15, i ? .4 : -.4);
  });
  // ruffled blue collar
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; circ(g, Math.cos(a) * 46, 2 + Math.sin(a) * 12, 15); cel(g, k % 2 ? PAL.blue : PAL.lblue, 3.5); }
  // white face
  ell(g, 0, -56, 46, 50); cel(g, PAL.white, 5);
  // eyes and arched brows
  for (const sd of [-1, 1]) {
    const wink = o.wink && sd === 1;
    g.strokeStyle = INK; g.lineWidth = 4.5; g.beginPath(); g.arc(sd * 17, -82, 12, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    if (wink) { g.beginPath(); g.arc(sd * 17, -66, 8, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    else { ell(g, sd * 17, -66, 6, 9); g.fillStyle = INK; g.fill(); circ(g, sd * 17 - 2, -69, 2); g.fillStyle = '#fff'; g.fill(); }
  }
  circ(g, -30, -44, 9); g.fillStyle = 'rgba(255,120,160,.55)'; g.fill(); circ(g, 30, -44, 9); g.fill();
  // smile with a pink tongue, pink ball nose
  g.beginPath(); g.moveTo(-26, -36); g.quadraticCurveTo(0, -6, 26, -36); g.quadraticCurveTo(0, -22, -26, -36); cel(g, '#4a1630', 4);
  ell(g, 0, -24, 9, 4); g.fillStyle = PAL.pink; g.fill();
  circ(g, 0, -50, 11); cel(g, PAL.pink, 4); circ(g, -3, -53, 3); g.fillStyle = '#fff'; g.fill();
  // purple pointed hat with white pompoms
  g.beginPath(); g.moveTo(-36, -96); g.quadraticCurveTo(-8, -150, 10, -206); g.quadraticCurveTo(30, -150, 38, -96); g.closePath(); cel(g, PAL.purple, 5);
  g.beginPath(); g.ellipse(1, -96, 40, 9, 0, 0, TAU); cel(g, '#a37ad8', 4);
  circ(g, 10, -208, 11); cel(g, PAL.white, 4); circ(g, 4, -130, 7); cel(g, PAL.white, 3.5); circ(g, 8, -160, 6); cel(g, PAL.white, 3.5);
  g.restore();
}
const KIDS = [
  { skin: '#ffdbac', hair: '#2a1a12', style: 'pigtails', shirt: PAL.orange },
  { skin: '#8d5524', hair: '#1a1210', style: 'afro', shirt: PAL.mustard },
  { skin: '#f1c27d', hair: '#e8d27a', style: 'bob', shirt: PAL.pink },
  { skin: '#c68642', hair: '#2a1a12', style: 'cap', shirt: PAL.avocado },
];
const SAME = { skin: '#ffd2a8', hair: '#7a4520', style: 'bowl', shirt: 'stripes' };
// origin at the neck. o: {grin, burger: 0|1, bite, eatU, hat, crown, wave}
function drawKid(g, x, y, s, k, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  // body
  g.beginPath(); g.roundRect(-30, 0, 60, 80, 18);
  if (k.shirt === 'stripes') { g.fillStyle = PAL.white; g.fill(); g.save(); g.clip(); g.fillStyle = PAL.blue; for (let yy = 6; yy < 80; yy += 16) g.fillRect(-40, yy, 80, 8); g.restore(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
  else cel(g, k.shirt);
  // arms
  const up = o.wave ? -1 : 0;
  if (o.burger) {
    const eu = o.eatU || 0;   // 0 holding at chest, 1 at the mouth
    const hx = 18, hy = lerp(38, -14, eu);
    tube(g, [[24, 12], [34, 30], [hx, hy]], 13, k.shirt === 'stripes' ? PAL.blue : k.shirt);
    drawBurger(g, hx - 6, hy - 10, .62, o.bite || 0);
    mitten(g, hx + 4, hy + 2, 9, .3, k.skin);
    tube(g, [[-24, 12], [-34, 40], [-26, 62]], 13, k.shirt === 'stripes' ? PAL.blue : k.shirt); mitten(g, -26, 64, 9, 0, k.skin);
  } else {
    for (const sd of [-1, 1]) { const hy = up && sd === 1 ? -40 : 62; tube(g, [[sd * 24, 12], [sd * 36, up && sd === 1 ? -10 : 36], [sd * 30, hy]], 13, k.shirt === 'stripes' ? PAL.blue : k.shirt); mitten(g, sd * 30, hy, 9, 0, k.skin); }
  }
  // head
  if (k.style === 'afro') { circ(g, 0, -40, 44); cel(g, k.hair); }
  if (k.style === 'pigtails') { for (const sd of [-1, 1]) { ell(g, sd * 38, -38, 12, 20, sd * .5); cel(g, k.hair); } }
  circ(g, 0, -34, 32); cel(g, k.skin);
  if (k.style === 'bob') { g.beginPath(); g.arc(0, -36, 36, Math.PI * .95, Math.PI * 2.05); g.lineTo(36, -16); g.lineTo(22, -16); g.lineTo(22, -44); g.lineTo(-22, -44); g.lineTo(-22, -16); g.lineTo(-36, -16); g.closePath(); cel(g, k.hair); }
  if (k.style === 'pigtails') { g.beginPath(); g.arc(0, -36, 33, Math.PI * 1.05, Math.PI * 1.95); g.quadraticCurveTo(0, -50, -31, -46); cel(g, k.hair); }
  if (k.style === 'cap') { g.beginPath(); g.arc(0, -42, 32, Math.PI, 0); g.closePath(); cel(g, PAL.teal); g.beginPath(); g.roundRect(-4, -48, 48, 10, 5); cel(g, PAL.teal); }
  if (k.style === 'bowl') { g.beginPath(); g.arc(0, -38, 35, Math.PI * .98, Math.PI * 2.02); g.lineTo(34, -40); g.quadraticCurveTo(0, -50, -34, -40); g.closePath(); cel(g, k.hair); }
  // face
  for (const sd of [-1, 1]) { circ(g, sd * 11, -36, 4); g.fillStyle = INK; g.fill(); }
  if (o.grin) {
    g.beginPath(); g.moveTo(-17, -24); g.quadraticCurveTo(0, -2, 17, -24); g.closePath(); cel(g, '#ffffff', 3.5);
    for (const sd of [-1, 1]) { circ(g, sd * 21, -24, 6); g.fillStyle = 'rgba(255,110,140,.55)'; g.fill(); }
    if (k.style === 'bowl') { g.fillStyle = '#b5652a'; for (const [fx, fy] of [[-15, -30], [-19, -27], [15, -30], [19, -27]]) { circ(g, fx, fy, 1.6); g.fill(); } }
  } else { g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); g.arc(0, -28, 9, .2 * Math.PI, .8 * Math.PI); g.stroke(); }
  // party hat / paper crown
  if (o.hat) { g.save(); g.translate(0, -60 - (1 - o.hat) * 120); g.rotate(-.15); g.beginPath(); g.moveTo(-18, 0); g.lineTo(0, -52); g.lineTo(18, 0); g.closePath(); cel(g, PAL.teal, 4); g.save(); g.clip(); g.fillStyle = PAL.mustard; for (let yy = -50; yy < 0; yy += 14) g.fillRect(-20, yy, 40, 6); g.restore(); g.beginPath(); g.moveTo(-18, 0); g.lineTo(0, -52); g.lineTo(18, 0); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); circ(g, 0, -54, 6); cel(g, PAL.pink, 3); g.restore(); }
  if (o.crown) { g.save(); g.translate(0, -58 - (1 - o.crown) * 140); g.beginPath(); g.moveTo(-30, 8); for (let i = 0; i <= 6; i++) g.lineTo(-30 + i * 10, i % 2 ? -10 : -26); g.lineTo(30, 8); g.closePath(); cel(g, '#f6d24a', 4); circ(g, 0, -4, 4); g.fillStyle = PAL.pink; g.fill(); g.restore(); }
  g.restore();
}
function drawGrownup(g, x, y, s, who, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const isMa = who === 'mama';
  g.beginPath(); g.roundRect(-40, 0, 80, 120, 22);
  if (isMa) { cel(g, PAL.orange); g.save(); g.clip(); g.fillStyle = PAL.white; for (let yy = 12; yy < 120; yy += 26) for (let xx = -36; xx < 40; xx += 24) { circ(g, xx + (yy % 52 ? 12 : 0), yy, 5); g.fill(); } g.restore(); g.beginPath(); g.roundRect(-40, 0, 80, 120, 22); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); }
  else { cel(g, '#b07a2e'); g.save(); g.clip(); g.strokeStyle = 'rgba(80,40,10,.6)'; g.lineWidth = 6; for (let xx = -40; xx < 40; xx += 18) { g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx, 120); g.stroke(); } for (let yy = 8; yy < 120; yy += 18) { g.beginPath(); g.moveTo(-40, yy); g.lineTo(40, yy); g.stroke(); } g.restore(); g.beginPath(); g.roundRect(-40, 0, 80, 120, 22); g.strokeStyle = INK; g.lineWidth = 5; g.stroke(); g.beginPath(); g.moveTo(-8, 4); g.lineTo(8, 4); g.lineTo(12, 70); g.lineTo(0, 82); g.lineTo(-12, 70); g.closePath(); cel(g, PAL.teal, 4); }
  for (const sd of [-1, 1]) { const wave = o.wave && (sd === 1); const hy = wave ? -70 : 80; tube(g, [[sd * 36, 16], [sd * 52, wave ? -20 : 50], [sd * 44, hy]], 18, isMa ? PAL.orange : '#b07a2e'); mitten(g, sd * 44, hy, 12, 0, isMa ? '#f5c79a' : '#e8b88a'); }
  if (isMa) { g.beginPath(); g.ellipse(0, -84, 40, 50, 0, 0, TAU); cel(g, '#5a2e4e'); }
  circ(g, 0, -40, 36); cel(g, isMa ? '#f5c79a' : '#e8b88a');
  if (isMa) {
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 4, -46); g.quadraticCurveTo(sd * 16, -54, sd * 28, -50); g.quadraticCurveTo(sd * 22, -36, sd * 6, -38); g.closePath(); cel(g, PAL.teal, 3.5); circ(g, sd * 15, -44, 3.5); g.fillStyle = INK; g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 3.5; g.beginPath(); g.arc(0, -28, 10, .15 * Math.PI, .85 * Math.PI); g.stroke();
    for (let k = -3; k <= 3; k++) { circ(g, k * 8, -4 + Math.abs(k) * -1.5, 4); cel(g, '#ffffff', 2); }
  } else {
    for (const sd of [-1, 1]) { circ(g, sd * 13, -46, 4); g.fillStyle = INK; g.fill(); }
    g.beginPath(); g.moveTo(-22, -28); g.quadraticCurveTo(-10, -38, 0, -30); g.quadraticCurveTo(10, -38, 22, -28); g.quadraticCurveTo(0, -20, -22, -28); cel(g, '#5a3418', 3.5);
    g.beginPath(); g.ellipse(0, -72, 46, 9, 0, 0, TAU); cel(g, '#7a5a3a'); g.beginPath(); g.moveTo(-30, -72); g.lineTo(-24, -104); g.quadraticCurveTo(0, -112, 24, -104); g.lineTo(30, -72); g.closePath(); cel(g, '#7a5a3a'); g.fillStyle = INK; g.fillRect(-29, -82, 58, 8);
  }
  g.restore();
}
function rays(g, cx, cy, n, a0, c1, c2, glow) {
  g.fillStyle = c1; g.fillRect(0, 0, 960, 720);
  g.fillStyle = c2;
  for (let k = 0; k < n; k++) { const a = a0 + k / n * TAU; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 1400, cy + Math.sin(a) * 1400); g.lineTo(cx + Math.cos(a + TAU / n / 2) * 1400, cy + Math.sin(a + TAU / n / 2) * 1400); g.closePath(); g.fill(); }
  const rg = g.createRadialGradient(cx, cy, 10, cx, cy, 300); rg.addColorStop(0, glow); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 960, 720);
}
function popIn(t, t0, dur = .3) { return t < t0 ? 0 : easeOutBack(clamp((t - t0) / dur), 2); }

// ---------- scenes ----------
function sceneClownKids(g, t) {
  const tq = two(t);
  rays(g, 480, 300, 18, tq * .25, PAL.sky, PAL.teal, 'rgba(255,248,220,.95)');
  g.fillStyle = PAL.avocado; g.beginPath(); g.moveTo(0, 452); for (let x = 0; x <= 960; x += 40) g.lineTo(x, 446 + Math.sin(x / 90) * 8); g.lineTo(960, 720); g.lineTo(0, 720); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  // opening sparkles before the clown pops up
  if (t < B.clown + .3) for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + tq * 2, r = 80 + ((tq - B.adStart) * 260 + k * 40) % 300; sparkle(g, 480 + Math.cos(a) * r, 300 + Math.sin(a) * r * .7, 16 + (k % 3) * 6, clamp((B.clown + .3 - t) * 3)); }
  // the clown pops up on "clown"
  if (t >= B.clown - 0.02) {
    const u = clamp((tq - B.clown) / .33), pop = easeOutBack(u, 2.2);
    const sq = u < .5 ? [1 + .25 * (1 - u * 2), 1 - .2 * (1 - u * 2)] : [1, 1];
    const cx = t < B.telling ? 400 : lerp(400, 250, smooth(clamp((t - B.telling) / .35)));
    drawClown(g, cx, 360 + (1 - pop) * 330, 1, { arm: t < B.telling ? 'wave' : 'present', burger: t >= B.telling && t < B.normal, wink: t > B.meat && t < B.meat + .5, squash: sq, t });
  }
  // a line of kids pops in on "kids"; on "normal" each turns into the same smiling kid
  for (let i = 0; i < 4; i++) {
    const t0 = B.kids + i * .08; if (t < t0 - .02) continue;
    const x = 520 + i * 110, p = popIn(tq, t0, .25);
    const tm = B.normal + i * .1, same = tq >= tm + .08;
    const eatU = smooth(clamp((tq - B.eat) / .17)) * (1 - smooth(clamp((tq - B.meat) / .2)));
    const bite = tq >= B.eat + .17 ? 1 : 0;
    g.save(); g.translate(x, 380); g.scale(p, p);
    drawKid(g, 0, 0, .95, same ? SAME : KIDS[i], same ? { grin: true, burger: 1, eatU, bite } : {});
    g.restore();
    // cel smoke puff over the swap
    const pu = (tq - tm) / .25;
    if (pu >= 0 && pu < 1) { g.save(); g.globalAlpha = 1; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; circ(g, x + Math.cos(a) * 26 * (1 + pu), 340 + Math.sin(a) * 30 * (1 + pu), 26 * (1 - pu * .6)); cel(g, '#ffffff', 4); } g.restore(); }
  }
}
function sceneStore(g, t) {
  const tq = two(t);
  g.drawImage(AD.store, 0, 0);
  const lit = t < B.store ? 0 : (tq < B.store + .17 ? (Math.floor((tq - B.store) * 12) % 2 ? .4 : 1) : 1);
  // pendant globe lamps
  for (const x of [190, 480, 770]) {
    g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 36); g.stroke();
    circ(g, x, 58, 24); cel(g, lit > .5 ? '#fff6c8' : '#cfc7a8', 4);
    if (lit > .5) { const rg = g.createRadialGradient(x, 58, 20, x, 58, 120); rg.addColorStop(0, 'rgba(255,240,180,.55)'); rg.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = rg; g.fillRect(x - 130, 0, 260, 200); }
  }
  // the swivel stools
  const base = [PAL.pink, PAL.lime, PAL.orange, PAL.sky, PAL.purple];
  const bright = t < B.brightly ? 0 : smooth(clamp((t - B.brightly) / .12));
  const cyc = t >= B.coloured && t < B.coloured + .42 ? Math.floor((tq - B.coloured) * 12) + 1 : (t >= B.coloured + .42 ? 0 : 0);
  const spin = t < B.swivel ? 0 : (t - B.swivel) * 13;
  for (let i = 0; i < 5; i++) {
    const x = 128 + i * 176, y = 418;
    const col = base[(i + cyc) % 5];
    const c = mix(hex(col), [150, 150, 150], .6 * (1 - bright));
    g.fillStyle = '#c9ced2'; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.rect(x - 7, y + 10, 14, 200); g.fill(); g.stroke();
    // seat: a fat cushion, the shine and the button turn as it swivels
    g.beginPath(); g.ellipse(x, y + 12, 60, 20, 0, 0, Math.PI); g.lineTo(x - 60, y); g.ellipse(x, y, 60, 20, 0, Math.PI, 0, true); g.closePath(); cel(g, rgb(mix(c, [0, 0, 0], .25)));
    ell(g, x, y, 60, 20); cel(g, rgb(c));
    const sa = spin * (i % 2 ? 1 : -1) + i;
    g.save(); ell(g, x, y, 60, 20); g.clip();
    g.fillStyle = 'rgba(255,255,255,.55)'; ell(g, x + Math.cos(sa) * 30, y + Math.sin(sa) * 8, 18, 6, 0); g.fill();
    circ(g, x + Math.cos(sa + 2) * 22, y + Math.sin(sa + 2) * 6, 4); g.fillStyle = INK; g.fill();
    g.restore();
    if (spin > 0) { g.strokeStyle = INK; g.lineWidth = 3; for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x, y + 4, 72 + k * 9, sd > 0 ? -.35 + k * .05 : Math.PI - .35, sd > 0 ? .1 : Math.PI + .1); g.stroke(); } }
    if (bright > 0 && t < B.brightly + .6) sparkle(g, x + 44, y - 34 - (i % 2) * 14, 14 * bright, 1 - clamp((t - B.brightly - .3) / .3));
  }
  // a kid drops onto the middle seat on "seat" and spins
  if (t >= B.seat - .25) {
    const u = clamp((tq - (B.seat - .25)) / .25), y = lerp(-140, 340, u * u) + (u >= 1 ? Math.sin(clamp((tq - B.seat) / .25) * Math.PI) * -14 : 0);
    drawKid(g, 480, y - 10, .9, SAME, { grin: true, wave: tq > B.seat + .2 });
  }
  if (lit < 1) { g.fillStyle = `rgba(10,20,60,${.55 * (1 - lit)})`; g.fillRect(0, 0, 960, 720); }
}
function sceneSing(g, t) {
  const tq = two(t);
  const cols = [PAL.pink, '#ffd0dd'];
  for (let k = 16; k >= 0; k--) { g.fillStyle = cols[k % 2]; circ(g, 480, 300, k * 46 + (tq * 40) % 92); g.fill(); }
  // the conductor's baton hits down on every word
  const words = LN[46].words.concat(LN[47].words); let last = -9; for (const w of words) if (w.s <= t) last = w.s;
  const hit = Math.exp(-(t - last) * 9);
  if (t >= B.mama1 - .02) { const p = popIn(tq, B.mama1, .28), j = t > B.mama2 ? Math.sin(clamp((tq - B.mama2) / .3) * Math.PI) * 26 : 0; drawGrownup(g, 165, 300 + (1 - p) * 300 - j, .95, 'mama', { wave: t > B.too }); }
  if (t >= B.daddy1 - .02) { const p = popIn(tq, B.daddy1, .28), j = t > B.daddy2 ? Math.sin(clamp((tq - B.daddy2) / .3) * Math.PI) * 26 : 0; drawGrownup(g, 795, 300 + (1 - p) * 300 - j, .95, 'daddy', { wave: t > B.too }); }
  drawClown(g, 480, 330, 1, { arm: 'conduct', armA: hit * .55, t });
  drawKid(g, 330, 420, .8, SAME, { grin: true });
  drawKid(g, 630, 420, .8, SAME, { grin: true });
}
function sceneParty(g, t) {
  const tq = two(t);
  g.drawImage(AD.party, 0, 0);
  // balloons rising from behind the table
  const bc = [PAL.pink, PAL.teal, PAL.mustard, PAL.orange, PAL.purple, PAL.avocado, PAL.sky];
  for (let k = 0; k < 9; k++) {
    const t0 = B.ifYou + k * .22 - .3, u = (tq - t0) / 2.6; if (u < 0) continue;
    const x = 80 + ((k * 337) % 800) + Math.sin(tq * 2 + k) * 10, y = 640 - u * 820;
    if (y < -120) continue;
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + 40); g.quadraticCurveTo(x + 10, y + 80, x - 4, y + 120); g.stroke();
    ell(g, x, y, 30, 38); cel(g, bc[k % bc.length], 4); ell(g, x - 10, y - 14, 6, 10, .4); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill();
  }
  // three kids at the table: party hats on "children's", a paper crown for the middle one on "party"
  for (let i = 0; i < 3; i++) {
    const x = 220 + i * 260;
    const hat = i === 1 ? 0 : (t >= B.childrens + i * .04 - .02 ? clamp(easeOutBack(clamp((tq - B.childrens - i * .04) / .25), 1.5), 0, 1.2) : 0);
    const crown = i === 1 && t >= B.party - .02 ? easeOutBack(clamp((tq - B.party) / .28), 1.8) : 0;
    drawKid(g, x, 350 + (t > B.do_ ? Math.sin(clamp((tq - B.do_) / .3) * Math.PI) * -12 : 0), .95, SAME, { grin: true, hat: hat || 0, crown: crown || 0, wave: t > B.do_ });
  }
  // the table with a cake
  g.beginPath(); g.rect(-10, 440, 980, 300); cel(g, PAL.teal);
  g.fillStyle = PAL.white; for (let x = 0; x < 960; x += 40) { g.beginPath(); g.arc(x + 20, 440, 20, 0, Math.PI); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke(); }
  g.beginPath(); g.rect(420, 380, 120, 62); cel(g, '#fff6e8'); g.beginPath(); g.rect(420, 380, 120, 16); cel(g, PAL.pink, 4);
  for (let k = 0; k < 4; k++) { const x = 436 + k * 28; g.beginPath(); g.rect(x - 3, 352, 6, 28); cel(g, k % 2 ? PAL.teal : PAL.mustard, 3); const fl = 1 + Math.sin(tq * 30 + k) * .2; ell(g, x, 344, 5 * fl, 9 * fl); cel(g, '#ffd34d', 2.5); }
  // the clown leans in from the right and points at the viewer
  if (t >= B.this47 - .02) {
    const u = smooth(clamp((tq - B.this47) / .3)), pt = t >= B.youve;
    drawClown(g, lerp(1140, 830, u), 380, 1, { arm: 'none', lean: -.18, t });
    if (pt) { const p = popIn(tq, B.youve, .22); g.save(); g.translate(720, 300); g.scale(p, p); circ(g, 0, 0, 46); cel(g, PAL.white, 6); circ(g, -6, -8, 18); cel(g, PAL.white, 5); circ(g, -6, -8, 6); g.fillStyle = 'rgba(27,21,48,.25)'; g.fill(); circ(g, 48, 18, 18); cel(g, PAL.lblue, 4); g.restore(); }
  }
  // confetti on "do"
  if (t >= B.do_) {
    const R = mulberry(77); const u = tq - B.do_;
    for (let k = 0; k < 70; k++) {
      const a = R() * TAU, v = 200 + R() * 380, x = 480 + Math.cos(a) * v * u, y = 300 + Math.sin(a) * v * u + 260 * u * u;
      g.save(); g.translate(x, y); g.rotate(R() * 6 + u * 8); g.fillStyle = bc[k % bc.length]; g.fillRect(-6, -3, 12, 6); g.restore();
    }
  }
}
function sceneEndCard(g, t, coinHits) {
  const tq = two(t);
  rays(g, 480, 360, 18, tq * .2, PAL.sky, PAL.teal, 'rgba(255,248,220,.95)');
  // a plate with the burger-shaped thing; on "trick" it spins and twinkles
  ell(g, 480, 420, 150, 34); cel(g, '#fbfbf6', 6); ell(g, 480, 416, 110, 22); g.strokeStyle = '#b8c4c8'; g.lineWidth = 3; g.stroke();
  const spin = t >= B.trick ? Math.cos(clamp((tq - B.trick) / .5) * TAU) : 1;
  g.save(); g.translate(480, 360); g.scale(spin, 1); drawBurger(g, 0, 0, 2.6, 0); g.restore();
  drawClown(g, 190, 400, .82, { arm: 'wave', wink: t >= B.trick && t < B.trick + .6, t });
  if (t >= B.trick) { const u = clamp((tq - B.trick) / .5); sparkle(g, 560, 270, 40 * Math.sin(u * Math.PI), 1); }
  for (const h of coinHits) { const u = (t - h.t) / .3; if (u >= 0 && u < 1) sparkle(g, h.x, h.y, 26 * Math.sin(u * Math.PI), 1); }
}
// The investment counter: a bulb-ringed panel, the digits roll from x1 to land on x30 on "30".
function counterValue(t) { if (t < B.brought) return 1; const u = clamp((t - B.brought) / (B.thirty - B.brought)); return Math.max(1, Math.min(30, Math.floor(1 + 29 * u * u * (3 - 2 * u) + 1e-6))); }
function sceneCounter(g, t) {
  const tq = two(t), f = Math.round(t * 24);
  g.fillStyle = '#4a2a14'; g.fillRect(0, 0, 960, 720);
  g.save(); g.globalAlpha = .55; rays(g, 480, 400, 24, tq * .4, '#4a2a14', '#8a5a20', 'rgba(255,220,120,.5)'); g.restore();
  const x = 170, y = 250, w = 620, h = 300;
  g.beginPath(); g.roundRect(x, y, w, h, 40); cel(g, '#2a160c', 8);
  g.beginPath(); g.roundRect(x + 30, y + 30, w - 60, h - 60, 24); cel(g, '#120a06', 5);
  // chasing bulbs
  const n = 34, flash = t >= B.quick && (f % 2 === 0);
  for (let k = 0; k < n; k++) {
    const u = k / n, per = 2 * (w + h); let d = u * per, bx, by;
    if (d < w) { bx = x + d; by = y; } else if ((d -= w) < h) { bx = x + w; by = y + d; } else if ((d -= h) < w) { bx = x + w - d; by = y + h; } else { d -= w; bx = x; by = y + h - d; }
    const on = flash || (k + Math.floor(t * 16)) % 3 === 0;
    circ(g, bx, by, 9); cel(g, on ? '#fff3b0' : '#7a5a2a', 3);
  }
  const v = counterValue(t), land = t >= B.thirty;
  const pulse = land ? 1 + .12 * Math.exp(-(t - B.thirty) * 8) + (t >= B.quick ? .1 * Math.exp(-(t - B.quick) * 8) : 0) : 1;
  g.save(); g.translate(480, 400 + 6); g.scale(pulse, pulse);
  g.font = 'bold 190px "Cooper Lt BT", Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const txt = '×' + v;
  fitText(g, txt, w - 120, 190, 'bold {s}px "Cooper Lt BT", Georgia, serif');
  g.lineWidth = 10; g.strokeStyle = INK; g.lineJoin = 'round'; g.strokeText(txt, 0, 66);
  g.fillStyle = land && t >= B.times && t < B.times + .2 ? '#ffffff' : '#ffd34d'; g.fillText(txt, 0, 66);
  g.restore();
}
// film look for the commercial: gate weave, dust, a warm print
function filmLook(g, t) {
  const f = Math.round(t * 24), R = mulberry(4000 + f);
  for (let k = 0; k < 5; k++) { const x = R() * 960, y = R() * 720, r = .8 + R() * 2.2; g.fillStyle = R() < .5 ? 'rgba(20,10,5,.7)' : 'rgba(255,255,240,.7)'; circ(g, x, y, r); g.fill(); }
  if (R() < .25) { g.strokeStyle = 'rgba(20,10,5,.5)'; g.lineWidth = 1.2; const x = R() * 960, y = R() * 720; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 12, y + 6, x + 4, y + 20); g.stroke(); }
  g.fillStyle = 'rgba(255,190,110,.05)'; g.fillRect(0, 0, 960, 720);
}
