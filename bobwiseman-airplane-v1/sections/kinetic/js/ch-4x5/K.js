// 4:5 recompose of section K (864 x 1080). Started as a copy of js/ch/K-reprise.js. Same words, times and cues as
// the master; the layout is redrawn for the tall frame. Text stays inside x 48..816, content inside y 110..980.
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
  const { voc, slam, wrap, said, cvr, wave, transcript, garage, stamp } = KIT;
  const LK = LYR.K.lines, T0 = 8191 / 24;
  const W0 = (L, i) => L.words[i][1], WL = (L) => L.words[L.words.length - 1][1];
  const head = { head: 'CVR · AOH-1953 · REPLAY', t0: T0 };
  const CX = W / 2, XL = 70, XR = W - 70; // frame centre and the text gutters (48 px band plus a little air)

  function cloudsLine(x, y, w, h, t, sp = 60) {
    for (let i = 0; i < 5; i++) { const cx = x + wrap(i * 230 - t * sp, w + 200) - 100, cy = y + 60 + (i % 3) * (h / 3.5); for (const [dx, r] of [[-30, 24], [0, 34], [32, 22]]) { s.beginPath(); s.arc(cx + dx, cy, r, Math.PI, TAU); s.lineWidth = 2; s.strokeStyle = '#3a3530'; s.stroke(); } }
  }

  // ---------------- piano run (v4 xi) ----------------
  // Onsets of the piano run, from librosa onset_detect on the htdemucs_6s piano stem (338-352 s window,
  // delta .07), kept from K's first frame to 347.5. STEMS.piano.onsets only has two hits here, so these
  // are measured from the stem itself. Every hit lights a key on a keyboard strip, throws a note tick up
  // from it and flashes the frame brackets orange.
  // 4:5: same 28 keys, thinner (24 px), strip spans x 58..806 and sits at y 934..982, above the footer chrome
  // (at the master's y it would have painted over the shot code and channel label).
  const PIANO = [341.297, 341.831, 342.203, 342.365, 342.574, 342.737, 342.899, 343.062, 343.248, 343.433, 343.619, 343.968, 344.339, 344.571, 344.711, 345.129, 345.5, 345.825, 346.243, 346.591, 346.986, 347.381];
  function pianoRun(t) {
    if (t > PIANO[PIANO.length - 1] + .6) return;
    const NK = 28, kw = 24, x0 = CX - NK * kw / 2 + 32, y0 = 940, kh = 36;
    const lastI = PIANO.filter((p) => p <= t + .001).length - 1;
    const keyOf = (i) => (4 + i * 3) % NK; // the run climbs the keyboard
    withT(() => {
      frect(x0 - 70, y0 - 6, NK * kw + 76, kh + 12, C.bg);
      text('PNO', x0 - 60, y0 + 25, { size: 15, color: lastI >= 0 && t - PIANO[lastI] < .15 ? C.hot : C.dim, ls: 2 });
      for (let k = 0; k < NK; k++) {
        let g = 0; PIANO.forEach((p, i) => { if (keyOf(i) === k && t >= p - .001) g = Math.max(g, Math.exp(-(t - p) * 9)); });
        frect(x0 + k * kw + 1, y0, kw - 2, kh, g > .02 ? `rgba(255,74,28,${(.25 + .75 * g).toFixed(3)})` : '#1a1815');
        rect(x0 + k * kw + 1, y0, kw - 2, kh, '#3a3530', 1);
        if ([0, 1, 3, 4, 5].includes(k % 7) && k < NK - 1) frect(x0 + k * kw + kw * .68, y0, kw * .64, kh * .58, '#0a0908');
      }
      PIANO.forEach((p, i) => { // note ticks rising from the lit key (shorter climb than the master: the tall frame packs type closer above)
        const e = t - p; if (e < 0 || e > .55) return;
        const x = x0 + keyOf(i) * kw + kw / 2, y = y0 - 10 - e * 160;
        line([[x, y], [x, y - 16]], C.hot, 3); dot(x - 4, y, 5, C.hot);
      });
      if (lastI >= 0) { const g = Math.exp(-(t - PIANO[lastI]) * 14); if (g > .05) { s.globalAlpha = g; brackets(36, 36, W - 72, H - 72, 30, C.hot, 3); s.globalAlpha = 1; } }
    });
  }

  // ---------------- k01 replay ----------------
  // 4:5: stacked. Tape labels, the sky window centred under them, the waveform full width, the transcript in two lines.
  function replay(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    text('COCKPIT VOICE RECORDER', XL, 150, { size: 18, color: C.dim, ls: 6 });
    text('TAPE AOH-03 · SIDE B · THE SAME VOICES', XL, 178, { size: 18, color: C.dim, ls: 2 });
    const MW = 460, MH = 240, X = CX - MW / 2, Y = 210;
    rect(X, Y, MW, MH, C.dim, 2);
    withT(() => { s.beginPath(); s.rect(X, Y, MW, MH); s.clip(); cloudsLine(X, Y, MW, MH, t, 40); PL.side(X + MW / 2, Y + 185 + Math.sin(t * 1.3) * 10 + lt * 8, .32, t, { lid: .5, mouth: voc(t), rot: .05, spin: t * 10, lw: 2 }); });
    text('LIVE · ALT 2400 ↓', X, Y + MH + 26, { size: 14, color: C.hot, ls: 2 });
    wave(XL, 580, XR - XL, 150, t, { span: 4, ph: .6, bar: 4, sec: 'K' });
    text('TRANSCRIPT ▸ AUTO', XL, 708, { size: 16, color: C.dim, ls: 3 }); line([[XL, 723], [XR, 723]], '#2a2622', 1.5);
    transcript(LK.sky, t, XL, 800, { size: 58, lh: 68, maxW: 700 });
    cvr(t, 'K01 · REPLAY', head);
    pianoRun(t);
  }

  // ---------------- k02 glide slope ----------------
  // 4:5: the ILS box moves right; the words stack in a stepped column on the left (read top-down) and the whole column
  // rises away as in the master; SKY sits above the box.
  function glide(t, lt, dur) {
    fill(C.bg);
    const L = LK.sky2, u = lt / dur, n = L.words.length;
    // ILS crosshair (master box 660 at k 1; here 472)
    const hb = 236, sc = hb / 330, cx = 528, cy = 605;
    for (let i = -2; i <= 2; i++) { dot(cx + i * 120 * sc, cy + hb, 8, C.dim); dot(cx + hb, cy + i * 120 * sc, 8, C.dim); }
    line([[cx, cy - 300 * sc], [cx, cy + 300 * sc]], C.ink, 3); line([[cx - 300 * sc, cy + (40 - u * 40) * sc], [cx + 300 * sc, cy + (40 - u * 40) * sc]], C.ink, 3);
    rect(cx - hb, cy - hb, hb * 2, hb * 2, '#2a2622', 2);
    PL.front(cx, cy + (60 + u * 120) * sc, .32 * sc, t, { lid: .3, look: [0, .6], mouth: voc(t), spin: t * 30, lw: 2 });
    text('GLIDE SLOPE', cx + hb - 16, cy - hb + 34, { size: 18, color: C.dim, ls: 4, align: 'right' }); text(`ALT ${Math.round(lerp(2400, 600, u))}`, cx + hb - 16, cy - hb + 72, { size: 30, weight: 700, color: C.hot, align: 'right' });
    // the words rise away from him
    const rise = (t - L.words[0][1]) * 150;
    said(L, t).forEach((it, i) => {
      const last = i === n - 1, e = t - it.t, str = it.w.toUpperCase();
      if (last) {
        const o = { fam: FAM.g, weight: 900, stretch: 'expanded' }, sz = fitSize(str, XR - XL - 4, 260, o);
        letters(str, CX, 365 - e * 140, { ...o, size: sz, align: 'center' }, (j) => ({ dy: (1 - slam(t, it.t + j * .03, .14)) * 200, color: C.hot })); return;
      }
      text(str, XL + i * 16, 740 - rise + i * 46 + (1 - it.a) * 30, { size: 50, weight: 700, color: C.ink, alpha: clamp(it.a * 2) });
    });
    cvr(t, 'K02 · APPROACH', head);
    pianoRun(t);
  }

  // ---------------- k03 touchdown ----------------
  // 4:5: radio altimeter top left, the stepped words under it, he comes down on the right; the road is a band across
  // the middle and the hero word lands just under it, full width (fitted: it cannot stay 210 px in 768).
  function touchdown(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    const L = LK.ground, GT = WL(L), road = 620, h = hit(t, GT, 7);
    const alt = t < GT ? lerp(500, 0, ease.in(inv(T0 + 345.62 - T0, GT, t))) : 0;
    const pk = .5, px = XR - 306 * pk, py = road - alt * .67;
    withT(() => {
      s.translate(snoise(t * 40, 1) * 14 * h, snoise(t * 40, 2) * 14 * h);
      line([[0, road], [W, road]], C.ink, 3); dash([[0, road + 36], [W, road + 36]], '#4a453e', 3, [46, 40], t * 500);
      PL.side(px, py, pk, t, { lid: .2, mouth: voc(t), spin: t * 16, look: [.5, .6], rot: alt > 0 ? -.06 : 0 });
      if (t > GT) for (let i = 0; i < 8; i++) { const r = rng(i * 13 + 2), e = t - GT; if (e < .9) dot(px + (r() - .7) * 210 - e * 210, road - 10 - r() * 40 * e * 3, 4 + r() * 8, C.dim); }
      said(L, t).forEach((it, i) => {
        if (i === L.words.length - 1) {
          const str = it.w.toUpperCase(), o = { fam: FAM.g, weight: 900 }, sz = fitSize(str, XR - XL - 4, 210, o);
          // the falling letters are clipped to the band under the road, so they drop in from under the words and the plane
          withT(() => { s.beginPath(); s.rect(-60, road + 4, W + 120, H); s.clip();
            letters(str, CX, road + 60 + sz * .72, { ...o, size: sz, align: 'center' }, (j) => ({ dy: (1 - slam(t, it.t + j * .015, .1)) * -500, color: C.hot })); }); return;
        }
        text(it.w.toUpperCase(), XL + i * 40, 330 + i * 44, { size: 50, weight: 700, color: C.ink, alpha: clamp(it.a * 2) * (t > GT ? .45 : 1) });
      });
      const E = LK.onground, eo = { fam: FAM.s, italic: true, size: 100 }, sp = 22;
      const full = E.words.reduce((a, [w]) => a + measure(w.toLowerCase(), eo), 0) + sp * (E.words.length - 1);
      let x = CX - full / 2;
      for (const it of said(E, t)) x += sp + text(it.w.toLowerCase(), x, 905, { ...eo, color: C.ink, alpha: clamp(it.a * 2) });
    });
    text(alt > 0 ? String(Math.round(alt)) : 'TOUCHDOWN', XL, 280, { fam: FAM.g, weight: 900, size: alt > 0 ? 160 : 70, color: alt > 0 ? C.ink : C.hot });
    text('RADIO ALT', XL, 130, { size: 18, color: C.dim, ls: 4 });
    fx({ flash: .2 * hit(t, GT, 18), glitch: .35 * h });
    cvr(t, 'K03 · TOUCHDOWN', head);
    pianoRun(t);
  }

  // ---------------- k04 roll-in ----------------
  // 4:5: garage scaled to the width; the line breaks before the hero word, which is fitted to the 720 px measure.
  function rollIn(t, lt, dur) {
    fill(C.bg);
    const L = LK.airplane, u = ease.inOut(lt / dur), gk = .76, gy = 960;
    garage(t, { ext: true, door: 1, cx: CX, gy, k: gk, pk: lerp(1.6, 1, u), px: 0, spin: t * lerp(20, 6, u), lid: .3, look: [0, .3], mouth: voc(t) });
    let x = XL;
    said(L, t).forEach((it, i) => {
      const last = i === 2, str = it.w.toUpperCase();
      if (last) { const o = { fam: FAM.g, weight: 900 }, sz = fitSize(str, XR - XL - 4, 150, o); text(str, XL, 330 + (1 - it.a) * 30, { ...o, size: sz, color: C.hot, alpha: clamp(it.a * 2) }); return; }
      x += 24 + text(str, x, 200 + (1 - it.a) * 30, { fam: FAM.m, weight: 700, size: 70, color: C.ink, alpha: clamp(it.a * 2) });
    });
    if (t > WL(L)) tag(CX, gy - 313 * gk, 600, 430, 'AIRPLANE', 'PARKING · GARAGE', { size: 24 });
    cvr(t, 'K04 · ROLL-IN', head);
  }

  // ---------------- k05 parked ----------------
  // 4:5: checklist and the three hot words stacked in one column on top, the garage below it.
  function parked(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    withT(() => { garage(t, { cx: CX, gy: 978, k: .6, lid: .7, frown: .5, mouth: voc(t), spin: t * 2, bulb: 1, look: [.4, .2], smile: -.4 }); });
    const rows = [['WINGS', 'OK'], ['ENGINES', 'OK'], ['ALTITUDE', 'FAIL']];
    rows.forEach(([k, r], i) => { text(`${k.padEnd(10, '.')} ${r}`, 80, 165 + i * 50, { size: 34, color: r === 'FAIL' ? C.hot : C.ink, weight: r === 'FAIL' ? 700 : 400 }); });
    const L = LK.notright; let y = 385;
    said(L, t).forEach((it) => { text(it.w.toUpperCase() + (it.t === WL(L) ? '.' : ''), 80, y + (1 - it.a) * 30, { fam: FAM.g, weight: 900, size: 104, color: C.hot, alpha: clamp(it.a * 2) }); y += 104; });
    cvr(t, 'K05 · PARKED', head);
  }

  // ---------------- k06 statement form ----------------
  // 4:5: KIT45 portrait sheet (776 x 1000). Answers drop under their labels; the statement wraps in three rows
  // (two at 110 px, the last word alone at 200 px); NOTED lands bottom right, clear of the witness line.
  function report(t, lt) {
    const L = LK.queen, MT = WL(L), SW = KIT45.SW;
    KIT45.paper(t, lt, () => {
      const ink = C.pencil, grey = '#6b6357', rule = '#b9ae98', m = 36;
      frect(m, 40, 236, 70, ink); text('FORM 7-C', m + 118, 90, { fam: FAM.g, weight: 900, size: fitSize('FORM 7-C', 236 - 28, 46, { fam: FAM.g, weight: 900 }), color: C.paper, align: 'center' });
      text('STATEMENT OF', m + 258, 72, { fam: FAM.g, weight: 800, size: 40, color: ink }); text('AIRCRAFT', m + 258, 110, { fam: FAM.g, weight: 800, size: 40, color: ink });
      text('To be completed by the aircraft in its own words · Block capitals', m, 142, { size: 15, color: grey });
      line([[m, 158], [SW - m, 158]], ink, 3);
      text('1. WHERE WERE YOU', m, 198, { size: 16, color: grey, ls: 2 }); text('In the sky. Then on the ground.', m + 14, 240, { size: 30, color: ink }); line([[m, 254], [SW - m, 254]], rule, 1.5);
      text('2. WHO KNOWS', m, 294, { size: 16, color: grey, ls: 2 }); line([[m, 326], [SW - m, 326]], rule, 1.5);
      text('3. STATEMENT', m, 366, { size: 16, color: grey, ls: 2 });
      const X0 = 28, X1 = SW - 28, ROWS = [470, 588, 752];
      for (const ry of ROWS) line([[m, ry + 20], [SW - m, ry + 20]], rule, 1.5);
      let x = X0, row = 0;
      said(L, t).forEach((it) => { const str = it.w.toUpperCase(), big = it.t === MT, sz = big ? 200 : 110, w = measure(str, { fam: FAM.g, weight: 900, size: sz }); if (x + w > X1 || (big && x > X0)) { x = X0; row = Math.min(row + 1, ROWS.length - 1); } if (big) row = ROWS.length - 1; text(str, x, ROWS[row] + (1 - it.a) * 20, { fam: FAM.g, weight: 900, size: sz, color: big ? C.pink : ink, alpha: clamp(it.a * 2) }); x += w + 30; });
      // red pencil crown doodle in the margin of line 2
      if (t > W0(L, 1)) { const p = clamp((t - W0(L, 1)) * 2.5); s.beginPath(); const pts = [[566, 334], [586, 274], [616, 319], [646, 259], [676, 319], [706, 274], [726, 334]]; pts.slice(0, Math.max(2, Math.ceil(p * pts.length))).forEach(([px, py], i) => i ? s.lineTo(px, py) : s.moveTo(px, py)); s.lineWidth = 4; s.strokeStyle = C.pink; s.stroke(); }
      text('4. WITNESSES', m, 832, { size: 16, color: grey, ls: 2 }); text('none (garage)', m + 14, 874, { size: 30, color: ink });
      // NOTED at 64 (master 80): KIT.stamp scales in from 2.3x, and on the first frame after MT+.45 (~2x) an 80 px word
      // would run off the frame's right edge; at 64 centred at x 500 it stays inside 48..816 then and on the sheet after.
      stamp(t, MT + .45, 500, 880, .08, 300, 120, [['NOTED', 64, 23]], 5);
    }, { shake: 10 * hit(t, MT + .45, 16) });
    fx({ paper: 1, flash: .15 * hit(t, MT + .45, 18) });
  }

  // ---------------- k07 cool-down ----------------
  // 4:5: gauges either side, ticks between them, the plane under them at a scale that keeps the wings on the frame.
  function cool(t, lt, dur) {
    fill(C.bg);
    const u = lt / dur, spin = 30 * (1 - Math.pow(1 - clamp(u * 1.4), 2)) * 1; // prop angle eases to a stop
    PL.front(CX, 880, .6, t, { spin: spin, lid: lerp(.4, 1.0, u), look: [0, .4], mouth: 0, smile: .1 });
    const temp = Math.round(lerp(210, 80, ease.out(u)));
    for (const [i, lab, v] of [[0, 'CHT', temp], [1, 'OIL', Math.round(temp * .45)]]) {
      const x = i ? 714 : 150; rect(x - 40, 210, 80, 400, C.dim, 2); const fh = 392 * v / 240; frect(x - 36, 606 - fh, 72, fh, v > 150 ? C.hot : C.ink);
      text(lab, x, 650, { size: 22, color: C.dim, align: 'center', ls: 3 }); text(`${v} °C`, x, 690, { size: 28, weight: 700, color: C.ink, align: 'center' });
    }
    // engines tick as they cool
    const tk = FEAT.beats.filter((b) => b > 355.6 && b <= t);
    tk.forEach((b, i) => { const e = t - b; if (e < .8) text('tick', 236 + (hash(i * 3) * 280), 330 + hash(i * 5) * 220, { fam: FAM.s, italic: true, size: 70, color: C.ink, alpha: 1 - e / .8 }); });
    text('ENGINE COOL-DOWN', CX, 160, { size: 26, color: C.dim, align: 'center', ls: 8 });
    wave(132, 945, 600, 56, t, { span: 3, bar: 4, sec: 'K' });
    cvr(t, 'K07 · COOL', head);
  }

  // ---------------- k08 the log again ----------------
  // 4:5: KIT45 log page with the four earlier entries; TODAY wraps inside LOG.defX..maxX, the engineer's notes
  // go under it, and STILL NOT A CAR is set in two rows so its box stays on the sheet.
  const PREV = [['03 MAR', 'wingtips scrape guardrail', 'trimmed the hedge'], ['11 MAR', 'overtaken by a bicycle', 'no fault found'], ['19 MAR', 'told to "move over"', 'cannot move over'], ['03 APR', () => LYR.A.lines.wings.words.map((w) => w[0]).join(' ').toUpperCase(), 'counted wings: 2. not a car.']];
  function techlog2(t, lt) {
    const A = LK.apologies, L = LK.wings, CT = WL(L), G = KIT45.LOG;
    KIT45.paper(t, lt, () => {
      KIT45.logPage(t, PREV.slice(0, 3).concat([[PREV[3][0], PREV[3][1](), PREV[3][2]]]), (y) => {
        text('TODAY', G.dateX, y, { size: 22, color: C.pencil });
        let x = G.defX, yy = y;
        const na = said(A, t).length, ws = [...said(A, t), ...said(L, t)];
        ws.forEach((it, wi) => {
          const li = wi - na, str = it.w.toUpperCase() + (wi === 0 ? ',' : ''), big = li === 4 || li === L.words.length - 1, sz = big ? 50 : 34, w = measure(str, { size: sz, weight: 700 });
          if (x + w > G.maxX) { x = G.defX; yy += 50; }
          text(str, x, yy + (1 - it.a) * 8, { size: sz, weight: 700, color: C.pencil, alpha: clamp(it.a * 2) });
          if (li === 4) line([[x, yy + 10], [x + w * ease.out(inv(it.t, it.t + .3, t)), yy + 10]], C.pink, 4);
          x += w + 14;
        });
        const ny = y + 50 + 46; // under the entry (it runs to two lines)
        if (t > CT + .15) text(typed('counted wings: still 2.', t, CT + .15, 30), G.actX, ny, { size: 24, color: '#2b3a6b' });
        if (t > CT + .95) text(typed('too wide.', t, CT + .95, 30), G.actX, ny + 36, { size: 24, color: '#2b3a6b' });
      });
      // two rows at 40, box 144 tall: at its largest frame (363.458, ~1.27x) the outer box keeps >= 20 px of paper all round;
      // settled, its top clears the entry's second line and its left edge clears the typed note
      stamp(t, 363.23 + .2, 470, 865, .08, 0, 144, [['STILL NOT', 40, -6], ['A CAR', 40, 36]], 7);
    }, { shake: 10 * hit(t, 363.43, 16), zoom: .006 });
    fx({ paper: 1, flash: .15 * hit(t, 363.43, 18) });
  }

  // ---------------- k09 close + END ----------------
  // 4:5: garage at the k04 scale; END OF RECORDING breaks after OF so the block fits the 768 band.
  function close(t, lt, dur) {
    const END = 365.2;
    if (t < END) {
      fill(C.bg);
      const d = ease.inOut(inv(363.6, 364.9, t));
      garage(t, { ext: true, door: 1 - d, cx: CX, gy: 960, k: .76, lid: lerp(.6, 1.65, inv(363.6, 364.6, t)), spin: 0, look: [0, .3] });
      cvr(t, 'K09 · CLOSE', head);
      return;
    }
    // END OF RECORDING: holds still to the last frame
    fill(C.bg);
    brackets(36, 36, W - 72, H - 72, 30, C.dim, 2);
    const a = ease.out(inv(END, END + .25, t)), o = { fam: FAM.g, weight: 900, size: 76, ls: 4 };
    const tw = Math.max(measure('END OF', o), measure('RECORDING', o)), bw = 100 + tw, x0 = CX - bw / 2;
    frect(x0, 420, 70 * a, 70, C.hot);
    text('END OF', x0 + 100, 480, { ...o, color: C.ink, alpha: a });
    text('RECORDING', x0 + 100, 564, { ...o, color: C.ink, alpha: a });
    text(`CVR · AOH-1953 · ${KIT.counter(END - T0)}`, x0 + 100, 624, { size: 20, color: C.hot, alpha: a, ls: 3 });
    line([[x0, 664], [x0 + bw * a, 664]], C.hot, 3);
  }

  chapter('K', T0, 8804 / 24, [
    [T0, replay], [344.10, glide], [345.62, touchdown], [348.30, rollIn], [350.40, parked], [352.85, report], [355.60, cool], [358.40, techlog2], [363.60, close],
  ]);
})();
