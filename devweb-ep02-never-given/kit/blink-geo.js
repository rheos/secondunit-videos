// Blink's shape as maths, shared by the Three.js and the SVG rig versions (look test, 2026-10-29).
// The body is a superellipsoid |x/A|^N + |y/B|^N + |z/C|^N = 1, a touch wider at the bottom. The visor is a rounded
// rectangle on the front surface; eyes, smile and sprout sit on (or above) the surface. Units: body half-width = 1.
window.BLINK = (() => {
  const A = 1.0, B = 1.08, C = 0.92, N = 2.8, TAPER = 0.07; // N, visor and eyes measured off the GPT turnaround front view
  const sg = (v) => (v < 0 ? -1 : 1);
  const pw = (v, e) => sg(v) * Math.pow(Math.abs(v), e);
  const taper = (y) => 1 - TAPER * (y / B); // narrower at the top, wider at the bottom
  // surface point for parameters u in [-pi, pi], v in [-pi/2, pi/2]
  function surf(u, v) {
    const e = 2 / N, cv = pw(Math.cos(v), e), y = B * pw(Math.sin(v), e);
    return [A * cv * pw(Math.cos(u), e) * taper(y), y, C * cv * pw(Math.sin(u), e)];
  }
  // the front surface's z for a given x, y (before taper), and its normal
  function frontZ(x, y) {
    const r = 1 - Math.pow(Math.abs(x / A), N) - Math.pow(Math.abs(y / B), N);
    return r <= 0 ? 0 : C * Math.pow(r, 1 / N);
  }
  function onFront(x, y, lift = 0) {
    const z = frontZ(x, y), t = taper(y);
    const nx = (N / A) * sg(x) * Math.pow(Math.abs(x / A), N - 1), ny = (N / B) * sg(y) * Math.pow(Math.abs(y / B), N - 1), nz = (N / C) * Math.pow(Math.abs(z / C), N - 1);
    const l = Math.hypot(nx, ny, nz) || 1;
    const n = [nx / l, ny / l, nz / l];
    return { p: [x * t + n[0] * lift, y + n[1] * lift, z + n[2] * lift], n };
  }
  // visor: rounded rectangle on the front, in (x, y) before taper
  const VISOR = { x0: -0.84, x1: 0.84, y0: -0.34, y1: 0.74, r: 0.38 };
  function inVisor(x, y) {
    const { x0, x1, y0, y1, r } = VISOR;
    const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r);
    return Math.hypot(x - cx, y - cy) <= r;
  }
  function visorOutline(n = 160) {
    const { x0, x1, y0, y1, r } = VISOR, pts = [];
    const corners = [[x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180], [x1 - r, y0 + r, 270]];
    corners.forEach(([cx, cy, a0]) => { for (let i = 0; i <= n / 4; i++) { const a = ((a0 + (90 * i) / (n / 4)) * Math.PI) / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } });
    return pts;
  }
  const EYES = [{ x: -0.34, y: 0.24 }, { x: 0.34, y: 0.24 }];
  const EYE = { w: 0.2, h: 0.46 };
  const SMILE = { x: 0, y: -0.06, r: 0.1, a0: 200, a1: 340 };
  const SPROUT = [[0, B - 0.04, 0], [0.01, B + 0.12, 0], [0.04, B + 0.22, 0.02], [-0.12, B + 0.34, 0.02], [-0.3, B + 0.3, 0.0],
                  [0.04, B + 0.22, 0.02], [0.16, B + 0.2, 0.02], [0.3, B + 0.32, 0.0]];
  // the sprout as two strokes: stem + left curl, and the right curl (a tilde)
  const SPROUT_STEM = [[0, B - 0.06, 0], [0.0, B + 0.14, 0.0], [0.0, B + 0.3, 0.0]];
  // one tilde whose middle (its inflection) sits on the stem tip, like the GPT sheet; the curls have depth so it
  // still reads from the side
  const SPROUT_LEAF = [[-0.32, B + 0.3, 0.14], [-0.17, B + 0.42, 0.09], [0.0, B + 0.3, 0.0], [0.17, B + 0.18, -0.09], [0.32, B + 0.3, -0.14]];
  // the spin for the look test: a full turn in 4 s, then front; blink at 4.6 s and 5.3 s
  function pose(t) {
    const yaw = t < 4 ? -(t / 4) * Math.PI * 2 * (1 - 0) : 0;
    const bob = 0.04 * Math.sin((t / 1.6) * Math.PI * 2);
    const bl = (c) => Math.max(0, 1 - Math.abs(t - c) / 0.07);
    const blink = Math.max(bl(4.6), bl(5.3));
    return { yaw, bob, blink };
  }
  return { A, B, C, N, surf, frontZ, onFront, inVisor, visorOutline, VISOR, EYES, EYE, SMILE, SPROUT_STEM, SPROUT_LEAF, pose };
})();
