// 58.23 - 66.07  the wave, in the manner of Hokusai's Great Wave off Kanagawa (1831, public domain).
// The family radio's music has spilled out over the harbour and grown into the wave. Our one twist:
// a few of the falling spray drops are records.
//   58.23  rise     the wall of water climbs from the left, foam claws reaching
//   59.43  crest    the wordless vocal: the lip curls over, spray bursts and falls
//   61.00+ hang     the claws hang over the trough; Fuji small beneath; the boats ride the slopes
(() => {
  const C = { pr: '#1d3b66', mid: '#2f5d8c', lt: '#7da2c1', vein: '#e9e3cf', foam: '#f2ead6', sky: '#e4d6b6', skyTop: '#8f8778', boat: '#d6c49a', key: '#18233a', cloud: '#c9bda2' };
  const CR = 59.43;
  function carve(pts, seed = 1, wmin = 1.4, wmax = 5, closed = false, col = C.key) {
    const P = closed ? [...pts, pts[0]] : pts; let d = 0; s.lineCap = 'round'; s.strokeStyle = col;
    for (let i = 1; i < P.length; i++) {
      const [x0, y0] = P[i - 1], [x1, y1] = P[i], L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(L / 10));
      for (let k = 0; k < n; k++) { const a = k / n, b = (k + 1) / n, dd = d + L * a, v = noise1(dd * .02, seed);
        if (noise1(dd * .06, seed + 7) < .06) continue; s.lineWidth = lerp(wmin, wmax, v * v);
        s.beginPath(); s.moveTo(lerp(x0, x1, a), lerp(y0, y1, a)); s.lineTo(lerp(x0, x1, b), lerp(y0, y1, b)); s.stroke(); }
      d += L;
    }
  }
  function fillPts(pts, col) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = col; s.fill(); }
  const bez = (p0, p1, p2, p3, n = 24) => [...Array(n + 1)].map((_, i) => { const t = i / n, u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; });
  const chain = (...cs) => cs.reduce((a, c, i) => a.concat(i ? c.slice(1) : c), []);
  // the wave's outline in local units (base at y=0, up is negative), shaped by g (0 low swell .. 1 full curl)
  function waveShape(g, wob) {
    const h = lerp(.35, 1, g), lip = g;                          // the curl only forms as it grows
    const back = bez([-160, 0], [60, -120 * h], [220, -470 * h], [500, -560 * h]);
    const over = bez([500, -560 * h], [660, -610 * h], [800 + 40 * lip, -560 * h], [840 + 30 * lip, -440 * h + 60 * (1 - lip)]);
    const curl = bez([840 + 30 * lip, -440 * h + 60 * (1 - lip)], [850, -360 * h], [790 - 40 * lip, -320 * h], [740 - 20 * lip, -370 * h + wob]);
    const hollow = bez([740 - 20 * lip, -370 * h + wob], [660, -420 * h], [590, -350 * h], [640, -230 * h]);
    const front = bez([640, -230 * h], [670, -140 * h], [710, -50 * h], [790, 0]);
    return { all: chain(back, over, curl, hollow, front), top: chain(back.slice(10), over, curl.slice(0, 16)), back, over, curl, h };
  }
  // a foam claw: a white blob with three to five hooked fingers, pointing along angle a
  function claw(x, y, sz, a, seed) {
    withT(() => {
      s.translate(x, y); s.rotate(a);
      const n = 3 + Math.floor(hash(seed) * 3), pts = [[-sz * .5, sz * .25]];
      for (let k = 0; k < n; k++) { const u = (k + .5) / n - .5, tipx = sz * (.9 + hash(seed + k) * .5), tipy = u * sz * 1.4;
        pts.push([sz * .25, tipy - sz * .18], [tipx, tipy - sz * .05], [tipx * .82, tipy + sz * .14]); }
      pts.push([-sz * .5, -sz * .25].map((v, i) => i ? -v : v));
      fillPts(pts, C.foam); carve(pts, seed, 1, 2.6, true, C.pr);
    });
  }
  function boat(x, y, rot, len, seed) {
    withT(() => {
      s.translate(x, y); s.rotate(rot);
      const hull = [[-len / 2, -6], [len / 2, -18], [len / 2 - 20, 14], [-len / 2 + 10, 12]];
      fillPts(hull, C.boat); carve(hull, seed, 1.2, 3.4, true);
      for (let k = 0; k < 7; k++) { const rx = -len / 2 + 40 + k * (len - 80) / 6; fillPts([[rx - 12, -6], [rx + 12, -8], [rx + 8, -26], [rx - 8, -24]], C.mid); s.beginPath(); s.arc(rx, -28, 8, 0, TAU); s.fillStyle = C.lt; s.fill(); }
    });
  }
  function shotWave(t, l) {
    const tt = onTwos(t, 12);
    const g = ease.out(inv(58.23, CR, tt)), wob = Math.sin(tt * 2.2) * 6;
    // sky: grey-brown graded at the top, a pale band, a few low cloud strips
    let gr = s.createLinearGradient(0, 0, 0, 420); gr.addColorStop(0, C.skyTop); gr.addColorStop(1, C.sky); s.fillStyle = gr; s.fillRect(0, 0, W, H);
    fillPts([[1180, 560], [1560, 548], [1600, 566], [1200, 578]], C.cloud);
    // Fuji, small, in the trough
    const fx0 = 1240, fy0 = 840;
    const fuji = [[fx0 - 210, fy0], [fx0 - 40, fy0 - 150], [fx0 + 40, fy0 - 150], [fx0 + 210, fy0]];
    fillPts(fuji, C.pr); fillPts([[fx0 - 104, fy0 - 76], [fx0 - 40, fy0 - 150], [fx0 + 40, fy0 - 150], [fx0 + 104, fy0 - 76], [fx0 + 60, fy0 - 88], [fx0 + 30, fy0 - 72], [fx0, fy0 - 92], [fx0 - 34, fy0 - 70], [fx0 - 66, fy0 - 86]], C.foam);
    carve(fuji, 3, 1.2, 3.4);
    // the sea behind, and the small foreground wave that echoes Fuji
    fillPts([[-20, 860], [W + 20, 830], [W + 20, H + 20], [-20, H + 20]], C.mid);
    for (let r = 0; r < 6; r++) carve([...Array(40)].map((_, k) => [k * 52 - 20, 870 + r * 36 + Math.sin(k * .7 + r + tt) * 8]), 20 + r, .8, 2.4, false, C.lt);
    withT(() => {
      s.translate(1560, 1050);
      const sw = [[-260, 0], [-120, -90], [-30, -160], [20, -150], [120, -60], [260, 0]];
      fillPts(sw, C.pr); carve(sw, 5, 1.4, 4);
      for (let k = 0; k < 7; k++) claw(-40 + k * 14, -150 + Math.abs(k - 3) * 12, 26, -1.2 + k * .4, 300 + k);
    });
    // the great wave
    withT(() => {
      s.translate(140, 1000); const sc = 1.32; s.scale(sc, sc);
      const W0 = waveShape(g, wob);
      fillPts(W0.all, C.pr);
      // pale inner bands and white veins following the back slope
      for (let k = 1; k <= 3; k++) {
        const band = W0.back.map(([x, y], i) => [x + k * 46, y + k * 30 + Math.sin(i * .6 + tt) * 4]);
        carve(band.slice(2), 40 + k, 1.4, 3.6, false, k === 2 ? C.vein : C.lt);
      }
      fillPts([...W0.curl.slice(4), ...W0.over.slice(12).reverse()], C.lt);
      carve(W0.all, 11, 1.6, 6);
      // foam along the crest, claws reaching out and, at the lip, hanging down
      W0.top.forEach(([x, y], i) => {
        if (i % 2) return; const a = i / W0.top.length;
        const ang = lerp(-1.9, 1.6, a * a) + snoise(tt * .8, i) * .12;
        const reach = g * (18 + a * 36 + 10 * hit(tt, CR, 2));
        claw(x, y - 4, reach, ang, 500 + i);
      });
      // spray bursting off the crest and falling, a few of the drops are records
      const sp = inv(CR - .1, CR + 4, tt);
      if (sp > 0) for (let k = 0; k < 46; k++) {
        const ox = 520 + hash(k) * 420, oy = -560 * W0.h, vx = (hash(k + 3) - .3) * 260, vy = -120 - hash(k + 7) * 220;
        const ts = sp * 4, x = ox + vx * ts, y = oy + vy * ts + 260 * ts * ts;
        if (y > 0) continue;
        if (k % 9 === 0) { s.beginPath(); s.arc(x, y, 14, 0, TAU); s.fillStyle = C.key; s.fill(); s.beginPath(); s.arc(x, y, 5, 0, TAU); s.fillStyle = '#c2452b'; s.fill(); }
        else { s.beginPath(); s.arc(x, y, 3 + hash(k + 9) * 6, 0, TAU); s.fillStyle = C.foam; s.fill(); }
      }
    });
    // the boats, riding the slopes
    boat(520, 930 + Math.sin(tt * 1.3) * 10, -.35 + Math.sin(tt) * .05, 420, 61);
    boat(1500, 880 + Math.sin(tt * 1.1 + 1) * 8, .22, 360, 62);
    // a title cartouche top right, like the print's
    fillPts([[1760, 60], [1852, 60], [1852, 330], [1760, 330]], C.sky); carve([[1760, 60], [1852, 60], [1852, 330], [1760, 330]], 90, 1.4, 3.6, true);
    s.fillStyle = C.key; s.textAlign = 'center'; s.font = '700 50px "Superclarendon"'; [...'WAVE'].forEach((ch, i) => s.fillText(ch, 1806, 124 + i * 54));
  }
  chapter('kobewave', 58.23, 66.07, [[58.23, shotWave]]);
})();
