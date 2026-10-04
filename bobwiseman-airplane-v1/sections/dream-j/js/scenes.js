// Airplane on the Highway, 298.0-318.0: the middle of Bob's spoken passage on destiny and free will.
// Four scenes, each in a different animator's hand (Waking Life changed artists per scene):
//   A 298.0  diner booth, clean line. She asks "are we fulfilling our destiny?"; her head turns to sky.
//   B 304.3  in the car, painterly flat shapes. "if we're creating our destiny..."; the road lines lift off.
//   C 310.0  outside at dusk, scratchy line. She floats up off the ground; a plane-shaped cloud.
//   D 314.1  close up, "that whole quantum thing": she splits into probability ghosts; the frame folds.
// speech windows for the whole section, from the word timings (gaps under 0.35 s merge)
const SPEECH = (() => { const out = []; for (const l of window.LYRICS) for (const w of l.words) { if (w.s < 278 || w.s > 330) continue; const last = out[out.length - 1]; if (last && w.s - last[1] < .35) last[1] = Math.max(last[1], w.e); else out.push([w.s, w.e]); } return out; })();
const talking = (t) => SPEECH.some(([a, b]) => t > a - .04 && t < b + .06);
const mouthAt = (t) => talking(t) ? clamp(F('voc', t, 1) * 3.6) : 0;
function blinkAt(t, seed) { const p = 3.2 + hash(seed) * 1.6, ph = ((t + hash(seed + 3) * 5) % p) / p; return ph < .05 ? Math.sin(ph / .05 * Math.PI) : 0; }
const breathAt = (t) => .5 + .5 * Math.sin(t * TAU / 3.7);
const env = (t, a, b, r = .3) => smooth(inv(a - r, a, t)) * (1 - smooth(inv(b, b + r, t)));

// a soft cloudy sky, for windows, the head-sky and the outside
function skyClouds(x0, y0, x1, y1, seed, o = {}) {
  s.fillStyle = vgrad(y0, y1, o.grad || [[0, hsl(208, 30, 74)], [1, hsl(40, 35, 86)]]); s.fillRect(x0, y0, x1 - x0, y1 - y0);
  const r = rng(seed), n = o.n || 5, w = x1 - x0, h = y1 - y0;
  for (let i = 0; i < n; i++) {
    const cx = x0 + ((r() * w + T * (o.speed ?? 14) * (.6 + r() * .6)) % (w * 1.4)) - w * .2, cy = y0 + h * (.15 + r() * .6), rx = w * (.08 + r() * .1) * (o.cs || 1);
    part(lump(cx, cy, rx, rx * .42, seed + i * 13), { fill: o.cloud || hsl(35, 30, 95, .92), shade: o.cloudSh || hsl(220, 18, 80, .9), shadeShift: [0, -rx * .25], seed: seed + i * 7, ink: o.ink ?? false, inkW: .6, wob: 1.5, hatch: false });
  }
}

