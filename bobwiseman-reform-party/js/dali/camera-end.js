// Reform Party, Dali look: the camera from dusk to the end (t >= 196). Draft 5: one continuous drone (camera.js flies
// the spline); this file holds the aerial (camEnd) and the pose keys after it, in world metres.
// Draft 4 (Robin: the Man never stands in a spiral; zoom out to a real map of Black Rock City): from the golden wide
// the camera pulls up and away to a high aerial of the city at dusk, the whole 2:00-10:00 arc in frame with the Man
// lit at its centre, then comes back down to the burn perimeter and lands on the board at 215.2, where draft 3 landed.
// The four "vote" refrains still get closer each time: board, arms up, the Man filling the frame, the Man's feet.

// ---------- the aerial: 201 to 215.2 ----------
// A spline in metres can't climb 5 km without a jolt, so camEnd(t) flies this stretch itself: distance from the Man on
// a log scale, elevation and aim eased, at rest at both ends where the spline hands over (camera.js adds the hover).
const BOARD = [287.4, 2.1, -4.2, -.05, 1150];  // world x, y, z, pitch, f: behind the board, the whole Man in frame (arms up on 215.99)
// The top of the climb is straight down from 5 km with the Temple at the top of the frame, like the official map: the
// whole 2:00-10:00 arc, the Temple and the trash fence in frame, the Man lit at the centre. On the way up the camera
// turns half round the Man (yaw 0 to PI) and on the way down it carries on round (PI to 2 PI) to land behind the board.
// Draft 9: the top hold is half a second (Robin: shorten it), and the way down ends low: through the Fire Conclave at
// 3-4 m and back over the drum circle (b5, about (282, 21)) onto BOARD for the arms-up (215.99). camEnd now lands on
// LOW at AIR.t1 and END_KEYS fly the low pass from there. It takes off from wherever the golden wide (camera.js
// goldEnd) leaves the drone at 201: looking toward the Temple, so the climb no longer has to turn.
// Draft 12 (AUDIT-d10: the descent spun half round in its first half and hard-landed into a dead stop at 212.6): the
// climb and the half-second map at the top are draft 10's (protected). On the way down the half turn is done while the
// view is still straight down (the map turns under us, the view does not swing), the height drops on a log scale, and
// the drone tips from straight down to look at the board from 40 m up behind it (HO). It hands over there still moving,
// and END_KEYS fly the last 40 m inside the speed limits onto BOARD, tilting up until the Man stands over the board.
const AIR = { t0: 201, top: 207.3, hold: 207.8, spin: 209.5, tip: 208.4, t1: 210.6, D: 5000, f: 1000 };
const HO = [286.5, 40, -22];                       // the hand-over point, high behind the board
const HO_LOOK = [284.8, 1.2, 0];                   // what the drone looks at there: the board
const LOW = HO;                                    // (draft 9's name for the hand-over pose)
const herm = (t, t0, t1, a, b, ma, mb) => { const h = t1 - t0, s = clamp((t - t0) / h), s2 = s * s, s3 = s2 * s; return (2 * s3 - 3 * s2 + 1) * a + (s3 - 2 * s2 + s) * h * ma + (-2 * s3 + 3 * s2) * b + (s3 - s2) * h * mb; };
const HO_P = Math.atan2(HO[1] - HO_LOOK[1], Math.hypot(HO_LOOK[0] - HO[0], HO_LOOK[2] - HO[2])), HO_YAW = Math.atan2(HO_LOOK[0] - HO[0], HO_LOOK[2] - HO[2]);
let AIR_Q = null;
function camEnd(t) {
  if (t <= AIR.t0 || t >= AIR.t1) return null;
  const q = AIR_Q || (AIR_Q = typeof goldEnd === 'function' ? goldEnd() : { x: carX(AIR.t0) + 6, y: 1.6, z: -40, p: -.13, f: 1300, yaw: 0 });
  const yTop = q.yaw + unwrapTo(Math.PI - q.yaw), yHO = yTop + Math.PI + unwrapTo(HO_YAW - yTop - Math.PI);
  if (t < AIR.top) return templeRun(t, q, yTop);
  if (t < AIR.hold) { const u = (t - AIR.top) / (AIR.hold - AIR.top), yw = yTop + .02 * Math.sin(u * Math.PI); // a breath at the top
    return { x: MAN.x, y: AIR.D * Math.exp(.01 * Math.sin(u * Math.PI)), z: MAN.z, p: Math.PI / 2, f: AIR.f, yaw: yw, cy: Math.cos(yw), sy: Math.sin(yw), clip: false }; }
  // back down: the height on a log scale, still dropping at 12 m/s at the hand-over; over the ground from the Man to HO
  // as the height goes; the half turn while the view is straight down; then the tilt onto the board
  // the log-rate is a smooth bump on top of the hand-over rate (12 m/s at 40 m), and the bump is over .35 s before the
  // hand-over, so the drone has done its braking well above 40 m and arrives at a steady speed (draft 12: it braked
  // from 70 to 15 m/s in the last 0.4 s, 146 m/s2)
  const T = AIR.t1 - AIR.hold, r0 = 12 / HO[1], se = 1 - .35 / T, dl = Math.log(AIR.D) - Math.log(HO[1]), amp = (dl - r0 * T) / (.5 * se * T);
  const sx = clamp((t - AIR.hold) / T), xb = Math.min(sx, se), ib = xb / 2 - se / (4 * Math.PI) * Math.sin(2 * Math.PI * xb / se); // the integral of sin^2(pi x / se)
  const ly = Math.log(AIR.D) - T * (r0 * sx * sx * (3 - 2 * sx) * 0 + r0 * sx + amp * ib), y = Math.exp(ly), w = (Math.log(AIR.D) - ly) / dl;
  const g = herm(w, 0, 1, 0, 1, 0, .6), x = lerp(MAN.x, HO[0], g), z = lerp(MAN.z, HO[2], g);
  const yw = lerp(yTop, yHO, smooth((t - AIR.hold) / (AIR.spin - AIR.hold))), p = herm(t, AIR.tip, AIR.t1, Math.PI / 2, HO_P, 0, -.12);
  return { x, y, z, p, f: lerp(AIR.f, 1100, smooth((t - AIR.hold) / (AIR.t1 - AIR.hold))), yaw: yw, cy: Math.cos(yw), sy: Math.sin(yw), clip: false };
}
// Draft 18 flew out to the Temple and held there. Draft 21 (Robin: "there should not be a pause.. it should just head
// out and see art on either side as it does and then head up"): from the golden wide the drone runs straight out
// toward the Temple at 10-16 m, low enough that the deep-playa art (playa.js: the relocated pagoda and the pieces on
// the fly-out) passes on either side, sweeps past the Temple 30 m off its right side without slowing, and the crane
// starts while it is still moving, drifting back over the Man as it climbs, so it still lands on the map at AIR.top.
// The run is one long transit: its speed ramps up and down on quintic eases (no jerk) with a steady cruise between;
// every other channel is a sum of quintic eases.
const TRUN = { run: [201, 206.0], ramp: .3, alt: [201, 202.2], climb: [205.0, AIR.top], home: [205.6, AIR.top], down: [205.45, AIR.top - .1], lock: [203.4, 205.3],
  zoom: [201, 202.4], out: [205.2, AIR.top], aim: [201, 201.9], dip: [201, 201.75], rise: [203.3, 204.4], DX: 300, DY: 5.5, H: 13, ZE: -745, XM: 312, XT: 334, F: 820 };
