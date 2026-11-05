// Marks test (#417): the same forest plates with the same composition, repainted out of many small dabs. Loaded only by
// d4-marks.html. ?marks=0 leaves the approved plates alone. ?fog=hard (default) keeps hard fog bands, broken by dabs;
// ?fog=soft is soft fog like the reference, which goes against the approved plate rule, so it is a switch for Robin.
const MQ = new URLSearchParams(location.search), FOG = MQ.get('fog') || 'hard';
const PALM = {
  far: H4('#4f7f68', '#6f9c7c', '#93b68c', '#b7cc9c', '#d6deb0'),
  canopy: H4('#0b332c', '#114034', '#17553a', '#2c7238', '#5a9438', '#8fae44', '#b7c25a'),
  frond: H4('#061f1e', '#0b302c', '#114038', '#1c5a48', '#2f7654'),
  ivy: H4('#0a2a22', '#10402e', '#1a5c3a', '#2f7a3e', '#5c9442'),
  barkNear: H4('#0a0908', '#1b1711', '#332a1d', '#57462f', '#8a7350'),
  barkMid: H4('#141a17', '#2d3530', '#4f5748', '#7c7c5e', '#a39f78'),
  barkFar: H4('#6f8a7c', '#8fa694', '#adbfa8', '#c9d3b8', '#dfe2c8'),
};
if (MQ.get('marks') !== '0') {
  bakeBack = function () {
    const t0 = performance.now(), [c, g] = plateCanvas(), R0 = rng(71), hz = 548;
    wash(g, -PX, -PY, W + PX, hz + 30, (x, y) => {
      const k = clamp((y + 40) / 560), top = [132, 182, 198], mid = [246, 214, 150], low = [250, 204, 134]; let col = k < .42 ? mixc(top, mid, smooth(k / .42)) : mixc(mid, low, (k - .42) / .58);
      const sun = Math.exp(-Math.pow(Math.hypot(x - 760, y - 250) / 260, 2)); col = mixc(col, [255, 243, 206], sun * .75);
      const band = (cy, h, s) => { const n = fbm2(x * .0058 + s, y * .03 + s, 61), w = h * Math.max(0, n * 2.5 - .92); return Math.abs(y - cy - (n - .5) * 34) < w * .5; };
      for (const [cy, h, s] of [[34, 40, 1], [86, 46, 5], [148, 34, 9], [196, 22, 13]]) if (band(cy, h, s)) { const under = fbm2(x * .018, y * .06, s + 3) < .42; col = under ? [226, 176, 166] : [250, 216, 182]; }
      return col; });
    // the far forest: masses of tiny pale dabs, back rows first, same placement law as the approved plate
    { const R2 = rng(72), cr = []; for (let i = 0; i < 460; i++) { const x = lerp(-PX, W + PX, R2()), sunK = Math.exp(-Math.pow((x - 760) / 300, 2)), top = 70 + 150 * fbm2(x * .004, 3.1, 63) + 190 * sunK, y = lerp(top, hz - 40, Math.pow(R2(), 1.25)), skip = R2() < sunK * .6, r = 30 + R2() * 40; if (!skip) cr.push([x, y, r, sunK]); }
      cr.sort((a, b) => a[1] - b[1]); for (const [x, y, r, sunK] of cr) crown(g, x, y, r, PALM.far, R2, { seed: 63, lx: x < 760 ? .6 : -.6, ly: 1, sq: .82, rag: .25, lift: .02 + .14 * sunK + .1 * inv(300, 520, y), clumpAmp: .75, clump: 11, jit: .09, ang: -1, scales: [[8, 5, 1.1], [4.6, 3, 1.1], [2.8, 2, .4]] }); }
    // fog over the forest
    const bands = [[420, 90, [248, 232, 190], 81], [500, 110, [250, 236, 198], 83]], fv = (x, y, yc, hh, s) => { const e = (fbm2(x * .007 + s, y * .03, s) - .5) * 2 + (fbm2(x * .03, y * .07, s + 1) - .5) * .5, k = 1 - Math.abs(y - yc) / hh; return k + e * 1.25 - .55; };
    if (FOG === 'soft') { const [fc, f] = plateCanvas(); for (const [yc, hh, col, s] of bands) wash(f, -PX, yc - hh, W + PX, yc + hh, (x, y) => (fv(x, y, yc, hh, s) > 0 ? col.concat(255) : null)); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'blur(20px)'; g.globalAlpha = .78; g.drawImage(fc, 0, 0); g.restore(); }
    else for (const [yc, hh, col, s] of bands) { wash(g, -PX, yc - hh, W + PX, yc + hh, (x, y) => (fv(x, y, yc, hh, s) > 0 ? col.concat(255) : null));
      const P = [new Path2D(), new Path2D(), new Path2D()], pl = [H4('#9cba92')[0], H4('#cfd6a8')[0], col], R3 = rng(s + 7); for (let i = 0; i < 30000; i++) { const x = lerp(-PX, W + PX, R3()), y = lerp(yc - hh, yc + hh, R3()), d = fv(x, y, yc, hh, s); if (Math.abs(d) > .05) continue; dabOn(P[d > 0 ? (R3() < .35 ? 0 : 1) : 2], x, y, (R3() - .5) * .7, 3 + R3() * 7, 1.4 + R3() * 1.8); } flushDabs(g, pl, P); }
    const R1 = rng(88); const mids = [-120, -38, 60, 150, 248, 330, 420, 1010, 1060, 1120, 1190, 1290, 1370];
    mids.forEach((x, i) => { const w = 15 + R1() * 22, far = i % 3 === 0; const t = far ? H4('#6d8878', '#92a892', '#b8c4a4') : H4('#1f2a26', '#46503f', '#7c7a58'); markedTrunk(g, x, -PY, hz - 2 + R1() * 26, w, (R1() - .5) * .05, t, R1, { bark: far ? PALM.barkFar : PALM.barkMid, cover: 1.5, patches: far ? 0 : 7, patchPal: PALM.ivy, rag: 2.2, litSide: x < 700 ? .7 : -.7, ink: far ? 'rgba(60,80,76,.3)' : 'rgba(14,20,24,.6)', edge: far ? 0 : 2 }); });
    { const k = FOG === 'soft' ? 1.15 : 1, gy = g.createLinearGradient(0, FOG === 'soft' ? 370 : 400, 0, hz + 4); gy.addColorStop(0, 'rgba(250,234,194,0)'); gy.addColorStop(.75, `rgba(250,234,194,${.42 * k})`); gy.addColorStop(1, `rgba(250,234,194,${Math.min(.95, .7 * k)})`); g.fillStyle = gy; g.fillRect(-PX, 340, PLW, hz + 4 - 340);
      const rg = g.createRadialGradient(760, 250, 0, 760, 250, 520); rg.addColorStop(0, 'rgba(255,238,190,.85)'); rg.addColorStop(.3, 'rgba(255,214,140,.3)'); rg.addColorStop(1, 'rgba(255,214,140,0)'); g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rg; g.fillRect(-PX, -PY, PLW, hz + PY); g.restore(); }
    wash(g, -PX, hz, W + PX, H + PY, (x, y) => { const k = (y - hz) / 210, n = fbm2(x * .006, y * .05, 91), sun = Math.exp(-Math.pow((x - 700 - 80 * n) / 300, 2)) * Math.exp(-Math.pow((y - 610) / 62, 2)); const v = .08 + .95 * sun + (n - .5) * .5 - k * .1; return PAL4.meadow[Math.min(5, Math.floor(clamp(v) * 6))].concat(255); });
    { const P = PAL4.meadow.map(() => new Path2D()); for (let i = 0; i < 26000; i++) { const x = lerp(-PX, W + PX, R0()), y = hz + Math.pow(R0(), 1.25) * 190, s = Math.exp(-Math.pow((x - 700) / 320, 2)) * Math.exp(-Math.pow((y - 610) / 66, 2)); const v = .07 + s * .9 + (fbm2(x * .022, y * .09, 92) - .5) * .85 + (R0() - .5) * .16; dabOn(P[Math.min(5, Math.floor(clamp(v) * 6))], x, y, -Math.PI / 2 + (R0() - .5) * .9, 3 + R0() * 7, 1 + R0() * 1.2); } flushDabs(g, PAL4.meadow, P); }
    for (let i = 0; i < 75; i++) { const x = lerp(-PX, W + PX, R0()); crown(g, x, hz + (R0() - .5) * 6 - 3, 12 + R0() * 16, PALM.ivy, R0, { sq: .5, seed: 94, lx: .3, clump: 9, scales: [[5, 3, .9], [2.8, 1.9, .8]] }); }
    for (let i = 0; i < 620; i++) { const x = lerp(-PX, W + PX, R0()), y = hz + 10 + R0() * 150; g.fillStyle = R0() < .86 ? '#f8f4e2' : '#d8c8ea'; g.beginPath(); g.arc(x, y, .8 + R0() * 1.1, 0, TAU); g.fill(); }
    MARKSTAT.backMs = performance.now() - t0;
    return c;
  };
  bakeFront = function () {
    const t0 = performance.now(), [c, g] = plateCanvas(), R0 = rng(101);
    const tn = H4('#0f0d0c', '#2e2a22', '#5c4a34');
    [[26, 122, .07], [226, 58, .045], [1120, 46, -.05], [1262, 110, -.075]].forEach(([x, w, l]) => markedTrunk(g, x, -PY, H - 8, w, l, tn, R0, { bark: PALM.barkNear, cover: 1.6, patches: Math.round(w * .3), patchPal: PALM.ivy, rag: 6, litSide: x < 640 ? .75 : -.75, edge: 3.2 }));
    const cy = (x) => 18 + 170 * Math.pow(Math.max(0, 1 - (x + 90) / 450), 1.4) + 170 * Math.pow(Math.max(0, (x - 930) / 480), 1.4);
    for (let x = -PX; x < W + PX; x += 24) { const y = cy(x), big = y > 40; for (let k = 0; k < (big ? 5 : 2); k++) crown(g, x + (R0() - .5) * 26, y - R0() * (big ? y + 20 : 30) + 4, (big ? 34 : 22) + R0() * (big ? 34 : 14), PALM.canopy, R0, { seed: 103, lx: x < 640 ? .7 : -.7, ly: .95, sq: .72, clump: big ? 18 : 13, clumpAmp: .8, jit: .08, ang: -.7, scales: [[11, 7, 1], [7, 4.4, 1.1], [4, 2.6, .25]] }); }
    for (let i = 0; i < 58; i++) { const side = i < 22 ? lerp(-90, 330, R0()) : i < 44 ? lerp(950, 1380, R0()) : lerp(330, 950, R0()), mid = side > 330 && side < 950; fineFrond(g, side, cy(side) - 14 + R0() * 8, mid ? 40 + R0() * 50 : 50 + R0() * 110, (R0() - .5) * 12, PALM.frond, R0); }
    g.fillStyle = '#082828'; g.fillRect(-PX, 668, PLW, 120);
    for (let i = 0; i < 1500; i++) { const x = lerp(-PX, W + PX, R0()), base = 690 + R0() * 60, h = 42 + R0() * 74, lean = (R0() - .5) * .75, wd = 3 + R0() * 5, tx = x + Math.sin(lean) * h, ty = base - Math.cos(lean) * h, mx = x + Math.sin(lean) * h * .3; g.fillStyle = css(R0() < .72 ? hex('#082828') : R0() < .78 ? hex('#113a36') : hex('#1a4c40')); g.beginPath(); g.moveTo(x - wd, base); g.quadraticCurveTo(mx - wd * .5, base - h * .55, tx, ty); g.quadraticCurveTo(mx + wd * .6, base - h * .55, x + wd, base); g.fill(); }
    { const pl = H4('#082828', '#0d3430', '#154a40', '#21624e'), P = pl.map(() => new Path2D()); for (let i = 0; i < 5200; i++) { const x = lerp(-PX, W + PX, R0()), y = 650 + R0() * 120, t = Math.min(3, Math.floor(R0() * R0() * 4 + (fbm2(x * .012, y * .02, 105) - .5) * 1.6)); dabOn(P[Math.max(0, t)], x, y, -Math.PI / 2 + (R0() - .5) * .8, 16 + R0() * 34, 1.4 + R0() * 1.8); } flushDabs(g, pl, P); }
    MARKSTAT.frontMs = performance.now() - t0;
    return c;
  };
}
