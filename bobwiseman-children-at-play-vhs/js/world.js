// world.js · the park at golden hour, seen into the low sun, and everything the kids do in it, as a pure
// function of song time. World units are frame pixels at zoom 1 (the camcorder frame is 960 x 720).
// Three outputs per frame, all drawn through the camera transform the caller sets:
//   bg(g, t)        sky, sun, far trees, fence, grass, sand: the lit world behind and under the shapes
//   shadows(g, t)   long shadows thrown toward the camera, solid, composited soft and translucent by the caller
//   shapes(g, t)    every back-lit shape (play equipment, the big tree, the kids), composited with a rim glow
(function () {
  const T = window.TIMING;
  const { KIDS, drawKid, poses: P, ss, lerp } = window.CAST;
  const TAU = Math.PI * 2;
  const HOR = 382;                      // horizon line
  const SUN = [705, 300];               // the sun sits just above the far trees, behind the swings
  const kidH = (gy) => 82 * (gy - 372) / 128;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = (x) => x * x * x * (x * (x * 6 - 15) + 10);
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  }
  // ---- scenery, laid out once from a fixed seed ----------------------------------------------------------
  const R = rng(1991);
  const far1 = [], far2 = [];
  for (let x = -700; x < 3000; x += 18 + R() * 26) far2.push([x, 318 + R() * 26, 20 + R() * 26]);
  for (let x = -700; x < 3000; x += 16 + R() * 22) far1.push([x, 334 + R() * 30, 16 + R() * 24]);
  const houses = [[-120, 70, 34], [1240, 62, 26], [2280, 96, 30], [380, 54, 22]];
  const poles = [-260, 330, 1560, 2420];
  const tufts = [];
  for (let i = 0; i < 1400; i++) { const y = HOR + 6 + Math.pow(R(), 1.35) * 470; tufts.push([-600 + R() * 3400, y, R(), R()]); }
  const crown = [], crownEdge = [];
  // the crown: many leaf clumps inside a ragged outline, denser in the middle, thin and broken at the edge
  const lobes = [[-170, -250, 95, 70], [-40, -360, 120, 85], [120, -330, 110, 80], [200, -235, 80, 60], [-90, -215, 110, 55], [40, -230, 120, 60], [-210, -330, 70, 60], [60, -405, 60, 40]];
  const inLobe = (x, y, k = 1) => lobes.some(([lx, ly, rx, ry]) => ((x - lx) / (rx * k)) ** 2 + ((y - ly) / (ry * k)) ** 2 < 1);
  for (const [lx, ly, rx, ry] of lobes) for (let i = 0; i < 9; i++) { const a = R() * TAU, r = Math.sqrt(R()) * 0.6; crown.push([lx + Math.cos(a) * r * rx, ly + Math.sin(a) * r * ry, 24 + R() * 22, R() * TAU]); }
  for (let i = 0; i < 6000 && crownEdge.length < 520; i++) {
    const x = -300 + R() * 600, y = -470 + R() * 330;
    if (inLobe(x, y, 1.12) && !inLobe(x, y, 0.72)) crownEdge.push([x, y, 3 + R() * 8 * (inLobe(x, y, 0.95) ? 1.3 : 0.7), R() * TAU]);
  }
  const sunHoles = [];

  const COL = {
    kid: '#261a1e', swing: '#24232c', slide: '#3a1714', bars: '#1c282d', trunk: '#231a14', leaf: '#232c1c',
    bench: '#2a211b', box: '#30241a',
  };

  // ---- background ----------------------------------------------------------------------------------------
  function bg(g, t) {
    // sky: faded camcorder blue overhead, white-gold where the sun sits
    const sky = g.createLinearGradient(0, -420, 0, HOR);
    sky.addColorStop(0, '#7f9fc4'); sky.addColorStop(0.45, '#b9c4c6'); sky.addColorStop(0.75, '#f0d6a4'); sky.addColorStop(1, '#fde9c2');
    g.fillStyle = sky; g.fillRect(-1000, -1200, 5000, HOR + 1200);
    const sg = g.createRadialGradient(SUN[0], SUN[1], 4, SUN[0], SUN[1], 520);
    sg.addColorStop(0, 'rgba(255,255,248,1)'); sg.addColorStop(0.05, 'rgba(255,250,228,.95)'); sg.addColorStop(0.2, 'rgba(255,232,180,.5)'); sg.addColorStop(1, 'rgba(255,220,160,0)');
    g.fillStyle = sg; g.fillRect(SUN[0] - 600, SUN[1] - 600, 1200, 1200);
    // far tree line, two hazy rows, with house roofs and poles
    g.fillStyle = '#b8ad8c';
    for (const [x, y, r] of far2) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillRect(-1000, 330, 5000, HOR - 330 + 2);
    g.fillStyle = '#7d7e62';
    for (const [x, w, h] of houses) { g.fillRect(x, HOR - h, w, h); g.beginPath(); g.moveTo(x - 6, HOR - h); g.lineTo(x + w / 2, HOR - h - h * 0.6); g.lineTo(x + w + 6, HOR - h); g.fill(); }
    g.fillStyle = '#6d6c50';
    for (const [x, y, r] of far1) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillRect(-1000, 350, 5000, HOR - 350 + 3);
    g.strokeStyle = 'rgba(70,70,60,.75)'; g.lineWidth = 2.4;
    for (const x of poles) { g.beginPath(); g.moveTo(x, HOR + 4); g.lineTo(x + 2, 236); g.moveTo(x - 16, 246); g.lineTo(x + 20, 246); g.stroke(); }
    g.lineWidth = 0.9; g.strokeStyle = 'rgba(70,70,60,.45)';
    for (let i = 0; i < poles.length - 1; i++) for (const dy of [0, 7]) { g.beginPath(); g.moveTo(poles[i] + 2, 247 + dy); g.quadraticCurveTo((poles[i] + poles[i + 1]) / 2, 268 + dy, poles[i + 1] + 2, 247 + dy); g.stroke(); }
    // sun haze over the tree line (the camcorder flares where it looks into light)
    const hz = g.createRadialGradient(SUN[0], SUN[1] + 40, 10, SUN[0], SUN[1] + 40, 380);
    hz.addColorStop(0, 'rgba(255,246,220,.9)'); hz.addColorStop(0.4, 'rgba(255,232,190,.35)'); hz.addColorStop(1, 'rgba(255,230,190,0)');
    g.fillStyle = hz; g.fillRect(SUN[0] - 420, SUN[1] - 300, 840, 700);
    // grass: back-lit glow at the horizon into deep green at the camera
    const gr = g.createLinearGradient(0, HOR, 0, 900);
    gr.addColorStop(0, '#dcc47c'); gr.addColorStop(0.07, '#b0a253'); gr.addColorStop(0.28, '#76793a'); gr.addColorStop(0.6, '#4e5a26'); gr.addColorStop(1, '#2c3616');
    g.fillStyle = gr; g.fillRect(-1000, HOR, 5000, 1200);
    // the low sun lights a long bright lane across the grass toward the camera
    const lane = g.createRadialGradient(SUN[0], HOR, 10, SUN[0], HOR, 700);
    lane.addColorStop(0, 'rgba(255,236,170,.55)'); lane.addColorStop(0.5, 'rgba(255,220,140,.12)'); lane.addColorStop(1, 'rgba(255,220,140,0)');
    g.save(); g.translate(SUN[0], HOR); g.scale(1.4, 0.55); g.translate(-SUN[0], -HOR);
    g.fillStyle = lane; g.fillRect(SUN[0] - 1000, HOR, 2000, 1400); g.restore();
    // worn dirt under the swings and at the slide's foot
    dirt(g, 690, 474, 200, 16); dirt(g, 1262, 494, 70, 10); dirt(g, 1390, 498, 80, 10);
    // chain-link fence at the far edge of the park
    g.strokeStyle = 'rgba(60,58,52,.55)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(-1000, 398); g.lineTo(4000, 398); g.stroke();
    g.lineWidth = 2.2;
    for (let x = -980; x < 3200; x += 88) { g.beginPath(); g.moveTo(x, 397); g.lineTo(x, 426); g.stroke(); }
    g.strokeStyle = 'rgba(60,58,52,.18)'; g.lineWidth = 0.8;
    g.beginPath();
    for (let x = -1000; x < 3200; x += 7) { g.moveTo(x, 398); g.lineTo(x + 26, 425); g.moveTo(x + 26, 398); g.lineTo(x, 425); }
    g.stroke();
    // grass tufts: dark blades with lit tips (light comes through from behind)
    for (const [x, y, a, b] of tufts) {
      const k = (y - HOR) / 470, h = 2 + k * 12, w = 0.5 + k * 1.6;
      g.strokeStyle = `rgba(${40 + a * 20 | 0},${62 + a * 30 | 0},${22 + b * 10 | 0},${0.35 + k * 0.4})`;
      g.lineWidth = w; g.beginPath();
      g.moveTo(x, y); g.quadraticCurveTo(x + 1, y - h * 0.6, x + (a - 0.5) * h * 0.8, y - h);
      g.moveTo(x + 2 + k * 3, y); g.quadraticCurveTo(x + 3 + k * 3, y - h * 0.5, x + 2 + k * 3 + (b - 0.5) * h, y - h * 0.85);
      g.stroke();
      g.strokeStyle = `rgba(255,226,150,${0.25 + (1 - k) * 0.35})`; g.lineWidth = w * 0.6;
      g.beginPath(); g.moveTo(x + (a - 0.5) * h * 0.8, y - h); g.lineTo(x + (a - 0.5) * h * 0.65, y - h * 0.78); g.stroke();
    }
    // sand in the sandbox catches the light
    g.fillStyle = '#d9c189';
    g.beginPath(); g.moveTo(1572, 548); g.lineTo(1732, 548); g.lineTo(1748, 584); g.lineTo(1556, 584); g.closePath(); g.fill();
    g.fillStyle = 'rgba(150,110,60,.35)';
    g.beginPath(); g.ellipse(1640, 570, 26, 6, 0, 0, TAU); g.fill();
    void t;
  }
  function dirt(g, x, y, rx, ry) {
    const d = g.createRadialGradient(x, y, 0, x, y, rx);
    d.addColorStop(0, 'rgba(176,140,86,.75)'); d.addColorStop(0.7, 'rgba(160,130,80,.35)'); d.addColorStop(1, 'rgba(160,130,80,0)');
    g.save(); g.translate(x, y); g.scale(1, ry / rx); g.translate(-x, -y); g.fillStyle = d; g.fillRect(x - rx, y - rx, rx * 2, rx * 2); g.restore();
  }

  // ---- equipment, each drawn in local units about its ground point (y up negative) --------------------------
  const swingPivots = [-90, 0, 90];     // world x 600, 690, 780 (frame base at 690, 470)
  const SWING_L = 140;
  function swingAngle(t) {
    const Ps = 4 * T.beat;
    const amp = 0.52;
    return amp * Math.cos(TAU * (t - T.line1) / Ps);
  }
  function swingSet(g, t, withGirl) {
    g.fillStyle = g.strokeStyle = COL.swing; g.lineCap = 'round';
    g.lineWidth = 6.5;
    for (const ax of [-170, 170]) { g.beginPath(); g.moveTo(ax - 40, 0); g.lineTo(ax, -172); g.lineTo(ax + 40, 0); g.stroke(); }
    g.lineWidth = 8; g.beginPath(); g.moveTo(-182, -172); g.lineTo(182, -172); g.stroke();
    swingPivots.forEach((px, i) => {
      const th = i === 0 ? swingAngle(t) : 0.06 * Math.sin(t * 1.9 + i * 2) + (i === 2 ? 0.1 * Math.sin(t * 2.4) : 0);
      g.save(); g.translate(px, -172); g.rotate(-th);
      g.lineWidth = 1.8; g.beginPath(); g.moveTo(-1, 0); g.lineTo(-1, SWING_L); g.stroke();
      g.fillRect(-13, SWING_L - 1, 26, 4.5);
      if (i === 0 && withGirl) {
        const ph = TAU * (t - T.line1) / (4 * T.beat);
        const pump = 0.5 + 0.5 * Math.cos(ph + 0.5);
        const lean = -14 * Math.cos(ph + 0.3);
        drawKid(g, KIDS.swing, P.swingSit(pump, 1, lean), 0, SWING_L - 1, kidH(470), COL.kid);
      }
      g.restore();
    });
  }
  // slide: base at (1120, 492). Ladder up the left, platform, chute curving down to the right.
  const CH0 = [-66, -130], CH1 = [-6, -26], CH2 = [112, -10];
  const chute = (u) => { const a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u; return [a * CH0[0] + b * CH1[0] + c * CH2[0], a * CH0[1] + b * CH1[1] + c * CH2[1]]; };
  const chuteTan = (u) => { const dx = 2 * (1 - u) * (CH1[0] - CH0[0]) + 2 * u * (CH2[0] - CH1[0]), dy = 2 * (1 - u) * (CH1[1] - CH0[1]) + 2 * u * (CH2[1] - CH1[1]); return Math.atan2(dy, dx) * 180 / Math.PI; };
  function slide(g) {
    g.fillStyle = g.strokeStyle = COL.slide; g.lineCap = 'round'; g.lineJoin = 'round';
    g.lineWidth = 4;
    for (const off of [0, 7]) { g.beginPath(); g.moveTo(-128 + off, 0); g.lineTo(-104 + off, -132); g.stroke(); }
    g.lineWidth = 2.6;
    for (let k = 1; k < 8; k++) { const u = k / 8; g.beginPath(); g.moveTo(-128 + 24 * u, -132 * u); g.lineTo(-121 + 24 * u, -132 * u); g.stroke(); }
    g.lineWidth = 4.5; g.beginPath(); g.moveTo(-104, 0); g.lineTo(-104, -132); g.moveTo(-66, 0); g.lineTo(-66, -132); g.stroke();
    g.fillRect(-108, -136, 46, 6);
    g.lineWidth = 3.2; g.beginPath(); g.moveTo(-104, -134); g.lineTo(-104, -160); g.quadraticCurveTo(-86, -170, -68, -160); g.lineTo(-68, -134); g.stroke();
    // chute: thick bed and a side wall
    g.lineWidth = 9; g.beginPath(); g.moveTo(CH0[0], CH0[1]); g.quadraticCurveTo(CH1[0], CH1[1], CH2[0], CH2[1]); g.lineTo(134, -8); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(CH0[0], CH0[1] - 10); g.quadraticCurveTo(CH1[0], CH1[1] - 10, CH2[0], CH2[1] - 9); g.lineTo(130, -17); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(30, -26); g.lineTo(30, 0); g.moveTo(112, -10); g.lineTo(112, 0); g.stroke();
  }
  // monkey bars: base at (1390, 495), bar at -123
  function bars(g) {
    g.fillStyle = g.strokeStyle = COL.bars; g.lineCap = 'round';
    g.lineWidth = 5;
    for (const x of [-92, 92]) { g.beginPath(); g.moveTo(x - 16, 0); g.lineTo(x, -123); g.lineTo(x + 16, 0); g.stroke(); }
    g.lineWidth = 5.5; g.beginPath(); g.moveTo(-98, -123); g.lineTo(98, -123); g.stroke();
    for (let x = -80; x <= 80; x += 20) { g.beginPath(); g.arc(x, -123, 3.6, 0, TAU); g.fill(); }
  }
  function bench(g) {
    g.fillStyle = g.strokeStyle = COL.bench; g.lineCap = 'butt';
    g.fillRect(-70, -26, 140, 6); g.fillRect(-70, -48, 140, 5); g.fillRect(-70, -40, 140, 5);
    g.lineWidth = 5; g.beginPath(); g.moveTo(-58, 0); g.lineTo(-58, -50); g.moveTo(58, 0); g.lineTo(58, -50); g.stroke();
  }
  function sandbox(g) {
    g.fillStyle = COL.box;
    g.beginPath(); g.moveTo(-94, 17); g.lineTo(98, 17); g.lineTo(98, 25); g.lineTo(-94, 25); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(-94, 17); g.lineTo(-80, -19); g.lineTo(-74, -19); g.lineTo(-86, 21); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(98, 17); g.lineTo(84, -19); g.lineTo(90, -19); g.lineTo(104, 21); g.closePath(); g.fill();
    g.fillRect(-80, -21, 170, 4);
    // a bucket
    g.beginPath(); g.moveTo(-58, 2); g.lineTo(-44, 2); g.lineTo(-46, -12); g.lineTo(-56, -12); g.closePath(); g.fill();
    g.strokeStyle = COL.box; g.lineWidth = 1.4; g.beginPath(); g.arc(-51, -12, 7, Math.PI, 0); g.stroke();
  }
  function tree(g, t, shadow) {
    g.fillStyle = COL.trunk; g.strokeStyle = COL.trunk; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(-40, 2); g.quadraticCurveTo(-24, -6, -22, -40); g.lineTo(-15, -205); g.lineTo(15, -205); g.lineTo(22, -40); g.quadraticCurveTo(26, -6, 44, 2); g.closePath(); g.fill();
    g.lineWidth = 20; g.beginPath(); g.moveTo(-6, -190); g.quadraticCurveTo(-60, -230, -128, -258); g.stroke();
    g.lineWidth = 17; g.beginPath(); g.moveTo(6, -192); g.quadraticCurveTo(64, -240, 118, -284); g.stroke();
    g.lineWidth = 15; g.beginPath(); g.moveTo(0, -200); g.lineTo(-6, -320); g.stroke();
    g.fillStyle = COL.leaf;
    const sway = (i) => 2.2 * Math.sin(t * 1.15 + i) + 1.2 * Math.sin(t * 2.7 + i * 1.7);
    for (let i = 0; i < crown.length; i++) { const [x, y, r] = crown[i]; g.beginPath(); g.arc(x + sway(i), y + sway(i + 9) * 0.4, r, 0, TAU); g.fill(); }
    for (let i = 0; i < crownEdge.length; i++) { const [x, y, r] = crownEdge[i]; g.beginPath(); g.arc(x + sway(i) * 1.5, y + sway(i + 4) * 0.6, r, 0, TAU); g.fill(); }
    void shadow;
  }
  // light coming through gaps in the crown, drawn after the shapes are composited
  function crownLight(g, t) {
    for (const [x, y, r] of sunHoles) {
      const k = 0.55 + 0.45 * Math.sin(t * 1.3 + x);
      g.fillStyle = `rgba(255,236,186,${0.55 * k})`;
      g.beginPath(); g.arc(1880 + x + 2 * Math.sin(t * 1.15 + y), 512 + y, r, 0, TAU); g.fill();
    }
  }

  // ---- the kids, as functions of t --------------------------------------------------------------------------
  function lerpPose(a, b, k) {
    const L = (p, q) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
    const o = { ...(k < 0.5 ? a : b) };
    for (const key of ['hip', 'chest', 'head']) o[key] = L(a[key], b[key]);
    for (const key of ['legF', 'legB', 'armF', 'armB']) if (a[key] && b[key]) o[key] = [L(a[key][0], b[key][0]), L(a[key][1], b[key][1])];
    o.hairSwing = lerp(a.hairSwing || 0, b.hairSwing || 0, k); o.hem = lerp(a.hem || 0, b.hem || 0, k);
    return o;
  }
  // Slide boy: climbs, sits at the top kicking, slides on cue, stands, runs off to the right.
  function slideBoy(t) {
    const bx = 1120, by = 492, h = kidH(492);
    const climbA = 1.0, climbB = 4.9, sitAt = 5.3, go = T.slideGo, bottom = go + 0.85, stopAt = bottom + 0.35, upAt = stopAt + 0.55;
    if (t < climbB) {
      const u = seg(t, climbA, climbB);
      const steps = 6, su = Math.floor(u * steps) / steps + smooth((u * steps) % 1) / steps;
      return { x: bx - 128 + 24 * su - 12, y: by - 132 * su, pose: P.climb((t - climbA) / (2 * T.beat), 1), h };
    }
    if (t < sitAt) {
      const k = smooth(seg(t, climbB, sitAt));
      return { x: bx - 100 + 22 * k, y: by - 132, pose: lerpPose(P.stand(1), P.ledgeSit(0.5, 1), k), h };
    }
    if (t < go) {
      const kick = 0.5 + 0.5 * Math.sin((t - sitAt) * TAU / (2 * T.beat));
      return { x: bx - 78, y: by - 132, pose: P.ledgeSit(kick, 1), h };
    }
    if (t < bottom) {
      const u = Math.pow(seg(t, go, bottom), 1.7);
      const p = chute(u), ang = chuteTan(u);
      const armsUp = smooth(seg(t, go + 0.12, go + 0.4));
      return { x: bx + p[0], y: by + p[1] - 5, pose: P.slideSit(ang * 0.85, armsUp, 1), h };
    }
    if (t < stopAt) {
      const k = smooth(seg(t, bottom, stopAt));
      return { x: bx + 112 + 40 * k, y: by - 10 + 9 * k, pose: P.slideSit(lerp(8, 0, k), 1 - k, 1), h };
    }
    if (t < upAt) {
      const k = smooth(seg(t, stopAt, upAt));
      return { x: bx + 152 + 6 * k, y: by - 1 + (1 - k) * 0 , pose: lerpPose(P.slideSit(0, 0, 1), P.stand(1), k), h, sitting: k < 0.6 };
    }
    // run off toward the camera's right
    const s = (t - upAt) * 150;
    const x = bx + 158 + s * 0.92, y = by + s * 0.38;
    return { x, y, pose: P.run((t - upAt) * 2.4, 1), h: kidH(y) };
  }
  // Tag: two kids sprint one lap round the field, the chaser 0.75 s behind, then leave the park.
  function tagKid(t, lag) {
    const tt = t - lag;
    const t0 = 3.86, lapT = 13.0;  // enter from the left after the first line; far side of the park while the boy slides
    if (tt < t0 || tt > t0 + lapT * 1.05) return null;
    const ph = 0.15 + TAU * (tt - t0) / lapT;
    const cx = 1120, cy = 584, rx = 860, ry = 52;
    const x = cx - rx * Math.cos(ph), y = cy + ry * Math.sin(ph);
    const vx = rx * Math.sin(ph);
    return { x, y, d: vx >= 0 ? 1 : -1, ph: tt * 2.5 };
  }
  // Monkey bars kid: hangs from the middle of the bars, kicking her legs.
  function barsKid(t) {
    const kick = (t / (2 * T.beat));
    const shift = 3 * Math.sin(t * 0.9);
    return { x: 1392, y: 495 - 123, pose: P.hang(kick, 0, shift), h: kidH(495) };
  }
  function sandKid(t) {
    return { x: 1652, y: 566, pose: P.dig(t / (2 * T.beat) + 0.3, -1), h: kidH(566) };
  }
  // The hider: behind the big trunk. A giggle (the hat pokes out), then the peek, the step out, the run, the wave.
  function hider(t) {
    const tx = 1880, ty = 508, h0 = kidH(ty);
    if (t < T.line4laugh - 0.05) return { x: tx, y: ty, pose: P.peek(0, 1), h: h0, hidden: true };
    if (t < T.line5peek) {
      const k = Math.sin(Math.PI * seg(t, T.line4laugh - 0.05, T.line4laugh + 0.75));
      return { x: tx + 3, y: ty, pose: P.peek(0.62 * Math.max(0, k), 1), h: h0 };
    }
    if (t < T.line5out) {
      const k = smooth(seg(t, T.line5peek, T.line5peek + 0.35));
      return { x: tx + 3, y: ty, pose: P.peek(k, 1, { hairSwing: 0.3 * Math.sin(t * 9) * (1 - k) }), h: h0 };
    }
    if (t < T.line5run) {
      const k = smooth(seg(t, T.line5out, T.line5run));
      return { x: tx + 3 + 46 * k, y: ty + 4 * k, pose: lerpPose(P.peek(1, 1), P.stand(0), k), h: kidH(ty + 4 * k) };
    }
    const runEnd = T.waveAt - 0.12;
    const A = [tx + 49, ty + 4], B = [1792, 640];  // stops right of the sandbox, clear of the digger
    if (t < runEnd) {
      const u = seg(t, T.line5run, runEnd);
      const e = u < 0.82 ? u / 0.82 * 0.92 : 0.92 + 0.08 * smooth((u - 0.82) / 0.18);
      const x = lerp(A[0], B[0], e), y = lerp(A[1], B[1], e);
      const start = smooth(seg(t, T.line5run, T.line5run + 0.25));
      const p = lerpPose(P.stand(0), P.run((t - T.line5run) * 2.6, -1), start);
      return { x, y, pose: u > 0.88 ? lerpPose(p, P.stand(0), smooth((u - 0.88) / 0.12)) : p, h: kidH(y) };
    }
    const w = (t - T.waveAt) / T.beat;
    const hop = w < 2 ? (w % 1) : 0;
    const p = lerpPose(P.stand(0), P.wave(w, 0, hop, 1), smooth(seg(t, runEnd, T.waveAt + 0.15)));
    return { x: B[0], y: B[1], pose: p, h: kidH(B[1]) };
  }

  // ---- outputs ----------------------------------------------------------------------------------------------
  // Shadows fall toward the camera and away from the sun: local "up" maps to (sx, sy) on the ground.
  function shadowXf(g, bx, by, lenK = 1) {
    const sx = (bx - SUN[0]) / 1150, sy = 0.62 * lenK;
    g.translate(bx, by); g.transform(1, 0, -sx, -sy, 0, 0);
  }
  function shadows(g, t) {
    g.fillStyle = g.strokeStyle = '#000';
    const S = (bx, by, fn, k) => { g.save(); shadowXf(g, bx, by, k); fn(g); g.restore(); };
    S(690, 470, (q) => swingSet(q, t, false));
    S(1120, 492, slide); S(1390, 495, bars); S(230, 505, bench);
    S(1880, 512, (q) => tree(q, t, true), 0.8);
    const kidShadow = (k, x, y, pose, h) => S(x, y, (q) => drawKid(q, KIDS[k], pose, 0, 0, h, '#000'));
    const sb = slideBoy(t); if (!sb.sitting && sb.y > 486) kidShadow('slide', sb.x, sb.y, sb.pose, sb.h);
    for (const [k, lag] of [['tagA', 0], ['tagB', 0.75]]) { const r = tagKid(t, lag); if (r) kidShadow(k, r.x, r.y, P.run(r.ph, r.d), kidH(r.y)); }
    const hd = hider(t); if (!hd.hidden && hd.x > 1905) kidShadow('hider', hd.x, hd.y, hd.pose, hd.h);
    // the swing girl's shadow swings on the dirt
    const th = swingAngle(t), sxp = 600 + Math.sin(th) * SWING_L;
    g.save(); g.globalAlpha = 1; g.beginPath(); g.ellipse(sxp + 8, 482, 22, 5, 0, 0, TAU); g.fill(); g.restore();
  }
  function shapes(g, t) {
    // far to near
    g.save(); g.translate(230, 505); bench(g); g.restore();
    g.save(); g.translate(690, 470); swingSet(g, t, true); g.restore();
    const sb = slideBoy(t);
    const boyFirst = sb.y < 492 && sb.x < 1100;  // on the ladder he is behind the slide's near rail
    if (boyFirst) drawKid(g, KIDS.slide, sb.pose, sb.x, sb.y, sb.h, COL.kid);
    g.save(); g.translate(1120, 492); slide(g); g.restore();
    if (!boyFirst) drawKid(g, KIDS.slide, sb.pose, sb.x, sb.y, sb.h, COL.kid);
    g.save(); g.translate(1390, 495); bars(g); g.restore();
    const bk = barsKid(t); drawKid(g, KIDS.bars, bk.pose, bk.x, bk.y, bk.h, COL.kid);
    const hd = hider(t);
    if (!hd.hidden && hd.y < 515) drawKid(g, KIDS.hider, hd.pose, hd.x, hd.y, hd.h, COL.kid);
    g.save(); g.translate(1880, 512); tree(g, t, false); g.restore();
    g.save(); g.translate(1650, 565); sandbox(g); g.restore();
    const sk = sandKid(t); drawKid(g, KIDS.sand, sk.pose, sk.x, sk.y, sk.h, COL.kid);
    if (!hd.hidden && hd.y >= 515) drawKid(g, KIDS.hider, hd.pose, hd.x, hd.y, hd.h, COL.kid);
    const runners = [['tagA', 0], ['tagB', 0.75]].map(([k, lag]) => [k, tagKid(t, lag)]).filter((r) => r[1]).sort((a, b) => a[1].y - b[1].y);
    for (const [k, r] of runners) drawKid(g, KIDS[k], P.run(r.ph, r.d), r.x, r.y, kidH(r.y), COL.kid);
  }

  window.WORLD = { bg, shadows, shapes, crownLight, SUN, HOR, kidH, hider, slideBoy };
})();
