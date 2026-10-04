// v1 additions to the kawaii kit: the plane as a little projected box model (any angle, wings with
// real thickness so they never read as a flat bar), and a world camera for scenery in perspective.
// Units: plane units (the wingspan is 1280; a lane is ~760, so the wings always overhang).
const RED = '#e5545e'; // the cheat line
const GLASS = '#d4eaf7';
let RAWT = 0; // the unquantised frame time (the mouth runs at 24 fps while the drawing boils on twos)
// mouth from the Demucs vocal stem (js/venv.js, 100 Hz, 0..1 level): closed between words,
// a round "oo" on each attack, then a vowel shape picked per syllable, open by level.
function venvAt(t) { for (const [t0, a] of VENV.ranges) { const i = (t - t0) * VENV.hz; if (i >= 0 && i < a.length - 1) { const j = Math.floor(i), u = i - j; return (a[j] + (a[j + 1] - a[j]) * u) / 100; } } return 0; }
function mouthFor(t) {
  const TH = .44, L = venvAt(t); if (L < TH) return { open: 0, shape: 'ah' };
  let on = t; for (let k = 1; k < 80; k++) { if (venvAt(t - k * .01) < TH) break; on = t - k * .01; }
  const open = clamp((L - TH) / .38), dt = t - on, h = hash(Math.round(on * 100) + 7);
  return { open: open * (dt < .05 ? .6 : 1), shape: dt < .07 ? 'o' : h < .55 ? 'ah' : h < .8 ? 'o' : 'ee' };
}

function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = []; for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  const up = []; for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
const circ = (n = 20) => [...Array(n)].map((_, i) => [Math.cos(i / n * TAU), Math.sin(i / n * TAU)]);

