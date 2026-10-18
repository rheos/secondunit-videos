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
// Draft 18 (Robin: "it looks like there is a temple out there... can we fly out there before we go up to the sky view?"):
// from the golden wide the drone rises to 60 m, turns square on to 12:00 and runs out over the open playa toward the
// Temple, a long fast transit at altitude, easing the lens in on the way. It arrives about 130 m short of the pagoda
// and drifts in toward it for a couple of seconds while the lanterns glow, then the crane goes straight up from
// there, drifting back over the Man as it climbs, so it still lands on the top-down map at AIR.top. Every channel is
// a sum of quintic eases (zero velocity and acceleration at both ends), so nothing jerks.
const TRUN = { rise: [201, 202.7], run: [201.6, 203.4], drift: [202.9, 205.2], aim: [201, 202.6], zoom: [201, 203.8],
  climb: [204.55, AIR.top], home: [204.7, AIR.top], down: [204.6, AIR.top - .1], out: [204.4, AIR.top],
  H: 62, sag: .08, L0: [298.5, -598], L1: [299.5, -630], TC: [300, 15], F: 1500 };
const s5 = (t, ab) => { const u = clamp((t - ab[0]) / (ab[1] - ab[0])); return u * u * u * (u * (6 * u - 15) + 10); };
function templeRun(t, q, yTop) {
  const R = TRUN, TZ = TEMPLE_XZ[1], lnTop = Math.log(R.H) - R.sag;
  const pos = (t) => { const ly = Math.log(q.y) + (Math.log(R.H) - Math.log(q.y)) * s5(t, R.rise) - R.sag * s5(t, R.drift) + (Math.log(AIR.D) - lnTop) * s5(t, R.climb);
    const a = s5(t, R.run), b = s5(t, R.drift), hx = q.x + (R.L0[0] - q.x) * a + (R.L1[0] - R.L0[0]) * b, hz = q.z + (R.L0[1] - q.z) * a + (R.L1[1] - R.L0[1]) * b;
    const h = s5(t, R.home); return [lerp(hx, MAN.x, h), Math.exp(ly), lerp(hz, MAN.z, h)]; };
  const [x, y, z] = pos(t);
  // the aim: on the pagoda's middle from the moment the drone has turned; once the crane starts, the aim it had there
  // eases evenly to straight down for the map (following the Temple live would whip the view down as the drone shot up)
  const aimOf = ([x, y, z]) => [Math.atan2(R.TC[0] - x, TZ - z), Math.atan2(y - R.TC[1], Math.hypot(R.TC[0] - x, TZ - z))];
  const [ayw, ap] = aimOf(t < R.down[0] ? [x, y, z] : pos(R.down[0]));
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
