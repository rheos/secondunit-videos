// The giant: an old upright piano grown over with moss, asleep in a clearing, that wakes and takes a step.
// Coordinates are the clearing plane's (rate .6): world x, world y with the floor at G. The cabinet and its
// moss are baked once as sprites; the legs, keys, sapling, hanging moss, blanket clods, mound and dust are
// drawn each frame from pose(t), which is a pure function of t.
const X0 = 262;                        // the piano's centre on the clearing plane at t = 0
const gY = () => PLANES.clear.my + 140; // the floor line on the clearing plane
const LEG = { th: 20, sh: 20, rear: 9 };
const HIP_F = [[-33, -22], [33, -22]], HIP_R = [[-28, -1], [28, -1]];

// ---- timeline (song frames on the 24 fps grid) ----
const T = { stir: fr(72), lid0: fr(91), lid1: fr(110), dip: fr(120), rise0: fr(130), sag: fr(158), sag1: fr(168), rise1: fr(206), settle: fr(221),
  fr0: fr(221), fr1: fr(250), rr0: fr(226), rr1: fr(255), fl0: fr(262), fl1: fr(290), rl0: fr(267), rl1: fr(295) };
function riseK(t) {
  const k = [[T.dip, 0], [T.rise0, -.06], [T.sag, .45], [T.sag1, .42], [T.rise1, 1.03], [T.settle, 1]];
  if (t <= k[0][0]) return 0;
  for (let i = 1; i < k.length; i++) if (t < k[i][0]) return lerp(k[i - 1][1], k[i][1], (i === 1 || i === 3 ? ease.out : ease.inOut)(inv(k[i - 1][0], k[i][0], t)));
  return 1;
}
const dip = (t, t0) => 2 * Math.sin(Math.PI * inv(t0, t0 + .4, t));
function bodyX(t) {
  const k = [[fr(206), 0], [fr(222), -2], [fr(262), 8], [fr(268), 8], [fr(300), 16]];
  if (t <= k[0][0]) return X0;
  for (let i = 1; i < k.length; i++) if (t < k[i][0]) return X0 + lerp(k[i - 1][1], k[i][1], ease.inOut(inv(k[i - 1][0], k[i][0], t)));
  return X0 + 16;
}
function bodyY(t) {
  const r = riseK(t), G = gY();
  let y = G + lerp(8, -18, r) + dip(t, T.fr1) + dip(t, T.fl1);
  if (t < T.dip) y += Math.round(.8 * Math.sin(TAU * t / 4.2));       // asleep: the heap breathes
  if (t > T.settle) y += Math.round(.9 * Math.sin(TAU * (t - T.settle) / 4)); // standing: it breathes
  return y;
}
// a foot: planted (fixed world point) or in a step arc between two planted points
function foot(t, x0, dx, t0, t1, lift, y) {
  if (t < t0) return { x: x0, y, down: true };
  if (t >= t1) return { x: x0 + dx, y, down: true };
  const u = inv(t0, t1, t);
  return { x: x0 + dx * ease.inOut(u), y: y - lift * Math.pow(Math.sin(Math.PI * u), .8), down: false };
}
function pose(t) {
  const G = gY(), bx = Math.round(bodyX(t)), by = Math.round(bodyY(t));
  return {
    bx, by, G, r: riseK(t),
    fl: foot(t, X0 - 40, 16, T.fl0, T.fl1, 8, G), frt: foot(t, X0 + 40, 16, T.fr0, T.fr1, 9, G),
    rl: foot(t, X0 - 30, 16, T.rl0, T.rl1, 5, G - 2), rr: foot(t, X0 + 30, 16, T.rr0, T.rr1, 5, G - 2),
    open: ease.out(inv(T.lid0, T.lid1, t)),
    shiver: ((t > T.stir && t < T.stir + .7) || (t > T.rise0 && t < T.rise0 + .3)) && Math.floor(t * 12) % 2 ? 1 : 0,
  };
}
const shake = (t) => { const f = Math.round(t * FPS); for (const p of [250, 290]) { const k = f - p; if (k >= 0 && k < 3) return [1, -1, 1][k]; } return 0; };
const vel = (fn, t, dt = .1) => (fn(t) - fn(t - dt)) / dt;

