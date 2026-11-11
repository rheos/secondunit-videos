// The cards: every request and result in the film. A request is a white slab with two grey bars; Blink's own carry one
// mint dot, and hold 19's the blue tab that throws the lever. A result is the same slab in amber, blank. Blink's cards
// condense in the beam at its visor (stations/beam.js: the sparks gather, the glow falls as the paper solidifies) and
// fly to the slot or to the end of the line; the older programs' cards grow out of their box and ride the rails up
// (standing, then flat into the slot). Results leave the spout: a program's seats on the trough and slides down its
// lane into its box; Blink's flies back into the beam and dissolves. The schedule is CARD_PLAN in timeline.js, plus
// ENTRIES for the hold 13 stream. Every pose is a pure function of t; the paths are built once from the machine's
// anchors and the programs' rails. Each card has its own materials, opacity 0 at creation, depth written only when
// nearly solid (kit rules).
import * as THREE from "three";
import { hero, solidAlpha } from "../parts.js";
import { rr } from "../kit/world.js";
import * as machine from "./machine.js";
import * as programs from "./programs.js";
import * as beam from "./beam.js";
import { BLINK, CARD_PLAN, ENTRIES, MACHINE_S, PROGRAMS, cl, io, mix, r01, ss, worldDim } from "../timeline.js";

const CW = 0.64, CHT = 0.34, PS = 0.8; // a card; the programs' cards at 0.8
const GLOW = beam.GLOW, BLUE = "#4f93d6", AMBER = "#d6a45a";
const STEP = 0.35, ENTRY = 0.6, QUEUE_RIDE = 1.25, LIFT = 0.16; // a step down the line; the ride in from the line; the ride up to a spot; a standing card's foot on the rail
const RAIL_DOWN = 1.0, STREAM_UP = 0.9, STREAM_DOWN = 0.7; // the return ride; the stream's hot timings (world-plan-v2 section 3)
const CONDENSE = 0.3, DISSOLVE = 0.35, FLIGHT = 0.55, BEAM_Q = 0.9; // forming in the beam; going back into it; a result's flight to the beam; a beam card's flight to the line
const TILT = [0.022, -0.026, 0.016, -0.02, 0.026, -0.014, 0.02, -0.024, 0.018, -0.02, 0.012, -0.018]; // each card rests a touch askew
const SLAB_RGB = [0.83, 0.845, 0.86];
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const Y = V3(0, 1, 0);

let F0, beamToSlot, beamToQ = [], back;

// ---------- poses: { p, e: [rx, ry, rz] | q: Quaternion, s, a, glow, mote: [k, dir] } ----------
// the test's ride orientation by progress v: a touch of yaw and roll that eases out, tipping flat (top edge first) when told
const eul = (v, flat) => [-1.45 * flat, -0.25 + 0.2 * v, 0.2 - 0.3 * v];
const pt = (curve, u) => (curve.isCurvePath ? curve.getPoint(u) : curve.getPointAt(u)); // a CurvePath's getPoint is already by arc length
// the test's ride: along a curve from u0 to u1 as v runs 0..1 (io), growing in the first 14 %, shrinking away in the last
// 12 %, lying flat over 55-95 % when it goes into the slot. lift keeps a standing card's foot on the rail; it drops as the
// card lies down so the flat card rests on the lip.
function ride(curve, u0, u1, v, { flat = 0, lift = 0, grow = false, shrink = false } = {}) {
  if (v < 0 || v >= 1) return null;
  const p = pt(curve, mix(u0, u1, io(v))), fk = flat ? ss(r01(v, 0.55, 0.4)) : 0;
  p.y += lift * (1 - 0.8 * fk);
  const s = (grow ? Math.min(1, v / 0.14) : 1) * (shrink ? 1 - 0.75 * r01(v, 0.88, 0.12) : 1);
  return { p, e: eul(v, fk), s, a: 1, v };
}
// a result on its way home: in the trough, long side along the travel, leaning back like a card in a rack with its face
// to the lens (a card lying flat is a sliver from a near-level camera and the near lip hides it), its foot on the bed
const LEAN = 1.15, LENS = V3(0, 0.35, 1).normalize(); // from flat, toward where the camera is: in front, a little above
function rideDown(curve, v, size, { grow = true, shrink = true } = {}) {
  if (v < 0 || v >= 1) return null;
  const u = io(v), p = pt(curve, u);
  // the travel direction: over a short window of the path (4 % each way, about 0.25 units) and never from the drop
  // out of the spout (the first 9 % of the path, nearly vertical). The way home is a drop, a trough and a lane joined
  // at corners; a basis built on the drop's vertical tangent has its top edge nearly level, and the sign test below
  // flipped it as the card turned the first corner, so the card snapped from standing to lying in one frame (forensics
  // on the d6 master, 8.86 s). Read from the trough instead, a result comes out of the spout already lying back, as
  // programs.js says results come, and the lane corner is turned over a few frames.
  const D = 0.04, uT = Math.max(u, 0.14), tg = pt(curve, Math.min(1, uT + D)).sub(pt(curve, uT - D)).normalize();
  const perp = (a) => a.clone().addScaledVector(tg, -a.dot(tg)).normalize(); // a direction with the travel taken out
  const up = perp(Y), toLens = perp(LENS);
  const cz = up.clone().multiplyScalar(Math.cos(LEAN)).addScaledVector(toLens, Math.sin(LEAN)).normalize(); // the face
  const cy = V3().crossVectors(cz, tg).normalize(); if (cy.y < 0) cy.negate(); // the card's top edge, upward
  const cx = V3().crossVectors(cy, cz); // along the travel, whichever way keeps the frame right-handed
  p.addScaledVector(up, 0.03).addScaledVector(cy, (CHT / 2) * size);
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(cx, cy, cz));
  const s = (grow ? Math.min(1, v / 0.14) : 1) * (shrink ? 1 - 0.75 * r01(v, 0.88, 0.12) : 1);
  return { p, q, s, a: 1, v };
}
// standing on the trunk at arc fraction f, breathing a little
const stand = (f, t, ci, lean = 0) => ({ p: programs.trunkAt(f).add(V3(0, LIFT + 0.005 * Math.sin(1.4 * t + ci * 1.7), 0)), e: [0, -0.05, -0.1 + TILT[ci % TILT.length] + lean], s: 1, a: 1 });