const s5 = (t, ab) => { const u = clamp((t - ab[0]) / (ab[1] - ab[0])); return u * u * u * (u * (6 * u - 15) + 10); };
const I5 = (x) => x * x * x * x * (x * (x - 3) + 2.5); // the integral of the quintic ease, 0..1 -> 0..0.5
function cruise(t, ab, r) { // 0..1 over ab: speed eased up over the first r, steady, eased down over the last r
  const u = clamp((t - ab[0]) / (ab[1] - ab[0])), tot = 1 - r; let d;
  if (u < r) d = r * I5(u / r); else if (u < 1 - r) d = r * .5 + (u - r); else d = tot - r * I5((1 - u) / r);
  return d / tot; }
function templeRun(t, q, yTop) {
  const R = TRUN;
  const pos = (t) => { const a = cruise(t, R.run, R.ramp), z = lerp(q.z, R.ZE, a), sa = (u, u0, u1) => { const v = clamp((u - u0) / (u1 - u0)); return v * v * v * (v * (6 * v - 15) + 10); };
    const x = q.x + (R.XM - q.x) * sa(a, 0, .35) + (R.XT - R.XM) * sa(a, .55, .85), ly0 = Math.log(q.y) + (Math.log(R.H) - Math.log(q.y)) * s5(t, R.alt);
    const ly = ly0 + .12 * Math.sin(a * Math.PI * 2) * (1 - s5(t, R.climb)) + (Math.log(AIR.D) - Math.log(R.H)) * s5(t, R.climb), h = s5(t, R.home);
    // draft 27 (Robin, option A): on the slow first second of the run the drone dips to head height beside the 12:00
    // Lamplighters' left file and runs along it, robes and lanterns going by on the right, then climbs back into the run
    const lo = s5(t, R.dip) * (1 - s5(t, R.rise)), xl = lerp(x, R.DX, lo), yl = Math.exp(lerp(ly, Math.log(R.DY), lo));
    return [lerp(xl, MAN.x, h), yl, lerp(z, MAN.z, h)]; };
  const [x, y, z] = pos(t);
  // the aim: straight down the run, a little ahead of the Temple, so the art slides past on both sides and the Temple
  // swings by on the left; once the crane starts it eases evenly to straight down for the map
  // the aim: down the run to begin with; from 203.4 it settles on the Temple, which the drone comes up beside, slowing,
  // rising past its needle as the crane starts; the aim it has when the crane tips (R.down) eases evenly to straight down
  const aimAt = (s) => { const [x, y, z] = pos(s), w = .6 * s5(s, R.lock), L = [lerp(300, TEMPLE_XZ[0], w), lerp(4, 16, w), lerp(R.ZE - 400, TEMPLE_XZ[1], w)];
    const a0 = Math.atan2(R.ZE - 400 > 0 ? 0 : 300 - x, R.ZE - 400 - z), a1 = Math.atan2(TEMPLE_XZ[0] - x, TEMPLE_XZ[1] - z), yw = a0 + unwrapTo(a1 - a0) * w;
    return [yw, Math.atan2(y - L[1], Math.hypot(L[0] - x, L[2] - z))]; };
  const [ayw, ap] = aimAt(Math.min(t, R.down[0]));
  const w0 = s5(t, R.aim), w1 = s5(t, R.down), yw0 = q.yaw + unwrapTo(ayw - q.yaw) * w0, p0 = lerp(q.p, ap, w0);
  const yw = yw0 + unwrapTo(yTop - yw0) * w1, p = lerp(p0, Math.PI / 2, w1);
  const f = Math.exp(Math.log(q.f) + (Math.log(R.F) - Math.log(q.f)) * s5(t, R.zoom) + (Math.log(AIR.f) - Math.log(R.F)) * s5(t, R.out));
  return { x, y, z, p, f, yaw: yw, cy: Math.cos(yw), sy: Math.sin(yw), clip: false };
}
const unwrapTo = (a) => a - TAU * Math.round(a / TAU); // the shortest turn