// plane3(x, y, kk, o): (x, y) = the ground point under his middle; kk = screen scale.
// o.yaw: 0 = nose at the camera, +PI/2 = nose to screen right. o.pitch: camera elevation (negative = from below).
// o.hop: body bounce up (units), o.lift: whole plane up (tyres too), o.raise: near-wing raise (radians),
// o.raiseFar, o.squash, o.persp (camera distance in units), face fields (eyes, mouth, open, look, lookY, brow, blush),
// o.faceU (face size), o.es (eye size), o.stall (0..1: the outer near prop stops and puffs), o.tilt (bank, radians).
// Returns { face: [x, y], mouth: [x, y], k } in the caller's coordinates.
function plane3(x, y, kk, o) {
  const { t = 0, yaw = 0, pitch = .16, hop = 0, lift = 0, raise = 0, raiseFar = 0, squash = 0, persp = 3000, spin = t * 18, roll = t * 8, faceU = 80, es = 1.3, tilt = 0, shadow = 1 } = o;
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  const Dp = (X, Y, Z) => (-X * sy + Z * cy) * cp + Y * sp;
  const P = (X, Y, Z) => { const xr = X * cy + Z * sy, zc = -X * sy + Z * cy, d = zc * cp + Y * sp, k0 = persp / Math.max(200, persp - d); return [xr * k0, (-Y * cp + zc * sp) * k0]; };
  const vis = (nx, ny, nz) => (-nx * sy + nz * cy) * cp + ny * sp > 0;
  const sx = vis(1, 0, 0) ? 1 : -1;                 // which flank faces us
  const side = Math.abs(sy), front = vis(0, 0, 1);
  const H0 = hop + lift;
  // body space -> plane space: squash, bank (tilt about the long axis), bounce
  const B = (X, Y, Z) => { const xx = X * (1 + squash * .55), yy = Y * (1 - squash); const x2 = xx * ct - (yy - 120) * st, y2 = xx * st + (yy - 120) * ct + 120; return [x2, y2 + H0, Z]; };
  const PB = (X, Y, Z) => P(...B(X, Y, Z));
  const T = (X, Y, Z) => P(X, Y + lift, Z);
  const ZF = 290, ZB = -330;
  const parts = [];
  push(); tr(x, y); sc(kk);
  // shadow on the road
  if (shadow > 0) { seedAt(1); const sh = 1 / (1 + lift / 160); const S = hull([[-660, 0, -40], [660, 0, -40], [660, 0, 60], [-660, 0, 60], [-150, 0, ZF], [150, 0, ZF], [-90, 0, ZB], [90, 0, ZB]].map(([a, b, c]) => P(a * sh, 0, c * sh))); paint(S, '#6b5a7a', .2 * shadow * sh, false); }
  // ---- tyres
  for (const [tx, tz] of [[-122, 165], [122, 165], [-112, -170], [112, -170]]) {
    const sg = Math.sign(tx);
    parts.push({ d: Dp(tx, 52 + lift, tz), f: () => {
      seedAt(5000 + tx + tz);
      const C = circ(22), r = 52, inner = C.map(([c, s0]) => T(tx - sg * 24, 52 + s0 * r, tz + c * r)), outer = C.map(([c, s0]) => T(tx + sg * 24, 52 + s0 * r, tz + c * r));
      shape(hull(inner.concat(outer)), PAL.tyre, 6);
      if (vis(sg, 0, 0) && side > .25) {
        shape(C.map(([c, s0]) => T(tx + sg * 25, 52 + s0 * r * .5, tz + c * r * .5)), PAL.hub, 4);
        for (let i = 0; i < 3; i++) { const a = roll * (yaw > 0 ? -1 : 1) + i * TAU / 3; inkFill(C.slice(0, 12).map((_, j) => { const b = j / 12 * TAU; return T(tx + sg * 26, 52 + Math.sin(a) * r * .26 + Math.sin(b) * 4, tz + Math.cos(a) * r * .26 + Math.cos(b) * 4); })); }
      } else if (vis(0, 0, Math.sign(tz)) && side < .8) {
        shape(rrect(-14, 30, 28, 44, 8, 3).map(([a, b]) => T(tx + a, b, tz + Math.sign(tz) * 50)), PAL.hub, 4);
      }
    } });
  }
  // ---- wing halves (with engines and props)
  const wingHalf = (sg) => {
    const ra = sg === sx ? raise : raiseFar, rx = sg * 140, ry = 160;
    const R = (X, Y, Z) => { const dx = X - rx, dy = Y - ry, a = sg * ra, c = Math.cos(a), s0 = Math.sin(a); return PB(rx + dx * c - dy * s0, ry + dx * s0 + dy * c, Z); };
    const x0 = Math.min(rx, sg * 640), len = 500;
    const slab = (xa, w, z0, d, ya, yb, col, sd) => {
      const top = rrect(xa, z0, w, d, 36, sd).map(([a, b]) => R(a, yb, b)), bot = rrect(xa, z0, w, d, 36, sd).map(([a, b]) => R(a, ya, b));
      seedAt(sd); shape(hull(top.concat(bot)), col, 6);
      if (vis(0, 1, 0) || pitch > 0) shape(top, col, 4.5); else shape(bot, col, 4.5);
    };
    const engines = () => {
      for (const ex of [260, 450]) {
        const X = sg * ex; seedAt(6000 + X);
        const fr = circ(20).map(([c, s0]) => R(X + c * 46, 152 + s0 * 46, 120)), bk = circ(20).map(([c, s0]) => R(X + c * 38, 160 + s0 * 36, -60));
        shape(hull(fr.concat(bk)), PAL.cream, 6);
        if (front) shape(fr, PAL.cream, 4.5);
        // propeller disc and blades
        const stall = (sg === sx && ex === 260) ? (o.stall || 0) : 0;
        const pa = stall > 0 ? lerp(spin * sg + X, 0.4 + Math.sin(t * 30) * .08 * (1 - stall), stall) : spin * sg + X;
        if (stall < .5) { const disc = circ(30).map(([c, s0]) => R(X + c * 84, 152 + s0 * 84, 134)); paint(disc, '#ffffff', .35, false); ink(disc, true, 2.5, { col: 'rgba(30,26,29,.3)' }); }
        for (let i = 0; i < 2; i++) { const a = pa + i * Math.PI, ca = Math.cos(a), sa = Math.sin(a); const bl = rrect(-13, 6, 26, 80, 11, 6100 + i).map(([a2, b2]) => R(X + a2 * ca - b2 * sa, 152 + a2 * sa + b2 * ca, 136)); shape(bl, '#9c8fb0', 4.5); }
        shape(circ(14).map(([c, s0]) => R(X + c * 17, 152 + s0 * 17, 140)), PAL.coral, 4);
      }
    };
    return { d: Dp(sg * 400, 160 + H0, 0), f: () => {
      if (!front) engines();
      slab(x0, len - (sg > 0 ? 90 : 0), -95, 170, 132, 184, PAL.wing, 7000 + sg);
      slab(sg > 0 ? 550 : -640, 90, -95, 170, 132, 184, PAL.pink, 7010 + sg);
      if (front) engines();
    } };
  };
  parts.push(wingHalf(-1), wingHalf(1));
  // ---- tail
  parts.push({ d: Dp(0, 300 + H0, -310), f: () => {
    seedAt(8000);
    const tp = rrect(-178, -350, 356, 80, 30, 8001), top = tp.map(([a, b]) => PB(a, 286, b)), bot = tp.map(([a, b]) => PB(a, 264, b));
    const finP = (xo) => [[-215, 290], [-310, 290], [-352, 446], [-290, 450], [-238, 300]].map(([z, yy]) => PB(xo, yy, z));
    const fin = () => { shape(hull(finP(-16).concat(finP(16))), PAL.teal, 6); if (side > .3) { const c = PB(sx * 17, 372, -300); push(); tr(c[0], c[1]); sc(Math.max(.3, side), 1); heart(0, 0, 22, PAL.pink, 4); pop(); } };
    if (pitch > .05) { fin(); shape(hull(top.concat(bot)), PAL.wing, 6); shape(top, PAL.wing, 4); } else { shape(hull(top.concat(bot)), PAL.wing, 6); fin(); }
  } });
  // ---- fuselage
  let faceAt = [0, 0], mouthAt = [0, 0];
  parts.push({ d: Dp(0, 170 + H0, 0), f: () => {
    seedAt(9000);
    const fr = rrect(-150, 38, 300, 262, 78, 9001).map(([a, b]) => [a, b, ZF]), bk = rrect(-84, 160, 168, 128, 48, 9002).map(([a, b]) => [a, b, ZB]);
    const all = fr.concat(bk).map((q) => PB(...q));
    shape(hull(all), PAL.cream, 7);
    const sideF = (s, yo) => { const z = lerp(ZB + 20, ZF - 6, s), hx = sx * lerp(84, 150, Math.pow(s, .6)) * 1.004; return [hx, yo(s), z]; };
    if (side > .12) {
      // cheat line along the flank, portholes above it
      const N = 16, topL = [], botL = [];
      const smax = side > .9 ? .64 : 1; for (let i = 0; i <= N; i++) { const s0 = i / N * smax, yc = lerp(222, 150, Math.pow(s0, .7)), hh = lerp(8, 15, s0); topL.push(PB(...sideF(s0, () => yc + hh))); botL.push(PB(...sideF(s0, () => yc - hh))); }
      seedAt(9010); shape(topL.concat(botL.reverse()), RED, 4.5);
      for (let i = 0; i < 4; i++) {
        const s0 = .25 + i * .13, c = sideF(s0, () => lerp(222, 150, Math.pow(s0, .7)) + 48);
        seedAt(9020 + i); shape(circ(16).map(([a, b]) => PB(c[0], c[1] + b * 19, c[2] + a * 19)), PAL.blue, 4.5);
        paint(circ(10).map(([a, b]) => PB(c[0], c[1] + 6 + b * 5, c[2] - 5 + a * 6)), '#ffffff', .85, false);
      }
    }
    let F = null;
    if (front && cy > .25) {
      seedAt(9030); shape(fr.map((q) => PB(...q)), PAL.cream, 6.5);
      paint(rrect(-138, 44, 276, 13, 6, 9031).map(([a, b]) => PB(a, b, ZF + 1)), RED, 1, false); // the cheat line wraps the nose as a thin bumper stripe
      ink(rrect(-138, 44, 276, 13, 6, 9031).map(([a, b]) => PB(a, b, ZF + 1)), true, 3);
      seedAt(9035); shape(rrect(-114, 194, 228, 96, 34, 9035).map(([a, b]) => PB(a, b, ZF + 2)), GLASS, 5.5); // the windscreen: his eyes live here
      paint(rrect(-96, 272, 46, 9, 4).map(([a, b]) => PB(a, b, ZF + 3)), '#ffffff', .9, false);
      F = { o: [0, 240, ZF + 2], u: [1, 0, 0], md: 1.55, bd: .88 };
    }
    if (!F || side > .9) {
      F = { o: [sx * 151, 250, ZF - 94], u: [0, 0, 1], md: 1.5, bd: .85 };
      seedAt(9040); shape([[ZF - 4, 296], [ZF - 178, 296], [ZF - 192, 208], [ZF - 10, 208]].map(([z, yy]) => PB(sx * 150, yy, z)), GLASS, 5); // the windscreen along the brow, eyes in it
    }
    const O = PB(...F.o), Ux = PB(F.o[0] + F.u[0], F.o[1], F.o[2] + F.u[2]), Vy = PB(F.o[0], F.o[1] - 1, F.o[2]);
    let ax = Ux[0] - O[0], ay = Ux[1] - O[1], bx = Vy[0] - O[0], by = Vy[1] - O[1];
    if (ax < 0) { ax = -ax; ay = -ay; }  // never draw the face mirrored
    const am = Math.hypot(ax, ay), bm = Math.hypot(bx, by);
    const fx0 = Math.max(.42, am / Math.max(bm, 1e-3)); // keep it readable when foreshortened
    push(); both((c) => c.transform(ax / am * fx0 * bm, ay / am * fx0 * bm, bx, by, O[0], O[1]));
    const MM = o.sing === false ? { open: 0, shape: 'ah' } : mouthFor(RAWT), oo = o.open || 0;
    face(0, 0, faceU, { mouthDy: F.md, blushDy: F.bd, hatch: false, mw0: .85, ...o, open: Math.max(oo, MM.open), mshape: oo > MM.open ? 'ah' : MM.shape, w: o.w || 7, es });
    pop();
    faceAt = [x + kk * O[0], y + kk * O[1]]; mouthAt = [x + kk * (O[0] + bx * faceU * F.md), y + kk * (O[1] + by * faceU * F.md)];
  } });
  parts.sort((a, b) => a.d - b.d).forEach((p) => p.f());
  pop();
  return { face: faceAt, mouth: mouthAt, k: kk };
}

