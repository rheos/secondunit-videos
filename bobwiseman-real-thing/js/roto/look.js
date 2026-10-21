// THE LOOK: the Airplane on the Highway "rotoscope dream" finish (Waking Life after the fact), reused for Real Thing.
// No paper: it reads as digitally painted video. The frame breathes (a slow low-frequency warp), has a little film
// softness and grain, washed colour with lifted blacks, and a hue that drifts. Real Thing adds `grey` (the colour
// drains out of the world on the fishless lake and the dirt) and `fade` (black, for the head and tail only).
const LOOK = {
  span: [0, DUR],
  frag: `
uniform float hue, warp, wash, flash, dim, grey, warm, cb, ct, cx, cy, cr;
vec3 hueRot(vec3 c, float a){ const vec3 k = vec3(.57735); float ca = cos(a); return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1. - ca); }
vec3 S(vec2 q){ return texture(src, q).rgb; }
// crisp amount at this pixel: base mode, or the target mode inside the switch circle spreading from an element
float crispAt(){ vec2 p = uv * vec2(1920., 1080.); float d = length(p - vec2(cx, cy)); return mix(ct, cb, smoothstep(cr - 18., cr + 18., d)); }
vec3 crispLook(){ vec3 c = S(uv); c = c * .97 + .02; vec2 v = (uv - .5) * vec2(1., .75); c *= 1. - dot(v, v) * .12; return c; }
void main(){
  float k = crispAt();
  vec2 q = uv + fbm2(uv * vec2(2.2, 1.5) + t * .06) * .009 * warp;      // the whole frame breathes
  vec3 c = mix(S(q), textureLod(src, q, 1.8).rgb, .38);                 // film softness
  c = hueRot(c, hue);
  float lum = dot(c, vec3(.3, .59, .11));
  c = mix(vec3(lum), c, (.74 - .1 * wash) * (1. - grey));               // washed; grey drains it
  c *= mix(vec3(1.), vec3(1.06, 1., .9), warm);                         // warm dawn at the end
  c = c * .84 + .09;                                                     // lifted blacks, video-ish
  c *= .96 + .04 * vn(uv * res * .7 + floor(t * 24.) * 37.);             // fine grain, per frame
  vec2 v = (uv - .5) * vec2(1., .75); c *= 1. - dot(v, v) * .35;
  c = mix(c, vec3(.96, .94, .9), flash);
  c = mix(c, crispLook(), k);
  c = mix(c, vec3(.96, .94, .9), flash * k);
  c *= 1. - dim;
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => ({
    hue: (X.hue ?? 0) + Math.sin(t * .13) * .05, warp: X.warp ?? 1, wash: X.wash ?? 0, flash: X.flash ?? 0,
    dim: clamp(X.dim ?? 0), grey: clamp(X.grey ?? 0), warm: clamp(X.warm ?? 0), cb: X.cb ?? 0, ct: X.ct ?? 0, cx: X.cx ?? 0, cy: X.cy ?? 0, cr: X.cr ?? 0,
  }),
};
