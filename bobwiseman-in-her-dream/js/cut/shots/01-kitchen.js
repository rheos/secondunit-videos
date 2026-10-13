// 0-18.5 (intro, instrumental). WAKING WORLD at night: a grey-blue paper kitchen, one pendant lamp.
// She sorts bills, rubs her eyes, folds her arms on the table and rests her head (~9.6 s). She drifts:
// the lamp's warm circle on the wall grows into a paper sun halo, the wall warms from behind her
// outward, the window moon turns gold, and she becomes navy. 02-table opens on this exact frame.
// The set geometry (KIT_*) is duplicated in 02-table.js; keep the two in step.
(() => {
// ---------- shared set geometry (also in 02-table.js) ----------
const S = .78;                 // puppet scale
const FLOOR = 1000;
const HX = 700, HY = FLOOR - 270 * S;        // her hip pivot (seated)
const TY = 738, TB = 72;       // table front edge, depth of the top band (naive perspective)
const TX0 = 796, TX1 = 2600;   // table runs out of frame on the right
const LX = 1000, LSY = 236;    // lamp: x, shade top
const HALO = { x: 985, y: 492, r: 300 };
// beats of the band (no_vocals stem), used for hand moves
const BEAT = (n) => 2.28 + n * .3935;

// ---------- small local helpers ----------
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, k) => { k = clamp(k); const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };

// her seated body, in hip-local units (hips at 0,0; puppet units, y up is negative)
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
    g.save(); g.rotate(p.lean); g.translate(-8, -212); arm(p.far[0], p.far[1], col, p.holdFar); g.restore();
    cut(LAP, col, { sh: .6, grain: .26, lift: .2 });
    g.save(); g.rotate(p.lean); cut(BODICE, col, { sh: .6, grain: .26, lift: .2 }); g.restore();
  }
  if (layer !== 'back') {
    g.save(); g.rotate(p.lean);
    g.save(); g.translate(10, -250); head('her', null, col, .265, p.head || 0, 0); g.restore();
    g.translate(8, -212); arm(p.near[0], p.near[1], col, p.holdNear);
    g.restore();
  }
  g.restore();
}
// a chair seen from the side (she sits on it facing right)
function chair(col) {
  const x = HX, y = HY + 22;
  cut(cutRect(x - 96, y - 250, 18, 250 + FLOOR - y, 41, 1.5), col, { sh: .6 });          // back post to the floor
  cut(cutRect(x - 96, y - 250, 60, 16, 42, 1.5), col, { sh: .5 });                      // top rail
  cut(cutRect(x - 96, y - 150, 50, 12, 43, 1.5), col, { sh: .5 });
  cut(cutRect(x + 70, y, 16, FLOOR - y, 44, 1.5), col, { sh: .6 });                      // front leg
  cut(cutRect(x - 100, y - 8, 190, 18, 45, 1.5), col, { sh: .7 });                      // seat
}
// one bill: a small pale sheet with grey lines (no readable text)
function bill(w, h, col, line) {
  cut(cutRect(-w / 2, -h / 2, w, h, w * 3.1, 1.2), col, { sh: .45, grain: .12 });
  g.save(); g.strokeStyle = line; g.lineWidth = 2.4; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-w / 2 + 8, -h / 2 + 10 + i * 8); g.lineTo(-w / 2 + 8 + (w - 16) * (i === 2 ? .5 : .85), -h / 2 + 10 + i * 8); g.stroke(); }
  g.beginPath(); g.moveTo(w / 2 - 22, h / 2 - 9); g.lineTo(w / 2 - 8, h / 2 - 9); g.stroke();
  g.restore();
}
// the child's drawing pinned to the wall: a sun and four figures (her and three kids), in crayon strokes
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
// the wall, the floor, the window with its moon, the drawing; d = 0 waking, 1 dream
function room(d) {
  const wall = d ? C.rose : C.w2, floor = d ? C.roseDeep : C.w1;
  g.save(); g.fillStyle = wall; g.fillRect(-3000, -3000, 9000, 9000); g.restore();
  cut(cutRect(-3000, FLOOR, 9000, 2000, 5, 3), floor, { sh: .5 });
  cut(cutRect(-3000, FLOOR - 16, 9000, 18, 6, 2), d ? C.roseDark : C.w1, { sh: .4, grain: .15 });
  // window: night panes, a moon, a cross of mullions, a sill
  const wx = 110, wy = 130, ww = 290, wh = 370;
  cut(cutRect(wx - 24, wy - 24, ww + 48, wh + 48, 21, 2), d ? C.cream : C.w3, { sh: .8, lift: .2 });
  cut(cutRect(wx, wy, ww, wh, 22, 1.5), d ? C.sky0 : C.w0, { sh: 0, grain: .3 });
  g.save(); g.clip(rect(wx, wy, ww, wh));
  cut(crescent(wx + 214, wy + 96, 40, .3, -.35), d ? C.gold : C.w4, { sh: .3, grain: .15 });
  for (let i = 0; i < 5; i++) cut(star4(wx + 40 + hash(i * 3.7) * 250, wy + 30 + hash(i * 8.1) * 330, 5 + hash(i) * 4), d ? C.goldPale : C.w3, { sh: 0, grain: 0 });
  g.restore();
  const fr = d ? C.cream : C.w3;
  cut(rect(wx + ww / 2 - 8, wy, 16, wh), fr, { sh: .5, grain: .12 });
  cut(rect(wx, wy + wh * .42 - 8, ww, 16), fr, { sh: .5, grain: .12 });
  cut(cutRect(wx - 40, wy + wh + 18, ww + 80, 22, 23, 2), fr, { sh: .7, lift: .2 });
  drawing(486, 214, d ? C.cream : C.w4, d ? C.roseDark : C.w2, d ? C.gold : C.w2);
}

