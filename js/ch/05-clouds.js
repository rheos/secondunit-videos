// 133.0 - 170.0  the clouds' convention, in the pop-psychedelic manner. Above the grey ministry the
// clouds hold a convention at a long table in the sky: a chairman with a gavel, delegates with name cards.
// Every "we've got time" is a gavel strike or a raised cloud-hand. The stacks and planes shove through;
// a placard goes up; the motion is carried. A periscope goes down into the ministry and finds the sun
// filed in a drawer marked SUN; back up top the chairman's gavel turns into the sun.
(() => {
  // snap a sung moment to the nearest vocal onset (within .2 s), else the nearest beat
  const near = (arr, t) => arr.reduce((b, x) => Math.abs(x - t) < Math.abs(b - t) ? x : b, arr[0]);
  const snap = (t) => { const v = near(FEAT.vonsets, t); return Math.abs(v - t) <= .2 ? v : near(FEAT.beats, t); };
  const T1 = snap(141.06), T2 = snap(144.16), T3 = snap(147.38), T4 = snap(153.24), T5 = snap(165.32);
  const CONV = snap(138.46), SICK = snap(148.1), SUNW = snap(162.88);

  // the delegates: one flat colour + one pattern + one hat each
  const DEL = [
    { name: 'CUMULUS', col: K.LIME, pat: 'check', pcol: K.TUR, hat: 'bowler', hcol: K.VIO, hcol2: K.LEM, seed: 11 },
    { name: 'NIMBUS', col: K.TUR, pat: 'dots', pcol: K.LEM, hat: 'fez', hcol: K.RED, hcol2: K.LEM, seed: 23, eye: 'dot' },
    { name: 'CIRRUS', col: K.WHT, pat: 'zig', pcol: K.ORA, hat: 'flower', hcol: K.MAG, hcol2: K.LEM, seed: 37 },
    { name: 'STRATUS', col: K.ORA, pat: 'hoops', pcol: K.LEM, hat: 'boater', hcol: K.LEM, hcol2: K.RED, seed: 41, monocle: true },
    { name: 'ALTUS', col: K.LEM, pat: 'rings', pcol: K.MAG, hat: 'top', hcol: K.TUR, hcol2: K.VIO, seed: 53, eye: 'dot' },
    { name: 'PUFF', col: K.PINK, pat: 'swirl', pcol: K.VIO, hat: 'bowler', hcol: K.LIME, hcol2: K.MAG, seed: 67 },
  ];
  const CHAIR = { col: K.VIO, pat: 'stripes', pcol: K.PLUM, hat: 'top', hcol: K.LEM, hcol2: K.MAG, seed: 5, monocle: true, tache: true, cheek: K.PINK };

  function nameCard(x, y, w, h, str, col) {
    inked(() => { s.beginPath(); s.moveTo(x - w / 2, y + h / 2); s.lineTo(x - w / 2 + 10, y - h / 2); s.lineTo(x + w / 2 - 10, y - h / 2); s.lineTo(x + w / 2, y + h / 2); s.closePath(); }, K.WHT, 5);
    balloon(str, x, y + 2, w * .82, h * .66, { cols: [col, col], inline: K.WHT, swell: .12 });
  }
  // the long table in the sky, front view: cloth with a scalloped hem, floating on a rainbow
  function table(x0, x1, top, t, cloth = K.MAG, hem = K.TUR) {
    const h = 150;
    inked(() => rectP(x0 - 30, top - 18, x1 - x0 + 60, 28, 8), K.ORA);
    inked(() => { s.beginPath(); s.moveTo(x0, top + 10); s.lineTo(x1, top + 10); s.lineTo(x1, top + h);
      for (let x = x1; x > x0; x -= 60) s.arc(x - 30, top + h, 30, 0, Math.PI); s.closePath(); }, cloth);
    withT(() => { s.beginPath(); s.rect(x0, top + 40, x1 - x0, 40); s.clip(); s.fillStyle = hem; for (let x = x0; x < x1; x += 50) { s.beginPath(); s.moveTo(x, top + 80); s.lineTo(x + 25, top + 40); s.lineTo(x + 50, top + 80); s.fill(); } });
  }
  function gavelAt(hx, hy, a, len, hw, hh, sq = 1) {
    withT(() => { s.translate(hx, hy); s.rotate(a); s.translate(0, -len); s.scale(1, sq); gavel(len, hw, hh); });
  }
  // gavel swing angle around a strike at tH: rest, wind up, slam, bounce, settle
  const swing = (t, tH) => kf(t, [[tH - 1.2, .7], [tH - .32, -.3], [tH, 1.9], [tH + .12, 1.55], [tH + .26, 1.9], [tH + 1.4, 1.9], [tH + 2.2, .9]], ease.inOut);

  // ---------------------------------------------------------------- 133.00 the rise
  function rise(t, lt) {
    const pan = kf(lt, [[0, 520], [2.4, 0]], ease.inOut);
    rays(960, -200, 24, t * .12, [K.ORA, K.LEM]);
    withT(() => { s.translate(0, -pan);
      rainbow(960, 1500, 1250, 70, [K.RED, K.ORA, K.LEM, K.LIME, K.TUR, K.VIO], Math.PI, TAU);
      [[520, 1250, 40, 330], [1380, 1250, 40, 300]].forEach(([x, b, w, h], i) => { smoke(x, b - h, t + i * .7, [K.MAG, K.TUR, K.VIO], .8, (i - .5) * .3); stack(x, b, w, h); });
      ministry(960, 1290, 2100, 260, { seed: 9 });
      DEL.slice(0, 4).forEach((d, i) => { const x = [260, 690, 1230, 1660][i] + Math.sin(t * .7 + i) * 18, y = [330, 230, 260, 360][i];
        delegate(x, y + 120, 105, { ...d, t, legs: true, look: [i < 2 ? 1 : -1, .3] }); });
    });
  }
  // ---------------------------------------------------------------- 135.48 the convention, wide
  function convention(t, lt) {
    const dr = kf(lt, [[0, 1.0], [4.3, 1.06]], ease.sine);
    rays(960, 120, 32, t * .06, [K.LEM, '#ffd000']);
    withT(() => { s.translate(960, 560); s.scale(dr, dr); s.translate(-960, -560);
      rainbow(960, 1320, 900, 46, [K.RED, K.ORA, K.LEM, K.LIME, K.TUR, K.VIO, K.MAG], Math.PI, TAU, 0);
      // the banner unfurls on "clouds", the text slams on "convention"
      const u = ease.out(inv(137.3, 138.1, t)), bw = 1240 * u, bk = hit(t, CONV, 7);
      if (u > 0) withT(() => { s.translate(960, 140); s.scale(1 + .06 * bk, 1 + .06 * bk);
        for (const sx of [-1, 1]) { curl(sx * (bw / 2 + 30), 30, 70, 1.2, sx > 0 ? -Math.PI / 2 : -Math.PI / 2, K.VIO, 30, sx); }
        inked(() => rectP(-bw / 2, -75, bw, 150, 30), K.VIO);
        if (t >= CONV - .1 && u > .99) balloon('CONVENTION OF CLOUDS', 0, 0, bw - 90, 112, { cols: [K.LEM, K.PINK, K.ORA, K.TUR, K.LIME], inline: K.WHT, t, wob: .03 }); });
      const xs = [250, 470, 690, 1230, 1450, 1670];
      DEL.forEach((d, i) => { const pop = ease.back(inv(135.8 + i * .12, 136.2 + i * .12, t)); if (pop <= 0) return;
        delegate(xs[i], 690 + (1 - pop) * 120, 95, { ...d, t, look: [i < 3 ? 1 : -1, 0] }); });
      delegate(960, 560, 135, { ...CHAIR, t, bounce: .03, look: [0, .2] });
      inked(() => rectP(870, 640, 180, 130, 10), K.LEM);
      withT(() => { rectP(870, 640, 180, 130, 10); s.clip(); s.fillStyle = K.ORA; for (let x = 870; x < 1050; x += 36) s.fillRect(x, 640, 18, 130); });
      inked(() => rectP(870, 640, 180, 130, 10), 'rgba(0,0,0,0)');
      table(150, 1770, 770, t);
      DEL.forEach((d, i) => { if (t > 135.9 + i * .12) nameCard(xs[i], 805, 190, 62, d.name, [K.VIO, K.MAG, K.ORA, K.RED, K.TEAL, K.PLUM][i]); });
      nameCard(960, 805, 190, 62, 'CHAIR', K.RED);
    });
  }
  // ---------------------------------------------------------------- 139.76 gavel, first time
  function gavelOne(t) {
    const after = t >= T1, cols = after ? [K.TUR, K.LEM, K.LIME, K.WHT] : [K.MAG, K.ORA, K.PINK, K.LEM];
    rings(960, 460, 90, t * 1.1, cols);
    const k = hit(t, T1, 5);
    withT(() => { const sh = k * 14 * Math.sin(t * 90); s.translate(sh, 0);
      if (after) starburst(1500, 880, 150 + k * 60, 330 + k * 160, 14, .2, [K.WHT, K.LEM, K.RED]);
      delegate(820, 560, 330, { ...CHAIR, t, bounce: .02, look: [1, .4], shut: k * .8, mouth: after && k > .2 ? 'o' : 'smile', open: k });
      inked(() => rectP(-50, 880, 2020, 400), K.ORA); s.fillStyle = K.RED; for (let x = -50; x < 1980; x += 120) s.fillRect(x, 905, 60, 400);
      inked(() => rectP(1400, 830, 210, 64, 10), K.MAG);
      const a = swing(t, T1), hx = 1180, hy = 640;
      s.lineWidth = OL * 1.2; s.strokeStyle = K.BLK; s.lineCap = 'round'; s.beginPath(); s.moveTo(1080, 600); s.quadraticCurveTo(1140, 680, hx, hy); s.stroke();
      gavelAt(hx, hy, a, 330, 210, 120, 1 - k * .2);
      cloudHand(hx, hy, 52, .25, K.WHT, a * .6);
    });
    fx({ flash: hit(t, T1, 14) * .35 });
  }
  // ---------------------------------------------------------------- 142.82 a cloud becomes a hand
  function handUp(t) {
    const after = t >= T2;
    flat(after ? K.LEM : K.MAG);
    const dx = Math.sin(t * .4) * 120;
    moire([700 + dx, 520], [760 - dx, 600 + dx * .3], 22, after ? K.VIO : K.LEM, 7);
    if (after) starburst(1340, 230, 120, 300 + hit(t, T2, 4) * 80, 12, t * .3, [K.ORA, K.WHT, K.MAG]);
    const k = ease.back(inv(T2 - .75, T2, t));
    delegate(820, 620, 300, { ...DEL[0], t, look: [1, -1], arm: k, mouth: after ? 'grin' : 'o', bounce: .03 });
    // the other delegates waiting, small, left edge, on twos
    delegate(170, 900, 110, { ...DEL[3], t, look: [1, -.5] });
  }
  // ---------------------------------------------------------------- 145.90 all hands
  function allHands(t) {
    const after = t >= T3;
    stripes(-.5, 150, t * .8, after ? [K.TUR, K.LIME] : [K.ORA, K.RED]);
    rainbow(960, 1200, 760, 40, [K.WHT, K.LEM, K.MAG, K.VIO], Math.PI, TAU);
    DEL.forEach((d, i) => { const x = 180 + i * 312, k = ease.back(inv(T3 - .55 + i * .05, T3 + i * .05, t));
      delegate(x, 700, 135, { ...d, t, arm: k, look: [0, -1], mouth: k > .5 ? 'grin' : 'smile', bounce: .05 }); });
    table(-40, 1960, 860, t, K.VIO, K.LEM);
    fx({ flash: hit(t, T3, 14) * .25 });
  }
  // ---------------------------------------------------------------- 147.78 the ministry shoves through
  function shove(t, lt) {
    flat(K.SKY);
    rings(960, -600, 160, t * .25, [K.SKY, '#4fb0ff']);
    const up = ease.out(inv(147.78, 149.2, t)), push = ease.inOut(inv(148.0, 149.6, t));
    // clouds squeezed aside by the stacks
    delegate(380 - push * 160, 470, 150, { ...DEL[1], t, mouth: 'huff', look: [1, 0], squash: push * .12 });
    delegate(1560 + push * 160, 430, 150, { ...DEL[4], t, mouth: 'huff', look: [-1, 0], squash: push * .12, flip: true });
    [[760, 300], [1160, 260]].forEach(([x, h], i) => { const hh = h + up * 380; smoke(x, 1080 - hh - 10, t + i * .6, [K.MAG, K.LEM, K.ORA, K.VIO], 1.25, i ? .25 : -.25); stack(x, 1080, 70, hh); });
    ministry(960, 1120, 2200, 150, { seed: 4 });
    const px = kf(t, [[147.78, -500], [150.2, 2300]], (x) => x);
    plane(px, 200, 1.1, t);
    // a delegate sent tumbling by the plane
    const tum = inv(148.6, 149.6, t);
    if (tum > 0) delegate(1250 + tum * 200, 140 - tum * 30, 85, { ...DEL[5], t, mouth: 'o', open: 1, look: [-1, 0], hatR: -.6 - tum * 2, hatX: 60 + tum * 60 });
    else delegate(1220, 170, 85, { ...DEL[5], t, look: [-1, 0] });
    // the placard goes up on "sick"
    const pu = ease.back(inv(SICK - .1, SICK + .45, t));
    if (pu > 0) withT(() => { s.translate(960, 1180 - pu * 520);
      sign(0, -120, 560, 220, ['SICK AND TIRED', 'OF MAKING WAY'], { bg: K.LEM, cols: [K.RED, K.MAG, K.VIO], inline: K.WHT, pole: 300, rot: Math.sin(onTwos(t) * 7) * .04, border: K.RED });
      delegate(0, 250, 120, { ...DEL[3], t, mouth: 'huff', look: [0, -1] }); });
  }
  // ---------------------------------------------------------------- 150.20 the placard, close
  function placard(t) {
    checkerTunnel(960, 470, 16, t * 1.2, t * .25, K.MAG, K.LEM);
    const b = Math.sin(onTwos(t) * 9) * .03;
    delegate(470, 860, 220, { ...DEL[3], t, mouth: 'huff', look: [1, -.6], bounce: .08 });
    delegate(1450, 870, 220, { ...DEL[1], t, mouth: 'huff', look: [-1, -.6], bounce: .08, flip: true });
    sign(960, 380, 1300, 520, ['SICK AND TIRED', 'OF MAKING WAY'], { bg: K.WHT, cols: [K.RED, K.ORA, K.MAG, K.VIO, K.TUR], inline: K.LEM, rot: b, border: K.TUR, m: .09, r: 40, t, wob: .02 });
  }
  // ---------------------------------------------------------------- 152.10 motion carried
  function carried(t, lt) {
    rays(960, 540, 20, -t * .1, [K.VIO, K.PLUM]);
    const dr = kf(lt, [[0, 1.04], [3.8, 1.0]], ease.sine);
    withT(() => { s.translate(960, 540); s.scale(dr, dr); s.rotate(-.04); s.translate(-960, -540);
      // the agenda sheet
      inked(() => rectP(470, 70, 980, 960, 14), K.CRM, OL);
      sign(960, 175, 860, 130, 'CONVENTION OF CLOUDS', { bg: K.TUR, cols: [K.LEM, K.WHT, K.PINK], inline: K.VIO, r: 20 });
      for (let i = 0; i < 6; i++) { const y = 320 + i * 100; inked(() => ellP(560, y, 22, 22), [K.MAG, K.ORA, K.LIME, K.TUR, K.VIO, K.RED][i], 5);
        s.fillStyle = K.G3; s.fillRect(610, y - 10, 520 + hash(i) * 200, 20); }
    });
    // the stamp: a cloud hand brings it down on "time"
    const down = kf(t, [[T4 - .5, -800], [T4, 0], [T4 + .18, 0], [T4 + .75, -900]], ease.inOut), k = hit(t, T4, 6);
    if (t >= T4) withT(() => { s.translate(960, 640); s.rotate(-.14); s.scale(1 + k * .12, 1 + k * .12);
      starburst(0, 0, 330, 420, 18, 0, [K.LEM]);
      inked(() => rectP(-330, -150, 660, 300, 150), K.RED, OL);
      s.lineWidth = 8; s.strokeStyle = K.WHT; s.beginPath(); if (s.roundRect) s.roundRect(-300, -122, 600, 244, 122); s.stroke();
      balloon('MOTION', 0, -50, 430, 92, { cols: [K.WHT, K.LEM], inline: K.RED, swell: .15 });
      balloon('CARRIED', 0, 55, 470, 92, { cols: [K.LEM, K.WHT], inline: K.RED, swell: .15 }); });
    withT(() => { s.translate(1010, 470 + down); inked(() => rectP(-180, 100, 360, 70, 16), K.ORA); inked(() => rectP(-50, -120, 100, 230, 30), K.MAG); cloudHand(0, -170, 110, .3, K.WHT, 0); });
    // the chairman, peeking in from the left with the gavel
    withT(() => { delegate(170, 950, 250, { ...CHAIR, t, look: [1, -.3], mouth: t > T4 ? 'grin' : 'smile' }); gavelAt(380, 830, swing(t, T4) - .5, 230, 150, 86); });
    fx({ flash: hit(t, T4, 12) * .3 });
  }
  // ---------------------------------------------------------------- 155.90 the periscope goes down
  function periscope(t, lt) {
    const tilt = kf(lt, [[0, 0], [3.4, -420]], ease.inOut);
    withT(() => { s.translate(0, tilt);
      flat(K.LIME); rings(960, 200, 120, t * .4, [K.LIME, '#b6ec2a']);
      for (let i = 0; i < 7; i++) { const fx0 = 140 + i * 280 + Math.sin(t * .5 + i) * 30, fy = 640 + (i % 3) * 170 + Math.cos(t * .4 + i) * 20;
        if (Math.abs(fx0 - 960) < 160) continue; starburst(fx0, fy, 28, 62, 8, t * (i % 2 ? .4 : -.4), [[K.MAG, K.ORA, K.VIO, K.TUR][i % 4], K.LEM]); }
      // the ministry roof below
      s.fillStyle = K.G2; s.fillRect(-100, 1180, 2200, 900);
      ministry(960, 1260, 2200, 90, { seed: 12 });
      s.fillStyle = K.G4; s.fillRect(-100, 1240, 2200, 60);
      // a hole in the roof, the periscope sliding into it
      const len = kf(lt, [[0, 200], [3.0, 1150]], ease.inOut);
      withT(() => { s.beginPath(); s.rect(-100, -900, 2200, 2150); s.clip();
        inked(() => rectP(905, 380, 110, len, 10), K.LEM, OL);
        withT(() => { s.beginPath(); s.rect(905, 380, 110, len); s.clip(); s.fillStyle = K.RED; for (let y = 380 - 400 + (lt * 120 % 80); y < 380 + len; y += 80) { s.beginPath(); s.moveTo(905, y); s.lineTo(1015, y + 40); s.lineTo(1015, y + 75); s.lineTo(905, y + 35); s.fill(); } });
        inked(() => rectP(880, 330, 200, 100, 30), K.LEM, OL); inked(() => ellP(1080, 380, 26, 46), K.TUR, OL);
      });
      s.fillStyle = K.BLK; s.fillRect(880, 1236, 160, 18);
      // the delegates leaning over the cloud edge to watch
      blobs([[260, 420, 160], [520, 470, 180], [800, 430, 120], [1300, 450, 160], [1600, 420, 190], [1850, 460, 140]], K.WHT, OL);
      [[330, 0], [620, 2], [1400, 4], [1690, 5]].forEach(([x, di], i) => delegate(x, 310, 110, { ...DEL[di], t, look: [x < 960 ? 1 : -1, 1], bounce: .04 }));
      delegate(800, 260, 140, { ...CHAIR, t, look: [1, 1], bounce: .02 });
    });
  }
  // ---------------------------------------------------------------- 159.53 through the periscope: SUN
  function drawer(t, lt) {
    checkerTunnel(960, 540, 24, t * .9, -t * .08, K.TUR, K.VIO);
    const R = 470, sway = Math.sin(lt * .9) * 40, op = ease.back(inv(SUNW - .25, SUNW + .25, t));
    withT(() => { s.beginPath(); s.arc(960, 540, R, 0, TAU); s.clip();
      flat(K.G1);
      halftone(480, 60, 960, 960, 16, (u, v) => .25 + .5 * v + .25 * Math.sin(u * 7 + v * 3), K.G2);
      const push = kf(t, [[159.53, 1.0], [SUNW, 1.45], [164.1, 1.55]], ease.inOut);
      withT(() => { s.translate(960 + sway * (1.6 - push), 560); s.rotate(Math.sin(lt * .6) * .03); s.scale(push, push);
        // a wall of filing cabinets, the SUN drawer in the middle
        for (let cx = -3; cx <= 3; cx++) for (let cy = -2; cy <= 2; cy++) { const x = cx * 250, y = cy * 150; if (cx === 0 && cy === 0) continue;
          inked(() => rectP(x - 115, y - 65, 230, 130, 8), K.G2, 5); inked(() => rectP(x - 40, y - 46, 80, 30, 4), K.CRM, 4); inked(() => rectP(x - 30, y + 18, 60, 14, 7), K.G4, 3); }
        inked(() => rectP(-125, -75, 250, 150, 10), K.G4, 6);
        if (op > 0) { withT(() => { s.globalAlpha = 1; rays(0, 0, 16, lt * .4, [K.LEM, K.ORA], 150 + op * 230); }); }
        // the drawer front slides out (scales up toward us) as it opens
        const sc = 1 + op * .35, dy = op * 60;
        if (op > 0) sun(0, -60 - op * 60, 95 + op * 30, t, { shut: t > SUNW + .9 ? 0 : 1 });
        withT(() => { s.translate(0, dy); s.scale(sc, sc);
          inked(() => rectP(-115, -65, 230, 130, 8), K.G1, 6);
          inked(() => rectP(-70, -50, 140, 52, 6), K.WHT, 5);
          balloon('SUN', 0, -24, 112, 38, { cols: [K.ORA, K.RED, K.ORA], inline: K.LEM, swell: .15 });
          inked(() => rectP(-36, 22, 72, 18, 9), K.BLK, 3); });
      });
      // crosshair
      s.lineWidth = 4; s.strokeStyle = K.BLK; s.beginPath(); s.moveTo(960 - R, 540); s.lineTo(960 + R, 540); s.moveTo(960, 540 - R); s.lineTo(960, 540 + R); s.stroke();
      for (let i = -4; i <= 4; i++) { if (!i) continue; s.beginPath(); s.moveTo(960 + i * 90, 528); s.lineTo(960 + i * 90, 552); s.moveTo(948, 540 + i * 90); s.lineTo(972, 540 + i * 90); s.stroke(); }
    });
    s.lineWidth = 34; s.strokeStyle = K.BLK; s.beginPath(); s.arc(960, 540, R + 14, 0, TAU); s.stroke();
    s.lineWidth = 12; s.strokeStyle = K.LEM; s.beginPath(); s.arc(960, 540, R + 38, 0, TAU); s.stroke();
    fx({ flash: hit(t, SUNW, 10) * .2 });
  }
  // ---------------------------------------------------------------- 164.10 the gavel becomes the sun
  function gavelSun(t, lt) {
    const m = ease.inOut(inv(T5 - .7, T5 + .1, t)), lift = ease.out(inv(T5 - .9, T5 + 1.2, t));
    rays(960, 360, 28, t * .15, m > .5 ? [K.ORA, K.LEM] : [K.MAG, K.PINK]);
    if (m > .5) rainbow(960, 1150, 980, 52, [K.RED, K.ORA, K.LEM, K.LIME, K.TUR, K.SKY, K.VIO], Math.PI, TAU);
    delegate(960, 840, 260, { ...CHAIR, t, look: [.6, -1], mouth: m > .5 ? 'grin' : 'o', bounce: 0 });
    s.lineWidth = OL; s.strokeStyle = K.BLK; s.lineCap = 'round'; s.beginPath(); s.moveTo(960 + 260 * .72, 853); s.quadraticCurveTo(960 + 260 * 1.07, 700, 960 + 260 * .97, 840 - 260 * 1.15 + 20); s.stroke();
    // the gavel, held high, then its head rounds itself into the sun and floats up
    const hx = 960 + 260 * .97, hy = 840 - 260 * 1.15, ga = .15, len = 200;
    const gx = hx + Math.sin(ga) * len, gy = hy - Math.cos(ga) * len;
    const x = lerp(gx, 1180, lift), y = lerp(gy, 270, lift);
    if (m < 1) withT(() => { s.translate(hx, hy); s.rotate(ga); const L = len * (1 - m); if (L > 2) inked(() => rectP(-12, -L, 24, L, 8), K.MAG); });
    const r = lerp(60, 150, m), w = lerp(210, r * 2, m), h = lerp(110, r * 2, m);
    if (m > .02) withT(() => { s.translate(x, y); s.scale(m, m); starburst(0, 0, 150, 330 + hit(t, T5, 3) * 120, 16, t * .2, [K.WHT, K.LEM]); });
    if (m >= .99) sun(x, y, 150, t, { shut: t > T5 + .5 ? 0 : 1 });
    else withT(() => { s.translate(x, y); s.rotate(ga * (1 - m)); inked(() => rectP(-w / 2, -h / 2, w, h, lerp(28, r, m)), m > .5 ? K.LEM : K.ORA);
      if (m < .4) { const bw = w * .14; inked(() => rectP(-w / 2, -h * .16, bw, h * .32), K.LEM, OL * .6); inked(() => rectP(w / 2 - bw, -h * .16, bw, h * .32), K.LEM, OL * .6); } });
    cloudHand(hx, hy, 46, .25, K.WHT, 0);
    fx({ flash: hit(t, T5, 9) * .3 });
  }
  // ---------------------------------------------------------------- 166.90 the whole convention, sun overhead
  function finale(t, lt) {
    const pull = kf(lt, [[0, 1.12], [3.1, 1.0]], ease.out);
    rings(960, 260, 110, t * .5, [K.LEM, K.ORA, K.MAG, K.VIO, K.TUR, K.LIME]);
    withT(() => { s.translate(960, 540); s.scale(pull, pull); s.translate(-960, -540);
      sun(960, 250, 140, t, { shut: 0 });
      rainbow(960, 1300, 860, 44, [K.WHT, K.LEM, K.PINK], Math.PI, TAU);
      const xs = [210, 450, 690, 1230, 1470, 1710];
      DEL.forEach((d, i) => delegate(xs[i], 700, 105, { ...d, t, arm: .85 + .15 * Math.sin(onTwos(t) * 6 + i), look: [i < 3 ? 1 : -1, -1], mouth: 'grin', bounce: .08 }));
      delegate(960, 610, 140, { ...CHAIR, t, look: [0, -1], mouth: 'grin', bounce: .05 });
      table(110, 1810, 790, t, K.TUR, K.MAG);
      DEL.forEach((d, i) => nameCard(xs[i], 820, 160, 50, d.name, [K.VIO, K.MAG, K.ORA, K.RED, K.TEAL, K.PLUM][i]));
      nameCard(960, 820, 170, 52, 'CHAIR', K.RED);
    });
  }

  chapter('clouds', 133.0, 170.0, [
    [133.0, rise],
    [135.48, convention],
    [139.76, gavelOne],
    [142.82, handUp],
    [145.90, allHands],
    [147.78, shove],
    [150.20, placard],
    [152.10, carried],
    [155.90, periscope],
    [159.53, drawer],
    [164.10, gavelSun],
    [166.90, finale],
  ]);
})();
