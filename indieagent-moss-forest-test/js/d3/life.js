// d3 life: the beats around the giant. A bird on its shoulder, the first ray, the glow inside, soil pouring off,
// the flock leaving the treetops, leaves down through the beams. All pure functions of t.
const TL = { birdIn: .7, birdLand: 1.75, birdOff: 4.75, ray0: 2.3, ray1: 3.1, flock: 4.85 };

// the glow behind the front panel: three weak flickers, a catch, then it holds and breathes
function glowK(t) {
  const pulse = (c, w, a) => a * Math.exp(-Math.pow((t - c) / w, 2));
  return clamp(pulse(3.0, .09, .35) + pulse(3.35, .08, .5) + pulse(3.75, .1, .7) + smooth(inv(3.95, 5.1, t)) * (1 - .2 * smooth(inv(9, 11, t)) + .1 * Math.sin(t * 1.7)));
}
const rayK = (t) => smooth(inv(TL.ray0, TL.ray1, t));       // the first ray, on the giant's shoulder
const raysK = (t) => lerp(.16, 1, smooth(inv(TL.ray1, 7, t))); // the rest of the beams, as the sun clears

// a small bird, drawn in whole poses: wings up, level, down, or folded while perched
function birdPose(g, x, y, s, flap, dir, o = {}) {
  const dk = o.dk || '#3a2c2a', belly = o.belly || '#e9dcc0', wing = o.wing || '#54403a';
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  const line = () => { g.lineWidth = o.lw || 1.6; g.strokeStyle = 'rgba(30,20,20,.75)'; g.lineJoin = 'round'; g.stroke(); };
  const body = () => { g.beginPath(); g.moveTo(-12, 1); g.quadraticCurveTo(-5, -7, 5, -5); g.quadraticCurveTo(9, -9, 12, -4); g.lineTo(16, -3); g.lineTo(12, -1); g.quadraticCurveTo(8, 6, -2, 5); g.quadraticCurveTo(-8, 5, -18, 3); g.closePath(); };
  if (flap === null) { // perched: upright, a round body, a head, a beak, a tail; feet at y 0
    g.translate(0, -12);
    const shape = (f) => { f(); g.lineWidth = o.lw || 1.8; g.strokeStyle = 'rgba(30,20,20,.8)'; g.lineJoin = 'round'; g.stroke(); };
    shape(() => { g.beginPath(); g.moveTo(-5, 6); g.lineTo(-17, 14); g.lineTo(-13, 17); g.lineTo(-2, 10); g.closePath(); g.fillStyle = wing; g.fill(); });
    g.strokeStyle = '#2a1e1a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-1, 9); g.lineTo(-1, 13); g.moveTo(3, 9); g.lineTo(3, 13); g.stroke();
    shape(() => { g.beginPath(); g.ellipse(0, 0, 8.5, 11.5, .42, 0, TAU); g.fillStyle = dk; g.fill(); });
    g.beginPath(); g.ellipse(3.4, 2.2, 4.8, 7.6, .42, 0, TAU); g.fillStyle = belly; g.fill();
    shape(() => { g.beginPath(); g.arc(5, -11, 6.4, 0, TAU); g.fillStyle = dk; g.fill(); });
    shape(() => { g.beginPath(); g.moveTo(10.5, -13); g.lineTo(16, -11); g.lineTo(10.5, -9); g.closePath(); g.fillStyle = '#d9a23a'; g.fill(); });
    shape(() => { g.beginPath(); g.moveTo(-6, -5); g.quadraticCurveTo(3, -3, 1, 5); g.quadraticCurveTo(-5, 7, -9, 6); g.quadraticCurveTo(-9, -1, -6, -5); g.fillStyle = wing; g.fill(); });
    g.fillStyle = '#fff'; g.beginPath(); g.arc(7, -12.4, 1.5, 0, TAU); g.fill(); g.fillStyle = '#120c0c'; g.beginPath(); g.arc(7.3, -12.2, 1.05, 0, TAU); g.fill();
  } else {
    const wy = [-19, -6, 10][flap], wx = [-4, -9, -6][flap];
    g.beginPath(); g.moveTo(-3, -2); g.quadraticCurveTo(wx, wy * .6, wx - 7, wy); g.quadraticCurveTo(wx + 8, wy * .7, 5, -2); g.closePath(); line(); g.fillStyle = wing; g.fill();
    body(); line(); g.fillStyle = dk; g.fill();
    g.beginPath(); g.moveTo(-5, 4); g.quadraticCurveTo(3, 7, 9, 0); g.quadraticCurveTo(3, 2, -5, 4); g.fillStyle = belly; g.fill();
    g.beginPath(); g.moveTo(1, -2); g.quadraticCurveTo(wx + 4, wy * .5, wx + 2, wy * .85); g.quadraticCurveTo(wx + 12, wy * .55, 8, -2); g.closePath(); line(); g.fillStyle = wing; g.fill();
    g.fillStyle = '#120c0c'; g.beginPath(); g.arc(9, -5, 1, 0, TAU); g.fill();
  }
  g.restore();
}
// the one bird: flies in, lands on the moss at the sun-side shoulder, looks about, leaves when the ground shakes
function shoulderBird(g, t) {
  if (t < TL.birdIn || t > 6.4) return;
  const p = pose(t), [px, py] = toW(p, -112, -291 - p.lid);
  if (t < TL.birdLand) {
    const k = inv(TL.birdIn, TL.birdLand, t), e = ease.sine(k), x = lerp(px - 330, px, e), y = lerp(py - 150, py, e) - 46 * Math.sin(Math.PI * k);
    birdPose(g, x, y, 1.3, k > .88 ? 1 : Math.floor(t * 16) % 3, 1);
  } else if (t < TL.birdOff) {
    const hop = t > 3.55 && t < 3.75 ? 7 * Math.sin(Math.PI * inv(3.55, 3.75, t)) : 0, dir = (t > 2.6 && t < 3.55) ? -1 : 1, peck = (Math.floor(t * 6) % 7 === 2) ? 2 : 0;
    g.save(); g.translate(px, py - 4 - hop); g.rotate(dir * peck * .12); birdPose(g, 0, -3, 1.3, null, dir); g.restore();
  } else {
    const k = t - TL.birdOff;
    birdPose(g, px - 150 * k - 30 * k * k, py - 120 * k - 60 * k * k, 1.3, Math.floor(t * 18) % 3, -1);
  }
}
// the flock bursting from the treetops, small and far, among the trunks
const FLOCK = (() => { const R0 = rng(131), f = []; for (let i = 0; i < 22; i++) f.push({ x: 130 + R0() * 1060, y: 25 + R0() * 150, t0: TL.flock + R0() * R0() * .85, vx: (R0() - .35) * 170, vy: -150 - R0() * 130, s: .28 + R0() * .26, ph: Math.floor(R0() * 3) }); return f; })();
function flock(t) {
  for (const b of FLOCK) { const d = t - b.t0; if (d < 0 || d > 3.2) continue;
    const a = smooth(d / .25), x = b.x + b.vx * d, y = b.y + b.vy * d * a + 26 * Math.sin(d * 4 + b.ph);
    birdPose(X, x, y, b.s, (Math.floor(t * 14) + b.ph) % 3, b.vx < 0 ? -1 : 1, { dk: '#46423f', wing: '#5b5650', belly: '#9d9484', lw: 1 }); }
}
// leaves: a few from the start, many once it shakes; they spiral down and light up inside a beam
const LEAVES = (() => { const R0 = rng(141), l = []; const cols = ['#b9cf52', '#d9c95a', '#8fb83a', '#c8732f', '#e0b84a', '#a9c93c'];
  for (let i = 0; i < 90; i++) { const late = i > 12; l.push({ t0: late ? 5 + R0() * 9.5 : -3 + R0() * 16, x: 60 + R0() * 1180, y0: 8 + R0() * 120, v: 80 + R0() * 80, a: 16 + R0() * 34, w: 1.4 + R0() * 1.6, ph: R0() * TAU, s: 3.2 + R0() * 3.4, c: hex(cols[i % 6]), fl: 2 + R0() * 3 }); } return l; })();
