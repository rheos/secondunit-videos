// js/ch/c2.js · FOG (25.833 - 38.750) · verse 1 · look: sepia worn-film oil
// One location: the fog flats before dawn, bare ground and dead trees under a pale low glow. His board #25
// is the target: the guitar standing close in the foreground, him further back, forced perspective.
// Opens inside c1's pouring moon smoke (xin .8, ink -> sepia); ends tearing the frame apart like an old
// photograph on "unglued", the sandstone of c3 behind it.
(() => {
  const A = 25.833, Z = 38.75;
  const tAir = when('air', 26), tBends = when('bends', 27), tSmoke = when('smoke', 28), tTwists = when('twists', 28.3) + .2;
  const tThousand = when('thousand', 29.5), tVoices = when('voices', 30), tMist = when('mist', 31.5);
  // the aligner runs early on these: onsets read off the vocal stem
  const tReach = when('reach', 32.8) + .08, tThem = when('them', 33.4), tPull = when('pull', 34.2) + .17, tThrough = when('through', 34.9) + .23;
  const tUnglued = when('unglued', 37.9);
  const S2 = tSmoke - .1, S3 = tThousand - .05, S4 = 32.41, S5 = tPull + .2, S6 = 36.2;

  const HZ = 1210;
  const C = { sky0: '#3a2e23', sky1: '#8a7457', sky2: '#cfbb98', g0: '#95805f', g1: '#2a2017', bank: '#1b140f', fog: '216,200,169' };
  const RIM = 'rgba(255,236,205,.8)';

  // "bends": the air warps around him, lines above him bow up, lines below bow down
  function bendAt(x, y, bend, bx, by, t) {
    if (bend <= 0) return 0;
    const dx = (x - bx) / 420;
    return bend * (Math.sign(y - by) * 120 * Math.exp(-dx * dx) + Math.sin(x * .012 + t * 4) * 16);
  }
  function farRidge(t, hz, bend, bx, by) {
    for (const [off, hh, c, seed] of [[-30, 300, '#8d795c', 12], [0, 120, '#6f5c45', 13]]) {
      s.fillStyle = c; s.beginPath(); s.moveTo(-700, hz + 300);
      for (let x = -700; x <= 2620; x += 24) { const y = hz + off - hh * (noise1(x * .0021, seed) * .85 + noise1(x * .009, seed + 3) * .25); s.lineTo(x, y + bendAt(x, y, bend, bx, by, t)); }
      s.lineTo(2620, hz + 300); s.fill();
    }
  }
  // translucent fog strips drifting across the flats (bend lets the air warp them)
  function fogBands(t, y0, y1, n, seed, a, bend = 0, bx = SC, by = 1000, col = C.fog) {
    if (a <= .01) return;
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const yc = lerp(y0, y1, r()), th = 40 + r() * 100, sp = 6 + r() * 14, off = r() * 50, al = a * (.5 + r() * .5), up = [], lo = [];
      for (let x = -700; x <= 2620; x += 60) {
        const w = snoise(x * .003 + off - t * sp * .01, seed + i) * th * .5, b = bendAt(x, yc, bend, bx, by, t);
        up.push([x, yc + w + b - th * .5]); lo.push([x, yc + w + b + th * .5 * (.5 + .5 * noise1(x * .01 + i, seed))]);
      }
      s.fillStyle = `rgba(${col},${al})`; s.beginPath(); up.forEach(([x, y], k) => k ? s.lineTo(x, y) : s.moveTo(x, y));
      for (let k = lo.length - 1; k >= 0; k--) s.lineTo(lo[k][0], lo[k][1]); s.fill();
    }
  }
  function world(t, o = {}) {
    const { bend = 0, bx = SC, by = 1000, glowX = SC + 260, hz = HZ, g0 = C.g0, g1 = C.g1 } = o;
    sky(C.sky0, C.sky1, C.sky2, hz);
    clouds(t, 17, 150, hz - 420, 'rgba(92,74,56,.55)', 7, 9); clouds(t, 18, 300, hz - 300, 'rgba(184,164,130,.45)', 6, 12);
    glow(glowX, hz - 120, 1000, 'rgba(255,226,180,.10)'); glow(glowX, hz - 70, 360, 'rgba(255,238,210,.14)');
    farRidge(t, hz, bend, bx, by);
    ground(hz, g0, g1);
    fogBands(t, hz - 90, hz + 240, 7, 11, .45, bend, bx, by);
  }
  function deadTree(x, y, h, c, seed) {
    const r = rng(seed);
    const br = (x0, y0, ang, len, w, d) => { const x1 = x0 + Math.sin(ang) * len, y1 = y0 - Math.cos(ang) * len; taper(s, [x0, y0], [x1, y1], w, w * .62, c);
      if (d <= 0) return; const k = r() > .55 ? 3 : 2; for (let i = 0; i < k; i++) br(x1, y1, ang + (i - (k - 1) / 2) * (.5 + r() * .4) + (r() - .5) * .3, len * (.6 + r() * .16), w * .62, d - 1); };
    br(x, y, (r() - .5) * .15, h * .36, h * .035, 4);
  }
  // a wisp of pale smoke rising like breath, pulses travelling up it. Never a figure, never a face.
  function wisp(t, x, y, h, a, seed, sc = 1) {
    if (a <= .01 || h < 4) return; const n = 14; let px = x, py = y;
    for (let k = 0; k <= n; k++) { const u = k / n;
      const wx = x + snoise(u * 2.6 + t * .5 + seed, 81) * (40 + h * .3) * u * sc + Math.sin(u * 6 + t * 2.2 + seed) * (18 + h * .06) * u * sc, wy = y - u * h;
      const puff = .5 + .5 * Math.sin(u * 9 - t * 5 + seed * 3), al = a * (1 - u) * (u < .15 ? u / .15 : 1) * puff;
      glow(wx, wy, (20 + 60 * u) * sc, `rgba(240,228,205,${al * .14})`);
      if (k) { stroke(s, [[px, py], [wx, wy]], `rgba(214,200,174,${al * .45})`, (14 + 56 * u) * sc); stroke(s, [[px, py], [wx, wy]], `rgba(240,230,208,${al * .7})`, (5 + 16 * u) * sc); }
      px = wx; py = wy; }
  }
  // c1's moon smoke pouring down and filling the frame; k = density
  function smokePour(t, k) {
    if (k <= .01) return; const r = rng(7);
    s.fillStyle = `rgba(160,150,132,${.95 * k})`; s.fillRect(-900, -900, 3800, 3800);
    for (let i = 0; i < 22; i++) { const x = -300 + r() * 2500, sp = .25 + r() * .2, ph = r(), R = 240 + r() * 380, y = -500 + ((ph + t * sp * .35) % 1) * 2600, tone = r();
      const c = tone > .66 ? '206,192,164' : tone > .33 ? '150,134,108' : '84,70,54';
      s.fillStyle = `rgba(${c},${.7 * k})`; s.beginPath(); s.ellipse(x + snoise(t * .3 + i, 5) * 90, y, R, R * .7, snoise(i, 6), 0, TAU); s.fill(); }
    glow(SC + 200, 700, 900, `rgba(235,222,198,${.06 * k})`);
  }
  // his black Les Paul standing on its end: single-cut body, cream binding, headstock at the top; (x, y) = the base
  function standingGuitar(x, y, hg, lean = 0) {
    const u = hg / 100; s.save(); s.translate(x, y); s.rotate(lean);
    const P_ = (a, b) => [a * u, -b * u];
    const body = () => { s.beginPath(); s.moveTo(...P_(0, 0));
      s.bezierCurveTo(...P_(-10, 0), ...P_(-16.5, 4), ...P_(-16.5, 12)); s.bezierCurveTo(...P_(-16.5, 18), ...P_(-12.5, 21), ...P_(-12.2, 25));
      s.bezierCurveTo(...P_(-12, 30), ...P_(-13, 35), ...P_(-8.5, 38.5)); s.quadraticCurveTo(...P_(-5, 40.5), ...P_(-2.4, 40));
      s.lineTo(...P_(2.4, 40)); s.quadraticCurveTo(...P_(5, 43.5), ...P_(6.8, 42)); // the cutaway horn
      s.bezierCurveTo(...P_(7.5, 38), ...P_(4.5, 34), ...P_(8, 31)); s.bezierCurveTo(...P_(11.5, 28.5), ...P_(12.4, 26.5), ...P_(12.2, 23.5));
      s.bezierCurveTo(...P_(12, 19.5), ...P_(16.5, 18), ...P_(16.5, 11)); s.bezierCurveTo(...P_(16.5, 4), ...P_(10, 0), ...P_(0, 0)); s.closePath(); };
    s.fillStyle = mixHex('#15130e', P.binding, .55); body(); s.fill();                // cream binding shows as a rim
    s.save(); s.translate(0, -1.2 * u); s.scale(.93, .94); s.translate(0, .1 * u); s.fillStyle = '#1b1b1e'; body(); s.fill(); s.restore();
    // neck with binding, rosewood board, headstock (open-book top) with tuners
    s.fillStyle = mixHex('#15130e', P.binding, .55); s.fillRect(-2.5 * u, -86 * u, 5 * u, 47 * u);
    s.fillStyle = '#3a2618'; s.fillRect(-1.9 * u, -86 * u, 3.8 * u, 47 * u);
    for (let k = 0; k < 8; k++) s.fillRect(-.9 * u, -(46 + k * 4.8) * u, 1.8 * u, .9 * u);
    s.fillStyle = '#141416'; s.beginPath(); s.moveTo(...P_(-2.4, 86)); s.lineTo(...P_(-4, 90)); s.lineTo(...P_(-3.6, 99)); s.quadraticCurveTo(...P_(0, 98), ...P_(3.6, 99.5)); s.lineTo(...P_(4, 90)); s.lineTo(...P_(2.4, 86)); s.fill();
    for (let k = 0; k < 3; k++) for (const d of [-1, 1]) dot(s, d * 4.6 * u, -(90.5 + k * 3) * u, .8 * u, P.hw);
    // pickups, bridge, knobs
    s.fillStyle = '#0c0c0e'; s.fillRect(-4 * u, -33 * u, 8 * u, 3.4 * u); s.fillRect(-4 * u, -20 * u, 8 * u, 3.4 * u);
    s.fillStyle = P.hw; s.fillRect(-4.2 * u, -15 * u, 8.4 * u, .9 * u);
    for (let k = 0; k < 4; k++) dot(s, (7 + (k % 2) * 3.2) * u, -(7 + (k >> 1) * 3.4) * u, 1 * u, '#b9ad8c');
    s.restore();
    stroke(f, [[x + 16.5 * u, y - 12 * u], [x + 12.2 * u, y - 24 * u], [x + 8 * u, y - 31 * u], [x + 2.6 * u, y - 45 * u], [x + 2.6 * u, y - 86 * u]], 'rgba(255,236,205,.2)', .6 * u);
  }
  // the dark foreground bank his guitar stands on
  function bank(t) {
    s.fillStyle = C.bank; s.beginPath(); s.moveTo(-700, 2600);
    for (let x = -700; x <= 2620; x += 30) { const d = (x - 640) / 360; s.lineTo(x, 1540 - 110 * Math.exp(-d * d) + Math.max(0, x - 950) * .11 + snoise(x * .02, 44) * 14); }
    s.lineTo(2620, 2600); s.fill();
    const r = rng(45); for (let i = 0; i < 16; i++) { const x = 250 + r() * 900, d = (x - 640) / 360, y = 1545 - 110 * Math.exp(-d * d) + Math.max(0, x - 950) * .11;
      for (let k = -2; k <= 2; k++) stroke(s, [[x, y + 6], [x + k * 9 + Math.sin(t * 1.5 + i) * 5, y - 26 - r() * 30]], '#241a12', 4); }
  }

  // 1 · out of the pouring smoke: the guitar stands close, him further back in the fog; on "bends" the air warps
  function loom(t, lt, dur) {
    const z = kf(lt, [[0, 1.0], [dur, 1.09]], ease.inOut);
    frame(kf(lt, [[0, SC - 50], [dur, SC + 40]]), kf(lt, [[0, 850], [dur, 975]], ease.inOut), pick(z, z * .8), kf(lt, [[0, -.012], [dur, .01]]));
    const hx = 1180, hy = 1345, bend = ease.out(inv(tBends - .2, tBends + .35, t)) * (1 - .55 * ease.inOut(inv(tBends + .6, S2, t)));
    world(t, { bend, bx: hx, by: hy - 260, glowX: hx + 140 });
    deadTree(300, 1238, 170, '#6d5a44', 3); deadTree(1600, 1226, 130, '#76624a', 5);
    const o = { turn: -.35, guitar: 'none', arms: 'down', wind: .8, lit: .04, rim: RIM };
    occlude(() => wyrd(t, hx, hy, 470, { ...o, sil: true, g: f }));
    wyrd(t, hx, hy, 470, o);
    fogBands(t, 1290, 1420, 5, 21, .38, bend, hx, hy - 260);
    // the air bends: lens rings shimmer out from him
    for (let k = 0; k < 3; k++) { const age = t - tBends - k * .16; if (age <= 0 || age > 1.3) continue;
      const R = 160 + age * 780, pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, rr = R * (1 + .12 * snoise(a * 1.5 + t * 2 + k, 70)); pts.push([hx + Math.cos(a) * rr, hy - 260 + Math.sin(a) * rr * .72]); }
      stroke(f, pts, `rgba(255,238,210,${.06 * (1 - age / 1.3)})`, 18 + age * 40); }
    bank(t);
    standingGuitar(690, 1436, 1000, .04);
    smokePour(t, 1 - ease.inOut(inv(A + .3, tAir + .45, t)));
    paintSet({ flowK: 1.1 + bend * 1.3 });
  }

  // 2 · "twists": low angle, the smoke spirals up around him and wrings tight
  function twist(t, lt, dur) {
    const z = kf(lt, [[0, 1.2], [dur, 1.0]], ease.inOut);
    frame(kf(lt, [[0, SC + 150], [dur, SC - 90]]), pick(kf(lt, [[0, 1260], [dur, 960]], ease.inOut), kf(lt, [[0, 1110], [dur, 990]], ease.inOut)), pick(z, z * .62), kf(lt, [[0, .05], [dur, -.03]]));
    const x = SC, y = 1600, h = 1080;
    world(t, { glowX: SC + 320, hz: 1250 });
    deadTree(SC - 480, 1262, 280, '#5e4d3a', 8); deadTree(SC + 570, 1258, 210, '#6a5741', 9);
    fogBands(t, 1240, 1500, 5, 31, .35);
    const tw = ease.out(inv(tTwists - .1, tTwists + .9, t)), grow = .3 + .7 * ease.out(inv(tSmoke - .2, tSmoke + .9, t));
    const spin = t * .8 + tw * 3.6 + ease.out(inv(tSmoke - .1, tSmoke + .7, t)) * 1.2;
    const helix = (front) => { for (let k = 0; k < 2; k++) { let prev = null;
      for (let i = 0; i <= 72; i++) { const u = i / 72 * grow, bell = Math.sin(u / 1.0 * Math.PI);
        const ang = u * TAU * 1.7 + spin + k * Math.PI, R = (230 + 180 * bell) * (1 - .3 * tw * bell);
        const px = x + Math.cos(ang) * R + snoise(u * 3 + t * .4, 60 + k) * 30, py = y - 60 - u * h * 1.12 + Math.sin(ang) * R * .22;
        const w = 22 + 30 * bell, al = .7 * (u < .06 ? u / .06 : 1) * (1 - smooth(inv(grow - .18, grow, u)));
        if ((Math.sin(ang) > 0) === front && prev) { glow(px, py, w * 1.6, `rgba(238,226,204,${.05 * al})`); stroke(s, [prev, [px, py]], `rgba(222,208,184,${.6 * al})`, w * .8); }
        prev = [px, py]; } } };
    helix(false);
    const o = { turn: .18, guitar: 'none', arms: 'down', wind: .7 + .35 * tw, lit: .07, rim: RIM };
    occlude(() => wyrd(t, x, y, h, { ...o, sil: true, g: f }));
    wyrd(t, x, y, h, o);
    helix(true);
    fogBands(t, 1540, 1700, 4, 33, .4);
    paintSet({ flowK: 1.1 + tw * (1 - tw) * 3 });
  }

  // 3 · "voices": wide on the flats, pale wisps rise all over the fog like breath; "mist" rolls in
  function voices(t, lt, dur) {
    const z = kf(lt, [[0, .92], [dur, 1.0]], ease.inOut);
    frame(kf(lt, [[0, SC - 110], [dur, SC + 90]]), kf(lt, [[0, 1070], [dur, 990]]), pick(z, z * .74));
    world(t, { glowX: SC + 220, g0: '#6a5842', g1: '#1c150e' });
    for (const [tx, ty, th, c, sd] of [[180, 1250, 190, '#7a6650', 61], [560, 1300, 300, '#5a4938', 62], [1420, 1270, 240, '#6a573f', 63], [1760, 1340, 420, '#3e3226', 64], [-60, 1420, 560, '#2e241a', 65]]) deadTree(tx, ty, th, c, sd);
    const r = rng(77), wisps = [];
    for (let i = 0; i < 26; i++) { const dep = Math.sqrt(r()), wx = -250 + r() * 2420, wy = lerp(1235, 1720, dep), sc = lerp(.5, 1.5, dep), ts = tThousand - .15 + r() * 1.3, hh = 520 + r() * 620;
      wisps.push([dep, wx, wy, sc, ts, hh, i]); }
    const draw = (front) => { for (const [dep, wx, wy, sc, ts, hh, i] of wisps) { if ((wy > 1345) !== front) continue;
      const p = ease.out(inv(ts, ts + 1.6, t)), swell = 1 + .5 * hit(t, tVoices, 2.5);
      wisp(t, wx, wy, hh * sc * (.2 + .8 * p), (.2 + .8 * p) * swell * (.75 + .25 * Math.sin(t * 2.4 + i)), i * 7, sc); } };
    draw(false);
    wyrd(t, SC + 20, 1345 - 25 * lt / dur, 250 - 30 * lt / dur, { view: 'back', guitar: 'none', arms: 'down', walk: t * .55, wind: .8, lit: .05, rim: RIM });
    draw(true);
    // "mist": a fog bank rolls up from the flats and fills the frame for the reach
    const m = ease.inOut(inv(tMist - .4, S4 + .1, t));
    fogBands(t, 1150, 1750, 9, 91, .55 * m);
    if (m > .01) { s.fillStyle = vgrad(s, 700, 1700, [[0, 'rgba(216,200,169,0)'], [1, `rgba(216,200,169,${.8 * m})`]]); s.fillRect(-700, 700, 3400, 1800); }
  }

  // the fog wall: a luminous churning core where the pull comes from
  function fogWall(t, cx, cy, k = 1) {
    s.fillStyle = rgrad(s, cx, cy, 0, 1500, [[0, '#e3d4b6'], [.35, '#b9a383'], [1, '#4a3b2c']]); s.fillRect(-900, -900, 3800, 3800);
    const r = rng(123);
    for (let i = 0; i < 18; i++) { const a = r() * TAU, d = 250 + r() * 950, R = 180 + r() * 320, sp = (r() - .5) * .35, dark = r() > .55;
      const px = cx + Math.cos(a + t * sp) * d, py = cy + Math.sin(a + t * sp) * d * .7;
      s.fillStyle = dark ? 'rgba(112,94,72,.3)' : 'rgba(228,214,188,.35)'; s.beginPath(); s.ellipse(px, py, R, R * .6, a + t * sp, 0, TAU); s.fill(); }
    deadTree(cx - 640, cy + 520, 520, 'rgba(96,80,60,.55)', 71); deadTree(cx + 560, cy + 470, 380, 'rgba(110,92,70,.45)', 72);
    glow(cx, cy, 760, `rgba(255,238,210,${.15 * k})`); glow(cx, cy, 220, `rgba(255,246,228,${.25 * k})`);
  }
  // a tendril of fog from (a) that reaches (b), then coils around the limb running from b toward c
  function tendril(t, a, b, c, len, w, seed) {
    if (len <= .01) return; const pts = [], n = 36;
    const mid = [lerp(a[0], b[0], .5) + snoise(t * .7 + seed, 90) * 120, lerp(a[1], b[1], .5) + snoise(t * .6 + seed, 91) * 120];
    const lead = bez(a, mid, [lerp(mid[0], b[0], .6), lerp(mid[1], b[1], .6) - 60], b, 20);
    const dx = c[0] - b[0], dy = c[1] - b[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    for (let i = 0; i <= n; i++) { const v = i / n * .45, ang = v * TAU * 3.2 + t * 2.4 + seed, rr = w * Math.cos(ang);
      pts.push([b[0] + dx * v + nx * rr, b[1] + dy * v + ny * rr, Math.sin(ang) > 0]); }
    const all = lead.map(([x, y]) => [x, y, true]).concat(pts), m = Math.floor(all.length * clamp(len));
    for (let i = 1; i < m; i++) { const [x0, y0] = all[i - 1], [x1, y1, fr] = all[i], u = i / all.length, al = (fr ? .75 : .3) * (1 - u * .4);
      stroke(s, [[x0, y0], [x1, y1]], `rgba(226,212,188,${al * .6})`, 10 + 8 * (1 - u)); glow(x1, y1, 30, `rgba(245,234,212,${al * .12})`); }
  }
  // his gloved hand, back of the right hand toward us; wrist at (x, y), pointing along ang; spread 0 (curled) .. 1 (open)
  function glovedHand(x, y, ang, sc, spread) {
    const c = '#1a1512', c2 = '#2e251d';
    s.save(); s.translate(x, y); s.rotate(ang);
    s.fillStyle = c; s.beginPath(); s.moveTo(0, -.36 * sc); s.quadraticCurveTo(.5 * sc, -.5 * sc, .92 * sc, -.4 * sc); s.lineTo(.96 * sc, .38 * sc); s.quadraticCurveTo(.45 * sc, .5 * sc, 0, .36 * sc); s.fill();
    const fing = (bx, by, len, a0, w) => { const cu = (1 - spread) * 1.15 + .12; let p = [bx, by], a = a0;
      for (const [f, k] of [[.55, .45], [.45, .35], [.3, .2]]) { a += cu * k; const q = [p[0] + Math.cos(a) * len * f * sc, p[1] + Math.sin(a) * len * f * sc]; taper(s, p, q, w * sc, w * .82 * sc, c); p = q; w *= .85; } return p; };
    const tips = [[-.3, .95], [-.1, 1.08], [.11, 1.02], [.3, .8]].map(([oy, len], i) => fing(.9 * sc, oy * sc, len, (i - 1.5) * .14 * spread, .1));
    for (const [oy] of [[-.3], [-.1], [.11], [.3]]) dot(s, .9 * sc, oy * sc, .085 * sc, c2); // knuckles
    fing(.28 * sc, -.36 * sc, .6, -.95 - spread * .35, .12);
    s.restore();
    stroke(f, [[x + Math.cos(ang - 1.5) * .38 * sc, y + Math.sin(ang - 1.5) * .38 * sc], [x + Math.cos(ang - .45) * sc, y + Math.sin(ang - .45) * sc]], 'rgba(255,236,205,.28)', .06 * sc);
    return tips;
  }
  // over his shoulder: the back of the hat, the veil cloth falling behind, the duster's shoulders
  function backOfHat(x, y, sc) {
    s.fillStyle = '#1a140f'; s.beginPath(); s.moveTo(x - sc * 1.9, y + sc * 3); s.quadraticCurveTo(x - sc * 1.5, y + sc * .6, x, y + sc * .48); s.quadraticCurveTo(x + sc * 1.5, y + sc * .52, x + sc * 2.2, y + sc * 3); s.fill();
    s.fillStyle = '#0c0a09'; s.beginPath(); s.moveTo(x - sc * .42, y); s.lineTo(x + sc * .42, y); s.lineTo(x + sc * .48, y + sc * .62); s.lineTo(x - sc * .5, y + sc * .6); s.fill();
    s.fillStyle = '#211a15'; s.beginPath(); s.moveTo(x - sc * .4, y - sc * .06); s.bezierCurveTo(x - sc * .48, y - sc * .45, x - sc * .3, y - sc * .66, x, y - sc * .6); s.bezierCurveTo(x + sc * .3, y - sc * .66, x + sc * .48, y - sc * .45, x + sc * .4, y - sc * .06); s.fill();
    s.fillStyle = '#17110d'; s.beginPath(); s.ellipse(x, y - sc * .04, sc, sc * .19, -.04, 0, TAU); s.fill();
    stroke(f, bez([x - sc * .05, y - sc * .62], [x + sc * .3, y - sc * .68], [x + sc * .46, y - sc * .45], [x + sc * .42, y - sc * .1], 12), 'rgba(255,236,205,.3)', sc * .025);
    stroke(f, bez([x + sc * .3, y - sc * .2], [x + sc * .7, y - sc * .22], [x + sc * .95, y - sc * .16], [x + sc * 1.0, y - sc * .06], 10), 'rgba(255,236,205,.35)', sc * .03);
  }

  // 4 · "reach": over his shoulder, his gloved hand reaches into the fog wall; the fog coils round his wrist;
  // "pull": the fog yanks it forward and the camera lurches after
  function reach(t, lt, dur) {
    const lurch = ease.in(inv(tPull - .12, tPull + .22, t));
    const z = kf(lt, [[0, 1.0], [dur, 1.08]], ease.inOut) * (1 + .28 * lurch);
    frame(kf(lt, [[0, SC - 30], [dur, SC + 40]]) + lurch * 90, kf(lt, [[0, 1120], [dur, 1060]]) - lurch * 70, pick(z, z * .8));
    const core = [1250, 860];
    fogWall(t, core[0], core[1], 1 + .4 * lurch);
    const r = rng(9); for (let i = 0; i < 8; i++) wisp(t, 500 + r() * 1300, 1250 + r() * 400, 300 + r() * 300, .5, i * 11 + 3, 1.2);
    const ext = ease.back(inv(tReach - .15, tReach + .6, t));
    const wrist = [lerp(760, 1060, ext) + lt * 12 + lurch * 110, lerp(2020, 1040, ext) - lt * 8 - lurch * 90];
    const sh = [665, 1575], el = [lerp(sh[0], wrist[0], .5) + 30 + 90 * (1 - clamp(ext)), lerp(sh[1], wrist[1], .5) + 80 * (1 - ext * .55)];
    const wrap = ease.inOut(inv(tThem - .25, tPull, t));
    for (let k = 0; k < 3; k++) tendril(t, [core[0] + (k - 1) * 160, core[1] + (k - 1) * 90], [wrist[0] + (k - 1) * 12, wrist[1]], el, wrap * (1 - k * .12), 46 + k * 8, k * 3 + 1);
    backOfHat(300, 1330, 330);
    taper(s, sh, el, 92, 78, '#211a15'); taper(s, el, wrist, 78, 56, '#261e17');
    for (let k = 0; k < 5; k++) { const p = [lerp(el[0], wrist[0], .8 + k * .04), lerp(el[1], wrist[1], .8 + k * .04) + 40]; stroke(s, [p, [p[0] + 30 + snoise(t * 1.1 + k, 95) * 25, p[1] + 60 + k * 8]], '#1c1611', 14); }
    const d = [wrist[0] - el[0], wrist[1] - el[1]], L = Math.hypot(d[0], d[1]);
    stroke(f, [[sh[0] + d[1] / L * 80, sh[1] - Math.abs(d[0] / L) * 80], [el[0] + d[1] / L * 70, el[1] - Math.abs(d[0] / L) * 70], [wrist[0] + d[1] / L * 50, wrist[1] - Math.abs(d[0] / L) * 50]], 'rgba(255,236,205,.22)', 6);
    glovedHand(wrist[0], wrist[1], Math.atan2(d[1], d[0]) - .12 * (1 - ext), 128, ease.out(inv(tReach, tReach + .7, t)) * (1 - .35 * lurch));
    // the tendrils in front of the arm, once they have it
    for (let k = 0; k < 2; k++) tendril(t, [core[0] + 80, core[1] - 60 + k * 120], [wrist[0] - 20, wrist[1] + 10], el, wrap * .9, 58, k * 5 + 17);
    flash(hit(t, tPull, 5) * .12, '#f0e2c6');
  }

  // 5 · "through": behind him, arms out, the camera surges forward past his shoulder into the fog
  function through(t, lt, dur) {
    const q = ease.in(inv(tThrough - .3, S6 + .1, t)), side = smooth(inv(tThrough - .35, tThrough + .35, t));
    const z = (1 + .12 * ease.out(inv(S5, tThrough - .2, t))) * Math.pow(7, q);
    frame(lerp(SC, SC + 330, side), lerp(1010, 760, side), pick(z, z * .78));
    fogWall(t, SC + 150, 800, 1.2 * (1 - .8 * inv(tThrough, tThrough + .5, t)));
    const x = SC, y = 1600, h = 920;
    const hands = wyrd(t, x, y, h, { view: 'back', guitar: 'none', arms: 'out', wind: .9, lit: .05, rim: RIM });
    for (let k = 0; k < 2; k++) { const hd = k ? hands.handR : hands.handL; tendril(t, [SC + 150 + (k ? 200 : -200), 760], hd, hands.neck, .7 + .3 * inv(S5, tThrough, t), 36, k * 7 + 40); }
    fogBands(t, 1400, 1800, 5, 55, .4);
    // fog streams past the lens, then swallows the frame
    const sp = inv(tThrough - .25, tThrough + .2, t) * (1 - .6 * inv(tThrough + .5, S6, t)), wk = ease.inOut(inv(tThrough + .05, S6 - .05, t));
    for (const g of [s, f]) { g.save(); g.setTransform(.5, 0, 0, .5, 0, 0); }
    if (sp > .01) for (let i = 0; i < 60; i++) { const a = hash(i * 13 + 1) * TAU, ph = (hash(i * 7 + 2) + t * (1.6 + hash(i) * 1.2)) % 1, R = Math.hypot(W, H) * .6;
      const r0 = R * ph * ph, r1 = r0 + R * .18 * sp * (.4 + ph);
      stroke(s, [[W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0], [W / 2 + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1]], `rgba(226,212,188,${.45 * sp * ph})`, 10 + 40 * ph); }
    if (wk > .01) { s.globalAlpha = .93 * wk; s.fillStyle = '#d9cbb0'; s.fillRect(-10, -10, W + 20, H + 20); s.globalAlpha = 1; }
    for (const g of [s, f]) g.restore();
    if (wk > .01) glow(SC + 330, 760, 900 / z, `rgba(255,240,215,${.12 * wk})`);
  }

  // 6 · the singing close-up out of the fog; "unglued": the photograph tears apart, sandstone behind
  function closeup(t, lt, dur) {
    const x = SC, y = 2100, h = 1500, headY = y - h * .905;
    const zoom = kf(lt, [[0, 1.85], [dur, 2.15]], ease.inOut);
    frame(x + pick(10, 130) + kf(lt, [[0, -25], [dur, 20]]), headY + h * kf(lt, [[0, .07], [dur, .04]]) - pick(0, h * .03), pick(zoom, zoom * .62));
    s.fillStyle = vgrad(s, headY - 800, headY + 900, [[0, '#6a5640'], [.45, '#b39c79'], [1, '#d6c4a2']]); s.fillRect(x - 1800, headY - 1800, 3600, 3800);
    const lx = x + 340 + lt * 10, ly = headY - 140;
    glow(lx, ly, 720, 'rgba(255,230,190,.16)'); glow(lx, ly, 200, 'rgba(255,242,220,.2)');
    clouds(t, 141, headY - 600, headY - 100, 'rgba(90,72,54,.4)', 5, 16);
    deadTree(x - 560, headY + 560, 760, '#6a5742', 12);
    fogBands(t, headY - 200, headY + 700, 7, 143, .32);
    for (let i = 0; i < 6; i++) wisp(t, x - 600 + i * 240 + snoise(i, 3) * 60, headY + 700, 520 + 200 * hash(i + 4), .45, i * 9 + 5, 1.4);
    const o = { turn: .22, sing: 1, wind: .4, lit: .2, guitar: 'none', arms: 'down', rim: 'rgba(255,236,205,.9)' };
    occlude(() => wyrd(t, x, y, h, { ...o, sil: true, g: f }));
    const J = wyrd(t, x, y, h, o);
    // the veil's cords catch the dawn: faint strands of light over the black cloth (never a face under it)
    const u = h / 100, v = clamp(F('voc', t, 3) * 1.2);
    for (let k = -6; k <= 6; k++) { const sx = J.head[0] + k / 6.5 * 7.6 * u, top = J.head[1] - 4.8 * u, bot = J.head[1] + (8.6 + .6 * v) * u + hash(k + 30) * 1.2 * u, sw = (snoise(t * 1.3 + k * 2.1, 41) * .6 + v * snoise(t * 6 + k, 42) * .9 + .3) * u;
      stroke(f, [[sx, top], [sx + sw * .5, (top + bot) / 2], [sx + sw, bot]], `rgba(255,236,205,${.025 + .03 * (k > 0) + .03 * hash(k + 9)})`, (.25 + .2 * hash(k + 3)) * u); }
    fogBands(t, headY + 600, headY + 1000, 4, 147, .3);
    // the whiteout of the pull-through clears off him
    const fogIn = 1 - ease.out(inv(0, .75, lt));
    if (fogIn > .01) { s.fillStyle = `rgba(217,203,176,${.93 * fogIn})`; s.fillRect(x - 1800, headY - 1800, 3600, 3800); }
  }
  // the tear line in screen px, top to bottom
  function tearPath() {
    const n = 30, p = [];
    for (let i = 0; i <= n; i++) { const u = i / n; p.push([W * (.56 - .12 * u) + (hash(i * 7 + 3) - .5) * W * .05 + (i % 2 ? 1 : -1) * W * .01, -80 + u * (H + 160)]); }
    return p;
  }
  function halfXform(g, side, k) {
    const px = side < 0 ? 0 : W; g.translate(px, H); g.rotate(side * .16 * k); g.translate(-px, -H); g.translate(side * k * W * .58, -k * H * .04);
  }
  function halfPath(g, path, side) { const ex = side < 0 ? -W : 2 * W; g.beginPath(); g.moveTo(ex, -H); path.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(ex, 2 * H); g.closePath(); }
  function sandstone(t) {
    s.fillStyle = vgrad(s, 0, H, [[0, '#d99a5c'], [.5, '#b8683a'], [1, '#7c3c1f']]); s.fillRect(-20, -20, W + 40, H + 40);
    const r = rng(501);
    for (let i = 0; i < 10; i++) { const y0 = r() * H, th = 20 + r() * 70; s.fillStyle = r() > .5 ? 'rgba(238,172,112,.35)' : 'rgba(118,50,24,.32)'; s.beginPath(); s.moveTo(-20, y0);
      for (let x = -20; x <= W + 20; x += 40) s.lineTo(x, y0 + snoise(x * .004, i + 30) * 40); for (let x = W + 20; x >= -20; x -= 40) s.lineTo(x, y0 + th + snoise(x * .004 + 3, i + 30) * 40); s.fill(); }
    for (let i = 0; i < 5; i++) { let x = r() * W * .6, y = r() * H; const pts = [[x, y]]; for (let k = 0; k < 9; k++) { x += 50 + r() * 90; y += (r() - .5) * 60; pts.push([x, y]); } stroke(s, pts, 'rgba(84,34,14,.6)', 7); }
    glow(W * .7, H * .15, Math.max(W, H) * .6, 'rgba(255,200,140,.12)');
  }
  function mixLook(k) { const o = {}; for (const key of new Set([...Object.keys(LOOK.sepia), ...Object.keys(LOOK.rock)])) { const a = LOOK.sepia[key] ?? (key === 'strokeK' ? 1 : 0), b = LOOK.rock[key] ?? a;
    o[key] = Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k); } return o; }
  function sing(t, lt, dur) {
    const crack = inv(tUnglued - .02, tUnglued + .16, t), sep = Math.pow(inv(tUnglued + .2, Z - .02, t), 1.7);
    if (crack <= 0) { closeup(t, lt, dur); return; }
    const path = tearPath();
    for (const g of [s, f]) { g.save(); g.setTransform(.5, 0, 0, .5, 0, 0); }
    sandstone(t);
    if (sep > 0) for (const side of [-1, 1]) { s.save(); halfXform(s, side, sep); s.translate(side * 18, 26); halfPath(s, path, side); s.fillStyle = 'rgba(40,16,6,.5)'; s.fill(); s.restore(); }
    for (const g of [s, f]) g.restore();
    for (const side of [-1, 1]) {
      for (const g of [s, f]) { g.save(); g.setTransform(.5, 0, 0, .5, 0, 0); halfXform(g, side, sep); halfPath(g, path, side); g.clip(); }
      closeup(t, lt, dur);
      for (const g of [s, f]) g.restore();
      // the torn paper edge: the white core of the print, frayed
      for (const g of [s, f]) { g.save(); g.setTransform(.5, 0, 0, .5, 0, 0); halfXform(g, side, sep); }
      const m = Math.max(2, Math.ceil(path.length * crack)), edge = path.slice(0, m).map(([x, y], i) => [x - side * (4 + 6 * hash(i * 5 + (side > 0 ? 1 : 2))), y]);
      if (sep > 0) { stroke(s, edge, '#eadfc6', 16); stroke(s, edge.map(([x, y], i) => [x - side * 7, y + (hash(i) - .5) * 10]), '#b9a888', 5); }
      for (const g of [s, f]) g.restore();
    }
    // the crack runs down the print before it opens
    if (sep <= .02) { for (const g of [s, f]) { g.save(); g.setTransform(.5, 0, 0, .5, 0, 0); }
      const m = Math.max(2, Math.ceil(path.length * crack)); stroke(s, path.slice(0, m), '#efe4cc', 7); stroke(f, path.slice(0, m), 'rgba(255,240,215,.5)', 4);
      for (const g of [s, f]) g.restore(); }
    flash(hit(t, tUnglued, 7) * .15, '#f3e6c9');
    paintSet(mixLook(sep * .9));
  }

  chapter('fog', A, Z, [
    [A, loom, { xin: .8 }],
    [S2, twist],
    [S3, voices],
    [S4, reach],
    [S5, through],
    [S6, sing],
  ], { paint: LOOK.sepia });
})();
