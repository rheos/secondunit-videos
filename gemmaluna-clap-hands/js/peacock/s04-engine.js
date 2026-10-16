// 73.6-89.7 CHORUS 2, "the engine": the steamer's boiler room. Opens inside the furnace door's glow (the deck's
// door), pulls back. Clap 1 (74.433) the millionaire's white gloves; the furnace door slams, sparks. Clap 2
// (78.867) the stoker's sooty hands, seen low past the pistons; coal dust, the pistons strike. Clap 3 (83.033) one
// glove and one sooty hand clap TOGETHER under the gauges; the glove keeps a soot print; every gauge needle
// jumps. Clap 4 (86.958) the engine claps: brass hands on piston arms above the gauges, the clap echoing out
// along the row; the whistle blows. Gilliam 5A: a brass flyball governor on the boiler steps up a gear on every
// "hands", overspeeds on the engine's clap and throws its balls; one shoots up the stairwell and out of the
// hatch. Then climb the Horta stair to the round hatch: its disc of night sky and moon becomes the avenue's moon.
(() => {
  const [K1, K2, K3, K4] = CLAPS.slice(4, 8), [H1, H2, H3, H4] = HANDS.slice(4, 8);
  const DOOR = { x: 540, y: 1380, r: 170 };
  const HATCH = { x: 540, y: -560, r: 160 };
  const beats = (window.FEAT && FEAT.beats) || [];
  const pump = (t) => { let p = 0; for (const b of beats) { const d = t - b; if (d >= 0 && d < .45) p = Math.max(p, 1 - d / .45); if (b > t) break; } return p; };
  // a pressure gauge as a small Mucha halo: scallop, cream face, ticks, a plum needle
  function gauge(x, y, r, a, flare) {
    if (flare > 0) glow(x, y, r * 2.4, '250,215,140', .55 * flare);
    cut(ringLace(x, y, r * .98, r * 1.22, 12, .2), C.cream, { sh: .6, rule: 'evenodd' });
    cut(scallop(x, y, r, 18, .08), C.gold, { sh: .9, lift: .3 });
    cut(circle(x, y, r * .78), C.cream, { sh: .3, grain: .2 });
    g.save(); g.strokeStyle = C.plumDeep; g.lineWidth = 3; g.globalAlpha *= .7;
    for (let i = 0; i <= 8; i++) { const b = -2.3 + i * 4.6 / 8; g.beginPath(); g.moveTo(x + Math.cos(b - Math.PI / 2) * r * .62, y + Math.sin(b - Math.PI / 2) * r * .62); g.lineTo(x + Math.cos(b - Math.PI / 2) * r * .72, y + Math.sin(b - Math.PI / 2) * r * .72); g.stroke(); }
    g.restore();
    g.save(); g.translate(x, y); g.rotate(a); cut(poly([[-5, 8], [0, -r * .66], [5, 8]]), C.plum, { sh: .4 }); g.restore();
    cut(circle(x, y, 9), C.goldDeep, { sh: .3 });
  }
  function valveWheel(x, y, r, a) {
    cut(ringLace(x, y, r * .82, r), C.gold, { sh: .8, rule: 'evenodd' });
    for (let i = 0; i < 6; i++) { g.save(); g.translate(x, y); g.rotate(a + i * Math.PI / 3); cut(rect(-5, 0, 10, r * .85), C.goldDeep, { sh: .3, grain: 0 }); g.restore(); }
    cut(circle(x, y, r * .2), C.goldDeep, { sh: .5 });
  }
  function piston(x, top, len, ext) {
    cut(cutRect(x - 34, top, 68, len, x), C.goldDeep, { sh: .8, lift: .3 });
    for (let i = 0; i < 3; i++) cut(rect(x - 38, top + 20 + i * (len - 40) / 2, 76, 10), C.gold, { sh: .3, grain: 0 });
    cut(rect(x - 10, top - 30 - ext, 20, 40 + ext), C.cream, { sh: .5 });
    cut(rrect(x - 26, top - 52 - ext, 52, 26, 8), C.gold, { sh: .5 });
  }
  function steam(t, x, y, t0, n = 4, size = 1) {
    const d = t - t0; if (d < 0 || d > 2.2) return;
    for (let j = 0; j < n; j++) {
      const u = clamp(d / (1.2 + j * .2)), sx = x + (j - (n - 1) / 2) * 18, rise = 380 * size * eo(u);
      const v = whipPts([sx, y], [sx + (j % 2 ? 80 : -80) * size, y - rise * .4], [sx + (j % 2 ? -40 : 40) * size, y - rise * .8], [sx + (j % 2 ? 90 : -90) * size, y - rise], 40 * size, j % 2 ? 1 : -1);
      tendril(grow(v, eo(u * 1.4)), (40 - j * 6) * size, j % 2 ? C.cream : C.white, { sh: .3, alpha: .7 * (1 - ei(clamp((d - 1) / 1.2))), grain: .3 });
    }
  }
  // sparks from the door's rim on the slam: gold chips on ballistic arcs
  function sparks(t, x, y, t0, n = 26) {
    const d = t - t0; if (d < 0 || d > 1.4) return;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI * (.1 + .8 * hash(i * 3.7)), sp = 500 + hash(i * 1.9) * 700;
      const px = x + Math.cos(a) * (DOOR.r + sp * d), py = y + Math.sin(a) * (DOOR.r * .6 + sp * d) + 900 * d * d;
      g.save(); g.globalAlpha *= 1 - d / 1.4; cut(star4(px, py, 12 + hash(i) * 10), i % 3 ? C.goldPale : C.gold, { sh: 0, grain: 0 }); g.restore();
    }
  }
  // coal dust: opaque paper soot clouds blooming out behind the sooty hands (draft 4: they sat over the hands and
  // read as goggles)
  function dust(t, x, y, t0) {
    const d = t - t0; if (d < 0 || d > 1.6) return;
    const sz = eo(d / .45) * (1 - ei(clamp((d - .9) / .7)));
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + .5, r = 70 + 130 * eo(d / 1.2), px = x + Math.cos(a) * r, py = y - 40 + Math.sin(a) * r * .55, cw = (170 + 40 * hash(i)) * sz, ch = (110 + 30 * hash(i + 3)) * sz;
      cut(cloud(px, py, cw * 1.08, ch * 1.1, i + 40), C.plumLight, { sh: i % 2 ? .3 : 0, grain: 0 }); cut(cloud(px + 6, py + 8, cw, ch, i + 40), i % 2 ? C.tealInk : C.plumDeep, { sh: 0, grain: 0 }); }
  }
  // a gear wheel, face on
  function gear(x, y, r, a, n = 10, col = C.gold) {
    const pts = []; for (let i = 0; i < n * 4; i++) { const q = i % 4, aa = a + (Math.floor(i / 4) + [0, .2, .5, .7][q]) / n * TAU, rr = q === 1 || q === 2 ? r * 1.2 : r; pts.push([x + Math.cos(aa) * rr, y + Math.sin(aa) * rr]); }
    cut(poly(pts), col, { sh: .6, grain: 0 }); cut(circle(x, y, r * .55), C.goldDeep, { sh: 0, grain: 0 }); cut(circle(x, y, r * .2), C.goldPale, { sh: 0, grain: 0 });
  }
  const GLOVE = { skin: SKIN.glove, cuffCol: C.white, sleeveCol: C.plumDeep };
  const SOOT = { skin: SKIN.soot, cuffCol: C.creamDeep, sleeveCol: C.tealDeep }; // cuffCol: the rolled shirt sleeve (b1's soot skin)

  // ---- the governor (Gilliam 5A): a spindle on the boiler's right shoulder with two brass balls on arms ----
  const GOV = { x: 785, y: 1000, h: 300, arm: 185, R: 38 };
  const W0 = TAU / 2.1, SNAP = H4; // one turn a bar at rest; the balls fly off on the engine clap's "hands"
  const govSpeed = (t) => { let lv = 0; for (const h of [H1, H2, H3]) lv += eo(clamp((t - h) / .16)); const os = ei(clamp((t - K4) / .5)); return { lv, os, w: W0 * (1 + .8 * lv + 8 * os) }; };
  const govAngle = (t) => { let a = 0; const dt = 1 / 100; for (let s = 73.6; s < t; s += dt) { const st = Math.min(dt, t - s); a += govSpeed(s + st / 2).w * st; } return a; };
  const govPhi = (t) => { const { lv, os } = govSpeed(t); let ph = .4 + .22 * lv + .6 * os; for (const h of [H1, H2, H3]) ph += .16 * bump(t, h, .45); return Math.min(1.52, ph); };
  const ballPos = (t, k) => { const th = govAngle(t) + k * Math.PI, ph = govPhi(t), rho = GOV.arm * Math.sin(ph); return [GOV.x + rho * Math.cos(th), GOV.y - GOV.h + GOV.arm * Math.cos(ph), Math.sin(th)]; };
  const SB = [ballPos(SNAP, 0), ballPos(SNAP, 1)]; // where the balls are when they snap off
  function governor(t) {
    const snapped = t >= SNAP, tt = Math.min(t, SNAP + 3), { w, os } = govSpeed(tt), th = govAngle(tt);
    const shake = snapped ? 0 : os * 5 * Math.sin(t * 90), px = GOV.x + shake, py = GOV.y - GOV.h;
    const ph = snapped ? 1.57 : govPhi(t), arm = snapped ? GOV.arm * .35 : GOV.arm;
    const ends = [0, 1].map((k) => { const a = th + k * Math.PI, rho = arm * Math.sin(ph); return { x: px + rho * Math.cos(a), y: py + arm * Math.cos(ph), d: Math.sin(a), a }; });
    const collarY = py + (GOV.arm * Math.cos(ph)) * 1.2 + 26;
    const limb = (e, front) => {
      const col = front ? C.gold : C.goldDeep, mx = lerp(px, e.x, .55), my = lerp(py, e.y, .55);
      tendril([[px, py], [e.x, e.y]], 12, col, { sh: front ? .4 : 0, grain: 0 });
      tendril([[px + (e.x > px ? 8 : -8), collarY], [mx, my]], 7, col, { sh: 0, grain: 0 });
      if (!snapped) {
        if (w > W0 * 3) for (const [lag, al] of [[.35, .3], [.7, .14]]) { const a = e.a - lag, rho = arm * Math.sin(ph); g.save(); g.globalAlpha *= al; cut(circle(px + rho * Math.cos(a), py + arm * Math.cos(ph), GOV.R), C.goldPale, { sh: 0, grain: 0 }); g.restore(); }
        cut(circle(e.x, e.y, GOV.R * (1 + .12 * e.d)), front ? C.gold : C.goldDeep, { sh: front ? .7 : .3, lift: .3, grain: 0 });
        cut(circle(e.x - GOV.R * .3, e.y - GOV.R * .35, GOV.R * .28), C.goldPale, { sh: 0, grain: 0, alpha: front ? 1 : .5 });
      }
    };
    for (const e of ends) if (e.d < 0) limb(e, false);
    gear(GOV.x + 82, GOV.y - 44, 40, th * 1.7, 9);
    cut(rrect(GOV.x - 48, GOV.y - 34, 96, 44, 12), C.goldDeep, { sh: .7, lift: .2, grain: 0 });
    cut(rect(px - 7, py - 34, 14, GOV.h + 8), C.gold, { sh: .5, grain: 0 });
    cut(rrect(px - 16, collarY - 12, 32, 24, 6), C.goldPale, { sh: .4, grain: 0 });
    cut(blob([[px - 14, py - 30], [px, py - 78], [px + 14, py - 30], [px, py - 22]], .6), C.goldPale, { sh: .3, grain: 0 }); // a bud finial
    for (const e of ends) if (e.d >= 0) limb(e, true);
    // a gear change on each "hands": a spark at the gear
    for (const h of [H1, H2, H3]) { const d = t - h; if (d >= 0 && d < .35) { g.save(); g.globalAlpha *= 1 - d / .35; cut(star4(GOV.x + 82, GOV.y - 44, 50 + 70 * d), C.goldPale, { sh: 0, grain: 0 }); g.restore(); } }
    // the snap: a burst of sparks at the pivot
    if (snapped && t < SNAP + .5) { const d = t - SNAP; for (let i = 0; i < 10; i++) { const a = TAU * i / 10, r = 30 + 260 * eo(d / .5); g.save(); g.globalAlpha *= 1 - d / .5; cut(star4(px + Math.cos(a) * r, py + Math.sin(a) * r * .7, 14), i % 2 ? C.gold : C.goldPale, { sh: 0, grain: 0 }); g.restore(); } }
  }
  // the thrown balls: one off to the right and away, one up the stairwell (the camera follows it) and out through
  // the hatch into the night a beat before the moon match
  const UP = 1.6;
  function thrownBalls(t) {
    if (t < SNAP) return;
    const d = t - SNAP;
    if (d < 1.2) { const [x0, y0] = SB[1]; const x = x0 + 760 * d, y = y0 - 620 * d + 1500 * d * d; cut(circle(x, y, GOV.R), C.gold, { sh: .6, grain: 0 }); }
    const u = clamp(d / UP), [x0, y0] = SB[0], sz = 1 - eio(clamp((t - (SNAP + UP - .16)) / .28)); // it shrinks away into the sky inside the hatch
    if (sz <= 0) { const e = t - (SNAP + UP + .12); if (e > 0 && e < .25) { g.save(); g.globalAlpha *= 1 - e / .25; cut(star4(HATCH.x - 40, HATCH.y - 50, 26 * (1 - e / .25) + 6), C.goldPale, { sh: 0, grain: 0 }); g.restore(); } return; }
    const pos = (v) => [lerp(x0, HATCH.x - 40, v) + Math.sin(v * TAU * 1.3) * 170 * Math.sin(v * Math.PI), lerp(y0, HATCH.y - 50, v)];
    const rs = GOV.R * sz * lerp(1, .6, u), trail = [...Array(8).keys()].map((i) => pos(Math.max(0, u - (7 - i) * .02)));
    g.save(); g.globalAlpha *= .5 * sz; tendril(trail, rs * 1.6, C.goldPale, { sh: 0, grain: 0 }); g.restore();
    const [x, y] = pos(u); cut(circle(x, y, rs), C.gold, { sh: .7, lift: .4, grain: 0 }); cut(circle(x - rs * .3, y - rs * .3, rs * .26), C.goldPale, { sh: 0, grain: 0 });
  }

  // ---- the Horta stair (draft 4: the hatch on a straight post with treads on one side read as a key). A helix of
  // iron treads round a newel post, seen from the side, so the treads swing from one side to the other; a thick
  // whiplash rail spirals with them on curling balusters; the post ends a turn below the hatch in a curl, and the
  // hatch is a round skylight set in the stairwell's ceiling, behind a gold moulding ----
  const ST = [...Array(26).keys()].map((i) => ({ a: 1.1 + i * .52, y: 960 - i * 49 }));
  const SK = .14, R1 = 235, RR = 250;
  const SP = (r, a, y) => [540 + Math.cos(a) * r, y + Math.sin(a) * r * SK];
  const railY = (a) => 960 - (a - 1.1) / .52 * 49 - 96;
  function stair() {
    const top = ST[ST.length - 1], CEIL = HATCH.y + HATCH.r + 44;
    // the ceiling's moulding, with the skylight's two iron brackets
    cut(rect(-60, CEIL, W + 120, 16), C.gold, { sh: .5, grain: 0 }); cut(rect(-60, CEIL + 16, W + 120, 8), C.goldDeep, { sh: 0, grain: 0 });
    for (const sx of [-1, 1]) tendril(whipPts([HATCH.x + sx * 150, CEIL], [HATCH.x + sx * 220, CEIL - 10], [HATCH.x + sx * 250, CEIL - 70], [HATCH.x + sx * 205, CEIL - 110], 22, -sx), 10, C.gold, { sh: .3, grain: 0 });
    const tread = (s0, front) => { const a = s0.a + .22, [x1, y1] = SP(R1, a, s0.y), x0 = 540, w = 15;
      cut(poly([[x0, s0.y - w / 2], [x1, y1 - w / 2], [x1 + Math.sign(x1 - x0) * 6, y1 + w / 2], [x0, s0.y + w / 2]]), front ? C.gold : C.goldDeep, { sh: front ? .4 : 0, grain: 0, alpha: front ? 1 : .75 });
      if (front) cut(rect(Math.min(x0, x1), s0.y + w / 2 - 2, Math.abs(x1 - x0), 5), C.goldDeep, { sh: 0, grain: 0 }); };
    const rail = (front) => { let run = [];
      const flush = () => { if (run.length > 1) tendril(run, front ? 18 : 12, front ? C.gold : C.goldDeep, { sh: front ? .4 : 0, grain: 0 }); run = []; };
      for (let a = ST[0].a; a <= top.a + .5; a += .05) { const isF = Math.sin(a) >= 0; if (isF === front) run.push(SP(RR, a, railY(a))); else flush(); } flush(); };
    const baluster = (s0, front) => { const a = s0.a + .22, [x, y] = SP(R1 - 6, a, s0.y), y1 = railY(a) + Math.sin(a) * RR * SK, sd = Math.cos(a) > 0 ? 1 : -1;
      tendril(whipPts([x, y - 6], [x + sd * 26, y - 34], [x - sd * 22, lerp(y, y1, .72)], [x, y1], 10, sd), front ? 6 : 4, front ? C.gold : C.goldDeep, { sh: 0, grain: 0 }); };
    for (const s0 of ST) if (Math.sin(s0.a + .22) < 0) { tread(s0, false); baluster(s0, false); }
    rail(false);
    cut(rect(531, top.y + 10, 18, 1000 - top.y), C.goldDeep, { sh: .5, grain: 0 });
    tendril(whipPts([540, top.y + 14], [540, top.y - 30], [500, top.y - 60], [470, top.y - 40], 18, -1), 14, C.goldDeep, { sh: .3, grain: 0 }); // the post's top curls over
    for (const s0 of ST) if (Math.sin(s0.a + .22) >= 0) { tread(s0, true); baluster(s0, true); }
    rail(true);
    const ea = top.a + .5, [ex, ey] = SP(RR, ea, railY(ea)); tendril(whipPts([ex, ey], [ex + Math.sign(ex - 540) * 50, ey - 20], [ex + Math.sign(ex - 540) * 70, ey - 70], [ex + Math.sign(ex - 540) * 30, ey - 80], 22, Math.sign(ex - 540)), 14, C.gold, { sh: .3, grain: 0 }); // the rail ends in a curl
  }

  // the setups (draft 4: claps 1-3 shared one centred framing with no machine in view). Each clap has its own,
  // centred on the clap; between them the camera drifts to put a piece of the machine on a third, and pulses on
  // the beats. [cx, cy, zoom, roll]
  const SETUP = {
    c1: [540, 1240, 1.35, 0],        // clap 1: tight on the furnace door, the gloves above it
    g1: [610, 960, 1.22, .025],      // the governor on the right third, the gauges overhead
    g1b: [590, 1000, 1.18, .015],
    c2: [540, 1150, 1.05, -.07],     // clap 2: low and tilted, past the pistons, the fire under the hands
    g2: [330, 1000, 1.3, -.03],      // the valve wheel and the left piston on the left third
    g2b: [350, 1020, 1.34, -.02],
    c3: [540, 900, 1.28, .045],       // clap 3: up on the boiler's crown, gauges in the top third, governor right
    c4: [540, 900, .92, 0],          // clap 4: pull back, the whole boiler is the body
  };
  const ECHO = [[380, .12], [700, .12], [230, .24], [850, .24]];
  SHOT(73.6, 89.7, 'engine', (t, k, d) => {
    const S = SETUP;
    const KS = [[73.6, [DOOR.x, DOOR.y, 5.9, 0]], [74.25, S.c1], [74.65, S.c1], [75.7, S.g1], [77.3, S.g1b], [78.15, S.c2], [79.75, S.c2], [80.7, S.g2], [81.9, S.g2b], [82.35, S.c3], [84.1, S.c3], [86.0, S.c4], [87.6, S.c4]];
    let [cx, cy, z, rot] = [0, 1, 2, 3].map((j) => kf3(t, KS.map(([tt, v]) => [tt, v[j]])));
    if (t < 74.25) z = Math.exp(lerp(Math.log(5.9), Math.log(1.35), eo(clamp((t - 73.6) / .65))));
    const p = pump(t);
    // a small push on every beat between the claps (never within 0.7 s of a contact, never on the climb)
    const calm = clamp(Math.min(...[K1, K2, K3, K4].map((kk) => Math.abs(t - kk))) - .7) * (1 - ss(86.0, 86.3, t)) * ss(74.6, 75.0, t);
    z *= 1 + .022 * p * calm;
    const up = eio(clamp((t - 87.6) / 1.5)), into = ei(clamp((t - 89.0) / .62));
    if (t > 87.6) { cy = lerp(cy, HATCH.y + 120, up); z = lerp(z, 1.0, up); }
    if (t > 89.0) { cy = lerp(HATCH.y + 120, HATCH.y, eio(clamp((t - 89.0) / .5))); z = Math.pow(5.6, into); }
    g.save(); cam(cx, cy, z, rot);
    sheet(C.plumDeep);
    if (t > 86.8) { // the stairwell and the hatch exist only once we climb (the audit: a stray gold "E" above the room)
      cut(cutRect(-60, -1200, W + 120, 900, 101), C.plumDeep, { sh: .3 });
      cut(circle(HATCH.x, HATCH.y, HATCH.r), C.tealInk, { sh: 0 });
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 40 + hash(i) * 55; cut(star4(HATCH.x - 30 + Math.cos(a) * r, HATCH.y + 40 + Math.sin(a) * r * .8, 5 + hash(i) * 5), C.goldPale, { sh: 0, grain: 0 }); }
      cut(circle(HATCH.x + 30, HATCH.y - 20, 60), C.goldPale, { sh: .3, grain: .2 });
      cut(ringLace(HATCH.x, HATCH.y, HATCH.r, HATCH.r + 34, 16), C.gold, { sh: .9, lift: .3, rule: 'evenodd' });
      stair();
    }
    // the room: plum wall with gold tesserae, a Guimard canopy of whiplash iron over the boiler
    cut(cutRect(-60, 300, W + 120, 1700, 102), C.plum, { sh: .6 });
    for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) { g.save(); g.translate(60 + c * 120 + (r % 2) * 60, 360 + r * 200); g.rotate(Math.PI / 4); g.fillStyle = (r + c) % 3 ? C.goldDeep : C.gold; g.fillRect(-7, -7, 14, 14); g.restore(); }
    for (const sx of [-1, 1]) tendril(whipPts([540 + sx * 520, 1000], [540 + sx * 560, 420], [540 + sx * 200, 160], [540 + sx * 30, 330], 60, -sx), 30, C.tealDeep, { sh: .8, lift: .3 });
    for (const sx of [-1, 1]) {
      tendril(whipPts([540 + sx * 520, 1500], [540 + sx * 500, 900], [540 + sx * 200, 700], [540 + sx * 330, 420], 50, -sx), 34, C.goldDeep, { sh: .7 });
      tendril(whipPts([540 + sx * 420, 1700], [540 + sx * 460, 1200], [540 + sx * 120, 1000], [540 + sx * 160, 760], 36, sx), 22, C.gold, { sh: .6 });
    }
    valveWheel(150, 760, 64, t * 1.4 + p * .6); valveWheel(930, 760, 64, -t * 1.4 - p * .6);
    // the gauges kick on the beats; on clap 3 every needle jumps and the dials pop
    const jump = t > K3 ? back(clamp((t - K3) / .35)) * (1 - ss(K3 + 1.2, K3 + 2.4, t)) : 0, gpop = 1 + .1 * bump(t, K3 - .02, .32);
    [[290, 560, 92], [540, 470, 104], [790, 560, 92]].forEach(([x, y, r], i) => gauge(x, y, r * gpop, -1.2 + .25 * Math.sin(t * 2.1 + i) + .5 * p + 2.1 * jump, jump * .9 + .15 * p));
    const strike = t > K2 ? Math.exp(-6 * (t - K2)) : 0;
    piston(110, 1130, 300, 110 * p + 160 * strike); piston(970, 1130, 300, 110 * p + 160 * strike);
    // clap 4's echo: small soot-printed brass hands rising from behind the boiler, clapping in a ripple outward
    for (const [x, lag] of ECHO) visitClap(t, x, 1000, 86, K4 + lag, { skin: SKIN.brass, cuffCol: C.goldPale, sleeveCol: C.goldDeep, sleeveLen: 3, dy: 260, pre: .6, print: 1 });
    // the boiler, its whistle and the furnace door: a leaded-glass rondel of irises when it is shut
    cut(rrect(170, 1000, 740, 780, 150), C.plum, { sh: 1.1, lift: .5 });
    for (let i = 0; i < 3; i++) cut(rect(170, 1080 + i * 220, 740, 16), C.gold, { sh: .3 });
    cut(rect(520, 930, 40, 80), C.gold, { sh: .6 }); cut(ellipse(540, 926, 34, 14), C.goldPale, { sh: .4 });
    const shut = ss(K1 - .18, K1, t) * (1 - ss(77.5, 78.0, t));
    const fire = .6 + .25 * p + .2 * Math.sin(t * 11) * ss(74.0, 74.4, t); // no flicker while the door fills the frame (it pulsed the whole frame)
    glow(DOOR.x, DOOR.y, 520, '250,180,100', (.25 + .35 * (1 - shut)) * fire);
    cut(scallop(DOOR.x, DOOR.y, DOOR.r, 26, .06), C.gold, { sh: 1, lift: .4 });
    furnaceFire(DOOR.x, DOOR.y, DOOR.r * .8, t, p, .4 * strike, ss(74.0, 74.4, t));
    g.save(); g.translate(DOOR.x - DOOR.r * .8 * (1 - shut), DOOR.y); g.scale(lerp(.15, 1, shut), 1);
    cut(circle(0, 0, DOOR.r * .8), C.teal, { sh: .6 });
    glow(0, 0, DOOR.r * .8, '250,200,120', .5 * fire);
    for (let i = -1; i <= 1; i++) { tendril([[i * 46, 120], [i * 40, 40], [i * 52, -30]], 8, C.plumDeep, { sh: 0, grain: 0 }); borderBloom(i * 52, -40, 30, 'iris', 1, 1); }
    cut(ringLace(0, 0, DOOR.r * .74, DOOR.r * .8), C.plumDeep, { sh: 0, rule: 'evenodd' });
    g.restore();
    // clap 4 (Mark): the machine claps above its gauges, its piston arms reaching into the canopy (drawn behind the
    // governor; the brass hands go back into the housings about a second after, draft 4)
    visitClap(t, 540, 430, 200, K4, { skin: SKIN.brass, cuffCol: C.goldPale, sleeveCol: C.goldDeep, L: { root: [110, 1110] }, R: { root: [970, 1110] }, dy: 640, pre: .9, post: 1.0 });
    governor(t);
    // the claps 1-3, each centred in its own setup
    dust(t, 540, 1110, K2 + .02);
    visitClap(t, 540, 1080, 185, K1, { ...GLOVE, sleeveLen: 6, dy: 1000, pre: .7 });
    sparks(t, DOOR.x, DOOR.y, K1);
    visitClap(t, 540, 1300, 190, K2, { ...SOOT, sleeveLen: 6, dy: 1000 });
    visitClap(t, 540, 1250, 180, K3, { L: { ...GLOVE, print: ss(K3 + .02, K3 + .1, t) }, R: SOOT, sleeveLen: 6, dy: 1000 });
    steam(t, 540, 920, K4, 5, 1.2); steam(t, 540, 920, K2 + .1, 3, .55); // the whistle: a short puff on clap 2, the full blow on clap 4
    clapRings(t, 540, 895, K1, .7); clapRings(t, 540, 1110, K2, .7); clapRings(t, 540, 1070, K3, .7);
    clapRings(t, 540, 250, K4, 1.1);
    thrownBalls(t);
    g.restore();
    // clap 2's foreground: two great pistons pumping close to the lens, low angle
    const fg = ss(77.4, 78.1, t) * (1 - ss(79.9, 80.6, t));
    if (fg > 0) for (const x of [80, 1000]) { const e = 120 * p + 220 * strike; g.save(); g.globalAlpha *= fg * .95; cut(rect(x - 46, 1100 - e, 92, 900), C.goldDeep, { sh: 1, lift: .6 }); cut(rect(x - 52, 1060 - e, 104, 50), C.gold, { sh: .4 }); g.restore(); }
    sheet(C.goldPale, .12 * (1 - ss(73.6, 74.15, t))); // a slow wash out of the furnace
  });
})();
