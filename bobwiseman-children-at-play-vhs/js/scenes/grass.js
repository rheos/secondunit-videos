// scenes/grass.js · "and I love you, oh I love you": SEP.12 1992, 5:10PM. The camcorder held straight down over you
// and me lying on our backs in the grass, heads together, bodies pointing opposite ways. The low sun rakes in from
// the top-right corner, so every raised arm throws a long shadow across the warm grass. On the first line both
// raise an arm and point up at the camera; on the second the two raised hands drift together until the
// fingertips touch, and their two shadows meet on the grass too. Cloud shadows drift over.
// The one scene not back-lit from behind the subject: the kids stay dark, the grass stays warm and bright.
(function () {
  const T = window.TIMING, S = T.scenes;
  const { KIDS, drawKid, poses: P } = window.CAST;
  const TAU = Math.PI * 2;

  // ---- hits, song seconds ------------------------------------------------------------------------------
  const T0 = S.grass, T1 = S.porch;
  const AND_I = 246.44;   // "And I": my arm starts up
  const LOVE1 = 247.74;   // "love": both arms up, pointing at the camera
  const YOU1 = 248.60;    // "you": a poke at the lens (the hands push closer)
  const OH = 252.17;      // "oh": the two raised hands start to drift together
  const LOVE2 = 255.44;   // "love": almost touching
  const YOU2 = 256.40;    // "you": fingertips touch; hold

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const sm = (x) => x * x * (3 - 2 * x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const L2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  }

  // ---- light: the low sun from the top-right corner; shadows fall toward the bottom-left ----------------------
  const SUNDIR = [0.8, -0.6];            // toward the sun, screen space
  const SH = [-0.8, 0.6], SHK = 1.75;    // a point at height H throws its shadow H * SHK along SH
  const C = { kid: '#261a1e' };

  // ---- the two kids, lying on their backs (a front-view pose, turned on its side) -----------------------------------
  const KH = 380;
  const KD = {
    me:    { kid: KIDS.me,    head: [440, 316], rot: Math.PI / 2 },   // body runs off to the left
    hider: { kid: KIDS.hider, head: [536, 420], rot: -Math.PI / 2 },  // body runs off to the right
  };
  for (const k of ['me', 'hider']) {
    const d = KD[k]; d.s = KH / 100 * d.kid.size;
    d.origin = [d.head[0] - Math.sin(d.rot) * 90 * d.s, d.head[1]];   // the feet end, where drawKid's origin sits
  }
  // kid-local <-> world for a kid lying along the x axis
  const toW = (k, p) => { const d = KD[k], c = Math.cos(d.rot), s = Math.sin(d.rot); return [d.origin[0] + (p[0] * c - p[1] * s) * d.s, d.origin[1] + (p[0] * s + p[1] * c) * d.s]; };
  const toL = (k, w) => { const d = KD[k], c = Math.cos(d.rot), s = Math.sin(d.rot); const x = (w[0] - d.origin[0]) / d.s, y = (w[1] - d.origin[1]) / d.s; return [x * c + y * s, -x * s + y * c]; };

  // The raised inner hand: where it shows (top view) and how high it is off the grass (world px).
  // Seen from straight above, an arm pointing up at the lens is only a fist over its shoulder (Blender reference,
  // work/ref3d, Nov 11): the hand's top-view offset from the shoulder and its height share one arm length.
  // The heads lie offset on a diagonal, which leaves open grass between them: the hands meet there.
  const ARM = 31;                                       // shoulder to knuckles, kid-local units
  const SHOULDER = [8, -79], REST_H = [16, -49];        // kid-local: the inner shoulder, the hand resting by the side
  const MEET = [500, 342];                              // the fingertips touch here, over open grass between the heads
  const shoulderW = (k) => toW(k, SHOULDER);
  function raised(k, t) {
    const d = KD[k], L = ARM * d.s, sh = shoulderW(k);
    const lag = k === 'me' ? 0 : 0.42;
    const r = sm(seg(t, AND_I + lag, LOVE1 - 0.05 + lag * 0.2));
    const poke = Math.exp(-Math.pow((t - YOU1 - 0.08) / 0.16, 2));
    const drift = sm(seg(t, OH, YOU2));                 // the two hands come together, slowly, then touch on "you"
    const near = drift * (1 - 0.06 * Math.exp(-Math.pow((t - LOVE2) / 0.5, 2)));
    const side = k === 'me' ? 1 : -1;
    const toM = [MEET[0] - sh[0], MEET[1] - sh[1]], dm = Math.hypot(toM[0], toM[1]), um = [toM[0] / dm, toM[1] / dm];
    const upW = add(sh, [um[0] * 0.12 * L, um[1] * 0.12 * L]);           // straight up, tipped a little toward the other kid
    const fr = 11 * d.s * 1.18;                                          // palm centre to index tip, at full reach
    const target = add(MEET, [-um[0] * fr, -um[1] * fr]);               // the palms stop short so only the fingertips meet
    const tr = Math.min(Math.hypot(target[0] - sh[0], target[1] - sh[1]), 0.93 * L);
    const tdir = Math.atan2(target[1] - sh[1], target[0] - sh[0]);
    const meetW = add(sh, [Math.cos(tdir) * tr, Math.sin(tdir) * tr]);
    const idle = (1 - drift) * r;                         // while held up, the hands trace little circles at the clouds
    const flat = L2(L2(toW(k, REST_H), upW, r), meetW, near);           // the hand's top-view position
    const hand = add(flat, [idle * 3 * Math.sin(t * 1.3 + side), idle * 2.4 * Math.cos(t * 1.1 + side)]);
    const reach = Math.min(L, Math.hypot(hand[0] - sh[0], hand[1] - sh[1]));
    const H0 = Math.sqrt(L * L - reach * reach) * Math.max(r, near);   // height off the grass, from the arm length
    const H = lerp(H0, 46, near);   // touching fingertips are at one height, so the two hand shadows meet on the grass too
    return { r, hand, H, big: 1 + 0.22 * (H / L) + 0.16 * poke, drift, sh, L };
  }
  // The hands' SHADOWS on the grass, in kid-local units at hl (Robin, Nov 12: the drawn open hands are right; their
  // shadows were the problem, and the fresco is what the shadows should be). The outlines are traced from Michelangelo's "Creation of Adam"
  // (js/hands.js; Robin, Nov 12: drawn fingers read as claws, "I gave you a reference"). Me gets Adam's relaxed hand,
  // the hider God's reaching index, mirrored so both reach the same way round. Robin: that picture is what the touch
  // should remind us of; until then the hands shift a bit. So while raised and drifting together they turn at the
  // wrist and flex, and the motion settles out on "love" so on "you" they hold the fresco's pose. Pointing up at the
  // lens they are foreshortened; as they reach for each other they lengthen out to the full outline.
  function handShape(g, k, hl, big, t) {
    // An open, relaxed hand reaching up (Robin, Nov 11: not a pointing fist, which read as a rude finger; more like
    // Michelangelo's hands). Fingers loosely spread and gently curled, the index the longest and straightest; as the
    // hands reach for each other the fingers lengthen out of the foreshortening and the index leads.
    const R = raised(k, t);
    const aimW = R.drift > 0.02 ? MEET : add(R.hand, k === 'me' ? [10, -16] : [-10, 16]);
    const aim = toL(k, aimW);
    const ang = Math.atan2(aim[1] - hl[1], aim[0] - hl[0]);
    const ext = 0.45 + 0.55 * R.drift;   // straight up at the lens the fingers are foreshortened
    const side = k === 'me' ? 1 : -1;    // which way the thumb sits
    g.save(); g.translate(hl[0], hl[1]); g.rotate(ang); g.scale(big, big * side);
    g.beginPath(); g.ellipse(0, 0, 4.2, 3.8, 0, 0, TAU); g.fill();                               // palm
    g.lineCap = 'round'; g.lineJoin = 'round';
    const FING = [  // [knuckle y, length, curl, width]: index, middle, ring, little
      [-2.4, 8.2, 0.3, 1.75], [-0.8, 7.6, 1.1, 1.7], [0.8, 6.8, 1.7, 1.6], [2.3, 5.4, 2.1, 1.4],
    ];
    for (const [ky, len, curl, w] of FING) {
      const L = len * ext, c = curl * (0.6 + 0.4 * ext);
      const spread = ky * 0.16;   // fanned a little
      g.lineWidth = w;
      g.beginPath(); g.moveTo(3, ky);
      g.quadraticCurveTo(3 + L * 0.6, ky + spread * L * 0.5 + c * 0.3, 3 + L * (1 - 0.08 * c), ky + spread * L + c);
      g.stroke();
    }
    g.lineWidth = 2.0; g.beginPath(); g.moveTo(0.5, -3.2); g.quadraticCurveTo(3, -5.4, 5.2 * (0.6 + 0.4 * ext), -5.6); g.stroke();   // thumb
    g.restore();
  }
  function handTraced(g, k, hl, big, t) {
    const R = raised(k, t);
    const aimW = R.drift > 0.02 ? MEET : add(R.hand, k === 'me' ? [10, -16] : [-10, 16]);
    const aim = toL(k, aimW);
    const ph = k === 'me' ? 0 : 2.1;
    const live = 1 - sm(seg(t, LOVE2 - 0.3, YOU2 - 0.05));                  // alive until the touch, still at it
    const ang = Math.atan2(aim[1] - hl[1], aim[0] - hl[0]) + live * (0.24 * Math.sin(t * 1.6 + ph) + 0.1 * Math.sin(t * 3.3 + ph * 2));
    const flex = 1 + live * 0.13 * Math.sin(t * 2.4 + ph);                 // fingers opening and closing a little
    const ext = (0.4 + 0.6 * R.drift) * (1 + live * 0.06 * Math.sin(t * 1.9 + ph + 1));
    const path = window.HANDPATHS[k === 'me' ? 'adam' : 'god'];
    g.save(); g.translate(hl[0], hl[1]); g.rotate(ang); g.scale(big * ext, big * flex * (k === 'me' ? 1 : -1));
    g.translate(-2, 0);   // the wrist sits just inside the end of the arm
    g.beginPath(); path.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
    g.restore();
  }


  function pose(k, t) {
    const d = KD[k];
    const br = Math.sin(t * 1.7 + (k === 'me' ? 0 : 2)) * 0.8;   // breathing
    const p = P.stand(0);
    p.chest = add(p.chest, [0, -br * 0.4]);
    if (k === 'me') {  // relaxed: one knee flopped out, the outer hand resting out on the grass
      p.legF = [[17, -27], [8, -3]];
      p.legB = [[-6, -24], [-8 + 1.5 * Math.sin(t * 2.3), -1]];
      p.armB = [[-19, -61], [-29, -48]];
    } else {  // the outer hand on her tummy, drumming; ankles crossed
      const dr = Math.sin(t * 9) * 1.2 * (t < AND_I ? 1 : 0.3);
      p.armB = [[-15, -57], [-2, -58 + dr]];
      p.legB = [[-4, -24], [3, -2]]; p.legF = [[4, -24], [-3, -1]];
    }
    p.hairSwing = 0;
    p.toe = 0;   // on their backs the feet point up at the lens: seen from above, a blob at the end of each leg
    // the inner arm: resting by the side, then raised toward the lens
    const R = raised(k, t);
    const sh = add(p.chest, [8, -2]);
    const restE = [15, -62], restH = [16, -49];
    const handL = toL(k, R.hand);
    const elbowUp = add(L2(sh, handL, 0.5), [3, 2]);
    p.armF = [L2(restE, elbowUp, R.r), L2(restH, handL, R.r)];
    const hl = p.armF[1];
    p.props = [(g) => { if (R.r > 0.05) handShape(g, k, hl, R.big, t); }];
    return p;
  }

  // ---- the grass, laid out once ----------------------------------------------------------------------------
  const Rg = rng(51092);
  const BLADE_COLS = ['rgba(104,124,40,.85)', 'rgba(132,148,52,.85)', 'rgba(160,166,64,.85)', 'rgba(186,182,82,.85)', 'rgba(212,198,104,.8)'];
  const blades = BLADE_COLS.map(() => []);
  for (let i = 0; i < 16000; i++) {
    const x = -260 + Rg() * 1480, y = -200 + Rg() * 1120, a = -Math.PI / 2 + (Rg() - 0.5) * 2.4, l = 3 + Rg() * 6;
    const lit = (x - y) / 1400 + 0.5;  // brighter toward the sun's corner
    const ci = clamp(Math.floor(Rg() * 3.2 + lit * 2.2), 0, 4);
    blades[ci].push([x, y, a, l, Rg()]);
  }
  const blots = [];
  for (let i = 0; i < 70; i++) blots.push([-200 + Rg() * 1400, -160 + Rg() * 1040, 30 + Rg() * 90, Rg()]);
  const clover = [];
  for (let i = 0; i < 46; i++) { const cx = -200 + Rg() * 1400, cy = -160 + Rg() * 1040; for (let j = 0; j < 7; j++) clover.push([cx + (Rg() - 0.5) * 50, cy + (Rg() - 0.5) * 40, Rg() * TAU, 0.8 + Rg() * 0.5]); }
  const flowers = [];
  for (let i = 0; i < 34; i++) flowers.push([-200 + Rg() * 1400, -160 + Rg() * 1040, Rg() < 0.45 ? 'puff' : (Rg() < 0.6 ? 'yellow' : 'white'), 0.7 + Rg() * 0.6]);
  const leaves = [];
  for (let i = 0; i < 14; i++) leaves.push([-200 + Rg() * 1400, -160 + Rg() * 1040, Rg() * TAU, 0.8 + Rg() * 0.5]);
  const CLOUDS = [  // cloud shadows: clusters of soft blobs drifting with the wind (toward the bottom-right)
    { x: -620, y: -120, blobs: [[0, 0, 210], [170, 40, 170], [-150, 60, 160], [60, 150, 150]] },
    { x: -1500, y: 380, blobs: [[0, 0, 240], [200, -40, 190], [-180, 50, 150]] },
  ];

  function bg(g, t) {
    // warm grass, brightest toward the sun's corner
    const base = g.createLinearGradient(1100, -200, -200, 960);
    base.addColorStop(0, '#dccd73'); base.addColorStop(0.45, '#b8b157'); base.addColorStop(1, '#7f8a36');
    g.fillStyle = base; g.fillRect(-400, -400, 1800, 1500);
    for (const [x, y, r, c] of blots) {
      const bl = g.createRadialGradient(x, y, 2, x, y, r);
      const col = c < 0.5 ? '210,196,110' : '96,110,40';
      bl.addColorStop(0, `rgba(${col},${0.22 + 0.15 * c})`); bl.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = bl; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    // clover and fallen birch leaves under the blades
    for (const [x, y, a, s] of clover) {
      g.fillStyle = 'rgba(78,104,38,.75)';
      for (let j = 0; j < 3; j++) { const b = a + j * TAU / 3; g.beginPath(); g.arc(x + Math.cos(b) * 3.2 * s, y + Math.sin(b) * 3.2 * s, 3.1 * s, 0, TAU); g.fill(); }
      g.fillStyle = 'rgba(190,206,120,.35)'; g.beginPath(); g.arc(x + 1.5, y - 1.5, 1.6 * s, 0, TAU); g.fill();
    }
    for (const [x, y, a, s] of leaves) {
      g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s);
      g.fillStyle = 'rgba(60,50,10,.35)'; g.beginPath(); g.ellipse(-3, 3, 9, 5, 0, 0, TAU); g.fill();
      g.fillStyle = '#e2bd42'; g.beginPath(); g.ellipse(0, 0, 9, 5, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(150,110,30,.8)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.stroke();
      g.restore();
    }
    // blades, batched by colour: a soft dark under-stroke toward the shadow side, the blade, then lit tips
    g.lineCap = 'round';
    g.strokeStyle = 'rgba(46,58,14,.28)'; g.lineWidth = 1.6; g.beginPath();
    for (const set of blades) for (const [x, y, a, l] of set) { g.moveTo(x + SH[0] * 1.6, y + SH[1] * 1.6); g.lineTo(x + Math.cos(a) * l + SH[0] * 2.4, y + Math.sin(a) * l + SH[1] * 2.4); }
    g.stroke();
    blades.forEach((set, ci) => {
      g.strokeStyle = BLADE_COLS[ci]; g.lineWidth = 1.25; g.beginPath();
      for (const [x, y, a, l] of set) { g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); }
      g.stroke();
    });
    g.strokeStyle = 'rgba(255,238,168,.5)'; g.lineWidth = 0.8; g.beginPath();
    for (const set of blades.slice(2)) for (const [x, y, a, l, e] of set) if (e > 0.5) { const tx = x + Math.cos(a) * l, ty = y + Math.sin(a) * l; g.moveTo(tx - Math.cos(a) * 2.5, ty - Math.sin(a) * 2.5); g.lineTo(tx, ty); }
    g.stroke();
    // the low sun's warmth across the field, falling off toward the far corner
    const warm = g.createLinearGradient(1000, -160, 0, 900);
    warm.addColorStop(0, 'rgba(255,214,130,.38)'); warm.addColorStop(0.5, 'rgba(255,204,120,.14)'); warm.addColorStop(1, 'rgba(60,70,30,.18)');
    g.fillStyle = warm; g.fillRect(-400, -400, 1800, 1500);
    for (const [x, y, kind, s] of flowers) {
      if (kind === 'puff') {  // dandelion clocks
        g.fillStyle = 'rgba(50,60,20,.3)'; g.beginPath(); g.arc(x - 4 * s, y + 3 * s, 6.5 * s, 0, TAU); g.fill();
        const pg = g.createRadialGradient(x, y, 0.5, x, y, 7 * s); pg.addColorStop(0, 'rgba(255,255,244,.95)'); pg.addColorStop(0.7, 'rgba(250,250,236,.7)'); pg.addColorStop(1, 'rgba(250,250,236,0)');
        g.fillStyle = pg; g.beginPath(); g.arc(x, y, 7 * s, 0, TAU); g.fill();
      } else {
        g.fillStyle = kind === 'yellow' ? '#f2c832' : '#f6f2e2';
        for (let j = 0; j < 6; j++) { const b = j * TAU / 6; g.beginPath(); g.arc(x + Math.cos(b) * 2.6 * s, y + Math.sin(b) * 2.6 * s, 1.9 * s, 0, TAU); g.fill(); }
        g.fillStyle = kind === 'yellow' ? '#c98a12' : '#e8c34a'; g.beginPath(); g.arc(x, y, 1.6 * s, 0, TAU); g.fill();
      }
    }
    kidShadows(g, t);
    cloudShadows(g, t);
  }
  // The kids' shadows, from the Blender reference (work/ref3d, Nov 11). A body lying in low sun throws a broad, soft
  // shadow on its far side, as deep as the body is thick, attached all along its edge: the silhouette swept along SH
  // up to its height. The head and the upturned feet stand higher and stick out further. A raised arm's shadow is a
  // long thin stroke that starts at the shoulder on the grass and runs out to the hand's shadow. Everything is drawn
  // opaque into one layer, then laid down once, so overlapping parts don't darken twice.
  const SHL = document.createElement('canvas'); SHL.width = 960; SHL.height = 720;
  const shl = SHL.getContext('2d');
  const BODY = { legs: 7.5, torso: 11, head: 13.5, feet: 15 };   // heights off the grass, kid-local units
  function kidShadows(g, t) {
    const m = g.getTransform(), zoom = Math.hypot(m.a, m.b);
    shl.setTransform(1, 0, 0, 1, 0, 0); shl.clearRect(0, 0, 960, 720); shl.setTransform(m);
    shl.fillStyle = shl.strokeStyle = '#000'; shl.lineCap = 'round'; shl.lineJoin = 'round';
    const at = (w, h) => [w[0] + SH[0] * h * SHK, w[1] + SH[1] * h * SHK];
    for (const k of ['me', 'hider']) {
      const d = KD[k], R = raised(k, t), p = pose(k, t);
      p.props = [];
      if (R.r > 0.02) p.armF = [SHOULDER, SHOULDER];   // the raised arm throws its own shadow below
      const sweep = (hUnits, draw) => {
        const hpx = hUnits * d.s, n = Math.max(2, Math.ceil(hpx * SHK / 3));
        for (let i = 0; i <= n; i++) {
          const o = SH.map((v) => v * hpx * SHK * i / n);
          shl.save(); shl.translate(o[0], o[1]); shl.translate(d.origin[0], d.origin[1]); shl.rotate(d.rot); draw(); shl.restore();
        }
      };
      sweep(BODY.legs, () => drawKid(shl, d.kid, p, 0, 0, KH, '#000'));
      sweep(BODY.torso, () => { shl.scale(d.s, d.s); shl.beginPath(); shl.ellipse(0, -63, 10.5, 15, 0, 0, TAU); shl.fill(); });
      sweep(BODY.head, () => { shl.scale(d.s, d.s); shl.beginPath(); shl.arc(p.head[0], p.head[1], 9.5, 0, TAU); shl.fill(); });
      sweep(BODY.feet, () => { shl.scale(d.s, d.s); for (const L of [p.legF, p.legB]) { shl.beginPath(); shl.ellipse(L[1][0], L[1][1] - 1.4, 3.6, 2.6, 0, 0, TAU); shl.fill(); } });
      if (R.r > 0.02) {   // the raised arm: shoulder (on the grass, at torso height) out to the hand at its height
        const s0 = at(R.sh, BODY.torso * d.s * 0.8), hd = at(R.hand, R.H);
        const u0 = [hd[0] - s0[0], hd[1] - s0[1]], ul = Math.hypot(u0[0], u0[1]) || 1, u = [u0[0] / ul, u0[1] / ul];
        const w = d.s;
        shl.lineWidth = 6.4 * w; shl.beginPath(); shl.moveTo(s0[0], s0[1]); shl.lineTo(hd[0], hd[1]); shl.stroke();
        void u;
        // the hand's shadow is the hand itself, open fingers and all, laid on the grass where the sun throws it
        // (Robin, Nov 11: the old blob-and-stub shadow still read as a pointing finger)
        const off = [hd[0] - R.hand[0], hd[1] - R.hand[1]];
        shl.save(); shl.translate(off[0], off[1]); shl.translate(d.origin[0], d.origin[1]); shl.rotate(d.rot); shl.scale(d.s, d.s);
        handTraced(shl, k, toL(k, R.hand), 1, t);
        shl.restore();
      }
    }
    // tint the opaque layer to the grass's shadow colour, then lay it down once, soft at the edge
    shl.setTransform(1, 0, 0, 1, 0, 0);
    shl.globalCompositeOperation = 'source-in'; shl.fillStyle = 'rgb(28,38,8)'; shl.fillRect(0, 0, 960, 720);
    shl.globalCompositeOperation = 'source-over';
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 0.58; g.filter = `blur(${(1.6 * zoom).toFixed(2)}px)`; g.drawImage(SHL, 0, 0);
    g.restore();
  }
  function cloudShadows(g, t) {
    const v = [32, 13];  // px per second, with the wind
    for (const c of CLOUDS) {
      const cx = c.x + v[0] * (t - T0), cy = c.y + v[1] * (t - T0);
      for (const [dx, dy, r] of c.blobs) {
        const x = cx + dx, y = cy + dy;
        const cg = g.createRadialGradient(x, y, r * 0.2, x, y, r);
        cg.addColorStop(0, 'rgba(40,52,40,.22)'); cg.addColorStop(0.7, 'rgba(40,52,40,.12)'); cg.addColorStop(1, 'rgba(40,52,40,0)');
        g.fillStyle = cg; g.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
    }
  }

  function shapes(g, t) {
    for (const k of ['me', 'hider']) {
      const d = KD[k];
      g.save(); g.translate(d.origin[0], d.origin[1]); g.rotate(d.rot);
      drawKid(g, d.kid, pose(k, t), 0, 0, KH, C.kid);
      g.restore();
    }
  }
  // the raised arms are up in full sun: drawn again over the rim pass with a warm sun-side edge, so a hand
  // reads on its own even where it crosses a dark head or shoulder
  function over(g, t) {
    for (const k of ['me', 'hider']) {
      const R = raised(k, t);
      if (R.r < 0.3) continue;
      const d = KD[k], p = pose(k, t);
      g.save(); g.translate(d.origin[0], d.origin[1]); g.rotate(d.rot); g.scale(d.s, d.s);
      const hl = p.armF[1], el = p.armF[0];
      const c = Math.cos(-d.rot), sn = Math.sin(-d.rot), sunL = [SUNDIR[0] * c - SUNDIR[1] * sn, SUNDIR[0] * sn + SUNDIR[1] * c];
      const up0 = L2(SHOULDER, el, 0.45);   // the whole raised arm, so it reads where it crosses a dark head
      const draw = (col, off) => {
        g.save(); g.translate(off[0], off[1]);
        g.fillStyle = g.strokeStyle = col; g.lineCap = 'round';
        g.lineWidth = 6.2; g.lineJoin = 'round'; g.beginPath(); g.moveTo(up0[0], up0[1]); g.lineTo(el[0], el[1]); g.lineTo(hl[0], hl[1]); g.stroke();
        handShape(g, k, hl, R.big, t);
        g.restore();
      };
      g.globalAlpha = Math.min(1, (R.r - 0.3) / 0.4);
      draw('rgba(255,224,150,.95)', [sunL[0] * 0.7, sunL[1] * 0.7]);
      g.globalAlpha = 1;
      draw('#2b1e22', [0, 0]);
      g.restore();
    }
  }

  const CAM = [
    [T0, 482, 358, 1.0], [AND_I, 478, 362, 1.04], [YOU1, 472, 366, 1.1], [OH, 466, 372, 1.12],
    [LOVE2, 468, 366, 1.36], [YOU2 + 0.6, 478, 356, 1.5], [T1, 480, 354, 1.54],   // push in on the touching hands
  ];
  const FOCUS = [[T0, 1.8], [245.9, 0.2], [246.3, 0], [YOU1 + 0.3, 0], [YOU1 + 0.6, 0.9], [249.4, 0], [YOU2 + 0.7, 0], [YOU2 + 1.1, 1.1], [YOU2 + 1.6, 0]];

  SCENE.add({
    id: 'grass', t0: T0, t1: T1,
    stamp: () => ({ date: 'SEP.12 1992', time: '5:10PM' }),
    camera: CAMKIT.rig(CAM, FOCUS, 11, 1),
    bg, shapes, over,
    light: { rim: '#ffe2a0', glow: 'rgba(255,214,140,.7)', glowBlur: 6, rimW: 1.7, sunDir: SUNDIR },
    grade: { bright: 1.05, contrast: 1.05, sat: 1.08 },
  });
})();
