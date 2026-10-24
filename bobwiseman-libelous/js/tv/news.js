// Stanza 11 (240.917-261.5): a 1970s news bulletin on the same set in the same room. Studio video: the anchor
// at a veneer desk in front of a dotted world map, an over-the-shoulder box, and still "news film" inserts.
// The wire copy (js/tv/r2_captions.js, the teleprinter strip) covers the lower third, so every picture here
// keeps its business above program y 460. In the room: the king, slumped low in his wingback, and a rotary
// phone on a side table that rings. Pure: a function of song time t only.
const NW = {};
const NINK = '#1b1530';
function nCel(g, fill, lw = 4) { g.fillStyle = fill; g.fill(); g.strokeStyle = NINK; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
function initNews() {
  // the news set: navy backdrop, an orange dot-matrix world map, a veneer desk
  let c = mkCanvas(960, 720), g = c.getContext('2d');
  let gr = g.createLinearGradient(0, 0, 0, 470); gr.addColorStop(0, '#162544'); gr.addColorStop(1, '#24375e'); g.fillStyle = gr; g.fillRect(0, 0, 960, 720);
  const land = [[150, 130, 120, 70], [230, 250, 60, 90], [470, 120, 70, 50], [500, 230, 70, 100], [660, 140, 160, 70], [770, 280, 60, 40], [420, 90, 40, 20]];
  for (let y = 20; y < 380; y += 16) for (let x = 12; x < 960; x += 16) {
    const inL = land.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1 + n1(5, x * .02 + y * .03) * .25);
    g.fillStyle = inL ? 'rgba(240,150,60,.75)' : 'rgba(120,150,200,.16)'; g.beginPath(); g.arc(x, y, inL ? 4.2 : 2.4, 0, TAU); g.fill();
  }
  g.strokeStyle = 'rgba(240,150,60,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 392); g.lineTo(960, 392); g.stroke();
  woodGrain(g, 0, 372, 960, 348, '#7a4a26', 811, true);
  g.fillStyle = 'rgba(255,220,170,.25)'; g.fillRect(0, 372, 960, 5); g.fillStyle = '#3a2210'; g.fillRect(0, 377, 960, 6);
  NW.set = c;
  // stars for the satellite shot
  c = mkCanvas(960, 720); g = c.getContext('2d');
  g.fillStyle = '#05060f'; g.fillRect(0, 0, 960, 720); const R = mulberry(1977);
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,240,${.3 + R() * .7})`; g.beginPath(); g.arc(R() * 960, R() * 720, .8 + R() * 1.8, 0, TAU); g.fill(); }
  NW.stars = c;
  // the palace wallpaper behind the queen: rose damask
  c = mkCanvas(960, 720); g = c.getContext('2d');
  g.fillStyle = '#c9a2b4'; g.fillRect(0, 0, 960, 720);
  for (let y = 0; y < 720; y += 90) for (let x = (y / 90 % 2) * 60; x < 1000; x += 120) {
    g.fillStyle = 'rgba(140,80,110,.45)'; g.beginPath(); g.ellipse(x, y, 22, 34, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(x, y, 34, 10, 0, 0, TAU); g.fill();
  }
  NW.paper = c;
  NW.foot = (g, h) => {};
}
// ---------- the anchor ----------
function mouthOpen(t, lines) {
  let m = 0;
  for (const li of lines) for (const w of LN2[li].words) if (t >= w.s && t < w.e + .1) m = Math.max(m, .5 + .5 * Math.sin(Math.min(1, (t - w.s) / Math.max(.08, w.e - w.s)) * Math.PI));
  return m;
}
function drawAnchor(g, t, look) {
  const x = 290, by = 0;
  const blink = (((t - S11[0]) % 3.3) + 3.3) % 3.3 < .1;
  const turn = look || 0;
  // suit, shirt, tie
  g.beginPath(); g.moveTo(x - 150, 470); g.quadraticCurveTo(x - 146, 300, x - 64, 278); g.lineTo(x + 64, 278); g.quadraticCurveTo(x + 146, 300, x + 150, 470); g.closePath(); nCel(g, '#7a5232', 5);
  g.beginPath(); g.moveTo(x - 46, 278); g.lineTo(x, 380); g.lineTo(x + 46, 278); g.closePath(); nCel(g, '#cfe0f0', 4);
  g.beginPath(); g.moveTo(x - 16, 290); g.lineTo(x + 16, 290); g.lineTo(x + 26, 390); g.lineTo(x, 412); g.lineTo(x - 26, 390); g.closePath(); nCel(g, '#e8862a', 4);
  g.save(); g.clip(); g.strokeStyle = 'rgba(110,50,20,.7)'; g.lineWidth = 6; for (let k = -2; k < 6; k++) { g.beginPath(); g.moveTo(x - 40, 300 + k * 24); g.lineTo(x + 40, 270 + k * 24); g.stroke(); } g.restore();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 46, 278); g.lineTo(x + s * 18, 360); g.lineTo(x + s * 70, 330); g.lineTo(x + s * 84, 288); g.closePath(); nCel(g, '#8d6440', 4); }
  // neck and head
  g.beginPath(); g.rect(x - 22, 236, 44, 48); nCel(g, '#e9b48c', 4);
  g.save(); g.translate(x + turn * 6, 190); g.rotate(turn * .06);
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 52, 6, 10, 16, 0, 0, TAU); nCel(g, '#e9b48c', 3.5); }
  g.beginPath(); g.ellipse(0, 0, 52, 60, 0, 0, TAU); nCel(g, '#e9b48c', 4.5);
  // side-parted hair and sideburns
  g.beginPath(); g.moveTo(-54, 8); g.quadraticCurveTo(-60, -60, 0, -64); g.quadraticCurveTo(56, -64, 56, -10); g.quadraticCurveTo(30, -40, -14, -36); g.quadraticCurveTo(-36, -30, -44, 16); g.closePath(); nCel(g, '#4a2e1a', 4);
  for (const s of [-1, 1]) { g.beginPath(); g.rect(s * 48 - 5, -8, 10, 30); g.fillStyle = '#4a2e1a'; g.fill(); }
  // glasses, eyes, brows
  for (const s of [-1, 1]) {
    g.beginPath(); g.roundRect(s * 22 - 18 + turn * 4, -10, 36, 26, 8); g.fillStyle = 'rgba(220,235,255,.25)'; g.fill(); g.strokeStyle = NINK; g.lineWidth = 5; g.stroke();
    if (blink) { g.beginPath(); g.moveTo(s * 22 - 8 + turn * 4, 4); g.lineTo(s * 22 + 8 + turn * 4, 4); g.lineWidth = 3; g.stroke(); }
    else { g.fillStyle = NINK; g.beginPath(); g.arc(s * 22 + turn * 7, 3, 4.5, 0, TAU); g.fill(); }
    g.strokeStyle = '#4a2e1a'; g.lineWidth = 5; g.beginPath(); g.moveTo(s * 22 - 14 + turn * 4, -20); g.lineTo(s * 22 + 12 + turn * 4, -22); g.stroke();
  }
  g.strokeStyle = NINK; g.lineWidth = 4; g.beginPath(); g.moveTo(-4 + turn * 4, -6); g.lineTo(4 + turn * 4, -6); g.stroke();
  g.beginPath(); g.moveTo(turn * 5, 4); g.quadraticCurveTo(8 + turn * 5, 20, -2 + turn * 5, 24); g.stroke();
  // moustache and mouth: the mouth opens a little on each word he reads
  g.beginPath(); g.moveTo(-22 + turn * 5, 34); g.quadraticCurveTo(turn * 5, 24, 22 + turn * 5, 34); g.quadraticCurveTo(turn * 5, 40, -22 + turn * 5, 34); g.fillStyle = '#4a2e1a'; g.fill();
  const m = mouthOpen(t, [101, 102, 104]);
  g.beginPath(); g.ellipse(turn * 5, 44, 12, 2 + m * 7, 0, 0, TAU); g.fillStyle = '#5a2020'; g.fill(); g.strokeStyle = NINK; g.lineWidth = 3; g.stroke();
  g.restore();
  // hands folded on a sheaf of copy (mittens)
  g.beginPath(); g.moveTo(x - 90, 392); g.lineTo(x + 100, 386); g.lineTo(x + 108, 430); g.lineTo(x - 84, 438); g.closePath(); nCel(g, '#f6f2e6', 3.5);
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x + s * 34, 400, 30, 22, s * .3, 0, TAU); nCel(g, '#e9b48c', 4); g.beginPath(); g.moveTo(x + s * 34 - 20, 420); g.lineTo(x + s * 80, 470); g.lineTo(x + s * 120, 470); g.lineTo(x + s * 60, 404); g.closePath(); nCel(g, '#7a5232', 4); }
}
function boxFrame(g, fn) {
  const b = { x: 548, y: 54, w: 340, h: 250 };
  g.save(); g.beginPath(); g.roundRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16, 18); g.fillStyle = '#0b1020'; g.fill();
  g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 14); g.clip();
  g.translate(b.x, b.y); fn(b.w, b.h); g.restore();
  g.strokeStyle = '#c8d0e0'; g.lineWidth = 4; g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 14); g.stroke();
}
function boxGlobe(g, w, h, t) {
  const rg = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, 220); rg.addColorStop(0, '#2a5aa8'); rg.addColorStop(1, '#0c1a3a'); g.fillStyle = rg; g.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, r = 92;
  g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fillStyle = '#e8862a'; g.fill();
  g.strokeStyle = '#1b1530'; g.lineWidth = 3;
  for (let k = 0; k < 6; k++) { const a = ((t * .9 + k / 6) % 1) * Math.PI; g.beginPath(); g.ellipse(cx, cy, Math.abs(Math.cos(a)) * r, r, 0, 0, TAU); g.stroke(); }
  for (const y of [-.5, 0, .5]) { g.beginPath(); g.ellipse(cx, cy + y * r, Math.sqrt(1 - y * y) * r, 10 * (1 - Math.abs(y)), 0, 0, TAU); g.stroke(); }
  g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.lineWidth = 5; g.stroke();
  g.strokeStyle = '#f2c230'; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy, r * 1.45, r * .4, -.35, 0, TAU); g.stroke();
}
function boxCalendar(g, w, h, t) {
  g.fillStyle = '#e8862a'; g.fillRect(0, 0, w, h);
  const u = clamp((t - C.tuesday) / .12);   // the page flips down into place
  g.save(); g.translate(w / 2, 40); g.scale(1, Math.max(.05, u));
  g.beginPath(); g.roundRect(-120, 0, 240, 200, 10); nCel(g, '#fbf8ee', 5);
  g.beginPath(); g.rect(-120, 0, 240, 46); nCel(g, '#c8303c', 5);
  for (const s of [-70, -24, 24, 70]) { g.beginPath(); g.arc(s, 2, 7, 0, TAU); nCel(g, '#c8d0e0', 3); }
  const wd = LN2[101].words[3].w.toUpperCase();
  const fs = fitText(g, wd, 200, 64, 'bold {s}px "Futura", "Helvetica Neue", sans-serif');
  g.font = `bold ${fs}px "Futura", "Helvetica Neue", sans-serif`; g.textAlign = 'center'; g.fillStyle = NINK; g.fillText(wd, 0, 142);
  g.restore();
}
function kingFace(g, cx, cy, s, t, smile) {
  g.save(); g.translate(cx, cy); g.scale(s, s);
  // ermine collar, face, grey curls and beard, the crown with its three jewels
  g.beginPath(); g.ellipse(0, 112, 120, 40, 0, Math.PI, TAU); g.lineTo(120, 140); g.lineTo(-120, 140); g.closePath(); nCel(g, '#f2eee4', 4);
  g.fillStyle = NINK; for (const bx of [-80, -40, 0, 40, 80]) { g.beginPath(); g.moveTo(bx, 96); g.lineTo(bx - 5, 110); g.lineTo(bx + 5, 110); g.closePath(); g.fill(); }
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(sd * (56 + k * 4), -6 + k * 24, 16, 0, TAU); nCel(g, '#b8b4b0', 3); }
  g.beginPath(); g.ellipse(0, 10, 58, 66, 0, 0, TAU); nCel(g, '#f0c8a0', 4.5);
  g.beginPath(); g.moveTo(-50, 30); g.quadraticCurveTo(-40, 96, 0, 100); g.quadraticCurveTo(40, 96, 50, 30); g.quadraticCurveTo(0, 60, -50, 30); g.closePath(); nCel(g, '#c8c4c0', 4);
  for (const sd of [-1, 1]) { g.fillStyle = 'rgba(240,110,110,.45)'; g.beginPath(); g.arc(sd * 32, 22, 11, 0, TAU); g.fill(); }
  // content, half-closed eyes; the smile widens on his cue
  g.strokeStyle = NINK; g.lineWidth = 4; g.lineCap = 'round';
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 21, 0, 10, .15 * Math.PI, .85 * Math.PI); g.stroke(); g.beginPath(); g.moveTo(sd * 30, -20); g.lineTo(sd * 12, -22 - smile * 4); g.stroke(); }
  g.beginPath(); g.ellipse(0, 18, 9, 7, 0, 0, TAU); nCel(g, '#e8a888', 3);
  g.beginPath(); g.arc(0, 30, 16 + smile * 8, (.2 - smile * .05) * Math.PI, (.8 + smile * .05) * Math.PI); g.lineWidth = 4.5; g.stroke();
  g.beginPath(); g.moveTo(-50, -44);
  for (let i = 0; i <= 8; i++) g.lineTo(-50 + i * 12.5, -44 - (i % 2 ? 16 : 46));
  g.lineTo(50, -44); g.closePath(); nCel(g, '#f2c444', 4);
  g.beginPath(); g.rect(-52, -52, 104, 14); nCel(g, '#c8962a', 3.5);
  for (const [jx, col] of [[-30, '#3a8ad9'], [0, '#c0284a'], [30, '#2aa060']]) { g.beginPath(); g.arc(jx, -45, 5, 0, TAU); g.fillStyle = col; g.fill(); }
  g.restore();
}
function boxKing(g, w, h, t) {
  g.fillStyle = '#5a1a2a'; g.fillRect(0, 0, w, h);
  g.beginPath(); g.ellipse(w / 2, h / 2 + 4, 120, 116, 0, 0, TAU); g.fillStyle = '#3a0e1a'; g.fill(); g.strokeStyle = '#d8a83a'; g.lineWidth = 12; g.stroke();
  g.save(); g.beginPath(); g.ellipse(w / 2, h / 2 + 4, 114, 110, 0, 0, TAU); g.clip();
  const sm = t >= C.mad ? smooth(clamp((t - C.mad) / .2)) : 0;
  kingFace(g, w / 2, h / 2 + 18, .95, t, sm);
  g.restore();
}
function rotaryPhone(g, x, y, s, ring, t) {
  // a 1970s desk phone, harvest gold: body, cream dial with finger holes, the handset on its cradle
  const R = ring ? Math.floor(t * 24) : 0, jx = ring ? (R % 2 ? 3 : -3) : 0, hop = ring ? (R % 4 < 2 ? 12 : 4) : 0;
  g.save(); g.translate(x + jx, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-74, 0); g.lineTo(-56, -70); g.quadraticCurveTo(0, -86, 56, -70); g.lineTo(74, 0); g.closePath(); nCel(g, '#d9a02a', 4.5);
  g.beginPath(); g.arc(0, -34, 28, 0, TAU); nCel(g, '#f6eedc', 3.5);
  for (let k = 0; k < 10; k++) { const a = -Math.PI * .1 + k / 12 * TAU; g.beginPath(); g.arc(Math.cos(a) * 19, -34 + Math.sin(a) * 19, 4.5, 0, TAU); g.fillStyle = '#7a5a20'; g.fill(); }
  g.beginPath(); g.arc(0, -34, 8, 0, TAU); g.fillStyle = '#d9a02a'; g.fill();
  g.save(); g.translate(0, -hop); g.rotate(ring ? (R % 2 ? .06 : -.06) : 0);
  g.beginPath(); g.moveTo(-84, -82); g.quadraticCurveTo(-90, -110, -64, -110); g.lineTo(64, -110); g.quadraticCurveTo(90, -110, 84, -82); g.lineTo(60, -76); g.quadraticCurveTo(0, -94, -60, -76); g.closePath(); nCel(g, '#d9a02a', 4.5);
  g.restore();
  // the coiled cord
  g.strokeStyle = '#a8761a'; g.lineWidth = 4; g.beginPath(); for (let k = 0; k <= 20; k++) { const xx = 74 + k * 3, yy = -12 + Math.sin(k * 1.6) * 6 + k * 1.2; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
  if (ring) { g.strokeStyle = '#fff3a0'; g.lineWidth = 5; for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(0, -70, 100 + k * 18 + (R % 2) * 6, sd > 0 ? -.5 : Math.PI - .2, sd > 0 ? .2 : Math.PI + .5); g.stroke(); } }
  g.restore();
}
const ringOn = (t) => t >= C.phone - .02 && t < LN2[104].e + .45;
function boxPhone(g, w, h, t) {
  g.fillStyle = '#2a8a84'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f6c64'; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(w / 2, h / 2 + 30); g.arc(w / 2, h / 2 + 30, 400, k / 8 * TAU, k / 8 * TAU + TAU / 16); g.closePath(); g.fill(); }
  rotaryPhone(g, w / 2, h - 40, 1.2, ringOn(t), t);
}
function sceneDesk(g, t) {
  g.drawImage(NW.set, 0, 0);
  const look = t >= C.l104 ? .6 : 0;
  drawAnchor(g, t, look);
  boxFrame(g, (w, h) => {
    if (t < C.tuesday - .02) boxGlobe(g, w, h, t);
    else if (t < C.king - .06) boxCalendar(g, w, h, t);
    else if (t < C.l103) boxKing(g, w, h, t);
    else boxPhone(g, w, h, t);
  });
}
// ---------- news film inserts ----------
function goldSack(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-60, 0); g.quadraticCurveTo(-84, -96, -36, -128); g.lineTo(36, -128); g.quadraticCurveTo(84, -96, 60, 0); g.closePath(); nCel(g, '#b08a50', 4.5);
  g.beginPath(); g.ellipse(0, -128, 40, 12, 0, 0, TAU); nCel(g, '#7a5a30', 4);
  for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(-24 + k * 12, -134 - (k % 2) * 5, 11, 8, 0, 0, TAU); nCel(g, '#f2c444', 3); }
  g.restore();
}
function scenePatent(g, t) {
  const tq = two2(t);
  woodGrain(g, 0, 0, 960, 720, '#6b3f22', 4242, true);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, 960, 720);
  // the patent: parchment, no words on it, only ruled wavy lines; a red wax seal and ribbons land on its cue
  g.save(); g.translate(330, 236); g.rotate(-.06);
  g.beginPath(); g.moveTo(-190, -190); g.lineTo(190, -190); g.lineTo(196, 200); g.lineTo(-184, 206); g.closePath(); nCel(g, '#f1e2bc', 5);
  g.strokeStyle = 'rgba(80,60,40,.55)'; g.lineWidth = 4;
  for (let k = 0; k < 9; k++) { g.beginPath(); for (let x = -150; x <= 150; x += 10) { const y = -140 + k * 30 + Math.sin(x * .09 + k) * 3; x > -150 ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  if (t >= C.patent - .02) {
    const p = two2(t) - C.patent < .08 ? 1.25 : 1;
    g.save(); g.translate(110, 140); g.scale(p, p);
    for (const a of [-.3, .3]) { g.save(); g.rotate(a); g.beginPath(); g.moveTo(-12, 0); g.lineTo(12, 0); g.lineTo(16, 90); g.lineTo(0, 76); g.lineTo(-16, 90); g.closePath(); nCel(g, '#2f6fc0', 3.5); g.restore(); }
    g.beginPath(); for (let k = 0; k <= 24; k++) { const a = k / 24 * TAU, r = 42 + (k % 2) * 6; k ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(r, 0); } g.closePath(); nCel(g, '#c0283a', 4);
    g.beginPath(); g.arc(0, 0, 24, 0, TAU); g.strokeStyle = '#8a1424'; g.lineWidth = 4; g.stroke();
    g.restore();
  }
  g.restore();
  // the king's sack of gold drops onto the desk, coins hop out
  if (t >= C.buying - .2) {
    const u = clamp((tq - (C.buying - .2)) / .2), y = lerp(-120, 400, u * u);
    goldSack(g, 720, y, 1.3);
    if (t >= C.buying) for (let k = 0; k < 6; k++) { const v = (tq - C.buying) / .5; if (v > 1.4) continue; const vv = Math.min(1, v); const x = 720 + (k - 2.5) * 34 * vv * 1.6, yy = 400 - Math.sin(vv * Math.PI) * (60 + k * 12) - 10; coin(g, x, yy, 14, k + tq * 9, null); }
  }
}
function sceneSpace(g, t) {
  const tq = two2(t);
  g.drawImage(NW.stars, 0, 0);
  // the earth's curve under the satellite, blue with green land
  const ex = 480, ey = 1000, er = 640;
  g.save(); g.beginPath(); g.arc(ex, ey, er, 0, TAU); g.fillStyle = '#2a6ac0'; g.fill(); g.clip();
  g.fillStyle = '#4f9a3c'; for (const [x, y, rx, ry] of [[260, 420, 120, 40], [600, 400, 160, 34], [860, 450, 90, 50], [430, 470, 80, 30]]) { g.beginPath(); g.ellipse(x, y, rx, ry, -.1, 0, TAU); g.fill(); }
  g.restore();
  g.strokeStyle = 'rgba(140,200,255,.6)'; g.lineWidth = 10; g.beginPath(); g.arc(ex, ey, er + 6, 0, TAU); g.stroke();
  // the satellite drifts in on its cue; on the last word it beams down and little burger-shaped ads pop up
  const u = smooth(clamp((t - (C.satellite - .1)) / .6)), sx = lerp(-120, 480, u), sy = 150 + Math.sin(t * 2) * 4;
  if (t >= C.ads) {
    const bu = clamp((t - C.ads) / .12);
    g.fillStyle = 'rgba(255,240,150,.32)'; g.beginPath(); g.moveTo(sx - 10, sy + 30); g.lineTo(sx + 10, sy + 30); g.lineTo(sx + 240 * bu, 400); g.lineTo(sx - 240 * bu, 400); g.closePath(); g.fill();
    for (let k = 0; k < 7; k++) { const t0 = C.ads + .06 + k * .05; if (tq < t0) continue; const p = two2(t) - t0 < .08 ? 1.2 : 1; drawBurger(g, 280 + k * 66, 396 + Math.abs(k - 3) * 8, .5 * p, 0); }
  }
  g.save(); g.translate(sx, sy); g.rotate(Math.sin(t * 1.5) * .08);
  for (const sd of [-1, 1]) { g.beginPath(); g.rect(sd > 0 ? 40 : -130, -18, 90, 36); nCel(g, '#2f5fa8', 3.5); g.strokeStyle = 'rgba(200,220,255,.6)'; g.lineWidth = 2; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo((sd > 0 ? 40 : -130) + k * 22.5, -18); g.lineTo((sd > 0 ? 40 : -130) + k * 22.5, 18); g.stroke(); } }
  g.strokeStyle = NINK; g.lineWidth = 4; for (const a of [2.2, 2.6, .6, 1]) { g.beginPath(); g.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); g.lineTo(Math.cos(a) * 110, Math.sin(a) * 110); g.stroke(); }
  g.beginPath(); g.arc(0, 0, 36, 0, TAU); nCel(g, '#d8d2c0', 4.5);
  g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(-12, -12, 12, 8, -.6, 0, TAU); g.fill();
  g.restore();
}
function sceneQueen(g, t) {
  const tq = two2(t), scr = t >= C.scream;
  const snap = scr ? 1.12 + (tq - C.scream < .1 ? .05 : 0) : 1, shake = scr ? Math.sin(tq * 70) * 4 : 0;
  g.save(); g.translate(480 + shake, 300); g.scale(snap, snap); g.translate(-480, -300);
  g.drawImage(NW.paper, 0, 0);
  const x = 480;
  // gown and pearls
  g.beginPath(); g.moveTo(x - 170, 520); g.quadraticCurveTo(x - 150, 330, x - 70, 300); g.lineTo(x + 70, 300); g.quadraticCurveTo(x + 150, 330, x + 170, 520); g.closePath(); nCel(g, '#e88aa8', 5);
  for (let k = -4; k <= 4; k++) { g.beginPath(); g.arc(x + k * 13, 302 + Math.abs(k) * -2 + k * k * 1.2, 6, 0, TAU); nCel(g, '#fbf8ee', 2.5); }
  // hair: a tall bouffant, a tiara
  g.beginPath(); g.ellipse(x, 160, 92, 100, 0, 0, TAU); nCel(g, '#c89a5a', 5);
  g.beginPath(); g.moveTo(x - 40, 82); for (let i = 0; i <= 4; i++) g.lineTo(x - 40 + i * 20, 82 - (i % 2 ? 6 : 24)); g.lineTo(x + 40, 82); g.closePath(); nCel(g, '#f2c444', 3.5);
  g.beginPath(); g.rect(x - 16, 250, 32, 52); nCel(g, '#f4c8a8', 4);
  g.beginPath(); g.ellipse(x, 206, 60, 70, 0, 0, TAU); nCel(g, '#f4c8a8', 5);
  g.beginPath(); g.moveTo(x - 62, 190); g.quadraticCurveTo(x - 50, 120, x, 128); g.quadraticCurveTo(x + 50, 120, x + 62, 190); g.quadraticCurveTo(x + 30, 150, x, 152); g.quadraticCurveTo(x - 30, 150, x - 62, 190); g.closePath(); nCel(g, '#c89a5a', 4);
  for (const sd of [-1, 1]) {
    if (scr) { g.beginPath(); g.ellipse(x + sd * 22, 196, 11, 14, 0, 0, TAU); nCel(g, '#ffffff', 3.5); g.beginPath(); g.arc(x + sd * 22, 198, 4, 0, TAU); g.fillStyle = NINK; g.fill(); g.strokeStyle = NINK; g.lineWidth = 4; g.beginPath(); g.moveTo(x + sd * 36, 168); g.lineTo(x + sd * 12, 176); g.stroke(); }
    else { g.fillStyle = NINK; g.beginPath(); g.arc(x + sd * 22, 198, 5, 0, TAU); g.fill(); g.strokeStyle = NINK; g.lineWidth = 4; g.beginPath(); g.arc(x + sd * 22, 190, 12, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); }
  }
  g.fillStyle = 'rgba(240,110,120,.5)'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(x + sd * 38, 224, 10, 0, TAU); g.fill(); }
  if (scr) { g.beginPath(); g.ellipse(x, 246, 18, 22, 0, 0, TAU); nCel(g, '#5a1a24', 4); }
  else { g.beginPath(); g.arc(x, 236, 12, .2 * Math.PI, .8 * Math.PI); g.strokeStyle = '#a8283a'; g.lineWidth = 4; g.stroke(); }
  // arms: holding a teacup, then mittens up at her cheeks while the cup flies off
  const arm = (pts, hx, hy) => { tube(g, pts, 26, '#e88aa8'); mitten(g, hx, hy, 18, 0, '#f4c8a8'); };
  if (scr) { arm([[x - 110, 330], [x - 120, 280], [x - 74, 236]], x - 74, 236); arm([[x + 110, 330], [x + 120, 280], [x + 74, 236]], x + 74, 236); }
  else { arm([[x - 110, 330], [x - 120, 400], [x - 60, 410]], x - 60, 410); arm([[x + 110, 330], [x + 120, 400], [x + 60, 410]], x + 60, 410); }
  const cupU = scr ? clamp((tq - C.scream) / .7) : 0;
  g.save(); g.translate(x + cupU * 300, 392 - Math.sin(cupU * Math.PI) * 260 + cupU * 40); g.rotate(cupU * 6);
  g.beginPath(); g.moveTo(-26, -20); g.lineTo(26, -20); g.quadraticCurveTo(24, 16, 0, 18); g.quadraticCurveTo(-24, 16, -26, -20); g.closePath(); nCel(g, '#fbf8ee', 3.5);
  g.beginPath(); g.arc(30, -4, 10, -1.4, 1.4); g.strokeStyle = NINK; g.lineWidth = 4; g.stroke();
  g.restore();
  g.restore();
  // scream lines, drawn after the zoom so they stay crisp
  if (scr) { g.strokeStyle = NINK; g.lineWidth = 6; g.lineCap = 'round'; const k0 = Math.floor(tq * 12) % 2; for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + k0 * .15, r0 = 190, r1 = 240 + (k % 2) * 30; if (Math.sin(a) > .55) continue; g.beginPath(); g.moveTo(480 + Math.cos(a) * r0, 230 + Math.sin(a) * r0 * .8); g.lineTo(480 + Math.cos(a) * r1, 230 + Math.sin(a) * r1 * .8); g.stroke(); } }
}
function bobby(g, x, y, k, t) {
  // a police constable: tall domed helmet with a badge, navy tunic, silver buttons; friendly round face
  g.beginPath(); g.roundRect(x - 50, y + 60, 100, 160, 24); nCel(g, '#1f2c5a', 5);
  for (let b = 0; b < 3; b++) { g.beginPath(); g.arc(x, y + 90 + b * 34, 6, 0, TAU); nCel(g, '#d8dce4', 2.5); }
  g.beginPath(); g.ellipse(x, y + 20, 40, 44, 0, 0, TAU); nCel(g, ['#f0c8a0', '#a8724a', '#e0b088', '#c89070'][k], 4.5);
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(x + sd * 14, y + 16, 5, 0, TAU); g.fillStyle = NINK; g.fill(); }
  if (k % 2 === 0) { g.beginPath(); g.moveTo(x - 18, y + 38); g.quadraticCurveTo(x, y + 28, x + 18, y + 38); g.quadraticCurveTo(x, y + 44, x - 18, y + 38); g.fillStyle = '#4a2e1a'; g.fill(); }
  g.strokeStyle = NINK; g.lineWidth = 3.5; g.beginPath(); g.arc(x, y + 40, 9, .2 * Math.PI, .8 * Math.PI); g.stroke();
  g.beginPath(); g.moveTo(x - 44, y - 4); g.quadraticCurveTo(x - 44, y - 92, x, y - 98); g.quadraticCurveTo(x + 44, y - 92, x + 44, y - 4); g.closePath(); nCel(g, '#1f2c5a', 4.5);
  g.beginPath(); g.ellipse(x, y - 4, 50, 10, 0, 0, TAU); nCel(g, '#1f2c5a', 4);
  g.beginPath(); star(g, x, y - 46, 14, 7, 6); nCel(g, '#d8dce4', 2.5);
  g.beginPath(); g.arc(x, y - 100, 7, 0, TAU); nCel(g, '#d8dce4', 2.5);
}
function sceneCops(g, t) {
  const tq = two2(t);
  // palace railings on a pale sky, a clipped hedge in front
  g.fillStyle = '#9cc8e8'; g.fillRect(0, 0, 960, 720);
  g.fillStyle = '#e8e0cc'; g.fillRect(0, 120, 960, 230); g.strokeStyle = 'rgba(120,110,90,.4)'; g.lineWidth = 3; for (let y = 140; y < 350; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(960, y); g.stroke(); }
  for (let x = 20; x < 960; x += 40) { g.strokeStyle = NINK; g.lineWidth = 7; g.beginPath(); g.moveTo(x, 360); g.lineTo(x, 200); g.stroke(); g.beginPath(); g.moveTo(x - 7, 204); g.lineTo(x, 186); g.lineTo(x + 7, 204); g.closePath(); g.fillStyle = '#d8a83a'; g.fill(); g.stroke(); }
  const up = t >= C.cops - .02 ? easeOutBack(clamp((tq - C.cops) / .25), 1.8) : 0;
  [180, 380, 580, 780].forEach((x, k) => {
    let y = lerp(520, 250, up);
    const ju = (tq - C.jump - k * .03) / .45; if (ju >= 0 && ju < 1) y -= Math.sin(ju * Math.PI) * 130;
    if (up > 0) bobby(g, x, y, k, t);
    if (ju >= 0 && ju < .5) { g.strokeStyle = NINK; g.lineWidth = 5; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(x + sd * 60, y + 140); g.lineTo(x + sd * 70, y + 190); g.stroke(); } }
  });
  // the hedge
  g.beginPath(); g.moveTo(0, 720); g.lineTo(0, 380); for (let x = 0; x <= 960; x += 30) g.quadraticCurveTo(x + 15, 360 + (x / 30 % 2) * 6, x + 30, 380); g.lineTo(960, 720); g.closePath(); nCel(g, '#3f7a34', 5);
  g.fillStyle = 'rgba(30,70,20,.5)'; for (let k = 0; k < 60; k++) { g.beginPath(); g.arc((k * 97) % 960, 400 + (k * 53) % 60, 6, 0, TAU); g.fill(); }
}
function lawyer(g, x, y, s, k, t, o) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.lean || 0);
  // black gown, white bands at the neck, a curled white wig; a briefcase
  g.beginPath(); g.moveTo(-50, 0); g.quadraticCurveTo(-56, 120, -66, 200); g.lineTo(66, 200); g.quadraticCurveTo(56, 120, 50, 0); g.closePath(); nCel(g, '#1c1a22', 5);
  g.beginPath(); g.moveTo(-10, 4); g.lineTo(-12, 44); g.lineTo(-1, 44); g.lineTo(0, 6); g.moveTo(10, 4); g.lineTo(12, 44); g.lineTo(1, 44); g.lineTo(0, 6); nCel(g, '#fbf8ee', 3);
  g.beginPath(); g.ellipse(0, -40, 36, 40, 0, 0, TAU); nCel(g, ['#f0c8a0', '#e0b088', '#f4d0b0', '#c89070', '#f0c8a0', '#e8bc94'][k % 6], 4.5);
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 13, -42, 4.5, 0, TAU); g.fillStyle = NINK; g.fill(); }
  g.strokeStyle = NINK; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-10, -18); g.lineTo(10, -20); g.stroke();
  g.beginPath(); g.moveTo(-40, -50); g.quadraticCurveTo(-40, -92, 0, -92); g.quadraticCurveTo(40, -92, 40, -50); g.lineTo(32, -60); g.quadraticCurveTo(0, -76, -32, -60); g.closePath(); nCel(g, '#eeeae0', 4);
  for (const sd of [-1, 1]) for (let r = 0; r < 3; r++) { g.beginPath(); g.ellipse(sd * 40, -62 + r * 16, 10, 8, 0, 0, TAU); nCel(g, '#eeeae0', 3); }
  // briefcase, open on its cue with papers flying
  const open = o.open || 0;
  g.save(); g.translate(56, 120);
  g.beginPath(); g.roundRect(-36, -10, 72, 52, 6); nCel(g, '#7a4a24', 4);
  g.beginPath(); g.roundRect(-12, -22, 24, 14, 5); g.strokeStyle = NINK; g.lineWidth = 4; g.stroke();
  if (open > 0) for (let p = 0; p < 3; p++) { const u = Math.min(1, open * (1 - p * .15)); g.save(); g.translate(-10 + p * 14 + u * (p - 1) * 50, -16 - u * (80 + p * 30)); g.rotate(u * (p - 1) * 1.4); g.beginPath(); g.rect(-16, -20, 32, 40); nCel(g, '#fbf8ee', 3); g.restore(); }
  g.restore();
  g.restore();
}
function activist(g, x, y, who, raise, t) {
  // the couple: ordinary stand-ins in winter coats, holding leaflets (blank sheets with ruled lines)
  const isW = who === 'w';
  if (!isW) { g.beginPath(); g.ellipse(x, y - 14, 46, 30, 0, 0, TAU); nCel(g, '#8a5428', 4); }   // his duffel coat's hood, down
  g.beginPath(); g.moveTo(x - 26, y - 6); g.quadraticCurveTo(x - 54, y - 2, x - 54, y + 34); g.lineTo(x - 60, y + 200); g.lineTo(x + 60, y + 200); g.lineTo(x + 54, y + 34); g.quadraticCurveTo(x + 54, y - 2, x + 26, y - 6); g.closePath(); nCel(g, isW ? '#3f7a5a' : '#b0703a', 5);
  if (isW) { g.strokeStyle = 'rgba(20,40,30,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 6, y + 10); g.lineTo(x + 8, y + 198); g.stroke(); for (let b = 0; b < 4; b++) { g.beginPath(); g.arc(x + 18, y + 40 + b * 40, 4, 0, TAU); g.fillStyle = '#1b1530'; g.fill(); } }
  else for (let b = 0; b < 3; b++) { g.beginPath(); g.roundRect(x - 14, y + 34 + b * 44, 28, 8, 4); nCel(g, '#f2e6c8', 2.5); }
  if (isW) { g.beginPath(); g.moveTo(x - 30, y - 4); g.quadraticCurveTo(x, y + 16, x + 30, y - 4); g.lineTo(x + 24, y + 70); g.lineTo(x + 10, y + 66); g.lineTo(x + 14, y + 14); g.quadraticCurveTo(x, y + 20, x - 30, y + 8); g.closePath(); nCel(g, '#c8303c', 3.5); }
  g.beginPath(); g.ellipse(x, y - 40, 34, 38, 0, 0, TAU); nCel(g, isW ? '#e8b890' : '#d8a078', 4.5);
  if (isW) { g.beginPath(); g.moveTo(x - 38, y - 24); g.quadraticCurveTo(x - 46, y - 86, x, y - 84); g.quadraticCurveTo(x + 46, y - 86, x + 38, y - 24); g.lineTo(x + 30, y - 24); g.quadraticCurveTo(x + 26, y - 60, x, y - 62); g.quadraticCurveTo(x - 26, y - 60, x - 30, y - 24); g.closePath(); nCel(g, '#3a2418', 4); }
  else { g.beginPath(); g.moveTo(x - 34, y - 44); g.quadraticCurveTo(x - 34, y - 82, x, y - 80); g.quadraticCurveTo(x + 34, y - 82, x + 34, y - 44); g.quadraticCurveTo(x, y - 66, x - 34, y - 44); g.closePath(); nCel(g, '#6a4a2a', 4); }
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(x + sd * 12, y - 42, 4.5, 0, TAU); g.fillStyle = NINK; g.fill(); }
  g.strokeStyle = NINK; g.lineWidth = 3.5; g.beginPath(); g.moveTo(x - 9, y - 20); g.lineTo(x + 9, y - 20); g.stroke();
  // arm and leaflet: at chest, then held up high
  const hy = lerp(y + 70, y - 100, raise), hx = x + (isW ? -1 : 1) * lerp(30, 54, raise);
  tube(g, [[x + (isW ? -1 : 1) * 40, y + 20], [x + (isW ? -1 : 1) * 64, lerp(y + 60, y - 20, raise)], [hx, hy]], 22, isW ? '#3f7a5a' : '#b0703a');
  g.save(); g.translate(hx, hy - 36); g.rotate((isW ? -1 : 1) * .08);
  g.beginPath(); g.rect(-30, -40, 60, 80); nCel(g, '#fbf8ee', 3.5);
  g.strokeStyle = 'rgba(40,30,50,.7)'; g.lineWidth = 3; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-20, -26 + k * 13); g.lineTo(20 - (k % 2) * 10, -26 + k * 13); g.stroke(); }
  g.restore();
  mitten(g, hx, hy, 14, 0, isW ? '#e8b890' : '#d8a078');
}
function sceneLawyers(g, t) {
  const tq = two2(t);
  // a plain street: a long brick wall, pavement
  g.fillStyle = '#d8c8a8'; g.fillRect(0, 0, 960, 720);
  g.strokeStyle = 'rgba(140,100,70,.35)'; g.lineWidth = 3; for (let y = 20; y < 420; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(960, y); g.stroke(); for (let x = (y / 28 % 2) * 30; x < 960; x += 60) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 28); g.stroke(); } }
  g.fillStyle = '#9a9488'; g.fillRect(0, 440, 960, 280); g.strokeStyle = NINK; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 440); g.lineTo(960, 440); g.stroke();
  const adv = smooth(clamp((t - C.l108) / (C.couple - C.l108))) * 110, back = t >= C.nerve ? smooth(clamp((t - C.nerve) / .3)) * 34 : 0;
  const lean = t >= C.nerve ? -.12 * Math.exp(-(t - C.nerve) * 2) - .04 : (t >= C.shown ? .08 : 0);
  const open = t >= C.work ? clamp((tq - C.work) / .6) : 0;
  // the shadow of the teams falls over the couple
  if (t >= C.shown - .02) { const a = smooth(clamp((tq - C.shown) / .3)) * (1 - (t >= C.nerve ? smooth(clamp((t - C.nerve) / .4)) * .6 : 0)); g.fillStyle = `rgba(20,16,30,${.4 * a})`; g.beginPath(); g.moveTo(120, 430); g.lineTo(560 - adv, 200); g.lineTo(700, 200); g.lineTo(700, 460); g.lineTo(80, 460); g.closePath(); g.fill(); }
  // two ranks of lawyers march in from the right, bobbing on twos
  const ranks = [[C.teams, 448, .78, [690, 790, 890]], [C.legal, 471, .9, [640, 750, 860]]];
  ranks.forEach(([t0, y, s, xs], r) => {
    // the front rank starts marching in on the line's first word and is in place on its cue
    const a0 = r ? C.l107 : t0 - .3;
    if (t < a0) return;
    const inU = smooth(clamp((tq - a0) / (t0 + .05 - a0)));
    xs.forEach((x0, k) => { const bob = (Math.floor(tq * 6) + k) % 2 ? -6 : 0; lawyer(g, x0 + (1 - inU) * 400 - adv + back, y - 210 * s + bob, s, r * 3 + k, t, { open, lean }); });
  });
  // the couple, firm, on the left; on the cue they hold their leaflets up high
  if (t >= C.couple - .02) {
    const p = popIn(tq, C.couple, .22), raise = t >= C.nerve ? easeOutBack(clamp((tq - C.nerve) / .3), 1.6) : 0;
    g.save(); g.translate(230, 460); g.scale(p, p); g.translate(-230, -460);
    activist(g, 170, 258, 'w', raise, t); activist(g, 300, 252, 'm', raise, t);
    g.restore();
    if (raise > 0) { g.strokeStyle = '#f2c230'; g.lineWidth = 6; for (let k = 0; k < 7; k++) { const a = -Math.PI * .9 + k * .3; g.beginPath(); g.moveTo(236 + Math.cos(a) * 190, 200 + Math.sin(a) * 150); g.lineTo(236 + Math.cos(a) * 230, 200 + Math.sin(a) * 182); g.stroke(); } }
  }
}
function sceneScales(g, t) {
  const tq = two2(t);
  // deep red curtain
  g.fillStyle = '#5a1222'; g.fillRect(0, 0, 960, 720);
  for (let x = 0; x < 960; x += 60) { const gr = g.createLinearGradient(x, 0, x + 60, 0); gr.addColorStop(0, 'rgba(0,0,0,.35)'); gr.addColorStop(.5, 'rgba(255,120,140,.12)'); gr.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = gr; g.fillRect(x, 0, 60, 720); }
  // the beam tips to the crown's side on its cue, a law book lands on the crown, the last cue bangs it down
  const spring = (t0, a) => t >= t0 ? a * (1 - Math.exp(-(t - t0) * 6) * Math.cos((t - t0) * 18)) : 0;
  let ang = spring(C.unfair, .26) + spring(C.laws + .1, .1) + spring(C.serve, .1);
  if (t >= C.serve) ang += Math.sin(tq * 60) * .015 * Math.exp(-(t - C.serve) * 4);
  const px = 480, py = 120, L = 270;
  g.beginPath(); g.moveTo(px - 70, 446); g.lineTo(px + 70, 446); g.lineTo(px + 40, 420); g.lineTo(px - 40, 420); g.closePath(); nCel(g, '#d8a83a', 4.5);
  g.beginPath(); g.rect(px - 9, py, 18, 300); nCel(g, '#d8a83a', 4);
  const ends = [-1, 1].map(sd => [px + sd * L * Math.cos(ang), py - sd * L * Math.sin(ang)]);
  g.save(); g.translate(px, py); g.rotate(-ang); g.beginPath(); g.roundRect(-L - 10, -9, 2 * L + 20, 18, 9); nCel(g, '#e8b84a', 4.5); g.restore();
  g.beginPath(); g.arc(px, py, 16, 0, TAU); nCel(g, '#f2c444', 4);
  ends.forEach(([ex, ey], i) => {
    const pyy = ey + 150;
    g.strokeStyle = NINK; g.lineWidth = 3; for (const dx of [-60, 0, 60]) { g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + dx, pyy); g.stroke(); }
    g.beginPath(); g.moveTo(ex - 76, pyy); g.quadraticCurveTo(ex, pyy + 54, ex + 76, pyy); g.closePath(); nCel(g, '#e8b84a', 4);
    if (i === 0) {
      // the crown, and the law book on top of it once it drops
      g.save(); g.translate(ex, pyy - 4); g.scale(.9, .9);
      g.beginPath(); g.moveTo(-50, 0); for (let k = 0; k <= 8; k++) g.lineTo(-50 + k * 12.5, k % 2 ? -26 : -58); g.lineTo(50, 0); g.closePath(); nCel(g, '#f2c444', 4);
      for (const [jx, col] of [[-30, '#3a8ad9'], [0, '#c0284a'], [30, '#2aa060']]) { g.beginPath(); g.arc(jx, -12, 6, 0, TAU); g.fillStyle = col; g.fill(); }
      g.restore();
      if (t >= C.libel - .02) {
        const u = clamp((tq - (C.libel - .02)) / (C.laws + .1 - C.libel)), by = lerp(-200, pyy - 84, u * u);
        g.save(); g.translate(ex, by); g.rotate(-.08);
        g.beginPath(); g.roundRect(-80, -26, 160, 52, 6); nCel(g, '#6b3a1e', 4.5);
        g.fillStyle = '#d8a83a'; for (const yy of [-14, 10]) g.fillRect(-80, yy, 160, 5);
        g.beginPath(); g.rect(-74, 20, 148, 8); g.fillStyle = '#f6f0e0'; g.fill();
        g.restore();
      }
      if (t >= C.kingS) { const u = clamp((tq - C.kingS) / .45); sparkle(g, ex + 38, pyy - 66, 34 * Math.sin(u * Math.PI) + 2, 1); }
    } else {
      g.save(); g.translate(ex, pyy - 34); g.rotate(.1);
      g.beginPath(); g.rect(-28, -36, 56, 72); nCel(g, '#fbf8ee', 3.5);
      g.strokeStyle = 'rgba(40,30,50,.7)'; g.lineWidth = 3; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-18, -22 + k * 12); g.lineTo(18 - (k % 2) * 10, -22 + k * 12); g.stroke(); }
      g.restore();
    }
  });
}
function drawNews(g, t) {
  if (t < C.l103) sceneDesk(g, t);
  else if (t < C.satellite - .1) scenePatent(g, t);
  else if (t < C.l104) sceneSpace(g, t);
  else if (t < C.l105) sceneDesk(g, t);
  else if (t < C.l106) sceneQueen(g, t);
  else if (t < C.l107) sceneCops(g, t);
  else if (t < C.l110) sceneLawyers(g, t);
  else sceneScales(g, t);
  // news film is a little warmer and softer than the studio
  if (t >= C.l103 && !(t >= C.l104 && t < C.l105)) { g.fillStyle = 'rgba(255,190,110,.06)'; g.fillRect(0, 0, 960, 720); }
}
// ---------- in the room ----------
// the side table and the rotary phone, in the foreground plane beside the king (frame coords at the room framing)
function drawRoomPhone(g, cam, t) {
  const xf = fgXf(cam); if (!xf) return;
  const [x, y] = fgPt(xf, 1610, 948); if (x > 2300) return;
  g.save(); g.translate(x, y); g.scale(xf.qf, xf.qf);
  g.fillStyle = '#3a2212'; g.beginPath(); g.moveTo(-20, 20); g.lineTo(20, 20); g.lineTo(30, 200); g.lineTo(-30, 200); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(0, 6, 170, 28, 0, 0, TAU); g.fillStyle = '#4a2c16'; g.fill();
  g.beginPath(); g.ellipse(0, 0, 170, 28, 0, 0, TAU); g.fillStyle = '#6b3f22'; g.fill(); g.strokeStyle = 'rgba(255,210,160,.25)'; g.lineWidth = 3; g.stroke();
  rotaryPhone(g, 0, -4, 1.45, ringOn(t), t);
  g.restore();
}
