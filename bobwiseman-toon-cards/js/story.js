// Everything here is a pure function of song time t (seconds). The film runs f = 0..829 at 24 fps from t = 62.0.
// Beat times come from Bob's sheet force-aligned to the vocal stem (source/lines.json in bobwiseman-libelous).
export const T0 = 62.0, FPS = 24, FRAMES = 836;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const ramp = (t, a, b) => clamp((t - a) / (b - a));
export const E = {
  smooth: (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); },
  out: (x) => 1 - (1 - clamp(x)) ** 3,
  in: (x) => clamp(x) ** 3,
  back: (x, s = 1.9) => { x = clamp(x) - 1; return x * x * ((s + 1) * x + s) + 1; },
  linear: (x) => clamp(x),
};
const pop = (t, a, d = 0.22) => E.back((t - a) / d);
const CR = (pts, u) => {
  const n = pts.length - 1, x = clamp(u) * n, i = Math.min(n - 1, Math.floor(x)), k = x - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  return p1.map((_, j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * k + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * k * k + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * k * k * k));
};

// the sack's flight: thrown at 70.70, lands at 71.56
export const sackAt = (t) => {
  const a = [0.5, 32.5, 192.6], b = [6, 0.46, 23.6], k = clamp((t - 70.7) / 0.86);
  const x = lerp(a[0], b[0], k), z = lerp(a[2], b[2], k), y = lerp(a[1], b[1], k * k) + 9 * Math.sin(Math.PI * k) * (1 - k);
  return [x, y, z];
};

