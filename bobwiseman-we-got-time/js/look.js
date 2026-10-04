// THE LOOK: the ministry. Brazil's ideas, none of its scenes: a 1940s office grown into a machine
// (ducts, tubes, numbers), a man made small and kept waiting, and the sky as the only colour.
// Ink line over flat greys on cream; the shader boils the line on twos, lays it on newsprint, crushes
// colour toward grey and slips the print register a hair. Two colours are let through on purpose:
//   sky (blue) = the way out, always kept;  rose (warm red) = her, kept by the `rose` uniform.
// Per shot: fx({ sat }) lifts the whole picture's colour (0.32 grey world ... 1 full colour, the end).
const LOOK = {
  span: [0, DUR],
  frag: `
uniform float boil, sky, rose, sat, flash, pencil;
void main(){
  vec2 q = uv + fbm2(uv * vec2(14., 8.) + tq * 3.1) * .0011 * boil;      // the line re-drawn on twos
  vec3 c = texture(src, q).rgb;
  vec3 cr = texture(src, q + vec2(.0009, .0004)).rgb;                    // slipped register on the red plate
  c.r = mix(c.r, cr.r, .6);
  float lum = dot(c, vec3(.3, .59, .11));
  float blue = smoothstep(.04, .2, c.b - max(c.r, c.g)) * sky;           // the sky keeps its colour
  float red = smoothstep(.1, .3, c.r - max(c.g, c.b)) * rose;            // so does she
  c = mix(mix(vec3(lum), c, sat), c, max(blue, red));
  float fib = vn(uv * res * .25) * .5 + vn(uv * res * .06 + 3.) * .5;
  vec3 paper = vec3(.95, .925, .86) * (.95 + .05 * fib);
  c *= paper / vec3(.95);
  c *= .93 + .07 * vn(uv * res * .9 + tq * 91.);                         // grain, on twos
  vec2 pr = mat2(.8, -.6, .6, .8) * uv * res;                             // coloured-pencil strokes on the tooth
  c *= 1. - pencil * .07 * smoothstep(.45, .9, vn(pr * vec2(.9, .07)) * .7 + vn(uv * res * .5) * .3);
  vec2 v = (uv - .5) * vec2(1., .7); c *= 1. - dot(v, v) * .55;
  c = mix(c, vec3(.97, .95, .9), flash);
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ boil: X.boil ?? 1, sky: X.sky ?? 1, rose: X.rose ?? 1, sat: X.sat ?? .32, flash: X.flash ?? 0, pencil: window.PNC_ON ? 1 : 0 }),
};
