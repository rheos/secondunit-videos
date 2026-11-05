// The Mark: Blink, its harness, its line. Blink's mark never changes: it acts from there with eyes, a lean up to 8
// degrees, a rise up to 0.3 and a squash pivoting at the foot. The line is its only physical act, so it comes off the belt.
import * as THREE from "three";
import { makeBlink, makeHarness } from "../kit/blink3d.js";
import { alpha, basic, hero, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { BLINK_X, SET_Z, T, cl, io, mix, r01 } from "../timeline.js";

const pulse = (t, c, d) => Math.max(0, 1 - Math.abs(t - c) / d);
let pivot, blink, ghost;
const lines = {};

// [time, face and body, optional ease length]. Every value eases from the key before it (kit rule, ep 3).
const K = (t, o = {}, d = 0.25) => [t, { look: 0, lookY: 0, happy: 0, think: 0, skew: 0, eager: 0, lean: 0, rise: 0, ...o }, d];
const FACE = [
  K(0, { look: 0.8, lookY: 1 }),
  K(T.b02, { look: 0, lookY: 0.7, lean: -1, rise: 0.05 }, 0.5),
  K(T.b03, { look: 0.8, lookY: 0.1 }),
  K(T.b04, { look: 0, lookY: 1, rise: 0.08 }),
  K(T.b05, { look: 0.9, lookY: 0, happy: 0.2, lean: 3 }),
  K(T.b06, { look: 0, lookY: 0.9, rise: 0.1 }),
  K(T.b07, { look: 0.1, lookY: 0.6 }),
  K(T.b08, { look: 0.9, lookY: 0.3 }),
  K(T.stamp, { look: 0.9, lookY: 0.3, happy: 1 }, 0.15),
  K(T.b09, { look: -0.1, lookY: 1, rise: 0.12, happy: 0.3 }),
  K(T.b10 + 0.1, { look: 0.8, lookY: 1, lean: 2 }, 0.5),
  K(T.b11, { look: 1, lookY: 0.8, lean: 3 }),
  K(T.b13, { look: 1.2, lookY: 1 }),
  K(T.b14, { look: 1, lookY: 0.5, lean: 3 }),
  K(T.b15, { look: 1, lookY: 0.9, lean: 4 }),
  K(T.b16, { look: 1, lookY: -0.8, lean: 5, rise: 0.1 }, T.b17 - 0.46 - T.b16), // looks down the whole length
  K(T.b17, { look: 0.6, lookY: -0.8 }, 0.5),
  K(T.own - 0.8, { look: 0.1, lookY: 0, think: 0.95 }),
  K(T.own + 0.4, { look: 0.1, lookY: 0 }),
  K(T.b18, { look: 1, lookY: 1, lean: 3 }),
  K(T.b19, { look: -0.1, lookY: 1, rise: 0.15 }),
  K(T.b20, { look: 1, lookY: 0.9, lean: 4 }),
  K(T.b21, { look: 1, lookY: 0.6, skew: 1, happy: 0.35, lean: -5 }, 0.4), // leans away, eyes stay on the two cards
  K(T.but, { look: 0, lookY: -0.1, skew: 0.5, happy: 0.35, lean: -2 }, 0.3), // "but": off the cards, to us
  K(T.id, { look: 0.15, lookY: 0, skew: 1, happy: 0.45, lean: -3, rise: 0.12 }, 0.25), // the crooked smile on the bet
  K(T.b22, { look: -0.1, lookY: 1, rise: 0.15 }, 0.5),
  K(T.b23, { look: 0.9, lookY: 0.1, lean: 2 }),
  K(T.one4, { look: 0.9, lookY: -0.2, lean: 4, rise: 0.06 }), // eyes go down its own line as it pays out
  K(T.model5, { look: 0.9, lookY: 0, eager: 0.45, lean: 4, rise: 0.1 }),
  K(T.b24, { look: 0, lookY: 1, rise: 0.1 }, 0.5),
  K(T.flareUp + 0.02, { look: 0.4, lookY: 0.8, rise: 0.1 }, 0.15), // to the flare
  K(T.notOn, { look: 0, lookY: 0.7, rise: 0.1 }, 0.2), // to the knob
  K(T.b26, { look: 0.1, lookY: 0.2, happy: 0.4 }, 0.5),
  K(T.default7 - 0.1, { look: -0.1, lookY: 1, happy: 0.4, rise: 0.12 }, 0.3), // up to the sticker on "safe default"
  K(T.you2, { look: 0.2, lookY: 0.3, happy: 0.45 }, 0.3),
  K(T.b27, { look: 1, lookY: 0.3, lean: 3 }),
  K(T.b28, { look: 0.3, lookY: 1, rise: 0.1 }),
  K(T.b29, { look: 1, lookY: 0.8, lean: 4 }),
  K(T.b30, { look: 1, lookY: 0.3, lean: 4 }),
  K(T.b31, { look: 1, lookY: -0.3, lean: 4 }),
  K(T.b32, { look: 1, lookY: 0.9 }, 0.9), // eyes follow the wipe up; mouth flat
  K(T.b33, { look: 1.2, lookY: 1 }, 0.8),
  K(T.endIn, { look: 0, lookY: 0, happy: 0.2 }, 0.6),
];
const BLINKS = [3.2, 7.9, 13.4, 19.8, 26.6, 31.2, 37.4, 46.0, 51.6, 57.6, 65.2, 74.6, 79.4, 85.2, 89.6, 92.3];

function faceAt(t) {
  let i = 0;
  for (let j = 0; j < FACE.length; j++) if (t >= FACE[j][0]) i = j;
  const cur = FACE[i], prev = i > 0 ? FACE[i - 1] : cur, k = io(r01(t, cur[0], cur[2])), out = {};
  for (const n of Object.keys(cur[1])) out[n] = mix(prev[1][n], cur[1][n], k);
  return out;
}

// world-space paths, re-laid for the set standing back. bot1 runs to the third spot (05), bot2 to the fourth (23).
// There is no taut line on 20-21: the sticker, then the line going tight, then the hybrid calls read as cause (first watch 01).
const P = (a) => a.map((v) => new THREE.Vector3(...v));
const FROM = [-0.41, -0.72, 0.92], CARD_Z = -0.3 + SET_Z;
const PATHS = {
  bot1: P([FROM, [0.27, -0.62, 0.72], [0.39, 0, 0.2], [0.4, 0.72, CARD_Z]]),
  bot2: P([FROM, [0.27, -0.62, 0.72], [0.39, -0.1, 0.2], [0.4, 0.375, CARD_Z]]),
  slack: P([FROM, [0.2, -0.95, 0.7], [0.35, -0.92, 0.4], [0.47, -0.55, 0.1]]),
};
const lineK = {
  bot1: (t) => io(r01(t, T.b05, 1.3)) * (1 - io(r01(t, T.botLeave, 0.45))),
  bot2: (t) => io(r01(t, T.one4, 0.45)) * (1 - io(r01(t, T.caller2, 0.3))), // "one of those callers": Blink's tether takes a place
  slack: (t) => io(r01(t, T.b17, 0.55)) * (1 - io(r01(t, T.b20, 0.2))),
};

export function build(scene, { ramp, G }) {
  pivot = new THREE.Group();
  pivot.position.set(BLINK_X, -1.08, 0);
  const body = new THREE.Group();
  body.position.y = 1.08;
  pivot.add(body);
  scene.add(pivot);
  blink = makeBlink(THREE, G, ramp);
  body.add(blink.root);
  // eye halo down to the rest glow, from here, no kit edit
  blink.root.traverse((o) => { if (o.material && o.material.blending === THREE.AdditiveBlending) o.material.opacity = 0.03; });
  const harness = makeHarness(THREE, G, ramp);
  body.add(harness.root);
  harness.tools.weather.pivot.visible = false;
  [harness.tools.search, harness.tools.shell].forEach((tool) => tool.pivot.children.slice(1).forEach((c) => { c.visible = false; }));
  harness.belt.material.color.set("#6e5b3c");

  for (const [name, pts] of Object.entries(PATHS)) {
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.018, 6);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: "#6ad08a", fog: false }));
    scene.add(mesh);
    lines[name] = mesh;
  }

  // the unsent card: a grey dashed ghost on the slack line
  ghost = hero(0.65, 0.29, 300, (g, W) => {
    g.strokeStyle = "#8b949e"; g.lineWidth = 3; g.setLineDash([9, 7]); rr(g, 3, 3, W - 6, 81, 8); g.stroke(); g.setLineDash([]);
    text(g, "search", 14, 32, 25, { c: "#8b949e", w: 700 });
  });
  ghost.set({});
  ghost.mesh.position.set(0.795, -0.55, 0.1);
  scene.add(ghost.mesh);

  // the pool under Blink: under 4 % of frame, not the boards' wide haze
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,0.09)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 40), basic("#ffffff", { map: new THREE.CanvasTexture(c) }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(BLINK_X, -1.11, 0.2);
  scene.add(pool);
}

