// Perspective-illusion look test, our own engine. Every frame is a pure function of time t (seconds, loop of LOOP).
// Per frame: N jittered sub-renders (anti-aliasing plus a 180-degree shutter), each = colour pass + part-id/normal
// pass + ink composite, summed into a float buffer; then grade and vignette to the canvas.
import * as THREE from "./lib/three.module.js";
import { parts, build, textMaterials } from "./kit.js";
import { buildTown, lamps, roadCase, person, piano, PAL } from "./world.js";
import { LOOP, FPS, camAt, casesAt, peopleAt } from "./story.js";

const q = new URLSearchParams(location.search);
const W = +(q.get("w") || 1280), H = +(q.get("h") || 720);
const canvas = document.getElementById("c"); canvas.width = W; canvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;

// ---------- materials
const ramp = new THREE.DataTexture(new Uint8Array([70, 255]), 2, 1, THREE.RedFormat); ramp.needsUpdate = true;
const lampU = { value: Array.from({ length: 24 }, () => new THREE.Vector3(0, -100, 0)) };
function toon(hex) {
  const m = new THREE.MeshToonMaterial({ color: hex, gradientMap: ramp });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uLamps = lampU;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;\nuniform vec3 uLamps[24];")
      .replace("#include <lights_fragment_begin>", `#include <lights_fragment_begin>
float pSh = 1.0;
#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
pSh = getShadow( directionalShadowMap[ 0 ], directionalLightShadows[ 0 ].shadowMapSize, directionalLightShadows[ 0 ].shadowBias, directionalLightShadows[ 0 ].shadowRadius, vDirectionalShadowCoord[ 0 ] );
#endif
float pLit = dot( normal, directionalLights[ 0 ].direction );`)
      .replace("#include <dithering_fragment>", `#include <dithering_fragment>
// warm pools under the street lamps, anchored in the world
float glow = 0.0;
for (int i = 0; i < 24; i++) { vec3 L = uLamps[i]; vec2 dxz = vWP.xz - L.xz; float d2 = dot(dxz, dxz);
  glow += exp(-d2 / 6.5) * (1.0 - smoothstep(0.0, 4.5, vWP.y)) + exp(-d2 / 1.2) * smoothstep(1.5, 4.4, vWP.y) * 0.4; }
gl_FragColor.rgb += vec3(1.0, 0.72, 0.38) * 0.42 * min(glow, 1.4) * diffuseColor.rgb;
// hatching only inside cast shadows on faces that would otherwise be lit; lines anchored in the world
float inCast = (1.0 - pSh) * smoothstep(0.04, 0.22, pLit);
float hs = dot(vWP, normalize(vec3(0.62, 0.5, 0.6))) / 0.17;
float fw = fwidth(hs);
float g = abs(fract(hs) - 0.5);
float hl = 1.0 - smoothstep(0.32 - fw, 0.32 + fw, 0.5 - g);
float dense = smoothstep(0.22, 0.45, fw);
float hatch = inCast * mix(hl * 0.75, 0.3, dense);
gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.11, 0.09, 0.14), hatch * 0.62);`);
  };
  m.customProgramCacheKey = () => "toonhatch";
  return m;
}
const matCache = new Map();
function makeMat(key) {
  if (matCache.has(key)) return matCache.get(key);
  let m;
  if (key.startsWith("t:")) m = toon(key.slice(2));
  else if (key.startsWith("e:")) m = new THREE.MeshBasicMaterial({ color: key.slice(2) });
  else { const t = textMaterials.get(key); m = t.glow ? new THREE.MeshBasicMaterial({ map: t.tex }) : toon("#ffffff"); if (!t.glow) m.map = t.tex; }
  matCache.set(key, m); return m;
}
const idMat = new THREE.ShaderMaterial({
  vertexShader: `attribute float pid; varying vec3 vN; varying float vId;
    void main(){ vN = normalize(normalMatrix * normal); vId = pid; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `varying vec3 vN; varying float vId; void main(){ gl_FragColor = vec4(normalize(vN) * 0.5 + 0.5, vId); }`,
});

// ---------- scenes
const colorScene = new THREE.Scene(), idScene = new THREE.Scene();
buildTown();
const town = build(parts, makeMat, idMat);
colorScene.add(town.color); idScene.add(town.idMesh);

function movable(fill) {
  const list = []; fill(list);
  const b = build(list, makeMat, idMat);
  colorScene.add(b.color); idScene.add(b.idMesh);
  return { set(p, ry = 0, s = 1) { for (const o of [b.color, b.idMesh]) { o.position.set(...p); o.rotation.set(0, ry, 0); o.scale.setScalar(s); } } };
}
const cases = ["BW 01", "BW 02", "KEYS", "BW 04", "MERCH"].map((t) => movable((l) => roadCase(l, t)));
const coats = [["#b8443a", "#2f6c6a"], ["#3d4f7a", "#c99a3c"], ["#6f8a5a", "#b8443a"], ["#c9963f", "#3d4f7a"], ["#7a3b52", "#e2d2ad"], ["#2f6c6a", "#b8443a"]];
const people = coats.map(([c, h]) => movable((l) => person(l, c, h)));
movable(piano).set([-4.6, 0.1, -88.2], 0.15);

// sky: a gradient dome that follows the camera
const sky = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { top: { value: new THREE.Color("#1f2b57") }, mid: { value: new THREE.Color("#7b6a9e") }, hor: { value: new THREE.Color("#f2ad86") } },
  vertexShader: `varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }`,
  fragmentShader: `uniform vec3 top, mid, hor; varying vec3 vD; void main(){ float y = normalize(vD).y;
    vec3 c = y < 0.12 ? mix(hor, mid, smoothstep(-0.02, 0.12, y)) : mix(mid, top, smoothstep(0.12, 0.55, y));
    gl_FragColor = vec4(c, 1.0); }`,
}));
sky.renderOrder = -1; sky.frustumCulled = false; colorScene.add(sky);

const sun = new THREE.DirectionalLight("#ffc9a6", 2.6);
sun.position.set(-110, 80, 60); sun.target.position.set(0, 0, -40);
sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 1, far: 400 });
colorScene.add(sun, sun.target, new THREE.HemisphereLight("#9aa9dc", "#c7b2b5", 1.25));

// ---------- passes
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quad = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)); return s; };
const rtCol = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const rtId = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtAcc = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthBuffer: false });
const vs = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const inkMat = new THREE.ShaderMaterial({
  uniforms: { col: { value: rtCol.texture }, nd: { value: rtId.texture }, res: { value: new THREE.Vector2(W, H) }, w: { value: 1 }, ink: { value: new THREE.Color(PAL.ink) } },
  vertexShader: vs, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, depthTest: false, depthWrite: false,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float w; uniform vec3 ink; varying vec2 vUv;
    void main(){
      vec4 c0 = texture2D(nd, vUv); vec3 n0 = c0.rgb * 2.0 - 1.0; float e = 0.0;
      for (int i = 0; i < 4; i++) {
        vec2 o = (i == 0 ? vec2(1, 0) : i == 1 ? vec2(-1, 0) : i == 2 ? vec2(0, 1) : vec2(0, -1)) / res;
        vec4 s = texture2D(nd, vUv + o);
        if (abs(s.a - c0.a) > 0.5) e = 1.0;
        else if (c0.a > 0.5) e = max(e, smoothstep(0.9, 0.55, dot(n0, s.rgb * 2.0 - 1.0)));
      }
      vec3 c = texture2D(col, vUv).rgb;
      c = mix(c, ink, e * 0.92);
      gl_FragColor = vec4(c * w, w);
    }`,
});
const finMat = new THREE.ShaderMaterial({
  uniforms: { acc: { value: rtAcc.texture } }, vertexShader: vs,
  fragmentShader: `uniform sampler2D acc; varying vec2 vUv;
    void main(){ vec4 a = texture2D(acc, vUv); vec3 c = a.rgb / max(a.a, 1e-4);
      float l = dot(c, vec3(0.2126, 0.7152, 0.0722)); c = mix(vec3(l), c, 1.08);
      vec2 q = vUv - 0.5; c *= 1.0 - 0.32 * dot(q * vec2(1.0, 0.8), q * vec2(1.0, 0.8)) * 1.8;
      gl_FragColor = linearToOutputTexel(vec4(c, 1.0)); }`,
});
const inkScene = quad(inkMat), finScene = quad(finMat);

