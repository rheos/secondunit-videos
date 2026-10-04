// v1 section E, 118.750 - 129.9167 (frames 2850-3118). Rumour 2:
// "I gotta know if it's true / they say there once were airplanes / that in the sky flew"
// then "I'm an airplane on the highway" (the line that leads into F).
// WOODCUT, chapter two of the legend: told by night, in the stars, and this time he is in it.
//   118.75 night    the night road cut white out of black; he sings, looking up; on "know" a
//                   constellation in the shape of an airplane joins itself up, star by star
//   121.00 dream    tight on his face: the lids drift down, he dreams
//   122.13 scroll   "they say": a story scroll unrolls across the night; read along it, he appears
//                   three times (Bayeux style): on the road, tyres lifting off it, up among the flock
//   124.60 push     the camera pushes into the scroll's last scene
//   124.87 inside   inside the dream: he flies with the flock, wings beating like theirs, tyres
//                   spinning in the air; "sky" he soars and the carved sun turns red; "flew" the flock
//                   wheels round him
//   126.45 snap     the scroll's roller slams back across the frame: the night road again; startled,
//                   then weary, "I'm an airplane on the highway"; on the last word he glances up at the
//                   plane in the stars
(() => {
  const { drawPlane, plane, scr, cam } = K;
  const { swallow, sunFace, flier, worldNight, flapOf, halo, star, SEAM, seamCam, toWorldX, pressRollers, panelFrame, vbird } = L;
  const A = 118.75, B = 3118 / 24;
  const T_KNOW = 119.37, T_DREAM = 121.0, T_SAY = 122.13, T_PUSH = 124.60, T_IN = 124.87, T_SKY = 125.37, T_FLEW = 125.90, T_SNAP = 126.45, T_DRUM2 = 127.042, T_PRESS = 128.42;
  const PX = 900, PY = 862, KP = 1.1, VP = 820;
  const HEAD = scr(PX, PY, KP, 205, -228);
  const sc = (T) => (T - 71) * VP;
  const voc = (T) => clamp((F('voc', T, 1) - .1) / .4);
  const lookAt = (x, y) => { const dx = x - HEAD[0], dy = y - HEAD[1], l = Math.hypot(dx, dy) || 1; return [clamp(dx / l * 1.1, -1, 1), clamp(dy / l * 1.1, -1, 1)]; };
  function hero(T) {
    const blink = Math.max(...[120.2, 127.9].map((b) => tri(T - b, .08)));
    return { t: T, open: voc(T), bob: beatPulse(T, 7) * 9, lid: blink, roll: T * 3, spin: T * TAU * 2.3, look: [.7, .15], brow: [0, 0] };
  }

  // the airplane in the stars (world coords): points, then the lines that join them
  const CP = [[1010, 300], [960, 238], [800, 232], [600, 226], [540, 150], [500, 152], [520, 300], [800, 318], [760, 255], [700, 395], [780, 180]].map(([x, y]) => [x, y + 90]);
  const CL = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [8, 9], [8, 10]];
  const CPC = [.5, 0, 0, .3, .5, .4, .3, 0, 0, .6, .3];          // extra size
  function constellation(T, lines = true) {
    for (let i = 0; i < CL.length; i++) {
      const t0 = T_KNOW + i * .1, u = clamp((T - t0) / .14); if (!lines || u <= 0) continue;
      const [a, b] = CL[i], pa = CP[a], pb = CP[b];
      taper([pa, [lerp(pa[0], pb[0], u), lerp(pa[1], pb[1], u)]], 3, 3, CUT);
    }
    CP.forEach(([x, y], i) => { const t0 = T_KNOW + i * .09; if (T < t0) return; const pop = 1 + .8 * (1 - smooth(inv(t0, t0 + .15, T)));
      star(x, y, (13 + CPC[i] * 12) * pop, i === 1 ? RED : CUT); });
  }
  const nearStar = (x, y) => CP.some(([a, b]) => Math.hypot(a - x, b - y) < 60);

  function nightRoad(T, st, o = {}) {
    worldNight(T, sc(T), { skip: nearStar, dashY: o.dashY });
    if (o.stars !== false) constellation(T, o.lines !== false);
    if (o.under) o.under();
    if (o.plane) o.plane(); else halo(() => drawPlane(PX, PY, KP, st), 4);
  }
  // 118.75 night: he sings, looking up; the constellation joins up on "know"
  function night(t) {
    const T = step(t);
    withT(() => { cam(kf(T, [[A, 1.18], [T_DREAM, 1.3]]), kf(T, [[A, 980], [T_DREAM, 960]]), kf(T, [[A, 600], [T_DREAM, 560]]));
      const st = hero(T);
      const tgt = T < T_KNOW ? [1300, 300] : CP[Math.min(CP.length - 1, Math.floor((T - T_KNOW) / .09))];
      st.look = lookAt(...tgt); st.brow = [.6, 0];
      nightRoad(T, st);
    });
  }
  // 121.00 dream: tight on the face, the lids drift down
  function dream(t) {
    const T = step(t);
    withT(() => { cam(2.15, HEAD[0] - 40, HEAD[1] - 120);
      const st = hero(T), d = smooth(inv(121.25, 121.85, T));
      st.look = [lerp(-.2, .1, d), -.8]; st.brow = [lerp(.8, 1.1, d), lerp(0, -.6, d)]; st.lid = Math.max(st.lid, .62 * d);
      nightRoad(T, st);
    });
    // the scroll's roller lowers into the top of frame
    const y = kf(T, [[121.7, -120], [T_SAY, 90]], ease.out);
    roller(W / 2, y, W - 240, true);
  }

  // ======================= the story scroll =======================
  const BY0 = 230, BY1 = 850, X0 = 120, X1 = 1800;
  function roller(x, y, len, horiz = false) { // a turned dowel with knobs, black with a cut highlight
    halo(() => { s.translate(x, y); if (horiz) s.rotate(-Math.PI / 2);
      s.fillStyle = INK; s.fillRect(-22, -len / 2, 44, len);
      taper([[-8, -len / 2 + 10], [-8, len / 2 - 10]], 5, 5, CUT);
      for (const e of [-1, 1]) { dot(0, e * (len / 2 + 22), 30, INK); taper(arcPts(0, e * (len / 2 + 22), 18, 18, -2.6, -1.4, 6), 3, 6, CUT); }
    });
  }
  // the strip: content in screen y, strip x; off is how far it has been read
  function strip(T, off) {
    s.fillStyle = CUT; s.fillRect(-50, BY0, W + 100, BY1 - BY0);
    K.skyLines(T, BY0 + 30, BY0 + 330, 30, off, 9, 1.5, 515);
    K.sun(T, 3900 - off + X0, 360, 70);
    for (let i = 0; i < 6; i++) K.cloud(i * 760 + 300 - off + X0, 330 + (i % 3) * 50, .55, 520 + i);
    K.nearHills(T, 740, off, 41);
    s.fillStyle = INK; s.fillRect(-50, 740, W + 100, BY1 - 740);
    for (let x = -wrap(off, 120) - 120; x < W + 120; x += 120) flick(x, 792, 0, 70, 10);
    // continuous narration: three of him along the strip
    const at = (sx) => sx - off + X0;
    const k = .36, st = { t: T, open: voc(T), roll: T * 3, spin: T * TAU * 2.3, look: [.8, -.2], brow: [.6, 0], bob: beatPulse(T, 7) * 6 };
    drawPlane(at(700), 790, k, { ...st, look: [.6, -.9] });                                         // on the road, looking up
    for (let q = 0; q < 4; q++) flick(at(560) - q * 50, 760 - q * 26, Math.PI + .3, 50, 5);          // lift-off dust
    drawPlane(at(1950), 650, k, { ...st, rot: -.22, flap: flapOf(T, .2), wingY: .3 });              // tyres off the road
    const F3 = [[-260, -90, .8], [-280, 110, .75], [240, -150, .7], [-520, 10, .65], [260, 150, .72]];
    for (const [dx, dy, kk] of F3) flier(at(3250) + dx, 520 + dy, k * kk, T, { flap: flapOf(T, dx * .001), open: voc(T) * .6 });
    drawPlane(at(3250), 520, k, { ...st, rot: -.08, flap: flapOf(T, 0), wingY: .3, look: [1, 0], brow: [1, 0] }); // among the flock
    // carved edges of the paper
    taper([[-50, BY0 + 8], [W + 50, BY0 + 8]], 6, 6); taper([[-50, BY1 - 8], [W + 50, BY1 - 8]], 6, 6);
  }
  function scrollView(T) {
    worldNight(T, sc(T), { skip: nearStar }); constellation(T);
    const rx = lerp(X0 + 40, X1, ease.out(inv(T_SAY, T_SAY + .45, step(T, 24))));
    const off = kf(T, [[T_SAY + .3, 0], [T_PUSH, 2550]], ease.inOut);
    withT(() => { s.beginPath(); s.rect(X0, BY0, rx - X0, BY1 - BY0); s.clip(); strip(T, off); });
    roller(X0, (BY0 + BY1) / 2, BY1 - BY0 + 40); roller(rx, (BY0 + BY1) / 2, BY1 - BY0 + 40);
    taper([[X0, BY1 + 10], [X0 - 20, BY1 + 90], [X0 + 6, BY1 + 150]], 7, 4, RED);                   // the cord
    dot(X0 + 6, BY1 + 160, 13, RED);
  }
  function scroll(t) { scrollView(step(t)); }
  function push(t) {
    const T = step(t), z = lerp(1, 2.7, ease.in(inv(T_PUSH, T_IN, step(t, 24))));
    withT(() => { cam(z, lerp(W / 2, X0 + 3250 - 2550, ease.out(inv(T_PUSH, T_IN, T))), lerp(H / 2, 470, ease.out(inv(T_PUSH, T_IN, T)))); scrollView(T); });
  }

  // ======================= inside the dream =======================
  const HX = 860, HK = .82;
  function heroY(T) { return kf(T, [[T_IN, 700], [T_SKY, 690], [T_SKY + .35, 520], [T_SNAP, 540]], ease.inOut); }
  function dreamScene(T) {
    const fl = (T - T_IN) * 900, soar = smooth(inv(T_SKY, T_SKY + .35, T));
    s.fillStyle = CUT; s.fillRect(-50, -50, W + 100, H + 100);
    K.skyLines(T, 30, 1060, 36, fl * .4, 12, 3, 616);
    sunFace(T, 1560, 250 - soar * 40, 105, { open: 0, red: T >= T_SKY ? 1 : 0, burst: T >= T_SKY ? .6 * ease.out(inv(T_SKY, T_SKY + .3, T)) : 0, look: [-.8, .4] });
    for (let i = 0; i < 5; i++) K.cloud(wrap(300 + i * 560 - fl * (.6 + .1 * (i % 3)), W + 800) - 400, 200 + (i * 173) % 700, .9 + .3 * (i % 2), 640 + i);
    K.nearHills(T, 1240 + soar * 160, fl * .3, 51);
    const hy = heroY(T), wheel = T >= T_FLEW;
    const FL = [[-420, -170, .6, .1], [-470, 150, .55, .3], [380, -250, .5, .5], [-760, -20, .5, .7], [420, 230, .62, .9]];
    const pos = FL.map(([dx, dy, k, ph], i) => {
      if (!wheel) return [HX + dx + Math.sin(T * 2 + i) * 20, hy + dy + Math.cos(T * 2.4 + i) * 16, k, ph, 1];
      const a = i / FL.length * TAU + (T - T_FLEW) * 4.2, d = Math.sin(a);
      return [HX + 30 + Math.cos(a) * 640, hy - 60 + d * 230, k * (1 + .35 * d), ph, d];
    });
    const draw = ([x, y, k, ph]) => flier(x, y, k, T, { flap: flapOf(T, ph), rot: -.1 - .25 * soar * (T < T_FLEW ? 1 : 0), open: voc(T) * .6, look: [.8, -.2] });
    pos.filter((p) => !wheel || p[4] < 0).forEach(draw);
    const st = { t: T, open: voc(T), roll: T * 8, spin: T * TAU * 2.6, flap: flapOf(T, 0) * 1.1, wingY: .3, rot: -.1 - .25 * soar + .05 * Math.sin(T * 3), look: [1, -.3 - .4 * soar], brow: [.8 + .5 * soar, 0], bob: 0, lid: 0 };
    drawPlane(HX, hy, HK, st);
    for (let q = 0; q < 5; q++) flick(HX - 420 - q * 70, hy - 120 + q * 24, Math.PI, 120, 7);           // carved speed gouges
    if (wheel) pos.filter((p) => p[4] >= 0).forEach(draw);
  }
  function inside(t) { dreamScene(step(t)); fx({ flash: .3 * hit(t, T_SKY, 16) }); }

  // 126.45 snap: the roller slams back across the frame; behind it, the night road
  function backHero(T) {
    const st = hero(T), sn = T - T_SNAP;
    if (sn < .9) { st.brow = [1.3, 0]; st.look = sn < .45 ? [-.7, -.1] : [.8, -.1]; }
    else { const w = smooth(inv(127.2, 127.8, T)); st.brow = [lerp(1, -.2, w), lerp(0, -.6, w)]; st.lid = Math.max(st.lid, .3 * w); st.look = [.75, .15]; }
    const up = smooth(inv(129.15, 129.45, T)); if (up > 0) { st.look = [lerp(.75, -.1, up), lerp(.15, -1, up)]; st.brow = [lerp(-.2, .7, up), lerp(-.6, -.2, up)]; st.lid = Math.max(blinkOf(T), .3 * (1 - up)); }
    return st;
  }
  const blinkOf = (T) => tri(T - 127.9, .08);
  function roadBack(T) {
    withT(() => { const u = ease.inOut(inv(T_SNAP + .15, T_DRUM2, T));
      cam(lerp(1.3, 1.2, u), lerp(980, 960, u), lerp(600, 580, u));
      nightRoad(T, backHero(T), { lines: false });
    });
  }
  function snap(t) {
    const T = step(t), u = ease.in(inv(T_SNAP, T_SNAP + .17, step(t, 24)));
    if (u >= 1) { roadBack(T); return; }
    const rx = lerp(W + 80, -80, u);
    withT(() => { s.beginPath(); s.rect(-50, -50, rx + 50, H + 100); s.clip(); dreamScene(Math.min(T, T_SNAP)); });
    withT(() => { s.beginPath(); s.rect(rx, -50, W + 100, H + 100); s.clip(); roadBack(T); });
    s.fillStyle = INK; s.fillRect(rx - 48, -50, 96, H + 100);
    taper([[rx - 20, -50], [rx - 20, H + 50]], 8, 8, CUT); taper([[rx + 18, -50], [rx + 18, H + 50]], 3, 3, CUT);
    fx({ flash: .4 * hit(t, T_SNAP + .17, 14) });
  }

  // ======================= v3 seams =======================
  // 118.75 from kawaii: he burst into a billboard printed as a woodcut legend; the paper tears open round
  // him and he comes through onto the night road, in seam framing
  const TEAR = (() => { const g = rng(4242), a = []; for (let i = 0; i < 36; i++) a.push(1 + (g() - .5) * .5); return a; })();
  function billboardPrint(T) {
    s.fillStyle = CUT; s.fillRect(-50, -50, W + 100, H + 100);
    K.skyLines(T, 80, 700, 34, 0, 11, 2, 717);
    sunFace(T, 1480, 330, 120, { open: 0, look: [-.6, .2] });
    const g = rng(91); for (let i = 0; i < 10; i++) vbird(200 + g() * 1500, 120 + g() * 500, 16, .6);
    for (const [x, y, k] of [[420, 420, .42], [700, 300, .36], [760, 520, .34], [1040, 380, .32]]) flier(x, y, k, 118.75, { flap: .5 });
    K.nearHills(T, 900, 400, 71); s.fillStyle = INK; s.fillRect(-50, 900, W + 100, 200);
    panelFrame(18, 18, W - 18, H - 18, 60);
  }
  function holePath(cx, cy, r, k = 1, add = false) { if (!add) s.beginPath(); for (let i = 0; i < TEAR.length; i++) { const a = i / TEAR.length * TAU, rr = r * k * TEAR[i]; s[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .62); } s.closePath(); }
  function tear(t) {
    const T = step(t), T2 = step(t, 24), r = lerp(330, 2300, ease.in(inv(A, A + .5, T2))), cx = 1180, cy = 620;
    // through the hole: the night road, seam framing, him wide eyed
    withT(() => { holePath(cx, cy, r); s.clip();
      withT(() => { seamCam(); const st = hero(T); st.brow = [1.3, 0]; st.look = [.9, -.1]; nightRoad(T, st, { dashY: SEAM.dashY, stars: false }); }); });
    if (r < 2200) {
      // the paper outside the hole, its torn back curling outward, shreds flying
      withT(() => { s.beginPath(); s.rect(-50, -50, W + 100, H + 100); holePath(cx, cy, r * 1.14, 1, true); s.clip('evenodd'); billboardPrint(T); });
      withT(() => { holePath(cx, cy, r * 1.14); holePath(cx, cy, r, 1, true); s.clip('evenodd'); s.fillStyle = CUT; s.fillRect(-50, -50, W + 100, H + 100);
        for (let i = 0; i < 36; i++) { const a = i / 36 * TAU; taper([[cx + Math.cos(a) * r * 1.0, cy + Math.sin(a) * r * .62], [cx + Math.cos(a) * r * 1.14, cy + Math.sin(a) * r * .71]], 2, 5); } });
      s.lineWidth = 6; s.strokeStyle = INK; holePath(cx, cy, r); s.stroke(); holePath(cx, cy, r * 1.14); s.stroke();
      const g = rng(77);
      for (let i = 0; i < 14; i++) { const a = g() * TAU, d = r * (1.1 + (T2 - A) * 2.5 * (.5 + g())), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .62, sz = 30 + g() * 50, ro = (T2 - A) * 8 * (g() - .5) + a;
        withT(() => { s.translate(x, y); s.rotate(ro); shape(() => pathOf([[-sz, -sz * .4], [sz, -sz * .2], [sz * .3, sz * .6]]), CUT, 5); }); }
    }
    fx({ flash: .3 * hit(t, A, 10) });
  }
  // 127.04 the drum hit: a new angle, low and close in front of him
  function road2(t) {
    const T = step(t);
    withT(() => { cam(kf(T, [[T_DRUM2, 1.9], [T_PRESS, 1.6]]), kf(T, [[T_DRUM2, HEAD[0] - 40], [T_PRESS, HEAD[0] - 120]]), kf(T, [[T_DRUM2, HEAD[1] + 60], [T_PRESS, HEAD[1] + 30]]));
      nightRoad(T, backHero(T), { lines: false }); });
  }
  // 128.42 to riso: the road ahead has become the legend scroll's paper, and it feeds him between the
  // printing-press rollers; the last frames are the nip itself, in seam framing
  function press(t) {
    const T = step(t), xr = SEAM.cx + (B - T) * SEAM.V;     // axle reaches frame centre on the last frame
    withT(() => { seamCam();
      const st = backHero(T); st.look = [.9, -.3]; st.brow = [1.2, .2];
      const draw = () => {
        withT(() => { s.beginPath(); s.rect(-3000, -500, xr - 180 + 3000, 2000); s.clip(); drawPlane(PX, PY, KP, st); });
        [[180, 120, .7], [120, 60, .45], [60, 0, .2]].forEach(([a, b, f]) => withT(() => { s.beginPath(); s.rect(xr - a, -500, a - b, 2000); s.clip(); s.translate(0, PY); s.scale(1, f); s.translate(0, -PY); drawPlane(PX, PY, KP, st); }));
      };
      nightRoad(T, st, { dashY: SEAM.dashY, lines: false,
        under: () => { // the scroll paper laid on the road, curling up at its start, its own inked centre line
          const x0 = xr - 1700; s.fillStyle = CUT; s.fillRect(x0, 714, xr - x0, 184);
          taper([[x0, 714], [x0 - 40, 690], [x0 - 20, 905]], 8, 8);
          for (let x = x0 + 40 - wrap(sc(T), 150) + 150; x < xr; x += 150) taper([[x, SEAM.dashY], [x + 80, SEAM.dashY]], 12, 12);
          for (let x = x0 + 40; x < xr; x += 60) taper([[x, 718], [x + 30, 718]], 3, 3); },
        plane: () => halo(draw, 4) });
      pressRollers(T, xr);
    });
  }

  chapter('rumour2', A, B, [[A, tear], [T_KNOW, night], [T_DREAM, dream], [T_SAY, scroll], [T_PUSH, push], [T_IN, inside], [T_SNAP, snap], [T_DRUM2, road2], [T_PRESS, press]]);
})();
