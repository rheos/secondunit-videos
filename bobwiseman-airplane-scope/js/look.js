// THE LOOK: a 1960s lab oscilloscope. The 2D frame arrives as beam intensity (red = green P31 phosphor,
// green = amber phosphor); this pass gives it the tube: phosphor colour with white-hot cores, halation built
// from the mip chain, dark faceplate glass that catches the picture's own light, an etched graticule,
// a slightly bulged rounded-square tube in a dull metal bezel, mains hum, and sync loss (tear + roll).
const LOOK = {
  span: [71.0, 91.0],
  frag: `
uniform float sync, roll, grat, flash, hum, lodOff;
float sup(vec2 p, vec2 r, float n){ vec2 q = abs(p) / r; return pow(pow(q.x, n) + pow(q.y, n), 1. / n); }
vec2 glow(vec2 q){
  vec2 g = textureLod(src, q, 1. + lodOff).rg * .5;
  g += textureLod(src, q, 2.5 + lodOff).rg * .75;
  g += textureLod(src, q, 4. + lodOff).rg * .95;
  vec2 e = vec2(.004, .007);
  g += (textureLod(src, q + e, 5.5 + lodOff).rg + textureLod(src, q - e, 5.5 + lodOff).rg + textureLod(src, q + vec2(e.x, -e.y), 5.5 + lodOff).rg + textureLod(src, q - vec2(e.x, -e.y), 5.5 + lodOff).rg) * .3;
  return g;
}
void main(){
  float asp = res.x / res.y;
  vec2 c = (uv - .5) * vec2(asp, 1.);
  float d = sup(c, vec2(.835, .478), 3.2);                     // 1 at the tube edge
  vec2 q = .5 + (uv - .5) * (1. - .028 * d * d);                // faceplate bulge
  float row = floor(q.y * res.y / 3.);
  q.x += sync * ((vn(vec2(row * .07, floor(t * 40.) * 3.1)) - .5) * .14 + .05 * sin(q.y * 13. + t * 41.));   // lost horizontal sync
  q.x += hum * .0007 * sin(q.y * 18.85 + t * 8.2);             // mains hum wobble
  q.y = fract(q.y + roll);                                      // vertical roll
  vec2 s0 = texture(src, q).rg;
  vec2 g = glow(q);
  vec3 GR = vec3(.3, 1., .38), AM = vec3(1., .56, .1);
  vec3 col = GR * (s0.r * 1.05 + g.r * .8) + AM * (s0.g * 1.05 + g.g * .8);
  col += vec3(.7, .85, .7) * smoothstep(.5, 1., s0.r) * .55 + vec3(1., .88, .65) * smoothstep(.5, 1., s0.g) * .55;   // white-hot beam cores
  vec2 amb = textureLod(src, vec2(.5), 10.).rg;
  vec3 glass = vec3(.010, .017, .013) + (GR * amb.r + AM * amb.g) * .35;
  float cell = .95 / 8.;                                        // graticule: 8 divisions high, minor ticks on the axes
  vec2 gq = c / cell, fg = abs(fract(gq + .5) - .5) * cell * res.y;
  float gl = max(1. - smoothstep(.3, 1.3, fg.x), 1. - smoothstep(.3, 1.3, fg.y));
  vec2 ft = abs(fract(gq * 5. + .5) - .5) * cell / 5. * res.y;
  float tk = cell * .06;
  float ticks = (1. - smoothstep(.3, 1.3, ft.x)) * step(abs(c.y), tk) + (1. - smoothstep(.3, 1.3, ft.y)) * step(abs(c.x), tk);
  float gr = clamp(gl * .6 + ticks * .8, 0., 1.) * grat;
  col = glass + col + vec3(.45, .6, .5) * gr * (.5 + 2.5 * (g.r + g.g));
  col *= .95 + .05 * vn(uv * res * .8 + tq * 131.);
  col *= 1. - .35 * pow(d, 7.);
  col += GR * flash * .4;
  float inside = 1. - smoothstep(.985, 1., d);
  vec3 bez = vec3(.03, .032, .031) * (1. - .55 * clamp((d - 1.) * 2.5, 0., 1.)) * (.85 + .15 * vn(uv * res * .5));
  bez += (GR * amb.r + AM * amb.g) * .5 * exp(-(d - 1.) * 35.);
  bez += vec3(.07, .075, .072) * exp(-abs(d - 1.018) * 220.);
  col = mix(bez, col, inside);
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => ({ sync: X.sync ?? 0, roll: X.roll ?? 0, grat: X.grat ?? .16, flash: X.flash ?? 0, hum: X.hum ?? 1, lodOff: Math.log2(RS) }),
};
