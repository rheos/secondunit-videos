// 268.4-300.1 (outro; "In her dream" ~276.2, again ~284-291). The WAKING kitchen of 01, exactly:
// the reunion's last warm circle is the lamp bulb. She is asleep on her arms; she lifts her head (~272),
// the chairs are empty, the bills are still there. On the refrain she notices the one paper orange on the
// table, the only colour in the room; she picks it up, holds it, tilts her head and smiles.
// Slow push in; the lamp warms a little; main.js fades the film to black from 291.
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

// her seated body (from 01), plus an optional closed-eye crescent drawn on the head
const BODICE = blob([[0, -806], [-24, -804], [-50, -790], [-62, -768], [-64, -730], [-62, -680], [-52, -620], [-46, -580],
  [-60, -530], [-70, -480], [-56, -440], [30, -440], [58, -500], [44, -580], [52, -630], [70, -676], [68, -712], [56, -750], [40, -784], [22, -804]]
  .map(([x, y]) => [x, y + 540]), .45);
const LAP = blob([[-62, -80], [10, -78], [70, -58], [160, -44], [262, -40], [300, -6], [304, 80], [300, 158], [262, 168], [214, 162],
  [150, 96], [60, 64], [-40, 56], [-74, 20]], .5);
function sitter(x, y, s, col, p, layer) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (layer !== 'front') {
    g.save(); g.translate(-8, 0); leg(1.5, 1.42, col, null, false); g.restore();
    g.save(); g.translate(8, 0); leg(1.56, 1.5, col, null, false); g.restore();
    g.save(); g.rotate(p.lean); g.translate(-8, -212); arm(p.far[0], p.far[1], col, p.holdFar); g.restore();
    cut(LAP, col, { sh: .6, grain: .26, lift: .2 });
    g.save(); g.rotate(p.lean); cut(BODICE, col, { sh: .6, grain: .26, lift: .2 }); g.restore();
  }
  if (layer !== 'back') {
    g.save(); g.rotate(p.lean);
    g.save(); g.translate(10, -250); head('her', null, col, .265, p.head || 0, 0);
    if (p.eye > 0) {        // a small closed, smiling eye cut out of the head (the 04 crescent)
      g.rotate(-(p.head || 0) * .9); g.scale(.265, .265); g.translate(-580, -800);
      g.globalAlpha *= p.eye; g.strokeStyle = p.eyeCol; g.lineWidth = 15; g.lineCap = 'round';
      g.beginPath(); g.arc(690, 436, 34, Math.PI * .14, Math.PI * .86); g.stroke();
    }
    g.restore();
    g.translate(8, -212); arm(p.near[0], p.near[1], col, p.holdNear);
    g.restore();
  }
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
function bill(w, h, col, line) {
  cut(cutRect(-w / 2, -h / 2, w, h, w * 3.1, 1.2), col, { sh: .45, grain: .12 });
  g.save(); g.strokeStyle = line; g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-w / 2 + 8, -h / 2 + 10 + i * 8); g.lineTo(-w / 2 + 8 + (w - 16) * (i === 2 ? .5 : .85), -h / 2 + 10 + i * 8); g.stroke(); }
  g.beginPath(); g.moveTo(w / 2 - 22, h / 2 - 9); g.lineTo(w / 2 - 8, h / 2 - 9); g.stroke();
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
// her near hand in world space for a lean and arm pose (from 01), and the inverse: an arm pose that
// puts the near hand at a world point (two-link IK in the seated rig's arm space)
function handAt(lean, sh, el) {
  const x = 8 + Math.sin(sh) * 168 + Math.sin(sh + el) * 182, y = -212 + Math.cos(sh) * 168 + Math.cos(sh + el) * 182;
  return [HX + (x * Math.cos(lean) - y * Math.sin(lean)) * S, HY + (x * Math.sin(lean) + y * Math.cos(lean)) * S];
}
function reachTo(lean, wx, wy) {
  const ux = (wx - HX) / S, uy = (wy - HY) / S;
  const lx = ux * Math.cos(-lean) - uy * Math.sin(-lean) - 8, ly = ux * Math.sin(-lean) + uy * Math.cos(-lean) + 212;
  const a1 = 168, a2 = 182; const d = clamp(Math.hypot(lx, ly), 30, a1 + a2 - .5), th = Math.atan2(lx, ly);
  const E = Math.acos(clamp((d * d - a1 * a1 - a2 * a2) / (2 * a1 * a2), -1, 1));
  return [th - Math.atan2(a2 * Math.sin(E), a1 + a2 * Math.cos(E)), E];
}
const PA = [.12, 1.06, .62], PB = [.3, 1.42, .24];
const pileA = handAt(...PA), pileB = handAt(...PB);

