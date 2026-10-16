// Look E: the boardroom art car on a Dali playa (2026-10-16). Full song, 0 credits, code-drawn.
// One continuous place: a flat endless playa with a low horizon, clear sky and long hard shadows, drawn through a
// pinhole camera (P) so nearly every change of shot is a camera move through the same world, not a cut.
// The art car: a boardroom table covers the whole car; the unseen driver sits in a hole in the middle; chairs on beams
// hang the suits in mid-air around it, propped on crutches. On the table: a speakerphone and a whiteboard that soften in
// the heat. The party's effigy is the Man; on the burn the charts catch fire, the board votes, the table rolls off.
// Everything is a pure function of song time t (render workers draw frames out of order).
(() => {
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
  const TOP = 1.15, TD = 1.5, TL = 4.4, SEAT = .65; // seats low enough to hop on and off (Robin)
  function carX(t) { if (t < 200) return -40 + 1.6 * t; if (t < 206) { const u = t - 200; return 280 + 1.6 * (u - u * u / 12); } if (t < 238) return 284.8; const u = t - 238; return 284.8 + .22 * u * u; }
  function carZ(t) { if (t < 238) return 0; const u = t - 238; return .3 * u * u; }
  function yaw(t) { let a = 0; for (const [s, e] of SPINS) a += TAU * smooth((t - s - .3) / (e - s - .3)); return a; }
  const MAN = { x: 300, z: 45 };

  // ---------- camera: shots as offsets from the car; each entry moves there over dur, then holds ----------
  // [t, dur, ox, oy, oz, pitch, f]
  const WIDE = [0, 1.6, -60, -.12, 1400], MED = [-.5, 2.3, -11.5, .08, 1300], SKY = [0, 1.4, -15, -.36, 1100];
  const SPK = [1.2, 2.75, -3.3, .62, 1400], DRW = [-.8, 1.8, -1.6, .1, 1500], HEADS = [-.8, 1.95, -.4, .12, 1150];
  const HIGH = [0, 9, -24, .34, 1300], LOW = [0, 1.3, -24, -.1, 1250], WB = [3.2, 2.1, -1.6, 0, 1400], WBM = [2.6, 2.1, -4.2, .04, 1350];
  const HOLE = [-.12, 2.05, -4.2, .13, 1500], TOPDOWN = [0, 8.5, -3.2, 1.15, 1250], DUSK = [6, 1.6, -40, -.13, 1300];
  const SH = [
    [0, 0, ...WIDE],
    [15.0, 1.9, ...MED],
    [L_(1).s - .7, .8, ...SPK],
    [L_(2).s - .5, .7, ...DRW],
    [L_(3).s - .4, .9, ...SKY],
    [L_(4).s - .3, .6, ...MED],
    [L_(5).s - .3, .7, ...HEADS],
    [L_(6).s - .3, 1.0, ...HIGH],
    [60.6, 2.6, ...LOW],
    [72.0, 2.5, ...WB],
    [L_(8).s - .4, .7, 1.2, 2.0, -4.0, .25, 1400],
    [L_(9).s - .2, .7, 0, 4, -10, .32, 1300],
    [wt(9, 'build') - .2, 1.6, ...LOW],
    [L_(10).s - .2, .8, ...SKY],
    [L_(11).s - .3, .6, ...MED],
    [L_(12).s - .3, .7, ...HEADS],
    [L_(13).s - .3, 1.0, ...HIGH],
    [117.2, 2.5, ...LOW],
    [L_(14).s - .3, .5, ...MED],
    [L_(15).s - .25, .45, -1.5, 2.7, -3.4, .6, 1400],
    [L_(17).s - .3, .5, 0, 1.5, -21, -.1, 1300],
    [L_(19).s + .8, .5, ...DRW],
    [L_(21).s - .25, .45, ...WBM],
    [L_(22).s - .25, .45, -2, 2.2, -11, .04, 1250],
    [L_(23).s - .25, .45, -.15, 2.9, -3.4, .55, 1400],
    [L_(24).s - .2, .45, ...HOLE],
    [L_(25).s - .2, .45, -1.5, 2.7, -3.1, .6, 1400],
    [L_(26).s - .3, .5, ...TOPDOWN],
    [L_(28).s - .3, .6, -1, 1.8, -13, -.02, 1300],
    [L_(29).s - .3, .8, ...HIGH],
    [L_(30).s - .3, .6, ...HEADS],
    [L_(31).s - .3, .9, ...SKY],
    [L_(32).s - .3, .6, ...MED],
    [L_(33).s - .3, .7, ...HEADS],
    [L_(34).s - .3, 1.0, ...HIGH],
    [196, 5, ...DUSK],
    [L_(35).s - .6, 1.0, ...WBM],
    [L_(35).e + .3, 1.6, ...DUSK],
    [L_(36).s - .3, 1.0, -1, 2.3, -9.5, .1, 1250],
    [L_(36).e + .2, 2.0, 6, 1.8, -40, -.13, 1300],
  ];
  function camAt(t) {
    let i = 0; while (i + 1 < SH.length && SH[i + 1][0] <= t) i++;
    const e = SH[i], p = SH[Math.max(0, i - 1)], u = e[1] > 0 ? smooth((t - e[0]) / e[1]) : 1;
    const v = [2, 3, 4, 5, 6].map((k) => lerp(p[k], e[k], u));
    const follow = carX(clamp(t, 14, 238));
    return { x: follow + v[0] + .25 * Math.sin(t * .23), y: v[1] + .05 * Math.sin(t * .31), z: v[2], p: v[3], f: v[4] };
  }

  // ---------- projection ----------
  let C, CX, CZ, YAW, CP, SP;
  function P(X, Y, Z) { const dx = X - C.x, dy = Y - C.y, dz = Z - C.z; const z = -dy * SP + dz * CP, y = dy * CP + dz * SP; return [W / 2 + C.f * dx / z, H / 2 - C.f * y / z, z]; }
  function Lw(x, y, z) { const c = Math.cos(YAW), s = Math.sin(YAW); return [CX + x * c - z * s, y, CZ + x * s + z * c]; }
  const PL = (x, y, z) => { const w = Lw(x, y, z); return P(w[0], w[1], w[2]); };
  const ok = (pts) => pts.every((p) => p[2] > .08);
  function poly(pts, fill, stroke, lw) { if (!ok(pts)) return; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1; g.stroke(); } }
  function seg(a, b, w, col) { if (a[2] < .08 || b[2] < .08) return; g.strokeStyle = col; g.lineWidth = Math.max(1, w); g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); }
  const kAt = (p) => C.f / p[2]; // px per metre at that depth

  // ---------- light ----------
  function sunVec(t) { // ground shadow offset per metre of height: long, toward the viewer and right
    const len = t < 16 ? 4.5 : t < 30 ? lerp(4.5, 1.9, (t - 16) / 14) : t < 170 ? 1.9 : t < 205 ? lerp(1.9, 5.5, (t - 170) / 35) : 5.5;
    return [len * .78, -len * .62];
  }
  const shadowA = (t) => (1 - ease(t, 204, 214)) * .42;
  function shadowPt(X, Y, Z, sv) { return P(X + sv[0] * Y, 0, Z + sv[1] * Y); }
  function hull(ps) { ps = ps.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); const lo = [], up = [];
    for (const p of ps) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of ps.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1)); }
  function shadowOf(pts3, t) { const sv = sunVec(t), a = shadowA(t); if (a < .01) return; const ps = pts3.map(([X, Y, Z]) => shadowPt(X, Y, Z, sv)); if (!ok(ps)) return; poly(hull(ps), `rgba(52,34,58,${a})`); }
  function shadowStick(X, Y0, Y1, Z, w, t) { const sv = sunVec(t), a = shadowA(t); if (a < .01) return; const p = shadowPt(X, Y0, Z, sv), q = shadowPt(X, Y1, Z, sv); seg(p, q, w * kAt(p), `rgba(52,34,58,${a})`); }

  // ---------- sky, ground ----------
  function skyCols(t) {
    const dawn = 1 - ease(t, 10, 26), dusk = ease(t, 196, 214);
    let top = mix(PAL.skyTop, hex('#24467e'), dawn * .5), low = mix(PAL.skyLow, PAL.dawnLow, dawn);
    const gold = ease(t, 170, 200) * (1 - dusk); low = mix(low, hex('#f0c98a'), gold * .7);
    top = mix(top, PAL.duskTop, dusk); low = mix(low, PAL.duskLow, dusk);
    return [top, low];
  }
  function skyAndGround(t) {
    const hy = H / 2 - C.f * Math.tan(C.p), [top, low] = skyCols(t);
    if (hy > 0) {
      const sg = g.createLinearGradient(0, Math.min(hy - 900, 0), 0, hy); sg.addColorStop(0, rgb(top)); sg.addColorStop(.75, rgb(mix(top, low, .55))); sg.addColorStop(1, rgb(low));
      g.fillStyle = sg; g.fillRect(0, 0, W, Math.min(hy + 2, H));
      blind(t, hy);
      // far mountains: a pale low band on the horizon
      g.fillStyle = rgb(mix(low, hex('#8fa3b8'), .55), .9); g.beginPath(); g.moveTo(0, hy + 1);
      for (let x = 0; x <= W; x += 24) { const X = (x - W / 2) * 2500 / C.f + C.x; const h = 26 + 22 * n1(41, X / 300) + 10 * n1(42, X / 90); g.lineTo(x, hy - Math.max(0, h) * C.f / 2500 * 1.4); }
      g.lineTo(W, hy + 1); g.fill();
    }
    if (hy < H) {
      const gg = g.createLinearGradient(0, Math.max(hy, 0), 0, H); gg.addColorStop(0, rgb(mix(PAL.groundFar, low, .35))); gg.addColorStop(.25, rgb(PAL.groundFar)); gg.addColorStop(1, rgb(PAL.groundNear));
      g.fillStyle = gg; g.fillRect(0, Math.max(hy, 0), W, H - Math.max(hy, 0));
      cracks();
    }
  }
  function cracks() { // the playa's dried-mud polygons, fixed in the world so the car's motion reads against them
    const S = 3.2, x0 = Math.floor((C.x - 70) / S), x1 = Math.ceil((C.x + 70) / S), z0 = Math.floor((C.z + 1.5) / S), z1 = z0 + 34;
    const pt = (i, j) => [i * S + (rnd(i, j, 1) - .5) * S * .7, 0, j * S + (rnd(i, j, 2) - .5) * S * .7];
    g.lineCap = 'round';
    for (let j = z1; j >= z0; j--) {
      const d = j * S - C.z; if (d < 1) continue; const a = clamp(1 - d / 100) * .5; g.strokeStyle = `rgba(110,72,40,${a})`;
      g.beginPath();
      for (let i = x0; i <= x1; i++) {
        const A = P(...pt(i, j)); if (A[2] < .3) continue; if (A[0] < -200 || A[0] > W + 200) continue;
        const B = P(...pt(i + 1, j)), Cc = P(...pt(i, j + 1));
        g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.moveTo(A[0], A[1]); g.lineTo(Cc[0], Cc[1]);
      }
      g.lineWidth = clamp(C.f / d * .03, .6, 3); g.stroke();
    }
  }
  function blind(t, hy) { // "they want to control the blues": a beige blind rolls down over the blue sky, then snaps back up
    let u = 0; for (const li of REFRAINS) { const c = wt(li, 'control'); u = Math.max(u, ease(t, c - .2, c + .9) * (1 - ease(t, L_(li).e + .1, L_(li).e + .6))); }
    if (u <= 0) return; const y = (hy + 8) * u;
    g.fillStyle = '#cdbf9f'; g.fillRect(0, 0, W, y);
    g.fillStyle = 'rgba(120,95,60,.18)'; for (let x = 0; x < W; x += 90) g.fillRect(x, 0, 2, y);
    const rg = g.createLinearGradient(0, y - 14, 0, y + 10); rg.addColorStop(0, '#6d5a3a'); rg.addColorStop(.5, '#c8a970'); rg.addColorStop(1, '#4b3b25'); g.fillStyle = rg; g.fillRect(0, y - 12, W, 22);
    g.strokeStyle = '#5a4a32'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * .62, y + 10); g.lineTo(W * .62, y + 120); g.stroke();
    g.beginPath(); g.arc(W * .62, y + 134, 14, 0, TAU); g.stroke();
  }

  // ---------- figures ----------
  function egg(x, y, k, front, grin) { // the party's faceless egg head
    const rx = .125 * k, ry = .155 * k, eg = g.createRadialGradient(x - rx * .4, y - ry * .45, rx * .1, x, y, ry * 1.2);
    eg.addColorStop(0, '#fffaf0'); eg.addColorStop(.55, PAL.egg); eg.addColorStop(1, '#b49a7c');
    g.fillStyle = eg; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill();
    if (front && grin > 0) { // a grin and nothing else
      g.save(); g.globalAlpha = grin; g.fillStyle = '#2b1c18'; g.beginPath(); g.ellipse(x, y + ry * .3, rx * .62, ry * .28, 0, 0, Math.PI); g.closePath(); g.fill();
      g.fillStyle = '#fbf3e3'; g.beginPath(); g.ellipse(x, y + ry * .3, rx * .55, ry * .1, 0, 0, Math.PI); g.closePath(); g.fill(); g.restore();
    }
  }
  function rosette(x, y, r) {
    g.fillStyle = PAL.rosette; g.beginPath(); g.moveTo(x - r * .4, y); g.lineTo(x - r * .7, y + r * 2.3); g.lineTo(x - r * .2, y + r * 2); g.lineTo(x, y); g.fill();
    g.beginPath(); g.moveTo(x + r * .2, y); g.lineTo(x + r * .3, y + r * 2.4); g.lineTo(x + r * .75, y + r * 2.1); g.lineTo(x + r * .5, y); g.fill();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.arc(x + Math.cos(a) * r * .75, y + Math.sin(a) * r * .75, r * .38, 0, TAU); g.fill(); }
    g.fillStyle = '#f6d8a0'; g.beginPath(); g.arc(x, y, r * .42, 0, TAU); g.fill();
  }
  function arm(sx, sy, hx, hy, k, col) { g.strokeStyle = col; g.lineWidth = .1 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + hx) / 2 + (hx > sx ? -1 : 1) * .03 * k, (sy + hy) / 2 + .05 * k, hx, hy); g.stroke(); g.fillStyle = PAL.egg; g.beginPath(); g.arc(hx, hy, .045 * k, 0, TAU); g.fill(); }
  // A seated suit. (x, y) = screen point of the seat; k = px per metre.
  // o: front, grin, arms ('rest'|'vote2'|'gavel'|'vogue'|'shrug'), lift, drawer (0..1), nod.
  function suit(x, y, k, o) {
    const front = o.front, nod = (o.nod || 0) * .035 * k;
    const chairBack = () => { g.fillStyle = PAL.wood; g.fillRect(x - .27 * k, y - .66 * k, .54 * k, .08 * k); g.fillRect(x - .25 * k, y - .62 * k, .05 * k, .62 * k); g.fillRect(x + .2 * k, y - .62 * k, .05 * k, .62 * k); };
    if (front) chairBack();
    g.fillStyle = '#5c3a1c'; g.fillRect(x - .28 * k, y - .02 * k, .56 * k, .06 * k); // seat
    // legs dangling in mid-air
    g.fillStyle = PAL.suit; const sw = Math.sin(o.swing || 0) * .03 * k;
    g.fillRect(x - .19 * k, y - .03 * k, .17 * k, .14 * k); g.fillRect(x + .02 * k, y - .03 * k, .17 * k, .14 * k);
    g.fillRect(x - .17 * k + sw, y + .1 * k, .13 * k, .36 * k); g.fillRect(x + .04 * k - sw, y + .1 * k, .13 * k, .36 * k);
    g.fillStyle = '#141216'; g.beginPath(); g.ellipse(x - .11 * k + sw, y + .48 * k, .09 * k, .045 * k, 0, 0, TAU); g.ellipse(x + .11 * k - sw, y + .48 * k, .09 * k, .045 * k, 0, 0, TAU); g.fill();
    // torso
    const ty = y - .02 * k, sh = y - .62 * k;
    const jg = g.createLinearGradient(x - .26 * k, 0, x + .26 * k, 0); jg.addColorStop(0, PAL.suitLit); jg.addColorStop(1, PAL.suit);
    g.fillStyle = jg; g.beginPath(); g.moveTo(x - .2 * k, ty); g.lineTo(x - .27 * k, sh + .05 * k); g.quadraticCurveTo(x - .25 * k, sh, x - .16 * k, sh - .02 * k); g.lineTo(x + .16 * k, sh - .02 * k); g.quadraticCurveTo(x + .25 * k, sh, x + .27 * k, sh + .05 * k); g.lineTo(x + .2 * k, ty); g.closePath(); g.fill();
    if (front) {
      g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(x - .08 * k, sh - .01 * k); g.lineTo(x, sh + .3 * k); g.lineTo(x + .08 * k, sh - .01 * k); g.fill();
      g.fillStyle = '#8f1d1d'; g.beginPath(); g.moveTo(x - .02 * k, sh + .03 * k); g.lineTo(x + .02 * k, sh + .03 * k); g.lineTo(x + .03 * k, sh + .25 * k); g.lineTo(x, sh + .29 * k); g.lineTo(x - .03 * k, sh + .25 * k); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = .012 * k; g.beginPath(); g.moveTo(x - .08 * k, sh); g.lineTo(x - .02 * k, sh + .36 * k); g.moveTo(x + .08 * k, sh); g.lineTo(x + .02 * k, sh + .36 * k); g.stroke();
      if (o.drawer != null) drawers(x, sh, k, o.drawer);
      else rosette(x - .15 * k, sh + .12 * k, .035 * k);
    } else { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .012 * k; g.beginPath(); g.moveTo(x, sh + .05 * k); g.lineTo(x, ty); g.stroke(); chairBack(); }
    // arms
    const L = [x - .24 * k, sh + .06 * k], R = [x + .24 * k, sh + .06 * k], lift = o.lift || 0, a = o.arms || 'rest';
    let hl = [x - .2 * k, y - .12 * k], hr = [x + .2 * k, y - .12 * k];
    if (a === 'vote2') { hr = [x + lerp(.2, .32, lift) * k, lerp(y - .12 * k, sh - .62 * k, lift)]; hl = [x - lerp(.2, .32, lift) * k, lerp(y - .12 * k, sh - .62 * k, lift)]; }
    if (a === 'gavel') hr = [x + .34 * k, lerp(sh + .1 * k, sh - .45 * k, lift)];
    if (a === 'vogue') { hr = [x + .05 * k, sh - .28 * k]; hl = [x - .34 * k, lerp(y - .12 * k, sh - .25 * k, lift)]; }
    if (a === 'shrug') { hl = [x - .36 * k, sh + .02 * k - lift * .1 * k]; hr = [x + .36 * k, sh + .02 * k - lift * .1 * k]; }
    if (front || a !== 'rest') { arm(...L, ...hl, k, front ? PAL.suitLit : PAL.suit); arm(...R, ...hr, k, PAL.suit); } // from behind, resting hands are out of sight on the table
    if (a === 'gavel') { g.save(); g.translate(hr[0], hr[1]); g.rotate(-.5 + lift * .9); g.fillStyle = '#4a2a14'; g.fillRect(-.015 * k, -.25 * k, .03 * k, .27 * k); g.fillRect(-.09 * k, -.32 * k, .18 * k, .08 * k); g.restore(); }
    // neck + head
    g.fillStyle = '#d7c3a3'; g.fillRect(x - .04 * k, sh - .07 * k, .08 * k, .08 * k);
    egg(x, sh - .19 * k + nod, k, front, o.grin || 0);
  }
  function drawers(x, sh, k, open) { // a torso of drawers: the middle one slides out toward us
    for (let i = 0; i < 3; i++) {
      const dy = sh + (.1 + i * .14) * k, dw = .26 * k, dh = .1 * k, o = i === 1 ? open : 0;
      g.fillStyle = '#7b5530'; g.fillRect(x - dw / 2, dy, dw, dh); g.strokeStyle = '#3a2412'; g.lineWidth = .01 * k; g.strokeRect(x - dw / 2, dy, dw, dh);
      if (o > 0) { const d = o * .16 * k; g.fillStyle = '#2a1608'; g.fillRect(x - dw / 2, dy, dw, dh); g.fillStyle = '#a77a48'; g.beginPath(); g.moveTo(x - dw / 2, dy + dh); g.lineTo(x - dw / 2 - d * .3, dy + dh + d); g.lineTo(x + dw / 2 + d * .3, dy + dh + d); g.lineTo(x + dw / 2, dy + dh); g.fill();
        g.fillStyle = '#8c6338'; g.fillRect(x - dw / 2 - d * .3, dy + dh + d - .01 * k, dw + d * .6, dh * .9); g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(x, dy + dh + d + dh * .4, .014 * k, 0, TAU); g.fill(); }
      else { g.fillStyle = '#d9b45a'; g.beginPath(); g.arc(x, dy + dh / 2, .014 * k, 0, TAU); g.fill(); }
    }
  }

  // ---------- the table car ----------
  const SEATS = [ // local x, z, faces camera at yaw 0, role
    ...[-3.6, -2.25, -.8, .55, 1.9, 3.25].map((x) => ({ x, z: 2.3, r: x === -.8 ? 'drawer' : 'b' })),
    ...[-3.6, -2.25, -.8, .55, 1.9, 3.25].map((x) => ({ x, z: -2.3, r: 'f' })),
    { x: -5.15, z: 0, r: 'chair' }, { x: 5.15, z: 0, r: 'end' },
  ];
  function seatState(s, t, i) {
    const o = { arms: 'rest', grin: 0, nod: Math.sin(t * 1.3 + i * 1.7) * .3, swing: t * 2 + i };
    o.front = (s.r === 'chair' || s.r === 'end') ? 1 : (Math.cos(YAW) * Math.sign(s.z) > 0 ? 1 : 0); // as the table spins, who faces us flips
    for (const li of [5, 12, 33]) { const gr = wt(li, 'grin'); o.grin = Math.max(o.grin, ease(t, gr - .1, gr + .4) * (1 - ease(t, L_(li).e + 1, L_(li).e + 1.6))); }
    if (s.r === 'chair') { const law = wt(0, 'law'); if (t > law - 1.2 && t < law + 1.2) { o.arms = 'gavel'; o.lift = t < law ? ease(t, law - 1.1, law - .3) : 0; } }
    if (s.r === 'drawer') o.drawer = Math.max(ease(t, L_(2).s, L_(2).s + .6) * (1 - ease(t, L_(2).e - .2, L_(2).e + .3)), ease(t, wt(19, 'put') - .1, wt(19, 'put') + .5) * (1 - ease(t, wt(20, 'talk') - .1, wt(20, 'talk') + .25)));
    if (t > L_(14).s && t < L_(14).e + .2) { o.arms = 'vogue'; o.lift = .5 + .5 * Math.sin((t - L_(14).s) * 6 + i); }
    if (t > L_(17).s && t < L_(18).e) { o.arms = 'shrug'; o.lift = ease(t, L_(18).s, L_(18).s + .3); }
    if (t > L_(30).s && t < L_(30).e + .3) { const beat = (t - L_(30).s) * 1.6; o.nod = Math.abs(Math.sin(beat * Math.PI)) * 1.2; } // rehearsed: all nod as one
    const v0 = L_(36).s; if (t > v0 && t < 238) { o.arms = 'vote2'; o.lift = ease(t, v0 + .3 + i * .12, v0 + 1 + i * .12); }
    return o;
  }
  function seatGeom(s) { const out = Math.sign(s.z), by = SEAT - .06; if (!s.z) { const d = Math.sign(s.x); return { beamA: [d * TL, by, 0], beamB: [s.x - d * .1, by, 0], crutch: [[s.x, by - .05, 0], [s.x + d * .5, 0, .3]] }; }
    return { beamA: [s.x, by, out * TD], beamB: [s.x, by, s.z - out * .1], crutch: [[s.x, by - .05, s.z], [s.x + .3, 0, s.z + out * .5]] }; }
  function crutch(a, b) { // a Dali crutch: a long pole with a padded fork at the top
    const pa = PL(...a), pb = PL(...b); if (pa[2] < .1 || pb[2] < .1) return; const k = kAt(pa);
    seg(pa, pb, .05 * k, PAL.crutch);
    const fl = PL(a[0] - .18, a[1] - .1, a[2]), fr = PL(a[0] + .18, a[1] - .1, a[2]), fm = PL(a[0], a[1] - .3, a[2]);
    seg(fm, fl, .035 * k, PAL.crutch); seg(fm, fr, .035 * k, PAL.crutch);
    const pl = PL(a[0] - .22, a[1], a[2]), pr = PL(a[0] + .22, a[1], a[2]); seg(pl, pr, .08 * k, '#e9dcc2');
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(pb[0], pb[1], .05 * kAt(pb), 0, TAU); g.fill();
  }
  function tableShadow(t) {
    const pts = []; for (const [x, z] of [[-TL, -TD], [TL, -TD], [TL, TD], [-TL, TD]]) { pts.push(Lw(x, TOP, z)); pts.push(Lw(x * .97, .2, z * .9)); }
    shadowOf(pts, t);
    const sv = sunVec(t), a = shadowA(t); if (a < .01) return;
    for (const s of SEATS) { const G = seatGeom(s);
      shadowOf([Lw(s.x - .25, SEAT - .45, s.z), Lw(s.x + .25, SEAT - .45, s.z), Lw(s.x + .25, SEAT + .5, s.z), Lw(s.x - .25, SEAT + .5, s.z), Lw(s.x, SEAT + 1.05, s.z)], t);
      const pa = shadowPt(...Lw(...G.crutch[0]), sv), pb = shadowPt(...Lw(...G.crutch[1]), sv); seg(pa, pb, .05 * kAt(pa), `rgba(52,34,58,${a})`); }
  }
  function tableBody(t) {
    const c = PL;
    for (const [x, z] of [[-2.8, -1.2], [2.8, -1.2], [-2.8, 1.2], [2.8, 1.2]]) { const p = c(x, .2, z); if (p[2] < .2) continue; const k = kAt(p); g.fillStyle = '#17120f'; g.beginPath(); g.ellipse(p[0], p[1], .14 * k, .2 * k, 0, 0, TAU); g.fill(); }
    // skirt: four hanging cloth panels that hide the car, drawn back to front
    const faces = [[[-TL * .97, -TD * .93], [TL * .97, -TD * .93]], [[TL * .97, -TD * .93], [TL * .97, TD * .93]], [[TL * .97, TD * .93], [-TL * .97, TD * .93]], [[-TL * .97, TD * .93], [-TL * .97, -TD * .93]]];
    const fd = faces.map((f) => [c((f[0][0] + f[1][0]) / 2, 1.2, (f[0][1] + f[1][1]) / 2)[2], f]).sort((a, b) => b[0] - a[0]);
    const N = 14, hem = (u) => .24 + .05 * Math.sin(u * 20 + t * 1.5);
    for (const [, f] of fd) {
      const at = (u, y) => c(lerp(f[0][0], f[1][0], u), y, lerp(f[0][1], f[1][1], u));
      const pts = []; for (let i = 0; i <= N; i++) pts.push(at(i / N, TOP - .2)); for (let i = N; i >= 0; i--) pts.push(at(i / N, hem(i / N)));
      poly(pts, PAL.skirt);
      for (let i = 1; i < N; i++) seg(at(i / N, TOP - .23), at(i / N, .3), 2, 'rgba(0,0,0,.18)');
      for (let i = 0; i < N; i++) { const a = at(i / N, hem(i / N)); seg(a, at((i + 1) / N, hem((i + 1) / N)), .05 * kAt(a), '#d6a632'); }
    }
    const tc = [[-TL, -TD], [TL, -TD], [TL, TD], [-TL, TD]];
    for (let i = 0; i < 4; i++) { const a = tc[i], b = tc[(i + 1) % 4]; poly([c(a[0], TOP, a[1]), c(b[0], TOP, b[1]), c(b[0], TOP - .22, b[1]), c(a[0], TOP - .22, a[1])], '#3d170c'); }
    const topP = tc.map(([x, z]) => c(x, TOP, z)); if (!ok(topP)) return;
    const lg = g.createLinearGradient(topP[0][0], topP[0][1], topP[2][0], topP[2][1]); lg.addColorStop(0, PAL.mahoganyLit); lg.addColorStop(1, PAL.mahogany);
    poly(topP, lg);
    for (let i = 1; i < 9; i++) { const z = -TD + i * TD * 2 / 9; seg(c(-TL, TOP, z), c(TL, TOP, z + .05 * Math.sin(i)), 1.2, 'rgba(30,8,4,.22)'); }
    chess(t);
    // the hole in the middle: the driver's seat
    const ring = (rx, rz) => { const r = []; for (let i = 0; i < 28; i++) { const a = i / 28 * TAU; r.push(c(Math.cos(a) * rx, TOP, Math.sin(a) * rz)); } return r; };
    poly(ring(.55, .45), '#120806'); poly(ring(.62, .52), null, '#c9a24a', 2.5);
  }
  function chess(t) { // knight to queen's rook: the table top turns into a chessboard
    const s = L_(26).s, e = L_(27).e; const a = ease(t, s - .3, s + .2) * (1 - ease(t, e + .3, e + .8)); if (a <= 0) return;
    g.save(); g.globalAlpha = a * .85;
    for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { if ((i + j) % 2) continue; const x0 = -TL + i, z0 = -TD + j * .75;
      poly([PL(x0, TOP + .001, z0), PL(x0 + 1, TOP + .001, z0), PL(x0 + 1, TOP + .001, z0 + .75), PL(x0, TOP + .001, z0 + .75)], '#efe3c6'); }
    g.restore();
  }

  // ---------- things on the table ----------
  function drape(pts, y0) { return pts.map(([x, z]) => z < -TD ? [x, y0 - (-TD - z) * 1.05, -TD - .015] : [x, y0, z]); } // a soft object hangs over the front edge
  function melt(t) { return clamp((t - 20) / 200) * .55 + ease(t, L_(1).s, L_(1).e) * .12; } // the heat softens the props through the day
  function speakerphone(t) {
    const m = melt(t), cz = -.95 - m * .75, cx = 1.2, pts = [];
    for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, r = .34 * (1 + .14 * Math.cos(3 * a)); pts.push([cx + Math.cos(a + .5) * r, cz + Math.sin(a + .5) * r * .9]); }
    const P3 = drape(pts, TOP + .04).map((p) => PL(...p)); if (!ok(P3)) return;
    poly(P3, '#2f3136'); poly(drape(pts.map(([x, z]) => [cx + (x - cx) * .55, cz + (z - cz) * .55]), TOP + .05).map((p) => PL(...p)), '#3f4248');
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; const q = PL(...drape([[cx + Math.cos(a) * .1, cz + Math.sin(a) * .09]], TOP + .06)[0]); g.fillStyle = '#16171a'; g.beginPath(); g.arc(q[0], q[1], .012 * kAt(q), 0, TAU); g.fill(); }
    // LEDs: green while it may speak; red, with tape across, once the scientists can't
    const cant = wt(1, 'can'), red = t > cant && t < L_(2).s + .5;
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + .5, r = .3; const q = PL(...drape([[cx + Math.cos(a) * r * .8, cz + Math.sin(a) * r * .72]], TOP + .06)[0]); g.fillStyle = red ? '#ff3b2a' : '#57e07a'; g.beginPath(); g.arc(q[0], q[1], .02 * kAt(q), 0, TAU); g.fill(); }
    const tape = ease(t, cant - .05, cant + .2) * (1 - ease(t, L_(2).s + .3, L_(2).s + .6));
    if (tape > 0) for (const d of [1, -1]) { const s1 = drape([[cx - .3 * tape, cz - .25 * d * tape], [cx + .3 * tape, cz + .25 * d * tape]], TOP + .07).map((p) => PL(...p)); seg(s1[0], s1[1], .09 * kAt(s1[0]), '#e6d7b0'); }
    // the soundbite: rings go out across the table and the last one has a bite taken out
    const sb = wt(8, 'patent'); if (t > sb - .3 && t < L_(8).e + .4) for (let r = 0; r < 4; r++) { const age = ((t - sb + .3) * 1.4 - r * .35); if (age < 0 || age > 1.6) continue; const R = .4 + age * .9, ring = [];
      for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; if (r === 3 && a > 4.2 && a < 4.9) continue; ring.push(PL(cx + Math.cos(a) * R, TOP + .06, cz + Math.sin(a) * R * .9)); }
      g.save(); g.globalAlpha = clamp(1.6 - age); g.strokeStyle = '#f8ecd0'; g.lineWidth = 3; g.beginPath(); ring.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.restore(); }
  }
  function boardMap() { // whiteboard on an easel at the right end of the table
    const x0 = 2.45, x1 = 3.95, z = .25, y0 = TOP + 1.55, y1 = TOP + .45;
    return { tl: PL(x0, y0, z), tr: PL(x1, y0, z), bl: PL(x0, y1, z), br: PL(x1, y1, z), legs: [[x0 + .1, z], [x1 - .1, z], [(x0 + x1) / 2, z + .5]], y0 };
  }
  function whiteboard(t, emissive) {
    const B = boardMap(); if (!ok([B.tl, B.tr, B.bl, B.br])) return;
    if (!emissive) for (const [x, z] of B.legs) seg(PL(x, B.y0 + .1, .25), PL(x, TOP, z), .04 * kAt(B.tl), '#6b4a2a');
    const a = B.tr[0] - B.tl[0], b = B.tr[1] - B.tl[1], c = B.bl[0] - B.tl[0], d = B.bl[1] - B.tl[1];
    if (a * d - b * c <= 0) { if (!emissive) poly([B.tl, B.tr, B.br, B.bl], '#8a8f96'); return; } // its back, mid-spin
    g.save(); g.setTransform(a, b, c, d, B.tl[0], B.tl[1]);
    const m = melt(t), burn = ease(t, L_(35).s - .5, L_(35).s + 4);
    if (emissive) { if (burn > 0 && t < L_(35).s + 9) boardFire(t, burn); g.restore(); return; }
    // the board, its bottom edge sagging and dripping in the heat
    const sag = (u, i, k) => 1 + m * (.1 + .32 * u * u) * k + (i % 3 === 1 ? m * .2 * k * Math.sin(i * 7) ** 2 : 0);
    g.beginPath(); g.moveTo(-.04, -.05); g.lineTo(1.04, -.05); for (let i = 10; i >= 0; i--) { const u = i / 10; g.lineTo(u * 1.08 - .04, sag(u, i, 1.15) + .02); } g.closePath(); g.fillStyle = '#b8b1a2'; g.fill();
    g.beginPath(); g.moveTo(0, 0); g.lineTo(1, 0); for (let i = 10; i >= 0; i--) { const u = i / 10; g.lineTo(u, sag(u, i, 1)); } g.closePath();
    const wg = g.createLinearGradient(0, 0, 1, 1); wg.addColorStop(0, '#fbfbf6'); wg.addColorStop(1, '#d9dbd6'); g.fillStyle = wg; g.fill();
    if (burn > .2) { g.globalAlpha = clamp(burn); g.fillStyle = '#1b1210'; g.fill(); g.globalAlpha = 1; }
    if (burn < .6) { charts(t, 1 - burn / .6); chartClimbers(t); }
    g.restore();
  }
  function charts(t, al) {
    g.globalAlpha = al; g.lineCap = 'round'; g.lineJoin = 'round';
    const crime = wt(7, 'crime'), bars = ease(t, crime - .2, crime + .6) * (1 - ease(t, L_(8).s + .2, L_(8).s + .8));
    const wars = wt(21, 'wars'), soar = ease(t, wars - .2, L_(21).e) * (1 - ease(t, L_(22).e, L_(22).e + .5));
    const pieA = ease(t, L_(22).e - .4, L_(22).e) * (1 - ease(t, L_(23).s + .4, L_(23).s + .9));
    // bar chart (left): on "crime" its bars become the bars of a cell
    const hs = [.25, .38, .3, .5, .62];
    for (let i = 0; i < 5; i++) { const x = .08 + i * .085, h = lerp(hs[i] + .05 * Math.sin(t * .7 + i), .82, bars); g.fillStyle = bars > .5 ? '#2a2a2e' : ['#2f6fb5', '#c7362b', '#2f6fb5', '#c7362b', '#2f6fb5'][i]; g.fillRect(x, .9 - h, lerp(.06, .025, bars), h); }
    if (bars > .5) { g.strokeStyle = '#2a2a2e'; g.lineWidth = .02; g.globalAlpha = al * (bars - .5) * 2; g.strokeRect(.05, .06, .45, .84); g.globalAlpha = al; }
    // line chart (right) that only goes up; on "wars" it climbs off the board
    g.strokeStyle = '#2a2a2e'; g.lineWidth = .012; g.beginPath(); g.moveTo(.56, .1); g.lineTo(.56, .9); g.lineTo(.96, .9); g.stroke();
    g.strokeStyle = '#c7362b'; g.lineWidth = .02; g.beginPath(); const pts = [[.58, .8], [.66, .72], [.73, .76], [.8, .58], [.87, .5], [.93, .34]];
    pts.forEach(([x, y], i) => { const yy = y - soar * i * i * .09; i ? g.lineTo(x, yy) : g.moveTo(x, yy); }); g.stroke();
    if (pieA > 0) { g.globalAlpha = al * pieA; g.fillStyle = '#fbfbf6'; g.fillRect(.04, .04, .92, .92); g.fillStyle = '#2f6fb5'; g.beginPath(); g.moveTo(.5, .5); g.arc(.5, .5, .32, 0, 5); g.fill(); g.fillStyle = '#c7362b'; g.beginPath(); g.moveTo(.53, .48); g.arc(.53, .48, .32, 5, TAU); g.fill(); }
    g.globalAlpha = 1;
  }
  function boardFire(t, burn) {
    g.globalCompositeOperation = 'lighter'; const die = 1 - ease(t, L_(35).s + 5, L_(35).s + 9);
    for (let i = 0; i < 14; i++) { const x = .04 + i * .07, h = (.25 + .6 * clamp(burn * 1.4)) * (.6 + .4 * n1(70 + i, t * 3)) * die;
      const fg = g.createLinearGradient(0, 1.05, 0, 1.05 - h); fg.addColorStop(0, 'rgba(255,220,120,.9)'); fg.addColorStop(.5, 'rgba(255,120,30,.6)'); fg.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = fg;
      g.beginPath(); g.moveTo(x - .06, 1.05); g.quadraticCurveTo(x - .04 + .03 * n1(80 + i, t * 4), 1.05 - h * .6, x + .02 * n1(90 + i, t * 5), 1.05 - h); g.quadraticCurveTo(x + .05, 1.05 - h * .5, x + .06, 1.05); g.fill(); }
    g.globalCompositeOperation = 'source-over';
  }
  function tapeRecorders(t) { // "every tape recorder" goes into the drawer
    const t0 = wt(2, 'every') - .2; if (t < t0 || t > L_(2).e + .2) return; const dr = [-.8, SEAT + .4, 2.05];
    for (let i = 0; i < 4; i++) { const st = t0 + i * .35, u = clamp((t - st) / .9); if (t < st || u >= 1) continue;
      const s = [-2.6 + i * 1.1, TOP + .05, -.8 + (i % 2) * .5]; const x = lerp(s[0], dr[0], u), z = lerp(s[2], dr[2], u), y = lerp(s[1], dr[1], u) + Math.sin(u * Math.PI) * .6;
      const p = PL(x, y, z); if (p[2] < .2) continue; const k = kAt(p) * (1 - u * .4);
      g.save(); g.translate(p[0], p[1]); g.rotate(u * 3 + i); g.fillStyle = '#3a3a40'; g.fillRect(-.12 * k, -.075 * k, .24 * k, .15 * k); g.fillStyle = '#d8d0bc';
      for (const dx of [-.05, .05]) { g.beginPath(); g.arc(dx * k, -.01 * k, .03 * k, 0, TAU); g.fill(); } g.restore(); }
  }
  function newspapers(t) { // "restrict access to news": the papers come down and wilt over the edge, blank
    const s = L_(4).s; if (t < s - .2 || t > L_(5).s + .3) return; const fade = 1 - ease(t, L_(5).s - .2, L_(5).s + .3);
    for (let i = 0; i < 3; i++) { const land = s + .6 + i * .5, u = ease(t, land - 1.1, land), cx = -2.7 + i * 1.5, len = .55 * u + .45 * ease(t, land, land + 1);
      const sheet = []; for (let a = 0; a <= 6; a++) sheet.push([cx - .35 + a * .117, -1.05]); for (let a = 6; a >= 0; a--) sheet.push([cx - .35 + a * .117, -1.05 - len]);
      const lift = (1 - u) * 3.2, sw = (1 - u) * Math.sin(t * 5 + i) * .4;
      const P3 = drape(sheet.map(([x, z]) => [x + sw, z]), TOP + .03).map(([x, y, z]) => PL(x, y + lift, z)); g.save(); g.globalAlpha = fade; poly(P3, '#ece6d6', 'rgba(60,50,40,.4)', 1.2);
      for (let c = 0; c < 3; c++) { const col = drape([[cx - .25 + c * .22, -1.15], [cx - .25 + c * .22, -1.05 - len * .9]], TOP + .035).map(([x, y, z]) => PL(x + sw, y + lift, z)); seg(col[0], col[1], .1 * kAt(col[0]), 'rgba(150,140,125,.45)'); }
      g.restore(); }
  }
  function cage(p, k, legs) { // a cell on spindly stilt legs; p = ground point, k = px per metre; legs 0..1 grows the stilts
    if (p[2] < .2) return; const L = 7 * legs, x = p[0], y = p[1];
    g.strokeStyle = '#3b3232'; g.lineWidth = Math.max(1, .12 * k); g.lineCap = 'round';
    for (const d of [-1, -.4, .4, 1]) { g.beginPath(); g.moveTo(x + d * 1.1 * k, y - L * k); g.quadraticCurveTo(x + d * 1.4 * k, y - L * .5 * k, x + d * 1.5 * k, y); g.stroke(); }
    const cy = y - L * k; g.fillStyle = '#6d6058'; g.fillRect(x - 1.3 * k, cy - .25 * k, 2.6 * k, .25 * k); g.fillRect(x - 1.3 * k, cy - 2.75 * k, 2.6 * k, .3 * k);
    g.fillStyle = 'rgba(40,30,30,.35)'; g.fillRect(x - 1.2 * k, cy - 2.45 * k, 2.4 * k, 2.2 * k);
    g.lineWidth = Math.max(1, .09 * k); for (let i = 0; i <= 7; i++) { const bx = x - 1.2 * k + i * 2.4 / 7 * k; g.beginPath(); g.moveTo(bx, cy - 2.45 * k); g.lineTo(bx, cy - .25 * k); g.stroke(); }
  }
  function jailModel(t) { // "their grand plan unveiled": a cloth lifts off three little cells on stilts
    const s = L_(9).s, un = wt(9, 'unveiled'); if (t < s - .3 || t > L_(9).e + 1) return; const fade = 1 - ease(t, L_(9).e + .3, L_(9).e + 1);
    g.save(); g.globalAlpha = fade;
    for (let i = 0; i < 3; i++) { const p = PL(-1.8 + i * .9, TOP, -.4); cage(p, kAt(p) * .13, 1); }
    const lift = ease(t, un - .2, un + .7); if (lift < 1) { const cl = []; for (let i = 0; i <= 10; i++) cl.push(PL(-2.4 + i * .24, TOP + 1.4 + lift * 2 + .1 * Math.sin(i * 1.3 + t * 4), -.4)); for (let i = 10; i >= 0; i--) cl.push(PL(-2.4 + i * .24 + lift * .5, TOP + .02 + lift * 2.5, -.6)); g.globalAlpha = fade * (1 - lift); poly(cl, '#efe7d4'); }
    g.restore();
  }
  const JAILS = [[-14, 30], [-2, 46], [9, 26], [22, 52], [34, 33]];
  function jails(t, list) { const j = wt(9, 'jails'); if (t < j - .1) return; const base = carX(j);
    JAILS.forEach(([x, z], i) => { const legs = easeOutBack(clamp((t - j - i * .18) / .9)), X = base + x + 8;
      list.push({ z: P(X, 0, z)[2], draw: () => { const p = P(X, 0, z); cage(p, kAt(p), legs); }, shadow: () => shadowStick(X, 0, 7 * legs + 2.8, z, 2.6, t) }); }); }
  function chips(t) { // "expand the wars and the military bets": chip stacks grow on the table
    const s = L_(21).s, e = L_(21).e; if (t < s || t > e + 1.2) return; const sink = 1 - ease(t, e + .2, e + 1.2);
    for (let i = 0; i < 4; i++) { const n = Math.floor(clamp((t - s - i * .25) / 1.8) * 14 * sink), x = 1.7 + i * .25, z = -.35 + (i % 2) * .22;
      for (let c = 0; c < n; c++) { const p = PL(x, TOP + c * .035, z), k = kAt(p); g.fillStyle = ['#c7362b', '#f4efe6', '#2f6fb5', '#1c1c1c'][i]; g.beginPath(); g.ellipse(p[0], p[1], .14 * k, .05 * k, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.stroke(); } }
  }
  function micBooms(t) { // "and limit the questions the media gets": the boom mics wilt before they reach the table
    const s = L_(22).s, e = L_(22).e; if (t < s - .5 || t > e + .8) return; const reach = ease(t, s - .5, s + .2) * (1 - ease(t, e + .2, e + .8)), droop = ease(t, wt(22, 'limit'), wt(22, 'limit') + .8);
    for (let i = 0; i < 2; i++) { const a = [-9, 2.8 - i * .5, -3.4 + i * .7], tip = [lerp(-9, -2.6 + i * .8, reach), lerp(2.2, .4, droop), -1.3 + i * .4];
      const pts = []; for (let k = 0; k <= 12; k++) { const u = k / 12; pts.push(PL(lerp(a[0], tip[0], u), lerp(a[1], tip[1], u) + Math.sin(u * Math.PI) * (1 - droop) * .4 - droop * u * u * .4, lerp(a[2], tip[2], u))); }
      for (let k = 0; k < 12; k++) seg(pts[k], pts[k + 1], .05 * kAt(pts[k]), '#888b90');
      const p = pts[12]; if (p[2] < .2) continue; const kk = kAt(p); g.save(); g.translate(p[0], p[1]); g.rotate(droop * 1.2); g.fillStyle = '#5b5e63'; g.beginPath(); g.ellipse(0, 0, .3 * kk, .1 * kk, 0, 0, TAU); g.fill(); g.restore(); }
  }
  function pie(t) { // "how many lies can you bake in this pie?": a real pie, one slice slumping over the edge
    const s = L_(23).s, e = L_(23).e; if (t < s - .2 || t > e + 1) return; const al = ease(t, s - .2, s + .2) * (1 - ease(t, e + .3, e + 1)), cx = -.15, cz = -.95, sl = ease(t, wt(23, 'pie') - .5, e + .3);
    const disc = (r, a0, a1, oz, y) => { const ps = [[cx, cz + oz]]; for (let i = 0; i <= 20; i++) { const a = lerp(a0, a1, i / 20); ps.push([cx + Math.cos(a) * r, cz + oz + Math.sin(a) * r]); } return drape(ps, y).map((p) => PL(...p)); };
    g.save(); g.globalAlpha = al; poly(disc(.42, -1.1, 4.6, 0, TOP + .06), '#c98a3e'); poly(disc(.36, -1.1, 4.6, 0, TOP + .07), '#e2b267');
    for (let i = 0; i < 6; i++) { const a = -1.1 + i * .95; seg(PL(cx, TOP + .075, cz), PL(cx + Math.cos(a) * .36, TOP + .075, cz + Math.sin(a) * .36), 2, 'rgba(120,70,20,.5)'); }
    poly(disc(.42, -1.6, -1.1, -sl * .75, TOP + .06), '#c98a3e'); g.restore();
  }
  function book(t) { // "it's a mystery book the way you look": an open book whose pages keep turning
    const s = L_(25).s, e = L_(26).s; if (t < s - .2 || t > e + .5) return; const al = ease(t, s - .2, s + .2) * (1 - ease(t, e, e + .5)), cx = -1.5, cz = -.8;
    const pg = (ang) => { const c = Math.cos(ang), sn = Math.sin(ang); return [PL(cx, TOP + .05, cz - .3), PL(cx, TOP + .05, cz + .3), PL(cx + .45 * c, TOP + .05 + .45 * sn, cz + .3), PL(cx + .45 * c, TOP + .05 + .45 * sn, cz - .3)]; };
    g.save(); g.globalAlpha = al; poly([PL(cx - .5, TOP + .02, cz - .33), PL(cx + .5, TOP + .02, cz - .33), PL(cx + .5, TOP + .02, cz + .33), PL(cx - .5, TOP + .02, cz + .33)], '#5c1f2a');
    poly(pg(Math.PI), '#f2ead6', 'rgba(0,0,0,.2)', 1); poly(pg(0), '#f2ead6', 'rgba(0,0,0,.2)', 1);
    const turn = ((t - s) * 1.3) % 1; poly(pg(turn * Math.PI), '#fbf5e6', 'rgba(0,0,0,.25)', 1); g.restore();
  }
  function chessPieces(t) { // the knight hops to the rook, then on "foul play" knocks it down
    const s = L_(26).s, e = L_(27).e; if (t < s - .2 || t > e + .8) return; const al = ease(t, s - .2, s + .1) * (1 - ease(t, e + .2, e + .8));
    const rook = wt(26, 'rook'), foul = wt(27, 'foul');
    const ku = ease(t, s, rook), kx = lerp(-2.5, 1.9, ku), kz = lerp(-.4, .4, ku), hop = Math.sin(ku * Math.PI) * .6, fall = ease(t, foul, foul + .4);
    g.save(); g.globalAlpha = al; const pr = PL(2.5, TOP, .4), kr = kAt(pr); g.save(); g.translate(pr[0], pr[1]); g.rotate(fall * 1.45);
    g.fillStyle = '#efe6cf'; g.fillRect(-.16 * kr, -.55 * kr, .32 * kr, .55 * kr); g.fillRect(-.2 * kr, -.66 * kr, .4 * kr, .12 * kr); for (let i = 0; i < 3; i++) g.fillRect((-.2 + i * .15) * kr, -.76 * kr, .1 * kr, .1 * kr); g.restore();
    const pk = PL(kx, TOP + hop, kz), kk = kAt(pk); g.fillStyle = '#1d1a1a'; g.beginPath(); g.moveTo(pk[0] - .2 * kk, pk[1]); g.lineTo(pk[0] + .2 * kk, pk[1]); g.lineTo(pk[0] + .12 * kk, pk[1] - .3 * kk); g.quadraticCurveTo(pk[0] + .28 * kk, pk[1] - .5 * kk, pk[0] + .05 * kk, pk[1] - .78 * kk); g.lineTo(pk[0] - .22 * kk, pk[1] - .55 * kk); g.lineTo(pk[0] - .02 * kk, pk[1] - .5 * kk); g.lineTo(pk[0] - .12 * kk, pk[1] - .3 * kk); g.fill(); g.restore();
  }
  function dime(t) { // "people had a dime": a coin rolls to the edge and goes soft over it
    const d = wt(15, 'dime'); if (t < d - .2 || t > L_(16).e + .6) return; const al = 1 - ease(t, L_(16).e, L_(16).e + .6);
    const u = ease(t, d - .2, d + 1.0), cx = lerp(-1.9, -1.5, u), sag = ease(t, d + .9, d + 1.8);
    g.save(); g.globalAlpha = al;
    if (sag <= 0) { const p = PL(cx, TOP + .14, -.9 - u * .55), k = kAt(p); g.fillStyle = '#c9c3b8'; g.beginPath(); g.ellipse(p[0], p[1], .05 * k + .09 * k * Math.abs(Math.cos(u * 9)), .14 * k, 0, 0, TAU); g.fill(); g.strokeStyle = '#7b766d'; g.lineWidth = 2; g.stroke(); }
    else { const ps = []; for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; ps.push([cx + Math.cos(a) * .14, -1.45 - sag * .2 + Math.sin(a) * .14 * (1 + sag)]); } poly(drape(ps, TOP + .02).map((p) => PL(...p)), '#c9c3b8', '#7b766d', 2); }
    g.restore();
  }
  function truth(t, emissive) { // "put the truth in a box": a small light carried into the open drawer
    const s = wt(19, 'truth') - .2, e = wt(19, 'box') + .3; if (t < s || t > e) return; const u = ease(t, s, e);
    const p = PL(lerp(.2, -.8, u), lerp(TOP + .4, SEAT + .4, u) + Math.sin(u * Math.PI) * .4, lerp(-.5, 2.1, u)); if (p[2] < .2) return; const k = kAt(p);
    if (emissive) { g.save(); g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], .22 * k); rg.addColorStop(0, 'rgba(255,240,190,.7)'); rg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = rg; g.fillRect(p[0] - .22 * k, p[1] - .22 * k, .44 * k, .44 * k); g.restore(); }
    else { g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(p[0], p[1], .08 * k, 0, TAU); g.fill(); }
  }
  function driverHat() { // the unseen driver: only a red hat brim showing in the hole
    const p = PL(0, TOP - .05, 0); if (p[2] < .2) return; const k = kAt(p);
    g.fillStyle = '#8f2018'; g.beginPath(); g.ellipse(p[0], p[1], .3 * k, .08 * k, 0, 0, TAU); g.fill();
    g.fillStyle = '#b52c22'; g.beginPath(); g.moveTo(p[0] - .15 * k, p[1]); g.lineTo(p[0] - .13 * k, p[1] - .16 * k); g.quadraticCurveTo(p[0], p[1] - .22 * k, p[0] + .13 * k, p[1] - .16 * k); g.lineTo(p[0] + .15 * k, p[1]); g.fill();
    g.fillStyle = '#3a1410'; g.fillRect(p[0] - .15 * k, p[1] - .05 * k, .3 * k, .035 * k);
  }

  // ---------- the playa's other figures ----------
  const ELEPHANTS = [{ x: -60, z: 85, v: 1.25, s: 1 }, { x: 40, z: 120, v: 1.0, s: .9, load: 'papers' }, { x: 150, z: 70, v: 1.4, s: 1.1 }, { x: 260, z: 140, v: 1.2, s: .8, load: 'ballot' }, { x: -20, z: 160, v: 1.5, s: .8 }, { x: 10, z: 64, v: 1.7, s: .9, load: 'papers' }, { x: 90, z: 100, v: 1.1, s: 1, load: 'ballot' }, { x: 200, z: 58, v: 1.5, s: .9 }];
  function elephant(X, Z, t, s, ph, load) { // a stilt-legged elephant: a small body high on four long spindly legs
    const p = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p) * s, x = p[0], y = p[1], legH = 10.5, bodyY = y - legH * k, w = Math.sin(t * 1.4 + ph);
    g.strokeStyle = PAL.elephant; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const hx = x + (-1.3 + (i % 2) * 2.6 + (i > 1 ? .3 : 0)) * k, fx = hx + ((i === 0 || i === 3) ? w : -w) * 1.3 * k; g.lineWidth = Math.max(1, .2 * k);
      g.beginPath(); g.moveTo(hx, bodyY + .6 * k); g.quadraticCurveTo((hx + fx) / 2 + .4 * k, bodyY + legH * .5 * k, fx, y); g.stroke(); }
    const eg = g.createLinearGradient(x - 2.4 * k, 0, x + 2.4 * k, 0); eg.addColorStop(0, PAL.elephantLit); eg.addColorStop(1, PAL.elephant); g.fillStyle = eg;
    g.beginPath(); g.ellipse(x, bodyY - .4 * k, 2.4 * k, 1.35 * k, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(x + 2.4 * k, bodyY - .9 * k, .95 * k, .9 * k, 0, 0, TAU); g.fill();
    g.fillStyle = PAL.elephant; g.beginPath(); g.ellipse(x + 2 * k, bodyY - .7 * k, .55 * k, .85 * k, .3, 0, TAU); g.fill();
    g.strokeStyle = PAL.elephant; g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(x + 3.1 * k, bodyY - .6 * k); g.quadraticCurveTo(x + 3.8 * k, bodyY + .8 * k + w * .3 * k, x + 3.4 * k, bodyY + 2.2 * k); g.stroke();
    if (load === 'papers') { for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#ece6d6' : '#d9d1bd'; g.fillRect(x - 1.1 * k + Math.sin(i * 2.3) * .2 * k, bodyY - (1.75 + i * .38) * k, 2.2 * k, .36 * k); } }
    else if (load === 'ballot') { g.fillStyle = '#efe7d4'; g.fillRect(x - 1.2 * k, bodyY - 4.2 * k, 2.4 * k, 2.4 * k); g.fillStyle = '#1a1a1a'; g.fillRect(x - .7 * k, bodyY - 4.2 * k, 1.4 * k, .18 * k); g.fillStyle = '#fbf7ec'; g.fillRect(x - .35 * k, bodyY - (4.9 - Math.abs(Math.sin(t * 2 + ph)) * .5) * k, .7 * k, .9 * k); }
    else { g.fillStyle = '#e8d9b5'; g.beginPath(); g.moveTo(x - 1 * k, bodyY - 1.6 * k); g.lineTo(x + 1 * k, bodyY - 1.6 * k); g.lineTo(x + .25 * k, bodyY - 5.5 * k); g.lineTo(x - .25 * k, bodyY - 5.5 * k); g.fill(); } // an obelisk on its back
    g.fillStyle = '#c7362b'; g.fillRect(x - 1.2 * k, bodyY - 1.75 * k, 2.4 * k, .3 * k);
  }
  function elephantsInto(t, list) { for (const e of ELEPHANTS) { const X = e.x + e.v * t; list.push({ z: P(X, 0, e.z)[2], draw: () => elephant(X, e.z, t, e.s, e.x, e.load), shadow: () => { shadowStick(X, 10.5 * e.s, 16 * e.s, e.z, 3 * e.s, t); for (const d of [-1.3, 1.3]) shadowStick(X + d * e.s, 0, 10.5 * e.s, e.z, .35, t); } }); } }
  function poorPerson(t, list) { // "when a poor person dared to ask you to share"
    const s = L_(17).s - .4, e = L_(18).e + .5; if (t < s || t > e) return; const X = carX(s) + 9 - (t - s) * .8, Z = -5.5;
    list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z), k = kAt(p), x = p[0], y = p[1], st = Math.sin((t - s) * 5), ask = ease(t, L_(17).s, L_(17).s + .5) * (1 - ease(t, L_(18).s + .2, L_(18).s + .6));
      g.strokeStyle = '#4b4a5a'; g.lineWidth = .14 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y - .85 * k); g.lineTo(x - st * .2 * k, y); g.moveTo(x, y - .85 * k); g.lineTo(x + st * .2 * k, y); g.stroke();
      g.fillStyle = '#6b6a78'; g.fillRect(x - .2 * k, y - 1.5 * k, .4 * k, .7 * k); g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(x, y - 1.65 * k, .13 * k, 0, TAU); g.fill(); g.fillStyle = '#3d3c48'; g.fillRect(x - .16 * k, y - 1.82 * k, .32 * k, .08 * k);
      const hx = x - .45 * k, hy = y - lerp(1.1, 1.75, ask) * k; g.strokeStyle = '#6b6a78'; g.lineWidth = .09 * k; g.beginPath(); g.moveTo(x - .15 * k, y - 1.4 * k); g.lineTo(hx, hy); g.stroke();
      g.fillStyle = '#9a9692'; g.beginPath(); g.ellipse(hx, hy - .03 * k, .14 * k, .06 * k, 0, 0, Math.PI); g.fill(); }, shadow: () => shadowStick(X, 0, 1.8, Z, .4, t) });
  }
  function cops(t, list) { // "every little G20 cop got paid": a row of riot shields behind the car; coins arc down to them
    const s = L_(28).s; if (t < s - .6) return; const base = carX(s);
    for (let i = 0; i < 7; i++) { const X = base - 7 + i * 2.3, Z = 16 + (i % 2) * 1.5;
      list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z), k = kAt(p), x = p[0], y = p[1], up = ease(t, s - .6 + i * .08, s + i * .08); if (up <= 0) return;
        g.save(); g.globalAlpha = up; g.fillStyle = '#1e2026'; g.fillRect(x - .25 * k, y - 1.5 * k, .5 * k, 1.5 * k); g.beginPath(); g.arc(x, y - 1.7 * k, .2 * k, Math.PI, TAU); g.fill(); g.fillRect(x - .22 * k, y - 1.7 * k, .44 * k, .1 * k);
        g.fillStyle = 'rgba(190,200,210,.55)'; g.beginPath(); g.ellipse(x - .1 * k, y - .9 * k, .42 * k, .6 * k, 0, 0, TAU); g.fill(); g.restore();
        const cu = clamp((t - (s + .4 + i * .25)) / .9); if (cu > 0 && cu < 1 && t < s + 6) { const a = PL(-1 + i * .3, TOP + .3, 1.2), q = [lerp(a[0], x, cu), lerp(a[1], y - 1.6 * k, cu) - Math.sin(cu * Math.PI) * 120]; g.fillStyle = '#e8c04a'; g.beginPath(); g.arc(q[0], q[1], Math.max(3, .1 * k), 0, TAU); g.fill(); } },
        shadow: () => { if (t > s) shadowStick(X, 0, 1.9, Z, .5, t); } }); }
  }
  // the party's effigy
  const burnAmt = (t) => ease(t, L_(35).s - .8, L_(35).s + 9) * (1 - ease(t, 254, 266) * .75);
  const fallAmt = (t) => ease(t, 248.5, 252.5);
  function manGeom() { const p = P(MAN.x, 0, MAN.z); return { p, k: kAt(p) }; }
  function theMan(t) {
    const { p, k } = manGeom(); if (p[2] < 1) return; const x = p[0], y = p[1], fall = fallAmt(t), arms = ease(t, L_(35).s - 1, L_(35).s + 3);
    g.fillStyle = '#8a6a44'; g.beginPath(); g.moveTo(x - 9 * k, y); g.lineTo(x + 9 * k, y); g.lineTo(x + 4 * k, y - 6 * k); g.lineTo(x - 4 * k, y - 6 * k); g.fill();
    g.strokeStyle = 'rgba(60,40,20,.5)'; g.lineWidth = Math.max(1, .15 * k); for (let i = 1; i < 4; i++) { const yy = y - i * 1.5 * k, hw = 9 - i * 1.25; g.beginPath(); g.moveTo(x - hw * k, yy); g.lineTo(x + hw * k, yy); g.stroke(); }
    g.save(); g.translate(x, y - 6 * k); g.rotate(fall * 1.3); g.translate(0, fall * 4 * k); g.globalAlpha = 1 - ease(t, 252, 254);
    g.strokeStyle = '#6e5232'; g.lineWidth = Math.max(1.5, .45 * k); g.lineCap = 'round';
    g.beginPath(); g.moveTo(-1.6 * k, 0); g.lineTo(-.7 * k, -7 * k); g.moveTo(1.6 * k, 0); g.lineTo(.7 * k, -7 * k); g.stroke();
    // a suit jacket on the effigy, a rosette, arms up on the burn
    g.fillStyle = PAL.suit; g.beginPath(); g.moveTo(-1.5 * k, -7 * k); g.lineTo(-2.2 * k, -12.6 * k); g.lineTo(2.2 * k, -12.6 * k); g.lineTo(1.5 * k, -7 * k); g.fill();
    g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(-.6 * k, -12.6 * k); g.lineTo(0, -10.2 * k); g.lineTo(.6 * k, -12.6 * k); g.fill();
    rosette(-1.1 * k, -11.6 * k, .27 * k);
    g.strokeStyle = '#6e5232'; for (const d of [-1, 1]) { const ax = d * lerp(2.6, 3.4, arms) * k, ay = lerp(-8 * k, -16 * k, arms); g.beginPath(); g.moveTo(d * 2 * k, -12.4 * k); g.lineTo(ax, ay); g.stroke(); }
    g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(0, -12.6 * k); g.lineTo(0, -13.4 * k); g.moveTo(0, -13.4 * k); g.lineTo(-1.1 * k, -14.9 * k); g.lineTo(0, -16.6 * k); g.lineTo(1.1 * k, -14.9 * k); g.closePath(); g.stroke();
    g.restore();
  }
  function manFire(t) {
    const b = burnAmt(t); if (b <= 0) return; const { p, k } = manGeom(); if (p[2] < 1) return; const x = p[0], y = p[1], fall = fallAmt(t);
    g.save(); g.globalCompositeOperation = 'lighter';
    const R = 34 * k * (.6 + .4 * b); const gl = g.createRadialGradient(x, y - 8 * k, 0, x, y - 8 * k, R); gl.addColorStop(0, `rgba(255,170,70,${.55 * b})`); gl.addColorStop(.4, `rgba(255,100,30,${.25 * b})`); gl.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = gl; g.fillRect(x - R, y - 8 * k - R, 2 * R, 2 * R);
    const top = lerp(6, 21, clamp(b * 1.3)) * (1 - fall * .55);
    for (let i = 0; i < 22; i++) { const fx = x + (-7 + i * 14 / 21) * k * (1 - .4 * (1 - clamp(b * 2))), h = (top * (1 - Math.abs(i - 10.5) / 13) + 2) * (.6 + .4 * n1(200 + i, t * 2.6)) * k * clamp(b * 1.5);
      const fg = g.createLinearGradient(0, y, 0, y - h); fg.addColorStop(0, 'rgba(255,230,150,.85)'); fg.addColorStop(.4, 'rgba(255,140,40,.6)'); fg.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = fg;
      g.beginPath(); g.moveTo(fx - 1 * k, y); g.quadraticCurveTo(fx - .5 * k + n1(300 + i, t * 3) * k, y - h * .6, fx + n1(400 + i, t * 2) * 1.2 * k, y - h); g.quadraticCurveTo(fx + .8 * k, y - h * .4, fx + 1 * k, y); g.fill(); }
    const up = clamp((b - .35) / .5); if (up > 0) { g.save(); g.translate(x, y - 6 * k); g.rotate(fall * 1.3); g.translate(0, fall * 4 * k); g.globalAlpha = 1 - ease(t, 252, 254);
      const spots = [[-1.2, -2], [1.2, -2], [-.9, -5], [.9, -5], [0, -8], [-1.5, -10], [1.5, -10], [0, -12], [-2.9, -14], [2.9, -14], [0, -15.5]];
      g.filter = `blur(${Math.max(1, .5 * k).toFixed(1)}px)`; spots.forEach(([fx, fy], i) => { if (-fy / 16 > up * 1.05) return; const h = (3.6 + 1.8 * n1(600 + i, t * 3)) * k, w = (1.7 + .4 * n1(650 + i, t * 2)) * k, X = (fx + .5 * n1(660 + i, t * 1.7)) * k, Y = fy * k;
        const fg = g.createLinearGradient(0, Y + w, 0, Y - h); fg.addColorStop(0, 'rgba(255,220,140,.55)'); fg.addColorStop(.5, 'rgba(255,120,40,.4)'); fg.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = fg;
        g.beginPath(); g.moveTo(X - w, Y + w); g.quadraticCurveTo(X - w * .4 + n1(700 + i, t * 4) * w, Y - h * .5, X + n1(800 + i, t * 3) * w * .8, Y - h); g.quadraticCurveTo(X + w * .6, Y - h * .4, X + w, Y + w); g.fill(); });
      g.restore(); }
    for (let i = 0; i < 40; i++) { const ph = (t * .35 + rnd(i, 9)) % 1, ex = x + (rnd(i, 3) - .5) * 16 * k + n1(500 + i, t) * 3 * k, ey = y - (4 + ph * 30) * k; g.fillStyle = `rgba(255,200,110,${(1 - ph) * .8 * b})`; g.fillRect(ex, ey, Math.max(1.5, .15 * k), Math.max(1.5, .15 * k)); }
    g.restore();
  }

  // ---------- Little Bob ----------
  function bobPopUp(t) { // "friends with the little big guy": the driver comes up through the hole and lifts his hat
    const s = L_(24).s - .1, e = L_(24).e + .6; if (t < s || t > e) return; const hole = PL(0, TOP, 0); if (hole[2] < .3) return; const k = kAt(hole), h = 1.15 * k;
    const up = ease(t, s, s + .5) * (1 - ease(t, e - .5, e)), feet = hole[1] + h * lerp(1.05, .42, up);
    g.save(); g.beginPath(); g.rect(hole[0] - .7 * k, 0, 1.4 * k, hole[1] + .02 * k); g.clip();
    LITTLE_BOB.draw(g, t, { tIn: s, tOut: e + .01, x0: hole[0], x1: hole[0], y: feet, h, stop: { t0: s + .001, t1: e }, shadow: false });
    g.restore();
  }
  function bobWalk(t) { // after the burn he crosses in front of the embers
    LITTLE_BOB.draw(g, t, { tIn: 255.2, tOut: 268.4, y: 985, h: 270, stop: { t0: 260.4, t1: 262.6 }, mode: 'card', grade: (kg) => { kg.globalCompositeOperation = 'multiply'; kg.fillStyle = 'rgb(255,170,120)'; kg.fillRect(0, 0, W, H); } });
  }


  // ---------- Burning Man: camps, lamps, bikes, crowd (draft 2) ----------
  const nightAmt = (t) => ease(t, 199, 216);
  const CAMPS = []; { const R = mulberry(77); for (let X = -90; X < 420; X += 14 + R() * 12) CAMPS.push({ X, Z: 50 + R() * 34, kind: R() < .55 ? 'dome' : 'tent', r: 4 + R() * 4, col: ['#d8452f', '#2f6fb5', '#e8b23a', '#7a3c8c', '#f2ede0'][Math.floor(R() * 5)], flag: R() < .7, seed: Math.floor(R() * 1e4) }); }
  function camp(c, t) {
    const p = P(c.X, 0, c.Z); if (p[2] < 2 || p[0] < -600 || p[0] > W + 600) return; const k = kAt(p), x = p[0], y = p[1], r = c.r * k;
    if (c.kind === 'dome') { // a geodesic dome: a half disc with its struts
      const dg = g.createLinearGradient(x - r, 0, x + r, 0); dg.addColorStop(0, '#f4ecdc'); dg.addColorStop(1, '#b9ad98'); g.fillStyle = dg; g.beginPath(); g.arc(x, y, r, Math.PI, TAU); g.fill();
      g.strokeStyle = 'rgba(90,70,50,.55)'; g.lineWidth = Math.max(.6, .06 * k);
      for (let ring = 1; ring <= 3; ring++) { const a = ring / 4 * Math.PI / 2, ry = y - Math.sin(a) * r, rx = Math.cos(a) * r; g.beginPath(); g.moveTo(x - rx, ry); g.lineTo(x + rx, ry); g.stroke(); }
      for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); }
      g.fillStyle = c.col; g.globalAlpha = .55; g.beginPath(); g.arc(x, y, r, Math.PI * 1.15, Math.PI * 1.45); g.lineTo(x, y); g.fill(); g.globalAlpha = 1;
    } else { // a shade tent: poles and a sagging cloth
      g.strokeStyle = '#6d5a44'; g.lineWidth = Math.max(1, .1 * k); for (const d of [-1, 1]) { g.beginPath(); g.moveTo(x + d * r, y); g.lineTo(x + d * r, y - .6 * r); g.stroke(); }
      g.fillStyle = c.col; g.beginPath(); g.moveTo(x - r * 1.1, y - .6 * r); g.quadraticCurveTo(x, y - .45 * r + Math.sin(t + c.seed) * .03 * r, x + r * 1.1, y - .6 * r); g.lineTo(x + r * .9, y - .75 * r); g.quadraticCurveTo(x, y - .6 * r, x - r * .9, y - .75 * r); g.fill();
    }
    if (c.flag) { const fx = x + r * .3, top = y - r * 1.6; g.strokeStyle = '#5a4a3a'; g.lineWidth = Math.max(1, .05 * k); g.beginPath(); g.moveTo(fx, y - r * .8); g.lineTo(fx, top); g.stroke();
      g.fillStyle = ['#d8452f', '#e8b23a', '#2f6fb5'][c.seed % 3]; g.beginPath(); g.moveTo(fx, top); for (let i = 0; i <= 6; i++) { const u = i / 6; g.lineTo(fx + u * 1.6 * k, top + Math.sin(u * 5 - t * 4 + c.seed) * .15 * k + u * .1 * k); } for (let i = 6; i >= 0; i--) { const u = i / 6; g.lineTo(fx + u * 1.6 * k, top + .7 * k + Math.sin(u * 5 - t * 4 + c.seed) * .15 * k - u * .2 * k); } g.fill(); }
  }
  const LAMPS = []; for (let X = -80; X < 420; X += 20) LAMPS.push({ X, Z: 26 + (X % 40 ? 2 : 0) });
  function lamp(l, t, emissive) {
    const p = P(l.X, 0, l.Z); if (p[2] < 2 || p[0] < -200 || p[0] > W + 200) return; const k = kAt(p), x = p[0], y = p[1], top = y - 5 * k;
    if (!emissive) { g.strokeStyle = '#4a3a2c'; g.lineWidth = Math.max(1, .14 * k); g.beginPath(); g.moveTo(x, y); g.lineTo(x, top); g.lineTo(x + .5 * k, top); g.stroke(); g.fillStyle = '#e9dcb8'; g.fillRect(x + .3 * k, top, .45 * k, .6 * k); return; }
    const n = nightAmt(t); if (n <= .1) return; g.save(); g.globalCompositeOperation = 'lighter'; const R = 1.1 * k; const rg = g.createRadialGradient(x + .52 * k, top + .3 * k, 0, x + .52 * k, top + .3 * k, R); rg.addColorStop(0, `rgba(255,214,140,${.6 * n})`); rg.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = rg; g.fillRect(x + .52 * k - R, top + .3 * k - R, 2 * R, 2 * R); g.restore();
  }
  // bikes: people on wheels (Gilliam's cheat), crossing all day; positions wrap relative to the car so the playa always has traffic
  const BIKES = [...Array(14)].map((_, i) => ({ Z: [-16, 14, 20, 32, 40, -19, 9][i % 7] + (i > 6 ? 3 : 0), v: (i % 2 ? 1 : -1) * (2.2 + (i % 5) * .7), off: i * 23, col: ['#d8452f', '#2f6fb5', '#e8b23a', '#3c8c5a', '#f2ede0', '#7a3c8c', '#e07a2f'][i % 7], i }));
  function bike(b, t) {
    const X = carX(clamp(t, 14, 238)) + ((((b.v * t + b.off) % 180) + 180) % 180) - 90, p = P(X, 0, b.Z); if (p[2] < 1.5 || p[0] < -150 || p[0] > W + 150) return null;
    return { z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1], d = Math.sign(b.v), wr = .34 * k, bob = (Math.floor(t * 8 + b.i) % 2) * .03 * k;
      g.strokeStyle = '#2a2420'; g.lineWidth = Math.max(1, .05 * k); for (const w of [-.55, .55]) { g.beginPath(); g.arc(x + w * k, y - wr, wr, 0, TAU); g.stroke(); }
      g.beginPath(); g.moveTo(x - .55 * k, y - wr); g.lineTo(x, y - .75 * k); g.lineTo(x + .55 * k, y - wr); g.moveTo(x, y - .75 * k); g.lineTo(x + d * .45 * k, y - 1.05 * k); g.stroke();
      g.fillStyle = b.col; g.fillRect(x - .17 * k, y - 1.55 * k - bob, .34 * k, .65 * k); g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(x + d * .05 * k, y - 1.72 * k - bob, .13 * k, 0, TAU); g.fill();
      g.strokeStyle = b.col; g.lineWidth = .08 * k; g.beginPath(); g.moveTo(x, y - 1.4 * k - bob); g.lineTo(x + d * .45 * k, y - 1.05 * k); g.stroke();
      if (b.i % 3 === 0) { g.fillStyle = '#f2ede0'; g.beginPath(); g.ellipse(x - d * .1 * k, y - 1.86 * k - bob, .28 * k, .06 * k, 0, 0, TAU); g.fill(); } }, shadow: () => shadowStick(X, 0, 1.8, b.Z, .5, t) };
  }
  // the crowd that walks a spiral to the Man at dusk, then rings it; on "we didn't vote" they hold up ballots (Nakamura's route)
  const CROWD = [...Array(90)].map((_, i) => ({ a: rnd(i, 11) * TAU, r: 22 + rnd(i, 12) * 14, col: ['#d8452f', '#2f6fb5', '#e8b23a', '#3c8c5a', '#f2ede0', '#7a3c8c'][i % 6], i }));
  function crowdInto(t, list) {
    if (t < 192) return; const arrive = ease(t, 194, 214);
    for (const c of CROWD) { const spin = (1 - arrive) * 2.4, a = c.a + spin, r = c.r + (1 - arrive) * 40, X = MAN.x + Math.cos(a) * r, Z = MAN.z + Math.sin(a) * r * .7; if (Z < -20) continue;
      const p = P(X, 0, Z); if (p[2] < 1.5 || p[0] < -100 || p[0] > W + 100) continue;
      list.push({ z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1], step = Math.floor(t * 6 + c.i) % 2 * (1 - arrive) * .05 * k, vote = t > L_(35).s ? ease(t, L_(35).s + c.i * .03, L_(35).s + .6 + c.i * .03) : 0;
        g.fillStyle = '#3a3040'; g.fillRect(x - .12 * k, y - .85 * k, .1 * k, .85 * k); g.fillRect(x + .02 * k, y - .85 * k + step, .1 * k, .85 * k - step);
        g.fillStyle = c.col; g.fillRect(x - .2 * k, y - 1.5 * k, .4 * k, .68 * k); g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(x, y - 1.65 * k, .13 * k, 0, TAU); g.fill();
        if (vote > 0) { const hx = x + .25 * k, hy = y - lerp(1.3, 2.15, vote) * k; g.strokeStyle = c.col; g.lineWidth = .09 * k; g.beginPath(); g.moveTo(x + .15 * k, y - 1.4 * k); g.lineTo(hx, hy); g.stroke(); g.fillStyle = '#fbf7ec'; g.fillRect(hx - .12 * k, hy - .32 * k, .24 * k, .3 * k); g.fillStyle = '#1a1a1a'; g.fillRect(hx - .07 * k, hy - .22 * k, .14 * k, .02 * k); } } });
    }
  }
  function spinners(t) { // fire spinners in the crowd at night: rings of light on chains
    const n = nightAmt(t); if (n < .3) return; g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) { const c = CROWD[i * 13], a = c.a, X = MAN.x + Math.cos(a) * (c.r - 4), Z = MAN.z + Math.sin(a) * (c.r - 4) * .7, p = P(X, 1.3, Z); if (p[2] < 2) continue; const k = kAt(p);
      for (let j = 0; j < 2; j++) { const ang = t * 9 + j * Math.PI + i, fx = p[0] + Math.cos(ang) * .9 * k, fy = p[1] + Math.sin(ang) * .9 * k; const rg = g.createRadialGradient(fx, fy, 0, fx, fy, .5 * k); rg.addColorStop(0, `rgba(255,210,120,${n})`); rg.addColorStop(1, 'rgba(255,90,20,0)'); g.fillStyle = rg; g.fillRect(fx - .5 * k, fy - .5 * k, k, k);
        g.strokeStyle = `rgba(255,150,60,${.5 * n})`; g.lineWidth = Math.max(1, .12 * k); g.beginPath(); g.arc(p[0], p[1], .9 * k, ang - .9, ang); g.stroke(); } }
    g.restore();
  }
  function ballotEmbers(t) { // the raised ballots burn and rise in the heat over the Man
    const s = L_(35).s + 2; if (t < s) return; g.save();
    for (let i = 0; i < 46; i++) { const ph = ((t - s) * .12 + rnd(i, 21)) % 1, X = MAN.x + (rnd(i, 22) - .5) * 30, Z = MAN.z + (rnd(i, 23) - .5) * 14, p = P(X + n1(900 + i, t * .4) * 3, 2 + ph * 26, Z); if (p[2] < 2) continue; const k = kAt(p);
      g.translate(p[0], p[1]); g.rotate(t * 1.5 + i); g.fillStyle = `rgba(255,${200 - ph * 120},${140 - ph * 120},${(1 - ph) * .9 * (1 - ease(t, 262, 267))})`; g.fillRect(-.22 * k, -.15 * k, .44 * k, .3 * k); g.setTransform(1, 0, 0, 1, 0, 0); }
    g.restore();
  }
  function dustDevil(X, Z, t, amt, seed) { // a spinning column of playa dust
    const p = P(X, 0, Z); if (p[2] < 2 || amt <= 0) return; const k = kAt(p), H2 = 14 * amt;
    g.save(); for (let i = 0; i < 26; i++) { const u = i / 26, y = p[1] - u * H2 * k, w = (.6 + u * u * 4) * k, a = t * 6 + u * 9 + seed; g.fillStyle = `rgba(214,182,130,${.16 * amt * (1 - u * .6)})`; g.beginPath(); g.ellipse(p[0] + Math.sin(a) * w * .35 + n1(seed, t + u) * k, y, w, .5 * k, 0, 0, TAU); g.fill(); } g.restore();
  }

  // ---------- lyric installations on the playa ----------
  // Von Ulrich: give the idea a body. A monumental ear on crutches listens from "every tape recorder" on; the recorders stack on its lobe.
  function bigEar(t, list) { const s = wt(2, 'every'); if (t < s - .3) return; const X = carX(s) + 14, Z = 24, grow = easeOutBack(clamp((t - s + .3) / 1.1));
    list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p) * grow, x = p[0], y = p[1], h = 9 * k;
      for (const d of [-1, 1]) { g.strokeStyle = PAL.crutch; g.lineWidth = Math.max(1, .25 * k); g.beginPath(); g.moveTo(x + d * 2.6 * k, y); g.lineTo(x + d * 1.4 * k, y - h * .55); g.stroke(); g.lineWidth = Math.max(1, .4 * k); g.strokeStyle = '#e9dcc2'; g.beginPath(); g.moveTo(x + d * 1.4 * k - .7 * k, y - h * .55); g.lineTo(x + d * 1.4 * k + .7 * k, y - h * .55); g.stroke(); }
      const eg = g.createRadialGradient(x - 1.2 * k, y - h * .78, .3 * k, x, y - h * .6, 5 * k); eg.addColorStop(0, '#f6d7bd'); eg.addColorStop(1, '#c58a6a'); g.fillStyle = eg;
      g.beginPath(); g.moveTo(x - .4 * k, y - h * .3); g.bezierCurveTo(x - 3.4 * k, y - h * .45, x - 3.2 * k, y - h * 1.08, x, y - h); g.bezierCurveTo(x + 2.6 * k, y - h * .95, x + 2.4 * k, y - h * .62, x + 1 * k, y - h * .52); g.bezierCurveTo(x + .2 * k, y - h * .45, x + 1 * k, y - h * .3, x - .4 * k, y - h * .3); g.fill();
      g.strokeStyle = '#9c5f45'; g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(x - 1.6 * k, y - h * .5); g.bezierCurveTo(x - 2.1 * k, y - h * .9, x + 1.6 * k, y - h * 1.0, x + 1 * k, y - h * .7); g.bezierCurveTo(x + .4 * k, y - h * .6, x - .6 * k, y - h * .7, x - .3 * k, y - h * .55); g.stroke();
      const n = Math.floor(clamp((t - s) / 2.5) * 6); for (let i = 0; i < n; i++) { g.fillStyle = '#3a3a40'; g.fillRect(x - 1.3 * k + (i % 3) * .8 * k, y - h * .3 - (1 + Math.floor(i / 3)) * .45 * k, .7 * k, .42 * k); g.fillStyle = '#d8d0bc'; g.beginPath(); g.arc(x - 1.1 * k + (i % 3) * .8 * k, y - h * .3 - (.8 + Math.floor(i / 3)) * .45 * k, .1 * k, 0, TAU); g.arc(x - .8 * k + (i % 3) * .8 * k, y - h * .3 - (.8 + Math.floor(i / 3)) * .45 * k, .1 * k, 0, TAU); g.fill(); } },
      shadow: () => shadowStick(X, 0, 9 * grow, Z, 3 * grow, t) }); }
  // a mouth sculpture with a padlock through its lips, on "gag order"
  function gagMouth(t, list) { const s = L_(2).s; if (t < s - .2) return; const X = carX(s) - 12, Z = 30, grow = easeOutBack(clamp((t - s + .2) / .9));
    list.push({ z: P(X, 0, Z)[2], draw: () => { const p = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p) * grow, x = p[0], y = p[1] - 5 * k;
      g.strokeStyle = '#6b4a2a'; g.lineWidth = Math.max(1, .3 * k); g.beginPath(); g.moveTo(x, p[1]); g.lineTo(x, y + 1.2 * k); g.stroke();
      g.fillStyle = '#c0322a'; g.beginPath(); g.moveTo(x - 3 * k, y); g.bezierCurveTo(x - 1.5 * k, y - 1.6 * k, x - .3 * k, y - .9 * k, x, y - .6 * k); g.bezierCurveTo(x + .3 * k, y - .9 * k, x + 1.5 * k, y - 1.6 * k, x + 3 * k, y); g.bezierCurveTo(x + 1.5 * k, y + 1.7 * k, x - 1.5 * k, y + 1.7 * k, x - 3 * k, y); g.fill();
      g.strokeStyle = '#6a1712'; g.lineWidth = Math.max(1, .12 * k); g.beginPath(); g.moveTo(x - 3 * k, y); g.quadraticCurveTo(x, y + .35 * k, x + 3 * k, y); g.stroke();
      g.strokeStyle = '#b8b4aa'; g.lineWidth = Math.max(1, .18 * k); g.beginPath(); g.arc(x, y + .1 * k, .45 * k, Math.PI, TAU); g.stroke(); g.fillStyle = '#c9a43a'; g.fillRect(x - .6 * k, y + .1 * k, 1.2 * k, .9 * k); },
      shadow: () => shadowStick(X, 0, 6.5 * grow, Z, 4 * grow, t) }); }
  // newspapers tumble across the playa on every "news"
  function tumblePapers(t, list) { for (const li of [4, 11, 32]) { const s = L_(li).s; if (t < s - .5 || t > L_(li).e + 3) continue; const base = carX(s);
    for (let i = 0; i < 6; i++) { const X = base - 30 + (t - s) * 7 + i * 6, Z = 6 + i * 5, Y = Math.abs(Math.sin((t - s) * 3 + i)) * 1.2;
      const p = P(X, Y + .4, Z); if (p[2] < 1) continue; list.push({ z: p[2], draw: () => { const k = kAt(p); g.save(); g.translate(p[0], p[1]); g.rotate((t - s) * 4 + i); g.fillStyle = '#ece6d6'; g.fillRect(-.45 * k, -.3 * k, .9 * k, .6 * k); g.fillStyle = 'rgba(120,110,95,.5)'; for (let c = 0; c < 3; c++) g.fillRect((-.38 + c * .27) * k, -.2 * k, .2 * k, .4 * k); g.restore(); }, shadow: () => {} }); } } }
  // a dust devil rises on every "spin"
  function spinDevils(t) { for (const li of [6, 13, 19, 34]) { const s = wt(li, 'spin'); const amt = ease(t, s - .3, s + 1) * (1 - ease(t, s + 5, s + 7)); if (amt > 0) dustDevil(carX(s) + 16, 28, t, amt, li); } dustDevil(carX(clamp(t, 14, 238)) - 45 + ((t * 3) % 90), 95, t, .6 * (1 - nightAmt(t)), 3); }
  // Gilliam, crowds of copies: a column of identical suits rolls across on wheels in each refrain and nods as one on "rehearsed"
  function suitColumn(t, list) { const wins = [[L_(4).s, L_(6).e], [L_(11).s, L_(13).e], [L_(30).s - .5, L_(34).e]];
    for (const [s, e] of wins) { if (t < s || t > e) continue; const base = carX(s), v = 2.6;
      for (let i = 0; i < 16; i++) { const X = base - 40 + (t - s) * (v + 1.6) - i * 2.2, Z = 13; const p = P(X, 0, Z); if (p[2] < 1.5 || p[0] < -80 || p[0] > W + 80) continue;
        list.push({ z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1], hop = (Math.floor((t - s) * 4) % 2) * .08 * k, nod = t > L_(30).s && t < L_(30).e ? Math.abs(Math.sin((t - L_(30).s) * 1.6 * Math.PI)) * .06 * k : 0;
          g.fillStyle = '#141216'; g.beginPath(); g.arc(x - .2 * k, y - .15 * k, .15 * k, 0, TAU); g.arc(x + .2 * k, y - .15 * k, .15 * k, 0, TAU); g.fill();
          g.fillStyle = PAL.suit; g.fillRect(x - .22 * k, y - 1.05 * k - hop, .44 * k, .8 * k); g.fillRect(x - .26 * k, y - 1.75 * k - hop, .52 * k, .72 * k);
          g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(x - .08 * k, y - 1.75 * k - hop); g.lineTo(x, y - 1.45 * k - hop); g.lineTo(x + .08 * k, y - 1.75 * k - hop); g.fill(); rosette(x - .15 * k, y - 1.62 * k - hop, .04 * k);
          egg(x, y - 1.95 * k - hop + nod, k, true, 0); }, shadow: () => shadowStick(X, 0, 2, Z, .5, t) }); } } }
  // Gilliam, take the lyric literally: wind-up chattering teeth roll past on "soundbite"
  function teeth(t, list) { const s = wt(8, 'patent') - .5; if (t < s || t > L_(9).s + 1) return; const X = carX(s) + 26 - (t - s) * 3.4, Z = 9; const p = P(X, 0, Z); if (p[2] < 1.5) return;
    list.push({ z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1] - .4 * k, ch = Math.abs(Math.sin(t * 14)) * .5 * k;
      g.fillStyle = '#e07a8a'; g.beginPath(); g.ellipse(x, y - .6 * k, 1.6 * k, .55 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x, y - 1.3 * k - ch, 1.6 * k, .55 * k, 0, 0, TAU); g.fill();
      g.fillStyle = '#fbf7ec'; for (let i = 0; i < 8; i++) { g.fillRect(x - 1.3 * k + i * .33 * k, y - 1 * k, .28 * k, .4 * k); g.fillRect(x - 1.3 * k + i * .33 * k, y - 1.3 * k - ch, .28 * k, .4 * k); }
      g.strokeStyle = '#c9a43a'; g.lineWidth = .12 * k; g.save(); g.translate(x + 1.9 * k, y - .9 * k); g.rotate(t * 5); g.beginPath(); g.moveTo(-.5 * k, 0); g.lineTo(.5 * k, 0); g.moveTo(0, -.5 * k); g.lineTo(0, .5 * k); g.stroke(); g.restore();
      g.fillStyle = '#1a1412'; g.beginPath(); g.arc(x - 1 * k, p[1] - .2 * k, .2 * k, 0, TAU); g.arc(x + 1 * k, p[1] - .2 * k, .2 * k, 0, TAU); g.fill(); }, shadow: () => shadowStick(X, 0, 2, Z, 3, t) }); }
  // a soft clock art car: its face droops over its cart; on "once upon a time" its hands run backward
  function clockCar(t, list) { const X = -10 + t * 1.42, Z = 42; const p = P(X, 0, Z); if (p[2] < 2 || p[0] < -300 || p[0] > W + 300) return;
    list.push({ z: p[2], draw: () => { const k = kAt(p), x = p[0], y = p[1], m = .4 + melt(t) * .8, back = wt(15, 'time'), hands = t < back ? t * .2 : back * .2 - ease(t, back, back + 3) * 25;
      g.fillStyle = '#4a3a2c'; g.fillRect(x - 3 * k, y - 1.6 * k, 6 * k, 1.2 * k); g.fillStyle = '#17120f'; g.beginPath(); g.arc(x - 2 * k, y - .4 * k, .4 * k, 0, TAU); g.arc(x + 2 * k, y - .4 * k, .4 * k, 0, TAU); g.fill();
      const cy = y - 4.2 * k, R = 2.6 * k; g.fillStyle = '#e8d9a8'; g.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, sag = Math.max(0, Math.sin(a)) * m * 2.2 * k * (.5 + .5 * Math.cos(a * 2)); const px = x + Math.cos(a) * R, py = cy + Math.sin(a) * R + sag; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); g.fill(); g.strokeStyle = '#b08a3a'; g.lineWidth = .18 * k; g.stroke();
      g.fillStyle = '#3a2a1a'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillRect(x + Math.cos(a) * R * .8 - .08 * k, cy + Math.sin(a) * R * .8 - .08 * k + Math.max(0, Math.sin(a)) * m * 1.2 * k, .16 * k, .16 * k); }
      g.strokeStyle = '#1a1412'; g.lineCap = 'round'; for (const [len, sp, w] of [[1.5, 1, .18], [2.1, 12, .1]]) { const a = hands * sp - Math.PI / 2; g.lineWidth = w * k; g.beginPath(); g.moveTo(x, cy); g.lineTo(x + Math.cos(a) * len * k, cy + Math.sin(a) * len * k); g.stroke(); } },
      shadow: () => shadowStick(X, 0, 7, Z, 5, t) }); }
  // Gilliam, lie about scale: chess pieces the size of art cars on "knight to queen's rook"
  function giantChess(t, list) { const s = L_(26).s, e = L_(27).e + .3; if (t < s - .3 || t > e) return; const base = carX(s), up = easeOutBack(clamp((t - s + .3) / .7)) * (1 - ease(t, e - .6, e)), foul = ease(t, wt(27, 'foul'), wt(27, 'foul') + .6);
    const pieces = [{ X: base + 16, Z: 20, kind: 'knight', col: '#1d1a1a' }, { X: base - 14, Z: 26, kind: 'rook', col: '#efe6cf' }, { X: base + 4, Z: 34, kind: 'rook', col: '#1d1a1a' }];
    for (const pc of pieces) { const p = P(pc.X, 0, pc.Z); if (p[2] < 1.5) continue; list.push({ z: p[2], draw: () => { const k = kAt(p) * up, x = p[0], y = p[1]; g.save(); g.translate(x, y); if (pc.kind === 'rook' && pc.col === '#efe6cf') g.rotate(foul * 1.4); g.fillStyle = pc.col;
      if (pc.kind === 'rook') { g.fillRect(-1.6 * k, -6 * k, 3.2 * k, 6 * k); g.fillRect(-2 * k, -7 * k, 4 * k, 1.2 * k); for (let i = 0; i < 3; i++) g.fillRect((-2 + i * 1.5) * k, -8 * k, 1 * k, 1 * k); g.fillRect(-2.2 * k, -.8 * k, 4.4 * k, .8 * k); }
      else { g.beginPath(); g.moveTo(-2.2 * k, 0); g.lineTo(2.2 * k, 0); g.lineTo(1.3 * k, -3 * k); g.quadraticCurveTo(3 * k, -5 * k, .5 * k, -8 * k); g.lineTo(-2.4 * k, -5.6 * k); g.lineTo(-.2 * k, -5 * k); g.lineTo(-1.3 * k, -3 * k); g.fill(); }
      g.restore(); }, shadow: () => shadowStick(pc.X, 0, 8 * up, pc.Z, 3 * up, t) }); } }
  // Gilliam, stop it from above, once: a giant gavel drops out of the sky at the end of the last refrain
  function bigGavel(t) { const s = L_(34).e - .5; if (t < s - .6 || t > s + 2.5) return; const X = carX(s) + 12, Z = 14, drop = t < s ? 1 - ((t - s + .6) / .6) ** 2 : 0, lift = ease(t, s + 1.1, s + 2.4);
    const yAir = (drop + lift) * 40, p = P(X, yAir, Z), pg = P(X, 0, Z); if (p[2] < 1) return; const k = kAt(p);
    g.save(); g.translate(p[0], p[1]); g.rotate(-.15); g.fillStyle = '#5a3418'; g.fillRect(-.6 * k, -12 * k, 1.2 * k, 12 * k); const hg = g.createLinearGradient(-4 * k, 0, 4 * k, 0); hg.addColorStop(0, '#9a5a2a'); hg.addColorStop(1, '#4a2410'); g.fillStyle = hg; g.fillRect(-4.5 * k, -2.6 * k, 9 * k, 2.6 * k); g.fillStyle = '#c9a43a'; g.fillRect(-4.5 * k, -1.8 * k, .5 * k, 1 * k); g.fillRect(4 * k, -1.8 * k, .5 * k, 1 * k); g.restore();
    const puff = t > s ? ease(t, s, s + .2) * (1 - ease(t, s + .4, s + 1.6)) : 0; if (puff > 0) { const kg = kAt(pg); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI, r = (4 + (t - s) * 10) * kg; g.fillStyle = `rgba(220,190,140,${.35 * puff})`; g.beginPath(); g.ellipse(pg[0] + Math.cos(a + Math.PI) * r, pg[1] - Math.sin(a) * r * .25, 2.5 * kg, 1 * kg, 0, 0, TAU); g.fill(); } } }
  // the pie of lies: blackbirds burst out on "pie" (four and twenty, near enough)
  function pieBirds(t) { const s = wt(23, 'pie'); if (t < s || t > s + 2.4) return;
    for (let i = 0; i < 9; i++) { const u = clamp((t - s - i * .06) / 2); if (u <= 0) continue; const p = PL(-.15 + (rnd(i, 31) - .5) * .4 + u * (rnd(i, 32) - .5) * 8, TOP + .1 + u * 4, -.95 - u * 2); if (p[2] < .3) continue; const k = kAt(p), f = Math.sin(t * 30 + i) * .25 * k;
      g.fillStyle = '#16131a'; g.beginPath(); g.ellipse(p[0], p[1], .14 * k, .07 * k, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] - .3 * k, p[1] - f); g.lineTo(p[0] - .1 * k, p[1] + .02 * k); g.lineTo(p[0] + .3 * k, p[1] - f); g.lineTo(p[0] + .1 * k, p[1] + .02 * k); g.fill(); } }
  // Nakamura, inhabit the object: tiny burners climb the line chart on the whiteboard (drawn in board units)
  function chartClimbers(t) { const pts = [[.58, .8], [.66, .72], [.73, .76], [.8, .58], [.87, .5], [.93, .34]];
    for (let i = 0; i < 3; i++) { const u = ((t * .05 + i / 3) % 1) * 5, j = Math.floor(u), f = u - j, a = pts[j], b = pts[j + 1]; const x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f) - .012;
      g.fillStyle = ['#d8452f', '#2f6fb5', '#3c8c5a'][i]; g.fillRect(x - .006, y - .03, .012, .03); g.fillStyle = '#e8d4b4'; g.beginPath(); g.arc(x, y - .036, .007, 0, TAU); g.fill(); } }

  // ---------- grade ----------
  function grade(t, layer) {
    const gold = ease(t, 172, 200) * (1 - ease(t, 205, 215)), night = ease(t, 199, 216);
    if (gold > 0) { g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,170,90,${gold * .5})`; g.fillRect(0, 0, W, H); }
    if (night > 0) { g.globalCompositeOperation = 'multiply'; g.fillStyle = rgb(mix([255, 255, 255], [52, 52, 104], night)); g.fillRect(0, 0, W, H); }
    g.globalCompositeOperation = 'source-over';
    if (night > .4 && !layer) { const hy = H / 2 - C.f * Math.tan(C.p); for (let i = 0; i < 160; i++) { const sx = rnd(i, 1) * W, sy = rnd(i, 2) * Math.min(hy - 20, H); if (sy < 0) continue; g.fillStyle = `rgba(255,250,235,${(night - .4) * .9 * (.4 + .6 * rnd(i, 3)) * (.75 + .25 * Math.sin(t * 3 + i))})`; g.fillRect(sx, sy, 2, 2); } }
    const b = burnAmt(t); if (b > 0) { const { p, k } = manGeom(); g.globalCompositeOperation = 'screen'; const R = Math.max(W, 70 * k); const rg = g.createRadialGradient(p[0], p[1] - 6 * k, 0, p[0], p[1], R); rg.addColorStop(0, `rgba(255,130,50,${.45 * b})`); rg.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  }
  function vignette() { const vg = g.createRadialGradient(W / 2, H * .55, H * .45, W / 2, H * .55, H * 1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,15,10,.38)'); g.fillStyle = vg; g.fillRect(0, 0, W, H); }

  // ---------- captions ----------
  const FONT = 'italic {s}px "Didot", "Bodoni 72", Georgia, serif';
  function captions(t) {
    let L = null; for (let i = 0; i < LINES.length; i++) { const l = LINES[i], nx = LINES[i + 1]; const end = Math.min(l.e + .6, nx ? nx.s - .05 : 1e9); if (t >= l.s - .05 && t < end) L = l; }
    if (!L) return; const n = wordsShown(L, t + .05); if (!n) return;
    const size = fitText(g, L.text, 1560, 50, FONT); g.font = FONT.replace('{s}', size); g.textBaseline = 'alphabetic';
    const words = L.text.split(/\s+/), gap = size * .27, widths = words.map((w) => g.measureText(w).width), tw = widths.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
    let x = W / 2 - tw / 2; const y = 1032;
    for (let i = 0; i < words.length; i++) { if (i < n) { const age = t - (L.words[i] ? L.words[i].s : L.s), a = clamp(age / .12 + .2);
      g.save(); g.globalAlpha = a; g.shadowColor = 'rgba(20,10,5,.85)'; g.shadowBlur = 14; g.shadowOffsetY = 3; g.fillStyle = '#f7ecd3'; g.fillText(words[i], x, y); g.restore();
      probeWord(t, L.i, i, (tt) => i < wordsShown(L, tt + .05)); }
      x += widths[i] + gap; }
  }

  // ---------- frame ----------
  function drawCar(t) {
    const seats = SEATS.map((s, i) => ({ s, i, d: PL(s.x, SEAT, s.z)[2] })).sort((a, b) => b.d - a.d), mid = PL(0, SEAT, 0)[2];
    const seatDraw = ({ s, i }) => { const G = seatGeom(s); crutch(G.crutch[0], G.crutch[1]); const a = PL(...G.beamA), b = PL(...G.beamB); seg(a, b, .1 * kAt(a), '#4a2a14'); const p = PL(s.x, SEAT, s.z); if (p[2] < .25) return; suit(p[0], p[1], kAt(p), seatState(s, t, i)); };
    seats.filter((x) => x.d > mid).forEach(seatDraw);
    tableBody(t); driverHat();
    chessPieces(t); speakerphone(t); dime(t); pie(t); book(t); chips(t); jailModel(t); newspapers(t);
    whiteboard(t, false);
    seats.filter((x) => x.d <= mid).forEach(seatDraw);
    tapeRecorders(t); truth(t, false); micBooms(t); pieBirds(t); bobPopUp(t);
  }
  function render(t) {
    C = camAt(t); CP = Math.cos(C.p); SP = Math.sin(C.p); CX = carX(t); CZ = carZ(t); YAW = yaw(t);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    skyAndGround(t);
    const list = [];
    list.push({ z: P(MAN.x, 0, MAN.z)[2], draw: () => theMan(t), shadow: () => shadowStick(MAN.x, 0, 22, MAN.z, 6, t) });
    elephantsInto(t, list); jails(t, list); poorPerson(t, list); cops(t, list);
    for (const c of CAMPS) { const z = P(c.X, 0, c.Z)[2]; if (z > 2) list.push({ z, draw: () => camp(c, t), shadow: () => shadowOf([[c.X - c.r, 0, c.Z], [c.X + c.r, 0, c.Z], [c.X, c.r, c.Z]], t) }); }
    for (const l of LAMPS) { const z = P(l.X, 0, l.Z)[2]; if (z > 2) list.push({ z, draw: () => lamp(l, t, false), shadow: () => shadowStick(l.X, 0, 5, l.Z, .15, t) }); }
    for (const b of BIKES) { const o = bike(b, t); if (o) list.push(o); }
    crowdInto(t, list); bigEar(t, list); gagMouth(t, list); tumblePapers(t, list); suitColumn(t, list); teeth(t, list); clockCar(t, list); giantChess(t, list);
    for (const o of list) if (o.z > .5 && o.shadow) o.shadow();
    tableShadow(t);
    list.sort((a, b) => b.z - a.z); for (const o of list) if (o.z > .3) o.draw();
    spinDevils(t); bigGavel(t);
    grade(t);
    for (const l of LAMPS) lamp(l, t, true); spinners(t);
    // the car layer: drawn, graded, lit by its own emissive props, masked to its own pixels, then laid over the fire
    g = gc; gc.setTransform(1, 0, 0, 1, 0, 0); gc.globalCompositeOperation = 'source-over'; gc.globalAlpha = 1; gc.clearRect(0, 0, W, H);
    drawCar(t); gm.clearRect(0, 0, W, H); gm.drawImage(CARC, 0, 0); grade(t, true); gc.globalCompositeOperation = 'destination-in'; gc.drawImage(MASK, 0, 0); gc.globalCompositeOperation = 'source-over';
    whiteboard(t, true); truth(t, true); g = g0;
    const carBehind = P(CX, 0, CZ)[2] > P(MAN.x, 0, MAN.z)[2];
    if (carBehind) g.drawImage(CARC, 0, 0);
    manFire(t); ballotEmbers(t);
    if (!carBehind) g.drawImage(CARC, 0, 0);
    bobWalk(t);
    vignette();
    drawGrain(g, t, .1);
    const fin = ease(t, 266.5, 268.9), fo = 1 - ease(t, 0, 1.2), blk = Math.max(fin, fo); if (blk > 0) { g.fillStyle = `rgba(0,0,0,${blk})`; g.fillRect(0, 0, W, H); }
    captions(t);
  }

  startPage(out, render, 0, 268.99);
})();
