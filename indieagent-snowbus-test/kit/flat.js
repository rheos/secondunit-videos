// inked3d kit, the flat layer: what is drawn in 2D over the model render. Cameras and projection, a cel bird in
// whole poses, flat hard-edged dust, and the film grain tiles.
function camera(c, near = .5, far = 80) { const P = M.persp(c.fov, W / H, near, far), V = M.look(c.eye, c.at); return { P, V, VP: M.mul(P, V) }; }
// world point -> [x, y] in canvas pixels, and pixels per metre at that depth
function project(cam, w) { const m = cam.VP, x = m[0] * w[0] + m[4] * w[1] + m[8] * w[2] + m[12], y = m[1] * w[0] + m[5] * w[1] + m[9] * w[2] + m[13], c = m[3] * w[0] + m[7] * w[1] + m[11] * w[2] + m[15]; return [(x / c * .5 + .5) * W, (.5 - y / c * .5) * H, cam.P[5] * (H / 2) / c]; }
// a small bird as whole drawings: flap 0 wings up, 1 level, 2 down, null perched (feet at y 0); dir 1 faces right.
// o: { dk, wing, belly, lw }
function birdPose(g, x, y, s, flap, dir, o = {}) {
  const dk = o.dk || '#3a2c2a', belly = o.belly || '#e9dcc0', wing = o.wing || '#54403a';
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  const line = () => { g.lineWidth = (o.lw || 1.6) / Math.max(1, s * .55); g.strokeStyle = 'rgba(30,20,20,.75)'; g.lineJoin = 'round'; g.stroke(); };
  const body = () => { g.beginPath(); g.moveTo(-12, 1); g.quadraticCurveTo(-5, -7, 5, -5); g.quadraticCurveTo(9, -9, 12, -4); g.lineTo(16, -3); g.lineTo(12, -1); g.quadraticCurveTo(8, 6, -2, 5); g.quadraticCurveTo(-8, 5, -18, 3); g.closePath(); };
  if (flap === null) {
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
// flat cel dust: a union of circles in two tones with a hard edge, no transparency; grows, then eats itself away.
// k 0..1 over its life; size in metres; tones [back, front] (default warm dust)
function dustCloud(g, cam, wx, wz, k, seed, size, tones = ['#b9987a', '#dcc29c']) {
  if (k <= 0 || k >= 1) return; const [cx, cy, q] = project(cam, [wx, 0, wz]), m = size * q, grow = ease.out(k), gone = smooth(inv(.5, 1, k));
  for (const [tone, oy, sc] of [[tones[0], 0, 1], [tones[1], -.1, .72]]) { g.fillStyle = tone; g.beginPath(); for (let i = 0; i < 12; i++) { const a = h2(i, 1, seed) * TAU, rr = (.25 + h2(i, 2, seed) * .75) * m * grow, x = cx + Math.cos(a) * rr * 1.35, y = cy + Math.abs(Math.sin(a)) * -rr * .55 + oy * m, r = m * (.16 + h2(i, 3, seed) * .24) * (.4 + .6 * grow) * (1 - gone) * sc; if (r > 0) { g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); } } g.fill(); }
}
// film grain: six fixed tiles; draw TILES[(Math.floor(f / 2) * 7) % 6] over the frame as overlay at .055
function makeGrainTiles() { const a = []; for (let k = 0; k < 6; k++) { const c = canvas(256, 139), g = c.getContext('2d'), d = g.createImageData(256, 139); for (let i = 0; i < 256 * 139; i++) { const q = 128 + (h2(i, k, 301) - .5) * 190; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = q; d.data[i * 4 + 3] = 255; } g.putImageData(d, 0, 0); a.push(c); } return a; }
function drawGrain(g, tiles, f, alpha = .055) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'overlay'; g.globalAlpha = alpha; g.drawImage(tiles[(Math.floor(f / 2) * 7) % 6], 0, 0, W, H); g.restore(); }
