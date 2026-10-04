// Section A, 0.000-71.000 (frames 0-1704). The preamble voice collage as a cockpit-voice-recorder
// PLAYBACK: the plane is asleep in a garage and talking in his sleep; the black box transcribes what it
// can. Only fragments that held up in two Whisper passes are text; the rest is [UNINTELLIGIBLE] or waveform.
// Lead-in from ~57: system wake, engine start, title card, the garage door, out onto the highway at 71.0.
//   0.00 a01 playback     CVR screen, waveform, live transcript of the first line
//   2.40 a02 ladder       words climb an altitude ladder, SKY lands at the top
//   3.75 a03 ground       words fall, GROUND slams into the dirt, an echo "on the ground"
//   6.50 a04 ident        technical drawing assembles, sleeping; SELF-IDENT: AIRPLANE
//   8.65 a05 checklist    systems check, ALTITUDE fails, IT'S NOT RIGHT
//  11.17 a06 enhance      oscillogram close-up, the decoder fails: [UNINTELLIGIBLE]
//  14.80 a07 cctv         garage monitor, the plane asleep, wingtips through the walls, Zs
//  19.00 a08 log          cream paper tech log: the crew-reported defect, NOT A CAR stamp
//  23.50 a09 belts        FASTEN SEAT BELTS sign dings on
//  26.05 a10 babble       fast babble overloads the transcriber
//  28.30 a11 sleep lab    polysomnograph, REM bursts on the yelp and whoop
//  33.33 a12 rem eyes     extreme close-up, eyes darting under the lids
//  36.78 a13 decoder      dream decoder: thumbnails of flight, the plane flying in the dream
//  41.00 a14 tape         tape transport, REAL ALT 0000 vs DREAM ALT climbing
//  44.40 a15 dream alt    giant altitude digits spike on the whoop
//  47.23 a16 cctv 2       garage again, restless, MOTION DETECTED
//  52.63 a17 montage      one panel per beat as the music builds, sleep stage climbs to WAKE
//  56.67 a18 boot         SYSTEM WAKE boot log
//  59.00 a19 eyes open    lids snap open on the hit
//  61.37 a20 engines      props start one per beat, RPM dials
//  63.67 a21 title        BOB WISEMAN / AIRPLANE ON THE HIGHWAY over the closed garage
//  68.27 a22 door         the door rolls up
//  69.43 a23 roll-out     plan view: down the driveway and along the highway until "I'm" at 72.0 (v4b: colour waits for the singing)
(() => {
  const { voc, slam, wrap, said, hitsNear, cvr, wave, transcript, caption, scramble, garage, trace, paper, stamp, logPage } = KIT;
  const LA = LYR.A.lines, HITS = LYR.A.hits;
  const hits = (t, d = 6) => hitsNear(HITS, t, d);
  const lastHitLabel = (t, win = 1.2) => { let r = null; for (const [h, l] of HITS) if (t >= h - .03 && t < h + win) r = [h, l]; return r; };
  const W0 = (L, i) => L.words[i][1];

  // ---------------- a01 playback ----------------
  function playback(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    text('COCKPIT VOICE RECORDER', 110, 180, { size: 18, color: C.dim, ls: 6 });
    text('TAPE AOH-03 · RECOVERED FROM: GARAGE', 110, 210, { size: 18, color: C.dim, ls: 2 });
    // reels
    for (const [rx, sp] of [[1560, 1], [1720, .8]]) {
      s.beginPath(); s.arc(rx, 190, 58, 0, TAU); s.lineWidth = 2; s.strokeStyle = C.dim; s.stroke();
      for (let i = 0; i < 3; i++) { const a = t * 3 * sp + i * TAU / 3; line([[rx + Math.cos(a) * 14, 190 + Math.sin(a) * 14], [rx + Math.cos(a) * 48, 190 + Math.sin(a) * 48]], C.ink, 3); }
      dot(rx, 190, 8, C.hot);
    }
    line([[1560, 248], [1720, 248]], C.dim, 1.5);
    wave(110, 430, 1700, 230, t, { span: 4, ph: .6 });
    text('CH1 VOICE', 110, 300, { size: 15, color: C.dim, ls: 3 });
    text('TRANSCRIPT ▸ AUTO', 110, 640, { size: 16, color: C.dim, ls: 3 });
    line([[110, 655], [1810, 655]], '#2a2622', 1.5);
    transcript(LA.sky, t, 110, 770, { size: 92, maxW: 1700 });
    chrome2(t, 'A01 · PLAYBACK');
  }
  const chrome2 = (t, code) => cvr(t, code);

  // ---------------- a02 the ladder ----------------
  function ladder(t, lt, dur) {
    fill(C.bg);
    const L = LA.sky2, ws = said(L, t), n = L.words.length;
    const climb = lerp(0, 760, ease.inOut(lt / dur));
    withT(() => {
      s.translate(0, climb);
      for (let i = 0; i < 14; i++) { // rungs
        const y = 960 - i * 110; line([[620, y], [1300, y]], i % 2 ? '#2a2622' : '#3a3530', 2);
        text(`${String(i * 2500).padStart(5, '0')} FT`, 1340, y + 6, { size: 15, color: C.dim });
      }
      line([[620, 1000], [620, -700]], C.dim, 3); line([[1300, 1000], [1300, -700]], C.dim, 3);
      ws.forEach((it, i) => {
        if (i === n - 1) return;
        const y = 940 - i * 110;
        text(it.w.toUpperCase(), 660 + (i % 2) * 280, y - 20 + (1 - it.a) * 50, { size: 64, weight: 700, color: C.ink, alpha: clamp(it.a * 2) });
      });
    });
    const last = L.words[n - 1];
    if (t >= last[1] - .03) {
      const a = slam(t, last[1] - .03, .14), str = last[0].toUpperCase();
      letters(str, 960, 520, { fam: FAM.g, weight: 900, size: 400, stretch: 'expanded', align: 'center' }, (i) => ({ dy: (1 - slam(t, last[1] - .03 + i * .03, .14)) * 300 + Math.sin(t * 6 + i) * 8, alpha: clamp(a * 3), color: C.hot }));
      fx({ flash: .18 * hit(t, last[1], 16) });
    }
    readout(110, 200, [['ALT', `${Math.round(climb * 30).toString().padStart(5, '0')} FT`, true], ['V/S', '+UP'], ['SOURCE', 'DREAM']], { col: 110 });
    cvr(t, 'A02 · CLIMB');
  }

  // ---------------- a03 ground ----------------
  function ground(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    const L = LA.ground, ws = said(L, t), n = L.words.length, gl = 760;
    const GT = W0(L, n - 1), h = hit(t, GT, 7);
    withT(() => {
      s.translate(snoise(t * 40, 1) * 16 * h, snoise(t * 40, 2) * 16 * h);
      ws.forEach((it, i) => {
        if (i === n - 1) return;
        const y = 180 + i * 64;
        text(it.w.toUpperCase(), 140 + i * 70, y + (1 - it.a) * -40, { size: 56, weight: 700, color: C.ink, alpha: clamp(it.a * 2) * (t > GT ? .45 : 1) });
      });
      if (t >= GT - .03) {
        const str = L.words[n - 1][0].toUpperCase();
        withT(() => {
          s.beginPath(); s.rect(60, 110, W - 120, gl + 70 - 110); s.clip(); // keep the falling letters inside the frame chrome
          letters(str, 960, gl + 70, { fam: FAM.g, weight: 900, size: 330, align: 'center' }, (i) => { const p = slam(t, GT - .03 + i * .015, .1); return { dy: (1 - p) * -420, rot: (hash(i + 3) - .5) * .08 * p, color: C.hot }; });
        });
        for (let i = 0; i < 26; i++) { // dust
          const r = rng(i * 41 + 5), a = Math.PI + r() * Math.PI, sp = 300 + r() * 600, e = t - GT;
          if (e > 0 && e < 1.2) dot(960 + (r() - .5) * 1300 + Math.cos(a) * sp * e, gl + Math.sin(a) * sp * e * .5 + 300 * e * e, 3 + r() * 5, C.dim);
        }
      }
      line([[0, gl], [W, gl]], C.ink, 3);
      for (let x = 0; x < W; x += 30) line([[x, gl + 4], [x - 22, gl + 26]], '#3a3530', 2);
      const E = LA.onground; let x = 520;
      for (const it of said(E, t)) x += 22 + text(it.w.toLowerCase() + (it.t === W0(E, 2) ? '.' : ''), x, 930, { fam: FAM.s, italic: true, size: 110, color: C.ink, alpha: clamp(it.a * 2) });
    });
    if (t > GT) text('ALT 0000 FT · CONTACT', 1810, 200, { size: 22, weight: 700, color: C.hot, align: 'right', ls: 3, alpha: blink(t, 3) ? 1 : .4 });
    fx({ flash: .2 * hit(t, GT, 18), glitch: .4 * h });
    cvr(t, 'A03 · GROUND');
  }

  // ---------------- a04 ident ----------------
  function ident(t, lt) {
    fill(C.bg); grid(40, '#121110'); grid(200, '#1b1916');
    const L = LA.airplane, AT = W0(L, 2);
    const rev = ease.inOut(inv(0, 1.2, lt));
    withT(() => {
      s.beginPath(); s.rect(0, 0, 160 + rev * 1100, H); s.clip();
      line([[120, 820], [1240, 820]], C.dim, 2);
      PL.side(690, 820, 1.25, t, { lid: 1.65, mouth: voc(t), spin: 0, look: [0, 0], smile: .1 });
    });
    if (rev < 1) line([[160 + rev * 1100, 140], [160 + rev * 1100, 940]], C.hot, 2);
    text('FIG. 2  SUBJECT, ASLEEP', 140, 900, { size: 16, color: C.dim, ls: 2 });
    let x = 1240; const ws = said(L, t);
    ws.slice(0, 2).forEach((it) => { x += 20 + text(it.w.toUpperCase(), x, 330 + (1 - it.a) * 30, { size: 70, weight: 700, color: C.ink, alpha: clamp(it.a * 2) }); });
    if (t >= AT - .03) {
      const a = slam(t, AT - .03, .14);
      withT(() => { const sc = lerp(1.12, 1, a); s.translate(1240, 520); s.scale(sc, sc); text(L.words[2][0].toUpperCase(), 0, 0, { fam: FAM.g, weight: 900, size: fitSize(L.words[2][0].toUpperCase(), 540, 200, { fam: FAM.g, weight: 900 }), color: C.hot, alpha: clamp(a * 2) }); });
    }
    readout(1240, 640, [['SELF-IDENT', t >= AT ? 'AIRPLANE' : '…', true], ['REGISTERED', 'CAR'], ['STATUS', 'ASLEEP'], ['LOCATION', 'GARAGE']], { col: 190, size: 22 });
    cvr(t, 'A04 · IDENT');
  }

  // ---------------- a05 checklist ----------------
  function checklist(t, lt) {
    fill(C.bg);
    const rows = [['WINGS', '2', 'OK'], ['PROPELLERS', '4', 'OK'], ['TYRES', '4', '??'], ['WINGSPAN', '35.1 m', 'OK'], ['LANE', '3.7 m', 'FAIL'], ['ALTITUDE', '0000 FT', 'FAIL']];
    text('SYSTEMS CHECK · AOH-1953', 160, 190, { size: 20, color: C.dim, ls: 4 });
    rows.forEach(([k, v, r], i) => {
      const tt = -.1 + i * .16; if (lt < tt) return;
      const y = 270 + i * 66, bad = r === 'FAIL';
      text(typed(`${k.padEnd(14, '.')} ${v}`, t, t - lt + tt, 90), 160, y, { size: 36, color: C.ink });
      if (lt > tt + .2) { text(r, 1000, y, { size: 36, weight: 700, color: bad ? C.hot : (r === '??' ? C.ink : C.dim) }); if (bad) { line([[1100, y - 26], [1130, y + 4]], C.hot, 5); line([[1130, y - 26], [1100, y + 4]], C.hot, 5); } }
    });
    const L = LA.notright; let x = 160;
    for (const it of said(L, t)) x += 30 + text(it.w.toUpperCase() + (it.w === L.words[2][0] ? '.' : ''), x, 860 + (1 - it.a) * 30, { fam: FAM.g, weight: 900, size: 150, color: C.hot, alpha: clamp(it.a * 2) });
    if (t > W0(L, 2) + .2) { const on = blink(t, 2.5); frect(1420, 250, 360, 110, on ? C.hot : C.bg); rect(1420, 250, 360, 110, C.hot, 3); text('FAULT', 1600, 325, { size: 54, weight: 700, color: on ? C.bg : C.hot, align: 'center', ls: 8 }); }
    wave(1420, 520, 380, 120, t, { span: 2.5, bar: 5 });
    fx({ glitch: .3 * hit(t, W0(L, 2), 8) });
    cvr(t, 'A05 · CHECK');
  }

  // ---------------- a06 enhance ----------------
  function enhance(t, lt, dur) {
    fill(C.bg); grid(80, '#110f0d');
    const zoom = Math.pow(2, Math.floor(lt / .9) + 2), zp = hit(t, t - lt + Math.floor(lt / .9) * .9, 10);
    const cy = 470, x0 = 100, x1 = 1820;
    for (const g of [-1, 1]) line([[x0, cy + g * 260], [x1, cy + g * 260]], '#2a2622', 1);
    s.beginPath();
    for (let i = 0; i <= 900; i++) { const u = i / 900, tt = t - 1.6 * (1 - u), v = clamp(F('voc', tt) * 2.2); s.lineTo(lerp(x0, x1, u), cy + (Math.sin(tt * TAU * 9 * zoom / 4) * .7 + Math.sin(tt * TAU * 23) * .3) * v * 250); }
    s.lineWidth = 2.5; s.strokeStyle = C.ink; s.stroke();
    line([[x1 - 40, cy - 280], [x1 - 40, cy + 280]], C.hot, 2);
    text(`ENHANCE ×${zoom}`, 120, 200, { size: 40, weight: 700, color: zp > .3 ? C.hot : C.ink, ls: 4 });
    brackets(80 + zp * 30, 160 + zp * 20, 1760 - zp * 60, 640 - zp * 40, 40, C.hot, 3);
    // decoder box
    const [ua, ub] = LYR.A.unk[0], by = 860;
    frect(100, by - 90, 1720, 150, '#0e0d0b'); rect(100, by - 90, 1720, 150, C.dim, 2);
    text('DECODE ▸', 130, by - 55, { size: 16, color: C.dim, ls: 3 });
    if (t < ua) text('…', 130, by + 30, { size: 72, weight: 700, color: C.dim });
    else if (t < ub) text(scramble(Math.min(22, Math.floor((t - ua) * 18) + 3), t, 6), 130, by + 30, { size: 72, weight: 700, color: C.ink });
    else { text('[UNINTELLIGIBLE]', 130, by + 30, { size: 72, weight: 700, color: C.hot }); if (t > ub + .6) text('NO MATCH · SUGGEST: ASK THE PILOT', 1790, by + 30, { size: 22, color: C.dim, align: 'right', ls: 2 }); }
    readout(1460, 210, [['CONF', t < ub ? (0.4 * hash(Math.floor(t * 10))).toFixed(2) : '0.07', true], ['LANG', 'EN?'], ['SNR', '+3 dB']], { col: 100 });
    fx({ glitch: .3 * zp });
    cvr(t, 'A06 · ENHANCE');
  }

  // ---------------- a07 cctv ----------------
  function monitorFrame(t, label, draw) {
    fill('#060505');
    const X = 150, Y = 110, MW = 1620, MH = 830;
    frect(X - 20, Y - 20, MW + 40, MH + 40, '#151310'); rect(X - 20, Y - 20, MW + 40, MH + 40, C.dim, 2);
    withT(() => { s.beginPath(); s.roundRect(X, Y, MW, MH, 24); s.clip(); fill(C.bg); draw(); for (let y = Y; y < Y + MH; y += 4) frect(X, y, MW, 1.2, 'rgba(0,0,0,.25)'); });
    text(label, X + 30, Y + 50, { size: 20, color: C.ink, ls: 3 });
    if (blink(t, 1)) { dot(X + MW - 120, Y + 44, 9, C.hot); }
    text('REC', X + MW - 100, Y + 51, { size: 20, color: C.hot, weight: 700 });
    const clock = 3 * 3600 + 14 * 60 + t; const hh = Math.floor(clock / 3600), mm = Math.floor(clock / 60) % 60, ss = Math.floor(clock) % 60;
    text(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')} AM`, X + MW - 30, Y + MH - 30, { size: 22, color: C.ink, align: 'right', ls: 2 });
  }
  function zees(t, x, y, k = 1) {
    for (let i = 0; i < 4; i++) { const ph = wrap(t * .45 + i * .25, 1); text('Z', x + ph * 140 * k + Math.sin(ph * 8 + i) * 16, y - ph * 260 * k, { fam: FAM.g, weight: 900, size: (30 + ph * 60) * k, color: C.ink, alpha: Math.sin(ph * Math.PI) }); }
  }
  function cctv(t, lt) {
    monitorFrame(t, 'CAM 02 · GARAGE · NIGHT', () => {
      withT(() => {
        const z = 1 + lt * .03; s.translate(960, 600); s.scale(z, z); s.translate(-960, -600);
        garage(t, { cx: 960, gy: 860, k: .95, lid: 1.65, mouth: voc(t) * .8, spin: t * .6, bulb: .2, look: [0, 0] });
        zees(t, 1010, 560, .9);
      });
    });
    const [ua, ub] = LYR.A.unk[1];
    if (t >= ua && t < ub + .5) caption('[UNINTELLIGIBLE]', 960, 880, { align: 'center' });
    else if (voc(t) < .05) caption('[SNORING]', 960, 880, { align: 'center', alpha: .85 });
    readout(190, 920, [['PROP', `${(2 + Math.sin(t)).toFixed(1)} RPM`], ['OIL', '12 °C']], { col: 80, size: 16 });
  }

  // ---------------- a08 maintenance log ----------------
  const PREV = [['03 MAR', 'wingtips scrape guardrail', 'trimmed the hedge'], ['11 MAR', 'overtaken by a bicycle', 'no fault found'], ['19 MAR', 'told to "move over"', 'cannot move over']];
  function techlog(t, lt) {
    const L = LA.wings, CT = W0(L, L.words.length - 1);
    paper(t, lt, () => {
      logPage(t, PREV, (y) => {
        text('03 APR', 70, y, { size: 22, color: C.pencil });
        let x = 210, yy = y;
        const ws = said(L, t);
        ws.forEach((it, wi) => {
          const str = it.w.toUpperCase(), big = wi === 4 || wi === L.words.length - 1, sz = big ? 50 : 34, w = measure(str, { size: sz, weight: 700 });
          if (x + w > 905) { x = 210; yy += 56; }
          text(str, x, yy + (1 - it.a) * 8, { size: sz, weight: 700, color: C.pencil, alpha: clamp(it.a * 2) });
          if (wi === 4) line([[x, yy + 10], [x + w * ease.out(inv(it.t, it.t + .3, t)), yy + 10]], C.pink, 4);
          x += w + 14;
        });
        if (t > CT + .2) text(typed('counted wings: 2.', t, CT + .2, 26), 930, y, { size: 24, color: '#2b3a6b' });
        if (t > CT + .9) text(typed('confirmed: not a car.', t, CT + .9, 26), 930, y + 40, { size: 24, color: '#2b3a6b' });
        // margin sketch: plan view, wings ticked
        withT(() => { s.translate(640, 790); s.globalAlpha = .9; PL.top(0, 0, .28, t, { lw: 1.6, ink: C.pencil, spin: 0 }); s.globalAlpha = 1; });
        for (const sx of [-1, 1]) { s.beginPath(); s.arc(640 + sx * 120, 792, 22, 0, TAU); s.lineWidth = 2.5; s.strokeStyle = C.pink; s.stroke(); text(sx < 0 ? '1' : '2', 640 + sx * 120, 750, { fam: FAM.s, italic: true, size: 30, color: C.pink, align: 'center' }); }
        text('fig. wings', 480, 900, { fam: FAM.s, italic: true, size: 26, color: C.pencil });
      });
      stamp(t, 22.37, 1090, 870, -.12, 460, 140, [['NOT A CAR', 84, 30]], 3);
    }, { shake: 12 * hit(t, 22.37, 16) });
    fx({ paper: 1, flash: .2 * hit(t, 22.37, 18) });
  }

  // ---------------- a09 seat belts ----------------
  function belts(t, lt) {
    fill(C.bg);
    const L = LA.belts, ON = W0(L, 0) - .05, on = t >= ON, h = hit(t, ON, 5);
    // overhead panel
    withT(() => {
      s.translate(960, 380);
      s.beginPath(); s.roundRect(-760, -220, 1520, 440, 60); s.fillStyle = '#121110'; s.fill(); s.lineWidth = 3; s.strokeStyle = C.dim; s.stroke();
      for (let i = 0; i < 2; i++) { s.beginPath(); s.arc(-600 + i * 130, 120, 40, 0, TAU); s.lineWidth = 3; s.strokeStyle = C.dim; s.stroke(); line([[-600 + i * 130, 80], [-600 + i * 130 + 30, 120]], C.dim, 3); }
      // NO SMOKING, dark
      s.beginPath(); s.roundRect(-380, -150, 300, 220, 30); s.fillStyle = '#0c0b0a'; s.fill(); s.lineWidth = 2; s.strokeStyle = '#3a3530'; s.stroke();
      text('NO', -230, -40, { size: 34, weight: 700, color: '#3a3530', align: 'center' }); text('SMOKING', -230, 10, { size: 34, weight: 700, color: '#3a3530', align: 'center' });
      // FASTEN SEAT BELTS
      s.beginPath(); s.roundRect(-40, -150, 760, 220, 30); s.fillStyle = on ? C.hot : '#0c0b0a'; s.fill(); s.lineWidth = 3; s.strokeStyle = on ? C.hot : '#3a3530'; s.stroke();
      const ic = on ? C.bg : '#3a3530', bx = 80, buck = ease.back(inv(W0(L, 4) - .05, W0(L, 4) + .15, t));
      line([[bx - 50, -40], [bx - 10 + 0 * buck, -40]], ic, 14, 'butt'); line([[bx + 50, -40], [bx + 10 + (1 - buck) * 30, -40]], ic, 14, 'butt');
      s.strokeStyle = ic; s.lineWidth = 6; s.strokeRect(bx - 18 + (1 - buck) * 20, -58, 36, 36);
      text('FASTEN', 420, -55, { size: 52, weight: 700, color: ic, align: 'center', ls: 4 }); text('SEAT BELTS', 420, 10, { size: 52, weight: 700, color: ic, align: 'center', ls: 4 });
    });
    if (on) for (let k = 0; k < 3; k++) { const e = t - ON - k * .12; if (e > 0 && e < 1) { s.beginPath(); s.arc(1290, 330, 130 + e * 500, 0, TAU); s.globalAlpha = (1 - e) * .8; s.lineWidth = 3; s.strokeStyle = C.hot; s.stroke(); s.globalAlpha = 1; } }
    if (on && t - ON < .8) text('DING', 1290, 130, { size: 30, weight: 700, color: C.hot, align: 'center', ls: 10 });
    transcript(L, t, 200, 860, { size: 84, maxW: 1560 });
    fx({ flash: .25 * hit(t, ON, 14) });
    cvr(t, 'A09 · CABIN');
  }

  // ---------------- a10 babble ----------------
  function babble(t, lt) {
    fill(C.bg);
    const v = voc(t), L = LA.getin;
    const fr = Math.floor(t * 12);
    for (let c = 0; c < 6; c++) for (let r = 0; r < 7; r++) {
      const sp = (c + 1) * .7, y = wrap(r * 150 + t * 600 * sp, 1050) + 40, x = 140 + c * 290;
      text(scramble(6, t + c * 3.1 + r, c * 9 + r), x, y, { size: 44, weight: 700, color: hash(fr * 7 + c * 13 + r) < .1 + v * .2 ? C.hot : '#3a3530' });
    }
    frect(0, 520, W, 330, 'rgba(10,9,8,.94)'); line([[0, 520], [W, 520]], C.dim, 1.5); line([[0, 850], [W, 850]], C.dim, 1.5);
    text('SPEECH RATE', 140, 560, { size: 18, color: C.dim, ls: 4 }); text(`${(6 + v * 8).toFixed(1)} SYL/S`, 140, 602, { size: 32, weight: 700, color: C.ink });
    text('TRANSCRIBER', 1780, 560, { size: 18, color: C.dim, ls: 4, align: 'right' }); text(blink(t, 4) ? 'OVERLOAD' : '', 1780, 602, { size: 32, weight: 700, color: C.hot, align: 'right' });
    transcript(L, t, 140, 708, { size: 64, lh: 84, maxW: 1640, breakComma: true });
    wave(140, 950, 1640, 110, t, { span: 2, bar: 5 });
    fx({ glitch: clamp(v * 1.2) * .45 });
    cvr(t, 'A10 · OVERLOAD');
    boardTimer(t);
  }

  // the gag: on "5 minutes" a boarding countdown slams on, counts real seconds 5:00 to 4:57, glitches away
  function boardTimer(t) {
    const T5 = W0(LA.getin, 5), OUT = T5 + 3.4, END = T5 + 3.65;
    if (t < T5 - .02 || t >= END) return;
    const e = t - T5, secs = 300 - Math.max(0, Math.floor(e)), str = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    const dsz = 230, lab = 'BOARDING CLOSES IN', lsz = 26;
    const dw = measure('0:00', { size: dsz, weight: 700 }), lw = measure(lab, { size: lsz, ls: 6 });
    const bw = Math.max(dw, lw) + 2 * 80, cap = dsz * .74, bh = 50 + lsz + 40 + cap + 60, bx = 960 - bw / 2, by = 90;
    const draw = () => {
      frect(bx, by, bw, bh, 'rgba(10,9,8,.95)'); rect(bx, by, bw, bh, C.hot, 3); brackets(bx - 14, by - 14, bw + 28, bh + 28, 28, C.hot, 3);
      text(lab, 960, by + 50 + lsz * .8, { size: lsz, color: C.ink, align: 'center', ls: 6 });
      text(str, 960, by + 50 + lsz + 40 + cap, { size: dsz, weight: 700, color: C.hot, align: 'center' });
      const cs = Math.floor((1 - (e - Math.floor(e))) * 100) % 100;
      text(`.${String(cs).padStart(2, '0')}`, bx + bw - 24, by + bh - 20, { size: 22, color: C.dim, align: 'right' });
      text('GATE 3 · AOH-1953', bx + 24, by + bh - 20, { size: 18, color: C.dim, ls: 2 });
    };
    const a = slam(t, T5 - .02, .14), sc = lerp(1.18, 1, a);
    withT(() => {
      s.translate(960, by + bh / 2); s.scale(sc, sc); s.translate(-960, -(by + bh / 2)); s.globalAlpha = clamp(a * 2);
      if (t < OUT) draw();
      else { // glitch out: slices tear sideways and drop out
        const k = (t - OUT) / (END - OUT), fr = Math.floor(t * 24);
        for (let i = 0; i < 9; i++) {
          if (hash(fr * 31 + i * 7) < k * .9) continue;
          withT(() => { s.beginPath(); s.rect(0, by - 20 + i * (bh + 40) / 9, W, (bh + 40) / 9); s.clip(); s.translate((hash(fr * 13 + i) - .5) * 260 * (.3 + k), 0); draw(); });
        }
      }
      s.globalAlpha = 1;
    });
    FX.flash = Math.max(FX.flash || 0, .22 * hit(t, T5, 14));
    FX.glitch = Math.max(FX.glitch || 0, .35 * hit(t, T5, 9) + (t >= OUT ? .9 : 0) + .25 * (e % 1 < .06 && e > .5 ? 1 : 0));
  }

  // ---------------- a11 sleep lab ----------------
  function sleepLab(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    text('POLYSOMNOGRAPH · SUBJECT AOH-1953', 160, 170, { size: 20, color: C.dim, ls: 3 });
    // hypnogram
    const hx = 160, hy = 230, hw = 1600, hh = 120, st = ['WAKE', 'REM', 'N1', 'N2', 'N3'];
    st.forEach((n, i) => text(n, hx - 14, hy + i * 30 + 5, { size: 13, color: C.dim, align: 'right' }));
    s.beginPath(); for (let i = 0; i <= 80; i++) { const lv = [3, 4, 3, 2, 1, 2, 3, 4, 3, 2, 1, 1][Math.floor(i / 7)] ?? 1; s.lineTo(hx + i / 80 * hw * .8, hy + lv * 30); } s.lineWidth = 2; s.strokeStyle = C.ink; s.stroke();
    dot(hx + hw * .8, hy + 30, 8, C.hot); text('NOW: REM', hx + hw * .8 + 20, hy + 36, { size: 18, weight: 700, color: C.hot });
    const chans = [['EEG F3', 1, 14, C.ink], ['EOG L', 2, 4, C.ink], ['EOG R', 3, 4, C.ink], ['EMG PROP', 4, 30, C.dim], ['VOICE', 5, 40, C.hot]];
    chans.forEach(([lab, seed, hz, col], i) => trace(260, 470 + i * 110, 1520, 90, t, { label: lab, seed, hz, color: col, ch: lab === 'VOICE' ? 'voc' : (lab === 'EMG PROP' ? 'rms' : 'voc'), base: lab.startsWith('EOG') ? .5 : .2 }));
    const lh = lastHitLabel(t, 1.6);
    if (lh) { const [ht, lab] = lh, e = t - ht; brackets(1180, 420, 600, 560, 30, C.hot, 3); text('REM BURST', 1760, 410, { size: 24, weight: 700, color: C.hot, align: 'right', ls: 3, alpha: clamp(1.6 - e) }); caption(lab, 960, 1000, { align: 'center' }); }
    fx({ flash: .25 * hits(t, 16), glitch: .5 * hits(t, 7) });
    cvr(t, 'A11 · SLEEP LAB');
    boardTimer(t);
  }

  // ---------------- a12 REM eyes ----------------
  function remEyes(t, lt) {
    fill(C.bg);
    const seg = Math.floor(t * 4.1), u = t * 4.1 - seg, a = [hash(seg * 3) * 2 - 1, hash(seg * 3 + 1) * 1.4 - .7], b = [hash(seg * 3 + 3) * 2 - 1, hash(seg * 3 + 4) * 1.4 - .7];
    const k = 6.5, h = hits(t, 5), look = [lerp(a[0], b[0], ease.out(u * 3)), lerp(a[1], b[1], ease.out(u * 3))];
    withT(() => { s.translate(snoise(t * 30, 3) * 20 * h, 0); PL.front(960, 540 + 184 * k, k, t, { lid: lerp(.95, .55, h), look, mouth: voc(t) * .6, lw: 6, spin: 0 }); });
    text('REM DETECTED', 120, 200, { size: 30, weight: 700, color: C.hot, ls: 6, alpha: blink(t, 2) ? 1 : .5 });
    readout(120, 250, [['SACCADES', '4.1 Hz'], ['DREAM', 'IN PROGRESS', true]], { col: 150, size: 20 });
    const lh = lastHitLabel(t); if (lh) caption(lh[1], 960, 1000, { align: 'center' });
    fx({ glitch: .6 * h, flash: .15 * hits(t, 18) });
    cvr(t, 'A12 · REM');
  }

  // ---------------- a13 dream decoder ----------------
  const THUMBS = [
    (x, y, w, h, t) => { for (let i = 0; i < 3; i++) { const cx = x + w * (.25 + i * .25) + Math.sin(t + i) * 10, cy = y + h * (.4 + .15 * (i % 2)); for (const [dx, r] of [[-30, 26], [0, 36], [32, 24]]) { s.beginPath(); s.arc(cx + dx, cy, r, Math.PI, TAU); s.lineWidth = 2; s.strokeStyle = C.ink; s.stroke(); } } },
    (x, y, w, h, t) => { const f = Math.sin(t * 8); line([[x + w * .3, y + h * .5 - f * 30], [x + w * .5, y + h * .55], [x + w * .7, y + h * .5 - f * 30]], C.ink, 3); },
    (x, y, w, h, t) => { for (let i = 0; i < 8; i++) { const d = wrap(i / 8 + t * .5, 1); dot(x + w / 2 - (w * .45) * d, y + h * .3 + h * .6 * d, 3 + d * 6, C.hot); dot(x + w / 2 + (w * .45) * d, y + h * .3 + h * .6 * d, 3 + d * 6, C.hot); } },
    (x, y, w, h, t) => { PL.top(x + w / 2, y + h / 2, .14, t, { lw: 1.5, rot: Math.PI / 2 }); },
    (x, y, w, h, t) => { dash([[x + 20, y + h * .7], [x + w - 20, y + h * .3]], C.ink, 4, [20, 10], -t * 80); },
    (x, y, w, h, t) => { line([[x, y + h * .75], [x + w, y + h * .75]], C.dim, 2); dash([[x, y + h * .85], [x + w, y + h * .85]], C.dim, 2, [16, 14], t * 200); },
  ];
  function decoder(t, lt) {
    fill(C.bg);
    const X = 110, Y = 150, MW = 1100, MH = 620;
    rect(X, Y, MW, MH, C.dim, 2);
    withT(() => {
      s.beginPath(); s.rect(X, Y, MW, MH); s.clip();
      for (let i = 0; i < 6; i++) { const cx = wrap(X + i * 260 - t * 120, MW + 300) + X - 150, cy = Y + 120 + (i % 3) * 150; for (const [dx, r] of [[-40, 34], [0, 48], [44, 32]]) { s.beginPath(); s.arc(cx + dx, cy, r, Math.PI, TAU); s.lineWidth = 2; s.strokeStyle = '#3a3530'; s.stroke(); } }
      PL.side(X + MW / 2, Y + MH * .62 + Math.sin(t * 1.4) * 30, .9, t, { lid: 1.65, mouth: voc(t), rot: -.08 + Math.sin(t) * .04, spin: t * 20 });
      for (let i = 0; i < 6; i++) line([[X + MW / 2 - 330 - i * 50 - wrap(t * 600, 50), Y + MH * .5 + i * 14], [X + MW / 2 - 370 - i * 80, Y + MH * .5 + i * 14]], C.dim, 2);
    });
    text('DREAM FEED · DECODED 61%', X, Y - 20, { size: 18, color: C.dim, ls: 3 });
    // thumbnails flick on vocal onsets
    const von = FEAT.vonsets.filter((v) => v <= t).length;
    for (let i = 0; i < 6; i++) {
      const tx = 1270 + (i % 2) * 280, ty = 150 + Math.floor(i / 2) * 210, w = 250, h = 180, idx = (i + von) % THUMBS.length;
      rect(tx, ty, w, h, idx === von % THUMBS.length ? C.hot : C.dim, 2);
      withT(() => { s.beginPath(); s.rect(tx, ty, w, h); s.clip(); THUMBS[idx](tx, ty, w, h, t); });
      text(`FRAME ${String(von * 6 + i).padStart(4, '0')}`, tx + 8, ty + h - 10, { size: 12, color: C.dim });
    }
    readout(1270, 830, [['CONTENT', 'FLIGHT (?)', true], ['ALTITUDE', 'YES']], { col: 140, size: 20 });
    const inside = KIT.inUnk('A', t);
    caption(inside ? '[UNINTELLIGIBLE]' : '[MUMBLING]', X, 900, {});
    wave(X, 990, 1100, 70, t, { span: 3, bar: 4 });
    cvr(t, 'A13 · DECODER');
  }

  // ---------------- a14 tape ----------------
  function tape(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    const reel = (cx, cy, R, sp) => {
      s.beginPath(); s.arc(cx, cy, R, 0, TAU); s.lineWidth = 3; s.strokeStyle = C.ink; s.stroke();
      s.beginPath(); s.arc(cx, cy, R * .55, 0, TAU); s.fillStyle = '#1a1714'; s.fill();
      for (let i = 0; i < 3; i++) { const a = t * sp + i * TAU / 3; s.beginPath(); s.arc(cx + Math.cos(a) * R * .32, cy + Math.sin(a) * R * .32, R * .13, 0, TAU); s.lineWidth = 3; s.strokeStyle = C.dim; s.stroke(); }
      dot(cx, cy, R * .07, C.hot);
    };
    withT(() => { const z = 1 + lt * .03; s.translate(700, 520); s.scale(z, z); s.translate(-700, -520);
      reel(420, 420, 230, 1.6); reel(980, 420, 230, 1.3);
      line([[300, 600], [560, 760], [840, 760], [1100, 600]], C.hot, 3);
      frect(640, 730, 120, 60, '#1a1714'); rect(640, 730, 120, 60, C.ink, 2); text('HEAD', 700, 768, { size: 16, color: C.dim, align: 'center', ls: 2 });
    });
    const real = 0, dream = Math.round(9000 + lt * 2200 + Math.sin(t * 2) * 80);
    text('REAL ALT', 1360, 330, { size: 20, color: C.dim, ls: 4 }); text(String(real).padStart(5, '0'), 1360, 420, { size: 96, weight: 700, color: C.ink });
    text('DREAM ALT', 1360, 560, { size: 20, color: C.hot, ls: 4 }); text(String(dream).padStart(5, '0'), 1360, 650, { size: 96, weight: 700, color: C.hot });
    text('FT', 1700, 650, { size: 30, color: C.hot });
    wave(1360, 820, 420, 90, t, { span: 3, bar: 4 });
    cvr(t, 'A14 · TAPE');
  }

  // ---------------- a15 dream altitude ----------------
  function dreamAlt(t, lt) {
    fill(C.bg);
    const [HT] = HITS[3], e = t - HT;
    const alt = e < 0 ? 13000 : e < .5 ? lerp(13000, 35000, ease.out(e / .5)) : lerp(35000, 21000, ease.inOut((e - .5) / 2.4));
    const str = String(Math.round(alt)).padStart(5, '0');
    // vertical tape
    for (let v = Math.floor(alt / 1000) - 6; v < alt / 1000 + 6; v++) { const y = 540 - (v * 1000 - alt) * .09; line([[1700, y], [1760, y]], C.dim, 2); text(String(v * 1000), 1680, y + 7, { size: 18, color: C.dim, align: 'right' }); }
    letters(str, 860, 640, { fam: FAM.g, weight: 900, size: 360, align: 'center' }, (i) => ({ dy: Math.sin(t * 20 + i) * 6 * hits(t, 4), color: e > 0 && e < .7 ? C.hot : C.ink }));
    text('DREAM ALTITUDE · FT', 860, 300, { size: 24, color: C.dim, align: 'center', ls: 8 });
    PL.side(860 + Math.sin(t) * 40, 900 - (alt - 13000) * .008, .28, t, { lid: 1.65, spin: t * 20, lw: 2 });
    if (e > -.03 && e < 1.4) caption(HITS[3][1], 860, 1000, { align: 'center' });
    fx({ flash: .2 * hit(t, HT, 14), glitch: .35 * hit(t, HT, 6) });
    cvr(t, 'A15 · DREAM ALT');
  }

  // ---------------- a16 cctv restless ----------------
  function cctv2(t, lt) {
    const HT = HITS[4][0], h = hits(t, 5), r = clamp(F('rms', t, 2) * 2);
    monitorFrame(t, 'CAM 02 · GARAGE · NIGHT', () => {
      withT(() => {
        s.translate(snoise(t * 30, 4) * 8 * h, -10 * h);
        garage(t, { cx: 960, gy: 880, k: .9, lid: lerp(1.65, 1.0, h), mouth: voc(t), spin: t * (2 + r * 6), bulb: .5 + .5 * (snoise(t * 12, 2) > 0 ? 1 : 0), look: [snoise(t * 5, 1), 0], brow: h * .6 });
        zees(t, 1010, 580, .8);
      });
      const bb = 1 + h * .1; brackets(960 - 360 * bb, 450 - 200 * bb, 720 * bb, 450 * bb, 30, C.hot, 3);
      if (t > HT - .03) text('MOTION DETECTED', 960 + 360, 450 - 210, { size: 22, weight: 700, color: C.hot, align: 'right', ls: 3, alpha: blink(t, 3) ? 1 : .4 });
    });
    const lh = lastHitLabel(t, 1.4); if (lh) caption(lh[1], 960, 880, { align: 'center' });
    trace(330, 990, 1300, 50, t, { seed: 9, hz: 14, color: C.hot, label: 'REM' });
    fx({ glitch: .4 * h });
  }

  // ---------------- a17 montage (one panel per beat) ----------------
  function montage(t, lt) {
    const bi = lastBeat(t), b0 = FEAT.beats[bi], k = bi - lastBeat(52.63), bp = beatPulse(t, 8);
    const stage = ['REM', 'REM', 'REM', 'N1', 'N1', 'N1?', 'WAKE?', 'WAKE?'][Math.min(7, k)];
    fill(k % 2 ? C.bg : '#0d0c0a');
    const panel = k % 4;
    if (panel === 0) { trace(160, 540, 1600, 600, t, { seed: 21 + k, hz: 12, color: C.hot, base: .4, gain: 2, label: '' }); text('EEG ×10', 160, 200, { size: 24, color: C.dim, ls: 4 }); }
    else if (panel === 1) { PL.front(960, 540 + 184 * 5, 5, t, { lid: lerp(.9, .3, bp), look: [snoise(t * 8, k) , 0], mouth: voc(t), lw: 5, spin: 0 }); }
    else if (panel === 2) { wave(100, 540, 1720, 600, t, { span: 1.6, bar: 8 }); }
    else { text(stage, 960, 660, { fam: FAM.g, weight: 900, size: 380, color: stage.startsWith('WAKE') ? C.hot : C.ink, align: 'center' }); }
    text(`SLEEP STAGE ▸ ${stage}`, 960, 160, { size: 26, weight: 700, color: C.hot, align: 'center', ls: 6 });
    const lh = lastHitLabel(t, .9); if (lh) caption(lh[1], 960, 960, { align: 'center' });
    fx({ flash: .12 * bp + .2 * hits(t, 14), glitch: .35 * hits(t, 6) + .15 * bp });
    cvr(t, `A17 · ${String(k + 1).padStart(2, '0')}`);
  }

  // ---------------- a18 boot ----------------
  function boot(t, lt, dur) {
    fill(C.bg);
    const L = ['AOH-1953 SYSTEM WAKE', 'BIOS v1953.03  (C) PROPELLER WORKS', '', 'MAGNETOS ............ OK', 'FUEL ................ 41 GAL', 'TYRES ............... 4 / INFLATED', 'WINGS ............... TOO WIDE (IGNORE)', 'ALTITUDE ............ 0000', 'DREAM BUFFER ........ DISCARDED', 'GARAGE DOOR ......... CLOSED', '', 'READY.'];
    L.forEach((l, i) => { const t0 = i * .17; if (lt > t0) text(typed(l, t, t - lt + t0, 80), 160, 190 + i * 52, { size: 32, color: i === 0 || /IGNORE|DISCARDED|READY/.test(l) ? C.hot : C.ink, weight: i === 0 ? 700 : 400 }); });
    const p = clamp(lt / (dur - .1));
    rect(160, 880, 1600, 40, C.dim, 2); frect(166, 886, 1588 * p, 28, C.hot);
    text(`${Math.round(p * 100)}%`, 1760, 860, { size: 22, color: C.ink, align: 'right' });
    if (blink(t, 3)) frect(160 + measure(typed(L[Math.min(L.length - 1, Math.floor(lt / .17))], t, 0, 1e9), { size: 32 }) + 10, 190 + Math.min(L.length - 1, Math.floor(lt / .17)) * 52 - 28, 18, 32, C.hot);
    fx({ flash: .1 * beatPulse(t, 12) });
    cvr(t, 'A18 · WAKE', { state: '▶ LIVE' });
  }

  // ---------------- a19 eyes open ----------------
  function eyesOpen(t, lt) {
    fill(C.bg);
    const k = 3.6, o = ease.back(inv(0, .12, lt)), h = hit(t, t - lt, 6);
    const look = lt < .6 ? [0, 0] : lt < 1.1 ? [-.8, -.2] : lt < 1.6 ? [.8, -.2] : [0, .3];
    withT(() => { s.translate(snoise(t * 40, 2) * 12 * h, snoise(t * 40, 3) * 12 * h); PL.front(960, 660 + 184 * k, k, t, { lid: lerp(1.6, 0, o), look, mouth: .15 * h, brow: .5 * h, lw: 5, spin: 0 }); });
    letters('AWAKE', 960, 270, { fam: FAM.g, weight: 900, size: 200, stretch: 'expanded', align: 'center' }, (i) => { const p = slam(t, t - lt + .05 + i * .03, .12); return { dy: (1 - p) * 70, alpha: clamp(p * 2), color: C.hot }; });
    fx({ flash: .5 * hit(t, t - lt, 12), glitch: .4 * h });
    cvr(t, 'A19 · WAKE', { state: '▶ LIVE' });
  }

  // ---------------- a20 engines ----------------
  function engines(t, lt) {
    fill(C.bg); grid(60, '#100f0d');
    const bs = [61.37, 61.93, 62.50, 63.07], words = ['CONTACT', 'ENGINE 1', 'ENGINE 2', 'RUNNING'];
    const k = bs.filter((b) => t >= b - .02).length - 1;
    const r1 = clamp((t - 61.93) * 1.5), r2 = clamp((t - 62.50) * 1.5);
    PL.front(960, 900, .95, t, { spin: 0, look: [0, -.1], mouth: 0, smile: .5 });
    // prop blur overrides: draw blur discs on top of each prop
    for (const [sx, r] of [[-1, r1], [1, r2]]) { if (r <= 0) continue; const px = 960 + sx * 250 * .95, py = 900 - 110 * .95; s.beginPath(); s.arc(px, py, 62 * .95, 0, TAU); s.globalAlpha = .25 + .35 * r; s.lineWidth = 3; s.strokeStyle = C.hot; s.stroke(); s.globalAlpha = 1; }
    // dials
    for (const [i, r] of [[0, r1], [1, r2]]) {
      const cx = i ? 1600 : 320, cy = 360, R = 150, a0 = Math.PI * .75, a1 = Math.PI * 2.25, v = r * (.85 + .05 * Math.sin(t * 30));
      s.beginPath(); s.arc(cx, cy, R, a0, a1); s.lineWidth = 3; s.strokeStyle = C.dim; s.stroke();
      for (let j = 0; j <= 10; j++) { const a = lerp(a0, a1, j / 10); line([[cx + Math.cos(a) * (R - 20), cy + Math.sin(a) * (R - 20)], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]], j > 8 ? C.hot : C.ink, 3); }
      const na = lerp(a0, a1, v); line([[cx, cy], [cx + Math.cos(na) * (R - 30), cy + Math.sin(na) * (R - 30)]], C.hot, 5); dot(cx, cy, 10, C.ink);
      text(`ENG ${i + 1}`, cx, cy + 70, { size: 22, color: C.dim, align: 'center', ls: 3 }); text(`${Math.round(v * 2600)} RPM`, cx, cy + 110, { size: 28, weight: 700, color: C.ink, align: 'center' });
    }
    if (k >= 0) { const a = slam(t, bs[k] - .02, .12); withT(() => { const sc = lerp(1.2, 1, a); s.translate(960, 300); s.scale(sc, sc); text(words[k], 0, 0, { fam: FAM.g, weight: 900, size: 150, color: k === 3 ? C.hot : C.ink, align: 'center', alpha: clamp(a * 2) }); }); }
    fx({ flash: .15 * beatPulse(t, 14), glitch: .2 * beatPulse(t, 10) });
    cvr(t, 'A20 · START', { state: '▶ LIVE' });
  }

  // ---------------- a21 title ----------------
  function title(t, lt) {
    fill(C.bg);
    const T1 = 63.67, T2 = 64.83, bp = beatPulse(t, 9);
    withT(() => { s.globalAlpha = .55; garage(t, { ext: true, door: 0, cx: 960, gy: 1000, k: .78, spin: t * 30 }); s.globalAlpha = 1; });
    frect(0, 250, W, 420, 'rgba(10,9,8,.82)');
    const a = slam(t, T1, .16);
    letters('BOB WISEMAN', 960, 400, { fam: FAM.g, weight: 900, size: 150, stretch: 'expanded', align: 'center', ls: 10 }, (i) => { const p = slam(t, T1 + i * .02, .14); return { dy: (1 - p) * -90, alpha: clamp(p * 2), color: C.ink }; });
    if (t >= T2 - .02) {
      const str = 'Airplane on the Highway', sz = fitSize(str, 1500, 170, { fam: FAM.s, italic: true });
      letters(str, 960, 590, { fam: FAM.s, italic: true, weight: 400, size: sz, align: 'center' }, (i) => { const p = slam(t, T2 - .02 + i * .015, .14); return { dy: (1 - p) * 80, alpha: clamp(p * 2), color: C.hot, sc: 1 + .03 * bp * (i % 2) }; });
    }
    line([[300, 450], [300 + 1320 * ease.out(inv(T1, T1 + .6, t)), 450]], C.dim, 2);
    text('AOH/03 · 2026 · FROM THE COCKPIT VOICE RECORDER', 960, 720, { size: 18, color: C.dim, align: 'center', ls: 4, alpha: clamp((t - T2 - .4) * 2) });
    fx({ flash: .25 * hit(t, T1, 16) + .25 * hit(t, T2, 16), glitch: .2 * hit(t, T1, 8) });
    cvr(t, 'A21 · TITLE', { state: '▶ LIVE' });
  }

  // ---------------- a22 door ----------------
  function door(t, lt, dur) {
    fill(C.bg);
    const open = ease.inOut(inv(.05, 1.0, lt));
    garage(t, { ext: true, door: open, cx: 960, gy: 960, k: 1.05, spin: t * 30, look: [0, .1], smile: .6, brow: -.2 });
    if (open > .1) { for (const sx of [-1, 1]) { const x = 960 + sx * 70 * 1.05, y = 960 - 150 * 1.05; dot(x, y + 70, 9, C.hot); } }
    tag(960 + 330 * 1.05, 960 - 300 * 1.05, 1560, 300, 'DOOR · OPENING', `${Math.round(open * 100)}%`, { size: 24 });
    cvr(t, 'A22 · DOOR', { state: '▶ LIVE' });
  }

  // ---------------- a23 roll-out (plan view) ----------------
  function rollout(t, lt, dur) {
    fill(C.bg); grid(64, '#141210');
    const u = lt / dur;
    // highway, horizontal near the bottom; driveway down from the garage top-left
    const hy0 = 700, hy1 = 940;
    frect(0, hy0, W, hy1 - hy0, '#100f0d'); line([[0, hy0], [W, hy0]], C.ink, 3); line([[0, hy1], [W, hy1]], C.ink, 3);
    dash([[0, (hy0 + hy1) / 2], [W, (hy0 + hy1) / 2]], '#5a554d', 4, [50, 40], -t * 300);
    text('HWY 3 · EASTBOUND', 1700, hy1 + 40, { size: 16, color: C.dim, align: 'right', ls: 3 });
    rect(650, 120, 220, 240, C.ink, 3); text('GARAGE', 760, 105, { size: 16, color: C.dim, align: 'center', ls: 4 });
    line([[690, 360], [690, hy0]], C.dim, 2); line([[830, 360], [830, hy0]], C.dim, 2);
    for (const sx of [-1, 1]) { dot(760 + sx * 110, 236, 9, C.bg); s.beginPath(); s.arc(760 + sx * 110, 236, 9, 0, TAU); s.lineWidth = 2; s.strokeStyle = C.dim; s.stroke(); } // the wing holes he left
    // cars passing
    for (let i = 0; i < 3; i++) { const x = wrap(-400 + (t - 69.43) * 1400 + i * 760, W + 600) - 300; withT(() => { s.translate(x, hy1 - 60); s.strokeStyle = C.ink; s.lineWidth = 2.5; s.beginPath(); s.roundRect(-70, -34, 140, 68, 12); s.fillStyle = C.bg; s.fill(); s.stroke(); }); }
    // path: down the driveway then turn east into the near lane
    const P = samplePath((v) => { const a = 1 - v; return [a * a * a * 760 + 3 * a * a * v * 760 + 3 * a * v * v * 800 + v * v * v * 1500, a * a * a * 250 + 3 * a * a * v * 760 + 3 * a * v * v * 880 + v * v * v * 880]; }, 300);
    const d = (ease.sine(u) * .6 + u * .4) * .97 * P.len, [px, py, pa] = atLen(P, d);
    PL.top(px, py, .26, t, { rot: pa + Math.PI / 2, spin: t * 30, ink: C.hot });
    brackets(px - 150, py - 110, 300, 220, 18, C.hot, 2);
    tag(px + (px > 1200 ? -60 : 60), py - 60, px > 1200 ? px - 200 : px + 200, py - 240, u > .6 ? 'ON THE HIGHWAY' : 'ROLLING OUT', `GS ${Math.round(u * 61).toString().padStart(3, '0')} MPH · ALT 0000`, { size: 22, left: px > 1200 });
    cvr(t, 'A23 · MERGE', { state: '▶ LIVE' });
  }

  chapter('A', 0, 72.0, [
    [0, playback], [2.40, ladder], [3.75, ground], [6.50, ident], [8.65, checklist], [11.17, enhance], [14.80, cctv], [19.00, techlog],
    [23.50, belts], [26.05, babble], [28.30, sleepLab], [33.33, remEyes], [36.78, decoder], [41.00, tape], [44.40, dreamAlt], [47.23, cctv2],
    [52.63, montage], [56.67, boot], [59.00, eyesOpen], [61.37, engines], [63.67, title], [68.27, door], [69.43, rollout],
  ]);
})();
