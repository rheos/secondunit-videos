// js/ch/c7.js · THE SERPENT CALLS (116.400 - 153.400) · verse 3 · look: dream (indigo night oil) -> sunset sky
// One location: a lone campfire on the open plains. c6's stars have gathered into this fire; the fire
// throws his doubled shadow across the ground, the smoke serpent rises out of it and calls him, smoke
// pours across the plain in rivers, the sky ignites from the horizon up and the old rock-art glyphs
// glow in it like constellations. Ends with the burning sky breaking into storm clouds for c8.
(() => {
  const A = 116.4, Z = 153.4;
  const tShadows = when('shadows', 116), tAir = when('air', 117), tStill = when('still', 118);
  const tFire = when('fire', 119), tCalled = when('called', 119.5), tWill = when('will', 121);
  const tEchoes = when('echoes', 122.5), tTongues = when('tongues', 123.5);
  const tSmoke = when('smoke', 125.5), tSinging = when('singing', 126), tDream = when('dream', 129), tPlanes = when('planes', 131);
  const tBlazing = when('blazing', 132), tSerpent = when('serpent', 133.5), tCalled2 = when('called', 134), tName = when('name', 137);
  const tSaid = when('said', 140), tSmoke2 = when('smoke', 141.5), tRivers = when('rivers', 142.5);
  const tSky = when('sky', 144.5), tFlame = when('flame', 145.5), tOld = when('old', 147.8), tOnes = when('ones', 148.3), tSpeak = when('speaking', 149);
  const tCalling = when('calling', 151.5), tName2 = when('name', 152);

  // ---------- the look: dream indigo, igniting into the sunset oil, a touch of storm at the very end ----------
  const DEF = { tint: [1, 1, 1], tintK: 0, lift: 0, strokeK: 1, burn: 0, etch: 0 };
  function mixLook(a, b, k) {
    if (k <= 0) return a; const o = {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) { const va = a[key] ?? DEF[key], vb = b[key] ?? DEF[key];
      o[key] = Array.isArray(va) ? va.map((x, j) => lerp(x, vb[j], k)) : lerp(va ?? vb, vb ?? va, k); }
    return o;
  }
  const look = (t) => {
    const ign = smooth(inv(tSky - .3, tFlame + 1.4, t)), st = smooth(inv(tCalling - .3, Z, t)) * .35;
    return mixLook(mixLook(LOOK.dream, LOOK.sunset, ign), LOOK.storm, st);
  };

  // ---------- the plains ----------
  // night sky over the plain; burn 0..1 raises a fire front from the horizon; stars fade under it
  function plains(t, o = {}) {
    const hz = o.hz ?? 1240, burn = o.burn ?? 0, starA = o.stars ?? 1;
    sky('#04061a', '#0b1336', '#2b3874', hz);
    s.fillStyle = vgrad(s, hz - 520, hz, [[0, 'rgba(58,72,140,0)'], [1, 'rgba(78,94,168,.8)']]); s.fillRect(-900, hz - 520, STAGE + 1800, 520);
    // the Milky Way: a slanted band of soft light
    for (let i = 0; i < 9; i++) { const u = i / 8, x = lerp(-200, STAGE + 200, u), y = lerp(150, hz - 350, u) + Math.sin(u * 5) * 60;
      dot(s, x, y, 230, 'rgba(70,90,150,.18)'); glow(x, y, 300, `rgba(150,170,230,${.05 * starA})`); }
    const front = lerp(hz + 40, -900, burn);
    if (burn > 0) { // the sky ignites from the horizon up: a burning gradient under a ragged rising edge
      s.fillStyle = vgrad(s, front - 260, hz, [[0, 'rgba(90,20,24,0)'], [.18, '#5a1612'], [.5, '#b8381a'], [.8, '#f07a22'], [1, '#ffc24a']]);
      s.fillRect(-900, front - 260, STAGE + 1800, hz - front + 300);
      s.save(); s.globalAlpha *= .75;
      for (let i = 0; i < 34; i++) { const x = lerp(-500, STAGE + 500, (i + hash(i + 7) * .9) / 34), hh = (80 + 420 * Math.pow(noise1(t * 1.6 + i * 2.3, 5), 2)) * clamp(burn * 4) * clamp((.5 - burn) * 5) * (.4 + hash(i + 31));
        tongue(t, x, front + 80, hh, 40 + 45 * hash(i + 3), i + 70, snoise(t * .7 + i, 8) * .25, true); }
      s.restore();
      const r = rng(41); // streaked clouds catch the fire from below (c4's sky, dimmer)
      for (let i = 0; i < 10; i++) { const cy = lerp(-500, hz - 160, r()), cx = (r() * 2800 + t * (8 + r() * 10)) % 2800 - 450, w = 500 + r() * 800, hh = 24 + r() * 46;
        if (cy < front + 40) continue; s.fillStyle = mixHex('#4a120f', '#ff9a3c', clamp((cy - front) / (hz - front + 1)) * .8); s.beginPath(); s.ellipse(cx, cy, w / 2, hh / 2, 0, 0, TAU); s.fill(); }
      glow(SC, front + 200, 1300, `rgba(255,120,50,${.12 * clamp(burn * 3)})`);
      glow(SC, hz - 60, 1500, `rgba(255,170,80,${.16 * clamp(burn * 2)})`);
    }
    stars(o.starT ?? t, 71, 170, -500, STAGE + 500, -700, Math.min(hz - 60, front - 280), starA * (o.starK ?? 1));
    const bk = clamp(burn * 3);
    mesas(hz, 70, mixHex('#0a0f26', '#2a0c0c', bk), 707); mesas(hz + 14, 36, mixHex('#070a1c', '#1a0808', bk), 708);
    s.fillStyle = vgrad(s, hz, hz + 1300, [[0, '#343d6a'], [.08, '#232a52'], [.4, '#141832'], [1, '#07080f']]); s.fillRect(-900, hz, STAGE + 1800, 3000);
    if (bk > 0) { s.save(); s.globalAlpha *= bk; ground(hz + 10, '#2e1410', '#06070f'); s.restore(); }
    if (burn > 0) glow(SC, hz + 40, 1600, `rgba(255,120,60,${.05 * burn})`);
  }
  // scattered sage tufts and stones on the ground (world coords), shaded warm near the fire
  function scrub(t, hz, seed = 11, n = 26) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) { const d = r(), y = hz + 20 + d * d * 900, x = lerp(-300, STAGE + 300, r()), sz = 8 + d * 60;
      if (r() < .6) bush(x, y, sz, d > .5 ? '#0b0d17' : '#141a33', i + seed);
      else { s.fillStyle = '#2a2d44'; s.beginPath(); s.ellipse(x, y, sz * .8, sz * .35, 0, 0, TAU); s.fill(); }
      const sw = snoise(t * .5 + i, 9) * sz * .3; stroke(s, [[x, y], [x + sw, y - sz * 1.1]], '#0a0c16', Math.max(1.5, sz * .08)); }
  }
  // firelight pooled on the ground: a warm foreshortened pool
  function firePool(x, y, R, k, sq = .32) {
    s.save(); s.translate(x, y); s.scale(1, sq);
    s.fillStyle = rgrad(s, 0, 0, 0, R, [[0, `rgba(210,110,45,${.9 * k})`], [.3, `rgba(150,68,32,${.6 * k})`], [.7, `rgba(70,40,50,${.25 * k})`], [1, 'rgba(30,30,60,0)']]);
    s.beginPath(); s.arc(0, 0, R, 0, TAU); s.fill(); s.restore();
    glow(x, y, R * .6, `rgba(255,120,50,${.06 * k})`);
  }
  // painted flame tongue (from c4) with a lean: the flames reach toward him when the fire calls
  function tongue(t, x, y, h, w, seed, lean = 0, dim = false) {
    if (h < 4) return;
    const shape = (k, c) => flameShape(t, x, y, h, w, k, c, seed, lean);
    if (dim) { shape(1, '#8f2a17'); shape(.55, '#e0662a'); return; }
    shape(1, '#7a1a0c'); shape(.7, '#c8431b'); shape(.4, '#f28a2c'); shape(.18, '#ffc05a');
  }
  // the campfire: stones and logs, painted tongues, light. k = size, lean = reach toward him
  function campfire(t, x, y, sc, k = 1, lean = 0) {
    fireRing(t, x, y, sc, 0);
    for (let i = 0; i < 7; i++) { const u = (i - 3) / 3, hh = sc * (1.2 + 1.1 * noise1(t * 2.2 + i * 1.3, 17)) * (1 - Math.abs(u) * .45) * k;
      tongue(t, x + u * sc * .55 * Math.sqrt(k), y - sc * .05, hh, sc * .26 * Math.sqrt(k), i + 40, lean * (.8 + .4 * hash(i))); }
    const fl = .85 + .15 * noise1(t * 7, 3), kg = Math.sqrt(k);
    glow(x, y - sc * .8 * k, sc * 4.5 * kg * fl, `rgba(255,120,40,${.16})`); glow(x, y - sc * .5 * k, sc * 1.4 * kg, `rgba(255,210,140,${.3 * fl})`);
  }
  // his shadow cast by the fire: a long, low, soft dark shape lying flat on the ground from his boots
  // along (vx, vy), foreshortened (thin), fading with distance. Not a figure: boots, coat, a hat
  // bulge at the far end, all squashed flat. It sways and stretches with the flicker; he stands still.
  function shadow(t, x, y, vx, vy, len, wid, wob, a = .5) {
    const n = Math.hypot(vx, vy); vx /= n; vy /= n; const px = -vy, py = vx;
    const W = (u) => wid * (u < .08 ? .35 + u * 6 : u < .72 ? .8 + .35 * Math.sin(Math.PI * (u - .08) / .64) : u < .8 ? .55 : u < .95 ? 1.1 : .5);
    const pts = [], back = [];
    for (let i = 0; i <= 24; i++) { const u = i / 24, bend = wob * u * u * len * .08, cx = x + vx * len * u + px * bend, cy = y + vy * len * u + py * bend, w = W(u) * (1 + u * .6);
      pts.push([cx + px * w, cy + py * w]); back.push([cx - px * w, cy - py * w]); }
    // soft edge: three nested passes, widest faintest (canvas filters are unreliable here)
    const poly2 = (grow, al) => { s.fillStyle = `rgba(10,7,14,${al})`; s.beginPath();
      pts.forEach(([qx, qy], i) => { const [bx, by] = back[i], mx = (qx + bx) / 2, my = (qy + by) / 2, k = 1 + grow; const X = mx + (qx - mx) * k, Yq = my + (qy - my) * k; i ? s.lineTo(X, Yq) : s.moveTo(X, Yq); });
      for (let i = back.length - 1; i >= 0; i--) { const [qx, qy] = pts[i], [bx, by] = back[i], mx = (qx + bx) / 2, my = (qy + by) / 2, k = 1 + grow; s.lineTo(mx + (bx - mx) * k, my + (by - my) * k); }
      s.closePath(); s.fill(); };
    poly2(.6, a * .25); poly2(.25, a * .35); poly2(-.2, a * .5);
  }
  // two shadows from the two lobes of the fire, fanning apart; T drives the sway (frozen while the air stands still)
  function danceShadows(T, t, x, y, h, dir, len, amt = 1, spread = 1.15, sep = .28) {
    const fl = snoise(t * 3.1, 8) * .08 + snoise(t * 7, 9) * .03, sw = sway(T), b = bob(T), a0 = Math.atan2(dir[1], dir[0]), wid = h * .075 * spread;
    for (const [d, al, lk] of [[1, .62, 1], [-1, .42, .85]]) { const an = a0 + d * (sep * .6 + sw * .06 * amt) + fl * .5;
      shadow(T, x, y, Math.cos(an), Math.sin(an), len * lk * (1 + fl + b * .06 * amt), wid, d * sw * amt, al); }
  }

  // ---------- the smoke serpent, rising out of the fire ----------
  // base (bx, by) in the fire, head at (hx, hy) heading `ang`; rise 0..1 grows the body up to the head.
  // Smoke painted twice: a soft grey-blue body on s (so the brush gives it texture, with the diamond
  // pattern of a rattlesnake's back) and a faint light on f, warm underneath from the fire.
  function serpent(t, bx, by, hx, hy, R, o = {}) {
    const { rise = 1, ang = -Math.PI / 2, a = .8, amp = 120, c1 = [bx, by - 400], c2 = [hx - Math.cos(ang) * 300, hy - Math.sin(ang) * 300], eyes = 1, tongueK = 0 } = o;
    const P = (u) => { const m = 1 - u; return [m * m * m * bx + 3 * m * m * u * c1[0] + 3 * m * u * u * c2[0] + u * u * u * hx, m * m * m * by + 3 * m * m * u * c1[1] + 3 * m * u * u * c2[1] + u * u * u * hy]; };
    const n = 64, end = clamp(rise), pts = [];
    for (let i = 0; i <= n; i++) { const u = i / n * end, p = P(u), q = P(Math.min(1, u + .01)), dx = q[0] - p[0], dy = q[1] - p[1], dl = Math.hypot(dx, dy) || 1;
      const off = Math.sin(u * TAU * 1.6 - t * 2.2) * amp * u * (1 - u) * 4;
      pts.push([p[0] - dy / dl * off + snoise(u * 4 + t * .7, 3) * R * .15, p[1] + dx / dl * off, R * (.2 + .8 * Math.sin(Math.min(1, u / Math.max(end, .01) * 1.15) * Math.PI * .5 + .15)) * (1 + .08 * Math.sin(u * 30 + t * 3))]); }
    s.save(); s.globalAlpha *= clamp(a * 1.1);
    for (let i = 1; i < pts.length; i++) taper(s, pts[i - 1], pts[i], pts[i - 1][2], pts[i][2], i % 2 ? '#5d6690' : '#566089');
    for (let i = 4; i < pts.length - 3; i += 4) { const [x, y, w] = pts[i], [x2, y2] = pts[i + 1], an = Math.atan2(y2 - y, x2 - x), c = Math.cos(an), sn = Math.sin(an), d = w * .55;
      poly(s, [[x + c * d, y + sn * d], [x - sn * d * .6, y + c * d * .6], [x - c * d, y - sn * d], [x + sn * d * .6, y - c * d * .6]], '#343a5c'); }
    s.restore();
    for (let i = 0; i < pts.length; i += 2) { const [x, y, w] = pts[i];
      glow(x, y, w * 2.6, `rgba(200,210,240,${a * .045})`); glow(x, y + w * .5, w * 1.2, `rgba(255,150,90,${a * .04})`); }
    const hp = [pts[pts.length - 1][0], pts[pts.length - 1][1]];
    if (end < .15) return hp;
    const hw = R * 1.3 * smooth(inv(.15, .5, end));
    const HEAD = [[2.0, 0], [1.75, -.3], [1.0, -.62], [.1, -.85], [-.5, -.6], [-.95, -.28], [-.95, .28], [-.5, .6], [.1, .85], [1.0, .62], [1.75, .3]];
    const hpts = HEAD.map(([x, y]) => [hp[0] + (x * Math.cos(ang) - y * Math.sin(ang)) * hw, hp[1] + (x * Math.sin(ang) + y * Math.cos(ang)) * hw]);
    s.save(); s.globalAlpha *= clamp(a * 1.2); poly(s, hpts, '#6a739c'); s.restore();
    stroke(f, [...hpts, hpts[0]], `rgba(210,220,250,${a * .07})`, hw * .14); glow(hp[0], hp[1], hw * 2.2, `rgba(200,210,245,${a * .07})`);
    if (tongueK > .02) { const L = hw * (1.1 + .5 * tongueK), fk = Math.sin(t * 40) * .15; f.save(); f.globalCompositeOperation = 'lighter'; f.translate(hp[0], hp[1]); f.rotate(ang);
      f.strokeStyle = `rgba(255,110,60,${.75 * tongueK})`; f.lineWidth = hw * .07; f.lineCap = 'round';
      f.beginPath(); f.moveTo(hw * 1.95, 0); f.lineTo(hw * 1.95 + L, fk * hw); f.lineTo(hw * 1.95 + L * 1.25, fk * hw - hw * .22); f.moveTo(hw * 1.95 + L, fk * hw); f.lineTo(hw * 1.95 + L * 1.25, fk * hw + hw * .22); f.stroke(); f.restore(); }
    for (const d of [-1, 1]) { const ex = hp[0] + (Math.cos(ang) * .75 - Math.sin(ang) * d * .48) * hw, ey = hp[1] + (Math.sin(ang) * .75 + Math.cos(ang) * d * .48) * hw;
      glow(ex, ey, hw * .26, `rgba(255,110,40,${.8 * a * eyes})`); dot(f, ex, ey, hw * .08, `rgba(255,210,130,${a * eyes})`); }
    return hp;
  }

  // ---------- light ripples, smoke ribbons, smoke rivers ----------
  function ripples(t, x, y, starts, sq, speed = 900, a = 1) {
    for (const t0 of starts) { const d = t - t0; if (d < 0 || d > 2.6) continue; const r = 80 + d * speed, k = (1 - d / 2.6) * a;
      f.save(); f.globalCompositeOperation = 'lighter'; f.translate(x, y); f.scale(1, sq);
      for (const [w, al] of [[60, .06], [22, .16], [7, .45]]) { f.strokeStyle = `rgba(255,190,120,${al * k})`; f.lineWidth = w; f.beginPath(); f.arc(0, 0, r, 0, TAU); f.stroke(); }
      f.restore(); }
  }
  function ribbons(t, x, y, top, n, vk, a = 1) {
    for (let i = 0; i < n; i++) { const pts = [], ph = hash(i * 5 + 1) * TAU, sp = 1.1 + hash(i + 9) * .9, side = (i - (n - 1) / 2) * 34, fq = 5 + hash(i + 2) * 4;
      for (let k = 0; k <= 30; k++) { const u = k / 30, yy = lerp(y, top, u), amp = (30 + 240 * vk) * u;
        pts.push([x + side * (1 + u * 2.5) + Math.sin(u * fq + ph - t * sp * 2) * amp + snoise(u * 3 + t * .4, i) * 80 * u, yy]); }
      stroke(f, pts, `rgba(200,208,240,${.03 * a})`, 90); stroke(f, pts, `rgba(215,220,248,${.035 * a})`, 34);
      for (let k = 2; k < pts.length; k += 2) { const u = k / 30, w = 20 + 90 * u, br = .6 + .4 * noise1(k * .7 - t * 2 + i * 9, 13);
        glow(pts[k][0], pts[k][1], w, `rgba(225,228,250,${.06 * a * br * (1 - u * .5)})`); } }
  }
  // rivers of smoke flowing across the ground: meandering pale bands with blobs travelling along them
  // smoke pouring across the plain: streams of low, soft, translucent billows that hug the ground and
  // drift one way, their tops lit warm by the fire/sky, fading out at the ends. No crest lines.
  function rivers(t, hz, k, warm = 0, seed = 3) {
    if (k <= .01) return;
    const r = rng(seed), wk = smooth(warm);
    const body = [lerp(120, 150, wk) | 0, lerp(128, 110, wk) | 0, lerp(170, 115, wk) | 0], top = `${lerp(230, 255, wk) | 0},${lerp(190, 170, wk) | 0},${lerp(150, 110, wk) | 0}`;
    for (let i = 0; i < 4; i++) { const q = (i + .3 + r() * .5) / 4, y0 = hz + 40 + q * q * 700, persp = .5 + (y0 - hz) / 450, dir = i % 2 ? 1 : -1, ph = r() * 50, sp = 50 + r() * 40;
      const Y = (x) => y0 + snoise(x / 900 + ph, 11 + i) * 70 * persp;
      for (let j = 0; j < 26; j++) { const h1 = hash(j * 17 + i * 101 + seed), h2 = hash(j * 23 + i * 7 + seed), span = STAGE + 1400;
        const x = ((h1 * span + (t - A) * sp * dir * (.8 + .4 * h2)) % span + span) % span - 700, y = Y(x) - h2 * 30 * persp, rr = (70 + 110 * h2) * persp * (.7 + .3 * k);
        const edge = smooth(inv(-700, -300, x)) * smooth(inv(STAGE + 700, STAGE + 300, x)), roll = .85 + .15 * Math.sin(t * 1.3 + j * 1.7), al = .22 * k * edge * roll;
        if (al < .01) continue;
        s.save(); s.translate(x, y); s.scale(1.6, .55);
        s.fillStyle = rgrad(s, 0, 0, 0, rr, [[0, `rgba(${body},${al})`], [.6, `rgba(${body},${al * .5})`], [1, `rgba(${body},0)`]]); s.beginPath(); s.arc(0, 0, rr, 0, TAU); s.fill(); s.restore();
        glow(x, y - rr * .28, rr * .7, `rgba(${top},${.05 * k * edge})`); } }
  }

  // ---------- the old ones: rock-art glyphs as constellations (no faces, no people, no text) ----------
  const GLYPH = {
    antler: [[[0, -.3], [0, .25]], [[-.32, -.02], [-.14, -.2], [0, -.18], [.14, -.2], [.32, -.02]], [[-.22, .62], [0, .25], [.22, .62]],
      [[-.04, -.48], [-.16, -.7], [-.34, -.84]], [[-.12, -.64], [-.05, -.84]], [[-.25, -.77], [-.3, -.98]], [[.04, -.48], [.16, -.7], [.34, -.84]], [[.12, -.64], [.05, -.84]], [[.25, -.77], [.3, -.98]]],
    spiral: [Array.from({ length: 48 }, (_, i) => { const a = i / 47 * TAU * 2.6; const r = .04 + .44 * a / (TAU * 2.6); return [Math.cos(a) * r, Math.sin(a) * r]; })],
    hand: [Array.from({ length: 19 }, (_, i) => { const a = Math.PI * .1 + i / 18 * Math.PI * .8; return [Math.cos(a) * .3, .12 + Math.sin(a) * .34]; }),
      [[-.3, .14], [-.46, -.1]], [[-.18, .02], [-.22, -.48]], [[-.04, 0], [-.04, -.58]], [[.1, .02], [.13, -.52]], [[.24, .08], [.32, -.36]]],
    rings: [Array.from({ length: 33 }, (_, i) => [Math.cos(i / 32 * TAU) * .45, Math.sin(i / 32 * TAU) * .45]), Array.from({ length: 21 }, (_, i) => [Math.cos(i / 20 * TAU) * .22, Math.sin(i / 20 * TAU) * .22])],
    snake: [Array.from({ length: 30 }, (_, i) => { const u = i / 29; return [lerp(-.5, .5, u), Math.sin(u * TAU * 1.5) * .18]; })],
  };
  // [kind, 9:16 [x, y, size], 16:9 [x, y, size], lights up at, strength, seed]: one per sung word, then beats
  const GLYPHS = [
    ['antler', [SC - 250, 640, 520], [SC - 380, 780, 480], tOld, 1, 1],
    ['spiral', [SC + 270, 520, 330], [SC + 330, 620, 300], tOnes, 1, 2],
    ['hand', [SC + 230, 960, 300], [SC + 640, 930, 280], tSpeak, 1, 3],
    ['rings', [SC - 330, 1080, 200], [SC - 820, 980, 200], tSpeak + .55, 1, 4],
    ['antler', [SC + 20, 330, 260], [SC + 60, 580, 220], tSpeak + 1.05, 1, 5],
    ['snake', [SC + 270, 1235, 220], [SC - 520, 1200, 320], tSpeak + .85, .8, 6],
  ];
  // c7's old ones speak as CONSTELLATIONS: faint threads of light joining star points in the burning sky.
  // c9 then raises them as towering glyphs of fire, so the second time pays the first off instead of
  // repeating it (Robin's polish pass, 2026-10-06)
  function glyph(t, kind, cx, cy, sc, k, seed = 1) {
    if (k <= .01) return;
    const lines = GLYPH[kind];
    for (const ln of lines) { const pts = ln.map(([x, y]) => [cx + x * sc, cy + y * sc]);
      stroke(f, pts, `rgba(200,215,255,${.07 * k})`, sc * .03); stroke(f, pts, `rgba(240,244,255,${.32 * k})`, Math.max(1.5, sc * .007));
      const step = kind === 'spiral' || kind === 'rings' || kind === 'snake' || ln.length > 12 ? 4 : 1;
      for (let i = 0; i < pts.length; i += step) { const p = pts[i], tw = .55 + .45 * Math.sin(t * (2.2 + hash(i + seed * 7) * 3) + i + seed), big = hash(i * 3 + seed) > .7;
        dot(f, p[0], p[1], (big ? sc * .016 : sc * .009) + 1.5, `rgba(250,250,255,${k * tw})`); glow(p[0], p[1], sc * (big ? .07 : .04), `rgba(190,205,255,${.3 * k * tw})`); } }
  }

  // ---------- storm clouds breaking the burning sky (c8 handoff) ----------
  function stormClouds(t, cover, litK, flashK = 0) {
    const r = rng(505), n = 26, dt = t - tCalling;
    for (let i = 0; i < n; i++) { const side = i % 2 ? 1 : -1, tx = lerp(-400, STAGE + 400, r()), ty = lerp(-700, 1050, Math.pow(r(), 1.2)), w = 500 + r() * 600, h = 170 + r() * 170;
      const e = ease.out(clamp((cover - i / n * .6) / .4)); if (e <= 0) continue;
      const x = tx + side * (1 - e) * 1500 + dt * side * -14, y = ty - (1 - e) * 700 + dt * 12;
      const under = mixHex('#4a2a2a', '#b0502a', litK * clamp((ty + 700) / 1750));
      for (let j = 0; j < 9; j++) { const ox = (hash(i * 9 + j) - .5) * w * 1.3, oy = (hash(i * 11 + j) - .5) * h * .8 - Math.abs(hash(i * 9 + j) - .5) * h * .5, rr = h * (.45 + hash(i * 13 + j) * .5);
        s.fillStyle = vgrad(s, y + oy - rr, y + oy + rr, [[0, '#1e1a24'], [.55, '#3a3242'], [.85, '#4e3a40'], [1, under]]);
        s.beginPath(); s.ellipse(x + ox, y + oy, rr * 1.35, rr, 0, 0, TAU); s.fill();
        glow(x + ox, y + oy + rr * .85, rr * .9, `rgba(255,120,50,${.05 * litK})`); }
      if (flashK > 0 && i % 5 === 1) glow(x, y, w * .6, `rgba(215,222,255,${.16 * flashK})`); }
  }

  // =====================================================================================
  // 1 · picks up c6's last frame (him from behind looking down at the gathered fire beyond him, the dog
  //     on the left), then pulls back and down: the fire throws his shadow at us, huge and doubled, and
  //     the shadows dance while he stands still. On "air stood still" everything freezes except the flames.
  function kindle(t, lt, dur) {
    const T = Math.min(t, tAir), lT = T - A;
    const HZ = 1400, fx = SC - 90, fy = 1500, hx = SC + 250, hy = 1650;
    const e = ease.inOut(inv(.35, tAir - A + .15, lT)); // hold c6's framing through the dissolve, then move
    const z = lerp(pick(1.5, 1.17), pick(.9, .66), e) - (t - T) * .004;
    frame(lerp(SC - 50, pick(SC + 170, SC + 120), e), lerp(pick(1330, 1310), pick(1560, 1600), e), z, lerp(-.01, .012, e));
    plains(T, { hz: HZ, starT: T });
    firePool(fx, fy, 1900, 1, .32);
    scrub(T, HZ, 21, 30);
    wolfdog(T, SC - 440, 1640, 200, { dir: 1, sil: true, look: 1 });
    // the doubled shadows run from his boots toward us, away from the fire
    firePool(hx + 120, hy + 380, 1100, .55, .4); // the firelight spilling past him onto the ground his shadows lie on
    danceShadows(T, t, hx, hy, 620, pick([.75, .55], [1, .42]), 1150, 1.3, 1.1, .4);
    wyrd(T, hx, hy, 620, { view: 'back', guitar: 'hang', arms: 'down', groove: .5, wind: .45 + snoise(T * .4, 3) * .15, lit: .1, rim: 'rgba(255,160,90,.9)' });
    campfire(t, fx, fy, 58, 1, 0);
    sparks(T, fx, fy - 40, 100, 600, 24, .8, 71);
    const fz = inv(tAir - .05, tAir + .25, t);
    if (fz > 0) paintSet({ boil: lerp(7, .5, fz), weave: 0, flick: 0, dust: 0, scratch: 0 });
  }

  // 2 · "fire called me": side-on, the flames lean and reach toward him; his shadows sprawl to the right
  function called(t, lt, dur) {
    const z = kf(lt, [[0, .98], [dur, 1.16]], ease.inOut);
    frame(kf(lt, [[0, SC - 20], [dur, SC + 60]]), kf(lt, [[0, 1080], [dur, 1120]]) - pick(0, 90), pick(z, z * .7));
    const fx = SC - 300, fy = 1470, hx = SC + 190, hy = 1400;
    plains(t, { hz: 1150 });
    firePool(fx, fy, 1500, 1, .32);
    scrub(t, 1150, 31, 22);
    const reach = ease.back(inv(tFire - .1, tCalled + .3, t)) * (1 - .6 * ease.inOut(inv(tCalled + .6, tWill, t))) + .5 * hit(t, tWill, 3);
    danceShadows(t, t, hx, hy, 840, pick([.7, .5], [1, .3]), 1200, .9, 1.1);
    wyrd(t, hx, hy, 840, { turn: -.2, guitar: 'play', groove: .3, wind: .5, lit: .22 + .08 * reach, rim: 'rgba(255,160,80,.8)' });
    campfire(t, fx, fy, 115, 1 + .4 * reach, .3 * reach);
    sparks(t, fx + 60 * reach, fy - 100, 180, 900, 30, .8, 72);
    glow(hx - 120, hy - 500, 500, `rgba(255,140,60,${.08 * reach})`);
  }

  // 3 · "echoes ... tongues": high crane over the plain; rings of light travel out from the fire
  function echoes(t, lt, dur) {
    const z = kf(lt, [[0, 1.12], [dur, .96]], ease.inOut);
    frame(SC + kf(lt, [[0, -40], [dur, 40]]), kf(lt, [[0, 1080], [dur, 1000]]), pick(z, z * .78), kf(lt, [[0, -.02], [dur, .02]]));
    const hz = 640, fx = SC - 40, fy = 1150;
    plains(t, { hz, stars: .8 });
    firePool(fx, fy, 1300, 1, .45);
    scrub(t, hz, 41, 44);
    const starts = [tEchoes, tEchoes + .5, tTongues, tTongues + .38, ...FEAT.beats.filter((b) => b > tEchoes + .9 && b < Z && b < tTongues)];
    ripples(t, fx, fy, starts, .45, 850, 1);
    // stones catch each ring as it passes
    const r = rng(43); for (let i = 0; i < 24; i++) { const sx = lerp(0, STAGE, r()), sy = lerp(hz + 100, 1800, r()), d = Math.hypot(sx - fx, (sy - fy) / .45);
      let k = 0; for (const t0 of starts) { const rr = 80 + (t - t0) * 850; if (t > t0) k = Math.max(k, Math.exp(-Math.pow((rr - d) / 60, 2)) * (1 - (t - t0) / 2.6)); }
      if (k > .02) glow(sx, sy, 40, `rgba(255,200,130,${.5 * k})`); }
    danceShadows(t, t, fx + 110, fy + 40, 300, [1, .38], 800, .7, 1.1);
    wyrd(t, fx + 110, fy + 40, 300, { guitar: 'play', groove: .3, wind: .4, lit: .35, rim: 'rgba(255,160,80,.7)' });
    campfire(t, fx, fy, 60, 1.1, 0);
    sparks(t, fx, fy - 40, 100, 600, 24, .7, 73);
  }

  // 4 · "smoke was singing": low angle, he plays; smoke ribbons rise from the fire, swaying with the voice
  function singing(t, lt, dur) {
    const z = kf(lt, [[0, 1.02], [dur, 1.12]], ease.inOut);
    frame(kf(lt, [[0, SC - 30], [dur, SC + 30]]), kf(lt, [[0, 1180], [dur, 880]], ease.inOut) + pick(0, 60), pick(z, z * .64));
    const fx = SC + 280, fy = 1560, hx = SC - 190, hy = 1530;
    plains(t, { hz: 1300 });
    firePool(fx, fy, 1300, 1, .3);
    const vk = clamp(F('voc', t, 4) * 1.3) * ease.out(inv(tSmoke - .3, tSinging, t));
    ribbons(t, fx, fy - 150, -500, 5, vk, .6 + .6 * vk);
    wyrd(t, hx, hy, 1020, { turn: .15, guitar: 'play', wind: .45, lit: .3, rim: 'rgba(255,160,80,.85)' });
    campfire(t, fx, fy, 120, 1, -.1);
    sparks(t, fx, fy - 120, 200, 1200, 30, .7, 74);
  }

  // 5 · "had a dream on the planes": the widest shot; the fire a speck under the Milky Way, the stars wheel
  function dreamwide(t, lt, dur) {
    const z = kf(lt, [[0, .98], [dur, 1.06]], ease.inOut);
    frame(kf(lt, [[0, SC + 80], [dur, SC - 60]]), kf(lt, [[0, 1000], [dur, 960]]), pick(z, z * .76));
    const hz = 1330, fx = SC + 20, fy = 1370;
    // wheel the sky slowly around a point high above
    s.save(); f.save(); for (const g of [s, f]) { g.translate(SC, -300); g.rotate((t - tDream) * .012); g.translate(-SC, 300); }
    sky('#050818', '#0d1840', '#26356a', hz + 400, -1200, STAGE + 1200);
    for (let i = 0; i < 28; i++) { const u = i / 27, x = lerp(-500, STAGE + 500, u) + (hash(i) - .5) * 120, y = lerp(-100, hz - 200, u) + Math.sin(u * 5) * 80 + (hash(i + 50) - .5) * 140;
      dot(s, x, y, 180 + 120 * hash(i + 9), 'rgba(80,100,175,.14)'); dot(s, x, y, 70, 'rgba(120,135,200,.12)'); glow(x, y, 300, 'rgba(160,180,240,.04)');
      const q = rng(300 + i); for (let j = 0; j < 18; j++) dot(f, x + (q() - .5) * 420, y + (q() - .5) * 300, .8 + q() * 1.6, `rgba(240,242,255,${.3 + .5 * q()})`); }
    stars(t, 91, 320, -900, STAGE + 900, -900, hz, 1);
    s.restore(); f.restore();
    // a shooting star on "planes"
    const sh = inv(tPlanes - .1, tPlanes + .6, t); if (sh > 0 && sh < 1) { const p0 = [SC + 350, 300], p1 = [SC - 300, 700], p = [lerp(p0[0], p1[0], sh), lerp(p0[1], p1[1], sh)];
      stroke(f, [[lerp(p0[0], p1[0], Math.max(0, sh - .25)), lerp(p0[1], p1[1], Math.max(0, sh - .25))], p], `rgba(255,240,220,${.6 * (1 - sh)})`, 4); glow(p[0], p[1], 40, 'rgba(255,240,220,.5)'); }
    mesas(hz, 80, '#0a0f26', 911); ground(hz, '#1a2146', '#06070f');
    firePool(fx, fy, 700, 1, .3); scrub(t, hz, 51, 30);
    ribbons(t, fx, fy - 30, 200, 2, .15, .35);
    wyrd(t, fx - 60, fy + 6, 120, { view: 'sil', guitar: 'hang', wind: .6 });
    campfire(t, fx, fy, 22, 1, 0);
    sparks(t, fx, fy - 12, 30, 250, 14, .6, 75);
  }

  // 6 · "blazing high": the fire leaps, the serpent rises out of it and turns its head to him on "called"
  function blaze(t, lt, dur) {
    const cy = kf(t, [[tBlazing - .2, 1180], [tCalled2 + .4, 880], [tCalled2 + 1.5, 840]], ease.inOut), z = kf(lt, [[0, 1.05], [dur, .92]], ease.inOut);
    frame(SC + kf(lt, [[0, 40], [dur, -30]]), cy, pick(z, z * .74) + hit(t, tBlazing, 3) * .04);
    const fx = SC + 120, fy = 1420, hx = SC - 250, hy = 1440;
    plains(t, { hz: 1260 });
    const leap = hit(t, tBlazing, 1.2);
    firePool(fx, fy, 1500 + 400 * leap, 1, .3);
    scrub(t, 1260, 61, 20);
    danceShadows(t, t, hx, hy, 560, [-1, .3], 950 * (1 + .3 * leap), .6, 1.05);
    wyrd(t, hx, hy, 560, { turn: .3, guitar: 'play', groove: .25, wind: .6, lit: .35 + .3 * leap, rim: 'rgba(255,170,90,.9)' });
    const up = ease.out(inv(tBlazing + .1, tSerpent + .5, t)), turn = ease.back(inv(tCalled2 - .15, tCalled2 + .7, t));
    const headX = lerp(fx + 40, fx - 60, turn), headY = lerp(fy - 500, fy - 1150, up) + 60 * turn;
    serpent(t, fx, fy - 60, headX, headY, 55, { rise: up, ang: lerp(-Math.PI / 2, -Math.PI + .35, turn), a: .75, amp: 110, c1: [fx + 260, fy - 400], c2: [fx - 250, headY + 350], eyes: smooth(inv(.5, 1, up)) });
    campfire(t, fx, fy, 100, 1.3 + 1.5 * leap, 0);
    sparks(t, fx, fy - 150, 300, 1500, 50, .6 + leap, 76);
    flash(hit(t, tBlazing, 5) * .14, '#ff9a50');
  }

  // 7 · the serpent's call: veiled singing close-up, 3/4, the smoke head looking down at him over his shoulder
  function close(t, lt, dur) {
    const x = SC, y = 2100, h = 1500, headY = y - h * .905;
    const zoom = kf(lt, [[0, 1.5], [dur, 1.78]], ease.inOut);
    frame(x + pick(40, 200) + lt * 5, headY + h * kf(lt, [[0, .13], [dur, .1]]) - pick(0, h * .02), pick(zoom, zoom * .62));
    s.fillStyle = vgrad(s, headY - 900, headY + 1000, [[0, '#0a1030'], [.5, '#1c2862'], [1, '#4a3048']]); s.fillRect(x - 1500, headY - 1500, 3000, 3400);
    // a pale bank of the serpent's smoke behind him, warm from the fire below: his silhouette reads against it
    s.fillStyle = rgrad(s, x + 120, headY + 80, 0, 820, [[0, 'rgba(120,130,190,.95)'], [.45, 'rgba(80,92,160,.6)'], [1, 'rgba(30,40,90,0)']]); s.fillRect(x - 900, headY - 900, 1800, 1800);
    stars(t, 97, 70, x - 900, x + 900, headY - 900, headY + 200, .7);
    glow(x + 500, headY + 800, 900, 'rgba(255,120,50,.16)'); // firelight from below right, off screen
    const nm = ease.inOut(inv(tName - .6, tName + .4, t));
    // the serpent's body climbs on the right; its head hangs level with his hat, looking at him
    const hp = serpent(t, x + pick(620, 820), headY + 1100, x + pick(lerp(250, 215, nm), lerp(360, 300, nm)), headY - pick(lerp(360, 320, nm), lerp(170, 120, nm)), 58, { rise: 1, ang: Math.PI - pick(.75, .3) + snoise(t * .5, 4) * .08, a: .85, amp: 50, c1: [x + pick(460, 560), headY + 100], c2: [x + pick(560, 800), headY - pick(700, 520)], tongueK: hit(t, tName, 2.5) + .3 * hit(t, tCalled2 + 1.9, 3) });
    occlude(() => wyrd(t, x, y, h, { turn: -.3, sing: 1, wind: .4, guitar: 'none', arms: 'down', view: 'sil', g: f, rim: null }));
    wyrd(t, x, y, h, { turn: -.3, sing: 1, wind: .4, lit: .18, guitar: 'none', arms: 'down', rim: 'rgba(255,165,90,.55)' });
    glow(hp[0], hp[1], 220, `rgba(200,210,255,${.03 + .05 * nm})`);
  }

  // 8 · "and he said": wide two-shot; the serpent arches from the fire over him and breathes smoke over him
  function said(t, lt, dur) {
    const z = kf(lt, [[0, .9], [dur, 1.0]], ease.inOut);
    frame(kf(lt, [[0, SC + 60], [dur, SC - 40]]), kf(lt, [[0, 1000], [dur, 1060]]), pick(z, z * .74));
    const fx = SC - 260, fy = 1420, hx = SC + 230, hy = 1440;
    plains(t, { hz: 1260 });
    firePool(fx, fy, 1500, 1, .3); scrub(t, 1260, 71, 20);
    danceShadows(t, t, hx, hy, 520, [1, .3], 850, .5, 1.05);
    const dn = ease.inOut(inv(tSaid - .8, tSaid + .2, t));
    const hp = serpent(t, fx, fy - 60, lerp(hx - 30, hx - 60, dn), lerp(900, 1010, dn), 55, { rise: 1, ang: lerp(.9, 1.15, dn), a: .75, amp: 70, c1: [fx - 150, 500], c2: [hx - 350, 520], tongueK: hit(t, tSaid, 3) });
    // the breath: a puff of smoke from its mouth rolls down over his hat and shoulders
    const br = inv(tSaid - .05, tSaid + 1.3, t);
    if (br > 0 && br < 1) for (let i = 0; i < 12; i++) { const u = clamp(br * 1.2 - i * .02), px = lerp(hp[0], hx + (hash(i) - .5) * 200, u), py = lerp(hp[1], hy - 380 + hash(i + 5) * 300, u);
      glow(px, py, 60 + 160 * u, `rgba(225,230,250,${.07 * (1 - br)})`); }
    wyrd(t, hx, hy, 520, { turn: -.25, guitar: 'play', groove: .2, wind: .5 + .4 * br * (1 - br) * 4, lit: .3, rim: 'rgba(255,160,80,.85)' });
    campfire(t, fx, fy, 95, 1.1, .1);
    sparks(t, fx, fy - 100, 200, 1100, 30, .7, 77);
  }

  // 9 · "smoke ... rivers": ground-level wide; the serpent pours down into rivers of smoke across the plain
  function riversShot(t, lt, dur) {
    const z = kf(lt, [[0, 1.0], [dur, 1.18]], ease.in);
    frame(SC + kf(lt, [[0, -60], [dur, 40]]), kf(lt, [[0, 1150], [dur, 1180]]), pick(z, z * .76));
    const hz = 1180, fx = SC + 250, fy = 1250, hx = SC - 120, hy = 1330;
    plains(t, { hz, burn: .03 * ease.in(inv(tRivers, tSky, t)) });
    firePool(fx, fy, 1300, 1, .3); scrub(t, hz, 81, 18);
    const pour = ease.out(inv(tSmoke2 - .4, tRivers + .6, t));
    rivers(t, hz, pour, 0, 5);
    // the serpent's body collapsing into the rivers
    const fall = 1 - pour;
    if (fall > .02) serpent(t, fx, fy - 50, fx - 200, lerp(hy - 50, 500, fall), 55, { rise: .3 + .7 * fall, ang: Math.PI * .7, a: .7 * fall, amp: 90, c1: [fx + 200, 600], c2: [fx - 250, 520] });
    wyrd(t, hx, hy, 470, { turn: .2, guitar: 'hang', arms: 'down', wind: .7, lit: .28, rim: 'rgba(255,160,80,.85)' });
    rivers(t, hz + 200, pour * .8, 0, 6); // a near river passing in front of his boots
    campfire(t, fx, fy, 70, 1, 0);
    sparks(t, fx, fy - 80, 150, 900, 24, .6, 78);
  }

  // 10 · "the sky will be a flame": the sky ignites from the horizon up; the camera cranes with the front
  function ignite(t, lt, dur) {
    const z = kf(lt, [[0, 1.0], [dur, .92]], ease.inOut);
    frame(SC, kf(t, [[tSky - .3, 1150], [tFlame + 1.6, 820]], ease.inOut), pick(z, z * .76), kf(lt, [[0, .02], [dur, -.02]]));
    const hz = 1300, fx = SC + 200, fy = 1380, hx = SC - 90, hy = 1420;
    const burn = ease.inOut(inv(tSky - .1, tFlame + 1.6, t));
    plains(t, { hz, burn, stars: 1 - burn * .8 });
    firePool(fx, fy, 1300, 1, .3); scrub(t, hz, 91, 18);
    rivers(t, hz, 1, burn, 5);
    wyrd(t, hx, hy, 460, { guitar: 'hang', arms: 'down', wind: .8, lit: .25 * (1 - burn), rim: 'rgba(255,170,90,.95)' });
    campfire(t, fx, fy, 65, 1, 0);
    sparks(t, fx, fy - 80, 150, 900, 24, .6, 79);
    flash(hit(t, tFlame, 3) * .12, '#ffb060');
  }

  // 11 · "the old ones are speaking": glyphs glow in the burning sky like constellations; he looks up at them
  function oldones(t, lt, dur) {
    const z = kf(lt, [[0, .96], [dur, 1.06]], ease.inOut);
    frame(SC + kf(lt, [[0, -30], [dur, 30]]), kf(lt, [[0, 760], [dur, 900]], ease.inOut), pick(z, z * .74));
    const hz = 1320;
    plains(t, { hz, burn: 1, stars: .15 });
    glow(SC, 700, 1200, 'rgba(255,150,70,.06)');
    const vk = .8 + .35 * clamp(F('voc', t, 3));
    const g = (t0) => ease.out(inv(t0 - .1, t0 + .9, t)) * vk;
    for (const [kind, v, l, t0, k, sd] of GLYPHS) glyph(t, kind, pick(v[0], l[0]), pick(v[1], l[1]), pick(v[2], l[2]), g(t0) * k, sd);
    ground(hz + 10, '#2e1410', '#06070f');
    rivers(t, hz, .8, 1, 5);
    wyrd(t, SC - 10, 1450, 320, { view: 'back', guitar: 'none', arms: 'down', wind: .8, rim: 'rgba(255,170,90,.9)', lit: .1 });
    glow(SC + 260, 1460, 200, 'rgba(255,130,50,.25)'); // the campfire, off his shoulder
  }

  // 12 · "calling your name": storm clouds roll in and break the burning sky apart (into c8)
  function breakup(t, lt, dur) {
    const z = kf(lt, [[0, 1.0], [dur, 1.22]], ease.in);
    frame(SC, kf(lt, [[0, 900], [dur, 720]], ease.inOut), pick(z, z * .76));
    const hz = 1320, cover = ease.inOut(inv(tCalling - .4, Z - .25, t));
    plains(t, { hz, burn: 1, stars: 0 });
    const gk = (1 - cover) * .8;
    for (const [kind, v, l, , k, sd] of GLYPHS.slice(0, 4)) glyph(t, kind, pick(v[0], l[0]), pick(v[1], l[1]) - lt * 30, pick(v[2], l[2]), gk * k, sd);
    stormClouds(t, cover, 1 - cover * .5, hit(t, tName2 + .45, 6));
    ground(hz + 10, '#2a1410', '#06070f');
    rivers(t, hz, .6, 1, 5);
    wyrd(t, SC - 10, 1450, 320, { view: 'back', guitar: 'none', arms: 'down', wind: 1, rim: 'rgba(255,170,90,.9)', lit: .1 });
    glow(SC + 260, 1460, 200, `rgba(255,130,50,${.25 * (1 - cover * .6)})`);
  }

  chapter('serpent', A, Z, [
    [A, kindle, { xin: .5 }],
    [tFire - .12, called],
    [tEchoes - .2, echoes],
    [tSmoke - .25, singing],
    [tDream - .35, dreamwide],
    [tBlazing - .2, blaze],
    [tCalled2 + 1.4, close],
    [tSaid - 1.1, said],
    [tSmoke2 - .2, riversShot],
    [tSky - .3, ignite],
    [tOld - .25, oldones],
    [tCalling - .3, breakup],
  ], { paint: look });
})();
