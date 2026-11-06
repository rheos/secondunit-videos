// tv-B: the news bulletin's studio for stanzas 6-10, and stanzas 6 and 7 told through it. Same set as round 2's
// stanza 11 (js/tv/news.js): navy backdrop, orange dot-matrix world map, veneer desk, the anchor (glasses,
// sideburns, brown suit, wide orange tie). Three framings inside the program (960x720):
//   DESK  the anchor centre-left, the over-the-shoulder box top right (round 2's box, 340x250)
//   BIG   the anchor smaller at the left, a big box (560x420) carrying footage
//   FULL  a cut to the footage itself, full frame
// The kids' show (show.js), the commercial (ad.js) and the flannel-board lesson (lesson.js) appear only as
// footage inside the bulletin; their own clocks (B, C) are read from the same lines.json at the same song times,
// so they play on the word. The wire copy (r3b-captions.js) covers the lower third: every picture keeps faces
// above program y 460, and every head drawn is registered in R3BTV_HEADS for the faces check.
const R3BTV_HEADS = [];
const R3BTV_FOOT = mkCanvas(960, 720), r3bTvFg = R3BTV_FOOT.getContext('2d');
const R3BTV_BOX = { x: 548, y: 54, w: 340, h: 250 }, R3BTV_BIG = { x: 392, y: 24, w: 528, h: 396 };
function r3bTvHead(g, x0, y0, x1, y1) {
  // register a head box in program coords (through the current transform)
  const m = g.getTransform(), pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
  R3BTV_HEADS.push([Math.min(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])), Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1]))]);
}
function r3bTvReset(c) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  c.lineCap = 'butt'; c.lineJoin = 'miter'; c.lineWidth = 1; c.setLineDash([]); c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)';
  c.textAlign = 'start'; c.textBaseline = 'alphabetic'; c.font = '10px sans-serif'; c.fillStyle = '#000'; c.strokeStyle = '#000';
}
// ---------- the anchor (round 2's, with his mouth on this span's lines and a few extra gestures) ----------
function r3bTvMouth(t, lines) {
  let m = 0;
  for (const li of lines) for (const w of R3BTV_LN[li].words) if (t >= w.s && t < w.e + .1) m = Math.max(m, .5 + .5 * Math.sin(Math.min(1, (t - w.s) / Math.max(.08, w.e - w.s)) * Math.PI));
  return m;
}
// o: {look: -1..1 (turn toward the box), lines: [line numbers he reads], grave: 0..1, hush: 0..1, book: 0..1}
function r3bTvAnchor(g, t, o = {}) {
  const x = 290, turn = o.look || 0;
  const blink = (((t - R3BTV_T0) % 3.7) + 3.7) % 3.7 < .1;
  g.beginPath(); g.moveTo(x - 150, 470); g.quadraticCurveTo(x - 146, 300, x - 64, 278); g.lineTo(x + 64, 278); g.quadraticCurveTo(x + 146, 300, x + 150, 470); g.closePath(); nCel(g, '#7a5232', 5);
  g.beginPath(); g.moveTo(x - 46, 278); g.lineTo(x, 380); g.lineTo(x + 46, 278); g.closePath(); nCel(g, '#cfe0f0', 4);
  g.beginPath(); g.moveTo(x - 16, 290); g.lineTo(x + 16, 290); g.lineTo(x + 26, 390); g.lineTo(x, 412); g.lineTo(x - 26, 390); g.closePath(); nCel(g, '#e8862a', 4);
  g.save(); g.clip(); g.strokeStyle = 'rgba(110,50,20,.7)'; g.lineWidth = 6; for (let k = -2; k < 6; k++) { g.beginPath(); g.moveTo(x - 40, 300 + k * 24); g.lineTo(x + 40, 270 + k * 24); g.stroke(); } g.restore();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 46, 278); g.lineTo(x + s * 18, 360); g.lineTo(x + s * 70, 330); g.lineTo(x + s * 84, 288); g.closePath(); nCel(g, '#8d6440', 4); }
  g.beginPath(); g.rect(x - 22, 236, 44, 48); nCel(g, '#e9b48c', 4);
  g.save(); g.translate(x + turn * 6, 190); g.rotate(turn * .06 + (o.grave || 0) * .04);
  r3bTvHead(g, -64, -70, 64, 66);
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 52, 6, 10, 16, 0, 0, TAU); nCel(g, '#e9b48c', 3.5); }
  g.beginPath(); g.ellipse(0, 0, 52, 60, 0, 0, TAU); nCel(g, '#e9b48c', 4.5);
  g.beginPath(); g.moveTo(-54, 8); g.quadraticCurveTo(-60, -60, 0, -64); g.quadraticCurveTo(56, -64, 56, -10); g.quadraticCurveTo(30, -40, -14, -36); g.quadraticCurveTo(-36, -30, -44, 16); g.closePath(); nCel(g, '#4a2e1a', 4);
  for (const s of [-1, 1]) { g.beginPath(); g.rect(s * 48 - 5, -8, 10, 30); g.fillStyle = '#4a2e1a'; g.fill(); }
  const gr = o.grave || 0;
  for (const s of [-1, 1]) {
    g.beginPath(); g.roundRect(s * 22 - 18 + turn * 4, -10, 36, 26, 8); g.fillStyle = 'rgba(220,235,255,.25)'; g.fill(); g.strokeStyle = NINK; g.lineWidth = 5; g.stroke();
    if (blink) { g.beginPath(); g.moveTo(s * 22 - 8 + turn * 4, 4); g.lineTo(s * 22 + 8 + turn * 4, 4); g.lineWidth = 3; g.stroke(); }
    else { g.fillStyle = NINK; g.beginPath(); g.arc(s * 22 + turn * 7, 3, 4.5, 0, TAU); g.fill(); }
    // brows: level, or knitted when the news is grim
    g.strokeStyle = '#4a2e1a'; g.lineWidth = 5; g.beginPath(); g.moveTo(s * 22 - 14 + turn * 4, -20); g.lineTo(s * 22 + 12 + turn * 4, -22); g.stroke();
    if (gr > 0) { g.beginPath(); g.moveTo(s * 8 + turn * 4, -18 + 6 * gr); g.lineTo(s * 30 + turn * 4, -26); g.stroke(); }
  }
  g.strokeStyle = NINK; g.lineWidth = 4; g.beginPath(); g.moveTo(-4 + turn * 4, -6); g.lineTo(4 + turn * 4, -6); g.stroke();
  g.beginPath(); g.moveTo(turn * 5, 4); g.quadraticCurveTo(8 + turn * 5, 20, -2 + turn * 5, 24); g.stroke();
  g.beginPath(); g.moveTo(-22 + turn * 5, 34); g.quadraticCurveTo(turn * 5, 24, 22 + turn * 5, 34); g.quadraticCurveTo(turn * 5, 40, -22 + turn * 5, 34); g.fillStyle = '#4a2e1a'; g.fill();
  const m = o.lines ? r3bTvMouth(t, o.lines) : 0;
  g.beginPath(); g.ellipse(turn * 5, 44, 12, 2 + m * 7, 0, 0, TAU); g.fillStyle = '#5a2020'; g.fill(); g.strokeStyle = NINK; g.lineWidth = 3; g.stroke();
  g.restore();
  // hands: folded on the copy, or one mitten up for hush, or both holding up a book
  g.beginPath(); g.moveTo(x - 90, 392); g.lineTo(x + 100, 386); g.lineTo(x + 108, 430); g.lineTo(x - 84, 438); g.closePath(); nCel(g, '#f6f2e6', 3.5);
  const hush = o.hush || 0;
  for (const s of [-1, 1]) {
    if (o.book) continue;   // both hands are up holding the book (r3bTvBookProp)
    if (s > 0 && hush > 0) {
      const hx = lerp(x + 34, x + 30, hush), hy = lerp(400, 236, hush);
      tube(g, [[x + 80, 470], [x + 92, lerp(430, 330, hush)], [hx + 10, hy + 20]], 30, '#7a5232');
      mitten(g, hx, hy, 22, -.3, '#e9b48c');
      if (hush > .9) { g.beginPath(); g.roundRect(hx - 30, hy - 40, 12, 40, 6); nCel(g, '#e9b48c', 3); }
      continue;
    }
    g.beginPath(); g.ellipse(x + s * 34, 400, 30, 22, s * .3, 0, TAU); nCel(g, '#e9b48c', 4); g.beginPath(); g.moveTo(x + s * 34 - 20, 420); g.lineTo(x + s * 80, 470); g.lineTo(x + s * 120, 470); g.lineTo(x + s * 60, 404); g.closePath(); nCel(g, '#7a5232', 4);
  }
}
// the box: dark rounded surround, the footage clipped inside, a light rim
function r3bTvBox(g, b, draw) {
  g.save(); g.beginPath(); g.roundRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16, 18); g.fillStyle = '#0b1020'; g.fill();
  g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 14); g.clip();
  g.translate(b.x, b.y); draw(b.w, b.h); g.restore();
  g.strokeStyle = '#c8d0e0'; g.lineWidth = 4; g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 14); g.stroke();
}
// a 960x720 footage canvas drawn into a box, with an optional vertical-hold roll (u 0..1)
function r3bTvFootIn(g, w, h, roll) {
  if (roll === undefined) { g.drawImage(R3BTV_FOOT, 0, 0, w, h); return; }
  const off = (h + 30) * (1 - (1 - roll) ** 2.2);
  g.drawImage(R3BTV_FOOT, 0, -off, w, h); g.drawImage(R3BTV_FOOT, 0, -off + h + 30, w, h);
  g.fillStyle = '#000'; g.fillRect(0, h - off, w, 30); g.fillStyle = '#161616'; g.fillRect(0, h - off + 10, w, 8);
}
// framings: footage is rendered to R3BTV_FOOT first (foot(fg, t)), then placed
function r3bTvDesk(g, t, foot, o = {}) {
  g.drawImage(NW.set, 0, 0);
  r3bTvAnchor(g, t, o);
  if (foot) { r3bTvReset(r3bTvFg); foot(r3bTvFg, t); }
  r3bTvBox(g, R3BTV_BOX, (w, h) => o.boxDraw ? o.boxDraw(g, w, h) : r3bTvFootIn(g, w, h, o.roll));
}
function r3bTvBigBox(g, t, foot, o = {}) {
  g.drawImage(NW.set, 0, 0);
  g.save(); g.translate(170, 372); g.scale(.8, .8); g.translate(-290, -372);
  r3bTvAnchor(g, t, o);
  g.restore();
  r3bTvReset(r3bTvFg); foot(r3bTvFg, t);
  r3bTvBox(g, R3BTV_BIG, (w, h) => r3bTvFootIn(g, w, h, o.roll));
}
// the commercial was composed over its own sing-along band; lifted a little so its faces clear the wire copy
function r3bTvFull(g, t, foot) {
  const n0 = R3BTV_HEADS.length, k = 1028 / 960;
  r3bTvReset(r3bTvFg); foot(r3bTvFg, t); g.drawImage(R3BTV_FOOT, -34, -56, 1028, 771);
  for (let i = n0; i < R3BTV_HEADS.length; i++) R3BTV_HEADS[i] = R3BTV_HEADS[i].map((v, j) => j % 2 ? v * k - 56 : v * k - 34);   // footage -> program
}

