// The cards: plain white request cards, no words. Blink's own cards carry one small mint dot and come out of the front
// of its body with a little pop (no hands, no belt, no tether). They queue at the slot, go in, and come out down a chute.
import * as THREE from "three";
import { alpha, hero } from "../parts.js";
import { rr } from "../kit/world.js";
import { BLINK_X, CARD_PLAN, CHUTE_RIDE, CHUTE_X, STREAM, io, mix, r01 } from "../timeline.js";

const Z = -1.1, SPOTS = [[1.62, 3.55], [1.52, 3.05], [1.42, 2.55], [1.32, 2.05]];
const SLOT = [1.25, 3.55, -1.45], BLINK = [BLINK_X + 0.15, 0.1, 1.0], STEP = 0.35;
const CHUTE_TOP = 2.15, CHUTE_BOT = 1.5;
const place = (p) => {
  if (p === "slot") return [...SLOT, 0.25];
  if (p === "blink") return [...BLINK, 0.02];
  const i = +p[1];
  return p[0] === "S" ? [SPOTS[i][0], SPOTS[i][1], Z, 1] : [2.8, SPOTS[i][1], Z, 1];
};

const cardFace = (dot) => hero(0.64, 0.34, 300, (g, W, H) => {
  g.fillStyle = "#ffffff"; rr(g, 2, 2, W - 4, H - 4, 10); g.fill();
  g.fillStyle = "#b7bcc2"; g.fillRect(18, 30, W * 0.62, 12); g.fillRect(18, 58, W * 0.4, 12);
  if (dot) { g.fillStyle = "#6ad08a"; g.beginPath(); g.arc(W - 22, 22, 9, 0, Math.PI * 2); g.fill(); }
});

const cards = [], stream = [];
const N_STREAM = 7;

export function build(scene) {
  CARD_PLAN.forEach((plan) => {
    const p = cardFace(plan.dot); p.set({});
    scene.add(p.mesh);
    cards.push({ plan, p });
  });
  for (let i = 0; i < N_STREAM; i++) { const p = cardFace(i % 3 === 1); p.set({}); scene.add(p.mesh); stream.push(p); }
}

function at(plan, t) {
  const keys = plan.keys;
  if (t < keys[0][0]) return null;
  const [side, ct] = plan.chute;
  if (t >= ct) { // riding the chute
    const u = r01(t, ct, CHUTE_RIDE);
    if (u >= 1) return null;
    return { x: CHUTE_X[side], y: mix(CHUTE_TOP, CHUTE_BOT, io(u)), z: -1.2, s: 0.55, a: r01(t, ct, 0.08) * (1 - r01(u, 0.7, 0.3)) };
  }
  let i = 0;
  keys.forEach((k, j) => { if (t >= k[0]) i = j; });
  const cur = place(keys[i][1]), prev = i > 0 ? place(keys[i - 1][1]) : cur;
  const d = keys[i][2] || STEP, k = io(r01(t, keys[i][0], d));
  let s = mix(prev[3], cur[3], k);
  if (keys[i][1] === "blink") s = 0.02;
  if (i > 0 && keys[i - 1][1] === "blink") { // the pop: out of the body, then away
    const pop = r01(t, keys[i - 1][0], 0.3);
    s = mix(1.15 * Math.sin((Math.PI / 2) * pop) + 0.02, cur[3], k);
  }
  const inSlot = keys[i][1] === "slot" ? 1 - r01(t, keys[i][0] + d - 0.08, 0.08) : 1;
  return { x: mix(prev[0], cur[0], k), y: mix(prev[1], cur[1], k), z: mix(prev[2], cur[2], k), s, a: inSlot };
}

export function update(t) {
  cards.forEach(({ plan, p }) => {
    const q = at(plan, t);
    if (!q || q.a <= 0.002) { p.mesh.visible = false; return; }
    p.mesh.position.set(q.x, q.y, q.z);
    p.mesh.scale.setScalar(Math.max(0.01, q.s));
    alpha(p.mesh, q.a);
  });
  // the stream: each card's place on the chute is a pure function of t
  const on = t >= STREAM[0] && t < STREAM[1] + 0.5;
  stream.forEach((p, i) => {
    if (!on) { p.mesh.visible = false; return; }
    const phase = ((t - STREAM[0]) * 1.6 + i / N_STREAM) % 1;
    const fade = 1 - r01(t, STREAM[1], 0.5);
    p.mesh.position.set(CHUTE_X.L, mix(CHUTE_TOP + 0.1, CHUTE_BOT, phase), -1.19 + i * 0.002);
    p.mesh.scale.setScalar(0.55);
    alpha(p.mesh, fade * Math.min(1, phase / 0.1, (1 - phase) / 0.25));
  });
}
