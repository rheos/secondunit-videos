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

    // --- chorus1 line 3 (the finale line): everything at once, piling bottom-up to fill the frame
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
    if (open < .12) { drawClosedLid(g, w, h, st.lift, 8300); if (t > p.t) { pinAt(g, -w / 2 - 6, 0, C.lemon); pinAt(g, w / 2 + 6, 0, C.lemon); } g.restore(); return; }
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

  // closed eye: a pink lid dome over a downward lid line with lashes hanging from it
  const LIDC = new Map();
  function drawClosedLid(g, w, h, lift, seed) {
    if (!LIDC.has(seed)) {
      const dome = [], line = [];
      for (let i = 0; i <= 20; i++) { const u = i / 20; dome.push([lerp(-w / 2 - 20, w / 2 + 20, u), -Math.sin(u * Math.PI) * (h + 46) * .42]); }
      for (let i = 19; i > 0; i--) { const u = i / 20; dome.push([lerp(-w / 2 - 20, w / 2 + 20, u), Math.sin(u * Math.PI) * h * .14]); }
      for (let i = 0; i <= 20; i++) { const u = i / 20; line.push([lerp(-w / 2 - 14, w / 2 + 14, u), Math.sin(u * Math.PI) * h * .14 - 6]); }
      for (let i = 20; i >= 0; i--) { const u = i / 20; line.push([lerp(-w / 2 - 14, w / 2 + 14, u), Math.sin(u * Math.PI) * h * .14 + 6]); }
      LIDC.set(seed, { dome: cutPath(dome, seed, 34, 1.5), line: cutPath(line, seed + 1, 30, .8), lash: cutPath(rectPts(-w * .011, 0, w * .011, w * .085), seed + 2, 99, 1) });
    }
    const L = LIDC.get(seed);
    fillParts(g, [{ p: L.dome, col: C.pink }, { p: L.line, col: C.black }], lift);
    g.fillStyle = C.black;
    for (let i = 0; i < 9; i++) {
      const u = (i + .5) / 9, x = lerp(-w / 2, w / 2, u), y = Math.sin(u * Math.PI) * h * .14 + 2;
      g.save(); g.translate(x, y); g.rotate(-(u - .5) * 1.1); fillParts(g, [{ p: L.lash, col: C.black }], .6); g.restore();
    }
  }

  // coil spring: stacked paper coils (back halves darker, front halves bright), compresses on each beat
  const COILC = new Map();
  function coilParts(rx, ry, th, seed) {
    const k = seed; if (COILC.has(k)) return COILC.get(k);
    const half = (sgn) => { const o = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI; o.push([Math.cos(a) * (rx + th / 2), sgn * Math.sin(a) * (ry + th / 2)]); } for (let i = 12; i >= 0; i--) { const a = i / 12 * Math.PI; o.push([Math.cos(a) * (rx - th / 2), sgn * Math.sin(a) * (ry - th / 2)]); } return cutPath(o, seed + (sgn > 0 ? 1 : 2), 40, .9); };
    const v = { back: half(-1), front: half(1), base: cutPath(rectPts(-rx - 20, -14, rx + 20, 8), seed + 3, 50, 1.2), cap: cutPath(rectPts(-rx * .55, -8, rx * .55, 8), seed + 4, 50, 1) };
    COILC.set(k, v); return v;
  }
  function drawSpring(g, p, t) {
    const st = slap(t, p.t); if (!st) return;
    const a = t - BEATS[Math.max(0, lastBeat(t))]; const on = t > p.t + .15 ? 1 : 0;
    const comp = on * Math.exp(-5 * a) * Math.cos(a * 15);
    const sz = p.sz || 1, h = (p.h0 * 1.25) * (1 - .32 * comp) * st.sy, n = 7, rx = 74 * sz, ry = 19 * sz;
    const Cp = coilParts(rx, ry, 13 * sz, 60000000 + p.seed * 7);
    g.save(); g.translate(p.x, p.y); g.rotate(st.r);
    fillParts(g, [{ p: Cp.base, col: C.black }], st.lift);
    const yy = (i) => -18 - ry - (h - 2 * ry) * i / (n - 1);
    for (let i = 0; i < n; i++) { g.save(); g.translate(0, yy(i)); g.rotate(-.13); fillParts(g, [{ p: Cp.back, col: shade(p.col, .62) }], st.lift); g.restore(); }
    for (let i = 0; i < n; i++) { g.save(); g.translate(0, yy(i)); g.rotate(-.13); fillParts(g, [{ p: Cp.front, col: p.col }], st.lift); g.restore(); }
    g.save(); g.translate(0, yy(n - 1) - ry - 4); fillParts(g, [{ p: Cp.cap, col: C.black }], st.lift); g.restore();
    const up = on * Math.max(0, -comp) * 70;
    g.translate(0, yy(n - 1) - ry - 48 * sz - up); g.rotate(on * comp * .2); g.scale(sz, sz);
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
    if (S.gloves > 0) return;
    g.save(); g.translate(112, -300);
    const ang = lerp(-.06, Math.PI + .6, S.raise) + (S.raise > .9 ? Math.sin(t * 8.2) * .03 : 0);
    g.rotate(ang);
    if (S.raise > .3) {
      // "one more": palm to camera, index finger up on the thumb side (toward his head), thumb out, three fingers curled down
      g.save(); g.translate(2, 226); g.rotate(Math.PI - .42); g.scale(1.36, 1.36);
      if (!P.palm) {
        P.palm = cutPath([[-24, -24], [28, -24], [31, 0], [26, 34], [-18, 36], [-26, 6]], 9031, 99, .8);
        P.idx = cutPath([[-11, 4], [11, 4], [11, -60], [6, -69], [-6, -69], [-11, -60]], 9032, 99, .6);
        P.curl = cutPath([[-5.5, 9], [-5.5, -5], [-3, -9], [3, -9], [5.5, -5], [5.5, 9]], 9033, 99, .4);
        P.thumb2 = cutPath([[-20, 26], [-46, 2], [-56, -14], [-48, -22], [-34, -12], [-12, 10]], 9034, 99, .6);
      }
      const wag = -.08 + Math.sin((t - S.raiseT) * TAU2 * 123 / 120) * .08 * (t > S.raiseT + .3 ? 1 : 0);
      fillParts(g, [{ p: P.palm, col: C.peach }], 1);
      g.save(); g.translate(-13, -22); g.rotate(wag); fillParts(g, [{ p: P.idx, col: C.peach }], 1); g.restore();
      for (const cx of [2, 13, 24]) { g.save(); g.translate(cx, -12); fillParts(g, [{ p: P.curl, col: shade(C.peach, .86) }], .5); g.restore(); }
      fillParts(g, [{ p: P.thumb2, col: shade(C.peach, .95) }], .8);
      g.strokeStyle = 'rgba(150,80,60,0.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-14, 12); g.quadraticCurveTo(4, 2, 24, 10); g.stroke();
      g.restore();
    }
    fillParts(g, [{ p: P.sleeve, col: C.coatD }, { p: P.cuff, col: shade(C.coat, .7) }], 1);
    g.restore();
  }
  // pass 'body' is drawn under the pile; pass 'top' (head + the raised arm) rides on top of it
  function drawCustomer(g, t, pass) {
    const S = custState(t); S.x = CUST.x; S.raiseT = T.moreE; S.armTop = t > T.just + .5;
    drawCustS(g, S, t, pass);
  }
  // S: { x, fy, brow, nod, lookUp, lookX, blink, raise, raiseT, armTop, bp, [rot, sc, gloves, jab] }
  function drawCustS(g, S, t, pass) {
    SOFT = true;
    const P = custParts();
    g.save(); g.translate(S.x, S.fy); if (S.rot) g.rotate(S.rot); if (S.sc) g.scale(S.sc, S.sc); g.scale(1 + S.bp, 1 - S.bp);
    if (pass === 'body') {
      fillParts(g, [{ p: P.legL, col: C.black }, { p: P.legR, col: C.black }, { p: P.shoeL, col: C.black }, { p: P.shoeR, col: C.black }], 1);
      fillParts(g, [{ p: P.coat, col: C.coat }, { p: P.flap, col: C.coatD }, { p: P.lapL, col: C.coatL }, { p: P.lapR, col: C.coatL }, { p: P.pocket, col: C.coatD }, { p: P.pocket2, col: C.coatD }], 1);
      g.save(); g.translate(14, -205); fillParts(g, [{ p: P.btn, col: C.lemon }], 1); g.translate(0, 62); fillParts(g, [{ p: P.btn, col: C.lemon }], 1); g.restore();
      if (S.gloves > 0) drawGloves(g, t, S);
      else { g.save(); g.translate(-112, -300); g.rotate(.07); fillParts(g, [{ p: P.sleeve, col: C.coatD }, { p: P.cuff, col: shade(C.coat, .7) }], 1); g.restore(); }
      drawRaisedArm(g, t, S);
    } else {
      // the raised arm again, only the part above his shoulders, so it pokes out of the pile
      if (S.raise > .3 && S.armTop) { g.save(); g.beginPath(); g.rect(-400, -1200, 800, 1200 - 345); g.clip(); drawRaisedArm(g, t, S); g.restore(); }
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

  // =====================================================================================
  // v2: the rest of the song. Chorus 1 above stays as approved; everything below starts at the burst.
  // =====================================================================================
  const TB = BEATS.find((b) => b >= 129.3);        // the downbeat after chorus 1 settles: the pile bursts
  const BI0 = lastBeat(TB);
  const bt = (k) => BEATS[BI0 + k];
  const FS = [TB, bt(4), bt(16), bt(28), bt(40)];  // burst, rosette, spiral, stripes, mandala
  const SWEEP = bt(52);                            // the broom: scraps swept off, sheet left clean
  const V = {
    start: 158.2, don: line('verse3', 0).t0, evening: wordTime('verse3', 0, 'evening'), midnight: wordTime('verse3', 0, 'midnight'),
    l2: line('verse3', 1).t0, argue: wordTime('verse3', 1, 'argue'), fight: wordTime('verse3', 1, 'fight'),
    l3: line('verse3', 2).t0, show: wordTime('verse3', 2, 'show'), outside: wordTime('verse3', 2, 'outside'), heart: wordTime('verse3', 2, 'heart'),
    core: wordTime('verse3', 3, 'core'), l5: line('verse3', 4).t0, less: wordTime('verse3', 4, 'less'), more: wordTime('verse3', 4, 'more'),
  };
  const C2 = {
    more0: line('chorus2', 0).t0, stars: wordTime('chorus2', 0, 'stars'), sun: wordTime('chorus2', 0, 'sun'), truthMore: line('chorus2', 0).words[4].t,
    truth: wordTime('chorus2', 0, 'truth'), love: wordTime('chorus2', 0, 'love'), kisses: wordTime('chorus2', 1, 'kisses'), spring: wordTime('chorus2', 1, 'spring'),
    just: line('chorus2', 2).t0, moreE: wordTime('chorus2', 2, 'more'), every: wordTime('chorus2', 2, 'everything'), end: line('chorus2', 2).t1,
  };
  C2.back = BEATS.find((b) => b >= 205.4);          // band back in after the breakdown
  const END = { drift: 219.45, settle: 221.6, starLand: 222.9, nod: 223.1 };
  const PAL = [C.lemon, C.verm, C.pink, C.white, C.leaf, C.orange];
  const PAL2 = [C.cobalt, C.lemon, C.verm, C.leaf, C.pink, C.orange]; // chorus-2 pile: neighbours never share a colour

  function react(t, cues) {
    let brow = 0, nod = 0;
    for (const c of cues) { const a = t - c; if (a > 0 && a < 1.1) brow = Math.max(brow, a < .1 ? a / .1 : 1 - inv(.7, 1.1, a)); if (a > .15 && a < .65) nod = Math.max(nod, Math.sin((a - .15) / .5 * Math.PI)); }
    return { brow, nod };
  }
  const blinkAt = (t) => ((t + .37) % 3.3) < .1;

  // ---------- boxing gloves (verse 3, "fight") ----------
  let GLV = null;
  function drawGloves(g, t, S) {
    const P = custParts();
    if (!GLV) GLV = { mitt: ell(54, 48, 61000001), thumb: ell(20, 28, 61000002), cuff: cutPath(rectPts(-40, 30, 40, 52), 61000003, 99, 1), lace: cutPath(rectPts(-3, 30, 3, 52), 61000004, 99, .5) };
    const k = ease.back(S.gloves);
    for (const sd of [-1, 1]) {
      g.save(); g.translate(sd * 112, -300); g.rotate(sd * -.95); g.scale(1, .42); fillParts(g, [{ p: P.sleeve, col: C.coatD }], 1); g.restore();
      const jab = S.jab && ((lastBeat(t) % 2 === 0) === (sd < 0)) ? beatPulse(t, 7) : 0;
      g.save(); g.translate(sd * 56, -262 - jab * 30); g.scale(1.3 * k * (1 + jab * .12) * sd, 1.3 * k * (1 + jab * .12)); g.rotate(-.15);
      fillParts(g, [{ p: GLV.cuff, col: C.white }, { p: GLV.mitt, col: C.verm }], 1);
      g.save(); g.translate(-38, 8); g.rotate(.5); fillParts(g, [{ p: GLV.thumb, col: shade(C.verm, .88) }], .7); g.restore();
      g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(16, -18, 16, 9, -.5, 0, TAU2); g.fill();
      g.restore();
    }
  }

  // ---------- generic white-bordered piece (chorus 2: outlines keep the pile readable) ----------
  function fillPartsB(g, parts, lift) {
    for (const q of parts) {
      if (q.noShadow) continue;
      g.lineJoin = 'round'; g.lineWidth = 13; g.strokeStyle = C.white;
      if (SOFT || lift > 1.05) { shadowOn(g, lift); g.stroke(q.p); shadowOff(g); }
      else { g.save(); g.strokeStyle = 'rgba(30,15,5,0.24)'; g.translate(3.5, 6); g.stroke(q.p); g.restore(); g.stroke(q.p); }
    }
    for (const q of parts) { g.fillStyle = q.col; g.fill(q.p); }
  }

  // ---------- instrumental 2: scraps ----------
  const NS = 210; const SCR = [];
  const RING = []; // rosette ring assignment
  function buildScraps() {
    const R = rng(129300);
    const ringN = [6, 12, 18, 24, 30, 36, 42]; let k = 0, j = 0;
    for (let i = 0; i < NS; i++) {
      const s = 26 + hash(Math.floor(i / 8) * 977 + 5) * 30, kind = Math.floor(i / 8) % 7; R(); let pts;
      if (kind === 0) pts = almondPts(s * 1.7, s * .7, 8);
      else if (kind === 1) pts = ellPts(s * .55, s * .55, 62000000 + i, 14);
      else if (kind === 2) pts = starPts(s * .75);
      else if (kind === 3) pts = rectPts(-s, -s * .2, s, s * .2);
      else if (kind === 4) pts = [[0, -s * .7], [s * .62, s * .45], [-s * .62, s * .45]];
      else if (kind === 5) pts = heartPts(s * .62);
      else { pts = []; for (let q = 0; q <= 8; q++) { const a = Math.PI + q / 8 * Math.PI; pts.push([Math.cos(a) * s * .6, Math.sin(a) * s * .6 + s * .2]); } }
      const ang = R() * TAU2;
      SCR.push({ p: cutPath(pts, 62100000 + i * 3, 30, 1.1), x0: lerp(120, 1800, R()), y0: lerp(260, 1040, R()), ang, d: 250 + R() * 520, spin: (R() - .5) * 6, r0: R() * TAU2, col0: PAL[(i * 5) % 6], st: ((i * .618034) % 1) * .6 });
      RING.push([k, j, ringN[k] || (NS - 168)]); j++; if (k < ringN.length && j >= ringN[k]) { k++; j = 0; }
    }
  }
  const stepB = (t) => (lastBeat(t) - BI0) + ease.out(clamp(beatPhase(t) * 1.8));
  const grow = (t) => lerp(.85, 1.12, inv(TB, SWEEP, t));
  const FORMS = [
    (i, t) => { const S = SCR[i], a = t - TB, d = S.d * ease.out(a / 1.6); return [S.x0 + Math.cos(S.ang) * d, S.y0 + Math.sin(S.ang) * d + 90 * a * a, S.r0 + S.spin * a, ease.back(a / .25), S.col0, 1]; },
    (i, t) => { const [k, j, n] = RING[i], dir = k % 2 ? 1 : -1, ang = j / n * TAU2 + dir * stepB(t) * .2; const r = (50 + k * 68) * (1 + .05 * beatPulse(t, 5)) * grow(t); return [960 + Math.cos(ang) * r, 540 + Math.sin(ang) * r, ang + Math.PI / 2, 1, PAL[k % 6], 1]; },
    (i, t) => { const A = 7, arm = i % A, s = (Math.floor(i / A) + .5) / (NS / A); const r = (40 + 610 * Math.pow(s, .85)) * grow(t), ang = arm * TAU2 / A + s * 4.2 + stepB(t) * .22; return [960 + Math.cos(ang) * r, 540 + Math.sin(ang) * r * .92, ang + 1.2, .7 + .7 * s, PAL[arm % 6], 1]; },
    (i, t) => { const B = 9, b = i % B, j = Math.floor(i / B), dir = b % 2 ? 1 : -1; const u = (((j * 115 + dir * stepB(t) * 58) % 2760) + 2760) % 2760 - 1380, v = (b - (B - 1) / 2) * 128; const th = -.3; return [960 + u * Math.cos(th) - v * Math.sin(th), 540 + u * Math.sin(th) + v * Math.cos(th), th + (hash(i) - .5) * .4, 1.15, PAL[b % 6], 1]; },
    // mandala: 8 mirrored wedges; the same shape and colour sits at the same place in every wedge
    (i, t) => { const w = i % 8, l = Math.floor(i / 8), ri = Math.floor(l / 3), si = l % 3; const r = (70 + ri * 66) * (1 + .06 * beatPulse(t, 5) * (ri % 2 ? 1 : -1)) * grow(t); const al = (si + .5) / 3 * Math.PI / 4; const mir = w % 2 ? -1 : 1; const ang = w * Math.PI / 4 + (w % 2 ? Math.PI / 4 - al : al) + (ri % 2 ? 1 : -1) * stepB(t) * .1; return [960 + Math.cos(ang) * r, 540 + Math.sin(ang) * r, ang + mir * (si - 1) * .6 + Math.PI / 2, .85 + ri * .06, PAL[(ri * 2 + si) % 6], mir]; },
  ];
  function scrapPose(i, t) {
    let k = 0; while (k < FS.length - 1 && t >= FS[k + 1]) k++;
    let P = FORMS[k](i, t), flip = 1, col = P[4];
    if (k > 0) {
      const u = ease.inOut(inv(FS[k] + SCR[i].st, FS[k] + SCR[i].st + .8, t));
      if (u < 1) {
        const A = FORMS[k - 1](i, t), sw = Math.sin(u * Math.PI) * 90;
        const dx = P[0] - A[0], dy = P[1] - A[1], L = Math.hypot(dx, dy) || 1;
        P = [lerp(A[0], P[0], u) - dy / L * sw, lerp(A[1], P[1], u) + dx / L * sw, lerp(A[2], P[2], u) + Math.sin(u * Math.PI) * 2, lerp(A[3], P[3], u), u < .5 ? A[4] : P[4], u < .5 ? A[5] : P[5]];
        flip = Math.max(.06, Math.abs(Math.cos(u * Math.PI))); col = P[4];
      }
    }
    if (t >= SWEEP) { const f = lerp(-300, 2400, inv(SWEEP, SWEEP + 2.3, t)); if (f > P[0]) { const d = f - P[0]; P[0] += d * 1.5; P[1] -= d * .2 * Math.sin(i); P[2] += d * .01; } }
    return [P[0], P[1], P[2], P[3], col, P[5] * flip];
  }
  let CAPP = null;
  function drawCapAt(g, x, y, rot, sc) {
    const P = custParts(); SOFT = true;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
    fillParts(g, [{ p: P.cap, col: C.cap }, { p: P.brim, col: shade(C.cap, .78) }], 1.6); g.translate(-6, -40); fillParts(g, [{ p: P.capBtn, col: shade(C.cap, .78) }], .5);
    g.restore();
  }
  function drawInstr(g, t) {
    const a = t - TB;
    // the chorus-1 pile blows apart, everything past the camera
    if (a < 1.7) {
      for (const p of PIECES) {
        const dx = p.x - 960, dy = p.y - 640, L = Math.hypot(dx, dy) || 1, sp = 1300 + hash(p.seed + 5) * 1100;
        const d = sp * ease.out(a / 1.4), rr = (hash(p.seed + 6) - .5) * 4 * a, sc = 1 + .5 * a;
        g.save(); g.translate(p.x + dx / L * d, p.y + dy / L * d - 200 * a); g.rotate(rr); g.scale(sc, sc); g.translate(-p.x, -p.y);
        drawPiece(g, p, 129.3); g.restore();
      }
      const S = custState(129.3); S.x = CUST.x; S.raiseT = T.moreE; S.armTop = true; S.fy = FEET_END - 2400 * ease.in(a / .9); S.rot = a * 1.5;
      if (a < .9) { drawCustS(g, S, t, 'body'); drawCustS(g, S, t, 'top'); }
    }
    for (let i = 0; i < NS; i++) {
      const [x, y, rot, sc, col, fx] = scrapPose(i, t);
      if (x < -150 || x > 2070 || y < -150 || y > 1230 || sc <= 0) continue;
      SOFT = a < .6;
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc * fx, sc); fillParts(g, [{ p: SCR[i].p, col }], 1); g.restore();
    }
    // his cap, the one fragment of him left, tumbles through on the stripes
    const cu = inv(FS[3] + .5, FS[3] + 6.5, t);
    if (cu > 0 && cu < 1) drawCapAt(g, lerp(-200, 2120, cu), 430 + Math.sin(cu * Math.PI * 3) * 140 - Math.sin(cu * Math.PI) * 120, cu * Math.PI * 5, 2.6);
  }

  // ---------- verse 3 ----------
  const VB = {};
  function buildVerse3() {
    const R = rng(158700);
    // dusk: stacked paper bands with gentle wavy cut edges
    const cols = ['#b6bce6', '#cfb4dc', '#efb5c6', '#f8c9a6', '#f5dcb2'];
    VB.dusk = cols.map((c, k) => { const y0 = 40 + k * 175, o = []; for (let i = 0; i <= 24; i++) { const x = lerp(30, 1890, i / 24); o.push([x, y0 + Math.sin(i * .9 + k) * 14 + (R() - .5) * 6]); } o.push([1890, 1070], [30, 1070]); return { p: cutPath(o, 63000000 + k, 50, 1.5), col: c }; });
    VB.duskSun = cutPath(ellPts(150, 150, 63000100).filter(([x, y]) => y < 10).concat([[150, 10], [-150, 10]]), 63000101, 40, 1.2);
    VB.hill = (() => { const o = []; for (let i = 0; i <= 20; i++) { const x = lerp(30, 1890, i / 20); o.push([x, 900 - Math.sin(i / 20 * Math.PI) * 120 + Math.sin(i * 1.7) * 18]); } o.push([1890, 1070], [30, 1070]); return cutPath(o, 63000102, 50, 1.5); })();
    VB.early = cutPath(starPts(28), 63000103, 30, 1);
    VB.night = cutPath([[48, 40], [1876, 34], [1882, 1050], [42, 1058]], 63000104, 60, 2.5);
    VB.moon = disk(150, 63000105); VB.crater = [disk(28, 63000106), disk(18, 63000107), disk(36, 63000108)];
    VB.stars = beatsAfter(V.midnight + .4, 8).flatMap((b) => [b, b + .245]).map((tt, i) => {
      let x, y; for (let q = 0; q < 200; q++) { x = lerp(120, 1800, R()); y = lerp(90, 560, R()); if (Math.hypot(x - 1450, y - 250) > 220 && Math.abs(x - 960) > 230 && !(x > 380 && x < 740 && y > 400)) break; }
      return { t: tt, x, y, rot: R(), p: cutPath(starPts(18 + R() * 26), 63000200 + i, 30, 1), col: i % 3 ? C.white : C.lemon };
    });
    // bubbles
    const bub = (sd) => [{ p: ell(185, 122, 63000300 + sd), col: sd < 0 ? C.white : C.pink }, { p: cutPath([[sd * -30, 90], [sd * -100, 70], [sd * -250, 200]], 63000310 + sd, 99, 1), col: sd < 0 ? C.white : C.pink }];
    VB.bubL = bub(-1); VB.bubR = bub(1);
    // ring
    VB.floor = cutPath([[150, 930], [1770, 930], [1840, 1070], [80, 1070]], 63000400, 60, 2);
    VB.apron = cutPath([[146, 922], [1774, 922], [1778, 948], [142, 948]], 63000401, 60, 1.2);
    VB.postL = cutPath(rectPts(230, 470, 274, 1000), 63000402, 40, 1.2); VB.postR = cutPath(rectPts(1646, 470, 1690, 1000), 63000403, 40, 1.2);
    VB.pad = cutPath(rectPts(-30, -26, 30, 26), 63000404, 99, 1);
    // heart layers
    VB.hs = [1, .78, .58, .4, .25]; VB.hcol = [C.verm, C.pink, C.orange, C.lemon, '#fff4d2'];
    VB.hearts = VB.hs.map((s, k) => cutPath(heartPts(300 * s), 63000500 + k, 40, 1.4));
    VB.rays = [...Array(14)].map((_, i) => cutPath([[-16, 0], [16, 0], [4, -150], [-4, -150]], 63000520 + i, 40, 1));
    VB.halo = [disk(170, 63000540), disk(120, 63000541)];
    VB.lift = beatsAfter(V.core, 4);
    VB.reveal = VB.lift[3] + .35;
    // "less" / "more": the sheet starts filling again
    VB.less = { t: V.less, x: 1190, y: 330, rot: .2, parts: [{ p: cutPath(starPts(26), 63000600, 30, 1), col: C.lemon }] };
    VB.fill = subdiv(V.more, C2.more0 - .05, 4).map((tt, i) => {
      const ang = (i * .618034 % 1) * TAU2, rr = 1, x = 960 + Math.cos(ang) * (520 + R() * 380), y = 540 + Math.sin(ang) * (330 + R() * 160), r = 55 + R() * 55;
      return { t: tt, x: clamp(x, 110, 1810), y: clamp(y, 110, 980), rot: (R() - .5) * 1.2, r, parts: mixParts(i, r, 63000700 + i * 13, PAL2[i % 6], PAL2[(i + 2) % 6]) };
    });
  }
  function mixParts(i, r, seed, col, col2) {
    const k = i % 6;
    if (k === 0) return mkStar(r, seed, col);
    if (k === 1) return mkHeart(r * .9, seed, col === C.cobalt ? C.verm : col);
    if (k === 2) return mkLips(r * .9, seed, C.verm, '#ff6a4f');
    if (k === 3) return mkFlower(r * .8, seed, col, col2);
    if (k === 4) return mkSmallSun(r * .5, seed, C.lemon, C.verm);
    return [{ p: disk(r * .75, seed), col }];
  }
  function slapDraw(g, q, t, border, extraRot = 0) {
    const st = slap(t, q.t); if (!st) return;
    SOFT = t - q.t < .6;
    g.save(); g.translate(q.x, q.y); g.rotate(q.rot + st.r + extraRot); g.scale(st.s * st.sx, st.s * st.sy);
    if (border) fillPartsB(g, q.parts, st.lift); else fillParts(g, q.parts, st.lift);
    g.restore();
  }
  function zigzag(g, seed, w, amp) {
    const Rz = rng(seed); let px = -w / 2, py = 0; g.fillStyle = C.black;
    for (let i = 1; i <= 8; i++) {
      const x = lerp(-w / 2, w / 2, i / 8), y = (i % 2 ? -1 : 1) * amp * (.6 + Rz() * .6), L = Math.hypot(x - px, y - py);
      g.save(); g.translate(px, py); g.rotate(Math.atan2(y - py, x - px)); g.fillRect(-4, -5, L + 8, 10); g.restore(); px = x; py = y;
    }
  }
  function drawVerse3(g, t) {
    const sheetIn = ease.out(inv(V.start, V.start + .5, t));
    // dusk
    if (t < V.midnight + .4) {
      g.save(); g.translate(0, -1150 * (1 - sheetIn)); SOFT = true;
      for (let k = 0; k < VB.dusk.length; k++) { fillParts(g, [VB.dusk[k]], 1); if (k === 3) { g.save(); g.translate(1320, 905); fillParts(g, [{ p: VB.duskSun, col: C.orange }], 1); g.restore(); } }
      fillParts(g, [{ p: VB.hill, col: '#6c6aa8' }], 1.2);
      const tw = 1 + .25 * beatPulse(t, 6);
      g.save(); g.translate(1520, 190); g.scale(tw, tw); fillParts(g, [{ p: VB.early, col: C.white }], 1); g.restore();
      g.restore();
    }
    // midnight: a black-blue sheet slaps over, then the moon and the stars
    const nIn = ease.out(inv(V.midnight - .05, V.midnight + .28, t)), nOut = ease.in(inv(V.l5, V.l5 + .55, t));
    if (nIn > 0 && nOut < 1) {
      g.save(); g.translate(0, -1150 * (1 - nIn) - 1150 * nOut); SOFT = true;
      fillParts(g, [{ p: VB.night, col: '#121a4f' }], 2);
      pinAt(g, 76, 66, C.lemon); pinAt(g, 1850, 60, C.lemon);
      const ms = slap(t, V.midnight + .25);
      if (ms) { g.save(); g.translate(1450, 250); g.scale(ms.s * ms.sx, ms.s * ms.sy); fillParts(g, [{ p: VB.moon, col: '#f4e7a1' }], ms.lift); [[-50, -30, 0], [40, 50, 1], [55, -45, 2]].forEach(([x, y, k]) => { g.save(); g.translate(x, y); fillParts(g, [{ p: VB.crater[k], col: '#e2d184' }], .5); g.restore(); }); g.restore(); }
      for (const s of VB.stars) slapDraw(g, { ...s, parts: [{ p: s.p, col: s.col }] }, t, false, Math.sin(t * 2 + s.x) * .05);
      g.restore();
    }
    // the ring drops in on "fight", ropes twang on the beat, gone at the next line
    const rIn = inv(V.fight - .12, V.fight + .2, t), rOut = ease.in(inv(V.l3, V.l3 + .45, t));
    const ringOn = rIn > 0 && rOut < 1, ringDy = -1200 * (1 - ease.back(rIn)) + 1300 * rOut;
    if (ringOn) {
      g.save(); g.translate(0, ringDy); SOFT = true;
      fillParts(g, [{ p: VB.floor, col: C.cobalt }, { p: VB.apron, col: C.white }, { p: VB.postL, col: C.verm }, { p: VB.postR, col: C.cobalt }], 1.3);
      for (const x of [252, 1668]) { g.save(); g.translate(x, 470); fillParts(g, [{ p: VB.pad, col: C.lemon }], 1); g.restore(); }
      g.restore();
    }
    // the heart (outside), then cut down layer by layer to its glowing core
    const hIn = slap(t, V.show), hOut = ease.in(inv(V.l5, V.l5 + .5, t));
    if (hIn && hOut < 1) {
      const pulse = 1 + .08 * (hit(t, V.outside, 6) + hit(t, V.heart, 6)) + .03 * beatPulse(t, 6);
      g.save(); g.translate(1250, 540 + 1300 * hOut); g.scale(hIn.s * hIn.sx * pulse, hIn.s * hIn.sy * pulse);
      const rv = inv(VB.reveal, VB.reveal + .5, t);
      if (rv > 0) { // core glow: vellum halo + rays
        g.save(); g.rotate(t * .25); g.scale(ease.back(rv), ease.back(rv)); SOFT = false;
        VB.rays.forEach((rp, i) => { g.save(); g.rotate(i / 14 * TAU2); g.translate(0, -90); g.scale(1, 1 + .2 * beatPulse(t, 5)); fillParts(g, [{ p: rp, col: i % 2 ? C.white : C.lemon }], 1); g.restore(); });
        g.restore();
        g.fillStyle = 'rgba(255,248,220,0.28)'; g.fill(VB.halo[0]); g.fillStyle = 'rgba(255,248,220,0.35)'; g.fill(VB.halo[1]);
      }
      SOFT = true;
      const cp = 1 + .08 * beatPulse(t, 6) * (rv > 0 ? 1 : 0);
      g.save(); g.scale(cp, cp); fillParts(g, [{ p: VB.hearts[4], col: VB.hcol[4] }], 1); g.restore();
      for (let k = 3; k >= 0; k--) {
        const a = t - VB.lift[k]; // outer layer (k=0) lifts first
        if (a < 0) { fillParts(g, [{ p: VB.hearts[k], col: VB.hcol[k] }], 1); continue; }
        if (a > 1.2) continue;
        const phi = Math.PI * .92 * ease.inOut(a / .45), top = -300 * VB.hs[k] * .8;
        g.save(); g.translate(260 * ease.in((a - .3) / .9), top - 1200 * ease.in((a - .3) / .9)); g.rotate(.6 * ease.in((a - .2) / .9)); g.scale(1, Math.cos(phi)); g.translate(0, -top);
        fillParts(g, [{ p: VB.hearts[k], col: Math.cos(phi) < 0 ? '#fbeee2' : VB.hcol[k] }], 1 + Math.sin(phi) * 3);
        g.restore();
      }
      g.restore();
    }
    // the customer
    const cx = kf(t, [[V.l3 - .05, 960], [V.l3 + .5, 560], [V.l5, 560], [V.l5 + .5, 960]]);
    const hop = Math.max(Math.sin(Math.PI * inv(V.l3 - .05, V.l3 + .5, t)), Math.sin(Math.PI * inv(V.l5, V.l5 + .5, t)));
    const drop = 1 - ease.back(inv(V.start + .25, V.start + .65, t));
    const rc = react(t, [V.midnight, V.fight, VB.reveal, V.more]);
    const bi = lastBeat(t) - lastBeat(V.l2), active = bi % 2;
    const lookX = t > V.l2 && t < V.fight ? (active ? 7 : -7) : t > V.l3 && t < V.l5 ? 7 : Math.sin(t * .9) * 3;
    const lookUp = kf(t, [[V.midnight, 0], [V.midnight + .3, 1], [V.l2 - .1, 1], [V.l2 + .3, 0]]);
    const gl = t >= V.fight && t < V.l3 ? inv(V.fight, V.fight + .3, t) : 0;
    const S = { x: cx, fy: 1000 - 90 * hop - 1300 * drop, brow: rc.brow, nod: rc.nod, lookUp, lookX, blink: blinkAt(t), raise: 0, raiseT: 0, armTop: false, bp: beatPulse(t, 8) * .025, gloves: gl, jab: t > V.fight + .5 };
    drawCustS(g, S, t, 'body'); drawCustS(g, S, t, 'top');
    // ropes in front of him
    if (ringOn) {
      g.save(); g.translate(0, ringDy); SOFT = false;
      [[700, C.white], [790, C.pink], [875, C.white]].forEach(([y, col], k) => {
        const tw = Math.sin((t - V.fight) * 22 + k) * 14 * Math.exp(-3 * Math.max(0, t - V.fight)) + 10 * beatPulse(t, 6), o = [], ob = [];
        for (let i = 0; i <= 16; i++) { const u = i / 16, x = lerp(252, 1668, u), yy = y + Math.sin(u * Math.PI) * (16 + tw); o.push([x, yy - 8]); ob.unshift([x, yy + 8]); }
        fillParts(g, [{ p: cutPath(o.concat(ob), 63000800 + k, 80, .8), col }], 1);
      });
      g.restore();
    }
    // bickering bubbles
    if (t >= V.l2 - .13 && t < V.fight + .6) {
      const fa = t - V.fight;
      for (const sd of [-1, 1]) {
        const isA = (sd < 0) === (active === 0);
        const st = slap(t, isA ? BEATS[lastBeat(t)] : V.l2) || { s: 1, sx: 1, sy: 1, lift: 1, r: 0 };
        const big = t > V.argue ? 1.2 : 1, sc = (isA ? 1 : .86) * big;
        const shake = t > V.argue ? Math.sin(t * 43 + sd) * 4 : 0;
        g.save(); g.translate(960 + sd * 410 + shake + (fa > 0 ? sd * 1500 * ease.in(fa / .55) : 0), 330 - (fa > 0 ? 500 * fa : 0)); g.rotate(fa > 0 ? sd * fa * 6 : sd * .05); g.scale(sc * st.sx * st.s, sc * st.sy * st.s);
        SOFT = true; fillParts(g, sd < 0 ? VB.bubL : VB.bubR, st.lift);
        const zs = 63000900 + Math.max(0, bi) * 7 + (sd > 0 ? 3 : 0);
        g.save(); g.translate(0, t > V.argue ? -24 : 0); zigzag(g, zs, 230, 30); g.restore();
        if (t > V.argue) { g.save(); g.translate(0, 30); zigzag(g, zs + 1, 200, 22); g.restore(); }
        g.restore();
      }
    }
    // "less": one tiny star. "more": it starts filling again
    if (t >= V.less - .2) slapDraw(g, VB.less, t, true);
    for (const q of VB.fill) slapDraw(g, q, t, true);
  }

  // ---------- chorus 2 + ending ----------
  const CB = {}; const P2 = [];
  function buildChorus2() {
    const R = rng(188900);
    // the giants (breakdown): one huge shape per sung item, each replacing the last
    const sunParts = [];
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU2, L = i % 2 ? 760 : 900, w = i % 2 ? 70 : 110; const pts = [[-w / 2, -320], [w / 2, -320], [w * .1, -L], [-w * .1, -L]].map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]); sunParts.push({ p: cutPath(pts, 64000000 + i, 40, 2), col: i % 2 ? C.orange : C.verm }); }
    sunParts.push({ p: disk(330, 64000020), col: C.lemon });
    CB.giants = [
      { kind: 'star', t: C2.stars, parts: [{ p: cutPath(starPts(540, .46), 64000030, 40, 2.4), col: C.lemon }] },
      { kind: 'sun', t: C2.sun, parts: sunParts },
      { kind: 'eye', t: C2.truthMore },
      { kind: 'heart', t: C2.love, parts: [{ p: cutPath(heartPts(500), 64000040, 44, 2.2), col: C.verm }] },
      { kind: 'lips', t: C2.kisses, parts: mkLips(560, 64000050, C.verm, '#ff6a4f') },
    ];
    // the pile (band back in): bigger pieces, white-bordered, neighbouring colours always differ
    let ci = 0; const nextCol = () => PAL2[(ci++ * 7) % 6];
    const add = (o) => { const p = { rot: 0, seed: 900000 + P2.length * 31, border: true, front: true, ...o }; P2.push(p); return p; };
    // slam: the earlier items come back round the edges
    const slamPos = [[230, 230], [1690, 230], [170, 640], [1750, 640], [560, 160], [1360, 160], [420, 560], [1500, 560], [300, 930], [1620, 930], [760, 120], [1160, 120]];
    slamPos.forEach(([x, y], i) => { const r = 120 + R() * 60, k = i % 4; const parts = k === 0 ? mkStar(r, 64100000 + i, C.lemon) : k === 1 ? mkSmallSun(r * .55, 64100000 + i, C.lemon, C.verm) : k === 2 ? mkHeart(r, 64100000 + i, i % 3 ? C.pink : C.verm) : [{ p: disk(r * .7, 64100000 + i), col: C.cobalt }];
      add({ kind: 'p', t: C2.back + (i % 4) * .06 + Math.floor(i / 4) * .245, x, y, rot: (R() - .5) * .8, parts, front: false }); });
    // kisses: lips two per beat after the giant pair
    beatsAfter(C2.kisses + .2, 8).flatMap((b) => [b, b + .245]).filter((tt) => tt < C2.spring - .1).forEach((tt, i) => {
      const r = 95 + R() * 55, x = 160 + ((i * .618) % 1) * 1600, y = 700 + R() * 300;
      add({ kind: 'p', t: tt, x: Math.abs(x - 960) < 220 ? x + (x < 960 ? -260 : 260) : x, y, rot: (R() - .5) * .5, parts: mkLips(r, 64200000 + i, [C.verm, C.pink, '#c8243a'][i % 3], ['#ff6a4f', '#ffb4c8', C.verm][i % 3]), pucker: true });
    });
    // spring: big flowers sprout + big coil springs
    [140, 1780, 470, 1450, 760, 1160].forEach((x, i) => {
      const h = 260 + R() * 220, r = 95 + R() * 30, pc = [C.pink, C.lemon, C.white, C.verm, C.cobalt, C.lemon][i];
      add({ kind: 'flower', t: C2.spring + i * .122, x, y: 1095, stemH: h, r, rot: (R() - .5) * .3, parts: mkFlower(r, 64300000 + i * 21, pc, pc === C.lemon ? C.verm : C.lemon),
        stem: cutPath(rectPts(-10, -h, 10, 0), 64300100 + i, 40, 1.2), leafA: mkLeaf(100 + R() * 40, 64300200 + i, C.leaf), leafB: mkLeaf(90 + R() * 40, 64300300 + i, '#2f8a36') });
    });
    beatsAfter(C2.spring + .25, 3).forEach((tt, i) => add({ kind: 'spring', t: tt, x: [330, 1600, 1230][i], y: [1040, 1030, 1050][i], col: [C.cobalt, C.lemon, C.pink][i], sz: 1.3, h0: 250, top: [mkStar(52, 64400000 + i, C.lemon), mkHeart(50, 64400010 + i, C.verm), mkStar(46, 64400020 + i, C.white)][i], border: false }));
    // just want more of everything: 16th-note slots, bottom-up, bigger than chorus 1
    const eT = subdiv(C2.just, C2.every + .7, 4); const NE = eT.length;
    const wave = [[230, 110], [600, 80], [1320, 80], [1690, 110], [110, 420], [1810, 420], [420, 250], [1500, 250]].map(([x, y], i) => [C2.every + i * .03, x, y, false, 200]);
    subdiv(C2.every + .2, C2.end, 2).forEach((tt, i) => { const a = Math.PI * (-.3 + 1.6 * ((i * .618) % 1)), rr = 165 + R() * 70; wave.push([tt, 960 - Math.cos(a) * rr * 1.2, 330 + Math.sin(a) * rr * .75, true, 70]); });
    subdiv(C2.moreE, C2.every + .5, 2).forEach((tt, i, arr) => { wave.push([tt, 960 + (((i * .618) % 1) - .5) * 330, lerp(680, 360, i / arr.length) + (R() - .5) * 60, true, 80]); });
    wave.push([C2.every + .45, 846, 172, true, 60], [C2.every + .7, 1050, 150, true, 60]);
    const all = eT.map((tt, i) => [tt, null, null, false, 0, i]).concat(wave);
    all.forEach(([tt, wx, wy, ring, rb, ii], i) => {
      const u = ii != null ? ii / NE : 1;
      const r = rb ? rb + R() * 45 : 95 + R() * 85;
      let y = wy ?? lerp(1050, 70, Math.pow(u, .8)) + (R() - .5) * 120, x = wx ?? 90 + ((i * .618034) % 1) * 1740 + (R() - .5) * 60;
      if (!ring && Math.abs(x - 960) < 200 && y < 215) x = x < 960 ? 760 - R() * 140 : 1160 + R() * 140;
      const c1 = nextCol(), c2 = PAL2[(PAL2.indexOf(c1) + 3) % 6];
      add({ kind: 'p', t: tt, x, y, rot: (R() - .5) * 1.2, r, parts: mixParts(Math.floor(R() * 6), r, 64500000 + i * 13, c1, c2), pucker: false, beatScale: false });
    });
  }
  const c2Feet = (t) => {
    if (t < C2.just) return CUST.feet;
    const i0 = lastBeat(C2.just), i = lastBeat(t), n = Math.max(0, i - i0) + ease.out(beatPhase(t) * 2.2);
    const up = lerp(CUST.feet, FEET_END, clamp(n / 9));
    return lerp(up, CUST.feet, ease.inOut(inv(END.drift + .2, END.settle, t)));
  };
  let EYE2 = null;
  function drawGiantEye(g, t, lift) {
    const w = 1500, h = 700;
    let open = ease.back(inv(C2.truth - .05, C2.truth + .3, t));
    const bl = Math.abs(t - 201.9); if (bl < .14) open *= bl / .14;
    if (open < .12) { drawClosedLid(g, w, h, lift, 64600000); return; }
    if (!EYE2) EYE2 = { white: cutPath(almondPts(w, h, 22), 64600010, 40, 2), lid: cutPath(almondPts(w + 70, h + 80, 22), 64600011, 40, 2), ring: disk(h * .47, 64600012), iris: disk(h * .43, 64600013), pupil: disk(h * .2, 64600014), hi: disk(h * .07, 64600015) };
    const gx = kf(t, [[200.3, 0], [200.6, -60], [201.3, -60], [201.6, 120], [202.2, 0]]), gy = kf(t, [[200.3, 0], [200.6, 140], [201.3, 140], [201.6, 40], [202.2, 0]]);
    fillParts(g, [{ p: EYE2.lid, col: C.pink }], lift);
    g.save(); g.scale(1, open); g.clip(EYE2.white); g.scale(1, 1 / open); shadowOff(g); g.fillStyle = C.white; g.fill(EYE2.white);
    g.translate(gx, gy); fillParts(g, [{ p: EYE2.ring, col: C.black }, { p: EYE2.iris, col: C.cobalt }, { p: EYE2.pupil, col: C.black }], 1); g.fillStyle = C.white; g.translate(-h * .11, -h * .12); g.fill(EYE2.hi); g.restore();
    g.beginPath(); for (let i = 0; i <= 30; i++) { const u = i / 30; g.lineTo(lerp(-w / 2, w / 2, u), -Math.sin(u * Math.PI) * h / 2 * open); }
    g.lineWidth = 18; g.lineJoin = 'round'; g.strokeStyle = C.black; g.stroke();
  }
  function drawChorus2(g, t) {
    // the giants: each lands on its word and the one before slides out from under it
    const GS = CB.giants;
    for (let k = 0; k < GS.length; k++) {
      const G = GS[k], nx = GS[k + 1], st = slap(t, G.t); if (!st) continue;
      let dy = 0; if (nx) { const a = t - (nx.t + .1); if (a > .5) continue; if (a > 0) dy = 1300 * ease.in(a / .5); }
      if (t > END.drift) { const a = t - END.drift; if (a > 1.8) continue; dy = 1400 * ease.in(a / 1.8); }
      SOFT = true; const pul = 1 + .03 * beatPulse(t, 6);
      g.save(); g.translate(960, 470 + dy); g.rotate(st.r + (G.kind === 'star' || G.kind === 'sun' ? (t - G.t) * .05 : 0)); g.scale(st.s * st.sx * pul, st.s * st.sy * pul);
      if (G.kind === 'lips' && t > G.t + .3) { const bp = beatPulse(t, 7); g.scale(1 - .1 * bp, 1 + .08 * bp); }
      if (G.kind === 'eye') drawGiantEye(g, t, st.lift); else fillParts(g, G.parts, st.lift);
      g.restore();
    }
    // the pile, with his body under it and his head on top
    const raise = ease.back(inv(C2.moreE - .18, C2.moreE + .12, t)) * (1 - smooth(inv(220.6, 221.3, t)));
    const rc = react(t, [C2.stars, C2.sun, C2.truth, C2.love, C2.kisses, C2.spring, C2.moreE, C2.every]);
    const nodE = Math.sin(Math.PI * inv(END.nod, END.nod + .55, t)); const browE = Math.sin(Math.PI * inv(END.nod - .1, END.nod + .9, t)) * .7;
    const starU = inv(END.settle, END.starLand, t);
    const lookUp = t < C2.truth + .5 ? (t > C2.stars + .1 ? 1 : 0) * (1 - inv(C2.love - .5, C2.love, t)) : t > END.settle - .2 && t < END.starLand ? smooth(inv(END.settle - .2, END.settle + .3, t)) : 0;
    const S = { x: 960, fy: c2Feet(t), brow: Math.max(rc.brow, browE), nod: Math.max(rc.nod, nodE), lookUp, lookX: t > END.settle ? lerp(4, 0, starU) : Math.sin(t * .9) * 3,
      blink: blinkAt(t) && t < END.starLand, raise, raiseT: C2.moreE, armTop: t > C2.just + .5 && t < 221.3, bp: beatPulse(t, 8) * .025 * (t < 214 ? 1 : 0) };
    drawCustS(g, S, t, 'body');
    const settle = t > 214 ? clamp(1 - (t - 214) / 2) : 1; // band stops: the flutter dies away
    for (const p of P2) {
      let dx = 0, dy = 0, dr = 0;
      if (t > END.drift) { const s0 = END.drift + hash(p.seed + 9) * 1.5, a = t - s0; if (a > 1.4) continue; if (a > 0) { const k = ease.in(a / 1.4); dy = 1300 * k; dx = Math.sin(a * 3 + p.seed) * 60 * k; dr = (hash(p.seed + 3) - .5) * 2 * k; } }
      if (t < C2.more0 + .7 && p.t > t + .2) continue;
      g.save(); g.translate(dx, dy);
      if (dr) { g.translate(p.x, p.y); g.rotate(dr); g.translate(-p.x, -p.y); }
      if (p.kind === 'flower' || p.kind === 'spring') drawPiece(g, p, t);
      else {
        const st = slap(t, p.t); if (st) {
          SOFT = t - p.t < .6;
          const flut = beatPulse(t, 7) * .03 * (hash(p.seed) - .5) * settle;
          g.translate(p.x, p.y); g.rotate(p.rot + st.r + flut); g.scale(st.s * st.sx, st.s * st.sy);
          if (p.pucker && t > p.t + .3) { const bp = beatPulse(t, 7) * settle; g.scale(1 - .12 * bp, 1 + .09 * bp); }
          fillPartsB(g, p.parts, st.lift);
        }
      }
      g.restore();
    }
    drawCustS(g, S, t, 'top');
    // the last thing: one tiny star floats down onto his cap
    if (starU > 0) {
      const capY = S.fy - 404 - 106 + S.nod * 9, sx = lerp(1260, 958, starU) + Math.sin(starU * Math.PI * 3) * 110 * (1 - starU), sy = lerp(-60, capY, ease.inOut(starU) * .3 + starU * .7);
      if (!CB.tiny) CB.tiny = cutPath(starPts(22), 64700000, 30, .8);
      const sq = starU >= 1 ? 1 + .25 * Math.exp(-9 * (t - END.starLand)) * Math.cos((t - END.starLand) * 30) : 1;
      SOFT = true; g.save(); g.translate(sx, sy); g.rotate(starU < 1 ? Math.sin(starU * Math.PI * 3) * .7 : 0); g.scale(sq, 2 - sq); fillParts(g, [{ p: CB.tiny, col: C.lemon }], starU < 1 ? 3 : 1); g.restore();
    }
  }
  // breakdown-time leftovers from verse 3's "more": blown off as the first giant lands
  function drawVerseFillBlown(g, t) {
    const a = t - C2.more0; if (a > .7) return;
    for (const q of VB.fill) { const dx = q.x - 960, dy = q.y - 540, L = Math.hypot(dx, dy) || 1, d = 1900 * ease.in(a / .6); g.save(); g.translate(dx / L * d, dy / L * d); slapDraw(g, q, t, true, a * 3); g.restore(); }
  }

  // ---------- sheet + frame ----------
  let SHEET = null;
  function drawFrame(g, t) {
    if (t < TB) return drawChorus1Frame(g, t);
    K = g.canvas.width / 1920;
    g.fillStyle = C.ground; g.fillRect(0, 0, W, H);
    const energy = clamp(F('vocals', t) * .6 + F('drums', t) * .6);
    const push = (1.02 + .012 * Math.sin(t * .23)) * (1 + .01 * beatPulse(t, 7) * (.3 + energy * (t < 214 ? 1.2 : 0)));
    g.save(); g.translate(960, 540); g.scale(push, push); g.rotate(Math.sin(t * .7) * .003); g.translate(-960, -540);
    if (!SHEET) SHEET = cutPath([[52, 44], [1872, 30], [1880, 1046], [44, 1056]], 77, 60, 2.5);
    SOFT = true; fillParts(g, [{ p: SHEET, col: C.ultra }], 1.4);
    pinAt(g, 80, 70, C.lemon); pinAt(g, 1846, 58, C.verm); pinAt(g, 1852, 1020, C.lemon); pinAt(g, 74, 1028, C.pink);
    if (t < V.start) drawInstr(g, t);
    else if (t < C2.more0) drawVerse3(g, t);
    else { drawVerseFillBlown(g, t); drawChorus2(g, t); }
    g.restore();
    if (TEX) { g.globalCompositeOperation = 'overlay'; g.globalAlpha = .55; g.drawImage(TEX, 0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  }
  function drawChorus1Frame(g, t) {
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
  window.LOOK_READY = new Promise((res) => { makeTexture(); build(); buildScraps(); buildVerse3(); buildChorus2(); res(); });
})();
