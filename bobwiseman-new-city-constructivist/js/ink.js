// Three-ink shading for real models: every face is lit by one fixed light and thresholded into three inks
// (hi = faces toward the light, mid, lo = faces away), like a hard-lit render pushed through a print threshold.
// Face normals come from screen derivatives, so every model reads faceted and flat. The threshold carries a
// little world-space noise, so the boundary between inks on a curved part breaks up like dry ink.
// Built on MeshBasicMaterial via onBeforeCompile, so skinned and instanced meshes still work.
import * as THREE from "./lib/three.module.js";
import { GLTFLoader } from "./lib/GLTFLoader.js";

const LIGHT = new THREE.Vector3(-0.72, 0.55, 0.3).normalize();

export function inkMaterial({ hi, mid, lo, t1 = -0.05, t2 = 0.45, light = LIGHT, rough = 0.12, side = THREE.FrontSide } = {}) {
  const m = new THREE.MeshBasicMaterial({ color: 0xffffff, side });
  const u = { inkHi: { value: hi.clone() }, inkMid: { value: mid.clone() }, inkLo: { value: lo.clone() },
    lightDir: { value: light.clone() }, t1: { value: t1 }, t2: { value: t2 }, rough: { value: rough } };
  m.userData.u = u;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWP;")
      .replace("#include <project_vertex>", `#include <project_vertex>
        vec4 wp4 = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          wp4 = instanceMatrix * wp4;
        #endif
        vWP = (modelMatrix * wp4).xyz;`);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>
        varying vec3 vWP; uniform vec3 inkHi, inkMid, inkLo, lightDir; uniform float t1, t2, rough;
        float ih(vec3 p){ p = fract(p * .1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
        float inoise(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
          return mix(mix(mix(ih(i), ih(i + vec3(1,0,0)), f.x), mix(ih(i + vec3(0,1,0)), ih(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(ih(i + vec3(0,0,1)), ih(i + vec3(1,0,1)), f.x), mix(ih(i + vec3(0,1,1)), ih(i + vec3(1,1,1)), f.x), f.y), f.z); }`)
      .replace("vec4 diffuseColor = vec4( diffuse, opacity );", `
        vec3 fn = normalize(cross(dFdx(vWP), dFdy(vWP)));
        float l = dot(fn, lightDir);
        float nz = (inoise(vWP * 1.7) - .5) * rough + (inoise(vWP * 7.3) - .5) * rough * .5;
        vec3 ink = l + nz > t2 ? inkHi : (l + nz > t1 ? inkMid : inkLo);
        vec4 diffuseColor = vec4(ink, opacity);`);
  };
  m.customProgramCacheKey = () => "ink3";
  return m;
}

// load a .glb, drop its materials and textures, return a group whose meshes all use `mat` (or mat(name))
const loader = new GLTFLoader();
const cache = new Map();
export async function loadModel(url) {
  if (!cache.has(url)) cache.set(url, loader.loadAsync(url));
  return cache.get(url);
}
// a fresh copy of a model, fitted to height h (world units), feet on y = 0, centred on x/z
export async function model(url, mat, h = 10) {
  const gltf = await loadModel(url);
  const src = gltf.scene;
  const root = src.clone(true);
  root.traverse((o) => { if (o.isMesh) { o.material = mat; o.castShadow = false; o.frustumCulled = false; } });
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root); const size = box.getSize(new THREE.Vector3());
  const s = h / size.y; const g = new THREE.Group();
  root.position.set(-(box.min.x + size.x / 2), -box.min.y, -(box.min.z + size.z / 2));
  g.add(root); g.scale.setScalar(s); g.userData.footprint = Math.max(size.x, size.z) * s;
  return g;
}
// merge a static model into one geometry (world-baked) for instancing; skinned models are not supported here
export async function modelGeometry(url, h = 10) {
  const gltf = await loadModel(url);
  const src = gltf.scene.clone(true); src.updateMatrixWorld(true);
  const geos = [];
  src.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh) { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld);
    const ng = new THREE.BufferGeometry(); ng.setAttribute("position", g.attributes.position); if (g.index) ng.setIndex(g.index); geos.push(ng.index ? ng.toNonIndexed() : ng); } });
  let n = 0; for (const g of geos) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3); let k = 0; for (const g of geos) { pos.set(g.attributes.position.array, k); k += g.attributes.position.array.length; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.computeBoundingBox(); const b = geo.boundingBox; const size = b.getSize(new THREE.Vector3()); const s = h / size.y;
  geo.translate(-(b.min.x + size.x / 2), -b.min.y, -(b.min.z + size.z / 2)); geo.scale(s, s, s);
  geo.computeBoundingBox(); geo.computeBoundingSphere();
  geo.userData.footprint = Math.max(size.x, size.z) * s;
  return geo;
}
