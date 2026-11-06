// Snow bus: an old two-tone tour bus of our own design, in metres, built on the inked3d kit. Origin = ground under the
// bus's centre; the front faces +x, the near side faces +z. Parts: 0 body, 1 roof, 2-5 wheels, 6 door, 7 ground
// (identity: the snow drifts it was parked in stay behind), 8.. snow slabs that slide off.
const P_BODY = 0, P_ROOF = 1, P_WH = 2, P_DOOR = 6, P_GND = 7, P_CH = 8, NCH = 18;
const MT = { CREAM: 0, RED: 1, CHROME: 2, GLASS: 3, RUBBER: 4, LAMP: 5, DARK: 6, SIGN: 7 };
configureInk({
  mats: [
    { lit: '#F1E3C2', mid: '#B9A98E', shade: '#6A6A80', kind: 1 }, { lit: '#C8503A', mid: '#8E3A30', shade: '#4E2A38', kind: 1 },
    { lit: '#F4F0EC', mid: '#9AA3B2', shade: '#4A5060' }, { lit: '#5A6E8C', mid: '#2F3C52', shade: '#1C2434' },
    { lit: '#44464C', mid: '#2A2C32', shade: '#17181E' }, { lit: '#2B2A30', mid: '#2B2A30', shade: '#2B2A30', kind: 2 },
    { lit: '#2A2630', mid: '#1C1A22', shade: '#121018' }, { lit: '#2B2A30', mid: '#2B2A30', shade: '#2B2A30', kind: 2 },
  ],
  weather: { stainL: '#A86A3C', stainS: '#5C3E3A', bareL: '#9EA4AE', bareM: '#6F7682', bareS: '#4B5260', lichenL: '#C97A3A', lichenS: '#7A4A32', ink: '#1E2030', rayL: '#F1E3C2', rayS: '#B9A98E', density: .42, scale: .55 },
  glow: ['#2B2A30', '#E89A3C', '#FFF2C6'],
  tones: ['#6F86A8', '#93A9C6', '#BCD0E4', '#E3EEF8', '#FFFFFF'], blades: ['#9BB6D2', '#C9DCEE', '#F2F8FF'], petals: ['#FFFFFF', '#EAF2FB', '#D8E6F4', '#FFFFFF'],
  ink: '#1a1e2e',
});
const BL = 9.0, BWd = 2.5, R_WH = .55, BY0 = .62, BH = 2.3; // body sits BY0 above the ground; windows from y 1.95 to 2.6
const WHEELS = [[2.9, 1.15], [2.9, -1.15], [-2.7, 1.15], [-2.7, -1.15]];
function buildBus() {
  // body: a long rounded box, cream below the belt line and red above, with the belt as a chrome strip
  roundBox(P_BODY, MT.CREAM, 0, BY0 + .62, 0, BL, 1.24, BWd, .22, 6);
  roundBox(P_BODY, MT.RED, 0, BY0 + 1.7, 0, BL - .06, .92, BWd - .04, .26, 6);
  roundBox(P_BODY, MT.RED, 0, BY0 + 2.2, 0, BL - .3, .34, BWd - .3, .16, 4);
  for (const s of [-1, 1]) roundBox(P_BODY, MT.CHROME, 0, BY0 + 1.24, s * (BWd / 2 - .005), BL - .4, .07, .05, .02, 1);
  // side windows: seven on each side, glass set just proud of the red
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const x = -3.55 + i * 1.12; roundBox(P_BODY, MT.GLASS, x, BY0 + 1.72, s * (BWd / 2 - .01), .92, .68, .06, .06, 2); }
  // windshield, split by a chrome post, and the destination box above it; two headlights, bumper, grille
  for (const s of [-1, 1]) roundBox(P_BODY, MT.GLASS, BL / 2 - .02, BY0 + 1.7, s * .6, .06, .8, 1.1, .06, 2);
  roundBox(P_BODY, MT.CHROME, BL / 2, BY0 + 1.7, 0, .08, .84, .08, .02, 1);
  roundBox(P_BODY, MT.SIGN, BL / 2 - .02, BY0 + 2.22, 0, .06, .28, 1.9, .03, 1);
  for (const s of [-1, 1]) { roundBox(P_BODY, MT.CHROME, BL / 2 + .02, BY0 + .62, s * .85, .1, .36, .36, .06, 2); roundBox(P_BODY, MT.LAMP, BL / 2 + .07, BY0 + .62, s * .85, .04, .26, .26, .04, 2); }
  roundBox(P_BODY, MT.CHROME, BL / 2 + .06, BY0 + .1, 0, .14, .22, BWd - .2, .06, 2);
  for (let i = 0; i < 9; i++) roundBox(P_BODY, MT.CHROME, BL / 2 + .02, BY0 + .18 + i * .05, 0, .04, .02, 1.2, .005, 1);
  // mirrors on stalks, the door with its dark window, a rear bumper and the exhaust
  for (const s of [-1, 1]) { tube(P_BODY, MT.CHROME, BL / 2 - .3, BY0 + 1.9, s * (BWd / 2), BL / 2 - .1, BY0 + 2.0, s * (BWd / 2 + .32), .02, .02, 6); roundBox(P_BODY, MT.CHROME, BL / 2 - .1, BY0 + 2.0, s * (BWd / 2 + .36), .06, .26, .18, .03, 1); }
  roundBox(P_DOOR, MT.CREAM, 0, 0, 0, .9, 1.9, .06, .04, 2); roundBox(P_DOOR, MT.DARK, 0, .5, .02, .62, .7, .06, .03, 1);
  roundBox(P_BODY, MT.CHROME, -BL / 2 - .04, BY0 + .1, 0, .1, .2, BWd - .3, .05, 2);
  tube(P_BODY, MT.RUBBER, -BL / 2 + .2, .5, -.8, -BL / 2 - .2, .42, -.8, .06, .07, 6);
  // roof: a shallow dome with two rack rails
  roundBox(P_ROOF, MT.CREAM, 0, 0, 0, BL - .4, .34, BWd - .36, .16, 5);
  for (const s of [-1, 1]) roundBox(P_ROOF, MT.CHROME, 0, .26, s * .9, BL - 1.2, .06, .05, .02, 1);
  // wheels: a tyre and a chrome hub, as lathes round y, turned to face sideways by their part matrix
  const tyre = [[.18, .16], [.46, .15], [.55, .09], [.57, 0], [.55, -.09], [.46, -.15], [.18, -.16]], hub = [[.02, .19], [.2, .18], [.3, .14], [.34, .1], [.34, .08], [.02, .08]];
  for (let i = 0; i < 4; i++) { lathe(P_WH + i, MT.RUBBER, tyre, 0, 0, 0, 20); lathe(P_WH + i, MT.CHROME, hub, 0, 0, 0, 14); }
}

