// Hokusai-wave variant of look-hanga2: same print, grain and mottle kept fine so the big flat blues stay clean.
// THE LOOK (Kobe): a Japanese woodblock print in the shin-hanga manner. Water-based pigment, not ink:
// the 2D pass draws flat colour blocks, soft gradient skies (bokashi, drawn as real gradients) and thin
// dark keylines. This shader turns that into a pulled print:
//   - colour blocks sit a couple of pixels off the keyline (registration), re-pulled on threes
//   - pigment pools at the edge of each block (a darker rim) and mottles where the baren rubbed
//   - wood grain shows in the broad blocks, washi fibres in the paper
//   - keylines (anything near-black) print from their own block and stay crisp
// FX: flash (blank washi), fade (0..1 to blank washi, for the window portal), grain (extra wood grain).
// v2 (2026-10-04, after Robin: "looks nothing like woodblock"): every print effect pushed until it is
// visible at 720p: heavy wood grain and baren mottle in the flats, granulated pigment, washi fibres,
// transparent pigment over the paper, keylines that break where the block was under-inked.
const LOOK = {
  span: [58.23, 66.07],
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
  float rim = clamp(length(c - cb) * 2.6, 0., 1.);
  vec3 col = c * (1. - rim * .22);
  // baren mottling and wood grain, stronger in big flat areas
  float flat_ = 1. - clamp(length(c - cb) * 6., 0., 1.);
  float mot = fbm(P * .02 + tb * 5.) - .5;
  float grain = vn(P * vec2(.003, .11) + vec2(fbm(P * .006) * 5., 0.)) - .5;
  float gran = vn(P * .9 + tb * 23.) - .5;
  col *= 1. + mot * .12 * flat_ + grain * (.10 + grainX * .1) * flat_ + gran * .05;
  // washi: warm off-white with fibres; the pigment sits in it (multiply-ish)
  float fib = vn(P * vec2(.6, .08) + 4.) * .5 + vn(P * vec2(.08, .5) + 9.) * .5;
  float thread = smoothstep(.78, .9, vn(P * vec2(.9, .05) + 2.)) + smoothstep(.8, .92, vn(P * vec2(.05, .9) + 7.));
  vec3 washi = vec3(.94, .905, .82) * (.95 + .07 * fib) + thread * .035;
  col = mix(washi, col * washi / vec3(.94, .905, .82), .88);          // transparent water-based pigment: paper shows through
  float starve = smoothstep(.62, .8, vn(P * .2 + tb * 9.));
  col = mix(col, vec3(.16, .14, .15), kl * (1. - starve * .75) * (.8 + .2 * vn(P * .5 + tb * 11.)));
  col = mix(col, washi, max(flash, fade));
  // margin
  vec2 m = min(P, D - P); float dm = min(m.x, m.y) + (vn(P * .05) - .5) * 3.;
  col = mix(washi, col, smoothstep(17., 19., dm));
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0, fade: X.fade ?? 0, tb3: Math.floor(t * 8 + 1e-6) / 8, grainX: X.grain ?? 0 }),
};
