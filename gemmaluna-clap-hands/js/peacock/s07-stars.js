// 129.2-142.48 CHORUS 3, "time and stars" (draft 4). Opens on the clock face, small, in the centre (the hand-off from
// the clock tower); it turns into the moon: the same dial, moonlit, keeping its twelve hour marks. Every clap has its
// own framing, matched on the moon, with beat moves between:
// clap 2 (131.867) tight: the moon big on the upper right third, one pair of constellation hands (a star on every
// joint, joined by lines) gathers out of the sky in the centre and claps.
// Hold: on each beat two hour marks pop off the moon and fly out (Gilliam 8A); the camera steps back on the beats.
// clap 3 (135.9) wider: the bare moon in the centre, four constellation pairs on a ring round it, built on those
// twelve stars (each pair's two wrists and the point where its fingertips meet).
// Hold: one pair per beat streams down into the Milky Way; the camera steps back again, the moon to the left third.
// clap 4 (139.967) widest: two great open hands of star dust rise out of the Milky Way and close round the rowboat,
// which glows inside them. The stars shower down; one falling star drops to the middle of the frame and swells:
// it becomes the spotlight on the theatre curtain (SPOT0, verse 3b).
const SPOT0 = { x: 540, y: 1180, r: 240 };   // where the theatre's spotlight opens (the falling star's end)
(() => {
  const [, K2, K3, K4] = CLAPS.slice(8, 12);
  const MOON = { x: 540, y: 560, r: 147 }; // world
  const B1 = [132.567, 133.067, 133.6, 134.133, 134.633, 135.133]; // the beats of the hold after clap 2
  const B2 = [137.2, 137.733, 138.233, 138.733];                    // the beats of the hold after clap 3
  const BEATS = ((window.FEAT && FEAT.beats) || []).filter((b) => b > 128.9 && b < 142.6);
  const COLS = [C.goldPale, C.cream, C.white];
  const starAt = (x, y, r, col = C.goldPale) => { g.fillStyle = col; g.fill(star4(x, y, r)); };
  // many stars in one path per colour (cheap), the same shape as star4
  function starInto(p, x, y, r) { const k = r * .112; p.moveTo(x, y - r); p.quadraticCurveTo(x + k, y - k, x + r, y); p.quadraticCurveTo(x + k, y + k, x, y + r); p.quadraticCurveTo(x - k, y + k, x - r, y); p.quadraticCurveTo(x - k, y - k, x, y - r); p.closePath(); }
  const batch = () => [new Path2D(), new Path2D(), new Path2D()];
  function fillBatch(P, alpha = 1, blur = 0) { g.save(); g.globalAlpha *= alpha; if (blur) { g.shadowColor = 'rgba(255,240,200,.9)'; g.shadowBlur = blur; } for (let i = 0; i < 3; i++) { g.fillStyle = COLS[i]; g.fill(P[i]); } g.restore(); }

  // ---------------- the camera, keyed on where the moon sits on screen (mx, my) and the zoom ----------------
  // A key with a beat list moves in steps on those beats (paper moved by hand), with a little smooth drift under it.
  const CAMK = [
    [129.2, 540, 960, 1], [130.2, 540, 960, 1],                // the hand-off from the clock: held in the centre
    [131.4, 750, 520, 1.38], [132.45, 735, 540, 1.42],         // clap 2: tight, the moon on the upper right third
    [135.45, 540, 1040, .8, B1], [136.6, 540, 1025, .82],      // clap 3: wider, the bare moon in the centre
    [139.0, 380, 580, .62, B2], [140.8, 380, 580, .62],        // clap 4: widest, the moon on the upper left third
    [142.48, 390, 570, .6]];
  function camBase(t) {
    let i = 1; while (i < CAMK.length - 1 && t >= CAMK[i][0]) i++;
    const [t0, x0, y0, z0] = CAMK[i - 1], [t1, x1, y1, z1, steps] = CAMK[i], u = clamp((t - t0) / (t1 - t0));
    const p = steps ? .3 * u + .7 * steps.reduce((s, b) => s + eo((t - b) / .26), 0) / steps.length : eio(u);
    const z = z0 * Math.pow(z1 / z0, p), mx = lerp(x0, x1, p), my = lerp(y0, y1, p);
    return { z, cx: MOON.x - (mx - W / 2) / z, cy: MOON.y - (my - H / 2) / z };
  }
  // a punch in on each clap
  const punchAt = (t, k, amp) => (t < k - .12 ? 0 : t < k ? eo((t - k + .12) / .12) : Math.exp(-5 * (t - k))) * amp;
  const camAt = (t) => { const c = camBase(t); c.z *= 1 + punchAt(t, K2, .06) + punchAt(t, K3, .05) + punchAt(t, K4, .035); return c; };
  const W2S = (x, y, c) => [W / 2 + (x - c.cx) * c.z, H / 2 + (y - c.cy) * c.z];
  const S2W = (x, y, c) => [c.cx + (x - W / 2) / c.z, c.cy + (y - H / 2) / c.z];

  // ---------------- the hands ----------------
  // Hand units: wrist at (0,0), fingers up (-y), about 1.75 tall, the thumb on +x. q 1 = open palm to camera, 0 =
  // closed in profile (narrow, fingers together, the thumb folded along the index finger). A joint per star.
  function handGeo(q) {
    const sx = lerp(.38, 1, q), sp = lerp(.02, .15, q), S = ([x, y]) => [x * sx, y];
    const KN = [[-.29, -.85], [-.1, -.94], [.1, -.96], [.3, -.9]], LEN = [.56, .72, .78, .68]; // little .. index
    const fingers = KN.map(([kx, ky], i) => {
      const a = (i - 1.5) * sp, L = LEN[i], mid = [kx + Math.sin(a) * L * .55, ky - Math.cos(a) * L * .55];
      return [S([kx, ky]), S(mid), S([mid[0] + Math.sin(a * 1.25) * L * .45, mid[1] - Math.cos(a * 1.25) * L * .45])];
    });
    const tb = [.36, -.34], tt = [lerp(.26, .76, q), lerp(-.74, -.86, q)], tj = [lerp(tb[0], tt[0], .5) + .07 * q, lerp(tb[1], tt[1], .5) + .02];
    return { sx, wrist: [0, 0], heel: S([-.36, -.36]), tb: S(tb), tj: S(tj), tt: S(tt), fingers };
  }
  // hand units to drawing space: m mirrors the hand (thumb side), lean turns it about its wrist, then it sits at
  // dir * off along the pair's axis, the pair turned by rot round (cx, cy)
  function handXf(cx, cy, rot, off, dir, sc, m, lean) {
    const c1 = Math.cos(lean), s1 = Math.sin(lean), c2 = Math.cos(rot), s2 = Math.sin(rot);
    return ([x, y]) => { const X0 = m * x * sc, Y0 = y * sc, X = X0 * c1 - Y0 * s1 + dir * off, Y = X0 * s1 + Y0 * c1; return [cx + X * c2 - Y * s2, cy + X * s2 + Y * c2]; };
  }
  // the hand's silhouette (palm, finger and thumb capsules), all wound the same way so the union has no holes
  function silhouette(geo, f, sc, wf = 1) {
    const S = new Path2D(), sx = geo.sx;
    const palm = [[-.3, .03], [-.38, -.36], [-.36, -.8], [-.2, -.92], [0, -.97], [.2, -.97], [.38, -.88], [.44, -.5], [.3, .03]].map(([x, y]) => f([x * sx, y]));
    let ar = 0; for (let i = 0; i < palm.length; i++) { const [x0, y0] = palm[i], [x1, y1] = palm[(i + 1) % palm.length]; ar += x0 * y1 - x1 * y0; }
    if (ar < 0) palm.reverse();
    S.addPath(poly(palm));
    const cap = (a, b, r0, r1) => S.addPath(capsule(a[0], a[1], b[0], b[1], r0 * sc * wf, r1 * sc * wf));
    for (const fg of geo.fingers) { const [k, mm, tp] = fg.map(f); cap(k, mm, .09, .08); cap(mm, tp, .08, .07); }
    cap(f(geo.tb), f(geo.tj), .11, .09); cap(f(geo.tj), f(geo.tt), .09, .075);
    return S;
  }
  // the 17 joint stars: [point, radius in hand units, colour]; the wrist first, the tips brightest
  function joints(geo, f) {
    const J = [[f(geo.wrist), .07, 2], [f(geo.heel), .04, 0], [f(geo.tb), .05, 0], [f(geo.tj), .04, 0], [f(geo.tt), .065, 2]];
    for (const fg of geo.fingers) J.push([f(fg[0]), .045, 0], [f(fg[1]), .04, 1], [f(fg[2]), .07, 2]);
    return J;
  }
  // a constellation hand: a faint glow in its own shape, the bones as lines, a star on every joint. gather < 1: the
  // stars are still flying in from the sky to their joints (the wrist stays put when pin is set)
  function starHand(geo, f, sc, a, { gather = 1, seed = 0, fill = .09, lw = .022, la = .85, pin = false } = {}) {
    if (a <= 0) return;
    const J = joints(geo, f), gl = a * ss(.55, 1, gather), sp = 1 - eo(gather);
    if (gl > 0) {
      if (fill > 0) { g.save(); g.globalAlpha *= gl * fill; g.fillStyle = C.cream; g.shadowColor = 'rgba(250,215,140,.9)'; g.shadowBlur = 26; g.fill(silhouette(geo, f, sc)); g.restore(); }
      const P = (j) => J[j][0], L = new Path2D();
      L.moveTo(...P(0)); L.lineTo(...P(1)); for (let i = 0; i < 4; i++) L.lineTo(...P(5 + i * 3)); L.lineTo(...P(2)); L.closePath(); // the palm
      for (let i = 0; i < 4; i++) { L.moveTo(...P(5 + i * 3)); L.lineTo(...P(6 + i * 3)); L.lineTo(...P(7 + i * 3)); }
      L.moveTo(...P(2)); L.lineTo(...P(3)); L.lineTo(...P(4));
      g.save(); g.globalAlpha *= la * gl; g.strokeStyle = C.goldPale; g.lineWidth = sc * lw; g.lineJoin = 'round'; g.lineCap = 'round';
      g.shadowColor = 'rgba(250,215,140,.85)'; g.shadowBlur = 12; g.stroke(L); g.restore();
    }
    const B = batch();
    J.forEach(([[x, y], r, c], i) => { const s = (pin && i === 0) ? 0 : sp; starInto(B[c], x + (hash(seed + i * 3.1) - .5) * 2.4 * sc * s, y + (hash(seed + i * 7.3) - .5) * 2.4 * sc * s, r * sc * (.88 + .2 * Math.sin(i * 2.3 + seed))); });
    fillBatch(B, a, 10);
  }
  // the clap's pose: d 1 = apart and open, 0 = contact; the approach accelerates into the hit, it opens on "hands"
  const poseD = (t, k) => { const lt = t - k; return lt < 0 ? Math.pow(clamp(-lt / .42), .6) : eo(clamp((lt - .06) / .45)); };
  const OPEN = handGeo(1), SHUT = handGeo(0);
  function pairPose(P, d) { const geo = handGeo(ss(.14, .58, d)), off = lerp(.17, P.off1, d) * P.sc; return [-1, 1].map((dir) => [geo, handXf(P.x, P.y, P.rot, off, dir, P.sc, dir, 0)]); }
  function pairContact(P) { const a = handXf(P.x, P.y, P.rot, .17 * P.sc, -1, P.sc, -1, 0)(SHUT.fingers[2][2]), b = handXf(P.x, P.y, P.rot, .17 * P.sc, 1, P.sc, 1, 0)(SHUT.fingers[2][2]), c = Math.cos(P.rot), s = Math.sin(P.rot); return [(a[0] + b[0]) / 2 + s * .05 * P.sc, (a[1] + b[1]) / 2 - c * .05 * P.sc]; }
  // twelve stars bursting from the contact
  function burst(t, k, x, y, sc) {
    const lt = t - k; if (lt < 0 || lt >= .7) return;
    const B = batch(); for (let i = 0; i < 12; i++) { const b = i / 12 * TAU, r = sc * (.2 + 1.4 * eo(lt / .7)); starInto(B[2], x + Math.cos(b) * r, y + Math.sin(b) * r, sc * .06); }
    fillBatch(B, 1 - lt / .7, 8);
  }
  // the pairs, placed in the world from where they should sit on screen at their own clap
  const P2 = (() => { const c = camBase(K2), [x, y] = S2W(540, 1560, c); return { x, y, sc: 230 / c.z, rot: 0, off1: .78 }; })();
  const P3 = [[320, 790, 165, -.05], [760, 790, 165, .05], [304, 1610, 162, .08], [776, 1610, 162, -.08]].map(([sx, sy, s, rot]) => {
    const c = camBase(K3), [x, y] = S2W(sx, sy, c); return { x, y, sc: s / c.z, rot, off1: .46 }; });

  // ---------------- Gilliam 8A: the moon's twelve hour marks become clap 3's stars ----------------
  const pipHome = (i) => { const a = i / 12 * TAU - Math.PI / 2; return [MOON.x + Math.cos(a) * MOON.r * .55, MOON.y + Math.sin(a) * MOON.r * .55]; };
  const SEEDS = [];
  P3.forEach((P, p) => { for (const dir of [-1, 1]) SEEDS.push({ p, kind: dir, at: handXf(P.x, P.y, P.rot, P.off1 * P.sc, dir, P.sc, dir, 0)(OPEN.wrist) }); SEEDS.push({ p, kind: 0, at: pairContact(P) }); });
  // two mirror-image marks per beat: the upper pairs' outer wrists, inner wrists, the lower pairs' the same, then
  // the four meeting points last, just before the clap. Each takes the free hour mark nearest its direction.
  { const used = new Set();
    [[0, -1, 1, 1], [0, 1, 1, -1], [2, -1, 3, 1], [2, 1, 3, -1], [0, 0, 1, 0], [2, 0, 3, 0]].forEach(([pa, ka, pb, kb], bi) => {
      for (const [pp, kk] of [[pa, ka], [pb, kb]]) {
        const s = SEEDS.find((q) => q.p === pp && q.kind === kk), ang = Math.atan2(s.at[1] - MOON.y, s.at[0] - MOON.x); let best = 0, bd = 9;
        for (let i = 0; i < 12; i++) { if (used.has(i)) continue; const dd = Math.abs((((ang - (i / 12 * TAU - Math.PI / 2)) % TAU) + TAU * 1.5) % TAU - Math.PI); if (dd < bd) { bd = dd; best = i; } }
        used.add(best); s.i = best; s.b = B1[bi];
      } }); }
  const PIPB = Array(12).fill(99); for (const s of SEEDS) PIPB[s.i] = s.b;
  // the flight: flung off the dial along a clockwise curl, slowing into its place
  function pipAt(s, t) {
    const u = eo(clamp((t - s.b - .05) / .7)), A = pipHome(s.i), Bp = s.at, dx = Bp[0] - A[0], dy = Bp[1] - A[1];
    const qx = (A[0] + Bp[0]) / 2 - dy * .28, qy = (A[1] + Bp[1]) / 2 + dx * .28, v = 1 - u;
    return [v * v * A[0] + 2 * v * u * qx + u * u * Bp[0], v * v * A[1] + 2 * v * u * qy + u * u * Bp[1]];
  }
  function homePip(i) { // the clock face's own hour mark, drawn as clockFace draws it
    const [px, py] = pipHome(i), a = i / 12 * TAU - Math.PI / 2, r = MOON.r;
    if (i % 3 === 0) cut(flowerPath(px, py, r * .06, 5, a), C.goldPale, { sh: .3 }); else cut(circle(px, py, r * .022), C.goldPale, { sh: .2, grain: 0 });
  }
  // the moon: the clock's own dial, moonlit and cold, the bezel turned to poppies, a moon waxing in the middle
  function moonFace(t, mr) {
    const { x, y, r } = MOON;
    glow(x, y, r * 2.2, '200,235,225', .16);
    cut(scallop(x, y, r, 40, .04, t * .02), C.gold, { sh: 1.1, lift: .6 });
    haloOrnament(x, y, r, t * .03, 'poppy', C.cream);
    cut(circle(x, y, r * .7), C.tealDeep, { sh: .5 });
    g.save(); g.globalAlpha *= .3; cut(circle(x, y, r * .7), C.tealLight, { sh: 0, grain: .3 }); g.restore();
    cut(ringLace(x, y, r * .62, r * .66), C.goldDeep, { sh: .2, rule: 'evenodd' });
    haloMoon(x, y, r * mr);
  }

  // ---------------- the Milky Way: two great hands of star dust, the arms rising from the bottom corners ----------
  const MW = { x: 540, y: 1560, sc: 300 };
  function mwPose(t) {
    const d = poseD(t, K4), rise = eo(clamp((t - (K4 - 1.15)) / .75)), sink = ss(K4 + .9, K4 + 1.6, t);
    return { d, a: ss(K4 - 1.15, K4 - .75, t) * (1 - sink), dy: (1 - rise) * 120 + sink * 140, q: lerp(.42, 1, ss(.08, .7, d)), off: lerp(.36, .86, d) * MW.sc, lean: lerp(-.13, .07, d) };
  }
  // thumbs inward, so as they close the thumbs and index fingers make a hollow round the boat
  const mwHand = (o, dir) => [handGeo(o.q), handXf(MW.x, MW.y + o.dy, 0, o.off, dir, MW.sc, -dir, dir * o.lean)];
  const mwWrist = (o, dir) => [MW.x + dir * o.off, MW.y + o.dy];
  // the Milky Way itself: two ribbons of stars, one from each bottom corner up into its wrist (the great hands'
  // forearms). The four pairs' stars stream into them; the hands grow out of their ends.
  const cub = (p0, p1, p2, p3, u) => { const s = 1 - u; return [0, 1].map((k) => s * s * s * p0[k] + 3 * s * s * u * p1[k] + 3 * s * u * u * p2[k] + u * u * u * p3[k]); };
  function mwArms(o) {
    return [-1, 1].map((dir) => { const [wx, wy] = mwWrist(o, dir), pts = [];
      for (let i = 0; i <= 18; i++) pts.push(cub([540 + dir * 500, 2020], [540 + dir * 380, 1820], [wx + dir * 40, wy + 260], [wx, wy + 10], i / 18));
      return pts; });
  }
  // a point on an arm: s 0..1 from the corner to the wrist, v -1..1 across; wide at the corner, narrow at the wrist
  function armAt(pts, s, v) {
    const f = clamp(s) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), k = f - i, a = pts[i], b = pts[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, w = MW.sc * lerp(.4, .2, s);
    return [lerp(a[0], b[0], k) - dy / n * v * w, lerp(a[1], b[1], k) + dx / n * v * w];
  }
  // star dust fixed to the hand's own bones: [part, u, v, size, colour]; part 0 the palm, 1-8 finger segments,
  // 9-10 the thumb. A diagonal lane across the palm is densest and brightest.
  const DUST = [];
  for (let i = 0; i < 150; i++) DUST.push([0, hash(i * 1.71 + .3), hash(i * 2.93 + .7), 1.4 + hash(i * 5.1) * 3.6, i % 5 ? 1 : 0]);
  for (let i = 0; i < 70; i++) { const u = hash(i * 4.3 + 1.1), w = (hash(i * 6.7 + 2) - .5) * .3; DUST.push([0, clamp(u + w * .5), clamp(1 - u + w * .5), 2.4 + hash(i * 8.1) * 4, 2]); }
  for (let p = 1; p <= 10; p++) for (let i = 0; i < 22; i++) DUST.push([p, hash(p * 31.7 + i * 1.37), hash(p * 17.3 + i * 3.71) * 2 - 1, 1.4 + hash(p * 3 + i * 9.7) * 3.4, i % 4 ? 1 : 2]);
  const ARM = [...Array(300).keys()].map((i) => [hash(i * 2.31 + 5), (hash(i * 5.17 + 3) * 2 - 1) * (hash(i * 9.3) > .5 ? 1 : .55), 1.2 + hash(i * 7.7) * 3.4, i % 6 ? 1 : 2]);
  function dustAt(geo, f, sc, [part, u, v]) {
    if (part === 0) { const sx = geo.sx, BL = f([-.3 * sx, 0]), BR = f([.32 * sx, 0]), TL = f([-.34 * sx, -.84]), TR = f([.36 * sx, -.88]);
      return [lerp(lerp(BL[0], BR[0], u), lerp(TL[0], TR[0], u), v), lerp(lerp(BL[1], BR[1], u), lerp(TL[1], TR[1], u), v)]; }
    let A, Bq, w;
    if (part <= 8) { const fg = geo.fingers[(part - 1) >> 1], s = (part - 1) & 1; A = f(fg[s]); Bq = f(fg[s + 1]); w = .075; }
    else { A = f(part === 9 ? geo.tb : geo.tj); Bq = f(part === 9 ? geo.tj : geo.tt); w = .085; }
    const dx = Bq[0] - A[0], dy = Bq[1] - A[1], n = Math.hypot(dx, dy) || 1;
    return [A[0] + dx * u - dy / n * v * w * sc, A[1] + dy * u + dx / n * v * w * sc];
  }
  function milkyHand(geo, f, a, t) {
    const sc = MW.sc;
    g.save(); g.globalAlpha *= a * .27; g.fillStyle = C.cream; g.shadowColor = 'rgba(250,230,170,1)'; g.shadowBlur = 46; g.fill(silhouette(geo, f, sc, 1.12)); g.restore();
    const B = batch(); DUST.forEach((D, i) => { const [x, y] = dustAt(geo, f, sc, D); starInto(B[D[4]], x, y, D[3] * (.8 + .35 * Math.sin(t * 6 + i))); });
    fillBatch(B, a * .95, 6);
    starHand(geo, f, sc, a * .85, { fill: 0, lw: .012, la: .6 });
  }

  // the stars of the sky (world)
  const SKY = [...Array(300).keys()].map((i) => [hash(i * 3.7) * 2000 - 260, hash(i * 9.1) * 3500 - 600, 3 + hash(i * 5.3) * 8, hash(i)]);
  // a shooting star with a curved tail and a gold head (the shower: fewer, curving, many angles, not rain)
  function streak(t, x0, y0, ang, t0, len, bend, col) {
    const d = t - t0; if (d < 0 || d > 1) return; const u = eo(d);
    const at = (s) => [x0 + Math.cos(ang + bend * s) * len * s, y0 + Math.sin(ang + bend * s) * len * s];
    const pts = []; for (let j = 8; j >= 0; j--) pts.push(at(Math.max(0, u - j * .03)));
    g.save(); g.globalAlpha *= 1 - d; tendril(pts, 12, C.goldPale, { sh: 0, grain: 0 }); const [hx, hy] = at(u); starAt(hx, hy, 17, col); g.restore();
  }

  SHOT(129.2, 142.48, 'stars', (t, k, d) => {
    const cm = camAt(t), bi = BEATS.reduce((n, b, i) => (b <= t ? i : n), -1), bt = bi >= 0 ? t - BEATS[bi] : 9;
    const dim = 1 - .6 * ss(141.6, 142.4, t);
    g.save(); cam(cm.cx, cm.cy, cm.z);
    sheet(C.tealInk);
    for (let i = 0; i < 5; i++) { g.save(); g.globalAlpha *= .45; cut(cloud(120 + i * 290 + Math.sin(t * .15 + i) * 40, 420 + i * 520, 900, 260, i + 60), i % 2 ? C.tealDeep : C.plumDeep, { sh: 0, grain: .3 }); g.restore(); }
    // the sky twinkles, and on every beat a fifth of it flashes a little
    for (let i = 0; i < SKY.length; i++) { const [x, y, r, p] = SKY[i], pul = (i + bi) % 5 === 0 ? Math.exp(-7 * bt) : 0;
      g.save(); g.globalAlpha *= Math.min(1, .5 + .4 * Math.sin(t * (1.5 + p * 3) + p * 20) + .5 * pul); starAt(x, y, r * (1 + .4 * pul), p > .7 ? C.white : C.goldPale); g.restore(); }

    // the moon: the clock face turning into the moon (128.4-130.7); the hour marks stay until they pop off
    const mo = ss(129.4, 130.7, t), gone = SEEDS.reduce((n, s) => n + ss(s.b, s.b + .4, t), 0) / 12;
    g.save(); g.globalAlpha *= dim;
    if (mo < 1) clockFace(MOON.x, MOON.y, MOON.r, t, .3, 0);
    if (mo > 0) { g.save(); g.globalAlpha *= mo; moonFace(t, .42 + .14 * gone); g.restore(); }
    for (let i = 0; i < 12; i++) if (t < PIPB[i]) homePip(i);
    if (mo < 1) { g.save(); g.globalAlpha *= 1 - mo; for (const dir of [-1, 1]) clockHand(MOON.x, MOON.y, dir * .6, MOON.r * .62, MOON.r * .16); g.restore(); }
    g.restore();
    glow(MOON.x, MOON.y, 420, '250,215,140', .22 * dim);
    // a plant: as the clock becomes the moon, its twelve hour marks glint like stars on a beat
    { const gl = bump(t, 129.97, .45); if (gl > 0) { const Bg = batch(); for (let i = 0; i < 12; i++) { const [x, y] = pipHome(i); starInto(Bg[2], x, y, 15 * gl); } fillBatch(Bg, .9, 8); } }

    // the hour marks in flight and parked (they wait in the sky as the wrists and meeting points of clap 3)
    const a3 = ss(K3 - 1.1, K3 - .75, t);
    { const Bp = batch();
      for (const s of SEEDS) {
        if (t < s.b) continue;
        const pp = pipAt(s, t), u = clamp((t - s.b - .05) / .7), pop = back(clamp((t - s.b) / .25)), lt = t - s.b;
        let al = 1; if (s.kind !== 0) al = 1 - a3; else al = 1 - ss(B2[s.p] - .05, B2[s.p] + .2, t);
        if (al <= 0) continue;
        // the pop: a small gold ring flashes on the dial where the hour mark was
        if (lt < .35) { const [hx, hy] = pipHome(s.i); g.save(); g.globalAlpha *= .85 * (1 - lt / .35); g.strokeStyle = C.goldPale; g.lineWidth = 4; g.beginPath(); g.arc(hx, hy, 8 + 40 * eo(lt / .35), 0, TAU); g.stroke(); g.restore(); }
        // the flight leaves a streak
        if (u > 0 && u < 1) { const tr = []; for (let j = 9; j >= 0; j--) tr.push(pipAt(s, t - j * .022)); g.save(); g.globalAlpha *= .7 * (1 - u * .5); tendril(tr, 9, C.goldPale, { sh: 0, grain: 0 }); g.restore(); }
        const r = (u < 1 ? lerp(12, 17, u) * (.6 + .4 * pop) : 16 + 3 * Math.sin(t * 7 + s.i)) * (s.kind === 0 ? 1.15 : 1);
        if (u >= 1) glow(pp[0], pp[1], 46, '255,240,200', .32 * al);
        starInto(Bp[2], pp[0], pp[1], r * al);
      }
      fillBatch(Bp, 1, 14); }

    // clap 2: one pair gathers out of the sky in the centre, rising into place
    { const a = ss(K2 - 1.1, K2 - .7, t) * (1 - ss(K2 + .9, K2 + 1.5, t)), dd = poseD(t, K2), gat = clamp((t - (K2 - 1.1)) / .5);
      const P = { ...P2, y: P2.y + (1 - eo(clamp((t - (K2 - 1.1)) / .6))) * .5 * P2.sc };
      if (a > 0) pairPose(P, dd).forEach(([geo, f], h) => starHand(geo, f, P.sc, a, { gather: gat, seed: 40 + h * 20 }));
      const la = ss(K2 + .9, K2 + 1.5, t) * (1 - ss(K2 + 1.4, K2 + 2.0, t));
      if (la > 0) { const Bl = batch(); pairPose(P2, 1).forEach(([geo, f]) => joints(geo, f).forEach(([[x, y], r, c], i) => starInto(Bl[c], x, y, r * P2.sc * (.7 + .3 * Math.sin(t * 5 + i))))); fillBatch(Bl, la * .7, 8); }
      const [bx, by] = pairContact(P2); burst(t, K2, bx, by, P2.sc); }

    // clap 3: four pairs on a ring round the bare moon, grown from the hour marks
    P3.forEach((P, p) => {
      const a = a3 * (1 - ss(K3 + .9, K3 + 1.5, t)), dd = poseD(t, K3), gat = clamp((t - (K3 - 1.1)) / .5);
      if (a > 0) pairPose(P, dd).forEach(([geo, f], h) => starHand(geo, f, P.sc, a, { gather: gat, seed: 300 + p * 40 + h * 20, pin: true }));
      const [bx, by] = pairContact(P); burst(t, K3, bx, by, P.sc);
      // after the clap the pair's stars stay, twinkling, until its beat comes to stream them into the Milky Way
      const la = ss(K3 + .9, K3 + 1.5, t) * (1 - ss(B2[p] - .05, B2[p] + .1, t));
      if (la > 0) { const Bl = batch(); pairPose(P, 1).forEach(([geo, f]) => joints(geo, f).forEach(([[x, y], r, c], i) => starInto(Bl[c], x, y, r * P.sc * (.75 + .3 * Math.sin(t * 5 + i + p))))); fillBatch(Bl, la * .8, 8); }
    });
    g.restore();

    // ---- screen space: the Milky Way, the boat, the shower and the falling star ----
    const o = mwPose(t), armA = ss(137.3, 139.0, t) * (1 - ss(K4 + 1.0, K4 + 1.8, t));
    const pk = 1 + punchAt(t, K4, .035);
    g.save(); g.translate(W / 2, H / 2); g.scale(pk, pk); g.translate(-W / 2, -H / 2);
    if (armA > 0 || o.a > 0) glow(540, 1750, 1000, '47,138,128', .2 * Math.max(armA, o.a)); // the sky lifts round the Milky Way
    // the four pairs' stars stream down, one pair per beat, and become the Milky Way's arms
    { const Bs = batch(), Ba = batch(), Bin = batch(), armOut = 1 - ss(K4 + 1.0, K4 + 1.8, t), arms = mwArms(o);
      if (armA > 0) {
        for (const pts of arms) { g.save(); g.globalAlpha *= armA * .07; g.fillStyle = C.cream; g.shadowColor = 'rgba(240,229,200,1)'; g.shadowBlur = 40; g.fill(ribbonAlong(pts, MW.sc * .6)); g.restore(); }
        ARM.forEach(([u, v, r, c], i) => { const [x, y] = armAt(arms[i & 1], Math.pow(u, .8), v); starInto(Ba[c], x, y, r * (.8 + .35 * Math.sin(t * 5 + i))); });
      }
      if (t > B2[0] - .1 && t < K4 + 1.8) P3.forEach((P, p) => {
        const dir = p % 2 ? 1 : -1; let j = 0;
        pairPose(P, 1).forEach(([geo, f]) => joints(geo, f).forEach(([pw, r, c]) => {
          const td = B2[p] + j * .012, u = eio(clamp((t - td) / .75)), au = .1 + hash(p * 50 + j * 1.7) * .85, av = hash(p * 70 + j * 2.9) * 2 - 1; j++;
          if (u <= 0) return;
          const s0 = W2S(pw[0], pw[1], cm), e = armAt(arms[dir < 0 ? 0 : 1], au, av), bend = Math.sin(u * Math.PI) * 90 * dir;
          const x = lerp(s0[0], e[0], u) + bend, y = lerp(s0[1], e[1], u);
          starInto(u < 1 ? Bs[c] : Bin[c], x, y, lerp(r * P.sc * cm.z, 3.2, u));
        }));
      });
      fillBatch(Ba, armA * .9, 6); fillBatch(Bin, armOut, 6); fillBatch(Bs, 1, 10); }
    // clap 4: the two great hands of the Milky Way close round the boat
    if (o.a > 0) for (const dir of [-1, 1]) { const [geo, f] = mwHand(o, dir); milkyHand(geo, f, o.a, t); }
    if (t >= K4 && t < K4 + .7) burst(t, K4, 540, MW.y - 1.6 * MW.sc, MW.sc * .8);

    // the rowboat: drifting on, rowing across the top through clap 3, sailing down into the great palms, held
    // inside the last clap, glowing like a firefly, then rising out again. It surges on every oar stroke.
    const surge = Math.sin(t * TAU / 1.03) * 8;
    const bx = kf3(t, [[129.2, 540], [130.2, 540], [131.4, 300], [132.4, 300], [135.4, 540], [136.6, 560], [137.8, 700], [139.3, 540], [140.7, 540], [141.7, 780], [142.48, 880]]) + surge * ss(130.2, 131, t) * (1 - ss(138.8, 139.3, t));
    const by = kf3(t, [[129.2, 729], [130.2, 715], [131.4, 640], [132.4, 640], [135.4, 330], [136.6, 330], [137.8, 760], [139.3, 1265], [140.7, 1265], [141.7, 560], [142.48, 470]]) + Math.sin(t * 1.3) * 10 * ss(129.4, 130, t);
    const bs = kf3(t, [[129.2, .315], [130.2, .315], [131.4, .4], [135.4, .34], [139.3, .3], [140.7, .3], [141.7, .38]]);
    const fire = t > K4 - .05 ? Math.exp(-1.5 * (t - K4)) * (.75 + .25 * Math.sin(t * 18)) : 0;
    if (fire > .02) glow(bx, by - 40, 240, '250,225,150', .75 * fire);
    rowboat(bx, by, bs, t * TAU / 1.03, 1 + fire);
    g.restore();

    // the shower after the great clap: gold heads on curving tails at many angles
    for (let i = 0; i < 18; i++) { const t0 = K4 + .12 + hash(i * 2.2) * 1.3; streak(t, hash(i * 4.4) * 1000 + 40, -120 + hash(i * 6.6) * 520, Math.PI / 2 + (hash(i) - .5) * 1.3, t0, 1250, (hash(i * 3.3) - .5) * .8, i % 3 ? C.goldPale : C.cream); }
    // the one falling star: a streak from the top left, curving down into the middle, swelling into the spotlight
    const f = ss(141.2, 142.45, t);
    if (f > 0) {
      const P = (u) => [lerp(lerp(120, 300, u), lerp(300, SPOT0.x, u), u), lerp(lerp(160, 900, u), lerp(900, SPOT0.y, u), u)];
      const [sx2, sy2] = P(eio(f)), trail = []; for (let i = 0; i <= 12; i++) trail.push(P(eio(Math.max(0, f - i * .025))));
      g.save(); g.globalAlpha *= .9; tendril(trail.reverse(), 16, C.goldPale, { sh: 0, grain: 0 }); g.restore();
      const r = lerp(14, SPOT0.r, ei(clamp((f - .7) / .3)));
      glow(sx2, sy2, r * 2.2 + 60, '250,215,140', .6 * f);
      starAt(sx2, sy2, 30 + r * .3, C.white);
      if (f > .7) { g.save(); g.globalAlpha *= ei(clamp((f - .7) / .3)); g.fillStyle = C.goldPale; g.fill(circle(sx2, sy2, r)); g.restore(); }
    }
  });
})();
