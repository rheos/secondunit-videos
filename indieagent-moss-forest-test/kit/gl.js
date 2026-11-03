// inked3d kit, renderer: a real 3D model drawn as a hand-inked cel. Shaded from one light through a hard shadow map
// in three flat tones per material, weathered in object space, inked from part, depth and normal edges with the line
// broken by noise, and a dry-brush stroke layer planted on the surface (strokes.js). Drawn at 2x and downsampled by
// the caller. Pure: the same parts, camera and uniforms always give the same pixels.
//
// A project describes its look once with configureInk({ mats, weather, glow, tones, blades, petals, ink }):
//   mats     per material index: { lit, mid, shade, kind }  colours as '#rrggbb'; kind bits: 1 weathered (stains, bare
//            patches, lichen, planks and cracks), 2 glow (lit from inside by uni.glow), 4 takes the ray (uni.ray, uni.rayP)
//   weather  { stainL, stainS, bareL, bareM, bareS, lichenL, lichenS, ink, rayL, rayS }
//   glow     [off, warm, hot]     tones    5 hatch tones dark to light     blades 3 tones     petals [a, b, c, centre]
//   ink      the ink colour
const GW = 2 * W, GH = 2 * H, MAXP = 48, NM = 16;
const glc = canvas(GW, GH), gl = glc.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
gl.getExtension('EXT_color_buffer_float');
function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, '#version 300 es\nprecision highp float;precision highp int;\n' + src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + src.slice(0, 200)); return s; }
function prog(vs, fs) { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); const u = {}; for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) { const a = gl.getActiveUniform(p, i), nm = a.name.replace('[0]', ''); u[nm] = gl.getUniformLocation(p, a.name); } return { p, u }; }
// ---- matrices (column-major)
const M = {
  id: () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  mul(a, b) { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; },
  tr: (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1],
  rx(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; },
  ry(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; },
  rz(a) { const c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; },
  sc: (s) => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1],
  persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; },
  ortho(l, r, b, t, n, f) { return [2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0, -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1]; },
  look(e, c, up = [0, 1, 0]) { const n = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); }, cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], d3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const z = n([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = n(cr(up, z)), y = cr(z, x); return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -d3(x, e), -d3(y, e), -d3(z, e), 1]; },
  apply(m, p) { return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]]; },
  dir(m, p) { return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2], m[1] * p[0] + m[5] * p[1] + m[9] * p[2], m[2] * p[0] + m[6] * p[1] + m[10] * p[2]]; },
};
// a segment matrix: y runs from A to B (for limbs posed by two points)
function segM(A, B) { const yv = [A[0] - B[0], A[1] - B[1], A[2] - B[2]], L = Math.hypot(...yv); yv[0] /= L; yv[1] /= L; yv[2] /= L; const ref = [0, 0, 1], c = [ref[1] * yv[2] - ref[2] * yv[1], ref[2] * yv[0] - ref[0] * yv[2], ref[0] * yv[1] - ref[1] * yv[0]], l = Math.hypot(...c) || 1, xv = c.map((q) => q / l), zv = [xv[1] * yv[2] - xv[2] * yv[1], xv[2] * yv[0] - xv[0] * yv[2], xv[0] * yv[1] - xv[1] * yv[0]]; return [xv[0], xv[1], xv[2], 0, yv[0], yv[1], yv[2], 0, zv[0], zv[1], zv[2], 0, A[0], A[1], A[2], 1]; }
// ---- geometry: smooth rounded boxes, lathes and tubes; each vertex carries its part and material
const GEO = { pos: [], nrm: [], meta: [], idx: [] };
function pushV(p, n, part, mat, edge = 0) { GEO.pos.push(...p); GEO.nrm.push(...n); GEO.meta.push(part, mat, edge); return GEO.pos.length / 3 - 1; }
function roundBox(part, mat, cx, cy, cz, w, h, d, r, n = 5, xf = null) {
  const hx = w / 2, hy = h / 2, hz = d / 2, ix = hx - r, iy = hy - r, iz = hz - r, sub = n * 2 + 2;
  const face = (ax, ay, az, ux, uy, uz, vx, vy, vz) => {
    const base = GEO.pos.length / 3;
    for (let j = 0; j <= sub; j++) for (let i = 0; i <= sub; i++) {
      const u = i / sub * 2 - 1, v = j / sub * 2 - 1;
      const px = (ax + ux * u + vx * v) * hx, py = (ay + uy * u + vy * v) * hy, pz = (az + uz * u + vz * v) * hz;
      const qx = clamp(px, -ix, ix), qy = clamp(py, -iy, iy), qz = clamp(pz, -iz, iz);
      let nx = px - qx, ny = py - qy, nz = pz - qz; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      if (Math.hypot(px - qx, py - qy, pz - qz) < 1e-6) { nx = ax; ny = ay; nz = az; }
      let P = [qx + nx * r + cx, qy + ny * r + cy, qz + nz * r + cz], N = [nx, ny, nz];
      if (xf) { P = M.apply(xf, P); N = M.dir(xf, N); }
      pushV(P, N, part, mat);
    }
    for (let j = 0; j < sub; j++) for (let i = 0; i < sub; i++) { const a = base + j * (sub + 1) + i, b = a + 1, c = a + sub + 1, e = c + 1; GEO.idx.push(a, b, e, a, e, c); }
  };
  face(0, 0, 1, 1, 0, 0, 0, 1, 0); face(0, 0, -1, -1, 0, 0, 0, 1, 0); face(1, 0, 0, 0, 0, -1, 0, 1, 0); face(-1, 0, 0, 0, 0, 1, 0, 1, 0); face(0, 1, 0, 1, 0, 0, 0, 0, -1); face(0, -1, 0, 1, 0, 0, 0, 0, 1);
}
// lathe around y: prof = [[radius, y], ...] top to bottom
function lathe(part, mat, prof, cx = 0, cy = 0, cz = 0, seg = 18, sx = 1, sz = 1) {
  const base = GEO.pos.length / 3, m = prof.length;
  for (let j = 0; j < m; j++) { const [r, y] = prof[j], a0 = prof[Math.max(0, j - 1)], a1 = prof[Math.min(m - 1, j + 1)], dr = a1[0] - a0[0], dy = a1[1] - a0[1], nl = Math.hypot(dr, dy) || 1;
    for (let i = 0; i <= seg; i++) { const a = i / seg * TAU, ca = Math.cos(a), sa = Math.sin(a), nr = -dy / nl, ny = dr / nl; pushV([cx + ca * r * sx, cy + y, cz + sa * r * sz], [ca * nr, ny, sa * nr], part, mat); } }
  for (let j = 0; j < m - 1; j++) for (let i = 0; i < seg; i++) { const a = base + j * (seg + 1) + i, b = a + 1, c = a + seg + 1, e = c + 1; GEO.idx.push(a, e, b, a, c, e); }
}
// a tapered tube from one point to another (branches, pipes, limbs that don't pose)
function tube(part, mat, x0, y0, z0, x1, y1, z1, r0, r1, seg = 8) {
  const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, L = Math.hypot(dx, dy, dz), yv = [dx / L, dy / L, dz / L], ref = Math.abs(yv[1]) > .9 ? [1, 0, 0] : [0, 1, 0], xv = (() => { const c = [ref[1] * yv[2] - ref[2] * yv[1], ref[2] * yv[0] - ref[0] * yv[2], ref[0] * yv[1] - ref[1] * yv[0]], l = Math.hypot(...c); return c.map((v) => v / l); })(), zv = [xv[1] * yv[2] - xv[2] * yv[1], xv[2] * yv[0] - xv[0] * yv[2], xv[0] * yv[1] - xv[1] * yv[0]];
  const base = GEO.pos.length / 3; for (let j = 0; j <= 5; j++) { const k = j / 5, r = lerp(r0, r1, k); for (let i = 0; i <= seg; i++) { const a = i / seg * TAU, c = Math.cos(a), s = Math.sin(a), N = [xv[0] * c + zv[0] * s, xv[1] * c + zv[1] * s, xv[2] * c + zv[2] * s]; pushV([x0 + dx * k + N[0] * r, y0 + dy * k + N[1] * r, z0 + dz * k + N[2] * r], N, part, mat); } } for (let j = 0; j < 5; j++) for (let i = 0; i < seg; i++) { const a = base + j * (seg + 1) + i, b = a + 1, c = a + seg + 1, e = c + 1; GEO.idx.push(a, b, e, a, e, c); }
}

