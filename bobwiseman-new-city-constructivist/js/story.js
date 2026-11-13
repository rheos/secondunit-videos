// Every camera, word and prop as a pure function of song time t (seconds). One shot per sung line, cut on the
// line; the ground ink flips at each cut. The sung words come from work/words.js (gitignored, it quotes the lyric):
// window.WORDS = { t0, t1, lines: [[{ w, s }, ...], ...] }, s = vocal-stem onset in song seconds.
//
// Layout: each shot has a camera path pose(t). Words are placed by where they should sit ON SCREEN at the shot's
// reference time (the moment the whole line is in place), at a chosen depth, so the line composes like a poster;
// the camera then moves through that 3D arrangement and the parallax does the rest.
import * as THREE from "./lib/three.module.js";
import { wordMesh } from "./type.js";
import { cityField, crane, merge, person, rng, stepTower as stepTowerAt, drumTower as drumTowerAt, chimney as chimneyAt } from "./city.js";

let T, mats, shots = [];
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const easeIO = (x) => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (x, c = 1.2) => { x = clamp(x); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
// arrival: 0 before (s - lead), 1 on the onset s, small overshoot after (lands on the syllable)
const land = (t, s, lead = 0.3) => back((t - (s - lead)) / lead);

const FOV = 40;
const tmpCam = new THREE.PerspectiveCamera(FOV, 16 / 9, 0.1, 3000);
function setCam(cam, p) { cam.position.copy(p.pos); cam.up.set(0, 1, 0); cam.lookAt(p.at); cam.rotateZ(p.roll || 0); if (p.fov) { cam.fov = p.fov; cam.updateProjectionMatrix(); } }
// place a word mesh so that, seen from pose p, its centre is at screen (sx, sy) in [-1, 1] (y up), at distance d,
// with cap height = h of the frame height. yaw/pitch/roll tilt it off the camera-facing plane (radians).
function place(m, p, { sx = 0, sy = 0, d = 30, h = 0.2, yaw = 0, pitch = 0, roll = 0 }) {
  setCam(tmpCam, p); tmpCam.updateMatrixWorld();
  const v = new THREE.Vector3(sx, sy, 0.5).unproject(tmpCam).sub(tmpCam.position).normalize();
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(tmpCam.quaternion);
  const pos = tmpCam.position.clone().addScaledVector(v, d / v.dot(fwd));
  const sc = h * 2 * d * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  m.quaternion.copy(tmpCam.quaternion);
  m.rotateY(yaw); m.rotateX(pitch); m.rotateZ(roll);
  m.scale.setScalar(sc);
  // the geometry is centred on x (align center) with its baseline at y = 0: lift by half a cap height
  pos.addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(m.quaternion), -sc * 0.5);
  m.position.copy(pos);
  m.userData.home = { pos: pos.clone(), q: m.quaternion.clone(), sc };
}

