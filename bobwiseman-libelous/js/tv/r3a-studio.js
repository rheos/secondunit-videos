// Round 3, tv-A: the news studio. The 1970s station ident (no lettering), the anchor at the veneer desk in front of
// the orange dot-matrix world map (the set from news.js, NW.set), and the over-the-shoulder box with its pictures.
// The wire copy covers the lower third (js/tv/r3a-wire.js), so every face here stays above program y 430.
// Pure: a function of song time t only.
const r3aTvNK = '#1b1530';
const r3aTvOnTwos = (t) => Math.floor(t * 12 + 1e-6) / 12;
function r3aTvCel(g, fill, lw = 4) { g.fillStyle = fill; g.fill(); g.strokeStyle = r3aTvNK; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }
// a pop that lands a hair big for two frames, as the round-2 felt and cel pieces do
function r3aTvPop(t, t0) { if (t < t0 - 0.02) return 0; return r3aTvOnTwos(t) - t0 < 0.08 ? 1.12 : 1; }
function r3aTvScaled(g, x, y, s, fn) { g.save(); g.translate(x, y); g.scale(s, s); g.translate(-x, -y); fn(); g.restore(); }

// ---------- the anchor (news.js drawAnchor, with his mouth on this stretch's words, paper taps and a recoil) ----------
function r3aTvMouth(t) {
  let m = 0;
  for (const L of r3aTvLINES) { if (t < L.s - 0.1 || t > L.e + 0.2) continue; for (const w of L.words) if (t >= w.s && t < w.e + .1) m = Math.max(m, .5 + .5 * Math.sin(Math.min(1, (t - w.s) / Math.max(.08, w.e - w.s)) * Math.PI)); }
  return m;
}
// o: { look: -1..1 head turn (+ toward the box), tap: 0..1 papers lifted, lean: px sideways, brows: 0..1 raised, talk: bool }
function r3aTvAnchor(g, t, o = {}) {
  const x = 290 + (o.lean || 0);
  const blink = ((t % 3.3) + 3.3) % 3.3 < .1;
  const turn = o.look || 0, tap = o.tap || 0, br = o.brows || 0;
  g.beginPath(); g.moveTo(x - 150, 470); g.quadraticCurveTo(x - 146, 300, x - 64, 278); g.lineTo(x + 64, 278); g.quadraticCurveTo(x + 146, 300, x + 150, 470); g.closePath(); r3aTvCel(g, '#7a5232', 5);
  g.beginPath(); g.moveTo(x - 46, 278); g.lineTo(x, 380); g.lineTo(x + 46, 278); g.closePath(); r3aTvCel(g, '#cfe0f0', 4);
  g.beginPath(); g.moveTo(x - 16, 290); g.lineTo(x + 16, 290); g.lineTo(x + 26, 390); g.lineTo(x, 412); g.lineTo(x - 26, 390); g.closePath(); r3aTvCel(g, '#e8862a', 4);
  g.save(); g.clip(); g.strokeStyle = 'rgba(110,50,20,.7)'; g.lineWidth = 6; for (let k = -2; k < 6; k++) { g.beginPath(); g.moveTo(x - 40, 300 + k * 24); g.lineTo(x + 40, 270 + k * 24); g.stroke(); } g.restore();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * 46, 278); g.lineTo(x + s * 18, 360); g.lineTo(x + s * 70, 330); g.lineTo(x + s * 84, 288); g.closePath(); r3aTvCel(g, '#8d6440', 4); }
  g.beginPath(); g.rect(x - 22, 236, 44, 48); r3aTvCel(g, '#e9b48c', 4);
  g.save(); g.translate(x + turn * 6, 190); g.rotate(turn * .06);
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 52, 6, 10, 16, 0, 0, TAU); r3aTvCel(g, '#e9b48c', 3.5); }
  g.beginPath(); g.ellipse(0, 0, 52, 60, 0, 0, TAU); r3aTvCel(g, '#e9b48c', 4.5);
  g.beginPath(); g.moveTo(-54, 8); g.quadraticCurveTo(-60, -60, 0, -64); g.quadraticCurveTo(56, -64, 56, -10); g.quadraticCurveTo(30, -40, -14, -36); g.quadraticCurveTo(-36, -30, -44, 16); g.closePath(); r3aTvCel(g, '#4a2e1a', 4);
  for (const s of [-1, 1]) { g.beginPath(); g.rect(s * 48 - 5, -8, 10, 30); g.fillStyle = '#4a2e1a'; g.fill(); }
  for (const s of [-1, 1]) {
    g.beginPath(); g.roundRect(s * 22 - 18 + turn * 4, -10, 36, 26, 8); g.fillStyle = 'rgba(220,235,255,.25)'; g.fill(); g.strokeStyle = r3aTvNK; g.lineWidth = 5; g.stroke();
    if (blink) { g.beginPath(); g.moveTo(s * 22 - 8 + turn * 4, 4); g.lineTo(s * 22 + 8 + turn * 4, 4); g.lineWidth = 3; g.stroke(); }
    else { g.fillStyle = r3aTvNK; g.beginPath(); g.arc(s * 22 + turn * 7, 3, 4.5, 0, TAU); g.fill(); }
    g.strokeStyle = '#4a2e1a'; g.lineWidth = 5; g.beginPath(); g.moveTo(s * 22 - 14 + turn * 4, -20 - br * 8); g.lineTo(s * 22 + 12 + turn * 4, -22 - br * 10); g.stroke();
  }
  g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.beginPath(); g.moveTo(-4 + turn * 4, -6); g.lineTo(4 + turn * 4, -6); g.stroke();
  g.beginPath(); g.moveTo(turn * 5, 4); g.quadraticCurveTo(8 + turn * 5, 20, -2 + turn * 5, 24); g.stroke();
  g.beginPath(); g.moveTo(-22 + turn * 5, 34); g.quadraticCurveTo(turn * 5, 24, 22 + turn * 5, 34); g.quadraticCurveTo(turn * 5, 40, -22 + turn * 5, 34); g.fillStyle = '#4a2e1a'; g.fill();
  const m = o.talk === false ? 0 : r3aTvMouth(t);
  g.beginPath(); g.ellipse(turn * 5, 44, 12, 2 + m * 7, 0, 0, TAU); g.fillStyle = '#5a2020'; g.fill(); g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.stroke();
  g.restore();
  r3aTvHead(x - 66 + turn * 6, 122, x + 66 + turn * 6, 256);
  // hands and the sheaf of copy (mittens); on a tap the sheaf lifts and squares up on the desk
  const ty = -tap * 26;
  g.save(); g.translate(0, ty); g.rotate(-tap * .02);
  g.beginPath(); g.moveTo(x - 90, 392); g.lineTo(x + 100, 386); g.lineTo(x + 108, 430); g.lineTo(x - 84, 438); g.closePath(); r3aTvCel(g, '#f6f2e6', 3.5);
  g.restore();
  for (const s of [-1, 1]) {
    g.beginPath(); g.ellipse(x + s * 34, 400 + ty, 30, 22, s * .3, 0, TAU); r3aTvCel(g, '#e9b48c', 4);
    g.beginPath(); g.moveTo(x + s * 34 - 20, 420 + ty); g.lineTo(x + s * 80, 470); g.lineTo(x + s * 120, 470); g.lineTo(x + s * 60, 404 + ty); g.closePath(); r3aTvCel(g, '#7a5232', 4);
  }
}
function r3aTvBox(g, fn) {
  const b = { x: 548, y: 54, w: 340, h: 250 };
  g.save(); g.beginPath(); g.roundRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16, 18); g.fillStyle = '#0b1020'; g.fill();
  g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 14); g.clip();
  g.translate(b.x, b.y); fn(b.w, b.h); g.restore();
  g.strokeStyle = '#c8d0e0'; g.lineWidth = 4; g.beginPath(); g.roundRect(b.x, b.y, b.w, b.h, 14); g.stroke();
}

