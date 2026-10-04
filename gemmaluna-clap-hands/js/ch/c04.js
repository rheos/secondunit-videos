// c04 · CHORUS 2 (SEC.c2 - SEC.v3): the steamer's boiler room. Door slam, pistons and whistle, gauges, then the hands;
// climb the spiral stair out through a hatch into the night.
(() => {
  const hex = (c) => c[0] === '#' ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.match(/[\d.]+/g).slice(0, 3).map(Number);   // '#rrggbb' or 'rgb(r,g,b)', so mixes nest
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(',')})`; };
  const COPPER = '#b0703c';

  function sparks(t, k, x, y, n, seed, spd = 800, life = .9, spread = TAU, a0 = 0, grav = 900) {
    const lt = t - k; if (lt < 0 || lt > life * 1.3) return;
    const r = rng(seed); f.save(); f.globalCompositeOperation = 'lighter'; f.lineCap = 'round';
    for (let i = 0; i < n; i++) { const a = a0 + (r() - .5) * spread, v = spd * (.35 + r() * .65), L = life * (.5 + r() * .7), g = 150 + r() * 90 | 0, w = 3 + r() * 5, u = lt / L; if (u >= 1) continue;
      const px = x + Math.cos(a) * v * lt, py = y + Math.sin(a) * v * lt + .5 * grav * lt * lt, vx = Math.cos(a) * v, vy = Math.sin(a) * v + grav * lt;
      f.strokeStyle = `rgba(255,${g},80,${1 - u})`; f.lineWidth = w; f.beginPath(); f.moveTo(px - vx * .045, py - vy * .045); f.lineTo(px, py); f.stroke(); }
    f.restore();
  }
  // embers drifting up the whole frame (a pure function of t)
  function embers(t, n, seed, a = 1) {
    f.save(); f.globalCompositeOperation = 'lighter'; f.lineCap = 'round';
    for (let i = 0; i < n; i++) { const h = hash(i * 13 + seed), sp = 180 + hash(i * 7 + seed) * 260, y = 2100 - ((t * sp + h * 2600) % 2600), x = hash(i * 31 + seed) * 1300 - 110 + Math.sin(t * 1.7 + i) * 50;
      f.strokeStyle = `rgba(255,${160 + (h * 80 | 0)},80,${a * (.4 + .6 * hash(i + seed * 3))})`; f.lineWidth = 3 + h * 4; f.beginPath(); f.moveTo(x, y); f.lineTo(x - Math.cos(t * 1.7 + i) * 8, y + 22); f.stroke(); }
    f.restore();
  }
  // the iron room: riveted plates, warm toward the floor
  function room(warm = .4) {
    s.fillStyle = vgrad(-200, 2100, [[0, C.deep], [.6, mix(C.deep, C.plum, .6)], [1, mix(C.plum, C.ruby, warm)]]); s.fillRect(-W, -H, W * 3, H * 3);
    for (let j = -1; j < 6; j++) for (let i = -1; i < 4; i++) { const x = i * 420 - 60 + (j % 2) * 210, y = j * 420 - 100;
      line([[x, y], [x + 420, y], [x + 420, y + 420]], mix(C.umber, C.deep, .3), 14);
      for (let q = 0; q < 4; q++) dot(x + 40 + q * 110, y + 30, 11, mix(C.olive, C.deep, .3)); }
  }
  const pipe = (pts, w = 46) => vine(s, pts, w, w * .8, COPPER);
  function puff(x, y, r, a, seed) { if (a <= .01 || r < 2) return; s.globalAlpha = clamp(a); shape(s, blobPts(x, y, r, r * .8, seed, .14, 28), C.cream, C.umber, 12); s.globalAlpha = 1; }
  // a spoked valve / fly wheel with whiplash spokes
  function wheel(cx, cy, R, ang, rim = C.ruby) {
    shape(s, circle(cx, cy, R, 60), null, C.umber, 34); vine(s, circle(cx, cy, R, 60).concat([[cx + R, cy]]), 18, 18, rim);
    for (let i = 0; i < 5; i++) { const a = ang + i / 5 * TAU; vine(s, cub([cx, cy], [cx + Math.cos(a) * R * .4, cy + Math.sin(a) * R * .4], [cx + Math.cos(a + .5) * R * .6, cy + Math.sin(a + .5) * R * .6], [cx + Math.cos(a + .35) * R * .95, cy + Math.sin(a + .35) * R * .95], 16), 16, 12, C.gold); }
    shape(s, circle(cx, cy, R * .16, 20), C.gold, C.umber, 12);
  }
  // a pressure gauge: a small Mucha halo with a needle; no numerals, just ticks
  function gauge(cx, cy, R, ang, lit, rot = 0) {
    halo(cx, cy, R, rot, lit);
    for (let i = 0; i <= 8; i++) { const a = -2.4 + i / 8 * 3; line([[cx + Math.cos(a) * R * .52, cy + Math.sin(a) * R * .52], [cx + Math.cos(a) * R * .64, cy + Math.sin(a) * R * .64]], C.umber, Math.max(6, R * .045)); }
    petal(s, cx, cy, ang, R * .62, R * .07, C.ruby, C.umber, Math.max(6, R * .04));
    shape(s, circle(cx, cy, R * .09, 16), C.gold, C.umber, 8);
    if (lit > .3) glowAt(cx, cy, R * 1.3, `rgba(255,190,110,${.2 * (lit - .3)})`);
  }

  // ---- shots ----
  // CLAP 5 (74.433): the furnace door slams on the clap, sparks burst round its rim; pull back over the riveted front.
  // On the sung "hands" the latch wheel spins and the slits spit sparks again
  function door(t, lt, dur) {
    const k = CLAPS[4], hk = HANDS[4], slam = hit(t, k, 9), cx = 540, cy = 1080;
    cam(cx + Math.sin(t * 70) * 22 * slam, cy + Math.cos(t * 63) * 16 * slam, kf(lt, [[0, 1.85], [1.7, 1.0]], ease.out));
    room(.5);
    // pipes curling up and away from the boiler, a puff at a joint on every beat
    pipe(whip([150, 1500], [-60, 1100], [120, 600], [-40, 300], .8, -1, 40)); pipe(whip([930, 1500], [1140, 1100], [960, 600], [1120, 300], .8, 1, 40));
    const bp = beatPulse(t, 5); puff(60, 820, 40 + 50 * (1 - bp), bp, lastBeat(t)); puff(1020, 820, 40 + 50 * (1 - bp), bp, lastBeat(t) + 1);
    // the riveted boiler front, whiplash brass appliqué
    shape(s, [[150, 1680], [150, 600], ...circle(540, 600, 390, 50).filter(([, py]) => py <= 600).sort((a, b) => a[0] - b[0]), [930, 600], [930, 1680]], C.olive, C.umber, 20);
    for (const d of [-1, 1]) vine(s, whip([540 + d * 360, 1640], [540 + d * 420, 1450], [540 + d * 300, 1420], [540 + d * 330, 1520], .8, d, 24), 18, 8, C.gold);
    gauge(330, 560, 95, -2.2 + .3 * bp + 1.3 * hit(t, k, 2), .2 + slam); gauge(750, 560, 95, -1.9 + .3 * bp + 1.3 * hit(t, k, 2), .2 + slam, 1);
    // the door: a brass halo of a door, rivets, curved slits glowing, a latch wheel
    const R = 330 * (1 + .035 * slam), glow = .45 + .5 * slam + .4 * hit(t, hk, 4);
    shape(s, circle(cx, cy, R * 1.06), C.umber, C.umber, 18);
    shape(s, circle(cx, cy, R), C.ochre, C.umber, 18);
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU; shape(s, circle(cx + Math.cos(a) * R * .9, cy + Math.sin(a) * R * .9, 14, 10), C.gold, C.umber, 7); }
    shape(s, circle(cx, cy, R * .8), mix(C.olive, C.deep, .3), C.umber, 14);
    for (let i = 0; i < 6; i++) { const a0 = i / 6 * TAU + .3, arc = [...Array(14)].map((_, j) => { const a = a0 + j / 13 * .75, rr = R * (.48 + .18 * Math.sin(j / 13 * Math.PI)); return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });
      vine(s, arc, 26, 14, mix(C.ruby, C.amber, glow)); const [gx, gy] = arc[7]; glowAt(gx, gy, 120, `rgba(255,160,70,${.5 * glow})`); }
    const la = ease.out(inv(hk, hk + .45, t)) * Math.PI * 1.2;
    wheel(cx, cy, R * .3, la + .2, C.gold);
    // light leaking round the rim, and the burst of sparks
    f.save(); f.globalCompositeOperation = 'lighter'; f.lineWidth = 46; f.strokeStyle = `rgba(255,160,70,${.15 + .8 * slam})`; f.beginPath(); f.arc(cx, cy, R * 1.04, 0, TAU); f.stroke(); f.restore();
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + .2; sparks(t, k, cx + Math.cos(a) * R * 1.05, cy + Math.sin(a) * R * 1.05, 12, 40 + i, 1600, 1.1, 1.1, a, 800); }
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .65; sparks(t, hk, cx + Math.cos(a) * R * .55, cy + Math.sin(a) * R * .55, 6, 80 + i, 700, .7, 1.2, a, 900); }
    glowAt(cx, cy, 700, `rgba(255,170,90,${.35 * slam})`);
    // the stoker revealed by the pull-back: the millionaire, hat askew, sweating, still shovelling on the beat
    const b = beatPhase(t), c = Math.floor(b / 2), r = b - c * 2;
    const J = millionaire(t, 230, 1960, 760, { ph: c + (r < 1 ? r * .62 : .62 + (r - 1) * .38), facing: 1, style: { hatTilt: -.35 } });
    for (let i = 0; i < 3; i++) { const u = (t * 1.4 + i / 3) % 1, d = i % 2 ? 1 : -1; petal(s, J.hc[0] + d * (40 + u * 90), J.hc[1] - 40 + u * u * 160 - u * 60, Math.PI / 2 + d * .4, 26, 10, C.cream, C.umber, 7); }
    glowAt(J.hc[0] + 80, J.hc[1], 200, 'rgba(255,150,70,.25)');
    embers(t, 30, 3, .6);
    border(t, 1);
  }
  // the engine: three pistons hammering on alternate beats before a turning flywheel; a brass lily whistle above.
  // CLAP 6 (78.867): all three slam at once and the whistle blows steam in whiplash spirals
  function pistonU(t, i) {
    const k = CLAPS[5], b = lastBeat(t), t0 = FEAT.beats[b] || 0, t1 = FEAT.beats[b + 1] || t0 + .5, ph = clamp((t - t0) / (t1 - t0));
    const two = (b + i) % 2 === 0 ? ph / 2 : .5 + ph / 2, uBeat = 1 - Math.pow(Math.abs(2 * two - 1), 2);
    const uClap = t < k - .1 ? 1.25 * ease.out(inv(k - .42, k - .1, t)) : t < k ? 1.25 * (1 - ease.in(inv(k - .1, k, t))) : 0;
    const w = smooth(inv(k - .45, k - .3, t)) * (1 - smooth(inv(k + .12, k + .35, t)));
    return lerp(uBeat, uClap, w);
  }
  function engine(t) {
    const k = CLAPS[5], hk = HANDS[5], strike = hit(t, k, 8);
    room(.55);
    wheel(540, 1050, 420, (t - SEC.c2) * TAU * .5, C.ruby);
    // pipe up to the whistle
    pipe(cub([1250, 700], [950, 980], [620, 900], [560, 640], 30), 50);
    // pistons
    for (let i = 0; i < 3; i++) { const x = 270 + i * 270, u = pistonU(t, i), ch = 1180 - 300 * u;
      shape(s, [[x - 30, ch], [x - 30, 1260], [x + 30, 1260], [x + 30, ch]], C.parch, C.umber, 14);
      shape(s, [[x - 85, ch - 70], [x + 85, ch - 70], [x + 85, ch], [x - 85, ch]], C.olive, C.umber, 14);
      for (const d of [-1, 1]) vine(s, whip([x + d * 70, ch - 70], [x + d * 90, ch - 120], [x + d * 50, ch - 150], [x + d * 80, ch - 170], .7, d, 14), 14, 6, C.gold);
      shape(s, [[x - 100, 1260], [x + 100, 1260], [x + 100, 1700], [x - 100, 1700]], C.gold, C.umber, 18);
      for (const yy of [1330, 1600]) line([[x - 100, yy], [x + 100, yy]], C.umber, 16);
      if (u < .05) glowAt(x, 1250, 160, `rgba(255,200,120,${.5 * (1 - u / .05) * (strike > .1 ? 1 : .4)})`); }
    sparks(t, k, 540, 1260, 50, 9, 900, .7, 2.6, -Math.PI / 2, 1200);
    // the whistle: a brass lily, mouth up; it shivers while it blows
    const blow = clamp(inv(k, k + .05, t)) * (1 - inv(k + .9, k + 1.6, t)) + .6 * clamp(inv(hk, hk + .05, t)) * (1 - inv(hk + .4, hk + 1.0, t)), wx = 540 + Math.sin(t * 90) * 5 * blow;
    shape(s, [[wx - 30, 640], [wx - 34, 520], [wx + 34, 520], [wx + 30, 640]], C.ochre, C.umber, 14);
    shape(s, [...cub([wx - 34, 520], [wx - 40, 430], [wx - 120, 380], [wx - 140, 330], 16), ...cub([wx + 140, 330], [wx + 120, 380], [wx + 40, 430], [wx + 34, 520], 16)], C.gold, C.umber, 16);
    for (let i = 0; i < 3; i++) petal(s, wx, 520, -Math.PI / 2 + (i - 1) * .5, 150, 30, C.ochre, C.umber, 8);
    // steam in whiplash spirals, then puffs rising and thinning
    const su = ease.out(inv(k, k + .55, t)), fade = 1 - inv(k + 1.2, k + 2.1, t);
    if (t >= k && fade > 0) { s.globalAlpha = fade;
      for (let i = 0; i < 6; i++) { const d = i % 2 ? 1 : -1, sp = 1 + (i >> 1) * .5;
        vine(s, whip([wx, 330], [wx + d * 30 * sp, 230], [wx + d * 120 * sp, 200 - i * 15], [wx + d * 190 * sp, 120 - i * 25], 1.5, d, 30), 46, 18, C.cream, su); }
      s.globalAlpha = 1;
      for (let i = 0; i < 5; i++) { const lt = t - k - i * .12; if (lt > 0) puff(wx + Math.sin(i * 2.3) * 160, 300 - lt * 260, 50 + lt * 110, fade * (1 - lt / 2.2), 70 + i); }
      glowAt(wx, 330, 360, `rgba(255,240,215,${.5 * hit(t, k, 2.5)})`); }
    if (t >= hk) for (let i = 0; i < 3; i++) { const lt = t - hk - i * .1; if (lt > 0) puff(wx + (i - 1) * 120, 300 - lt * 380, 40 + lt * 90, (1 - lt / 1.6) * .9, 90 + i); }
    embers(t, 26, 5, .5);
  }
  function pistons(t, lt, dur) { cam(560, kf(lt, [[0, 1250], [dur, 1150]]), kf(lt, [[0, 1.08], [dur, 1.0]])); engine(t); border(t, 1); }
  function whistle(t, lt, dur) { const sk = hit(t, CLAPS[5], 8); cam(540 + Math.sin(t * 70) * 16 * sk, kf(lt, [[0, 900], [.5, 760], [dur, 650]]) + Math.cos(t * 61) * 12 * sk, kf(lt, [[0, .98], [dur, .9]])); engine(t); border(t, 1); }
  // CLAP 7 (83.033): a wall of gauges, small Mucha halos; the needles twitch on the beats, then all jump and flare on the clap
  function gauges(t, lt, dur) {
    const k = CLAPS[6], hk = HANDS[6], fl = hit(t, k, 2.2) * (t >= k ? 1 : 0), fl2 = hit(t, hk, 3) * (t >= hk ? 1 : 0);
    cam(540 + Math.sin(t * 70) * 10 * hit(t, k, 9), 960, kf(lt, [[0, 1.04], [dur, 1.18]]), kf(lt, [[0, -.02], [dur, .02]]));
    room(.35);
    const G = [[540, 960, 300], [240, 520, 170], [840, 520, 170], [230, 1420, 170], [850, 1420, 170]];
    for (const [x, y] of G.slice(1)) pipe(whip([540, 960], [lerp(540, x, .4), lerp(960, y, .1)], [lerp(540, x, .7), lerp(960, y, .9)], [x, y], .3, x < 540 ? -1 : 1, 24), 40);
    pipe(cub([540, 1260], [520, 1500], [600, 1700], [560, 2100], 20), 54);
    G.forEach(([x, y, R], i) => {
      const jump = 2.2 * ease.back(inv(k, k + .2, t)) * (1 - .7 * ease.inOut(inv(k + .4, k + 2, t))) + .7 * ease.back(inv(hk, hk + .15, t)) * (1 - ease.inOut(inv(hk + .3, hk + 1.2, t)));
      const ang = -2.3 + i * .12 + .42 * beatPulse(t, 6) * (i % 2 ? 1 : .7) + .06 * snoise(t * 5 + i * 3, i) + .25 * inv(81, 83, t) + jump;
      gauge(x, y, R, Math.min(ang, .7 + .05 * Math.sin(t * 40)), .1 + .55 * fl + .35 * fl2, t * .05 * (i % 2 ? 1 : -1));
    });
    glowAt(540, 960, 800, `rgba(255,190,110,${.15 * fl})`);
    embers(t, 24, 7, .5);
    border(t, 1);
  }
  // the valve wheels spin a turn on every beat; the furnace glow and the embers climb toward the hands
  function valves(t, lt, dur) {
    cam(540, kf(lt, [[0, 1150], [dur, 900]]), kf(lt, [[0, 1.05], [dur, 1.0]]));
    room(.5 + .4 * inv(0, dur, lt));
    pipe(whip([-100, 600], [300, 760], [600, 600], [1200, 760], .2, 1, 30), 56); pipe(whip([-100, 1500], [400, 1300], [700, 1600], [1200, 1350], .2, -1, 30), 56);
    const b = lastBeat(t), bt = FEAT.beats[b] || 0, turn = b + ease.out(clamp((t - bt) / .22));
    wheel(300, 680, 210, turn * TAU / 5, C.ruby); wheel(800, 960, 240, -turn * TAU / 5, C.gold); wheel(420, 1420, 260, turn * TAU / 5 + .3, C.ruby);
    // a hiss of steam from the joints on each beat
    const bp = beatPulse(t, 4);
    for (const [x, y, d] of [[620, 640, 1], [180, 1330, -1], [960, 1430, 1]]) for (let j = 0; j < 3; j++) { const u = 1 - bp; puff(x + d * (40 + j * 70) * (.4 + u), y - (30 + j * 50) * (.4 + u), 26 + j * 16 + u * 30, bp * 1.6 - j * .15, b * 3 + j); }
    glowAt(540, 2000, 1100, `rgba(255,130,60,${.25 + .3 * inv(0, dur, lt)})`);
    embers(t, 50, 9, .7 + .3 * inv(0, dur, lt));
    border(t, 1);
  }
  // CLAP 8 (86.8): the hands, big and centred before the open furnace, in sparks and steam; then they rise away up the stair
  function hands(t, lt, dur) {
    const k = CLAPS[7], hk = HANDS[7];
    cam(540, kf(lt, [[0, 900], [dur, 860]]), kf(lt, [[0, 1.1], [.45, 1.0], [dur, .97]], ease.out));
    room(.8);
    // the furnace mouth behind, wide open: a glowing ring
    shape(s, circle(540, 860, 560), C.ochre, C.umber, 20);
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; shape(s, circle(540 + Math.cos(a) * 515, 860 + Math.sin(a) * 515, 16, 10), C.gold, C.umber, 7); }
    s.fillStyle = rgrad(540, 860, 0, 470, [[0, C.amber], [.6, mix(C.amber, C.ruby, .45)], [1, C.ruby]]); P(s, circle(540, 860, 470)); s.closePath(); s.fill(); shape(s, circle(540, 860, 470), null, C.umber, 18);
    glowAt(540, 860, 640, `rgba(255,150,70,${.22 + .1 * hit(t, k, 2.5)})`);
    // steam billowing up both sides, blown wide on the clap
    const burst = ease.out(inv(k, k + .6, t));
    for (let i = 0; i < 10; i++) { const d = i % 2 ? 1 : -1, ph = ((t * .5 + hash(i)) % 1), y = 1700 - ph * 1200, r = 70 + ph * 120;
      puff(540 + d * (420 + Math.sin(ph * 5 + i) * 40 + burst * 120 * (1 - ph)), y, r, (1 - ph) * 1.4, 200 + i); }
    const rise = 1700 * ease.in(inv(k + .65, k + 1.0, t));
    clapPair(t, 540, 720 - rise, 320, k);
    for (const [kk, n, sd] of [[k, 150, 11], [hk, 70, 12]]) sparks(t, kk, 540, 780 - rise * .3, n, sd, 1500, 1.2, TAU, 0, 600);
    embers(t, 40, 11, .8);
    border(t, 1);
  }
  // 87.8 (instrumental): up the spiral iron stair, turning as we climb, out through the round hatch into the rainy night
  function stair(t, lt, dur) {
    cam(540, 960, 1);
    const p = inv(0, dur, lt), cx = 540, cy = 880, q = .9, N = 26, R0 = 1600, rh = R0 * Math.pow(q, N), Z = Math.pow(1200 / rh, ease.in(p) * .55 + p * .45), rot = p * 2.6;
    s.fillStyle = rgrad(cx, cy, 0, 1300, [[0, C.deep], [.6, mix(C.deep, C.plum, .5)], [1, mix(C.plum, C.ruby, .6)]]); s.fillRect(-W, -H, W * 3, H * 3);
    // the hatch: rain and night sky, a few stars
    const hr = rh * Z;
    s.fillStyle = vgrad(cy - hr, cy + hr, [[0, '#151d2e'], [1, C.dusk]]); P(s, circle(cx, cy, hr, 60)); s.closePath(); s.fill();
    f.save(); P(f, circle(cx, cy, hr, 60)); f.closePath(); f.clip(); rain(t, 160, 51, .55, 2400, .15);
    for (let i = 0; i < 9; i++) glowAt(cx + (hash(i) - .5) * hr * 1.4, cy + (hash(i + 40) - .5) * hr * 1.4, 18 + hr * .03, 'rgba(220,230,255,.6)'); f.restore();
    // the treads, farthest first, and the railing spiralling down to us
    const rail = [];
    for (let i = N - 1; i >= 0; i--) { const r1 = R0 * Math.pow(q, i) * Z, r0 = r1 * .7, a = i * .55 + rot; if (r0 > 2400) continue;
      const pts = [...Array(9)].map((_, j) => { const aa = a + j / 8 * .5; return [cx + Math.cos(aa) * r1, cy + Math.sin(aa) * r1]; }).concat([...Array(9)].map((_, j) => { const aa = a + .5 - j / 8 * .5; return [cx + Math.cos(aa) * r0, cy + Math.sin(aa) * r0]; }));
      const near = clamp(1 - i / N);
      shape(s, pts, mix(mix(C.ochre, C.gold, near * .5), C.dusk, (1 - near) * .4), C.umber, 14);
      line([[cx + Math.cos(a + .25) * r1, cy + Math.sin(a + .25) * r1], [cx + Math.cos(a + .25) * r1 * 1.12, cy + Math.sin(a + .25) * r1 * 1.12]], C.umber, 14); }
    for (let i = 0; i < N * 4; i++) { const u = i / 4, r = R0 * Math.pow(q, u) * Z * 1.12; if (r < 4000) rail.push([cx + Math.cos(u * .55 + rot + .25) * r, cy + Math.sin(u * .55 + rot + .25) * r]); }
    line(rail, C.umber, 26); line(rail, C.olive, 12);
    // the hatch rim, its lid flung open
    shape(s, circle(cx, cy, hr * 1.12, 60), null, C.umber, 30); shape(s, circle(cx, cy, hr * 1.06, 60), null, C.ochre, 14);
    shape(s, blobPts(cx + hr * 1.5, cy - hr * .9, hr * .3, hr * .9, 3, .02, 30, .5), C.olive, C.umber, 14);
    glowAt(cx, cy, hr * 1.4, `rgba(200,215,255,${.15 + .1 * p})`);
    glowAt(cx, 1900, 900, `rgba(255,130,60,${.4 * (1 - p)})`);
    embers(t, 30, 13, .6 * (1 - p));
    border(t, 1);
  }
  chapter('c04', SEC.c2, SEC.v3, [
    [SEC.c2, door],
    [76.6, pistons],
    [CLAPS[5] - .45, whistle],
    [81.0, gauges],
    [84.6, valves],
    [CLAPS[7] - .45, hands],
    [87.8, stair],
  ], { fx: PAINT });
})();
