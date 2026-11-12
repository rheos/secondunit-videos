// Render loop and the print finish. Scene is unlit (MeshBasicMaterial, three inks). Per output frame:
//   for each of N sub-frames inside a 180-degree shutter: story.at(t) -> scene to RT (colour + depth)
//   -> depth-of-field gather -> added into ACC with weight 1/N
//   then ACC -> gate weave, softness, fixed paper tooth on multiply, vignette -> canvas.
// window.renderFrame(f) draws song frame f (24 fps, absolute song frame). Pure: frames can render in any order.
import * as THREE from "./lib/three.module.js";
import { loadFont } from "./type.js";


const q = new URLSearchParams(location.search);
const W = +(q.get("w") || 1280), H = +(q.get("h") || 720);
const SUB = +(q.get("sub") || 6);          // motion-blur sub-frames
const FPS = 24;

// Three inks by role: cream = the paper, red = the accent ink, black = the dark ink. Pick with ?pal=<name>.
// "oxblood" is the first palette, archived 2026-11-12 (Robin: "very cool, but it's also kind of fascist").
export const PALETTES = {
  oxblood: ["#e8dcc2", "#c3302a", "#1c1916"],      // v1 and the v2 proof; archived
  // from the cover of Accidentally Acquired Beliefs (1995), the album New City came out on
  cobalt: ["#efe3c0", "#2f5f9e", "#24232b"],       // A: the cover's deep blue on cream, charcoal
  coral: ["#efe3c0", "#e45f57", "#27324f"],        // B: the red-orange burst, with navy for the dark ink
  star: ["#efe5c6", "#e3c636", "#2e4f7c"],         // C: the yellow star, with the cover's blue as the dark ink
  lime: ["#ede4c4", "#8c9b2e", "#3a2a26"],         // D: the green lettering, with the cover's brown-black
  // from the cover of City of Wood (1993): black field, a city in electric-blue lines, gold lettering, white title
  cowwhite: ["#ece9e1", "#3a3fd6", "#0e0d15"],     // E: white card, the cover's electric blue, its black
  cowkraft: ["#d8b07a", "#3a3fd6", "#0e0d15"],     // F: gold-brown kraft card (the "wood" lettering), blue, black
  cownight: ["#2f33a8", "#e2ac62", "#0e0d15"],     // G: blue card, gold ink, black
};
// The colour arc (Robin, 2026-11-12, after the Ricks Clips and Kevin Ngo studies): cobalt drifts from a cool
// morning at the first line to warm by the last, and a motif yellow (the star on the Accidentally Acquired Beliefs
// cover) grows across the piece on what is being built. Keyframes by song time; other palettes stay fixed.
const ARCS = {
  cobalt: [
    [0.0, ["#e6e5dc", "#2c5aa0", "#21252f"]],
    [9.0, ["#ece4cf", "#2f5c9e", "#24242c"]],
    [16.0, ["#f2e2ba", "#34529f", "#2a2424"]],
  ],
};
const MOTIF = "#e9c43a";
const palName = q.get("pal") || "cobalt";   // cobalt: Robin's pick, 2026-11-12
const PAL = PALETTES[palName] || PALETTES.cobalt;
export const INK = { cream: new THREE.Color(), red: new THREE.Color(), black: new THREE.Color(), motif: new THREE.Color() };
const _a = new THREE.Color(), _b = new THREE.Color();
export function setPalette(t) {
  const arc = ARCS[palName];
  const mixHex = (i) => {
    if (!arc) return _a.set(PAL[i]);
    let k = 0; while (k < arc.length - 1 && t > arc[k + 1][0]) k++;
    if (k === arc.length - 1) return _a.set(arc[k][1][i]);
    const [t0, p0] = arc[k], [t1, p1] = arc[k + 1]; const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    return _a.set(p0[i]).lerp(_b.set(p1[i]), u * u * (3 - 2 * u));
  };
  ["cream", "red", "black"].forEach((r, i) => INK[r].copy(mixHex(i)).convertSRGBToLinear());
  INK.motif.set(MOTIF).convertSRGBToLinear();
}
setPalette(0);

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // we do the sRGB encode in the finish pass
renderer.autoClear = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 3000);

// render targets: scene (MSAA colour + depth), DOF out, accumulation
const rtScene = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4, depthTexture: new THREE.DepthTexture(W, H, THREE.FloatType) });
rtScene.depthTexture.format = THREE.DepthFormat;
const rtDof = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtAcc = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType });

const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quadGeo = new THREE.PlaneGeometry(2, 2);
const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;

const dofMat = new THREE.ShaderMaterial({
  uniforms: { tCol: { value: rtScene.texture }, tDep: { value: rtScene.depthTexture }, near: { value: 0.1 }, far: { value: 3000 },
    focus: { value: 20 }, aperture: { value: 1 }, maxR: { value: 14 }, res: { value: new THREE.Vector2(W, H) } },
  vertexShader: vert,
  fragmentShader: `
  uniform sampler2D tCol, tDep; uniform float near, far, focus, aperture, maxR; uniform vec2 res; varying vec2 vUv;
  float lin(float d){ float z = d * 2. - 1.; return 2. * near * far / (far + near - z * (far - near)); }
  float coc(float z){ return clamp(abs(1. / focus - 1. / z) * aperture * res.y * 0.5, 0., maxR); }
  void main(){
    float z0 = lin(texture2D(tDep, vUv).r); float c0 = coc(z0);
    vec3 acc = vec3(0.); float wsum = 0.;
    const int N = 48; const float GA = 2.39996323;
    for (int i = 0; i < N; i++) {
      float r = sqrt((float(i) + .5) / float(N)); float a = float(i) * GA;
      vec2 o = vec2(cos(a), sin(a)) * r * maxR;
      vec2 uv = vUv + o / res;
      float zs = lin(texture2D(tDep, uv).r); float cs = coc(zs);
      float d = r * maxR;
      // a sample counts if its own blur reaches us; background samples can't spill over a sharp foreground
      float reach = smoothstep(d - 1., d + 1., cs);
      float self = smoothstep(d - 1., d + 1., c0);
      float w = zs < z0 + 0.5 ? reach : min(reach, self);
      w = max(w, i == 0 ? 1. : 0.);
      acc += texture2D(tCol, uv).rgb * w; wsum += w;
    }
    gl_FragColor = vec4(acc / wsum, 1.);
  }`,
  depthTest: false, depthWrite: false,
});
const accMat = new THREE.MeshBasicMaterial({ map: rtDof.texture, transparent: true, opacity: 1 / SUB, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false });

