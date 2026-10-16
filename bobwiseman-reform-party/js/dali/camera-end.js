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
const AIR = { t0: 201, top: 207.3, hold: 208.4, t1: 215.2, D: 5000, f: 1000 };
function camState(x, y, z, p, f) { const xo = x - MAN.x, dz = MAN.z - z, D = Math.hypot(dz, y), el = Math.atan2(y, dz); return { xo, lnD: Math.log(D), el, dp: p - el, f, yaw: 0 }; }
function camEnd(t) {
  if (t <= AIR.t0 || t >= AIR.t1) return null;
  const s0 = camState(carX(AIR.t0) + 6, 1.6, -40, -.13, 1300), sA = { xo: 0, lnD: Math.log(AIR.D), el: Math.PI / 2, dp: 0, f: AIR.f, yaw: Math.PI }, s1 = camState(...BOARD);
  let s;
  if (t < AIR.top) { const u = smooth((t - AIR.t0) / (AIR.top - AIR.t0)), ue = Math.pow(u, 1.25); // pull back and up, tilting down onto the Man, turning
    s = { xo: lerp(s0.xo, 0, u), lnD: lerp(s0.lnD, sA.lnD, u), el: lerp(s0.el, sA.el, ue), dp: lerp(s0.dp, 0, u), f: lerp(s0.f, sA.f, u), yaw: Math.PI * smooth(u) }; } // draft 5: the turn spread over the whole climb (under 60 degrees a second)
  else if (t < AIR.hold) { const u = (t - AIR.top) / (AIR.hold - AIR.top); s = { ...sA, lnD: sA.lnD + .015 * Math.sin(u * Math.PI), yaw: Math.PI + .03 * Math.sin(u * Math.PI) }; } // a breath at the top
  else { const u = smooth((t - AIR.hold) / (AIR.t1 - AIR.hold)), ue = 1 - Math.pow(1 - u, 1.3); // back down to the perimeter, levelling out last
    s = { xo: lerp(0, s1.xo, u), lnD: lerp(sA.lnD, s1.lnD, u), el: lerp(sA.el, s1.el, ue), dp: lerp(0, s1.dp, u * u), f: lerp(sA.f, s1.f, u), yaw: Math.PI + Math.PI * smooth(u) }; }
  const D = Math.exp(s.lnD), cy = Math.cos(s.yaw), sy = Math.sin(s.yaw), h = D * Math.cos(s.el), wob = .25 * Math.sin(t * .23);
  const x = MAN.x - sy * h + cy * (s.xo + wob), y = D * Math.sin(s.el) + .05 * Math.sin(t * .31), z = MAN.z - cy * h - sy * (s.xo + wob);
  const yaw = Math.atan2(sy, cy); // wrapped, so it is exactly 0 again when camera.js takes over at 215.2
  return { x, y, z, p: s.el + s.dp, f: s.f, yaw, cy, sy, clip: false };
}

// ---------- draft 5: the drone after the aerial (215.2 to the end) ----------
// Pose keys in world metres [t, x, y, z, pitch, f, yaw?]. camera.js flies a smooth spline through them (it never holds);
// the key times are where each framing lands, on its word. The aerial above lands on BOARD at 215.2.
const END_KEYS = [
  [215.2, ...BOARD],                                // arms up on 215.99, the whole Man over the board
  [216.7, 287.6, 2.0, -5.1, -.1, 1060],             // easing back as the arms rise
  [218.4, 287.8, 1.8, -7.5, -.25, 860],             // tilted up and wide: fireworks from the Man and his base
  [220.6, 287.4, 2.1, -4.2, .01, 1250],             // vote 1 (220.65): down onto the board as the base catches
  [223.4, 287.2, 2.25, -4.9, .005, 1275],           // drifting back so the catching Man shows over the burning chart
  [226.3, 287.0, 2.4, -5.6, 0, 1300],
  [228.7, 283.8, 2.3, -9.5, .1, 1250],              // vote 2 (230.25): the board votes, arms up against the fire
  [231.2, 283.95, 2.27, -9.1, .095, 1262],
  [233.8, 284.2, 2.24, -8.7, .09, 1282],            // a slow push as the fire climbs the lattice
  [235.6, 284.4, 2.2, -8.3, .085, 1300],
  [237.3, 289, 9, -4, -.24, 1150],                  // rising with the ballots
  [239.6, 287.5, 2.4, -8.5, .02, 1250],             // vote 3 (239.93): the board stands on its chairs as the table pulls away
  [241.0, 288.6, 3.0, -8.9, .01, 1235, .03],
  [242.3, 294, 5.5, -10, -.06, 1200, .1],           // over the heads of the ring as it closes in behind the table
  [243.6, 289, 1.3, -6.5, -.27, 1900, .21],         // down behind the witnesses, long lens: the Man fills the frame, arms up, burning
  [245.4, 310, 8.5, 2, -.5, 1100],                  // up with the embers
  [247.2, 320, 1.6, 0, -.1, 1100],                  // low at the front row: the table rolls across the fire
  [249.4, 321, 2.0, 6, -.12, 1200],                 // vote 4 (249.47): the board up on the table top, the Man starting to fall
  [251.9, 305, 1.25, 21, -.4, 1250],                // in from the perimeter to the Man's feet as he comes down
  [255.4, 306, 1.6, 12, -.07, 1150],                // back onto the ember field
  [260.5, 305.5, 1.57, 13.4, -.065, 1163],          // Little Bob walks past the embers (screen space); the drone floats
  [265.5, 305.1, 1.55, 14.3, -.06, 1176],
  [268.99, 304.9, 1.55, 14.8, -.06, 1182],          // the last ember contracts
];
// burn.js reads shotsEnd() for the places a low camera passes, to keep the crowd out of them: [t, 0, ox, oy, oz, pitch, f]
// with ox relative to carX(238), as in draft 4. The keys, plus the flown path between them every half second.
function shotsEnd() { const x0 = carX(238), out = END_KEYS.map((k) => [k[0], 0, k[1] - x0, k[2], k[3], k[4], k[5]]);
  if (typeof camAt === 'function') for (let t = 215.5; t < 268.9; t += .5) { const c = camAt(t); if (c.y < 4) out.push([t, 0, c.x - x0, c.y, c.z, c.p, c.f]); }
  return out; }
