// c10 · LAST CLAPS (SEC.out - SEC.end). The sun as a giant halo over the dawn river, lilies round it. Four
// claps with hands (CLAPS[12..15]), each a bigger bloom than the last, a new framing per clap; on the last
// the hands hold together through the held note, then the ring-out fades into cream-gold light.
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
  // 190.8: push in tight on the hands in the ring for the last clap, the biggest bloom; the hands stay
  // pressed together through the held note
  const HOLD0 = CLAPS[15] + .05, HOLD1 = 194.9;
  const holdT = (t) => t < HOLD0 ? t : t < HOLD1 ? HOLD0 : HOLD0 + (t - HOLD1);   // clapPair's clock, frozen at contact while she holds
  function clapD(t, lt, dur) {
    const k = CLAPS[15], { u, bloom } = bloomAt(t, k, 190.8);
    cam(540, kf(lt, [[0, 700], [dur, 640]]), kf(lt, [[0, 1.75], [2.1, 2.05], [dur, 2.2]], ease.inOut));
    scene(t, .5 + .15 * beatPulse(t, 4) + .55 * hit(t, k, 1.6), u, bloom, 3);
    glowAt(SX, SY, 1000, `rgba(255,226,170,${.4 * hit(t, k, 2.5)})`);
    hands(holdT(t), SX, 615, 170, k);
    motes(t, 20, .6);
    border(t, 1);
  }
  // 193.83: the held note: pull back slowly from the held hands to the whole sun, every lily open; as the
  // note ends they part a little, and over the ring-out the frame fades into cream-gold light
  function hold(t, lt, dur) {
    const k = CLAPS[15];
    cam(540, kf(lt, [[0, 640], [dur, 760]]), kf(lt, [[0, 2.2], [dur, 1.3]], ease.inOut));
    scene(t, .75 + .2 * Math.sin(t * 3) * inv(194.9, 193.8, t) + .15 * beatPulse(t, 4), 1, 1, 3);
    glowAt(SX, SY, 1100, `rgba(255,226,170,${.12 + .1 * Math.sin(t * 2.4)})`);
    hands(holdT(t), SX, 615, 170, k);
    motes(t, 24, .6);
    border(t, 1);
    const p = ease.inOut(inv(195.2, 196.9, t));
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