// ---------- stanza 6 footage: the kids' show and the commercial, as the bulletin shows them ----------
function r3bTvShowFoot(g, t) { g.fillStyle = '#000'; g.fillRect(0, 0, 960, 720); if (t < B.card) drawShow(g, t); else drawCard(g, t); }
// the commercial as round 1 shot it (gate weave, film look), without its sing-along band: the wire copy carries the words
function r3bTvAdFoot(g, t) {
  g.fillStyle = '#000'; g.fillRect(0, 0, 960, 720);
  const f = Math.round(t * 24);
  g.save(); g.translate(n1(71, f * .7) * 1.2, n1(72, f * .7) * 1.6);
  if (t < B.inA) sceneClownKids(g, t);
  else if (t < B.tell) sceneStore(g, t);
  else if (t < B.ifYou) sceneSing(g, t);
  else if (t < B.endCard) sceneParty(g, t);
  else if (t < B.counter) sceneEndCard(g, t, r3bTvSpentHits(t));
  else sceneCounter(g, t);
  g.restore();
  filmLook(g, t);
}
// the king's coins, flying from his sack into the set during the end card, land on the box's picture
const R3BTV_SPENT = [];
function r3bTvInitSpent() { const RK = mulberry(4041); for (let t = B.coinsIn; t < B.trick - .3; t += .14) R3BTV_SPENT.push({ t, hx: 180 + RK() * 600, hy: 160 + RK() * 280, ph: RK() * 6, dx: (RK() - .5) * 30 }); }
function r3bTvSpentHits(t) { return R3BTV_SPENT.filter(c => t >= c.t + .42).map(c => ({ t: c.t + .42, x: c.hx, y: c.hy })); }
// where a footage point lands in the signal when the footage sits in the DESK box
function r3bTvBoxToSig(x, y) { return [R3BTV_BOX.x + x / 960 * R3BTV_BOX.w, R3BTV_BOX.y + y / 720 * R3BTV_BOX.h]; }