// ---------- camera
const camera = new THREE.PerspectiveCamera(30, W / H, 0.5, 3000);
function placeCamera(t, jx = 0, jy = 0) {
  const k = camAt(t);
  const yaw = THREE.MathUtils.degToRad(k.yaw), el = THREE.MathUtils.degToRad(k.el);
  const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el));
  const half = THREE.MathUtils.degToRad(k.fov) / 2, d = k.W / 2 / Math.tan(half);
  const F = new THREE.Vector3(...k.F);
  camera.position.copy(F).addScaledVector(dir, d);
  camera.up.set(0, 1, 0); camera.lookAt(F);
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(half) / camera.aspect));
  camera.near = Math.max(0.4, d * 0.35); camera.far = d + 1600;
  camera.setViewOffset(W, H, jx, jy - k.sy * H, W, H);
  camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  sky.position.copy(camera.position); sky.scale.setScalar(camera.far * 0.9);
  return { F, d };
}

function setWorld(t) {
  casesAt(t).forEach((c, i) => cases[i].set(c.p, c.ry, c.s));
  peopleAt(t).forEach((c, i) => people[i].set(c.p, c.ry, 1));
}

// screen speed of a few world points, used to choose the number of sub-renders
const probes = [[0, 1, -84], [-10, 6, -84], [10, 6, -84], [0, 12, -92], [0, 0, -40], [5, 4, -20], [0, 250, -760]].map((p) => new THREE.Vector3(...p));
function screenOf(t) { placeCamera(t); return probes.map((p) => p.clone().project(camera)); }
function speedPx(t, dt) {
  const a = screenOf(t - dt / 2), b = screenOf(t + dt / 2); let m = 0;
  a.forEach((p, i) => { if (p.z < 1 && b[i].z < 1) m = Math.max(m, Math.hypot((p.x - b[i].x) * W / 2, (p.y - b[i].y) * H / 2)); });
  return m;
}
const halton = (i, b) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; };

