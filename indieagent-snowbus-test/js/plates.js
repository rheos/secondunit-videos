// Snow bus plates: a small town street at dusk, painted with the kit's plate tools. Baked once, slid per frame.
const PB = {
  hills: H4('#3a3a6a', '#4e4a80', '#6a6498', '#8e86b4', '#b6acc8'),
  snow: H4('#56608a', '#7a86b0', '#a6b2d2', '#cdd6ea', '#eaeef8', '#fbfcff'),
  hedge: H4('#101828', '#182236', '#243048', '#31405a'),
  cap: H4('#8e9ac0', '#b8c4e0', '#dfe6f6', '#ffffff'),
};
const HZ = 548;
// the back plate: a dusk sky in flat bands, far hills, a row of houses with lit windows, poles, the snow street
function bakeBack() {
  const [c, g] = plateCanvas(), R0 = rng(31);
  wash(g, -PX, -PY, W + PX, HZ + 20, (x, y) => {
    const k = clamp((y + 40) / 600), top = [38, 40, 92], mid = [122, 92, 150], low = [246, 170, 120], glow = [255, 214, 150]; let col = k < .5 ? mixc(top, mid, smooth(k / .5)) : mixc(mid, low, smooth((k - .5) / .5));
    const sun = Math.exp(-Math.pow(Math.hypot((x - 330) / 1.6, y - 470) / 300, 2)); col = mixc(col, glow, sun * .8);
    const band = (cy, h, s) => { const n = fbm2(x * .005 + s, y * .03 + s, 61), w = h * Math.max(0, n * 2.5 - .85); return Math.abs(y - cy - (n - .5) * 40) < w * .5; };
    for (const [cy, h, s, dark] of [[70, 44, 1, 1], [150, 56, 5, 1], [250, 50, 9, 0], [330, 36, 13, 0]]) if (band(cy, h, s)) col = dark ? [70, 56, 110] : [240, 150, 130];
    return col; });
  // far hills in hatch, two ridges, the nearer one darker
  for (const [yb, pal0, s, n] of [[420, 2, 71, 160], [470, 0, 73, 220]]) { const R2 = rng(s); for (let i = 0; i < n; i++) { const x = lerp(-PX, W + PX, R2()), top = yb - 90 * fbm2(x * .003 + s, 1, 75) - 20, y = lerp(top, yb + 40, Math.pow(R2(), 1.3)); hatch(g, x, y, 30 + R2() * 44, PB.hills.slice(pal0, pal0 + 3), R2, { dens: .05, seed: s, ang: -.2, sq: .5, lx: .3 }); } }
  // the street: flat snow, blue in the shade, warm where the windows and the sunset reach it, with drift edges
  wash(g, -PX, HZ - 6, W + PX, H + PY, (x, y) => { const k = (y - HZ) / 200, n = fbm2(x * .004, y * .02, 91), warm = Math.exp(-Math.pow((x - 330) / 420, 2)) * .5 + Math.exp(-Math.pow((y - HZ - 10) / 50, 2)) * .3; const v = .36 + .45 * warm + (n - .5) * .4 - k * .15; const col = PB.snow[Math.min(5, Math.floor(clamp(v) * 6))]; return mixc(col, [255, 206, 150], warm * .35).concat(255); });
  for (let i = 0; i < 2600; i++) { const x = lerp(-PX, W + PX, R0()), y = HZ + Math.pow(R0(), 1.3) * 200, v = .3 + (fbm2(x * .006, y * .03, 93) - .5) * .9 + (R0() - .5) * .2; g.strokeStyle = css(PB.snow[Math.min(5, Math.floor(clamp(v) * 6))]); g.lineWidth = 1 + R0() * 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + R0() * 18, y + (R0() - .5) * 2); g.stroke(); }
  // houses: flat gables and boxes, dark against the sky, with snow caps and lit windows
  const houses = [[-150, 170, 120, 1], [60, 130, 150, 0], [230, 150, 110, 1], [380, 200, 100, 0], [620, 120, 140, 1], [780, 160, 130, 0], [960, 140, 160, 1], [1150, 180, 120, 0], [1320, 130, 140, 1]];
  for (const [x, w, h, gable] of houses) {
    const y1 = HZ - 2 - R0() * 8, y0 = y1 - h, dk = R0() < .5 ? '#2a2640' : '#342c44';
    g.fillStyle = dk; g.beginPath(); g.moveTo(x, y1); g.lineTo(x, y0); if (gable) g.lineTo(x + w / 2, y0 - w * .42); g.lineTo(x + w, y0); g.lineTo(x + w, y1); g.closePath(); g.fill();
    g.fillStyle = '#1e1a30'; g.fillRect(x + w * .1, y0 + 2, w * .8, 10); // eaves shadow
    const cap = (ax, ay, bx, by) => { const n = Math.round(Math.hypot(bx - ax, by - ay) / 9); for (let k = 0; k <= n; k++) { const u = k / n; hatch(g, lerp(ax, bx, u), lerp(ay, by, u) - 4, 6 + R0() * 6, PB.cap, R0, { dens: .5, ang: -.1, sq: .5, seed: 95 }); } };
    if (gable) { cap(x, y0, x + w / 2, y0 - w * .42); cap(x + w / 2, y0 - w * .42, x + w, y0); } else cap(x, y0, x + w, y0);
    const cols = Math.max(1, Math.floor(w / 42)); for (let i = 0; i < cols; i++) for (let r = 0; r < Math.max(1, Math.floor(h / 60)); r++) { if (R0() < .35) continue; const wx = x + 12 + i * (w - 24) / cols + 6, wy = y0 + 22 + r * 50; g.fillStyle = R0() < .5 ? '#f6c66a' : '#f3a94a'; g.fillRect(wx, wy, 16, 22); g.fillStyle = 'rgba(255,200,120,.2)'; g.fillRect(wx - 8, wy - 6, 32, 34); }
    // snow on the sills and a chimney
    if (gable && R0() < .7) { g.fillStyle = dk; g.fillRect(x + w * .62, y0 - w * .2, 14, w * .2); hatch(g, x + w * .62 + 7, y0 - w * .2 - 3, 7, PB.cap, R0, { dens: .5, sq: .4 }); }
  }
  // poles and wires
  const PT = H4('#1a1c2e', '#2c2e44', '#4a4a62');
  for (const [x, w] of [[180, 9], [720, 10], [1240, 9]]) barkTrunk(g, x, 60, HZ + 6, w, .004, PT, R0, { rag: 1.5, litSide: -.6, ink: 'rgba(10,12,24,.7)' });
  g.strokeStyle = 'rgba(18,18,34,.8)'; g.lineWidth = 1.2; for (const [a, b] of [[180, 720], [720, 1240], [-PX, 180], [1240, W + PX]]) for (const dy of [0, 16]) { g.beginPath(); g.moveTo(a, 90 + dy); g.quadraticCurveTo((a + b) / 2, 118 + dy, b, 90 + dy); g.stroke(); }
  for (const x of [180, 720, 1240]) for (const dx of [-28, 28]) hatch(g, x + dx, 86, 5, PB.cap, R0, { dens: .5, sq: .4 });
  return c;
}
// the front plate: a dark hedge along the bottom with snow caps, a lamppost at the right
function bakeFront() {
  const [c, g] = plateCanvas(), R0 = rng(41);
  g.fillStyle = '#101828'; g.fillRect(-PX, 690, PLW, 100);
  for (let x = -PX; x < W + PX; x += 12) { const top = 652 + 22 * fbm2(x * .01, 2, 43); for (let k = 0; k < 3; k++) hatch(g, x + (R0() - .5) * 14, top + 14 + k * 16, 16 + R0() * 14, PB.hedge, R0, { dens: .14, seed: 45, ang: -1.1, sq: .9, lx: .2 }); }
  for (let x = -PX; x < W + PX; x += 9) { const top = 652 + 22 * fbm2(x * .01, 2, 43); hatch(g, x + (R0() - .5) * 8, top + 2, 7 + R0() * 7, PB.cap, R0, { dens: .5, seed: 47, ang: -.15, sq: .45 }); }
  barkTrunk(g, 1190, 150, 700, 14, -.003, H4('#0e1020', '#1c1e32', '#34364e'), R0, { rag: 1.2, litSide: -.7, ink: 'rgba(8,10,20,.8)' });
  g.fillStyle = '#1c1e32'; g.fillRect(1160, 128, 60, 26); g.fillStyle = '#0e1020'; g.fillRect(1164, 150, 52, 8); hatch(g, 1190, 124, 24, PB.cap, R0, { dens: .5, sq: .4 });
  return c;
}
