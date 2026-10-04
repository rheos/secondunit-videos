// THE LOOK: 16-bit console output. The shots draw a 320x180 indexed frame that px.js has already
// blown up x4 with nearest-neighbour, so this pass reads the source 1:1 with texelFetch (no filtering,
// no blur) and only adds a faint CRT finish: the last output row of every game pixel row a touch darker,
// a whisper of vignette, and a white flash for hits. The pixels stay square and crisp.
const LOOK = {
  span: [4525 / 24, 5267 / 24],
  frag: `
uniform float scan, flash, vig;
void main(){
  ivec2 ts = textureSize(src, 0);
  ivec2 p = ivec2(int(gl_FragCoord.x), ts.y - 1 - int(gl_FragCoord.y));
  vec3 c = texelFetch(src, p, 0).rgb;
  float k = floor(res.y / 180. + .5);
  c *= 1. - scan * step(k - 1., mod(float(p.y), k)) * .13;
  vec2 v = uv - .5; c *= 1. - vig * dot(v, v) * .3;
  c = mix(c, vec3(1.), flash);
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ scan: X.scan ?? 1, flash: X.flash ?? 0, vig: X.vig ?? 1 }),
};
