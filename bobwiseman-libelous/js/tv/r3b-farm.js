// tv-B stanza 9 (198.125-213.458): the king's factory farms, as news film. Stylised and plain: flat cel
// animals, no blood, no wounds; the dying is a dark doorway and red lamps, the last line is drips into a gutter.
// One place moving forward: the picture-book farm gives way to the shed, then inside it, end to end.
// Pure: a function of song time t only.
function r3bTvChicken(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s);
  if (!o.headOnly) { for (const sd of [-1, 1]) { g.strokeStyle = '#e8a020'; g.lineWidth = 5; g.beginPath(); g.moveTo(sd * 10, 30); g.lineTo(sd * 12, 52); g.stroke(); }
    g.beginPath(); g.ellipse(0, 6, 40, 30, 0, 0, TAU); nCel(g, '#fbf8ee', 4); g.beginPath(); g.ellipse(-8, 6, 20, 12, -.2, 0, TAU); g.strokeStyle = NINK; g.lineWidth = 3; g.stroke(); }
  g.beginPath(); g.arc(30, -22, 18, 0, TAU); nCel(g, '#fbf8ee', 4);
  g.beginPath(); g.moveTo(22, -40); g.arc(28, -42, 6, Math.PI, 0); g.arc(38, -38, 6, Math.PI, .3); g.lineTo(40, -32); g.closePath(); nCel(g, '#c8303c', 2.5);
  g.beginPath(); g.moveTo(46, -24); g.lineTo(60, -18); g.lineTo(46, -14); g.closePath(); nCel(g, '#f2c230', 2.5);
  g.fillStyle = NINK; g.beginPath(); g.arc(34, -26, 3.5, 0, TAU); g.fill();
  g.restore();
}
function r3bTvPig(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.scale(s * (o.flip ? -1 : 1), s);
  for (const lx of [-28, -10, 14, 32]) { g.beginPath(); g.rect(lx - 6, 18, 12, 30); nCel(g, '#f2a0b0', 3); }
  g.beginPath(); g.ellipse(0, 0, 56, 36, 0, 0, TAU); nCel(g, '#f6b4c2', 4.5);
  g.strokeStyle = NINK; g.lineWidth = 3.5; g.beginPath(); g.moveTo(-56, -4); g.bezierCurveTo(-74, -12, -66, -26, -60, -16); g.stroke();
  g.beginPath(); g.arc(46, -14, 24, 0, TAU); nCel(g, '#f6b4c2', 4);
  for (const ex of [36, 56]) { g.beginPath(); g.moveTo(ex - 8, -30); g.lineTo(ex, -48); g.lineTo(ex + 8, -32); g.closePath(); nCel(g, '#f2a0b0', 3); }
  g.beginPath(); g.ellipse(66, -10, 10, 12, 0, 0, TAU); nCel(g, '#f2a0b0', 3); g.fillStyle = NINK; for (const d of [-4, 4]) { g.beginPath(); g.arc(66, -10 + d, 2.2, 0, TAU); g.fill(); }
  g.beginPath(); g.arc(46, -22, 3.5, 0, TAU); g.fill();
  g.restore();
}
function r3bTvShed(g, x, y, w, h, t, crown) {
  g.beginPath(); g.rect(x, y, w, h); nCel(g, '#9aa0a4', 5);
  g.strokeStyle = 'rgba(40,40,50,.3)'; g.lineWidth = 3; for (let xx = x + 24; xx < x + w; xx += 24) { g.beginPath(); g.moveTo(xx, y + 4); g.lineTo(xx, y + h); g.stroke(); }
  g.beginPath(); g.moveTo(x - 14, y); g.lineTo(x + 30, y - 46); g.lineTo(x + w - 30, y - 46); g.lineTo(x + w + 14, y); g.closePath(); nCel(g, '#6a7076', 5);
  if (crown) { const cx = x + w / 2; g.beginPath(); g.rect(cx - 40, y + h - 90, 80, 90); nCel(g, '#5a6066', 4);
    g.save(); g.translate(cx, y + h - 112); g.scale(crown, crown); g.beginPath(); g.moveTo(-30, 12); for (let k = 0; k <= 6; k++) g.lineTo(-30 + k * 10, k % 2 ? -4 : -22); g.lineTo(30, 12); g.closePath(); nCel(g, '#f2c444', 3.5); g.restore(); }
}
function r3bTvFarmScene(g, t) {
  const Q = R3BTV_Q, tq = two2(t);
  if (t < Q.kings - .02) {
    // the picture-book farm everyone expects: sun, hills, a red barn; the animals pop on their words
    g.fillStyle = '#8ccff0'; g.fillRect(0, 0, 960, 720);
    g.beginPath(); g.arc(820, 90, 50, 0, TAU); nCel(g, '#f2c230', 5);
    g.beginPath(); g.moveTo(0, 300); g.quadraticCurveTo(300, 220, 560, 290); g.quadraticCurveTo(780, 240, 960, 280); g.lineTo(960, 720); g.lineTo(0, 720); g.closePath(); nCel(g, '#6cbf4a', 5);
    g.beginPath(); g.rect(80, 150, 200, 160); nCel(g, '#c8303c', 5); g.beginPath(); g.moveTo(60, 150); g.lineTo(180, 80); g.lineTo(300, 150); g.closePath(); nCel(g, '#8a2a2a', 5);
    g.beginPath(); g.rect(145, 220, 70, 90); nCel(g, '#fbf8ee', 4); g.strokeStyle = NINK; g.lineWidth = 4; g.beginPath(); g.moveTo(145, 220); g.lineTo(215, 310); g.moveTo(215, 220); g.lineTo(145, 310); g.stroke();
    for (let k = 0; k < 3; k++) { const p = popIn(tq, Q.chickens + k * .08, .25); if (p > 0) r3bTvChicken(g, 380 + k * 90, 330 + (k % 2) * 20, .9 * p, { flip: k === 1 }); }
    for (let k = 0; k < 2; k++) { const p = popIn(tq, Q.pigs + k * .1, .25); if (p > 0) r3bTvPig(g, 690 + k * 150, 350 - k * 10, .9 * p, { flip: k === 0 }); }
    return;
  }
  if (t < Q.sun - .02) {
    // the king's farms: grey sheds under a grey sky; the crown on the door, the vents puffing, more sheds
    g.fillStyle = '#b8bcc0'; g.fillRect(0, 0, 960, 720);
    const sunY = t >= Q.l83 ? lerp(130, 60, smooth(clamp((t - Q.l83) / 1.2))) : 130;
    g.save(); g.globalAlpha = t >= Q.l83 ? 1 : .35; g.beginPath(); g.arc(820, sunY, 46, 0, TAU); nCel(g, '#f2d860', 4); g.restore();
    g.fillStyle = '#7a8a5a'; g.fillRect(0, 330, 960, 390);
    const more = t >= Q.farms - .02 ? popIn(tq, Q.farms, .3) : 0;
    if (more > 0) { g.save(); g.translate(0, 300); g.scale(1, more); g.translate(0, -300); r3bTvShed(g, 60, 190, 360, 110, t, 0); r3bTvShed(g, 520, 186, 380, 114, t, 0); g.restore(); }
    r3bTvShed(g, 140, 210, 680, 150, t, popIn(tq, Q.kings, .3));
    if (t >= Q.factory - .02) for (let k = 0; k < 4; k++) { const x = 220 + k * 170; g.beginPath(); g.rect(x - 12, 132, 24, 34); nCel(g, '#5a6066', 3.5);
      for (let p = 0; p < 3; p++) { const u = ((t - Q.factory) * .8 + p / 3 + k * .2) % 1; g.fillStyle = `rgba(110,110,116,${.8 * (1 - u)})`; g.beginPath(); g.arc(x + u * 30, 120 - u * 90, 14 + u * 16, 0, TAU); g.fill(); } }
    // on "never" the sheds have no windows: the sun slides behind the roofline haze
    if (t >= Q.never83) { g.fillStyle = `rgba(150,150,156,${.6 * smooth(clamp((t - Q.never83) / .6))})`; g.fillRect(0, 0, 960, 200); }
    return;
  }
  if (t < Q.l85 - .02) {
    // inside: no sun, one bare bulb; cages of hens stacked on the left, pigs in narrow stalls on the right
    g.fillStyle = '#2a2a30'; g.fillRect(0, 0, 960, 720);
    const sw = Math.sin((t - Q.sun) * 2.6) * .25 * Math.exp(-(t - Q.sun) * .4);
    const flick = t >= Q.harm && t < Q.harm + .4 && Math.floor(tq * 12) % 2 ? .5 : 1;
    g.save(); g.translate(480, 0); g.rotate(sw);
    g.strokeStyle = '#111'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 70); g.stroke();
    const rg = g.createRadialGradient(0, 84, 4, 0, 84, 500); rg.addColorStop(0, `rgba(255,236,170,${.55 * flick})`); rg.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = rg; g.fillRect(-600, 0, 1200, 720);
    g.beginPath(); g.arc(0, 84, 16, 0, TAU); nCel(g, '#fff3b0', 3.5);
    g.restore();
    const rattle = t >= Q.harm ? Math.sin((t - Q.harm) * 60) * 3 * Math.exp(-(t - Q.harm) * 4) : 0;
    // hens: three tiers of small wire cages, a head poking out of each
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = 40 + c * 92 + rattle, y = 150 + r * 92;
      g.fillStyle = '#4a4a52'; g.fillRect(x, y, 86, 84);
      r3bTvChicken(g, x + 20, y + 62, .62, { headOnly: true, flip: (r + c) % 2 === 1 });
      g.strokeStyle = '#a8acb0'; g.lineWidth = 3; for (let k = 0; k <= 5; k++) { g.beginPath(); g.moveTo(x + k * 17, y); g.lineTo(x + k * 17, y + 84); g.stroke(); } g.strokeRect(x, y, 86, 84);
    }
    // pigs: side by side in narrow stalls, the bars in front
    for (let k = 0; k < 3; k++) {
      const x = 560 + k * 130;
      r3bTvPig(g, x + 30, 330, .75, {});
      g.strokeStyle = '#a8acb0'; g.lineWidth = 7; for (let b = 0; b < 4; b++) { g.beginPath(); g.moveTo(x - 30 + b * 40 + rattle, 240); g.lineTo(x - 30 + b * 40 + rattle, 420); g.stroke(); }
      g.beginPath(); g.moveTo(x - 40, 250 + rattle); g.lineTo(x + 100, 250 + rattle); g.stroke();
    }
    return;
  }
  if (t < Q.l86 - .02) {
    // the end of the shed: crates on a conveyor into a dark doorway; red lamps on two words, the shutter on the last
    g.fillStyle = '#26262c'; g.fillRect(0, 0, 960, 720);
    g.beginPath(); g.rect(560, 120, 260, 290); nCel(g, '#0a0a0e', 6);
    const shut = t >= Q.cruel - .02 ? clamp((tq - Q.cruel) / .12) : 0;
    g.beginPath(); g.rect(560, 120, 260, 290 * shut); nCel(g, '#6a7076', 5);
    if (shut >= 1) { g.strokeStyle = 'rgba(30,30,40,.5)'; g.lineWidth = 3; for (let y = 140; y < 410; y += 22) { g.beginPath(); g.moveTo(564, y); g.lineTo(816, y); g.stroke(); } }
    for (const [cue, lx] of [[Q.bloody, 610], [Q.barbaric, 770]]) {
      const on = t >= cue - .02, f = on && Math.floor(tq * 6) % 2;
      if (on) { const rg = g.createRadialGradient(lx, 90, 4, lx, 90, 260); rg.addColorStop(0, f ? 'rgba(255,40,40,.5)' : 'rgba(255,40,40,.32)'); rg.addColorStop(1, 'rgba(255,40,40,0)'); g.fillStyle = rg; g.fillRect(0, 0, 960, 720); }
      g.beginPath(); g.arc(lx, 90, 20, Math.PI, 0); g.lineTo(lx + 20, 96); g.lineTo(lx - 20, 96); g.closePath(); nCel(g, on ? '#ff3a3a' : '#5a1a1a', 4);
    }
    // the conveyor: rollers turning, crates moving right into the dark
    g.beginPath(); g.rect(0, 380, 690, 30); nCel(g, '#4a4e54', 4);
    const run = shut >= 1 ? Q.cruel + .12 - Q.l85 : t - Q.l85;
    for (let k = -1; k < 6; k++) {
      const x = ((k * 150 + run * 90) % 900) - 120; if (x > 560) continue;
      g.beginPath(); g.rect(x, 300, 110, 80); nCel(g, '#8a7a5a', 4);
      g.strokeStyle = '#5a4a30'; g.lineWidth = 3; for (let b = 1; b < 5; b++) { g.beginPath(); g.moveTo(x + b * 22, 300); g.lineTo(x + b * 22, 380); g.stroke(); }
      r3bTvChicken(g, x + 40, 320, .45, { headOnly: true });
    }
    for (let r = 0; r < 12; r++) { g.beginPath(); g.arc(20 + r * 56, 410, 9, 0, TAU); nCel(g, '#8a8f96', 2.5); }
    return;
  }
  // the other side of the wall: trays of meat on a belt, a pipe above; a yellow drip, then a brown one, into the gutter
  g.fillStyle = '#d8dcd8'; g.fillRect(0, 0, 960, 720);
  g.strokeStyle = 'rgba(80,90,90,.25)'; g.lineWidth = 2; for (let y = 0; y < 720; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(960, y); g.stroke(); }
  g.beginPath(); g.rect(0, 330, 960, 40); nCel(g, '#4a4e54', 4);
  const run = t - Q.l86;
  for (let k = -1; k < 7; k++) {
    const x = ((k * 160 + run * 70) % 1120) - 160;
    g.beginPath(); g.roundRect(x, 290, 120, 40, 6); nCel(g, '#f6f6f2', 3.5);
    g.beginPath(); g.ellipse(x + 60, 304, 46, 14, 0, 0, TAU); nCel(g, '#e88a96', 3);
  }
  // the gutter along the belt, the pipe over it
  g.beginPath(); g.rect(0, 378, 960, 24); nCel(g, '#8a9096', 4);
  g.beginPath(); g.rect(0, 70, 960, 40); nCel(g, '#a8b0b4', 4.5);
  g.beginPath(); g.rect(442, 110, 36, 40); nCel(g, '#a8b0b4', 4);
  for (const [cue, col] of [[Q.urine, '#e8d040'], [Q.stool, '#7a4a20']]) {
    if (t < cue - .02) continue;
    const u = clamp((tq - cue) / .3);
    g.beginPath(); g.ellipse(460, lerp(158, 372, u * u), 10, 14, 0, 0, TAU); nCel(g, col, 3);
    if (u >= 1) { g.beginPath(); g.ellipse(460, 386, 40, 8, 0, 0, TAU); g.fillStyle = col; g.fill(); }
  }
  if (t >= Q.meat - .02) { const p = popIn(tq, Q.meat, .25); g.save(); g.translate(250, 220); g.scale(p, p); g.beginPath(); g.roundRect(-80, -40, 160, 60, 8); nCel(g, '#f6f6f2', 4); g.beginPath(); g.ellipse(0, -16, 62, 22, 0, 0, TAU); nCel(g, '#e88a96', 3.5); g.restore(); }
}
function r3bTvStanza9(g, t) {
  if (t < 212.0) { r3bTvFull(g, t, r3bTvFarmScene); g.fillStyle = 'rgba(255,190,110,.06)'; g.fillRect(0, 0, 960, 720); }
  else r3bTvDesk(g, t, null, { grave: 1, look: .3, boxDraw: (gg, w, h) => { gg.save(); gg.scale(w / 960, h / 720); r3bTvShedBox(gg, t); gg.restore(); } });
}
// the shed, small in the box, while the anchor holds a grave face
function r3bTvShedBox(g, t) { g.fillStyle = '#b8bcc0'; g.fillRect(0, 0, 960, 720); g.fillStyle = '#7a8a5a'; g.fillRect(0, 420, 960, 300); r3bTvShed(g, 120, 290, 720, 190, t, 1.4); }
