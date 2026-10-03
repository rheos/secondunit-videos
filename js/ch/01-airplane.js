// 71.0 - 91.0  "I'm an airplane on the highway / and I feel so strange / mnuh nuh nuh /
// I'm an airplane on the highway / and I'm sick of the passing lane"
// A stubby 1950s twin-prop airliner stuck driving the highway on car tyres, wings far too long for the lane,
// drawn by one electron beam on a lab oscilloscope (beam.js + look.js). Line only, no fills.
//   71.00 cruise    a wireframe highway receding to wireframe mountains; the camera cranes down from high
//                   and wide to him, nose-on. Telegraph poles stream past and his wingtips whack one on
//                   every beat (left, right, left...), the wing boings, the dashes pulse on the beat
//   77.22 strange   close on his face, eyes darting, the beam getting jittery; on "strange" (78.38) the
//                   display loses sync: the picture tears, turns amber and collapses into one Lissajous
//                   figure, which flattens into a single trace
//   79.05 nuh       amber trace; "mnuh nuh nuh" = three blips on the beats that are his face (windscreen
//                   dome, two eyes, a little waveform mouth); then the trace re-syncs to green
//   80.88 lane      side tracking shot: the roped-off passing lane (stanchions, sagging rope, carpet
//                   fringe, chevrons) runs nearest us; wireframe cars zip past under his long near wing
//   84.24 sick      worm's-eye from the shoulder, looking up past the rope at his face and the near wing
//                   overhead; cars rush at the camera under the wing; eye roll on "sick" (86.6); a limo
//                   on "passing lane" which he glares at; a sigh drawn as a sine wave
(() => {
  const STRANGE = 78.38, NUH = 79.05, LINE2 = 80.88, LOW = 84.24;
  const BLIPS = [79.13, 79.73, 80.30];
  const V = 16;                               // his road speed, m/s
  const P = Beam.path, P3 = Beam.path3;
  const wrap = (x, m) => ((x % m) + m) % m;
  const at = (pts, z) => pts.map(([x, y]) => [x, y, z]);
  const ring = (cx, cy, r, n = 40, a0 = 0, a1 = TAU, ry = r) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + r * Math.cos(a), cy + ry * Math.sin(a)]; });
  const ringYZ = (x, cy, cz, r, n = 32) => Array.from({ length: n + 1 }, (_, i) => { const a = TAU * i / n; return [x, cy + r * Math.sin(a), cz + r * Math.cos(a)]; });
  function spline(pts, closed = true, n = 8) {
    const N = pts.length, g = (i) => pts[closed ? ((i % N) + N) % N : clamp(i, 0, N - 1)], out = [];
    for (let i = 0; i < (closed ? N : N - 1); i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u; out.push([0, 1].map((j) => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3))); }
    }
    out.push(closed ? out[0] : pts[N - 1]); return out;
  }
  // a local frame placed in the world: roll about the axle line (z axis through y = 1), bob lifts the body
  function space(cam, org, o = {}) {
    const cr = Math.cos(o.roll || 0), sr = Math.sin(o.roll || 0), ch = Math.cos(o.heading || 0), sh = Math.sin(o.heading || 0);
    const w = (p, body) => {
      let x = p[0], y = p[1] + (body ? (o.bob || 0) : 0); const z = p[2];
      const yy = y - 1; const xr = x * cr - yy * sr; y = x * sr + yy * cr + 1; x = xr;
      return [org[0] + x * ch + z * sh, org[1] + y, org[2] - x * sh + z * ch];
    };
    return {
      cam,
      line: (pts, op = {}) => P3(cam, pts.map((p) => w(p, !op.ground)), op),
      pt: (p, ground) => { const c = cam.toCam(w(p, !ground)); return c[2] > .35 ? cam.proj(c) : null; },
    };
  }

  // ---- the face ----
  // D draws a 2D polyline in the face plane. inner = which side the face centre is on (+1 = +x)
  function eye(D, cx, cy, r, st, inner) {
    const lid = clamp(st.lid ?? .1), vl = cy + r - 2 * r * lid;
    if (lid > .92) { D(ring(cx, cy - r * .15, r * .9, 16, -Math.PI * .12, -Math.PI * .88), { b: 1 }); }
    else {
      const a = Math.asin(clamp((vl - cy) / r, -1, 1)), out = [];
      for (let i = 0; i <= 44; i++) { const th = a + (-Math.PI - 2 * a) * i / 44; out.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]); }
      D(out, { closed: lid > .02, b: 1 });
      const pr = r * .42 * (st.pupil ?? 1), lk = st.look || [0, 0];
      const px = cx + lk[0] * (r - pr) * .85, py = cy + lk[1] * (r - pr) * .85;
      for (const f of [1, .6, .25]) {
        let run = [];
        for (const p of ring(px, py, pr * f, 20)) { if (p[1] <= vl) run.push(p); else { if (run.length > 1) D(run, { b: 1.1, dots: false }); run = []; } }
        if (run.length > 1) D(run, { b: 1.1, dots: false });
      }
    }
    const wv = st.worry ?? 0, by = cy + r * 1.3 + (st.browUp ?? 0) * r * .35;
    D([[cx - inner * r * .9, by - wv * r * .1], [cx, by + r * .08 + wv * r * .1], [cx + inner * r * .9, by + wv * r * .38]], { b: .9 });
  }
  // the mouth: an ellipse whose lower lip carries the voice as a waveform. o = 0 closed .. 1 wide
  function mouth(D, cx, cy, w, o, tk, smile = .1) {
    if (o < .07) { D(Array.from({ length: 17 }, (_, i) => { const u = i / 16 * 2 - 1; return [cx + u * w, cy + smile * (u * u - .3) * w]; }), { b: .95 }); return; }
    const h = w * (.08 + .7 * o), pts = [];
    for (let i = 0; i <= 48; i++) {
      const th = i / 48 * TAU, low = Math.sin(th) < 0;
      pts.push([cx + w * Math.cos(th), cy + Math.sin(th) * (low ? h : h * .3) + smile * w * Math.cos(th) ** 2 + (low ? .09 * w * o * Math.sin(th * 9 + tk * 47) : 0)]);
    }
    D(pts, { b: 1 });
  }

  // ---- the plane, nose-on. local: x = his right as we look at him, y up, z away from us (toward his tail) ----
  function planeFront(sp, st) {
    const L = sp.line, D0 = (z) => (pts, o) => L(at(pts, z), o);
    L(at(ring(0, 2.6, 1.55, 72), 0), { b: 1 });                                     // the nose
    for (const sg of [-1, 1]) {                                                      // two windscreen panes, an eye in each
      L(at(spline([[sg * .14, 2.86], [sg * 1.1, 2.86], [sg * 1.02, 3.5], [sg * .7, 3.84], [sg * .14, 3.9]], true, 5), -.02), { b: .55 });
      eye(D0(-.04), sg * .6, 3.3, .37, st, -sg);
    }
    mouth(D0(-.03), 0, 1.92, .58, st.mouth || 0, Beam.tk, .14);
    for (const sg of [-1, 1]) {                                                      // wings, level with his belly
      const fl = sg < 0 ? (st.flexL || 0) : (st.flexR || 0), up = [], lo = [];
      for (let i = 0; i <= 14; i++) { const u = i / 14, x = sg * (1.42 + 6 * u), bend = fl * u * u; up.push([x, 2.18 + .28 * u + bend, 1.2]); lo.push([x, 1.8 + .48 * u + bend, 1.2]); }
      const tipY = 2.37 + fl, tip = ring(sg * 7.42, tipY, .1, 6, sg > 0 ? Math.PI / 2 : Math.PI / 2, sg > 0 ? -Math.PI / 2 : Math.PI * 1.5).map(([x, y]) => [x, y, 1.2]);
      L(up.concat(tip, lo.reverse()), { b: .9 });
      const ex = sg * 3.4;                                                           // engine + propeller
      L(at(ring(ex, 1.7, .5, 30), .3), { b: .85 }); L(at(ring(ex, 1.7, .2, 16), .3), { b: .6 });
      L(at(ring(ex, 1.7, 1.28, 48), -.15), { b: .14, dots: false });
      for (let i = 0; i < 3; i++) {
        const a = (st.spin || 0) * sg + i * TAU / 3, ca = Math.cos(a), sa = Math.sin(a), R = 1.28;
        L([[ex, 1.7, -.15], [ex + ca * R * .35 - sa * .09, 1.7 + sa * R * .35 + ca * .09, -.15], [ex + ca * R, 1.7 + sa * R, -.15], [ex + ca * R * .35 + sa * .05, 1.7 + sa * R * .35 - ca * .05, -.15]], { b: .8, closed: true });
      }
    }
    L([[-.13, 4.05, 8], [-.07, 6.25, 8.6], [.07, 6.25, 8.6], [.13, 4.05, 8]], { b: .6 });                 // tail fin, far behind
    for (const sg of [-1, 1]) L([[sg * 1.25, 4.15, 8.4], [sg * 3.3, 4.3, 8.9], [sg * 3.3, 4.12, 8.9], [sg * 1.25, 3.95, 8.4]], { b: .5 });
    for (const sg of [-1, 1]) {                                                      // car tyres, nose-on
      const x = sg * 1.02, sq = st.squash || 0;
      L(at(spline([[x - .16, .05], [x + .16, .05], [x + .17, .38], [x + .16, .72 - sq], [x - .16, .72 - sq], [x - .17, .38]], true, 4), .9), { ground: true, b: .9 });
      L([[x, .72, .9], [sg * .78, 1.25, .9]], { b: .55 });
    }
  }

  // ---- the plane in profile, facing +x; z toward us is negative (near side) ----
  const PROF = spline([[5.2, 2.45], [5.0, 3.3], [4.3, 3.95], [3.1, 4.22], [0, 4.27], [-2.8, 4.22], [-4.4, 4.36], [-5.45, 4.62], [-5.65, 4.4], [-4.6, 3.3], [-3.0, 1.6], [-1, 1.1], [2.5, 1.05], [4.2, 1.3], [4.95, 1.85]], true, 7);
  const SCREEN = spline([[3.0, 3.22], [4.82, 3.08], [4.45, 3.86], [3.2, 4.08]], true, 5);
  function planeSide(sp, st) {
    const L = sp.line, Z = -.7, D = (pts, o) => L(at(pts, Z), o);
    D(PROF, { b: 1 });
    L(at([[-3.45, 4.24], [-4.95, 6.55], [-5.95, 6.62], [-5.8, 4.5]], -.1), { b: .85 });                  // fin
    L([[-4.6, 4.36, -.4], [-5.45, 4.5, -3.0], [-6.15, 4.5, -3.0], [-5.75, 4.42, -.4]], { b: .7 });           // near tailplane
    D([[-4.7, 2.72], [-1, 2.66], [3.5, 2.66], [5.1, 2.62]], { b: .45, dots: false });                       // cheat line
    for (let x = -3.3; x < 2.6; x += .78) D(ring(x, 3.35, .17, 12), { b: .5, dots: false });                // portholes
    D(SCREEN, { b: .6 });
    eye(D, 3.62, 3.58, .36, st, 1); eye(D, 4.32, 3.48, .3, st, -1);
    mouth(D, 4.72, 1.9, .34, st.mouth || 0, Beam.tk, .12);
    const fl = (st.flex || 0) + 1.15, wz = -1.4, tz = -7.7;                                                         // the near wing, over the passing lane
    L([[1.75, 1.95, wz], [.45, 2.12 + fl, tz], [.1, 2.2 + fl, tz - .12], [-.6, 2.14 + fl, tz], [-1.3, 1.95, wz]], { b: .9 });
    L([[1.75, 1.72, wz], [.45, 2.04 + fl, tz], [-.6, 2.06 + fl, tz], [-1.3, 1.72, wz]], { b: .45 });
    for (const u of [.45, .8]) L([[lerp(1.75, .45, u), lerp(1.95, 2.12 + fl, u), lerp(wz, tz, u)], [lerp(-1.3, -.6, u), lerp(1.95, 2.14 + fl, u), lerp(wz, tz, u)]], { b: .35, dots: false });
    const ez = -3.3, ey = 1.75 + fl * .38;                                                                // engine + prop on the near wing
    L(at(spline([[2.3, ey + .1], [1.8, ey + .45], [-.2, ey + .42], [-1.1, ey + .1], [-.2, ey - .4], [1.8, ey - .45]], true, 5), ez), { b: .85 });
    L(ringYZ(2.3, ey, ez, .45, 24), { b: .6 });
    L(ringYZ(2.55, ey, ez, 1.2, 40), { b: .13, dots: false });
    for (let i = 0; i < 3; i++) { const a = (st.spin || 0) + i * TAU / 3; L([[2.55, ey, ez], [2.55, ey + Math.sin(a) * 1.2, ez + Math.cos(a) * 1.2]], { b: .8, w: 3.2 }); }
    for (const tx of [3.2, -2.2]) {                                                                       // car tyres with whitewalls and turning spokes
      const r = .44, cy = r, tz2 = -1.25;
      L(at(ring(tx, cy, r, 32), tz2), { ground: true, b: 1 }); L(at(ring(tx, cy, r * .66, 24), tz2), { ground: true, b: .55, dots: false });
      for (let i = 0; i < 5; i++) { const a = -(st.roll || 0) + i * TAU / 5; L([[tx, cy, tz2], [tx + Math.cos(a) * r * .62, cy + Math.sin(a) * r * .62, tz2]], { ground: true, b: .55, dots: false }); }
      L([[tx, cy + r * .66, tz2], [tx * .95, 1.2, -1.0]], { b: .5 });
    }
  }

  // ---- a 1950s car, wireframe; local x forward, y up, z across (+-.85) ----
  function car(cam, org, heading, o = {}) {
    const ext = o.ext || 0, h = 2.3 + ext / 2, sp = space(cam, org, { heading }), L = sp.line, b = o.b ?? .8;
    const prof = [[h, .32], [h + .06, .72], [h - .55, .9], [1.0 + ext * .5, .95], [.45 + ext * .5, 1.42], [-.95 - ext * .5, 1.45], [-1.5 - ext * .5, 1.0], [-h + .25, 1.0], [-h - .05, 1.32], [-h - .1, .62], [-h, .32]];
    for (const z of [-.85, .85]) L(at(prof, z), { b });
    for (const i of [0, 1, 2, 4, 5, 7, 8, 10]) L([[prof[i][0], prof[i][1], -.85], [prof[i][0], prof[i][1], .85]], { b: b * .6 });
    for (let k = 0; k <= Math.round(ext / 1.6); k++) { const x = -.95 - ext * .5 + (k + 1) * (1.4 + ext) / (Math.round(ext / 1.6) + 2); L([[x, 1.0, -.86], [x, 1.43, -.86]], { b: b * .6 }); }
    for (const wx of [h - .75, -h + .8]) for (const z of [-.86, .86]) {
      L(at(ring(wx, .34, .34, 20), z), { b, ground: true });
      for (let i = 0; i < 3; i++) { const a = (o.spin || 0) + i * TAU / 3; L([[wx, .34, z], [wx + Math.cos(a) * .3, .34 + Math.sin(a) * .3, z]], { b: b * .6, dots: false }); }
    }
    const dep = cam.toCam([org[0], .6, org[2]])[2];
    for (const z of [-.55, .55]) { const p = sp.pt([h + .06, .62, z]); if (p) Beam.dot(p[0], p[1], clamp(cam.f * .1 / Math.max(.5, dep), 2, 14), 1); }
  }

  // ---- shared bits ----
  function mountains(cam, z, x0, x1, step, hmax, seed, b) {
    const pts = []; for (let x = x0; x <= x1; x += step) pts.push([x, hmax * (.25 + .75 * noise1(x / (step * 3.2), seed)) * (.6 + .4 * noise1(x / (step * 11), seed + 3)), z]);
    P3(cam, pts, { b, dots: true });
  }
  function lissSun(x, y, r, t, b = .5) { const ph = t * .9; P(Array.from({ length: 91 }, (_, i) => { const u = i / 90 * TAU; return [x + r * Math.sin(u + ph), y + r * Math.sin(u)]; }), { b, dots: false }); }
  function sag(a, b, n, s) { return Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - s * 4 * u * (1 - u), lerp(a[2], b[2], u)]; }); }
  function pole(cam, x, z, tilt = 0, fade = 1) {
    const top = [x + tilt, 7.2, z];
    P3(cam, [[x, 0, z], top], { b: .6 * fade });
    P3(cam, [[x + tilt - .9, 6.7, z], [x + tilt + .9, 6.7, z]], { b: .6 * fade });
    return [[x + tilt - .8, 6.7, z], [x + tilt + .8, 6.7, z]];
  }

  // ===== 71.00 cruise: nose-on, the highway behind him =====
  const ZA = 40;
  function polesA(t) {
    const out = [], bs = FEAT.beats;
    for (let j = 0; j < bs.length; j++) { const z = ZA + V * (bs[j] - t); if (z > -6 && z < 260) out.push({ tp: bs[j], z, side: j % 2 ? 1 : -1 }); }
    return out;
  }
  function boing(u) { return u < 0 || u > 1.4 ? 0 : .85 * Math.exp(-4.5 * u) * Math.cos(15 * u); }
  function worldA(cam, t) {
    mountains(cam, 560, -900, 900, 38, 95, 11, .5);
    mountains(cam, 400, -700, 700, 30, 48, 23, .35);
    for (const x of [-3.7, 3.7]) P3(cam, [[x, 0, 2], [x, 0, 520]], { b: .7, dots: false });
    for (const x of [-4.5, 4.5]) P3(cam, [[x, 0, 2], [x, 0, 520]], { b: .3, dots: false });
    const bp = .45 + .75 * beatPulse(t, 5);
    for (let i = 0; i < 46; i++) { const z = wrap(i * 9 - V * t, 46 * 9) + 1; P3(cam, [[0, 0, z], [0, 0, z + 3]], { b: bp, w: 2.8 }); }
    for (let i = 0; i < 7; i++) { const z = wrap(i * 16 - V * t, 7 * 16) + 2; for (const sg of [-1, 1]) P3(cam, [[sg * 9, 0, z], [sg * 26, 0, z]], { b: .14 * (1 - z / 112), dots: false }); }
    const ps = polesA(t), tops = { '-1': [], '1': [] };
    for (const p of ps) { const u = t - p.tp, tilt = p.side * .5 * (u > 0 ? Math.exp(-4 * u) * Math.sin(14 * u) : 0); tops[p.side].push(pole(cam, p.side * 6.6, p.z, tilt, clamp(1.3 - p.z / 130, 0, 1))); }
    for (const sg of ['-1', '1']) { const T = tops[sg]; for (let i = 1; i < T.length; i++) for (const k of [0, 1]) P3(cam, sag(T[i - 1][k], T[i][k], 8, .8), { b: .3 * clamp(1.3 - T[i][k][2] / 130, 0, 1), dots: false }); }
    return ps;
  }
  function stA(t, ps) {
    let flexL = 0, flexR = 0, roll = 0, lookX = 0, last = null;
    for (const p of ps) { const u = t - p.tp, f = boing(u); if (p.side < 0) flexL += f; else flexR += f; roll += p.side * .045 * (u > 0 && u < 1.4 ? Math.exp(-5 * u) * Math.cos(9 * u) : 0); if (u >= 0 && u < .6) last = p; }
    if (last) lookX = last.side * .8 * Math.exp(-3 * (t - last.tp));
    const blink = [73.55, 75.9].some((b) => t > b && t < b + .14);
    return { flexL, flexR, roll, bob: .05 * beatPulse(t, 8), squash: .06 * beatPulse(t, 8), spin: t * 38, look: [lookX, -.15], lid: blink ? 1 : .12, mouth: clamp(F('voc', t, 1) * 1.9 - .05), worry: 0 };
  }
  function sparks(sp, ps, t) {
    for (const p of ps) {
      const u = t - p.tp; if (u < 0 || u > .35) continue;
      const q = sp.pt([p.side * 7.4, 2.4, 1.2]); if (!q) continue;
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + .3, r0 = 12 + u * 160, r1 = r0 + 26 * (1 - u / .35); P([[q[0] + Math.cos(a) * r0, q[1] + Math.sin(a) * r0], [q[0] + Math.cos(a) * r1, q[1] + Math.sin(a) * r1]], { b: 1 - u / .35 }); }
    }
  }
  function cruise(t) {
    const h = kf(t, [[71, 13], [74.7, 3.9], [77.22, 3.4]]), d = kf(t, [[71, 31], [74.7, 16.5], [77.22, 15.2]]);
    const cam = Beam.cam({ pos: [.5 * snoise(t * .35, 2), h, ZA - d], pitch: Math.atan2(h - 2.3, d), f: 1100, cy: 600 });
    if (t < 74) lissSun(1440, 250, 62, t, .45 * (1 - smooth(inv(73.2, 74, t))));
    const ps = worldA(cam, t), st = stA(t, ps), sp = space(cam, [0, 0, ZA], { roll: st.roll, bob: st.bob });
    planeFront(sp, st); sparks(sp, ps, t);
  }

  // ===== 77.22 strange: close on the face; the display loses sync and collapses into a Lissajous =====
  function liss(sA, tk) {
    const u = sA / 3400 * TAU, fl = smooth(inv(78.88, 79.05, tk)), ph = tk * 3.1;
    const a = 3, b = 2 + smooth(inv(78.55, 78.85, tk));
    return [960 + lerp(540, 840, fl) * Math.sin(a * u + ph), 560 + 380 * (1 - fl) * Math.sin(b * u)];
  }
  function strange(t) {
    const d = kf(t, [[77.22, 8.6], [78.38, 7.2]], ease.out), h = 3.15;
    const cam = Beam.cam({ pos: [.15 * snoise(t * 2, 5), h, ZA - d], pitch: Math.atan2(h - 2.85, d), f: 1100, cy: 560 });
    const wobble = smooth(inv(77.5, 78.38, t));
    Beam.jit = 1 + 3 * wobble * (1 - .8 * smooth(inv(78.4, 78.75, t))); Beam.ph = smooth(inv(78.3, 78.75, t));
    Beam.morph = ease.inOut(inv(78.38, 78.78, t)); Beam.liss = liss;
    const ps = worldA(cam, t), st = stA(t, ps);
    st.look = [snoise(t * 4.5, 7) * .9, snoise(t * 4.5, 9) * .5 + .1]; st.pupil = lerp(1, .55, wobble); st.worry = lerp(.3, 1.2, wobble); st.lid = t > 77.9 && t < 78.0 ? 1 : 0; st.browUp = wobble;
    planeFront(space(cam, [0, 0, ZA], { roll: st.roll + .03 * Math.sin(t * 9) * wobble, bob: st.bob }), st);
    fx({ sync: .06 * wobble + .75 * smooth(inv(78.36, 78.46, t)) * (1 - smooth(inv(78.62, 78.78, t))), hum: 1 + 5 * wobble, roll: .06 * Math.sin((t - 78.38) * 20) * smooth(inv(78.36, 78.5, t)) * (1 - smooth(inv(78.8, 79, t))), grat: lerp(.16, .3, smooth(inv(78.6, 79, t))) });
  }

  // ===== 79.05 nuh: the trace; three blips on the beats are his face =====
  function nuh(t) {
    const back = smooth(inv(80.5, 80.86, t));
    Beam.ph = 1 - back;
    const y0 = 600, x0 = 130, x1 = 1790, XS = [520, 960, 1400], HW = 150;
    const H_ = BLIPS.map((b) => 235 * ease.back(inv(b, b + .17, t)) * (1 - back) * (1 + .06 * beatPulse(t, 9)));
    const yAt = (x) => {
      let y = y0 + 7 * Math.sin(x * .05 + t * 31) * (F('mid', t) + .1) + 16 * F('voc', t, 1) * Math.sin(x * .11 - t * 44) * Math.sin(x * .006);
      for (let i = 0; i < 3; i++) { const u = (x - XS[i]) / HW; if (Math.abs(u) < 1) y -= H_[i] * Math.pow(1 - u * u, .42); }
      return y;
    };
    const tr = []; for (let x = x0; x <= x1; x += 6) tr.push([x, yAt(x)]);
    P(tr, { b: 1 });
    const sw = x0 + (x1 - x0) * wrap((t - BLIPS[0]) / .567, 1); Beam.dot(sw, yAt(sw), 5, 1);       // the sweep
    for (let i = 0; i < 3; i++) {
      const hh = H_[i]; if (hh < 25) continue;
      const k = hh / 235, ex = 50 * k, ey = y0 - hh * .55, r = 30 * k;
      const D = (pts, o) => P(pts.map(([x, y]) => [XS[i] + x, -y]), o);       // face-local, y up
      const st = { look: [i === 2 ? -.4 : .5 * Math.sin(t * 3 + i), .2], lid: (t > BLIPS[i] + 1.0 && t < BLIPS[i] + 1.12) ? 1 : .05, pupil: .9, worry: .4 };
      eye(D, -ex, -ey, r, st, 1); eye(D, ex, -ey, r, st, -1);
      const op = clamp(hit(t, BLIPS[i], 4) * 1.1 + (i === 2 ? .2 * F('voc', t, 1) : 0));
      mouth(D, 0, -(y0 - hh * .22), 26 * k, op, t, .2);
    }
    fx({ grat: .3, hum: 1.5, sync: .25 * hit(t, BLIPS[0] - .06, 9) });
  }

  // ===== 80.88 lane: side tracking shot, the roped-off passing lane nearest us =====
  const CARS1 = [81.3, 82.1, 82.95, 83.8];
  function worldB1(cam, t, cx) {
    mountains(cam, 520, cx - 600, cx + 600, 34, 80, 31, .45);
    const xs = (x0, sp, n, off = 0) => Array.from({ length: n }, (_, i) => wrap(i * sp - V * t + off, n * sp) - n * sp / 2 + cx);
    const tops = xs(0, 2 * .567 * V, 7, 4).sort((a, b) => a - b).map((x) => pole(cam, x, 11));
    for (let i = 1; i < tops.length; i++) for (const k of [0, 1]) if (tops[i][k][0] - tops[i - 1][k][0] < 20) P3(cam, sag(tops[i - 1][k], tops[i][k], 8, .7), { b: .3, dots: false });
    const X0 = cx - 70, X1 = cx + 70;
    P3(cam, [[X0, 0, 3.3], [X1, 0, 3.3]], { b: .35, dots: false });
    P3(cam, [[X0, 0, 2.6], [X1, 0, 2.6]], { b: .7, dots: false });
    for (const z of [-1.05, -4.6]) { P3(cam, [[X0, 0, z], [X1, 0, z]], { b: .75, dots: false }); P3(cam, [[X0, 0, z + (z < -2 ? .15 : -.15)], [X1, 0, z + (z < -2 ? .15 : -.15)]], { b: .4, dots: false }); }
    const bp = .45 + .75 * beatPulse(t, 5);
    for (const x of xs(0, 1.1, 50)) { P3(cam, [[x, 0, -4.45], [x + .3, 0, -4.15]], { b: .3, dots: false }); P3(cam, [[x, 0, -1.2], [x + .3, 0, -1.5]], { b: .3, dots: false }); }
    for (const x of xs(0, 6, 18, 2)) P3(cam, [[x - .7, 0, -3.6], [x, 0, -2.85], [x - .7, 0, -2.1]], { b: bp * .8 });   // chevrons, pulsing on the beat
    const st = xs(0, 3.2, 24, 1).sort((a, b) => a - b);                                                             // brass stanchions + the sagging rope
    for (let i = 0; i < st.length; i++) {
      const x = st[i];
      P3(cam, [[x, 0, -5.3], [x, 1.0, -5.3]], { b: .75 }); P3(cam, ringYZ(x, 1.08, -5.3, .08, 10).map(([a, y, z]) => [a + (y - 1.08) * 0, y, z]), { b: .9, dots: false });
      if (i && x - st[i - 1] < 4) P3(cam, sag([st[i - 1], .95, -5.3], [x, .95, -5.3], 10, .28), { b: .65, dots: false });
    }
  }
  function lane(t) {
    const cx = 2.2 + .6 * Math.sin((t - LINE2) * .5);
    const cam = Beam.cam({ pos: [cx, 6, -15.5], pitch: .3, f: 1150, cy: 690 });
    worldB1(cam, t, cx);
    let near = null;
    for (const tp of CARS1) {
      const x = 22 * (t - tp); if (x < -45 || x > 45) continue;
      car(cam, [x, 0, -3.25], 0, { spin: -(V + 22) * t / .34, b: .85 });
      for (const y of [.5, .85, 1.2]) P3(cam, [[x - 2.6, y, -4.1], [x - 2.6 - 4 * (1 - Math.abs(y - .85)), y, -4.1]], { b: .35 });
      if (!near || Math.abs(x) < Math.abs(near)) near = x;
    }
    const look = near !== null && Math.abs(near) < 14 ? [clamp(near / 7, -1, 1), -.7] : [.6, -.2];
    const st = { spin: t * 38, roll: V * t / .44, look, lid: .25, worry: -.5, mouth: clamp(F('voc', t, 1) * 1.9 - .05), flex: .06 * Math.sin(t * 7) + .12 * beatPulse(t, 6) };
    planeSide(space(cam, [0, 0, .8], { bob: .05 * beatPulse(t, 8) }), st);
    fx({ roll: .35 * (1 - ease.out(inv(LINE2, 81.15, t))), sync: .3 * (1 - smooth(inv(LINE2, 81.05, t))) });
  }

  // ===== 84.24 sick: worm's-eye from the shoulder, cars rushing at us under his wing =====
  const ZB = 11;
  const CARS2 = [[84.7, 20], [85.45, 22], [86.15, 20], [88.15, 13, 3.8], [89.7, 21]];           // [time under the wing, closing speed, limo stretch]
  function worldB2(cam, t) {
    mountains(cam, 560, -900, 900, 40, 90, 47, .45);
    for (const x of [-1.8, 5.4]) P3(cam, [[x, 0, .5], [x, 0, 520]], { b: .7, dots: false });
    P3(cam, [[5.25, 0, .5], [5.25, 0, 520]], { b: .4, dots: false });
    P3(cam, [[1.95, 0, .5], [1.95, 0, 520]], { b: .35, dots: false });
    const bp = .45 + .75 * beatPulse(t, 5);
    for (let i = 0; i < 40; i++) { const z = wrap(i * 9 - V * t, 360) + .5; P3(cam, [[1.8, 0, z], [1.8, 0, z + 3]], { b: bp, w: 2.6 }); }
    for (let i = 0; i < 30; i++) { const z = wrap(i * 6 - V * t + 2, 180) + .5; P3(cam, [[2.9, 0, z + .7], [3.6, 0, z], [4.3, 0, z + .7]], { b: bp * .75 }); }
    for (let i = 0; i < 60; i++) { const z = wrap(i * 1.1 - V * t, 66) + .5; P3(cam, [[5.1, 0, z], [5.1 - .3, 0, z + .3]], { b: .3, dots: false }); }
    let prev = null;
    for (let i = 0; i < 16; i++) {
      const z = wrap(i * 3.2 - V * t, 51.2) + 4;
      P3(cam, [[5.95, 0, z], [5.95, 1.0, z]], { b: .75 }); P3(cam, ring(0, 0, .08, 10).map(([a, b]) => [5.95 + a, 1.08 + b, z]), { b: .9, dots: false });
      if (prev !== null && Math.abs(prev - z) < 4) P3(cam, sag([5.95, .95, Math.min(prev, z)], [5.95, .95, Math.max(prev, z)], 10, .28), { b: .65, dots: false });
      prev = z;
    }
  }
  function sick(t) {
    const push = ease.inOut(inv(LOW, 88.6, t));
    const pos = [lerp(5.3, 4.9, push), lerp(.8, .95, push), lerp(1.6, 3.4, push)], tgt = [.1, lerp(2.7, 2.9, push), ZB];
    const dx = tgt[0] - pos[0], dy = tgt[1] - pos[1], dz = tgt[2] - pos[2];
    const cam = Beam.cam({ pos, yaw: Math.atan2(dx, dz), pitch: -Math.atan2(dy, Math.hypot(dx, dz)), f: 1000, cy: 560, cx: 960 });
    worldB2(cam, t);
    let near = null;
    for (const [tp, v, ext] of CARS2) {
      const z = ZB + v * (tp - t); if (z < -8 || z > 300) continue;
      car(cam, [3.4, 0, z], Math.PI / 2, { ext: ext || 0, spin: -(v + V) * t / .34, b: .85 });
      if (z > 0 && (!near || Math.abs(z - ZB) < Math.abs(near.z - ZB))) near = { z, ext };
    }
    let look = [.75, -.5], lid = .3, worry = -.4, browUp = 0;
    if (near && near.z > ZB - 6 && near.z < ZB + 30) look = [clamp(.5 + (ZB - near.z) / 12, -.2, 1), -.55];
    const u = inv(86.5, 87.35, t);
    if (u > 0 && u < 1) { const th = lerp(-.4, Math.PI + .4, ease.inOut(u)); look = [Math.cos(th), Math.sin(th) * 1.05]; lid = .06; worry = -.9; browUp = .6; }
    if (t >= 87.35 && t < 89.25) { lid = .38; worry = -1.1; }
    if (t >= 89.25) { const k = smooth(inv(89.25, 89.8, t)); look = [lerp(.6, .2, k), lerp(-.5, -.2, k)]; lid = lerp(.38, .58, k); worry = lerp(-1.1, .5, k); }
    const st = { spin: t * 38, look, lid, worry, browUp, mouth: clamp(F('voc', t, 1) * 1.9 - .05), bob: 0, flexL: 0, flexR: .08 * Math.sin(t * 6.5), squash: .05 * beatPulse(t, 8) };
    const sp = space(cam, [0, 0, ZB], { bob: .05 * beatPulse(t, 8), roll: .02 * Math.sin(t * 1.7) });
    planeFront(sp, st);
    const m = sp.pt([0, 1.92, -.05]);                                                                        // the sigh, a sine wave
    if (m) for (let q = 0; q < 2; q++) {
      const u0 = (t - 89.3 - q * .25) / 1.4; if (u0 <= 0 || u0 >= 1) continue;
      const pts = []; for (let i = 0; i <= 50; i++) { const v = i / 50, d = u0 * 520 * v; pts.push([m[0] + d * .9, m[1] + 10 - d * .55 + 16 * (1 - u0) * Math.sin(v * 16 - t * 12)]); }
      P(pts, { b: .85 * (1 - u0), dots: false });
    }
  }

  chapter('airplane', 71.0, 91.0, [[71.0, Beam.shot(cruise)], [77.22, Beam.shot(strange)], [NUH, Beam.shot(nuh)], [LINE2, Beam.shot(lane)], [LOW, Beam.shot(sick)]]);
})();
