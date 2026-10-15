// Look C: the playa at night. Black desert, everything drawn in EL wire and neon tube: glowing outlines, bloom, a
// few hard colours (hot pink, cyan, sodium amber). "Spin" is the whole stanza: fire spinners whirl the party's poi,
// a dime spins in the dark, a poor man holds out a cup, and a searchlight sweeps it away. The sung words light up as
// neon tubes, flickering on at each onset.
// Section: the middle stanza, first half (sung lines 14-19).
(() => {
  const LT = (i) => LINES[i].s, LE = (i) => LINES[i].e;
  const A = 14, B = 19, T0 = LT(A) - 1.5, T1 = LE(B) + 1.2;
  const out = document.getElementById('c'); out.width = W; out.height = H; const g = out.getContext('2d');
  const GL = mkCanvas(), gl = GL.getContext('2d'), BL = mkCanvas(W / 4, H / 4), bl = BL.getContext('2d');
  const PINK = '#ff3fa6', CYAN = '#3ff2ff', AMBER = '#ffb53a', LIME = '#b8ff4a';

  function tube(pts, col, w = 6, a = 1) { // a neon line: coloured core with a white-hot centre
    if (pts.length < 2) return; gl.save(); gl.globalAlpha = a; gl.lineCap = gl.lineJoin = 'round';
    gl.beginPath(); gl.moveTo(pts[0][0], pts[0][1]); for (const p of pts) gl.lineTo(p[0], p[1]);
    gl.strokeStyle = col; gl.lineWidth = w; gl.stroke(); gl.strokeStyle = 'rgba(255,255,255,.75)'; gl.lineWidth = w * .35; gl.stroke(); gl.restore();
  }
  const ring = (cx, cy, rx, ry, k = 32, a0 = 0, a1 = TAU) => [...Array(k + 1)].map((_, i) => { const a = lerp(a0, a1, i / k); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const flick = (t, t0, seed) => { const u = t - t0; if (u < 0) return 0; if (u > .18) return 1; return rnd(seed, Math.floor(u * 48)) > .45 ? 1 : .2; };

  function figure(x, y, s, col, t, pose = 'stand', seed = 1) { // EL-wire stick person, round head, no face
    const P = (dx, dy) => [x + dx * s, y + dy * s];
    tube(ring(x, y - 210 * s, 30 * s, 32 * s, 20), col, 5);
    tube([P(0, -178), P(0, -80)], col, 5);
    const sw = Math.sin(t * 7 + seed) * .25;
    tube([P(-28, 0), P(0, -80), P(28, 0)], col, 5);
    if (pose === 'beg') { tube([P(0, -150), P(46, -120), P(84, -128)], col, 5); tube([P(0, -150), P(-30, -96)], col, 5); }
    else tube([P(-60, -200 + sw * 40), P(0, -150), P(60, -200 - sw * 40)], col, 5);
  }
  function spinner(x, y, s, t, col, seed) { // fire spinner: body, two poi on chains tracing flower loops with trails
    figure(x, y, s, col, t, 'spin', seed);
    for (let side = -1; side <= 1; side += 2) {
      const pts = []; for (let k = 0; k < 26; k++) { const tt = t - k * .012, a = tt * 9 * side + seed, b = tt * 27 * side; const r = (90 + 40 * Math.cos(b)) * s; pts.push([x + side * 30 * s + Math.cos(a) * r, y - 170 * s + Math.sin(a) * r]); }
      tube(pts, side < 0 ? AMBER : PINK, 9 * s, .9); gl.fillStyle = '#fff'; gl.beginPath(); gl.arc(pts[0][0], pts[0][1], 10 * s, 0, TAU); gl.fill();
    }
  }
  function rosette(x, y, r, col) { for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; tube(ring(x + Math.cos(a) * r * .7, y + Math.sin(a) * r * .7, r * .3, r * .3, 10), col, 3); } }
  function dime(x, y, r, t, spin) { const ph = Math.cos(t * spin), rx = Math.abs(ph) * r + 3; tube(ring(x, y, rx, r, 40), '#e6e6ff', 7); if (Math.abs(ph) > .4) tube(ring(x, y, rx * .7, r * .7, 30), '#9aa0ff', 3); }
  function horizon(t) { tube([[0, 760], [W, 760]], 'rgba(63,242,255,.35)', 3); for (let i = 0; i < 14; i++) { const x = (i * 157 + 40) % W, h = 20 + (i % 4) * 14; tube([[x, 760], [x + 30, 760 - h], [x + 60, 760]], i % 3 ? 'rgba(255,63,166,.5)' : 'rgba(255,181,58,.5)', 3); } }
  function stars(t) { g.fillStyle = '#fff'; for (let i = 0; i < 160; i++) { const x = rnd(i, 1) * W, y = rnd(i, 2) * 700, a = .3 + .7 * rnd(i, Math.floor(t * 3 + i)); g.globalAlpha = a * .6; g.fillRect(x, y, 2, 2); } g.globalAlpha = 1; }

  function sVogue(t, L) { // the party's spinners on the playa, suits outlined in cyan with pink rosettes
    horizon(t);
    for (let i = 0; i < 3; i++) { const x = 520 + i * 440, s = 1.15 - Math.abs(i - 1) * .15; spinner(x, 900, s, t, CYAN, i * 2.1); rosette(x + 18 * s, 900 - 150 * s, 14 * s, PINK); }
  }
  function sDime(t, L) { // once upon a time: one dime spinning slowly, warm amber light, a man holding out a cup
    horizon(t); dime(1180, 420, 90, t, 3);
    figure(700, 900, 1.3, AMBER, t, 'beg', 3); tube(ring(820, 735, 26, 10, 16).concat(ring(820, 790, 20, 8, 16)), AMBER, 4);
  }
  function sCrime(t, L) { // nobody would think it was a crime: the dime falls into the cup
    horizon(t); figure(700, 900, 1.3, AMBER, t, 'beg', 3);
    const u = ease(t, L.s + .2, L.e - .3), x = lerp(1180, 820, u), y = lerp(420, 740, u * u);
    dime(x, y, lerp(90, 22, u), t, 6); tube(ring(820, 735, 26, 10, 16).concat(ring(820, 790, 20, 8, 16)), AMBER, 4);
  }
  function sShare(t, L) { // a poor person asks you to share: two figures, the cup held between them
    horizon(t); figure(720, 900, 1.3, AMBER, t, 'beg', 3); tube(ring(840, 735, 26, 10, 16), AMBER, 4);
    figure(1260, 900, 1.3, LIME, t, 'stand', 9); const h = ease(t, L.s + .6, L.s + 1.6); tube([[1260, 900 - 150 * 1.3], [lerp(1260, 900, h), lerp(705, 735, h)]], LIME, 5);
  }
  function sSearch(t, L) { // the era we're in: the searchlight sweeps, and the cup is gone in the glare
    horizon(t); const a = -Math.PI / 2 + Math.sin((t - L.s) * 1.3) * .9;
    gl.save(); gl.globalCompositeOperation = 'lighter'; const gr = gl.createLinearGradient(960, 1080, 960 + Math.cos(a) * 1400, 1080 + Math.sin(a) * 1400); gr.addColorStop(0, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); gl.fillStyle = gr;
    gl.beginPath(); gl.moveTo(960, 1080); gl.lineTo(960 + Math.cos(a - .09) * 1600, 1080 + Math.sin(a - .09) * 1600); gl.lineTo(960 + Math.cos(a + .09) * 1600, 1080 + Math.sin(a + .09) * 1600); gl.closePath(); gl.fill(); gl.restore();
    for (let i = 0; i < 2; i++) { const x = 400 + i * 1100; spinner(x, 900, .9, t, CYAN, i * 3); rosette(x + 16, 900 - 135, 12, PINK); }
  }

  function words(t) { // the line as neon script on the black sky, each word flickering on at its onset
    const L = lineAt(t, .05); if (!L || L.i < A || L.i > B || t > L.e + .8) return;
    const sz = 96, gap = sz * .3; gl.font = `700 ${sz}px "Futura", "Avenir Next Condensed", sans-serif`;
    const ws = L.words.map((w) => w.w), wd = ws.map((w) => gl.measureText(w).width), total = wd.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
    const s = Math.min(1, (W - 200) / total); let x = (W - total * s) / 2; const y = 200;
    const col = L.i % 2 ? CYAN : PINK;
    for (let i = 0; i < ws.length; i++) {
      const a = flick(t, L.words[i].s, L.i * 50 + i);
      if (a > 0) { gl.save(); gl.translate(x, y); gl.scale(s, s); gl.globalAlpha = a; gl.lineJoin = 'round'; gl.strokeStyle = col; gl.lineWidth = 9; gl.strokeText(ws[i], 0, 0); gl.fillStyle = 'rgba(255,255,255,.9)'; gl.fillText(ws[i], 0, 0); gl.restore(); }
      probeWord(t, L.i, i, (tt) => { const l = lineAt(tt, .05); return l === L && tt >= L.words[i].s; });
      x += (wd[i] + gap) * s;
    }
  }
  function renderFrame(t) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#05030f'); sky.addColorStop(.7, '#120822'); sky.addColorStop(1, '#030206'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    stars(t);
    gl.setTransform(1, 0, 0, 1, 0, 0); gl.clearRect(0, 0, W, H);
    const S = [{ t: -1, f: sVogue, i: A }, { t: LT(A + 1) - .1, f: sDime, i: A + 1 }, { t: LT(A + 2) - .1, f: sCrime, i: A + 2 }, { t: LT(A + 3) - .1, f: sShare, i: A + 3 }, { t: LT(A + 4) - .1, f: sSearch, i: A + 4 }];
    const [s] = shotAt(S, t); s.f(t, LINES[s.i]); words(t);
    bl.setTransform(1, 0, 0, 1, 0, 0); bl.clearRect(0, 0, W / 4, H / 4); bl.filter = 'blur(6px)'; bl.drawImage(GL, 0, 0, W / 4, H / 4); bl.filter = 'none';
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = .9; g.drawImage(BL, 0, 0, W, H); g.globalAlpha = .5; g.drawImage(BL, 0, 0, W, H); g.globalAlpha = 1; g.drawImage(GL, 0, 0);
    g.globalCompositeOperation = 'source-over';
    // reflections on the playa floor
    g.save(); g.globalAlpha = .18; g.translate(0, 1520); g.scale(1, -1); g.drawImage(GL, 0, 760, W, 320, 0, 760, W, 320); g.restore();
    drawGrain(g, t, .1, 'screen');
  }
  window.LOOK_SPAN = [T0, T1];
  startPage(out, renderFrame, T0, T1, Promise.resolve(true));
})();
