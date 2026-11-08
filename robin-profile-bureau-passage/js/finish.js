// The WebGL finishing pass. The 2D frame comes in as `src`; inside the woodcut rectangle it is pulled as a
// relief print (after bobwiseman-airplane-woodcut/js/look.js: black, cut-away white and one red plate,
// thresholded against noise that is reseeded on threes, paper tooth, pressure sag, wood grain, red off register,
// paper margin and the block's own edge). Outside the rectangle the frame passes through untouched, so one
// panel can be a woodcut while the rest of the frame stays blueprint.
'use strict';
const FIN = {
  init(canvas) {
    canvas.width = W; canvas.height = H;
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
    const sh = (type, code) => { const o = gl.createShader(type); gl.shaderSource(o, code); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p * .5 + .5; uv.y = 1. - uv.y; gl_Position = vec4(p, 0, 1); }`));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D src; uniform vec4 wood; uniform float tb3, flash, wmix;
uvec2 pcg2(uvec2 v){ v = v * 1664525u + 1013904223u; v.x += v.y * 1664525u; v.y += v.x * 1664525u; v ^= v >> 16u; v.x += v.y * 1664525u; v.y += v.x * 1664525u; v ^= v >> 16u; return v; }
float h21(vec2 p){ return float(pcg2(uvec2(ivec2(floor(p)) + 65536)).x) / 4294967295.; }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
vec2 fbm2(vec2 p){ return vec2(fbm(p), fbm(p + 31.7)) * 2. - 1.; }
void main(){
  vec2 D = vec2(1920., 1080.);
  vec2 P = uv * D;
  vec3 base = texture(src, uv).rgb;
  bool inside = P.x > wood.x && P.x < wood.z && P.y > wood.y && P.y < wood.w;
  if (!inside) { o = vec4(base, 1.); return; }
  vec2 d = fbm2(P * .011 + tb3 * 7.3) * 1.1 + fbm2(P * .05 + tb3 * 3.1) * .55;
  vec2 q = uv + d / D;
  vec3 c = texture(src, q).rgb;
  vec3 cr = texture(src, q + vec2(3., -2.) / D).rgb;
  float red = clamp(cr.r - cr.g, 0., 1.);
  float redHere = clamp(c.r - c.g, 0., 1.);
  float k = clamp(1. - max(c.r, max(c.g, c.b)), 0., 1.);
  float e = (vn(P * .32 + tb3 * 13.) - .5) * .34 + (vn(P * .07 + tb3 * 5.) - .5) * .26;
  float ink = smoothstep(.45, .55, k + e);
  float redInk = smoothstep(.40, .60, red + e * .8) * (1. - ink);
  float tooth = vn(P * .45 + tb3 * 31.) * .55 + vn(P * .16 + tb3 * 11.) * .45;
  float press = .86 + .14 * fbm(P * .0035 + vec2(tb3 * .9, 2.));
  float grain = vn(P * vec2(.006, .19) + vec2(fbm(P * .01) * 3., 0.));
  float cover = clamp(press - smoothstep(.64, .86, tooth) * .8 - smoothstep(.72, .92, grain) * .3, 0., 1.);
  float fib = vn(P * .3) * .5 + vn(P * .06 + 3.) * .5;
  vec3 paper = vec3(.945, .915, .845) * (.95 + .06 * fib) - .035 * smoothstep(.6, .9, vn(P * vec2(.5, .03) + 9.));
  vec2 m = min(P - wood.xy, wood.zw - P);
  float dm = min(m.x, m.y) + (vn(P * .045) - .5) * 7.;
  float out_ = 1. - smoothstep(13., 15., dm);
  float edge = smoothstep(13., 15., dm) * (1. - smoothstep(21., 23., dm));
  ink = max(ink * (1. - out_), edge * smoothstep(.2, .5, tooth + .2));
  redInk *= 1. - out_;
  vec3 col = paper;
  col *= mix(vec3(1.), vec3(.86, .2, .15), redInk * cover * .97);
  col = mix(col, vec3(.075, .068, .072), ink * cover);
  col = mix(col, paper, flash);
  o = vec4(mix(base, col, wmix), 1.);
}`));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE);
    const U = (n) => gl.getUniformLocation(prog, n);
    return {
      // wood = [x0, y0, x1, y1] in frame pixels, or null for none
      present(srcCanvas, t, wood, flash = 0, wmix = 1) {
        gl.viewport(0, 0, W, H);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcCanvas);
        gl.uniform1i(U('src'), 0);
        const r = wood || [-9, -9, -8, -8];
        gl.uniform4f(U('wood'), r[0], r[1], r[2], r[3]);
        gl.uniform1f(U('tb3'), Math.floor(t * 8 + 1e-6) / 8); gl.uniform1f(U('flash'), flash); gl.uniform1f(U('wmix'), wmix);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
    };
  },
};