// colour with the light arc applied (same rule as blitPlane)
function litC(c, x, y, L) { const k = (1 - L) * .9, th = arcTh(c, x, y); if (DIM[c] >= 0 && th < k) { c = DIM[c]; if (th < k * .5 && DIM[c] >= 0) c = DIM[c]; } return c; }
function blitLit(sp, x, y, L, clipY = 1e9) {
  x = Math.round(x); y = Math.round(y);
  for (let j = 0; j < sp.h; j++) {
    const Y = y + j; if (Y < 0 || Y >= PH || Y >= clipY) continue;
    for (let i = 0; i < sp.w; i++) { const X = x + i; if (X < 0 || X >= PW) continue; const c = sp.d[j * sp.w + i]; if (c !== TR) FB.d[Y * PW + X] = litC(c, X, Y, L); }
  }
}

// ---- the baked cabinet and its moss ----
const SP = { w: 104, h: 92, ox: 52, oy: 86 };
let CAB = null, MOSS = null;
function bakePiano() {
  const W = RAMP.wood, o = (x, y) => [x + SP.ox, y + SP.oy];
  const P = (x, y, c) => pset(x + SP.ox, y + SP.oy, c);
  const box = (x0, y0, x1, y1, fn) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) P(x, y, fn(x, y)); };
  const grain = (x, y, base, amt = .3) => base + amt * (fbm2(x * .8, y * .035, 61) - .5) + .05 * (h2(x, y, 62) - .5);
  CAB = offscreen(SP.w, SP.h, () => {
    // side face toward the sun (right), then the front
    for (let y = -70; y <= 0; y++) for (let x = 38; x <= 44; x++) { const top = -66 - Math.round((x - 38) * .6); if (y < top || y > -Math.round((x - 38) * .5)) continue; P(x, y, x === 44 ? RAMP.rim[0] : shade(W, grain(x, y, .62), x, y)); }
    box(-38, -66, 38, 0, (x, y) => shade(W, grain(x, y, .34 - .1 * inv(-66, 0, y)), x, y));
    box(-40, -70, 40, -67, (x, y) => shade(W, grain(x, y, y === -70 ? .7 : .48), x, y));         // lid overhang
    box(-30, -61, 30, -41, (x, y) => (x === -30 || x === 30 || y === -61 || y === -41) ? W[1] : shade(W, grain(x, y, .28), x, y)); // upper panel
    for (let y = -58; y <= -44; y++) for (let x = -20; x <= 20; x++) { const d = Math.abs(((x + 20) % 6) - 3) + Math.abs(((y + 58) % 6) - 3); if (d <= 1) P(x, y, W[0]); else if (d === 2) P(x, y, W[3]); } // fretwork
    box(-36, -40, 36, -37, (x, y) => shade(W, grain(x, y, y === -40 ? .66 : .44), x, y));       // music-desk moulding
    box(-38, -29, 38, -24, (x, y) => shade(W, grain(x, y, y === -29 ? .62 : .4), x, y));        // key slip
    box(-38, -35, -35, -24, (x, y) => shade(W, grain(x, y, .52), x, y)); box(35, -35, 38, -24, (x, y) => shade(W, grain(x, y, .52), x, y)); // cheek blocks
    box(-31, -21, 31, -5, (x, y) => (x === -31 || x === 31 || y === -21 || y === -5) ? W[1] : shade(W, grain(x, y, .24), x, y)); // kneeboard
    box(-38, -3, 38, 0, () => W[0]);
    for (const px of [-6, 0, 6]) { box(px - 1, -6, px + 1, -5, (x, y) => RAMP.brass[y === -6 ? 2 : 1]); }  // pedals
    // weather: a split in the veneer, a lifted patch, streaks
    for (let y = -64; y < -6; y++) if (h2(7, y, 63) < .8) P(Math.round(-14 + sn1(y * .1, 5) * 2), y, W[0]);
    box(16, -20, 22, -14, (x, y) => shade(W, .56 + .2 * (h2(x, y, 64) - .5), x, y));
    // brass candle sconces: an arm, a cup, a candle stub
    for (const s of [-1, 1]) { const cx = s * 34; box(cx - 1, -50, cx + 1, -49, () => RAMP.brass[1]); box(cx - 2, -52, cx + 2, -51, (x) => RAMP.brass[x === cx + 2 * s ? 2 : 1]); box(cx, -56, cx, -53, () => RAMP.ivory[0]); }
  });
  MOSS = offscreen(SP.w, SP.h, () => {
    const R = rng(81), M = RAMP.moss, lit = (x, y) => towardSun(x, y, 70, -140);
    for (let i = 0; i < 44; i++) { const x = -43 + R() * 88, y = -71 + R() * 5 + (Math.abs(x) > 36 ? R() * 8 : 0), [lx, ly] = lit(x, y); clump(...o(x, y), 2 + R() * 3, M.slice(0, 6), { seed: 300 + i, lx, ly, amb: .26, dif: .55, tex: .45, rimC: RAMP.rim[1] }); }
    for (let i = 0; i < 12; i++) { const x = -40 + R() * 8, y = -66 + R() * 50, [lx, ly] = lit(x, y); clump(...o(x, y), 1.8 + R() * 2.5, M.slice(0, 4), { seed: 340 + i, lx, ly, amb: .3, dif: .4, tex: .45 }); } // down the shaded side
    for (let i = 0; i < 8; i++) { const x = 34 + R() * 10, y = -60 + R() * 54, [lx, ly] = lit(x, y); clump(...o(x, y), 2 + R() * 3, M, { seed: 360 + i, lx, ly, amb: .35, dif: .5, rimC: RAMP.rim[0] }); }
    for (let i = 0; i < 6; i++) { const x = -38 + R() * 76, y = -2 + R() * 3; clump(...o(x, y), 2.5 + R() * 3, M.slice(0, 5), { seed: 380 + i, amb: .25, dif: .3, flat: 1 }); }
    for (const [x, y] of [[-37, -30], [37, -30], [-28, -36], [24, -38]]) clump(...o(x, y), 3, M, { seed: 390 + x, lx: .5, ly: -.8, amb: .3, rimC: RAMP.rim[0] }); // on the cheek blocks and desk
    for (let i = 0; i < 16; i++) { const x = -38 + R() * 76, y = -73 - R() * 2; for (let k = 0; k < 3; k++) { const [X, Y] = o(x + k - 1, y), hgt = 2 + Math.round(R() * 3); line(X, Y, X + Math.round((R() - .5) * 2), Y - hgt, k === 2 ? RAMP.rim[1] : M[3 + k]); } } // grass tufts on the lid
    for (const [x, y] of [[-24, -72], [-20, -73], [30, -71]]) { const [X, Y] = o(x, y); pset(X, Y + 1, RAMP.shroom[0]); pset(X - 1, Y, RAMP.shroom[1]); pset(X, Y, RAMP.shroom[1]); pset(X + 1, Y, RAMP.shroom[1]); } // mushrooms
  });
}

