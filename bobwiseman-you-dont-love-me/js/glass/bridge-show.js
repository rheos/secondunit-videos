// Stained glass, BRIDGE, draft 7 (Bob, 2026-10-14: "more surreal? like captain kangaroo?").
// The tea leaf reader's alcove becomes a children's morning-show set, played deadpan: a gentle host in a long coat
// with pockets far too big, a hand-puppet owl who pulls the cord that drops things on his head, a teapot that wakes
// up and reads the leaves, a sun on the backdrop that winces and dozes along. Everything is leaded glass, as the
// rest of the film. Pure function of song time t.
//
// Span: 118.333 to 140.24. It opens through the tea: verse 2's push carries on into the cup, and the tea's surface
// becomes a round window onto the set that widens until it fills the frame. It ends under the Pips' stage, which
// drops in from above over the set (bridge-trio.js, unchanged). Outside the span this file draws nothing, so the
// frames from 140.24 on are draft 6's.
// Times are the bridge's sung hits (bridge-timing.js, vocal-stem onsets), copied by value. No text on screen.

const SH = {
  t0: 118.333, irisA: 118.55, irisB: 119.05, irisC: 119.8, end: 140.24,
  pocket: 119.75, pathOut: 120.35, pathFull: 120.75, refuse: 121.45, rolledUp: 122.25, inPocket: 122.5,
  owlUp: 123.45, owlLands: 123.88,
  drops: [124.95, 125.48, 126.31], // a rock on his head on each of these
  lie: 126.9,                      // he tips over onto the rocks like a plank
  rise: 129.44,                    // and springs back up
  heartIn: 130.45, flush: 131.37, yank: 131.79, hatOn: 132.0,
  glide: [134.3, 135.3],           // he glides (no steps) over to the counter
  wake: 134.85, peer: 136.3, sit: 136.72, talk: 137.37, talkEnd: 139.25,
  lookUp: 139.45,
};
const FLOOR = 900, HX0 = 900, HX1 = 1080;

// ---------------- little helpers ----------------
// keyed track: K = [[arrive time, value (number or array), transition length], ...]; eased, optional overshoot
function track(K, t, back = 0) {
  let i = 0; while (i + 1 < K.length && K[i + 1][0] - K[i + 1][2] <= t) i++;
  if (i === 0 || t >= K[i][0]) return K[i][1];
  const [ta, v, d] = K[i], u0 = clamp((t - (ta - d)) / d), u = back ? easeOutBack(u0, back) : smooth(u0), a = K[i - 1][1];
  return Array.isArray(v) ? v.map((x, k) => lerp(a[k], x, u)) : lerp(a, v, u);
}
function ik(S, T, l1, l2, side) { // two-bone arm: shoulder S to hand target T; the elbow goes out on side (-1 left, +1 right)
  const dx = T[0] - S[0], dy = T[1] - S[1], d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 1, l1 + l2 - 1);
  const a = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), b0 = Math.atan2(dy, dx);
  const E1 = [S[0] + Math.cos(b0 + a) * l1, S[1] + Math.sin(b0 + a) * l1], E2 = [S[0] + Math.cos(b0 - a) * l1, S[1] + Math.sin(b0 - a) * l1];
  const E = (E1[0] - E2[0]) * side >= 0 ? E1 : E2, hb = Math.atan2(T[1] - E[1], T[0] - E[0]);
  return [S, E, [E[0] + Math.cos(hb) * l2, E[1] + Math.sin(hb) * l2]];
}
function seg(g, pts, w0, w1, col, seed, o = {}) { // a limb as one leaded piece per segment
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], wa = lerp(w0, w1, i / (pts.length - 1)), wb = lerp(w0, w1, (i + 1) / (pts.length - 1));
    pane(g, smoothPath(limbPts([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], [wa, (wa + wb) / 2, wb])), col, seed + i, { ew: 12, shade: .3, lw: o.lw || 5 });
  }
}
const blobAt = (cx, cy, rx, ry, seed, n = 10, wob = .1) => smoothPath([...Array(n)].map((_, k) => { const a = k / n * TAU, w = 1 + wob * n1(seed, k * .9); return [cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]; }));
const fallY = (t, tHit, y0, y1, dur) => lerp(y0, y1, Math.pow(clamp((t - (tHit - dur)) / dur), 2)); // gravity: lands at tHit
const pulse = (t, at, k = 8) => (t >= at ? Math.exp(-(t - at) * k) : 0);
const blinkAt = (t, at) => 1 - Math.exp(-Math.pow((t - at) / .05, 2));

// ---------------- the host ----------------
// Local coordinates: origin between his feet on the floor, y up is negative, 1 unit = 1 set px.
const HOST = { shY: -548, shX: 100, up: 150, lo: 138, headY: -662, headRx: 60, headRy: 70 };
const COAT = [36, 112, 98], COAT2 = [22, 80, 72], POCKET = [226, 162, 50], POCKET2 = [188, 118, 30], TROUS = [84, 72, 96];
const HSKIN = [242, 208, 182], HAIR = [236, 234, 226];
const REST_L = [-205, -300], REST_R = [205, -300], STIFF_L = [-150, -320], STIFF_R = [150, -320];
const HK = {
  lh: [[118, REST_L, .01], [SH.pocket + .2, [-105, -400], .3], [120.15, [-215, -520], .2], [120.38, [-250, -430], .16], [120.62, REST_L, .2], [121.0, [-268, -520], .25], [121.5, [-268, -520], .01], [121.85, REST_L, .3],
    [122.62, [-105, -440], .18], [122.74, [-105, -392], .1], [122.86, [-105, -440], .1], [122.98, [-105, -392], .1], [123.45, REST_L, .4],
    [126.75, STIFF_L, .3], [129.95, REST_L, .4],
    [131.25, [-40, -480], .45], [131.95, REST_L, .3]],
  rh: [[118, REST_R, .01], [126.75, STIFF_R, .3], [129.95, REST_R, .4],
    [131.25, [40, -480], .45], [131.95, REST_R, .3],
    [133.1, [62, -712], .35], [133.45, [66, -742], .25], [133.95, REST_R, .4],
    [SH.talk + .25, [86, -664], .35], [SH.talkEnd, [86, -664], .01], [139.6, REST_R, .35]],
  // pupils: x -1 (screen left) .. 1, y -1 (up) .. 1 (down)
  look: [[118, [0, 0], .01], [120.5, [-.8, .8], .2], [121.15, [0, 0], .15], [121.6, [-.8, .8], .2], [122.4, [-.5, .6], .15], [123.2, [0, 0], .2],
    [123.95, [.95, 0], .15], [124.6, [.95, 0], .01], [124.75, [0, -.7], .12], [125.15, [0, 0], .1],
    [130.9, [.15, -.8], .3], [131.5, [.1, -.5], .2], [133.5, [0, 0], .2],
    [134.45, [1, .1], .25], [SH.talk + .25, [0, 0], .25], [SH.lookUp + .1, [0, -1], .15]],
  tilt: [[118, 0, .01], [121.0, -.05, .4], [121.4, 0, .2], [SH.talk + .3, .14, .4], [SH.talkEnd, .14, .01], [SH.lookUp + .15, -.12, .25]],
  lean: [[118, 0, .01], [SH.talk + .3, .1, .45], [SH.talkEnd, .1, .01], [139.6, 0, .3]],
};
const hostX = (t) => lerp(HX0, HX1, ease(t, SH.glide[0], SH.glide[1]));
function plankU(t) { // 0 standing .. 1 lying on the rocks
  if (t < SH.lie) return 0;
  if (t < SH.lie + .4) return Math.pow((t - SH.lie) / .4, 2);
  if (t < SH.rise) return 1 - .07 * Math.sin(Math.PI * clamp((t - SH.lie - .4) / .25)) * (t < SH.lie + .65 ? 1 : 0);
  return 1 - easeOutBack(lin(t, SH.rise, SH.rise + .42), 1.6);
}
function squashAt(t) { let s = 0; for (const h of SH.drops) s = Math.max(s, pulse(t, h, 9) * (t < h + .5 ? 1 : 0)); return s + pulse(t, SH.inPocket, 10) * .4 + pulse(t, SH.hatOn, 12) * .3; }
function lidAt(t) {
  let l = .55;
  for (const h of SH.drops) if (t >= h && t < h + .3) l = 0;
  if (t > SH.lie + .35 && t < SH.rise) l = 0;
  if (t >= SH.rise && t < SH.rise + .6) l = lerp(1, .55, ease(t, SH.rise + .2, SH.rise + .6));
  if (t > SH.flush - .1 && t < SH.yank) l = .8;
  for (const b of [121.3, 126.0, 135.0, 138.4]) l *= blinkAt(t, b);
  return l;
}
// host transform: plank rotation about his feet (head to the screen left, a little head-down so it reaches the
// pillow stone), lifted onto the rocks as he goes over
function hostXf(t) {
  const u = plankU(t), x = hostX(t), y = FLOOR - 220 * u, sq = squashAt(t);
  return new DOMMatrix().translate(x, y).rotate(-95 * u).scale(1 + .06 * sq, 1 - .08 * sq);
}
const xfPt = (M, p) => { const q = M.transformPoint(new DOMPoint(p[0], p[1])); return [q.x, q.y]; };
const headTop = (t) => xfPt(hostXf(t), [0, HOST.headY - HOST.headRy]);

