// Renderer and passes. One frame: colour, normal+depth, ink and grade, lens. Everything comes from song time.
import * as THREE from "./lib/three.module.js";
import { Pen, bodyFront } from "./toon.js";
import { drawCow, drawChicken, drawMouse } from "./beasts.js";
import { puff, softBlob } from "./paint.js";
import { buildWorld } from "./world.js";
import * as S from "./story.js";

const q = new URLSearchParams(location.search);
const WD = +(q.get("w") || 720), HT = +(q.get("h") || 1280), PX = HT / 1920;
const WORDS = window.WORDS || { law: "THE LAW", cheap: "PRICE", evict: "NOTICE", report: "REPORT", facts: "FACTS", stamp: "STAMP" };
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(WD, HT, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const LY = { WORLD: 0, CARD: 1, SKY: 2, COLOUR: 3 };
const scene = new THREE.Scene(); scene.fog = new THREE.Fog("#cfe3f5", 130, 1300);
const camera = new THREE.PerspectiveCamera(40, WD / HT, 0.08, 2600);
const sun = new THREE.DirectionalLight("#ffffff", 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
const hemi = new THREE.HemisphereLight("#ffffff", "#888888", 1);
scene.add(sun, sun.target, hemi);
sun.layers.enableAll(); hemi.layers.enableAll(); sun.target.layers.enableAll();

const W = buildWorld(scene, WORDS);
W.lamp.layers.enableAll();

// sky
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, disc: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(2200, 28, 18), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
  vertexShader: "varying vec3 d; void main(){ d=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }",
  fragmentShader: "varying vec3 d; uniform vec3 top,hor,sunDir; uniform float disc; void main(){ vec3 n=normalize(d); vec3 c=mix(hor,top,pow(clamp(n.y,0.,1.),.55)); float s=smoothstep(.9985,.9992,dot(n,sunDir))*disc; c=mix(c,vec3(1.,.86,.66),s); gl_FragColor=vec4(c,1.);}" }));
sky.layers.set(LY.SKY); sky.renderOrder = -10; scene.add(sky);
// clouds
const cloudTex = puff("#fbfbf6", "#fbfbf6"); const clouds = [];
for (let i = 0; i < 14; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.46), new THREE.MeshBasicMaterial({ map: cloudTex, alphaTest: 0.5, fog: false, color: "#ffffff", side: THREE.DoubleSide }));
  const a = (i / 14) * 6.283 + i * 0.7, d = 980 + (i % 4) * 120; m.position.set(Math.cos(a) * d, 200 + (i * 53) % 240, Math.sin(a) * d); m.scale.setScalar(340 + (i * 37) % 260); m.layers.set(LY.SKY); clouds.push(m); scene.add(m);
}

// pooled cards and sprites
const CARD_W = 1.35, CARD_H = 2.25;
const planeFor = (w, h, soles) => { const g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2 - h * soles, 0); return g; };
const beanGeo = planeFor(CARD_W, CARD_H, 0.025);
const spriteGeo = planeFor(1, 800 / 600, 20 / 800);
const NDV = "varying vec3 vN; varying float vD; varying vec2 vU; void main(){ vec4 p=vec4(position,1.); vec3 n=normal; vU=uv; \n#ifdef USE_INSTANCING\n p=instanceMatrix*p; n=mat3(instanceMatrix)*n;\n#endif\n vec4 mv=modelViewMatrix*p; vN=normalize(normalMatrix*n); vD=-mv.z; gl_Position=projectionMatrix*mv; }";
const ndWorld = new THREE.ShaderMaterial({ vertexShader: NDV, side: THREE.DoubleSide, blending: THREE.NoBlending, fragmentShader: "varying vec3 vN; varying float vD; void main(){ gl_FragColor=vec4(normalize(vN)*.5+.5,vD);}" });
const matsFor = (() => {
  const all = new Map();
  return (tex) => {
    let m = all.get(tex);
    if (!m) {
      m = {
        basic: new THREE.MeshBasicMaterial({ map: tex, alphaToCoverage: true, alphaTest: 0.04, side: THREE.DoubleSide, fog: false }),
        depth: new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, side: THREE.DoubleSide }),
        nd: new THREE.ShaderMaterial({ vertexShader: NDV, side: THREE.DoubleSide, blending: THREE.NoBlending, uniforms: { map: { value: tex } }, fragmentShader: "uniform sampler2D map; varying float vD; varying vec2 vU; void main(){ if(texture2D(map,vU).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD);}" }),
      };
      all.set(tex, m);
    }
    return m;
  };
})();
const allBasics = () => { const r = []; scene.traverse((o) => { if (o.userData.isCard && o.visible) r.push(o); }); return r; };
const blobTex = softBlob();
const mkBlob = () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: false })); m.rotation.x = -Math.PI / 2; m.layers.set(LY.COLOUR); m.renderOrder = 2; scene.add(m); return m; };