// t, camera, look, fov, roll; cut = jump here; e = ease into this key
const K = [
  { t: 62.0, p: [0.2, 31.42, 193.75], l: [0.2, 31.33, 197], fov: 33 },
  { t: 63.72, p: [0.2, 31.42, 193.95], l: [0.2, 31.33, 197], fov: 32.2 },
  { t: 64.6, p: [-0.9, 32.3, 186.6], l: [-0.9, 31.1, 197], fov: 37, e: "smooth" },
  { t: 65.72, p: [-1.0, 32.2, 187.2], l: [-1.0, 31.1, 197], fov: 36.4 },
  { t: 66.3, p: [-2.45, 31.8, 192.5], l: [-1.42, 31.24, 195.7], fov: 30, e: "out" },
  { t: 67.0, p: [-2.42, 31.79, 192.62], l: [-1.42, 31.24, 195.7], fov: 29.6 },
  { t: 67.75, p: [0.45, 31.7, 192.25], l: [0.45, 31.28, 197], fov: 33, e: "smooth" },
  { t: 68.9, p: [0.45, 31.65, 192.5], l: [0.45, 31.28, 197], fov: 32.2 },
  { t: 69.55, p: [7.2, 31.85, 193.6], l: [7.6, 31.3, 201], fov: 40, e: "smooth" },
  { t: 70.66, p: [11.2, 31.85, 193.6], l: [11.4, 31.3, 201], fov: 40, e: "linear" },
  { t: 70.68, p: [0.5, 33.7, 194.6], l: [2.4, 12, 110], fov: 52, cut: true, follow: true },
  { t: 71.56, p: [6, 2.1, 30.6], l: [6, 1.45, 23], fov: 34, e: "smooth", via: [[1.6, 27, 150], [3.4, 13, 86]], follow: true },
  { t: 72.42, p: [6, 2.05, 30.3], l: [6, 1.45, 23], fov: 33.2 },
  { t: 72.95, p: [9.5, 2.0, 29.6], l: [9.5, 1.5, 23], fov: 30.5, e: "smooth" },
  { t: 74.16, p: [9.5, 1.96, 29.3], l: [9.5, 1.5, 23], fov: 30 },
  { t: 74.62, p: [9.05, 0.42, 26.7], l: [9.25, 0.42, 24.1], fov: 34, e: "out" },
  { t: 75.42, p: [9.05, 0.42, 26.55], l: [9.25, 0.42, 24.1], fov: 33 },
  { t: 76.5, p: [8, 13.5, 13], l: [0, 0, -6], fov: 44, e: "smooth", via: [[9.5, 5.6, 24.2]] },
  { t: 78.1, p: [3.1, 2.5, 10], l: [0.5, 1.2, 1.6], fov: 37, e: "smooth" },
  { t: 79.4, p: [3.0, 2.46, 9.7], l: [0.5, 1.2, 1.6], fov: 36.4 },
  { t: 79.76, p: [-13.8, 1.72, -5.5], l: [-13.8, 1.5, -12], fov: 33, e: "out" },
  { t: 80.92, p: [-13.8, 1.7, -5.7], l: [-13.8, 1.5, -12], fov: 32.4 },
  { t: 80.95, p: [-12, 0.42, -8], l: [-6, 33.5, 200], fov: 16, cut: true },
  { t: 82.72, p: [-12, 0.42, -8.15], l: [-6, 33.5, 200], fov: 15.5 },
  { t: 82.75, p: [6, 8.6, -25], l: [-1, 2.6, 8], fov: 46, cut: true },
  { t: 84.42, p: [5.2, 8.2, -24], l: [-0.5, 2.6, 8], fov: 45 },
  { t: 85.1, p: [2, 1.6, -4.3], l: [2, 1.42, 0], fov: 34, e: "smooth", via: [[4, 7, -16]] },
  { t: 85.72, p: [2, 1.58, -4.1], l: [2, 1.42, 0], fov: 33.6 },
  { t: 86.14, p: [2, 0.9, -7.6], l: [2, 4.1, 0], fov: 50, e: "out" },
  { t: 86.7, p: [-2.6, 1.0, -9], l: [-10, 13, 14], fov: 54, e: "smooth" },
  { t: 89.34, p: [-2.4, 1.0, -9], l: [15, 12, 14], fov: 52, e: "linear" },
  { t: 89.4, p: [24, 1.34, -23.5], l: [24, 1.02, -20], fov: 30, cut: true },
  { t: 91.17, p: [24, 1.3, -23.05], l: [24, 1.02, -20], fov: 29 },
  { t: 91.2, p: [28, 7.2, -14], l: [36, 3, 16], fov: 46, cut: true },
  { t: 92.84, p: [44, 7.6, -14.5], l: [52, 3, 16], fov: 44, e: "linear" },
  { t: 92.86, p: [1000, 1.25, 996.6], l: [1000, 1.72, 1003], fov: 50, cut: true },
  { t: 94.42, p: [1000, 1.25, 997.1], l: [1000, 1.72, 1003], fov: 49 },
  { t: 95.22, p: [1000, 1.72, 1000.05], l: [1000, 0.9, 1001.55], fov: 36, e: "smooth" },
  { t: 96.9, p: [1000, 1.66, 1000.3], l: [1000, 0.9, 1001.55], fov: 35 },
];
const KICKS = [
  { t: 71.58, a: 0.024 }, { t: 73.4, a: 0.008 }, { t: 79.77, a: 0.028 }, { t: 85.75, a: 0.018 },
  { t: 90.86, a: 0.012 }, { t: 92.6, a: 0.04 }, { t: 95.8, a: 0.03 },
];

export const camAt = (t) => {
  let i = K.findIndex((k, j) => t >= k.t && (j === K.length - 1 || t < K[j + 1].t));
  if (i < 0) i = 0;
  const a = K[i], b = K[Math.min(i + 1, K.length - 1)];
  let c;
  if (b === a || b.cut) c = { p: a.p, l: a.l, fov: a.fov, roll: a.roll || 0 };
  else {
    const k = (E[b.e || "linear"] || E.linear)((t - a.t) / (b.t - a.t));
    const p = b.via ? CR([a.p, ...b.via, b.p], k) : lerp3(a.p, b.p, k);
    let l = lerp3(a.l, b.l, k);
    if (b.follow) { const f = sackAt(t), w = 1 - E.smooth((k - 0.72) / 0.28); l = lerp3(l, f, w * 0.9); }
    c = { p, l, fov: lerp(a.fov, b.fov, k), roll: lerp(a.roll || 0, b.roll || 0, k) };
  }
  for (const q of KICKS) {
    const d = (t - q.t) * FPS;
    if (d >= 0 && d < 6) { const s = (Math.round(d) % 2 ? -1 : 1) * q.a * (1 - d / 6) * Math.hypot(...[0, 1, 2].map((j) => c.l[j] - c.p[j])); c.l = [c.l[0], c.l[1] + s, c.l[2]]; c.roll += s * 2; }
  }
  return c;
};

