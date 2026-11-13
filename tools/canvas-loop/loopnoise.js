/* loopnoise.js: noise that loops exactly, for Canvas loops. Sets window.LoopNoise.
 *
 * The trick is Leon Lin's, from lumenshaders (MIT, Copyright (c) 2026 Leonxlnx, LICENSE-lumenshaders.md):
 * instead of sliding along a time axis, the noise lookup travels a closed circle of radius R in two extra
 * noise dimensions, at angle 2*pi*phase. Phase 1 is the same point as phase 0, so the last frame of a
 * loop runs straight into the first. Here the circle sits in the 3rd and 4th axes of 4D simplex noise,
 * so a 2D field changes shape as it goes round instead of just sliding about.
 *
 * Needs a 4D noise. By default it uses RNoise.noise4D from tools/motion-lab/vendor/remotion-noise.min.js
 * (simplex-noise 4.0.1, seeded), so load that first:
 *   <script src="../motion-lab/vendor/remotion-noise.min.js"></script>
 *   <script src="loopnoise.js"></script>
 * Or hand it any (seed, x, y, z, w) -> -1..1 function with LoopNoise.use(fn).
 *
 * All functions are pure: same arguments, same value, on every run.
 *   phase   loop position in [0, 1). LoopNoise.phase(t, 8) turns seconds into phase for an 8 s loop.
 *   radius  how far the lookup travels per loop. Speed through noise space is 2*pi*radius per loop,
 *           so radius is the amount of motion: 0.3 is a slow drift, 1 is lively, 2+ boils.
 *   seed    string or number; different seeds give unrelated noise.
 */
(function () {
  const TAU = Math.PI * 2;
  let n4 = null;
  const noise4 = () => {
    if (n4) return n4;
    if (window.RNoise && window.RNoise.noise4D) return (n4 = window.RNoise.noise4D);
    throw new Error('LoopNoise: load tools/motion-lab/vendor/remotion-noise.min.js first, or call LoopNoise.use(noise4D)');
  };

  // seconds -> phase in [0, 1), wrapping negatives too
  const phase = (t, period) => ((((t / period) % 1) + 1) % 1);

  // 2D field that loops: 4D noise at (x, y, R cos 2*pi*phase, R sin 2*pi*phase). -1..1.
  function loopNoise2(x, y, ph, radius = 1, seed = 0) {
    const a = TAU * ph;
    return noise4()(seed, x, y, radius * Math.cos(a), radius * Math.sin(a));
  }

  // One value that loops, for drifting a parameter (camera wobble, colour drift, line weight). -1..1.
  // Fixed x, y per seed so two seeds give two independent wanderers.
  function loopNoise1(ph, radius = 1, seed = 0) {
    return loopNoise2(17.31, -4.77, ph, radius, seed);
  }

  // Fractal sum of loopNoise2. Each octave doubles the frequency of the whole 4D point, circle included,
  // so fine detail moves faster than the big shapes, as in real smoke. Roughly -1..1.
  function loopFbm2(x, y, ph, radius = 1, seed = 0, octaves = 4, gain = 0.5) {
    const a = TAU * ph, c = radius * Math.cos(a), s = radius * Math.sin(a), n = noise4();
    let sum = 0, amp = 1, norm = 0, f = 1;
    for (let o = 0; o < octaves; o++) {
      sum += amp * n(seed, x * f + o * 31.7, y * f - o * 17.3, c * f, s * f);
      norm += amp; amp *= gain; f *= 2;
    }
    return sum / norm;
  }

  // Looping 2D wander, in pixels: [dx, dy]. For a handheld camera on a Canvas loop.
  function loopWander(ph, radius = 0.6, amp = 12, seed = 'wander') {
    return [amp * loopNoise1(ph, radius, seed + ':x'), amp * loopNoise1(ph, radius, seed + ':y')];
  }

  window.LoopNoise = { phase, loopNoise1, loopNoise2, loopFbm2, loopWander, use: (fn) => { n4 = fn; } };
})();
