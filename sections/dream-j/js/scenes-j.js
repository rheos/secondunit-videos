// Section J (278.750-341.2917): Bob's spoken passage on destiny, as Waking Life scenes.
// Each scene is a different animator's hand. The finished test (scenes.js) supplies 298.0-318.0.
//   278.75  train window, ballpoint      "We do make choices, but the mechanical part of responding"
//   286.0   rooftop, pastel              "like our story, I mean it depends what you think the destiny is real"
//   293.0   living room that flies, bold "Please fasten your seat belts"
//   298-318 diner / car / float / quantum (test, rebuilt)
//   318.0   lecture hall, brown brush    "they, scientists claim to understand these things"
//   322.5   the lecturer, bold           "very confident terms, but when you dig under the cover"
//   327.6   lecturer close up, fine pen  "guessing as much as anybody else"
//   329.6   everyone floats, paint       (instrumental)
//   335.6   night window, fine pen       the seat-belt sign comes on; it goes black and orange for the reprise
const QQ = (t) => (a, b) => smooth(inv(a, b, t));
// Cuts on the strongest drum hits (stems.js drum onsets, envelope >= 0.40), as reframings inside a scene.
REFRAME = [
  [282.875, 284.792, 90, -60, 1.28],   // train: in on the puppet ticks
  [284.792, 286.0, -40, 10, .94],      //   back out wide as the strings snap
  [287.542, 289.75, 120, -40, 1.32],   // roof: close on him looking up
  [296.125, 298.0, 90, 40, 1.22],      // living room: closer as she settles and looks out
  [305.417, 308.417, 200, 40, 1.25],   // car: in on the passenger's waving hand
  [311.792, 314.1, -10, -60, 1.18],    // float: closer, the spiral overhead
  [315.958, 318.0, 0, -30, 1.14],      // quantum: tighter as the ghosts appear
  [320.833, 322.5, 260, 200, 1.4],    // lecture: close on the student's air quotes
  [323.083, 324.0, -180, -40, 1.3],    // lecturer: in on "very confident"
  [331.833, 333.167, 0, -40, 1.22],    // float: punch in on the group
  [337.958, 341.2917, -60, 0, 1.1],    // night: a little closer for the ending
];
const mixArm = (A, B, k) => A.map((v, i) => lerp(v, B[i], k));
const toWorld = (P, p) => [P.x + p[0] * P.sc, P.y + p[1] * P.sc];

// ---------------- 1. the train (ballpoint) ----------------
function trainOutside(t, x0, y0, x1, y1) {
  s.fillStyle = vgrad(y0, y1, [[0, hsl(205, 30, 82)], [.55, hsl(44, 50, 86)], [1, hsl(36, 45, 78)]]); s.fillRect(x0 - 60, y0 - 60, x1 - x0 + 120, y1 - y0 + 120);
  const hy = y0 + (y1 - y0) * .5;
  // far hills, slow
  const H1 = []; for (let x = x0 - 200; x <= x1 + 200; x += 90) H1.push([x, hy - 30 + Math.sin((x - t * 26) * .0045) * 34 + Math.sin((x - t * 26) * .011) * 12]);
  H1.push([x1 + 200, y1 + 80], [x0 - 200, y1 + 80]);
  part(H1, { fill: hsl(200, 18, 66), seed: 801, dense: false, seg: 3, wob: .6, tone2: false });
  // mid fields and trees, faster
  part([[x0 - 200, hy + 20], [x1 + 200, hy + 14], [x1 + 200, y1 + 80], [x0 - 200, y1 + 80]], { fill: hsl(80, 26, 64), shade: hsl(90, 24, 54), shadeShift: [0, -20], seed: 802, sharp: 80, wob: .8 });
  for (let i = 0; i < 10; i++) { const x = x0 - 150 + (((i * 173 + t * 240) % 1300) + 1300) % 1300, y = hy + 24 + hash(i + 3) * 30, r = 34 + hash(i + 9) * 30;
    part(lump(x, y - r * .6, r * .8, r, 810 + i, 9), { fill: hsl(110, 22, 46), shade: hsl(120, 24, 36), shadeShift: [-r * .2, -r * .15], seed: 820 + i, wob: .5 }); stroke([[x, y], [x + 2, y + r * .4]], 830 + i, .6); }
  // the near track and its sleepers
  const ry = y1 - 70;
  for (let i = 0; i < 26; i++) { const x = x0 - 80 + (((i * 52 + t * 1100) % 1352) + 1352) % 1352; stroke([[x, ry - 6], [x - 10, ry + 34]], 840 + i, .7, { wob: .1 }); }
  stroke([[x0 - 100, ry], [x1 + 100, ry - 2]], 870, 1.1); stroke([[x0 - 100, ry + 28], [x1 + 100, ry + 26]], 871, 1.2);
  // "choices": a switch comes past and a second line peels off toward the hills
  const sx = x0 - 260 + (t - 279.55) * 1100, fx = x0 + 140 + (t - 279.55) * 60;
  if (t > 279.5) for (const [k, d] of [[0, 0], [1, 28]]) {
    const P = []; for (let i = 0; i <= 14; i++) { const u = i / 14; P.push([lerp(sx, fx + u * 0, u * u * (3 - 2 * u)) + d * (1 - u), lerp(ry + d, hy + 26, Math.pow(u, .7))]); }
    stroke(P, 872 + k, 1.1 - k * .1);
  }
  // telegraph poles whipping past
  for (let i = 0; i < 3; i++) { const x = x0 - 300 + (((i * 640 + t * 1500) % 1920) + 1920) % 1920; stroke([[x, y0 - 40], [x + 6, y1 + 40]], 880 + i, 5, { col: hsl(30, 20, 30) }); stroke([[x - 40, y0 + 40], [x + 46, y0 + 36]], 890 + i, 2.4); }
  stroke([[x0 - 100, y0 + 62 + Math.sin(t * 9) * 4], [x1 + 100, y0 + 70 + Math.sin(t * 9 + 1) * 4]], 895, .6);
}
function shotTrain(t, tt, len) {
  T = t; HAND = HANDS.wire; HUE = Math.sin(t * .11) * 5; REGK = 1;
  fx({ acid: .25, warp: 1, wash: .1 });
  const q = QQ(t), bi = lastBeat(t), bump = hit(t, FEAT.beats[bi] || 0, 9);
  withT(() => {
    cam(1060 + tt * 6, 560 + bump * 3, 1.16 + tt / len * .08, Math.sin(t * 1.7) * .006);
    // carriage wall and window
    fill(hsl(48, 22, 82));
    part([[-200, -200], [2200, -200], [2200, 120], [-200, 130]], { fill: hsl(40, 14, 72), shade: hsl(40, 14, 62), shadeShift: [0, -30], seed: 850, sharp: 80, ink: false });
    stroke([[-100, 104], [2100, 96]], 851, 1.2); stroke([[-100, 60], [2100, 52]], 852, .8);           // luggage rack
    for (let i = 0; i < 14; i++) stroke([[-60 + i * 160, 60], [-58 + i * 160, 104]], 853 + i, .5);
    const win = [[60, 190], [1010, 178], [1022, 700], [70, 712]];
    part(win, { fill: hsl(200, 20, 80), seed: 860, sharp: 30, inkW: 1.4, extra: () => trainOutside(t, 40, 160, 1040, 730) });
    part([[40, 704], [1040, 692], [1046, 740], [36, 752]], { fill: hsl(40, 10, 62), shade: hsl(40, 10, 50), shadeShift: [0, -6], seed: 861, sharp: 40 });
    stroke([[540, 185], [546, 706]], 862, 1.6);
    // seat back behind him: moquette with a little pattern
    part([[1080, 1200], [1070, 300], [1110, 250], [1500, 246], [1540, 300], [1550, 1200]], { fill: hsl(190, 30, 44), shade: hsl(195, 30, 34), shadeShift: [-26, 0], seed: 863, inkW: 1.1, extra: () => {
      for (let i = 0; i < 70; i++) { const x = 1090 + (i % 10) * 46 + (Math.floor(i / 10) % 2) * 23, y = 280 + Math.floor(i / 10) * 70; part(ellipse(x, y, 7, 7, 6), { fill: hsl(40, 50, 60, .55), seed: 870 + i, ink: false, wob: .2, reg: .2, tone2: false }); }
    } });
    // the commuter
    const rest = { L: [-.28, 1.78, 0, .35, .82], R: [.28, -1.78, 0, .35, .82] };
    const lift = q(279.75, 280.3) * (1 - q(281.0, 281.5)), weigh = Math.sin((t - 279.95) * TAU * 1.15) * env(t, 280.0, 281.2, .25);
    const mech = env(t, 281.3, 284.25, .18), tk = (bi % 2 ? 1 : -1), jolt = hit(t, FEAT.beats[bi] || 0, 14) * tk;
    const resp = q(284.1, 284.8);
    let L = rest.L, R = rest.R;
    L = mixArm(L, [-.3, 2.25 + weigh * .35, -.5, .95, 1], lift); R = mixArm(R, [.3, -2.25 + weigh * .35, .5, .95, 1], lift);
    L = mixArm(L, [-.45 + tk * .12, 1.9 - tk * .38 + jolt * .1, -tk * .35, .55, 1], mech); R = mixArm(R, [.45 + tk * .12, -1.95 - tk * .38 + jolt * .1, tk * .35, .55, 1], mech);
    L = mixArm(L, [-.8, 2.0, -.4, 1, 1], resp); R = mixArm(R, [.8, -2.0, .4, 1, 1], resp);
    const P = {
      style: CAST.commuter, x: 1300 + snoise(t * .2, 900) * 8, y: 1010, sc: 1.42, seed: 910, light: [-12, -6], breath: breathAt(t),
      lean: .02 + snoise(t * .3, 901) * .02 + lift * .02 - resp * .03 + mech * tk * .02, twist: .15, shrug: lift * 8 + resp * 10 + mech * (tk > 0 ? 6 : 0),
      turn: -.42 + snoise(t * .22, 902) * .08 + resp * .15, tilt: snoise(t * .4, 903) * .03 + mech * tk * .06 + lift * weigh * .04,
      nod: snoise(t * .5, 904) * .3 + hit(t, 279.44, 5) * .8 - resp * .3, mouth: mouthAt(t), blink: blinkAt(t, 11), brow: .2 + lift * .5 + resp * .7,
      armL: L, armR: R, flipL: true, flipR: false,
    };
    person({ ...P, parts: 'body' });
    // the table in front, with a paper cup and a folded paper (no print)
    part([[600, 880], [1900, 868], [1920, 960], [590, 976]], { fill: hsl(210, 8, 80), shade: hsl(210, 8, 68), shadeShift: [0, -10], seed: 905, sharp: 50, inkW: 1.1 });
    part([[600, 960], [1920, 950], [1920, 1200], [600, 1200]], { fill: hsl(210, 8, 58), seed: 906, sharp: 60, ink: false });
    part([[780, 800], [840, 800], [832, 884], [788, 884]], { fill: hsl(35, 30, 92), shade: hsl(30, 20, 76), shadeShift: [8, 0], seed: 907 });
    part(ellipse(810, 800, 30, 7, 10), { fill: hsl(25, 40, 32), seed: 908, inkW: .6 });
    part([[1560, 866], [1780, 860], [1790, 884], [1566, 892]], { fill: hsl(45, 15, 90), shade: hsl(45, 10, 78), shadeShift: [0, -4], seed: 909, sharp: 30 });
    const J = person({ ...P, parts: 'arms' });
    // the marionette strings: the mechanical part of responding
    const sa = env(t, 281.3, 284.6, .25), snap = q(284.5, 285.3);
    if (sa > 0 && J.armL && J.armR) {
      const pts = [toWorld(P, J.armL.wr), toWorld(P, J.armR.wr), [J.hc[0], J.hc[1] - 80]];
      pts.forEach((p, i) => { const top = [p[0] + snoise(t * .5, 920 + i) * 20, -300];
        const end = [lerp(p[0], top[0], snap * .7), lerp(p[1], top[1], snap * .7)];
        stroke([top, [lerp(top[0], end[0], .5) + Math.sin(t * 2 + i) * 6 * snap, lerp(top[1], end[1], .5)], end], 925 + i, .45, { col: hsl(40, 40, 96, .9), alpha: sa });
        dot(end[0], end[1], 3.5, hsl(40, 30, 92, sa)); });
    }
    // the shadows of the poles sweep over the carriage
    s.save(); s.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 3; i++) { const x = -300 + (((i * 640 + t * 1500) % 1920) + 1920) % 1920; const bx = 1040 + (x - 40) * 1.6;
      s.fillStyle = hsl(230, 25, 70, .2); s.beginPath(); s.moveTo(bx, -200); s.lineTo(bx + 60, -200); s.lineTo(bx + 260, 1300); s.lineTo(bx + 170, 1300); s.closePath(); s.fill(); }
    s.restore();
  });
}