// ---------- draft 5: the drone after the aerial (215.2 to the end) ----------
// Pose keys in world metres [t, x, y, z, pitch, f, yaw?]. camera.js flies a smooth spline through them (it never holds);
// the key times are where each framing lands, on its word. The aerial above lands on BOARD at 215.2.
const END_KEYS = [
  [AIR.t1, ...HO, HO_P, 1100, HO_YAW],              // draft 12: the aerial hands over moving, high behind the board
  [211.6, 286.6, 26, -19.5, .95, 1110, -.06],      // down the last 40 m inside the speed limits, slowing as it nears the
  [212.7, 286.8, 14, -15.0, .7, 1120, -.04],        // ground and tilting up from the board to the Man
  [213.8, 287.1, 6.5, -9.5, .38, 1135, -.02],
  [214.7, 287.3, 3.0, -5.6, .08, 1145, 0],
  [215.35, ...BOARD],                               // arms up on 215.99, the whole Man over the board
  [216.7, 287.6, 2.0, -5.1, -.1, 1060],             // easing back as the arms rise
  [218.4, 287.8, 1.8, -7.5, -.25, 860],             // tilted up and wide: fireworks from the Man and his base
  [220.6, 287.4, 2.1, -4.2, .01, 1250],             // vote 1 (220.65): down onto the board as the base catches
  [223.4, 287.2, 2.25, -4.9, .005, 1275],           // drifting back so the catching Man shows over the burning chart
  [226.3, 287.0, 2.4, -5.6, 0, 1300],
  [228.7, 283.8, 2.3, -9.5, .1, 1250],              // vote 2 (230.25): the board votes, arms up against the fire
  [231.2, 283.95, 2.27, -9.1, .095, 1262],
  [232.6, 282.3, 1.8, -7.6, .07, 1250, .05],        // draft 9: sliding left along the front row at 1.4 m...
  [235.1, 274.4, 1.15, 1.2, .11, 1250, .52],        // ...to the poor woman's bowl on "broke" (b6, (277.3, 6.5))
  [237.3, 289, 9, -4, -.24, 1150],                  // rising with the ballots
  [239.6, 287.5, 2.4, -8.5, .02, 1250],             // vote 3 (239.93): the board stands on its chairs as the table pulls away
  [240.7, 288.6, 4.2, -11, .12, 1200, .03],         // draft 9, Dali DI-3: up on the board's side...
  [242.6, 291, 25, -29, .62, 1050, .08],            // ...to 26 m: the front rows' raised ballots read as a grin (b6)
  [244.9, 292, 26.5, -30, .6, 1060, .08],           // held through "broke" (the teeth knocked out, the rest up as embers)
  [246.6, 309, 7, -6, -.2, 1100],                   // down with the embers
  [247.2, 320, 1.6, 0, -.1, 1100],                  // low at the front row: the table rolls across the fire
  [249.4, 316, 2.1, -1, -.13, 1100, .03],          // vote 4 (249.47): the board on its table top (right) and the Man (left)
  [251.9, 305, 1.25, 21, -.43, 1150],                // in from the perimeter to the Man's feet as he comes down
  [255.4, 306, 1.6, 12, -.07, 1150],                // back onto the ember field
  [260.5, 305.5, 1.57, 13.4, -.065, 1163],          // Little Bob walks past the embers (screen space); the drone floats
  [265.5, 305.1, 1.55, 14.3, -.06, 1176],
  [268.99, 304.9, 1.55, 14.8, -.06, 1182],          // the last ember contracts
];
// burn.js reads shotsEnd() for the places a low camera passes, to keep the crowd out of them: [t, 0, ox, oy, oz, pitch, f]
// with ox relative to carX(238), as in draft 4. The keys, plus the flown path between them every half second.
function shotsEnd() { const x0 = carX(238), out = END_KEYS.map((k) => [k[0], 0, k[1] - x0, k[2], k[3], k[4], k[5]]);
  if (typeof camAt === 'function') for (let t = AIR.t1 + .2; t < 268.9; t += .5) { const c = camAt(t); if (c.y < 4) out.push([t, 0, c.x - x0, c.y, c.z, c.p, c.f]); }
  return out; }