// ---- the world camera: ground at y = 0, road along z. cam: { x, z, h, yaw, F, hz, ox, tilt }
// yaw > 0 turns the camera to the right. Returns pt(wx, wy, wz) -> { x, y, k, d } (k = screen px per unit).
function wcam(c) {
  const co = Math.cos(c.yaw), si = Math.sin(c.yaw);
  return (wx, wy, wz) => { const dx = wx - c.x, dz = wz - c.z, xr = dx * co - dz * si, d = dx * si + dz * co; return { x: c.ox + c.F * xr / d, y: c.hz - c.F * (wy - c.h) / d, k: c.F / d, d }; };
}
// a ground strip (wx0..wx1 across, z range) as a screen polygon, clipped to d > near
function gstrip(cam, wx0, wx1, z0, z1, n = 40, near = 120) {
  const L = [], R = [];
  for (let i = 0; i <= n; i++) { const z = lerp(z0, z1, i / n), a = cam(wx0, 0, z), b = cam(wx1, 0, z); if (a.d > near && b.d > near) { L.push([a.x, a.y]); R.push([b.x, b.y]); } }
  return L.concat(R.reverse());
}
function gline(cam, wx, z0, z1, n = 40, near = 120, wy = 0) { const P = []; for (let i = 0; i <= n; i++) { const p = cam(wx, wy, lerp(z0, z1, i / n)); if (p.d > near) P.push([p.x, p.y]); } return P; }

