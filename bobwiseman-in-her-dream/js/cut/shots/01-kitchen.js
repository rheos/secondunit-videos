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
    if (!p.farFront) { g.save(); g.rotate(p.lean); g.translate(-8, -212); arm(p.far[0], p.far[1], col, p.holdFar); g.restore(); }
    cut(LAP, col, { sh: .6, grain: .26, lift: .2 });
    g.save(); g.rotate(p.lean); cut(BODICE, col, { sh: .6, grain: .26, lift: .2 }); g.restore();
  }
  if (layer !== 'back') {
    g.save(); g.rotate(p.lean);
    if (p.farFront) { g.save(); g.translate(-8, -212); arm(p.far[0], p.far[1], col, p.holdFar); g.restore(); }
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
// her pose keyframes through the intro: [time, lean, head, [nearSh, nearEl], [farSh, farEl]]
// sorting (the hand moves on the beat), a bill held up into the lamp to read, rubbing her eyes, then the
// doze: forearms folded on the TOP of the table, head down resting on them (17-wake opens on this pose).
const PA = [.12, 1.06, .62], PB = [.3, 1.42, .24], PL = [.2, 1.32, 1.0];
const FAR0 = [1.0, .62];
const DOZE = { lean: .66, head: -.85, near: [2.0, 3.15], far: [2.2, 2.9 - Math.PI * 2] };   // far elbow wound the other way so it never swings up
const POSES = [
  [0, PA[0], -.22, PA.slice(1), FAR0], [BEAT(0), PA[0], -.22, PA.slice(1), FAR0], [BEAT(1), PL[0], -.14, PL.slice(1), FAR0], [BEAT(2), PB[0], -.2, PB.slice(1), FAR0],
  [BEAT(3), PA[0], -.22, PA.slice(1), FAR0], [BEAT(4), PL[0], -.14, PL.slice(1), FAR0], [BEAT(5), PB[0], -.2, PB.slice(1), FAR0],
  [BEAT(6), PA[0], -.22, PA.slice(1), FAR0],
  [BEAT(7.4), -.02, .1, [1.95, 1.0], FAR0], [5.9, -.02, .12, [1.95, 1.0], FAR0],          // the last bill up in the lamp's light
  [6.5, .12, -.2, PA.slice(1), FAR0], [7.1, .06, -.2, [1.3, 2.55], FAR0], [8.5, .08, -.16, [1.3, 2.55], FAR0],
  [9.25, .26, -.24, [1.42, 3.55], [1.5, 3.4 - Math.PI * 2]], [10.2, DOZE.lean, DOZE.head, DOZE.near, DOZE.far],
];
const pileA = handAt(...PA), pileB = handAt(...PB);

// the dream arrives as cut sheets: scalloped rose discs, each one popped in on a downbeat, stepping
// outward from behind her (the newest sheet goes BEHIND the last, so the edges read as rings, like the
// laugh rings); the ring shadows flatten out as the room settles into the dream
const WARM = { x: 860, y: 600 };
// d3: the light grows with the music, from the new chord at 15.40 s (band stem onsets 16.20, 16.58, 16.98, 17.78)
const LIFT = 15.40;
const STEPS = [[16.20, 330], [16.58, 640], [16.98, 1020], [17.78, 1700]];
function scallopDisc(cx, cy, r, seed) {
  const n = Math.max(14, Math.round(Math.PI * 2 * r / 64)), p = new Path2D();
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2 + seed, rr = r + (hash(seed * 7 + i) - .5) * 5;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    if (i === 0) { p.moveTo(x, y); continue; }
    const am = (i - .5) / n * Math.PI * 2 + seed, rc = r + 26 + (hash(seed * 3 + i) - .5) * 8;
    p.quadraticCurveTo(cx + Math.cos(am) * rc, cy + Math.sin(am) * rc, x, y);
  }
  p.closePath(); return p;
}
function stepR(t, i) { const [t0, R] = STEPS[i]; if (t < t0 - .17) return 0; const k = back((t - (t0 - .17)) / .34); return lerp(i ? STEPS[i - 1][1] : 230, R, k); }

