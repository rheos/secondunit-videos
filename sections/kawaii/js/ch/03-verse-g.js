// SECTION G, verse 3: frames 4074-4525 (169.750-188.5417 s). Kawaii watercolour, at dusk.
// Words (Bob's sheet), times snapped to the Demucs vocal stem:
//   "I'm so sick and tired of driving, I've"  I'm so 170.54 sick 170.82 and 171.44 tired 171.70 driving 172.28 I've 173.69
//   "seen all that the highway brings"        seen 174.58 all 175.31 the 176.42 highway 176.60 brings 177.23-177.8
//   "doo doo doo doo doo doo doo"             quiet pulses 178.10 178.38 178.64 178.92 179.18 179.48 (+ the last under "I'm")
//   "I'm sick and tired of driving"           I'm 179.72 sick 180.36 tired 181.13 driving 182.26-182.95
//   "wondering why I've got these wings"      wondering 183.48 why ~184.0 wings 184.70-186.3 (held)
// Shots:
//   G1 169.7417 weary, head-on low on a long dusk highway: telephone poles tick past, heavy lids, a yawn on
//      "tired", a slump on "driving"; a VIP car in the passing lane ducks under his wing to get by.
//   G2 174.45  the roadside parade, side 3/4 tracking: pie billboard, diner, motel, sunglasses-car ad, then a
//      billboard of a little plane FLYING; he gazes up at it as it slides by on "highway brings".
//   G3 178.00  "doo doo": head-on, he bounces on every pulse, tyres off the road, dust on each landing; the
//      cacti bounce along.
//   G4 179.62  "sick and tired of driving": 3/4 front, VIP cars stream past under his wingtip, ducking;
//      flat eyes, a private raincloud and a long sigh on "driving".
//   G5 183.40  "wondering why I've got these wings": he looks at his near wing, raises it on "why"; on
//      "wings" a gust swirls in and lifts his tyres off the road for a moment, then drops him back with a
//      bump; a contrail plane crosses the sky and he looks up. Clean last frame.
(() => {
  const G0 = 4074 / 24, G1 = 4525 / 24;
  const SICK = 170.82, TIRED = 171.70, DRIV = 172.28, IVE = 173.69, HWY = 176.60, BRINGS = 177.23;
  const DOO = [178.10, 178.38, 178.64, 178.92, 179.18, 179.48];
  const SICK2 = 180.36, TIRED2 = 181.13, DRIV2 = 182.26, WOND = 183.48, WHY = 184.0, WINGS = 184.70;
  const DUSK = ['#f6b9a4', '#f3d2b0', '#d9c2ea', '#fbe2ae'];

  // ------------------------------------------------------------ G1 weary head-on
  function weary(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 8.1, wet: .36 });
    const zp = -800 * (t - 169), HZ = 520;
    const pin = t >= 172.833; // punch-in on the drum hit
    const cfg = pin ? { x: -120, z: zp - 1350, h: 250, yaw: .06, F: 2100, hz: HZ, ox: 1000 } : { x: -260, z: zp - 1900 + 70 * (t - 169.75), h: 250, yaw: .1, F: 2100, hz: HZ, ox: 1000 }; const cam = wcam(cfg);
    skyWash(-60, HZ, '#cdb8e6', '#f8c7a2', 81, DUSK);
    sun(1250, HZ - 30, 110, t, 8010); // a low, sleepy sun sinking behind the hills
    hills(HZ + 8, [[250, 520, 110, '#c9b3dd'], [1650, 560, 130, '#e9b8b0']], 8020);
    groundRoad(cam, HZ, { z0: zp - 1400, z1: zp + 60000, passing: true, grass: '#d8e4b0', road: '#c5bad4', sd: 8030 });
    const items = [];
    for (let i = -2; i < 26; i++) { const z = Math.floor(zp / 1400) * 1400 + i * 1400; items.push({ x: 1050, z, f: (p) => at(p, () => propPole(8100 + (i & 7))) }); items.push({ x: -2000, z: z + 700, f: (p) => at(p, () => propPole(8200 + (i & 7))) }); if ((i & 3) === 2) items.push({ x: 1500, z: z + 300, f: (p) => at(p, () => propCactus(8300 + (i & 7))) }); }
    // the VIP car comes up the passing lane and ducks under his wing
    const tc = 172.45, carZ = zp + 2600 - 2600 * (t - (tc - 1)) / 1.0;
    const duck = smooth(1 - Math.abs(carZ - zp) / 700);
    items.push({ x: -760, z: carZ, f: (p) => at(p, () => carFront(8400, PAL.lemon, duck, 'shades', t)) });
    const yawn = smooth(inv(TIRED - .05, TIRED + .15, t)) * (1 - smooth(inv(DRIV - .05, DRIV + .25, t)));
    const slump = smooth(inv(DRIV, DRIV + .5, t)) * (1 - smooth(inv(IVE + .2, IVE + .6, t)));
    const glance = smooth(1 - Math.abs(t - tc) / .6);
    items.push({ x: 0, z: zp, f: () => placePlane(cam, cfg, 0, zp, { t, hop: -slump * 22 + Math.sin(t * 2.2) * 5, tilt: Math.sin(t * 1.1) * .02, squash: slump * .05, eyes: yawn > .4 ? 'squeeze' : 'flat', look: -glance * .9, mouth: 'flat', open: Math.max(0 * .8, yawn), faceU: 84, es: 1.35, blush: .6, spin: t * 9 }) });
    drawWorld(cam, items);
  }

  // ------------------------------------------------------------ G2 the roadside parade
  const V2 = 1700, z2 = (t) => -V2 * (t - 174.45);
  function parade(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 8.7, wet: .33 });
    const zp = z2(t), HZ = 600;
    const cfg = { x: -1500, z: zp - 1250, h: 240, yaw: .88, F: 1650, hz: HZ, ox: 820 }; const cam = wcam(cfg);
    skyWash(-60, HZ, '#cdb8e6', '#f8c7a2', 87, DUSK);
    cloud(wrapv(1400 - (t - 174) * 40, 2400) - 200, 120, .8, 8710, true, t);
    hills(HZ + 6, [[300, 560, 90, '#c9b3dd'], [1500, 600, 110, '#e9b8b0']], 8720);
    groundRoad(cam, HZ, { z0: zp - 1300, z1: zp + 50000, grass: '#d8e4b0', road: '#c5bad4', sd: 8730 });
    const items = [];
    const bbZ = z2(177.15) - 250; // the plane billboard is level with him on "highway brings"
    const row = [['diner', bbZ + 6000], ['BLUE RODEO', bbZ + 4600], ['motel', bbZ + 3500], ['BRYAN ADAMS', bbZ + 2600], ['YOKOHAMA ONO', bbZ + 1300], ['plane', bbZ], ['pie', bbZ - 1500]];
    row.forEach(([kind, z], i) => items.push({ x: kind === 'diner' || kind === 'motel' ? 2300 : kind === 'plane' ? 1500 : 1250, z, f: (p) => at(p, () => { if (kind === 'plane') sc(1.25);
      if (kind === 'diner') propDiner(8800 + i, t); else if (kind === 'motel') propMotel(8800 + i, t); else if (/[A-Z]/.test(kind)) { const [bg, fg] = { 'BLUE RODEO': ['#bfe0f4', '#3d6fb6'], 'BRYAN ADAMS': [PAL.lemon, RED], 'YOKOHAMA ONO': [PAL.pink, '#fffaf2'] }[kind]; propTextBoard(8800 + i, kind, bg, fg, t); } else propBillboard(8800 + i, kind, t);
    }) }));
    for (let i = -2; i < 16; i++) { const z = Math.floor(zp / 900) * 900 + i * 900; items.push({ x: -800, z, f: (p) => at(p, () => propFence(8900 + (i & 7))) }); }
    const bb = cam(1500, 900, bbZ);
    let P = null;
    items.push({ x: 0, z: zp, f: () => {
      const gz = smooth(inv(HWY - .9, HWY - .3, t));
      P = placePlane(cam, cfg, 0, zp, { t, hop: Math.abs(Math.sin(t * 4)) * 6, eyes: gz > .2 ? 'wide' : 'flat', look: gz > .2 ? clamp((bb.x - 960) / 260, -1, 1) : 0, lookY: -gz, mouth: gz > .5 ? 'o' : 'flat', open: 0 * .9, faceU: 76, es: 1.4, blush: .6 + gz * .8 });
    } });
    drawWorld(cam, items);
    // sparkles in his eyes while the flying plane goes by
    const gz = smooth(inv(HWY - .6, HWY, t)) * (1 - smooth(inv(177.85, 178, t)));
    if (P && gz > 0) for (let i = 0; i < 3; i++) { const a = t * 4 + i * 2.1, x = P.face[0] + Math.cos(a) * 150 * P.k, y = P.face[1] - 160 * P.k + Math.sin(a) * 40 * P.k; seedAt(8950 + i); const st = []; for (let j = 0; j < 8; j++) { const b = j / 8 * TAU, q = j % 2 ? 6 : 20 * gz; st.push([x + Math.cos(b) * q, y + Math.sin(b) * q]); } shape(st, '#fff6c8', 3); }
  }

  // ------------------------------------------------------------ G3 doo doo
  function doos(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 9.3, wet: .32 });
    const zp = -700 * (t - 178), HZ = 560;
    const cfg = { x: 0, z: zp - 1900, h: 300, yaw: 0, F: 2100, hz: HZ, ox: 960 }; const cam = wcam(cfg);
    skyWash(-60, HZ, '#d4bde9', '#f8c7a2', 93, DUSK);
    sun(1500, 200, 70, t, 9310);
    hills(HZ + 6, [[200, 520, 130, '#c9b3dd'], [1750, 560, 150, '#e9b8b0']], 9320);
    groundRoad(cam, HZ, { z0: zp - 1800, z1: zp + 50000, grass: '#d8e4b0', road: '#c5bad4', sd: 9330 });
    let b = 0, sq = 0;
    for (let i = 0; i < DOO.length; i++) { const a = DOO[i], c = DOO[i + 1] ?? a + .28, u = (t - a) / (c - a); if (u >= 0 && u < 1) b = Math.sin(Math.PI * u); }
    for (const a of DOO) sq = Math.max(sq, hit(t, a, 16) * .12);
    const items = [];
    for (let i = -2; i < 18; i++) { const z = Math.floor(zp / 1100) * 1100 + i * 1100; for (const side of [-1, 1]) items.push({ x: side * (1300 + 300 * hash(i & 63)), z: z + side * 300, f: (p) => at(p, () => { sc(1 + sq * .6, 1 - sq * 1.5 + b * .08); propCactus(9400 + (i & 7) + side, 420); }) }); }
    items.push({ x: 0, z: zp, f: () => placePlane(cam, cfg, 0, zp, { t, lift: b * 95, squash: sq, eyes: 'happy', mouth: 'smile', open: Math.max(0, b * .5), faceU: 86, es: 1.4, tilt: Math.sin(t * 11) * .03 * b }) });
    drawWorld(cam, items);
    const pp = cam(0, 0, zp);
    DOO.forEach((a, i) => { if (i) dustPuffs(pp.x, pp.y + 30 * pp.k, t, a, pp.k * .8, 9500 + i * 10); });
  }

  // ------------------------------------------------------------ G4 sick and tired, VIP cars streaming by
  const CARS = [{ tc: 180.3, col: PAL.pink }, { tc: 181.2, col: PAL.wing }, { tc: 182.0, col: PAL.lemon }, { tc: 182.85, col: PAL.lilac }];
  function streaming(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 9.9, wet: .34 });
    const zp = -650 * (t - 179), HZ = 470;
    const pin = t >= 181.708;
    const cfg = pin ? { x: -900, z: zp - 1050, h: 240, yaw: .62, F: 1900, hz: HZ, ox: 980 } : { x: -1650, z: zp - 1500, h: 240, yaw: .66, F: 1900, hz: HZ, ox: 1020 }; const cam = wcam(cfg);
    skyWash(-60, HZ, '#c9b0e0', '#f3b9a0', 99, DUSK);
    hills(HZ + 6, [[300, 520, 110, '#c9b3dd'], [1500, 620, 120, '#e9b8b0']], 9920);
    groundRoad(cam, HZ, { z0: zp - 1400, z1: zp + 50000, passing: true, grass: '#d8e4b0', road: '#c5bad4', sd: 9930 });
    const items = [];
    for (let i = -2; i < 20; i++) { const z = Math.floor(zp / 1300) * 1300 + i * 1300; items.push({ x: 1300, z, f: (p) => at(p, () => propPole(9950 + (i & 7))) }); }
    let near = 0;
    CARS.forEach((c, i) => { const z = zp + 2400 * (c.tc - t) - 250 * (t - 179); const duck = smooth(1 - Math.abs(z - zp) / 650); near = Math.max(near, duck); items.push({ x: -760, z, f: (p) => at(p, () => carFront(9960 + i * 10, c.col, duck, i % 2 ? 'smug' : 'shades', t)) }); });
    const sigh = smooth(inv(DRIV2, DRIV2 + .5, t));
    let P = null;
    items.push({ x: 0, z: zp, f: () => { P = placePlane(cam, cfg, 0, zp, { t, hop: -sigh * 18 + Math.sin(t * 2.2) * 4, eyes: 'flat', look: -.6 - near * .4, brow: 1, mouth: 'flat', open: 0 * .8, faceU: 84, es: 1.35, blush: .5, spin: t * 10 }); } });
    drawWorld(cam, items);
    // a private raincloud from "tired", a sweat drop on the sigh
    const gl = smooth(inv(TIRED2, TIRED2 + .5, t));
    if (P && gl > 0) {
      const cx = P.face[0] + 40 * P.k, cy = P.face[1] - 330 * P.k;
      for (let j = 0; j < 6; j++) { const ph = wrapv((t - TIRED2) * 1.4 + j * .19, 1); alpha(clamp((1 - ph) * 2.5) * gl); seedAt(9990 + j); shape(ell(cx - 80 + j * 32, cy + 40 + ph * 120, 6, 12, 10), PAL.blue, 3); alpha(1); }
      cloud(cx, cy, .8 * gl * P.k * 1.4, 9980, false, t, '#a9a3bd');
    }
    if (P && sigh > 0) { push(); tr(P.face[0] + 150 * P.k, P.face[1] - 100 * P.k + (t - DRIV2) * 30); sc(P.k * 1.3 * sigh); seedAt(9995); const Q = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU; Q.push([Math.sin(a) * 18 * (1 - Math.cos(a)) * .55, -Math.cos(a) * 24 - 4]); } shape(Q, PAL.blue, 4.5); pop(); }
  }

  // ------------------------------------------------------------ G5 wings
  const UP = WINGS + .2, DOWN = 185.95;
  function wings(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    fx({ seed: 10.6, wet: .34 });
    const look2 = smooth(inv(185.95, 186.2, t));
    const tilt = 150 * ease.inOut(inv(185.8, 186.3, t));
    tr(0, tilt);
    const zp = -500 * (t - 183), HZ = 560;
    const cfg = { x: 950, z: zp - 1550, h: 150, yaw: -.5, F: 2000, hz: HZ, ox: 900 }; const cam = wcam(cfg);
    skyWash(-700, HZ, '#bcd3ec', '#f8c7a2', 105, ['#d9c2ea', '#fbe2ae', '#cfe3f3', '#f6b9a4']);
    cloud(260, -60, .9, 10610, true, t); cloud(1500, 60, .7, 10620);
    // the contrail plane overhead, from 186.6
    const cp = inv(184.9, 186.5, t);
    if (cp > 0) contrailPlane(lerp(-100, 1900, cp), lerp(-60, -150, cp), 1.6, lerp(0, 1500, Math.min(1, cp * 1.6)), 10630);
    hills(HZ + 6, [[250, 560, 120, '#c9b3dd'], [1600, 600, 140, '#e9b8b0']], 10640);
    groundRoad(cam, HZ, { z0: zp - 1500, z1: zp + 50000, grass: '#d8e4b0', road: '#c5bad4', sd: 10650 });
    // the gust: petals and leaves tumble across, the trees lean
    const gust = smooth(inv(WINGS - .1, WINGS + .3, t)) * (1 - smooth(inv(186.0, 186.6, t)));
    const items = [];
    for (let i = -2; i < 18; i++) { const z = Math.floor(zp / 1500) * 1500 + i * 1500; items.push({ x: -1400 - 200 * hash(i & 31), z, f: (p) => at(p, () => { rot(gust * .25 * Math.sin(t * 9 + i)); propTree(10700 + (i & 7), ['#f7b6a8', PAL.lemon, PAL.mint, PAL.lilac][i & 3], 560); }) }); items.push({ x: 1100, z: z + 600, f: (p) => at(p, () => propFlowers(10800 + (i & 7), 4)) }); }
    const lift = 135 * ease.out(inv(UP, UP + .45, t)) * (1 - ease.in(inv(DOWN - .3, DOWN, t))) + Math.sin(t * 7) * 10 * smooth(inv(UP, UP + .3, t)) * (1 - smooth(inv(DOWN - .4, DOWN, t)));
    const raise = .5 * ease.back(inv(WHY, WHY + .35, t)) * (1 - ease.inOut(inv(WINGS + .1, WINGS + .6, t)));
    const land = hit(t, DOWN, 9);
    const airborne = t > UP && t < DOWN;
    const eyes = t < WOND ? 'flat' : t < WINGS ? 'dot' : airborne ? (t < UP + .5 ? 'wide' : 'happy') : (t < DOWN + .35 ? 'squeeze' : 'dot');
    const look = t < WOND ? 0 : t < WINGS ? 1 : look2 > 0 ? .3 * look2 : 0;
    items.push({ x: 0, z: zp, f: () => placePlane(cam, cfg, 0, zp, { t, lift, raise, squash: land * .12, tilt: gust * Math.sin(t * 8) * .05, eyes, look, lookY: t >= WOND && t < WINGS ? .4 : -look2, mouth: airborne ? 'o' : 'smile', open: 0, faceU: 86, es: 1.4, spin: t * (airborne ? 30 : 16) }) });
    drawWorld(cam, items);
    windSwirls(t, WINGS - .15, 1.6, 60, 300, 10900, 9);
    if (gust > 0) { const r = rng(10950); for (let i = 0; i < 18; i++) { const ph = wrapv((t - WINGS) * (.5 + r() * .4) + r(), 1.2) - .1, x = lerp(-100, W + 100, ph), yb = r(), y = (yb < .5 ? 60 + yb * 560 : 820 + (yb - .5) * 400) + Math.sin(t * 6 + i) * 30; push(); tr(x, y); rot(t * 5 + i); alpha(gust); seedAt(10960 + i); shape(ell(0, 0, 18, 10, 10), [PAL.pink, '#f7b6a8', PAL.lemon, '#a9dcb5'][i % 4], 3); alpha(1); pop(); } }
    const pp = cam(0, 0, zp); dustPuffs(pp.x, pp.y + 30 * pp.k, t, DOWN, pp.k * .8, 10990);
  }

  // ------------------------------------------------------------ G0 rain shower (seam from riso F, rain-soaked)
  function rainWash(t) {
    const t0 = G0; t = Math.max(t0, onTwos(t)); TB = Math.floor(t * 12);
    const dt = t - t0, wetk = 1 - smooth(inv(.1, 1.3, dt)), rainAmt = 1 - .75 * smooth(inv(.5, 1.4, dt));
    fx({ seed: 7.3, wet: .36 + 1.2 * wetk, runs: .9 * wetk });
    seamBackdrop(t, SEAMV * (t - 169), { sd: 1250, sky0: '#b9b3cf', sky1: '#f3c3a8', grass: '#cfe0b0', road: '#bdb3cf', tint: DUSK });
    const P = seamPlane(t, { hop: Math.abs(Math.sin(t * 4)) * 4, eyes: dt < .5 ? 'squeeze' : 'flat', mouth: 'flat', open: 0, blush: .6, spin: t * 10 });
    if (wetk > 0) { s.save(); s.globalAlpha = .5 * wetk; s.fillStyle = '#8f8aa8'; s.fillRect(-W, -H, W * 3, H * 3); s.restore(); } // grey rain wash, lifting off the colours
    rain(t, rainAmt);
    // drops bouncing off his roof
    const r = rng(2601); for (let i = 0; i < 10; i++) { const x = 640 + r() * 560, ph = wrapv(t * 3 + r(), 1); const RY = 440 + (x - 640) * -.02; seedAt(2610 + i); k.globalAlpha = (1 - ph) * rainAmt; ink([[x, RY - ph * 40], [x - 18 - ph * 20, RY - 18 - ph * 70]], false, 3, { col: '#6f7aa8' }); ink([[x, RY - ph * 40], [x + 18 + ph * 20, RY - 18 - ph * 70]], false, 3, { col: '#6f7aa8' }); k.globalAlpha = 1; }
  }

  // ------------------------------------------------------------ G6 the toll booth: INSERT COIN (seam to 16-bit H)
  // 186.30 he pulls up, gate down, the sign reads INSERT COIN (on screen 186.30-187.50)
  // 187.00 a coin pops out of a hatch on his side, arcs with a glint, CLINKS into the slot at 187.46 (drum hit)
  // 187.50 the sign flips to OK!, 187.55-187.90 the gate lifts, he rolls on; 187.90- pixels spread from the slot
  const TOLL = 186.30, POP = 187.0, CLINK = 187.46;
  function toll(t) {
    t = onTwos(t); TB = Math.floor(t * 12);
    const T = G1 - 1 / 24, stop = ease.out(inv(TOLL, 186.62, t)), go = ease.in(inv(187.85, T, t));
    const x = 1700 + 320 * (1 - stop) - 260 * go;                       // the booth glides in, stops at his nose, then he rolls on
    const fl = inv(187.5, 187.66, t), sq = fl > 0 && fl < 1 ? Math.abs(Math.cos(fl * Math.PI)) : 1, sign = t < 187.58 ? 'insert' : 'ok';
    const arm = ease.inOut(inv(187.55, 187.9, t)), pr = .03 + 1.25 * ease.in(inv(187.9, T, t)) * (t >= 187.9 ? 1 : 0);
    fx({ seed: 11.2, wet: .33, pixR: t >= 187.9 ? pr : 0, pixB: 16, pixC: [(x - 150) / W, 552 / H] });
    seamBackdrop(t, SEAMV * (t - 169) + 320 * stop - 260 * go - SEAMV * Math.max(0, Math.min(t, 186.85) - TOLL) * 0, { sd: 1270, sky0: '#c9b0e0', sky1: '#f3b9a0', grass: '#d8e4b0', road: '#c5bad4', tint: DUSK });
    tollBooth(x, t, sign, sq, arm);
    const ok = t >= 187.58;
    const P = seamPlane(t, { hop: Math.sin(t * 3) * 3 + hit(t, CLINK, 8) * 10, eyes: ok ? 'happy' : t > POP ? 'wide' : 'dot', look: .9, lookY: t > POP && !ok ? -.6 : -.2, mouth: ok ? 'smile' : 'o', open: 0, spin: t * (6 + 10 * go) });
    // the hatch on his flank and the coin's arc (screen space; seam framing keeps him fixed)
    const hx = 940 + 40 * SEAM_K, hy = SEAM_GY - 236 * SEAM_K, hatch = smooth(inv(POP - .15, POP, t)) * (1 - smooth(inv(CLINK, CLINK + .3, t)));
    if (hatch > 0) { push(); tr(hx, hy); sc(1, hatch); seedAt(2700); shape(rrect(-30, -20, 60, 40, 8, 2700), '#e9dcc0', 4); inkFill(rrect(-22, -12, 44, 24, 6), '#3b3140'); pop(); }
    const u = inv(POP, CLINK, t);
    if (u > 0 && u < 1) { const sx0 = x - 150, sy0 = 552, cx = lerp(hx, sx0, u), cy = lerp(hy, sy0, u) - Math.sin(Math.PI * u) * 260; push(); tr(cx, cy); sc(Math.abs(Math.cos(t * 22)) * .8 + .2, 1); seedAt(2710); shape(ell(0, 0, 38, 38, 20), PAL.gold, 5); ink(ell(0, 0, 24, 24, 14), true, 3.5); pop();
      if (Math.abs(u - .5) < .2) { seedAt(2720); const g = 1 - Math.abs(u - .5) / .2, st = []; for (let j = 0; j < 8; j++) { const a = j / 8 * TAU, q = j % 2 ? 6 : 30 * g; st.push([cx + 24 + Math.cos(a) * q, cy - 24 + Math.sin(a) * q]); } shape(st, '#fff6c8', 3); } }
    popRing(x - 150, 552, t, CLINK, 60, PAL.gold, 2730);
  }

  chapter('verseG', G0 - .01, G1, [
    [G0 - .01, rainWash], [171.167, weary], [174.45, parade], [178.00, doos], [179.792, streaming], [183.40, wings], [186.30, toll],
  ]);
})();
