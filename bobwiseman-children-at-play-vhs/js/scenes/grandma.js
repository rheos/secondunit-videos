// scenes/grandma.js · verse 2a, grandma's bedroom on a bright overcast afternoon. The mother films (handheld): she
// comes round the doorframe, pushes in slowly on grandma propped up in the iron bed with the hider holding her hand,
// drifts across the dresser and the old photo, and comes back as grandma turns to the window, where a hen hops onto
// the outside sill. Grandma reaches for the glass; the focus racks from her hand to the hen. Contract: js/scenes.js.
(function () {
  const T = window.TIMING, S = T.scenes;
  const { KIDS, drawKid, poses: P, lerpPose, drawChicken } = window.CAST;
  const TAU = Math.PI * 2;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  const seg = (t, a, b) => sm((t - a) / (b - a));

  // ---- song hits (seconds) -------------------------------------------------------------------------------
  const TAKE = S.grandma;          // 42.00 the take starts in the hallway
  const IN_ROOM = 44.6;            // the doorframe has slid out of frame
  const DYING = 45.24;             // first word, held: the slow push-in starts
  const YOUR_GRANDMA = 50.26;
  const DYING2 = 52.06;
  const UP = 58.99;                // "up in her bedroom": the drift across the room
  const BEDROOM = 60.62;           // on the dresser and the photo
  const TALKING = 66.76;           // she turns her head to the window
  const CHICKENS = 69.09;          // the hen lands on the outside sill
  const SHE = 70.85;               // she starts to lift her hand toward the glass
  const THINKS = 75.24;            // the hen cocks its head at her
  const SEE = 77.43;               // focus racks from her hand to the hen
  const END = S.father;            // 84.11

  // ---- the room (world units = the 960 x 720 frame at zoom 1) -----------------------------------------------
  const WIN = { x0: 290, x1: 650, y0: 100, y1: 400 };       // the glass; the light source
  const WIN_C = [(WIN.x0 + WIN.x1) / 2, 250];
  const WALL_BASE = 562;                                      // where the back wall meets the floor
  const BED = { head: 322, foot: 790, top: 478, rail: 528, floor: 598 };
  const G_HIP = [388, 477], G_H = 210;                        // grandma's hip on the mattress, her depth scale
  const K_HIP = [526, 492], K_H = 214;                        // the hider on the near edge of the bed
  const HEN_SILL = [590, 398];                                // where the hen stands, outside the glass
  const COL = { kid: '#261a1e', iron: '#211b1d', wood: '#2c1f18', quilt: ['#2e211d', '#2a1f20', '#33241c', '#2c2022'], pillow: '#3a3034', glass: '#2a2324' };

  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  }
  // faded floral wallpaper, one tile, made once (pure: a fixed seed)
  let paper = null;
  function wallTile() {
    if (paper) return paper;
    const c = document.createElement('canvas'); c.width = 72; c.height = 88;
    const q = c.getContext('2d'), R = rng(1013);
    q.fillStyle = '#d6c1a0'; q.fillRect(0, 0, 72, 88);
    q.fillStyle = 'rgba(196,172,138,.55)'; q.fillRect(0, 0, 3, 88); q.fillRect(36, 0, 1.5, 88);
    const sprig = (x, y, s) => {
      q.strokeStyle = 'rgba(112,124,84,.5)'; q.lineWidth = 1.1;
      q.beginPath(); q.moveTo(x, y + 9 * s); q.quadraticCurveTo(x + 2 * s, y + 3 * s, x, y); q.stroke();
      q.fillStyle = 'rgba(118,132,90,.5)';
      q.beginPath(); q.ellipse(x - 4 * s, y + 6 * s, 3.4 * s, 1.5 * s, -0.6, 0, TAU); q.fill();
      q.beginPath(); q.ellipse(x + 4 * s, y + 4 * s, 3.4 * s, 1.5 * s, 0.6, 0, TAU); q.fill();
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; q.fillStyle = 'rgba(176,110,104,.5)'; q.beginPath(); q.arc(x + Math.cos(a) * 2.6 * s, y + Math.sin(a) * 2.6 * s, 2.1 * s, 0, TAU); q.fill(); }
      q.fillStyle = 'rgba(206,168,110,.7)'; q.beginPath(); q.arc(x, y, 1.3 * s, 0, TAU); q.fill();
    };
    sprig(18, 18, 1); sprig(54, 62, 1); sprig(54 - 72, 62, 1); sprig(18, 18 + 88, 1);
    for (let i = 0; i < 26; i++) { q.fillStyle = `rgba(150,120,90,${0.04 + R() * 0.05})`; q.fillRect(R() * 72, R() * 88, 1 + R() * 2, 1 + R() * 3); }
    paper = c; return c;
  }

  // ---- motion ----------------------------------------------------------------------------------------------
  // the hen: hops up from the yard onto the outside sill on "chickens", cocks her head on "thinks"
  function henState(t) {
    const up0 = CHICKENS - 0.42;
    if (t < up0) return null;
    if (t < CHICKENS) {
      const u = (t - up0) / (CHICKENS - up0);
      return { x: lerp(626, HEN_SILL[0], u), y: lerp(470, HEN_SILL[1], u) - Math.sin(u * Math.PI) * 34, flap: 1, peck: 0.1, cock: 0, tilt: lerp(-0.35, 0, u) };
    }
    const land = 1 - seg(t, CHICKENS, CHICKENS + 0.22);
    const cock = seg(t, THINKS - 0.12, THINKS + 0.12) * (1 - 0.4 * seg(t, 79.4, 80.2)) + 0.5 * seg(t, 80.6, 80.9) * (1 - seg(t, 82.2, 82.6));
    const look = 0.06 * Math.sin(t * 2.3) * seg(t, CHICKENS + 0.3, CHICKENS + 0.8) * (1 - seg(t, THINKS - 0.5, THINKS - 0.2));
    const peck = 0.06 + 0.3 * Math.max(0, Math.sin((t - 81.2) * 9)) * (t > 81.2 && t < 81.55 ? 1 : 0);
    return { x: HEN_SILL[0], y: HEN_SILL[1] + 3 * land * Math.sin(land * 5), flap: land * 0.6, peck, cock: cock + look, tilt: 0 };
  }
  // a hen with a head that can cock (CAST.drawChicken has none): same build, the head turned about the neck
  function hen(g, x, y, h, st, d, color) {
    if (!st.cock && !st.flap) { g.save(); g.translate(x, y); g.rotate(st.tilt || 0); drawChicken(g, 0, 0, h, st.peck, d, color); g.restore(); return; }
    const s = h / 40;
    g.save(); g.translate(x, y); g.rotate(st.tilt || 0); g.scale(s * d, s); g.fillStyle = color; g.strokeStyle = color;
    g.lineWidth = 1.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-2, -10); g.lineTo(-3, 0); g.moveTo(3, -10); g.lineTo(4, 0); g.stroke();
    const el = (cx, cy, rx, ry, r = 0) => { g.beginPath(); g.ellipse(cx, cy, rx, ry, r, 0, TAU); g.fill(); };
    el(0, -20, 15, 11, -0.15);
    g.beginPath(); g.moveTo(-10, -22); g.quadraticCurveTo(-22, -40, -15, -38); g.quadraticCurveTo(-12, -30, -6, -28); g.closePath(); g.fill();
    if (st.flap > 0.05) {  // a wing beating up over the back
      const a = -0.4 - st.flap * 1.2 * (0.6 + 0.4 * Math.sin(st.flap * 40));
      g.save(); g.translate(-2, -26); g.rotate(a); el(-9, 0, 13, 5); g.restore();
    }
    const hx = lerp(13, 18, st.peck), hy = lerp(-32, -6, st.peck);
    g.lineWidth = 7; g.beginPath(); g.moveTo(9, -24); g.quadraticCurveTo(14, lerp(-30, -14, st.peck), hx, hy); g.stroke();
    g.save(); g.translate(hx, hy); g.rotate(-0.9 * st.cock);  // head cocked: beak up and round, comb tipped back
    el(0, 0, 5, 5.2);
    g.beginPath(); g.moveTo(4, -1); g.lineTo(9, 1); g.lineTo(4, 2.5); g.fill();
    for (let i = 0; i < 3; i++) el(-2 + i * 2.6, -5 - (i === 1 ? 1.5 : 0), 1.8, 2.4);
    el(1.5, 5.4, 1.6, 2.4);  // wattle
    g.restore();
    g.restore();
  }
  // grandma: propped on the pillows, breathing slowly, holding the hider's hand; turns to the window, reaches.
  function grandmaPose(t) {
    const breath = Math.sin(TAU * (t - TAKE) / 4.8) * (0.7 + 0.3 * Math.sin(t * 0.41));
    const look = seg(t, TALKING, TALKING + 0.9);                       // head comes up toward the window
    const nod = lerp(-0.75 + 0.12 * Math.sin(t * 0.37), 0.75, look) + 0.1 * seg(t, SEE - 0.3, SEE + 0.4);
    const reach = seg(t, SHE, 74.2) * (1 - 0.22 * seg(t, 80.6, 83.6)) + 0.04 * Math.sin(t * 3.1) * seg(t, 74, 75);
    const p = P.bedSit(0, 1, nod);
    const up = [0, -1.1 * breath];
    p.chest = [p.chest[0] - 0.4 * breath, p.chest[1] + up[1]]; p.head = [p.head[0] - 0.3 * breath, p.head[1] + up[1]];
    // the hand that holds the hider's: out across the quilt, a small squeeze now and then
    const sq = 0.8 * Math.max(0, Math.sin(TAU * (t - 47) / 5.3)) ** 6;
    const hold = [[19, -17], [33, -12 + sq]];
    const toGlass = [[22, -28], [38, -37]];                            // up and out toward the hen
    const k = sm(reach);
    p.armF = [[lerp(hold[0][0], toGlass[0][0], k), lerp(hold[0][1], toGlass[0][1], k)], [lerp(hold[1][0], toGlass[1][0], k), lerp(hold[1][1], toGlass[1][1], k)]];
    p.armB = [[-6, -18 - breath * 0.4], [4, -6]];
    return p;
  }
  // the hider: sits on the bed's near edge facing grandma, holding her hand, legs swinging slowly; when the hen lands
  // she lets go and turns to look at it.
  function hiderPose(t) {
    const kick = 0.5 + 0.3 * Math.sin(t * 1.7) + 0.15 * Math.sin(t * 0.63);
    const turn = seg(t, CHICKENS + 0.25, CHICKENS + 0.85);
    const a = P.ledgeSit(kick, -1), b = P.ledgeSit(1 - kick, 1);
    // holding hand: near arm out to the left, to grandma's hand
    const sq = 0.8 * Math.max(0, Math.sin(TAU * (t - 47) / 5.3)) ** 6;
    a.armF = [[-14, -27], [-27.5, -31.5 + sq]];
    a.hairSwing = 0.08 * Math.sin(t * 1.3);
    b.armF = [[7, -18], [12, -4]]; b.armB = [[-2, -17], [5, -3]];
    b.head = [b.head[0] + 1.5, b.head[1] - 1];  // chin up at the hen
    b.hairSwing = -0.15;
    const p = lerpPose(a, b, turn);
    return p;
  }
  // focus, separately for the near plane (grandma, the bed, the hider) and the window plane (the hen, the bars)
  function blurNear(t) { return 2.6 * seg(t, SEE - 0.32, SEE + 0.1) * (1 - 0.35 * seg(t, 81, 83)); }
  function blurHen(t) { return 2.4 * seg(t, SHE, SHE + 0.8) * (1 - seg(t, SEE - 0.32, SEE + 0.02)); }

  // draw a group into a scratch layer and lay it back blurred: one blur for a whole figure
  const pool = [];
  function blurred(g, px, fn, slot = 0) {
    if (px < 0.2) { fn(g); return; }
    const cv = g.canvas;
    let c = pool[slot];
    if (!c || c.width !== cv.width || c.height !== cv.height) { c = document.createElement('canvas'); c.width = cv.width; c.height = cv.height; pool[slot] = c; }
    const q = c.getContext('2d');
    q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, c.width, c.height);
    q.setTransform(g.getTransform());
    fn(q);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = `blur(${px.toFixed(2)}px)`; g.drawImage(c, 0, 0); g.restore();
  }

  // ---- camera -------------------------------------------------------------------------------------------
  const KEYS = [
    [TAKE, 330, 392, 1.0], [43.0, 362, 390, 1.0], [IN_ROOM, 452, 384, 1.04], [DYING, 456, 384, 1.05],
    [YOUR_GRANDMA, 448, 394, 1.3], [DYING2, 446, 398, 1.38], [57.6, 444, 404, 1.62], [UP, 446, 404, 1.62],
    [BEDROOM, 900, 392, 1.36], [62.6, 976, 360, 1.4], [63.3, 976, 362, 1.4], [65.4, 488, 372, 1.3],
    [TALKING, 486, 368, 1.26], [CHICKENS, 500, 362, 1.26], [72.4, 504, 362, 1.42], [SEE, 520, 360, 1.56],
    [79.5, 518, 358, 1.56], [END, 488, 352, 1.3],
  ];
  const FOCUS = [
    [TAKE, 2.2], [42.6, 1.4], [43.3, 0.3], [44.0, 1.1], [44.8, 0], [DYING2, 0], [53.2, 0.9], [53.9, 0], [UP, 0],
    [BEDROOM, 1.6], [61.4, 0.2], [61.9, 0.9], [62.5, 0], [64.6, 0], [65.4, 1.4], [66.0, 0], [END, 0],
  ];
  const camera = CAMKIT.rig(KEYS, FOCUS, 3, 1);
  // the doorframe, close to the lens: it slides out of frame to the left as the mother comes into the room
  function jamb(g, t) {
    if (t > IN_ROOM + 0.2) return;
    const cam = camera(t);
    const sx = lerp(330, -140, CAMKIT.smooth(clamp((t - TAKE) / (IN_ROOM - TAKE), 0, 1)));  // its edge, frame px
    const wx = cam.cx + (sx - 480) / cam.z;
    g.fillStyle = '#231915';
    g.fillRect(wx - 900, -400, 900, 1600);
    g.fillStyle = '#2e2119'; g.fillRect(wx - 30, -400, 30, 1600);  // the trim, a touch lighter
    g.fillStyle = '#1d1512'; g.fillRect(wx - 12, -400, 4, 1600);
  }

  // ---- outputs ----------------------------------------------------------------------------------------------
  function yard(g, t) {
    // the yard through the glass: overexposed, pale, the far edge lost in white
    const sky = g.createLinearGradient(0, WIN.y0, 0, 300);
    sky.addColorStop(0, '#fbf8f0'); sky.addColorStop(1, '#f4efe2');
    g.fillStyle = sky; g.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, 300 - WIN.y0);
    g.fillStyle = '#ddddcf';  // the far tree line, washed out
    for (let x = WIN.x0 - 20; x < WIN.x1 + 20; x += 26) { g.beginPath(); g.arc(x, 290 - 8 * Math.sin(x * 0.07), 18 + 6 * Math.sin(x * 0.13), 0, TAU); g.fill(); }
    const gr = g.createLinearGradient(0, 290, 0, WIN.y1);
    gr.addColorStop(0, '#ebe6d2'); gr.addColorStop(1, '#ddd2b4');
    g.fillStyle = gr; g.fillRect(WIN.x0, 292, WIN.x1 - WIN.x0, WIN.y1 - 292);
    // the coop and a fence, pale
    g.fillStyle = '#cfc6b0'; g.fillRect(320, 262, 70, 40); g.beginPath(); g.moveTo(314, 264); g.lineTo(355, 242); g.lineTo(396, 264); g.fill();
    g.strokeStyle = 'rgba(190,180,160,.8)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(WIN.x0, 312); g.lineTo(WIN.x1, 316); g.stroke();
    for (let x = WIN.x0 + 20; x < WIN.x1; x += 46) { g.beginPath(); g.moveTo(x, 304); g.lineTo(x, 322); g.stroke(); }
    // chickens pecking in the yard, small and washed
    const hens = [[352, 342, 15, 0.2, 1], [430, 356, 18, 1.4, -1], [520, 338, 13, 2.6, 1], [610, 362, 19, 3.9, -1], [472, 378, 21, 5.1, 1]];
    for (const [x, y, h, ph, d] of hens) {
      const pk = Math.max(0, Math.sin(t * 2.2 + ph)) ** 3;
      drawChicken(g, x + 4 * Math.sin(t * 0.3 + ph), y, h, pk, d, 'rgba(150,138,118,.75)');
    }
    // the outside sill, a bright painted ledge
    g.fillStyle = '#f2ecdc'; g.fillRect(WIN.x0, WIN.y1 - 6, WIN.x1 - WIN.x0, 6);
  }
  function bg(g, t) {
    // wallpaper, then the light falling off away from the window
    g.fillStyle = g.createPattern(wallTile(), 'repeat');
    g.fillRect(-900, -600, 2900, WALL_BASE + 600);
    g.save(); g.globalCompositeOperation = 'multiply';
    const fo = g.createRadialGradient(WIN_C[0], WIN_C[1] + 40, 120, WIN_C[0], WIN_C[1] + 40, 980);
    fo.addColorStop(0, '#ece2d8'); fo.addColorStop(0.14, '#b0a298'); fo.addColorStop(0.42, '#73665f'); fo.addColorStop(1, '#3e3432');
    g.fillStyle = fo; g.fillRect(-900, -600, 2900, 1600); g.restore();
    // the framed photo over the dresser: grandma and grandpa, long ago (sepia, two figures)
    g.fillStyle = '#3c2a1e'; g.fillRect(914, 228, 104, 128);
    g.fillStyle = '#9c8466'; g.fillRect(924, 238, 84, 108);
    const ph = g.createRadialGradient(966, 280, 4, 966, 292, 70); ph.addColorStop(0, 'rgba(200,178,140,.9)'); ph.addColorStop(1, 'rgba(120,96,70,.9)');
    g.fillStyle = ph; g.fillRect(924, 238, 84, 108);
    g.fillStyle = 'rgba(70,52,40,.75)';
    for (const [x, hh] of [[950, 58], [982, 48]]) { g.beginPath(); g.arc(x, 346 - hh - 8, 7, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x - 10, 346); g.quadraticCurveTo(x - 11, 346 - hh, x, 346 - hh); g.quadraticCurveTo(x + 11, 346 - hh, x + 10, 346); g.fill(); }
    g.fillStyle = 'rgba(255,240,210,.12)'; g.fillRect(924, 238, 30, 108);  // glare on the glass
    g.strokeStyle = '#2a1d15'; g.lineWidth = 1; g.beginPath(); g.moveTo(966, 228); g.lineTo(966, 206); g.stroke();
    // baseboard and the floorboards, running toward the camera
    g.fillStyle = '#5c4232'; g.fillRect(-900, WALL_BASE - 16, 2900, 16);
    const fl = g.createLinearGradient(0, WALL_BASE, 0, 980);
    fl.addColorStop(0, '#8a6a4a'); fl.addColorStop(0.4, '#6a4e36'); fl.addColorStop(1, '#3c2a1e');
    g.fillStyle = fl; g.fillRect(-900, WALL_BASE, 2900, 900);
    g.strokeStyle = 'rgba(40,26,18,.45)'; g.lineWidth = 1.2;
    const VP = [470, 230];
    for (let x = -900; x < 2000; x += 46) { const k = (980 - VP[1]) / (WALL_BASE - VP[1]); g.beginPath(); g.moveTo(x, WALL_BASE); g.lineTo(VP[0] + (x - VP[0]) * k, 980); g.stroke(); }
    // window light pooled on the floor in front of the bed
    g.save(); g.globalCompositeOperation = 'screen';
    const pool2 = g.createRadialGradient(560, 640, 10, 560, 640, 360);
    pool2.addColorStop(0, 'rgba(255,240,215,.22)'); pool2.addColorStop(1, 'rgba(255,240,215,0)');
    g.fillStyle = pool2; g.fillRect(100, 560, 900, 420); g.restore();
    // the rag rug: braided rings of faded colour
    const rings = ['#7d6a5c', '#8f6e6a', '#6d7484', '#a08b6c', '#7a6052', '#8c7a6a', '#6a6a78', '#9a7e68'];
    for (let i = 0; i < rings.length; i++) {
      const k = 1 - i / rings.length;
      g.fillStyle = rings[i]; g.beginPath(); g.ellipse(660, 700, 230 * k + 8, 58 * k + 3, 0, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(40,30,24,.25)'; g.lineWidth = 1.2; g.setLineDash([3, 3]);
      g.beginPath(); g.ellipse(660, 700, 230 * k + 6, 58 * k + 2, 0, 0, TAU); g.stroke(); g.setLineDash([]);
    }
    // the window: the frame's deep reveal, then the bright yard
    g.fillStyle = '#e8dccb'; g.fillRect(WIN.x0 - 22, WIN.y0 - 22, WIN.x1 - WIN.x0 + 44, WIN.y1 - WIN.y0 + 34);
    yard(g, t);
    // the light swells in the break (the sun finds a thin place in the cloud)
    const sw = seg(t, 79.6, 81.8) * (1 - 0.5 * seg(t, 82.4, END));
    if (sw > 0) { g.fillStyle = `rgba(255,252,240,${0.5 * sw})`; g.fillRect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0); }
    // a halo of light round the window onto the wallpaper
    g.save(); g.globalCompositeOperation = 'screen';
    const halo = g.createRadialGradient(WIN_C[0], WIN_C[1], 150, WIN_C[0], WIN_C[1], 420);
    halo.addColorStop(0, `rgba(255,246,228,${0.3 + 0.25 * sw})`); halo.addColorStop(1, 'rgba(255,246,228,0)');
    g.fillStyle = halo; g.fillRect(WIN_C[0] - 450, WIN_C[1] - 450, 900, 900); g.restore();
  }
  function shadows(g, t) {
    // the bed and the dresser sit on soft shadows on the floor (the light is diffuse)
    g.fillStyle = '#000';
    g.beginPath(); g.ellipse((BED.head + BED.foot) / 2, BED.floor + 4, (BED.foot - BED.head) / 2 + 40, 16, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(970, 584, 130, 10, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(245, 590, 60, 8, 0, 0, TAU); g.fill();
    void t;
  }
  function windowBars(g) {
    g.fillStyle = '#2b2321';
    const { x0, x1, y0, y1 } = WIN;
    g.fillRect(x0 - 14, y0 - 14, x1 - x0 + 28, 14); g.fillRect(x0 - 14, y0 - 14, 14, y1 - y0 + 26);
    g.fillRect(x1, y0 - 14, 14, y1 - y0 + 26);
    for (const fx of [1 / 3, 2 / 3]) g.fillRect(lerp(x0, x1, fx) - 3.5, y0, 7, y1 - y0);
    g.fillRect(x0, (y0 + y1) / 2 - 6, x1 - x0, 12);            // the meeting rail of the sash
    g.fillRect(x0 - 4, (y0 + y1) / 2 + 40, x1 - x0 + 8, 0);
    g.fillRect(x0, y0 + (y1 - y0) * 0.25 - 2.5, x1 - x0, 5); g.fillRect(x0, y0 + (y1 - y0) * 0.75 - 2.5, x1 - x0, 5);
    g.fillRect(x0 - 26, y1, x1 - x0 + 52, 12);                  // the inside sill (stool)
    g.fillRect(x0 - 20, y1 + 12, x1 - x0 + 40, 6);
  }
  function bedBack(g) {  // iron headboard, pillows
    g.fillStyle = g.strokeStyle = COL.iron; g.lineCap = 'round';
    const hx = BED.head;
    g.lineWidth = 9; g.beginPath(); g.moveTo(hx, BED.floor); g.lineTo(hx, 318); g.stroke();
    g.beginPath(); g.arc(hx, 312, 8, 0, TAU); g.fill();
    g.lineWidth = 5; g.beginPath(); g.moveTo(hx - 6, 352); g.quadraticCurveTo(hx - 40, 340, hx - 52, 372); g.stroke();
    g.lineWidth = 9; g.beginPath(); g.moveTo(hx - 54, BED.floor - 8); g.lineTo(hx - 54, 360); g.stroke();
    g.beginPath(); g.arc(hx - 54, 354, 7, 0, TAU); g.fill();
    g.lineWidth = 3;
    for (let i = 1; i < 5; i++) { const x = hx - 54 + i * 10.8; g.beginPath(); g.moveTo(x, 372 - i * 3); g.lineTo(x, BED.top); g.stroke(); }
    g.lineWidth = 4; g.beginPath(); g.moveTo(hx - 54, 392); g.lineTo(hx, 392); g.moveTo(hx - 54, 440); g.lineTo(hx, 440); g.stroke();
    // pillows, plumped up behind her
    g.fillStyle = COL.pillow;
    g.beginPath(); g.ellipse(hx + 26, BED.top - 26, 30, 34, -0.25, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(hx + 40, BED.top - 12, 34, 20, -0.1, 0, TAU); g.fill();
  }
  function quilt(g, t) {
    // the mattress and the quilt over grandma's legs: a hump at the knees, the side hanging down to the rail
    const breath = 0.6 * Math.sin(TAU * (t - TAKE) / 4.8);
    g.fillStyle = COL.quilt[0];
    g.beginPath();
    g.moveTo(BED.head + 22, BED.top - 2);
    g.quadraticCurveTo(410, 452 - breath, 470, 452);           // over the knees
    g.quadraticCurveTo(560, 452, 640, 468);
    g.quadraticCurveTo(720, 470, BED.foot - 8, 466);           // the feet make a small bump at the end
    g.quadraticCurveTo(BED.foot + 8, 470, BED.foot + 10, 490);
    g.lineTo(BED.foot + 12, BED.rail + 16);
    for (let x = BED.foot + 12; x > BED.head; x -= 18) g.quadraticCurveTo(x - 9, BED.rail + 22, x - 18, BED.rail + 16);
    g.lineTo(BED.head + 4, BED.top + 6); g.closePath(); g.fill();
    // patchwork: squares a shade apart, only just there in the dark
    g.save(); g.clip();
    for (let i = 0; i < 26; i++) for (let j = 0; j < 4; j++) {
      g.fillStyle = COL.quilt[(i + j * 3 + (i * j) % 3) % 4];
      g.fillRect(BED.head + i * 20, 446 + j * 26, 20, 26);
    }
    g.strokeStyle = 'rgba(70,52,44,.35)'; g.lineWidth = 1;
    for (let i = 0; i < 26; i++) { g.beginPath(); g.moveTo(BED.head + i * 20, 440); g.lineTo(BED.head + i * 20, 560); g.stroke(); }
    g.restore();
  }
  function bedFront(g) {  // the rail, legs and the low iron footboard
    g.fillStyle = g.strokeStyle = COL.iron; g.lineCap = 'round';
    g.fillRect(BED.head - 4, BED.rail + 12, BED.foot - BED.head + 16, 10);
    g.lineWidth = 8;
    for (const x of [BED.head + 2, BED.foot + 6]) { g.beginPath(); g.moveTo(x, BED.rail); g.lineTo(x, BED.floor); g.stroke(); }
    const fx = BED.foot + 6;
    g.beginPath(); g.moveTo(fx, BED.rail); g.lineTo(fx, 420); g.stroke(); g.beginPath(); g.arc(fx, 414, 7, 0, TAU); g.fill();
    g.lineWidth = 5; g.beginPath(); g.moveTo(fx, 428); g.quadraticCurveTo(fx + 30, 416, fx + 48, 436); g.stroke();
    g.lineWidth = 8; g.beginPath(); g.moveTo(fx + 48, BED.floor - 10); g.lineTo(fx + 48, 436); g.stroke(); g.beginPath(); g.arc(fx + 48, 430, 6.5, 0, TAU); g.fill();
    g.lineWidth = 3; for (let i = 1; i < 4; i++) { const x = fx + i * 12; g.beginPath(); g.moveTo(x, 432 - i); g.lineTo(x, 470); g.stroke(); }
    g.lineWidth = 4; g.beginPath(); g.moveTo(fx, 470); g.lineTo(fx + 48, 470); g.stroke();
  }
  function nightstand(g) {  // left of the bed: a glass of water and pill bottles
    g.fillStyle = COL.wood;
    g.fillRect(196, 470, 96, 10); g.fillRect(202, 480, 84, 58); g.fillRect(204, 538, 7, 50); g.fillRect(277, 538, 7, 50);
    g.fillStyle = COL.glass;
    g.fillRect(214, 446, 13, 24); g.fillRect(232, 452, 9, 18); g.fillRect(233, 448, 7, 5);
    g.fillRect(246, 456, 9, 14); g.fillRect(247, 452, 7, 5);
    g.beginPath(); g.arc(270, 466, 7, Math.PI, 0); g.fill();  // a folded hanky
    g.fillRect(263, 466, 14, 4);
  }
  function dresser(g) {
    g.fillStyle = COL.wood;
    g.fillRect(852, 436, 236, 12); g.fillRect(860, 448, 220, 128); g.fillRect(864, 576, 10, 10); g.fillRect(1066, 576, 10, 10);
    g.fillStyle = '#35271d';
    for (let i = 0; i < 3; i++) g.fillRect(868, 456 + i * 40, 204, 34);
    g.fillStyle = '#211710';
    for (let i = 0; i < 3; i++) for (const x of [910, 1030]) { g.beginPath(); g.arc(x, 473 + i * 40, 3.5, 0, TAU); g.fill(); }
    // on top: a doily, scent bottles, a medicine bottle, a hand mirror, the lamp
    g.fillStyle = COL.glass;
    const bottle = (x, w, h, neck) => { g.beginPath(); g.ellipse(x, 436 - h / 2, w / 2, h / 2, 0, 0, TAU); g.fill(); g.fillRect(x - neck / 2, 436 - h - 9, neck, 10); g.beginPath(); g.arc(x, 436 - h - 11, neck * 0.9, 0, TAU); g.fill(); };
    bottle(884, 22, 26, 6); bottle(912, 14, 34, 5); g.fillRect(930, 404, 16, 32); g.fillRect(932, 398, 12, 7);
    bottle(962, 18, 20, 5);
    g.beginPath(); g.ellipse(1000, 420, 11, 13, 0.3, 0, TAU); g.fill(); g.fillRect(996, 430, 5, 6);
    // the lamp: a vase base and a pleated shade
    g.beginPath(); g.moveTo(1036, 436); g.quadraticCurveTo(1022, 410, 1040, 392); g.lineTo(1048, 392); g.quadraticCurveTo(1066, 410, 1052, 436); g.closePath(); g.fill();
    g.fillRect(1042, 360, 4, 34);
    g.beginPath(); g.moveTo(1016, 368); g.lineTo(1072, 368); g.lineTo(1060, 322); g.lineTo(1028, 322); g.closePath(); g.fill();
  }
  function shapes(g, t) {
    // window plane: the hen on the outside sill (clipped to the glass), then the window's bars
    blurred(g, blurHen(t), (q) => {
      const st = henState(t);
      if (st) {
        q.save(); q.beginPath(); q.rect(WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0); q.clip();
        hen(q, st.x, st.y, 68, st, -1, COL.kid); q.restore();
      }
      windowBars(q);
    }, 0);
    // the room
    dresser(g);
    blurred(g, blurNear(t), (q) => {
      nightstand(q);
      bedBack(q);
      drawKid(q, KIDS.grandma, grandmaPose(t), G_HIP[0], G_HIP[1], G_H, COL.kid);
      quilt(q, t);
      // her lap: the quilt folds up over her hips
      q.fillStyle = COL.quilt[1]; q.beginPath(); q.ellipse(G_HIP[0] + 14, G_HIP[1] - 4, 42, 14, -0.05, 0, TAU); q.fill();
      bedFront(q);
      drawKid(q, KIDS.hider, hiderPose(t), K_HIP[0], K_HIP[1], K_H, COL.kid);
    }, 1);
    blurred(g, 7, (q) => jamb(q, t), 2);
  }
  // the lace curtains hang at the window's sides, lit through; in the break a draught lifts the right one
  function lace(g, x0, x1, top, bottom, gust, side, t) {
    // the panel hangs from the rod; a draught pushes its lower part sideways (side) and lifts the hem
    const H = bottom - top, bow = gust * 120, hemY = bottom - gust * 110;
    const dx = (y, k) => side * bow * k * Math.pow(clamp((y - top) / H, 0, 1), 1.6) + 3 * Math.sin(y * 0.03 + t * 1.3) * (0.3 + gust);
    g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top);
    for (let y = top; y <= hemY; y += 12) g.lineTo(x1 + dx(y, 1), y);
    for (let i = 0; i <= 8; i++) { const u = i / 8, y = hemY + (i % 2 ? 6 : 0) + 8 * gust * Math.sin(u * 3 + t * 2); g.lineTo(lerp(x1 + dx(hemY, 1), x0 + dx(hemY, 1.2), u), y); }
    for (let y = hemY; y >= top; y -= 12) g.lineTo(x0 + dx(y, 1.2), y);
    g.closePath();
    g.fillStyle = 'rgba(228,218,202,.5)'; g.fill();
    g.save(); g.clip();
    g.strokeStyle = 'rgba(120,104,90,.34)'; g.lineWidth = 1.3;
    for (let y = top + 12; y < bottom + 10; y += 22) for (let x = x0 - 22; x < x1 + 22; x += 22) {
      const sx = x + dx(y, 1.1);
      g.beginPath(); g.arc(sx + ((Math.round(y / 22)) % 2) * 11, y, 6, 0, TAU); g.stroke();
    }
    g.fillStyle = 'rgba(150,135,120,.12)';
    for (let x = x0; x < x1; x += 7) for (let y = top; y < bottom; y += 40) g.fillRect(x + dx(y, 1.1), y, 2, 40);
    g.restore();
  }
  function over(g, t) {
    const gust = seg(t, 78.2, 80.4) * (1 - seg(t, 82.0, 83.8)) + 0.25 * seg(t, 80.4, 81.4) * Math.sin((t - 80.4) * 4) * (1 - seg(t, 82, 83));
    const breeze = 0.08 * Math.sin(t * 0.9) + gust;
    g.save(); g.translate(0, 0);
    lace(g, WIN.x0 - 40, WIN.x0 + 22, WIN.y0 - 30, WIN.y1 + 8, 0.06 + 0.04 * Math.sin(t * 0.7), -1, t);
    lace(g, WIN.x1 - 14, WIN.x1 + 44, WIN.y0 - 30, WIN.y1 + 8, breeze, -1, t);
    g.restore();
    // the curtain rod
    g.fillStyle = '#3a2c22'; g.fillRect(WIN.x0 - 60, WIN.y0 - 34, WIN.x1 - WIN.x0 + 120, 5);
  }

  SCENE.add({
    id: 'grandma', t0: TAKE, t1: END,
    stamp: () => ({ date: 'OCT.13 1991', time: '3:12PM' }),
    camera,
    bg, shadows, shapes, over,
    light: { rim: '#fff1d8', glow: 'rgba(255,240,214,.8)', glowBlur: 8, rimW: 1.3, sunDir: [0, -1] },
    source: (t) => ({ x: WIN_C[0] + 20, y: WIN_C[1] - 10, r: 270, a: 0.6 + 0.35 * seg(t, 79.6, 81.8) * (1 - 0.5 * seg(t, 82.4, END)) }),
    grade: { bright: 1.08, contrast: 1.08, sat: 0.96 },
  });
})();
