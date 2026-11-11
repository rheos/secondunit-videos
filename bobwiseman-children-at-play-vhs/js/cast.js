// cast.js · the kids of "Children at Play" as back-lit silhouettes.
// A camcorder pointed into a low sun turns every child into one dark shape with a warm rim, so no face is ever
// drawn. Each kid is ONE silhouette: tube limbs that bend in one smooth curve through the knee or elbow, a torso
// with shoulders and a waist, clothes and hair that change the outline (dress flare, shorts, ponytail, cap brim,
// sun hat). A small nose bump shows which way a profile faces; front and back views have none.
//
// Local units: feet on y = 0, y grows downward, a standing kid is about 100 units tall. drawKid() scales by h/100.
// Poses are plain objects of points; pose functions below make them from a phase so drawing stays pure in t.
(function () {
  const TAU = Math.PI * 2;
  const rad = (d) => d * Math.PI / 180;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  const len = (a) => Math.hypot(a[0], a[1]);
  const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
  const dirv = (deg) => [Math.sin(rad(deg)), Math.cos(rad(deg))];  // 0 deg = straight down, + = forward (right)
  const lerp = (a, b, k) => a + (b - a) * k;
  const lerpP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // A tube through three points: the curve passes through the middle point (knee, elbow).
  function tube(g, a, m, b, w0, w1) {
    const c = [2 * m[0] - (a[0] + b[0]) / 2, 2 * m[1] - (a[1] + b[1]) / 2];
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.lineWidth = w1; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(c[0], c[1], b[0], b[1]); g.stroke();
    if (w0 > w1) {  // thicker upper half: thigh into calf, upper arm into forearm
      const h = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2], mid = [(a[0] + 2 * c[0] + b[0]) / 4, (a[1] + 2 * c[1] + b[1]) / 4];
      g.lineWidth = w0; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(h[0], h[1], mid[0], mid[1]); g.stroke();
    }
  }
  function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); g.fill(); }

  // The kids. size scales the whole figure (the hider is the smallest).
  const KIDS = {
    swing:   { name: 'Swing girl',    hair: 'ponytail', outfit: 'dress',  size: 1.0 },
    slide:   { name: 'Slide boy',     hair: 'cap',      outfit: 'shorts', size: 1.05 },
    tagA:    { name: 'Tag, runner',   hair: 'pigtails', outfit: 'skirt',  size: 0.95 },
    tagB:    { name: 'Tag, chaser',   hair: 'mop',      outfit: 'shorts', size: 1.1 },
    bars:    { name: 'Monkey bars',   hair: 'bob',      outfit: 'shorts', size: 1.0 },
    sand:    { name: 'Sandbox',       hair: 'crop',     outfit: 'shorts', size: 0.85 },
    hider:   { name: 'The hider (you)', hair: 'sunhat', outfit: 'dress', size: 0.9 },
  };

  // Draw one kid. pose: { hip, chest, head, armF:[elbow,hand], armB:[elbow,hand], legF:[knee,foot], legB:[knee,foot],
  // face: -1|0|1, hairSwing, hem, props: [] }. "F" limbs are the near side, drawn last; "B" the far side.
  function drawKid(g, kid, pose, x, y, h, color) {
    const s = h / 100 * (kid.size || 1);
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = color; g.strokeStyle = color;
    const { hip, chest, head } = pose;
    const ax = norm(sub(chest, hip));            // torso axis, hip -> chest
    const n = [-ax[1], ax[0]];                   // across the torso
    const face = pose.face || 0;
    const wide = face === 0 ? 1 : 0.72;          // a profile shows a narrower body
    const sh = (side, w) => add(chest, add(mul(n, side * w * wide), mul(ax, -2)));
    const hp = (side, w) => add(hip, mul(n, side * w * wide));
    const legRoot = (side) => add(hip, add(mul(n, side * 4.4 * wide), mul(ax, 3)));
    // far limbs first
    const limb = (which, side) => {
      const L = pose[which]; if (!L) return;
      if (which[0] === 'l') {
        tube(g, legRoot(side), L[0], L[1], 10.4, 7.4);
        const toe = pose.toe != null ? pose.toe : (face || 1);
        ell(g, L[1][0] + toe * 2.6, L[1][1] - 1.4, 6.0, 3.5, 0);
      } else {
        tube(g, sh(side, 8.4), L[0], L[1], 7.6, 6.0);
        ell(g, L[1][0], L[1][1], 3.9, 3.9);
      }
    };
    const back = face === 0 ? -1 : -face, front = -back;
    limb('legB', back); limb('armB', back);
    // torso: shoulders, waist, hips
    const waist = lerpP(hip, chest, 0.4);
    g.beginPath();
    const p1 = sh(-1, 10.4), p2 = sh(1, 10.4), w1 = add(waist, mul(n, -8.6 * wide)), w2 = add(waist, mul(n, 8.6 * wide));
    const h1 = hp(-1, 9.0), h2 = hp(1, 9.0);
    const top = add(chest, mul(ax, 4.5));
    g.moveTo(p1[0], p1[1]); g.quadraticCurveTo(top[0], top[1], p2[0], p2[1]);
    g.quadraticCurveTo(w2[0] + n[0] * 0.6, w2[1] + n[1] * 0.6, h2[0], h2[1]);
    g.lineTo(h1[0], h1[1]);
    g.quadraticCurveTo(w1[0] - n[0] * 0.6, w1[1] - n[1] * 0.6, p1[0], p1[1]);
    g.fill();
    // clothes that change the outline
    const down = mul(ax, -1);
    if (kid.outfit === 'dress' || kid.outfit === 'skirt') {
      const flare = (kid.outfit === 'dress' ? 15 : 13.5) * (face === 0 ? 1 : 0.85), drop = kid.outfit === 'dress' ? 17 : 12;
      const sway = pose.hem || 0;
      const a1 = add(waist, mul(n, -8.2 * wide)), a2 = add(waist, mul(n, 8.2 * wide));
      const b1 = add(add(hip, mul(down, drop)), add(mul(n, -flare), [sway, 0]));
      const b2 = add(add(hip, mul(down, drop)), add(mul(n, flare), [sway, 0]));
      const hemMid = add(add(hip, mul(down, drop + 2.5)), [sway * 1.2, 0]);
      g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(b1[0], b1[1]);
      g.quadraticCurveTo(hemMid[0], hemMid[1], b2[0], b2[1]); g.lineTo(a2[0], a2[1]); g.closePath(); g.fill();
    } else if (kid.outfit === 'shorts') {
      const a1 = hp(-1, 9.4), a2 = hp(1, 9.4);
      const kF = pose.legF ? pose.legF[0] : add(hip, mul(down, 20)), kB = pose.legB ? pose.legB[0] : kF;
      const r1 = legRoot(back), r2 = legRoot(front);
      const e1 = lerpP(r1, kB, 0.42), e2 = lerpP(r2, kF, 0.42);
      g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]);
      g.lineTo(e2[0] + 6, e2[1]); g.lineTo(e2[0] - 6, e2[1]);
      g.lineTo(e1[0] + 6, e1[1]); g.lineTo(e1[0] - 6, e1[1]); g.closePath(); g.fill();
      tube(g, r1, lerpP(r1, e1, 0.5), e1, 0, 13); tube(g, r2, lerpP(r2, e2, 0.5), e2, 0, 13);
    }
    // neck and head
    g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.moveTo(chest[0], chest[1]); g.lineTo(lerp(chest[0], head[0], 0.6), lerp(chest[1], head[1], 0.6)); g.stroke();
    const R = 12.4;
    ell(g, head[0], head[1], R * (face === 0 ? 1 : 0.96), R * 1.04);
    if (face !== 0) {  // profile: jaw forward, small nose bump
      g.beginPath();
      g.moveTo(head[0] + face * 6, head[1] - 6);
      g.quadraticCurveTo(head[0] + face * 12.6, head[1] - 1, head[0] + face * 13.6, head[1] + 1.2);
      g.lineTo(head[0] + face * 11.2, head[1] + 3.0);
      g.quadraticCurveTo(head[0] + face * 11.6, head[1] + 8, head[0] + face * 6, head[1] + 10.4);
      g.closePath(); g.fill();
    }
    drawHair(g, kid.hair, head, R, face, pose.hairSwing || 0);
    // near limbs last
    limb('legF', front); limb('armF', front);
    if (pose.props) for (const pr of pose.props) pr(g);
    g.restore();
  }

  function drawHair(g, hair, hd, R, face, swing) {
    const [x, y] = hd, f = face;
    if (hair === 'ponytail') {
      ell(g, x - f * 1.2, y - 3.5, R * 1.06, R * 0.95);            // hair cap, a touch bigger than the head
      const bx = f === 0 ? 0 : -f;                                    // the tail hangs behind the head
      const base = [x + bx * R * 0.85, y - 6];
      const tip = [base[0] + bx * 9 + Math.sin(swing) * 11, base[1] + 17 - Math.abs(Math.sin(swing)) * 4];
      g.beginPath(); g.moveTo(base[0] - 3.6, base[1] - 1);
      g.bezierCurveTo(base[0] + bx * 8 - 2, base[1] + 2, tip[0] + bx * 3, tip[1] - 6, tip[0], tip[1]);
      g.bezierCurveTo(tip[0] - bx * 4, tip[1] - 4, base[0] + 2, base[1] + 6, base[0] + 3.6, base[1] + 3); g.closePath(); g.fill();
      ell(g, base[0], base[1] + 1, 3.6, 3.6);                          // the band knot
    } else if (hair === 'cap') {
      ell(g, x, y - 4.5, R * 1.04, R * 0.82);
      if (f !== 0) { g.beginPath(); g.moveTo(x + f * 4, y - 7.6); g.lineTo(x + f * 21, y - 6.2); g.lineTo(x + f * 20, y - 3.4); g.lineTo(x + f * 4, y - 4.2); g.closePath(); g.fill(); }
      else { ell(g, x, y - 13.6, 2.4, 2); }                           // button on top, seen from behind
    } else if (hair === 'pigtails') {
      ell(g, x, y - 3, R * 1.04, R * 0.92);
      for (const sd of [-1, 1]) {
        const k = f === 0 ? sd : (sd === -f ? 1 : 0.55);
        const b = [x + sd * (R - 0.5) * (f === 0 ? 1 : 0.7), y - 1], a = swing * 0.8 + sd * 0.25;
        const t = [b[0] + Math.sin(a) * 9 * k + sd * 3, b[1] + Math.cos(a) * 13];
        g.beginPath(); g.moveTo(b[0], b[1] - 3); g.quadraticCurveTo(t[0] + sd * 4, t[1] - 5, t[0], t[1]); g.quadraticCurveTo(t[0] - sd * 3, t[1] - 2, b[0], b[1] + 3); g.closePath(); g.fill();
      }
    } else if (hair === 'mop') {
      for (let i = 0; i < 9; i++) { const a = rad(-170 + i * 20 + (f * 10)); ell(g, x + Math.cos(a) * R * 0.98, y - 2 + Math.sin(a) * R * 1.02, 4.6, 4.6); }
      ell(g, x, y - 3, R * 1.02, R * 0.9);
    } else if (hair === 'bob') {
      g.beginPath();
      g.moveTo(x - R * 1.12, y + 4); g.quadraticCurveTo(x - R * 1.25, y - R * 1.35, x, y - R * 1.2);
      g.quadraticCurveTo(x + R * 1.25, y - R * 1.35, x + R * 1.12, y + 4); g.lineTo(x + R * 0.6, y + 5); g.lineTo(x - R * 0.6, y + 5); g.closePath(); g.fill();
    } else if (hair === 'crop') {
      ell(g, x - f * 1.5, y - 2.5, R * 1.05, R * 0.98);
      if (f !== 0) { ell(g, x - f * 1, y - 2, 2.6, 3.6); }            // ear
    } else if (hair === 'sunhat') {
      ell(g, x - f * 2, y + 2, R * 0.86, R * 0.62);                    // hair under the brim, chin length
      ell(g, x + f * 0.5, y - 10, R * 0.98, R * 0.86);                 // the crown, a round dome
      const dr = swing * 2.5, tl = f * 1.2;                            // brim: one wide flat oval, soft droop
      g.beginPath();
      g.moveTo(x - 24, y - 3 + dr - tl);
      g.bezierCurveTo(x - 24, y - 9 - tl, x - 10, y - 10, x, y - 10);
      g.bezierCurveTo(x + 10, y - 10, x + 24, y - 9 + tl, x + 24, y - 3 + dr + tl);
      g.bezierCurveTo(x + 24, y + 1 + dr + tl, x + 10, y - 1, x, y - 1);
      g.bezierCurveTo(x - 10, y - 1, x - 24, y + 1 + dr - tl, x - 24, y - 3 + dr - tl);
      g.closePath(); g.fill();
    }
  }

  // ---- poses -----------------------------------------------------------------------------------------------
  // All take a phase or a 0..1 amount and return a pose for a kid facing d (1 right, -1 left, 0 front/back).
  const M = (p, d) => d < 0 ? [-p[0], p[1]] : p;  // mirror a point for a left-facing kid

  function stand(d = 0, o = {}) {
    const hip = [0, -47], chest = [0, -77], head = [0, -90];
    const sx = d === 0 ? 1 : 0.45;
    return {
      hip, chest, head, face: d,
      legB: [[-5 * sx, -24], [-6 * sx, -1]], legF: [[5 * sx, -24], [6 * sx, -1]],
      armB: [[-15 * sx, -62], [-16 * sx, -49]], armF: [[15 * sx, -62], [16 * sx, -49]],
      ...o,
    };
  }

  // Run: phase 0..1 per stride pair. lean in degrees.
  function run(phase, d = 1, o = {}) {
    const e = (o.energy == null ? 1 : o.energy);
    const bob = Math.abs(Math.sin(phase * TAU)) * 3.2 * e;
    const hip = [0, -45 - bob];
    const lean = 12 * e;
    const chest = add(hip, mul(dirv(180 - lean), 30));
    const head = add(chest, mul(dirv(180 - lean * 0.7), 13));
    const leg = (ps) => {
      const a = 34 * e * Math.sin(ps * TAU);
      const back = Math.max(0, Math.cos(ps * TAU));            // recovery: knee folds as the leg swings forward
      const bend = 14 + 72 * e * back * back;
      const knee = add(hip, mul(dirv(a), 21));
      const foot = add(knee, mul(dirv(a - bend), 22));
      return [knee, foot];
    };
    const arm = (ps) => {
      const c = -38 * e * Math.sin(ps * TAU);
      const elbow = add(chest, add([0, 2], mul(dirv(c), 13.5)));
      const hand = add(elbow, mul(dirv(c + 95), 12));
      return [elbow, hand];
    };
    const L1 = leg(phase), L2 = leg(phase + 0.5), A1 = arm(phase + 0.5), A2 = arm(phase);
    const p = { hip, chest, head, face: d || 1, legF: L1, legB: L2, armF: A1, armB: A2, hairSwing: -0.35 * e + 0.15 * Math.sin(phase * TAU * 2), hem: -2 * e };
    if (d < 0) for (const k of ['hip', 'chest', 'head']) p[k] = M(p[k], d);
    if (d < 0) for (const k of ['legF', 'legB', 'armF', 'armB']) p[k] = p[k].map((q) => M(q, d));
    if (d < 0) p.hairSwing = -p.hairSwing, p.hem = -p.hem;
    return Object.assign(p, o.extra || {});
  }

  // Sit on a swing seat at the origin (hip on the seat), hands on the chains going up through x = 0.
  // pump 0 = legs tucked under (back swing), 1 = legs straight out (front swing). lean in degrees, + = lying back.
  function swingSit(pump, d = 1, lean = 0) {
    const hip = [0, -1];
    const chest = add(hip, mul(dirv(180 + lean), 29));
    const head = add(chest, mul(dirv(180 + lean * 0.8), 13));
    const kneeOut = [lerp(14, 17, pump), lerp(4, -3, pump)];
    const footOut = [lerp(11, 36, pump), lerp(25, -6, pump)];
    const p = {
      hip, chest, head, face: d,
      legF: [kneeOut, footOut], legB: [add(kneeOut, [-2, 1]), add(footOut, [-3, 1.5])],
      armF: [add(chest, [7, 6]), [1.5, -38]], armB: [add(chest, [5, 7]), [0.5, -37]],
      hairSwing: lean * 0.02, hem: 3 * pump, toe: 1,
    };
    return mirrorPose(p, d);
  }

  // Sitting on a slide or a ledge: hip at origin, legs out along the slope (slope in degrees, + = downhill ahead).
  function slideSit(slope, armsUp, d = 1) {
    const hip = [0, -1];
    const chest = add(hip, mul(dirv(180 + 12 - slope * 0.3), 29));
    const head = add(chest, mul(dirv(180 + 8), 13));
    const dv = dirv(90 + slope);
    const knee = add(hip, mul(dv, 19)), foot = add(knee, mul(dirv(90 + slope + 8), 21));
    // arms down: hands on the slide edges; arms up: a wide V over the head, near arm forward, far arm back
    const up = (fx, bx) => [add(chest, [lerp(9, fx * 0.55, armsUp), lerp(9, -15, armsUp)]), add(chest, [lerp(14, fx, armsUp), lerp(24, -33, armsUp)])];
    const p = { hip, chest, head, face: d, legF: [knee, foot], legB: [add(knee, [-2, 1]), add(foot, [-2, 1])], armF: up(19, 0), armB: up(-12, 0), hairSwing: -0.3, toe: 1 };
    return mirrorPose(p, d);
  }

  // Sitting on the top platform, legs dangling over the edge and kicking.
  function ledgeSit(kick, d = 1) {
    const hip = [0, -1];
    const chest = add(hip, mul(dirv(180 - 6), 29));
    const head = add(chest, mul(dirv(180 - 4), 13));
    const k1 = [15, 1], k2 = [14, 1.5];
    const f1 = add(k1, mul(dirv(lerp(-10, 40, kick)), 20)), f2 = add(k2, mul(dirv(lerp(40, -10, kick)), 20));
    const p = { hip, chest, head, face: d, legF: [k1, f1], legB: [k2, f2], armF: [add(chest, [3, 14]), [8, 1]], armB: [add(chest, [-4, 13]), [-6, 1]], toe: 1 };
    return mirrorPose(p, d);
  }

  // Climbing a ladder rung by rung: phase 0..1 per step, facing the ladder (side view).
  function climb(phase, d = 1) {
    const s = Math.sin(phase * TAU);
    const hip = [0, -46], chest = add(hip, mul(dirv(180 - 10), 30)), head = add(chest, mul(dirv(180 - 4), 13));
    const kneeA = [9, lerp(-26, -36, Math.max(0, s))], footA = [7, lerp(-2, -16, Math.max(0, s))];
    const kneeB = [9, lerp(-26, -36, Math.max(0, -s))], footB = [7, lerp(-2, -16, Math.max(0, -s))];
    const handA = [14, lerp(-86, -102, Math.max(0, -s))], handB = [13, lerp(-86, -102, Math.max(0, s))];
    const p = { hip, chest, head, face: d, legF: [kneeA, footA], legB: [kneeB, footB],
      armF: [add(chest, [8, -2]), handA], armB: [add(chest, [7, 0]), handB], toe: 1 };
    return mirrorPose(p, d);
  }

  // Hanging from a bar, seen from the front: origin is the bar between the hands. Arms make a Y round the
  // head, legs kick like riding a bike. phase 0..1 per kick; shift slides the body under one hand.
  function hang(phase, d = 0, shift = 0) {
    const sw = Math.sin(phase * TAU), cw = Math.cos(phase * TAU);
    const hA = [-14 + shift, 0], hB = [14 + shift, 0];
    const chest = [shift * 0.6 + sw * 1.5, 34], hip = add(chest, [sw * 2.5, 30]);
    const head = add(chest, [sw * 0.6, -12]);
    const kneeL = add(hip, [-5, lerp(15, 9, Math.max(0, sw))]), kneeR = add(hip, [5, lerp(15, 9, Math.max(0, -sw))]);
    const footL = add(kneeL, [-2, lerp(21, 12, Math.max(0, sw)) + 2]), footR = add(kneeR, [2, lerp(21, 12, Math.max(0, -sw)) + 2]);
    void cw;
    return { hip, chest, head, face: 0,
      armB: [add(chest, [-16, -14]), hA], armF: [add(chest, [16, -14]), hB],
      legB: [kneeL, footL], legF: [kneeR, footR], toe: 0, hem: sw * 2 };
  }

  // Sitting in the sand, back three-quarters, scooping with a spade. dig 0..1 one scoop.
  function dig(phase, d = -1) {
    const sc = 0.5 - 0.5 * Math.cos(phase * TAU);
    // sitting with knees up in front, leaning in to scoop; spade hand goes from the knees down into the sand
    const hip = [0, -9], chest = add(hip, mul(dirv(180 - 8 - 22 * sc), 29)), head = add(chest, mul(dirv(180 - 14 - 20 * sc), 13));
    const hand = [lerp(18, 30, sc), lerp(-28, -4, sc)];
    const elbow = add(chest, [lerp(12, 15, sc), lerp(12, 15, sc)]);
    const spade = (g) => {
      g.lineWidth = 2.6; g.beginPath(); g.moveTo(hand[0], hand[1]); g.lineTo(hand[0] + 7, hand[1] + 7); g.stroke();
      g.beginPath(); g.ellipse(hand[0] + 9.5, hand[1] + 9.5, 4.2, 2.6, rad(45), 0, TAU); g.fill();
    };
    const p = { hip, chest, head, face: 1, legF: [[16, -22], [22, -1]], legB: [[13, -20], [17, 0]],
      armF: [elbow, hand], armB: [add(chest, [9, 13]), [17, -18]], props: [spade], toe: 1 };
    return mirrorPose(p, d);
  }

  // Leaning out from behind something to the right (d = 1) or left: lean 0..1.
  function peek(lean, d = 1, o = {}) {
    const tilt = 30 * lean;
    const hip = [0, -47];
    const chest = add(hip, mul(dirv(180 - tilt * d), 30));
    const head = add(chest, mul(dirv(180 - tilt * 1.4 * d), 13));
    const p = { hip, chest, head, face: 0,
      legB: [[-3.5, -24], [-4.5, -1]], legF: [[3.5 + 3 * lean * d, -24], [5 + 5 * lean * d, -1]],
      armB: [add(chest, [-12 * d + 4 * lean * d, 13]), add(chest, [-10 * d + 12 * lean * d, 22])],
      armF: [add(chest, [8 * d, 8]), add(chest, [lerp(12, 18, lean) * d, lerp(18, -4, lean)])],
      hairSwing: 0.4 * lean, ...o };
    return p;
  }

  // Standing, waving: phase 0..1 per wave, hop 0..1 a little jump.
  function wave(phase, d = 0, hop = 0, side = 1) {
    const p = stand(d);
    const lift = -Math.abs(Math.sin(hop * Math.PI)) * 9;
    for (const k of ['hip', 'chest', 'head']) p[k] = add(p[k], [0, lift]);
    for (const k of ['legF', 'legB']) p[k] = [add(p[k][0], [0, lift * 0.8]), add(p[k][1], [0, lift * 0.6])];
    for (const k of ['armB']) p[k] = [add(p[k][0], [0, lift]), add(p[k][1], [0, lift])];
    const a = 22 * Math.sin(phase * TAU);
    const sh = add(p.chest, [9 * side, 0]);
    const elbow = add(sh, [16 * side, -10]);
    const hand = add(elbow, mul(dirv(180 - a * side - 6 * side), 15));
    p.armF = [elbow, hand];
    p.hairSwing = 0.15 * Math.sin(phase * TAU);
    return p;
  }

  function mirrorPose(p, d) {
    if (d >= 0) return p;
    const q = { ...p };
    for (const k of ['hip', 'chest', 'head']) q[k] = M(p[k], d);
    for (const k of ['legF', 'legB', 'armF', 'armB']) if (p[k]) q[k] = p[k].map((v) => M(v, d));
    if (p.props) q.props = p.props.map((pr) => (g) => { g.save(); g.scale(-1, 1); pr(g); g.restore(); });
    q.face = p.face === 0 ? 0 : -Math.abs(p.face);
    if (p.toe) q.toe = -p.toe;
    return q;
  }

  window.CAST = { KIDS, drawKid, poses: { stand, run, swingSit, slideSit, ledgeSit, climb, hang, dig, peek, wave }, ss, lerp };
})();
