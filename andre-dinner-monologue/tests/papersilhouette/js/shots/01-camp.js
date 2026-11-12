// Shots 1 and 2, f2548-f2830 (106.0-117.92): "I think that New York is the new model for the new
// concentration camp, where the camp has been built by the inmates themselves, and the inmates are the
// guards, and they have this pride in this thing they've built. They've built their own prison."
// A cut-paper skyline rises tower by tower; six small figures carry bricks in and wall themselves in;
// on "guards" they turn and gain caps; on "pride" they hop up and stand on the wall, chests out.
(() => {
const T = { start: 106.0, towers: 106.05, camp: 109.85, where: 110.415, built: 111.475, themselves: 112.35,
  guards: 114.03, pride: 115.06, prison: 117.8, end: 2830 / 24 };
const GY = 1180, S = .2;                     // ground line; figures 200 px tall
const BW = 98, BH = 44, WX0 = 63, NB = 6;    // the wall: six slots, two courses, 588 px wide
const slotX = (k) => WX0 + BW / 2 + BW * k;
const WALL_TOP = GY - 2 * BH;
const V = 340;                               // walking speed px/s
const land = (k) => T.camp + (NB - 1 - k) * .38;   // slot 5 first, slot 0 last
// ---- the skyline: nine towers, rising in a shuffled order on "New York" ----
const TOWERS = [
  { x: -14, w: 74, h: 390, step: 0, o: 5 }, { x: 64, w: 92, h: 540, step: 26, o: 1 }, { x: 158, w: 70, h: 300, step: 0, o: 7 },
  { x: 236, w: 112, h: 650, step: 40, o: 0 }, { x: 352, w: 66, h: 430, step: 0, o: 4 }, { x: 424, w: 96, h: 580, step: 30, o: 2 },
  { x: 526, w: 78, h: 350, step: 0, o: 8 }, { x: 602, w: 90, h: 490, step: 22, o: 3 }, { x: 684, w: 80, h: 310, step: 0, o: 6 },
];
function skyline(t) {
  g.save(); g.beginPath(); g.rect(-20, -20, W + 40, GY + 20); g.clip();     // the slot: towers rise out of the ground line
  TOWERS.forEach((tw, i) => {
    const k = arrive(t, T.towers + tw.o * .2, 1.5, .67);
    if (k <= 0) return;
    tower(tw.x, GY, tw.w, Math.round(tw.h * k), i * 11 + 2, { step: tw.step });
  });
  g.restore();
}
// ---- the wall bricks: brick (k, course) drops into its slot after the figure arrives ----
function wallBricks(t) {
  for (let k = 0; k < NB; k++) for (let c = 0; c < 2; c++) {
    const t0 = land(k) + c * .12;
    if (t < t0) continue;
    const u = clamp((t - t0) / .22);
    const yTarget = GY - BH / 2 - c * BH;
    const y = lerp(GY - 1000 * S - 2 * BH + (1 - c) * BH, yTarget, ei(u)) - 6 * bump(t, t0 + .22, .18);   // falls from the hands, a small settle
    g.save(); g.translate(slotX(k), y); brick(BW, BH, k * 3 + c); g.restore();
  }
}
// ---- the figures ----
function figure(t, k, layer) {
  const tl = land(k), xs = slotX(k);
  const tEnter = tl - (xs + 70) / V;
  if (t < tEnter) return;
  const x = Math.min(xs, -70 + V * (t - tEnter));
  const walking = x < xs - .5;
  const ph = x / STRIDE(S) * Math.PI;
  let pose, dir = 1;
  const upHold = 1 - ss(tl, tl + .35, t);                   // arms come down after the drop
  const carryArm = [Math.PI - .12, .02], restArm = [0, .15];
  const mixA = (a, b, w) => [lerp(a[0], b[0], w), lerp(a[1], b[1], w)];
  if (walking) pose = { ...POSE.walk(ph), arms: [carryArm, carryArm] };
  else pose = { arms: [mixA(restArm, carryArm, upHold), mixA(restArm, carryArm, upHold)], bob: 0 };
  if (t < tl) pose.holdNear = () => { g.translate(0, -8 / S); stackHeld(2, BW, BH, S); };
  // standing: a slow breath, a look up at what they built on "themselves"
  if (!walking) { pose.bob = (pose.bob || 0) + Math.sin(t * 1.3 + k) * 3; pose.head = .12 * bump(t, T.themselves + k * .08, 1.4); }
  // "guards": a paper turn to face the outside, and the cap pops on (left to right)
  const tg = T.guards + k * .045;
  const turn = clamp((t - tg) / .17);
  if (t >= tg) { const d = lerp(1, -1, turn); dir = Math.sign(d || -1) * Math.max(.28, Math.abs(d)); }
  pose.cap = arrive(t, tg + .05, 2.6, .6);
  // "pride": a hop up onto the wall, then hands on hips, chest out
  const tp = T.pride + k * .035, hop0 = tp - .36;
  let y = GY;
  if (t < hop0) { if (layer === 'front') return; }
  if (t >= hop0) {
    const u = clamp((t - hop0) / .36);
    y = lerp(GY, WALL_TOP, u) - 60 * Math.sin(u * Math.PI);
    const w = ss(tp - .05, tp + .25, t);
    pose.arms = [mixA(pose.arms[0], [-.55, 1.75], w), mixA(pose.arms[1], [-.55, 1.75], w)];
    pose.lean = -.1 * w; pose.head = .12 * w;
    pose.legs = u < 1 ? [[.35 * Math.sin(u * Math.PI), .9 * Math.sin(u * Math.PI)], [-.1, .5 * Math.sin(u * Math.PI)]] : [[.04, 0], [-.04, 0]];
    pose.bob = Math.sin(t * 1.3 + k) * 3 - 4 * bump(t, tp, .2);
    if ((y < WALL_TOP - 1) !== (layer === 'front')) return;   // behind the wall until the feet clear its top
  }
  puppet(x, y, S, dir, CAST.worker, pose);
}
SHOT(T.start, T.end, 'camp', (t) => {
  sheet(C.ground);
  // one slow camera move: a push-in toward the row of guards after "pride"
  const z = lerp(1, 1.28, ss(T.pride + .5, T.end, t));
  g.translate(360, WALL_TOP - 80); g.scale(z, z); g.translate(-360, -(WALL_TOP - 80));
  skyline(t);
  cut(cutRect(-20, GY - 2, W + 40, 10, 91, 1.5), C.tower, { sh: .4, grain: .2 });   // the pavement strip the city stands on
  // figures behind the wall (inside the camp) until they stand on it
  for (let k = 0; k < NB; k++) figure(t, k, 'back');
  wallBricks(t);
  for (let k = 0; k < NB; k++) figure(t, k, 'front');
});
})();
