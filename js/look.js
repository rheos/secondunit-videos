// THE LOOK: 1968 pop-psychedelic animation in the manner of Heinz Edelmann. Flat poster colour at full
// saturation, bold even black outlines, op-art grounds. The shader finishes it like a clean cel print:
// a fine film grain on twos, a faint paint-cel colour wobble (each cel's paint never quite even), a soft
// vignette. No paper, no grey crush: colour goes out exactly as it was painted.
// Per shot: fx({ flash }) washes to cel white on a hit, fx({ wob }) scales the paint wobble.
const LOOK = {
  span: [133, 170],
  frag: `
uniform float flash, wob, grain;
void main(){
  vec3 c = texture(src, uv).rgb;
  vec2 n = fbm2(uv * vec2(2.6, 1.7) + tq * 1.9);                          // paint-cel wobble, re-laid on twos
  c *= 1. + n.x * .03 * wob;
  c.r += n.y * .012 * wob; c.b -= n.y * .010 * wob;
  float g = h21(uv * res + floor(tq * 24.) * vec2(37., 91.)) - .5;        // film grain
  c += g * .045 * grain;
  vec2 v = (uv - .5) * vec2(1., .72); c *= 1. - dot(v, v) * .32;          // gentle vignette
  c = mix(c, vec3(1., .98, .9), flash);
  o = vec4(clamp(c, 0., 1.), 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0, wob: X.wob ?? 1, grain: X.grain ?? 1 }),
};
