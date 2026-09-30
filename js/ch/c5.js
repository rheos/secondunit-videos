// js/ch/c5.js · CRACKS (78.667 - 97.583) · bridge + ending · look: cracks (warm ink, glowing cracked earth)
// One location, a cracked clay plain, going from dusk to night. c4 burns the painting to black ash with a
// few embers; this opens out of that black onto the ash-grey plain and ends the film on a hard stop.
// The plain is a real ground plane in perspective (horizon, camera height, parallax), so every shot
// sees the same crack net, the same fire line and the same night falling.
(() => {
  const A = 78.667, Z = 97.583;
  const tWake1 = when('wake', 79), tBurn = when('burn', 82), tDown = when('down', 83.5), tWake2 = when('wake', 85.5);
  const tFlaming = when('flaming', 87), tDream = when('dream', 88), tSeen = when('seen', 89), tNight = when('night', 90);
  const tWhisper = when('whispering', 90.5), tLow = when('low', 91), tDeep = when('deep', 92), tHeat = when('heat', 93);
  const tRising = when('rising', 94), tCracks = when('cracks', 95), tBeneath = when('beneath', 95.3);
  const MAN = 1.85, FIRE_D = 6.5; // his height and the fire line's distance, in ground units (metres)

  // night falls over the whole chapter: 0 = dusk, 1 = full night
  const nightK = (t) => kf(t, [[A, 0], [tSeen, .25], [tWhisper + .4, .82], [tHeat, .9], [Z, 1]], ease.inOut);

  // ---- the ground plane: V = { vx, hz, F, hc, camX } (vanishing x, horizon y, focal px, camera height, camera x) ----
  const proj = (V, X, D) => [V.vx + V.F * (X - V.camX) / D, V.hz + V.F * V.hc / D];
  const place = (V, X, D) => { const [x, y] = proj(V, X, D); return { x, y, h: V.F * MAN / D, D, X }; };

  // dusk sky into night: keep real value in it (a pale band at the horizon) so the etch has mid-tones
  function skyNight(t, V, nk, heat = 0) {
    const hz = V.hz;
    const top = mixHex('#1c1a24', '#04060c', nk), mid = mixHex('#4e424c', '#0e1424', nk), low = mixHex('#b88468', '#3a3e58', nk);
    s.fillStyle = vgrad(s, hz - 1900, hz, [[0, top], [.6, mid], [1, low]]); s.fillRect(-3000, hz - 5000, 9000, 5000);
    // ash-cloud bands drifting low over the horizon
    const r = rng(501);
    for (let i = 0; i < 10; i++) { const cy = hz - 140 - r() * 1300, w = 700 + r() * 1400, hh = 30 + r() * 70, cx = ((r() * 5200 + t * (5 + r() * 9)) % 5200) - 1700;
      s.fillStyle = mixHex(mixHex('#2e272e', '#6e5250', clamp(1 - (hz - cy) / 1300)), '#080b16', nk); s.beginPath(); s.ellipse(cx, cy, w / 2, hh / 2, 0, 0, TAU); s.fill(); }
    // the last light at the horizon, and later the fire's glow on the sky
    glow(V.vx, hz, 1600, `rgba(255,140,90,${.1 * (1 - nk)})`);
    if (heat > 0) { glow(V.vx, hz, 1500, `rgba(255,90,30,${.12 * heat})`); s.fillStyle = vgrad(s, hz - 700, hz, [[0, 'rgba(120,50,26,0)'], [1, `rgba(150,66,30,${.6 * clamp(heat)})`]]); s.fillRect(-3000, hz - 700, 9000, 700); }
    const sa = smooth(inv(.25, .95, nk));
    if (sa > 0) stars(t, 77, 520, -1600, 3500, hz - 2600, hz - 60, sa);
  }
  // the ash-grey clay: base value, then a net of cracked plates in perspective. src = heat sources
  // [{ X, D, R, w, k }]: cracks within R of a source glow (w = soft edge, k = strength), fading with distance.
  function plain(t, V, nk, src = [], o = {}) {
    const { dmax = 9, cell = .5, plates = 5, pool = null } = o;
    s.fillStyle = vgrad(s, V.hz, V.hz + 1500, [[0, mixHex('#7c736d', '#3c3d4c', nk)], [.3, mixHex('#5c5550', '#2a2a34', nk)], [1, mixHex('#3a3431', '#1a181e', nk)]]);
    s.fillRect(-3000, V.hz, 9000, 5000);
    // pool = [X, D, rx, k]: the cracks' heat lighting the clay itself, so silhouettes read dark against it
    if (pool && pool[3] > .01) { const [px, py] = proj(V, pool[0], pool[1]), rx = pool[2]; s.save(); s.translate(px, py); s.scale(1, .32); s.globalAlpha = clamp(pool[3]);
      s.fillStyle = rgrad(s, 0, 0, 0, rx, [[0, '#a2542a'], [.45, '#6a3620'], [1, 'rgba(60,34,26,0)']]); s.fillRect(-rx, -rx, rx * 2, rx * 2); s.restore(); }
    const j0 = Math.max(1, Math.floor(.3 / cell)), j1 = Math.ceil(Math.min(dmax, Math.sqrt(V.F * V.hc * cell / 2.5)) / cell);
    const halfW = 2600; // world px either side of vx that any framing here can see
    const vert = (i, j) => { const k = i * 7919 + j * 104729; return [(i + (hash(k) - .5) * .9) * cell, (j + (hash(k + 1) - .5) * .9) * cell]; };
    const heatAt = (X, D) => { let h = 0; for (const q of src) { const d = Math.hypot(X - q.X, (D - q.D) * 1.1); h = Math.max(h, clamp((q.R - d) / q.w) * q.k * (q.fall ? Math.exp(-d / q.fall) : 1)); } return h; };
    const dark = [], hot = [[], [], [], [], []];
    for (let j = j0; j < j1; j++) {
      const Dj = j * cell, span = halfW * Dj / V.F / cell, i0 = Math.floor(V.camX / cell - span) - 1, i1 = Math.ceil(V.camX / cell + span) + 1;
      for (let i = i0; i <= i1; i++) {
        const a = vert(i, j), pa = proj(V, a[0], a[1]), hk = i * 31 + j * 57;
        const nb = [vert(i + 1, j), vert(i, j + 1)]; if (hash(hk) > .7) nb.push(hash(hk + 5) > .5 ? vert(i + 1, j + 1) : vert(i - 1, j + 1));
        // plates: near cells get a lighter or darker top so the clay reads as broken tiles
        if (Dj < plates) { const b = vert(i + 1, j), c = vert(i + 1, j + 1), d = vert(i, j + 1), v = hash(i * 13 + j * 71);
          s.fillStyle = mixHex(mixHex('#655d57', '#2a2a34', nk), mixHex('#8e847b', '#44465a', nk), v); s.globalAlpha = .3 + .3 * (1 - Dj / plates);
          const pts = [pa, proj(V, b[0], b[1]), proj(V, c[0], c[1]), proj(V, d[0], d[1])];
          s.beginPath(); pts.forEach((p, k) => k ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])); s.fill(); s.globalAlpha = 1; }
        const thin = clamp(1 - V.F * V.hc * cell / (Dj * Dj) / 14) * .8; // far rows crowd into a dark band: thin them out
        nb.forEach((b, n) => { const ek = hk * 3 + n; if (hash(ek + 77) < .14 + thin) return;
          // each crack is a kinked line, not a straight grid edge
          const mX = (a[0] + b[0]) / 2 + (hash(ek + 11) - .5) * cell * .35, mD = (a[1] + b[1]) / 2 + (hash(ek + 12) - .5) * cell * .35;
          const pm = proj(V, mX, mD), pb = proj(V, b[0], b[1]), w = clamp(V.F * .02 / mD * (.55 + .9 * hash(ek + 13)), 1, 30);
          const hh = src.length ? heatAt(mX, mD) * (.7 + .3 * noise1(t * 2.2 + i * .7 + j * 1.3, 8)) : 0;
          (hh > .06 ? hot[Math.min(4, hh * 5 | 0)] : dark).push([pa, pm, pb, w]); });
      }
    }
    const lines = (g, arr, c, wk) => { g.strokeStyle = c; g.lineCap = 'round'; g.lineJoin = 'round'; for (const [p, m, q, w] of arr) { g.lineWidth = w * wk; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(m[0], m[1]); g.lineTo(q[0], q[1]); g.stroke(); } };
    lines(s, dark, mixHex('#1d1512', '#07070a', nk), 1);
    hot.forEach((arr, k) => { if (!arr.length) return; const h = (k + .5) / 5;
      lines(s, arr, mixHex('#3a160c', '#b0401a', h), 1.1);
      f.save(); f.globalCompositeOperation = 'lighter';
      lines(f, arr, `rgba(255,${70 + 50 * h | 0},25,${.32 * h + .06})`, 1.6);
      lines(f, arr, `rgba(255,${150 + 60 * h | 0},90,${.3 * h})`, .4);
      f.restore(); });
    // the heat lights the ground around each source
    for (const q of src) if (q.k > .02) { const [x, y] = proj(V, q.X, q.D), r = V.F * Math.min(q.R, 4) / q.D * .9; glow(x, y, r + 60, `rgba(255,90,30,${.13 * q.k})`); }
  }

  // painted flame tongues (after c4's): deep red roots, orange bodies, amber tips
  function tongue(t, x, y, h, w, seed, hot = 1) {
    if (h < 4) return;
    const sw = snoise(t * 1.6 + seed, 71) * w * .9 + snoise(t * 3.1 + seed, 72) * w * .35, tip = [x + sw, y - h];
    const shape = (k, c) => { s.fillStyle = c; s.beginPath(); s.moveTo(x - w * k, y); s.bezierCurveTo(x - w * k, y - h * .45, tip[0] - w * .3 * k, y - h * .7, tip[0], y - h * (1 - (1 - k) * .35)); s.bezierCurveTo(tip[0] + w * .3 * k, y - h * .7, x + w * k, y - h * .45, x + w * k, y); s.fill(); };
    shape(1, '#6a160b'); shape(.68, '#b53a17'); if (hot > .3) shape(.4, '#e87a28'); if (hot > .7) shape(.16, '#ffb24e');
  }
  // the line of fire across the plain at depth D: it ignites at xA on "burn" and races to xB by "down"
  const fireFront = (t, xA, xB) => lerp(xA, xB, ease.sine(inv(tBurn - .1, tDown + .35, t)));
  const fireEnv = (t) => kf(t, [[tBurn - .12, 1], [tSeen - .15, 1], [tNight + .2, .14], [tWhisper + .6, .06], [Z, .03]], ease.inOut)
    * (1 + .45 * hit(t, tDown, 2.2) + .35 * hit(t, tFlaming, 2) + .3 * hit(t, tDream, 2.4));
  function fireLine(t, V, D = FIRE_D, hM = 2.2, xA = -16, xB = 16) {
    if (t < tBurn - .1) return 0;
    const front = fireFront(t, xA, xB), env = fireEnv(t), step = .42;
    // smoke first (behind the flames): dark ash billows rolling up off the line and leaning downwind
    for (let X = xA, k = 0; X <= front; X += step * 2.5, k++) {
      const age = front - X, [x, y] = proj(V, X, D + .3);
      for (let q = 0; q < 3; q++) { const ph = (t * .18 + hash(k * 3 + q)) % 1, rise = V.F * (hM * .8 + ph * 5) / D * clamp(age / 2) * Math.min(1, env * 1.3);
        const rr = V.F * (.5 + ph * 1.4) / D * clamp(age / 1.5);
        if (rr > 2) { s.fillStyle = `rgba(${34 + 20 * (1 - ph) | 0},${26 + 10 * (1 - ph) | 0},${28},${.5 * (1 - ph * .7) * Math.min(1, env * 1.5)})`; s.beginPath(); s.arc(x + ph * V.F * 1.6 / D, y - rise, rr, 0, TAU); s.fill(); } }
    }
    // two rows of tongues: a taller, darker back row and a lower, hotter front row
    for (const [row, dd, hk, hot] of [[0, .25, 1.15, .5], [1, 0, .8, 1]]) for (let X = xA + row * step * .5; X <= front; X += step) {
      const k = Math.round(X / step * 2) + row * 1000, behind = front - X, ign = clamp(behind / 1.1);
      const lead = clamp(1 - behind / .9) * (t < tDown + .35 ? 1 : 0);
      const n = noise1(t * 1.4 + k * .83, 5) * .7 + noise1(X * .7 + t * .5, 6) * .6 - .15;
      const hh = V.F * hM * hk / D * env * clamp(n, .12, 1.2) * Math.max(ign, lead);
      const [x, y] = proj(V, X + (hash(k) - .5) * step, D + dd + hash(k + 3) * .25);
      tongue(t, x, y, hh, V.F * (.2 + .22 * hash(k + 9)) / D, k + 3, hot);
    }
    const [x0, y] = proj(V, xA, D), [fx] = proj(V, front, D);
    // one continuous glow band along the burning stretch
    const e1 = Math.min(1, env);
    for (let k = 0; k <= 8; k++) { const gx = lerp(x0, fx, k / 8); glow(gx, y - V.F * .6 / D, V.F * 2.2 / D + 80, `rgba(255,90,30,${.07 * e1})`); }
    // the racing head: a hot flare with sparks thrown off it
    if (t < tDown + .35) { glow(fx, y - V.F * .5 / D, V.F * 1.8 / D, 'rgba(255,170,90,.35)'); sparks(t, fx, y, V.F * 1.2 / D, V.F * 2.6 / D, 30, .8, 71); }
    return env;
  }

  // ash drifting down through the air (on s, so it's painted; the etch catches the pale flakes)
  function ash(t, cx, cy, w, h, n, sz, a = 1, seed = 3) {
    for (let i = 0; i < n; i++) {
      const x = cx - w / 2 + ((hash(i * 3 + seed) * w + t * (14 + 30 * hash(i + seed)) + Math.sin(t * .7 + i) * 24) % w + w) % w;
      const y = cy - h / 2 + ((hash(i * 5 + seed) * h + t * (22 + 26 * hash(i * 7 + seed))) % h + h) % h;
      s.fillStyle = `rgba(${150 + 40 * hash(i) | 0},${145 + 36 * hash(i) | 0},${140 + 30 * hash(i) | 0},${a * (.45 + .5 * hash(i * 9))})`;
      s.beginPath(); s.ellipse(x, y, sz * (.5 + hash(i * 11)), sz * (.3 + .3 * hash(i * 13)), t * (hash(i) - .5) * 2 + i, 0, TAU); s.fill();
    }
  }
  // embers rising in a column, with short trails (bigger and denser than sparks())
  function emberColumn(t, x, y, w, rise, n, a, seed = 9) {
    f.save(); f.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const sp = .18 + .3 * hash(i * 3 + seed), ph = (t * sp + hash(i * 7 + seed)) % 1, spread = w * (.3 + .7 * ph) * (hash(i * 11 + seed) - .5);
      const px = x + spread + Math.sin(t * 1.3 + i) * 30 * ph, py = y - ph * rise, al = a * Math.sin(Math.PI * Math.min(1, ph * 1.3)) * (.4 + .6 * hash(i));
      if (al < .02) continue;
      const r = 2 + 3.5 * hash(i * 5 + seed) * (1 - ph * .6), c = `rgba(255,${120 + 90 * (1 - ph) | 0},${50 + 40 * (1 - ph) | 0},${al})`;
      dot(f, px, py, r, c);
    }
    f.restore();
  }
  // the one ember eye snapping open on a sung word: open level + a flare envelope
  const snap = (t, tw) => t < tw - .06 ? 0 : ease.back(inv(tw - .06, tw + .16, t)) * (.8 + .2 * hit(t, tw, 2.5));
  function eyeFlare(J, t, tw, u) { const k = hit(t, tw - .02, 6); if (k > .01) { glow(J.eye[0], J.eye[1], 20 * u * k, `rgba(255,110,40,${.4 * k})`); glow(J.eye[0], J.eye[1], 8 * u * k, `rgba(255,220,170,${.6 * k})`); } }

  // CU framing that fits the brim in 9:16: centre just below the head, the hat crown near the top
  const CUZ = pick(2.55, 1.55), CUY = pick(.085, .02);

  // 1 · out of the ash-black: dusk on the cracked plain, ash falling; the camera rushes in to the veil,
  // and ONE ember eye snaps open on "wake"
  function waken(t, lt, dur) {
    const V = { vx: SC, hz: 1260, F: 1000, hc: .55, camX: kf(lt, [[0, -.25], [dur, .05]]) };
    const m = place(V, 0, 1.34), headY = m.y - m.h * .905, T1 = A + dur;
    // the rush is a push about the veil: the camera centre converges on the CU centre as 1/zoom does,
    // so the hat stays in frame all the way in (both formats)
    const z0 = pick(.6, .46), z = kf(t, [[A, z0], [tWake1 - 1.0, z0 * 1.1], [tWake1 - .06, CUZ], [T1, CUZ * 1.12]], ease.inOut);
    const k = clamp((1 / z - 1 / CUZ) / (1 / z0 - 1 / CUZ)), drift = inv(tWake1, T1, t);
    const ax = m.x + pick(10, 90) + drift * 25, ay = headY + m.h * (CUY - .02 * drift);
    const cx = lerp(ax, SC, k), cy = lerp(ay, 1080, k);
    frame(cx, cy, z * (1 + .025 * hit(t, tWake1, 5)));
    const nk = nightK(t);
    skyNight(t, V, nk);
    plain(t, V, nk);
    ash(t, cx, cy, 3400, 3600, 120, 9, .8, 11);
    const J = wyrd(t, m.x, m.y, m.h, { turn: .2, sing: 1, eye: snap(t, tWake1), wind: .55, lit: .12, guitar: 'hang', arms: 'down', rim: 'rgba(255,170,120,.85)' });
    eyeFlare(J, t, tWake1, m.h / 100);
    ash(t, cx, cy, 2600, 2800, 36, 15, .8, 12); // a few big flakes past the lens
    // c4's last embers still drifting up as the black lifts
    sparks(t, SC, 1800, 1800, 1300, 50, .55 * (1 - inv(A, A + 1.8, t)), 33);
    blackout(1 - ease.out(inv(A, A + 1.1, t)));
    paintSet({ etch: .4 + .08 * inv(tWake1 - .3, tWake1 + .6, t) });
  }

  // 2 · "burn it down": low wide, a line of fire races across the plain behind him, left to right
  function burn(t, lt, dur) {
    const V = { vx: SC, hz: 1230, F: 1000, hc: .5, camX: kf(lt, [[0, -.4], [dur, .35]], ease.inOut) };
    const m = place(V, 0, 2.55), [dx, dy] = shake(t, 6 * hit(t, tBurn, 4) + 4 * hit(t, tDown, 4));
    const z = kf(lt, [[0, .9], [dur, 1.0]], ease.inOut);
    frame(m.x + dx, kf(lt, [[0, 1080], [dur, 1030]]) + dy, pick(z, z * .74));
    const nk = nightK(t), env = t > tBurn ? Math.min(1, fireEnv(t)) : 0;
    skyNight(t, V, nk, env * .8);
    plain(t, V, nk);
    const xA = pick(-5.2, -9.5), xB = pick(5.5, 10);
    fireLine(t, V, FIRE_D, 2.2, xA, xB);
    ash(t, m.x, 1000, 3200, 2600, 110, 8, .75, 21);
    const rim = `rgba(255,${150 + 40 * env | 0},90,${.55 + .4 * env})`;
    wyrd(t, m.x, m.y, m.h, { turn: -.15, sing: .5, wind: .6 + .25 * env, lit: .1, guitar: 'play', rim, eye: .3 * env });
    // ignition flare on "burn" at the far left end
    const [ix, iy] = proj(V, xA, FIRE_D), ih = hit(t, tBurn, 3);
    if (ih > .01) glow(ix, iy - 40, 420 * ih, `rgba(255,160,80,${.4 * ih})`);
    paintSet({ bloom: 1.7 + .3 * hit(t, tDown, 2) });
  }

  // 3 · the second "wake": close on the veil from the other side, the fire line burning behind his head
  function wake2(t, lt, dur) {
    const V = { vx: SC, hz: 560, F: 1000, hc: 1.62, camX: kf(lt, [[0, .15], [dur, -.1]]) };
    const m = place(V, 0, 1.34), headY = m.y - m.h * .905;
    const z = CUZ * kf(lt, [[0, 1.0], [dur, 1.12]], ease.inOut) * (1 + .03 * hit(t, tWake2, 5));
    frame(m.x - pick(10, 100) + kf(lt, [[0, -20], [dur, 20]]), headY + m.h * (CUY - .02 * lt / dur), z);
    const nk = nightK(t), env = Math.min(1, fireEnv(t));
    skyNight(t, V, nk, env);
    plain(t, V, nk, [], { dmax: 7 });
    fireLine(t, V, FIRE_D, 2.6);
    ash(t, m.x, headY, 2400, 2400, 90, 10, .8, 31);
    const J = wyrd(t, m.x, m.y, m.h, { turn: -.24, sing: 1, eye: snap(t, tWake2), wind: .5, lit: .1, guitar: 'none', arms: 'down', rim: 'rgba(255,150,80,.95)' });
    eyeFlare(J, t, tWake2, m.h / 100);
    ash(t, m.x, headY, 2000, 2000, 30, 16, .8, 32);
    paintSet({ etch: .45 });
  }

  // 4 · "this flaming dream": singing with the guitar, the fire flares on "flaming" and "dream",
  // then sinks on "seen" as the night comes down; the camera cranes back
  function flaming(t, lt, dur) {
    const V = { vx: SC, hz: 830, F: 1000, hc: 1.12, camX: kf(lt, [[0, -.2], [dur, .15]]) };
    const m = place(V, 0, 1.5);
    const z = kf(lt, [[0, 1.4], [dur, 1.08]], ease.inOut);
    frame(m.x + pick(0, 40), kf(lt, [[0, 820], [dur, 900]]), pick(z, z * .7));
    const nk = nightK(t), env = Math.min(1.4, fireEnv(t));
    skyNight(t, V, nk, Math.min(1, env));
    plain(t, V, nk, [], { dmax: 8 });
    fireLine(t, V, FIRE_D, 2.3);
    ash(t, m.x, 800, 2800, 2600, 90, 9, .8 * (1 - nk * .5), 41);
    wyrd(t, m.x, m.y, m.h, { turn: .12, sing: 1, eye: .3 + .45 * hit(t, tDream, 1.5), wind: .55, lit: .1, guitar: 'play',
      rim: `rgba(255,${140 + 50 * Math.min(1, env) | 0},90,${.35 + .6 * Math.min(1, env)})` });
    paintSet({ etch: .45 + .12 * inv(tSeen - .2, tSeen + 1.2, t), bloom: 1.7 + .3 * hit(t, tFlaming, 2) });
  }

  const DOG = .62;
  // the wolfdog sitting (wolfdog()'s sit barely folds the legs): haunches down, chest up, front legs
  // straight, ears up, the bushy tail curled on the ground. (x, y) = ground under the chest, sc = its body length.
  function dogSits(t, x, y, sc, d = 1, g = s, c = '#141214') {
    const h = sc * .55, br = Math.sin(t * TAU / 3.1) * sc * .006;
    g.fillStyle = c;
    // haunch and rump
    g.beginPath(); g.ellipse(x - sc * .2 * d, y - h * .32, sc * .24, h * .34, 0, 0, TAU); g.fill();
    // chest rising to the neck
    g.beginPath(); g.moveTo(x - sc * .34 * d, y - h * .1); g.quadraticCurveTo(x - sc * .3 * d, y - h * .95, x + sc * .02 * d, y - h * 1.28 + br);
    g.lineTo(x + sc * .16 * d, y - h * 1.2 + br); g.quadraticCurveTo(x + sc * .2 * d, y - h * .6, x + sc * .1 * d, y); g.lineTo(x - sc * .3 * d, y); g.fill();
    // front legs, straight, paws together
    taper(g, [x + sc * .06 * d, y - h * .55], [x + sc * .1 * d, y], sc * .045, sc * .035, c); taper(g, [x - sc * .02 * d, y - h * .55], [x + sc * .02 * d, y], sc * .045, sc * .035, c);
    // back paw forward on the ground
    g.beginPath(); g.ellipse(x - sc * .05 * d, y - sc * .02, sc * .12, sc * .035, 0, 0, TAU); g.fill();
    // the bushy tail curled round on the ground
    stroke(g, [[x - sc * .4 * d, y - h * .14], [x - sc * .56 * d, y - h * .05], [x - sc * .48 * d, y], [x - sc * .2 * d, y - sc * .01]], c, sc * .085);
    // neck + head, muzzle toward him, ears pointed
    const hd = [x + sc * .12 * d, y - h * 1.42 + br + Math.sin(t * .7) * sc * .01];
    taper(g, [x + sc * .06 * d, y - h * 1.15 + br], hd, sc * .12, sc * .09, c);
    g.save(); g.translate(hd[0], hd[1]); g.scale(d, 1);
    g.beginPath(); g.moveTo(-sc * .08, -sc * .06); g.lineTo(sc * .2, sc * .02); g.lineTo(sc * .18, sc * .07); g.lineTo(-sc * .08, sc * .09); g.fill();
    poly(g, [[-sc * .07, -sc * .04], [-sc * .03, -sc * .2], [sc * .02, -sc * .04]], c); poly(g, [[sc * .01, -sc * .05], [sc * .06, -sc * .19], [sc * .09, -sc * .03]], c);
    g.restore();
  } // body length in ground units: a medium dog
  // 5 · "night ... whispering low": everything hushes: darker, slower; the wolfdog comes in and sits by him
  function hush(t, lt, dur) {
    const V = { vx: SC, hz: 1170, F: 1000, hc: .52, camX: kf(lt, [[0, .1], [dur, -.12]]) };
    const m = place(V, 0, 2.3);
    const z = kf(lt, [[0, .84], [dur, .9]], ease.inOut);
    frame(m.x - pick(40, 60), kf(lt, [[0, 1010], [dur, 1040]]), pick(z, z * .78));
    const nk = nightK(t);
    // a faint glow wakes under him on "deep", a first hint of the heat to come
    const hint = .4 * ease.out(inv(tDeep - .1, tDeep + .5, t));
    skyNight(t, V, nk, fireEnv(t) * .6);
    plain(t, V, nk, hint > .01 ? [{ X: 0, D: 2.3, R: .4 + .4 * hint, w: .5, k: hint }] : []);
    fireLine(t, V, FIRE_D + 2, 1.6);
    // the whisper: pale breath of mist low along the ground
    f.save(); f.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) { const yy = m.y - 20 - hash(i * 5) * 130, pts = [];
      for (let k = 0; k <= 16; k++) { const q = k / 16; pts.push([m.x - 1300 + q * 2600 + (t * 24 + i * 300) % 400, yy + Math.sin(q * 6 + t * .7 + i * 2) * 24]); }
      stroke(f, pts, `rgba(170,180,210,${.035 + .025 * Math.sin(t * .9 + i)})`, 16 + 12 * hash(i)); }
    f.restore();
    // the dog trots in from the left and sits at his side
    const walkK = ease.inOut(inv(tNight - .1, tLow - .05, t)), sit = ease.inOut(inv(tLow - .05, tLow + .3, t));
    const dog = place(V, lerp(-2.7, -1.05, walkK), 2.24);
    const dsc = V.F * DOG / 2.24;
    if (sit < 1) { s.save(); s.globalAlpha *= 1 - sit; wolfdog(t, dog.x, dog.y, dsc, { dir: 1, walk: walkK < 1 ? t * 1.6 : 0, sil: true }); s.restore(); }
    if (sit > 0) { s.save(); s.globalAlpha *= sit; dogSits(t, dog.x + dsc * .1, dog.y, dsc); s.restore(); }
    wyrd(t, m.x, m.y, m.h, { turn: .08, sing: .7, wind: .7, lit: .1, guitar: 'play', rim: 'rgba(170,180,220,.55)', eye: .12 });
    ash(t, m.x, 1000, 2600, 2400, 50, 7, .4, 51);
    paintSet({ boil: 5, flowK: .8, etch: .56, bloom: 1.5 });
  }

  // 6 · "heat ... rising": low at his boots, the cracks glow open under them; embers rise around him
  // and the camera tilts up the duster to the hat as the heat climbs
  function heat(t, lt, dur) {
    const V = { vx: SC, hz: 1260, F: 1000, hc: .22, camX: kf(lt, [[0, -.1], [dur, .08]]) };
    const m = place(V, 0, 1.0);
    const up = ease.inOut(inv(tHeat + .1, tCracks - .05, t));
    const z = lerp(1.32, .98, up) * (1 + .03 * lt / dur);
    frame(m.x + pick(20, 40), lerp(1330, 620, up), pick(z, z * .7));
    const nk = nightK(t), open = ease.out(inv(tHeat - .05, tRising + .8, t)), hint = .6 * (1 - open) + open;
    skyNight(t, V, nk, .7 * open);
    plain(t, V, nk, [{ X: 0, D: 1.0, R: .6 + 2.1 * open, w: .6, k: .5 * hint + .45 * open, fall: 2.5 }], { dmax: 8, cell: .32, pool: [0, 1.0, 700 + 700 * open, .6 + .35 * open] });
    cracks(t, m.x, m.y + 6, 800 * open + 60, Math.max(.12, open), 17, .22);
    glow(m.x, m.y, 900 * open + 120, `rgba(255,95,30,${.08 + .16 * open})`);
    // the heat column behind him, blocked by his body; his rim light goes on top of the block
    for (let k = 0; k < 6; k++) glow(m.x, m.y - k * 380, 560 - k * 30, `rgba(255,${95 + k * 12},40,${.1 * open * (1 - k / 7)})`);
    const o = { turn: .05, wind: .3 + .35 * open, lit: .12 + .28 * open, guitar: 'none', arms: 'down', rim: `rgba(255,140,70,${.45 + .5 * open})`, eye: .6 * inv(tRising, tCracks, t) };
    occlude(() => wyrd(t, m.x, m.y, m.h, { ...o, sil: true, g: f }));
    wyrd(t, m.x, m.y, m.h, o);
    emberColumn(t, m.x, m.y, 1300, 2200, 130, .15 + .85 * open, 61);
    ash(t, m.x, 1100, 2400, 2600, 40, 9, .5 * (1 - open), 62);
    paintSet({ etch: .44, sat: .9, flowK: 1 + .5 * open, bloom: 1.7 + .3 * open });
    if (open > .1) whip(0, -5 * open);
  }

  // 7 · "cracks beneath": the final wide. Him and the dog on the glowing cracks under the stars; the
  // crack net flares open across the plain and a column of embers rises around him. Held to the hard stop.
  function beneath(t, lt, dur) {
    const V = { vx: SC, hz: 1150, F: 1000, hc: kf(lt, [[0, .7], [dur, .86]], ease.inOut), camX: kf(lt, [[0, -.12], [dur, .1]]) };
    const m = place(V, 0, 3.2);
    const z = kf(lt, [[0, 1.02], [dur, .88]], ease.inOut);
    // handoff to c6: over the last ~1.5 s the camera tilts up with the ember column into the night sky
    const tilt = ease.inOut(inv(Z - 1.55, Z, t)), tiltV = Math.sin(Math.PI * inv(Z - 1.55, Z, t));
    frame(m.x, kf(lt, [[0, 1110], [dur, 1040]], ease.inOut) + pick(0, 120) - tilt * pick(1700, 1500), pick(z, z * .9) * (1 - .06 * tilt));
    const nk = nightK(t);
    const burst = 1 + .6 * hit(t, tCracks, 2.5) + .5 * hit(t, tBeneath, 2.2) + .35 * hit(t, 97.04, 3);
    const R = kf(t, [[tCracks - .1, 2], [tBeneath + .8, 6], [Z, 8.5]], ease.out);
    skyNight(t, V, nk, .45 + .2 * (burst - 1));
    if (tilt > 0) stars(t, 78, 360, -1600, 3500, V.hz - 4600, V.hz - 2400, 1); // the sky above the tilt
    plain(t, V, nk, [{ X: 0, D: 3.2, R, w: 2, k: Math.min(1, .6 * burst), fall: 4 }], { pool: [0, 3.25, 900 + 300 * (burst - 1), .75] });
    cracks(t, m.x, m.y + 4, 500, 1, 19, .24);
    // the column of heat: a tall soft glow behind him (occluded by the silhouettes), then embers in front
    for (let k = 0; k < 6; k++) glow(m.x, m.y - k * 240, 300 - k * 20, `rgba(255,${95 + k * 12},40,${.09 * burst * (1 - k / 7)})`);
    const dog = place(V, -.95, 3.12), dsc = V.F * DOG / 3.12;
    dogSits(t, dog.x + dsc * .1, dog.y, dsc);
    occlude(() => { wyrd(t, m.x, m.y, m.h, { turn: .05, wind: .45, guitar: 'play', sil: true, g: f }); dogSits(t, dog.x + dsc * .1, dog.y, dsc, 1, f, '#000'); });
    wyrd(t, m.x, m.y, m.h, { turn: .05, wind: .45, lit: .2, guitar: 'play', rim: 'rgba(255,150,80,.9)', eye: .55 });
    emberColumn(t, m.x, m.y, 520, 1500, 150, .85 * Math.min(1.3, burst), 71);
    sparks(t, m.x, m.y + 60, 1800, 700, 50, .5, 72);
    // the column keeps climbing past the top of frame and fans out as it goes, for c6's embers-into-stars
    const hi = inv(tBeneath, Z - 1.2, t);
    if (hi > 0) emberColumn(t, m.x, m.y - 200, 1500, 3600, 220, .9 * hi, 73);
    paintSet({ etch: .42, sat: .95, bloom: 1.7 + .3 * (burst - 1) });
    if (tiltV > .05) whip(0, 14 * tiltV);
  }

  const warm = { ...LOOK.cracks, etch: .5, tint: [1, .76, .52], tintK: .2, lift: .02, sat: .8 };
  chapter('cracks', A, Z, [
    [A, waken],
    [81.85, burn],
    [85.84, wake2],
    [87.45, flaming],
    [90.63, hush, { paint: { ...warm, sat: .65, tintK: .12 } }],
    [93.04, heat],
    [tCracks - .05, beneath],
  ], { paint: warm });
})();