// ---------------- A: the diner booth (clean line) ----------------
function poseA(t) {
  const q = (a, b) => smooth(inv(a, b, t));
  const raise = q(299.4, 300.6) * (1 - q(303.9, 304.6) * .3);         // the hand comes up as she starts to think
  const roll = env(t, 302.1, 302.95, .2) * Math.sin((t - 302.1) * TAU * 1.4);
  const open = q(302.9, 303.5);                                         // "destiny?": palm opens outward
  return {
    style: CAST.commuter, x: 1130 + snoise(t * .22, 3) * 10, y: 1010, sc: 1.42, seed: 100, light: [12, -6],
    breath: breathAt(t), lean: .035 + snoise(t * .3, 11) * .025 - raise * .03 + open * .03,
    twist: -.2 + snoise(t * .2, 14) * .2, shrug: open * 10,
    turn: -.38 + snoise(t * .27, 12) * .08 + q(300.9, 301.5) * .12 + open * .14, tilt: snoise(t * .38, 13) * .035 + env(t, 301.0, 302.4, .35) * .07 - open * .05,
    nod: snoise(t * .5, 15) * .3 - open * .4, mouth: mouthAt(t), blink: blinkAt(t, 1), brow: .2 + open * .8 + env(t, 301.0, 301.9) * .5,
    armL: [lerp(-.12, -.36 - open * .6, raise), lerp(1.25, 2.95 + open * 1.05, raise) + roll * .22, lerp(.1, -.2, raise) + roll * .3 + open * .2, .3 + raise * .3 + open * .4, lerp(.8, 1, raise)],
    armR: [.22 + snoise(t * .3, 17) * .03, -1.75 + snoise(t * .25, 18) * .06, -.1, .3, .72],
    flipL: true, flipR: false,
    sky: smooth(inv(303.0, 303.75, t)),
    det: dinerDet(t),
  };
}
// v4: around the diner he pulls his forearms off like a puppet's (clean wooden ball joints, no harm done):
// the left pops off on a drum hit, then the right; both float and gesture on their own, then click back on.
function dinerDet(t) {
  const d = {}, pk = (a, b, c, e) => env(t, a, b, .25) * (t < c ? 1 : 1 - smooth(inv(c, e, t)));
  const kL = smooth(inv(298.83, 299.2, t)) * (1 - smooth(inv(300.4, 300.8, t))), kR = smooth(inv(299.38, 299.75, t)) * (1 - smooth(inv(300.6, 300.95, t)));
  if (kL > .001) d.armL = [kL * (-150 + Math.sin(t * 2.3) * 30), kL * (-170 + Math.sin(t * 3.1) * 25), kL * (.9 + Math.sin(t * 2.7) * .5), 1];
  if (kR > .001) d.armR = [kR * (140 + Math.sin(t * 2.1 + 1) * 30), kR * (-230 + Math.sin(t * 2.9) * 25), kR * (-2.1 + Math.sin(t * 2.4) * .5), 1];
  return d;
}
function shotDiner(t, tt, len) {
  T = t; HAND = HANDS.clean; HUE = Math.sin(t * .11) * 8; REGK = 1;
  fx({ acid: .35, warp: 1 });
  const z = 1.28 + tt / len * .1;
  withT(() => {
    cam(1060 + snoise(t * .15, 2) * 14 + tt * 5, 545 + snoise(t * .13, 4) * 10, z, snoise(t * .11, 6) * .012);
    // the wall breathes
    part([[-200, -200], [2200, -200], [2200, 900], [-200, 900]], { fill: hsl(168, 20, 60), shade: hsl(175, 22, 50), shadeShift: [-260, 0], seed: 1, ink: false, wob: 6 });
    stroke([[-100, 700], [600, 704], [1300, 698], [2100, 702]], 3, 1.1);
    part([[-200, 700], [2200, 700], [2200, 900], [-200, 900]], { fill: hsl(25, 22, 44), shade: hsl(20, 22, 36), shadeShift: [0, -20], seed: 5, wob: 4, sharp: 60 });
    // window, the outside drifting past
    const win = [[110, 120], [720, 108], [728, 640], [118, 650]];
    part(win, { fill: hsl(205, 28, 78), seed: 7, inkW: 1.6, sharp: 30, extra: () => {
      skyClouds(80, 90, 760, 670, 41, { n: 4, speed: 18 });
      part([[60, 560], [260, 520], [470, 545], [640, 505], [780, 540], [780, 700], [60, 700]], { fill: hsl(110, 14, 56), shade: hsl(120, 14, 46), shadeShift: [0, -12], seed: 9, inkW: .7 });
      stroke([[520, 640], [532, 300]], 11, 1.3); stroke([[90, 330], [300, 360], [520, 330], [760, 352]], 12, .4);
      const pa = inv(299.3, 303.0, t);                                     // a tiny plane drifts across the window
      if (pa > 0 && pa < 1) plane(lerp(60, 790, pa), 250 - pa * 50 + snoise(t * .6, 21) * 6, .42, -.06 + snoise(t * .4, 22) * .03, { seed: 23 });
    } });
    stroke([[415, 115], [423, 645]], 13, 1.4); stroke([[114, 385], [724, 375]], 14, 1.4);
    // pendant lamp
    stroke([[1520, -100], [1522, 120]], 15, .8);
    s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(1520, 190, 10, 380, [[0, hsl(45, 70, 70, .45)], [1, hsl(45, 70, 60, 0)]]); s.fillRect(1100, -200, 900, 800); s.restore();
    part([[1440, 200], [1462, 150], [1500, 124], [1540, 124], [1578, 150], [1600, 200]], { fill: hsl(140, 30, 40), shade: hsl(150, 30, 28), shadeShift: [14, 0], seed: 16 });
    // booth back
    part([[720, 1100], [726, 480], [750, 440], [1120, 432], [1500, 440], [1528, 480], [1540, 1100]], { fill: hsl(356, 36, 42), shade: hsl(350, 36, 32), shadeShift: [24, -14], seed: 17, inkW: 1.2, sharp: 40 });
    for (let i = 0; i < 5; i++) stroke([[820 + i * 160, 470], [826 + i * 160, 600], [818 + i * 160, 800]], 18 + i, .5);
    const pose = poseA(t);
    pose.skyDraw = (Fp) => withT(() => {
      s.fillStyle = vgrad(-60, 60, [[0, hsl(210, 58, 60)], [1, hsl(35, 50, 86)]]); s.fillRect(-80, -80, 160, 160);
      const r = rng(5);
      for (let i = 0; i < 4; i++) { const cx = -60 + ((r() * 120 + (t - 303) * 14) % 150), cy = -30 + r() * 60; part(lump(cx, cy, 20 + r() * 10, 8 + r() * 4, 60 + i), { fill: hsl(35, 30, 96, .95), shade: hsl(220, 18, 82), shadeShift: [0, -4], seed: 60 + i, ink: false, wob: .5, reg: .4 }); }
      const pp = inv(303.45, 304.3, t); if (pp > 0) plane(lerp(-50, 60, pp), 6 - pp * 14, .13, -.12, { seed: 66 });
    });
    person({ ...pose, parts: 'body' });
    // table
    part([[-200, 812], [2200, 806], [2200, 1300], [-200, 1300]], { fill: hsl(48, 25, 84), shade: hsl(40, 20, 72), shadeShift: [0, -60], seed: 31, inkW: 1.3, sharp: 60 });
    part([[-200, 806], [2200, 800], [2200, 822], [-200, 828]], { fill: hsl(210, 8, 74), seed: 32, inkW: .8, sharp: 60 });
    // coffee cup and its steam
    part([[930, 840], [1010, 840], [1004, 920], [990, 936], [950, 936], [936, 920]], { fill: hsl(40, 20, 94), shade: hsl(30, 14, 76), shadeShift: [10, 0], seed: 33 });
    part(lump(970, 842, 40, 8, 34, 10), { fill: hsl(25, 45, 26), seed: 35, inkW: .8, seg: 3 });
    part([[1008, 860], [1034, 864], [1032, 900], [1004, 902], [1006, 890], [1022, 888], [1022, 872], [1006, 872]], { seed: 36, inkW: .8, seg: 2 });
    for (let k = 0; k < 3; k++) { const P = []; for (let i = 0; i < 9; i++) { const y = 830 - i * 22; P.push([955 + k * 14 + Math.sin(i * .9 - t * 2.2 + k * 2) * (6 + i * 2) + snoise(t * .4, 37 + k) * 8, y]); } stroke(P, 37 + k, .45, { alpha: .55 }); }
    // napkin dispenser
    part([[300, 760], [420, 756], [424, 900], [296, 904]], { fill: hsl(210, 8, 70), shade: hsl(210, 10, 52), shadeShift: [16, 0], seed: 39, sharp: 25 });
    person({ ...pose, parts: 'arms' });
    for (const [a, b, x, y] of [[300.4, 300.8, 0, 0], [300.6, 300.95, 0, 0]]) { const c = hit(t, b, 10); if (t > b && c > .03) { const g = geomOf(pose), e = g.w(a === 300.4 ? g.elL : g.elR); s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(e[0], e[1], 2, 60, [[0, hsl(45, 80, 90, c)], [1, hsl(45, 80, 80, 0)]]); s.fillRect(e[0] - 70, e[1] - 70, 140, 140); s.restore(); } }
  });
}

