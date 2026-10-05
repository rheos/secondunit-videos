// THE LOOK (the years + verse 3, the 80s): a photocopied gig flyer, Toronto, about 1984.
// Like look.js, the 2D pass draws INK AMOUNTS, not colours, one plate per channel on black:
//   red channel   = K, the toner (anything from a faint grey to solid black)
//   green channel = P, fluoro pink, a second pass through the copier, never quite on register
// Use XINK.K(a) / XINK.P(a). The shader makes it a photocopy:
//   - toner is thresholded against noise: greys turn into blotchy speckle, solids fill in fat and black
//   - generation loss: edges spread a little, a dirty-glass streak runs down the page, specks of toner dust
//   - the pink sits a few pixels off and is a flat fluorescent ink, slightly uneven
//   - FX.bar: the copier's light bar sweeping across (0..1 position, <0 off); FX.flash: the lid lifts
const XINK = {
  K: (a = 1) => `rgb(${Math.round(255 * a)},0,0)`,
  P: (a = 1) => `rgb(0,${Math.round(255 * a)},0)`,
  mix: (k, p) => `rgb(${Math.round(255 * k)},${Math.round(255 * p)},0)`,
  PAPER: 'rgb(0,0,0)',
};
const LOOK = {
  span: [112.0, 187.0],
  frag: `
uniform float bar, flash, tb3, gen;
void main(){
  vec2 D = vec2(1920., 1080.);
  vec2 P = uv * D;
  float tb = tb3;
  vec2 jit = (vec2(h21(vec2(tb * 31., 1.)), h21(vec2(tb * 31., 2.))) - .5) * 1.4;
  float k = texture(src, uv + jit / D).r;
  float kb = textureLod(src, uv + jit / D, 1.5).r;
  vec2 pr = vec2(6., -4.) + (vec2(h21(vec2(tb * 31., 3.)), h21(vec2(tb * 31., 4.))) - .5) * 4.;
  float p = texture(src, uv + pr / D).g;
  // toner: spread a little (generation loss), then threshold against grain
  float kk = max(k, kb * (.55 + gen * .1));   // spread kept small, or white-on-black type fills in
  float grain = vn(P * .9 + tb * 41.) * .6 + vn(P * .25 + tb * 7.) * .4;
  float toner = smoothstep(.5, .56, kk + (grain - .5) * .55);
  // dirty glass: a faint vertical streak and a few dust specks, fixed to the platen (they don't move)
  toner = max(toner, smoothstep(.985, 1., vn(vec2(P.x * .9, 3.))) * .35 * step(.2, fract(P.y * .002)));
  toner = max(toner, step(.9965, h21(floor(P / 3.) + 17.)));
  // hollow big solids slightly, like a tired drum
  toner *= 1. - smoothstep(.75, .95, vn(P * .02 + tb * .5)) * .18 * step(.9, kb);
  float pink = smoothstep(.45, .6, p + (vn(P * .4 + 9.) - .5) * .3) * (.88 + .12 * vn(P * .05));
  vec3 paper = vec3(.955, .95, .935) - .025 * vn(P * .01);
  vec3 col = mix(paper, vec3(1., .33, .62), pink * .92);
  col = mix(col, vec3(.07, .07, .075), toner);
  // the copier's light bar
  if (bar >= 0.) { float d = abs(uv.x - bar); col += vec3(.75, .95, .8) * exp(-d * d * 900.) * .9 + vec3(.3, .5, .4) * exp(-d * 18.) * .15; }
  col = mix(col, vec3(.97, 1., .97), flash);
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => ({ bar: X.bar ?? -1, flash: X.flash ?? 0, tb3: Math.floor(t * 8 + 1e-6) / 8, gen: X.gen ?? 0 }),
};
