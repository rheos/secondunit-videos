// THE LOOK: a hand-carved relief print (woodcut / linocut), black ink plus one red plate on rough paper.
// The 2D pass draws in three flat values only: pure black (ink), pure white (cut away), pure red (#f00,
// the accent plate). This shader turns them into a pulled print:
//   - every edge is thresholded against noise, so carved edges come out ragged and hard (no greys)
//   - the noise is reseeded on threes (8 per second), as if each frame were a new pull of the block
//   - ink coverage is uneven: paper tooth shows through, the pressure sags across the sheet,
//     and the wood grain of the block leaves faint pale streaks in the solids
//   - the red plate sits a couple of pixels off register
//   - a paper margin and the block's own black edge frame the picture
// FX: inv (0..1, white-on-black), flash (blank paper flash).
const LOOK = {
  span: [91.0, 99.5417],   // v1 section C (E is 118.75-129.9167; pass ?a=118.75&b=129.9167)
  frag: `
uniform float inv, flash, tb3, frame;
void main(){
  vec2 D = vec2(1920., 1080.);
  vec2 P = uv * D;                                                        // design pixels at any render scale
  vec2 d = fbm2(P * .011 + tb3 * 7.3) * 1.1 + fbm2(P * .05 + tb3 * 3.1) * .55;
  vec2 q = uv + d / D;                                                    // the cut wobbles a hair on every pull
  vec3 c = texture(src, q).rgb;
  vec3 cr = texture(src, q + vec2(3., -2.) / D).rgb;                      // red plate slipped off register
  float red = clamp(cr.r - cr.g, 0., 1.);
  float redHere = clamp(c.r - c.g, 0., 1.);
  float k = clamp(1. - max(c.r, max(c.g, c.b)), 0., 1.);
  k = mix(k, clamp(1. - k - redHere, 0., 1.), inv);
  float e = (vn(P * .32 + tb3 * 13.) - .5) * .34 + (vn(P * .07 + tb3 * 5.) - .5) * .26;
  float ink = smoothstep(.45, .55, k + e);
  float redInk = smoothstep(.40, .60, red + e * .8) * (1. - ink);
  // coverage: tooth, pressure, wood grain
  float tooth = vn(P * .45 + tb3 * 31.) * .55 + vn(P * .16 + tb3 * 11.) * .45;
  float press = .86 + .14 * fbm(P * .0035 + vec2(tb3 * .9, 2.));
  float grain = vn(P * vec2(.006, .19) + vec2(fbm(P * .01) * 3., 0.));
  float cover = clamp(press - smoothstep(.64, .86, tooth) * .8 - smoothstep(.72, .92, grain) * .3, 0., 1.);
  float fib = vn(P * .3) * .5 + vn(P * .06 + 3.) * .5;
  vec3 paper = vec3(.945, .915, .845) * (.95 + .06 * fib) - .035 * smoothstep(.6, .9, vn(P * vec2(.5, .03) + 9.));
  // margin + block edge
  vec2 m = min(P, D - P);
  float dm = min(m.x, m.y) + (vn(P * .045) - .5) * 7.;
  float out_ = 1. - smoothstep(19., 21., dm);
  float edge = smoothstep(19., 21., dm) * (1. - smoothstep(29., 31., dm)) * frame;
  ink = max(ink * (1. - out_), edge * smoothstep(.2, .5, tooth + .2));
  redInk *= 1. - out_;
  vec3 col = paper;
  col *= mix(vec3(1.), vec3(.86, .2, .15), redInk * cover * .97);
  col = mix(col, vec3(.075, .068, .072), ink * cover);
  col = mix(col, paper, flash);
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => ({ inv: X.inv ?? 0, flash: X.flash ?? 0, tb3: Math.floor(t * 8 + 1e-6) / 8, frame: X.frame ?? 1 }),
};
