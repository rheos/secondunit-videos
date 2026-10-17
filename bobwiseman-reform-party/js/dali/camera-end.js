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
const AIR = { t0: 201, top: 207.3, hold: 207.8, t1: 212.6, D: 5000, f: 1000 };
const LOW = [290, 3.8, 22.5, -.16, 900];        // in the Conclave ring, low, the Man ahead
function camState(x, y, z, p, f, yaw = 0) { // the drone as seen from the Man: lateral offset, log distance, elevation, aim, lens, heading
  const dx = x - MAN.x, dz = z - MAN.z, cy = Math.cos(yaw), sy = Math.sin(yaw), h = -(sy * dx + cy * dz), xo = cy * dx - sy * dz, D = Math.hypot(h, y), el = Math.atan2(y, h);
  return { xo, lnD: Math.log(D), el, dp: p - el, f, yaw }; }
let AIR_Q = null;
function camEnd(t) {
  if (t <= AIR.t0 || t >= AIR.t1) return null;
  const q = AIR_Q || (AIR_Q = typeof goldEnd === 'function' ? goldEnd() : { x: carX(AIR.t0) + 6, y: 1.6, z: -40, p: -.13, f: 1300, yaw: 0 });
  const yTop = q.yaw + unwrapTo(Math.PI - q.yaw), sA = { xo: 0, lnD: Math.log(AIR.D), el: Math.PI / 2, dp: 0, f: AIR.f, yaw: yTop }, s1 = camState(...LOW, yTop + Math.PI);
  const wob = .25 * Math.sin(t * .23);
  if (t < AIR.top) { // draft 9: a crane straight up, drifting over the Man and tilting down while it faces the Temple, so
    // the city's arms open out on both sides as it rises (from the golden wide, which already faces 12:00)
    const u = smooth((t - AIR.t0) / (AIR.top - AIR.t0)), yw = lerp(q.yaw, yTop, u), cy = Math.cos(yTop), sy = Math.sin(yTop);
    const x = lerp(q.x, MAN.x, u) + lerp(1, cy, u) * wob, z = lerp(q.z, MAN.z, u) - lerp(0, sy, u) * wob;
    const y = Math.exp(lerp(Math.log(q.y), Math.log(AIR.D), u)) + .05 * Math.sin(t * .31), p = lerp(q.p, Math.PI / 2, Math.pow(u, .7));
    return { x, y, z, p, f: lerp(q.f, AIR.f, u), yaw: Math.atan2(Math.sin(yw), Math.cos(yw)), cy: Math.cos(yw), sy: Math.sin(yw), clip: false }; }
  let s;
  if (t < AIR.hold) { const u = (t - AIR.top) / (AIR.hold - AIR.top); s = { ...sA, lnD: sA.lnD + .01 * Math.sin(u * Math.PI), yaw: yTop + .02 * Math.sin(u * Math.PI) }; } // a breath at the top
  else { const u = smooth((t - AIR.hold) / (AIR.t1 - AIR.hold)), ue = u; // back down through the Conclave, levelling out last
    s = { xo: lerp(0, s1.xo, u), lnD: lerp(sA.lnD, s1.lnD, u), el: lerp(sA.el, s1.el, ue), dp: lerp(0, s1.dp, u * u), f: lerp(sA.f, s1.f, u), yaw: yTop + Math.PI * smooth(Math.min(1, u * 1.8)) }; }
  const D = Math.exp(s.lnD), cy = Math.cos(s.yaw), sy = Math.sin(s.yaw), h = D * Math.cos(s.el);
  const x = MAN.x - sy * h + cy * (s.xo + wob), y = D * Math.sin(s.el) + .05 * Math.sin(t * .31), z = MAN.z - cy * h - sy * (s.xo + wob);
  const yaw = Math.atan2(sy, cy); // wrapped, so it is exactly 0 again when camera.js takes over at AIR.t1
  return { x, y, z, p: s.el + s.dp, f: s.f, yaw, cy, sy, clip: false };
}
const unwrapTo = (a) => a - TAU * Math.round(a / TAU); // the shortest turn

// ---------- draft 5: the drone after the aerial (215.2 to the end) ----------
// Pose keys in world metres [t, x, y, z, pitch, f, yaw?]. camera.js flies a smooth spline through them (it never holds);
// the key times are where each framing lands, on its word. The aerial above lands on BOARD at 215.2.
const END_KEYS = [
  [AIR.t1, ...LOW],                                   // draft 9: the aerial lands low inside the Conclave
  [213.9, 282.6, 3.4, 14.5, .2, 980, .05],                   // back low over the drum circle (b5, (282, 21)), the Man ahead
  [215.2, ...BOARD],                                // arms up on 215.99, the whole Man over the board
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