function drawPocket(g, side, seed) {
  // patch pockets far too big for the coat: they bulge out past its sides and sag at the bottom
  const xi = side * 34, xo = side * 176, x0 = Math.min(xi, xo), x1 = Math.max(xi, xo), cx = (xi + xo) / 2;
  pane(g, smoothPath([[xi, -440], [xo, -446], [xo + side * 10, -350], [xo - side * 6, -262], [cx, -246], [xi + side * 4, -260], [xi, -350]]), POCKET, seed, { ew: 18, shade: .3, lw: 6 });
  pane(g, polyPath([[xi - side * 2, -446], [xo + side * 4, -452], [xo + side * 2, -412], [xi, -408]]), POCKET2, seed + 1, { ew: 8, shade: .25, lw: 5 });
  g.fillStyle = rgb(C.gold); g.beginPath(); g.arc(cx, -416, 8, 0, TAU); g.fill(); lead(g, circPath(cx, -416, 8), 3);
  paint(g, 2, .45); g.setLineDash([7, 7]); g.beginPath(); g.moveTo(x0 + 10, -400); g.lineTo(x0 + 12, -272); g.moveTo(x1 - 10, -400); g.lineTo(x1 - 12, -272); g.stroke(); g.setLineDash([]);
}
function drawHostHand(g, pts, seed) {
  const [hx, hy] = pts[2], [ex, ey] = pts[1], a = Math.atan2(hy - ey, hx - ex);
  pane(g, circPath(hx - Math.cos(a) * 4, hy - Math.sin(a) * 4, 15), [240, 240, 232], seed + 6, { ew: 6, shade: .15, lw: 4 }); // cuff
  pane(g, blobAt(hx + Math.cos(a) * 14, hy + Math.sin(a) * 14, 19, 21, seed, 9), HSKIN, seed + 7, { ew: 10, shade: .22, lw: 5 });
}
function hostHead(g, t, H) {
  const rx = HOST.headRx, ry = HOST.headRy, [lx, ly] = H.look, lid = H.lid;
  for (const sd of [-1, 1]) pane(g, ellPath(sd * rx * .98, 4, 11, 17), HSKIN, 9710 + sd, { ew: 6, shade: .3, lw: 4 }); // ears
  pane(g, ellPath(0, 0, rx, ry), HSKIN, 9712, { ew: 26, shade: .26, lw: 7 });
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-16, -46, 18, 9, -.3, 0, TAU); g.fill(); // the shine on his bald top
  for (const sd of [-1, 1]) { // white tufts over the ears
    pane(g, blobAt(sd * (rx + 6), -10, 20, 30, 9720 + sd, 9, .22), HAIR, 9720 + sd, { ew: 8, shade: .2, lw: 4 });
    pane(g, blobAt(sd * (rx - 4), -40, 14, 16, 9724 + sd, 8, .25), HAIR, 9724 + sd, { ew: 6, shade: .2, lw: 4 });
  }
  g.fillStyle = 'rgba(232,120,120,.35)'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 34, 20, 13, 0, TAU); g.fill(); }
  for (const sd of [-1, 1]) { // eyes: whites, pupils, the heavy deadpan lid
    const ex = sd * 23, ey = -8;
    g.fillStyle = 'rgba(244,240,228,1)'; g.beginPath(); g.ellipse(ex, ey, 11, 8, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(28,20,14,1)'; g.beginPath(); g.arc(ex + lx * 4.5, ey + ly * 3, 4.6, 0, TAU); g.fill();
    g.fillStyle = rgb(mix(HSKIN, [200, 150, 130], .25)); g.beginPath(); g.rect(ex - 13, ey - 10, 26, 18 * (1 - lid)); g.fill();
    paint(g, 2.4, .9); g.beginPath(); g.moveTo(ex - 12, ey - 8 + 16 * (1 - lid)); g.lineTo(ex + 12, ey - 8 + 16 * (1 - lid)); g.stroke();
    paint(g, 3.5, .7); g.beginPath(); g.moveTo(ex - 12, ey - 22); g.lineTo(ex + 11, ey - 23 + sd); g.stroke(); // flat brows
  }
  g.lineWidth = 3; g.strokeStyle = rgb(C.gold); for (const sd of [-1, 1]) { g.beginPath(); g.arc(sd * 23, -8, 17, 0, TAU); g.stroke(); }
  g.beginPath(); g.moveTo(-6, -10); g.quadraticCurveTo(0, -15, 6, -10); g.stroke();
  pane(g, circPath(0, 14, 11), [236, 168, 150], 9730, { ew: 6, shade: .2, lw: 3.5 }); // nose
  paint(g, 3.2, .85); const mw = 15, mo = H.mouth;
  if (mo > .05) { g.fillStyle = 'rgba(70,16,20,.95)'; g.beginPath(); g.ellipse(0, 40, mw * .7, 3 + 9 * mo, 0, 0, TAU); g.fill(); }
  else { g.beginPath(); g.moveTo(-mw, 40); g.lineTo(mw, 40); g.stroke(); }
}
function hatShape(g, seed) { // his felt hat (the lover's, as draft 6's leaf hat): crown, ruby band, wide brim; brim at y = 0
  const o = { ew: 10, lw: 5, amt: .35, shade: .3 };
  pane(g, smoothPath([[-62, -2], [-58, -62], [-38, -100], [-12, -88], [0, -96], [12, -88], [38, -100], [58, -62], [62, -2]]), [86, 64, 52], seed, o);
  pane(g, polyPath([[-63, -2], [63, -2], [61, -30], [-61, -30]]), [150, 28, 44], seed + 1, o);
  pane(g, smoothPath([[-104, 4], [-80, -10], [0, -14], [80, -10], [104, 4], [84, 16], [0, 20], [-84, 16]]), [62, 46, 38], seed + 2, o);
  paint(g, 3, .55); g.beginPath(); g.moveTo(0, -90); g.quadraticCurveTo(-5, -60, 0, -34); g.stroke();
}
function hatState(t) { // world position until it lands on his head; then on his head (head-local), low over his eyes
  if (t < SH.yank - .1) return null;
  if (t < SH.hatOn) { const [hx, hy] = headTop(t); return { world: true, x: hx, y: fallY(t, SH.hatOn, -260, hy + 74, .3), r: .25 * (1 - lin(t, SH.hatOn - .3, SH.hatOn)) }; }
  const back = ease(t, 133.2, 133.5), bounce = Math.sin(Math.PI * lin(t, SH.hatOn, SH.hatOn + .22)) * 10 * (1 - lin(t, SH.hatOn, SH.hatOn + .22));
  return { world: false, y: lerp(4, -36, back) - bounce, r: -.16 * back };
}
function hostState(t) {
  return {
    lh: track(HK.lh, t), rh: track(HK.rh, t), look: track(HK.look, t), tilt: track(HK.tilt, t), lean: track(HK.lean, t), lid: lidAt(t),
    inPL: t > SH.pocket + .05 && t < 120.12, mouth: (t > SH.rise && t < SH.rise + .35 ? .6 : 0),
  };
}
// H, M: pose and transform (default: this bridge's); o.only = 'R' draws just the right arm, o.noR leaves it out,
// o.noHat / o.noStars leave those out, o.onHead(g) draws on top of his head (head-local), o.pocketDy moves the pockets up
function drawHost(g, t, H = hostState(t), M = hostXf(t), o = {}) {
  g.save(); g.setTransform(g.getTransform().multiply(M));
  const L = ik([-HOST.shX, HOST.shY], H.lh, HOST.up, HOST.lo, -1), R = ik([HOST.shX, HOST.shY], H.rh, HOST.up, HOST.lo, 1);
  if (o.only === 'R') { g.rotate(H.lean); seg(g, R, 48, 38, COAT, 9780); drawHostHand(g, R, 9790); g.restore(); return; }
  // shoes and trousers
  for (const sd of [-1, 1]) {
    seg(g, [[sd * 34, -230], [sd * 36, -130], [sd * 38, -26]], 60, 54, TROUS, 9740 + sd * 3);
    pane(g, ellPath(sd * 50, -14, 48, 18, 0), [26, 22, 24], 9746 + sd, { ew: 8, shade: .2, lw: 5 });
    g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(sd * 60, -20, 14, 4, 0, 0, TAU); g.fill();
  }
  g.rotate(H.lean);
  // the long coat, buttoned to the waist, and its lapels, shirt and bow tie
  pane(g, polyPath([[-66, -590], [-108, -560], [-128, -420], [-150, -196], [-18, -206], [0, -280], [18, -206], [150, -196], [128, -420], [108, -560], [66, -590]]), COAT, 9750, { ew: 34, shade: .34, lw: 8 });
  pane(g, polyPath([[-34, -592], [34, -592], [0, -470]]), [240, 238, 228], 9751, { ew: 8, shade: .12, lw: 5 });
  for (const sd of [-1, 1]) pane(g, polyPath([[sd * 34, -592], [sd * 68, -588], [sd * 54, -470], [0, -440], [0, -470]]), COAT2, 9752 + sd, { ew: 10, shade: .25, lw: 5 });
  pane(g, polyPath([[-26, -588], [0, -576], [-26, -562]]), C.ruby, 9755, { ew: 6, shade: .2, lw: 4 });
  pane(g, polyPath([[26, -588], [0, -576], [26, -562]]), C.ruby, 9756, { ew: 6, shade: .2, lw: 4 });
  pane(g, circPath(0, -576, 7), C.ruby2, 9757, { ew: 4, shade: .2, lw: 3 });
  for (const y of [-430, -360, -300]) pane(g, circPath(-10, y, 10), C.gold, 9758 + y, { ew: 5, shade: .25, lw: 4 });
  const pdy = o.pocketDy || 0;
  g.translate(0, pdy); drawPocket(g, -1, 9760); drawPocket(g, 1, 9765); g.translate(0, -pdy);
  // arms: sleeves, cuffs, hands; a hand in a pocket goes behind the pocket's front
  for (const [pts, sd] of [[L, -1], [R, 1]]) { if (sd > 0 && o.noR) continue; seg(g, pts, 48, 38, COAT, 9770 + sd * 10); drawHostHand(g, pts, 9780 + sd * 10); }
  if (H.inPL) { g.translate(0, pdy); drawPocket(g, -1, 9760); g.translate(0, -pdy); }
  // neck and head
  pane(g, polyPath([[-16, -586], [-15, -606], [15, -606], [16, -586]]), HSKIN, 9790, { ew: 8, shade: .3, lw: 4 });
  g.translate(0, HOST.headY); g.rotate(H.tilt);
  hostHead(g, t, H);
  if (o.onHead) o.onHead(g);
  const hs = o.noHat ? null : hatState(t);
  if (hs && !hs.world) { g.save(); g.translate(0, hs.y); g.rotate(hs.r); hatShape(g, 9800); g.restore(); }
  g.restore();
  if (hs && hs.world) { g.save(); g.translate(hs.x, hs.y); g.rotate(hs.r); hatShape(g, 9800); g.restore(); }
  // a ring of little gold stars round his head after each bonk
  if (!o.noStars) for (const h of SH.drops) {
    const u = lin(t, h, h + .75); if (u <= 0 || u >= 1) continue;
    const [hx, hy] = headTop(t);
    for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + u * 7; pane(g, starPath(hx + Math.cos(a) * 92, hy + 10 + Math.sin(a) * 22, 13 * Math.sin(Math.PI * u)), C.gold, 9810 + k, { ew: 5, shade: .2, lw: 3 }); }
  }
}

