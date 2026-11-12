// scenes/father.js · verse 2b, the kitchen at midnight. The camcorder was left running on the counter by accident:
// static, a little tilted, only the motor's hum and one slow auto-focus breath. The father sits at the table under
// the hanging lamp, head in his hands, a bottle and a glass and his old army cap in front of him; the streetlight
// comes blue through the window behind. He cries, stands (his head knocks the lamp), puts the cap on, salutes the
// camera, marches three drunk steps toward the window and slides down the cabinet to the floor. Contract: js/scenes.js.
(function () {
  const T = window.TIMING, S = T.scenes;
  const { KIDS, drawKid, poses: P, lerpPose } = window.CAST;
  const TAU = Math.PI * 2;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const seg = (t, a, b) => sm((t - a) / (b - a));
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];

  // ---- song hits (seconds) -------------------------------------------------------------------------------
  const TAKE = S.father;           // 84.11 he sits at the table, head in his hands
  const CRYING = 88.52;            // first word, held: his shoulders shake
  const YOUR_FATHER = 92.36;
  const CRYING2 = 94.40;
  const THINKS = 101.71;           // he stands (and knocks the lamp)
  const BUMP = 102.72;             // the cap, lifted high in a flourish, knocks the lamp shade
  const SOLDIER = 103.14;          // the salute snaps up
  const LOSING = 109.49;           // three drunk steps toward the window...
  const FREEDOM = 111.17;          // ...the third lands here
  const SO_DRUNK = 117.27;         // the big sway
  const SEE = 119.56;              // down on the floor against the cabinet
  const END = S.tree;              // 124.57

  // ---- the kitchen (world units = the 960 x 720 frame at zoom 1) -------------------------------------------
  const FLOOR = 600;               // the father's feet (the plane just behind the table)
  const WALL_BASE = 548;
  const EYE = 420;                 // the camcorder's eye level (the counter it sits on)
  const WIN = { x0: 450, x1: 730, y0: 200, y1: 452 };
  const TABLE = { x0: 470, x1: 800, far: 478, near: 512, top: 522, apron: 540, legNear: 646, legFar: 604 };
  const X_SIT = 600, H = 190;      // where he sits, his depth scale
  const SC = H / 100 * KIDS.father.size;  // local units -> world px
  const LAMP = { px: 668, py: 22, len: 150 };
  const CAP_ON_TABLE = [664, 486];
  const PANEL_X = 362;             // the end of the counter run he slides down
  const COL = { kid: '#261a1e', table: '#3e2c1e', tableTop: '#6e5134', chair: '#2a1c14', glass: '#2b2a2c', shade: '#33261b' };

  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  }

  // ---- the lamp: barely swaying, then knocked into a long slow swing ---------------------------------------
  function lampAngle(t) {
    let a = 0.018 * Math.sin(TAU * t / 1.95 + 0.4);
    if (t > BUMP) { const u = t - BUMP; a += 0.24 * Math.exp(-u / 13) * Math.sin(TAU * u / 1.95) * sm(u / 0.12); }
    return a;
  }
  function lampAt(t) {
    const a = lampAngle(t);
    const s = Math.sin(a), c = Math.cos(a);
    const top = [LAMP.px + s * LAMP.len, LAMP.py + c * LAMP.len];
    return { a, top, bulb: [top[0] + s * 30, top[1] + c * 30] };
  }

  // ---- the father's poses (local units, feet on y = 0; drawKid adultizes them) -------------------------------
  // Sitting at the table, front view, elbows on the table, his head down in his hands. shake: the sob, in units.
  function headInHands(shake, heave) {
    const hip = [0, -25], chest = [0, -55 + shake * 0.6 - heave], head = [0, -54 + shake - heave * 1.2];
    return {
      hip, chest, head, face: 0,
      legB: [[-9, -21], [-10, -1]], legF: [[9, -21], [10, -1]],
      armB: [[-27, -37 + shake * 0.15], [-9, -56 + shake * 0.9 - heave]],
      armF: [[27, -37 + shake * 0.15], [9, -56 + shake * 0.9 - heave]],
    };
  }
  const hand2local = (wx, wy, x0) => [(wx - x0) / SC, (wy - FLOOR) / SC / 1.14];
  function grab() {  // bent over the table, the near hand down on the cap
    const p = P.stand(0);
    p.hip = [0, -44]; p.chest = [3, -66]; p.head = [5, -77];
    p.legB = [[-6, -22], [-6, -1]]; p.legF = [[6, -22], [6, -1]];
    const c = hand2local(CAP_ON_TABLE[0], CAP_ON_TABLE[1] - 4, X_SIT);
    p.armF = [[22, -54], c]; p.armB = [[-14, -56], [-12, -44]];
    return p;
  }
  function capHigh() {  // the cap lifted high over his head, a little flourish (it clips the lamp shade)
    const p = P.stand(0);
    p.armF = [[20, -102], [9.5, -119]]; p.chest = [0, -78]; p.head = [-1, -90];
    return p;
  }
  function capToHead() {  // the cap held up to his head
    const p = P.stand(0);
    p.armF = [[22, -86], [5, -103]];
    return p;
  }
  function frontSalute(k) {  // the elbow out to the side at shoulder height, the hand at the brow
    const p = P.stand(0);
    p.armF = [[lerp(22, 25, k), lerp(-86, -82, k)], [lerp(5, 7.5, k), lerp(-103, -94.5, k)]];
    p.chest = [0, -78]; p.head = [0, -91];  // chest out, chin up
    return p;
  }
  // standing and swaying: the body tips about the hips (deg, + = forward for the way he faces)
  function swayStand(d, deg, o = {}) {
    const p = d === 0 ? P.stand(0) : P.stand(d);
    const r = deg * Math.PI / 180 * (d || 1);
    const rot = (q) => { const x = q[0] - p.hip[0], y = q[1] - p.hip[1]; return [p.hip[0] + x * Math.cos(r) - y * Math.sin(r), p.hip[1] + x * Math.sin(r) + y * Math.cos(r)]; };
    p.chest = rot(p.chest); p.head = rot(p.head);
    p.armF = p.armF.map(rot); p.armB = p.armB.map(rot);
    if (d) { const sx = Math.sin(r) * 4; p.armF = p.armF.map((q) => [q[0] + sx, q[1]]); }
    return Object.assign(p, o);
  }
  // where he is and what he is doing at t: { x, pose, clip (the table hides him below its far edge) }
  function father(t) {
    const hat = { hat: 'army' };
    if (t < THINKS - 0.1) {
      // the sobs: bursts on the sung phrases, each a quick shudder over a slow heave
      const env = Math.max(seg(t, CRYING - 0.1, CRYING + 0.3) * (1 - seg(t, 91.2, 91.9)), seg(t, YOUR_FATHER - 0.1, YOUR_FATHER + 0.3) * (1 - seg(t, 93.6, 94.1)),
        seg(t, CRYING2 - 0.1, CRYING2 + 0.3) * (1 - seg(t, 97.2, 98.0)), 0.5 * seg(t, 98.6, 99.0) * (1 - seg(t, 100.2, 100.8)), 0.12);
      const shake = env * (1.2 * Math.sin(TAU * 4.3 * t) + 0.7 * Math.sin(TAU * 7.1 * t + 1));
      const heave = env * 1.6 * Math.max(0, Math.sin(TAU * 0.9 * (t - CRYING))) + 0.5 * Math.sin(TAU * t / 4.2);
      return { x: X_SIT, pose: headInHands(shake, heave) };
    }
    if (t < 102.25) {  // up, unsteady, a little lurch at the top
      const k = seg(t, THINKS - 0.1, 102.2), lurch = 2.2 * Math.sin(Math.PI * seg(t, 101.8, 102.25));
      const p = lerpPose(headInHands(0, 0), swayStand(0, 0), k);
      p.hip = [p.hip[0], p.hip[1] - lurch]; p.chest = [p.chest[0], p.chest[1] - lurch]; p.head = [p.head[0], p.head[1] - lurch];
      return { x: X_SIT, pose: p };
    }
    if (t < 102.5) return { x: X_SIT, pose: lerpPose(swayStand(0, 0), grab(), seg(t, 102.25, 102.45)), reaching: true };
    if (t < BUMP) return { x: X_SIT, pose: lerpPose(grab(), capHigh(), seg(t, 102.5, BUMP)), carrying: true, reaching: t < 102.6 };
    if (t < 103.0) return { x: X_SIT, pose: lerpPose(capHigh(), capToHead(), seg(t, BUMP, 102.97)), carrying: true };
    if (t < LOSING - 0.2) {
      const up = seg(t, 102.97, SOLDIER), down = seg(t, 106.7, 107.4);
      const sway = 1.4 * Math.sin(TAU * (t - 103) / 3.1) * seg(t, 103.6, 104.4) + 2.4 * Math.sin(TAU * (t - 104) / 2.3) * down;
      let p = up < 1 ? lerpPose(capToHead(), frontSalute(1), up) : frontSalute(1 - 0.25 * seg(t, 104.2, 104.8));  // snaps up ON the word
      if (down > 0) p = lerpPose(p, swayStand(0, 0), down);
      p = Object.assign(p, hat);
      const lean = sway * Math.PI / 180;  // sway sideways (front view: a tilt in the frame)
      const rot = (q) => [p.hip[0] + (q[0] - p.hip[0]) * Math.cos(lean) - (q[1] - p.hip[1]) * Math.sin(lean), p.hip[1] + (q[0] - p.hip[0]) * Math.sin(lean) + (q[1] - p.hip[1]) * Math.cos(lean)];
      p.chest = rot(p.chest); p.head = rot(p.head); p.armF = p.armF.map(rot); p.armB = p.armB.map(rot);
      return { x: X_SIT, pose: p };
    }
    // three drunk steps toward the window (left): phase 0..1.5, steps land at 0.25 / 0.75 / 1.25 (the third on "freedom")
    const PH = (FREEDOM - LOSING) / 1.25;
    const ph = clamp((t - LOSING) / PH, 0, 1.5);
    const X_STOP = 474;
    if (t < LOSING + 1.5 * PH + 0.3) {
      const turn = seg(t, LOSING - 0.2, LOSING + 0.15);
      const sway = 7 * Math.sin(TAU * (t - LOSING) / 1.7) + 3;
      const step = ph - Math.sin(TAU * ph) / TAU;  // forward progress speeds up mid-stride, slows on each landing
      const x = lerp(X_SIT, X_STOP, step / 1.5) + 4 * Math.sin(TAU * (t - LOSING) * 0.8);
      const p = lerpPose(swayStand(0, 0), P.march(ph, -1, sway), turn);
      return { x, pose: Object.assign(p, hat) };
    }
    // he stops, sways facing the window, turns round, sways; "so drunk": a big sway, a stumble back, the slide down
    const SLIDE0 = 118.5;
    if (t < SLIDE0) {
      const turn = seg(t, 113.4, 114.0);
      const base = 6 * Math.sin(TAU * (t - 112) / 2.6) + 3 * Math.sin(TAU * (t - 112) / 1.1);
      const big = 12 * Math.sin(TAU * (t - SO_DRUNK) / 1.3) * seg(t, SO_DRUNK - 0.1, SO_DRUNK + 0.2) * (1 - seg(t, 117.9, 118.2));
      const back = -16 * seg(t, 117.95, 118.4);
      const deg = base * (1 - seg(t, 117.2, 117.5)) + big + back;
      const x = lerp(X_STOP, 448, seg(t, 117.95, 118.45));
      const a = swayStand(-1, deg), b = swayStand(1, deg);
      const p = lerpPose(a, b, turn);
      // he steadies himself with a hand on the table's corner
      let steady = false;
      if (t > 114.3 && t < 117.5) { const k = seg(t, 114.3, 114.9) * (1 - seg(t, 117.25, 117.5)); steady = k > 0.6; p.armF = [[lerp(p.armF[0][0], 15, k), lerp(p.armF[0][1], -56, k)], [lerp(p.armF[1][0], 11, k), lerp(p.armF[1][1], -37, k)]]; }
      return { x, pose: Object.assign(p, hat), steady };
    }
    // down the cabinet's end to the floor; the cap tips; the head droops
    const k = seg(t, SLIDE0, SEE);
    const drop = seg(t, SEE, 121.9);
    const p = lerpPose(swayStand(1, -16), P.slump(drop, 1), k);
    p.hatTilt = 0.45 * seg(t, SEE - 0.15, SEE + 0.35) + 0.08 * Math.sin(Math.PI * seg(t, SEE + 0.2, SEE + 0.7)) + 0.12 * drop;
    return { x: lerp(448, PANEL_X + 54, k), pose: Object.assign(p, hat, { hatTilt: p.hatTilt }) };
  }
  // the cap in his hand on its way up, or on the table
  function capShape(g, x, y, R, face) {
    g.save(); g.translate(x, y);
    g.beginPath(); g.ellipse(0, -R * 0.35, R * 1.12, R * 0.62, 0, 0, TAU); g.fill();
    g.fillRect(-R * 1.05, -R * 0.3, R * 2.1, R * 0.42);
    if (face) { g.beginPath(); g.moveTo(face * R * 0.6, -R * 0.05); g.lineTo(face * R * 1.75, R * 0.25); g.lineTo(face * R * 1.65, R * 0.48); g.lineTo(face * R * 0.5, R * 0.18); g.closePath(); g.fill(); }
    else g.fillRect(-R * 0.95, R * 0.05, R * 1.9, R * 0.3);
    g.restore();
  }

  // ---- camera: on the counter, tilted, the motor's faint judder, one slow focus breath ------------------------
  const camera = CAMKIT.rig([[TAKE, 480, 372, 1.03], [END, 480, 372, 1.03]],
    [[TAKE, 0.35], [111.9, 0.3], [112.6, 1.0], [113.4, 2.1], [114.1, 1.2], [114.7, 0.3], [END, 0.3]], 7, 0.15, -0.03);

  // ---- outputs ----------------------------------------------------------------------------------------------
  const R0 = rng(1102);
  const counterStuff = [];
  for (let x = -60; x < PANEL_X - 40; x += 38 + R0() * 40) counterStuff.push([x, 16 + R0() * 34, 14 + R0() * 22, R0()]);
  function night(g, t) {
    // through the window: the street at night, blue, a streetlight up on the right, the neighbour's roof, a bare tree
    const sky = g.createLinearGradient(0, WIN.y0, 0, WIN.y1);
    sky.addColorStop(0, '#1a2440'); sky.addColorStop(0.6, '#2a3a5c'); sky.addColorStop(1, '#3a4c6c');
    g.fillStyle = sky; g.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0);
    const sl = [WIN.x0 + 64, WIN.y0 + 58];
    const glow = g.createRadialGradient(sl[0], sl[1], 2, sl[0], sl[1], 210);
    glow.addColorStop(0, 'rgba(235,245,255,1)'); glow.addColorStop(0.06, 'rgba(190,215,255,.85)'); glow.addColorStop(0.3, 'rgba(120,160,220,.35)'); glow.addColorStop(1, 'rgba(90,130,200,0)');
    g.fillStyle = glow; g.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0);
    g.fillStyle = '#121828';
    g.beginPath(); g.moveTo(WIN.x1 - 170, WIN.y1); g.lineTo(WIN.x1 - 170, 404); g.lineTo(WIN.x1 - 90, 370); g.lineTo(WIN.x1, 398); g.lineTo(WIN.x1, WIN.y1); g.fill();
    g.fillStyle = 'rgba(255,200,120,.75)'; g.fillRect(WIN.x1 - 120, 410, 14, 18);  // one window lit next door
    g.strokeStyle = '#141a2a'; g.lineCap = 'round';
    const br = (x, y, a, l, w, n) => { if (n === 0 || l < 6) return; const x2 = x + Math.sin(a) * l, y2 = y - Math.cos(a) * l; g.lineWidth = w; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); br(x2, y2, a - 0.45, l * 0.72, w * 0.66, n - 1); br(x2, y2, a + 0.38, l * 0.68, w * 0.66, n - 1); };
    g.save(); g.translate(Math.sin(t * 0.7) * 0.6, 0); br(WIN.x0 + 150, WIN.y1 + 10, 0.1, 96, 9, 6); g.restore();
    g.strokeStyle = '#1b2236'; g.lineWidth = 3; g.beginPath(); g.moveTo(sl[0] - 6, WIN.y1); g.lineTo(sl[0] - 6, sl[1] + 6); g.lineTo(sl[0] + 8, sl[1]); g.stroke();
  }
  function bg(g, t) {
    const L = lampAt(t);
    // back wall: 70s paper, mustard with a brown trellis, the ceiling above
    g.fillStyle = '#a88a52'; g.fillRect(-600, 24, 2200, WALL_BASE - 24);
    g.strokeStyle = 'rgba(110,80,40,.35)'; g.lineWidth = 2;
    for (let x = -600; x < 1600; x += 40) { g.beginPath(); for (let y = 24; y < WALL_BASE; y += 40) { g.moveTo(x, y); g.lineTo(x + 20, y + 20); g.lineTo(x, y + 40); } g.stroke(); }
    g.fillStyle = 'rgba(130,98,52,.3)'; for (let x = -580; x < 1600; x += 40) for (let y = 44; y < WALL_BASE; y += 40) { g.beginPath(); g.arc(x + 20, y, 3.5, 0, TAU); g.fill(); }
    g.fillStyle = '#8a7c66'; g.fillRect(-600, -500, 2200, 524);
    // upper cabinets, counter and lower cabinets on the left (wood), the end panel he will slide down
    g.fillStyle = '#7a5434'; g.fillRect(-600, 64, PANEL_X - 10 + 600, 190);
    g.fillStyle = '#6a462a';
    for (let x = -580; x < PANEL_X - 120; x += 112) { g.fillRect(x + 8, 76, 96, 166); }
    g.fillStyle = '#8a6040'; for (let x = -580; x < PANEL_X - 120; x += 112) g.fillRect(x + 18, 86, 76, 146);
    g.fillStyle = '#c0a070'; for (let x = -580; x < PANEL_X - 120; x += 112) g.fillRect(x + 92, 200, 4, 22);
    // things on the counter: canisters, a toaster, a dish rack
    for (const [x, w, h, r] of counterStuff) {
      g.fillStyle = r < 0.33 ? '#8a7a64' : r < 0.66 ? '#9c5a36' : '#6e7a62';
      g.fillRect(x, 404 - h, w, h); g.fillStyle = 'rgba(255,230,190,.25)'; g.fillRect(x + 2, 404 - h, 3, h);
    }
    g.fillStyle = '#b8a888'; g.fillRect(-600, 400, PANEL_X + 600, 12);                  // the counter top
    g.fillStyle = '#7a5434'; g.fillRect(-600, 412, PANEL_X + 600, 188);                 // lower cabinet fronts
    g.fillStyle = '#6a462a'; for (let x = -580; x < PANEL_X - 100; x += 112) g.fillRect(x + 8, 430, 96, 150);
    g.fillStyle = '#c0a070'; for (let x = -580; x < PANEL_X - 100; x += 112) g.fillRect(x + 92, 444, 4, 22);
    g.fillStyle = '#2e2018'; g.fillRect(-600, 588, PANEL_X + 600, 12);                  // toe kick
    g.fillStyle = '#5e3e26'; g.beginPath(); g.moveTo(PANEL_X - 3, 400); g.lineTo(PANEL_X + 19, 412); g.lineTo(PANEL_X + 19, WALL_BASE); g.lineTo(PANEL_X - 3, 600); g.closePath(); g.fill();
    // the calendar (a mountain picture over an empty grid) and the fridge with a child's drawings
    g.save(); g.translate(48, 0);
    g.fillStyle = '#d8d0c0'; g.fillRect(712, 236, 64, 98);
    g.fillStyle = '#6a8aa0'; g.fillRect(716, 240, 56, 40); g.fillStyle = '#e8e8e0'; g.beginPath(); g.moveTo(716, 280); g.lineTo(736, 254); g.lineTo(748, 266); g.lineTo(760, 250); g.lineTo(772, 280); g.fill();
    g.strokeStyle = 'rgba(80,70,60,.6)'; g.lineWidth = 0.8;
    for (let i = 0; i <= 7; i++) { g.beginPath(); g.moveTo(716 + i * 8, 286); g.lineTo(716 + i * 8, 330); g.stroke(); }
    for (let j = 0; j <= 5; j++) { g.beginPath(); g.moveTo(716, 286 + j * 8.8); g.lineTo(772, 286 + j * 8.8); g.stroke(); }
    g.restore(); g.save(); g.translate(40, 0);
    g.fillStyle = '#c8b894'; g.fillRect(800, 120, 190, 492);
    g.fillStyle = '#b8a884'; g.fillRect(800, 120, 190, 6); g.fillRect(800, 300, 190, 5);
    g.fillStyle = '#8a8a86'; g.fillRect(810, 200, 6, 70); g.fillRect(810, 330, 6, 90);
    g.fillStyle = '#efe8d8'; g.fillRect(860, 330, 54, 66); g.save(); g.translate(930, 236); g.rotate(0.08); g.fillRect(0, 0, 44, 52); g.restore();
    g.lineWidth = 2;
    g.strokeStyle = '#b84a3a'; g.beginPath(); g.moveTo(870, 386); g.lineTo(870, 366); g.lineTo(884, 352); g.lineTo(898, 366); g.lineTo(898, 386); g.closePath(); g.stroke();
    g.strokeStyle = '#d8a020'; g.beginPath(); g.arc(902, 342, 5, 0, TAU); g.stroke();
    g.strokeStyle = '#3a7a4a'; g.beginPath(); g.moveTo(862, 390); g.lineTo(912, 389); g.stroke();
    g.strokeStyle = '#3a5aa0'; g.beginPath(); g.moveTo(940, 280); g.lineTo(950, 262); g.lineTo(960, 280); g.moveTo(950, 262); g.lineTo(950, 250); g.stroke(); g.beginPath(); g.arc(950, 245, 5, 0, TAU); g.stroke();
    g.restore();
    // floor: brown and cream linoleum squares in perspective
    g.fillStyle = '#5a4c3a'; g.fillRect(-600, WALL_BASE, 2200, 600);
    const rowY = (k) => EYE + (WALL_BASE - EYE) * (1 + k * 0.22);
    const colX = (X, y) => 480 + (X - 480) * (y - EYE) / (WALL_BASE - EYE);
    for (let k = 0; k < 12; k++) {
      const y0 = rowY(k), y1 = rowY(k + 1);
      for (let i = -14; i < 14; i++) {
        if ((i + k) % 2 === 0) continue;
        const X0 = 480 + i * 64, X1 = X0 + 64;
        g.fillStyle = '#8a7a5e';
        g.beginPath(); g.moveTo(colX(X0, y0), y0); g.lineTo(colX(X1, y0), y0); g.lineTo(colX(X1, y1), y1); g.lineTo(colX(X0, y1), y1); g.closePath(); g.fill();
      }
    }
    g.fillStyle = '#4a3a2a'; g.fillRect(-600, WALL_BASE - 10, 2200, 10);    // baseboard
    // the lamp's light: bright under it, falling to near-black in the corners (moves as the lamp swings)
    g.save(); g.globalCompositeOperation = 'multiply';
    const fo = g.createRadialGradient(L.bulb[0], L.bulb[1] + 60, 30, L.bulb[0], L.bulb[1] + 60, 760);
    fo.addColorStop(0, '#ffffff'); fo.addColorStop(0.18, '#c8a878'); fo.addColorStop(0.42, '#6a5040'); fo.addColorStop(0.7, '#2e2224'); fo.addColorStop(1, '#1c1618');
    g.fillStyle = fo; g.fillRect(-700, -600, 2400, 1600);
    g.restore();
    // the counter's end panel faces the lamp: it catches a little of its light (he slides down it later)
    const pg = g.createLinearGradient(PANEL_X, 0, PANEL_X + 20, 0);
    pg.addColorStop(0, '#34241a'); pg.addColorStop(1, '#4e3826');
    g.fillStyle = pg; g.beginPath(); g.moveTo(PANEL_X - 3, 400); g.lineTo(PANEL_X + 19, 412); g.lineTo(PANEL_X + 19, WALL_BASE); g.lineTo(PANEL_X - 3, 600); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,200,130,.25)'; g.beginPath(); g.moveTo(PANEL_X - 3, 400); g.lineTo(PANEL_X + 19, 412); g.lineTo(PANEL_X + 19, 415); g.lineTo(PANEL_X - 3, 404); g.closePath(); g.fill();
    g.fillStyle = 'rgba(200,170,130,.35)'; g.fillRect(-600, 400, PANEL_X + 597, 3);
    // the window (its own light), the sill, the frame and the café curtain
    night(g, t);
    g.fillStyle = '#5a4430'; g.fillRect(WIN.x0 - 14, WIN.y0 - 14, WIN.x1 - WIN.x0 + 28, 14); g.fillRect(WIN.x0 - 14, WIN.y0, 14, WIN.y1 - WIN.y0); g.fillRect(WIN.x1, WIN.y0, 14, WIN.y1 - WIN.y0);
    g.fillRect(WIN.x0 - 22, WIN.y1, WIN.x1 - WIN.x0 + 44, 12);
    g.fillRect((WIN.x0 + WIN.x1) / 2 - 4, WIN.y0, 8, WIN.y1 - WIN.y0); g.fillRect(WIN.x0, (WIN.y0 + WIN.y1) / 2 - 4, WIN.x1 - WIN.x0, 8);
    g.fillStyle = 'rgba(150,90,60,.85)';  // gingham café curtains on the lower half, pushed apart
    for (const [x0, x1] of [[WIN.x0 - 6, WIN.x0 + 52], [WIN.x1 - 52, WIN.x1 + 6]]) {
      g.beginPath(); g.moveTo(x0, 330); g.lineTo(x1, 330); g.quadraticCurveTo(x1 - 8, 390, x1 + (x0 < 500 ? -6 : 6), WIN.y1); g.lineTo(x0, WIN.y1); g.closePath(); g.fill();
    }
    g.fillStyle = 'rgba(70,40,30,.5)'; for (let y = 334; y < WIN.y1; y += 10) for (const x0 of [WIN.x0 - 6, WIN.x1 - 52]) g.fillRect(x0, y, 58, 4);
    g.fillStyle = '#6a5a4a'; g.fillRect(WIN.x0 - 14, 326, WIN.x1 - WIN.x0 + 28, 4);
    // the streetlight spills blue onto the sill and the wall round the window
    g.save(); g.globalCompositeOperation = 'screen';
    const bl = g.createRadialGradient(WIN.x0 + 80, 280, 60, WIN.x0 + 80, 280, 360);
    bl.addColorStop(0, 'rgba(70,100,160,.32)'); bl.addColorStop(1, 'rgba(70,100,160,0)');
    g.fillStyle = bl; g.fillRect(200, 0, 800, 700);
    // the warm pool on the wall and the floor under the lamp
    const pool = g.createRadialGradient(L.bulb[0], L.bulb[1] + 40, 10, L.bulb[0], L.bulb[1] + 40, 330);
    pool.addColorStop(0, 'rgba(255,200,120,.35)'); pool.addColorStop(1, 'rgba(255,190,110,0)');
    g.fillStyle = pool; g.fillRect(L.bulb[0] - 400, L.bulb[1] - 300, 800, 800);
    g.restore();
  }
  function shadows(g, t) {
    const L = lampAt(t), f = father(t);
    g.fillStyle = g.strokeStyle = '#000';
    // his shadow, thrown up onto the wall and the cabinets from the lamp (central projection), never on the glass
    g.save();
    g.beginPath(); g.rect(-800, -400, 2400, 1400); g.rect(WIN.x1, WIN.y0, WIN.x0 - WIN.x1, WIN.y1 - WIN.y0); g.clip('evenodd');
    g.translate(L.bulb[0], L.bulb[1]); g.scale(1.2, 1.14); g.translate(-L.bulb[0], -L.bulb[1]);
    drawKid(g, KIDS.father, f.pose, f.x, FLOOR, H, '#000');
    g.restore();
    // the table's shadow pooled under it on the floor, sliding as the lamp swings
    const dx = (TABLE.x0 + TABLE.x1) / 2 - L.bulb[0];
    g.beginPath(); g.ellipse((TABLE.x0 + TABLE.x1) / 2 + dx * 0.5, 628, 190, 22, 0, 0, TAU); g.fill();
  }
  function chair(g, x, y, s, side) {  // a kitchen chair: back spindles, seat, legs; side 0 = seen from the front
    g.fillStyle = g.strokeStyle = COL.chair; g.lineCap = 'round';
    if (!side) {
      g.lineWidth = 5 * s; g.beginPath(); g.moveTo(x - 34 * s, y); g.lineTo(x - 34 * s, y - 120 * s); g.moveTo(x + 34 * s, y); g.lineTo(x + 34 * s, y - 120 * s); g.stroke();
      g.fillRect(x - 38 * s, y - 128 * s, 76 * s, 14 * s);
      g.lineWidth = 3 * s; for (const dx of [-14, 0, 14]) { g.beginPath(); g.moveTo(x + dx * s, y - 116 * s); g.lineTo(x + dx * s, y - 70 * s); g.stroke(); }
      g.fillRect(x - 38 * s, y - 72 * s, 76 * s, 7 * s);
    } else {  // side view: back post with a top rail, seat, two legs, a stretcher
      const b = -side;  // the back is on this side
      g.lineWidth = 6 * s;
      g.beginPath(); g.moveTo(x + b * 22 * s, y); g.lineTo(x + b * 22 * s, y - 64 * s); g.lineTo(x + b * 27 * s, y - 128 * s); g.stroke();
      g.beginPath(); g.moveTo(x - b * 22 * s, y); g.lineTo(x - b * 22 * s, y - 64 * s); g.stroke();
      g.fillRect(x - 28 * s, y - 68 * s, 56 * s, 8 * s);
      g.lineWidth = 4 * s; g.beginPath(); g.moveTo(x - 22 * s, y - 24 * s); g.lineTo(x + 22 * s, y - 24 * s); g.stroke();
      g.lineWidth = 10 * s; g.beginPath(); g.moveTo(x + b * 24 * s, y - 112 * s); g.lineTo(x + b * 26 * s, y - 126 * s); g.stroke();
    }
  }
  function tableTop(g, t) {
    const L = lampAt(t);
    const tg = g.createRadialGradient(L.bulb[0], TABLE.far + 10, 10, L.bulb[0], TABLE.far + 10, 300);
    tg.addColorStop(0, '#a07a4c'); tg.addColorStop(0.5, '#6e5134'); tg.addColorStop(1, '#3e2c1e');
    g.fillStyle = tg;
    g.beginPath(); g.moveTo(TABLE.x0, TABLE.far); g.lineTo(TABLE.x1, TABLE.far); g.lineTo(TABLE.x1 + 14, TABLE.near); g.lineTo(TABLE.x0 - 14, TABLE.near); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(40,26,16,.35)'; g.lineWidth = 1;
    for (let y = TABLE.far + 6; y < TABLE.near; y += 7) { g.beginPath(); g.moveTo(TABLE.x0 - 10, y); g.lineTo(TABLE.x1 + 10, y + 1); g.stroke(); }
  }
  function tableFront(g) {
    g.fillStyle = COL.table;
    g.fillRect(TABLE.x0 - 14, TABLE.near, TABLE.x1 - TABLE.x0 + 28, TABLE.top - TABLE.near);
    g.fillStyle = '#2c1f16'; g.fillRect(TABLE.x0 - 4, TABLE.top, TABLE.x1 - TABLE.x0 + 8, TABLE.apron - TABLE.top);
    for (const x of [TABLE.x0, TABLE.x1 - 14]) g.fillRect(x, TABLE.apron, 14, TABLE.legNear - TABLE.apron);
    g.fillStyle = '#261a12';
    for (const x of [TABLE.x0 + 26, TABLE.x1 - 38]) g.fillRect(x, TABLE.apron, 11, TABLE.legFar - TABLE.apron);
  }
  function bottleAndGlass(g) {
    g.fillStyle = COL.glass;
    // a whisky bottle, shoulder and neck; a short glass with a finger left in it
    const bx = 758, by = 494, k = 0.62;
    g.save(); g.translate(bx, by); g.scale(k, k);
    g.beginPath(); g.moveTo(-16, 0); g.lineTo(-16, -70); g.quadraticCurveTo(-16, -86, -5, -90); g.lineTo(-5, -116); g.lineTo(5, -116); g.lineTo(5, -90); g.quadraticCurveTo(16, -86, 16, -70); g.lineTo(16, 0); g.closePath(); g.fill();
    g.fillRect(-6, -124, 12, 9);
    g.restore();
    g.beginPath(); g.moveTo(718, 494); g.lineTo(717, 476); g.lineTo(735, 476); g.lineTo(734, 494); g.closePath(); g.fill();
  }
  function lamp(g, t) {
    const L = lampAt(t);
    g.strokeStyle = '#2a201a'; g.lineWidth = 2; g.beginPath(); g.moveTo(LAMP.px, LAMP.py); g.lineTo(L.top[0], L.top[1]); g.stroke();
    g.fillStyle = '#2a201a'; g.fillRect(LAMP.px - 16, LAMP.py - 4, 32, 7);
    g.save(); g.translate(L.top[0], L.top[1]); g.rotate(-L.a);
    g.fillStyle = COL.shade;
    g.beginPath(); g.moveTo(-8, 0); g.lineTo(8, 0); g.quadraticCurveTo(14, 8, 18, 12); g.quadraticCurveTo(56, 22, 58, 44); g.lineTo(-58, 44); g.quadraticCurveTo(-56, 22, -18, 12); g.quadraticCurveTo(-14, 8, -8, 0); g.closePath(); g.fill();
    g.restore();
  }
  // the table as the camera sees it (top and front face): the father is behind it and hidden there
  function tablePath(g) {
    g.moveTo(TABLE.x0, TABLE.far); g.lineTo(TABLE.x1, TABLE.far); g.lineTo(TABLE.x1 + 14, TABLE.near); g.lineTo(TABLE.x1 + 14, TABLE.apron);
    g.lineTo(TABLE.x0 - 14, TABLE.apron); g.lineTo(TABLE.x0 - 14, TABLE.near); g.closePath();
  }
  function handWorld(f) { const hd = f.pose.armF[1]; return [f.x + hd[0] * SC, FLOOR + hd[1] * 1.14 * SC]; }
  function shapes(g, t) {
    const f = father(t);
    chair(g, X_SIT, 560, 1.15, 0);
    drawKid(g, KIDS.father, f.pose, f.x, FLOOR, H, COL.kid);
    if (f.carrying) { const [wx, wy] = handWorld(f); g.fillStyle = COL.kid; capShape(g, wx, wy + 6, 26, 0); }
    lamp(g, t);
  }
  // the table and what is on it sit in front of him and under the lamp: drawn after the rim pass, so the lamp-lit
  // furniture is not outlined like a back-lit shape
  function furniture(g, t) {
    const f = father(t);
    tableTop(g, t);
    tableFront(g);
    if (t < 102.48) { g.fillStyle = COL.kid; capShape(g, CAP_ON_TABLE[0], CAP_ON_TABLE[1], 26, 1); }
    if (f.reaching || f.steady) {  // his hand and forearm on the table top, in front of its far edge
      const [wx, wy] = handWorld(f);
      g.save(); g.beginPath(); g.arc(wx, wy, 40, 0, TAU); g.clip();
      drawKid(g, KIDS.father, f.pose, f.x, FLOOR, H, COL.kid);
      if (f.carrying) { g.fillStyle = COL.kid; capShape(g, wx, wy + 6, 26, 0); }
      g.restore();
    }
    bottleAndGlass(g);
    chair(g, 862, 646, 1.2, -1);
  }
  function over(g, t) {
    furniture(g, t);
    const L = lampAt(t);
    // the bulb under the shade, and the shade's lit inner rim
    g.save(); g.translate(L.top[0], L.top[1]); g.rotate(-L.a);
    const bg2 = g.createRadialGradient(0, 40, 2, 0, 40, 70);
    bg2.addColorStop(0, 'rgba(255,248,225,1)'); bg2.addColorStop(0.25, 'rgba(255,220,150,.7)'); bg2.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = bg2; g.beginPath(); g.ellipse(0, 44, 70, 26, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,214,150,.9)'; g.beginPath(); g.ellipse(0, 44, 56, 5, 0, 0, TAU); g.fill();
    g.restore();
    // the near counter's edge and a coffee can, right by the lens, far out of focus
    g.save(); g.filter = 'blur(9px)';
    g.fillStyle = '#1e1612'; g.beginPath(); g.moveTo(-120, 760); g.lineTo(-120, 650); g.quadraticCurveTo(10, 600, 110, 640); g.lineTo(150, 760); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,200,130,.22)'; g.fillRect(40, 626, 60, 8);
    g.restore();
  }
  // low-light camcorder noise: a little chroma speckle, seeded by the frame
  function post(g, t) {
    const R = rng(Math.round(t * 24) * 7919 + 13);
    for (let i = 0; i < 900; i++) {
      const c = R();
      g.fillStyle = c < 0.33 ? 'rgba(255,90,90,.07)' : c < 0.66 ? 'rgba(90,255,140,.06)' : 'rgba(110,120,255,.08)';
      g.fillRect(R() * 960, R() * 720, 2 + R() * 3, 1);
    }
  }

  SCENE.add({
    id: 'father', t0: TAKE, t1: END,
    stamp: () => ({ date: 'NOV.02 1991', time: '11:52PM' }),
    camera,
    bg, shadows, shapes, over, post,
    light: { rim: '#ffcf8f', glow: 'rgba(255,190,110,.7)', glowBlur: 4, rimW: 1.15, sunDir: [0, -1], strength: 0.75 },
    source: (t) => { const L = lampAt(t); return { x: L.bulb[0], y: L.bulb[1] + 10, r: 150, a: 0.75 }; },
    grade: { bright: 1.08, contrast: 1.1, sat: 0.92 },
  });
})();