// a card standing in the line from tArr: it steps down the line on its row's steps (0.35 s each) and rides in from
// its spot to the slot over the last 0.6 s before its entry. A step the entry would interrupt is dropped: the card goes
// straight in from the spot before it (holds 08 and 12 step and enter in one move).
function waiting(c, k0, tArr, t, ci) {
  const Q = PROGRAMS.queue, tE = c.in - ENTRY;
  let f = Q[k0];
  for (const [ts, to] of c.steps || []) {
    if (ts + STEP > tE) break;
    const fq = Q[+to[1]];
    if (t < ts) return stand(f, t, ci);
    if (t < ts + STEP) { const v = (t - ts) / STEP; return stand(mix(f, fq, io(v)), t, ci, 0.08 * Math.sin(Math.PI * v)); }
    f = fq;
  }
  if (t < tE) return stand(f, t, ci);
  const i = c.from === "blink" ? 0 : c.from - 1; // the trunk and the tail into the mouth are the same on every rail
  return ride(programs.upSlot(i), programs.trunkU(i, f, true), 1, (t - tE) / ENTRY, { flat: 1, lift: LIFT, shrink: true });
}

// the request card of a plan row (or a stream entry shaped like one)
function request(c, t, ci) {
  if (c.from === "blink") {
    const t0 = c.out - 0.32;
    if (t < t0) return null;
    if (t < c.out) { // condensing at the beam's live focus: the sparks gather, the glow falls as it solidifies
      const k = ss(r01(t, t0, CONDENSE));
      if (k <= 0.001) return null;
      return { p: beam.focusAt(), e: [0, -0.25, 0.2], s: k, a: 1, glow: 1 - k, mote: [1 - k, 1, t0] };
    }
    let q;
    if (c.to === "slot") q = ride(beamToSlot, 0, 1, (t - c.out) / (c.in - c.out), { flat: 1, shrink: true });
    else {
      const k = +c.to[1];
      q = ride(beamToQ[k], 0, 1, (t - c.out) / BEAM_Q);
      if (!q) return waiting(c, k, c.out + BEAM_Q, t, ci);
    }
    if (q) q.p.lerp(beam.focusAt(), 1 - ss(cl(q.v / 0.15))); // from where it formed onto the built path
    return q;
  }
  if (t < c.out) return null;
  const i = c.from - 1;
  if (c.to === "slot") {
    const q = ride(programs.upSlot(i), 0, 1, (t - c.out) / (c.in - c.out), { flat: 1, lift: LIFT, grow: true, shrink: true });
    if (q && q.v < 0.14) q.p.x += programs.boxDx(i, t) * (1 - q.v / 0.14); // growing out of a box still sliding in
    return q;
  }
  const k = +c.to[1];
  const q = ride(programs.up(i), 0, programs.queueU(i, k), (t - c.out) / QUEUE_RIDE, { lift: LIFT, grow: true });
  if (q) { if (q.v < 0.14) q.p.x += programs.boxDx(i, t) * (1 - q.v / 0.14); return q; }
  return waiting(c, k, c.out + QUEUE_RIDE, t, ci);
}
// the result card of a plan row: out of the spout at c.result; home down its sender's lane, or back into the beam
function result(c, t) {
  if (t < c.result) return null;
  if (c.from === "blink") {
    const fl = c.flight ?? FLIGHT, tA = c.result + fl;
    if (t < tA) {
      const q = ride(back, 0, 1, (t - c.result) / fl, { grow: true });
      if (q) q.p.lerp(beam.focusAt(), ss(cl((q.v - 0.85) / 0.15))); // onto the live focus for the dissolve
      return q;
    }
    const k = ss(r01(t, tA, DISSOLVE));
    if (k >= 0.999) return null;
    return { p: beam.focusAt(), e: [0, -0.05, -0.1], s: 1 - k, a: 1, glow: k, mote: [k, -1, tA] };
  }
  return rideDown(programs.down(c.from - 1), (t - c.result) / (c.down ?? RAIL_DOWN), PS);
}

