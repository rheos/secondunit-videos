// tv-B stanza 10 (213.458-240.917): the couple, as news film. Stand-ins, never portraits: round 2's couple
// (her green coat and red scarf, his duffel coat), drawn the same way. No prison: the cops only appear.
// Places, moving forward: a dot map of England, their sitting room, a door, a typewriter, a street corner
// (rain, heat, handing out), the sitting room again (the parents), the street (the king's shadow, the lawyers),
// and back to the desk for the last line, so the cut at 240.917 lands on the next bulletin. Pure.
function r3bTvInitNewsFilm() { r3bTvInitWorkers(); }
// the couple: round 2's activist(), with an expression and a few poses. o: {raise, frown 0..1, green 0..1, fan, brow, seated}
function r3bTvPerson(g, x, y, who, t, o = {}) {
  const isW = who === 'w', raise = o.raise || 0;
  if (!o.seated) activist(g, x, y, who, raise, t);
  else {
    // seated on the sofa: only the head and shoulders show above its back
    g.beginPath(); g.moveTo(x - 54, y + 120); g.quadraticCurveTo(x - 54, y - 2, x - 26, y - 6); g.lineTo(x + 26, y - 6); g.quadraticCurveTo(x + 54, y - 2, x + 54, y + 120); g.closePath(); nCel(g, isW ? '#3f7a5a' : '#b0703a', 5);
    if (isW) { g.beginPath(); g.moveTo(x - 30, y - 4); g.quadraticCurveTo(x, y + 16, x + 30, y - 4); g.lineTo(x + 24, y + 50); g.lineTo(x + 10, y + 46); g.lineTo(x + 14, y + 14); g.quadraticCurveTo(x, y + 20, x - 30, y + 8); g.closePath(); nCel(g, '#c8303c', 3.5); }
    g.beginPath(); g.ellipse(x, y - 40, 34, 38, 0, 0, TAU); nCel(g, isW ? '#e8b890' : '#d8a078', 4.5);
    if (o.back) { g.beginPath(); g.ellipse(x, y - 44, 36, 38, 0, 0, TAU); nCel(g, isW ? '#3a2418' : '#6a4a2a', 4.5); }
    else if (isW) { g.beginPath(); g.moveTo(x - 38, y - 24); g.quadraticCurveTo(x - 46, y - 86, x, y - 84); g.quadraticCurveTo(x + 46, y - 86, x + 38, y - 24); g.lineTo(x + 30, y - 24); g.quadraticCurveTo(x + 26, y - 60, x, y - 62); g.quadraticCurveTo(x - 26, y - 60, x - 30, y - 24); g.closePath(); nCel(g, '#3a2418', 4); }
    else { g.beginPath(); g.moveTo(x - 34, y - 44); g.quadraticCurveTo(x - 34, y - 82, x, y - 80); g.quadraticCurveTo(x + 34, y - 82, x + 34, y - 44); g.quadraticCurveTo(x, y - 66, x - 34, y - 44); g.closePath(); nCel(g, '#6a4a2a', 4); }
    if (!o.back) { for (const sd of [-1, 1]) { g.beginPath(); g.arc(x + sd * 12, y - 42, 4.5, 0, TAU); g.fillStyle = NINK; g.fill(); } g.strokeStyle = NINK; g.lineWidth = 3.5; g.beginPath(); g.moveTo(x - 9, y - 20); g.lineTo(x + 9, y - 20); g.stroke(); }
  }
  g.save(); g.translate(0, 0); r3bTvHead(g, x - 42, y - 86, x + 42, y); g.restore();
  if (o.back) return;
  const skin = isW ? '#e8b890' : '#d8a078';
  // the mouth repainted for an expression: a frown, a green queasy tinge, knitted brows
  if (o.frown || o.green) {
    g.beginPath(); g.ellipse(x, y - 22, 14, 6, 0, 0, TAU); g.fillStyle = skin; g.fill();
    if (o.green) { g.save(); g.beginPath(); g.ellipse(x, y - 40, 33, 37, 0, 0, TAU); g.clip(); g.fillStyle = `rgba(110,190,90,${.45 * o.green})`; g.fillRect(x - 40, y - 52, 80, 50); g.restore(); }
    g.strokeStyle = NINK; g.lineWidth = 3.5; g.beginPath(); g.arc(x, y - 12, 9, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke();
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(x + sd * 4, y - 52); g.lineTo(x + sd * 20, y - 58); g.stroke(); }
  }
  if (o.smile) { g.beginPath(); g.ellipse(x, y - 21, 12, 5, 0, 0, TAU); g.fillStyle = skin; g.fill(); g.strokeStyle = NINK; g.lineWidth = 3.5; g.beginPath(); g.arc(x, y - 26, 10, .2 * Math.PI, .8 * Math.PI); g.stroke(); }
  if (o.sweat) for (let k = 0; k < 2; k++) { const u = ((t * 1.4 + k * .5) % 1); g.beginPath(); g.ellipse(x + (k ? 36 : -36), y - 56 + u * 30, 5, 8, 0, 0, TAU); nCel(g, '#9ad0f0', 2.5); }
}
function r3bTvPasser(g, x, y, k, o = {}) {
  // passers-by: a coat, a hat or a headscarf, a shopping bag; generic, round-faced
  const coat = ['#5a6a8a', '#a85a3a', '#7a6a3a'][k], skin = ['#f0c8a0', '#a8724a', '#e0b088'][k];
  const step = o.walk ? Math.sin(o.walk * 9) : 0;
  for (const sd of [-1, 1]) { g.strokeStyle = NINK; g.lineWidth = 12; g.beginPath(); g.moveTo(x + sd * 14, y + 180); g.lineTo(x + sd * 14 + sd * step * 12, y + 230); g.stroke(); }
  g.beginPath(); g.roundRect(x - 44, y, 88, 186, 26); nCel(g, coat, 5);
  g.beginPath(); g.ellipse(x, y - 34, 32, 36, 0, 0, TAU); nCel(g, skin, 4.5);
  r3bTvHead(g, x - 40, y - 80, x + 40, y + 2);
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(x + sd * 11, y - 36, 4, 0, TAU); g.fillStyle = NINK; g.fill(); }
  g.strokeStyle = NINK; g.lineWidth = 3.5; g.beginPath(); g.arc(x, y - 24, 8, .2 * Math.PI, .8 * Math.PI); g.stroke();
  if (k === 0) { g.beginPath(); g.ellipse(x, y - 64, 46, 9, 0, 0, TAU); nCel(g, '#3a3a44', 3.5); g.beginPath(); g.roundRect(x - 28, y - 96, 56, 34, 6); nCel(g, '#3a3a44', 3.5); }
  if (k === 1) { g.beginPath(); g.moveTo(x - 36, y - 26); g.quadraticCurveTo(x - 40, y - 78, x, y - 76); g.quadraticCurveTo(x + 40, y - 78, x + 36, y - 26); g.quadraticCurveTo(x, y - 60, x - 36, y - 26); g.closePath(); nCel(g, '#e8b630', 3.5); }
  if (k === 2) { g.beginPath(); g.moveTo(x - 34, y - 40); g.quadraticCurveTo(x - 30, y - 74, x, y - 72); g.quadraticCurveTo(x + 30, y - 74, x + 34, y - 40); g.quadraticCurveTo(x, y - 56, x - 34, y - 40); g.closePath(); nCel(g, '#2a1a10', 3.5); }
  // the hand that takes the leaflet
  const hx = x - 50 - (o.take || 0) * 20, hy = y + 80 - (o.take || 0) * 30;
  tube(g, [[x - 30, y + 30], [x - 52, y + 60], [hx, hy]], 20, coat); mitten(g, hx, hy, 13, 0, skin);
  if (o.leaflet) { g.save(); g.translate(hx - 4, hy - 30); g.rotate(-.1); g.beginPath(); g.rect(-22, -30, 44, 60); nCel(g, '#fbf8ee', 3); g.strokeStyle = 'rgba(40,30,50,.7)'; g.lineWidth = 2.5; for (let r = 0; r < 4; r++) { g.beginPath(); g.moveTo(-14, -18 + r * 12); g.lineTo(14 - (r % 2) * 8, -18 + r * 12); g.stroke(); } g.restore(); }
}
function r3bTvParent(g, x, y, who, t, o = {}) {
  // older stand-ins: grey hair, glasses, a cardigan; wagging a finger on the cue
  const isW = who === 'w';
  g.beginPath(); g.roundRect(x - 50, y, 100, 200, 28); nCel(g, isW ? '#b07aa8' : '#7a7a5a', 5);
  for (let b = 0; b < 4; b++) { g.beginPath(); g.arc(x, y + 30 + b * 34, 5, 0, TAU); nCel(g, '#f2e6c8', 2); }
  g.beginPath(); g.ellipse(x, y - 36, 34, 38, 0, 0, TAU); nCel(g, '#f0c8a0', 4.5);
  r3bTvHead(g, x - 46, y - 86, x + 46, y + 2);
  if (isW) { g.beginPath(); g.arc(x, y - 56, 38, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); nCel(g, '#d8d8dc', 4); for (const sd of [-1, 1]) { g.beginPath(); g.arc(x + sd * 34, y - 46, 12, 0, TAU); nCel(g, '#d8d8dc', 3); } }
  else { g.beginPath(); g.arc(x, y - 58, 30, Math.PI * 1.1, Math.PI * 1.9); g.strokeStyle = '#d8d8dc'; g.lineWidth = 8; g.stroke(); for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(x + sd * 32, y - 40, 7, 12, 0, 0, TAU); nCel(g, '#d8d8dc', 3); } }
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(x + sd * 13, y - 38, 10, 0, TAU); g.strokeStyle = NINK; g.lineWidth = 3.5; g.stroke(); g.beginPath(); g.arc(x + sd * 13, y - 38, 3.5, 0, TAU); g.fillStyle = NINK; g.fill(); }
  g.strokeStyle = NINK; g.lineWidth = 3.5; g.beginPath(); g.arc(x, y - 12, 9, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke();
  const wag = o.wag ? Math.sin(t * 22) * .35 : 0, sd = isW ? 1 : -1;
  const hx = x + sd * 70, hy = y - (o.wag ? 30 : -100);
  tube(g, [[x + sd * 40, y + 30], [x + sd * 70, y + 50], [hx, hy]], 22, isW ? '#b07aa8' : '#7a7a5a');
  g.save(); g.translate(hx, hy); g.rotate(wag); mitten(g, 0, 0, 15, 0, '#f0c8a0'); if (o.wag) { g.beginPath(); g.roundRect(-5, -40, 10, 32, 5); nCel(g, '#f0c8a0', 3); } g.restore();
}
// ---------- the places ----------
function r3bTvMapEngland(g, t) {
  const Q = R3BTV_Q, tq = two2(t);
  // the news's own dot-matrix style: Great Britain in orange dots on navy, the couple pop on, a target ring
  const z = t >= Q.l88 ? lerp(1, 2.1, smooth(clamp((t - Q.l88) / .5))) : 1, cx = 470, cy = 330;
  g.fillStyle = '#162544'; g.fillRect(0, 0, 960, 720);
  g.save(); g.translate(480, 215); g.scale(z, z); g.translate(-(z > 1 ? cx : 480), -(z > 1 ? lerp(215, cy - 40, (z - 1) / 1.1) : 215));
  const land = [[470, 330, 110, 70], [430, 230, 60, 90], [420, 120, 70, 70], [450, 60, 40, 40], [290, 230, 40, 40]];
  for (let y = 0; y < 480; y += 16) for (let x = 120; x < 800; x += 16) {
    const inL = land.some(([lx, ly, rx, ry]) => ((x - lx) / rx) ** 2 + ((y - ly) / ry) ** 2 < 1 + n1(9, x * .03 + y * .02) * .2);
    g.fillStyle = inL ? 'rgba(240,150,60,.85)' : 'rgba(120,150,200,.16)'; g.beginPath(); g.arc(x, y, inL ? 5 : 2.4, 0, TAU); g.fill();
  }
  const p = popIn(tq, Q.couple, .25);
  if (p > 0) {
    g.save(); g.translate(cx, cy); g.scale(.42 * p, .42 * p); g.translate(-cx, -cy);
    const sick = t >= Q.sick - .02 ? 1 : 0;
    r3bTvPerson(g, cx - 64, cy - 150, 'w', t, { frown: sick, green: sick * smooth(clamp((t - Q.sick) / .3)) });
    r3bTvPerson(g, cx + 64, cy - 156, 'm', t, { frown: sick, green: sick * smooth(clamp((t - Q.sick) / .3)) });
    g.restore();
  }
  if (t >= Q.england - .02 && t < Q.l88 + .2) { const on = Math.floor(tq * 6) % 2 === 0; if (on) { g.strokeStyle = '#f2c230'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy - 40, 80, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(cx - 100, cy - 40); g.lineTo(cx - 60, cy - 40); g.moveTo(cx + 60, cy - 40); g.lineTo(cx + 100, cy - 40); g.stroke(); } }
  g.restore();
}
function r3bTvSittingRoom(g) {
  g.fillStyle = '#d8c08a'; g.fillRect(0, 0, 960, 720);
  g.strokeStyle = 'rgba(150,100,40,.35)'; g.lineWidth = 10; for (let x = 0; x < 960; x += 60) { g.beginPath(); for (let y = 0; y <= 720; y += 20) { const xx = x + Math.sin(y / 40) * 12; y ? g.lineTo(xx, y) : g.moveTo(xx, y); } g.stroke(); }
  g.fillStyle = '#7a4a24'; g.fillRect(0, 400, 960, 320);
}
function r3bTvWatching(g, t) {
  const Q = R3BTV_Q, tq = two2(t);
  r3bTvSittingRoom(g);
  // their own little TV, facing us across the room; the king on it, then ticking like a clock
  const tvx = 480, tvy = 130;
  g.beginPath(); g.roundRect(tvx - 150, tvy - 100, 300, 220, 18); nCel(g, '#5a3a1e', 5);
  g.save(); g.beginPath(); g.roundRect(tvx - 128, tvy - 82, 220, 180, 26); g.clip(); g.fillStyle = '#2a3a4a'; g.fillRect(tvx - 140, tvy - 90, 240, 200);
  if (t >= Q.king89 - .02) {
    const tick = t >= Q.way - .02 ? (Math.floor((t - Q.way) * 3) % 2 ? .22 : -.22) : 0;
    g.save(); g.translate(tvx - 18, tvy + 10); g.rotate(tick);
    if (t >= Q.ticked - .02) { g.beginPath(); g.arc(0, 0, 80, 0, TAU); nCel(g, '#fbf8ee', 4); g.strokeStyle = NINK; g.lineWidth = 3; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 68, Math.sin(a) * 68); g.lineTo(Math.cos(a) * 76, Math.sin(a) * 76); g.stroke(); } }
    kingFace(g, 0, 6, .55, t, 0);
    g.restore();
  }
  g.restore();
  for (const kx of [tvx + 120]) { g.beginPath(); g.arc(kx, tvy - 30, 14, 0, TAU); nCel(g, '#c8b89a', 3); g.beginPath(); g.arc(kx, tvy + 20, 14, 0, TAU); nCel(g, '#c8b89a', 3); }
  // pendulum under the set, swinging with the tick
  if (t >= Q.way - .02) { const a = Math.sin((t - Q.way) * Math.PI * 3) * .4; g.save(); g.translate(tvx, tvy + 120); g.rotate(a); g.strokeStyle = '#c8962a'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 100); g.stroke(); g.beginPath(); g.arc(0, 110, 16, 0, TAU); nCel(g, '#f2c444', 3.5); g.restore(); }
  // the sofa back across the foreground and the backs of their heads
  r3bTvPerson(g, 330, 340, 'w', t, { seated: true, back: true });
  r3bTvPerson(g, 630, 334, 'm', t, { seated: true, back: true });
  g.beginPath(); g.roundRect(150, 330, 660, 160, 30); nCel(g, '#c8642a', 5);
  for (const bx of [330, 630]) { g.beginPath(); g.roundRect(bx - 130, 350, 260, 120, 22); g.strokeStyle = 'rgba(80,30,10,.45)'; g.lineWidth = 4; g.stroke(); }
}
function r3bTvDoor(g, t) {
  const Q = R3BTV_Q, tq = two2(t);
  g.fillStyle = '#c87a5a'; g.fillRect(0, 0, 960, 720);
  g.strokeStyle = 'rgba(90,40,20,.35)'; g.lineWidth = 3; for (let y = 10; y < 420; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(960, y); g.stroke(); for (let x = (y / 28 % 2) * 30; x < 960; x += 60) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 28); g.stroke(); } }
  g.fillStyle = '#8a8478'; g.fillRect(0, 420, 960, 300); g.strokeStyle = NINK; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 420); g.lineTo(960, 420); g.stroke();
  const open = t >= Q.gp - .02 ? smooth(clamp((tq - Q.gp) / .35)) : 0;
  g.beginPath(); g.rect(620, 80, 200, 340); nCel(g, '#fff3c0', 5);
  g.save(); g.translate(620, 80); g.scale(1 - open * .8, 1);
  g.beginPath(); g.rect(0, 0, 200, 340); nCel(g, '#2f7a4a', 5);
  g.beginPath(); g.rect(40, 40, 120, 100); nCel(g, '#cfe0e8', 4); g.beginPath(); g.arc(170, 190, 9, 0, TAU); nCel(g, '#f2c444', 3);
  g.restore();
  if (open > 0) { g.fillStyle = `rgba(255,240,180,${.35 * open})`; g.beginPath(); g.moveTo(620, 420); g.lineTo(820, 420); g.lineTo(900, 520); g.lineTo(520, 520); g.closePath(); g.fill(); }
  // they walk in from the left on the cue, and stop at the door; she knocks
  const u = smooth(clamp((t - Q.went + .1) / (Q.gp - Q.went))), bob = u > 0 && u < 1 ? Math.abs(Math.sin(t * 9)) * -8 : 0;
  r3bTvPerson(g, lerp(-120, 440, u), 226 + bob, 'w', t, {});
  r3bTvPerson(g, lerp(-260, 300, u), 220 + bob, 'm', t, {});
}
function r3bTvTypewriter(g, t) {
  const Q = R3BTV_Q, tq = two2(t);
  woodGrain(g, 0, 0, 960, 720, '#6b3f22', 4243, true);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, 0, 960, 720);
  // the sheet coming up out of the platen, typed line by line, pulled out on its cue
  const pull = t >= Q.sheet - .02 ? smooth(clamp((tq - Q.sheet) / .3)) : 0;
  const lines = t >= Q.made ? Math.min(7, Math.floor((t - Q.made) * 6) + 1) : 0;
  const sy = lerp(lerp(250, 60, clamp(lines / 7)), -40, pull), carriage = lines ? (t * 6 % 1) * 120 : 0;
  g.save(); g.translate(480 + (pull > 0 ? 0 : 60 - carriage), sy);
  g.beginPath(); g.rect(-130, 0, 260, 330); nCel(g, '#fbf8ee', 4);
  g.strokeStyle = 'rgba(40,30,50,.8)'; g.lineWidth = 4; for (let k = 0; k < lines; k++) { g.beginPath(); g.moveTo(-100, 30 + k * 26); g.lineTo(100 - (k % 3) * 30, 30 + k * 26); g.stroke(); }
  if (t >= Q.fact - .02) { g.save(); g.translate(0, 230); g.scale(.5, .5); g.beginPath(); g.moveTo(-50, 0); for (let k = 0; k <= 8; k++) g.lineTo(-50 + k * 12.5, k % 2 ? -26 : -58); g.lineTo(50, 0); g.closePath(); nCel(g, '#fbf8ee', 5); g.strokeStyle = '#c8303c'; g.lineWidth = 10; g.beginPath(); g.moveTo(-70, 10); g.lineTo(70, -70); g.stroke(); g.restore(); }
  g.restore();
  if (pull <= 0) {
    // the typewriter body (sheet sits behind its platen)
    g.beginPath(); g.roundRect(240, 300, 480, 150, 22); nCel(g, '#3a4a5a', 5);
    g.beginPath(); g.roundRect(260 + 60 - carriage, 270, 380, 40, 18); nCel(g, '#2a3440', 4);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(300 + k * 45 + r * 12, 340 + r * 30, 11, 0, TAU); nCel(g, '#e8e4d8', 2.5); }
  } else {
    // copies fanning out on the desk
    for (let k = 0; k < 5; k++) { const u = clamp((tq - Q.sheet - .1 - k * .05) / .25); g.save(); g.translate(480 + (k - 2) * 110 * u, 330 - u * 10); g.rotate((k - 2) * .12 * u); g.beginPath(); g.rect(-70, -90, 140, 180); nCel(g, k % 2 ? '#f6e6a0' : '#f6c8d0', 3.5); g.strokeStyle = 'rgba(40,30,50,.6)'; g.lineWidth = 3; for (let r = 0; r < 5; r++) { g.beginPath(); g.moveTo(-50, -60 + r * 22); g.lineTo(50 - (r % 2) * 20, -60 + r * 22); g.stroke(); } g.restore(); }
  }
}
function r3bTvStreet(g, t, mode) {
  const Q = R3BTV_Q, tq = two2(t);
  const heatU = t >= Q.heat - .02 && t < Q.l96 ? 1 : 0, rainU = t >= Q.rain - .02 && t < Q.heat - .02 ? 1 : 0;
  g.fillStyle = heatU ? '#f4a050' : rainU ? '#8a9098' : '#a8c8d8'; g.fillRect(0, 0, 960, 720);
  if (heatU) { const p = popIn(tq, Q.heat, .3); g.save(); g.translate(820, 80); g.scale(p, p); g.beginPath(); g.arc(0, 0, 60, 0, TAU); nCel(g, '#ffd23a', 5); g.restore(); }
  // a row of shopfronts, a lamp post
  g.beginPath(); g.rect(0, 80, 960, 340); nCel(g, '#c8b48a', 5);
  for (const sx of [40, 360, 680]) { g.beginPath(); g.rect(sx, 160, 240, 180); nCel(g, rainU ? '#5a6a78' : '#9ac0d0', 4); g.beginPath(); g.rect(sx - 10, 120, 260, 34); nCel(g, ['#c8303c', '#2f7a4a', '#3a6aa8'][sx / 320 | 0], 4); }
  g.fillStyle = '#8a8478'; g.fillRect(0, 420, 960, 300); g.strokeStyle = NINK; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 420); g.lineTo(960, 420); g.stroke();
  if (mode === 'lawyers' && t >= Q.king99 - .02) {
    // the king's shadow falls over the shopfronts: a crowned silhouette
    const a = smooth(clamp((tq - Q.king99) / .3)), s = lerp(.6, 1, a);
    g.save(); g.globalAlpha = .62 * a; g.translate(720, 420); g.scale(s * 1.5, s * 1.5); g.fillStyle = '#140e1e';
    g.beginPath(); g.ellipse(0, -120, 50, 56, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-46, -160); for (let k = 0; k <= 8; k++) g.lineTo(-46 + k * 11.5, k % 2 ? -176 : -206); g.lineTo(46, -160); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-110, 0); g.quadraticCurveTo(-100, -70, -40, -70); g.lineTo(40, -70); g.quadraticCurveTo(100, -70, 110, 0); g.closePath(); g.fill();
    g.restore();
  }
  // the couple at their spot with leaflets
  const fan = heatU ? Math.sin(t * 10) * .4 + .3 : 0;
  r3bTvPerson(g, 190, 226, 'w', t, { raise: mode === 'lawyers' ? 0 : fan, sweat: heatU });
  r3bTvPerson(g, 320, 220, 'm', t, { raise: mode === 'lawyers' ? 0 : fan * .8, sweat: heatU });
  if (mode === 'give') {
    // passers-by walk past; each takes a leaflet on its word
    [[Q.gave, 0], [Q.truth, 1], [Q.free, 2]].forEach(([cue, k]) => {
      const t0 = cue - 1.0; if (t < t0) return;
      const u = (t - t0) / 2.4; if (u > 1) return;
      const x = lerp(1060, 400, Math.min(1, u * 1.6)) - Math.max(0, u - .62) * 1600;
      const took = t >= cue - .02;
      r3bTvPasser(g, x, 236, k, { walk: t, take: took ? 0 : smooth(clamp((t - cue + .4) / .4)), leaflet: took });
    });
  }
  if (mode === 'lawyers' && t >= Q.lawyers - .3) {
    const inU = smooth(clamp((tq - (Q.lawyers - .3)) / .5));
    [620, 740, 860].forEach((x0, k) => { const bob = (Math.floor(tq * 6) + k) % 2 ? -6 : 0; lawyer(g, x0 + (1 - inU) * 420, 260 + bob, .85, k, t, { open: 0, lean: .06 }); });
    for (const x0 of [620, 740, 860]) { const x = x0 + (1 - inU) * 420; g.save(); g.translate(x, 260); g.scale(.85, .85); r3bTvHead(g, -44, -96, 44, 0); g.restore(); }
  }
  if (rainU) { g.strokeStyle = 'rgba(220,235,255,.75)'; g.lineWidth = 3; for (let k = 0; k < 70; k++) { const x = (k * 137 + tq * 400) % 1000 - 20, y = (k * 71 + tq * 1300) % 720; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 34); g.stroke(); } }
  if (heatU) { g.strokeStyle = 'rgba(255,240,200,.6)'; g.lineWidth = 4; for (let k = 0; k < 6; k++) { g.beginPath(); for (let y = 0; y <= 120; y += 10) { const x = 80 + k * 160 + Math.sin(y / 14 + t * 8 + k) * 8; y ? g.lineTo(x, 300 - y) : g.moveTo(x, 300); } g.stroke(); } }
}
function r3bTvParents(g, t) {
  const Q = R3BTV_Q, tq = two2(t);
  r3bTvSittingRoom(g);
  g.beginPath(); g.roundRect(160, 300, 640, 140, 30); nCel(g, '#c8642a', 5);
  r3bTvPerson(g, 400, 226, 'w', t, { raise: .15 });
  r3bTvPerson(g, 560, 220, 'm', t, { raise: .15 });
  const p = popIn(tq, Q.parents, .3);
  if (p > 0) {
    const wag = t >= Q.told - .02;
    for (const [x, who] of [[170, 'w'], [790, 'm']]) { g.save(); g.translate(x, 420); g.scale(p, p); g.translate(-x, -420); r3bTvParent(g, x, 226, who, t, { wag }); g.restore(); }
  }
  if (t >= Q.stop - .02) {
    // a big raised palm in the foreground, between them, below their faces
    const s = easeOutBack(clamp((tq - Q.stop) / .25), 2);
    g.save(); g.translate(480, 380); g.scale(s, s);
    g.beginPath(); g.roundRect(-70, -60, 140, 150, 50); nCel(g, '#f0c8a0', 5);
    g.beginPath(); g.ellipse(-84, 10, 22, 44, -.5, 0, TAU); nCel(g, '#f0c8a0', 4.5);
    g.restore();
  }
}
function r3bTvBoxCouple(g, w, h, t) {
  // in the box: the couple raise their leaflets high against a sunburst
  g.fillStyle = '#2a8a84'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f6c64'; for (let k = 0; k < 10; k++) { g.beginPath(); g.moveTo(w / 2, h); g.arc(w / 2, h, 500, Math.PI + k / 10 * Math.PI, Math.PI + (k + .5) / 10 * Math.PI); g.closePath(); g.fill(); }
  const r = t >= R3BTV_Q.quick - .02 ? easeOutBack(clamp((two2(t) - R3BTV_Q.quick) / .3), 1.6) : 0;
  g.save(); g.scale(.62, .62);
  r3bTvPerson(g, 200, 200, 'w', t, { raise: r }); r3bTvPerson(g, 340, 194, 'm', t, { raise: r });
  g.restore();
}
function r3bTvBoxCops(g, w, h, t) {
  g.fillStyle = '#9cc8e8'; g.fillRect(0, 0, w, h);
  const up = t >= R3BTV_Q.cops - .02 ? easeOutBack(clamp((two2(t) - R3BTV_Q.cops) / .25), 1.8) : 0;
  g.save(); g.scale(.5, .5);
  if (up > 0) [130, 340, 550].forEach((x, k) => bobby(g, x, lerp(560, 250, up), k, t));
  g.beginPath(); g.moveTo(0, 520); g.lineTo(0, 380); for (let x = 0; x <= 700; x += 30) g.quadraticCurveTo(x + 15, 360, x + 30, 380); g.lineTo(700, 520); g.closePath(); nCel(g, '#3f7a34', 5);
  g.restore();
}
function r3bTvStanza10(g, t) {
  const Q = R3BTV_Q;
  const film = (fn) => { r3bTvFull(g, t, fn); g.fillStyle = 'rgba(255,190,110,.06)'; g.fillRect(0, 0, 960, 720); };
  if (t < Q.l89 - .04) film(r3bTvMapEngland);
  else if (t < Q.l91 - .04) film(r3bTvWatching);
  else if (t < Q.l92 - .04) film(r3bTvDoor);
  else if (t < Q.l93 - .04) film(r3bTvTypewriter);
  else if (t < Q.l95 - .04) film((gg, tt) => r3bTvStreet(gg, tt, 'stand'));
  else if (t < Q.l96 - .04) film((gg, tt) => r3bTvStreet(gg, tt, 'give'));
  else if (t < Q.l97 - .04) r3bTvDesk(g, t, null, { lines: [96], look: .4, boxDraw: (gg, w, h) => r3bTvBoxCouple(gg, w, h, t) });
  else if (t < Q.l99 - .04) film(r3bTvParents);
  else if (t < Q.l100 - .04) film((gg, tt) => r3bTvStreet(gg, tt, 'lawyers'));
  else r3bTvDesk(g, t, null, { lines: [100], look: t > Q.cops ? .55 : 0, boxDraw: (gg, w, h) => r3bTvBoxCops(gg, w, h, t) });
}