// focus distance (m) and blur at infinity (px at 1080 wide); 0 = sharp
export const dofAt = (t) => {
  if (t < 64.3) return { focus: 3.3, c: 13 };
  if (t < 65.7) return { focus: 11, c: 3 };
  if (t < 67.0) return { focus: 3.0, c: 12 };
  if (t < 68.9) return { focus: 4.7, c: 11 };
  if (t < 70.68) return { focus: 7.5, c: 6 };
  if (t < 72.42) return { focus: 8, c: 0 };
  if (t < 74.16) return { focus: 6.5, c: 8 };
  if (t < 75.42) return { focus: 2.6, c: 12 };
  if (t < 77.6) return { focus: 20, c: 0 };
  if (t < 79.4) return { focus: 9, c: 7 };
  if (t < 80.95) return { focus: 5.4, c: 10 };
  if (t < 82.75) { const k = E.smooth((t - 81.25) / 0.45); return { focus: lerp(6, 215, k), c: 13 }; }
  if (t < 84.6) return { focus: 40, c: 0 };
  if (t < 85.72) return { focus: 4.2, c: 11 * E.smooth((t - 84.6) / 0.5) };
  if (t < 89.4) return { focus: 20, c: 0 };
  if (t < 91.2) return { focus: 3.5, c: 12 };
  if (t < 92.86) return { focus: 30, c: 0 };
  if (t < 94.42) return { focus: 9, c: 6 };
  return { focus: 1.75, c: 10 };
};

// light presets: "day" until the poison, "golden" through the forest, "dusk" in the boardroom
const L = {
  day: { az: 62, el: 50, sun: "#fff3df", sunI: 2.5, sky: "#d2e2f6", gnd: "#a8905e", hemi: 1.14, top: "#2f78d8", hor: "#cfe3f5", f0: 130, f1: 1300, sat: 1.12, vig: 0.2, gain: [1, 1, 1], lift: [0, 0, 0], tint: "#ffffff" },
  golden: { az: 28, el: 12, sun: "#ffd2a4", sunI: 2.7, sky: "#a99bcc", gnd: "#7a5040", hemi: 1.0, top: "#6474c0", hor: "#ffc485", f0: 90, f1: 1000, sat: 1.14, vig: 0.26, gain: [1, 0.96, 0.9], lift: [0, 0, 0], tint: "#ffe6cc" },
  dusk: { az: 20, el: 6, sun: "#ff9a72", sunI: 0.9, sky: "#5d6cab", gnd: "#3a3048", hemi: 0.95, top: "#18234f", hor: "#d18a7c", f0: 80, f1: 800, sat: 1.1, vig: 0.34, gain: [0.92, 0.95, 1.05], lift: [0.012, 0.014, 0.03], tint: "#eceaf8" },
};
// the sun is frozen per stretch and sits relative to the way the camera looks
const sunAz = (t) => {
  if (t < 70.68) return 142;       // terrace, camera looks +z: sun over its left shoulder
  if (t < 80.95) return 38;        // valley, camera looks -z
  if (t < 86.2) return 146;        // back to the castle view
  if (t < 89.4) return 146 + (60 - 146) * E.smooth((t - 86.2) / 3.0); // swings round as the day goes
  if (t < 91.2) return 150;        // the watch needs its face lit
  if (t < 92.86) return 105;       // low from the side across the forest
  return 150;
};
export const lightAt = (t) => {
  const a = t < 89.4 ? L.day : L.golden, b = t < 89.4 ? L.golden : L.dusk;
  const k = t < 89.4 ? E.smooth((t - 86.2) / 3.0) : (t >= 92.86 ? 1 : 0);
  return { a, b, k, az: sunAz(t) };
};

export const flashAt = (t) => {
  for (const q of [89.4, 92.86]) { const d = (t - q) * FPS; if (d >= 0 && d < 6) return 1 - d / 6; }
  return 0;
};
export const blink = (t, seed) => { const per = 1.5 + ((seed * 17) % 11) * 0.09, ph = (t + seed * 0.53) % per; return ph < 0.08 ? 0.5 : ph < 0.16 ? 1 : 0; };
export const idle = (t, seed = 1) => ({ bob: 0.006 * Math.sin((t + seed * 0.46) * 2.64), tilt: 1.2 * Math.sin((t + seed * 0.3) * 1.2), head: 1.6 * Math.sin((t + seed * 0.2) * 0.9 + 1) });

