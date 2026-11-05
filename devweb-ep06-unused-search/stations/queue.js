// The Queue: white request cards. They step up the column one at a time, 0.3 s a step, and the top card slides to the
// slot. On 23 each takes its stamp as it arrives. A card's tab is empty because it never sends mode.
import * as THREE from "three";
import { alpha, basic, frame, hero, staticPanel, text } from "../parts.js";
import { rr } from "../kit/world.js";
import { T, io, mix, r01, spanAlpha } from "../timeline.js";

const SPOT = [1.635, 1.22, 0.79, 0.375], X = 0.68, Z = -0.3, SLOT = [0.12, 2.03, -1.12], STEP = 0.3;
const SPAWN = "spawn"; // where the bot's card first shows, by the end of Blink's line
const B = T.b23, L = T.botLeave;

// keys: [time, spot or -1 for the slot or SPAWN, optional step length]
const CARDS = [
  { keys: [[T.b03, 1], [T.had, 0], [T.had + 0.4, -1]] },
  { keys: [[T.b03, 2], [T.had + 0.3, 1], [T.had + 0.7, 0], [T.b05 + 1.76, -1]] },
  { keys: [[T.b03 + 0.3, 3], [T.had + 0.6, 2], [T.had + 1.0, 1], [T.b05 + 2.06, 0], [L + 0.26, -1]] },
  { bot: true, keys: [[T.b05 + 0.18, SPAWN], [T.b05 + 0.3, 2, 0.95], [L, 1], [L + 0.5, 0], [L + 0.8, -1]], ring: [[T.b05 + 1.1, L]] },
  { keys: [[T.b07 - 0.34, 1], [T.b07, 0], [T.b07 + 0.36, -1]] },
  { keys: [[B, 3], [B + 0.3, 2], [B + 0.6, 1], [B + 0.9, 0]], stamp: B + 1.2, until: T.caller2 },
  { keys: [[B + 1.06, 3], [B + 1.36, 2], [B + 1.66, 1]], stamp: B + 1.96, until: T.caller2 },
  { keys: [[B + 1.86, 3], [B + 2.16, 2]], stamp: B + 2.46, until: T.caller2 },
  { bot: true, keys: [[T.callers2 - 0.2, 3]], stamp: T.model5 + 0.18, until: T.caller2, ring: [[T.model5, T.caller2]] }, // the tether takes a place in the queue
];

const place = (spot) => (spot === -1 ? [SLOT[0], SLOT[1], SLOT[2], 0.25] : spot === SPAWN ? [0.8, 0.42, Z, 1] : [X, SPOT[spot], Z, 1]);
let rail;

export function build(scene) {
  rail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(X, 1.78, Z), new THREE.Vector3(SLOT[0], SLOT[1], SLOT[2])), 4, 0.012, 6), basic("#2c343e"));
  scene.add(rail);
  CARDS.forEach((c) => {
    c.group = new THREE.Group();
    c.face = hero(0.65, 0.29, 300, (g, W) => {
      g.fillStyle = "#ffffff"; rr(g, 1, 1, W - 2, 85, 8); g.fill();
      text(g, "search", 10, 28, 25, { c: "#14171b", w: 700 });
      g.fillStyle = "#b7bcc2"; g.fillRect(10, 40, 82, 9);
      g.strokeStyle = "#8b8a84"; g.lineWidth = 2; g.setLineDash([6, 5]); g.strokeRect(118, 10, 66, 26); g.setLineDash([]);
    });
    c.face.set({});
    c.group.add(c.face.mesh);
    if (c.stamp) { c.mark = staticPanel(0.56, 0.12, 300, (g) => text(g, "unchanged", 0, 28, 28, { c: "#2e6b45", w: 700 }), -0.27 + 0.28, -0.075, 0.02, c.group); }
    if (c.ring) c.frame = frame(0.72, 0.36, 0.014, c.group, 0, 0, 0.03);
    scene.add(c.group);
  });
}

function cardAt(c, t) {
  const first = c.keys[0][0];
  if (t < first) return null;
  let i = 0;
  c.keys.forEach((k, j) => { if (t >= k[0]) i = j; });
  const cur = place(c.keys[i][1]), prev = i > 0 ? place(c.keys[i - 1][1]) : cur;
  const k = io(r01(t, c.keys[i][0], c.keys[i][2] || STEP));
  let a = r01(t, first, 0.2);
  if (c.keys[i][1] === -1) a *= 1 - r01(t, c.keys[i][0] + STEP - 0.05, 0.08); // seated
  if (c.until) a *= 1 - r01(t, c.until, 0.3);
  return { x: mix(prev[0], cur[0], k), y: mix(prev[1], cur[1], k), z: mix(prev[2], cur[2], k), s: mix(prev[3], cur[3], k), a };
}

export function update(t) {
  rail.material.opacity = 0.9 * spanAlpha([[T.b03, T.b06 + 0.55], [T.b07 - 0.34, T.b07 + 0.55], [T.b23, T.caller2]], t, 0.15);
  CARDS.forEach((c) => {
    const p = cardAt(c, t);
    if (!p || p.a <= 0.002) { c.group.visible = false; return; }
    c.group.visible = true;
    c.group.position.set(p.x, p.y, p.z);
    c.group.scale.setScalar(p.s);
    alpha(c.face.mesh, p.a);
    if (c.mark) {
      const on = t >= c.stamp;
      alpha(c.mark.mesh, on ? p.a : 0);
      c.mark.mesh.scale.setScalar(on ? mix(1.3, 1, r01(t, c.stamp, 0.12)) : 1);
    }
    if (c.frame) c.frame.set(spanAlpha(c.ring, t) * p.a);
  });
}
