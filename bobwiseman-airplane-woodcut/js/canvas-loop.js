// Spotify Canvas loop (720 x 1280, 8 s, silent): the Escher highway, cut in the woodcut world.
// A Penrose ring road on top of a carved tower, seen from the front and a little above (a board-game
// 3/4 view). He drives round it clockwise: right along the back, where the road steps DOWN a storey;
// toward us down the right side (we get his face); left along the front, where it steps DOWN another
// storey; then away from us up the left side (we see his tail) and he is back at the start, on top.
// Downhill twice, never up, and the road returns to itself every 8 seconds. Wheels on the deck always.
//
// How the impossible ring is built: every leg is an honest 3D object and the road is one continuous
// path that drops two storeys per lap. The left (receding) leg is longer by exactly the distance that
// puts the lap's end straight down the view ray from its start, so the two project onto one point:
// the seam hides along the line of sight, like Penrose's stairs. The two ramps run across the screen,
// so they show in true profile (no climb or dive reads); the legs that run up and down the screen
// are flat, and there he is seen tail-on or face-on, never nose-up.
//
// Kit files used unchanged: js/core.js (helpers), js/wood.js (carving marks), js/gl.js (shader noise),
// js/look.js (the print shader, re-sized from 1920 x 1080 design pixels to 720 x 1280).
// The plane (as a small 3D carving of the chapter's side profile) and the carved-world helpers are
// re-cut here from js/ch/01-airplane.js, which keeps them inside its closure, with heavier lines for phone size.
// Timing: drawings on twos (12 / s) and the print re-pulled on threes (8 / s), both phased so a hold
// straddles the wrap (frame 191 and frame 0 are the same drawing and the same pull).
(() => {
  const CW = 720, CH = 1280, LAP = 8;
  const PRM = new URLSearchParams(location.search);
  const OW = Math.round(+(PRM.get('w') || CW)), OH = Math.round(+(PRM.get('h') || CH));
  const OB = .22, BB = .5;                                        // oblique 3/4 view: toward us = down the screen (BB) and a touch right (OB)
  const VD = [-OB, 1, BB];                                        // the view ray (projects to a point)
  const wrapT = (t) => ((t % LAP) + LAP) % LAP;
  let LW = 1;                                                     // line-weight multiplier (plane: heavier)
  const L = (x) => x * LW;

  // ======================= the world, projected =======================
  let OX = 0, OY = 0;
  const iso = (x, y, z) => [OX + x + y * OB, OY + y * BB - z];
  const sv = (x, y, z) => [x + y * OB, y * BB - z];

  const A = 360, C = 300, HD = 60, WD = 30, TH = 14, RL = 150;   // back leg, side leg, storey, half width, fascia, ramp run
  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const KV = 2 * HD / BB;                                // the lap ends KV down the view ray from where it began
  const LENS = [A, C, A - OB * KV, C + KV];
  const LEGS = [];
  {
    let c = [0, 0, 0];
    for (let i = 0; i < 4; i++) {
      const u = DIRS[i], Ln = LENS[i];
      const vis = u[0] !== 0 ? [0, 1] : [-1, 0];                  // the side of the deck that faces us
      const near = i === 2 || i === 3;                            // near legs show their outer face
      const ramps = u[0] !== 0 ? [(Ln - RL) / 2] : [];            // the legs across the screen step down a storey
      LEGS.push({ i, c: [...c], u, vis, L: Ln, ramps, z0: c[2], near, outerSign: near ? 1 : -1 });
      c = [c[0] + u[0] * Ln, c[1] + u[1] * Ln, c[2] - HD * ramps.length];
    }
  }
  // a constant grade with rounded ends (no steep middle, so the plane tips but never dives)
  const grade = (u, e = .22) => { u = clamp(u); const k = 1 / (1 - e); return u < e ? k * u * u / (2 * e) : u > 1 - e ? 1 - k * (1 - u) * (1 - u) / (2 * e) : k * (u - e / 2); };
  const prof = (g, st) => g.ramps.reduce((z, ra) => z - HD * grade((st - ra) / RL), g.z0);
  // a point on leg g: station st along it, l across it (+ toward the visible side), dz above the deck
  const P3 = (g, st, l = 0, dz = 0) => [g.c[0] + g.u[0] * st + g.vis[0] * l, g.c[1] + g.u[1] * st + g.vis[1] * l, prof(g, st) + dz];
  const PS = (g, st, l, dz) => iso(...P3(g, st, l, dz));
  const sts = (g, s0, s1, n = 12) => { const o = [s0]; for (const ra of g.ramps) for (let k = 0; k <= n; k++) { const q = ra + RL * k / n; if (q > s0 && q < s1) o.push(q); } o.push(s1); return o; };
  function ptsPath(pts) { s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); }
  const polyline = (pts, w, c = INK, cap = 'round') => { s.lineCap = cap; s.lineJoin = 'round'; s.lineWidth = w; s.strokeStyle = c; s.beginPath(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.stroke(); };

  function placeWorld() {
    OX = 0; OY = 0;
    const xs = []; for (const g of LEGS) for (const st of [-WD, g.L + WD]) for (const l of [-WD, WD]) xs.push(PS(g, st, l, 0)[0]);
    OX = CW / 2 - (Math.min(...xs) + Math.max(...xs)) / 2;
    OY = 405;
  }

  // ======================= the carved world (re-cut from the chapter, for a 720-wide block) =======================
  function skyLines(y0, y1, gap, wTop, wBot, seed) {
    for (let y = y0, r = 0; y < y1; y += gap, r++) {
      const w = lerp(wTop, wBot, (y - y0) / Math.max(1, y1 - y0)); if (w < 1) continue;
      const g = rng(seed + r * 31); let x = -40 - g() * 200;
      while (x < CW + 40) {
        const l = 50 + g() * 150, gp = 18 + g() * 46;
        const pts = []; for (let k = 0; k <= 6; k++) { const xx = x + l * k / 6; pts.push([xx, y + Math.sin(xx * .009 + r) * 4]); }
        taper(pts.slice(0, 4), .5, w); taper(pts.slice(3), w, .5);
        x += l + gp;
      }
    }
  }
  function sun(T, x, y, r) {
    dot(x, y, r * 2.05, CUT);
    for (let i = 0; i < 20; i++) { const a = i / 20 * TAU + T * TAU / 10 / LAP; const l = i % 2 ? r * .55 : r * .85;  // one ray-pair per lap
      const p0 = [x + Math.cos(a) * r * 1.22, y + Math.sin(a) * r * 1.22]; taper([p0, [x + Math.cos(a) * (r * 1.22 + l), y + Math.sin(a) * (r * 1.22 + l)]], 10, 1); }
    s.beginPath(); s.arc(x, y, r, 0, TAU); s.lineWidth = 8; s.strokeStyle = INK; s.stroke();
    for (let i = 0; i < 3; i++) { s.beginPath(); s.arc(x, y, r * (.72 - i * .2), .3 + i, 2.6 + i); s.lineWidth = 3.5; s.stroke(); }
  }
  function cloud(x, y, sc, seed) {
    const r = rng(seed), C = []; for (let i = 0; i < 5; i++) C.push([x + (i - 2) * 52 * sc + (r() - .5) * 20 * sc, y - Math.sin(i / 4 * Math.PI) * 38 * sc + (r() - .5) * 10 * sc, (38 + r() * 26) * sc]);
    C.push([x, y + 8 * sc, 70 * sc]);
    for (const [a, b, rr] of C) dot(a, b, rr + 5, INK);
    for (const [a, b, rr] of C) dot(a, b, rr, CUT);
    s.fillStyle = CUT; s.fillRect(x - 170 * sc, y + 24 * sc, 340 * sc, 60 * sc);
    taper([[x - 175 * sc, y + 26 * sc], [x + 175 * sc, y + 26 * sc]], 4, 4);
    for (const [a, b, rr] of C.slice(0, 5)) taper(arcPts(a, b, rr * .62, rr * .62, Math.PI * .7, Math.PI * 1.45, 8), 1, 4);
  }
  function farHills(base, seed) {
    const hy = (x) => base - 70 + 30 * Math.sin(x * .0085 + seed) + 18 * Math.sin(x * .021 + seed * 2);
    const mk = () => { s.beginPath(); s.moveTo(-60, base + 4); for (let x = -60; x <= CW + 60; x += 12) s.lineTo(x, hy(x)); s.lineTo(CW + 60, CH + 60); s.lineTo(-60, CH + 60); s.closePath(); };
    shape(mk, INK);
    clipTo(mk, () => { for (let j = 0; j < 8; j++) for (let x = -60; x < CW + 60; x += 30) { const y = hy(x + 15) + 16 + j * 16; flick(x + (j % 2) * 15, y, -.5, 18, 5); flick(x + (j % 2) * 15 + 13, y - 8, .5, 18, 5); } });
  }
  function tree(x, y, h, seed) {
    taper([[x, y], [x, y - h * .6]], 8, 5);
    const r = h * .28, cy = y - h * .62 - r * .7;
    s.beginPath(); s.ellipse(x, cy, r, r * 1.2, 0, 0, TAU); s.fillStyle = INK; s.fill();
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * .42; flick(x + Math.cos(a) * r * .2, cy + r * .5 + Math.sin(a) * r * .2, a, r * .95, 5); }
  }
  function nearHills(base, seed) {
    const g = rng(seed), M = []; for (let x = -120; x < CW + 200;) { const R = 120 + g() * 90; M.push([x, R, g()]); x += R * 1.3; }
    for (const [x, R, kind] of M) {
      const mk = () => { s.beginPath(); s.ellipse(x, base, R, R * .5, 0, Math.PI, TAU); s.closePath(); };
      shape(mk, CUT);
      clipTo(mk, () => {
        for (let i = 1; i < 9; i++) { const f = 1 - i * .1; taper(arcPts(x, base, R * f, R * .5 * f, Math.PI * 1.02, TAU * .99, 20), 1 + i * .25, 1 + i * .25); }
        if (kind > .55) rows(x - R, base - R, x + R, base, .6, 13, () => 3.5);
      });
      shape(mk, null, 6);
      if (kind < .5) tree(x + (kind - .25) * R, base - R * .5 + 6, 90 + kind * 50, x);
    }
    s.fillStyle = INK; s.fillRect(-50, base, CW + 100, CH - base + 60);
    for (let j = 0; j < 9; j++) for (let x = -40; x < CW + 46; x += 40) { const y = base + 30 + j * 30, xx = x + (j % 2) * 20; flick(xx, y, -1.9, 22, 5); flick(xx + 5, y, -1.25, 22, 5); }
  }
  function bird(x, y, sc, flap) {
    const up = Math.sin(flap) * 9 * sc;
    taper([[x - 22 * sc, y - 4 * sc - up], [x - 10 * sc, y - 6 * sc - up * .5], [x, y]], 1.5, 5);
    taper([[x, y], [x + 10 * sc, y - 6 * sc - up * .5], [x + 22 * sc, y - 4 * sc - up]], 5, 1.5);
  }

  // ======================= the tower and the ring road =======================
  function courtyard() {
    const pts = LEGS.map((g) => iso(g.c[0] + (g.u[0] - g.outerSign * g.vis[0]) * WD, g.c[1] + (g.u[1] - g.outerSign * g.vis[1]) * WD, g.z0));
    ptsPath(pts); s.fillStyle = INK; s.fill();
  }
  // the wall hanging under a leg on its visible side, from the fascia down by `deep`
  function wallPath(g, s0, s1, deep) {
    const q = sts(g, s0, s1);
    const top = q.map((st) => PS(g, st, WD, -TH)), bot = q.slice().reverse().map((st) => PS(g, st, WD, -TH - deep));
    return () => ptsPath([...top, ...bot]);
  }
  // courses of stone at fixed world heights, across a wall plane (absolute z, so they ignore the ramps)
  function courses(g, s0, s1, zTop, zBot, gap, wf, c = INK) {
    for (let z = Math.floor(zTop / gap) * gap, k = 0; z > zBot; z -= gap, k++) {
      const a = iso(...[g.c[0] + g.u[0] * s0 + g.vis[0] * WD, g.c[1] + g.u[1] * s0 + g.vis[1] * WD, z]);
      const b = iso(...[g.c[0] + g.u[0] * s1 + g.vis[0] * WD, g.c[1] + g.u[1] * s1 + g.vis[1] * WD, z]);
      const w = wf((zTop - z) / (zTop - zBot)); if (w < .5) continue;
      s.lineWidth = w; s.strokeStyle = c; s.lineCap = 'butt'; s.beginPath(); s.moveTo(...a); s.lineTo(...b); s.stroke();
      // staggered joints
      const n = Math.floor((s1 - s0) / 22);
      for (let j = 0; j < n; j++) {
        const st = s0 + (j + (k % 2) * .5 + .25) * (s1 - s0) / n;
        const p = iso(g.c[0] + g.u[0] * st + g.vis[0] * WD, g.c[1] + g.u[1] * st + g.vis[1] * WD, z);
        s.lineWidth = Math.max(1.5, w * .8); s.beginPath(); s.moveTo(p[0], p[1]); s.lineTo(p[0], p[1] + gap * .9); s.stroke();
      }
    }
  }
  // a wall-plane frame: x = station along the leg, y = -z (down), on the visible face
  function onWall(g, fn) {
    const o = iso(g.c[0] + g.vis[0] * WD, g.c[1] + g.vis[1] * WD, 0), e = sv(g.u[0], g.u[1], 0);
    withT(() => { s.transform(e[0], e[1], 0, 1, o[0], o[1]); fn(); });
  }
  function archWindow(x, y, w, h) {   // y = top of the arch, in wall coords
    s.beginPath(); s.moveTo(x - w / 2, y + h); s.lineTo(x - w / 2, y + w / 2); s.arc(x, y + w / 2, w / 2, Math.PI, 0); s.lineTo(x + w / 2, y + h); s.closePath();
    s.fillStyle = CUT; s.fill(); s.lineWidth = 7; s.strokeStyle = CUT; s.stroke();
    s.beginPath(); s.moveTo(x - w / 2, y + h); s.lineTo(x - w / 2, y + w / 2); s.arc(x, y + w / 2, w / 2, Math.PI, 0); s.lineTo(x + w / 2, y + h); s.closePath();
    s.fillStyle = INK; s.fill();
    flick(x - w * .25, y + h * .3, Math.PI / 2, h * .45, 2.5);
  }
  function farWall(g) {   // inner wall of a far leg, falling into the dark courtyard
    const mk = wallPath(g, WD, g.L - WD, 300);
    shape(mk, CUT);
    clipTo(mk, () => {
      const zt = g.z0 + 10, zb = g.z0 - HD - 300;
      s.fillStyle = INK; s.fillRect(-100, -100, CW + 200, CH + 200);
      courses(g, WD - 40, g.L - WD + 40, zt, zt - 120, 16, (v) => lerp(6, 1, v), CUT);
    });
  }
  function nearWall(g) {  // outer facade of a near leg, down to the hills
    const mk = wallPath(g, -WD, g.L + WD, 900);
    const lit = g.vis[1] === 1;              // the front face is in the sun; the left face is in shade
    shape(mk, CUT);
    clipTo(mk, () => {
      const zt = g.z0 + 10, zb = g.z0 - 900;
      if (!lit) {   // the left face is seen at a slant: courses would crowd into solid black, so it gets the side shading of a print, plain vertical cuts
        const a = PS(g, 0, WD, 0), b = PS(g, g.L, WD, 0);
        for (let x = Math.min(a[0], b[0]) - 4; x < Math.max(a[0], b[0]) + 8; x += 7) polyline([[x, 0], [x, CH]], 2.6, INK, 'butt');
        return;
      }
      courses(g, -WD - 40, g.L + WD + 40, zt, zb, 13, (v) => lerp(2, 5, v));
      onWall(g, () => {
        const n = Math.max(2, Math.round(g.L / 62));
        for (let row = 0; row < 3; row++) for (let j = 0; j < n; j++) {
          const x = (j + .5) * g.L / n, ztop = prof(g, x) - TH - 38 - row * 92;
          archWindow(x, -ztop, 18, 40);
        }
      });
    });
    shape(mk, null, 4);
  }
  function fascia(g, s0, s1) {
    const q = sts(g, s0, s1);
    const top = q.map((st) => PS(g, st, WD, 0)), bot = q.slice().reverse().map((st) => PS(g, st, WD, -TH));
    const mk = () => ptsPath([...top, ...bot]);
    shape(mk, CUT);
    polyline(q.map((st) => PS(g, st, WD, -TH)), 4);
    polyline(q.map((st) => PS(g, st, WD, -TH * .45)), 2);
    shape(mk, null, 3);
  }
  function deck(g) {
    const q = sts(g, -WD, g.L + WD);
    const left = q.map((st) => PS(g, st, -WD, 0)), right = q.slice().reverse().map((st) => PS(g, st, WD, 0));
    ptsPath([...left, ...right]); s.fillStyle = INK; s.fill();
    // white edge lines, set in from the kerbs
    for (const l of [-WD + 6, WD - 6]) polyline(sts(g, -WD + 6, g.L + WD - 6).map((st) => PS(g, st, l, 0)), 3.4, CUT);
    // carved centre dashes (fixed to the road)
    for (let st = 12; st < g.L - 10; st += 26) polyline([PS(g, st, 0, 0), PS(g, st + 12, 0, 0)], 3.6, CUT, 'butt');
    // red chevrons on the ramp, pointing down the hill
    for (const ra of g.ramps) for (const c0 of [ra + 10, ra + 40, ra + 70]) {
      const ch = [[c0, -WD + 3], [c0 + 16, 0], [c0, WD - 3], [c0 + 12, WD - 3], [c0 + 28, 0], [c0 + 12, -WD + 3]];
      ptsPath(ch.map(([st, l]) => PS(g, st, l, 0))); s.fillStyle = RED; s.fill();
    }
  }
  // a carved turret behind a back corner (so he is seen against stone there, not open sky)
  function turret(cx, z0, seed) {
    const w = 44, d = 64, h = 118, y1 = -WD - 6, y0 = y1 - d, zb = z0 - 420, zt = z0 + h;
    const front = [iso(cx - w, y1, zb), iso(cx + w, y1, zb), iso(cx + w, y1, zt), iso(cx - w, y1, zt)];
    const left = [iso(cx - w, y0, zb), iso(cx - w, y1, zb), iso(cx - w, y1, zt), iso(cx - w, y0, zt)];
    const top = [iso(cx - w, y1, zt), iso(cx + w, y1, zt), iso(cx + w, y0, zt), iso(cx - w, y0, zt)];
    const apex = iso(cx, (y0 + y1) / 2, zt + 92);
    shape(() => ptsPath(left), CUT, 4);
    clipTo(() => ptsPath(left), () => { for (let x = left[0][0] - 2; x < left[2][0] + 4; x += 6) polyline([[x, 0], [x, CH]], 2.4, INK, 'butt'); });
    shape(() => ptsPath(front), CUT, 4);
    clipTo(() => ptsPath(front), () => {
      for (let z = zt - 13, k = 0; z > zb; z -= 13, k++) { const a = iso(cx - w, y1, z), b = iso(cx + w, y1, z); polyline([a, b], 2.2, INK, 'butt');
        for (let j = 0; j < 4; j++) { const x = cx - w + (j + (k % 2) * .5 + .25) * 2 * w / 4, p = iso(x, y1, z); polyline([p, [p[0], p[1] + 12]], 2, INK, 'butt'); } }
      const sl = iso(cx, y1, zt - 34); s.beginPath(); s.roundRect(sl[0] - 6, sl[1], 12, 34, 6); s.fillStyle = INK; s.fill();
    });
    shape(() => ptsPath(top), INK);
    shape(() => ptsPath([top[3], top[0], apex]), INK);                                     // the roof, left pitch in shade
    const fr = [top[0], top[1], apex];
    shape(() => ptsPath(fr), INK);
    clipTo(() => ptsPath(fr), () => { const g = rng(seed); for (let r = 0; r < 6; r++) for (let q = 0; q < 6; q++) flick(lerp(top[0][0], top[1][0], (q + .5 * (r % 2)) / 6) + (g() - .5) * 3, top[0][1] - 6 - r * 14, -Math.PI / 2, 12, 4.5); });
    dot(apex[0], apex[1] - 6, 6, INK);
  }
  function rail(g, front) {   // guard rail on the outer kerb
    const l = g.outerSign * (WD - 2), q = [];
    for (let st = -WD + 5; st <= g.L + WD - 5; st += 15) q.push(st);
    const draw = (w, c) => {
      for (const st of q) polyline([PS(g, st, l, 0), PS(g, st, l, 11)], w, c, 'butt');
      polyline(sts(g, -WD + 5, g.L + WD - 5).map((st) => PS(g, st, l, 11)), w, c);
    };
    if (front) draw(6.5, CUT);
    draw(2.8, INK);
  }

  // ======================= the plane (re-cut from the chapter at phone weight) =======================
  const FUSE = [[292, -170], [276, -236], [200, -276], [60, -283], [-110, -271], [-250, -251], [-345, -243], [-360, -214], [-302, -183], [-232, -136], [-110, -100], [60, -92], [200, -90], [274, -114]];
  const BELLY = [[-380, -200], [-302, -183], [-232, -136], [-110, -100], [60, -92], [150, -90], [175, -60]];
  const FIN = chisel([[-225, -244], [-290, -410], [-356, -416], [-364, -236]], 11, 5);

  function starPath(x, y, r, n = 5, inner = .45, rot = -Math.PI / 2) { s.beginPath(); for (let i = 0; i < n * 2; i++) { const rr = i % 2 ? r * inner : r, a = rot + i * Math.PI / n; s[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } s.closePath(); }
  function tyre(cx, cy, r, ang) {
    dot(cx, cy, r + L(6), CUT);
    dot(cx, cy, r, INK);
    for (let i = 0; i < 10; i++) { const a = ang + i * TAU / 10; flick(cx + Math.cos(a) * r * .98, cy + Math.sin(a) * r * .98, a + Math.PI, r * .3, L(6)); }
    s.beginPath(); s.arc(cx, cy, r * .52, 0, TAU); s.lineWidth = L(7); s.strokeStyle = CUT; s.stroke();
    for (let i = 0; i < 4; i++) { const a = ang * 1.3 + i * TAU / 4; flick(cx, cy, a, r * .42, L(5)); }
  }
  function nacelle(cx, cy, len, rad) {
    const P = [[cx + len * .5, cy], [cx + len * .35, cy - rad], [cx - len * .4, cy - rad * .7], [cx - len * .62, cy], [cx - len * .4, cy + rad * .7], [cx + len * .35, cy + rad]];
    shape(() => smoothPath(P), CUT, L(6));
    s.beginPath(); s.ellipse(cx + len * .38, cy, rad * .34, rad * .98, 0, 0, TAU); s.fillStyle = INK; s.fill();
  }
  // a prop seen face on, drawn in its own disc plane (lateral x vertical)
  function propDisc(cz, cy, R, spin) {
    for (let g = 0; g < 3; g++) { const f = .55 + g * .2, a0 = spin * .7 + g * 1.9;
      s.beginPath(); s.arc(cz, cy, R * f, a0, a0 + 1.4); s.lineWidth = L(3.5); s.strokeStyle = INK; s.lineCap = 'round'; s.stroke(); }
    for (let i = 0; i < 2; i++) { const a = spin + i * Math.PI, tip = [cz + Math.cos(a) * R, cy + Math.sin(a) * R];
      taper([[cz, cy], tip], L(12), L(4)); }
    dot(cz, cy, R * .2, INK);
  }

  // ---- the plane as a small 3D carving: local lx forward, ly down (the chapter's units), lz to his left ----
  // every part is flat or a stack of flat profiles, so each is drawn through an affine map of its own plane;
  // parts are sorted far to near along the view ray. Eyes, brows, mouth and nose face us (cartoon), so he
  // keeps his face from any heading.
  const R3 = 72, SPAN = 250, WLY = -112, RT = 64;          // body half-width, wing half-span, wing height, tyre track
  const WINGP = (sg) => chisel([[70, sg * R3 * .7], [-115, sg * R3 * .7], [-160, sg * SPAN], [-92, sg * SPAN]], sg > 0 ? 13 : 14, 4);
  const STABP = (sg) => chisel([[-250, sg * 24], [-336, sg * 24], [-384, sg * 150], [-350, sg * 150]], sg > 0 ? 12 : 22, 4);
  function plane3D(F, o) {
    const { Ex, Ey, Ez, O, dirH } = F;                        // screen vectors per local unit, origin, heading (world xy)
    const P = (lx, ly, lz) => [O[0] + lx * Ex[0] + ly * Ey[0] + lz * Ez[0], O[1] + lx * Ex[1] + ly * Ey[1] + lz * Ez[1]];
    const lat = [-dirH[1], dirH[0]];
    const depth = (lx, ly, lz) => lx * (dirH[0] * VD[0] + dirH[1]) + lz * (lat[0] * VD[0] + lat[1]) - ly * VD[2];   // + is toward us
    const toward = (dirH[0] * VD[0] + dirH[1]) / Math.hypot(VD[0], 1);   // 1 nose-on, -1 tail-on
    const nearS = (lat[0] * VD[0] + lat[1]) >= 0 ? 1 : -1;
    const side = (lz, fn) => withT(() => { const p = P(0, 0, lz); s.transform(Ex[0], Ex[1], Ey[0], Ey[1], p[0], p[1]); fn(); });   // (lx, ly) plane
    const flat = (ly, fn) => withT(() => { const p = P(0, ly, 0); s.transform(Ex[0], Ex[1], Ez[0], Ez[1], p[0], p[1]); fn(); });   // (lx, lz) plane
    const disc = (lx, fn) => withT(() => { const p = P(lx, 0, 0); s.transform(Ez[0], Ez[1], Ey[0], Ey[1], p[0], p[1]); fn(); });   // (lz, ly) plane
    const Y0 = -185, shrink = (c, fn) => { s.translate(0, Y0); s.scale(1, c); s.translate(0, -Y0); fn(); };
    const parts = [];
    // car tyres with a tread width (a stack of black discs, the carved face on the side toward us)
    for (const tx of [120, -175]) for (const sg of [-1, 1]) parts.push([depth(tx, -52, sg * RT), () => {
      for (const dz of [-14, -7, 0, 7]) side(sg * RT - nearS * dz, () => { dot(tx, -52, 52 + L(5), CUT); });
      for (const dz of [-14, -7, 0, 7]) side(sg * RT - nearS * dz, () => dot(tx, -52, 52, INK));
      side(sg * RT + nearS * 7, () => {
        tyre(tx, -52, 52, o.roll);
        if (sg === nearS) { s.beginPath(); s.arc(tx, -52, 74, Math.PI * 1.04, Math.PI * 1.96); s.arc(tx, -52, 60, Math.PI * 1.96, Math.PI * 1.04, true); s.closePath(); s.fillStyle = INK; s.fill(); }
      });
    }]);
    for (const sg of [-1, 1]) parts.push([depth(-60, WLY, sg * SPAN * .55), () => {
      const propFirst = toward < 0;
      const pr = () => disc(52, () => propDisc(sg * 175, WLY, 54, o.spin + sg));
      if (propFirst) pr();
      flat(WLY + 12, () => { pathOf(WINGP(sg)); s.fillStyle = INK; s.fill(); });                            // the wing's thickness
      flat(WLY, () => {
        shape(() => pathOf(WINGP(sg)), CUT);
        clipTo(() => pathOf(WINGP(sg)), () => { for (let i = 0; i < 4; i++) taper([[-40 - i * 22, sg * R3 * .6], [-110 - i * 14, sg * SPAN * 1.02]], L(1.5 + i * 1.6), L(1.5 + i * 1.6)); s.beginPath(); s.rect(-200, sg > 0 ? SPAN - 40 : -SPAN - 10, 160, 50); s.fillStyle = INK; s.fill(); });
        shape(() => pathOf(WINGP(sg)), null, L(7));
      });
      side(sg * 175, () => nacelle(-10, WLY - 4, 96, 22));
      if (!propFirst) pr();
    }]);
    for (const sg of [-1, 1]) parts.push([depth(-320, -205, sg * 90), () => flat(-205, () => { shape(() => pathOf(STABP(sg)), CUT, L(6));
      clipTo(() => pathOf(STABP(sg)), () => taper([[-300, sg * 30], [-372, sg * 140]], L(4), L(4))); })]);
    parts.push([depth(-310, -330, 0), () => {   // the fin, a black slab with the star cut on the face toward us
      for (const dz of [-12, -6, 0, 6, 12]) side(dz, () => { pathOf(FIN); s.lineWidth = L(5); s.strokeStyle = INK; s.lineJoin = 'round'; s.stroke(); s.fillStyle = INK; s.fill(); });
      side(nearS * 12, () => {
        clipTo(() => pathOf(FIN), () => { for (let i = 0; i < 4; i++) flick(-350 + i * 26, -238, -1.95, 120 + i * 9, L(7)); });
        starPath(-318, -352, 30); s.fillStyle = CUT; s.fill(); starPath(-318, -352, 18); s.fillStyle = INK; s.fill();
      });
    }]);
    // the body: the chapter's side profile, stacked across its width and rounded off toward the sides
    const NS = 9, layers = []; for (let k = 0; k < NS; k++) { const lz = lerp(-R3, R3, k / (NS - 1)); layers.push([lz, Math.sqrt(1 - .62 * (lz / R3) ** 2)]); }
    layers.sort((a, b) => (a[0] - b[0]) * nearS);
    parts.push([depth(-30, -185, 0), () => {
      for (const [lz, c] of layers) side(lz, () => shrink(c, () => { smoothPath(FUSE); s.lineWidth = L(16) / c; s.strokeStyle = INK; s.lineJoin = 'round'; s.stroke(); }));
      for (const [lz, c] of layers) side(lz, () => shrink(c, () => { smoothPath(FUSE); s.fillStyle = CUT; s.fill(); }));
      // the near flank: belly cuts, cheat line, windows
      const fz = nearS * R3 * .62, fc = Math.sqrt(1 - .62 * .62 * .62);
      side(fz, () => shrink(fc, () => {
        clipTo(() => smoothPath(FUSE), () => {
          for (let i = 0; i < 5; i++) taper(BELLY.map(([a, b]) => [a, b - i * 15]), L(9 * Math.pow(1 - i / 5, 1.3)), L(9 * Math.pow(1 - i / 5, 1.3)));
          pathOf([[-390, -190], [150, -170], [210, -154], [150, -138], [-390, -156]]); s.fillStyle = RED; s.fill();
        });
        for (let i = 0; i < 4; i++) { const wx = -236 + i * 74, wy = -214;
          withT(() => { s.beginPath(); s.arc(wx, wy, 19, 0, TAU); s.fillStyle = CUT; s.fill(); s.clip(); dot(wx + 3, wy + 12, 11, INK); });
          s.beginPath(); s.arc(wx, wy, 19, 0, TAU); s.lineWidth = L(5.5); s.strokeStyle = INK; s.stroke(); }
      }));
      // the face, square to us: windscreen patch, eyes, brows, nose, mouth
      if (toward < -.5) return;
      const wF = smooth(inv(.4, .9, toward));
      const sideZ = nearS * R3 * .8;
      const ep = [P(...[lerp(166, 262, wF), lerp(-229, -236, wF), lerp(sideZ, 40, wF)]), P(...[lerp(235, 262, wF), lerp(-225, -236, wF), lerp(sideZ, -40, wF)])];
      const ex = Math.hypot(...Ex) || 1, fwd = Ex[0] / ex * (1 - wF);
      const rx = 31 * KP, ry = 39 * KP;
      polyline(ep, (ry + 9 * KP) * 2, INK);
      ep.forEach((e, i) => withT(() => { s.translate(e[0], e[1]); s.scale(KP, KP); eye(i, 0, 0, 33, 41, { look: [o.look[0] * fwd, o.look[1]], lid: o.lid }); }));
      const [raise, tilt] = o.brow, order = ep[0][0] < ep[1][0] ? [0, 1] : [1, 0];
      order.forEach((i, j) => { const e = ep[i]; withT(() => { s.translate(e[0], e[1]); s.scale(KP, KP);
        const inner = j ? -1 : 1, by = -41 - 24 - raise * 16;
        const a = [-30, by + (inner < 0 ? tilt * 12 : -tilt * 4)], b = [30, by + (inner > 0 ? tilt * 12 : -tilt * 4)];
        taper([a, [0, Math.min(a[1], b[1]) - 8], b], L(j ? 11 : 6), L(j ? 6 : 11)); }); });
      const np = P(292, -166, lerp(nearS * R3 * .3, 0, wF)); dot(np[0], np[1], 30 * KP, INK);
      const mp = P(lerp(235, 286, wF), lerp(-126, -122, wF), lerp(nearS * R3 * .85, 0, wF));
      withT(() => { s.translate(mp[0], mp[1]); s.scale(KP, KP); mouth([-40, -4], [40, -2], [0, 10], o.open); });
    }]);
    parts.sort((a, b) => a[0] - b[0]).forEach(([, fn]) => fn());
  }
  function eye(i, cx, cy, rx, ry, o) {
    const { look = [.6, .1], lid = 0 } = o;
    s.beginPath(); s.ellipse(cx, cy, rx, ry, 0, 0, TAU); s.fillStyle = CUT; s.fill();
    withT(() => {
      s.beginPath(); s.ellipse(cx, cy, rx, ry, 0, 0, TAU); s.clip();
      const px = cx + look[0] * rx * .42, py = cy + look[1] * ry * .45;
      dot(px, py, 18, INK); dot(px - 6, py - 7, 5.5, CUT);
      if (lid > 0) {
        const ly = cy - ry + lid * ry * 2.1;
        s.beginPath(); s.moveTo(cx - rx - 4, cy - ry - 4); s.lineTo(cx + rx + 4, cy - ry - 4); s.lineTo(cx + rx + 4, ly - 4); s.quadraticCurveTo(cx, ly + 8, cx - rx - 4, ly - 4); s.closePath();
        s.fillStyle = INK; s.fill();
      }
    });
  }
  function mouth(Lp, R, up, open, scale = 1) {
    const dn = [up[0], up[1] + 95 * open * scale];
    if (open < .06) { taper([Lp, [(Lp[0] + up[0]) / 2, up[1] + 4], up, [(R[0] + up[0]) / 2, up[1] + 4], R], L(6) * scale, L(6) * scale); return; }
    const mp = () => { s.beginPath(); s.moveTo(...Lp); s.quadraticCurveTo(...up, ...R); s.quadraticCurveTo(...dn, ...Lp); s.closePath(); };
    mp(); s.fillStyle = INK; s.fill();
    clipTo(mp, () => {
      s.beginPath(); s.ellipse(up[0] + 4 * scale, (up[1] + dn[1]) / 2 + 22 * open * scale, 26 * scale, (12 + 8 * open) * scale, 0, 0, TAU); s.fillStyle = RED; s.fill();
      s.beginPath(); s.moveTo(...Lp); s.quadraticCurveTo(...up, ...R); s.lineWidth = 13 * scale; s.strokeStyle = CUT; s.stroke();
    });
    mp(); s.lineWidth = L(5) * scale; s.strokeStyle = INK; s.stroke();
  }
  // ======================= where he is, as a pure function of the lap clock =======================
  const KP = .3;                                         // plane scale (screen px per local unit)
  const WB = 295 * KP;                                    // wheelbase in world units
  const PIV = [.4, .55, .4, .4];                       // pivot time at corners C0..C3
  const TOTLEN = LENS.reduce((a, b) => a + b, 0);
  const LEGW = (() => { const w = [1, .78, 1, .82]; const t = w.reduce((a, b) => a + b, 0); return w.map((x) => x / t); })();   // share of the drive per leg (he hurries the receding one)
  const SEG = []; {
    let tt = 0; const legT = LAP - PIV.reduce((a, b) => a + b, 0);
    for (let i = 0; i < 4; i++) { SEG.push({ k: 'piv', i, a: tt, d: PIV[i] }); tt += PIV[i]; const d = legT * LEGW[i]; SEG.push({ k: 'leg', i, a: tt, d }); tt += d; }
  }
  const legStart = (i) => LENS.slice(0, i).reduce((a, b) => a + b, 0);
  function state(T) {
    const sg = SEG.find((q) => T >= q.a && T < q.a + q.d) || SEG[SEG.length - 1];
    const p = clamp((T - sg.a) / sg.d);
    if (sg.k === 'leg') { const g = LEGS[sg.i], sig = g.L * ease.sine(p); return { k: 'leg', g, sig, dist: legStart(sg.i) + sig, p, T }; }
    const i = sg.i, th0 = (i === 0 ? 270 : (i - 1) * 90) * Math.PI / 180, th1 = (i === 0 ? 360 : i * 90) * Math.PI / 180;
    return { k: 'piv', i, g: LEGS[i], th: lerp(th0, th1, ease.inOut(p)), p, dist: legStart(i), T };
  }
  // the deck point at station st on leg g, flat-extrapolated past the ends (the corner landings)
  const roadPt = (g, st) => PS(g, st, 0, 0);
  function face(st) {
    const T = st.T, o = { roll: st.dist / TOTLEN * 5 * TAU, spin: T / LAP * 10 * TAU, look: [.7, .15], brow: [0, 0], lid: 0, open: 0 };
    if (st.k === 'leg') {
      // coming at us down the right leg, he looks up at the birds a while (longing, wheels down)
      const rp = Math.max(0, ...st.g.ramps.map((ra) => tri((st.sig - (ra + RL * .5)) / 70, 1)));   // on a ramp
      o.open = .75 * smooth(rp * 1.6); o.look = [.8, lerp(.15, .75, rp)]; o.brow = [1.1 * rp, 0];
      if (st.g.i === 1 && st.p > .25) { const v = smooth(inv(.25, .45, st.p)) * (1 - smooth(inv(.8, .95, st.p))); o.look = [lerp(o.look[0], .15, v), lerp(o.look[1], -.95, v)]; o.lid = .22 * v; o.brow = [lerp(o.brow[0], .5, v), lerp(o.brow[1], -.8, v)]; }
    }
    for (const b of [1.4, 4.75, 7.5]) o.lid = Math.max(o.lid, tri(T - b, .09));
    return o;
  }
  function drawPlane(st) {
    const o = face(st);
    let Ex, O, dirH, EyP = [0, KP];
    if (st.k === 'leg') {
      const pr = roadPt(st.g, st.sig - WB / 2), pf = roadPt(st.g, st.sig + WB / 2);
      dirH = st.g.u;
      const dz = prof(st.g, st.sig + WB / 2) - prof(st.g, st.sig - WB / 2), pitch = Math.atan2(dz, WB);      // + nose up
      const cp = Math.cos(pitch), sp = Math.sin(pitch), e = sv(dirH[0] * cp, dirH[1] * cp, sp), up = sv(-dirH[0] * sp, -dirH[1] * sp, cp);
      Ex = [e[0] * KP, e[1] * KP]; EyP = [-up[0] * KP, -up[1] * KP];
      const mid = [(pr[0] + pf[0]) / 2, (pr[1] + pf[1]) / 2]; O = [mid[0] + 27.5 * Ex[0], mid[1] + 27.5 * Ex[1]];
    } else {
      dirH = [Math.cos(st.th), Math.sin(st.th)];
      const e = sv(dirH[0], dirH[1], 0), c = roadPt(st.g, 0);
      Ex = [e[0] * KP, e[1] * KP]; O = [c[0] - 27.5 * Ex[0], c[1] - 27.5 * Ex[1]];
    }
    const ez = sv(-dirH[1], dirH[0], 0);
    LW = 2;
    plane3D({ Ex, Ey: EyP, Ez: [ez[0] * KP, ez[1] * KP], O, dirH }, o);
    LW = 1;
  }

  // ======================= the frame =======================
  function scene(T) {
    s.fillStyle = CUT; s.fillRect(-50, -50, CW + 100, CH + 100);
    skyLines(36, 640, 26, 10, 1.5, 101);
    sun(T, 372, 226, 40);
    cloud(178 + 10 * Math.sin(T / LAP * TAU), 124, .42, 51);
    cloud(588 - 8 * Math.sin(T / LAP * TAU), 136, .38, 52);
    for (let b = 0; b < 3; b++) { const x = -80 + 900 * wrapT(T + b * .32) / LAP + b * 26, y = 196 + b * 16 + 5 * Math.sin(T / LAP * TAU * 2 + b); bird(x, y, 1.15 - b * .12, T / LAP * TAU * 14 + b * 1.7); }
    farHills(905, 3);
    // the tower and the ring: turrets at the back corners, far legs, then the near legs over them
    turret(0, LEGS[0].z0, 71); turret(A, LEGS[1].z0, 72);
    courtyard();
    for (const g of LEGS) if (!g.near) farWall(g);
    for (const g of LEGS) if (!g.near) { fascia(g, WD, g.L - WD); }
    for (const g of LEGS) if (!g.near) { deck(g); rail(g, false); }
    for (const g of LEGS) if (g.near) nearWall(g);
    for (const g of LEGS) if (g.near) { fascia(g, -WD, g.L + WD); deck(g); }
    nearHills(1010, 9);
    drawPlane(state(T));
  }

  // ======================= print pass (the kit's woodcut shader, at 720 x 1280 design pixels) =======================
  const canvas = document.getElementById('c');
  canvas.width = OW; canvas.height = OH;
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  const src = document.createElement('canvas'); src.width = OW; src.height = OH; s = src.getContext('2d');
  const FRAG0 = 'vec2 D = vec2(1920., 1080.);';
  if (!LOOK.frag.includes(FRAG0)) throw new Error('look.js changed: design size line not found');
  const frag = LOOK.frag.replace(FRAG0, `vec2 D = vec2(${CW}., ${CH}.);`);
  const sh = (type, code) => { const o = gl.createShader(type); gl.shaderSource(o, code); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p * .5 + .5; uv.y = 1. - uv.y; gl_Position = vec4(p, 0, 1); }`));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D src; uniform float t, tq; uniform vec2 res;
${GL.NOISE}
${frag}`));
  gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.MIRRORED_REPEAT);
  const U = (n) => gl.getUniformLocation(prog, n);

  placeWorld();
  function render(t) {
    const u = wrapT(t);
    const n2 = Math.floor(u * 12 + .5 + 1e-6) % 96;        // drawing on twos; frames 191 and 0 share drawing 0
    const n3 = Math.floor(u * 8 + 1 / 3 + 1e-6) % 64;      // print pull on threes; frames 191, 0, 1 share pull 0
    const T = n2 / 12;
    s.setTransform(OW / CW, 0, 0, OH / CH, 0, 0); s.globalAlpha = 1; s.globalCompositeOperation = 'source-over'; s.filter = 'none';
    LW = 1; s.save(); scene(T); s.restore();
    gl.viewport(0, 0, OW, OH);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(U('src'), 0); gl.uniform1f(U('t'), T); gl.uniform1f(U('tq'), T); gl.uniform2f(U('res'), OW, OH);
    gl.uniform1f(U('inv'), 0); gl.uniform1f(U('flash'), 0); gl.uniform1f(U('tb3'), n3 / 8); gl.uniform1f(U('frame'), 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  window.__framePNG = (t) => { render(t); return canvas.toDataURL('image/png'); };
  window.__frameJPEG = (t, q = .92) => { render(t); return canvas.toDataURL('image/jpeg', q); };
  window.__ready = Promise.resolve(true);
  if (!PRM.has('offline')) { // live preview: plays the loop at 24 fps from a frame counter (no wall-clock state in the frame itself)
    let n = 0; const tick = () => { render(n / 24); n = (n + 1) % 192; setTimeout(tick, 1000 / 24); }; tick();
  }
})();