const KING = { jacket: "#6d3fa8", pants: "#3a2c55", boots: "#2a1c38", hat: "crown", sash: "#f2c23c", buttons: "#f2c23c", moustache: "#5a3b2a", build: "stout" };
const QUEEN = { jacket: "#c0394a", pants: "#3a2c55", boots: "#5a2030", hat: "crown", dress: "#c0394a" };
const PRINCE = { jacket: "#3f7fbf", pants: "#2c3b55", boots: "#2a2438", hat: "crown", build: "kid", buttons: "#f2c23c" };
const PRINCESS = { jacket: "#d97ca8", pants: "#5a3050", boots: "#5a3050", hat: "crown", build: "kid", dress: "#d97ca8" };
const COURT = [
  { jacket: "#2f7f77", pants: "#1f4f4b", boots: "#1c2c2c", hat: "wig", buttons: "#f2c23c", sash: "#f2c23c" },
  { jacket: "#b5482e", pants: "#6c2c1c", boots: "#2c1c1c", hat: "wig", buttons: "#f2c23c" },
  { jacket: "#3a5aa8", pants: "#232f5a", boots: "#1c2438", hat: "wig", buttons: "#efe9dc", build: "stout" },
  { jacket: "#8a7a2a", pants: "#4c4418", boots: "#2c2a14", hat: "wig", buttons: "#f2c23c" },
];
const LAWYER = { jacket: "#2b2a33", pants: "#1d1c24", boots: "#16151c", hat: "wig", buttons: "#efe9dc" };
const FARMER = [
  { jacket: "#4a78b5", pants: "#34557f", boots: "#5a3b2a", hat: "straw", buttons: "#efe0a8", moustache: "#6b4a2a" },
  { jacket: "#c26f3a", pants: "#6e4a2a", boots: "#4a3020", hat: "straw", dress: "#7ca24a" },
  { jacket: "#6c9a4a", pants: "#3e5a30", boots: "#4a3020", hat: "straw", build: "stout", skin: "#c99067" },
];
const RANCHER = [
  { jacket: "#c9a26a", pants: "#4e5c78", boots: "#5a3218", hat: "stetson", sash: "#b5302e", moustache: "#3a2618", build: "stout" },
  { jacket: "#8f5a3a", pants: "#3e465c", boots: "#3a2018", hat: "stetson", skin: "#f5c9a0" },
  { jacket: "#6a7a54", pants: "#3e3a30", boots: "#3a2018", hat: "stetson", skin: "#ecd0b6" },
];
const SHARE = [0, 1, 2, 3, 4].map((i) => ({ jacket: ["#2e3442", "#3a2e42", "#2e4238", "#42362e", "#2a3a4c"][i], pants: "#1d1f28", boots: "#14141c", hat: "tophat", buttons: "#d9c27a", build: i % 2 ? "stout" : "adult", moustache: i === 1 || i === 3 ? "#d8d4cc" : undefined, skin: ["#ffe2c2", "#f5c9a0", "#ecd0b6", "#ffe2c2", "#c99067"][i] }));