// blanket clods: big moss lumps over the cabinet that slough off as it rises; small ones on the stir and the steps
let CLODS = [];
function planClods() {
  const R = rng(91); CLODS = [];
  const spots = [[-30, -60], [-14, -62], [8, -63], [26, -58], [-36, -46], [36, -48], [-24, -48], [20, -46], [-34, -16], [-20, -12], [0, -14], [20, -11], [34, -17], [-8, -50]];
  spots.forEach(([x, y], i) => CLODS.push({ x, y, r: 5 + R() * 4.5, t0: lerp(T.rise0 + .2, T.rise1 - .1, (i + R()) / spots.length), seed: 500 + i }));
  for (const [t0, n] of [[T.stir + .1, 2], [T.stir + .5, 2], [T.fr1, 2], [T.fl1, 2]]) for (let k = 0; k < n; k++) CLODS.push({ x: (R() - .5) * 76, y: -66 - R() * 4, r: 1.6 + R() * 1.6, t0: t0 + k * .12, seed: 600 + CLODS.length });
  for (const c of CLODS) { c.vx = Math.sign(c.x || 1) * (8 + R() * 14); c.vy = -8 - R() * 8; c.land = 2 + R() * 9; }
}
function clodAt(c, t) {
  if (t < c.t0) { const p = pose(t); return { x: p.bx + c.x, y: p.by + c.y, landed: false, att: true }; }
  const p0 = pose(c.t0), x0 = p0.bx + c.x, y0 = p0.by + c.y, gy = p0.G + c.land - c.r * .4, g = 230;
  const dt = t - c.t0, ty = (-c.vy + Math.sqrt(c.vy * c.vy + 2 * g * Math.max(0, gy - y0))) / g; // time to land
  if (dt >= ty) return { x: x0 + c.vx * ty, y: gy, landed: true, tl: c.t0 + ty };
  return { x: x0 + c.vx * dt, y: y0 + c.vy * dt + .5 * g * dt * dt, landed: false };
}

