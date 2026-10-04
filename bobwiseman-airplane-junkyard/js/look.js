// THE LOOK: junkyard collage (Zappa-era record sleeve, Cal Schenkel's method, none of his images).
// Torn found paper, newsprint, kraft, halftone poster, rusted tin, shot in stop motion on twos.
// Ported from the Gemma Luna junkyard probe at Robin's request (2026-10-03).
const LOOK = {
  span: [70.5, 91.0],
  frag: `
uniform float flick, seed;
void main(){
  float k = floor(tq * 12. + .5);                       // one exposure per drawing
  vec2 mis = vec2(h21(vec2(k, 1.)) - .5, h21(vec2(k, 2.)) - .5) * .0012;
  vec3 c = vec3(texture(src, uv + mis).r, texture(src, uv).g, texture(src, uv - mis).b);
  float grain = vn(uv * res * .5 + k * 13.) - .5;
  c *= 1. + grain * .07;
  c *= .97 + .06 * fbm(uv * vec2(3., 5.) + seed);         // uneven light on the table
  c *= 1. + (h21(vec2(k, 7.)) - .5) * flick;            // exposure flicker between frames
  float dust = step(.9993, h21(floor(uv * res * .5) + k * 31.));
  c = mix(c, vec3(.1), dust * .7);
  vec2 v = uv - .5; c *= 1. - dot(v, v) * .55;
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ flick: X.flick ?? .05, seed: X.seed ?? 1 }),
};

