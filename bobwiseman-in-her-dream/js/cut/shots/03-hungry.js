// 31.5-44.9 "(table) In her dream nobody's hungry, babies are rocking in cradles".
// The table top rises into view (rise transition): a still life on the dream cloth. Empty bowls at first;
// oranges, loaves and plates drop in one after another on the beat until it is plenty. "nobody's": the soup
// fills; "hungry": steam ribbons rise from everything. The camera follows the steam up into a night band
// where three crescent-moon cradles hold sleeping babies; on "rocking" they rock in time with the band.
// "cradles": the middle cradle swings toward us in front of a paper sun halo, the image 04 slides over.
(() => {
const BEATS = [31.83, 32.23, 32.62, 33.02, 33.39, 33.79, 34.18, 34.57, 34.97, 35.39, 35.78, 36.18, 36.55, 36.94, 37.34, 37.73,
  38.1, 38.48, 38.85, 39.22, 39.59, 39.98, 40.38, 40.75, 41.12, 41.52, 41.91, 42.28, 42.66, 43.03, 43.37, 43.75, 44.12, 44.54, 44.91];
const W_ = (w, n = 0) => wordAt(w, n, 31);
const T = { nobody: W_("nobody's"), hungry: W_('hungry'), babies: W_('babies'), rocking: W_('rocking'), cradles: W_('cradles') };
const BAND = 728, FRONT = 838;            // the table top band (naive perspective) and its front edge
const SIT = 792;                          // things stand on this line in the band
const KA = '#c96c3f', KB = '#cf9324';     // the friends' kids' paper (as in 02); navy = her kids

// ---- local paper props ----
// a bowl: rim at y, half-disc body below; the foot is a small flat strip
function bowlAt(x, y, r, col) {
  const p = new Path2D(); p.moveTo(x - r, y); p.bezierCurveTo(x - r, y + r * .62, x - r * .45, y + r * .7, x, y + r * .7);
  p.bezierCurveTo(x + r * .45, y + r * .7, x + r, y + r * .62, x + r, y); p.closePath();
  cut(cutRect(x - r * .32, y + r * .64, r * .64, r * .12, x, 1), col, { sh: .5 });
  cut(p, col, { sh: .8, lift: .3 });
  cut(rect(x - r - 4, y - 7, 2 * r + 8, 12), col, { sh: .4, grain: .15 });
}
function orangeAt(x, y, r, rot = 0) {
  cut(circle(x, y, r), C.orange, { sh: .6, lift: .2 });
  g.save(); g.translate(x, y); g.rotate(rot);
  cut(ellipse(r * .22, -r * .96, r * .32, r * .13, -.45), C.sky1, { sh: .25, grain: .1 });
  g.restore();
}
function loafAt(x, y, w, h, rot = 0, long = false) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const p = new Path2D(); p.moveTo(-w / 2, 0);
  p.bezierCurveTo(-w / 2, -h * (long ? .9 : .75), -w * (long ? .38 : .3), -h, 0, -h);
  p.bezierCurveTo(w * (long ? .38 : .3), -h, w / 2, -h * (long ? .9 : .75), w / 2, 0); p.closePath();
  cut(p, C.goldPale, { sh: .7, lift: .2 });
  g.strokeStyle = 'rgba(196,111,105,.6)'; g.lineWidth = 5; g.lineCap = 'round';
  const n = long ? 4 : 3;
  for (let i = 0; i < n; i++) { const u = (i + .5) / n - .5, cx = u * w * .78, cy = -h * (long ? .62 : .6) + Math.abs(u) * h * .25;
    g.beginPath(); g.moveTo(cx - w * .05, cy - h * .1); g.quadraticCurveTo(cx, cy - h * .02, cx + w * .05, cy + h * .1); g.stroke(); }
  g.restore();
}
function plateAt(x, y, w) {
  cut(ellipse(x, y - 6, w / 2, 9), C.cream, { sh: .55, lift: .1 });
  g.save(); g.strokeStyle = C.sky1; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y - 6, w / 2 - 3, 6, 0, Math.PI * .04, Math.PI * .96); g.stroke(); g.restore();
}
// steam: short wavy paper wisps that keep leaving (x, y) from t0, rise and fade; reach = how far they climb
function steam(t, t0, x, y, i, { every = .4, life = 2.4, speed = 330, w = 16, len = 220 } = {}) {
  if (t < t0) return;
  const n0 = Math.floor((t - t0 - life) / every), n1 = Math.floor((t - t0) / every);
  for (let n = Math.max(0, n0); n <= n1; n++) {
    const born = t0 + n * every, a = t - born; if (a < 0 || a > life) continue;
    const yy = y - a * speed, al = ss(0, .25, a) * (1 - ss(life * .45, life, a));
    const pts = []; const m = 12;
    for (let j = 0; j <= m; j++) { const u = j / m; pts.push([x + Math.sin(u * 3.6 + a * 2.2 + n * 1.3 + i) * (10 + a * 12) + Math.sin(a * 1.4 + n) * 18, yy - u * len * (.7 + .3 * ss(0, .6, a))]); }
    cut(ribbonAlong(pts, w * (1 + a * .25)), C.white, { sh: .3, grain: .12, alpha: .92 * al * (1 - ss(40.4, 41.8, t)) });
  }
}
// a sleeping baby in a crescent-moon cradle, cradle centre at (0,0), radius r, horns up
function moonCradle(r) {
  const dy = .45 * r, r2 = .9 * r, h = .452;
  const p = new Path2D(); p.arc(0, 0, r, -h, Math.PI + h, false); p.arc(0, -dy, r2, Math.PI - .016, .016, true); p.closePath();
  return p;
}
function cradle(r, eye = 0) {
  cut(moonCradle(r), C.gold, { sh: .9, lift: .5, grain: .25 });
  // the baby: a small navy child's head in profile, lying face up with the crown toward the right horn,
  // eyes closed; its neck and body are under the blanket
  const sc = .00086 * r;
  g.save(); g.translate(.17 * r, .1 * r); g.transform(0, -sc, -sc, 0, 0, 0); g.translate(-580, -800);
  g.save(); g.strokeStyle = C.cream; g.lineWidth = 44; g.lineJoin = 'round'; g.stroke(HEADS.child); g.restore();   // a cut edge so it reads on the night
  cut(HEADS.child, C.navy, { sh: .7, grain: .22 });
  if (eye > 0) { g.globalAlpha *= eye; g.strokeStyle = C.cream; g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.arc(676, 470, 32, Math.PI * .12, Math.PI * .88); g.stroke(); }
  g.restore();
  // the blanket: cream, tucked under the chin; its scalloped lace edge runs parallel to the moon's inner rim,
  // draping over it
  const inner = (x) => -.45 * r + Math.sqrt(Math.max(0, .81 * r * r - x * x));
  const sr = r * .05, x0 = -.8 * r, x1 = .24 * r, hem = (x) => inner(x) + .12 * r;
  const p = new Path2D();
  p.moveTo(x0, inner(x0) - .06 * r);
  p.bezierCurveTo(-.6 * r, -.1 * r, -.3 * r, -.06 * r, -.08 * r, -.05 * r);    // over the feet and the body
  p.bezierCurveTo(.06 * r, -.04 * r, .14 * r, .0, .19 * r, .08 * r);            // up under the chin
  p.bezierCurveTo(.22 * r, .16 * r, .24 * r, .26 * r, x1, hem(x1));            // down over the rim
  for (let x = x1; x > x0 + sr; x -= 2 * sr) { const xm = x - sr; p.arc(xm, hem(xm), sr, Math.atan2(hem(x) - hem(xm), sr), Math.PI + Math.atan2(hem(x - 2 * sr) - hem(xm), -sr) - Math.PI, false); }
  p.lineTo(x0, inner(x0) - .06 * r); p.closePath();
  for (let x = x1 - 2 * sr; x > x0 + 2 * sr; x -= 2 * sr) { const hy = hem(x) - sr * 1.15; p.moveTo(x + sr * .3, hy); p.arc(x, hy, sr * .3, 0, Math.PI * 2); }
  cut(p, C.white, { sh: .9, lift: .4, grain: .18, rule: 'evenodd' });
  g.save(); g.strokeStyle = C.gold; g.globalAlpha *= .75; g.lineWidth = r * .016; g.lineCap = 'round'; g.setLineDash([r * .035, r * .03]);
  g.beginPath(); g.moveTo(x0 + .1 * r, inner(x0) - .01 * r); g.bezierCurveTo(-.58 * r, -.05 * r, -.3 * r, -.02 * r, -.08 * r, -.01 * r);
  g.bezierCurveTo(.04 * r, 0, .1 * r, .03 * r, .14 * r, .08 * r); g.stroke(); g.restore();
}

