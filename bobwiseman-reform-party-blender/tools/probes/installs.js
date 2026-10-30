// lyric installations (installs.js, playa.js, table.js) for rp_installs: cue times, the elephants, the playa art
// pieces and what of them is in frame, and draft 5's screen-space blind (render.js skyAndGround -> blind)
(t) => {
  C = camAt(t); CP = Math.cos(C.p); SP = Math.sin(C.p); CX = carX(t); CZ = carZ(t); YAW = yaw(t);
  const inView = (X, Y, Z, m) => { const p = P(X, Y, Z); return p[2] > 1.5 && p[0] > -m && p[0] < W + m && p[1] > -m && p[1] < H + m; };
  const o = { cx: CX };
  if (t < 16.701) { // static: cue times and positions
    o.cues = { lines: [0, 1, 2, 3, 4, 5].map((i) => [L_(i).s, L_(i).e]), every: wt(2, 'every'), want: wt(3, 'want'), blues: wt(3, 'blues'), restrict: wt(4, 'restrict'),
      earX: EAR.X(), earZ: EAR.Z, gagX: carX(L_(2).s) - 12, gagZ: 30, patent: wt(8, 'patent'), ballotX: carX(9) + 13, bulbX: carX(wt(8, 'patent')) - 7 };
    o.camps = BM_CAMPS.map((c, i) => ({ i, X: c.X, Z: c.Z, kind: c.kind, r: c.r, col: c.col, col2: c.col2, seed: c.seed })).filter((c) => BM_PLAYA_ART[c.kind]);
    o.eleph = BM_ELEPHANTS; o.road = BM_ROAD;
  }
  // elephants as bmElephantsInto places them (vogue/flip are 0 in verse 1)
  const cx = carX(clamp(t, 0, 238)), el = [];
  BM_ELEPHANTS.forEach((e, i) => { const rel = ((((e.r0 + e.dv * t) % 400) + 400) % 400) - 200, X = cx + rel, v = 1.6 + e.dv; el.push([X, e.Z, e.s, i * 2.1, e.load || 'tower', clamp(Math.abs(v) / 1.4, .5, 1.3), Math.sign(v) || 1, inView(X, 7 * e.s, e.Z, 900) ? 1 : 0]); });
  BM_ROAD.forEach((e, i) => { const on = t >= e.t0 && t <= e.t1, X = cx + e.r0 + e.dv * (t - e.t0); el.push([X, e.Z, e.s, 7 + i, e.load, .85, 1, on && inView(X, 7 * e.s, e.Z, 900) ? 1 : 0, on ? 1 : 0]); });
  o.el = el;
  o.campsIn = BM_CAMPS.map((c, i) => [c, i]).filter(([c]) => BM_PLAYA_ART[c.kind] && inView(c.X, c.r, c.Z, 300)).map(([, i]) => i);
  const ear = EAR.X(), gag = carX(L_(2).s) - 12;
  o.vis = { ear: inView(ear, 5, 24, 600) ? 1 : 0, gag: inView(gag, 5, 30, 600) ? 1 : 0, ballot: inView(carX(9) + 13, 2, 17, 600) ? 1 : 0, bulb: inView(carX(wt(8, 'patent')) - 7, 3, 21, 600) ? 1 : 0,
    clock: t <= 17 && inView(carX(t) + lerp(46, 4, t / 17), 3, 34, 600) ? 1 : 0 };
  // the canvas blind on refrain 1's "blues", in draft screen px (1920x1080): roller, edge samples, drip tips, cord
  const hy = H / 2 - C.f * Math.tan(C.p), b = wt(3, 'blues');
  if (t > b - .1 && t < b + 3.2) {
    const Y = Math.min(hy, H), maxY = Math.min(Y + 6, 975), ext = ease(t, b - .05, b + .5) * (1 - ease(t, b + 1.75, b + 2.45));
    if (maxY >= 40 && ext > 0) { const melt = ease(t, b + .25, b + 1.75), D = maxY * .8 * ext, R = mulberry(311);
      const drips = [...Array(13)].map((_, i) => ({ x: (i + .3 + R() * .5) / 13 * W, w: 30 + R() * 50, L: (40 + R() * 150) * melt * ext }));
      const edge = (x) => { let y = D + Math.sin(x * .006 + t * .9) * 12 * ext + Math.sin(x * .017 - t * .5) * 5; for (const d of drips) { const u = (x - d.x) / d.w; if (u > -1 && u < 1) y += d.L * (1 - u * u) ** 2; } return Math.min(y, maxY - 4); };
      const xs = [...Array(97).keys()].map((i) => i * 20);
      const ccx = W * .62, ccy = edge(ccx);
      o.blind = { ext, melt, D, maxY, edge: xs.map((x) => +edge(x).toFixed(2)), tips: drips.map((d) => [d.x, Math.min(edge(d.x) + 6, maxY - 2), 9 + d.w * .08, d.L > 30 ? 1 : 0]),
        cord: [ccx, ccy - 4, ccx + 8 * melt, ccy + 60, ccx + 14 * melt, Math.min(ccy + 110 + 40 * melt, maxY - 30), Math.min(ccy + 124 + 40 * melt, maxY - 16), 13 + 6 * melt] };
    }
  }
  return o;
}
