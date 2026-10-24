// Look E: the boardroom art car on a Dali playa (2026-10-16). Full song, 0 credits, code-drawn.
// One continuous place: a flat endless playa with a low horizon, clear sky and long hard shadows, drawn through a
// pinhole camera (P) so nearly every change of shot is a camera move through the same world, not a cut.
// The art car: a boardroom table covers the whole car; the unseen driver sits in a hole in the middle; chairs on beams
// hang the suits in mid-air around it, propped on crutches. On the table: a speakerphone and a whiteboard that soften in
// the heat. The party's effigy is the Man; on the burn the charts catch fire, the board votes, the table rolls off.
// Everything is a pure function of song time t (render workers draw frames out of order).
  const out = document.getElementById('c'); out.width = W; out.height = H; const g0 = out.getContext('2d'); let g = g0;
  const CARC = mkCanvas(), gc = CARC.getContext('2d'), MASK = mkCanvas(), gm = MASK.getContext('2d'); // the car is drawn on its own layer so the burn's flames sit behind it

  // ---------- lyric cues ----------
  const L_ = (i) => LINES[i];
  const wt = (li, w) => { const x = LINES[li].words.find((k) => k.w.toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(w)); return x ? x.s : LINES[li].s; };
  const REFRAINS = [3, 10, 31]; // "they want to control the blues" (then news, grin, spin follow)
  const SPINS = [6, 13, 34].map((li) => [L_(li).s, L_(li).e]);

  // ---------- palette ----------
  const PAL = {
    skyTop: hex('#2d5fa8'), skyLow: hex('#bfd6e2'), dawnLow: hex('#f2cf9a'), duskTop: hex('#3a2f6b'), duskLow: hex('#e98a52'),
    groundFar: hex('#e2c48e'), groundNear: hex('#b9874c'), mahogany: '#5a2416', mahoganyLit: '#8a3b22', skirt: '#7a1420',
    suit: '#2a2a33', suitLit: '#454556', egg: '#f1e4cc', rosette: '#d0281f', crutch: '#c9a46a', wood: '#a8743e',
    elephant: '#8d8178', elephantLit: '#b9aca0',
  };

  // ---------- the car: path, spin ----------
  const TOP = 1.15, TD = 1.5, TL = 4.4; // table top height, half depth, half length (SEAT is in car.js)
  // after the vote (238) the table rolls off along a curve: right across the front of the burning Man, then away into the dark
  const EXIT = (() => { const K = [[284.8, 0], [296, 1.5], [308, 6], [320, 15], [330, 28], [338, 46], [344, 70], [348, 100], [351, 140], [353, 200]];
    const cr = (a, b, c, d, u) => .5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    const pts = [[284.8, 0]]; for (let i = 0; i < K.length - 1; i++) { const a = K[Math.max(0, i - 1)], b = K[i], c = K[i + 1], d = K[Math.min(K.length - 1, i + 2)];
      for (let j = 1; j <= 24; j++) { const u = j / 24; pts.push([cr(a[0], b[0], c[0], d[0], u), cr(a[1], b[1], c[1], d[1], u)]); } }
    const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, len }; })();
  const exitDist = (t) => { if (t < 238) return 0; const u = t - 238; return u < 5 ? .5 * u * u : 12.5 + 5 * (u - 5); }; // pulls away, then 5 m/s
  function exitAt(d) { const { pts, len } = EXIT; let i = 1; while (i < len.length - 1 && len[i] < d) i++; const u = clamp((d - len[i - 1]) / (len[i] - len[i - 1] || 1));
    return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; }
  function carX(t) { if (t < 200) return -40 + 1.6 * t; if (t < 206) { const u = t - 200; return 280 + 1.6 * (u - u * u / 12); } if (t < 238) return 284.8; return exitAt(exitDist(t))[0]; }
  function carZ(t) { if (t < 238) return 0; return exitAt(exitDist(t))[1]; }
  function yaw(t) { let a = 0; for (const [s, e] of SPINS) a += TAU * smooth((t - s - .3) / (e - s - .3)); if (t > 238) a += exitAt(exitDist(t))[2]; return a; } // the table turns along its path
  const MAN = { x: 300, z: 45 };

  // ---------- light: one arc, time never runs backwards ----------
  // dawn (0-26) low sun, a clear midday, the sun sinking from the verse-2 refrain, golden hour through the bridge and
  // refrain 3 (2:03-3:16), sunset with the golden-to-violet shift at 3:16-3:20, dusk, night burn.
  const keyed = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t < K[i][0]) return lerp(K[i - 1][1], K[i][1], (t - K[i - 1][0]) / (K[i][0] - K[i - 1][0])); return K[K.length - 1][1]; };
  const keyedCol = (K, t) => { if (t <= K[0][0]) return hex(K[0][1]); for (let i = 1; i < K.length; i++) if (t < K[i][0]) return mix(hex(K[i - 1][1]), hex(K[i][1]), smooth((t - K[i - 1][0]) / (K[i][0] - K[i - 1][0]))); return hex(K[K.length - 1][1]); };
  const SUN_EL = [[0, 8.5], [16, 11], [40, 27], [100, 28], [123, 23], [150, 16.5], [172, 11], [192, 5.6], [198, 2.4], [202, -1.2], [212, -8]]; // degrees
  const sunEl = (t) => keyed(SUN_EL, t);
  const goldAmt = (t) => keyed([[0, .14], [24, 0], [104, 0], [125, .1], [150, .24], [172, .38], [194, .52], [199, .4], [206, 0]], t);
  function sunDir(t) { const u = ease(t, 120, 198), x = lerp(.78, .52, u), z = lerp(-.62, -.854, u), n = Math.hypot(x, z); return [x / n, z / n]; } // shadow direction on the ground
  function sunVec(t) { // ground shadow offset per metre of height: long at dawn, short at noon, long again through golden hour
    const len = Math.min(6.3, 1 / Math.tan(Math.max(sunEl(t), 1) * Math.PI / 180)), d = sunDir(t);
    return [len * d[0], len * d[1]];
  }
  const shadowA = (t) => (.42 + .06 * goldAmt(t)) * clamp((sunEl(t) + .6) / 4);
  function shadowPt(X, Y, Z, sv) { return P(X + sv[0] * Y, 0, Z + sv[1] * Y); }
  function hull(ps) { ps = ps.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = [];
    for (const p of ps) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of ps.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1)); }
  function shadowOf(pts3, t) { const sv = sunVec(t), a = shadowA(t); if (a < .01) return; const ps = pts3.map(([X, Y, Z]) => shadowPt(X, Y, Z, sv)); if (!ok(ps)) return; poly(hull(ps), `rgba(52,34,58,${a})`); }
  // A stick's shadow is a flat strip on the playa: four ground corners, square ends. Draft 7 stroked it as a round-capped
  // screen line, which at a low camera stood up off the ground as a purple pill (1:20-1:56).
  function shadowStick(X, Y0, Y1, Z, w, t) { const sv = sunVec(t), a = shadowA(t); if (a < .01) return;
    const L = Math.hypot(sv[0], sv[1]) || 1, nx = -sv[1] / L * w / 2, nz = sv[0] / L * w / 2, x0 = X + sv[0] * Y0, z0 = Z + sv[1] * Y0, x1 = X + sv[0] * Y1, z1 = Z + sv[1] * Y1;
    const q = [P(x0 + nx, 0, z0 + nz), P(x1 + nx, 0, z1 + nz), P(x1 - nx, 0, z1 - nz), P(x0 - nx, 0, z0 - nz)];
    for (const p of q) if (p[2] < 1) return; // a corner behind or right under the lens
    poly(q, `rgba(52,34,58,${a})`); }

  // ---------- sky, ground ----------
  const SKY_TOP = [[0, '#24467e'], [26, '#2d5fa8'], [112, '#2d5fa8'], [150, '#3a62a0'], [188, '#4d5b90'], [196, '#4b4f8a'], [201, '#3a2f6b'], [212, '#23255a'], [222, '#11163a'], [240, '#0d1233']];
  const SKY_LOW = [[0, '#f2cf9a'], [10, '#f2cf9a'], [26, '#bfd6e2'], [112, '#c6d8de'], [140, '#e6d7b2'], [168, '#f2c98c'], [190, '#f5b46c'], [196, '#f2a35e'], [201, '#e98a52'], [210, '#c86e70'], [218, '#7a4a72'], [226, '#3a2d5c'], [240, '#2c2552']];
  function skyCols(t) { return [keyedCol(SKY_TOP, t), keyedCol(SKY_LOW, t)]; }
  function sunDisc(t, hy) { // the sun itself: off to the left by day, sliding into the left third as it sinks, set by 3:22
    const el = sunEl(t) * Math.PI / 180; if (el < -.035) return; const [dx, dz] = sunDir(t), ce = Math.cos(el), D = 1e4;
    const s = P(C.x - dx * ce * D, C.y + Math.sin(el) * D, C.z - dz * ce * D); if (s[2] < 1) return;
    // draft 9: a warm sun with a soft edge. The high midday disc (above about 17 degrees) is left out, only its glow
    // shows, so no pale ping-pong ball pops in at the top of a tilt (1:58); the disc comes back as it sinks.
    const warm = clamp(1 - (sunEl(t) - 4) / 18), col = mix(hex('#f3d58a'), hex('#ff9a52'), clamp(1 - (sunEl(t) - 1) / 9)), R = 700 + 300 * warm;
    if (s[0] < -R || s[0] > W + R || s[1] > hy + R * .4 || s[1] < -R) return;
    g.save(); g.globalCompositeOperation = 'screen';
    const ga = .16 + .3 * warm; const rg = g.createRadialGradient(s[0], s[1], 0, s[0], s[1], R); rg.addColorStop(0, rgb(col, ga)); rg.addColorStop(.25, rgb(col, ga * .45)); rg.addColorStop(1, rgb(col, 0));
    g.fillStyle = rg; g.fillRect(0, 0, W, Math.min(hy + 2, H));
    const vis = clamp((17 - sunEl(t)) / 5), r = 34 + 14 * warm;
    if (vis > 0) { g.globalCompositeOperation = 'source-over'; const core = mix(col, hex('#fbe7b4'), .3 * (1 - warm)), dg = g.createRadialGradient(s[0], s[1], 0, s[0], s[1], r * 1.5);
      dg.addColorStop(0, rgb(core, .95 * vis)); dg.addColorStop(.6, rgb(core, .9 * vis)); dg.addColorStop(.68, rgb(col, .45 * vis)); dg.addColorStop(1, rgb(col, 0));
      g.fillStyle = dg; g.fillRect(s[0] - r * 1.5, s[1] - r * 1.5, r * 3, r * 3); }
    g.restore();
  }
  function skyAndGround(t) {
    const hy = H / 2 - C.f * Math.tan(C.p), [top, low] = skyCols(t);
    if (hy > 0) {
      const sg = g.createLinearGradient(0, Math.min(hy - 900, 0), 0, hy); sg.addColorStop(0, rgb(top)); sg.addColorStop(.75, rgb(mix(top, low, .55))); sg.addColorStop(1, rgb(low));
      g.fillStyle = sg; g.fillRect(0, 0, W, Math.min(hy + 2, H));
      skyHaze(t, hy);
      sunDisc(t, hy);
      blind(t, hy);
      // far mountains: a pale low band on the horizon
      g.fillStyle = rgb(mix(low, hex('#8fa3b8'), .55), .9); g.beginPath(); g.moveTo(0, hy + 1);
      for (let x = 0; x <= W; x += 24) { const X = ((x - W / 2) / C.f + (C.yaw || 0)) * 2500 + C.x; const h = 26 + 22 * n1(41, X / 300) + 10 * n1(42, X / 90); g.lineTo(x, hy - Math.max(0, h) * C.f / 2500 * 1.4); }
      g.lineTo(W, hy + 1); g.fill();
    }
    if (hy < H) {
      const gg = g.createLinearGradient(0, Math.max(hy, 0), 0, H); gg.addColorStop(0, rgb(mix(PAL.groundFar, low, .35))); gg.addColorStop(.25, rgb(PAL.groundFar)); gg.addColorStop(1, rgb(PAL.groundNear));
      g.fillStyle = gg; g.fillRect(0, Math.max(hy, 0), W, H - Math.max(hy, 0));
      cracks();
      const ha = hazeAmt(t) + .6 * whiteoutAmt(t); if (ha > .005 && hy < H) { const y0 = Math.max(hy, -200), hg = g.createLinearGradient(0, y0, 0, y0 + 140); hg.addColorStop(0, `rgba(${DUST},${ha * .8})`); hg.addColorStop(1, `rgba(${DUST},0)`); g.fillStyle = hg; g.fillRect(0, y0, W, 140); } // dust lying on the far playa
    }
  }

  // ---------- dust (draft 9): a light tan haze in the afternoon sky, and one real whiteout in refrain 2 ----------
  // The playa scout: no dust weather anywhere in draft 7, and dust is the one thing every burner remembers. The haze
  // comes up after midday and is gone into the golden light. The whiteout is a tan wall, never near-white, that rolls in
  // from the horizon on "restrict" (it ramps over 1.7 s), swallows the city by "access", stands about 9 m off the lens
  // through "news" (so the press in front of it still reads) and clears before "grin". Things nearer than the wall are
  // drawn over it (it is a depth-sorted item, see dustInto); everything gets a thin veil of dust in grade().
  const DUST = '210,188,144'; // #d2bc90
  const hazeAmt = (t) => .2 * ease(t, 100, 132) * (1 - ease(t, 186, 200));
  const WO = (() => { const r = wt(11, 'restrict'), n = wt(11, 'news'), gr = wt(12, 'grin'); return { r, n, gr, full: r + 1.7, clear0: n + 1.5, clear1: gr - .4 }; })();
  function whiteoutAmt(t) { if (t < WO.r - .1 || t > WO.clear1) return 0; return .8 * ease(t, WO.r - .1, WO.full) * (1 - ease(t, WO.clear0, WO.clear1)); }
  const woDist = (t) => Math.exp(lerp(Math.log(320), Math.log(8.5), ease(t, WO.r - .1, WO.full + .6))); // metres from the lens to the wall's front
  function skyHaze(t, hy) { const a = hazeAmt(t) + .5 * whiteoutAmt(t); if (a <= .005) return;
    const hg = g.createLinearGradient(0, hy - 520, 0, hy); hg.addColorStop(0, `rgba(${DUST},${a * .3})`); hg.addColorStop(1, `rgba(${DUST},${a})`); g.fillStyle = hg; g.fillRect(0, 0, W, Math.min(hy + 2, H)); }
  function dustInto(t, list) { const a = whiteoutAmt(t); if (a <= .005) return; const d = woDist(t); list.push({ z: d, draw: () => dustWall(t, a, d) }); }
  function dustWall(t, a, d) { // a billowing tan curtain d metres ahead of the lens, from the playa up past the top of the frame
    const yAt = (Y) => { const dy = Y - C.y, z = -dy * SP + d * CP, y = dy * CP + d * SP; return z > .1 ? H / 2 - C.f * y / z : -1e5; };
    const base = Math.min(H + 20, yAt(0)), yw = C.yaw || 0; if (base < -50) return;
    g.save(); g.fillStyle = `rgba(${DUST},${a})`; g.beginPath(); g.moveTo(-20, base + 2);
    for (let x = -20; x <= W + 80; x += 40) { const wx = (x - W / 2) / C.f * d + yw * d, top = 30 + 14 * n1(77, wx / 26 + t * .45) + 7 * n1(78, wx / 8 - t * .8); g.lineTo(x, Math.min(base, yAt(top))); }
    g.lineTo(W + 80, base + 2); g.closePath(); g.fill(); g.clip();
    for (let i = 0; i < 5; i++) { const cx = W * (.1 + .2 * i) + 160 * n1(80 + i, t * .3), cy = Math.max(yAt(18 + 6 * n1(90 + i, t * .2)), -200), R = 520 + 160 * rnd(i, 81); // slow billows inside the cloud
      const bg = g.createRadialGradient(cx, cy, 0, cx, cy, R); bg.addColorStop(0, `rgba(184,156,108,${.3 * a})`); bg.addColorStop(1, 'rgba(184,156,108,0)'); g.fillStyle = bg; g.fillRect(cx - R, cy - R, 2 * R, 2 * R); }
    g.restore(); }
  function cracks() { // the playa's dried-mud polygons, fixed in the world so the car's motion reads against them
    const S = 3.2, x0 = Math.floor((C.x - 70) / S), x1 = Math.ceil((C.x + 70) / S), z0 = Math.floor((C.z + (C.sy ? -40 : 1.5)) / S), z1 = z0 + (C.sy ? 47 : 34);
    const pt = (i, j) => [i * S + (rnd(i, j, 1) - .5) * S * .7, 0, j * S + (rnd(i, j, 2) - .5) * S * .7];
    g.lineCap = 'round';
    for (let j = z1; j >= z0; j--) {
      const d = Math.max(1, Math.abs(j * S - C.z)); if (!C.sy && j * S - C.z < 1) continue; const a = clamp(1 - d / 100) * .5; g.strokeStyle = `rgba(110,72,40,${a})`;
      g.beginPath();
      for (let i = x0; i <= x1; i++) {
        const A = P(...pt(i, j)); if (A[2] < .3) continue; if (A[0] < -200 || A[0] > W + 200) continue;
        const B = P(...pt(i + 1, j)), Cc = P(...pt(i, j + 1)); // draft 9: skip a crack whose far end is behind the lens (the 1 px line at 3:33.0)
        if (B[2] > .3) { g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); } if (Cc[2] > .3) { g.moveTo(A[0], A[1]); g.lineTo(Cc[0], Cc[1]); }
      }
      g.lineWidth = clamp(C.f / d * .03, .6, 3); g.stroke();
    }
  }
