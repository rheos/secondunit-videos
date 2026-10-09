// Banknote engraving engine. Every frame is a pure function of song time t.
// Shapes are painted into three tone maps (darkness, hatch angle, form height) in world space;
// a WebGL pass turns them into true line engraving: parallel lines whose WIDTH carries the tone,
// cross-hatch in the darks, lines swelling over the form. Crisp 2D line work (guilloche, lettering,
// features, serials) goes on top in the same camera.
const W = 1920, H = 1080;
const INK = [24, 66, 52], INK2 = [128, 40, 30];          // currency green, serial red-brown
const inkA = (a, c = INK) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const PAPER = '#efe8d3';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const eio = (u) => (u = clamp(u), u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const eo = (u) => 1 - Math.pow(1 - clamp(u), 3);
const ramp = (t, a, b) => clamp((t - a) / (b - a));
function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

// ---------- camera ----------
const CAM = { x: 0, y: 0, s: 1, r: 0 };
function setCam(x, y, s, r = 0) { CAM.x = x; CAM.y = y; CAM.s = s; CAM.r = r; if (typeof tc !== 'undefined') for (const [c, k] of [[tc, 1], [ac, HR], [hc, HR]]) c.setTransform(...camT(k)); }
function camT(k = 1) {
  const a = CAM.s * Math.cos(CAM.r) * k, b = CAM.s * Math.sin(CAM.r) * k, c = -b, d = a;
  return [a, b, c, d, W / 2 * k - (a * CAM.x + c * CAM.y), H / 2 * k - (b * CAM.x + d * CAM.y)];
}
function toScreen(x, y) { const m = camT(); return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }

// ---------- tone maps ----------
const HR = 0.5; // angle/height maps at half res
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const toneC = mk(W, H), angC = mk(W * HR, H * HR), hgtC = mk(W * HR, H * HR), hgtB = mk(W * HR, H * HR);
const tc = toneC.getContext('2d'), ac = angC.getContext('2d'), hc = hgtC.getContext('2d'), hbc = hgtB.getContext('2d');
const grey = (d) => { const v = Math.round(clamp(d) * 255); return `rgb(${v},${v},${v})`; };
const K = { tMul: 1, period: 6, warp: 2.2, rev: 1e9, revJit: 0, revDir: 0, fade: 1, ink: INK, under: [], over: [], screen: [] };

function beginTone() {
  for (const [c, k] of [[tc, 1], [ac, HR], [hc, HR]]) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.fillStyle = '#000'; c.fillRect(0, 0, W * k, H * k); c.setTransform(...camT(k)); }
}
// paint a world-space Path2D. tone: number or (ctx)=>style; ang in degrees (world); hgt 0..1 (blurred later)
function T(path, tone, ang = 45, hgt = 1, alpha = 1) {
  tc.globalAlpha = alpha * K.tMul; tc.fillStyle = typeof tone === 'function' ? tone(tc) : grey(tone); tc.fill(path);
  ac.globalAlpha = 1; const av = ((ang % 180) + 180) % 180 / 180; ac.fillStyle = grey(av); ac.fill(path);
  if (hgt != null) { hc.globalAlpha = 1; hc.fillStyle = grey(hgt); hc.fill(path); }
  tc.globalAlpha = 1;
}
// erase tone (paper shows through): used for highlights / white areas inside a hatched region
function Tclear(path) { tc.fillStyle = '#000'; tc.fill(path); }
const under = (fn) => K.under.push(fn), screen = (fn) => K.screen.push(fn);
const over = (fn) => { const cp = K.clip; K.over.push(cp ? (c) => { c.clip(cp); fn(c); } : fn); };

