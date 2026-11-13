// main.js: draws film frame f. Every frame is a pure function of f: N jittered sub-renders (anti-aliasing, and a
// flame with a size, so the shadows are soft and widen with distance) summed into a float buffer, then a small
// glow on the lit paper, a vignette and the grade. window.renderFrame(f), window.ready, window.exportBlocking().
import { THREE, clamp } from "./kit.js";
import { buildWorld } from "./table.js";
import { makeTreeman, makeCitizen } from "./figures.js";
import * as S from "./story.js";
import { CUES } from "./cues.js";
import { buildSkin } from "./skin.js";

const q = new URLSearchParams(location.search);
const W = +(q.get("w") || 720), H = +(q.get("h") || Math.round((W * 16) / 9)), NS = +(q.get("n") || 10);
const LINEUP = q.has("lineup");
const canvas = document.getElementById("c"); canvas.width = W; canvas.height = H;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NoToneMapping;

const CHECKCAM = q.get("cam") ? q.get("cam").split(",").map(Number) : null;      // a camera for check stills that the film never uses
const SKIN = S.SKIN;      // test 03: the painted cards (index.html?skin=1)
const scene = new THREE.Scene(); scene.background = new THREE.Color(SKIN ? "#000000" : "#0b0e2a");
const camera = new THREE.PerspectiveCamera(S.FOV, W / H, 0.35, 2500);
const world = SKIN ? null : buildWorld(scene), skin = SKIN ? await buildSkin(scene) : null;
const treeman = SKIN ? null : makeTreeman(); if (treeman) scene.add(treeman.root);
const citizens = SKIN ? [] : S.CITIZENS.map((d) => { const c = makeCitizen(d); scene.add(c.root); return c; });
const figures = SKIN ? skin.figures : [treeman, ...citizens];

