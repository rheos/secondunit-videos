// 43.0 - 77.6  first instrumental: KOBE. The train that left without the narrator carries her story;
// one of its windows opens onto where she grew up. Woodblock print (look-hanga.js).
// Facts behind it (docs/ELLEN.md): missionary parents, Kobe from age two to seventeen, piano at five,
// her father's church, R&B and the Opry off the family radio; back to America in 1963.
// She is never shown from the front: a small red-haired girl seen from behind, once.
//   43.00 window   the carriage window (letterpress shot zoomed into it) opens: washi, then the print
//   43.00 harbour  dusk over Kobe: Rokko range, harbour, steamers, the mission house on the hill;
//                  house lights come on, one per bar
//   50.20 radio    inside: the family radio, the dial needle hunting stations, rings and records
//                  pouring out of the speaker on the beat
//   54.40 piano    the girl at the upright, from behind; her elbows on the beat
//   58.23 wave     the rings spill out the window and grow into a great curling wave, records riding
//                  the foam; it crests on the wordless vocal at 59.43, the mountain small in the trough
//   66.07 ship     the liner's horn on the vocal at 66.07; it sails east under the moon, 1963 in the
//                  cartouche; dawn, a far coast, the smoke trail curls into a guitar; washi at 77.4
(() => {
  const T = (x) => onTwos(x, 12);
  const C = { pb: '#24456e', ind: '#7f9cc0', pale: '#c9d6e3', ver: '#d2553a', pink: '#e9b4a0', och: '#d9a441', pine: '#3f5e4a', sumi: '#1c1b22', wh: '#f4efe4', red: '#c2452b', wood: '#8a5a3c', dark: '#3a2c2a' };
  const KW = 3.2;
  function shape(pts, fillC, key = true, close = true) {
    s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); if (close) s.closePath();
    if (fillC) { s.fillStyle = fillC; s.fill(); }
    if (key) { s.lineWidth = KW; s.strokeStyle = C.sumi; s.lineJoin = 'round'; s.stroke(); }
  }
  function ell(x, y, rx, ry, fillC, key = true, rot = 0) { s.beginPath(); s.ellipse(x, y, rx, ry, rot, 0, TAU); if (fillC) { s.fillStyle = fillC; s.fill(); } if (key) { s.lineWidth = KW; s.strokeStyle = C.sumi; s.stroke(); } }
  function box(x, y, w, h, fillC, key = true) { shape([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fillC, key); }
  function bokashi(y0, y1, stops) { const g = s.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); s.fillStyle = g; s.fillRect(-W, y0, W * 3, y1 - y0); }
  function ridge(y, amp, seed, fillC, x0 = -200, x1 = W + 200) {
    const pts = [[x0, H + 50]]; for (let x = x0; x <= x1; x += 40) pts.push([x, y - amp * (.55 * noise1(x * .004, seed) + .45 * noise1(x * .013, seed + 3))]); pts.push([x1, H + 50]); shape(pts, fillC);
  }
  function cartouche(x, y, big, small) {
    box(x, y, 92, 300, C.pink); box(x + 8, y + 8, 76, 284, null);
    s.save(); s.fillStyle = C.sumi; s.textAlign = 'center'; s.font = '700 54px "Superclarendon"';
    [...big].forEach((ch, i) => s.fillText(ch, x + 46, y + 70 + i * 56)); s.font = '700 26px "Superclarendon"'; s.fillText(small, x + 46, y + 280); s.restore();
  }
  function waveStripes(y0, y1, t, colA, colB) {
    box(-20, y0, W + 40, y1 - y0, colA, false);
    for (let i = 0; i < 9; i++) { const y = y0 + 20 + i * (y1 - y0) / 9; const pts = []; for (let x = -40; x <= W + 40; x += 30) pts.push([x, y + Math.sin(x * .02 + t * 1.4 + i) * 5]); s.lineWidth = 2.6; s.strokeStyle = colB; s.beginPath(); pts.forEach(([a, b], k) => k ? s.lineTo(a, b) : s.moveTo(a, b)); s.stroke(); }
  }
  function steamer(x, y, sc, t, smokeC = C.pale) {
    withT(() => {
      s.translate(x, y); s.scale(sc, sc);
      for (let k = 0; k < 5; k++) ell(-40 - k * 70 - (t * 30 % 70), -190 - k * 26, 34 + k * 10, 22 + k * 6, smokeC, true);
      shape([[-260, -40], [240, -40], [200, 30], [-230, 30]], C.sumi);
      box(-180, -90, 330, 50, C.wh); for (let k = 0; k < 8; k++) ell(-160 + k * 40, -66, 7, 7, C.och, false);
      box(-30, -170, 46, 80, C.ver); box(-30, -150, 46, 14, C.sumi, false);
    });
  }
  function missionHouse(x, y, sc, lit) {
    withT(() => {
      s.translate(x, y); s.scale(sc, sc);
      box(-90, -100, 180, 100, C.wh); shape([[-110, -100], [0, -170], [110, -100]], C.ver);
      box(60, -230, 40, 130, C.wh); shape([[52, -230], [80, -290], [108, -230]], C.ver);
      s.lineWidth = 6; s.strokeStyle = C.sumi; s.beginPath(); s.moveTo(80, -330); s.lineTo(80, -290); s.moveTo(66, -316); s.lineTo(94, -316); s.stroke();
      box(-60, -75, 40, 46, lit ? C.och : C.ind); box(10, -75, 40, 46, lit ? C.och : C.ind); box(-15, -55, 30, 55, C.wood);
    });
  }
  function pine(x, y, sc) { withT(() => { s.translate(x, y); s.scale(sc, sc); shape([[-6, 0], [6, 0], [10, -120], [-4, -120]], C.wood); for (let k = 0; k < 3; k++) ell(-30 + k * 30, -130 - k * 30 + (k % 2) * 20, 60, 22, C.pine); }); }

  // ---------- harbour at dusk ----------
  function shotHarbour(t, l) {
    const tt = T(t), pan = -ease.inOut(inv(43, 50.2, t)) * 160;
    fx({ fade: 1 - smooth(inv(43.0, 43.7, t)) });
    bokashi(0, 640, [[0, C.pb], [.45, C.ind], [.8, C.pink], [1, C.wh]]);
    withT(() => {
      s.translate(pan, 0);
      ell(1500, 260, 46, 46, C.wh, true);                                           // the evening moon
      ridge(470, 210, 1, C.ind); ridge(560, 150, 7, '#5b7aa3'); ridge(640, 70, 11, C.pine);
      // the hill and the mission house
      shape([[1100, 760], [1350, 560], [1700, 540], [2000, 600], [2400, 640], [2400, 760]], C.pine);
      const bar = Math.floor(inv(43.3, 50.2, t) * 13);
      missionHouse(1560, 560, 1, bar >= 1);
      [[1280, 640], [1440, 600], [1760, 580], [1880, 640]].forEach(([x, y], i) => pine(x, y, .8));
      for (let i = 0; i < 12; i++) { const hx = 140 + i * 82, hy = 650 + (i % 3) * 8; box(hx, hy - 30, 54, 30, C.wh); shape([[hx - 8, hy - 30], [hx + 27, hy - 52], [hx + 62, hy - 30]], C.sumi, false); ell(hx + 27, hy - 14, 7, 8, i < bar ? C.och : C.ind, false); }
      withT(() => { s.translate(-pan, 0); waveStripes(680, 1100, t, C.pb, C.ind); });
      steamer(560 + t * 6, 820, .9, t); steamer(1180 - t * 3, 760, .55, t + 2);
    });
    cartouche(1760, 70, 'KOBE', '1950s');
  }

  // ---------- the family radio ----------
  function radio(x, y, sc, t) {
    withT(() => {
      s.translate(x, y); s.scale(sc, sc);
      shape([[-260, 0], [-260, -280], [-200, -360], [200, -360], [260, -280], [260, 0]], C.wood);
      shape([[-220, -40], [-220, -260], [-170, -320], [170, -320], [220, -260], [220, -40]], C.dark);
      for (let k = 0; k < 10; k++) { s.lineWidth = 3; s.strokeStyle = C.wood; s.beginPath(); s.moveTo(-200 + k * 44, -300); s.lineTo(-200 + k * 44, -60); s.stroke(); }  // speaker cloth slats
      box(-200, -40, 400, 34, C.och); // the dial
      const needle = -180 + (snoise(t * .9, 5) * .5 + .5) * 360; s.lineWidth = 4; s.strokeStyle = C.ver; s.beginPath(); s.moveTo(needle, -40); s.lineTo(needle, -6); s.stroke();
      ell(-150, 30, 26, 26, C.dark); ell(150, 30, 26, 26, C.dark);
    });
  }
  function record(x, y, r, rot, label) { ell(x, y, r, r, C.sumi, false); ell(x, y, r * .7, r * .7, null, false); s.lineWidth = 1.5; s.strokeStyle = '#3c3a44'; s.beginPath(); s.arc(x, y, r * .78, 0, TAU); s.stroke(); ell(x, y, r * .34, r * .34, label, false); ell(x + Math.cos(rot) * r * .2, y + Math.sin(rot) * r * .2, 3, 3, C.wh, false); }
  function room(t, wallC = C.pink) {
    box(-20, -20, W + 40, 820, wallC, false);
    for (let k = 0; k < 14; k++) box(k * 140, 0, 2, 800, '#d79f8d', false);
    box(-20, 800, W + 40, 300, C.wood);
    for (let k = 0; k < 8; k++) box(-20, 820 + k * 34, W + 40, 2, C.dark, false);
  }
  function shotRadio(t, l) {
    const tt = T(t);
    room(t);
    // the window onto the harbour
    box(1240, 120, 520, 420, null); withT(() => { s.beginPath(); s.rect(1240, 120, 520, 420); s.clip(); bokashi(120, 540, [[0, C.pb], [1, C.pink]]); ridge(430, 90, 3, C.ind, 1200, 1800); waveStripes(470, 560, t, C.pb, C.ind); });
    box(1240, 120, 520, 420, null); box(1495, 120, 10, 420, C.wood); box(1240, 325, 520, 10, C.wood);
    box(200, 640, 900, 40, C.wood); box(240, 680, 30, 140, C.wood); box(1030, 680, 30, 140, C.wood);   // table
    // rings and records out of the speaker, one ring per beat
    const bi = lastBeat(t);
    for (let k = 0; k < 6; k++) { const b = FEAT.beats[bi - k]; if (b === undefined) continue; const age = t - b; const r = 120 + age * 520;
      s.lineWidth = 16 * Math.max(0, 1 - age / 3); s.strokeStyle = k % 2 ? C.och : C.pale; s.beginPath(); s.ellipse(650, 470, r, r * .82, 0, 0, TAU); s.stroke(); }
    radio(650, 640, 1, t);
    for (let i = 0; i < 7; i++) { const st = 50.4 + i * .55; if (t < st) continue; const a = t - st; record(650 + (hash(i) - .3) * a * 520 + a * 120, 360 - a * 160 + a * a * 30, 34, a * 6, [C.ver, C.och, C.pale][i % 3]); }
  }

  // ---------- the girl at the piano ----------
  function shotPiano(t, l) {
    const tt = T(t);
    room(t, '#e3c0ad');
    box(560, 260, 300, 200, C.wh); box(572, 272, 276, 176, null);                       // a framed text on the wall
    s.lineWidth = 6; s.strokeStyle = C.sumi; s.beginPath(); s.moveTo(710, 300); s.lineTo(710, 420); s.moveTo(670, 340); s.lineTo(750, 340); s.stroke();
    // the upright piano
    box(420, 420, 1080, 420, C.dark); box(460, 460, 1000, 180, C.wood); box(400, 640, 1120, 40, C.dark);
    box(440, 680, 1040, 40, C.wh); for (let k = 0; k < 30; k++) box(444 + k * 34.5, 680, 2, 40, C.sumi, false);
    for (let k = 0; k < 30; k++) if (k % 7 !== 2 && k % 7 !== 6) box(466 + k * 34.5, 680, 18, 24, C.sumi, false);
    // sheet music
    box(800, 480, 320, 150, C.wh); for (let k = 0; k < 5; k++) box(820, 500 + k * 22, 280, 2, C.sumi, false);
    // the girl, from behind: red bob, white collar, blue dress; elbows on the beat
    const p = beatPulse(t, 9), lean = Math.sin(t * 1.9) * 4;
    withT(() => {
      s.translate(960 + lean, 1000);
      box(-170, -60, 340, 60, C.wood);                                                     // bench
      shape([[-110, -60], [110, -60], [80, -260], [-80, -260]], C.pb);                    // dress
      shape([[-95, -250], [-150, -170 - p * 18], [-130, -150 - p * 18], [-70, -220]], C.pb); // elbows
      shape([[95, -250], [150, -170 - (1 - p) * 10], [130, -150 - (1 - p) * 10], [70, -220]], C.pb);
      shape([[-60, -262], [60, -262], [40, -240], [-40, -240]], C.wh);                     // collar
      ell(0, -320, 66, 72, C.red);                                                         // the red bob from behind
      shape([[-66, -320], [66, -320], [70, -270], [-70, -270]], C.red);
    });
  }

  // ---------- the wave ----------
  function shotWave(t, l) {
    const tt = T(t), CR = 59.43;
    const rise = ease.out(inv(58.23, CR, t)), fall = smooth(inv(61.0, 66.07, t));
    bokashi(0, 760, [[0, C.pale], [1, C.wh]]);
    // the mountain small in the trough
    shape([[700, 760], [960, 610], [1220, 760]], C.ind); shape([[905, 642], [960, 610], [1015, 642], [985, 650], [960, 636], [935, 650]], C.wh);
    waveStripes(740, 1100, t, C.pb, C.ind);
    // the great wave rising from the left, crest curling right; size follows the vocal swell
    const hgt = 200 + rise * 560 - fall * 200, cx = 300 + rise * 260 + fall * 500;
    withT(() => {
      s.translate(cx, 900);
      shape([[-700, 200], [-700, -hgt * .3], [-420, -hgt * .85], [-120, -hgt], [180, -hgt * .9], [320, -hgt * .7], [260, -hgt * .55], [120, -hgt * .7], [0, -hgt * .5], [80, -hgt * .2], [260, 200]], C.pb);
      shape([[-660, 200], [-640, -hgt * .25], [-400, -hgt * .7], [-140, -hgt * .82], [100, -hgt * .72], [0, -hgt * .5], [60, 200]], '#3d6390', false);
      // foam fingers along the crest
      for (let k = 0; k < 14; k++) { const a = k / 13; const x = lerp(-420, 300, a), y = -hgt * (.85 + Math.sin(a * Math.PI) * .12) + (a > .8 ? (a - .8) * hgt : 0);
        const len = 28 + hash(k * 7) * 30 + rise * 20, wig = Math.sin(t * 3 + k) * 6;
        shape([[x, y], [x + len * .6 + wig, y - len], [x + len * .9, y - len * .6], [x + len * .4, y + 6]], C.wh); }
      // records riding the foam
      for (let k = 0; k < 4; k++) { const a = .2 + k * .2; record(lerp(-420, 300, a), -hgt * .95 - 50 - Math.sin(t * 4 + k) * 10, 30, t * 5 + k, [C.ver, C.och][k % 2]); }
    });
    // spray on the crest hit
    const sp = hit(t, CR, 2.2); for (let k = 0; k < 40; k++) ell(cx + 300 + (hash(k) - .3) * 600 * (1 - sp + .3), 900 - hgt - hash(k + 9) * 300 * (1 - sp + .2), 6 + hash(k + 3) * 8, 6 + hash(k + 3) * 8, C.wh, k % 3 === 0);
  }

  // ---------- the crossing ----------
  function shotShip(t, l) {
    const tt = T(t), H0 = 66.07, dawn = smooth(inv(70, 75, t));
    bokashi(0, 700, [[0, dawn > .5 ? C.ind : C.pb], [.6, dawn > .5 ? C.pink : C.ind], [1, dawn > .3 ? C.och : C.pale]]);
    if (dawn < .8) ell(400, 200, 50, 50, C.wh);
    // a far coast at dawn
    if (dawn > 0) { withT(() => { s.globalAlpha = 1; ridge(700 + (1 - dawn) * 80, 50 * dawn, 21, '#5b7aa3', 1100, W + 200); }); }
    waveStripes(690, 1100, t * 1.6, C.pb, C.ind);
    const x = lerp(260, 1400, inv(66, 77.4, t));
    const horn = hit(t, H0, 3);
    steamer(x, 830, .9 + horn * .05, t * 2);
    if (horn > .02) for (let k = 0; k < 3; k++) { s.lineWidth = 6 * horn; s.strokeStyle = C.wh; s.beginPath(); s.arc(x + 20, 640, 40 + k * 40 + (1 - horn) * 90, -2.2, -.9); s.stroke(); }
    // the smoke trail draws a guitar: body outline first, then the neck and head
    const g = smooth(inv(73.5, 76.8, t));
    if (g > 0) withT(() => {
      s.translate(x - 560, 360); s.rotate(-.5); s.lineCap = 'round'; s.lineJoin = 'round'; s.lineWidth = 22; s.strokeStyle = C.pale;
      s.beginPath(); s.moveTo(0, -120);
      s.bezierCurveTo(70, -125, 95, -85, 80, -45); s.bezierCurveTo(70, -20, 70, 0, 95, 30);
      s.bezierCurveTo(130, 85, 100, 160, 0, 165); s.bezierCurveTo(-100, 160, -130, 85, -95, 30);
      s.bezierCurveTo(-70, 0, -70, -20, -80, -45); s.bezierCurveTo(-95, -85, -70, -125, 0, -120);
      s.lineTo(0, -470); s.lineTo(-18, -540); s.lineTo(26, -540); s.lineTo(14, -470);
      s.setLineDash([2400 * g, 99999]); s.stroke(); s.setLineDash([]);
      if (g > .5) ell(0, 40, 26 * smooth((g - .5) * 4), 26 * smooth((g - .5) * 4), null, false), s.lineWidth = 12, s.stroke();
    });
    cartouche(1760, 70, 'EAST', '1963');
    fx({ fade: smooth(inv(77.0, 77.6, t)) });
  }

  chapter('kobe', 43.0, 77.6, [
    [43.0, shotHarbour], [50.2, shotRadio], [54.4, shotPiano], [58.23, shotWave], [66.07, shotShip],
  ]);
})();