const CW = 960, CH = 1600;
const beans = new Map();
const beanFor = (id) => {
  let b = beans.get(id);
  if (!b) {
    const c = document.createElement("canvas"); c.width = CW; c.height = CH;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
    const mats = matsFor(tex), mesh = new THREE.Mesh(beanGeo, mats.basic);
    mesh.customDepthMaterial = mats.depth; mesh.castShadow = true; mesh.layers.set(LY.CARD); mesh.userData.isCard = true; mesh.userData.nd = mats.nd; scene.add(mesh);
    b = { c, g: c.getContext("2d"), tex, mesh, blob: mkBlob(), key: "" };
    b.pen = new Pen(b.g); beans.set(id, b);
  }
  return b;
};
const rd = (x) => (typeof x === "number" ? Math.round(x * 50) / 50 : x);

const spriteCache = new Map();
const spriteTex = (kind, pose) => {
  const key = kind + JSON.stringify(pose, (_k, v) => rd(v));
  let t = spriteCache.get(key);
  if (!t) {
    const c = document.createElement("canvas"); c.width = 600; c.height = 800;
    const g = c.getContext("2d"), p = new Pen(g);
    if (kind === "cow") drawCow(p, pose); else if (kind === "chicken") drawChicken(p, pose); else drawMouse(p, pose);
    t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
    spriteCache.set(key, t);
  }
  return t;
};
const sprites = [];
const spriteAt = (i) => {
  if (!sprites[i]) { const m = new THREE.Mesh(spriteGeo, new THREE.MeshBasicMaterial()); m.layers.set(LY.CARD); m.castShadow = true; m.userData.isCard = true; scene.add(m); sprites[i] = { mesh: m, blob: mkBlob() }; }
  return sprites[i];
};
const fxTex = { dust: puff("#efe2c4", "#c9b48c"), poison: puff("#97d640", "#5d9a26") };
const fxPool = [];
const fxAt = (i) => {
  if (!fxPool[i]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, alphaTest: 0.02, fog: false, side: THREE.DoubleSide })); m.layers.set(LY.CARD); m.userData.isCard = true; m.renderOrder = 5; scene.add(m); fxPool[i] = m; }
  return fxPool[i];
};