// ---- the look: materials and palettes, uploaded as uniforms ----
const INK = { mat: new Float32Array(NM * 9), kind: new Int32Array(NM), wx: new Float32Array(30), glow: new Float32Array(9), tones: new Float32Array(15), blades: new Float32Array(9), petals: new Float32Array(12), ink: new Float32Array(3) };
const f3 = (h) => hex(h).map((v) => v / 255);
function configureInk(o) {
  (o.mats || []).forEach((m, i) => { INK.mat.set([...f3(m.lit), ...f3(m.mid), ...f3(m.shade)], i * 9); INK.kind[i] = m.kind || 0; });
  const w = o.weather || {}; ['stainL', 'stainS', 'bareL', 'bareM', 'bareS', 'lichenL', 'lichenS', 'ink', 'rayL', 'rayS'].forEach((k, i) => { if (w[k]) INK.wx.set(f3(w[k]), i * 3); });
  if (o.glow) INK.glow.set(o.glow.flatMap(f3)); if (o.tones) INK.tones.set(o.tones.flatMap(f3)); if (o.blades) INK.blades.set(o.blades.flatMap(f3)); if (o.petals) INK.petals.set(o.petals.flatMap(f3)); if (o.ink) INK.ink.set(f3(o.ink));
}
// ---- shaders ----
const NOISE = `float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){return .55*vn(p)+.3*vn(p*2.13+7.1)+.15*vn(p*4.31+3.7);}
float fbm3(vec3 p){return (fbm(p.xy+p.z*1.7)+fbm(p.yz*1.03+p.x*1.3))*.5;}`;
const SHADOW = `float sunlit(vec3 w){vec4 s=uSVP*vec4(w,1.);vec3 q=s.xyz/s.w*.5+.5;if(q.x<0.||q.x>1.||q.y<0.||q.y>1.)return 1.;return q.z-.0035>texture(uShadow,q.xy).r?0.:1.;}`;
const P_SOLID = prog(`layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in vec3 aM;
uniform mat4 uPart[${MAXP}];uniform mat4 uVP;out vec3 vW;out vec3 vL;out vec3 vN;flat out int vMat;flat out float vId;
void main(){int pt=int(aM.x);mat4 m=uPart[pt];vec4 w=m*vec4(aP,1.);vW=w.xyz;vL=aP+float(pt)*3.7;vN=mat3(m)*aN;vMat=int(aM.y);vId=2.+aM.y+aM.x*8.;gl_Position=uVP*w;}`,
`in vec3 vW;in vec3 vL;in vec3 vN;flat in int vMat;flat in float vId;layout(location=0) out vec4 o0;layout(location=1) out vec4 o1;
uniform sampler2D uShadow;uniform mat4 uSVP;uniform vec3 uL;uniform float uGlow;uniform float uRay;uniform vec3 uRayP;uniform vec3 uFill;
uniform vec3 uMat[${NM * 3}];uniform int uKind[${NM}];uniform vec3 uWx[10];uniform vec3 uGlowC[3];${NOISE}${SHADOW}
void main(){vec3 N=normalize(vN);
 float w=(fbm3(vL*7.)-.5)*.2;float ndl=dot(N,uL)+w;float lit=step(.06,ndl)*sunlit(vW+N*.012);float fill=step(.3,dot(N,uFill)+w*1.4);
 vec3 L0=uMat[vMat*3],M0=uMat[vMat*3+1],S0=uMat[vMat*3+2];int k=uKind[vMat];
 vec3 c=lit>.5?L0:(fill>.5?M0:S0);
 if((k&1)==1){ // weathered: flat stains, the finish gone in patches, lichen, planks and cracks in ink
  vec3 P=vL;float st=fbm3(P*2.1+3.);float st2=fbm3(P*5.3+9.);
  if(st2>.6&&st>.47)c=mix(c,lit>.5?uWx[0]:uWx[1],.85);
  if(st<.335)c=lit>.5?uWx[2]:(fill>.5?uWx[3]:uWx[4]);
  if(fbm3(P*3.3+21.)>.645)c=lit>.5?uWx[5]:uWx[6];
  float pl=abs(fract(P.x*2.6+.08*fbm3(P*1.3)+P.y*.02)-.5);float gap=step(.42,fbm3(P*vec3(1.5,3.2,1.5)));if(pl<.009&&abs(N.z)>.5)c=mix(c,uWx[7],gap*.85);
  float cr=abs(fbm3(P*vec3(1.7,.8,1.7)+5.)-.5);if(cr<.0045)c=mix(c,uWx[7],.9);
 }
 if((k&4)==4&&uRay>0.&&lit<.5){float rk=uRay*smoothstep(1.7,.9,distance(vW,uRayP)+(fbm3(vL*6.)-.5)*.6);if(rk>.5)c=fill>.5?uWx[8]:uWx[9];}
 if((k&2)==2){float g=uGlow*(.82+.18*fbm(vW.xy*3.));c=mix(uGlowC[0],mix(uGlowC[1],uGlowC[2],smoothstep(.15,.9,g)),smoothstep(.0,.25,g));}
 o0=vec4(c,1.);o1=vec4(N.xy,vId,1./gl_FragCoord.w);}`);