function frameAt(f) {
  const t0 = f / FPS, shutter = 0.5 / FPS;
  const px = speedPx(t0, shutter);
  const N = Math.min(32, Math.max(5, Math.ceil(px / 1.2)));
  setWorld(t0); placeCamera(t0);
  // the sun's shadow map depends only on the world, render it once per frame
  colorScene.updateMatrixWorld(); renderer.shadowMap.needsUpdate = true;
  renderer.setRenderTarget(rtAcc); renderer.setClearColor(0x000000, 0); renderer.clear();
  for (let i = 0; i < N; i++) {
    const t = ((t0 + (i + 0.5) / N * shutter - shutter / 2) % LOOP + LOOP) % LOOP;
    setWorld(t);
    placeCamera(t, halton(i + 1, 2) - 0.5, halton(i + 1, 3) - 0.5);
    renderer.setRenderTarget(rtCol); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(colorScene, camera);
    renderer.shadowMap.needsUpdate = false;
    renderer.setRenderTarget(rtId); renderer.setClearColor(new THREE.Color(0.5, 0.5, 1), 0); renderer.clear(); renderer.render(idScene, camera);
    inkMat.uniforms.w.value = 1 / N;
    renderer.setRenderTarget(rtAcc); renderer.autoClear = false; renderer.render(inkScene, fsCam); renderer.autoClear = true;
  }
  renderer.setRenderTarget(null); renderer.render(finScene, fsCam);
  return N;
}

// lamp pools: the 24 lamps nearest the hall, which is where the camera ends up close
lamps.slice().sort((a, b) => a.z - b.z).slice(0, 24).forEach((l, i) => lampU.value[i].copy(l));

window.renderFrame = (f) => frameAt(f);
window.FRAMES = Math.round(LOOP * FPS);
document.fonts.ready.then(() => { frameAt(0); window.ready = true; });
