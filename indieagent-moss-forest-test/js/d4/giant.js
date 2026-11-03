// d4 giant: our own creature, an upright piano on four turned legs, in metres, built on the inked3d kit. Origin of
// the body = bottom centre of the cabinet; the front faces +z. Parts: 0 body, 1 lid, 2 fallboard, 3-6 thighs,
// 7-10 shins, 11-14 feet, 15 tree, 16.. moss chunks.
const P_BODY = 0, P_LID = 1, P_FB = 2, P_TH = 3, P_SH = 7, P_FT = 11, P_TREE = 15, P_CH = 16, NCH = 22;
const MT = { WOOD: 0, DARK: 1, IVORY: 2, KBLK: 3, RUST: 4, GLOW: 5, BARK: 6, STONE: 7 };
// the look: weathered wood that takes the first ray, a dark recess, ivory, key black, rust, the glow panel, bark
configureInk({
  mats: [
    { lit: '#F4C88E', mid: '#A98C72', shade: '#6F6C7E', kind: 1 | 4 }, { lit: '#4A3C3A', mid: '#2E2A30', shade: '#201E26' },
    { lit: '#F6EBCF', mid: '#D8CDB2', shade: '#A29C94' }, { lit: '#4A4044', mid: '#2C282E', shade: '#1E1C22' },
    { lit: '#B8602F', mid: '#8A4430', shade: '#54343A' }, { lit: '#2B2024', mid: '#2B2024', shade: '#2B2024', kind: 2 },
    { lit: '#A88858', mid: '#6E5844', shade: '#3E3438' }, { lit: '#2B2024', mid: '#2B2024', shade: '#2B2024' },
  ],
  weather: { stainL: '#C89A6C', stainS: '#585468', bareL: '#E3D2B4', bareM: '#8F8C88', bareS: '#7C7C8C', lichenL: '#9CB08C', lichenS: '#5D8078', ink: '#262330', rayL: '#F4C88E', rayS: '#C9A080' },
  glow: ['#141014', '#E0772A', '#FFDD8A'],
  tones: ['#1E4A3E', '#336A3E', '#5C8A38', '#98AE40', '#D6CC5E'], blades: ['#2E6A3E', '#5C9440', '#A8C050'], petals: ['#FBF6E4', '#C9B8E2', '#F3E08A', '#E5A93A'],
  ink: '#191f2a',
});
const BW = 3.0, BH = 2.6, BD = 1.25, HIP = [[-1.02, .55], [1.02, .55], [-1.02, -.42], [1.02, -.42]], LEG1 = 1.02, LEG2 = 1.02, FLOOR_Y = 0;
const STAND_Y = 1.72, SLEEP_Y = .12;
function buildGiant() {
  // cabinet: back, two thick side cheeks, top rail, upper and lower front panels with depth, so it has real planes
  roundBox(P_BODY, MT.WOOD, 0, BH / 2, -.12, BW - .16, BH - .08, BD - .3, .12, 3);
  for (const s of [-1, 1]) roundBox(P_BODY, MT.WOOD, s * (BW / 2 - .1), BH / 2, 0, .24, BH, BD, .1, 3);
  roundBox(P_BODY, MT.WOOD, 0, BH - .13, .08, BW - .3, .24, BD - .1, .08, 2);
  // upper panel: stiles and rails framing a fret row, whose slots are real holes in front of the glow
  const uy0 = 1.42, uy1 = 2.36, fz = .47;
  roundBox(P_BODY, MT.GLOW, 0, (uy0 + uy1) / 2, fz - .1, BW - .5, uy1 - uy0, .06, .01, 1);
  roundBox(P_BODY, MT.WOOD, 0, uy1 - .06, fz, BW - .44, .14, .1, .04, 2); roundBox(P_BODY, MT.WOOD, 0, uy0 + .06, fz, BW - .44, .14, .1, .04, 2);
  const nb = 14; for (let i = 0; i <= nb; i++) { const x = lerp(-(BW - .52) / 2, (BW - .52) / 2, i / nb), wd = (i === 0 || i === nb) ? .16 : .1; roundBox(P_BODY, MT.WOOD, x, (uy0 + uy1) / 2, fz, wd, uy1 - uy0 - .2, .1, .03, 1); }
  // keybed: a deep shelf with its key slip, and big carved arms at each end
  const ky = 1.22;
  roundBox(P_BODY, MT.WOOD, 0, ky - .16, .62, BW - .1, .2, .62, .07, 2);
  for (const s of [-1, 1]) { roundBox(P_BODY, MT.WOOD, s * (BW / 2 - .07), ky - .06, .66, .2, .44, .74, .09, 3); }
  roundBox(P_BODY, MT.DARK, 0, ky + .14, .34, BW - .42, .44, .1, .02, 1); // recess behind the keys
  const nk = 40, kw = (BW - .46) / nk;
  for (let i = 0; i < nk; i++) { if (h2(i, 1, 7) < .05) continue; const sag = h2(i, 2, 7) < .1 ? .025 : 0; roundBox(P_BODY, MT.IVORY, -(BW - .46) / 2 + (i + .5) * kw, ky - .03 - sag, .68, kw * .9, .06, .5, .012, 1); }
  for (let i = 0; i < nk - 1; i++) if ([0, 1, 3, 4, 5].includes(i % 7) && h2(i, 4, 7) > .07) roundBox(P_BODY, MT.KBLK, -(BW - .46) / 2 + (i + 1) * kw, ky + .03, .58, kw * .55, .07, .3, .012, 1);
  // lower panel, with a rail, and the pedals
  roundBox(P_BODY, MT.WOOD, 0, .56, .3, BW - .44, .86, .1, .03, 2); roundBox(P_BODY, MT.WOOD, 0, .1, .34, BW - .3, .2, .16, .05, 2);
  for (const x of [-.26, 0, .26]) roundBox(P_BODY, MT.RUST, x, .13, .55, .13, .05, .32, .02, 1);
  // candle sconces
  for (const s of [-1, 1]) { roundBox(P_BODY, MT.RUST, s * 1.32, 1.95, .62, .1, .34, .1, .04, 1); roundBox(P_BODY, MT.RUST, s * 1.32, 2.1, .72, .22, .06, .22, .03, 1); }
  // lid, the earth mound on it, and the fallboard
  roundBox(P_LID, MT.WOOD, 0, .06, BD / 2 - .55, BW + .16, .14, BD + .08, .06, 3);
  for (const [x, y, z, w, h, d] of [[-.55, .22, .08, 2.0, .42, 1.1], [.5, .2, .06, 1.9, .36, 1.05], [-.1, .36, .02, 1.5, .4, .85], [1.12, .16, .1, 1.0, .28, .9], [-1.2, .16, .1, .85, .26, .85]]) roundBox(P_LID, MT.BARK, x, y, z, w, h, d, Math.min(h, d) * .47, 4);
  roundBox(P_FB, MT.WOOD, 0, -.17, .04, BW - .42, .34, .06, .025, 2);
  roundBox(P_FB, MT.RUST, 0, -.03, .075, .9, .03, .02, .008, 1);
  // legs: turned, heavy, with a ring at the knee and a brass-capped foot
  const thigh = [[.05, .1], [.3, .04], [.34, -.1], [.3, -.34], [.25, -.68], [.27, -.84], [.3, -.95], [.26, -1.04], [.05, -1.1]];
  const shin = [[.05, .08], [.27, .02], [.31, -.06], [.25, -.2], [.2, -.55], [.22, -.8], [.27, -.96], [.05, -1.05]];
  const footP = [[.05, .34], [.27, .3], [.36, .2], [.42, .12], [.43, .05], [.38, 0], [.05, 0]];
  for (let i = 0; i < 4; i++) { lathe(P_TH + i, MT.WOOD, thigh); lathe(P_SH + i, MT.WOOD, shin); lathe(P_FT + i, MT.RUST, footP); }
  // the tree growing from the lid: a forked trunk
  tube(P_TREE, MT.BARK, .55, -.1, 0, .62, .6, .05, .1, .07); tube(P_TREE, MT.BARK, .62, .6, .05, .28, 1.2, .1, .065, .03); tube(P_TREE, MT.BARK, .62, .6, .05, 1.05, 1.1, -.05, .06, .03); tube(P_TREE, MT.BARK, .8, .82, 0, 1.0, 1.35, .25, .03, .015);
}

