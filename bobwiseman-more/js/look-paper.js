// Look test 3: CUT-PAPER COLOUR SHAPES, chorus 1 (97.5-129.3 s).
// Big flat scissor-cut shapes slap in on beats and pile up; the customer (cut-paper, deadpan) is
// slowly buried until only his head and one raised finger poke out the top.
// Pure function of t: all geometry and layout are built once from seeded rng; nothing carries between frames.
(() => {
  const C = {
    ground: '#f2e9d6', ultra: '#1e2b8a', cobalt: '#2553c9', verm: '#e4422b', lemon: '#f7d01c',
    leaf: '#3c9a3d', pink: '#f49ab6', white: '#fbf6ea', black: '#1d1b1c', peach: '#f3c3a4',
    coat: '#2d7a3a', coatD: '#23652f', coatL: '#4a9a50', cap: '#40362f', orange: '#f28a1e', nose: '#e9a48b',
  };
  const TAU2 = Math.PI * 2;

  // ---------- colour jitter so no two pieces are the exact same sheet ----------
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    r = Math.round(clamp(r * f, 0, 255)); g = Math.round(clamp(g * f, 0, 255)); b = Math.round(clamp(b * f, 0, 255));
    return `rgb(${r},${g},${b})`;
  }

  // ---------- scissor-cut paths: straight facets with small irregular wobble ----------
  function cutPath(pts, seed, seg = 30, amp = 1.7) {
    const R = rng(seed); const p = new Path2D(); const out = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      const L = Math.hypot(bx - ax, by - ay); const n = Math.max(1, Math.round(L / seg));
      const nx = -(by - ay) / (L || 1), ny = (bx - ax) / (L || 1);
      for (let k = 0; k < n; k++) {
        const u = k / n; const o = k === 0 ? (R() - .5) * amp * .8 : (R() - .5) * 2 * amp;
        out.push([ax + (bx - ax) * u + nx * o, ay + (by - ay) * u + ny * o]);
      }
    }
    out.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath();
    return p;
  }
  const ellPts = (rx, ry, seed, facet = 24) => {
    const R = rng(seed + 7); const n = Math.max(9, Math.round(TAU2 * Math.max(rx, ry) / facet)); const a0 = R() * TAU2;
    return [...Array(n)].map((_, i) => { const a = a0 + i / n * TAU2, j = 1 + (R() - .5) * .03; return [Math.cos(a) * rx * j, Math.sin(a) * ry * j]; });
  };
  const disk = (r, seed) => cutPath(ellPts(r, r, seed), seed, 999);
  const ell = (rx, ry, seed) => cutPath(ellPts(rx, ry, seed), seed, 999);
  const starPts = (r, k = .45, n = 5) => [...Array(n * 2)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * k : r; return [Math.cos(a) * rr, Math.sin(a) * rr]; });
  const heartPts = (r) => [...Array(30)].map((_, i) => { const a = i / 30 * TAU2; return [16 * Math.pow(Math.sin(a), 3) * r / 17, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * r / 17 - r * .05]; });
  const almondPts = (w, h, n = 14) => { const o = []; for (let i = 0; i <= n; i++) { const u = i / n; o.push([lerp(-w / 2, w / 2, u), -Math.sin(u * Math.PI) * h / 2]); } for (let i = n - 1; i > 0; i--) { const u = i / n; o.push([lerp(-w / 2, w / 2, u), Math.sin(u * Math.PI) * h / 2]); } return o; };
  const rectPts = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  // ---------- paper fibre texture (built once) ----------
  let TEX = null;
  function makeTexture() {
    const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; const x = c.getContext('2d');
    x.fillStyle = '#808080'; x.fillRect(0, 0, 1920, 1080);
    const R = rng(4242);
    for (let i = 0; i < 160; i++) { // soft mottling
      const cx = R() * 1920, cy = R() * 1080, r = 60 + R() * 260, l = R() < .5;
      const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, l ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'); gr.addColorStop(1, 'rgba(128,128,128,0)');
      x.fillStyle = gr; x.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    const im = x.getImageData(0, 0, 1920, 1080), d = im.data; // grain
    for (let i = 0; i < d.length; i += 4) { const v = (R() - .5) * 26; d[i] += v; d[i + 1] += v; d[i + 2] += v; }
    x.putImageData(im, 0, 0);
    x.lineCap = 'round';
    for (let i = 0; i < 9000; i++) { // fibres: short curling strands, light and dark
      const sx = R() * 1920, sy = R() * 1080, L = 6 + R() * 26, a = R() * TAU2, bend = (R() - .5) * 1.2, l = R() < .55;
      x.strokeStyle = l ? `rgba(255,255,255,${.10 + R() * .16})` : `rgba(0,0,0,${.07 + R() * .12})`; x.lineWidth = .5 + R() * 1.1;
      x.beginPath(); x.moveTo(sx, sy); x.quadraticCurveTo(sx + Math.cos(a + bend) * L * .5, sy + Math.sin(a + bend) * L * .5, sx + Math.cos(a) * L, sy + Math.sin(a) * L); x.stroke();
    }
    TEX = c;
  }

  // ---------- beat schedule helpers ----------
  const BEATS = FEAT.beats;
  function beatsAfter(t0, n, step = 1) { // first slot = t0 exactly (the sung word), then the following beats
    const out = [t0]; let i = BEATS.findIndex((b) => b > t0 + .2);
    while (out.length < n && i >= 0 && i < BEATS.length) { out.push(BEATS[i]); i += step; }
    return out;
  }
  function subdiv(t0, t1, per) { // per-beat subdivisions between t0 and t1
    const out = []; let i = Math.max(0, lastBeat(t0));
    for (; i < BEATS.length - 1 && BEATS[i] < t1; i++) for (let k = 0; k < per; k++) { const tt = lerp(BEATS[i], BEATS[i + 1], k / per); if (tt >= t0 - .01 && tt < t1) out.push(tt); }
    return out;
  }

  // ---------- word cues ----------
  const T = {
    more0: wordTime('chorus1', 0, 'more'), stars: wordTime('chorus1', 0, 'stars'), sun: wordTime('chorus1', 0, 'sun'),
    truth: wordTime('chorus1', 0, 'truth'), love: wordTime('chorus1', 0, 'love'),
    kisses: wordTime('chorus1', 1, 'kisses'), spring: wordTime('chorus1', 1, 'spring'),
    just: line('chorus1', 2).words[0].t, moreE: wordTime('chorus1', 2, 'more'), every: wordTime('chorus1', 2, 'everything'), end: line('chorus1', 2).t1,
  };
  T.truthMore = line('chorus1', 0).words[4].t; // the "more" before "truth": the eye lands, still shut

  // ---------- pieces ----------
  // piece: { t, x, y, rot, s, parts:[{p, col, dx, dy}], front, kind, anim, pin, glue, seed }
  const PIECES = []; let SUN = null, EYE = null, SPRINGS = [], FLOWERS = [];
  const CUST = { x: 960, feet: 1012 };
  const headZone = (x, y, pad = 0) => x > 760 - pad && x < 1160 + pad && y > 470 - pad; // customer standing
  function mkStar(r, seed, col) { return [{ p: cutPath(starPts(r, .44 + rng(seed)() * .08), seed, 34, 1.5), col }]; }
  function mkHeart(r, seed, col) { return [{ p: cutPath(heartPts(r), seed, 40, 1.4), col }]; }
  function mkLips(r, seed, top, bot) {
    const up = []; for (let i = 0; i <= 12; i++) { const u = i / 12, x = lerp(-r, r, u); const bow = Math.abs(x) < r * .5 ? -r * .36 + Math.abs(Math.abs(x) - r * .26) * .55 * (Math.abs(x) < r * .26 ? 1 : 0) : 0; let y = -Math.sin(u * Math.PI) * r * .34; if (Math.abs(x) < r * .5) y = Math.min(y, bow); if (Math.abs(x) < r * .1) y = -r * .22; up.push([x, y]); }
    for (let i = 11; i > 0; i--) { const u = i / 12; up.push([lerp(-r, r, u), -Math.sin(u * Math.PI) * r * .04 + r * .02]); }
    const lo = []; for (let i = 0; i <= 12; i++) { const u = i / 12; lo.push([lerp(-r * .97, r * .97, u), Math.sin(u * Math.PI) * r * .46 + r * .04]); }
    for (let i = 11; i > 0; i--) { const u = i / 12; lo.push([lerp(-r * .97, r * .97, u), Math.sin(u * Math.PI) * r * .05 + r * .03]); }
    return [{ p: cutPath(lo, seed + 1, 30, 1.3), col: bot }, { p: cutPath(up, seed, 30, 1.3), col: top },
      { p: cutPath([[-r * .3, r * .2], [r * .15, r * .16], [r * .18, r * .24], [-r * .26, r * .27]], seed + 2, 99, 1), col: 'rgba(255,255,255,0.55)', noShadow: true }];
  }
  function mkFlower(r, seed, petal, mid) {
    const R = rng(seed); const n = 5 + Math.floor(R() * 3); const parts = [];
    for (let i = 0; i < n; i++) { const a = i / n * TAU2 + R() * .2; const pr = r * .42; const pts = ellPts(r * .55, pr * .82, seed + i * 13).map(([x, y]) => [x + r * .5, y]).map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]); parts.push({ p: cutPath(pts, seed + i * 13, 999), col: petal }); }
    parts.push({ p: disk(r * .34, seed + 99), col: mid });
    return parts;
  }
  function mkLeaf(len, seed, col) { return [{ p: cutPath(almondPts(len, len * .42, 10).map(([x, y]) => [x + len / 2, y]), seed, 40, 1.4), col }, { p: cutPath(rectPts(len * .08, -2.5, len * .85, 2.5), seed + 3, 99, .6), col: 'rgba(255,255,255,0.35)', noShadow: true }]; }
  function mkSmallSun(r, seed, disc, ray) {
    const parts = []; const n = 10;
    for (let i = 0; i < n; i++) { const a = i / n * TAU2; const pts = [[-r * .16, -r * .95], [r * .16, -r * .95], [0, -r * 1.6]].map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]); parts.push({ p: cutPath(pts, seed + i, 99, 1.2), col: ray }); }
    parts.push({ p: disk(r, seed + 50), col: disc });
    return parts;
  }

  function build() {
    const R = rng(97500);
    const placed = [];
    const free = (x, y, d) => placed.every(([px, py, pd]) => Math.hypot(px - x, py - y) > (pd + d) * .55);
    function spot(x0, x1, y0, y1, d, avoid) {
      for (let k = 0; k < 400; k++) { const x = lerp(x0, x1, R()), y = lerp(y0, y1, R()); if (avoid && avoid(x, y)) continue; if (free(x, y, d)) { placed.push([x, y, d]); return [x, y]; } }
      const x = lerp(x0, x1, R()), y = lerp(y0, y1, R()); placed.push([x, y, d]); return [x, y];
    }
    const add = (o) => { PIECES.push({ rot: 0, s: 1, front: false, seed: PIECES.length * 31 + 7, ...o }); return PIECES[PIECES.length - 1]; };

    // --- the big sun (lowest layer) + its ray strips. Rises behind the customer on "sun".
    SUN = { x: 960, y: 370, r: 235, t: T.sun };
    add({ kind: 'sun', t: T.sun, x: SUN.x, y: SUN.y, parts: [{ p: disk(SUN.r, 11), col: C.lemon }], rise: true, pin: true, z: 0 });
    const rayT = beatsAfter(T.sun + .25, 6).flatMap((b, i) => [b, b + .12]).slice(0, 12);
    const rayOrder = [0, 6, 3, 9, 1, 7, 4, 10, 2, 8, 5, 11];
    rayOrder.forEach((k, i) => {
      const a = k / 12 * TAU2 - Math.PI / 2 + .13; const L = k % 2 ? 150 : 215, w = k % 2 ? 46 : 64;
      add({ kind: 'ray', t: rayT[i], ang: a, L, w, x: SUN.x, y: SUN.y, parts: [{ p: cutPath([[-w / 2, 0], [w / 2, 0], [w * .12, -L], [-w * .12, -L]], 300 + k, 30, 1.6), col: k % 2 ? C.orange : C.verm }], z: .5 });
    });
    placed.push([SUN.x, SUN.y, 500]);

    // --- stars: a couple on the first "more", then one big + one small per beat from "stars"
    const starCols = [C.lemon, C.white, C.pink, C.lemon, C.verm, C.white];
    const sT = [T.more0, T.more0 + .12, T.more0 + .25, T.more0 + .37, T.more0 + .5, T.more0 + .62, T.more0 + .75, ...beatsAfter(T.stars, 9).flatMap((b) => [b, b + .245])].filter((x) => x < T.sun - .05);
    sT.forEach((t, i) => {
      const big = i >= 7 && i % 2 === 1; const r = big ? 70 + R() * 55 : 30 + R() * 22;
      const [x, y] = spot(150, 1770, 110, 760, r * 1.6, (x, y) => headZone(x, y, 60) || (Math.abs(x - 960) < 360 && y < 700 && i > 8));
      add({ kind: 'star', size: r, t, x, y, rot: (R() - .5) * .6, parts: mkStar(r, 1000 + i, starCols[i % starCols.length]), pin: big && R() < .4, glue: !big && R() < .3, z: 1 });
    });

    // --- two small suns in the upper corners, on the last beats of "sun"
    beatsAfter(T.sun + .9, 2).forEach((t, i) => {
      const x = i ? 1640 : 300, y = i ? 200 : 230;
      placed.push([x, y, 200]);
      add({ kind: 'sun2', t, x, y, rot: R(), parts: mkSmallSun(62, 2000 + i * 77, i ? C.verm : C.orange, i ? C.lemon : C.pink), spin: i ? 1 : -1, z: 1.5 });
    });

    // --- the eye of truth: lands shut on "more", opens on "truth"
    EYE = { x: 960, y: 335, w: 620, h: 290 };
    add({ kind: 'eye', t: T.truthMore, x: EYE.x, y: EYE.y, parts: [], pin: false, z: 2 });

    // --- hearts on "love"
    const hT = beatsAfter(T.love, 7).flatMap((b, i) => i % 2 ? [b] : [b, b + .245]);
    const hCols = [C.verm, C.pink, C.verm, C.white, C.pink];
    hT.forEach((t, i) => {
      const r = i === 0 ? 190 : i % 3 === 2 ? 55 + R() * 25 : 95 + R() * 55;
      const [x, y] = i === 0 ? (placed.push([1450, 560, 300]), [1450, 560]) : spot(130, 1790, 180, 900, r * 1.5, (x, y) => headZone(x, y, 50) || (Math.abs(x - 960) < 330 && y < 560));
      add({ kind: 'heart', size: r, t, x, y, rot: (R() - .5) * .5, parts: mkHeart(r, 3000 + i * 5, hCols[i % hCols.length]), beatScale: true, glue: R() < .25, pin: i === 0, z: 3 });
    });

    // --- lips on "kisses": two per beat (the loud part starts)
    const lT = beatsAfter(T.kisses, 7).flatMap((b) => [b, b + .245]).filter((t) => t < T.spring - .1);
    lT.forEach((t, i) => {
      const r = i === 0 ? 150 : 70 + R() * 50; const low = i % 3 === 2;
      const [x, y] = i === 0 ? (placed.push([520, 470, 260]), [520, 470]) : spot(130, 1790, low ? 760 : 160, low ? 1000 : 880, r * 1.6, (x, y) => low ? Math.abs(x - 960) < 200 : (headZone(x, y, 40) || (Math.abs(x - 960) < 330 && y < 560)));
      const pal = [[C.verm, '#ff6a4f'], [C.pink, '#ffb4c8'], ['#c8243a', C.verm]][i % 3];
      add({ kind: 'lips', t, x, y, rot: (R() - .5) * .45, parts: mkLips(r, 4000 + i * 9, pal[0], pal[1]), pucker: true, front: low, z: 4 });
    });

    // --- spring: flowers + leaves sprout from the bottom edge, and coil springs bounce
    const fT = beatsAfter(T.spring, 8).flatMap((b) => [b, b + .245]).filter((t) => t < T.just - .05);
    const fx = [140, 1780, 400, 1530, 690, 1240, 260, 1650, 860, 1080, 560, 1380, 980];
    fT.forEach((t, i) => {
      if (i >= fx.length) return;
      const x = fx[i] + (R() - .5) * 60, h = 170 + R() * 230, r = 55 + R() * 40;
      const pal = [[C.pink, C.lemon], [C.lemon, C.verm], [C.white, C.lemon], [C.verm, C.pink], [C.cobalt, C.lemon]][i % 5];
      const f = add({ kind: 'flower', t, x, y: 1095, stemH: h, r, rot: (R() - .5) * .3, parts: mkFlower(r, 5000 + i * 21, pal[0], pal[1]),
        stem: cutPath(rectPts(-7, -h, 7, 0), 5100 + i, 40, 1.2), leafA: mkLeaf(70 + R() * 40, 5200 + i, C.leaf), leafB: mkLeaf(60 + R() * 40, 5300 + i, '#2f8a36'), front: true, z: 5 });
      FLOWERS.push(f);
    });
    const spT = beatsAfter(T.spring + .25, 3);
    [[330, 1040, C.cobalt], [1600, 1030, C.lemon], [1210, 1050, C.pink]].forEach(([x, y, col], i) => {
      const top = [mkStar(52, 5600 + i, C.lemon), mkHeart(50, 5700 + i, C.verm), mkStar(46, 5800 + i, C.white)][i];
      SPRINGS.push(add({ kind: 'spring', t: spT[i], x, y, col, top, h0: 210 + i * 25, front: true, z: 5.5 }));
    });

    // --- "just want more of everything": everything at once, piling bottom-up to fill the frame
    // 16th-note slots; two pieces per slot until the line ends, then one every other slot as the pile settles
    const eT = subdiv(T.just, 129.35, 4).flatMap((t, j) => t < T.end + .3 ? [[t, 0], [t, 1]] : j % 2 ? [] : [[t, 0]]);
    // the "everything" wave: six big pieces slam the top edge at once
    const wave = [[260, 120], [620, 90], [1300, 90], [1660, 130], [120, 420], [1800, 440]].map(([x, y], i) => [T.every + i * .03, 0, x, y]);
    const kinds = ['star', 'heart', 'lips', 'flower', 'sun2', 'leaf', 'star', 'heart', 'disk', 'lips'];
    const cols = [C.lemon, C.verm, C.pink, C.cobalt, C.leaf, C.white, C.orange];
    const ringT = subdiv(T.every + .2, T.end + .9, 2);
    ringT.forEach((t, i) => { const a = Math.PI * (-.3 + 1.6 * ((i * .618) % 1)), rr = 165 + R() * 70; wave.push([t, 0, 960 - Math.cos(a) * rr * 1.2, 330 + Math.sin(a) * rr * .75, true]); });
    // bury his body: pieces fill the rectangle his coat ends up in, bottom-up, as he rises
    subdiv(T.moreE, T.end, 2).forEach((t, i, arr) => { const u = i / arr.length; wave.push([t, 0, 960 + (((i * .618) % 1) - .5) * 330, lerp(680, 360, u) + (R() - .5) * 60, true]); });
    // two small pieces at his temples close the gap where the eye's lid line would show
    wave.push([T.every + .45, 0, 846, 172, true], [T.every + .7, 0, 1050, 150, true]);
    const NE = eT.length;
    [...eT, ...wave].forEach(([t, m, wx, wy, ring], i) => {
      {
        const u = Math.min(1, i / NE);
        const k = kinds[Math.floor(R() * kinds.length)]; const r = ring ? 62 + R() * 45 : (wx ? 150 : 70) + R() * 90 + (u > .6 ? 30 : 0);
        let y = wy ?? lerp(1060, 60, Math.pow(u, .8)) + (R() - .5) * 170; let x = wx ?? lerp(70, 1850, R());
        // only the space right above his head stays clear: his head and finger are the top of the pile
        if (!ring && Math.abs(x - 960) < 200 && y < 215) x = x < 960 ? 960 - 200 - R() * 140 : 960 + 200 + R() * 140;
        const col = cols[Math.floor(R() * cols.length)], col2 = cols[Math.floor(R() * cols.length)];
        let parts;
        if (k === 'star') parts = mkStar(r, 7000 + i, col === C.cobalt ? C.lemon : col);
        else if (k === 'heart') parts = mkHeart(r * .9, 7000 + i, [C.verm, C.pink, C.white][i % 3]);
        else if (k === 'lips') parts = mkLips(r * .9, 7000 + i, C.verm, '#ff6a4f');
        else if (k === 'flower') parts = mkFlower(r * .8, 7000 + i, col, col2 === col ? C.lemon : col2);
        else if (k === 'sun2') parts = mkSmallSun(r * .5, 7000 + i, C.lemon, C.verm);
        else if (k === 'leaf') parts = mkLeaf(r * 1.5, 7000 + i, i % 2 ? C.leaf : '#2f8a36');
        else parts = [{ p: disk(r * .75, 7000 + i), col }];
        add({ kind: 'e_' + k, size: r * .8, t: t + m * .06, x, y, rot: (R() - .5) * 1.4, parts, front: true, pucker: k === 'lips', beatScale: k === 'heart', glue: R() < .12, pin: R() < .08, z: 6 + u });
      }
    });
    PIECES.sort((a, b) => a.z - b.z || a.t - b.t);
  }

  // ---------- drawing ----------
  let K = 1; // device px per 1080p px (shadow offsets live in device space)
  // Soft blurred shadows cost ~3x, so they go only where they show: anything in the air or just landed,
  // and the hero pieces. Settled pile pieces get a two-step hard shadow (a near and a far offset).
  let SOFT = true;
  function shadowOn(g, lift = 1) { g.shadowColor = 'rgba(40,20,5,0.34)'; g.shadowOffsetX = 2.5 * K * lift; g.shadowOffsetY = 4.5 * K * lift; g.shadowBlur = 5 * K * lift; }
  function shadowOff(g) { g.shadowColor = 'rgba(0,0,0,0)'; g.shadowBlur = 0; g.shadowOffsetX = 0; g.shadowOffsetY = 0; }
  function fillParts(g, parts, lift, tint) {
    const soft = SOFT || lift > 1.05; let loc = null;
    for (const q of parts) {
      g.fillStyle = tint && !q.noShadow ? tint(q.col) : q.col;
      if (q.noShadow) { shadowOff(g); g.fill(q.p); continue; }
      if (soft) { shadowOn(g, lift); g.fill(q.p); continue; }
      shadowOff(g);
      if (!loc) { // device-space offsets mapped back into this piece's local frame (light stays fixed while pieces rotate)
        const m = g.getTransform(), det = m.a * m.d - m.b * m.c;
        const L = (dx, dy) => [(m.d * dx - m.c * dy) / det, (-m.b * dx + m.a * dy) / det];
        loc = [L(4.5 * K, 7.5 * K), L(1.8 * K, 3 * K)];
      }
      const fs = g.fillStyle;
      g.fillStyle = 'rgba(30,15,5,0.2)'; g.translate(loc[0][0], loc[0][1]); g.fill(q.p);
      g.fillStyle = 'rgba(30,15,5,0.26)'; g.translate(loc[1][0] - loc[0][0], loc[1][1] - loc[0][1]); g.fill(q.p);
      g.translate(-loc[1][0], -loc[1][1]); g.fillStyle = fs; g.fill(q.p);
    }
    shadowOff(g);
  }
  function pinAt(g, x, y, col) {
    shadowOn(g, 1.3); g.fillStyle = col; g.beginPath(); g.arc(x, y, 9, 0, TAU2); g.fill(); shadowOff(g);
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.beginPath(); g.arc(x - 3, y - 3, 3, 0, TAU2); g.fill();
  }
  function glueAt(g, seed, r) {
    const Rg = rng(seed); const x = (Rg() - .5) * r * .6, y = (Rg() - .5) * r * .6;
    g.fillStyle = 'rgba(255,250,235,0.13)'; g.fill(cutPathCached(seed, () => ellPts(r * .22, r * .14, seed, 8).map(([a, b]) => [a + x, b + y])));
  }
  const PC = new Map(); const cutPathCached = (k, f) => { if (!PC.has(k)) PC.set(k, cutPath(f(), k, 12, 2.5)); return PC.get(k); };

  // slap-in: falls from above the page (bigger, higher shadow), squashes on contact, settles
  function slap(t, t0) {
    const a = t - t0, D = .13;
    if (a < -D) return null;
    if (a < 0) { const k = ease.in(1 + a / D); return { s: lerp(1.75, 1, k), sx: 1, sy: 1, lift: lerp(5, 1, k), r: (1 - k) * .25 }; }
    const e = Math.exp(-9 * a) * Math.cos(a * 30);
    return { s: 1, sx: 1 + .2 * e, sy: 1 - .2 * e, lift: 1 + Math.max(0, -e) * .8, r: 0 };
  }

  function drawPiece(g, p, t) {
    SOFT = t - p.t < .6 || p.kind === 'sun' || p.kind === 'eye';
    if (p.kind === 'eye') return drawEye(g, p, t);
    if (p.kind === 'spring') return drawSpring(g, p, t);
    if (p.kind === 'flower') return drawFlower(g, p, t);
    let st;
    if (p.rise) { // the big sun rises from below
      if (t < p.t - .05) return; const k = ease.back(inv(p.t - .05, p.t + .55, t));
      st = { s: 1, sx: 1, sy: 1, lift: 1, r: 0, dy: (1 - k) * 900 };
    } else { st = slap(t, p.t); if (!st) return; }
    const flut = beatPulse(t, 7) * .03 * (hash(p.seed) - .5);
    let sc = st.s;
    if (p.beatScale) sc *= 1 + .07 * beatPulse(t, 6) * (t > p.t + .2 ? 1 : 0);
    let sx = st.sx, sy = st.sy;
    if (p.pucker && t > p.t + .3) { const bp = beatPulse(t, 7); sx *= 1 - .14 * bp; sy *= 1 + .1 * bp; }
    g.save();
    if (p.kind === 'ray') {
      const a = p.ang + (t - T.sun) * .06; // the rays wheel slowly round the sun
      const len = 1 + .06 * beatPulse(t, 5);
      g.translate(p.x + Math.cos(a) * (SUN.r - 18), p.y + Math.sin(a) * (SUN.r - 18)); g.rotate(a + Math.PI / 2 + st.r);
      g.scale(sc * sx, sc * sy * len);
    } else {
      g.translate(p.x, p.y + (st.dy || 0)); g.rotate(p.rot + st.r + flut + (p.spin ? p.spin * (t - p.t) * .25 : 0)); g.scale(sc * sx, sc * sy);
    }
    fillParts(g, p.parts, st.lift, p.tint);
    if (p.glue) glueAt(g, p.seed, p.size || 80);
    if (p.pin && t > p.t) pinAt(g, (hash(p.seed + 1) - .5) * 30, -20 + (hash(p.seed + 2) - .5) * 30, [C.white, C.verm, C.lemon][p.seed % 3]);
    g.restore();
  }

  // the eye of truth: almond white, cobalt iris; a pink lid that lifts on "truth"
  let EYEP = null;
  function eyeParts() {
    if (EYEP) return EYEP; const { w, h } = EYE;
    EYEP = { white: cutPath(almondPts(w, h, 18), 8100, 34, 1.4), lid: cutPath(almondPts(w + 40, h + 46, 18), 8101, 34, 1.6),
      iris: disk(h * .43, 8102), ring: disk(h * .47, 8106), pupil: disk(h * .2, 8103), hi: disk(h * .07, 8104), lash: cutPath(rectPts(-6, -48, 6, 0), 8105, 99, 1) };
    return EYEP;
  }
  function drawEye(g, p, t) {
    const st = slap(t, p.t); if (!st) return; const E = eyeParts(); const { w, h } = EYE;
    let open = ease.back(inv(T.truth - .05, T.truth + .3, t)) * 1;
    const blink = (tb) => { const a = Math.abs(t - tb); return a < .14 ? 1 - a / .14 : 0; };
    open *= 1 - Math.max(blink(108.62), blink(112.2), blink(116.05), blink(119.9));
    open = clamp(open, 0, 1.08);
    // gaze: at camera, then down at the customer, then back
    const gx = kf(t, [[106.6, 0], [107.4, 0], [107.7, -40], [108.3, -40], [108.5, 70], [109.4, 70], [109.6, 0]]) + Math.sin(t * 1.3) * 6;
    const gy = kf(t, [[106.6, 0], [107.4, 0], [107.7, 50], [108.3, 50], [108.5, 30], [109.4, 30], [109.6, 0]]);
    g.save(); g.translate(p.x, p.y); g.scale(st.s * st.sx, st.s * st.sy);
    fillParts(g, [{ p: E.lid, col: C.pink }], st.lift);
    if (open > .02) {
      g.save(); g.scale(1, open); g.clip(E.white); g.scale(1, 1 / open);
      shadowOff(g); g.fillStyle = C.white; g.fill(E.white);
      g.save(); g.translate(gx, gy);
      fillParts(g, [{ p: E.ring, col: C.black }, { p: E.iris, col: C.cobalt }, { p: E.pupil, col: C.black }], .8);
      g.fillStyle = C.white; g.translate(-h * .11, -h * .12); g.fill(E.hi); g.restore();
      // upper lid shadow line: paper edge of the lid sits on the eye
      g.restore();
    }
    // lash line + lashes ride the upper edge of the opening
    const R = rng(8200);
    g.save(); g.scale(1, Math.max(open, .04));
    g.strokeStyle = C.black; g.lineWidth = 12 / Math.max(open, .04) * .0 + 10; g.restore();
    shadowOn(g, .8); g.fillStyle = C.black;
    const lashN = 9;
    for (let i = 0; i < lashN; i++) {
      const u = (i + .5) / lashN, x = lerp(-w / 2, w / 2, u), y = -Math.sin(u * Math.PI) * h / 2 * Math.max(open, .04);
      const a = (u - .5) * 1.3 + (R() - .5) * .12;
      g.save(); g.translate(x, y); g.rotate(a); g.scale(1, open > .3 ? 1 : .55 + open); g.fill(E.lash); g.restore();
    }
    // the lid edge itself: a thin black strip following the curve
    g.beginPath();
    for (let i = 0; i <= 24; i++) { const u = i / 24; g.lineTo(lerp(-w / 2, w / 2, u), -Math.sin(u * Math.PI) * h / 2 * Math.max(open, .04)); }
    g.lineWidth = 9; g.lineJoin = 'round'; g.strokeStyle = C.black; g.stroke();
    if (open < .5) { g.beginPath(); for (let i = 0; i <= 24; i++) { const u = i / 24; g.lineTo(lerp(-w / 2, w / 2, u), Math.sin(u * Math.PI) * h / 2 * Math.max(open, .04)); } g.lineWidth = 6; g.stroke(); }
    shadowOff(g);
    if (t > p.t) { pinAt(g, -w / 2 - 6, 0, C.lemon); pinAt(g, w / 2 + 6, 0, C.lemon); }
    g.restore();
  }

  // coil spring: zigzag strips, compresses on each beat and throws its topper up
  function drawSpring(g, p, t) {
    const st = slap(t, p.t); if (!st) return;
    const a = t - BEATS[Math.max(0, lastBeat(t))]; const on = t > p.t + .15 ? 1 : 0;
    const comp = on * Math.exp(-5 * a) * Math.cos(a * 15);
    const h = p.h0 * (1 - .32 * comp) * st.sy; const n = 7, wd = 120;
    g.save(); g.translate(p.x, p.y); g.rotate(st.r);
    const base = cutPathCached(p.seed * 3 + 1, () => rectPts(-80, -16, 80, 6));
    fillParts(g, [{ p: base, col: C.black }], st.lift);
    let prev = [-wd / 2, -12];
    for (let i = 1; i <= n; i++) {
      const y = -12 - h * i / n, x = i % 2 ? wd / 2 : -wd / 2; const [px, py] = prev;
      const L = Math.hypot(x - px, y - py), ang = Math.atan2(y - py, x - px);
      g.save(); g.translate(px, py); g.rotate(ang);
      fillParts(g, [{ p: cutPathCached(p.seed * 100 + i, () => rectPts(-6, -9, L + 6, 9)), col: i % 2 ? shade(p.col, .72) : p.col }], st.lift);
      g.restore(); prev = [x, y];
    }
    const jump = on * Math.max(0, comp) * 0;
    const up = on * Math.max(0, -comp) * 60;
    g.translate(0, -12 - h - 40 - up - jump); g.rotate(on * comp * .2);
    fillParts(g, p.top, st.lift + up / 30);
    g.restore();
  }

  // flower: stem grows from the bottom edge, leaves unfold, head pops open with a squash
  function drawFlower(g, p, t) {
    const a = t - p.t; if (a < 0) return;
    const grow = ease.out(a / .35); const pop = ease.back(inv(p.t + .22, p.t + .5, t));
    const sway = Math.sin(t * 2.2 + p.seed) * .04 + beatPulse(t, 6) * .05 * (hash(p.seed) - .5);
    g.save(); g.translate(p.x, p.y); g.rotate(p.rot * .3 + sway);
    g.save(); g.scale(1, grow); fillParts(g, [{ p: p.stem, col: '#2f8a36' }], 1); g.restore();
    const lk = ease.back(inv(p.t + .15, p.t + .45, t));
    if (lk > 0) {
      g.save(); g.translate(5, -p.stemH * .35 * grow); g.rotate(-.5); g.scale(lk, lk); fillParts(g, p.leafA, 1); g.restore();
      g.save(); g.translate(-5, -p.stemH * .6 * grow); g.rotate(Math.PI + .45); g.scale(lk, lk); fillParts(g, p.leafB, 1); g.restore();
    }
    if (pop > 0) {
      g.translate(0, -p.stemH * grow); g.rotate(p.rot + (t - p.t) * .15 * (p.seed % 2 ? 1 : -1));
      const bp = 1 + .06 * beatPulse(t, 6); g.scale(pop * bp, pop * bp); fillParts(g, p.parts, 1);
    }
    g.restore();
  }

  // ---------- the customer ----------
  let CP = null;
  function custParts() {
    if (CP) return CP;
    const s = 9000;
    CP = {
      legL: cutPath(rectPts(-36, -95, -14, 0), s + 1, 40, 1), legR: cutPath(rectPts(14, -95, 36, 0), s + 2, 40, 1),
      shoeL: cutPath([[-62, 0], [-10, 0], [-10, -22], [-30, -26], [-56, -18]], s + 3, 99, 1), shoeR: cutPath([[62, 0], [10, 0], [10, -22], [30, -26], [56, -18]], s + 4, 99, 1),
      coat: cutPath([[-45, -350], [-96, -334], [-122, -300], [-140, -150], [-156, -62], [-80, -54], [0, -58], [80, -54], [156, -62], [140, -150], [122, -300], [96, -334], [45, -350]], s + 5, 34, 2),
      lapL: cutPath([[-46, -350], [0, -238], [-8, -300], [-22, -340]], s + 6, 99, 1), lapR: cutPath([[46, -350], [0, -238], [8, -300], [22, -340]], s + 7, 99, 1),
      flap: cutPath(rectPts(-4, -236, 4, -60), s + 8, 50, .8),
      btn: disk(9, s + 9),
      pocket: cutPath(rectPts(-108, -150, -62, -138), s + 11, 99, .8), pocket2: cutPath(rectPts(62, -150, 108, -138), s + 11, 99, .8),
      // a sleeve too long for him: tapered tube, cuff hides the hand (local: shoulder at 0,0, hanging +y)
      sleeve: cutPath([[-24, -8], [26, -8], [36, 205], [-30, 212]], s + 12, 40, 1.5), cuff: cutPath([[-30, 180], [36, 176], [36, 205], [-30, 212]], s + 13, 99, 1),
      head: ell(70, 66, s + 14), earL: disk(15, s + 15), earR: disk(15, s + 16), nose: disk(10, s + 17),
      eye: disk(8, s + 18), brow: cutPath(rectPts(-15, -3.5, 15, 3.5), s + 19, 99, .6), mouth: cutPath(rectPts(-19, -3.5, 19, 3.5), s + 20, 99, .6),
      // flat cap seen from the front: a low wide crown, the short brim a crescent along its lower edge
      cap: cutPath([[-74, 4], [-70, -16], [-48, -34], [-10, -42], [34, -38], [64, -22], [76, 2]], s + 21, 30, 1.2),
      brim: cutPath([[-60, -2], [-20, 10], [24, 12], [62, 0], [56, 16], [20, 24], [-22, 22], [-56, 12]], s + 22, 99, 1), capBtn: disk(6, s + 23),
      hand: cutPath([[-30, -16], [-18, -28], [22, -28], [32, -14], [30, 18], [14, 30], [-20, 30], [-32, 14]], s + 24, 99, 1), finger: cutPath([[-10, 0], [10, 0], [10.5, -62], [0, -71], [-10.5, -62]], s + 25, 99, .8),
      thumb: cutPath([[-26, 4], [14, -6], [18, 6], [-22, 16]], s + 26, 99, .6), knuck: cutPath(rectPts(-2, -24, 2, -6), s + 27, 99, .4),
    };
    return CP;
  }
  const FEET_END = 655;
  const custFeet = (t) => {
    if (t < T.just) return CUST.feet;
    const i0 = lastBeat(T.just), i = lastBeat(t); const n = Math.max(0, i - i0) + ease.out(beatPhase(t) * 2.2); // lifts a notch per beat
    return lerp(CUST.feet, FEET_END, clamp(n / 9));
  };
  function custState(t) {
    const cues = [T.stars, T.sun, T.truth, T.love, T.kisses, T.spring, T.moreE, T.every];
    let brow = 0, nod = 0;
    for (const c of cues) { const a = t - c; if (a > 0 && a < 1.1) brow = Math.max(brow, a < .1 ? a / .1 : 1 - inv(.7, 1.1, a)); if (a > .15 && a < .65) nod = Math.max(nod, Math.sin((a - .15) / .5 * Math.PI)); }
    { const a = t - (T.end + .2); if (a > 0 && a < .6) nod = Math.max(nod, Math.sin(a / .6 * Math.PI)); }
    const lookUp = t < T.truth ? kf(t, [[97.5, 0], [98.4, 1], [101.8, 1], [102.6, 0], [103.3, 1], [105.0, 1], [105.6, .3]]) : kf(t, [[107.6, .3], [107.9, 1], [108.4, 1], [108.7, 0]]);
    const lookX = t < 110 ? Math.sin(t * .9) * 3 : t < T.just ? kf(t, [[110.2, 6], [111.5, -6], [113, 6], [114.2, -6], [117, 6], [118, -5], [120, 4]]) : 0;
    const blinkT = [99.9, 101.2, 104.1, 109.3, 111.7, 115.2, 118.9, 123.0, 126.4, 128.3];
    return { fy: custFeet(t), brow, nod, lookUp, lookX, blink: blinkT.some((b) => t > b && t < b + .1), raise: ease.back(inv(T.moreE - .18, T.moreE + .12, t)), bp: beatPulse(t, 8) * .025 };
  }
  function drawRaisedArm(g, t, S) {
    const P = custParts();
    g.save(); g.translate(112, -300);
    const ang = lerp(-.06, Math.PI + .2, S.raise) + (S.raise > .9 ? Math.sin(t * 8.2) * .03 : 0);
    g.rotate(ang);
    if (S.raise > .3) {
      g.save(); g.translate(2, 214); g.rotate(Math.PI);
      fillParts(g, [{ p: P.hand, col: C.peach }], 1);
      g.save(); g.translate(-19, -22); g.rotate(-.1 + Math.sin((t - T.moreE) * TAU2 * 123 / 120) * .1 * (t > T.moreE + .3 ? 1 : 0)); fillParts(g, [{ p: P.finger, col: C.peach }], 1); g.restore();
      g.save(); g.translate(0, -2); fillParts(g, [{ p: P.thumb, col: shade(C.peach, .9) }], .6); g.restore();
      for (const kx of [0, 15]) { g.save(); g.translate(kx, 0); g.fillStyle = 'rgba(150,80,60,0.45)'; g.fill(P.knuck); g.restore(); }
      g.restore();
    }
    fillParts(g, [{ p: P.sleeve, col: C.coatD }, { p: P.cuff, col: shade(C.coat, .7) }], 1);
    g.restore();
  }
  // pass 'body' is drawn under the pile; pass 'top' (head + the raised arm) rides on top of it
  function drawCustomer(g, t, pass) {
    SOFT = true;
    const P = custParts(); const S = custState(t);
    g.save(); g.translate(CUST.x, S.fy); g.scale(1 + S.bp, 1 - S.bp);
    if (pass === 'body') {
      fillParts(g, [{ p: P.legL, col: C.black }, { p: P.legR, col: C.black }, { p: P.shoeL, col: C.black }, { p: P.shoeR, col: C.black }], 1);
      fillParts(g, [{ p: P.coat, col: C.coat }, { p: P.flap, col: C.coatD }, { p: P.lapL, col: C.coatL }, { p: P.lapR, col: C.coatL }, { p: P.pocket, col: C.coatD }, { p: P.pocket2, col: C.coatD }], 1);
      g.save(); g.translate(14, -205); fillParts(g, [{ p: P.btn, col: C.lemon }], 1); g.translate(0, 62); fillParts(g, [{ p: P.btn, col: C.lemon }], 1); g.restore();
      g.save(); g.translate(-112, -300); g.rotate(.07); fillParts(g, [{ p: P.sleeve, col: C.coatD }, { p: P.cuff, col: shade(C.coat, .7) }], 1); g.restore();
      drawRaisedArm(g, t, S);
    } else {
      // the raised arm again, only the part above his shoulders, so it pokes out of the pile
      if (S.raise > .3 && t > T.just + .5) { g.save(); g.beginPath(); g.rect(-400, -1200, 800, 1200 - 345); g.clip(); drawRaisedArm(g, t, S); g.restore(); }
      g.save(); g.translate(0, -404 + S.nod * 9); g.rotate(S.nod * .05);
      g.save(); g.translate(-70, 2); fillParts(g, [{ p: P.earL, col: shade(C.peach, .93) }], 1); g.restore();
      g.save(); g.translate(70, 2); fillParts(g, [{ p: P.earR, col: shade(C.peach, .93) }], 1); g.restore();
      fillParts(g, [{ p: P.head, col: C.peach }], 1);
      const ey = -6 - S.lookUp * 7;
      for (const sx of [-24, 24]) {
        g.save(); g.translate(sx + S.lookX, ey); if (S.blink) g.scale(1.2, .25); fillParts(g, [{ p: P.eye, col: C.black }], .5); g.restore();
        g.save(); g.translate(sx, -30 - S.brow * 11 - S.lookUp * 3); g.rotate((sx < 0 ? 1 : -1) * (.08 - S.brow * .1)); fillParts(g, [{ p: P.brow, col: C.black }], .5); g.restore();
      }
      g.save(); g.translate(2, 14); fillParts(g, [{ p: P.nose, col: C.nose }], .6); g.restore();
      g.save(); g.translate(0, 38); fillParts(g, [{ p: P.mouth, col: C.black }], .5); g.restore();
      g.save(); g.translate(2, -50); g.rotate(-.04); fillParts(g, [{ p: P.cap, col: C.cap }, { p: P.brim, col: shade(C.cap, .78) }], 1); g.translate(-6, -40); fillParts(g, [{ p: P.capBtn, col: shade(C.cap, .78) }], .5); g.restore();
      g.restore();
    }
    g.restore();
  }

  // ---------- sheet + frame ----------
  let SHEET = null;
  function drawFrame(g, t) {
    K = g.canvas.width / 1920;
    g.fillStyle = C.ground; g.fillRect(0, 0, W, H);
    const energy = clamp(F('vocals', t) * 1.1);
    const push = lerp(1, 1.035, smooth(inv(97.5, 129.3, t))) * (1 + .01 * beatPulse(t, 7) * (.4 + energy * (t > 113.5 ? 1.6 : .6)));
    g.save(); g.translate(960, 540); g.scale(push, push); g.rotate(Math.sin(t * .7) * .003); g.translate(-960, -540);
    if (!SHEET) SHEET = cutPath([[52, 44], [1872, 30], [1880, 1046], [44, 1056]], 77, 60, 2.5);
    SOFT = true; fillParts(g, [{ p: SHEET, col: C.ultra }], 1.4);
    pinAt(g, 80, 70, C.lemon); pinAt(g, 1846, 58, C.verm); pinAt(g, 1852, 1020, C.lemon); pinAt(g, 74, 1028, C.pink);
    let custDone = false;
    for (const p of PIECES) {
      if (!custDone && p.front) { drawCustomer(g, t, 'body'); custDone = true; }
      drawPiece(g, p, t);
    }
    if (!custDone) drawCustomer(g, t, 'body');
    drawCustomer(g, t, 'top');
    g.restore();
    // paper fibre over everything (pieces and ground share the stock's tooth)
    if (TEX) { g.globalCompositeOperation = 'overlay'; g.globalAlpha = .55; g.drawImage(TEX, 0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  }

  window.drawFrame = drawFrame;
  window.LOOK_READY = new Promise((res) => { makeTexture(); build(); res(); });
})();