// ---------- the card itself ----------
const faceTex = (draw) => { const p = hero(CW, CHT, 300, draw); p.set({}); return p.mesh.material.map; };
const bars = (g, W) => { g.fillStyle = "#b7bcc2"; g.fillRect(18, 30, W * 0.62, 12); g.fillRect(18, 58, W * 0.4, 12); };
const paper = (g, W, H, fill) => { g.fillStyle = fill; rr(g, 2, 2, W - 4, H - 4, 10); g.fill(); };
let TEX = {}, SLAB_GEO, SHADOW_TEX, TAB_GEO;
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
// kind: "req" | "dot" | "res"; tab adds the blue index tab at the top right; s is the card's own size
function makeCard(scene, toon, { kind, tab = false, s = 1 }) {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(CW, CHT), new THREE.MeshBasicMaterial({ map: TEX[kind], transparent: true, depthWrite: false, fog: false, opacity: 0 }));
  face.position.z = 0.014;
  const slab = new THREE.Mesh(SLAB_GEO, toon("#d4d7db", { fog: false, transparent: true, opacity: 0 }));
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry((CW * 160) / 108, (CHT * 100) / 48), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, depthWrite: false, fog: false, opacity: 0 }));
  shadow.position.set(0.02, -0.035, -0.03);
  g.add(shadow, slab, face);
  let tabM = null;
  if (tab) { tabM = new THREE.Mesh(TAB_GEO, toon(BLUE, { fog: false, transparent: true, opacity: 0 })); tabM.position.set(0.2, 0.2, 0); g.add(tabM); }
  g.visible = false;
  scene.add(g);
  return { g, face, slab, shadow, tab: tabM, s, amber: kind === "res" };
}
const white = new THREE.Color("#ffffff"), glowC = new THREE.Color(GLOW), slabC = new THREE.Color().setRGB(...SLAB_RGB, THREE.SRGBColorSpace), black = new THREE.Color(0);
let dimK = 1; // the world dim under the end mark (a card in the beam then; it dims with the set, not with Blink)
function show(c, q) {
  if (!q || q.a <= 0.002 || q.s <= 0.001) { c.g.visible = false; return; }
  c.g.visible = true;
  c.g.position.copy(q.p);
  c.g.scale.setScalar(Math.max(0.001, q.s * c.s));
  if (q.q) c.g.quaternion.copy(q.q); else c.g.rotation.set(q.e[0], q.e[1], q.e[2]);
  const gl = q.glow ?? 0;
  c.face.material.color.copy(white).lerp(glowC, gl).multiplyScalar(dimK); c.face.material.opacity = q.a;
  c.slab.material.color.copy(slabC).lerp(glowC, gl).multiplyScalar(dimK); c.slab.material.emissive.copy(black).lerp(glowC, 0.9 * gl);
  solidAlpha(c.slab, q.a);
  if (c.tab) solidAlpha(c.tab, q.a);
  c.shadow.visible = gl < 0.5; c.shadow.material.opacity = 0.45 * q.a * Math.max(0, 1 - 2 * gl);
}

// ---------- the pools ----------
// plan rows: one request and one result each. The stream: pools that cycle by the entry's order on its path (rail or beam);
// a card is used again only once its last ride has ended (10 rail requests cover a 0.9 s ride at about 0.1 s spacing).
const plan = [], streamReq = [], streamRes = [], streamRows = [];
const N_RAIL_REQ = 10, N_BEAM_REQ = 3, N_RAIL_RES = 8, N_BEAM_RES = 3;

