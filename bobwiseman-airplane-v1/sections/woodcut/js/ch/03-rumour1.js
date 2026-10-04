// v1 section C, 91.000 - 99.5417 (frames 2184-2389). Rumour 1:
// "I gotta know if it's true / they say there once were airplanes / that in the sky flew"
// WOODCUT, chapter one of the legend: told by day, by a swallow, as a carved folk panel.
//   91.00 road     the plane on the black road sings "I gotta know"; a swallow (red throat) swoops in
//                  and hovers by his windscreen, his eyes follow it
//   93.10 ear      tight: the swallow perches on his nose and whispers; carved sound curls pour into
//                  his eyes, which go wide on "true"
//   94.50 legend   the print opens like a pair of shutters onto a legend panel: carved border, hills,
//                  clouds, a sun with a face that sings the words; on "once" the first real airplane
//                  flies in, on "air-" / "-planes" more are stamped into the sky, a flock flapping
//                  like geese (no car tyres: these ones fly)
//   97.50 tilt     "that in the": the panel tilts up, the hills sink, the flock climbs
//   98.37 soar     "sky": the flock soars, the sun bursts red, one plane sweeps out over the frame
//   98.93 flew     back on the road, low and close: he looks up; a tiny flock crosses his sky
(() => {
  const { drawPlane, scr, cam } = K;
  const { swallow, curl, halo, vbird, sunFace, panelFrame, flier, worldDay, flapOf, SEAM, seamCam, toWorldX, tunnel, carwashBack, brush, suds } = L;
  const A = 91.0, B = 2389 / 24;
  const T_EAR = 93.10, T_OPEN = 94.50, T_ONCE = 95.80, T_AIR = 96.60, T_PLANES = 96.97, T_TILT = 97.50, T_SKY = 98.37, T_FLEW = 98.93, T_DRUM = 94.042, T_WASH = 98.70;
  const PX = 900, PY = 862, KP = 1.1, VP = 820;
  const HEAD = scr(PX, PY, KP, 205, -228);
  const sc = (T) => (T - 71) * VP;                         // same road speed as verse 1
  const voc = (T) => clamp((F('voc', T, 1) - .1) / .4);
  // the singing sun follows the BACKING voices (side channel of the vocal stem, js/backing.js), closed between
  const back = (T) => { const B_ = window.BACK, f = (T - B_.t0) * B_.fps, i = Math.floor(f), u = f - i, e = B_.env;
    const v = lerp(e[clamp(i, 0, e.length - 1)] || 0, e[clamp(i + 1, 0, e.length - 1)] || 0, u); return clamp((v - .28) / .45); };

  function hero(T) {
    const blink = Math.max(...[92.5, 99.3].map((b) => tri(T - b, .08)));
    return { t: T, open: voc(T), bob: beatPulse(T, 7) * 9, lid: blink, roll: T * 3, spin: T * TAU * 2.3, look: [.7, .15], brow: [0, 0] };
  }
  const lookAt = (x, y) => { const dx = x - HEAD[0], dy = y - HEAD[1], l = Math.hypot(dx, dy) || 1; return [clamp(dx / l * 1.1, -1, 1), clamp(dy / l * 1.1, -1, 1)]; };

  // the swallow's flight (world coords): it comes over the tunnel hill once he is out
  function birdAt(T) {
    const x = kf(T, [[92.2, 120], [92.45, 760], [92.62, 1290], [93.1, 1280]], ease.sine);
    const y = kf(T, [[92.2, 230], [92.45, 280], [92.62, 505], [93.1, 495]], ease.sine) + Math.sin(T * 9) * 8 * smooth(inv(92.55, 92.75, T));
    return [x, y, T < 92.55 ? 1 : -1];
  }
  // 91.00 v3 seam from riso, part 1: inside the carved tunnel (seam framing, lamps streaking, him outlined);
  // the bright arch of the exit ahead grows as he drives at it, its stone rim sweeps over him and daylight
  // floods in. The rim crosses his nose ~91.4 and his tail ~92.1: about a second of emerging.
  const T_OUT = 92.30;
  const archBase = 914;
  function archPath(ax, hw, k = 1) { const w = hw * k, h = hw * .9; s.beginPath(); s.moveTo(ax - w, archBase + 40); s.lineTo(ax - w, archBase - h); s.arc(ax, archBase - h, w, Math.PI, TAU); s.lineTo(ax + w, archBase + 40); s.closePath(); }
  function tunnelIn(t) {
    const T = step(t), u = inv(A, T_OUT, T), hw = 95 * Math.pow(16, u), ax = lerp(1640, 1700, u);
    withT(() => { seamCam(); s.fillStyle = INK; s.fillRect(-500, -500, 4000, 2000); tunnel(T, 1e5, sc(T)); });
    // light from the exit raking back down the tunnel
    for (let i = 0; i < 9; i++) { const a = Math.PI + (i - 4) * .12, x0 = ax - hw * .8, y0 = archBase - hw * (.4 + .1 * (i % 3)), L = 300 + hw * 1.5;
      taper([[x0, y0], [x0 + Math.cos(a) * L, y0 + Math.sin(a) * L * .5]], 14 + hw * .03, 1, CUT); }
    // the stone rim (voussoirs), then daylight inside the opening
    archPath(ax, hw, 1.22); s.fillStyle = CUT; s.fill(); s.lineWidth = 8; s.strokeStyle = INK; s.stroke();
    for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI, cy = archBase - hw * .9; taper([[ax + Math.cos(a) * hw, cy + Math.sin(a) * hw], [ax + Math.cos(a) * hw * 1.22, cy + Math.sin(a) * hw * 1.22]], 6, 6); }
    for (const sd of [-1, 1]) for (let y = archBase - hw * .9; y < archBase; y += hw * .3) taper([[ax + sd * hw, y], [ax + sd * hw * 1.22, y]], 6, 6);
    dot(ax, archBase - hw * 2.0, Math.max(4, hw * .06), RED);                 // keystone mark
    withT(() => { archPath(ax, hw); s.clip();   // daylight through the opening: the far view, growing until it is the whole frame
      const m = clamp(hw * 2.4 / W, .14, 1), cx = lerp(ax, W / 2, m * m);
      s.translate(cx, archBase); s.scale(m, m); s.translate(-W / 2, -archBase);
      withT(() => { seamCam(); worldDay(T, sc(T), { dashY: SEAM.dashY }); }); });
    const st = hero(T); st.look = [.95, -.05]; st.brow = [.9 * smooth(inv(91.1, 91.4, T)), 0]; st.lid = Math.max(st.lid, .25 * smooth(inv(91.35, 91.6, T)) * (1 - smooth(inv(92.0, 92.2, T))));  // squints into the light
    withT(() => { seamCam(); halo(() => drawPlane(PX, PY, KP, st), 4); });
    fx({ flash: .25 * hit(t, 91.95, 6) * (t > 91.95 ? 1 : 0) });
  }
  // part 2: the camera eases back as he rolls on; the carved mouth he came out of stays in view behind him
  function road(t) {
    const T = step(t), u = ease.inOut(inv(T_OUT, 92.95, T)), xf = 470 - (T - T_OUT) * SEAM.V;
    withT(() => { K.cam(lerp(SEAM.z, .9, u), lerp(SEAM.cx, 700, u), lerp(SEAM.cy, 560, u));
      worldDay(T, sc(T), { dashY: SEAM.dashY });
      tunnel(T, xf, sc(T));
      const st = hero(T);
      if (T >= 92.2) { const [bx, by] = birdAt(T); st.look = lookAt(bx, by); st.brow = [.5 * smooth(inv(92.3, 92.6, T)), 0]; } else { st.look = [.9, -.1]; }
      halo(() => drawPlane(PX, PY, KP, st), 4);
      if (T >= 92.2) { const [bx, by, dir] = birdAt(T), hover = T > 92.6;
        halo(() => swallow(bx, by, .95, { dir, flap: Math.sin(T * (hover ? 30 : 15)), rot: hover ? 0 : dir * -.15 + Math.sin(T * 4) * .1, beak: hover ? Math.max(hit(T, 92.63, 9), hit(T, 92.9, 9)) : 0 }), 4);
        for (const c of [92.63, 92.9]) { const u2 = (T - c) / .5; if (u2 > 0 && u2 < 1) curl(bx - 100 - u2 * 60, by - 40 - u2 * 10, Math.PI + .2, 70, u2); } }
    });
  }
  // ear: tight on the face, the swallow perched on his nose
  function earScene(T, z = 2.25) {
    withT(() => { if (z > 2.5) cam(z, HEAD[0] + 80, HEAD[1] - 70); else cam(z, HEAD[0] + 30, HEAD[1] - 40);
      worldDay(T, sc(T));
      const st = hero(T), wide = smooth(inv(93.55, 93.8, T));
      st.look = [lerp(.9, .6, wide), lerp(-.5, -.15, wide)]; st.brow = [lerp(.3, 1.2, wide), lerp(-.4, 0, wide)];
      drawPlane(PX, PY, KP, st);
      const bx = 1214, by = 602 + beatPulse(T, 7) * 9, lean = .12 * Math.sin(T * 7) + (T > 94.0 ? -.12 : 0);
      const talk = T < 93.5 ? Math.abs(Math.sin(T * 14)) * .6 : Math.max(hit(T, 94.0, 7), hit(T, 94.37, 7)) + (T > 94.45 ? 1 : 0);
      halo(() => swallow(bx + 60, by + 6, 1.5, { dir: -1, fold: true, beak: clamp(talk), rot: lean }), 6);
      // curls pour out of the beak toward his eyes
      for (let q = 0; q < 8; q++) { const c = 93.15 + q * .17, u = (T - c) / .7; if (u <= 0 || u >= 1) continue;
        curl(bx - 90 - u * 90, by - 70 - u * 40 - (q % 3) * 14, Math.PI + .4 - (q % 2) * .5, 50 + u * 40, u); }
    });
  }
  function ear(t) { earScene(step(t)); }
  function ear2(t) { earScene(step(t), 3.1); }   // the drum hit at 94.04: tighter on eyes and beak

  // ======================= the legend panel =======================
  const P0 = [56, 46], P1 = [W - 56, H - 46];            // panel outer rect
  const FLOCK = [ // [dx, dy, scale, flap phase, entry time]
    [0, 0, 1, 0, T_ONCE], [-250, 80, .86, .18, T_AIR], [-260, -96, .8, .33, T_AIR], [-500, 160, .72, .5, T_PLANES], [-520, -180, .66, .7, T_PLANES]];
  const FK = .42;
  function camY(T) { return kf(T, [[T_TILT, 0], [T_SKY, 360], [T_FLEW, 760]], ease.inOut); }
  function flockAt(T) { // leader position on screen
    const cx = kf(T, [[T_ONCE, -380], [T_ONCE + .55, 760], [T_SKY, 1080], [T_FLEW, 1500]], ease.out);
    const cy = kf(T, [[T_ONCE, 520], [T_ONCE + .55, 430], [T_TILT, 420], [T_SKY, 380], [T_FLEW, -120]], ease.inOut);
    return [cx, cy];
  }
  function panelInside(T) {
    const cy = camY(T), soar = hit(T, T_SKY, 3) * (T >= T_SKY ? 1 : 0);
    s.fillStyle = CUT; s.fillRect(-50, -50, W + 100, H + 100);
    withT(() => { s.translate(0, cy);
      K.skyLines(T, -760, 560, 36, (T - 71) * 30, 13, 2, 303);
      sunFace(T, 1430, 300 - cy * .55, 112, { open: back(T), burst: T >= T_SKY ? ease.out(inv(T_SKY, T_SKY + .3, T)) : 0, red: T >= T_SKY ? 1 : 0, look: [-.6, .2] });
      for (let i = 0; i < 4; i++) K.cloud(wrap(260 + i * 520 - (T - 91) * 40, W + 600) - 300, -420 + i * 230 % 600, .7 + .15 * (i % 2), 310 + i);
      const g = rng(77); for (let i = 0; i < 14; i++) vbird(wrap(g() * 2200 - (T - 91) * 90, 2200) - 140, -600 + g() * 1050, 14 + g() * 10, flapOf(T, g()));
      K.farHills(T, 690, (T - 91) * 30, 5);
      K.nearHills(T, 790, (T - 91) * 60, 31);
      // carved ground below: rows of furrows and little trees, a ribbon of river
      s.fillStyle = INK; s.fillRect(-50, 790, W + 100, 700);
      for (let j = 0; j < 8; j++) for (let x = -60 + (j % 2) * 30; x < W + 60; x += 60) flick(x, 820 + j * 34, 0, 34, 6);
      taper([[-50, 1000], [400, 980], [900, 1020], [1400, 975], [W + 50, 1000]], 26, 26, CUT);
      for (let x = -40; x < W + 40; x += 90) taper([[x, 1000], [x + 40, 998]], 3, 3);
    });
    // the flock, flying like birds
    const [lx, ly] = flockAt(T);
    for (let i = FLOCK.length - 1; i >= 0; i--) {
      const [dx, dy, k, ph, te] = FLOCK[i]; if (T < te) continue;
      const pop = i ? 1 + .3 * (1 - smooth(inv(te, te + .12, T))) : 1;
      const x = lx + dx * (1 + soar * .3), y = ly + dy + Math.sin(T * 3 + i * 1.7) * 10;
      const rot = -.06 + Math.sin(T * 2 + i) * .04 - .38 * smooth(inv(T_TILT, T_SKY + .2, T));
      if (i && T - te < .25) { const r = rng(i * 13); for (let q = 0; q < 12; q++) { const a = r() * TAU, d = 120 + r() * 80 + (T - te) * 260; dot(x - 40 + Math.cos(a) * d, y - 80 + Math.sin(a) * d * .7, 4 + r() * 6, i % 2 ? RED : INK); } }
      flier(x, y, FK * k * pop, T, { flap: flapOf(T, ph), rot, open: voc(T) * .7, look: [.9, -.2 - .5 * smooth(inv(T_TILT, T_SKY, T))] });
    }
  }
  function legendFrame(T) {
    withT(() => { s.beginPath(); s.rect(P0[0], P0[1], P1[0] - P0[0], P1[1] - P0[1]); s.clip(); panelInside(T); });
    s.fillStyle = CUT; s.fillRect(-50, -50, W + 100, P0[1]); s.fillRect(-50, P1[1], W + 100, 200); s.fillRect(-50, -50, P0[0] + 50, H + 100); s.fillRect(P1[0], -50, 200, H + 100);
    panelFrame(P0[0], P0[1], P1[0], P1[1]);
  }
  // the shutters: two halves of the ear shot swing open onto the panel
  function shutters(T, p) {
    const dw = W / 2 * Math.cos(p * Math.PI / 2); if (dw < 2) return;
    const frozen = T_OPEN - 1 / 24;
    for (const sd of [0, 1]) withT(() => {
      const x0 = sd ? W - dw : 0;
      s.beginPath(); s.rect(x0, 0, dw, H); s.clip();
      s.translate(x0, 0); s.scale(dw / (W / 2), 1); if (sd) s.translate(-W / 2, 0);
      withT(() => { s.beginPath(); s.rect(sd ? W / 2 : 0, 0, W / 2, H); s.clip(); earScene(frozen, 3.1); });
      // the door turning away goes dark in cut rows
      withT(() => { s.beginPath(); s.rect(sd ? W / 2 : 0, 0, W / 2, H); s.clip(); rows(sd ? W / 2 : 0, 0, sd ? W : W / 2, H, Math.PI / 2, 22, () => 22 * p); });
    });
    // the door edges
    s.fillStyle = INK; s.fillRect(dw - 10, 0, 22, H); s.fillRect(W - dw - 12, 0, 22, H);
  }
  function legend(t) {
    const T = step(t), p = ease.in(inv(T_OPEN, T_OPEN + .38, step(t, 24)));
    legendFrame(T);
    if (p < 1) shutters(T, p);
  }
  function soar(t) {
    const T = step(t);
    legendFrame(T);
    // one plane sweeps out over the frame, close to us
    const u = inv(T_SKY, T_WASH, T);
    flier(lerp(-250, 2150, u), lerp(1080, -180, u), .95, T, { flap: flapOf(T, .1) * 1.2, rot: -.42, open: voc(T), look: [1, -.6], brow: [1, 0] });
    fx({ flash: .35 * hit(t, T_SKY, 16) });
  }
  // 98.70 v3 seam to kawaii: back on the road in seam framing, he looks up on "flew" and rolls into a
  // carved car wash; brushes and suds close over him, ending on a soap-white frame
  function wash(t) {
    const T = step(t), xc = toWorldX(1333) - (T - T_WASH) * SEAM.V;
    withT(() => { seamCam();
      worldDay(T, sc(T), { dashY: SEAM.dashY });
      carwashBack(T, xc);
      const st = hero(T), u = ease.out(inv(T_FLEW, T_FLEW + .2, T));
      st.look = [lerp(.8, .2, u), lerp(.1, -1, u)]; st.brow = [.3 + .9 * u, 0]; st.lid = 0;
      halo(() => drawPlane(PX, PY, KP, st), 4);
      withT(() => { s.beginPath(); s.rect(xc, -400, 6000, 1600); s.clip();
        brush(T, xc + 200, 380, 900, 80);                                    // the front brush passes over him
        const n = Math.round(lerp(10, 70, inv(T_FLEW, B, T)));
        suds(5150, n, xc + 40, 420, xc + 1400, 900, 20, 70); });
    });
    // last frames: the suds fill the frame (soap-white match moment)
    const fillU = inv(99.36, B - 1 / 24, T);
    if (fillU > 0) suds(5222, Math.round(240 * fillU), -60, -60, W + 60, H + 60, 50 + 40 * fillU, 120 + 60 * fillU);
  }

  chapter('rumour1', A, B, [[A, tunnelIn], [T_OUT, road], [T_EAR, ear], [T_DRUM, ear2], [T_OPEN, legend], [T_SKY, soar], [T_WASH, wash]]);
})();
