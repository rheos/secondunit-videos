// THE LOOK: a three-drum risograph print on off-white stock.
// The 2D frame is not a picture, it is a set of separations: R = density of ink A (fluorescent pink),
// G = ink B (teal), B = ink C (yellow). Black in the source is bare paper. Shots draw opaque shapes
// with source-over (they knock out every plate underneath) or with 'lighten' (overprint: max per plate).
// This shader prints each plate on its own: shifted by its own registration error (new every drawing,
// on twos), screened into a rotated halftone, starved in streaks and blotches, speckled, and then
// multiplied over the paper, so overlaps go deep (pink x teal = navy, pink x yellow = red, teal x yellow = green).
const INK = {
  pink: [1.0, .29, .62], teal: [0.0, .52, .6], yellow: [1.0, .9, .05],
  orange: [1.0, .45, .2], blue: [0.0, .42, .78], purple: [.45, .33, .68], green: [0.0, .66, .38], red: [1.0, .32, .34],
};
const LOOK = {
  span: [129.9167, 169.75],
  frag: `
uniform vec2 offA, offB, offC; uniform vec3 inkA, inkB, inkC; uniform float starve, fade, cell, jitk;
uniform vec3 rotP, zmP, angP, cellP; uniform float edge;   // edge 0 = mirrored repeat (the test), 1 = bare paper off the sheet   // section F: per-plate rotation + zoom about the centre, screen angle, screen cell multiplier
float CELL;
float scr(vec2 px, float ang){ float c = cos(ang), s = sin(ang); vec2 p = mat2(c, -s, s, c) * (px - res * .5) / CELL;
  return .5 + .25 * (cos(6.2831853 * p.x) + cos(6.2831853 * p.y)); }
float plate(float d, vec2 px, float ang, float sd){
  float th = scr(px, ang);
  float g = (vn(px * .8 + sd * 53.1 + jitk * 7.) - .5) * .3 * clamp(d * (1. - d) * 4., 0., 1.);   // ragged dot edges
  float ink = smoothstep(-.03, .03, d * 1.1 - .05 - th + g);
  vec2 q = px / res.y;
  float st = smoothstep(.52, .85, fbm(q * vec2(9., 1.6) + sd * 13.7)) * starve;                  // streaks down the drum
  float blot = smoothstep(.6, .82, fbm(q * 5. + sd * 3.1 + jitk * .37));                        // thin patches, new per drawing
  ink *= 1. - st * .45 - blot * .25 * starve;
  ink *= 1. - step(.982, h21(px * .5 + sd * 911. + jitk * 17.)) * .85;                         // white speckle
  return clamp(ink, 0., 1.);
}
// one plate's density: the drum is rotated/zoomed about the frame centre, then shifted; off the sheet is bare paper
float samp(int ch, vec2 px, float r, float z, vec2 off){
  vec2 p = px - res * .5; float c = cos(r), s = sin(r); p = mat2(c, s, -s, c) * p / z;
  vec2 u = (p + res * .5) / res + off;
  float e = .004, inb = edge < .5 ? 1. : step(-e, u.x) * step(u.x, 1. + e) * step(-e, u.y) * step(u.y, 1. + e);
  vec4 v = textureLod(src, u, .5);
  return (ch == 0 ? v.r : ch == 1 ? v.g : v.b) * inb;
}
void main(){
  vec2 px = uv * res;
  float a = samp(0, px, rotP.x, zmP.x, offA), b = samp(1, px, rotP.y, zmP.y, offB), c = samp(2, px, rotP.z, zmP.z, offC);
  CELL = cell * cellP.x; a = plate(a, px, angP.x, 1.);
  CELL = cell * cellP.y; b = plate(b, px, angP.y, 2.);
  CELL = cell * cellP.z; c = plate(c, px, angP.z, 3.);
  float k = 1. - fade; a *= k; b *= k; c *= k;
  vec2 q = px / res.y;
  vec3 paper = vec3(.968, .948, .9) * (.97 + .045 * fbm(q * vec2(60., 220.)));
  paper *= .985 + .02 * vn(px * .9 + 5.);
  float fleck = step(.9993, h21(px * .33 + 77.)) * .6;                                         // stray ink flecks
  vec3 col = paper * mix(vec3(1), inkA, max(a, fleck)) * mix(vec3(1), inkB, b) * mix(vec3(1), inkC, c);
  o = vec4(col, 1.);
}`,
  uniforms: (t, X) => {
    const k = Math.floor(t * 12), j = X.jit ?? 2.4, o = X.off || [0, 0, 0, 0, 0, 0];
    const J = (n) => (hash(k * 6 + n + 4000) - .5) * 2 * j;
    const uvo = (i) => [(o[i] + J(i)) / W, (o[i + 1] + J(i + 1)) / H];
    const inks = X.inks || [INK.pink, INK.teal, INK.yellow];
    return { offA: uvo(0), offB: uvo(2), offC: uvo(4), inkA: inks[0], inkB: inks[1], inkC: inks[2],
      starve: X.starve ?? 1, fade: X.fade ?? 0, cell: 1080 * RS / 118, jitk: k % 97,
      rotP: X.rot || [0, 0, 0], zmP: X.zm || [1, 1, 1], angP: X.ang || [1.309, .262, .785], cellP: X.cell || [1, 1, 1], edge: X.edge ?? LOOK.edge ?? 0 };
  },
};
