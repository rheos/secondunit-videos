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
  const TOP = 1.15, TD = 1.5, TL = 4.4, SEAT = .65; // seats low enough to hop on and off (Robin)
  function carX(t) { if (t < 200) return -40 + 1.6 * t; if (t < 206) { const u = t - 200; return 280 + 1.6 * (u - u * u / 12); } if (t < 238) return 284.8; const u = t - 238; return 284.8 + .22 * u * u; }
  function carZ(t) { if (t < 238) return 0; const u = t - 238; return .3 * u * u; }
  function yaw(t) { let a = 0; for (const [s, e] of SPINS) a += TAU * smooth((t - s - .3) / (e - s - .3)); return a; }
  const MAN = { x: 300, z: 45 };

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
// grade + vignette (moved from render.js for draft 3: the light arc lives here)
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