// ---------- the moments ----------
const T = { a: 268.4, lift0: 271.5, lift1: 273.3, look: 274.2, notice: 276.2, reach: 277.4, grab: 278.55, raise: 280.3,
  smile: 281.4, refrain2: 284.1 };
const ORANGE = { x: 1030, y: TY - 52, r: 30 };          // on the oilcloth in the lamp's pool, by the bills

// her pose through the outro: [t, lean, head, near arm(or 'reach'), far arm]
const SLEEP = { lean: .62, head: -.55, near: [1.56, .52], far: [1.5, .58] };
const UP = { lean: .1, head: -.12, near: [.55, 1.45], far: [1.0, .62] };   // awake: forearm on the table, hand pulled in

SHOT(T.a, 300.1, 'wake', (t) => {
  const A0 = g.globalAlpha;
  // camera: from 01's framing, a slow push in toward her and the orange
  const cz = eio((t - 270) / 21), Z = lerp(1, 1.42, cz), FX = lerp(960, 860, cz), FY = lerp(540, 560, cz);
  g.save(); g.translate(W / 2, H / 2); g.scale(Z, Z); g.translate(-FX, -FY);

  const warm = ss(T.notice, 288, t);                       // the lamp warms a little once she has it
  room();

  // the lamp's warm light on the wall, a little stronger as she smiles
  const glowR = lerp(300, 360, warm);
  g.save(); g.globalAlpha = A0 * lerp(.5, .66, warm);
  const gr = g.createRadialGradient(LX, GY, 20, LX, GY, glowR);
  gr.addColorStop(0, 'rgba(243,217,160,.85)'); gr.addColorStop(.55, 'rgba(243,217,160,.3)'); gr.addColorStop(1, 'rgba(243,217,160,0)');
  g.fillStyle = gr; g.fill(circle(LX, GY, glowR)); g.restore();
  // cord and shade, the bulb
  g.save(); g.translate(LX, -60); g.rotate(Math.sin(t * .9) * .012); g.translate(-LX, 60);
  cut(cutRect(LX - 3, -200, 6, LSY + 200, 31, .8), C.w0, { sh: .4, grain: 0 });
  cut(poly([[LX - 32, LSY], [LX + 32, LSY], [LX + 100, LSY + 76], [LX - 100, LSY + 76]]), C.w0, { sh: .9, lift: .4 });
  cut(ellipse(LX, LSY + 78, 34, 14), mix(C.lamp, C.lampDeep, warm * .5), { sh: 0, grain: .1 });
  g.restore();
  // the light cone onto the table
  g.save(); g.globalAlpha = A0 * lerp(.2, .27, warm);
  const cg = g.createLinearGradient(0, LSY + 78, 0, TY);
  cg.addColorStop(0, 'rgba(243,217,160,.95)'); cg.addColorStop(1, 'rgba(243,217,160,.3)');
  g.fillStyle = cg; g.fill(poly([[LX - 92, LSY + 76], [LX + 92, LSY + 76], [LX + 300, TY], [LX - 300, TY - TB * .2]])); g.restore();

  // ---- her pose ----
  const lift = eio((t - T.lift0) / (T.lift1 - T.lift0));
  let lean = lerp(SLEEP.lean, UP.lean, lift), headA = lerp(SLEEP.head, UP.head, lift);
  let near = [lerp(SLEEP.near[0], UP.near[0], lift), lerp(SLEEP.near[1], UP.near[1], lift)];
  let far = [lerp(SLEEP.far[0], UP.far[0], lift), lerp(SLEEP.far[1], UP.far[1], lift)];
  // asleep: breathing
  const breath = Math.sin((t - T.a) * Math.PI * 2 / 4.2) * .012 * (1 - lift);
  lean += breath; headA -= breath * .5;
  // awake: she looks up along the empty table, then down to the orange on "In her dream"
  headA += .1 * ss(T.look, T.look + 1, t) * (1 - ss(T.notice - .3, T.notice + .5, t));
  const lookDown = ss(T.notice - .1, T.notice + .7, t);
  headA -= .2 * lookDown; lean += .06 * lookDown;
  // the reach, the pick-up and the raise: near hand follows a path in world space
  const reachK = eio((t - T.reach) / (T.grab - T.reach)), raiseK = eio((t - T.grab - .25) / (T.raise - T.grab - .25));
  const rest = handAt(lean, near[0], near[1]);
  let hxw = lerp(rest[0], ORANGE.x + 4, reachK), hyw = lerp(rest[1], ORANGE.y + 10, reachK);
  hxw = lerp(hxw, 892, raiseK); hyw = lerp(hyw, 548, raiseK) - Math.sin(raiseK * Math.PI) * 26;
  lean = lean + .3 * bump(t, T.reach, T.grab + .5 - T.reach) - .08 * raiseK;
  if (t > T.reach) near = reachTo(lean, hxw, hyw);
  // holding it: she looks at it, her head tilts, she smiles
  const look = ss(T.raise - .6, T.raise + .4, t);
  headA = lerp(headA, -.06, look);
  const tilt = ss(T.smile, T.smile + 1.4, t);
  headA += .12 * tilt + Math.sin((t - T.smile) * 1.1) * .015 * tilt;
  lean -= .03 * tilt;
  // second refrain: she draws it in toward her
  const draw = eio((t - T.refrain2) / 3.2);
  if (t > T.refrain2) near = reachTo(lean, lerp(892, 860, draw), lerp(548, 590, draw));
  const eye = ss(T.smile + .2, T.smile + 1.2, t);

  // the orange: on the table, then in her hand (drawn at the hand, kept upright)
  const held = t >= T.grab;
  const holdNear = held ? () => {
    g.save(); g.rotate(near[0] + near[1] - lean); g.scale(1 / S, 1 / S); g.translate(-4, -10);
    orange(0, 0, ORANGE.r); g.restore();
  } : null;

  chair(HX, C.w0);
  sitter(HX, HY, S, C.w1, { lean, head: headA, near, far }, 'back');

  // the table and oilcloth (01)
  cut(cutRect(TX0 + 40, TY, 30, FLOOR - TY, 51), C.w0, { sh: .5 });
  cut(poly([[TX0 + 30, TY - TB], [TX1, TY - TB], [TX1, TY], [TX0, TY]]), C.w4, { sh: .5, grain: .2 });
  cut(cutRect(TX0 - 6, TY - 2, TX1 - TX0, 118, 52, 1.5), C.w3, { sh: .8, lift: .3 });

  // the empty chairs, pulled out on the near side, facing her
  chair(1400, C.w0, -1); chair(1700, C.w0, -1);

  // the bills where she left them at the end of 01, and the cold cup
  const flat = (x, y, r) => { g.save(); g.translate(x, y); g.rotate(r); g.scale(1, .42); bill(70, 50, C.w4, C.w3); g.restore(); };
  flat(pileA[0] - 14, TY - 22, .05); flat(pileA[0] - 6, TY - 27, -.07); flat(pileA[0] + 34, TY - 18, .1);
  flat(pileB[0] + 30, TY - 30, .04); flat(pileB[0] + 30, TY - 34, (hash(4) - .5) * .2); flat(pileB[0] + 34, TY - 37, (hash(5) - .5) * .2);
  cup(1300, TY - 26, 1.3, C.w3);
  if (!held) orange(ORANGE.x, ORANGE.y, ORANGE.r);

  const eyeCol = mix(C.w3, C.lamp, .45);
  sitter(HX, HY, S, C.w1, { lean, head: headA, near, far, holdNear, eye, eyeCol }, 'front');
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
