// js/ch/c4.js · CLIMB (69.18 - 85.18)
// Verse 2, first half. The sleeper is flicked across a chasm, climbs a rope of knotted wool,
// meets a towering smug ram, and a giant mallet settles the matter (slapstick only). Then a
// sheep magician, and a line of sheep walking backwards to the doors of the party (c5).
(() => {
  const FLICK = 70.01, LAND = 71.47;                    // flick on the beat, land on the beat
  const IMP = 78.69;                                    // the mallet lands on the beat
  const POPS = [80.85, 81.57, 82.27, 82.99];            // one sheep out of the hat per beat
  const RAM_X = 830, RIDGE = 860;

  // ---------- private cast ----------
  const PJ = { color: '#26336a', coat: '#3b4d8e', headC: SKIN, limbC: '#33447f' };
  function dreamer(pose, x, y, sc, rot = 0, rim = 'rgb(150,168,236)', rimD = [-.05, -.03]) {
    s.save();
    if (rot) { const py = y - .25 * sc; s.translate(x, py); s.rotate(rot); s.translate(-x, -py); }
    if (rim) figure(s, pose, { x: x + rimD[0] * sc, y: y + rimD[1] * sc, sc, color: rim, coat: rim, headC: rim });
    const J = figure(s, pose, { x, y, sc, ...PJ });
    const a = pose.lean + pose.head;
    s.save(); s.translate(J.head[0], J.head[1]); s.rotate(a);
    s.beginPath(); s.ellipse(0, -.01 * sc, .086 * sc, .111 * sc, 0, 0, TAU); s.clip();
    s.fillStyle = HAIR; s.beginPath(); s.ellipse(-.02 * sc, -.08 * sc, .12 * sc, .075 * sc, 0, 0, TAU); s.fill();
    s.restore(); s.restore();
    return J;
  }
  const TUCK = { lean: .5, head: .5, aL: [-.4, -1.9], aR: [-.3, -1.8], lL: [-1.7, .2], lR: [-1.6, .3] };
  const CROUCH = { lean: .35, head: .2, aL: [.6, .2], aR: [-.5, -.2], lL: [-1.1, .5], lR: [-1.0, .6] };
  const CLIMB_A = { lean: -.05, head: -.25, aL: [2.95, 3.1], aR: [2.35, 2.9], lL: [.9, -.1], lR: [-.25, .35] };
  const CLIMB_B = { lean: .05, head: -.25, aL: [2.35, 2.9], aR: [2.95, 3.15], lL: [.25, .4], lR: [-.9, .1] };

  // curled horn: a tapering spiral
  function horn(g, cx, cy, R, d, w, c, cd) {
    const N = 18, A = 1.75 * Math.PI, pts = [];
    for (let i = 0; i <= N; i++) { const a = i / N * A, r = R * (1 - .62 * i / N), th = -Math.PI / 2 + d * a; pts.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r]); }
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) stroke(g, [pts[i], pts[i + 1]], pass ? c : cd, w * (1 - .6 * i / N) * (pass ? 1 : 1.35));
  }
  // the tall ram: stilt legs, sagging wool, a long wool neck, droopy head with curled horns.
  // (x, y) = ground; flat 0..1 squashes it into a pancake (the mallet). Returns the head in world coords.
  function ram(t, x, y, sc, o = {}) {
    const { g = s, leg = 2.6, neck = 1, droop = 0, flat = 0, lids = .64, look = [0, 0], dir = 1, sag = 0, black = false, seed = 7, nod = 0, ax = 0 } = o;
    const k = (c) => black ? '#000' : c;
    const face = k(FACE), wool = k(WOOL), shade = k(WOOL_SH), hi = k(WOOL_HI);
    const sx = 1 + flat * .9, sy = 1 - flat * .92;
    g.save(); g.translate(x + ax * sc, y); g.scale(sx, sy); g.translate(-ax * sc, 0);
    const by = -leg * sc - .32 * sc;
    for (const lx of [-.62, -.4, .4, .62]) {
      const top = [lx * sc, by + .25 * sc], foot = [lx * sc * (1 + flat * .5), 0];
      const knee = [lerp(top[0], foot[0], .5) + dir * .07 * sc, lerp(top[1], foot[1], .5)];
      taper(g, top, knee, .08 * sc, .055 * sc, face); taper(g, knee, foot, .055 * sc, .05 * sc, face);
      dot(g, knee[0], knee[1], .07 * sc, face); dot(g, foot[0] + dir * .03 * sc, -.03 * sc, .07 * sc, face);
    }
    g.fillStyle = shade; g.beginPath(); g.ellipse(0, by + (.12 + .22 * sag) * sc, 1.08 * sc, (.52 + .14 * sag) * sc, 0, 0, TAU); g.fill();
    const r = rng(seed * 31 + 7);
    for (let i = 0; i < 13; i++) {
      const ang = i / 13 * TAU + r() * .3, low = Math.sin(ang) > .35;
      dot(g, Math.cos(ang) * .84 * sc, by + (Math.sin(ang) * .36 - .04 + (low ? .2 * sag : 0)) * sc, (.3 + .12 * r()) * sc, low ? shade : wool);
    }
    g.fillStyle = wool; g.beginPath(); g.ellipse(0, by - .06 * sc, .9 * sc, .43 * sc, 0, 0, TAU); g.fill();
    for (let i = 0; i < 4; i++) dot(g, (-.5 + i * .3) * sc, by + (-.37 + .06 * Math.sin(i * 2.1)) * sc, (.16 + .05 * r()) * sc, hi);
    // neck, a chain of wool puffs that arcs over when it droops
    const p0 = [dir * .62 * sc, by - .15 * sc];
    const hx = dir * (.85 + .55 * droop) * sc + nod * .2 * sc, hy = by - .2 * sc - neck * sc * (1 - .22 * droop);
    const p3 = [hx - dir * .04 * sc, hy + .18 * sc];
    const pts = bez(p0, [p0[0] + dir * .08 * sc, p0[1] - neck * .55 * sc], [p3[0] - dir * (.1 + .4 * droop) * sc, p3[1] - (.2 + .55 * droop) * sc], p3, 14);
    pts.forEach((p, i) => dot(g, p[0] + dir * .05 * sc, p[1] + .05 * sc, lerp(.3, .21, i / 14) * sc, shade));
    pts.forEach((p, i) => dot(g, p[0], p[1], lerp(.27, .19, i / 14) * sc, i % 3 === 1 ? hi : wool));
    // head
    g.save(); g.translate(hx, hy); g.scale((1 + flat * .35) / sx, (1 - flat * .45) / sy); g.rotate((dir * (.12 + .7 * droop) + nod * .3) * (1 - flat));
    for (const d of [-1, 1]) { g.save(); g.translate(d * .27 * sc, 0); g.rotate(d * (1.0 + .35 * droop)); g.fillStyle = face; g.beginPath(); g.ellipse(0, 0, .21 * sc, .07 * sc, 0, 0, TAU); g.fill(); g.restore(); }
    g.fillStyle = face; g.beginPath(); g.ellipse(0, .02 * sc, .27 * sc, .43 * sc, 0, 0, TAU); g.fill();
    for (let i = 0; i < 3; i++) dot(g, (i - 1) * .12 * sc, -.37 * sc - (i === 1 ? .04 * sc : 0), .13 * sc, wool);
    if (!black) {
      for (const d of [-1, 1]) {
        const ex = d * .11 * sc, ey = -.1 * sc, rx = .08 * sc, ry = .062 * sc;
        g.save(); g.beginPath(); g.ellipse(ex, ey, rx, ry, 0, 0, TAU); g.clip();
        g.fillStyle = '#f2eee4'; g.fillRect(ex - rx, ey - ry, rx * 2, ry * 2);
        dot(g, ex + look[0] * .03 * sc, ey + .012 * sc + look[1] * .022 * sc, .036 * sc, '#0a0a0f');
        g.fillStyle = face; g.fillRect(ex - rx, ey - ry, rx * 2, ry * 2 * lids);
        g.restore();
        stroke(g, [[ex - rx, ey - ry + ry * 2 * lids], [ex + rx, ey - ry + ry * 2 * lids]], '#4a4452', .02 * sc);
      }
      stroke(g, [[-.08 * sc, .27 * sc], [.03 * sc, .29 * sc], [.1 * sc, .25 * sc]], '#5d5563', .022 * sc);   // smug
    }
    for (const d of [-1, 1]) horn(g, d * .31 * sc, -.16 * sc, .21 * sc, d, .11 * sc, k('#a88458'), k('#2e241e'));
    g.restore(); g.restore();
    return { head: [x + ax * sc + (hx - ax * sc) * sx, y + hy * sy] };
  }

  // a wooden maul swung around a pivot far off-frame; phi = 0 is striking straight down
  function mallet(g, P, L, phi, hl, hw, black = false) {
    const H0 = [P[0] - L * Math.cos(phi), P[1] - L * Math.sin(phi)];
    taper(g, P, H0, 30, 24, black ? '#000' : '#6a4629');
    if (!black) stroke(g, [P, H0], '#94643a', 7);
    g.save(); g.translate(H0[0], H0[1]); g.rotate(Math.atan2(Math.cos(phi), -Math.sin(phi)));
    g.fillStyle = black ? '#000' : '#8a5a31'; g.fillRect(-hl, -hw, 2 * hl, 2 * hw);
    if (!black) {
      g.fillStyle = '#66401f'; g.fillRect(-hl, hw * .25, 2 * hl, hw * .75);
      g.fillStyle = '#b98449'; g.fillRect(-hl, -hw * .72, 2 * hl, hw * .28);
      g.fillStyle = '#2a2230'; for (const e of [-1, 1]) g.fillRect(e > 0 ? hl * .6 : -hl * .78, -hw * 1.05, hl * .18, hw * 2.1);
      for (const e of [-1, 1]) { g.fillStyle = '#a8753f'; g.beginPath(); g.ellipse(e * hl, 0, hl * .1, hw, 0, 0, TAU); g.fill(); }
    }
    g.restore();
    return H0;
  }
  function starShape(g, x, y, r, rot, c) { const p = []; for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * .45 : r; p.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } poly(g, p, c); }
  function puffs(t, t0, x, y, spread, n, seed, col = '#8d88a2', life = 1.3) {
    const k = t - t0; if (k < 0 || k > life) return;
    const r = rng(seed), e = ease.out(k / (life * .7));
    s.save(); s.globalAlpha = .85 * (1 - k / life);
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1, d = spread * (.35 + .65 * r()) * e;
      dot(s, x + side * d, y - (10 + 70 * r()) * e - r() * 20, (14 + 22 * r()) * (.6 + e), col);
    }
    s.restore();
  }

  // ---------- 1 · the flick (69.18 - 71.70) tossed across the chasm like a coin ----------
  const CL = 700, CR = 690;
  function flick(t, lt, dur) {
    const [sx, sy] = shake(t, 8 * hit(t, FLICK, 9) + 6 * hit(t, LAND, 10));
    cam(kf(t, [[69.18, 560], [FLICK, 600], [70.74, 1010], [LAND, 1290], [71.7, 1320]]) + sx,
        kf(t, [[69.18, 600], [FLICK, 585], [70.74, 290], [LAND, 575], [71.7, 585]]) + sy,
        kf(t, [[69.18, 1.75], [FLICK, 1.85], [70.74, 1.42], [LAND, 1.5], [71.7, 1.56]]), kf(t, [[69.18, -.02], [71.7, .02]]));
    sky('#050a24', '#14225e', '#3a3f86', 700); stars(t, 51, 170, 640, 1);
    fullMoon(1000, 230, 110);
    clouds(t, 13, 120, 360, 'rgba(46,58,120,.5)', 5, 12);
    ridge(s, 650, 70, .0018, 5, '#232a66'); ridge(s, 690, 40, .003, 6, '#1a2156');
    // the chasm: a long drop into the dark
    s.fillStyle = vgrad(s, 690, 1100, [[0, '#0d1236'], [.35, '#05071c'], [1, '#010208']]); s.fillRect(-200, 690, W + 500, 600);
    glow(1000, 1060, 420, 'rgba(90,110,220,.12)');
    // the two cliffs, moonlit faces and bright top edges
    poly(s, [[-200, CL], [530, CL - 6], [610, CL + 10], [650, 820], [615, 990], [670, H + 100], [-200, H + 100]], '#262b62');
    poly(s, [[610, CL + 10], [650, 820], [615, 990], [670, H + 100], [590, H + 100], [560, 980], [590, 820], [560, CL + 20]], '#3a4184');
    poly(s, [[-200, CL - 2], [530, CL - 8], [612, CL + 8], [600, CL + 24], [-200, CL + 20]], '#7078bd');
    poly(s, [[1420, CR + 8], [1480, CR], [2300, CR - 10], [2300, H + 100], [1330, H + 100], [1385, 980], [1350, 820]], '#262b62');
    poly(s, [[1418, CR + 6], [1480, CR - 2], [2300, CR - 12], [2300, CR + 12], [1428, CR + 24]], '#7078bd');
    // the flicker: a sheep dips its nose under the sleeper's heels and tosses its head
    const rock = t < 69.95 ? .2 * ease.inOut(inv(69.4, 69.95, t)) : t < FLICK + .02 ? lerp(.2, -.32, ease.out(inv(69.95, FLICK + .02, t))) : -.32 * (1 - ease.inOut(inv(70.3, 70.9, t)));
    const SX = 390, SSC = 112;
    s.save(); s.translate(SX - .5 * SSC, CL); s.rotate(rock); s.translate(-(SX - .5 * SSC), -CL);
    sheep(t, SX, CL + 2, SSC, { seed: 4, lids: .6, look: [t < FLICK ? .6 : clamp((t - FLICK) * 2), t < FLICK ? .4 : -.4], bob: t > 70.9 ? -bob(t) * 4 : 0 });
    s.restore();
    // the two watchers on the far side
    const u = inv(FLICK, LAND, t);
    const SSC2 = 96, x0 = 578, x1 = 1570;
    const px = lerp(x0, x1, u), feet = lerp(CL, CR, u) - Math.sin(u * Math.PI) * 440;
    for (const [x, sd, sit] of [[1760, 21, 0], [1900, 22, .7]]) sheep(t, x, CR + 2, 90, { dir: -1, seed: sd, sit, lids: .6, look: [clamp((px - x) / 500, -1, 1), clamp((feet - 600) / 300, -1, 1)], bob: -bob(t + sd * .1) * 3 });
    // the sleeper
    if (t < FLICK) {
      const gv = groove(mixPose(POSE.stand, POSE.lean, .3), 'idle', t);
      gv.pose.head += .35 + .2 * smooth(inv(69.4, 69.9, t)); gv.pose.lean += .12;
      dreamer(gv.pose, x0 + gv.dx, CL - .89 * SSC2 + gv.dy, SSC2);
    } else if (t < LAND) {
      const tuck = smooth(inv(FLICK, FLICK + .15, t)) * (1 - smooth(inv(LAND - .2, LAND, t)));
      const pose = mixPose(mixPose(POSE.stand, CROUCH, smooth(inv(LAND - .2, LAND, t))), TUCK, tuck);
      const rot = 3 * TAU * ease.sine(u);
      dreamer(pose, px, feet - .89 * SSC2, SSC2, rot, 'rgb(190,200,245)', [Math.sin(rot) * .04, -.05]);
      const gl = Math.pow(Math.abs(Math.cos(rot)), 24) * Math.sin(u * Math.PI);
      glow(px, feet - .7 * SSC2, 110, `rgba(255,245,215,${.5 * gl})`); dot(f, px, feet - .7 * SSC2, 6 * gl, `rgba(255,255,240,${gl})`);
    } else {
      const k = ease.back(inv(LAND, LAND + .28, t));
      const gv = groove(mixPose(CROUCH, POSE.stand, k), 'idle', t, k);
      gv.pose.head -= .3 * smooth(inv(LAND + .1, LAND + .3, t));
      dreamer(gv.pose, x1 + gv.dx, CR - .89 * SSC2 * lerp(.8, 1, k) + gv.dy, SSC2);
      puffs(t, LAND, x1, CR + 4, 120, 16, 3, '#6a6ea8', .8);
    }
  }

  // ---------- 2 · the climb, wide (71.70 - 73.63) a rope of knotted wool up a steep hill ----------
  function climbPose(t, t0) {
    const nb = (t - t0) / BEAT, n = Math.floor(nb), fr = smooth(clamp((nb - n) * 1.7));
    const p = n + fr, odd = n % 2 === 0;
    return { p, pose: odd ? mixPose(CLIMB_A, CLIMB_B, fr) : mixPose(CLIMB_B, CLIMB_A, fr) };
  }
  function rope(x0, y0, y1, w, knot, gap, t, swayAmt) {
    const xs = (y) => x0 + Math.sin(t * 1.4 + y * .004) * swayAmt * (y - y0) / 1000;
    const pts = []; for (let y = y0; y <= y1; y += 40) pts.push([xs(y), y]);
    stroke(s, pts.map(([x, y]) => [x + w * .25, y]), '#8f8676', w * 1.1);
    stroke(s, pts, '#e4dac4', w);
    for (let y = y0 + gap * .5; y < y1; y += gap) { dot(s, xs(y) + knot * .2, y + knot * .2, knot, '#9d9585'); dot(s, xs(y), y, knot * .85, '#efe7d4'); }
    return xs;
  }
  function climbWide(t, lt, dur) {
    cam(kf(lt, [[0, 930], [dur, 985]]), kf(lt, [[0, 820], [dur, 560]]), kf(lt, [[0, 1.42], [dur, 1.52]]), kf(lt, [[0, -.025], [dur, .015]]));
    s.fillStyle = vgrad(s, -300, 1000, [[0, '#040720'], [.6, '#101d55'], [1, '#2a3272']]); s.fillRect(-300, -600, W + 600, 1900);
    stars(t, 41, 150, 800, .9); moon(420, 260, 64);
    clouds(t, 17, 150, 520, 'rgba(46,58,120,.45)', 5, 16);
    ridge(s, 930, 60, .002, 14, '#161d4c', -300, W + 300, 1500);
    const edge = (y, side) => (side < 0 ? lerp(330, 900, inv(1400, 40, y)) : lerp(1600, 1060, inv(1400, 40, y))) + (noise1(y * .012, side + 5) - .5) * 70;
    const L = [], R = []; for (let y = 1400; y >= 40; y -= 30) { L.push([edge(y, -1), y]); R.unshift([edge(y, 1), y]); }
    poly(s, [...L, [980, 10], ...R], '#18112f');
    poly(s, [...L, [980, 10], ...L.slice().reverse().map(([x, y]) => [x + 34, y + 10])], '#3f3880');
    for (const [x, y, w] of [[690, 725, 150], [1235, 610, 150], [830, 430, 130], [1100, 300, 120], [720, 965, 170]]) {
      s.fillStyle = '#16112f'; s.beginPath(); s.ellipse(x, y + 16, w * .55, 18, 0, 0, TAU); s.fill();
      s.fillStyle = '#4a4288'; s.beginPath(); s.ellipse(x, y, w * .55, 14, 0, 0, TAU); s.fill();
    }
    const xs = rope(960, 50, 1400, 13, 13, 95, t, 10);
    // deadpan spectators on the ledges
    [[690, 725, 1, 31], [1235, 610, -1, 32], [830, 430, 1, 33], [1100, 300, -1, 34], [720, 965, 1, 35]].forEach(([x, y, d, sd], i) =>
      sheep(t, x - d * 10, y + 2, 50, { dir: d, seed: sd, sit: .85, lids: .55 + .1 * hash(i), bob: -bob(t + i * .13) * 3 }));
    const { p, pose } = climbPose(t, 71.47);
    const hy = 905 - p * 58, sc = 82;
    dreamer(pose, xs(hy) - 4, hy, sc);
    glow(420, 260, 300, 'rgba(180,190,255,.08)');
  }

  // ---------- 3 · the climb, close (73.63 - 75.92) hand over hand, up to the ridge ----------
  function climbClose(t, lt, dur) {
    const { p, pose } = climbPose(t, 73.63);
    const hy = 730 - p * 140, sc = 215;
    cam(kf(lt, [[0, 880], [dur, 960]]), hy + 40 - 60 * smooth(inv(dur - .7, dur, lt)), kf(lt, [[0, 1.34], [dur, 1.22]]), kf(lt, [[0, .02], [dur, -.015]]));
    // sky above the ridge, the moon waiting behind it
    s.fillStyle = vgrad(s, -600, 40, [[0, '#050a26'], [1, '#1f2a6a']]); s.fillRect(-300, -800, W + 600, 900);
    stars(t, 43, 60, 0, 0);
    fullMoon(1240, -150, 150);
    // the rock face
    s.fillStyle = vgrad(s, 0, 1300, [[0, '#2f2660'], [1, '#150f30']]);
    s.beginPath(); s.moveTo(-300, 1500); for (let x = -300; x <= W + 300; x += 30) s.lineTo(x, 10 + (noise1(x * .006, 3) - .5) * 60); s.lineTo(W + 300, 1500); s.closePath(); s.fill();
    for (let i = 0; i < 9; i++) { const r = rng(90 + i); const x = r() * 1800 + 60, y = 150 + r() * 1100; stroke(s, [[x, y], [x + 40 - r() * 80, y + 90], [x + 60 - r() * 120, y + 190]], '#1a1438', 10); }
    stroke(s, Array.from({ length: 70 }, (_, i) => { const x = -300 + i * 36; return [x, 14 + (noise1(x * .006, 3) - .5) * 60]; }), '#5a54a0', 12);
    // a sheep has been waiting at the top
    const peek = smooth(inv(75.2, 75.7, t));
    s.save(); s.beginPath(); s.rect(-300, -900, W + 600, 900 + 4); s.clip();
    sheep(t, 1060, 60 - peek * 100, 80, { dir: -1, seed: 44, lids: .6, look: [-.4, .6] });
    s.restore();
    const xs = rope(900, -10, 1500, 34, 36, 170, t, 14);
    // the foreground spectator on its ledge
    s.fillStyle = '#120d2a'; s.beginPath(); s.ellipse(1400, 700, 230, 44, 0, 0, TAU); s.fill();
    s.fillStyle = '#3c3572'; s.beginPath(); s.ellipse(1400, 676, 230, 32, 0, 0, TAU); s.fill();
    sheep(t, 1420, 680, 165, { dir: -1, seed: 45, sit: .9, lids: .6, look: [-.2, 0], bob: -bob(t) * 5 });
    dreamer(pose, xs(hy) - 10, hy, sc);
    glow(1240, -150, 500, 'rgba(255,235,200,.08)');
  }

  // ---------- 4 · the tall one (75.92 - 78.06) rises over the ridge against the moon ----------
  const RSC = 120, MOON = [1000, 215, 185];
  function ridgeWorld(t) {
    sky('#050818', '#0d1846', '#27357a', RIDGE); stars(t, 61, 130, 700, .8);
    clouds(t, 19, 330, 520, 'rgba(40,52,110,.45)', 4, 10);
    fullMoon(MOON[0], MOON[1], MOON[2]);
  }
  function ridgeFront(g, c) { ridge(g, 872, 24, .003, 21, c, -300, W + 300, 1500); }
  function ramPose(t) {
    const rise = ease.back(inv(75.85, 76.55, t)), neck = lerp(1.0, 3.0, ease.back(inv(76.36, 77.0, t)));
    const droop = ease.back(inv(77.52, 77.95, t)), sag = smooth(inv(77.5, 77.9, t));
    return { rise, neck, droop, sag, nod: .15 * sway(t) * smooth(inv(77.0, 77.4, t)) };
  }
  function drawRam(t, gy, o) {
    const R = ram(t, RAM_X, gy, RSC, { ax: 1.4, ...o });
    occlude(() => ram(t, RAM_X, gy, RSC, { ax: 1.4, ...o, g: f, black: true }));
    return R;
  }
  function tallRam(t, lt, dur) {
    cam(kf(lt, [[0, 960], [dur, 985]]), kf(lt, [[0, 720], [.4, 570], [.85, 455], [dur, 480]]), kf(lt, [[0, 1.0], [dur, 1.1]]), kf(lt, [[0, .015], [dur, -.01]]));
    ridgeWorld(t);
    const P = ramPose(t), gy = RIDGE + (1 - P.rise) * 760;
    drawRam(t, gy, { neck: P.neck, droop: P.droop, sag: P.sag, nod: P.nod, look: [0, lerp(-.2, .7, P.droop)], lids: .62 });
    ridgeFront(s, '#070917'); occlude(() => ridgeFront(f, '#000'));
    // the sleeper, small at the ridge, looking up
    const gv = groove({ ...POSE.stand, head: -.45 }, 'idle', t);
    dreamer(gv.pose, 1360 + gv.dx, 864 - .89 * 52 + gv.dy, 52);
  }

  // ---------- 5 · the mallet (78.06 - 79.39) cartoon slapstick: flattened ----------
  const MHL = 150, MHW = 130, MHIT = [MOON[0] - 2, 707], ML = 1050, MP = [MHIT[0] + ML, MHIT[1] - MHL];
  function malletPhi(t) {
    if (t < 78.42) return lerp(1.3, .5, ease.out(inv(78.06, 78.42, t)));
    if (t < 78.56) return lerp(.5, .72, ease.out(inv(78.42, 78.56, t)));
    if (t < IMP) return lerp(.72, 0, ease.in(inv(78.56, IMP, t)));
    if (t < IMP + .22) return .1 * Math.sin(inv(IMP, IMP + .22, t) * Math.PI);
    if (t < 79.5) return 0;
    return lerp(0, 1.3, ease.in(inv(79.5, 80.05, t)));
  }
  function flatAt(t) {
    if (t < IMP - .03) return 0;
    const k = t - IMP;
    return k < 0 ? .88 * ((k + .03) / .03) : .88 + .06 * Math.sin(k * 38) * Math.exp(-7 * k) + .04 * hit(t, 80.11, 9);
  }
  function dizzyStars(t, head) {
    const on = smooth(inv(IMP + .1, IMP + .4, t));
    if (on <= 0) return;
    for (let i = 0; i < 5; i++) {
      const a = t * 5.2 + i * TAU / 5, x = head[0] + Math.cos(a) * 150, y = head[1] - 70 + Math.sin(a) * 36, r = 30 * on * (.8 + .25 * Math.sin(a));
      starShape(s, x, y, r * 1.25, t * 3 + i, '#3a2a10');
      starShape(s, x, y, r, t * 3 + i, '#f5cf5c');
      glow(x, y, 60 * on, 'rgba(255,215,120,.45)');
    }
  }
  function malletShot(t, lt, dur) {
    const [sx, sy] = shake(t, 26 * hit(t, IMP, 7));
    cam(975 + sx, 540 + sy + 20 * hit(t, IMP, 5), kf(lt, [[0, 1.06], [.6, 1.1], [dur, 1.14]]) + .04 * hit(t, IMP, 6));
    const phi = malletPhi(t), fl = flatAt(t);
    if (t > IMP - .12 && t < IMP) whip(-20, 70 * inv(IMP - .12, IMP, t));
    ridgeWorld(t);
    const R = drawRam(t, RIDGE, { neck: 3, droop: 1, sag: 1, flat: fl, nod: .15 * sway(t) * (1 - fl), look: [.3, t < IMP ? -1 : 0], lids: t < IMP ? .5 : .66 });
    mallet(s, MP, ML, phi, MHL, MHW);
    occlude(() => mallet(f, MP, ML, phi, MHL, MHW, true));
    ridgeFront(s, '#070917'); occlude(() => ridgeFront(f, '#000'));
    puffs(t, IMP, MHIT[0] - 120, RIDGE, 460, 22, 5);
    if (t >= IMP) dizzyStars(t, R.head);
    flash(.1 * hit(t, IMP, 14), '#fff0d0');
  }

  // ---------- 6 · seeing stars (79.39 - 80.76) the pancake, deadpan ----------
  function dizzy(t, lt, dur) {
    const fl = flatAt(t), phi = malletPhi(t);
    cam(kf(lt, [[0, 960], [dur, 1000]]), kf(lt, [[0, 720], [dur, 735]]), kf(lt, [[0, 1.9], [dur, 2.3]]) + .05 * hit(t, 80.11, 8), kf(lt, [[0, -.03], [dur, .03]]));
    ridgeWorld(t);
    const roll = [Math.cos(t * 7), Math.sin(t * 7)];
    const R = drawRam(t, RIDGE, { neck: 3, droop: 1, sag: 1, flat: fl, look: roll, lids: .45 });
    mallet(s, MP, ML, phi, MHL, MHW); occlude(() => mallet(f, MP, ML, phi, MHL, MHW, true));
    ridgeFront(s, '#070917'); occlude(() => ridgeFront(f, '#000'));
    puffs(t, IMP, MHIT[0] - 120, RIDGE, 460, 22, 5);
    dizzyStars(t, R.head);
  }

  // ---------- 7 · the magician (80.76 - 83.42) sheep after sheep out of the hat ----------
  const RIM = 520, HAT_X = 1070, SPOTS = [[1290, 846], [1425, 858], [1560, 846], [1695, 858]];
  function hatBack() {
    s.fillStyle = '#17131f'; s.fillRect(HAT_X - 80, RIM, 160, 132);
    s.fillStyle = '#7a1a2a'; s.fillRect(HAT_X - 80, RIM + 8, 160, 22);
    s.fillStyle = '#231c2c'; s.beginPath(); s.ellipse(HAT_X, RIM, 128, 26, 0, 0, TAU); s.fill();
    s.strokeStyle = '#6d5c86'; s.lineWidth = 6; s.beginPath(); s.ellipse(HAT_X, RIM, 128, 26, 0, 0, TAU); s.stroke();
    s.fillStyle = '#060409'; s.beginPath(); s.ellipse(HAT_X, RIM, 80, 15, 0, 0, TAU); s.fill();
  }
  function magician(t, lt, dur) {
    cam(kf(lt, [[0, 870], [dur, 1090]]), kf(lt, [[0, 610], [dur, 640]]), kf(lt, [[0, 1.3], [dur, 1.38]]) + .02 * beatPulse(t, 8), kf(lt, [[0, .02], [dur, -.01]]));
    // velvet curtain, stage boards
    fill(s, '#2a0b1c');
    for (let i = -3; i < 26; i++) { const x = i * 96 + Math.sin(t * .8 + i) * 4; s.fillStyle = i % 2 ? '#3f1229' : '#1e0714'; s.fillRect(x, -100, 52, 1000); }
    s.fillStyle = vgrad(s, -100, 900, [[0, 'rgba(10,2,8,.8)'], [.5, 'rgba(10,2,8,0)'], [1, 'rgba(10,2,8,.3)']]); s.fillRect(-300, -100, W + 600, 1000);
    for (let i = -3; i < 22; i++) { s.fillStyle = '#521730'; s.beginPath(); s.ellipse(i * 110, 40, 70, 60, 0, 0, Math.PI); s.fill(); }
    s.fillStyle = '#3c2418'; s.fillRect(-300, 850, W + 600, 400);
    for (let i = 0; i < 6; i++) stroke(s, [[-300, 880 + i * 40], [W + 300, 880 + i * 40]], '#2a180f', 4);
    s.fillStyle = '#6e4630'; s.beginPath(); s.ellipse(1000, 890, 700, 90, 0, 0, TAU); s.fill();
    glow(1000, 560, 760, 'rgba(255,190,120,.22)');
    // the table and the upturned top hat
    s.fillStyle = '#5c1626'; poly(s, [[HAT_X - 150, 652], [HAT_X + 150, 652], [HAT_X + 185, 850], [HAT_X - 185, 850]], '#5c1626');
    for (let i = -3; i <= 3; i++) stroke(s, [[HAT_X + i * 40, 660], [HAT_X + i * 52, 848]], '#431020', 8);
    s.fillStyle = '#7a2033'; s.beginPath(); s.ellipse(HAT_X, 652, 150, 24, 0, 0, TAU); s.fill();
    hatBack();
    // the sheep that come out of it
    for (let k = 0; k < POPS.length; k++) {
      const p = POPS[k], a = t - p;
      if (a < -.02) continue;
      const rise = ease.back(inv(0, .2, a)), hop = inv(.26, .6, a);
      let x = HAT_X, gy = lerp(RIM + 110, RIM + 6, rise), air = null;
      if (hop > 0) { x = lerp(HAT_X, SPOTS[k][0], hop); gy = lerp(RIM + 6, SPOTS[k][1], hop) - Math.sin(hop * Math.PI) * 170; air = hop < 1 ? hop : null; }
      const o = { seed: 60 + k, lids: .58, air, dir: hop > 0 && hop < 1 ? 1 : -1, bob: hop >= 1 ? -bob(t + k * .1) * 4 : 0 };
      if (hop <= 0) { s.save(); s.beginPath(); s.rect(-300, -300, W + 600, RIM + 300); s.clip(); sheep(t, x, gy, 58, o); s.restore(); }
      else sheep(t, x, gy, 58, o);
      glow(HAT_X, RIM - 30, 150, `rgba(255,230,170,${.22 * hit(t, p, 9)})`);
    }
    // front of the brim over the emerging sheep
    s.save(); s.beginPath(); s.rect(-300, RIM, W + 600, 60); s.clip();
    s.fillStyle = '#231c2c'; s.beginPath(); s.ellipse(HAT_X, RIM, 128, 26, 0, 0, TAU); s.fill(); s.restore();
    // the magician: top hat, wand held in the mouth, taps on every beat
    const MX = 640, MSC = 118;
    const MH = sheep(t, MX, 842, MSC, { seed: 70, lids: .62, look: [.5, .1], bob: -bob(t) * 5 });
    s.save(); s.translate(MH.head[0], MH.head[1]); s.rotate(.12);
    s.fillStyle = '#15121c'; s.fillRect(-.23 * MSC, -.95 * MSC, .46 * MSC, .6 * MSC);
    s.fillStyle = '#8a1e2a'; s.fillRect(-.23 * MSC, -.47 * MSC, .46 * MSC, .1 * MSC);
    s.fillStyle = '#221c2c'; s.beginPath(); s.ellipse(0, -.36 * MSC, .38 * MSC, .075 * MSC, 0, 0, TAU); s.fill();
    stroke(s, [[-.23 * MSC, -.95 * MSC], [.23 * MSC, -.95 * MSC]], '#6d5c86', 7); stroke(s, [[.2 * MSC, -.93 * MSC], [.2 * MSC, -.5 * MSC]], '#4d4062', 6);
    stroke(s, [[-.36 * MSC, -.34 * MSC], [.36 * MSC, -.34 * MSC]], '#6d5c86', 5);
    s.restore();
    glow(MH.head[0], MH.head[1] - .6 * MSC, 180, 'rgba(255,200,140,.18)');
    let lift = 0; for (const p of POPS) lift += smooth(inv(p - .3, p - .07, t)) * (1 - smooth(inv(p - .07, p, t)));
    const m = [MH.head[0] + .04 * MSC, MH.head[1] + .24 * MSC], ang = -.42 - .45 * lift, WL = 250;
    const tip = [m[0] + Math.cos(ang) * WL, m[1] + Math.sin(ang) * WL];
    stroke(s, [m, tip], '#0c0a10', 12);
    stroke(s, [[lerp(m[0], tip[0], .82), lerp(m[1], tip[1], .82)], tip], '#f1ece0', 13);
    for (const p of POPS) { const h = hit(t, p, 6); if (h > .02) { glow(tip[0], tip[1], 120 * h + 20, `rgba(255,240,200,${.8 * h})`); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .4; stroke(f, [tip, [tip[0] + Math.cos(a) * 70 * h, tip[1] + Math.sin(a) * 70 * h]], `rgba(255,235,190,${h})`, 4); } } }
    // footlights
    for (let i = 0; i < 12; i++) glow(i * 170 + 40, 1010, 90, 'rgba(255,190,110,.35)');
  }

  // ---------- 8 · backwards (83.42 - 85.18) a line of sheep reverses to the party doors ----------
  const DX = 1500, DTOP = 470, DBOT = 862;
  function backwards(t, lt, dur) {
    const cx = kf(lt, [[0, 1080], [dur, 1500]]), cy = kf(lt, [[0, 730], [dur, 650]]), z = kf(lt, [[0, 1.26], [dur, 1.6]], ease.inOut);
    cam(cx, cy, z, kf(lt, [[0, -.02], [dur, 0]]));
    const open = ease.in(inv(84.7, 85.18, t));
    // night street
    s.fillStyle = vgrad(s, -100, 900, [[0, '#070b24'], [1, '#232a66']]); s.fillRect(-300, -300, W + 900, 1300);
    stars(t, 71, 80, 400, .8); moon(420, 190, 50);
    // the hall
    s.fillStyle = '#2a2040'; s.fillRect(1020, 110, 1500, 760);
    s.fillStyle = '#3a2d55'; s.fillRect(1000, 90, 1540, 50);
    for (let r = 0; r < 14; r++) for (let c = 0; c < 22; c++) if (hash(r * 40 + c) > .6) { s.fillStyle = '#241b38'; s.fillRect(1030 + c * 70 + (r % 2) * 35, 150 + r * 52, 60, 20); }
    // windows either side: warm, with round wool silhouettes bobbing to the beat
    for (const wx of [1175, 1825]) {
      s.fillStyle = '#e7a35c'; s.fillRect(wx - 90, 520, 180, 230);
      for (let i = 0; i < 3; i++) dot(s, wx - 55 + i * 55, 710 - bob(t + i * .2) * 14, 38, '#7a3e2c');
      s.strokeStyle = '#1a1426'; s.lineWidth = 14; s.strokeRect(wx - 90, 520, 180, 230);
      glow(wx, 630, 260, 'rgba(255,170,90,.3)');
    }
    // the doors: light leaking round the frame, a warm fan window above
    s.fillStyle = '#f0b86a'; s.beginPath(); s.arc(DX, DTOP, 160, Math.PI, 0); s.fill();
    for (let i = 1; i < 6; i++) { const a = Math.PI + i * Math.PI / 6; stroke(s, [[DX, DTOP], [DX + Math.cos(a) * 160, DTOP + Math.sin(a) * 160]], '#1a1426', 9); }
    glow(DX, DTOP - 60, 300, 'rgba(255,180,100,.35)');
    const gap = 8 + 150 * open;
    s.fillStyle = '#ffd99c'; s.fillRect(DX - gap, DTOP, gap * 2, DBOT - DTOP);
    for (const d of [-1, 1]) {
      const x0 = d < 0 ? DX - gap - 160 * (1 - .35 * open) : DX + gap, w = 160 * (1 - .35 * open);
      s.fillStyle = '#4d2230'; s.fillRect(x0, DTOP, w, DBOT - DTOP);
      s.fillStyle = '#3a1823'; s.fillRect(x0 + w * .18, DTOP + 40, w * .64, 140); s.fillRect(x0 + w * .18, DTOP + 220, w * .64, 140);
      dot(s, d < 0 ? x0 + w - 22 : x0 + 22, 680, 11, '#d9a24a'); dot(f, d < 0 ? x0 + w - 24 : x0 + 20, 677, 4, 'rgba(255,230,160,.8)');
    }
    s.strokeStyle = '#1a1426'; s.lineWidth = 26; s.strokeRect(DX - 186, DTOP, 372, DBOT - DTOP + 10);
    for (const d of [-1, 1]) stroke(f, [[DX + d * gap, DTOP + 6], [DX + d * gap, DBOT - 6]], 'rgba(255,210,150,.7)', 6);
    s.save(); s.globalAlpha = .5 * open; for (let i = 0; i < 3; i++) dot(s, DX - 60 + i * 60, 700 - bob(t + i * .2) * 16, 42, '#8a4a30'); s.restore();
    stroke(f, [[DX - 170, DBOT + 4], [DX + 170, DBOT + 4]], 'rgba(255,190,120,.6)', 6);
    glow(DX, 680, 220 + 260 * open, `rgba(255,200,130,${.16 + .2 * open})`);
    // string lights, twinkling on the beat
    for (let sw = 0; sw < 3; sw++) {
      const x0 = 1060 + sw * 320, x1 = x0 + 320;
      for (let i = 0; i <= 8; i++) {
        const u = i / 8, x = lerp(x0, x1, u), y = 300 + Math.sin(u * Math.PI) * 60;
        const cols = ['255,205,110', '255,120,140', '140,210,255', '255,235,170'], c = cols[(i + sw) % 4];
        const tw = .55 + .45 * beatPulse(t + ((i + sw) % 2) * BEAT, 5);
        dot(s, x, y, 9, `rgb(${c})`); glow(x, y, 40, `rgba(${c},${.6 * tw})`);
      }
      stroke(s, Array.from({ length: 17 }, (_, i) => [lerp(x0, x1, i / 16), 292 + Math.sin(i / 16 * Math.PI) * 60]), '#120e1e', 3);
    }
    // pavement and the light spilling onto it
    s.fillStyle = '#1c1a31'; s.fillRect(-300, 870, W + 900, 400);
    stroke(s, [[-300, 874], [W + 600, 874]], '#35305a', 8);
    s.save(); s.globalAlpha = .35 + .4 * open; poly(s, [[DX - 180, 876], [DX + 180, 876], [DX + 320, 1100], [DX - 320, 1100]], '#8a5a3c'); s.restore();
    // the procession: facing left, stepping right
    for (let k = 7; k >= 0; k--) {
      const x = 700 + 430 * (t - 83.42) - k * 250;
      if (x < 100 || x > 2300) continue;
      sheep(t, x, 1004 + (k % 2) * 8, 104, { dir: -1, seed: 80 + k, lids: .55 + .1 * hash(k + 9), look: [-.2, 0], bob: -Math.abs(Math.sin((t - 83.42) * 8.7 + k)) * 9 });
    }
    // one passes right by the lens at the start
    const u = inv(83.42, 84.2, t);
    if (u > 0 && u < 1) { const x = lerp(430, 1900, u); sheep(t, x, 1400, 330, { dir: -1, seed: 90, lids: .6, bob: -Math.abs(Math.sin(t * 8.7)) * 18 }); }
    flash(.1 * open, '#ffd8a0');
  }

  chapter('climb', 69.18, 85.18, [
    [69.18, flick],
    [71.70, climbWide],
    [73.63, climbClose],
    [75.92, tallRam],
    [78.06, malletShot],
    [79.39, dizzy],
    [80.76, magician, { paint: { boil: 9, bloom: 1.3 } }],
    [83.42, backwards, { paint: { boil: 8, bloom: 1.4 } }],
  ], { paint: { boil: 8, bloom: 1.2 } });
})();