// dust puffs (world coords): rise, plants, big clod landings
let PUFFS = [];
function planPuffs() {
  const G = gY();
  PUFFS = [[T.rise0 + .05, X0 - 40, 26], [T.rise0 + .1, X0 + 42, 26], [T.rise0 + .9, X0 - 62, 18], [T.rise0 + 1, X0 + 64, 18],
    [T.fr1, X0 + 56, 22], [T.rr1, X0 + 46, 12], [T.fl1, X0 - 24, 22], [T.rl1, X0 - 14, 12]].map(([t0, x, s]) => ({ t0, x, y: G, s }));
  for (const c of CLODS) if (c.r > 4) { const l = clodAt(c, 99); PUFFS.push({ t0: l.tl, x: l.x, y: l.y, s: c.r * 2.2 }); }
}
function dust(t, ox, oy, L) {
  for (const p of PUFFS) {
    const u = (t - p.t0) / 2.4; if (u < 0 || u > 1) continue;
    for (let b = 0; b < 5; b++) {
      const dir = b - 2, e = ease.out(u), rb = p.s * (.22 + .4 * e) * (.7 + .3 * h2(b, 1, p.t0 * 100 | 0));
      const cx = p.x + ox + dir * p.s * .32 * (.4 + e), cy = p.y + oy - 2 - rb * .4 - 5 * u * h2(b, 2, 7);
      const k0 = .75 * Math.pow(1 - u, 1.4);
      for (let j = -Math.ceil(rb); j <= rb; j++) for (let i = -Math.ceil(rb); i <= rb; i++) {
        const d = Math.hypot(i, j * 1.3) / rb; if (d > 1) continue;
        const X = Math.round(cx + i), Y = Math.round(cy + j); if (X < 0 || Y < 0 || X >= PW || Y >= PH) continue;
        const k = k0 * (1 - d * d) * (.6 + .4 * vn2(X * .3 + t, Y * .3, 5)), th = bay(X, Y);
        if (th < k) { const q = Y * PW + X; FB.d[q] = FOG[FB.d[q]]; if (th < k * .35 * L) FB.d[q] = LIGHT[FB.d[q]]; }
      }
    }
  }
}