// ---------------- the sand runner: a strip of sand glass from his pocket ----------------
function pathCurve(s) { const x0 = HX0 - 110, P0 = [x0, 922], P1 = [x0 - 380, 940], P2 = [-160, 1040], u = 1 - s; return [u * u * P0[0] + 2 * u * s * P1[0] + s * s * P2[0], u * u * P0[1] + 2 * u * s * P1[1] + s * s * P2[1]]; }
function pathOpen(t) {
  if (t < SH.pathOut || t > SH.rolledUp) return 0;
  if (t < SH.pathFull) return 1 - Math.pow(1 - lin(t, SH.pathOut, SH.pathFull), 2);
  if (t < SH.refuse) return 1;
  return 1 - Math.pow(lin(t, SH.refuse, SH.rolledUp), 2);
}
function rollPos(t) { // where the roll is and how fat it is (null when it is in the pocket)
  if (t < SH.pocket + .25 || t > SH.inPocket) return null;
  if (t < 120.2) { const H = hostState(t), [hx, hy] = xfPt(hostXf(t), H.lh); return { x: hx - 18, y: hy - 10, r: 46 }; }
  if (t < SH.pathOut) { const u = lin(t, 120.2, SH.pathOut), H = hostState(120.2), [hx, hy] = xfPt(hostXf(t), H.lh), [px, py] = pathCurve(0); return { x: lerp(hx - 18, px, u), y: lerp(hy - 10, py - 40, u) - 60 * Math.sin(Math.PI * u), r: 46 }; }
  if (t < SH.rolledUp) { const e = pathOpen(t), [px, py] = pathCurve(e); return { x: px, y: py - lerp(46, 22, e), r: lerp(46, 22, e), spin: e * 26 }; }
  const u = lin(t, SH.rolledUp, SH.inPocket), [px, py] = pathCurve(0), [mx, my] = xfPt(hostXf(t), [-105, -446]);
  return { x: lerp(px, mx, u), y: lerp(py - 46, my, u) - 110 * Math.sin(Math.PI * u), r: 46 * (1 - .6 * u) };
}
function drawSandRunner(g, t) {
  const e = pathOpen(t);
  if (e > .002) {
    const n = Math.max(2, Math.ceil(e * 22));
    for (let k = 0; k < n; k++) {
      const s0 = e * k / n, s1 = e * (k + 1) / n, w0 = lerp(96, 420, s0) / 2, w1 = lerp(96, 420, s1) / 2;
      const a = pathCurve(s0), b = pathCurve(s1), q = [[a[0], a[1] - w0 * .45], [b[0], b[1] - w1 * .45], [b[0], b[1] + w1 * .45], [a[0], a[1] + w0 * .45]];
      pane(g, polyPath(q), [C.sand, C.sand2, [230, 184, 96]][k % 3], 9850 + k, { ew: 10, shade: .22, lw: 4 });
      for (let d = 0; d < 6; d++) { const u = rnd(k, d, 3), v = rnd(k, d, 4); g.fillStyle = d % 2 ? 'rgba(130,74,20,.55)' : 'rgba(255,240,190,.65)'; g.beginPath(); g.arc(lerp(a[0], b[0], u), lerp(a[1], b[1], u) + (v - .5) * w0 * .5, 2.2, 0, TAU); g.fill(); }
    }
  }
  const R = rollPos(t); if (!R) return;
  pane(g, circPath(R.x, R.y, R.r), C.sand2, 9849, { ew: 10, shade: .25, lw: 5 });
  paint(g, 2.5, .6); g.beginPath(); for (let k = 0; k < 40; k++) { const a = k * .45 + (R.spin || 0), r = R.r * k / 40; k ? g.lineTo(R.x + Math.cos(a) * r, R.y + Math.sin(a) * r) : g.moveTo(R.x, R.y); } g.stroke();
}
function drawPuffs(g, t) { // sand out of his pocket as the roll pops back in
  const u = lin(t, SH.inPocket, SH.inPocket + .5); if (u <= 0 || u >= 1) return;
  const [mx, my] = xfPt(hostXf(t), [-105, -446]);
  for (let k = 0; k < 9; k++) { const a = -Math.PI * (.1 + .8 * k / 8), r = 20 + 70 * u; g.fillStyle = `rgba(236,198,96,${.85 * (1 - u)})`; g.beginPath(); g.arc(mx + Math.cos(a) * r, my + Math.sin(a) * r * .8 + 30 * u * u, 6 * (1 - u * .5), 0, TAU); g.fill(); }
}

