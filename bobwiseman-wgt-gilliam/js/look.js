// THE LOOK: 1970s cut-out animation shot on 16mm, in the manner of Terry Gilliam's Python work.
// The pieces arrive already finished (engraved, hand tinted, cut out, shadowed: see gilliam.js), so the
// shader only plays the camera and the stock: a hair of gate weave, faint 16mm softness, film grain on
// every frame, a breathing exposure flicker and a light vignette. Keep it subtle.
//   fx({ flash })  wash to paper white (a cut gag)
//   fx({ shake })  extra weave for a yell or a slam (0..1)
const LOOK = {
  span: [206, 245],
  frag: `
uniform float flash, shake, fr;
void main(){
  float k = floor(fr);                                                   // one value per film frame
  vec2 wv = (vec2(h21(vec2(k, 3.)), h21(vec2(k, 11.))) - .5) * vec2(.0009, .0013) * (1. + shake * 6.);
  vec2 q = uv + wv;
  vec3 c = texture(src, q).rgb;
  vec3 b = textureLod(src, q, 1.2).rgb;                                  // 16mm softness: a little of the next mip
  c = mix(c, b, .28);
  vec3 h = textureLod(src, q, 4.).rgb;                                   // halation on the bright sky
  c += max(h - .72, 0.) * vec3(.22, .14, .08);
  float g = vn(uv * res * .55 + k * 37.1) * .6 + vn(uv * res * 1.3 + k * 91.7) * .4;
  c += (g - .5) * .075;                                                  // grain, new every frame
  c *= .975 + .05 * h21(vec2(k, 7.));                                    // exposure flicker
  c = pow(c, vec3(1.02, 1., .97));                                       // the stock leans warm
  vec2 v = (uv - .5) * vec2(1., .8); c *= 1. - dot(v, v) * .42;
  float dust = step(.99993, h21(floor(uv * res / 3.) + k * 13.1));        // the odd speck of dust
  c = mix(c, vec3(.12, .1, .08), dust * .7);
  c = mix(c, vec3(.96, .93, .86), flash);
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0, shake: X.shake ?? 0, fr: Math.floor(t * 24 + 1e-4) }),
};