// ---- pose ----
const TG = { rise0: 9.3, rise1: 12.1, fl0: 12.35, fl1: 320 / 24, rr0: 13.4, rr1: 342 / 24 };
const drawT = (t) => (t >= TG.rise0 && t < TG.rise1) ? onN(t, 8) : onN(t, 12); // on threes in the rise, twos otherwise
const FEET0 = [[-1.34, 1.0], [1.34, 1.0], [-1.3, -.85], [1.3, -.85]];
function poseG(t0) {
  const t = drawT(t0), r = t < TG.rise0 ? 0 : t < 9.75 ? -.05 * ease.out(inv(TG.rise0, 9.75, t)) : t < TG.rise1 ? lerp(-.05, 1.03, ease.inOut(inv(9.75, TG.rise1, t))) : lerp(1.03, 1, ease.sine(inv(TG.rise1, 12.7, t)));
  const fl = inv(TG.fl0, TG.fl1, t), rr = inv(TG.rr0, TG.rr1, t), b1 = ease.inOut(inv(12.4, 13.5, t)), b2 = ease.inOut(inv(13.45, 14.4, t));
  const heave = .03 * Math.sin(Math.PI * inv(8.7, 9.3, t));
  const by = lerp(SLEEP_Y, STAND_Y, r) + heave - .09 * Math.sin(Math.PI * inv(TG.fl1, TG.fl1 + .5, t)) - .06 * Math.sin(Math.PI * inv(TG.rr1, TG.rr1 + .4, t)) + .02 * Math.sin(TAU * .3 * t) * smooth(inv(14.2, 14.8, t));
  const bz = .34 * b1 + .34 * b2, bx = -.1 * b1 + .08 * b2 + .1 * Math.sin(Math.PI * inv(12.3, 13.5, t)) * .5;
  const tilt = lerp(.075, 0, clamp(r)) + .05 * Math.sin(Math.PI * inv(12.3, 13.6, t)) - .04 * Math.sin(Math.PI * inv(13.3, 14.5, t));
  const pitch = lerp(.13, .25, clamp(r)) + .03 * Math.sin(Math.PI * inv(10.5, 12.7, t));
  const yaw = .06 * b1 - .03 * b2;
  const feet = FEET0.map(([x, z], i) => { const k = i === 0 ? fl : i === 3 ? rr : 0, e = ease.inOut(k); return { x, y: Math.sin(Math.PI * k) * .46, z: z + .68 * e, down: k <= 0 || k >= 1 }; });
  const body = M.mul(M.tr(bx, by, bz), M.mul(M.ry(yaw), M.mul(M.rz(tilt), M.rx(pitch))));
  const v = (topXat(t - .15) - topXat(t - .4)) * 1.0;
  return { r, by, bx, bz, tilt, pitch, body, feet, fb: ease.out(inv(6.55, 178 / 24, t)), lid: .24 * ease.out(inv(9.0, 9.7, t)) * (1 - .6 * ease.sine(inv(12, 13, t))), sway: clamp(-v * .5, -.3, .3) };
}
function topXat(t) { const r = t < TG.rise0 ? 0 : clamp(inv(9.75, TG.rise1, t)); return (-.1 * ease.inOut(inv(12.4, 13.5, t)) + .08 * ease.inOut(inv(13.45, 14.4, t))) + 3.2 * (lerp(.075, 0, r) + .05 * Math.sin(Math.PI * inv(12.3, 13.6, t))); }
function partMatrices(p, t) {
  const out = new Array(MAXP); for (let i = 0; i < MAXP; i++) out[i] = M.id();
  out[P_BODY] = p.body;
  out[P_LID] = M.mul(p.body, M.mul(M.tr(0, BH, -.5), M.mul(M.rx(-p.lid), M.tr(0, .0, .5))));
  out[P_FB] = M.mul(p.body, M.mul(M.tr(0, 1.52, .42), M.rx(-p.fb * 1.85)));
  out[P_TREE] = M.mul(out[P_LID], M.mul(M.tr(-.6, .3, -.1), M.rz(-p.sway * .6 + .02 * Math.sin(TAU * .18 * t))));
  HIP.forEach(([hx, hz], i) => {
    const Hp = M.apply(p.body, [hx, .06, hz]), f = p.feet[i], F = [f.x, f.y + .3, f.z], d0 = [F[0] - Hp[0], F[1] - Hp[1], F[2] - Hp[2]], d = Math.min(LEG1 + LEG2 - .02, Math.hypot(...d0)), l = Math.hypot(...d0) || 1, dir = d0.map((v) => v / l);
    const a = (LEG1 * LEG1 - LEG2 * LEG2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, LEG1 * LEG1 - a * a));
    const sx = hx < 0 ? -1 : 1, front = hz > 0 ? 1 : -1, hint = [sx * .9, .25, front * .55], dt = hint[0] * dir[0] + hint[1] * dir[1] + hint[2] * dir[2], pr = [hint[0] - dir[0] * dt, hint[1] - dir[1] * dt, hint[2] - dir[2] * dt], pl = Math.hypot(...pr) || 1;
    const K = [Hp[0] + dir[0] * a + pr[0] / pl * h, Hp[1] + dir[1] * a + pr[1] / pl * h, Hp[2] + dir[2] * a + pr[2] / pl * h];
    out[P_TH + i] = segM(Hp, K); out[P_SH + i] = segM(K, F);
    out[P_FT + i] = M.tr(f.x, f.y, f.z);
  });
  // moss chunks: stuck to the body until they fall, then ballistic, tumbling, resting on the floor
  CHUNKS.forEach((c, i) => {
    const partM = (q) => { const m = partMatrices0(q); return m[c.part]; };
    if (t < c.tf) { out[P_CH + i] = out[c.part]; return; }
    const m0 = partM(c.tf), dt = t - c.tf, W0 = M.apply(m0, c.at), tl = Math.sqrt(Math.max(.01, W0[1] - .05) / 4.9), d = Math.min(dt, tl), y = -4.9 * d * d + (dt > tl ? 0 : 0), spin = d * c.spin, dx = c.vx * d, dz = c.vz * d;
    out[P_CH + i] = M.mul(M.tr(W0[0] + dx, W0[1] + y, W0[2] + dz), M.mul(M.rx(spin), M.mul(M.rz(spin * .6), M.mul(dt > tl ? [1, 0, 0, 0, 0, .34, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] : M.id(), M.mul(M.tr(-W0[0], -W0[1], -W0[2]), m0)))));
  });
  return out;
}
function partMatrices0(t) { const p = poseG(t), o = []; o[P_BODY] = p.body; o[P_LID] = M.mul(p.body, M.mul(M.tr(0, BH, -.5), M.mul(M.rx(-p.lid), M.tr(0, 0, .5)))); o[P_FB] = M.mul(p.body, M.mul(M.tr(0, 1.52, .42), M.rx(-p.fb * 1.85))); return o; }

