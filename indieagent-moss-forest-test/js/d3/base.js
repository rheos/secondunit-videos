// d3 base: time, seeded noise, camera, light arc, fog colour. Every frame is a pure function of t.
// Baked planes and sprites are made once at load from fixed seeds: part of the drawing, not state.
const W = 1280, H = 720, DUR = 15, FPS = 24, TAU = Math.PI * 2;
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
const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const css = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
const FOG_WARM = hex('#f9e4b4'), FOG_COOL = hex('#cfe0d6');
// world/plane space sun (sky plane, rate .03); fog is cream on the sun's column, pale blue-green toward the edges
const SUN = { x: 662, y: 214 };
const fogRGB = (x) => mixc(FOG_WARM, FOG_COOL, smooth(Math.abs(x - SUN.x) / 720));

// ---- light arc and camera ----
const lightK = (t) => lerp(.55, 1, smooth(t / 11));
const camX = (t) => 2.6 * t + 30 * smooth(t / 15);
const push = (t) => .04 * ease.sine(t / 15);
const PIV = { x: 640, y: 420 };
// world -> screen for a plane of parallax rate r: s = PIV + sc * (w - cam*r - PIV)
// the ground trembles: before it rises, less during the rise, a thud on each planted foot
function shake(t) {
  let a = 2.8 * smooth(inv(4.7, 5.0, t)) * (1 - smooth(inv(5.5, 6.6, t))) + .7 * smooth(inv(5.5, 6.2, t)) * (1 - smooth(inv(8.2, 8.8, t)));
  for (const tp of [262 / 24, 302 / 24]) if (t >= tp) a += 3.2 * Math.exp(-(t - tp) * 7);
  return [a * (vn2(t * 15, .5, 201) - .5) * 1.6, a * (vn2(t * 17, .5, 203) - .5) * 2.2];
}
function planeT(ctx, r, t) {
  const sc = 1 + push(t) * r, [dx, dy] = shake(t);
  ctx.setTransform(sc, 0, 0, sc, PIV.x - sc * (PIV.x + camX(t) * r) + dx, PIV.y - sc * PIV.y + dy);
}
function toScreen(r, t, x, y) { const sc = 1 + push(t) * r, [dx, dy] = shake(t); return [PIV.x + sc * (x - camX(t) * r - PIV.x) + dx, PIV.y + sc * (y - PIV.y) + dy]; }
const sunScreen = (t) => toScreen(.03, t, SUN.x, SUN.y);

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
