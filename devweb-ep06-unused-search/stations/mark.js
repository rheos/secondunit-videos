// The Mark: Blink alone. No harness, no belt, no hands (Robin). It acts from its mark with eyes, a lean up to 8
// degrees, a rise up to 0.3 and a squash pivoting at the foot. Its cards come out of its body (cards.js).
import * as THREE from "three";
import { makeBlink } from "../kit/blink3d.js";
import { basic } from "../parts.js";
import { BLINK_X, FOOT_Y, T, cl, io, mix, r01 } from "../timeline.js";

const pulse = (t, c, d) => Math.max(0, 1 - Math.abs(t - c) / d);
let pivot, blink;

// [time, face and body, ease length]. Every value eases from the key before it (kit rule, ep 3).
const K = (t, o = {}, d = 0.25) => [t, { look: 0, lookY: 0, happy: 0, think: 0, skew: 0, eager: 0, lean: 0, rise: 0, ...o }, d];
const DIAL_UP = { look: 0.5, lookY: 1 }, NEW = { look: 0.9, lookY: 0.8 }, TIP = { look: 0.3, lookY: 0.9 }, SLOT = { look: 1, lookY: 0.95, lean: 2 };
const CHUTE_L = { look: 0.15, lookY: 0.6 }, CHUTE_R = { look: 0.7, lookY: 0.6 }, LAMP = { look: 1.2, lookY: 1.2, lean: 2 }, OWN = { look: 0.25, lookY: -0.8 };
const FACE = [
  K(0, { ...TIP }),
  K(T.smarter, { ...NEW, rise: 0.06 }), // on the new setting as it appears
  K(T.h02 + 0.2, { ...TIP }, 0.5), // back to the pointer, and stays
  K(T.h03, { look: 0.25, lookY: 1.2, rise: 0.1 }), // the lid's stencil
  K(T.h04 + 0.3, { ...SLOT }), K(T.h04 + 1.1, { ...CHUTE_L }, 0.4), // the card in, then down the left chute
  K(T.july, { ...NEW, rise: 0.06 }),
  K(T.h06 + 0.2, { look: 1, lookY: 0.6, lean: 4 }, 0.5), // along the queue
  K(T.h07, { ...TIP, rise: 0.08 }), // the tag
  K(T.h08 + 0.1, { ...SLOT }), K(T.h08 + 0.6, { ...CHUTE_L }), K(T.h08 + 1.2, { ...SLOT }), K(T.h08 + 1.6, { ...CHUTE_L }),
  K(T.h08 + 2.2, { ...SLOT }), K(T.h08 + 2.6, { ...CHUTE_L }), K(T.h08 + 2.95, { ...SLOT }), K(T.h08 + 3.3, { ...CHUTE_L }),
  K(T.h09 + 0.2, { ...LAMP }, 0.5), K(T.nothing2 + 0.1, { ...LAMP, happy: 0.6 }, 0.3), // the lamp, then a small happy settle
  K(T.h10 + 0.05, { ...OWN, happy: 0.3 }), K(T.h10 + 0.7, { look: 1, lookY: 0.6, lean: 3, happy: 0.3 }, 0.5), // its own card
  K(T.h11 + 0.3, { look: 0.3, lookY: 1.2, rise: 0.12 }), K(T.listed, { look: 0.3, lookY: 1.05, rise: 0.12 }, 0.4), K(T.desc, { look: 0.3, lookY: 0.9, rise: 0.1 }, 0.4), // down the plate
  K(T.h12 + 0.3, { look: 1, lookY: 0.75, lean: 2 }), K(T.h12 + 1.45, { ...CHUTE_L }, 0.4), // its card, then down the old chute
  K(T.h13 + 0.2, { look: 1.1, lookY: 0.9, lean: 3 }), K(T.one3, { look: 1.1, lookY: 0.9, lean: 4, eager: 0.9 }, T.one3 - T.h13 - 0.2), // eyes widen as it climbs
  K(T.h14, { ...LAMP }, 0.4),
  K(T.h15 + 0.2, { look: 1.1, lookY: 0.5, lean: 7, rise: 0.1 }, 0.5), // peering into the empty tray
  K(T.h16, { look: 0, lookY: 1.2, think: 0.95 }, 0.3), K(T.changedEnd, { look: -0.3, lookY: 0.5 }, 0.3), // thinking, then the strip's left end
  K(T.h17 + 0.05, { look: -0.3, lookY: 0.5 }), K(T.h17 + 0.1, { look: 1, lookY: 0.5, lean: 3 }, 1.0), // follows the marker to the end
  K(T.h18 + 0.6, { look: 0.25, lookY: 1, rise: 0.12 }, 0.5), // reading the note
  K(T.h19, { ...OWN }), K(T.h19 + 0.4, { ...SLOT }), K(T.h19 + 1.0, { ...CHUTE_R }, 0.4), // its card, down the right chute
  K(T.h20, { look: 0.25, lookY: 1, skew: 0.8 }, 0.3), K(T.but2, { ...CHUTE_R, skew: 1, happy: 0.4, lean: -3 }, 0.6), // side-eye, note to chute
  K(T.id, { ...CHUTE_R, skew: 1, happy: 0.45, lean: -3, rise: 0.1 }, 0.25), // the crooked smile on the bet
  K(T.h21, { ...DIAL_UP }, 0.4),
  K(T.h22 + 0.2, { look: 0.3, lookY: 1.2, rise: 0.12 }), K(T.list, { look: 0.3, lookY: 1.05, rise: 0.12 }, 0.5), K(T.dflt2 - 0.2, { ...TIP, rise: 0.08 }, 0.3),
  K(T.h23, { ...NEW, rise: 0.08 }),
  K(T.h24 + 0.1, { look: 0.1, lookY: 1, rise: 0.06 }), K(T.h25 + 0.1, { look: 0.8, lookY: 1, rise: 0.06 }, 0.5),
  K(T.h26 + 0.3, { look: 1, lookY: 0.9, lean: 3 }), K(T.h26 + 0.5, { look: 1, lookY: 0.35, lean: 3 }, 2.1), // down the rows
  K(T.h27 + 0.15, { ...OWN }), K(T.h27 + 0.6, { ...SLOT }), K(T.h27 + 1.6, { ...CHUTE_L }, 0.4), K(T.still - 0.3, { ...NEW }, 0.5),
  K(T.endIn, { look: 0, lookY: 0 }, 0.6), // to camera
];
const BLINKS = [3.0, 8.6, 12.9, 18.4, 24.1, 28.9, 33.0, 37.5, 43.6, 50.6, 57.0, 60.6, 65.8, 69.6, 72.6, 78.7];

