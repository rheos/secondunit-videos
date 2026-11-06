// The CRT: a two-pass WebGL2 pipeline that turns the 960x720 broadcast signal into a lit 1970s picture tube.
// Pass 1 (960x240): one texel per scanline. NTSC-style decode: luma kept fairly sharp, chroma (I/Q) smeared
//   wide and delayed to the right (colour bleed), a little ringing, per-line jitter and snow.
// Pass 2 (tube canvas): barrel curvature, overscan, 240 gaussian scanlines whose width grows with brightness,
//   phosphor bloom and halation from the pass-1 mipmaps, a faint slot mask, vignette and the dark glass.
// Pure: output depends only on the uniforms and the signal canvas passed in.
const CRT_W = 1400, CRT_H = 1050, CRT_LINES = 240, SIG_W = 960, SIG_H = 720;
const CRT = (() => {
  const cv = document.createElement('canvas'); cv.width = CRT_W; cv.height = CRT_H;
  const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false });
  if (!gl) throw new Error('webgl2 unavailable');
  const VS = `#version 300 es
  in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const COMMON = `#version 300 es
  precision highp float;
  vec3 toYIQ(vec3 c){ return vec3(dot(c, vec3(.299,.587,.114)), dot(c, vec3(.596,-.274,-.322)), dot(c, vec3(.211,-.523,.312))); }
  vec3 toRGB(vec3 y){ return vec3(y.x + .956*y.y + .621*y.z, y.x - .272*y.y - .647*y.z, y.x - 1.106*y.y + 1.703*y.z); }
  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }`;
  const FS1 = COMMON + `
  uniform sampler2D uSig; uniform float uFrame, uSnow, uJit, uChroma;
  out vec4 o;
  void main(){
    float L = floor(gl_FragCoord.y), x = gl_FragCoord.x;
    float v = (L + .5) / ${CRT_LINES}.;
    float jit = (hash(vec2(L, uFrame)) - .5) * uJit;
    float Y = 0., wy = 0., Yw = 0., ww = 0.; vec2 iq = vec2(0.); float wc = 0.;
    for (int k = -8; k <= 8; k++) {
      float dx = float(k) * 1.25;
      vec3 c = texture(uSig, vec2((x + dx + jit) / ${SIG_W}., v)).rgb;
      vec3 q = toYIQ(c);
      float gy = exp(-dx * dx / (2. * 1.0 * 1.0)); Y += q.x * gy; wy += gy;
      float gw = exp(-dx * dx / (2. * 3.2 * 3.2)); Yw += q.x * gw; ww += gw;
      float dc = dx - 2.2; float gc = exp(-dc * dc / (2. * 5.0 * 5.0)); iq += q.yz * gc; wc += gc;
    }
    Y /= wy; Yw /= ww; iq /= wc;
    Y = Y + .22 * (Y - Yw);                 // a little peaking / ringing
    iq *= uChroma;
    vec3 c = toRGB(vec3(Y, iq));
    float n = hash(vec2(x * .73 + L * 11.1, uFrame * 1.37)) - .5;
    c += n * uSnow;
    o = vec4(clamp(c, 0., 1.), 1.);
  }`;
  const FS2 = COMMON + `
  uniform sampler2D uLin; uniform vec2 uRes, uRaster; uniform float uBright, uDot, uFrame, uOver;
  out vec4 o;
  vec3 line(float l, float sx){ return textureLod(uLin, vec2(sx, (l + .5) / ${CRT_LINES}.), 0.).rgb; }
  void main(){
    vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1. - gl_FragCoord.y / uRes.y);
    vec2 c = uv * 2. - 1.;
    vec2 p = c * (1. + vec2(.055 * c.y * c.y, .075 * c.x * c.x));   // barrel: the raster bows on the curved face
    vec2 r = p / uRaster;
    vec2 s = .5 + .5 * r * uOver;
    vec3 col = vec3(0.);
    if (s.x > 0. && s.x < 1. && s.y > 0. && s.y < 1.) {
      float lf = s.y * ${CRT_LINES}. - .5;
      float l0 = floor(lf), fr = lf - l0;
      for (int k = -1; k <= 2; k++) {
        float l = clamp(l0 + float(k), 0., ${CRT_LINES - 1}.);
        vec3 cc = line(l, s.x);
        float lum = dot(cc, vec3(.3, .59, .11));
        float sg = mix(.19, .31, lum);
        float d = float(k) - fr;
        col += cc * exp(-d * d / (2. * sg * sg)) / (2.5066 * sg);
      }
      vec3 b1 = textureLod(uLin, s, 2.2).rgb, b2 = textureLod(uLin, s, 4.0).rgb;
      col += b1 * b1 * .13 + b2 * .035;                               // phosphor bloom + halation
      float edge = smoothstep(0., .012, s.x) * smoothstep(1., .988, s.x) * smoothstep(0., .01, s.y) * smoothstep(1., .99, s.y);
      col *= edge;
    }
    // power-on dot
    float rr = dot(c, c);
    col += vec3(.95, .97, 1.) * uDot * (exp(-rr / .0016) * 1.4 + exp(-rr / .02) * .25);
    col *= uBright;
    // faint slot mask
    float mx = mod(gl_FragCoord.x, 3.);
    vec3 mask = mx < 1. ? vec3(1., .9, .9) : (mx < 2. ? vec3(.9, 1., .9) : vec3(.9, .9, 1.));
    col *= mix(vec3(1.), mask * 1.07, .5);
    // phosphor tone: slightly cool whites, lifted blacks of the glass
    col = pow(clamp(col, 0., 1.6), vec3(1.12, 1.1, 1.08));
    float vig = 1. - .28 * pow(dot(c * vec2(.92, 1.), c * vec2(.92, 1.)) * .5, 1.6);
    col *= vig;
    col += vec3(.040, .046, .045) * (1. - .4 * rr);                  // the grey-green glass
    o = vec4(min(col, 1.), 1.);
  }`;
  function prog(fs) {
    const pr = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]]) {
      const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      gl.attachShader(pr, sh);
    }
    gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    return pr;
  }
  const P1 = prog(FS1), P2 = prog(FS2);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const texSig = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texSig);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const texLin = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texLin);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, SIG_W, CRT_LINES, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);
  const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texLin, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  const U = (pr, n) => gl.getUniformLocation(pr, n);
  // o: {frame, snow, jit, chroma, raster:[sx,sy], bright, dot, over}
  function render(sig, o) {
    gl.bindTexture(gl.TEXTURE_2D, texSig);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sig);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, SIG_W, CRT_LINES);
    gl.useProgram(P1);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texSig); gl.uniform1i(U(P1, 'uSig'), 0);
    gl.uniform1f(U(P1, 'uFrame'), o.frame % 997); gl.uniform1f(U(P1, 'uSnow'), o.snow); gl.uniform1f(U(P1, 'uJit'), o.jit); gl.uniform1f(U(P1, 'uChroma'), o.chroma);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, texLin); gl.generateMipmap(gl.TEXTURE_2D);
    gl.viewport(0, 0, CRT_W, CRT_H); gl.useProgram(P2);
    gl.uniform1i(U(P2, 'uLin'), 0);
    gl.uniform2f(U(P2, 'uRes'), CRT_W, CRT_H); gl.uniform2f(U(P2, 'uRaster'), o.raster[0], o.raster[1]);
    gl.uniform1f(U(P2, 'uBright'), o.bright); gl.uniform1f(U(P2, 'uDot'), o.dot); gl.uniform1f(U(P2, 'uFrame'), o.frame % 997); gl.uniform1f(U(P2, 'uOver'), o.over);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.flush();
    return cv;
  }
  return { render, canvas: cv };
})();
