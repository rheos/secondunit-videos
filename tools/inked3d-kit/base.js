// inked3d kit, base: frame size and clock, easing, seeded noise, colour, the canvas helper.
// Every frame of a film on this kit is a pure function of t: no Math.random, no Date.now, no state between frames.
// A project may set window.INK3D_CFG = { W, H, DUR, FPS, margin: [px, py] } before this script loads.
const INK3D = Object.assign({ W: 1280, H: 720, DUR: 15, FPS: 24, margin: [180, 40] }, window.INK3D_CFG || {});
const W = INK3D.W, H = INK3D.H, DUR = INK3D.DUR, FPS = INK3D.FPS, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = {
  out: (x) => 1 - Math.pow(1 - clamp(x), 3),
  in: (x) => Math.pow(clamp(x), 3),
  inOut: (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  sine: (x) => .5 - .5 * Math.cos(Math.PI * clamp(x)),
};
// held drawings: onN(t, 12) holds a pose for two frames at 24 fps (twos), onN(t, 8) for three (threes)
const onN = (t, n) => Math.floor(t * n + 1e-6) / n;
const prevT = (t) => (Math.round(t * FPS) - 1) / FPS;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function h2(x, y, s = 0) {
  let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177); n ^= n >>> 16; return (n >>> 0) / 4294967296;
}
function vn2(x, y, s = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = h2(ix, iy, s), b = h2(ix + 1, iy, s), c = h2(ix, iy + 1, s), d = h2(ix + 1, iy + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm2 = (x, y, s = 0) => .55 * vn2(x, y, s) + .3 * vn2(x * 2.1, y * 2.1, s + 7) + .15 * vn2(x * 4.3, y * 4.3, s + 13);
// ---- colour ----
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const H4 = (...a) => a.map(hex);
const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const css = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
