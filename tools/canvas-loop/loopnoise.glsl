// loopnoise.glsl: noise that loops exactly, for WebGL Canvas loops. The GLSL twin of loopnoise.js.
//
// The loop trick is Leon Lin's, from lumenshaders js/shaders.js (MIT, Copyright (c) 2026 Leonxlnx; notice in
// LICENSE-lumenshaders.md):  vec2 LT(){ return vec2(cos(TAU*u_phase), sin(TAU*u_phase)) * u_travel; }
// He adds LT() to a 2D fbm lookup, which on its own slides the field round a small circle. Here the circle
// goes in the 3rd and 4th axes of 4D simplex noise, so the field changes shape as well. Phase 1 is the same
// point as phase 0, so the last frame runs into the first.
//
// Paste after your precision line. Drive it with one uniform:  u_phase = mod(t, LOOP) / LOOP  in [0, 1).
//   float n = loopNoise2(uv * 3.0, u_phase, 0.6, 1.0);        // field, -1..1
//   float f = loopFbm2(uv * 3.0, u_phase, 0.6, 1.0, 4);        // fbm, roughly -1..1
//   vec2  w = vec2(loopNoise1(u_phase, 0.6, 2.0), loopNoise1(u_phase, 0.6, 3.0)); // camera wander
// radius = how far the lookup travels per loop (0.3 slow drift, 1 lively). seed = any float; keep it small
// (under 100) so the offsets stay inside float precision. Values match loopnoise.js in shape, not bit for bit:
// the JS side uses simplex-noise 4.0.1 through RNoise, this side uses the Ashima/Gustavson simplex below.
//
// snoise(vec4) from webgl-noise (noise4D.glsl), by Ian McEwan and Stefan Gustavson, MIT:
//   Copyright (C) 2011 by Ashima Arts (Simplex noise)
//   Copyright (C) 2011-2016 by Stefan Gustavson (Classic noise and others)
//   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
//   associated documentation files (the "Software"), to deal in the Software without restriction, including
//   without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//   copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
//   following conditions: The above copyright notice and this permission notice shall be included in all
//   copies or substantial portions of the Software.
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
//   LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
//   EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
//   IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
//   THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//   https://github.com/stegu/webgl-noise

vec4 ln_mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float ln_mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 ln_permute(vec4 x) { return ln_mod289(((x * 34.0) + 10.0) * x); }
float ln_permute(float x) { return ln_mod289(((x * 34.0) + 10.0) * x); }
vec4 ln_taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float ln_taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }

vec4 ln_grad4(float j, vec4 ip) {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p, s;
  p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz * 2.0 - 1.0) * s.www;
  return p;
}

float snoise4(vec4 v) {
  const vec4 C = vec4(0.138196601125011,    // (5 - sqrt(5))/20  G4
                      0.276393202250021,    // 2 * G4
                      0.414589803375032,    // 3 * G4
                     -0.447213595499958);   // -1 + 4 * G4
  const float F4 = 0.309016994374947451;     // (sqrt(5) - 1)/4
  vec4 i  = floor(v + dot(v, vec4(F4)));
  vec4 x0 = v - i + dot(i, C.xxxx);
  vec4 i0;
  vec3 isX = step(x0.yzw, x0.xxx);
  vec3 isYZ = step(x0.zww, x0.yyz);
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;
  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;
  vec4 i3 = clamp(i0, 0.0, 1.0);
  vec4 i2 = clamp(i0 - 1.0, 0.0, 1.0);
  vec4 i1 = clamp(i0 - 2.0, 0.0, 1.0);
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz;
  vec4 x4 = x0 + C.wwww;
  i = ln_mod289(i);
  float j0 = ln_permute(ln_permute(ln_permute(ln_permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = ln_permute(ln_permute(ln_permute(ln_permute(
              i.w + vec4(i1.w, i2.w, i3.w, 1.0))
            + i.z + vec4(i1.z, i2.z, i3.z, 1.0))
            + i.y + vec4(i1.y, i2.y, i3.y, 1.0))
            + i.x + vec4(i1.x, i2.x, i3.x, 1.0));
  vec4 ip = vec4(1.0 / 294.0, 1.0 / 49.0, 1.0 / 7.0, 0.0);
  vec4 p0 = ln_grad4(j0, ip);
  vec4 p1 = ln_grad4(j1.x, ip);
  vec4 p2 = ln_grad4(j1.y, ip);
  vec4 p3 = ln_grad4(j1.z, ip);
  vec4 p4 = ln_grad4(j1.w, ip);
  vec4 norm = ln_taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  p4 *= ln_taylorInvSqrt(dot(p4, p4));
  vec3 m0 = max(0.6 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3, x3), dot(x4, x4)), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * (dot(m0 * m0, vec3(dot(p0, x0), dot(p1, x1), dot(p2, x2)))
               + dot(m1 * m1, vec2(dot(p3, x3), dot(p4, x4))));
}

// ---- the loop ----
const float LN_TAU = 6.28318530717959;

// 2D field that loops: 4D noise at (p, R cos 2*pi*phase, R sin 2*pi*phase). -1..1.
float loopNoise2(vec2 p, float phase, float radius, float seed) {
  float a = LN_TAU * phase;
  return snoise4(vec4(p + seed * vec2(13.17, 7.31), radius * cos(a), radius * sin(a)));
}

// One value that loops, for drifting a parameter. -1..1.
float loopNoise1(float phase, float radius, float seed) {
  return loopNoise2(vec2(17.31, -4.77), phase, radius, seed);
}

// fbm of loopNoise2. Each octave doubles the whole 4D point, circle included, so detail moves faster than
// the big shapes. octaves up to 8. Roughly -1..1.
float loopFbm2(vec2 p, float phase, float radius, float seed, int octaves) {
  float a = LN_TAU * phase;
  vec2 cs = radius * vec2(cos(a), sin(a));
  vec2 q = p + seed * vec2(13.17, 7.31);
  float sum = 0.0, amp = 1.0, norm = 0.0, f = 1.0;
  for (int o = 0; o < 8; o++) {
    if (o >= octaves) break;
    sum += amp * snoise4(vec4(q * f + float(o) * vec2(31.7, -17.3), cs * f));
    norm += amp; amp *= 0.5; f *= 2.0;
  }
  return sum / norm;
}
