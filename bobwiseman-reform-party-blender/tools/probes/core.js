// camera, car, light and the board's poses, per frame (draft 5: camera.js, world.js, car.js, table.js)
(t) => {
  const c = camAt(t); YAW = yaw(t);
  const seats = SEATS.map((s, i) => { const o = seatState(s, t, i);
    return { st: +o.stand.toFixed(4), bo: +(o.bounce || 0).toFixed(4), nod: +o.nod.toFixed(4), arms: o.arms, dr: o.drawer == null ? null : +o.drawer.toFixed(4), lid: +(o.lid || 0).toFixed(3), grin: +(o.grin || 0).toFixed(3) }; });
  return { cam: [c.x, c.y, c.z, c.p, c.f, c.yaw], car: [carX(t), carZ(t), yaw(t)], sunEl: sunEl(t), sunDir: sunDir(t), gold: goldAmt(t),
    sky: skyCols(t), gavel: gavelPose(t), slump: phoneSlump(t), melt: melt(t), seats };
}
