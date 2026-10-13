// 236.6-268.4  "In her dream there's a big reunion gonna come" x3, the loudest stretch of the song.
// A paper kaleidoscope: stacked paper plates, each carrying one motif from the film (little houses,
// paper birds, oranges and moons, flowers, her profile on the sun), turning in opposite directions on
// the beat. On each "reunion" the things give way to people: a paper-doll chain of the whole cast,
// holding hands, rises out of the rosette (and on the 2nd and 3rd, a mirrored chain of kids inside it).
// From 266 every plate collapses into the centre, and the centre becomes the kitchen lamp of 17.
(() => {
const CX = W / 2, CY = H / 2;
const LAMP = { x: 1000, y: 318, r: 30 };            // 01/17's lamp bulb (LX, shade bottom); the rosette ends here
// beat grid measured from the no-vocals stem: 161.5 bpm, B0 a downbeat (strongest of four)
const P = .37233, B0 = 230.3;
const beatX = (t) => (t - B0) / P;
const sinceBeat = (t) => { const x = beatX(t); return (x - Math.floor(x)) * P; };
const sinceBar = (t) => { const x = beatX(t) / 4; return (x - Math.floor(x)) * 4 * P; };
const hit = (d, tau = .13) => Math.exp(-d / tau);
// a clockwork step every `every` beats: integer count plus an eased tick
const ratchet = (t, every = 2) => { const x = beatX(t) / every, n = Math.floor(x); return n + eo((x - n) * 2.6); };

const RU = [wordAt('reunion', 0, 236), wordAt('reunion', 1, 236), wordAt('reunion', 2, 236)];   // 240.33 252.26 264.20
const T = { a: 236.6, her: 236.99, dream: 237.99, theres: 239.15, collapse: 266.0, end: 268.4 };
// when each chain of people is up: [rise, sink]
const ADULTS = [[RU[0], 247.9], [RU[1], 258.9], [RU[2], 266.5]];
const KIDS = [[RU[1] + .37, 258.6], [RU[2] + .2, 266.4]];
const BIGS = [239.93, 251.86, 263.8];   // "big": the sun swells

// ---- radii of the plates (at zoom 1) ----
const R = { A: 470, B: 380, Bbig: 528, C: 290, D: 188, E: 118, F: 96 };

// ---- shapes made once ----
const scallop = (r, n, depth) => { const p = new Path2D(); const N = n * 16;
  for (let i = 0; i <= N; i++) { const a = Math.PI * 2 * i / N; const rr = r - depth * (1 - Math.abs(Math.sin(a * n / 2)));
    i ? p.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : p.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  p.closePath(); return p; };
const DISC_A = scallop(R.A, 24, 16);
const HOUSE = poly([[-24, 0], [-24, -38], [0, -62], [24, -38], [24, 0]]);
const HOUSE_WIN = rect(-7, -32, 14, 16);
// her head (from the kit), as a cameo on the sun
const CAMEO = HEADS.her;

// ---- the cast for the paper-doll chains ----
const ex = (col, kind, head, hair, height) => ({ col, kind, head, hair, height });
const ADULT_UNIT = [CAST.her, CAST.friendA, ex(C.red, 'dress', 'her', null, .98), CAST.friendB,
  ex(C.leafDeep, 'shirt', 'short', null, 1.02), CAST.doctor];
const KID_UNIT = [CAST.girl11, ex(C.tealDeep, 'shirt', 'child', 'cap', .66), CAST.boy8,
  ex(C.plum, 'dressShort', 'child', 'pigtail', .7), { ...CAST.girl3, height: .56 }, ex(C.leafDeep, 'dressShort', 'child', 'pony', .72)];

// two-link arm IK in the puppet's arm space (+x forward, +y down, units). Returns [sh, el].
function reach(fx, fy, back) {
  const a1 = 168, a2 = 176; let d = Math.hypot(fx, fy); d = Math.min(d, a1 + a2 - .5); d = Math.max(d, 40);
  const th = Math.atan2(fx, fy);
  const E = Math.acos(clamp((d * d - a1 * a1 - a2 * a2) / (2 * a1 * a2), -1, 1)) * (back ? -1 : 1);
  return [th - Math.atan2(a2 * Math.sin(E), a1 + a2 * Math.cos(E)), E];
}

// A ring of N puppets holding hands. Feet on radius `rim`; out = +1 stands outward, -1 hangs inward
// (a mirror image across the rim). lift 0..1 = how far they have risen out of the rim.
function chain(unit, N, rim, s, out, rot, lift, t) {
  const m0 = g.getTransform();
  const hop = hit(sinceBeat(t), .11);                         // a little hop on every beat
  const people = [];
  for (let i = 0; i < N; i++) {
    const spec = unit[i % unit.length], h = spec.height || 1;
    const a = rot + Math.PI * 2 * i / N;
    const feet = rim + out * (1 - lift) * -1 * 1000 * h * s * 1.05;
    let m = m0.rotate(a * 180 / Math.PI).translate(0, -feet);
    if (out < 0) m = m.scale(1, -1);
    const bob = -hop * 26 * lift;
    const mp = m.translate(0, bob * s).scale(s * h, s * h);
    people.push({ spec, h, m, mp, bob, near: mp.transformPoint(new DOMPoint(8, -752)), far: mp.transformPoint(new DOMPoint(-8, -752)) });
  }
  for (let i = 0; i < N; i++) {
    const p = people[i], nx = people[(i + 1) % N], pv = people[(i - 1 + N) % N];
    // meeting points: halfway between my shoulder and the neighbour's, hands a touch lower
    const meet = (q, r) => new DOMPoint((q.x + r.x) / 2, (q.y + r.y) / 2);
    const inv = p.mp.translate(8, -752).inverse(), invF = p.mp.translate(-8, -752).inverse();
    let A1 = inv.transformPoint(meet(p.near, nx.far)), A2 = invF.transformPoint(meet(p.far, pv.near));
    if (A1.x < 0) [A1, A2] = [invF.transformPoint(meet(p.far, nx.near)), inv.transformPoint(meet(p.near, pv.far))];
    const legK = Math.sin(beatX(t) * Math.PI) * .16 * lift;
    p.pose = { arms: [reach(A1.x, A1.y + 30, false), reach(A2.x, A2.y + 30, true)], bob: p.bob,
      legs: [[legK, Math.max(0, legK) * .6], [-legK, Math.max(0, -legK) * .6]], head: -.04 * hop * lift };
  }
  for (const p of people) { g.setTransform(p.m); puppet(0, 0, s, 1, p.spec, p.pose); }
  g.setTransform(m0);
}

// clip to an annulus (for the mirrored kids, who rise out of the rim inward)
function annulus(r0, r1) { const p = new Path2D(); p.arc(0, 0, r1, 0, Math.PI * 2); p.moveTo(r0, 0); p.arc(0, 0, r0, 0, Math.PI * 2, true); return p; }

// rise/sink envelope for a [rise, sink] window
const upK = ([a, b], t) => eo((t - a + .12) / .55) * (1 - ei((t - b + .5) / .5));
const anyUp = (wins, t) => Math.max(...wins.map((w) => upK(w, t)));

SHOT(T.a, T.end, 'reunion2', (t) => {
  const A0 = g.globalAlpha;
  // intensity: builds through the first two lines, full in 255-266
  const I = lerp(.45, 1, ss(T.a, 255.7, t));
  // collapse: outer plates first, then the centre flies to the lamp
  const col = (i) => ei((t - 266.1 - i * .14) / .95);               // i = 0 outer .. 3 inner
  const toLamp = eio((t - 267.45) / .9);
  const Z = lerp(.9, 1, eo((t - T.a) / 3.6)) + .07 * ss(248.7, 256, t) + .012 * hit(sinceBar(t), .2) * I;
  const Zg = lerp(Z, LAMP.r / R.F, toLamp);
  const cx = lerp(CX, LAMP.x, toLamp), cy = lerp(CY, LAMP.y, toLamp);
  const spinUp = (k) => k * k * 3.2;                                 // plates whirl as they collapse

  const sz = (t0) => t < t0 ? 0 : back((t - t0) / .55);            // a plate slides out from under the one above
  // ---- ground: night navy, darkening to the kitchen's grey at the end ----
  sheet(C.navy); sheet(C.w0, ss(266.6, 268.1, t));
  // stars in the corners (from 15's night), going out as we collapse
  const starsOn = 1 - ss(266, 267.4, t);
  if (starsOn > 0) for (let i = 0; i < 18; i++) {
    const a = hash(i * 3.7) * Math.PI * 2, r = 600 + hash(i * 5.3) * 520;
    const sx = CX + Math.cos(a) * r * 1.25, sy = CY + Math.sin(a) * r * .9;
    if (sx < 20 || sx > W - 20 || sy < 20 || sy > H - 20) continue;
    const tw = .7 + .3 * Math.sin(t * 2.3 + i * 1.9);
    g.globalAlpha = A0 * starsOn * .9; g.fillStyle = hash(i * 1.7) > .7 ? C.goldPale : C.cream;
    g.fill(star4(sx, sy, (hash(i * 7.1) > .75 ? 11 : 6) * tw));
  }
  g.globalAlpha = A0;

  // ripples on the ground: gold rings riding out from the rosette on the downbeats (every beat when loud)
  const rip = (1 - ss(265.8, 266.6, t)) * ss(T.a, T.a + 1.5, t);
  if (rip > 0) {
    const rOut = Zg * Math.max(R.A * sz(T.theres), R.B * sz(238.85), R.C * sz(T.dream), R.D * sz(T.her), R.E);
    const every = I > .8 ? 2 : 4;
    for (let j = 0; j < 4; j++) {
      const x = Math.floor(beatX(t) / every) - j, tb = B0 + x * every * P, d = t - tb, life = 2.2;
      if (d < 0 || d > life) continue;
      const k = d / life, down = (x * every) % 4 === 0;
      g.save(); g.globalAlpha = A0 * rip * (1 - k) * (down ? .5 : .22);
      g.strokeStyle = down ? C.gold : C.goldPale; g.lineWidth = lerp(down ? 9 : 4, 1.5, k);
      g.beginPath(); g.arc(cx, cy, rOut + 20 + k * 620, 0, Math.PI * 2); g.stroke(); g.restore();
    }
  }

  const P0 = (sc) => { g.save(); g.translate(cx, cy); g.scale(Zg * sc, Zg * sc); };
  const shrink = (i, r) => lerp(1, R.E / r, col(i));

  // ---- A: the scalloped crown, a ring of little lit houses ----
  const sA = sz(T.theres) * shrink(0, R.A) * (1 + .014 * hit(sinceBeat(t) - .09) * I);
  if (sA > .01) {
    P0(sA); g.rotate(t * .045 + spinUp(col(0)));
    cut(DISC_A, C.roseDeep, { sh: 1, lift: .6 });
    for (let i = 0; i < 12; i++) {
      const on = pop(t, T.theres + .25 + i * .05, .4) * (1 - col(0));
      if (on <= .01) continue;
      g.save(); g.rotate(Math.PI * 2 * i / 12); g.translate(0, -(R.B + 8)); g.scale(on, on);
      cut(HOUSE, C.cream, { sh: .5, grain: .12 });
      cut(HOUSE_WIN, (Math.floor(beatX(t) / 2) + i) % 3 ? C.gold : C.goldPale, { sh: 0, grain: 0 });
      g.restore();
    }
    g.restore();
  }

  // ---- B: the cream plate. It widens to carry the people on each "reunion" ----
  const adultsUp = anyUp(ADULTS, t);
  const bigK = eio(anyUp(ADULTS.map(([a, b]) => [a - .25, b + .35]), t));
  const rB = lerp(R.B, R.Bbig, bigK);
  const sB = sz(238.85) * shrink(1, rB) * (1 + .012 * hit(sinceBeat(t) - .06) * I);
  if (sB > .01) { P0(sB); cut(circle(0, 0, rB), C.cream, { sh: .9, lift: .5 }); g.restore(); }

  // birds orbiting on B; they fly off the plate when the people come, and back when they go
  if (sB > .01) {
    P0(sB * (R.B / rB) * 1);
    const orbit = -t * .42 - spinUp(col(1)) * 1.3;
    for (let i = 0; i < 8; i++) {
      // radial excursion: out to the edge of the frame on a rise, home again after the sink
      // they first come home when the first chain sinks, and do not come back after the last
      let away = 0;
      ADULTS.forEach(([a, b], j) => { const o = j ? ei((t - a + .3) / .8) : 1, back_ = j < 2 ? eo((t - b - .2 - i * .05) / 1.1) : 0; away = Math.max(away, o * (1 - back_)); });
      const r = 336 + away * (560 + hash(i) * 200);
      const a = orbit + Math.PI * 2 * i / 8 + away * .4;
      const ph = beatX(t) * Math.PI + i * .5;
      if (away > .97) continue;
      g.save(); g.rotate(a); g.translate(0, -r); g.globalAlpha = A0 * (1 - away) ** 1.5;
      bird(0, 0, .78 + away * .5, ph, C.tealDeep, -1);
      g.restore();
    }
    g.globalAlpha = A0;
    g.restore();
  }

  // ---- the grown-ups' chain, standing on C's rim (drawn under C, so they rise out from behind it) ----
  const sC = sz(T.dream) * shrink(2, R.C) * (1 + .016 * hit(sinceBeat(t) - .03) * I);
  if (adultsUp > 0 && sC > .01) {
    P0(sC);
    const rot = ratchet(t, 2) * Math.PI * 2 / 48 + spinUp(col(2));
    chain(ADULT_UNIT, 24, R.C - 4, .2, 1, rot, adultsUp, t);
    g.restore();
  }

  // ---- C: rose plate, oranges and gold moons (they fold away for the kids) ----
  const kidsUp = anyUp(KIDS, t);
  if (sC > .01) {
    P0(sC); const rot = ratchet(t, 2) * Math.PI * 2 / 24 + spinUp(col(2));
    cut(circle(0, 0, R.C), C.rose, { sh: 1, lift: .4 });
    g.rotate(rot);
    for (let i = 0; i < 12; i++) {
      const on = pop(t, T.dream + .15 + i * .04, .45);
      let fold = 0; for (const [a, b] of KIDS) fold = Math.max(fold, ei((t - a + .45 - i * .02) / .3) * (1 - eo((t - b - .1 - i * .03) / .4)));
      const k = on * (1 - fold) * (1 - col(2)); if (k <= .01) continue;
      g.save(); g.rotate(Math.PI * 2 * i / 12); g.translate(0, -(R.C - 52)); g.scale(k, k);
      if (i % 2) { g.rotate(Math.PI); orange(0, 0, 25); }
      else cut(crescent(0, 0, 28, .3, -Math.PI / 2), C.gold, { sh: .5, grain: .1 });
      g.restore();
    }
    g.restore();
  }

  // ---- the kids' chain: a mirror image of the grown-ups, hanging inward from C's rim ----
  if (kidsUp > 0 && sC > .01) {
    P0(sC);
    g.clip(annulus(R.D - 2, R.C - 3), 'evenodd');
    const rot = -ratchet(t, 2) * Math.PI * 2 / 48 + Math.PI / 24 - spinUp(col(2));
    chain(KID_UNIT, 24, R.C - 4, .128, -1, rot, kidsUp, t);
    g.restore();
  }

  // ---- D: cream plate of flowers ----
  const sD = sz(T.her) * shrink(3, R.D) * (1 + .02 * hit(sinceBeat(t)) * I);
  if (sD > .01) {
    P0(sD); cut(circle(0, 0, R.D), C.cream, { sh: 1, lift: .3 });
    g.rotate(-ratchet(t, 4) * Math.PI * 2 / 12 - spinUp(col(3)) * 1.2);
    for (let i = 0; i < 6; i++) {
      const on = pop(t, T.her + .2 + i * .06, .45) * (1 - col(3)); if (on <= .01) continue;
      g.save(); g.rotate(Math.PI * 2 * i / 6); g.translate(0, -(R.D - 44)); g.scale(on, on);
      const bloom = 1 + .1 * hit(sinceBar(t) - i * .02, .25) * I;
      petals(34 * bloom, C.roseDeep, C.gold, t * .3 + i);
      g.restore();
    }
    g.restore();
  }

  // ---- E/F: the sun with her profile, at the hub. It becomes the lamp. ----
  {
    const sunK = pop(t, T.a - .1, .5);
    let big = 0; for (const b of BIGS) big = Math.max(big, bump(t, b - .05, .7));
    const pulse = 1 + .03 * hit(sinceBeat(t)) * I + .09 * big;
    P0(sunK * pulse);
    const eK = 1 - ss(267.5, 267.85, t);                          // the gold ring folds into the sun
    if (eK > .01) cut(circle(0, 0, R.E), C.gold, { sh: .8, lift: .3, alpha: eK });
    cut(circle(0, 0, R.F), toLamp > 0 ? mix(C.sun, C.lamp, toLamp) : C.sun, { sh: .6 * (1 - toLamp), grain: .2 });
    // her profile, a cameo on the sun; she turns her face up on each "reunion"
    const camK = 1 - ss(266.6, 267.4, t);
    if (camK > 0) {
      g.save(); g.clip(circle(0, 0, R.F - 1));
      let up = 0; for (const r of RU) up = Math.max(up, bump(t, r - .1, 1.6));
      g.translate(-6, 30); g.rotate(-.12 * up); g.scale(.155, .155); g.translate(-540, -600);
      g.globalAlpha = A0 * camK; cut(CAMEO, C.navy, { sh: .4, grain: .2 });
      g.restore();
    }
    g.restore();
  }

  // the lamp's glow, arriving as the rosette is gone
  const glow = ss(267.6, 268.4, t);
  if (glow > 0) {
    g.save(); g.globalAlpha = A0 * glow * .6;
    const gr = g.createRadialGradient(LAMP.x, LAMP.y, 10, LAMP.x, LAMP.y, 300);
    gr.addColorStop(0, 'rgba(243,217,160,.75)'); gr.addColorStop(1, 'rgba(243,217,160,0)');
    g.fillStyle = gr; g.fill(circle(LAMP.x, LAMP.y, 300)); g.restore();
  }

  // gold laugh rings from the hub on each "reunion" (over everything, the chorus' joy)
  // (the kit's laughRings start at the centre and would cross her face; these start at the sun's rim)
  for (const r of RU) for (let j = 0; j < 3; j++) {
    const d = t - r - j * .16, life = 2.2; if (d < 0 || d > life) continue;
    const k = d / life;
    g.save(); g.globalAlpha = A0 * (1 - k) * .9; g.strokeStyle = j % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(16, 3, k) * Zg;
    g.beginPath(); g.arc(cx, cy, (R.E + 14 + eo(k) * 640) * Zg, 0, Math.PI * 2); g.stroke(); g.restore();
  }
}, { xin: 1.1, tr: 'iris' });

// a five-petal flower with distinct petals, at the origin
function petals(r, col, centre, rot) {
  const p = new Path2D();
  for (let i = 0; i < 5; i++) {   // moveTo first: Path2D.ellipse would otherwise join the petals with lines (kit flowerPath does)
    const a = rot + Math.PI * 2 * i / 5, x = Math.cos(a) * r * .58, y = Math.sin(a) * r * .58;
    p.moveTo(x + Math.cos(a) * r * .44, y + Math.sin(a) * r * .44); p.ellipse(x, y, r * .44, r * .27, a, 0, Math.PI * 2); }
  cut(p, col, { sh: .6 }); cut(circle(0, 0, r * .24), centre, { sh: .3, grain: .1 });
}
// colour mix for two #rrggbb papers
function mix(a, b, k) {
  const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const x = p(a), y = p(b); return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(',')})`;
}
})();