// ---- the crowd from 02, still standing behind the table: 02's crane ends on exactly this framing
// (02 world -> 03 screen: x' = 960 + (x - 1250) * 2.29, y' = 540 + (y - 551) * 2.29). Their own arms set the dishes down.
const CZ = 2.29, toS = (x, y) => [960 + (x - 1250) * CZ, 540 + (y - 551) * CZ];
const KF2 = 964, S2 = .78;
const CROWD = [
  { spec: CAST.girl11, x: 1012 }, { spec: CAST.boy8, x: 1140 }, { spec: CAST.girl3, x: 1262, lift: 118 },
  { spec: { col: KA, kind: 'shirt', head: 'child', hair: 'curls', height: .66, headK: .3 }, x: 1376 },
  { spec: { col: KB, kind: 'dressShort', head: 'child', hair: 'bob', height: .72, headK: .3 }, x: 1470 },
  { spec: { col: KA, kind: 'shirt', head: 'child', hair: 'cap', height: .6, headK: .31 }, x: 1560, lift: 30 },
  { spec: { col: KB, kind: 'dressShort', head: 'child', hair: 'pony', height: .7, headK: .3 }, x: 1652 },
  { spec: { col: KA, kind: 'shirt', head: 'child', hair: null, height: .64, headK: .31 }, x: 1744 },
];
CROWD.forEach((k) => { const [x, y] = toS(k.x, KF2 - (k.lift || 0)); k.sx = x; k.sy = y; k.sc = S2 * CZ * k.spec.height; });
// still life (world) -> screen
const SL = (x, y) => [960 + (x - 960) * 1.5, 900 + (y - SIT) * 1.5];
// two-bone reach: angles [shoulder, elbow] (kit arm() convention) that put the hand at screen P
function reach(k, side, P) {
  const shx = k.sx + side * 8 * k.sc * -1, shy = k.sy - 752 * k.sc;           // dir -1: local +x is screen -x
  let vx = -(P[0] - shx) / k.sc, vy = (P[1] - shy) / k.sc;                      // local units, forward = toward her
  const a = 168, b = 182; let d = Math.hypot(vx, vy); const dm = a + b - 2; if (d > dm) { vx *= dm / d; vy *= dm / d; d = dm; }
  const th = Math.atan2(vx, vy), al = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1)), be = Math.acos(clamp((b * b + d * d - a * a) / (2 * b * d), -1, 1));
  // of the two elbow solutions take the lower one, so a close reach drops the elbow instead of jutting it out
  const lo = (th - al), hi = (th + al);
  const ey = (u) => Math.cos(u);
  return ey(lo) >= ey(hi) ? [lo, al + be] : [hi, -(al + be)];
}
const RAISED = [[2.95, .12], [2.78, .2]];

