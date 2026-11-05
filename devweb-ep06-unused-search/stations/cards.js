// The cards: plain white request cards, no words. Each is a thin slab with a soft edge and a soft shadow. Blink's own
// cards carry one small mint dot and push out through the front of its body, low on its belly under the visor (no
// hands, no belt, no tether). Cards lean into a move and settle upright when they stop in the queue, turn and slide edge
// first into the slot, and slide out from under the crate down a chute. Waiting cards dim when the line is not about
// them (look bible depth targets). Every transform is a pure function of t; the schedule is CARD_PLAN in timeline.js.
import * as THREE from "three";
import { hero, solidAlpha } from "../parts.js";
import { rr } from "../kit/world.js";
import { BLINK_X, CARD_PLAN, CHUTE_RIDE, CHUTE_X, STREAM, T, cl, io, mix, r01, spanAlpha } from "../timeline.js";

const CW = 0.64, CHT = 0.34, STEP = 0.35, DT = 1 / 30;
const Z = -1.1, SPOTS = [[1.62, 3.55], [1.52, 3.05], [1.42, 2.55], [1.32, 2.05]];
const SLOT = [1.25, 3.55], FACE_Z = -1.5;
const MOUTH = [BLINK_X + 0.42, -0.6]; // where Blink cards come out: low on its front, right of centre, under the visor and the note
const CHUTE_TOP = 2.2, CHUTE_BOT = 1.55, RIDE_S = 0.55, RIDE_Z = -1.2; // the crate's underside and the chute's foot
const LIT = 1, REST = 0.82, IDLE = 0.34;
const QUEUE_ON = [[T.h04, T.h05], [T.h06, T.h07], [T.h08, T.h09], [T.h12, T.h13]]; // holds about the line of cards
const OWN_ON = [[T.h10, T.h11], [T.h12, T.h13]]; // holds about Blink's own card
const TILT = [0.022, -0.026, 0.016, -0.02, 0.026, -0.014, 0.02, -0.024, 0.018, -0.02]; // each card rests a touch askew
const SLAB_RGB = [0.83, 0.845, 0.86];
const out3 = (x) => 1 - Math.pow(1 - cl(x), 3);

// ---------- poses: { x, y, z, s, rx, ry, rz, a, lift, crop, kind } ----------
const placeOf = (p, ci) => {
  if (p === "blink") return { x: MOUTH[0], y: MOUTH[1] + 0.04, z: 1.02, s: 1, rx: 0, ry: 0, rz: TILT[ci] };
  const i = +p[1];
  return { x: p[0] === "S" ? SPOTS[i][0] : 2.8, y: SPOTS[i][1], z: Z, s: 1, rx: 0, ry: 0, rz: TILT[ci] };
};
// a move from a to b. From Blink the path arcs: out to the right first, then up, so it clears the face and the note.
// The long arc uses a gentler ease (peak speed 1.5x the mean, not io's 3x), so the toss doesn't smear.
const sm = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
function travel(a, b, u, arc) {
  const k = arc ? sm(u) : io(u), kx = arc ? sm(u / 0.7) : k, ky = arc ? sm((u - 0.3) / 0.7) : k;
  return { x: mix(a.x, b.x, kx), y: mix(a.y, b.y, ky), z: mix(a.z, b.z, k), s: mix(a.s, b.s, k), rx: 0, ry: 0, rz: mix(a.rz, b.rz, k) };
}
// out of Blink: starts inside the body, so the body itself hides it until it pushes through the skin, then eases out
function emerge(e, ci) {
  const k = out3(e);
  return { x: MOUTH[0], y: MOUTH[1] + 0.04 * k, z: mix(0.6, 1.02, k), s: mix(0.55, 1, k), rx: 0, ry: 0, rz: TILT[ci] + 0.3 * (1 - k), a: 1, lift: LIT, kind: "pop" };
}
// into the slot: shrink and turn long side up while swinging edge-on, stop at the mouth, then slide in edge first; the
// crate's face hides it as it goes
const AT_SLOT = { x: SLOT[0] + 0.2, y: SLOT[1], z: FACE_Z + 0.25, s: 0.5, rx: 0, ry: -0.9, rz: Math.PI / 2 };
function feed(from, u, arc) {
  const A = arc ? 0.72 : 0.6;
  if (u < A) {
    const v = u / A, p = travel(from, AT_SLOT, v, arc), k = io(v);
    return { ...p, ry: mix(0, AT_SLOT.ry, k), rz: mix(from.rz, AT_SLOT.rz, k), a: 1, u, kind: "feed" };
  }
  const v = io((u - A) / (1 - A));
  return { ...AT_SLOT, x: mix(AT_SLOT.x, SLOT[0] - 0.21, v), z: mix(AT_SLOT.z, FACE_Z - 0.27, v), a: 1 - r01(v, 0.85, 0.15), u, kind: "feed" };
}
// down a chute: slides out from under the crate (the part still inside is cut off), gathers speed, leaves at the foot
function ride(side, e, dur) {
  const u = e / dur;
  if (u < 0 || u >= 1) return null;
  const h = CHT * RIDE_S, p = 0.7 * u + 0.3 * u * u;
  const y = mix(CHUTE_TOP + h / 2, CHUTE_BOT - h * 0.3, p);
  return { x: CHUTE_X[side], y, z: RIDE_Z, s: RIDE_S, rx: 0, ry: 0, rz: 0, a: 1 - r01(u, 0.8, 0.2), crop: cl((CHUTE_TOP - (y - h / 2)) / h), lift: LIT, kind: "ride" };
}

