// Painterly renderer, adapted from functional-emotions-video (MIT, see LICENSE-functional-emotions).
//
// Per frame, scene code draws three Canvas2D layers:
//   src  (960x540)   flat underpainting. The GPU repaints it with instanced brushstrokes that
//                    sample its colour and follow its edges.
//   ink  (1920x1080) full-res detail laid over the paint unbrushed (the plane's eyes and mouth),
//                    so the brushstrokes never dissolve his face. Vignette and weave still apply.
//   fx   (960x540)   additive light (sun, glints), plus a blurred copy for bloom.
//   mask (960x540)   detail mask: white where strokes must shrink to keep a shape (the plane).
//
// Changes from the original for this plein-air look:
//   - a warm cream ground under the strokes (uGround), and gaps in the broad strokes (uGap) so the
//     ground shows between them, the way a quick oil sketch on primed board does;
//   - impasto: every stroke carries a height profile (ridge + bristle grooves + a loaded start)
//     lit from the upper left (uImpasto, uLight), so strokes read as thick paint;
//   - Fauve colour handling (uFauve): saturation lift, shadows pushed toward ultramarine/violet,
//     lights toward cadmium lemon, wider per-stroke hue scatter;
//   - a directional flow bias (uFlowAng, uFlowBias) so flat areas can take long horizontal strokes.

const W = 1920, H = 1080, SW = 960, SH = 540;