export async function setup({ THREE, scene, INK }) {
  T = window.WORDS;
  const M = (c) => new THREE.MeshBasicMaterial({ color: c });
  mats = { cream: M(INK.cream), red: M(INK.red), black: M(INK.black) };
  const lines = T.lines;
  const W = (w, face, side, o = {}) => wordMesh(w.toUpperCase(), mats[face], mats[side || face], { align: "center", ...o });
  const lineStart = (i) => lines[i][0].s, lineEnd = (i) => lines[i][lines[i].length - 1].s;
  const cutAt = (i) => lines[i][0].s - 0.45; // cut a little before the line's first syllable
  const groundOf = (g, ink) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), mats[ink]); p.rotation.x = -Math.PI / 2; p.position.y = -0.01; g.add(p); };

  // ---- shot A, cream ground: the words stand up out of the ground as towers; the last one comes down on a crane
  {
    const g = new THREE.Group(); scene.add(g);
    g.add(new THREE.Mesh(cityField(11, { z0: -110, z1: -800, xs: 300, avoid: 26, s: 1.4 }), mats.black));
    const r = rng(5); const cr = [];
    for (const [x, z, sw] of [[-95, -120, 0.5], [44, -130, 2.7], [-150, -190, -0.2]]) cr.push(...crane(r, x, z, 1.8, sw));
    const craneMesh = new THREE.Mesh(merge(cr), mats.red); g.add(craneMesh);
    const s0 = cutAt(0), s1 = cutAt(1), ref = lineEnd(0) + 0.3;
    const pose = (t) => { const k = clamp((t - s0) / (s1 - s0));
      return { pos: new THREE.Vector3(lerp(-3, 2, k), lerp(1.2, 2.4, k), lerp(14, 2, easeIO(k))), at: new THREE.Vector3(lerp(-2, 3, k), lerp(9, 11, k), -80), roll: lerp(-0.16, -0.06, easeIO(k)) }; };
    const L = lines[0]; const n = L.length;
    // poster layout for up to 5 words; long lines fall back to a stepped diagonal
    const lay = [
      { sx: -0.58, sy: 0.42, d: 40, h: 0.16, yaw: 0.5 },
      { sx: 0.18, sy: 0.40, d: 56, h: 0.30, yaw: -0.3 },
      { sx: -0.72, sy: -0.12, d: 30, h: 0.09, yaw: 0.3 },
      { sx: -0.46, sy: -0.12, d: 36, h: 0.15, yaw: 0.4 },
      { sx: 0.22, sy: -0.36, d: 24, h: 0.32, yaw: -0.08 },
    ];
    const words = L.map((w, i) => {
      const last = i === n - 1; const m = W(w.w, "red", last ? "red" : "black", { depth: last ? 0.2 : 0.45 });
      place(m, pose(ref), lay[i] || { sx: -0.6 + i * 0.25, sy: -0.2 + i * 0.1, d: 40, h: 0.14 });
      m.userData.s = w.s; m.userData.last = last; g.add(m); return m;
    });
    const cable = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1, 0.12), mats.black); g.add(cable);
    shots.push({ g, ground: "cream", t: s0, update(t, cam) {
      for (const m of words) { const h = m.userData.home;
        if (m.userData.last) { const k = back((t - (m.userData.s - 0.8)) / 0.8, 0.6); const y = lerp(h.sc * 6, 0, k) + Math.sin(t * 2.1) * h.sc * 0.03 * (1 - k);
          m.position.copy(h.pos).y += y; cable.position.set(h.pos.x, h.pos.y + y + h.sc * 0.95 + 60, h.pos.z); cable.scale.y = 120; }
        else { const k = land(t, m.userData.s, 0.28); m.position.copy(h.pos); m.scale.set(h.sc, h.sc * Math.max(0.001, k), h.sc); } // grows up from its baseline
      }
      setCam(cam, pose(t)); return { focus: 32, aperture: 1.3 };
    } });
  }

  // ---- shot B, red ground: a run of open gateways, one word over each lintel; the camera flies through them
  {
    const g = new THREE.Group(); scene.add(g); groundOf(g, "red");
    const L = lines[1]; const s0 = cutAt(1), s1 = cutAt(2);
    const gap = 24, ow = 10, oh = 13, post = 1.6, lint = 4.6, D = 1.4;
    const z0 = -18; // first gate
    // camera passes gate i shortly after word i is sung
    const passT = L.map((w) => w.s + 0.5);
    const gateZ = L.map((_, i) => z0 - i * gap);
    const camZ = (t) => { // piecewise linear through (passT[i], gateZ[i]), eased in from the cut, coasting after
      if (t <= passT[0]) return lerp(z0 + 26, gateZ[0], ease((t - s0) / (passT[0] - s0)) * 0.6 + clamp((t - s0) / (passT[0] - s0)) * 0.4);
      for (let i = 0; i < passT.length - 1; i++) if (t < passT[i + 1]) return lerp(gateZ[i], gateZ[i + 1], (t - passT[i]) / (passT[i + 1] - passT[i]));
      return gateZ[gateZ.length - 1] - (t - passT[passT.length - 1]) * 6;
    };
    const geos = [];
    const box = (w, h, d, x, y, z) => { const b = new THREE.BoxGeometry(w, h, d); b.translate(x, y + h / 2, z); return b; };
    L.forEach((_, i) => { const z = gateZ[i];
      geos.push(box(post, oh + lint, D, -(ow + post) / 2, 0, z), box(post, oh + lint, D, (ow + post) / 2, 0, z), box(ow + 2 * post, lint, D, 0, oh, z));
    });
    g.add(new THREE.Mesh(merge(geos), mats.black));
    g.add(new THREE.Mesh(cityField(31, { z0: gateZ[gateZ.length - 1] - 120, z1: -900, xs: 340, avoid: 0, s: 1.2 }), mats.black));
    // door leaves swung wide open on the last gate
    const leafG = new THREE.BoxGeometry(ow / 2, oh, 0.3); leafG.translate(ow / 4, oh / 2, 0);
    const leaves = [new THREE.Mesh(leafG, mats.black), new THREE.Mesh(leafG, mats.black)];
    const lastZ = gateZ[gateZ.length - 1];
    leaves[0].position.set(-ow / 2, 0, lastZ - D / 2); leaves[1].position.set(ow / 2, 0, lastZ - D / 2); leaves[1].scale.x = -1;
    g.add(...leaves);
    const words = L.map((w, i) => { const m = W(w.w, "cream", "cream", { depth: 0.04 }); const fit = Math.min(lint * 0.62, (ow + 2 * post) * 0.86 / m.userData.width);
      m.scale.setScalar(fit); m.position.set(0, oh + lint / 2 - fit / 2, gateZ[i] + D / 2 + 0.05); m.userData.s = w.s; m.userData.fit = fit; g.add(m); return m; });
    shots.push({ g, ground: "red", t: s0, update(t, cam) {
      // each word swings down onto its lintel like a sign on a hinge, landing on its syllable
      for (const m of words) { const k = land(t, m.userData.s, 0.22); m.rotation.x = lerp(-Math.PI / 2, 0, k); }
      const op = ease((t - (L[L.length - 1].s - 0.1)) / 0.6) * 1.35;
      leaves[0].rotation.y = op; leaves[1].rotation.y = -op;
      const z = camZ(t);
      setCam(cam, { pos: new THREE.Vector3(Math.sin(t * 1.3) * 0.5, 7.2 + Math.sin(t * 1.9) * 0.25, z + 11), at: new THREE.Vector3(0, 9.5, z - 40), roll: Math.sin(t * 0.8) * 0.06 + 0.05 });
      return { focus: 34, aperture: 0.9 };
    } });
  }

  // ---- shot C, black ground: the small word recedes and shrinks into the city; the next words stand up huge
  {
    const g = new THREE.Group(); scene.add(g); groundOf(g, "black");
    g.add(new THREE.Mesh(cityField(41, { z0: -340, z1: -900, xs: 420, avoid: 60, s: 1.0 }), mats.red));
    const L = lines[2]; const s0 = cutAt(2), s1 = cutAt(3), ref = lineEnd(2) + 0.35;
    const pose = (t) => { const k = clamp((t - s0) / (s1 - s0));
      return { pos: new THREE.Vector3(lerp(4, -2, k), lerp(3, 6, k), lerp(10, -6, easeIO(k))), at: new THREE.Vector3(0, lerp(34, 38, k), -100), roll: lerp(0.14, 0.22, easeIO(k)) }; };
    const lay = [
      { sx: -0.55, sy: 0.6, d: 28, h: 0.11, yaw: 0.25 },      // word 0
      { sx: 0.42, sy: 0.6, d: 30, h: 0.13, yaw: -0.1 },       // word 1, the small one
      { sx: -0.22, sy: 0.12, d: 34, h: 0.28, yaw: 0.18 },     // word 2
      { sx: 0.43, sy: -0.4, d: 30, h: 0.25, yaw: -0.12 },     // word 3
    ];
    const ink = ["cream", "cream", "red", "red"];
    const words = L.map((w, i) => { const m = W(w.w, ink[i] || "red", ink[i] || "red", { depth: 0.08 }); place(m, pose(ref), lay[i] || { sx: 0, sy: 0, d: 30, h: 0.2 }); m.userData.s = w.s; g.add(m); return m; });
    shots.push({ g, ground: "black", t: s0, update(t, cam) {
      words.forEach((m, i) => { const h = m.userData.home; const k = land(t, m.userData.s, 0.28);
        if (i === 1) { // arrives, then shrinks where it stands when the last word lands
          const lessS = L[L.length - 1].s; const sm = ease((t - (lessS - 0.05)) / 0.9);
          m.position.copy(h.pos); m.scale.setScalar(h.sc * k * lerp(1, 0.3, sm));
        } else { m.position.copy(h.pos); m.scale.setScalar(h.sc * k); }
        m.quaternion.copy(h.q);
      });
      setCam(cam, pose(t)); return { focus: 30, aperture: 1.2 };
    } });
  }

  // ---- shot D, cream ground: rows of people to the horizon; the biggest word rises behind them as the tallest tower
  {
    const g = new THREE.Group(); scene.add(g); groundOf(g, "cream");
    const r = rng(77); const ps = [];
    for (let z = -6; z > -300; z -= 4 + r() * 2) for (let x = -90; x < 90; x += 2.2 + r() * 1.4) { if (r() < 0.12) continue; ps.push(...person(x + r(), z, 1.9 + r() * 0.3, r() < 0.35 ? 1 : 0, (r() - .5) * 0.6)); }
    g.add(new THREE.Mesh(merge(ps), mats.black));
    g.add(new THREE.Mesh(cityField(51, { z0: -330, z1: -900, xs: 420, avoid: 0, s: 1.4 }), mats.black));
    const L = lines[3]; const s0 = cutAt(3);
    const pose = (t) => { const k = clamp((t - s0) / 4.2); const e = ease(k);
      return { pos: new THREE.Vector3(0, lerp(2.2, 24, e), lerp(4, 36, e)), at: new THREE.Vector3(0, lerp(6, 27, e), -150), roll: lerp(-0.07, 0.03, e) }; };
    const ref = s0 + 4.2;
    const lay = [ { sx: -0.5, sy: 0.74, d: 150, h: 0.09, yaw: 0 }, { sx: 0, sy: 0.12, d: 170, h: 0.42, yaw: 0 }, { sx: 0.46, sy: 0.74, d: 150, h: 0.12, yaw: 0 } ];
    const words = L.map((w, i) => { const m = W(w.w, "red", i === 1 ? "black" : "red", { depth: i === 1 ? 0.3 : 0.1 }); place(m, pose(ref), lay[i] || { sx: 0, sy: -0.5, d: 150, h: 0.1 }); m.userData.s = w.s; g.add(m); return m; });
    shots.push({ g, ground: "cream", t: s0, update(t, cam) {
      words.forEach((m, i) => { const h = m.userData.home; const k = land(t, m.userData.s, i === 1 ? 0.55 : 0.28); m.position.copy(h.pos).y -= (1 - k) * h.sc * 1.5; });
      setCam(cam, pose(t)); return { focus: 90, aperture: 0.9 };
    } });
  }
}

