// tv-B stanza 8 (165.083-198.125): the workers, as news film from one place, the burger counter at night.
// Same cel manner as round 2's inserts (news.js: flat colour, one ink line, on twos, the film a little warm).
// The counter is one long world (x 0-1800); the news camera cuts between framings of it, moving forward:
// counter, window and clock, the girls up close, the manager, the restroom, the grill, the time clock.
// Every face stays above program y 420 (the wire copy starts at 430). Pure: a function of song time t only.
const R3BTV_WK = {};
function r3bTvInitWorkers() {
  // the back wall: mustard paint, brown supergraphic stripes, the counter in teal with a chrome lip
  const c = mkCanvas(1800, 720), g = c.getContext('2d');
  g.fillStyle = '#e2b04a'; g.fillRect(0, 0, 1800, 720);
  g.save(); g.beginPath(); g.rect(0, 0, 1800, 300); g.clip();
  for (const [col, o] of [['#c8642a', 0], ['#8a4a1e', 30], ['#5a2e12', 60]]) { g.fillStyle = col; g.beginPath(); g.moveTo(0, 230 + o); g.lineTo(1800, 120 + o); g.lineTo(1800, 142 + o); g.lineTo(0, 252 + o); g.closePath(); g.fill(); }
  g.restore();
  // the menu board: three pictogram panels, no words
  g.fillStyle = '#4a2a14'; g.beginPath(); g.roundRect(540, 34, 330, 116, 12); g.fill(); g.strokeStyle = NINK; g.lineWidth = 5; g.stroke();
  for (let k = 0; k < 3; k++) {
    const x = 556 + k * 106; g.fillStyle = '#fff6dc'; g.beginPath(); g.roundRect(x, 48, 92, 88, 8); g.fill(); g.lineWidth = 3.5; g.stroke();
    g.save(); g.translate(x + 46, 94);
    if (k === 0) drawBurger(g, 0, 4, .78, 0);
    if (k === 1) { g.beginPath(); g.moveTo(-20, -4); g.lineTo(20, -4); g.lineTo(14, 32); g.lineTo(-14, 32); g.closePath(); nCel(g, '#ff5d8f', 3); for (let i = -2; i <= 2; i++) { g.beginPath(); g.rect(i * 7 - 2.5, -28 + Math.abs(i) * 4, 5.5, 25); nCel(g, '#e8b630', 2.5); } }
    if (k === 2) { g.beginPath(); g.moveTo(-17, -24); g.lineTo(17, -24); g.lineTo(12, 32); g.lineTo(-12, 32); g.closePath(); nCel(g, '#1fa6a0', 3); g.beginPath(); g.moveTo(4, -24); g.lineTo(12, -42); g.strokeStyle = NINK; g.lineWidth = 5; g.stroke(); }
    g.restore();
  }
  // the hood over the grill
  g.beginPath(); g.moveTo(1150, 30); g.lineTo(1420, 30); g.lineTo(1450, 120); g.lineTo(1120, 120); g.closePath(); nCel(g, '#b8c0c4', 5);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(1160, 40, 250, 8);
  // the card rack beside the time clock
  g.beginPath(); g.roundRect(1060, 70, 70, 170, 6); nCel(g, '#8a8f96', 4);
  for (let k = 0; k < 6; k++) { g.beginPath(); g.rect(1070, 82 + k * 26, 50, 18); nCel(g, '#f6eedc', 2.5); }
  // the restroom wall: pale tiles, and the floor in front of it
  g.fillStyle = '#d8e4e0'; g.fillRect(1460, 0, 340, 720);
  g.strokeStyle = 'rgba(80,110,110,.35)'; g.lineWidth = 2; for (let y = 0; y < 720; y += 30) { g.beginPath(); g.moveTo(1460, y); g.lineTo(1800, y); g.stroke(); } for (let x = 1460; x < 1800; x += 30) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 720); g.stroke(); }
  g.fillStyle = '#9a9e8a'; g.fillRect(1460, 380, 340, 340); g.fillStyle = 'rgba(0,0,0,.15)'; for (let x = 1460; x < 1800; x += 60) for (let y = 380; y < 720; y += 60) if (((x + y) / 60) % 2 < 1) g.fillRect(x, y, 60, 60);
  g.strokeStyle = NINK; g.lineWidth = 5; g.beginPath(); g.moveTo(1460, 0); g.lineTo(1460, 720); g.stroke();
  R3BTV_WK.wall = c;
  // the counter (stops at the restroom wall), its own layer: the girls stand behind it
  const c2 = mkCanvas(1800, 720), g2 = c2.getContext('2d');
  r3bTvCounter(g2);
  R3BTV_WK.counter = c2;
}
function r3bTvCounter(g) {
  g.fillStyle = '#1fa6a0'; g.fillRect(0, 290, 1460, 430); g.strokeStyle = NINK; g.lineWidth = 5; g.strokeRect(-5, 290, 1465, 435);
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 4; for (let x = 20; x < 1460; x += 46) { g.beginPath(); g.moveTo(x, 300); g.lineTo(x, 720); g.stroke(); }
  g.fillStyle = '#d7dde0'; g.fillRect(0, 276, 1460, 18); g.strokeRect(-5, 276, 1465, 18);
}
// the camera inside the news film: a framing is the world point at program (480, 215) and a zoom
function r3bTvWkShot(t) {
  const Q = R3BTV_Q;
  const S = [
    [Q.l66 - .1, 700, 205, 1.2], [Q.l67 - .04, 300, 170, 1.25], [Q.l68 - .04, 700, 205, 1.2], [Q.l69 - .04, 700, 195, 1.75],
    [Q.l70 - .04, 820, 205, 1.1], [Q.l71 - .04, 1590, 215, 1.2], [Q.l72 - .04, 1290, 200, 1.35], [Q.l73 - .04, 1050, 170, 1.55],
    [Q.l74 - .04, 420, 120, 1.8], [Q.l75 - .04, 700, 205, 1.2], [Q.l76 - .04, 820, 205, 1.1], [Q.l77 - .04, 420, 150, 1.35],
    [Q.l78 - .04, 1290, 200, 1.2], [Q.l79 - .04, 760, 200, 1.25], [Q.l80 - .04, 560, 200, 1.6],
  ];
  let i = 0; while (i + 1 < S.length && S[i + 1][0] <= t) i++;
  const [t0, x, y, z] = S[i];
  const cr = 1 + .02 * clamp((t - t0) / 3);   // a slow creep in on every framing
  return { i, x, y, z: z * cr };
}
const R3BTV_WORKERS = [
  { skin: '#f0c8a0', hair: '#7a4520', style: 'pony' },
  { skin: '#a8724a', hair: '#1e1410', style: 'puff' },
  { skin: '#f4d0b0', hair: '#c88a3a', style: 'pony' },
];
// a girl behind the counter: head centre (x, y). o: {smile 0..1, arms, hatOff 0..1, bulb, badge, sweat, bubble, braces, shy}
function r3bTvWorker(g, x, y, k, t, o = {}) {
  const P = R3BTV_WORKERS[k];
  g.save(); g.translate(x, y);
  // arms first (behind the body when they hang)
  const arm = (sd, hx, hy, elbow) => { tube(g, [[sd * 34, 66], elbow || [sd * 50, 110], [hx, hy]], 18, '#f6eedc'); mitten(g, hx, hy, 15, 0, P.skin); };
  // body: a short-sleeved shirt, an orange apron
  g.beginPath(); g.moveTo(-48, 160); g.quadraticCurveTo(-50, 70, -26, 52); g.lineTo(26, 52); g.quadraticCurveTo(50, 70, 48, 160); g.closePath(); nCel(g, '#f6eedc', 4.5);
  g.beginPath(); g.moveTo(-30, 160); g.lineTo(-24, 84); g.lineTo(24, 84); g.lineTo(30, 160); g.closePath(); nCel(g, '#e8862a', 4);
  if (o.badge) { g.beginPath(); g.arc(14, 100, 9 * o.badge, 0, TAU); nCel(g, '#c8303c', 3); }
  g.beginPath(); g.rect(-10, 36, 20, 20); nCel(g, P.skin, 3.5);
  const a = o.arms || 'down';
  if (a === 'down') { arm(-1, -46, 150); arm(1, 46, 150); }
  else if (a === 'up') { arm(-1, -60, -10, [-56, 50]); arm(1, 60, -10, [56, 50]); }
  else if (a === 'link') { arm(-1, -86, 70, [-60, 84]); arm(1, 86, 70, [60, 84]); }
  else if (a === 'mouth') { arm(-1, -8, 26, [-40, 90]); arm(1, 8, 30, [40, 92]); }
  else if (a === 'reach') { arm(-1, -46, 150); arm(1, 70, -60, [60, 30]); }
  else if (a === 'env') { arm(-1, -46, 80, [-56, 100]); arm(1, 46, 80, [56, 100]); }
  else if (a === 'flip') { arm(-1, -46, 150); arm(1, 84, 90 - (o.flipU || 0) * 30, [66, 96]); }
  // head
  r3bTvHead(g, -44, -66, 44, 44);
  if (P.style === 'puff') { g.beginPath(); g.arc(0, -10, 44, 0, TAU); nCel(g, P.hair, 4); }
  if (P.style === 'pony') { g.beginPath(); g.ellipse(36, 0, 12, 26, -.5, 0, TAU); nCel(g, P.hair, 3.5); }
  g.beginPath(); g.ellipse(0, 0, 34, 38, 0, 0, TAU); nCel(g, P.skin, 4.5);
  g.beginPath(); g.moveTo(-34, -4); g.quadraticCurveTo(-34, -42, 0, -42); g.quadraticCurveTo(34, -42, 34, -4); g.quadraticCurveTo(10, -26, -34, -4); g.closePath(); nCel(g, P.hair, 3.5);
  // eyes
  for (const sd of [-1, 1]) { g.fillStyle = NINK; g.beginPath(); g.arc(sd * 12, -2, 4.5, 0, TAU); g.fill(); }
  for (const sd of [-1, 1]) { g.fillStyle = 'rgba(240,110,120,.45)'; g.beginPath(); g.arc(sd * 22, 12, 7, 0, TAU); g.fill(); }
  // mouth: a polite smile that can be trained wide (teeth, braces)
  const sm = o.smile || 0;
  if (sm > .05) {
    g.beginPath(); g.moveTo(-10 - 10 * sm, 12); g.quadraticCurveTo(0, 24 + 12 * sm, 10 + 10 * sm, 12); g.closePath(); nCel(g, '#ffffff', 3);
    if (o.braces) { g.strokeStyle = '#8a929a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-14 * (.5 + sm * .5), 15); g.lineTo(14 * (.5 + sm * .5), 15); g.stroke(); }
  } else if (o.shy) { g.beginPath(); g.arc(0, 18, 7, 1.2 * Math.PI, 1.8 * Math.PI); g.strokeStyle = NINK; g.lineWidth = 3.5; g.stroke(); }
  else { g.beginPath(); g.arc(0, 10, 9, .2 * Math.PI, .8 * Math.PI); g.strokeStyle = NINK; g.lineWidth = 3.5; g.stroke(); }
  if (o.bubble) { g.beginPath(); g.arc(0, 20 + 14 * o.bubble, 4 + 30 * o.bubble, 0, TAU); g.fillStyle = 'rgba(255,140,190,.9)'; g.fill(); g.strokeStyle = NINK; g.lineWidth = 3; g.stroke(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(-8 * o.bubble, 10 + 6 * o.bubble, 6 * o.bubble, 0, TAU); g.fill(); }
  if (o.sweat) for (const sd of [-1, 1]) { const u = ((t * 1.6 + (sd > 0 ? .5 : 0)) % 1); g.beginPath(); g.ellipse(sd * 40, -12 + u * 30, 5, 8, 0, 0, TAU); nCel(g, '#9ad0f0', 2.5); }
  // the paper hat (a folded overseas cap), flies off when she's fired
  const ho = o.hatOff || 0;
  g.save(); g.translate(ho * 160, -40 - Math.sin(ho * Math.PI) * 90); g.rotate(ho * 3);
  g.beginPath(); g.moveTo(-38, 0); g.lineTo(-30, -24); g.lineTo(30, -24); g.lineTo(38, 0); g.closePath(); nCel(g, '#fbf8ee', 3.5);
  g.fillStyle = '#c8303c'; g.fillRect(-30, -12, 60, 6);
  g.restore();
  if (o.bulb) {
    const b = o.bulb; g.save(); g.translate(0, -100); g.scale(b, b);
    g.fillStyle = 'rgba(255,240,150,.4)'; g.beginPath(); g.arc(0, 0, 40, 0, TAU); g.fill();
    g.beginPath(); g.arc(0, -4, 20, 0, TAU); nCel(g, '#fff3a0', 3.5); g.beginPath(); g.rect(-9, 14, 18, 12); nCel(g, '#a8b0b8', 3);
    g.strokeStyle = '#f2c230'; g.lineWidth = 4; for (let r = 0; r < 6; r++) { const an = -Math.PI / 2 + (r - 2.5) * .5; g.beginPath(); g.moveTo(Math.cos(an) * 28, -4 + Math.sin(an) * 28); g.lineTo(Math.cos(an) * 40, -4 + Math.sin(an) * 40); g.stroke(); }
    g.restore();
  }
  g.restore();
}
function r3bTvManager(g, x, y, t, o = {}) {
  // a generic shift manager: short-sleeved white shirt, brown tie, a clipboard; a moustache
  g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(-56, 170); g.quadraticCurveTo(-58, 70, -30, 54); g.lineTo(30, 54); g.quadraticCurveTo(58, 70, 56, 170); g.closePath(); nCel(g, '#f4f6f8', 4.5);
  g.beginPath(); g.moveTo(-8, 56); g.lineTo(8, 56); g.lineTo(12, 140); g.lineTo(0, 152); g.lineTo(-12, 140); g.closePath(); nCel(g, '#6b3f22', 3.5);
  const p = o.point || 0, ear = o.ear || 0;
  // left arm holds the clipboard, the right points (or holds the pointer, or cups his ear)
  tube(g, [[-40, 70], [-62, 120], [-30, 140]], 20, '#f4f6f8'); g.beginPath(); g.roundRect(-60, 100, 56, 72, 5); nCel(g, '#b07a3a', 3.5); g.beginPath(); g.rect(-52, 110, 40, 54); nCel(g, '#fbf8ee', 2.5); mitten(g, -30, 140, 14, 0, '#f0c8a0');
  if (ear > 0) { tube(g, [[40, 70], [70, 40], [46, -4]], 20, '#f4f6f8'); mitten(g, 46, -4, 16, -.6, '#f0c8a0'); }
  else { const hx = lerp(56, 130, p), hy = lerp(150, 40, p); tube(g, [[40, 70], [lerp(66, 90, p), lerp(120, 66, p)], [hx, hy]], 20, '#f4f6f8'); mitten(g, hx, hy, 14, 0, '#f0c8a0');
    if (o.pointer) { g.strokeStyle = '#6b3f22'; g.lineWidth = 6; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + 110, hy - 70); g.stroke(); } }
  g.beginPath(); g.rect(-11, 34, 22, 22); nCel(g, '#f0c8a0', 3.5);
  r3bTvHead(g, -48, -64, 48 + ear * 20, 44);
  g.beginPath(); g.ellipse(0, 0, 38, 42, 0, 0, TAU); nCel(g, '#f0c8a0', 4.5);
  g.beginPath(); g.moveTo(-38, -6); g.quadraticCurveTo(-36, -50, 0, -46); g.quadraticCurveTo(36, -50, 38, -6); g.quadraticCurveTo(30, -30, 0, -30); g.quadraticCurveTo(-30, -30, -38, -6); g.closePath(); nCel(g, '#3a2a1a', 3.5);
  for (const sd of [-1, 1]) { g.fillStyle = NINK; g.beginPath(); g.arc(sd * 13, -4, 4.5, 0, TAU); g.fill(); g.strokeStyle = NINK; g.lineWidth = 4; g.beginPath(); g.moveTo(sd * 22, -18); g.lineTo(sd * 5, -14 + (o.stern ? 4 : 0)); g.stroke(); }
  g.beginPath(); g.moveTo(-18, 16); g.quadraticCurveTo(0, 6, 18, 16); g.quadraticCurveTo(0, 22, -18, 16); g.fillStyle = '#3a2a1a'; g.fill();
  g.beginPath(); g.arc(0, 28, 8, o.stern ? 1.2 * Math.PI : .2 * Math.PI, o.stern ? 1.8 * Math.PI : .8 * Math.PI); g.strokeStyle = NINK; g.lineWidth = 3.5; g.stroke();
  // the big ear he cups when he hears what they say
  if (ear > 0) { g.beginPath(); g.ellipse(40, 2, 10 + 16 * ear, 16 + 22 * ear, .2, 0, TAU); nCel(g, '#f0c8a0', 3.5); }
  g.restore();
}
function r3bTvWallClock(g, t, x, y, o = {}) {
  const st = o.stretch || 1;
  g.save(); g.translate(x, y); g.scale(1 / Math.sqrt(st), st);
  g.beginPath(); g.arc(0, 0, 54, 0, TAU); nCel(g, '#fbf8ee', 6 / st);
  g.strokeStyle = NINK; g.lineWidth = 4;
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 42, Math.sin(a) * 42); g.lineTo(Math.cos(a) * 50, Math.sin(a) * 50); g.stroke(); }
  const spin = o.spin || 0, mh = -Math.PI / 2 + 1.2 + spin * TAU, hh = -Math.PI / 2 + 2.9 + spin * TAU / 12;
  g.lineCap = 'round'; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(hh) * 26, Math.sin(hh) * 26); g.stroke();
  g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(mh) * 40, Math.sin(mh) * 40); g.stroke();
  g.beginPath(); g.arc(0, 0, 6, 0, TAU); g.fillStyle = '#c8303c'; g.fill();
  g.restore();
}
function r3bTvWorkersScene(g, t) {
  const Q = R3BTV_Q, tq = two2(t), sh = r3bTvWkShot(t);
  g.fillStyle = '#000'; g.fillRect(0, 0, 960, 720);
  g.save(); g.translate(480, 215); g.scale(sh.z, sh.z); g.translate(-sh.x, -sh.y);
  g.drawImage(R3BTV_WK.wall, 0, 0);
  // the window: dusk going to night on its cue; a moon and stars; tinsel for the holidays
  const nightU = smooth(clamp((t - Q.night) / .4));
  g.save(); g.beginPath(); g.rect(40, 30, 280, 220); g.clip();
  const sky = g.createLinearGradient(0, 30, 0, 250); sky.addColorStop(0, rgb(mix([240, 140, 80], [14, 20, 52], nightU))); sky.addColorStop(1, rgb(mix([250, 200, 120], [40, 50, 100], nightU))); g.fillStyle = sky; g.fillRect(40, 30, 280, 220);
  if (nightU > 0) { g.globalAlpha = nightU; for (let k = 0; k < 14; k++) { g.fillStyle = '#fff8d0'; g.beginPath(); g.arc(60 + rnd(k, 1) * 240, 44 + rnd(k, 2) * 150, 2 + rnd(k, 3) * 2, 0, TAU); g.fill(); }
    g.beginPath(); g.arc(250, 90, 30, 0, TAU); g.fillStyle = '#fff3c0'; g.fill(); g.beginPath(); g.arc(238, 82, 26, 0, TAU); g.fillStyle = rgb(mix([240, 140, 80], [14, 20, 52], nightU)); g.fill(); g.globalAlpha = 1; }
  g.fillStyle = '#2a2420'; g.fillRect(40, 190, 280, 60);   // the dark car park
  g.restore();
  g.strokeStyle = NINK; g.lineWidth = 8; g.strokeRect(40, 30, 280, 220); g.lineWidth = 5; g.beginPath(); g.moveTo(180, 30); g.lineTo(180, 250); g.stroke();
  if (t >= Q.holidays - .02) {
    const u = popIn(tq, Q.holidays, .3);
    g.save(); g.translate(0, (1 - u) * -40);
    g.strokeStyle = '#2aa060'; g.lineWidth = 10; g.beginPath(); g.moveTo(30, 40); g.quadraticCurveTo(180, 110, 330, 40); g.stroke();
    for (let k = 0; k < 7; k++) { const x = 60 + k * 42, y = 40 + Math.sin(k / 6 * Math.PI) * 52; g.beginPath(); g.arc(x, y + 10, 9, 0, TAU); nCel(g, ['#c8303c', '#f2c230', '#3a8ad9'][k % 3], 3); }
    g.restore();
  }
  // the wall clock: the hands run round on the shift cues; the clock stretches when the shifts are long
  let spin = 0;
  if (t >= Q.shift) spin += clamp((t - Q.shift) / .6) * 2;
  if (t >= Q.here) spin += clamp((t - Q.here) / (Q.l75 - Q.here)) * 6;
  if (t >= Q.shifts) spin += clamp((t - Q.shifts) / .9) * 3;
  const stretch = t >= Q.long - .02 ? 1 + .9 * easeOutBack(clamp((tq - Q.long) / .3), 2.5) : 1;
  r3bTvWallClock(g, t, 420, 100, { spin, stretch });
  // the time clock: grey box, a slot; a card goes in on its cue and the box jumps
  const chunk = t >= Q.parttime ? Math.exp(-(t - Q.parttime) * 10) * Math.sin((t - Q.parttime) * 70) * 6 : 0;
  g.save(); g.translate(990, 160 + chunk);
  g.beginPath(); g.roundRect(-50, -70, 100, 140, 10); nCel(g, '#8f969e', 5);
  g.beginPath(); g.arc(0, -26, 28, 0, TAU); nCel(g, '#fbf8ee', 3.5); g.strokeStyle = NINK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -26); g.lineTo(14, -38); g.moveTo(0, -26); g.lineTo(0, -46); g.stroke();
  g.fillStyle = '#1b1530'; g.fillRect(-26, 30, 52, 8);
  g.restore();
  if (t >= Q.l73) {
    const inU = smooth(clamp((t - Q.l73) / (Q.parttime - Q.l73))), outU = t >= Q.parttime + .3 ? smooth(clamp((t - Q.parttime - .3) / .3)) : 0;
    const cy = 260 - inU * 64 + outU * 64;
    g.save(); g.beginPath(); g.rect(900, 194 + chunk, 200, 200); g.clip();
    g.beginPath(); g.rect(966, cy, 48, 110); nCel(g, '#f6eedc', 3);
    if (t >= Q.parttime) { g.fillStyle = NINK; g.beginPath(); g.arc(990, cy + 20, 6, 0, TAU); g.fill(); }
    g.restore();
    if (inU < 1 || outU > 0) mitten(g, 990, cy + 100, 18, 0, '#f0c8a0');
  }
  // the ladder by the menu board (promotions): the girl reaches for its top; on the cue the rungs drop away
  const lx = 930;
  g.strokeStyle = '#8a5a2a'; g.lineWidth = 9; g.beginPath(); g.moveTo(lx - 30, 290); g.lineTo(lx - 22, 20); g.moveTo(lx + 30, 290); g.lineTo(lx + 22, 20); g.stroke();
  for (let k = 0; k < 6; k++) {
    let y = 260 - k * 44, x = lx, a = 0;
    if (t >= Q.never79 - .02) { const u = clamp((tq - Q.never79 - k * .04) / .5); y += u * u * 400; a = u * (k % 2 ? 1 : -1); }
    g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = '#a8763a'; g.lineWidth = 8; g.beginPath(); g.moveTo(-26, 0); g.lineTo(26, 0); g.stroke(); g.restore();
  }
  if (t >= Q.promotions - .02 && sh.i === 13) { g.save(); g.translate(lx, 30); star(g, 0, 0, 22, 10, 5); nCel(g, '#f2c230', 3.5); g.restore(); }
  // the grill: a flat top behind the counter, three patties sizzling
  g.beginPath(); g.rect(1150, 250, 270, 30); nCel(g, '#4a4e54', 4);
  for (let k = 0; k < 3; k++) { if (k === 1 && t >= Q.grill - .2 && t < Q.grill + .45) continue; g.beginPath(); g.ellipse(1190 + k * 90, 248, 30, 9, 0, 0, TAU); nCel(g, '#6b3a1e', 3); }
  const steam = (x0, a) => { for (let k = 0; k < 3; k++) { const u = ((t * .9 + k / 3) % 1); g.strokeStyle = `rgba(255,255,255,${.6 * (1 - u) * a})`; g.lineWidth = 6; g.beginPath(); g.moveTo(x0 + k * 40, 240 - u * 120); g.quadraticCurveTo(x0 + k * 40 + 14, 210 - u * 120, x0 + k * 40, 190 - u * 120); g.stroke(); } };
  steam(1190, 1);
  if (t >= Q.smelly - .02 && t < Q.l79) for (let k = 0; k < 4; k++) { const u = ((t * .8 + k / 4) % 1); g.strokeStyle = '#6aa83a'; g.lineWidth = 5; g.beginPath(); for (let s = 0; s <= 8; s++) { const yy = 240 - s * 14 - u * 60, xx = 1180 + k * 60 + Math.sin(s * 1.3 + t * 6) * 10; s ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  if (t >= Q.grill - .2 && t < Q.grill + .45) { const u = clamp((tq - (Q.grill - .2)) / .65); g.save(); g.translate(1280, 248 - Math.sin(u * Math.PI) * 130); g.scale(1, Math.cos(u * TAU)); g.beginPath(); g.ellipse(0, 0, 30, 9, 0, 0, TAU); nCel(g, '#6b3a1e', 3); g.restore(); }
  // the thermometer on the hood: pops on, the red runs up and out of the top
  if (t >= Q.hot - .02 && t < Q.l79) {
    const p = popIn(tq, Q.hot, .25), r = clamp((tq - Q.hot) / .4);
    g.save(); g.translate(1430, 150); g.scale(p, p);
    g.beginPath(); g.roundRect(-14, -110, 28, 140, 14); nCel(g, '#fbf8ee', 4); g.beginPath(); g.arc(0, 40, 24, 0, TAU); nCel(g, '#c8303c', 4);
    g.fillStyle = '#c8303c'; g.fillRect(-6, 30 - r * 140, 12, r * 140);
    if (r >= 1) sparkle(g, 0, -116, 22, 1);
    g.restore();
  }
  // the restroom door: swings open on the cue, a plain white toilet inside, a mop and bucket
  const open = t >= Q.clean - .02 ? smooth(clamp((tq - Q.clean) / .3)) : 0;
  g.fillStyle = '#2a3238'; g.fillRect(1500, 80, 150, 300);
  if (open > 0) { g.beginPath(); g.roundRect(1530, 260, 70, 40, 8); nCel(g, '#fbfbf6', 4); g.beginPath(); g.ellipse(1565, 300, 34, 14, 0, 0, TAU); nCel(g, '#fbfbf6', 4); g.beginPath(); g.moveTo(1545, 306); g.lineTo(1550, 370); g.lineTo(1580, 370); g.lineTo(1585, 306); g.closePath(); nCel(g, '#fbfbf6', 4); }
  g.save(); g.translate(1500, 80); g.scale(1 - open * .85, 1); g.beginPath(); g.rect(0, 0, 150, 300); nCel(g, '#6b8a9a', 5); g.beginPath(); g.arc(128, 160, 7, 0, TAU); nCel(g, '#d8dce4', 2.5); g.restore();
  g.strokeStyle = NINK; g.lineWidth = 5; g.strokeRect(1500, 80, 150, 300);
  g.restore();
  // ---- the people, in the same world transform ----
  g.save(); g.translate(480, 215); g.scale(sh.z, sh.z); g.translate(-sh.x, -sh.y);
  const i = sh.i;
  const trained = t >= Q.smile - .02 ? 1 : 0, sm = (k) => (trained ? lerp(.55, 1, easeOutBack(clamp((tq - Q.smile - k * .04) / .25), 2)) : .35);
  const hap = (k) => t >= Q.happy && t < Q.slaves ? Math.abs(Math.sin((t - Q.happy) * 9 + k)) * -8 : 0;
  const strings = t >= Q.slaves - .02 && t < Q.l67;
  const pops = (k) => popIn(tq, Q.l66 + k * .08, .25);
  const linkU = t >= Q.union - .02 ? 1 : 0, bulbU = (k) => t >= Q.enlightened - .02 ? popIn(tq, Q.enlightened + k * .06, .25) : 0;
  const sway = t >= Q.ways ? Math.sin((t - Q.ways) * 6) * 10 : 0;
  if (i === 0 || i === 2 || i === 9 || i === 3) {
    [560, 700, 840].forEach((x, k) => {
      const step = i === 2 && t >= Q.women - .02 ? -14 * Math.exp(-(t - Q.women) * 3) : 0;
      const up = i === 0 ? pops(k) : 1;
      if (up <= 0) return;
      g.save(); g.translate(x, 175); g.scale(up, up); g.translate(-x, -175);
      if (strings) { const u = clamp((tq - Q.slaves) / .2); g.strokeStyle = 'rgba(30,24,40,.8)'; g.lineWidth = 2.5; for (const dx of [-60, 0, 60]) { g.beginPath(); g.moveTo(x + dx, -400); g.lineTo(x + dx, lerp(-400, dx ? 165 : 135 - 40, u)); g.stroke(); } }
      r3bTvWorker(g, x + (i === 9 ? sway : 0), 175 + hap(k) + step + (strings ? -10 : 0), k, t, {
        smile: i === 3 ? .5 : (i === 9 ? .7 : .45 + (t >= Q.happy && t < Q.l67 ? .5 : 0)), braces: k === 1,
        arms: i === 9 && linkU ? (k === 0 ? 'link' : k === 2 ? 'link' : 'link') : (strings ? 'up' : (i === 2 && t >= Q.women ? (k === 1 ? 'up' : 'down') : 'down')),
        bulb: i === 9 ? bulbU(k) : 0, badge: i === 9 && t >= Q.union ? popIn(tq, Q.union + k * .06, .2) : (t >= Q.union ? 1 : 0),
        bubble: i === 3 && k === 1 && t >= Q.less && t < Q.twenty ? clamp((t - Q.less) / (Q.twenty - Q.less)) : 0,
      });
      if (i === 3 && k === 1 && t >= Q.twenty && t < Q.twenty + .25) { g.strokeStyle = '#ff8cbe'; g.lineWidth = 5; for (let r = 0; r < 8; r++) { const a = r / 8 * TAU; g.beginPath(); g.moveTo(x + Math.cos(a) * 30, 210 + Math.sin(a) * 30); g.lineTo(x + Math.cos(a) * 54, 210 + Math.sin(a) * 54); g.stroke(); } }
      g.restore();
    });
  }
  if (i === 4 || i === 10) {
    // the girls and the manager; training smiles, then the firing
    [560, 700, 840].forEach((x, k) => {
      if (i === 10 && k === 2) {
        if (t >= Q.quickly) { const u = clamp((tq - Q.quickly) / .35); if (u < 1) { r3bTvWorker(g, x + u * 700, 175, k, t, { smile: 0, hatOff: 1 }); g.strokeStyle = NINK; g.lineWidth = 4; for (let r = 0; r < 4; r++) { g.beginPath(); g.moveTo(x + u * 700 - 60 - r * 10, 150 + r * 22); g.lineTo(x + u * 700 - 140 - r * 10, 150 + r * 22); g.stroke(); } } return; }
        const ho = t >= Q.fire ? clamp((tq - Q.fire) / .5) : 0;
        r3bTvWorker(g, x, 175, k, t, { smile: 0, shy: true, hatOff: ho, badge: 1 }); return;
      }
      const cover = i === 10 && t >= Q.say - .02;
      r3bTvWorker(g, x, 175, k, t, { smile: i === 4 ? sm(k) : 0, shy: i === 10, braces: k === 1, arms: cover ? 'mouth' : 'down', badge: i === 10 ? 1 : 0 });
      if (i === 4 && trained && t >= Q.plenty - .02 && t < Q.plenty + .5) sparkle(g, x + 16, 190, 16 * Math.sin(clamp((tq - Q.plenty - k * .05) / .4) * Math.PI) + 1, 1);
    });
    const mIn = i === 4 ? popIn(tq, Q.easy, .3) : 1;
    if (mIn > 0) {
      g.save(); g.translate(1010, 300); g.scale(mIn, mIn); g.translate(-1010, -300);
      r3bTvManager(g, 1010, 150, t, { pointer: i === 4 && t >= Q.train, point: i === 4 ? (t >= Q.train ? 1 : 0) : (t >= Q.fire && t < Q.heard ? 1 : 0), ear: i === 10 && t >= Q.heard ? easeOutBack(clamp((tq - Q.heard) / .25), 2) : 0, stern: i === 10 });
      g.restore();
      if (i === 4 && t >= Q.train) { // the flip chart he points at: a smile curve
        g.save(); g.translate(1150, 60); g.beginPath(); g.rect(-60, -30, 120, 120); nCel(g, '#fbf8ee', 4);
        g.beginPath(); g.arc(0, 0, 36, .15 * Math.PI, .85 * Math.PI); g.strokeStyle = '#c8303c'; g.lineWidth = 7; g.stroke(); g.restore();
      }
    }
  }
  if (i === 5) {
    // the restroom: the girl with a mop, swishing on the beat, soap bubbles rising
    const sw = Math.sin((t - Q.l71) * 7) * 30;
    for (const sd of [-1, 1]) { tube(g, [[1700 + sd * 18, 320], [1700 + sd * 20, 420]], 22, '#3a3a52'); g.beginPath(); g.ellipse(1700 + sd * 26, 428, 22, 10, 0, 0, TAU); nCel(g, '#1b1530', 3); }
    r3bTvWorker(g, 1700, 170, 0, t, { smile: 0, shy: true, arms: 'down' });
    g.strokeStyle = '#8a5a2a'; g.lineWidth = 9; g.beginPath(); g.moveTo(1660, 300); g.lineTo(1620 + sw, 430); g.stroke();
    g.beginPath(); g.ellipse(1620 + sw, 436, 36, 12, 0, 0, TAU); nCel(g, '#d8d0b8', 4);
    g.beginPath(); g.moveTo(1520, 380); g.lineTo(1580, 380); g.lineTo(1574, 440); g.lineTo(1526, 440); g.closePath(); nCel(g, '#c8303c', 4);
    if (t >= Q.toilets - .02) for (let k = 0; k < 8; k++) { const u = ((t - Q.toilets) * .7 + k / 8) % 1; g.beginPath(); g.arc(1560 + Math.sin(k * 2 + t * 3) * 60, 400 - u * 300, 6 + (k % 3) * 4, 0, TAU); g.strokeStyle = 'rgba(160,210,240,.9)'; g.lineWidth = 3; g.stroke(); }
  }
  if (i === 6 || i === 12) r3bTvWorker(g, 1230, 170, 0, t, { smile: 0, shy: i === 12, sweat: i === 12 && t >= Q.hot, arms: 'flip', flipU: i === 6 && t >= Q.grill - .2 && t < Q.grill + .2 ? 1 : 0 });
  if (i === 13) r3bTvWorker(g, 840, 175, 1, t, { smile: t >= Q.never79 ? 0 : .5, shy: t >= Q.never79, arms: t < Q.never79 ? 'reach' : 'down', braces: true });
  if (i === 14) {
    // the pay envelope: opened on its cue, empty, a moth flutters out
    r3bTvWorker(g, 560, 175, 0, t, { smile: t < Q.not ? .5 : 0, shy: t >= Q.not, arms: 'env' });
    const op = t >= Q.wages - .02 ? smooth(clamp((tq - Q.wages) / .25)) : 0;
    g.save(); g.translate(560, 262);
    g.beginPath(); g.rect(-50, -34, 100, 64); nCel(g, '#c89a5a', 4);
    g.beginPath(); g.moveTo(-50, -34); g.lineTo(0, -34 - 22 * op + 30 * (1 - op)); g.lineTo(50, -34); g.closePath(); nCel(g, '#b08040', 4);
    g.restore();
    if (t >= Q.not - .02) { const u = clamp((tq - Q.not) / 1.0); const mx = 560 + u * 140 + Math.sin(u * 14) * 18, my = 215 - u * 190; const fl = Math.floor(tq * 12) % 2; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(mx + sd * 12, my, 14, fl ? 6 : 12, sd * .4, 0, TAU); nCel(g, '#b8ac94', 3); } g.beginPath(); g.ellipse(mx, my, 4, 10, 0, 0, TAU); g.fillStyle = NINK; g.fill(); }
  }
  g.drawImage(R3BTV_WK.counter, 0, 0);
  if (i === 1) { /* window and clock: no one in shot */ }
  if (i === 7 || i === 8 || i === 11) { /* the time clock and the wall clock up close */ }
  g.restore();
  g.fillStyle = 'rgba(255,190,110,.06)'; g.fillRect(0, 0, 960, 720);   // news film, a little warm
}
// the policy binder, in the box while the anchor reads the first line
function r3bTvBoxPolicy(g, w, h, t) {
  g.fillStyle = '#2a5aa8'; g.fillRect(0, 0, w, h);
  const op = t >= R3BTV_Q.said - .02 ? smooth(clamp((two2(t) - R3BTV_Q.said) / .25)) : 0;
  g.save(); g.translate(w / 2, h / 2 + 10);
  g.beginPath(); g.roundRect(-80, -90, 160, 180, 8); nCel(g, '#1f2c5a', 5);
  g.beginPath(); g.rect(-80, -90, 20, 180); nCel(g, '#14204a', 4);
  // the king's crown stamped on the cover
  g.beginPath(); g.moveTo(-24, -10); for (let k = 0; k <= 6; k++) g.lineTo(-24 + k * 8, k % 2 ? -22 : -40); g.lineTo(24, -10); g.closePath(); nCel(g, '#f2c444', 3);
  if (op > 0) { g.save(); g.scale(1 - op * 1.9, 1); g.beginPath(); g.rect(-60, -90, 140, 180); nCel(g, '#1f2c5a', 4); g.restore();
    g.beginPath(); g.rect(-60, -86, 132, 172); nCel(g, '#fbf8ee', 3); g.strokeStyle = 'rgba(40,30,50,.6)'; g.lineWidth = 3; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(-46, -66 + k * 18); g.lineTo(56 - (k % 3) * 18, -66 + k * 18); g.stroke(); } }
  g.restore();
}
function r3bTvStanza8(g, t) {
  if (t < R3BTV_Q.l66 - .1) r3bTvDesk(g, t, null, { lines: [65], look: t > R3BTV_Q.said ? .5 : 0, boxDraw: (gg, w, h) => r3bTvBoxPolicy(gg, w, h, t) });
  else r3bTvWorkersScene(g, t);
}