// ---------------- 2. the rooftop (pastel) ----------------
function roofSky(t, vort) {
  s.fillStyle = vgrad(-1100, 800, [[0, hsl(218, 34, 44)], [.45, hsl(205, 30, 68)], [.78, hsl(30, 60, 80)], [1, hsl(22, 70, 74)]]); s.fillRect(-500, -1300, 2900, 2200);
  s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(260, 560, 10, 700, [[0, hsl(40, 90, 80, .8)], [1, hsl(30, 80, 60, 0)]]); s.fillRect(-500, -300, 1600, 1200); s.restore();
  const C0 = [980, -420], r = rng(940);
  // loose clouds drift in and gather along ONE continuous spiral band (no separate arms)
  const N = 40;
  for (let i = 0; i < N; i++) {
    const u = (i + .5) / N, th = (t - 290) * .22 + u * 2.1 * TAU, rad = 460 * Math.pow(1 - u, 1.15) + 10;
    const sx = -300 + r() * 2500 + (t - 286) * (8 + r() * 10), sy = -1000 + r() * 1500, sw = 60 + r() * 90;
    const vx = C0[0] + Math.cos(th) * rad * 1.35, vy = C0[1] + Math.sin(th) * rad * .8;
    const x = lerp(sx, vx, vort), y = lerp(sy, vy, vort), w = lerp(sw, 10 + 100 * Math.pow(1 - u, 1.3), vort);
    part(lump(x, y, w, w * .45, 941 + i, 10), { fill: hsl(30 + r() * 15, 45, 90, .9), shade: hsl(330, 25, 74, .85), shadeShift: [0, -w * .14], seed: 950 + i, wob: 1.4 });
  }
  withT(() => { s.translate(C0[0], C0[1]); spiralCloud(460, (t - 290) * .22, smooth(inv(.55, 1, vort)) * .85, 945, { fill: hsl(32, 45, 90, .9), shade: hsl(330, 25, 74, .85) }); });
  if (vort > .3) withT(() => { s.globalAlpha = smooth(inv(.4, 1, vort)); const a = (t - 290) * .9; plane(C0[0] + Math.cos(a) * 30, C0[1] + Math.sin(a) * 16, .55, a + Math.PI / 2, { seed: 999, fill: hsl(40, 60, 96) }); });
}
function shotRoof(t, tt, len) {
  T = t; HAND = HANDS.pastel; HUE = Math.sin(t * .11) * 6; REGK = 1;
  fx({ acid: .3, warp: 1.1 });
  const q = QQ(t), tilt = ease.inOut(inv(291.2, 293.0, t)), vort = smooth(inv(290.8, 292.7, t));
  withT(() => {
    cam(960 + snoise(t * .2, 960) * 12, 540 - tilt * 620 + snoise(t * .17, 961) * 8, 1.0 + tt * .01 + tilt * .05, snoise(t * .12, 962) * .01);
    roofSky(t, vort);
    // the city far off
    const r = rng(963); let x = -400;
    while (x < 2400) { const w = 60 + r() * 140, h = 60 + r() * 220; part([[x, 760], [x, 760 - h], [x + w, 760 - h], [x + w, 760]], { fill: hsl(255, 18, 46 + r() * 6), shade: hsl(255, 18, 38), shadeShift: [w * .3, 0], seed: 964 + (x | 0), sharp: 40, wob: .6, tone2: false });
      for (let k = 0; k < 6; k++) if (r() > .55) dot(x + 10 + r() * (w - 20), 760 - h + 20 + r() * (h - 30), 3, hsl(45, 90, 75, .8)); x += w + r() * 20; }
    // water tower
    withT(() => { s.translate(330, 0);
      for (const lx of [-90, -30, 30, 90]) stroke([[lx * .9, 470], [lx * 1.2, 830]], 970 + lx, 2.2, { force: true, col: hsl(20, 25, 25) });
      stroke([[-110, 640], [110, 650]], 975, 1.6, { force: true, col: hsl(20, 25, 25) });
      part([[-120, 470], [-118, 250], [120, 250], [122, 470]], { fill: hsl(22, 40, 42), shade: hsl(18, 40, 32), shadeShift: [40, 0], seed: 976, sharp: 30 });
      part([[-130, 256], [0, 150], [130, 256]], { fill: hsl(20, 30, 32), shade: hsl(18, 30, 24), shadeShift: [30, 0], seed: 977, sharp: 30 });
      for (let i = 0; i < 4; i++) stroke([[-118, 300 + i * 45], [120, 302 + i * 45]], 978 + i, .8, { force: true, col: hsl(18, 30, 26, .6) }); });
    // the young man, forearms on the parapet
    const roll = env(t, 285.9, 286.95, .2), rl = Math.sin((t - 286.0) * TAU * 1.5), look = env(t, 286.9, 289.35, .35), dep = env(t, 289.35, 290.6, .2), point = q(290.9, 291.45);
    let L = [-.32, 1.55, .1, .35, .85], R = [.32, -1.55, -.1, .35, .85];
    R = mixArm(R, [.45, -2.55 + rl * .3, .3 + rl * .4, .85, 1], roll);
    R = mixArm(R, [.45, -2.3, Math.sin((t - 289.4) * TAU * 2.2) * .4, .9, 1], dep);
    L = mixArm(L, [-.5, 3.15, -.15, .12, 1.05], point);
    const P = {
      style: CAST.roof, x: 1260 + snoise(t * .25, 980) * 8, y: 1010, sc: 1.5, seed: 1000, light: [14, -8], breath: breathAt(t),
      lean: .03 + snoise(t * .3, 981) * .02 - look * .04 - point * .04, twist: -.1, shrug: dep * 6,
      turn: .3 + snoise(t * .25, 982) * .08 + look * .25 - point * .1, tilt: snoise(t * .35, 983) * .04 - look * .1 - point * .14 + dep * Math.sin((t - 289.4) * TAU * 1.1) * .05,
      nod: snoise(t * .5, 984) * .3 - look * .8 - point * 1, mouth: mouthAt(t), blink: blinkAt(t, 12), brow: .2 + look * .4 + point * .6,
      armL: L, armR: R, flipL: true, flipR: false,
    };
    person({ ...P, parts: 'body' });
    // parapet in front
    part([[-300, 830], [2300, 822], [2300, 1400], [-300, 1400]], { fill: hsl(16, 38, 50), shade: hsl(12, 38, 40), shadeShift: [0, -40], seed: 990, sharp: 80, extra: () => {
      for (let row = 0; row < 7; row++) for (let i = 0; i < 26; i++) { const bx = -300 + i * 110 + (row % 2) * 55, by = 870 + row * 48; part([[bx, by], [bx + 100, by], [bx + 100, by + 40], [bx, by + 40]], { fill: hsl(14 + hash(i * 7 + row) * 8, 40, 46 + hash(i + row * 31) * 8), seed: 1100 + row * 30 + i, ink: false, sharp: 50, wob: .4, tone2: false }); }
    } });
    part([[-300, 800], [2300, 792], [2300, 850], [-300, 858]], { fill: hsl(30, 20, 72), shade: hsl(25, 20, 60), shadeShift: [0, -10], seed: 991, sharp: 80 });
    person({ ...P, parts: 'arms' });
    // a page of the story blows up and away
    const pp = inv(286.35, 289.4, t);
    if (pp > 0 && pp < 1) withT(() => { const e = ease.out(pp);
      s.translate(lerp(1420, -150, e) + Math.sin(pp * 9) * 60, lerp(790, -560, Math.pow(pp, .8)) + Math.sin(pp * 13) * 30); s.rotate(pp * 7 + .3); s.scale(Math.cos(pp * 17) * .8 + .2, 1);
      part([[-34, -46], [34, -46], [34, 46], [-34, 46]], { fill: hsl(45, 40, 94), shade: hsl(40, 25, 78), shadeShift: [6, -6], seed: 995, sharp: 20, inkW: .6 }); });
  });
}

