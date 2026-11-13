// scenes/brother.js · verse 3b, the betrayal (AUG.09 1992, sunset). Take A: the BROTHER has the camcorder (kid height,
// wobbly): he peeks round the corner of the house and films you and me tiptoeing to the back gate with the cookie jar;
// we turn, I go shh, his own hand gives a big thumbs-up into the lens: he won't tell. Then the tape REWINDS on screen
// (picture racing backwards, search-noise bands) and plays a NEW take, the camcorder set on the porch rail: mother
// marches across the yard pointing, we freeze at the gate, I hand over the jar, and the brother walks into frame and
// stands with his arms crossed, watching. Pure in t. World units: the 960x720 frame at zoom 1.
(function () {
  const T = window.TIMING, S = T.scenes;
  const { KIDS, drawKid, poses: P, lerpPose } = window.CAST;
  const TAU = Math.PI * 2;
  const T0 = S.brother, T1 = S.hayloft;

  // ---- hits (song seconds) -------------------------------------------------------------------------------
  const SNEAK = 172.46;      // first word, held: you and me start tiptoeing to the gate
  const LYING2 = 176.10;
  const AT_GATE = 181.70;    // we reach the gate
  const TURN = 182.56;       // we turn and see him
  const TELL = 183.74;       // his thumbs-up lands in the lens, on the word
  const SHH = 183.05;        // my finger goes to my mouth
  const [RW0, RW1] = T.rewind;          // 185.40 to 190.30, the tape rewinds on screen
  const RW_TO = 168.30;                  // where the rewind lands (just after the take's first frames)
  const TAKE_B = RW1;                    // the new take, camcorder on the porch rail
  const GOES = 190.36;       // mother marches in
  const BETRAYS = 192.56;    // her arm comes up pointing; we whip round and freeze
  const US = 194.04;         // she stops at us, a last jab
  const HAND_OVER = 197.60;  // I hold out the jar; she takes it
  const JEALOUSY = 201.18;   // the brother walks in from the camera side
  const CROSSED = 202.70;    // he stops, back to us, arms crossed

  // ---- the yard --------------------------------------------------------------------------------------------
  const HOR = 380;                    // eye level of a kid-held camcorder
  const FENCE_TOP = 318, FENCE_BASE = 452;
  const GATE = [640, 764];
  const SUN = [722, 300];             // the low sun, just over the fence top behind the gate
  const WALL_X = 300;                 // the house corner the brother peeks round (take A only)
  const kidH = (y) => 1.29 * (y - HOR);
  const COL = { kid: '#261a1e', wall: '#2a2024', post: '#2a1e18', jar: '#2a1c1a' };

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const sm = (x) => x * x * (3 - 2 * x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const lp = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const dirv = (deg) => [Math.sin(deg * Math.PI / 180), Math.cos(deg * Math.PI / 180)];
  const hash = (a, b) => { const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return x - Math.floor(x); };
  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  }
  function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); g.fill(); }

  // the tape: before the rewind it plays; during it the picture runs backwards about 3.5x; after it, take B
  function tape(t) {
    if (t < RW0 || t >= RW1) return t;
    // the reels spin up over the first 12%, run flat out, and brake over the last 10%
    const u = (t - RW0) / (RW1 - RW0), a = 0.12, b = 0.10, tot = 1 - a / 2 - b / 2;
    const F = u < a ? u * u / (2 * a) : u <= 1 - b ? a / 2 + (u - a) : a / 2 + (1 - b - a) + b / 2 - (1 - u) ** 2 / (2 * b);
    return RW0 - (RW0 - RW_TO) * clamp(F / tot, 0, 1);
  }

  // ---- scenery, laid out once -----------------------------------------------------------------------------
  const R = rng(19920809);
  const boards = [];
  for (let x = -900; x < 2000; ) {
    const w = 11 + R() * 2.5, gap = 0.5 + R() * 1.9;
    if (x + w > GATE[0] - 6 && x < GATE[1] + 6) { x = GATE[1] + 6; continue; }
    boards.push([x, w - gap]); x += w;
  }
  const posts = [];
  for (let x = -880; x < 2000; x += 244) if (x < GATE[0] - 20 || x > GATE[1] + 20) posts.push(x);
  const trees = [];
  for (let x = -900; x < 2000; x += 30 + R() * 50) trees.push([x, 250 + R() * 60, 34 + R() * 40]);
  const rays = [];
  for (let i = 0; i < 14; i++) rays.push(GATE[0] - 300 + R() * 760);
  const tufts = [];
  for (let i = 0; i < 700; i++) tufts.push([-700 + R() * 2600, FENCE_BASE + 4 + Math.pow(R(), 1.3) * 420, R(), R()]);

  // ---- background ------------------------------------------------------------------------------------------
  function bg(g, t) {
    const sky = g.createLinearGradient(0, -500, 0, FENCE_BASE);
    sky.addColorStop(0, '#4d5584'); sky.addColorStop(0.35, '#a07a8c'); sky.addColorStop(0.62, '#e39a6c'); sky.addColorStop(0.85, '#fbc47e'); sky.addColorStop(1, '#ffdca0');
    g.fillStyle = sky; g.fillRect(-1600, -1600, 4200, FENCE_BASE + 1600);
    const sg = g.createRadialGradient(SUN[0], SUN[1], 3, SUN[0], SUN[1], 560);
    sg.addColorStop(0, 'rgba(255,253,236,1)'); sg.addColorStop(0.05, 'rgba(255,240,196,.95)'); sg.addColorStop(0.22, 'rgba(255,200,130,.5)'); sg.addColorStop(1, 'rgba(255,180,110,0)');
    g.fillStyle = sg; g.fillRect(SUN[0] - 620, SUN[1] - 620, 1240, 1240);
    // the neighbours' trees and a roof over the fence, hazy in the low sun; a power line
    g.fillStyle = '#9c6f6c';
    for (const [x, y, r] of trees) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillRect(-1600, 280, 4200, 60);
    g.fillStyle = '#8d6266';
    g.beginPath(); g.moveTo(1010, 330); g.lineTo(1120, 250); g.lineTo(1260, 250); g.lineTo(1360, 330); g.closePath(); g.fill();
    g.fillRect(1180, 222, 18, 34);
    g.strokeStyle = 'rgba(90,60,70,.7)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(180, 330); g.lineTo(184, 120); g.moveTo(160, 134); g.lineTo(208, 134); g.stroke();
    g.lineWidth = 1; g.strokeStyle = 'rgba(90,60,70,.45)';
    for (const dy of [0, 8]) { g.beginPath(); g.moveTo(-900, 150 + dy); g.quadraticCurveTo(-300, 176 + dy, 184, 136 + dy); g.quadraticCurveTo(800, 170 + dy, 1900, 128 + dy); g.stroke(); }
    // the glare beyond the fence (shows through every gap between the boards)
    const gl = g.createRadialGradient(SUN[0], 400, 10, SUN[0], 400, 700);
    gl.addColorStop(0, '#fff6dc'); gl.addColorStop(0.25, '#ffd79a'); gl.addColorStop(1, '#e79b68');
    g.fillStyle = gl; g.fillRect(-1600, 320, 4200, FENCE_BASE - 320 + 2);
    // the lawn: in the fence's shade, lit only where the sun gets through the gaps
    const gr = g.createLinearGradient(0, FENCE_BASE, 0, FENCE_BASE + 460);
    gr.addColorStop(0, '#6b6a3c'); gr.addColorStop(0.25, '#59612f'); gr.addColorStop(1, '#353d1d');
    g.fillStyle = gr; g.fillRect(-1600, FENCE_BASE, 4200, 1200);
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const x of rays) {
      const spread = (x - SUN[0]) * 0.9, a = Math.max(0, 1 - Math.abs(x - SUN[0]) / 480) * 0.085;
      g.fillStyle = `rgba(255,170,90,${a.toFixed(3)})`;
      g.beginPath(); g.moveTo(x - 1, FENCE_BASE); g.lineTo(x + 1, FENCE_BASE); g.lineTo(x + spread + 16, FENCE_BASE + 500); g.lineTo(x + spread - 8, FENCE_BASE + 500); g.closePath(); g.fill();
    }
    // the bright pool under the gate (it hangs a hand above the ground)
    const ug = g.createRadialGradient(702, FENCE_BASE, 4, 702, FENCE_BASE, 150);
    ug.addColorStop(0, 'rgba(255,200,120,.32)'); ug.addColorStop(1, 'rgba(255,190,110,0)');
    g.save(); g.translate(702, FENCE_BASE); g.scale(1, 0.3); g.translate(-702, -FENCE_BASE); g.fillStyle = ug; g.fillRect(500, 0, 400, 1000); g.restore();
    g.restore();
    for (const [x, y, a, b] of tufts) {
      const k = (y - FENCE_BASE) / 420, h = 2 + k * 11;
      g.strokeStyle = `rgba(${36 + a * 26 | 0},${48 + a * 26 | 0},${20 + b * 10 | 0},${0.4 + k * 0.4})`; g.lineWidth = 0.6 + k * 1.5;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 1, y - h * 0.6, x + (a - 0.5) * h, y - h); g.stroke();
      g.strokeStyle = `rgba(255,190,110,${(0.25 * (1 - k)).toFixed(3)})`; g.lineWidth = 0.6;
      g.beginPath(); g.moveTo(x + (a - 0.5) * h, y - h); g.lineTo(x + (a - 0.5) * h * 0.7, y - h * 0.75); g.stroke();
    }
    fence(g);
    // the open gate throws a wedge of sunset light across the lawn toward the camera
    g.save(); g.globalCompositeOperation = 'lighter';
    const wg = g.createLinearGradient(0, FENCE_BASE, 0, FENCE_BASE + 420);
    wg.addColorStop(0, 'rgba(255,186,104,.30)'); wg.addColorStop(1, 'rgba(255,170,90,0)');
    g.fillStyle = wg; g.beginPath(); g.moveTo(GATE[0], FENCE_BASE); g.lineTo(GATE[1] - 36, FENCE_BASE);
    g.lineTo(GATE[1] - 36 + 60, FENCE_BASE + 420); g.lineTo(GATE[0] - 140, FENCE_BASE + 420); g.closePath(); g.fill();
    g.restore();
  }

  // ---- poses built in this file ------------------------------------------------------------------------
  function mirror(p, d) {
    if (d >= 0) return p;
    const M = (q) => [-q[0], q[1]], o = { ...p };
    for (const k of ['hip', 'chest', 'head']) o[k] = M(p[k]);
    for (const k of ['legF', 'legB', 'armF', 'armB']) if (p[k]) o[k] = p[k].map(M);
    o.face = p.face === 0 ? 0 : -Math.abs(p.face); if (p.toe) o.toe = -p.toe;
    o.hairSwing = -(p.hairSwing || 0);
    return o;
  }
  // Tiptoeing: hunched forward, high slow knees, up on the toes. arms: 'paws' (hands up like a cartoon sneak)
  // or 'jar' (both arms round the cookie jar in front of the belly).
  function tiptoe(ph, d, arms) {
    const s = Math.sin(ph * TAU);
    const hip = [0, -45 - 2.5 * Math.abs(s)];
    const chest = add(hip, [lerp(6, 8, Math.abs(s)), -28]), head = add(chest, [5, -12.5]);
    const leg = (ps) => {
      const a = 24 * Math.sin(ps * TAU), fwd = Math.max(0, Math.cos(ps * TAU));
      const knee = add(hip, [Math.sin((a + 22 * fwd) * Math.PI / 180) * 21, Math.cos((a + 22 * fwd) * Math.PI / 180) * 21 - 4 * fwd]);
      const foot = add(knee, mul(dirv(a - 40 * fwd * fwd - 6), 22));
      return [knee, foot];
    };
    const p = { hip, chest, head, face: 1, legF: leg(ph), legB: leg(ph + 0.5), toe: 1.4, hairSwing: 0.1 * s };
    if (arms === 'jar') { p.armF = [add(chest, [9, 13]), add(chest, [19, 16])]; p.armB = [add(chest, [7, 14]), add(chest, [17, 19])]; }
    else { p.armF = [add(chest, [3, 15]), add(chest, [14, 7 + 1.5 * s])]; p.armB = [add(chest, [-1, 15]), add(chest, [11, 9 - 1.5 * s])]; }
    return mirror(p, d);
  }
  function mul(a, k) { return [a[0] * k, a[1] * k]; }
  // facing the camera: me with a finger to my mouth (shh) and the jar on my hip; or the hider, hands at her chin
  function shh(k) {
    const p = P.stand(0);
    p.armF = [lp([15, -62], add(p.chest, [11, 7]), k), lp([16, -49], add(p.head, [1.5, 6]), k)];
    p.armB = [[-17, -64], [-14, -52]];
    return p;
  }
  function nervous(k) {
    const p = P.stand(0);
    p.armF = [lp([15, -62], add(p.chest, [10, 12]), k), lp([16, -49], add(p.head, [3, 11]), k)];
    p.armB = [lp([-15, -62], add(p.chest, [-10, 12]), k), lp([-16, -49], add(p.head, [-3, 11]), k)];
    return p;
  }
  // frozen, caught: profile facing left, stiff, arms a little out from the body
  function frozen(d, k, droop) {
    const p = P.stand(1);
    p.armF = [add(p.chest, [lerp(6, 10, k), 13]), add(p.chest, [lerp(7, 14, k), lerp(26, 18, k)])];
    p.armB = [add(p.chest, [lerp(-3, -8, k), 13]), add(p.chest, [lerp(-3, -10, k), lerp(26, 19, k)])];
    p.head = add(p.head, [2 * droop, 3.5 * droop]);
    p.hairSwing = 0.25 * k;
    return mirror(p, d);
  }
  // mother marching with her arm out pointing (point 0..1), d facing
  function motherMarch(ph, point, d) {
    const p = P.march(ph, 1, 0);
    p.armF = [lp(p.armF[0], add(p.chest, [13, -1]), point), lp(p.armF[1], add(p.chest, [28, -4]), point)];
    return mirror(p, d);
  }

  // ---- the people, as functions of tape time -------------------------------------------------------------
  // take A: you and me, from the porch steps to the gate
  function takeA(t) {
    const hA = [478, 532], hB = [722, 458], mA = [372, 560], mB = [676, 464];
    let u;
    if (t < SNEAK) u = 0; else u = sm(seg(t, SNEAK, AT_GATE)) * 0.15 + seg(t, SNEAK, AT_GATE) * 0.85;
    const hp = lp(hA, hB, u), mp = lp(mA, mB, u);
    const ph = (t - SNEAK) * 0.62;
    let hpz, mpz;
    if (t < SNEAK) {
      // waiting at the steps: the hider looks round, back and forth; I shift the jar
      const look = Math.sin((t - T0) * 1.6);
      hpz = { ...P.stand(look > 0 ? 1 : -1), hairSwing: 0.2 * look };
      hpz.armF = [add(hpz.chest, [4, 12]), add(hpz.chest, [9, 22])];
      mpz = tiptoe(0.25, 1, 'jar'); mpz.hip = add(mpz.hip, [0, 2]);
    } else if (t < AT_GATE) {
      hpz = tiptoe(ph, 1, 'paws'); mpz = tiptoe(ph + 0.28, 1, 'jar');
    } else if (t < TURN) {
      const k = sm(seg(t, AT_GATE, AT_GATE + 0.4));
      hpz = lerpPose(tiptoe(ph, 1, 'paws'), P.stand(1), k); mpz = lerpPose(tiptoe(ph + 0.28, 1, 'jar'), P.stand(1), k);
      mpz.armF = [add(mpz.chest, [9, 13]), add(mpz.chest, [19, 16])]; mpz.armB = [add(mpz.chest, [7, 14]), add(mpz.chest, [17, 19])];
    } else {
      const k = sm(seg(t, TURN, TURN + 0.35));
      const hEnd = nervous(sm(seg(t, TURN + 0.2, TURN + 0.6))), mEnd = shh(sm(seg(t, SHH - 0.25, SHH + 0.1)));
      const mStart = { ...P.stand(1), armF: [[9, -64], [19, -61]], armB: [[7, -63], [17, -58]] };
      hpz = lerpPose(P.stand(1), hEnd, k); mpz = lerpPose(mStart, mEnd, k);
      hpz.face = k < 0.4 ? 1 : 0; mpz.face = k < 0.4 ? 1 : 0;
    }
    // the jar: in front of my belly while I sneak, on my hip once I turn
    const turnK = t < TURN ? 0 : sm(seg(t, TURN, TURN + 0.35));
    const jl = t < TURN ? add(mpz.chest, [21, 20]) : lp([21, -57], [-22, -57], turnK);
    return { hider: { x: hp[0], y: hp[1], pose: hpz }, me: { x: mp[0], y: mp[1], pose: mpz }, jar: { local: jl, owner: 'me' } };
  }
  // take B: at the gate, mother marches in, we freeze, the jar goes to her, the brother comes and watches
  function takeB(t) {
    const hx = 728, mx = 680, gy = 460;
    const caught = sm(seg(t, BETRAYS - 0.05, BETRAYS + 0.18));
    const droop = sm(seg(t, US + 1.2, US + 2.6));
    let hpz, mpz;
    if (t < BETRAYS - 0.05) {
      // at the gate, backs half to the camera: the hider is lifting the latch, I hold the jar
      hpz = P.stand(1); hpz.armF = [add(hpz.chest, [12, 4]), [26 + 1.5 * Math.sin(t * 7), -66]];   // a hand on the open gate
      mpz = P.stand(1); mpz.armF = [add(mpz.chest, [9, 13]), add(mpz.chest, [19, 16])]; mpz.armB = [add(mpz.chest, [7, 14]), add(mpz.chest, [17, 19])];
    } else {
      hpz = lerpPose(P.stand(1), frozen(-1, 1, droop), caught); hpz.face = caught < 0.5 ? 1 : -1;
      mpz = lerpPose(P.stand(1), frozen(-1, 0.6, droop), caught); mpz.face = caught < 0.5 ? 1 : -1;
      // my arms stay round the jar until I hold it out to her
      const give = sm(seg(t, HAND_OVER, HAND_OVER + 0.5)) * (1 - sm(seg(t, HAND_OVER + 0.9, HAND_OVER + 1.3)));
      if (t < HAND_OVER + 0.9) {
        const c = mpz.chest;
        mpz.armF = [lp(add(c, [-9, 13]), add(c, [-12, 3]), give), lp(add(c, [-19, 16]), add(c, [-27, 4]), give)];
        mpz.armB = [lp(add(c, [-7, 14]), add(c, [-10, 5]), give), lp(add(c, [-17, 19]), add(c, [-26, 9]), give)];
      }
    }
    // mother
    const mA = [40, 572], mB = [586, 470];
    const walkU = seg(t, GOES, US);
    const mpos = lp(mA, mB, walkU < 0.9 ? walkU / 0.9 * 0.96 : 0.96 + 0.04 * sm((walkU - 0.9) / 0.1));
    const point = sm(seg(t, BETRAYS - 0.2, BETRAYS + 0.05));
    let mom;
    if (t < US) mom = motherMarch((t - GOES) * 1.55, point, 1);
    else {
      const k = sm(seg(t, US, US + 0.3));
      mom = lerpPose(motherMarch((US - GOES) * 1.55, 1, 1), P.stand(1), k);
      const jab = Math.exp(-(((t - US - 0.1) / 0.18) ** 2));
      const wag = t > US + 1.0 ? Math.sin((t - US) * TAU * 2.2) * sm(seg(t, US + 1.0, US + 1.4)) : 0;
      mom.armF = [add(mom.chest, [13 + 2 * jab, -1 + 2 * wag]), add(mom.chest, [28 + 5 * jab, -4 + 6 * wag - 4 * jab])];
      // her other hand: on her hip, then out to take the jar, then holding it at her side
      const take = sm(seg(t, HAND_OVER + 0.3, HAND_OVER + 0.8)), keep = sm(seg(t, HAND_OVER + 0.9, HAND_OVER + 1.4));
      const hip = [add(mom.chest, [-11, 15]), add(mom.chest, [-4, 26])];
      const reach = [add(mom.chest, [9, 12]), add(mom.chest, [22, 14])];
      const side = [add(mom.chest, [-2, 15]), add(mom.chest, [2, 29])];
      mom.armB = take < 1 || keep === 0 ? [lp(hip[0], reach[0], take), lp(hip[1], reach[1], take)] : [lp(reach[0], side[0], keep), lp(reach[1], side[1], keep)];
      mom.hem = 1.5 * Math.sin(t * 2);
    }
    if (t < GOES) mom = null;
    // the jar: with me, then in her hand
    const jarOwner = t < HAND_OVER + 0.75 ? 'me' : 'mom';
    // the brother
    let bro = null;
    if (t >= JEALOUSY) {
      const bA = [1090, 636], bB = [870, 604];
      const u = seg(t, JEALOUSY, CROSSED - 0.25);
      const bp = lp(bA, bB, u < 0.85 ? u / 0.85 * 0.95 : 0.95 + 0.05 * sm((u - 0.85) / 0.15));
      const walk = P.run((t - JEALOUSY) * 1.4, -1, { energy: 0.42 });
      const k = sm(seg(t, CROSSED - 0.4, CROSSED + 0.25));
      const pose = lerpPose(walk, P.armsCrossed(0), k);
      pose.face = k < 0.5 ? -1 : 0;
      bro = { x: bp[0], y: bp[1], pose };
    }
    return { hider: { x: hx, y: gy, pose: hpz }, me: { x: mx, y: gy + 4, pose: mpz }, mom: mom && { x: mpos[0], y: mpos[1], pose: mom }, bro, jarOwner };
  }

  // local kid point -> world
  const toWorld = (who, kid, q) => { const s = kidH(who.y) / 100 * (kid.size || 1); return [who.x + q[0] * s, who.y + q[1] * s]; };
  function jar(g, x, y, r) {
    g.fillStyle = COL.jar;
    ell(g, x, y, r, r * 0.92);
    g.fillRect(x - r * 0.62, y - r * 1.12, r * 1.24, r * 0.4);
    ell(g, x, y - r * 1.12, r * 0.72, r * 0.2);
    ell(g, x, y - r * 1.36, r * 0.2, r * 0.17);
  }
  function jarWorld(t, take, st) {
    if (take === 'A') {
      const w = toWorld(st.me, KIDS.me, st.jar.local);
      return [w[0], w[1], 11.5 * kidH(st.me.y) / 100 * KIDS.me.size];
    }
    if (st.jarOwner === 'me') {
      const c = st.me.pose.chest, dir = t < BETRAYS + 0.06 ? 1 : -1;
      const give = sm(seg(t, HAND_OVER, HAND_OVER + 0.5));
      const w = toWorld(st.me, KIDS.me, lp(add(c, [21 * dir, 21]), add(c, [-29, 10]), give));
      return [w[0], w[1], 11.5 * kidH(st.me.y) / 100 * KIDS.me.size];
    }
    // in mother's hand (adult: hand point scaled by her size, the pose is adultized at draw time)
    const m = st.mom, hand = m.pose.armB[1], s = kidH(m.y) / 100 * KIDS.mother.size;
    return [m.x + hand[0] * s, m.y + hand[1] * 1.14 * s + 9 * s, 11.5 * kidH(st.me.y) / 100 * KIDS.me.size];
  }

  // ---- the fence, the gate, the clothesline, the house corner, the porch rail ------------------------------
  // The fence is part of the lit world (drawn in bg, a dark warm brown, lighter than the people), so the people in
  // front of it keep their rim glow. The gate stands open, swung out: the opening is pure sunset glare.
  function fence(g) {
    g.fillStyle = '#4a3025';
    g.beginPath();
    for (const [x, w] of boards) { g.moveTo(x, FENCE_BASE + 2); g.lineTo(x, FENCE_TOP + 3); g.lineTo(x + 2.5, FENCE_TOP); g.lineTo(x + w - 2.5, FENCE_TOP); g.lineTo(x + w, FENCE_TOP + 3); g.lineTo(x + w, FENCE_BASE + 2); g.closePath(); }
    g.fill();
    g.fillStyle = '#3f281f';
    g.fillRect(-1600, 340, 1600 + GATE[0] - 6, 6); g.fillRect(GATE[1] + 6, 340, 2000, 6);
    g.fillRect(-1600, 424, 1600 + GATE[0] - 6, 6); g.fillRect(GATE[1] + 6, 424, 2000, 6);
    for (const x of posts) g.fillRect(x - 5, FENCE_TOP + 6, 10, FENCE_BASE - FENCE_TOP - 4);
    // the sun catches the board tops
    g.fillStyle = 'rgba(255,190,120,.55)';
    for (const [x, w] of boards) { const a = Math.max(0, 1 - Math.abs(x - SUN[0]) / 700); if (a > 0.05) g.fillRect(x + 2, FENCE_TOP - 0.5, w - 4, 1.4 * a + 0.4); }
    // the open gateway: the lane beyond, bright
    g.fillStyle = '#f6cf92'; g.fillRect(GATE[0], 436, GATE[1] - GATE[0], FENCE_BASE - 436 + 2);
    // gate posts, and the gate itself swung out, narrow and angled, hanging from the right-hand post
    g.fillStyle = '#3d271d';
    g.fillRect(GATE[0] - 9, FENCE_TOP - 8, 10, FENCE_BASE - FENCE_TOP + 10); g.fillRect(GATE[1] - 1, FENCE_TOP - 8, 10, FENCE_BASE - FENCE_TOP + 10);
    ell(g, GATE[0] - 4, FENCE_TOP - 9, 6, 3); ell(g, GATE[1] + 4, FENCE_TOP - 9, 6, 3);
    g.fillStyle = '#452d22';
    for (let i = 0; i < 4; i++) {
      const xa = GATE[1] - 2 - i * 9.5, xb = xa - 7.5, ya = 324 + i * 3.2, yb = 440 - i * 2.4;
      g.beginPath(); g.moveTo(xa, ya); g.lineTo(xb, ya + 2.4); g.lineTo(xb, yb - 1.8); g.lineTo(xa, yb); g.closePath(); g.fill();
    }
    g.fillStyle = '#3f281f'; g.beginPath(); g.moveTo(GATE[1] - 1, 340); g.lineTo(GATE[1] - 38, 350); g.lineTo(GATE[1] - 38, 355); g.lineTo(GATE[1] - 1, 346); g.fill();
    g.beginPath(); g.moveTo(GATE[1] - 1, 420); g.lineTo(GATE[1] - 38, 416); g.lineTo(GATE[1] - 38, 421); g.lineTo(GATE[1] - 1, 426); g.fill();
  }
  function clothesline(g, t) {
    g.fillStyle = g.strokeStyle = COL.post; g.lineCap = 'round';
    for (const [x, y] of [[930, 506], [1290, 512]]) {
      const h = kidH(y) * 1.85;
      g.fillRect(x - 3.5, y - h, 7, h); g.fillRect(x - 26, y - h, 52, 5);
    }
    g.lineWidth = 1; g.beginPath(); g.moveTo(910, 506 - kidH(506) * 1.85 + 2); g.quadraticCurveTo(1110, 506 - kidH(506) * 1.85 + 18, 1310, 512 - kidH(512) * 1.85 + 2); g.stroke();
    void t;
  }
  function sheet(g, t) {   // a bed sheet on the line, glowing orange with the sun through it (drawn after the rim)
    const top = 506 - kidH(506) * 1.85 + 9, x0 = 980, x1 = 1120;
    const w = Math.sin(t * 1.7) * 4 + Math.sin(t * 3.1) * 2;
    g.fillStyle = 'rgba(255,214,164,.93)';
    g.beginPath(); g.moveTo(x0, top); g.quadraticCurveTo((x0 + x1) / 2, top + 6, x1, top + 1);
    g.lineTo(x1 + w, top + 92); g.quadraticCurveTo((x0 + x1) / 2 + w, top + 98 + w, x0 + w * 0.6, top + 90); g.closePath(); g.fill();
    g.fillStyle = 'rgba(200,110,70,.22)';
    for (let i = 1; i < 5; i++) { const fx = x0 + i * (x1 - x0) / 5; g.fillRect(fx + w * i / 5, top + 4, 3, 86); }
  }
  function wallCorner(g) {
    g.fillStyle = COL.wall;
    g.fillRect(-1600, -800, 1600 + WALL_X, 2400);
    g.fillRect(WALL_X - 4, -800, 10, 2400);     // the corner board
    g.fillRect(WALL_X - 38, -800, 9, 2400);     // the downspout
    g.fillRect(WALL_X - 44, 680, 21, 30);
  }
  function porchRail(g) {
    g.fillStyle = '#2a1f19';
    g.fillRect(-300, 714, 1700, 20);            // the rail the camcorder sits on
    for (let x = -280; x < 1400; x += 44) g.fillRect(x, 734, 12, 200);
    g.fillRect(-60, -400, 46, 1300);            // the porch post at the left edge
  }

  // ---- shadows, shapes, over -------------------------------------------------------------------------------
  function shadowXf(g, bx, by) { g.translate(bx, by); g.transform(1, 0, -(bx - SUN[0]) / 700, -0.55, 0, 0); }
  function stateAt(t) { const tt = tape(t); return tt < TAKE_B ? { take: 'A', tt, st: takeA(tt) } : { take: 'B', tt, st: takeB(tt) }; }
  function people(g, t, take, st, color) {
    const list = [['hider', st.hider], ['me', st.me]];
    if (take === 'B') { if (st.mom) list.push(['mother', st.mom]); if (st.bro) list.push(['brother', st.bro]); }
    list.sort((a, b) => a[1].y - b[1].y);
    for (const [k, w] of list) {
      if (color) drawKid(g, KIDS[k], w.pose, w.x, w.y, kidH(w.y), color);
      else { g.save(); shadowXf(g, w.x, w.y); drawKid(g, KIDS[k], w.pose, 0, 0, kidH(w.y), '#000'); g.restore(); }
    }
  }
  function shadows(g, t) {
    const { take, tt, st } = stateAt(t);
    g.fillStyle = '#000';
    people(g, tt, take, st, null);
  }
  function shapes(g, t) {
    const { take, tt, st } = stateAt(t);
    clothesline(g, tt);
    people(g, tt, take, st, COL.kid);
    const j = jarWorld(tt, take, st); jar(g, j[0], j[1], j[2]);
    if (take === 'A') {
      wallCorner(g);
      // his own hand, close to the lens and out of focus: thumbs up, on the word
      const up = sm(seg(tt, TELL - 0.32, TELL)) * (1 - sm(seg(tt, RW0 + 2.0, RW0 + 2.6)));
      if (up > 0) {
        const c = CAM_A(tt);
        const sx = 770 + 8 * Math.sin(tt * 5.3), sy = lerp(1000, 470, up) + 5 * Math.sin(tt * 4.1);
        g.save();
        g.translate(c.cx + (sx - 480) / c.z, c.cy + (sy - 360) / c.z); g.scale(1 / c.z, 1 / c.z); g.rotate(-c.roll - 0.12);
        g.filter = 'blur(3.5px)';
        thumbsUp(g);
        g.restore();
      }
    } else {
      g.save(); g.filter = 'blur(3px)'; porchRail(g); g.restore();
    }
  }
  // screen pixels, fist centre at the origin: a side-on fist, curled fingers stacked on its front (left) face, the
  // thumb straight up from the top, the forearm and sleeve running off the bottom right
  function thumbsUp(g) {
    g.fillStyle = '#241a1c'; g.strokeStyle = '#241a1c'; g.lineCap = 'round';
    g.lineWidth = 104; g.beginPath(); g.moveTo(40, 70); g.quadraticCurveTo(100, 220, 170, 460); g.stroke();
    g.beginPath(); g.roundRect(-48, -48, 112, 120, 30); g.fill();
    for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(-80, -40 + i * 28, 70, 27, 13); g.fill(); }
    g.beginPath(); g.roundRect(-46, -150, 44, 120, 22); g.fill();
    g.beginPath(); g.moveTo(-46, -40); g.quadraticCurveTo(-30, -20, 10, -46); g.lineTo(10, -60); g.lineTo(-46, -60); g.closePath(); g.fill();
  }
  function over(g, t) {
    const { take, tt } = stateAt(t);
    sheet(g, tt);
    if (take === 'A') {   // siding on the near wall, catching a little light at the corner
      g.fillStyle = 'rgba(255,190,140,.06)';
      for (let y = -800; y < 1600; y += 26) g.fillRect(-1600, y, 1600 + WALL_X - 6, 2);
      g.fillStyle = 'rgba(255,200,140,.10)'; g.fillRect(WALL_X - 7, -800, 3, 2400);
    }
  }

  // VHS search: two or three bands of torn, noisy picture that crawl up the screen while the tape rewinds.
  // Only the bands change frame to frame (no full-frame brightness pulses).
  function post(g, t) {
    if (t < RW0 || t >= RW1) return;
    const W = 960, H = 720, u = t - RW0, f = Math.round(t * 24);
    const env = Math.min(1, u / 0.3, (RW1 - t) / 0.25);
    const band = BACKLIGHT.scratch('brother-rw', W, 64), bg2 = band.getContext('2d');
    const BANDS = [[90, 30], [330, 40], [560, 26]];
    for (let i = 0; i < BANDS.length; i++) {
      const [y0, h0] = BANDS[i], h = Math.round(h0 * (0.6 + 0.4 * env));
      const y = Math.round(((y0 - 120 * u) % (H + 120) + H + 120) % (H + 120) - 60);
      if (y + h < 0 || y > H) continue;
      const ys = Math.max(0, y), hh = Math.min(H, y + h) - ys; if (hh <= 0) continue;
      bg2.clearRect(0, 0, W, 64); bg2.drawImage(g.canvas, 0, ys, W, hh, 0, 0, W, hh);
      for (let r = 0; r < hh; r += 2) {
        const dx = ((hash(f, r + i * 97) - 0.5) * 70 + 22) * env;
        g.drawImage(band, 0, r, W, 2, dx, ys + r, W, 2);
      }
      for (let k = 0; k < 150; k++) {
        const a = hash(f * 3 + i, k), b = hash(k, f + i * 13), c = hash(f + k, i);
        g.fillStyle = `rgba(${200 + c * 50 | 0},${200 + c * 50 | 0},${205 + c * 50 | 0},${(0.25 + 0.5 * c) * env})`;
        g.fillRect(a * W, ys + b * hh, 3 + c * 34, 1 + (c > 0.8 ? 1 : 0));
      }
      g.fillStyle = `rgba(10,8,12,${0.5 * env})`; g.fillRect(0, ys, W, 2); g.fillRect(0, ys + hh - 1, W, 1);
    }
  }

  // ---- cameras -----------------------------------------------------------------------------------------------
  // take A: the brother, low and wobbly, peeking round the corner and then edging out after us
  const CAM_A = CAMKIT.rig([
    [T0, 236, 388, 1.0], [169.3, 268, 390, 1.0], [171.0, 470, 394, 1.0], [SNEAK, 480, 396, 1.0], [LYING2, 540, 392, 1.1],
    [179.6, 600, 398, 1.3], [AT_GATE, 650, 404, 1.55], [TURN, 678, 408, 1.9], [TELL, 680, 410, 1.95], [RW0, 682, 410, 1.95],
  ], [[T0, 1.0], [168.6, 0.2], [169.2, 0.8], [169.8, 0], [176.4, 0], [176.9, 1.4], [177.4, 0.2], [177.8, 0], [TURN, 0], [183.3, 1.2], [183.6, 0.4], [RW0, 0.3]], 23, 2);
  // take B: set on the porch rail; one autofocus breath when mother passes close
  const CAM_B = CAMKIT.rig([[TAKE_B, 600, 404, 1.05], [T1, 600, 404, 1.05]],
    [[TAKE_B, 1.8], [190.7, 0.3], [GOES + 0.4, 0], [GOES + 0.9, 1.3], [GOES + 1.6, 0.2], [GOES + 2.0, 0], [JEALOUSY, 0], [JEALOUSY + 0.4, 1.1], [JEALOUSY + 1.0, 0], [T1, 0]], 29, 0.15, 0.012);
  const camera = (t) => { const tt = tape(t); return tt < TAKE_B ? CAM_A(tt) : CAM_B(tt); };

  SCENE.add({
    id: 'brother', t0: T0, t1: T1, takes: [TAKE_B],
    stamp: (t) => ({ date: 'AUG.09 1992', time: tape(t) < TAKE_B ? '7:15PM' : '7:21PM' }),
    camera, bg: (g, t) => bg(g, tape(t)), shadows, shapes, over, post,
    light: { rim: '#ffc684', glow: 'rgba(255,170,96,.85)', glowBlur: 8, rimW: 1.3, sunDir: [0, -1] },
    source: () => ({ x: SUN[0], y: SUN[1], r: 320, a: 1 }),
    grade: { bright: 1.0, contrast: 1.06, sat: 1.06 },
  });
})();