const finMat = new THREE.ShaderMaterial({
  uniforms: { tAcc: { value: rtAcc.texture }, res: { value: new THREE.Vector2(W, H) }, frame: { value: 0 }, weave: { value: new THREE.Vector2() },
    paper: { value: INK.cream.clone() }, vig: { value: 0.55 }, soft: { value: 0.6 } },
  vertexShader: vert,
  fragmentShader: `
  uniform sampler2D tAcc; uniform vec2 res, weave; uniform float frame, vig, soft; uniform vec3 paper; varying vec2 vUv;
  float h(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
  float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
  float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * n2(p); p *= 2.03; a *= .5; } return s; }
  vec3 enc(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
  void main(){
    vec2 px = vUv * res;
    vec2 uv = vUv + weave / res;                       // gate weave moves the print, not the paper
    vec2 t = soft / res; vec3 c = texture2D(tAcc, uv).rgb * .4 + (texture2D(tAcc, uv + vec2(t.x, 0.)).rgb + texture2D(tAcc, uv - vec2(t.x, 0.)).rgb + texture2D(tAcc, uv + vec2(0., t.y)).rgb + texture2D(tAcc, uv - vec2(0., t.y)).rgb) * .15;
    // paper, fixed to the screen: an embossed fibrous tooth lit from the top left (a scanned sheet of rough card),
    // plus slow cloudy variation in the sheet. Multiplied over everything, ink included.
    vec2 p = px / res.y * 720.;
    vec2 q2 = vec2(p.x * .62, p.y);                                   // fibres run a little sideways
    float e = 1.2;
    float hc = fbm(q2 * .09), hx = fbm((q2 + vec2(e, 0.)) * .09), hy = fbm((q2 + vec2(0., e)) * .09);
    float fc = n2(q2 * .3), fx = n2((q2 + vec2(e, 0.)) * .3), fy = n2((q2 + vec2(0., e)) * .3);
    vec2 grad = vec2(hx - hc, hy - hc) * 1.0 + vec2(fx - fc, fy - fc) * .35;
    float relief = dot(grad, normalize(vec2(-.7, .7))) * 2.4;        // light from the top left
    float cloud = fbm(p * .005) - .5;
    float alb = (fbm(q2 * .08 + 7.) - .5) * .06;
    float m = 1. + relief * .42 + cloud * .07 + alb + (fbm(q2 * .045 + 3.) - .5) * .07;
    c *= m;
    // the tooth shows through dark ink too: ink sits on the raised fibres a little thinner
    float luma = dot(c, vec3(.333));
    c += vec3(max(relief, 0.) * .06 + max(alb, 0.) * .3) * (1. - smoothstep(0., .25, luma));
    // vignette
    vec2 d = (vUv - .5) * vec2(res.x / res.y, 1.); float v = 1. - vig * smoothstep(.35, 1.05, length(d));
    c *= v;
    gl_FragColor = vec4(enc(max(c, 0.)), 1.);
  }`,
  depthTest: false, depthWrite: false,
});
const quad = new THREE.Mesh(quadGeo, dofMat); const quadScene = new THREE.Scene(); quadScene.add(quad);

function pass(mat, target, clear = true) {
  quad.material = mat; renderer.setRenderTarget(target); renderer.autoClear = clear; renderer.render(quadScene, quadCam); renderer.autoClear = true;
}
const hash = (n) => { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };

const ctx = { THREE, scene, camera, INK, W, H };
let at = null;
window.renderFrame = (f) => {
  renderer.setRenderTarget(rtAcc); renderer.setClearColor(0x000000, 1); renderer.clear();
  let look = null;
  for (let i = 0; i < SUB; i++) {
    const t = (f + (i + 0.5) / SUB * 0.5 - 0.25) / FPS;   // 180-degree shutter centred on the frame
    setPalette(t);
    look = at(t, ctx);
    scene.background = INK[look.ground];
    renderer.setRenderTarget(rtScene); renderer.render(scene, camera);
    dofMat.uniforms.focus.value = look.focus; dofMat.uniforms.aperture.value = q.has("nodof") ? 0 : (look.aperture ?? 1);
    dofMat.uniforms.near.value = camera.near; dofMat.uniforms.far.value = camera.far;
    pass(dofMat, rtDof);
    pass(accMat, rtAcc, false);
  }
  finMat.uniforms.frame.value = f;
  finMat.uniforms.weave.value.set((hash(f) - .5) * 1.4 + Math.sin(f * .37) * .5, (hash(f + 91) - .5) * 1.0 + Math.sin(f * .23) * .4);
  pass(finMat, null);
};

const story = await import(q.get("v") === "2" ? "./story2.js" : "./story.js");
await loadFont("fonts/Anton-Regular.ttf");
at = story.at;
if (q.has("lineup")) { const lk = await story.lineup(ctx); at = () => lk; } else await story.setup(ctx);
window.ready = true;
if (q.has("f")) window.renderFrame(+q.get("f"));
