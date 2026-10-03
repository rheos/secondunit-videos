// 71.0 - 91.0, verse 2 (both lines + the "mnuh" fill). Kinetic type / FUI. The lyric words are the set;
// the plane is a technical drawing living inside the interface. One idea per shot, cuts on the beat or
// on the sung word. Word text comes from js/lyrics.js (not in git); times are LYR.w[k][1].
//   71.00 SH01 tracker   flight-tracker map: a plane blip on a highway, tagged AIRCRAFT ON ROADWAY;
//                        a voice-input bar types the opening words
//   72.87 SH02 set type  the word is a wall of giant letters; the plane drives under them and they lift
//                        out of his way like a wave
//   74.77 SH03 cockpit   his POV: a flight HUD on a highway, the word painted on the asphalt, ALT 0000
//   75.73 SH04 drawing   front elevation, dimensioned: wingspan vs lane width, CLEARANCE: NEGATIVE
//   77.20 SH05 gauge     STRANGENESS meter climbs with the voice
//   78.28 SH06 strange   the word arcs over his face, pegged, eyes spiralling
//   79.03 SH07 errors    three terminal error pop-ups, one per syllable, over the vocal trace
//   80.85 SH08 radar     radar scope, the second line starts
//   81.88 SH09 banner    he tows the word along a winding road like an aerial banner
//   83.95 SH10 traffic   top-down traffic HUD, cars tagged as they overtake under his wing
//   85.90 SH11 form      cream paper: passing-lane access application, the line typed in, DENIED
//   88.70 SH12 members   the roped-off passing lane, cars whip past, he sulks
(() => {
  const voc = (t) => clamp(F('voc', t, 1) * 1.5);
  const slam = (t, t0, d = .14) => ease.back(inv(t0, t0 + d, t));
  const wrap = (x, m) => ((x % m) + m) % m;

  // ---------------- SH01 tracker ----------------
  function tracker(t, lt) {
    fill(C.bg);
    const road = (u) => { const a = 1 - u; return [a * a * a * -150 + 3 * a * a * u * 520 + 3 * a * u * u * 1250 + u * u * u * 2100, a * a * a * 820 + 3 * a * a * u * 860 + 3 * a * u * u * 140 + u * u * u * 90]; };
    const P = samplePath(road, 300);
    const pu = .42 + .025 * lt, pd = pu * P.len, [px, py, pa] = atLen(P, pd);
    const z = 1.05 + lt * .07;
    withT(() => {
      s.translate(px, py); s.scale(z, z); s.translate(-px + (960 - px) * .25 / z, -py + (420 - py) * .25 / z);
      grid(64, '#171512');
      for (let i = 0; i < 10; i++) {
        s.beginPath();
        for (let a = 0; a <= TAU + .01; a += .06) { const r = 90 + i * 64 + 22 * Math.sin(a * 3 + i) + 14 * Math.sin(a * 5 - i * 2); s.lineTo(1500 + Math.cos(a) * r * 1.35, 300 + Math.sin(a) * r * .8); }
        s.lineWidth = 1.3; s.strokeStyle = i % 3 ? '#2a2723' : '#3a3530'; s.stroke();
      }
      for (let i = 0; i < 6; i++) {
        s.beginPath();
        for (let a = 0; a <= TAU + .01; a += .06) { const r = 60 + i * 50 + 16 * Math.sin(a * 4 + i * 1.7); s.lineTo(300 + Math.cos(a) * r * 1.2, 260 + Math.sin(a) * r * .9); }
        s.lineWidth = 1.2; s.strokeStyle = '#26231f'; s.stroke();
      }
      line(P.p, '#4a453e', 44); line(P.p, C.bg, 38); dash(P.p, '#4a453e', 2, [16, 16], -t * 40);
      text('HWY 3', 330, 760, { size: 16, color: C.dim, ls: 3 });
      text('KOOTENAY PASS  1775 m', 1320, 120, { size: 14, color: C.dim, ls: 2 });
      // cars: tagged blips overtaking along the road
      for (let i = 0; i < 4; i++) {
        const cu = wrap(.18 + i * .23 + lt * .09, 1), [cx, cy, ca] = atLen(P, cu * P.len);
        if (Math.abs(cu - pu) < .02) continue;
        withT(() => { s.translate(cx, cy); s.rotate(ca); s.strokeStyle = C.ink; s.lineWidth = 2; s.strokeRect(-9, -11, 18, 10); });
        text(`CAR ${String(41 + i * 17).padStart(3, '0')}`, cx + 10, cy - 18, { size: 12, color: C.dim });
      }
      for (let k = 0; k < 2; k++) { const bt = FEAT.beats[Math.max(0, lastBeat(t) - k)], r = 12 + (t - bt) * 160; s.beginPath(); s.arc(px, py, r, 0, TAU); s.globalAlpha = clamp(1 - (t - bt) * 1.6); s.lineWidth = 2; s.strokeStyle = C.hot; s.stroke(); s.globalAlpha = 1; }
      PL.top(px, py, .075, t, { rot: pa + Math.PI / 2, lw: 2, ink: C.hot });
      brackets(px - 70, py - 60, 140, 120, 16, C.hot, 2);
      tag(px + 40, py - 40, px + 140, py - 200, 'AIRCRAFT ON ROADWAY', `ALT 0000 FT · GS 061 MPH · SQK 7700`, { size: 26 });
    });
    readout(80, 150, [['TRK', '047°'], ['GS', `${(61 + 2 * Math.sin(t * 3)).toFixed(0)} MPH`], ['ALT', '0000 FT', true], ['GEAR', 'TYRES ×4']], { col: 70 });
    // voice-input bar types the opening words
    const y0 = 770;
    frect(0, y0, W, 210, 'rgba(10,9,8,.93)'); line([[0, y0], [W, y0]], C.dim, 1.5); line([[0, y0 + 210], [W, y0 + 210]], C.dim, 1.5);
    text(t < wt('im1') - .05 ? 'VOICE ▸ LISTENING' : 'VOICE ▸ TRANSCRIBING', 110, y0 + 38, { size: 16, color: C.dim, ls: 3 });
    text('>', 110, y0 + 158, { size: 110, color: C.hot, weight: 700 });
    let str = '';
    if (sung('im1', t)) str += typed(up('im1'), t, wt('im1') - .03, 40);
    if (sung('an1', t)) str += ' ' + typed(up('an1'), t, wt('an1') - .03, 40);
    const w = text(str, 210, y0 + 158, { size: 120, weight: 700, color: C.ink });
    if (blink(t)) frect(210 + w + 10, y0 + 70, 56, 100, C.hot);
    for (let i = 0; i < 70; i++) { const tt = t - (70 - i) * .02, v = F('voc', tt); frect(1240 + i * 8, y0 + 105 - v * 70, 4, 4 + v * 140, i > 64 ? C.hot : C.dim); }
    chrome(t, 'SH01 · TRACK');
  }

  // ---------------- SH02 set type ----------------
  function setType(t, lt, dur) {
    fill(C.bg); grid(90, '#14120f');
    const road = 905;
    line([[0, road], [W, road]], C.dim, 2);
    dash([[0, road + 36], [W, road + 36]], '#3d3833', 3, [46, 40], t * 700);
    const str = up('airplane1'), o = { fam: FAM.g, weight: 900, stretch: 'expanded' }, size = fitSize(str, 1800, 420, o);
    const px = lerp(-260, 1780, ease.inOut(lt / dur) * .3 + lt / dur * .7), k = .95;
    letters(str, 960, 730, { ...o, size, align: 'center' }, (i, ch, mx) => {
      const a = slam(t, wt('airplane1') - .02 + i * .016, .14), d = (mx - px) / 260, g = Math.exp(-d * d);
      return { dy: -300 * g + (1 - a) * -140, rot: -.22 * d * g, alpha: clamp(a * 3), color: g > .45 ? C.hot : C.ink };
    });
    PL.side(px, road, k, t, { mouth: voc(t), look: [.8, -.5], spin: t * 16 });
    for (let i = 0; i < 5; i++) line([[px - 330 - i * 60 - (t * 900 % 60), road - 30 - i * 18], [px - 360 - i * 90, road - 30 - i * 18]], C.dim, 2);
    text('FIG. 1  AIRCRAFT, PROPELLER, ROAD-GOING  (NOT TO SCALE)', 960, 1000, { size: 16, color: C.dim, align: 'center', ls: 2 });
    let x = 150;
    for (const kk of ['on1', 'the1']) if (sung(kk, t)) { const a = slam(t, wt(kk), .1); x += 16 + text(word(kk), x, 250 - (1 - a) * 30, { fam: FAM.s, italic: true, size: 130, color: C.hot, alpha: clamp(a * 2) }); }
    chrome(t, 'SH02 · SET');
  }

  // ---------------- SH03 cockpit HUD on the highway ----------------
  function cockpit(t, lt) {
    fill(C.bg);
    const hy = 430, K = 650, vx = 960, spread = 1.65;
    poly([[vx - 2, hy], [vx + 2, hy], [vx + 650 * spread, hy + 650], [vx - 650 * spread, hy + 650]], '#121110');
    line([[vx, hy], [vx + 650 * spread, hy + 650]], C.ink, 3); line([[vx, hy], [vx - 650 * spread, hy + 650]], C.ink, 3);
    // lane dashes coming at us
    const sp = 9, per = 1.6, off = wrap(t * sp, per);
    for (const f of [-1 / 3, 1 / 3]) for (let d = .8 - off; d < 40; d += per) {
      const d1 = Math.max(.75, d), d2 = d + per * .5; if (d2 < .75) continue;
      const y1 = hy + K / d1, y2 = hy + K / d2, x1 = vx + f * (y1 - hy) * spread, x2 = vx + f * (y2 - hy) * spread, w1 = (y1 - hy) * .012, w2 = (y2 - hy) * .012;
      poly([[x1 - w1, y1], [x1 + w1, y1], [x2 + w2, y2], [x2 - w2, y2]], '#5a554d');
    }
    // the word painted on the asphalt (mode-7 strips)
    const str = up('highway1');
    const tex = textCanvas('hw:' + str, 1600, 640, (g) => {
      g.save(); g.scale(1, 2.1); font(FAM.g, 100, 900, { ls: 8 }); const sz = Math.min(290, 100 * 1540 / s.measureText(str).width);
      font(FAM.g, sz, 900, { ls: sz * .08 }); g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillStyle = C.hot; g.fillText(str, 800, 640 / 2.1 - 8); g.restore();
    });
    const dA = lerp(1.3, 1.02, ease.out(lt / .96)), dB = dA + 1.7;
    for (let sy = Math.floor(hy + K / dB); sy < Math.min(H, hy + K / dA); sy += 2) {
      const d = K / (sy - hy), v = clamp((dB - d) / (dB - dA)), hw = (sy - hy) * spread * .7;
      s.drawImage(tex, 0, Math.floor(v * (tex.height - 1)), tex.width, 1, vx - hw, sy, hw * 2, 2.6);
    }
    // HUD
    const hc = C.ink;
    line([[160, hy], [700, hy]], hc, 2); line([[1220, hy], [1760, hy]], hc, 2);
    for (let i = -3; i <= 3; i++) if (i) { const yy = hy + i * 70; line([[820, yy], [880, yy]], C.dim, 1.5); line([[1040, yy], [1100, yy]], C.dim, 1.5); text(String(Math.abs(i * 5)), 800, yy + 6, { size: 15, color: C.dim, align: 'right' }); }
    s.beginPath(); s.arc(vx, hy + 40, 18, 0, TAU); s.lineWidth = 3; s.strokeStyle = C.hot; s.stroke();
    line([[vx - 60, hy + 40], [vx - 18, hy + 40]], C.hot, 3); line([[vx + 18, hy + 40], [vx + 60, hy + 40]], C.hot, 3); line([[vx, hy + 22], [vx, hy + 2]], C.hot, 3);
    // speed tape
    rect(150, 230, 140, 420, C.dim, 2);
    const spd = 61 + 2 * Math.sin(t * 2);
    withT(() => { s.beginPath(); s.rect(150, 230, 140, 420); s.clip(); for (let v = 30; v <= 100; v += 10) { const yy = 440 - (v - spd) * 9; line([[260, yy], [290, yy]], C.dim, 2); text(String(v), 245, yy + 7, { size: 22, color: C.dim, align: 'right' }); } });
    frect(150, 415, 150, 50, C.bg); rect(150, 415, 150, 50, C.hot, 3); text(spd.toFixed(0).padStart(3, '0'), 225, 452, { size: 34, weight: 700, color: C.hot, align: 'center' });
    text('MPH', 220, 210, { size: 16, color: C.dim, align: 'center', ls: 2 });
    // altitude tape, stuck at zero
    rect(1630, 230, 140, 420, C.dim, 2);
    for (let v = -2; v <= 2; v++) { const yy = 440 - v * 90; line([[1630, yy], [1660, yy]], C.dim, 2); text(String(v * 100), 1680, yy + 7, { size: 22, color: C.dim }); }
    frect(1620, 415, 150, 50, C.bg); rect(1620, 415, 150, 50, C.hot, 3); text('0000', 1695, 452, { size: 34, weight: 700, color: C.hot, align: 'center' });
    text('ALT FT', 1700, 210, { size: 16, color: C.dim, align: 'center', ls: 2 });
    if (blink(t, 3)) text('GND', 1700, 700, { size: 22, weight: 700, color: C.hot, align: 'center', ls: 4 });
    // heading tape
    for (let hh = -4; hh <= 4; hh++) { const xx = vx + hh * 90 - wrap(t * 6, 90); line([[xx, 130], [xx, 145]], C.dim, 2); }
    rect(vx - 50, 150, 100, 40, C.ink, 2); text('047', vx, 180, { size: 26, color: C.ink, align: 'center' });
    text('RUNWAY: NONE', 1700, 770, { size: 16, color: C.dim, align: 'center', ls: 3 });
    chrome(t, 'SH03 · HUD');
  }

  // ---------------- SH04 dimensioned front elevation ----------------
  function dimLine(x1, x2, y, label, p, c = C.ink, labelY = -16) {
    const xm = (x1 + x2) / 2, hx = (x2 - x1) / 2 * ease.out(p);
    line([[xm - hx, y], [xm + hx, y]], c, 2);
    if (p > .98) { for (const [x, d] of [[x1, 1], [x2, -1]]) { poly([[x, y], [x + d * 22, y - 7], [x + d * 22, y + 7]], c); line([[x, y - 18], [x, y + 18]], c, 2); } }
    if (p > .6) text(label, xm, y + labelY, { size: 26, color: c, align: 'center', ls: 2, alpha: inv(.6, 1, p) });
  }
  function drawing(t, lt) {
    fill(C.bg); grid(40, '#121110'); grid(200, '#1d1b18');
    const gy = 820, k = .76, cx = 960 + Math.sin(lt * 1.5) * 6;
    line([[80, gy], [1840, gy]], C.dim, 2);
    for (const lx of [-170, 170]) { frect(cx + lx - 4, gy, 8, 14, C.hot); }
    for (let x = 100; x < 1840; x += 26) line([[x, gy + 2], [x - 16, gy + 18]], '#2c2925', 1.5);
    const look = t < 76.6 ? [lerp(0, -.7, inv(75.9, 76.2, t)), -.4] : [.2, -.6];
    PL.front(cx, gy, k, t, { mouth: voc(t), look, lid: .15, brow: .4, smile: 0 });
    const tip = 620 * k, p1 = inv(75.85, 76.25, t), p2 = inv(76.15, 76.5, t);
    s.setLineDash([4, 8]); if (p1 > 0) { line([[cx - tip, gy - 120 * k], [cx - tip, 470]], C.dim, 1.5); line([[cx + tip, gy - 120 * k], [cx + tip, 470]], C.dim, 1.5); } s.setLineDash([]);
    dimLine(cx - tip, cx + tip, 480, 'WINGSPAN  35.1 m', p1);
    dimLine(cx - 170, cx + 170, 900, 'LANE  3.7 m', p2, C.ink, 46);
    if (t > 76.45) {
      const on = blink(t, 3);
      frect(1440, 590, 380, 92, on ? C.hot : C.bg); rect(1440, 590, 380, 92, C.hot, 3);
      text('CLEARANCE', 1465, 625, { size: 20, color: on ? C.bg : C.hot, ls: 3 }); text('NEGATIVE −31.4 m', 1465, 664, { size: 28, weight: 700, color: on ? C.bg : C.hot });
      line([[1440, 636], [cx + tip + 10, gy - 112 * k]], C.hot, 2);
    }
    rect(1380, 930, 470, 92, C.dim, 1.5); line([[1380, 960], [1850, 960]], C.dim, 1); line([[1380, 990], [1850, 990]], C.dim, 1);
    text('DWG AOH-04   FRONT ELEVATION', 1395, 952, { size: 15, color: C.dim, ls: 1 });
    text('SCALE 1:48   SHEET 4 OF 12', 1395, 982, { size: 15, color: C.dim, ls: 1 });
    text('STATUS: DOES NOT FIT', 1395, 1012, { size: 15, color: C.hot, weight: 700, ls: 1 });
    let x = 150;
    for (const kk of ['and1', 'i1']) if (sung(kk, t)) { const a = slam(t, wt(kk), .1); x += 34 + text(word(kk), x, 330 - (1 - a) * 30, { fam: FAM.s, italic: true, size: 170, color: kk === 'i1' ? C.hot : C.ink, alpha: clamp(a * 2) }); }
    text('FRONT ELEVATION', 150, 200, { size: 16, color: C.dim, ls: 4 });
    chrome(t, 'SH04 · DWG');
  }

  // ---------------- SH05 strangeness gauge ----------------
  function gauge(t, lt) {
    fill(C.bg); grid(60, '#121110');
    const cx = 960, cy = 930, R = 430, a0 = Math.PI * 1.08, a1 = Math.PI * 1.92;
    const val = clamp(10 + 66 * ease.inOut(inv(77.2, 78.25, t)) + 12 * F('voc', t, 2) + 1.5 * snoise(t * 22, 4), 0, 100);
    s.beginPath(); s.arc(cx, cy, R, a0, a1); s.lineWidth = 3; s.strokeStyle = C.dim; s.stroke();
    s.beginPath(); s.arc(cx, cy, R - 20, lerp(a0, a1, .8), a1); s.lineWidth = 34; s.strokeStyle = C.hot; s.stroke();
    s.beginPath(); s.arc(cx, cy, R - 20, a0, lerp(a0, a1, val / 100)); s.lineWidth = 34; s.strokeStyle = 'rgba(236,230,216,.12)'; s.stroke();
    for (let v = 0; v <= 100; v += 5) {
      const a = lerp(a0, a1, v / 100), r0 = R - (v % 20 ? 50 : 70);
      line([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * (R - 40), cy + Math.sin(a) * (R - 40)]], v >= 80 ? C.hot : C.ink, v % 20 ? 2 : 4);
      if (v % 20 === 0) text(String(v), cx + Math.cos(a) * (R - 105), cy + Math.sin(a) * (R - 105) + 8, { size: 24, color: C.dim, align: 'center' });
    }
    const na = lerp(a0, a1, val / 100);
    line([[cx - Math.cos(na) * 40, cy - Math.sin(na) * 40], [cx + Math.cos(na) * (R - 30), cy + Math.sin(na) * (R - 30)]], C.hot, 6);
    dot(cx, cy, 22, C.bg); s.beginPath(); s.arc(cx, cy, 22, 0, TAU); s.lineWidth = 3; s.strokeStyle = C.ink; s.stroke();
    text('STRANGENESS', cx, cy - 150, { size: 22, color: C.dim, align: 'center', ls: 8 });
    text(val.toFixed(1).padStart(5, '0') + '%', cx, cy - 70, { size: 76, weight: 700, color: val > 80 ? C.hot : C.ink, align: 'center' });
    // and I FEEL so  (as one line, centred)
    const parts = [['and1', { fam: FAM.s, italic: true, size: 130, color: C.dim }], ['i1', { fam: FAM.s, italic: true, size: 130, color: C.dim }],
      ['feel', { fam: FAM.g, weight: 900, size: 270, color: C.ink, upper: true }], ['so', { fam: FAM.s, italic: true, size: 190, color: C.hot }]];
    const ws = parts.map(([kk, o]) => measure(o.upper ? up(kk) : word(kk), o)), gap = 34, tot = ws.reduce((a, b) => a + b, 0) + gap * 3;
    let x = cx - tot / 2;
    parts.forEach(([kk, o], i) => {
      if (sung(kk, t) || kk === 'and1' || kk === 'i1') {
        const a = kk === 'feel' || kk === 'so' ? slam(t, wt(kk), .12) : 1;
        withT(() => { const sc = lerp(1.25, 1, a); s.translate(x + ws[i] / 2, 360); s.scale(sc, sc); text(o.upper ? up(kk) : word(kk), 0, 0, { ...o, align: 'center', alpha: clamp(a * 2) }); });
      }
      x += ws[i] + gap;
    });
    readout(80, 150, [['SENSOR', 'VOC/ENV'], ['GAIN', '+6 dB'], ['RANGE', '0–100']], { col: 100 });
    chrome(t, 'SH05 · GAUGE');
  }

  // ---------------- SH06 STRANGE ----------------
  function strange(t, lt) {
    fill(C.bg);
    const T0 = wt('strange'), h = hit(t, T0, 7);
    for (let i = 0; i < 48; i++) { const a = i / 48 * TAU + lt * .25; line([[960 + Math.cos(a) * 260, 900 + Math.sin(a) * 260], [960 + Math.cos(a) * 1500, 900 + Math.sin(a) * 1500]], i % 4 ? '#1c1a17' : '#2e2a25', 2); }
    const shake = 14 * h; s.translate(snoise(t * 40, 1) * shake, snoise(t * 40, 2) * shake);
    PL.front(960, 1185, 1.55, t, { mouth: Math.max(voc(t), .5 * h), spiral: t * 9, lid: 0, brow: -.6, smile: -.2 });
    const str = up('strange'), sz = 205, R = 590, cyA = 960, spread = 2.05;
    font(FAM.g, sz, 900, {}); const ws = [...str].map((ch) => s.measureText(ch).width), tot = ws.reduce((a, b) => a + b, 0) + 14 * (str.length - 1);
    let acc = 0;
    [...str].forEach((ch, i) => {
      const mid = acc + ws[i] / 2; acc += ws[i] + 14;
      const a = -Math.PI / 2 + (mid / tot - .5) * spread, p = slam(t, T0 - .02 + i * .012, .12);
      const bob = 10 * Math.sin(t * 9 + i * 1.3) + 26 * beatPulse(t, 10) * (i % 2 ? 1 : -1);
      const r = R + bob + (1 - p) * 260;
      withT(() => {
        s.translate(960 + Math.cos(a) * r, cyA + Math.sin(a) * r); s.rotate(a + Math.PI / 2 + .06 * Math.sin(t * 7 + i));
        s.globalAlpha = clamp(p * 2); font(FAM.g, sz, 900, {}); s.textAlign = 'center'; s.textBaseline = 'alphabetic'; s.fillStyle = C.hot; s.fillText(ch, 0, 0); s.globalAlpha = 1;
      });
    });
    s.setTransform(RS, 0, 0, RS, 0, 0);
    if (blink(t, 4)) text('STRANGENESS 100.0%  ·  OUT OF RANGE', 960, 140, { size: 24, weight: 700, color: C.hot, align: 'center', ls: 3 });
    fx({ flash: .22 * hit(t, T0, 18), glitch: .7 * hit(t, T0, 5) + .25 * beatPulse(t, 12) });
    chrome(t, 'SH06 · PEGGED');
  }

  // ---------------- SH07 three error beeps ----------------
  function errors(t, lt) {
    fill(C.bg);
    const X = 150, Y = 120, PW = 1620, PH = 830;
    frect(X, Y, PW, PH, '#0e0d0b'); rect(X, Y, PW, PH, C.dim, 2); frect(X, Y, PW, 44, '#1b1916');
    text('tty0 — vocal.log', X + 24, Y + 29, { size: 18, color: C.dim });
    for (let i = 0; i < 3; i++) { s.beginPath(); s.arc(X + PW - 30 - i * 28, Y + 22, 7, 0, TAU); s.lineWidth = 2; s.strokeStyle = C.dim; s.stroke(); }
    const log = ['> transcribe --verse 2 --line 3', 'parsing ......................... ok', 'phonemes ........................ ?', 'dictionary lookup ............... FAIL'];
    log.forEach((l, i) => { if (lt > i * .12) text(typed(l, t, 79.03 + i * .12, 120), X + 30, Y + 90 + i * 30, { size: 19, color: i === 3 ? C.hot : C.dim }); });
    // the vocal trace, last 2.4 s
    const tx0 = X + 40, tx1 = X + PW - 40, cy = Y + PH - 180;
    s.beginPath();
    for (let i = 0; i <= 700; i++) { const u = i / 700, tt = t - 2.4 * (1 - u), v = F('voc', tt); s.lineTo(lerp(tx0, tx1, u), cy + Math.sin(tt * TAU * 38) * v * 120); }
    s.lineWidth = 2; s.strokeStyle = C.ink; s.stroke();
    line([[tx0, cy], [tx1, cy]], '#2e2a25', 1);
    const keys = [['mnuh', 200, 200, '0x4D'], ['nuh1', 680, 330, '0x4E'], ['nuh2', 1160, 460, '0x4E']];
    let gl = 0;
    for (const [kk, px, py, code] of keys) {
      if (!sung(kk, t, .02)) continue;
      const t0 = wt(kk), p = slam(t, t0 - .02, .12); gl = Math.max(gl, hit(t, t0, 10));
      // mark the syllable on the trace
      const mx = lerp(tx0, tx1, 1 - (t - t0) / 2.4); if (mx > tx0) { line([[mx, cy - 140], [mx, cy + 140]], C.hot, 2); text(code, mx + 8, cy - 124, { size: 16, color: C.hot }); }
      withT(() => {
        s.translate(px + 280, py + 150); s.scale(lerp(.6, 1, p), lerp(.6, 1, p)); s.translate(-280, -150); s.globalAlpha = clamp(p * 2.5);
        frect(0, 0, 560, 300, C.bg); rect(0, 0, 560, 300, C.hot, 3); frect(0, 0, 560, 46, C.hot);
        text(`ERROR ${code}`, 20, 32, { size: 22, weight: 700, color: C.bg, ls: 2 }); text('×', 532, 34, { size: 28, weight: 700, color: C.bg, align: 'center' });
        text(up(kk), 280, 196, { size: 130, weight: 700, color: C.ink, align: 'center' });
        text('unrecognised syllable', 30, 270, { size: 16, color: C.dim });
        rect(420, 244, 110, 38, C.ink, 2); text('OK', 475, 270, { size: 18, color: C.ink, align: 'center', weight: 700 });
        s.globalAlpha = 1;
      });
    }
    fx({ glitch: .75 * gl, flash: .12 * gl });
    chrome(t, 'SH07 · ERR');
  }

  // ---------------- SH08 radar ----------------
  function radar(t, lt) {
    fill(C.bg);
    const cx = 1300, cy = 540, R = 400, sw = t * 3.1;
    for (let r = 100; r <= R; r += 100) { s.beginPath(); s.arc(cx, cy, r, 0, TAU); s.lineWidth = r === R ? 2.5 : 1.3; s.strokeStyle = r === R ? C.ink : '#3a3530'; s.stroke(); }
    line([[cx - R, cy], [cx + R, cy]], '#2e2a25', 1.3); line([[cx, cy - R], [cx, cy + R]], '#2e2a25', 1.3);
    for (let d = 0; d < 360; d += 10) { const a = d * Math.PI / 180; line([[cx + Math.cos(a) * R, cy + Math.sin(a) * R], [cx + Math.cos(a) * (R + (d % 30 ? 10 : 20)), cy + Math.sin(a) * (R + (d % 30 ? 10 : 20))]], C.dim, 1.5); }
    withT(() => {
      s.beginPath(); s.arc(cx, cy, R, 0, TAU); s.clip();
      const ra = -.5; const dir = [Math.cos(ra), Math.sin(ra)], nrm = [-dir[1], dir[0]];
      for (const o of [-14, 14]) line([[cx - dir[0] * 600 + nrm[0] * o, cy - dir[1] * 600 + nrm[1] * o], [cx + dir[0] * 600 + nrm[0] * o, cy + dir[1] * 600 + nrm[1] * o]], '#3a3530', 2);
      for (let j = 0; j < 40; j++) { const a = sw - j * .022; s.globalAlpha = (1 - j / 40) * .5; line([[cx, cy], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]], C.hot, 3); }
      s.globalAlpha = 1; line([[cx, cy], [cx + Math.cos(sw) * R, cy + Math.sin(sw) * R]], C.hot, 3);
      const blip = (bx, by, r, c) => { const a = Math.atan2(by - cy, bx - cx), age = wrap(sw - a, TAU) / 3.1; s.globalAlpha = clamp(1 - age * .7) * .9 + .1; dot(bx, by, r, c); s.globalAlpha = 1; };
      const pd = -60 + lt * 30; blip(cx + dir[0] * pd, cy + dir[1] * pd, 13, C.hot);
      for (let i = 0; i < 4; i++) { const d = -380 + wrap(lt * 260 + i * 210, 760); blip(cx + dir[0] * d - nrm[0] * 7, cy + dir[1] * d - nrm[1] * 7, 6, C.ink); }
    });
    const pd = -60 + lt * 30, bx = cx + Math.cos(-.5) * pd, by = cy + Math.sin(-.5) * pd;
    tag(bx, by, bx + 160, by + 190, 'AC-1953 · ON ROAD', 'LANE 3 · 61 MPH · BEING PASSED', { size: 22 });
    const a = slam(t, wt('im2'), .14);
    withT(() => { const sc = lerp(1.3, 1, a); s.translate(110, 640); s.scale(sc, sc); text(up('im2'), 0, 0, { fam: FAM.g, weight: 900, size: 400, color: C.ink, alpha: clamp(a * 2) }); });
    if (sung('an2', t)) { const b = slam(t, wt('an2'), .1); text(word('an2'), 130, 850 - (1 - b) * 30, { fam: FAM.s, italic: true, size: 200, color: C.hot, alpha: clamp(b * 2) }); }
    text('RNG 2 NM · SWEEP 30 RPM', cx, cy + R + 60, { size: 16, color: C.dim, align: 'center', ls: 3 });
    chrome(t, 'SH08 · SCOPE');
  }

  // ---------------- SH09 the word as a towed banner ----------------
  function banner(t, lt) {
    fill(C.bg); grid(80, '#131110');
    const P = samplePath((u) => { const x = lerp(-900, 4200, u); return [x, 700 + 120 * Math.sin(x / 420 + .6)]; }, 900);
    const dPlane = 2700 + lt * 700;
    const [px, py, pa] = atLen(P, dPlane), k = .5, cam = px - 1560;
    withT(() => {
      s.translate(-cam, 0);
      line(P.p, '#3e3a34', 96); line(P.p, C.bg, 90); dash(P.p, '#4a453e', 3, [30, 30]);
      // banner letters ride the road behind him, E nearest the tow rope
      const str = up('airplane2'), sz = 165; font(FAM.g, sz, 900, {}); const ws = [...str].map((ch) => s.measureText(ch).width);
      let d = dPlane - 300 * k - 110;
      const [rx, ry] = atLen(P, d + 20);
      const tail = [px - Math.cos(pa) * 290 * k - Math.sin(pa) * -160 * k, py - Math.sin(pa) * 290 * k + Math.cos(pa) * -160 * k];
      dash([tail, [rx, ry - 90]], C.hot, 3, [10, 8]);
      for (let i = str.length - 1; i >= 0; i--) {
        const mid = d - ws[i] / 2, [lx, ly, la] = atLen(P, mid), p = slam(t, wt('airplane2') - .02 + i * .016, .12);
        withT(() => {
          s.translate(lx, ly - 10); s.rotate(la); s.scale(lerp(.2, 1, p), lerp(.2, 1, p)); s.globalAlpha = clamp(p * 2);
          font(FAM.g, sz, 900, {}); s.textAlign = 'center'; s.textBaseline = 'alphabetic'; s.fillStyle = C.ink; s.fillText(str[i], 0, 0); s.globalAlpha = 1;
        });
        d -= ws[i] + 10;
      }
      PL.side(px, py, k, t, { rot: pa, mouth: voc(t), look: [-.7, -.2], spin: t * 18 });
    });
    let x = 150;
    for (const kk of ['on2', 'the2']) if (sung(kk, t)) { const b = slam(t, wt(kk), .1); x += 26 + text(word(kk), x, 300 - (1 - b) * 30, { fam: FAM.s, italic: true, size: 150, color: C.hot, alpha: clamp(b * 2) }); }
    readout(1460, 160, [['TOW', 'BANNER, 8 LTR'], ['DRAG', 'ROAD SURFACE', true]], { col: 90 });
    chrome(t, 'SH09 · TOW');
  }

  // ---------------- SH10 top-down traffic ----------------
  const CARS = [[83.85, 860, 1000], [84.45, 1060, 620], [84.75, 860, 1100], [85.3, 860, 950], [85.55, 1060, 600]];
  function traffic(t, lt) {
    fill(C.bg); grid(100, '#121110', 0, t * 500);
    const L = 760, Rr = 1360;
    frect(L, 0, Rr - L, H, '#100f0d');
    line([[L, 0], [L, H]], C.ink, 3); line([[Rr, 0], [Rr, H]], C.ink, 3);
    const off = wrap(t * 520, 90);
    for (const x of [960, 1160]) for (let y = -90 + off; y < H; y += 90) line([[x, y], [x, y + 45]], x === 960 ? C.hot : '#5a554d', 4, 'butt');
    withT(() => { s.translate(800, 980); s.rotate(-Math.PI / 2); text('PASSING LANE', 0, 0, { size: 16, color: C.hot, ls: 4 }); });
    let passed = 9;
    for (const [t0, x, v] of CARS) {
      const y = 1250 - (t - t0) * v; if (t - t0 > .1 && y < 640) passed++;
      if (y < -200 || y > 1300) continue;
      withT(() => { s.translate(x, y); s.beginPath(); s.roundRect(-38, -70, 76, 140, 16); s.fillStyle = C.bg; s.fill(); s.lineWidth = 2.5; s.strokeStyle = C.ink; s.stroke(); line([[-30, -30], [30, -30]], C.ink, 2); line([[-30, 34], [30, 34]], C.ink, 2); });
      tag(x - 40, y - 40, x - 120, y - 110, `+${Math.round(v / 26)} MPH`, null, { size: 18, left: true });
    }
    const px = 1240, py = 640 + Math.sin(t * 3) * 6;
    PL.top(px, py, .5, t, { spin: t * 25 });
    brackets(px - 340, py - 175, 680, 340, 26, C.hot, 2.5);
    tag(px + 330, py - 170, px + 380, py - 280, 'AIRCRAFT ON ROADWAY', `LANE 3 · 61 MPH · PASSED ×${passed}`, { size: 22, left: true });
    const str = up('highway2'), o = { fam: FAM.g, weight: 900, stretch: 'semi-condensed' }, sz = fitSize(str, 960, 300, o), a = slam(t, wt('highway2'), .16);
    withT(() => { s.translate(560, 1020 + (1 - a) * 90); s.rotate(-Math.PI / 2); text(str, 0, 0, { ...o, size: sz, color: C.ink, alpha: clamp(a * 2) }); });
    readout(1520, 820, [['VEH/MIN', '42'], ['AVG', '68 MPH'], ['AIRCRAFT', '1', true]], { col: 130 });
    chrome(t, 'SH10 · TRAFFIC');
  }

  // ---------------- SH11 the application ----------------
  function form(t, lt) {
    fill('#141210'); fx({ paper: 1 });
    const T = wt('lane'), sh = 16 * hit(t, T, 16) + 7 * hit(t, 88.13, 16);
    withT(() => {
      s.translate(960 + snoise(t * 50, 5) * sh, 540 + snoise(t * 50, 6) * sh); s.rotate(-.018 + .004 * Math.sin(lt)); s.scale(1 + lt * .012, 1 + lt * .012);
      frect(-760 + 14, -505 + 18, 1520, 1010, 'rgba(0,0,0,.5)'); frect(-760, -505, 1520, 1010, C.paper);
      s.translate(-760, -505);
      const ink = C.pencil, red = C.pink;
      frect(60, 50, 270, 76, ink); text('FORM 22-B', 195, 103, { fam: FAM.g, weight: 900, size: 46, color: C.paper, align: 'center' });
      text('APPLICATION FOR PASSING-LANE ACCESS', 360, 88, { fam: FAM.g, weight: 800, size: 40, color: ink });
      text('Dept. of Roads & Lanes · Section 3 · Print clearly in block capitals · Do not fold', 362, 118, { size: 15, color: '#6b6357' });
      line([[60, 150], [1460, 150]], ink, 3);
      text('1. APPLICANT', 60, 200, { size: 16, color: '#6b6357', ls: 2 });
      text('Aircraft, propeller, 1953  (on car tyres)', 290, 202, { size: 30, color: ink }); line([[285, 214], [1460, 214]], '#b9ae98', 1.5);
      text('2. VEHICLE CLASS', 60, 270, { size: 16, color: '#6b6357', ls: 2 });
      ['CAR', 'TRUCK', 'BUS', 'MOTORCYCLE', 'AIRPLANE'].forEach((c, i) => {
        const bx = 290 + i * 230; rect(bx, 244, 30, 30, ink, 2.5); text(c, bx + 44, 270, { size: 22, color: ink });
        if (c === 'AIRPLANE') { line([[bx + 4, 248], [bx + 28, 272]], ink, 4); line([[bx + 28, 248], [bx + 4, 272]], ink, 4); }
      });
      text('3. REASON FOR REQUEST', 60, 340, { size: 16, color: '#6b6357', ls: 2 });
      line([[60, 520], [1460, 520]], '#b9ae98', 1.5); line([[60, 700], [1460, 700]], '#b9ae98', 1.5);
      // the sung line, word by word
      let x = 70;
      for (const kk of ['and2', 'im3']) if (sung(kk, t)) x += 26 + text(typed(word(kk), t, wt(kk) - .03, 30), x, 500, { size: 76, color: ink });
      if (sung('sick', t)) { const a = slam(t, wt('sick'), .12); withT(() => { s.translate(x + 10, 505); s.scale(lerp(1.4, 1, a), lerp(1.4, 1, a)); text(up('sick'), 0, 0, { fam: FAM.g, weight: 900, size: 170, color: red, alpha: clamp(a * 2) }); }); }
      x = 70;
      for (const kk of ['of', 'the3']) if (sung(kk, t)) x += 26 + text(word(kk), x, 680, { size: 76, color: ink });
      const psz = fitSize(up('passing') + ' ' + up('lane'), 1440 - x, 150, { fam: FAM.g, weight: 900 });
      if (sung('passing', t)) { const a = slam(t, wt('passing'), .1); x += psz * .2 + text(up('passing'), x, 685 - (1 - a) * 20, { fam: FAM.g, weight: 900, size: psz, color: ink, alpha: clamp(a * 2) }); }
      if (sung('lane', t)) { const a = slam(t, wt('lane'), .1); text(up('lane'), x, 685 - (1 - a) * 20, { fam: FAM.g, weight: 900, size: psz, color: ink, alpha: clamp(a * 2) }); }
      text('4. SIGNATURE OF APPLICANT', 60, 800, { size: 16, color: '#6b6357', ls: 2 });
      line([[60, 900], [700, 900]], '#b9ae98', 1.5);
      s.beginPath(); for (let i = 0; i <= 120; i++) { const u = i / 120; s.lineTo(90 + u * 480 + 26 * Math.sin(u * 30), 870 - 30 * Math.sin(u * 9) * (1 - u) - 12 * Math.cos(u * 30)); } s.lineWidth = 3; s.strokeStyle = '#2b3a6b'; s.stroke();
      text('5. FOR OFFICE USE ONLY', 820, 800, { size: 16, color: '#6b6357', ls: 2 }); rect(820, 820, 640, 140, '#b9ae98', 1.5);
      // stamps
      const stamp = (t0, x0, y0, rot, w, h, lines, big) => {
        if (t < t0) return; const p = ease.out(inv(t0, t0 + .07, t)), sc = lerp(2.3, 1, p);
        withT(() => {
          s.translate(x0, y0); s.rotate(rot); s.scale(sc, sc); s.globalAlpha = .9 * p;
          s.lineWidth = 8; s.strokeStyle = red; s.strokeRect(-w / 2, -h / 2, w, h); s.lineWidth = 3; s.strokeRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28);
          lines.forEach(([str, sz, dy]) => text(str, 0, dy, { fam: FAM.g, weight: 900, size: sz, color: red, align: 'center', ls: big ? 6 : 2 }));
          s.globalAlpha = 1; s.fillStyle = C.paper; // worn rubber
          for (let i = 0; i < 260; i++) { const r = rng(i * 97 + (big ? 1 : 7)); const hx = (r() - .5) * w, hy = (r() - .5) * h; s.globalAlpha = .55 * p; s.fillRect(hx, hy, 2 + r() * 7, 2 + r() * 4); }
          s.globalAlpha = 1;
        });
      };
      stamp(T, 1245, 385, -.16, 540, 200, [['DENIED', 145, 52]], true);
      stamp(88.13, 1100, 890, .06, 600, 110, [['PASSING LANE · MEMBERS ONLY', 38, 14]], false);
    });
    fx({ paper: 1, flash: .25 * hit(t, T, 18) });
  }

  // ---------------- SH12 members only ----------------
  const VIP = [[88.95, 2700], [89.55, 3100], [90.2, 2600]];
  function members(t, lt) {
    fill(C.bg); grid(80, '#121110', -t * 140, 0);
    const scroll = t * 160;
    const laneT = 360, laneB = 560, road = 975;
    frect(0, laneT, W, laneB - laneT, '#14100e');
    line([[0, laneT], [W, laneT]], C.hot, 2); line([[0, laneB], [W, laneB]], C.hot, 2);
    for (let i = -1; i < 10; i++) {
      const x = i * 240 - wrap(scroll, 240), x2 = x + 240;
      for (const yb of [laneB + 6]) {
        line([[x, yb], [x, yb - 90]], C.ink, 4); dot(x, yb - 96, 10, C.ink);
        s.beginPath(); s.moveTo(x, yb - 86); s.quadraticCurveTo(x + 120, yb - 20, x2, yb - 86); s.lineWidth = 6; s.strokeStyle = C.hot; s.stroke();
      }
    }
    for (const [t0, v] of VIP) {
      const x = -500 + (t - t0) * v; if (x < -500 || x > W + 400) continue;
      const y = laneB - 40;
      for (let i = 0; i < 6; i++) line([[x - 260 - i * 30, y - 20 - i * 14], [x - 80, y - 20 - i * 14]], C.dim, 2);
      withT(() => {
        s.translate(x, y);
        s.beginPath(); s.moveTo(-170, 0); s.lineTo(-170, -50); s.lineTo(-90, -56); s.lineTo(-40, -100); s.lineTo(80, -100); s.lineTo(130, -56); s.lineTo(180, -48); s.lineTo(180, 0); s.closePath();
        s.fillStyle = C.bg; s.fill(); s.lineWidth = 3; s.strokeStyle = C.ink; s.stroke();
        for (const wx of [-110, 120]) { s.beginPath(); s.arc(wx, 0, 30, 0, TAU); s.fillStyle = C.bg; s.fill(); s.stroke(); }
      });
      text('VIP', x - 20, y - 130, { size: 18, weight: 700, color: C.hot, ls: 3 });
    }
    line([[0, road], [W, road]], C.dim, 2);
    dash([[0, 620], [W, 620]], '#4a453e', 3, [40, 36], scroll);
    const k = .82, px = 700;
    const nextCar = VIP.map(([t0, v]) => -500 + (t - t0) * v).find((x) => x > px - 200 && x < W);
    const lookX = nextCar !== undefined ? clamp((nextCar - px) / 600, -1, 1) : .2;
    PL.side(px, road, k, t, { mouth: voc(t), look: [lookX, -.75], lid: .45, frown: .8, smile: -.7, spin: t * 6 });
    text('PASSING LANE', 960, 190, { size: 20, color: C.dim, align: 'center', ls: 10 });
    const neon = .75 + .25 * (snoise(t * 18, 9) > -.6 ? 1 : 0);
    text('Members only', 960, 310, { fam: FAM.s, italic: true, size: 140, color: C.hot, align: 'center', alpha: neon });
    if (lt > .3) tag(px + 230, road - 200, px + 420, road - 330, 'ACCESS DENIED', blink(t, 1.6) ? 'REROUTE?  [Y/N] _' : 'REROUTE?  [Y/N]', { size: 24 });
    chrome(t, 'SH12 · VIP');
  }

  chapter('type', 71.0, 91.0, [
    [71.0, tracker], [wt('airplane1'), setType], [wt('highway1'), cockpit], [75.73, drawing], [wt('feel'), gauge],
    [wt('strange'), strange], [wt('mnuh') - .02, errors], [wt('im2') - .02, radar], [wt('airplane2') - .02, banner],
    [wt('highway2') - .02, traffic], [85.90, form], [88.70, members],
  ]);
})();
