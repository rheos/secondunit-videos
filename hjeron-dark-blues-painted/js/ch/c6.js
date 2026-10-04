// js/ch/c6.js · PLAINS OF STARS (97.583 - 116.400) · instrumental · look: dream (indigo night oil)
// One location: open flat plains under a Milky Way, no moon (c1 owns the moon and the dunes). c5's
// ember column scatters and its embers settle into stars on the fast hits; he walks on across the
// plains with the wolfdog, small and silhouetted against the Milky Way, while the whole sky wheels.
// Beats land as his boot strikes (dust), shooting stars on the onsets. At the end the near stars
// drift down and gather into a small fire on the ground for c7.
(() => {
  const A = 97.583, Z = 116.4;
  const T1 = 100.24, T2 = 103.47, T3 = 106.67, T4 = 109.06, T5 = 112.29; // cuts, all on beats
  const tLight = 115.50;                                                   // the gathered stars catch (a beat)
  const FASTS = FEAT.fast.filter((x) => x > A && x < Z);
  const BEATS = FEAT.beats.filter((x) => x > A - 2 && x < Z + 1);

  // ---------- the sky: indigo night, a Milky Way, the whole of it wheeling ----------
  const WR = .014;                               // sky rotation, rad/s (the wheel)
  const skyRot = (t) => (t - A) * WR;
  const DREAM = { ...LOOK.dream, etch: 0 };      // etch listed so c5's etch crossfades out instead of snapping
  const RIM = 'rgba(175,195,255,.85)';
  const mixA = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));

  function nightSky(HZ, k = 1) {
    sky('#04061a', '#0b1336', '#2b3874', HZ);
    // airglow along the horizon: the pale band the silhouettes read against
    s.fillStyle = vgrad(s, HZ - 520, HZ, [[0, 'rgba(58,72,140,0)'], [1, 'rgba(78,94,168,.85)']]); s.fillRect(-3000, HZ - 520, 9000, 520);
    if (k < 1) { s.save(); s.globalAlpha = (1 - k) * s.globalAlpha; s.fillStyle = '#030306'; s.fillRect(-3000, -5000, 9000, HZ + 5000); s.restore(); }
  }
  // the heavens: stars and the Milky Way, both turning about a pole (o.pole, world coords) by rot.
  // The band is a river of light through world point o.q along angle o.ang, its bright core at o.core
  // (distance along it). o.hz clips everything below the horizon; o.trail draws each star as an arc
  // (long exposure); o.ember(i, x, y, sz) may move/recolour a star (the embers settling into stars).
  function heavens(t, o = {}) {
    const { a = 1, band = 1, hz = 1e5, trail = 0, ember = null, n = 1900, pole = [SC, -2000], q = [SC, 900], ang = -1.2, core = 0, bw0 = 230 } = o;
    const rot = o.rot ?? skyRot(t), c = Math.cos(rot), sn = Math.sin(rot);
    const R = (x, y) => [pole[0] + (x - pole[0]) * c - (y - pole[1]) * sn, pole[1] + (x - pole[0]) * sn + (y - pole[1]) * c];
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const B = (u, off = 0) => R(q[0] + ca * u - sa * off, q[1] + sa * u + ca * off);
    const bw = (u) => bw0 * (1 + 1.2 * Math.exp(-((u - core) ** 2) / (800 * 800)));
    for (const g of [s, f]) { g.save(); g.beginPath(); g.rect(-6000, -9000, 14000, hz + 9000); g.clip(); }
    if (band > .01) {
      const pts = (off, u0 = -3400, u1 = 3400, st = 200) => { const r = []; for (let u = u0; u <= u1; u += st) r.push(B(u, off + snoise(u / 900, 7) * 60)); return r; };
      s.save(); s.globalAlpha *= band;
      // lumpy star clouds (soft painted blobs, not a stripe): a faint wide veil, brighter clouds, a warm core
      const blob = (p, rx, ry, rot, col) => { s.save(); s.translate(p[0], p[1]); s.rotate(rot); s.scale(1, ry / rx);
        s.fillStyle = rgrad(s, 0, 0, 0, rx, [[0, col], [1, col.replace(/[\d.]+\)$/, '0)')]]); s.fillRect(-rx, -rx, rx * 2, rx * 2); s.restore(); };
      const r0 = rng(607);
      for (let i = 0; i < 16; i++) { const u = lerp(-3400, 3400, i / 15); blob(B(u, (r0() - .5) * 160), bw(u) * 2.4, bw(u) * 1.3, ang + rot, 'rgba(46,60,124,.34)'); }
      for (let i = 0; i < 26; i++) { const u = lerp(-3200, 3200, r0()), k = Math.exp(-((u - core) ** 2) / (900 * 900)), w = bw(u) * (.45 + .6 * r0());
        blob(B(u, (r0() - .5) * bw(u) * 1.2), w * 1.6, w * (.6 + .5 * r0()), ang + rot + (r0() - .5) * .5, k > .4 ? 'rgba(182,168,190,.34)' : 'rgba(96,110,178,.32)'); }
      // the dark rift: broken lanes of dust along the core, soft and irregular
      for (let i = 0; i < 12; i++) { const u = lerp(core - 1600, core + 1400, r0()), w = bw(u) * (.18 + .25 * r0());
        blob(B(u, 30 + (r0() - .5) * 120), w * 2.2, w * .55, ang + rot + (r0() - .5) * .3, 'rgba(10,14,40,.55)'); }
      s.restore();
      for (let u = -3200; u <= 3200; u += 260) { const w = bw(u), p = B(u), k = Math.exp(-((u - core) ** 2) / (700 * 700));
        glow(p[0], p[1], w * 1.4, `rgba(${150 + 90 * k | 0},${170 + 40 * k | 0},${255 - 60 * k | 0},${(.025 + .05 * k) * band * a})`); }
      const r = rng(611);
      for (let i = 0; i < 1000; i++) { const u = lerp(-3400, 3400, r()), off = (r() + r() + r() - 1.5) * bw(u) * 1.1, p = B(u, off);
        dot(f, p[0], p[1], 1.5 + r() * 1.8, `rgba(225,230,255,${band * a * (.25 + .55 * r())})`); }
    }
    const r = rng(601);
    for (let i = 0; i < n; i++) {
      const [x0, y0] = R(lerp(-1600, 3500, r()), lerp(-1800, 2100, r())), mag = Math.pow(r(), 4), hue = r(), tw0 = r();
      let x = x0, y = y0, sz = 1.7 + mag * 4.4, col = hue < .12 ? [255, 222, 196] : hue < .6 ? [228, 234, 255] : [200, 214, 255];
      let al = a * (.65 + .35 * Math.sin(t * (1.2 + tw0 * 3) + i)) * (.35 + .65 * mag + .3 * tw0);
      if (ember) { const e = ember(i, x, y, sz); if (!e) continue; [x, y, sz, col, al] = [e.x, e.y, e.sz, e.col, al * e.a]; }
      else if (y > hz) continue;
      if (trail > 0) { const dx = x - pole[0], dy = y - pole[1], rr = Math.hypot(dx, dy), th = Math.atan2(dy, dx), pts = [];
        for (let k = 0; k <= 6; k++) { const an = th - trail * k / 6; pts.push([pole[0] + Math.cos(an) * rr, pole[1] + Math.sin(an) * rr]); }
        stroke(f, pts, `rgba(${col[0]},${col[1]},${col[2]},${al * .4})`, sz * .8); }
      dot(f, x, y, sz, `rgba(${col[0]},${col[1]},${col[2]},${al})`);
      if (mag > .75) glow(x, y, sz * 6, `rgba(${col[0]},${col[1]},${col[2]},${al * .25})`);
    }
    for (const g of [s, f]) g.restore();
    return { R, B };
  }
  // a shooting star from p0 to p1 starting at t0 (on an onset)
  function meteor(t, t0, p0, p1, dur = .5, a = 1) {
    const k = inv(t0, t0 + dur, t); if (k <= 0 || t > t0 + dur + .6) return;
    const head = ease.out(k), tail = Math.max(0, head - .4 - .3 * k), fade = 1 - inv(t0 + dur, t0 + dur + .6, t);
    const Pm = (u) => [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)];
    for (let j = 0; j < 5; j++) { const u0 = lerp(tail, head, j / 5), u1 = lerp(tail, head, (j + 1) / 5); stroke(f, [Pm(u0), Pm(u1)], `rgba(235,242,255,${a * fade * (.15 + .7 * j / 5)})`, 2 + j * 1.1); }
    dot(f, ...Pm(head), 5 * fade, `rgba(255,255,255,${a * fade})`); glow(...Pm(head), 60, `rgba(190,210,255,${.35 * a * fade})`);
  }

  // ---------- the plains ----------
  // a flat plain: pale near the horizon (catching the airglow), dark underfoot, long streaks of dry ground
  function plain(HZ, camX = SC, o = {}) {
    const { streak = 1, far = 1 } = o;
    // the far edge of the world: a barely-there low line of hills, parallaxed with the camera
    if (far > 0) { s.fillStyle = '#141a3a'; s.beginPath(); s.moveTo(camX - 4000, HZ + 2);
      for (let x = camX - 4000; x <= camX + 4000; x += 60) { const wx = x - camX * .92; s.lineTo(x, HZ - (10 + 26 * noise1(wx / 420, 3) + 14 * noise1(wx / 130, 4)) * far); }
      s.lineTo(camX + 4000, HZ + 2); s.fill(); }
    s.fillStyle = vgrad(s, HZ, HZ + 1300, [[0, '#343d6a'], [.08, '#232a52'], [.4, '#141832'], [1, '#07080f']]); s.fillRect(camX - 5000, HZ, 10000, 3000);
    if (streak > 0) { const r = rng(631);
      for (let j = 0; j < 26; j++) { const q = r(), y = HZ + 6 + q * q * 1100, len = 300 + r() * 1400, x = -2000 + r() * 6000, w = 3 + q * 22;
        stroke(s, [[x, y], [x + len, y + (r() - .5) * 6]], q < .3 ? 'rgba(80,92,150,.5)' : 'rgba(40,46,86,.55)', w * streak); } }
  }
  // dry grass tufts at world positions; they sit on the ground at gy and scroll past the camera
  function tufts(t, x0, x1, gy, sz, seed, c = '#080a16', wind = 1) {
    const r = rng(seed);
    for (let x = x0; x < x1; x += sz * (1.6 + r() * 2.4)) {
      const n = 5 + (r() * 5 | 0), hh = sz * (.5 + r() * .8), xx = x + r() * sz;
      for (let k = 0; k < n; k++) { const a = (k / (n - 1) - .5) * 1.3 + snoise(t * .9 + xx * .01 + k, 5) * .12 * wind + .12 * wind, L = hh * (.6 + .5 * hash(k + xx | 0));
        taper(s, [xx + (k - n / 2) * sz * .05, gy], [xx + Math.sin(a) * L, gy - Math.cos(a) * L], sz * .07, sz * .015, c); }
    }
  }
  // a dust puff kicked from the ground at (x, y) at time t0 (a boot strike on a beat)
  function dust(t, t0, x, y, sz, a = 1, dir = 1) {
    const k = t - t0; if (k < 0 || k > 1.7) return;
    const e = ease.out(inv(0, 1.7, k)), fade = (1 - e) * Math.min(1, k * 12);
    for (let j = 0; j < 7; j++) { const hx = hash(j * 13 + (t0 * 100 | 0)), hy = hash(j * 7 + 3 + (t0 * 100 | 0));
      const cx = x + (hx - .5) * sz * 1.6 * (.4 + e) + dir * e * sz * .8, cy = y - (.15 + hy * .5) * sz * (.3 + e), rr = sz * (.25 + .5 * hy) * (.5 + e);
      s.fillStyle = `rgba(118,128,178,${.55 * a * fade})`; s.beginPath(); s.ellipse(cx, cy, rr * 1.4, rr * .7, 0, 0, TAU); s.fill();
      glow(cx, cy, rr * 1.6, `rgba(150,165,230,${.03 * a * fade})`); }
  }

  // ---------- him and the dog ----------
  const gait = (t) => (t - B0) / BEAT + .25;               // one stride per beat: the open stride lands ON the beat
  // a scraped rim of starlight around a silhouette (c1's method, private copy): draw(g) paints the shape
  let RC = null;
  function rimLight(draw, offs, col = RIM, k = 1) {
    if (k > .01) {
      if (!RC) { const c = document.createElement('canvas'); c.width = SW; c.height = SH; RC = c.getContext('2d'); }
      RC.setTransform(1, 0, 0, 1, 0, 0); RC.globalCompositeOperation = 'source-over'; RC.globalAlpha = 1; RC.clearRect(0, 0, SW, SH);
      RC.setTransform(f.getTransform()); draw(RC);
      RC.setTransform(1, 0, 0, 1, 0, 0); RC.globalCompositeOperation = 'source-in'; RC.fillStyle = col; RC.fillRect(0, 0, SW, SH);
      f.save(); f.setTransform(1, 0, 0, 1, 0, 0); f.globalCompositeOperation = 'lighter'; f.globalAlpha = k;
      for (const [ox, oy] of offs) f.drawImage(RC.canvas, ox, oy);
      f.restore();
    }
    occlude(() => draw(f));   // also blocks the stars behind the body
  }
  // him walking to screen right, silhouetted, the guitar hanging from his left hand; returns joints
  function walker(t, x, y, h, o = {}) {
    const sil = h < 170;
    const d = (g) => wyrd(t, x, y, h, { view: sil ? 'sil' : 'back', turn: .35, guitar: 'hang', arms: 'down', walk: o.walk ?? gait(t), wind: o.wind ?? -.55, lit: .1, rim: g === s ? (o.rim ?? RIM) : null, g, groove: 0, sil: g !== s });
    const J = d(s);
    // gloved hands: paint over the pale hand dots wyrd() draws, which read as spots on the dark coat
    if (!sil) for (const hd of [J.handL, J.handR]) if (hd) dot(s, hd[0], hd[1], 1.8 * h / 100, '#0d0b0c');
    rimLight(d, o.offs || [[1.2, -1.2]], o.col, (o.k ?? 1) * .6);
    return J;
  }
  function hound(t, x, y, sc, o = {}) {
    const d = (g) => wolfdog(t, x, y, sc, { dir: o.dir ?? 1, walk: o.walk ?? (t - B0) / BEAT * 2, sil: true, g, look: o.look || 0 });
    d(s); rimLight(d, o.offs || [[1, -1.5]], RIM, (o.k ?? .8) * .6);
  }

  // ---------- shots ----------
  // 1 · c5's ember column scatters: the embers slow, cool from orange to starlight and settle into
  //     stars, each landing on a fast hit with a glint. The indigo night and the Milky Way seep in.
  const ET = [];      // per star: its settle time (a fast hit) and its ember start offset
  { const q = rng(641); for (let i = 0; i < 2400; i++) { ET.push({ ts: 0, dx: (q() - .5) * 900, dy: 500 + q() * 1100, w: q(), fx: q() }); } }
  function scatter(t, lt, dur) {
    const cy = kf(lt, [[0, 820], [dur, 700]], ease.out), z = kf(lt, [[0, 1.0], [dur, 1.08]], ease.inOut);
    frame(SC + kf(lt, [[0, 0], [dur, 60]]), cy, pick(z, z * .9), kf(lt, [[0, 0], [dur, .035]], ease.in));
    const HZ = 2300;
    const nightK = ease.inOut(inv(A + .15, A + 1.9, t));
    nightSky(HZ, nightK);
    const fs = FASTS.filter((x) => x > 98 && x < T1 - .1);
    heavens(t, { pole: [SC + 300, -1400], q: [SC + 250, 700], ang: -1.05, core: 200, band: ease.inOut(inv(98.2, 99.8, t)), hz: HZ,
      ember: (i, x, y, sz) => {
        const e = ET[i], ts = fs[Math.min(fs.length - 1, Math.floor(clamp(inv(-200, 1500, y) * .75 + e.w * .35) * fs.length))];
        const k = ease.out(inv(A - .25, ts, t)), late = inv(ts, ts + .6, t);
        const px = x + e.dx * (1 - k) + Math.sin(t * 1.6 + i) * 26 * (1 - k), py = y + e.dy * (1 - k);
        const warm = [255, 150 + 60 * e.fx | 0, 70], col = mixA(warm, [230, 236, 255], ease.inOut(inv(ts - .5, ts + .4, t))).map((v) => v | 0);
        // the ember's short trail below it while it still climbs
        if (k < .98) stroke(f, [[px, py], [px - Math.sin(t * 1.6 + i) * 8, py + 50 * (1 - k)]], `rgba(${col[0]},${col[1]},${col[2]},${.3 * (1 - k)})`, 2.4);
        const gl = hit(t, ts, 7);
        if (gl > .05 && sz > 2.2) { stroke(f, [[x - sz * 6 * gl, y], [x + sz * 6 * gl, y]], `rgba(240,245,255,${.7 * gl})`, 1.6); stroke(f, [[x, y - sz * 6 * gl], [x, y + sz * 6 * gl]], `rgba(240,245,255,${.7 * gl})`, 1.6); }
        // a soft halo round each ember while it is still hot
        if (late < 1) dot(f, px, py, 9 * (1 - late), `rgba(255,${120 + 60 * e.fx | 0},50,${.14 * (1 - late)})`);
        return { x: px, y: py, sz: lerp(3.8, sz, late), col, a: lerp(1.8, 1, late) };
      } });
    // the first shooting star, on the onset before the cut; it points the way down to the plains
    meteor(t, 99.83, [SC - 420, 180], [SC + 380, 1350], .45);
    const wv = inv(T1 - .3, T1, t);
    if (wv > 0) whip(0, 38 * ease.in(wv));
    paintSet({ bloom: 1.5, flowK: 1.2 - .2 * nightK });
  }

  // 2 · the camera cranes down out of the sky with the shooting star to the horizon: the Milky Way
  //     rises out of the plains and, small at its foot, he and the dog walk on across it
  function reveal(t, lt, dur) {
    const HZ = 1450;
    const cy = kf(lt, [[0, 260], [2.4, pick(1080, 1180)], [dur, pick(1110, 1200)]], ease.out);
    const z = kf(lt, [[0, 1.05], [dur, pick(1.1, .98)]], ease.inOut);
    frame(SC + kf(lt, [[0, 80], [dur, -20]]), cy, z, kf(lt, [[0, .03], [dur, -.01]]));
    nightSky(HZ);
    heavens(t, { hz: HZ, pole: [SC - 900, -1200], q: [SC + 180, HZ - 200], ang: -1.35, core: -250 });
    plain(HZ, SC);
    const x = SC - 280 + (t - T1) * 22, wx = x;
    hound(t, wx + 80, HZ + 9, 52, { k: .7 });
    walker(t, wx, HZ + 12, 118, { k: .8 });
    for (const b of BEATS) dust(t, b, SC - 280 + (b - T1) * 22 + 11, HZ + 12, 20, .8);
    const wv = 1 - inv(0, .35, lt);
    if (wv > 0) whip(0, 30 * ease.out(wv));
    meteor(t, 102.63, [SC + 520, 520], [SC - 60, 900], .5, .8);
    paintSet({ bloom: 1.45 });
  }

  // 3 · low tracking shot alongside him: he fills the sky, a silhouette with a scraped rim of
  //     starlight, the Milky Way arching behind; each stride lands on the beat and kicks up dust
  function stride(t, lt, dur) {
    const HZ = 1500, gy = 1610, h = 660, u = h / 100, V = 15 * u / BEAT;
    const x = SC - 340 + (t - T2) * V;
    const camX = x + kf(lt, [[0, 190], [dur, 90]], ease.inOut);
    const z = kf(lt, [[0, 1.0], [dur, 1.06]], ease.inOut);
    frame(camX, kf(lt, [[0, 1080], [dur, 1030]]) + pick(0, 60), pick(z, z * .72), kf(lt, [[0, -.015], [dur, .01]]));
    nightSky(HZ);
    heavens(t, { hz: HZ, pole: [camX - 900, -1400], q: [camX + 60, HZ - 300], ang: -1.15, core: -300 });
    plain(HZ, camX);
    tufts(t, camX - 2200, camX + 2400, HZ + 30, 60, 651, '#10142a');
    for (const b of BEATS) dust(t, b, SC - 340 + (b - T2) * V + 9.4 * u, gy, 80, 1);
    hound(t, x + 430, gy - 20, 300, { k: .85 });
    walker(t, x, gy, h, { k: 1, wind: -.6 });
    // the near tufts slide past fast: the camera is down in the grass
    tufts(t, camX - 2600, camX + 2600, 1900, 170, 652, '#05060e');
    meteor(t, 104.27, [camX - 300, 300], [camX + 450, 700], .45, .7);
    paintSet({ bloom: 1.4 });
  }

  // 4 · down in the grass with the wolfdog: it trots past close to the lens, paws kicking dust on the
  //     fast hits, and a few strides behind it he walks on, a silhouette under the Milky Way
  function trail(t, lt, dur) {
    const HZ = 1520, gy = 1660, dsc = 380, V = 175;
    const dx = SC - 250 + (t - T3) * V;                        // the dog, nearer the lens
    const camX = dx - kf(lt, [[0, 120], [dur, 260]], ease.inOut);
    const z = kf(lt, [[0, 1.1], [dur, 1.16]], ease.inOut);
    frame(camX, pick(1330, 1360) - lt * 14, pick(z, z * .74), kf(lt, [[0, -.01], [dur, .012]]));
    nightSky(HZ);
    heavens(t, { hz: HZ, pole: [camX + 1300, -1500], q: [camX + 60, HZ - 300], ang: -1.2, core: -350 });
    plain(HZ, camX);
    tufts(t, camX - 2400, camX + 2400, HZ + 16, 40, 661, '#10142a');
    // him, a little further off and a stride behind the dog, walking the same way
    const h = 600, u = h / 100, wxAt = (tt) => SC - 700 + (tt - T3) * V;
    for (const b of BEATS) dust(t, b, wxAt(b) + 9.4 * u, gy - 60, 60, .9);
    walker(t, wxAt(t), gy - 60, h, { k: .9, wind: -.7 });
    // the dog: two strides per beat, a paw strike kicking dust on every fast hit
    const trot = (t - B0) / BEAT * 2;
    for (const b of FASTS) dust(t, b, SC - 250 + (b - T3) * V + dsc * .3, gy, 44, .9, -1);
    hound(t, dx, gy, dsc, { walk: trot, k: .9, offs: [[1.5, -2]] });
    tufts(t, camX - 2600, camX + 2600, 2020, 230, 662, '#04050c');
    paintSet({ bloom: 1.4 });
  }

  // 5 · the wheel: a vast low wide, the camera rolling as the stars trail round the pole like a long
  //     exposure; shooting stars on the onsets; the two of them tiny on the edge of the world
  function wheel(t, lt, dur) {
    const HZ = 1500;
    const z = kf(lt, [[0, .92], [dur, 1.0]], ease.inOut);
    frame(SC + kf(lt, [[0, -60], [dur, 60]]), pick(kf(lt, [[0, 880], [dur, 940]]), 1110), pick(z, z * .8), kf(lt, [[0, -.05], [dur, .05]], ease.inOut));
    nightSky(HZ);
    const tr = .02 + .16 * ease.inOut(lt / dur);
    heavens(t, { hz: HZ, trail: tr, pole: [SC - 100, 200], rot: skyRot(t) * 3, q: [SC + 200, HZ - 250], ang: -1.3, core: -200, band: .85 });
    plain(HZ, SC, { streak: .8 });
    const x = SC - 60 + (t - T4) * 24;
    hound(t, x + 70, HZ + 8, 44, { k: .7 });
    walker(t, x, HZ + 10, 98, { k: .8 });
    for (const b of BEATS) dust(t, b, SC - 60 + (b - T4) * 24 + 9, HZ + 10, 18, .8);
    meteor(t, 109.07, [SC - 560, 320], [SC + 60, 820], .45);
    meteor(t, 109.47, [SC + 640, 180], [SC + 160, 620], .4, .7);
    meteor(t, 111.07, [SC - 300, 60], [SC + 520, 700], .5, .9);
    paintSet({ bloom: 1.5, flowK: 1.25 });
  }

  // 6 · he stops. The near stars let go of the sky and drift down like slow snow, gathering on the
  //     ground in front of him; on the beat they catch into a small fire, and the camera pushes in on it (c7)
  const FALL = [];
  { const q = rng(671); for (let i = 0; i < 40; i++) { const f0 = FALL.push({ x: lerp(-200, 2100, q()), y: lerp(0, 1000, q()), t0: T5 + .15 + q() * 1.9, d: 2.1 + q() * 1.0, sp: (q() - .5) * 1.6, sz: 3.2 + q() * 3.6, ph: q() * TAU }), st = FALL[f0 - 1]; st.d = Math.min(st.d, tLight + .35 - st.t0); } }
  function gather(t, lt, dur) {
    const HZ = 1400, gy = 1650, fx = SC - 90, fy = 1500, h = 620;
    const push = ease.inOut(inv(T5 + 1.0, Z, t));
    const z = lerp(1.0, 1.5, push);
    frame(lerp(SC + 40, fx + 40, push) + snoise(t * .3, 9) * 10, lerp(pick(1080, 1180), fy - pick(170, 190), push), pick(z, z * .78), kf(lt, [[0, .02], [dur, -.01]]));
    nightSky(HZ);
    heavens(t, { hz: HZ, pole: [SC - 800, -1500], q: [SC - 120, HZ - 250], ang: -1.25, core: -300 });
    plain(HZ, SC);
    const fire = ease.out(inv(tLight - .05, tLight + .9, t));
    // the near stars: bright in the sky at first, then each lets go and drifts down in a slow sway to
    // the spot on the plain ahead of him (computed first so the pool of landed light can grow)
    let landed = 0; const falling = [];
    for (const st of FALL) {
      const k = inv(st.t0, st.t0 + st.d, t);
      const P = (kk) => { const e = ease.inOut(kk), sw = Math.sin(kk * 4 + st.ph) * 160 * Math.sin(Math.PI * e) * (st.sp > 0 ? 1 : -1); return [lerp(st.x, fx + st.sp * 22, e) + sw, lerp(st.y, fy - 10 - Math.abs(st.sp) * 6, e)]; };
      const [px, py] = P(k);
      if (k >= 1) { landed++; if (fire < 1) dot(f, px, py, 2.6 * (1 - fire), `rgba(255,240,215,${(.6 + .4 * Math.sin(t * 9 + st.ph)) * (1 - fire)})`); continue; }
      falling.push([st, k, px, py, P]);
    }
    const pool = landed / FALL.length;
    // the fire the stars became: a warm pool on the plain, a ring of small stones, a few flame tongues
    if (fire > 0) { s.fillStyle = rgrad(s, fx, fy, 0, 460, [[0, `rgba(150,86,44,${.75 * fire})`], [.45, `rgba(76,48,52,${.4 * fire})`], [1, 'rgba(20,20,40,0)']]); s.save(); s.translate(fx, fy); s.scale(1, .3); s.translate(-fx, -fy); s.fillRect(fx - 600, fy - 600, 1200, 1200); s.restore();
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .3; dot(s, fx + Math.cos(a) * 50, fy + 5 + Math.sin(a) * 12, 9 + 4 * hash(i + 3), mixHex('#141624', '#6a4630', fire * (Math.sin(a) > 0 ? .85 : .45))); }
      for (let i = 0; i < 5; i++) ember(t, fx + (i - 2) * 13, fy + 2, (46 + 30 * noise1(t * 3 + i * 5, 11)) * fire * (i === 2 ? 1.5 : i % 4 ? 1.1 : .7), { eyes: 0, seed: i + 60, hue: .3 + .14 * (i % 3), lit: .55 * fire });
      glow(fx, fy - 26, 200 * fire, `rgba(255,120,50,${.13 * fire})`);
      sparks(t, fx, fy - 26, 40, 240, 14, .7 * fire, 67); }
    glow(fx, fy - 12, 40 + 100 * pool, `rgba(255,214,170,${.25 * pool * (1 - fire * .6)})`);
    // he has stopped, his back to us, looking down at the gathering light; the dog stands and watches.
    // The light is beyond him, so it rims him (starlight blue first, then the fire's orange)
    const rimC = `rgba(${lerp(175, 255, fire) | 0},${lerp(195, 150, fire) | 0},${lerp(255, 80, fire) | 0},.9)`;
    const wx = SC + 250, dogX = SC - 440;
    const dogD = (g) => wolfdog(t, dogX, gy - 10, 200, { dir: 1, walk: 0, sil: true, g, look: 1 });
    dogD(s); rimLight(dogD, [[1.5, -1.5]], rimC, .5 + .3 * fire);
    const dW = (g) => wyrd(t, wx, gy, h, { view: 'back', turn: -.3, guitar: 'none', arms: 'down', wind: .6, lit: .06 + .12 * fire, g, sil: g !== s, rim: g === s ? rimC : null });
    const J = dW(s); for (const hd of [J.handL, J.handR]) if (hd) dot(s, hd[0], hd[1], 1.8 * h / 100, '#0d0b0c');
    rimLight(dW, [[-1.5, -1.5], [1.2, -1.5]], rimC, .6 + .3 * fire);
    for (const [st, k, px, py, P] of falling) {
      const e = ease.inOut(k), tw = .75 + .25 * Math.sin(t * 3 + st.ph);
      const col = `rgba(${lerp(232, 255, e) | 0},${lerp(238, 200, e) | 0},${lerp(255, 150, e) | 0},`;
      if (k > 0) { const [qx, qy] = P(inv(st.t0, st.t0 + st.d, t - .07)); stroke(f, [[qx, qy], [px, py]], col + '.2)', st.sz * .9); }
      dot(f, px, py, st.sz * (1 - .35 * e), col + tw + ')'); glow(px, py, st.sz * 6, col + (.22 * tw) + ')');
    }
    flash(hit(t, tLight, 6) * .06, '#ffb070');
    paintSet({ bloom: 1.4 + .15 * fire + .15 * pool, tint: mixA(DREAM.tint, [1, .84, .66], fire * .3), tintK: DREAM.tintK + .05 * fire });
  }

  chapter('stars', A, Z, [
    [A, scatter, { xin: .6 }],
    [T1, reveal],
    [T2, stride],
    [T3, trail],
    [T4, wheel],
    [T5, gather],
  ], { paint: DREAM });
})();