// ---------------- 3. the living room that flies (bold brush) ----------------
function shotCabin(t, tt, len) {
  T = t; HAND = HANDS.bold; HUE = Math.sin(t * .11) * 4; REGK = 1;
  fx({ acid: .25, warp: 1.1 });
  const q = QQ(t), bank = ease.inOut(inv(295.7, 298.2, t)) * .07, ding = hit(t, 293.64, 2.5), lit = q(293.6, 293.72);
  withT(() => {
    cam(1040 + tt * 8, 520, 1.0 + tt / len * .06, bank);
    // wallpaper
    part([[-300, -300], [2300, -300], [2300, 1400], [-300, 1400]], { fill: hsl(150, 20, 70), shade: hsl(155, 20, 62), shadeShift: [-300, 0], seed: 1200, ink: false, wob: 4, extra: () => {
      for (let i = 0; i < 24; i++) stroke([[-300 + i * 110, -300], [-300 + i * 110 + 4, 1400]], 1201 + i, .5, { force: true, col: hsl(150, 20, 60, .6), wob: .3 });
      for (let i = 0; i < 120; i++) { const x = -250 + (i % 24) * 110 + 55, y = -200 + Math.floor(i / 24) * 300 + (i % 2) * 150; dot(x, y, 5, hsl(30, 50, 80, .7)); }
    } });
    // the oval window: a plane's window in a living-room wall, clouds rushing past below
    const W0 = ellipse(390, 450, 180, 250, 20);
    part(ellipse(390, 450, 215, 290, 20), { fill: hsl(40, 25, 88), shade: hsl(40, 18, 74), shadeShift: [14, 10], seed: 1210, inkW: 1 });
    part(W0, { fill: hsl(210, 50, 72), seed: 1211, inkW: 1.1, extra: () => {
      s.fillStyle = vgrad(180, 720, [[0, hsl(215, 55, 58)], [.6, hsl(200, 45, 80)], [1, hsl(40, 60, 90)]]); s.fillRect(150, 150, 500, 620);
      for (let i = 0; i < 9; i++) { const r = rng(1220 + i), cx = 700 - (((r() * 700 + t * 380) % 900) + 900) % 900, cy = 560 + r() * 160, rw = 70 + r() * 60;
        part(lump(cx, cy, rw, rw * .45, 1230 + i, 10), { fill: hsl(40, 30, 97), shade: hsl(220, 20, 82), shadeShift: [0, -rw * .2], seed: 1240 + i, ink: false, wob: .8 }); }
      s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(300, 280, 5, 260, [[0, hsl(45, 90, 90, .7)], [1, hsl(45, 90, 80, 0)]]); s.fillRect(150, 150, 500, 620); s.restore();
    } });
    part(ellipse(390, 450, 150, 220, 16), { seed: 1212, inkW: .5, alpha: .4 });
    // a framed picture (a little landscape)
    part([[1560, 230], [1820, 226], [1824, 420], [1564, 424]], { fill: hsl(35, 40, 40), seed: 1250, sharp: 40, extra: () => { part([[1584, 250], [1800, 247], [1802, 400], [1586, 402]], { fill: hsl(200, 30, 76), seed: 1251, sharp: 40, inkW: .6 }); part([[1584, 360], [1700, 330], [1802, 350], [1802, 402], [1586, 402]], { fill: hsl(100, 25, 52), seed: 1252, inkW: .5 }); } });
    // the seat-belt sign, on the living-room wall
    withT(() => { s.translate(1180, 160);
      part([[-120, -46], [120, -46], [124, 46], [-124, 46]], { fill: hsl(40, 15, 86), shade: hsl(40, 12, 70), shadeShift: [8, -6], seed: 1260, sharp: 20, inkW: .8 });
      part(ellipse(-55, 0, 32, 32, 12), { fill: hsl(40, 8, 70), seed: 1261, inkW: .6 }); stroke([[-75, -20], [-35, 20]], 1262, .6, { force: true }); stroke([[-70, 4], [-44, 4]], 1263, 1.0, { force: true });
      part(ellipse(55, 0, 32, 32, 12), { fill: lit > 0 ? `hsla(34,${lerp(10, 95, lit)}%,${lerp(70, 62, lit)}%,1)` : hsl(40, 8, 70), seed: 1264, inkW: .6, tone2: false });
      part([[40, -2], [70, -2], [70, 8], [40, 8]], { fill: hsl(30, 30, 25, .9), seed: 1265, sharp: 8, ink: false }); part(ellipse(55, -14, 6, 6, 8), { fill: hsl(30, 30, 25, .9), seed: 1266, ink: false });
      if (lit > 0) { s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(55, 0, 10, 200, [[0, hsl(34, 100, 62, .7 * lit)], [1, hsl(30, 100, 50, 0)]]); s.fillRect(-200, -200, 500, 400); s.restore(); }
      if (ding > .02) { s.save(); s.globalAlpha = ding; s.strokeStyle = hsl(34, 90, 70); s.lineWidth = 3; s.beginPath(); s.arc(55, 0, 40 + (1 - ding) * 160, 0, TAU); s.stroke(); s.restore(); }
    });
    // standard lamp, its cord swinging as the room banks
    stroke([[1760, 1100], [1766, 470]], 1270, 1.4); part([[1680, 470], [1704, 330], [1830, 330], [1856, 470]], { fill: hsl(45, 60, 76), shade: hsl(40, 50, 62), shadeShift: [16, 0], seed: 1271, sharp: 30 });
    s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(1768, 420, 10, 420, [[0, hsl(45, 80, 70, .4)], [1, hsl(45, 80, 60, 0)]]); s.fillRect(1300, 0, 900, 900); s.restore();
    const sway = Math.sin(t * 2.3) * (.05 + bank * 2.5); stroke([[1800, 470], [1800 + Math.sin(sway) * 120, 470 + Math.cos(sway) * 120]], 1272, .5);
    // side table and teacup
    part([[1440, 780], [1640, 776], [1630, 1100], [1450, 1100]], { fill: hsl(25, 35, 34), shade: hsl(20, 35, 24), shadeShift: [20, 0], seed: 1275, sharp: 30 });
    part([[1420, 770], [1660, 766], [1664, 796], [1416, 800]], { fill: hsl(25, 35, 42), seed: 1276, sharp: 30 });
    part([[1510, 712], [1580, 712], [1572, 764], [1518, 764]], { fill: hsl(200, 30, 90), shade: hsl(205, 22, 74), shadeShift: [10, 0], seed: 1277 });
    part(ellipse(1545, 768, 60, 9, 12), { fill: hsl(200, 25, 88), seed: 1278 });
    for (let k = 0; k < 2; k++) { const P = []; for (let i = 0; i < 7; i++) P.push([1540 + k * 14 + Math.sin(i * .9 - t * 2.4 + k * 2) * (4 + i * 2), 700 - i * 20]); stroke(P, 1279 + k, .35, { alpha: .5 }); }
    // the armchair
    part([[930, 1200], [916, 420], [950, 330], [1180, 296], [1410, 330], [1444, 420], [1430, 1200]], { fill: hsl(350, 34, 54), shade: hsl(345, 34, 42), shadeShift: [22, -10], seed: 1280 });
    for (const sx of [-1, 1]) part([[1180 + sx * 250, 420], [1180 + sx * 300, 380], [1180 + sx * 320, 470], [1180 + sx * 300, 760], [1180 + sx * 240, 760]], { fill: hsl(350, 34, 50), shade: hsl(345, 34, 40), shadeShift: [-sx * 14, -8], seed: 1281 + sx });
    // the old woman: looks up at the ding, fastens an airplane belt across her armchair, settles
    const look = env(t, 293.6, 295.9, .3), reach = env(t, 294.25, 294.95, .22), clip = q(294.85, 295.2), settle = q(295.5, 296.3), win = q(296.2, 297.0);
    let L = [-.1, 1.2, .1, .3, .85], R = [.1, -1.2, -.1, .3, .85];
    L = mixArm(L, [-.42, .45, 0, .55, .9], reach); R = mixArm(R, [.42, -.45, 0, .55, .9], reach);
    L = mixArm(L, [-.05, 1.32, .15, .3, .85], clip * (1 - reach)); R = mixArm(R, [.05, -1.32, -.15, .3, .85], clip * (1 - reach));
    const P = {
      style: CAST.nana, x: 1180, y: 860, sc: 1.18, seed: 1300, light: [-12, -6], breath: breathAt(t),
      lean: snoise(t * .25, 1301) * .02 + reach * .05 - settle * .02, twist: 0, shrug: clip * 4 * (1 - settle),
      turn: snoise(t * .2, 1302) * .06 - win * .45 + look * .1, tilt: snoise(t * .3, 1303) * .03 - look * .12 + reach * .05 - win * .04,
      nod: -look * 1.2 + reach * .8 + snoise(t * .4, 1304) * .2, mouth: 0, blink: blinkAt(t, 13), brow: .3 + look * .8,
      armL: L, armR: R, flipL: true, flipR: false,
    };
    person({ ...P, parts: 'body' });
    // the crochet blanket over her lap
    part([[960, 830], [1180, 800], [1400, 830], [1430, 1200], [930, 1200]], { fill: hsl(30, 50, 70), shade: hsl(25, 45, 56), shadeShift: [0, -20], seed: 1310, extra: () => {
      for (let i = 0; i < 56; i++) { const gx = 940 + (i % 8) * 62, gy = 800 + Math.floor(i / 8) * 62; part([[gx + 6, gy + 6], [gx + 56, gy + 6], [gx + 56, gy + 56], [gx + 6, gy + 56]], { fill: hsl([10, 45, 200, 330, 90][i % 5], 45, 64), seed: 1320 + i, sharp: 30, inkW: .35, wob: .4, tone2: false }); }
    } });
    const J = person({ ...P, parts: 'arms' });
    // the belt: two straps from the sides of the chair into her hands, then buckled across her lap
    if (J.armL && J.armR) {
      const hl = toWorld(P, J.armL.wr), hr = toWorld(P, J.armR.wr), buck = [1180, 900];
      const el = clip > .99 ? buck : hl, er = clip > .99 ? buck : hr;
      for (const [a, b, sd] of [[[985, 880], el, 1340], [[1375, 880], er, 1341]]) part([[a[0], a[1] - 14], [b[0], b[1] - 12], [b[0], b[1] + 12], [a[0], a[1] + 14]], { fill: hsl(215, 20, 40), shade: hsl(215, 20, 30), shadeShift: [0, -4], seed: sd, sharp: 30, inkW: .6, tone2: false });
      if (clip > .99) { part([[1150, 880], [1210, 880], [1212, 920], [1148, 920]], { fill: hsl(210, 10, 80), shade: hsl(210, 10, 62), shadeShift: [6, -4], seed: 1342, sharp: 16, inkW: .7 }); }
      else { for (const [hp, sd] of [[hl, 1343], [hr, 1344]]) part([[hp[0] - 18, hp[1] - 14], [hp[0] + 18, hp[1] - 14], [hp[0] + 18, hp[1] + 14], [hp[0] - 18, hp[1] + 14]], { fill: hsl(210, 10, 80), seed: sd, sharp: 12, inkW: .6 }); }
      const click = hit(t, 295.2, 9);
      if (click > .03) { s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(1180, 900, 2, 90, [[0, hsl(45, 80, 90, click)], [1, hsl(45, 80, 80, 0)]]); s.fillRect(1080, 800, 200, 200); s.restore(); }
    }
  });
}