function core(plan, ci, t) {
  const keys = plan.keys;
  if (t < keys[0][0]) return null;
  const [side, ct] = plan.chute;
  if (t >= ct) return ride(side, t - ct, CHUTE_RIDE);
  let i = 0;
  keys.forEach((k, j) => { if (t >= k[0]) i = j; });
  const [t0, p, d0] = keys[i], d = d0 || STEP;
  if (p === "blink") return emerge(r01(t, t0, 0.26), ci);
  const prev = i > 0 ? keys[i - 1][1] : p, from = placeOf(prev, ci), arc = prev === "blink", u = r01(t, t0, d);
  if (p === "slot") return feed(from, r01(t, t0, ct - t0), arc); // the feed fills the time up to the chute
  return { ...travel(from, placeOf(p, ci), u, arc), a: 1, move: u > 0 && u < 1 ? 4 * u * (1 - u) : 0, kind: "move" };
}

// waiting cards: dim unless the line is the subject; a moving card lifts toward rest; Blink's own card is lit on its holds
function liftAt(t, own, move) {
  let k = mix(IDLE, REST, spanAlpha(QUEUE_ON, t, 0.3));
  if (own) k = Math.max(k, mix(IDLE, LIT, spanAlpha(OWN_ON, t, 0.3)));
  return Math.max(k, mix(k, REST, move));
}

function cardPose(plan, ci, t) {
  const q = core(plan, ci, t);
  if (q && q.kind === "feed") q.lift = mix(liftAt(t, plan.dot, 0), LIT, cl(q.u * 4)); // brightens as it heads in
  if (!q || q.kind !== "move") return q;
  // lean into the move and settle upright as it stops: tilt from the speed, which eases to zero, so no rebound
  const b = core(plan, ci, t - DT);
  if (b && b.kind === "move") {
    const vx = (q.x - b.x) / DT, vy = (q.y - b.y) / DT, lim = (v, m) => Math.max(-m, Math.min(m, v));
    q.rz += lim(-0.035 * vx, 0.1);
    q.ry += lim(0.07 * vx, 0.15);
    q.rx += lim(-0.05 * vy, 0.15);
  }
  q.y += 0.005 * Math.sin(1.4 * t + ci * 1.7); // waiting cards breathe a little
  q.lift = liftAt(t, plan.dot, q.move);
  return q;
}

