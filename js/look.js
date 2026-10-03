// THE LOOK: Waking Life faux-rotoscope finish. No paper: it is meant to read as digitally painted
// video. The frame breathes (a slow low-frequency warp), has a little film softness and grain,
// washed colour with lifted blacks, and a hue that drifts all the time. The band's odd sounds
// (onset peaks in the bed) push acid turns: hue jolts, a mirrored half that seeps in along a
// wobbling seam, a peeled ghost layer, and a kaleidoscope fold for the quantum ending.
const ACID = (() => { // onset peaks in the section, found once from the data (a pure function of FEAT)
  const a = FEAT.onset, out = [];
  // the onset curve flickers every 0.2 s in this bed, so only the real jolts count: strong, and 0.8 s apart
  for (let i = Math.floor(296 * FEAT.fps); i < 322 * FEAT.fps; i++) {
    if (!(a[i] > .95 && a[i] >= a[i - 1] && a[i] >= a[i + 1])) continue;
    const tt = i / FEAT.fps, w = clamp((a[i] - .85) * 3, 0, 1.4), last = out[out.length - 1];
    if (last && tt - last[0] < .8) { if (w > last[1]) out[out.length - 1] = [tt, w]; } else out.push([tt, w]);
  }
  return out;
})();
const acidKick = (t, decay = 2.2) => ACID.reduce((m, [o, v]) => m + hit(t, o, decay) * v, 0);
const LOOK = {
  span: [298.0, 318.0],
  frag: `
uniform float hue, mirror, peel, warp, kal, wash, flash;
vec3 hueRot(vec3 c, float a){ const vec3 k = vec3(.57735); float ca = cos(a); return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1. - ca); }
vec3 S(vec2 q){ return texture(src, q).rgb; }
void main(){
  vec2 q = uv + fbm2(uv * vec2(2.2, 1.5) + t * .06) * .007 * warp;      // the whole frame breathes
  if (kal > 0.) {                                                        // kaleidoscope fold around the centre
    vec2 p = (q - .5) * vec2(res.x / res.y, 1.);
    float r = length(p), a = atan(p.y, p.x) + t * .15, w = 6.2832 / 6.;
    a = abs(mod(a, w) - w * .5);
    vec2 k = vec2(cos(a), sin(a)) * r / vec2(res.x / res.y, 1.) + .5;
    q = mix(q, k, kal);
  }
  vec3 c = mix(S(q), textureLod(src, q, 1.4).rgb, .22);                 // film softness
  if (mirror > 0.) {                                                     // the right half seeps in mirrored
    float seam = smoothstep(.0, .06, q.x - .5 + (fbm(vec2(q.y * 3., t * .4)) - .5) * .12);
    c = mix(c, S(vec2(1. - q.x, q.y)), seam * mirror);
  }
  if (peel > 0.) {                                                       // a colour layer peels off and drifts
    vec3 g = hueRot(S(q + vec2(.035, -.022) * peel + fbm2(q * 3. + t * .2) * .01 * peel), 1.4);
    c = mix(c, max(c, g), .55 * clamp(peel, 0., 1.));
  }
  c = hueRot(c, hue);
  float lum = dot(c, vec3(.3, .59, .11));
  c = mix(vec3(lum), c, .86 - .1 * wash);                                // washed
  c = c * .9 + .055;                                                     // lifted blacks, video-ish
  c *= .96 + .04 * vn(uv * res * .7 + floor(t * 24.) * 37.);             // fine grain, per frame
  vec2 v = (uv - .5) * vec2(1., .75); c *= 1. - dot(v, v) * .35;
  c = mix(c, vec3(.96, .94, .9), flash);
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => {
    const k = acidKick(t);
    return {
      hue: (X.hue ?? 0) + Math.sin(t * .13) * .06 + k * (X.acid ?? .5) * .9,
      mirror: clamp((X.mirror ?? 0) + k * (X.acidMirror ?? 0)),
      peel: (X.peel ?? 0) + k * (X.acidPeel ?? 0),
      warp: X.warp ?? 1, kal: clamp(X.kal ?? 0), wash: X.wash ?? 0, flash: X.flash ?? 0,
    };
  },
};