const P_DEPTH = prog(`layout(location=0) in vec3 aP;layout(location=2) in vec3 aM;uniform mat4 uPart[${MAXP}];uniform mat4 uVP;void main(){gl_Position=uVP*uPart[int(aM.x)]*vec4(aP,1.);}`, `out vec4 o;void main(){o=vec4(gl_FragCoord.z);}`);
// the stroke layer: one quad per stroke, billboarded in screen space, planted on a surface point with its normal
const P_STROKE = prog(`layout(location=0) in vec4 iA;layout(location=1) in vec3 iN;layout(location=2) in vec4 iB;layout(location=3) in vec2 iC;
uniform mat4 uPart[${MAXP}];uniform mat4 uVP;uniform vec2 uPr;uniform sampler2D uShadow;uniform mat4 uSVP;uniform vec3 uL;uniform float uRay;uniform vec3 uRayP;
out vec2 vU;flat out float vS;flat out float vV;flat out float vK;${SHADOW}
void main(){vec2 q=vec2(gl_VertexID&1,(gl_VertexID>>1)&1)*2.-1.;vU=q;mat4 m=uPart[int(iA.x)];vec4 w=m*vec4(iA.yzw,1.);vec3 n=normalize(mat3(m)*iN);
 float vis=sunlit(w.xyz+n*.05);vS=iB.z;vK=iB.w;float d=dot(n,uL);vV=.34+.26*d+.42*iC.y+(iB.z-.5)*.24-(1.-vis)*.14;
 if(uRay>0.)vV+=uRay*.5*smoothstep(1.5,.2,distance(w.xyz,uRayP));
 vec4 c=uVP*w;float a=iB.y;vec2 o=vec2(q.x*iB.x*cos(a)-q.y*iC.x*sin(a),q.x*iB.x*sin(a)+q.y*iC.x*cos(a));c.xy+=o*uPr;c.z-=.0015*c.w;gl_Position=c;}`,
`in vec2 vU;flat in float vS;flat in float vV;flat in float vK;layout(location=0) out vec4 o0;layout(location=1) out vec4 o1;${NOISE}
uniform vec3 uTone[5];uniform vec3 uBlade[3];uniform vec3 uPetal[4];
void main(){float k=vK;vec3 c;
 if(k<.5){float n=vn(vec2(vU.y*4.+vS*91.,vU.x*1.4+vS*37.));if(abs(vU.x)+(n-.5)*.7>1.||abs(vU.y)+(vn(vec2(vU.x*4.+vS*17.,vU.y*2.))-.5)*.7>1.)discard;if(vn(vec2(vU.y*8.+vS*53.,vU.x*.9+vS*11.))<.22)discard;
  float v=vV;c=v<.26?uTone[0]:v<.42?uTone[1]:v<.58?uTone[2]:v<.76?uTone[3]:uTone[4];}
 else if(k<1.5){float wd=1.-abs(vU.x);if(abs(vU.y)>wd*wd)discard;float v=vV;c=v<.68?uBlade[0]:v<.85?uBlade[1]:uBlade[2];}
 else{float a=atan(vU.y,vU.x)+vS*6.,r=length(vU);float pet=.55+.45*abs(cos(a*2.5));if(r>pet)discard;c=vS<.55?uPetal[0]:vS<.8?uPetal[1]:uPetal[2];if(r<.26)c=uPetal[3];}
 o0=vec4(c,1.);o1=vec4(0.,0.,1.,1./gl_FragCoord.w);}`);