// ---------- passes
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const pass = (frag, uniforms, extra = {}) => { const m = new THREE.ShaderMaterial({ uniforms, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }", fragmentShader: frag, depthTest: false, depthWrite: false, ...extra }); const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, m)); return { s, m }; };
const rt = (w, h, depth = false) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: depth, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
const rtScene = rt(W, H, true), rtAcc = rt(W, H), bw = W >> 2, bh = H >> 2, rtB = [rt(bw, bh), rt(bw, bh)];
const add = pass("uniform sampler2D t; uniform float k; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(t, vUv).rgb * k, 1.0); }", { t: { value: rtScene.texture }, k: { value: 1 } }, { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor });
const bright = pass(SKIN
  ? "uniform sampler2D t; varying vec2 vUv; void main(){ vec3 c = texture2D(t, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * (smoothstep(1.02, 1.5, l) + 0.3 * smoothstep(0.66, 0.78, (c.r - c.b) / max(c.r, 0.001)) * smoothstep(0.55, 0.95, l)), 1.0); }"      // the flame, and faintly the lit windows (bright and strongly warm); the cloth is capped at 1 and barely feeds it
  : "uniform sampler2D t; varying vec2 vUv; void main(){ vec3 c = texture2D(t, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(0.95, 1.6, l), 1.0); }", { t: { value: rtAcc.texture } });
const blur = pass(`uniform sampler2D t; uniform vec2 d; varying vec2 vUv; void main(){ vec3 c = texture2D(t, vUv).rgb * 0.227;
  c += (texture2D(t, vUv + d * 1.385).rgb + texture2D(t, vUv - d * 1.385).rgb) * 0.316; c += (texture2D(t, vUv + d * 3.231).rgb + texture2D(t, vUv - d * 3.231).rgb) * 0.0703; gl_FragColor = vec4(c, 1.0); }`, { t: { value: null }, d: { value: new THREE.Vector2() } });
const final = pass(`uniform sampler2D t, b; uniform float expo, skin, sat; uniform vec3 tint; varying vec2 vUv;
  void main(){ vec3 c = texture2D(t, vUv).rgb + texture2D(b, vUv).rgb * 0.55;
    vec2 p = vUv - 0.5; float v = 1.0 - 0.42 * smoothstep(0.25, 0.95, length(p * vec2(1.0, 1.25)));
    c *= v * expo;
    if (skin > 0.5) { c = mix(c, 0.72 + 0.28 * (1.0 - exp(-(c - 0.72) / 0.28)), step(0.72, c));      // the paint as painted; only the brightest cloth and the flame roll off
      c = pow(c, vec3(1.0 / 2.2)); c = mix(c, c * c * (3.0 - 2.0 * c), 0.22); c *= vec3(1.03, 1.0, 0.94); c += vec3(0.012, 0.005, 0.0) * (1.0 - c); }
    else { c = 1.0 - exp(-c * 1.15);                                   // soft shoulder, no clipping
      c = pow(c, vec3(1.0 / 2.2)); c = mix(c, c * c * (3.0 - 2.0 * c), 0.35); }
    if (sat != 1.0) c = mix(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))), c, sat);      // a section's grade hook (story.js gradeAt): saturation, then a tint, on the graded picture
    if (tint != vec3(1.0)) c *= tint;
    gl_FragColor = vec4(c, 1.0); }`, { t: { value: rtAcc.texture }, b: { value: rtB[0].texture }, expo: { value: 1 }, skin: { value: SKIN ? 1 : 0 }, sat: { value: 1 }, tint: { value: new THREE.Vector3(1, 1, 1) } });

const halton = (i, b) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; };
const cityOn = (f) => clamp((f - S.C.newyork1 - 8) / 50);
const _t = new THREE.Vector3();

function setState(f, jitter) {
  if (SKIN) { const g = S.gradeAt(f); final.m.uniforms.expo.value = g.expo; final.m.uniforms.sat.value = g.sat; final.m.uniforms.tint.value.set(...g.tint);       // the flare on "escape" (section 7) opens the exposure a little, and every section's grade hook; 1, 1, [1, 1, 1] otherwise
    const cam = CHECKCAM ? { P: CHECKCAM.slice(0, 3), T: CHECKCAM.slice(3), fov: S.FOV } : S.camAt(f); skin.update(f, jitter, cam); camera.position.set(...cam.P); camera.up.set(0, 1, 0); camera.lookAt(_t.set(...cam.T)); camera.fov = cam.fov; camera.updateProjectionMatrix(); return cam; }
  const fl = world.update(f, jitter), on = cityOn(f);
  world.candle.key.intensity = 62 * fl.gain; world.candle.bounce.intensity = 34 + 46 * on; world.hemi.intensity = 0.6 + 0.5 * on;
  treeman.pose(S.treemanAt(f)); citizens.forEach((c, i) => c.pose(S.citizenAt(i, f)));
  let cam = S.camAt(f);
  if (LINEUP) {       // the cast line-up: the tree man walking and standing, a citizen walking and standing, by the candle
    const z = -24, st = (x, phase, walk, more) => ({ x, y: 0, z, yaw: 0, phase, L: 2.05, walk, lean: 0, hitch: 0, visible: true, ...more });
    treeman.pose(st(-1.6, 0.42, 1, { L: 2.6 })); citizens[0].pose(st(1.9, 1.5, 1)); citizens[1].pose(st(4.6, 0, 0)); citizens[2].pose(st(6.9, 0.3, 1, { yaw: Math.PI }));
    citizens.slice(3).forEach((c) => (c.root.visible = false));
    cam = { P: [2.6, 2.7, z + 6.1], T: [2.6, 2.4, z], fov: S.FOV };
  }
  camera.position.set(...cam.P); camera.up.set(0, 1, 0); camera.lookAt(_t.set(...cam.T)); camera.fov = cam.fov; camera.updateProjectionMatrix();
  world.eye.position.set(...cam.P); world.eye.target.position.set(...cam.T);
  return cam;
}
window.renderFrame = (f, n = NS) => {
  renderer.setRenderTarget(rtAcc); renderer.setClearColor(0x000000, 1); renderer.clear();
  add.m.uniforms.k.value = 1 / n;
  for (let i = 0; i < n; i++) {
    const a = halton(i + 1, 2) * Math.PI * 2, r = 0.42 * Math.sqrt(halton(i + 1, 3)), y = (halton(i + 1, 5) - 0.5) * 0.9;
    setState(f, [Math.cos(a) * r, y, Math.sin(a) * r]);
    camera.setViewOffset(W, H, halton(i + 1, 7) - 0.5, halton(i + 1, 11) - 0.5, W, H);
    renderer.setRenderTarget(rtScene); renderer.autoClear = true; renderer.render(scene, camera);
    renderer.setRenderTarget(rtAcc); renderer.autoClear = false; renderer.render(add.s, fsCam);
  }
  camera.clearViewOffset(); renderer.autoClear = true;
  bright.m.uniforms.t.value = rtAcc.texture; renderer.setRenderTarget(rtB[0]); renderer.render(bright.s, fsCam);
  for (const step of [1, 2.2]) {
    blur.m.uniforms.t.value = rtB[0].texture; blur.m.uniforms.d.value.set(step / bw, 0); renderer.setRenderTarget(rtB[1]); renderer.render(blur.s, fsCam);
    blur.m.uniforms.t.value = rtB[1].texture; blur.m.uniforms.d.value.set(0, step / bh); renderer.setRenderTarget(rtB[0]); renderer.render(blur.s, fsCam);
  }
  renderer.setRenderTarget(null); renderer.render(final.s, fsCam);
  return n;
};

// ---------- checks the tools read
// the camera per frame, and how tall each visible figure stands on screen (px)
window.camInfo = (f) => { const c = S.camAt(f); return { f, P: c.P, T: c.T, fov: c.fov }; };
window.figurePx = (f) => {
  setState(f, [0, 0, 0]); camera.updateMatrixWorld(true); scene.updateMatrixWorld(true);
  const out = {}; for (const fig of figures) { if (!fig.root.visible) continue;
    const a = new THREE.Vector3().setFromMatrixPosition(fig.root.matrixWorld), b = a.clone(); b.y += fig.h; const za = a.clone().project(camera), zb = b.project(camera);
    if (za.z > 1 || Math.abs(za.x) > 1.05 || Math.abs(za.y) > 1.2) continue; out[fig.root.name || fig.name] = Math.round(Math.abs(zb.y - za.y) * H / 2); }
  return out;
};
// what the lens is inside of or grazing at frame f: every visible mesh whose own box comes within lim cm of the camera
// (measured in the mesh's own space, so a thin card's box is thin). The cloth, the room and the far cards are left out.
window.camNear = (f, lim = 1.2) => {
  const cam = setState(f, [0, 0, 0]); scene.updateMatrixWorld(true);
  const P = new THREE.Vector3(...cam.P), p = new THREE.Vector3(), q3 = new THREE.Vector3(), inv = new THREE.Matrix4(), sc = new THREE.Vector3(), out = {};
  scene.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    for (let a = o; a; a = a.parent) if (!a.visible) return;
    const m = o.material; if (m && m.transparent && m.opacity !== undefined && m.opacity < 0.05) return;
    let name = ""; for (let a = o; a && !name; a = a.parent) name = a.name; if (!name || /^(cloth|room|world|slots)|far_tables|glint|shadow/i.test(name)) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    p.copy(P).applyMatrix4(inv.copy(o.matrixWorld).invert()); o.geometry.boundingBox.clampPoint(p, q3);
    sc.setFromMatrixScale(o.matrixWorld); const d = Math.hypot((p.x - q3.x) * sc.x, (p.y - q3.y) * sc.y, (p.z - q3.z) * sc.z);
    if (d < lim && (out[name] === undefined || d < out[name])) out[name] = +d.toFixed(2);
  });
  return out;
};

