// The forest: camera, light arc, baked parallax planes, sky, haze, shafts, spores and leaves.
// Every plane is baked once into its own indexed buffer, wider than the screen by the camera's travel times
// its rate, and blitted each frame at a whole-pixel offset. Planes keep one pixel size: nothing is scaled.

// ---- camera and light ----
const camX = (t) => 4.5 * t + 22 * smooth(inv(4, 13, t));
const camY = (t) => -10 * smooth(inv(5, 9, t));
// the light arc: low hazy sun to full gold
const lightK = (t) => clamp(lerp(.2, 1, smooth(inv(.5, 12.5, t))) + .02 * Math.sin(t * 1.3));
const CAMX_MAX = 96, SUNX = 236;
// one plane offset for everything that rides a plane, so feet and ground can never disagree
function planeOff(p, t) {
  const sh = shake(t);
  return [-Math.round(camX(t) * p.rate), Math.round((-camY(t) + sh) * p.rate) - p.my];
}
const sunAt = (t) => [SUNX - Math.round(camX(t) * .05), 46 + Math.round(-camY(t) * .05)];
// the sun gap on a plane: its centre in plane coords across the camera travel, and a half-width
const gapOf = (rate, hw) => [SUNX + CAMX_MAX * .5 * rate, hw + CAMX_MAX * .5 * rate];

// ---- painting primitives (into the current buffer B) ----
// a foliage or moss clump: ragged edge, lit per pixel from the sun direction, value-noise texture, ramp + Bayer
function clump(cx, cy, r, rp, o = {}) {
  cx = Math.round(cx); cy = Math.round(cy);
  const seed = o.seed ?? 1, lx = o.lx ?? .6, ly = o.ly ?? -.8, amb = o.amb ?? .35, dif = o.dif ?? .45, tex = o.tex ?? .35, up = o.up ?? .1;
  const R2 = Math.ceil(r * 1.15) + 1, sq = o.sq ?? 1;
  for (let j = -R2; j <= R2; j++) for (let i = -R2; i <= R2; i++) {
    const jj = j / sq, d = Math.hypot(i, jj); if (d > R2) continue;
    const a = Math.atan2(jj, i);
    const edge = r * (.8 + .32 * vn2(Math.cos(a) * 1.7 + 9, Math.sin(a) * 1.7, seed)) + (h2(cx + i, cy + j, seed) - .5) * 1.8;
    if (d > edge || (o.flat && j > (o.flat))) continue;
    const nx = i / edge, ny = jj / edge, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    let v = amb + dif * Math.max(-.3, nx * lx + ny * ly) * (1.1 - nz * .6) + up * -ny + tex * (fbm2((cx + i) * .38, (cy + j) * .38, seed) - .5);
    if (o.rimC !== undefined && (nx * lx + ny * ly) > .62 && nz < .55) { pset(cx + i, cy + j, o.rimC); continue; }
    pset(cx + i, cy + j, shade(rp, v, cx + i, cy + j));
  }
}
// a trunk: vertical, tapered, bark texture, lit edge on the sun side, root flare at the foot
function trunk(x, y0, y1, w0, w1, rp, o = {}) {
  const seed = o.seed ?? 3, side = o.side ?? 1, rimC = o.rimC;
  for (let y = Math.floor(y0); y < y1; y++) {
    const k = inv(y0, y1, y), flare = o.flare ? Math.pow(inv(y1 - o.flare, y1, y), 2.2) * w1 * .8 : 0;
    const w = lerp(w0, w1, k) + flare, xl = Math.round(x - w / 2 + sn1(y * .05, seed) * 1.2), xr = Math.round(xl + w);
    for (let xx = xl; xx < xr; xx++) {
      const u = (xx - xl) / Math.max(1, xr - xl - 1), lit = side > 0 ? u : 1 - u;
      let v = .18 + .5 * Math.pow(lit, 1.6) + .42 * (fbm2(xx * .55, y * .05, seed) - .5) + (o.v ?? 0);
      if (rimC !== undefined && ((side > 0 && xx >= xr - 1) || (side < 0 && xx === xl)) && h2(xx, y, seed) < .85) { pset(xx, y, rimC); continue; }
      pset(xx, y, shade(rp, v, xx, y));
    }
  }
}
// a fern frond: a curved rib with leaflets, drawn in pixels
function fern(x, y, len, dir, rp, o = {}) {
  const seed = o.seed ?? 5, droop = o.droop ?? .9;
  for (let i = 0; i < len; i++) {
    const k = i / len, px = x + dir * i * .9, py = y - len * .55 * Math.sin(k * Math.PI * .75) + droop * k * k * len * .5;
    pset(px, py, shade(rp, .45 + .2 * k, px | 0, py | 0));
    const lf = Math.round((1 - k) * (o.leaf ?? 5)) + 1;
    if (i % 2 === 0) for (let j = 1; j <= lf; j++) {
      pset(px + dir * j * .35, py - j, shade(rp, .3 + .5 * (j / lf) * (h2(i, j, seed) > .4 ? 1 : .6), px | 0, (py - j) | 0));
      pset(px + dir * j * .5, py + j * .7, shade(rp, .2 + .3 * (j / lf), px | 0, (py + j) | 0));
    }
    if (o.rimC !== undefined && i > len * .4 && i % 3 === 0) pset(px + dir, py - 1, o.rimC);
  }
}
// light direction from a point toward the sun, for backlit clumps
const towardSun = (x, y, sx = SUNX, sy = 46) => { const dx = sx - x, dy = sy - y, d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };

