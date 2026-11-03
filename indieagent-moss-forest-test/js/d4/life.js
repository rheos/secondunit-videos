// d4 life: everything around the giant, drawn flat over the 3D render. All pure functions of t.
const TL = { birdIn: 3.75, birdLand: 4.45, birdOff: 9.35, ray0: 4.9, ray1: 5.7, flock: 9.4 };
function glowK(t) { const pulse = (c, w, a) => a * Math.exp(-Math.pow((t - c) / w, 2)); return clamp(pulse(6.75, .08, .35) + pulse(7.05, .07, .5) + pulse(7.4, .09, .7) + smooth(inv(7.6, 8.5, t)) * (1 - .2 * smooth(inv(11, 13, t)) + .08 * Math.sin(t * 1.7))); }
const rayK = (t) => smooth(inv(TL.ray0, TL.ray1, t));
const BIRD = { dk: '#6e4f36', wing: '#54402f', belly: '#c9602f', lw: .9 };
function birdPose(g, x, y, s, flap, dir, o = {}) {
  const dk = o.dk || '#3a2c2a', belly = o.belly || '#e9dcc0', wing = o.wing || '#54403a';
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  const line = () => { g.lineWidth = (o.lw || 1.6) / Math.max(1, s * .55); g.strokeStyle = 'rgba(30,20,20,.75)'; g.lineJoin = 'round'; g.stroke(); };
  const body = () => { g.beginPath(); g.moveTo(-12, 1); g.quadraticCurveTo(-5, -7, 5, -5); g.quadraticCurveTo(9, -9, 12, -4); g.lineTo(16, -3); g.lineTo(12, -1); g.quadraticCurveTo(8, 6, -2, 5); g.quadraticCurveTo(-8, 5, -18, 3); g.closePath(); };
  if (flap === null) { // perched: upright, a round body, a head, a beak, a tail; feet at y 0
    g.translate(0, -12);
    const shape = (f) => { f(); g.lineWidth = (o.lw || 1.8) / Math.max(1, s * .55); g.strokeStyle = 'rgba(30,20,20,.8)'; g.lineJoin = 'round'; g.stroke(); };
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

// the bird, sized from the camera so it stays one small animal in every shot
function bird(cam, parts, t) {
  if (t < TL.birdIn || t > 11) return;
  const [px, py, s] = project(cam, M.apply(parts[P_LID], [-1.15, .62, .5])), sc = s * .0125;
  if (t < TL.birdLand) { const k = inv(TL.birdIn, TL.birdLand, t), e = ease.sine(k); birdPose(X, lerp(px + 620, px, e), lerp(py - 300, py - 6, e) - 60 * Math.sin(Math.PI * k), sc, k > .86 ? 1 : Math.floor(t * 16) % 3, -1, BIRD); }
  else if (t < TL.birdOff) { const hop = t > 5.75 && t < 5.95 ? 22 * sc * Math.sin(Math.PI * inv(5.75, 5.95, t)) : 0, dir = (t > 5.0 && t < 5.75) ? 1 : -1; birdPose(X, px, py - hop, sc, null, dir, BIRD); }
  else { const k = t - TL.birdOff; birdPose(X, px - 200 * k - 60 * k * k, py - 150 * k - 70 * k * k, sc, Math.floor(t * 18) % 3, -1, BIRD); }
}
const FLOCK = (() => { const R0 = rng(131), f = []; for (let i = 0; i < 24; i++) f.push({ x: 90 + R0() * 1110, y: 25 + R0() * 120, t0: TL.flock + R0() * R0() * .9, vx: (R0() - .35) * 180, vy: -130 - R0() * 120, s: .34 + R0() * .3, ph: Math.floor(R0() * 3) }); return f; })();
function flock(t) { for (const b of FLOCK) { const d = t - b.t0; if (d < 0 || d > 3) continue; const a = smooth(d / .25), x = b.x + b.vx * d, y = b.y + b.vy * d * a + 22 * Math.sin(d * 4 + b.ph); birdPose(X, x, y, b.s, (Math.floor(t * 12) + b.ph) % 3, b.vx < 0 ? -1 : 1, { dk: '#2c3a38', wing: '#22302f', belly: '#6c7a6c', lw: 1 }); } }
const LEAVES = (() => { const R0 = rng(141), l = [], cols = ['#b9cf52', '#d9c95a', '#7fa83e', '#c8732f', '#e0b84a', '#3f823e']; for (let i = 0; i < 90; i++) { const late = i > 10; l.push({ t0: late ? 9.3 + R0() * 5.5 : R0() * 15 - 2, x: 40 + R0() * 1200, y0: 10 + R0() * 110, v: 70 + R0() * 80, a: 16 + R0() * 34, w: 1.4 + R0() * 1.6, ph: R0() * TAU, s: 3.4 + R0() * 3.6, c: hex(cols[i % 6]), fl: 2 + R0() * 3 }); } return l; })();
function leaves(t) { for (const l of LEAVES) { const d = t - l.t0; if (d < 0) continue; const y = l.y0 + l.v * d; if (y > 660) continue; const x = l.x + l.a * Math.sin(l.w * d + l.ph) + 6 * d, f = Math.cos(l.fl * d + l.ph); X.save(); X.translate(x, y); X.rotate(l.ph + 1.2 * Math.sin(l.w * d)); X.scale(1, Math.max(.16, Math.abs(f))); X.fillStyle = css(mixc(l.c, [20, 50, 46], f < 0 ? .35 : 0)); X.beginPath(); X.moveTo(-l.s, 0); X.quadraticCurveTo(0, -l.s * .62, l.s, 0); X.quadraticCurveTo(0, l.s * .62, -l.s, 0); X.fill(); X.strokeStyle = 'rgba(20,30,28,.55)'; X.lineWidth = .7; X.stroke(); X.restore(); } }
// soil and root bits pouring off in streams from the shelf ends, the lid corners and the foot of the cabinet
const SPOUTS = [[-1.45, 1.1, .85], [1.45, 1.1, .85], [-1.55, 2.6, .5], [1.5, 2.6, .5], [-.9, .02, .4], [.2, .02, .45], [1.0, .02, .4], [0, 2.7, .75]];
const SOIL = (() => { const R0 = rng(151), s = [], cols = ['#2c211b', '#3a2a20', '#4e3726', '#5e4630', '#2f5a3a', '#6d5238']; for (let i = 0; i < 620; i++) { const k = Math.floor(R0() * SPOUTS.length), late = R0() < .12; s.push({ k, t0: late ? (R0() < .5 ? 320 / 24 : 342 / 24) + R0() * .25 : 9.6 + Math.pow(R0(), 1.3) * 3.2, dx: (R0() - .5) * .34, dz: (R0() - .5) * .2, vx: (R0() - .5) * .5, r: 1 + R0() * R0() * 3.6, c: hex(cols[i % 6]), rot: R0() * TAU, yF: R0() * .04 }); } return s; })();
function soil(cam, t) { for (const s of SOIL) { const d = t - s.t0; if (d < 0) continue; const b = poseG(s.t0).body, [sx, sy, sz] = SPOUTS[s.k], W0 = M.apply(b, [sx + s.dx, sy, sz + s.dz]), tl = Math.sqrt(Math.max(.01, W0[1] - s.yF) / 4.9), dd = Math.min(d, tl), [x, y, q] = project(cam, [W0[0] + s.vx * dd, W0[1] - 4.9 * dd * dd, W0[2]]), r = s.r * q / 70; X.save(); X.translate(x, y); X.rotate(s.rot + d * 3); X.fillStyle = css(s.c); X.beginPath(); X.moveTo(-r, -r * .6); X.lineTo(r * .7, -r); X.lineTo(r, r * .5); X.lineTo(-r * .4, r * .8); X.closePath(); X.fill(); X.restore(); } }
// flat cel dust: a union of circles in two tones with a hard edge, no transparency; it grows, then eats itself away
function dustCloud(cam, wx, wz, k, seed, size) {
  if (k <= 0 || k >= 1) return; const [cx, cy, q] = project(cam, [wx, 0, wz]), m = size * q, grow = ease.out(k), gone = smooth(inv(.5, 1, k));
  for (const [tone, oy, sc] of [['#b9987a', 0, 1], ['#dcc29c', -.1, .72]]) { X.fillStyle = tone; X.beginPath(); for (let i = 0; i < 12; i++) { const a = h2(i, 1, seed) * TAU, rr = (.25 + h2(i, 2, seed) * .75) * m * grow, x = cx + Math.cos(a) * rr * 1.35, y = cy + Math.abs(Math.sin(a)) * -rr * .55 + oy * m, r = m * (.16 + h2(i, 3, seed) * .24) * (.4 + .6 * grow) * (1 - gone) * sc; if (r > 0) { X.moveTo(x + r, y); X.arc(x, y, r, 0, TAU); } } X.fill(); }
}