// render targets
const colourRT = new THREE.WebGLRenderTarget(WD, HT, { type: THREE.HalfFloatType, samples: 4 });
const ndRT = new THREE.WebGLRenderTarget(WD, HT, { type: THREE.FloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const inkRT = new THREE.WebGLRenderTarget(WD, HT, { type: THREE.HalfFloatType, depthBuffer: false });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const FSV = "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.);}";
const inkMat = new THREE.ShaderMaterial({
  vertexShader: FSV, depthTest: false, depthWrite: false,
  uniforms: { col: { value: colourRT.texture }, nd: { value: ndRT.texture }, res: { value: new THREE.Vector2(WD, HT) }, px: { value: 2.5 * PX }, sat: { value: 1 }, vig: { value: 0 }, flash: { value: 0 }, gain: { value: new THREE.Vector3(1, 1, 1) }, lift: { value: new THREE.Vector3() } },
  fragmentShader: `varying vec2 vUv; uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 gain, lift;
  float edge(vec2 uv){
    vec4 c = texture2D(nd, uv); if (c.a <= 0. || dot(c.rgb, c.rgb) < .01) return 0.;
    float d = c.a; vec3 n = c.rgb*2.-1.; float e = 0.; float rr = px*clamp(7./d, .62, 1.25); float w0 = 1./d;
    // opposite pairs: on any plane 1/z is linear, so a ground at a grazing angle gives no false edge
    for (int i=0;i<8;i++){ float a = float(i)*.7854 + (i>3 ? .3927 : 0.); float k = i>3 ? .55 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res;
      vec4 s1 = texture2D(nd, uv+o), s2 = texture2D(nd, uv-o);
      bool c1 = dot(s1.rgb,s1.rgb) < .01, c2 = dot(s2.rgb,s2.rgb) < .01;
      if ((c1 && s1.a > 0.) || (c2 && s2.a > 0.)) continue;   // a card next door: cards carry their own ink
      float w1 = c1 ? 0. : 1./s1.a, w2 = c2 ? 0. : 1./s2.a;   // sky has 1/z = 0
      e = max(e, smoothstep(.012,.05,-(w1+w2-2.*w0)/w0));
      if (!c1 && abs(s1.a-d)/d < .06) e = max(e, smoothstep(.88,.72,dot(n, s1.rgb*2.-1.))*.9);
      if (!c2 && abs(s2.a-d)/d < .06) e = max(e, smoothstep(.88,.72,dot(n, s2.rgb*2.-1.))*.9);
    }
    return e*(1.-smoothstep(140.,520.,d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb; float e = edge(vUv);
    c = mix(c, vec3(.012,.01,.014), e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift; vec2 q = vUv-.5; c *= 1.-vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, vec3(1.), flash); gl_FragColor = vec4(c,1.);
  }` });
const dofMat = new THREE.ShaderMaterial({
  vertexShader: FSV, depthTest: false, depthWrite: false,
  uniforms: { src: { value: inkRT.texture }, nd: { value: ndRT.texture }, res: { value: new THREE.Vector2(WD, HT) }, focus: { value: 5 }, cinf: { value: 0 } },
  fragmentShader: `varying vec2 vUv; uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1.-focus/d; return k > 0. ? cinf*k : min(-k*cinf, cinf*1.4); }
  vec3 toS(vec3 c){ c = clamp(c,0.,1.); return mix(c*12.92, 1.055*pow(c,vec3(1./2.4))-.055, step(.0031308,c)); }
  void main(){
    float c0 = coc(vUv); vec3 col;
    if (cinf < .4 || c0 < .5) col = texture2D(src, vUv).rgb;
    else { vec3 acc = vec3(0.); float ws = 0.;
      for (int i=0;i<48;i++){ float fi = float(i), r = sqrt((fi+.5)/48.), a = fi*2.39996; vec2 o = vec2(cos(a),sin(a))*r*c0/res;
        float cs = coc(vUv+o), w = smoothstep(r*c0-1.5, r*c0+.5, cs+.5); acc += texture2D(src, vUv+o).rgb*w; ws += w; }
      col = acc/max(ws,1e-3); }
    gl_FragColor = vec4(toS(col),1.);
  }` });
const fsScene = new THREE.Scene(); const fsQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), inkMat); fsQuad.frustumCulled = false; fsScene.add(fsQuad);

const col = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k);
const num = (a, b, k) => a + (b - a) * k;