// ---- planes ----
const PLANES = {};
function bakePlane(name, rate, extraH, fn) {
  const my = Math.ceil(12 * rate) + 2, w = PW + Math.ceil(CAMX_MAX * rate) + 8, h = PH + my + (extraH || 0);
  PLANES[name] = { rate, my, buf: offscreen(w, h, () => fn(my, w, h)) };
}
// blit a plane with the light arc: lit colours dither toward DIM while the sun is low
function blitPlane(p, t, L) {
  const [ox, oy] = planeOff(p, t), b = p.buf, k = (1 - L) * .9;
  for (let y = 0; y < PH; y++) {
    const sy = y - oy; if (sy < 0 || sy >= b.h) continue;
    const so = sy * b.w, o = y * PW;
    for (let x = 0; x < PW; x++) {
      const sx = x - ox; if (sx < 0 || sx >= b.w) continue;
      let c = b.d[so + sx]; if (c === TR) continue;
      if (DIM[c] >= 0) { const th = arcTh(c, x, y); if (th < k) { c = DIM[c]; if (th < k * .5 && DIM[c] >= 0) c = DIM[c]; } }
      FB.d[o + x] = c;
    }
  }
}

function bakeForest() {
  const rimC = RAMP.rim[0], rimB = RAMP.rim[1];
  const inGap = (x, g) => Math.abs(x - g[0]) < g[1];
  // far trees: tall pale trunks in haze, canopy clumps, an undergrowth band
  bakePlane('far', .12, 0, (my, w) => {
    const R = rng(11), g = gapOf(.12, 16);
    for (let x = 4; x < w; x += 7 + R() * 9) {
      const bx = x + R() * 4; if (inGap(bx, g)) continue;
      trunk(bx, my + 30 + R() * 25, my + 124, 2.5 + R() * 2, 3.5 + R() * 3, RAMP.far, { seed: 20 + x | 0, v: -.15 });
    }
    for (let i = 0; i < 70; i++) { const x = R() * w, y = my + 8 + R() * 48; if (inGap(x, [g[0], g[1] + 12]) && y > my + 22) continue; const [lx, ly] = towardSun(x, y - my); clump(x, y, 6 + R() * 9, RAMP.far, { seed: i + 50, lx, ly, amb: .35, dif: .4, tex: .3 }); }
    for (let i = 0; i < 60; i++) { const x = R() * w, y = my + 112 + R() * 12; clump(x, y, 5 + R() * 6, RAMP.far, { seed: i + 150, amb: .4, dif: .3 }); }
  });
  // far-mid: closer trunks, darker, still hazed
  bakePlane('fmid', .25, 0, (my, w) => {
    const R = rng(22), g = gapOf(.25, 20);
    for (let x = 0; x < w; x += 11 + R() * 15) {
      const bx = x + R() * 6; if (inGap(bx, g)) continue;
      trunk(bx, my - 4, my + 128, 4 + R() * 3, 6 + R() * 4, RAMP.fmid, { seed: 30 + x | 0, side: bx < g[0] ? 1 : -1, flare: 8, v: -.12 });
    }
    for (let i = 0; i < 80; i++) { const x = R() * w, y = my - 6 + R() * 44; if (inGap(x, [g[0], g[1] + 10]) && y > my + 16) continue; const [lx, ly] = towardSun(x - 30, y - my); clump(x, y, 7 + R() * 10, RAMP.fmid, { seed: i + 250, lx, ly, amb: .3 }); }
    for (let i = 0; i < 70; i++) { const x = R() * w, y = my + 118 + R() * 12; clump(x, y, 4 + R() * 7, RAMP.fmid, { seed: i + 350, amb: .25, dif: .35 }); }
  });
  // mid trees: bark trunks with dark moss, roots, bushes along the floor line y 124; open around the sun
  bakePlane('mid', .42, 0, (my, w) => {
    const R = rng(33), G = my + 124, g = gapOf(.42, 34);
    for (const x of [6, 30, 58, 84, 112, 140, 168, 196, 326, 352, 372]) {
      const bx = x + R() * 6, side = bx < g[0] ? 1 : -1, w0 = 8 + R() * 5;
      trunk(bx, my - 8, G, w0, w0 + 3 + R() * 3, RAMP.mid, { seed: 40 + x, side, flare: 12, v: -.16 });
      for (let k = 0; k < 6; k++) { const y = my + 20 + R() * 95; clump(bx + side * (-w0 * .35), y, 1.5 + R() * 2, RAMP.mid.slice(1), { seed: x + k, amb: .4, dif: .3 }); }
    }
    for (let i = 0; i < 100; i++) {
      const x = R() * w, y = my - 10 + R() * 40; if (inGap(x, [g[0], g[1] + 6]) && y > my + 4) continue;
      const [lx, ly] = towardSun(x - 50, y - my); clump(x, y, 8 + R() * 11, RAMP.mid, { seed: i + 450, lx, ly, amb: .28, dif: .5 });
    }
    for (let i = 0; i < 80; i++) { const x = R() * w, y = G - 4 + R() * 8; const [lx, ly] = towardSun(x - 50, y - my); clump(x, y, 4 + R() * 7, RAMP.mid, { seed: i + 550, lx, ly, amb: .25 }); }
    for (let x = 0; x < w; x++) for (let y = G + 2; y < G + 10; y++) if (h2(x, y, 9) < .9) pset(x, y, shade(RAMP.mid, .2 + .3 * fbm2(x * .2, y * .5, 2), x, y));
  });
  // the clearing floor (rate .6): the giant stands on y 140. Lit toward the horizon, darker toward the camera
  bakePlane('clear', .6, 0, (my, w) => {
    const R = rng(44), G = my + 140, X = 262;
    for (let y = my + 126; y < my + PH + 4; y++) for (let x = 0; x < w; x++) {
      const k = inv(my + 128, my + 182, y), n = fbm2(x * .09, y * .22, 4);
      const mossy = fbm2(x * .05 + 3, y * .12, 8) > .54;
      const v = .56 - .46 * k + .4 * (n - .5) + (mossy ? .06 : 0);
      pset(x, y, shade(mossy ? RAMP.moss.slice(0, 5) : RAMP.ground, v, x, y));
    }
    for (let i = 0; i < 46; i++) { const x = R() * w, y = my + 130 + R() * 46; if (Math.abs(x - X) < 56 && y < my + 150) continue; const [lx, ly] = towardSun(x - 80, y - my); clump(x, y, 2.5 + R() * 4, RAMP.moss.slice(0, 5), { seed: i + 650, lx, ly, flat: 1, amb: .45 - .3 * inv(my + 130, my + 178, y), dif: .4 }); }
    for (let i = 0; i < 12; i++) { const x = R() * w, y = my + 150 + R() * 24; clump(x, y, 1.5 + R() * 2, RAMP.far, { seed: i + 750, flat: 1, amb: .15 }); }
    for (let i = 0; i < 22; i++) { const x = R() * w, y = my + 134 + R() * 36; if (Math.abs(x - X) < 64 && y < my + 152) continue; fern(x, y, 7 + R() * 9, R() < .5 ? -1 : 1, RAMP.mid, { seed: i, rimC: h2(i, 7) < .3 ? rimC : undefined, leaf: 3 }); }
    // clearing-edge trunks give the giant its scale
    for (const [x, side] of [[118, 1], [372, -1]]) {
      trunk(x, my - 12, G + 4, 16, 20, RAMP.bark, { seed: x, side, flare: 16, v: -.08 });
      for (let k = 0; k < 10; k++) { const y = my + 10 + R() * 120; clump(x + (R() - .5) * 12, y, 1.6 + R() * 2, RAMP.moss.slice(0, 3), { seed: x + k * 3, lx: side, ly: -.4, amb: .3, sq: .6, tex: .5 }); }
      for (let i = 0; i < 14; i++) { const [lx, ly] = towardSun(x, i * 4); clump(x + (R() - .5) * 70, my - 4 + R() * 26, 7 + R() * 8, RAMP.mid, { seed: x + i + 900, lx, ly, amb: .25 }); }
    }
  });
  // grass tufts in front of the giant's feet (same rate as the floor)
  bakePlane('clearFront', .6, 0, (my, w) => {
    const R = rng(55);
    for (let i = 0; i < 70; i++) {
      const x = R() * w, y = my + 141 + R() * 30; if (Math.abs(x - 270) < 72 && y < my + 146 && R() < .7) continue;
      const hgt = 2 + R() * 4, dk = inv(my + 141, my + 172, y);
      for (let k = 0; k < 4; k++) { const bx = x + (k - 1.5) * 1.2; line(bx, y, bx + (R() - .5) * 2, y - hgt, shade(RAMP.moss.slice(0, 5), .55 - .4 * dk + .3 * (R() - .5), bx | 0, y | 0)); }
    }
  });
  // near plane (rate 1): big trunks, an overhead branch with dense dark leaves, the fern band at the bottom
  bakePlane('near', 1, 0, (my, w) => {
    const R = rng(66);
    for (const [x, w0, side] of [[22, 34, 1], [150, 24, 1], [384, 30, -1]]) {
      trunk(x, my - 14, my + PH, w0, w0 + 6, RAMP.near, { seed: x, side, flare: 30, v: -.05 });
      for (let y = my - 14; y < my + PH; y++) if (vn2(y * .05, x, 8) > .58 && y < my + 150) { const xr = Math.round(x + side * (w0 / 2 + 3 * inv(my + PH - 30, my + PH, y) ** 2.2 * 6) - (side > 0 ? 1 : 0) + sn1(y * .05, x) * 1.2); pset(xr, y, rimC); }
      for (let k = 0; k < 9; k++) { const y = my + 20 + R() * 140; clump(x + (R() - .5) * w0 * .7, y, 1.8 + R() * 2.5, [RAMP.near[2], RAMP.near[3], RAMP.moss[0], RAMP.moss[1]], { seed: x + k * 7, lx: side, ly: -.3, amb: .3, dif: .4, sq: .6, tex: .5 }); }
    }
    for (let i = 0; i < 60; i++) {
      const x = R() < .7 ? R() * 140 : 360 + R() * 70, y = my - 8 + R() * 26;
      const [lx, ly] = towardSun(x - 40, y - my); clump(x, y, 6 + R() * 9, RAMP.near, { seed: i + 1100, lx, ly, amb: .3, dif: .55 });
    }
    for (let x = 0; x < 140; x++) { const y = my + 13 + Math.round(4 * Math.sin(x * .04) + x * .04); for (let k = 0; k < 3; k++) pset(x, y + k, shade(RAMP.near, .3 + .2 * k, x, y)); }
    for (let i = 0; i < 70; i++) { const x = R() * w, y = my + 168 + R() * 14; if (x > 60 && x < 140 && R() < .6) continue; clump(x, y, 5 + R() * 8, RAMP.near, { seed: i + 1300, lx: .3, ly: -1, amb: .25, dif: .4, rimC: h2(i, 9) < .25 ? rimC : undefined }); }
    for (let i = 0; i < 18; i++) fern(R() * w, my + 176 + R() * 6, 12 + R() * 14, R() < .5 ? -1 : 1, RAMP.near, { seed: i + 40, rimC, leaf: 6 });
  });
  // foreground (rate 1.5): fern fronds through the bottom corners, nearly black
  bakePlane('fg', 1.5, 0, (my, w) => {
    const R = rng(77);
    for (const [x, dir] of [[6, 1], [26, 1], [440, -1], [462, -1]]) for (let k = 0; k < 3; k++) fern(x + k * 5, my + 186, 34 + R() * 16, dir, RAMP.near.slice(0, 3), { seed: x + k, rimC, leaf: 9, droop: 1.3 });
  });
}