// ---------------- 4. the lecture hall (brown brush) ----------------
// chalk on a board, as rows of made-up marks (no letters), revealed in order up to prog
const CHALK = (() => { const r = rng(1400), G = [];
  for (let row = 0; row < 5; row++) { let x = .04 + r() * .05; const y = .14 + row * .17;
    while (x < .9) { const kind = r(), w = .03 + r() * .06, P = [];
      if (kind < .4) { let yy = y; for (let i = 0; i <= 10; i++) { yy += (r() - .5) * .025; P.push([x + i / 10 * w * 1.6, yy + Math.sin(i * .9) * .012]); } }
      else if (kind < .55) { for (let i = 0; i <= 12; i++) { const a = i / 12 * TAU * 1.3; P.push([x + w * .4 + Math.cos(a) * w * .4 + i * .002, y + Math.sin(a) * .03]); } }
      else if (kind < .7) { P.push([x, y + .02], [x + w * 1.4, y + .018]); }
      else if (kind < .85) { for (let i = 0; i <= 8; i++) { const u = i / 8; P.push([x + u * w * .5 + Math.sin(u * Math.PI) * .01, y - .05 + u * .1]); } }
      else { P.push([x, y], [x + w, y - .005], [x + w * .78, y - .025], [x + w, y - .005], [x + w * .78, y + .015]); }
      G.push(P); x += w + .015 + r() * .03; } }
  const wave = []; for (let i = 0; i <= 30; i++) wave.push([.55 + i / 30 * .4, .82 + Math.sin(i * .6) * .07 * Math.exp(-i / 30)]); G.push(wave);
  const orb = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * TAU; orb.push([.2 + Math.cos(a) * .1, .8 + Math.sin(a) * .06]); } G.push(orb);
  return G; })();
