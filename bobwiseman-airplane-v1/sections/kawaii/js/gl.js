// The WebGL finishing pass. A look supplies one fragment shader; it receives the 2D source frame
// as `src` (mipmapped, so textureLod gives cheap blurs), the song time, and the per-frame FX values.
const GL = {
  init(canvas, frag, uniforms) {
    canvas.width = Math.round(W * RS); canvas.height = Math.round(H * RS);
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
    const src = document.createElement('canvas'); src.width = canvas.width; src.height = canvas.height;
    s = src.getContext('2d');
    const inkc = document.createElement('canvas'); inkc.width = canvas.width; inkc.height = canvas.height; k = inkc.getContext('2d');
    const sh = (type, code) => { const o = gl.createShader(type); gl.shaderSource(o, code); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p * .5 + .5; uv.y = 1. - uv.y; gl_Position = vec4(p, 0, 1); }`));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D src, ink; uniform float t, tq; uniform vec2 res;
${GL.NOISE}
${frag}`));
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, k, gl.MIRRORED_REPEAT);
    gl.activeTexture(gl.TEXTURE1); const tex2 = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    for (const kk of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, kk, gl.CLAMP_TO_EDGE);
    gl.activeTexture(gl.TEXTURE0);
    const U = (n) => gl.getUniformLocation(prog, n);
    return {
      present(t, fxv) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); gl.generateMipmap(gl.TEXTURE_2D);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, inkc); gl.generateMipmap(gl.TEXTURE_2D); gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(U('src'), 0); gl.uniform1i(U('ink'), 1); gl.uniform1f(U('t'), t); gl.uniform1f(U('tq'), onTwos(t)); gl.uniform2f(U('res'), canvas.width, canvas.height);
        const u = uniforms(t, fxv);
        for (const [k, v] of Object.entries(u)) { const l = U(k); if (!l) continue; if (Array.isArray(v)) gl[`uniform${v.length}f`](l, ...v); else gl.uniform1f(l, v); }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      },
    };
  },
  NOISE: `
uvec2 pcg2(uvec2 v){ v = v * 1664525u + 1013904223u; v.x += v.y * 1664525u; v.y += v.x * 1664525u; v ^= v >> 16u; v.x += v.y * 1664525u; v.y += v.x * 1664525u; v ^= v >> 16u; return v; }
float h21(vec2 p){ return float(pcg2(uvec2(ivec2(floor(p)) + 65536)).x) / 4294967295.; }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + 17.1; a *= .5; } return s; }
vec2 fbm2(vec2 p){ return vec2(fbm(p), fbm(p + 31.7)) * 2. - 1.; }`,
};
