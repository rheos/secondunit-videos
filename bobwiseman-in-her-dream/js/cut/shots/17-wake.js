// 268.4-300.1 (outro; "In her dream" 276.2-283.8, again 284.8-291). The WAKING kitchen of 01, exactly:
// the reunion's last warm circle is the lamp bulb. She is asleep, head down on her folded arms, as 01
// ends; her cupped hands are closed over something. She lifts her head (~272) and looks along the
// table at each empty chair on the beats (273.36, 274.8). On "In" her hands open: the one paper orange,
// the only colour in the room; on "dream" (277.1) she looks down at it and the lamp warms. She picks it
// up and holds it to the light, tilts her head and smiles (the knowing crescent eye, the dream's joy
// sign, the one exception in the waking world). Second refrain: she draws it in to her cheek, landing
// on its "dream" (286.7), and the lamp blooms once. The camera pushes in to her hands and the orange
// (~2.5x by 291) and keeps creeping to the end; main.js fades to black as the mix dies (290.5-295.4).
// The set geometry and the seated rig are copied from 01-kitchen.js (keep them in step with it).
(() => {
// ---------- set geometry (from 01-kitchen.js) ----------
const S = .78, FLOOR = 1000;
const HX = 700, HY = FLOOR - 270 * S;
const TY = 738, TB = 72, TX0 = 796, TX1 = 2600;
const LX = 1000, LSY = 236;
const GY = LSY + 150;

const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => { k = clamp(k); const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };

// a smooth monotone curve through keys [[t, v], ...] (Fritsch-Carlson), flat outside: camera moves
// that never stop dead between keys
function curve(keys) {
  const n = keys.length, d = [], m = [];
  for (let i = 0; i < n - 1; i++) d.push((keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]));
  for (let i = 0; i < n; i++) m.push(i === 0 || i === n - 1 ? 0 : (d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) { if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; } }
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1]; if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (t > keys[i + 1][0]) i++;
    const h = keys[i + 1][0] - keys[i][0], u = (t - keys[i][0]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * keys[i][1] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * keys[i + 1][1] + (u3 - u2) * h * m[i + 1];
  };
}

// her seated body and rig (from 01, incl. the far arm laid over the tabletop when farFront)
const BODICE = blob([[0, -806], [-24, -804], [-50, -790], [-62, -768], [-64, -730], [-62, -680], [-52, -620], [-46, -580],
  [-60, -540], [-48, -510], [36, -510], [56, -545], [44, -580], [52, -630], [70, -676], [68, -712], [56, -750], [40, -784], [22, -804]]
  .map(([x, y]) => [x, y + 540]), .45);
const LAP = blob([[-52, -74], [10, -78], [70, -58], [160, -44], [262, -40], [300, -6], [304, 80], [300, 158], [262, 168], [214, 162],
  [150, 96], [60, 64], [-30, 54], [-60, 18]], .5);
