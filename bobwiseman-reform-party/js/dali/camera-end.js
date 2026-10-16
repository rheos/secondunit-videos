// Reform Party, Dali look: the shot list from dusk to the end (t >= 196), split from camera.js for draft 3 so the
// burn builder owns the climax framing. Same format as SH in camera.js: [t, dur, ox, oy, oz, pitch, f], offsets from the car.
// From 206 the car is parked and the camera's follow point is carX(238), so A() takes a world position instead.
// Draft 4 (Robin: the Man never stands in a spiral; zoom out to a real map of Black Rock City): from the golden wide
// the camera pulls up and away to a high aerial of the city at dusk, the whole 2:00-10:00 arc in frame with the Man
// lit at its centre, then comes back down to the burn perimeter and lands on the board at 215.2, where draft 3 landed.
// The four "vote" refrains still get closer each time: board, arms up, the Man filling the frame, the Man's feet.

// ---------- the aerial: 201 to 215.2 ----------
// camAt() in camera.js lerps positions linearly, which can't climb 5 km without a jolt, so camEnd(t) flies this
// stretch itself: distance from the Man on a log scale, elevation and aim eased. burn.js hands it to camAt once
// camera.js has loaded. Without that hook the [201, 14.2, BOARD] entry below still makes a plain move to the board.
const BOARD = [287.4, 2.1, -4.2, -.05, 1150];  // world x, y, z, pitch, f: behind the board, the whole Man in frame (arms up on 215.99)
// The top of the climb is straight down from 5 km with the Temple at the top of the frame, like the official map: the
// whole 2:00-10:00 arc, the Temple and the trash fence in frame, the Man lit at the centre. On the way up the camera
// turns half round the Man (yaw 0 to PI) and on the way down it carries on round (PI to 2 PI) to land behind the board.
const AIR = { t0: 201, top: 207.3, hold: 208.4, t1: 215.2, D: 5000, f: 1000 };
function camState(x, y, z, p, f) { const xo = x - MAN.x, dz = MAN.z - z, D = Math.hypot(dz, y), el = Math.atan2(y, dz); return { xo, lnD: Math.log(D), el, dp: p - el, f, yaw: 0 }; }
function camEnd(t) {
  if (t <= AIR.t0 || t >= AIR.t1) return null;
  const s0 = camState(carX(AIR.t0) + 6, 1.6, -40, -.13, 1300), sA = { xo: 0, lnD: Math.log(AIR.D), el: Math.PI / 2, dp: 0, f: AIR.f, yaw: Math.PI }, s1 = camState(...BOARD);
  let s;
  if (t < AIR.top) { const u = smooth((t - AIR.t0) / (AIR.top - AIR.t0)), ue = Math.pow(u, 1.25); // pull back and up, tilting down onto the Man, turning
    s = { xo: lerp(s0.xo, 0, u), lnD: lerp(s0.lnD, sA.lnD, u), el: lerp(s0.el, sA.el, ue), dp: lerp(s0.dp, 0, u), f: lerp(s0.f, sA.f, u), yaw: Math.PI * smooth(clamp((u - .12) / .88)) }; }
  else if (t < AIR.hold) { const u = (t - AIR.top) / (AIR.hold - AIR.top); s = { ...sA, lnD: sA.lnD + .015 * Math.sin(u * Math.PI), yaw: Math.PI + .03 * Math.sin(u * Math.PI) }; } // a breath at the top
  else { const u = smooth((t - AIR.hold) / (AIR.t1 - AIR.hold)), ue = 1 - Math.pow(1 - u, 1.3); // back down to the perimeter, levelling out last
    s = { xo: lerp(0, s1.xo, u), lnD: lerp(sA.lnD, s1.lnD, u), el: lerp(sA.el, s1.el, ue), dp: lerp(0, s1.dp, u * u), f: lerp(sA.f, s1.f, u), yaw: Math.PI + Math.PI * smooth(clamp(u / .88)) }; }
  const D = Math.exp(s.lnD), cy = Math.cos(s.yaw), sy = Math.sin(s.yaw), h = D * Math.cos(s.el), wob = .25 * Math.sin(t * .23);
  const x = MAN.x - sy * h + cy * (s.xo + wob), y = D * Math.sin(s.el) + .05 * Math.sin(t * .31), z = MAN.z - cy * h - sy * (s.xo + wob);
  const yaw = Math.atan2(sy, cy); // wrapped, so it is exactly 0 again when camera.js takes over at 215.2
  return { x, y, z, p: s.el + s.dp, f: s.f, yaw, cy, sy, clip: false };
}

function shotsEnd() { const A = (x, y, z, p, f) => [x - carX(238), y, z, p, f]; return [
  [196, 2.0, 6, 1.6, -40, -.13, 1300],              // golden wide down the 12:00 promenade, through the golden-to-violet shift (3:16-3:20): the Lamplighters hang the 60 m lanterns at 198
  [201, 14.2, ...A(...BOARD)],                      // up and away to the aerial of Black Rock City and back down onto the board (camEnd)
  [217.25, 1.35, ...A(287.8, 1.8, -7.5, -.25, 860)], // tilt up and widen: fireworks from the Man and his base, arms up
  [219.45, 1.1, ...A(287.4, 2.1, -4.2, .01, 1250)],  // back down onto the board for vote 1 as the base catches
  [222.6, 3.6, ...A(287.0, 2.4, -5.6, 0, 1300)],    // refrain 1: ease back so the catching Man shows over the burning chart
  [226.8, 1.9, ...A(283.8, 2.3, -9.5, .1, 1250)],   // refrain 2: the board votes, arms up against the fire (3:48-3:56)
  [231.5, 4.3, ...A(284.4, 2.2, -8.3, .085, 1300)], // ...a slow push as the fire climbs the lattice
  [235.8, 1.5, ...A(289, 9, -4, -.24, 1150)],       // tilt up with the rising ballots
  [237.3, 2.0, ...A(287.5, 2.4, -8.5, .02, 1250)], // refrain 3, on "vote": the board stands on its chairs as the table pulls away, the Man ablaze behind
  [241.2, 1.2, ...A(294, 5.5, -10, -.06, 1200), .1], // over the heads of the ring as it closes in behind the departing table...
  [242.4, 1.0, ...A(289, 1.3, -6.5, -.27, 1900), .21], // ...down behind the witnesses, long lens left of the table: the Man fills the frame over their ballots, arms up, burning
  [244.6, 1.0, ...A(310, 8.5, 2, -.5, 1100)],       // up with the embers
  [245.6, 1.25, ...A(320, 1.6, 0, -.1, 1100)],      // down low at the front row: the table rolls across the fire, a silhouette, along its tracks
  [247.9, 1.4, ...A(321, 2.0, 6, -.12, 1200)],      // refrain 4, on "vote": follow it in, the board up on the table top, the Man starting to fall behind
  [250.6, 1.6, ...A(305, 1.25, 21, -.4, 1250)],     // push in from the perimeter to the Man's feet as he comes down: the biggest frame
  [252.6, 4.0, ...A(306, 1.6, 12, -.07, 1150)],     // pull back onto the ember field
  [256.6, 10, ...A(305, 1.55, 14.5, -.06, 1180)],   // Little Bob walks past the embers; the table's lights recede right
]; }