// ---------------- B: in the car (painterly) ----------------
const VP = [930, 430];
function roadDash(i, t) { // a lane dash: world depth z, lift h, spin; returns null when gone
  const speed = 9, base = i * 3.2, z0 = base - ((t - 300) * speed) % 3.2 - Math.floor((t - 300) * speed / 3.2) * 3.2;
  const ts = 305.5 + hash(i * 17 + 3) * 3.0;                             // when this dash lets go of the road
  let z = z0, h = 0, spin = 0;
  if (t > ts) { const zs = base - (ts - 300) * speed, d = t - ts; z = zs - d * 4.5; h = Math.pow(d, 1.25) * 1.5; spin = d * (1.3 + hash(i) * 1.5) * (hash(i + 5) > .5 ? 1 : -1); }
  if (z < .9 || z > 70) return null;
  return { z, h, spin };
}
function shotCar(t, tt, len) {
  T = t; HAND = HANDS.paint; HUE = Math.sin(t * .11) * 8 + tt * 4; REGK = 1 + acidKick(t, 3) * 1.2;
  fx({ acid: .8, acidMirror: .55, warp: 1.3, wash: .2 });
  const K = 230;
  withT(() => {
    cam(960 + snoise(t * .2, 2) * 18 - tt * 6, 540 + snoise(t * .9, 4) * 4, 1.02 + tt * .006, snoise(t * .35, 6) * .012);
    // dusk sky through the windshield
    s.fillStyle = vgrad(0, 460, [[0, hsl(262, 22, 52)], [.6, hsl(330, 28, 66)], [1, hsl(28, 55, 74)]]); s.fillRect(-300, -300, 2600, 800);
    for (let i = 0; i < 4; i++) { const r = rng(90 + i), cx = ((r() * 2200 + T * 10) % 2600) - 300, cy = 120 + r() * 200; part(lump(cx, cy, 160 + r() * 120, 34 + r() * 20, 91 + i), { fill: hsl(300 + r() * 40, 25, 76, .85), shade: hsl(260, 20, 58, .8), shadeShift: [0, -18], seed: 92 + i }); }
    part([[-300, 440], [200, 400], [520, 425], [800, 395], [1100, 420], [1450, 385], [1800, 418], [2300, 400], [2300, 520], [-300, 520]], { fill: hsl(250, 18, 38), shade: hsl(255, 20, 28), shadeShift: [0, -12], seed: 93 });
    // ground and road
    part([[-300, 430], [2300, 430], [2300, 1200], [-300, 1200]], { fill: hsl(80, 14, 40), shade: hsl(90, 14, 32), shadeShift: [0, -40], seed: 94, wob: 2, sharp: 80 });
    part([[VP[0] - 14, VP[1]], [VP[0] + 14, VP[1]], [VP[0] + 1400, VP[1] + 900], [VP[0] - 1300, VP[1] + 900]], { fill: hsl(230, 8, 30), shade: hsl(235, 10, 24), shadeShift: [0, -60], seed: 95, wob: 2, sharp: 60 });
    for (const sx of [-1, 1]) stroke([[VP[0] + sx * 12, VP[1]], [VP[0] + sx * 600, VP[1] + 380], [VP[0] + sx * 1200, VP[1] + 780]], 96 + sx, 2.2, { force: true, col: hsl(45, 30, 80) });
    // the lane dashes, some lifting off and tumbling up into the sky
    const ds = [];
    for (let i = 0; i < 40; i++) { const d = roadDash(i, t); if (d) ds.push({ ...d, i }); }
    ds.sort((a, b) => b.z - a.z);
    for (const d of ds) {
      if (d.h <= 0) { // on the road: a true perspective quad from z to z + 1.3
        const ya = VP[1] + K / d.z, yb = VP[1] + K / (d.z + 1.3), wa = .09 * K / d.z, wb = .09 * K / (d.z + 1.3), xa = VP[0] + 4, xb = VP[0] + 4;
        part([[xa - wa, ya], [xb - wb, yb], [xb + wb, yb], [xa + wa, ya]], { fill: hsl(48, 40, 88), seed: 200 + d.i, dense: true, wob: .3, reg: .2 });
        continue;
      }
      const k = K / d.z, x = VP[0] + 4 + (snoise(T * .3, d.i) * .6 + (hash(d.i + 9) - .5) * 3) * d.h * k * .5, y = VP[1] + k * (1 - d.h * 1.1) - d.h * 30;
      const L = Math.max(6, 1.3 * k * .7) * (Math.abs(Math.cos(d.spin)) * .7 + .3), Wd = Math.max(3, .09 * k * 2.6);
      withT(() => { s.translate(x, y); s.rotate(d.spin * .7); part([[-Wd, -L], [Wd, -L], [Wd, L], [-Wd, L]], { fill: hsl(48, 40, 88), shade: hsl(40, 30, 70), shadeShift: [Wd * .5, 0], seed: 200 + d.i, sharp: 8, wob: .3, reg: .25 }); });
    }
    // windshield frame and dashboard
    part([[-300, -300], [2300, -300], [2300, 80], [1700, 70], [960, 60], [220, 70], [-300, 80]], { fill: hsl(250, 14, 18), shade: hsl(250, 14, 12), shadeShift: [0, 10], seed: 97 });
    part([[-300, 60], [230, 64], [40, 720], [-300, 760]], { fill: hsl(250, 14, 19), shade: hsl(250, 14, 13), shadeShift: [20, 0], seed: 98 });
    part([[2300, 60], [1680, 64], [1880, 720], [2300, 760]], { fill: hsl(250, 14, 19), shade: hsl(250, 14, 13), shadeShift: [-20, 0], seed: 99 });
    s.save(); s.translate(0, 235); // the interior sits low so the road gets the frame (the test lost half the frame to dark seats)
    part([[-300, 640], [400, 610], [960, 600], [1500, 610], [2300, 640], [2300, 1300], [-300, 1300]], { fill: hsl(20, 16, 30), shade: hsl(15, 16, 22), shadeShift: [0, -30], seed: 100 });
    part([[-300, 650], [400, 622], [960, 612], [1500, 622], [2300, 650], [2300, 676], [1500, 650], [960, 642], [400, 652], [-300, 680]], { fill: hsl(30, 60, 62, .55), seed: 99.5, ink: false, wob: 1.5 }); // sunset glare along the dash
    for (const [gx, gc] of [[700, 190], [1230, 30]]) { s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(gx, 660, 2, 70, [[0, hsl(gc, 80, 60, .5)], [1, hsl(gc, 80, 50, 0)]]); s.fillRect(gx - 80, 580, 160, 160); s.restore(); }
    // the rear-view mirror: where a face should be, a plane flies
    stroke([[960, 40], [962, 112]], 101, 3, { force: true, col: hsl(250, 10, 14) });
    part([[810, 118], [1110, 112], [1116, 196], [814, 204]], { fill: hsl(250, 10, 16), seed: 102, extra: (Fm) => {
      s.fillStyle = vgrad(110, 210, [[0, hsl(205, 30, 76)], [1, hsl(30, 45, 84)]]); s.fillRect(800, 100, 330, 120);
      part(lump(900 + (t - 304) * 12, 150, 50, 12, 103), { fill: hsl(35, 30, 95), seed: 104 });
      plane(1080 - (t - 304.3) * 34, 160 + snoise(t * .5, 105) * 6, .48, Math.PI + .05, { seed: 106, flip: true });
    } });
    part([[820, 124], [1104, 119], [1108, 132], [822, 138]], { fill: hsl(0, 0, 100, .18), seed: 107, wob: .5 });
    { const sw = Math.sin(t * 2.1) * .25 + snoise(t * .7, 108) * .15; stroke([[960, 204], [960 + Math.sin(sw) * 70, 204 + Math.cos(sw) * 70]], 109, .5, { force: true, col: hsl(40, 20, 80) });
      plane(960 + Math.sin(sw) * 90, 204 + Math.cos(sw) * 90, .5, Math.PI / 2 + sw, { seed: 109.5, fill: hsl(140, 45, 62), shade: hsl(150, 40, 46) }); }
    // driver: dark, anonymous, seen from behind
    part([[300, 1300], [290, 620], [330, 580], [700, 570], [760, 620], [770, 1300]], { fill: hsl(255, 12, 32), shade: hsl(250, 12, 24), shadeShift: [-30, 0], seed: 110, hi: hsl(28, 60, 66, .7) });
    withT(() => { s.translate(530 + snoise(t * .3, 111) * 6, 430); s.scale(1.5, 1.5);
      part(lump(0, 0, 44, 58, 112, 12), { fill: hsl(20, 18, 16), shade: hsl(20, 18, 10), shadeShift: [10, -8], seed: 113 });
      part([[-48, 6], [-58, 2], [-60, 18], [-50, 26]], { fill: C('skin', -8), seed: 114, seg: 3 }); });
    part([[420, 500], [640, 496], [650, 590], [410, 596]], { fill: hsl(230, 14, 27), shade: hsl(230, 14, 19), shadeShift: [-10, 0], seed: 115 });
    // v4: the anchorman, from behind, juggles his own head (still talking), his right forearm and a shoe
    const q = (a, b) => smooth(inv(a, b, t));
    const jug = q(304.55, 304.9) * (1 - q(309.55, 309.95)), ph = (t - 304.6) * 1.55;
    const pose = {
      style: CAST.commuter, x: 1340 + snoise(t * .25, 120) * 8, y: 900, sc: 1.32, seed: 300, back: true, light: [-10, -8], breath: breathAt(t),
      lean: -.04 + snoise(t * .3, 121) * .03, tilt: 0, twist: 0, mouth: mouthAt(t), blink: blinkAt(t, 21), brow: .4, turn: 0, nod: 0,
      armL: [lerp(-1.4, -1.95, jug), lerp(.3, -.85, jug) + Math.sin(ph * TAU) * .22 * jug, .2, .7, 1], armR: [.3, -.3, 0, .4, 1], flipL: true,
      det: jug > .01 ? { head: [0, 0, 0, 1, true, false], armR: [0, 0, 0, 1e-3] } : {},
    };
    const J = person({ ...pose, parts: 'body', armsBehind: true });
    if (jug > .01 && J.armL) {
      const g = geomOf(pose), hw = g.w(J.armL.wr), neck = g.w(g.hc), items = ['head', 'arm', 'shoe'];
      items.forEach((it, k) => {
        let u = ((ph + k / 3) % 1 + 1) % 1, x = hw[0] + Math.sin(u * TAU) * 70, y = hw[1] - 40 - Math.sin(u * Math.PI) * 300, r = u * TAU * (k === 1 ? 1 : .5);
        if (it === 'head') { const back = 1 - jug; x = lerp(x, neck[0], back); y = lerp(y, neck[1], back); r *= jug; looseHead(x, y, r * .4, pose.sc, { ...pose, back: false, turn: Math.sin(t * 1.3) * .3 }); }
        else if (it === 'arm') looseForearm(x, y, r + 1, pose.sc * jug + .001, pose, 1, .5 + .5 * Math.sin(t * 6));
        else withT(() => { s.translate(x, y); s.rotate(r); s.scale(pose.sc * jug, pose.sc * jug); part([[-26, -14], [10, -16], [34, -2], [36, 12], [-26, 12]], { fill: C.call(null, 'shoe'), shade: hsl(20, 18, 10), shadeShift: [4, -4], seed: 340, inkW: .9 }); });
      });
    }
    part([[1258, 482], [1418, 476], [1430, 578], [1248, 586]], { fill: hsl(230, 14, 28), shade: hsl(230, 14, 20), shadeShift: [-10, 0], seed: 131, sharp: 30 });
    part([[1230, 1300], [1110, 640], [1150, 580], [1530, 570], [1570, 640], [1490, 1300]], { fill: hsl(255, 12, 33), shade: hsl(250, 12, 25), shadeShift: [-30, 0], seed: 130, hi: hsl(28, 60, 66, .7) });
    s.restore();
  });
}

