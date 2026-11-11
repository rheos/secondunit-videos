// The beam: Blink's emitter, from the approved motion test (design/machine-test.html, emitFrame's beam branch). A cone of
// pale mint light opens from the visor up and to the right, a lens glow at the visor, fourteen sparks that gather where a
// request card condenses and fly apart where a result dissolves. The group hangs on Blink's root at the visor centre, so
// it rides every pose; the focus (the card's forming place) is read off the live matrices after mark.update(t) has set
// the pose. cards.js reads focusAt() and drives motes(); mark.js calls update(t) last in its own update. Every value is
// written from t each frame (the open from beamOn(t) in timeline.js); nothing carries over.
import * as THREE from "three";
import { beamOn } from "../timeline.js";

export const GLOW = "#c4f7d3"; // Blink's own light: the eye glow
export const DIR = [0.42, 0.78, 0.46]; // in root space: up, to the right, a little forward (the test's)
export const LEN = 1.35; // visor to focus, in Blink units (scaled by the rig's squash with everything else)
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

let beam, outer, inner, lens, sparks = [], moteRoot, tNow = 0;

const coneMat = (op) => new THREE.MeshBasicMaterial({ color: GLOW, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
function mkCone(rt, rb, op) {
  const g = new THREE.CylinderGeometry(rt, rb, 1, 28, 1, true); g.translate(0, -0.5, 0); // tip at the visor, base at -1 before scaling
  const m = new THREE.Mesh(g, coneMat(op)); m.material.userData.own = true; beam.add(m); return m;
}

// blinkRoot: the kit's makeBlink root (the beam parents to it at the visor). kit.G: window.BLINK (for onFront).
export function build(blinkRoot, { G }) {
  const vf = G.onFront(0, 0.2, 0.02); // visor centre, on the skin
  beam = new THREE.Group(); beam.position.set(...vf.p); blinkRoot.add(beam);
  beam.quaternion.setFromUnitVectors(V3(0, -1, 0), V3(...DIR).normalize());
  outer = mkCone(0.05, 0.5, 0.16); inner = mkCone(0.03, 0.26, 0.2);
  lens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 24), new THREE.MeshBasicMaterial({ color: GLOW, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  lens.quaternion.setFromUnitVectors(V3(0, 0, 1), V3(0, -1, 0)); lens.material.userData.own = true; beam.add(lens);
  beam.visible = false;
  // the motes live in world space (they gather at the focus, which cards.js hands back as a world point), so they go on the
  // top of Blink's tree: the station group, or the scene once the group is in it. Each has its own material (kit rule).
  let top = blinkRoot; while (top.parent) top = top.parent;
  moteRoot = new THREE.Group(); top.add(moteRoot);
  sparks = Array.from({ length: 14 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.9, depthWrite: false, fog: false }));
    const a = i * 2.399, r = 0.25 + (0.3 * ((i * 7) % 5)) / 5;
    m.userData.o = V3(Math.cos(a) * r, Math.sin(a) * r * 0.8, Math.sin(a * 1.7) * 0.25);
    m.visible = false; moteRoot.add(m); return m;
  });
}

// called by mark.update(t) once Blink's pose is set: the cones' size and light from beamOn(t), with the test's flicker;
// every mote hidden (cards.js shows the ones it needs, after this, in the same frame)
export function update(t) {
  tNow = t;
  const on = beamOn(t), fl = 0.86 + 0.14 * Math.sin(t * 37) * Math.sin(t * 23);
  beam.visible = on > 0.002;
  outer.scale.set(on, LEN, on); inner.scale.set(on, LEN, on);
  outer.material.opacity = 0.16 * on * fl; inner.material.opacity = 0.2 * on * fl;
  lens.material.opacity = 0.9 * on; lens.scale.setScalar(0.5 + on);
  sparks.forEach((m) => (m.visible = false));
}

// the beam's focus in world units, from the live matrices (valid after update(t) in the same frame, whether or not the
// beam is open: a card's path is built from it)
export function focusAt() {
  beam.updateWorldMatrix(true, false);
  return beam.localToWorld(V3(0, -LEN, 0));
}

// the sparks, as the test: k 0..1 how gathered, dir +1 condensing (a request forming) / -1 dissolving (a result going),
// F the focus (a world THREE.Vector3). Nothing shows at either end of k.
export function motes(k, dir, F) {
  const show = k > 0.001 && k < 0.999;
  const sp = k * 0.55 + (dir < 0 ? 0.05 : 0);
  sparks.forEach((m, i) => {
    m.visible = show;
    if (!show) return;
    m.position.copy(F).addScaledVector(m.userData.o, sp / 0.55).add(V3(0, 0.03 * Math.sin(tNow * 19 + i), 0));
    m.scale.setScalar(0.5 + k * (dir > 0 ? 1 : 0.6));
    m.material.opacity = 0.9 * (dir > 0 ? 1 : 1 - k);
  });
}
