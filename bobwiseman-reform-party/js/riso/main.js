// Look A: risograph festival zine. Two inks (fluoro pink, riso blue) overprinting to purple on cream stock, off
// register, halftone tones, paper grain. The playa is a zine page: the party's effigy (a suit with a rosette, no face)
// stands on the horizon while the new law shuts up the scientists and feeds the tape recorders to the fire.
// Section: intro + verse 1 and the first refrain (sung lines 0-6). Shots key off line starts, so timing lives in gen/lines.js only.
(() => {
  const PAPER = '#f3ecdc', PINK = [255, 72, 176], BLUE = [0, 120, 191];
  const LT = (i) => LINES[i].s, LE = (i) => LINES[i].e;
  const out = document.getElementById('c'); out.width = W; out.height = H; const g = out.getContext('2d');
  const inkC = { pink: mkCanvas(), blue: mkCanvas() }, ink = { pink: inkC.pink.getContext('2d'), blue: inkC.blue.getContext('2d') };
  const SMALL = 6, tone = { pink: mkCanvas(W / SMALL, H / SMALL), blue: mkCanvas(W / SMALL, H / SMALL) };
  const tg = { pink: tone.pink.getContext('2d', { willReadFrequently: true }), blue: tone.blue.getContext('2d', { willReadFrequently: true }) };
  const REG = { pink: [5, -3], blue: [-2, 2] }; // off register, fixed per print run

  // ---- drawing helpers: everything draws as black density onto an ink plate, solid or halftone ----
  function poly(c, pts, fill = true, lw = 6) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); if (fill) { c.closePath(); c.fill(); } else { c.lineWidth = lw; c.stroke(); } }
  function wob(pts, seed, a = 3) { return pts.map(([x, y], i) => [x + a * n1(seed + i, x * .01), y + a * n1(seed + 7 + i, y * .01)]); }
  function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  function toneGrad(p, y0, y1, d0, d1) { const c = tg[p], gr = c.createLinearGradient(0, y0 / SMALL, 0, y1 / SMALL); gr.addColorStop(0, `rgba(0,0,0,${d0})`); gr.addColorStop(1, `rgba(0,0,0,${d1})`); c.fillStyle = gr; c.fillRect(0, y0 / SMALL, W / SMALL, (y1 - y0) / SMALL); }
  function toneCircle(p, x, y, r, d) { const c = tg[p]; c.fillStyle = `rgba(0,0,0,${d})`; c.beginPath(); c.arc(x / SMALL, y / SMALL, r / SMALL, 0, TAU); c.fill(); }
  // halftone: the small tone plate's alpha becomes dots on a rotated grid (different angle per ink)
  function halftone(p, ang) {
    const c = tone[p], d = tg[p].getImageData(0, 0, c.width, c.height).data, k = ink[p], cw = c.width, ch = c.height;
    k.save(); k.setTransform(1, 0, 0, 1, 0, 0); k.fillStyle = '#000'; k.beginPath();
    const ca = Math.cos(ang), sa = Math.sin(ang), step = SMALL * 1.15;
    const R = Math.hypot(W, H) / step;
    for (let gy = -R; gy < R; gy++) for (let gx = -R; gx < R; gx++) {
      const x = W / 2 + (gx * ca - gy * sa) * step, y = H / 2 + (gx * sa + gy * ca) * step; if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const a = d[((y / SMALL | 0) * cw + (x / SMALL | 0)) * 4 + 3] / 255; if (a < .04) continue;
      const r = Math.sqrt(a) * step * .6; k.moveTo(x + r, y); k.arc(x, y, r, 0, TAU);
    }
    k.fill(); k.restore();
  }

  // ---- the cast (simple shapes; nobody has a face) ----
  function effigy(c, x, y, s, t, arms = 1) { // the party's Man: scaffold legs, a suit jacket, arms up giddy, a diamond head of struts
    c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#000'; c.strokeStyle = '#000'; c.lineCap = 'round';
    c.lineWidth = 7; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * 18, 0); c.lineTo(sx * 30, -150); c.stroke(); c.beginPath(); c.moveTo(sx * 22, -40); c.lineTo(-sx * 26, -110); c.stroke(); }
    poly(c, wob([[-58, -150], [58, -150], [64, -300], [30, -318], [-30, -318], [-64, -300]], 3));
    const sw = Math.sin(t * TAU * 1.05) * .18 * arms;
    for (const sx of [-1, 1]) { c.save(); c.translate(sx * 56, -300); c.rotate(sx * (-2.5 + sw)); c.lineWidth = 16; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 120); c.stroke(); c.restore(); }
    c.lineWidth = 7; c.beginPath(); c.moveTo(0, -318); c.lineTo(-30, -362); c.lineTo(0, -406); c.lineTo(30, -362); c.closePath(); c.stroke();
    c.beginPath(); c.moveTo(0, -318); c.lineTo(0, -406); c.moveTo(-30, -362); c.lineTo(30, -362); c.stroke();
    c.restore();
  }
  function rosette(c, x, y, r) { c.fillStyle = '#000'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; circle(c, x + Math.cos(a) * r * .7, y + Math.sin(a) * r * .7, r * .38); } poly(c, [[x - r * .3, y + r * .4], [x - r * .7, y + r * 1.9], [x - r * .05, y + r * 1.5]]); poly(c, [[x + r * .3, y + r * .4], [x + r * .7, y + r * 1.9], [x + r * .05, y + r * 1.5]]); }
  function scientist(c, x, y, s, seed) { // lab coat capsule, round head
    c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#000';
    poly(c, wob([[-46, 0], [46, 0], [40, -170], [22, -186], [-22, -186], [-40, -170]], seed, 2));
    circle(c, 0, -226, 40); c.restore();
  }
  function recorder(c, x, y, s, rot, t, seed) { // cassette recorder: box, two reels (spinning), handle
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = '#000';
    c.fillRect(-70, -44, 140, 88); c.globalCompositeOperation = 'destination-out';
    for (const rx of [-32, 32]) { c.beginPath(); c.arc(rx, -6, 20, 0, TAU); c.fill(); }
    c.globalCompositeOperation = 'source-over';
    for (const rx of [-32, 32]) for (let k = 0; k < 3; k++) { const a = t * 9 + k * TAU / 3 + seed; c.fillRect(rx + Math.cos(a) * 9 - 3, -6 + Math.sin(a) * 9 - 3, 6, 6); }
    c.lineWidth = 8; c.strokeStyle = '#000'; c.beginPath(); c.moveTo(-40, -44); c.lineTo(-30, -66); c.lineTo(30, -66); c.lineTo(40, -44); c.stroke();
    c.restore();
  }
  function flame(c, x, y, s, t, seed) { c.fillStyle = '#000'; for (let k = 0; k < 5; k++) { const h = (120 + 60 * n1(seed + k, t * 3)) * s, w = 34 * s, ox = (k - 2) * 26 * s; poly(c, [[x + ox - w, y], [x + ox + n1(seed + k * 3, t * 4) * 20 * s, y - h], [x + ox + w, y]]); } }
  function note(c, x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#000'; c.beginPath(); c.ellipse(0, 0, 22, 16, -.4, 0, TAU); c.fill(); c.fillRect(16, -90, 8, 88); poly(c, [[24, -90], [60, -60], [56, -46], [24, -70]]); c.restore(); }
  function newspaper(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = '#000'; c.fillRect(-60, -40, 120, 80); c.globalCompositeOperation = 'destination-out'; for (let r = 0; r < 4; r++) c.fillRect(-50, -26 + r * 16, r ? 100 : 60, 6); c.restore(); }

  // ---- shots ----
  function ground(t) { // playa: pink sky tone fading up, blue ground tone, a solid blue horizon line, dust tents
    toneGrad('pink', 0, 640, .5, .1); toneGrad('blue', 640, H, .3, .6); ink.blue.fillStyle = '#000'; ink.blue.fillRect(0, 636, W, 6);
    for (let i = 0; i < 9; i++) { const x = ((i * 260 + 90 - t * 14) % (W + 300) + W + 300) % (W + 300) - 150; toneCircle('blue', x, 630 - (i % 3) * 8, 38 + (i % 4) * 10, .35); }
  }
  function shotIntro(t) {
    ground(t); effigy(ink.blue, 1480, 640, .8, t, .3); rosette(ink.pink, 1480 + 24, 640 - 216, 18);
    toneCircle('pink', 520, 470 - 60 * ease(t, 0, 6), 150, .9);
    const a = ease(t, 1.2, 2.6) * (1 - ease(t, LT(0) - 1.6, LT(0) - .4));
    if (a > 0) for (const [p, txt, y, sz] of [['pink', 'THE REFORM PARTY', 210, 132], ['blue', 'AT BURNING MAN', 340, 112]]) { const c = ink[p]; c.save(); c.globalAlpha = a; c.font = `900 ${sz}px "Futura", "Arial Black", sans-serif`; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText(txt, W / 2, y); c.restore(); }
  }
  function shotLaw(t, L) { // scientists in a row; a blue strip of tape slaps across each mouth on the last sung words
    ground(t); effigy(ink.blue, 1700, 640, .55, t, 1); rosette(ink.pink, 1716, 640 - 150, 13);
    const ws = L.words, slap = ws.slice(Math.max(0, ws.length - 3));
    for (let i = 0; i < 5; i++) {
      const x = 260 + i * 290, y = 900, bob = Math.sin(t * 5 + i) * 4;
      scientist(ink.pink, x, y + bob, 1.5, 20 + i);
      const tk = slap[Math.min(i, slap.length - 1)].s, u = lin(t, tk, tk + .12);
      if (u > 0) { const c = ink.blue; c.save(); c.translate(x, y + bob - 300); c.rotate(-.12 + i * .05); c.fillStyle = '#000'; const w = 110 * (1.3 - .3 * u); c.fillRect(-w / 2, -12, w, 24); c.restore(); }
    }
  }
  function shotTapes(t, L) { // tape recorders ride a conveyor into the bonfire at the Man's feet
    ground(t); effigy(ink.blue, 1460, 700, 1.25, t, 1); rosette(ink.pink, 1497, 700 - 340, 28);
    flame(ink.pink, 1460, 760, 2.2, t, 4); toneCircle('pink', 1460, 660, 280, .35);
    ink.blue.fillRect(0, 860, 1300, 14);
    for (let i = 0; i < 7; i++) { const x = ((t - L.s) * 260 + i * 220) % 1540 - 180; const into = clamp((x - 1180) / 200); if (into >= 1) continue; recorder(ink.blue, x, 806 - into * 120, 1.0 - into * .4, into * 1.4, t, i); }
  }
  function shotNews(t, L) { // a camp fence goes up in front of the newsstand; blue notes are caught in a net
    ground(t);
    for (let i = 0; i < 6; i++) newspaper(ink.pink, 820 + (i % 3) * 140, 760 + (i / 3 | 0) * 100, 1, (i - 2) * .05);
    const wk = L.words[Math.min(5, L.words.length - 1)].s, up = ease(t, wk - .1, wk + .4);
    ink.blue.fillStyle = '#000';
    for (let i = 0; i < 16; i++) { const x = 600 + i * 60; ink.blue.fillRect(x, 940 - 400 * up, 10, 400 * up); }
    for (let r = 0; r < 4; r++) if ((40 + r * 100) < 400 * up) ink.blue.fillRect(600, 940 - (40 + r * 100), 910, 6);
    const net = ease(t, L.s + 1.2, L.s + 1.8);
    for (let i = 0; i < 5; i++) { const u = lin(t, L.s + i * .25, L.s + i * .25 + 1.6); const nx = lerp(140 + i * 70 + u * 160, 380 + (i - 2) * 30, net), ny = lerp(360 - Math.sin(u * 3 + i) * 70, 300 + (i % 2) * 30, net); note(ink.blue, nx, ny, .8); }
    ink.blue.lineWidth = 8; ink.blue.strokeStyle = '#000'; ink.blue.beginPath(); ink.blue.arc(380, 300, 120, 0, TAU); ink.blue.stroke(); ink.blue.fillRect(372, 420, 16, 300); toneCircle('blue', 380, 300, 118, .3 * net);
  }
  function shotSpin(t, L) { // the Man up close: his head is a grin; a pinwheel turns the papers to confetti
    toneGrad('pink', 0, H, .2, .5);
    const c = ink.blue; c.fillStyle = '#000'; c.beginPath(); c.arc(860, 300, 230, .15 * Math.PI, .85 * Math.PI); c.arc(860, 140, 330, .72 * Math.PI, .28 * Math.PI, true); c.closePath(); c.fill();
    poly(c, [[500, 930], [600, 660], [1120, 660], [1220, 930]]); rosette(ink.pink, 1010, 760, 40);
    const sp = (t - L.s) * 4 + ease(t, L.e - 1.6, L.e + .4) * 6;
    const p = ink.pink; p.save(); p.translate(1500, 380); p.rotate(sp); p.fillStyle = '#000';
    for (let k = 0; k < 4; k++) { p.rotate(TAU / 4); poly(p, [[0, 0], [160, -30], [150, 70]]); } p.restore();
    c.save(); c.translate(1500, 380); c.fillRect(-8, 0, 16, 520); circle(c, 0, 0, 14); c.restore();
    for (let i = 0; i < 46; i++) { const a = rnd(i, 1) * TAU + sp * .3, r = 170 + ((t - L.s) * 220 + rnd(i, 2) * 700) % 760; const x = 1500 + Math.cos(a) * r, y = 380 + Math.sin(a) * r * .7; const k = i % 2 ? ink.pink : ink.blue; k.save(); k.translate(x, y); k.rotate(a + sp); k.fillStyle = '#000'; k.fillRect(-14, -9, 28, 18); k.restore(); }
  }

  // captions: the zine's pink strip, words in blue caps; the word being sung is knocked out to paper
  function captions(t) {
    const L = lineAt(t, .05); if (!L || L.i > 6 || t > L.e + .8) return;
    const n = wordsShown(L, t), sz = 62, gap = sz * .27, c = ink.blue;
    c.font = `900 ${sz}px "Futura", "Arial Black", sans-serif`; const ws = L.words.map((w) => w.w.toUpperCase()), wd = ws.map((w) => c.measureText(w).width);
    const total = wd.reduce((a, b) => a + b, 0) + gap * (ws.length - 1), s = Math.min(1, (W - 240) / total), y = 1030;
    let x = (W - total * s) / 2;
    ink.pink.save(); ink.pink.fillStyle = '#000'; ink.pink.globalAlpha = .55; ink.pink.fillRect(x - 30 * s, y - (sz + 8) * s, (total + 60) * s, (sz + 30) * s); ink.pink.restore();
    for (let i = 0; i < n; i++) {
      const cur = i === n - 1 && t < L.words[i].e + .15;
      c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#000';
      if (cur) { c.fillRect(-8, -sz - 4, wd[i] + 16, sz + 24); c.globalCompositeOperation = 'destination-out'; }
      c.fillText(ws[i], 0, 0); c.restore();
      probeWord(t, L.i, i, (tt) => { const l = lineAt(tt, .05); return l === L && wordsShown(L, tt) > i; });
      x += (wd[i] + gap) * s;
    }
  }

  function shots(t) {
    const S = [{ t: -1, f: shotIntro }, { t: LT(0) - .1, f: shotLaw, i: 1 }, { t: LT(2) - .1, f: shotTapes, i: 2 }, { t: LT(3) - .1, f: shotNews, i: 4 }, { t: LT(5) - .1, f: shotSpin, i: 6 }];
    const [s] = shotAt(S, t); s.f(t, LINES[s.i ?? 0]);
  }
  function renderFrame(t) {
    for (const p of ['pink', 'blue']) { const c = ink[p]; c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, W, H); c.fillStyle = '#000'; c.strokeStyle = '#000'; tg[p].clearRect(0, 0, W / SMALL, H / SMALL); }
    shots(t); captions(t);
    halftone('pink', .26); halftone('blue', -.26);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
    for (const [p, col] of [['blue', BLUE], ['pink', PINK]]) {
      const c = ink[p]; c.globalCompositeOperation = 'source-in'; c.fillStyle = rgb(col, .92); c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over';
      g.globalCompositeOperation = 'multiply'; const [ox, oy] = REG[p]; g.drawImage(inkC[p], ox + Math.round(n1(p.length, t * .5) * 1.5), oy);
    }
    g.globalCompositeOperation = 'source-over';
    // little Bob crosses the playa in the intro: his own printed card, tinted pink like the zine
    LITTLE_BOB.draw(g, t, { tIn: 1.5, tOut: LT(0) - .2, y: 1000, h: 280, grade: (k) => { k.globalCompositeOperation = 'multiply'; k.fillStyle = 'rgb(255,222,238)'; k.fillRect(0, 0, W, H); } });
    drawGrain(g, t, .13);
  }
  window.LOOK_SPAN = [0, LE(6) + 1.2];
  startPage(out, renderFrame, 0, LE(6) + 1.2, Promise.resolve(true));
})();