// ---- pose ----
const TB = { flick0: 3.0, catch: 4.3, shud0: 5.0, shud1: 6.4, roll0: 7.1, roll1: 9.6 };
const drawT = (t) => onN(t, 12); // the bus on twos throughout
function glowK(t) { const pulse = (c, w, a) => a * Math.exp(-Math.pow((t - c) / w, 2)); return clamp(pulse(3.0, .07, .3) + pulse(3.35, .06, .45) + pulse(3.8, .08, .65) + smooth(inv(4.1, 4.5, t))); }
function poseB(t0) {
  const t = drawT(t0), sh = smooth(inv(TB.shud0, TB.shud0 + .3, t)) * (1 - smooth(inv(TB.shud1 - .5, TB.shud1, t)));
  const roll = ease.inOut(inv(TB.roll0, TB.roll1, t)), x = roll * BL, antic = -.12 * Math.sin(Math.PI * inv(TB.roll0 - .6, TB.roll0 + .4, t));
  const pitch = -.045 * Math.sin(Math.PI * inv(TB.roll0, TB.roll0 + 1.2, t)) + .03 * sh * Math.sin(t * 31) + .02 * Math.sin(Math.PI * inv(TB.roll1 - .4, TB.roll1 + .3, t));
  const rollA = .025 * sh * Math.sin(t * 27 + 1) + .012 * Math.sin(t * 2.3) * roll * (1 - roll);
  const by = .02 * sh * Math.abs(Math.sin(t * 29)) + .015 * Math.sin(x * 2.1) * roll;
  const body = M.mul(M.tr(x + antic, by, 0), M.mul(M.rz(pitch), M.rx(rollA)));
  return { x: x + antic, by, pitch, body, spin: -(x + antic) / R_WH, door: .0, glow: glowK(t), moving: roll > 0 && roll < 1 };
}
function partMatrices(p, t) {
  const out = new Array(MAXP); for (let i = 0; i < MAXP; i++) out[i] = M.id();
  out[P_BODY] = p.body;
  out[P_ROOF] = M.mul(p.body, M.tr(0, BY0 + 2.48, 0));
  out[P_DOOR] = M.mul(p.body, M.tr(BL / 2 - 1.2, BY0 + 1.0, BWd / 2 + .01));
  WHEELS.forEach(([wx, wz], i) => { out[P_WH + i] = M.mul(p.body, M.mul(M.tr(wx, R_WH - 0, wz), M.mul(M.rx(Math.PI / 2 * (wz > 0 ? 1 : -1)), M.ry(p.spin * (wz > 0 ? 1 : -1))))); });
  out[P_GND] = M.id();
  SLABS.forEach((c, i) => {
    if (t < c.tf) { out[P_CH + i] = out[P_ROOF]; return; }
    const m0 = partMatrices0(c.tf), dt = t - c.tf, W0 = M.apply(m0, c.at), slide = Math.min(dt, .35), sz = c.side * (.9 * slide + .6 * slide * slide), tl = .35 + Math.sqrt(Math.max(.01, W0[1] - .4) / 4.9), d = Math.min(dt, tl), fall = d > .35 ? -4.9 * (d - .35) * (d - .35) : 0, tip = c.side * Math.min(1.2, dt * 2.2);
    out[P_CH + i] = M.mul(M.tr(W0[0] + c.vx * d, W0[1] + fall, W0[2] + sz + c.side * Math.max(0, d - .35) * 1.6), M.mul(M.rx(tip), M.mul(dt > tl ? [1, 0, 0, 0, 0, .3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] : M.id(), M.mul(M.tr(-W0[0], -W0[1], -W0[2]), m0))));
  });
  return out;
}
function partMatrices0(t) { const p = poseB(t); return M.mul(p.body, M.tr(0, BY0 + 2.48, 0)); }