/** returns the list of bean cards alive at t */
export const actorsAt = (t) => {
  const A = [];
  const add = (id, o, x, y, z, opts = {}, extra = {}) => { const s = extra.seed ?? id.length * 7 + id.charCodeAt(0); const q = idle(t, s); A.push({ id, outfit: o, x, y: y + q.bob * (extra.scale || 1), z, scale: extra.scale ?? 1, seed: s, opts: { mode: "stand", seed: s, blink: blink(t, s), tilt: q.tilt, headTilt: q.head, ...opts } }); };

  if (t < 70.68) {
    const y = 30.12;
    const breathe = E.smooth((t - 62.25) / 0.7) * (1 - E.smooth((t - 63.05) / 0.7));
    const thrown = t > 70.3;
    const kingX = lerp(0.2, 0.45, E.smooth((t - 67.0) / 0.6));
    const kingCoin = t > 65.8 && t < 66.9;
    if (t < 69.6) add("king", KING, kingCoin ? lerp(0.2, -0.75, E.smooth((t - 65.8) / 0.3)) : kingX, y + breathe * 0.03, 197,
      { expr: t < 63.6 ? "relief" : t < 65.8 ? "smile_closed" : t < 67 ? "whistle" : "grin", tilt: -2 * breathe, headTilt: -5 * breathe, prop: t >= 67.2 ? "sack" : null, look: t > 64.6 && t < 66.9 ? -0.6 : 0, facing: 0 });
    if (t > 63.8 && t < 67.4) {
      const k = pop(t, 63.92);
      add("queen", QUEEN, -2.5, y, 197.6, { expr: t < 65.4 ? "smile" : "smile_closed", look: 0.3 });
      add("princess", PRINCESS, -0.4, y, 197.9, { expr: "smile", wave: t < 65.3 ? Math.sin(t * 9) : undefined, tilt: Math.sin(t * 5) * 2 });
      add("prince", PRINCE, -1.5, y, 196.32 + (1 - k) * 2.5, { expr: t < 66.1 ? "grin" : "shock", look: 0.4, tilt: 3 });
    }
    if (t > 68.6) COURT.forEach((o, i) => {
      const cx = [6.9, 8.6, 10.3, 12.2][i], cz = [199.9, 201.2, 200.3, 201.4][i], pt = 69.05 + i * 0.32, k = pop(t, pt);
      if (k > 0.01) add("court" + i, o, cx, y + (1 - k) * -0.9, cz, { expr: i % 2 ? "smile" : "grin", wave: i === 1 && t > pt + 0.3 ? Math.sin(t * 7) : undefined, facing: -1, look: -0.6 }, { seed: 40 + i });
    });
  }
  if (t > 72.2 && t < 75.5) {
    const walk = E.smooth((t - 73.62) / 0.98);
    add("lawyer", LAWYER, lerp(10.6, 9.5, E.smooth((t - 72.8) / 0.5)), 0, lerp(24.0, 22.2, walk), { expr: t < 73.4 ? "neutral" : "smile", mode: walk > 0.01 && walk < 0.99 ? "stroll" : "stand", phase: t * 1.5, prop: t < 73.5 ? ["hammer", (Math.sin(t * 15) + 1) / 2] : null, look: -0.5 });
  }
  if (t > 76 && t < 82.75) {
    const ps = [[-0.35, 2.9], [0.35, 0.9], [1.62, 3.0]];
    FARMER.forEach((o, i) => {
      const pt = 77.88 + i * 0.14, k = pop(t, pt);
      if (t < 79.57 && k > 0.01) add("farm" + i, o, ps[i][0], (1 - k) * -1.6, ps[i][1], { expr: i === 1 ? "grin" : "smile_closed", prop: i === 0 ? ["hammer", (Math.sin(t * 6) + 1) / 2] : null, wave: i === 2 ? Math.sin(t * 7) : undefined }, { seed: 70 + i });
    });
    if (t >= 79.57 && t < 80.95) add("farm0", FARMER[0], -13.3, 0, -11.2, { expr: t > 79.74 ? "shock" : "neutral", look: -0.8, facing: -1 }, { seed: 70 });
    if (t >= 80.95) add("farm0", FARMER[0], -12.18, 0, -2, { expr: "nervous", look: -0.5, headTilt: 7 }, { seed: 70 });
    if (t >= 80.95) { const w = Math.sin(t * 7); add("kingfar", KING, 0.5, 30.12, 193.9, { expr: "grin", wave: w }, { scale: 3, seed: 3 }); }
  }
  if (t >= 82.75 && t < 84.5) {
    FARMER.forEach((o, i) => { const x = -2.8 + i * 2 + (t - 82.75) * 3.6; add("farm" + i, o, x, 0, 5 - i * 1.4, { mode: "stroll", phase: t * 1.6 + i * 0.3, expr: "nervous", look: -0.8 }, { seed: 70 + i }); });
    RANCHER.forEach((o, i) => { if (i) add("ranch" + i, o, -24 + i * 6 + (t - 82.75) * 11.5, 0, -9 + i * 7, { mode: "march", phase: t * 2.8 + i * 0.3, expr: "grin", wave: Math.sin(t * 9) }, { seed: 80 + i }); });
  }
  if (t >= 84.0 && t < 89.4) {
    const g = E.back((t - 85.73) / 0.34, 1.4);
    add("ranch0", RANCHER[0], 2, 0, 0, { expr: t < 85.7 ? "smile" : t < 86.4 ? "grin" : "laugh", look: -0.2, tilt: t > 86.4 ? Math.sin(t * 10) * 3 : 0 }, { scale: lerp(1, 3.1, g), seed: 80 });
  }
  if (t >= 92.86 && t < 95.4) {
    SHARE.forEach((o, i) => {
      const x = [-1.5, -0.76, 0, 0.76, 1.5][i], z = 1003.1 + (i % 2) * 0.45, order = [2, 0, 3, 1, 4][i], k = pop(t, 93.62 + order * 0.1);
      if (k > 0.01) add("share" + i, o, 1000 + x, -2.2 + 2.2 * k, z, { expr: t > 94.42 ? "laugh" : "smile", look: 0, wave: t > 94.12 && i % 2 === 0 ? Math.sin((t - 94.12) * 8) : undefined, tilt: t > 94.42 ? Math.sin(t * 11 + i) * 2.4 : 0 }, { seed: 90 + i });
    });
  }
  return A;
};

