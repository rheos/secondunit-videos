// Real Thing: style tests. The gorilla story stays exactly as drawn (js/gorilla/); only the look changes.
// Bob on draft 3 (2026-10-20): "Could you put the same idea through another type of style for me to see if it feels different?"
// ?style=pinball  1970s pinball cel: airbrushed volume inside every outlined shape, fine outlines in a darker shade of the fill
// ?style=riso     three-drum risograph: the frame split into pink / teal / yellow plates, each off register, screened, on twos
// ?style=woodcut  relief print: black ink, carved lines that follow the light, the banana as the one colour plate, on twos
// Loaded after the gorilla scripts. drawFrame(g, t) draws the 2D frame; a style may patch kit primitives and/or
// run one WebGL finishing pass over it (POST below).
'use strict';
const STYLE = new URLSearchParams(location.search).get('style') || 'pinball';
const hexRGB = (c) => { if (typeof c !== 'string' || c[0] !== '#') return null; const h = c.length === 4 ? c.slice(1).split('').map((x) => x + x).join('') : c.slice(1, 7); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const tone = (c, to, k) => { const a = hexRGB(c); if (!a) return c; const b = hexRGB(to); return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`; };
const toneA = (c, to, k, al) => { const a = hexRGB(c); if (!a) return c; const b = hexRGB(to); return `rgba(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')},${al})`; };

// ---------------------------------------------------------------- pinball: airbrushed cel shapes
if (STYLE === 'pinball') {
  INK = '#3a2723'; LW = 3.2;
  const BIG = 1e4;
  // every outlined shape: flat fill, then an inner airbrush shadow from the lower right and a soft light from the
  // upper left (shadows of a frame around the shape, clipped to it), a gloss spot, and a fine outline in a darker
  // shade of its own colour. Blur sizes follow the character's scale, so a whole gorilla and his eye get the same light.
  ol = function (g, path, fill, lw = LW) {
    g.beginPath(); path(); g.fillStyle = fill; g.fill();
    const rgb = hexRGB(fill), s = sc(g);
    if (rgb) {
      const lum = (rgb[0] * .3 + rgb[1] * .59 + rgb[2] * .11) / 255;
      const R = cl(s * .075, 5, 46);
      g.save(); g.beginPath(); path(); g.clip();
      const frame = () => { g.beginPath(); g.rect(-BIG, -BIG, 2 * BIG, 2 * BIG); path(); };
      g.fillStyle = '#000';
      g.shadowColor = toneA(fill, '#120a0a', .55, lum > .8 ? .45 : .85); g.shadowBlur = R * 1.6; g.shadowOffsetX = -R * .75; g.shadowOffsetY = -R * .9;
      frame(); g.fill('evenodd');
      g.shadowColor = toneA(fill, '#fff6e6', .5, .8); g.shadowBlur = R * 1.4; g.shadowOffsetX = R * .6; g.shadowOffsetY = R * .7;
      frame(); g.fill('evenodd');
      g.restore();
    }
    g.beginPath(); path();
    g.lineWidth = lw * .62 / sc(g); g.strokeStyle = rgb ? tone(fill, '#1a1210', .62) : INK; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
  };
  // tube limbs: the ink stroke, the colour stroke, then a darker core stroke offset to the lower right for roundness
  limb = function (g, p0, p1, bend, w, fill) {
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
    const cx = mx - dy / L * bend, cy = my + dx / L * bend;
    const q = (o, col, lw) => { g.beginPath(); g.moveTo(p0[0] + o, p0[1] + o); g.quadraticCurveTo(cx + o, cy + o, p1[0] + o, p1[1] + o); g.strokeStyle = col; g.lineWidth = lw; g.stroke(); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    q(0, hexRGB(fill) ? tone(fill, '#1a1210', .62) : INK, w + LW * 2); q(0, fill, w);
    if (hexRGB(fill)) { q(w * .16, tone(fill, '#1a1210', .3), w * .55); q(-w * .2, tone(fill, '#fff6e6', .3), w * .22); }
  };
}

// the film's streaky paper fibres fight every one of these finishes; each look brings its own paper in the shader
buildTextures = function () { GRAIN = document.createElement('canvas'); GRAIN.width = W; GRAIN.height = H; };

// ---------------------------------------------------------------- the WebGL finishing pass
const POST = {};
POST.NOISE = `
uvec2 pcg2(uvec2 v){ v = v * 1664525u + 1013904223u; v.x += v.y * 1664525u; v.y += v.x * 1664525u; v ^= v >> 16u; v.x += v.y * 1664525u; v.y += v.x * 1664525u; v ^= v >> 16u; return v; }
float h21(vec2 p){ return float(pcg2(uvec2(ivec2(floor(p)) + 65536)).x) / 4294967295.; }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
vec2 fbm2(vec2 p){ return vec2(fbm(p), fbm(p + 31.7)) * 2. - 1.; }
float lum(vec3 c){ return dot(c, vec3(.3, .59, .11)); }`;

POST.frag = {
  // coloured-pencil grain, a soft bloom on the light things, a warm cel-paint finish
  pinball: `
void main(){
  vec2 P = uv * res;
  vec3 c = texture(src, uv).rgb;
  vec3 bl = textureLod(src, uv, 5.).rgb * .5 + textureLod(src, uv, 6.5).rgb * .5;
  c += max(bl - .45, 0.) * .55;                                                          // bloom
  float gl = dot(c, vec3(.3, .59, .11)); c = mix(vec3(gl), c, 1.12);                     // a touch more colour
  float pencil = vn(vec2(P.x * .9 + P.y * .35, P.y * .06 - P.x * .02) + tq * 3.) * .6 + vn(P * .7 + tq * 7.) * .4;
  c *= .955 + .09 * pencil;                                                              // coloured-pencil tooth
  c = mix(c, c * vec3(1.03, 1., .93), .6);                                                // warm cel paint
  o = vec4(clamp(c, 0., 1.), 1.);
}`,
  // the frame as three separations: pink = absence of green, teal = absence of red, yellow = absence of blue
  riso: `
uniform vec2 offA, offB, offC; uniform vec3 inkA, inkB, inkC; uniform float cell, jitk;
vec3 grade(vec3 c){ c = pow(clamp(c, 0., 1.), vec3(.6)); float l = lum(c); c = mix(vec3(l), c, 1.5); return clamp(c * 1.04, 0., 1.); }
// densities for the three plates at q: grey removed (so neutral areas are paper, not three inks), then posterized
// to solid / half-tint / none, the way a riso artist cuts separations by hand
vec3 sep(vec2 q){
  vec3 d = 1. - grade(textureLod(src, q, .5).rgb);
  float m = min(d.r, min(d.g, d.b)); d -= m * .75; d += m * .25 * vec3(1., 1., 0.);   // the grey goes to pink + teal (navy), not yellow
  d = clamp(d * 1.25, 0., 1.);
  return smoothstep(.26, .34, d) * .45 + smoothstep(.42, .5, d) * .55;
}
float scr(vec2 px, float ang){ float c = cos(ang), s = sin(ang); vec2 p = mat2(c, -s, s, c) * px / cell;
  return .5 + .25 * (cos(6.2831853 * p.x) + cos(6.2831853 * p.y)); }
float plate(float d, vec2 px, float ang, float sd){
  float th = scr(px, ang);
  float g = (vn(px * .8 + sd * 53.1 + jitk * 7.) - .5) * .3 * clamp(d * (1. - d) * 4., 0., 1.);
  float ink = smoothstep(-.03, .03, d * 1.1 - .05 - th + g);
  vec2 q = px / res.y;
  float st = smoothstep(.62, .9, fbm(q * vec2(9., 1.6) + sd * 13.7)) * .5;
  float blot = smoothstep(.6, .82, fbm(q * 5. + sd * 3.1 + jitk * .37));
  ink *= 1. - st * .45 - blot * .25;
  ink *= 1. - step(.982, h21(px * .5 + sd * 911. + jitk * 17.)) * .85;
  return clamp(ink, 0., 1.);
}
void main(){
  vec2 px = uv * res;
  float a = sep(uv + offA).g, b = sep(uv + offB).r, c = sep(uv + offC).b;
  a = plate(a, px, 1.309, 1.); b = plate(b, px, .262, 2.); c = plate(c, px, .785, 3.);
  vec2 q = px / res.y;
  vec3 paper = vec3(.968, .948, .9) * (.97 + .045 * fbm(q * vec2(60., 220.)));
  paper *= .985 + .02 * vn(px * .9 + 5.);
  float fleck = step(.9993, h21(px * .33 + 77.)) * .6;
  vec3 col = paper * mix(vec3(1), inkA, max(a, fleck)) * mix(vec3(1), inkB, b) * mix(vec3(1), inkC, c);
  o = vec4(col, 1.);
}`,
  // relief print. Light is carved out of the black block as parallel gouge lines that widen into the light;
  // the lines run along a slowly turning grain so each area gets its own direction. Dark cartoon outlines stay ink.
  // The banana (saturated yellow) prints on its own yellow plate under the black, slightly off register.
  woodcut: `
uniform float tb3;
float L(vec2 q){ vec3 c = textureLod(src, q, 1.).rgb; return lum(c); }
void main(){
  vec2 D = vec2(1920., 1080.), P = uv * D;
  vec2 wob = fbm2(P * .011 + tb3 * 7.3) * 1.1 + fbm2(P * .05 + tb3 * 3.1) * .55;
  vec2 q = uv + wob / D;
  vec3 c = texture(src, q).rgb;
  float l = smoothstep(.04, .62, L(q));                                                   // night is dark: stretch the values
  // carving direction: a slowly turning grain, so each area of the block gets its own run of lines
  float ang = .42 + .55 * (fbm(P * .0011) - .5);
  vec2 dir = vec2(cos(ang), sin(ang));
  float ph = dot(P, vec2(-dir.y, dir.x)) / 8. + (vn(P * .006) - .5) * .25;
  float s = abs(fract(ph) - .5) * 2.;                                                    // 0 on the gouge line, 1 between
  float cut = 1. - smoothstep(l * 1.08 - .07, l * 1.08 + .07, s);                         // light = wide white cuts
  cut = max(cut, smoothstep(.8, .9, l));                                                  // the brightest areas cleared out
  cut *= smoothstep(.06, .14, l);                                                          // the darkest areas stay solid
  cut *= smoothstep(.1, .17, lum(texture(src, q).rgb));                                     // the cartoon's ink outlines stay ink
  // chisel flicks: short broken gouges scattered in mid tones
  float fl = step(.86, vn(vec2(dot(P, dir) * .045, dot(P, vec2(-dir.y, dir.x)) * .35) + 11.)) * smoothstep(.15, .4, l) * (1. - smoothstep(.55, .8, l));
  cut = max(cut, fl);
  float ink = 1. - cut;
  float noiseE = (vn(P * .32 + tb3 * 13.) - .5) * .34 + (vn(P * .07 + tb3 * 5.) - .5) * .26;
  ink = smoothstep(.45, .55, ink + noiseE * .6);
  // the one colour plate: the banana
  vec3 cy = texture(src, q + vec2(3., -2.) / D).rgb;
  float yel = smoothstep(.25, .45, min(cy.r, cy.g) - cy.b) * smoothstep(.45, .6, cy.g);
  float yInk = smoothstep(.4, .6, yel + noiseE * .8);
  // a carved white keyline around the banana so it reads against the black
  if (yInk > .5) ink *= .0;
  float tooth = vn(P * .45 + tb3 * 31.) * .55 + vn(P * .16 + tb3 * 11.) * .45;
  float press = .86 + .14 * fbm(P * .0035 + vec2(tb3 * .9, 2.));
  float grain = vn(P * vec2(.006, .19) + vec2(fbm(P * .01) * 3., 0.));
  float cover = clamp(press - smoothstep(.64, .86, tooth) * .8 - smoothstep(.72, .92, grain) * .3, 0., 1.);
  float fib = vn(P * .3) * .5 + vn(P * .06 + 3.) * .5;
  vec3 paper = vec3(.945, .915, .845) * (.95 + .06 * fib) - .035 * smoothstep(.6, .9, vn(P * vec2(.5, .03) + 9.));
  vec2 m = min(P, D - P);
  float dm = min(m.x, m.y) + (vn(P * .045) - .5) * 7.;
  float out_ = 1. - smoothstep(19., 21., dm);
  float edge = smoothstep(19., 21., dm) * (1. - smoothstep(29., 31., dm));
  ink = max(ink * (1. - out_), edge * smoothstep(.2, .5, tooth + .2));
  yInk *= 1. - out_;
  vec3 col = paper;
  col *= mix(vec3(1.), vec3(.98, .78, .12), yInk * cover * .97);
  col = mix(col, vec3(.075, .068, .072), ink * cover);
  o = vec4(col, 1.);
}`,
};

const hash1 = (n) => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
POST.uniforms = {
  pinball: () => ({}),
  riso: (t) => {
    const k = Math.floor(t * 12 + 1e-6), j = 2.6, J = (n) => (hash1(k * 6 + n + 4000) - .5) * 2 * j;
    const base = [3, -2, -3, 1, 1, 3];
    const uvo = (i) => [(base[i] + J(i)) / W, (base[i + 1] + J(i + 1)) / H];
    return { offA: uvo(0), offB: uvo(2), offC: uvo(4), inkA: [1.0, .29, .62], inkB: [0.0, .52, .6], inkC: [1.0, .9, .05], cell: 1080 / 96, jitk: k % 97 };
  },
  woodcut: (t) => ({ tb3: Math.floor(t * 8 + 1e-6) / 8 }),
};
// animation on twos for the prints (a new drawing every 1/12 s), on ones for the cel
POST.step = { pinball: 24, riso: 12, woodcut: 12 };

POST.init = function (out, srcCanvas) {
  out.width = W; out.height = H;
  const gl = out.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
  const sh = (type, code) => { const o = gl.createShader(type); gl.shaderSource(o, code); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p * .5 + .5; uv.y = 1. - uv.y; gl_Position = vec4(p, 0, 1); }`));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D src; uniform float t, tq; uniform vec2 res;
${POST.NOISE}
${POST.frag[STYLE]}`));
  gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.MIRRORED_REPEAT);
  const U = (n) => gl.getUniformLocation(prog, n);
  return (t) => {
    gl.viewport(0, 0, out.width, out.height);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcCanvas); gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(U('src'), 0); gl.uniform1f(U('t'), t); gl.uniform1f(U('tq'), Math.floor(t * 12 + 1e-6) % 61); gl.uniform2f(U('res'), out.width, out.height);
    for (const [k, v] of Object.entries(POST.uniforms[STYLE](t))) { const l = U(k); if (!l) continue; if (Array.isArray(v)) gl[`uniform${v.length}f`](l, ...v); else gl.uniform1f(l, v); }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
};