function sitter(x, y, s, col, p, layer) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (layer !== 'front') {
    g.save(); g.translate(-8, 0); leg(1.5, 1.42, col, null, false); g.restore();
    g.save(); g.translate(8, 0); leg(1.56, 1.5, col, null, false); g.restore();
    if (!p.farFront) { g.save(); g.rotate(p.lean); g.translate(-8, -212); arm(p.far[0], p.far[1], col, p.holdFar); g.restore(); }
    cut(LAP, col, { sh: .6, grain: .26, lift: .2 });
    g.save(); g.rotate(p.lean); cut(BODICE, col, { sh: .6, grain: .26, lift: .2 }); g.restore();
  }
  if (layer !== 'back') {
    g.save(); g.rotate(p.lean);
    if (p.farFront) {      // 17: the far arm never shows in front of the oilcloth's hanging front (it is behind it)
      g.save(); g.rotate(-p.lean); g.scale(1 / s, 1 / s); g.translate(-x, -y);
      const cl = new Path2D(); cl.rect(-3000, -3000, 9000, 9000); cl.rect(TX0 - 6, TY - 1, TX1 - TX0, 400); g.clip(cl, 'evenodd');
      g.translate(x, y); g.scale(s, s); g.rotate(p.lean); g.translate(-8, -212); arm(p.far[0], p.far[1], col, p.holdFar); g.restore(); }
    if (p.postFar) { g.save(); g.rotate(-p.lean); g.scale(1 / s, 1 / s); g.translate(-x, -y); p.postFar(); g.restore(); }
    g.save(); g.translate(10, -250); head('her', null, col, .265, p.head || 0, 0);
    if (p.eye > 0) {        // a small closed, smiling eye cut out of the head (the 04 crescent)
      g.rotate(-(p.head || 0) * .9); g.scale(.265, .265); g.translate(-580, -800);
      g.globalAlpha *= p.eye; g.strokeStyle = p.eyeCol; g.lineWidth = 15; g.lineCap = 'round';
      g.beginPath(); g.arc(690, 436, 34, Math.PI * .14, Math.PI * .86); g.stroke();
    }
    g.restore();
    if (p.preNear) { g.save(); g.rotate(-p.lean); g.scale(1 / s, 1 / s); g.translate(-x, -y); p.preNear(); g.restore(); }
    g.translate(8, -212); arm(p.near[0], p.near[1], col, p.holdNear);
    g.restore();
  }
  g.restore();
}
// world point of a hip-local point for a lean
const W_ = (lean, x, y) => [HX + (x * Math.cos(lean) - y * Math.sin(lean)) * S, HY + (x * Math.sin(lean) + y * Math.cos(lean)) * S];
// an arm pose [sh, el] that puts the hand point (01's handAt) at a world point; side = 8 near, -8 far
function reachTo(lean, wx, wy, side = 8, neg = false) {
  const ux = (wx - HX) / S, uy = (wy - HY) / S;
  const lx = ux * Math.cos(-lean) - uy * Math.sin(-lean) - side, ly = ux * Math.sin(-lean) + uy * Math.cos(-lean) + 212;
  const a1 = 168, a2 = 182; const d = clamp(Math.hypot(lx, ly), 30, a1 + a2 - .5), th = Math.atan2(lx, ly);
  const E = Math.acos(clamp((d * d - a1 * a1 - a2 * a2) / (2 * a1 * a2), -1, 1));
  return neg ? [th + Math.atan2(a2 * Math.sin(E), a1 + a2 * Math.cos(E)), -E] : [th - Math.atan2(a2 * Math.sin(E), a1 + a2 * Math.cos(E)), E];
}
const lerp2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
// one more bill, tented over the orange (01's bills became birds in the dream; this one hides what the
// dream left behind). k = 0 tented on the table, 1 lying flat; drawn about its centre-bottom (x, y)
function tentBill(x, y, k, rot) {
  g.save(); g.translate(x, y); g.rotate(rot);
  // a soft dome: the top follows the orange's curve, the sides fall slack to the table, a little wave at the hem
  const f = lerp(1, .12, k), R = 35, cy = -66 + R;    // 66 = 1.1x the orange's height
  const pts = [[-66, 2], [-58, -3], [-50, -1], [-43, -9]];
  for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.12 + i * .76 / 8); pts.push([4 + Math.cos(a) * (R + 2), cy + Math.sin(a) * (R + 2)]); }
  pts.push([47, -9], [54, -2], [61, -4], [68, 2], [34, 6], [0, 4], [-34, 6]);
  const p = blob(pts.map(([px, py]) => [px * lerp(1, .85, k), py * f]), .5);
  g.save(); g.translate(4, 6); g.fillStyle = 'rgba(20,16,30,.3)'; g.fill(p); g.restore();
  cut(p, C.w4, { sh: .45, grain: .14, lift: .1 });
  // the printed lines bend over the dome; a soft shadow on its far flank
  g.save(); g.clip(p); g.scale(lerp(1, .85, k), f); g.strokeStyle = C.w3; g.lineWidth = 3; g.lineCap = 'round';
  // rows of print like billHard's, left-aligned and only slightly bowed by the dome (concentric arcs read as a wifi sign)
  [[-46, 34, 4], [-34, 50, 5], [-22, 58, 4], [-10, 30, 3]].forEach(([ly, len, bow]) => { const x0 = -30; g.beginPath(); g.moveTo(x0, ly + bow * .4); g.quadraticCurveTo(x0 + len / 2, ly - bow, x0 + len, ly + bow * .2); g.stroke(); });
  g.globalAlpha *= .15 * (1 - k); g.fillStyle = '#141c3d'; g.beginPath(); g.ellipse(26, -16, 30, 22, -.6, 0, Math.PI * 2); g.fill();
  g.restore();
  g.restore();
}
function chair(x, col, face = 1) {
  const y = HY + 22;
  g.save(); g.translate(x, 0); g.scale(face, 1); g.translate(-x, 0);
  cut(cutRect(x - 96, y - 250, 18, 250 + FLOOR - y, 41, 1.5), col, { sh: .6 });
  cut(cutRect(x - 96, y - 250, 60, 16, 42, 1.5), col, { sh: .5 });
  cut(cutRect(x - 96, y - 150, 50, 12, 43, 1.5), col, { sh: .5 });
  cut(cutRect(x + 70, y, 16, FLOOR - y, 44, 1.5), col, { sh: .6 });
  cut(cutRect(x - 100, y - 8, 190, 18, 45, 1.5), col, { sh: .7 });
  g.restore();
}
// one bill (01's billHard): a sheet with grey lines (no readable text) and a hard little shadow
function billHard(w, h, col, line, sh = 1) {
  const p = cutRect(-w / 2, -h / 2, w, h, w * 3.1, 1.2);
  if (sh > 0) { g.save(); g.translate(4, 5); g.fillStyle = `rgba(20,16,30,${.34 * sh})`; g.fill(p); g.restore(); }
  cut(p, col, { sh: .3, grain: .12 });
  g.save(); g.strokeStyle = line; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const y = -h / 2 + 12 + i * 11; g.beginPath(); g.moveTo(-w / 2 + 10, y); g.lineTo(-w / 2 + 10 + (w - 20) * (i === 3 ? .45 : i === 0 ? .6 : .85), y); g.stroke(); }
  g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2 - 30, h / 2 - 12); g.lineTo(w / 2 - 10, h / 2 - 12); g.stroke();
  g.restore();
}
function drawing(x, y, paper, ink, sun) {
  cut(cutRect(x, y, 118, 146, 61, 2), paper, { sh: .6, grain: .2 });
  cut(circle(x + 59, y + 6, 5), ink, { sh: .3, grain: 0 });
  g.save(); g.lineCap = 'round'; g.strokeStyle = sun; g.lineWidth = 4;
  g.beginPath(); g.arc(x + 82, y + 38, 14, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(x + 82 + Math.cos(a) * 20, y + 38 + Math.sin(a) * 20); g.lineTo(x + 82 + Math.cos(a) * 27, y + 38 + Math.sin(a) * 27); g.stroke(); }
  g.strokeStyle = ink; g.lineWidth = 3.4;
  g.beginPath(); g.moveTo(x + 10, y + 126); g.lineTo(x + 108, y + 124); g.stroke();
  [[24, 52], [48, 36], [66, 30], [84, 22]].forEach(([fx0, h]) => { const fx = x + fx0;
    g.beginPath(); g.moveTo(fx - 7, y + 124); g.lineTo(fx, y + 124 - h); g.lineTo(fx + 7, y + 124); g.stroke();
    g.beginPath(); g.arc(fx, y + 124 - h - 6, 5.5, 0, Math.PI * 2); g.stroke();
  });
  g.restore();
}
// the waking room (01's room(0))
function room() {
  g.save(); g.fillStyle = C.w2; g.fillRect(-3000, -3000, 9000, 9000); g.restore();
  cut(cutRect(-3000, FLOOR, 9000, 2000, 5, 3), C.w1, { sh: .5 });
  cut(cutRect(-3000, FLOOR - 16, 9000, 18, 6, 2), C.w1, { sh: .4, grain: .15 });
  const wx = 110, wy = 130, ww = 290, wh = 370;
  cut(cutRect(wx - 24, wy - 24, ww + 48, wh + 48, 21, 2), C.w3, { sh: .8, lift: .2 });
  cut(cutRect(wx, wy, ww, wh, 22, 1.5), C.w0, { sh: 0, grain: .3 });
  g.save(); g.clip(rect(wx, wy, ww, wh));
  cut(crescent(wx + 214, wy + 96, 40, .3, -.35), C.w4, { sh: .3, grain: .15 });
  for (let i = 0; i < 5; i++) cut(star4(wx + 40 + hash(i * 3.7) * 250, wy + 30 + hash(i * 8.1) * 330, 5 + hash(i) * 4), C.w3, { sh: 0, grain: 0 });
  g.restore();
  cut(rect(wx + ww / 2 - 8, wy, 16, wh), C.w3, { sh: .5, grain: .12 });
  cut(rect(wx, wy + wh * .42 - 8, ww, 16), C.w3, { sh: .5, grain: .12 });
  cut(cutRect(wx - 40, wy + wh + 18, ww + 80, 22, 23, 2), C.w3, { sh: .7, lift: .2 });
  drawing(486, 214, C.w4, C.w2, C.w2);
}
// where 01 left the bill piles (01's handAt for its two sorting poses)
function handAt(lean, sh, el, side = 8) {
  const x = side + Math.sin(sh) * 168 + Math.sin(sh + el) * 182, y = -212 + Math.cos(sh) * 168 + Math.cos(sh + el) * 182;
  return W_(lean, x, y);
}
const pileA = handAt(.12, 1.06, .62), pileB = handAt(.3, 1.42, .24);

