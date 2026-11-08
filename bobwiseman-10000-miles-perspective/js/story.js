// The loop: camera keys and the moving objects, all pure functions of t in [0, LOOP).
// A shot is { F: focus point, W: width framed at F (m), fov: horizontal lens (deg), yaw, el (deg), sy: lens shift }.
// Holding W while fov changes is the dolly zoom. About 1.6 degrees reads as a flat drawing.
export const LOOP = 10, FPS = 30;
// Audio: 10,000 Miles from 41.97 s, so the first chorus beat (43.47 s) lands on t = 1.5 when the dolly starts.
// Keys sit on beats (107.7 bpm): 1.5, 3.75, 4.31, 6.0, 6.56, 8.23, 8.79, 9.37.
export const AUDIO_START = 41.97;

const FRONT = { F: [0, 1.2, -84], W: 30, fov: 1.6, yaw: 0, el: 0, sy: 0.38 };
const KEYS = [
  [0.0, FRONT],
  [1.5, { ...FRONT, W: 29.2, ease: "lin" }],
  [3.75, { F: [0, 1.7, -80], W: 34, fov: 62, yaw: 0, el: 7, sy: 0.14 }],
  [4.31, { F: [0, 1.7, -80], W: 32.5, fov: 64, yaw: 5, el: 8, sy: 0.14 }],
  [6.0, { F: [-1, 3, -82], W: 44, fov: 1.6, yaw: 38, el: 30, sy: 0.0 }],
  [6.56, { F: [-1, 3, -82], W: 43.5, fov: 1.6, yaw: 39, el: 30, sy: 0.0 }],
  [8.23, { F: [-1, 2.2, -80], W: 36, fov: 50, yaw: 34, el: 34, sy: 0.0 }],
  [8.79, { F: [0, 2.0, -82], W: 33, fov: 38, yaw: 0, el: 18, sy: 0.06 }], // back onto the street axis before the pull-out, so no facade crosses the lens
  [9.37, { ...FRONT, W: 30.36 }],
  [10.0, { ...FRONT, ease: "lin" }],
];

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = (a, b, t) => a + (b - a) * t;
const lt = (fov) => Math.log(Math.tan((fov * Math.PI) / 360));
const fromLt = (v) => (Math.atan(Math.exp(v)) * 360) / Math.PI;

export function camAt(t) {
  t = ((t % LOOP) + LOOP) % LOOP;
  let i = 0; while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++;
  const [ta, a] = KEYS[i], [tb, b] = KEYS[i + 1];
  // the flat holds creep at a steady speed through the loop seam, so the opening never reads as a freeze
  const u = b.ease === "lin" ? clamp((t - ta) / (tb - ta)) : smooth((t - ta) / (tb - ta));
  // the lens moves in log space so the zoom feels even; a hold creeps slightly
  return {
    F: a.F.map((v, k) => lerp(v, b.F[k], u)), W: lerp(a.W, b.W, u),
    fov: fromLt(lerp(lt(a.fov), lt(b.fov), u)), yaw: lerp(a.yaw, b.yaw, u), el: lerp(a.el, b.el, u), sy: lerp(a.sy, b.sy, u),
  };
}

// Where the front flat camera sits, so the cases can slide along its rays where nobody can see it.
function frontCam() {
  const half = (FRONT.fov * Math.PI) / 360, d = FRONT.W / 2 / Math.tan(half);
  return [FRONT.F[0], FRONT.F[1], FRONT.F[2] + d];
}
const C = frontCam();
const ROW = [-2.8, -1.4, 0, 1.4, 2.8].map((x) => [x, 0.12, -83.2]);
const DIAG = ROW.map(([x, y, z], i) => {
  const z1 = z + i * 5.8; // walks out toward the camera, into the street
  const k = (C[2] - z1) / (C[2] - z);
  return { p: [C[0] + (x - C[0]) * k, y, z1], s: k };
});

export function casesAt(t) {
  t = ((t % LOOP) + LOOP) % LOOP;
  // row -> diagonal while the opening view is flat; diagonal -> row once the camera is back on the flat front view
  const u = t < 5 ? smooth((t - 0.2) / 1.1) : 1 - smooth((t - 9.42) / 0.54);
  return ROW.map((r, i) => ({ p: r.map((v, k) => lerp(v, DIAG[i].p[k], u)), s: lerp(1, DIAG[i].s, u), ry: 0 }));
}

// A queue at the hall door, shifting weight in time with the loop.
export function peopleAt(t) {
  return [0, 1, 2, 3, 4, 5].map((i) => {
    const ph = (2 * Math.PI * t) / LOOP;
    return { p: [3.2 + i * 0.95, 0.1 + 0.015 * Math.max(0, Math.sin(ph * 3 + i * 1.7)), -89.4 + (i % 2) * 0.25], ry: -0.5 + 0.12 * Math.sin(ph * 2 + i) };
  });
}
