// 112.0 - 187.0  THE YEARS (instrumental) and VERSE 3 (the 80s). Look: photocopied flyer (look-xerox.js).
// Facts on the board are from docs/ELLEN.md. Times: onsets from data.js (hits 112.67, 125.40, 131.63, 134.80,
// 136.33, 138.77, 144.17; verse 3 lines 152.9, 159.47, 167.53, 172.33, 177.0, 182.1, 185.03).
//   112.0  board     the light show is gone; a split-flap departures board, flaps clattering. Her years flip in
//                    a row at a time and each gets DEPARTED stamped in pink; the narrator's row reads LATE
//   115.3  flutter   the wordless vocal: every flap spins
//   120.6  train     the train tears through the station, faster and faster; the copier's light bar sweeps the
//                    frame on each big hit; carriage windows carry the years
//   146.0  settle    the train is gone; the board shows one line: 1980s
//   152.9  copier    "I heard about her in the 80s": her flyer comes out of a photocopier, gets stapled to a pole
//   159.5  shrug     "wondered what's so special": the man in the hat stops, looks, shrugs
//   167.5  away      "made no effort": he walks off, back to it
//   172.3  cheque    rain; the flyer peels off and under it is a cheque stapled to the pole, MEMO: ME AND JIMI
//                    (lands on "cheque", 176.42)
//   177.0  platform  "I'm ashamed I missed that train": a platform, the train's tail lights going; he holds a
//                    torn scrap of the flyer
//   185.0  name      the scrap fills the frame: ELLEN McILWAINE in pink
(() => {
  const K = XINK.K, Pk = XINK.P, T = (x) => onTwos(x, 12);
  const HITS = [112.67, 125.40, 131.63, 134.80, 136.33, 138.77, 144.17];
  function rectk(x, y, w, h, c) { s.fillStyle = c; s.fillRect(x, y, w, h); }
  function txt(str, x, y, size, c, font = 'Helvetica Neue', weight = '700', align = 'left') { s.font = `${weight} ${size}px "${font}"`; s.fillStyle = c; s.textAlign = align; s.textBaseline = 'alphabetic'; s.fillText(str, x, y); }
  // ransom-note type: each letter its own cut scrap, its own font and size, slightly rotated
  const FONTS = [['Helvetica Neue', '900'], ['Impact', '400'], ['American Typewriter', '700'], ['Superclarendon', '900'], ['Courier New', '700']];
  function ransom(str, x, y, size, seed, pinkEvery = 0) {
    let cx = x;
    [...str].forEach((ch, i) => {
      if (ch === ' ') { cx += size * .45; return; }
      const r = hash(i * 13 + seed), [f, wgt] = FONTS[Math.floor(r * FONTS.length)], sz = size * (.8 + hash(i + seed) * .45), rot = (hash(i * 7 + seed) - .5) * .18;
      s.save(); s.font = `${wgt} ${sz}px "${f}"`; const w = s.measureText(ch).width;
      s.translate(cx + w / 2 + 6, y); s.rotate(rot);
      const inv_ = hash(i * 3 + seed) < .4, pink = pinkEvery && i % pinkEvery === 0;
      s.fillStyle = inv_ ? K() : pink ? Pk(.9) : K(.08); s.fillRect(-w / 2 - 6, -sz * .82, w + 12, sz * 1.02);
      s.fillStyle = inv_ ? XINK.PAPER : K(); s.textAlign = 'center'; s.fillText(ch, 0, 0); s.restore();
      cx += w + 14;
    });
    return cx;
  }

  // ---------- the departures board ----------
  const ROWS = [
    ['1966', 'NEW YORK', 'CAFE AU GO GO', 113.53], ['1968', 'WOODSTOCK', 'FEAR ITSELF', 114.6], ['1972', 'POLYDOR', 'HONKY TONK ANGEL', 116.17],
    ['1973', 'POLYDOR', 'WE THE PEOPLE', 116.7], ['1982', 'ON RECORD', 'WITH JACK BRUCE', 118.3], ['1987', 'CANADA', 'TORONTO, CALGARY', 119.9],
  ];
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function flap(str, x, y, n, settleAt, t, size = 46, seed = 0) {
    for (let i = 0; i < n; i++) {
      const ch = str[i] || ' ', done = settleAt !== Infinity && t >= settleAt + i * .03, spin = !done && (settleAt === Infinity || t > settleAt - .6);
      const g = done ? ch : spin ? GLYPHS[Math.floor(hash(Math.floor(t * 30) + i * 7 + seed) * GLYPHS.length)] : ' ';
      const cx = x + i * size * .72;
      rectk(cx, y - size, size * .66, size * 1.24, K(.92));
      if (g !== ' ') { s.font = `700 ${size}px "Helvetica Neue"`; s.fillStyle = XINK.PAPER; s.textAlign = 'center'; s.fillText(g, cx + size * .33, y + size * .08); }
    }
  }
  function stamp(str, x, y, at, t, rot = -.12) {
    if (t < at) return; const k = 1 + hit(t, at, 14) * .6;
    s.save(); s.translate(x, y); s.rotate(rot); s.scale(k, k); s.lineWidth = 6; s.strokeStyle = Pk(); s.strokeRect(-130, -38, 260, 62);
    s.font = '900 44px "Impact"'; s.fillStyle = Pk(); s.textAlign = 'center'; s.fillText(str, 0, 8); s.restore();
  }
  function shotBoard(t, l) {
    const tt = T(t), flutter = t > 115.3 && t < 119.1;
    fx({ gen: .3, bar: barFX(t) });
    rectk(0, 0, W, H, K(.12));
    rectk(120, 70, W - 240, 900, K(.85)); rectk(140, 90, W - 280, 860, K(.97));
    txt('DEPARTURES', 180, 165, 64, XINK.PAPER, 'Helvetica Neue', '900');
    txt('YEAR   FROM / TO         SERVICE', 180, 215, 26, XINK.PAPER, 'Courier New', '700');
    ROWS.forEach(([yr, place, what, at], i) => {
      const y = 290 + i * 98, a = flutter ? Infinity : at;   // the flutter: every flap spins
      flap(yr, 180, y, 4, a, tt, 58, i * 3); flap(place, 400, y, 10, a + .1, tt, 50, i * 5); flap(what, 830, y, 16, a + .2, tt, 42, i * 7);
      stamp('DEPARTED', 1590, y - 16, at + .5, tt, -.1 + (i % 2) * .08);
    });
    // the narrator's row
    const y = 290 + 6 * 98; flap('1980', 180, y, 4, 120.6, tt, 58, 90); flap('TORONTO', 400, y, 10, 120.7, tt, 50, 91); flap('BOB', 830, y, 16, 120.8, tt, 42, 92);
    if (tt > 121.3) { s.save(); s.translate(1590, y - 16); s.rotate(.06); s.font = '900 60px "Impact"'; s.fillStyle = K(); s.textAlign = 'center'; s.fillText('LATE', 0, 10); s.restore(); }
  }
  // the copier light bar sweeps on each big hit (0.45 s across)
  function barFX(t) { for (const h of HITS) if (t >= h && t < h + .45) return (t - h) / .45; return -1; }

  // ---------- the train tears through ----------
  function shotTrain(t, l) {
    const tt = T(t), k = t - 120.6, speed = 900 + k * 260;
    fx({ gen: .5, bar: barFX(t), flash: hit(t, 134.80, 6) * .5 });
    rectk(0, 0, W, H, K(.1));
    rectk(0, 820, W, 260, K(.9)); for (let i = 0; i < 10; i++) rectk(i * 210 + 30, 900, 120, 12, K(.3));
    // carriages
    const CAR = 820, x0 = -((k * speed) % CAR);
    for (let c = -1; c < 4; c++) {
      const x = x0 + c * CAR, idx = Math.floor((k * speed) / CAR) + c;
      rectk(x + 10, 220, CAR - 20, 560, K(.95)); rectk(x + 10, 220, CAR - 20, 26, K(.6));
      for (let w = 0; w < 4; w++) { rectk(x + 50 + w * 190, 300, 150, 190, XINK.PAPER); }
      const yr = ROWS[((idx % ROWS.length) + ROWS.length) % ROWS.length][0];
      s.font = '900 120px "Impact"'; s.fillStyle = idx % 3 === 0 ? Pk() : XINK.PAPER; s.textAlign = 'center'; s.fillText(yr, x + CAR / 2, 680);
    }
    // motion lines
    for (let i = 0; i < 18; i++) { const y = 200 + hash(i) * 620, x = W - ((k * speed * 1.6 + hash(i + 3) * W * 3) % (W * 1.5)); rectk(x, y, 300 + hash(i + 7) * 500, 4, K(.7)); }
    // the vocal at 136.87: the pink headline flashes
    if (t > 136.6 && t < 138.6) ransom('ELLEN', 640, 160, 110, 3, 2);
  }
  function shotSettle(t, l) {
    const tt = T(t);
    fx({ gen: .3, bar: barFX(t) });
    rectk(0, 0, W, H, K(.12));
    rectk(120, 270, W - 240, 420, K(.97));
    flap('1980S', 560, 520, 5, 146.6, tt, 150, 200);
  }

  // ---------- verse 3: the flyer, the pole, the man ----------
  function flyer(x, y, w, h, rot = 0, peel = 0) {
    s.save(); s.translate(x, y); s.rotate(rot);
    if (peel > 0) { s.translate(0, peel * 400); s.rotate(peel * 1.4); s.scale(1 - peel * .2, 1 - peel * .2); }
    rectk(-w / 2, -h / 2, w, h, K(.04));
    ransom('ELLEN', -w / 2 + 30, -h / 2 + 120, 96, 11, 2);
    s.save(); s.translate(-w / 2 + 30, -h / 2 + 150); rectk(0, 0, w - 60, 230, K(.55)); for (let i = 0; i < 10; i++) rectk(20 + i * 30, 20 + hash(i) * 40, 12, 190 - hash(i) * 40, K(.95)); s.restore();
    txt('McILWAINE', 0, -h / 2 + 470, 64, K(), 'Impact', '400', 'center');
    txt('SLIDE GUITAR. ONE NIGHT.', 0, -h / 2 + 530, 30, K(), 'Courier New', '700', 'center');
    rectk(-w / 2 + 30, -h / 2 + 560, w - 60, 54, Pk(.9)); txt('QUEEN ST W  $5 AT THE DOOR', 0, -h / 2 + 598, 28, K(), 'Helvetica Neue', '900', 'center');
    s.restore();
  }
  function cheque(x, y, t, at) {
    const k = (1 + hit(t, at, 12) * .12) * .58;   // narrower than the flyer, so it stays hidden until the peel
    s.save(); s.translate(x, y); s.rotate(-.04); s.scale(k, k);
    rectk(-330, -150, 660, 300, K(.05)); rectk(-330, -150, 660, 14, K(.5));
    txt('PAY TO THE ORDER OF', -300, -70, 26, K(), 'Courier New', '700'); rectk(-20, -76, 300, 3, K(.8));
    rectk(150, -20, 150, 56, Pk(.9)); txt('$', 170, 20, 36, K(), 'Helvetica Neue', '900');
    txt('MEMO: ME AND JIMI', -300, 90, 26, K(), 'Courier New', '700'); rectk(60, 100, 230, 3, K(.8));
    for (let i = 0; i < 4; i++) rectk(-14 + i * 10, -160, 6, 26, Pk(.9));      // staples
    s.restore();
  }
  function man(x, y, sc, walk, t, turn = 0) {
    s.save(); s.translate(x, y); s.scale(sc * (turn ? -1 : 1), sc);
    const a = Math.sin(t * 9) * .55 * walk;
    s.fillStyle = K();
    [a, -a].forEach((q) => { s.save(); s.translate(0, -170); s.rotate(q); s.fillRect(-14, 0, 28, 170); s.restore(); });
    s.beginPath(); s.moveTo(-60, -170); s.lineTo(60, -170); s.lineTo(50, -400); s.lineTo(-50, -400); s.closePath(); s.fill();
    s.beginPath(); s.ellipse(0, -440, 40, 46, 0, 0, TAU); s.fill(); s.beginPath(); s.ellipse(0, -472, 70, 14, 0, 0, TAU); s.fill(); s.fillRect(-42, -530, 84, 60);
    s.save(); s.translate(50, -300); s.rotate(-a * .5); s.fillRect(-10, 0, 20, 70); s.fillStyle = K(.6); s.fillRect(-160, 70, 320, 70); s.restore();
    s.restore();
  }
  function street(t, rain = 0) {
    rectk(0, 0, W, H, K(.16));
    for (let i = 0; i < 6; i++) { const bx = i * 340 - 40, bh = 380 + hash(i) * 260; rectk(bx, 880 - bh, 300, bh, K(.3 + hash(i + 2) * .2)); for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) rectk(bx + 30 + c * 90, 900 - bh + r * 80, 50, 46, K(.62)); }
    rectk(0, 880, W, 200, K(.85));
    if (rain > 0) for (let i = 0; i < 160 * rain; i++) { const x = (hash(i) * W + t * 200) % W, y = (hash(i + 5) * H + t * 1400 * (.8 + hash(i) * .4)) % H; s.save(); s.translate(x, y); s.rotate(.18); rectk(0, 0, 3, 40, K(.7)); s.restore(); }
  }
  function pole(x, staples = 0) {
    rectk(x - 26, 0, 52, 880, K(.92)); rectk(x - 26, 0, 14, 880, K(.6));
    for (let i = 0; i < staples; i++) { const y = 260 + hash(i) * 420, sx = x - 20 + hash(i + 3) * 40; rectk(sx, y, 10, 3, Pk(.9)); }
  }
  function shotCopier(t, l) {
    const tt = T(t);
    // the copier, open, the flyer sliding out into the tray as the bar sweeps
    fx({ gen: .4, bar: tt < 156.5 ? ((tt - 152.9) % 1.2) / 1.2 : -1 });
    rectk(0, 0, W, H, K(.14));
    rectk(260, 520, 1400, 420, K(.82)); rectk(300, 470, 1320, 60, K(.95)); rectk(1200, 560, 360, 70, K(.35)); for (let i = 0; i < 8; i++) rectk(1230 + i * 40, 580, 24, 30, i % 3 ? K(.9) : Pk());
    const out = ease.out(inv(153.4, 157.6, tt));
    s.save(); s.beginPath(); s.rect(0, 0, W, 560); s.clip(); flyer(760, 560 - out * 380, 560, 720, -.02); s.restore();
    rectk(300, 548, 900, 20, K(.95));
  }
  function shotPole(t, l, phase) {
    const tt = T(t);
    fx({ gen: .45, bar: -1 });
    const rain = smooth(inv(172.3, 173.5, tt));
    street(tt, rain);
    pole(1240, 0);
    // "now all I got is the cheque": the flyer peels off in the rain and under it, stapled to the pole, a cheque
    const peel = ease.in(inv(174.4, 175.9, tt)), CHQ = 176.42;
    if (tt > 174.3) cheque(1240, 470, tt, CHQ);
    if (peel < 1) flyer(1240, 470, 420, 640, .02 + Math.sin(tt * 3) * .01 * rain, peel);
    // the staple-gun hit when it goes up
    if (tt < 159.6) { const k = hit(tt, 158.6, 10); if (k > .05) rectk(1220, 160, 40, 30, K(k)); }
    // the man
    let x, walk = 0, turn = 0;
    if (tt < 159.47) { x = lerp(-200, 820, inv(157.6, 159.47, tt)); walk = 1; }
    else if (tt < 167.53) { x = 820; walk = 0; }
    else { x = lerp(820, -260, inv(167.53, 171.6, tt)); walk = 1; turn = 1; }
    if (tt < 172.0) man(x, 880, 1, walk, tt, turn);
    // the shrug, and question marks over his hat
    if (tt > 160.2 && tt < 167.4) { const q = smooth(inv(160.2, 160.8, tt)); for (let i = 0; i < 3; i++) txt('?', 760 + i * 70, 300 - i * 30 - q * 20, 80 + i * 20, i === 1 ? Pk() : K(), 'Impact', '400', 'center'); }
  }
  function shotPlatform(t, l) {
    const tt = T(t), N0 = 185.03;
    fx({ gen: .55, bar: -1 });
    rectk(0, 0, W, H, K(.2));
    rectk(0, 760, W, 320, K(.85)); rectk(0, 760, W, 14, Pk(.8));
    // the train's back end shrinking into the distance, two tail lights
    const go = ease.in(inv(177.0, 184.0, tt)), sc = 1 - go * .9, cx = 1300 + go * 120, cy = 600 - go * 80;
    rectk(cx - 320 * sc, cy - 380 * sc, 640 * sc, 520 * sc, K(.95)); rectk(cx - 240 * sc, cy - 300 * sc, 180 * sc, 150 * sc, XINK.PAPER); rectk(cx + 60 * sc, cy - 300 * sc, 180 * sc, 150 * sc, XINK.PAPER); rectk(cx - 360 * sc, cy + 130 * sc, 720 * sc, 40 * sc, K(.7)); s.fillStyle = Pk(); s.beginPath(); s.arc(cx - 220 * sc, cy + 60 * sc, 34 * sc + 2, 0, TAU); s.arc(cx + 220 * sc, cy + 60 * sc, 34 * sc + 2, 0, TAU); s.fill();
    // him, with the torn scrap
    man(560, 900, 1.05, 0, tt);
    s.save(); s.translate(640, 520); s.rotate(-.2 + Math.sin(tt * 2) * .04); rectk(0, 0, 160, 120, K(.04)); ransom('EL', 10, 80, 60, 11, 2); s.restore();
    // the name: the scrap fills the frame
    const k = ease.out(inv(N0 - .2, N0 + .5, tt));
    if (k > 0) { s.save(); s.globalAlpha = 1; rectk(0, H * (1 - k), W, H * k, K(.04)); if (k > .6) { ransom('ELLEN', 360, 470, 200, 11, 2); txt('McILWAINE', W / 2, 760, 170, Pk(), 'Impact', '400', 'center'); } s.restore(); }
  }

  chapter('years', 112.0, 187.0, [
    [112.0, shotBoard], [120.6, shotTrain], [146.0, shotSettle], [152.9, shotCopier], [157.6, shotPole], [177.0, shotPlatform],
  ]);
})();
