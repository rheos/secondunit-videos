// js/ch/c7.js · MORNING (135.0 - 145.68)
// The outro. A hard cut in from the subway take: the bedroom before dawn, sheep asleep
// everywhere. The music thins to a few last hits (135.1 to 138.0), then one long held chord
// swells in at 139.07 and holds until it cuts to silence at ~144.85. The dawn rides that chord:
// navy, then rose, then gold. The last sheep awake pulls the lamp chain on the cut, closes its
// lids, and the room fades to warm light, then black.
(() => {
  const CHORD = 139.07, CUT = 144.85;
  const WX = 1180, WY = 170, WW = 440, WH = 420;

  // ---- colour helpers ----
  const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const rgb = (a, al = 1) => `rgba(${a.map((v) => v | 0).join(',')},${al})`;
  const ck = (d, stops, al = 1) => rgb(kf(d, stops.map(([k, c]) => [k, hx(c)]), (x) => x), al);

  // how far the dawn has come, 0 navy .. 1 full gold; it rides the held chord
  const dawnAt = (t) => kf(t, [[135, 0], [CHORD, .07], [141, .4], [142.6, .68], [CUT, .9], [145.68, 1]], (x) => x);

  // ---- the window at dawn, painted over bedroom()'s night window ----
  function windowDawn(t, d) {
    const top = ck(d, [[0, '#0b1540'], [.4, '#3c2f6c'], [.7, '#c47a82'], [1, '#f3b67c']]);
    const low = ck(d, [[0, '#2c2f6a'], [.35, '#9a5a80'], [.65, '#f19a78'], [1, '#ffe2a2']]);
    s.save(); s.beginPath(); s.rect(WX, WY, WW, WH); s.clip();
    s.fillStyle = vgrad(s, WY, WY + WH, [[0, top], [1, low]]); s.fillRect(WX, WY, WW, WH);
    // the moon setting, gone by the rose
    if (d < .3) { const my = WY + 110 + d * 160, a = 1 - d / .3; s.save(); s.globalAlpha = a; dot(s, WX + 320, my, 46, P.cream); dot(s, WX + 337, my - 6, 42, top); s.restore(); }
    // the sun, climbing out from behind the far hills
    const sk = smooth(inv(.3, .9, d)), sy = lerp(WY + WH + 40, WY + WH - 175, sk), sr = 58;
    if (d > .28) { dot(s, WX + 175, sy, sr, ck(d, [[.3, '#ffb27a'], [1, '#fff3d2']])); }
    ridge(s, WY + WH - 62, 50, .004, 3, ck(d, [[0, '#141a40'], [.5, '#3a2544'], [1, '#6a3c46']]), WX, WX + WW, WY + WH);
    ridge(s, WY + WH - 22, 26, .007, 5, ck(d, [[0, '#10142e'], [.5, '#2a1a34'], [1, '#4a2a38']]), WX, WX + WW, WY + WH);
    s.restore();
    if (d > .28) {
      const a = smooth(inv(.28, .6, d));
      glow(WX + 175, sy, 240, `rgba(255,190,120,${.22 * a})`);
      glow(WX + 175, sy, 70, `rgba(255,235,200,${.45 * a})`);
    }
    glow(WX + WW / 2, WY + WH * .8, 420, `rgba(255,150,120,${.2 * smooth(inv(.1, .6, d))})`);
    // frame and mullions, then the sill
    s.strokeStyle = '#080a1c'; s.lineWidth = 22; s.strokeRect(WX, WY, WW, WH);
    s.lineWidth = 10; s.beginPath(); s.moveTo(WX + WW / 2, WY); s.lineTo(WX + WW / 2, WY + WH); s.moveTo(WX, WY + WH / 2); s.lineTo(WX + WW, WY + WH / 2); s.stroke();
    s.fillStyle = '#231928'; s.fillRect(WX - 40, WY + WH - 4, WW + 80, 24);
  }

  // warm light pouring through the window over the whole room (s), plus its bloom (f)
  function roomWarm(d, k = 1) {
    if (d < .02) return;
    s.save(); s.globalCompositeOperation = 'screen';
    s.globalAlpha = clamp(d * .9 * k);
    s.fillStyle = rgrad(s, WX + WW / 2, WY + WH * .6, 40, 1900, [[0, '#ffcf92'], [.25, '#c9756a'], [.6, '#4a2638'], [1, '#000000']]);
    s.fillRect(-60, -60, W + 120, H + 120);
    // the shaft of sun across the bed and floor
    s.globalAlpha = clamp(d * .55 * k);
    poly(s, [[WX, WY + WH], [WX + WW, WY + WH], [WX + WW - 300, H + 60], [WX - 700, H + 60]], ck(d, [[0, '#5a3a70'], [.5, '#c46c62'], [1, '#ffb070']]));
    s.restore();
    glow(WX + WW / 2, WY + WH / 2, 900, `rgba(255,170,110,${.16 * d * k})`);
  }

  function dresser() {
    s.fillStyle = '#2a1f30'; s.fillRect(1680, 640, 240, 190);
    s.fillStyle = '#342638'; s.fillRect(1668, 628, 264, 16);
    for (const y of [700, 765]) { stroke(s, [[1690, y], [1920, y]], '#1a1320', 6); dot(s, 1800, y - 30, 7, '#a88b62'); }
  }

  // the lamp's pull chain; pull = px the bead is tugged down
  const CHAIN_X = 300, CHAIN_Y0 = 546, CHAIN_Y1 = 606;
  function chain(pull, lamp) {
    stroke(s, [[CHAIN_X, CHAIN_Y0], [CHAIN_X, CHAIN_Y1 + pull]], '#8a7250', 3);
    dot(s, CHAIN_X, CHAIN_Y1 + pull + 5, 6.5, '#c9a66a');
    if (lamp > 0) dot(f, CHAIN_X - 1.5, CHAIN_Y1 + pull + 3.5, 2.2, `rgba(255,230,180,${.7 * lamp})`);
  }

  // ---- sleeping sheep: a loaf, belly on the ground (legs clipped away), lids shut, breathing ----
  const breath = (t, seed) => .5 + .5 * Math.sin((t - B0) / BEAT * Math.PI + hash(seed * 13) * 1.2);
  function napper(t, x, y, sc, dir, seed, o = {}) {
    const { sil = false, snore = 0 } = o;
    const b = breath(t, seed) + snore;
    const pose = { dir, seed, lids: 1, sil, bob: .47 * sc - b * .045 * sc };
    s.save(); s.beginPath(); s.rect(x - 3 * sc, y - 3 * sc, 6 * sc, 3 * sc + 1); s.clip();
    const r = sheep(t, x, y, sc, pose); s.restore();
    if (sil) occlude(() => { f.save(); f.beginPath(); f.rect(x - 3 * sc, y - 3 * sc, 6 * sc, 3 * sc + 1); f.clip(); sheep(t, x, y, sc, { ...pose, black: true, g: f }); f.restore(); });
    return r;
  }
  // [x, ground y, sc, dir, seed]
  const FLOOR = [[520, 1012, 62, 1, 5], [770, 965, 72, 1, 1], [1010, 1005, 82, -1, 2], [1285, 955, 66, 1, 3], [1560, 995, 80, -1, 4], [1830, 945, 60, -1, 6]];
  const BED = [[870, 650, 62, 1, 7], [1085, 654, 72, -1, 8], [1215, 657, 54, 1, 9], [1080, 588, 46, 1, 10]];
  const SILL = [[1345, 586, 44, 1, 12], [1545, 586, 48, -1, 13]];
  const PERCH = [[1795, 628, 54, -1, 14], [498, 470, 30, 1, 15]];
  function nappers(t, o = {}) {
    const { silSill = false, snoreSill = 0 } = o;
    for (const [x, y, sc, dir, sd] of PERCH) napper(t, x, y, sc, dir, sd);
    for (const [x, y, sc, dir, sd] of BED) napper(t, x, y, sc, dir, sd);
    SILL.forEach(([x, y, sc, dir, sd], i) => napper(t, x, y, sc, dir, sd, { sil: silSill, snore: i === 1 ? snoreSill : 0 }));
    for (const [x, y, sc, dir, sd] of FLOOR) napper(t, x, y, sc, dir, sd);
  }

  // ---- the last sheep awake, sitting on the nightstand left of the lamp ----
  const LX = 214, LY = 650, LSC = 54;
  function lastSheep(t, { lids = .55, look = [0, 0], reach = 0, pull = 0, lamp = 1 } = {}) {
    const r = sheep(t, LX, LY, LSC, { dir: 1, seed: 16, sit: .8, lids, look, bob: -bob(t) * 1.5 });
    chain(pull, lamp);
    if (reach > 0) {
      // the near foreleg lifts from the chest up to the bead
      const sh = [r.body[0] + .42 * LSC, r.body[1] + .18 * LSC];
      const rest = [sh[0] + .05 * LSC, sh[1] + .55 * LSC];
      const tip = [CHAIN_X - 2, CHAIN_Y1 + pull + 8];
      const hoof = [lerp(rest[0], tip[0], reach), lerp(rest[1], tip[1], reach)];
      const el = [lerp(sh[0], hoof[0], .5) + 10 * reach, lerp(sh[1], hoof[1], .5) + 14 * reach];
      taper(s, sh, el, .08 * LSC, .065 * LSC, FACE); taper(s, el, hoof, .065 * LSC, .06 * LSC, FACE);
      dot(s, hoof[0], hoof[1], .075 * LSC, '#2a2530');
    }
    // light caught in its open eyes
    if (lids < .9) for (const d of [-1, 1]) {
      const ex = r.head[0] + d * .11 * LSC + .03 * LSC + look[0] * .03 * LSC, ey = r.head[1] - .03 * LSC + look[1] * .02 * LSC;
      dot(f, ex, ey, .018 * LSC, `rgba(255,236,205,${.55 * (1 - lids)})`);
    }
    return r;
  }

  // everything in the room, at dawn level d
  function room(t, { lamp = .8, eye = 0, d = dawnAt(t), last = {}, silSill = false, snoreSill = 0 } = {}) {
    bedroom(t, { lamp, eye, moonA: clamp(1 - d * 2) });
    windowDawn(t, d);
    dresser();
    nappers(t, { silSill, snoreSill });
    lastSheep(t, { lamp, ...last });
    roomWarm(d);
  }

  // ---------- 1 · asleep everywhere (135.0 - 136.93): hard cut, wide, the sleeper still awake ----------
  function piles(t, lt, dur) {
    const hits = [135.13, 135.47, 135.83, 136.23].reduce((a, x) => a + hit(t, x, 5), 0);
    cam(kf(lt, [[0, 940], [dur, 1010]], ease.sine), kf(lt, [[0, 570], [dur, 548]], ease.sine), kf(lt, [[0, 1.05], [dur, 1.12]], ease.sine) + .004 * hits);
    room(t, { eye: 1, last: { look: kf(lt, [[0, [1, 0]], [.9, [1, 0]], [1.3, [0, .2]]]) } });
    eyeGlint(1, .55);
  }

  // ---------- 2 · the sill (136.93 - 139.07): the first thin light behind the sleeping sill sheep ----------
  function sill(t, lt, dur) {
    cam(kf(lt, [[0, 1340], [dur, 1470]], ease.sine), kf(lt, [[0, 455], [dur, 432]], ease.sine), kf(lt, [[0, 2.0], [dur, 2.2]], ease.sine));
    room(t, { snoreSill: .9 * hit(t, 138.0, 3) * (t > 137.9 ? 1 : 0) + .6 * smooth(inv(137.9, 138.0, t)) * (1 - smooth(inv(138.0, 138.4, t))) });
  }

  // ---------- 3 · the sleeper sleeps (139.07 - 140.9): the chord swells, the eye finally closes ----------
  function sleeps(t, lt, dur) {
    cam(kf(lt, [[0, 760], [dur, 700]], ease.sine), kf(lt, [[0, 620], [dur, 605]], ease.sine), kf(lt, [[0, 2.0], [dur, 2.35]], ease.out));
    const eye = kf(t, [[139.25, 1], [139.7, .3], [139.95, .55], [140.55, 0]], ease.inOut);
    room(t, { eye });
    eyeGlint(eye, .5);
    glow(900, 560, 700, `rgba(255,190,150,${.18 * hit(t, CHORD, 2.5)})`);
  }

  // ---------- 4 · sunrise in the window (140.9 - 142.5): the sill sheep turn to silhouettes ----------
  function sunrise(t, lt, dur) {
    cam(kf(lt, [[0, 1400], [dur, 1390]], ease.sine), kf(lt, [[0, 440], [dur, 405]], ease.sine), kf(lt, [[0, 1.85], [dur, 2.3]], ease.inOut));
    room(t, { silSill: true });
  }

  // ---------- 5 · the last one awake (142.5 - 144.1): it checks the sleeper, then looks up at the chain ----------
  function lastAwake(t, lt, dur) {
    cam(kf(lt, [[0, 600], [dur, 520]], ease.sine), kf(lt, [[0, 610], [dur, 592]], ease.sine), kf(lt, [[0, 1.72], [dur, 1.98]], ease.sine));
    const look = kf(t, [[142.6, [1, .2]], [143.0, [1, .2]], [143.25, [0, 0]], [143.55, [0, 0]], [143.8, [.6, -1]]]);
    room(t, { last: { look, reach: .45 * ease.out(inv(143.7, 144.1, t)) } });
  }

  // ---------- 6 · lights out (144.1 - 145.68): the pull on the cut, lids close, warm light, black ----------
  function lightsOut(t, lt, dur) {
    cam(kf(lt, [[0, 318], [dur, 345]], ease.sine), kf(lt, [[0, 592], [dur, 574]], ease.sine), kf(lt, [[0, 2.85], [dur, 3.3]], ease.sine));
    const lamp = .8 * (1 - smooth(inv(CUT, CUT + .06, t)));
    const reach = kf(t, [[144.1, .45], [144.6, 1]], ease.inOut);
    const pull = 20 * smooth(inv(CUT - .12, CUT, t)) * (1 - smooth(inv(CUT + .1, CUT + .35, t)));
    const lids = kf(t, [[144.1, .55], [144.95, .55], [145.03, .74], [145.09, .64], [145.26, 1]], ease.inOut);
    const look = kf(t, [[144.1, [.6, -1]], [144.9, [.6, -1]], [145.05, [0, .2]]]);
    room(t, { lamp, last: { lids, look, reach: reach * (1 - .6 * smooth(inv(CUT + .15, CUT + .5, t))), pull } });
    // with the lamp gone, the dawn takes the sheep's face
    const dk = smooth(inv(CUT, CUT + .6, t));
    s.save(); s.globalCompositeOperation = 'screen';
    for (const [w, al] of [[120, .16], [80, .16], [45, .18]]) {   // a soft-edged sunbeam, three nested bands
      s.globalAlpha = al * dk;
      poly(s, [[980, 400 - w], [980, 400 + w], [60, 500 + w * .8], [60, 500 - w * .8]], '#d98a52');
    }
    s.globalAlpha = .4 * dk; s.fillStyle = rgrad(s, 420, 470, 20, 420, [[0, '#e0a060'], [1, '#000000']]); s.fillRect(0, 300, 900, 500);
    s.restore();
    glow(360, 480, 380, `rgba(255,180,110,${.13 * dk})`);
    flash(.24 * smooth(inv(145.2, 145.5, t)), '#e8a060');
    blackout(smooth(inv(145.42, 145.64, t)));
  }

  chapter('morning', 135.0, 145.68, [
    [135.0, piles],
    [136.93, sill],
    [CHORD, sleeps],
    [140.9, sunrise],
    [142.5, lastAwake],
    [144.1, lightsOut, { paint: { boil: 6, bloom: 1.6 } }],
  ], { paint: { boil: 7, bloom: 1.35 } });
})();