function chalkBoard(x0, y0, x1, y1, prog, seed, off) {
  const n = CHALK.length;
  CHALK.forEach((G, i) => {
    const a = clamp(prog * n - i); if (a <= 0) return;
    const k = Math.max(2, Math.ceil(G.length * a)), d = off ? off(i) : null;
    let P = G.slice(0, k).map(([u, v]) => [lerp(x0, x1, u), lerp(y0, y1, v)]);
    if (d) { if (d.gone) return; P = P.map(([x, y]) => [d.x + (x - d.cx) * d.k, d.y + (y - d.cy) * d.k]); }
    stroke(P, seed + i, .55, { force: true, col: hsl(60, 15, 90, .85), wob: .15, dense: true });
  });
}
function audienceHead(x, y, sc, seed) {
  const r = rng(seed), hc = [[25, 40, 18], [30, 15, 70], [10, 50, 30], [40, 30, 45], [0, 0, 20], [220, 10, 30]][Math.floor(r() * 6)], top = [Math.floor(r() * 360), 20 + r() * 20, 30 + r() * 20];
  withT(() => { s.translate(x, y); s.scale(sc, sc);
    part([[-80, 60], [-70, 0], [-30, -20], [30, -20], [70, 0], [80, 60]], { fill: hsl(top[0], top[1], top[2]), shade: hsl(top[0], top[1], top[2] - 8), shadeShift: [10, -6], seed: seed + 1, inkW: .8 });
    part(lump(r() * 6 - 3, -62, 38 + r() * 8, 46, seed + 2, 12), { fill: hsl(hc[0], hc[1], hc[2]), shade: hsl(hc[0], hc[1], hc[2] - 6), shadeShift: [8, -6], seed: seed + 3, inkW: .8 });
  });
}
function shotLecture(t, tt, len) {
  T = t; HAND = HANDS.brush; HUE = Math.sin(t * .11) * 5; REGK = 1;
  fx({ acid: .3, warp: 1 });
  const q = QQ(t);
  withT(() => {
    cam(960 + snoise(t * .15, 1401) * 10, 540 + snoise(t * .13, 1402) * 6, 1.0 + tt / len * .05, snoise(t * .1, 1403) * .008);
    fill(hsl(30, 22, 52));
    part([[-300, -300], [2300, -300], [2300, 700], [-300, 700]], { fill: hsl(32, 28, 50), shade: hsl(28, 28, 42), shadeShift: [-200, 0], seed: 1404, ink: false, extra: () => { for (let i = 0; i < 18; i++) stroke([[-300 + i * 150, -300], [-298 + i * 150, 700]], 1405 + i, .5, { alpha: .5 }); } });
    // the board, filling up with marks as he writes
    part([[530, 140], [1390, 132], [1396, 500], [526, 506]], { fill: hsl(32, 40, 34), seed: 1430, sharp: 40, inkW: 1 });
    part([[550, 156], [1372, 150], [1376, 486], [546, 490]], { fill: hsl(165, 16, 22), shade: hsl(165, 16, 18), shadeShift: [-40, 0], seed: 1431, sharp: 40, ink: false, extra: () => chalkBoard(560, 160, 1366, 484, .35 + inv(318, 322.5, t) * .5, 1440) });
    // the lecturer, small, writing
    const wr = Math.sin(t * 6.3) * .12 + Math.sin(t * 9.7) * .06;
    person({ style: CAST.prof, x: 1180, y: 700, sc: .42, seed: 1450, back: true, light: [-10, -8], breath: breathAt(t), lean: -.03, tilt: -.05 + wr * .2,
      armR: [.75 + wr * .5, -2.5 + wr * 1.4, 0, .3, 1], armL: [-.1, .15, 0, .3, 1], legs: [.04, 0, -.04, 0], footDown: true });
    part([[700, 640], [1320, 634], [1330, 770], [690, 776]], { fill: hsl(28, 35, 38), shade: hsl(24, 35, 28), shadeShift: [20, -8], seed: 1460, sharp: 40 });
    // rows of the audience, far to near
    for (let row = 0; row < 4; row++) {
      const y = 760 + row * 70, sc = .55 + row * .17, n = 9 - row;
      part([[-300, y - 10 + row * 6], [960, y - 30], [2300, y - 10 + row * 6], [2300, y + 40], [960, y + 20], [-300, y + 40]], { fill: hsl(26, 35, 40 - row * 2), shade: hsl(24, 35, 30), shadeShift: [0, -10], seed: 1470 + row, wob: 2 });
      for (let i = 0; i < n; i++) { const x = 80 + (i + (row % 2) * .5) * (1800 / n) + snoise(i * 3.1, row) * 20; if (row === 3 && Math.abs(x - 1300) < 180) continue;
        audienceHead(x + snoise(t * .3, 1480 + row * 10 + i) * 3, y - 30 * sc + 20, sc, 1500 + row * 20 + i); }
    }
    // the student in front of us turns round and says it to us
    const turned = t >= 318.22, tq = q(318.22, 318.75), thumb = env(t, 319.9, 320.55, .2), quote = env(t, 320.5, 321.35, .15), qc = Math.sin((t - 320.55) * TAU * 2.4) > 0 ? .25 : .95, rest = q(321.3, 321.9);
    let L = [-.12, .5, 0, .3, 1], R = [.1, -.4, 0, .3, 1];
    L = mixArm(L, [-.6, 2.75, .4, .15, 1], thumb);
    L = mixArm(L, [-.45, 2.55, -.3, qc, 1], quote); R = mixArm(R, [.45, -2.55, .3, qc, 1], quote);
    R = mixArm(R, [.35, -1.9, Math.sin((t - 321.4) * TAU * 1.3) * .4, .8, 1], rest * (1 - quote));
    const P = { style: CAST.student, x: 1300 + snoise(t * .25, 1560) * 6, y: 1180, sc: 1.28, seed: 1570, light: [12, -6], breath: breathAt(t), back: !turned,
      lean: .02 + snoise(t * .3, 1561) * .02, twist: turned ? .25 : 0, shrug: quote * 8, turn: turned ? lerp(.85, .25, tq) + snoise(t * .25, 1562) * .06 : 0,
      tilt: snoise(t * .3, 1563) * .04 + thumb * .06 - quote * .04, nod: snoise(t * .5, 1564) * .3, mouth: turned ? mouthAt(t) : 0, blink: blinkAt(t, 14), brow: .3 + quote * .9 + thumb * .4,
      armL: turned ? L : null, armR: turned ? R : null, flipL: true, flipR: false };
    person(P);
    // our own desk along the bottom, a notebook and a pencil
    part([[-300, 1010], [2300, 1000], [2300, 1400], [-300, 1400]], { fill: hsl(30, 38, 46), shade: hsl(26, 38, 36), shadeShift: [0, -20], seed: 1580, sharp: 80 });
    part([[300, 1030], [640, 1022], [660, 1100], [290, 1110]], { fill: hsl(45, 30, 92), seed: 1581, sharp: 30, extra: () => { for (let i = 0; i < 4; i++) stroke([[310, 1044 + i * 16], [640, 1036 + i * 16]], 1582 + i, .3, { alpha: .5 }); } });
  });
}