// place him on the road of a world camera: cfg is the wcam config, (wx, wz) his ground point
function placePlane(cam, cfg, wx, wz, o) {
  const p = cam(wx, 0, wz), yawP = cfg.yaw + Math.atan2(p.x - cfg.ox, cfg.F);
  return plane3(p.x, p.y, p.k, { ...o, yaw: yawP + (o.dyaw || 0), pitch: o.pitch ?? Math.atan2(cfg.h - 170 - (o.lift || 0), p.d), persp: p.d });
}

// ---- the SIDE VIEW, drawn as its own 2D figure (the box model read like a bus side-on).
// Facing right; (x, y) = ground point under his middle; kk = scale. A rounded capsule with a soft taper,
// his own round nose cone carrying the face, a thin level wing at mid-body whose tip pokes out under the
// tapered tail section, the far wingtip peeking over his back, a small engine pod set back under the wing.
function planeSideK(x, y, kk, o) {
  const { t = 0, hop = 0, lift = 0, squash = 0, tilt = 0, spin = t * 18, roll = t * 8 } = o;
  push(); tr(x, y); sc(kk);
  seedAt(3500); paint(ell(-10, -4, 330 / (1 + lift / 200), 22), '#6b5a7a', .2, false);
  push(); tr(0, -lift);
  // tyres (behind the body)
  for (const tx of [-165, 150]) { seedAt(3510 + tx); shape(ell(tx, -52, 52, 52, 24), PAL.tyre, 6); shape(ell(tx, -52, 25, 25, 16), PAL.hub, 4); for (let i = 0; i < 3; i++) { const a = -roll + i * TAU / 3; inkFill(ell(tx + Math.cos(a) * 13, -52 + Math.sin(a) * 13, 4, 4, 8)); } }
  push(); tr(0, -hop); sc(1 + squash * .5, 1 - squash); rot(tilt);
  // far wingtip peeking over his back
  seedAt(3520); shape(rrect(-190, -332, 150, 26, 13, 3520), PAL.wing, 4.5); shape(rrect(-190, -332, 40, 26, 13, 3521), PAL.pink, 4);
  // tail fin and tailplane
  seedAt(3530); shape([[-250, -268], [-318, -268], [-352, -420], [-300, -424], [-210, -280]], PAL.teal, 6);
  push(); tr(-300, -350); heart(0, 0, 20, PAL.pink, 4); pop();
  seedAt(3535); shape(rrect(-392, -282, 140, 24, 12, 3535), PAL.wing, 5);
  // the capsule fuselage: hull of a small tail circle, a middle and a big round nose
  const circ2 = (cx, cy, r, n = 28) => [...Array(n)].map((_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * r]);
  const body = hull([...circ2(-318, -262, 30), ...circ2(-140, -212, 98), ...circ2(60, -200, 108), ...circ2(212, -198, 112)]);
  seedAt(3540); shape(body, PAL.cream, 7);
  // cheat line and portholes along the flank
  const cl = []; for (let i = 0; i <= 16; i++) { const u = i / 16, xx = lerp(-320, 110, u); cl.push([xx, lerp(-262, -205, Math.pow(u, .6)) - 6]); }
  seedAt(3545); shape([...cl.map(([a, b]) => [a, b - 12]), ...cl.slice().reverse().map(([a, b]) => [a, b + 8])], RED, 4);
  for (let i = 0; i < 5; i++) { const px = -230 + i * 62, py = lerp(-262, -200, Math.pow((px + 320) / 450, .6)) - 32; seedAt(3550 + i); shape(ell(px, py, 17, 17, 14), PAL.blue, 4.5); paint(ell(px - 5, py - 5, 5, 4), '#ffffff', .85, false); }
  // the near wing: thin, level, at mid-body behind the cockpit; its tip pokes out under the tail taper
  seedAt(3560); shape(rrect(-300, -178, 360, 30, 15, 3560), PAL.wing, 5.5); shape(rrect(-300, -178, 58, 30, 15, 3561), PAL.pink, 5);
  // engine pod under the wing, propeller disc in front of it (well clear of the face)
  seedAt(3570); shape(rrect(-70, -156, 120, 46, 22, 3570), PAL.cream, 5);
  paint(ell(62, -133, 12, 62), '#ffffff', .4, false); ink(ell(62, -133, 12, 62, 20), true, 2.5, { col: 'rgba(30,26,29,.3)' });
  const bl = Math.cos(spin) * 60; shape(rrect(56, -133 - Math.abs(bl), 12, Math.abs(bl) * 2 + 2, 6, 3571), '#9c8fb0', 4);
  shape(ell(58, -133, 11, 11, 10), PAL.coral, 3.5);
  // the nose cone: windscreen on its upper curve with the eyes in it, mouth on the lower curve
  seedAt(3580); const ws = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI * .5 - .62 + i / 12 * 1.25; ws.push([212 + Math.cos(a) * 104, -198 + Math.sin(a) * 104]); } for (let i = 12; i >= 0; i--) { const a = -Math.PI * .5 - .62 + i / 12 * 1.25; ws.push([212 + Math.cos(a) * 44 + 18, -228 + Math.sin(a) * 30]); }
  const wsb = [[150, -286], [282, -286], [306, -232], [140, -228]].map(([a, b], i) => [a, b]);
  shape(rrect(144, -296, 160, 68, 30, 3581), GLASS, 5); paint(rrect(160, -286, 40, 8, 4), '#ffffff', .9, false);
  const MM = o.sing === false ? { open: 0, shape: 'ah' } : mouthFor(RAWT), oo = o.open || 0;
  face(226, -262, 34, { mouthDy: 3.3, blushDy: 2.3, blushX: .75, hatch: false, mw0: 1.9, es: 1.05, ...o, open: Math.max(oo, MM.open), mshape: oo > MM.open ? 'ah' : MM.shape, w: 6 });
  pop(); pop();
  const out = { face: [x + kk * 226, y - kk * (262 + hop + lift)], mouth: [x + kk * 226, y - kk * (150 + hop + lift)], k: kk };
  pop();
  return out;
}

