// Break 1, the ORGAN solo (124.0-137.5, frames 2976-3300).
// 124.0-126.9 piano: a CHANCE card is drawn and turns over to ORGAN SOLO as the organ comes in.
// 126.9-135.4 organ: six game pawns dance to the organ onsets (js/boardgame/solo-data.js, copied numbers).
// 135.4-137.5: a bow, the camera dives into the board, and the banknote break's last second plays back
// (captured frames: linen, the green thread pulled through, the needle) so 137.5 lands on the cross-stitch opening.
const B1 = { a: 124.0, b: 137.5, play: 136.25 };
const PCOL = [[178, 42, 34], [42, 86, 172], [226, 178, 36], [44, 132, 70], [236, 228, 208], [46, 44, 48]];
const PSTART = [[0, 200, 3], [-170, 360, 8], [-112, 345, 8], [-54, 362, 8], [6, 350, 8], [66, 360, 8]];
const RING = { x: SPIN.x, y: SPIN.y, r: 82, t0: 133.69, t1: 134.89, w: 2.3 };
const BOWX = [-25, -80, 30, -135, 85, 140];
const HOPSB = PSTART.map(() => []);
(() => {
  const last = (i) => { const h = HOPSB[i]; return h.length ? h[h.length - 1].b : PSTART[i]; };
  const add = (i, t0, dur, b, h, o = {}) => HOPSB[i].push({ t0, t1: t0 + dur, a: o.from || last(i), b, h, spin: o.spin || 0 });
  const all = [0, 1, 2, 3, 4, 5];
  // 127.05 (big note): everyone out of the box onto the top row; red hops high on the spot
  const row = [0, -150, -100, -50, 50, 100];
  all.forEach((i) => add(i, 126.93 + (i ? i * .025 : 0), i ? .46 : .4, [row[i], 200, 3], i ? 75 : 34, { spin: i % 2 ? 6.3 : -6.3 }));
  // 128.21, 128.82: hop on the spot, then a step forward together
  all.forEach((i) => add(i, 128.2, .26, [row[i], 200, 3], 12));
  all.forEach((i) => add(i, 128.66, .3, [row[i], 160, 3], 14));
  // 128.98 (big note): the tower. yellow onto green's head, then red on top
  add(2, 128.98, .34, [-50, 160, 3 + 32.6], 34);
  [1, 4, 5].forEach((i) => add(i, 128.98, .36, [row[i], 160, 3], 36, { spin: 6.3 }));
  add(0, 129.19, .36, [-50, 160, 3 + 65.2], 30);
  [1, 4, 5].forEach((i) => add(i, 129.35, .2, [row[i], 160, 3], 10));
  // 129.56: the tower comes apart
  add(0, 129.56, .4, [12, 118, 3], 24); add(2, 129.6, .36, [-108, 122, 3], 16); add(3, 129.6, .2, [-50, 160, 3], 8);
  // conga: line up round the left side, then step on the notes until the line runs along the bottom row
  const conga = [0, 1, 2, 3, 4, 5];
  conga.forEach((i, n) => { const p = sq(25 - n); add(i, 129.95 + n * .015, .45 - n * .015, [p[0], p[1], 3], 26); });
  conga.forEach((i, n) => { const p = sq(26 - n); add(i, 130.42 + n * .012, .16, [p[0], p[1], 3], 9); });
  conga.forEach((i, n) => { const p = sq(28 - n); add(i, 130.72 + n * .012, .21, [p[0], p[1], 3], 30, { spin: 6.3 }); });
  conga.forEach((i, n) => { const p = sq(29 - n); add(i, 130.95, .18, [p[0], p[1], 3], 10); });
  // 131.60: swap partners (neighbours in the line trade places, one hops high, one low)
  for (let n = 0; n < 6; n += 2) {
    const i = conga[n], j = conga[n + 1], pi = sq(29 - n), pj = sq(28 - n);
    add(i, 131.6, .25, [pj[0], pj[1], 3], 30); add(j, 131.6, .25, [pi[0], pi[1], 3], 7);
  }
  // red onto the spinner for a pirouette; the rest bob
  add(0, 131.86, .35, [SPIN.x, SPIN.y, 4.4], 40);
  [1, 2, 3, 4, 5].forEach((i) => { const p = last(i); add(i, 132.21, .2, p, 8); });
  // 133.29 (big note): everyone leaps into a ring round the spinner
  all.forEach((i) => { const a = i * Math.PI / 3; add(i, 133.29, .4, [RING.x + Math.cos(a) * RING.r, RING.y + Math.sin(a) * RING.r, 3], 46, { spin: 9 }); });
  // 134.89: out of the ring into a line for the bow
  all.forEach((i) => { const a = i * Math.PI / 3 + RING.w * (RING.t1 - RING.t0); add(i, 134.89 + i * .02, .42, [BOWX[i], -40, 3], 22, { from: [RING.x + Math.cos(a) * RING.r, RING.y + Math.sin(a) * RING.r, 3] }); });
})();
function dancePose(i, t) {
  let base = PSTART[i], lastLand = 0, dir = [1, 0], spin = 0;
  for (const hp of HOPSB[i]) {
    if (t < hp.t0) break;
    if (t < hp.t1) {
      const u = (t - hp.t0) / (hp.t1 - hp.t0), e = smooth(u);
      const x = lerp(hp.a[0], hp.b[0], e), y = lerp(hp.a[1], hp.b[1], e);
      const z = lerp(hp.a[2], hp.b[2], e) + hp.h * Math.sin(Math.PI * Math.pow(u, .85));
      const dx = hp.b[0] - hp.a[0], dy = hp.b[1] - hp.a[1];
      const ax = (dx || dy) ? tiltAxis(9 * DEG * Math.sin(Math.PI * u), dx, dy) : tiltAxis(5 * DEG * Math.sin(Math.PI * 2 * u), 1, 0);
      return { x, y, z, floor: FLOOR(x, y), ax, spin: spin + hp.spin * e };
    }
    spin += hp.spin; base = hp.b; lastLand = hp.t1; dir = [hp.b[0] - hp.a[0] || 1, hp.b[1] - hp.a[1]];
  }
  let x = base[0], y = base[1], z = base[2];
  // ring-around: the circle turns, everyone bouncing on the notes
  if (t >= RING.t0 && t < RING.t1 + .02 && Math.hypot(x - RING.x, y - RING.y) < RING.r + 2) {
    const a = Math.atan2(y - RING.y, x - RING.x) + RING.w * (t - RING.t0);
    x = RING.x + Math.cos(a) * RING.r; y = RING.y + Math.sin(a) * RING.r;
    const bt = t - RING.t0; z += 9 * Math.abs(Math.sin(Math.PI * bt / .2)) * (1 - .4 * lin(bt, 0, 1.2));
    return { x, y, z, floor: 3, ax: tiltAxis(10 * DEG, -Math.sin(a), Math.cos(a)), spin: spin + a };
  }
  const dt = t - lastLand;
  let tilt = (z > 30 ? 6 : 8) * DEG * Math.exp(-dt * 6) * Math.sin(dt * 32), td = dir;
  // the tower sways
  if (z > 30 && t < 129.6) { tilt += 7 * DEG * Math.sin((t - 129.2) * 11) * (i === 0 ? 1.4 : .8); td = [1, .2]; }
  // kick line: alternate pawns kick toward the camera on the notes
  if (t > 131.12 && t < 131.6) { const k = Math.max(0, Math.sin(Math.PI * lin(t, 131.12, 131.36))) + Math.max(0, Math.sin(Math.PI * lin(t, 131.36, 131.6))) * -1; tilt += 16 * DEG * k * (i % 2 ? 1 : -1); td = [0, -1]; }
  // pirouette on the spinner: spinning fast with a wobbling precession
  if (i === 0 && t > 132.21 && t < 133.29) { const u = t - 132.21; spin += u * 26; const pa = u * 17; return { x, y, z, floor: 4.4, ax: tiltAxis(9 * DEG * (1 - .3 * lin(u, 0, 1)), Math.cos(pa), Math.sin(pa)), spin }; }
  // the bow
  if (t > 135.3) { tilt += 30 * DEG * Math.sin(Math.PI * lin(t, 135.3 + i * .03, 135.95 + i * .03)); td = [0, -1]; }
  return { x, y, z, floor: FLOOR(x, y), ax: tiltAxis(tilt, td[0], td[1]), spin };
}
function spinAngleB(t) {
  // the arrow spins under the pirouette and settles
  const u = lin(t, 132.21, 133.6); return SPIN_END + 9 * Math.PI * (1 - Math.pow(1 - u, 2.5));
}
// the drawn CHANCE card
function cardPoseB(t) {
  const y = lerp(118, 64, ease(t, 124.25, 125.05));
  let z = 3 + 2.0 + 36 * easeOut(lin(t, 124.95, 125.5)) * (1 - easeIn(lin(t, 126.75, 126.92)));
  const flip = Math.PI * smooth(lin(t, 126.05, 126.85));
  z += Math.sin(flip) * 4;
  return { x: 2, y, z, flip, rot: .04 * Math.sin(lin(t, 124.25, 126.9) * 3) };
}
// camera
const SHOTSB = [
  { a: 124.0, b: 126.9, cam: (t) => { const u = smooth(lin(t, 124.0, 125.15)); return C(lerp(-26, 2, u), lerp(126, 90, u), Math.exp(lerp(Math.log(40), Math.log(300), u)) + 3 - 12 * lin(t, 125.15, 126.9), 90, 2000, lerp(1.5, 0, u)); }, dof: 0 },
  { a: 126.9, b: 128.9, cam: (t) => { const u = smooth(lin(t, 126.9, 128.9)); return C(lerp(-10, -30, u), lerp(-80, -40, u), lerp(42, 36, u), 7, 1700); }, dof: () => ({ zf: 240, A: .8 }), sharp: 200 },
  { a: 128.9, b: 129.95, cam: (t) => { const u = smooth(lin(t, 128.9, 129.95)); return C(lerp(-20, -40, u), lerp(-130, -110, u), lerp(48, 56, u), 10, 1800); }, dof: () => ({ zf: 270, A: .9 }), sharp: 150 },
  { a: 129.95, b: 131.1, cam: (t) => { const u = smooth(lin(t, 129.95, 131.1)); return C(lerp(-120, -60, u), lerp(-460, -480, u), lerp(320, 280, u), 38, 1500); }, dof: 0 },
  { a: 131.1, b: 131.86, cam: (t) => { const u = smooth(lin(t, 131.1, 131.86)); return C(lerp(-90, -60, u), -430, 28, 3, 1600); }, dof: () => ({ zf: 230, A: .8 }), sharp: 120 },
  { a: 131.86, b: 133.29, cam: (t) => { const u = smooth(lin(t, 131.86, 133.29)); return C(lerp(-120, -90, u), lerp(-300, -285, u), lerp(150, 135, u), lerp(36, 33, u), 2000); }, dof: () => ({ zf: 225, A: .7 }), sharp: 90 },
  { a: 133.29, b: 134.89, cam: (t) => { const u = smooth(lin(t, 133.29, 134.89)); return C(-100 + 140 * Math.sin(lerp(-.6, .6, u)), lerp(-420, -380, u), lerp(230, 190, u), lerp(30, 27, u), 1700); }, dof: () => ({ zf: 360, A: .45 }) },
  { a: 134.89, b: 135.9, cam: (t) => { const u = smooth(lin(t, 134.89, 135.9)); return C(lerp(5, -5, u), lerp(-330, -310, u), lerp(30, 28, u), 4, 1700); }, dof: () => ({ zf: 275, A: .9 }), sharp: 120 },
  { a: 135.9, b: 137.6, cam: (t) => {
      const A = C(-5, -310, 28, 4, 1700), B = C(-5, -105, 150, 90, 2000);
      const u = smooth(lin(t, 135.9, 136.4)); const c = lerpCam(A, B, u); c.phi = lerp(4, 90, Math.pow(u, .7));
      c.z = lerp(A.z, B.z, Math.pow(u, .5)) - 128 * easeIn(lin(t, 136.25, 136.62)); return c;
    }, dof: 0 },
];
function shotAtB(t) { for (const s of SHOTSB) if (t >= s.a && t < s.b) return s; return SHOTSB[SHOTSB.length - 1]; }