function faceAt(t) {
  let i = 0;
  for (let j = 0; j < FACE.length; j++) if (t >= FACE[j][0]) i = j;
  const cur = FACE[i], prev = i > 0 ? FACE[i - 1] : cur, k = io(r01(t, cur[0], cur[2])), out = {};
  for (const n of Object.keys(cur[1])) out[n] = mix(prev[1][n], cur[1][n], k);
  return out;
}

export function build(scene, { ramp, G }) {
  pivot = new THREE.Group();
  pivot.position.set(BLINK_X, FOOT_Y, 0);
  const body = new THREE.Group();
  body.position.y = 1.08;
  pivot.add(body);
  scene.add(pivot);
  blink = makeBlink(THREE, G, ramp);
  body.add(blink.root);
  // eye halo down to the rest glow, from here, no kit edit
  blink.root.traverse((o) => { if (o.material && o.material.blending === THREE.AdditiveBlending) o.material.opacity = 0.03; });

  // the pool under Blink: small, not a wide haze
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,0.09)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 40), basic("#ffffff", { map: new THREE.CanvasTexture(c) }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(BLINK_X, FOOT_Y - 0.01, 0.2);
  scene.add(pool);
}

export function update(t) {
  const f = faceAt(t);
  // a slow bob, a pop-recoil when a card comes out, and nods: all written from t, never added to last frame
  const pops = [T.h10 + 0.18, T.h19 + 0.02, T.h27 + 0.2];
  let squash = 0.012 * Math.sin(t * 1.15) + 0.05 * pulse(t, T.id + 0.3, 0.2) + 0.04 * pulse(t, T.nothing2 + 0.3, 0.2);
  for (const p of pops) squash += 0.06 * pulse(t, p + 0.08, 0.14);
  pivot.position.y = FOOT_Y + f.rise;
  pivot.rotation.z = -THREE.MathUtils.degToRad(f.lean);
  pivot.scale.set(1 + squash * 0.5, 1 - squash, 1 + squash * 0.5);
  let b = 0;
  for (const c of BLINKS) b = Math.max(b, pulse(t, c, 0.08));
  blink.face({ blink: cl(b), happy: f.happy, look: f.look, lookY: f.lookY, think: f.think, phase: t * 1.6, skew: f.skew, eager: f.eager });
}