// ---------------- C: floating up at dusk (scratchy) ----------------
function shotFloat(t, tt, len) {
  T = t; HAND = HANDS.scratch; HUE = Math.sin(t * .11) * 8 - tt * 6;
  const pk = hit(t, 312.47, 2.2) + hit(t, 313.5, 2.6) * .8;             // the bed's low groans peel the layers
  REGK = 1 + pk * 5;
  fx({ acid: .5, peel: pk * .9, warp: 1.4 + pk });
  const rise = Math.pow(smooth(inv(310.9, 314.4, t)), 1.4) * 330;
  withT(() => {
    cam(960 + snoise(t * .2, 2) * 12, 600 - rise * .9 - tt * 6, 1.0 + tt * .012, -.03 + snoise(t * .14, 6) * .015);
    s.fillStyle = vgrad(-500, 820, [[0, hsl(232, 30, 30)], [.55, hsl(280, 22, 50)], [.85, hsl(20, 50, 66)], [1, hsl(38, 60, 76)]]); s.fillRect(-400, -700, 2800, 1600);
    // one continuous spiral cloud forming overhead, slowly turning, a tiny plane glinting at its centre
    const pc = smooth(inv(310.0, 312.6, t));
    withT(() => { s.translate(560 + tt * 18, 190 - rise * .1);
      spiralCloud(lerp(150, 230, pc), t * .12, pc, 400, { fill: hsl(25, 38, 86, .92), shade: hsl(300, 18, 66, .85) });
      const g = pc * (.6 + .4 * Math.sin(t * 5)); plane(0, 0, .3, t * .12 + 1.2, { seed: 405, fill: hsl(45, 70, 96), alpha: pc });
      s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(0, 0, 1, 40, [[0, hsl(45, 90, 90, .7 * g)], [1, hsl(45, 90, 80, 0)]]); s.fillRect(-50, -50, 100, 100); s.restore(); });
    for (let i = 0; i < 3; i++) { const r = rng(420 + i); part(lump(1300 + r() * 600 - tt * 10, 80 + r() * 300, 140, 34, 421 + i), { fill: hsl(300, 20, 64, .7), shade: hsl(260, 18, 48, .7), shadeShift: [0, -10], seed: 425 + i, inkW: .5, hatch: false }); }
    // power lines and poles
    for (const [px, ph] of [[220, 300], [1650, 360]]) { stroke([[px, 830], [px + 4, ph]], 430 + px, 2.4); stroke([[px - 50, ph + 20], [px + 54, ph + 18]], 431 + px, 1.6); }
    for (let k = 0; k < 3; k++) { const P = []; for (let i = 0; i <= 12; i++) { const u = i / 12, x = lerp(170 + k * 50, 1600 + k * 50, u); P.push([x, lerp(320, 378, u) + k * 6 + Math.sin(u * Math.PI) * 70 + snoise(t * .3 + u, 440 + k) * 6]); } stroke(P, 440 + k, .6); }
    // ground: an empty lot by the highway
    part([[-400, 800], [500, 790], [1200, 805], [2400, 795], [2400, 1500], [-400, 1500]], { fill: hsl(30, 16, 36), shade: hsl(25, 18, 27), shadeShift: [0, -40], seed: 450 });
    stroke([[-300, 860], [600, 846], [1400, 858], [2300, 848]], 451, 1.1);
    for (let i = 0; i < 9; i++) stroke([[-200 + i * 300, 1000 + (i % 2) * 40], [-120 + i * 300, 998 + (i % 2) * 40]], 452 + i, .7);
    part([[1400, 830], [1430, 640], [1490, 640], [1520, 830]], { fill: hsl(210, 10, 46), shade: hsl(210, 10, 34), shadeShift: [10, 0], seed: 460, sharp: 30 });           // a distant road sign, blank
    stroke([[1460, 830], [1462, 900]], 461, 1.2);
    // her shadow, left on the ground
    const fy = 960;
    s.save(); s.globalAlpha = .45 * (1 - rise / 420); part(lump(960, fy + 6, 120 * (1 - rise / 700), 18, 470, 10), { fill: hsl(260, 25, 18), seed: 471, ink: false, hatch: false }); s.restore();
    const q = (a, b) => smooth(inv(a, b, t)), out = q(310.6, 313.6), hang = q(310.9, 312.4), SC = .95;
    const FP = {
      style: CAST.commuter, x: 960 + snoise(t * .3, 480) * 10, y: fy - 372 * SC - rise + Math.sin(t * 1.6) * 3 * hang, sc: SC, seed: 500, light: [-10, -8],
      breath: breathAt(t), lean: snoise(t * .25, 481) * .03, tilt: snoise(t * .3, 482) * .05 - out * .04, turn: -.1 + snoise(t * .2, 483) * .08,
      nod: -out * .5, mouth: 0, blink: blinkAt(t, 3), brow: .3 + out * .6 + earBusy(t) * .5, hem: 4 + rise * .1, twist: -.1,
      armL: [lerp(-.12, -.62, out) + snoise(t * .4, 484) * .04, lerp(.12, -.18, out), lerp(0, -.5, out), .3 + out * .5, 1],
      armR: [lerp(.12, .6, out) + snoise(t * .4, 485) * .04, lerp(-.12, .2, out), lerp(0, .5, out), .3 + out * .5, 1], flipL: false, flipR: true,
      legs: [lerp(.04, .08, hang) + snoise(t * .5, 486) * .04 * hang, lerp(0, -.14, hang), lerp(-.04, -.02, hang) + snoise(t * .5, 487) * .05 * hang, lerp(0, -.22, hang)],
      footDown: hang > .5, armsBehind: false,
    };
    FP.det = earDet(t, FP);
    person(FP);
    // a streetlamp coming on
    stroke([[1780, 840], [1786, 420], [1720, 400]], 490, 2.2);
    s.save(); s.globalCompositeOperation = 'screen'; s.fillStyle = rgrad(1716, 412, 4, 260, [[0, hsl(45, 80, 72, .6)], [1, hsl(40, 80, 60, 0)]]); s.fillRect(1400, 100, 700, 700); s.restore();
  });
}

