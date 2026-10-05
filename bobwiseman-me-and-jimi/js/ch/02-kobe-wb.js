// Kobe harbour, redrawn to woodblock conventions (look test for the Kobe rework, 2026-10-04).
// What makes it a print and not flat vector art:
//   - keylines are CARVED: width swells and thins along the line, and the line breaks in places
//   - the sky is ichimonji bokashi: deep Prussian blue at the top edge, gone to bare paper within a hand's width,
//     a pink band low on the horizon
//   - kasumi: horizontal mist bands (blank paper, rounded ends, no keyline) cross the mountains and the town
//   - mountains are graded from their crest down (bokashi), keyline on the crest only
//   - water is pale with carved wave crests in rows, darkening toward the viewer
//   - smoke is a carved band, not bubbles; muted palette: Prussian, sage, faded beni red, ochre, grey
(() => {
  const C = { pr: '#1f3d63', pr2: '#4d6f92', pale: '#a9bccb', beni: '#cf7d6e', pink: '#e7bfae', och: '#c8a15a', sage: '#6f8a62', moss: '#4e6b4f', grey: '#8d8b86', sumi: '#262123', pap: '#efe6d2', tile: '#5d5a5c', wood: '#8a6446' };
  const T = (x) => onTwos(x, 12);
  // a carved keyline along pts: width from noise, breaks where the noise dips
  function carve(pts, seed = 1, wmin = 1.6, wmax = 6.5, closed = false) {
    const P = closed ? [...pts, pts[0]] : pts; let d = 0;
    s.lineCap = 'round'; s.strokeStyle = C.sumi;
    for (let i = 1; i < P.length; i++) {
      const [x0, y0] = P[i - 1], [x1, y1] = P[i], L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(L / 14));
      for (let k = 0; k < n; k++) {
        const a = k / n, b = (k + 1) / n, dd = d + L * a;
        const v = noise1(dd * .018, seed), brk = noise1(dd * .05, seed + 7);
        if (brk < .1) continue;
        s.lineWidth = lerp(wmin, wmax, v * v);
        s.beginPath(); s.moveTo(lerp(x0, x1, a), lerp(y0, y1, a)); s.lineTo(lerp(x0, x1, b), lerp(y0, y1, b)); s.stroke();
      }
      d += L;
    }
  }
  function fillPts(pts, col) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = col; s.fill(); }
  function block(pts, col, seed = 1, key = true) { fillPts(pts, col); if (key) carve(pts, seed, 1.6, 6, true); }
  // a mountain range: graded from the crest down, keyline on the crest only
  function range(y, amp, seed, top, x0 = -200, x1 = W + 200, depth = 260) {
    const crest = []; for (let x = x0; x <= x1; x += 24) crest.push([x, y - amp * (.6 * noise1(x * .0035, seed) + .4 * noise1(x * .011, seed + 3))]);
    const g = s.createLinearGradient(0, y - amp, 0, y + depth); g.addColorStop(0, top); g.addColorStop(.55, top + '99'); g.addColorStop(1, top + '00');
    fillPts([...crest, [x1, y + depth], [x0, y + depth]], g); carve(crest, seed, 1.4, 5.5);
  }
  // kasumi: a band of bare paper with rounded, slightly uneven ends, no keyline
  function kasumi(x, y, w, h, col = C.pap) {
    s.fillStyle = col; s.beginPath(); s.moveTo(x + h / 2, y);
    s.lineTo(x + w - h / 2, y); s.arc(x + w - h / 2, y + h / 2, h / 2, -Math.PI / 2, Math.PI / 2); s.lineTo(x + h / 2, y + h);
    s.arc(x + h / 2, y + h / 2, h / 2, Math.PI / 2, Math.PI * 1.5); s.fill();
  }
  function water(y0, y1, t) {
    const g = s.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, C.pale); g.addColorStop(.5, C.pr2); g.addColorStop(1, C.pr); s.fillStyle = g; s.fillRect(-20, y0, W + 40, y1 - y0);
    // carved crests: rows of small scalloped curls, bigger and further apart toward the viewer
    for (let r = 0; r < 9; r++) {
      const yy = y0 + 18 + Math.pow(r / 8, 1.5) * (y1 - y0 - 30), sc = .5 + r * .22, step = 70 * sc, off = ((r * 37) % step) + Math.sin(t * .8 + r) * 6;
      for (let x = -step + off; x < W + step; x += step) {
        if (hash(Math.floor(x / step) * 31 + r * 7) < .35) continue;
        const pts = []; for (let k = 0; k <= 10; k++) { const a = k / 10; pts.push([x + a * step * .8, yy - Math.sin(a * Math.PI) * 10 * sc + (a > .7 ? (a - .7) * 18 * sc : 0)]); }
        carve(pts, r * 13 + Math.floor(x), 1, 3.2 * sc);
      }
    }
  }
  function pine(x, y, sc, seed) {
    withT(() => {
      s.translate(x, y); s.scale(sc, sc);
      const trunk = [[-5, 0], [4, 0], [12, -60], [2, -125], [-6, -122], [2, -62]]; block(trunk, C.wood, seed);
      [[-38, -130, 66, 20], [16, -150, 60, 18], [-10, -172, 50, 16]].forEach(([px, py, w, h], i) => {
        const pts = []; for (let k = 0; k <= 12; k++) { const a = k / 12 * Math.PI; pts.push([px + w / 2 - Math.cos(a) * w / 2, py - Math.sin(a) * h]); } pts.push([px + w, py + 6], [px, py + 6]);
        block(pts, C.moss, seed + i);
        for (let k = 0; k < 6; k++) { s.lineWidth = 1.4; s.strokeStyle = C.sumi; s.beginPath(); s.moveTo(px + 6 + k * w / 6, py + 2); s.lineTo(px + 10 + k * w / 6, py - h * .6); s.stroke(); }
      });
    });
  }
  function steamer(x, y, sc, t, seed) {
    withT(() => {
      s.translate(x, y); s.scale(sc, sc);
      // smoke: one long carved band that drifts back and thins
      const sm = []; for (let k = 0; k <= 30; k++) { const a = k / 30; sm.push([-10 - a * 520, -175 - a * 60 + Math.sin(a * 6 - t * 1.5) * 16 * a]); }
      const top = sm.map(([a, b], k) => [a, b - (10 + k * 1.6)]), bot = sm.map(([a, b], k) => [a, b + (10 + k * 1.6)]).reverse();
      fillPts([...top, ...bot], C.grey + 'cc'); carve(top, seed, 1, 3.5); carve(bot, seed + 5, 1, 3.5);
      block([[-260, -40], [250, -46], [205, 26], [-226, 26]], C.sumi, seed);
      block([[-180, -92], [160, -92], [160, -40], [-180, -40]], C.pap, seed + 2);
      for (let k = 0; k < 8; k++) fillPts([[-160 + k * 40, -76], [-146 + k * 40, -76], [-146 + k * 40, -58], [-160 + k * 40, -58]], C.och);
      block([[-28, -172], [16, -172], [16, -92], [-28, -92]], C.beni, seed + 3);
    });
  }
  function house(x, y, w, lit, seed) {
    block([[x, y], [x + w, y], [x + w, y - w * .5], [x, y - w * .5]], C.pap, seed);
    block([[x - 8, y - w * .5], [x + w / 2, y - w * .85], [x + w + 8, y - w * .5]], C.tile, seed + 1);
    fillPts([[x + w * .35, y - w * .38], [x + w * .65, y - w * .38], [x + w * .65, y - w * .12], [x + w * .35, y - w * .12]], lit ? C.och : C.pr2);
  }
  function mission(x, y, lit) {
    withT(() => {
      s.translate(x, y);
      block([[-90, 0], [90, 0], [90, -100], [-90, -100]], C.pap, 41);
      block([[-112, -100], [0, -168], [112, -100]], C.beni, 42);
      block([[62, -100], [100, -100], [100, -232], [62, -232]], C.pap, 43);
      block([[54, -232], [81, -292], [108, -232]], C.beni, 44);
      carve([[81, -335], [81, -292]], 45, 3, 5); carve([[67, -318], [95, -318]], 46, 3, 5);
      fillPts([[-60, -78], [-22, -78], [-22, -34], [-60, -34]], lit ? C.och : C.pr2); fillPts([[12, -78], [50, -78], [50, -34], [12, -34]], lit ? C.och : C.pr2);
    });
  }
  function shotHarbour(t, l) {
    const tt = T(t), pan = -ease.inOut(inv(43, 50.2, t)) * 160;
    fx({ fade: 1 - smooth(inv(43.0, 43.7, t)) });
    s.fillStyle = C.pap; s.fillRect(-W, -H, W * 3, H * 3);
    // ichimonji bokashi at the top, a pink band low down
    let g = s.createLinearGradient(0, 0, 0, 330); g.addColorStop(0, C.pr); g.addColorStop(.35, C.pr + 'cc'); g.addColorStop(1, C.pr + '00'); s.fillStyle = g; s.fillRect(0, 0, W, 330);
    g = s.createLinearGradient(0, 300, 0, 560); g.addColorStop(0, C.pink + '00'); g.addColorStop(.6, C.pink); g.addColorStop(1, C.pink + '00'); s.fillStyle = g; s.fillRect(0, 300, W, 260);
    withT(() => {
      s.translate(pan, 0);
      // the moon is paper left unprinted, with only a hairline
      s.beginPath(); s.arc(1460, 200, 52, 0, TAU); s.fillStyle = C.pap; s.fill(); const mp = []; for (let k = 0; k <= 40; k++) mp.push([1460 + Math.cos(k / 40 * TAU) * 52, 200 + Math.sin(k / 40 * TAU) * 52]); carve(mp, 9, .8, 2.4);
      range(470, 230, 1, C.pr2); kasumi(-100, 420, 900, 48); kasumi(1100, 380, 1200, 40);
      range(580, 150, 7, C.sage); kasumi(300, 560, 800, 36);
      // the hill and the mission house
      block([[1080, 760], [1300, 600], [1520, 548], [1760, 556], [2000, 610], [2400, 650], [2400, 780], [1080, 780]], C.moss, 21);
      const bar = Math.floor(inv(43.3, 50.2, t) * 13);
      mission(1560, 556, bar >= 1);
      [[1300, 640, .9], [1430, 590, .8], [1780, 568, .85], [1900, 616, 1]].forEach(([x, y, k], i) => pine(x, y, k, 50 + i));
      for (let i = 0; i < 13; i++) house(110 + i * 76, 690 - (i % 3) * 6, 54, i < bar, 60 + i);
      kasumi(-60, 650, 520, 30); kasumi(720, 664, 360, 26);
    });
    water(700, 1090, t);
    steamer(540 + t * 6, 840, .85, t, 70); steamer(1240 - t * 3, 760, .5, t + 2, 80);
    // cartouche: a pale panel with carved border, title set vertically
    withT(() => {
      fillPts([[1770, 60], [1862, 60], [1862, 370], [1770, 370]], C.pink); carve([[1770, 60], [1862, 60], [1862, 370], [1770, 370]], 90, 1.6, 4, true);
      s.fillStyle = C.sumi; s.textAlign = 'center'; s.font = '700 54px "Superclarendon"'; [...'KOBE'].forEach((ch, i) => s.fillText(ch, 1816, 128 + i * 58)); s.font = '700 24px "Superclarendon"'; s.fillText('1950s', 1816, 352);
    });
  }
  chapter('kobewb', 43.0, 50.2, [[43.0, shotHarbour]]);
})();