// ---------------- the rocks: each one bonks his head, bounces off and lands in a row: a bed ----------------
const ROCK = [
  { x: 250, rx: 84, ry: 64, col: [168, 174, 188], seed: 9900, pillow: true }, // the pillow, at the head end
  { x: 450, rx: 108, ry: 56, col: [112, 120, 136], seed: 9910 },
  { x: 650, rx: 104, ry: 54, col: [138, 132, 124], seed: 9920 },
];
ROCK.forEach((R, k) => { R.hit = SH.drops[k]; R.land = R.hit + .42; });
function rockPose(R, t) {
  const tF = R.hit - .34;
  if (t < tF) return null;
  const [hx, hy] = headTop(R.hit), by = FLOOR - R.ry;
  if (t < R.hit) return { x: hx, y: fallY(t, R.hit, -140, hy - R.ry * .8, .34), r: (t - tF) * 2, sq: 0 };
  if (t < R.land) { const u = (t - R.hit) / (R.land - R.hit); return { x: lerp(hx, R.x, u), y: lerp(hy - R.ry * .8, by, u * u) - 150 * Math.sin(Math.PI * u) * (1 - u * .4), r: .7 + u * 3, sq: 0 }; }
  return { x: R.x, y: by, r: 0, sq: pulse(t, R.land, 10) };
}
function drawRocks(g, t) {
  for (const R of ROCK) {
    const P = rockPose(R, t); if (!P) continue;
    g.save(); g.translate(P.x, P.y + R.ry * P.sq * .15); g.rotate(P.r); g.scale(1 + .12 * P.sq, 1 - .15 * P.sq);
    const p = blobAt(0, 0, R.rx, R.ry, R.seed, 8, .2);
    pane(g, p, R.col, R.seed, { ew: 22, shade: .4, lw: 6, amt: .6 });
    paint(g, 2.6, .5); g.beginPath(); g.moveTo(R.rx * .1, -R.ry * .9); g.lineTo(R.rx * .22, -R.ry * .3); g.lineTo(R.rx * .05, R.ry * .1); g.moveTo(-R.rx * .6, R.ry * .2); g.lineTo(-R.rx * .3, R.ry * .45); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.ellipse(-R.rx * .3, -R.ry * .4, R.rx * .28, R.ry * .14, -.4, 0, TAU); g.fill();
    if (R.pillow && t > R.land) drawPillowFace(g, t, R);
    g.restore();
  }
}
function drawPillowFace(g, t, R) { // the pillow stone opens its eyes on him, deadpan, shuts them, opens them on us when he is up
  const open = ease(t, 127.9, 128.15) * (1 - ease(t, 129.1, 129.3)) * blinkAt(t, 128.7) + ease(t, 129.9, 130.1) * blinkAt(t, 130.9);
  const lx = t < SH.rise ? .8 : 0, oy = 18;
  for (const sd of [-1, 1]) {
    const ex = sd * 22 + 10, ey = oy;
    if (open < .05) { paint(g, 2.4, .7); g.beginPath(); g.moveTo(ex - 8, ey); g.quadraticCurveTo(ex, ey + 4, ex + 8, ey); g.stroke(); continue; }
    g.fillStyle = 'rgba(248,246,236,1)'; g.beginPath(); g.ellipse(ex, ey, 9, 7 * open, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(30,24,20,1)'; g.beginPath(); g.arc(ex + lx * 4, ey + 1, 3.6 * open, 0, TAU); g.fill();
    paint(g, 2.2, .8); g.beginPath(); g.ellipse(ex, ey, 9, 7 * open, 0, 0, TAU); g.stroke();
  }
  const yawn = Math.sin(Math.PI * lin(t, 128.25, 128.75));
  if (yawn > .05) { g.fillStyle = 'rgba(60,40,40,.9)'; g.beginPath(); g.ellipse(10, oy + 24, 7, 9 * yawn, 0, 0, TAU); g.fill(); }
}

// ---------------- the heart on a string, which is pulled away again ----------------
function heartState(t) {
  if (t < SH.heartIn || t > SH.yank + .45) return null;
  const x = hostX(t) + 6, yIn = lerp(-180, 420, ease(t, SH.heartIn, 131.15)), yOut = lerp(0, -760, Math.pow(lin(t, SH.yank, SH.yank + .3), 2));
  const sw = .22 * Math.sin((t - SH.heartIn) * 5.2) * Math.exp(-(t - SH.heartIn) * 1.4);
  return { x, y: yIn + yOut, sw, beat: 1 + .1 * pulse(t, SH.flush, 6) + .06 * pulse(t, SH.flush + .32, 8) };
}
function drawHeart(g, t) {
  const S = heartState(t); if (!S) return;
  g.save(); g.translate(S.x, -120); g.rotate(S.sw);
  const L = S.y + 120;
  g.strokeStyle = rgb(C.gold); g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L - 50); g.stroke();
  g.translate(0, L); g.scale(S.beat, S.beat);
  const hp = smoothPath(heartPts(0, 0, 170, 160)), cuts = [[-90, -10, 90, -10], [0, -60, 0, 80], [-90, 36, 90, 36]];
  pane(g, hp, C.ruby, 9950, { ew: 30, shade: .35, lead: 0 });
  g.save(); g.clip(hp); for (const [a, b, c, d] of cuts) lead(g, polyPath([[a, b], [c, d]], false), 7); g.restore();
  lead(g, hp, 9);
  g.strokeStyle = 'rgba(255,220,230,.5)'; g.lineWidth = 5; g.beginPath(); g.arc(-36, -24, 22, 3.6, 4.6); g.stroke();
  const fl = pulse(t, SH.flush - .03, 4);
  if (fl > .02) { g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .55 * fl; g.fillStyle = 'rgb(255,150,170)'; g.fill(hp); g.restore(); }
  g.restore();
}

