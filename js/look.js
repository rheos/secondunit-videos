// THE LOOK: printed paper under a rostrum camera. Every drawing (12 a second) gets its own
// misregistration nudge, exposure flicker and grain, the way a stop-motion frame does. A faint
// halftone screen and a warm paper cast tie the photo cut-outs and the cartoon plane together.
const LOOK = {
  span: [71.0, 91.0],
  frag: `
uniform float flash;
void main(){
  float d = floor(t * 12.);
  vec2 mis = (vec2(h21(vec2(d, 3.)), h21(vec2(d, 9.))) - .5) * .0016;            // plates drift a hair per drawing
  vec3 c = vec3(texture(src, uv + vec2(.0009, .0002) + mis).r, texture(src, uv).g, texture(src, uv - vec2(.0006, .0005) - mis).b);
  float lum = dot(c, vec3(.3, .59, .11));
  vec2 p = mat2(.7071, -.7071, .7071, .7071) * (uv * res);                       // 45 degree halftone screen
  float dotv = length(fract(p / 4.2) - .5);
  c *= 1. - .10 * smoothstep(.18, .48, dotv) * (1. - lum);
  c = mix(c, c * vec3(1.05, 1.0, .88) + vec3(.02, .015, 0.), .55);               // warm paper cast
  c *= .95 + .07 * vn(uv * res * .9 + d * 13.);                                   // paper tooth, new each drawing
  c *= .965 + .05 * fbm(uv * vec2(3., 2.) + d * .01);                             // uneven table light
  c *= 1. + .035 * (h21(vec2(d, 21.)) - .5);                                      // exposure flicker
  vec2 v = uv - .5; c *= 1. - dot(v, v) * .55;
  c = mix(c, vec3(1., .97, .9), flash);
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0 }),
};
