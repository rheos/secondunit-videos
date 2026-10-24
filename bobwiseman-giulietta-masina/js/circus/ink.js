// Stone-printing engine for the circus bill. Four inks, each drawn as a flat black mask on its own layer,
// grained with a litho-crayon "tooth" (ink breaks up where the grained stone held no crayon), then coloured
// and multiplied onto cream paper with a small per-ink misregister. Overprints mix the way they do on press:
// red over yellow goes orange-red, blue over yellow goes green, blue over red goes deep purple.
const INKS = ['Y', 'R', 'B', 'K'];
const INK_RGB = { Y: [243, 194, 30], R: [212, 46, 38], B: [34, 62, 150], K: [32, 25, 23] };
const PAPER_RGB = [238, 226, 194];
const WALL_RGB = [22, 17, 14];
// Where each stone sat on the sheet (world units): the press never registers perfectly.
const MISREG = { Y: [0, 0], R: [7, -4], B: [-6, 5], K: [2, 3] };

// Texture sources live in CPU-backed canvases (willReadFrequently), so a GPU context loss on a loaded machine can't wipe them.
function cpuCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d', { willReadFrequently: true }); return c; }
const LAY = {}, LG = {};
for (const k of INKS) { LAY[k] = mkCanvas(); LG[k] = LAY[k].getContext('2d'); }

// ---- grained-stone noise field (512x512, tiles), blurred white noise, values sorted for quantile thresholds ----
const NS = 512;
let NOISE = null, NSORT = null;
function buildNoise() {
  const R = mulberry(3131), a = new Float32Array(NS * NS), b = new Float32Array(NS * NS);
  for (let i = 0; i < a.length; i++) a[i] = R();
  // two passes of a 3x3 box blur (wrapping) gives granules ~2-3 px across
  for (let pass = 0; pass < 2; pass++) {
    const src = pass ? b : a, dst = pass ? a : b;
    for (let y = 0; y < NS; y++) for (let x = 0; x < NS; x++) {
      let s = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += src[((y + dy + NS) % NS) * NS + ((x + dx + NS) % NS)];
      dst[y * NS + x] = s / 9;
    }
  }
  // mix in a little unblurred noise so the edges of granules stay crisp
  const R2 = mulberry(77);
  for (let i = 0; i < a.length; i++) a[i] = a[i] * .85 + R2() * .15;
  NOISE = a; NSORT = Float32Array.from(a).sort();
}
const q = (d) => NSORT[Math.min(NSORT.length - 1, Math.max(0, Math.floor(d * NSORT.length)))];

// Tooth: a mask of the spots where the crayon skipped (punched out of every ink layer).
let TOOTH = null, BLOTCH = null;
function buildTooth() {
  const c = cpuCanvas(NS, NS), g = c.getContext('2d'), d = g.createImageData(NS, NS);
  const lo = q(.80), hi = q(.93);
  for (let i = 0; i < NS * NS; i++) { const v = NOISE[i]; d.data[i * 4 + 3] = v < lo ? 0 : v > hi ? 255 : (v - lo) / (hi - lo) * 200; }
  g.putImageData(d, 0, 0); TOOTH = c;
  // blotch: large soft density variation, so a flat colour reads as rolled ink, not a vector fill
  const c2 = cpuCanvas(256, 256), g2 = c2.getContext('2d'), d2 = g2.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    let v = 0, amp = 1, f = 1 / 64, tot = 0;
    for (let o = 0; o < 3; o++) { v += amp * (n1(91 + o, x * f + 13 * o) * n1(57 + o, y * f + 7 * o)); tot += amp; amp *= .5; f *= 2; }
    const a2 = clamp(.5 + v / tot * 1.6); d2.data[(y * 256 + x) * 4 + 3] = a2 * 255;
  }
  g2.putImageData(d2, 0, 0); BLOTCH = c2;
}
// Crayon tone: stipple of density d (0..1) made from the same granules, so shading reads as drawn on the stone.
const TONE_LEVELS = [.12, .22, .34, .46, .6, .75];
const TONE_CV = [];
function buildTones() {
  for (const lv of TONE_LEVELS) {
    const c = cpuCanvas(NS, NS), g = c.getContext('2d'), d = g.createImageData(NS, NS), th = q(lv);
    for (let i = 0; i < NS * NS; i++) d.data[i * 4 + 3] = NOISE[(i * 7 + 13) % (NS * NS)] < th ? 255 : 0;
    g.putImageData(d, 0, 0); TONE_CV.push(c);
  }
}
const TONEPAT = {}; // per layer context
function tone(g, d) { // returns a fillStyle pattern for density d on context g
  const key = g === LG.Y ? 'Y' : g === LG.R ? 'R' : g === LG.B ? 'B' : g === LG.K ? 'K' : 'X';
  if (!TONEPAT[key]) TONEPAT[key] = TONE_CV.map((c) => g.createPattern(c, 'repeat'));
  let i = 0; while (i + 1 < TONE_LEVELS.length && TONE_LEVELS[i + 1] <= d) i++;
  return TONEPAT[key][i];
}

