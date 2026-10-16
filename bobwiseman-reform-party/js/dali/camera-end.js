// Reform Party, Dali look: the shot list from dusk to the end (t >= 196), split from camera.js for draft 3 so the
// burn builder owns the climax framing. Same format as SH in camera.js: [t, dur, ox, oy, oz, pitch, f], offsets from the car.
// From 206 the car is parked and the camera's follow point is carX(238), so A() takes a world position instead.
// No cut from dusk into the burn: one move goes from the spiral overhead down onto the board.
// The four "vote" refrains get closer each time: board, arms up, the Man filling the frame, the Man's feet.
function shotsEnd() { const A = (x, y, z, p, f) => [x - carX(238), y, z, p, f]; return [
  [196, 5, 6, 1.6, -40, -.13, 1300],                // golden wide, through the golden-to-violet shift (3:16-3:20)
  [201, 6, ...A(295, 20, -16, .42, 1000)],          // crane up: the lantern spiral from above, the table at its mouth, the Man at its heart
  [207.5, 7.5, ...A(293, 6.5, -9, .1, 1150)],       // come down along the spiral: walkers, props and lanterns layered to the Man
  [215.2, 3.6, ...A(287.4, 2.1, -4.2, .04, 1350)],  // settle on the board, the ring and the Man behind it: the move carries into the burn
  [222.6, 3.6, ...A(287.0, 2.4, -5.6, 0, 1300)],    // refrain 1: ease back so the catching Man shows over the burning chart
  [226.8, 1.9, ...A(283.8, 2.3, -9.5, .1, 1250)],   // refrain 2: the board votes, arms up against the fire (3:48-3:56)
  [231.5, 4.3, ...A(284.4, 2.2, -8.3, .085, 1300)], // ...a slow push as the fire climbs the figure
  [235.8, 1.5, ...A(289, 9, -4, -.24, 1150)],       // tilt up with the rising ballots
  [237.3, 2.0, ...A(287.5, 2.4, -8.5, .02, 1250)], // refrain 3, on "vote": the board stands on its chairs as the table pulls away, the Man ablaze behind
  [241.2, 1.4, ...A(296, 5.5, 4, -.05, 1200)],      // over their heads...
  [242.6, 1.9, ...A(300, 1.6, 15.5, -.29, 1300)],   // ...down behind the ring of witnesses: the Man fills the frame, melting on its crutches
  [244.6, 1.0, ...A(310, 8.5, 2, -.5, 1100)],       // up with the embers
  [245.6, 1.25, ...A(320, 1.6, 0, -.1, 1100)],      // down low: the table rolls across the fire, a silhouette, along its tracks
  [247.9, 1.4, ...A(321, 2.0, 6, -.12, 1200)],      // refrain 4, on "vote": follow it in, the board up on the table top, the Man starting to fall behind
  [250.6, 1.6, ...A(305, 1.25, 21, -.4, 1250)],     // push through the crowd to the Man's feet as it comes down: the biggest frame
  [252.6, 4.0, ...A(306, 1.6, 12, -.07, 1150)],     // pull back onto the ember field
  [256.6, 10, ...A(305, 1.55, 14.5, -.06, 1180)],   // Little Bob walks past the embers; the table's lights recede right
]; }