// ---------- the ident: concentric 70s rings, a wire globe with an orbit, the dotted map (no lettering) ----------
function r3aTvIdent(g, t) {
  const C = r3aTvC, cx = 480, cy = 330;
  const zoom = 1 + 1.6 * smooth(clamp((t - C.zoom) / (C.hit - C.zoom)));
  g.fillStyle = '#101a34'; g.fillRect(0, 0, 960, 720);
  // the world map's dots sweep in from the left after the orbits
  if (t >= C.orbit[3]) {
    const u = clamp((t - C.orbit[3]) / 0.9);
    g.save(); g.beginPath(); g.rect(0, 0, 960 * u, 720); g.clip(); g.globalAlpha = .6; g.drawImage(NW.set, 0, 0, 960, 372, 0, 60, 960, 372); g.restore();
  }
  // rings: one lands on each beat of the grid and stays (orange, mustard, brown, avocado), rippling out
  const cols = ['#e8862a', '#f2c230', '#8a4a20', '#9bb53c'];
  for (let k = 3; k >= 0; k--) {
    const t0 = C.ring[k]; if (t < t0 - 0.02) continue;
    const u = easeOutBack(clamp((r3aTvOnTwos(t) - t0) / 0.3), 1.4), R = (150 + k * 46) * u * zoom;
    g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.arc(cx, cy, Math.max(0, R - 30 * zoom), 0, TAU, true); g.fillStyle = cols[k]; g.fill();
  }
  // the globe: an orange ball with turning meridians
  const r = 110 * zoom * (t < C.ring[0] ? smooth(clamp((t - C.on - 0.3) / 0.6)) : 1);
  if (r > 1) {
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fillStyle = '#e8862a'; g.fill();
    g.strokeStyle = r3aTvNK; g.lineWidth = 3 * Math.sqrt(zoom);
    for (let k = 0; k < 6; k++) { const a = ((t * .5 + k / 6) % 1) * Math.PI; g.beginPath(); g.ellipse(cx, cy, Math.abs(Math.cos(a)) * r, r, 0, 0, TAU); g.stroke(); }
    for (const y of [-.5, 0, .5]) { g.beginPath(); g.ellipse(cx, cy + y * r, Math.sqrt(1 - y * y) * r, 12 * zoom * (1 - Math.abs(y)), 0, 0, TAU); g.stroke(); }
    g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.lineWidth = 5 * Math.sqrt(zoom); g.stroke();
  }
  // orbits: a ring draws round the globe on each beat, a little satellite riding the newest one
  for (let k = 0; k < 4; k++) {
    const t0 = C.orbit[k]; if (t < t0) continue;
    const u = clamp((t - t0) / 0.35), a0 = -.35 + k * .8;
    g.strokeStyle = k % 2 ? '#fbf3d0' : '#f2c230'; g.lineWidth = 5 * Math.sqrt(zoom);
    g.beginPath(); g.ellipse(cx, cy, r * 1.5, r * .42, a0, 0, TAU * u); g.stroke();
    if (k === 3 || t < C.orbit[k + 1]) {
      const p = t * 2.2 + k, sx = cx + Math.cos(a0) * Math.cos(p) * r * 1.5 - Math.sin(a0) * Math.sin(p) * r * .42, sy = cy + Math.sin(a0) * Math.cos(p) * r * 1.5 + Math.cos(a0) * Math.sin(p) * r * .42;
      g.beginPath(); g.arc(sx, sy, 9 * Math.sqrt(zoom), 0, TAU); r3aTvCel(g, '#fbf3d0', 3);
    }
  }
  // a flash on the hit as the ident cuts away
  const fl = 1 - clamp((t - (C.hit - 0.12)) / 0.12);
  if (t > C.hit - 0.12) { g.fillStyle = `rgba(255,250,230,${.8 * (1 - fl)})`; g.fillRect(0, 0, 960, 720); }
}