// ---------------- the owl: a hand puppet behind the counter's far end, and the cord it pulls ----------------
const OWL = { x: 1696, top: 470 }, CORD = { x: 1790, y0: 40, y1: 520 };
const TUGS = [SH.drops[0] - .42, SH.drops[1] - .42, SH.drops[2] - .42, SH.heartIn - .12, SH.yank - .14];
function tugAt(t) { let p = 0; for (const a of TUGS) p = Math.max(p, Math.exp(-Math.pow((t - a - .1) / .1, 2))); return p; }
function reachAt(t) { let p = 0; for (const a of TUGS) p = Math.max(p, ease(t, a - .25, a) * (1 - ease(t, a + .2, a + .4))); return p; }
const owlUp = (t) => easeOutBack(lin(t, SH.owlUp, SH.owlLands), 1.8);
function drawCord(g, t) {
  const y1 = CORD.y1 + 34 * tugAt(t);
  g.strokeStyle = rgb(C.gold); g.lineWidth = 6; g.beginPath(); g.moveTo(CORD.x, CORD.y0); g.lineTo(CORD.x, y1); g.stroke();
  lead(g, polyPath([[CORD.x, CORD.y0], [CORD.x, y1]], false), 2);
  pane(g, smoothPath([[CORD.x - 9, y1], [CORD.x + 9, y1], [CORD.x + 16, y1 + 42], [CORD.x - 16, y1 + 42]]), C.gold, 9960, { ew: 6, shade: .25, lw: 4 });
  pane(g, circPath(CORD.x, y1, 10), C.amber, 9961, { ew: 5, shade: .2, lw: 4 });
}
function drawOwl(g, t, look) {
  const up = owlUp(t); if (up <= .001) return;
  const nod = (t > SH.talk && t < SH.talkEnd ? 8 * Math.abs(Math.sin((t - SH.talk) * 5)) : 0) + 6 * pulse(t, SH.owlLands, 6);
  const x = OWL.x, y = lerp(OWL.top + 260, OWL.top, up) + nod;
  const lookAt = look || (t < 124.0 ? [-1, .2] : t < SH.wake ? (SH.drops.some((h) => t > h + .05 && t < h + .45) ? [0, 0] : [-1, .3]) : t < SH.lookUp ? [-1, .4] : [0, -1]);
  // body sack, paler belly with feather scallops
  pane(g, smoothPath([[x - 66, y + 230], [x - 70, y + 90], [x - 52, y + 18], [x - 30, y - 4], [x, y - 2], [x + 30, y - 4], [x + 52, y + 18], [x + 70, y + 90], [x + 66, y + 230]]), [126, 96, 74], 9970, { ew: 22, shade: .32, lw: 6 });
  pane(g, smoothPath([[x - 40, y + 230], [x - 44, y + 120], [x, y + 92], [x + 44, y + 120], [x + 40, y + 230]]), [222, 196, 158], 9971, { ew: 12, shade: .2, lw: 5 });
  paint(g, 2.2, .5); for (let r = 0; r < 3; r++) for (let c = -1; c <= 1; c++) { g.beginPath(); g.arc(x + c * 20 + (r % 2) * 10, y + 126 + r * 24, 9, .2, Math.PI - .2); g.stroke(); }
  for (const sd of [-1, 1]) pane(g, polyPath([[x + sd * 30, y + 6], [x + sd * 56, y - 30], [x + sd * 54, y + 22]]), [104, 78, 60], 9972 + sd, { ew: 8, shade: .25, lw: 4 }); // ear tufts
  // wings: the left hangs, the right reaches up for the cord before each drop
  pane(g, ellPath(x - 70, y + 120, 18, 52, .25), [100, 74, 56], 9975, { ew: 8, shade: .3, lw: 5 });
  const rc = reachAt(t), tip = [lerp(x + 84, CORD.x, rc), lerp(y + 150, CORD.y1 + 26 + 34 * tugAt(t), rc)];
  pane(g, smoothPath(limbPts([[x + 58, y + 80], [(x + 58 + tip[0]) / 2 + 12, (y + 80 + tip[1]) / 2], tip], [34, 26, 14])), [100, 74, 56], 9976, { ew: 8, shade: .3, lw: 5 });
  // eyes (gold discs), beak
  const bl = blinkAt(t, 125.9) * blinkAt(t, 133.0) * blinkAt(t, 136.0);
  for (const sd of [-1, 1]) {
    const ex = x + sd * 26, ey = y + 46;
    pane(g, circPath(ex, ey, 25), [244, 196, 40], 9978 + sd, { ew: 8, shade: .25, lw: 5 });
    g.fillStyle = 'rgba(16,12,10,1)'; g.beginPath(); g.ellipse(ex + lookAt[0] * 8, ey + lookAt[1] * 7, 10, Math.max(.5, 10 * bl), 0, 0, TAU); g.fill();
    if (bl < .9) { g.fillStyle = 'rgb(116,88,66)'; g.beginPath(); g.ellipse(ex, ey, 25, 25 * (1 - bl), 0, Math.PI, TAU); g.fill(); }
  }
  pane(g, polyPath([[x - 10, y + 66], [x + 10, y + 66], [x, y + 88]]), C.amber, 9980, { ew: 5, shade: .2, lw: 4 });
}

