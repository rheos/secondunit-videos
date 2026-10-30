// First Night Out, the character test (SCENES.walk(Q); index.html shows it alone): 16 s at 24 fps in the night forest
// (js/forest.js). Every frame is a pure function of t. The kit copies the parent one beat late (80 BPM, 0.75 s): every gesture and the walk itself are the parent's
// curves read at t - LAG.
//   0.0 - 4.0   both stand: breathing, ear and paw twitches; the parent lifts a paw to test the air, the kit copies
//   4.0 - 12.2  the parent walks (the hunched walk, feet planted); the kit sets off a beat later and follows
//   12.2 - 16   they stop; the parent lifts its head to sniff the air, the kit copies; the tails settle
SCENES.walk = (Q) => {
  const { clamp, lerp, ss, E, noise } = PD;

  // ---------------- timeline ----------------
  const END = 16, LAG = .75, SC = 1.5, V = 210;
  const A0 = 4, RA = 1.1, D0 = 10.6, D1 = 12.2;          // start, ramp, decelerate, stop
  const GAP = 455 * SC;                                  // the kit's hip trails the parent's by this much
  const PX0 = 1060, GROUND = 935, KGROUND = 950;
  // distance under a speed that eases up over RA and down over D1 - D0 (smoothstep ramps, integrated)
  function travel(t) {
    const iss = (k) => k * k * k - k * k * k * k / 2;
    if (t <= A0) return 0;
    if (t < A0 + RA) return V * RA * iss((t - A0) / RA);
    const base = V * RA / 2;
    if (t < D0) return base + V * (t - A0 - RA);
    const run = base + V * (D0 - A0 - RA), RD = D1 - D0;
    if (t < D1) { const k = (t - D0) / RD; return run + V * RD * (k - iss(k)); }
    return run + V * RD / 2;
  }
  const walkAt = (t) => ss(A0, A0 + RA, t) * (1 - ss(D0, D1, t));
  const parentX = (t) => PX0 + travel(t), kitX = (t) => PX0 - GAP + travel(t - LAG);
  // gestures, as curves of the parent's time
  const pawAt = (t) => ss(1, 1.5, t) - ss(2.5, 3, t);
  const patAt = (t) => ss(1.55, 1.75, t) - ss(2.25, 2.45, t);
  const lookAt = (t) => -.42 * (ss(12.6, 13.1, t) - ss(14.4, 14.9, t));
  const sniffAt = (t) => ss(12.9, 13.2, t) - ss(14.1, 14.4, t);
  const stateAt = (t, d, tt) => ({ d, t: tt, walk: walkAt(t), paw: pawAt(t), pat: patAt(t), look: lookAt(t), sniff: sniffAt(t), settle: t >= D1 ? t - D1 : -1 });

  // the camera keeps the pair framed: the middle of the kit's tail and the parent's nose
  const camX = (t) => (parentX(t) + 330 * SC + kitX(t) - 170 * SC) / 2 - 960;
  const cam = (t) => ({ x: camX(t), y: 4 * noise('cam').n1(t * .13), z: 0, roll: .001 * noise('cam').n1(t * .1 + 4) });

  // ---------------- build (baked once) ----------------
  const LIGHT = [-.5, -.85];
  const parent = RAC.make('parent'), kit = RAC.make('kit');
  parent.build(Q * SC * 1.15, LIGHT); kit.build(Q * SC * 1.15, LIGHT);
  // both walks start and end with all four feet down
  parent.setGait(parentX(0) / SC, parentX(END) / SC, 1);
  kit.setGait(kitX(0) / SC, kitX(END) / SC, 1);

  // the night forest, wide enough for the camera's whole move; the old trunk crosses the lens mid-walk
  const CHAR = { name: 'char', z: 1000 };
  const built = FOREST.build(Q, camX(0), camX(END), { trunkAt: camX(8.4) }), MOON = built.moon;
  const planes = [...built, CHAR].sort((a, b) => b.z - a.z);

  // ---------------- one frame ----------------
  function prepare(t) {
    CHAR.draw = (g) => {
      parent.draw(g, 0, GROUND, stateAt(t, parentX(t), t), { scale: SC, light: LIGHT, shadow: [9, 5] });
      kit.draw(g, 0, KGROUND, stateAt(t - LAG, kitX(t), t + 1.7), { scale: SC, light: LIGHT, shadow: [8, 4] });
    };
  }
  // meta for the transitions: the parent's head on screen (plane 1000, so minus the camera), the moon, the horizon
  return { name: 'walk', END, planes, camera: cam, prepare, background: '#080c26', light: LIGHT, shadowAlpha: .5,
    post: { bloom: .4, threshold: .7, vignette: .3, grain: .05, grade: { color: '#3c4c9a', amount: .12, mode: 'soft-light' } },
    meta: { heroAt: (t) => [parentX(t) + 330 * SC - camX(t), GROUND - 160 * SC], light: (t) => [MOON[0] - camX(t) * 1000 / 20000, MOON[1]], horizon: 700 },
    parent, kit, parentX, kitX, walkAt };
};