function r3bTvStanza6(g, t) {
  if (t < B.rapunzel - .06) {
    // the bulletin is on: the anchor, and in the box the puppet theatre waiting for its puppet
    r3bTvDesk(g, t, r3bTvShowFoot, { look: 0 });
  } else if (t < B.adStart) {
    // the kids' show, big in the box; on "stopped" the picture in the box rolls through the bar to the station card
    const roll = t >= B.stopped && t < B.rollEnd ? (t - B.stopped) / (B.rollEnd - B.stopped) : undefined;
    r3bTvBigBox(g, t, r3bTvShowFoot, { look: .55, roll });
  } else if (t < B.tell) {
    r3bTvFull(g, t, r3bTvAdFoot);                       // cut to the commercial itself: the clown, the kids, the counter
  } else if (t < B.ifYou) {
    r3bTvDesk(g, t, r3bTvAdFoot, { lines: [46], look: t > B.too ? .5 : 0 });   // the anchor tells the viewers; the clown conducts in the box
  } else if (t < B.endCard) {
    r3bTvFull(g, t, r3bTvAdFoot);                       // the party
  } else if (t < B.counter) {
    r3bTvDesk(g, t, r3bTvAdFoot, { look: .55 });        // the end card in the box; the king's coins fly into it from the room
  } else {
    r3bTvBigBox(g, t, r3bTvAdFoot, { look: .3, grave: smooth(clamp((t - B.thirty) / .3)) });   // the counter rolls to thirty
  }
}
// ---------- stanza 7: the flannel-board lesson as footage ----------
function r3bTvLessonFoot(g, t) { g.fillStyle = '#000'; g.fillRect(0, 0, 960, 720); drawLesson(g, t); }
// the book, held up by the anchor on its cue: red, a yellow border, felt-cut title letters (the lyric's own words)
function r3bTvBookProp(g, t, u) {
  const x = 446, y = lerp(520, 330, easeOutBack(u, 1.4));
  g.save(); g.translate(x, y); g.rotate(-.04);
  g.beginPath(); g.roundRect(-92, -120, 184, 240, 8); nCel(g, '#c8303c', 5);
  g.beginPath(); g.roundRect(-78, -106, 156, 212, 6); g.strokeStyle = '#f2c230'; g.lineWidth = 6; g.stroke();
  g.beginPath(); g.rect(-100, -120, 14, 240); nCel(g, '#8e1c26', 4);
  const ws = R3BTV_LN[57].words;
  g.fillStyle = '#fff3d2'; g.textAlign = 'center';
  const a = ws[1].w.replace(/"/g, '').toUpperCase(), b = ws[2].w.replace(/"/g, '').toUpperCase();
  if (t >= ws[1].s - .02) { const fs = fitText(g, a, 140, 30, 'bold {s}px "Futura", "Helvetica Neue", sans-serif'); g.font = `bold ${fs}px "Futura", "Helvetica Neue", sans-serif`; g.fillText(a, 0, -30); }
  if (t >= ws[2].s - .02) { const fs = fitText(g, b, 140, 44, 'bold {s}px "Futura", "Helvetica Neue", sans-serif'); g.font = `bold ${fs}px "Futura", "Helvetica Neue", sans-serif`; g.fillText(b, 0, 26); }
  g.restore();
  tube(g, [[250, 470], [300, 420], [x - 96, y + 40]], 30, '#7a5232');
  tube(g, [[330, 470], [430, y + 110], [x + 96, y + 40]], 30, '#7a5232');
  for (const s of [-1, 1]) { mitten(g, x + s * 96, y + 40, 24, s * .4, '#e9b48c'); }
}
function r3bTvStanza7(g, t) {
  if (t < C.l56 - .12) r3bTvBigBox(g, t, r3bTvLessonFoot, { look: .55 });                // ink, the publishing house, the wallet, the stacks
  else if (t < C.l58 - .04) {
    // the anchor holds the book up to camera; the box shows the board where its title is being cut
    r3bTvDesk(g, t, r3bTvLessonFoot, { lines: [56], look: t < C.book ? .4 : -.3, book: t >= C.book - .02 });
    if (t >= C.book - .02) r3bTvBookProp(g, t, clamp((two2(t) - C.book) / .25));
  }
  else if (t < C.l62 - .05) r3bTvBigBox(g, t, r3bTvLessonFoot, { look: .55 });           // the doctor, the free book, the bun, the cola
  else r3bTvDesk(g, t, r3bTvLessonFoot, { lines: [62], look: t > C.l63 ? .5 : 0 });       // the people, the stamp, the fries, the tip jar
}