// ink: edges of part id, depth and normal, with a line width that wanders and gaps where the pen lifted
const P_POST = prog(`out vec2 vT;void main(){vec2 q=vec2(gl_VertexID&1,(gl_VertexID>>1)&1);vT=q;gl_Position=vec4(q*2.-1.,0.,1.);}`,
`in vec2 vT;out vec4 o;uniform sampler2D uC;uniform sampler2D uD;uniform float uSeed;uniform vec3 uInkC;${NOISE}
float edge(ivec2 p,ivec2 d){vec4 a=texelFetch(uD,p+d,0),b=texelFetch(uD,p-d,0);float ia=a.z,ib=b.z;
 if(ia<1.5&&ib<1.5)return 0.;if((ia>.5&&ia<1.5)||(ib>.5&&ib<1.5))return 0.;if(abs(ia-ib)>.5)return 1.;
 float dz=abs(a.w-b.w)/max(a.w,.01);if(dz>.012)return 1.;return smoothstep(.55,.9,length(a.xy-b.xy));}
void main(){ivec2 p=ivec2(gl_FragCoord.xy);vec4 c=texelFetch(uC,p,0);vec2 u=vec2(p);
 float nw=vn(u*.012+uSeed),rr=1.+floor(nw*3.2);int r=int(rr);
 ivec2 dx=ivec2(r,0),dy=ivec2(0,r);float e=max(edge(p,dx),edge(p,dy));
 float keep=step(.27,vn(u*.0065+uSeed*2.+11.));float e2=e*keep;
 c.rgb=mix(c.rgb,uInkC,e2*.94);float a=max(c.a,e2);o=vec4(c.rgb*a,a);}`);
