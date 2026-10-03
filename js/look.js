// THE FINISH (hybrid exploration). One shader, shared by all three looks, so the woodcut, the collage
// and the gouache all sit on the same sheet of paper. The rules it carries out are written at the top
// of js/ch/hybrid.js. Per look it adds one treatment:
//   wood  (0/1)  the 2D frame arrives in three flat values (black ink, white cut, pure red). It is pulled
//                as a relief print in navy ink on dusty-pink stock (The Legend): ragged thresholded
//                edges re-pulled on threes, tooth gaps where the pink shows through the navy, red plate
//                a hair off register. Carried over from bobwiseman-airplane-woodcut, recoloured.
//   toner (0/1)  photocopy: contrast crunched toward toner black, drum streaks, toner speckle (collage).
//   gch   (0/1)  gouache: paper tooth shows through thin paint, a faint graphite sheen (the gouache
//                pass itself is the brushstroke renderer in js/gouache.js).
// Common to all: cream paper fibre, sparse toner specks, a hand-cut sheet edge with a slightly wonky
// margin on a dark table, and a whole-sheet nudge on threes (the rostrum is not quite steady).
const LOOK = {
  span: [2389 / 24, 2997 / 24],
  frag: `
uniform float wood, toner, gch, flash, tb3;
void main(){
  vec2 D = vec2(1920., 1080.);
  vec2 P0 = uv * D;
  vec2 nud = (vec2(h21(vec2(tb3 * 8., 3.)), h21(vec2(tb3 * 8., 9.))) - .5) * 1.6;      // sheet nudge, design px
  vec2 P = P0 + nud;
  vec2 wob = (fbm2(P * .011 + tb3 * 7.3) * 1.1 + fbm2(P * .05 + tb3 * 3.1) * .55) * wood;
  vec2 q = (P + wob) / D;
  vec3 c = texture(src, q).rgb;
  float fib = vn(P * .3) * .5 + vn(P * .06 + 3.) * .5;
  vec3 paper = vec3(.937, .902, .824) * (.95 + .06 * fib);

  // ---- wood: navy ink on pink stock ----
  if (wood > .5) {
    vec3 cr = texture(src, q + vec2(3., -2.) / D).rgb;
    float red = clamp(cr.r - cr.g, 0., 1.);
    float k = clamp(1. - max(c.r, max(c.g, c.b)), 0., 1.);
    float e = (vn(P * .32 + tb3 * 13.) - .5) * .34 + (vn(P * .07 + tb3 * 5.) - .5) * .26;
    float ink = smoothstep(.45, .55, k + e);
    float redInk = smoothstep(.40, .60, red + e * .8) * (1. - ink);
    float tooth = vn(P * .45 + tb3 * 31.) * .55 + vn(P * .16 + tb3 * 11.) * .45;
    float press = .88 + .12 * fbm(P * .0035 + vec2(tb3 * .9, 2.));
    float grain = vn(P * vec2(.006, .19) + vec2(fbm(P * .01) * 3., 0.));
    float cover = clamp(press - smoothstep(.70, .90, tooth) * .7 - smoothstep(.74, .94, grain) * .3, 0., 1.);
    vec3 pink = vec3(.886, .647, .569) * (.95 + .07 * fib);
    vec3 navy = vec3(.165, .145, .255);
    vec3 col = pink;
    col = mix(col, vec3(.80, .17, .16), redInk * cover * .95);
    col = mix(col, navy, ink * cover);
    c = col;
  }
  // ---- toner: photocopy ----
  if (toner > .5) {
    float lum = dot(c, vec3(.3, .59, .11));
    c = mix(c, smoothstep(vec3(.07), vec3(.93), c), .55);                               // crunch toward toner black / bare paper
    c = mix(vec3(lum), c, .82);                                                         // copier drains colour a little
    c *= 1. - .07 * smoothstep(.55, .95, vn(vec2(P.x * .02, tb3 * 2.)));                // drum streaks, vertical
    float sp = h21(floor(P * .5) + floor(tb3 * 8.) * 17.);
    c *= 1. - .55 * step(.9965, sp);                                                    // toner speckle
    c *= paper / vec3(.937, .902, .824) * .5 + .5;
  }
  // ---- gouache: tooth through the paint ----
  if (gch > .5) {
    float tooth = vn(P * .55) * .6 + vn(P * .18 + 5.) * .4;
    c *= .94 + .08 * tooth;
    c = mix(c, paper, .05 * smoothstep(.6, .9, tooth));
  }
  // ---- common ----
  c *= 1. - .5 * step(.9988, h21(floor(P * .34) + 911.)) ;                             // fixed specks in the stock
  c *= .965 + .035 * vn(P * .9 + tb3 * 91.);
  vec2 v = (uv - .5) * vec2(1., .75); c *= 1. - dot(v, v) * .35;
  // the hand-cut sheet edge on a dark table
  vec2 m = min(P0, D - P0);
  float dm = min(m.x, m.y) - 16. + (vn(P0 * .02) - .5) * 9. + (vn(P0 * .2) - .5) * 1.6;
  float onSheet = smoothstep(-.8, .8, dm);
  vec3 table = vec3(.16, .14, .13) * (.9 + .1 * vn(P0 * .1));
  table *= 1. - .35 * smoothstep(6., 0., -dm) * step(dm, 0.);                            // the sheet's shadow
  c = mix(c, paper, flash);
  c = mix(table, c, onSheet);
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({ wood: X.wood ?? 0, toner: X.toner ?? 0, gch: X.gch ?? 0, flash: X.flash ?? 0, tb3: Math.floor(t * 8 + 1e-6) / 8 }),
};