const HERD = 46;
const hash = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
/** returns creature sprites: kind, pose values rounded by main.js into a cache key */
export const beastsAt = (t) => {
  const out = [];
  if (t >= 82.75 && t < 89.4) for (let i = 0; i < HERD; i++) {
    const delay = hash(i, 1) * 0.95, x1 = -15 + hash(i, 2) * 30, x0 = -24 - hash(i, 3) * 10, z = -9 + hash(i, 4) * 20, sp = 15 + hash(i, 5) * 6;
    const run = t - 82.75 - delay;
    const dur = (x1 - x0) / sp, k = clamp(run / dur), x = lerp(x0, x1, k - (k * k * (k - 1)) * 0 - 0);
    if (Math.abs(x - 2) < 2.6 && Math.abs(z) < 2.2 && t > 84.2) continue;
    const moving = k > 0 && k < 1;
    const cough = t > 87.6 && hash(i, 8) > 0.45 ? 1 : 0;
    out.push({ kind: "cow", x, z, w: 2.0, flip: false, seed: i,
      pose: { phase: moving ? ((run * sp) / 4.2) % 1 : 0, run: moving ? 1 : 0, graze: !moving && !cough && hash(i, 6) > 0.5 ? 1 : 0, blink: blink(t, i + 3) > 0.7 ? 1 : 0, look: cough ? -0.2 : 0.3, skin: i % 4, cough } });
  }
  if (t > 76 && t < 82.75) for (let i = 0; i < 9; i++) {
    const x = -6 + hash(i, 11) * 14, z = -2.5 + hash(i, 12) * 9.5, cyc = (t * (0.7 + hash(i, 13) * 0.5) + hash(i, 14)) % 1;
    const dir = hash(i, 15) > 0.5, wob = Math.sin(t * 0.8 + i) * 0.6;
    out.push({ kind: "chicken", x: x + wob, z, w: 0.72, flip: dir, seed: i, pose: { peck: cyc < 0.3 ? 1 : 0, skin: i % 3, blink: blink(t, i + 9) > 0.7 ? 1 : 0, look: 0.3 } });
  }
  if (t > 74.1 && t < 75.5) {
    const k = E.back((t - 74.26) / 0.34, 1.3), eye = t < 74.7 ? 0.2 : t < 75.04 ? 0.9 : -0.9, tight = t > 75.02 ? 1 : 0;
    out.push({ kind: "mouse", x: lerp(10.6, 9.25, k), z: 24.45, w: 0.82, flip: false, seed: 1, pose: { look: eye, lid: t > 74.72 ? 0.42 : 0, tight } });
  }
  return out;
};

