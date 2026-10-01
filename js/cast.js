// The cast kit for Clap Hands: the people the song names, drawn as one cast.
// Toulouse-Lautrec cabaret caricature in Art Nouveau line: long bodies, small heads with a big nose and
// chin, big hats, flat palette colour, heavy umber contours. Load after js/world.js. Read the "## Cast"
// section of ANIMATION_GUIDE.md first.
//
// One rig for everyone: person(t, x, y, sc, opts) poses a profile skeleton, draws it, and returns its
// joints. Everything is a pure function of its arguments (no state, no Math.random()).
//   (x, y)  standing poses: the ground point under the feet. Seated poses: the seat surface under the hips.
//   sc      standing height in px, soles to crown, hat not included (400 to 900 for a hero, 150 far off).
// Poses are driven by a phase `ph` in cycles (one cycle = one step pair, one stroke, one shovelful...).
// beatPhase(t) gives a phase that is locked to the song's beat grid: an integer on every beat.
(() => {
  const UMB = C.umber, HAIR = '#5a3e2a', SHOE = '#3e2b22', COAL = '#2e2a38', STEEL = '#8d9a92';
  const fr = (x) => x - Math.floor(x);
  const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k];
  const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const len = (p) => Math.hypot(p[0], p[1]);
  const nrm = (p) => { const l = len(p) || 1; return [p[0] / l, p[1] / l]; };
  const mid = (p, q, k = .5) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  function shade(c, k) { const n = parseInt(c.slice(1), 16), m = (v) => Math.round(clamp(v * k, 0, 255)); return `rgb(${m(n >> 16 & 255)},${m(n >> 8 & 255)},${m(n & 255)})`; }
  // closed (or open) Catmull-Rom through points: the Nouveau curve for every silhouette
  function spl(pts, closed = true, n = 4) {
    const o = [], L = pts.length, g = (i) => closed ? pts[(i % L + L) % L] : pts[clamp(i, 0, L - 1)];
    for (let i = 0; i < (closed ? L : L - 1); i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u; o.push([0, 1].map((j) => .5 * (2 * p1[j] + (p2[j] - p0[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u3))); }
    }
    if (!closed) o.push(pts[L - 1]);
    return o;
  }
  // an outlined stroke through several segments of different widths: all the umber first, then the colour,
  // so joints never show a seam
  function limbs(g, segs, col, lw) {
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const pass of [0, 1]) for (const [pts, w] of segs) { g.lineWidth = pass ? Math.max(2, w - lw * 1.1) : w + lw * .5; g.strokeStyle = pass ? col : UMB; P(g, pts); g.stroke(); }
  }
  const ring = (g, x, y, r, col, w, lw) => limbs(g, [[circle(x, y, r, 40).concat([[x + r, y]]), w]], col, lw);

  // the song's beat grid as a phase: integer on each beat, so `beatPhase(t) / 2` is one cycle every two beats
  function beatPhase(t) {
    const i = lastBeat(t); if (i < 0) return t / .5;
    const b0 = FEAT.beats[i], b1 = FEAT.beats[i + 1] ?? b0 + .5; return i + clamp((t - b0) / (b1 - b0));
  }

  // ---------------- poses ----------------
  // A pose: { lean, head, legs: [[thigh, knee], [thigh, knee]], arms: [[shoulder, elbow], [..]], sit, rot, skirt }
  // index 0 = the NEAR limb (toward camera, drawn in front), 1 = the far one. Angles in radians from
  // straight down, positive = toward the way the figure faces; knee bends the shin back, elbow bends the
  // forearm forward. Arm angles are world angles (pi = straight up). lean tips the torso forward,
  // head tips the head forward (negative looks up). rot rotates the whole figure on screen about (x, y).
  const mixA = (a, b, k) => { if (typeof a === 'number') return lerp(a, b ?? a, k); if (Array.isArray(a)) return a.map((v, i) => mixA(v, b?.[i], k)); if (a && typeof a === 'object') { const o = {}; for (const key of new Set([...Object.keys(a), ...Object.keys(b || {})])) o[key] = a[key] === undefined ? mixA(typeof b[key] === 'number' ? 0 : b[key], b[key], k) : mixA(a[key], b?.[key], k); return o; } return a ?? b; };
  function cycle(p, keys, e = ease.inOut) { // keys [[p, pose], ...] covering 0..1, looping back to keys[0]
    p = fr(p); for (let i = 0; i < keys.length; i++) { const [a, A] = keys[i], [b, B] = i + 1 < keys.length ? keys[i + 1] : [1, keys[0][1]]; if (p >= a && p < b) return mixA(A, B, e((p - a) / (b - a))); }
    return keys[0][1];
  }
  const POSES = {
    stand(p, o) { const w = Math.sin(p * TAU); return { lean: .03 + .012 * w, head: .02 - .01 * w, legs: [[.07, .04], [-.05, .03]], arms: [[.1, .25 + .04 * w], [-.06, .2]] }; },
    walk(p, o) {
      const sd = o.stride ?? 1, u = p * TAU, A = .36 * sd, sw = o.swagger || 0;
      const leg = (v) => [A * Math.sin(v), .08 + .8 * sd * Math.pow(Math.max(0, Math.cos(v)), 2)];
      const arm = (v) => { const a = -(.3 + .25 * sw) * sd * Math.sin(v); return [a, .2 + .35 * Math.max(0, a)]; };
      return { lean: .07 - .1 * sw + (o.lean || 0), head: .02 * Math.sin(2 * u) - (o.lean || 0) * .5 + .06 * sw, legs: [leg(u), leg(u + Math.PI)], arms: [arm(u), arm(u + Math.PI)] };
    },
    // the lame walk: the near leg stays stiff, the body dips onto the cane each time that leg takes the weight
    limp(p, o) {
      const u = p * TAU, dip = Math.max(0, -Math.sin(u));
      return { lean: .12 + .1 * dip, head: .02 + .06 * dip, legs: [[.2 * Math.sin(u), .05], [.32 * Math.sin(u + Math.PI), .1 + .7 * Math.pow(Math.max(0, Math.cos(u + Math.PI)), 2)]],
        arms: [[.5 + .14 * Math.sin(u), .12], [.75, .3]] };
    },
    // holding a strap overhead and rocking with the car; amp is the screen rotation (radians)
    sway(p, o) {
      const amp = o.amp ?? .12, w = Math.sin(p * TAU), rot = amp * w, fx = o.facing ?? 1;
      return { rot, lean: -rot * fx * .5, head: -rot * fx * .8 + .05 * Math.sin(p * TAU * 2 + 1), legs: [[.17, .05], [-.15, .05]],
        arms: [[.3 + .35 * Math.abs(w) + (o.flail ? 1.6 + .6 * Math.sin(p * TAU * 2) : 0), o.flail ? .5 : 1.45], [Math.PI - .1 - rot * fx * .6, -.12]] };
    },
    sit(p, o) { const w = Math.sin(p * TAU); return { sit: 1, lean: .04 + .01 * w, head: .04, legs: [[1.45, 1.42], [1.38, 1.3]], arms: [[.55, .95], [.45, 1.0]] }; },
    // hard luck: folded forward on the seat, head hung, hands dangling between the knees
    slump(p, o) { const w = Math.sin(p * TAU); return { sit: 1, lean: .55 + .03 * w, head: .45 + .04 * w, legs: [[1.2, 1.55], [1.5, 1.3]], arms: [[.6, .2], [.5, .25]] }; },
    // leaning out over a sill, looking up into the rain, near arm up with the bottle
    leanOut(p, o) { const w = Math.sin(p * TAU); return { sit: 1, lean: (o.lean ?? .5) + .03 * w, head: -1.0 - .05 * w, legs: [[.1, 0], [-.1, 0]], arms: [[2.25 + .08 * w, -.2], [1.25, 1.35]] }; },
    // one shovelful per cycle: 0 bite into the coal, .4 lift, .62 throw (the coal leaves the blade), back
    shovel(p, o) {
      return cycle(p, [
        [0, { lean: .85, head: -.6, legs: [[.7, 1.05], [-.4, .15]], arms: [[.35, .1], [-.45, 1.5]] }],
        [.38, { lean: .45, head: -.3, legs: [[.45, .55], [-.3, .1]], arms: [[.85, .15], [-.15, 1.4]] }],
        [.62, { lean: -.1, head: -.05, legs: [[.25, .15], [-.25, .1]], arms: [[1.7, .05], [.7, 1.0]] }],
        [.8, { lean: .5, head: -.35, legs: [[.5, .6], [-.32, .12]], arms: [[.6, .15], [-.3, 1.45]] }],
      ]);
    },
    // one stroke per cycle: 0 the catch (reach forward), .4 the finish (pulled back), recover slowly
    row(p, o) {
      const q = fr(p), k = q < .4 ? ease.out(q / .4) : 1 - ease.inOut((q - .4) / .6);
      return { sit: 1, lean: lerp(.6, -.32, k), head: lerp(-.45, .25, k), legs: [[lerp(1.05, 1.35, k), lerp(1.3, .55, k)], [lerp(1.0, 1.3, k), lerp(1.25, .5, k)]],
        arms: [[lerp(1.55, .55, k), lerp(.05, 1.75, k)], [lerp(1.5, .5, k), lerp(.08, 1.7, k)]] };
    },
    // bass drum: the beater lands on the drum head at every integer phase (pass beatPhase(t))
    drum(p, o) {
      const legs = POSES.walk(p / 2, { stride: o.march ?? .35 }).legs;
      const A = cycle(p, [[0, { a: [1.2, .35] }], [.12, { a: [1.3, .55] }], [.6, { a: [2.35, 1.25] }]], ease.inOut);
      return { lean: -.06, head: -.04 + .04 * Math.cos(p * TAU), legs, arms: [A.a, [1.0, .9]] };
    },
    tuba(p, o) { const legs = POSES.walk(p / 2, { stride: o.march ?? .35 }).legs, w = Math.cos(p * TAU); return { lean: -.1, head: -.18 + .05 * w, legs, arms: [[.95, 1.35], [.85, 1.45]] }; },
    tambourine(p, o) {
      const legs = POSES.walk(p / 2, { stride: o.march ?? .35 }).legs, q = fr(p);
      return { lean: .02, head: -.15, legs, arms: [[2.7 + .18 * Math.sin(p * TAU * 2), .25], [lerp(1.35, 1.7, Math.exp(-q * 8)), lerp(1.1, .6, Math.exp(-q * 8))]] };
    },
    wave(p, o) { const w = Math.sin(p * TAU); return { lean: -.02, head: -.12, legs: [[.06, .03], [-.05, .03]], arms: [[2.6 + .08 * w, .35 + .6 * w], [.08, .25]] }; },
    // toppling: k 0..1 tips the figure over backwards about its feet, arms flung up, a leg kicking
    topple(p, o) {
      const k = clamp(o.k ?? 0), fx = o.facing ?? 1, base = POSES[o.from || 'stand'](p, o), fl = Math.sin(p * TAU * 2);
      return mixA(base, { rot: -fx * 1.42 * ease.in(k), lean: -.25, head: .35, legs: [[.85, .3], [.1, .15]], arms: [[2.6 + .3 * fl, .5], [2.3 - .3 * fl, .7]] }, ease.out(clamp(k * 2.2)));
    },
  };

  // ---------------- styles ----------------
  // st.kind: 'coat' (long, to the knee), 'jacket' (to the hip), 'tails', 'dress', 'shirt'
  const BASE = { h: 1, legK: 1, armK: 1, torso: 1, w: 1, body: 1, belly: 1, bust: 1, hips: 1, head: 1, nose: 1, chin: 1,
    skin: '#d89c7e', hair: HAIR, kind: 'jacket', coat: C.dusk, trousers: C.umber, shoe: SHOE, sleeve: null,
    hat: null, hatC: '#3a2c38', bandC: C.ruby, hatTilt: 0, mouth: 'line', brow: 'flat', moustache: null, mC: HAIR, cheek: 1 };
  const CAST = {
    conductor: { kind: 'coat', coat: C.dusk, coatLen: .3, trousers: '#2c3550', hat: 'cap', hatC: C.dusk, bandC: C.gold, specs: 1, buttons: C.gold, collar: C.dusk, nose: 1.35, chin: 1.2, mouth: 'glum', moustache: 'brush', mC: '#8a8070', body: 1.05, belly: 1.1, h: 1 },
    tall: { kind: 'coat', coat: '#3c2c40', coatLen: .34, trousers: C.olive, hat: 'stovepipe', hatC: '#2f2634', bandC: C.olive, h: 1.1, legK: 1.08, body: .8, w: .85, nose: 1.7, chin: 1.35, brow: 'worry', mouth: 'o', head: .95 },
    stout: { kind: 'dress', coat: C.rose, trousers: C.rose, hat: 'feather', hatC: C.teal, bandC: C.gold, h: .9, body: 1.55, belly: 1.45, bust: 1.5, hips: 1.4, nose: 1.15, chin: .95, mouth: 'grin', hair: '#7a4a2a', bun: 1, head: 1.08, cheek: 1.6 },
    old: { kind: 'coat', coat: C.sage, coatLen: .22, trousers: '#6a5a3a', hat: 'bowler', hatC: '#5a3e26', bandC: C.umber, h: .78, legK: .9, body: 1.1, belly: 1.25, head: 1.15, nose: 1.9, chin: .9, moustache: 'walrus', mC: C.cream, brow: 'up', mouth: 'line', hair: C.cream },
    dandy: { kind: 'tails', coat: C.teal, trousers: C.parch, hat: 'boater', hatC: C.cream, bandC: C.ruby, waistcoat: C.gold, shirt: C.cream, tie: C.ruby, carnation: 1, h: 1.02, body: .82, w: .85, nose: 1.4, chin: 1.3, moustache: 'curl', mouth: 'grin', brow: 'up' },
    jacket: { kind: 'jacket', coat: C.gold, check: [C.ruby, C.teal], coatLen: .08, trousers: C.olive, hat: 'fedora', hatC: '#6a5636', bandC: C.umber, hatTilt: .12, nose: 1.5, noseC: C.rose, chin: 1.1, mouth: 'glum', brow: 'worry', body: 1.05, belly: 1.15, shirt: C.cream, tie: C.teal },
    leaner: { kind: 'shirt', coat: C.cream, stripes: C.rose, coatLen: .04, trousers: C.cream, hat: 'nightcap', hatC: C.cream, bandC: C.rose, nose: 1.6, chin: 1.2, mouth: 'grin', brow: 'up', body: .95 },
    sailor: { kind: 'shirt', coat: C.cream, stripes: C.dusk, coatLen: .03, trousers: C.dusk, hat: 'sailor', hatC: C.cream, bandC: C.dusk, scarf: C.ruby, nose: 1.3, mouth: 'grin' },
    millionaire: { kind: 'tails', coat: '#43304a', trousers: '#2f2a3a', hat: 'top', hatC: '#2f2634', bandC: C.ruby, waistcoat: C.gold, shirt: C.cream, tie: C.cream, monocle: 1, moustache: 'curl', mC: C.cream, hair: C.cream, h: 1, body: 1.25, belly: 1.6, legK: .95, w: .9, nose: 1.45, chin: .85, mouth: 'line', brow: 'up', watch: 1 },
    walker: { kind: 'jacket', coat: C.ruby, coatLen: -.01, trousers: '#41557a', denim: 1, pistol: 1, hat: 'flatcap', hatC: C.olive, bandC: C.olive, shirt: C.cream, h: 1.08, legK: 1.12, armK: 1.06, body: .78, w: .82, nose: 1.35, chin: 1.25, mouth: 'line', brow: 'flat' },
    knicker: { kind: 'coat', coat: C.ochre, coatLen: .36, trousers: '#3e3026', hat: 'bowler', hatC: C.olive, bandC: C.ruby, collarUp: C.ochre, back: 1, h: 1.02, body: .95, nose: 1.4, hair: '#4a3226' },
    drummer: { kind: 'jacket', coat: C.dusk, coatLen: .12, trousers: C.dusk, hat: 'cap', hatC: C.dusk, bandC: C.ruby, buttons: C.gold, collar: C.ruby, nose: 1.4, chin: 1.0, moustache: 'brush', mC: '#6a4a30', mouth: 'o', body: 1.1, belly: 1.25 },
    tubist: { kind: 'jacket', coat: C.dusk, coatLen: .12, trousers: C.dusk, hat: 'cap', hatC: C.dusk, bandC: C.ruby, buttons: C.gold, collar: C.ruby, nose: 1.2, chin: .9, mouth: 'o', cheek: 2, body: 1.3, belly: 1.5, h: .9, head: 1.12 },
    tambo: { kind: 'dress', coat: C.dusk, trousers: C.dusk, hat: 'bonnet', hatC: C.dusk, bandC: C.ruby, collar: C.ruby, nose: 1.3, chin: 1.25, mouth: 'grin', body: 1.2, belly: 1.15, bust: 1.2, hips: 1.25, h: .94, hair: '#8a7a6a', cheek: 1.5 },
    rower: { kind: 'shirt', coat: C.cream, coatLen: .04, trousers: C.ochre, hat: 'boater', hatC: C.cream, bandC: C.ruby, nose: 1.4, mouth: 'grin' },
  };

  // ---------------- the rig ----------------
  function rig(x, y, sc, A, st, fx) {
    const h = sc * st.h, tL = .28 * h * st.torso, th = .24 * h * st.legK, sh = .235 * h * st.legK, ua = .19 * h * st.armK, fa = .165 * h * st.armK;
    const D = (a, L) => [Math.sin(a) * fx * L, Math.cos(a) * L];
    const lean = A.lean || 0, U = [Math.sin(lean) * fx, -Math.cos(lean)], Fw = [Math.cos(lean) * fx, Math.sin(lean)];
    const pel = [0, 0];
    const legs = A.legs.map(([a, kb], i) => {
      const hip = add(pel, Fw, -i * .012 * h), knee = add(hip, D(a, th)), sa = a - kb, ank = add(knee, D(sa, sh)), td = D(sa + Math.PI / 2, 1);
      return { hip, knee, ank, toe: add(ank, td, .075 * h), heel: add(ank, td, -.02 * h), td, sa };
    });
    const TP = (a, b) => [pel[0] + U[0] * a * tL + Fw[0] * b * h, pel[1] + U[1] * a * tL + Fw[1] * b * h];
    const arms = A.arms.map(([a, e], i) => { const sho = TP(.9 + i * .02, -.008 - i * .012), el = add(sho, D(a, ua)), wr = add(el, D(a + e, fa)); return { sho, el, wr }; });
    const ha = lean + (A.head || 0), UH = [Math.sin(ha) * fx, -Math.cos(ha)], FH = [Math.cos(ha) * fx, Math.sin(ha)];
    const ry = .094 * h * st.head * st.hk, neck = TP(1, .005), hc = add(neck, UH, .012 * h + ry * .8);
    let ground = Math.max(...legs.flatMap((l) => [l.ank[1] + .022 * h, l.toe[1] + .01 * h]));
    const off = A.sit ? [x, y - .035 * h] : [x, y - ground + (A.dy || 0) * h];
    const T = (p) => [p[0] + off[0], p[1] + off[1]];
    const J = { h, fx, lean, ha, U, Fw, UH, FH, ry, tL, D, x, y, rot: A.rot || 0,
      pel: T(pel), neck: T(neck), hc: T(hc), ground: A.sit ? Math.max(...legs.map((l) => T(l.ank)[1] + .022 * h)) : y,
      legs: legs.map((l) => ({ hip: T(l.hip), knee: T(l.knee), ank: T(l.ank), toe: T(l.toe), heel: T(l.heel), td: l.td, sa: l.sa })),
      arms: arms.map((a) => ({ sho: T(a.sho), el: T(a.el), wr: T(a.wr) })) };
    J.TP = (a, b) => T(TP(a, b));
    J.HF = (f, u) => [J.hc[0] + FH[0] * f * ry * .86 + UH[0] * u * ry, J.hc[1] + FH[1] * f * ry * .86 + UH[1] * u * ry];
    J.hand = J.arms[0].wr; J.farHand = J.arms[1].wr; J.top = J.HF(0, 1);
    return J;
  }
  // a joint position from the rig's local (pre-rotation) frame to the screen
  function rotP(J, p) { if (!J.rot) return p; const c = Math.cos(J.rot), sn = Math.sin(J.rot), dx = p[0] - J.x, dy = p[1] - J.y; return [J.x + dx * c - dy * sn, J.y + dx * sn + dy * c]; }
  function screenJoints(J) {
    const R = (p) => rotP(J, p);
    return { ...J, pel: R(J.pel), neck: R(J.neck), hc: R(J.hc), hand: R(J.hand), farHand: R(J.farHand), top: R(J.top),
      legs: J.legs.map((l) => ({ ...l, hip: R(l.hip), knee: R(l.knee), ank: R(l.ank), toe: R(l.toe) })), arms: J.arms.map((a) => ({ sho: R(a.sho), el: R(a.el), wr: R(a.wr) })) };
  }

  // ---------------- drawing ----------------
  function legDraw(J, l, col, shoe, wk, lw, st) {
    const h = J.h, wT = .088 * h * st.w * wk * (st.denim ? 1.05 : 1), wS = .068 * h * st.w * wk;
    limbs(s, [[[l.hip, l.knee], wT], [[l.knee, l.ank], wS]], col, lw);
    if (st.denim) { const c = mid(l.knee, l.ank, .85); limbs(s, [[[c, mid(l.knee, l.ank, .97)], wS * 1.15]], C.glass, lw * .7); }
    petal(s, l.heel[0], l.heel[1] - .012 * h, Math.atan2(l.td[1], l.td[0]), .1 * h, .034 * h * wk, shoe, UMB, lw * .8);
  }
  function armDraw(J, a, col, skin, wk, lw, st, cuff) {
    const h = J.h, wU = .066 * h * st.w * wk, wF = .056 * h * st.w * wk;
    limbs(s, [[[a.sho, a.el], wU], [[a.el, a.wr], wF]], col, lw);
    if (cuff) { const c = mid(a.el, a.wr, .9); limbs(s, [[[c, a.wr], wF * .9]], cuff, lw * .6); }
    const d = nrm(sub(a.wr, a.el)); petal(s, a.wr[0] - d[0] * .012 * h, a.wr[1] - d[1] * .012 * h, Math.atan2(d[1], d[0]), .07 * h * wk, .03 * h * wk, skin, UMB, lw * .75);
  }
  // a hand as a mitten pointing on along the forearm (reads better through the brushstrokes than a disc)
  function handDraw(J, i, at, col) {
    const a = J.arms[i], p = at || a.wr, d = nrm(sub(a.wr, a.el)), h = J.h, wk = J.wk || 1, lw = J.lw;
    petal(s, p[0] - d[0] * .012 * h, p[1] - d[1] * .012 * h, Math.atan2(d[1], d[0]), .07 * h * wk, .03 * h * wk, col || J.st.skin, UMB, lw * .75);
  }
  function torsoOutline(J, st, A) {
    const { h, fx, TP } = J, b = st.body;
    const front = [TP(1.0, .024 * b), TP(.82, .054 * b * st.bust), TP(.52, .058 * b * st.belly), TP(.22, .062 * b * st.belly), TP(0, .055 * b * Math.max(1, st.hips * .9))];
    const back = [TP(0, -.052 * b * st.hips), TP(.42, -.05 * b), TP(.85, -.056 * b), TP(1.0, -.026 * b)];
    const d = clamp((A.legs[0][0] + A.legs[1][0]) / 2 * .9, -.45, 1.5) + (A.skirt || 0), Dv = [Math.sin(d) * fx, Math.cos(d)], Pf = [Math.cos(d) * fx, -Math.sin(d)];
    const hipF = front[front.length - 1], hipB = back[0];
    let hem = [];
    if (st.kind === 'dress') {
      const kn = J.legs.reduce((m, l) => (l.knee[0] * fx > m[0] * fx ? l.knee : m), J.legs[0].knee), gy = Math.max(...J.legs.map((l) => l.ank[1])) + .01 * h;
      const kF = [kn[0] + fx * .05 * h * b, kn[1]], fF = [kF[0] + fx * .05 * h, gy], bk = [J.pel[0] - fx * .16 * h * b * st.hips, gy];
      hem = [kF, fF, mid(fF, bk, .5), bk];
    } else {
      const L = (st.kind === 'coat' ? st.coatLen ?? .3 : st.kind === 'tails' ? .05 : st.coatLen ?? .07) * h, fl = .025 * h + L * .18;
      hem = [add(add(hipF, Dv, L), Pf, fl), add(add(mid(hipF, hipB), Dv, L * 1.02), Pf, -.004 * h), add(add(hipB, Dv, L * 1.03), Pf, -fl)];
    }
    return { pts: spl([...front, ...hem, ...back], true, 4), Dv, Pf };
  }
  function torsoDraw(J, st, A, lw, det) {
    const { h, fx, TP } = J, b = st.body;
    const { pts, Dv, Pf } = torsoOutline(J, st, A);
    shape(s, pts, st.coat, UMB, lw);
    s.save(); P(s, pts); s.closePath(); s.clip();
    if (st.check) { // the loud check: a big grid of ruby and teal on gold, in the torso's frame
      const step = .07 * h, wl = Math.max(9, .018 * h), A0 = (i) => add(J.pel, J.Fw, i * step), B0 = (i) => add(J.pel, J.U, i * step);
      for (let i = -8; i <= 8; i++) line([add(B0(i + .5), J.Fw, -.3 * h), add(B0(i + .5), J.Fw, .3 * h)], C.ochre, wl * .6);
      for (let i = -8; i <= 8; i++) line([add(A0(i), J.U, -.6 * h), add(A0(i), J.U, .6 * h)], st.check[1], wl);
      for (let i = -8; i <= 8; i++) line([add(B0(i), J.Fw, -.3 * h), add(B0(i), J.Fw, .3 * h)], st.check[0], wl);
    }
    if (st.stripes) { const step = .045 * h; for (let i = -10; i <= 10; i++) line([add(add(J.pel, J.U, i * step), J.Fw, -.3 * h), add(add(J.pel, J.U, i * step), J.Fw, .3 * h)], st.stripes, Math.max(9, .02 * h)); }
    if (st.kind === 'tails' || st.shirt) { // shirt front, waistcoat
      if (st.waistcoat) shape(s, spl([TP(.92, .01 * b), TP(.86, .07 * b * st.bust), TP(.5, .075 * b * st.belly), TP(.1, .072 * b * st.belly), TP(.08, .01 * b), TP(.6, -.005)], true, 3), st.waistcoat, UMB, lw * .8);
      shape(s, [TP(1.02, .004), TP(1.0, .06 * b), TP(.8, .066 * b * st.bust), TP(.72, .02 * b)], st.shirt || C.cream, UMB, lw * .7);
    }
    s.restore();
    if (st.watch && det > 0) { const a = TP(.42, .06 * b * st.belly), c = TP(.3, .03 * b); line([a, mid(a, c, .5).map((v, i) => v + (i ? .02 * h : 0)), c], C.gold, Math.max(8, lw * .55)); }
    if (st.buttons && det > 0) for (const a of [.18, .38, .58, .78]) { const p = TP(a, (.045 + .012 * Math.sin(a * 3)) * b * (a < .6 ? st.belly : 1)); shape(s, circle(p[0], p[1], Math.max(lw * .55, .012 * h), 12), st.buttons, UMB, lw * .5); glowAt(p[0], p[1], .03 * h, 'rgba(255,220,150,.25)'); }
    if (st.tie) { const p = TP(.97, .03 * b); petal(s, p[0], p[1], Math.atan2(-J.U[1], -J.U[0]) + fx * .25, .09 * h, .025 * h, st.tie, UMB, lw * .6); }
    if (st.scarf) { const p = TP(.97, .02); petal(s, p[0], p[1], Math.atan2(J.U[1], J.U[0]) * -1 + Math.PI / 2 - fx * .3, .08 * h, .028 * h, st.scarf, UMB, lw * .6); }
    if (st.carnation) { const p = TP(.8, .05 * b); lily(s, p[0], p[1], -Math.PI / 2 + fx * .4, .045 * h, .9, [C.ruby, C.rose]); }
    if (st.collar && st.kind !== 'tails') { const c = [TP(1.04, -.03 * b), TP(1.07, .03 * b), TP(.92, .05 * b), TP(.9, -.04 * b)]; shape(s, spl(c, true, 3), st.collar, UMB, lw * .8); }
    if (st.pistol) { // only the grip, peeking up out of the back pocket
      const b = st.body, P0 = (a, c) => TP(a, c * b);
      shape(s, [P0(-.12, -.06), P0(-.12, .0), P0(-.42, .0), P0(-.42, -.055)], shade(st.trousers, .8), UMB, lw * .7);
      shape(s, [P0(-.15, -.05), P0(.02, -.085), P0(.06, -.075), P0(.07, -.045), P0(-.1, -.012)], '#5a3a26', UMB, lw * .8);
      shape(s, [P0(-.16, -.058), P0(-.1, -.068), P0(-.08, -.01), P0(-.15, .0)], STEEL, UMB, lw * .6);
      for (const k of [.3, .6]) line([mid(P0(-.12, -.04), P0(.04, -.075), k), mid(P0(-.1, -.015), P0(.06, -.05), k)], C.ochre, Math.max(5, lw * .35));
    }
    if (st.pocket) { const p = TP(.02, -.04); shape(s, [add(p, J.U, -.02 * h), add(p, J.U, .05 * h), add(add(p, J.U, .05 * h), J.Fw, .05 * h), add(add(p, J.U, -.02 * h), J.Fw, .05 * h)], shade(st.trousers, .8), UMB, lw * .6); }
  }
  function tailsDraw(J, st, A, lw) { // the swallowtails hang behind the legs
    const { h, fx, TP } = J, d = clamp((A.legs[0][0] + A.legs[1][0]) / 2 * .8, -.4, 1.4) + .12, Dv = [Math.sin(d) * fx, Math.cos(d)], Pf = [Math.cos(d) * fx, -Math.sin(d)];
    const top = TP(.18, -.04 * st.body), base = TP(.0, -.045 * st.body * st.hips);
    const tip = add(add(base, Dv, .34 * h), Pf, -.03 * h), tip2 = add(add(base, Dv, .3 * h), Pf, .02 * h);
    shape(s, spl([top, add(top, Pf, .05 * h), tip2, tip, add(base, Pf, -.03 * h)], true, 3), shade(st.coat, .85), UMB, lw);
  }
  function headDraw(J, st, lw, det, o) {
    const { h, fx, HF, ry } = J, n = st.nose, ch = st.chin;
    const neckB = add(J.neck, J.U, -.02 * h);
    limbs(s, [[[neckB, HF(-.15, -.55)], .055 * h]], st.skin, lw);
    if (st.bun) shape(s, circle(...HF(-.85, .25), ry * .38, 20), st.hair, UMB, lw * .8);
    const pr = [[0, 1], [.5, .88], [.74, .55], [.8, .2], [.78, -.12], [.76, -.36], [.74 * ch, -.62], [.55 * ch, -.86], [.22, -.9], [-.18, -.64], [-.62, -.32], [-.82, .18], [-.6, .74]];
    const back = st.back || o.back;
    const head = spl(pr.map(([a, b]) => HF(a, b)), true, 4);
    shape(s, head, st.skin, UMB, lw);
    if (!back) { // the nose: a separate pointed shape, the caricature's main mark
      const nose = spl([[.7, .3], [.84 + .12 * n, .12], [.8 + .55 * n, -.14 - .08 * n], [.84 + .2 * n, -.3], [.7, -.3]].map(([a, b]) => HF(a, b)), false, 4);
      shape(s, nose, st.skin, UMB, lw); if (st.noseC) { s.save(); P(s, nose); s.closePath(); s.clip(); shape(s, circle(...HF(.8 + .5 * n, -.16), ry * .22 * n, 16), st.noseC, null); s.restore(); } shape(s, [[.55, .3], [.74, .3], [.74, -.3], [.55, -.3]].map(([a, b]) => HF(a, b)), st.skin, null);
    }
    s.save(); P(s, head); s.closePath(); s.clip();
    if (back) shape(s, spl([[.3, 1.3], [.22, .55], [.08, -.15], [-.05, -.62], [-1.3, -.7], [-1.3, 1.3]].map(([a, b]) => HF(a, b)), true, 3), st.hair, null);
    else { shape(s, spl([[-.95, .5], [-.95, -.4], [-.45, -.25], [-.3, .45], [-.4, .95]].map(([a, b]) => HF(a, b)), true, 3), st.hair, null);
      if (det > 0 && st.cheek) shape(s, circle(...HF(.4, -.3), ry * .2 * Math.sqrt(st.cheek), 16), C.rose, null);
      }
    s.restore();
    if (det > 0 || back) shape(s, spl([[-.05, .08], [.1, -.06], [.03, -.34], [-.17, -.26]].map(([a, b]) => HF(a + (back ? .32 : 0), b)), true, 3), st.skin, UMB, lw * .7);
    if (!back && det > 0) {
      const ew = Math.max(lw * .9, ry * .2);
      if (st.specs) { const [ex, ey] = HF(.5, .16); line([HF(.25, .16), HF(-.02, .08)], C.gold, Math.max(8, lw * .55)); shape(s, circle(ex, ey, ry * .3, 24), '#1a1c28', UMB, lw); dot(ex + fx * ry * .1, ey - ry * .1, Math.max(4, ry * .05), C.dusk); }
      else { dot(...HF(.5, .14), ew * .62, UMB); line(spl([[.32, .26], [.48, .3], [.64, .22]].map(([a, b]) => HF(a, b)), false, 3), UMB, Math.max(9, lw * .7)); }
      const bw = Math.max(9, lw * .8, ry * .1), bu = st.brow === 'worry' ? [[.3, .34], [.62, .44]] : st.brow === 'up' ? [[.28, .5], [.62, .44]] : [[.28, .4], [.64, .38]];
      line(bu.map(([a, b]) => HF(a, b)), UMB, bw);
      if (st.monocle) { const [mx, my] = HF(.5, .15); line(circle(mx, my, ry * .24, 24).concat([[mx + ry * .24, my]]), UMB, lw * .9); line(circle(mx, my, ry * .24, 24).concat([[mx + ry * .24, my]]), C.gold, Math.max(6, lw * .4)); line([HF(.4, -.05), HF(.1, -.7), J.TP(.9, .03)], C.gold, Math.max(5, lw * .3)); glowAt(mx, my, ry * .3, 'rgba(255,240,200,.5)'); }
      const m = o.mouth || st.mouth;
      if (m === 'o') shape(s, circle(...HF(.7, -.47), ry * .11, 14), '#5a2a28', UMB, lw * .5);
      else if (m === 'grin') line(spl([[.48, -.4], [.6, -.5], [.76, -.44]].map(([a, b]) => HF(a, b)), false, 4), UMB, bw);
      else if (m === 'glum') line(spl([[.5, -.56], [.62, -.46], [.75, -.5]].map(([a, b]) => HF(a, b)), false, 4), UMB, bw);
      else line([HF(.55, -.47), HF(.74, -.45)], UMB, bw);
    }
    if (!back && st.moustache) {
      if (st.moustache === 'walrus') shape(s, spl([[.86, -.24], [.9, -.42], [.7, -.62], [.38, -.7], [.42, -.45], [.62, -.3]].map(([a, b]) => HF(a, b)), true, 3), st.mC, UMB, lw * .8);
      else if (st.moustache === 'curl') { const a = HF(.78, -.32); vine(s, whip(a, HF(.65, -.42), HF(.42, -.4), HF(.3, -.22), .6, -fx * (J.FH[0] * fx > 0 ? 1 : -1), 16), Math.max(10, ry * .2), Math.max(6, ry * .08), st.mC, 1); shape(s, circle(a[0], a[1], ry * .12, 12), st.mC, UMB, lw * .6); }
      else shape(s, spl([[.86, -.26], [.84, -.4], [.6, -.42], [.62, -.3]].map(([a, b]) => HF(a, b)), true, 3), st.mC, UMB, lw * .7);
    }
    if (st.collarUp) { const { TP } = J, b = st.body; shape(s, spl([TP(.86, -.06 * b), HF(-.75, -.45), HF(-.2, -.6), HF(.3, -.95), TP(1.0, .04 * b), TP(.86, .05 * b)], true, 3), st.collarUp, UMB, lw); }
    hatDraw(J, st, lw, o);
  }
  // hats, in head units (f forward, u up; the crown of the head is u = 1)
  const HATS = {
    cap: (H, st, lw) => { shape(s, spl([[-.82, .5], [.6, .58], [.82, 1.2], [.1, 1.32], [-.8, 1.22]].map(H), true, 3), st.hatC, UMB, lw); shape(s, [[-.82, .5], [.6, .58], [.64, .8], [-.8, .74]].map(H), st.bandC, UMB, lw * .7); shape(s, spl([[.45, .6], [1.3, .36], [1.32, .5], [.6, .78]].map(H), true, 3), shade(st.hatC, .6), UMB, lw * .8); shape(s, circle(...H([.58, 1.0]), lw * .7, 12), C.gold, UMB, lw * .5); },
    stovepipe: (H, st, lw) => { shape(s, [[-.68, .8], [.72, .84], [.84, 2.85], [-.56, 2.8]].map(H), st.hatC, UMB, lw); shape(s, [[-.68, .82], [.72, .86], [.74, 1.15], [-.66, 1.12]].map(H), st.bandC, UMB, lw * .7); shape(s, spl([[-1.08, .7], [0, .8], [1.12, .74], [1.08, .9], [0, .96], [-1.04, .88]].map(H), true, 3), st.hatC, UMB, lw * .9); },
    top: (H, st, lw) => { shape(s, spl([[-.66, .84], [.68, .88], [.58, 1.45], [.76, 2.12], [.1, 2.16], [-.6, 2.08], [-.56, 1.45]].map(H), true, 3), st.hatC, UMB, lw); shape(s, [[-.64, .86], [.68, .9], [.66, 1.16], [-.62, 1.12]].map(H), st.bandC, UMB, lw * .7); line([[.38, 1.3], [.48, 1.95]].map(H), C.dusk, lw * .8); shape(s, spl([[-1.0, .72], [-.5, .84], [.6, .8], [1.1, .7], [1.04, .9], [0, .98], [-.98, .92]].map(H), true, 3), st.hatC, UMB, lw * .9); },
    bowler: (H, st, lw) => { shape(s, spl([[-.74, .8], [-.8, 1.25], [-.35, 1.66], [.25, 1.66], [.7, 1.28], [.74, .82]].map(H), true, 3), st.hatC, UMB, lw); shape(s, [[-.74, .82], [.74, .86], [.75, 1.06], [-.76, 1.02]].map(H), st.bandC, UMB, lw * .6); shape(s, spl([[-1.0, .66], [0, .82], [1.06, .72], [1.02, .88], [0, .96], [-.98, .82]].map(H), true, 3), st.hatC, UMB, lw * .9); },
    boater: (H, st, lw) => { shape(s, [[-.72, .78], [.76, .82], [.78, 1.3], [-.72, 1.26]].map(H), st.hatC, UMB, lw); shape(s, [[-.72, .8], [.76, .84], [.77, 1.05], [-.72, 1.01]].map(H), st.bandC, UMB, lw * .6); shape(s, [[-1.2, .7], [1.24, .78], [1.24, .92], [-1.2, .84]].map(H), st.hatC, UMB, lw * .9); },
    fedora: (H, st, lw) => { shape(s, spl([[-.7, .72], [.72, .78], [.66, 1.3], [.3, 1.36], [.05, 1.2], [-.25, 1.4], [-.66, 1.34]].map(H), true, 3), st.hatC, UMB, lw); shape(s, [[-.7, .74], [.72, .8], [.71, 1.0], [-.69, .96]].map(H), st.bandC, UMB, lw * .6); shape(s, spl([[-1.15, .5], [-.3, .78], [.8, .72], [1.25, .48], [1.25, .62], [.6, .9], [-.4, .92], [-1.15, .66]].map(H), true, 3), st.hatC, UMB, lw * .9); },
    flatcap: (H, st, lw) => { shape(s, spl([[-.84, .6], [.75, .68], [1.28, .6], [1.3, .72], [.95, .95], [.25, 1.22], [-.5, 1.18], [-.88, .9]].map(H), true, 3), st.hatC, UMB, lw); line([[.5, .7], [.9, .9]].map(H), shade(st.hatC, .7), lw * .7); },
    sailor: (H, st, lw) => { for (const k of [0, 1]) { const p = H([-.7, .82]), q = H([-1.0 - k * .3, -.4]); petal(s, p[0], p[1], Math.atan2(q[1] - p[1], q[0] - p[0]), .6 * J_.ry, .12 * J_.ry, st.bandC, UMB, lw * .6); } shape(s, spl([[-.78, .7], [.78, .75], [.9, 1.12], [0, 1.22], [-.9, 1.08]].map(H), true, 3), st.hatC, UMB, lw); shape(s, [[-.78, .72], [.78, .77], [.8, .92], [-.8, .87]].map(H), st.bandC, UMB, lw * .6); },
    feather: (H, st, lw) => {
      const pl = whip(H([-.3, 1.4]), H([-.6, 2.4]), H([-1.6, 2.6]), H([-2.1, 1.7]), .7, -J_.fx, 30);
      vine(s, pl, Math.max(14, J_.ry * .3), Math.max(8, J_.ry * .12), C.cream, 1);
      for (let i = 4; i < 30; i += 5) { const [px, py] = pl[i], [qx, qy] = pl[i + 1]; const a = Math.atan2(qy - py, qx - px); petal(s, px, py, a - J_.fx * 1.2, J_.ry * .55, J_.ry * .16, i % 10 ? C.cream : C.blush, UMB, lw * .5); }
      shape(s, spl([[-.68, .9], [-.62, 1.42], [.1, 1.58], [.62, 1.32], [.64, .92]].map(H), true, 3), st.hatC, UMB, lw);
      shape(s, spl([[-1.45, .62], [-.4, .8], [.8, .74], [1.55, 1.02], [1.45, 1.16], [.6, .98], [-.5, 1.04], [-1.38, .82]].map(H), true, 3), st.hatC, UMB, lw * .9);
      lily(s, ...H([.35, 1.05]), -Math.PI / 2 - J_.fx * .4, J_.ry * .5, .8, [C.rose, C.cream]);
    },
    bonnet: (H, st, lw) => { shape(s, spl([[.62, .95], [.2, 1.25], [-.5, 1.18], [-.98, .55], [-1.02, -.2], [-.72, -.66], [-.42, -.56], [-.55, .1], [-.3, .78], [.35, .82]].map(H), true, 3), st.hatC, UMB, lw); line(spl([[.6, .92], [.1, 1.12], [-.6, .95], [-.9, .2], [-.72, -.55]].map(H), false, 3), st.bandC, lw * .9); petal(s, ...H([.05, -.82]), Math.atan2(J_.FH[1], J_.FH[0]), J_.ry * .4, J_.ry * .16, st.bandC, UMB, lw * .6); petal(s, ...H([.05, -.82]), Math.atan2(-J_.FH[1], -J_.FH[0]), J_.ry * .35, J_.ry * .16, st.bandC, UMB, lw * .6); },
    nightcap: (H, st, lw) => { shape(s, spl([[-.78, .55], [.66, .72], [.5, 1.25], [-.2, 1.6], [-1.1, 1.45], [-1.65, .7], [-1.45, .62], [-1.0, 1.08], [-.66, .95]].map(H), true, 3), st.hatC, UMB, lw); shape(s, [[-.78, .57], [.66, .74], [.62, .92], [-.78, .76]].map(H), st.bandC, UMB, lw * .6); shape(s, circle(...H([-1.58, .55]), J_.ry * .2, 14), st.bandC, UMB, lw * .7); },
  };
  let J_ = null; // the joints of the figure being drawn, for the hat functions
  function hatDraw(J, st, lw, o) {
    const hat = o.hat === undefined ? st.hat : o.hat; if (!hat || !HATS[hat]) return;
    const tl = (st.hatTilt || 0) + (o.hatTilt || 0), c = Math.cos(tl), sn = Math.sin(tl), b = [-.05, .8];
    const H = ([f, u]) => { const df = f - b[0], du = u - b[1]; return J.HF(b[0] + df * c + du * sn, b[1] - df * sn + du * c); };
    J_ = J; HATS[hat](H, st, lw);
  }

  // ---- the back view: walking away from camera (pose 'walk' or 'stand'), symmetric, same proportions ----
  // drift: sideways lean (radians); the near/far idea becomes left/right. Returns { hand (right), farHand
  // (left), hc, top, neck, pel, h, lw, ground }.
  function backView(t, x, y, sc, st, o) {
    const h = sc * st.h, lw = clamp(8 + sc * .012, 9, 20), wk = sc < 350 ? lerp(1.5, 1, inv(110, 350, sc)) : 1, b = st.body * 1.3;
    const walk = (o.pose || 'walk') === 'walk', u = (o.ph ?? t) * TAU, sd = walk ? (o.stride ?? 1) : 0;
    const rot = (o.rot || 0) + .035 * sd * Math.sin(u), bob = walk ? -.014 * h * Math.abs(Math.cos(u)) : 0;
    s.save(); f.save(); for (const g of [s, f]) { g.translate(x, y); g.rotate(rot); g.translate(-x, -y); }
    const legL = .475 * h * st.legK, hipY = y - legL - .022 * h + bob, shY = hipY - .28 * h * st.torso, neckY = shY - .015 * h;
    const ry = .094 * h * st.head * (sc < 320 ? lerp(1.25, 1, inv(110, 320, sc)) : 1), hc = [x, neckY - ry * .8];
    // legs: the lifted foot shows its sole, the planted one its heel
    for (const i of [0, 1]) {
      const sx = i ? 1 : -1, lift = sd * Math.max(0, Math.sin(u + i * Math.PI)), fx0 = x + sx * .045 * h * b, fy = y - .02 * h - lift * .07 * h, kx = fx0 + sx * .01 * h;
      limbs(s, [[[[x + sx * .04 * h * b, hipY], [kx, lerp(hipY, fy, .5) - lift * .02 * h], [fx0, fy]], .085 * h * st.w * wk]], st.trousers, lw);
      shape(s, blobPts(fx0, fy + .012 * h, .04 * h * wk, .022 * h * (1 + lift * .6), i + 2, .05, 20), st.shoe, UMB, lw * .8);
      if (lift > .3) shape(s, blobPts(fx0, fy + .016 * h, .028 * h * wk, .012 * h, i + 5, .05, 16), shade(st.shoe, 1.5), null);
    }
    // arms swing in depth: the forward hand rides higher and shorter
    const arm = (sx, ph2) => { const sw = sd * Math.sin(u + ph2), sh = [x + sx * .1 * h * b, shY + .025 * h], wr = [sh[0] + sx * .025 * h, sh[1] + .33 * h * st.armK * (1 - .1 * sw)], el = mid(sh, wr, .5);
      el[0] += sx * .02 * h; limbs(s, [[[sh, el, wr], .066 * h * st.w * wk]], st.coat, lw); return { sh, el, wr }; };
    const aR = arm(1, 0), aL = arm(-1, Math.PI);
    // the coat from behind: shoulders, back seam, a vent, the hem swinging with the stride
    const L = (st.kind === 'coat' ? st.coatLen ?? .3 : .06) * h, hemY = hipY + L, sw = .02 * h * sd * Math.sin(u);
    const coat = spl([[x - .1 * h * b, shY - .005 * h], [x - .115 * h * b, shY + .06 * h], [x - .095 * h * b, hipY - .06 * h], [x - .105 * h * b - .02 * L, hipY], [x - .12 * h * b - .1 * L + sw, hemY], [x + sw, hemY + .01 * h], [x + .12 * h * b + .1 * L + sw, hemY], [x + .105 * h * b + .02 * L, hipY], [x + .095 * h * b, hipY - .06 * h], [x + .115 * h * b, shY + .06 * h], [x + .1 * h * b, shY - .005 * h], [x, shY - .02 * h]], true, 4);
    shape(s, coat, st.coat, UMB, lw);
    line([[x, shY + .03 * h], [x, hipY - .02 * h], [x + sw * .6, hemY - .02 * h]], UMB, lw * .7);
    line([[x - .07 * h * b, hipY - .07 * h], [x + .07 * h * b, hipY - .07 * h]], shade(st.coat, .8), lw * .9);
    // hands, then the head: hair, ears, the nape; collar up; the hat from behind
    const hand = (a) => petal(s, a.wr[0], a.wr[1] - .01 * h, Math.PI / 2, .065 * h * wk, .03 * h * wk, st.skin, UMB, lw * .75);
    hand(aL); hand(aR);
    limbs(s, [[[[x, neckY + .02 * h], [x, hc[1] + ry * .4]], .06 * h]], st.skin, lw);
    for (const sx of [-1, 1]) shape(s, blobPts(x + sx * ry * .68, hc[1] + ry * .1, ry * .14, ry * .24, sx + 3, .05, 16), st.skin, UMB, lw * .7);
    shape(s, blobPts(hc[0], hc[1], ry * .66, ry * .88, 7, .03, 40), st.hair, UMB, lw);
    line([[x - ry * .3, hc[1] + ry * .35], [x - ry * .12, hc[1] + ry * .8]], shade(st.hair, .7), lw * .7); line([[x + ry * .3, hc[1] + ry * .35], [x + ry * .12, hc[1] + ry * .8]], shade(st.hair, .7), lw * .7);
    if (st.collarUp) for (const sx of [-1, 1]) shape(s, [[x + sx * .02 * h, shY - .005 * h], [x + sx * .1 * h * b, shY + .01 * h], [x + sx * .085 * h, neckY - .09 * h], [x + sx * .035 * h, neckY - .07 * h]], st.collarUp, UMB, lw * .9);
    const hy = hc[1] - ry * .45, hat = st.hat;
    if (hat) {
      const tall = { top: 1.6, stovepipe: 2.4, bowler: .9, cap: .7, flatcap: .5, boater: .55 }[hat] ?? .8, rim = hat === 'flatcap' ? .82 : hat === 'cap' ? .78 : 1.08;
      if (hat === 'bowler') shape(s, spl([[x - ry * .7, hy], [x - ry * .72, hy - ry * .5], [x, hy - ry * tall], [x + ry * .72, hy - ry * .5], [x + ry * .7, hy]], true, 4), st.hatC, UMB, lw);
      else shape(s, [[x - ry * .68, hy], [x - ry * .64, hy - ry * tall], [x + ry * .64, hy - ry * tall], [x + ry * .68, hy]], st.hatC, UMB, lw);
      shape(s, [[x - ry * .7, hy - ry * .02], [x + ry * .7, hy - ry * .02], [x + ry * .7, hy - ry * .2], [x - ry * .7, hy - ry * .2]], st.bandC, UMB, lw * .6);
      shape(s, blobPts(x, hy + ry * .02, ry * rim, ry * .14, 9, .02, 30), st.hatC, UMB, lw * .9);
    }
    const J = { h, lw, wk, st, x, y, fx: 1, rot, hand: aR.wr, farHand: aL.wr, hc, top: [x, hy - ry], neck: [x, neckY], pel: [x, hipY], ground: y, arms: [aR, aL].map((a) => ({ sho: a.sh, el: a.el, wr: a.wr })), back: 1 };
    if (o.after) o.after(J);
    s.restore(); f.restore();
    return J;
  }
  // person(t, x, y, sc, { style | who, pose, ph, facing, rot, ...pose options, before, mid, after, hat, mouth, back })
  // Returns the joints in screen coords: { hand, farHand, hc (head centre), top, neck, pel, legs[], arms[], h, fx, ground }.
  function person(t, x, y, sc, o = {}) {
    const st = { ...BASE, ...(o.who ? CAST[o.who] : {}), ...(o.style || {}) };
    if (o.view === 'back') return backView(t, x, y, sc, st, o);
    const fx = o.facing ?? 1, ph = o.ph ?? t;
    st.hk = sc < 320 ? lerp(1.25, 1, inv(110, 320, sc)) : 1; st.body *= 1.3;
    const A = (POSES[o.pose || 'stand'] || POSES.stand)(ph, { ...o, facing: fx });
    if (o.rot) A.rot = (A.rot || 0) + o.rot;
    const J = rig(x, y, sc, A, st, fx);
    const lw = clamp(8 + sc * .012, 9, 20), wk = sc < 350 ? lerp(1.5, 1, inv(110, 350, sc)) : 1, det = sc >= 300 ? 2 : sc >= 170 ? 1 : 0;
    Object.assign(J, { lw, wk, det, st, A, t, ph });
    const rotd = !!J.rot;
    if (rotd) for (const g of [s, f]) { g.save(); g.translate(x, y); g.rotate(J.rot); g.translate(-x, -y); }
    const tr = st.trousers, trD = shade(tr, .74), sl = st.sleeve || st.coat, slD = shade(sl, .74), sk = st.skin, skD = shade(st.skin, .88);
    if (o.under) o.under(J);
    legDraw(J, J.legs[1], trD, shade(st.shoe, .8), wk, lw, st);
    if (!o.noFarArm) armDraw(J, J.arms[1], slD, skD, wk, lw, st, st.kind === 'tails' ? C.cream : null);
    if (o.before) o.before(J);
    if (st.kind === 'tails') tailsDraw(J, st, A, lw);
    legDraw(J, J.legs[0], tr, st.shoe, wk, lw, st);
    torsoDraw(J, st, A, lw, det);
    headDraw(J, st, lw, det, o);
    if (o.mid) o.mid(J);
    armDraw(J, J.arms[0], sl, sk, wk, lw, st, st.kind === 'tails' ? C.cream : null);
    if (o.after) o.after(J);
    if (rotd) { s.restore(); f.restore(); }
    return screenJoints(J);
  }
  // distance a walk covers per cycle (two steps), so feet don't skate: x = x0 + fx * ph * walkStride(sc, o)
  function walkStride(sc, o = {}) { const st = { ...BASE, ...(o.who ? CAST[o.who] : {}), ...(o.style || {}) }; return 4 * .5 * sc * st.h * st.legK * Math.sin(.36 * (o.stride ?? 1)) * .92; }

  // ---------------- props ----------------
  function cane(J, hand, tipX, tipY, col = C.ochre) {
    const { h, fx, lw } = J, crook = [[hand[0] - fx * .045 * h, hand[1] + .01 * h], [hand[0] - fx * .035 * h, hand[1] - .03 * h], [hand[0] + fx * .005 * h, hand[1] - .03 * h], hand];
    limbs(s, [[[...crook, [tipX, tipY]], .022 * h * J.wk]], col, lw * .8);
    handDraw(J, 0, hand);
  }
  function lantern(J, hand, sw, lit) {
    const { h, lw } = J, L = .06 * h, a = sw, c = [hand[0] + Math.sin(a) * L, hand[1] + Math.cos(a) * L], R = (px, py) => [c[0] + (px * Math.cos(a) + py * Math.sin(a)) * h, c[1] + (-px * Math.sin(a) + py * Math.cos(a)) * h];
    line([hand, c], UMB, lw * .7); line(spl([R(-.025, 0), R(0, -.03), R(.025, 0)], false, 4), C.gold, Math.max(6, lw * .45));
    shape(s, [R(-.04, .0), R(.04, .0), R(.032, .015), R(-.032, .015)], C.gold, UMB, lw * .8);
    shape(s, [R(-.034, .015), R(.034, .015), R(.04, .085), R(-.04, .085)], lit > .3 ? C.amber : C.ochre, UMB, lw * .8);
    line([R(0, .015), R(0, .085)], UMB, lw * .6);
    shape(s, [R(-.046, .085), R(.046, .085), R(.03, .105), R(-.03, .105)], C.gold, UMB, lw * .8);
    if (lit > 0) { const g = R(0, .05); glowAt(g[0], g[1], .42 * h, `rgba(255,180,100,${.45 * lit})`); glowAt(g[0], g[1], .07 * h, `rgba(255,240,200,${.9 * lit})`); }
  }
  // a Galle bottle held upright in the hand, `fill` 0..1 of rain
  function bottle(J, hand, ang, fill, t) {
    const { h, lw } = J, bh = .2 * h, R = (px, py) => [hand[0] + (px * Math.cos(ang) - py * Math.sin(ang)) * bh, hand[1] + (px * Math.sin(ang) + py * Math.cos(ang)) * bh];
    const pts = [...cub([-.06, -.62], [-.06, -.42], [-.3, -.3], [-.24, .32], 14), ...cub([.24, .32], [.3, -.3], [.06, -.42], [.06, -.62], 14)].map(([a, b]) => R(a, b));
    shape(s, pts, C.glass, UMB, lw);
    s.save(); P(s, pts); s.closePath(); s.clip(); const lv = lerp(.3, -.45, clamp(fill)), wb = Math.sin(t * 7) * .02;
    shape(s, [R(-.5, lv + wb), R(.5, lv - wb), R(.5, .5), R(-.5, .5)], C.teal, null); s.restore();
    shape(s, [R(-.08, -.66), R(.08, -.66), R(.08, -.6), R(-.08, -.6)], C.gold, UMB, lw * .6);
    lily(s, ...R(0, .08), ang - Math.PI / 2, bh * .22, .5, [C.rose, C.cream]);
    glowAt(...R(-.12, -.1), bh * .25, 'rgba(220,255,240,.35)');
    handDraw(J, 0, hand);
    f.save(); f.globalCompositeOperation = 'lighter'; f.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const top = R(0, -.66), u = fr(t * 2.2 + i / 5), y = top[1] - (1 - u) * .5 * h; f.strokeStyle = `rgba(200,225,255,${.6 * (1 - u)})`; f.lineWidth = 4; f.beginPath(); f.moveTo(top[0] + (i - 2) * .006 * h, y); f.lineTo(top[0] + (i - 2) * .006 * h, y - .05 * h); f.stroke(); }
    f.restore();
  }
  function shovelProp(J, p, coal = true) {
    const { h, lw } = J, G = J.arms[1].wr, N = J.arms[0].wr, d = nrm(sub(N, G)), q = fr(p);
    const base = add(N, d, .17 * h), ang = Math.atan2(d[1], d[0]);
    limbs(s, [[[add(G, d, -.04 * h), base], .024 * h]], C.ochre, lw * .8);
    const tg = add(G, d, -.04 * h), nn = [-d[1], d[0]]; limbs(s, [[[add(tg, nn, -.035 * h), add(tg, nn, .035 * h)], .022 * h]], C.ochre, lw * .8);
    petal(s, base[0] - d[0] * .02 * h, base[1] - d[1] * .02 * h, ang, .17 * h, .075 * h, STEEL, UMB, lw);
    if (coal && q > .02 && q < .6) for (let i = 0; i < 4; i++) { const c = add(add(base, d, (.05 + .025 * i) * h), nn, ((i % 2) - .5) * .03 * h - .02 * h); shape(s, blobPts(c[0], c[1], .026 * h, .021 * h, i + 3, .3, 7, i), COAL, UMB, lw * .6); }
    if (coal && q >= .6) for (let i = 0; i < 6; i++) { // the throw: lumps fly on from the blade
      const u = (q - .6) / .4, v = [d[0] * .9 * h + (hash(i * 7) - .5) * .25 * h, d[1] * .9 * h - .5 * h + hash(i * 3) * .2 * h], c = [base[0] + v[0] * u, base[1] + v[1] * u + .9 * h * u * u];
      shape(s, blobPts(c[0], c[1], .022 * h, .018 * h, i + 9, .3, 7, i), COAL, UMB, lw * .6);
    }
    handDraw(J, 0);
    return add(base, d, .16 * h);
  }

  // ---------------- the cast ----------------
  // 1. the conductor: blind (dark round spectacles), lame (cane, stiff near leg), peaked cap, long coat,
  // brass buttons, a lantern swinging from his far hand. pose 'limp' | 'stand' | 'sway'. lit 0..1.
  function conductor(t, x, y, sc, o = {}) {
    const ph = o.ph ?? t * .55, fx = o.facing ?? 1;
    return person(t, x, y, sc, { who: 'conductor', pose: 'limp', ...o, ph, facing: fx,
      after: (J) => { const hd = J.arms[0].wr; cane(J, hd, hd[0] + fx * .06 * J.h, J.ground, C.ochre);
        lantern(J, J.arms[1].wr, o.swing ?? (.35 * Math.sin(t * 3.4) + .15 * fx), o.lit ?? 1); o.after?.(J); } });
  }
  // 2. the passengers, all insane: who 'tall' (stovepipe), 'stout' (feathered hat), 'old' (bowler, walrus
  // moustache), 'dandy' (boater, tails, carnation). pose 'sway' (holding a strap, rocking; amp) | 'sit' | 'stand'.
  // strap: true draws the leather strap from the raised hand up to strapY.
  function passenger(t, x, y, sc, o = {}) {
    const who = o.who || 'tall', ph = o.ph ?? t * .9;
    return person(t, x, y, sc, { pose: 'sway', ...o, who, ph,
      after: (J) => { if (o.strap && (o.pose || 'sway') === 'sway') { const hd = J.arms[1].wr, top = [hd[0] - Math.sin(J.rot) * .2 * J.h, o.strapY ?? hd[1] - .22 * J.h]; limbs(s, [[[top, add(hd, [0, -.04 * J.h])], .02 * J.h]], '#8a5a30', J.lw * .8); ring(s, hd[0], hd[1] - .015 * J.h, .035 * J.h, '#a06a38', .016 * J.h, J.lw * .8); handDraw(J, 1); } o.after?.(J); } });
  }
  // 3. the man in the loud checked Cincinnati jacket, slumped on a seat (pose 'slump' | 'sit' | 'stand' | 'walk')
  function jacketMan(t, x, y, sc, o = {}) { return person(t, x, y, sc, { who: 'jacket', pose: 'slump', ph: t * .4, ...o }); }
  // 4. the one hanging out of the window with a bottle of rain. (x, y) = the middle of the sill. Draws the
  // window opening (lit amber unless lit: 0), the figure leaning out over the sill toward `facing`, the sill,
  // and the bottle (fill 0..1). The wall around it is the painter's.
  function windowLeaner(t, x, y, sc, o = {}) {
    const fx = o.facing ?? 1, ww = .52 * sc, wh = .56 * sc, lit = o.lit ?? 1, lw = clamp(8 + sc * .012, 9, 20);
    const ox = x - ww / 2, oy = y - wh;
    const arch = [[ox, y], [ox, oy + ww / 2], ...circle(ox + ww / 2, oy + ww / 2, ww / 2, 48).filter(([, py]) => py <= oy + ww / 2 + .1).sort((a, b) => a[0] - b[0]), [ox + ww, oy + ww / 2], [ox + ww, y]];
    if (o.frame !== false) { shape(s, arch.map(([px, py]) => [x + (px - x) * 1.12, py - (y - py) * .06 + .0]), C.ochre, UMB, lw); shape(s, arch, lit ? C.amber : C.night, UMB, lw * 1.2); if (lit) glowAt(x, y - wh * .45, wh * .9, `rgba(255,190,110,${.35 * lit})`); }
    s.save(); s.beginPath(); s.rect(-W, -H * 2, W * 3, y - .01 * sc + H * 2); s.clip();
    const J = person(t, x - fx * .08 * sc, y + .07 * sc, sc, { who: 'leaner', pose: 'leanOut', ph: t * .5, ...o, facing: fx, noFarArm: false });
    s.restore();
    shape(s, [[x - ww * .62, y - .02 * sc], [x + ww * .62, y - .02 * sc], [x + ww * .66, y + .06 * sc], [x - ww * .66, y + .06 * sc]], C.parch, UMB, lw);
    // the far hand rests on the sill, over it
    handDraw(J, 1, [J.farHand[0], Math.min(J.farHand[1], y - .02 * sc)]);
    bottle(J, J.hand, (o.tilt ?? .15) * fx + Math.sin(t * 1.3) * .04, o.fill ?? clamp(.2 + (t % 6) / 7), t);
    return J;
  }
  // 5. a sailor (or deck passenger) waving goodbye; reads down to ~150 px. seed varies cap, shirt and timing.
  function sailor(t, x, y, sc, o = {}) {
    const sd = o.seed ?? 0, r = (k) => hash(sd * 31 + k), alt = r(1) > .6;
    const style = alt ? { kind: 'coat', coat: [C.rose, C.sage, C.teal][sd % 3], coatLen: .22, stripes: null, hat: ['bowler', 'boater', 'flatcap'][sd % 3], hatC: [C.ochre, C.cream, C.olive][sd % 3], trousers: C.dusk, scarf: null } : {};
    return person(t, x, y, sc * (.92 + .16 * r(2)), { who: 'sailor', pose: 'wave', ph: o.ph ?? (t * 1.6 + r(3)), ...o, style: { ...style, ...(o.style || {}) } });
  }
  // 6. the millionaire shovelling the coal: top hat, tails, gold waistcoat, monocle, a shovel.
  // pose 'shovel' (one shovelful per cycle; the throw at .62) | 'stand'. coal: false for an empty shovel.
  // Returns the joints plus `blade` (the shovel's tip).
  function millionaire(t, x, y, sc, o = {}) {
    let blade = null; const pose = o.pose || 'shovel';
    const J = person(t, x, y, sc, { who: 'millionaire', pose, ph: t * .5, ...o,
      mid: (J) => { if (pose === 'shovel') blade = shovelProp(J, J.ph, o.coal !== false); o.mid?.(J); } });
    J.blade = blade && rotP(J, blade); return J;
  }
  // 7. going up to Harlem: a lanky walker in denim and a cap, a pistol grip just peeking from his back
  // pocket (never in hand). pose 'walk' (swagger) | 'stand'.
  function harlemWalker(t, x, y, sc, o = {}) { return person(t, x, y, sc, { who: 'walker', pose: 'walk', ph: t * .9, swagger: .6, stride: 1.05, ...o }); }
  // 8. Mr. Knickerbocker: bowler, long camel coat, collar up, cane; seen from behind (back: false shows his face).
  function knickerbocker(t, x, y, sc, o = {}) {
    const fx = o.facing ?? 1, view = o.view ?? 'back';
    return person(t, x, y, sc, { who: 'knicker', pose: 'walk', ph: t * .8, stride: .9, ...o, view, style: { back: o.back ?? 1, ...(o.style || {}) },
      after: (J) => { const hd = J.hand;
        if (view === 'back') { const sw = Math.sin((o.ph ?? t * .8) * TAU); cane(J, hd, hd[0] + .05 * J.h, hd[1] + .3 * J.h - .06 * J.h * sw, '#4a3426'); }
        else { const a = J.A.arms[0][0] + J.A.arms[0][1]; cane(J, hd, hd[0] + Math.sin(a * .6 + .5) * fx * .3 * J.h, hd[1] + Math.cos(a * .6 + .5) * .3 * J.h, '#4a3426'); }
        o.after?.(J); } });
  }
  // 9. the Salvation Army band: role 'drum' | 'tuba' | 'tambourine'. Pass ph = beatPhase(t) so the drum
  // and tambourine land on the beats. march: stride (0 = in place). k 0..1 topples them over backwards.
  function bandsman(t, x, y, sc, o = {}) {
    const role = o.role || 'drum', who = { drum: 'drummer', tuba: 'tubist', tambourine: 'tambo' }[role], ph = o.ph ?? beatPhase(t);
    const pose = o.k > 0 ? 'topple' : role;
    const inst = {
      drum: (J) => { const { h, lw, TP } = J, c = TP(.45, .19 * J.st.body), R = .17 * h; shape(s, circle(c[0], c[1], R, 48), C.ruby, UMB, lw);
        line([...Array(19)].map((_, i) => { const a = i / 18 * TAU; return [c[0] + Math.cos(a) * R * (i % 2 ? .78 : .95), c[1] + Math.sin(a) * R * (i % 2 ? .78 : .95)]; }), C.gold, Math.max(8, lw * .6));
        shape(s, circle(c[0], c[1], R * .7, 40), C.cream, UMB, lw * .8); halo(c[0], c[1], R * .4, t * .2, 0); J.drumC = c;
        const q = fr(ph); if (q < .15) glowAt(c[0], c[1], R * 1.4, `rgba(255,230,180,${.4 * (1 - q / .15)})`); },
      tuba: (J) => { const { h, lw, TP, fx } = J, b = J.st.body, c = TP(.42, .17 * b), top = TP(1.2, .14 * b), R = .085 * h;
        ring(s, c[0], c[1], R, C.gold, .045 * h, lw);
        limbs(s, [[[TP(.25, .11 * b), TP(.7, .16 * b), top], .07 * h]], C.gold, lw);
        const bd = nrm(sub(top, TP(.7, .16 * b))), bn = [-bd[1], bd[0]], bt = add(top, bd, .12 * h);
        shape(s, [add(top, bn, .04 * h), add(bt, bn, .13 * h), add(bt, bn, -.13 * h), add(top, bn, -.04 * h)], C.gold, UMB, lw);
        shape(s, spl([add(bt, bn, .13 * h), add(add(bt, bd, .03 * h), bn, 0), add(bt, bn, -.13 * h), add(add(bt, bd, -.03 * h), bn, 0)], true, 4), '#3a2a18', UMB, lw * .8);
        limbs(s, [[[TP(.75, .14 * b), J.HF(.75, -.5)], .02 * h]], C.gold, lw * .7);
        for (let i = 0; i < 3; i++) { const v = TP(.62 + i * .06, .2 * b); shape(s, circle(v[0], v[1], .016 * h, 10), C.parch, UMB, lw * .5); }
        glowAt(bt[0], bt[1], .15 * h, `rgba(255,220,150,${.25 * beatPulse(t, 6)})`); },
      tambourine: (J) => { const { h, lw } = J, hd = J.arms[0].wr, R = .075 * h, a = t * 9, c = [hd[0] + Math.cos(a) * .01 * h, hd[1] - R * .6];
        vine(s, whip(c, [c[0] - J.fx * .05 * h, c[1] + .1 * h], [c[0] + J.fx * .06 * h, c[1] + .18 * h], [c[0] - J.fx * .02 * h, c[1] + .26 * h], .6, J.fx, 20), Math.max(12, .02 * h), 7, C.ruby, 1);
        shape(s, circle(c[0], c[1], R, 36), C.ochre, UMB, lw); shape(s, circle(c[0], c[1], R * .72, 30), C.parch, UMB, lw * .8);
        for (let i = 0; i < 6; i++) { const b = i / 6 * TAU + Math.sin(a) * .2; shape(s, circle(c[0] + Math.cos(b) * R * .86, c[1] + Math.sin(b) * R * .86, R * .17, 10), C.gold, UMB, lw * .5); }
        const q = fr(ph); if (q < .2) for (let i = 0; i < 6; i++) { const b = i / 6 * TAU; glowAt(c[0] + Math.cos(b) * R, c[1] + Math.sin(b) * R, R * .5, `rgba(255,230,160,${.6 * (1 - q / .2)})`); }
        handDraw(J, 0); },
    }[role];
    return person(t, x, y, sc, { who, ...o, pose, ph, from: role,
      mid: (J) => { if (role !== 'tambourine') inst(J); o.mid?.(J); },
      after: (J) => { if (role === 'drum') { const hd = J.arms[0].wr, d = nrm(sub(J.arms[0].wr, J.arms[0].el)), e = add(hd, d, .1 * J.h); limbs(s, [[[hd, e], .018 * J.h]], C.ochre, J.lw * .7); shape(s, circle(e[0], e[1], .028 * J.h, 14), C.cream, UMB, J.lw * .7); handDraw(J, 0); }
        if (role === 'tambourine') inst(J); o.after?.(J); } });
  }
  // 10. a rower for the little rowboat to heaven: seated, one stroke per cycle (catch at 0, finish at .4).
  // (x, y) = the thwart (seat). oarlock: [x, y] draws the oar from the hands through it; oarLen in px.
  // oar: 'front' (default) draws the oar over the rower; 'later' leaves it to J.drawOar(), so a painter can
  // draw the hull over the rower's legs first and the oar over the hull; false for none. The oar pivots on
  // `oarlock` (screen [x, y]; default: the gunwale just ahead of the rower), blade `oarLen` px past it.
  function rower(t, x, y, sc, o = {}) {
    const sd = o.seed ?? 0, looks = [{ hat: 'boater', coat: C.cream, stripes: C.rose }, { hat: 'bowler', hatC: C.ochre, coat: C.sage, stripes: null, kind: 'jacket' }, { hat: 'flatcap', hatC: C.olive, coat: C.rose, stripes: null }][sd % 3];
    let JL = null, tip = null;
    const oar = (J) => {
      const hd = mid(J.arms[0].wr, J.arms[1].wr), L = o.oarlock ? rotP0(J, o.oarlock) : [J.x + J.fx * .3 * J.h, J.y + .04 * J.h], d = nrm(sub(L, hd)), e = add(L, d, o.oarLen ?? .8 * J.h);
      limbs(s, [[[add(hd, d, -.05 * J.h), e], .026 * J.h * J.wk]], C.ochre, J.lw * .8);
      petal(s, ...add(e, d, -.06 * J.h), Math.atan2(d[1], d[0]), .24 * J.h, .07 * J.h * J.wk, C.ochre, UMB, J.lw * .8);
      handDraw(J, 0); return add(e, d, .18 * J.h);
    };
    const R = person(t, x, y, sc, { who: 'rower', pose: 'row', ph: o.ph ?? beatPhase(t) / 2, ...o, style: { ...looks, ...(o.style || {}) },
      after: (J) => { JL = J; if ((o.oar ?? 'front') === 'front') tip = oar(J); o.after?.(J); } });
    R.oarTip = tip && rotP(JL, tip);
    R.drawOar = () => { if (!JL) return; if (JL.rot) for (const g of [s, f]) { g.save(); g.translate(JL.x, JL.y); g.rotate(JL.rot); g.translate(-JL.x, -JL.y); } const tip = oar(JL); if (JL.rot) { s.restore(); f.restore(); } return rotP(JL, tip); };
    return R;
  }
  // a point in screen coords back into the figure's unrotated frame (for props given in screen coords)
  function rotP0(J, p) { if (!J.rot) return p; const c = Math.cos(-J.rot), sn = Math.sin(-J.rot), dx = p[0] - J.x, dy = p[1] - J.y; return [J.x + dx * c - dy * sn, J.y + dx * sn + dy * c]; }

  Object.assign(window, { person, beatPhase, walkStride, CAST, CAST_POSES: POSES, conductor, passenger, jacketMan, windowLeaner, sailor, millionaire, harlemWalker, knickerbocker, bandsman, rower, castShade: shade, castSpline: spl, castLimbs: limbs });
})();
