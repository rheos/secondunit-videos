// c10 · LAST CLAPS (SEC.out - SEC.end). The sun as a giant halo over the dawn river, lilies round it. Four
// claps with hands (CLAPS[12..15]), each a bigger bloom than the last, a new framing per clap; after the last
// the hands turn into the hand-shadow bird, which beats its wings through the held note and flies off into
// the sun, then the ring-out fades into cream-gold light.
(() => {
  // ---- private helpers (the same sky, sun and river as c09, so the cut is invisible) ----
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, k) => { const A = rgb(a), B = rgb(b); k = clamp(k); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
  const ell = (x, y, rx, ry, n = 24) => [...Array(n)].map((_, i) => [x + Math.cos(i / n * TAU) * rx, y + Math.sin(i / n * TAU) * ry]);
  const stroke2 = (pts, w, col) => { line(pts, C.umber, w + 10); line(pts, col, w); };
  function blackF(pts) { f.save(); f.globalCompositeOperation = 'source-over'; P(f, pts); f.closePath(); f.fillStyle = '#000'; f.fill(); f.restore(); }
  function skyCol(v, k) {
    const st = [[0, mix(C.plum, mix(C.amber, C.parch, .45), k)], [.25, mix(C.plum, C.blush, k)], [.6, mix(C.dusk, C.rose, k)], [1, mix(C.night, mix(C.dusk, C.rose, .45), k)]];
    for (let i = 1; i < st.length; i++) if (v <= st[i][0]) return mix(st[i - 1][1], st[i][1], inv(st[i - 1][0], st[i][0], v));
    return st[st.length - 1][1];
  }
  function sky(yH, span, k) { s.fillStyle = vgrad(yH - span, yH, [[0, skyCol(1, k)], [.4, skyCol(.6, k)], [.75, skyCol(.25, k)], [1, skyCol(0, k)]]); s.fillRect(-2500, yH - 4000, 6000, 4002); }
  function clouds(yH, k, t, n, seed) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) { const y = yH - 180 - r() * 640, L = 420 + r() * 380, x0 = ((r() * 1800 + t * (14 + r() * 18)) % 2000) - 600, dir = r() < .5 ? 1 : -1;
      vine(s, whip([x0, y], [x0 + L * .3, y - 40], [x0 + L * .7, y + 34], [x0 + L, y - 10], .55, dir, 26), 30, 10, mix(C.rose, C.blush, k), 1); }
  }
  function sun(cx, cy, R, rot, lit, rayK) {
    const n = 20;
    for (let i = 0; i < n; i++) { const a = rot * .6 + i / n * TAU, L = R * (i % 2 ? .45 : .75) * rayK * (1 + .08 * Math.sin(i * 1.7 + rot * 9)); if (L > 8) petal(s, cx + Math.cos(a) * R * .92, cy + Math.sin(a) * R * .92, a, L, R * .11, i % 2 ? C.parch : C.gold, C.umber, 12); }
    halo(cx, cy, R, rot, lit);
    glowAt(cx, cy, R * 2.4, `rgba(255,190,120,${.2 * lit})`);
  }
  function skyline(yH, k, seed = 10, x0 = -600, x1 = 1700, hk = 1) {
    const r = rng(seed), pts = [[x0, yH + 14]]; let x = x0;
    while (x < x1) {
      const w = 70 + r() * 110, h = (30 + r() * 80) * hk, ty = r();
      if (ty < .3) { pts.push([x, yH - h * .6]); for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; pts.push([x + w / 2 + Math.cos(a) * w / 2, yH - h * .6 + Math.sin(a) * w * .5 * hk]); } pts.push([x + w, yH - h * .6]); }
      else if (ty < .45) pts.push([x, yH - h], [x + w / 2, yH - h - 90 * hk], [x + w, yH - h]);
      else pts.push([x, yH - h], [x + w * .2, yH - h], [x + w * .2, yH - h - 26], [x + w * .32, yH - h - 26], [x + w * .32, yH - h], [x + w, yH - h]);
      x += w; pts.push([x, yH - (20 + r() * 20) * hk]);
    }
    pts.push([x1, yH + 14]); shape(s, pts, mix(C.plum, C.dusk, k * .5), C.umber, 12); blackF(pts);
  }
  function water(yH, yB, t, sx) {
    s.fillStyle = vgrad(yH, yB, [[0, mix(C.rose, C.parch, .45)], [.3, mix(C.teal, C.rose, .45)], [1, mix(C.deep, C.teal, .8)]]); s.fillRect(-2500, yH, 6000, 5000);
    blackF([[-2500, yH], [3500, yH], [3500, yH + 5000], [-2500, yH + 5000]]);
    const N = 13;
    for (let i = 0; i < N; i++) { const v = (i + .5) / N, y = yH + (yB - yH) * Math.pow(v, 1.7), w = lerp(4, 20, v), L = lerp(70, 360, v);
      for (let j = 0; j < 6; j++) { const x = ((hash(i * 31 + j * 7 + 3) * 2000 + t * lerp(12, 60, v) * (j % 2 ? 1 : .7)) % 2000) - 460; stroke2(cub([x, y], [x + L * .3, y - w * 1.4], [x + L * .7, y + w * 1.4], [x + L, y], 10), w, (i + j) % 3 ? mix(C.deep, C.sage, .9) : mix(C.dusk, C.gold, .8)); } }
    for (let i = 0; i < N + 4; i++) { const v = (i + .3) / (N + 4), y = yH + 8 + (yB - yH) * Math.pow(v, 1.7), hw = lerp(30, 230, v) * (.7 + .3 * Math.sin(t * 3 + i * 1.9)), hh = lerp(4, 18, v), x = sx + Math.sin(t * 1.3 + i * 2.3) * lerp(6, 40, v);
      shape(s, ell(x, y, hw, hh, 20), i % 2 ? C.gold : C.parch, C.umber, 8); glowAt(x, y, hw * 1.2, 'rgba(255,210,140,.22)'); }
  }
  // the sun on the river, with a ring of lilies and whiplash tendrils that unfurl to u; bloom 0..1
  const SX = 540, SY = 720, SR = 300, YH = 1100;
  // lev 0..3 grows the bloom clap by clap: longer tendrils, a second ring of tendrils, bigger and more lilies
  function scene(t, lit, u, bloom, lev = 0) {
    sky(YH, 1400, 1); clouds(YH, 1, t, 4, 41);
    // tendrils whip out from behind the sun and curl
    const tl = 1 + .18 * lev;
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + .13 + t * .03, dir = i % 2 ? 1 : -1, R = (q) => [SX + Math.cos(a + q[1] * dir) * q[0], SY + Math.sin(a + q[1] * dir) * q[0]];
      vine(s, whip(R([SR * 1.02, 0]), R([SR * (1 + .3 * tl), .14]), R([SR * (1 + .62 * tl), .34]), R([SR * (1 + .8 * tl), .55]), .8, dir, 36), 22 + 4 * lev, 9, i % 3 ? C.sage : C.gold, u);
    }
    if (lev >= 2) for (let i = 0; i < 12; i++) {
      const a = (i + .5) / 12 * TAU + .13 - t * .04, dir = i % 2 ? -1 : 1, R = (q) => [SX + Math.cos(a + q[1] * dir) * q[0], SY + Math.sin(a + q[1] * dir) * q[0]];
      vine(s, whip(R([SR * 1.02, 0]), R([SR * 1.5, .2]), R([SR * 1.95, .45]), R([SR * (2.1 + .3 * (lev - 2)), .75]), .9, dir, 36), 20, 8, i % 2 ? C.rose : C.blush, u);
    }
    sun(SX, SY, SR, t * .05, lit, 1.25 + .1 * lev + .12 * beatPulse(t, 5) + .2 * (u - .5));
    skyline(YH, 1, 10, -600, 1700, .55);
    water(YH, 2500, t, SX);
    // the lily ring round the halo, and from the third clap an outer ring
    const n = 10 + 2 * lev;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU - Math.PI / 2 + .31 + t * .04, R = SR * 1.32, sway = Math.sin(t * 2 + i) * .06;
      lily(s, SX + Math.cos(a) * R, SY + Math.sin(a) * R, a + sway, 78 * (1 + .12 * lev), clamp(bloom * (i % 2 ? 1 : .9) + .05 * beatPulse(t, 6)), i % 2 ? [C.cream, C.blush] : [C.gold, C.cream]);
    }
    if (lev >= 2) for (let i = 0; i < 14; i++) {
      const a = (i + .5) / 14 * TAU - Math.PI / 2 - t * .03, R = SR * (1.95 + .15 * (lev - 2)), sway = Math.sin(t * 1.7 + i) * .08;
      lily(s, SX + Math.cos(a) * R, SY + Math.sin(a) * R, a + sway, 96 + 16 * (lev - 2), clamp(bloom), i % 2 ? [C.rose, C.cream] : [C.blush, C.gold]);
    }
  }
  // the hands on the light layer in black, so the sun's glow sits behind them instead of washing them out
  function hands(t, cx, cy, sc, k) {
    clapPair(t, cx, cy, sc, k);
    const s0 = s; s = f; f.save(); f.globalCompositeOperation = 'source-over'; f.globalAlpha = .85; f.filter = 'brightness(0)';
    try { clapPair(t, cx, cy, sc, k); } finally { f.restore(); s = s0; }
  }
  // motes of light drifting up through the frame
  function motes(t, n, a) { for (let i = 0; i < n; i++) { const x = 140 + hash(i * 7) * 800 + Math.sin(t + i) * 30, y = 1500 - ((t * (60 + 50 * hash(i * 3)) + hash(i * 11) * 1200) % 1300); glowAt(x, y, 14 + 10 * hash(i), `rgba(255,236,190,${a * (.4 + .6 * beatPulse(t + i * .05, 5))})`); } }

  // ---- shots ----
  // 180.633: cut on the clap: the hands meet in the sun's halo (the boat has just gone into it), the lilies
  // burst open, the tendrils whip out and curl; then the hands drift apart, rocking on the beat
  function clapA(t, lt, dur) {
    const k = CLAPS[12], u = ease.out(inv(k - .05, k + 1.1, t)), bloom = ease.back(inv(k, k + .7, t)) * .9 + .1 * ease.back(inv(HANDS[12], HANDS[12] + .6, t));
    cam(540, kf(lt, [[0, 720], [dur, 740]]), kf(lt, [[0, 1.6], [dur, 1.7]], ease.out));
    scene(t, .55 + .45 * hit(t, k, 2.2) + .2 * hit(t, HANDS[12], 3), .12 + .88 * u, bloom);
    glowAt(SX, SY, 760, `rgba(255,226,170,${.4 * hit(t, k, 3)})`);
    hands(t, SX, 630, 175, k);
    motes(t, 12, .5);
    border(t, 1);
  }
  // a clap's bloom: tendrils draw back in before it (from `from`), then unfurl past it; lilies likewise
  function bloomAt(t, k, from) {
    const back = ease.inOut(inv(from, k - .35, t)), on = ease.out(inv(k - .05, k + .9, t)), ob = ease.back(inv(k, k + .6, t));
    return { u: lerp(lerp(1, .3, back), 1, on), bloom: lerp(lerp(.95, .45, back), 1, ob) };
  }
  // 183.23: closer in on the halo, tilted a touch, the hands open and rocking; the tendrils draw back in,
  // then on the second clap they unfurl again and the lilies burst
  function clapB(t, lt, dur) {
    const k = CLAPS[13], { u, bloom } = bloomAt(t, k, 183.233);
    cam(540, kf(lt, [[0, 680], [dur, 650]]), kf(lt, [[0, 2.0], [dur, 2.25]], ease.in), kf(lt, [[0, .035], [dur, -.015]]));
    scene(t, .5 + .15 * beatPulse(t, 4) + .5 * hit(t, k, 2), u, bloom, 1);
    glowAt(SX, SY, 760, `rgba(255,226,170,${.45 * hit(t, k, 3)})`);
    hands(t, SX, 615, 165, k);
    motes(t, 14, .5);
    border(t, 1);
  }
  // 186.73: wider and lower, the river under the sun again, tilted the other way; the third clap grows an
  // outer ring of tendrils and lilies
  function clapC(t, lt, dur) {
    const k = CLAPS[14], { u, bloom } = bloomAt(t, k, 186.733);
    cam(kf(lt, [[0, 520], [dur, 560]]), kf(lt, [[0, 820], [dur, 760]]), kf(lt, [[0, 1.2], [dur, 1.36]], ease.inOut), kf(lt, [[0, -.03], [dur, .02]]));
    scene(t, .5 + .15 * beatPulse(t, 4) + .6 * hit(t, k, 2), u, bloom, 2);
    glowAt(SX, SY, 900, `rgba(255,226,170,${.5 * hit(t, k, 3)})`);
    hands(t, SX, 630, 175, k);
    motes(t, 18, .55);
    border(t, 1);
  }
  // ---- the last clap becomes the hand-shadow bird ----
  // Two hands, backs to us, overlapping at the heels of the palms; thumbs hooked together pointing up as the
  // head; each hand's four fingers held together as a wing, hinged at the knuckles. open 0 folded up .. 1
  // spread; lock: thumbs hooked; flap: extra wing angle (positive = down). flat: one colour, no line (shadow).
  const capsule = (x0, y0, x1, y1, r, n = 8) => { const a = Math.atan2(y1 - y0, x1 - x0), o = [];
    for (let i = 0; i <= n; i++) { const th = a + Math.PI / 2 - i / n * Math.PI; o.push([x1 + Math.cos(th) * r, y1 + Math.sin(th) * r]); }
    for (let i = 0; i <= n; i++) { const th = a - Math.PI / 2 - i / n * Math.PI; o.push([x0 + Math.cos(th) * r, y0 + Math.sin(th) * r]); }
    return o; };
  const rotE = (x, y, rx, ry, rot, n = 32) => [...Array(n)].map((_, i) => { const q = i / n * TAU, px = Math.cos(q) * rx, py = Math.sin(q) * ry; return [x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]; });
  const lerp2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  function birdHands(x, y, sc, open, lock, flap, flat = null) {
    s.save(); s.translate(x, y); s.scale(sc, sc);
    const lw = 13, sk = flat || C.blush, ln = flat ? null : C.umber;
    const part = (pts, col, w = lw) => shape(s, pts, flat || col, ln, w);
    // each hand's geometry: the wing direction u, across-the-fingers n, the knuckle pivot
    const geo = (d) => { const spread = lerp(.22, 1.12, open) + flap, a = -Math.PI / 2 + d * spread, ux = Math.cos(a), uy = Math.sin(a);
      return { a, ux, uy, nx: -uy * d, ny: ux * d, px: d * 118, py: -40 }; };
    const L = [250, 292, 282, 232], gap = 42, hw = 21, KN = 26;
    // the fingers: held together, bases running under the hand-back (no rounded base), tapering to round tips
    const fingers = (d) => {
      const { a, ux, uy, nx, ny, px, py } = geo(d), P0 = (o, k) => [px + nx * o + ux * k, py + ny * o + uy * k];
      // a backing under the four so no background shows between them
      const mn = Math.min(...L) - 10;
      shape(s, [P0(-2 * gap, -40), P0(2 * gap, -40), P0(2 * gap, KN + mn), P0(-2 * gap, KN + mn)], sk, null);
      for (let i = 3; i >= 0; i--) {
        const o = (i - 1.5) * gap, tipR = hw - 2, tc = KN + L[i] - tipR, pts = [P0(o - hw, -40), P0(o - tipR, tc)];
        for (let q = 1; q < 10; q++) { const th = Math.PI * q / 10; pts.push(P0(o - Math.cos(th) * tipR, tc + Math.sin(th) * tipR)); }
        pts.push(P0(o + tipR, tc), P0(o + hw, -40));
        shape(s, pts, sk, ln, lw * .8);
        if (!flat) {
          const [nxp, nyp] = P0(o, KN + L[i] - 50); petal(s, nxp, nyp, a, 36, 11, C.parch, C.umber, 7);
          const c0 = P0(o - hw * .6, KN + L[i] * .42), c1 = P0(o, KN + L[i] * .42 + 9), c2 = P0(o + hw * .6, KN + L[i] * .42);
          s.strokeStyle = C.umber; s.lineWidth = 7; s.lineCap = 'round'; s.beginPath(); s.moveTo(...c0); s.quadraticCurveTo(...c1, ...c2); s.stroke();
        }
      }
    };
    // the back of the hand: one broad shape from the heel out to a scalloped knuckle ridge over the finger bases
    const back = (d) => {
      const { ux, uy, nx, ny, px, py } = geo(d), P0 = (o, k) => [px + nx * o + ux * k, py + ny * o + uy * k];
      const pts = [[-d * 24, 98], [-d * 8, 14], [d * 16, -48]];
      pts.push(...cub([d * 16, -48], [d * 40, -90], lerp2(P0(-2 * gap, KN), [d * 16, -48], .5), P0(-2 * gap, KN), 8).slice(1));
      for (let i = 0; i < 4; i++) for (let q = 1; q <= 8; q++) { const v = q / 8, o = (i - 2 + v) * gap; pts.push(P0(o, KN + Math.sin(v * Math.PI) * 15)); }
      const k3 = P0(2 * gap, KN);
      pts.push(...cub(k3, [k3[0] - ux * 30 + d * 10, k3[1] - uy * 30 + 40], [d * 90, 130], [d * 46, 122], 10).slice(1));
      shape(s, pts, sk, ln, lw);
    };
    for (const d of [-1, 1]) fingers(d);
    for (const d of [-1, 1]) back(d);
    // the thumbs: reaching up from the inner edge of each hand; hooked, they cross into the bird's head
    for (const d of [1, -1]) { const tx = lock ? -d * 16 : d * 70, ty = lock ? -226 : -180; part(capsule(d * 30, -40, tx, ty, 27), C.rose, lw * .9); }
    if (lock && !flat) { s.fillStyle = C.umber; s.beginPath(); s.arc(5, -204, 11, 0, TAU); s.fill(); }
    s.restore();
  }
  // draw on s, then again in black on f so the sun's glow sits behind it
  function onBoth(fn, a = .85) { fn(); const s0 = s; s = f; f.save(); f.globalCompositeOperation = 'source-over'; f.globalAlpha = a; f.filter = 'brightness(0)'; try { fn(); } finally { f.restore(); s = s0; } }
  const K15 = CLAPS[15], T1 = 193.2, T2 = 193.4, T3 = 193.6, FLY = 194.9, GONE = 196.0;
  const holdT = (t) => Math.min(t, K15 + .05);   // clapPair's clock frozen at contact until the turn
  function birdPhase(t) { const c0 = (FLY - 193.833) / .5, dt = t - FLY; return t < FLY ? (t - 193.833) / .5 : c0 + 2 * dt + 1.3 * dt * dt; }
  // the end of the last clap: contact, two turning key drawings, the bird beating on the beat, then flying off
  function lastHands(t) {
    if (t < T1) { onBoth(() => clapPair(holdT(t), SX, 615, 170, K15)); return; }
    const fly = ease.in(inv(FLY, GONE, t)), bx = lerp(SX, 570, fly), by = lerp(690, 470, fly), sc = lerp(.68, .05, fly);
    const A = t < FLY ? .16 : lerp(.16, .42, inv(FLY, FLY + .4, t)), flap = t < T3 ? 0 : A * Math.cos(TAU * birdPhase(t));
    const open = t < T2 ? .12 : t < T3 ? .6 : 1, lock = t >= T2, y2 = t < T2 ? 40 : t < T3 ? 18 : 0, bob = t < T3 ? 0 : -flap * 40;
    // its shadow, large and soft across the halo behind
    if (t >= T2 && sc > .06) {
      const sa = .5 * inv(T2, T3 + .1, t) * (1 - inv(195.3, 195.9, t)), ssx = SX + 90 + (bx - SX) * 1.4, ssy = SY + 230 + (by - 690) * 1.5;
      const sh = () => birdHands(ssx, ssy, sc * 1.4, open, lock, flap * 1.05, mix(C.plum, C.umber, .6));
      s.save(); s.globalAlpha = sa; sh(); s.restore();
      const s0 = s; s = f; f.save(); f.globalCompositeOperation = 'source-over'; f.globalAlpha = Math.min(1, sa * 1.4); f.filter = 'brightness(0)'; try { sh(); } finally { f.restore(); s = s0; }
    }
    if (sc > .06) onBoth(() => birdHands(bx, by + y2 + bob, sc, open, lock, flap), .85);
    // light flares cover the key-drawing swaps; the bird is absorbed into the sun at the end
    glowAt(SX, 640, 420, `rgba(255,236,196,${.55 * hit(t, T1, 9) + .35 * hit(t, T2, 9) + .25 * hit(t, T3, 9)})`);
    if (fly > 0) glowAt(bx, by, 120 + 300 * fly, `rgba(255,236,190,${.6 * fly * (1 - inv(GONE, GONE + .4, t))})`);
  }
  // 190.8: push in tight on the hands in the ring for the last clap, the biggest bloom; after the clap the
  // hands turn into the bird
  function clapD(t, lt, dur) {
    const k = CLAPS[15], { u, bloom } = bloomAt(t, k, 190.8);
    cam(540, kf(lt, [[0, 700], [dur, 640]]), kf(lt, [[0, 1.75], [2.1, 2.05], [dur, 2.2]], ease.inOut));
    scene(t, .5 + .15 * beatPulse(t, 4) + .55 * hit(t, k, 1.6), u, bloom, 3);
    glowAt(SX, SY, 1000, `rgba(255,226,170,${.4 * hit(t, k, 2.5)})`);
    lastHands(t);
    motes(t, 20, .6);
    border(t, 1);
  }
  // 193.83: her held note: the bird of hands beats its wings on the beat, its shadow huge on the sun; as the
  // note ends it beats harder and flies up into the sun; then the ring-out fades into cream-gold light
  function hold(t, lt, dur) {
    cam(540, kf(t, [[193.833, 640], [194.4, 720], [FLY, 720], [196.2, 700]]), kf(t, [[193.833, 2.2], [194.4, 1.5], [FLY, 1.42], [196.4, 1.25]], ease.inOut));
    scene(t, .7 + .15 * beatPulse(t, 4) + .25 * inv(195.3, 196.0, t), 1, 1, 3);
    glowAt(SX, SY, 1100, `rgba(255,226,170,${.12 + .1 * Math.sin(t * 2.4)})`);
    lastHands(t);
    motes(t, 24, .6);
    border(t, 1);
    const p = ease.inOut(inv(195.6, 196.95, t));
    if (p > 0) {
      s.save(); s.setTransform(.5, 0, 0, .5, 0, 0); s.globalAlpha = p;
      s.fillStyle = rgrad(W / 2, H * .42, 80, H * .75, [[0, mix(C.cream, C.parch, .3)], [.6, C.parch], [1, mix(C.parch, C.gold, .6)]]); s.fillRect(0, 0, W, H);
      s.restore();
      f.save(); f.setTransform(.5, 0, 0, .5, 0, 0); f.globalAlpha = p * .85; f.fillStyle = '#000'; f.fillRect(0, 0, W, H);
      f.globalAlpha = 1; f.globalCompositeOperation = 'lighter'; const g = f.createRadialGradient(W / 2, H * .42, 0, W / 2, H * .42, H * .7); g.addColorStop(0, `rgba(255,226,170,${.22 * p})`); g.addColorStop(1, `rgba(255,190,110,${.1 * p})`); f.fillStyle = g; f.fillRect(0, 0, W, H);
      f.restore();
    }
  }
  chapter('c10', SEC.out, SEC.end, [[SEC.out, clapA], [183.233, clapB], [186.733, clapC], [190.8, clapD], [193.833, hold]], { fx: PAINT });
})();
