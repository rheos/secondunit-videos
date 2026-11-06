// Round 3, tv-C: the program for stanzas 12-14, the end of the same 1970s news bulletin as stanza 11 (news.js),
// on the same set in the same room. Studio: the anchor at the veneer desk with the over-the-shoulder box. Court
// report: the artist's pastel sketches (r3c-sketch.js), panned by the rostrum camera. News film: cel inserts in
// news.js's manner (one ink line, flat paint, animated on twos, a little warmer). The wire copy covers program
// y 468-682, so every picture keeps its people's heads above y 460 (r3cHead registers each head box; the page
// checks them against the strip on every frame). Pure: a function of song time t only.
const R3C_O = {};
const R3C_HEADS = [];
// register a head box (local coords under the current transform) in program pixels
function r3cHead(g, x, y, w, h, who) {
  const m = g.getTransform(), pts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([a, b]) => [m.a * a + m.c * b + m.e, m.b * a + m.d * b + m.f]);
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  R3C_HEADS.push({ who, x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) });
}
function r3cMouth(t, lines) {
  let m = 0;
  for (const li of lines) for (const w of R3C_LN[li].words) if (t >= w.s && t < w.e + .1) m = Math.max(m, .5 + .5 * Math.sin(Math.min(1, (t - w.s) / Math.max(.08, w.e - w.s)) * Math.PI));
  return m;
}
// ---------- the anchor (a copy of news.js drawAnchor with a few more moves: reading, turning, shuffling) ----------
function r3cAnchor(g, t, o = {}) {
  const x = 290, turn = o.look || 0, nod = o.nod || 0, lift = o.lift || 0;
  const blink = (((t - R3C_SPAN[0]) % 3.3) + 3.3) % 3.3 < .1;
  g.beginPath(); g.moveTo(x - 150, 470); g.quadraticCurveTo(x - 146, 300, x - 64, 278); g.lineTo(x + 64, 278); g.quadraticCurveTo(x + 146, 300, x + 150, 470); g.closePath(); nCel(g, '#7a5232', 5);
  g.beginPath(); g.moveTo(x - 46, 278); g.lineTo(x, 380); g.lineTo(x + 46, 278); g.closePath(); nCel(g, '#cfe0f0', 4);
  g.beginPath(); g.moveTo(x - 16, 290); g.lineTo(x + 16, 290); g.lineTo(x + 26, 390); g.lineTo(x, 412); g.lineTo(x - 26, 390); g.closePath(); nCel(g, '#e8862a', 4);
  g.save(); g.clip(); g.strokeStyle = 'rgba(110,50,20,.7)'; g.lineWidth = 6; for (let k = -2; k < 6; k++) { g.beginPath(); g.moveTo(x - 40, 300 + k * 24); g.lineTo(x + 40, 270 + k * 24); g.stroke(); } g.restore();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 46, 278); g.lineTo(x + s * 18, 360); g.lineTo(x + s * 70, 330); g.lineTo(x + s * 84, 288); g.closePath(); nCel(g, '#8d6440', 4); }
  g.beginPath(); g.rect(x - 22, 236, 44, 48); nCel(g, '#e9b48c', 4);
  g.save(); g.translate(x + turn * 6, 190 + nod * 8); g.rotate(turn * .06);
  r3cHead(g, -62, -66, 124, 128, 'anchor');
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 52, 6, 10, 16, 0, 0, TAU); nCel(g, '#e9b48c', 3.5); }
  g.beginPath(); g.ellipse(0, 0, 52, 60, 0, 0, TAU); nCel(g, '#e9b48c', 4.5);
  g.beginPath(); g.moveTo(-54, 8); g.quadraticCurveTo(-60, -60, 0, -64); g.quadraticCurveTo(56, -64, 56, -10); g.quadraticCurveTo(30, -40, -14, -36); g.quadraticCurveTo(-36, -30, -44, 16); g.closePath(); nCel(g, '#4a2e1a', 4);
  for (const s of [-1, 1]) { g.beginPath(); g.rect(s * 48 - 5, -8, 10, 30); g.fillStyle = '#4a2e1a'; g.fill(); }
  const eyeDy = nod * 3;
  for (const s of [-1, 1]) {
    g.beginPath(); g.roundRect(s * 22 - 18 + turn * 4, -10, 36, 26, 8); g.fillStyle = 'rgba(220,235,255,.25)'; g.fill(); g.strokeStyle = NINK; g.lineWidth = 5; g.stroke();
    if (blink || o.down) { g.beginPath(); g.moveTo(s * 22 - 8 + turn * 4, 4 + eyeDy); g.lineTo(s * 22 + 8 + turn * 4, 4 + eyeDy); g.lineWidth = 3; g.stroke(); }
    else { g.fillStyle = NINK; g.beginPath(); g.arc(s * 22 + turn * 7, 3, 4.5, 0, TAU); g.fill(); }
    g.strokeStyle = '#4a2e1a'; g.lineWidth = 5; g.beginPath(); g.moveTo(s * 22 - 14 + turn * 4, -20); g.lineTo(s * 22 + 12 + turn * 4, -22); g.stroke();
  }
  g.strokeStyle = NINK; g.lineWidth = 4; g.beginPath(); g.moveTo(-4 + turn * 4, -6); g.lineTo(4 + turn * 4, -6); g.stroke();
  g.beginPath(); g.moveTo(turn * 5, 4); g.quadraticCurveTo(8 + turn * 5, 20, -2 + turn * 5, 24); g.stroke();
  g.beginPath(); g.moveTo(-22 + turn * 5, 34); g.quadraticCurveTo(turn * 5, 24, 22 + turn * 5, 34); g.quadraticCurveTo(turn * 5, 40, -22 + turn * 5, 34); g.fillStyle = '#4a2e1a'; g.fill();
  const m = o.mouth ? r3cMouth(t, o.mouth) : 0;
  g.beginPath(); g.ellipse(turn * 5, 44, 12, 2 + m * 7, 0, 0, TAU); g.fillStyle = '#5a2020'; g.fill(); g.strokeStyle = NINK; g.lineWidth = 3; g.stroke();
  g.restore();
  // the sheaf of copy under folded mittens; at the close he squares it, tapping it on the desk
  g.save(); g.translate(0, -lift);
  g.beginPath(); g.moveTo(x - 90, 392); g.lineTo(x + 100, 386); g.lineTo(x + 108, 430); g.lineTo(x - 84, 438); g.closePath(); nCel(g, '#f6f2e6', 3.5);
  g.restore();
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x + s * 34 + s * lift * .3, 400 - lift, 30, 22, s * .3, 0, TAU); nCel(g, '#e9b48c', 4); g.beginPath(); g.moveTo(x + s * 34 - 20, 420 - lift); g.lineTo(x + s * 80, 470); g.lineTo(x + s * 120, 470); g.lineTo(x + s * 60, 404 - lift); g.closePath(); nCel(g, '#7a5232', 4); }
}
function r3cBoxFrame(g, b, fn) {
  g.save(); g.beginPath(); g.roundRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16, 18); g.fillStyle = '#0b1020'; g.fill();
  g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 14); g.clip();
  g.translate(b.x, b.y); fn(b.w, b.h); g.restore();
  g.strokeStyle = '#c8d0e0'; g.lineWidth = 4; g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 14); g.stroke();
}
const R3C_BOX = { x: 548, y: 54, w: 340, h: 250 }, R3C_BIG = { x: 420, y: 36, w: 500, h: 389 };
// a box picture flips in (scaleY from the top) over 0.12 s from t0, the way news.js's calendar does
function r3cFlip(g, w, t, t0) { const u = clamp((t - t0) / .12); g.translate(0, 0); g.scale(1, Math.max(.04, u)); return u; }
// the calendar in the box: its pages tear off faster and faster (the longest case)
function r3cBoxCalendar(g, w, h, t) {
  g.fillStyle = '#e8862a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,50,10,.35)'; g.lineWidth = 3; for (let k = -6; k < 12; k++) { g.beginPath(); g.moveTo(k * 40, 0); g.lineTo(k * 40 + 200, h); g.stroke(); }
  const page = (gg) => {
    gg.beginPath(); gg.roundRect(-110, 0, 220, 190, 10); nCel(gg, '#fbf8ee', 5);
    gg.beginPath(); gg.rect(-110, 0, 220, 40); nCel(gg, '#c8303c', 5);
    gg.strokeStyle = 'rgba(40,30,50,.45)'; gg.lineWidth = 2.5;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { gg.beginPath(); gg.rect(-96 + c * 28, 52 + r * 26, 22, 20); gg.stroke(); }
  };
  g.save(); g.translate(w / 2, 34); page(g);
  for (const s of [-70, -24, 24, 70]) { g.beginPath(); g.arc(s, 2, 7, 0, TAU); nCel(g, '#c8d0e0', 3); }
  g.restore();
  for (const p of R3C_O.tears) {
    const u = (r3cTwo(t) - p.t) / .5; if (u < 0 || u >= 1) continue;
    g.save(); g.translate(w / 2 + u * p.vx, 34 - u * 60 + u * u * 220); g.rotate(u * p.rot); g.scale(1 - u * .3, 1 - u * .3); page(g); g.restore();
  }
}
// a small console TV in the box; on its cue it lights up showing the couple
function r3cBoxTV(g, w, h, t) {
  g.fillStyle = '#2a8a84'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f6c64'; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(w / 2, h / 2); g.arc(w / 2, h / 2, 400, k / 8 * TAU, k / 8 * TAU + TAU / 16); g.closePath(); g.fill(); }
  const x = w / 2 - 10, y = h / 2 + 10, on = t >= R3CQ.tv - .02, p = on ? popIn(r3cTwo(t), R3CQ.tv, .2) : 1;
  g.save(); g.translate(x, y); g.scale(p, p);
  g.beginPath(); g.roundRect(-120, -86, 240, 166, 14); nCel(g, '#7a4a26', 5);
  g.beginPath(); g.roundRect(-104, -72, 160, 120, 18); nCel(g, on ? '#bfe0f0' : '#2a3a3a', 4);
  if (on) {
    g.save(); g.beginPath(); g.roundRect(-104, -72, 160, 120, 18); g.clip();
    for (const [hx, col, hair] of [[-50, '#3f7a5a', '#3a2418'], [4, '#b0703a', '#6a4a2a']]) {
      g.beginPath(); g.ellipse(hx, 40, 30, 30, 0, 0, TAU); nCel(g, col, 3);
      g.beginPath(); g.ellipse(hx, -6, 18, 20, 0, 0, TAU); nCel(g, '#e8b890', 3);
      g.beginPath(); g.ellipse(hx, -18, 19, 11, 0, Math.PI, TAU); nCel(g, hair, 3);
      g.fillStyle = NINK; for (const sd of [-1, 1]) { g.beginPath(); g.arc(hx + sd * 6, -6, 2.5, 0, TAU); g.fill(); }
    }
    g.restore();
  }
  for (const ky of [-50, -10]) { g.beginPath(); g.arc(88, ky, 12, 0, TAU); nCel(g, '#d8d2c4', 3); }
  g.strokeStyle = NINK; g.lineWidth = 4; g.beginPath(); g.moveTo(-20, -86); g.lineTo(-60, -130); g.moveTo(-20, -86); g.lineTo(30, -134); g.stroke();
  g.restore();
}
// the court sketch, small: the whole courtroom, then (on its cue) the artist's study of the judge
function r3cBoxCourt(g, w, h, t) {
  if (t < R3CQ.judge - .02) { g.drawImage(R3C_SK.court, 120, 40, 1680, 1236, 0, 0, w, h); g.drawImage(R3C_SK.couple, 120, 40, 1680, 1236, 0, 0, w, h); g.drawImage(R3C_SK.judge.up, 120, 40, 1680, 1236, 0, 0, w, h); return; }
  g.save(); r3cFlip(g, w, t, R3CQ.judge - .02); g.drawImage(R3C_SK.portrait, 0, 0, w, h); g.restore();
}
// the five views, one drawing each, flipped in on each line's first word; the key word's part pops in on its word
function r3cBoxView(g, w, h, t) {
  let k = 0; while (k < 4 && t >= R3CQ.views[k + 1] - .02) k++;
  g.save(); r3cFlip(g, w, t, R3CQ.views[k] - .02);
  g.drawImage(R3C_SK.views[k][0], 0, 0, w, h);
  if (t >= R3CQ.viewKey[k] - .02) {
    // the artist's addition lands with a small chalk flash for two frames
    const p = r3cTwo(t) - R3CQ.viewKey[k] < .08 ? 1.06 : 1;
    g.save(); g.translate(w / 2, h / 2); g.scale(p, p); g.translate(-w / 2, -h / 2); g.drawImage(R3C_SK.views[k][1], 0, 0, w, h); g.restore();
  }
  g.restore();
}
function r3cDesk(g, t, o) {
  g.drawImage(NW.set, 0, 0);
  r3cAnchor(g, t, o);
  r3cBoxFrame(g, o.big ? R3C_BIG : R3C_BOX, (w, h) => o.box(g, w, h, t));
}
// ---------- court sketches on the rostrum ----------
const R3C_V_WIDE = [120, 420, 1200], R3C_V_JURY = [20, 560, 760], R3C_V_COUPLE = [1000, 560, 900], R3C_V_JUDGE = [480, 110, 960], R3C_V_VERDICT = [560, 70, 800];
function r3cPan(t, keys) {   // keys: [[t, rect, ease dur]] -> rect at t (each move eases over its dur)
  let r = keys[0][1];
  for (let i = 1; i < keys.length; i++) { const [t0, r1, d] = keys[i]; if (t < t0) break; const u = d ? smooth(clamp((t - t0) / d)) : 1; r = r.map((v, j) => lerp(v, r1[j], u)); }
  return r;
}
function r3cCourt(g, t, rect, layers, extra) {
  const [rx, ry, rw] = rect, rh = rw * .75, k = 960 / rw;
  g.fillStyle = '#7f8ea1'; g.fillRect(0, 0, 960, 720);
  for (const L of layers) g.drawImage(L, rx, ry, rw, rh, 0, 0, 960, 720);
  g.save(); g.scale(k, k); g.translate(-rx, -ry);
  if (layers.includes(R3C_SK.couple) || layers.includes(R3C_SK.coupleShrug)) for (const b of R3C_SK_COURT.heads.couple) r3cHead(g, ...b, 'couple');
  if (Object.values(R3C_SK.judge).some(L => layers.includes(L))) { const nd = layers.includes(R3C_SK.judge.nod) ? 14 : 0; const b = R3C_SK_COURT.heads.judge; r3cHead(g, b[0], b[1] + nd, b[2], b[3], 'judge'); }
  if (extra) extra(g);
  g.restore();
}
function r3cSceneCase(g, t) {   // line 112: the empty jury box, then the couple alone at their table
  const rect = r3cPan(t, [[R3CQ.l112, R3C_V_WIDE], [R3CQ.l112 + .01, [100, 440, 1140], 1.5], [R3CQ.jury - .3, R3C_V_JURY, .35], [R3CQ.no2 - .1, R3C_V_COUPLE, .4]]);
  const shrug = t >= R3CQ.aid - .02;
  r3cCourt(g, t, rect, [R3C_SK.court, shrug ? R3C_SK.coupleShrug : R3C_SK.couple, R3C_SK.judge.up], (q) => {
    if (t >= R3CQ.jury - .05) {   // a pale shaft of window light falls on the empty benches
      const a = smooth(clamp((t - (R3CQ.jury - .05)) / .3)) * .55;
      q.save(); q.globalCompositeOperation = 'screen';
      const lg = q.createLinearGradient(300, 80, 300, 900); lg.addColorStop(0, `rgba(255,248,225,${a})`); lg.addColorStop(1, `rgba(255,248,225,${a * .35})`);
      q.fillStyle = lg; q.beginPath(); q.moveTo(380, 0); q.lineTo(520, 0); q.lineTo(560, 900); q.lineTo(60, 900); q.closePath(); q.fill(); q.restore();
    }
  });
}
function r3cSceneJudgeAgrees(g, t) {   // line 118: the judge nods, then the camera finds the couple
  const rect = r3cPan(t, [[R3CQ.l118, R3C_V_JUDGE], [R3CQ.l118 + .01, [470, 100, 940], 2.4], [R3CQ.couple - .1, R3C_V_COUPLE, .5]]);
  const a = R3CQ.agreed, nod = (t >= a && t < a + .26) || (t >= a + .52 && t < a + .8);
  r3cCourt(g, t, rect, [R3C_SK.court, R3C_SK.couple, nod ? R3C_SK.judge.nod : R3C_SK.judge.up]);
}
function r3cSceneVerdict(g, t) {   // line 124: the gavel comes down on each stroke; on the last a purse lands on their table
  const tq = r3cTwo(t);
  if (t < R3CQ.fuss - .02) {
    const hits = [R3CQ.fine, R3CQ.guilty], down = hits.some(h => t >= h - .02 && t < h + .28);
    const last = hits.filter(h => t >= h - .02).pop(), shake = last !== undefined && t < last + .14 ? Math.sin(tq * 90) * 6 : 0;
    g.save(); g.translate(shake, 0);
    r3cCourt(g, t, R3C_V_VERDICT, [R3C_SK.court, R3C_SK.couple, down ? R3C_SK.judge.gavelDown : R3C_SK.judge.gavelUp], (q) => {
      if (down) { const u = clamp((t - last) / .25); q.strokeStyle = `rgba(250,246,234,${.85 * (1 - u)})`; q.lineWidth = 6; q.lineCap = 'round'; for (let k = 0; k < 7; k++) { const an = -Math.PI * (.15 + k * .12); q.beginPath(); q.moveTo(1263 + Math.cos(an) * 50, 410 + Math.sin(an) * 40); q.lineTo(1263 + Math.cos(an) * (100 + u * 40), 410 + Math.sin(an) * (80 + u * 30)); q.stroke(); } }
    });
    g.restore();
  } else {
    r3cCourt(g, t, R3C_V_COUPLE, [R3C_SK.court, R3C_SK.couple], (q) => {
      const u = clamp((tq - (R3CQ.fuss - .02)) / .16), y = lerp(560, 930 - 196, u * u);
      const sq = tq - R3CQ.fuss > .14 && tq - R3CQ.fuss < .26 ? [1.1, .88] : [1, 1];
      q.save(); q.translate(1500, y + 196); q.scale(sq[0] * .55, sq[1] * .55); q.drawImage(R3C_SK.purse, -110, -196 + 10); q.restore();
    });
  }
}
// ---------- news film ----------
function r3cFilm(g) { g.fillStyle = 'rgba(255,190,110,.06)'; g.fillRect(0, 0, 960, 720); }
function r3cNavy(g) {
  const gr = g.createLinearGradient(0, 0, 0, 720); gr.addColorStop(0, '#162544'); gr.addColorStop(1, '#24375e'); g.fillStyle = gr; g.fillRect(0, 0, 960, 720);
}
function r3cSceneMoney(g, t) {   // line 113: a news graphic, the king's money against the couple's
  const tq = r3cTwo(t);
  g.drawImage(R3C_O.dots, 0, 0);
  g.strokeStyle = '#f0963c'; g.lineWidth = 5; g.beginPath(); g.moveTo(40, 442); g.lineTo(920, 442); g.stroke();
  // the couple's means: two coins and a leaflet
  coin(g, 150, 426, 14, 0, null); coin(g, 150, 412, 14, 0, null);
  g.save(); g.translate(196, 404); g.rotate(-.1); g.beginPath(); g.rect(-20, -26, 40, 52); nCel(g, '#fbf8ee', 3); g.strokeStyle = 'rgba(40,30,50,.7)'; g.lineWidth = 2.5; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-12, -14 + k * 10); g.lineTo(12 - (k % 2) * 8, -14 + k * 10); g.stroke(); } g.restore();
  // columns of gold shoot up on the number and again on the next word
  const cols = [[R3CQ.n30, [330, 410, 490]], [R3CQ.billions, [570, 650, 730, 810]]];
  for (const [t0, xs] of cols) {
    if (t < t0 - .02) continue;
    xs.forEach((x, k) => {
      const u = easeOutBack(clamp((tq - t0 - k * .04) / .3), 1.4), hgt = (200 + (k % 2) * 30 + (t0 === R3CQ.billions ? 20 : 0)) * u;
      for (let y = 430; y > 430 - hgt; y -= 14) { g.beginPath(); g.ellipse(x, y, 32, 9, 0, 0, TAU); nCel(g, (y / 14) % 2 < 1 ? '#f2c444' : '#d9a52c', 2.5); }
    });
  }
  // sacks pile up at their feet and coins spill out; on the last word the coins pour away
  if (t >= R3CQ.dollars - .02) {
    [[380, 0], [520, .05], [700, .1], [850, .15]].forEach(([x, d]) => { const p = popIn(tq, R3CQ.dollars + d, .22); if (p > 0) goldSack(g, x, 442, .55 * p); });
    for (let k = 0; k < 10; k++) { const u = (tq - R3CQ.dollars - k * .05) / .55; if (u < 0 || u > 1.6) continue; const v = Math.min(1, u); coin(g, 400 + k * 46 + v * 30, 440 - Math.sin(v * Math.PI) * (60 + (k % 3) * 20), 11, k + tq * 9, null); }
  }
  if (t >= R3CQ.spend - .02) for (let k = 0; k < 16; k++) { const u = (tq - R3CQ.spend - k * .04) / .7; if (u < 0 || u > 1) continue; coin(g, lerp(560, 1000, u), 300 - Math.sin(u * Math.PI) * 120 + k * 4, 12, k + tq * 11, null); }
  // the king, in his gilt oval, above it all
  if (t >= R3CQ.king - .02) {
    const p = popIn(tq, R3CQ.king, .25), cx = 640, cy = 100;
    g.save(); g.translate(cx, cy); g.scale(p, p); g.translate(-cx, -cy);
    g.beginPath(); g.ellipse(cx, cy + 6, 84, 80, 0, 0, TAU); g.fillStyle = '#5a1a2a'; g.fill(); g.strokeStyle = '#d8a83a'; g.lineWidth = 9; g.stroke();
    g.save(); g.beginPath(); g.ellipse(cx, cy + 6, 79, 75, 0, 0, TAU); g.clip();
    kingFace(g, cx, cy + 16, .62, t, t >= R3CQ.spend ? 1 : smooth(clamp((t - R3CQ.n30) / .3)));
    r3cHead(g, cx - 40, cy - 30, 80, 92, 'king');
    g.restore(); g.restore();
  }
}
function r3cBricks(g) {
  g.fillStyle = '#d8c8a8'; g.fillRect(0, 0, 960, 720);
  g.strokeStyle = 'rgba(140,100,70,.35)'; g.lineWidth = 3; for (let y = 20; y < 420; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(960, y); g.stroke(); for (let x = (y / 28 % 2) * 30; x < 960; x += 60) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 28); g.stroke(); } }
  g.fillStyle = '#9a9488'; g.fillRect(0, 440, 960, 280); g.strokeStyle = NINK; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 440); g.lineTo(960, 440); g.stroke();
}
function r3cSceneCrush(g, t) {   // line 114: the king's barristers bring a great bundle down over the couple; it stops on their leaflets
  const tq = r3cTwo(t);
  r3cBricks(g);
  const lean = t >= R3CQ.defend ? -.1 * Math.exp(-(t - R3CQ.defend) * 2) : .08;
  [[620, .9, 0], [730, .9, 1], [840, .9, 2]].forEach(([x, s, k]) => { const bob = (Math.floor(tq * 6) + k) % 2 ? -4 : 0, y = 448 - 210 * s + bob; lawyer(g, x, y, s, k + 2, t, { lean }); g.save(); g.translate(x, y); g.scale(s, s); g.rotate(lean); r3cHead(g, -42, -96, 84, 98, 'barrister'); g.restore(); });
  const raise = t >= R3CQ.defend - .02 ? easeOutBack(clamp((tq - R3CQ.defend) / .3), 1.6) : 0;
  activist(g, 210, 258, 'w', raise, t); activist(g, 340, 252, 'm', raise, t);
  for (const [x, y] of [[210, 258], [340, 252]]) r3cHead(g, x - 40, y - 88, 80, 90, 'couple');
  // the bundle of papers, tied with red tape, comes down on the cue and is pushed back up by the leaflets
  if (t >= R3CQ.crush - .25) {
    const down = smooth(clamp((tq - (R3CQ.crush - .25)) / .45)), press = t >= R3CQ.people114 ? smooth(clamp((tq - R3CQ.people114) / .4)) * 18 : 0;
    let by = lerp(-330, 12, down) + press + (t >= R3CQ.people114 && t < R3CQ.defend ? Math.sin(tq * 40) * 3 : 0);
    if (t >= R3CQ.defend) by -= easeOutBack(clamp((tq - R3CQ.defend) / .4), 2) * 120;
    g.save(); g.translate(275, by);
    for (let k = 0; k < 7; k++) { g.beginPath(); g.rect(-190 + (k % 2) * 6, -40 - k * 26, 380, 28); nCel(g, k % 2 ? '#f6f0e0' : '#ece4cc', 3.5); }
    g.beginPath(); g.rect(-14, -230, 28, 220); nCel(g, '#c0283a', 3); g.beginPath(); g.rect(-190, -128, 386, 22); nCel(g, '#c0283a', 3);
    g.restore();
    if (t >= R3CQ.defend) { g.strokeStyle = '#f2c230'; g.lineWidth = 6; g.lineCap = 'round'; const u = clamp((t - R3CQ.defend) / .6); for (let k = 0; k < 7; k++) { const a = -Math.PI * .9 + k * .3; g.beginPath(); g.moveTo(275 + Math.cos(a) * 170, 150 + Math.sin(a) * 110); g.lineTo(275 + Math.cos(a) * (210 + u * 30), 150 + Math.sin(a) * (140 + u * 20)); g.stroke(); } }
  }
  r3cFilm(g);
}
// a person in the street, in news.js's activist manner: coat, hair, face; arm with a leaflet or a speaking trumpet
function r3cFolk(g, x, y, s, o) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const coat = o.coat, skin = o.skin || '#e0b088';
  g.beginPath(); g.moveTo(-26, -6); g.quadraticCurveTo(-54, -2, -54, 34); g.lineTo(-60, 200); g.lineTo(60, 200); g.lineTo(54, 34); g.quadraticCurveTo(54, -2, 26, -6); g.closePath(); nCel(g, coat, 5);
  if (o.scarf) { g.beginPath(); g.moveTo(-30, -4); g.quadraticCurveTo(0, 16, 30, -4); g.lineTo(24, 70); g.lineTo(10, 66); g.lineTo(14, 14); g.quadraticCurveTo(0, 20, -30, 8); g.closePath(); nCel(g, o.scarf, 3.5); }
  g.beginPath(); g.ellipse(0, -40, 34, 38, 0, 0, TAU); nCel(g, skin, 4.5);
  r3cHead(g, -40, -90, 80, 92, o.who || 'person');
  const hair = o.hair || '#4a2e1a';
  if (o.long) { g.beginPath(); g.moveTo(-38, -24); g.quadraticCurveTo(-46, -86, 0, -84); g.quadraticCurveTo(46, -86, 38, -24); g.lineTo(30, -24); g.quadraticCurveTo(26, -60, 0, -62); g.quadraticCurveTo(-26, -60, -30, -24); g.closePath(); nCel(g, hair, 4); }
  else if (o.hat) { g.beginPath(); g.ellipse(0, -66, 40, 10, 0, 0, TAU); nCel(g, o.hat, 3.5); g.beginPath(); g.moveTo(-26, -66); g.lineTo(-22, -96); g.lineTo(22, -96); g.lineTo(26, -66); g.closePath(); nCel(g, o.hat, 3.5); }
  else { g.beginPath(); g.moveTo(-34, -44); g.quadraticCurveTo(-34, -82, 0, -80); g.quadraticCurveTo(34, -82, 34, -44); g.quadraticCurveTo(0, -66, -34, -44); g.closePath(); nCel(g, hair, 4); }
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 12, -42, 4.5, 0, TAU); g.fillStyle = NINK; g.fill(); }
  if (o.shout) { g.beginPath(); g.ellipse(0, -18, 8, 6 + 4 * o.shout, 0, 0, TAU); nCel(g, '#5a1a24', 3); }
  else { g.strokeStyle = NINK; g.lineWidth = 3.5; g.beginPath(); g.arc(0, -24, 8, .2 * Math.PI, .8 * Math.PI); g.stroke(); }
  const sd = o.side || 1;
  if (o.trumpet !== undefined) {
    // the speaking trumpet held out from the cheek, pointing away to the side (never across the face)
    const u = o.trumpet;
    tube(g, [[sd * 40, 20], [sd * 66, lerp(60, 0, u)], [sd * 56, lerp(70, -26, u)]], 22, coat);
    if (u > .05) {
      g.save(); g.translate(sd * 40, -30); g.rotate(sd * (-.12 + (1 - u) * .8)); g.scale(sd, 1);
      g.beginPath(); g.moveTo(0, -10); g.lineTo(96, -38); g.lineTo(96, 38); g.lineTo(0, 10); g.closePath(); nCel(g, '#d8d2c4', 4);
      g.beginPath(); g.ellipse(96, 0, 10, 38, 0, 0, TAU); nCel(g, '#a8a294', 3.5);
      g.restore();
    }
    mitten(g, sd * 56, lerp(70, -26, u), 14, 0, skin);
  } else {
    const raise = o.raise || 0, hy = lerp(70, -100, raise), hx = sd * lerp(30, 54, raise);
    tube(g, [[sd * 40, 20], [sd * 64, lerp(60, -20, raise)], [hx, hy]], 22, coat);
    if (!o.empty) {
      g.save(); g.translate(hx, hy - 36); g.rotate(sd * .08);
      g.beginPath(); g.rect(-30, -40, 60, 80); nCel(g, '#fbf8ee', 3.5);
      g.strokeStyle = 'rgba(40,30,50,.7)'; g.lineWidth = 3; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(-20, -26 + k * 13); g.lineTo(20 - (k % 2) * 10, -26 + k * 13); g.stroke(); }
      g.restore();
    }
    mitten(g, hx, hy, 14, 0, skin);
  }
  g.restore();
}
function r3cSceneSpeak(g, t) {   // line 115: in the same street, the couple up on a crate, speaking out
  const tq = r3cTwo(t);
  r3cBricks(g);
  // a lamp post and the crate
  g.fillStyle = '#3a3a44'; g.fillRect(760, 60, 14, 380); g.beginPath(); g.ellipse(767, 60, 40, 16, 0, Math.PI, TAU); nCel(g, '#3a3a44', 3); g.beginPath(); g.arc(767, 66, 12, 0, Math.PI); nCel(g, '#fff3b0', 2.5);
  g.beginPath(); g.rect(240, 360, 300, 100); nCel(g, '#9a6a3a', 4.5); g.strokeStyle = 'rgba(40,20,10,.5)'; g.lineWidth = 3; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(240, 360 + k * 25); g.lineTo(540, 360 + k * 25); g.stroke(); }
  const up = t >= R3CQ.speak - .02 ? easeOutBack(clamp((tq - R3CQ.speak) / .25), 1.5) : 0;
  // every sung onset of the line sends a ring of sound out of the trumpet
  const ws = R3C_LN[115].words; let pulse = 0, lastS = ws[0].s;
  for (const w of ws) if (t >= w.s - .02) { lastS = w.s; }
  pulse = Math.exp(-Math.max(0, t - lastS) * 5);
  r3cFolk(g, 330, 210, .78, { who: 'couple', coat: '#3f7a5a', scarf: '#c8303c', hair: '#3a2418', long: 1, skin: '#e8b890', trumpet: up, side: -1, shout: t >= R3CQ.speak ? pulse : 0 });
  r3cFolk(g, 450, 206, .78, { who: 'couple', coat: '#b0703a', hair: '#6a4a2a', skin: '#d8a078', raise: t >= R3CQ.truth - .02 ? easeOutBack(clamp((tq - R3CQ.truth) / .3), 1.6) : .2, side: 1 });
  if (up > .5) {
    const ox = 330 - 40 * .78 - 96 * .78 + 40, oy = 210 - 30 * .78 - 12, big = t >= R3CQ.loud - .02 ? 1.6 : 1;
    g.strokeStyle = '#fbf8ee'; g.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const r = (30 + k * 26 + (1 - pulse) * 30) * big; g.lineWidth = 6 * pulse + 2;
      g.globalAlpha = .4 + .6 * pulse; g.beginPath(); g.arc(ox, oy, r + 40, Math.PI - .5, Math.PI + .5); g.stroke();
    }
    g.globalAlpha = 1;
  }
  if (t >= R3CQ.truth - .02) {   // the truth: a burst of rays behind the leaflet he holds up
    const u = clamp((t - R3CQ.truth) / .5); g.strokeStyle = '#f2c230'; g.lineWidth = 5;
    for (let k = 0; k < 8; k++) { const a = -Math.PI * .95 + k * .27; g.beginPath(); g.moveTo(450 + 42 + Math.cos(a) * 70, 100 + Math.sin(a) * 60); g.lineTo(450 + 42 + Math.cos(a) * (100 + u * 20), 100 + Math.sin(a) * (86 + u * 16)); g.stroke(); }
  }
  r3cFilm(g);
}
function r3cSceneDesk116(g, t) { r3cDesk(g, t, { box: r3cBoxTV, look: t >= R3CQ.tv ? .5 : 0 }); }
function r3cSceneNewspaper(g, t) {   // "newsprint": the paper spins in and lands
  r3cNavy(g);
  const u = clamp((t - (R3CQ.newsprint - .1)) / .5), e = 1 - (1 - u) ** 3;
  g.save(); g.translate(480, 236); g.rotate((1 - e) * 4 * Math.PI); g.scale(lerp(.06, 1, e), lerp(.06, 1, e));
  g.drawImage(R3C_O.paper, -260, -195);
  g.restore();
  if (e > .99) { g.save(); g.translate(480, 236); r3cHead(g, -260 + 40, -195 + 120, 240, 120, 'photo'); g.restore(); }
}
function r3cSceneNetwork(g, t) {   // "internet", "crowds": lines join the cities of the map; rows of people pop up below it
  const tq = r3cTwo(t);
  g.drawImage(R3C_O.map, 0, 0);
  const C2 = R3C_O.cities;
  g.lineCap = 'round';
  R3C_O.links.forEach(([a, b], k) => {
    const t0 = R3CQ.internet - .02 + k * .05; if (t < t0) return;
    const u = clamp((t - t0) / .3), [x0, y0] = C2[a], [x1, y1] = C2[b];
    g.strokeStyle = 'rgba(255,230,160,.85)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 60, lerp(x0, x1, u), lerp(y0, y1, u) - Math.sin(u * Math.PI) * 30 * 0); g.stroke();
    if (u >= 1) { const v = ((t - t0) * 1.2) % 1, mx = (1 - v) ** 2 * x0 + 2 * v * (1 - v) * (x0 + x1) / 2 + v * v * x1, my = (1 - v) ** 2 * y0 + 2 * v * (1 - v) * (Math.min(y0, y1) - 60) + v * v * y1; g.fillStyle = '#fff6d0'; g.beginPath(); g.arc(mx, my, 6, 0, TAU); g.fill(); }
  });
  for (const [x, y] of C2) { if (t < R3CQ.internet - .02) break; g.beginPath(); g.arc(x, y, 9, 0, TAU); nCel(g, '#fff0b0', 3); }
  if (t >= R3CQ.crowds - .02) {
    for (let k = 0; k < 15; k++) {
      const p = popIn(tq, R3CQ.crowds + (k % 5) * .04 + Math.floor(k / 5) * .02, .2); if (p <= 0) continue;
      const x = 50 + k * 61, y = 432 - (k % 3) * 8;
      g.save(); g.translate(x, y); g.scale(p, p);
      g.beginPath(); g.ellipse(0, 26, 22, 18, 0, Math.PI, TAU); nCel(g, ['#3f7a5a', '#b0703a', '#3d5a9a', '#9a3a4a', '#6a6a3a'][k % 5], 3);
      g.beginPath(); g.arc(0, 4, 14, 0, TAU); nCel(g, ['#f0c8a0', '#a8724a', '#e0b088', '#c89070'][k % 4], 3);
      r3cHead(g, -15, -11, 30, 30, 'crowd');
      g.fillStyle = NINK; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 5, 3, 2, 0, TAU); g.fill(); }
      g.restore();
    }
  }
}
// ---------- outside the court: the refrain ----------
const R3C_CROWD = [];
function r3cInitCrowd() {
  const coats = ['#3d5a9a', '#9a3a4a', '#6a6a3a', '#5a3a6a', '#2a7a7a', '#a8602a', '#4a4a52', '#7a2a2a'], skins = ['#f0c8a0', '#a8724a', '#e0b088', '#c89070', '#f4d0b0', '#8a5a3a'], hairs = ['#2a1a10', '#6a4a2a', '#c8a050', '#1a1a1a', '#9a9a9a'];
  const groups = [
    [R3CQ.people[0], [[96, 424, .72], [178, 430, .72], [258, 422, .72]]],
    [R3CQ.people[1], [[706, 428, .72], [786, 422, .72], [866, 430, .72]]],
    [R3CQ.people[2], [[40, 368, .6], [118, 362, .6], [842, 364, .6], [918, 370, .6]]],
    [R3CQ.people[3], [[330, 440, .78], [630, 438, .78]]],
    [R3CQ.people[4], [[20, 440, .76], [940, 444, .76], [270, 372, .6], [690, 370, .6]]],
  ];
  const R = mulberry(1251);
  groups.forEach(([t0, ms], gi) => ms.forEach(([x, y, s], k) => R3C_CROWD.push({ t0: t0 + k * .05, x, y, s, side: x < 480 ? 1 : -1, coat: coats[(gi * 3 + k) % coats.length], skin: skins[(gi * 2 + k) % skins.length], hair: hairs[(gi + k) % hairs.length], long: R() < .4, hat: R() < .25 ? '#3a3a44' : null, ph: R() })));
  R3C_CROWD.sort((a, b) => a.y - b.y);
}
// how high the leaflets are held: up on every shout of the title, for 1.8 s
function r3cRaise(t, d) {
  let r = 0;
  for (const s of R3CQ.libelous) { const a = t - (s + d); if (a < -.02) continue; const up = easeOutBack(clamp(a / .25), 1.6), dn = 1 - smooth(clamp((a - 1.8) / .4)); r = Math.max(r, up * dn); }
  return r;
}
function r3cThrown(g, t, x0, y0, seed) {
  // leaflets thrown in the air on the held shouts: up, then fluttering down past the bottom
  for (const h of R3CQ.held) {
    const a = t - h; if (a < 0 || a > 4) continue;
    for (let k = 0; k < 2; k++) {
      const vx = (rnd(seed, k, h) - .5) * 160, vy = -360 - rnd(seed, k + 3, h) * 160;
      const flut = Math.min(a, .7), fall = Math.max(0, a - .7);
      const x = x0 + vx * flut + Math.sin(a * 5 + seed + k) * 30 * fall, y = y0 + vy * flut + 300 * flut * flut + 110 * fall;
      if (y > 760) continue;
      g.save(); g.translate(x, y); g.rotate(Math.sin(a * 6 + k + seed) * .8); g.scale(Math.cos(a * 7 + seed) * .4 + .6, 1);
      g.beginPath(); g.rect(-16, -20, 32, 40); nCel(g, '#fbf8ee', 2.5);
      g.restore();
    }
  }
}
function r3cSceneCourtSteps(g, t) {
  const tq = r3cTwo(t);
  // the studio camera creeps in on the steps through the whole refrain
  const z = 1 + .04 * smooth(clamp((t - R3CQ.l125) / (R3CQ.stripOff - R3CQ.l125)));
  g.save(); g.translate(480, 250); g.scale(z, z); g.translate(-480, -250);
  g.drawImage(R3C_O.court, 0, 0);
  // the couple come out of the doors and down the steps, then stand at the front
  const walk = smooth(clamp((t - (R3CQ.l125 + .15)) / 2.2)), out = popIn(tq, R3CQ.l125, .2);
  const step = Math.floor(walk * 8) % 2 ? -4 : 0;
  const cx = (x0, x1) => lerp(x0, x1, walk), cy = (y0, y1) => lerp(y0, y1, walk) + (walk > 0 && walk < 1 ? step : 0);
  const cr = r3cRaise(t, 0);
  const pairs = [[cx(450, 420), cy(214, 296), 'w'], [cx(510, 540), cy(212, 292), 'm']];
  for (const [x, y, who] of pairs) {
    if (out <= 0) break;
    g.save(); g.translate(x, y + 60); g.scale(out, out); g.translate(-x, -(y + 60));
    const s = lerp(.62, .8, walk);
    if (who === 'w') r3cFolk(g, x, y, s, { who: 'couple', coat: '#3f7a5a', scarf: '#c8303c', hair: '#3a2418', long: 1, skin: '#e8b890', raise: cr, side: -1 });
    else r3cFolk(g, x, y, s, { who: 'couple', coat: '#b0703a', hair: '#6a4a2a', skin: '#d8a078', raise: cr, side: 1 });
    g.restore();
  }
  // the crowd: a new group on every sung start of the refrain, leaflets up on every shout of the title
  for (const p of R3C_CROWD) {
    const u = popIn(tq, p.t0, .22); if (u <= 0) continue;
    g.save(); g.translate(p.x, p.y + 80); g.scale(u, u); g.translate(-p.x, -(p.y + 80));
    r3cFolk(g, p.x, p.y, p.s, { who: 'crowd', coat: p.coat, skin: p.skin, hair: p.hair, long: p.long, hat: p.hat, raise: r3cRaise(t, p.ph * .08), side: p.side, shout: t >= R3CQ.held[0] && t < R3CQ.held[0] + 3.5 || t >= R3CQ.held[1] && t < R3CQ.held[1] + 3.4 ? .6 : 0 });
    g.restore();
    r3cThrown(g, t, p.x + p.side * 40 * p.s, p.y - 120 * p.s, p.x * .01);
  }
  for (const [x, y] of pairs) if (out > 0) r3cThrown(g, t, x, y - 100, x * .013);
  g.restore();
  r3cFilm(g);
}
// ---------- closedown ----------
function r3cSceneClose(g, t) {   // the anchor squares his papers and nods good night; the box shows the globe
  const lift = [330.5, 330.82].reduce((a, s) => a + 14 * Math.max(0, Math.sin(clamp((t - s) / .22) * Math.PI)), 0);
  const nod = Math.sin(clamp((t - 331.1) / .4) * Math.PI);
  r3cDesk(g, t, { box: (gg, w, h, tt) => boxGlobe(gg, w, h, tt), lift, nod, down: lift > 2 });
}
function r3cTestCard(g) { g.drawImage(R3C_O.test, 0, 0); }
// ---------- prebaked pictures ----------
function r3cInitScenes() {
  // calendar leaves torn off, faster and faster
  R3C_O.tears = []; const RT = mulberry(1111);
  for (let t = R3CQ.l111 + .05; t < R3CQ.l112 - .3;) { R3C_O.tears.push({ t, vx: 120 + RT() * 200, rot: (RT() - .3) * 4 }); t += t < R3CQ.longest ? .3 : (t < R3CQ.british ? .16 : .09); }
  // the dot-matrix map, full frame, no desk
  let c = mkCanvas(960, 720), g = c.getContext('2d');
  r3cNavy(g);
  const land = [[150, 130, 120, 70], [230, 250, 60, 90], [470, 120, 70, 50], [500, 230, 70, 100], [660, 140, 160, 70], [770, 280, 60, 40], [420, 90, 40, 20]];
  for (let y = 20; y < 380; y += 16) for (let x = 12; x < 960; x += 16) {
    const inL = land.some(([cx, cy, rx, ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1 + n1(5, x * .02 + y * .03) * .25);
    g.fillStyle = inL ? 'rgba(240,150,60,.75)' : 'rgba(120,150,200,.16)'; g.beginPath(); g.arc(x, y, inL ? 4.2 : 2.4, 0, TAU); g.fill();
  }
  R3C_O.map = c;
  R3C_O.cities = [[140, 120], [230, 260], [460, 110], [510, 250], [640, 130], [760, 170], [780, 290], [420, 90]];
  R3C_O.links = [[0, 2], [2, 4], [4, 5], [1, 3], [3, 6], [0, 1], [2, 3], [5, 6], [7, 4], [1, 2]];
  // the dotted graphic background for the money chart
  c = mkCanvas(960, 720); g = c.getContext('2d'); r3cNavy(g);
  for (let y = 18; y < 460; y += 24) for (let x = 12; x < 960; x += 24) { g.fillStyle = 'rgba(240,150,60,.14)'; g.beginPath(); g.arc(x, y, 2.4, 0, TAU); g.fill(); }
  R3C_O.dots = c;
  // the newspaper's front page: no headline words; a black masthead band, a photograph of the couple, columns
  c = mkCanvas(520, 390); g = c.getContext('2d');
  g.fillStyle = '#efe9da'; g.fillRect(0, 0, 520, 390); g.strokeStyle = NINK; g.lineWidth = 4; g.strokeRect(2, 2, 516, 386);
  g.fillStyle = '#1b1530'; g.fillRect(24, 22, 472, 56); g.fillStyle = '#efe9da'; g.fillRect(24, 84, 472, 4); g.fillStyle = '#1b1530'; g.fillRect(24, 92, 472, 3);
  g.fillStyle = '#d8d2c4'; g.fillRect(40, 116, 250, 140);
  const R = mulberry(2024);
  for (const [hx, col] of [[120, '#3f7a5a'], [210, '#b0703a']]) {
    g.beginPath(); g.ellipse(hx, 236, 46, 40, 0, Math.PI, TAU); g.fillStyle = '#6a6a6a'; g.fill();
    g.beginPath(); g.ellipse(hx, 176, 30, 34, 0, 0, TAU); g.fillStyle = '#a8a8a8'; g.fill();
    g.beginPath(); g.ellipse(hx, 156, 31, 18, 0, Math.PI, TAU); g.fillStyle = '#4a4a4a'; g.fill();
    g.fillStyle = '#2a2a2a'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(hx + sd * 10, 176, 3.5, 0, TAU); g.fill(); }
    void col;
  }
  for (let y = 118; y < 256; y += 5) for (let x = 42; x < 290; x += 5) { g.fillStyle = `rgba(30,24,40,${R() * .18})`; g.beginPath(); g.arc(x, y, 1.6, 0, TAU); g.fill(); }
  g.strokeStyle = NINK; g.lineWidth = 3; g.strokeRect(40, 116, 250, 140);
  g.strokeStyle = 'rgba(40,30,50,.55)'; g.lineWidth = 3;
  for (let y = 120; y < 372; y += 12) { g.beginPath(); g.moveTo(310, y); g.lineTo(486 - (y % 36 === 0 ? 30 : 0), y); g.stroke(); }
  for (let y = 276; y < 372; y += 12) for (const x0 of [40, 170]) { g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 118, y); g.stroke(); }
  g.fillStyle = '#1b1530'; for (const [x, y, w] of [[310, 106, 170], [40, 264, 250]]) g.fillRect(x, y, w, 6);
  R3C_O.paper = c;
  // the court from the street: a stone portico with columns, big doors, steps; side wings with square windows
  c = mkCanvas(960, 720); g = c.getContext('2d');
  let gr = g.createLinearGradient(0, 0, 0, 460); gr.addColorStop(0, '#8cc0e4'); gr.addColorStop(1, '#cfe4f0'); g.fillStyle = gr; g.fillRect(0, 0, 960, 720);
  for (const [x, w] of [[0, 190], [770, 190]]) { g.beginPath(); g.rect(x, 90, w, 280); nCel(g, '#d8ccb0', 4); for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) { g.beginPath(); g.rect(x + 34 + k * 74, 116 + r * 80, 46, 56); nCel(g, '#4a5a6a', 3); } }
  g.beginPath(); g.moveTo(170, 120); g.lineTo(480, 30); g.lineTo(790, 120); g.closePath(); nCel(g, '#e6dcc2', 5);
  g.beginPath(); g.rect(170, 120, 620, 34); nCel(g, '#d8ccb0', 4);
  for (let k = 0; k < 6; k++) { const x = 206 + k * 110; g.beginPath(); g.rect(x - 20, 154, 40, 180); nCel(g, '#ece4d0', 4); g.strokeStyle = 'rgba(120,100,70,.35)'; g.lineWidth = 2.5; for (const dx of [-8, 0, 8]) { g.beginPath(); g.moveTo(x + dx, 160); g.lineTo(x + dx, 328); g.stroke(); } g.beginPath(); g.rect(x - 26, 150, 52, 12); nCel(g, '#d8ccb0', 3); g.beginPath(); g.rect(x - 26, 326, 52, 12); nCel(g, '#d8ccb0', 3); }
  g.beginPath(); g.rect(426, 186, 108, 152); nCel(g, '#2a1a12', 4); g.beginPath(); g.rect(432, 192, 46, 146); nCel(g, '#5a3420', 3); g.beginPath(); g.rect(482, 192, 46, 146); nCel(g, '#5a3420', 3);
  for (let k = 0; k < 4; k++) { g.beginPath(); g.rect(150 - k * 30, 338 + k * 22, 660 + k * 60, 22); nCel(g, k % 2 ? '#d0c4a8' : '#dcd0b4', 3.5); }
  g.beginPath(); g.rect(0, 426, 960, 294); nCel(g, '#9a9488', 4);
  R3C_O.court = c;
  // the test card: grey grid, a circle with colour bars, greyscale steps and gratings (no lettering)
  c = mkCanvas(960, 720); g = c.getContext('2d');
  g.fillStyle = '#7a7a7a'; g.fillRect(0, 0, 960, 720);
  g.strokeStyle = '#e8e8e8'; g.lineWidth = 3; for (let x = 0; x <= 960; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 720); g.stroke(); } for (let y = 0; y <= 720; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(960, y); g.stroke(); }
  for (let y = 0; y < 720; y += 60) for (const x of [0, 900]) { g.fillStyle = (y / 60) % 2 ? '#1a1a1a' : '#f0f0f0'; g.fillRect(x, y, 60, 60); }
  g.save(); g.beginPath(); g.arc(480, 360, 300, 0, TAU); g.clip();
  g.fillStyle = '#202020'; g.fillRect(180, 60, 600, 600);
  const bars = ['#f0f0f0', '#e8e030', '#30d8d8', '#30c830', '#d830d0', '#d83030', '#3030d8', '#101010'];
  bars.forEach((col, k) => { g.fillStyle = col; g.fillRect(180 + k * 75, 150, 75, 220); });
  for (let k = 0; k < 6; k++) { const v = 20 + k * 46; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(180 + k * 100, 370, 100, 90); }
  for (let k = 0; k < 4; k++) { const w2 = [12, 8, 5, 3][k]; for (let x = 200 + k * 145; x < 330 + k * 145; x += w2 * 2) { g.fillStyle = '#f0f0f0'; g.fillRect(x, 470, w2, 80); } }
  g.fillStyle = '#d0d0d0'; g.fillRect(180, 560, 600, 100);
  g.restore();
  g.strokeStyle = '#f0f0f0'; g.lineWidth = 6; g.beginPath(); g.arc(480, 360, 300, 0, TAU); g.stroke();
  g.strokeStyle = '#101010'; g.lineWidth = 3; g.beginPath(); g.moveTo(480, 60); g.lineTo(480, 660); g.moveTo(180, 360); g.lineTo(780, 360); g.stroke();
  g.beginPath(); g.arc(480, 360, 26, 0, TAU); g.stroke();
  R3C_O.test = c;
  r3cInitCrowd();
}
