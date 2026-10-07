// js/ch/c10.js · THE CALLING (213.200 - 283.833) · the calling + instrumental tail · look: ink warming toward cracks, to black
// The last chapter. One location: a stone medicine-wheel ring on the night plain, torches on poles around
// it, a standing stone wheel at its back (his board #20), him at the centre. c9's flames sink into the
// torchlight; he takes up a torch and holds it high while the whole horizon burns, plays with it planted
// beside him, the stars come back, the stones and the ground glow, then every torch dies at once and he
// and the wolfdog walk out toward the first line of dawn as the film fades to black with the mix.
// The ground is a real plane in perspective (camera x, z, height; a shift lens, so verticals stay
// vertical), so every shot sees the same ring, the same torches, the same horizon.
(() => {
  const A = 213.2, Z = 283.833, SILENT = 280.5;
  const tCall = when('calling', 216), tWake = when('wake', 218), tTake = when('take', 221), tUp = when('up', 222.3), tTorch = when('torch', 222.5);
  const tStop = when('stop', 224), tFar = when('far', 227), tGone = when('gone', 230), tLong = when('long', 234);
  const tWorld = when('world', 237), tBurns = when('burns', 237), tSong = when('song', 243), tJust2 = when('just', 249), tDream = when('dream', 249);
  const tChange = when('changing', 255), tSeems = when('seems', 257), tToo = when('too', 263);
  const tOut = tToo + .05; // the vocal onset of the last line: every torch dies here

  // ---- the place (metres): ring centre at the origin, camera looks toward +Z (where dawn will come) ----
  const MAN = 1.85, RING = 4.2, TR = 5.0, DOGL = .8;
  const WHEEL = { X: 0, Z: 3.1, r: 1.75, y: 1.95 };
  const PLANT = { X: .55, Z: -.15 };            // the torch at his side (screen right) that he takes up
  const TORCHES = [...Array(8)].map((_, i) => { const a = (i + .5) / 8 * TAU; return { X: Math.cos(a) * TR, Z: Math.sin(a) * TR, i }; });
  const STONES = (() => { const o = [], n = 34;
    for (let i = 0; i < n; i++) { const a = i / n * TAU + (hash(i * 3 + 1) - .5) * .05, r = RING + (hash(i * 5 + 2) - .5) * .22; o.push({ X: Math.cos(a) * r, Z: Math.sin(a) * r, sz: .85 + hash(i * 7) * .45, u: i / n, spoke: 0 }); }
    for (let sp = 0; sp < 4; sp++) { const a = sp * Math.PI / 2 + Math.PI / 4; for (let d = .9; d < RING - .4; d += .55) { const k = o.length; o.push({ X: Math.cos(a) * d + (hash(k) - .5) * .08, Z: Math.sin(a) * d + (hash(k + 9) - .5) * .08, sz: .55 + hash(k * 3) * .4, u: d / RING, spoke: 1 }); } }
    return o; })();
  const SCRUB = (() => { const o = [], r = rng(1010); while (o.length < 46) { const X = (r() - .5) * 50, Zw = -14 + r() * 70; if (Math.hypot(X, Zw) < TR + 1.2) continue; o.push({ X, Z: Zw, sz: .25 + r() * .45, seed: o.length + 5 }); } return o; })();

  // shift-lens ground plane: V = { cx, cz, ch, hz, F }
  const P3 = (V, X, Zw, Y = 0) => { const D = Math.max(.05, Zw - V.cz), k = V.F / D; return { x: SC + (X - V.cx) * k, y: V.hz + (V.ch - Y) * k, k, D }; };
  const mx = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const P = p(a), Q = p(b); k = clamp(k); return '#' + P.map((v, i) => Math.round(lerp(v, Q[i], k)).toString(16).padStart(2, '0')).join(''); };

  // ---- the arc of the chapter (all pure functions of t) ----
  const fireK = (t) => t >= tOut ? 0 : kf(t, [[A, .35], [tStop, .42], [tFar + .5, 1], [tBurns, 1], [tSong, .78], [tDream, .62], [tChange, .75], [tToo, .95]]);
  const spreadK = (t) => kf(t, [[A, .2], [tStop - .3, .24], [tFar + .6, 1]], ease.inOut);
  const flareK = (t) => t < tWorld ? 0 : ease.out(inv(tWorld, tBurns + .3, t)) * Math.exp(-.5 * Math.max(0, t - tBurns - .3));
  const torchLit = (t) => t >= tOut ? 0 : 1 + .45 * ease.inOut(inv(tSeems, tToo, t)) + .25 * flareK(t);
  const afterOut = (t) => t < tOut ? 0 : Math.exp(-(t - tOut) / 8);          // the embers that hang, fading through the tail
  const stoneGlow = (t, st) => {
    if (t >= tOut) return .3 * Math.exp(-(t - tOut) * .9);
    const t0 = st.spoke ? tSeems - .1 + (1 - st.u) * .5 : tChange - .15 + st.u * 1.5;
    return ease.out(inv(t0, t0 + .6, t)) * (.75 + .25 * noise1(t * 2 + st.u * 9, 4)) * (1 + .3 * ease.inOut(inv(tSeems, tToo, t)));
  };
  const crackK = (t) => t >= tOut ? .35 * Math.exp(-(t - tOut) * 1.2) : ease.out(inv(tSeems + .3, 261.9, t));
  const starK = (t) => ease.inOut(inv(tJust2, tDream + .9, t)) * (t > tOut ? .8 : 1);
  const dawnK = (t) => kf(t, [[tOut + 1.2, 0], [268, .4], [272.5, .65], [277.5, 1]], ease.inOut);

  // ---- painted fire (after c4) ----
  function tongue(t, x, y, h, w, seed, hot = 1) {
    if (h < 4) return;
    const shape = (k, c) => flameShape(t, x, y, h, w, k, c, seed, 0);
    shape(1, '#7a1a0c'); shape(.7, '#c8431b'); if (hot > .3) shape(.4, '#f28a2c'); if (hot > .6) shape(.18, '#ffc05a');
  }
  function flameWall(t, y0, height, k, x0 = -300, x1 = STAGE + 300, seed = 7) {
    if (k <= .01) return;
    for (let i = 0; i < 20; i++) { const x = lerp(x0, x1, (i + hash(i * 3 + seed) * .6) / 20) + snoise(i, seed) * 70, hh = height * (.3 + .7 * noise1(t * 1.4 + i * 1.7, seed)) * k;
      tongue(t, x, y0, hh, (x1 - x0) / 20 * (1.1 + .9 * hash(i + seed)), i + seed * 30); }
    glow(SC, y0 - height * .3, 1100 * k, `rgba(255,120,40,${.08 * k})`);
  }
  // a torch flame at the head (x, y) of a torch, h = flame height px, w = half width
  function flame(t, x, y, h, w, seed, lit, near = 1) {
    const fl = .82 + .3 * noise1(t * 4.2 + seed, 3);
    tongue(t, x, y, h * fl, w, seed);
    tongue(t, x + w * .35 * snoise(t * 2 + seed, 5), y, h * .68 * fl, w * .7, seed + 7);
    const a = clamp(lit, 0, 1.1) * near;
    glow(x, y - h * .3, Math.min(h * 2 + 30, 900), `rgba(255,115,40,${.2 * a})`);
    glow(x, y - h * .25, h * .8 + 8, `rgba(255,205,140,${.42 * a})`);
    sparks(t, x, y - h * .4, w * 2.2, h * 2.8, 7, .7 * a, seed * 13 + 1);
  }
  // a torch: pole from base (bx, by) to head (hx, hy), k = px per metre. lit 0..1.5; emb = embers hanging after it dies
  function drawTorch(t, bx, by, hx, hy, k, lit, seed, emb = 0, near = 1) {
    taper(s, [bx, by], [hx, hy], .032 * k + .6, .026 * k + .5, '#2c1f16');
    const hw = .075 * k, hh = .2 * k;
    s.fillStyle = '#21160f'; s.beginPath(); s.ellipse(hx, hy - hh * .35, hw, hh * .55, 0, 0, TAU); s.fill();
    if (lit > .01) flame(t, hx, hy - hh * .6, .62 * k * lit, .13 * k, seed, lit, near);
    if (emb > .01) {
      // the dead head still glows as coals, a thin smoke wisp climbing off it, embers hanging round it
      dot(s, hx, hy - hh * .45, hw * .8, '#3a1a0e');
      glow(hx, hy - hh * .45, hw * 3 + 6, `rgba(255,90,30,${.3 * emb})`); dot(f, hx, hy - hh * .45, hw * .45 + 1, `rgba(255,120,50,${.6 * emb})`);
      const pts = []; for (let q = 0; q <= 12; q++) { const u = q / 12; pts.push([hx + Math.sin(u * 5 + t * .9 + seed) * .08 * k * u, hy - hh * .5 - u * 1.3 * k]); }
      stroke(s, pts, `rgba(120,110,104,${.35 * emb})`, .05 * k + 1);
      for (let i = 0; i < 12; i++) { const sp = .05 + .08 * hash(i * 3 + seed), ph = (t * sp + hash(i * 7 + seed)) % 1;
        const ex = hx + (hash(i * 11 + seed) - .5) * .5 * k + Math.sin(t * .6 + i) * .12 * k, ey = hy - hh * .5 - ph * 1.6 * k;
        dot(f, ex, ey, 1 + .02 * k * hash(i), `rgba(255,${130 + 70 * hash(i + 3) | 0},60,${emb * Math.sin(Math.PI * ph) * .85})`); }
    }
  }

  // ---- sky, ground, horizon fire ----
  function skyNight(t, V, fk, sp, fl, starA, dawn, x0, x1) {
    const hz = V.hz, heat = clamp(fk * (.45 + .55 * sp) + fl * .6);
    s.fillStyle = vgrad(s, hz - 2600, hz, [[0, '#07090f'], [.5, mx('#16182a', '#2e1a22', heat)], [.82, mx('#262638', '#6e3424', heat)], [.95, mx('#34324a', '#a85028', heat)], [1, mx(mx('#403c52', '#d06a30', heat), '#8a90a0', dawn)]]);
    s.fillRect(x0, hz - 8000, x1 - x0, 8000);
    // the stars return (c6): a band of the Milky Way across the sky, lighter indigo under it so the etch has a tone
    if (starA > .01) {
      s.save(); s.globalAlpha = .55 * starA; s.translate(SC + 150, hz - 1500); s.rotate(-.55); s.scale(1, .18);
      s.fillStyle = rgrad(s, 0, 0, 0, 2600, [[0, '#3a3f66'], [.5, '#1c2140'], [1, 'rgba(12,14,30,0)']]); s.fillRect(-2600, -2600, 5200, 5200); s.restore();
      const r = rng(611), ca = Math.cos(-.55), sa = Math.sin(-.55);
      for (let i = 0; i < 700; i++) { const al = (r() - .5) * 5200, ac = (r() + r() + r() - 1.5) * 260, x = SC + 150 + al * ca - ac * sa, y = hz - 1500 + al * sa + ac * ca;
        if (y > hz - 40) continue; const tw = .6 + .4 * Math.sin(t * (1 + r() * 3) + i);
        dot(f, x, y, .7 + r() * 1.6, `rgba(235,236,255,${starA * tw * (.25 + .6 * r())})`); }
      for (let i = 0; i < 9; i++) { const al = (i / 8 - .5) * 4200; glow(SC + 150 + al * ca, hz - 1500 + al * sa, 420, `rgba(150,160,230,${.05 * starA})`); }
      stars(t, 612, 420, x0, x1, hz - 4200, hz - 60, starA);
    }
    stars(t, 613, 90, x0, x1, hz - 3800, hz - 300, .35 * (1 - starA) * (1 - heat * .6)); // a few stars through the smoke
    // smoke banks drifting over the horizon, lit from below by the fire
    const r = rng(620);
    for (let i = 0; i < 11; i++) { const cy = hz - 120 - r() * 1400, w = 700 + r() * 1500, h = 40 + r() * 90, cx = ((r() * 6000 + t * (6 + r() * 10)) % 6000) - 2000;
      s.fillStyle = mx(mx('#0d0c12', '#4a2016', heat * clamp(1 - (hz - cy) / 1200)), '#1a1c26', dawn * .5); s.globalAlpha = .75 * (1 - starA * .7); s.beginPath(); s.ellipse(cx, cy, w / 2, h / 2, 0, 0, TAU); s.fill(); s.globalAlpha = 1; }
    // the first line of dawn, off to the right where they'll walk
    if (dawn > .01) {
      s.save(); s.translate(SC + 520, hz); s.scale(1, .11); s.globalAlpha = clamp(dawn);
      s.fillStyle = rgrad(s, 0, 0, 0, 2600, [[0, '#b8a488'], [.35, '#6d7486'], [1, 'rgba(40,46,64,0)']]); s.fillRect(-2600, -2600, 5200, 2600); s.restore();
      glow(SC + 520, hz - 8, 900, `rgba(255,205,160,${.12 * dawn})`);
      stroke(f, [[SC - 700, hz - 5], [SC + 1800, hz - 5]], `rgba(255,215,170,${.12 * dawn})`, 5);
    }
    // the far land: low mesas along the horizon
    mesas(hz + 4, 60, mx('#0b090b', '#1a1418', dawn * .6), 1071, x0, x1);
  }
  function horizonFire(t, V, fk, sp, fl, x0, x1, fh = 1) {
    if (fk < .01) return;
    const hz = V.hz + 4, n = 120, span = x1 - x0, mid = SC, reach = sp * span * .55;
    // smoke columns rising off the burning horizon
    for (let i = 0; i < 8; i++) { const bx = lerp(x0 + 300, x1 - 300, (i + hash(i + 70) * .5) / 8), on = clamp((reach - Math.abs(bx - mid)) / 400) * fk;
      if (on < .02) continue;
      for (let q = 0; q < 7; q++) { const ph = (t * .05 + q / 7 + hash(i * 9)) % 1, rr = 50 + ph * 260, y = hz - 30 - ph * 900, x = bx + ph * 260 + Math.sin(t * .3 + i + ph * 3) * 40;
        s.fillStyle = mx('#4a1e12', '#120d0e', ph); s.globalAlpha = .45 * on * (1 - ph * .6); s.beginPath(); s.arc(x, y, rr, 0, TAU); s.fill(); } }
    s.globalAlpha = 1;
    const boost = 1 + 3.2 * fl;
    for (let i = 0; i < n; i++) {
      const x = x0 + (i + hash(i * 3 + 1) * .7) / n * span, d = Math.abs(x - mid);
      const on = Math.max(clamp((reach - d) / 260), hash(i * 5 + 2) < .2 ? .55 : 0);
      const nz = noise1(t * 1.1 + i * 1.7, 4) * .7 + noise1(i * .37 + t * .2, 9) * .5, hh = (5 + 60 * nz * nz) * fk * on * boost * fh;
      tongue(t, x, hz, hh, span / n * .55, i + 40, .5 + .5 * clamp(fl * 2 + fk * .5));
    }
    s.fillStyle = `rgba(200,70,28,${.8 * fk * clamp(sp * 1.5)})`; s.fillRect(mid - reach, hz - 5, reach * 2, 9);
    for (let j = 0; j <= 12; j++) { const x = lerp(x0, x1, j / 12), on = Math.max(.25, clamp((reach - Math.abs(x - mid)) / 300));
      glow(x, hz - 16, 300 * (1 + fl * .8), `rgba(255,100,35,${.075 * fk * on * (1 + fl * .35)})`); }
    stroke(f, [[x0, hz - 3], [x1, hz - 3]], `rgba(255,120,50,${.14 * fk * clamp(sp * 1.4)})`, 4 + 10 * fl);
  }
  function groundPlane(t, V, fk, dawn, lights, x0, x1) {
    s.fillStyle = vgrad(s, V.hz, V.hz + 1600, [[0, mx(mx('#4a3628', '#8a4a28', fk * .7), '#6a6a74', dawn * .7)], [.1, mx('#3a2e26', '#4a4a52', dawn * .4)], [.4, '#30271f'], [1, '#261f1a']]);
    s.fillRect(x0, V.hz, x1 - x0, 9000);
    // torchlight pools on the ground: the mid-tones the etch needs
    for (const L of lights) { if (L.lit < .02) continue; const p = P3(V, L.X, L.Z), rx = Math.min(2.8 * p.k, 4000), sq = clamp(V.ch / p.D, .06, 1);
      s.save(); s.translate(p.x, p.y); s.scale(1, sq); s.globalAlpha = clamp(.62 * L.lit);
      s.fillStyle = rgrad(s, 0, 0, 0, rx, [[0, '#c07a44'], [.35, '#7a4626'], [1, 'rgba(40,28,20,0)']]); s.fillRect(-rx, -rx, rx * 2, rx * 2); s.restore(); }
  }
  function drawStone(V, p, sz, warm, gk) {
    const rx = .21 * sz * p.k, hh = .17 * sz * p.k, ry = rx * clamp(V.ch / p.D, .1, 1) * .8;
    if (rx < .7 || p.D < 1.4) return;
    const dome = (c, k) => { s.fillStyle = c; s.beginPath(); s.ellipse(p.x, p.y, rx * k, hh * k, 0, Math.PI, TAU); s.ellipse(p.x, p.y, rx * k, ry * k, 0, 0, Math.PI); s.fill(); };
    dome(vgrad(s, p.y - hh, p.y + ry, [[0, mx('#4a423c', '#c88a5a', warm)], [.6, mx('#2a2420', '#7a4a2e', warm)], [1, '#15110f']]), 1);
    if (gk > .01) { s.globalAlpha = clamp(gk); dome('#c24a1a', .96); s.fillStyle = '#ffa050'; s.beginPath(); s.ellipse(p.x, p.y - hh * .5, rx * .55, hh * .35, 0, 0, TAU); s.fill(); s.globalAlpha = 1;
      glow(p.x, p.y - hh * .5, rx * 3.4 + 8, `rgba(255,105,35,${.3 * gk})`); }
  }
  // the standing stone wheel (his board #20): a ring of blocks with a post and a beam, at the ring's back
  function drawWheel(t, V, fk, gk, warm) {
    const c = P3(V, WHEEL.X, WHEEL.Z, WHEEL.y), k = c.k, r = WHEEL.r * k, n = 15;
    const base = P3(V, WHEEL.X, WHEEL.Z, 0);
    for (let i = 0; i < n; i++) { const a = i / n * TAU - Math.PI / 2 + .08, a2 = a + TAU / n - .045;
      s.fillStyle = mx(i % 2 ? '#221d1a' : '#2c2622', '#7a4a2e', warm); s.beginPath(); s.arc(c.x, c.y, r * 1.12, a, a2); s.arc(c.x, c.y, r * .84, a2, a, true); s.closePath(); s.fill();
      if (gk > .01) { s.globalAlpha = clamp(gk * .8); s.fillStyle = '#b8461a'; s.fill(); s.globalAlpha = 1; } }
    for (let i = -2; i <= 2; i++) dot(s, c.x + i * .32 * k, base.y - .06 * k, .2 * k, '#1a1614'); // footing stones
    // the burning horizon behind it catches the top of the ring
    f.save(); f.globalCompositeOperation = 'lighter'; f.lineCap = 'round'; f.strokeStyle = `rgba(255,140,70,${.22 * fk + .5 * gk})`; f.lineWidth = .05 * k + 1;
    f.beginPath(); f.arc(c.x, c.y, r * 1.13, Math.PI * 1.08, Math.PI * 1.92); f.stroke(); f.restore();
    if (gk > .01) glow(c.x, c.y, r * 1.6, `rgba(255,100,35,${.14 * gk})`);
  }
  // the wolfdog sitting (after c5's): haunches down, chest up, ears up, the tail curled on the ground
  function dogSits(t, x, y, sc, d = 1, g = s, c = '#141214') {
    const h = sc * .55, br = Math.sin(t * TAU / 3.1) * sc * .006;
    g.fillStyle = c;
    g.beginPath(); g.ellipse(x - sc * .2 * d, y - h * .32, sc * .24, h * .34, 0, 0, TAU); g.fill();
    g.beginPath(); g.moveTo(x - sc * .34 * d, y - h * .1); g.quadraticCurveTo(x - sc * .3 * d, y - h * .95, x + sc * .02 * d, y - h * 1.28 + br);
    g.lineTo(x + sc * .16 * d, y - h * 1.2 + br); g.quadraticCurveTo(x + sc * .2 * d, y - h * .6, x + sc * .1 * d, y); g.lineTo(x - sc * .3 * d, y); g.fill();
    taper(g, [x + sc * .06 * d, y - h * .55], [x + sc * .1 * d, y], sc * .045, sc * .035, c); taper(g, [x - sc * .02 * d, y - h * .55], [x + sc * .02 * d, y], sc * .045, sc * .035, c);
    g.beginPath(); g.ellipse(x - sc * .05 * d, y - sc * .02, sc * .12, sc * .035, 0, 0, TAU); g.fill();
    stroke(g, [[x - sc * .4 * d, y - h * .14], [x - sc * .56 * d, y - h * .05], [x - sc * .48 * d, y], [x - sc * .2 * d, y - sc * .01]], c, sc * .085);
    const hd = [x + sc * .12 * d, y - h * 1.42 + br + Math.sin(t * .7) * sc * .01];
    taper(g, [x + sc * .06 * d, y - h * 1.15 + br], hd, sc * .12, sc * .09, c);
    g.save(); g.translate(hd[0], hd[1]); g.scale(d, 1);
    g.beginPath(); g.moveTo(-sc * .08, -sc * .06); g.lineTo(sc * .2, sc * .02); g.lineTo(sc * .18, sc * .07); g.lineTo(-sc * .08, sc * .09); g.fill();
    poly(g, [[-sc * .07, -sc * .04], [-sc * .03, -sc * .2], [sc * .02, -sc * .04]], c); poly(g, [[sc * .01, -sc * .05], [sc * .06, -sc * .19], [sc * .09, -sc * .03]], c);
    g.restore();
  }

  // ---- his torch arm: two-bone IK from the shoulder to a hand target (the rig's own arm on that side is
  // hidden inside the silhouette, so there is only ever one arm on that side) ----
  function ik(S, H, L1, L2, bend) {
    let dx = H[0] - S[0], dy = H[1] - S[1], d = Math.hypot(dx, dy) || 1; const dm = (L1 + L2) * .995;
    if (d > dm) { H = [S[0] + dx / d * dm, S[1] + dy / d * dm]; d = dm; }
    const a = Math.atan2(dy, dx), b = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const E1 = [S[0] + Math.cos(a + b) * L1, S[1] + Math.sin(a + b) * L1], E2 = [S[0] + Math.cos(a - b) * L1, S[1] + Math.sin(a - b) * L1];
    // a fixed bend sign pointed the elbow up or in toward his head (Robin, 3:42). A real elbow hangs out and
    // down: bend = +1 takes the elbow lying further toward screen right + down (his right arm), -1 the other
    const od = (E) => (E[0] - S[0]) + (E[1] - S[1]);
    return { E: (od(E1) > od(E2)) === (bend > 0) ? E1 : E2, H };
  }
  const shoulderR = (J, u, turn = 0) => [J.neck[0] + (10.5 * (1 - Math.abs(turn) * .15) - 1.2) * u, J.neck[1] + 8.5 * u];
  function drawArm(g, S, H, u, c, wind = .4, t = 0, rimA = 0) {
    const { E, H: h2 } = ik(S, H, 15 * u, 14.5 * u, 1);
    taper(g, S, E, 3.3 * u, 2.7 * u, c); taper(g, E, h2, 2.7 * u, 2 * u, c); dot(g, h2[0], h2[1], 2.2 * u, c);
    if (g === s && rimA > 0) { // the torch above catches the top edge of the sleeve, so the black arm reads against the night
      const side = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; let nx = -dy / L, ny = dx / L; if (ny > 0) { nx = -nx; ny = -ny; } return [[a[0] + nx * w, a[1] + ny * w], [b[0] + nx * w * .8, b[1] + ny * w * .8]]; };
      f.save(); f.globalCompositeOperation = 'lighter';
      stroke(f, side(S, E, 3 * u), `rgba(255,160,90,${.35 * rimA})`, .9 * u); stroke(f, side(E, h2, 2.4 * u), `rgba(255,175,100,${.5 * rimA})`, .9 * u); f.restore(); }
    for (let k = 0; k < 3; k++) { const q = lerp(E, h2, .15 + k * .2); taper(g, q, [q[0] + (wind * 3 + snoise(t + k, 80)) * u, q[1] + (5 + k * 1.5) * u], .9 * u, .3 * u, c); } // the sleeve's rags
    return h2;
  }

  // ---- the whole place, depth-sorted. o: { man, dog, planted, held, stars, dawn } ----
  function scene(t, V, o = {}) {
    const x0 = -2600, x1 = STAGE + 2600;
    const fk = fireK(t), sp = spreadK(t), fl = flareK(t), lit = torchLit(t), emb = afterOut(t), dawn = o.dawn ?? dawnK(t);
    const flick = (i) => lit * (.85 + .3 * noise1(t * 3.3 + i * 7, 12));
    const lights = TORCHES.map((q) => ({ X: q.X, Z: q.Z, lit: flick(q.i) }));
    const plantLit = o.planted ? lit : 0;
    if (o.planted) lights.push({ X: PLANT.X, Z: PLANT.Z, lit: plantLit * 1.1 });
    if (o.man && o.man.hold != null) lights.push({ X: o.man.X + .35, Z: o.man.Z - .1, lit: lit * 1.2 });
    skyNight(t, V, fk, sp, fl, o.stars ?? starK(t), dawn, x0, x1);
    horizonFire(t, V, fk, sp, fl, x0, x1, o.fireH ?? 1);
    groundPlane(t, V, fk, dawn, lights, x0, x1);
    // the ground cracks with light (c5), radiating out from under him across the ring
    const ck = crackK(t);
    if (ck > .01) { const p = P3(V, 0, 0), sq = clamp(V.ch / p.D, .12, 1) * .9;
      cracks(t, p.x, p.y + 2, 6 * p.k, ck, 17, sq); cracks(t, p.x, p.y + 2, 4.5 * p.k, ck, 29, sq);
      s.save(); s.translate(p.x, p.y); s.scale(1, sq); s.globalAlpha = clamp(ck * .7); s.fillStyle = rgrad(s, 0, 0, 0, 4.4 * p.k, [[0, '#8a3a18'], [.5, '#4a2012'], [1, 'rgba(40,18,12,0)']]);
      s.fillRect(-4.4 * p.k, -4.4 * p.k, 8.8 * p.k, 8.8 * p.k); s.restore(); glow(p.x, p.y, 3.5 * p.k, `rgba(255,95,30,${.12 * ck})`); }
    if (o.pre) o.pre(V, fk);
    const warmAt = (X, Zw) => { let w = 0; for (const L of lights) w += L.lit * Math.exp(-Math.hypot(X - L.X, Zw - L.Z) / 1.5); return clamp(w * .6); };
    const items = [];
    const add = (Zw, fn) => { const D = Zw - V.cz; if (D > .3) items.push({ D, fn }); };
    for (const b of SCRUB) add(b.Z, () => { const p = P3(V, b.X, b.Z); if (p.k * b.sz > 1.5) bush(p.x, p.y, b.sz * p.k, '#100c0b', b.seed); });
    for (const st of STONES) add(st.Z, () => { const p = P3(V, st.X, st.Z); drawStone(V, p, st.sz, warmAt(st.X, st.Z), stoneGlow(t, st)); });
    add(WHEEL.Z, () => drawWheel(t, V, fk, stoneGlow(t, { u: .5, spoke: 0 }) * .8, warmAt(WHEEL.X, WHEEL.Z) * .6));
    for (const q of TORCHES) add(q.Z, () => { const b = P3(V, q.X, q.Z), h = P3(V, q.X, q.Z, 1.55); drawTorch(t, b.x, b.y, h.x, h.y, b.k, flick(q.i), q.i * 5 + 3, emb, clamp(b.D / 1.5)); });
    if (o.planted) add(PLANT.Z, () => { const b = P3(V, PLANT.X, PLANT.Z), h = P3(V, PLANT.X, PLANT.Z, 1.55); drawTorch(t, b.x, b.y, h.x, h.y, b.k, plantLit * 1.05, 91, emb, clamp(b.D / 1.2)); });
    if (o.dog) { const d = o.dog; add(d.Z, () => { const p = P3(V, d.X, d.Z), sc = DOGL * p.k;
      const rimC = d.rim || 'rgba(255,150,80,.4)', o2 = sc * .025;
      if (d.walk != null) { f.save(); f.globalAlpha = .45; wolfdog(t, p.x + o2, p.y - o2, sc, { dir: d.dir ?? 1, walk: d.walk, fur: rimC, dark: rimC, g: f }); f.restore();
        occlude(() => wolfdog(t, p.x, p.y, sc, { dir: d.dir ?? 1, walk: d.walk, fur: '#000000', dark: '#000000', g: f })); wolfdog(t, p.x, p.y, sc, { dir: d.dir ?? 1, walk: d.walk, sil: true }); }
      else { f.save(); f.globalAlpha = .45; dogSits(t, p.x + o2, p.y - o2, sc, d.dir ?? 1, f, rimC); f.restore(); occlude(() => dogSits(t, p.x, p.y, sc, d.dir ?? 1, f, '#000')); dogSits(t, p.x, p.y, sc, d.dir ?? 1); } }); }
    if (o.man) add(o.man.Z, () => drawMan(t, V, o.man, lit));
    items.sort((a, b) => b.D - a.D); for (const it of items) it.fn();
    return { fk, fl, lit };
  }
  // M: { X, Z, o (wyrd options), hold: hand target [dx, dy] in body units from his shoulder, or null, grip: world hand pos override }
  function drawMan(t, V, M, lit) {
    const p = P3(V, M.X, M.Z), h = MAN * p.k, u = h / 100, o = { guitar: 'none', arms: 'down', wind: .5, lit: .15, ...M.o };
    const holding = M.hold != null || M.grip;
    if (holding) o.sil = true;
    if (M.occl !== false) occlude(() => wyrd(t, p.x, p.y, h, { ...o, sil: true, g: f }));
    const J = wyrd(t, p.x, p.y, h, o);
    // in the close-up the pendant alone reads as a tiny figure: string its beads up to the collar so it reads as the necklace
    if (M.strand && J.chest) for (const d of [-1, 1]) { const pts = bez([J.neck[0] + d * 3.6 * u, J.neck[1] + 1.2 * u], [J.neck[0] + d * 3.4 * u, J.chest[1] - 2 * u], [J.chest[0] + d * 2.2 * u, J.chest[1] - .6 * u], [J.chest[0] + d * 1.2 * u, J.chest[1]], 9);
      pts.forEach((q, i) => dot(s, q[0], q[1], (.42 + .1 * (i % 2)) * u, i % 3 ? '#2e6a47' : '#1f4a33')); }
    if (!holding) return J;
    const S = shoulderR(J, u, o.turn || 0);
    const target = M.grip ? M.grip(J, u, S) : [S[0] + M.hold[0] * u, S[1] + M.hold[1] * u];
    occlude(() => drawArm(f, S, target, u, '#000', o.wind, t));
    const H = drawArm(s, S, target, u, '#07070a', o.wind, t, M.torch !== false ? Math.min(1, lit) : .3);
    // rim light down the raised arm from the torch above
    if (M.torch !== false) {
      const k = h / MAN, tilt = M.tilt ?? .1, dir = [Math.sin(tilt), -Math.cos(tilt)];
      const bx = H[0] - dir[0] * 1.0 * k, by = H[1] - dir[1] * 1.0 * k, hx = H[0] + dir[0] * .55 * k, hy = H[1] + dir[1] * .55 * k;
      drawTorch(t, bx, by, hx, hy, k, lit * 1.15, 91, afterOut(t));
      if (lit > .01) stroke(f, [[hx + .03 * k, hy], [lerp(hx, bx, .45) + .03 * k, lerp(hy, by, .45)]], `rgba(255,170,100,${.35 * Math.min(1, lit)})`, .012 * k + .8);
      dot(s, H[0], H[1], 2.3 * u, '#07070a');                                              // the glove over the pole
      if (lit > .01) stroke(f, [[H[0] - 2 * u, H[1] - 1.5 * u], [H[0] + 1.6 * u, H[1] - 2.2 * u]], `rgba(255,170,100,${.5 * Math.min(1, lit)})`, .8 * u);
    }
    return J;
  }

  // ---- the look: ink warming toward cracks, then back to a darker ink after the torches die ----
  const L0 = { ...LOOK.ink, etch: .56, sat: .32, tint: [1, .8, .62], tintK: .14, bloom: 1.45 };
  const L1 = { ...LOOK.cracks, etch: .42, sat: .82, tint: [1, .76, .52], tintK: .2, lift: .02 };
  const LD = { ...LOOK.ink, etch: .55, sat: .4, tint: [.88, .86, .84], tintK: .08, bloom: 1.5, lift: .01 };
  const mixL = (a, b, k) => { const o = {}; for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) { const va = a[key] ?? b[key], vb = b[key] ?? a[key];
    o[key] = Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k); } return o; };
  function look(t) {
    let L = mixL(L0, L1, smooth(inv(A + 4, tSeems + 3, t)));
    L = mixL(L, LD, smooth(inv(tOut - .1, tOut + 1.6, t)));
    const fin = smooth(inv(276, SILENT, t));
    return { ...L, scratch: L.scratch * (1 - fin), dust: L.dust * (1 - fin), lift: L.lift * (1 - fin), flick: L.flick * (1 - fin), burn: 0 };
  }

  // ======================= shots =======================
  const MANC = (o = {}) => ({ X: 0, Z: 0, ...o });

  // 1 · c9's flames sink into one torch's flame; the camera pulls back out of it and cranes up to find
  // the stone ring at night, the torches round it, him at the centre, the wolfdog sitting by him
  function open(t, lt, dur) {
    const e = ease.inOut(lt / dur), eo = ease.out(lt / dur);
    const V = { cx: lerp(-1.91, -.15, eo), cz: lerp(-5.13, -8.2, eo), ch: lerp(1.66, 1.2, e), hz: 1000, F: 1700 };
    const pm = P3(V, 0, 0);
    frame(SC, lerp(880, pm.y - MAN * pm.k * .85, e), pick(1, .78) * lerp(1.1, 1.05, eo));
    scene(t, V, { man: MANC({ o: { turn: .05, sing: .35, wind: .5, lit: .22, rim: 'rgba(255,160,90,.6)' } }), dog: { X: -.95, Z: .3 }, planted: true, stars: 0 });
    flameWall(t, 2150, 1300, 1 - ease.inOut(inv(A, A + 1.5, t)));
    flash(hit(t, A, 4) * .15, '#ff9a50');
    paintSet({ bloom: 1.6 - .3 * eo });
  }

  // 2 · "calling": low, in front of him, the standing stone wheel haloing him, pushing in; he sings
  function calling(t, lt, dur) {
    const V = { cx: kf(lt, [[0, .35], [dur, .1]]), cz: kf(lt, [[0, -6.4], [dur, -5.5]]), ch: .8, hz: 1100, F: 1500 };
    const p = P3(V, 0, 0);
    frame(SC + pick(0, 30), p.y - MAN * p.k * .55, pick(1.22, .9) * (1 + .03 * hit(t, tCall, 3)));
    scene(t, V, { man: MANC({ o: { turn: .12, sing: 1, wind: .55, lit: .25, rim: 'rgba(255,160,90,.6)' } }), dog: { X: -.95, Z: .3 }, planted: true, stars: 0 });
  }

  // 3 · "wake up": the veiled singing close-up, no eye; the ring's torches burn behind his head
  function wake(t, lt, dur) {
    const V = { cx: kf(lt, [[0, -.08], [dur, .1]]), cz: kf(lt, [[0, -1.5], [dur, -1.36]]), ch: 1.6, hz: 1000, F: 1000 };
    const p = P3(V, 0, 0), h = MAN * p.k, u = h / 100;
    const z = pick(1080 * .9 / (35.4 * u), 1080 / (50 * u)) * (1 + .035 * hit(t, tWake, 4));
    frame(p.x + pick(8, 60), p.y - h * pick(.86, .84), z);
    const hd = [p.x + 20, p.y - h * .9];
    const pre = () => { s.save(); s.globalAlpha = .85; s.fillStyle = rgrad(s, hd[0], hd[1], 0, h * .55, [[0, '#c0703c'], [.45, '#7a3e24'], [1, 'rgba(60,30,24,0)']]); s.fillRect(hd[0] - h, hd[1] - h, h * 2, h * 2); s.restore(); };
    const man = MANC({ strand: true, o: { turn: .18, sing: 1, wind: .45, lit: .4, rim: 'rgba(255,165,95,.6)' } });
    scene(t, V, { pre, man, planted: false, stars: 0 });
    paintSet({ etch: .08, bloom: 1.5, flowK: 1.1 });
  }

  // 4 · "take up the torch": at his side, his gloved hand closes on the planted torch and draws it up out
  // of the ground; the camera rises with it and the flame roars on "torch"
  function take(t, lt, dur) {
    const lift = ease.inOut(inv(tTake - .05, tTorch + .15, t)) * .45, rise = ease.inOut(inv(tTake, tTorch + .6, t));
    const V = { cx: PLANT.X - .12, cz: PLANT.Z - 1.75 + .15 * lt / dur, ch: lerp(.95, 1.45, rise), hz: 1000, F: 1000 };
    const reach = ease.inOut(inv(tTake - 1.1, tTake - .05, t));
    const b = P3(V, PLANT.X, PLANT.Z);
    const k = b.k, gripY = b.y - (1.0 + lift) * k, gx = b.x, headY = gripY - .55 * k;
    frame(SC - pick(40, 260), headY + pick(640, 380), pick(1.05, .66));
    const man = MANC({ o: { turn: .1, wind: .5, lit: .1, rim: 'rgba(255,165,95,.6)' }, lift,
      grip: (J, u, S) => { const rest = [S[0] + 1.5 * u, S[1] + 31 * u]; return [lerp(rest[0], gx, reach), lerp(rest[1], gripY, reach)]; } });
    // before the grip closes the torch still stands in the ground: draw it planted, and hold it only once gripped
    const gripped = t >= tTake - .05;
    if (!gripped) { man.torch = false; }
    scene(t, V, { man, planted: !gripped, stars: 0 });
    if (gripped) { const hole = P3(V, PLANT.X, PLANT.Z); s.fillStyle = '#0a0706'; s.beginPath(); s.ellipse(hole.x, hole.y, .05 * k, .02 * k, 0, 0, TAU); s.fill(); }
    const roar = hit(t, tTorch, 2.2);
    flash(roar * .16, '#ffb070');
    paintSet({ bloom: 1.5 + .4 * roar, etch: .66 });
  }

  // held-torch pose: raise 0..1 from shoulder height to straight up at arm's length (body units from shoulder)
  const holdAt = (r, sway = 0) => [lerp(10, 12, r) + sway, -lerp(6, 24, r)];

  // 5 · "stop": low, the horizon fire at his knees; he thrusts the torch up high on the word
  function stop(t, lt, dur) {
    const V = { cx: kf(lt, [[0, -.3], [dur, -.05]]), cz: kf(lt, [[0, -4.3], [dur, -3.85]]), ch: .45, hz: 1260, F: 1100 };
    const p = P3(V, 0, 0), r = lerp(.4, 1, ease.back(inv(tStop - .12, tStop + .45, t)));
    frame(SC + pick(20, 60), p.y - MAN * p.k * .78, pick(1.12, .78) * (1 + .03 * hit(t, tStop, 3)));
    scene(t, V, { man: MANC({ o: { turn: .06, sing: .5, wind: .7, rim: 'rgba(255,150,80,.6)' }, hold: holdAt(r, Math.sin(t * .9) * .6), tilt: .1 }), stars: 0 });
    paintSet({ bloom: 1.5 + .25 * hit(t, tStop, 2) });
  }

  // 6 · "too far": the camera cranes back and up and the fire spreads along the whole horizon
  function far(t, lt, dur) {
    const e = ease.inOut(lt / dur);
    const V = { cx: lerp(-.1, .5, e), cz: lerp(-5.2, -15.5, ease.sine(lt / dur)), ch: lerp(.8, 5.6, e), hz: lerp(1180, 660, e), F: 1300 };
    frame(SC, lerp(960, 900, e), pick(1.25, .9) * lerp(1.05, 1, e));
    scene(t, V, { man: MANC({ o: { turn: .05, sing: .4, wind: .75, rim: 'rgba(255,150,80,.6)', view: e > .6 ? 'sil' : 'front' }, hold: holdAt(1, Math.sin(t * .9) * .6) }), dog: { X: -.95, Z: .3 }, planted: false, stars: 0, fireH: lerp(1, 2.4, e) });
  }

  // 7 · "gone": ground level from outside the ring, the stones big in the foreground, him small at the
  // centre with the torch up, the horizon burning end to end
  function gone(t, lt, dur) {
    const V = { cx: kf(lt, [[0, 1.6], [dur, .7]]), cz: kf(lt, [[0, -9.6], [dur, -8.9]]), ch: .32, hz: 1120, F: 1250 };
    frame(SC, 930, pick(1.25, .85));
    scene(t, V, { man: MANC({ o: { turn: 0, wind: .8, rim: 'rgba(255,150,80,.6)', view: 'sil' }, hold: holdAt(1, Math.sin(t * .8) * .8) }), dog: { X: -.95, Z: .3 }, planted: false, stars: 0, fireH: 1.6 });
  }

  // 8 · "long": close and low under the raised torch; smoke rolls over, the held note, a slow arc
  function long_(t, lt, dur) {
    const V = { cx: kf(lt, [[0, .55], [dur, -.35]]), cz: kf(lt, [[0, -3.5], [dur, -3.15]]), ch: .55, hz: 1330, F: 1000 };
    const p = P3(V, 0, 0);
    frame(SC + pick(0, 50), p.y - MAN * p.k * .82, pick(1.05, .72), kf(lt, [[0, -.025], [dur, .02]]));
    scene(t, V, { man: MANC({ o: { turn: -.08, sing: .7, wind: .85, rim: 'rgba(255,150,80,.6)' }, hold: holdAt(1, Math.sin(t * .7) * 1.2), tilt: .1 + .06 * Math.sin(t * .7) }), stars: 0 });
  }

  // 9 · "the world burns": low wide, the whole horizon erupts
  function burns(t, lt, dur) {
    const V = { cx: kf(lt, [[0, -.5], [dur, .25]]), cz: kf(lt, [[0, -12.5], [dur, -10.4]]), ch: 1.1, hz: 1060, F: 1500 };
    const fl = flareK(t), [dx, dy] = shake(t, 5 * hit(t, tBurns, 3));
    frame(SC + dx, pick(830, 960) + dy, pick(1, .78));
    scene(t, V, { man: MANC({ o: { turn: 0, wind: .9, rim: `rgba(255,${150 + 60 * fl | 0},90,.95)`, view: 'sil' }, hold: holdAt(1, Math.sin(t * .8) * .6) }), dog: { X: -.95, Z: .3 }, planted: false, stars: 0, fireH: 1.5 });
    flash(fl * .06, '#ff8a3a');
    paintSet({ bloom: 1.5 + .2 * fl, tintK: .22 + .12 * fl });
  }

  // 10 · "just like this song": he plays, the torch planted at his side lighting him; a slow arc from low left
  function song(t, lt, dur) {
    const V = { cx: kf(lt, [[0, -.95], [dur, -.55]]), cz: kf(lt, [[0, -3.4], [dur, -3.05]]), ch: .95, hz: 1000, F: 1000 };
    const p = P3(V, 0, 0), h = MAN * p.k;
    frame(p.x + pick(70, 110), p.y - h * .56, pick(1.18, .86));
    scene(t, V, { man: MANC({ o: { guitar: 'play', turn: .16, sing: 1, wind: .5, lit: .42, rim: 'rgba(255,165,95,.6)' } }), dog: { X: -.95, Z: .3 }, planted: true, stars: 0 });
  }
  // 11 · closer on the playing, the torch flame just off his shoulder
  function song2(t, lt, dur) {
    const V = { cx: kf(lt, [[0, .35], [dur, .05]]), cz: kf(lt, [[0, -2.35], [dur, -2.12]]), ch: 1.2, hz: 980, F: 1000 };
    const p = P3(V, 0, 0), h = MAN * p.k;
    frame(p.x + pick(40, 90), p.y - h * pick(.66, .62), pick(1.38, 1.02));
    scene(t, V, { man: MANC({ o: { guitar: 'play', turn: -.12, sing: .9, wind: .45, lit: .45, rim: 'rgba(255,165,95,.6)' } }), planted: true, stars: 0 });
    paintSet({ etch: .58 });
  }

  // 12 · "just like my dream": the camera tilts up off him into the sky and the stars come back (c6)
  function dream(t, lt, dur) {
    const V = { cx: kf(lt, [[0, -.25], [dur, .1]]), cz: kf(lt, [[0, -6.6], [dur, -6.1]]), ch: .9, hz: 1150, F: 1400 };
    const p = P3(V, 0, 0), up = ease.inOut(inv(tJust2 + .15, tDream + 1.6, t)), upV = Math.sin(Math.PI * up);
    const pan = ease.inOut(inv(tDream + 1, 255.44, t));
    frame(SC + pan * pick(260, 420), lerp(p.y - MAN * p.k * .6, V.hz - pick(1150, 1250), up), pick(1.1, .82) * lerp(1, .88, up) * (1 + .04 * pan), pan * .05);
    scene(t, V, { man: MANC({ o: { guitar: 'play', turn: .1, sing: .7, wind: .5, lit: .35, rim: 'rgba(255,160,90,.6)' } }), dog: { X: -.95, Z: .3 }, planted: true });
    if (upV > .05) whip(0, 10 * upV * (up < 1 ? 1 : 0));
    // shooting stars on the beats once the sky is back (the c6 plains)
    for (const [tb, sx, sy, ang] of [[252.98, SC - 150, V.hz - 1900, .5], [254.63, SC + 450, V.hz - 1650, .35]]) { const k = inv(tb, tb + .55, t);
      if (k > 0 && k < 1) { const L = 520, x = sx + Math.cos(ang) * L * k, y = sy + Math.sin(ang) * L * k;
        stroke(f, [[x - Math.cos(ang) * 150, y - Math.sin(ang) * 150], [x, y]], `rgba(235,236,255,${.7 * Math.sin(Math.PI * k)})`, 2.5); dot(f, x, y, 3, `rgba(255,255,255,${Math.sin(Math.PI * k)})`); } }
    paintSet({ bloom: 1.55 + .25 * starK(t) });
  }

  // 13 · "changing before it seems": high over the ring as its stones light one by one, then the spokes
  function changing(t, lt, dur) {
    const e = ease.inOut(lt / dur);
    const V = { cx: lerp(.4, -.2, e), cz: lerp(-12.5, -10.5, e), ch: lerp(12.5, 9.5, e), hz: -220, F: 1100 };
    const c = P3(V, 0, 0);
    frame(SC, c.y - 80, pick(.98, .8), lerp(.03, -.02, e));
    scene(t, V, { man: MANC({ o: { guitar: 'play', turn: 0, wind: .5, lit: .3, rim: 'rgba(255,150,80,.6)' } }), dog: { X: -.95, Z: .3 }, planted: true, stars: .5 });
    paintSet({ bloom: 1.7 + .25 * hit(t, tSeems, 1.5) });
  }

  // 14 · the ground cracks with light: low at his boots, tilting up him as the cracks run out and the torches rise
  function crack(t, lt, dur) {
    const V = { cx: kf(lt, [[0, .15], [dur, -.05]]), cz: kf(lt, [[0, -2.5], [dur, -2.25]]), ch: .3, hz: 1250, F: 1000 };
    const p = P3(V, 0, 0), h = MAN * p.k, up = ease.inOut(lt / dur);
    frame(p.x + pick(30, 60), lerp(p.y - h * .12, p.y - h * .55, up), pick(lerp(1.35, 1.05, up), lerp(.9, .64, up)));
    scene(t, V, { man: MANC({ o: { guitar: 'play', turn: .05, wind: .45 + .3 * up, lit: .45, rim: 'rgba(255,145,75,.6)' } }), planted: true, stars: .4 });
    emberRise(t, p.x, p.y, 1400, 2200, 90, .3 + .6 * crackK(t), 61);
    paintSet({ bloom: 1.75, flowK: 1 + .35 * up });
  }
  // embers rising (after c5's column)
  function emberRise(t, x, y, w, rise, n, a, seed = 9) {
    for (let i = 0; i < n; i++) { const sp = .12 + .22 * hash(i * 3 + seed), ph = (t * sp + hash(i * 7 + seed)) % 1, px = x + w * (hash(i * 11 + seed) - .5) * (.4 + .6 * ph) + Math.sin(t * 1.1 + i) * 30 * ph, py = y - ph * rise;
      const al = a * Math.sin(Math.PI * Math.min(1, ph * 1.3)) * (.4 + .6 * hash(i)); if (al < .02) continue;
      dot(f, px, py, 1.6 + 3 * hash(i * 5 + seed) * (1 - ph * .6), `rgba(255,${120 + 90 * (1 - ph) | 0},${50 + 40 * (1 - ph) | 0},${al})`); }
  }

  // 15 · "too late": the wide, every torch blazing; on the word they all die at once and only embers hang
  function late(t, lt, dur) {
    const V = { cx: kf(lt, [[0, .25], [dur, -.05]]), cz: kf(lt, [[0, -11.2], [dur, -10.3]]), ch: 1.6, hz: 950, F: 1500 };
    frame(SC, pick(930, 1000), pick(1, .8));
    const dead = t >= tOut;
    scene(t, V, { man: MANC({ o: { guitar: 'play', turn: 0, wind: .5, lit: .25, view: dead ? 'sil' : 'front', rim: dead ? 'rgba(150,140,140,.25)' : 'rgba(255,150,80,.9)' } }), dog: { X: -.95, Z: .3 }, planted: true, stars: dead ? .65 : 1 });
    // the dark slams in: a puff of smoke off every head, a brief sucked-in darkness
    const k = hit(t, tOut, 1.4);
    if (dead) for (const q of [...TORCHES, { ...PLANT, i: 9 }]) { const hd = P3(V, q.X, q.Z, 1.55); const rr = (.25 + .6 * (1 - k)) * hd.k;
      s.fillStyle = `rgba(90,82,80,${.4 * k})`; s.beginPath(); s.arc(hd.x + (1 - k) * .2 * hd.k, hd.y - (1 - k) * .9 * hd.k, rr, 0, TAU); s.fill(); }
    blackout(.35 * hit(t, tOut, 3));
    paintSet({ bloom: dead ? 1.6 : 1.8 });
  }

  // 16 · the tail: in the last light he and the wolfdog walk out of the ring toward the first line of dawn
  const WALK0 = [0, 0], WALK1 = [2.9, 3.9], WALK2 = [6.8, 11.5];
  const walkPos = (t) => { if (t < 266.2) return WALK0; if (t < 272.53) { const k = inv(266.2, 272.53, t); return [lerp(WALK0[0], WALK1[0], k), lerp(WALK0[1], WALK1[1], k)]; }
    const k = inv(272.53, SILENT, t); return [lerp(WALK1[0], WALK2[0], k), lerp(WALK1[1], WALK2[1], k)]; };
  function driftEmbers(t, cx, cy, w, h, n, a) {
    for (let i = 0; i < n; i++) { const x = cx - w / 2 + ((hash(i * 3 + 41) * w + t * (8 + 14 * hash(i + 41)) + Math.sin(t * .5 + i) * 30) % w + w) % w, y = cy - h / 2 + ((hash(i * 5 + 41) * h - t * (10 + 18 * hash(i * 7 + 41))) % h + h) % h;
      dot(f, x, y, 1.4 + 2.2 * hash(i * 9), `rgba(255,${130 + 80 * hash(i + 2) | 0},60,${a * (.3 + .6 * hash(i * 13)) * (.6 + .4 * Math.sin(t * 2 + i))})`); }
  }
  function walkOut(t, lt, dur) {
    const [mX, mZ] = walkPos(t), e = ease.inOut(lt / dur);
    const V = { cx: lerp(-.4, 1.3, e), cz: lerp(-5.2, -2.6, ease.sine(lt / dur)), ch: 1.15, hz: 1010, F: 1300 };
    const p = P3(V, mX, mZ);
    frame(lerp(p.x, SC + 60, .5) + pick(0, 60), p.y - MAN * p.k * pick(1.05, .6), pick(1.05, .8));
    const going = t >= 266.2;
    scene(t, V, { man: { X: mX, Z: mZ, o: { view: 'back', sil: true, walk: going ? (t - 266.2) * .85 : 0, wind: .55, rim: 'rgba(200,180,160,.35)' } }, dog: { X: mX - .75, Z: mZ - .15, walk: going ? t * 1.25 : 0, dir: 1 }, planted: true, stars: .55 });
    driftEmbers(t, SC, 950, 3000, 2600, 60, .5 * afterOut(t) + .08);
  }
  // 17 · far behind them now and craning slowly up, the camera settling as they walk on toward the dawn line;
  // the frame fades to black and is fully black as the mix falls silent, then holds black to the end
  function toDawn(t, lt, dur) {
    const [mX, mZ] = walkPos(t), e = ease.out(inv(0, SILENT - 272.53 + 1, lt));
    const V = { cx: lerp(1.2, 3.4, e), cz: lerp(-3.4, .8, e), ch: lerp(1.05, 1.7, e), hz: lerp(1000, 960, e), F: 1450 };
    frame(SC + pick(40, 120), lerp(830, 800, e), pick(1.02, .8) * lerp(1, .95, e));
    scene(t, V, { man: { X: mX, Z: mZ, o: { view: 'back', sil: true, walk: (t - 266.2) * .85, wind: .6, rim: 'rgba(210,190,170,.3)' } }, dog: { X: mX - .75, Z: mZ - .15, walk: t * 1.25, dir: 1 }, planted: true, stars: .5 });
    driftEmbers(t, SC, 950, 3000, 2600, 50, .4 * afterOut(t) + .06);
    blackout(ease.inOut(inv(277.2, SILENT, t)));
  }

  chapter('calling', A, Z, [
    [A, open, { xin: .8 }],
    [216.22, calling],
    [218.64, wake],
    [221.08, take],
    [tStop - .12, stop],
    [226.9, far],
    [230.25, gone],
    [234.2, long_],
    [237.45, burns],
    [243.16, song],
    [246.46, song2],
    [249.71, dream],
    [255.44, changing],
    [259.51, crack],
    [262.76, late],
    [266.01, walkOut],
    [272.53, toDawn],
  ], { paint: look });
})();