/** puffs and spray: pure lists of { kind, x, y, z, s, a } */
export const fxAt = (t) => {
  const out = [];
  const burst = (t0, x, y, z, n, spread, kind = "dust", dur = 0.55, size = 0.9) => { const d = t - t0; if (d < 0 || d > dur) return; const k = E.out(d / dur); for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + t0; out.push({ kind, x: x + Math.cos(a) * spread * k, y: y + k * 0.35 * spread + (i % 2) * 0.12, z: z + Math.sin(a) * spread * k, s: size * (0.5 + k * 0.7), a: 1 - E.in(d / dur) }); } };
  burst(71.56, 6, 0.2, 23.9, 8, 1.1, "dust", 0.42, 0.55);
  burst(79.77, -14, 1.5, -11.75, 8, 0.8, "dust", 0.22, 0.2);
  burst(66.06, -1.5, 31.1, 194.7, 5, 0.2, "dust", 0.34, 0.2);
  if (t >= 82.75 && t < 84.4) for (let i = 0; i < 26; i++) { const ph = (t * 0.9 + i * 0.13) % 1, x = -36 + (i % 13) * 3.2 + (t - 82.75) * 12; out.push({ kind: "dust", x, y: 0.3 + ph * 1.2, z: -10 + ((i * 7) % 20), s: 1.2 + ph * 1.2, a: (1 - ph) * 0.8 }); }
  if (t > 86.2 && t < 89.4) {
    const n = 72;
    for (let i = 0; i < n; i++) {
      const born = 86.45 + (i / n) * 2.7, age = t - born; if (age < 0) continue;
      const X = planeX(born), k = clamp(age / 2.6), y = 16.2 - 15 * E.out(k) * (0.75 + hash(i, 21) * 0.25);
      out.push({ kind: "poison", x: X - 3 + hash(i, 22) * 4 + age * 1.3, y, z: 14 + (hash(i, 23) - 0.5) * 7 - k * 10, s: 0.9 + k * 4.6, a: clamp(1.05 - k * 0.5) });
    }
  }
  burst(90.86, 24, 0.9, -20.3, 5, 0.38, "dust", 0.26, 0.14);
  burst(92.6, 40, 0.5, 10, 12, 14, "dust", 0.7, 5);
  burst(95.8, 1000, 0.95, 1001.4, 7, 0.3, "dust", 0.2, 0.07);
  return out;
};
export const planeX = (t) => lerp(-34, 40, (t - 86.2) / 3.2);

