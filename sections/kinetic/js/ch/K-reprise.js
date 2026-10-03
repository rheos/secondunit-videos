// Section K, 341.2917-366.8333 (frames 8191-8804). The bookend: the black box plays the opening voices
// again (a second take), the counter restarts from zero, and this time he comes down out of the dream,
// lands, parks, cools, and the garage door closes. Ends on END OF RECORDING, black and orange, still.
//   341.29 k01 replay     the playback screen again, REPLAY, with a small window of him drifting in the sky
//   344.10 k02 glide      approach display: SKY rises away while he descends the glide slope
//   345.62 k03 touchdown  radio altimeter counts down, GROUND lands with him, "on the ground"
//   348.30 k04 roll-in    exterior, door up: he rolls back into the garage, I'M AN AIRPLANE
//   350.40 k05 parked     the garage monitor, checklist: IT'S NOT RIGHT
//   352.85 k06 report     cream paper statement form (Whisper fragment, two passes agree)
//   355.60 k07 cool       engine cool-down, tick tick, props stop; waveform only for the unclear bit
//   358.40 k08 log        the tech log again: a new entry under the old one, WINGS this time
//   363.60 k09 close      the door rolls down, END OF RECORDING
(() => {
  const { voc, slam, wrap, said, cvr, wave, transcript, caption, garage, paper, stamp, logPage } = KIT;
  const LK = LYR.K.lines, T0 = 8191 / 24;
  const W0 = (L, i) => L.words[i][1], WL = (L) => L.words[L.words.length - 1][1];
  const head = { head: 'CVR · AOH-1953 · REPLAY', t0: T0 };

  function cloudsLine(x, y, w, h, t, sp = 60) {
    for (let i = 0; i < 5; i++) { const cx = x + wrap(i * 230 - t * sp, w + 200) - 100, cy = y + 60 + (i % 3) * (h / 3.5); for (const [dx, r] of [[-30, 24], [0, 34], [32, 22]]) { s.beginPath(); s.arc(cx + dx, cy, r, Math.PI, TAU); s.lineWidth = 2; s.strokeStyle = '#3a3530'; s.stroke(); } }
  }

  // ---------------- k01 replay ----------------
  function replay(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    text('COCKPIT VOICE RECORDER', 110, 180, { size: 18, color: C.dim, ls: 6 });
    text('TAPE AOH-03 · SIDE B · THE SAME VOICES', 110, 210, { size: 18, color: C.dim, ls: 2 });
    const X = 1340, Y = 120, MW = 460, MH = 260;
    rect(X, Y, MW, MH, C.dim, 2);
    withT(() => { s.beginPath(); s.rect(X, Y, MW, MH); s.clip(); cloudsLine(X, Y, MW, MH, t, 40); PL.side(X + MW / 2, Y + 200 + Math.sin(t * 1.3) * 10 + lt * 8, .32, t, { lid: .5, mouth: voc(t), rot: .05, spin: t * 10, lw: 2 }); });
    text('LIVE · ALT 2400 ↓', X, Y + MH + 26, { size: 14, color: C.hot, ls: 2 });
    wave(110, 470, 1700, 200, t, { span: 4, ph: .6, sec: 'K' });
    text('TRANSCRIPT ▸ AUTO', 110, 640, { size: 16, color: C.dim, ls: 3 }); line([[110, 655], [1810, 655]], '#2a2622', 1.5);
    transcript(LK.sky, t, 110, 770, { size: 92, maxW: 1700 });
    cvr(t, 'K01 · REPLAY', head);
  }

  // ---------------- k02 glide slope ----------------
  function glide(t, lt, dur) {
    fill(C.bg);
    const L = LK.sky2, u = lt / dur, n = L.words.length;
    // ILS crosshair
    const cx = 960, cy = 560;
    for (let i = -2; i <= 2; i++) { dot(cx + i * 120, cy + 330, 8, C.dim); dot(cx + 330, cy + i * 120, 8, C.dim); }
    line([[cx, cy - 300], [cx, cy + 300]], C.ink, 3); line([[cx - 300, cy + 40 - u * 40], [cx + 300, cy + 40 - u * 40]], C.ink, 3);
    rect(cx - 330, cy - 330, 660, 660, '#2a2622', 2);
    PL.front(cx, cy + 60 + u * 120, .32, t, { lid: .3, look: [0, .6], mouth: voc(t), spin: t * 30, lw: 2 });
    text('GLIDE SLOPE', cx + 380, cy - 280, { size: 18, color: C.dim, ls: 4 }); text(`ALT ${Math.round(lerp(2400, 600, u))}`, cx + 380, cy - 240, { size: 30, weight: 700, color: C.hot });
    // the words rise away from him
    let wx = 140; const rise = (t - L.words[0][1]) * 150;
    said(L, t).forEach((it, i) => {
      const last = i === n - 1, e = t - it.t, str = it.w.toUpperCase();
      if (last) { letters(str, 960, 330 - e * 140, { fam: FAM.g, weight: 900, size: 260, stretch: 'expanded', align: 'center' }, (j) => ({ dy: (1 - slam(t, it.t + j * .03, .14)) * 200, color: C.hot })); return; }
      wx += 22 + text(str, wx, 960 - rise - i * 22 + (1 - it.a) * 30, { size: 50, weight: 700, color: C.ink, alpha: clamp(it.a * 2) });
    });
    cvr(t, 'K02 · APPROACH', head);
  }

  // ---------------- k03 touchdown ----------------
  function touchdown(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    const L = LK.ground, GT = WL(L), road = 820, h = hit(t, GT, 7);
    const alt = t < GT ? lerp(500, 0, ease.in(inv(T0 + 345.62 - T0, GT, t))) : 0;
    const py = road - alt * .9;
    withT(() => {
      s.translate(snoise(t * 40, 1) * 14 * h, snoise(t * 40, 2) * 14 * h);
      line([[0, road], [W, road]], C.ink, 3); dash([[0, road + 40], [W, road + 40]], '#4a453e', 3, [46, 40], t * 500);
      PL.side(1400, py, .72, t, { lid: .2, mouth: voc(t), spin: t * 16, look: [.5, .6], rot: alt > 0 ? -.06 : 0 });
      if (t > GT) for (let i = 0; i < 8; i++) { const r = rng(i * 13 + 2), e = t - GT; if (e < .9) dot(1400 + (r() - .7) * 300 - e * 300, road - 10 - r() * 40 * e * 3, 4 + r() * 8, C.dim); }
      said(L, t).forEach((it, i) => {
        if (i === L.words.length - 1) { letters(it.w.toUpperCase(), 540, road - 12, { fam: FAM.g, weight: 900, size: 210, align: 'center' }, (j) => ({ dy: (1 - slam(t, it.t + j * .015, .1)) * -500, color: C.hot })); return; }
        text(it.w.toUpperCase(), 140 + i * 66, 200 + i * 56, { size: 50, weight: 700, color: C.ink, alpha: clamp(it.a * 2) * (t > GT ? .45 : 1) });
      });
      const E = LK.onground; let x = 620;
      for (const it of said(E, t)) x += 22 + text(it.w.toLowerCase(), x, 980, { fam: FAM.s, italic: true, size: 100, color: C.ink, alpha: clamp(it.a * 2) });
    });
    text(alt > 0 ? String(Math.round(alt)) : 'TOUCHDOWN', 1790, 220, { fam: FAM.g, weight: 900, size: alt > 0 ? 160 : 70, color: alt > 0 ? C.ink : C.hot, align: 'right' });
    text('RADIO ALT', 1790, 90 + 40, { size: 18, color: C.dim, align: 'right', ls: 4 });
    fx({ flash: .2 * hit(t, GT, 18), glitch: .35 * h });
    cvr(t, 'K03 · TOUCHDOWN', head);
  }

  // ---------------- k04 roll-in ----------------
  function rollIn(t, lt, dur) {
    fill(C.bg);
    const L = LK.airplane, u = ease.inOut(lt / dur);
    garage(t, { ext: true, door: 1, cx: 960, gy: 980, k: .9, pk: lerp(1.6, 1, u), px: 0, spin: t * lerp(20, 6, u), lid: .3, look: [0, .3], mouth: voc(t) });
    let x = 140;
    said(L, t).forEach((it, i) => { const last = i === 2; const str = it.w.toUpperCase(); x += 24 + text(str, x, 220 + (1 - it.a) * 30, { fam: last ? FAM.g : FAM.m, weight: last ? 900 : 700, size: last ? 150 : 70, color: last ? C.hot : C.ink, alpha: clamp(it.a * 2) }); });
    if (t > WL(L)) tag(960, 700, 1500, 420, 'AIRPLANE', 'PARKING · GARAGE', { size: 24 });
    cvr(t, 'K04 · ROLL-IN', head);
  }

  // ---------------- k05 parked ----------------
  function parked(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    withT(() => { garage(t, { cx: 680, gy: 900, k: .78, lid: .7, frown: .5, mouth: voc(t), spin: t * 2, bulb: 1, look: [.4, .2], smile: -.4 }); });
    const rows = [['WINGS', 'OK'], ['ENGINES', 'OK'], ['ALTITUDE', 'FAIL']];
    rows.forEach(([k, r], i) => { text(`${k.padEnd(10, '.')} ${r}`, 1260, 260 + i * 60, { size: 34, color: r === 'FAIL' ? C.hot : C.ink, weight: r === 'FAIL' ? 700 : 400 }); });
    const L = LK.notright; let y = 560;
    said(L, t).forEach((it) => { text(it.w.toUpperCase() + (it.t === WL(L) ? '.' : ''), 1260, y + (1 - it.a) * 30, { fam: FAM.g, weight: 900, size: 120, color: C.hot, alpha: clamp(it.a * 2) }); y += 120; });
    cvr(t, 'K05 · PARKED', head);
  }

  // ---------------- k06 statement form ----------------
  function report(t, lt) {
    const L = LK.queen, MT = WL(L);
    paper(t, lt, () => {
      const ink = C.pencil, grey = '#6b6357', rule = '#b9ae98';
      frect(60, 50, 330, 76, ink); text('FORM 7-C', 225, 103, { fam: FAM.g, weight: 900, size: 46, color: C.paper, align: 'center' });
      text('STATEMENT OF AIRCRAFT', 420, 88, { fam: FAM.g, weight: 800, size: 40, color: ink });
      text('To be completed by the aircraft in its own words · Block capitals', 422, 118, { size: 15, color: grey });
      line([[60, 150], [1460, 150]], ink, 3);
      text('1. WHERE WERE YOU', 60, 220, { size: 16, color: grey, ls: 2 }); text('In the sky. Then on the ground.', 330, 222, { size: 30, color: ink }); line([[325, 234], [1460, 234]], rule, 1.5);
      text('2. WHO KNOWS', 60, 300, { size: 16, color: grey, ls: 2 }); line([[325, 314], [1460, 314]], rule, 1.5);
      text('3. STATEMENT', 60, 390, { size: 16, color: grey, ls: 2 });
      line([[60, 560], [1460, 560]], rule, 1.5); line([[60, 740], [1460, 740]], rule, 1.5);
      let x = 70, row = 540;
      said(L, t).forEach((it) => { const str = it.w.toUpperCase(), big = it.t === MT, sz = big ? 200 : 110, w = measure(str, { fam: FAM.g, weight: 900, size: sz }); if (x + w > 1440) { x = 70; row = 720; } text(str, x, row + (1 - it.a) * 20, { fam: FAM.g, weight: 900, size: sz, color: big ? C.pink : ink, alpha: clamp(it.a * 2) }); x += w + 34; });
      // red pencil crown doodle in the margin
      if (t > W0(L, 1)) { const p = clamp((t - W0(L, 1)) * 2.5); s.beginPath(); const pts = [[1250, 330], [1270, 270], [1300, 315], [1330, 255], [1360, 315], [1390, 270], [1410, 330]]; pts.slice(0, Math.max(2, Math.ceil(p * pts.length))).forEach(([px, py], i) => i ? s.lineTo(px, py) : s.moveTo(px, py)); s.lineWidth = 4; s.strokeStyle = C.pink; s.stroke(); }
      text('4. WITNESSES', 60, 820, { size: 16, color: grey, ls: 2 }); text('none (garage)', 330, 822, { size: 30, color: ink });
      stamp(t, MT + .45, 1180, 880, .08, 420, 120, [['NOTED', 80, 28]], 5);
    }, { shake: 10 * hit(t, MT + .45, 16) });
    fx({ paper: 1, flash: .15 * hit(t, MT + .45, 18) });
  }

  // ---------------- k07 cool-down ----------------
  function cool(t, lt, dur) {
    fill(C.bg);
    const u = lt / dur, spin = 30 * (1 - Math.pow(1 - clamp(u * 1.4), 2)) * 1; // prop angle eases to a stop
    PL.front(960, 900, .9, t, { spin: spin, lid: lerp(.4, 1.0, u), look: [0, .4], mouth: 0, smile: .1 });
    const temp = Math.round(lerp(210, 80, ease.out(u)));
    for (const [i, lab, v] of [[0, 'CHT', temp], [1, 'OIL', Math.round(temp * .45)]]) {
      const x = i ? 1600 : 320; rect(x - 40, 200, 80, 400, C.dim, 2); const fh = 392 * v / 240; frect(x - 36, 596 - fh, 72, fh, v > 150 ? C.hot : C.ink);
      text(lab, x, 640, { size: 22, color: C.dim, align: 'center', ls: 3 }); text(`${v} °C`, x, 680, { size: 28, weight: 700, color: C.ink, align: 'center' });
    }
    // engines tick as they cool
    const tk = FEAT.beats.filter((b) => b > 355.6 && b <= t);
    tk.forEach((b, i) => { const e = t - b; if (e < .8) text('tick', 700 + (hash(i * 3) * 520), 330 + hash(i * 5) * 200, { fam: FAM.s, italic: true, size: 70, color: C.ink, alpha: 1 - e / .8 }); });
    text('ENGINE COOL-DOWN', 960, 160, { size: 26, color: C.dim, align: 'center', ls: 8 });
    wave(560, 1000, 800, 70, t, { span: 3, bar: 4, sec: 'K' });
    cvr(t, 'K07 · COOL', head);
  }

  // ---------------- k08 the log again ----------------
  const PREV = [['03 MAR', 'wingtips scrape guardrail', 'trimmed the hedge'], ['11 MAR', 'overtaken by a bicycle', 'no fault found'], ['19 MAR', 'told to "move over"', 'cannot move over'], ['03 APR', 'TOO MANY ROOMS TO BE A CAR', 'counted rooms: 31. not a car.']];
  function techlog2(t, lt) {
    const A = LK.apologies, L = LK.wings, CT = WL(L);
    paper(t, lt, () => {
      logPage(t, PREV.slice(0, 3).concat([[PREV[3][0], '', PREV[3][2]]]), (y) => {
        text('too many rooms to be a car', 210, y - 95, { size: 24, color: C.pencil }); // the earlier entry, in the log's hand
        text('TODAY', 70, y, { size: 22, color: C.pencil });
        let x = 210, yy = y;
        const ws = [...said(A, t), ...said(L, t)];
        ws.forEach((it) => {
          const str = it.w.toUpperCase() + (it.w === A.words[0][0] ? ',' : ''), big = /WING|CAR/.test(str), sz = big ? 50 : 34, w = measure(str, { size: sz, weight: 700 });
          if (x + w > 905) { x = 210; yy += 56; }
          text(str, x, yy + (1 - it.a) * 8, { size: sz, weight: 700, color: C.pencil, alpha: clamp(it.a * 2) });
          if (/WING/.test(str)) line([[x, yy + 10], [x + w * ease.out(inv(it.t, it.t + .3, t)), yy + 10]], C.pink, 4);
          x += w + 14;
        });
        if (t > CT + .15) text(typed('counted wings: 2. too wide.', t, CT + .15, 30), 930, y, { size: 24, color: '#2b3a6b' });
      });
      stamp(t, 363.23 + .2, 1150, 870, .1, 560, 140, [['STILL NOT A CAR', 70, 26]], 7);
    }, { shake: 10 * hit(t, 363.43, 16), zoom: .006 });
    fx({ paper: 1, flash: .15 * hit(t, 363.43, 18) });
  }

  // ---------------- k09 close + END ----------------
  function close(t, lt, dur) {
    const END = 365.2;
    if (t < END) {
      fill(C.bg);
      const d = ease.inOut(inv(363.6, 364.9, t));
      garage(t, { ext: true, door: 1 - d, cx: 960, gy: 960, k: 1.0, lid: lerp(.6, 1.65, inv(363.6, 364.6, t)), spin: 0, look: [0, .3] });
      cvr(t, 'K09 · CLOSE', head);
      return;
    }
    // END OF RECORDING: holds still to the last frame
    fill(C.bg);
    brackets(36, 36, W - 72, H - 72, 30, C.dim, 2);
    const a = ease.out(inv(END, END + .25, t));
    frect(960 - 470, 470, 70 * a, 70, C.hot);
    text('END OF RECORDING', 960 - 370, 530, { fam: FAM.g, weight: 900, size: 76, color: C.ink, alpha: a, ls: 4 });
    text(`CVR · AOH-1953 · ${KIT.counter(END - T0)}`, 960 - 370, 590, { size: 20, color: C.hot, alpha: a, ls: 3 });
    line([[960 - 470, 630], [960 - 470 + 940 * a, 630]], C.hot, 3);
  }

  chapter('K', T0, 8804 / 24, [
    [T0, replay], [344.10, glide], [345.62, touchdown], [348.30, rollIn], [350.40, parked], [352.85, report], [355.60, cool], [358.40, techlog2], [363.60, close],
  ]);
})();