const Paint = (() => {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const src = mk(SW, SH), fx = mk(SW, SH), fxb = mk(SW / 4, SH / 4), ink = mk(W, H), mask = mk(SW, SH);
  const sctx = src.getContext('2d'), fctx = fx.getContext('2d'), bctx = fxb.getContext('2d'), ictx = ink.getContext('2d'), mctx = mask.getContext('2d');

  let gl, progStroke, progQuad, progInk, progFinish, layers = [], texSrc, texFx, texFxb, texInk, texMask, quadVao;

  const VS_STROKE = `#version 300 es
  precision highp float;
  layout(location=0) in vec2 aCorner;
  layout(location=1) in vec2 aBase;
  layout(location=2) in vec4 aRand;
  uniform sampler2D uSrc, uMask; uniform vec2 uRes; uniform float uBoil, uTime;
  uniform float uCell, uLen, uWid, uEdgeLo, uEdgeHi, uJit, uFlowK, uAlpha, uGap, uFauve, uFlowAng, uFlowBias; uniform vec2 uSmear;
  uniform vec3 uShadowTint, uHiTint;
  out vec2 vUV; out vec3 vCol; out float vSeed, vA; out vec2 vDir;
  float h(float n){ return fract(sin(n)*43758.5453); }
  float lum(vec3 c){ return dot(c, vec3(.3,.55,.15)); }
  float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    float a=h(dot(i,vec2(1,57))), b=h(dot(i+vec2(1,0),vec2(1,57))), c=h(dot(i+vec2(0,1),vec2(1,57))), d=h(dot(i+vec2(1,1),vec2(1,57)));
    return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }
  void main(){
    float s = aRand.x*97. + uBoil*13.17;
    vec2 j = vec2(h(s), h(s+1.3)) - .5;
    vec2 pos = aBase + j * uCell * uJit;
    vec2 uv = pos / uRes;
    vec3 col = texture(uSrc, uv).rgb;
    float dm = texture(uMask, uv).r;
    vec2 e = vec2(2.5/${SW}.0, 2.5/${SH}.0);
    float gx = lum(texture(uSrc, uv+vec2(e.x,0)).rgb) - lum(texture(uSrc, uv-vec2(e.x,0)).rgb);
    float gy = lum(texture(uSrc, uv+vec2(0,e.y)).rgb) - lum(texture(uSrc, uv-vec2(0,e.y)).rgb);
    float edge = length(vec2(gx,gy));
    float ang = atan(gy, gx) + 1.5708;
    float flow = (n2(pos*.0022 + vec2(uTime*.03, 0.)) - .5) * 6.2832 * uFlowK + .35;
    flow = mix(flow, uFlowAng + (n2(pos*.004 + 7.) - .5) * .7, uFlowBias);
    ang = mix(flow, ang, smoothstep(.012, .06, edge));
    ang += (h(s+2.1) - .5) * .45;
    float sm = clamp(length(uSmear) / 60., 0., 1.);
    if (sm > 0.) ang = mix(ang, atan(uSmear.y, uSmear.x) + (h(s+2.1) - .5) * .12, sm);
    float vis = uEdgeLo < 0. ? 1. : smoothstep(uEdgeLo, uEdgeHi, edge);
    vis *= step(uGap * (1. - dm), h(s+11.3));
    float len = uLen * (.7 + .6*h(s+3.7)) * (1. + sm * 3.) * mix(1., .34, dm), wid = uWid * (.7 + .5*h(s+4.9)) * mix(1., .5, dm);
    vec2 c = aCorner; vec2 d = vec2(cos(ang), sin(ang));
    vec2 p = pos + d * c.x * len + vec2(-d.y, d.x) * c.y * wid;
    vec2 clip = p / uRes * 2. - 1.; clip.y = -clip.y;
    gl_Position = vec4(clip, 0, 1);
    vUV = c; vSeed = h(s+5.5); vDir = d;
    float v = (h(s+6.1)-.5)*.2;
    float l = lum(col);
    // Fauve handling: lift chroma, cool the shadows, warm the lights, scatter hue per stroke
    col = clamp(mix(vec3(l), col, 1. + uFauve*.3), 0., 1.);
    col = mix(col, uShadowTint, uFauve * .32 * smoothstep(.42, .08, l));
    col = mix(col, uHiTint, uFauve * .22 * smoothstep(.7, .97, l));
    vec3 scatter = vec3(h(s+7.)-.5, h(s+8.)-.5, h(s+9.)-.5) * (.05 + uFauve*.07);
    vCol = clamp(col * (1. + v) + scatter, 0., 1.);
    vA = vis * uAlpha;
  }`;
  const FS_STROKE = `#version 300 es
  precision highp float;
  in vec2 vUV; in vec3 vCol; in float vSeed, vA; in vec2 vDir; out vec4 o;
  uniform float uImpasto; uniform vec2 uLight;
  float h(float n){ return fract(sin(n)*43758.5453); }
  float n1(float x){ float i=floor(x), f=fract(x); return mix(h(i),h(i+1.),f*f*(3.-2.*f)); }
  float ht(float x, float y){ // paint height: body ridge, bristle grooves, heavier load where the stroke starts
    return ((1. - y*y) * .8 + .2 * n1(y*8. + vSeed*50.)) * (1.25 - .45*(x*.5+.5)); }
  void main(){
    float x = vUV.x, y = vUV.y;
    float prof = (1. - pow(abs(x), 4.)) * (.85 + .15*sin(x*3.+vSeed*6.));
    float m = smoothstep(prof, prof - .22, abs(y));
    float br = n1(y*14. + vSeed*50.);
    float br2 = n1(y*37. + vSeed*91.);
    float dry = smoothstep(.0, .35, br - (x*.5+.5)*.55 + .25);
    float a = m * mix(1., dry, .3) * (.88 + .12*br2);
    vec3 c = vCol * (.95 + .08*br) + (br2-.5)*.02;
    // impasto light: gradient of the height field, rotated into screen space
    float e = .04;
    float dhx = (ht(x+e, y) - ht(x-e, y)) / (2.*e) * .35;
    float dhy = (ht(x, y+e) - ht(x, y-e)) / (2.*e);
    vec2 gS = vDir * dhx + vec2(-vDir.y, vDir.x) * dhy;
    float lit = clamp(-dot(gS, uLight) * .8, -1., 1.);
    c *= 1. + uImpasto * .2 * lit;
    c += uImpasto * .1 * pow(max(lit, 0.), 3.);
    o = vec4(clamp(c, 0., 1.), a * vA);
  }`;
  const VS_QUAD = `#version 300 es
  layout(location=0) in vec2 aP; out vec2 vUV;
  void main(){ vUV = aP*.5+.5; gl_Position = vec4(aP,0,1); }`;
  const FS_UNDER = `#version 300 es
  precision highp float; in vec2 vUV; uniform sampler2D uSrc, uMask; uniform float uGround; uniform vec3 uGroundCol; out vec4 o;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
  void main(){
    vec3 c = texture(uSrc, vec2(vUV.x, 1.-vUV.y)).rgb * .97;
    float dm = texture(uMask, vec2(vUV.x, 1.-vUV.y)).r;
    vec2 px = gl_FragCoord.xy;
    vec3 g = uGroundCol * (.96 + .05 * h(floor(px / 3.)));
    o = vec4(mix(c, g, uGround * (1. - dm)), 1);
  }`;
  const FS_INK = `#version 300 es
  precision highp float; in vec2 vUV; uniform sampler2D uInk; uniform float uInkSoft; out vec4 o;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
  float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
  void main(){
    vec2 px = gl_FragCoord.xy;
    // inkSoft: wobble the edges a pixel or two and let a little paint breathe through, so the overlay sits in the paint
    vec2 j = (vec2(n2(px*.09), n2(px*.09 + 17.)) - .5) * 2.2 * uInkSoft / vec2(${W}.0, ${H}.0);
    vec4 c = texture(uInk, vec2(vUV.x, 1.-vUV.y) + j);
    c.a *= 1. - uInkSoft * .12 * n2(px*.35);
    o = c; }`;
  const FS_FINISH = `#version 300 es
  precision highp float; in vec2 vUV; uniform sampler2D uFx, uFxb; uniform float uTime, uGrain, uVig, uBloom, uFrame; out vec4 o;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
  void main(){
    vec2 uv = vec2(vUV.x, 1.-vUV.y);
    vec3 f = texture(uFx, uv).rgb + texture(uFxb, uv).rgb * uBloom;
    vec2 px = gl_FragCoord.xy;
    float weave = (sin(px.x*1.9)*sin(px.y*1.9))*.5+.5;
    float g = h(px + uFrame*1.7) - .5;
    float vig = 1. - uVig * pow(length((vUV-.5)*vec2(1.,.8))*1.25, 2.2);
    o.rgb = f;
    o.a = clamp(vig, 0., 1.) * (1. + g*uGrain) * (.95 + .05*weave);
  }`;

  function sh(type, s) { const x = gl.createShader(type); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x) + s); return x; }
  function prog(vs, fs) { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
  function tex() { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }

  // stroke layers: cell spacing, stroke half-length/half-width, edge gating, gap share (of uGap)
  const LAYERS = [
    { cell: 24, len: 38, wid: 13, edgeLo: -1, edgeHi: 0, jit: 1.2, flowK: 1, alpha: .96, gapK: 1 },
    { cell: 13, len: 17, wid: 6, edgeLo: .02, edgeHi: .07, jit: 1.1, flowK: .8, alpha: .96, gapK: .4 },
    { cell: 7, len: 8, wid: 2.8, edgeLo: .05, edgeHi: .14, jit: 1, flowK: .5, alpha: 1, gapK: 0 },
  ];

  function init(canvas) {
    gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false });
    progStroke = prog(VS_STROKE, FS_STROKE); progQuad = prog(VS_QUAD, FS_UNDER); progInk = prog(VS_QUAD, FS_INK); progFinish = prog(VS_QUAD, FS_FINISH);
    texSrc = tex(); texFx = tex(); texFxb = tex(); texInk = tex(); texMask = tex();
    quadVao = gl.createVertexArray(); gl.bindVertexArray(quadVao);
    const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    for (const L of LAYERS) {
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const base = []; let k = 0;
      for (let y = -L.cell; y < H + L.cell; y += L.cell) for (let x = -L.cell; x < W + L.cell; x += L.cell) {
        base.push(x + (y / L.cell % 2) * L.cell * .5, y); k++;
      }
      const idx = [...Array(k).keys()]; for (let i = k - 1; i > 0; i--) { const j = (i * 2654435761 >>> 0) % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      const B = new Float32Array(k * 2), R = new Float32Array(k * 4);
      idx.forEach((s, d) => { B[d * 2] = base[s * 2]; B[d * 2 + 1] = base[s * 2 + 1]; for (let c = 0; c < 4; c++) R[d * 4 + c] = ((s * 7919 + c * 104729) % 10007) / 10007; });
      const bb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bb); gl.bufferData(gl.ARRAY_BUFFER, B, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0); gl.vertexAttribDivisor(1, 1);
      const rb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, rb); gl.bufferData(gl.ARRAY_BUFFER, R, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0); gl.vertexAttribDivisor(2, 1);
      layers.push({ ...L, vao, n: k });
    }
    gl.bindVertexArray(null);
  }

  function upload(t, c) { gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); }
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

  // o: { boil, grain, vig, bloom, strokeK, flowK, smear, layers mask,
  //      ground (0..1), groundCol, gap (0..1), fauve, impasto, light [x,y], flowAng, flowBias, shadowTint, hiTint }
  function present(t, o = {}) {
    const boilRate = o.boil ?? 6;
    bctx.globalCompositeOperation = 'copy'; bctx.filter = 'blur(5px)'; bctx.drawImage(fx, 0, 0, fxb.width, fxb.height); bctx.filter = 'none';
    upload(texSrc, src); upload(texFx, fx); upload(texFxb, fxb); upload(texInk, ink); upload(texMask, mask);
    gl.viewport(0, 0, W, H); gl.disable(gl.DEPTH_TEST);
    // underpainting, mostly covered by the cream ground
    gl.disable(gl.BLEND); gl.useProgram(progQuad); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texSrc);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, texMask); gl.uniform1i(gl.getUniformLocation(progQuad, 'uMask'), 4); gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(gl.getUniformLocation(progQuad, 'uSrc'), 0); gl.uniform1f(gl.getUniformLocation(progQuad, 'uGround'), o.ground ?? .65);
    gl.uniform3fv(gl.getUniformLocation(progQuad, 'uGroundCol'), rgb(o.groundCol || '#f3e7c9'));
    gl.bindVertexArray(quadVao); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // strokes
    gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    gl.useProgram(progStroke);
    const U = (n) => gl.getUniformLocation(progStroke, n);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, texMask); gl.uniform1i(U('uMask'), 4); gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(U('uSrc'), 0); gl.uniform2f(U('uRes'), W, H); gl.uniform1f(U('uTime'), t);
    gl.uniform1f(U('uFauve'), o.fauve ?? .6); gl.uniform1f(U('uImpasto'), o.impasto ?? .8);
    const li = o.light || [-.6, -.8]; gl.uniform2f(U('uLight'), li[0], li[1]);
    gl.uniform1f(U('uFlowAng'), o.flowAng ?? 0); gl.uniform1f(U('uFlowBias'), o.flowBias ?? 0);
    gl.uniform3fv(U('uShadowTint'), rgb(o.shadowTint || '#3b3fa8')); gl.uniform3fv(U('uHiTint'), rgb(o.hiTint || '#fbe58a'));
    const sk = o.strokeK ?? 1;
    layers.forEach((L, i) => {
      if (o.layers && !o.layers[i]) return;
      gl.uniform1f(U('uBoil'), (Math.floor(t * boilRate) % 251) + i * 300);
      gl.uniform1f(U('uCell'), L.cell); gl.uniform1f(U('uLen'), L.len * sk); gl.uniform1f(U('uWid'), L.wid * sk);
      gl.uniform1f(U('uEdgeLo'), L.edgeLo); gl.uniform1f(U('uEdgeHi'), L.edgeHi); gl.uniform1f(U('uJit'), L.jit);
      gl.uniform1f(U('uGap'), (o.gap ?? .15) * L.gapK);
      gl.uniform1f(U('uFlowK'), (o.flowK ?? 1) * L.flowK); gl.uniform2f(U('uSmear'), (o.smear || [0, 0])[0], (o.smear || [0, 0])[1]); gl.uniform1f(U('uAlpha'), L.alpha);
      gl.bindVertexArray(L.vao); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, L.n);
    });
    // ink over paint, unbrushed
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
    gl.useProgram(progInk); gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, texInk); gl.uniform1i(gl.getUniformLocation(progInk, 'uInk'), 3); gl.uniform1f(gl.getUniformLocation(progInk, 'uInkSoft'), o.inkSoft ?? 0);
    gl.bindVertexArray(quadVao); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // light + finish
    gl.useProgram(progFinish); const F = (n) => gl.getUniformLocation(progFinish, n);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texFx); gl.uniform1i(F('uFx'), 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, texFxb); gl.uniform1i(F('uFxb'), 2);
    gl.uniform1f(F('uTime'), t); gl.uniform1f(F('uGrain'), o.grain ?? .04); gl.uniform1f(F('uVig'), o.vig ?? .22); gl.uniform1f(F('uBloom'), o.bloom ?? .9); gl.uniform1f(F('uFrame'), Math.floor(t * 24) % 97);
    gl.bindVertexArray(quadVao);
    gl.blendFuncSeparate(gl.ZERO, gl.SRC_ALPHA, gl.ZERO, gl.ONE); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.activeTexture(gl.TEXTURE0);
  }

  return { init, present, sctx, fctx, ictx, mctx, src, fx, ink, mask };
})();
