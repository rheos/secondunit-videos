// scenes/tree.js · verse 3a, the treehouse (JUL.04 1992, 1:30PM). Mother films from the lawn, looking up at the
// treehouse in a big tree with the sun behind the crown. The little sister writes her diary in the window, sees the
// camera, hugs the diary and pulls the curtain shut, then comes out onto the platform and looks at the horizon with
// her braid lifting in the wind. Pure in t. World units: the 960x720 frame at zoom 1.
(function () {
  const T = window.TIMING, S = T.scenes;
  const { KIDS, drawKid, poses: P, lerpPose } = window.CAST;
  const TAU = Math.PI * 2;
  const T0 = S.tree, T1 = S.brother;

  // ---- hits (song seconds, vocal-stem onsets from the brief) ---------------------------------------------
  const TILT_END = 127.40;   // the tilt up the trunk lands on the treehouse
  const TRYING = 127.94;     // first word, held: she is writing in the window
  const SISTER = 133.52;     // the zoom has her framed by the window
  const TRYING2 = 136.24;    // she stops, pen to her mouth, thinking
  const RESUME = 138.70;     // back to writing
  const OUT_A = 142.47;      // the zoom eases out...
  const HOUSE = 144.22;      // ...to the whole treehouse in the tree
  const IN_B = 148.60;       // mother zooms back in on the window
  const LOOK = 150.44;       // she looks up and sees the camera
  const HUG = 151.00;        // diary hugged to her chest
  const PULL = 151.70;       // she reaches for the curtain
  const SHUT = 152.22;       // the curtain is shut, on the word
  const RISE = 152.60;       // behind the curtain she gets up...
  const WALK_IN = 153.15;    // ...and walks to the door
  const COME_OUT = 154.08;   // she steps out onto the platform
  const AT_RAIL = 155.80;    // stops at the rail, looking out
  const BE = 160.12;         // last word: a gust lifts the braid, focus lands

  const SUN = [660, -80];
  const HOR = 905;           // the far hedge line on the lawn, seen at the very start
  const WIN = { x0: 420, x1: 520, y0: 210, y1: 298 };   // the front window opening
  const HOUSE_X0 = 360, HOUSE_X1 = 610, WALL_Y0 = 182, FLOOR_Y = 340;
  const RAIL_X = [652, 730, 806], RAIL_TOP = 284, PLAT_X1 = 816;
  const SIS_H = 170;         // h for the sister up in the house
  const COL = { kid: '#261a1e', wood: '#2a1d15', trunk: '#23180f', leaf: '#1c2516', rope: '#2b2118' };

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const sm = (x) => x * x * (3 - 2 * x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  }
  function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); g.fill(); }

  // ---- the tree, laid out once ---------------------------------------------------------------------------
  const R = rng(1992704);
  const lobes = [[490, -70, 330, 185], [250, 30, 175, 120], [745, 20, 185, 120], [370, -215, 175, 110], [625, -220, 185, 110],
    [480, 95, 210, 80], [180, 150, 95, 70], [835, 140, 75, 55], [90, 60, 80, 60]];
  const inLobe = (x, y, k = 1) => lobes.some(([lx, ly, rx, ry]) => ((x - lx) / (rx * k)) ** 2 + ((y - ly) / (ry * k)) ** 2 < 1);
  // the crown: solid lobes inside, a thick band of small leaf clusters at the edge (so the outline is leafy, never
  // round bubbles), and holes cut through it where the sky and the sun show
  const edge = [], holes = [];
  for (let i = 0; i < 90000 && edge.length < 2600; i++) {
    const x = -260 + R() * 1420, y = -380 + R() * 680;
    if (inLobe(x, y, 1.1) && !inLobe(x, y, 0.8)) edge.push([x, y, 3 + R() * 8 * (inLobe(x, y, 0.97) ? 1.3 : 0.6), R() * TAU]);
  }
  const nearHouse = (x, y) => x > 300 && x < 680 && y > 40;
  for (let i = 0; i < 20000 && holes.length < 20; i++) {
    const x = -120 + R() * 1200, y = -330 + R() * 560;
    if (inLobe(x, y, 0.78) && !nearHouse(x, y)) {
      const c = [], n = 3 + Math.floor(R() * 4), r0 = 3 + R() * 6;
      for (let k = 0; k < n; k++) c.push([x + (R() - 0.5) * r0 * 2.2, y + (R() - 0.5) * r0 * 1.6, r0 * (0.45 + R() * 0.6)]);
      holes.push(c);
    }
  }
  const CLOUDS = [[1060, 300, 1.2], [880, 540, 0.8], [-80, 380, 1.0], [1240, -60, 1.4], [120, 640, 0.7]];
  const PUFFS = [[0, 0, 60], [55, 10, 46], [-50, 12, 44], [24, -30, 42], [-22, -22, 36], [95, 20, 30], [-90, 22, 28]];
  const hedge = [];
  for (let x = -700; x < 1700; x += 14 + R() * 22) hedge.push([x, HOR - 18 - R() * 26, 18 + R() * 22]);
  const farTrees = [[-260, 760, 120], [-120, 800, 90], [1180, 770, 130], [1320, 810, 100], [1050, 835, 70]];
  const tufts = [];
  for (let i = 0; i < 500; i++) tufts.push([-600 + R() * 2200, HOR + 8 + Math.pow(R(), 1.3) * 380, R(), R()]);

  // the wind: a steady breeze from the right, and a gust that peaks on the last word
  const gust = (t) => 0.35 + 0.25 * Math.sin(t * 0.7) + 0.9 * Math.exp(-(((t - BE - 0.15) / 1.1) ** 2));
  const sway = (t, i) => (2.0 * Math.sin(t * 1.3 + i) + 1.1 * Math.sin(t * 2.9 + i * 1.7)) * (0.6 + 0.6 * gust(t));

  // ---- background: sky, sun, far yard, the bright inside of the treehouse ---------------------------------
  function bg(g, t) {
    const sky = g.createLinearGradient(0, -700, 0, HOR);
    sky.addColorStop(0, '#4c7cbd'); sky.addColorStop(0.4, '#8fb2d6'); sky.addColorStop(0.72, '#c9d8df'); sky.addColorStop(1, '#f1e8cc');
    g.fillStyle = sky; g.fillRect(-1600, -1600, 4200, HOR + 1600);
    const sg = g.createRadialGradient(SUN[0], SUN[1], 4, SUN[0], SUN[1], 640);
    sg.addColorStop(0, 'rgba(255,255,250,1)'); sg.addColorStop(0.07, 'rgba(255,252,236,.95)'); sg.addColorStop(0.25, 'rgba(255,240,200,.55)'); sg.addColorStop(1, 'rgba(255,236,200,0)');
    g.fillStyle = sg; g.fillRect(SUN[0] - 700, SUN[1] - 700, 1400, 1400);
    // a few summer clouds drifting slowly left, lit warm on the sun side
    for (const [cx0, cy, sc] of CLOUDS) {
      const cx = cx0 - (t - T0) * 3.2;
      for (const [dx, dy, r] of PUFFS) {
        const px = cx + dx * sc, py = cy + dy * sc, rr = r * sc;
        const cg = g.createRadialGradient(px + rr * 0.25, py - rr * 0.3, rr * 0.1, px, py, rr);
        cg.addColorStop(0, 'rgba(255,252,240,.75)'); cg.addColorStop(0.7, 'rgba(240,242,240,.45)'); cg.addColorStop(1, 'rgba(230,236,240,0)');
        g.fillStyle = cg; g.beginPath(); g.arc(px, py, rr, 0, TAU); g.fill();
      }
    }
    // the far side of the yard: hazy trees, a hedge, a fence line
    g.fillStyle = '#a9b29a';
    for (const [x, y, r] of farTrees) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillRect(x - 6, y, 12, HOR - y); }
    g.fillStyle = '#7f8b5a';
    for (const [x, y, r] of hedge) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillRect(-1600, HOR - 22, 4200, 24);
    g.strokeStyle = 'rgba(232,226,206,.85)'; g.lineWidth = 3;
    for (let x = -700; x < 1700; x += 22) { g.beginPath(); g.moveTo(x, HOR + 2); g.lineTo(x, HOR - 22); g.stroke(); }
    g.lineWidth = 2.4; g.beginPath(); g.moveTo(-1600, HOR - 15); g.lineTo(2600, HOR - 15); g.moveTo(-1600, HOR - 5); g.lineTo(2600, HOR - 5); g.stroke();
    // lawn, lit from above, with the tree's dappled shade near its foot
    const gr = g.createLinearGradient(0, HOR, 0, HOR + 420);
    gr.addColorStop(0, '#c2c27a'); gr.addColorStop(0.2, '#98a453'); gr.addColorStop(1, '#5b6a2c');
    g.fillStyle = gr; g.fillRect(-1600, HOR, 4200, 900);
    g.save(); g.translate(490, 980); g.scale(1, 0.16);
    const sh = g.createRadialGradient(0, 0, 10, 0, 0, 520); sh.addColorStop(0, 'rgba(40,52,20,.55)'); sh.addColorStop(1, 'rgba(40,52,20,0)');
    g.fillStyle = sh; g.fillRect(-600, -600, 1200, 1200); g.restore();
    for (const [x, y, a, b] of tufts) {
      const k = (y - HOR) / 380, h = 3 + k * 10;
      g.strokeStyle = `rgba(${52 + a * 30 | 0},${74 + a * 30 | 0},${26 + b * 12 | 0},${0.35 + k * 0.4})`; g.lineWidth = 0.7 + k * 1.4;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 1, y - h * 0.6, x + (a - 0.5) * h, y - h); g.stroke();
    }
    // the inside of the treehouse, seen through the front window: the sun pours in through a back window
    const { x0, x1, y0, y1 } = WIN;
    const inn = g.createLinearGradient(x0, y0, x1, y1);
    inn.addColorStop(0, '#f2c98a'); inn.addColorStop(0.5, '#ffe6b4'); inn.addColorStop(1, '#e9b878');
    g.fillStyle = inn; g.fillRect(x0 - 6, y0 - 6, x1 - x0 + 12, y1 - y0 + 12);
    const bw = { x0: x0 + 22, x1: x1 - 16, y0: y0 + 10, y1: y1 - 22 };   // the back window, blazing
    const bl = g.createRadialGradient((bw.x0 + bw.x1) / 2, (bw.y0 + bw.y1) / 2, 4, (bw.x0 + bw.x1) / 2, (bw.y0 + bw.y1) / 2, 60);
    bl.addColorStop(0, '#fffdf4'); bl.addColorStop(0.6, '#fff4d4'); bl.addColorStop(1, '#ffe2a8');
    g.fillStyle = bl; g.fillRect(bw.x0, bw.y0, bw.x1 - bw.x0, bw.y1 - bw.y0);
    g.fillStyle = 'rgba(190,206,140,.45)';   // leaves outside the back window, washed out
    for (const [dx, dy, r] of [[8, 14, 9], [20, 8, 7], [44, 30, 10], [56, 12, 8]]) { g.beginPath(); g.arc(bw.x0 + dx + Math.sin(t * 1.3 + dx) * 1.5, bw.y0 + dy, r, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(176,128,72,.55)';   // the back window's cross bars
    g.fillRect((bw.x0 + bw.x1) / 2 - 1.5, bw.y0, 3, bw.y1 - bw.y0); g.fillRect(bw.x0, (bw.y0 + bw.y1) / 2 - 1.5, bw.x1 - bw.x0, 3);
    g.fillStyle = 'rgba(150,96,50,.35)';    // a sunlit shelf and the floor edge inside
    g.fillRect(x0, y1 - 14, x1 - x0, 4);
  }

  // ---- the sister -----------------------------------------------------------------------------------------
  const SIS = { ...KIDS.sister, hair: 'none' };   // her braid is drawn by braidProp so the wind can lift it
  const KR = 12.4;                                  // kid head radius in cast.js
  // her hair cap and braid, the same shapes as cast.js, but the braid can swing up and back (lift 0..1)
  function braidProp(pose, swing, lift) {
    return (g) => {
      const [x, y] = pose.head, f = pose.face || 0;
      ell(g, x - f * 1.2, y - 3, KR * 1.05, KR * 0.94);
      const bx = f === 0 ? 0.3 : -f, base = [x + bx * KR * 0.7, y + 2];
      const a = -Math.sign(bx || 1) * lift * 1.25;      // rotate the hanging braid toward behind and up
      const rot = (v) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
      for (let i = 0; i < 4; i++) {
        const v = rot([bx * (2 + i * 1.5) + Math.sin(swing + i * 0.4) * i * 1.6, 4 + i * 5 + lift * Math.sin(swing * 2.3 + i) * i * 0.8]);
        ell(g, base[0] + v[0], base[1] + v[1], 3.6 - i * 0.35, 3.2);
      }
      const v = rot([bx * 8 + Math.sin(swing + 1.6) * 6, 25]);
      ell(g, base[0] + v[0], base[1] + v[1], 2.6, 2.2);
    };
  }
  const diaryProp = (c, ang) => (g) => { g.save(); g.translate(c[0], c[1]); g.rotate(ang); g.fillRect(-9, -12, 18, 24); g.restore(); };
  const penProp = (hand, ang) => (g) => { g.lineWidth = 1.6; g.beginPath(); g.moveTo(hand[0], hand[1]); g.lineTo(hand[0] + Math.cos(ang) * 8, hand[1] + Math.sin(ang) * 8); g.stroke(); };

  // kneeling on the window bench in profile, bent over the open diary lying on the sill, writing.
  // think 0..1: sits up, pen to her mouth.
  const BOOK = [34, -10.5];   // the open diary on the sill, in her local units
  function writeSill(ph, think) {
    const w = Math.sin(ph * TAU * 3), lift = Math.abs(Math.sin(ph * TAU * 6));
    const hip = [0, -8];
    const chest = lerpPt([11, -33], [7, -36], think), head = lerpPt([22, -41.5], [16, -48], think);
    const hand = lerpPt([29 + 2.6 * w, -12.5 - 1.3 * lift], add(head, [8.5, 6.5]), think);
    const elbow = lerpPt([16, -17], [19, -22], think);
    return { hip, chest, head, face: 1, legF: [[16, -4], [2, -1]], legB: [[14, -5], [0, 0]],
      armF: [elbow, hand], armB: [[12, -19], [39, -11.5]], toe: 1 };
  }
  const openBook = (c) => (g) => {
    g.save(); g.translate(c[0], c[1]);
    g.beginPath(); g.moveTo(-12, 0.5); g.lineTo(-11.5, -3.4); g.quadraticCurveTo(-5, -4.6, 0, -1.8); g.quadraticCurveTo(5, -4.6, 11.5, -3.4); g.lineTo(12, 0.5); g.closePath(); g.fill();
    g.restore();
  };
  // kneeling facing the camera on the window bench: hug 0..1 crosses the arms over the diary, elbows out
  function kneelFront(hug) {
    const hip = [0, -8], chest = [0, -37], head = [0, -50];
    const armF = [[lerp(10, 14.5, hug), lerp(-24, -27, hug)], [lerp(4, -7, hug), lerp(-22, -33, hug)]];
    const armB = [[lerp(-10, -14.5, hug), lerp(-24, -27, hug)], [lerp(-2, 7, hug), lerp(-22, -34, hug)]];
    return { hip, chest, head, face: 0, legF: [[5, -3], [7, -1]], legB: [[-5, -3], [-7, -1]], armF, armB };
  }
  function sister(t) {
    const x = 444, y = 306;  // on the bench inside the window
    const swing = -0.25 + 0.18 * Math.sin(t * 1.9);
    if (t < LOOK) {
      // writing; on the second "trying" the pen goes to her mouth while she thinks
      const think = sm(seg(t, TRYING2, TRYING2 + 0.45)) * (1 - sm(seg(t, RESUME - 0.4, RESUME)));
      const ph = (t - T0) * 0.45;
      const p = writeSill(ph, think);
      p.props = [openBook(BOOK), penProp(p.armF[1], lerp(-2.25, 0.5, think)), braidProp(p, swing, 0)];
      return { x, y, pose: p, in: true };
    }
    if (t < HUG) {
      // looks up and turns her face to the camera, the diary comes up off her knee
      const k = sm(seg(t, LOOK, LOOK + 0.5));
      const p = lerpPose(writeSill(0, 0), kneelFront(0), k);
      p.face = k < 0.45 ? 1 : 0;
      const dc = lerpPt(BOOK, [1, -26], k);
      p.props = [k < 0.35 ? openBook(dc) : diaryProp(dc, 0.2 * k), braidProp(p, swing, 0)];
      return { x, y, pose: p, in: true };
    }
    if (t < PULL) {
      const k = sm(seg(t, HUG, HUG + 0.35));
      const p = kneelFront(k);
      p.head = add(p.head, [0, 1.5 * k]);   // chin tucks over the diary
      p.props = [diaryProp(lerpPt([1, -26], [5, -38], k), lerp(0.2, 0.5, k)), braidProp(p, swing, 0)];
      return { x, y, pose: p, in: true };
    }
    const sx = 1 / (SIS_H / 100 * SIS.size);
    if (t < RISE) {
      // the free hand reaches to the bunched curtain on the right and sweeps it shut, on the word
      const p = kneelFront(1);
      const ex = curtainEdge(t);
      const reach = sm(seg(t, PULL, PULL + 0.22));
      const hand = lerpPt(p.armF[1], [(ex - x) * sx, -38], reach);
      p.armF = [lerpPt(p.armF[0], [lerp(10, (ex - x) * sx * 0.55, reach), -34], reach), hand];
      p.armB = [[-14.5, -27], [6, -35]];
      p.props = [diaryProp([5, -38], 0.5), braidProp(p, swing, 0)];
      return { x, y, pose: p, in: true };
    }
    if (t < WALK_IN) {
      // behind the curtain: she gets up (her shadow rises in the window)
      const k = sm(seg(t, RISE, WALK_IN));
      const p = lerpPose(kneelFront(1), P.stand(1), k);
      p.props = [braidProp(p, swing, 0)];
      return { x: x + 6 * k, y: lerp(y, FLOOR_Y, k), pose: p, in: true };
    }
    if (t < COME_OUT) {
      // walks right, behind the curtain, toward the door
      const u = seg(t, WALK_IN, COME_OUT);
      const p = P.run((t - WALK_IN) * 1.5, 1, { energy: 0.3 });
      p.props = [braidProp(p, swing, 0)];
      return { x: lerp(x + 6, HOUSE_X1 - 10, u), y: FLOOR_Y, pose: p, in: true };
    }
    // out on the platform: walks to the rail, stops, looks out at the horizon in the wind
    const wx0 = HOUSE_X1 - 10, wx1 = 724;
    const g0 = gust(t), lift = clamp(0.25 + 0.75 * (g0 - 0.35), 0, 1);
    const wsw = -0.55 - 0.25 * g0 + 0.3 * Math.sin(t * 3.1) * (0.4 + g0) + 0.12 * Math.sin(t * 7.3);
    if (t < AT_RAIL) {
      const u = seg(t, COME_OUT, AT_RAIL);
      const e = u < 0.85 ? u / 0.85 * 0.93 : 0.93 + 0.07 * sm((u - 0.85) / 0.15);
      const walk = P.run((t - COME_OUT) * 1.15, 1, { energy: 0.45 });
      const p = u > 0.8 ? lerpPose(walk, atRail(t), sm((u - 0.8) / 0.2)) : walk;
      p.props = [braidProp(p, wsw, lift * 0.7)];
      return { x: lerp(wx0, wx1, e), y: FLOOR_Y, pose: p, in: false };
    }
    const p = atRail(t);
    p.hem = -2.5 * g0 + 1.2 * Math.sin(t * 4.1);
    p.props = [braidProp(p, wsw, lift)];
    return { x: wx1, y: FLOOR_Y, pose: p, in: false };
  }
  function lerpPt(a, b, k) { return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; }
  // standing at the rail in profile, hands on the top rail, chin lifted toward the horizon
  function atRail(t) {
    const p = P.stand(1);
    const sx = 1 / (SIS_H / 100 * SIS.size), railY = (RAIL_TOP - FLOOR_Y) * sx;
    const up = sm(seg(t, AT_RAIL + 0.6, AT_RAIL + 2.2)) + 0.3 * sm(seg(t, BE - 0.5, BE + 0.3));
    p.head = add(p.head, [1.5 + 1.2 * up, -0.6 * up]);
    p.armF = [add(p.chest, [9, 12]), [17, railY + 1]];
    p.armB = [add(p.chest, [6, 13]), [13, railY + 2]];
    return p;
  }

  // the curtain: back-lit gingham on a rod across the top of the window, bunched on the right until pulled
  function curtainEdge(t) {
    const k = seg(t, PULL + 0.12, SHUT);
    const e = k * k * (3 - 2 * k);
    return lerp(WIN.x1 - 15, WIN.x0, e);
  }
  function curtain(g, t) {
    const ex = curtainEdge(t), { x1, y0, y1 } = WIN;
    const w = x1 - ex, wind = 1.2 * Math.sin(t * 2.1) * (t > SHUT ? 1 : 0.3);
    g.save();
    g.beginPath(); g.moveTo(ex, y0 + 2); g.lineTo(x1 + 2, y0 + 2); g.lineTo(x1 + 2, y1 + 1);
    g.quadraticCurveTo((ex + x1) / 2, y1 + 3, ex + wind, y1 + 1); g.closePath();
    g.clip();
    g.fillStyle = 'rgba(252,196,138,.80)'; g.fillRect(ex - 4, y0, w + 8, y1 - y0 + 4);
    g.fillStyle = 'rgba(206,92,64,.30)';   // the check, squeezed together where the cloth is bunched
    const cols = 10, cw = Math.max(1.4, w / cols);
    for (let i = 0; i < cols; i++) { if (i % 2) g.fillRect(ex + i * cw, y0, cw, y1 - y0 + 4); }
    for (let y = y0; y < y1 + 4; y += 10) g.fillRect(ex, y, w + 4, 5);
    g.fillStyle = 'rgba(120,50,30,.16)';   // folds
    for (let i = 0; i < 6; i++) { const fx = ex + (i + 0.5) * w / 6; g.fillRect(fx - Math.max(0.6, w / 40), y0, Math.max(1.2, w / 20), y1 - y0 + 4); }
    g.restore();
    g.fillStyle = COL.wood; g.fillRect(WIN.x0 - 6, y0 - 1, x1 - WIN.x0 + 12, 4);   // the rod
  }

  // ---- the shapes ----------------------------------------------------------------------------------------
  function treeShape(g, t) {
    g.fillStyle = COL.trunk; g.strokeStyle = COL.trunk; g.lineCap = 'round'; g.lineJoin = 'round';
    // trunk, flaring into roots on the lawn
    g.beginPath();
    g.moveTo(400, 985); g.quadraticCurveTo(452, 960, 452, 880); g.lineTo(462, 150); g.lineTo(522, 150); g.lineTo(530, 880);
    g.quadraticCurveTo(532, 962, 592, 988); g.quadraticCurveTo(540, 992, 494, 984); g.quadraticCurveTo(450, 992, 400, 985); g.fill();
    g.lineWidth = 34; g.beginPath(); g.moveTo(470, 170); g.quadraticCurveTo(380, 80, 250, 30); g.stroke();
    g.lineWidth = 30; g.beginPath(); g.moveTo(512, 160); g.quadraticCurveTo(620, 60, 760, 10); g.stroke();
    g.lineWidth = 26; g.beginPath(); g.moveTo(490, 150); g.quadraticCurveTo(470, 0, 430, -170); g.stroke();
    g.lineWidth = 22; g.beginPath(); g.moveTo(500, 130); g.quadraticCurveTo(560, -40, 640, -190); g.stroke();
    g.lineWidth = 16; g.beginPath(); g.moveTo(455, 330); g.quadraticCurveTo(330, 260, 190, 165); g.stroke();
    // the branch under the platform
    g.lineWidth = 20; g.beginPath(); g.moveTo(520, 470); g.quadraticCurveTo(650, 400, 780, 352); g.stroke();
  }
  function crownShape(g, t) {
    g.fillStyle = COL.leaf;
    lobes.forEach(([lx, ly, rx, ry], i) => ell(g, lx + sway(t, i) * 0.5, ly, rx * 0.84, ry * 0.84));
    for (let i = 0; i < edge.length; i++) {
      const [x, y, r, a] = edge[i], dx = sway(t, i % 40) * 1.4, dy = sway(t, (i % 40) + 4) * 0.5;
      ell(g, x + dx, y + dy, r, r * 0.72, a);
    }
    g.save(); g.globalCompositeOperation = 'destination-out';
    holes.forEach((c, i) => { const dx = sway(t, i) * 0.9; for (const [x, y, r] of c) { g.beginPath(); g.arc(x + dx, y, r, 0, TAU); g.fill(); } });
    g.restore();
  }
  function house(g, t) {
    g.fillStyle = COL.wood; g.strokeStyle = COL.wood; g.lineCap = 'butt'; g.lineJoin = 'miter';
    const { x0, x1, y0, y1 } = WIN;
    // walls with the window cut out (even-odd), a sill below it
    g.beginPath();
    g.rect(HOUSE_X0, WALL_Y0, HOUSE_X1 - HOUSE_X0, FLOOR_Y - WALL_Y0);
    g.rect(x0, y0, x1 - x0, y1 - y0);
    g.fill('evenodd');
    g.fillRect(x0 - 9, y1, x1 - x0 + 18, 6);
    // gable roof with an overhang, ragged shingle edge
    g.beginPath(); g.moveTo(HOUSE_X0 - 22, WALL_Y0 + 8); g.lineTo(485, 98); g.lineTo(HOUSE_X1 + 22, WALL_Y0 + 8);
    for (let x = HOUSE_X1 + 22; x > HOUSE_X0 - 22; x -= 16) g.lineTo(x - 8, WALL_Y0 + 12 + ((x / 16) % 2 ? 2 : 0));
    g.closePath(); g.fill();
    // floor beam and the platform running out to the right
    g.fillRect(HOUSE_X0 - 14, FLOOR_Y, PLAT_X1 - HOUSE_X0 + 14, 11);
    g.lineWidth = 7; g.beginPath(); g.moveTo(HOUSE_X0 + 20, FLOOR_Y + 10); g.lineTo(462, 430); g.moveTo(HOUSE_X1 - 30, FLOOR_Y + 10); g.lineTo(528, 420); g.stroke();
    // rail: posts and two rails
    g.lineWidth = 6; for (const x of RAIL_X) { g.beginPath(); g.moveTo(x, FLOOR_Y + 2); g.lineTo(x, RAIL_TOP - 4); g.stroke(); }
    g.fillRect(HOUSE_X1, RAIL_TOP - 4, RAIL_X[2] - HOUSE_X1 + 6, 6);
    g.fillRect(HOUSE_X1, RAIL_TOP + 26, RAIL_X[2] - HOUSE_X1 + 6, 4);
    // the rope ladder hanging from the platform end, swinging a little in the breeze
    const ang = 0.035 * Math.sin(t * 1.15) * (0.6 + gust(t) * 0.6);
    g.save(); g.translate(772, FLOOR_Y + 8); g.rotate(ang);
    g.strokeStyle = COL.rope; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-14, 0); g.quadraticCurveTo(-15, 150, -13, 300); g.moveTo(14, 0); g.quadraticCurveTo(13, 150, 15, 300); g.stroke();
    g.lineWidth = 4.5; for (let y = 26; y < 300; y += 28) { g.beginPath(); g.moveTo(-15, y); g.lineTo(15, y + 1); g.stroke(); }
    g.restore();
    // a little flag on the roof peak for the Fourth, snapping in the wind
    g.lineWidth = 2.5; g.beginPath(); g.moveTo(485, 100); g.lineTo(487, 40); g.stroke();
    const fl = gust(t);
    g.beginPath(); g.moveTo(487, 42);
    for (let i = 1; i <= 6; i++) { const fx = 487 - i * 6.5, fy = 42 + Math.sin(t * 9 - i * 0.9) * (1.2 + fl) + i * 0.5 * (1 - fl * 0.5); g.lineTo(fx, fy); }
    for (let i = 6; i >= 0; i--) { const fx = 487 - i * 6.5, fy = 62 + Math.sin(t * 9 - i * 0.9) * (1.2 + fl) + i * 0.5 * (1 - fl * 0.5); g.lineTo(fx, fy); }
    g.closePath(); g.fill();
  }
  function shapes(g, t) {
    treeShape(g, t);   // the branches first: the leaves hide them, the holes show bits of them
    crownShape(g, t);
    // the window looks through the house to the bright back window: nothing of the tree shows in it
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
    g.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0); g.restore();
    const s = sister(t);
    if (s.in) drawKid(g, SIS, s.pose, s.x, s.y, SIS_H, COL.kid);
    house(g, t);
    if (!s.in) drawKid(g, SIS, s.pose, s.x, s.y, SIS_H, COL.kid);
    if (!s.in) {  // the rail is in front of her legs
      g.fillStyle = COL.wood; g.fillRect(HOUSE_X1, RAIL_TOP + 26, RAIL_X[2] - HOUSE_X1 + 6, 4);
    }
  }
  // after the rim pass: the curtain glowing with the sun behind it, light leaking through board gaps, sun glints
  function over(g, t) {
    curtain(g, t);
    // plank seams across the walls, faint, and a few gaps where the sun leaks through between boards
    g.fillStyle = 'rgba(255,226,170,.07)';
    for (let y = WALL_Y0 + 17; y < FLOOR_Y - 4; y += 17) {
      if (y > WIN.y0 - 4 && y < WIN.y1 + 8) { g.fillRect(HOUSE_X0, y, WIN.x0 - 9 - HOUSE_X0, 1); g.fillRect(WIN.x1 + 9, y, HOUSE_X1 - WIN.x1 - 9, 1); }
      else g.fillRect(HOUSE_X0, y, HOUSE_X1 - HOUSE_X0, 1);
    }
    g.fillStyle = 'rgba(255,236,180,.5)';
    for (const [x, y, w] of [[376, WALL_Y0 + 34, 22], [548, WALL_Y0 + 68, 34], [532, WALL_Y0 + 136, 18]]) g.fillRect(x, y, w, 1.1);
  }

  // ---- camera: mother on the lawn, handheld, zoom rocker -----------------------------------------------
  const KEYS = [
    [T0, 500, 770, 1.0], [125.3, 498, 748, 1.0], [TILT_END, 482, 262, 1.15], [TRYING, 478, 258, 1.18],
    [SISTER, 468, 256, 3.25], [135.2, 470, 255, 3.45], [OUT_A, 471, 257, 3.4],
    [HOUSE + 0.35, 520, 118, 0.8], [IN_B, 516, 124, 0.82], [LOOK - 0.1, 474, 256, 2.9], [RISE, 476, 256, 2.9],
    [COME_OUT, 620, 266, 1.8], [AT_RAIL, 708, 270, 1.8], [157.3, 716, 272, 2.1], [158.1, 742, 278, 3.25],
    [158.7, 740, 278, 2.75], [159.7, 744, 280, 3.4], [BE, 744, 280, 3.3], [164.5, 746, 278, 3.3], [T1, 742, 276, 3.2],
  ];
  const FOCUS = [
    [T0, 1.2], [125.3, 0.4], [126.4, 1.2], [127.2, 2.0], [128.1, 0.3], [128.6, 0], [130.6, 0], [131.1, 1.6], [131.6, 0.3],
    [132.1, 0.8], [132.7, 0], [135.1, 0], [135.5, 1.2], [135.95, 0], [OUT_A, 0], [143.3, 2.4], [144.4, 0.4], [144.9, 1.0],
    [145.5, 0], [149.4, 0], [149.9, 1.6], [150.3, 0.2], [150.7, 0], [153.4, 0], [153.9, 1.5], [154.5, 0.3], [155.0, 0],
    [157.2, 0.2], [157.8, 2.6], [158.3, 0.6], [158.8, 2.0], [159.4, 0.5], [159.85, 1.2], [BE, 0], [T1, 0],
  ];

  SCENE.add({
    id: 'tree', t0: T0, t1: T1,
    stamp: () => ({ date: 'JUL.04 1992', time: '1:30PM' }),
    camera: CAMKIT.rig(KEYS, FOCUS, 7, 1),
    bg, shapes, over,
    light: { rim: '#fff0b8', glow: 'rgba(255,228,150,.85)', glowBlur: 8, rimW: 1.3, sunDir: [0.22, -0.97] },
    source: () => ({ x: SUN[0], y: SUN[1], r: 340, a: 1 }),
    grade: { bright: 1.0, contrast: 1.05, sat: 1.06 },
  });
})();
