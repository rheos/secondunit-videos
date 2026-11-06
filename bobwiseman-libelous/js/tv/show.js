// The kids' show: a cheap puppet theatre shot on studio video. Felt Rapunzel (felt face, button eyes,
// stitched smile, yarn hair) in the window of a painted cardboard tower. Then the station card.
const SHOW = {};
function feltTile(seed, base, light, dark) {
  const c = mkCanvas(256, 256), g = c.getContext('2d'), R = mulberry(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const x = R() * 256, y = R() * 256, a = R() * TAU, l = 3 + R() * 7, bend = (R() - .5) * 4;
    g.strokeStyle = R() < .5 ? light : dark; g.globalAlpha = .12 + R() * .16; g.lineWidth = .6 + R() * .7;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l / 2 + bend, y + Math.sin(a) * l / 2 - bend, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  return c;
}
// a scissor-cut felt blob: the outline wobbles a little, fibres stick out of the edge
function feltShape(g, pathFn, tile, edge) {
  g.save(); pathFn(g); g.fillStyle = g.createPattern(tile, 'repeat'); g.fill();
  g.shadowColor = edge; g.shadowBlur = 3; g.strokeStyle = edge; g.globalAlpha = .55; g.lineWidth = 1.6; pathFn(g); g.stroke();
  g.restore();
}
function wobblyCircle(g, cx, cy, r, seed, amt = 1.4) {
  g.beginPath();
  for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, rr = r + n1(seed, i * .35) * amt; i ? g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : g.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  g.closePath();
}
function paintStrokes(g, x, y, w, h, col, n, seed, alpha = .25, len = 40) {
  const R = mulberry(seed); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let i = 0; i < n; i++) { g.strokeStyle = col; g.globalAlpha = alpha * R(); g.lineWidth = 2 + R() * 6; const px = x + R() * w, py = y + R() * h; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + len * .5, py + (R() - .5) * 8, px + len * (0.6 + R()), py + (R() - .5) * 6); g.stroke(); }
  g.restore();
}
function initShow() {
  SHOW.felt = { skin: feltTile(11, '#f0b48f', '#ffd7bd', '#c98a68'), dress: feltTile(12, '#a57bd0', '#c9a6ee', '#7b54a6'),
    pink: feltTile(13, '#ff7fb0', '#ffb3d0', '#d24f86'), white: feltTile(14, '#f4efe4', '#ffffff', '#cfc6b4'), green: feltTile(15, '#5aa55a', '#8fd08a', '#3a7a3c') };
  // the static set: backdrop, curtains, playboard, tower
  const c = mkCanvas(960, 720), g = c.getContext('2d');
  let gr = g.createLinearGradient(0, 0, 0, 520); gr.addColorStop(0, '#5fb0dc'); gr.addColorStop(1, '#cfeaf2');
  g.fillStyle = gr; g.fillRect(0, 0, 960, 720);
  paintStrokes(g, 0, 0, 960, 500, '#ffffff', 160, 21, .18, 70);
  // painted clouds
  const R = mulberry(31);
  for (const [cx, cy, s] of [[200, 130, 1], [760, 90, .8], [640, 230, .6]]) {
    g.fillStyle = '#ffffff';
    for (let k = 0; k < 7; k++) { g.globalAlpha = .9; g.beginPath(); g.ellipse(cx + (k - 3) * 30 * s, cy + Math.sin(k * 1.7) * 8 * s, (40 + R() * 20) * s, (26 + R() * 10) * s, 0, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
    paintStrokes(g, cx - 120 * s, cy - 30 * s, 240 * s, 60 * s, '#c9e1ee', 20, 40 + cx, .3, 30);
  }
  // painted sun with brushed rays (top left)
  g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(860, 70, 48, 0, TAU); g.fill();
  g.strokeStyle = '#ffd34d'; g.lineWidth = 8; g.lineCap = 'round';
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.beginPath(); g.moveTo(860 + Math.cos(a) * 60, 70 + Math.sin(a) * 60); g.lineTo(860 + Math.cos(a) * 84, 70 + Math.sin(a) * 84); g.stroke(); }
  // painted hills
  for (const [y0, col, amp, ph] of [[400, '#86b552', 30, 0], [450, '#5f9640', 24, 2]]) {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, 720);
    for (let x = 0; x <= 960; x += 20) g.lineTo(x, y0 + Math.sin(x / 140 + ph) * amp + Math.sin(x / 57) * 6);
    g.lineTo(960, 720); g.fill();
    paintStrokes(g, 0, y0 - 30, 960, 300, '#2f5e22', 80, 50 + y0, .18, 50);
  }
  // the tower: painted cardboard
  const tw = { x: 372, y: 150, w: 216, h: 470 };
  g.fillStyle = '#a9a7a2'; g.fillRect(tw.x, tw.y, tw.w, tw.h);
  const RS = mulberry(77);
  for (let row = 0, y = tw.y; y < tw.y + tw.h; row++, y += 30) {
    for (let x = tw.x - (row % 2) * 27; x < tw.x + tw.w; x += 54) {
      const sh = 150 + RS() * 40 | 0; g.fillStyle = `rgb(${sh},${sh - 3},${sh - 9})`;
      g.beginPath(); g.roundRect(Math.max(tw.x, x + 3), y + 3, Math.min(48, tw.x + tw.w - Math.max(tw.x, x + 3) - 3), 24, 6); g.fill();
    }
  }
  paintStrokes(g, tw.x, tw.y, tw.w, tw.h, '#5d5a55', 90, 78, .22, 26);
  // corrugated cut edge on the right, a strip of brown tape at the foot
  g.fillStyle = '#c8a26a'; g.fillRect(tw.x + tw.w, tw.y + 6, 12, tw.h);
  g.strokeStyle = '#8a6a3c'; g.lineWidth = 1.5;
  for (let y = tw.y + 8; y < tw.y + tw.h; y += 6) { g.beginPath(); g.moveTo(tw.x + tw.w + 1, y); g.quadraticCurveTo(tw.x + tw.w + 6, y + 3, tw.x + tw.w + 11, y); g.stroke(); }
  g.save(); g.translate(tw.x + 40, tw.y + 380); g.rotate(-.5); g.fillStyle = 'rgba(160,110,50,.75)'; g.fillRect(-60, -11, 120, 22); g.restore();
  // battlements
  g.fillStyle = '#9d9b95';
  for (let k = 0; k < 5; k++) g.fillRect(tw.x - 10 + k * 50, tw.y - 34, 30, 40);
  g.fillRect(tw.x - 10, tw.y - 4, tw.w + 20, 16);
  // the window: dark arch with a painted sill
  SHOW.win = { x: 405, y: 168, w: 150, h: 150 };
  const wn = SHOW.win;
  g.fillStyle = '#2a1f2e'; archPath(g, wn); g.fill();
  g.fillStyle = '#c9c6bd'; g.fillRect(wn.x - 14, wn.y + wn.h, wn.w + 28, 14);
  g.strokeStyle = '#6b6862'; g.lineWidth = 2; g.strokeRect(wn.x - 14, wn.y + wn.h, wn.w + 28, 14);
  SHOW.tw = tw;
  SHOW.set = c;
  // the front of the theatre: velvet curtains, scalloped valance with fringe, painted playboard
  const f = mkCanvas(960, 720), h = f.getContext('2d');
  for (const side of [0, 1]) {
    const x0 = side ? 852 : 0, w = 108;
    for (let k = 0; k < 6; k++) {
      const x = x0 + k * w / 6; const gg = h.createLinearGradient(x, 0, x + w / 6, 0);
      gg.addColorStop(0, '#4a0f22'); gg.addColorStop(.5, '#8f2444'); gg.addColorStop(1, '#4a0f22'); h.fillStyle = gg; h.fillRect(x, 0, w / 6 + 1, 720);
    }
  }
  h.fillStyle = '#7a1c39'; h.fillRect(0, 0, 960, 44);
  for (let x = 0; x < 960; x += 80) { h.beginPath(); h.arc(x + 40, 44, 40, 0, Math.PI); h.fill(); }
  h.strokeStyle = '#e2b24a'; h.lineWidth = 3;
  for (let x = 0; x < 960; x += 80) { h.beginPath(); h.arc(x + 40, 44, 40, 0, Math.PI); h.stroke(); for (let a = .15; a < Math.PI; a += .16) { h.beginPath(); h.moveTo(x + 40 + Math.cos(a) * 40, 44 + Math.sin(a) * 40); h.lineTo(x + 40 + Math.cos(a) * 49, 44 + Math.sin(a) * 49); h.stroke(); } }
  h.fillStyle = '#2f7d7a'; h.fillRect(0, 560, 960, 160);
  paintStrokes(h, 0, 560, 960, 160, '#1d5654', 60, 91, .3, 60);
  h.fillStyle = '#e8b630'; h.strokeStyle = '#7a5a10'; h.lineWidth = 2;
  for (const [x, y] of [[90, 620], [250, 660], [420, 610], [600, 655], [780, 615], [900, 668]]) { star(h, x, y, 18, 8, 5); h.fill(); h.stroke(); }
  h.fillStyle = '#e2b24a'; h.fillRect(0, 556, 960, 8);
  SHOW.front = f;
}
function archPath(g, wn) { const r = wn.w / 2; g.beginPath(); g.moveTo(wn.x, wn.y + wn.h); g.lineTo(wn.x, wn.y + r); g.arc(wn.x + r, wn.y + r, r, Math.PI, 0); g.lineTo(wn.x + wn.w, wn.y + wn.h); g.closePath(); }
function star(g, x, y, r1, r2, n) { g.beginPath(); for (let i = 0; i <= n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; i ? g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : g.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }

function drawShow(g, t) {
  const tc = Math.min(t, B.stopped);               // "stopped": the show freezes, then the picture rolls away
  // studio camera: still on the wide, then a slow push toward the window while she lets her hair down
  const push = lerp(1.08, 1.2, smooth(clamp((tc - B.will) / (B.down - B.will + 0.2))));
  g.save();
  g.translate(480, 330); g.scale(push, push); g.translate(-480, -330 + (push - 1) * 60);
  g.drawImage(SHOW.set, 0, 0);
  drawFlag(g, tc);
  drawBraid(g, tc);
  drawRapunzel(g, tc);
  g.restore();
  g.drawImage(SHOW.front, 0, 0);
}
function drawFlag(g, t) {
  // a felt pennant on a dowel above the battlements, it flips open on "tower"
  const x = 480, y = SHOW.tw.y - 34;
  g.strokeStyle = '#6b4a2a'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 90); g.stroke();
  const open = easeOutBack(clamp((t - B.tower) / 0.3), 2.2), wave = Math.sin(t * 7) * 4 * open;
  const len = lerp(14, 66, open);
  feltShape(g, (h) => { h.beginPath(); h.moveTo(x, y - 88); h.quadraticCurveTo(x + len * .5, y - 92 + wave, x + len, y - 76 + wave * .5); h.quadraticCurveTo(x + len * .5, y - 70 - wave, x, y - 60); h.closePath(); }, SHOW.felt.pink, '#a83a68');
}
function puppetPose(t) {
  const up = t < B.rapunzel - 0.02 ? 0 : easeOutBack(clamp((t - (B.rapunzel - 0.02)) / 0.32), 1.6);
  const bob = Math.sin(t * TAU * 1.25) * 2.5 + n1(5, t * 2) * 1.5;
  const lean = smooth(clamp((t - B.will) / 0.4)) * 6;
  const tilt = n1(6, t * 1.1) * .05 + (t > B.will ? -0.08 * smooth(clamp((t - B.will) / .4)) : 0) + (t > B.let_ && t < B.let_ + .3 ? Math.sin((t - B.let_) / .3 * Math.PI) * .07 : 0);
  return { x: 482, y: 262 + (1 - up) * 140 + bob + lean, tilt, look: smooth(clamp((t - B.will) / 0.3)) };
}
function drawRapunzel(g, t) {
  const P = puppetPose(t), wn = SHOW.win, F = SHOW.felt;
  g.save();
  // clip to the window opening: she is inside the tower
  archPath(g, wn); g.clip();
  g.translate(P.x, P.y); g.rotate(P.tilt); g.scale(1.45, 1.45);
  // dress and white collar
  feltShape(g, (h) => { h.beginPath(); h.ellipse(0, 56, 46, 30, 0, Math.PI, TAU); h.lineTo(46, 90); h.lineTo(-46, 90); h.closePath(); }, F.dress, '#5d3c85');
  feltShape(g, (h) => { h.beginPath(); h.moveTo(-20, 30); h.quadraticCurveTo(-14, 46, 0, 40); h.quadraticCurveTo(14, 46, 20, 30); h.closePath(); }, F.white, '#a9a090');
  // yarn hair behind the head
  yarnMass(g, 0, -4, 40, 44, 101);
  feltShape(g, (h) => wobblyCircle(h, 0, 0, 33, 3, 1.2), F.skin, '#b0704f');
  // button eyes, felt cheeks, stitched smile
  const lk = P.look * 3;
  for (const s of [-1, 1]) {
    g.fillStyle = '#121014'; g.beginPath(); g.arc(s * 12, -4 + lk * .5, 6.2, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(s * 12 - 2, -6 + lk * .5, 1.8, 0, TAU); g.fill();
    feltShape(g, (h) => wobblyCircle(h, s * 19, 9, 6.5, 7 + s, .6), F.pink, '#c44f80');
  }
  g.strokeStyle = '#c0283e'; g.lineWidth = 2.2; g.setLineDash([4, 3]); g.beginPath(); g.arc(0, 8, 10, .25 * Math.PI, .75 * Math.PI); g.stroke(); g.setLineDash([]);
  // yarn fringe across the forehead
  g.lineCap = 'round';
  for (let k = 0; k < 16; k++) {
    const a = -Math.PI + .2 + k / 15 * (Math.PI - .4);
    g.strokeStyle = k % 3 ? '#f2c230' : '#d79c1c'; g.lineWidth = 3.4;
    g.beginPath(); g.moveTo(Math.cos(a) * 8, -31); g.quadraticCurveTo(Math.cos(a) * 26, -30 + Math.sin(a) * 4, Math.cos(a) * 34, -16 + Math.abs(Math.cos(a)) * 6); g.stroke();
  }
  g.restore();
}
function yarnMass(g, cx, cy, rx, ry, seed) {
  const R = mulberry(seed); g.lineCap = 'round';
  g.fillStyle = '#d9a11f'; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.fill();
  for (let i = 0; i < 70; i++) {
    const a = R() * TAU, r0 = R() * .7;
    g.strokeStyle = R() < .6 ? '#f2c230' : '#b8820f'; g.lineWidth = 2.6;
    g.beginPath(); g.moveTo(cx + Math.cos(a) * rx * r0, cy + Math.sin(a) * ry * r0); g.quadraticCurveTo(cx + Math.cos(a + .4) * rx * .9, cy + Math.sin(a + .4) * ry * .9, cx + Math.cos(a + .2) * rx, cy + Math.sin(a + .2) * ry); g.stroke();
  }
}
function braidLen(t) {
  if (t < B.will) return 0;
  const creep = lerp(0, 34, smooth(clamp((t - B.will) / (B.down - B.will))));
  if (t < B.down) return creep;
  const u = clamp((t - B.down) / 0.42);
  // drop with a bounce on "down?"
  const bounce = u < .55 ? (u / .55) ** 2 : 1 - Math.sin((u - .55) / .45 * Math.PI) * .12 * (1 - u);
  return creep + (150 - creep) * bounce;
}
function drawBraid(g, t) {
  const L = braidLen(t); if (L < 1) return;
  const wn = SHOW.win, x0 = wn.x + 120, y0 = wn.y + wn.h + 6;
  const sway = t > B.down ? Math.sin((t - B.down) * 5.5) * .12 * Math.exp(-(t - B.down) * 1.2) : 0;
  const n = Math.max(1, Math.floor(L / 13));
  g.save(); g.lineCap = 'round';
  // the braid comes over the sill
  g.strokeStyle = '#d9a11f'; g.lineWidth = 15; g.beginPath(); g.moveTo(x0 - 6, y0 - 14); g.quadraticCurveTo(x0 + 2, y0 - 8, x0, y0); g.stroke();
  let ex = x0, ey = y0;
  for (let i = 0; i < n; i++) {
    const d = (i + .5) * L / n, a = sway * (d / 150);
    const cx = x0 + Math.sin(a) * d + Math.sin(d / 40) * 2, cy = y0 + Math.cos(a) * d;
    const side = i % 2 ? 1 : -1;
    g.save(); g.translate(cx, cy); g.rotate(side * .55 + a);
    g.fillStyle = i % 2 ? '#f2c230' : '#e2ad22'; g.strokeStyle = '#a8740c'; g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(0, 0, 8.5, 11, 0, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(140,90,10,.6)'; g.lineWidth = 1;
    for (const o of [-4, 0, 4]) { g.beginPath(); g.moveTo(o, -9); g.quadraticCurveTo(o + 2, 0, o, 9); g.stroke(); }
    g.restore();
    ex = cx; ey = cy;
  }
  // pink felt bow and a yarn tuft at the end
  g.strokeStyle = '#f2c230'; g.lineWidth = 2.5;
  for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(ex, ey + 6); g.quadraticCurveTo(ex + k * 2, ey + 16, ex + k * 3.2, ey + 24); g.stroke(); }
  feltShape(g, (h) => { h.beginPath(); h.moveTo(ex, ey + 6); h.lineTo(ex - 15, ey - 4); h.lineTo(ex - 15, ey + 14); h.closePath(); h.moveTo(ex, ey + 6); h.lineTo(ex + 15, ey - 4); h.lineTo(ex + 15, ey + 14); h.closePath(); }, SHOW.felt.pink, '#a83a68');
  g.restore();
}

// Station card between the show and the commercial: concentric 70s stripes and a clock whose hand sweeps.
// No lettering (every word on screen comes from the lyric).
function drawCard(g, t) {
  const cols = ['#f08a24', '#e8b630', '#9bb53c', '#1fa6a0', '#6b3f1e', '#fff1c9'];
  const ph = (t - B.card) * 90;
  for (let k = 14; k >= 0; k--) { g.fillStyle = cols[(k + Math.floor(ph / 40)) % cols.length]; g.beginPath(); g.arc(480, 330, k * 40 + (ph % 40), 0, TAU); g.fill(); }
  g.fillStyle = '#fff8e4'; g.strokeStyle = '#1b1530'; g.lineWidth = 7;
  g.beginPath(); g.arc(480, 330, 104, 0, TAU); g.fill(); g.stroke();
  g.lineWidth = 6; g.lineCap = 'round';
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.beginPath(); g.moveTo(480 + Math.cos(a) * 82, 330 + Math.sin(a) * 82); g.lineTo(480 + Math.cos(a) * 94, 330 + Math.sin(a) * 94); g.stroke(); }
  const am = -Math.PI / 2 + (t - B.card) * 4.2;
  g.lineWidth = 9; g.beginPath(); g.moveTo(480, 330); g.lineTo(480 + Math.cos(am) * 76, 330 + Math.sin(am) * 76); g.stroke();
  g.beginPath(); g.moveTo(480, 330); g.lineTo(480 + Math.cos(-2.1) * 48, 330 + Math.sin(-2.1) * 48); g.stroke();
  g.fillStyle = '#f08a24'; g.beginPath(); g.arc(480, 330, 10, 0, TAU); g.fill(); g.stroke();
}