export function build(scene, { toon }) {
  SLAB_GEO = slabGeo(); SHADOW_TEX = shadowTex();
  TAB_GEO = new THREE.BoxGeometry(0.2, 0.14, 0.04);
  TEX = {
    req: faceTex((g, W, H) => { paper(g, W, H, "#ffffff"); bars(g, W); }),
    dot: faceTex((g, W, H) => { paper(g, W, H, "#ffffff"); bars(g, W); g.fillStyle = "#6ad08a"; g.beginPath(); g.arc(W - 22, 22, 9, 0, Math.PI * 2); g.fill(); }),
    res: faceTex((g, W, H) => { paper(g, W, H, AMBER); }),
  };
  // the paths (world-plan-v2 section 3), built once: the focus with Blink at rest, the slot's mouth, the spout
  F0 = V3(BLINK.x + 0.87, BLINK.y + 2.33, BLINK.z + 1.43);
  const slot = machine.at("slot"), spout = machine.at("spout"), S = MACHINE_S;
  const lift = F0.clone().add(V3(0.23, 0.5, -1.03));
  beamToSlot = new THREE.CatmullRomCurve3([F0.clone(), lift, slot.clone().add(V3(-0.02 * S, 0.1 * S, 0.8 * S)), programs.slotMouth()], false, "catmullrom", 0.5);
  beamToQ = PROGRAMS.queue.map((_, k) => { const sp = programs.queueSpot(k).p; return new THREE.CatmullRomCurve3([F0.clone(), lift.clone(), sp.clone().add(V3(0.1, 0.35, 0.25)), sp.clone().add(V3(0, LIFT, 0))], false, "catmullrom", 0.5); });
  back = new THREE.CatmullRomCurve3([spout.clone(), spout.clone().add(V3(-0.04, -0.12, 0.4)), V3(BLINK.x + 0.5, 1.9, BLINK.z + 0.6), F0.clone()], false, "catmullrom", 0.5);

  CARD_PLAN.forEach((c) => {
    const own = c.from === "blink", s = own ? 1 : PS;
    plan.push({ c, req: makeCard(scene, toon, { kind: own ? "dot" : "req", tab: !!c.tab, s }), res: makeCard(scene, toon, { kind: "res", s }) });
  });
  // the stream: entries as rows; rail ones ride up in 0.9 s and home in 0.7 s, beam ones form 0.92 s before they enter
  let rail = 0, bm = 0;
  ENTRIES.forEach((e) => {
    const own = e.from === "blink";
    streamRows.push({ from: e.from, out: e.at - (own ? ENTRY : STREAM_UP), to: "slot", in: e.at, result: e.result, down: STREAM_DOWN, order: own ? bm++ : rail++ });
  });
  for (let j = 0; j < N_RAIL_REQ; j++) streamReq.push({ own: false, j, N: N_RAIL_REQ, card: makeCard(scene, toon, { kind: "req", s: PS }) });
  for (let j = 0; j < N_BEAM_REQ; j++) streamReq.push({ own: true, j, N: N_BEAM_REQ, card: makeCard(scene, toon, { kind: "dot", s: 1 }) });
  for (let j = 0; j < N_RAIL_RES; j++) streamRes.push({ own: false, j, N: N_RAIL_RES, card: makeCard(scene, toon, { kind: "res", s: PS }) });
  for (let j = 0; j < N_BEAM_RES; j++) streamRes.push({ own: true, j, N: N_BEAM_RES, card: makeCard(scene, toon, { kind: "res", s: 1 }) });
}

export function update(t) {
  dimK = worldDim(t);
  let mote = null; // the sparks: one event per frame, the latest one started
  const take = (q) => { if (q && q.mote && (!mote || q.mote[2] > mote[2])) mote = q.mote; return q; };
  plan.forEach(({ c, req, res }, ci) => { show(req, take(request(c, t, ci))); show(res, take(result(c, t))); });
  // the stream pools: card j of a pool plays every entry whose order on its path is j mod N; the later ride wins, and by
  // the pool sizes no two rides on one card overlap
  const pick = (pool, fn) => pool.forEach(({ own, j, N, card }) => {
    let q = null;
    for (const row of streamRows) {
      if ((row.from === "blink") !== own || row.order % N !== j) continue;
      const r = fn(row, t, 10 + j);
      if (r) q = r;
    }
    show(card, take(q));
  });
  pick(streamReq, request); pick(streamRes, result);
  if (mote) beam.motes(mote[0], mote[1], beam.focusAt());
}
