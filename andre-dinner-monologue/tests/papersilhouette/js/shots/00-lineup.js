// Rig check (not in the film): the cast and props at full size, on cream. Load with lineup.html.
SHOT(0, 1000, 'lineup', (t) => {
  sheet(C.ground);
  const ph = t * 5, S = .115, GY = 300;
  g.save(); g.strokeStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.moveTo(0, GY); g.lineTo(W, GY); g.stroke(); g.restore();
  // row 1: the worker at film scale: standing, walking, carrying two bricks, a guard with cap hands on hips
  puppet(60, GY, S, 1, CAST.worker, {});
  puppet(160, GY, S, 1, CAST.worker, POSE.walk(ph));
  const carry = { ...POSE.walk(ph + 1), arms: [[Math.PI - .12, .02], [Math.PI - .12, .02]], holdNear: () => { g.translate(0, -8 * (1 / S)); stackHeld(2); } };
  puppet(270, GY, S, 1, CAST.worker, carry);
  puppet(400, GY, S, -1, CAST.worker, { cap: 1, arms: [[-.55, 1.75], [-.55, 1.75]], lean: -.1, head: .12 });
  puppet(500, GY, S, -1, CAST.worker, { cap: 1 });
  // same figure at 3x so the joints can be judged
  puppet(620, GY, S * 3, 1, CAST.worker, POSE.walk(ph));
  // row 2: the big head at film scale (k 1.1 would be 700 px; shown at .55), capped, with the eye
  g.save(); g.translate(170, 720); head(C.fig, .55, 0, { cap: 1, eyeCol: C.ground, eyeW: 9 }); g.restore();
  // a brick, the seed, a tower
  g.save(); g.translate(420, 420); brick(98, 60, 1); g.restore();
  seed(520, 420, 28, -.3); seed(600, 420, 100, -.3);
  tower(400, 740, 90, 260, 5, { step: 30 });
  tower(510, 740, 60, 190, 6);
  // row 3: the open hand, the pinch hand with the seed, a pine
  handOpen(220, 1000, .42);
  g.save(); g.translate(220, 1000); g.scale(.42, .42); seed(HAND_SEAT.x, HAND_SEAT.y, 28 / .42, -.2); g.restore();
  handPinch(560, 920, .42, 0); seed(560, 934, 28, -.2);
  pine(560, 1240, 280);
  pine(650, 1240, 56);
});
