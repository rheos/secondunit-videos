// 0.0-39.0  verse 1. One continuous paper set (a farm at the end of a summer day) with a slow camera.
// The barn's hay door glows from the start; gold laugh rings drift out of it, unseen by the mother.
// 7.34 she comes out onto the porch and shades her eyes; 10-25 she searches (the swing, the field's edge,
// the washing line); 25.39 she stops between the sheets; 26.98 she turns toward the barn on the laugh;
// 33.39 she walks to the barn and stands below it, back to the hay door, calling; 35-39 the laughter
// rises over her and the shot settles. Phase 1 builds the key frames (8, 27.25, 36); the in-between
// actions are blocked so the timeline already runs end to end.
(() => {
const T = { laugh: 1.5, mother: 7.34, search: 10.08, stops: 25.39, theLaugh: 26.98, toBarn: 33.39, call: 34.57, hold: 35.0, end: 39.0 };
const BASE = 930;                                  // the yard's ground line (world units)
const MS = .24;                                    // the mother's puppet scale in the world
const HOUSE_X = 520, LINE_X0 = 1220, LINE_X1 = 1440, BARN_X = 1560, SILO_X = 2175, TREE_X = 40;
const HAY = { x: BARN_X + BARN.hay.x + BARN.hay.w / 2, y: BASE + BARN.hay.y + 30 };   // ring source: inside the hay door
const STRIDE = 2 * 516 * MS * .96 * Math.sin(.3);   // body travel per half walk cycle (kit's walk, amp 1)

// ---------------- laughter: ring bursts from the hay door ----------------
const BURSTS = [1.5, 3.4, 5.1, 6.6, 7.36, 9.0, 10.9, 12.6, 14.7, 16.34, 18.2, 19.9, 21.8, 23.6, 25.52, 26.98, 28.6, 30.3, 32.0,
  33.6, 35.0, 35.7, 36.4, 37.3, 38.2];
const BIG = new Set([1.5, 7.36, 26.98, 35.0]);
const laughK = (t) => clamp(.45 + BURSTS.reduce((m, b) => Math.max(m, bump(t, b - .1, 1.1)), 0) * .55);
function rings(t, sc) {
  // rings show only outside the door opening, so they never cross the two inside
  const hd = BARN.hay, clipP = new Path2D(); clipP.rect(-2000, -2000, 8000, 6000); clipP.rect(BARN_X + hd.x - 4, BASE + hd.y - 4, hd.w + 8, hd.h + 8);
  g.save(); g.clip(clipP, 'evenodd');
  for (const b of BURSTS) {
    if (t < b || t > b + 3.2) continue;
    const late = b >= T.toBarn;                     // after 33.39 she stands right below the door
    driftRings(t, HAY.x, HAY.y, b, {
      n: BIG.has(b) ? 4 : 3, life: BIG.has(b) ? 3.0 : 2.6, reach: (late ? 360 : BIG.has(b) ? 380 : 280), w0: BIG.has(b) ? 12 : 9,
      // they open out toward the yard (toward her), lift as they widen and fade before they reach her;
      // after 33.39 she is right below, so they spill down over her head and rise away
      dir: late ? 2.25 : Math.PI - .35, spread: late ? .55 : .62, rise: late ? 90 : 70, drift: late ? -30 : -110, scale: 1,
    });
  }
  g.restore();
}

// ---------------- the mother ----------------
// x path: [t0, t1, x0, x1]; between keys she walks (eased), facing the way she goes
const PATH = [
  [7.34, 7.7, 820, 780],      // out of the door; she stops on the threshold
  [10.0, 12.8, 780, 210],     // along the porch and down, across to the swing
  [15.0, 15.9, 210, 70],      // to the field's edge
  [17.6, 22.6, 70, 1330],     // back across the yard to the washing line
  [33.39, 34.7, 1330, 1700],  // to the barn, below the hay door
];
function motherX(t) {
  let x = PATH[0][2];
  for (const [a, b, x0, x1] of PATH) { if (t >= b) x = x1; else if (t >= a) return lerp(x0, x1, eio((t - a) / (b - a))); }
  return x;
}
function walking(t) { for (const [a, b] of PATH) if (t >= a && t < b) return true; return false; }
function facing(t) {
  for (const [a, b, x0, x1] of PATH) if (t >= a && t < b) return Math.sign(x1 - x0);
  if (t < 17.6) return -1;                         // porch, swing, fence: looking out left, away from the barn
  if (t < 23.0) return 1;
  if (t < T.theLaugh) return -1;                   // between the sheets, peering back toward the house
  if (t < T.toBarn) return 1;                       // turned toward the barn on the laugh
  return -1;                                       // below the barn, back to it, calling across the yard
}
// a paper turn: two drawings edge-on, then the new facing
function dirAt(t) {
  const d = facing(t), d0 = facing(t - .17);
  if (d === d0) return d;
  return d * Math.max(.28, Math.abs(lerp(-d, d, clamp((t - Math.floor(t * 12) / 12) * 6))));
}
function groundY(t, x) {
  if (t < 13 && x > 590 && x < 1150) return BASE - 38;   // on the porch floor
  return BASE;
}
const REST = { arms: [[.1, .18], [-.06, .18]] };
const mixPose = (a, b, k) => ({ ...b, head: lerp(a.head || 0, b.head || 0, k), arms: [0, 1].map((i) => [lerp((a.arms || REST.arms)[i][0], (b.arms || REST.arms)[i][0], k), lerp((a.arms || REST.arms)[i][1], (b.arms || REST.arms)[i][1], k)]) });
function motherPose(t) {
  if (walking(t)) {
    const x = motherX(t); return POSE.walk(Math.abs(x - 780) / STRIDE * Math.PI, .9);
  }
  const up = (a, b, P, Q = REST) => mixPose(Q, P, ss(a, a + .25, t) * (1 - ss(b - .25, b, t)));
  if (t < 10.0) return up(7.72, 9.9, MPOSE.shade());
  if (t < 15.0) return up(12.9, 14.9, { arms: [armTo(true, 150, -560, -1), [.1, .2]], head: -.05 });       // a hand on the swing
  if (t < 17.6) return up(15.9, 17.5, MPOSE.shade());                                                   // at the fence
  if (t < 23.0) return REST;
  if (t < T.stops) return up(23.1, T.stops + .2, { arms: [armTo(true, 120, -980, 1), [.1, .2]], head: .04 });   // lifts a sheet, peers
  if (t < T.theLaugh) return mixPose(REST, { arms: [[.25, .4], [.05, .2]], head: .14 }, ss(T.stops, T.stops + .3, t));   // stops: she hears
  if (t < T.toBarn) return mixPose({ arms: [[.25, .4], [.05, .2]], head: .14 }, { arms: [armTo(true, 44, -650, -1), [.08, .2]], head: .12 }, ss(T.theLaugh, T.theLaugh + .3, t)); // turns, a hand to her chest
  if (t < 37.4) return up(34.8, 37.4, MPOSE.call());
  return mixPose(REST, MPOSE.still(), ss(37.4, 37.9, t));
}
function drawMother(t) {
  if (t < T.mother) return;
  const x = motherX(t), y = groundY(t, x);
  puppet(x, y, MS, dirAt(t), CAST.mother, motherPose(t));
}

// ---------------- camera ----------------
// keys: [t, cx, cy, S]; eased between keys (the paper moves on twos anyway)
const CAM = [
  [0, 1260, 560, 1.0], [7.0, 1260, 590, 1.08], [10.0, 1220, 590, 1.08],
  [13.0, 820, 590, 1.05], [17.6, 760, 590, 1.05], [22.6, 1240, 600, 1.1],   // follows her search left and back
  [25.0, 1500, 610, 1.2], [27.6, 1590, 612, 1.25], [33.2, 1600, 612, 1.25], [35.2, 1830, 625, 1.55], [39, 1836, 622, 1.57],
];
function cam(t) {
  for (let i = 0; i < CAM.length - 1; i++) { const A = CAM[i], B = CAM[i + 1];
    if (t < B[0]) { const k = eio((t - A[0]) / (B[0] - A[0])); return { cx: lerp(A[1], B[1], k), cy: lerp(A[2], B[2], k), S: lerp(A[3], B[3], k) }; } }
  const L = CAM[CAM.length - 1]; return { cx: L[1], cy: L[2], S: L[3] };
}

SHOT(0, 39.0, 'verse1', (t) => {
  const c = cam(t);
  skyAndHills(-(c.cx - 1060) * c.S * .3, 330 - (c.cx - 1060) * .08, 640);
  g.save(); g.translate(W / 2, H / 2); g.scale(c.S, c.S); g.translate(-c.cx, -c.cy);
  // the field's edge, then the yard
  fence(-400, 2700, BASE - 46, .9);
  cut(cutRect(-600, BASE, 3600, 600, 3), P.yard, { sh: .7, lift: .1 });
  swingTree(TREE_X, BASE, .85, Math.sin(twos(t) * 2.2) * .03 + (t > 13.2 && t < 19 ? Math.sin((t - 13.2) * 3.2) * .25 * Math.exp(-(t - 13.2) * .5) : 0));
  silo(SILO_X, BASE, 1);
  barn(BARN_X, BASE, 1, { inside: hayDoorLovers(t, laughK(t)), t });
  shoePair(BARN_X + 474, BASE - 2, .8, P.you, 'flat');
  shoePair(BARN_X + 534, BASE - 2, .8, P.me, 'boot');
  farmhouse(HOUSE_X, BASE, 1, { door: ss(6.9, 7.3, t) * (1 - ss(10.4, 10.8, t)) });
  washingLine(LINE_X0, LINE_X1, BASE - 8, .9, t);
  drawMother(t);
  rings(t, c.S);
  g.restore();
});
})();