export const worldAt = (t, W, q) => {
  // lens coin
  const coin = pop(t, 66.02, 0.16); W.lensCoin.scale.set(coin, 1, coin); W.lensCoin.visible = coin > 0.01 && t < 68;
  // sack
  W.sack.visible = t >= 70.7 && t < 75.4;
  if (W.sack.visible) { const s = t < 71.56 ? sackAt(t) : [6, 0.46, 23.6]; W.sack.position.set(...s); W.sack.rotation.z = t < 71.56 ? (t - 70.7) * 14 : 0.26; const sq = 1 + 0.26 * Math.exp(-(t - 71.56) * 9) * (t > 71.56 ? 1 : 0); W.sack.scale.set(sq, 2 - sq, sq); }
  // tag pops on its word
  { const k = pop(t, 71.72, 0.2); W.tag.scale.set(k, k, 1); W.tag.visible = k > 0.01 && t < 84; }
  // law board: hole appears on its word
  { const h = E.out((t - 73.4) / 0.18); if (W.lawHole !== h) { W.law.userData.paint(h); W.lawHole = h; } }
  // eviction notice
  { const k = pop(t, 79.74, 0.1), s = 1 + (1 - clamp((t - 79.74) / 0.12)) * 0.7 * (t >= 79.74 ? 1 : 0); W.notice.scale.set(k * s, k * s, 1); W.notice.visible = k > 0.01; }
  // cabbages fall to the herd's front
  const front = -24 + (t - 82.75) * 19;
  W.cabPts.forEach(([x, z, s], i) => {
    const gone = t >= 82.75 && x < front ? 1 : 0;
    const pz = t > 86.5 ? 1 : 1;
    W.cabM.position.set(x, 0.17 * s, z); W.cabM.scale.setScalar(gone ? 0.0001 : s * pz); W.cabM.scale.y = gone ? 0.0001 : s * 0.82; W.cabM.rotation.y = x * 3; W.cabM.updateMatrix(); W.cabs.setMatrixAt(i, W.cabM.matrix);
  });
  W.cabs.instanceMatrix.needsUpdate = true;
  // biplane
  W.plane.visible = t > 86.15 && t < 89.5;
  if (W.plane.visible) { W.plane.position.set(planeX(t), 18 + Math.sin(t * 3) * 0.5, 14); W.plane.rotation.x = Math.sin(t * 2.3) * 0.08; W.prop.rotation.x = t * 74; }
  for (const f of W.flags) f.rotation.y = Math.sin(t * 4.2 + f.position.x) * 0.4;
  // watch and coins
  const sec = Math.floor((t - 89) * 4) / 4; if (W.watchSec !== sec) { W.dial.userData.paint(sec * 1.4); W.watchSec = sec; }
  { const tick = (t - 89.45) * 4; const kick = Math.exp(-((tick % 1) * 5)) * 0.03; W.watch.rotation.z = kick * (Math.floor(tick) % 2 ? 1 : -1); }
  for (let i = 0; i < 110; i++) {
    const m = W.cabM;
    let show = false;
    if (t >= 89.4 && t < 91.25) {
      if (i < 34) {
        const tAt = 89.5 + i * 0.043, d = t - tAt;
        if (d > 0) { show = true; const ang = i * 2.4, rr = 0.24 + (i % 7) * 0.05, lx = 24 + Math.cos(ang) * rr, lz = -20.5 + Math.sin(ang) * rr * 0.6, h = 0.74 + (i % 5) * 0.03, k = clamp(d / 0.22); m.position.set(lerp(24, lx, k), lerp(1.2, h, k) + Math.sin(Math.PI * k) * 0.22, lerp(-20.3, lz, k)); m.rotation.set(k * 6 + i, i, 0); if (k >= 1) m.rotation.set(0, i, 0); }
      } else {
        const d = t - 90.86; if (d > 0) { show = true; const a = i * 2.399, v = 1.1 + hash(i, 31) * 1.5, hx = Math.cos(a) * v * 0.42, hz = Math.sin(a) * v * 0.26; m.position.set(24 + hx * d, 1.1 + v * 2.4 * d - 5 * d * d, -20.6 + hz * d); m.rotation.set(d * 14 + i, d * 9, 0); }
      }
    }
    m.scale.setScalar(show ? 1 : 0.0001); m.updateMatrix(); W.coins.setMatrixAt(i, m.matrix);
  }
  W.coins.instanceMatrix.needsUpdate = true;
  W.watch.visible = t >= 89.3 && t < 91.3;
  // forest squashes flat on its word
  const sq = E.back((t - 91.72) / 0.88, 0.6), d = t < 91.2 ? 0 : sq;
  W.fHill.scale.y = lerp(0.62, 0.05, d);
  const hillTop = 34 * W.fHill.scale.y - 6;
  for (const f of W.fTrees) {
    const sur = Math.max(0, -6 + 34 * W.fHill.scale.y * Math.sqrt(Math.max(0, 1 - f.q * f.q * 0.95)));
    const stagger = 91.34 + f.q * 0.2 + (f.x - 26) / 40 * 0.9, k = E.in(clamp((t - stagger) / 0.32));
    f.t.position.set(f.x, sur, f.z);
    f.t.rotation.set(Math.sin(f.a) * k * 1.5, 0, -Math.abs(Math.cos(f.a)) * k * 1.5 - k * 0.15);
    f.t.visible = t < 95 && t > 88;
  }
  W.dozer.visible = t >= 91 && t < 93; W.dozer.position.set(lerp(30, 50, (t - 91.2) / 1.66), 0.15 * (Math.abs(Math.sin(t * 22)) * 0.2), 5);
  // report
  { const draw = Math.round(E.smooth((t - 94.72) / 0.72) * 40) / 40, st = t >= 95.8 ? 1 : 0, key = draw + "|" + st; if (W.repKey !== key) { W.report.userData.paint(draw, st); W.repKey = key; } }
  { const drop = 1 - E.in((t - 95.56) / 0.24), lift = E.smooth((t - 95.9) / 0.24); W.stamper.visible = t > 95.3; W.stamper.position.set(1000.0, 0.91 + drop * 0.7 + lift * 1.2, 1001.27); W.stamper.rotation.y = 0.13; }
  W.lamp.intensity = t >= 92.86 ? 7 : 0;
};
