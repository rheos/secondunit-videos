// 133.0 - 170.0  the clouds' convention, pass 2 (toward Edelmann). Above the ministry, a night sky of
// banded cloud hills. The clouds hold a convention at a long table: a tall chairman with a towering hat
// and a whiplash moustache, delegates each their own odd silhouette. Every "we've got time" is a gavel
// strike or a puff that turns into a hand. The stacks and a plane shove through; the placard goes up
// and turns into a bird; the stamp carries the motion and turns into a cloud. A periscope goes down into
// the ministry and finds the sun filed in a drawer marked SUN; back up top the gavel turns into the sun.
(() => {
  const near = (arr, t) => arr.reduce((b, x) => Math.abs(x - t) < Math.abs(b - t) ? x : b, arr[0]);
  const snap = (t) => { const v = near(FEAT.vonsets, t); return Math.abs(v - t) <= .2 ? v : near(FEAT.beats, t); };
  const T1 = snap(141.06), T2 = snap(144.16), T3 = snap(147.38), T4 = snap(153.24), T5 = snap(165.32);
  const CONV = snap(138.46), SICK = snap(148.1), SUNW = snap(162.88);
  const withOL = (v, fn) => { const o = OL; OL = v; try { fn(); } finally { OL = o; } };
  const LIFT = { STRATUS: 95, ALTUS: 125, NIMBUS: 20, CUMULUS: 10 }, lf = (n) => LIFT[n] || 0;
  const CARD = { CUMULUS: K.BOR, NIMBUS: K.VIO, CIRRUS: K.OLV, STRATUS: K.TEAL, ALTUS: K.MAG, PUFF: K.RED, CHAIR: K.PRU };
  const HILLS = (y0, sp = 1) => [
    { y: y0, r: 240, gap: 340, band: 30, cols: [K.VIO, K.LAV], speed: 6 * sp },
    { y: y0 + 120, r: 210, gap: 310, band: 26, cols: [K.MAG, K.HPK], speed: 12 * sp },
    { y: y0 + 230, r: 190, gap: 290, band: 24, cols: [K.BOR, K.ORA], speed: 20 * sp },
  ];
  function nameCard(x, y, w, h, str) {
    nv(() => polyP([[x - w / 2, y + h / 2], [x - w / 2 + 10, y - h / 2], [x + w / 2 - 10, y - h / 2], [x + w / 2, y + h / 2]]), K.CRM, 5);
    balloon(str, x, y + 2, w * .8, h * .68, { cols: [CARD[str] || K.MAG], inline: K.CRM, swell: .1 });
  }
  // the long table: a cloth with contour bands and a scalloped hem, Art Nouveau whiplash legs
  function table(x0, x1, top, cloth = K.MAG) {
    for (const [lx, d] of [[x0 + 40, -1], [x1 - 40, 1], [(x0 + x1) / 2 - 300, -1], [(x0 + x1) / 2 + 300, 1]]) whip(lx, top + 120, 230, PI / 2 + d * .15, .55, d, 34, K.BOR, 5);
    nv(() => rectP(x0 - 30, top - 16, x1 - x0 + 60, 26, 8), K.BOR);
    const P = () => { s.beginPath(); s.moveTo(x0, top + 10); s.lineTo(x1, top + 10); s.lineTo(x1, top + 150); for (let x = x1; x > x0; x -= 60) s.arc(x - 30, top + 150, 30, 0, PI); s.closePath(); };
    nv(P, cloth);
    withT(() => { P(); s.clip(); for (let k = 0; k < 4; k++) { s.fillStyle = k % 2 ? K.HPK : K.MUS; s.fillRect(x0, top + 88 + k * 16, x1 - x0, 8); } });
  }
  function banner(cx, cy, w, h, u, t) {
    const bw = Math.max(1, w * u);
    if (u <= 0) return;
    for (const sx of [-1, 1]) whip(cx + sx * (bw / 2 + 4), cy + h * .3, h * 1.3, PI / 2 + sx * .3, .7, sx, h * .5, K.VIO, 5);
    nv(() => rectP(cx - bw / 2, cy - h / 2, bw, h, 18), K.PRU);
    withT(() => { s.beginPath(); s.rect(cx - bw / 2, cy - h, bw, h * 2); s.clip(); balloon('CONVENTION OF CLOUDS', cx, cy, w - 90, h * .78, { cols: [K.MUS, K.HPK, K.ORA, K.TUR, K.LIME], t, wob: .02 }); });
  }
  const swing = (t, tH) => kf(t, [[tH - 1.2, .7], [tH - .32, -.3], [tH, 1.9], [tH + .12, 1.55], [tH + .26, 1.9], [tH + 1.4, 1.9], [tH + 2.2, .9]], ease.inOut);
  function gavelAt(hx, hy, a, len, hw, hh) { withT(() => { s.translate(hx, hy); s.rotate(a); s.translate(0, -len); gavel(len, hw, hh); }); }
  function armTo(x0, y0, x1, y1, w = OL) { s.lineWidth = w; s.strokeStyle = K.BLK; s.lineCap = 'round'; s.beginPath(); s.moveTo(x0, y0); s.quadraticCurveTo((x0 + x1) / 2 + 30, Math.max(y0, y1) + 20, x1, y1); s.stroke(); }

  // ---------------------------------------------------------------- 133.00 the rise
  function rise(t, lt) {
    const pan = kf(lt, [[0, 520], [2.4, 0]], ease.inOut);
    night(t, K.NAVY, 1);
    withT(() => { s.translate(0, -pan);
      hills(t, [{ y: 640, r: 230, gap: 330, band: 28, cols: [K.VIO, K.LAV], speed: 8 }]);
      fig('CIRRUS', 330 + lt * 40, 680, .62, { t, look: 1, bounce: 1.4 });
      fig('STRATUS', 1500 - lt * 30, 690, .62, { t, flip: true, bounce: 1.2 });
      fig('PUFF', 900 + lt * 20, 690, .6, { t, bounce: 1.3 });
      [[560, 820, 46, 240], [1330, 820, 46, 200]].forEach(([x, b, w, h], i) => { smoke(x, b - h - 20, t + i * .8, [K.MAG, K.MUS, K.TUR, K.ORA], .9, i ? .2 : -.2); stack(x, b, w, h); });
      clippingMinistry(240, 760, 1440, 800, 41, { cell: 13 });
    });
  }
  // ---------------------------------------------------------------- 135.48 the convention, wide
  function convention(t, lt) {
    const dr = kf(lt, [[0, 1.0], [4.3, 1.05]], ease.sine);
    night(t, K.PRU, 2);
    withT(() => { s.translate(960, 560); s.scale(dr, dr); s.translate(-960, -560);
      hills(t, HILLS(820, .5));
      banner(960, 150, 1300, 150, ease.inOut(inv(136.9, CONV, t)), t);
      const xs = { CUMULUS: 250, NIMBUS: 490, CIRRUS: 720, STRATUS: 1225, ALTUS: 1470, PUFF: 1690 };
      DELS.forEach((n, i) => { const pop = ease.back(inv(135.8 + i * .12, 136.25 + i * .12, t)); if (pop <= 0) return;
        fig(n, xs[n], 860 - lf(n) + (1 - pop) * 300, n === 'STRATUS' ? .62 : .7, { t, look: xs[n] < 960 ? 1 : -1, bounce: .5, flip: n === 'STRATUS' && false }); });
      fig('CHAIR', 960, 860, .72, { t, bounce: .2, lid: .65 });
      table(140, 1780, 800);
      DELS.forEach((n, i) => { if (t > 135.9 + i * .12) nameCard(xs[n], 855, 190, 60, n); });
      nameCard(960, 855, 170, 60, 'CHAIR');
    });
  }
  // ---------------------------------------------------------------- 139.76 gavel, first time (op-art hit 1)
  function gavelOne(t) {
    flat(K.NAVY2);
    hills(t, [{ y: 700, r: 260, gap: 380, band: 32, cols: [K.MAG, K.HPK], speed: 10 }, { y: 830, r: 220, gap: 330, band: 28, cols: [K.BOR, K.ORA], speed: 18 }]);
    const ok = t >= T1 && t < T1 + .7, bx = 1434, by = 905;
    if (ok) withT(() => { const r = 3000 * ease.out(inv(T1, T1 + .3, t)); s.beginPath(); s.arc(bx, by, r, 0, TAU); s.clip(); rings(bx, by, 70, t * 6, [K.MUS, K.BLK, K.HPK, K.BLK]); });
    const k = hit(t, T1, 5);
    withT(() => { s.translate(k * 12 * Math.sin(t * 90), 0);
      if (t >= T1) starburst(bx, by, 120 + k * 50, 280 + k * 140, 12, .2, [K.CRM, K.MUS]);
      fig('CHAIR', 760, 1260, 1.35, { t, bounce: .2, lid: t >= T1 ? .05 : .6, mouth: t >= T1 && k > .15 ? 'open' : undefined, look: 1 });
      withOL(10, () => { nv(() => rectP(-60, 900, 2040, 400), K.BOR); withT(() => { s.fillStyle = K.ORA; for (let y = 940; y < 1100; y += 44) s.fillRect(-60, y, 2040, 16); }); nv(() => rectP(1320, 856, 230, 50, 10), K.MUS); });
      const a = swing(t, T1), hx = 1150, hy = 700;
      withOL(10, () => { armTo(855, 805, hx, hy, 11); gavelAt(hx, hy, a, 300, 210, 116); puffHand(hx, hy, 46, .15, K.WHT, a); });
    });
    fx({ flash: hit(t, T1, 14) * .25 });
  }
  // ---------------------------------------------------------------- 142.82 a puff becomes a hand
  function handUp(t) {
    flat(K.PRU);
    hills(t, [{ y: 820, r: 260, gap: 400, band: 30, cols: [K.OLV, K.LIME], speed: 10 }, { y: 960, r: 220, gap: 340, band: 26, cols: [K.TEAL, K.TUR], speed: 18 }]);
    if (t >= T2) starburst(1010, 520, 150, 330 + hit(t, T2, 4) * 90, 14, t * .2, [K.MUS, K.HPK, K.CRM]);
    fig('NIMBUS', 230, 1040, .65, { t, look2: [1, 0], bounce: .6 });
    const k = ease.inOut(inv(T2 - .8, T2, t));
    fig('CUMULUS', 760, 1090, 1.45, { t, arm: k, mouth: t >= T2 ? 'open' : undefined, look2: [1, -1], bounce: .3 });
  }
  // ---------------------------------------------------------------- 145.90 all hands
  function allHands(t) {
    flat(K.VIO);
    hills(t, [{ y: 520, r: 240, gap: 330, band: 28, cols: [K.PRU, K.NAVY2], speed: 8 }, { y: 640, r: 220, gap: 300, band: 26, cols: [K.TEAL, K.TUR], speed: 14 }]);
    const xs = [190, 500, 790, 1110, 1450, 1740];
    DELS.forEach((n, i) => { const k = ease.inOut(inv(T3 - .55 + i * .05, T3 + i * .05, t));
      fig(n, xs[i], 900 - lf(n), n === 'STRATUS' ? .72 : .82, { t, arm: k, look: -.5, look2: [0, -1], mouth: k > .6 ? 'open' : undefined, bounce: .6 }); });
    table(-40, 1960, 860, K.BOR);
    fx({ flash: hit(t, T3, 14) * .2 });
  }
  // ---------------------------------------------------------------- 147.78 the ministry shoves through
  function shove(t) {
    night(t, K.NAVY, 5);
    hills(t, [{ y: 700, r: 220, gap: 320, band: 26, cols: [K.VIO, K.LAV], speed: 6 }]);
    const up = ease.inOut(inv(147.85, 149.6, t));
    // a stack rises under STRATUS and lifts it, squashed and huffing
    const h1 = 260 + up * 470;
    stack(560, 1080, 70, h1);
    fig('STRATUS', 560, 1080 - h1 - 14, .62, { t, squash: .1 + up * .1, mouth: 'huff', lid: .8, bounce: 0 });
    const h2 = 300 + up * 240; stack(1060, 1080, 60, h2); smoke(1060, 1080 - h2 - 20, t + .7, [K.ORA, K.HPK, K.LIME], .85, .2);
    clippingMinistry(180, 820, 1560, 480, 7, { cell: 12 });
    // the plane noses into PUFF and shoves it along
    const px = kf(t, [[147.78, -400], [150.2, 1500]], (x) => x), nose = px + 200, pfx = Math.max(980, nose + 70);
    fig('PUFF', pfx, 380, .55, { t, mouth: 'open', lid: .1, squash: nose + 70 > 980 ? .12 : 0, bounce: 0 });
    plane(px, 190, .9, t);
    // NIMBUS on the hill raises the placard on "sick"
    const pu = ease.back(inv(SICK - .1, SICK + .5, t)), sc = .72, nx = 1430, ny = 820;
    const hx = nx + (90 + 70) * sc, hy = ny + lerp(-150, -400, ease.back(pu)) * sc;
    if (pu > 0) { withOL(6, () => { nv(() => rectP(hx - 8, hy - 200, 16, 240, 6), K.BOR); sign(hx, hy - 290, 470, 190, ['SICK AND TIRED', 'OF MAKING WAY'], { bg: K.CRM, cols: [K.RED, K.MAG, K.VIO, K.BOR], rot: Math.sin(onTwos(t) * 7) * .03 }); }); }
    fig('NIMBUS', nx, ny, sc, { t, arm: pu, mouth: 'huff', bounce: 0, look2: [-1, -1] });
  }
  // ---------------------------------------------------------------- 150.20 the placard, close; it turns into a bird
  function placard(t) {
    flat(K.PRU);
    hills(t, [{ y: 760, r: 260, gap: 380, band: 30, cols: [K.BOR, K.ORA], speed: 14 }, { y: 900, r: 230, gap: 330, band: 26, cols: [K.OLV, K.LIME], speed: 24 }]);
    const bob = Math.sin(onTwos(t) * 9) * 10, mk = ease.inOut(inv(151.3, 151.8, t)), fly = ease.in(inv(151.6, 152.1, t));
    const sc = 1.05, lh = [520 + 165 * sc, 1180 - 430 * sc + bob], rh = [1400 - 160 * sc, 1180 - 400 * sc - bob];
    withOL(9, () => {
      if (mk < .02) { for (const [x, y] of [lh, rh]) nv(() => rectP(x - 11, 500, 22, y - 480), K.BOR);
        sign(960, 320 + (lh[1] + rh[1]) / 2 - 740, 1280, 400, ['SICK AND TIRED', 'OF MAKING WAY'], { bg: K.CRM, cols: [K.RED, K.BOR, K.MAG, K.VIO, K.TEAL], border: K.MAG, m: .09, r: 30, t, wob: .015 }); }
      else { const bx = lerp(960, 1500, fly), by = lerp(330, -120, fly), size = lerp(205, 120, mk);
        const flap = .5 + .5 * Math.sin(onTwos(t) * 30);
        morph(bx, by, size, RS_.rect(640 / size, 200 / size), (a) => RS_.bird(a, flap) * 1.2, mk, K.CRM, 0, OL);
        if (mk > .8) almond(bx + size * .85, by - size * .25, size * .14, size * .07, 1, .4, K.BLK, 0); }
    });
    fig('CUMULUS', 520, 1180, sc, { t, arm: 1, mouth: mk > .3 ? 'open' : 'huff', look2: [1, -1], bounce: 0 });
    withT(() => { s.translate(0, -bob * 0); fig('NIMBUS', 1400, 1180, sc, { t, arm: 1, flip: true, mouth: mk > .3 ? 'open' : 'huff', look2: [-1, -1], bounce: 0 }); });
  }
  // ---------------------------------------------------------------- 152.10 motion carried; the stamp turns into a cloud
  function carried(t, lt) {
    flat(K.VIO);
    hills(t, [{ y: 900, r: 260, gap: 380, band: 30, cols: [K.PRU, K.NAVY2], speed: 8 }]);
    const dr = kf(lt, [[0, 1.04], [3.8, 1.0]], ease.sine);
    withT(() => { s.translate(960, 540); s.scale(dr, dr); s.rotate(-.04); s.translate(-960, -540);
      withOL(8, () => nv(() => polyP(tornRect(500, 70, 920, 960, 77, 6)), K.CRM));
      withOL(7, () => sign(960, 180, 820, 130, 'CONVENTION OF CLOUDS', { bg: K.PRU, cols: [K.MUS, K.HPK, K.LIME, K.ORA] }));
      for (let i = 0; i < 6; i++) { const y = 320 + i * 100; withOL(5, () => nv(() => ellP(580, y, 20, 20), [K.MAG, K.BOR, K.OLV, K.TEAL, K.VIO, K.RED][i]));
        s.fillStyle = K.G3; s.fillRect(630, y - 9, 480 + hash(i) * 200, 18); }
      halftone(1130, 300, 220, 160, 9, (u, v) => .2 + .6 * Math.abs(Math.sin(u * 5 + v * 2)), K.G3);
    });
    if (t >= T4) withT(() => { const k = hit(t, T4, 6); s.translate(960, 650); s.rotate(-.14); s.scale(1 + k * .1, 1 + k * .1);
      withOL(8, () => { nv(() => rectP(-340, -155, 680, 310, 155), K.RED);
        withT(() => { rectP(-340, -155, 680, 310, 155); s.clip(); for (let r = 1; r < 4; r++) { s.lineWidth = 6; s.strokeStyle = r % 2 ? K.HPK : K.MUS; s.beginPath(); if (s.roundRect) s.roundRect(-340 + r * 14, -155 + r * 14, 680 - r * 28, 310 - r * 28, 155 - r * 14); s.stroke(); } }); });
      balloon('MOTION', 0, -52, 470, 96, { cols: [K.CRM, K.MUS], inline: K.RED, swell: .12 });
      balloon('CARRIED', 0, 56, 500, 96, { cols: [K.MUS, K.CRM], inline: K.RED, swell: .12 }); });
    // the stamp comes down on "time", lifts, and then becomes a cloud and drifts off
    const dy = kf(t, [[T4 - .5, -820], [T4, 0], [T4 + .2, 0], [T4 + .8, -420], [156, -420]], ease.inOut);
    const mk = ease.inOut(inv(154.2, 154.9, t)), drift = ease.inOut(inv(154.8, 155.9, t));
    withOL(8, () => { const sx = 1000 + drift * 520, sy = 520 + dy - drift * 180;
      if (mk < .02) { nv(() => rectP(sx - 180, sy + 80, 360, 70, 16), K.MAG); nv(() => rectP(sx - 45, sy - 120, 90, 210, 30), K.BOR); puffHand(sx, sy - 165, 85, .25, K.WHT, 0); }
      else { if (mk < .6) puffHand(sx, sy - 165 - mk * 300, 85, .25, K.WHT, 0);
        morph(sx, sy + 40, 190, RS_.rect(1, .42), RS_.cloud, mk, mk > .5 ? K.CRM : K.MAG);
        if (mk > .7) withT(() => { almond(sx + 40, sy + 10, 26, 13, 1, .55, K.LAV, 0); almond(sx - 40, sy + 10, 26, 13, 1, .55, K.LAV, 0); }); } });
    fig('CHAIR', 210, 1180, .95, { t, lid: t > T4 ? .3 : .7, mouth: t > T4 ? 'grin' : undefined, bounce: .2 });
    fx({ flash: hit(t, T4, 12) * .25 });
  }
  // ---------------------------------------------------------------- 155.90 the periscope goes down
  function periscope(t, lt) {
    const tilt = kf(lt, [[0, 0], [3.6, -90]], ease.inOut), len = kf(lt, [[0, 260], [1.6, 470], [2.4, 470], [3.4, 610]], ease.inOut);
    night(t, K.NAVY, 9);
    withT(() => { s.translate(0, tilt);
      hills(t, [{ y: 760, r: 180, gap: 280, band: 22, cols: [K.PRU, K.NAVY2], speed: 10 }]);
      [[300, 1260, 34, 320], [1580, 1260, 34, 300]].forEach(([x, b, w, h], i) => { smoke(x, b - h - 10, t + i, [K.MAG, K.MUS, K.TUR], .8, i ? -.2 : .2); stack(x, b, w, h); });
      clippingMinistry(140, 880, 1640, 640, 13, { cell: 13 });
      nv(() => ellP(960, 1012, 90, 22), K.BLK);
      // the pipe, mustard with a red spiral, from the eyepiece down through the roof
      withOL(7, () => { withT(() => { s.beginPath(); s.rect(-100, -500, 2200, 1485); s.clip();
        nv(() => rectP(912, 340, 96, len + 400), K.MUS);
        withT(() => { s.beginPath(); s.rect(912, 340, 96, len + 400); s.clip(); s.fillStyle = K.RED; for (let y = 300 - (lt * 140 % 90); y < 340 + len + 400; y += 90) polyP([[912, y], [1008, y + 45], [1008, y + 80], [912, y + 35]]), s.fill(); }); });
        nv(() => rectP(880, 300, 200, 90, 30), K.MUS); nv(() => ellP(1080, 345, 24, 40), K.TUR); });
      // the cloud bank and the delegates leaning over to watch
      lobes([[120, 330, 150], [380, 360, 170], [640, 320, 130], [1290, 340, 150], [1560, 320, 180], [1830, 350, 150]], K.CRM, { kind: 'hbands', c2: K.LAV, step: 60, off: 30 });
      fig('CIRRUS', 300, 360, .55, { t, look: 1, bounce: .6 });
      fig('ALTUS', 560, 360, .62, { t, look: 1, bounce: .6 });
      fig('PUFF', 1400, 360, .62, { t, look: -1, bounce: .6 });
      fig('NIMBUS', 1680, 360, .62, { t, look2: [-1, 1], bounce: .6 });
      fig('CHAIR', 1170, 380, .62, { t, dir: -1, lid: lt > 2.2 ? .1 : .6, bounce: 0 });
    });
  }
  // ---------------------------------------------------------------- 159.53 through the periscope: SUN (op-art hit 2)
  function drawer(t, lt) {
    flat(K.NAVY);
    const hitOn = t >= SUNW && t < SUNW + .9;
    if (hitOn) checkerTunnel(960, 540, 22, t * 3, -t * .3, K.MAG, K.MUS);
    else { s.lineWidth = 3; s.strokeStyle = K.NAVY2; for (let r = 560; r < 1300; r += 40) { s.beginPath(); s.arc(960, 540, r, 0, TAU); s.stroke(); } }
    const R = 470, sway = Math.sin(lt * .9) * 40, op = ease.back(inv(SUNW - .25, SUNW + .3, t));
    const push = kf(t, [[159.53, 1.0], [SUNW, 1.4], [164.1, 1.5]], ease.inOut);
    withT(() => { s.beginPath(); s.arc(960, 540, R, 0, TAU); s.clip();
      flat(K.CRM);
      withT(() => { s.translate(960 + sway * (1.6 - push), 560); s.rotate(Math.sin(lt * .6) * .03); s.scale(push, push);
        clipping(-700, -560, 1400, 1120, photoCabinets, 5, { cell: 12, paper: K.CRM });
        nv(() => rectP(-130, -82, 260, 164, 8), K.BLK);
        if (op > 0) { sun(0, -70 - op * 70, 80 + op * 30, t, { lid: t > SUNW + 1 ? .2 : .85 }); }
        const sc = 1 + op * .3;
        withT(() => { s.translate(0, op * 60); s.scale(sc, sc);
          nv(() => rectP(-120, -72, 240, 144, 8), K.BOR);
          withT(() => { rectP(-120, -72, 240, 144, 8); s.clip(); s.fillStyle = K.ORA; for (let k = 0; k < 4; k++) s.fillRect(-140, -40 + k * 30, 300, 12); });
          nv(() => rectP(-76, -58, 152, 58, 6), K.CRM, 5);
          balloon('SUN', 0, -29, 124, 46, { cols: [K.BOR, K.RED, K.MAG], swell: .1 });
          nv(() => rectP(-36, 24, 72, 18, 9), K.BLK, 4); });
      });
      s.lineWidth = 4; s.strokeStyle = K.BLK; s.beginPath(); s.moveTo(960 - R, 540); s.lineTo(960 - 140, 540); s.moveTo(960 + 140, 540); s.lineTo(960 + R, 540); s.moveTo(960, 540 - R); s.lineTo(960, 540 - 150); s.moveTo(960, 540 + 160); s.lineTo(960, 540 + R); s.stroke();
    });
    s.lineWidth = 36; s.strokeStyle = K.BLK; s.beginPath(); s.arc(960, 540, R + 15, 0, TAU); s.stroke();
    s.lineWidth = 14; s.strokeStyle = K.MUS; s.beginPath(); s.arc(960, 540, R + 40, 0, TAU); s.stroke();
    fx({ flash: hit(t, SUNW, 10) * .2 });
  }
  // ---------------------------------------------------------------- 164.10 the gavel becomes the sun
  function gavelSun(t) {
    night(t, K.NAVY2, 11);
    hills(t, HILLS(700, .6));
    const m = ease.inOut(inv(T5 - .75, T5, t)), lift = ease.inOut(inv(T5 + .3, 166.9, t));
    if (t >= T5) starburst(lerp(1010, 1180, lift), lerp(340, 240, lift), 160, 360 + hit(t, T5, 3) * 120, 16, t * .15, [K.MUS, K.HPK]);
    fig('CHAIR', 820, 1230, 1.25, { t, lid: m > .5 ? .05 : .6, mouth: m > .5 ? 'open' : undefined, bounce: 0, look: 1 });
    const hx = 1010, hy = 600, gx = hx + Math.sin(.1) * 230, gy = hy - Math.cos(.1) * 230;
    withOL(10, () => {
      armTo(907, 817, hx, hy, 11);
      withT(() => { s.translate(hx, hy); s.rotate(.1); nv(() => rectP(-11, -230 + 50 * m, 22, 230 - 50 * m), K.BOR); });
      const x = lerp(gx, 1180, lift), y = lerp(gy, 240, lift), size = lerp(78, 120, m);
      if (m < 1) morph(x, y, size, RS_.rect(108 / 78, 58 / 78), RS_.circle, m, m > .5 ? K.MUS : K.MAG, .1 * (1 - m));
      else sun(x, y, size, t, { lid: t > T5 + .6 ? .15 : .8 });
      puffHand(hx, hy, 46, .15, K.WHT, .1);
    });
    fx({ flash: hit(t, T5, 9) * .25 });
  }
  // ---------------------------------------------------------------- 166.90 the whole convention, sun overhead
  function finale(t, lt) {
    const pull = kf(lt, [[0, 1.1], [3.1, 1.0]], ease.out);
    night(t, K.NAVY2, 12);
    withT(() => { s.translate(960, 540); s.scale(pull, pull); s.translate(-960, -540);
      withOL(8, () => sun(1180, 240, 120, t, { lid: .15 }));
      hills(t, HILLS(820, .5));
      const xs = { CUMULUS: 250, NIMBUS: 490, CIRRUS: 720, STRATUS: 1225, ALTUS: 1470, PUFF: 1690 };
      DELS.forEach((n, i) => fig(n, xs[n], 860 - lf(n), n === 'STRATUS' ? .62 : .7, { t, arm: .85 + .15 * Math.sin(onTwos(t) * 6 + i), look: -1, look2: [0, -1], mouth: 'open', bounce: 1 }));
      fig('CHAIR', 960, 860, .72, { t, lid: .1, mouth: 'grin', bounce: .6, dir: 1 });
      table(140, 1780, 800, K.TEAL);
      DELS.forEach((n) => nameCard(xs[n], 855, 190, 60, n));
      nameCard(960, 855, 170, 60, 'CHAIR');
    });
  }

  chapter('clouds', 133.0, 170.0, [
    [133.0, rise], [135.48, convention], [139.76, gavelOne], [142.82, handUp], [145.90, allHands], [147.78, shove],
    [150.20, placard], [152.10, carried], [155.90, periscope], [159.53, drawer], [164.10, gavelSun], [166.90, finale],
  ]);
})();
