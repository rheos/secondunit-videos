// THE LOOK (Kobe, v3): sumi-e, ink wash on rice paper, with one red: the seal, and her.
// The 2D pass paints in ink only: greys on white (black = full-strength ink, light grey = a dilute wash),
// plus pure red (#ff0000) for the vermilion accents. The shader turns that into ink on paper:
//   - ink bleeds into the paper: soft edges feathered by noise, so no edge is a vector edge
//   - wet edges: a wash dries darker at its rim
//   - granulation and paper absorption break up every wash; fibres show in the bare paper
//   - the red prints as cinnabar seal paste, a touch off and blotchy
// FX: fade (to bare paper), bleed (extra feathering, 0..1).
const LOOK = {
  span: [43.0, 77.6],
  frag: `
uniform float fade, bleed, tb3;
void main(){
  vec2 D = vec2(1920., 1080.);
  vec2 P = uv * D;
  vec2 w = fbm2(P * .012 + tb3 * .9) * (4. + bleed * 4.) + fbm2(P * .08) * 1.5;
  vec3 c = texture(src, uv + w / D).rgb;
  vec3 b1 = textureLod(src, uv + w / D, 2.).rgb, b2 = textureLod(src, uv + w / D, 3.6).rgb;
  float red = clamp((c.r - c.g) * 1.4, 0., 1.);
  float lum = dot(c, vec3(.3, .59, .11)), lb1 = dot(b1, vec3(.3, .59, .11)), lb2 = dot(b2, vec3(.3, .59, .11));
  float d = (1. - lum) * (1. - red), d1 = (1. - lb1), d2 = (1. - lb2);
  // bleed: the ink creeps outward where the paper drinks it, by noise
  float creep = smoothstep(.35, .75, fbm(P * .03 + tb3 * .3));
  float dd = max(d, d1 * (.7 + .3 * creep) * step(.02, d1));
  dd = max(dd, d2 * .22 * creep);
  // wet edge: a wash's rim dries darker
  float rim = clamp((d - d2) * 1.6, 0., 1.) * step(.08, d) * (1. - smoothstep(.75, .95, d));
  dd = clamp(dd + rim * .18, 0., 1.);
  // granulation and absorption
  float gran = vn(P * 1.1 + 3.) * .55 + vn(P * .35 + 9.) * .45;
  dd *= .82 + .32 * gran;
  dd *= 1. - smoothstep(.62, .9, vn(P * vec2(.08, .5) + 4.)) * .12;
  // paper
  float fib = vn(P * vec2(.7, .06) + 2.) * .5 + vn(P * vec2(.06, .7) + 6.) * .5;
  vec3 paper = vec3(.955, .935, .885) * (.965 + .05 * fib);
  vec3 ink = vec3(.075, .072, .085);
  vec3 col = mix(paper, ink, clamp(dd, 0., 1.));
  // cinnabar
  float r = smoothstep(.2, .6, red) * (.78 + .3 * vn(P * .25 + 5.));
  col = mix(col, vec3(.78, .2, .14), clamp(r, 0., 1.));
  col = mix(col, paper, fade);
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => ({ fade: X.fade ?? 0, bleed: X.bleed ?? 0, tb3: Math.floor(t * 8 + 1e-6) / 8 }),
};
