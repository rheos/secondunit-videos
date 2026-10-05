// THE LOOK (verse 2, the 60s club): a 1966 psychedelic concert poster, offset-printed in flat,
// vibrating complementary colours, plus the club's liquid light show.
//   - the 2D pass draws flat colour; anything painted pure key green (#00ff00, PSY.KEY) is replaced
//     here by an oil-projection light show: domain-warped bands cycling through the poster palette,
//     flowing in time and swelling on the beat (FX.beat)
//   - FX.melt bends the whole sheet in slow waves (the lettering and the room melt with it)
//   - printing: flat inks, a hair of misregistration on the colour vs the dark plate, paper tooth,
//     a soft vignette like a poster under a club light
// FX: melt (0..1), beat (0..1 pulse), flash, fade (to paper).
const PSY = {
  KEY: '#00ff00',
  C: { or: '#ff5a1f', bl: '#2456e8', mg: '#e0219a', gr: '#2fbf5a', pu: '#5b2a86', ye: '#ffd23f', ink: '#1d1420', pap: '#f3e7cf', pink: '#ff9ec7', teal: '#18a7a0' },
};
const LOOK = {
  span: [77.6, 112.0],
  frag: `
uniform float melt, beat, flash, fade, tb3, tt;
vec3 pal(float x){
  x = fract(x);
  vec3 a = vec3(1., .353, .122), b = vec3(.878, .129, .604), c = vec3(.357, .165, .525), d = vec3(.141, .337, .91), e = vec3(.184, .749, .353), f = vec3(1., .824, .247);
  float k = x * 6.;
  if (k < 1.) return mix(a, b, smoothstep(.0, 1., k));
  if (k < 2.) return mix(b, c, smoothstep(1., 2., k));
  if (k < 3.) return mix(c, d, smoothstep(2., 3., k));
  if (k < 4.) return mix(d, e, smoothstep(3., 4., k));
  if (k < 5.) return mix(e, f, smoothstep(4., 5., k));
  return mix(f, a, smoothstep(5., 6., k));
}
void main(){
  vec2 D = vec2(1920., 1080.);
  vec2 q = uv;
  q.x += sin(uv.y * 9. + tt * 1.3) * .006 * melt;
  q.y += sin(uv.x * 7. + tt * 1.1) * .010 * melt + sin(uv.x * 23. - tt * 2.) * .002 * melt;
  vec2 P = q * D;
  vec2 reg = vec2(2.5, -1.5) + (vec2(h21(vec2(tb3 * 41., 1.)), h21(vec2(tb3 * 41., 2.))) - .5) * 1.4;
  vec3 c = texture(src, q + reg / D).rgb;
  vec3 k = texture(src, q).rgb;
  // light show where the key green is
  float key = smoothstep(.25, .05, length(c - vec3(0., 1., 0.)));
  vec2 p = P / 520.;
  vec2 w1 = fbm2(p * 1.2 + vec2(tt * .07, -tt * .05));
  vec2 w2 = fbm2(p * 1.7 + w1 * 1.6 + vec2(-tt * .04, tt * .06));
  float f = fbm(p * 1.1 + w2 * (1.8 + beat * .6));
  vec3 oil = pal(f * 1.6 + tt * .05);
  float cell = smoothstep(.48, .5, fract(f * 5. - tt * .15));
  oil = mix(oil, pal(f * 1.6 + tt * .05 + .5), cell * .9);
  oil *= .85 + beat * .25;
  vec3 col = mix(c, oil, key);
  // the dark plate prints on top, on register
  float dark = 1. - smoothstep(.12, .25, max(k.r, max(k.g, k.b)));
  col = mix(col, vec3(.114, .078, .125), dark);
  // paper tooth and a club-light vignette
  float tooth = vn(P * .55 + tb3 * 13.) * .6 + vn(P * .12) * .4;
  col *= .95 + tooth * .07;
  vec2 v = uv - .5; col *= 1. - dot(v, v) * .45;
  vec3 pap = vec3(.953, .906, .812);
  col = mix(col, pap, max(flash, fade));
  vec2 m = min(uv * D, D - uv * D); float dm = min(m.x, m.y);
  col = mix(pap, col, smoothstep(13., 15., dm));
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => ({ melt: X.melt ?? 0, beat: X.beat ?? 0, flash: X.flash ?? 0, fade: X.fade ?? 0, tb3: Math.floor(t * 8 + 1e-6) / 8, tt: t }),
};
