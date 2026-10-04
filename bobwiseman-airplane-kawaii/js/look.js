// THE LOOK: kawaii watercolour cartoon. Two layers come in: `src` is the paint (flat pastel fills),
// `ink` is the black felt-marker line drawn on its own transparent canvas. The paint becomes a wash on
// cold-press paper: pigment pools at the drying edge, mottles, granulates, creeps a little into damp
// paper and blooms. The ink sits on top, crisp, re-drawn on twos, with felt-tip density and tooth skips.
// The wash pass is adapted from the Gemma Luna water probe (gemmaluna-clap-hands/js/looks/water.js).
// FX: wet (bleed amount), runs (pigment sliding down), hue (rotates the paint, radians), boil (ink wobble),
// seed (moves the paper/mottle pattern per shot), flash (paper-white flash).
const LOOK = {
  span: [71.0, 91.0],
  frag: `
uniform float wet, runs, hue, boil, seed, flash, mottle;
vec3 A(vec3 c){ return -log(max(c, vec3(.03))); }
vec3 hueRot(vec3 c, float a){
  const vec3 k = vec3(.57735);
  float ca = cos(a), sa = sin(a);
  return c * ca + cross(k, c) * sa + k * dot(k, c) * (1. - ca);
}
vec3 P(vec2 p, float lod){ vec3 c = textureLod(src, p, lod).rgb; return hue != 0. ? clamp(hueRot(c, hue), 0., 1.) : c; }
void main(){
  float ts = tq * .37;
  vec2 big = fbm2(uv * vec2(3.2, 5.6) + seed);
  vec2 q = uv + big * .004 * (.4 + wet) + fbm2(uv * vec2(30., 52.) + ts) * .0011 + vec2(0., -.012 * runs * fbm(uv * vec2(40., 3.) + seed));
  vec3 a0 = A(P(q, 0.));
  vec3 a1 = A(P(q, 1.6));
  vec2 qw = q + big * .02 * wet + vec2(0., -.008 * runs); float rad = .008 + .02 * wet; vec3 aw = vec3(0.);
  for (int i = 0; i < 10; i++) { float an = float(i) * 2.39996 + seed, r = sqrt((float(i) + .5) / 10.) * rad; aw += A(P(qw + vec2(cos(an), sin(an) * .5625) * r, 3.)); }
  aw /= 10.;
  float front = smoothstep(.4, .8, fbm(uv * vec2(9., 15.) + seed * 2.) + wet * .3);
  vec3 a = a0 + max(aw - a0, 0.) * front * (.25 + wet * .8);
  a += max(a0 - a1, 0.) * 1.8;                                          // pigment pools at the drying edge
  a *= 1. - mottle * .28 + mottle * .56 * fbm(uv * vec2(4., 7.) + seed * 5. + ts * .1);   // a wash is never flat
  float br = fbm(uv * vec2(6., 10.) + seed * 3.1);                      // cauliflower back-runs
  a *= 1. + smoothstep(.03, 0., abs(br - .52)) * (.15 + wet * .3) * smoothstep(.1, .4, a.r + a.g + a.b);
  float gr = vn(uv * res * .38 + seed) * .6 + vn(uv * res * .12 + 7.) * .4;
  a *= .88 + .26 * gr;                                                  // granulation
  float fib = vn(uv * res * .22) * .5 + vn(uv * res * .05 + 3.) * .5, tooth = vn(uv * res * .45);
  a *= 1. - smoothstep(.72, 1., tooth) * .3;
  vec3 paper = vec3(.975, .955, .915) * (.95 + .05 * fib);
  vec3 col = paper * exp(-a);
  // the marker line, on twos
  vec2 qi = uv + fbm2(uv * vec2(22., 13.) + tq * 2.3) * .0007 * boil;
  vec4 ik = texture(ink, qi);
  float ia = ik.a;
  ia *= .86 + .14 * fbm(uv * res * vec2(.02, .05) + 11.);              // felt-tip density
  ia *= 1. - smoothstep(.8, 1., tooth) * .35;                           // the tip skips on the tooth
  vec3 ic = ik.rgb * vec3(.97, .96, .98);
  col = mix(col, ic, clamp(ia * 1.05, 0., 1.));
  vec2 v = uv - .5; col *= 1. - dot(v, v) * .22;
  col = mix(col, paper, flash);
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => ({ wet: X.wet ?? .35, runs: X.runs ?? 0, hue: X.hue ?? 0, boil: X.boil ?? 1, seed: X.seed ?? 1, flash: X.flash ?? 0, mottle: X.mottle ?? 1 }),
};