// ---- targets ----
function tex(w, h, ifmt, fmt, type, filter = gl.NEAREST) { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, null); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; }
const SM = 3072, tShadow = tex(SM, SM, gl.R32F, gl.RED, gl.FLOAT), tShadowZ = tex(SM, SM, gl.DEPTH_COMPONENT32F, gl.DEPTH_COMPONENT, gl.FLOAT), fbS = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, fbS); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tShadow, 0); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, tShadowZ, 0);
const tC = tex(GW, GH, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE), tD = tex(GW, GH, gl.RGBA32F, gl.RGBA, gl.FLOAT), tZ = tex(GW, GH, gl.DEPTH_COMPONENT32F, gl.DEPTH_COMPONENT, gl.FLOAT), fbM = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, fbM); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tC, 0); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, tD, 0); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, tZ, 0); gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
let vaoS, vaoM, nIdx = 0, nStrokes = 0;
// upload the model (GEO) and the stroke layer (STROKES, from strokes.js) once, after the project has built them
function uploadGeo() {
  vaoS = gl.createVertexArray(); gl.bindVertexArray(vaoS);
  const buf = (loc, data, n) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0); };
  buf(0, GEO.pos, 3); buf(1, GEO.nrm, 3); buf(2, GEO.meta, 3);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(GEO.idx), gl.STATIC_DRAW); nIdx = GEO.idx.length;
  vaoM = gl.createVertexArray(); gl.bindVertexArray(vaoM); const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); nStrokes = STROKES.length / 13;
  const st = 13 * 4, attr = (l, n, off) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, st, off * 4); gl.vertexAttribDivisor(l, 1); };
  // STROKES record: part,x,y,z | nx,ny,nz | len,wid,ang,seed,kind,height  ->  buffer: part,x,y,z | n | len,ang,seed,kind | wid,height
  const re = new Float32Array(STROKES.length); for (let i = 0; i < nStrokes; i++) { const o = i * 13; const [pt, x, y, z, nx, ny, nz, len, wid, ang, sd, kd, hh] = STROKES.slice(o, o + 13); re.set([pt, x, y, z, nx, ny, nz, len, ang, sd, kd, wid, hh], o); } gl.bufferData(gl.ARRAY_BUFFER, re, gl.STATIC_DRAW);
  attr(0, 4, 0); attr(1, 3, 4); attr(2, 4, 7); attr(3, 2, 11); gl.bindVertexArray(null);
}
const flat = (arr) => { const f = new Float32Array(MAXP * 16); arr.forEach((m, i) => f.set(m, i * 16)); return f; };
// render the model for one set of part matrices and one camera ({P, V}); returns the 2x GL canvas, premultiplied,
// transparent where nothing was drawn. uni: { L sun direction, glow 0..1, ray 0..1, rayP world point, seed,
// fill (direction of the sky fill, default [0,.92,.38]), shadowAt (world centre of the shadow map, default [0,2.6,.4]),
// shadowR (half-size, default 7), shadowDist (default 16) }
function renderModel(parts, cam, uni) {
  const fp = flat(parts), L = uni.L, l = Math.hypot(...L), Ln = L.map((v) => v / l), c = uni.shadowAt || [0, 2.6, .4], sd = uni.shadowDist || 16, sr = uni.shadowR || 7, eye = [c[0] + Ln[0] * sd, c[1] + Ln[1] * sd, c[2] + Ln[2] * sd];
  const SVP = M.mul(M.ortho(-sr, sr, -sr, sr, 1, 34), M.look(eye, c));
  const VP = M.mul(cam.P, cam.V), rayP = uni.rayP || [0, 0, 0], ray = uni.ray || 0;
  gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbS); gl.viewport(0, 0, SM, SM); gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(P_DEPTH.p); gl.uniformMatrix4fv(P_DEPTH.u.uPart, false, fp); gl.uniformMatrix4fv(P_DEPTH.u.uVP, false, SVP); gl.bindVertexArray(vaoS); gl.drawElements(gl.TRIANGLES, nIdx, gl.UNSIGNED_INT, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbM); gl.viewport(0, 0, GW, GH);
  gl.clearBufferfv(gl.COLOR, 0, new Float32Array([0, 0, 0, 0])); gl.clearBufferfv(gl.COLOR, 1, new Float32Array([0, 0, 0, 1e4])); gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tShadow);
  gl.useProgram(P_SOLID.p); const u = P_SOLID.u; gl.uniformMatrix4fv(u.uPart, false, fp); gl.uniformMatrix4fv(u.uVP, false, VP); gl.uniformMatrix4fv(u.uSVP, false, SVP); gl.uniform1i(u.uShadow, 0); gl.uniform3fv(u.uL, Ln); gl.uniform1f(u.uGlow, uni.glow || 0); gl.uniform1f(u.uRay, ray); gl.uniform3fv(u.uRayP, rayP); gl.uniform3fv(u.uFill, uni.fill || [0, .92, .38]);
  gl.uniform3fv(u.uMat, INK.mat); gl.uniform1iv(u.uKind, INK.kind); gl.uniform3fv(u.uWx, INK.wx); gl.uniform3fv(u.uGlowC, INK.glow);
  gl.drawElements(gl.TRIANGLES, nIdx, gl.UNSIGNED_INT, 0);
  gl.useProgram(P_STROKE.p); const v = P_STROKE.u; gl.uniformMatrix4fv(v.uPart, false, fp); gl.uniformMatrix4fv(v.uVP, false, VP); gl.uniformMatrix4fv(v.uSVP, false, SVP); gl.uniform1i(v.uShadow, 0); gl.uniform3fv(v.uL, Ln); gl.uniform2f(v.uPr, cam.P[0], cam.P[5]); gl.uniform1f(v.uRay, ray); gl.uniform3fv(v.uRayP, rayP);
  gl.uniform3fv(v.uTone, INK.tones); gl.uniform3fv(v.uBlade, INK.blades); gl.uniform3fv(v.uPetal, INK.petals);
  gl.bindVertexArray(vaoM); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, nStrokes);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, GW, GH); gl.disable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(P_POST.p); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tC); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tD); gl.uniform1i(P_POST.u.uC, 0); gl.uniform1i(P_POST.u.uD, 1); gl.uniform1f(P_POST.u.uSeed, uni.seed || 0); gl.uniform3fv(P_POST.u.uInkC, INK.ink); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.bindVertexArray(null);
  return { c: glc, VP };
}
