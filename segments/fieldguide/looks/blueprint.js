// Look: blueprint (Blueprint schematic). Mode 'sch'. Recipe: looks/blueprint.yaml.
// Pale lavender and cyan linework on navy: maps, dials, brackets, hex lattices and stipple that draw themselves in,
// magenta only for what changes. Crisp lines that never boil: a schematic shot draws with the kit's crisp marks
// (gl, gc, ticks, lab, bracket, star, lattice, graticule) over the ground and plate frame this look provides.
// Ported from the first film's kit (schBG, schDress, schFrame and the navy palette).
'use strict';
defineLook({
  name: 'blueprint', mode: 'sch',
  palette: { navy: '#0c1430', navy2: '#070b1d', lav: '#c9c6ff', cyan: '#8fe3ff', mag: '#ff3d9a', grn: '#8bff5e', white: '#f2f0ff' },
  lineWeight: 1,
  grain: { seeds: [91, 92, 93, 94], tone: 'dark' },
  provides: {
    // the navy ground with its dressing
    schBG(c = C.navy) { X.fillStyle = c; X.fillRect(-W, -H, 3 * W, 3 * H); schDress(); },
    // guide geometry, stipple fields and data columns, stable per shot (seeded by DSEED)
    schDress() {
      const r = M32(DSEED * 7 + 3);
      for (let i = 0; i < 3; i++) { const x = r() * W, y = r() * H, rr = 200 + r() * 600; gc(x, y, rr, C.lav, .1, 1, i ? [2, 9] : null); ticks(x, y, rr, 180, 4, C.lav, .12, 1, 15); }
      for (let i = 0; i < 2; i++) { const y1 = r() * H, y2 = r() * H; gl(-100, y1, W + 100, y2, C.lav, .1); }
      for (let i = 0; i < 3; i++) { const x = r() * W, y = r() * H, rr = 60 + r() * 140; stip(null, x, y, rr, 900, C.lav, .32, 1.3, [r() - .5, r() - .5], .5); gc(x, y, rr, C.lav, .18, 1, [3, 5]); }
      X.beginPath(); for (let i = 0; i < 26; i++) { const x = 30 + (i % 2) * 6, y = 140 + i * 30; X.moveTo(x, y); X.lineTo(x + 22 + r() * 30, y); } stroke(C.lav, 1, .25);
      for (let i = 0; i < 9; i++) lab(W - 60, 150 + i * 22, (r() * 999).toFixed(1).padStart(6, '0') + ' ' + ['ALT', 'LAT', 'LON', 'HDG', 'SPD', 'T+', 'REF', 'ΔX', 'ΔY'][i], C.lav, .28, 10, 'right');
      for (let i = 0; i < 6; i++) { const x = r() * W, y = r() * H; X.beginPath(); X.moveTo(x - 9, y); X.lineTo(x + 9, y); X.moveTo(x, y - 9); X.lineTo(x, y + 9); stroke(C.lav, 1, .35); }
      stipRect(0, 0, W, H, 700, C.lav, .25, 1.2);
    },
    // the plate frame: edge rulers, corner registration marks, plate number, title and sub-title
    schFrame(n, t, sub, col = C.lav) {
      X.beginPath(); for (let i = 0; i <= W; i += 12) { const L = i % 60 === 0 ? 14 : 6; X.moveTo(i, H); X.lineTo(i, H - L); } for (let i = 0; i <= H; i += 12) { const L = i % 60 === 0 ? 14 : 6; X.moveTo(0, i); X.lineTo(L, i); } stroke(col, 1, .35);
      for (const [x, y] of [[46, 46], [W - 46, 46], [46, H - 46], [W - 46, H - 46]]) { X.beginPath(); X.moveTo(x - 13, y); X.lineTo(x + 13, y); X.moveTo(x, y - 13); X.lineTo(x, y + 13); stroke(col, 1, .6); gc(x, y, 6, col, .5); }
      if (t) lab(80, 72, n + '  ' + t, C.white, .9, 16); if (sub) lab(80, 96, sub, col, .6, 12); lab(W - 80, H - 62, 'FIG. ' + n, col, .45, 11, 'right');
    },
  },
});
