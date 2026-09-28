// Painterly renderer, adapted from functional-emotions-video (MIT, see LICENSE-functional-emotions).
//
// Per frame, scene code draws three Canvas2D layers:
//   src  (960x540)   flat underpainting. The GPU repaints it with instanced brushstrokes that
//                    sample its colour and follow its edges.
//   ink  (1920x1080) full-res linework and the wordmark, laid over the paint unbrushed so fine
//                    lines stay crisp. Still graded, grained and weathered with everything else.
//   fx   (960x540)   additive light (fire, glints), plus a blurred copy for bloom and halation.
// Changes from the original: strokes render into an FBO, and a finish pass grades the whole frame
// like aged print stock (split tone, halation, grain, dust, scratches, gate weave, torn burnt edge).

const W = 1920, H = 1080, SW = 960, SH = 540;

const Paint = (() => {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const src = mk(SW, SH), fx = mk(SW, SH), fxb = mk(SW / 4, SH / 4), ink = mk(W, H);
  const sctx = src.getContext('2d'), fctx = fx.getContext('2d'), bctx = fxb.getContext('2d'), ictx = ink.getContext('2d');

  let gl, progStroke, progUnder, progInk, progFinish, layers = [], texSrc, texFx, texFxb, texInk, quadVao, fbo, fboTex;

  const VS_STROKE = `#version 300 es
  precision highp float;
  layout(location=0) in vec2 aCorner;
  layout(location=1) in vec2 aBase;
  layout(location=2) in vec4 aRand;
  uniform sampler2D uSrc; uniform vec2 uRes; uniform float uBoil, uTime;
  uniform float uCell, uLen, uWid, uEdgeLo, uEdgeHi, uJit, uFlowK, uAlpha; uniform vec2 uSmear;
  out vec2 vUV; out vec3 vCol; out float vSeed, vA;
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
    vec2 e = vec2(2.5/${SW}.0, 2.5/${SH}.0);
    float gx = lum(texture(uSrc, uv+vec2(e.x,0)).rgb) - lum(texture(uSrc, uv-vec2(e.x,0)).rgb);
    float gy = lum(texture(uSrc, uv+vec2(0,e.y)).rgb) - lum(texture(uSrc, uv-vec2(0,e.y)).rgb);
    float edge = length(vec2(gx,gy));
    float ang = atan(gy, gx) + 1.5708;
    // ground and sky strokes lie mostly horizontal (landscape painters' habit), turbulence breaks it up
    float flow = (n2(pos*.0018 + vec2(uTime*.02, 0.)) - .5) * 3.2 * uFlowK + .08;
    ang = mix(flow, ang, smoothstep(.012, .07, edge));
    ang += (h(s+2.1) - .5) * .45;
    float sm = clamp(length(uSmear) / 60., 0., 1.);
    if (sm > 0.) ang = mix(ang, atan(uSmear.y, uSmear.x) + (h(s+2.1) - .5) * .12, sm);
    float vis = uEdgeLo < 0. ? 1. : smoothstep(uEdgeLo, uEdgeHi, edge);
    float len = uLen * (.7 + .6*h(s+3.7)) * (1. + sm * 3.), wid = uWid * (.7 + .5*h(s+4.9));
    vec2 c = aCorner; vec2 d = vec2(cos(ang), sin(ang));
    vec2 p = pos + d * c.x * len + vec2(-d.y, d.x) * c.y * wid;
    vec2 clip = p / uRes * 2. - 1.; clip.y = -clip.y;
    gl_Position = vec4(clip, 0, 1);
    vUV = c; vSeed = h(s+5.5);
    float v = (h(s+6.1)-.5)*.16;
    vCol = clamp(col * (1. + v) + vec3(h(s+7.)-.5, h(s+8.)-.5, h(s+9.)-.5)*.03, 0., 1.);
    vA = vis * uAlpha;
  }`;
  const FS_STROKE = `#version 300 es
  precision highp float;
  in vec2 vUV; in vec3 vCol; in float vSeed, vA; out vec4 o;
  float h(float n){ return fract(sin(n)*43758.5453); }
  float n1(float x){ float i=floor(x), f=fract(x); return mix(h(i),h(i+1.),f*f*(3.-2.*f)); }
  void main(){
    float x = vUV.x, y = vUV.y;
    float prof = (1. - pow(abs(x), 3.)) * (.82 + .18*sin(x*3.+vSeed*6.));
    float m = smoothstep(prof, prof - .3, abs(y));
    float br = n1(y*16. + vSeed*50.);
    float br2 = n1(y*41. + vSeed*91.);
    float dry = smoothstep(.0, .3, br - (x*.5+.5)*.65 + .3);   // dry-brush: bristles break up toward the tail
    float a = m * mix(1., dry, .8) * (.72 + .28*br2);
    vec3 c = vCol * (.84 + .24*br) + (br2-.5)*.035;
    o = vec4(c, a * vA);
  }`;
  const VS_QUAD = `#version 300 es
  layout(location=0) in vec2 aP; out vec2 vUV;
  void main(){ vUV = aP*.5+.5; gl_Position = vec4(aP,0,1); }`;
  // canvases upload top-row-first; vUV.y=1 is the top of the quad, so flip
  const FS_UNDER = `#version 300 es
  precision highp float; in vec2 vUV; uniform sampler2D uSrc; out vec4 o;
  void main(){ o = vec4(texture(uSrc, vec2(vUV.x, 1.-vUV.y)).rgb * .9, 1); }`;
  const FS_INK = `#version 300 es
  precision highp float; in vec2 vUV; uniform sampler2D uInk; out vec4 o;
  void main(){ vec4 c = texture(uInk, vec2(vUV.x, 1.-vUV.y)); o = c; }`;
  const FS_FINISH = `#version 300 es
  precision highp float; in vec2 vUV;
  uniform sampler2D uPaint, uFx, uFxb; uniform float uTime, uGrain, uVig, uBloom, uFrame, uHal, uDust, uTorn, uExpo, uWarm;
  uniform vec2 uWeave; out vec4 o;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
  float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }
  float lum(vec3 c){ return dot(c, vec3(.3,.55,.15)); }
  void main(){
    vec2 px = gl_FragCoord.xy;
    vec2 uv = vUV + uWeave / vec2(${W}.0, ${H}.0);
    vec3 c = texture(uPaint, uv).rgb;
    vec2 luv = vec2(uv.x, 1.-uv.y);
    vec3 L = texture(uFx, luv).rgb, Lb = texture(uFxb, luv).rgb;
    c += L + Lb * uBloom;
    // halation: bright light bleeds a red fringe into the emulsion
    c += Lb * vec3(1., .28, .08) * uHal;
    c *= uExpo;
    // aged print: soft shoulder, lifted and warmed blacks, split tone (umber shadows, cream highlights)
    c = c / (1. + c * .45) * 1.3;
    c = pow(max(c, 0.), vec3(1.18));                       // deepen the shadows, keep firelight hot
    float l = lum(c);
    vec3 sh = vec3(.05, .026, .02), hi = vec3(1.03, .94, .8);
    c = mix(c, vec3(l), .08);
    c = c * mix(vec3(1.), hi, smoothstep(.35, 1., l) * uWarm);
    c = c * mix(vec3(1.04, .97, .92), vec3(1.), smoothstep(0., .4, l));   // umber toe
    c = sh * (1. - smoothstep(0., .25, l)) * .45 + c;
    // gate weave already in uv; grain: luminance-weighted, clumped at ~1.6px
    vec2 gp = floor(px / 1.6);
    float g = (h(gp + uFrame * 17.31) + h(gp * 1.7 + uFrame * 3.1) - 1.);
    c += g * uGrain * (.35 + .65 * (1. - abs(l - .45) * 1.6));
    // dust and hair: a few specks per frame, different each frame
    float fr = uFrame;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      vec2 dp = vec2(h(vec2(fr, fi)), h(vec2(fi, fr + 3.))) * vec2(${W}.0, ${H}.0);
      float r = 1.2 + 3.5 * h(vec2(fr + fi, 9.));
      float d = length((px - dp) * vec2(1., .7 + .6 * h(vec2(fi, fr))));
      float on = step(.35, h(vec2(fr * .37, fi * 1.9)));
      c = mix(c, c * .25, uDust * on * smoothstep(r, r * .4, d));
    }
    // vertical scratch, now and then
    float sx = h(vec2(floor(fr / 3.), 4.)) * ${W}.0;
    float sOn = step(.72, h(vec2(floor(fr / 3.), 7.)));
    c += uDust * sOn * .1 * smoothstep(1.4, 0., abs(px.x - sx - sin(px.y * .01 + fr) * 3.)) * (.5 + .5 * vn(vec2(px.y * .02, fr)));
    // vignette
    float vig = 1. - uVig * pow(length((vUV - .5) * vec2(1., .82)) * 1.3, 2.4);
    c *= clamp(vig, 0., 1.);
    // torn, scorched print edge: irregular burn creeping in from the frame border
    vec2 q = vUV * vec2(${W}.0, ${H}.0);
    float dEdge = min(min(q.x, ${W}.0 - q.x), min(q.y, ${H}.0 - q.y));
    float tear = (fbm(q * .012 + 3.) - .5) * 70. + (fbm(q * .06) - .5) * 18.;
    float e = dEdge - (uTorn + tear);
    float burn = smoothstep(26., 0., e);
    c *= 1. - burn * .82;
    c += vec3(.9, .35, .08) * smoothstep(3., 0., abs(e - 2.)) * .22 * uTorn / 30.;   // faint ember line at the tear
    c = mix(c, vec3(.02, .012, .01), smoothstep(0., -6., e));
    o = vec4(clamp(c, 0., 1.), 1.);
  }`;

  function sh(type, s) { const x = gl.createShader(type); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; }
  function prog(vs, fs) { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
  function tex() { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }

  // stroke layers: cell spacing, stroke half-length/half-width, edge gating
  const LAYERS = [
    { cell: 22, len: 34, wid: 10, edgeLo: -1, edgeHi: 0, jit: 1.2, flowK: 1, alpha: .95 },
    { cell: 12, len: 15, wid: 5, edgeLo: .02, edgeHi: .07, jit: 1.1, flowK: .8, alpha: .95 },
    { cell: 6.5, len: 7.5, wid: 2.4, edgeLo: .05, edgeHi: .14, jit: 1, flowK: .5, alpha: 1 },
  ];

  function init(canvas) {
    gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, premultipliedAlpha: false });
    progStroke = prog(VS_STROKE, FS_STROKE); progUnder = prog(VS_QUAD, FS_UNDER); progInk = prog(VS_QUAD, FS_INK); progFinish = prog(VS_QUAD, FS_FINISH);
    texSrc = tex(); texFx = tex(); texFxb = tex(); texInk = tex();
    fboTex = tex(); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    quadVao = gl.createVertexArray(); gl.bindVertexArray(quadVao);
    const qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    for (const L of LAYERS) {
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const base = []; let k = 0;
      for (let y = -L.cell; y < H + L.cell; y += L.cell) for (let x = -L.cell; x < W + L.cell; x += L.cell) { base.push(x + (Math.round(y / L.cell) % 2) * L.cell * .5, y); k++; }
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

  // o: { boil, grain, vig, bloom, hal, dust, torn, expo, warm, strokeK, flowK, smear, weave:[dx,dy] }
  function present(t, frame, o = {}) {
    const boilRate = o.boil ?? 8;
    bctx.globalCompositeOperation = 'copy'; bctx.filter = 'blur(5px)'; bctx.drawImage(fx, 0, 0, fxb.width, fxb.height); bctx.filter = 'none';
    upload(texSrc, src); upload(texFx, fx); upload(texFxb, fxb); upload(texInk, ink);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, W, H); gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND); gl.useProgram(progUnder); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texSrc);
    gl.uniform1i(gl.getUniformLocation(progUnder, 'uSrc'), 0); gl.bindVertexArray(quadVao); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
    gl.useProgram(progStroke);
    const U = (n) => gl.getUniformLocation(progStroke, n);
    gl.uniform1i(U('uSrc'), 0); gl.uniform2f(U('uRes'), W, H); gl.uniform1f(U('uTime'), t);
    const sk = o.strokeK ?? 1;
    layers.forEach((L, i) => {
      gl.uniform1f(U('uBoil'), (Math.floor(t * boilRate) % 251) + i * 300);
      gl.uniform1f(U('uCell'), L.cell); gl.uniform1f(U('uLen'), L.len * sk); gl.uniform1f(U('uWid'), L.wid * sk);
      gl.uniform1f(U('uEdgeLo'), L.edgeLo); gl.uniform1f(U('uEdgeHi'), L.edgeHi); gl.uniform1f(U('uJit'), L.jit);
      gl.uniform1f(U('uFlowK'), (o.flowK ?? 1) * L.flowK); gl.uniform2f(U('uSmear'), (o.smear || [0, 0])[0], (o.smear || [0, 0])[1]); gl.uniform1f(U('uAlpha'), L.alpha);
      gl.bindVertexArray(L.vao); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, L.n);
    });
    // ink over paint
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
    gl.useProgram(progInk); gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, texInk); gl.uniform1i(gl.getUniformLocation(progInk, 'uInk'), 3);
    gl.bindVertexArray(quadVao); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // finish to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.disable(gl.BLEND);
    gl.useProgram(progFinish); const F = (n) => gl.getUniformLocation(progFinish, n);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fboTex); gl.uniform1i(F('uPaint'), 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texFx); gl.uniform1i(F('uFx'), 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, texFxb); gl.uniform1i(F('uFxb'), 2);
    gl.uniform1f(F('uTime'), t); gl.uniform1f(F('uFrame'), frame % 997);
    gl.uniform1f(F('uGrain'), o.grain ?? .06); gl.uniform1f(F('uVig'), o.vig ?? .6); gl.uniform1f(F('uBloom'), o.bloom ?? 1.1);
    gl.uniform1f(F('uHal'), o.hal ?? .5); gl.uniform1f(F('uDust'), o.dust ?? .6); gl.uniform1f(F('uTorn'), o.torn ?? 22);
    gl.uniform1f(F('uExpo'), o.expo ?? 1); gl.uniform1f(F('uWarm'), o.warm ?? 1);
    gl.uniform2f(F('uWeave'), (o.weave || [0, 0])[0], (o.weave || [0, 0])[1]);
    gl.bindVertexArray(quadVao); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.activeTexture(gl.TEXTURE0);
  }

  return { init, present, sctx, fctx, ictx, src, fx, ink };
})();
