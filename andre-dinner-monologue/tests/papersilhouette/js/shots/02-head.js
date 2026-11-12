// Shots 3 and 4, f2830-f3384 (117.92-141.0). One big head in profile, two paper layers: on
// "schizophrenia" the layers slide apart (capped and bare) and back on "result"; on "lobotomized" the
// crown lifts off; on "see it as a prison" bricks close over the head as an iris until only a slit at
// the eye is left. Then a big open hand from below; a second hand drops the seed into it on "seed";
// on "pine tree" a tiny pine; on "escape" the pine shoots up through the slit and the bricks fall
// away past the camera; hold the pine and the open hand to the end.
(() => {
const T = { start: 2830 / 24, split: 120.705, guards: 121.29, prisoners: 122.07, rejoin: 123.475, lobot: 125.305,
  see: 129.46, prison: 130.32, then: 132.105, took: 133.355, seed: 133.845, pine: 135.845, hand: 137.62, escape: 138.785, end: 3384 / 24 };
const HX = 330, HY = 800, K = 1.1;                    // the head: neck pivot on screen, scale
const EYE_S = { x: HX + (EYE.x - 580) * K, y: HY + (EYE.y - 800) * K };   // (462, 446)
const LID_Y = 340;                                     // head units: the lobotomy cut
const SLIT = { x: EYE_S.x, y: EYE_S.y, w: 240, h: 64 };
// ---- the two head layers ----
function headLayer(t, col, dx, capped) {
  const lift = 56 * arrive(t, T.lobot, 2.0, .62);
  const breathe = Math.sin(t * .8) * 3;
  const draw = (clipBelow, dy, rot) => {
    g.save(); g.translate(HX + dx, HY + breathe + dy);
    if (rot) { g.translate(0, (LID_Y - 800) * K); g.rotate(rot); g.translate(0, -(LID_Y - 800) * K); }
    const m = g.getTransform(); g.scale(K, K); g.translate(-580, -800); g.beginPath();
    if (clipBelow) g.rect(-400, LID_Y, 1800, 1400); else g.rect(-400, -600, 1800, LID_Y + 600);
    g.clip(); g.setTransform(m);
    head(col, K, 0, { cap: capped ? 1 : 0, eyeCol: clipBelow ? C.ground : null, eyeW: 9 });
    g.restore();
  };
  draw(true, 0, 0);                                   // the face
  draw(false, -lift, -.05 * (lift / 56));             // the crown, lifted off on "lobotomized"
}
function heads(t) {
  const apart = ss(T.split, T.split + .35, t) * (1 - ss(T.rejoin, T.rejoin + .4, t));
  const k = apart * (1 + .08 * Math.sin(Math.min(1, (t - T.split) / .35) * Math.PI));   // a little overshoot as they part
  const nudgeG = 22 * bump(t, T.guards, .5), nudgeP = 22 * bump(t, T.prisoners, .5);
  // on "escape" the two layers leave: the capped one left, the bare one right
  const gone = ei(clamp((t - T.escape - .05) / .55)) * 1000;
  headLayer(t, C.wall, 90 * k + nudgeP + gone, false);          // the bare prisoner, behind, leads to the right
  headLayer(t, C.fig, -90 * k - nudgeG - gone, true);           // the capped guard, in front
}
// ---- the brick iris: 22 rows of 120x64 bricks, outer rows first, the slit row last ----
const ROWS = []; for (let n = -8; n <= 13; n++) ROWS.push(n);
const rowY = (n) => SLIT.y - SLIT.h / 2 + n * 64;
const dist = (n) => n < 0 ? -n / 8 : n / 13;
function rowBricks(n) {
  const off = (n & 1) ? -60 : 0, out = [];
  for (let c = 0; c < 8; c++) { const x = off + c * 120; if (x > W) break;
    if (n === 0 && x + 120 > SLIT.x - SLIT.w / 2 && x < SLIT.x + SLIT.w / 2) {
      // the slit row: bricks either side of the opening, cut to fit
      if (x < SLIT.x) { const w = SLIT.x - SLIT.w / 2 - x; if (w > 8) out.push({ x, w, side: -1 }); }
      if (x + 120 > SLIT.x) { const x1 = SLIT.x + SLIT.w / 2, w = x + 120 - x1; if (w > 8) out.push({ x: x1, w, side: 1 }); }
      continue;
    }
    out.push({ x, w: 120, side: (n & 1) ? 1 : -1 });
  }
  return out;
}
function bricksIn(t, falling) {
  // falling = false draws the bricks still in place; true draws the ones falling (in front of everything)
  for (const n of ROWS) {
    const d = dist(n);
    const t0 = T.see + (1 - d) * .56;                 // the row slides in
    if (t < t0) continue;
    const k = arrive(t, t0, 3.2, .7);
    const y = rowY(n) + 32;
    for (const b of rowBricks(n)) {
      const seed = n * 17 + b.x * .13;
      const fall0 = T.escape + d * .32 + hash(seed) * .07;
      const isFalling = t >= fall0;
      if (isFalling !== falling) continue;
      let x = b.x + b.w / 2, sc = 1, rot = 0, yy = y;
      if (!isFalling) x += (1 - k) * (n === 0 ? b.side : (n & 1 ? 1 : -1)) * (W + 140);
      else {
        const u = (t - fall0) / .6; if (u > 1.05) continue;
        sc = 1 + 1.6 * u * u; yy = y + 1900 * u * u; x = 360 + (x - 360) * (1 + 1.3 * u * u); rot = (hash(seed + 3) - .5) * .9 * u;
      }
      g.save(); g.translate(x, yy); g.rotate(rot); g.scale(sc, sc); brick(b.w, 64, seed, C.wall, { lift: isFalling ? .8 : .3 }); g.restore();
    }
  }
}
// ---- the hands, the seed, the pine ----
const HS = .9, HO = { x: EYE_S.x - HAND_SEAT.x * HS, y: 972 };   // the open hand's origin: the seed seat sits under the eye
const SEAT = { x: EYE_S.x, y: HO.y + HAND_SEAT.y * HS };          // (462, 902)
function openHandY(t) { return HO.y + 520 * (1 - arrive(t, T.then, 1.3, .74)) - 14 * bump(t, T.hand, .5); }
const HOVER = { x: SEAT.x - 4, y: SEAT.y - 108 };
function pinchPos(t) {
  const inK = eo(clamp((t - (T.took - .1)) / .45)), outK = ei(clamp((t - (T.seed + .35)) / .6));
  const from = { x: 920, y: 260 };
  const x = lerp(lerp(from.x, HOVER.x, inK), from.x, outK), y = lerp(lerp(from.y, HOVER.y, inK), from.y, outK);
  return { x, y: y + Math.sin(t * 1.1) * 2 };
}
function seedPos(t) {
  const drop0 = T.seed - .24;
  if (t < drop0) { const p = pinchPos(t); return { x: p.x, y: p.y + 14, rot: -.3, held: true }; }
  const u = clamp((t - drop0) / .24);
  const y = lerp(HOVER.y + 14, SEAT.y, u * u) - 8 * bump(t, T.seed, .2);
  return { x: SEAT.x, y: Math.min(y, SEAT.y + 4), rot: lerp(-.3, -.1, u), held: false };
}
function pineH(t) {
  const small = 56 * arrive(t, T.pine, 2.5, .6);
  if (t < T.escape) return small;
  return 56 + (740 - 56) * spring(t - T.escape, .74, 1.15);
}
SHOT(T.start, T.end, 'head', (t) => {
  sheet(C.ground);
  heads(t);
  bricksIn(t, false);
  const hy = openHandY(t), sp = seedPos(t), ph = pineH(t);
  const dy = hy - HO.y;                                   // the hand carries the seed and the pine with it
  // the pine behind the wall above the slit, in front of it below (it shoots up through the opening)
  if (ph > 0) { g.save(); g.beginPath(); g.rect(0, -100, W, SLIT.y + SLIT.h / 2 + 100); g.clip(); pine(SEAT.x, SEAT.y - 10 + dy, ph); g.restore(); }
  handOpen(HO.x, hy, HS);
  if (ph > 0) { g.save(); g.beginPath(); g.rect(0, SLIT.y + SLIT.h / 2, W, H); g.clip(); pine(SEAT.x, SEAT.y - 10 + dy, ph); g.restore(); }
  if (t >= T.took - .1 && t < T.seed + 1.0) handPinch(pinchPos(t).x, pinchPos(t).y, HS, 0);
  if (t >= T.took - .1 && ph < 140) seed(sp.x, sp.y + (sp.held ? 0 : dy), 28, sp.rot);
  bricksIn(t, true);
}, { xin: .45, tr: 'rise' });
})();
