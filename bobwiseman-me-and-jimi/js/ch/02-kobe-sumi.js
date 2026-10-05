// Kobe in sumi-e (look test v3, 2026-10-04, after Robin: "some kind of japan style").
// Painted with a brush, not drawn with a pen: every mark is a bristle stroke (many thin hairs, each
// running dry at its own rate) or a wash (a soft-edged grey that fades). Mist is paper left bare.
// Red only for the seal (and, later, for her hair).
(() => {
  const T = (x) => onTwos(x, 12);
  const g = (v) => { const k = Math.round(255 * (1 - v)); return `rgb(${k},${k},${k})`; };   // ink strength 0..1
  // a brush stroke along pts: N hairs across the width, each fading and breaking as the brush runs dry
  function brush(pts0, width, ink = 1, seed = 1, dry = .5, taper = true) {
    const pts = dense(pts0);
    const N = Math.max(8, Math.round(width / 1.3)); let L = 0; const seg = [0];
    for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(L); }
    s.lineCap = 'round';
    for (let h = 0; h < N; h++) {
      // each hair is one continuous stroke (no joints), broken only where it skips, and ending where it runs dry
      const o = (h / (N - 1) - .5) + (hash(h * 5 + seed) - .5) * .06, runs = 1 - dry * hash(h * 7 + seed * 3) * .9;
      s.lineWidth = width / N * (1.8 + hash(h * 13 + seed) * 1.6);
      s.strokeStyle = `rgba(0,0,0,${(ink * (.32 + .25 * hash(h + seed * 11))).toFixed(3)})`;
      s.beginPath(); let pen = false;
      for (let i = 0; i < pts.length; i++) {
        const a = seg[i] / L; if (a > runs) break;
        const j = Math.min(i + 1, pts.length - 1), k = Math.max(i - 1, 0);
        const nx = -(pts[j][1] - pts[k][1]), ny = pts[j][0] - pts[k][0], nl = Math.hypot(nx, ny) || 1;
        const tp = taper ? Math.sin(Math.PI * Math.min(1, (a + .04) * 1.04)) * .8 + .2 : 1;
        const off = o * width * tp * (1 + snoise(seg[i] * .01, seed + h) * .08);
        const gap = noise1(seg[i] * .02 + h * .7, seed) < dry * .28;
        const x = pts[i][0] + nx / nl * off, y = pts[i][1] + ny / nl * off;
        if (gap) { pen = false; continue; }
        if (pen) s.lineTo(x, y); else { s.moveTo(x, y); pen = true; }
      }
      s.stroke();
    }
  }
  // resample a polyline so long straight runs get enough points to waver and break
  function dense(pts, step = 12) { const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step)); for (let k = 1; k <= n; k++) out.push([lerp(x0, x1, k / n), lerp(y0, y1, k / n)]); } return out; }
  // a wash: a filled shape whose ink fades downward (or upward), soft edged by the shader's bleed
  function wash(pts, ink, y0, y1, up = false) {
    const gr = s.createLinearGradient(0, y0, 0, y1); gr.addColorStop(up ? 1 : 0, g(ink)); gr.addColorStop(up ? 0 : 1, g(0));
    s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); s.fillStyle = gr; s.fill();
  }
  function ridgePts(y, amp, seed, x0 = -200, x1 = W + 200) { const p = []; for (let x = x0; x <= x1; x += 18) p.push([x, y - amp * (.6 * noise1(x * .003, seed) + .4 * noise1(x * .012, seed + 3))]); return p; }
  function mountains(y, amp, seed, ink, depth, crest = true) {
    const p = ridgePts(y, amp, seed); wash([...p, [W + 200, y + depth], [-200, y + depth]], ink, y - amp, y + depth);
    if (crest) brush(p, 7, Math.min(1, ink + .25), seed, .8, false);
  }
  function pine(x, y, sc, seed) {
    withT(() => {
      s.translate(x, y); s.scale(sc, sc);
      brush([[0, 0], [6, -50], [-4, -100], [10, -150]], 14, .9, seed, .3);
      // needle clusters: short dark dabs fanned out flat
      [[-40, -150], [30, -168], [-6, -196], [52, -140]].forEach(([cx, cy], i) => {
        for (let k = 0; k < 9; k++) { const a = -Math.PI + k / 8 * Math.PI; brush([[cx, cy], [cx + Math.cos(a) * 44, cy + Math.sin(a) * 16]], 8, .95, seed * 10 + i * 9 + k, .55); }
      });
    });
  }
  function boat(x, y, sc, seed, t) {
    withT(() => {
      s.translate(x, y); s.scale(sc, sc);
      brush([[-200, -10], [-120, 22], [140, 22], [210, -16]], 26, 1, seed, .2);          // hull, one stroke
      brush([[-120, -20], [120, -20]], 30, .45, seed + 1, .3, false);                      // cabins, a pale stroke
      brush([[-10, -40], [-6, -110]], 30, .85, seed + 2, .2, false);                       // funnel
      const sm = []; for (let k = 0; k <= 16; k++) { const a = k / 16; sm.push([-6 - a * 380, -120 - a * 70 + Math.sin(a * 5 - t) * 14 * a]); }
      brush(sm, 34, .28, seed + 3, .9);                                                    // smoke: a dry pale drag
    });
  }
  function house(x, y, w, seed, lit) {
    brush([[x - 6, y - w * .5], [x + w / 2, y - w * .8], [x + w + 6, y - w * .5]], 10, .9, seed, .3, false);
    wash([[x, y - w * .5], [x + w, y - w * .5], [x + w, y], [x, y]], .18, y - w * .5, y);
    if (lit) { s.fillStyle = '#ff0000'; s.fillRect(x + w * .4, y - w * .35, w * .2, w * .2); }
  }
  function seal(x, y, txt) {
    s.fillStyle = '#ff0000'; s.fillRect(x, y, 96, 96); s.fillStyle = '#fff'; s.fillRect(x + 8, y + 8, 80, 80); s.fillStyle = '#ff0000';
    s.font = '900 34px "Superclarendon"'; s.textAlign = 'center'; s.fillText(txt.slice(0, 2), x + 48, y + 44); s.fillText(txt.slice(2), x + 48, y + 80);
  }
  function shotHarbour(t, l) {
    const tt = T(t), pan = -ease.inOut(inv(43, 50.2, t)) * 140;
    fx({ fade: 1 - smooth(inv(43.0, 43.8, t)) });
    s.fillStyle = '#fff'; s.fillRect(-W, -H, W * 3, H * 3);
    withT(() => {
      s.translate(pan, 0);
      // far range barely there, nearer range stronger, mist (bare paper) between them
      mountains(430, 240, 1, .22, 260, false);
      mountains(560, 170, 7, .42, 200);
      s.fillStyle = '#fff'; s.fillRect(-300, 590, W + 600, 70);                          // the mist
      // the hill with the mission house, painted
      wash([[1040, 760], [1300, 610], [1560, 560], [1820, 572], [2100, 620], [2400, 650], [2400, 800], [1040, 800]], .55, 560, 820);
      brush([[1040, 760], [1300, 610], [1560, 560], [1820, 572], [2100, 620], [2400, 650]], 9, .9, 21, .6, false);
      withT(() => { s.translate(1580, 562);
        wash([[-80, 0], [80, 0], [80, -90], [-80, -90]], .12, -90, 0);
        brush([[-104, -88], [0, -150], [104, -88]], 14, 1, 31, .2, false);
        brush([[78, -84], [78, -230]], 30, .2, 32, .1, false); brush([[60, -226], [78, -280], [96, -226]], 12, 1, 33, .2, false);
        brush([[78, -320], [78, -284]], 6, 1, 34, 0, false); brush([[66, -306], [90, -306]], 6, 1, 35, 0, false);
        const lit = t > 44.0; if (lit) { s.fillStyle = '#ff0000'; s.fillRect(-44, -66, 26, 30); s.fillRect(18, -66, 26, 30); } });
      [[1320, 640, .9], [1440, 596, .75], [1800, 580, .85], [1930, 628, 1]].forEach(([x, y, k], i) => pine(x, y, k, 50 + i));
      const bar = Math.floor(inv(43.3, 50.2, t) * 13);
      for (let i = 0; i < 12; i++) house(120 + i * 80, 704 - (i % 3) * 5, 50, 60 + i, i < bar);
    });
    // the water: a pale wash darkening toward us, a handful of loose, wavering strokes
    wash([[-20, 720], [W + 20, 720], [W + 20, H + 20], [-20, H + 20]], .2, 1080, 700, true);
    for (let r = 0; r < 7; r++) { const y = 760 + Math.pow(r / 6, 1.3) * 270, x0 = hash(r * 5) * 900 - 200, len = 260 + hash(r * 9) * 520;
      const pts = []; for (let k = 0; k <= 10; k++) { const a = k / 10; pts.push([x0 + a * len, y + Math.sin(a * 5 + r + t * .5) * (4 + r)]); }
      brush(pts, 8 + r * 2.5, .7, 100 + r, .75); }
    boat(560 + t * 5, 860, .9, 70, t); boat(1260 - t * 3, 780, .5, 80, t);
    // the moon: bare paper inside a pale wash ring; the seal
    withT(() => { const gr = s.createRadialGradient(1480, 200, 54, 1480, 200, 170); gr.addColorStop(0, g(.16)); gr.addColorStop(1, g(0)); s.fillStyle = gr; s.beginPath(); s.arc(1480, 200, 170, 0, TAU); s.arc(1480, 200, 54, 0, TAU, true); s.fill(); });
    seal(1760, 70, 'KOBE');
  }
  chapter('kobesumi', 43.0, 50.2, [[43.0, shotHarbour]]);
})();
