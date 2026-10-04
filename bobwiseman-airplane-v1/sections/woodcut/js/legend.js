// The legend's own carvings, shared by sections C (rumour 1) and E (rumour 2): the swallow that
// carries the rumour, the singing sun, the carved panel border, the flock of real airplanes that
// fly like birds, sound curls, stars, the night world and the day road. Exposed as window.L.
(() => {
  const { plane, drawPlane, skyLines, sun, cloud, farHills, nearHills, poles, road, verge, cam } = K;

  // beat phase 0..1 between the last beat and the next
  function bphase(T) { const i = lastBeat(T), b = FEAT.beats; if (i < 0) return 0; const a = b[i], n = b[i + 1] || a + .567; return clamp((T - a) / (n - a)); }
  // the wing beat: one flap per beat, each flier offset by ph
  const flapOf = (T, ph = 0, amt = 1) => amt * Math.cos(TAU * (bphase(T) + ph));

  // ---- the swallow: facing +x, origin at its feet; wings 'fold' (perched) or flap -1..1 ----
  function swallow(x, y, k, o = {}) {
    const { dir = 1, flap = 0, fold = false, beak = 0, rot = 0, look = 0 } = o;
    withT(() => {
      s.translate(x, y); s.rotate(rot); s.scale(k * dir, k);
      const wing = (f, dy, c = INK) => {
        const tip = [-120, -46 - 170 * f + dy], el = [-34, -52 - 80 * f + dy];
        taper([[16, -48 + dy], el, tip], 46, 3, c);
        for (let i = 0; i < 4; i++) { const u = .35 + i * .16; flick(lerp(el[0], tip[0], u) + 10, lerp(el[1], tip[1], u) + 4, Math.atan2(tip[1] - el[1], tip[0] - el[0]) + .5, 30, 3.5, c === INK ? CUT : INK); }
      };
      if (!fold) wing(flap, -6);                                                     // far wing
      // forked tail
      taper([[-56, -26], [-120, -6], [-178, 14]], 16, 1); taper([[-56, -30], [-124, -26], [-186, -16]], 14, 1);
      const B = [[64, -36], [46, -62], [0, -64], [-44, -48], [-74, -28], [-36, -6], [10, 0], [46, -12]];
      shape(() => smoothPath(B), INK);
      clipTo(() => smoothPath(B), () => { s.beginPath(); s.ellipse(-6, -4, 52, 16, -.1, 0, TAU); s.fillStyle = CUT; s.fill();
        for (let i = 0; i < 4; i++) taper([[-46 + i * 16, -8], [-30 + i * 16, -4]], 3, 3); });
      s.beginPath(); s.ellipse(44, -22, 15, 12, 0, 0, TAU); s.fillStyle = RED; s.fill();       // the red throat
      dot(42, -44, 9, CUT); dot(44 + look * 3, -44, 4.5, INK);                                // eye
      const bo = beak * .5;                                                                    // beak opens
      poly([[60, -42], [92, -38 - bo * 22], [60, -34]], INK);
      poly([[60, -34], [88, -30 + bo * 26], [60, -28]], INK);
      if (fold) { taper([[24, -50], [-30, -44], [-120, -30]], 30, 3); for (let i = 0; i < 3; i++) flick(-6 - i * 26, -46 + i * 3, 3.0, 26, 3); }
      else wing(flap * .9, 6);                                                                 // near wing
      if (fold) { taper([[0, -2], [-4, 14]], 4, 4); taper([[16, -2], [14, 14]], 4, 4); }       // feet
    });
  }
  // a carved sound curl: a spiral that unwinds from (x, y) heading ang; u 0..1 is its age
  function curl(x, y, ang, sz, u, c = INK) {
    const pts = [], turns = 1.6, n = 22;
    for (let i = 0; i <= n; i++) { const a = i / n * turns * TAU, r = sz * (1 - i / n) * .5 + 2; pts.push([x + Math.cos(ang) * sz * i / n * .8 + Math.cos(a + ang) * r, y + Math.sin(ang) * sz * i / n * .8 + Math.sin(a + ang) * r]); }
    const m = Math.max(3, Math.round(n * clamp(u * 1.6)));
    taper(pts.slice(0, m), 9 * (1 - u * .5), 2, c);
  }
  // little V birds (folk margins)
  function vbird(x, y, sz, f, c = INK) { taper([[x - sz, y - sz * .4 * f], [x - sz * .4, y - sz * .25], [x, y]], 2, 6, c); taper([[x, y], [x + sz * .4, y - sz * .25], [x + sz, y - sz * .4 * f]], 6, 2, c); }

  // ---- the singing sun: rayed, with a carved face whose mouth opens with the vocal ----
  function sunFace(T, x, y, r, o = {}) {
    const { open = 0, burst = 0, red = 0, look = [0, 0], rays = 1 } = o;
    dot(x, y, r * 2.2 + burst * r, CUT);
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + T * .2, l = (i % 2 ? r * .55 : r * .9) * rays * (1 + burst * 1.4);
      const p0 = [x + Math.cos(a) * r * 1.2, y + Math.sin(a) * r * 1.2];
      if (i % 2) taper([p0, [x + Math.cos(a) * (r * 1.2 + l), y + Math.sin(a) * (r * 1.2 + l)]], 16, 1);
      else { const a2 = a + .08, p2 = [x + Math.cos(a2) * (r * 1.2 + l * .55), y + Math.sin(a2) * (r * 1.2 + l * .55)]; taper([p0, p2, [x + Math.cos(a) * (r * 1.2 + l), y + Math.sin(a) * (r * 1.2 + l)]], 14, 1); } }
    dot(x, y, r, red > .5 ? RED : CUT);
    s.beginPath(); s.arc(x, y, r, 0, TAU); s.lineWidth = 12; s.strokeStyle = INK; s.stroke();
    // face: almond eyes, carved brows, round cheeks, a mouth that sings
    for (const sd of [-1, 1]) {
      const ex = x + sd * r * .36, ey = y - r * .16;
      s.beginPath(); s.ellipse(ex, ey, r * .16, r * .1, 0, 0, TAU); s.fillStyle = INK; s.fill();
      dot(ex + look[0] * r * .05, ey + look[1] * r * .03, r * .05, CUT);
      taper(arcPts(ex, ey + r * .02, r * .22, r * .2, Math.PI * 1.15, Math.PI * 1.85, 8), 3, 7);
      if (red < .5) dot(x + sd * r * .55, y + r * .2, r * .1, RED); else { s.beginPath(); s.arc(x + sd * r * .55, y + r * .2, r * .1, 0, TAU); s.lineWidth = 4; s.strokeStyle = INK; s.stroke(); }
    }
    taper([[x, y - r * .05], [x - r * .07, y + r * .18], [x + r * .02, y + r * .2]], 6, 4);    // nose
    const mw = r * .3, mh = r * (.05 + .3 * open);
    s.beginPath(); s.ellipse(x, y + r * .48, mw * (1 - open * .25), mh, 0, 0, TAU); s.fillStyle = INK; s.fill();
    if (open > .15) { s.beginPath(); s.ellipse(x, y + r * .48 + mh * .45, mw * .45, mh * .4, 0, 0, TAU); s.fillStyle = red > .5 ? CUT : RED; s.fill(); }
  }
  // ---- a carved panel border: black band, sawtooth, a cut rule, rosettes in the corners ----
  function panelFrame(x0, y0, x1, y1, bw = 52) {
    s.fillStyle = INK;
    s.fillRect(x0, y0, x1 - x0, bw); s.fillRect(x0, y1 - bw, x1 - x0, bw); s.fillRect(x0, y0, bw, y1 - y0); s.fillRect(x1 - bw, y0, bw, y1 - y0);
    taper([[x0 + 12, y0 + 12], [x1 - 12, y0 + 12]], 4, 4, CUT); taper([[x0 + 12, y1 - 12], [x1 - 12, y1 - 12]], 4, 4, CUT);
    taper([[x0 + 12, y0 + 12], [x0 + 12, y1 - 12]], 4, 4, CUT); taper([[x1 - 12, y0 + 12], [x1 - 12, y1 - 12]], 4, 4, CUT);
    // sawtooth cut into the band's inner half
    s.fillStyle = CUT; s.beginPath();
    for (let x = x0 + bw; x < x1 - bw - 1; x += 34) { s.moveTo(x, y0 + bw); s.lineTo(x + 17, y0 + bw - 18); s.lineTo(x + 34, y0 + bw); s.moveTo(x, y1 - bw); s.lineTo(x + 17, y1 - bw + 18); s.lineTo(x + 34, y1 - bw); }
    for (let y = y0 + bw; y < y1 - bw - 1; y += 34) { s.moveTo(x0 + bw, y); s.lineTo(x0 + bw - 18, y + 17); s.lineTo(x0 + bw, y + 34); s.moveTo(x1 - bw, y); s.lineTo(x1 - bw + 18, y + 17); s.lineTo(x1 - bw, y + 34); }
    s.fill();
    for (const [cx, cy] of [[x0 + bw / 2, y0 + bw / 2], [x1 - bw / 2, y0 + bw / 2], [x0 + bw / 2, y1 - bw / 2], [x1 - bw / 2, y1 - bw / 2]]) {
      dot(cx, cy, bw * .62, INK); for (let i = 0; i < 4; i++) flick(cx, cy, i * Math.PI / 2 + Math.PI / 4, bw * .5, 9); dot(cx, cy, 6, RED);
    }
    taper([[x0 + bw + 4, y0 + bw + 4], [x1 - bw - 4, y0 + bw + 4], [x1 - bw - 4, y1 - bw - 4], [x0 + bw + 4, y1 - bw - 4], [x0 + bw + 4, y0 + bw + 4]], 5, 5);
  }
  // ---- the real airplanes of the legend: him minus the car tyres, wings beating ----
  function flier(x, y, k, T, o = {}) {
    const st = { t: T, open: 0, look: [.8, 0], brow: [.4, 0], lid: 0, spin: T * TAU * 2.6 + x * .01, roll: 0, tyres: false, wingY: .3, ...o };  // near wing flattened so it reads level, not hanging
    drawPlane(x, y, k, st);
  }

  // ---- worlds ----
  // the day road (the look test's world A), side on; sc = scroll in px
  function worldDay(T, sc, o = {}) {
    s.fillStyle = CUT; s.fillRect(-50, -50, W + 100, H + 100);
    skyLines(T, 40, 560, 34, sc * .05, 13, 2, 101, o.writhe || 0);
    sun(T, 1540, 230, 92);
    for (let i = 0; i < 3; i++) cloud(wrap(400 + i * 760 - sc * .03, W + 700) - 300, 150 + i * 70 % 160, .8 + .2 * (i % 2), 50 + i);
    farHills(T, 640, sc * .12, 3);
    nearHills(T, 706, sc * .32, 9);
    poles(T, 706, sc);
    road(T, 700, 915, sc, o.dashY || 808);
    verge(T, 915, sc);
  }
  // a four-point carved star
  function star(x, y, r, c = CUT) { taper([[x - r, y], [x, y], [x + r, y]], 1, r * .45 + 1.5, c); taper([[x + r, y], [x, y]], 1, r * .45 + 1.5, c);
    taper([[x, y - r], [x, y]], 1, r * .45 + 1.5, c); taper([[x, y + r], [x, y]], 1, r * .45 + 1.5, c); dot(x, y, r * .22 + 1, c); }
  const STARS = (() => { const g = rng(808), a = []; for (let i = 0; i < 90; i++) a.push([g() * 2400 - 240, g() * 620 + 20, 5 + g() * g() * 16, g()]); return a; })();
  function starfield(T, sc, y1 = 640, skip = null) {
    for (const [x0, y, r, ph] of STARS) { const x = wrap(x0 - sc * .02, 2400) - 240; if (y > y1 || x < -40 || x > W + 40) continue; if (skip && skip(x, y)) continue;
      const tw = .75 + .35 * Math.sin(step(T, 6) * 5 + ph * 40); star(x, y, r * tw); }
  }
  function moon(x, y, r) {
    dot(x, y, r, CUT); dot(x + r * .42, y - r * .16, r * .86, INK);
    for (let i = 0; i < 4; i++) flick(x - r * .55, y - r * .5 + i * r * .33, .35 + i * .1, r * .32, 5, INK);
  }
  // night hills: black mounds lit only by their carved furrows
  function nightHills(T, base, scroll, seed, amp = 1) {
    const PER = 2600, g = rng(seed), M = []; for (let x = 0; x < PER;) { const R = (170 + g() * 120) * amp; M.push([x, R, g()]); x += R * 1.35; }
    for (const rep of [-PER, 0, PER]) for (const [mx, R, kind] of M) {
      const x = mx - wrap(scroll, PER) + rep; if (x + R < -50 || x - R > W + 50) continue;
      const mk = () => { s.beginPath(); s.ellipse(x, base, R, R * .55, 0, Math.PI, TAU); s.closePath(); };
      shape(mk, INK);
      clipTo(mk, () => { for (let i = 1; i < 6; i++) { const f = 1 - i * .16; taper(arcPts(x, base, R * f, R * .55 * f, Math.PI * 1.1, TAU * .9, 18), 1, 2 + i * .6, CUT); } });
      taper(arcPts(x, base, R, R * .55, Math.PI * 1.02, TAU * .98, 22), 3, 6, CUT);
    }
  }
  function worldNight(T, sc, o = {}) {
    s.fillStyle = INK; s.fillRect(-50, -50, W + 100, H + 100);
    starfield(T, sc, 600, o.skip);
    moon(1560, 190, 70);
    // thin cut streaks of cloud across the moon
    for (let i = 0; i < 3; i++) { const y = 150 + i * 34, x = wrap(1250 + i * 140 - sc * .02, W + 900) - 300; taper([[x, y], [x + 200, y + 2], [x + 420, y]], 1, 5, CUT); }
    nightHills(T, 706, sc * .32, 9);
    // road and verge (the road itself is ink; its cut edges and dashes are what show)
    s.fillStyle = INK; s.fillRect(-50, 700, W + 100, 400);
    taper([[-50, 708], [W + 50, 710]], 6, 6, CUT); taper([[-50, 905], [W + 50, 903]], 5, 5, CUT);
    for (let x = -wrap(sc, 150) - 150; x < W + 150; x += 150) flick(x, o.dashY || 808, 0, 90, 13);
    const g = rng(7); for (let i = 0; i < 18; i++) { const x = wrap(g() * 2600 - sc, 2600) - 300, y = lerp(726, 890, g()); flick(x, y, 0, 40 + g() * 70, 3); }
    for (let j = 0; j < 5; j++) for (let x = -wrap(sc, 46) - 46; x < W + 46; x += 46) { const y = 949 + j * 32, xx = x + (j % 2) * 23; flick(xx, y, -1.9, 22, 4); flick(xx + 6, y, -1.25, 22, 4); }
  }

    // a white cut halo round anything drawn in fn (for dark shapes on the night block)
  // drawn on a scratch layer first, so the halo goes round the whole figure, not round each fill
  const HL = [];
  function halo(fn, r = 5) {
    const depth = HL.length; if (!HL[depth]) { const c = document.createElement('canvas'); c.width = Math.round(W * RS); c.height = Math.round(H * RS); HL[depth] = c; }
    const c = HL[depth], g = c.getContext('2d'), prev = s;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.clearRect(0, 0, c.width, c.height); g.setTransform(prev.getTransform());
    HL.length = depth + 1; s = g;
    try { fn(); } finally { s = prev; }
    withT(() => { s.setTransform(1, 0, 0, 1, 0, 0); s.filter = `drop-shadow(0 0 ${r * RS}px #fff) drop-shadow(0 0 ${r * RS}px #fff)`; s.drawImage(c, 0, 0); });
  }
  window.L = { halo, bphase, flapOf, swallow, curl, vbird, sunFace, panelFrame, flier, worldDay, worldNight, star, starfield, moon, nightHills };
})();

