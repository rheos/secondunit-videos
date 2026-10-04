// THE LOOK: silhouette cut-paper on a light box, after Lotte Reiniger (Prince Achmed, 1926).
// The 2D frame arrives already toned (each shot picks its tint). The shader is the film:
// gate weave, the light box flickering frame to frame, the backlight bleeding over the paper
// edges (halation), fine grain, a few specks of dust, and a heavy iris-like vignette.
const LOOK = {
  span: [71.0, 91.0],
  frag: `
uniform float flash, weave;
void main(){
  float fr = floor(t * 24. + .001);
  vec2 jit = (vec2(h21(vec2(fr, 3.)), h21(vec2(fr, 7.))) - .5) * vec2(.0014, .0022) * weave;
  jit += vec2(sin(t * 1.3), cos(t * .9)) * .0006 * weave;
  vec2 q = uv + jit;
  vec3 c = texture(src, q).rgb;
  vec3 bl = textureLod(src, q, 4.).rgb, bl2 = textureLod(src, q, 6.).rgb;
  c += max(bl - c, 0.) * .2 + max(bl2 - c, 0.) * .12;                    // backlight bleeding over paper edges
  c *= 1. + (h21(vec2(fr, 11.)) - .5) * .07;                              // light-box flicker
  c *= .93 + .12 * vn(uv * vec2(2.2, 1.6) + vec2(t * .07, 0.));           // uneven illumination
  float g = h21(uv * res + vec2(fr * 131., fr * 77.)) + h21(uv * res * .5 + vec2(fr * 17., 3.));
  c += (g - 1.) * .035;                                                    // grain
  for (int i = 0; i < 3; i++) {                                            // dust
    float fi = float(i);
    vec2 dp = vec2(h21(vec2(fr, 20. + fi)), h21(vec2(fr, 40. + fi)));
    float on = step(.55, h21(vec2(fr, 60. + fi)));
    float d = length((uv - dp) * vec2(res.x / res.y, 1.));
    c *= 1. - on * .55 * smoothstep(.0035 + .002 * fi, .0012, d);
  }
  vec2 v = (uv - .5) * vec2(1., .82); c *= 1. - pow(dot(v, v) * 1.9, 1.6) * .75;
  c = mix(c, vec3(1., .97, .9), flash);
  o = vec4(max(c, 0.), 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0, weave: X.weave ?? 1 }),
};
