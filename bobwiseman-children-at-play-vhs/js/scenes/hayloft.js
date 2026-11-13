// scenes/hayloft.js · "flying, you and me, up in the hayloft": inside the barn, SEP.12 1992. The mother films from
// the barn floor. It opens at full zoom on the sky through the top of the loft's hay door: empty sky, a few distant
// birds, then the two of them fly through the frame on "Flying" (hand in hand, arms out like wings), sky again, and
// they fly through again on "you and me flying". Just before "up in the hayloft" the zoom pulls back and the barn
// appears (Robin, Nov 11). You and me leap off the loft edge into the hay pile (holding hands), high-five in the hay, climb
// the ladder, take a bigger running leap, climb again while the camera tilts up, and on the third leap the hats and
// shoes fly off (then a sock each gets flung up out of the hay). Barefoot, they run out of the big door into the
// glare with their arms out like planes, and the camera follows through the doorway.
// Only hats, shoes and socks ever come off.
(function () {
  const T = window.TIMING, S = T.scenes;
  const { KIDS, drawKid, poses: P, lerpPose } = window.CAST;
  const TAU = Math.PI * 2;

  // ---- hits, song seconds (work/hits.txt, vocal-stem onsets) ----------------------------------------------
  const T0 = S.hayloft, T1 = S.grass;
  const FLY1 = 208.2;      // takeoff a beat before the held "Flying" (vocal stem: 208.38 to 213.4), holding hands
  const YOUME = 214.03;    // "you and me": a high five in the hay
  const FLY2 = 215.8;      // takeoff for the second held "flying" (vocal stem: 216.0 to 220.3), with a running start
  const LOFTUP = 222.88;   // "up in the hayloft": the camera tilts up the ladder after them
  const HAYLOFT = 224.26;  // "hayloft": the camera arrives at the loft
  const LOSE = 229.18;     // "Losing": third leap; hats blow off, shoes get kicked off
  const CLOTH = 232.91;    // "our clothing": a sock each, yanked off and flung up out of the hay
  const GLAD = 238.18;     // "glad": off the hay toward the open door
  const FREE = 239.78;     // "to be free": out of the door into the glare, arms out like planes

  // ---- helpers ------------------------------------------------------------------------------------------
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const sm = (x) => x * x * (3 - 2 * x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const L2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  }
  function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); g.fill(); }

  // ---- the barn, in world units (960 x 720 frame at zoom 1) -----------------------------------------------
  const FLOOR = 640;                     // where the back wall meets the floor
  const FY = 652;                        // where the kids stand on the floor (a step in front of the wall)
  const LOFT_Y = 384, LOFT_EDGE = 372;   // the loft floor's front edge, its right-hand end
  const DOOR = [432, 318, 718, 640];     // the big open barn door (the source behind everything)
  const LDOOR = [118, 30, 420, 384];     // the loft's hay door, high in the back wall behind the loft edge (wide and tall:
                                         // the opening shot is framed inside it, nothing but sky behind the leaps)
  const STALL = [16, 452, 150, 546];     // a stall window under the loft, behind the ladder
  const HOR = 515, VPX = 600;            // horizon and vanishing point of the field outside
  const SUN = [606, 470];
  const HAY = { cx: 446, w: 202, base: FLOOR + 10, top: 510 };
  const LAD = { b: [100, FY], t: [56, 294] };  // ladder: foot on the floor, top above the loft edge
  const COL = { kid: '#261a1e', wood: '#2a1c13', hayDark: '#2c2116' };

  function hayY(x) {  // the top of the hay pile at x (or far below when off the pile)
    const u = (x - HAY.cx) / HAY.w;
    if (Math.abs(u) >= 1) return 9999;
    const lump = 5 * Math.sin(x * 0.045) + 3 * Math.sin(x * 0.11 + 1);
    return HAY.base - (HAY.base - HAY.top) * Math.pow(1 - u * u, 0.75) + lump * (1 - u * u);
  }
  const ground = (x) => Math.min(hayY(x), FY);

  // scenery laid out once from a fixed seed
  const R = rng(920912);
  const planks = [];
  for (let x = -760; x < 1760; ) { const w = 28 + R() * 16; planks.push([x, w, R(), R(), R()]); x += w; }
  const leaks = planks.filter((p) => p[3] < 0.3).map((p) => [p[0], -200 + p[4] * 300, 120 + R() * 380]);
  const straw = [];
  for (let i = 0; i < 900; i++) { const x = HAY.cx + (R() * 2 - 1) * HAY.w * 0.98; straw.push([x, R(), R() * TAU, 5 + R() * 9, R()]); }
  const floorStraw = [];
  for (let i = 0; i < 260; i++) floorStraw.push([-300 + R() * 1500, FLOOR + 4 + Math.pow(R(), 1.4) * 140, R() * TAU, 4 + R() * 10, R()]);
  const fringe = [];
  for (let x = HAY.cx - HAY.w + 6; x < HAY.cx + HAY.w - 6; x += 2.2 + R() * 2.4) fringe.push([x, (R() - 0.5) * 1.3, 4 + R() * 10, R()]);
  const fieldMarks = [];
  for (let i = 0; i < 700; i++) { const k = Math.pow(R(), 1.6); fieldMarks.push([VPX + (R() * 2 - 1) * (60 + 900 * k), HOR + 2 + k * 135, k, R()]); }
  const trees = [];
  for (let x = -100; x < 1400; x += 10 + R() * 18) trees.push([x, HOR - 6 - R() * 18, 8 + R() * 14]);
  const motes = [];
  for (let i = 0; i < 170; i++) motes.push([R(), R() - 0.5, 0.004 + R() * 0.012, R() * TAU, 0.6 + R() * 1.2, (R() * 5) | 0]);
  const BIRDS = [  // [time it enters at x 100, height, speed px/s, size, phase]: two or three at a time, far off
    [205.6, 92, 34, 1, 0.3], [206.8, 120, 30, 0.8, 1.9], [212.0, 70, 38, 1.1, 2.6], [212.7, 104, 33, 0.9, 4.1], [213.4, 86, 36, 0.75, 5.0],
    [216.4, 140, 31, 1, 0.8], [217.1, 112, 35, 0.85, 3.3],
  ];
  const BEAMS = [  // sunbeams from gaps in the back wall and roof: origin, direction, length, width at the far end
    [[790, 96], [-0.52, 1], 760, 74, 0.2], [[862, 150], [-0.5, 1], 700, 56, 0.16], [[930, 60], [-0.55, 1], 820, 84, 0.13],
    [[262, 18], [-0.38, 1], 560, 60, 0.12], [[612, -40], [-0.46, 1], 620, 50, 0.09],
  ];

  // ---- background ---------------------------------------------------------------------------------------
  function outside(g, t) {  // the bright afternoon field seen through every opening
    const sky = g.createLinearGradient(0, -100, 0, HOR);
    sky.addColorStop(0, '#a6c2d6'); sky.addColorStop(0.42, '#d3e0e2'); sky.addColorStop(0.72, '#f6f0dc'); sky.addColorStop(1, '#fff8e6');
    g.fillStyle = sky; g.fillRect(-800, -400, 2600, HOR + 400);
    // a few soft fair-weather clouds, so the tight opening reads as open sky
    for (const [cx, cy, w] of [[190, 196, 1], [356, 158, 0.8], [640, 140, 1.1], [-120, 210, 0.9]]) {
      g.fillStyle = 'rgba(255,255,250,.62)';
      for (const [dx, dy, r] of [[0, 0, 26], [24, -10, 22], [48, 2, 20], [-22, 6, 18], [70, 8, 14]]) { g.beginPath(); g.arc(cx + dx * w, cy + dy * w, r * w, 0, TAU); g.fill(); }
    }
    const sg = g.createRadialGradient(SUN[0], SUN[1], 2, SUN[0], SUN[1], 260);
    sg.addColorStop(0, 'rgba(255,255,250,1)'); sg.addColorStop(0.25, 'rgba(255,248,226,.8)'); sg.addColorStop(1, 'rgba(255,240,210,0)');
    g.fillStyle = sg; g.fillRect(SUN[0] - 300, SUN[1] - 300, 600, 600);
    // distant birds drifting across, so the empty sky between the leaps is never dead
    g.strokeStyle = 'rgba(52,46,48,.8)'; g.lineWidth = 1.3; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [t0, y0, vx, s, ph] of BIRDS) {
      const x = 100 + (t - t0) * vx, y = y0 + 6 * Math.sin((t - t0) * 0.9 + ph);
      if (x < 60 || x > 480) continue;
      const f = Math.sin(t * 9 + ph * 3), w = 5 * s, d = 2.6 * s * f;   // wingbeat
      g.beginPath(); g.moveTo(x - w, y - d); g.quadraticCurveTo(x - w * 0.4, y - d * 0.2 - 1.2 * s, x, y); g.quadraticCurveTo(x + w * 0.4, y - d * 0.2 - 1.2 * s, x + w, y - d); g.stroke();
    }
    // a pale silo and a big tree on the far side of the yard, seen through the loft's hay door
    g.fillStyle = 'rgba(214,202,168,.8)';
    g.fillRect(196, 330, 46, HOR - 330); g.beginPath(); g.arc(219, 332, 23, Math.PI, 0); g.fill();
    g.fillStyle = 'rgba(200,190,150,.6)';
    for (const [dx, dy, r] of [[0, 0, 62], [-48, 22, 44], [50, 18, 48], [-20, -40, 40], [28, -34, 42]]) { g.beginPath(); g.arc(330 + dx, 372 + dy, r, 0, TAU); g.fill(); }
    g.fillRect(324, 380, 12, HOR - 380);
    g.fillStyle = 'rgba(206,192,150,.75)';
    for (const [x, y, r] of trees) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillRect(-800, HOR - 8, 2600, 10);
    const fg = g.createLinearGradient(0, HOR, 0, FLOOR + 10);
    fg.addColorStop(0, '#f7e8bb'); fg.addColorStop(0.35, '#ecd596'); fg.addColorStop(1, '#d5b56c');
    g.fillStyle = fg; g.fillRect(-800, HOR, 2600, FLOOR + 10 - HOR);
    const hz = g.createRadialGradient(SUN[0], HOR, 4, SUN[0], HOR, 420);
    hz.addColorStop(0, 'rgba(255,252,236,.95)'); hz.addColorStop(0.3, 'rgba(255,244,210,.45)'); hz.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = hz; g.fillRect(SUN[0] - 450, HOR - 200, 900, 360);
    for (const [x, y, k, r] of fieldMarks) {  // grass in perspective: dark stems with a lit tip
      const h = 1 + k * 7;
      g.strokeStyle = `rgba(150,120,60,${0.18 + 0.3 * k})`; g.lineWidth = 0.4 + k * 1.1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r - 0.5) * h, y - h); g.stroke();
    }
  }
  function bg(g, t) {
    // back wall: vertical boards, warm brown, brighter toward the door from the bounce light
    g.fillStyle = '#3d2a1b'; g.fillRect(-900, -700, 2900, FLOOR + 720);
    for (const [x, w, a, , c] of planks) {
      const l = 21 + a * 9;
      g.fillStyle = `hsl(${26 + c * 6},${30 + a * 10}%,${l}%)`;
      g.fillRect(x + 1, -700, w - 1.6, FLOOR + 700);
      g.strokeStyle = 'rgba(30,18,10,.35)'; g.lineWidth = 0.8;
      for (let k = 0; k < 3; k++) { const gx = x + w * (0.25 + 0.25 * k) + Math.sin(c * 9 + k) * 2; g.beginPath(); g.moveTo(gx, -700); g.bezierCurveTo(gx + 2, -100, gx - 2, 300, gx + 1, FLOOR); g.stroke(); }
    }
    const bounce = g.createRadialGradient(580, 520, 20, 580, 520, 640);
    bounce.addColorStop(0, 'rgba(255,214,150,.42)'); bounce.addColorStop(0.5, 'rgba(240,180,110,.16)'); bounce.addColorStop(1, 'rgba(240,180,110,0)');
    g.fillStyle = bounce; g.fillRect(-200, -200, 1600, 1000);
    // light leaking through the seams between boards
    for (const [x, y0, len] of leaks) {
      if (x > LDOOR[0] - 10 && x < LDOOR[2] + 10 && y0 + len > LDOOR[1]) continue;
      if (x > DOOR[0] - 10 && x < DOOR[2] + 10 && y0 + len > DOOR[1]) continue;
      const lg = g.createLinearGradient(0, y0, 0, y0 + len);
      lg.addColorStop(0, 'rgba(255,236,190,0)'); lg.addColorStop(0.2, 'rgba(255,236,190,.85)'); lg.addColorStop(0.8, 'rgba(255,230,180,.75)'); lg.addColorStop(1, 'rgba(255,230,180,0)');
      g.strokeStyle = lg; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + len); g.stroke();
      g.lineWidth = 6; g.globalAlpha = 0.16; g.stroke(); g.globalAlpha = 1;
    }
    // under the loft it is darker
    const ul = g.createLinearGradient(0, LOFT_Y, 0, FLOOR);
    ul.addColorStop(0, 'rgba(18,10,4,.55)'); ul.addColorStop(1, 'rgba(18,10,4,.25)');
    g.fillStyle = ul; g.fillRect(-900, LOFT_Y, LOFT_EDGE + 900, FLOOR - LOFT_Y);
    // the openings: outside light
    g.save(); g.beginPath();
    g.rect(DOOR[0], DOOR[1], DOOR[2] - DOOR[0], DOOR[3] - DOOR[1] + 12);
    g.rect(LDOOR[0], LDOOR[1], LDOOR[2] - LDOOR[0], LDOOR[3] - LDOOR[1]);
    g.rect(STALL[0], STALL[1], STALL[2] - STALL[0], STALL[3] - STALL[1]);
    g.clip(); outside(g, t); g.restore();
    // door frames: jambs and header with a warm lit inner edge
    const frame = (x0, y0, x1, y1, w) => {
      g.fillStyle = '#3a2717';
      g.fillRect(x0 - w, y0 - w, w, y1 - y0 + w); g.fillRect(x1, y0 - w, w, y1 - y0 + w); g.fillRect(x0 - w, y0 - w, x1 - x0 + 2 * w, w);
      g.fillStyle = 'rgba(255,214,150,.55)';
      g.fillRect(x0 - 2, y0, 2, y1 - y0); g.fillRect(x1, y0, 2, y1 - y0); g.fillRect(x0, y0 - 2, x1 - x0, 2);
    };
    frame(DOOR[0], DOOR[1], DOOR[2], DOOR[3], 14);
    frame(LDOOR[0], LDOOR[1], LDOOR[2], LDOOR[3], 11);
    frame(STALL[0], STALL[1], STALL[2], STALL[3], 8);
    g.fillStyle = '#3a2717'; g.fillRect(STALL[0], (STALL[1] + STALL[3]) / 2 - 3, STALL[2] - STALL[0], 6); g.fillRect((STALL[0] + STALL[2]) / 2 - 3, STALL[1], 6, STALL[3] - STALL[1]);
    // the big sliding door, pushed open to the right, and its track
    g.fillStyle = '#4a3220'; g.fillRect(DOOR[2] + 14, DOOR[1] - 18, 300, FLOOR - DOOR[1] + 18);
    g.strokeStyle = 'rgba(25,14,6,.55)'; g.lineWidth = 1.2;
    for (let x = DOOR[2] + 14; x < DOOR[2] + 314; x += 31) { g.beginPath(); g.moveTo(x, DOOR[1] - 18); g.lineTo(x, FLOOR); g.stroke(); }
    g.strokeStyle = '#33221a'; g.lineWidth = 12; g.lineCap = 'butt';
    g.beginPath(); g.moveTo(DOOR[2] + 20, FLOOR - 10); g.lineTo(DOOR[2] + 300, DOOR[1] - 4); g.moveTo(DOOR[2] + 14, FLOOR - 6); g.lineTo(DOOR[2] + 314, FLOOR - 6); g.moveTo(DOOR[2] + 14, DOOR[1] - 10); g.lineTo(DOOR[2] + 314, DOOR[1] - 10); g.stroke();
    g.fillStyle = '#22170f'; g.fillRect(DOOR[0] - 10, DOOR[1] - 30, 650, 8);
    // roof structure: a tie beam and knee braces high up
    g.fillStyle = '#2b1d12'; g.fillRect(-900, 0, 2900, 18);
    g.strokeStyle = '#2b1d12'; g.lineWidth = 14;
    for (const x of [-160, 420, 1000]) { g.beginPath(); g.moveTo(x - 70, 16); g.lineTo(x, -72); g.moveTo(x + 70, 16); g.lineTo(x, -72); g.stroke(); }
    g.fillRect(-900, -260, 2900, 16);
    // floor: packed earth and old boards, a pool of light from the door
    const fl = g.createLinearGradient(0, FLOOR, 0, FLOOR + 160);
    fl.addColorStop(0, '#5a4128'); fl.addColorStop(1, '#3b2918');
    g.fillStyle = fl; g.fillRect(-900, FLOOR, 2900, 400);
    g.save(); g.translate(575, FLOOR + 14); g.scale(1, 0.16);
    const pool = g.createRadialGradient(0, 0, 10, 0, 0, 520);
    pool.addColorStop(0, 'rgba(255,226,160,.85)'); pool.addColorStop(0.4, 'rgba(240,196,120,.35)'); pool.addColorStop(1, 'rgba(240,196,120,0)');
    g.fillStyle = pool; g.fillRect(-600, -600, 1200, 1200); g.restore();
    for (const [x, y, a, l, c] of floorStraw) {
      g.strokeStyle = c < 0.5 ? 'rgba(232,196,120,.55)' : 'rgba(120,88,44,.6)'; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * 0.35); g.stroke();
    }
    // the hay pile: lit from the door behind, a golden top edge, deeper brown below
    g.beginPath(); g.moveTo(HAY.cx - HAY.w, HAY.base);
    for (let x = HAY.cx - HAY.w + 1; x < HAY.cx + HAY.w; x += 4) g.lineTo(x, Math.min(HAY.base, hayY(x)));
    g.lineTo(HAY.cx + HAY.w, HAY.base); g.closePath();
    const hg = g.createLinearGradient(0, HAY.top, 0, HAY.base);
    hg.addColorStop(0, '#c99f55'); hg.addColorStop(0.35, '#a47b3c'); hg.addColorStop(1, '#6d4f26');
    g.fillStyle = hg; g.fill();
    g.save(); g.clip();
    for (const [x, ry, a, l, c] of straw) {
      const top = hayY(x), y = top + 2 + ry * (HAY.base - top);
      const k = (y - top) / (HAY.base - top + 1);
      g.strokeStyle = c < 0.45 ? `rgba(244,214,140,${0.55 - 0.35 * k})` : `rgba(80,56,24,${0.25 + 0.35 * k})`;
      g.lineWidth = 1.1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l * 0.55); g.stroke();
    }
    g.restore();
    for (const [x, lean, l, c] of fringe) {  // back-lit straw ends sticking up along the top
      const y = hayY(x);
      g.strokeStyle = c < 0.5 ? 'rgba(255,232,168,.85)' : 'rgba(214,170,92,.8)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y + 3); g.lineTo(x + lean * l, y + 3 - l); g.stroke();
    }
    void t;
  }

  // ---- props and items ----------------------------------------------------------------------------------
  function hatShape(g, type, x, y, f = 0) {  // a hat at head centre (x, y), kid-local units
    if (type === 'bucket') {
      ell(g, x - f * 0.6, y - 7, 12.8, 9.6);
      g.beginPath(); g.moveTo(x - 18.5, y - 1.5); g.quadraticCurveTo(x, y - 6.5, x + 18.5, y - 1.5);
      g.lineTo(x + 16, y + 3); g.quadraticCurveTo(x, y - 0.5, x - 16, y + 3); g.closePath(); g.fill();
    } else {  // a kid's straw cowboy hat: dented crown, brim curled up at the sides
      g.beginPath(); g.moveTo(x - 10.5, y - 5); g.lineTo(x - 9, y - 19); g.quadraticCurveTo(x - 4.5, y - 22.5, x, y - 18.5);
      g.quadraticCurveTo(x + 4.5, y - 22.5, x + 9, y - 19); g.lineTo(x + 10.5, y - 5); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(x - 21, y - 11); g.quadraticCurveTo(x - 17, y - 3.5, x, y - 4.5); g.quadraticCurveTo(x + 17, y - 3.5, x + 21, y - 11);
      g.quadraticCurveTo(x + 18, y - 0.5, x, y - 0.8); g.quadraticCurveTo(x - 18, y - 0.5, x - 21, y - 11); g.closePath(); g.fill();
    }
  }
  function shoeShape(g, x, y, toe) {
    ell(g, x + toe * 2.8, y - 2.2, 8.2, 4.7);
    g.fillRect(x + toe * 2.8 - 8.6, y - 0.6, 17.2, 2.4);
  }
  function sockShape(g) {  // a floppy kid's sock: slim leg with a cuff, heel, foot, round toe
    g.beginPath();
    g.moveTo(-4.5, -14); g.lineTo(1, -14); g.quadraticCurveTo(1.5, -6, 2.5, -1.5); g.quadraticCurveTo(4, 0.5, 8.5, 0.6);
    g.quadraticCurveTo(12.5, 1, 12.5, 3.6); g.quadraticCurveTo(12.5, 6.2, 8.5, 6.2); g.lineTo(-0.5, 6.2);
    g.quadraticCurveTo(-5, 6, -4.8, 1); g.closePath(); g.fill();
    g.fillRect(-5.2, -16, 7, 2.6);
  }
  // kid-local props: hat and shoes on the current pose (drawn after the limbs, same colour, so overlaps vanish)
  function dress(pose, k, hat, shoes) {
    const pr = (pose.props || []).slice();
    if (hat) { const hd = pose.head, f = pose.face || 0; pr.push((g) => hatShape(g, KD[k].hat, hd[0], hd[1], f)); }
    if (shoes) {  // 2 = both shoes on, 1 = the far foot's shoe already kicked off
      const toe = pose.toe != null ? pose.toe : (pose.face || 1);
      for (const L of shoes >= 2 ? [pose.legB, pose.legF] : [pose.legF]) if (L) { const ft = L[1]; pr.push((g) => shoeShape(g, ft[0], ft[1], toe)); }
    }
    pose.props = pr;
    return pose;
  }

  // ---- poses built for this scene (same point structure as cast.js) ---------------------------------------
  // Front view, standing; c bends the knees (crouch to jump), arms hang unless set later.
  function front(c = 0, o = {}) {
    const dy = 9 * c;
    return Object.assign({
      hip: [0, -47 + dy], chest: [0, -77 + dy * 1.15], head: [0, -90 + dy * 1.2], face: 0, toe: 0,
      legB: [[-6 - 4 * c, -24 + dy * 0.45], [-6, -1]], legF: [[6 + 4 * c, -24 + dy * 0.45], [6, -1]],
      armB: [[-15, -62 + dy], [-16 - 6 * c, -49 + dy * 0.6]], armF: [[15, -62 + dy], [16 + 6 * c, -49 + dy * 0.6]],
    }, o);
  }
  // an outer arm (side -1 = armB, +1 = armF) at an angle: up 0 = straight out to the side, 1 = high V
  function outerArm(p, side, up, flap = 0) {
    const c = p.chest, a = (lerp(0, 62, up) + flap) * Math.PI / 180;
    const el = add(c, [side * 14 * Math.cos(a * 0.7), -2 - 12 * Math.sin(a * 0.7)]);
    const hd = add(el, [side * 16 * Math.cos(a), -16 * Math.sin(a) + 2]);
    p[side < 0 ? 'armB' : 'armF'] = [el, hd];
  }
  // Airborne, front view: tuck 0..1 brings the knees up; spread opens the legs.
  function jump(tuck, spread = 0, kick = [0, 0]) {
    const p = front(0);
    for (const side of [-1, 1]) {
      const kk = kick[side < 0 ? 0 : 1];
      const knee = [side * (6 + 4 * tuck + 8 * spread + 4 * kk), -24 - 14 * tuck + 4 * spread];
      const foot = [side * (7 + 5 * tuck + 16 * spread + 14 * kk), -1 - 18 * tuck + 3 * spread - 12 * kk];
      p[side < 0 ? 'legB' : 'legF'] = [knee, foot];
    }
    return p;
  }
  // Star: arms and legs flung wide (the big leap).
  function star(k) {
    const p = jump(0.15 * (1 - k), k);
    outerArm(p, -1, lerp(0.4, 0.75, k)); outerArm(p, 1, lerp(0.4, 0.75, k));
    p.hairSwing = 0.6;
    return p;
  }
  // Running away from the camera (back view) with the arms out like plane wings. bank -1..1 tips the wings.
  function planeRun(ph, bank, wings) {
    const s = Math.sin(ph * TAU), bob = Math.abs(s) * 3;
    const hip = [bank * 2, -46 - bob], chest = [bank * 6, -76 - bob], head = [bank * 8.5, -89 - bob];
    const leg = (side) => {
      const u = Math.max(0, side > 0 ? s : -s);
      return [[side * 5 + bank * 1.5, -24 - bob * 0.6 - 3 * u], [side * 6 + bank, -1 - 21 * u]];
    };
    const arm = (side) => {
      const sw = side * s * 12;  // running arms, before the wings open
      const rest = [add(chest, [side * 11, 13 + sw * 0.3]), add(chest, [side * 12 + sw * 0.4, 25])];
      const wing = [add(chest, [side * 15, 1 - side * bank * 5]), add(chest, [side * 33, 2 - side * bank * 13])];
      return [L2(rest[0], wing[0], wings), L2(rest[1], wing[1], wings)];
    };
    return { hip, chest, head, face: 0, toe: 0, legB: leg(-1), legF: leg(1), armB: arm(-1), armF: arm(1), hairSwing: bank * 0.4 };
  }
  // Laughing in the hay (front view; the legs are hidden in the hay): shoulders bob, arms flail.
  function hayLaugh(t, k, sg, wild) {
    const p = front(0.2);
    const b = Math.sin(t * TAU * 3.1 + sg) * 1.6;
    p.chest = add(p.chest, [0, b]); p.head = add(p.head, [Math.sin(t * 5 + sg) * 1.5, b * 1.3]);
    outerArm(p, -1, 0.5 + 0.35 * Math.sin(t * 6.3 + sg) * wild + 0.4 * (1 - wild), 14 * Math.sin(t * 9 + sg) * wild);
    outerArm(p, 1, 0.5 + 0.35 * Math.sin(t * 6.3 + sg + 2) * wild + 0.4 * (1 - wild), 14 * Math.sin(t * 9 + sg + 2) * wild);
    p.hairSwing = 0.3 * Math.sin(t * 7 + sg);
    void k;
    return p;
  }

  // ---- the two kids ---------------------------------------------------------------------------------------
  const KH = 130;  // the kids' h at the loft / hay pile depth
  const KD = {
    me:    { kid: KIDS.me,    sg: -1, hat: 'cowboy' },
    hider: { kid: KIDS.hider, sg: 1,  hat: 'bucket' },
  };
  const sOf = (k, h) => h / 100 * KD[k].kid.size;
  const F1 = 2.2, F2 = 2.2, F3 = 1.3;   // the two sky leaps a little slow-motion (Robin, Nov 11)
  const TIM = {
    me:    { land1: FLY1 + F1, out1: 211.5, lad1: 212.6, top1: 214.0, take2: FLY2 + 0.2, out2: 222.00, lad2: 223.05, top2: 224.45, edge3: 226.30 },
    hider: { land1: FLY1 + F1, out1: 211.8, lad1: 213.3, top1: 214.8, take2: FLY2,       out2: 222.20, lad2: 223.85, top2: 225.25, edge3: 226.70 },
  };
  const LAND = [null, { me: 400, hider: 444 }, { me: 420, hider: 480 }, { me: 474, hider: 520 }];
  const EDGE = { me: 262, hider: 306 }, TAKE2 = { me: 200, hider: 250 };
  const SKYX = { me: 196, hider: 240 };   // where the first sky leap starts, so the pair crosses the middle of the frame
  const SKYLEAP = 250;   // the first two leaps go up through the sky-only opening shot (Robin, Nov 11: they fly by)
  const OUT3 = 234.6, TOP = { me: 404, hider: 490 }, DOORP = { me: 648, hider: 700 };
  const HAT_OFF = { me: LOSE + 0.22, hider: LOSE + 0.3 };
  const SHOE_OFF = { me: [LOSE + 0.42, LOSE + 0.52], hider: [LOSE + 0.48, LOSE + 0.6] };
  const SOCK = { me: [CLOTH, CLOTH + 0.95], hider: [CLOTH + 0.1, CLOTH + 1.1] };
  const ladX = (y) => LAD.b[0] + (LAD.t[0] - LAD.b[0]) * (LAD.b[1] - y) / (LAD.b[1] - LAD.t[1]);
  const climbX = (k, y) => ladX(y - 94 * sOf(k, KH)) + 13 * sOf(k, KH);
  const sinkIn = (dt) => 20 + 22 * (1 - Math.exp(-dt * 9)) + 7 * Math.exp(-dt * 4) * Math.sin(dt * 14);

  function edgeWait(k, t0, tj, t, fromProfile, x0) {
    const sg = KD[k].sg;
    const crouch = sm(seg(t, tj - 0.42, tj - 0.04));
    const bob = (1 - crouch) * 0.18 * Math.max(0, Math.sin(t * 5.2 + sg * 1.3));
    let p = front(crouch * 1.1 + bob);
    outerArm(p, sg, lerp(-0.9, -1.25, crouch));  // outer arm hangs, swings back for the jump
    if (k === 'hider' && t0 === T0) {  // she points down at the hay: "look how high"
      const pt = sm(seg(t, 207.3, 207.7)) * (1 - sm(seg(t, 208.9, 209.3)));
      if (pt > 0) { const e = add(p.chest, [15, 4]), h = add(p.chest, [30, 22 + 2 * Math.sin(t * 9)]); p.armF = [L2(p.armF[0], e, pt), L2(p.armF[1], h, pt)]; }
    }
    if (fromProfile) p = lerpPose(P.stand(1), p, sm(seg(t, t0, t0 + 0.35)));
    return { x: x0 == null ? EDGE[k] : x0, y: LOFT_Y, h: KH, pose: p, held: true, hat: t < HAT_OFF[k], shoes: 2 };
  }
  function leapFront(k, t0, dur, x0, y0, xl, apex, t, third, sky) {
    const sg = KD[k].sg, u = seg(t, t0, dur + t0);
    const yl = hayY(xl) + 20;
    const x = lerp(x0, xl, u), y = lerp(y0, yl, u) - 4 * apex * u * (1 - u);
    const tuck = sm(seg(u, 0.1, 0.32)) * (1 - sm(seg(u, 0.62, 0.86)));
    let kick = [0, 0];
    if (third) {  // a kick as each shoe flies
      const kk = (tt) => Math.exp(-Math.pow((t - tt) / 0.07, 2));
      kick = [kk(SHOE_OFF[k][0]), kk(SHOE_OFF[k][1])];
    }
    const p = jump(tuck, 0.15 * sm(seg(u, 0.2, 0.5)), kick);
    const up = lerp(0.2, 0.75, sm(seg(u, 0, 0.18))) + 0.12 * Math.sin(u * 14);
    outerArm(p, sg, u > 0.82 ? lerp(up, 1, sm(seg(u, 0.82, 1))) : up, 8 * Math.sin(u * 20 + sg));
    p.hairSwing = -0.8 * Math.sin(u * Math.PI);
    if (sky) {  // through the sky shot: flying, not standing. Knees tucked, the free arm out like a wing, the body tipping
      // forward along the arc, rising then diving (pair() turns the two of them together about their joined hands)
      const q = jump(0.5, 0.12);
      outerArm(q, sg, 0.08 + 0.12 * Math.sin(u * 16 + sg), 7 * Math.sin(u * 18 + sg));
      q.hairSwing = -0.9;
      const lean = lerp(0.28, 0.95, sm(seg(u, 0.15, 0.95)));
      if (u < 0.08) { const c = front(1.1); outerArm(c, sg, -1.25); return { x, y, h: KH, pose: lerpPose(c, q, u / 0.08), held: true, hat: true, shoes: 2, fly: lean * u / 0.08 }; }
      return { x, y, h: KH, pose: q, held: true, hat: true, shoes: 2, fly: lean };
    }
    if (u < 0.08) { const c = front(1.1); outerArm(c, sg, -1.25); return { x, y, h: KH, pose: lerpPose(c, p, u / 0.08), held: true, hat: t < HAT_OFF[k], shoes: 2 }; }
    const sh = third ? SHOE_OFF[k] : [1e9, 1e9];
    return { x, y, h: KH, pose: p, held: true, hat: t < HAT_OFF[k], shoes: (t < sh[0] ? 1 : 0) + (t < sh[1] ? 1 : 0) };
  }
  function inHay(k, tl, xl, t, extra) {
    const sg = KD[k].sg, dt = t - tl;
    const x = xl + sg * 3 * sm(seg(dt, 0, 0.6));
    const y = hayY(x) + sinkIn(dt);
    const wild = 1 - sm(seg(dt, 0.6, 1.4)) * 0.6;
    let p = hayLaugh(t, k, sg, wild);
    const arrive = sm(seg(dt, 0, 0.25));  // impact: arms up from the landing
    if (arrive < 1) { const q = front(0.3); outerArm(q, -1, 1); outerArm(q, 1, 1); p = lerpPose(q, p, arrive); }
    const o = { x, y, h: KH, pose: p, held: false, hat: t < HAT_OFF[k], shoes: extra === 'socks' ? 0 : 2, sunk: true };
    if (extra === 'five') {  // turn to each other, near hands meet over the heads on "you and me"
      const turn = sm(seg(t, YOUME - 0.75, YOUME - 0.45)) * (1 - sm(seg(t, YOUME + 1.05, YOUME + 1.35)));
      if (turn > 0) {
        const d = -sg;
        const q = P.stand(d);
        const s = sOf(k, KH);
        const xo = (LAND[1].me + LAND[1].hider) / 2;
        const J = [xo, hayY(xo) + 40 - 122 * (sOf('me', KH) + sOf('hider', KH)) / 2];  // contact point, world
        const r = sm(seg(t, YOUME - 0.42, YOUME)) * (1 - sm(seg(t, YOUME + 0.22, YOUME + 0.6)) * 0.55);
        const hl = [(J[0] - x) / s, (J[1] - y) / s];
        const rest = q.armF[1];
        const hand = L2(rest, hl, r), elbow = L2(q.armF[0], L2(add(q.chest, [d * 6, -2]), hl, 0.5), r);
        q.armF = [add(elbow, [d * 3, 2]), hand];
        q.chest = add(q.chest, [d * 2 * r, -1.5 * r]);
        q.head = add(q.head, [d * 1.5 * r, -2 * r]);
        p = lerpPose(p, q, turn);
        p.face = turn > 0.5 ? d : 0;
      }
    }
    if (extra === 'socks') {  // reach down to the feet, yank a sock off, fling it up and out
      for (let i = 0; i < 2; i++) {
        const ts = SOCK[k][i], side = i === 0 ? sg : -sg;
        const reach = sm(seg(t, ts - 0.55, ts - 0.18)) * (1 - sm(seg(t, ts - 0.02, ts + 0.12)));
        const fling = sm(seg(t, ts - 0.02, ts + 0.14)) * (1 - sm(seg(t, ts + 0.55, ts + 0.95)));
        if (reach + fling <= 0) continue;
        p.chest = add(p.chest, [side * 3 * reach, 9 * reach]); p.head = add(p.head, [side * 4 * reach, 13 * reach]);
        const key = side < 0 ? 'armB' : 'armF';
        const down = [add(p.chest, [side * 12, 14]), [side * 9, -12]];
        const up = [add(p.chest, [side * 12, -14]), add(p.chest, [side * 20, -36])];
        const cur = p[key];
        let arm = [L2(cur[0], down[0], reach), L2(cur[1], down[1], reach)];
        arm = [L2(arm[0], up[0], fling), L2(arm[1], up[1], fling)];
        p[key] = arm;
        if (t < ts + 0.1 && t > ts - 0.12) {  // the sock in the hand until it leaves
          const hd = arm[1];
          p.props = (p.props || []).concat([(g) => { g.save(); g.translate(hd[0], hd[1] - 4); g.rotate(side * 0.5); g.scale(0.9, 0.9); sockShape(g); g.restore(); }]);
        }
      }
    }
    return o.pose = p, o;
  }
  function wadeOut(k, t0, t1, xl, t) {
    const u = seg(t, t0, t1), sg = KD[k].sg;
    const sx = sOf(k, KH), xLad = climbX(k, FY);
    let x, y;
    if (u < 0.62) { const w = sm(u / 0.62); x = lerp(xl, HAY.cx - HAY.w + 4, w); y = Math.min(hayY(x), FY) + 42 * (1 - w); }
    else { const w = (u - 0.62) / 0.38; x = lerp(HAY.cx - HAY.w + 4, xLad, w); y = FY; }
    const ph = (t - t0) * (u < 0.62 ? 1.8 : 2.6);
    let p = P.run(ph, -1, { energy: u < 0.62 ? 0.65 : 1 });
    const turn = sm(seg(u, 0, 0.1));
    if (turn < 1) p = lerpPose(hayLaugh(t, k, sg, 0.4), p, turn);
    void sx;
    return { x, y, h: KH, pose: p, hat: t < HAT_OFF[k], shoes: 2, sunk: u < 0.62 };
  }
  function climbUp(k, t0, t1, t) {
    const u = seg(t, t0, t1), steps = 7;
    const su = Math.floor(u * steps) / steps + sm((u * steps) % 1) / steps;
    const y = lerp(FY, LOFT_Y, su);
    let p = P.climb((t - t0) / 0.5, -1);
    const turn = sm(seg(t, t0, t0 + 0.15));
    if (turn < 1) p = lerpPose(P.run(0.25, -1, { energy: 0.6 }), p, turn);
    return { x: climbX(k, y), y, h: KH, pose: p, hat: t < HAT_OFF[k], shoes: 2 };
  }
  function loftGo(k, t0, t1, xEnd, t, energy) {
    const u = seg(t, t0, t1);
    const x0 = climbX(k, LOFT_Y) + 8;
    const step = sm(seg(t, t0, t0 + 0.25));
    const x = lerp(x0, xEnd, u < 0.15 ? u * u / 0.3 : u - 0.075) ;
    let p = P.run((t - t0) * (1.6 + energy * 1.2), 1, { energy });
    if (step < 1) p = lerpPose(P.climb(0, -1), p, step);
    return { x: Math.min(x, xEnd), y: LOFT_Y, h: KH, pose: p, hat: t < HAT_OFF[k], shoes: 2 };
  }
  function leapRun(k, t0, dur, x0, xl, t) {
    const u = seg(t, t0, t0 + dur), sg = KD[k].sg;
    const yl = hayY(xl) + 20;
    const x = lerp(x0, xl, u), y = lerp(LOFT_Y, yl, u) - 4 * SKYLEAP * u * (1 - u);
    const st = star(sm(seg(u, 0.12, 0.35)) * (1 - sm(seg(u, 0.72, 0.9)) * 0.6));
    let p;
    if (u < 0.15) p = lerpPose(P.run((t - t0) * 2.8, 1), st, sm(u / 0.15));
    else p = st;
    if (u > 0.15) {  // arms out flat like wings, flapping, the body tipping forward along the arc (the sky shot)
      outerArm(p, -1, 0.06 + 0.1 * Math.sin(u * 17), 7 * Math.sin(u * 19)); outerArm(p, 1, 0.06 + 0.1 * Math.sin(u * 17 + 1), 7 * Math.sin(u * 19 + 1));
    }
    if (u > 0.8) { const q = front(0.2); outerArm(q, -1, 1); outerArm(q, 1, 1); p = lerpPose(p, q, sm(seg(u, 0.8, 1))); }
    const lean = lerp(0.3, 0.9, sm(seg(u, 0.15, 0.95))) * sm(seg(u, 0, 0.15)) * (1 - sm(seg(u, 0.88, 1)));
    void sg;
    return { x, y, h: KH, pose: p, hat: true, shoes: 2, fly: lean };
  }
  function onTop(k, t) {
    const sg = KD[k].sg;
    if (t < OUT3 + 0.9) {
      const u = sm(seg(t, OUT3, OUT3 + 0.9));
      const x = lerp(LAND[3][k], TOP[k], u), sink = 42 * (1 - u);
      const p = lerpPose(hayLaugh(t, k, sg, 0.4), front(0.3), u);
      outerArm(p, -1, lerp(0.2, -0.2, u)); outerArm(p, 1, lerp(0.2, -0.2, u));
      return { x, y: hayY(x) + sink - 1 * u, h: KH, pose: p, sunk: true };
    }
    // bouncing on the springy top, barefoot, arms out for balance; a crouch before the jump down
    const hopT = t - (OUT3 + 0.9) + (sg > 0 ? 0.12 : 0), per = 0.52;
    const fr = (hopT % per) / per, air = Math.sin(Math.PI * fr);
    const pre = sm(seg(t, GLAD - 0.4, GLAD - 0.05));
    const lift = (1 - pre) * 15 * air;
    const p = front(Math.max(0.5 * (1 - air) * (1 - pre), 1.05 * pre));
    outerArm(p, -1, lerp(0.05 + 0.25 * air, -1.2, pre), 6 * Math.sin(t * 4 + sg)); outerArm(p, 1, lerp(0.05 + 0.25 * air, -1.2, pre), 6 * Math.sin(t * 4 + 1 + sg));
    p.legB = [add(p.legB[0], [0, -4 * air]), add(p.legB[1], [0, -5 * air])]; p.legF = [add(p.legF[0], [0, -4 * air]), add(p.legF[1], [0, -5 * air])];
    p.hairSwing = 0.5 * Math.cos(Math.PI * fr);
    return { x: TOP[k], y: hayY(TOP[k]) - 1 - lift, h: KH, pose: p };
  }
  function runOut(k, t) {
    const sg = KD[k].sg, hopEnd = GLAD + 0.5;
    const bank = Math.sin((t - GLAD) * 1.7 + (sg > 0 ? 1.4 : 0)) * sm(seg(t, FREE - 0.3, FREE + 0.4));
    const wings = sm(seg(t, GLAD + 0.05, GLAD + 0.35)) * 0.55 + 0.45 * sm(seg(t, FREE - 0.35, FREE));
    if (t < hopEnd) {  // hop down off the right side of the pile
      const u = seg(t, GLAD, hopEnd);
      const x = lerp(TOP[k], DOORP[k], u), y = lerp(hayY(TOP[k]) - 1, FY, u) - 4 * 50 * u * (1 - u);
      const p = planeRun(0.25, 0, wings);
      p.legB = [[-7, -30], [-8, -12]]; p.legF = [[7, -30], [8, -12]];
      if (u > 0.85) { const q = front(0.8); p.legB = q.legB; p.legF = q.legF; }
      return { x, y, h: KH, pose: p };
    }
    // out of the door and away into the field: depth Z grows, the kids shrink toward the vanishing point
    const Z = 1 + 0.62 * (t - hopEnd);
    const y = HOR + (FY - HOR) / Z;
    const apart = sg * 70 * sm(seg(t, FREE - 0.4, 243.2));  // they swoop apart like two planes
    const weave = sg * 18 * Math.sin((t - hopEnd) * 1.7 + (sg > 0 ? 1.4 : 0)) * (1 - 1 / Z);
    const x = VPX + (DOORP[k] - VPX + apart + weave) / Z;
    const p = planeRun((t - hopEnd) * 2.7 + (sg > 0 ? 0.5 : 0), bank, wings);
    return { x, y, h: KH / Z, pose: p, outside: y < FLOOR - 1 };
  }
  function act(k, t) {
    const M = TIM[k], third = true;
    if (t < FLY1) return edgeWait(k, T0, FLY1, t, false, SKYX[k]);
    if (t < M.land1) return leapFront(k, FLY1, F1, SKYX[k], LOFT_Y, LAND[1][k], SKYLEAP, t, false, true);   // high: up into the sky in the tight shot
    if (t < M.out1) return inHay(k, M.land1, LAND[1][k], t, 'five');
    if (t < M.lad1) return wadeOut(k, M.out1, M.lad1, LAND[1][k], t);
    if (t < M.top1) return climbUp(k, M.lad1, M.top1, t);
    if (t < M.take2) return loftGo(k, M.top1, M.take2, TAKE2[k], t, 1);
    if (t < M.take2 + F2) return leapRun(k, M.take2, F2, TAKE2[k], LAND[2][k], t);
    if (t < M.out2) return inHay(k, M.take2 + F2, LAND[2][k], t);
    if (t < M.lad2) return wadeOut(k, M.out2, M.lad2, LAND[2][k], t);
    if (t < M.top2) return climbUp(k, M.lad2, M.top2, t);
    if (t < M.edge3) return loftGo(k, M.top2, M.edge3, EDGE[k], t, 0.45);
    if (t < LOSE) return edgeWait(k, M.edge3, LOSE, t, true);
    if (t < LOSE + F3) return leapFront(k, LOSE, F3, EDGE[k], LOFT_Y, LAND[3][k], 82, t, third);
    if (t < OUT3) return inHay(k, LOSE + F3, LAND[3][k], t, 'socks');
    if (t < GLAD) return onTop(k, t);
    return runOut(k, t);
  }
  // both kids at t, with their inner hands joined when they hold hands
  function pair(t) {
    const A = act('me', t), B = act('hider', t);
    if (A.held && B.held) {
      const sa = sOf('me', A.h), sb = sOf('hider', B.h);
      const SA = [A.x + (A.pose.chest[0] + 8) * sa, A.y + (A.pose.chest[1] - 2) * sa];
      const SB = [B.x + (B.pose.chest[0] - 8) * sb, B.y + (B.pose.chest[1] - 2) * sb];
      const J = [(SA[0] + SB[0]) / 2, (SA[1] + SB[1]) / 2 + 20];
      const ha = [(J[0] - A.x) / sa, (J[1] - A.y) / sa], hb = [(J[0] - B.x) / sb, (J[1] - B.y) / sb];
      A.pose.armF = [add(L2(add(A.pose.chest, [8, -2]), ha, 0.5), [1, 4]), ha];
      B.pose.armB = [add(L2(add(B.pose.chest, [-8, -2]), hb, 0.5), [-1, 4]), hb];
    }
    for (const [k, Q] of [['me', A], ['hider', B]]) {
      dress(Q.pose, k, Q.hat, Q.shoes == null ? 0 : Q.shoes);
      if (Q.fly) { Q.rot = Q.fly; Q.pivot = [Q.x, Q.y - 50 * sOf(k, Q.h)]; }
    }
    if (A.held && B.held && A.fly && B.fly) {  // hand in hand: turn the pair together about the middle, so the hands stay joined
      const pv = [(A.pivot[0] + B.pivot[0]) / 2, (A.pivot[1] + B.pivot[1]) / 2], r = (A.fly + B.fly) / 2;
      A.pivot = B.pivot = pv; A.rot = B.rot = r;
    }
    return { me: A, hider: B };
  }

  // ---- flying things: hats, shoes, socks, chaff ------------------------------------------------------------
  function worldOf(Q, k, pt) { const s = sOf(k, Q.h); return [Q.x + pt[0] * s, Q.y + pt[1] * s]; }
  // a thrown thing: ballistic until it lands on the hay or the floor, then it lies there
  function toss(p0, v, gr, spin, dt) {
    let x = p0[0], y = p0[1], vy = v[1], tt = 0, rot = 0;
    const step = 1 / 60;
    while (tt + step <= dt) {
      x += v[0] * step; vy += gr * step; y += vy * step; rot += spin * step; tt += step;
      if (vy > 0 && y >= ground(x) - 3) return { x, y: ground(x) - 3, rot, landed: true };
    }
    const r = dt - tt;
    return { x: x + v[0] * r, y: y + vy * r, rot: rot + spin * r, landed: false };
  }
  function flutter(p0, vx, dt) {  // a hat: pops up on the wind, then see-saws down
    let x = p0[0], y = p0[1], tt = 0;
    const step = 1 / 60;
    const pos = (u) => [p0[0] + vx * (1 - Math.exp(-u * 2.2)) / 2.2 + 16 * Math.sin(u * 3.4), p0[1] - 150 * (1 - Math.exp(-u * 4.5)) + 105 * u];
    while (tt + step <= dt) { tt += step; [x, y] = pos(tt); if (tt > 0.4 && y >= ground(x) - 6) return { x, y: ground(x) - 6, rot: 0.35 * Math.sin(tt * 3.4 + 1), landed: true }; }
    [x, y] = pos(dt);
    return { x, y, rot: 0.55 * Math.sin(dt * 3.4 + 1), landed: false };
  }
  const itemCache = new Map();
  function releases(k) {  // where each item leaves the kid (pure: computed from the choreography)
    if (itemCache.has(k)) return itemCache.get(k);
    const sg = KD[k].sg, R2 = rng(k === 'me' ? 11 : 23);
    const out = [];
    const Qh = act(k, HAT_OFF[k]);
    out.push({ kind: 'hat', t: HAT_OFF[k], p: worldOf(Qh, k, add(Qh.pose.head, [0, -6])), vx: sg * (70 + R2() * 40), s: sOf(k, KH) });
    SHOE_OFF[k].forEach((ts, i) => {
      const Q = act(k, ts), L = i === 0 ? Q.pose.legB : Q.pose.legF, side = i === 0 ? -1 : 1;
      out.push({ kind: 'shoe', t: ts, p: worldOf(Q, k, L[1]), v: [side * (150 + R2() * 90), -(300 + R2() * 120)], spin: side * (8 + R2() * 6), s: sOf(k, KH) });
    });
    SOCK[k].forEach((ts, i) => {
      const Q = act(k, ts + 0.1), side = i === 0 ? sg : -sg, A = side < 0 ? Q.pose.armB : Q.pose.armF;
      out.push({ kind: 'sock', t: ts + 0.1, p: worldOf(Q, k, A[1]), v: [side * (90 + R2() * 60), -(560 + R2() * 90)], spin: side * (10 + R2() * 5), s: sOf(k, KH) });
    });
    itemCache.set(k, out);
    return out;
  }
  function drawItems(g, t) {
    g.fillStyle = g.strokeStyle = COL.kid;
    for (const k of ['me', 'hider']) for (const it of releases(k)) {
      if (t < it.t) continue;
      const dt = t - it.t;
      const st = it.kind === 'hat' ? flutter(it.p, it.vx, dt) : toss(it.p, it.v, it.kind === 'sock' ? 1300 : 1500, it.spin, dt);
      g.save(); g.translate(st.x, st.y); g.rotate(st.rot); g.scale(it.s * (it.kind === 'sock' ? 0.9 : 1), it.s * (it.kind === 'sock' ? 0.9 : 1));
      if (it.kind === 'hat') hatShape(g, KD[k].hat, 0, 6, 0);
      else if (it.kind === 'shoe') shoeShape(g, 0, 2, 1);
      else sockShape(g);
      g.restore();
    }
  }
  const LANDINGS = [
    [TIM.me.land1, LAND[1].me, 26], [TIM.hider.land1, LAND[1].hider, 26],
    [TIM.me.take2 + F2, LAND[2].me, 40], [TIM.hider.take2 + F2, LAND[2].hider, 40],
    [LOSE + F3, LAND[3].me, 30], [LOSE + F3, LAND[3].hider, 30],
  ];
  function chaff(g, t) {  // straw bits thrown up by each landing, dark against the bright door
    g.strokeStyle = COL.kid; g.lineCap = 'round';
    LANDINGS.forEach(([tl, xl, n], j) => {
      const dt = t - tl;
      if (dt < 0 || dt > 1.4) return;
      const R3 = rng(400 + j);
      for (let i = 0; i < n; i++) {
        const vx = (R3() - 0.5) * 380, vy = -(200 + R3() * 430), a0 = R3() * TAU, sp = (R3() - 0.5) * 20, l = 4 + R3() * 6;
        const x = xl + (R3() - 0.5) * 30 + vx * dt, y = hayY(xl) + 4 + vy * dt + 0.5 * 1250 * dt * dt;
        if (dt > 0.15 && y > hayY(x) + 2) continue;
        const a = a0 + sp * dt;
        g.lineWidth = 1.5 + (i % 3) * 0.4;
        g.beginPath(); g.moveTo(x - Math.cos(a) * l / 2, y - Math.sin(a) * l / 2); g.lineTo(x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2); g.stroke();
      }
    });
  }

  // ---- shapes: the loft, the ladder, the kids, the things that fly ---------------------------------------------
  function loft(g, t) {
    g.fillStyle = g.strokeStyle = COL.wood;
    g.fillRect(-900, LOFT_Y, LOFT_EDGE + 900, 22);                         // the loft floor's front beam
    for (let x = -880; x < LOFT_EDGE; x += 46) g.fillRect(x, LOFT_Y + 22, 9, 7);  // joist ends
    for (const x of [-170, 214]) g.fillRect(x - 7, LOFT_Y + 20, 14, FY - LOFT_Y - 18);  // posts
    g.lineWidth = 9; g.beginPath(); g.moveTo(214 - 4, LOFT_Y + 70); g.lineTo(214 + 46, LOFT_Y + 22); g.stroke();
    // loose hay up on the loft, toward the back left, its straw ends back-lit
    g.fillStyle = COL.hayDark; g.strokeStyle = COL.hayDark;
    g.beginPath(); g.moveTo(-900, LOFT_Y + 2);
    const hl = (x) => LOFT_Y - 50 * Math.pow(Math.sin(Math.min(1, (x + 900) / 860) * Math.PI * 0.5 + Math.PI * 0.5 * Math.max(0, (x + 260) / 220)), 0.6);
    for (let x = -900; x <= -40; x += 10) g.lineTo(x, hl(x) + 4 * Math.sin(x * 0.2));
    g.lineTo(-24, LOFT_Y + 2); g.closePath(); g.fill();
    g.lineWidth = 1.3;
    for (let x = -880; x < -36; x += 5) {
      const y = hl(x);
      g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + Math.sin(x * 1.7) * 5, y - 5 - Math.abs(Math.sin(x * 0.9)) * 6); g.stroke();
    }
    // a few straws hanging over the loft edge, stirring
    for (let x = -60; x < LOFT_EDGE - 8; x += 13) {
      const l = 6 + 7 * Math.abs(Math.sin(x * 0.37)), sw = 1.5 * Math.sin(t * 1.3 + x);
      g.beginPath(); g.moveTo(x, LOFT_Y + 20); g.lineTo(x + sw, LOFT_Y + 20 + l); g.stroke();
    }
  }
  function pulley(g, t) {  // the hay rope and pulley hanging in the loft door, swaying
    const a = 0.05 * Math.sin(t * 0.9) + 0.02 * Math.sin(t * 2.1), x0 = 262, y0 = LDOOR[1] - 4, L = 104;
    const x1 = x0 + Math.sin(a) * L, y1 = y0 + Math.cos(a) * L;
    g.strokeStyle = g.fillStyle = COL.wood; g.lineCap = 'round';
    g.fillRect(x0 - 16, y0 - 6, 32, 9);
    g.lineWidth = 2.2; g.beginPath(); g.moveTo(x0 - 4, y0); g.lineTo(x1 - 4, y1); g.moveTo(x0 + 4, y0); g.lineTo(x1 + 4, y1); g.stroke();
    g.beginPath(); g.arc(x1, y1 + 6, 8, 0, TAU); g.fill();
    g.lineWidth = 3; g.beginPath(); g.moveTo(x1, y1 + 13); g.lineTo(x1, y1 + 22); g.arc(x1 + 5, y1 + 22, 5, Math.PI, 0.3, true); g.stroke();
  }
  function ladder(g) {
    g.strokeStyle = COL.wood; g.lineCap = 'round';
    const [bx, by] = LAD.b, [tx, ty] = LAD.t;
    g.lineWidth = 5;
    for (const off of [-11, 11]) { g.beginPath(); g.moveTo(bx + off, by + 4); g.lineTo(tx + off, ty); g.stroke(); }
    g.lineWidth = 3.4;
    for (let k = 1; k < 12; k++) { const u = k / 12, x = lerp(bx, tx, u), y = lerp(by, ty, u); g.beginPath(); g.moveTo(x - 11, y); g.lineTo(x + 11, y); g.stroke(); }
  }
  function hayClip(g) {  // everything above the hay surface (the hay hides what sinks into it)
    g.beginPath(); g.moveTo(-1200, -1200); g.lineTo(2400, -1200); g.lineTo(2400, 2000);
    for (let x = 2400; x >= -1200; x -= 4) { const y = hayY(x); g.lineTo(x, y < 9000 ? y + 1 : 2000); }
    g.closePath(); g.clip();
  }
  function drawKidQ(g, k, Q) {
    g.save();
    if (Q.outside) { g.beginPath(); g.rect(DOOR[0], DOOR[1], DOOR[2] - DOOR[0], DOOR[3] - DOOR[1] + 12); g.clip(); }
    hayClip(g);
    if (Q.rot) { g.translate(Q.pivot[0], Q.pivot[1]); g.rotate(Q.rot); g.translate(-Q.pivot[0], -Q.pivot[1]); }
    drawKid(g, KD[k].kid, Q.pose, Q.x, Q.y, Q.h, COL.kid);
    g.restore();
  }
  function shapes(g, t) {
    const Q = pair(t);
    loft(g, t); ladder(g);   // no hay rope in the door: the opening shot is nothing but sky (Robin, Nov 11)
    // the kid nearer the ladder is drawn last while climbing; otherwise me first
    drawKidQ(g, 'me', Q.me); drawKidQ(g, 'hider', Q.hider);
    drawItems(g, t);
    chaff(g, t);
  }
  function shadows(g, t) {  // soft shadows thrown toward the camera by the door light
    const Q = pair(t);
    g.fillStyle = '#000';
    for (const k of ['me', 'hider']) {
      const q = Q[k];
      if (q.outside || q.y < FY - 2 || q.sunk) continue;
      const s = sOf(k, q.h);
      g.beginPath(); g.ellipse(q.x - 18 * s, q.y + 8, 26 * s, 6, 0, 0, TAU); g.fill();
    }
  }

  // ---- over: sunbeams with dust, puffs of hay dust at each landing, lit straw where the kids sink in --------------
  function over(g, t) {
    g.save(); g.globalCompositeOperation = 'screen';
    for (const [o, d, len, w, a] of BEAMS) {
      const n = Math.hypot(d[0], d[1]), dx = d[0] / n, dy = d[1] / n, px = -dy, py = dx;
      const e = [o[0] + dx * len, o[1] + dy * len];
      const br = a * (0.85 + 0.15 * Math.sin(t * 0.7 + o[0]));
      const gr = g.createLinearGradient(o[0], o[1], e[0], e[1]);
      gr.addColorStop(0, `rgba(255,232,180,${br})`); gr.addColorStop(0.6, `rgba(255,220,160,${br * 0.6})`); gr.addColorStop(1, 'rgba(255,220,160,0)');
      g.fillStyle = gr; g.beginPath();
      g.moveTo(o[0] - px * 3, o[1] - py * 3); g.lineTo(o[0] + px * 3, o[1] + py * 3);
      g.lineTo(e[0] + px * w / 2, e[1] + py * w / 2); g.lineTo(e[0] - px * w / 2, e[1] - py * w / 2); g.closePath(); g.fill();
      // dust drifting in the beam
      motes.forEach(([u0, v0, sp, ph, r, bi], i) => {
        if (bi !== BEAMS.findIndex((b) => b[0] === o)) return;
        const u = (u0 + sp * (t - T0) + 0.02 * Math.sin(t * 0.5 + ph)) % 1;
        const v = v0 + 0.15 * Math.sin(t * 0.8 + ph * 2);
        const wid = lerp(6, w, u);
        const x = o[0] + dx * len * u + px * v * wid, y = o[1] + dy * len * u + py * v * wid;
        const tw = 0.5 + 0.5 * Math.sin(t * 2.3 + i);
        g.fillStyle = `rgba(255,244,214,${(0.35 + 0.5 * tw) * (1 - u * 0.7)})`;
        g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
      });
    }
    // hay dust puffs at each landing
    for (const [tl, xl, n] of LANDINGS) {
      const dt = t - tl; if (dt < 0 || dt > 2.2) continue;
      const r = 30 + n * 1.6 + 90 * Math.sqrt(dt), a = 0.42 * Math.exp(-dt * 1.6);
      const y = hayY(xl) - 20 - 30 * dt;
      const pg = g.createRadialGradient(xl, y, 2, xl, y, r);
      pg.addColorStop(0, `rgba(255,226,160,${a})`); pg.addColorStop(1, 'rgba(255,226,160,0)');
      g.fillStyle = pg; g.fillRect(xl - r, y - r, 2 * r, 2 * r);
    }
    g.restore();
    // lit straw ends over the line where a kid sinks into the hay
    const Q = pair(t);
    g.lineWidth = 1;
    for (const k of ['me', 'hider']) {
      const q = Q[k]; if (!q.sunk) continue;
      const s = sOf(k, q.h);
      for (let i = 0; i < 18; i++) {
        const x = q.x - 22 * s + i * 2.6 * s, y = hayY(x);
        if (y > 9000) continue;
        g.strokeStyle = i % 2 ? 'rgba(255,230,160,.85)' : 'rgba(205,160,86,.85)';
        const l = 4 + 5 * Math.abs(Math.sin(i * 1.9 + x));
        g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + Math.sin(i * 2.7) * 3, y + 4 - l); g.stroke();
      }
    }
  }

  // ---- camera: the mother on the barn floor, zoom rocker in and out, following the kids ---------------------------------
  // Robin, Nov 11: it opens so tight you can't tell it's a barn. Full zoom on the loft's hay door: only sky (and a far
  // tree) behind the two of them. On "Flying" they leap up and out of frame; on "you and me flying" they run in from
  // the left and do it again; just before "up in the hayloft" the zoom pulls all the way back and the barn appears.
  // The frame sits in the top of the hay door (x 118..420, y 30..384), above the kids' heads as they wait on the loft
  // edge (hat tops at y ~241), so it holds nothing but sky until a leap carries them through it.
  const CAM = [
    [T0, 276, 138, 3.85], [208.0, 278, 136, 3.85], [FLY1 + 1.0, 280, 138, 3.85], [FLY1 + 2.4, 276, 138, 3.85],
    [214.6, 274, 136, 3.86], [FLY2, 278, 138, 3.85], [FLY2 + 1.2, 280, 138, 3.85], [221.45, 278, 140, 3.84],
    [222.5, 330, 432, 1.04],
    [LOFTUP, 214, 488, 1.24], [HAYLOFT, 176, 342, 1.26], [225.6, 214, 326, 1.2], [227.5, 318, 330, 1.38], [LOSE, 326, 334, 1.38],
    [LOSE + 0.6, 400, 368, 1.0], [LOSE + 1.7, 466, 436, 1.04], [CLOTH - 0.7, 490, 452, 1.3], [CLOTH + 1.5, 494, 444, 1.3],
    [236.2, 478, 446, 1.16], [GLAD, 520, 468, 1.12], [FREE, 612, 500, 1.6], [240.5, 668, 496, 2.15],
    [241.5, 600, 486, 2.0], [243.0, 584, 482, 1.86], [T1, 580, 480, 1.9],
  ];
  const FOCUS = [
    [T0, 1.6], [206.8, 0], [209.6, 0], [209.9, 1.2], [210.2, 0],
    [FLY1 + 1.3, 0], [FLY1 + 1.6, 0.9], [212.1, 0], [216.4, 0], [216.8, 1.3], [217.3, 0],
    [221.4, 0], [221.9, 2.2], [222.5, 1.0], [222.9, 0], [224.7, 0], [225.1, 1.4], [225.6, 0],
    [CLOTH - 0.9, 0], [CLOTH - 0.5, 1.3], [CLOTH - 0.1, 0], [FREE, 0], [240.6, 1.8], [241.2, 0.3], [241.9, 1.2], [242.6, 0.2], [243.4, 0.7], [244.0, 0],
  ];
  const cam = CAMKIT.rig(CAM, FOCUS, 7, 1);

  SCENE.add({
    id: 'hayloft', t0: T0, t1: T1,
    stamp: () => ({ date: 'SEP.12 1992', time: '4:40PM' }),
    camera: cam,
    bg, shadows, shapes, over,
    light: { rim: '#ffd890', glow: 'rgba(255,198,120,.85)', glowBlur: 7, rimW: 1.25, sunDir: [0.22, -0.97] },
    source: (t) => ({ x: SUN[0], y: SUN[1], r: 250, a: lerp(0.6, 0.9, sm(seg(t, GLAD, 241.5))) }),
    grade: { bright: 1.0, contrast: 1.06, sat: 1.05 },
  });
})();