// ---- sky card, haze, shafts ----
function drawSky(t, L) {
  const [sx, sy] = sunAt(t);
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    const d = Math.hypot(x - sx, (y - sy) * 1.25);
    let v = .1 + .32 * (y / PH) + (.55 + .35 * L) * Math.exp(-d / (38 + 26 * L)) + .1 * L;
    if (d < 6 + L) v = 1.2; else if (d < 9) v = Math.max(v, .9 + .1 * L);
    FB.d[y * PW + x] = shade(RAMP.sky, v, x, y);
  }
}
// a horizontal haze band: dithered FOG remap, densest near the sun, drifting with the plane behind it
function haze(t, L, y0, y1, str, rate, seed) {
  const [sx] = sunAt(t), cx = camX(t) * rate, cy = -camY(t) * rate;
  for (let y = Math.max(0, Math.floor(y0 + cy)); y < Math.min(PH, y1 + cy); y++) {
    const prof = Math.sin(Math.PI * inv(y0 + cy, y1 + cy, y));
    for (let x = 0; x < PW; x++) {
      const n = vn2((x + cx + t * 2.5) * .03, y * .09, seed), sunk = Math.exp(-Math.abs(x - sx) / 80);
      const k = str * prof * (.35 + .65 * n) * (.55 + .45 * sunk) * (.75 + .25 * L), th = .62 * bay(x, y) + .38 * h2(x, y, 5), i = y * PW + x;
      if (th < k) { let c = FOG[FB.d[i]]; if (th < k * sunk * L * .8) c = LIGHT[c]; FB.d[i] = c; }
    }
  }
}
const BEAMS = [[-.78, .05], [-.52, .075], [-.3, .06], [-.1, .05], [.12, .08], [.4, .06]];
function shaftK(t, L, x, y) {
  const [sx, sy] = sunAt(t), dx = x - sx, dy = y - sy; if (dy < 4) return 0;
  const a = Math.atan2(dx, dy), d = Math.hypot(dx, dy);
  let k = 0;
  for (let i = 0; i < BEAMS.length; i++) {
    const [b, wd] = BEAMS[i], aa = b + .03 * Math.sin(t * .35 + i * 1.7), z = (a - aa) / (wd * (.8 + .4 * L));
    if (Math.abs(z) > 1.8) continue;
    k += (Math.exp(-z * z) - .04) * (.55 + .45 * vn2(d * .045 - t * .25, i * 3.1, 77)) * (.7 + .3 * Math.sin(t * .5 + i * 2.3));
  }
  return k * Math.pow(L, 1.3) * .95 * clamp(1 - d / 240) * clamp(d / 22);
}
function shafts(t, L) {
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    const k = shaftK(t, L, x, y); if (k <= 0) continue;
    const th = .62 * bay(x, y) + .38 * h2(x, y, 6), i = y * PW + x, c = FB.d[i];
    if (th < k * 1.3) FB.d[i] = th < k * .55 ? (th < k * .18 ? LIGHT[LIGHT[c]] : LIGHT[c]) : LIGHT2[c];
  }
}
// spores: one-pixel motes, drawn only where a shaft lights them
function spores(t, L) {
  const cx = camX(t) * .8, cy = -camY(t) * .8;
  for (let i = 0; i < 64; i++) {
    const bx = h2(i, 1, 91) * 360, by = h2(i, 2, 91) * 190, vx = 1.5 + h2(i, 3, 91) * 2, vy = -(1 + h2(i, 4, 91) * 2.5);
    let x = bx + vx * t + 3 * Math.sin(t * .7 + i) - cx, y = by + vy * t + 2 * Math.sin(t * .9 + i * 2) + cy;
    x = ((x % 340) + 340) % 340 - 10; y = ((y % 190) + 190) % 190 - 5;
    const k = shaftK(t, L, x, y); if (k < .07) continue;
    if (h2(i, Math.floor(t * 5), 92) < .2) continue; // twinkle
    pset(Math.round(x), Math.round(y), k > .2 ? RAMP.sky[6] : RAMP.fog[2]);
  }
}
// falling leaves: two-pixel flecks that flip between three drawn states (no rotation)
function leaves(t, L) {
  const cx = camX(t) * .9;
  for (let i = 0; i < 9; i++) {
    const per = 7 + h2(i, 5, 93) * 5, ph = h2(i, 6, 93) * per, u = ((t + ph) % per) / per;
    const x = Math.round(h2(i, 7, 93) * 380 - cx + 18 * Math.sin(u * TAU * 1.5 + i) + u * 30), y = Math.round(-6 + u * 196);
    if (x < -2 || x > PW + 2) continue;
    const st = Math.floor((t + i) * 6) % 3, c = shaftK(t, L, x, y) > .12 ? RAMP.rim[1] : RAMP.moss[4];
    if (st === 0) { pset(x, y, c); pset(x + 1, y, c); } else if (st === 1) { pset(x, y, c); pset(x, y + 1, DARK[c]); } else pset(x, y, c);
  }
}