// one bill: a sheet with grey lines (no readable text); a hard little shadow so it reads as paper on paper
function billHard(w, h, col, line, sh = 1) {
  const p = cutRect(-w / 2, -h / 2, w, h, w * 3.1, 1.2);
  if (sh > 0) { g.save(); g.translate(4, 5); g.fillStyle = `rgba(20,16,30,${.34 * sh})`; g.fill(p); g.restore(); }
  cut(p, col, { sh: .3, grain: .12 });
  g.save(); g.strokeStyle = line; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const y = -h / 2 + 12 + i * 11; g.beginPath(); g.moveTo(-w / 2 + 10, y); g.lineTo(-w / 2 + 10 + (w - 20) * (i === 3 ? .45 : i === 0 ? .6 : .85), y); g.stroke(); }
  g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2 - 30, h / 2 - 12); g.lineTo(w / 2 - 10, h / 2 - 12); g.stroke();
  g.restore();
}

SHOT(0, 18.5, 'kitchen', (t) => {
  const A0 = g.globalAlpha;
  // camera: a slow push in toward her
  const cz = eio(t / 18.5), Z = lerp(1, 1.13, cz), FX = lerp(960, 900, cz), FY = lerp(540, 585, cz);
  g.save(); g.translate(W / 2, H / 2); g.scale(Z, Z); g.translate(-FX, -FY);

  // the drift: everything below is 0 = waking, 1 = dream
  const haloK = ss(LIFT, 18.0, t);                                       // warm circle -> paper sun
  const navyK = ss(16.0, 18.3, t);                                       // her paper, the table

  // ---- the room, waking, then the dream room on the stepped sheets ----
  room(0);
  const rs = STEPS.map((_, i) => stepR(t, i));
  const top = rs.reduce((m, r, i) => r > 0 ? i : m, -1);
  if (top >= 0) {
    const ringSh = 1 - ss(17.9, 18.45, t);
    const discs = rs.map((r, i) => r > 0 ? scallopDisc(WARM.x, WARM.y, r, i * 1.7 + .3) : null);
    // the outermost sheet lies on the grey room with a cut shadow; the dream room is printed on it
    const outer = discs[top];
    g.save(); g.shadowColor = 'rgba(20,16,30,.3)'; g.shadowBlur = 18; g.shadowOffsetX = 5; g.shadowOffsetY = 8; g.fillStyle = C.rose; g.fill(outer); g.restore();
    g.save(); g.clip(outer); room(1);
    // the inner sheets' edges: their shadows on the sheet behind them
    if (ringSh > 0) for (let i = top - 1; i >= 0; i--) {
      g.save(); const outside = new Path2D(); outside.rect(-3000, -3000, 9000, 9000); outside.addPath(discs[i]);
      g.clip(outside, 'evenodd');
      g.shadowColor = `rgba(20,16,30,${.26 * ringSh})`; g.shadowBlur = 14; g.shadowOffsetX = 4; g.shadowOffsetY = 7;
      g.fillStyle = C.rose; g.fill(discs[i]); g.restore();
    }
    g.restore();
  }

  // ---- the lamp's warm light on the wall, which becomes the sun halo ----
  const GY = LSY + 150;
  const glowR = lerp(300, 380, haloK);
  g.save(); g.globalAlpha = A0 * .5 * (1 - ss(LIFT - .1, 16.8, t));
  const gr = g.createRadialGradient(LX, GY, 20, LX, GY, glowR);
  gr.addColorStop(0, 'rgba(243,217,160,.85)'); gr.addColorStop(.55, 'rgba(243,217,160,.3)'); gr.addColorStop(1, 'rgba(243,217,160,0)');
  g.fillStyle = gr; g.fill(circle(LX, GY, glowR)); g.restore();
  if (t >= LIFT) {
    // opaque paper from its first frame: it pops in small inside the glow, then grows and settles
    const r = lerp(70, HALO.r, eo(haloK)) * (t < LIFT + .5 ? back((t - LIFT) / .5) : 1) + Math.sin(t * .5) * 3;
    const hxk = lerp(LX, HALO.x, eio(haloK)), hyk = lerp(GY, HALO.y, eio(haloK));
    cut(circle(hxk, hyk, r + lerp(14, 28, haloK)), C.goldPale, { sh: .5, grain: .25 });
    cut(circle(hxk, hyk, r), mix(C.lamp, C.sun, haloK), { sh: .6, grain: .25 });
  }
  // the pendant lamp, cord and shade: it stays where it hangs, inside the sun
  g.save();
  const sway = Math.sin(t * .9) * .012;
  g.translate(LX, -60); g.rotate(sway); g.translate(-LX, 60);
  cut(cutRect(LX - 3, -200, 6, LSY + 200, 31, .8), mix(C.w0, C.roseDark, navyK), { sh: .4, grain: 0 });
  cut(poly([[LX - 32, LSY], [LX + 32, LSY], [LX + 100, LSY + 76], [LX - 100, LSY + 76]]), mix(C.w0, C.roseDark, navyK), { sh: .9, lift: .4 });
  cut(ellipse(LX, LSY + 78, 34, 14), C.lamp, { sh: 0, grain: .1 });
  g.restore();
  // the light cone onto the table
  g.save(); g.globalAlpha = A0 * .2 * (1 - ss(16.2, 17.6, t));
  const cg = g.createLinearGradient(0, LSY + 78, 0, TY);
  cg.addColorStop(0, 'rgba(243,217,160,.95)'); cg.addColorStop(1, 'rgba(243,217,160,.3)');
  g.fillStyle = cg; g.fill(poly([[LX - 92, LSY + 76], [LX + 92, LSY + 76], [LX + 300, TY], [LX - 300, TY - TB * .2]])); g.restore();

  // ---- her ----
  let fk = POSES.length - 1; for (let i = 1; i < POSES.length; i++) if (t < POSES[i][0]) { fk = i - 1; break; }
  const P0 = POSES[fk], P1 = POSES[Math.min(fk + 1, POSES.length - 1)];
  const e = P1 === P0 ? 1 : eio((t - P0[0]) / (P1[0] - P0[0]));
  let lean = lerp(P0[1], P1[1], e), headA = lerp(P0[2], P1[2], e);
  let near = [lerp(P0[3][0], P1[3][0], e), lerp(P0[3][1], P1[3][1], e)];
  const far = [lerp(P0[4][0], P1[4][0], e), lerp(P0[4][1], P1[4][1], e)];
  if (t > 7.1 && t < 8.4) near[1] += Math.sin((t - 7.1) * 15) * .06 * bump(t, 7.1, 1.3);     // rubbing her eyes
  // asleep: she breathes; the back rises and falls, the head stays down on her arms
  const breath = Math.sin((t - 10.2) * Math.PI * 2 / 4.2) * .014 * ss(10.2, 11, t);
  lean += breath; headA -= breath * 1.1; near[0] -= breath * .9; far[0] -= breath * .9;
  const farFront = t > 9.25;
  const herCol = mix(C.w1, C.navy, navyK);
  const tableCol = mix(C.w0, C.roseDark, navyK), clothCol = mix(C.w3, C.cream, navyK), topCol = mix(C.w4, C.creamDeep, navyK);
  const billCol = mix(C.w4, C.white, navyK), billInk = mix(C.w2, C.creamDeep, navyK);

  // bills: three travel from the near pile to the far pile in her hand, on the beat; the last one she
  // holds up into the lamp's light to read
  const BW = 96, BH = 68;
  const bills = [
    { pick: BEAT(.75), place: BEAT(2) },
    { pick: BEAT(3.75), place: BEAT(5) },
    { pick: BEAT(6.75), place: 6.5, last: true },
  ];
  let held = null;
  const lit = bump(t, BEAT(7.2), 6.0 - BEAT(7.2) + .3);
  const holdNear = () => { if (!held) return; g.save(); g.rotate(near[0] + near[1] - lean - (held.last && t < 6.1 ? .55 : .25)); g.scale(1 / S, 1 / S); g.translate(4, -24);
    billHard(BW, BH, held.last ? mix(C.w4, C.lamp, lit * .7) : billCol, billInk); g.restore(); };
  const flat = (x, y, r, k = 0) => { g.save(); g.translate(x, y); g.rotate(r); g.scale(1, .42); billHard(BW, BH, billCol, billInk, .8); g.restore(); };

  chair(mix(C.w0, C.navy, navyK));
  sitter(HX, HY, S, herCol, { lean, head: headA, near, far, farFront }, 'back');

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

  sitter(HX, HY, S, herCol, { lean, head: headA, near, far, holdNear, farFront }, 'front');
  g.restore();
});
})();