// where her near hand is (world), for a lean and an arm pose; used to put the bills where she reaches
function handAt(lean, sh, el) {
  const x = 8 + Math.sin(sh) * 168 + Math.sin(sh + el) * 182, y = -212 + Math.cos(sh) * 168 + Math.cos(sh + el) * 182;
  return [HX + (x * Math.cos(lean) - y * Math.sin(lean)) * S, HY + (x * Math.sin(lean) + y * Math.cos(lean)) * S];
}
// her pose keyframes through the intro: [time, lean, head, [nearSh, nearEl]]
// sorting (the hand moves on the beat), a bill held up to read, rubbing her eyes, folding down to sleep
const PA = [.12, 1.06, .62], PB = [.3, 1.42, .24], PL = [.2, 1.32, 1.0];
const POSES = [
  [0, PA[0], -.22, PA.slice(1)], [BEAT(0), PA[0], -.22, PA.slice(1)], [BEAT(1), PL[0], -.14, PL.slice(1)], [BEAT(2), PB[0], -.2, PB.slice(1)],
  [BEAT(3), PA[0], -.22, PA.slice(1)], [BEAT(4), PL[0], -.14, PL.slice(1)], [BEAT(5), PB[0], -.2, PB.slice(1)],
  [BEAT(6), PA[0], -.22, PA.slice(1)], [BEAT(7.4), .02, .04, [.62, 1.78]], [5.9, .02, .04, [.62, 1.78]],
  [6.5, .12, -.2, PA.slice(1)], [7.1, .06, -.2, [1.3, 2.55]], [8.4, .08, -.16, [1.3, 2.55]],
  [9.0, .4, -.3, [1.25, .72]], [9.9, .85, -.3, [2.12, .38]],
];
const pileA = handAt(...PA), pileB = handAt(...PB);