export function update(t) {
  const f = faceAt(t);
  // a slow bob keeps the long holds from sitting still; written from t, never added to last frame
  const bob = 0.012 * Math.sin(t * 1.15);
  pivot.position.y = -1.08 + f.rise;
  pivot.rotation.z = -THREE.MathUtils.degToRad(f.lean);
  const squash = bob + 0.05 * pulse(t, T.you2 + 0.3, 0.2) + 0.05 * pulse(t, T.id + 0.3, 0.2); // a nod, written from t
  pivot.scale.set(1 + squash * 0.5, 1 - squash, 1 + squash * 0.5);
  let b = 0;
  for (const c of BLINKS) b = Math.max(b, pulse(t, c, 0.08));
  blink.face({ blink: cl(b), happy: f.happy, look: f.look, lookY: f.lookY, think: f.think, phase: t * 1.6, skew: f.skew, eager: f.eager });

  for (const name of Object.keys(lines)) {
    const k = lineK[name](t), geo = lines[name].geometry;
    lines[name].visible = k > 0.001;
    if (k > 0.001) geo.setDrawRange(0, Math.floor((geo.index.count * k) / 6) * 6);
  }
  alpha(ghost.mesh, r01(t, T.b17 + 0.25, 0.3) * (1 - r01(t, T.b20, 0.12)));
}