// ---- snow: the kit's stroke layer, planted as drifts, caps and slabs ----
const SLABS = [];
for (let i = 0; i < NCH; i++) { const R = rng(700 + i), side = R() < .5 ? -1 : 1; SLABS.push({ at: [lerp(-3.8, 3.8, R()), .2, side * lerp(.2, .8, R())], r: .34 + R() * .3, side, tf: 5.15 + Math.pow(R(), 1.2) * 1.6, vx: (R() - .5) * .3 }); }
function flakes(part, x, y, z, nx, ny, nz, g, n) { for (let f = 0; f < n; f++) STROKES.push(part, x + (g() - .5) * .3, y + .04 + g() * .06, z + (g() - .5) * .3, nx, ny, nz, .028 + g() * .018, .028 + g() * .018, g() * TAU, g(), 2, g()); }
function buildSnow() {
  const R0 = rng(4321), mask = (x, y, s) => fbm2(x * .9 + s, y * .9, 777);
  // the roof: a deep blanket, thinner at the edges, with the drift wind-piled toward -x
  for (let i = 0; i < 520; i++) { const x = lerp(-4.3, 4.3, R0()), z = lerp(-1.1, 1.1, R0()), m = mask(x, z, 1); if (m < .22) continue; const edge = Math.max(Math.abs(z) - .85, 0) * 2.5 + Math.max(Math.abs(x) - 3.9, 0) * 2, up = .17 + .3 * m * (1 - edge) + .08 * (1 - (x + 4.3) / 8.6) + .05 * R0(); clump(P_ROOF, x, up, z, x * .05, 1, z * .3, .2 + R0() * .22, R0, { ang: .2 }); }
  for (let i = 0; i < 40; i++) { const x = lerp(-4.2, 4.2, R0()), z = lerp(-.9, .9, R0()); flakes(P_ROOF, x, .3 + mask(x, z, 1) * .3, z, 0, 1, 0, R0, 2); }
  // sills: snow on every window ledge and along the belt strip, the bumper top and the mirrors
  for (const s of [-1, 1]) { for (let i = 0; i < 7; i++) { const x = -3.55 + i * 1.12; for (let k = 0; k < 4; k++) clump(P_BODY, x - .4 + k * .27, BY0 + 1.4, s * (BWd / 2 + .02), 0, .8, s * .6, .09 + R0() * .07, R0, { ang: .1, dens: .7 }); } for (let i = 0; i < 26; i++) clump(P_BODY, lerp(-4.2, 4.2, R0()), BY0 + 1.29, s * (BWd / 2 + .02), 0, .9, s * .4, .06 + R0() * .06, R0, { ang: .1, dens: .6 }); }
  for (let i = 0; i < 14; i++) clump(P_BODY, BL / 2 + .06, BY0 + .22, lerp(-1.1, 1.1, R0()), .3, 1, 0, .08 + R0() * .08, R0, { ang: .1, dens: .7 });
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) clump(P_BODY, BL / 2 - .1, BY0 + 2.14, s * (BWd / 2 + .36), 0, 1, s * .2, .06 + R0() * .05, R0, { dens: .6 });
  // the drifts it stood in: on the ground part, banked against the wheels and the low sides, deeper on the lee side
  for (let i = 0; i < 700; i++) { const x = lerp(-5.6, 5.6, R0()), z = lerp(-2.2, 2.2, R0()), inside = Math.abs(x) < BL / 2 - .2 && Math.abs(z) < BWd / 2 - .2; if (inside) continue; const near = Math.max(0, 1 - Math.max(0, Math.abs(z) - BWd / 2) / .7) * Math.max(0, 1 - Math.max(0, Math.abs(x) - BL / 2) / 1.0); if (R0() > .35 + near) continue; const h = .03 + .22 * near * (z < 0 ? 1.1 : .7) + .06 * fbm2(x * .6, z * .6, 99); clump(P_GND, x, h, z, 0, 1, 0, .14 + R0() * .16, R0, { ang: .15, dens: .5 }); }
  for (let i = 0; i < 60; i++) { const x = lerp(-5.4, 5.4, R0()), z = lerp(-2.1, 2.1, R0()); if (Math.abs(x) < BL / 2 && Math.abs(z) < BWd / 2) continue; flakes(P_GND, x, .1 + .3 * fbm2(x * .6, z * .6, 99), z, 0, 1, 0, R0, 1); }
  // slabs: the roof blanket in pieces that slide off when it shudders
  SLABS.forEach((c, i) => { const g = rng(1100 + i), [x0, y0, z0] = c.at, k = Math.round(12 + c.r * 30); for (let q = 0; q < k; q++) { const a = g() * TAU, r = Math.sqrt(g()) * c.r * 1.8; clump(P_CH + i, x0 + Math.cos(a) * r, y0 + .2, z0 + Math.sin(a) * r * .5, 0, 1, c.side * .3, .1 + g() * .12, g, { ang: .2 }); } });
}