// ---- moss: clumps of the kit's stroke layer planted over the piano ----
const CHUNKS = [];
for (let i = 0; i < NCH; i++) { const R = rng(500 + i), lid = i % 3 === 0; CHUNKS.push({ part: lid ? P_LID : P_BODY, at: lid ? [lerp(-1.4, 1.4, R()), .2, lerp(.2, .8, R())] : [lerp(-1.25, 1.25, R()), i < 11 ? lerp(1.5, 2.25, R()) : lerp(.3, 1.0, R()), .62], r: lid ? .14 + R() * .12 : .13 + R() * .13, tf: i < 11 ? 6.65 + R() * 1.75 : 9.4 + R() * 2.6, spin: (R() - .5) * 3, vx: (R() - .5) * .9, vz: .2 + R() * .6 }); }
function buildMoss() {
  const R0 = rng(1234);
  const mask = (x, y, s) => fbm2(x * 1.15 + s, y * 1.15, 321);
  // the lid: thick; the mound is built up in layers
  for (let i = 0; i < 560; i++) { const x = lerp(-1.72, 1.72, R0()), z = lerp(-.6, .86, R0()), m = mask(x, z, 3); if (m < .24) continue; const edge = Math.max(Math.abs(x) - 1.45, 0) * 2 + Math.max(z - .7, 0) * 2.4; const up = .26 + .34 * m * (1 - edge) + .12 * R0(); clump(P_LID, x, up, z, (x / 2) * .5, 1, (z - .1) * .55, .17 + R0() * .2, R0, { kind: 0 }); }
  for (let i = 0; i < 34; i++) { const x = lerp(-1.6, 1.6, R0()), drop = .25 + R0() * R0() * 1.15; if (Math.abs(x) < 1.0 && R0() < .88) continue; for (let k = 0; k < drop / .07; k++) { const q = k * .07; clump(P_LID, x + .03 * Math.sin(q * 6 + i), .1 - q, .74 + .03 * Math.sin(i), 0, .2, 1, .05 + .05 * (1 - q / drop), R0, { ang: 1.45, dens: .55 }); } }
  for (let i = 0; i < 26; i++) { const x = lerp(-1.6, 1.6, R0()), z = R0() < .7 ? .5 : lerp(-.4, .5, R0()); clump(P_LID, x, .34 + R0() * .32, z, 0, .8, .6, .26 + R0() * .18, R0, { ang: .9 }); }
  // draped down the front and shoulders as hanging masses
  for (let i = 0; i < 190; i++) { const s = R0() < .55 ? -1 : 1, x = s * lerp(1.26, 1.62, Math.pow(R0(), .7)), y = lerp(1.5, 2.72, Math.pow(R0(), .5)); if (mask(x, y, 9) < .44) continue; const z = R0() < .75 ? .68 : lerp(-.6, .6, R0()), side = Math.abs(x) > 1.46; clump(P_BODY, side ? s * 1.55 : x, y, z, side ? s : s * .2, .35, side ? 0 : 1, .1 + R0() * .13, R0, { ang: 1.3 }); }
  // along the keybed ends and over the arms
  for (let i = 0; i < 60; i++) { const s = R0() < .5 ? -1 : 1, x = s * lerp(1.2, 1.56, R0()), z = lerp(.36, 1.02, R0()); clump(P_BODY, x, 1.46 + R0() * .05, z, 0, 1, .25, .1 + R0() * .13, R0); }
  // the ground moss that climbed up the lower panel and its corners
  for (let i = 0; i < 170; i++) { const x = lerp(-1.66, 1.66, R0()), y = Math.pow(R0(), 1.9) * (.38 + .7 * Math.max(0, -x * .55 + mask(x, 2, 5))), s = Math.abs(x) > 1.5; if (mask(x, y, 4) < .42) continue; clump(P_BODY, x, y, .52, s ? Math.sign(x) : 0, .2, s ? .2 : 1, .12 + R0() * .15, R0, { ang: 1.1 }); }
  // the side plane and the back, seen as the giant turns
  for (let i = 0; i < 120; i++) { const s = R0() < .5 ? -1 : 1, y = R0() * 2.6, z = lerp(-.6, .6, R0()); if (mask(z, y, 8 + s) < .47) continue; clump(P_BODY, s * 1.56, y, z, s, .3, 0, .12 + R0() * .14, R0, { ang: 1.2 }); }
  // sleeves on the legs
  for (let l = 0; l < 4; l++) for (let i = 0; i < 24; i++) { const a = R0() * TAU, onTh = R0() < .7, y = -R0() * .9, r = .27; if (mask(a, y + l, 11) < .46) continue; clump((onTh ? P_TH : P_SH) + l, Math.cos(a) * r, y, Math.sin(a) * r, Math.cos(a), .3, Math.sin(a), .08 + R0() * .1, R0, { ang: 1.2 }); }
  // the tree crown: lobes of leaf strokes
  for (const [cx, cy, cz, rr] of [[.32, 1.42, .1, .55], [1.1, 1.3, -.05, .5], [.72, 1.7, .05, .55], [1.0, 1.62, .25, .34]]) for (let i = 0; i < 90; i++) { const a = R0() * TAU, b = (R0() - .5) * Math.PI, q = Math.pow(R0(), .34) * rr, nx = Math.cos(a) * Math.cos(b), ny = Math.sin(b) * .72, nz = Math.sin(a) * Math.cos(b); clump(P_TREE, cx + nx * q, cy + ny * q, cz + nz * q * .7, nx, ny + .35, nz, .07 + R0() * .08, R0, { ang: .7, dens: .8 }); }
  // sleep blankets on the front: chunks that fall as it wakes
  CHUNKS.forEach((c, i) => { const g = rng(900 + i), [x0, y0, z0] = c.at, k = Math.round(10 + c.r * 34); for (let q = 0; q < k; q++) { const a = g() * TAU, r = Math.sqrt(g()) * c.r * 1.9; clump(P_CH + i, x0 + Math.cos(a) * r, y0 + (c.part === P_LID ? .25 : Math.sin(a) * r * .72), z0 + (c.part === P_LID ? Math.sin(a) * r * .4 : .13), 0, c.part === P_LID ? 1 : .4, c.part === P_LID ? .3 : 1, .1 + g() * .13, g, { ang: 1.1 }); } });
  // star flowers on blade tufts, on the lid and the front
  const g2 = rng(77); for (let i = 0; i < 70; i++) { const x = lerp(-1.55, 1.55, g2()), z = lerp(-.2, .85, g2()); if (mask(x, z, 3) < .42) continue; tuft(P_LID, x, .46 + mask(x, z, 3) * .3, z, 0, 1, .4, g2); }
  for (let i = 0; i < 22; i++) { const x = lerp(-1.6, 1.6, g2()), y = Math.pow(g2(), 1.6) * .6; if (mask(x, y, 4) < .42) continue; tuft(P_BODY, x, y + .05, .68, 0, .2, 1, g2); }
}
