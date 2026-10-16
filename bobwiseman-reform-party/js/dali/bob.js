// Reform Party, Dali look: Little Bob.
// ---------- Little Bob ----------
function bobPopUp(t) { // "friends with the little big guy": the driver comes up through the hole and lifts his hat
  const s = L_(24).s - .1, e = L_(24).e + .6; if (t < s || t > e) return; const hole = PL(0, TOP, 0); if (hole[2] < .3) return; const k = kAt(hole), h = 1.15 * k;
  const up = ease(t, s, s + .5) * (1 - ease(t, e - .5, e)), feet = hole[1] + h * lerp(1.05, .42, up);
  g.save(); g.beginPath(); g.rect(hole[0] - .7 * k, 0, 1.4 * k, hole[1] + .02 * k); g.clip();
  LITTLE_BOB.draw(g, t, { tIn: s, tOut: e + .01, x0: hole[0], x1: hole[0], y: feet, h, stop: { t0: s + .001, t1: e }, shadow: false });
  g.restore();
}
function bobWalk(t) { // after the burn he crosses in front of the embers
  LITTLE_BOB.draw(g, t, { tIn: 255.2, tOut: 268.4, y: 985, h: 270, stop: { t0: 260.4, t1: 262.6 }, mode: 'card', grade: (kg) => { kg.globalCompositeOperation = 'multiply'; kg.fillStyle = 'rgb(255,170,120)'; kg.fillRect(0, 0, W, H); } });
}
