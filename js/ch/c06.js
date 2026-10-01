// c06 · BRIDGE 1 (SEC.b1 - SEC.c3). The clock tower: the face shines, the hands run away, the band's
// instruments fall into a hole in the street, and a small rowboat rows up past the clock into the stars.
// Opens on c05's last framing (tower at q 1, face at (540, 520) r 330, cam zoom 2.0); hands off to c07's
// starry sky with the boat among the stars.
(() => {
  const STEEL = '#a7aea4';
  function at(x, y, k, rot, fn) { for (const g of [s, f]) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); } fn(); s.restore(); f.restore(); }
  const sky = (y0, y1) => { s.fillStyle = vgrad(y0, y1, [[0, C.night], [.75, '#29355a'], [1, C.dusk]]); s.fillRect(-W * 2, -H * 2, W * 5, H * 5); };

  // ---- the clock tower (copied verbatim from c05; keep the two in step) ----
  // local coords: base at (0, 0), clock centre (0, -2600), face r 330
  function handsAt(t) { const a = clamp(t - 115.94, 0, 4.52), m = -Math.PI / 2 - .5 + .05 * (t - 108) + .6 * a * a * a; return [m, -Math.PI / 2 + 2.25 + (m + Math.PI / 2 + .5) / 8]; }
  function clockHand(g, x, y, ang, len, w, tipR, fillC, lineC, lw) {
    const d = [Math.cos(ang), Math.sin(ang)], n = [-d[1], d[0]], q = (a, b) => [x + d[0] * a + n[0] * b, y + d[1] * a + n[1] * b];
    shape(g, [q(-len * .18, -w * .5), q(len * .55, -w * .42), q(len * .78, -w * .9), q(len, 0), q(len * .78, w * .9), q(len * .55, w * .42), q(-len * .18, w * .5)], fillC, lineC, lw);
    shape(g, circle(...q(len * .66, 0), tipR, 24), lineC ? C.gold : fillC, lineC, lw * .8);
  }
  function clockFace(x, y, R, t, lit) {
    const q = R / 330, [mA, hA] = handsAt(t);
    shape(s, circle(x, y, R), C.parch, C.umber, 20 * q);
    shape(s, circle(x, y, R * .9), C.gold, C.umber, 12 * q);
    for (let i = 0; i < 12; i++) { // the zodiac band: twelve tiled cells, each with a four-petal star (no glyphs)
      const a0 = (i - .5) / 12 * TAU - Math.PI / 2, a1 = a0 + TAU / 12, pts = [];
      for (let j = 0; j <= 6; j++) { const a = lerp(a0, a1, j / 6); pts.push([x + Math.cos(a) * R * .88, y + Math.sin(a) * R * .88]); }
      for (let j = 6; j >= 0; j--) { const a = lerp(a0, a1, j / 6); pts.push([x + Math.cos(a) * R * .7, y + Math.sin(a) * R * .7]); }
      shape(s, pts, i % 2 ? C.sage : C.rose, C.umber, 9 * q);
      const am = (a0 + a1) / 2, mx = x + Math.cos(am) * R * .79, my = y + Math.sin(am) * R * .79;
      for (let j = 0; j < 4; j++) petal(s, mx, my, am + j * Math.PI / 2, 40 * q, 15 * q, C.cream, C.umber, 6 * q);
    }
    shape(s, circle(x, y, R * .7), C.cream, C.umber, 14 * q);
    shape(s, circle(x, y, R * .36), null, C.sage, 14 * q);
    for (let i = 0; i < 12; i++) { const a = (i + .5) / 12 * TAU - Math.PI / 2; petal(s, x + Math.cos(a) * R * .36, y + Math.sin(a) * R * .36, a + 1.2, 44 * q, 13 * q, C.sage, C.umber, 6 * q); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - Math.PI / 2; petal(s, x + Math.cos(a) * R * .56, y + Math.sin(a) * R * .56, a, 50 * q, 14 * q, C.gold, C.umber, 7 * q); }
    if (lit > 0) { glowAt(x, y, R * 1.25, `rgba(255,205,140,${.4 * lit})`); glowAt(x, y, R * .75, `rgba(255,240,200,${.55 * lit})`); }
    clockHand(s, x, y, hA, R * .42, 46 * q, 26 * q, C.plum, C.umber, 12 * q);
    clockHand(s, x, y, mA, R * .64, 34 * q, 20 * q, C.plum, C.umber, 12 * q);
    if (lit > 0) { clockHand(f, x, y, hA, R * .42, 46 * q, 26 * q, '#000', null); clockHand(f, x, y, mA, R * .64, 34 * q, 20 * q, '#000', null); }
    shape(s, circle(x, y, 30 * q, 24), C.gold, C.umber, 10 * q);
  }
  function tower(t, lit) {
    const cy = -2600;
    vine(s, cub([-300, 0], [-480, cy + 1500], [-260, cy + 900], [-440, cy + 470]), 64, 30, C.olive);
    vine(s, cub([300, 0], [480, cy + 1500], [260, cy + 900], [440, cy + 470]), 64, 30, C.olive);
    shape(s, [[-300, 0], [-300, cy + 470], [300, cy + 470], [300, 0]], C.parch, C.umber, 20);
    for (const sx of [-1, 1]) { shape(s, [[sx * 300, 0], [sx * 300, cy + 470], [sx * 210, cy + 470], [sx * 210, 0]], C.ochre, C.umber, 14); }
    shape(s, [[-210, cy + 560], [210, cy + 560], [210, cy + 640], [-210, cy + 640]], C.rose, C.umber, 12);
    for (let i = 0; i < 6; i++) shape(s, [[-200 + i * 70, cy + 570], [-150 + i * 70, cy + 570], [-150 + i * 70, cy + 630], [-200 + i * 70, cy + 630]], i % 2 ? C.sage : C.gold, C.umber, 6);
    shape(s, circle(0, cy + 2100, 120, 40), lit > .05 ? C.amber : C.dusk, C.umber, 16);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; line([[0, cy + 2100], [Math.cos(a) * 120, cy + 2100 + Math.sin(a) * 120]], C.umber, 10); }
    glowAt(0, cy + 2100, 200, `rgba(255,170,90,${.3 * lit + .05})`);
    shape(s, [[-60, cy + 1700], [-60, cy + 860], ...circle(0, cy + 860, 60, 24).filter(([, py]) => py <= cy + 860).sort((a, b) => a[0] - b[0]), [60, cy + 860], [60, cy + 1700]], lit > .05 ? C.amber : C.night, C.umber, 16);
    glowAt(0, cy + 1300, 240, `rgba(255,170,90,${.3 * lit + .05})`);
    shape(s, [[-480, cy + 480], [480, cy + 480], [450, cy + 420], [-450, cy + 420]], C.ochre, C.umber, 16);
    shape(s, [[-430, cy + 420], [-430, cy - 360], [-360, cy - 430], [360, cy - 430], [430, cy - 360], [430, cy + 420]], C.teal, C.umber, 20);
    for (const sx of [-1, 1]) vine(s, whip([sx * 400, cy + 380], [sx * 330, cy + 200], [sx * 420, cy - 100], [sx * 360, cy - 330], .6, -sx, 30), 20, 8, C.gold);
    clockFace(0, cy, 330, t, lit);
    shape(s, [[-470, cy - 430], [470, cy - 430], [440, cy - 490], [-440, cy - 490]], C.ochre, C.umber, 16);
    const dome = [...cub([-380, cy - 490], [-470, cy - 700], [-120, cy - 820], [0, cy - 1120], 24), ...cub([0, cy - 1120], [120, cy - 820], [470, cy - 700], [380, cy - 490], 24)];
    shape(s, dome, C.sage, C.umber, 20);
    for (const k of [-.6, -.2, .2, .6]) vine(s, cub([k * 380, cy - 490], [k * 470, cy - 700], [k * 140, cy - 850], [0, cy - 1110], 20), 14, 8, C.olive, 1, null);
    for (const sx of [-1, 1]) shape(s, [...cub([sx * 470, cy - 490], [sx * 520, cy - 600], [sx * 440, cy - 640], [sx * 450, cy - 720], 10), ...cub([sx * 450, cy - 720], [sx * 400, cy - 640], [sx * 380, cy - 560], [sx * 380, cy - 490], 10)], C.gold, C.umber, 12);
    line([[0, cy - 1110], [0, cy - 1300]], C.umber, 26); line([[0, cy - 1110], [0, cy - 1300]], C.gold, 12);
    lily(s, 0, cy - 1300, -Math.PI / 2, 120, .7, [C.gold, C.cream]);
  }

  // ---- shared scene: the tower against the rainy sky, exactly as c05 leaves it ----
  const stars0 = (t) => { for (let i = 0; i < 20; i++) glowAt(hash(i + 400) * 1080, hash(i + 500) * 900 - 100, 8, `rgba(255,250,230,${.4 * (.5 + .5 * Math.sin(t * 2 + i))})`); };
  function towerScene(t, lit) {
    sky(-200, 1700); stars0(t);
    at(540, 3120, 1, 0, () => tower(t, lit));
    shape(s, [[-300, 2400], [-300, 1560], [60, 1560], [100, 1420], [140, 1420], [180, 1560], [400, 1600], [420, 1500], [470, 1500], [490, 1620], [740, 1620], [780, 1480], [900, 1480], [940, 1580], [1400, 1580], [1400, 2400]], '#2c2840', C.umber, 18);
    for (const [x, y] of [[230, 1700], [620, 1760], [1000, 1700]]) { shape(s, [[x - 40, y + 80], [x - 40, y], [x + 40, y], [x + 40, y + 80]], C.amber, C.umber, 12); glowAt(x, y + 40, 120, 'rgba(255,180,100,.4)'); }
  }
  // light rays out of the face (light layer only)
  function rays(x, y, n, rot, len, a, w = .09) {
    if (a <= 0) return;
    f.save(); f.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const th = rot + i / n * TAU, ww = w * (.7 + .6 * hash(i + 41));
      const gr = f.createRadialGradient(x, y, 0, x, y, len); gr.addColorStop(0, `rgba(255,225,160,${a})`); gr.addColorStop(.35, `rgba(255,205,130,${a * .45})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      f.fillStyle = gr; f.beginPath(); f.moveTo(x, y); f.lineTo(x + Math.cos(th - ww) * len, y + Math.sin(th - ww) * len); f.lineTo(x + Math.cos(th + ww) * len, y + Math.sin(th + ww) * len); f.closePath(); f.fill(); }
    f.restore();
  }
  const shineLit = (t) => clamp(inv(111.8, 112.05, t) * (.55 + .25 * hit(t, 111.82, 2)) + .35 * hit(t, 113.0, 2.5) + .1 * F('voc', t), 0, 1);
  // the hands' angular speed (matches handsAt): for the light trails
  const omega = (t) => { const a = clamp(t - 115.94, 0, 4.52); return .05 + 1.8 * a * a * (t < 120.46 ? 1 : 0); };
  function trails(t, x, y, R) { // ghost hands on the light layer as they spin up
    const w = omega(t); if (w < 2) return;
    const [mA, hA] = handsAt(t), k = clamp((w - 2) / 20);
    f.save(); f.globalCompositeOperation = 'lighter';
    for (const [A, L, wd, sp] of [[mA, .64, 30, 1], [hA, .42, 40, 1 / 8]]) for (let j = 1; j <= 8; j++) {
      const a = A - j * w * sp * .012; f.strokeStyle = `rgba(255,220,160,${(.22 * k + .06) * (1 - j / 9)})`; f.lineWidth = wd * R / 330; f.lineCap = 'round';
      f.beginPath(); f.moveTo(x, y); f.lineTo(x + Math.cos(a) * R * L, y + Math.sin(a) * R * L); f.stroke(); }
    if (w > 12) { f.strokeStyle = `rgba(255,225,170,${.35 * clamp((w - 12) / 20)})`; f.lineWidth = R * .2; f.beginPath(); f.arc(x, y, R * .52, 0, TAU); f.stroke(); }
    f.restore();
  }

  // keep the hands dark against their own light; fades as they blur into a wheel
  function maskHands(t, x, y, R) {
    const a = 1 - clamp((omega(t) - 6) / 14); if (a <= 0) return;
    const [mA, hA] = handsAt(t), q = R / 330; f.save(); f.globalAlpha = a;
    clockHand(f, x, y, hA, R * .42, 46 * q, 26 * q, '#000', null); clockHand(f, x, y, mA, R * .64, 34 * q, 20 * q, '#000', null); f.restore();
  }
  // ---- shots ----
  // 111.8: the clock face fills the frame (c05's last framing); it lights up and shines, rays turning
  function shine(t, lt, dur) {
    const L = shineLit(t);
    cam(540, kf(lt, [[0, 520], [dur, 560]]), kf(lt, [[0, 2.0], [dur, 1.62]], ease.out));
    towerScene(t, L);
    rays(540, 520, 14, t * .25, 1300, .22 * L);
    glowAt(540, 520, 420, `rgba(255,235,190,${.25 * hit(t, 111.82, 3) + .22 * hit(t, 113.0, 3)})`);
    maskHands(t, 540, 520, 330);
    rain(t, 50, 71, .22 + .2 * L);
    border(t, 1);
  }
  // 113.63: wide on the tower top: the beams sweep the rain and the sky, pulsing with the voice
  function beams(t, lt, dur) {
    const L = .75 + .15 * F('voc', t) + .15 * beatPulse(t, 5);
    cam(540, kf(lt, [[0, 760], [dur, 640]]), kf(lt, [[0, .78], [dur, .9]]));
    towerScene(t, L);
    rays(540, 520, 10, t * .5 + .3, 2400, .22 * L, .06);
    rays(540, 520, 6, -t * .3, 1700, .14 * L, .12);
    maskHands(t, 540, 520, 330);
    rain(t, 110, 73, .45);
    border(t, 1);
  }
  // 115.94: close on the face: the hands start to run, faster and faster
  function spin(t, lt, dur) {
    cam(540, 520, kf(lt, [[0, 1.85], [dur, 2.4]], ease.in) + beatPulse(t, 9) * .02, Math.sin(lt * 3) * .01);
    towerScene(t, .7);
    rays(540, 520, 14, t * .25, 1300, .14);
    trails(t, 540, 520, 330); maskHands(t, 540, 520, 330);
    rain(t, 40, 75, .25);
    border(t, 1);
  }
  // 118.27: tighter, the camera turning with them: the hands blur into a wheel of light
  function blur(t, lt, dur) {
    const u = lt / dur;
    cam(540, 520, lerp(2.5, 3.6, ease.in(u)), .5 * u * u);
    towerScene(t, .6 + .3 * u);
    rays(540, 520, 14, t * .25 + u * 2, 1300, .12 + .15 * u);
    trails(t, 540, 520, 330); maskHands(t, 540, 520, 330);
    f.save(); f.globalAlpha = clamp((lt - dur + .12) / .12) * .7; f.fillStyle = '#ffe6c0'; f.fillRect(-W * 2, -H * 2, W * 5, H * 5); f.restore();
    border(t, 1);
  }

  // ---- straight down from the tower ledge: the band's instruments tumble into a hole in the street ----
  const VPX = 540, VPY = 1150, DH = 3000, kD = (d) => 600 / (600 + d);
  const PS = (px, pz, d) => { const k = kD(d); return [VPX + px * k, VPY + pz * k]; };
  function drum(sc) {
    shape(s, circle(0, 0, 190), C.ruby, C.umber, 18);
    s.lineJoin = 'round'; line([...Array(25)].map((_, i) => { const a = i / 24 * TAU, r = i % 2 ? 158 : 184; return [Math.cos(a) * r, Math.sin(a) * r]; }), C.gold, 12);
    shape(s, circle(0, 0, 150), C.cream, C.umber, 16);
    lily(s, 0, 30, -Math.PI / 2, 90, .8, [C.rose, C.blush]);
  }
  function tambourine() {
    shape(s, circle(0, 0, 110), C.ochre, C.umber, 16);
    shape(s, circle(0, 0, 80), C.parch, C.umber, 12);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; shape(s, circle(Math.cos(a) * 96, Math.sin(a) * 96, 20, 12), C.gold, C.umber, 8); }
    vine(s, whip([90, 60], [160, 140], [120, 220], [200, 260], .5, 1, 20), 18, 8, C.rose);
  }
  function tuba(t) {
    vine(s, [...Array(30)].map((_, i) => { const a = i / 29 * TAU * .9 + 1; return [60 + Math.cos(a) * 110, 40 + Math.sin(a) * 110]; }), 40, 40, C.gold);
    shape(s, circle(0, 0, 150), C.gold, C.umber, 18);
    shape(s, circle(0, 0, 112), C.ochre, C.umber, 12);
    shape(s, circle(0, 0, 62), '#3a2a18', C.umber, 10);
    for (let i = 0; i < 3; i++) shape(s, circle(130 + i * 36, 150, 18, 12), C.parch, C.umber, 8);
  }
  const FALL = [ // [draw, release, start plan x, start plan z, spin]
    [drum, 120.87, -200, -740, 1.6], [tambourine, 121.34, 220, -730, -3.2], [tuba, 121.87, 20, -800, 2.2],
  ];
  const landAt = (tr) => tr + Math.sqrt(2 * (DH + 40) / 2563);
  function fall(t, lt, dur) {
    cam(540, 880, 1 + lt * .035, Math.sin(t * .7) * .02);
    s.fillStyle = '#232a40'; s.fillRect(-W * 2, -H * 2, W * 5, H * 5);
    // the street far below: lamp glows, the dark round hole
    for (const [px, pz] of [[-900, 300], [900, 300], [-900, 1500], [900, 1500], [-300, 2300], [300, 2300]]) { const [x, y] = PS(px, pz, DH); glowAt(x, y, 60, 'rgba(255,130,70,.5)'); }
    const [hx, hy] = PS(0, 700, DH), hr = 420 * kD(DH);
    let gulp = 0; for (const [, tr] of FALL) gulp += hit(t, landAt(tr), 3);
    shape(s, circle(hx, hy, hr + 10), '#0b0d16', C.gold, 10);
    glowAt(hx, hy, hr * (2 + 2 * gulp), `rgba(255,200,130,${.5 * clamp(gulp)})`);
    // the rooftops round the square, seen from above: walls drop from the roofs to the street
    const BLD = [];
    for (let j = 0; j < 3; j++) { BLD.push([-2600, -700, -700 + j * 1300, 600 + j * 1300, j]); BLD.push([700, 2600, -700 + j * 1300, 600 + j * 1300, j + 3]); }
    BLD.push([-700, 700, 2300, 3600, 6]);
    for (const [x0, x1, z0, z1, id] of BLD) {
      const DR = 380 + 420 * hash(id + 7), wc = [C.plum, C.teal, '#4a3a5a', C.teal, C.plum, '#4a3a5a', C.plum][id], rc = [C.glass, C.rose, C.dusk, C.rose, C.glass, C.sage, C.dusk][id], faces = [];
      if (x1 < 0) faces.push([[x1, z0], [x1, z1]]); if (x0 > 0) faces.push([[x0, z0], [x0, z1]]); if (z0 > 0 && x0 < 0 && x1 > 0) faces.push([[x0, z0], [x1, z0]]);
      for (const [[ax, az], [bx, bz]] of faces) {
        shape(s, [PS(ax, az, DR), PS(bx, bz, DR), PS(bx, bz, DH), PS(ax, az, DH)], wc, C.umber, 12);
        for (let i = 1; i < 5; i++) for (let j = 1; j < 7; j++) { const u = i / 5, v = Math.pow(j / 7, .6), d = lerp(DR, DH, v), [wx, wy] = PS(lerp(ax, bx, u), lerp(az, bz, u), d), k = kD(d);
          const on = hash(i * 7 + j * 13 + id * 31) < .55; s.fillStyle = on ? C.amber : C.night; s.fillRect(wx - 60 * k, wy - 70 * k, 120 * k, 140 * k); if (on) glowAt(wx, wy, 200 * k, 'rgba(255,180,100,.4)'); }
      }
      shape(s, [PS(x0, z0, DR), PS(x1, z0, DR), PS(x1, z1, DR), PS(x0, z1, DR)], rc, C.umber, 14);
      const mx = (x0 + x1) / 2; line([PS(mx, z0, DR), PS(mx, z1, DR)], C.umber, 10);
      for (let c = 0; c < 2; c++) { const cx = lerp(x0, x1, .3 + .4 * c), cz = lerp(z0, z1, .3 + .4 * hash(id * 5 + c)), d2 = DR - 220;
        shape(s, [PS(cx - 90, cz - 90, d2), PS(cx + 90, cz - 90, d2), PS(cx + 90, cz + 90, d2), PS(cx - 90, cz + 90, d2)], C.ochre, C.umber, 10);
        const [sx, sy] = PS(cx, cz, d2); dot(sx, sy, 30 * kD(d2), C.umber); }
    }
    // the tower's own face dropping away below the ledge
    shape(s, [PS(-470, -700, 0), PS(470, -700, 0), PS(300, -700, DH), PS(-300, -700, DH)], '#b9a27a', C.umber, 18);
    for (const d of [300, 700, 1200, 1900]) line([PS(-470 + 170 * d / DH, -700, d), PS(470 - 170 * d / DH, -700, d)], C.ochre, 14 * kD(d) + 4);
    for (const d of [450, 1000]) { const n = 6; for (let i = 0; i < n; i++) { const xa = lerp(-300, 300, i / n), xb = lerp(-300, 300, (i + 1) / n); shape(s, [PS(xa, -700, d), PS(xb, -700, d), PS(xb, -700, d + 160), PS(xa, -700, d + 160)], i % 2 ? C.rose : C.sage, C.umber, 8); } }
    for (const sx of [-1, 1]) vine(s, [...Array(14)].map((_, i) => { const d = i / 13 * DH * .8; return PS(sx * (470 - 140 * d / DH) + sx * 50 * Math.sin(i * .9), -700, d); }), 30, 6, C.olive);
    // the ledge we look down from, with its iron rail
    shape(s, [[-400, -400], [1480, -400], [1480, 450], [-400, 450]], C.ochre, C.umber, 20);
    shape(s, [[-400, 395], [1480, 395], [1480, 460], [-400, 460]], C.parch, C.umber, 16);
    for (let i = 0; i < 8; i++) vine(s, whip([-60 + i * 170, 385], [-10 + i * 170, 300], [60 + i * 170, 340], [40 + i * 170, 260], .6, i % 2 ? 1 : -1, 20), 18, 8, C.olive);
    // the instruments: rock on the ledge, tip over the edge, tumble down into the hole
    const items = FALL.map(([fn, tr, px, pz, spn], i) => {
      const tip = ease.in(inv(tr - .4, tr, t)), ft = Math.max(0, t - tr), d = -40 + 2563 / 2 * ft * ft;
      if (d >= DH) return null;
      const u = ease.inOut(clamp((d + 40) / (DH + 40))), z0 = lerp(pz, -660, tip);
      const [x, y] = PS(lerp(px, 0, u), lerp(z0, 700, u), d), k = kD(d);
      const rot = spn * ft * 2 + Math.sin(t * 4 + i) * .06 * (1 - tip) + tip * .3 * Math.sign(spn);
      return [d, x, y, k, rot, fn];
    }).filter(Boolean).sort((a, b) => b[0] - a[0]);
    for (const [, x, y, k, rot, fn] of items) at(x, y, k * .9, rot, () => fn(t));
    border(t, 1);
  }

  // ---- the small rowboat rows up past the lit clock into the sky ----
  function boat(t, x, y, sc) {
    const i = lastBeat(t), b0 = FEAT.beats[i] ?? t, b1 = FEAT.beats[i + 1] ?? b0 + .5, p = clamp((t - b0) / (b1 - b0));
    const pull = p < .4, th = pull ? lerp(.4, 2.75, ease.inOut(p / .4)) : lerp(2.75, .4, ease.inOut((p - .4) / .6)), depth = pull ? 1 : .25;
    at(x, y, sc, Math.sin(t * 1.7) * .05 - .05 * (pull ? Math.sin(p / .4 * Math.PI) : 0), () => {
      const oar = (px, py, th, fill) => { const L = 380, ex = px + Math.cos(th) * L, ey = py + Math.sin(th) * L * depth, hx = px - Math.cos(th) * 110, hy = py - Math.sin(th) * 110 * depth;
        line([[hx, hy], [ex, ey]], C.umber, 26); line([[hx, hy], [ex, ey]], fill, 12);
        petal(s, ex - Math.cos(Math.atan2(ey - py, ex - px)) * 40, ey - Math.sin(Math.atan2(ey - py, ex - px)) * 40, Math.atan2(ey - py, ex - px), 140, 44, fill, C.umber, 12);
        return [ex + Math.cos(Math.atan2(ey - py, ex - px)) * 70, ey + Math.sin(Math.atan2(ey - py, ex - px)) * 70]; };
      const hullP = [[-290, -96], ...cub([-290, -96], [-100, -70], [120, -70], [320, -150], 20), ...cub([320, -150], [280, 60], [60, 140], [-180, 130], 24), [-260, 110]];
      shape(f, hullP, '#000', null); // the hull blocks the clock's light behind it
      oar(70, -100, th + .25, '#8a6a3a'); // far oar, behind the hull
      // the lantern on its iron crook at the bow
      vine(s, cub([250, -120], [270, -260], [350, -300], [380, -240], 16), 14, 10, C.olive);
      shape(s, blobPts(382, -200, 28, 42, 8, .03, 20), C.ruby, C.umber, 10);
      glowAt(382, -200, 220, 'rgba(255,150,70,.55)'); glowAt(382, -200, 55, 'rgba(255,235,190,.9)');
      shape(s, [[-200, -96], [-170, -150], [-150, -150], [-150, -96]], '#7a5426', C.umber, 10);
      const hull = [[-290, -96], ...cub([-290, -96], [-100, -70], [120, -70], [320, -150], 20), ...cub([320, -150], [280, 60], [60, 140], [-180, 130], 24), [-260, 110]];
      shape(s, hull, C.ochre, C.umber, 20);
      line(cub([-284, -50], [-100, -20], [140, -20], [300, -100], 16), C.ruby, 22);
      line(cub([-270, 20], [-80, 50], [140, 40], [280, -30], 16), '#7a5426', 12);
      line(cub([-262, 80], [-60, 105], [120, 95], [240, 40], 16), '#7a5426', 12);
      const tip = oar(-10, -92, th, C.parch);
      if (pull) for (let j = 0; j < 7; j++) { const a = (p / .4) * 1.6 + j * .4; glowAt(tip[0] - j * 26 * Math.cos(a), tip[1] + j * 14, 34 - j * 3, `rgba(220,235,255,${.8 * (1 - j / 7)})`); }
    });
  }
  function boatY(t) {
    let y = 1550 - 90 * (t - 123.74);
    for (let i = lastBeat(123.74) + 1; i < FEAT.beats.length && FEAT.beats[i] <= t; i++) y -= 300 * ease.out(clamp((t - FEAT.beats[i]) / .45));
    return y;
  }
  const boatX = (t) => 330 + 70 * Math.sin((t - 123.74) * .8);
  function skyClimb(t, cy, zoom) {
    const hi = inv(1000, -1600, cy);
    s.fillStyle = vgrad(-3000, 1700, [[0, '#121a2e'], [.55, C.night], [.85, '#29355a'], [1, C.dusk]]); s.fillRect(-W * 3, -H * 4, W * 7, H * 8);
    // stars, more of them the higher we climb
    for (let i = 0; i < 140; i++) { const x = hash(i * 3 + 1) * 2600 - 760, y = 900 - hash(i * 3 + 2) * 3800, tw = .5 + .5 * Math.sin(t * (1.5 + hash(i) * 3) + i);
      const a = clamp(inv(900, -400, y) + hi * .6) * tw; if (a <= .02) continue;
      glowAt(x, y, 10 + 16 * hash(i + 9), `rgba(255,248,225,${.8 * a})`);
      if (i % 9 === 0) for (let j = 0; j < 4; j++) petal(s, x, y, j * Math.PI / 2 + .3, 26, 8, C.cream, C.umber, 5); }
    at(700, 3120, 1, 0, () => tower(t, 1));
    rays(700, 520, 12, t * .25, 1500, .12 * (1 - hi));
    shape(s, [[-600, 2600], [-600, 1560], [60, 1560], [100, 1420], [140, 1420], [180, 1560], [1600, 1580], [1600, 2600]], '#2c2840', C.umber, 18);
  }
  // 123.74: the boat rises from below, oars pulling on the beat, past the shining face
  function rowboat(t, lt, dur) {
    const cy = 1100 - 520 * lt;
    cam(470, cy, 1.0);
    skyClimb(t, cy, 1);
    boat(t, boatX(t), boatY(t), 1.2);
    rain(t, 40, 77, .22 * (1 - inv(124.5, 125.9, t)));
    border(t, 1);
  }
  // 125.97: up and away over the dome into the stars
  function stars(t, lt, dur) {
    const cy = -60 - 560 * lt, z = lerp(1.0, .74, ease.inOut(lt / dur));
    cam(lerp(470, 500, lt / dur), cy, z);
    skyClimb(t, cy, z);
    boat(t, boatX(t), boatY(t), 1.2);
    border(t, 1);
  }

  chapter('c06', SEC.b1, SEC.c3, [
    [SEC.b1, shine],
    [113.63, beams],
    [115.94, spin],
    [118.27, blur],
    [120.46, fall],
    [123.74, rowboat],
    [125.97, stars],
  ], { fx: PAINT });
})();