// ---------------- the counter, the teapot and the cup ----------------
const CTR = { x0: 1236, x1: 1770, top: 652 }, TPOT = { x: 1410, y: 652 }, TCUP = { x: 1604, y: 652 };
function drawCounter(g) {
  const { x0, x1, top } = CTR, n = 4, w = (x1 - x0) / n;
  for (let k = 0; k < n; k++) for (let r = 0; r < 2; r++) {
    const y0 = top + 60 + r * 94;
    pane(g, polyPath([[x0 + k * w, y0], [x0 + (k + 1) * w, y0], [x0 + (k + 1) * w, y0 + 94], [x0 + k * w, y0 + 94]]), [[150, 88, 40], [172, 104, 48], [132, 74, 34]][(k + r) % 3], 9990 + k * 2 + r, { ew: 26, shade: .34, lw: 7 });
    pane(g, ellPath(x0 + (k + .5) * w, y0 + 47, w * .26, 26), [204, 140, 60], 9998 + k * 2 + r, { ew: 10, shade: .2, lw: 4 });
  }
  pane(g, polyPath([[x0 - 6, FLOOR - 4], [x1 + 6, FLOOR - 4], [x1 + 6, FLOOR + 6], [x0 - 6, FLOOR + 6]]), [90, 50, 24], 10010, { ew: 4, shade: 0, lw: 4 });
  // the gingham cloth over the top, from the tea table, with a scalloped hem
  const cw = 46;
  for (let x = x0 - 20, k = 0; x < x1 + 20; x += cw, k++) for (let r = 0; r < 2; r++) {
    const y = top + r * 30, tone = (k % 2) + (r % 2);
    pane(g, polyPath([[x, y], [x + cw, y], [x + cw, y + 30], [x, y + 30]]), GING[tone], 10020 + k * 2 + r, { ew: 10, shade: .14, lw: 4, amt: .25 });
  }
  for (let x = x0 - 20, k = 0; x < x1 + 20; x += cw, k++) { const p = new Path2D(); p.moveTo(x, top + 60); p.arc(x + cw / 2, top + 60, cw / 2, 0, Math.PI, false); p.closePath(); pane(g, p, GING[k % 2 ? 2 : 1], 10080 + k, { ew: 8, shade: .14, lw: 4, amt: .25 }); }
}
function teapotState(t) {
  const awake = ease(t, SH.wake - .04, SH.wake + .1), peer = ease(t, SH.peer - .3, SH.peer) * (1 - ease(t, SH.sit - .1, SH.sit + .15));
  const talking = t > SH.talk && t < SH.talkEnd;
  const flap = talking ? Math.max(0, Math.sin((t - SH.talk) * TAU * 3.2)) * (1 - ease(t, SH.talkEnd - .3, SH.talkEnd)) : 0;
  const pop = pulse(t, SH.wake, 9) + pulse(t, SH.sit, 7) * .7;
  const turn = ease(t, SH.talk - .1, SH.talk + .2) * (1 - ease(t, SH.lookUp, SH.lookUp + .2));
  return { awake, peer, flap, pop, turn, look: t < SH.peer - .3 ? [-.6, 0] : peer > .5 ? [.9, .9] : turn > .5 ? [-1, -.1] : t > SH.lookUp ? [0, -1] : [0, 0] };
}
function drawTeapot(g, t, S = teapotState(t)) {
  g.save(); g.translate(TPOT.x + 96, TPOT.y); g.rotate(.42 * S.peer); g.translate(-96, 0); // tips toward the cup about its front foot
  g.translate(0, -12 * Math.sin(Math.PI * clamp((t - SH.wake) / .3)) * (t > SH.wake && t < SH.wake + .3 ? 1 : 0)); // a little hop as it wakes
  const body = smoothPath([[-108, -20], [-112, -92], [-84, -158], [0, -184], [84, -158], [112, -92], [108, -20], [70, -2], [-70, -2]]);
  // handle and spout
  g.save(); g.lineWidth = 26; g.strokeStyle = LEAD; g.beginPath(); g.moveTo(-100, -140); g.bezierCurveTo(-190, -150, -190, -40, -100, -46); g.stroke();
  g.lineWidth = 16; g.strokeStyle = rgb([236, 232, 220]); g.stroke(); g.restore();
  pane(g, smoothPath(limbPts([[96, -70], [150, -96], [196, -160]], [44, 30, 24])), [236, 232, 220], 10100, { ew: 10, shade: .25, lw: 6 });
  pane(g, ellPath(198, -164, 15, 8, -.9), [120, 90, 60], 10101, { ew: 4, shade: .1, lw: 4 });
  pane(g, body, [246, 242, 230], 10102, { ew: 34, shade: .22, lw: 8, amt: .3 });
  pane(g, polyPath([[-110, -58], [110, -58], [108, -30], [-108, -30]]), CUPCOL.blue, 10103, { ew: 8, shade: .2, lw: 5 });
  for (let k = 0; k < 6; k++) { const fx = -90 + k * 36; pane(g, circPath(fx, -44, 8), k % 2 ? CUPCOL.pink : [236, 230, 210], 10104 + k, { ew: 4, shade: .1, lw: 3 }); }
  // lid: lifts on each flap (it talks with its lid) and pops when it wakes
  const lift = 20 * S.flap + 16 * S.pop;
  g.save(); g.translate(0, -180 - lift); g.rotate(-.18 * S.flap);
  pane(g, ellPath(0, 0, 56, 18), [240, 236, 222], 10110, { ew: 8, shade: .2, lw: 5 });
  pane(g, circPath(0, -22, 13), CUPCOL.blue, 10111, { ew: 5, shade: .2, lw: 4 });
  g.restore();
  // face: asleep until it wakes, then spectacles, eyes on the cup, then on the host
  const fx = -12 * S.turn, ey = -118;
  for (const sd of [-1, 1]) {
    const ex = fx + sd * 32;
    if (S.awake < .5) { paint(g, 3, .8); g.beginPath(); g.moveTo(ex - 13, ey); g.quadraticCurveTo(ex, ey + 7, ex + 13, ey); g.stroke(); }
    else { g.fillStyle = 'rgba(250,250,244,1)'; g.beginPath(); g.ellipse(ex, ey, 14, 11, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(26,20,40,1)'; g.beginPath(); g.arc(ex + S.look[0] * 6, ey + S.look[1] * 4, 5.5, 0, TAU); g.fill(); paint(g, 2.2, .8); g.beginPath(); g.ellipse(ex, ey, 14, 11, 0, 0, TAU); g.stroke(); }
    g.strokeStyle = rgb(C.gold); g.lineWidth = 3.5; g.beginPath(); g.arc(ex, ey + 8 * S.peer, 21, 0, TAU); g.stroke(); // spectacles slide down as it peers
  }
  g.strokeStyle = rgb(C.gold); g.lineWidth = 3.5; g.beginPath(); g.moveTo(fx - 11, ey + 8 * S.peer); g.lineTo(fx + 11, ey + 8 * S.peer); g.stroke();
  if (S.flap > .05) { g.fillStyle = 'rgba(60,14,24,.95)'; g.beginPath(); g.ellipse(fx, -80, 14, 4 + 12 * S.flap, 0, 0, TAU); g.fill(); }
  else { paint(g, 3, .8); g.beginPath(); g.moveTo(fx - 14, -80); g.quadraticCurveTo(fx, -76 + 4 * S.awake, fx + 14, -80); g.stroke(); }
  g.restore();
  // a little steam from the spout as it talks
  if (t > SH.talk && t < SH.talkEnd + .4) {
    for (let k = 0; k < 4; k++) {
      const ph = ((t - SH.talk) * 1.6 + k / 4) % 1, a = Math.max(0, .5 * (1 - ph)) * (1 - ease(t, SH.talkEnd, SH.talkEnd + .4));
      g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.arc(TPOT.x + 200 + Math.sin(ph * 6 + k) * 10, TPOT.y - 180 - ph * 90, 8 + ph * 12, 0, TAU); g.fill();
    }
  }
}
function drawCup(g) {
  const { x, y } = TCUP;
  pane(g, ellPath(x, y - 8, 96, 14), [244, 236, 220], 10120, { ew: 10, shade: .18, lw: 5, amt: .3 });
  g.save(); g.lineWidth = 18; g.strokeStyle = LEAD; g.beginPath(); g.arc(x + 66, y - 58, 22, -1.4, 1.4); g.stroke(); g.lineWidth = 9; g.strokeStyle = rgb([246, 240, 228]); g.stroke(); g.restore();
  pane(g, smoothPath([[x - 66, y - 92], [x + 66, y - 92], [x + 56, y - 44], [x + 30, y - 20], [x - 30, y - 20], [x - 56, y - 44]]), [248, 242, 230], 10121, { ew: 16, shade: .2, lw: 6, amt: .3 });
  g.strokeStyle = 'rgba(200,160,70,.95)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 62, y - 82); g.lineTo(x + 62, y - 82); g.stroke();
  for (let k = 0; k < 5; k++) pane(g, circPath(x - 40 + k * 20, y - 58, 6), k % 2 ? CUPCOL.blue : CUPCOL.pink, 10122 + k, { ew: 3, shade: .1, lw: 2.5 });
  pane(g, ellPath(x, y - 92, 66, 11), CUPCOL.tea, 10130, { ew: 8, shade: .2, lw: 5 });
}

// ---------------- the set: a morning sky in quarries, a sun with a face, cloud flats, hills, the floor ----------------
const SKYQ = [];
(function buildSky() {
  const qw = 64, qh = 92;
  for (let row = 0, cy = 960; cy > -200; row++, cy -= qh) for (let cx = -160 + (row % 2) * qw; cx < 2200; cx += qw * 2)
    SKYQ.push({ path: polyPath([[cx - qw, cy], [cx, cy - qh], [cx + qw, cy], [cx, cy + qh]]), cx, cy, seed: 11000 + row * 53 + Math.round(cx / qw), k: (((row * 3 + Math.round(cx / qw)) % 4) + 4) % 4 });
})();
const SUN = { x: 360, y: 300, r: 112 };
function sunFace(t) { // winces at the bonks, dozes while he lies on the rocks
  let shut = 0; for (const h of SH.drops) shut = Math.max(shut, ease(t, h - .05, h) * (1 - ease(t, h + .3, h + .45)));
  shut = Math.max(shut, ease(t, SH.lie + .3, SH.lie + .8) * (1 - ease(t, SH.rise, SH.rise + .15)));
  return { shut, smile: .5 + .5 * pulse(t, SH.flush, 2) };
}
function drawBackdrop(g, t, view) {
  g.fillStyle = 'rgb(150,190,220)'; g.fillRect(view.x0 - 10, view.y0 - 10, view.x1 - view.x0 + 20, FLOOR - view.y0 + 20);
  const QC = [[150, 196, 228], [170, 208, 232], [132, 182, 220], [188, 216, 230]];
  for (const Q of SKYQ) {
    if (Q.cx < view.x0 - 70 || Q.cx > view.x1 + 70 || Q.cy < view.y0 - 100 || Q.cy > Math.min(view.y1, FLOOR) + 100) continue;
    pane(g, Q.path, QC[Q.k], Q.seed, { ew: 22, shade: .22, lw: 5, amt: .5 });
  }
  // sun: rays, disc, face
  const F = sunFace(t), rot = t * .15;
  for (let k = 0; k < 16; k++) {
    const a = rot + k / 16 * TAU, a2 = a + TAU / 32, a3 = a - TAU / 32, r0 = SUN.r + 6, r1 = SUN.r + (k % 2 ? 54 : 80);
    pane(g, polyPath([[SUN.x + Math.cos(a3) * r0, SUN.y + Math.sin(a3) * r0], [SUN.x + Math.cos(a) * r1, SUN.y + Math.sin(a) * r1], [SUN.x + Math.cos(a2) * r0, SUN.y + Math.sin(a2) * r0]]), k % 2 ? C.amber : C.gold, 11500 + k, { ew: 8, shade: .2, lw: 5 });
  }
  pane(g, circPath(SUN.x, SUN.y, SUN.r), [246, 196, 60], 11520, { ew: 40, shade: .22, lw: 8 });
  for (const sd of [-1, 1]) {
    const ex = SUN.x + sd * 38, ey = SUN.y - 18;
    paint(g, 5, .85);
    if (F.shut > .5) { g.beginPath(); g.moveTo(ex - 16, ey); g.lineTo(ex + 16, ey); g.stroke(); }
    else { g.beginPath(); g.arc(ex, ey + 6, 15, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.fillStyle = 'rgba(42,24,12,.85)'; g.beginPath(); g.arc(ex, ey + 2, 5, 0, TAU); g.fill(); }
  }
  g.fillStyle = 'rgba(232,110,60,.4)'; for (const sd of [-1, 1]) { g.beginPath(); g.arc(SUN.x + sd * 62, SUN.y + 22, 16, 0, TAU); g.fill(); }
  paint(g, 5, .85); g.beginPath(); g.arc(SUN.x, SUN.y + 18, 40, .25 * Math.PI + (1 - F.smile) * .2, .75 * Math.PI - (1 - F.smile) * .2); g.stroke();
  // cloud flats on sticks, bobbing a little out of step
  for (const [k, cx, cy, s] of [[0, 1010, 210, 1], [1, 1480, 150, .8], [2, 700, 120, .6]]) {
    const y = cy + 8 * Math.sin(t * 1.3 + k * 2);
    g.strokeStyle = 'rgba(90,70,50,.8)'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, y + 50 * s); g.lineTo(cx, -40); g.stroke();
    pane(g, smoothPath([[cx - 120 * s, y + 40 * s], [cx - 130 * s, y], [cx - 80 * s, y - 40 * s], [cx - 20 * s, y - 64 * s], [cx + 50 * s, y - 50 * s], [cx + 110 * s, y - 20 * s], [cx + 128 * s, y + 30 * s], [cx + 60 * s, y + 52 * s], [cx - 60 * s, y + 54 * s]]), [246, 246, 240], 11530 + k, { ew: 22, shade: .2, lw: 6 });
  }
  // two rolling hills (painted flats) and a few round glass flowers
  pane(g, smoothPath([[-200, FLOOR + 10], [-200, 720], [200, 640], [640, 690], [980, 780], [1100, FLOOR + 10]]), [82, 160, 70], 11540, { ew: 40, shade: .3, lw: 8 });
  pane(g, smoothPath([[700, FLOOR + 10], [900, 760], [1400, 690], [1900, 720], [2200, 760], [2200, FLOOR + 10]]), [56, 136, 60], 11541, { ew: 40, shade: .3, lw: 8 });
  for (const [k, fx, fy] of [[0, 120, 760], [1, 300, 720], [2, 520, 760], [3, 1500, 760], [4, 1700, 750], [5, 1960, 780]]) {
    g.strokeStyle = 'rgba(30,80,30,.9)'; g.lineWidth = 5; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx, fy + 60); g.stroke();
    pane(g, circPath(fx, fy, 18), k % 2 ? [226, 120, 160] : [120, 150, 220], 11550 + k, { ew: 8, shade: .2, lw: 4 });
    g.fillStyle = rgb(C.gold); g.beginPath(); g.arc(fx, fy, 6, 0, TAU); g.fill();
  }
}
function drawFloor(g, t, view) {
  const rows = [[FLOOR, 76, 120], [FLOOR + 76, 96, 150], [FLOOR + 172, 140, 190]];
  rows.forEach(([y, h, w], r) => {
    for (let x = -400 + (r % 2) * w / 2, k = 0; x < 2400; x += w, k++) {
      if (x > view.x1 || x + w < view.x0 || y > view.y1) continue;
      pane(g, polyPath([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), (k + r) % 2 ? [236, 226, 200] : [70, 140, 150], 11600 + r * 40 + k, { ew: 16, shade: .2, lw: 6, amt: .35 });
    }
  });
  const u = plankU(t), sx = hostX(t) - 330 * u;
  g.fillStyle = 'rgba(20,30,40,.25)'; g.beginPath(); g.ellipse(sx, FLOOR + 14, 200 + 220 * u, 22, 0, 0, TAU); g.fill();
}
function drawValance(g, t) {
  // scalloped ruby valance with a gold rope, and ruby drapes at the sides (the flies are behind it)
  const p = new Path2D(); p.moveTo(-300, -400); p.lineTo(2300, -400); p.lineTo(2300, 70);
  for (let x = 2300; x > -300; x -= 120) p.arc(x - 60, 70, 60, 0, Math.PI, false);
  p.closePath();
  pane(g, p, C.ruby, 11700, { ew: 40, shade: .35, lw: 9 });
  for (let x = -300; x < 2300; x += 120) { lead(g, polyPath([[x, -400], [x, 70]], false), 5); g.fillStyle = rgb(C.gold); g.beginPath(); g.arc(x - 60, 128, 9, 0, TAU); g.fill(); lead(g, circPath(x - 60, 128, 9), 3); }
  g.strokeStyle = rgb(C.gold); g.lineWidth = 12; g.beginPath(); g.moveTo(-300, 40); g.lineTo(2300, 40); g.stroke(); lead(g, polyPath([[-300, 34], [2300, 34]], false), 3); lead(g, polyPath([[-300, 46], [2300, 46]], false), 3);
  for (const [sd, x] of [[-1, 0], [1, 1920]]) {
    const xi = x - sd * 80, xo = x + sd * 300;
    pane(g, smoothPath([[xo, -100], [xi, -100], [xi + sd * 30, 300], [xi - sd * 20, 700], [xi + sd * 10, 1000], [xo, 1000]]), C.ruby2, 11710 + sd, { ew: 40, shade: .4, lw: 9 });
    paint(g, 5, .35); for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(xi + sd * k * 40, -100); g.quadraticCurveTo(xi + sd * (k * 40 - 20), 500, xi + sd * k * 44, 1000); g.stroke(); }
  }
  // dust and glitter sifting down from the flies just before the Pips' stage drops
  const d = ease(t, SH.lookUp - .1, SH.lookUp + .2);
  if (d > 0) for (let k = 0; k < 40; k++) { const x = rnd(k, 61) * 1920, ph = ((t - SH.lookUp) * (.8 + rnd(k, 62)) + rnd(k, 63)) % 1; g.fillStyle = `rgba(255,236,170,${.8 * d * (1 - ph)})`; g.beginPath(); g.arc(x, 100 + ph * 700, 3, 0, TAU); g.fill(); }
}

// ---------------- camera on the set ----------------
const SCAM = [
  [118.3, 980, 520, 1.06], [SH.irisC, 960, 540, 1.0], [121.2, 960, 540, 1.0], [123.2, 930, 540, 1.0], [126.8, 930, 540, 1.0],
  [127.7, 600, 660, 1.22], [129.3, 600, 660, 1.22], [130.1, 920, 520, 1.18], [131.1, 950, 470, 1.28], [131.7, 950, 470, 1.28],
  [132.5, 920, 380, 1.55], [133.9, 930, 380, 1.55], [135.4, 1270, 520, 1.25], [135.8, 1280, 525, 1.27], [136.35, 1460, 560, 1.62],
  [136.9, 1460, 560, 1.62], [137.8, 1260, 490, 1.42], [139.3, 1250, 485, 1.44], [139.9, 1120, 440, 1.2], [140.4, 1100, 430, 1.16],
];
function setCam(t) {
  let i = 0; while (i + 2 < SCAM.length && SCAM[i + 1][0] <= t) i++;
  const a = SCAM[i], b = SCAM[i + 1], u = ease(t, a[0], b[0]);
  const c = { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), z: Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)) };
  for (const h of SH.drops) c.z *= 1 + .03 * pulse(t, h, 10); // a small kick on each bonk
  return c;
}