// what fell back to a stub or was left out (story.js FAILED), and the registry's pieces: NAMES=1 node tools/render.mjs
window.paperFailed = () => S.FAILED.map((x) => ({ ...x }));
window.paperNames = () => (skin ? skin.reg.begin() || skin.reg.list() : []);
window.paperSections = () => S.SECTIONS.map((s, i) => ({ n: i + 1, F0: s.F0, F1: s.F1, stub: !!s.stub, cues: Object.keys(s.C || {}).length, beats: s.BEATS.length }));

// ---------- blocking export: every named object, as sparse per-frame samples of its transform under its named parent
function namedParent(o) { let p = o.parent; while (p && !p.name) p = p.parent; return p; }
function localUnder(o, p, m = new THREE.Matrix4()) { m.copy(o.matrixWorld); if (p) m.premultiply(new THREE.Matrix4().copy(p.matrixWorld).invert()); return m; }
function localBox(o) {
  const inv = new THREE.Matrix4().copy(o.matrixWorld).invert(), box = new THREE.Box3(), b = new THREE.Box3();
  o.traverse((m) => { if (m.isMesh && m.geometry) { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); b.copy(m.geometry.boundingBox).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld)); box.union(b); } });
  return box;
}
const r3 = (v, d = 3) => +v.toFixed(d);
window.exportBlocking = (fa = S.F0, fb = S.F1) => {
  const objs = []; scene.traverse((o) => { if (o.name && o.name !== "world") objs.push(o); });
  setState(fa, [0, 0, 0]); scene.updateMatrixWorld(true);
  const out = {
    about: "paper-world blocking. Units: centimetres. Right-handed, y up, the cloth is y = 0, x to the right, z toward the viewer (near place setting at +z). Quaternions are [x, y, z, w]. Object transforms are local to the named parent ('parent'; null = world). A track lists only the frames where the transform changed: hold the last listed value until the next (figures are posed on twos). visible lists [frame, 0|1] changes.",
    fps: S.FPS, f0: fa, f1: fb, frames: fb - fa, width: W, height: H, cues: { ...CUES, ...S.CUES_ALL }, beats: S.BEATS.map(([f, word, what]) => ({ f, word, what })),
    layout: S.LAY, fence_polygon_xz: S.FENCE_POLY, camera: { fov_vertical_deg: S.FOV, near: camera.near, frames: [] }, objects: {},
  };
  const P = new THREE.Vector3(), Q = new THREE.Quaternion(), Sc = new THREE.Vector3(), M = new THREE.Matrix4(), last = new Map();
  for (const o of objs) {
    const p = namedParent(o), box = o.isLight ? null : localBox(o);
    out.objects[o.name] = { parent: p && p.name !== "world" ? p.name : null, type: o.isLight ? o.type : o.isMesh ? "mesh" : "group",
      size: box && !box.isEmpty() ? box.getSize(new THREE.Vector3()).toArray().map((v) => r3(v)) : null, bbox_min: box && !box.isEmpty() ? box.min.toArray().map((v) => r3(v)) : null,
      kind: o.userData.kind, track: { f: [], pos: [], quat: [], scale: [] }, visible: [] };
  }
  for (let f = fa; f < fb; f++) {
    const cam = setState(f, [0, 0, 0]); scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    out.camera.frames.push({ f, pos: cam.P.map((v) => r3(v)), target: cam.T.map((v) => r3(v)), quat: camera.quaternion.toArray().map((v) => r3(v, 5)) });
    for (const o of objs) {
      const p = namedParent(o), rec = out.objects[o.name]; let vis = true; for (let a = o; a; a = a.parent) if (!a.visible) { vis = false; break; }
      if (!rec.visible.length || rec.visible[rec.visible.length - 1][1] !== +vis) rec.visible.push([f, +vis]);
      localUnder(o, p && p.name !== "world" ? p : null, M).decompose(P, Q, Sc);
      const key = [P.x, P.y, P.z].map((v) => r3(v)).join() + "|" + Q.toArray().map((v) => r3(v, 4)).join() + "|" + Sc.toArray().map((v) => r3(v)).join();
      if (last.get(o.name) === key) continue; last.set(o.name, key);
      rec.track.f.push(f); rec.track.pos.push(P.toArray().map((v) => r3(v))); rec.track.quat.push(Q.toArray().map((v) => r3(v, 4))); rec.track.scale.push(Sc.toArray().map((v) => r3(v)));
    }
  }
  return JSON.stringify(out);
};

// ---------- in a browser: ?f=2300 shows one frame, otherwise the section plays on a loop
const one = q.get("f");
if (one !== null) window.renderFrame(+one);
else if (!q.has("still")) { let f = S.F0; const tick = () => { window.renderFrame(f, 4); f = f + 1 >= S.F1 ? S.F0 : f + 1; setTimeout(tick, 20); }; if (!navigator.webdriver) tick(); }
window.ready = true;
