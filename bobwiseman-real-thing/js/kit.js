// Shared helpers. Every draw is a pure function of song time t (textures are built once, seeded).
const W = 1920, H = 1080, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const easeOut = (u) => 1 - Math.pow(1 - clamp(u), 3);
const q8 = (t) => Math.floor(t * 8 + 1e-6) / 8; // hand-made looks boil and step on 8 fps
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(s, i) { const r = mulberry((s * 9973 + i * 7919) | 0); r(); return r(); }
function n1(seed, x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(seed, i), hash(seed, i + 1), u) * 2 - 1; }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function circ(cx, cy, r, n = 28, ry = r) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * ry]); } return p; }
function rectP(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
function densify(pts, step = 12, closed = true) {
  const out = [], n = pts.length, m = closed ? n : n - 1;
  for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % n], k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]); }
  if (!closed) out.push(pts[n - 1]); return out;
}
function wob(pts, seed, amp = 2, f = .04) { return pts.map(([x, y]) => [x + amp * n1(seed, x * f + y * f * .7), y + amp * n1(seed + 3.3, y * f - x * f * .6)]); }
function path(g, pts, closed = true) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); if (closed) g.closePath(); }
function xf(pts, x, y, s = 1, r = 0) { const c = Math.cos(r), si = Math.sin(r); return pts.map(([a, b]) => [x + (a * c - b * si) * s, y + (a * si + b * c) * s]); }

// paper / board textures (built once)
const TEX = {};
function noiseCanvas(w, h, seed, fn) { const c = mkCanvas(w, h), g = c.getContext('2d'), id = g.createImageData(w, h), R = mulberry(seed); for (let i = 0; i < w * h; i++) id.data.set(fn(R, i % w, (i / w) | 0), i * 4); g.putImageData(id, 0, 0); return c; }
function buildTextures() {
  TEX.grain = noiseCanvas(512, 512, 3, (R) => { const k = R() * 255; return [k, k, k, 20]; });
  TEX.tooth = noiseCanvas(512, 512, 5, (R) => { const k = 250 - (R() < .07 ? 50 + R() * 70 : R() * 14); return [k, k, k - 5, 255]; });
  const ht = mkCanvas(12, 12), hg = ht.getContext('2d'); hg.fillStyle = 'rgba(20,30,70,.17)'; hg.beginPath(); hg.arc(6, 6, 2.6, 0, TAU); hg.fill(); TEX.dots = ht;
  const cb = mkCanvas(512, 512), cg = cb.getContext('2d'); cg.fillStyle = '#c69c66'; cg.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 16) { const gr = cg.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, 'rgba(90,55,20,.16)'); gr.addColorStop(.5, 'rgba(255,230,190,.10)'); gr.addColorStop(1, 'rgba(90,55,20,.16)'); cg.fillStyle = gr; cg.fillRect(x, 0, 16, 512); }
  const R = mulberry(9); for (let i = 0; i < 900; i++) { cg.fillStyle = `rgba(${R() < .5 ? '80,50,20' : '240,215,170'},${.05 + R() * .1})`; cg.fillRect(R() * 512, R() * 512, 1 + R() * 3, 1 + R() * 3); }
  TEX.board = cb;
}
function tile(g, tex, alpha = 1, op = 'source-over', ox = 0, oy = 0) { g.save(); g.globalAlpha = alpha; g.globalCompositeOperation = op; g.translate(((ox % tex.width) + tex.width) % tex.width - tex.width, ((oy % tex.height) + tex.height) % tex.height - tex.height); g.fillStyle = g.createPattern(tex, 'repeat'); g.fillRect(0, 0, W + 2 * tex.width, H + 2 * tex.height); g.restore(); }

// ---- three ways to put a shape down: offset print, marker on cardboard, pencil ----
const STYLE = {
  // mid-century tourism print: flat stencil off register, thin navy key line
  brochure: { shape(g, pts, col, o = {}) { const cl = o.closed !== false, p = densify(pts, 14, cl);
    if (col && cl) { g.fillStyle = col; path(g, p.map(([x, y]) => [x + 3, y + 2])); g.fill(); }
    if (o.line !== 0) { g.strokeStyle = '#1d2a4a'; g.lineWidth = o.line || 2.2; g.lineJoin = g.lineCap = 'round'; path(g, p, cl); g.stroke(); } } },
  // fat felt marker over cheap poster paint; the line boils on 8 fps
  marker: { shape(g, pts, col, o = {}, t = 0) { const cl = o.closed !== false, b = Math.round(q8(t) * 8) % 3, p = densify(pts, 10, cl);
    if (col && cl) { g.fillStyle = col; path(g, wob(p, 40 + b + (o.seed || 0), 3.5)); g.fill(); }
    if (o.line !== 0) { g.strokeStyle = '#141210'; g.lineWidth = o.line || 6; g.lineCap = g.lineJoin = 'round'; path(g, wob(p, b + (o.seed || 0), 2.2), cl); g.stroke(); } } },
  // soft graphite: two light passes, no fill
  pencil: { shape(g, pts, col, o = {}, t = 0) { const cl = o.closed !== false, b = Math.round(q8(t) * 8) % 3, p = densify(pts, 8, cl);
    g.strokeStyle = 'rgba(45,45,52,.8)'; g.lineCap = g.lineJoin = 'round';
    for (let k = 0; k < 2; k++) { g.lineWidth = 1.5 + k; path(g, wob(p, b * 3 + k + (o.seed || 0), 1.5 + k), cl); g.stroke(); } } },
};