function renderFrame(f) {
  const t = S.T0 + f / S.FPS;
  const { a, b, k, az: azDeg } = S.lightAt(t);
  // camera
  const c = S.camAt(t);
  camera.position.set(...c.p); camera.fov = c.fov; camera.up.set(0, 1, 0); camera.lookAt(...c.l); camera.rotateZ((c.roll * Math.PI) / 180); camera.updateProjectionMatrix();
  sky.position.copy(camera.position);
  // light
  const az = (azDeg * Math.PI) / 180, el = (num(a.el, b.el, k) * Math.PI) / 180;
  const sdir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  const look = new THREE.Vector3(...c.l), dist = camera.position.distanceTo(look);
  const ext = THREE.MathUtils.clamp(dist * 1.05, 8, 60);
  sun.color = col(a.sun, b.sun, k); sun.intensity = num(a.sunI, b.sunI, k);
  sun.target.position.copy(look); sun.position.copy(look).addScaledVector(sdir, 200); sun.target.updateMatrixWorld();
  const sc = sun.shadow.camera; sc.left = sc.bottom = -ext; sc.right = sc.top = ext; sc.near = 10; sc.far = 420; sc.updateProjectionMatrix();
  hemi.color = col(a.sky, b.sky, k); hemi.groundColor = col(a.gnd, b.gnd, k); hemi.intensity = num(a.hemi, b.hemi, k);
  const hor = col(a.hor, b.hor, k), top = col(a.top, b.top, k);
  skyU.top.value.copy(top); skyU.hor.value.copy(hor); skyU.sunDir.value.copy(sdir); skyU.disc.value = k > 0.05 ? 1 : 0;
  scene.fog.color.copy(hor); scene.fog.near = num(a.f0, b.f0, k); scene.fog.far = num(a.f1, b.f1, k);
  for (const m of clouds) { m.lookAt(camera.position); m.material.color = col("#ffffff", hor, 0.25 + k * 0.5); }
  S.worldAt(t, W, c);
  const tint = col(a.tint, b.tint, k);

  // cards
  beans.forEach((x) => { x.mesh.visible = false; x.blob.visible = false; });
  for (const A of S.actorsAt(t)) {
    const B = beanFor(A.id), key = JSON.stringify([A.outfit, A.opts], (_k, v) => rd(v));
    if (key !== B.key) { B.key = key; B.g.setTransform(1, 0, 0, 1, 0, 0); B.g.clearRect(0, 0, CW, CH); B.g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0); bodyFront(B.pen, A.outfit, A.opts); B.tex.needsUpdate = true; }
    const m = B.mesh; m.visible = true; m.position.set(A.x, A.y, A.z); m.scale.setScalar(A.scale);
    m.rotation.y = Math.atan2(camera.position.x - A.x, camera.position.z - A.z);
    m.material.color.copy(tint);
    B.blob.visible = true; B.blob.position.set(A.x, A.y + 0.03, A.z); B.blob.scale.set(1.25 * A.scale, 0.9 * A.scale, 1);
  }
  // creatures
  const list = S.beastsAt(t);
  sprites.forEach((s) => { s.mesh.visible = false; s.blob.visible = false; });
  list.forEach((P, i) => {
    const s = spriteAt(i), tex = spriteTex(P.kind, P.pose), mats = matsFor(tex), m = s.mesh;
    m.material = mats.basic; m.customDepthMaterial = mats.depth; m.userData.nd = mats.nd; m.material.color.copy(tint);
    m.visible = true; m.position.set(P.x, 0, P.z);
    // side-view sprite: keep it side-on to the camera and flip it to run the right way across the frame
    const yaw = Math.atan2(camera.position.x - P.x, camera.position.z - P.z); m.rotation.y = yaw;
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    const dirX = P.flip ? -1 : 1;
    m.scale.set(P.w * (right.x * dirX >= 0 ? 1 : -1), P.w, P.w);
    s.blob.visible = true; s.blob.position.set(P.x, 0.03, P.z); s.blob.scale.set(P.w * 1.2, P.w * 0.62, 1);
  });
  // fx
  fxPool.forEach((m) => { m.visible = false; });
  S.fxAt(t).forEach((F, i) => {
    const m = fxAt(i); m.visible = true; m.material.map = fxTex[F.kind]; m.userData.nd = matsFor(fxTex[F.kind]).nd; m.material.opacity = F.a; m.material.color.copy(tint); m.material.needsUpdate = false;
    m.position.set(F.x, F.y, F.z); m.scale.setScalar(F.s); m.quaternion.copy(camera.quaternion);
  });

  // 1 colour
  camera.layers.enableAll();
  renderer.shadowMap.needsUpdate = true;
  renderer.setRenderTarget(colourRT); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // 2 normal + depth: world by override, then cards with their alpha
  renderer.setRenderTarget(ndRT); renderer.setClearColor(0x000000, 0); renderer.clear();
  const fogKeep = scene.fog; scene.fog = null; renderer.autoClear = false;
  camera.layers.set(LY.WORLD); scene.overrideMaterial = ndWorld; renderer.render(scene, camera); scene.overrideMaterial = null;
  camera.layers.set(LY.CARD);
  const swap = []; scene.traverse((o) => { if (o.userData.isCard && o.visible) { swap.push([o, o.material]); o.material = o.userData.nd; } });
  renderer.render(scene, camera);
  swap.forEach(([o, m]) => { o.material = m; });
  renderer.autoClear = true; scene.fog = fogKeep; camera.layers.enableAll();
  // 3 ink and grade
  const u = inkMat.uniforms;
  u.sat.value = num(a.sat, b.sat, k); u.vig.value = num(a.vig, b.vig, k); u.flash.value = S.flashAt(t);
  u.gain.value.set(num(a.gain[0], b.gain[0], k), num(a.gain[1], b.gain[1], k), num(a.gain[2], b.gain[2], k));
  u.lift.value.set(num(a.lift[0], b.lift[0], k), num(a.lift[1], b.lift[1], k), num(a.lift[2], b.lift[2], k));
  fsQuad.material = inkMat; renderer.setRenderTarget(inkRT); renderer.render(fsScene, fsCam);
  // 4 lens, then sRGB to the canvas
  const D = S.dofAt(t);
  dofMat.uniforms.focus.value = D.focus; dofMat.uniforms.cinf.value = D.c * (WD / 1080);
  fsQuad.material = dofMat; renderer.setRenderTarget(null); renderer.render(fsScene, fsCam);
}
window.renderFrame = renderFrame;
window.FRAMES = S.FRAMES;
window.ready = true;
if (q.get("f")) renderFrame(+q.get("f"));
