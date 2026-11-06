// Round 3, tv-A: the cut-away news film. Still "news film" reports (a touch warmer than the studio, the same cel
// manner as news.js: flat paint, one ink line, on twos). The wire copy covers program y 442 down, so every face
// here sits above y 430 and each one is registered with r3aTvHead() for the face test.
// Pure: a function of song time t only.
const r3aTvNW = {};
function r3aTvInitNews() {
  // the meeting hall: green panelling, a cornice
  let c = mkCanvas(960, 720), g = c.getContext('2d');
  g.fillStyle = '#3f6a52'; g.fillRect(0, 0, 960, 720);
  for (let x = 0; x < 960; x += 120) { g.strokeStyle = 'rgba(20,40,30,.5)'; g.lineWidth = 4; g.strokeRect(x + 14, 60, 92, 300); g.strokeStyle = 'rgba(200,230,200,.15)'; g.strokeRect(x + 18, 64, 84, 292); }
  g.fillStyle = '#d8c89a'; g.fillRect(0, 0, 960, 40); g.fillStyle = '#b8a878'; g.fillRect(0, 40, 960, 8);
  r3aTvNW.hall = c;
  // the grand hall: cream wall, columns
  c = mkCanvas(960, 720); g = c.getContext('2d');
  g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, 960, 720);
  for (const x of [60, 300, 660, 900]) { g.fillStyle = '#f6f0e0'; g.fillRect(x - 30, 40, 60, 680); g.strokeStyle = 'rgba(120,100,70,.5)'; g.lineWidth = 3; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(x + k * 10, 60); g.lineTo(x + k * 10, 720); g.stroke(); } g.fillStyle = '#d8ccb0'; g.fillRect(x - 40, 30, 80, 24); }
  g.fillStyle = '#c8b890'; g.fillRect(0, 0, 960, 34);
  r3aTvNW.grand = c;
}
const r3aTvSkins = ['#f0c8a0', '#a8724a', '#e0b088', '#c89070', '#f4d0b0', '#8a5a3a'];
// a person from the front. o: {skin, coat, hat, hair, arms: 'down'|'up'|'salute'|'wave'|'bundle', smile, medals, armT}
function r3aTvPerson(g, x, y, s, o = {}) {
  const NK = r3aTvNK, skin = o.skin || r3aTvSkins[0], coat = o.coat || '#6b5a8a';
  g.save(); g.translate(x, y); g.scale(s, s);
  // body
  g.beginPath(); g.moveTo(-34, 40); g.quadraticCurveTo(-40, 32, -26, 28); g.lineTo(26, 28); g.quadraticCurveTo(40, 32, 34, 40); g.lineTo(42, 170); g.lineTo(-42, 170); g.closePath(); r3aTvCel(g, coat, 4);
  if (o.medals) { for (let k = 0; k < 3; k++) { g.beginPath(); g.rect(-24 + k * 12, 60, 9, 12); r3aTvCel(g, ['#c0283a', '#2f6fc0', '#2aa060'][k], 2); g.beginPath(); g.arc(-20 + k * 12, 80, 5, 0, TAU); r3aTvCel(g, '#f2c444', 2); } g.strokeStyle = '#c0283a'; g.lineWidth = 8; g.beginPath(); g.moveTo(-30, 36); g.lineTo(30, 130); g.stroke(); for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * 34, 34, 16, 7, 0, 0, TAU); r3aTvCel(g, '#f2c444', 2.5); } }
  // arms
  const arm = (sd, pts) => { tube(g, pts.map(([a, b]) => [sd * a, b]), 14, coat); mitten(g, sd * pts[pts.length - 1][0], pts[pts.length - 1][1], 10, 0, skin); };
  const a = o.arms || 'down', at = o.armT ?? 1;
  if (a === 'up') { arm(-1, [[30, 44], [46, lerp(90, 0, at)], [44, lerp(120, -46, at)]]); arm(1, [[30, 44], [46, lerp(90, 0, at)], [44, lerp(120, -46, at)]]); }
  else if (a === 'salute') { arm(-1, [[30, 44], [40, 100], [34, 130]]); arm(1, [[30, 44], [lerp(44, 36, at), lerp(100, 10, at)], [lerp(36, 22, at), lerp(130, -30, at)]]); }
  else if (a === 'wave') { arm(-1, [[30, 44], [40, 100], [34, 130]]); const sw = Math.sin((o.waveT || 0) * 14) * 10; arm(1, [[30, 44], [56, 10], [60 + sw, -36]]); }
  else if (a === 'none') { }
  else { arm(-1, [[30, 44], [40, 100], [34, 130]]); arm(1, [[30, 44], [40, 100], [34, 130]]); }
  // head
  g.beginPath(); g.rect(-9, 10, 18, 22); r3aTvCel(g, skin, 3);
  g.beginPath(); g.ellipse(0, -12, 26, 29, 0, 0, TAU); r3aTvCel(g, skin, 3.5);
  if (o.hair) { g.beginPath(); g.moveTo(-27, -8); g.quadraticCurveTo(-30, -46, 0, -44); g.quadraticCurveTo(30, -46, 27, -8); g.quadraticCurveTo(10, -30, -27, -8); g.closePath(); r3aTvCel(g, o.hair, 3); }
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 9, -14, 3.6, 0, TAU); g.fillStyle = NK; g.fill(); }
  g.strokeStyle = NK; g.lineWidth = 3;
  if (o.smile) { g.beginPath(); g.arc(0, -2, 9, .15 * Math.PI, .85 * Math.PI); g.stroke(); }
  else { g.beginPath(); g.moveTo(-6, 4); g.lineTo(6, 4); g.stroke(); }
  if (o.moustache) { g.beginPath(); g.moveTo(-14, 0); g.quadraticCurveTo(0, -8, 14, 0); g.quadraticCurveTo(0, 4, -14, 0); g.fillStyle = '#3a2418'; g.fill(); }
  const hat = o.hat, lift = o.lift || 0;
  g.save(); g.translate(0, -lift * 26);
  if (hat === 'tophat') { g.beginPath(); g.roundRect(-34, -40, 68, 8, 4); r3aTvCel(g, '#1c1a22', 3); g.beginPath(); g.rect(-20, -80, 40, 42); r3aTvCel(g, '#1c1a22', 3); }
  else if (hat === 'peaked') { g.beginPath(); g.moveTo(-30, -30); g.quadraticCurveTo(-34, -56, 0, -58); g.quadraticCurveTo(34, -56, 30, -30); g.closePath(); r3aTvCel(g, '#4a5a2a', 3.5); g.beginPath(); g.ellipse(0, -28, 30, 7, 0, 0, Math.PI); r3aTvCel(g, '#1c1a22', 3); g.beginPath(); g.arc(0, -44, 6, 0, TAU); r3aTvCel(g, '#f2c444', 2); }
  else if (hat === 'tiara') { g.beginPath(); g.moveTo(-18, -38); for (let i = 0; i <= 4; i++) g.lineTo(-18 + i * 9, -38 - (i % 2 ? 4 : 14)); g.lineTo(18, -38); g.closePath(); r3aTvCel(g, '#f2c444', 2.5); }
  else if (hat === 'cowboy') { g.beginPath(); g.ellipse(0, -32, 44, 9, 0, 0, TAU); r3aTvCel(g, '#8a5428', 3); g.beginPath(); g.moveTo(-22, -34); g.quadraticCurveTo(-22, -66, 0, -60); g.quadraticCurveTo(22, -66, 22, -34); g.closePath(); r3aTvCel(g, '#8a5428', 3); }
  else if (hat === 'cap') { g.beginPath(); g.ellipse(0, -30, 28, 16, 0, Math.PI, TAU); r3aTvCel(g, '#6a6a5a', 3); }
  else if (hat === 'scarf') { g.beginPath(); g.moveTo(-30, -6); g.quadraticCurveTo(-34, -50, 0, -50); g.quadraticCurveTo(34, -50, 30, -6); g.lineTo(24, -10); g.quadraticCurveTo(22, -38, 0, -38); g.quadraticCurveTo(-22, -38, -24, -10); g.closePath(); r3aTvCel(g, o.scarf || '#c86a3a', 3); }
  g.restore();
  g.restore();
  const hb = o.hat === 'tophat' ? 82 : 60;
  r3aTvHead(x - 30 * s, y - (hb + (o.lift || 0) * 26) * s, x + 30 * s, y + 20 * s);
}
// someone in a crowd seen from behind: shoulders and the back of the head (and hat); arms grab up on their cue
function r3aTvBack(g, x, y, s, k, grab) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const coat = ['#5a4a6a', '#7a5232', '#3a5a6a', '#6a3a3a'][k % 4];
  if (grab > 0) { const a = (k % 2 ? 1 : -1); tube(g, [[a * 30, 20], [a * 40, -20 * grab], [a * 26, -70 * grab]], 14, coat); mitten(g, a * 26, -70 * grab - 4, 10, 0, r3aTvSkins[k % 6]); }
  g.beginPath(); g.moveTo(-50, 120); g.quadraticCurveTo(-52, 10, 0, 6); g.quadraticCurveTo(52, 10, 50, 120); g.closePath(); r3aTvCel(g, coat, 4);
  g.beginPath(); g.ellipse(0, -22, 26, 28, 0, 0, TAU); r3aTvCel(g, ['#3a2418', '#6a4a2a', '#1c1a22', '#b8b4b0'][k % 4], 3.5);
  const hat = k % 3;
  if (hat === 0) { g.beginPath(); g.roundRect(-32, -46, 64, 8, 4); r3aTvCel(g, '#1c1a22', 3); g.beginPath(); g.rect(-19, -84, 38, 40); r3aTvCel(g, '#1c1a22', 3); }
  else if (hat === 1) { g.beginPath(); g.moveTo(-16, -48); for (let i = 0; i <= 4; i++) g.lineTo(-16 + i * 8, -48 - (i % 2 ? 4 : 12)); g.lineTo(16, -48); g.closePath(); r3aTvCel(g, '#f2c444', 2.5); }
  else { g.beginPath(); g.ellipse(0, -40, 28, 14, 0, Math.PI, TAU); r3aTvCel(g, '#6a6a5a', 3); }
  g.restore();
}
function r3aTvCow(g, x, y, s, step, dir = -1) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  for (let k = 0; k < 4; k++) { const lx = -38 + k * 24, sw = (k % 2 ? 1 : -1) * Math.sin(step * Math.PI) * 6; g.beginPath(); g.rect(lx + sw - 5, 10, 10, 36); r3aTvCel(g, '#3a2418', 3); }
  g.beginPath(); g.roundRect(-56, -30, 104, 48, 22); r3aTvCel(g, '#f6f2e6', 4);
  g.fillStyle = '#3a2418'; g.beginPath(); g.ellipse(-20, -14, 14, 10, .3, 0, TAU); g.fill(); g.beginPath(); g.ellipse(18, 0, 12, 9, -.2, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(58, -30, 18, 20, .2, 0, TAU); r3aTvCel(g, '#f6f2e6', 3.5);
  g.beginPath(); g.ellipse(68, -20, 11, 9, 0, 0, TAU); r3aTvCel(g, '#e8a8a8', 3);
  g.fillStyle = r3aTvNK; g.beginPath(); g.arc(56, -36, 3, 0, TAU); g.fill();
  for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(50 + sd * 4, -46); g.lineTo(46 + sd * 10, -58); g.strokeStyle = '#e8e0cc'; g.lineWidth = 4; g.stroke(); }
  g.restore();
}
function r3aTvSky(g, top, bot, horizon) { const gr = g.createLinearGradient(0, 0, 0, horizon); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, 960, horizon + 2); }
function r3aTvSun(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); r3aTvCel(g, '#f2c230', 4); }
function r3aTvTree(g, x, y, s, fall = 0) {
  g.save(); g.translate(x, y); g.rotate(fall * Math.PI / 2); g.scale(s, s);
  g.beginPath(); g.rect(-8, -60, 16, 60); r3aTvCel(g, '#6b3f22', 3);
  g.beginPath(); g.arc(0, -86, 38, 0, TAU); r3aTvCel(g, '#3f7a34', 3.5);
  g.fillStyle = 'rgba(150,200,110,.5)'; g.beginPath(); g.arc(-12, -98, 12, 0, TAU); g.fill();
  g.restore();
}
function r3aTvCastle(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.rect(-60, -60, 120, 60); r3aTvCel(g, '#c8c0ac', 3.5);
  for (const tx of [-60, 40]) { g.beginPath(); g.rect(tx, -100, 20, 100); r3aTvCel(g, '#b8b09c', 3.5); g.beginPath(); g.moveTo(tx - 4, -100); g.lineTo(tx + 10, -124); g.lineTo(tx + 24, -100); g.closePath(); r3aTvCel(g, '#c0283a', 3); }
  for (let k = 0; k < 5; k++) { g.fillStyle = '#c8c0ac'; g.fillRect(-40 + k * 18, -72, 10, 12); }
  g.beginPath(); g.moveTo(-14, 0); g.lineTo(-14, -26); g.quadraticCurveTo(0, -40, 14, -26); g.lineTo(14, 0); g.closePath(); r3aTvCel(g, '#3a2418', 3);
  g.restore();
}