// ---------------- 5. the lecturer and the cover (bold) ----------------
function nightSky(x0, y0, x1, y1, t, seed) {
  s.fillStyle = vgrad(y0, y1, [[0, hsl(232, 50, 16)], [.7, hsl(240, 40, 30)], [1, hsl(270, 30, 40)]]); s.fillRect(x0 - 50, y0 - 50, x1 - x0 + 100, y1 - y0 + 100);
  const r = rng(seed);
  for (let i = 0; i < 70; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), tw = .5 + .5 * Math.sin(t * (1 + r() * 2) + i); dot(x, y, 1.2 + r() * 2 * tw, hsl(50, 40, 92, .5 + .5 * tw)); }
  for (let i = 0; i < 3; i++) { const cx = x0 + ((r() * (x1 - x0) + t * 12) % (x1 - x0 + 300)) - 150, cy = y0 + (y1 - y0) * (.5 + r() * .4); part(lump(cx, cy, 120, 30, seed + 10 + i), { fill: hsl(250, 25, 45, .7), seed: seed + 20 + i, ink: false, wob: 1 }); }
}
// the half of a polygon where f >= 0 (one Sutherland-Hodgman step)
function clipHalf(Pg, f) { const out = []; for (let i = 0; i < Pg.length; i++) { const a = Pg[i], b = Pg[(i + 1) % Pg.length], fa = f(a), fb = f(b);
  if (fa >= 0) out.push(a); if ((fa >= 0) !== (fb >= 0)) { const k = fa / (fa - fb); out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k)]); } } return out; }
const BOARD = [[840, 96], [1880, 90], [1886, 700], [834, 706]];
function peelBoard(p) { // fold the top-right corner down toward the bottom left
  const c = BOARD[1], dv = [-.84, .54], L = Math.hypot(BOARD[3][0] - c[0], BOARD[3][1] - c[1]) * .98, cc = p * L;
  const d = (X) => (X[0] - c[0]) * dv[0] + (X[1] - c[1]) * dv[1];
  const kept = p <= 0 ? BOARD : clipHalf(BOARD, (X) => d(X) - cc), gone = p <= 0 ? [] : clipHalf(BOARD, (X) => cc - d(X));
  const flap = gone.map((X) => { const k = 2 * (cc - d(X)); return [X[0] + dv[0] * k, X[1] + dv[1] * k]; });
  return { kept, gone, flap };
}
function shotProf(t, tt, len) {
  T = t; HAND = HANDS.bold; HUE = Math.sin(t * .11) * 5; REGK = 1;
  fx({ acid: .3, warp: 1.1 });
  const q = QQ(t), peel = ease.inOut(inv(325.3, 326.9, t)) * .72 + q(327.0, 327.6) * .03;
  withT(() => {
    cam(1000 + snoise(t * .15, 1601) * 10 + tt * 5, 470 + snoise(t * .13, 1602) * 6, 1.0 + tt / len * .06, snoise(t * .1, 1603) * .01);
    fill(hsl(32, 26, 54));
    for (let i = 0; i < 16; i++) stroke([[-300 + i * 160, -300], [-296 + i * 160, 1300]], 1604 + i, .5, { alpha: .4 });
    // what is under the cover: the night sky, where the board was
    const pb = peelBoard(peel);
    s.save(); path(BOARD); s.clip(); nightSky(820, 80, 1900, 720, t, 1610); s.restore();
    if (peel > 0) stroke([...BOARD, BOARD[0]], 1611, .6, { alpha: .3 });
    part([[820, 76], [1900, 70], [1906, 720], [814, 726]], { seed: 1612, inkW: 1.2, sharp: 50 }); // frame line only
    s.save(); path(pb.kept); s.fillStyle = hsl(165, 16, 22); s.fill(); s.clip(); chalkBoard(860, 110, 1866, 690, 1, 1440); s.restore();
    if (pb.flap.length > 2) {
      s.save(); s.globalAlpha = .35; path(add(pb.flap, [-14, 18])); s.fillStyle = hsl(240, 30, 10); s.fill(); s.restore();
      part(pb.flap, { fill: hsl(35, 30, 70), shade: hsl(30, 30, 56), shadeShift: [14, -10], seed: 1613, dense: true, inkW: 1 });
    }
    // the lecturer
    const sweep = env(t, 322.5, 323.5, .2), finger = env(t, 323.55, 324.75, .2), fn = hit(t, 323.64, 8) + hit(t, 324.58, 8), dig = env(t, 325.2, 326.4, .25), deflate = q(326.5, 327.4);
    let L = [-.15, .35, 0, .35, 1], R = [.2, -.6, 0, .35, 1];
    R = mixArm(R, [1.25, .25, -.2, 1, 1], sweep);
    L = mixArm(L, [-.45, 2.9 - fn * .2, -.1, .12, 1], finger);
    R = mixArm(R, [.6, -.9 + Math.sin((t - 325.3) * TAU * 1.4) * .4, -.6, .8, 1], dig);
    L = mixArm(L, [-.08, .2, 0, .4, 1], deflate); R = mixArm(R, [.12, -.25, 0, .4, 1], deflate * (1 - dig));
    const P = { style: CAST.prof, x: 620 + snoise(t * .2, 1620) * 8, y: 960, sc: 1.55, seed: 1630, light: [12, -6], breath: breathAt(t),
      lean: -.03 * (1 - deflate) + snoise(t * .3, 1621) * .02 + deflate * .05 + sweep * .03, twist: .2, shrug: finger * 6 - deflate * 6,
      turn: .25 + snoise(t * .25, 1622) * .06 + sweep * .25 + q(325.5, 326.0) * .45 * (1 - deflate * .3), tilt: -finger * .06 + snoise(t * .3, 1623) * .03 + deflate * .06,
      nod: snoise(t * .5, 1624) * .3 + fn * .8 - finger * .3, mouth: mouthAt(t), blink: blinkAt(t, 15), brow: .2 + finger * .3 + q(325.6, 326.2) * .9,
      armL: L, armR: R, flipL: true, flipR: false };
    person({ ...P, parts: 'body' });
    part([[300, 860], [980, 850], [990, 1300], [290, 1300]], { fill: hsl(28, 35, 36), shade: hsl(24, 35, 26), shadeShift: [24, -10], seed: 1640, sharp: 40 });
    part([[280, 840], [1000, 830], [1004, 870], [276, 880]], { fill: hsl(28, 35, 44), seed: 1641, sharp: 40 });
    person({ ...P, parts: 'arms' });
  });
}