// ---------------- the frame ----------------
function drawSet(g, t, camOverride) {
  const cam = camOverride || setCam(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, H / 2 - cam.y * cam.z);
  const hw = W / 2 / cam.z, hh = H / 2 / cam.z, view = { x0: cam.x - hw, x1: cam.x + hw, y0: cam.y - hh, y1: cam.y + hh };
  drawBackdrop(g, t, view); drawFloor(g, t, view);
  drawCord(g, t); drawOwl(g, t); drawCounter(g); drawTeapot(g, t); drawCup(g);
  drawRocks(g, t); drawSandRunner(g, t);
  drawHost(g, t); drawPuffs(g, t); drawHeart(g, t);
  drawValance(g, t);
  // finish, as the Pips' stage: glass texture, warm light, a soft spot on the host, bloom, vignette, grain
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .5; g.fillStyle = texPattern(g); g.fillRect(0, 0, W, H);
  g.globalAlpha = 1; g.globalCompositeOperation = 'multiply'; g.fillStyle = rgb([255, 250, 238]); g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'screen';
  { const [hx, hy] = headTop(t), sx = W / 2 + (hx - cam.x) * cam.z, sy = H / 2 + (hy + 260 - cam.y) * cam.z, R = 520 * cam.z;
    const rg = g.createRadialGradient(sx, sy, 0, sx, sy, R); rg.addColorStop(0, 'rgba(255,240,214,.14)'); rg.addColorStop(1, 'rgba(255,240,214,0)'); g.fillStyle = rg; g.fillRect(sx - R, sy - R, R * 2, R * 2); }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  bloom(g, .3);
  const vg = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .65); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.26)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  drawGrain(g, t, .06);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

