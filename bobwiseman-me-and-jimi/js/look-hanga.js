// THE LOOK (Kobe): a Japanese woodblock print in the shin-hanga manner. Water-based pigment, not ink:
// the 2D pass draws flat colour blocks, soft gradient skies (bokashi, drawn as real gradients) and thin
// dark keylines. This shader turns that into a pulled print:
//   - colour blocks sit a couple of pixels off the keyline (registration), re-pulled on threes
//   - pigment pools at the edge of each block (a darker rim) and mottles where the baren rubbed
//   - wood grain shows in the broad blocks, washi fibres in the paper
//   - keylines (anything near-black) print from their own block and stay crisp
// FX: flash (blank washi), fade (0..1 to blank washi, for the window portal), grain (extra wood grain).
const LOOK = {
  span: [40.5, 77.6],
  frag: `
uniform float flash, fade, tb3, grainX;
void main(){
  vec2 D = vec2(1920., 1080.);
  vec2 P = uv * D;
  float tb = tb3;
  vec2 reg = vec2(3., 2.) + (vec2(h21(vec2(tb * 53., 1.)), h21(vec2(tb * 53., 2.))) - .5) * 1.5;
  vec2 w = fbm2(P * .004 + tb * 2.1) * .8;
  vec3 key = texture(src, uv + w / D).rgb;
  vec3 c = texture(src, uv + (w + reg) / D).rgb;
  vec3 cb = textureLod(src, uv + (w + reg) / D, 3.).rgb;
  float kl = 1. - smoothstep(.10, .22, max(key.r, max(key.g, key.b)));     // the keyline block
  // pigment pools at block edges: where the sharp colour differs from its blur, darken a little
  float rim = clamp(length(c - cb) * 2.2, 0., 1.);
  vec3 col = c * (1. - rim * .16);
  // baren mottling and wood grain, stronger in big flat areas
  float flat_ = 1. - clamp(length(c - cb) * 6., 0., 1.);
  float mot = fbm(P * .02 + tb * 5.) - .5;
  float grain = vn(P * vec2(.003, .11) + vec2(fbm(P * .006) * 5., 0.)) - .5;
  col *= 1. + mot * .10 * flat_ + grain * (.07 + grainX * .1) * flat_;
  // washi: warm off-white with fibres; the pigment sits in it (multiply-ish)
  float fib = vn(P * vec2(.6, .08) + 4.) * .5 + vn(P * vec2(.08, .5) + 9.) * .5;
  vec3 washi = vec3(.955, .93, .87) * (.96 + .05 * fib);
  col = col * washi / vec3(.955, .93, .87);
  col = mix(col, vec3(.13, .12, .14), kl * (.85 + .15 * vn(P * .4 + tb * 11.)));
  col = mix(col, washi, max(flash, fade));
  // margin
  vec2 m = min(P, D - P); float dm = min(m.x, m.y) + (vn(P * .05) - .5) * 3.;
  col = mix(washi, col, smoothstep(17., 19., dm));
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0, fade: X.fade ?? 0, tb3: Math.floor(t * 8 + 1e-6) / 8, grainX: X.grain ?? 0 }),
};