// ---------- the moments ----------
const T = { a: 268.4, slide0: 271.35, slide1: 272.1, lift0: 272.0, lift1: 272.95, chair1: 273.36, chair2: 274.8, open: 276.2, dream: 277.1,
  reach: 277.75, grab: 278.6, raise: 280.3, smile: 281.4, in2: 284.8, dream2: 286.7, end: 300.1 };
const OR = 30;                                       // the orange's radius
// the orange lies at the back of the oilcloth in the lamp's pool, hidden under her head while she sleeps
const ORANGE = { x: 895, y: TY - TB - 4 };
const RAISED = [900, 548], CHEEK = [802, 612];       // held up to the light; drawn in to her cheek
// 01's doze (01-kitchen.js DOZE): head down on forearms folded on the TOP of the table, far arm over the top
const DOZE = { lean: .66, head: -.85, near: [2.0, 3.15], far: [2.2, 2.9 - Math.PI * 2] };
const UP = { lean: .1, head: -.1 }, FAR0 = [1.0, .62];
const FHAND = [ORANGE.x - 84, TY - 10];             // her far forearm at an angle, hand curled loosely at the table edge
const FREST = [ORANGE.x - 64, TY - 50];             // where it settles after moving the bill
const BILLGO = [ORANGE.x + 128, TY - 30];           // where the lifted bill drops, flat
const REST = [ORANGE.x + 4, TY - 12];                 // her near hand once the bill is off (drawn in toward the orange)
const NREST = [ORANGE.x + 76, TY - 28];               // before that: resting flat near the bills (01's sorting reach)
const HELD = [-4, OR * .82];                         // hand point relative to the orange's centre while held

