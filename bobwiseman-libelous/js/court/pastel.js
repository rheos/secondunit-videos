// Pastel-on-toned-paper engine for the court look. Pure: strokes are data (built once, or rebuilt
// per frame from t for moving parts), every jitter comes from a seed, nothing is random at draw time.
//
// How the mark-making works: each pass (lay-in colour, scumble, darks, highlights, conte lines) is
// drawn into its own layer, whose alpha is the PRESSURE of the stick. A small WebGL step then cuts
// the layer against the paper's TOOTH (a height map baked once): pigment sticks only where the
// tooth is higher than a threshold that drops as pressure rises. Light pressure catches only the
// peaks (the toned paper shows through in specks); heavy pressure fills most of the grain. Stroke
// edges and the ends of strokes are lighter, so they break up; that is the chalky edge.
// Rubbed shadows go through a blur instead (rubbed pastel fills the tooth).

const PASS = { SMUDGE: 0, LAYIN: 1, SCUMBLE: 2, DARK: 3, LIGHT: 4, LINE: 5 };
// per pass: tooth threshold at zero pressure, at full pressure, edge softness, opacity
// per pass: [tooth threshold at zero pressure, at full pressure, edge softness, opacity, valley stain]
// (the stain is the dust that settles into the valleys, so the paper between specks is tinted, not bare)
const PASS_CUT = [null, [1.05, .1, .16, .97, .3], [1.05, .45, .15, .92, .15], [1.0, .04, .14, 1, .3], [1.05, .22, .14, 1, .15], [.95, .05, .12, 1, .4]];
let PAPER = null, TOOTHC = null, LAYERS = [], SKC = null, SKG = null, GLC = null;

function bakePaper() {
  if (PAPER) return;
  function lattice(cell, seed) {
    const gw = Math.ceil(W / cell) + 3, gh = Math.ceil(H / cell) + 3, L = new Float32Array(gw * gh), R = mulberry(seed);
    for (let i = 0; i < L.length; i++) L[i] = R();
    return { cell, gw, L };
  }
  function samp(lt, x, y) {
    const fx = x / lt.cell, fy = y / lt.cell, ix = Math.floor(fx), iy = Math.floor(fy), u = fx - ix, v = fy - iy;
    const i = (iy + 1) * lt.gw + ix + 1, L = lt.L;
    const a = L[i], b = L[i + 1], c = L[i + lt.gw], d = L[i + lt.gw + 1];
    const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
  }
  const o1 = lattice(1.8, 11), o2 = lattice(3.6, 12), o3 = lattice(9, 13), o4 = lattice(70, 14), o5 = lattice(260, 15), w1 = lattice(40, 16), w2 = lattice(40, 17);
  const T = new Float32Array(W * H);
  const k = TAU / 6, c60 = Math.cos(Math.PI / 3), s60 = Math.sin(Math.PI / 3);
  // fine random grain, 2-6 px: at this scale the tooth reads as broken, chalky stroke edges and
  // speckled light strokes; the shape of each stroke does the rest
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const wx = x + (samp(w1, x, y) - .5) * 5, wy = y + (samp(w2, x, y) - .5) * 5;
    const hx = (Math.cos(k * wx) + Math.cos(k * (-c60 * wx + s60 * wy)) + Math.cos(k * (-c60 * wx - s60 * wy)) + 1.5) / 4.5;
    T[y * W + x] = .45 * samp(o1, x, y) + .3 * samp(o2, x, y) + .1 * samp(o3, x, y) + .15 * hx;
  }
  // equalise so the threshold maps straight to coverage (thr .3 -> 70% of the paper takes pigment)
  const sorted = Float32Array.from(T).sort(), N = W * H, q = new Float32Array(257);
  for (let j = 0; j <= 256; j++) q[j] = sorted[Math.min(N - 1, Math.floor(j / 256 * N))];
  const eqv = (v) => { let lo = 0, hi = 256; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (q[m] <= v) lo = m; else hi = m; } return (lo + (v - q[lo]) / Math.max(1e-6, q[hi] - q[lo])) / 256; };
  const pc = mkCanvas(), pg = pc.getContext('2d'), pd = pg.createImageData(W, H);
  const tc = mkCanvas(), tg = tc.getContext('2d'), td = tg.createImageData(W, H);
  const base = [139, 151, 161];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, e = eqv(T[i]);
    td.data[i * 4] = td.data[i * 4 + 1] = td.data[i * 4 + 2] = clamp(e) * 255; td.data[i * 4 + 3] = 255;
    const m = 1 + (samp(o5, x, y) - .5) * .09 + (samp(o4, x, y) - .5) * .05 + (e - .5) * .08;
    pd.data[i * 4] = base[0] * m; pd.data[i * 4 + 1] = base[1] * m; pd.data[i * 4 + 2] = base[2] * m * 1.01; pd.data[i * 4 + 3] = 255;
  }
  pg.putImageData(pd, 0, 0); tg.putImageData(td, 0, 0); TOOTHC = tc;
  // fibres: short curved lighter and darker hairs in the paper
  const R = mulberry(77);
  for (let f = 0; f < 900; f++) {
    const x = R() * W, y = R() * H, a = R() * TAU, l = 6 + R() * 22, bend = (R() - .5) * 8;
    pg.strokeStyle = R() < .6 ? 'rgba(220,226,232,.16)' : 'rgba(60,70,80,.12)'; pg.lineWidth = .7 + R() * .6;
    pg.beginPath(); pg.moveTo(x, y); pg.quadraticCurveTo(x + Math.cos(a) * l / 2 - Math.sin(a) * bend, y + Math.sin(a) * l / 2 + Math.cos(a) * bend, x + Math.cos(a) * l, y + Math.sin(a) * l); pg.stroke();
  }
  PAPER = pc;
  for (let p = 0; p < 6; p++) LAYERS.push(mkCanvas());
  SKC = mkCanvas(); SKG = SKC.getContext('2d');
  glInit();
}

