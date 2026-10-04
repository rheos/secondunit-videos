// js/ch/c5.js · MAKEOVER (85.18 - 104.4)
// The plastic-surgery party: a warm, gaudy ballroom, played completely deadpan. The one chapter that
// goes gold and pink against the night-blue film. One idea per line, cut on the lines.
// Hits are set from the beat grid and the rms peaks, not raw Whisper times (those run early).
(() => {
  // ---- cue times ----
  const LIPS = 85.91, ATTR = 86.22;
  const SQ = [87.30, 87.62, 88.02], WEIGHT = 88.30, WATCH = 88.75;
  const DATE = 89.50, DOC = 89.80;
  const NOSE = 90.95, VOICE = 91.25, UP = 91.62, OCT = 92.02;
  const TIE1 = 93.09, TIE2 = 93.44, POP = 93.81;
  const LIFT = 96.36, CHOMP = [96.69, 97.05];
  const DIS = 97.22, PLAS = 98.80, PARTY = 99.52;
  const SEAMS = [100.30, 100.98, 101.70, 102.02];
  const BURST = 102.40, PULSE = [102.80, 103.12, 103.50, 103.86];

  // ---- palette: the warm room ----
  const GOLD = '#d9a441', GOLD_D = '#7a4c1a', GOLD_HI = '#f6d58a';
  const ROSE0 = '#2a0a20', ROSE1 = '#62203e', ROSE2 = '#9a3a58', PINK = '#f27aa4', HOT = '#e8337a';
  const FLOOR0 = '#4a2016', FLOOR1 = '#a86a36';
  const MINT = '#8fd3b8', GLOVE = '#a8d6ea', PLASTER = '#f1ece2';

  // both layers in one local frame (for props that carry light, like gloss)
  function both(x, y, rot, sx, sy, fn) {
    for (const g of [s, f]) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, sy); }
    fn(); for (const g of [s, f]) g.restore();
  }
  function ell(g, x, y, rx, ry, c, r = 0) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), r, 0, TAU); g.fill(); }
  // where sheep() puts the head centre when standing (rot 0)
  const headAt = (x, y, sc, dir = 1, b = 0) => [x + dir * .98 * sc, y - 1.30 * sc + b];
  const bodyAt = (x, y, sc, b = 0) => [x, y - 1.04 * sc + b];

  // ---- the room ----
  function chandelier(t, x, y, sc, sw = 0, a = 1) {
    const px = x, py = y - 1100, cx = px + Math.sin(sw) * 1100, cy = py + Math.cos(sw) * 1100;
    stroke(s, [[px, py], [cx, cy - 120 * sc]], GOLD_D, 7 * sc);
    ell(s, cx, cy - 150 * sc, 34 * sc, 34 * sc, GOLD);
    poly(s, [[cx - 200 * sc, cy], [cx + 200 * sc, cy], [cx + 60 * sc, cy + 110 * sc], [cx, cy + 170 * sc], [cx - 60 * sc, cy + 110 * sc]], GOLD);
    ell(s, cx, cy, 210 * sc, 34 * sc, GOLD_HI);
    ell(s, cx, cy + 6 * sc, 190 * sc, 22 * sc, GOLD_D);
    const r = rng(Math.round(x));
    for (let i = 0; i < 9; i++) {
      const u = i / 8 * 2 - 1, ax = cx + u * 230 * sc, ay = cy - 40 * sc - (1 - u * u) * 30 * sc;
      stroke(s, [[cx + u * 120 * sc, cy], [ax, ay + 30 * sc], [ax, ay]], GOLD, 9 * sc);
      s.fillStyle = P.cream; s.fillRect(ax - 7 * sc, ay - 36 * sc, 14 * sc, 36 * sc);
      const fl = .75 + .25 * noise1(t * 7 + i * 3, 5);
      glow(ax, ay - 44 * sc, 70 * sc, `rgba(255,200,120,${.55 * a * fl})`);
      dot(f, ax, ay - 44 * sc, 7 * sc, `rgba(255,240,200,${.9 * a})`);
      // crystal drops
      const dx = cx + (r() * 2 - 1) * 170 * sc, dy = cy + 30 * sc + r() * 120 * sc;
      dot(s, dx, dy, 8 * sc, '#f3e2c0');
      dot(f, dx, dy, 5 * sc, `rgba(255,245,230,${a * (.3 + .7 * Math.max(0, Math.sin(t * 5 + i * 1.7)))})`);
    }
    glow(cx, cy - 20 * sc, 620 * sc, `rgba(255,170,90,${.22 * a})`);
  }
  function ballroom(t, { x0 = -600, x1 = 2520, top = -900, floor = 830, bottom = 1900, chand = [[960, 170, 1]], swing = 0, lamp = 1, guests = 0 } = {}) {
    s.fillStyle = vgrad(s, top, floor, [[0, ROSE0], [.45, ROSE1], [1, ROSE2]]); s.fillRect(x0, top, x1 - x0, floor - top);
    // arched wall panels between gold pilasters
    const pil = vgrad(s, top, floor, [[0, '#5a3614'], [.5, GOLD], [1, '#8a5a22']]);
    for (let x = Math.floor(x0 / 380) * 380; x < x1; x += 380) {
      const ax = x + 190;
      s.fillStyle = '#7c2c4c'; s.beginPath(); s.moveTo(ax - 130, floor - 60); s.lineTo(ax - 130, 280); s.arc(ax, 280, 130, Math.PI, 0); s.lineTo(ax + 130, floor - 60); s.fill();
      s.strokeStyle = GOLD; s.lineWidth = 12; s.stroke();
      s.fillStyle = pil; s.fillRect(x - 24, top, 48, floor - top);
      dot(s, ax, 200, 26, GOLD_HI);
    }
    // swagged curtains along the top
    for (let x = Math.floor(x0 / 300) * 300; x < x1; x += 300) {
      s.fillStyle = HOT; s.beginPath(); s.moveTo(x, top); s.lineTo(x, 40); s.quadraticCurveTo(x + 150, 170, x + 300, 40); s.lineTo(x + 300, top); s.fill();
      s.fillStyle = '#a81d57'; s.beginPath(); s.moveTo(x, 40); s.quadraticCurveTo(x + 150, 170, x + 300, 40); s.quadraticCurveTo(x + 150, 120, x, 40); s.fill();
      dot(s, x, 50, 22, GOLD);
    }
    // polished floor with a gold runner
    s.fillStyle = vgrad(s, floor, bottom, [[0, FLOOR1], [.35, '#7a4424'], [1, FLOOR0]]); s.fillRect(x0, floor, x1 - x0, bottom - floor);
    s.fillStyle = '#b52e5e'; s.fillRect(x0, floor + 60, x1 - x0, 90);
    for (const [cx, cy, sc] of chand) glow(cx, floor + 120, 420 * sc, `rgba(255,190,110,${.12 * lamp})`);
    for (let i = 0; i < guests; i++) {
      const gx = x0 + 300 + hash(i * 13 + 5) * (x1 - x0 - 600), gs = 70 + hash(i * 7) * 30;
      sheep(t, gx, floor + 40 + hash(i * 3) * 30, gs, { sil: true, dir: hash(i) > .5 ? 1 : -1, seed: 40 + i, bob: -bob(t + i * .2) * 6 });
    }
    for (const [cx, cy, sc] of chand) chandelier(t, cx, cy, sc, swing * Math.sin(t * 1.3 + cx), lamp);
  }

  // ---- a sheep head, face on, with makeover options ----
  function face(x, y, r, o = {}) {
    const { sx = 1, sy = 1, rot = 0, lids = .55, look = [0, 0], lips = 0, mask = 0, cap = 0, band = 0, chin = 0, gloss = 0 } = o;
    both(x, y, rot, sx, sy, () => {
      for (const d of [-1, 1]) { s.save(); s.translate(d * .27 * r, -.06 * r); s.rotate(d * .55); ell(s, 0, 0, .19 * r, .065 * r, FACE); s.restore(); }
      ell(s, 0, 0, .26 * r, .35 * r, FACE);
      if (!cap) for (let i = 0; i < 3; i++) dot(s, (i - 1) * .11 * r, -.33 * r - (i === 1 ? .04 * r : 0), .12 * r, WOOL);
      for (const d of [-1, 1]) {
        const ex = d * .11 * r, ey = -.05 * r, rx = .078 * r, ry = .06 * r;
        s.save(); s.beginPath(); s.ellipse(ex, ey, rx, ry, 0, 0, TAU); s.clip();
        s.fillStyle = '#f2eee4'; s.fillRect(ex - rx, ey - ry, rx * 2, ry * 2);
        dot(s, ex + look[0] * .03 * r, ey + .012 * r + look[1] * .02 * r, .036 * r, '#0a0a0f');
        s.fillStyle = FACE; s.fillRect(ex - rx, ey - ry, rx * 2, ry * 2 * lids); s.restore();
        stroke(s, [[ex - rx, ey - ry + ry * 2 * lids], [ex + rx, ey - ry + ry * 2 * lids]], '#4a4452', .018 * r);
      }
      if (lips > 0) {
        const L = lips;
        ell(s, 0, .235 * r, .14 * L * r, .08 * L * r, '#c81d5e');
        for (const d of [-1, 1]) ell(s, d * .06 * L * r, .17 * r, .075 * L * r, .055 * L * r, '#ff4f8a', -d * .25);
        ell(s, 0, .245 * r, .12 * L * r, .06 * L * r, '#ff5c93');
        stroke(s, [[-.12 * L * r, .2 * r], [.12 * L * r, .2 * r]], '#7a0f35', .012 * r * L);
        dot(f, -.05 * L * r, .225 * r, .016 * L * r, `rgba(255,215,230,${.35 + .3 * gloss})`);
        dot(f, .07 * L * r, .16 * r, .01 * L * r, 'rgba(255,215,230,.35)');
      } else stroke(s, [[-.06 * r, .2 * r], [.06 * r, .21 * r]], '#5d5563', .02 * r);
      if (mask) {
        s.fillStyle = MINT; s.beginPath(); s.moveTo(-.25 * r, .05 * r); s.quadraticCurveTo(0, .0, .25 * r, .05 * r); s.lineTo(.2 * r, .3 * r); s.quadraticCurveTo(0, .4 * r, -.2 * r, .3 * r); s.closePath(); s.fill();
        for (const k of [.12, .2, .28]) stroke(s, [[-.18 * r, k * r], [.18 * r, k * r]], '#6cb49a', .012 * r);
        for (const d of [-1, 1]) stroke(s, [[d * .24 * r, .08 * r], [d * .3 * r, -.06 * r]], '#e8f4ee', .014 * r);
      }
      if (cap) { s.fillStyle = MINT; s.beginPath(); s.ellipse(0, -.28 * r, .3 * r, .2 * r, 0, Math.PI, TAU); s.fill(); ell(s, 0, -.28 * r, .31 * r, .04 * r, '#6cb49a'); }
      if (band) { s.save(); s.rotate(-.7); s.fillStyle = PLASTER; s.fillRect(-.4 * r, -.1 * r, .8 * r, .15 * r); for (let k = -3; k <= 3; k++) stroke(s, [[k * .1 * r, -.1 * r], [k * .1 * r + .05 * r, .05 * r]], '#b8ad9c', .012 * r); s.restore(); }
      if (chin) { s.fillStyle = PLASTER; s.beginPath(); s.ellipse(0, .06 * r, .3 * r, .38 * r, 0, 0, TAU); s.ellipse(0, .04 * r, .2 * r, .3 * r, 0, 0, TAU); s.fill('evenodd'); s.fillRect(-.3 * r, .12 * r, .6 * r, .14 * r); for (const d of [-1, 1]) ell(s, d * .1 * r, -.42 * r, .1 * r, .06 * r, PLASTER, d * .6); }
    });
  }

  // ---------- 1 · through the doors, lips (85.18 - 86.78) ----------
  function lips(t, lt, dur) {
    const open = ease.out(inv(.02, .5, lt)), push = ease.in(inv(.12, 1.0, lt));
    const [hx, hy] = headAt(900, 980, 230, 1);
    const inflate = kf(t, [[LIPS - .12, .32], [LIPS + .12, 1.05], [ATTR - .05, 1.0], [ATTR + .16, 2.1], [ATTR + .5, 1.95]], ease.back);
    const [sx, sy] = shake(t, 5 * hit(t, ATTR, 8));
    const z = lerp(.72, 3.1, ease.inOut(inv(.1, dur * .8, lt)));
    cam(lerp(960, hx, ease.inOut(inv(0, .9, lt))) + sx, lerp(560, hy + 60, ease.inOut(inv(0, .9, lt))) + sy, z);
    ballroom(t, { chand: [[520, 150, .8], [1500, 150, .8]], guests: 5, x0: -900, x1: 2800 });
    sheep(t, 900, 980, 230, { seed: 5, lids: .6, bob: -bob(t) * 5 });
    // pearls, the party dress code
    for (let i = 0; i < 9; i++) { const u = i / 8, px = hx - 120 + u * 170, py = hy + 110 + Math.sin(u * Math.PI) * 55; dot(s, px, py, 13, '#f7efe0'); dot(f, px - 3, py - 3, 4, 'rgba(255,250,240,.6)'); }
    face(hx, hy, 230, { rot: .12, lids: .6, lips: inflate, gloss: hit(t, ATTR, 4) });
    glow(hx, hy + 50, 260, `rgba(255,90,150,${.25 * hit(t, LIPS, 5) + .3 * hit(t, ATTR, 4)})`);
    // the doors (screen space), swinging open and rushing past the lens
    screen(() => {
      const k = 1 + push * 4.5, dw = 380 * k, dh = 560 * k, cx = 960, cy = 560;
      s.save(); s.fillStyle = '#10143a'; s.beginPath(); s.rect(-10, -10, W + 20, H + 20); s.rect(cx - dw, cy - dh, dw * 2, dh * 2); s.fill('evenodd');
      f.save(); f.fillStyle = '#000'; f.beginPath(); f.rect(-10, -10, W + 20, H + 20); f.rect(cx - dw, cy - dh, dw * 2, dh * 2); f.fill('evenodd'); f.restore();
      s.strokeStyle = '#4a3322'; s.lineWidth = 30 * k; s.strokeRect(cx - dw, cy - dh, dw * 2, dh * 2);
      for (const d of [-1, 1]) {
        const pw = dw * (1 - open * .82), x0 = cx + d * dw, x1 = x0 - d * pw, sk = open * 70 * k;
        poly(s, [[x0, cy - dh], [x1, cy - dh + sk], [x1, cy + dh - sk], [x0, cy + dh]], '#3b1c22');
        const ix = lerp(x0, x1, .18), jx = lerp(x0, x1, .82);
        s.strokeStyle = GOLD; s.lineWidth = 10 * k; s.beginPath(); s.moveTo(ix, cy - dh * .8 + sk * .8); s.lineTo(jx, cy - dh * .8 + sk * .8); s.lineTo(jx, cy + dh * .8 - sk * .8); s.lineTo(ix, cy + dh * .8 - sk * .8); s.closePath(); s.stroke();
        dot(s, lerp(x0, x1, .9), cy, 14 * k, GOLD_HI);
      }
      s.restore();
      glow(cx, cy, 400 + 500 * open, `rgba(255,190,110,${.3 * (1 - push)})`);
      if (open < .15) { f.save(); f.globalCompositeOperation = 'lighter'; f.fillStyle = `rgba(255,210,140,${.8 * (1 - open / .15)})`; f.fillRect(cx - 8 - open * 200, cy - dh, 16 + open * 400, dh * 2); f.restore(); }
    });
    flash(.15 * hit(t, 85.18 + .2, 6), '#ffcf8a');
  }

  // ---------- 2 · faces on the glass, then the scale (86.78 - 89.22) ----------
  function glass(t, lt, dur) {
    const tilt = ease.inOut(inv(88.05, 88.5, t));
    const [sx, sy] = shake(t, 4 * SQ.reduce((a, x) => a + hit(t, x, 9), 0) + 3 * hit(t, WATCH, 7));
    cam(lerp(930, 1000, inv(0, dur, lt)) + sx, lerp(430, 1130, tilt) + sy, lerp(1.08, 1.5, tilt) + lt * .02);
    ballroom(t, { chand: [[960, 110, .7]], floor: 1000, guests: 0, x0: -400, x1: 2400, bottom: 1700 });
    s.fillStyle = rgrad(s, 960, 380, 80, 1000, [[0, '#ffd9a0'], [.5, '#f29a9a'], [1, '#b8466a']]); s.fillRect(150, 90, 1620, 700);
    glow(960, 300, 700, 'rgba(255,200,140,.25)');
    // three faces behind the pane, arriving and squashing flat, one per hit
    [[560, 1], [960, 0], [1360, 2]].forEach(([x, k], i) => {
      const t0 = SQ[k], arr = ease.out(inv(t0 - .55, t0 - .05, t));
      const sq = kf(t, [[t0 - .03, 0], [t0 + .1, 1.12], [t0 + .3, 1]], ease.back);
      const r = lerp(420, 560, arr) * (1 + .06 * sq);
      face(x + (i - 1) * 10 * sq, 440 + (1 - arr) * 60 + 30 * sq, r, { sx: 1 + .55 * sq, sy: 1 - .4 * sq, lids: .62 - .12 * sq, look: [0, .3] });
      if (sq > .05) { ell(s, x, 470 + 30 * sq, 200 * sq, 60 * sq, 'rgba(250,225,235,.12)'); }
      glow(x, 470, 240 * sq, `rgba(230,220,255,${.18 * sq})`); // breath fog on the glass
    });
    // the pane: gold frame, mullions, reflections
    s.strokeStyle = GOLD; s.lineWidth = 40; s.strokeRect(150, 90, 1620, 700);
    stroke(s, [[760, 90], [760, 790]], GOLD, 22); stroke(s, [[1160, 90], [1160, 790]], GOLD, 22);
    for (let i = 0; i < 3; i++) { const x = 300 + i * 520 + lt * 60; stroke(f, [[x, 110], [x + 180, 110], [x - 60, 770], [x - 200, 770]].slice(0, 2).concat([[x - 60, 770]]), 'rgba(255,240,255,.05)', 60); }
    s.fillStyle = '#5a2240'; s.fillRect(-400, 790, 2800, 210);
    stroke(s, [[-400, 800], [2400, 800]], GOLD_D, 20);
    // the bathroom scale on the floor, a sheep on it, the needle spinning out
    const sx0 = 960, sy0 = 1300;
    ell(s, sx0, sy0 + 40, 330, 60, 'rgba(40,10,10,.5)');
    s.fillStyle = PINK; s.beginPath(); s.roundRect(sx0 - 300, sy0 - 60, 600, 110, 40); s.fill();
    s.fillStyle = '#c85a82'; s.fillRect(sx0 - 290, sy0 + 20, 580, 26);
    const spin = (t - WEIGHT) > 0 ? (t - WEIGHT) * 9 + Math.max(0, t - WATCH) * 30 : Math.sin(t * 3) * .1;
    const [dx, dy] = [sx0 + 190, sy0 - 5];
    ell(s, dx, dy, 78, 44, '#f6efe2');
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; stroke(s, [[dx + Math.cos(a) * 60, dy + Math.sin(a) * 34], [dx + Math.cos(a) * 72, dy + Math.sin(a) * 41]], '#8a6070', 5); }
    stroke(s, [[dx, dy], [dx + Math.cos(spin - 1.57) * 64, dy + Math.sin(spin - 1.57) * 36]], P.red, 9);
    glow(dx, dy, 120, `rgba(255,120,140,${.25 * hit(t, WEIGHT, 3) + .35 * hit(t, WATCH, 3)})`);
    const hop = -Math.abs(Math.sin((t - WATCH) * 14)) * 20 * inv(WATCH, WATCH + .05, t) * (1 - inv(WATCH + .3, WATCH + .5, t));
    sheep(t, sx0 - 60, sy0 - 60, 190, { seed: 9, lids: .6, look: [.3, .8], bob: hop - bob(t) * 4 });
  }

  // ---------- 3 · the date doctor (89.22 - 90.58) ----------
  function doctor(t, lt, dur) {
    const offer = ease.back(inv(DOC - .12, DOC + .2, t)), lean = ease.out(inv(DATE - .1, DATE + .2, t));
    cam(lerp(1020, 860, ease.inOut(lt / dur)), lerp(760, 700, lt / dur), lerp(1.45, 1.9, ease.inOut(lt / dur)));
    ballroom(t, { chand: [[700, 260, .9], [1500, 230, .6]], guests: 0, floor: 900 });
    // a little table for two, a candle
    s.fillStyle = '#f0e2cc'; s.beginPath(); s.moveTo(430, 900); s.lineTo(870, 900); s.lineTo(920, 1180); s.lineTo(380, 1180); s.fill();
    s.fillStyle = '#e9d6b8'; s.fillRect(380, 1100, 540, 80);
    s.fillStyle = P.cream; s.fillRect(640, 800, 22, 100); dot(s, 651, 790, 10, '#ffd27a');
    glow(651, 785, 150, `rgba(255,190,110,${.5 + .2 * noise1(t * 6, 2) + .4 * hit(t, DATE, 4)})`); dot(f, 651, 788, 9, 'rgba(255,240,200,.9)');
    const X = 1180, Y = 1080, SC = 260, [hx, hy] = headAt(X, Y, SC, -1, -bob(t) * 5);
    sheep(t, X, Y, SC, { dir: -1, seed: 12, lids: .6, bob: -bob(t) * 5 });
    // a raised foreleg holding out the rose
    const hoof = [lerp(hx + 60, hx - 130 - 140 * offer, lean), lerp(hy + 230, hy + 80 - 60 * offer, lean)];
    taper(s, [X - 170, Y - 300], hoof, 34, 26, FACE);
    const rs = lerp(1, 1.9, offer), rx = hoof[0] - 10, ry = hoof[1] - 60 * rs;
    stroke(s, [hoof, [rx, ry]], '#2f6a36', 9);
    ell(s, rx - 26 * rs, ry + 30 * rs, 26 * rs, 10 * rs, '#3f8a44', -.6);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t; dot(s, rx + Math.cos(a) * 24 * rs, ry + Math.sin(a) * 20 * rs, 24 * rs, i % 2 ? '#c4142e' : '#e02a40'); }
    dot(s, rx, ry, 22 * rs, '#8e0b22');
    glow(rx, ry, 160 * rs, `rgba(255,60,90,${.3 * offer})`);
    face(hx, hy - bob(t) * 0, SC, { rot: -.12, lids: .62, look: [-.4, .2], mask: 1, cap: 1 });
  }

  // ---------- 4 · the nose job, and the head goes up an octave (90.58 - 92.54) ----------
  function profile(x, y, r, slope, lids = .6) {
    for (const g of [s]) {
      g.save(); g.translate(x, y);
      g.save(); g.translate(-.2 * r, -.08 * r); g.rotate(.9); ell(g, 0, 0, .2 * r, .07 * r, FACE); g.restore();
      ell(g, 0, 0, .3 * r, .26 * r, FACE, .15);
      // snout: a big roman hump before, a neat ski slope after
      ell(g, lerp(.34, .3, slope) * r, lerp(.16, .1, slope) * r, lerp(.3, .17, slope) * r, lerp(.18, .09, slope) * r, FACE, lerp(.55, -.45, slope));
      if (slope < 1) dot(g, .3 * r, -.04 * r, .19 * r * clamp(1 - slope), FACE);
      dot(g, lerp(.58, .45, slope) * r, lerp(.3, 0, slope) * r, lerp(.06, .045, slope) * r, lerp(.06, .045, slope) > 0 ? '#2a2430' : FACE);
      if (slope > .5) dot(g, .47 * r, -.03 * r, .05 * r, FACE);
      for (let i = 0; i < 3; i++) dot(g, (-.12 + i * .1) * r, (-.25 - (i === 1 ? .04 : 0)) * r, .11 * r, WOOL);
      const ex = .06 * r, ey = -.06 * r, rx = .07 * r, ry = .055 * r;
      g.save(); g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, TAU); g.clip(); g.fillStyle = '#f2eee4'; g.fillRect(ex - rx, ey - ry, 2 * rx, 2 * ry);
      dot(g, ex + .03 * r, ey + .01 * r, .033 * r, '#0a0a0f'); g.fillStyle = FACE; g.fillRect(ex - rx, ey - ry, 2 * rx, 2 * ry * lids); g.restore();
      stroke(g, [[ex - rx, ey - ry + 2 * ry * lids], [ex + rx, ey - ry + 2 * ry * lids]], '#4a4452', .016 * r);
      stroke(g, [[.3 * r, .2 * r], [.4 * r, .22 * r]], '#5d5563', .016 * r);
      g.restore();
    }
  }
  function mitten(x, y, r, dir, sleeveEnd) {
    taper(s, sleeveEnd, [x - dir * 30, y], 50, 44, '#4f9a86');
    ell(s, x, y, r, r * .75, GLOVE); ell(s, x - dir * r * .3, y - r * .7, r * .35, r * .25, GLOVE, .4);
  }
  function nose(t, lt, dur) {
    const slope = ease.back(inv(NOSE - .05, NOSE + .25, t));
    const rise = kf(t, [[VOICE - .05, 0], [VOICE + .15, 170], [UP - .05, 170], [UP + .15, 360], [OCT - .05, 360], [OCT + .18, 600]], ease.back);
    const X = 900, Y0 = 820, R = 330, hy = Y0 - rise;
    const [sx, sy] = shake(t, 5 * hit(t, NOSE, 10));
    cam(lerp(1080, 1000, lt / dur) + sx, lerp(820, hy + 60, ease.out(inv(VOICE - .1, OCT + .3, t))) + sy, lerp(1.7, 1.35, ease.inOut(inv(VOICE - .2, OCT + .3, t))));
    ballroom(t, { chand: [[960, -120, 1.1]], guests: 3, floor: 900, top: -1400 });
    // wool neck stretching from the body below
    const n = Math.max(1, Math.round(rise / 60) + 3);
    ell(s, X - 260, 1200, 480, 250, WOOL_SH); ell(s, X - 260, 1150, 440, 210, WOOL);
    for (let i = 0; i < n; i++) { const u = i / (n - 1), px = X - 90 - 40 * u + Math.sin(i * 1.7) * 14, py = lerp(1080, hy + 80, u); dot(s, px, py, 120 - 20 * u, i % 2 ? WOOL_SH : WOOL); dot(s, px - 30, py - 20, 60, WOOL_HI); }
    profile(X, hy, R, slope);
    // surgeon's gloved hands pinch the nose into shape, then leave
    const inK = ease.out(inv(90.58, NOSE - .08, t)) * (1 - ease.in(inv(NOSE + .3, NOSE + .7, t)));
    if (inK > .01) {
      const nx = X + .3 * R, ny = hy + .08 * R;
      mitten(nx + lerp(700, 60, inK), ny - 110 - 40 * (1 - inK), 70, 1, [nx + 1100, ny - 400]);
      mitten(nx + lerp(700, 70, inK), ny + 120 + 40 * (1 - inK), 70, 1, [nx + 1100, ny + 500]);
    }
    for (const [tt, k] of [[NOSE, 1], [VOICE, .7], [UP, .8], [OCT, 1]]) {
      const h = hit(t, tt, 4); if (h < .02) continue;
      s.save(); f.save(); f.globalCompositeOperation = 'lighter';
      f.strokeStyle = `rgba(255,210,150,${.5 * h * k})`; f.lineWidth = 8; f.beginPath(); f.ellipse(X + .1 * R, hy, (1.5 - h) * 420, (1.5 - h) * 320, 0, 0, TAU); f.stroke();
      f.restore(); s.restore();
    }
    glow(X + .4 * R, hy + .1 * R, 200, `rgba(255,200,160,${.4 * hit(t, NOSE, 5)})`);
  }

  // ---------- 5 · the sausage dress (92.54 - 94.46) ----------
  function sausage(t, lt, dur) {
    const tight = kf(t, [[TIE1 - .05, 0], [TIE1 + .12, .5], [TIE2 - .05, .5], [TIE2 + .12, 1]], ease.back);
    const pop = ease.back(inv(POP - .05, POP + .2, t));
    const X = 1000, Y = 1000, SC = 250, b = -bob(t) * 5;
    const [sx, sy] = shake(t, 5 * hit(t, TIE1, 9) + 5 * hit(t, TIE2, 9) + 8 * hit(t, POP, 8));
    cam(lerp(880, 1120, ease.inOut(lt / dur)) + sx, lerp(760, 700, lt / dur) + sy, lerp(1.35, 1.65, ease.inOut(lt / dur)));
    ballroom(t, { chand: [[400, 100, .8], [1500, 100, .8]], guests: 6, floor: 860 });
    // a spotlight pool on the floor
    ell(s, X, Y + 10, 560, 90, '#c88a52'); glow(X, Y - 200, 700, 'rgba(255,190,140,.18)');
    sheep(t, X, Y, SC, { seed: 14, lids: .62, bob: b, look: [0, .2] });
    const [bx, by] = bodyAt(X, Y, SC, b);
    // wool bursting out at the neck and the tail as the casing tightens
    const puff = .3 + .7 * pop;
    for (const [px, py, r] of [[-1.05, -.05, .38], [-.95, -.4, .3], [-1.1, .3, .3], [.7, -.45, .28], [.75, .35, .26]]) dot(s, bx + px * SC * (1 + .12 * pop), by + py * SC, r * SC * puff, WOOL);
    // the casing: one glossy tube, pinched into links by gold ties on each hit
    const x0 = bx - .95 * SC, x1 = bx + .8 * SC, ties = [1 / 3, 2 / 3];
    const rad = (u) => SC * (.47 + .04 * pop * Math.sin(t * 22 + u * 9)) * (1 - ties.reduce((q, c) => q + .55 * tight * Math.exp(-((u - c) ** 2) / .004), 0)) * Math.sqrt(Math.max(0, 1 - Math.pow(2 * u - 1, 8)));
    for (const [col, k, dy] of [['#b0205e', 1, .03], [HOT, .93, 0], ['#ff72a8', .5, -.18]]) {
      s.fillStyle = col; s.beginPath();
      for (let i = 0; i <= 40; i++) { const u = i / 40; s.lineTo(lerp(x0, x1, u), by + dy * SC - rad(u) * k); }
      for (let i = 40; i >= 0; i--) { const u = i / 40; s.lineTo(lerp(x0, x1, u), by + dy * SC + rad(u) * k * (dy < 0 ? .3 : 1)); }
      s.fill();
    }
    for (const c of [1 / 6, .5, 5 / 6]) { const x = lerp(x0, x1, c); dot(f, x - 20, by - rad(c) * .6, 12, 'rgba(255,225,240,.5)'); glow(x, by - rad(c) * .4, 80, 'rgba(255,120,180,.14)'); }
    for (const c of ties) {
      const x = lerp(x0, x1, c), pinch = rad(c) * 1.05;
      dot(s, x - 16, by - pinch - 10, 26 * (.4 + pop), WOOL_HI); dot(s, x + 18, by + pinch + 6, 22 * (.4 + pop), WOOL_HI); // wool poking out of the ties
      stroke(s, [[x, by - pinch], [x, by + pinch]], GOLD, 20);
      ell(s, x, by - pinch - 16, 30, 16, GOLD_HI);
    }
    glow(bx, by, 700, `rgba(255,120,180,${.25 * hit(t, POP, 4)})`);
    const [hx, hy] = headAt(X, Y, SC, 1, b);
    face(hx, hy, SC, { rot: .12, lids: .64, look: [-.2, .3] });
  }

  // ---------- 6 · a formal dinner, and the cloche (94.46 - 97.22) ----------
  function monster(t, x, y, r) {
    const chomp = CHOMP.reduce((a, c) => a + hit(t, c, 9), 0);
    const R = rng(77);
    ell(s, x, y - .6 * r, r, .7 * r, '#5b2a8a');
    for (let i = 0; i < 40; i++) { const a = R() * TAU, d = .8 + R() * .3; dot(s, x + Math.cos(a) * r * d, y - .6 * r + Math.sin(a) * .66 * r * d, (.1 + R() * .1) * r, i % 3 ? '#6f35a8' : '#48206e'); }
    for (let i = 0; i < 14; i++) dot(s, x + (R() - .5) * 1.4 * r, y - .9 * r + (R() - .5) * .5 * r, .12 * r, '#8a4fc4');
    // a wide mouth of square teeth
    const mh = .22 * r + .12 * r * chomp;
    ell(s, x, y - .45 * r, .62 * r, mh, '#200a24');
    for (let i = 0; i < 7; i++) { const tx = x + (i - 3) * .16 * r; poly(s, [[tx - .07 * r, y - .45 * r - mh * .9], [tx + .07 * r, y - .45 * r - mh * .9], [tx, y - .45 * r - mh * .9 + .14 * r]], '#f4efe0'); poly(s, [[tx - .07 * r + .08 * r, y - .45 * r + mh * .9], [tx + .07 * r + .08 * r, y - .45 * r + mh * .9], [tx + .08 * r, y - .45 * r + mh * .9 - .12 * r]], '#f4efe0'); }
    // heavy lids, like everyone else
    for (const d of [-1, 1]) {
      const ex = x + d * .3 * r, ey = y - .95 * r;
      ell(s, ex, ey, .16 * r, .13 * r, '#f2eee4'); dot(s, ex, ey + .04 * r, .06 * r, '#0a0a0f');
      s.fillStyle = '#48206e'; s.fillRect(ex - .17 * r, ey - .14 * r, .34 * r, .15 * r);
    }
  }
  function dinner(t, lt, dur) {
    const lift = ease.back(inv(LIFT - .1, LIFT + .25, t)), peek = .06 * smooth(inv(LIFT - .5, LIFT - .2, t));
    const [sx, sy] = shake(t, 6 * hit(t, LIFT, 8) + 3 * CHOMP.reduce((a, c) => a + hit(t, c, 10), 0));
    cam(lerp(560, 960, ease.inOut(inv(0, 1.9, lt))) + sx, lerp(560, 640, ease.inOut(inv(0, dur, lt))) + sy, lerp(1.0, 1.4, ease.inOut(inv(.4, dur, lt))));
    ballroom(t, { chand: [[400, 60, .8], [1300, 40, .9]], guests: 0, floor: 820, x0: -900 });
    // three diners in bow ties behind the long table, all staring at the plate
    [[560, 1], [1000, 0], [1440, -1]].forEach(([x, d], i) => {
      const b = -bob(t + i * .15) * 4, [hx, hy] = [x, 560 + b];
      ell(s, x, 820 + b, 230, 170, WOOL_SH); ell(s, x, 790 + b, 210, 150, WOOL);
      for (let k = 0; k < 5; k++) dot(s, x - 160 + k * 80, 690 + b, 60, WOOL_HI);
      const lookDown = lerp(-.2, .9, ease.out(inv(LIFT, LIFT + .3, t)));
      face(hx, hy, 300, { rot: d * .08, lids: .62, look: [-d * .6 * (1 - inv(LIFT, LIFT + .3, t)), lookDown] });
      poly(s, [[hx - 70, hy + 140], [hx, hy + 170], [hx - 70, hy + 200]], '#1a1420'); poly(s, [[hx + 70, hy + 140], [hx, hy + 170], [hx + 70, hy + 200]], '#1a1420'); dot(s, hx, hy + 170, 18, '#2a2230');
    });
    // table and candelabras
    s.fillStyle = '#f3e8d4'; s.fillRect(-900, 860, 3600, 400); s.fillStyle = '#d8c6a8'; s.fillRect(-900, 860, 3600, 30);
    s.fillStyle = '#e2d2b6'; for (let x = -900; x < 2700; x += 160) { s.beginPath(); s.moveTo(x, 1180); s.quadraticCurveTo(x + 80, 1230, x + 160, 1180); s.lineTo(x + 160, 1300); s.lineTo(x, 1300); s.fill(); }
    for (const cx of [200, 1800]) {
      stroke(s, [[cx, 870], [cx, 700]], GOLD, 16); stroke(s, [[cx - 80, 720], [cx - 80, 760], [cx + 80, 760], [cx + 80, 720]], GOLD, 12);
      for (const dx of [-80, 0, 80]) { s.fillStyle = P.cream; s.fillRect(cx + dx - 8, 640 - (dx ? -40 : 0), 16, 60); glow(cx + dx, 630 - (dx ? -40 : 0), 120, `rgba(255,190,110,${.6 + .2 * noise1(t * 7 + dx, 3)})`); dot(f, cx + dx, 632 - (dx ? -40 : 0), 8, 'rgba(255,240,200,.9)'); }
    }
    // the plate, the monster and the silver cloche
    const PX = 1000, PY = 960;
    ell(s, PX, PY + 10, 300, 60, '#d8d2c8'); ell(s, PX, PY, 250, 44, '#f6f2ea');
    if (lift > 0.02 || peek > 0) monster(t, PX, PY, 190);
    const cy = PY - 10 - lift * 520 - peek * 200, ctil = lift * .25;
    s.save(); s.translate(PX + lift * 120, cy); s.rotate(ctil);
    s.fillStyle = '#b8bcc8'; s.beginPath(); s.ellipse(0, 0, 270, 230, 0, Math.PI, TAU); s.fill();
    s.fillStyle = '#e4e8f0'; s.beginPath(); s.ellipse(-60, -60, 120, 120, 0, Math.PI, TAU); s.fill();
    ell(s, 0, 0, 280, 22, '#8e92a0'); ell(s, 0, -240, 34, 24, '#9ea2b0');
    s.restore();
    f.save(); f.translate(PX + lift * 120, cy); f.rotate(ctil); dot(f, -110, -130, 36, 'rgba(255,245,230,.55)'); f.restore();
    glow(PX, PY - 100, 500, `rgba(190,120,255,${.35 * hit(t, LIFT, 3)})`);
  }

  // ---------- 7 · the plaster party (97.22 - 100.04) ----------
  function castSheep(t, x, y, sc, i) {
    const dir = i % 2 ? -1 : 1, b = -Math.abs(Math.sin((t - B0) / BEAT * Math.PI + i)) * 18;
    const [bx, by] = bodyAt(x, y, sc, b);
    if (i % 3 === 1) { // a crutch under the chest
      const cx = bx + dir * .55 * sc; stroke(s, [[cx, by + .2 * sc], [cx + dir * .25 * sc, y]], '#8a5a2a', .07 * sc); stroke(s, [[cx - .18 * sc, by + .18 * sc], [cx + .18 * sc, by + .22 * sc]], '#8a5a2a', .08 * sc);
    }
    sheep(t, x, y, sc, { seed: 60 + i, dir, lids: .6, bob: b });
    for (const leg of i % 2 ? [.5 * dir] : [.5 * dir, -.36 * dir]) { taper(s, [bx + leg * sc, by + .45 * sc], [bx + leg * sc, y - .02 * sc], .16 * sc, .15 * sc, PLASTER); for (let k = 0; k < 4; k++) { const yy = lerp(by + .55 * sc, y - .12 * sc, k / 3); stroke(s, [[bx + (leg - .15) * sc, yy], [bx + (leg + .15) * sc, yy - .08 * sc]], '#b8ad9c', .025 * sc); } }
    const [hx, hy] = headAt(x, y, sc, dir, b);
    face(hx, hy, sc, { rot: dir * .12, lids: .62, band: i % 2 === 0 ? 1 : 0, chin: i % 2 });
  }
  function plaster(t, lt, dur) {
    const crane = ease.inOut(inv(0, .75, lt));
    const [sx, sy] = shake(t, 10 * hit(t, PLAS, 6) + 4 * hit(t, DIS, 8));
    cam(lerp(1000, 900, lt / dur) + sx, lerp(200, 820, crane) + sy, lerp(1.4, 1.25, crane) + .05 * lt);
    ballroom(t, { chand: [[960, 150, 1.2]], floor: 860, guests: 0, swing: .02 + .08 * hit(t, PLAS, 1.5), x0: -900 });
    [[260, 950, 120], [700, 930, 110], [1200, 945, 125], [1660, 940, 115], [950, 1200, 210], [430, 1240, 200], [1500, 1230, 205]].forEach(([x, y, sc], i) => castSheep(t, x, y, sc, i));
    // plaster dust snowing down, a burst from the ceiling on the hit
    const R = rng(91);
    for (let i = 0; i < 220; i++) {
      const x0 = R() * 2600 - 400, sp = 80 + R() * 120, ph = R() * 2000, burst = i < 50 ? ease.out(inv(PLAS, PLAS + .8, t)) * 400 : 0;
      const y = ((ph + (t - DIS) * sp) % 1700) - 500 + burst * R(), x = x0 + Math.sin(t * 1.5 + i) * 30;
      if (t < DIS + .05 && i > 30) continue;
      dot(s, x, y, 7 + R() * 8, '#efe6d6'); dot(f, x, y, 3, 'rgba(255,245,225,.25)');
    }
    const pb = ease.out(inv(PLAS, PLAS + .9, t)) * (1 - inv(PLAS + .8, PLAS + 1.6, t));
    for (let i = 0; i < 12; i++) dot(s, 960 + (hash(i * 5) - .5) * 900 * pb, -40 + hash(i * 9) * 500 * pb, 90 * pb + 20, 'rgba(241,236,226,.8)');
    flash(.25 * hit(t, DIS, 9), '#fff4e4');
    flash(.3 * hit(t, PARTY, 6), '#ffd0a0');
  }

  // ---------- 8 · the plastic doll, seams popping (100.04 - 102.36) ----------
  const DOLL = '#ec7fb0', DOLL_SH = '#b84a7c', DOLL_HI = '#ffc2dc';
  function doll(t, X, Y, SC, lt) {
    const legL = .62 * SC, bx = X, by = Y - legL - .42 * SC;
    for (const lx of [.5, .36, -.5, -.36]) taper(s, [bx + lx * SC, by + .3 * SC], [bx + lx * SC, Y], .08 * SC, .07 * SC, lx > .4 || lx < -.4 ? DOLL : DOLL_SH);
    ell(s, bx, by + .04 * SC, SC, .5 * SC, DOLL_SH);
    ell(s, bx - .05 * SC, by - .04 * SC, .95 * SC, .44 * SC, DOLL);
    ell(s, bx - .25 * SC, by - .2 * SC, .5 * SC, .16 * SC, DOLL_HI);
    dot(f, bx - .35 * SC, by - .24 * SC, .1 * SC, 'rgba(255,235,245,.6)');
    glow(bx - .3 * SC, by - .25 * SC, .4 * SC, 'rgba(255,160,210,.1)');
    // stitched seam along the belly
    for (let i = 0; i < 14; i++) { const u = i / 13, x = bx + (u - .5) * 1.5 * SC, y = by + .2 * SC + Math.sin(u * Math.PI) * .08 * SC; stroke(s, [[x - 12, y - 12], [x + 12, y + 12]], '#7a2a50', 7); }
    // a doll head: smooth pink, painted lashes, the same lids
    const hx = bx + .98 * SC, hy = by - .26 * SC;
    ell(s, hx, hy, .3 * SC, .36 * SC, DOLL); ell(s, hx - .08 * SC, hy - .14 * SC, .12 * SC, .08 * SC, DOLL_HI);
    dot(f, hx - .1 * SC, hy - .16 * SC, .05 * SC, 'rgba(255,240,248,.7)');
    for (const d of [-1, 1]) {
      const ex = hx + d * .12 * SC, ey = hy - .04 * SC;
      ell(s, ex, ey, .08 * SC, .06 * SC, '#fdf6f8'); dot(s, ex, ey + .015 * SC, .04 * SC, '#3a6ad0');
      s.fillStyle = '#c85a8a'; s.fillRect(ex - .085 * SC, ey - .065 * SC, .17 * SC, .07 * SC);
      for (let k = 0; k < 3; k++) stroke(s, [[ex - .06 * SC + k * .06 * SC, ey + .005 * SC], [ex - .08 * SC + k * .07 * SC, ey - .05 * SC]], '#2a0a1a', 5);
    }
    ell(s, hx, hy + .2 * SC, .07 * SC, .04 * SC, '#e0306e');
    dot(s, hx - .16 * SC, hy + .1 * SC, .05 * SC, '#ff7aa8'); dot(s, hx + .16 * SC, hy + .1 * SC, .05 * SC, '#ff7aa8');
    // a blond plastic wig of curls on top
    for (let i = 0; i < 5; i++) dot(s, hx + (i - 2) * .11 * SC, hy - .34 * SC - (i % 2) * .04 * SC, .1 * SC, '#f6d27a');
    // seams pop one by one; stuffing puffs out and keeps swelling
    const spots = [[bx - .5 * SC, by + .22 * SC], [bx + .45 * SC, by - .3 * SC], [bx - .2 * SC, by - .42 * SC], [bx + .1 * SC, by + .26 * SC]];
    SEAMS.forEach((t0, i) => {
      if (t < t0) return;
      const [px, py] = spots[i], k = ease.back(inv(t0, t0 + .22, t)), grow = 1 + (t - t0) * .12;
      const R = rng(200 + i);
      ell(s, px, py, 30 * k, 22 * k, '#5a1a36');
      for (let j = 0; j < 6; j++) { const a = R() * TAU, d = R() * 45 * k * grow; dot(s, px + Math.cos(a) * d, py + Math.sin(a) * d * .7 - 20 * k, (22 + R() * 22) * k * grow, j % 3 ? WOOL : WOOL_HI); }
      glow(px, py - 30, 200 * k, `rgba(255,240,220,${.35 * hit(t, t0, 5)})`);
    });
  }
  function plastic(t, lt, dur) {
    const [sx, sy] = shake(t, SEAMS.reduce((a, x) => a + hit(t, x, 10), 0) * 6);
    cam(lerp(1060, 940, ease.inOut(lt / dur)) + sx, lerp(620, 560, lt / dur) + sy, lerp(1.1, 1.5, ease.inOut(lt / dur)));
    ballroom(t, { chand: [[500, 60, .8], [1500, 40, .8]], guests: 5, floor: 860, lamp: .6 });
    blackout(.35);
    // a turning gold pedestal under a spotlight
    const X = 920, Y = 900, SC = 270;
    s.fillStyle = vgrad(s, Y, Y + 160, [[0, GOLD_HI], [.3, GOLD], [1, GOLD_D]]); s.fillRect(X - 420, Y, 840, 160);
    ell(s, X, Y, 420, 50, GOLD_HI);
    for (let i = 0; i < 6; i++) { const a = t * 1.4 + i / 6 * TAU, c = Math.cos(a); if (Math.sin(a) > 0) stroke(s, [[X + c * 400, Y + 20], [X + c * 400, Y + 150]], GOLD_D, 12); }
    glow(X, Y - 300, 900, 'rgba(255,200,230,.1)');
    poly(f, [[X - 120, -400], [X + 120, -400], [X + 600, Y + 60], [X - 600, Y + 60]], 'rgba(255,220,235,.035)');
    doll(t, X, Y, SC, lt);
  }

  // ---------- 9 · the stuffing bursts, and turns into night sky (102.36 - 104.4) ----------
  function burst(t, lt, dur) {
    const k = ease.out(inv(BURST - .05, BURST + .6, t)), night = smooth(inv(103.0, 104.25, t));
    const [sx, sy] = shake(t, 14 * hit(t, BURST, 6) + 3 * PULSE.reduce((a, x) => a + hit(t, x, 9), 0));
    cam(960 + sx + lt * 40, lerp(560, 430, ease.inOut(lt / dur)) + sy, lerp(1.5, 1.0, ease.out(inv(0, .8, lt))) + .06 * lt);
    // the room and the doll, gone under the cloud
    if (lt < .6) { ballroom(t, { chand: [[500, 60, .8], [1500, 40, .8]], guests: 5, floor: 860, lamp: .6 }); doll(t, 920, 900, 270, lt); }
    // the night behind it, showing through as the cloud thins
    s.save(); s.globalAlpha = night;
    s.fillStyle = vgrad(s, -300, 1400, [[0, '#060a22'], [.6, '#122258'], [1, '#2b3a7a']]); s.fillRect(-900, -900, 3800, 2900);
    s.restore();
    stars(t, 55, 240, 1080, 1.4 * night);
    if (night > .3) moon(1560 - lt * 30, 250 + (1 - night) * 120, 64, night);
    // the cloud: puffs flung out from the doll, cream going lavender going night blue
    const R = rng(303), col = (j) => {
      const a = [[243, 230, 205], [176, 150, 200], [40, 52, 110]], m = night * 2, i0 = Math.min(1, Math.floor(m)), u = m - i0;
      const c = a[i0].map((v, q) => lerp(v, a[Math.min(2, i0 + 1)][q], u) * (j % 3 === 0 ? .82 : 1)); return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
    };
    const pulse = 1 + .08 * PULSE.reduce((q, p) => q + hit(t, p, 7), 0);
    for (let j = 0; j < 80; j++) {
      const a = R() * TAU, d0 = R() * .8 + .2, drift = (t - BURST) * (20 + R() * 40), rr = R();
      const d = d0 * 1500 * k * (1 + night * night * (j < 16 ? .5 : 1.6)) + drift + (j < 16 ? night * 260 : 0);
      const x = 920 + Math.cos(a) * d, y = 700 + Math.sin(a) * d * .7;
      const r = (150 + rr * 230) * (.3 + .7 * k) * pulse * (1 - .45 * night);
      const c = col(j), sh = col(3);
      dot(s, x + r * .08, y + r * .12, r, sh); dot(s, x - r * .12, y - r * .15, r * .72, c);
      if (night < .5) dot(s, x - r * .3, y - r * .35, r * .3, `rgba(255,250,240,${.5 * (1 - 2 * night)})`);
    }
    // a warm pulse under the wool on the hits, fading as it cools to night
    for (const p of PULSE) glow(960, 560, 900, `rgba(255,110,140,${.3 * hit(t, p, 6) * (1 - night)})`);
    glow(920, 700, 1400 * k, `rgba(255,240,220,${.22 * hit(t, BURST, 4)})`);
    flash(.3 * hit(t, BURST, 10), '#fff0e0');
    for (let i = 0; i < 4; i++) glow(200 + i * 500, 250 + (i % 2) * 120, 200, `rgba(160,180,255,${.1 * night})`);
  }

  chapter('makeover', 85.18, 104.4, [
    [85.18, lips],
    [86.78, glass],
    [89.22, doctor],
    [90.58, nose],
    [92.54, sausage],
    [94.46, dinner],
    [DIS, plaster],
    [100.04, plastic],
    [102.36, burst],
  ], { paint: { boil: 9, bloom: 1.35 } });
})();