// ---------- the card itself ----------
const cardFace = (dot) => hero(CW, CHT, 300, (g, W, H) => {
  g.fillStyle = "#ffffff"; rr(g, 2, 2, W - 4, H - 4, 10); g.fill();
  g.fillStyle = "#b7bcc2"; g.fillRect(18, 30, W * 0.62, 12); g.fillRect(18, 58, W * 0.4, 12);
  if (dot) { g.fillStyle = "#6ad08a"; g.beginPath(); g.arc(W - 22, 22, 9, 0, Math.PI * 2); g.fill(); }
});
let SLAB_GEO, SHADOW_TEX;
function slabGeo() {
  const w = CW / 2 - 0.008, h = CHT / 2 - 0.008, r = 0.03, s = new THREE.Shape();
  s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h);
  s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r); s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 6 });
  geo.translate(0, 0, -0.007);
  return geo;
}
function shadowTex() {
  const c = document.createElement("canvas"); c.width = 160; c.height = 100;
  const g = c.getContext("2d");
  g.filter = "blur(9px)"; g.fillStyle = "rgba(0,0,0,0.7)"; rr(g, 26, 26, 108, 48, 10); g.fill();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function makeCard(scene, toon, dot) {
  const g = new THREE.Group();
  const face = cardFace(dot); face.set({});
  face.mesh.position.z = 0.014;
  const slab = new THREE.Mesh(SLAB_GEO, toon("#d4d7db", { fog: false, transparent: true }));
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry((CW * 160) / 108, (CHT * 100) / 48), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false, fog: false }));
  shadow.position.set(0.02, -0.035, -0.03);
  g.add(shadow, slab, face.mesh);
  g.visible = false;
  scene.add(g);
  return { g, face: face.mesh, map: face.mesh.material.map, slab, shadow };
}
function show(c, q) {
  // reset the cut first, every frame
  c.face.scale.y = 1; c.face.position.y = 0; c.map.repeat.y = 1; c.map.offset.y = 0; c.slab.scale.y = 1; c.slab.position.y = 0;
  if (!q || q.a <= 0.002) { c.g.visible = false; return; }
  c.g.visible = true;
  c.g.position.set(q.x, q.y, q.z);
  c.g.scale.setScalar(Math.max(0.01, q.s));
  c.g.rotation.set(q.rx || 0, q.ry || 0, q.rz || 0);
  const f = q.crop ?? 1;
  if (f < 1) { // only the part below the crate's underside shows
    const v = Math.max(0.001, f), dy = (-CHT / 2) * (1 - v);
    c.face.scale.y = v; c.face.position.y = dy; c.map.repeat.y = v; c.slab.scale.y = v; c.slab.position.y = dy;
  }
  const k = q.lift ?? LIT;
  c.face.material.color.setRGB(k, k, k, THREE.SRGBColorSpace);
  c.face.material.opacity = q.a; c.face.visible = true;
  c.slab.material.color.setRGB(SLAB_RGB[0] * k, SLAB_RGB[1] * k, SLAB_RGB[2] * k, THREE.SRGBColorSpace);
  solidAlpha(c.slab, q.a);
  c.shadow.visible = f >= 1;
  c.shadow.material.opacity = 0.45 * q.a;
}

const cards = [], stream = [];
const N_STREAM = 7, PERIOD = 1 / 1.6, STREAM_LAST = STREAM[1] - 0.45; // no new card starts down after this

export function build(scene, { toon }) {
  SLAB_GEO = slabGeo();
  SHADOW_TEX = shadowTex();
  CARD_PLAN.forEach((plan) => cards.push({ plan, ...makeCard(scene, toon, plan.dot) }));
  for (let i = 0; i < N_STREAM; i++) stream.push(makeCard(scene, toon, i % 3 === 1));
}

export function update(t) {
  cards.forEach((c, ci) => show(c, cardPose(c.plan, ci, t)));
  // the stream: card i starts down the chute every PERIOD, offset by i / N. A card only shows on a run that started
  // inside the stream, so the chute fills from the top at the start and drains out of the foot at the end.
  stream.forEach((c, i) => {
    const n = Math.floor((t - STREAM[0]) / PERIOD + i / N_STREAM), start = STREAM[0] + (n - i / N_STREAM) * PERIOD;
    const on = t >= STREAM[0] && start >= STREAM[0] - 1e-6 && start <= STREAM_LAST;
    show(c, on ? ride("L", t - start, PERIOD) : null);
  });
}
