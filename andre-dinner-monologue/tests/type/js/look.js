// THE LOOK: FUI / kinetic-type finish, kept from bobwiseman-airplane-type. Near-black ground, off-white
// type, one hot orange-red accent. The shader blooms only the accent (a hue mask on blurred mips),
// splits the channels a hair toward the edges, adds film grain on 24 fps, faint scanlines and a
// vignette. FX: glitch (horizontal slice tearing + wider channel split), used once, on "dangerous";
// Sleep mode is a 2D veil in shots.js, not a shader pass. Vignette re-shaped for 9:16.
const LOOK = {
  frag: `
uniform float glitch;
void main(){
  float fr = floor(t * 24.);
  vec2 q = uv;
  float band = floor(uv.y * 48. + h21(vec2(fr, 3.)) * 9.);
  float tear = step(1. - glitch * .55, h21(vec2(band, fr)));
  q.x += tear * (h21(vec2(band * 3.1, fr + 7.)) - .5) * .09 * glitch;
  vec2 d = q - .5; float ab = .0016 + .006 * glitch;
  vec3 c = vec3(texture(src, q + d * ab).r, texture(src, q).g, texture(src, q - d * ab).b);
  vec3 b1 = textureLod(src, q, 2.5).rgb, b2 = textureLod(src, q, 4.).rgb, b3 = textureLod(src, q, 5.5).rgb;
  vec3 b = b1 * .45 + b2 * .4 + b3 * .35;
  float hot = smoothstep(.12, .45, b.r - max(b.g, b.b) * 1.15);
  c += b * vec3(1., .42, .2) * hot * 1.1;
  c += b3 * .06;
  float gr = h21(uv * res + fr * 17.31) - .5;
  c += gr * .07;
  c *= .975 + .025 * sin(uv.y * res.y * 1.4);
  vec2 v = (uv - .5) * vec2(.9, .85); c *= 1. - dot(v, v) * .7;
  o = vec4(clamp(c, 0., 1.), 1.);
}`,
  uniforms: (t, X) => ({ glitch: X.glitch ?? 0 }),
};