// ---------- stanza 1: the meeting ----------
function r3aTvFilmMeeting(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.drawImage(r3aTvNW.hall, 0, 0);
  // the lectern and the man; his mouth opens on every sung onset from "spoke" to the end of the greeting
  let m = 0; if (t >= C.spoke5 && t < C.l7) m = r3aTvMouth(t);
  r3aTvMan(g, 200, 250, 1.15, { mouth: m });
  r3aTvHead(200 - 44, 250 - 92, 200 + 44, 250 + 22);
  g.beginPath(); g.moveTo(120, 300); g.lineTo(280, 300); g.lineTo(262, 470); g.lineTo(138, 470); g.closePath(); r3aTvCel(g, '#7a4a26', 4.5);
  g.beginPath(); g.rect(110, 290, 180, 18); r3aTvCel(g, '#8a5a34', 4);
  if (m > .3) { g.strokeStyle = r3aTvNK; g.lineWidth = 4; for (const a of [-.4, 0, .4]) { g.beginPath(); g.moveTo(262 + Math.cos(a) * 20, 232 + Math.sin(a) * 20); g.lineTo(262 + Math.cos(a) * 44, 232 + Math.sin(a) * 44); g.stroke(); } }
  // three rows of shareholders rise behind their benches on "meetings"; hats lift and heads bow in a wave from
  // "shareholders", front row first; every face grins on "smiled"
  const rise = t < C.meet5 - 0.02 ? 0 : easeOutBack(clamp((tq - C.meet5) / 0.3), 1.6);
  for (let r = 2; r >= 0; r--) {
    const yr = 200 + r * 72, n = 5;
    for (let k = 0; k < n; k++) {
      const idx = (2 - r) * n + k, x = 400 + k * 104 + (r % 2) * 40;
      if (rise <= 0) continue;
      const tw = C.share6 + idx * 0.074, hl = t >= tw ? Math.sin(clamp((t - tw) / 1.0) * Math.PI) : 0;
      const sm = t >= C.smiled7 + idx * 0.012 ? 1 : 0;
      const y = yr + (1 - rise) * 120;
      r3aTvTopHat(g, x, y, .9, Math.min(1, hl * 1.6), hl > 0 ? Math.min(1, hl * 1.6) * .8 : 0, sm);
      r3aTvHead(x - 24, y - 26, x + 24, y + 36);
    }
    g.beginPath(); g.rect(360, yr + 34, 600, 40); r3aTvCel(g, '#6b3f22', 4);
  }
}
// ---------- stanza 2 ----------
function r3aTvFilmParade(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  r3aTvSky(g, '#6ab0e0', '#cfe8f4', 250);
  // bunting across the top
  for (let k = 0; k < 24; k++) { const x = k * 42, y = 30 + Math.sin(k / 23 * Math.PI) * 30; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 40, y + 2); g.lineTo(x + 20, y + 34); g.closePath(); r3aTvCel(g, ['#c0283a', '#f2c444', '#2f6fc0'][k % 3], 2.5); }
  // the privileged elite rise behind the balustrade on "privileged"; fans open and hats tip on "elite"
  if (t >= C.privileged12 - 0.02) {
    const up = easeOutBack(clamp((tq - C.privileged12) / 0.3), 1.6), tip = t >= C.elite12 ? Math.sin(clamp((t - C.elite12) / .6) * Math.PI) : 0;
    for (let k = 0; k < 6; k++) {
      const x = 110 + k * 150, lady = k % 2 === 0, y = 168 + (1 - up) * 90;
      r3aTvPerson(g, x, y, .7, { skin: r3aTvSkins[(k + 2) % 6], coat: lady ? '#c86aa0' : '#1c1a22', hat: lady ? 'tiara' : 'tophat', hair: lady ? '#c89a5a' : null, smile: t >= C.elite12, lift: lady ? 0 : tip, arms: 'none' });
      if (lady && t >= C.elite12) { const o = smooth(clamp((t - C.elite12) / .2)); g.save(); g.translate(x + 26, y + 34); for (let f = 0; f < 6; f++) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 30, -Math.PI / 2 - .8 * o + f * .32 * o, -Math.PI / 2 - .8 * o + (f + 1) * .32 * o); g.closePath(); r3aTvCel(g, '#f6f2e6', 2); } g.restore(); }
    }
  }
  // the balustrade
  g.fillStyle = '#e8e0cc'; g.fillRect(0, 230, 960, 16); g.fillRect(0, 300, 960, 14);
  for (let x = 10; x < 960; x += 36) { g.beginPath(); g.ellipse(x + 10, 272, 9, 26, 0, 0, TAU); r3aTvCel(g, '#f4eee0', 2.5); }
  g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.strokeRect(-4, 230, 968, 16); g.strokeRect(-4, 300, 968, 14);
  g.fillStyle = '#c8b890'; g.fillRect(0, 314, 960, 406);
  // four military rulers march in on the line, stepping on every sung onset; salute on "military", medals glint on "rulers"
  let bob = 0; for (const w of [...r3aTvLN[11].words, ...r3aTvLN[12].words]) if (t >= w.s && t < w.s + .16) bob = Math.sin((t - w.s) / .16 * Math.PI);
  const inU = smooth(clamp((t - C.l11) / 0.5));
  for (let k = 0; k < 4; k++) {
    const x = 160 + k * 200 + (1 - inU) * 900, y = 330 - bob * 10 * (k % 2 ? 1 : .7);
    const sal = t >= C.military11 ? smooth(clamp((t - C.military11 - k * .04) / .15)) : 0;
    r3aTvPerson(g, x, y, 1.0, { skin: r3aTvSkins[[1, 0, 3, 2][k]], coat: '#5a6a3a', hat: 'peaked', moustache: k % 2 === 0, medals: true, arms: 'salute', armT: sal });
    if (t >= C.rulers11 && t - C.rulers11 < .7) sparkle(g, x - 10, y + 80, 16 * Math.sin(clamp((t - C.rulers11 - k * .05) / .5) * Math.PI) + 1, 1);
  }
}
function r3aTvFilmMap(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.fillStyle = '#162544'; g.fillRect(0, 0, 960, 720);
  g.save(); g.translate(480, 230); const z = 1.12 + (t - C.l13) * .02; g.scale(z, z); g.translate(-480, -200);
  g.drawImage(NW.set, 0, 0, 960, 372, 0, 0, 960, 372);
  // three lands flash up, one on each word; on "countries" a dotted route leaves each one for the ball
  const lands = [[230, 250, C.different13], [500, 236, C.third13], [770, 280, C.world13]], ball = [450, 96];
  for (const [x, y, c] of lands) {
    if (t < c - 0.02) continue;
    const p = r3aTvPop(t, c), pul = .5 + .5 * Math.sin((t - c) * 10);
    g.beginPath(); g.arc(x, y, 34 * p, 0, TAU); g.fillStyle = `rgba(242,194,48,${.35 + .2 * pul})`; g.fill(); g.strokeStyle = '#f2c230'; g.lineWidth = 5; g.stroke();
    if (t >= C.countries13) {
      const u = clamp((tq - C.countries13) / 0.4);
      g.strokeStyle = '#fbf3d0'; g.lineWidth = 4; g.setLineDash([10, 9]);
      g.beginPath(); for (let i = 0; i <= 20 * u; i++) { const v = i / 20, xx = lerp(x, ball[0], v), yy = lerp(y, ball[1], v) - Math.sin(v * Math.PI) * 70; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); g.setLineDash([]);
    }
  }
  if (t >= C.countries13 + 0.3) {
    // the ball: a little chandelier pops at the routes' end
    const p = r3aTvPop(t, C.countries13 + 0.3);
    r3aTvScaled(g, ball[0], ball[1], p, () => r3aTvChandelier(g, ball[0], ball[1] - 30, .5, 0, 0));
  }
  g.restore();
}
function r3aTvChandelier(g, x, y, s, swing, flare) {
  g.save(); g.translate(x, y); g.rotate(swing); g.scale(s, s);
  g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -60); g.lineTo(0, 0); g.stroke();
  g.beginPath(); g.ellipse(0, 20, 70, 16, 0, 0, TAU); r3aTvCel(g, '#e8b84a', 4);
  for (let k = -3; k <= 3; k++) { g.beginPath(); g.rect(k * 20 - 4, -4, 8, 22); r3aTvCel(g, '#fbf8ee', 2.5); g.beginPath(); g.ellipse(k * 20, -10, 5, 8, 0, 0, TAU); g.fillStyle = '#f2c230'; g.fill(); }
  for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 26, 34); g.lineTo(k * 26 - 7, 50); g.lineTo(k * 26, 62); g.lineTo(k * 26 + 7, 50); g.closePath(); r3aTvCel(g, '#cfe8f4', 2.5); }
  if (flare > 0) { g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(0, 10, 10, 0, 10, 160); rg.addColorStop(0, `rgba(255,240,180,${.8 * flare})`); rg.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = rg; g.fillRect(-170, -150, 340, 320); }
  g.restore();
}
function r3aTvFilmBowl(g, t) {
  const C = r3aTvC;
  g.fillStyle = '#c8b48a'; g.fillRect(0, 0, 960, 720);
  g.fillStyle = 'rgba(120,90,50,.25)'; for (let x = 0; x < 960; x += 80) g.fillRect(x, 0, 3, 260);
  // a bare table, an empty bowl, a hand with a spoon: it dips on "enough" and comes up empty on "eat"
  woodGrain(g, 0, 260, 960, 460, '#7a4a26', 1414, true);
  g.strokeStyle = r3aTvNK; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 260); g.lineTo(960, 260); g.stroke();
  const bx = 440, by = 330;
  g.beginPath(); g.ellipse(bx, by + 50, 120, 20, 0, 0, TAU); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill();
  g.beginPath(); g.moveTo(bx - 120, by); g.quadraticCurveTo(bx - 110, by + 70, bx, by + 70); g.quadraticCurveTo(bx + 110, by + 70, bx + 120, by); g.closePath(); r3aTvCel(g, '#e8e0cc', 4.5);
  g.beginPath(); g.ellipse(bx, by, 120, 24, 0, 0, TAU); r3aTvCel(g, '#d8cfb8', 4);
  g.beginPath(); g.ellipse(bx, by + 4, 100, 16, 0, 0, TAU); g.fillStyle = '#c8bea6'; g.fill();
  let dip = 0;
  if (t >= C.enough14 - 0.1 && t < C.eat14) dip = smooth(clamp((t - (C.enough14 - 0.1)) / 0.25));
  else if (t >= C.eat14) dip = 1 - smooth(clamp((t - C.eat14) / 0.2));
  const hx = 640 - dip * 150, hy = 170 + dip * 150;
  g.save(); g.translate(hx, hy); g.rotate(-.6 - dip * .2);
  g.beginPath(); g.roundRect(-10, -6, 150, 12, 6); r3aTvCel(g, '#c8ccd4', 3.5);
  g.beginPath(); g.ellipse(-26, 0, 26, 16, 0, 0, TAU); r3aTvCel(g, '#c8ccd4', 3.5);
  g.beginPath(); g.ellipse(-26, -3, 18, 9, 0, 0, TAU); g.fillStyle = '#9aa0a8'; g.fill();   // empty
  g.restore();
  tube(g, [[hx + 120, hy - 70], [hx + 260, hy - 150], [960, hy - 170]], 30, '#7a6a5a');
  mitten(g, hx + 110, hy - 64, 22, -.5, '#c89070');
}
function r3aTvFilmTickets(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.drawImage(r3aTvNW.grand, 0, 0);
  // the doors of the hall: shut until "ball", then they swing open on light, a chandelier, dancing pairs
  const op = t < C.ball15 - 0.02 ? 0 : smooth(clamp((t - C.ball15) / 0.3));
  const dx = 400, dy = 80, dw = 220, dh = 340;
  g.fillStyle = '#fff2c0'; g.fillRect(dx, dy, dw, dh);
  if (op > 0) {
    const rg = g.createRadialGradient(dx + dw / 2, dy + 80, 10, dx + dw / 2, dy + 80, 300); rg.addColorStop(0, 'rgba(255,240,180,.9)'); rg.addColorStop(1, 'rgba(255,200,120,0)');
    g.save(); g.beginPath(); g.rect(dx, dy, dw, dh); g.clip(); g.fillStyle = rg; g.fillRect(dx, dy, dw, dh);
    r3aTvChandelier(g, dx + dw / 2, dy + 60, .7, Math.sin(t * 3) * .05, .6);
    for (let k = 0; k < 2; k++) { const px = dx + 60 + k * 100, ph = Math.sin(t * 6 + k) * 8; g.fillStyle = 'rgba(60,30,50,.7)'; g.beginPath(); g.ellipse(px + ph, dy + 250, 26, 60, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(px + ph, dy + 176, 16, 0, TAU); g.fill(); g.beginPath(); g.ellipse(px + 30 - ph, dy + 260, 22, 56, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(px + 30 - ph, dy + 190, 14, 0, TAU); g.fill(); }
    g.restore();
  }
  for (const sd of [-1, 1]) {
    const w = dw / 2 * (1 - op * .85), x0 = sd < 0 ? dx : dx + dw - w;
    g.beginPath(); g.rect(x0, dy, w, dh); r3aTvCel(g, '#7a3a24', 4.5);
    if (w > 30) { g.strokeStyle = '#d8a83a'; g.lineWidth = 3; g.strokeRect(x0 + 14, dy + 20, w - 28, dh / 2 - 30); g.strokeRect(x0 + 14, dy + dh / 2 + 10, w - 28, dh / 2 - 30); }
  }
  g.strokeStyle = r3aTvNK; g.lineWidth = 6; g.strokeRect(dx, dy, dw, dh);
  // the ticket booth on the left: tickets burst from its window on "tickets" and flutter down
  g.beginPath(); g.rect(110, 150, 200, 280); r3aTvCel(g, '#2f6fc0', 4.5);
  g.beginPath(); g.roundRect(140, 190, 140, 100, 50); r3aTvCel(g, '#1b1530', 4);
  g.beginPath(); g.moveTo(96, 150); g.lineTo(324, 150); g.lineTo(300, 110); g.lineTo(120, 110); g.closePath(); r3aTvCel(g, '#c0283a', 4);
  if (t >= C.tickets15 - 0.02) for (let k = 0; k < 14; k++) {
    const u = (tq - C.tickets15) / 1.6 - k * .02; if (u <= 0) continue;
    const a = -Math.PI / 2 + (rnd(k, 8) - .5) * 2.4, sp = 180 + rnd(k, 9) * 140;
    const x = 210 + Math.cos(a) * sp * Math.min(u, .35) + Math.sin(u * 8 + k) * 20 * u, y = 240 + Math.sin(a) * sp * Math.min(u, .35) + Math.max(0, u - .35) * 220;
    if (y > 440) continue;
    g.save(); g.translate(x, y); g.rotate(Math.sin(u * 10 + k) * .8); g.beginPath(); g.rect(-16, -9, 32, 18); r3aTvCel(g, ['#f2c444', '#ff7fb0', '#9bb53c'][k % 3], 2.5); g.strokeStyle = 'rgba(27,21,48,.5)'; g.setLineDash([3, 3]); g.lineWidth = 2; g.beginPath(); g.moveTo(8, -9); g.lineTo(8, 9); g.stroke(); g.setLineDash([]); g.restore();
  }
  // the crowd from behind, scrambling: arms grab up on every sung onset from "scrambling"
  const ws = r3aTvLN[15].words.filter(w => w.s >= C.scramble15 - 0.01);
  for (let k = 0; k < 7; k++) {
    let gr = 0; for (let i = 0; i < ws.length; i++) if ((i + k) % 3 === 0 && t >= ws[i].s && t < ws[i].s + .35) gr = Math.max(gr, Math.sin((t - ws[i].s) / .35 * Math.PI));
    r3aTvBack(g, 60 + k * 140, 400 + (k % 2) * 22, 1.0, k, gr);
  }
}
function r3aTvFilmAuction(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.drawImage(r3aTvNW.grand, 0, 0);
  const fl = t >= C.hall16 ? Math.exp(-(t - C.hall16) * 2.5) : 0;
  r3aTvChandelier(g, 480, 70, .9, t >= C.hall16 ? Math.sin((t - C.hall16) * 8) * .12 * Math.exp(-(t - C.hall16) * 1.5) : 0, fl);
  // the memorial bust of the king on its plinth: grey stone; rays round it on "memorial"
  const bx = 200, by = 210;
  if (t >= C.memorial16) { const u = clamp((t - C.memorial16) / .4); g.strokeStyle = `rgba(242,194,48,${.9})`; g.lineWidth = 6; for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; g.beginPath(); g.moveTo(bx + Math.cos(a) * 90, by + Math.sin(a) * 90); g.lineTo(bx + Math.cos(a) * (90 + 50 * u), by + Math.sin(a) * (90 + 50 * u)); g.stroke(); } }
  g.save(); kingFace(g, bx, by, .7, t, 0);
  g.globalCompositeOperation = 'color'; g.fillStyle = '#9a968c'; g.beginPath(); g.ellipse(bx, by + 10, 96, 100, 0, 0, TAU); g.fill(); g.restore();
  r3aTvHead(bx - 50, by - 70, bx + 50, by + 60);
  g.beginPath(); g.rect(bx - 70, by + 98, 140, 220); r3aTvCel(g, '#d8d0bc', 4.5);
  g.beginPath(); g.rect(bx - 84, by + 92, 168, 16); r3aTvCel(g, '#e8e0cc', 4);
  // the auctioneer (the man in the frock coat) at his rostrum with the gavel: it comes down on "auction"
  r3aTvMan(g, 760, 230, 1.0, { mouth: r3aTvMouth(t) });
  r3aTvHead(760 - 38, 230 - 80, 760 + 38, 230 + 20);
  g.beginPath(); g.moveTo(670, 300); g.lineTo(850, 300); g.lineTo(836, 460); g.lineTo(684, 460); g.closePath(); r3aTvCel(g, '#6b3f22', 4.5);
  const gv = t < C.auction16 - 0.15 ? 0 : t < C.auction16 ? smooth((t - (C.auction16 - 0.15)) / 0.15) : (tq - C.auction16 < 0.12 ? 1 : 1 - smooth(clamp((t - C.auction16 - .2) / .3)) * .8);
  g.save(); g.translate(700, 250); g.rotate(-1.1 + gv * 1.1);
  g.beginPath(); g.rect(-6, 0, 12, 70); r3aTvCel(g, '#8a5428', 3); g.beginPath(); g.roundRect(-26, 62, 52, 26, 6); r3aTvCel(g, '#6b3a1e', 3.5);
  g.restore();
  mitten(g, 700, 250, 14, 0, '#e8bc94');
  if (t >= C.auction16 && t - C.auction16 < .35) { g.strokeStyle = r3aTvNK; g.lineWidth = 4; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(676 + sd * 50, 320); g.lineTo(676 + sd * 76, 312); g.stroke(); } }
  // paddles go up from the floor on the onsets before the gavel
  const pc = [r3aTvW(16, 2), r3aTvW(16, 3), r3aTvW(16, 4)];
  pc.forEach((c, k) => {
    if (t < c - 0.02) return;
    const up = easeOutBack(clamp((tq - c) / .2), 1.8) * (t > C.auction16 + .3 ? 1 - smooth(clamp((t - C.auction16 - .3) / .3)) : 1), x = 360 + k * 110;
    const y = 480 - up * 140;
    g.beginPath(); g.rect(x - 5, y, 10, 120); r3aTvCel(g, '#8a5428', 3);
    g.beginPath(); g.ellipse(x, y - 30, 30, 34, 0, 0, TAU); r3aTvCel(g, ['#f2c444', '#fbf8ee', '#ff7fb0'][k], 4);
    g.beginPath(); g.arc(x, y - 30, 12, 0, TAU); g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.stroke();
  });
}
// ---------- stanza 3 ----------
function r3aTvFilmBid(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.drawImage(r3aTvNW.grand, 0, 0);
  // the easel and its map: the plots spread over "vast tracks", are ringed and crossed on "land"
  g.strokeStyle = '#5a3418'; g.lineWidth = 10; g.beginPath(); g.moveTo(300, 60); g.lineTo(220, 460); g.moveTo(300, 60); g.lineTo(380, 460); g.stroke();
  g.beginPath(); g.rect(130, 70, 340, 260); r3aTvCel(g, '#f1e2bc', 5);
  g.fillStyle = '#9bb53c'; g.fillRect(146, 86, 308, 228);
  const sp = t < C.vast19 ? 0 : clamp((t - C.vast19) / (C.tracks19 + 0.2 - C.vast19));
  const n = Math.floor(sp * 20 + 1e-6);
  for (let k = 0; k < n; k++) { const cx = k % 5, cy = Math.floor(k / 5); g.beginPath(); g.rect(150 + cx * 60, 90 + cy * 55, 58, 52); r3aTvCel(g, ['#c8955a', '#d8b86a', '#8aa848', '#b88a4a'][(cx + cy) % 4], 2.5); }
  if (t >= C.land19) {
    const u = clamp((tq - C.land19) / .3);
    g.strokeStyle = '#c0283a'; g.lineWidth = 6; g.beginPath(); g.ellipse(300, 200, 150 * u + 5, 112 * u + 5, -.05, 0, TAU); g.stroke();
    for (let k = 0; k < 4; k++) { if (u < 1) break; const x = 180 + k * 76, y = 140 + (k % 2) * 90; g.beginPath(); g.moveTo(x - 12, y - 12); g.lineTo(x + 12, y + 12); g.moveTo(x + 12, y - 12); g.lineTo(x - 12, y + 12); g.stroke(); }
  }
  // the hanging list: three ruled entries with boxes, ticked on "on", "the", "list"
  g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.beginPath(); g.moveTo(820, 0); g.lineTo(820, 70); g.stroke();
  g.beginPath(); g.rect(740, 70, 160, 220); r3aTvCel(g, '#fbf8ee', 4);
  [C.on19, C.the19, C.list19].forEach((c, k) => {
    const y = 120 + k * 60;
    g.beginPath(); g.rect(756, y - 16, 28, 28); g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.stroke();
    g.strokeStyle = 'rgba(40,30,50,.6)'; g.beginPath(); g.moveTo(796, y); g.lineTo(880, y); g.stroke();
    if (t >= c - 0.02) { const p = r3aTvPop(t, c); g.strokeStyle = '#c0283a'; g.lineWidth = 6 * p; g.beginPath(); g.moveTo(758, y - 2); g.lineTo(770, y + 12); g.lineTo(792, y - 26); g.stroke(); }
  });
  // the armoured fist raises its bidding paddle on "bid"
  const up = t < C.bid19 - 0.02 ? 0 : easeOutBack(clamp((tq - C.bid19) / .25), 1.8);
  const fx = 600, fy = 470 - up * 200;
  g.beginPath(); g.rect(fx - 6, fy - 150, 12, 130); r3aTvCel(g, '#8a5428', 3);
  g.beginPath(); g.ellipse(fx, fy - 186, 40, 44, 0, 0, TAU); r3aTvCel(g, '#f2c444', 4.5);
  g.beginPath(); g.arc(fx, fy - 186, 16, 0, TAU); g.strokeStyle = r3aTvNK; g.lineWidth = 5; g.stroke();
  r3aTvGauntlet(g, fx, fy - 30, .9, 0, 0);
}
function r3aTvFilmAncestral(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  r3aTvSky(g, '#f2a860', '#fbe0a0', 300);
  r3aTvSun(g, 790, 110, 46);
  g.fillStyle = '#6a9a48'; g.beginPath(); g.moveTo(0, 300); g.quadraticCurveTo(200, 200, 420, 280); g.quadraticCurveTo(640, 210, 960, 290); g.lineTo(960, 720); g.lineTo(0, 720); g.closePath(); g.fill();
  g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#4f8a3c'; g.fillRect(0, 360, 960, 360);
  // standing stones with spirals, round houses, the great tree
  for (const [x, h] of [[90, 120], [150, 150], [210, 110]]) { g.beginPath(); g.roundRect(x - 22, 380 - h, 44, h, 16); r3aTvCel(g, '#a8a49a', 4); g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 30; i++) { const a = i * .5, r = i * .7; i ? g.lineTo(x + Math.cos(a) * r, 380 - h * .6 + Math.sin(a) * r) : g.moveTo(x, 380 - h * .6); } g.stroke(); }
  for (const [x, s] of [[760, 1], [880, .8]]) { g.save(); g.translate(x, 370); g.scale(s, s); g.beginPath(); g.rect(-50, -50, 100, 50); r3aTvCel(g, '#c89a6a', 4); g.beginPath(); g.moveTo(-64, -46); g.lineTo(0, -110); g.lineTo(64, -46); g.closePath(); r3aTvCel(g, '#d8b860', 4); g.beginPath(); g.rect(-12, -34, 24, 34); r3aTvCel(g, '#3a2418', 3); g.restore(); }
  g.beginPath(); g.rect(450, 200, 40, 180); r3aTvCel(g, '#6b3f22', 4);
  for (const [x, y, r] of [[470, 140, 110], [380, 180, 70], [570, 180, 74], [470, 70, 70]]) { g.beginPath(); g.arc(x, y, r, 0, TAU); r3aTvCel(g, '#3f7a34', 4); }
  // the people under the tree step forward on "people", hands raised
  const fw = t < C.people20 - 0.02 ? 0 : smooth(clamp((tq - C.people20) / .3));
  for (let k = 0; k < 4; k++) {
    const x = 330 + k * 92, y = 300 + fw * 26;
    r3aTvPerson(g, x, y, .82 * (1 + fw * .08), { skin: r3aTvSkins[[1, 5, 3, 1][k]], coat: ['#c86a3a', '#8a5428', '#d8a83a', '#6a8a3a'][k], hair: '#1c1410', hat: k % 2 ? 'none' : 'scarf', scarf: ['#c0283a', '#2f6fc0'][k / 2 | 0], arms: fw > 0 ? 'up' : 'down', armT: fw, smile: false });
  }
  // stanza 3, next line: brown paper folds in from the corners over the picture on "included",
  // a cord ties it on the line, and the red seal lands on "package"
  if (t >= C.included21 - 0.02) {
    const u = smooth(clamp((t - C.included21) / .45));
    g.fillStyle = '#c8955a'; g.strokeStyle = r3aTvNK; g.lineWidth = 5; g.lineJoin = 'round';
    // four envelope flaps, one from each edge, meeting in the middle
    for (const tri of [[[0, 0], [960, 0], [480, 240 * u]], [[0, 480], [960, 480], [480, 480 - 240 * u]], [[0, 0], [0, 480], [480 * u, 240]], [[960, 0], [960, 480], [960 - 480 * u, 240]]]) {
      g.beginPath(); g.moveTo(...tri[0]); g.lineTo(...tri[1]); g.lineTo(...tri[2]); g.closePath(); g.fill(); g.stroke();
    }
    if (u >= 1) {
      g.fillStyle = '#c8955a'; g.fillRect(0, 0, 960, 480);
      g.strokeStyle = 'rgba(90,50,20,.5)'; g.lineWidth = 3; for (const [a, b] of [[[0, 0], [480, 240]], [[960, 0], [480, 240]], [[0, 480], [480, 240]], [[960, 480], [480, 240]]]) { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
      const tie = clamp((t - C.included21 - .5) / .6);
      g.strokeStyle = '#7a4a24'; g.lineWidth = 9; g.beginPath(); g.moveTo(480, 0); g.lineTo(480, 480 * tie); g.moveTo(0, 240); g.lineTo(960 * tie, 240); g.stroke();
      if (t >= C.package21 - 0.02) { const p = r3aTvPop(t, C.package21); g.beginPath(); for (let k = 0; k <= 24; k++) { const a = k / 24 * TAU, r = (54 + (k % 2) * 7) * p; k ? g.lineTo(480 + Math.cos(a) * r, 240 + Math.sin(a) * r) : g.moveTo(480 + r, 240); } g.closePath(); r3aTvCel(g, '#c0283a', 4); g.beginPath(); g.arc(480, 240, 30 * p, 0, TAU); g.strokeStyle = '#8a1424'; g.lineWidth = 5; g.stroke(); }
    }
  }
}
// ---------- stanza 4 ----------
function r3aTvQueen(g, x, y, s, bob) {
  g.save(); g.translate(x, y - bob * 14); g.scale(s, s);
  g.beginPath(); g.moveTo(-90, 230); g.quadraticCurveTo(-80, 90, -40, 70); g.lineTo(40, 70); g.quadraticCurveTo(80, 90, 90, 230); g.closePath(); r3aTvCel(g, '#e88aa8', 4.5);
  for (let k = -3; k <= 3; k++) { g.beginPath(); g.arc(k * 10, 74 + k * k * 1.2, 4.5, 0, TAU); r3aTvCel(g, '#fbf8ee', 2); }
  g.beginPath(); g.ellipse(0, -36, 62, 66, 0, 0, TAU); r3aTvCel(g, '#c89a5a', 4.5);
  g.beginPath(); g.moveTo(-26, -96); for (let i = 0; i <= 4; i++) g.lineTo(-26 + i * 13, -96 - (i % 2 ? 4 : 16)); g.lineTo(26, -96); g.closePath(); r3aTvCel(g, '#f2c444', 3);
  g.beginPath(); g.rect(-11, 40, 22, 32); r3aTvCel(g, '#f4c8a8', 3.5);
  g.beginPath(); g.ellipse(0, 6, 40, 46, 0, 0, TAU); r3aTvCel(g, '#f4c8a8', 4);
  g.beginPath(); g.moveTo(-42, -4); g.quadraticCurveTo(-34, -50, 0, -46); g.quadraticCurveTo(34, -50, 42, -4); g.quadraticCurveTo(20, -26, 0, -26); g.quadraticCurveTo(-20, -26, -42, -4); g.closePath(); r3aTvCel(g, '#c89a5a', 3.5);
  for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 14, 2, 4, 0, TAU); g.fillStyle = r3aTvNK; g.fill(); g.fillStyle = 'rgba(240,110,120,.5)'; g.beginPath(); g.arc(sd * 25, 18, 7, 0, TAU); g.fill(); }
  g.beginPath(); g.arc(0, 22, 8, .2 * Math.PI, .8 * Math.PI); g.strokeStyle = '#a8283a'; g.lineWidth = 3.5; g.stroke();
  g.restore();
  r3aTvHead(x - 64 * s, y - bob * 14 - 116 * s, x + 64 * s, y - bob * 14 + 56 * s);
}
function r3aTvKid(g, x, y, s, hop, boy, glass) {
  const yy = y - hop * 40;
  r3aTvPerson(g, x, yy, s, { skin: '#f4d0b0', coat: boy ? '#2f6fc0' : '#9bb53c', hair: boy ? '#c89a5a' : '#c89a5a', hat: boy ? 'none' : 'tiara', smile: true, arms: glass > 0 ? 'none' : 'down' });
  if (glass > 0) {
    // the boy raises a brass spyglass to his eye
    const a = lerp(1.2, -.12, glass);
    g.save(); g.translate(x + 8 * s, yy - 14 * s); g.rotate(a);
    g.beginPath(); g.roundRect(0, -9 * s, 70 * s, 18 * s, 5); r3aTvCel(g, '#d8a83a', 3); g.beginPath(); g.roundRect(50 * s, -12 * s, 34 * s, 24 * s, 5); r3aTvCel(g, '#c8962a', 3);
    g.restore();
    mitten(g, x + 30 * s, yy + 4 * s + (1 - glass) * 50 * s, 9 * s, 0, '#f4d0b0');
  }
}
function r3aTvFilmFamily(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  g.drawImage(NW.paper, 0, 0);
  // the window: far off, the land (a fence, cattle, smoke); the curtains are drawn on "up close"
  const wx = 560, wy = 60, ww = 340, wh = 300;
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  r3aTvSky(g, '#9cc8e8', '#e8f0e0', wy + 200); g.fillStyle = '#7a9a48'; g.fillRect(wx, wy + 200, ww, 120);
  g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.beginPath(); g.moveTo(wx, wy + 230); g.lineTo(wx + ww, wy + 230); g.stroke(); for (let x = wx + 10; x < wx + ww; x += 30) { g.beginPath(); g.moveTo(x, wy + 222); g.lineTo(x, wy + 244); g.stroke(); }
  for (let k = 0; k < 3; k++) r3aTvCow(g, wx + 80 + k * 70, wy + 260, .35, 0);
  for (let k = 0; k < 3; k++) { const u = ((t * .3 + k / 3) % 1); g.fillStyle = `rgba(90,90,90,${.6 * (1 - u)})`; g.beginPath(); g.arc(wx + 280 + u * 20, wy + 190 - u * 120, 14 + u * 20, 0, TAU); g.fill(); }
  g.restore();
  g.beginPath(); g.rect(wx, wy, ww, wh); g.strokeStyle = '#f4eee0'; g.lineWidth = 16; g.stroke(); g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.strokeRect(wx - 8, wy - 8, ww + 16, wh + 16);
  g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2); g.strokeStyle = '#f4eee0'; g.lineWidth = 8; g.stroke();
  const shut = t < C.up25 - 0.02 ? 0 : smooth(clamp((t - C.up25) / (C.close25 + .1 - C.up25)));
  for (const sd of [-1, 1]) {
    const cw = lerp(50, ww / 2 + 30, shut), x0 = sd < 0 ? wx - 40 : wx + ww + 40 - cw;
    g.beginPath(); g.rect(x0, wy - 30, cw, wh + 80); r3aTvCel(g, '#8a2a4a', 4.5);
    g.strokeStyle = 'rgba(40,10,20,.4)'; g.lineWidth = 4; for (let x = x0 + 14; x < x0 + cw; x += 22) { g.beginPath(); g.moveTo(x, wy - 30); g.lineTo(x, wy + wh + 50); g.stroke(); }
  }
  g.beginPath(); g.rect(wx - 60, wy - 44, ww + 120, 18); r3aTvCel(g, '#d8a83a', 3.5);
  // the queen bobs on "wife"; the two children hop on "kids"; the boy raises his spyglass on "see"
  const bob = t >= C.wife24 && t < C.wife24 + .4 ? Math.sin((t - C.wife24) / .4 * Math.PI) : 0;
  r3aTvQueen(g, 250, 230, 1.0, bob);
  const hop = (d) => t >= C.kids24 + d && t < C.kids24 + d + .35 ? Math.sin((t - C.kids24 - d) / .35 * Math.PI) : 0;
  const gl = t < C.see25 - 0.02 ? 0 : smooth(clamp((tq - C.see25) / .25)) * (1 - smooth(clamp((t - C.close25 - .2) / .3)));
  r3aTvKid(g, 420, 300, .72, hop(0), true, gl);
  r3aTvKid(g, 110, 310, .66, hop(.08), false, 0);
}
function r3aTvFilmRoad(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  r3aTvSky(g, '#9cc8e8', '#e8f0e0', 200);
  g.fillStyle = '#7a9a48'; g.fillRect(0, 200, 960, 520); g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 200); g.lineTo(960, 200); g.stroke();
  // the road from the castle gate winds to the horizon
  g.fillStyle = '#d8c08a'; g.beginPath(); g.moveTo(170, 440); g.quadraticCurveTo(380, 330, 560, 260); g.quadraticCurveTo(720, 214, 800, 202); g.lineTo(816, 202); g.quadraticCurveTo(740, 222, 600, 280); g.quadraticCurveTo(440, 360, 330, 440); g.closePath(); g.fill(); g.stroke();
  // far off, on "did": stumps and smoke where the woods were
  const far = t >= C.did26 ? smooth(clamp((t - C.did26) / .3)) : 0;
  for (let k = 0; k < 8; k++) {
    const x = 640 + k * 34, y = 200;
    if (far < 1) r3aTvTree(g, x, y, .32 * (1 - far));
    if (far > 0) { g.beginPath(); g.rect(x - 4, y - 8 * far, 8, 8 * far); r3aTvCel(g, '#6b3f22', 2); }
  }
  if (far > 0) for (let k = 0; k < 4; k++) { const u = ((t - C.did26) * .5 + k / 4) % 1; g.fillStyle = `rgba(80,80,80,${.55 * far * (1 - u)})`; g.beginPath(); g.arc(680 + k * 60 + u * 20, 190 - u * 140, 16 + u * 30, 0, TAU); g.fill(); }
  r3aTvCastle(g, 200, 400, 1.6);
  // coins roll out of the gate and down the road on "money"
  if (t >= C.money26 - 0.02) for (let k = 0; k < 9; k++) {
    const u = (tq - C.money26) / 1.4 - k * .07; if (u <= 0) continue;
    const v = Math.min(1, u), x = lerp(200, 790, v), y = lerp(400, 206, v) - Math.abs(Math.sin(u * 14)) * 10 * (1 - v);
    coin(g, x, y, 14 * (1 - v * .7), u * 20, null);
  }
}
// ---------- stanza 5 ----------
function r3aTvFilmFarm(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  // on "far off" the film camera pushes toward the king's castle on the far hill
  const zf = t < C.far34 ? 0 : smooth(clamp((t - C.far34) / .5));
  g.save(); g.translate(820, 240); g.scale(1 + zf * .9, 1 + zf * .9); g.translate(-820, -240);
  r3aTvSky(g, '#79c7e3', '#d8f0f4', 230);
  r3aTvSun(g, 120, 90, 50);
  g.fillStyle = '#8aa848'; g.beginPath(); g.moveTo(600, 232); g.quadraticCurveTo(820, 120, 960, 200); g.lineTo(960, 240); g.closePath(); g.fill(); g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.stroke();
  r3aTvCastle(g, 820, 158, .5);
  if (t >= C.demand34 - 0.02) {
    // an order unrolls down from the castle with a red seal
    const u = smooth(clamp((t - C.demand34) / .3));
    g.beginPath(); g.rect(800, 160, 40, 110 * u + 6); r3aTvCel(g, '#fbf8ee', 2.5);
    g.strokeStyle = 'rgba(40,30,50,.6)'; g.lineWidth = 2; for (let k = 0; k < 6 * u; k++) { g.beginPath(); g.moveTo(806, 176 + k * 15); g.lineTo(834, 176 + k * 15); g.stroke(); }
    if (u >= 1) { g.beginPath(); g.arc(820, 270, 9, 0, TAU); r3aTvCel(g, '#c0283a', 2); }
  }
  // the field: brown furrows, the farmhouse with smoke
  g.fillStyle = '#9a6a3a'; g.fillRect(0, 230, 960, 490); g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 230); g.lineTo(960, 230); g.stroke();
  for (let k = 0; k < 7; k++) { const y = 250 + k * 30; g.strokeStyle = 'rgba(60,30,10,.45)'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, y); g.lineTo(960, y + 10); g.stroke(); }
  g.save(); g.translate(150, 236);
  g.beginPath(); g.rect(-60, -70, 120, 70); r3aTvCel(g, '#e8d8b0', 4); g.beginPath(); g.moveTo(-74, -66); g.lineTo(0, -120); g.lineTo(74, -66); g.closePath(); r3aTvCel(g, '#a8382a', 4);
  g.beginPath(); g.rect(-14, -34, 28, 34); r3aTvCel(g, '#6b3f22', 3);
  const boarded = t >= C.evicted33 + .3;
  for (const sd of [-1, 1]) { g.beginPath(); g.rect(sd * 38 - 12, -56, 24, 20); r3aTvCel(g, boarded ? '#8a5428' : '#79c7e3', 3); if (boarded) { g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.beginPath(); g.moveTo(sd * 38 - 14, -56); g.lineTo(sd * 38 + 14, -36); g.stroke(); } }
  if (!boarded) for (let k = 0; k < 3; k++) { const u = ((t * .5 + k / 3) % 1); g.fillStyle = `rgba(240,240,240,${.7 * (1 - u)})`; g.beginPath(); g.arc(40 + u * 20, -120 - u * 80, 8 + u * 12, 0, TAU); g.fill(); }
  g.restore();
  // seedlings rise along the furrows over "Growing local"; the cabbages fill out on "food"
  const grow = clamp((t - C.l31) / (C.local31 + .2 - C.l31)), full = t < C.food31 ? 0 : easeOutBack(clamp((tq - C.food31) / .3), 1.6);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) {
    const x = 290 + k * 74 + (r % 2) * 30, y = 262 + r * 30, d = (k + r) / 14;
    const sg = clamp(grow * 1.6 - d);
    if (sg <= 0) continue;
    if (full > 0) { g.beginPath(); g.arc(x, y - 10 * full, 15 * full + 4, 0, TAU); r3aTvCel(g, '#7ab84a', 3); g.strokeStyle = '#4a7a2a'; g.lineWidth = 2; g.beginPath(); g.arc(x, y - 10 * full, 7 * full, 0, TAU); g.stroke(); }
    else { g.strokeStyle = '#3f7a34'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 14 * sg); g.stroke(); g.fillStyle = '#5aa04a'; g.beginPath(); g.ellipse(x - 6, y - 14 * sg, 6 * sg, 3 * sg, -.5, 0, TAU); g.ellipse(x + 6, y - 14 * sg, 6 * sg, 3 * sg, .5, 0, TAU); g.fill(); }
  }
  g.restore();
  // the two farmers: bent at the work, straighten on "farmers", wave on "land"; after "became" they walk
  // off left with bundles on sticks, a step on every sung onset (they never come back)
  let walk = 0;
  if (t >= C.became33) { for (const L of [r3aTvLN[33], r3aTvLN[34]]) for (const w of L.words) if (w.s >= C.became33 - .01 && t >= w.s) walk += 1 - Math.max(0, 1 - (t - w.s) / .2); }
  for (let k = 0; k < 2; k++) {
    const x = 470 + k * 170 - walk * 46, y = 300 + k * 20;
    const bend = t < C.farmers32 ? 1 : 1 - smooth(clamp((t - C.farmers32) / .25));
    const wave = t >= C.land32 && t < C.evicted33;
    const zx = 820 + (x - 820) * (1 + zf * .9), zy = 240 + (y - 240) * (1 + zf * .9);
    g.save(); g.translate(zx, zy + bend * 30); g.rotate(bend * .35 * (k ? -1 : 1)); g.translate(-zx, -zy);
    r3aTvPerson(g, zx, zy, .9 * (1 + zf * .9), { skin: r3aTvSkins[[3, 1][k]], coat: ['#3a6a8a', '#8a6a3a'][k], hat: k ? 'cap' : 'scarf', scarf: '#d8a83a', hair: '#3a2418', arms: wave ? 'wave' : 'down', waveT: t, smile: !walk });
    g.restore();
    if (walk > 0) { const bx = zx + 40, by = zy - 40; g.strokeStyle = '#6b3f22'; g.lineWidth = 6; g.beginPath(); g.moveTo(zx + 20, zy + 40); g.lineTo(bx + 20, by); g.stroke(); g.beginPath(); g.arc(bx + 24, by - 8, 20, 0, TAU); r3aTvCel(g, '#d8c8a8', 3.5); }
  }
  // the fence slams up post by post on "evicted", with a padlocked gate
  if (t >= C.evicted33 - 0.02) {
    g.save(); g.translate(820, 240); g.scale(1 + zf * .9, 1 + zf * .9); g.translate(-820, -240);
    for (let k = 0; k < 14; k++) {
      const c = C.evicted33 + k * .03; if (tq < c) continue;
      const x = 20 + k * 70, up = easeOutBack(clamp((tq - c) / .12), 2);
      g.beginPath(); g.rect(x - 8, 440 - 96 * up, 16, 96 * up); r3aTvCel(g, '#8a8a92', 3);
      if (k < 13 && tq >= c + .03) { g.strokeStyle = '#5a5a62'; g.lineWidth = 4; for (const yy of [360, 392, 424]) { g.beginPath(); g.moveTo(x, yy); g.lineTo(x + 70, yy); g.stroke(); } }
    }
    if (tq >= C.evicted33 + .45) { g.beginPath(); g.roundRect(452, 370, 34, 30, 4); r3aTvCel(g, '#c8a040', 3); g.beginPath(); g.arc(469, 370, 10, Math.PI, TAU); g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.stroke(); }
    g.restore();
  }
}
function r3aTvFilmPasture(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  // stanza 5, the ranchers' land: the grass greys under the spray cloud on "poison"
  const grey = t < C.poison37 ? 0 : smooth(clamp((t - C.poison37) / 1.0)) * .65;
  r3aTvSky(g, '#79c7e3', '#d8f0f4', 220);
  g.fillStyle = rgb(mix([110, 160, 70], [140, 140, 120], grey)); g.fillRect(0, 220, 960, 500);
  g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 220); g.lineTo(960, 220); g.stroke();
  for (let x = 20; x < 960; x += 60) { g.beginPath(); g.rect(x - 5, 186, 10, 40); r3aTvCel(g, '#8a5428', 2.5); }
  g.strokeStyle = '#6b3f22'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 196); g.lineTo(960, 196); g.moveTo(0, 212); g.lineTo(960, 212); g.stroke();
  // three cows and two ranchers walk in from the right and arrive on "came"; the herd fills the field cow by cow
  const arrive = smooth(clamp((t - C.l35) / (C.came35 - C.l35)));
  const step = (tq * 2) % 1;
  const cows = [[300, 330], [470, 300], [640, 340]];
  const more = [[180, 270], [380, 260], [560, 250], [760, 270], [860, 330], [240, 380], [720, 400]];
  cows.forEach(([x, y], k) => r3aTvCow(g, x + (1 - arrive) * 700, y, .9, arrive < 1 ? step + k * .3 : 0));
  if (t >= C.cattle36 - 0.02) {
    const n = Math.min(more.length, Math.floor((tq - C.cattle36) / ((C.grew36 - C.cattle36) / more.length)) + 1);
    for (let k = 0; k < n; k++) { const [x, y] = more[k]; const p = r3aTvPop(t, C.cattle36 + k * (C.grew36 - C.cattle36) / more.length); r3aTvScaled(g, x, y, p, () => r3aTvCow(g, x, y, .75, 0, k % 2 ? 1 : -1)); }
  }
  for (let k = 0; k < 2; k++) {
    const x = 760 + k * 120 + (1 - arrive) * 700, y = 270;
    r3aTvPerson(g, x, y, .85, { skin: r3aTvSkins[[0, 2][k]], coat: ['#c86a3a', '#3a5a6a'][k], hat: 'cowboy', moustache: !k, arms: 'down' });
  }
  // the crop-duster comes in over the line and lays the spray on "poison"; it's gone on "flew"
  if (t >= C.l37) {
    const px = lerp(-200, 1180, clamp((t - C.l37) / (C.flew37 + .5 - C.l37))), py = 110 + Math.sin(t * 3) * 6;
    if (t >= C.lethal37) {
      for (let k = 0; k < 26; k++) {
        const t0 = C.lethal37 + k * .1; if (t < t0) continue;
        const sx = lerp(-200, 1180, clamp((t0 - C.l37) / (C.flew37 + .5 - C.l37))), u = Math.min(1, (t - t0) / 1.6);
        g.fillStyle = `rgba(120,140,100,${.7 * (1 - u * .4)})`; g.beginPath(); g.arc(sx - 30, py + 30 + u * 140, 26 + u * 40, 0, TAU); g.fill();
      }
    }
    g.save(); g.translate(px, py);
    g.beginPath(); g.ellipse(0, 0, 70, 16, 0, 0, TAU); r3aTvCel(g, '#f2c230', 4);
    for (const dy of [-26, 18]) { g.beginPath(); g.roundRect(-24, dy - 4, 50, 10, 4); r3aTvCel(g, '#f2c230', 3); }
    g.strokeStyle = r3aTvNK; g.lineWidth = 3; g.beginPath(); g.moveTo(-14, -22); g.lineTo(-14, 16); g.moveTo(14, -22); g.lineTo(14, 16); g.stroke();
    g.beginPath(); g.moveTo(-70, 0); g.lineTo(-90, -24); g.lineTo(-70, -8); g.closePath(); r3aTvCel(g, '#f2c230', 3);
    g.beginPath(); g.ellipse(74, 0, 6, 24 * Math.abs(Math.sin(t * 40)) + 4, 0, 0, TAU); g.fillStyle = 'rgba(80,80,80,.6)'; g.fill();
    g.restore();
  }
}
function r3aTvFilmForest(g, t) {
  const C = r3aTvC, tq = r3aTvOnTwos(t);
  r3aTvSky(g, '#9cc8e8', '#e8f0e0', 220);
  g.fillStyle = '#5a8a3a'; g.beginPath(); g.moveTo(0, 240); g.quadraticCurveTo(240, 150, 480, 220); g.quadraticCurveTo(720, 140, 960, 230); g.lineTo(960, 720); g.lineTo(0, 720); g.closePath(); g.fill(); g.strokeStyle = r3aTvNK; g.lineWidth = 4; g.stroke();
  // the forest fills the hills on "forest"; on "flat" a bulldozer pushes in and the trees fall flat in a wave
  const pop = t < C.forest39 - 0.02 ? .5 : 1;
  const dz = t < C.flat39 - .25 ? -260 : lerp(-260, 1100, clamp((t - (C.flat39 - .25)) / 1.2));
  for (let r = 0; r < 3; r++) for (let k = 0; k < 12; k++) {
    if (pop < 1 && (k + r) % 2) continue;
    const x = 30 + k * 82 + (r % 2) * 40, y = 260 + r * 50;
    const fall = clamp((dz - x + 40) / 60);
    const p = pop === 1 && (k + r) % 2 ? r3aTvPop(t, C.forest39 + k * .01) : 1;
    r3aTvTree(g, x, y, (.8 + r * .1) * p, fall);
  }
  if (dz > -250) {
    g.save(); g.translate(dz, 360);
    g.beginPath(); g.roundRect(-150, -90, 130, 70, 8); r3aTvCel(g, '#e8b630', 4);
    g.beginPath(); g.rect(-120, -140, 60, 54); r3aTvCel(g, '#e8b630', 4); g.beginPath(); g.rect(-110, -130, 40, 30); r3aTvCel(g, '#9cc8e8', 3);
    g.beginPath(); g.roundRect(-160, -26, 150, 40, 18); r3aTvCel(g, '#3a3a40', 4);
    g.beginPath(); g.moveTo(-10, -100); g.lineTo(40, -110); g.lineTo(40, 10); g.lineTo(-10, 0); g.closePath(); r3aTvCel(g, '#8a8a92', 4);
    g.restore();
  }
}
// the program: which shot is on the air
function r3aTvDrawNews(g, t) {
  const C = r3aTvC;
  let film = true;
  if (t < C.hit) { r3aTvIdent(g, t); film = false; }
  else if (t < C.l5) { r3aTvDesk(g, t); film = false; }
  else if (t < C.l8) r3aTvFilmMeeting(g, t);
  else if (t < C.l11) { r3aTvDesk(g, t); film = false; }
  else if (t < C.l13) r3aTvFilmParade(g, t);
  else if (t < C.l14) { r3aTvFilmMap(g, t); film = false; }
  else if (t < C.l15) r3aTvFilmBowl(g, t);
  else if (t < C.l16) r3aTvFilmTickets(g, t);
  else if (t < C.l17) r3aTvFilmAuction(g, t);
  else if (t < C.l19) { r3aTvDesk(g, t); film = false; }
  else if (t < C.l20) r3aTvFilmBid(g, t);
  else if (t < C.l22) r3aTvFilmAncestral(g, t);
  else if (t < C.l24) { r3aTvDesk(g, t); film = false; }
  else if (t < C.l26) r3aTvFilmFamily(g, t);
  else if (t < C.l27) r3aTvFilmRoad(g, t);
  else if (t < C.l31) { r3aTvDesk(g, t); film = false; }
  else if (t < C.l35) r3aTvFilmFarm(g, t);
  else if (t < C.l38) r3aTvFilmPasture(g, t);
  else if (t < C.l39) { r3aTvDesk(g, t); film = false; }
  else if (t < C.l40) r3aTvFilmForest(g, t);
  else { r3aTvDesk(g, t); film = false; }
  // news film is a little warmer and softer than the studio
  if (film) { g.fillStyle = 'rgba(255,190,110,.06)'; g.fillRect(0, 0, 960, 720); }
}
// the king in the room on "breathed easy": breath curls rise from his head, and he sinks back
function r3aTvRoomKingFx(g, cam, t) {
  const C = r3aTvC, xf = fgXf(cam);
  if (!xf || t < C.breathed23 || t > C.l26) return;
  const [hx, hy] = fgPt(xf, 330, 930), q = xf.qf, dy = r3aTvKingDrop(t) * q;
  for (let k = 0; k < 3; k++) {
    const u = ((t - C.breathed23) * .8 + k / 3) % 1, a = (1 - u) * smooth(clamp((t - C.breathed23) / .3)) * (1 - smooth(clamp((t - C.l26 + .5) / .5)));
    g.strokeStyle = `rgba(255,250,235,${.8 * a})`; g.lineWidth = 9 * q; g.lineCap = 'round'; g.beginPath();
    // they drift up and away to the left of the set, clear of the wire copy on the screen
    for (let i = 0; i <= 14; i++) { const v = clamp(u + i * .012), yy = hy + dy - 110 * q - v * 190 * q, xx = hx - 70 * q - 150 * q * Math.sqrt(v) + Math.sin(i * .8 + k * 2) * 8 * q; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
    g.stroke();
  }
}