// ---------- box pictures ----------
function r3aTvBoxGlobe(g, w, h, t) { boxGlobe(g, w, h, t); }
function r3aTvBoxKing(g, w, h, t, o = {}) {
  g.fillStyle = '#5a1a2a'; g.fillRect(0, 0, w, h);
  g.beginPath(); g.ellipse(w / 2, h / 2 + 4, 120, 116, 0, 0, TAU); g.fillStyle = '#3a0e1a'; g.fill(); g.strokeStyle = '#d8a83a'; g.lineWidth = 12; g.stroke();
  g.save(); g.beginPath(); g.ellipse(w / 2, h / 2 + 4, 114, 110, 0, 0, TAU); g.clip();
  kingFace(g, w / 2, h / 2 + 18 + (o.sink || 0), .95, t, o.smile || 0);
  g.restore();
  if (o.glint) sparkle(g, w / 2 + 34, 58, 30 * o.glint + 2, 1);
}
// the plan: a rolled parchment that unrolls into a map (hills, a castle, a dotted route, crosses)
function r3aTvPlanSheet(g, x, y, w, h, u, shake, t) {
  const ww = Math.max(24, w * u);
  g.save(); g.translate(x + shake, y);
  g.beginPath(); g.rect(-w / 2, -h / 2, ww, h); r3aTvCel(g, '#f1e2bc', 4);
  g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, ww, h); g.clip();
  g.fillStyle = '#9bb53c'; for (const [hx, hr] of [[-.3, .22], [.05, .3], [.35, .2]]) { g.beginPath(); g.ellipse(hx * w, h * .3, hr * w, h * .3, 0, Math.PI, TAU); g.fill(); }
  g.strokeStyle = '#c0283a'; g.lineWidth = 4; g.setLineDash([8, 8]); g.beginPath(); g.moveTo(-w * .4, h * .1); g.quadraticCurveTo(-w * .1, -h * .35, w * .3, -h * .1); g.stroke(); g.setLineDash([]);
  for (const [cx, cy] of [[-.15, -.05], [.12, .12], [.36, .02]]) { g.strokeStyle = '#1b1530'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx * w - 8, cy * h - 8); g.lineTo(cx * w + 8, cy * h + 8); g.moveTo(cx * w + 8, cy * h - 8); g.lineTo(cx * w - 8, cy * h + 8); g.stroke(); }
  // a little castle at the route's start
  g.fillStyle = '#8a8478'; g.fillRect(-w * .44, h * .02, 30, 26); for (let k = 0; k < 3; k++) g.fillRect(-w * .44 + k * 11, h * .02 - 8, 7, 8);
  g.restore();
  // the roll at the moving edge
  g.beginPath(); g.ellipse(-w / 2 + ww, 0, 12, h / 2 + 6, 0, 0, TAU); r3aTvCel(g, '#e2cc98', 4);
  g.restore();
}
// an armoured gauntlet (a mitten in plate: cuff, knuckle plates), optionally with the index finger out
function r3aTvGauntlet(g, x, y, s, a, point) {
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
  g.beginPath(); g.moveTo(-34, 40); g.lineTo(34, 40); g.lineTo(40, 100); g.lineTo(-40, 100); g.closePath(); r3aTvCel(g, '#9aa4b0', 4);
  for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(-40, 56 + k * 22); g.lineTo(40, 56 + k * 22); g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.stroke(); }
  g.beginPath(); g.roundRect(-42, -36, 84, 80, 22); r3aTvCel(g, '#b8c2cc', 4.5);
  for (let k = 0; k < 4; k++) { g.beginPath(); g.roundRect(-38 + k * 19, -46, 18, 26, 8); r3aTvCel(g, '#c8d0d8', 3.5); }
  if (point > 0) { g.beginPath(); g.roundRect(30, -40, 22 + 50 * point, 20, 9); r3aTvCel(g, '#c8d0d8', 3.5); }
  g.beginPath(); g.ellipse(-40, 0, 14, 24, -.3, 0, TAU); r3aTvCel(g, '#b8c2cc', 3.5);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-12, -16, 18, 6, -.3, 0, TAU); g.fill();
  g.restore();
}
// the man: frock coat, sideburns, a grey stand-in with a big talking mouth
function r3aTvMan(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-50, 70); g.quadraticCurveTo(-50, 20, -26, 14); g.lineTo(26, 14); g.quadraticCurveTo(50, 20, 50, 70); g.lineTo(50, 160); g.lineTo(-50, 160); g.closePath(); r3aTvCel(g, '#3a3a52', 4.5);
  g.beginPath(); g.moveTo(-14, 14); g.lineTo(0, 50); g.lineTo(14, 14); g.closePath(); r3aTvCel(g, '#f6f2e6', 3);
  g.beginPath(); g.ellipse(0, -30, 36, 42, 0, 0, TAU); r3aTvCel(g, '#e8bc94', 4.5);
  g.beginPath(); g.moveTo(-36, -36); g.quadraticCurveTo(-34, -76, 0, -74); g.quadraticCurveTo(34, -76, 36, -36); g.quadraticCurveTo(10, -58, -36, -36); g.closePath(); r3aTvCel(g, '#5a4030', 4);
  for (const sd of [-1, 1]) { g.fillStyle = '#5a4030'; g.fillRect(sd * 34 - 5, -40, 10, 30); g.beginPath(); g.arc(sd * 13, -36, 4.5, 0, TAU); g.fillStyle = r3aTvNK; g.fill(); }
  const m = o.mouth || 0, big = o.big || 0;
  if (big > 0) {
    g.beginPath(); g.ellipse(0, -8 + big * 6, 18 + big * 16, 6 + m * 10 + big * 16, 0, 0, TAU); r3aTvCel(g, '#7a1e28', 4);
    g.fillStyle = '#fbf8ee'; g.fillRect(-14 - big * 12, -12 - big * 8 - m * 4, 28 + big * 24, 7);
    g.beginPath(); g.ellipse(0, 2 + big * 14 + m * 4, 10 + big * 8, 5 + big * 4, 0, 0, TAU); g.fillStyle = '#e06a7a'; g.fill();
  } else { g.beginPath(); g.ellipse(0, -8, 10, 2 + m * 8, 0, 0, TAU); r3aTvCel(g, '#7a1e28', 3); }
  g.restore();
}
function r3aTvTopHat(g, x, y, s, lift, bow, smile) {
  // a shareholder from the front: round face, top hat; on lift the hat rises, on bow the head dips
  g.save(); g.translate(x, y + bow * 10); g.scale(s, s);
  g.beginPath(); g.ellipse(0, 0, 26, 28, 0, 0, TAU); r3aTvCel(g, '#f0c8a0', 3.5);
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 9, -3, 3.5, 0, TAU); g.fillStyle = r3aTvNK; g.fill(); }
  g.strokeStyle = r3aTvNK; g.lineWidth = 3;
  if (smile > 0) { g.beginPath(); g.arc(0, 8, 9 + smile * 3, .15 * Math.PI, .85 * Math.PI); g.lineWidth = 3.5; g.stroke(); }
  else { g.beginPath(); g.moveTo(-7, 12); g.lineTo(7, 12); g.stroke(); }
  g.translate(0, -lift * 34);
  g.beginPath(); g.roundRect(-34, -26, 68, 8, 4); r3aTvCel(g, '#1c1a22', 3);
  g.beginPath(); g.rect(-20, -66, 40, 42); r3aTvCel(g, '#1c1a22', 3);
  g.fillStyle = '#7a1e28'; g.fillRect(-20, -34, 40, 7);
  g.restore();
}
function r3aTvBoxPlan(g, w, h, t) {
  const C = r3aTvC;
  g.fillStyle = '#2a8a84'; g.fillRect(0, 0, w, h);
  const u = t < C.plan1 - 0.02 ? 0 : smooth(clamp((t - C.plan1) / 0.26));
  const shake = t >= C.l2 && t < C.fist2 ? Math.sin(t * 90) * 4 : 0;
  r3aTvPlanSheet(g, w / 2, h / 2 + 6, 270, 170, u, shake, t);
  if (t >= C.fist2 - 0.02) {
    // the gauntlet punches up through the plan: torn flaps, impact cuts
    const v = easeOutBack(clamp((r3aTvOnTwos(t) - C.fist2) / 0.25), 1.6);
    g.fillStyle = '#2a8a84'; g.beginPath(); g.moveTo(w / 2 - 50, h / 2 + 10); g.lineTo(w / 2 - 20, h / 2 - 40); g.lineTo(w / 2 + 30, h / 2 - 34); g.lineTo(w / 2 + 50, h / 2 + 14); g.closePath(); g.fill();
    r3aTvGauntlet(g, w / 2, h / 2 + 120 - 120 * v, 1.0, 0, 0);
    if (t - C.fist2 < 0.5) { g.strokeStyle = '#fbf3d0'; g.lineWidth = 5; for (let k = 0; k < 6; k++) { const a = -Math.PI + k * .6; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * 80, h / 2 - 30 + Math.sin(a) * 70); g.lineTo(w / 2 + Math.cos(a) * 110, h / 2 - 30 + Math.sin(a) * 95); g.stroke(); } }
  }
}
function r3aTvBoxFist(g, w, h, t) {
  const C = r3aTvC;
  g.fillStyle = '#3d4f7a'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.08)'; for (let k = 0; k < 6; k++) g.fillRect(0, k * 46, w, 20);
  const pt = t < C.knew3 ? 0 : smooth(clamp((t - C.knew3) / 0.2));
  r3aTvGauntlet(g, 90, 130, .95, 0, pt);
  if (t >= C.man3 - 0.02) {
    const p = popIn(r3aTvOnTwos(t), C.man3, .25), hop = t - C.man3 < 0.4 ? Math.sin((t - C.man3) / 0.4 * Math.PI) * 18 : 0;
    r3aTvMan(g, 262, 120 - hop, .9 * p, {});
    if (t - C.man3 < 0.6) { g.strokeStyle = '#fbf3d0'; g.lineWidth = 4; for (const a of [-2.4, -1.6, -.8]) { g.beginPath(); g.moveTo(262 + Math.cos(a) * 66, 80 + Math.sin(a) * 66); g.lineTo(262 + Math.cos(a) * 90, 80 + Math.sin(a) * 90); g.stroke(); } }
  }
}
function r3aTvBoxMouth(g, w, h, t) {
  const C = r3aTvC;
  g.fillStyle = '#c86a3a'; g.fillRect(0, 0, w, h);
  const big = t < C.mouth4 - 0.02 ? 0 : easeOutBack(clamp((r3aTvOnTwos(t) - C.mouth4) / 0.2), 1.6);
  const talk = big > 0 ? .5 + .5 * Math.sin(t * 26) : 0;
  r3aTvMan(g, w / 2, 150, 2.3, { big, mouth: talk });
}
function r3aTvBoxHand(g, w, h, t) {
  const C = r3aTvC;
  // the shareholders in rows, small; a big pointing hand taps on "chose" and "this", jabs on "reason"
  g.fillStyle = '#7b4bb5'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) r3aTvTopHat(g, 60 + k * 56 + r * 28, 170 + r * 52, .7, 0, 0, 1);
  let x = 120, y = 70;
  for (const c of [C.chose8, C.this8]) if (t >= c && t - c < 0.2) y += Math.sin((t - c) / 0.2 * Math.PI) * 16;
  const jab = t >= C.reason8 ? easeOutBack(clamp((t - C.reason8) / 0.18), 2) : 0;
  x += jab * 60;
  g.save(); g.translate(x, y);
  g.beginPath(); g.roundRect(-90, -14, 70, 30, 6); r3aTvCel(g, '#f6f2e6', 3.5);   // the cuff
  g.beginPath(); g.ellipse(0, 0, 30, 24, 0, 0, TAU); r3aTvCel(g, '#f0c8a0', 4);
  g.beginPath(); g.roundRect(14, -10, 70, 18, 9); r3aTvCel(g, '#f0c8a0', 3.5);
  g.restore();
  if (jab > 0 && t - C.reason8 < 0.6) { g.strokeStyle = '#f2c230'; g.lineWidth = 5; for (const a of [-.5, 0, .5]) { g.beginPath(); g.moveTo(x + 96 + Math.cos(a) * 10, y + Math.sin(a) * 10); g.lineTo(x + 96 + Math.cos(a) * 40, y + Math.sin(a) * 40); g.stroke(); } }
}
function r3aTvBoxSacks(g, w, h, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.fillStyle = '#1f6c64'; g.fillRect(0, 0, w, h);
  // coins pour in from the top until "cash", then the sacks burst in a fountain
  if (t < C.cash9) for (let k = 0; k < 12; k++) { const ph = ((tq - C.l9) * 2.2 + k / 12) % 1; if (tq < C.l9 + k * .03) continue; coin(g, 60 + (k % 3) * 110 + rnd(k, 1) * 30, -10 + ph * 190, 9, k + tq * 8, null); }
  [70, 170, 270].forEach((x, k) => goldSack(g, x, 236, .62 + (t >= C.cash9 ? Math.max(0, .1 - (t - C.cash9) * .2) : 0)));
  if (t >= C.cash9) for (let k = 0; k < 18; k++) { const v = (tq - C.cash9) / 0.9; if (v > 1.2) continue; const a = -Math.PI / 2 + (rnd(k, 4) - .5) * 2.2, sp = 160 + rnd(k, 5) * 120; const x = 170 + (k % 3 - 1) * 100 + Math.cos(a) * sp * v, y = 150 + Math.sin(a) * sp * v + 260 * v * v; coin(g, x, y, 10, k + tq * 10, null); }
}
function r3aTvBoxPillar(g, w, h, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.fillStyle = '#e8862a'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2a050'; for (let k = 0; k < 12; k++) { g.beginPath(); g.moveTo(w / 2, h); g.arc(w / 2, h, 400, Math.PI + k / 12 * Math.PI, Math.PI + (k + .5) / 12 * Math.PI); g.closePath(); g.fill(); }
  const n = Math.min(20, Math.floor((t - C.l10) / 0.05) + 1);
  for (let k = 0; k < n; k++) { const y = 236 - k * 7.5; g.beginPath(); g.ellipse(w / 2, y, 40, 9, 0, 0, TAU); r3aTvCel(g, k % 2 ? '#f2c444' : '#d9a52c', 2.5); }
  if (t >= C.believing10 - 0.3) {
    // the king drops onto the pillar and sits, smiling
    const u = clamp((tq - (C.believing10 - 0.3)) / 0.3), y = lerp(-160, 236 - n * 7.5 - 54, u * u);
    kingFace(g, w / 2, y, .42, t, t >= C.believing10 ? 1 : 0);
  }
}
function r3aTvBoxBuilding(g, w, h, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.fillStyle = '#9cc8e8'; g.fillRect(0, 0, w, h);
  // a columned government building with a pediment, the parcel on the steps
  g.beginPath(); g.moveTo(30, 90); g.lineTo(w / 2, 34); g.lineTo(w - 30, 90); g.closePath(); r3aTvCel(g, '#e8e0cc', 4);
  g.beginPath(); g.rect(40, 90, w - 80, 14); r3aTvCel(g, '#e8e0cc', 3.5);
  for (let k = 0; k < 6; k++) { g.beginPath(); g.rect(54 + k * 46, 104, 18, 100); r3aTvCel(g, '#f4eee0', 3); }
  g.beginPath(); g.rect(30, 204, w - 60, 16); r3aTvCel(g, '#d8d0bc', 3.5);
  g.beginPath(); g.rect(20, 220, w - 40, 30); r3aTvCel(g, '#c8c0ac', 3.5);
  // the parcel: brown paper, a cord
  const px = w / 2, py = 196;
  g.beginPath(); g.roundRect(px - 70, py - 40, 140, 70, 6); r3aTvCel(g, '#c8955a', 4);
  g.strokeStyle = '#7a4a24'; g.lineWidth = 4; g.beginPath(); g.moveTo(px, py - 40); g.lineTo(px, py + 30); g.moveTo(px - 70, py - 6); g.lineTo(px + 70, py - 6); g.stroke();
  if (t >= C.do22) { g.beginPath(); g.arc(px, py - 6, 20, 0, TAU); r3aTvCel(g, '#c0283a', 3); g.beginPath(); g.arc(px, py - 6, 11, 0, TAU); g.strokeStyle = '#8a1424'; g.lineWidth = 3; g.stroke(); }
  // the big rubber stamp lowers over "government ... can" and comes down on "do"
  if (t >= C.govt22 - 0.1) {
    const down = t < C.do22 ? lerp(-130, 60, smooth(clamp((t - C.govt22) / (C.do22 - C.govt22)))) * .55 - 40 : (tq - C.do22 < 0.12 ? 108 : 100 - smooth(clamp((t - C.do22 - 0.3) / 0.3)) * 120);
    g.save(); g.translate(px, down);
    g.beginPath(); g.ellipse(0, -70, 24, 22, 0, 0, TAU); r3aTvCel(g, '#6b3a1e', 4);
    g.beginPath(); g.rect(-8, -52, 16, 40); r3aTvCel(g, '#6b3a1e', 3.5);
    g.beginPath(); g.roundRect(-50, -14, 100, 22, 4); r3aTvCel(g, '#3a2418', 4);
    g.beginPath(); g.rect(-46, 8, 92, 8); g.fillStyle = '#c0283a'; g.fill();
    g.restore();
    if (t >= C.do22 && t - C.do22 < 0.4) { g.strokeStyle = r3aTvNK; g.lineWidth = 4; for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(px + sd * (84 + k * 6), 150 + k * 20); g.lineTo(px + sd * (110 + k * 8), 146 + k * 22); g.stroke(); } }
  }
}
function r3aTvBoxBalance(g, w, h, t) {
  const C = r3aTvC;
  g.fillStyle = '#5a1222'; g.fillRect(0, 0, w, h);
  const spring = (t0, a) => t >= t0 ? a * (1 - Math.exp(-(t - t0) * 6) * Math.cos((t - t0) * 18)) : 0;
  const ang = spring(C.court27, .3) + spring(C.cheap28, .12);
  const px = w / 2, py = 54, L = 120;
  g.beginPath(); g.moveTo(px - 40, 240); g.lineTo(px + 40, 240); g.lineTo(px + 24, 224); g.lineTo(px - 24, 224); g.closePath(); r3aTvCel(g, '#d8a83a', 3.5);
  g.beginPath(); g.rect(px - 6, py, 12, 172); r3aTvCel(g, '#d8a83a', 3);
  g.save(); g.translate(px, py); g.rotate(-ang); g.beginPath(); g.roundRect(-L - 6, -6, 2 * L + 12, 12, 6); r3aTvCel(g, '#e8b84a', 3.5); g.restore();
  // the court's pan (left: sinks) and the land's pan (right: flies up with one small coin)
  [-1, 1].forEach((sd) => {
    const ex = px + sd * L * Math.cos(ang), ey = py + sd * L * Math.sin(ang) * -1, pyy = ey + 80;
    g.strokeStyle = r3aTvNK; g.lineWidth = 2.5; for (const dx of [-30, 30]) { g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + dx, pyy); g.stroke(); }
    g.beginPath(); g.moveTo(ex - 40, pyy); g.quadraticCurveTo(ex, pyy + 28, ex + 40, pyy); g.closePath(); r3aTvCel(g, '#e8b84a', 3);
    if (sd < 0) {
      // a castle in little, a red crown, coin piles
      g.fillStyle = '#c8c0ac'; g.fillRect(ex - 26, pyy - 34, 52, 34); for (let k = 0; k < 4; k++) g.fillRect(ex - 26 + k * 15, pyy - 42, 8, 8);
      g.strokeStyle = r3aTvNK; g.lineWidth = 2.5; g.strokeRect(ex - 26, pyy - 34, 52, 34);
      g.beginPath(); g.moveTo(ex - 14, pyy - 44); for (let k = 0; k <= 4; k++) g.lineTo(ex - 14 + k * 7, pyy - 44 - (k % 2 ? 6 : 16)); g.lineTo(ex + 14, pyy - 44); g.closePath(); r3aTvCel(g, '#c0283a', 2.5);
      for (let k = 0; k < 3; k++) coin(g, ex - 30 + k * 8, pyy - 4 - k * 4, 8, k, null);
    } else {
      g.beginPath(); g.ellipse(ex, pyy - 2, 30, 12, 0, Math.PI, TAU); g.fillStyle = '#4f9a3c'; g.fill();
      if (t >= C.cheap28 - 0.02) coin(g, ex + 4, pyy - 20, 7 * r3aTvPop(t, C.cheap28), 0, null);
    }
  });
}
function r3aTvBoxLawBook(g, w, h, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.fillStyle = '#2f5fa8'; g.fillRect(0, 0, w, h);
  const open = t < C.laws29 - 0.02 ? 0 : smooth(clamp((t - C.laws29) / 0.25));
  const cx = w / 2, cy = 150;
  // closed: a fat brown cover; open: two pages with ruled lines (no words)
  if (open < .5) { g.save(); g.translate(cx, cy); g.scale(1 - open * 2 * .9, 1); g.beginPath(); g.roundRect(-70, -90, 140, 180, 8); r3aTvCel(g, '#6b3a1e', 4); g.fillStyle = '#d8a83a'; g.fillRect(-70, -60, 140, 6); g.fillRect(-70, 54, 140, 6); g.restore(); }
  else {
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(cx, cy - 86); g.quadraticCurveTo(cx + sd * 60, cy - 100, cx + sd * 130, cy - 90); g.lineTo(cx + sd * 130, cy + 86); g.quadraticCurveTo(cx + sd * 60, cy + 76, cx, cy + 90); g.closePath(); r3aTvCel(g, '#fbf8ee', 4); g.strokeStyle = 'rgba(40,30,50,.55)'; g.lineWidth = 3; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(cx + sd * 20, cy - 60 + k * 20); g.lineTo(cx + sd * (110 - (k % 3) * 14), cy - 60 + k * 20); g.stroke(); } }
    if (t >= C.exploited29 - 0.15) {
      // the gauntlet's finger pokes a hole through the right page; pages fly
      const v = clamp((tq - (C.exploited29 - 0.15)) / 0.15);
      r3aTvGauntlet(g, cx + 70, cy + 160 - 90 * v, .7, -Math.PI / 2, 1);
      if (t >= C.exploited29) {
        g.beginPath(); g.arc(cx + 70, cy - 20, 18, 0, TAU); g.fillStyle = '#2f5fa8'; g.fill(); g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.stroke();
        for (let p = 0; p < 4; p++) { const u = clamp((tq - C.exploited29) / 0.8 - p * .08); if (u <= 0 || u >= 1) continue; g.save(); g.translate(cx + 70 + (p - 1.5) * 60 * u, cy - 40 - 140 * u); g.rotate(u * (p - 1.5) * 2); g.beginPath(); g.rect(-16, -20, 32, 40); r3aTvCel(g, '#fbf8ee', 2.5); g.restore(); }
      }
    }
  }
}
function r3aTvBoxClock(g, w, h, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.fillStyle = '#9bb53c'; g.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2 + 6;
  // the clock face flips edge-on on "money" and comes round as a gold coin
  const flip = t < C.money38 - 0.08 ? 1 : Math.abs(Math.cos(clamp((t - (C.money38 - 0.08)) / 0.24) * Math.PI));
  const isCoin = t >= C.money38 + 0.04;
  g.save(); g.translate(cx, cy); g.scale(Math.max(.06, flip), 1);
  if (!isCoin) {
    g.beginPath(); g.arc(0, 0, 92, 0, TAU); r3aTvCel(g, '#fbf8ee', 6);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 74, Math.sin(a) * 74); g.lineTo(Math.cos(a) * 84, Math.sin(a) * 84); g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.stroke(); }
    const spin = t >= C.time38 ? (tq - C.time38) * 9 : 0;
    g.lineCap = 'round'; g.strokeStyle = r3aTvNK; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-1.2 + spin / 12) * 46, Math.sin(-1.2 + spin / 12) * 46); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(-Math.PI / 2 + spin) * 70, Math.sin(-Math.PI / 2 + spin) * 70); g.stroke();
  } else { coin(g, 0, 0, 92, 0, null); g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.strokeStyle = '#a87a18'; g.lineWidth = 5; g.stroke(); }
  g.restore();
  if (isCoin && t - C.money38 < 0.7) sparkle(g, cx + 64, cy - 70, 26 * Math.sin(clamp((t - C.money38) / 0.7) * Math.PI) + 2, 1);
}
function r3aTvBoxChart(g, w, h, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.fillStyle = '#fbf3d0'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(60,40,20,.25)'; g.lineWidth = 2; for (let y = 40; y < 230; y += 30) { g.beginPath(); g.moveTo(24, y); g.lineTo(w - 16, y); g.stroke(); }
  g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.beginPath(); g.moveTo(24, 20); g.lineTo(24, 228); g.lineTo(w - 16, 228); g.stroke();
  // three top hats watch from the left edge (the shareholders), popping up on their word
  if (t >= C.share40 - 0.02) for (let k = 0; k < 3; k++) { const p = popIn(tq, C.share40 + k * 0.06, .25); if (p > 0) r3aTvScaled(g, 24, 228, 1, () => r3aTvTopHat(g, 60 + k * 2, 88 + k * 52, .55 * p, 0, 0, 0)); }
  // four quarterly bars: three grow on "luscious", the fourth on "4th quarter" and shoots off the top on "facts"
  const hs = [70, 96, 120];
  const g3 = t < C.luscious40 ? 0 : easeOutBack(clamp((t - C.luscious40) / 0.35), 1.4);
  for (let k = 0; k < 3; k++) { const hh = hs[k] * g3; if (hh < 1) continue; g.beginPath(); g.rect(120 + k * 52, 228 - hh, 38, hh); r3aTvCel(g, ['#e8862a', '#f2c230', '#9bb53c'][k], 3.5); }
  let h4 = t < C.fourth40 ? 0 : 150 * easeOutBack(clamp((t - C.fourth40) / 0.3), 1.4);
  if (t >= C.facts40) h4 += 140 * smooth(clamp((t - C.facts40) / 0.12));
  if (h4 > 1) { g.beginPath(); g.rect(276, 228 - h4, 38, h4); r3aTvCel(g, '#c0283a', 3.5); }
  if (t >= C.facts40) sparkle(g, 295, Math.max(20, 228 - h4) + 10, 24, 1);
}
function r3aTvBoxRoomKing(g, w, h, t) {
  // stanza 4 opens on the portrait: eyes shut, breath curls, a smile as he sinks back
  const C = r3aTvC;
  const sink = t >= C.easy23 ? 10 * smooth(clamp((t - C.easy23) / 0.4)) : 0;
  r3aTvBoxKing(g, w, h, t, { smile: t >= C.easy23 ? 1 : .3, sink });
  if (t >= C.breathed23) for (let k = 0; k < 3; k++) {
    const u = ((t - C.breathed23) * .9 + k / 3) % 1;
    g.strokeStyle = `rgba(255,250,235,${.9 * (1 - u)})`; g.lineWidth = 5; g.beginPath();
    for (let i = 0; i <= 12; i++) { const yy = 160 - u * 120 - i * 4, xx = 230 + u * 30 + Math.sin(i * .9 + k) * 8; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke();
  }
}

// ---------- the desk ----------
// the plan the king flings out of the box lands on the desk; the fist punches up out of it
function r3aTvDeskPlan(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  if (t < C.sent17 || t >= C.l19) return;
  const fly = clamp((tq - C.sent17) / (C.plan17 - C.sent17));
  const x0 = 640, y0 = 150, x1 = 486, y1 = 356;
  const x = lerp(x0, x1, fly), y = lerp(y0, y1, fly) - Math.sin(fly * Math.PI) * 120;
  const shake = t >= C.sent18 && t < C.fist18 + 0.4 ? Math.sin(t * 80) * 4 : 0;
  g.save(); g.translate(x + shake, y); g.rotate(fly < 1 ? fly * 6 : 0);
  g.beginPath(); g.roundRect(-60, -16, 120, 32, 14); r3aTvCel(g, '#f1e2bc', 4);
  for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 60, 0, 9, 17, 0, 0, TAU); r3aTvCel(g, '#e2cc98', 3); }
  g.strokeStyle = '#c0283a'; g.lineWidth = 4; g.beginPath(); g.moveTo(-6, -16); g.lineTo(-6, 16); g.stroke();
  g.restore();
  if (t >= C.plan17 && t - C.plan17 < 0.3) { g.strokeStyle = r3aTvNK; g.lineWidth = 4; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(x1 + sd * 74, y1 + 8); g.lineTo(x1 + sd * 96, y1 + 2); g.stroke(); } }
  if (t >= C.fist18 - 0.02) {
    const v = easeOutBack(clamp((tq - C.fist18) / 0.25), 1.8);
    r3aTvGauntlet(g, x1, y1 - 20 - 110 * v, 1.05, 0, 0);
    if (t - C.fist18 < 0.5) { g.strokeStyle = '#fbf3d0'; g.lineWidth = 5; for (let k = 0; k < 5; k++) { const a = -Math.PI * .9 + k * .45; g.beginPath(); g.moveTo(x1 + Math.cos(a) * 90, y1 - 150 + Math.sin(a) * 70); g.lineTo(x1 + Math.cos(a) * 118, y1 - 150 + Math.sin(a) * 92); g.stroke(); } }
  }
}
// a grey mouse on the desk: it looks out at us on "nobody" and puts its paws over its mouth on "squeak"
function r3aTvMouse(g, t) {
  const C = r3aTvC; if (t < C.nobody30 - 0.3 || t >= C.l31) return;
  const up = smooth(clamp((t - (C.nobody30 - 0.3)) / 0.3)), x = 520, y = 372 + (1 - up) * 50, paws = t >= C.squeak30 - 0.06;
  g.save(); g.beginPath(); g.rect(0, 0, 960, 372); g.clip();
  g.beginPath(); g.ellipse(x + 30, y - 18, 46, 30, 0, Math.PI, TAU); r3aTvCel(g, '#9a9aa4', 4);
  g.beginPath(); g.ellipse(x - 10, y - 46, 30, 26, 0, 0, TAU); r3aTvCel(g, '#a8a8b2', 4);
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(x - 10 + sd * 26, y - 70, 15, 0, TAU); r3aTvCel(g, '#e8b8c4', 3.5); }
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(x - 10 + sd * 10, y - 50, 4, 0, TAU); g.fillStyle = r3aTvNK; g.fill(); }
  g.beginPath(); g.arc(x - 10, y - 38, 5, 0, TAU); g.fillStyle = '#e06a7a'; g.fill();
  if (paws) for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(x - 10 + sd * 9, y - 32, 9, 7, 0, 0, TAU); r3aTvCel(g, '#e8b8c4', 3); }
  g.restore();
  r3aTvHead(x - 44, y - 88, x + 22, y - 18);
}
function r3aTvDesk(g, t) {
  const C = r3aTvC;
  g.drawImage(NW.set, 0, 0);
  // what the anchor does: shuffles his copy before the first story, glances at the box on its cues,
  // recoils from the fist, looks round for the squeak
  let tap = 0;
  for (const c of [11.25, 11.75]) if (t >= c && t < c + .3) tap = Math.max(tap, Math.sin((t - c) / .3 * Math.PI));
  let look = 0, lean = 0, brows = 0;
  const near = (a, d = .5) => t >= a && t < a + d;
  if (t < C.l0 - 0.6) look = t > 12.3 ? 0 : .3;
  if (near(C.reason8, 0.7)) look = .6;
  if (t >= C.sent17 && t < C.l19) { look = t < C.fist18 ? .5 : -.4; if (t >= C.fist18) { lean = -18 * smooth(clamp((t - C.fist18) / .15)); brows = 1; } }
  if (t >= C.l22 && t < C.l23) brows = t >= C.do22 ? 1 : .4;
  if (t >= C.nobody30 && t < C.squeak30) look = Math.sin((t - C.nobody30) * 9) * .8;
  if (t >= C.squeak30) { look = .9; brows = 1; }
  r3aTvAnchor(g, t, { tap, look, lean, brows, talk: t >= C.l0 - 0.1 });
  r3aTvDeskPlan(g, t);
  r3aTvMouse(g, t);
  r3aTvBox(g, (w, h) => {
    if (t < C.l0 - 0.06) r3aTvBoxGlobe(g, w, h, t);
    else if (t < C.l1 - 0.06) r3aTvBoxKing(g, w, h, t, { glint: t >= C.king0 ? Math.sin(clamp((t - C.king0) / .5) * Math.PI) : 0 });
    else if (t < C.l3 - 0.06) r3aTvBoxPlan(g, w, h, t);
    else if (t < C.l4 - 0.06) r3aTvBoxFist(g, w, h, t);
    else if (t < C.l5) r3aTvBoxMouth(g, w, h, t);
    else if (t < C.l9 - 0.06) r3aTvBoxHand(g, w, h, t);
    else if (t < C.l10 - 0.06) r3aTvBoxSacks(g, w, h, t);
    else if (t < C.l11) r3aTvBoxPillar(g, w, h, t);
    else if (t < C.l22 - 0.06) r3aTvBoxKing(g, w, h, t, { smile: t >= C.sent17 ? .6 : 0 });
    else if (t < C.l23 - 0.06) r3aTvBoxBuilding(g, w, h, t);
    else if (t < C.l27 - 0.06) r3aTvBoxRoomKing(g, w, h, t);
    else if (t < C.l29 - 0.06) r3aTvBoxBalance(g, w, h, t);
    else if (t < C.l30 - 0.06) r3aTvBoxLawBook(g, w, h, t);
    else if (t < C.l31) { r3aTvBoxLawBook(g, w, h, t); }
    else if (t < C.l40 - 0.06) r3aTvBoxClock(g, w, h, t);
    else r3aTvBoxChart(g, w, h, t);
  });
  // the flung plan crosses the box's frame, so draw it over the box while it's flying
  if (t >= C.sent17 && t < C.plan17) r3aTvDeskPlan(g, t);
}
