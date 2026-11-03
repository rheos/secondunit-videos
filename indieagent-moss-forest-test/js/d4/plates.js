// d4 plates: flat tones with hard wet edges, hatched foliage, no gaussian blur. Baked once, each frame slides them.
const PX = 180, PY = 40, PLW = W + 2 * PX, PLH = H + 2 * PY;
const H4 = (...a) => a.map(hex);
function plateCanvas() { const c = canvas(PLW, PLH), g = c.getContext('2d'); g.translate(PX, PY); return [c, g]; }
// paint per pixel from a function returning [r,g,b,a] or null; used for washes with hard edges
function wash(g, x0, y0, x1, y1, fn) {
  const w = x1 - x0, h = y1 - y0, d = g.createImageData(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const c = fn(x0 + i, y0 + j); if (!c) continue; const o = (j * w + i) * 4; d.data[o] = c[0]; d.data[o + 1] = c[1]; d.data[o + 2] = c[2]; d.data[o + 3] = c[3] === undefined ? 255 : c[3]; }
  const t = canvas(w, h); t.getContext('2d').putImageData(d, 0, 0); g.drawImage(t, x0, y0);
}
// dry-brush hatching: a clump of short parallel strokes, flat tones, dark first
function hatch(g, cx, cy, R, pal, R0, o = {}) {
  const n = Math.round(18 + R * R * (o.dens || .09) * 2.6), s = [], ang = o.ang ?? -.9, sq = o.sq || .72;
  for (let i = 0; i < n; i++) { const a = R0() * TAU, r = Math.sqrt(R0()); if (r > .62 + .5 * vn2(Math.cos(a) * 1.7 + cx * .04, Math.sin(a) * 1.7 + cy * .04, 31)) continue; const nx = Math.cos(a) * r, ny = Math.sin(a) * r; const v = .36 - .42 * ny + .22 * nx * (o.lx ?? .5) + (fbm2((cx + nx * R) * .05, (cy + ny * R * sq) * .05, o.seed || 5) - .5) * .85; s.push([cx + nx * R, cy + ny * R * sq, clamp(v + (o.lift || 0))]); }
  s.sort((a, b) => a[2] - b[2]); g.lineCap = 'butt';
  for (const [x, y, v] of s) { const i = Math.min(pal.length - 1, Math.floor(v * pal.length)), L = Math.min(11, R * (.07 + R0() * .1)) + 2.4, a = ang + (R0() - .5) * .6, dx = Math.cos(a) * L, dy = Math.sin(a) * L, wd = Math.min(2.6, R * (.02 + R0() * .03)) + .7; g.strokeStyle = css(pal[i]);
    for (let k = 0; k < 3; k++) { const off = (k - 1) * wd * .95, px = -Math.sin(a) * off, py = Math.cos(a) * off, t0 = R0() * .22, t1 = 1 - R0() * .22; g.lineWidth = wd * (.55 + R0() * .55); g.beginPath(); g.moveTo(x - dx * t1 + px, y - dy * t1 + py); g.lineTo(x + dx * (1 - t0) + px, y + dy * (1 - t0) + py); g.stroke(); } }
}
// a bark trunk: flat tones, ragged dark edge on the shade side, ivy climbing it in hatch
function barkTrunk(g, x, y0, y1, w, lean, tones, R0, o = {}) {
  const N = 30, xAt = (y) => x + lean * (y1 - y) + (vn2(y * .008, x, 41) - .5) * w * .22, wAt = (y) => w * (.74 + .26 * inv(y0, y1, y)) * (1 + .75 * Math.pow(inv(y1 - 90, y1, y), 2));
  const side = (s) => { const pts = []; for (let i = 0; i <= N * 3; i++) { const y = lerp(y0, y1, i / (N * 3)); pts.push([xAt(y) + s * wAt(y) / 2 + (vn2(y * .09, x + s, 43) - .5) * (o.rag || 3.4), y]); } return pts; };
  const L = side(-1), Rr = side(1), P = new Path2D(); L.forEach((q, i) => (i ? P.lineTo : P.moveTo).call(P, q[0], q[1])); Rr.slice().reverse().forEach((q) => P.lineTo(q[0], q[1])); P.closePath();
  g.save(); g.fillStyle = css(tones[1]); g.fill(P); g.clip(P);
  const n = Math.round((y1 - y0) * w / 22); for (let i = 0; i < n; i++) { const y = lerp(y0, y1, R0()), u = R0() - .5, cx = xAt(y) + u * wAt(y), v = fbm2(cx * .05, y * .012, 47) + u * (o.litSide || .7), t = v < .42 ? tones[0] : v < .62 ? tones[1] : tones[2], len = 8 + R0() * 26; g.strokeStyle = css(t); g.lineWidth = 1.4 + R0() * w * .05; g.beginPath(); g.moveTo(cx, y); g.lineTo(cx + (R0() - .5) * 2.5, y + len); g.stroke(); }
  // the dark ragged side
  const shadeX = (o.litSide || .7) > 0 ? -1 : 1; g.fillStyle = css(tones[0]); for (let i = 0; i < 90; i++) { const y = lerp(y0, y1, i / 90); g.fillRect(xAt(y) + shadeX * wAt(y) * .5 - (shadeX > 0 ? wAt(y) * (.14 + .1 * vn2(y * .05, x, 49)) : 0), y, wAt(y) * (.14 + .1 * vn2(y * .05, x, 49)), (y1 - y0) / 88); }
  g.restore();
  if (o.ivy) { const pal = o.ivyPal || PAL4.ivy; for (let i = 0; i < o.ivy; i++) { const y = lerp(y0 + (y1 - y0) * .2, y1, Math.pow(R0(), .7)); hatch(g, xAt(y) + (R0() - .5) * wAt(y) * .85, y, 4 + R0() * (w * .08 + 4), pal, R0, { dens: .5, ang: -1.2, sq: 1.7, seed: 53 }); } }
  // ink: one broken line down each edge
  g.strokeStyle = o.ink || 'rgba(14,20,24,.8)'; g.lineWidth = 1.3; for (const pts of [L, Rr]) { let on = false; g.beginPath(); pts.forEach((q, i) => { const k = vn2(i * .13, x, 51) > .36; if (k && !on) g.moveTo(q[0], q[1]); else if (k) g.lineTo(q[0], q[1]); on = k; }); g.stroke(); }
}
// a hanging frond of paired leaves
function frondLeaves(g, x, y, len, sw, tones, R0) {
  const n = Math.round(len / 11), leaf = (lx, ly, a, s, t) => { g.fillStyle = css(t); g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(lx + Math.cos(a - .5) * s * .6, ly + Math.sin(a - .5) * s * .6, lx + Math.cos(a) * s, ly + Math.sin(a) * s); g.quadraticCurveTo(lx + Math.cos(a + .5) * s * .6, ly + Math.sin(a + .5) * s * .6, lx, ly); g.fill(); };
  for (let i = 0; i < n; i++) { const k = i / n, cx = x + sw * k * k, cy = y + len * k, s = lerp(17, 8, k) * (.85 + R0() * .35), t = tones[Math.floor(R0() * R0() * tones.length)]; leaf(cx, cy, 1.05 + (R0() - .5) * .25, s, t); leaf(cx, cy, Math.PI - 1.05 + (R0() - .5) * .25, s, t); }
}
const PAL4 = {
  far: H4('#3f7468', '#5f9080', '#86ae90', '#b4c8a0', '#dcdfb8'),
  near: H4('#0b332c', '#123f36', '#1f5a3c', '#3a7a3c', '#7fa43e', '#bcc956'),
  ivy: H4('#123f36', '#1f5f40', '#3d8040', '#7da240'),
  vine: H4('#0d3430', '#154a3e', '#1f5f48', '#5a8c3e'),
  meadow: H4('#1b4c38', '#2e693c', '#4f8a3c', '#88a846', '#c2c460', '#e6d67c'),
};
// the back plate: sky with flat cloud bands, far forest washes with hard edges, flat mist, mid trunks, meadow
function bakeBack() {
  const [c, g] = plateCanvas(), R0 = rng(71), hz = 548;
  wash(g, -PX, -PY, W + PX, hz + 30, (x, y) => {
    const k = clamp((y + 40) / 560), top = [150, 196, 208], mid = [246, 226, 178], low = [250, 222, 164]; let col = k < .42 ? mixc(top, mid, smooth(k / .42)) : mixc(mid, low, (k - .42) / .58);
    const sun = Math.exp(-Math.pow(Math.hypot(x - 760, y - 250) / 260, 2)); col = mixc(col, [255, 243, 206], sun * .75);
    const band = (cy, h, s) => { const n = fbm2(x * .0058 + s, y * .03 + s, 61), w = h * Math.max(0, n * 2.5 - .92); return Math.abs(y - cy - (n - .5) * 34) < w * .5; };
    for (const [cy, h, s] of [[34, 40, 1], [86, 46, 5], [148, 34, 9], [196, 22, 13]]) if (band(cy, h, s)) { const under = fbm2(x * .018, y * .06, s + 3) < .42; col = under ? [226, 176, 166] : [250, 216, 182]; }
    return col; });
  // far forest: pale tree masses, painted in the same hatching as the near leaves, opening around the sun
  { const R2 = rng(72); for (let i = 0; i < 620; i++) { const x = lerp(-PX, W + PX, R2()), sunK = Math.exp(-Math.pow((x - 760) / 300, 2)), top = 70 + 150 * fbm2(x * .004, 3.1, 63) + 190 * sunK, y = lerp(top, hz - 40, Math.pow(R2(), 1.25)); if (R2() < sunK * .6) continue; hatch(g, x, y, 34 + R2() * 52, PAL4.far, R2, { dens: .05, seed: 63, ang: -1, lift: .18 * sunK, lx: x < 760 ? .8 : -.8 }); } }
  // mist: flat cream bands with torn edges
  for (const [yc, hh, col, s] of [[420, 90, [248, 232, 190], 81], [500, 110, [250, 236, 198], 83]]) wash(g, -PX, yc - hh, W + PX, yc + hh, (x, y) => { const e = (fbm2(x * .007 + s, y * .03, s) - .5) * 2 + (fbm2(x * .03, y * .07, s + 1) - .5) * .5, k = 1 - Math.abs(y - yc) / hh; return k + e * 1.25 > .55 ? col.concat(255) : null; });
  // mid trunks, pale with the distance, leaves high up
  const R1 = rng(88); const mids = [-120, -38, 60, 150, 248, 330, 420, 1010, 1060, 1120, 1190, 1290, 1370];
  mids.forEach((x, i) => { const w = 15 + R1() * 22, far = i % 3 === 0; const t = far ? H4('#94aa98', '#b5c4ac', '#d0d6ba') : H4('#3f4c40', '#6d7560', '#a09a78'); barkTrunk(g, x, -PY, hz - 2 + R1() * 26, w, (R1() - .5) * .025, t, R1, { ivy: far ? 0 : 7, ivyPal: H4('#2e6a54', '#4d8a56', '#88a85a'), rag: 2.2, litSide: x < 700 ? .7 : -.7, ink: far ? 'rgba(60,80,76,.3)' : 'rgba(14,20,24,.6)' }); });
  // meadow: horizontal hatch, gold on the sun's path, a dark rim of clover along its back edge, white flowers
  wash(g, -PX, hz, W + PX, H + PY, (x, y) => { const k = (y - hz) / 210, n = fbm2(x * .006, y * .05, 91), sun = Math.exp(-Math.pow((x - 700 - 80 * n) / 300, 2)) * Math.exp(-Math.pow((y - 610) / 62, 2)); const v = .18 + 1.0 * sun + (n - .5) * .55 - k * .08; return PAL4.meadow[Math.min(5, Math.floor(clamp(v) * 6))].concat(255); });
  for (let i = 0; i < 5200; i++) { const x = lerp(-PX, W + PX, R0()), y = hz + Math.pow(R0(), 1.25) * 190, s = Math.exp(-Math.pow((x - 700) / 320, 2)) * Math.exp(-Math.pow((y - 610) / 66, 2)); const v = .16 + s * .92 + (fbm2(x * .01, y * .06, 92) - .5) * .5 + (R0() - .5) * .18; g.strokeStyle = css(PAL4.meadow[Math.min(5, Math.floor(clamp(v) * 6))]); g.lineWidth = 1 + R0() * 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R0() - .5) * 5, y - 3 - R0() * 8); g.stroke(); }
  for (let i = 0; i < 130; i++) { const x = lerp(-PX, W + PX, R0()), yb = hz + (R0() - .5) * 6 - 2; for (let k = 0; k < 7; k++) { const a = R0() * TAU, r = R0() * 16; g.fillStyle = css(R0() < .7 ? [14, 58, 48] : [28, 88, 60]); g.beginPath(); g.ellipse(x + Math.cos(a) * r, yb + Math.sin(a) * r * .28, 3.4 + R0() * 2.4, 2 + R0() * 1.6, R0(), 0, TAU); g.fill(); } }
  for (let i = 0; i < 14; i++) hatch(g, lerp(-PX, W + PX, R0()), hz + 2, 22 + R0() * 26, PAL4.ivy, R0, { sq: .55, dens: .16, seed: 94 });
  for (let i = 0; i < 620; i++) { const x = lerp(-PX, W + PX, R0()), y = hz + 10 + R0() * 150; g.fillStyle = R0() < .86 ? '#f8f4e2' : '#d8c8ea'; g.beginPath(); g.arc(x, y, .8 + R0() * 1.1, 0, TAU); g.fill(); }
  return c;
}
// the front plate: near trunks, canopy, hanging fronds, the big dark grass silhouette
function bakeFront() {
  const [c, g] = plateCanvas(), R0 = rng(101);
  const tn = H4('#0f0d0c', '#2e2a22', '#5c4a34');
  [[34, 118, -.015], [212, 52, .012], [1130, 44, -.01], [1258, 104, .018]].forEach(([x, w, l]) => barkTrunk(g, x, -PY, H - 8, w, l, tn, R0, { ivy: Math.round(w * .34), rag: 5, litSide: x < 640 ? .75 : -.75 }));
  const cy = (x) => 18 + 170 * Math.pow(Math.max(0, 1 - (x + 90) / 450), 1.4) + 170 * Math.pow(Math.max(0, (x - 930) / 480), 1.4);
  for (let x = -PX; x < W + PX; x += 15) { const y = cy(x), big = y > 40; for (let k = 0; k < (big ? 4 : 2); k++) hatch(g, x + (R0() - .5) * 22, y - R0() * (big ? y + 20 : 34) + 6, (big ? 32 : 17) + R0() * (big ? 30 : 15), PAL4.near, R0, { dens: .12, seed: 103, lx: x < 640 ? .7 : -.7 }); }
  for (let i = 0; i < 46; i++) { const side = i < 18 ? lerp(-90, 330, R0()) : i < 36 ? lerp(950, 1380, R0()) : lerp(330, 950, R0()); frondLeaves(g, side, cy(side) - 12 + R0() * 8, (side > 330 && side < 950 ? 44 + R0() * 60 : 80 + R0() * 150), (R0() - .5) * 12, PAL4.vine, R0); }
  // grass: big dark blades, hard, overlapping; solid at the very bottom
  g.fillStyle = '#082828'; g.fillRect(-PX, 668, PLW, 120);
  for (let i = 0; i < 1500; i++) { const x = lerp(-PX, W + PX, R0()), base = 690 + R0() * 60, h = 42 + R0() * 74, lean = (R0() - .5) * .75, wd = 3 + R0() * 5, tx = x + Math.sin(lean) * h, ty = base - Math.cos(lean) * h, mx = x + Math.sin(lean) * h * .3; g.fillStyle = css(R0() < .72 ? hex('#082828') : R0() < .78 ? hex('#113a36') : hex('#1a4c40')); g.beginPath(); g.moveTo(x - wd, base); g.quadraticCurveTo(mx - wd * .5, base - h * .55, tx, ty); g.quadraticCurveTo(mx + wd * .6, base - h * .55, x + wd, base); g.fill(); }
  return c;
}