// ---------------- 6. the lecturer, close (fine pen) ----------------
function shotProfClose(t, tt, len) {
  T = t; HAND = HANDS.fine; HUE = Math.sin(t * .11) * 4; REGK = 1;
  fx({ acid: .25, warp: 1.1 });
  const q = QQ(t), shrug = env(t, 328.4, 329.5, .25), guess = q(327.6, 328.1);
  withT(() => {
    cam(960 + tt * 8, 540 + snoise(t * .13, 1701) * 6, 1.0 + tt / len * .04, snoise(t * .1, 1702) * .01);
    // the peeled board: night sky to the right, the last marks on the left lifting off into it as birds
    nightSky(-200, -200, 2200, 1300, t, 1710);
    part([[-300, -200], [700, -210], [380, 1300], [-300, 1300]], { fill: hsl(165, 16, 22), seed: 1711, inkW: .8 });
    part([[700, -210], [380, 1300], [520, 1300], [820, -200]], { fill: hsl(35, 30, 70), shade: hsl(30, 30, 56), shadeShift: [-10, 0], seed: 1712 });
    for (let i = 0; i < 22; i++) {
      const r = rng(1720 + i), t0 = 327.6 + r() * 1.6, k = clamp((t - t0) / 1.6), x0 = -100 + r() * 600, y0 = 100 + r() * 800;
      const x = x0 + k * k * (900 + r() * 900), y = y0 - k * (200 + r() * 400) + Math.sin(t * 3 + i) * 10 * k, flap = Math.sin(t * 12 + i * 2) * k;
      const w = 26 * (1 - k * .4);
      // a chalk mark (a little wave) that opens into a bird's two wings
      stroke([[x - w, y + flap * 10], [x - w * .4, y - 6 * (1 - k) - flap * 4], [x, y], [x + w * .4, y - 6 + 6 * k - flap * 4], [x + w, y + flap * 10 + (1 - k) * 8]], 1730 + i, .55, { force: true, col: hsl(60, 15, 92, .9), wob: .2 });
    }
    const P = { style: CAST.prof, x: 1080 + snoise(t * .2, 1740) * 12, y: 1720, sc: 3.15, seed: 1750, light: [12, -6], breath: breathAt(t), inkK: .45, wobK: .4, detail: true,
      lean: snoise(t * .3, 1741) * .02 + shrug * .02, twist: .1, shrug: shrug * 16, turn: -.28 + snoise(t * .25, 1742) * .06 + guess * .08, tilt: snoise(t * .3, 1743) * .03 + shrug * .08 - guess * .03,
      nod: snoise(t * .5, 1744) * .3 + hit(t, 327.66, 6) * .6, mouth: mouthAt(t), blink: blinkAt(t, 16), brow: .2 + guess * .9 + shrug * .5,
      armL: null, armR: null };
    person(P);
  });
}

// ---------------- 7. everyone floats (paint) ----------------
function floater(t, o) {
  const k = t - 329.6, y = o.y - k * o.v - Math.pow(Math.max(0, k), 1.6) * o.acc, sp = Math.sin(t * .7 + o.ph);
  const P = { style: o.style, x: o.x + snoise(t * .2, o.seed) * 40, y, sc: o.sc, seed: o.seed, light: [-10, -8], breath: breathAt(t), hem: 6,
    lean: sp * .1 + o.rot, twist: 0, turn: snoise(t * .2, o.seed + 1) * .3, tilt: snoise(t * .3, o.seed + 2) * .1, nod: -.5, blink: o.sleep ? 1 : blinkAt(t, o.seed), brow: .4,
    armL: [-.7 + sp * .15, .6 + sp * .2, -.3, .7, 1], armR: [.7 - sp * .15, -.6 - sp * .2, .3, .7, 1], flipL: true, flipR: false,
    legs: o.chair ? null : [.12 + sp * .06, -.3, -.06 - sp * .06, -.4], footDown: false };
  if (o.chair) withT(() => { s.translate(P.x, y); s.rotate(P.lean); s.scale(o.sc, o.sc);
    part([[-210, 200], [-220, -380], [-170, -470], [0, -500], [170, -470], [220, -380], [210, 200]], { fill: hsl(350, 34, 54), shade: hsl(345, 34, 42), shadeShift: [22, -10], seed: o.seed + 5 });
    for (const sx of [-1, 1]) part([[sx * 180, 200], [sx * 190, -80], [sx * 250, -110], [sx * 270, 200]], { fill: hsl(350, 34, 50), seed: o.seed + 6 + sx }); });
  person(P);
  if (o.chair) withT(() => { s.translate(P.x, y); s.rotate(P.lean); s.scale(o.sc, o.sc); part([[-200, -30], [0, -60], [200, -30], [210, 220], [-210, 220]], { fill: hsl(30, 50, 70), shade: hsl(25, 45, 56), shadeShift: [0, -20], seed: o.seed + 9 }); });
}
function shotLevitate(t, tt, len) {
  T = t; HAND = HANDS.paint; HUE = Math.sin(t * .11) * 8 + tt * 3; REGK = 1 + acidKick(t, 3) * .8;
  fx({ acid: .7, acidPeel: .5, acidMirror: .25, warp: 1.3, wash: .1 });
  const rise = ease.inOut(inv(329.6, 335.6, t));
  withT(() => {
    cam(960, 560 - rise * 700, 1.0 + rise * .06, snoise(t * .1, 1801) * .02);
    s.fillStyle = vgrad(-1200, 1100, [[0, hsl(240, 35, 30)], [.4, hsl(280, 28, 50)], [.75, hsl(20, 55, 68)], [1, hsl(40, 60, 76)]]); s.fillRect(-500, -1500, 2900, 2800);
    for (let i = 0; i < 8; i++) { const r = rng(1810 + i); part(lump(-200 + r() * 2400 + tt * (6 + r() * 10), -900 + r() * 1500, 180 + r() * 120, 40 + r() * 20, 1811 + i), { fill: hsl(300 + r() * 40, 25, 74, .8), shade: hsl(260, 20, 58, .7), shadeShift: [0, -16], seed: 1820 + i }); }
    // the highway far below, its lane lines drifting up
    part([[-300, 900], [2300, 900], [2300, 1600], [-300, 1600]], { fill: hsl(80, 14, 38), seed: 1830, sharp: 80, wob: 2 });
    part([[930, 900], [990, 900], [1600, 1600], [320, 1600]], { fill: hsl(230, 8, 30), seed: 1831, sharp: 60, wob: 2 });
    for (let i = 0; i < 14; i++) { const r = rng(1840 + i), lift = Math.max(0, t - 329.6 - r() * 2) * (60 + r() * 80), y = 940 + i * 50 - lift, x = 960 + (r() - .5) * lift * 1.2;
      withT(() => { s.translate(x, y); s.rotate(lift * .004 * (r() > .5 ? 1 : -1)); part([[-5 - i, -12 - i * 2], [5 + i, -12 - i * 2], [5 + i, 12 + i * 2], [-5 - i, 12 + i * 2]], { fill: hsl(48, 40, 88), seed: 1850 + i, sharp: 10, wob: .3, tone2: false }); }); }
    // the talkers of this section, all drifting up (no Bob: these are the scene's own characters)
    const cast = [
      { style: CAST.commuter, x: 360, y: 560, sc: .34, v: 70, acc: 6, rot: -.15, ph: 0, seed: 1900 },
      { style: CAST.diner, x: 760, y: 820, sc: .40, v: 90, acc: 8, rot: .1, ph: 1, seed: 1910 },
      { style: CAST.nana, x: 1180, y: 700, sc: .32, v: 80, acc: 7, rot: -.05, ph: 2, seed: 1920, chair: true, sleep: true },
      { style: CAST.roof, x: 1560, y: 900, sc: .38, v: 110, acc: 9, rot: .2, ph: 3, seed: 1930 },
      { style: CAST.student, x: 520, y: 1150, sc: .30, v: 120, acc: 10, rot: .25, ph: 4, seed: 1940 },
      { style: CAST.prof, x: 1380, y: 1250, sc: .33, v: 130, acc: 11, rot: -.2, ph: 5, seed: 1950 },
    ];
    for (const o of cast) floater(t, o);
    // a page, a teacup and a paper cup float up with them
    const fl = (x, y, v, fn) => withT(() => { s.translate(x + Math.sin(t * .8 + x) * 30, y - (t - 329.6) * v); s.rotate((t - 329.6) * .4); fn(); });
    fl(980, 980, 140, () => part([[-24, -32], [24, -32], [24, 32], [-24, 32]], { fill: hsl(45, 40, 94), seed: 1960, sharp: 20 }));
    fl(260, 1050, 115, () => part([[-16, -18], [16, -18], [12, 16], [-12, 16]], { fill: hsl(200, 30, 90), shade: hsl(205, 22, 74), shadeShift: [6, 0], seed: 1961 }));
    fl(1750, 1100, 125, () => part([[-14, -24], [14, -24], [10, 24], [-10, 24]], { fill: hsl(35, 30, 92), shade: hsl(30, 20, 76), shadeShift: [6, 0], seed: 1962 }));
    // a few clouds in front, that they rise through
    for (let i = 0; i < 4; i++) { const r = rng(1970 + i); part(lump(-100 + r() * 2200 - tt * 20, -500 + r() * 900, 260, 60, 1971 + i), { fill: hsl(320, 25, 84, .55), seed: 1975 + i, wob: 2 }); }
  });
}