SHOT(0, 18.5, 'kitchen', (t) => {
  const A0 = g.globalAlpha;
  // camera: a slow push in toward her
  const cz = eio(t / 18.5), Z = lerp(1, 1.13, cz), FX = lerp(960, 900, cz), FY = lerp(540, 585, cz);
  g.save(); g.translate(W / 2, H / 2); g.scale(Z, Z); g.translate(-FX, -FY);

  // the drift: everything below is 0 = waking, 1 = dream
  const warmR = 2400 * Math.pow(ss(10.8, 17.6, t), 1.35);              // the rose spreading from behind her
  const haloK = ss(10.2, 16.2, t);                                       // warm circle -> paper sun
  const navyK = ss(13.6, 17.8, t);                                       // her paper, the table
  const lampUp = ei(ss(12.4, 15.4, t));                                  // the lamp is drawn up out of the frame

  // ---- the room, waking, then the dream room cut out of a growing hand-torn circle ----
  room(0);
  if (warmR > 1) {
    g.save();
    const cx = 860, cy = 600, pts = [];
    for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 2; const rr = warmR * (1 + (hash(i * 5.3) - .5) * .07 + Math.sin(a * 3 + t * .4) * .025); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    const torn = blob(pts, .8);
    g.save(); g.shadowColor = 'rgba(20,16,30,.26)'; g.shadowBlur = 18; g.shadowOffsetX = 4; g.shadowOffsetY = 7; g.fillStyle = C.rose; g.fill(torn); g.restore();
    g.clip(torn); room(1);
    g.restore();
  }

  // ---- the lamp's warm light on the wall, which becomes the sun halo ----
  const GY = LSY + 150;
  const glowR = lerp(300, 400, haloK);
  g.save(); g.globalAlpha = A0 * .5 * (1 - haloK);
  const gr = g.createRadialGradient(LX, GY, 20, LX, GY, glowR);
  gr.addColorStop(0, 'rgba(243,217,160,.85)'); gr.addColorStop(.55, 'rgba(243,217,160,.3)'); gr.addColorStop(1, 'rgba(243,217,160,0)');
  g.fillStyle = gr; g.fill(circle(LX, GY, glowR)); g.restore();
  if (haloK > 0) {
    const r = lerp(110, HALO.r, eo(haloK)) + Math.sin(t * .5) * 3;
    const hxk = lerp(LX, HALO.x, haloK), hyk = lerp(GY, HALO.y, haloK);
    cut(circle(hxk, hyk, r + 28), C.goldPale, { sh: .5, grain: .25, alpha: ss(11.8, 15.2, t) });
    cut(circle(hxk, hyk, r), C.sun, { sh: .6, grain: .25, alpha: ss(10.2, 13.2, t) });
  }
  // the pendant lamp, cord and shade; it is drawn up out of the frame as the sun arrives
  g.save();
  const sway = Math.sin(t * .9) * .012 * (1 - lampUp);
  g.translate(LX, -60 - lampUp * 560); g.rotate(sway); g.translate(-LX, 60);
  cut(cutRect(LX - 3, -200, 6, LSY + 200, 31, .8), mix(C.w0, C.roseDark, navyK), { sh: .4, grain: 0 });
  cut(poly([[LX - 32, LSY], [LX + 32, LSY], [LX + 100, LSY + 76], [LX - 100, LSY + 76]]), mix(C.w0, C.roseDark, navyK), { sh: .9, lift: .4 });
  cut(ellipse(LX, LSY + 78, 34, 14), C.lamp, { sh: 0, grain: .1 });
  g.restore();
  // the light cone onto the table
  g.save(); g.globalAlpha = A0 * .2 * (1 - ss(12.4, 14.6, t));
  const cg = g.createLinearGradient(0, LSY + 78, 0, TY);
  cg.addColorStop(0, 'rgba(243,217,160,.95)'); cg.addColorStop(1, 'rgba(243,217,160,.3)');
  g.fillStyle = cg; g.fill(poly([[LX - 92, LSY + 76], [LX + 92, LSY + 76], [LX + 300, TY], [LX - 300, TY - TB * .2]])); g.restore();

  // ---- her ----
  let fk = POSES.length - 1; for (let i = 1; i < POSES.length; i++) if (t < POSES[i][0]) { fk = i - 1; break; }
  const P0 = POSES[fk], P1 = POSES[Math.min(fk + 1, POSES.length - 1)];
  const e = P1 === P0 ? 1 : eio((t - P0[0]) / (P1[0] - P0[0]));
  let lean = lerp(P0[1], P1[1], e), headA = lerp(P0[2], P1[2], e);
  let near = [lerp(P0[3][0], P1[3][0], e), lerp(P0[3][1], P1[3][1], e)];
  if (t > 7.1 && t < 8.4) near[1] += Math.sin((t - 7.1) * 15) * .06 * bump(t, 7.1, 1.3);     // rubbing her eyes
  const breath = Math.sin((t - 9.9) * Math.PI * 2 / 4.2) * .012 * ss(9.9, 10.8, t);
  lean += breath; headA -= breath * .5;
  const far = [lerp(1.0, 2.05, ss(9.0, 9.9, t)), lerp(.62, .42, ss(9.0, 9.9, t))];
  const herCol = mix(C.w1, C.navy, navyK);
  const tableCol = mix(C.w0, C.roseDark, navyK), clothCol = mix(C.w3, C.cream, navyK), topCol = mix(C.w4, C.creamDeep, navyK);
  const billCol = mix(C.w4, C.white, navyK), billInk = mix(C.w3, C.creamDeep, navyK);

  // bills: three travel from the near pile to the far pile in her hand, on the beat
  const BW = 70, BH = 50;
  const bills = [
    { pick: BEAT(.75), place: BEAT(2) },
    { pick: BEAT(3.75), place: BEAT(5) },
    { pick: BEAT(6.75), place: 6.5, last: true },
  ];
  let held = null;
  const holdNear = () => { if (!held) return; g.save(); g.rotate(near[0] + near[1] - lean - (held.last && t < 5.9 ? 1.2 : .25)); g.scale(1 / S, 1 / S); g.translate(4, -18); bill(BW, BH, billCol, billInk); g.restore(); };
  const flat = (x, y, r, k = 0) => { g.save(); g.translate(x, y); g.rotate(r); g.scale(1, .42); bill(BW, BH, billCol, billInk); g.restore(); };

  chair(mix(C.w0, C.navy, navyK));
  sitter(HX, HY, S, herCol, { lean, head: headA, near, far }, 'back');

  // the table: a leg, the top band (naive perspective), the oilcloth
  cut(cutRect(TX0 + 40, TY, 30, FLOOR - TY, 51), tableCol, { sh: .5 });
  cut(poly([[TX0 + 30, TY - TB], [TX1, TY - TB], [TX1, TY], [TX0, TY]]), topCol, { sh: .5, grain: .2 });
  cut(cutRect(TX0 - 6, TY - 2, TX1 - TX0, 118, 52, 1.5), clothCol, { sh: .8, lift: .3 });

  // the piles (two bills already sorted each side), the moving bills, a cold cup
  flat(pileA[0] - 14, TY - 22, .05); flat(pileA[0] - 6, TY - 27, -.07);
  flat(pileB[0] + 30, TY - 30, .04);
  bills.forEach((b, i) => {
    if (t >= b.pick && t < b.place) { held = b; return; }
    if (t < b.pick) flat(pileA[0] - 4 + i * 3, TY - 30 - i * 3, (hash(i) - .5) * .2);
    else if (b.last) flat(pileA[0] + 86, TY - 16, .1);
    else flat(pileB[0] + 30 + i * 4, TY - 34 - i * 3, (hash(i + 4) - .5) * .2);
  });
  cup(1300, TY - 26, 1.3, mix(C.w3, C.cream, navyK));

  sitter(HX, HY, S, herCol, { lean, head: headA, near, far, holdNear }, 'front');
  g.restore();
});
})();