function leaves(t, L) {
  for (const l of LEAVES) { const d = t - l.t0; if (d < 0) continue; const y = l.y0 + l.v * d; if (y > 680) continue;
    const x = l.x + l.a * Math.sin(l.w * d + l.ph) + 7 * d, f = Math.cos(l.fl * d + l.ph), lit = clamp(shaftField(x, y, t) * 1.2) * L;
    X.save(); X.translate(x, y); X.rotate(l.ph + 1.2 * Math.sin(l.w * d)); X.scale(1, Math.max(.16, Math.abs(f)));
    X.fillStyle = css(mixc(mixc(l.c, [40, 70, 60], f < 0 ? .3 : 0), [255, 244, 190], lit * .55)); X.beginPath(); X.moveTo(-l.s, 0); X.quadraticCurveTo(0, -l.s * .62, l.s, 0); X.quadraticCurveTo(0, l.s * .62, -l.s, 0); X.fill(); X.restore(); }
}
// soil, roots and moss bits pouring off in streams from the shelf ends, the lid corners and the foot of the cabinet
const SPOUTS = [[-170, -112], [172, -110], [-176, -250], [214, -236], [-120, -4], [40, -2], [130, -4]];
const SOIL = (() => { const R0 = rng(151), s = [], cols = ['#3a2a20', '#4e3726', '#2c211b', '#5e4630', '#4c7434', '#6d5238'];
  for (let i = 0; i < 900; i++) { const k = Math.floor(R0() * SPOUTS.length), late = R0() < .12;
    s.push({ k, t0: late ? (R0() < .5 ? 10.92 : 12.58) + R0() * .25 : 5.1 + Math.pow(R0(), 1.3) * 4.2, dx: (R0() - .5) * 30, dy: (R0() - .5) * 7, vx: (R0() - .5) * 26 + Math.sign(SPOUTS[k][0]) * 7, r: .9 + R0() * R0() * 3.1, c: hex(cols[i % 6]), yF: FLOOR + 2 + R0() * 18 }); }
  return s; })();