// ---------------- D: the quantum thing (clean line, going acid) ----------------
function poseD(t) {
  const q = (a, b) => smooth(inv(a, b, t)), up = q(314.0, 314.7), murk = env(t, 314.7, 315.5, .3), qn = env(t, 315.8, 317.0, .3), right = q(317.6, 318.0);
  const wag = Math.sin((t - 314.7) * TAU * 1.6) * murk;
  return {
    style: CAST.commuter, x: 1000 + snoise(t * .25, 600) * 14, y: 1760, sc: 3.3, seed: 700, light: [12, -6], breath: breathAt(t), inkK: .45, wobK: .4, detail: true,
    lean: .03 + snoise(t * .3, 601) * .03 + qn * .04, tilt: snoise(t * .35, 602) * .05 + murk * .06 - right * .06, turn: -.25 + snoise(t * .25, 603) * .1 + qn * .2 - right * .1,
    nod: snoise(t * .5, 604) * .3, mouth: mouthAt(t), blink: blinkAt(t, 4), brow: .3 + qn * .7 + right * .6, twist: -.15, shrug: right * 12,
    armL: [lerp(-.05, -.45, up), lerp(.5, 3.0, up) + wag * .25 + qn * .3, wag * .5 + qn * .2, .35 + qn * .5, 1], armR: [.1, -.2, 0, .3, 1], flipL: true,
  };
}
function shotQuantum(t, tt, len) {
  // rebuilt: a fine pen for the close-up, skin kept skin-coloured, the ghosts drawn as whole figures on
  // their own layers (so they never muddy each other), and on "right?" they collapse back into one.
  T = t; HAND = HANDS.fine; HUE = Math.sin(t * .11) * 5;
  const qn = smooth(inv(315.8, 316.5, t)) * (1 - smooth(inv(317.55, 317.85, t))), snap = hit(t, 317.82, 5);
  REGK = 1 + qn * .8;
  fx({ acid: .3, acidMirror: .15 * qn, warp: 1.1 + qn * .8, flash: snap * .25 });
  withT(() => {
    cam(980 + snoise(t * .2, 2) * 16, 520 + snoise(t * .17, 4) * 12, 1 + tt * .02, snoise(t * .15, 6) * .02 + qn * .03 * Math.sin(t * .9));
    // the diner wall dissolving into slow rings around her head, pale and flat (no outlines)
    fill(hsl(170, 22, 62));
    for (let i = 8; i >= 0; i--) { const R = 150 + i * 130 + ((t * 40) % 130); part(lump(1010, 400, R * 1.25, R, 620 + i, 18), { fill: hsl(170 + i * 14 * qn + i * 5, 24 + qn * 8, 58 + (i % 2) * 7), seed: 630 + i, ink: false, wob: 3, tone2: false }); }
    if (snap > .02) { s.save(); s.globalAlpha = snap; s.strokeStyle = hsl(45, 80, 92); s.lineWidth = 6; s.beginPath(); s.arc(1010, 420, 120 + (1 - snap) * 900, 0, TAU); s.stroke(); s.restore(); }
    // probability ghosts: the same gesture a little earlier and later, each a tinted whole figure
    const NG = 4, tints = [hsl(190, 70, 60), hsl(320, 60, 66), hsl(45, 80, 62), hsl(260, 50, 66)];
    if (qn > .01) for (let k = NG; k >= 1; k--) {
      const dt = (k - (NG + 1) / 2) * .3 * qn, P = poseD(t + dt);
      P.x += (k - 2.5) * 170 * qn + snoise(t * .4, 670 + k) * 30 * qn; P.y += snoise(t * .35, 680 + k) * 40 * qn; P.seed = 700 + k * 50;
      layer(.32 * qn, () => person(P), tints[k - 1].replace(/,1\)$/, ',.45)'));
    }
    person(poseD(t));
  });
}



