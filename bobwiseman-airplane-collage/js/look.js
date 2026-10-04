// THE LOOK: a 1968 avant-garde sleeve collage that won't hold still. Halftone print grain, a hair of
// misregistration, uneven light on the table. The melting happens in the shot code, not here.
const LOOK = {
  span: [71.0, 81.0],
  frag: `
uniform float melt;
void main(){
  vec2 q = uv + fbm2(uv * vec2(3., 2.) + t * .4) * .004 * melt;                 // the print itself goes soft while it melts
  vec3 c = vec3(texture(src, q + vec2(.0012, 0.)).r, texture(src, q).g, texture(src, q - vec2(.0008, .0004)).b);
  float lum = dot(c, vec3(.3, .59, .11));
  vec2 g = uv * res / 5.; float dotv = length(fract(g) - .5);                    // a faint halftone screen over everything
  c *= 1. - .07 * smoothstep(.15, .45, dotv) * (1. - lum);
  c *= .94 + .06 * vn(uv * res * .8 + floor(t * 12.) * 7.);
  c *= .96 + .06 * fbm(uv * vec2(2., 3.));
  vec2 v = uv - .5; c *= 1. - dot(v, v) * .5;
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ melt: X.melt ?? 0 }),
};