// side-on placement on a world camera (travelling shots): the 2D side figure at his ground point
function placeSide(cam, wz, o) { const p = cam(0, 0, wz); return planeSideK(p.x, p.y, p.k, o); }

// ---- HEAD-ON, the look test's hand-drawn plane (Bob liked it), corrected per FACE.md: the windscreen
// grows to hold his eyes, the mouth sits on the lower nose, blush is a flat tint. Tyres are drawn first,
// under and behind the body, so nothing ever covers the face. Wings split at the root so one can lift.
// (x, y) = ground point; o: t, hop, lift, squash, tilt, raiseL/raiseR (screen-left/right wing), stall (inner left prop)
function planeFrontK(x, y, kk, o) {
  const { t = 0, hop = 0, lift = 0, squash = 0, tilt = 0, spin = t * 18, raiseL = 0, raiseR = 0, stall = 0 } = o;
  push(); tr(x, y); sc(kk);
  seedAt(1000); paint(ell(0, -4, 300 / (1 + lift / 220), 26), '#6b5a7a', .22, false);
  push(); tr(0, -lift);
  tyreFront(-88, 0, 70, 78, 1001); tyreFront(88, 0, 70, 78, 1003);
  push(); tr(0, -hop); sc(1 + squash * .5, 1 - squash); rot(tilt);
  seedAt(1010);
  shape(rrect(-24, -395, 48, 160, 20, 1010), PAL.teal, 6);                                  // tail fin, behind
  heart(0, -350, 18, PAL.pink, 4);
  shape(rrect(-165, -318, 330, 30, 14, 1012), PAL.wing, 6);                                 // tailplane
  for (const sgn of [-1, 1]) {                                                              // the wings: level, far too long
    const ra = sgn < 0 ? raiseL : raiseR;
    push(); tr(sgn * 140, -153); rot(-sgn * ra);
    seedAt(1020 + sgn); shape(rrect(sgn > 0 ? 0 : -500, -25, 500, 50, 24, 1020 + sgn), PAL.wing, 6);
    shape(rrect(sgn > 0 ? 420 : -500, -25, 80, 50, 24, 1022 + sgn), PAL.pink, 6);
    for (const ex of [110, 290]) {
      seedAt(1030 + sgn * ex); shape(ell(sgn * ex, 0, 48, 46, 24), PAL.cream, 6);
      const st = (sgn < 0 && ex === 110) ? stall : 0, sp = st > 0 ? lerp(spin * sgn + ex, .4 + Math.sin(t * 30) * .08 * (1 - st), st) : spin * sgn + ex;
      propFront(sgn * ex, 0, 82, sp, 1040 + sgn * ex);
    }
    pop();
  }
  seedAt(1100);
  shape(rrect(-150, -300, 300, 262, 78, 1100), PAL.cream, 7);                               // the body / nose
  paint(rrect(-132, -66, 264, 12, 6), RED, 1, false); ink(rrect(-132, -66, 264, 12, 6), true, 3); // cheat line as a thin chin stripe
  shape(rrect(-112, -290, 224, 92, 34, 1101), GLASS, 6);                                    // windscreen: his eyes live here
  paint(rrect(-96, -280, 44, 9, 4), '#ffffff', .9, false);
  const MM = o.sing === false ? { open: 0, shape: 'ah' } : mouthFor(RAWT), oo = o.open || 0;
  face(0, -244, 62, { mouthDy: 1.9, blushDy: 1.1, blushX: 1.6, hatch: false, mw0: 1.05, es: 1.25, ...o, open: Math.max(oo, MM.open), mshape: oo > MM.open ? 'ah' : MM.shape, w: 7 });
  pop(); pop();
  const out = { face: [x, y - kk * (244 + hop + lift)], mouth: [x, y - kk * (126 + hop + lift)], k: kk };
  pop();
  return out;
}
function placeFront(cam, wz, o, wx = 0) { const p = cam(wx, 0, wz); return planeFrontK(p.x, p.y, p.k, o); }