export function at(t, { camera }) {
  let cur = shots[0];
  for (const s of shots) if (t >= s.t) cur = s;
  for (const s of shots) s.g.visible = s === cur;
  if (camera.fov !== FOV) { camera.fov = FOV; camera.updateProjectionMatrix(); }
  const look = cur.update(t, camera) || {};
  return { ground: cur.ground, focus: look.focus ?? 40, aperture: look.aperture ?? 1 };
}

// prop line-up for sign-off: every prop in a row on cream, one ink each (?lineup in the page URL)
export function lineup({ THREE, scene, camera, INK }) {
  const M = (c) => new THREE.MeshBasicMaterial({ color: c });
  const b = M(INK.black), red = M(INK.red);
  const r = rng(3); const g = new THREE.Group(); scene.add(g);
  const add = (geos, m) => g.add(new THREE.Mesh(merge(geos), m));
  add(stepTowerAt(r, -34, 0), b); add(drumTowerAt(r, -22, 0), b); add(chimneyAt(r, -12, 0), b);
  add(crane(rng(9), 0, 0, 0.9, 2.6), red);
  const gate = []; const box = (w, h, d, x, y, z) => { const q = new THREE.BoxGeometry(w, h, d); q.translate(x, y + h / 2, z); return q; };
  gate.push(box(0.8, 9, 0.7, 11, 0, 0), box(0.8, 9, 0.7, 16.8, 0, 0), box(6.6, 2.4, 0.7, 13.9, 6.6, 0)); add(gate, b);
  const ps = []; for (let i = 0; i < 6; i++) ps.push(...person(21 + i * 1.6, 0, 1.9, i % 2, 0)); add(ps, b);
  camera.position.set(-2, 7, 62); camera.lookAt(-2, 7, 0);
  return { ground: "cream", focus: 62, aperture: 0 };
}