// ---- per-frame drawing ----
// a tapered tube between two points, lit across its width from the sun side (rasterized fresh each frame)
function tube(ax, ay, bx, by, t0, t1, rp, L, rimOn = true) {
  const x0 = Math.floor(Math.min(ax, bx) - t0), x1 = Math.ceil(Math.max(ax, bx) + t0), y0 = Math.floor(Math.min(ay, by) - t0), y1 = Math.ceil(Math.max(ay, by) + t0);
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1, len = Math.sqrt(l2), nx = -dy / len, ny = dx / len;
  const sideLit = (nx * .6 + ny * -.8) >= 0 ? 1 : -1;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const px = x + .5 - ax, py = y + .5 - ay, s = clamp((px * dx + py * dy) / l2), qx = px - s * dx, qy = py - s * dy;
    const rad = lerp(t0, t1, s) / 2, off = (qx * nx + qy * ny) * sideLit, d = Math.hypot(qx, qy);
    if (d > rad) continue;
    const u = off / rad; // -1 shaded edge .. 1 lit edge
    if (rimOn && u > .72) { pset(x, y, litC(RAMP.rim[0], x, y, L)); continue; }
    pset(x, y, shade(rp, .2 + .32 * (u + 1) / 2 + .12 * (fbm2(x * .7, y * .7, 66) - .5), x, y));
  }
}
function ik(hx, hy, fx, fy, l1, l2, out) {
  let dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy); const dm = l1 + l2 - .5;
  if (d > dm) { fx = hx + dx / d * dm; fy = hy + dy / d * dm; dx = fx - hx; dy = fy - hy; d = dm; }
  d = Math.max(d, 1); const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  let px = -dy / d, py = dx / d; if (px * out < 0) { px = -px; py = -py; }
  return [hx + dx / d * a + px * h, hy + dy / d * a + py * h];
}
function leg(hx, hy, f, l1, l2, out, L, front) {
  const [kx, ky] = ik(hx, hy, f.x, f.y - 3, l1, l2, out);
  const W = front ? RAMP.wood : RAMP.wood.slice(0, 3);
  tube(hx, hy, kx, ky, front ? 9 : 6, front ? 7 : 5, W, L, front);
  tube(kx, ky, f.x, f.y - 3, front ? 7 : 5, front ? 6 : 4, W, L, front);
  if (front) { circ(kx, ky, 3, RAMP.brass[0]); circ(kx, ky, 2, RAMP.brass[1]); pset(kx + 1, ky - 1, litC(RAMP.brass[2], Math.round(kx + 1), Math.round(ky - 1), L)); }
  // the foot: a carved toe block flat on the floor, a brass toe cap
  const fx = Math.round(f.x), fy = Math.round(f.y), fw = front ? 6 : 4;
  for (let y = fy - 4; y < fy; y++) for (let x = fx - fw; x <= fx + fw; x++) pset(x, y, shade(W, .3 + .25 * inv(fx - fw, fx + fw, x) + (y === fy - 4 ? .2 : 0), x, y));
  if (front) for (let x = fx - fw; x <= fx + fw; x++) pset(x, fy - 1, RAMP.brass[x > fx ? 1 : 0]);
  return { kx, ky };
}
function keys(p, ox, oy, L) {
  const cov = Math.round((1 - p.open) * 6), X = p.bx + ox, Y = p.by + oy;
  for (let r = 0; r < 6; r++) for (let c = -33; c <= 33; c++) {
    const x = X + c, y = Y - 34 + r; let col;
    if (r < cov) col = r === cov - 1 ? RAMP.wood[4] : shade(RAMP.wood, .5 + .1 * (h2(c, r, 70) - .5), x, y); // the fallboard
    else {
      const k = c + 33, wk = k >> 1, note = wk % 7;
      if (h2(wk, 0, 71) < .07) col = RAMP.wood[0];                         // a missing key
      else if (r < 4 && (k & 1) && [0, 1, 3, 4, 5].includes(note)) col = RAMP.kblk[0];
      else if (h2(wk, 1, 72) < .06 && r > 3) col = RAMP.moss[3];          // moss in the keys
      else col = litC(r === 5 ? RAMP.ivory[0] : RAMP.ivory[1], x, y, L);
    }
    pset(x, y, col);
  }
  if (cov > 0) pset(X, Y - 34 + cov - 1, RAMP.brass[1]); // the lock on the fallboard
  for (let c = -33; c <= 33; c++) pset(X + c, Y - 35, RAMP.wood[0]);
}
function hangingMoss(p, t, ox, oy) {
  const sw = clamp(-vel(bodyX, t - .15) * .22, -4, 4), up = clamp(vel(bodyY, t - .1) * .04, -2, 2);
  [-30, -17, 9, 27].forEach((lx, i) => {
    const len = 3 + Math.round(h2(i, 3, 73) * 5);
    for (let k = 0; k <= len; k++) {
      const f = Math.pow(k / len, 1.5), x = Math.round(p.bx + ox + lx + (sw + .7 * Math.sin(t * 1.4 + i)) * f), y = Math.round(p.by + oy - 23 + k - up * f);
      pset(x, y, k === len ? RAMP.moss[0] : RAMP.moss[1 + ((k + i) & 1)]);
    }
  });
}
function sapling(p, t, ox, oy, L) {
  const bx = p.bx + ox + 16, by = p.by + oy - 74;
  const sw = clamp(-vel(bodyX, t - .12) * .35, -5, 5) + clamp(vel(bodyY, t - .2) * .08, -3, 3) * 0 + .8 * Math.sin(t * 1.1);
  const dy = clamp(-vel(bodyY, t - .18) * .06, -2, 2);
  const tx = bx + sw, ty = by - 17 + dy;
  line(bx, by, (bx + tx) / 2 + sw * .2, (by + ty) / 2, RAMP.bark[1], 2); line((bx + tx) / 2 + sw * .2, (by + ty) / 2, tx, ty, RAMP.bark[2]);
  for (const [dx, dy2, r] of [[-4, 3, 3.5], [4, 2, 3.5], [0, -1, 5], [2, -5, 3]]) { const [lx, ly] = towardSun(tx + dx, ty + dy2); clump(tx + dx, ty + dy2, r, RAMP.mid, { seed: 700 + dx, lx, ly, amb: .35, dif: .5, rimC: litC(RAMP.rim[1], Math.round(tx), Math.round(ty), L) }); }
}
function mound(p, t, ox, oy, L) {
  const h = lerp(24, 8, smooth(inv(T.rise0, T.rise1 + .3, t))), G = p.G + oy, X = X0 + ox, M = RAMP.moss;
  for (let i = -80; i <= 80; i++) {
    const x = X + i; if (x < 0 || x >= PW) continue;
    const e = Math.sqrt(Math.max(0, 1 - (i / 80) ** 2)), bump = .75 + .45 * vn2(i * .11, 3, 41) + .25 * vn2(i * .3, 1, 42);
    const top = Math.round(G + 3 - h * Math.pow(e, .7) * bump - (Math.abs(i) > 40 ? h * .35 * e : 0));
    for (let y = top; y <= G + 4; y++) {
      if (y < 0 || y >= PH) continue;
      const d = (y - top) / Math.max(1, G + 4 - top), slope = -i / 80;
      let v = .5 - .32 * d + .16 * (fbm2((x - ox) * .55, y * .6, 43) - .5) + .1 * (h2(x - ox, y, 46) - .5) + .1 * slope * -1;
      if (y === top && i > -10 && h2(i, 4, 45) < .8) { pset(x, y, litC(RAMP.rim[1], x, y, L)); continue; }
      if (y === top + 1 && h2(i, 9, 44) < .5) v += .3;
      pset(x, y, shade(M, v, x, y));
    }
  }
}
function drawGiant(t, L) {
  const p = pose(t), [ox, oy] = planeOff(PLANES.clear, t), G = p.G + oy;
  // shadows on the floor: contact under the body, a long backlit shadow toward the camera, one under each planted foot
  const darken = (cx, cy, rx, ry, k) => { for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) { const d = (i / rx) ** 2 + (j / ry) ** 2; if (d > 1) continue; const X = Math.round(cx + i), Y = Math.round(cy + j); if (X < 0 || Y < 0 || X >= PW || Y >= PH) continue; if (bay(X, Y) < k * (1 - d)) FB.d[Y * PW + X] = DARK[FB.d[Y * PW + X]]; } };
  darken(p.bx + ox - 6, G + 8, 54, 9, .5 * L * clamp(p.r));
  darken(p.bx + ox, G + 1, 44, 3, .8 * clamp(p.r));
  for (const f of [p.fl, p.frt]) if (f.down) darken(f.x + ox, G + 1, 8, 2, .9);
  // rear legs (behind the cabinet), the cabinet, the keys, the moss
  if (p.r > .3) for (const [h, f, s] of [[HIP_R[0], p.rl, -1], [HIP_R[1], p.rr, 1]]) leg(p.bx + ox + h[0], p.by + oy + h[1], { x: f.x + ox, y: f.y + oy }, LEG.rear, LEG.rear, s, L, false);
  const clip = G + 3;
  blitLit(CAB, p.bx + ox - SP.ox, p.by + oy - SP.oy, L, clip);
  keys(p, ox, oy, L);
  blitLit(MOSS, p.bx + ox - SP.ox + p.shiver, p.by + oy - SP.oy, L, clip);
  // front legs, hanging moss, the sapling
  const knees = [];
  for (const [h, f, s] of [[HIP_F[0], p.fl, -1], [HIP_F[1], p.frt, 1]]) knees.push(leg(p.bx + ox + h[0], p.by + oy + h[1], { x: f.x + ox, y: f.y + oy }, LEG.th, LEG.sh, s, L, true));
  hangingMoss(p, t, ox, oy);
  sapling(p, t, ox, oy, L);
  mound(p, t, ox, oy, L);
  for (const c of CLODS) {
    const q = clodAt(c, t); if (q.att && c.r < 3) continue; // small clods are hidden in the body moss until they fall
    const [lx, ly] = towardSun(q.x + ox, q.y + oy);
    const cx = q.x + ox + (q.att ? p.shiver : 0), cy = q.y + oy, rc = litC(RAMP.rim[0], Math.round(cx), Math.round(cy), L), sq = q.landed ? .5 : .72;
    const lump = { seed: c.seed, lx, ly, amb: .3, dif: .32, tex: .55, sq, flat: q.landed ? 1 : undefined, rimC: rc };
    if (c.r > 3.5) { clump(cx - c.r * .55, cy + c.r * .2, c.r * .6, RAMP.moss.slice(0, 5), { ...lump, seed: c.seed + 1 }); clump(cx + c.r * .6, cy + c.r * .25, c.r * .55, RAMP.moss.slice(0, 5), { ...lump, seed: c.seed + 2 }); }
    clump(cx, cy, c.r * (c.r > 3.5 ? .8 : 1), RAMP.moss.slice(0, 6), lump);
  }
  // audit probes, in canvas pixels
  if (PROBE.on || typeof ML !== 'undefined') {
    const k = s.canvas.width / PW, g = s;
    g.setTransform(1, 0, 0, 1, 0, 0);
    PROBE.box(g, 'giant', (p.bx + ox - 46) * k, (p.by + oy - 92) * k, 92 * k, (G - (p.by + oy - 92)) * k, { keep: true });
    const prev = pose(ML_prevT(t));
    let slide = 0;
    for (const n of ['fl', 'frt', 'rl', 'rr']) if (p[n].down && prev[n].down) slide = Math.max(slide, Math.abs(p[n].x - prev[n].x), Math.abs(p[n].y - prev[n].y));
    PROBE.value('footSlide', slide);
    PROBE.value('feetOnFloor', Math.max(...['fl', 'frt'].filter((n) => p[n].down).map((n) => Math.abs(p[n].y - p.G))));
    PROBE.edge('plantR', p.frt.down && t >= T.fr1, prev.frt.down && ML_prevT(t) >= T.fr1);
    PROBE.edge('plantL', p.fl.down && t >= T.fl1, prev.fl.down && ML_prevT(t) >= T.fl1);
    PROBE.edge('lidOpen', p.open >= 1, prev.open >= 1);
  }
}
const ML_prevT = (t) => (Math.round(t * FPS) - 1) / FPS;