// grade + vignette (moved from render.js for draft 3: the light arc lives here)
// ---------- grade ----------
// dusk is a blue-violet that still reads (draft 2 went mud-black by 3:28); night holds at a level a phone can see
const DUSK_MUL = [[196, '#ffffff'], [200, '#eedcee'], [206, '#ae9ecc'], [213, '#8a80bc'], [219, '#6c68aa'], [226, '#605ea0']];
const STARS = [...Array(240)].map((_, i) => { const az = (rnd(i, 1) - .5) * 2.6, el = .02 + Math.pow(rnd(i, 2), 1.4) * .9; return { d: [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)], b: .35 + .65 * rnd(i, 3), big: rnd(i, 4) > .9, i }; });
function grade(t, layer) {
  const gold = goldAmt(t), dusk = t > 196 ? keyedCol(DUSK_MUL, t) : null;
  const wo = whiteoutAmt(t); if (wo > 0) { g.fillStyle = `rgba(${DUST},${(layer ? .2 : .32) * wo})`; g.fillRect(0, 0, W, H); } // dust in the air, a lighter veil on the car (the press must read)
  if (gold > 0) { g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,170,90,${gold})`; g.fillRect(0, 0, W, H); }
  if (dusk) { g.globalCompositeOperation = 'multiply'; g.fillStyle = rgb(dusk); g.fillRect(0, 0, W, H); }
  g.globalCompositeOperation = 'source-over';
  const st = ease(t, 205, 221); if (st > 0 && !layer) { // stars fixed to the sky, so they turn with the camera; sized to survive a phone screen
    const hy = H / 2 - C.f * Math.tan(C.p);
    for (const s of STARS) { const p = P(C.x + s.d[0] * 1e4, C.y + s.d[1] * 1e4, C.z + s.d[2] * 1e4); if (p[2] < 1 || p[0] < 0 || p[0] > W || p[1] < 0 || p[1] > hy - 12) continue;
      const a = st * s.b * (.8 + .2 * Math.sin(t * 2.3 + s.i)); g.fillStyle = `rgba(255,248,230,${a})`; const r = s.big ? 4 : 3; g.fillRect(p[0] - r / 2, p[1] - r / 2, r, r);
      if (s.big) { g.fillStyle = `rgba(255,248,230,${a * .4})`; g.fillRect(p[0] - 6, p[1] - .5, 12, 1.5); g.fillRect(p[0] - .5, p[1] - 6, 1.5, 12); } }
  }
  const b = typeof fireGlow === 'function' ? fireGlow(t) : burnAmt(t); // the burn lights the whole playa, more with each refrain
  if (b > 0) { const { p, k } = manGeom(); if (p[2] > .5) { g.globalCompositeOperation = 'screen'; const R = Math.max(W * 1.15, 90 * k), cy = p[1] - 10 * k; const rg = g.createRadialGradient(p[0], cy, 0, p[0], cy, R); rg.addColorStop(0, `rgba(255,140,55,${.55 * b})`); rg.addColorStop(.45, `rgba(255,105,40,${.22 * b})`); rg.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; } }
}
function vignette() { const vg = g.createRadialGradient(W / 2, H * .55, H * .45, W / 2, H * .55, H * 1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,15,10,.36)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }

// ---------- draft 21: party attire for every generic burner (Robin: "all the people should be in some kind of costume
// or party attire if we see them as more than a figure in the distance") ----------
// One shared helper. burnerDress(seed) picks an outfit from a seeded random (so no two neighbours match and it never
// changes between frames); dressBack/dressFront draw it round a standing figure in screen pixels: feet at (x, y), k px
// per metre, G = the figure's proportions in metres { sh: shoulder height, hip, hd: head centre, hr: head radius, w:
// half shoulder width }. lw0 is one screen pixel in the drawing units (1 for screen space, 1/bmK inside bmBegin).
// Detail goes by size: under 12 px a metre only the colours and the big shapes (coat, tutu, headdress), patterns above.
// mono: a silhouette or a rim-light pass; every shape is drawn in that one colour so the costume reads as a shape.
let DRESS_T = 0; // the song time of the frame being drawn (render.js sets it), for the EL wire at night
const DRESS_NEON = ['#ff3fa4', '#39e6ff', '#b6ff3a', '#ffde2a', '#ff7a1a', '#a64dff', '#ff2f4f', '#2affb0'];
const DRESS_BRIGHT = ['#e8452f', '#2f6fb5', '#e8b23a', '#7a3c8c', '#3c8c5a', '#ee9a42', '#f4b0cf', '#47c1ba', '#9a68dc', '#f6efe0', '#1c1a1e'];
const DRESS_METAL = ['#e2c878', '#cfd3dc', '#e8a8cc', '#8fd8ec', '#d9a05a'];
const DRESS_FUR = ['#f6f0e2', '#f4b0cf', '#9a68dc', '#47c1ba', '#ee9a42', '#e0533a', '#1c1a1e', '#e3cb82', '#7fd04a'];
const DRESS_RAINBOW = ['#e8452f', '#ee9a42', '#e8d040', '#3c9c5a', '#2f6fb5', '#7a3c8c'];
function burnerDress(seed) {
  const R = mulberry(Math.floor(seed * 7919 + 104729)), pick = (a) => a[Math.floor(R() * a.length)];
  const top = pick(['fur', 'rainbow', 'sequin', 'neon', 'fur', 'paint', 'corset', 'sequin']);
  const col = top === 'fur' ? pick(DRESS_FUR) : top === 'sequin' ? pick(DRESS_METAL) : top === 'neon' ? pick(DRESS_NEON) : top === 'paint' ? pick(['#3fa0e0', '#e0e4ea', '#d04ab0', '#40c070', '#e8b23a']) : pick(DRESS_BRIGHT);
  return { top, col, col2: pick(DRESS_NEON), col3: pick(DRESS_BRIGHT), legs: pick(['fur', 'stripe', 'fur', 'neon', 'plain', 'stripe']), legc: pick(DRESS_FUR),
    tutu: top !== 'fur' && R() < .4, head: pick(['feathers', 'horns', 'tophat', 'flowers', 'fluff', 'ears', 'boppers', 'feathers', 'tophat', 'mohawk']), headc: pick(DRESS_NEON),
    goggles: R() < .6, lens: pick(['#f0b030', '#3fc0e0', '#c060e0', '#e05a3a', '#40e090']), wings: R() < .16, cape: R() < .18, parasol: R() < .1, el: pick(DRESS_NEON), seed };
}
function dressSeedOf(o, c) { if (o.seed != null) return o.seed; let h = 7; const s = String(c.body) + '|' + String(c.hatc) + '|' + (o.hat || 0) + (o.cape ? 'c' : ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003; return h; }
const DRESS_G = { sh: 1.5, hip: .8, hd: 1.69, hr: .13, w: .22 };
function dressBack(x, y, k, dr, mono, G, lw0) {
  G = G || DRESS_G; lw0 = lw0 || 1; const col = (c) => mono || c;
  if (dr.wings) { g.save(); g.globalAlpha *= mono ? 1 : .78; for (const s of [-1, 1]) { g.fillStyle = col(s < 0 ? '#e8d8fa' : '#cfe8fa'); g.beginPath(); g.ellipse(x + s * .3 * k, y - (G.sh - .12) * k, .2 * k, .44 * k, s * .55, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x + s * .26 * k, y - (G.sh - .6) * k, .14 * k, .26 * k, -s * .5, 0, TAU); g.fill(); } g.restore(); }
  if (dr.cape) { g.fillStyle = col(dr.col3); g.beginPath(); g.moveTo(x - G.w * k, y - (G.sh - .02) * k); g.lineTo(x + G.w * k, y - (G.sh - .02) * k); g.lineTo(x + .44 * k, y - .3 * k); g.quadraticCurveTo(x, y - .2 * k, x - .44 * k, y - .3 * k); g.closePath(); g.fill(); }
}
function dressFront(x, y, k, o, dr, mono, G, lw0, sit) {
  G = G || DRESS_G; lw0 = lw0 || 1; const kp = k / lw0, col = (c) => mono || c, det = kp >= 12, lw = (v) => Math.max(lw0, v * k), st = o.step || 0, hy = y - G.hd * k;
  g.lineCap = 'round'; g.lineJoin = 'round';
  // the legs: fur leg warmers, or striped / neon tights
  if (!sit) for (const s of [-1, 1]) { const fx = x + s * (.1 + st) * k, kx = x + s * .08 * k, a = [kx + (fx - kx) * .55, y - .38 * k], b = [fx, y - .04 * k];
    if (dr.legs === 'fur') { g.fillStyle = col(dr.legc); g.beginPath(); g.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, .12 * k, .22 * k, 0, 0, TAU); g.fill();
      if (det && !mono) { g.fillStyle = 'rgba(255,255,255,.28)'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc((a[0] + b[0]) / 2 - .07 * k + i * .045 * k, a[1] + (i % 2) * .1 * k + .05 * k, .035 * k, 0, TAU); g.fill(); } } }
    else if (dr.legs !== 'plain' && !mono) { const top = [kx, y - .82 * k]; g.lineWidth = lw(.12);
      if (dr.legs === 'neon') { g.strokeStyle = dr.col2; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(b[0], b[1]); g.stroke(); }
      else { for (let i = 0; i < 6; i++) { const u0 = i / 6, u1 = (i + 1) / 6; g.strokeStyle = DRESS_RAINBOW[(i + dr.seed) % 6]; g.beginPath(); g.moveTo(top[0] + (b[0] - top[0]) * u0, top[1] + (b[1] - top[1]) * u0); g.lineTo(top[0] + (b[0] - top[0]) * u1, top[1] + (b[1] - top[1]) * u1); g.stroke(); } } } }
  // the top
  const yS = y - G.sh * k, yH = y - G.hip * k, w = G.w * k;
  if (dr.top === 'fur') { g.fillStyle = col(dr.col); g.beginPath(); g.moveTo(x - (w + .05 * k), yS + .03 * k); g.lineTo(x - .36 * k, y - (sit ? .2 : .42) * k); g.lineTo(x + .36 * k, y - (sit ? .2 : .42) * k); g.lineTo(x + (w + .05 * k), yS + .03 * k); g.closePath(); g.fill();
    if (kp >= 8) { const n = det ? 9 : 5; for (let i = 0; i <= n; i++) { const u = i / n; for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * lerp(w + .05 * k, .36 * k, u), lerp(yS + .03 * k, y - (sit ? .2 : .42) * k, u), .06 * k, 0, TAU); g.fill(); } g.beginPath(); g.arc(x + lerp(-.36, .36, u) * k, y - (sit ? .2 : .42) * k, .06 * k, 0, TAU); g.fill(); } }
    g.fillStyle = col(dr.col === '#f6f0e2' ? dr.col3 : '#f6f0e2'); g.beginPath(); g.ellipse(x, yS + .04 * k, .2 * k, .07 * k, 0, 0, TAU); g.fill(); // the fluffy collar
    if (det && !mono) { g.fillStyle = dr.col2; g.fillRect(x - .04 * k, yS + .12 * k, .08 * k, (yH - yS) * .8); } }
  else if (!mono) { g.save(); g.beginPath(); g.moveTo(x - w * .95, yS); g.lineTo(x + w * .95, yS); g.lineTo(x + w * .85, yH); g.lineTo(x - w * .85, yH); g.closePath(); g.clip();
    if (dr.top === 'rainbow') DRESS_RAINBOW.forEach((c, i) => { g.fillStyle = c; g.fillRect(x - w, yS + (yH - yS) * i / 6, 2 * w, (yH - yS) / 6 + 1); });
    else { g.fillStyle = dr.col; g.fillRect(x - w, yS, 2 * w, yH - yS);
      if (dr.top === 'neon') { g.strokeStyle = dr.col2 === dr.col ? '#f6efe0' : dr.col2; g.lineWidth = lw(.08); g.beginPath(); g.moveTo(x - w, yS); g.lineTo(x + w, yH); g.stroke(); }
      if (det && (dr.top === 'sequin' || dr.top === 'paint')) { g.fillStyle = dr.top === 'paint' ? 'rgba(255,255,255,.85)' : 'rgba(255,255,250,.75)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(x - w + rnd(dr.seed, i, 3) * 2 * w, yS + rnd(dr.seed, i, 4) * (yH - yS), (dr.top === 'paint' ? .03 : .018) * k, 0, TAU); g.fill(); } }
      if (dr.top === 'corset') { g.strokeStyle = dr.col2; g.lineWidth = lw(.015); g.beginPath(); for (let i = 0; i < 5; i++) { const yy = yS + (yH - yS) * (.15 + i * .17); g.moveTo(x - .05 * k, yy); g.lineTo(x + .05 * k, yy + .08 * k); g.moveTo(x + .05 * k, yy); g.lineTo(x - .05 * k, yy + .08 * k); } g.stroke(); } }
    g.restore(); }
  if (dr.tutu) { const ty = yH + .02 * k; g.fillStyle = col(dr.col2); g.beginPath(); g.ellipse(x, ty, .38 * k, .11 * k, 0, 0, TAU); g.fill(); if (!mono) { g.fillStyle = dr.col3; g.beginPath(); g.ellipse(x, ty - .04 * k, .3 * k, .07 * k, 0, 0, TAU); g.fill(); }
    if (det) { g.strokeStyle = col('rgba(255,255,255,.55)'); g.lineWidth = lw(.01); g.beginPath(); for (let i = -5; i <= 5; i++) { g.moveTo(x + i * .06 * k, ty - .06 * k); g.lineTo(x + i * .075 * k, ty + .1 * k); } g.stroke(); } }
  // the head
  const hr = G.hr * k, hc = col(dr.headc);
  if (dr.head === 'feathers') { for (let i = -3; i <= 3; i++) { const a = i * .28; g.fillStyle = mono || DRESS_NEON[(i + 3 + dr.seed) % 8]; g.beginPath(); g.ellipse(x + Math.sin(a) * .26 * k, hy - .12 * k - Math.cos(a) * .24 * k, .05 * k, .2 * k, a, 0, TAU); g.fill(); } g.fillStyle = col('#e8c04a'); g.fillRect(x - hr, hy - .1 * k, 2 * hr, .05 * k); }
  else if (dr.head === 'horns') { g.strokeStyle = col('#e8dcc0'); g.lineWidth = lw(.05); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * .07 * k, hy - .1 * k); g.quadraticCurveTo(x + s * .3 * k, hy - .18 * k, x + s * .24 * k, hy - .38 * k); g.stroke(); } }
  else if (dr.head === 'tophat') { g.fillStyle = col('#1c1a1e'); g.fillRect(x - .1 * k, hy - .44 * k, .2 * k, .32 * k); g.fillRect(x - .18 * k, hy - .14 * k, .36 * k, .05 * k); g.fillStyle = hc; g.fillRect(x - .1 * k, hy - .2 * k, .2 * k, .05 * k); if (det && !mono) { g.fillStyle = dr.col2; g.beginPath(); g.ellipse(x + .12 * k, hy - .34 * k, .03 * k, .12 * k, .4, 0, TAU); g.fill(); } }
  else if (dr.head === 'flowers') { for (let i = 0; i < 7; i++) { const a = Math.PI + i / 6 * Math.PI; g.fillStyle = mono || DRESS_NEON[(i + dr.seed) % 8]; g.beginPath(); g.arc(x + Math.cos(a) * hr * 1.05, hy + Math.sin(a) * hr * .9 - .02 * k, .045 * k, 0, TAU); g.fill(); } }
  else if (dr.head === 'fluff') { g.fillStyle = hc; g.beginPath(); g.ellipse(x, hy - .1 * k, .18 * k, .13 * k, 0, 0, TAU); g.fill(); }
  else if (dr.head === 'ears') { g.fillStyle = hc; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x + s * .07 * k, hy - .3 * k, .04 * k, .16 * k, s * .2, 0, TAU); g.fill(); } }
  else if (dr.head === 'boppers') { g.strokeStyle = col('#2a2420'); g.lineWidth = lw(.015); for (const s of [-1, 1]) { const tx = x + s * .13 * k, ty = hy - .4 * k; g.beginPath(); g.moveTo(x + s * .04 * k, hy - .12 * k); g.lineTo(tx, ty); g.stroke(); g.fillStyle = hc; g.beginPath(); g.arc(tx, ty, .05 * k, 0, TAU); g.fill(); } }
  else if (dr.head === 'mohawk') { g.fillStyle = hc; g.beginPath(); g.moveTo(x - .09 * k, hy - .08 * k); for (let i = 0; i <= 4; i++) g.lineTo(x - .09 * k + i * .045 * k, hy - (i % 2 ? .2 : .32) * k); g.lineTo(x + .09 * k, hy - .08 * k); g.closePath(); g.fill(); }
  if (dr.goggles && kp >= 8) { g.fillStyle = col('#2a2420'); g.fillRect(x - hr, hy - .03 * k, 2 * hr, .045 * k); if (!mono) { g.fillStyle = dr.lens; g.beginPath(); g.arc(x - .045 * k, hy - .01 * k, .035 * k, 0, TAU); g.arc(x + .045 * k, hy - .01 * k, .035 * k, 0, TAU); g.fill(); } }
  if (dr.parasol) { const hx = x + .32 * k, top = y - (G.sh + .85) * k; g.strokeStyle = col('#3a3028'); g.lineWidth = lw(.025); g.beginPath(); g.moveTo(hx, y - (G.sh - .55) * k); g.lineTo(hx, top); g.stroke();
    for (let i = 0; i < 6; i++) { g.fillStyle = mono || (i % 2 ? '#f6efe0' : dr.col2); g.beginPath(); g.moveTo(hx, top - .2 * k); g.lineTo(hx - .55 * k + i * .1833 * k, top + .08 * k); g.lineTo(hx - .55 * k + (i + 1) * .1833 * k, top + .08 * k); g.closePath(); g.fill(); } }
  // EL wire after dusk: a thin glowing line round the outfit
  const nt = typeof nightAmt === 'function' ? nightAmt(DRESS_T) : 0;
  if (nt > .15 && !mono && kp >= 6) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = dr.el; g.globalAlpha *= .85 * nt; g.lineWidth = lw(.03);
    g.beginPath(); g.moveTo(x - w, yS); g.lineTo(x - w * .85, yH); g.lineTo(x + w * .85, yH); g.lineTo(x + w, yS); g.closePath(); if (!sit) { g.moveTo(x - .08 * k, yH); g.lineTo(x - (.1 + st) * k, y - .05 * k); g.moveTo(x + .08 * k, yH); g.lineTo(x + (.1 + st) * k, y - .05 * k); } g.stroke(); g.restore(); }
}
