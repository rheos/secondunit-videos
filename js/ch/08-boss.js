// 206.0 - 245.0  the boss, as 1970s cut-out animation. Three places, each moving forward:
//   A (206.0-218.3) the street outside the Board of Punctuality, a building with a face: its doorway is a
//     hinged jaw that swallows a queue of identical clerks; alarm-clock heads spring from the chimneys on
//     the "do"s; he runs against the crowd, leaps into the mouth and is swallowed on "boss".
//   B (218.3-229.94) inside: a cog-and-piston time recorder stamps his card on the "do"s, LATE on the last;
//     the boss rises like a moon over the chequered floor, lid up, gramophone horn out, and the yell comes
//     out of his mouth as Victorian display type.
//   C (229.94-245.0) a hill outside: alarm clocks rain on the "do"s; "but I don't care": he tears the card
//     twice, the pieces become birds, and he turns and walks the other way past the queue.
// Everything moves on pivots, stepped at 10 fps (GK.AF) with a little jitter; gags are instant.
(() => {
  const { put, at, sky, backdrop, stampPlate, putStamp, setStep, AF } = GK; const P = GP, MO = P.MOUTH;
  const VO = FEAT.vonsets;
  const snap = (x, w = .15) => { let best = x, d = w; for (const v of VO) { const e = Math.abs(v - x); if (e < d) { d = e; best = v; } } return best; };
  const DO1 = [206.26, 207.58, 208.08, 208.76, 209.32, 209.98, 211.3, 212.22, 212.66].map((x) => snap(x));
  const DO2 = [218.3, 219.02, 219.46, 220.08, 220.5, 220.8, 221.74, 221.96, 222.84, 223.54, 223.98].map((x) => snap(x));
  const DO3 = [229.94, 230.74, 231.26, 231.96, 232.42, 233.12, 233.5, 234.18, 234.72, 235.36].map((x) => snap(x));
  const BEATS = FEAT.beats.filter((b) => b > 200 && b < 250);
  const q = (t, af = AF) => Math.floor(t * af + 1e-6) / af;                     // the piece clock (on 2s/3s)
  const ev = (t, d, af = AF) => t < d ? -1 : Math.floor((t - d) * af + 1e-6);    // steps since an event
  const lastOf = (t, list) => { let l = -1e9; for (const d of list) if (d <= t) l = d; return l; };
  const countOf = (t, list) => list.filter((d) => d <= t).length;
  const seq = (k, vals) => k < 0 ? vals[0] : vals[Math.min(k, vals.length - 1)];  // a stepped keyframe list

  // ---- backdrops: soft airbrush behind sharp engraved cut-outs ----
  const skyA = sky('dusk', [[0, '#2a6672'], [.42, '#78a5a2'], [.72, '#d8b894'], [1, '#eea27c']],
    [[380, 220, 760, 150, 'rgba(255,238,218,A)', .6], [1480, 150, 560, 110, 'rgba(255,230,206,A)', .5], [1000, 440, 700, 80, 'rgba(255,214,182,A)', .45]], { seed: 5 });
  const skyB = sky('night', [[0, '#12223a'], [.45, '#2c4864'], [.72, '#7b6470'], [1, '#c98c66']],
    [[300, 300, 700, 90, 'rgba(160,170,200,A)', .22], [1600, 200, 500, 70, 'rgba(160,170,200,A)', .18]], { seed: 8, glow: [1240, 560, 620, 'rgba(255,224,170,.5)'] });
  const skyC = sky('morning', [[0, '#3a7f9c'], [.45, '#93c0c4'], [.8, '#f0d8a6'], [1, '#f6c48e']],
    [[500, 200, 820, 160, 'rgba(255,255,250,A)', .7], [1560, 300, 600, 120, 'rgba(255,250,240,A)', .6], [1100, 90, 500, 70, 'rgba(255,255,250,A)', .5]], { seed: 13 });
  const LATE = stampPlate('LATE', 'rgba(176,44,36,.95)', { w: 300, h: 140, size: 120 });

  // ---- the figure rig: one hip pivot; legs, arms, head and hat swing on their own pins ----
  function fig(x, y, sc, o = {}) {
    const N = o.clerk ? 'clerk' : 'man', f = o.face ?? 1, k = o.k || 0, sw = o.swing || 0;
    at(x, y, o.rot || 0, sc * f, sc, () => at(0, -196 - (o.bob || 0), 0, 1, 1, () => {
      put(P[N + 'Arm'], 2, -122, o.backArm ?? sw * .8, 1, 1, { k: k * 8 + 1 });
      put(P[N + 'Leg'], -5, 0, -sw, 1, 1, { k: k * 8 + 2 });
      put(P[N + 'Leg'], 6, 0, sw, 1, 1, { k: k * 8 + 3 });
      put(P[N + 'Coat'], 0, 0, 0, 1, 1, { k: k * 8 + 4 });
      at(0, -136, o.head || 0, 1, 1, () => { put(P[N + 'Head'], 0, 0, 0, 1, 1, { k: k * 8 + 5 }); put(P[N + 'Hat'], 10, -90 - (o.hat || 0), o.hatRot || 0, 1, 1, { k: k * 8 + 6 }); });
      const arm = o.arm ?? -sw * .8;
      at(5, -122, arm, 1, 1, () => {
        put(P[N + 'Arm'], 0, 0, 0, 1, 1, { k: k * 8 + 7 });
        if (o.case) put(P.case, 0, 168, -arm + (o.caseRot || 0), .78);
        if (o.card) put(o.card, 0, 196, -arm + (o.cardRot || 0), o.cardSc || 1);
      });
    }));
  }
  const walk = (t, rate, amp, ph = 0) => { const a = q(t) * rate * TAU + ph; return { swing: Math.sin(a) * amp, bob: Math.abs(Math.cos(a)) * amp * 14 }; };

  // ---- the Board of Punctuality, with its face working. B: { x, y, s } maps design -> world ----
  const bw = (B, xd, yd) => [B.x + xd * B.s, B.y + yd * B.s];
  const CHIM = [218, 358, 888, 1028];
  function chimneyPops(B, t, dos) {
    dos.forEach((d, i) => {
      const k = ev(t, d); if (k < 0 || t - d > 1.5) return;                         // up for 1.5 s, then gone at once
      const ext = seq(k, [1.3, .92, 1.06, 1]) * 120, cx = CHIM[i % 4];
      const [sx, sy] = bw(B, cx + 28, 176);
      put(P.spring, sx, sy, 0, B.s * .5, B.s * ext / 120, { k: i, shadow: .5 });
      put(P['alarm' + (i % 4)], sx, sy - ext * B.s, (i % 2 ? .08 : -.08) * (k % 2 ? 1 : -1), B.s * .45, B.s * .45, { k: i });
    });
  }
  function face(B, t, o = {}) {
    // pediment clock: hands jump with the beat; pupils look where they're told
    const n = countOf(t, BEATS), [cx, cy] = bw(B, 600, 240);
    put(P.hand, cx, cy, n * .52, B.s * .55, B.s * .55, { shadow: .3 }); put(P.hand, cx, cy, 2.6 + n * .05, B.s * .42, B.s * .3, { shadow: .3, k: 1 });
    const [lx, ly] = o.look || [0, 0];
    for (const ex of [565, 635]) { const [px, py] = bw(B, ex + lx * 8, 600 + ly * 8); put(P.pupil, px, py, 0, B.s * .55, B.s * .55, { shadow: .4, k: ex }); }
  }
  function jawTop(t, chomps, shut = 1e9) { if (t >= shut) return 772; for (const c of chomps) if (t >= c && t < c + .2) return 772; return MO.floor; }
  // a queue that walks right along the street into the mouth; anyone inside at a chomp is eaten.
  // returns [street men, mouth men] in design coords
  function queue(t, T0, x0, n, v, gap, chomps, stop = 1e9) {
    const street = [], mouth = [], tt = Math.min(t, stop);
    for (let i = 0; i < n; i++) {
      const xd = x0 + v * (q(tt) - T0) - i * gap;
      if (xd < MO.cx) { street.push({ i, xd }); continue; }
      const tin = T0 + (MO.cx - x0 + i * gap) / v;
      const eaten = chomps.some((c) => c >= tin && c <= t);
      if (!eaten) mouth.push({ i, xd: Math.min(xd, MO.x1 + 40) });
    }
    return [street, mouth];
  }
  function building(B, t, o) {
    const jt = o.jawTop ?? MO.floor, big = o.big;
    if (o.dos) chimneyPops(B, t, o.dos);
    put(big ? P.ministryBig : P.ministry, B.x, B.y, 0, big ? B.s / 2.3 : B.s / 1, undefined, { jit: .6 });
    face(B, t, o);
    // inside the mouth: clip to the arch and the floor
    s.save(); s.beginPath();
    const [ax, ay] = bw(B, MO.x0, MO.cy), [cx, cy] = bw(B, MO.cx, MO.cy);
    s.moveTo(ax, bw(B, 0, 940)[1]); s.lineTo(ax, ay); s.arc(cx, cy, MO.r * B.s, Math.PI, 0); s.lineTo(bw(B, MO.x1, 0)[0], bw(B, 0, 940)[1]); s.closePath(); s.clip();
    if (o.inside) o.inside(jt);
    s.restore();
    const [jx, jy] = bw(B, MO.cx, jt);
    put(big ? P.jawBig : P.jaw, jx, jy, jt < MO.floor ? .03 : 0, big ? B.s / 2.3 : B.s, undefined, { jit: .6 });
  }

  // ================= A: the street =================
  function A1_establish(t) {
    backdrop(skyA);
    const B = { x: 550, y: 960 - 905, s: 1 };
    const chomps = BEATS.filter((b, i) => i % 2 === 0 && b > 205);
    const [street, mouth] = queue(t, 206, 610, 18, 62, 78, chomps);
    const jt = jawTop(t, chomps);
    building(B, t, { dos: DO1, jawTop: jt, look: [Math.sin(q(t) * 1.3) * .6, .4],
      inside: (jt) => mouth.forEach(({ i, xd }) => { const [x, y] = bw(B, xd, jt + 2); fig(x, y, .3 * B.s, { clerk: 1, k: i, ...walk(t, 1.4, .35, i) }); }) });
    put(P.street, 0, 960, 0, 1, 1, { shadow: 0, jit: .3 });
    for (const { i, xd } of street) { const [x, y] = bw(B, xd, 912); if (x > -80) fig(x, y, .3 * B.s, { clerk: 1, k: i, ...walk(t, 1.4, .35, i), hat: ev(t, lastOf(t, DO1)) < 2 && t > DO1[0] ? 16 : 0 }); }
    // he comes running in from the left, late
    if (t > 208.3) { const x = -80 + (q(t) - 208.3) * 430; fig(x, 1050, .38, { ...walk(t, 2.4, .6), case: 1, caseRot: .3 }); }
    put(P.lamp, 150, 1075, 0, .62);
  }
  // against the crowd: clerks stream left, he pushes right; whoever he meets falls over flat at once
  function A2_crowd(t, lt) {
    backdrop(skyA, -60, -40, 1.06);
    const B = { x: 1180, y: 960 - 905 * 2.3, s: 2.3 };
    put(P.ministryBig, B.x, B.y, 0, 1, 1, { jit: .5 });
    put(P.street, -40, 960, 0, 1, 1, { shadow: 0, jit: .3 });
    put(P.lamp, 1080, 975, 0, .9);
    const mx = (tt) => 120 + (q(tt) - 209.9) * 300;                                    // his x
    const hop = (t > DO1[0] && ev(t, lastOf(t, DO1)) < 2) ? 26 : 0;
    const crowd = (row, sc, y, v, gap, off) => {
      const list = [];
      for (let i = 0; i < 8; i++) {
        const x0 = off + i * gap, x = x0 - v * (q(t) - 209.9);
        // when does he meet this clerk? mx(tc) = x(tc)  ->  120 + 300 u = x0 - v u
        const tc = 209.9 + (x0 - 120) / (300 + v), knocked = t >= tc && tc > 209.9;
        const k = ev(t, tc);
        list.push(() => fig(knocked ? x - 30 : x, y, sc, { clerk: 1, face: -1, k: row * 10 + i, ...(knocked ? { swing: .5 } : walk(t, 1.5, .32, i)),
          rot: knocked ? -seq(k, [.5, 1.1, 1.45, 1.52]) * .97 : 0, hat: knocked ? seq(k, [40, 90, 130, 150]) : hop, hatRot: knocked ? k * .5 : 0 }));
      }
      return list;
    };
    crowd(0, .5, 990, 140, 210, 200).forEach((f) => f());
    fig(mx(t), 1030, .58, { ...walk(t, 2.4, .62), case: 1, caseRot: .35, head: .08 });
    crowd(1, .74, 1100, 190, 330, 480).forEach((f) => f());
  }
  // the mouth: he catches up with the queue, leaps in on "time", and is swallowed on "boss"
  const LEAP = snap(214.88), GULP = snap(217.26);
  function A3_mouth(t, lt) {
    const zoom = t >= GULP + .3 ? 1.32 : 1;                                       // a sudden snap-in after the gulp
    s.save(); if (zoom > 1) { s.translate(1100, 600); s.scale(zoom, zoom); s.translate(-1100, -600); }
    backdrop(skyA, -200, -260, 1.3);
    const B = { x: 1100 - 600 * 2.3, y: 1000 - 905 * 2.3, s: 2.3 };
    const chomps = BEATS.filter((b, i) => i % 2 === 0 && b > 212.5 && b < 214.6).concat([GULP]);
    const [street, mouth] = queue(t, 212.8, 600, 6, 60, 78, chomps, 214.4);
    const jt = jawTop(t, chomps, GULP);
    // where he is: running in, the leap (two drawings), then inside on the tongue
    const runX = (tt) => -260 + (q(tt) - 212.8) * 330;
    const leapK = ev(t, LEAP), inside = leapK >= 2 && t < GULP;
    const look = t < LEAP ? [-.8, .7] : t < GULP ? [.0, .9] : [0, -.9];
    building(B, t, { big: 1, jawTop: jt, look,
      inside: (jt) => {
        mouth.forEach(({ i, xd }) => { const [x, y] = bw(B, xd, jt + 2); fig(x, y, .69, { clerk: 1, k: i, ...walk(t, 1.4, .35, i) }); });
        if (inside) { const [x, y] = bw(B, MO.cx - 18, jt + 2); fig(x, y, .66, { case: 1, caseRot: .2, head: seq(ev(t, LEAP + .4), [0, -.25, -.25, .2, .2, 0]), hat: ev(t, GULP - .5) >= 0 && ev(t, GULP - .5) < 2 ? 30 : 0 }); }
      } });
    put(P.street, -100, 1000, 0, 1.3, 1, { shadow: 0, jit: .3 });
    const qx = (i) => bw(B, 600 - 78 * (i + 1) + 60 * (q(Math.min(t, 214.4)) - 212.8), 0)[0];
    for (const { i, xd } of street) { const [x] = bw(B, xd, 0); fig(x, 1010, .69, { clerk: 1, k: i, ...(t < 214.4 ? walk(t, 1.4, .35, i) : { swing: 0 }), head: t > LEAP ? -.15 : 0 }); }
    void qx;
    if (leapK < 0) { const x = Math.min(runX(t), 520); fig(x, 1030, .7, { ...walk(t, 2.4, .62), case: 1, caseRot: .35 }); }
    else if (leapK < 2) { const k = leapK; fig(k ? 900 : 640, k ? 640 : 820, .7, { swing: .7, rot: .25, case: 1, caseRot: -.3, arm: -2.2, hat: 20 }); }
    s.restore();
    fx({ shake: hitStep(t, GULP) * .8 });
  }
  const hitStep = (t, d) => { const k = ev(t, d); return k >= 0 && k < 2 ? 1 : 0; };

  // ================= B: the hall of the time recorder =================
  const M = { x: 1080, y: 905, s: .72 };
  const mw = (xd, yd, m = M) => [m.x + (xd - 450) * m.s, m.y + (yd - 900) * m.s];
  function machine(t, m, o = {}) {
    const n = countOf(t, DO2), up = (side) => { const d = lastOf(t, DO2), i = DO2.indexOf(d); return i >= 0 && i % 2 === side && ev(t, d) < 3 ? seq(ev(t, d), [1, .8, .4]) : 0; };
    const [ax, ay] = mw(735, 300, m); put(P.cogA, ax, ay, n * TAU / 28, m.s);
    for (const [side, xd] of [[0, 180], [1, 720]]) { const [rx, ry] = mw(xd, 560 - up(side) * 120, m); put(P.rod, rx, ry, 0, m.s, m.s, { k: side }); }
    put(P.machine, m.x, m.y, 0, m.s, m.s, { jit: .6 });
    const [bx, by] = mw(330, 690, m); put(P.cogB, bx, by, -n * TAU / 20, m.s);
    const [cx, cy] = mw(575, 665, m); put(P.cogC, cx, cy, n * TAU / 16, m.s, m.s, { k: 2 });
    const [dx, dy] = mw(450, 200, m);
    put(P.hand, dx, dy, (q(t) - 218) * 2.2, m.s * 1.35, m.s * 1.35); put(P.hand, dx, dy, (q(t) - 218) * .4 + 1, m.s * 1.1, m.s * .9, { k: 1 });
    const lv = o.lever ?? 0; const [lx, ly] = mw(800, 470, m); put(P.lever, lx, ly, .12 - lv * .3, m.s);
  }
  function steam(t, x, y, dos, sc = 1) {
    for (const d of dos) {
      const k = ev(t, d); if (k < 0 || k > 9) continue;
      const r = (30 + k * 16) * sc, a = .55 * (1 - k / 10);
      const g = s.createRadialGradient(x + k * 6 * sc, y - k * 22 * sc, 0, x + k * 6 * sc, y - k * 22 * sc, r);
      g.addColorStop(0, `rgba(250,246,236,${a})`); g.addColorStop(1, 'rgba(250,246,236,0)'); s.fillStyle = g; s.fillRect(x - 300, y - 400, 600, 500);
    }
  }
  const INSERT = DO2[2];
  function B1_recorder(t) {
    backdrop(skyB);
    put(P.floor, -140, 780, 0, 1, 1, { shadow: 0, jit: .3 });
    const m = { x: 1180, y: 960, s: .95 };
    machine(t, m, { lever: DO2.some((d) => ev(t, d) >= 0 && ev(t, d) < 2 && d > INSERT) ? 1 : 0 });
    const [sx, sy] = mw(780, 150, m); steam(t, sx, sy, DO2.filter((d) => d > INSERT), .8);
    // the card sits in the slot once he's posted it
    const [kx, ky] = mw(450, 548, m);
    if (t >= INSERT) put(P.card, kx, ky, 0, .82, .82, { shadow: .5 });
    // he walks up from the left, then reaches up and posts it
    const arrive = 219.3, x = Math.min(160 + (q(t) - 218.3) * 900, 160 + (arrive - 218.3) * 900);
    const there = t >= arrive;
    fig(x, 975, .72, there ? { arm: t < INSERT ? -2.4 : -.1, card: t < INSERT ? P.card : null, cardRot: 2.5, cardSc: .9, case: 0, hat: t >= INSERT && ev(t, INSERT) < 2 ? 18 : 0 } : { ...walk(t, 1.8, .5), case: 0 });
  }
  // close on the card: the hammer stamps the time on each "do", LATE on the last
  const SLAMS = [DO2[6], DO2[8], DO2[9], DO2[10]];
  function B2_stamp(t) {
    backdrop(skyB);
    put(P.panel, 960, 520, 0, 1, 1, { jit: .4 });
    const C = [960, 600], cs = 2.3;
    put(P.cardMid, C[0], C[1], -.02, 1, 1, { jit: .5 });
    const cw = (xd, yd) => [C[0] + (xd - 100) * cs, C[1] + (yd - 160) * cs];
    const TIMES = ['9:58', '10:21', '10:47'];
    s.save(); s.translate(C[0], C[1]); s.rotate(-.02); s.translate(-C[0], -C[1]);
    SLAMS.slice(0, 3).forEach((d, i) => {
      if (t < d) return; const [x, y] = cw(100, 92 + i * 36 + 25);
      s.save(); s.globalCompositeOperation = 'multiply'; s.fillStyle = 'rgba(92,64,136,.9)'; s.textAlign = 'center';
      s.font = `${Math.round(18 * cs)}px "American Typewriter", "Courier New", monospace`; s.fillText(TIMES[i], x, y); s.restore();
    });
    if (t >= SLAMS[3]) { const [x, y] = cw(100, 190); putStamp(LATE, x, y, -.32, 1, .95); }
    s.restore();
    // the hammer: up, then down in one drawing, held two, back up in two
    let lift = 1; for (const d of SLAMS) { const k = ev(t, d); if (k >= 0 && k < 5) lift = seq(k, [0, 0, 0, .45, .9]); }
    const yb = 600 + lift * -470;                                                 // its face lands on the card
    put(P.stampHead, 960, yb + 40, 0, 1, 1);
    const k = ev(t, lastOf(t, SLAMS));
    fx({ shake: k >= 0 && k < 2 ? (t >= SLAMS[3] ? 1 : .4) : 0, flash: t >= SLAMS[3] && k < 1 ? .18 : 0 });
  }
  // the boss rises like a moon; his jaw flaps on the words; lid up, horn out on "now"
  const WORDS = [224.16, 224.58, 224.9, 225.08, 225.72, 226.22, 226.84].map((x) => snap(x));
  const LID = WORDS[6];
  function boss(t, X, Y, sc, big, o = {}) {
    const sfx = big ? 'Big' : '', bs = sc / (big ? 2 : 1);
    const b = (xd, yd) => [X + (xd - 450) * sc, Y + (yd - 1000) * sc];
    const lk = ev(t, LID), lidOpen = lk >= 0;
    if (lidOpen) { const hy = seq(lk, [520, 420, 300, 330, 320]); const [hx, hy2] = b(470, hy); put(P.horn, hx, hy2, .12, sc * .85, sc * .85); }
    put(P['boss' + sfx], X, Y, 0, bs, bs, { jit: .6 });
    const [lx, ly] = o.look || [0, 0];
    for (const sg of [-1, 1]) { const [px, py] = b(450 + sg * 95 + lx * 18, 395 + ly * 9); put(P['pupilB' + sfx], px, py, 0, bs * 1.05); }
    const ang = o.angry || 0;
    for (const sg of [-1, 1]) { const [bx, by] = b(450 + sg * 22, 352 + ang * 8); put(P['brow' + sfx], bx, by, -sg * (ang * .38 - .04), bs * sg * -1, bs, { k: sg + 2 }); }
    const open = o.open || 0; const [jx, jy] = b(450, 540 + open * 80);
    put(P['bossJaw' + sfx], jx, jy, open * .03, bs, bs);
    const [ix, iy] = b(226, 300); put(P['bossLid' + sfx], ix, iy, lidOpen ? -seq(lk, [.5, 1.2, 1.05, 1.12, 1.1]) : 0, bs, bs);
  }
  const talking = (t, list, hold = 2) => list.some((d) => { const k = ev(t, d); return k >= 0 && k < hold; });
  function B3_moon(t) {
    backdrop(skyB);
    const rise = clamp((q(t) - 224.16) / 1.9), Y = 1720 - rise * 710, X = 1240;
    const hg = s.createRadialGradient(X, Y - 560, 40, X, Y - 560, 560); hg.addColorStop(0, 'rgba(255,232,180,.45)'); hg.addColorStop(1, 'rgba(255,232,180,0)'); s.fillStyle = hg; s.fillRect(0, 0, W, H);
    boss(t, X, Y, .9, 0, { open: talking(t, WORDS) ? 1 : 0, angry: t > WORDS[4] ? 1 : 0, look: [-.8, .8] });
    put(P.floor, -140, 760, 0, 1, 1, { shadow: 0, jit: .3 });
    machine(t, { x: 380, y: 940, s: .6 }, {});
    const hop = talking(t, WORDS, 2) && t > WORDS[0] ? 22 : 0;
    fig(700, 960, .52, { arm: -1.9, card: P.cardLateSm, cardRot: 1.7, cardSc: .9, hat: hop, head: -.15 });
  }
  // close on the mouth: the yell comes out as type
  const YELL = [[snap(228.18), 'wWHY', [560, 300], -.12, 1], [snap(228.5), 'wAREYOU', [1360, 430], .1, 1], [snap(228.92), 'wSOLATE', [960, 830], -.04, 1.2]];
  function B4_yell(t) {
    backdrop(skyB, -200, -150, 1.3);
    boss(t, 960, 560 + 440 * 2, 2, 1, { open: t >= YELL[0][0] - .1 ? 1.4 : (talking(t, [228.1]) ? 1 : 0), angry: 1, look: [0, .6] });
    for (const [d, nm, [x, y], r, sc] of YELL) {
      const k = ev(t, d); if (k < 0) continue;
      const u = seq(k, [.15, .5, 1]), z = seq(k, [.25, .65, 1.1, 1.04, 1]) * sc;
      put(P[nm], lerp(960, x, u), lerp(700, y, u), r * u, z);
    }
    const k = ev(t, lastOf(t, YELL.map((y) => y[0])));
    fx({ shake: k >= 0 && k < 3 ? 1 : .3 });
  }

  // ================= C: the hill =================
  const CLOCKS = DO3.map((d, i) => { const r = rng(i * 17 + 3); const side = i % 2 ? 1 : -1; const y = 820 + r() * 200; return { d, x: 960 + side * (190 + r() * 560), y, s: .75 + (y - 820) / 200 * .6, rot: (r() - .5) * .9, kind: i % 4, k: i }; });
  function hill(t) {
    backdrop(skyC);
    put(P.ministryFar, 1700, 760, 0, 1, 1, { jit: .5 });
    put(P.hill, -190, 690, 0, 1, 1, { shadow: 0, jit: .3 });
  }
  function clocksLanded(t, filt) {
    for (const c of CLOCKS) {
      if (!filt(c)) continue; const k = ev(t, c.d); if (k < 0) continue;
      const y = k === 0 ? -120 : k === 1 ? lerp(-120, c.y, .55) : c.y;
      const rot = k < 2 ? c.rot * 2 : c.rot + seq(k - 2, [.25, -.12, .05, 0]);
      put(P['alarm' + c.kind], c.x, y, rot, c.s, c.s, { k: c.k + 20 });
    }
  }
  function C1_rain(t) {
    hill(t);
    clocksLanded(t, (c) => c.y < 900);
    const land = DO3.map((d) => d + .2), hop = land.some((d) => { const k = ev(t, d); return k >= 0 && k < 2; }) ? 24 : 0;
    fig(960, 900, .92, { arm: -1.55, card: P.cardLateSm, cardRot: 1.55, cardSc: .9, head: .2, hat: hop });
    clocksLanded(t, (c) => c.y >= 900);
  }
  // close: the hands tear it, and tear it again
  const T1 = snap(236.8), T2 = snap(238.12), T3 = snap(239.56);
  function C2_tear(t) {
    backdrop(skyC, -120, -300, 1.4);
    put(P.hill, -500, 960, 0, 1.6, 1.6, { shadow: 0 });
    const C = [960, 500], half = 230;
    const k1 = ev(t, T1), k2 = ev(t, T2), k3 = ev(t, T3);
    if (k1 < 0) {
      put(P.cardBig, C[0], C[1], -.03);
      put(P.grip, C[0] - half + 10, C[1] - 20, .1, -1, 1); put(P.grip, C[0] + half - 10, C[1] - 20, -.1);
      return;
    }
    const sep = seq(k1, [40, 90, 110]), rr = seq(k1, [.08, .15, .17]);
    const lift = k3 >= 0 ? seq(k3, [-60, -260, -600, -1000]) : 0;
    const halves = (sideX, sg) => {
      const hx = C[0] + sg * sep, hy = C[1] + lift;
      at(hx, hy, sg * rr, 1, 1, () => {
        if (k2 < 0) put(sg < 0 ? P.cardL : P.cardR, 0, 0, 0);
        else {
          put(sg < 0 ? P.cardTL : P.cardTR, 0, -seq(k2, [10, 30, 40]), 0);
          if (k2 < 14) { const fall = seq(k2, [20, 80, 170, 280, 400, 540, 690, 850, 1010, 1180, 1350, 1500, 1700, 1900]); put(sg < 0 ? P.cardBL : P.cardBR, sg * k2 * 9, fall, sg * k2 * .22); }
        }
      });
      if (k3 < 0 || k3 < 1) put(P.grip, hx + sg * (half - 10 - (k2 >= 0 ? 0 : 0)), hy - 20 - (k2 >= 0 ? 40 : 0), sg * -.1 + sg * rr, sg, 1);
      else put(P.grip, hx + sg * (half + 60), C[1] + 200 + k3 * 120, sg * -.5, sg, 1);
    };
    halves(0, -1); halves(0, 1);
    fx({ shake: (k1 >= 0 && k1 < 2) || (k2 >= 0 && k2 < 2) ? .5 : 0 });
  }
  // the pieces become birds; he turns and walks the other way, past the queue going in
  const BIRD = snap(240.1), TURN = snap(240.47), GO = 241.17;
  function C3_birds(t) {
    hill(t);
    // the queue on the crest, small, walking right toward the Board
    for (let i = 0; i < 8; i++) { const x = -100 + i * 160 + (q(t) - 239.94) * 70; if (x < 1550) fig(x, 790, .3, { clerk: 1, k: 40 + i, ...walk(t, 1.4, .35, i) }); }
    clocksLanded(t, (c) => c.y < 900);
    const gone = t >= GO, mx = gone ? 960 - (q(t) - GO) * 150 : 960;
    const turned = t >= TURN;
    fig(mx, 900, .92, gone ? { face: -1, ...walk(t, 1.4, .42), head: -.05 } : { face: turned ? -1 : 1, arm: turned ? -.2 : -2.6, backArm: turned ? .1 : -2.4, head: turned ? 0 : -.3 });
    clocksLanded(t, (c) => c.y >= 900);
    // the four pieces fly up from his hands; on BIRD each snaps into a bird
    const qs = ['qTL', 'qTR', 'qBL', 'qBR'];
    const nb = t >= 241.9 ? 8 : 4;
    for (let i = 0; i < nb; i++) {
      const r = rng(i * 7 + 1), dir = i % 2 ? 1 : -1, born = i < 4 ? 239.94 : 241.9;
      const u = q(t) - born; if (u < 0) continue;
      const x0 = i < 4 ? 960 + dir * 40 : 960 + dir * (200 + r() * 260), y0 = i < 4 ? 420 : 260 + r() * 140;
      const x = x0 + dir * u * (110 + r() * 120), y = y0 - u * (90 + r() * 70) - Math.sin(u * 3 + i) * 20;
      if (t < BIRD && i < 4) { put(P[qs[i]], x, y, u * 3 * dir, 1.1, 1.1, { k: i }); continue; }
      const flap = Math.floor((t - born) * 8 + i) % 3, wr = [-.9, -.1, .55][flap];
      at(x, y, -.15 * dir, dir * 1.2, 1.2, () => { put(P['wing' + (i % 4)], 6, -10, wr - .3, 1, 1, { k: i + 50 }); put(P['bird' + (i % 4)], 0, 0, 0, 1, 1, { k: i }); put(P['wing' + (i % 4)], -2, -6, wr, 1, 1, { k: i + 60 }); });
    }
    if (t >= BIRD && ev(t, BIRD) < 2) fx({ flash: .12 });
  }

  const shot = (fn) => { const g = function (t, lt, dur) { setStep(t); fn(t, lt, dur); }; Object.defineProperty(g, 'name', { value: fn.name }); return g; };
  chapter('ch08', 206.0, 245.0, [
    [206.0, shot(A1_establish)],
    [209.9, shot(A2_crowd)],
    [212.8, shot(A3_mouth)],
    [218.3, shot(B1_recorder)],
    [221.6, shot(B2_stamp)],
    [224.16, shot(B3_moon)],
    [228.1, shot(B4_yell)],
    [229.94, shot(C1_rain)],
    [235.42, shot(C2_tear)],
    [239.94, shot(C3_birds)],
  ]);
})();