// ---------------- 8. the night window (fine pen), into black and orange ----------------
function shotNight(t, tt, len) {
  T = t; HAND = HANDS.fine; HUE = 0; REGK = 1;
  const q = QQ(t), duo = ease.inOut(inv(338.6, 341.1, t)) * .88, on = q(339.0, 339.12), ding = hit(t, 339.03, 2.5);
  fx({ acid: .12, warp: .9, duo, dim: q(340.2, 341.29) * .18 });
  withT(() => {
    cam(960 - tt * 4, 540, 1.04 + tt / len * .05, 0);
    // the cabin sidewall, dim
    fill(hsl(220, 12, 22));
    part([[-300, -300], [2300, -300], [2300, 1400], [-300, 1400]], { fill: hsl(215, 10, 30), shade: hsl(215, 12, 22), shadeShift: [-400, 0], seed: 2000, ink: false, wob: 3 });
    // the window: night, moonlit cloud deck below, the wing with its blinking light
    part(ellipse(680, 500, 270, 360, 22), { fill: hsl(215, 10, 40), shade: hsl(215, 12, 30), shadeShift: [16, 12], seed: 2001, inkW: .9 });
    const Wn = ellipse(680, 500, 205, 290, 22);
    part(Wn, { fill: hsl(230, 40, 18), seed: 2002, inkW: 1, extra: () => {
      s.fillStyle = vgrad(200, 800, [[0, hsl(232, 45, 12)], [.6, hsl(235, 35, 24)], [1, hsl(230, 30, 34)]]); s.fillRect(450, 180, 460, 640);
      const r = rng(2003); for (let i = 0; i < 30; i++) dot(470 + r() * 420, 200 + r() * 300, .8 + r() * 1.6, hsl(50, 30, 92, .4 + .6 * r()));
      part(ellipse(800, 300, 26, 26, 12), { fill: hsl(50, 30, 92), seed: 2004, ink: false, wob: .2 });
      for (let i = 0; i < 8; i++) { const r2 = rng(2010 + i), cx = 950 - (((r2() * 600 + t * 60) % 700) + 700) % 700, cy = 640 + r2() * 160, rw = 80 + r2() * 60;
        part(lump(cx, cy, rw, rw * .35, 2020 + i, 10), { fill: hsl(225, 20, 62), shade: hsl(230, 25, 42), shadeShift: [0, rw * .2], seed: 2030 + i, ink: false, wob: .6 }); }
      part([[420, 640], [760, 560], [860, 548], [870, 566], [420, 720]], { fill: hsl(220, 10, 34), shade: hsl(220, 12, 24), shadeShift: [0, 10], seed: 2040, sharp: 40, inkW: .6 });
      const bi = lastBeat(t), blink = hit(t, FEAT.beats[bi] || 0, 10) * (bi % 2);
      dot(862, 556, 5, hsl(0, 80, 55)); if (blink > .05) { s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(862, 556, 2, 60, [[0, hsl(0, 90, 60, blink)], [1, hsl(0, 90, 50, 0)]]); s.fillRect(780, 480, 160, 160); s.restore(); }
    } });
    part(ellipse(680, 500, 185, 270, 18), { seed: 2005, inkW: .4, alpha: .35 });
    // the panel above: reading light and the seat-belt sign, which comes on again
    part([[1000, -300], [2300, -300], [2300, 120], [1000, 140]], { fill: hsl(215, 10, 36), shade: hsl(215, 12, 28), shadeShift: [0, -12], seed: 2050, sharp: 60 });
    withT(() => { s.translate(1500, 70);
      part([[-110, -36], [110, -36], [112, 36], [-112, 36]], { fill: hsl(215, 8, 30), seed: 2051, sharp: 20, inkW: .7 });
      part(ellipse(55, 0, 26, 26, 12), { fill: on > 0 ? `hsla(30,${lerp(10, 100, on)}%,${lerp(40, 58, on)}%,1)` : hsl(215, 8, 40), seed: 2052, inkW: .5, tone2: false });
      part([[42, -2], [68, -2], [68, 7], [42, 7]], { fill: hsl(30, 30, 15, .9), seed: 2053, sharp: 8, ink: false }); part(ellipse(55, -12, 5, 5, 8), { fill: hsl(30, 30, 15, .9), seed: 2054, ink: false });
      part(ellipse(-55, 0, 26, 26, 12), { fill: hsl(215, 8, 40), seed: 2055, inkW: .5 });
      if (on > 0) { s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(55, 0, 8, 260, [[0, hsl(28, 100, 58, .8 * on)], [1, hsl(25, 100, 50, 0)]]); s.fillRect(-300, -300, 700, 700); s.restore(); }
      if (ding > .02) { s.save(); s.globalAlpha = ding; s.strokeStyle = hsl(30, 90, 65); s.lineWidth = 2.5; s.beginPath(); s.arc(55, 0, 34 + (1 - ding) * 140, 0, TAU); s.stroke(); s.restore(); }
    });
    // the old woman from the armchair, asleep against the window
    const P = { style: CAST.nana, x: 1260, y: 1160, sc: 1.25, seed: 2100, light: [-12, -4], breath: breathAt(t) * .6,
      lean: -.12, tilt: -.22 + snoise(t * .2, 2101) * .02, turn: -.25, nod: .3, blink: 1, brow: .1, mouth: 0,
      armL: [-.1, 1.15, .1, .3, .85], armR: [.1, -1.15, -.1, .3, .85], flipL: true, flipR: false };
    person({ ...P, parts: 'body' });
    part([[920, 1000], [1260, 950], [1600, 1000], [1640, 1400], [880, 1400]], { fill: hsl(30, 40, 50), shade: hsl(25, 40, 38), shadeShift: [0, -20], seed: 2110 });
    person({ ...P, parts: 'arms' });
    // window light falls across her
    s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(760, 520, 20, 700, [[0, hsl(225, 40, 60, .25)], [1, hsl(225, 40, 50, 0)]]); s.fillRect(0, 0, 1920, 1300); s.restore();
  });
}

chapter('J', 278.75, 341.2917, [
  [278.75, shotTrain],
  [286.0, shotRoof],
  [293.0, shotCabin],
  [298.0, shotDiner],
  [304.3, shotCar],
  [310.0, shotFloat],
  [314.1, shotQuantum],
  [318.0, shotLecture],
  [322.5, shotProf],
  [327.6, shotProfClose],
  [329.6, shotLevitate],
  [335.6, shotNight],
]);