// v4 (the lot): his forearms come off and go in one ear and out the other. Each one flies up to an ear
// (elbow-ball first), shrinks into it, comes out of the other ear growing back, and returns to its elbow.
const EARRUNS = [{ key: 'armL', t0: 310.55, into: 1 }, { key: 'armR', t0: 311.75, into: -1 }];
const earBusy = (t) => EARRUNS.reduce((m, r) => Math.max(m, env(t, r.t0, r.t0 + 2.3, .2)), 0);
function earDet(t, P) {
  const g = geomOf(P), d = {};
  for (const r of EARRUNS) {
    const u = t - r.t0; if (u <= 0 || u >= 2.4) continue;
    const el = r.key === 'armL' ? g.elL : g.elR, earIn = [g.hc[0] + r.into * 52, g.hc[1] - 4], earOut = [g.hc[0] - r.into * 52, g.hc[1] - 4];
    const out1 = [earIn[0] + r.into * 150, earIn[1] - 60], out2 = [earOut[0] - r.into * 150, earOut[1] - 40];
    let p, rot, k;
    if (u < .8) { const e = ease.inOut(u / .8); p = [lerp(el[0], out1[0], e), lerp(el[1], out1[1], e) - Math.sin(e * Math.PI) * 120]; rot = -r.into * Math.PI / 2 * e; k = 1; }
    else if (u < 1.2) { const e = ease.in((u - .8) / .4); p = [lerp(out1[0], earIn[0], e), lerp(out1[1], earIn[1], e)]; rot = -r.into * Math.PI / 2; k = lerp(1, .05, e); }
    else if (u < 1.7) { const e = ease.out((u - 1.2) / .5); p = [lerp(earOut[0], out2[0], e), lerp(earOut[1], out2[1], e)]; rot = r.into * Math.PI / 2; k = lerp(.05, 1, e); }
    else { const e = ease.inOut((u - 1.7) / .7); p = [lerp(out2[0], el[0], e), lerp(out2[1], el[1], e) - Math.sin(e * Math.PI) * 60]; rot = lerp(r.into * Math.PI / 2, 0, e); k = 1; }
    d[r.key] = [p[0] - el[0], p[1] - el[1], rot, k];
  }
  return d;
}