// the camera: hold 01's framing through the seam, drift, then a real push in to her hands and the orange
const camZ = curve([[270, 1], [276.2, 1.07], [282.5, 1.3], [287, 1.85], [291, 2.5], [300, 2.72]]);
const camX = curve([[270, 960], [276.2, 952], [282.5, 887], [287, 872], [291, 866], [300, 862]]);
const camY = curve([[270, 540], [276.2, 548], [282.5, 557], [287, 580], [289, 596], [291, 600], [300, 604]]);

SHOT(T.a, T.end, 'wake', (t) => {
  const A0 = g.globalAlpha;
  const Z = camZ(t), FX = camX(t), FY = camY(t);
  g.save(); g.translate(W / 2, H / 2); g.scale(Z, Z); g.translate(-FX, -FY);

  // the lamp: warms on "dream" (a step with a little overshoot), blooms once on the second "dream"
  const warm = .55 * pop(t, T.dream, .7) + .45 * ss(T.dream2 - .2, T.dream2 + 2.5, t);
  const bloom = bump(t, T.dream2 - .08, 1.6) * (t < T.dream2 + .3 ? 1 : 1) + .6 * bump(t, T.dream - .05, .9);
  room();

  // the lamp's warm light on the wall
  const glowR = lerp(300, 370, warm) + 60 * bloom;
  g.save(); g.globalAlpha = A0 * clamp(lerp(.5, .68, warm) + .2 * bloom);
  const gr = g.createRadialGradient(LX, GY, 20, LX, GY, glowR);
  gr.addColorStop(0, 'rgba(243,217,160,.85)'); gr.addColorStop(.55, 'rgba(243,217,160,.3)'); gr.addColorStop(1, 'rgba(243,217,160,0)');
  g.fillStyle = gr; g.fill(circle(LX, GY, glowR)); g.restore();
  // cord and shade, the bulb (same place and size as draft 1: 16's collapse lands on it)
  g.save(); g.translate(LX, -60); g.rotate(Math.sin(t * .9) * .012); g.translate(-LX, 60);
  cut(cutRect(LX - 3, -200, 6, LSY + 200, 31, .8), C.w0, { sh: .4, grain: 0 });
  cut(poly([[LX - 32, LSY], [LX + 32, LSY], [LX + 100, LSY + 76], [LX - 100, LSY + 76]]), C.w0, { sh: .9, lift: .4 });
  cut(ellipse(LX, LSY + 78, 34, 14), mix(C.lamp, '#fbe7b8', clamp(warm * .6 + bloom * .5)), { sh: 0, grain: .1 });
  g.restore();
  // the light cone onto the table
  g.save(); g.globalAlpha = A0 * clamp(lerp(.2, .29, warm) + .08 * bloom);
  const cg = g.createLinearGradient(0, LSY + 78, 0, TY);
  cg.addColorStop(0, 'rgba(243,217,160,.95)'); cg.addColorStop(1, 'rgba(243,217,160,.3)');
  g.fillStyle = cg; g.fill(poly([[LX - 92, LSY + 76], [LX + 92, LSY + 76], [LX + 300, TY], [LX - 300, TY - TB * .2]])); g.restore();

  // ---- her pose ----
  const lift = eio((t - T.lift0) / (T.lift1 - T.lift0));
  const headUp = eio((t - T.lift0 - .22) / (T.lift1 - T.lift0));       // the head comes up last
  let lean = lerp(DOZE.lean, UP.lean, lift), headA = lerp(DOZE.head, UP.head, headUp);
  // breathing, always: slow and deep asleep (01's compensation keeps head and arms on the table), small awake
  const sleepK = 1 - lift;
  const breath = Math.sin((t - T.a) * Math.PI * 2 / lerp(4.2, 3.4, lift)) * lerp(.006, .014, sleepK);
  lean += breath; headA -= breath * lerp(.5, 1.1, sleepK);
  // she looks along the table at the empty chairs, on the beats; then back, and down to her hands
  const ch1 = pop(t, T.chair1, .45), ch2 = pop(t, T.chair2, .45), back2 = ss(T.open - .35, T.open + .1, t);
  headA += (-.1 * ch1 + .17 * ch2) * (1 - back2);                       // chair 1 nearer (eyes down the table), chair 2 farther
  lean += (.04 * ch1 - .05 * ch2) * (1 - back2);
  const look = pop(t, T.dream, .45);                                     // "dream": she sees it
  headA -= .28 * look * (1 - ss(T.raise - .7, T.raise + .4, t)); lean += .07 * look;

  // ---- the hands (world targets) ----
  // asleep, the orange lies under her head; as she wakes her far hand slides over it and closes on it, and
  // stays there while she sits up and looks round; on "In" it slides off (the reveal); the near hand picks it up
  const open = eio((t - T.open) / .45);
  const reachK = eio((t - T.reach) / (T.grab - T.reach));
  let nearT = lerp2(lerp2(NREST, REST, ss(T.open + .1, T.open + .65, t)), [ORANGE.x + HELD[0], ORANGE.y + HELD[1]], reachK); nearT[1] -= 24 * Math.sin(reachK * Math.PI);
  lean += .05 * bump(t, T.reach, T.grab + .4 - T.reach);
  let op = [ORANGE.x, ORANGE.y];
  if (t >= T.grab) {
    const raiseK = eio((t - T.grab - .15) / (T.raise - T.grab - .15));
    const q = [lerp(ORANGE.x, RAISED[0], raiseK), lerp(ORANGE.y, RAISED[1], raiseK) - Math.sin(raiseK * Math.PI) * 24];
    // second refrain: she draws it in to her cheek, landing on its "dream"
    if (t > T.dream2 - 1.4) { const k = back((t - (T.dream2 - 1.4)) / 1.4); q[0] = lerp(RAISED[0], CHEEK[0], k); q[1] = lerp(RAISED[1], CHEEK[1], k); }
    // she holds it lightly: it rides her breathing and, at the end, the slow sway of her head
    const sway = Math.sin((t - T.dream2) * 1.1) * ss(T.dream2 + .3, T.dream2 + 2, t);
    q[0] += sway * 6; q[1] += Math.sin((t - T.a) * Math.PI * 2 / 3.4) * 2.2 + sway * 2;
    op = q; nearT = [q[0] + HELD[0], q[1] + HELD[1]];
  }
  // holding it: she looks at it, her head tilts, she smiles; on the second refrain her head leans to it
  const lookUp = ss(T.raise - .7, T.raise + .4, t);
  headA = lerp(headA, -.06, lookUp);
  const tilt = ss(T.smile, T.smile + 1.4, t);
  headA += .12 * tilt; lean -= .03 * tilt;
  const toCheek = ss(T.dream2 - 1.2, T.dream2 + .1, t);
  headA -= .2 * toCheek; lean += .06 * toCheek;
  headA += Math.sin((t - T.smile) * 1.05) * .022 * tilt * (1 - toCheek) + Math.sin((t - T.dream2) * 1.1) * .035 * ss(T.dream2 + .3, T.dream2 + 2, t);
  const eye = ss(T.smile + .2, T.smile + 1.2, t);
  const eyeCol = mix(C.w3, C.lamp, .45 + .3 * warm);

  // arm angles: 01's doze angles, then targets
  const dn = [DOZE.near[0] - breath * .9 * sleepK, DOZE.near[1]];
  const nearArmK = eio((t - T.lift0) / (T.lift1 - T.lift0 - .2));
  const near = nearArmK <= 0 ? dn : nearArmK < 1 ? lerp2(dn, reachTo(lean, NREST[0], NREST[1]), nearArmK) : reachTo(lean, nearT[0], nearT[1]);
  const df = [DOZE.far[0] - breath * .9 * sleepK, DOZE.far[1]];
  const slide = eio((t - T.slide0) / (T.slide1 - T.slide0));
  const billK = eio((t - T.open - .12) / .55);
  const billP = [lerp(ORANGE.x, BILLGO[0], billK), lerp(TY - 46, BILLGO[1], billK) - 58 * Math.sin(billK * Math.PI)];
  let far = df;
  if (slide > 0) {
    // "In": she takes the bill's near edge, lifts it off the orange and lays it aside, then her hand settles
    const grabE = [ORANGE.x - 56, TY - 40];
    let fT = lerp2(FHAND, grabE, ss(T.open, T.open + .15, t));
    if (billK > 0) fT = [billP[0] - 56, billP[1] - 10];
    fT = lerp2(fT, FREST, ss(T.open + .65, T.open + 1.1, t));
    const fUp = ss(T.dream2 - 1, T.dream2 + .15, t);                     // second refrain: it cups the orange too
    if (fUp > 0) fT = lerp2(fT, [op[0] + 14, op[1] + OR * .9], fUp);
    far = reachTo(lean, fT[0], fT[1], -8);
    if (slide < 1) far = lerp2(df, far, slide);   // angle blend from the doze (01 winds the far elbow -2pi so it swings down, not up)
  }
  const farFront = true;

  chair(HX, C.w0);
  sitter(HX, HY, S, C.w1, { lean, head: headA, near, far, farFront }, 'back');

  // the table and oilcloth (01)
  cut(cutRect(TX0 + 40, TY, 30, FLOOR - TY, 51), C.w0, { sh: .5 });
  cut(poly([[TX0 + 30, TY - TB], [TX1, TY - TB], [TX1, TY], [TX0, TY]]), C.w4, { sh: .5, grain: .2 });
  cut(cutRect(TX0 - 6, TY - 2, TX1 - TX0, 118, 52, 1.5), C.w3, { sh: .8, lift: .3 });

  // the empty chairs, pulled out on the near side, facing her
  chair(1400, C.w0, -1); chair(1700, C.w0, -1);

  // the bills where she left them at the end of 01, and the cold cup
  // exactly where 01 leaves them: two sorted each side, two carried across, the last one by itself
  const flat = (x, y, r) => { g.save(); g.translate(x, y); g.rotate(r); g.scale(1, .42); billHard(96, 68, C.w4, C.w3, .8); g.restore(); };
  flat(pileA[0] - 14, TY - 22, .05); flat(pileA[0] - 6, TY - 27, -.07); flat(pileB[0] + 30, TY - 30, .04);
  flat(pileB[0] + 30, TY - 34, (hash(4) - .5) * .2); flat(pileB[0] + 34, TY - 37, (hash(5) - .5) * .2); flat(pileA[0] + 86, TY - 16, .1);
  cup(1300, TY - 26, 1.3, C.w3);

  // the orange: one layer, world space, under her head and her near hand (no jump, no swap at the pick-up)
  // before the pick-up it lies under her head and arms; once held it is drawn after her head and under
  // her near hand (at her cheek it sits in front of her face); it never overlaps anything at the switch
  if (t < T.grab) orange(op[0], op[1], OR);
  tentBill(billP[0], billP[1], billK, -.5 * Math.sin(billK * Math.PI) + .06 * billK);
  sitter(HX, HY, S, C.w1, { lean, head: headA, near, far, farFront, eye, eyeCol, preNear: t >= T.grab ? () => orange(op[0], op[1], OR) : null }, 'front');
  g.restore();

  // the room comes up out of the dark around the lamp (the reunion's last warm circle)
  const veil = 1 - ss(T.a, 270.6, t);
  if (veil > 0) {
    sheet(C.w0, veil * .94);
    const bx = W / 2 + (LX - FX) * Z, by = H / 2 + (LSY + 78 - FY) * Z;
    g.save(); g.globalAlpha = A0 * veil * .6;
    const lg = g.createRadialGradient(bx, by, 10, bx, by, 300); lg.addColorStop(0, 'rgba(243,217,160,.75)'); lg.addColorStop(1, 'rgba(243,217,160,0)');
    g.fillStyle = lg; g.fill(circle(bx, by, 300)); g.restore();
    g.save(); g.globalAlpha = A0 * veil; cut(ellipse(bx, by, 34 * Z, 14 * Z), C.lamp, { sh: 0, grain: .1 }); g.restore();
  }
}, { xin: .5, tr: 'fade' });
})();