// ======================= v3 seams (pinball portals) =======================
// SEAM FRAMING: side view, nose right, plane centred at 50% / 58%, body 45% of frame width, the dashed
// centre line at 72%. With the plane at world (900, 862) x1.1 that is this camera, and the dashes at
// world y 788. World-fixed portal objects move at the road speed (820 world px/s) so motion never changes.
(() => {
  const SEAM = { z: 1.169, cx: 851.6, cy: 585, dashY: 788, PX: 900, PY: 862, KP: 1.1, V: 820 };
  const seamCam = () => K.cam(SEAM.z, SEAM.cx, SEAM.cy);
  const toWorldX = (sx) => (sx - W / 2) / SEAM.z + SEAM.cx;
  // carved stone tunnel mouth seen side on: dark interior left of xf, the hill over it, a stone portal face
  function tunnel(T, xf, sc) {
    s.fillStyle = INK; s.fillRect(xf - 4000, -400, 4000, 1600);
    // interior: ceiling lamps streaking past, the carved road edges and dashes
    for (let x = -wrap(sc, 300) - 300; x < xf; x += 300) { s.beginPath(); s.ellipse(x, 360, 34, 12, 0, 0, TAU); s.fillStyle = CUT; s.fill(); for (let q = -1; q <= 1; q++) taper([[x + q * 14, 380], [x + q * 40, 470]], 4, 1, CUT); }
    taper([[xf - 4000, 330], [xf, 330]], 5, 5, CUT);
    taper([[xf - 4000, 708], [xf, 710]], 6, 6, CUT); taper([[xf - 4000, 905], [xf, 903]], 5, 5, CUT);
    for (let x = -wrap(sc, 150) - 150; x < xf - 60; x += 150) flick(x, SEAM.dashY, 0, 90, 13);
    // the hill above: chevron cuts
    for (let j = 0; j < 5; j++) for (let x = xf - 1200 + (j % 2) * 18; x < xf - 20; x += 36) { flick(x, 160 + j * 30, -.5, 22, 6); flick(x + 16, 150 + j * 30, .5, 22, 6); }
    // hill slope falling away right of the face
    const hs = () => { s.beginPath(); s.moveTo(xf, 120); s.quadraticCurveTo(xf + 260, 160, xf + 420, 700); s.lineTo(xf, 700); s.closePath(); };
    shape(hs, INK); clipTo(hs, () => { for (let j = 0; j < 9; j++) for (let x = xf + (j % 2) * 18; x < xf + 440; x += 36) flick(x, 200 + j * 56, -1.9, 22, 6); });
    // portal face: voussoir blocks and a lintel
    for (let y = 330, i = 0; y < 700; y += 62, i++) { const b = [[xf - 10, y], [xf + 66, y], [xf + 66, y + 58], [xf - 10, y + 58]]; shape(() => pathOf(chisel(b, 900 + i, 3)), CUT, 7); taper([[xf + 4, y + 14], [xf + 50, y + 14]], 2, 2); }
    shape(() => pathOf(chisel([[xf - 60, 276], [xf + 96, 276], [xf + 96, 334], [xf - 60, 334]], 950, 3)), CUT, 8);
    dot(xf + 18, 305, 9, RED);
  }
  // car wash: entrance face at xc, dark wet interior to its right, spinning carved brushes, suds
  function carwashBack(T, xc) {
    withT(() => { s.beginPath(); s.rect(xc, -400, 6000, 1600); s.clip();
      s.fillStyle = INK; s.fillRect(xc, 330, 6000, 590);
      for (let x = xc + 60; x < xc + 3000; x += 54) { const ph = wrap(T * 900 + x * 3, 90); for (let y = 360 + ph; y < 900; y += 90) taper([[x, y], [x, y + 36]], 3, 1, CUT); }   // water jets
      for (const bx of [xc + 260, xc + 760, xc + 1260]) brush(T, bx, 380, 880, 70);
      taper([[xc, 360], [xc + 6000, 360]], 30, 30, INK);
    });
    // roof and gable over the entrance, the striped entrance post, a carved bubble sign (no text)
    s.fillStyle = INK; s.fillRect(xc - 30, 250, 6000, 80); taper([[xc - 50, 248], [xc + 6000, 248]], 6, 6, CUT);
    for (let y = 330; y < 915; y += 46) { s.fillStyle = (y / 46 | 0) % 2 ? RED : CUT; s.fillRect(xc - 26, y, 46, 46); }
    s.lineWidth = 6; s.strokeStyle = INK; s.strokeRect(xc - 26, 330, 46, 585);
    dot(xc + 120, 180, 62, INK); dot(xc + 120, 180, 50, CUT); for (const [dx, dy, r] of [[-14, 8, 18], [16, -10, 13], [10, 18, 9]]) { s.beginPath(); s.arc(xc + 120 + dx, 180 + dy, r, 0, TAU); s.lineWidth = 5; s.stroke(); }
    taper([[xc + 120, 242], [xc + 120, 250]], 8, 8);
  }
  function brush(T, x, y0, y1, w) {
    s.fillStyle = INK; s.fillRect(x - w, y0, w * 2, y1 - y0);
    const ph = wrap(T * 260, 34);
    for (let y = y0 - 34 + ph; y < y1; y += 34) for (let k = -2; k <= 2; k++) flick(x + k * w * .4, y, -.55 + k * .1, w * .9, 7, CUT);
    taper([[x, y0 - 30], [x, y1 + 10]], 10, 10, CUT); taper([[x, y0 - 30], [x, y1 + 10]], 4, 4, INK);
  }
  function suds(seed, n, x0, y0, x1, y1, rmin = 18, rmax = 60) {
    const g = rng(seed);
    for (let i = 0; i < n; i++) { const x = lerp(x0, x1, g()), y = lerp(y0, y1, g()), r = lerp(rmin, rmax, g());
      dot(x, y, r + 6, INK); dot(x, y, r, CUT); taper(arcPts(x, y, r * .6, r * .6, Math.PI * 1.1, Math.PI * 1.55, 6), 2, 5); }
  }
  // printing press: two big carved rollers meeting at the road (the nip), axle at world x xr
  function pressRollers(T, xr, R = 340) {
    const top = SEAM.PY - 4 - R, bot = SEAM.PY + 4 + R;
    // the iron press frame holding both axles
    taper([[xr, top - R - 200], [xr, bot + R]], 120, 120, CUT); taper([[xr, top - R - 200], [xr, bot + R]], 104, 104, INK);
    taper([[xr - 10, top - R - 190], [xr - 10, bot + R]], 6, 6, CUT);
    dot(xr, top - R - 210, 70, INK); taper(arcPts(xr, top - R - 210, 46, 46, -2.6, -1.2, 8), 4, 8, CUT);
    for (const [cy, dir] of [[top, 1], [bot, -1]]) {
      dot(xr, cy, R + 12, CUT); dot(xr, cy, R, INK);
      const a0 = T * 2.6 * dir;
      // a carved spiral groove that turns with the roller, and grain arcs
      const sp = []; for (let a = 0; a < TAU * 3.2; a += .12) sp.push([xr + Math.cos(a + a0) * (60 + a * 14), cy + Math.sin(a + a0) * (60 + a * 14)]);
      taper(sp, 2, 7, CUT);
      for (let i = 0; i < 5; i++) { const a = a0 + i * TAU / 5; taper(arcPts(xr, cy, R * .9, R * .9, a, a + .9, 10), 2, 9, CUT); }
      if (dir > 0) { s.beginPath(); s.arc(xr, cy, R - 6, Math.PI * .15, Math.PI * .85); s.lineWidth = 14; s.strokeStyle = RED; s.stroke(); }   // inked face of the top roller
      dot(xr, cy, 56, CUT); dot(xr, cy, 42, INK); dot(xr, cy, 12, CUT);
    }
    taper([[xr - 40, SEAM.PY], [xr + 60, SEAM.PY]], 5, 5, RED);           // the red ink line at the nip
  }
  Object.assign(L, { SEAM, seamCam, toWorldX, tunnel, carwashBack, brush, suds, pressRollers });
})();