// The iris: verse 2's push carries on into the cup (bridge-main draws it) and the tea's surface opens into a round
// leaded window onto the set, which widens until it fills the frame.
const SH_OLD = mkCanvas(W, H), shOld = SH_OLD.getContext('2d');
let shBase = false;
function irisAt(t) {
  const cam = camAt(t), cx = W / 2 + (1565 - cam.x) * cam.z, cy = H / 2 + (450 - cam.y) * cam.z, well = 228 * cam.z;
  const r = t < SH.irisB ? well * ease(t, SH.irisA, SH.irisB) : lerp(well, 1500, Math.pow(lin(t, SH.irisB, SH.irisC), 1.6));
  return { cx, cy, r };
}
// Called from bridge-main's renderFrame (after the Pips' check). Returns true when it has drawn the frame.
function showFrame(t, renderBase) {
  if (shBase || t < SH.irisA || t >= SH.end) return false;
  if (t >= SH.irisC) { drawSet(g, t); return true; }
  const I = irisAt(t);
  shBase = true; renderBase(t); shBase = false; // the cup, as draft 6 draws it
  shOld.clearRect(0, 0, W, H); shOld.drawImage(out, 0, 0);
  // the set as seen through the window: its camera keeps the host in the middle of the hole until it opens
  const k = ease(t, SH.irisB, SH.irisC), base = setCam(t), z = base.z;
  const cam = { x: lerp(HX0 - (I.cx - W / 2) / z, base.x, k), y: lerp(420 - (I.cy - H / 2) / z, base.y, k), z };
  drawSet(g, t, cam);
  shOld.save(); shOld.beginPath(); shOld.arc(I.cx, I.cy, Math.max(.1, I.r), 0, TAU); shOld.clip(); shOld.drawImage(out, 0, 0); shOld.restore();
  if (I.r > 1) { const ring = circPath(I.cx, I.cy, I.r); shOld.lineWidth = 22; shOld.strokeStyle = LEAD; shOld.stroke(ring); shOld.lineWidth = 10; shOld.strokeStyle = rgb(C.gold); shOld.stroke(ring); shOld.lineWidth = 2.5; shOld.strokeStyle = 'rgba(92,84,74,.6)'; shOld.stroke(ring); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.drawImage(SH_OLD, 0, 0);
  return true;
}
