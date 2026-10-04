// THE LOOK: FUI / kinetic-type finish. Near-black ground, off-white type, one hot orange-red accent.
// The shader blooms only the accent (a hue mask on blurred mips), splits the channels a hair toward the
// edges, adds film grain on 24 fps, faint scanlines and a vignette. FX: flash (white-hot frame on a hit),
// glitch (horizontal slice tearing + wider channel split), paper (cream scenes: less bloom, warmer grain).
const LOOK = {
  span: [0, 71.0],
  frag: `
uniform float flash, glitch, paper;
void main(){
  float fr = floor(t * 24.);
  vec2 q = uv;
  float band = floor(uv.y * 34. + h21(vec2(fr, 3.)) * 9.);
  float tear = step(1. - glitch * .55, h21(vec2(band, fr)));
  q.x += tear * (h21(vec2(band * 3.1, fr + 7.)) - .5) * .09 * glitch;
  vec2 d = q - .5; float ab = .0016 + .006 * glitch;
  vec3 c = vec3(texture(src, q + d * ab).r, texture(src, q).g, texture(src, q - d * ab).b);
  vec3 b1 = textureLod(src, q, 2.5).rgb, b2 = textureLod(src, q, 4.).rgb, b3 = textureLod(src, q, 5.5).rgb;
  vec3 b = b1 * .45 + b2 * .4 + b3 * .35;
  float hot = smoothstep(.12, .45, b.r - max(b.g, b.b) * 1.15);
  c += b * vec3(1., .42, .2) * hot * 1.1 * (1. - paper * .7);
  c += b3 * .06 * (1. - paper);
  float gr = h21(uv * res + fr * 17.31) - .5;
  c += gr * mix(.075, .05, paper);
  c *= .975 + .025 * sin(uv.y * res.y * 1.4);
  vec2 v = (uv - .5) * vec2(1., .78); c *= 1. - dot(v, v) * mix(.95, .6, paper);
  c = mix(c, vec3(1., .93, .88), flash);
  o = vec4(clamp(c, 0., 1.), 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0, glitch: X.glitch ?? 0, paper: X.paper ?? 0 }),
};
