// inked3d kit, gouache (opt-in, under test, rheos/secondunit-videos#415): a Kuwahara paint filter run once on a baked
// plate, so it costs nothing per frame and cannot shimmer. Nothing loads this unless a page asks for it. The figure,
// ink and stroke layer are drawn after it and stay crisp.
//
// The shader is ported from PAINT_FS in github.com/0xCodez/leviathan src/passes-env.js, MIT License,
// Copyright (c) 2026 Beyond Dev. The notice is in LICENSE-leviathan.txt beside this file. Only the pass is taken.
// Changes: it reads a 2D canvas instead of a scene buffer, so the radius is per plate rather than per depth, alpha
// comes from the plate unchanged, and the sharpness and paper tooth are parameters.
const GOUACHE_FS = `#version 300 es
precision highp float;
uniform sampler2D tColor; uniform vec2 uRes; uniform float uRad, uScale, uSeed, uSharp, uTooth;
out vec4 o;
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
  return mix(mix(hash12(i), hash12(i+vec2(1,0)), u.x), mix(hash12(i+vec2(0,1)), hash12(i+vec2(1,1)), u.x), u.y); }
float fbm2(vec2 p){ float s = 0., a = .5; for(int i = 0; i < 4; i++){ s += a*vnoise(p); p = p*2.03 + vec2(1.7, 9.2); a *= .5; } return s; }
void main(){
  vec2 px = 1.0 / uRes, vUv = gl_FragCoord.xy * px;
  vec4 c0p = texture(tColor, vUv);               // premultiplied, as uploaded
  if(c0p.a < 0.004){ o = vec4(0.0); return; }
  vec3 c0 = c0p.rgb / c0p.a;
  vec2 fc = gl_FragCoord.xy + uSeed;
  float ang = (fbm2(fc / uScale) - 0.5) * 3.2 + 0.4;
  vec2 dA = vec2(cos(ang), sin(ang)), dB = vec2(-dA.y, dA.x);
  vec3 m[8]; vec3 s[8]; float n[8];
  for(int k = 0; k < 8; k++){ m[k] = c0; s[k] = c0 * c0; n[k] = 1.0; }
  for(int r = 1; r <= 3; r++){
    float rr = uRad * float(r) / 3.0;
    for(int k = 0; k < 16; k++){
      float a = float(k) * 0.39269908 + (r == 2 ? 0.19634954 : 0.0);
      vec2 off = (dA * cos(a) * 1.45 + dB * sin(a) * 0.8) * rr;
      vec4 t = texture(tColor, vUv + off * px);
      vec3 tc = t.rgb, tq = t.a > 0.004 ? t.rgb * t.rgb / t.a : vec3(0.0);
      if(k / 2 * 2 == k){
        int i0 = k / 2;
        m[i0] += tc; s[i0] += tq; n[i0] += t.a;
      } else {
        int i0 = (k - 1) / 2, i1 = ((k + 1) / 2) % 8;
        m[i0] += tc * 0.5; s[i0] += tq * 0.5; n[i0] += t.a * 0.5;
        m[i1] += tc * 0.5; s[i1] += tq * 0.5; n[i1] += t.a * 0.5;
      }
    }
  }
  vec3 acc = vec3(0.0); float wsum = 0.0;
  for(int k = 0; k < 8; k++){
    vec3 mu = m[k] / n[k];
    vec3 v = abs(s[k] / n[k] - mu * mu);
    float sd = sqrt(v.r + v.g + v.b);
    float w = 1.0 / (1.0 + pow(sd * uSharp, 8.0));
    acc += mu * w; wsum += w;
  }
  vec3 col = wsum > 1e-5 ? acc / wsum : c0;
  mat2 R = mat2(dA.x, dA.y, dB.x, dB.y);
  vec2 sp = R * fc;
  float bristle = vnoise(vec2(sp.x / 26.0, sp.y / 2.2));
  float paper = vnoise(fc / 2.5) * 0.5 + vnoise(fc / 9.0) * 0.5;
  col *= 1.0 + uTooth * (0.04 * bristle - 0.02);
  col *= 1.0 + uTooth * (0.02 * paper - 0.01);
  o = vec4(clamp(col, 0.0, 1.0) * c0p.a, c0p.a);
}`;
const GOUACHE = { stats: [] };
// Filter a baked canvas into a new canvas of the same size.
// o: { rad (brush radius in plate px, 0 = off), scale (stroke-field px, Leviathan 140), seed, sharp (Leviathan 22), tooth (0 to 1, Leviathan 1) }
function gouacheCanvas(src, o = {}) {
  const out = canvas(src.width, src.height), q = out.getContext('2d');
  if (!o.rad) { q.drawImage(src, 0, 0); return out; }
  const t0 = performance.now();
  const glc = canvas(src.width, src.height), gl = glc.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
  const sh = (type, code) => { const s = gl.createShader(type); gl.shaderSource(s, code); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('gouache: ' + gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, `#version 300 es\nvoid main(){ vec2 p = vec2((gl_VertexID & 1) * 4 - 1, (gl_VertexID & 2) * 2 - 1); gl_Position = vec4(p, 0.0, 1.0); }`)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, GOUACHE_FS)); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('gouache: ' + gl.getProgramInfoLog(pr)); gl.useProgram(pr);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  const tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.viewport(0, 0, src.width, src.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  const u = (n) => gl.getUniformLocation(pr, n);
  gl.uniform2f(u('uRes'), src.width, src.height); gl.uniform1f(u('uRad'), o.rad); gl.uniform1f(u('uScale'), o.scale ?? 140); gl.uniform1f(u('uSeed'), o.seed ?? 0); gl.uniform1f(u('uSharp'), o.sharp ?? 22); gl.uniform1f(u('uTooth'), o.tooth ?? 1);
  gl.drawArrays(gl.TRIANGLES, 0, 3); gl.finish();
  q.drawImage(glc, 0, 0);
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  GOUACHE.stats.push({ w: src.width, h: src.height, ms: performance.now() - t0, ...o });
  return out;
}
// Opt-in from a page: run between the project's plates script and its main script. Replaces its global bake functions.
// map: { bakeBack: { rad, scale, ... }, bakeFront: { ... } }. URL ?gb= ?gf= ?gs= ?gh= ?gt= override back radius, front
// radius, stroke-field scale, sharpness and tooth, and ?gb=0&gf=0 is the untouched plate through the same path.
function gouachePlates(map) {
  const q = new URLSearchParams(location.search), num = (k, d) => (q.has(k) ? parseFloat(q.get(k)) : d);
  for (const [name, o] of Object.entries(map)) { const orig = window[name], key = name === 'bakeBack' ? 'gb' : 'gf';
    const opt = { ...o, rad: num(key, o.rad), scale: num('gs', o.scale), sharp: num('gh', o.sharp), tooth: num('gt', o.tooth) };
    window[name] = () => { const t0 = performance.now(), c = orig(); GOUACHE.stats.push({ bake: name, ms: performance.now() - t0 }); return gouacheCanvas(c, opt); }; }
  window.__gouache = GOUACHE;
}