function soil(g, t) {
  for (const s of SOIL) { const d = t - s.t0; if (d < 0) continue;
    const p0 = pose(s.t0), [x0, y0] = toW(p0, SPOUTS[s.k][0] + s.dx, SPOUTS[s.k][1] + s.dy), y = y0 + 380 * d * d, land = y >= s.yF;
    if (land && d > Math.sqrt((s.yF - y0) / 380) + 1.4) { /* it has settled: a grain of the ground from here on */ }
    const dl = land ? Math.sqrt(Math.max(0, s.yF - y0) / 380) : d, x = x0 + s.vx * dl, yy = land ? s.yF : y, st = land ? 1 : 1 + Math.min(3.2, 760 * d / 240);
    g.fillStyle = css(s.c); g.beginPath(); g.ellipse(x, yy - (st - 1) * s.r, s.r * (land ? 1.5 : 1), s.r * (land ? .6 : st), 0, 0, TAU); g.fill(); }
  // dust where the streams hit the ground
  const k = smooth(inv(5.3, 6, t)) * (1 - smooth(inv(9, 10.2, t)));
  if (k > .01) { const p = pose(t); for (let i = 0; i < SPOUTS.length; i++) { const [x] = toW(p, SPOUTS[i][0], 0), r = 40 + 16 * Math.sin(t * 2 + i), yy = FLOOR + 6 - 8 * Math.sin(t * 1.3 + i);
    const rg = g.createRadialGradient(x, yy, 0, x, yy, r); rg.addColorStop(0, css(hex('#c9b48c'), .4 * k)); rg.addColorStop(1, css(hex('#c9b48c'), 0)); g.fillStyle = rg; g.fillRect(x - r, yy - r, 2 * r, 2 * r); } }
}