// WebGL tooth cut: out.a = smoothstep(thr - soft, thr + soft, tooth), thr = mix(th0, th1, layer alpha)
let GL = null;
function glInit() {
  GLC = mkCanvas();
  const gl = GLC.getContext('webgl', { premultipliedAlpha: false, preserveDrawingBuffer: true, alpha: true, antialias: false });
  const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 uv; void main(){ uv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }'));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, `precision highp float; varying vec2 uv; uniform sampler2D L, T; uniform vec4 cut; uniform float stain;
    void main(){ vec4 c = texture2D(L, uv); if (c.a < .004) { gl_FragColor = vec4(0.); return; }
      float th = mix(cut.x, cut.y, clamp(c.a, 0., 1.)); float tooth = texture2D(T, uv).r;
      float cov = smoothstep(th - cut.z, th + cut.z, tooth);
      gl_FragColor = vec4(c.rgb, max(cov * cut.w, stain * c.a)); }`));
  gl.linkProgram(pr); gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = (unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  const tT = tex(1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, TOOTHC);
  const tL = tex(0);
  gl.uniform1i(gl.getUniformLocation(pr, 'L'), 0); gl.uniform1i(gl.getUniformLocation(pr, 'T'), 1);
  GL = { gl, tL, cut: gl.getUniformLocation(pr, 'cut'), stain: gl.getUniformLocation(pr, 'stain') };
  gl.viewport(0, 0, W, H);
}
function toothCut(layer, cut) {
  const { gl, tL } = GL;
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tL);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layer);
  gl.uniform4f(GL.cut, cut[0], cut[1], cut[2], cut[3]); gl.uniform1f(GL.stain, cut[4]);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  return GLC;
}

// ---------- stroke recorder ----------
// A Sk collects strokes. Points go through the current transform (translate/scale/rotate) at record time.
class Sk {
  constructor(seed = 1) { this.list = []; this.seed = seed; this.n = 0; this.tf = [1, 0, 0, 1, 0, 0]; this.stack = []; this.t0 = -1e9; this.dur = .001; this.grp = null; this.pl = 0; }
  // depth planes: each plane is finished (all passes) before the next is laid over it, so a figure in
  // front really covers the conte lines and highlights of what is behind it
  plane(n) { this.pl = n; return this; }
  save() { this.stack.push(this.tf.slice()); return this; }
  restore() { this.tf = this.stack.pop(); return this; }
  translate(x, y) { const m = this.tf; m[4] += m[0] * x + m[2] * y; m[5] += m[1] * x + m[3] * y; return this; }
  scale(sx, sy = sx) { const m = this.tf; m[0] *= sx; m[1] *= sx; m[2] *= sy; m[3] *= sy; return this; }
  rotate(a) { const m = this.tf, c = Math.cos(a), s = Math.sin(a); const [a0, b0, c0, d0] = m; m[0] = a0 * c + c0 * s; m[1] = b0 * c + d0 * s; m[2] = -a0 * s + c0 * c; m[3] = -b0 * s + d0 * c; return this; }
  P(x, y) { const m = this.tf; return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
  get S() { return Math.hypot(this.tf[0], this.tf[1]); }
  // reveal timing: strokes recorded inside at(t, dur) get spread across [t, t + dur] in record order
  at(t, dur = .3) { this.end(); this.grp = { t, dur, items: [] }; return this; }
  end() { if (this.grp) { const g = this.grp, n = g.items.length; g.items.forEach((s, i) => { s.t0 = g.t + g.dur * (n > 1 ? i / n : 0); s.dur = Math.max(.05, Math.min(.35, g.dur * 2.5 / Math.max(1, n))); }); this.grp = null; } return this; }
  push(s) { s.pl = this.pl; s.seed = this.seed * 1000 + (this.n++); s.t0 = -1e9; s.dur = .001; if (this.grp) this.grp.items.push(s); this.list.push(s); return s; }

  // broad side-of-the-stick stroke
  stick(pts, w, col, a = .9, pass = PASS.LAYIN) { return this.push({ k: 'stick', pts: dense(pts.map(p => this.P(p[0], p[1]))), w: w * this.S, col, a, pass }); }
  // conte / charcoal line with pressure that swells and fades
  line(pts, w, col, a = .9, pass = PASS.LINE) { return this.push({ k: 'line', pts: dense(pts.map(p => this.P(p[0], p[1]))), w: w * this.S, col, a, pass }); }
  // rubbed shadow: a filled shape that is blurred into the paper
  smudge(pts, col, a = .5) { return this.push({ k: 'fill', pts: pts.map(p => this.P(p[0], p[1])), col, a, pass: PASS.SMUDGE }); }
  // a rubbed ground under a passage: a filled shape in a cut pass, so it is broken by the tooth like the strokes over it
  ground(pts, col, a = .6, pass = PASS.LAYIN) { return this.push({ k: 'fill', pts: pts.map(p => this.P(p[0], p[1])), col, a, pass }); }
  blob(x, y, rx, ry, col, a = .5) { const pts = []; for (let i = 0; i < 18; i++) { const u = i / 18 * TAU; pts.push([x + Math.cos(u) * rx, y + Math.sin(u) * ry]); } return this.smudge(pts, col, a); }
  // loose laid-in colour: parallel sticks across a polygon at an angle, overshooting the edge a little
  hatch(poly, ang, sp, w, col, a = .85, pass = PASS.LAYIN, over = .25) {
    const R = mulberry(this.seed * 7919 + this.n * 31 + 5);
    const c = Math.cos(ang), s = Math.sin(ang);
    // rotate polygon so strokes run along +x
    const rp = poly.map(([x, y]) => [x * c + y * s, -x * s + y * c]);
    let y0 = Infinity, y1 = -Infinity; for (const p of rp) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = y0 + sp * (.3 + R() * .4); y < y1; y += sp * (.75 + R() * .5)) {
      const xs = [];
      for (let i = 0; i < rp.length; i++) { const a0 = rp[i], b0 = rp[(i + 1) % rp.length]; if ((a0[1] <= y) !== (b0[1] <= y)) xs.push(a0[0] + (y - a0[1]) / (b0[1] - a0[1]) * (b0[0] - a0[0])); }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const L = xs[i + 1] - xs[i]; if (L < 2) continue;
        const e0 = xs[i] - (R() - .3) * over * Math.min(L, 60), e1 = xs[i + 1] + (R() - .3) * over * Math.min(L, 60);
        const yy = y + (R() - .5) * sp * .4, bow = (R() - .5) * sp * .5;
        const P0 = [e0 * c - yy * s, e0 * s + yy * c], P2 = [e1 * c - (yy + bow * .4) * s, e1 * s + (yy + bow * .4) * c];
        const m = (e0 + e1) / 2, P1 = [m * c - (yy + bow) * s, m * s + (yy + bow) * c];
        this.stick([P0, P1, P2], w * (.8 + R() * .4), col, a * (.75 + R() * .25), pass);
      }
    }
    return this;
  }
  // an ellipse or oval outline in one or two sweeps (a gesture line)
  // a pastel numeral or mark set in a font (drawn into the pass layer, so it is cut by the tooth too)
  text(str, x, y, size, col, a = .9, pass = PASS.LAYIN, font = 'bold {s}px Georgia, serif') { const [px, py] = this.P(x, y); return this.push({ k: 'text', str, x: px, y: py, size: size * this.S, col, a, pass, font }); }
  oval(x, y, rx, ry, w, col, a = .8, pass = PASS.LINE, from = 0, to = 1, rot = 0) {
    const pts = [], n = 22; for (let i = 0; i <= n; i++) { const u = (from + (to - from) * i / n) * TAU; const px = Math.cos(u) * rx, py = Math.sin(u) * ry; pts.push([x + px * Math.cos(rot) - py * Math.sin(rot), y + px * Math.sin(rot) + py * Math.cos(rot)]); }
    return this.line(pts, w, col, a, pass);
  }
}

// Catmull-Rom resample to roughly every 5 px; segments that meet at a sharp corner stay straight
// (a spline through a rectangle's corners would bulge out of it)
function dense(pts) {
  if (pts.length < 2) return pts;
  const sharp = (a, b, c) => { const ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1]; const l = Math.hypot(ux, uy) * Math.hypot(vx, vy); return l > 0 && (ux * vx + uy * vy) / l < .64; };
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const straight = (i > 0 && sharp(p0, p1, p2)) || (i + 2 < pts.length && sharp(p1, p2, p3));
    const n = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 5));
    for (let j = 0; j < n; j++) {
      const u = j / n, u2 = u * u, u3 = u2 * u;
      if (straight) { out.push([lerp(p1[0], p2[0], u), lerp(p1[1], p2[1], u)]); continue; }
      out.push([0, 1].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// ---------- drawing ----------
const SHADES = new Map();
function shade(col, k) { // lighten (k > 0) or darken a hex colour a little; cached
  k = Math.round(k * 50) / 50; // quantise first: the cache must not depend on which frame asked first
  const key = col + k; let v = SHADES.get(key); if (v) return v;
  const c = hex(col), d = k > 0 ? mix(c, [255, 255, 255], k) : mix(c, [0, 0, 0], -k); v = rgb(d); SHADES.set(key, v); return v;
}
function drawStick(g, s, frac) {
  const P = s.pts, N = P.length; if (N < 2) return;
  const upto = Math.max(2, Math.ceil(N * frac));
  const n = Math.max(2, Math.min(7, Math.round(s.w / 5)));
  const nrm = [];
  for (let i = 0; i < N; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(N - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; nrm.push([-dy / l, dx / l]); }
  g.lineJoin = 'round'; g.strokeStyle = shade(s.col, (rnd(s.seed, 5) - .5) * .3); g.lineWidth = s.w / n * 1.6;
  const chunk = Math.max(4, Math.ceil(N / 4));
  for (let j = 0; j < n; j++) {
    const edge = Math.abs(j / (n - 1) - .5) * 2; // 0 in the middle of the stick, 1 at its edges
    const off = (j / (n - 1) - .5) * s.w * .85, r1 = rnd(s.seed, j, 1), r2 = rnd(s.seed, j, 2), r3 = rnd(s.seed, j, 3);
    const i0 = Math.floor(r1 * N * .14 * (edge + .2)), i1 = Math.min(upto, N - Math.floor(r2 * N * .16 * (edge + .2)));
    if (i1 - i0 < 2) continue;
    const pj = s.a * (.62 + .38 * r3) * (1 - edge * .38); // this streak's pressure
    for (let c0 = i0; c0 < i1 - 1; c0 += chunk) {
      const c1 = Math.min(i1 - 1, c0 + chunk), mid = (c0 + c1) / 2 / (N - 1);
      // pressure eases off at both ends of the stroke and wanders along it
      const pe = Math.min(1, mid * 5 + .35, (1 - mid) * 4 + .3) * (.82 + .18 * n1(s.seed + j, mid * 4));
      g.globalAlpha = clamp(pj * pe); g.lineCap = c0 === i0 || c1 === i1 - 1 ? 'round' : 'butt';
      g.beginPath();
      for (let i = c0; i <= c1; i++) {
        const taper = Math.min(1, i / (N * .15 + 1), (N - 1 - i) / (N * .15 + 1)) * .35 + .65;
        const wob = n1(s.seed + j * 13, i * .09) * s.w * .06;
        const x = P[i][0] + nrm[i][0] * (off * taper + wob), y = P[i][1] + nrm[i][1] * (off * taper + wob);
        i === c0 ? g.moveTo(x, y) : g.lineTo(x, y);
      }
      g.stroke();
    }
  }
}
function drawLine(g, s, frac) {
  const P = s.pts, N = P.length; if (N < 2) return;
  const upto = Math.max(2, Math.ceil(N * frac));
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = s.col;
  const step = 3;
  for (let i = 0; i < upto - 1; i += step) {
    const j = Math.min(upto - 1, i + step), u = i / (N - 1);
    const press = (.55 + .45 * n1(s.seed, i * .05)) * Math.min(1, u * 6 + .25, (1 - u) * 5 + .15);
    g.globalAlpha = s.a * clamp(.4 + press * .7); g.lineWidth = s.w * (.45 + press * .75);
    g.beginPath(); g.moveTo(P[i][0], P[i][1]); for (let k = i + 1; k <= j; k++) g.lineTo(P[k][0], P[k][1]); g.stroke();
  }
}
function drawText(g, s, frac) {
  g.globalAlpha = s.a * clamp(frac * 2); g.fillStyle = s.col; g.font = s.font.replace('{s}', Math.round(s.size)); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(s.str, s.x, s.y); g.textAlign = 'left'; g.textBaseline = 'alphabetic';
}
function drawFill(g, s, frac) {
  g.globalAlpha = s.a * clamp(frac * 1.5); g.fillStyle = s.col;
  g.beginPath(); s.pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
}

// Render a list of stroke lists at song time t onto the sketch canvas (paper + pigment). Returns the canvas.
function renderSketch(lists, t, opts = {}) {
  bakePaper();
  const sg = SKG; sg.setTransform(1, 0, 0, 1, 0, 0); sg.globalAlpha = 1; sg.globalCompositeOperation = 'source-over'; sg.filter = 'none';
  sg.drawImage(PAPER, 0, 0);
  const planes = new Map();
  for (const list of lists) for (const s of list) { if (t < s.t0) continue; if (!planes.has(s.pl)) planes.set(s.pl, []); planes.get(s.pl).push(s); }
  for (const pl of [...planes.keys()].sort((a, b) => a - b)) {
    const used = [0, 0, 0, 0, 0, 0];
    for (const s of planes.get(pl)) {
      const lg = LAYERS[s.pass].getContext('2d');
      if (!used[s.pass]) { lg.setTransform(1, 0, 0, 1, 0, 0); lg.globalCompositeOperation = 'source-over'; lg.globalAlpha = 1; lg.clearRect(0, 0, W, H); used[s.pass] = 1; }
      const frac = clamp((t - s.t0) / s.dur);
      if (s.k === 'stick') drawStick(lg, s, frac); else if (s.k === 'line') drawLine(lg, s, frac); else if (s.k === 'text') drawText(lg, s, frac); else drawFill(lg, s, frac);
    }
    for (let p = 0; p < 6; p++) {
      if (!used[p]) continue;
      if (p === PASS.SMUDGE) { sg.filter = 'blur(9px)'; sg.globalAlpha = 1; sg.drawImage(LAYERS[p], 0, 0); sg.filter = 'none'; continue; }
      if (opts.vig) { // the sketch trails off toward the edges of the sheet: pressure fades, so the specks thin out
        const lg = LAYERS[p].getContext('2d'), v = opts.vig;
        const rg = lg.createRadialGradient(v[0], v[1], v[2], v[0], v[1], v[3]); rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(1, `rgba(0,0,0,${v[4] ?? .2})`);
        lg.save(); lg.globalAlpha = 1; lg.globalCompositeOperation = 'destination-in'; lg.setTransform(1, 0, 0, v[5] ?? 1, 0, v[1] * (1 - (v[5] ?? 1))); lg.fillStyle = rg; lg.fillRect(0, -H, W, 3 * H); lg.restore();
      }
      sg.globalAlpha = 1; sg.drawImage(toothCut(LAYERS[p], PASS_CUT[p]), 0, 0);
    }
  }
  return SKC;
}
