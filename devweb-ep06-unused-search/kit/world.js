// The devweb world kit: what every "one 3D world, one camera" short shares (the standard since ep 1 draft 4,
// Robin 2026-10-29). Easing, a word-keyed camera path, canvas-texture panels and the stage itself (renderer, fog,
// light, toon ramp, floor grid). A short's own file (e.g. oner.js) builds its stations and calls these.
// Everything here is a pure function of film time: HyperFrames seeks frames in any order.
import * as THREE from "three";
import { toonRamp } from "./blink3d.js";

// ---------- small maths ----------
export const cl = (x) => Math.max(0, Math.min(1, x));
export const io = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const back = (x) => { x = cl(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const r01 = (t, a, d) => cl((t - a) / d);
export const mix = (a, b, k) => a + (b - a) * k;
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const pulse = (t, c, d = 0.18) => Math.max(0, 1 - Math.abs(t - c) / d);
// a typed string at time t: one more character every 1/cps seconds from t0
export const typed = (s, t0, cps, t) => s.slice(0, Math.max(0, Math.min(s.length, Math.floor((t - t0) * cps) + 1)) * (t >= t0 ? 1 : 0));

// ---------- the camera: keys of [time, position, target, fov], eased in and out, with a slow drift ----------
export function cameraPath(KEYS) {
  return function cameraAt(t, cam) {
    let i = 0;
    while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
    const [t0, p0, g0, f0] = KEYS[i], [t1, p1, g1, f1] = KEYS[i + 1];
    const k = io((t - t0) / Math.max(0.001, t1 - t0));
    const lerp3 = (a, b) => V(mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k));
    const pos = lerp3(p0, p1), tgt = lerp3(g0, g1);
    // a slow drift so no hold is ever frozen
    pos.x += 0.06 * Math.sin(t * 0.7); pos.y += 0.04 * Math.sin(t * 0.53 + 1.3);
    cam.position.copy(pos); cam.fov = mix(f0, f1, k); cam.updateProjectionMatrix(); cam.lookAt(tgt);
  };
}

// ---------- a flat panel drawn on a canvas, redrawn only when its content changes ----------
// Size the canvas for the longest text it will hold: text past the edge is cut off, not wrapped (ep 1's "Nels").
export function panel(wu, hu, ppu, draw) {
  const c = document.createElement("canvas");
  c.width = Math.round(wu * ppu); c.height = Math.round(hu * ppu);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wu, hu), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  let key = null;
  return { mesh, set(state) { const k = JSON.stringify(state); if (k === key) return; key = k; const g = c.getContext("2d"); g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height, state); tex.needsUpdate = true; } };
}
export const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };

// ---------- the stage: renderer at the canvas's own size (the master is 1080x1920), fog, light, toon ramp, floor ----------
export function stage(canvas, { bg = "#0d1117", fog = [14, 70], floorY = -1.72 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(canvas.width, canvas.height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(bg, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(bg, fog[0], fog[1]);
  const cam = new THREE.PerspectiveCamera(36, canvas.width / canvas.height, 0.1, 200);
  const sun = new THREE.DirectionalLight("#ffffff", 2.4); sun.position.set(-3, 5, 6); scene.add(sun);
  scene.add(new THREE.AmbientLight("#ffffff", 0.9));
  const ramp = toonRamp(THREE);
  const toon = (color, extra) => new THREE.MeshToonMaterial(Object.assign({ color, gradientMap: ramp }, extra || {}));
  // floor grid, fading into the fog
  const grid = new THREE.GridHelper(160, 160, "#1f3a2c", "#162230");
  grid.position.y = floorY; grid.material.transparent = true; grid.material.opacity = 0.55; scene.add(grid);
  return { renderer, scene, cam, ramp, toon, grid };
}