// ---------- WebGL engraving pass ----------
const glC = mk(W, H);
const gl = glC.getContext('webgl', { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false });
const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
const FS = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform sampler2D tTone, tAng, tHgt; uniform vec2 res; uniform vec4 cam; uniform float period, warp, rev, revJit, revDir, fade; uniform vec3 ink;
float h1(float n){ return fract(sin(n*127.1+311.7)*43758.5453); }
float hatch(vec2 w, float a, float h, float wid, float dash, out float idx){
  vec2 n = vec2(-sin(a), cos(a)); vec2 al = vec2(cos(a), sin(a));
  float u = dot(w, n) / period + h * warp;
  idx = floor(u + .5);
  float g = abs(fract(u + .5) - .5) * 2.;      // 0 on the line centre, 1 midway between lines
  float fw = fwidth(u) * 2.;
  float cov = clamp((wid - g) / max(fw, 1e-4) + .5, 0., 1.);
  // light tones break into flicks/dots along the line, like a burin lifting off
  if (dash > 0.) { float v = dot(w, al) / period * .45 + h1(idx) * 7.; float g = sin(v * 6.2831) * .5 + .5; cov *= smoothstep(dash - .12, dash + .12, g + .0); }
  return cov;
}
void main(){
  vec2 sp = vec2(gl_FragCoord.x, res.y - gl_FragCoord.y);
  vec2 tcd = gl_FragCoord.xy / res;
  float d = texture2D(tTone, tcd).r;
  if (d < .006) { gl_FragColor = vec4(0.); return; }
  float a = texture2D(tAng, tcd).r * 3.14159265;
  float h = texture2D(tHgt, tcd).r;
  // screen -> world
  vec2 q = (sp - res * .5) / cam.z; float cr = cos(-cam.w), sr = sin(-cam.w);
  vec2 w = vec2(cr * q.x - sr * q.y, sr * q.x + cr * q.y) + cam.xy;
  float i1, i2, i3;
  float w1 = clamp(d * 1.05, 0., .82);
  float dash1 = d < .1 ? (1. - d / .1) * .55 : 0.;
  float c1 = hatch(w, a, h, w1, dash1, i1);
  float w2 = clamp((d - .42) * 1.35, 0., .7);
  float c2 = w2 > 0. ? hatch(w * 1.0 + 3.1, a + 1.05, h * .6, w2, 0., i2) : 0.;
  float w3 = clamp((d - .78) * 1.6, 0., .5);
  float c3 = w3 > 0. ? hatch(w + 1.7, a - .9, h * .3, w3, 0., i3) : 0.;
  float cov = max(c1, max(c2, c3));
  // engraver's line-by-line reveal
  if (rev < 1e8) { vec2 rd = vec2(cos(revDir), sin(revDir)); float s = dot(w, rd); float lim = rev + h1(i1 * 1.37 + 2.) * revJit; cov *= smoothstep(lim + 2., lim - 2., s); }
  // very small line period on screen: fall back to an even tint so it never aliases
  float sp_px = period * cam.z; float lod = smoothstep(2.2, 3.4, sp_px);
  cov = mix(min(d * .85, .9), cov, lod) * fade;
  gl_FragColor = vec4(ink * cov, cov);
}`;
function shader(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
gl.getExtension('OES_standard_derivatives');
const prog = gl.createProgram(); gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
const ploc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(ploc); gl.vertexAttribPointer(ploc, 2, gl.FLOAT, false, 0, 0);
const U = {}; for (const n of ['tTone', 'tAng', 'tHgt', 'res', 'cam', 'period', 'warp', 'rev', 'revJit', 'revDir', 'fade', 'ink']) U[n] = gl.getUniformLocation(prog, n);
const texs = [0, 1, 2].map((i) => { const tx = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tx); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return tx; });
gl.uniform1i(U.tTone, 0); gl.uniform1i(U.tAng, 1); gl.uniform1i(U.tHgt, 2);
gl.viewport(0, 0, W, H);

function engrave() {
  // blur the height map so lines bulge smoothly over each form
  hbc.setTransform(1, 0, 0, 1, 0, 0); hbc.filter = 'none'; hbc.fillStyle = '#000'; hbc.fillRect(0, 0, W * HR, H * HR);
  hbc.filter = 'blur(13px)'; hbc.drawImage(hgtC, 0, 0); hbc.filter = 'none';
  const srcs = [toneC, angC, hgtB];
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  srcs.forEach((s, i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, texs[i]); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s); });
  gl.uniform2f(U.res, W, H); gl.uniform4f(U.cam, CAM.x, CAM.y, CAM.s, CAM.r);
  gl.uniform1f(U.period, K.period); gl.uniform1f(U.warp, K.warp); gl.uniform1f(U.rev, K.rev); gl.uniform1f(U.revJit, K.revJit); gl.uniform1f(U.revDir, K.revDir); gl.uniform1f(U.fade, K.fade);
  gl.uniform3f(U.ink, K.ink[0] / 255, K.ink[1] / 255, K.ink[2] / 255);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// ---------- paper ----------
const paperTile = mk(1024, 1024);
(function makePaper() {
  const c = paperTile.getContext('2d'); c.fillStyle = PAPER; c.fillRect(0, 0, 1024, 1024);
  const img = c.getImageData(0, 0, 1024, 1024), d = img.data, r = rng(77);
  // soft mottling (value noise) + fine grain
  const g = 32, grid = []; for (let i = 0; i <= g; i++) { grid.push([]); for (let j = 0; j <= g; j++) grid[i].push(r()); }
  for (let i = 0; i <= g; i++) { grid[i][g] = grid[i][0]; grid[g][i] = grid[0][i]; }
  for (let y = 0; y < 1024; y++) for (let x = 0; x < 1024; x++) {
    const fx = x / 1024 * g, fy = y / 1024 * g, ix = Math.floor(fx), iy = Math.floor(fy), ux = fx - ix, uy = fy - iy;
    const sx = ux * ux * (3 - 2 * ux), sy = uy * uy * (3 - 2 * uy);
    const v = lerp(lerp(grid[iy][ix], grid[iy][ix + 1], sx), lerp(grid[iy + 1][ix], grid[iy + 1][ix + 1], sx), sy);
    const k = (v - .5) * 9 + (r() - .5) * 7, o = (y * 1024 + x) * 4;
    d[o] += k; d[o + 1] += k; d[o + 2] += k * .8;
  }
  c.putImageData(img, 0, 0);
  // security fibres: short red and blue hairs
  for (let i = 0; i < 260; i++) {
    const x = r() * 1024, y = r() * 1024, a = r() * 6.28, L = 6 + r() * 16, bend = (r() - .5) * 8;
    c.strokeStyle = r() < .5 ? `rgba(170,40,50,${.25 + r() * .3})` : `rgba(40,70,160,${.2 + r() * .3})`; c.lineWidth = .7 + r() * .5;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * L / 2 + bend, y + Math.sin(a) * L / 2 - bend, x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke();
  }
})();
let paperPat = null;

// ---------- frame ----------
const outC = document.getElementById('c'); outC.width = W; outC.height = H; const oc = outC.getContext('2d');
function beginFrame() { K.under = []; K.over = []; K.screen = []; K.period = 6; K.warp = 2.2; K.rev = 1e9; K.revJit = 0; K.revDir = 0; K.fade = 1; K.ink = INK; K.tMul = 1; K.noVig = false; K.clip = null; beginTone(); }
function present() {
  if (!paperPat) paperPat = oc.createPattern(paperTile, 'repeat');
  oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalAlpha = 1; oc.filter = 'none';
  // paper lives in world space (scaled gently so its grain never gets huge)
  const m = camT(); const ps = Math.pow(CAM.s, .35) / CAM.s;
  oc.save(); oc.setTransform(m[0] * ps, m[1] * ps, m[2] * ps, m[3] * ps, m[4], m[5]); oc.fillStyle = paperPat;
  oc.fillRect(-1e5, -1e5, 2e5, 2e5); oc.restore();
  for (const f of K.under) { oc.save(); oc.setTransform(...camT()); f(oc); oc.restore(); }
  engrave();
  oc.setTransform(1, 0, 0, 1, 0, 0); oc.globalCompositeOperation = 'multiply'; oc.drawImage(glC, 0, 0); oc.globalCompositeOperation = 'source-over';
  for (const f of K.over) { oc.save(); oc.setTransform(...camT()); f(oc); oc.restore(); }
  for (const f of K.screen) { oc.save(); oc.setTransform(1, 0, 0, 1, 0, 0); f(oc); oc.restore(); }
  // a soft edge falloff, like a print under a lamp
  if (K.noVig) return;
  oc.setTransform(1, 0, 0, 1, 0, 0);
  const vg = oc.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); vg.addColorStop(0, 'rgba(60,45,20,0)'); vg.addColorStop(1, 'rgba(60,45,20,.16)');
  oc.fillStyle = vg; oc.fillRect(0, 0, W, H);
}

// ---------- path helpers ----------
const P2 = () => new Path2D();
function ell(x, y, rx, ry, rot = 0) { const p = P2(); p.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); return p; }
function rect(x, y, w, h) { const p = P2(); p.rect(x, y, w, h); return p; }
function poly(pts, close = true) { const p = P2(); pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); if (close) p.closePath(); return p; }
// smooth closed curve through points (Catmull-Rom)
function blob(pts, close = true) {
  const p = P2(), n = pts.length; p.moveTo(pts[0][0], pts[0][1]);
  const N = close ? n : n - 1;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const q0 = !close && i === 0 ? p1 : p0, q3 = !close && i + 2 >= n ? p2 : p3;
    p.bezierCurveTo(p1[0] + (p2[0] - q0[0]) / 6, p1[1] + (p2[1] - q0[1]) / 6, p2[0] - (q3[0] - p1[0]) / 6, p2[1] - (q3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
  if (close) p.closePath(); return p;
}
// transform a local path into world
function xf(path, x, y, s, rot = 0, sx = 1) { const p = P2(); const c = Math.cos(rot) * s, si = Math.sin(rot) * s; p.addPath(path, new DOMMatrix([c * sx, si * sx, -si, c, x, y])); return p; }

// ---------- guilloche ----------
// lattice rosette: n phase-shifted wave rings between rIn and rOut, k lobes. prog draws it on, unwind relaxes it to one line.
function rosette(c, cx, cy, R, o = {}) {
  const n = o.n ?? 28, k = o.k ?? 9, inner = o.inner ?? .55, m = o.m ?? 0, prog = o.prog ?? 1, un = o.unwind ?? 0, lw = o.lw ?? 1.1, col = o.col ?? inkA(.85);
  const N = o.pts ?? 720;
  c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round';
  const relax = ss(0, .5, un), open = ss(.5, 1, un), Lline = o.lineLen ?? 2 * Math.PI * R;
  const nv = Math.max(1, Math.round(lerp(n, 1, ss(.15, .5, un)))); if (un > 0) c.lineWidth = lerp(lw, o.lineW ?? lw * 2.5, ss(.35, .7, un));
  for (let j = 0; j < n; j++) {
    const alive = j < nv ? 1 : 0; if (!alive) continue;
    const pj = clamp(prog * 1.3 - j / n * .3);
    if (pj <= 0) continue;
    const ph = j / n * Math.PI * 2 / k * (o.twist ?? 1);
    c.beginPath();
    const M = Math.max(2, Math.round(N * pj));
    for (let i = 0; i <= M; i++) {
      const th = i / N * Math.PI * 2;
      let r = inner + (1 - inner) * (.5 + .5 * Math.sin(k * th + ph * k + (o.spin ?? 0)));
      if (m) r *= 1 - .07 * (1 - Math.cos(m * th));
      r = lerp(r, (1 + inner) / 2, relax) * R;
      let x = cx + Math.cos(th - Math.PI / 2) * r, y = cy + Math.sin(th - Math.PI / 2) * r;
      if (open > 0) { const lx = cx + (i / N - .5) * Lline, ly = cy + (o.lineY ?? R * (1 + inner) / 2); x = lerp(x, lx, open); y = lerp(y, ly, open); }
      i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
  }
}
// spirograph (hypotrochoid) flower
function spiro(c, cx, cy, R, r, d, o = {}) {
  const turns = o.turns ?? 1, prog = o.prog ?? 1, N = o.pts ?? 1600;
  c.strokeStyle = o.col ?? inkA(.85); c.lineWidth = o.lw ?? 1; c.beginPath();
  const g = (a, b) => (b ? g(b, a % b) : a); const per = 2 * Math.PI * r / g(Math.round(R), Math.round(r)) * turns;
  const sc = o.scale ?? 1; const M = Math.round(N * prog);
  for (let i = 0; i <= M; i++) {
    const t = i / N * per; const x = (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t), y = (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t);
    i ? c.lineTo(cx + x * sc, cy + y * sc) : c.moveTo(cx + x * sc, cy + y * sc);
  }
  c.stroke();
}
// guilloche band between two points (interwoven sine strands), width B
function band(c, x0, y0, x1, y1, B, o = {}) {
  const n = o.n ?? 6, lam = o.lam ?? 26, prog = o.prog ?? 1, L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux;
  c.strokeStyle = o.col ?? inkA(.8); c.lineWidth = o.lw ?? .9;
  const Lp = L * prog, step = 3;
  for (let j = 0; j < n; j++) {
    c.beginPath();
    for (let s = 0; s <= Lp; s += step) {
      const a = B / 2 * Math.sin(s / lam * Math.PI * 2 + j / n * Math.PI * 2) * (o.env ? o.env(s / L) : 1);
      const x = x0 + ux * s + nx * a, y = y0 + uy * s + ny * a; s ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
  }
  if (o.edges !== false) { c.lineWidth = (o.lw ?? .9) * 1.4; c.beginPath(); for (const sg of [-1, 1]) { c.moveTo(x0 + nx * sg * B * .62, y0 + ny * sg * B * .62); c.lineTo(x0 + ux * Lp + nx * sg * B * .62, y0 + uy * Lp + ny * sg * B * .62); } c.stroke(); }
}
// band around a closed ellipse (oval frame)
function ovalBand(c, cx, cy, rx, ry, B, o = {}) {
  const n = o.n ?? 6, waves = o.waves ?? 60, prog = o.prog ?? 1, N = 900;
  c.strokeStyle = o.col ?? inkA(.8); c.lineWidth = o.lw ?? .9;
  for (let j = 0; j < n; j++) {
    c.beginPath(); const M = Math.round(N * prog);
    for (let i = 0; i <= M; i++) {
      const th = i / N * Math.PI * 2 - Math.PI / 2, a = B / 2 * Math.sin(th * waves + j / n * Math.PI * 2);
      const x = cx + Math.cos(th) * (rx + a), y = cy + Math.sin(th) * (ry + a); i ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
  }
  if (o.edges !== false) { c.lineWidth = (o.lw ?? .9) * 1.5; for (const k of [-.62, .62]) { c.beginPath(); c.ellipse(cx, cy, rx + B * k, ry + B * k, 0, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); c.stroke(); } }
}

// ---------- lettering ----------
const SERIF = '"Didot", "Bodoni 72", "Baskerville", serif', MONO = '"Menlo", "Courier New", monospace';
// largest size <= maxH such that text fits maxW (measured), returns size
function fitSize(c, str, maxW, maxH, fam = SERIF, wt = '') {
  let s = maxH; c.font = `${wt} ${s}px ${fam}`; const w = c.measureText(str).width; if (w > maxW) s = s * maxW / w; return s;
}
function fitText(c, str, cx, cy, maxW, maxH, o = {}) {
  const fam = o.fam ?? SERIF, wt = o.wt ?? '', s = fitSize(c, str, maxW, maxH, fam, wt);
  c.font = `${wt} ${s}px ${fam}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = o.col ?? inkA(.92);
  if (o.ls) { c.letterSpacing = o.ls + 'px'; }
  c.fillText(str, cx, cy); c.letterSpacing = '0px'; return s;
}
