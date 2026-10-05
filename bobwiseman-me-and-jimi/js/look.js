// THE LOOK: a letterpress gig handbill (Hatch Show Print manner): wood type and cut-block pictures,
// three spot inks overprinting on cream newsprint.
// The 2D pass does not draw colours. It draws INK AMOUNTS, one plate per channel, on black:
//   red channel   = K, the black plate
//   green channel = F, the split-fountain plate (one roller loaded red at the left, yellow at the right,
//                   so its colour slides across the sheet)
//   blue channel  = B, a blue plate
// Use the INK helpers below, never raw colours. Partial values print as a halftone screen.
// The shader pulls each plate a little off register (re-pulled on threes, 8 a second), roughs every
// edge where the type was under-inked, leaves wood grain in the big solids and multiplies the inks
// over each other, so F over B goes dark green and F over K is just K.
// FX: flash (blank sheet), fount (0..1 slides the fountain gradient), reg (extra misregistration).
const INK = {
  K: (a = 1) => `rgb(${Math.round(255 * a)},0,0)`,
  F: (a = 1) => `rgb(0,${Math.round(255 * a)},0)`,
  B: (a = 1) => `rgb(0,0,${Math.round(255 * a)})`,
  mix: (k, f, b) => `rgb(${Math.round(255 * k)},${Math.round(255 * f)},${Math.round(255 * b)})`,
  PAPER: 'rgb(0,0,0)',
};
const LOOK = {
  span: [0, 44],
  frag: `
uniform float flash, tb3, fount, reg;
float plate(vec2 q, int ch, float tb, vec2 P, float ang, float cell){
  vec3 c = texture(src, q).rgb; vec3 cb = textureLod(src, q, 1.6).rgb;
  float v = ch == 0 ? c.r : ch == 1 ? c.g : c.b;
  float vb = ch == 0 ? cb.r : ch == 1 ? cb.g : cb.b;
  // halftone where the plate asks for a tint
  mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
  vec2 g = R * P / cell; vec2 f = fract(g) - .5;
  float dotr = length(f) * 1.42;
  float tint = smoothstep(.06, .12, v) * (1. - smoothstep(.88, .94, v));
  float ht = 1. - smoothstep(sqrt(v) - .08, sqrt(v) + .08, dotr);
  float solid = smoothstep(.5, .6, mix(vb, v, .6) + (vn(P * .35 + tb * 17. + float(ch) * 9.) - .5) * .22);
  return mix(solid, ht, tint);
}
void main(){
  vec2 D = vec2(1920., 1080.);
  vec2 P = uv * D;
  float tb = tb3;
  vec2 w = fbm2(P * .006 + tb * 3.7) * .7;                                // the sheet never lies quite flat
  vec2 oK = (vec2(h21(vec2(tb * 61., 1.)), h21(vec2(tb * 61., 2.))) - .5) * 1.6;
  vec2 oF = vec2(5., -3.) + (vec2(h21(vec2(tb * 61., 3.)), h21(vec2(tb * 61., 4.))) - .5) * 3. * (1. + reg);
  vec2 oB = vec2(-4., 4.) + (vec2(h21(vec2(tb * 61., 5.)), h21(vec2(tb * 61., 6.))) - .5) * 3. * (1. + reg);
  float k = plate(uv + (w + oK) / D, 0, tb, P, .785, 9.);
  float fi = plate(uv + (w + oF) / D, 1, tb, P, .262, 9.);
  float bl = plate(uv + (w + oB) / D, 2, tb, P, 1.309, 9.);
  // coverage: pressure across the sheet, paper tooth, wood grain in the solids
  float tooth = vn(P * .5 + tb * 29.) * .6 + vn(P * .13 + tb * 7.) * .4;
  float press = .9 + .1 * fbm(P * .003 + vec2(tb * .7, 4.));
  float grain = vn(P * vec2(.004, .16) + vec2(fbm(P * .008) * 4., 0.));
  float cover = clamp(press - smoothstep(.7, .9, tooth) * .75 - smoothstep(.7, .93, grain) * .28, 0., 1.);
  float fib = vn(P * .27) * .5 + vn(P * .05 + 3.) * .5;
  vec3 paper = vec3(.95, .915, .83) * (.95 + .06 * fib) - .03 * smoothstep(.62, .9, vn(P * vec2(.4, .025) + 9.));
  // the fountain: red at the left of the roller, orange, yellow at the right
  float x = clamp(uv.x + (fount - .5) * .8 + (vn(vec2(P.y * .004, 3.)) - .5) * .08, 0., 1.);
  vec3 fc = mix(mix(vec3(.86, .17, .16), vec3(.95, .47, .12), smoothstep(0., .55, x)), vec3(.98, .8, .2), smoothstep(.45, 1., x));
  vec3 col = paper;
  col *= mix(vec3(1.), vec3(.16, .36, .66), bl * cover * .95);
  col *= mix(vec3(1.), fc, fi * cover * .97);
  col = mix(col, vec3(.085, .075, .08), k * cover * .97);
  // a margin of bare sheet, slightly uneven
  vec2 m = min(P, D - P); float dm = min(m.x, m.y) + (vn(P * .05) - .5) * 4.;
  col = mix(paper, col, smoothstep(14., 16., dm));
  col = mix(col, paper, flash);
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => ({ flash: X.flash ?? 0, tb3: Math.floor(t * 8 + 1e-6) / 8, fount: X.fount ?? .5, reg: X.reg ?? 0 }),
};