// Paper: cream, a faint fibre, foxing and a soft mottle. World-anchored pattern.
let PAPER = null, WALLTEX = null;
function buildPaper() {
  const s = 1024, c = cpuCanvas(s, s), g = c.getContext('2d'), R = mulberry(4242);
  g.fillStyle = rgb(PAPER_RGB); g.fillRect(0, 0, s, s);
  const d = g.getImageData(0, 0, s, s);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const i = (y * s + x) * 4;
    const m = n1(5, x / 90 + 3) * n1(6, y / 90 + 9) * 10 + (R() - .5) * 7;
    d.data[i] += m; d.data[i + 1] += m; d.data[i + 2] += m * 1.3;
  }
  g.putImageData(d, 0, 0);
  g.globalAlpha = .06; g.strokeStyle = '#7a6040'; g.lineWidth = 1;
  for (let k = 0; k < 900; k++) { const x = R() * s, y = R() * s, a = R() * TAU, l = 6 + R() * 22; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  g.globalAlpha = .05; g.fillStyle = '#8a5a20';
  for (let k = 0; k < 40; k++) { g.beginPath(); g.arc(R() * s, R() * s, 2 + R() * 9, 0, TAU); g.fill(); }
  PAPER = c;
  const w = cpuCanvas(512, 512), gw = w.getContext('2d'), dw = gw.createImageData(512, 512);
  for (let i = 0; i < 512 * 512; i++) { const v = (R() - .5) * 10; dw.data[i * 4] = WALL_RGB[0] + v; dw.data[i * 4 + 1] = WALL_RGB[1] + v; dw.data[i * 4 + 2] = WALL_RGB[2] + v; dw.data[i * 4 + 3] = 255; }
  gw.putImageData(dw, 0, 0); WALLTEX = w;
}

function buildInk() { buildNoise(); buildTooth(); buildTones(); buildPaper(); }

// Set a layer's world transform for camera cam plus that ink's misregister (world units) and an extra jolt.
function setInkXf(g, cam, k, jolt = [0, 0]) {
  const m = MISREG[k];
  const ox = m[0] + jolt[0], oy = m[1] + jolt[1];
  g.setTransform(cam.s, 0, 0, cam.s, W / 2 - (cam.x - ox) * cam.s, H / 2 - (cam.y - oy) * cam.s);
}
function clearLayer(k) { const g = LG[k]; g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, W, H); }

// Grain the mask (world-anchored, so the tooth stays on the stone as the camera moves), then colour it.
const TOOTHPAT = {}, BLOTCHPAT = {};
function finishLayer(k, cam, bounds, inkAlpha = 1) {
  const g = LG[k];
  if (!TOOTHPAT[k]) { TOOTHPAT[k] = g.createPattern(TOOTH, 'repeat'); BLOTCHPAT[k] = g.createPattern(BLOTCH, 'repeat'); }
  g.save();
  setInkXf(g, cam, k);
  g.globalCompositeOperation = 'destination-out';
  // the tooth: fine skipped grains, a different offset per stone
  const off = { Y: [0, 0], R: [171, 63], B: [311, 207], K: [97, 401] }[k];
  g.translate(off[0], off[1]); g.globalAlpha = .9; g.fillStyle = TOOTHPAT[k];
  g.fillRect(bounds[0] - off[0] - 600, bounds[1] - off[1] - 600, bounds[2] + 1200, bounds[3] + 1200);
  g.translate(-off[0], -off[1]);
  g.scale(6, 6); g.globalAlpha = k === 'K' ? .1 : .2; g.fillStyle = BLOTCHPAT[k];
  g.fillRect(bounds[0] / 6 - 100, bounds[1] / 6 - 100, bounds[2] / 6 + 200, bounds[3] / 6 + 200);
  g.restore();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-in'; g.globalAlpha = inkAlpha;
  g.fillStyle = rgb(INK_RGB[k]); g.fillRect(0, 0, W, H); g.restore();
}

