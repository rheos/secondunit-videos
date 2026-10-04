// THE LOOK, section I: Waking Life faux-rotoscope finish that turns ACID with the soundscape.
// Base: the frame breathes (low-frequency warp), film softness, grain, lifted blacks, a drifting hue.
// Acid controls (all per shot via fx(), plus kicks from the bed's onset peaks):
//   hue      whole-frame hue rotation        band   hue cycling that sweeps across the frame in bands
//   mirror   right half seeps in mirrored    mirY   bottom half folds up (sky over sky)
//   kal      kaleidoscope fold (kalN wedges, kalC centre, kalR spin)   melt  the frame drips and re-forms
//   peel     a hue-turned copy peels off and drifts                    sat   colour pushed past washed
const ACID = (() => { // onset peaks in the soundscape, found once from the data (a pure function of FEAT)
  const a = FEAT.onset, out = [];
  for (let i = Math.floor(232 * FEAT.fps); i < 276 * FEAT.fps; i++) {
    if (!(a[i] > .45 && a[i] >= a[i - 1] && a[i] >= a[i + 1])) continue;
    const tt = i / FEAT.fps, w = clamp((a[i] - .35) * 2.2, 0, 1), last = out[out.length - 1];
    if (last && tt - last[0] < .7) { if (w > last[1]) out[out.length - 1] = [tt, w]; } else out.push([tt, w]);
  }
  return out;
})();
const acidKick = (t, decay = 2.4) => ACID.reduce((m, [o, v]) => m + hit(t, o, decay) * v, 0);
const LOOK = {
  span: [219.4583333, 278.75],
  frag: `
uniform float hue, band, mirror, mirY, peel, warp, kal, kalN, kalR, melt, wash, sat, flash;
uniform vec2 kalC;
vec3 hueRot(vec3 c, float a){ const vec3 k = vec3(.57735); float ca = cos(a); return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1. - ca); }
vec3 S(vec2 q){ return texture(src, q).rgb; }
void main(){
  vec2 q = uv + fbm2(uv * vec2(2.2, 1.5) + t * .06) * .007 * warp;      // the whole frame breathes
  vec2 q0 = q;
  if (melt > 0.) {                                                       // drips: columns sag by their own amount
    float col = fbm(vec2(q.x * 9., 3.1)) , d = pow(col, 2.) * melt * .22 * smoothstep(-.1, .9, q.y + col * .3);
    q.y -= d; q.x += sin(q.y * 14. + t) * .006 * melt;
  }
  if (kal > 0.) {
    vec2 asp = vec2(res.x / res.y, 1.);
    vec2 p = (q - kalC) * asp;
    float r = length(p), a = atan(p.y, p.x) + kalR, w = 6.2832 / kalN;
    a = abs(mod(a, w) - w * .5);
    vec2 k = vec2(cos(a), sin(a)) * r / asp + kalC;
    q = mix(q, k, kal);
  }
  if (mirY > 0.) { float sm = smoothstep(.0, .05, q.y - .5 + (fbm(vec2(q.x * 3., t * .3)) - .5) * .1); q.y = mix(q.y, 1. - q.y, sm * mirY); }
  vec3 c = mix(S(q), textureLod(src, q, 1.3).rgb, .2);                  // film softness
  if (mirror > 0.) {
    float seam = smoothstep(.0, .06, q.x - .5 + (fbm(vec2(q.y * 3., t * .4)) - .5) * .12);
    c = mix(c, S(vec2(1. - q.x, q.y)), seam * mirror);
  }
  if (peel > 0.) {
    vec3 g = hueRot(S(q + vec2(.03, -.02) * peel + fbm2(q * 3. + t * .2) * .01 * peel), 2.1);
    c = mix(c, max(c, g), .5 * clamp(peel, 0., 1.));
  }
  if (topOn > 0.) { vec4 tp = mix(texture(top, q0), textureLod(top, q0, 1.3), .2); c = mix(c, tp.rgb, tp.a); } // the unfolded top layer
  c = hueRot(c, hue + band * sin(q.x * 5.5 - q.y * 3.2 + t * 1.7) * 1.6);
  float lum = dot(c, vec3(.3, .59, .11));
  c = mix(vec3(lum), c, .86 - .1 * wash + sat);
  c = clamp(c, 0., 1.);
  c = c * .9 + .055;                                                     // lifted blacks, video-ish
  c *= .96 + .04 * vn(uv * res * .7 + floor(t * 24.) * 37.);             // fine grain, per frame
  vec2 v = (uv - .5) * vec2(1., .75); c *= 1. - dot(v, v) * .35;
  c = mix(c, vec3(.96, .94, .9), flash);
  o = vec4(c, 1.);
}`,
  uniforms: (t, X) => {
    const k = acidKick(t);
    return {
      hue: (X.hue ?? 0) + Math.sin(t * .13) * .05 + k * (X.acid ?? 0) * .9,
      band: X.band ?? 0,
      mirror: clamp((X.mirror ?? 0) + k * (X.acidMirror ?? 0)), mirY: clamp(X.mirY ?? 0),
      peel: (X.peel ?? 0) + k * (X.acidPeel ?? 0),
      warp: X.warp ?? 1, kal: clamp(X.kal ?? 0), kalN: X.kalN ?? 6, kalR: X.kalR ?? 0, kalC: X.kalC ?? [.5, .5],
      melt: X.melt ?? 0, wash: X.wash ?? 0, sat: X.sat ?? 0, flash: X.flash ?? 0,
    };
  },
};