SHOT(31.5, 44.9, 'hungry', (t, k, d) => {
  const A0 = g.globalAlpha;
  // ---- the camera follows the steam up into the night ----
  const camY = 1240 * eio(ss(38.75, 40.6, t));
  sheet(C.sky0);
  g.save(); g.translate(0, camY);

  // the night band above the wall: a deep gradient (sky), stars
  const sg = g.createLinearGradient(0, -1250, 0, 200); sg.addColorStop(0, C.sky0); sg.addColorStop(.7, C.sky1); sg.addColorStop(1, '#3a3a78');
  g.fillStyle = sg; g.fillRect(-20, -1300, W + 40, 1700);
  for (let i = 0; i < 40; i++) {
    const sx = hash(i * 4.7) * W, sy = -1180 + hash(i * 9.3) * 1290;
    const tw = .7 + .3 * Math.sin(t * 2.6 + i * 1.9), on = sy > -120 ? 1 : ss(38.6 + hash(i) * 1.6, 39.2 + hash(i) * 1.6, t);
    if (on > 0) cut(star4(sx, sy, (hash(i * 2.1) > .82 ? 15 : 7) * tw), hash(i * 1.3) > .7 ? C.goldPale : C.cream, { sh: 0, grain: 0, alpha: on });
  }
  // the rose wall, torn along its top edge
  const tear = []; tear.push([-40, 1200]); for (let x = -40; x <= W + 40; x += 48) tear.push([x, -120 + (hash(x * .37) - .5) * 26 + Math.sin(x / 210) * 14]); tear.push([W + 40, 1200]);
  cut(poly(tear), C.rose, { sh: 1, lift: .6 });

  // ---- the crowd behind the table (bodies; their reaching arms are drawn again over the table top) ----
  const B = (i) => BEATS[i];
  // deliveries: [kid, arm (0 near, 1 far), beat time, what, world anchor x, y]
  const ORS1 = [[-58, -16], [10, -20], [70, -12], [-28, -66], [40, -68]];
  const ORS3 = [[-40, -14], [32, -16], [-6, -58]];
  const B1 = { x: 702, r: 124 }, rim1 = SIT - B1.r * .7 + 6, B2 = { x: 1122, r: 104 }, rim2 = SIT - B2.r * .7 + 6, B3 = { x: 1318, r: 96 }, rim3 = SIT - B3.r * .7 + 6;
  const PX = 500;
  const DEL = [
    [0, 0, B(2), 'plate', PX, SIT + 2 - 13], [0, 1, B(5), 'plate', PX, SIT + 2 - 26],
    [1, 0, B(1), 'or1', 0], [1, 1, B(3), 'or1', 1], [1, 0, B(4), 'or1', 2], [1, 1, B(6), 'or1', 3], [1, 0, B(8), 'or1', 4],
    [2, 0, B(7), 'board'],
    [5, 0, B(9), 'or3', 0], [5, 1, B(11), 'or3', 1], [5, 0, T.nobody, 'or3', 2],
    [6, 0, B(10), 'long'],
  ];
  // the hand's target (screen) and the item's resting anchor (world) for a delivery
  const anchor = (d) => {
    if (d[3] === 'plate') return { w: [d[4], d[5]], h: [d[4] + 30, d[5] - 14] };
    if (d[3] === 'or1') { const [ox, oy] = ORS1[d[4]]; const w = [B1.x + ox, rim1 + oy]; return { w, h: [w[0] + 4, w[1] - 30] }; }
    if (d[3] === 'or3') { const [ox, oy] = ORS3[d[4]]; const w = [B3.x + ox, rim3 + oy]; return { w, h: [w[0] + 4, w[1] - 28] }; }
    if (d[3] === 'board') return { w: [924, SIT + 2], h: [950, SIT - 128] };
    return { w: [1500, SIT + 2], h: [1510, SIT - 74] };
  };
  // per arm: angles at t and, if it is carrying something, what and where (world)
  const armState = (ki, side) => {
    const k = CROWD[ki], R = 350 * k.sc;
    const shx = k.sx - side * 8 * k.sc, shy = k.sy - 752 * k.sc;
    const H0 = [shx - .3 * R, shy + .34 * R], REST = [shx - .06 * R, shy + .9 * R], RET = [shx - .14 * R, shy + .5 * R];
    const mine = DEL.filter((d) => d[0] === ki && d[1] === side).sort((p, q) => p[2] - q[2]);
    const restA = reach(k, side, REST);
    // kids with nothing to carry keep cheering, a slow wave of the raised arm
    const wave = Math.sin(t * 3.2 + ki * 1.3 + side * 2) * .12;
    if (!mine.length) return { A: [RAISED[side][0] + wave, RAISED[side][1] + Math.abs(wave)] };
    // the others bring the raised arm down folded at the elbow (never sweeping out into a neighbour)
    const t0 = mine[0][2];
    if (t < t0 - .55) { const e = ss(t0 - 1.15, t0 - .55, t), a0 = reach(k, side, H0), F = [2.0, 2.7];
      if (e <= 0) return { A: [RAISED[side][0] + wave, RAISED[side][1] + Math.abs(wave)] };
      return { A: e < .5 ? [lerp(RAISED[side][0], F[0], eio(e * 2)), lerp(RAISED[side][1], F[1], eio(e * 2))] : [lerp(F[0], a0[0], eio(e * 2 - 1)), lerp(F[1], a0[1], eio(e * 2 - 1))] }; }
    let P = REST, carry = null;
    for (const d of mine) {
      const tb = d[2], an = anchor(d), T_ = SL(...an.h);
      if (t >= tb - .75 && t < tb - .55) { P = [lerp(REST[0], H0[0], eio((t - (tb - .75)) / .2)), lerp(REST[1], H0[1], eio((t - (tb - .75)) / .2))]; break; }
      if (t >= tb - .55 && t < tb) { const e = eio((t - (tb - .55)) / .55); P = [lerp(H0[0], T_[0], e), lerp(H0[1], T_[1], e) - Math.sin(e * Math.PI) * 40];
        carry = { d, an, P, pop: back((t - (tb - .55)) / .18) }; break; }
      if (t >= tb && t < tb + .3) { const e = eio((t - tb) / .3); P = [lerp(T_[0], RET[0], e), lerp(T_[1], RET[1], e)]; break; }
      if (t >= tb + .3 && t < tb + .6) { const e = eio((t - tb - .3) / .3); P = [lerp(RET[0], REST[0], e), lerp(RET[1], REST[1], e)]; break; }
    }
    return { A: reach(k, side, P), carry };
  };
  const ARM = CROWD.map((_, ki) => [armState(ki, 0), armState(ki, 1)]);
  const kPose = (ki) => { const la = Math.abs(Math.sin(t * 3.8 + ki * 1.7)); return { head: .04 + la * .05 + (hash(ki * 3) - .5) * .06, laugh: .25 * la, bob: -la * 5, arms: [ARM[ki][0].A, ARM[ki][1].A] }; };
  const drawArm = (ki, side) => { const k = CROWD[ki], p = kPose(ki), A = ARM[ki][side].A;
    g.save(); g.translate(k.sx, k.sy + p.bob * S2 * CZ); g.scale(-k.sc, k.sc); g.translate(side ? -8 : 8, -752); arm(A[0], A[1], k.spec.armCol || k.spec.col); g.restore(); };
  CROWD.forEach((k, ki) => puppet(k.sx, k.sy, S2 * CZ, -1, k.spec, kPose(ki)));

  // ---- the table: a close still life on the lower third ----
  g.save(); g.translate(960, 900); g.scale(1.5, 1.5); g.translate(-960, -SIT);
  cut(poly([[-40, BAND], [W + 40, BAND], [W + 40, FRONT], [-40, FRONT]]), C.creamDeep, { sh: .6, grain: .2 });
  // the cloth front, with the scallops and lace holes of 02 just showing at the bottom
  const cl = new Path2D(); const hem = 1150, r = 26;
  cl.moveTo(-40, FRONT - 2); cl.lineTo(W + 40, FRONT - 2); cl.lineTo(W + 40, hem);
  for (let x = W + 40; x > -40; x -= 2 * r) cl.arc(x - r, hem, r, 0, Math.PI, false);
  cl.closePath(); for (let x = -40 + r; x < W + 40; x += 2 * r) { cl.moveTo(x + 7, hem - 26); cl.arc(x, hem - 26, 7, 0, Math.PI * 2); }
  cut(cl, C.cream, { sh: .9, lift: .3, rule: 'evenodd' });
  // the reaching arms come over the table top (far arms first)
  g.save(); g.translate(960, SIT); g.scale(1 / 1.5, 1 / 1.5); g.translate(-960, -900);
  for (const side of [1, 0]) CROWD.forEach((_, ki) => { if (DEL.some((d) => d[0] === ki && d[1] === side && t > d[2] - .6 && t < d[2] + .3)) drawArm(ki, side); });
  g.restore();

  // an item: resting (landed on its beat with a little paper bounce) or carried in a hand
  const landed = (tb) => { const b = t - tb; return { y: -Math.sin(Math.min(b, .2) / .2 * Math.PI) * 8 * Math.exp(-b * 3), sq: 1 - bump(t, tb, .16) * .1 }; };
  const where = (d) => {             // world position of the item's anchor, its squash, a pop scale; null if not yet in a hand
    const an = anchor(d), tb = d[2];
    if (t >= tb) { const l = landed(tb); return { x: an.w[0], y: an.w[1] + l.y, sq: l.sq, s: 1 }; }
    const st = ARM[d[0]][d[1]]; if (!st.carry || st.carry.d !== d) return null;
    const hw = [960 + (st.carry.P[0] - 960) / 1.5, SIT + (st.carry.P[1] - 900) / 1.5];
    return { x: hw[0] - (an.h[0] - an.w[0]), y: hw[1] - (an.h[1] - an.w[1]), sq: 1, s: clamp(st.carry.pop, 0, 1.2) };
  };
  const scaled = (w, f) => { g.save(); g.translate(w.x, w.y); g.scale(w.s / w.sq, w.s * w.sq); f(); g.restore(); };
  const D = (what, n) => DEL.find((d) => d[3] === what && (n === undefined || d[4] === n || d[3] === 'plate' && DEL.filter((q) => q[3] === 'plate').indexOf(d) === n));

  // plates, stacking on the left
  plateAt(PX, SIT + 2, 170);
  DEL.filter((d) => d[3] === 'plate').forEach((d) => { const w = where(d); if (w) scaled(w, () => plateAt(0, 0, 170)); });
  // bowl 1 heaped with oranges
  DEL.filter((d) => d[3] === 'or1').forEach((d, i) => { const w = where(d); if (w) scaled(w, () => orangeAt(0, 0, 36, hash(i) - .5)); });
  bowlAt(B1.x, rim1, B1.r, C.sky1);
  // a bread board with a round loaf
  { const w = where(D('board')); if (w) scaled(w, () => { cut(cutRect(-104, -14, 208, 16, 71, 1.2), C.roseDark, { sh: .7, lift: .2 }); loafAt(0, -14, 180, 120); }); }
  // the soup bowl: fills on "hungry"
  const fill = eo(ss(T.hungry - .12, T.hungry + .5, t)) * (1 + bump(t, T.hungry + .2, .4) * .06);
  if (fill > 0) cut(ellipse(B2.x, rim2 - 2 + (1 - fill) * 44, B2.r * .95, 14 + fill * 7), C.orange, { sh: .3, grain: .2 });
  bowlAt(B2.x, rim2, B2.r, C.sky1);
  // bowl 3 of oranges: its last orange lands on "nobody's"
  DEL.filter((d) => d[3] === 'or3').forEach((d, i) => { const w = where(d); if (w) scaled(w, () => orangeAt(0, 0, 33, hash(i + 9) - .5)); });
  bowlAt(B3.x, rim3, B3.r, C.sky1);
  // a long loaf on its own board
  { const w = where(D('long')); if (w) scaled(w, () => { cut(cutRect(-86, -12, 172, 14, 73, 1.2), C.roseDark, { sh: .7, lift: .2 }); loafAt(0, -12, 150, 66, 0, true); }); }

  // ---- "hungry": steam rises from everything and leads the eye up ----
  const H0 = T.hungry - .12;
  steam(t, H0, B2.x - 30, rim2 - 14, 0, { w: 17 }); steam(t, H0 + .27, B2.x + 32, rim2 - 14, 1, { w: 17 });
  steam(t, H0 + .14, 924, SIT - 140, 2); steam(t, H0 + .36, B1.x + 8, rim1 - 110, 3, { w: 13 });
  steam(t, H0 + .22, B3.x - 6, rim3 - 92, 4, { w: 13 }); steam(t, H0 + .45, 1500, SIT - 80, 5, { w: 12 });
  g.restore();
  g.restore();

  // ---- the night: crescent-moon cradles (drawn in screen space; they arrive as the camera reaches them) ----
  const rockAmp = lerp(.07, .5, ss(T.rocking - .15, T.rocking + .3, t));
  const rockPh = (t - T.rocking) / (2 * .3935) * Math.PI;          // one swing every two beats
  const CR = [
    { x: 470, y: 330, r: 120, at: T.babies, ph: 0 },
    { x: 1450, y: 300, r: 130, at: T.babies + .38, ph: Math.PI },
    { x: 960, y: 560, r: 160, at: T.babies + .76, ph: .0, hero: true },
  ];
  const forward = ss(T.cradles - .05, T.cradles + 1.5, t);           // "cradles": the middle one swings toward us
  // the paper sun halo grows concentrically behind it and lands exactly on 04's opening halo
  // (04: centre (470,470) in her frame, zoom 1.3, ox 470, oy -150, with the same paper wobble)
  const HX = 1081 + jit(t, 3), HY = 461 + jit(t, 4), R04 = 1.3 * (400 + Math.sin(t * .5) * 4);
  const hero = CR[2], he = eio(forward);
  const hx0 = lerp(hero.x, HX, he), hy0 = lerp(hero.y, HY + 40, he);
  if (forward > 0) {
    const hr = lerp(hero.r * 1.25, R04, eio(ss(0, .85, forward))) * lerp(.9, 1, Math.min(1, back(forward / .2)));
    const cx = lerp(hx0, HX, ss(0, .85, forward)), cy = lerp(hy0 - 20, HY, ss(0, .85, forward));
    cut(circle(cx, cy, hr + 1.3 * 34 * hr / R04), C.goldPale, { sh: .5, grain: .25 });
    cut(circle(cx, cy, hr), C.sun, { sh: .6, grain: .25 });
  }
  CR.forEach((c, i) => {
    const a = pop(t, c.at, .55); if (a <= 0) return;
    const comeIn = (1 - eo(ss(c.at - .3, c.at + .5, t))) * 260;     // they rise into place with the camera
    let x = c.x, y = c.y + comeIn, s = a;
    let rot = Math.sin(rockPh + c.ph) * rockAmp + Math.sin(t * 1.3 + i) * .03;
    if (c.hero) { x = hx0; y = hy0 + comeIn * (1 - he); s *= lerp(1, 2.3, he); rot *= lerp(1, .45, he); }
    else { s *= 1 - eio(ss(.1, .6, forward)); y -= forward * 120; x += (c.x - 960) * forward * .5; }   // they shrink away into the stars
    if (s <= .01) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    cradle(c.r, c.hero ? ss(.3, .8, forward) : 0);
    g.restore();
  });
}, { xin: .5, tr: 'fade' });
})();
