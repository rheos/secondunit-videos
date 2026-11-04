// Core: time, seeded noise, the palette and its remap tables.
// Every frame is a pure function of t: no Math.random, no state carried between frames.
// Baked planes and sprites are made once at load from fixed seeds, so they are part of the drawing, not state.
const DUR = 15, FPS = 24;
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const ease = {
  out: (x) => 1 - Math.pow(1 - clamp(x), 3),
  in: (x) => Math.pow(clamp(x), 3),
  inOut: (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  inOutQuart: (x) => { x = clamp(x); return x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2; },
};
const fr = (n) => n / FPS; // song frame -> seconds
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
const sn1 = (x, s = 0) => vn2(x, 0.5, s) * 2 - 1;

// ---- palette ----
// Ramps run dark to light. Every pixel is an index into PAL; shading picks a ramp step with a Bayer threshold.
const PAL = [], RAMP = {};
function ramp(name, hexes) { RAMP[name] = hexes.map((h) => { PAL.push(h); return PAL.length - 1; }); }
ramp('sky', ['#d39469', '#e3ac79', '#ecbf88', '#f3d09a', '#f8e0b2', '#fcedcb', '#fff8e6']);
ramp('far', ['#a39f80', '#b2ad8b', '#c1ba96']);
ramp('fmid', ['#66704f', '#757e59', '#868d64', '#989c70']);
ramp('mid', ['#2c391e', '#384726', '#46552e', '#566437', '#6a7642']);
ramp('near', ['#090d05', '#10170a', '#18210e', '#212c14', '#2b3819']);
ramp('rim', ['#b39550', '#e6c87a']);
ramp('moss', ['#2b4012', '#3a5417', '#4b6a1e', '#618526', '#7c9e31', '#9fb944', '#c9d571']);
ramp('bark', ['#29211a', '#3a2f23', '#4f412f']);
ramp('wood', ['#1a0f09', '#2b190f', '#402516', '#58341f', '#744629', '#a4663a']);
ramp('ivory', ['#b4a883', '#e6dcba']);
ramp('kblk', ['#130d09']);
ramp('ground', ['#2a2e15', '#3a3e1d', '#4c4e25', '#615f2e']);
ramp('dust', ['#bcab82', '#dac99d']);
ramp('fog', ['#c6b990', '#dbca9e', '#eddaa9']);
ramp('brass', ['#5a4720', '#977732', '#d4b05a']);
ramp('shroom', ['#8f5a3a', '#e8d6b0']);
const NBASE = PAL.length;
const rgbOf = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const hexOf = ([r, g, b]) => '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
function nearestIdx(rgb, n = PAL.length) {
  let best = 0, bd = 1e9;
  for (let i = 0; i < n; i++) { const c = rgbOf(PAL[i]), dr = c[0] - rgb[0], dg = c[1] - rgb[1], db = c[2] - rgb[2], d = dr * dr * 3 + dg * dg * 4 + db * db * 2; if (d < bd) { bd = d; best = i; } }
  return [best, bd];
}
// add the blend as a new palette entry unless one is already close
function blendIdx(rgb) { const [i, d] = nearestIdx(rgb); if (d < 160) return i; PAL.push(hexOf(rgb)); return PAL.length - 1; }
const SUN = [255, 238, 192], FOGC = [234, 216, 170], DUSK = [18, 14, 8];
// LIGHT: the colour inside a light shaft. FOG: the colour through warm haze. DARK: in a shadow (nearest only).
const LIGHT = new Uint8Array(256), LIGHT2 = new Uint8Array(256), FOG = new Uint8Array(256), DARK = new Uint8Array(256);
{
  const L0 = [], F0 = [], L2 = [];
  for (let i = 0; i < NBASE; i++) { const c = rgbOf(PAL[i]); L0.push(blendIdx(mix3(c, SUN, .36))); F0.push(blendIdx(mix3(c, FOGC, .4))); L2.push(blendIdx(mix3(c, SUN, .17))); }
  for (let i = 0; i < 256; i++) {
    if (i >= PAL.length) { LIGHT[i] = LIGHT2[i] = FOG[i] = DARK[i] = i; continue; }
    const c = rgbOf(PAL[i]);
    LIGHT[i] = i < NBASE ? L0[i] : nearestIdx(mix3(c, SUN, .36))[0];
    LIGHT2[i] = i < NBASE ? L2[i] : nearestIdx(mix3(c, SUN, .17))[0];
    FOG[i] = i < NBASE ? F0[i] : nearestIdx(mix3(c, FOGC, .4))[0];
    DARK[i] = nearestIdx(mix3(c, DUSK, .42))[0];
  }
}
// DIM: one step down for the colours that catch the sun (rims, lit moss, ivory, brass). The light arc dithers
// lit pixels toward their DIM colour while the sun is low.
const DIM = new Int16Array(256).fill(-1), IS_RIM = new Uint8Array(256);
{
  const step = (r) => { for (let k = r.length - 1; k > 0; k--) DIM[r[k]] = r[k - 1]; };
  DIM[RAMP.rim[1]] = RAMP.rim[0]; DIM[RAMP.rim[0]] = RAMP.bark[2];
  step(RAMP.moss.slice(3)); step(RAMP.ivory); step(RAMP.brass);
  DIM[RAMP.wood[5]] = RAMP.wood[4];
  IS_RIM[RAMP.rim[0]] = IS_RIM[RAMP.rim[1]] = 1;
}
// pick a ramp step for value v (0..1) at pixel (x, y)
// threshold for the light arc: rim colours switch on in short runs (a thin line dithered per pixel reads as
// stitching), everything else per pixel
const arcTh = (c, x, y) => IS_RIM[c] ? h2(x >> 1, y >> 2, 3) : bay(x, y);
function shade(r, v, x, y) { const p = clamp(v) * (r.length - 1), i = Math.floor(p); return r[Math.min(r.length - 1, i + (bay(x, y) < p - i ? 1 : 0))]; }
