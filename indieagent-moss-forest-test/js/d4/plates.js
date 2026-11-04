// d4 plates: the forest at sunrise, painted with the kit's plate tools. Baked once, each frame slides them.
const PAL4 = {
  far: H4('#2f6658', '#4a8070', '#6e9e84', '#9cba92', '#cfd6a8'),
  near: H4('#0b332c', '#123f36', '#1f5a3c', '#3a7a3c', '#7fa43e', '#bcc956'),
  ivy: H4('#123f36', '#1f5f40', '#3d8040', '#7da240'),
  vine: H4('#0d3430', '#154a3e', '#1f5f48', '#5a8c3e'),
  meadow: H4('#1b4c38', '#2e693c', '#4f8a3c', '#88a846', '#c2c460', '#e6d67c'),
};
// the back plate: sky with flat cloud bands, far forest in hatch, flat mist, mid trunks, a sunlit meadow
function bakeBack() {
  const [c, g] = plateCanvas(), R0 = rng(71), hz = 548;
  wash(g, -PX, -PY, W + PX, hz + 30, (x, y) => {
    const k = clamp((y + 40) / 560), top = [132, 182, 198], mid = [246, 214, 150], low = [250, 204, 134]; let col = k < .42 ? mixc(top, mid, smooth(k / .42)) : mixc(mid, low, (k - .42) / .58);
    const sun = Math.exp(-Math.pow(Math.hypot(x - 760, y - 250) / 260, 2)); col = mixc(col, [255, 243, 206], sun * .75);
    const band = (cy, h, s) => { const n = fbm2(x * .0058 + s, y * .03 + s, 61), w = h * Math.max(0, n * 2.5 - .92); return Math.abs(y - cy - (n - .5) * 34) < w * .5; };
    for (const [cy, h, s] of [[34, 40, 1], [86, 46, 5], [148, 34, 9], [196, 22, 13]]) if (band(cy, h, s)) { const under = fbm2(x * .018, y * .06, s + 3) < .42; col = under ? [226, 176, 166] : [250, 216, 182]; }
    return col; });
  { const R2 = rng(72); for (let i = 0; i < 620; i++) { const x = lerp(-PX, W + PX, R2()), sunK = Math.exp(-Math.pow((x - 760) / 300, 2)), top = 70 + 150 * fbm2(x * .004, 3.1, 63) + 190 * sunK, y = lerp(top, hz - 40, Math.pow(R2(), 1.25)); if (R2() < sunK * .6) continue; hatch(g, x, y, 34 + R2() * 52, PAL4.far, R2, { dens: .05, seed: 63, ang: -1, lift: .18 * sunK, lx: x < 760 ? .8 : -.8 }); } }
  for (const [yc, hh, col, s] of [[420, 90, [248, 232, 190], 81], [500, 110, [250, 236, 198], 83]]) wash(g, -PX, yc - hh, W + PX, yc + hh, (x, y) => { const e = (fbm2(x * .007 + s, y * .03, s) - .5) * 2 + (fbm2(x * .03, y * .07, s + 1) - .5) * .5, k = 1 - Math.abs(y - yc) / hh; return k + e * 1.25 > .55 ? col.concat(255) : null; });
  const R1 = rng(88); const mids = [-120, -38, 60, 150, 248, 330, 420, 1010, 1060, 1120, 1190, 1290, 1370];
  mids.forEach((x, i) => { const w = 15 + R1() * 22, far = i % 3 === 0; const t = far ? H4('#6d8878', '#92a892', '#b8c4a4') : H4('#1f2a26', '#46503f', '#7c7a58'); barkTrunk(g, x, -PY, hz - 2 + R1() * 26, w, (R1() - .5) * .05, t, R1, { ivy: far ? 0 : 9, ivyPal: H4('#2e6a54', '#4d8a56', '#88a85a'), rag: 2.2, litSide: x < 700 ? .7 : -.7, ink: far ? 'rgba(60,80,76,.3)' : 'rgba(14,20,24,.6)' }); });
  { const gy = g.createLinearGradient(0, 400, 0, hz + 4); gy.addColorStop(0, 'rgba(250,234,194,0)'); gy.addColorStop(.75, 'rgba(250,234,194,.42)'); gy.addColorStop(1, 'rgba(250,234,194,.7)'); g.fillStyle = gy; g.fillRect(-PX, 400, PLW, hz + 4 - 400);
    const rg = g.createRadialGradient(760, 250, 0, 760, 250, 520); rg.addColorStop(0, 'rgba(255,238,190,.85)'); rg.addColorStop(.3, 'rgba(255,214,140,.3)'); rg.addColorStop(1, 'rgba(255,214,140,0)'); g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rg; g.fillRect(-PX, -PY, PLW, hz + PY); g.restore(); }
  wash(g, -PX, hz, W + PX, H + PY, (x, y) => { const k = (y - hz) / 210, n = fbm2(x * .006, y * .05, 91), sun = Math.exp(-Math.pow((x - 700 - 80 * n) / 300, 2)) * Math.exp(-Math.pow((y - 610) / 62, 2)); const v = .08 + .95 * sun + (n - .5) * .5 - k * .1; return PAL4.meadow[Math.min(5, Math.floor(clamp(v) * 6))].concat(255); });
  for (let i = 0; i < 5200; i++) { const x = lerp(-PX, W + PX, R0()), y = hz + Math.pow(R0(), 1.25) * 190, s = Math.exp(-Math.pow((x - 700) / 320, 2)) * Math.exp(-Math.pow((y - 610) / 66, 2)); const v = .07 + s * .9 + (fbm2(x * .01, y * .06, 92) - .5) * .45 + (R0() - .5) * .18; g.strokeStyle = css(PAL4.meadow[Math.min(5, Math.floor(clamp(v) * 6))]); g.lineWidth = 1 + R0() * 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R0() - .5) * 5, y - 3 - R0() * 8); g.stroke(); }
  for (let i = 0; i < 130; i++) { const x = lerp(-PX, W + PX, R0()), yb = hz + (R0() - .5) * 6 - 2; for (let k = 0; k < 7; k++) { const a = R0() * TAU, r = R0() * 16; g.fillStyle = css(R0() < .7 ? [14, 58, 48] : [28, 88, 60]); g.beginPath(); g.ellipse(x + Math.cos(a) * r, yb + Math.sin(a) * r * .28, 3.4 + R0() * 2.4, 2 + R0() * 1.6, R0(), 0, TAU); g.fill(); } }
  for (let i = 0; i < 14; i++) hatch(g, lerp(-PX, W + PX, R0()), hz + 2, 22 + R0() * 26, PAL4.ivy, R0, { sq: .55, dens: .16, seed: 94 });
  for (let i = 0; i < 620; i++) { const x = lerp(-PX, W + PX, R0()), y = hz + 10 + R0() * 150; g.fillStyle = R0() < .86 ? '#f8f4e2' : '#d8c8ea'; g.beginPath(); g.arc(x, y, .8 + R0() * 1.1, 0, TAU); g.fill(); }
  return c;
}
// the front plate: near trunks, canopy, hanging fronds, the big dark grass silhouette
function bakeFront() {
  const [c, g] = plateCanvas(), R0 = rng(101);
  const tn = H4('#0f0d0c', '#2e2a22', '#5c4a34');
  [[26, 122, .07], [226, 58, .045], [1120, 46, -.05], [1262, 110, -.075]].forEach(([x, w, l]) => barkTrunk(g, x, -PY, H - 8, w, l, tn, R0, { ivy: Math.round(w * .55), ivyPal: PAL4.ivy, rag: 6, litSide: x < 640 ? .75 : -.75 }));
  const cy = (x) => 18 + 170 * Math.pow(Math.max(0, 1 - (x + 90) / 450), 1.4) + 170 * Math.pow(Math.max(0, (x - 930) / 480), 1.4);
  for (let x = -PX; x < W + PX; x += 15) { const y = cy(x), big = y > 40; for (let k = 0; k < (big ? 4 : 2); k++) hatch(g, x + (R0() - .5) * 22, y - R0() * (big ? y + 20 : 34) + 6, (big ? 32 : 17) + R0() * (big ? 30 : 15), PAL4.near, R0, { dens: .12, seed: 103, lx: x < 640 ? .7 : -.7 }); }
  for (let i = 0; i < 46; i++) { const side = i < 18 ? lerp(-90, 330, R0()) : i < 36 ? lerp(950, 1380, R0()) : lerp(330, 950, R0()); frondLeaves(g, side, cy(side) - 12 + R0() * 8, (side > 330 && side < 950 ? 44 + R0() * 60 : 80 + R0() * 150), (R0() - .5) * 12, PAL4.vine, R0); }
  g.fillStyle = '#082828'; g.fillRect(-PX, 668, PLW, 120);
  for (let i = 0; i < 1500; i++) { const x = lerp(-PX, W + PX, R0()), base = 690 + R0() * 60, h = 42 + R0() * 74, lean = (R0() - .5) * .75, wd = 3 + R0() * 5, tx = x + Math.sin(lean) * h, ty = base - Math.cos(lean) * h, mx = x + Math.sin(lean) * h * .3; g.fillStyle = css(R0() < .72 ? hex('#082828') : R0() < .78 ? hex('#113a36') : hex('#1a4c40')); g.beginPath(); g.moveTo(x - wd, base); g.quadraticCurveTo(mx - wd * .5, base - h * .55, tx, ty); g.quadraticCurveTo(mx + wd * .6, base - h * .55, x + wd, base); g.fill(); }
  return c;
}