// ---------------- shape helpers (draw in any opaque colour: the layer is a mask) ----------------
function star(g, x, y, r, rot = 0, n = 5, inner = .45) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot - Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * inner : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath();
}
function rrect(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function poly(g, pts) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); }
function knock(g, fn) { const o = g.globalCompositeOperation; g.globalCompositeOperation = 'destination-out'; fn(); g.globalCompositeOperation = o; }
function wobbleLine(g, pts, w, seed) { // a crayon line: slightly uneven, drawn twice
  g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let p = 0; p < 2; p++) {
    g.beginPath();
    pts.forEach(([x, y], i) => { const jx = n1(seed + p * 7, i * .7) * w * .18, jy = n1(seed + p * 7 + 3, i * .7) * w * .18; i ? g.lineTo(x + jx, y + jy) : g.moveTo(x + jx, y + jy); });
    g.stroke(); g.lineWidth = w * .7;
  }
}

// ---------------- wood type ----------------
const WOOD = (s) => `900 ${s}px Rockwell`;
const CONDENSE = .84;           // wood type was cut condensed
const OVERSHOOT = 1.12;         // largest stamp scale; every fitted word leaves room for it
function charAdv(g, ch, size) { g.font = WOOD(size); return g.measureText(ch).width * CONDENSE; }
// Lay out a word's letters left to right. Returns {chars:[{ch,x}], w} with x the letter centre from the word's left edge.
function layWord(g, word, size, track = .04) {
  let x = 0; const chars = [];
  for (const ch of word) { const a = charAdv(g, ch, size); chars.push({ ch, x: x + a / 2 }); x += a + size * track; }
  return { chars, w: x - size * track };
}
// Largest size <= size at which word (plus its block shadow) fits maxW at the overshoot scale.
function fitWood(g, word, maxW, size, shadow = .1) {
  let s = size; while (s > 8 && (layWord(g, word, s).w + s * shadow) * OVERSHOOT > maxW) s -= 1; return s;
}
// One wood-type letter, drawn for one ink. style: 'red' (red face, blue block shadow, key outline, yellow crayon highlight),
// 'cream' (letter knocked out of a solid band on layer `band`, red block shadow), 'key' (black face, nothing else).
function woodLetter(g, ink, ch, x, y, size, sc = 1, rot = 0, style = 'red', band = 'B') {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc * CONDENSE, sc);
  g.font = WOOD(size); g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  const sh = size * .085, N = 9, sx = sh / CONDENSE * .9, sy = sh;
  const shadow = () => { for (let i = 1; i <= N; i++) g.fillText(ch, sx * i / N, sy * i / N); };
  if (style === 'red') {
    if (ink === 'R') g.fillText(ch, 0, 0);
    if (ink === 'B') { shadow(); knock(g, () => g.fillText(ch, 0, 0)); }
    if (ink === 'K') { g.lineWidth = size * .022; g.lineJoin = 'round'; g.strokeText(ch, 0, 0); g.lineWidth = size * .012; g.strokeText(ch, sx, sy); }
    if (ink === 'Y') { g.save(); g.beginPath(); g.rect(-size, -size * .78, size * 2, size * .36); g.clip(); g.fillStyle = tone(g, .6); g.fillText(ch, 0, 0); g.restore(); }
  } else if (style === 'cream') {
    if (ink === band) knock(g, () => { shadow(); g.fillText(ch, 0, 0); });
    if (ink === 'R') { shadow(); knock(g, () => g.fillText(ch, 0, 0)); }
    if (ink === 'K') { g.lineWidth = size * .03; g.lineJoin = 'round'; g.strokeText(ch, 0, 0); }
  } else if (style === 'key') {
    if (ink === 'K') g.fillText(ch, 0, 0);
    if (ink === 'R') { g.save(); g.globalAlpha = 1; shadow(); knock(g, () => g.fillText(ch, 0, 0)); g.restore(); }
  }
  g.restore();
}
// A stamped word: letters appear syllable by syllable. reveal = number of letters shown; stamps = [{n, t}] per syllable.
function stampScale(t, ta) { if (t < ta) return 0; const u = (t - ta) / .16; return u >= 1 ? 1 : 1 + (OVERSHOOT - 1) * Math.cos(u * Math.PI / 2) * (1 - u * .2); }
function woodWord(g, ink, word, cx, by, size, t, syl, style = 'red', band = 'B', rot = 0) {
  // syl: [[letters, time], ...] in order; letters shown once their syllable's time is passed
  const L = layWord(g, word, size);
  g.save(); g.translate(cx, by); g.rotate(rot);
  let idx = 0;
  for (const [n, ts] of syl) {
    const sc = stampScale(t, ts);
    for (let i = 0; i < n; i++, idx++) {
      if (sc <= 0) continue;
      const c = L.chars[idx];
      woodLetter(g, ink, c.ch, c.x - L.w / 2, 0, size, sc, 0, style, band);
    }
  }
  g.restore();
  return L.w;
}
