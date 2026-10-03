// SECTION D, verse 2: frames 2389-2850 (99.5417-118.750 s). Kawaii watercolour.
// Words (Bob's sheet) with times snapped to the Demucs vocal stem:
//   "I'm an airplane on the highway"   I'm (held, from before 99.54) an 100.40 airplane 100.84 highway ~102.0-103.1
//   "and I know something's wrong"     and 103.70 know 104.34 some 105.37 thing's 105.59 wrong 106.04-106.6
//   "da da da da da da"                107.24 107.60 108.04 108.34 108.60 108.86 (vocal ends 109.46)
//   "I'm an airplane on the highway"   I'm 109.72 airplane 110.58 highway 111.6-112.2
//   "that's why I'm singing this song" that's 112.76 why 112.98 singing 113.90 this 114.18 song 114.50-115.6; tail to 118.75
// Shots:
//   D1 99.5417 roadside 3/4, low: he putters toward us; his too-long near wing sweeps the verge and on
//      "highway" (102.30) clips a mailbox; the box squeals, letters flutter, he winces and holds it.
//   D2 103.62  close head-on: big face; eyes glance on "know", worried on "something's", the sun goes
//      behind a grey cloud, and on "wrong" his inner prop coughs to a stop with a smoke puff.
//   D3 106.85  "da da da": sticker-sheet backdrop, he hops on all six syllables; three pops (107.24,
//      108.04, 108.60) burst a flower, a star and a heart open around him.
//   D4 109.62  side travelling 3/4: patchwork fields, barn, windmill; proud and singing; fence posts
//      slide past in front; the wing reaches over both verges.
//   D5 112.62  low angle from below: music notes rise from his mouth on "singing this song"; the camera
//      tilts up after them into the sky; ends on notes drifting among clouds (clean last frame).
(() => {
  const D0 = 2389 / 24, D1 = 2850 / 24;
  const KNOW = 104.34, SOME = 105.37, WRONG = 106.04;
  const DA = [107.24, 107.60, 108.04, 108.34, 108.60, 108.86], POPS = [107.24, 108.04, 108.60];
  const SING = 113.90, SONG = 114.50, BONK = 102.30;
  const lastHit = (t, list) => { let v = 0; for (const a of list) v = Math.max(v, hit(t, a, 7)); return v; };

  // ------------------------------------------------------------ D1 roadside 3/4
  const V1 = 400, zAt = (t) => 1050 + V1 * (103.62 - t); // static camera, he drives up to it
  function roadside(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 5.1, wet: .34 });
    const zp = zAt(t), HZ = 470;
    const cfg = { x: -700, z: 0, h: 230, yaw: .4, F: 1800, hz: HZ, ox: 900 }; const cam = wcam(cfg);
    skyWash(-60, HZ, PAL.sky1, PAL.sky2, 51);
    sun(1600, 150, 70, t, 6000);
    cloud(300 + (t - 99) * 8, 140, .9, 6100, true, t); cloud(1080 + (t - 99) * 5, 250, .6, 6110);
    hills(HZ + 8, [[150, 420, 120, PAL.lilac], [900, 380, 80, '#d9eab0'], [1700, 460, 150, PAL.mint]], 6200);
    groundRoad(cam, HZ, { dashPh: 0, z0: 0, z1: 40000 });
    const items = [];
    const hitZ = zAt(BONK); // the mailbox sits where his near wingtip reaches at "highway"
    for (let i = -4; i < 40; i++) { const z = i * 600; if (Math.abs(z - hitZ) < 300) continue; items.push({ x: -700, z, f: (p) => at(p, () => propFence(7100 + (i & 7))) }); }
    for (let i = 0; i < 22; i++) { const z = hitZ + 1600 + i * 2100; items.push({ x: 1200 + 300 * hash(i), z, f: (p) => at(p, () => propTree(7200 + i, [PAL.mint, PAL.lilac, '#f7b6a8', PAL.lemon][i % 4], 560)) }); }
    for (let i = 0; i < 14; i++) { const z = hitZ - 3000 + i * 1500; items.push({ x: -900 - 200 * hash(i + 3), z, f: (p) => at(p, () => propFlowers(7300 + i, 4)) }); }
    const bt = t - BONK, lid = bt > 0 ? Math.min(1, bt * 6) * (bt < 1.6 ? 1 : Math.max(0, 1 - (bt - 1.6) * 2)) : 0;
    const flag = bt > 0 ? .5 + .5 * Math.cos(bt * 10) * Math.exp(-bt * 2.2) : 0;
    const wob = bt > 0 ? Math.sin(bt * 16) * Math.exp(-bt * 2.4) * .25 : 0;
    items.push({ x: -580, z: hitZ, f: (p) => at(p, () => { rot(wob); propMailbox(7400, bt > 0 ? 1 - flag * .3 : 0, lid); }) });
    const wince = bt > 0 && bt < 1.3, sheep = bt >= 1.3;
    items.push({ x: 0, z: zp, f: () => {
      placePlane(cam, cfg, 0, zp, { t, hop: Math.abs(Math.sin(t * 4.7)) * 8 + hit(t, BONK, 4) * 14, tilt: wob * .25, eyes: wince ? 'squeeze' : 'happy', mouth: sheep ? 'cat' : 'smile', open: vocv(t), faceU: 82, blush: sheep ? 1.4 : 1 });
    } });
    drawWorld(cam, items);
    if (bt > 0 && bt < 2.6) { // letters flutter out of the mailbox
      const mp = cam(-580, 290, hitZ), r = rng(77);
      for (let i = 0; i < 6; i++) { const vx = (r() - .5) * 500, vy = -300 - r() * 260, dt = bt; const x = mp.x + vx * dt, y = mp.y + vy * dt + 260 * dt * dt * .8, a = Math.sin(dt * 5 + i) * .6; push(); tr(x, y); rot(a); sc(mp.k * 1.1); seedAt(7500 + i); shape(rrect(-40, -26, 80, 52, 6, 7500 + i), PAL.white, 4); ink([[-40, -26], [0, 4], [40, -26]], false, 3.5); pop(); }
      confetti(mp.x, mp.y, BONK, t, 16, 4401, 420, 1.3);
    }
  }

  // ------------------------------------------------------------ D2 close head-on
  function worry(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 5.7, wet: .36 + .25 * smooth(inv(SOME, WRONG + .5, t)) });
    const zp = -900 * (t - 99), HZ = 600, dist = lerp(1600, 1250, ease.inOut(inv(103.62, 106.85, t)));
    const cfg = { x: 0, z: zp - dist, h: 270, yaw: 0, F: 3600, hz: HZ, ox: 960 }; const cam = wcam(cfg);
    const gloom = smooth(inv(SOME - .2, SOME + .6, t));
    skyWash(-60, HZ, PAL.sky1, PAL.sky2, 57);
    sun(1500, 170, 80, t, 6010);
    // a grey cloud slides over the sun on "something's"
    const gx = lerp(2300, 1480, ease.out(inv(SOME - .3, SOME + .7, t)));
    cloud(gx, 180, 1.5, 6020, false, t, '#b8b2c9');
    if (gloom > 0) { s.save(); s.globalAlpha = .28 * gloom; s.fillStyle = '#9d98b8'; s.fillRect(-W, -H, W * 3, HZ + H); s.restore(); }
    cloud(330, 170, 1.1, 6030, true, t);
    hills(HZ + 10, [[100, 520, 170, PAL.lilac], [1820, 560, 190, PAL.mint]], 6230);
    groundRoad(cam, HZ, { z0: zp - 900, z1: zp + 40000, sd: 320 });
    if (gloom > 0) { s.save(); s.globalAlpha = .16 * gloom; s.fillStyle = '#8f88ad'; s.fillRect(-W, HZ, W * 3, H); s.restore(); }
    const stall = smooth(inv(WRONG, WRONG + .35, t));
    const eyes = t >= SOME ? 'worried' : 'dot';
    const look = t >= KNOW && t < SOME ? Math.sin((t - KNOW) * 6) : 0;
    const P = placePlane(cam, cfg, 0, zp, { t, hop: -beatPulse(t, 8) * 6, tilt: stall * Math.sin(t * 22) * .015, eyes, look, mouth: 'wavy', open: vocv(t), stall, faceU: 84, es: 1.35 });
    // the sputter: a smoke puff off the stalled prop, then a sweat drop
    const sp = cam(-260, 152, zp + 140);
    for (let i = 0; i < 4; i++) { const t0 = WRONG + .1 + i * .18, dt = t - t0; if (dt < 0 || dt > 1.4) continue; alpha(clamp(1.4 - dt)); cloud(sp.x - 40 * dt - i * 10, sp.y - 40 - 160 * dt, (.35 + .4 * dt) * sp.k, 6040 + i, false, t, '#a7a1b5'); alpha(1); }
    const dr = smooth(inv(WRONG + .15, WRONG + .4, t));
    if (dr > 0) { push(); tr(P.face[0] + 170 * P.k, P.face[1] - 120 * P.k + (t - WRONG) * 40); sc(P.k * 1.4 * dr); seedAt(6050); const Q = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU; Q.push([Math.sin(a) * 18 * (1 - Math.cos(a)) * .55, -Math.cos(a) * 24 - 4]); } shape(Q, PAL.blue, 4.5); pop(); }
  }

  // ------------------------------------------------------------ D3 da da da
  function dada(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 6.3, wet: .3 });
    s.fillStyle = PAL.sky1; s.fillRect(-W, -H, W * 3, H * 3);
    const r = rng(63); // sticker sheet: polka dots and tiny stars, drifting
    for (let i = 0; i < 26; i++) { const x = wrapv(r() * W + (t - 106) * 30, W + 200) - 100, y = r() * H, rr = 26 + r() * 40, c = [PAL.lemon, '#fff6e8', PAL.lilac, PAL.mint][i % 4]; seedAt(6300 + i); if (i % 3) shape(ell(x, y, rr, rr, 18), c, 4); else { const st = []; for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j / 10 * TAU + t * .5, q = j % 2 ? rr * .45 : rr; st.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); } shape(st, c, 4); } }
    seedAt(6400); shape(ell(960, 930, 780, 150, 40), PAL.mint, 6);
    // hop on every syllable: up between, squash on each landing
    let hop = 0, sq = 0;
    for (let i = 0; i < DA.length; i++) { const a = DA[i], b = DA[i + 1] ?? a + .34, u = (t - a) / (b - a); if (u >= 0 && u < 1) hop = Math.sin(Math.PI * u) * 110; }
    for (const a of DA) sq = Math.max(sq, hit(t, a, 14) * .14);
    if (t < DA[0]) sq = .1 * smooth(inv(DA[0] - .25, DA[0], t)); // wind-up crouch
    const bp = [[430, 380, PAL.pink, 'flower'], [1500, 360, PAL.lemon, 'star'], [960, 150, PAL.berry, 'heart']];
    POPS.forEach((t0, i) => {
      const g = ease.back(inv(t0, t0 + .3, t)); if (g <= 0) return;
      const [x, y, c, kind] = bp[i], yy = y + Math.sin((t - t0) * 3) * 12, R = 120 * g;
      seedAt(6500 + i);
      if (kind === 'flower') { for (let p = 0; p < 6; p++) { const a = p / 6 * TAU + (t - t0) * .8; shape(ell(x + Math.cos(a) * R * .62, yy + Math.sin(a) * R * .62, R * .42, R * .42, 16), c, 5); } shape(ell(x, yy, R * .42, R * .42, 16), PAL.lemon, 5); face(x, yy, R * .16, { eyes: 'happy', w: 4, blush: .9 }); }
      else if (kind === 'star') { const st = []; for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j / 10 * TAU + Math.sin(t * 3) * .1, q = j % 2 ? R * .45 : R; st.push([x + Math.cos(a) * q, yy + Math.sin(a) * q]); } shape(st, c, 6); face(x, yy + R * .1, R * .17, { eyes: 'squeeze', w: 4, blush: .9 }); }
      else { heart(x, yy, R * .8, c, 6); face(x, yy - R * .1, R * .16, { eyes: 'happy', w: 4 }); }
      popRing(x, yy, t, t0, 130, c, 6600 + i);
      confetti(x, yy, t0, t, 22, 6700 + i, 600, 1.6);
    });
    plane3(960, 960, 1.3, { t, yaw: Math.sin(t * 2.4) * .12, pitch: .12, hop, squash: sq, eyes: t >= DA[0] - .05 ? 'squeeze' : 'happy', mouth: 'smile', open: vocv(t), faceU: 84, es: 1.4, persp: 3200 });
  }

  // ------------------------------------------------------------ D4 side travelling
  function fields(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 6.9, wet: .32 });
    const zp = -1100 * (t - 99), HZ = 540;
    const cfg = { x: -1450, z: zp - 1150, h: 230, yaw: .9, F: 1900, hz: HZ, ox: 900 }; const cam = wcam(cfg);
    skyWash(-60, HZ, PAL.sky3, PAL.sky1, 69);
    cloud(wrapv(1500 - (t - 109) * 30, 2400) - 200, 110, .8, 6900, true, t); cloud(wrapv(500 - (t - 109) * 20, 2400) - 200, 200, .55, 6910);
    hills(HZ + 6, [[200, 520, 100, '#d9eab0'], [1000, 460, 70, PAL.lilac], [1800, 540, 120, PAL.mint]], 6920);
    seedAt(6930); paint([[-400, HZ], [W + 400, HZ], [W + 400, H + 400], [-400, H + 400]], PAL.grass); ink([[-400, HZ + 3], [W + 400, HZ + 3]], false, 5);
    // patchwork crop stripes on the far side of the road
    for (let i = 0; i < 18; i++) { const z0 = Math.floor(zp / 2400) * 2400 + (i - 4) * 2400; const P = gstrip(cam, 900, 9000, z0, z0 + 2400, 4); if (P.length >= 4) { seedAt(6940 + (i & 7)); paint(P, ['#d9eab0', '#f6e3a8', '#c7e3c0', '#efd2c4'][((Math.floor(z0 / 2400) % 4) + 4) % 4], .8, false); } }
    seedAt(6960); paint(gstrip(cam, -380, 380, zp - 3000, zp + 30000, 50), PAL.road, 1, false); ink(gline(cam, -380, zp - 3000, zp + 30000, 50), false, 6); ink(gline(cam, 380, zp - 3000, zp + 30000, 50), false, 6);
    for (let i = 0; i < 40; i++) { const za = Math.floor(zp / 900) * 900 + (i - 6) * 900; const P = gstrip(cam, -14, 14, za, za + 420, 3); if (P.length >= 4) paint(P, PAL.dash, .95, false); }
    const items = [];
    const base = Math.floor(zp / 6000) * 6000;
    for (let i = -1; i < 6; i++) { const z = base + i * 6000; items.push({ x: 4200, z: z + 1500, f: (p) => at(p, () => propBarn(7600 + i)) }); items.push({ x: 3000, z: z + 4200, f: (p) => at(p, () => propWindmill(7650 + i, t)) }); }
    for (let i = -2; i < 14; i++) { const z = Math.floor(zp / 1700) * 1700 + i * 1700; items.push({ x: 3600 + 600 * hash(i * 7 & 255), z, f: (p) => at(p, () => propTree(7700 + (i & 15), [PAL.mint, '#f7b6a8', PAL.lemon, PAL.lilac][(i & 3)], 600)) }); }
    for (let i = -2; i < 18; i++) { const z = Math.floor(zp / 650) * 650 + i * 650; items.push({ x: -820, z, f: (p) => at(p, () => propFence(7800 + (i & 7))) }); if ((i & 3) === 1) items.push({ x: -1100, z: z + 200, f: (p) => at(p, () => propFlowers(7900 + (i & 7), 4)) }); }
    items.push({ x: 0, z: zp, f: () => placePlane(cam, cfg, 0, zp, { t, hop: -beatPulse(t, 8) * 8 + Math.abs(Math.sin(t * 5)) * 6, eyes: 'happy', mouth: 'smile', open: vocv(t), faceU: 70, es: 1.35 }) });
    drawWorld(cam, items);
  }

  // ------------------------------------------------------------ D5 the song goes up
  const NOTES = []; { const r = rng(515); const ts = [SING, 114.05, 114.18, SONG, 114.72, 114.95, 115.18, 115.42]; ts.forEach((t0, i) => NOTES.push({ t0, vx: (i % 2 ? 1 : -1) * (260 + r() * 160), vy: -(230 + r() * 120), kind: i % 3 === 1 ? 1 : 0, col: CONF[i % CONF.length], sz: 70 + r() * 40, ph: r() * TAU })); }
  function song(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 7.5, wet: .33 });
    const tilt = 1250 * ease.inOut(inv(115.1, 118.6, t));
    tr(0, tilt);
    const HZ = 720;
    const cfg = { x: -160, z: -1150, h: 70, yaw: .14, F: 1500, hz: HZ, ox: 960 }; const cam = wcam(cfg);
    skyWash(-1600, HZ, '#cfe3f3', PAL.sky1, 75, [PAL.lilac, PAL.peach, '#fff3d8', '#d9ecf8']);
    // high sky the camera tilts up into
    cloud(300, -900, 1.2, 7510, true, t); cloud(1500, -1050, .9, 7520); cloud(1100, -620, .7, 7530); cloud(500, -320, .6, 7540); cloud(1650, -380, .8, 7550, true, t);
    sun(1620, -150, 76, t, 7560);
    hills(HZ + 6, [[250, 520, 90, PAL.mint], [1500, 600, 110, PAL.lilac]], 7570);
    groundRoad(cam, HZ, { z0: -1000, z1: 40000, dashPh: (t - 112) * 400, sd: 360 });
    const P = placePlane(cam, cfg, 0, 0, { t, hop: -beatPulse(t, 8) * 6, eyes: t >= SING ? 'happy' : 'dot', lookY: -1, mouth: 'smile', open: vocv(t), faceU: 84, es: 1.35, dyaw: -.05 });
    // music notes from his mouth, up into the sky
    NOTES.forEach((n, i) => {
      const dt = t - n.t0; if (dt < 0) return;
      const g = ease.back(inv(0, .3, dt)), x = P.mouth[0] + n.vx * (1 - Math.exp(-dt * 2.5)) / 2.5 * 2.2 + Math.sin(dt * 2.2 + n.ph) * 40, y = P.mouth[1] - 20 + n.vy * dt * (1 + dt * .08);
      note(x, y, n.sz * g, Math.sin(dt * 2.5 + n.ph) * .25, n.col, n.kind, 7600 + i);
    });
    // little sparkles near the top of the frame as the notes arrive in the sky
    for (let i = 0; i < 8; i++) { const x = 200 + i * 220, y = -700 + 120 * Math.sin(i * 1.7), tw = Math.sin(t * 5 + i * 1.3); if (tw < .3) continue; seedAt(7700 + i); const st = []; for (let j = 0; j < 8; j++) { const a = j / 8 * TAU, q = j % 2 ? 6 : 18 * tw; st.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); } shape(st, '#fff6c8', 3); }
  }

  chapter('verseD', D0 - .01, D1, [
    [D0 - .01, roadside], [103.62, worry], [106.85, dada], [109.62, fields], [112.62, song],
  ]);
})();
