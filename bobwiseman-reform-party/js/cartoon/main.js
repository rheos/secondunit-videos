// Look B: the newspaper editorial cartoon. Dip pen on bristol, grey wash, crosshatching, a ruled panel border, labels
// on things the way the Ottawa cartoonists do it, and the sung line as the cartoon's caption under the panel.
// Staging: on the playa the party's camp is a jail. Suits in rosettes dance on an art car built like a paddy wagon,
// a gramophone horn plays the soundbite with a patent stamped on it, and the camps become cells, one row a beat.
// Section: verse 2 (sung lines 7-9).
(() => {
  const LT = (i) => LINES[i].s, LE = (i) => LINES[i].e;
  const A = 7, B = 9, T0 = LT(A) - 1.5, T1 = LE(B) + 1.5;
  const out = document.getElementById('c'); out.width = W; out.height = H; const g = out.getContext('2d');
  const WASH = mkCanvas(), wg = WASH.getContext('2d');
  const PX0 = 120, PY0 = 70, PX1 = W - 120, PY1 = 900; // the panel
  const INK = '#15120f';

  // pen line: a wobbly polyline with pressure (thick in the middle), boiling slightly at 8 fps like redrawn cels
  function pen(pts, w = 4, seed = 1, t = 0) {
    const b = Math.floor(t * 8) % 3, n = pts.length; if (n < 2) return;
    g.fillStyle = INK; g.beginPath();
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const [x, y] = pts[i], a = pts[Math.max(0, i - 1)], c = pts[Math.min(n - 1, i + 1)];
      let dx = c[0] - a[0], dy = c[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const u = i / (n - 1), ww = w * (.35 + .65 * Math.sin(Math.PI * u)) * (.8 + .4 * rnd(seed, i, b));
      const jx = n1(seed + b * 13, i * .7) * 1.6, jy = n1(seed + 5 + b * 13, i * .7) * 1.6;
      L.push([x + jx - dy * ww / 2, y + jy + dx * ww / 2]); R.push([x + jx + dy * ww / 2, y + jy - dx * ww / 2]);
    }
    const P = L.concat(R.reverse()); g.moveTo(P[0][0], P[0][1]); for (const p of P) g.lineTo(p[0], p[1]); g.closePath(); g.fill();
  }
  const seg = (a, b, k = 8) => [...Array(k + 1)].map((_, i) => [lerp(a[0], b[0], i / k), lerp(a[1], b[1], i / k)]);
  const ring = (cx, cy, rx, ry, k = 28, a0 = 0, a1 = TAU) => [...Array(k + 1)].map((_, i) => { const a = lerp(a0, a1, i / k); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  function outline(pts, w, seed, t) { pen(pts.concat([pts[0]]), w, seed, t); }
  function hatch(x0, y0, x1, y1, ang, sp, seed, t, clip) {
    g.save(); if (clip) { g.beginPath(); g.moveTo(clip[0][0], clip[0][1]); for (const p of clip) g.lineTo(p[0], p[1]); g.closePath(); g.clip(); }
    const ca = Math.cos(ang), sa = Math.sin(ang), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2;
    for (let d = -R, k = 0; d < R; d += sp, k++) pen(seg([cx - ca * R - sa * d, cy - sa * R + ca * d], [cx + ca * R - sa * d, cy + sa * R + ca * d], 6), 1.6, seed + k, t);
    g.restore();
  }
  function wash(x, y, rx, ry, a, seed) { // grey watercolour blot: a soft core and a darker dried edge
    wg.save(); wg.translate(x, y);
    const p = ring(0, 0, rx, ry, 40).map(([px, py], i) => [px * (1 + .12 * n1(seed, i * .4)), py * (1 + .12 * n1(seed + 3, i * .4))]);
    wg.beginPath(); wg.moveTo(p[0][0], p[0][1]); for (const q of p) wg.lineTo(q[0], q[1]); wg.closePath();
    wg.fillStyle = `rgba(90,96,108,${a})`; wg.fill(); wg.lineWidth = 5; wg.strokeStyle = `rgba(70,74,86,${a * .9})`; wg.stroke(); wg.restore();
  }
  function label(txt, x, y, rot = 0, sz = 30) { g.save(); g.translate(x, y); g.rotate(rot); g.font = `italic 700 ${sz}px "Baskerville", "Georgia", serif`; g.textAlign = 'center'; g.fillStyle = INK; g.fillText(txt, 0, 0); g.restore(); }

  // a suit: pear body, rosette, round head with only a grin line, arms flung up; dancing on the beat
  function suit(x, y, s, t, seed, wild = 1) {
    const bob = Math.abs(Math.sin(t * Math.PI * 2.1 + seed)) * 14 * wild, lean = Math.sin(t * Math.PI * 1.05 + seed) * .12 * wild;
    g.save(); g.translate(x, y - bob); g.rotate(lean); g.scale(s, s);
    const body = [[-38, 0], [-46, -60], [-34, -120], [0, -132], [34, -120], [46, -60], [38, 0]];
    outline(body, 4.5, seed, t); hatch(-46, -132, 46, 0, .9, 9, seed + 40, t, body);
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-10, -128); g.lineTo(0, -80); g.lineTo(10, -128); g.closePath(); g.fill(); pen([[-10, -128], [0, -80], [10, -128]], 2.5, seed + 2, t);
    pen(ring(22, -104, 9, 9, 14), 2.4, seed + 3, t); // rosette
    for (const sx of [-1, 1]) { const a = sx * (2.3 + Math.sin(t * 6 + seed + sx) * .3 * wild); pen(seg([sx * 30, -118], [sx * 30 + Math.sin(a) * 80, -118 + Math.cos(a) * 80]), 4, seed + 5 + sx, t); }
    pen(seg([-16, 0], [-22, 54]), 4.5, seed + 8, t); pen(seg([16, 0], [24, 54]), 4.5, seed + 9, t);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -170, 36, 0, TAU); g.fill(); outline(ring(0, -170, 36, 38, 26), 4, seed + 10, t);
    pen(ring(0, -170, 22, 16, 12, .2, Math.PI - .2), 3.2, seed + 11, t); // grin
    g.restore();
  }
  function paddyWagon(x, y, s, t) { // the art car: a paddy wagon with a sound system and bunting
    g.save(); g.translate(x, y); g.scale(s, s);
    const box = [[-420, -60], [-420, -330], [260, -330], [260, -60]], cab = [[260, -60], [260, -250], [380, -250], [440, -160], [440, -60]];
    wash(x, y - 180 * s, 430 * s, 150 * s, .22, 3);
    outline(box, 6, 30, t); outline(cab, 6, 31, t); hatch(270, -240, 430, -170, .6, 10, 32, t, [[270, -240], [370, -240], [425, -170], [270, -170]]);
    for (let i = 0; i < 6; i++) { const bx = -380 + i * 108; outline([[bx, -290], [bx + 70, -290], [bx + 70, -170], [bx, -170]], 3.5, 40 + i, t); for (let k = 1; k < 4; k++) pen(seg([bx + k * 17.5, -290], [bx + k * 17.5, -170], 4), 3, 50 + i * 4 + k, t); }
    for (const wx of [-300, 140, 360]) { g.fillStyle = INK; g.beginPath(); g.arc(wx, -50, 52, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(wx, -50, 20, 0, TAU); g.fill(); }
    for (let i = 0; i < 14; i++) { const bx = -420 + i * 50, by = -330 + Math.sin(i * 1.3) * 4; pen([[bx, by], [bx + 25, by + 34], [bx + 50, by]], 2.4, 70 + i, t); }
    // the light on the roof turning: rays drawn on alternate 8 fps steps
    const on = Math.floor(t * 8) % 2; pen(ring(-80, -360, 26, 30, 16, Math.PI, TAU), 4, 90, t);
    if (on) for (let k = 0; k < 5; k++) { const a = -Math.PI * (.2 + k * .15); pen(seg([-80 + Math.cos(a) * 48, -362 + Math.sin(a) * 48], [-80 + Math.cos(a) * 100, -362 + Math.sin(a) * 100], 3), 3, 95 + k, t); }
    g.restore();
  }
  function gramophone(x, y, s, t, open) {
    g.save(); g.translate(x, y); g.scale(s, s);
    outline([[-90, 0], [90, 0], [90, -90], [-90, -90]], 5, 200, t); hatch(-90, -90, 90, 0, -.8, 10, 201, t, [[-90, 0], [90, 0], [90, -90], [-90, -90]]);
    pen(seg([0, -90], [30, -170]), 6, 202, t);
    const mouth = ring(150, -320, 120 * open + 40, 150 * open + 50, 30); outline(mouth, 5, 203, t);
    pen([[30, -170], [80, -230], [150 - 120 * open - 40, -320 + 60]], 5, 204, t); pen([[30, -170], [120, -200], [150, -320 + 150 * open + 50]], 5, 205, t);
    g.restore();
  }
  function cell(x, y, s, t, seed, up) { // a camp tent that has become a cell: dome, then bars drop in
    g.save(); g.translate(x, y); g.scale(s, s);
    const dome = ring(0, 0, 110, 90, 22, Math.PI, TAU); pen(dome, 4.5, seed, t); pen(seg([-110, 0], [110, 0]), 4.5, seed + 1, t);
    for (let k = 0; k < 7; k++) { const bx = -90 + k * 30, h = Math.sqrt(Math.max(0, 1 - (bx / 110) ** 2)) * 90 * up; if (h > 4) pen(seg([bx, 0], [bx, -h], 4), 3.4, seed + 3 + k, t); }
    g.restore();
  }
  function stamp(txt, x, y, rot, a) { if (a <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.scale(1 + (1 - a) * .6, 1 + (1 - a) * .6); g.globalAlpha = a; g.strokeStyle = '#b3261e'; g.lineWidth = 7; g.strokeRect(-210, -52, 420, 104); g.font = '900 54px "Courier New", monospace'; g.textAlign = 'center'; g.fillStyle = '#b3261e'; g.fillText(txt, 0, 18); g.restore(); }

  function playa(t) { pen(seg([PX0, 620], [PX1, 620], 30), 3.5, 300, t); wash(W / 2, 330, 900, 260, .08, 301); for (let i = 0; i < 9; i++) pen(seg([PX0 + 60 + i * 190, 700 + (i % 3) * 60], [PX0 + 120 + i * 190, 700 + (i % 3) * 60], 3), 2, 310 + i, t); }
  function sCrime(t, L) { // the paddy wagon art car rolls in with the suits dancing on top
    playa(t); const x = lerp(1300, 900, ease(t, T0, L.s + 1.5));
    paddyWagon(x, 820, 1, t);
    for (let i = 0; i < 4; i++) suit(x - 320 + i * 150, 820 - 330, .9, t, 400 + i * 7);
    label('THE NEW MAJORITY', x - 80, 820 - 200, 0, 34);
  }
  function sPatent(t, L) { // the gramophone plays the soundbite; a patent stamp lands on its last word
    playa(t); const open = .7 + .3 * Math.abs(Math.sin(t * Math.PI * 2.1));
    gramophone(620, 840, 1.4, t, open);
    for (let i = 0; i < 3; i++) suit(1250 + i * 170, 840, 1.0, t, 500 + i * 9, .6);
    const last = L.words[L.words.length - 1].s; stamp('PATENT', 900, 300, -.12, ease(t, last, last + .15));
    for (let k = 0; k < 4; k++) { const u = ((t - L.s) * .9 + k * .25) % 1; pen(ring(830, 360, 60 + u * 260, 40 + u * 180, 20, -.9, .3), 3, 520 + k, t); }
  }
  function sJails(t, L) { // the camps turn into cells, one row on each sung word from "build"
    playa(t); const ws = L.words, k0 = Math.max(0, ws.length - 3);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6 - r; c++) {
      const w = ws[Math.min(ws.length - 1, k0 + r)], up = ease(t, w.s, w.s + .25);
      cell(330 + c * 260 + r * 130, 860 - r * 110, 1 - r * .2, t, 600 + r * 20 + c, up);
    }
    suit(1660, 880, 1.1, t, 700, 1.2); label('CROWD CONTROL', 1660, 600, -.05, 30);
  }

  function caption(t) {
    const L = lineAt(t, .05); if (!L || L.i < A || L.i > B || t > L.e + 1) return;
    const n = wordsShown(L, t), sz = 52, gap = sz * .27; g.font = `italic ${sz}px "Baskerville", "Georgia", serif`;
    const ws = L.words.map((w) => w.w), wd = ws.map((w) => g.measureText(w).width), total = wd.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
    const s = Math.min(1, (PX1 - PX0 - 80) / total); let x = (W - total * s) / 2; const y = 990;
    g.fillStyle = INK;
    for (let i = 0; i < n; i++) { g.save(); g.translate(x, y); g.scale(s, s); g.fillText(ws[i], 0, 0); g.restore(); probeWord(t, L.i, i, (tt) => { const l = lineAt(tt, .05); return l === L && wordsShown(L, tt) > i; }); x += (wd[i] + gap) * s; }
  }
  function renderFrame(t) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#f7f4ec'; g.fillRect(0, 0, W, H);
    wg.setTransform(1, 0, 0, 1, 0, 0); wg.clearRect(0, 0, W, H);
    g.save(); g.beginPath(); g.rect(PX0, PY0, PX1 - PX0, PY1 - PY0); g.clip();
    const S = [{ t: -1, f: sCrime, i: A }, { t: LT(A + 1) - .1, f: sPatent, i: A + 1 }, { t: LT(B) - .1, f: sJails, i: B }];
    const [s] = shotAt(S, t); s.f(t, LINES[s.i]);
    g.globalCompositeOperation = 'multiply'; g.drawImage(WASH, 0, 0); g.globalCompositeOperation = 'source-over';
    g.restore();
    outline([[PX0, PY0], [PX1, PY0], [PX1, PY1], [PX0, PY1]], 5, 900, t);
    caption(t);
    drawGrain(g, t, .08);
  }
  window.LOOK_SPAN = [T0, T1];
  startPage(out, renderFrame, T0, T1, Promise.resolve(true));
})();
