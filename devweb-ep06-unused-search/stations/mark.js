// The Mark: Blink alone. No harness, no belt, no hands (Robin). It acts from its mark: eyes that lead, a body that
// follows them (turn, tilt, lean right only, a small rise), squash and stretch on the hero beats, eased blinks tied to
// gaze shifts, and a mouth that crossfades. Its cards come out of its body (cards.js).
// Every value is a pure function of film time t: keys are walked from the start each frame, nothing is carried over.
import * as THREE from "three";
import { makeBlink } from "../kit/blink3d.js";
import { basic } from "../parts.js";
import { BLINKS, BLINK_X, CARD_PLAN, FOOT_Y, T, cl, io, mix, r01, spanAlpha } from "../timeline.js";

let pivot, body, blink, pool, sprout, eyes = [], mouths = [];

// ---------- keys ----------
// K(time, values, eye ease, body ease). Eyes and expression ease over d: 0.1 s is a saccade (look bible: 4-6 frames),
// longer is following something that moves. The body follows 0.05 s later over at least 0.3 s.
// The mouth is its own channel: smile (0) or grin (1), chosen per key and always crossfaded over exactly 0.1 s, so it
// never rests part-way however slowly happy or eager ease.
const ZERO = { look: 0, lookY: 0, happy: 0, think: 0, skew: 0, eager: 0, lean: 0, rise: 0, grin: 0 };
const K = (t, o = {}, d = 0.1, bd) => {
  const v = { ...ZERO, ...o };
  v.grin = v.happy >= 0.5 || v.eager >= 0.7 ? 1 : 0;
  return { t, v, d, bd: bd ?? Math.max(0.3, d) };
};
const MOUTH_D = 0.1;
const TIP = { look: 0.3, lookY: 0.9 }, NEW = { look: 0.9, lookY: 0.8 }, DIAL_UP = { look: 0.5, lookY: 1 };
const SLOT = { look: 1, lookY: 0.95, lean: 2 }, OWN = { look: 0.25, lookY: -0.8 }, LAMP = { look: 1.2, lookY: 1.2, lean: 2 };
const COUNTER = { look: 1.1, lookY: 0.9, lean: 3 }, CHUTE = { L: { look: 0.15, lookY: 0.68 }, R: { look: 0.7, lookY: 0.68 } };
// a card going down a chute: eyes jump to the chute top, then ride down with it
const DOWN = (side, t0, o = {}) => [K(t0, { ...CHUTE[side], ...o }), K(t0 + 0.12, { ...CHUTE[side], lookY: 0.48, ...o }, 0.5)];
// reading one line: eyes to its start, then along it
const READ = (t0, lookY, dur, o = {}) => [K(t0, { look: 0.05, lookY, ...o }), K(t0 + 0.1, { look: 0.55, lookY, ...o }, dur)];
const c8 = T.h08, c12 = T.h12, ROW_T = 0.36;
// Blink's own cards, from the plan: when each comes out, and when the last one starts down the old chute
const OWN_CARDS = CARD_PLAN.filter((c) => c.keys[0][1] === "blink");
const POPS = OWN_CARDS.map((c) => c.keys[0][0]), LAST_RIDE = OWN_CARDS[OWN_CARDS.length - 1].chute[1];
const ONE = T.endIn - 0.36; // the last word, "one"

const FACE = [
  // the opening starts inside an action: Blink is coming down from a small hop, leaning right, turning to the dial;
  // eyes arrive on the pointer by 0.35 s, the landing settles with one rebound by about 0.7 s
  K(0, { look: -0.1, lookY: 0.3, lean: 3 }), K(0.1, TIP, 0.25),
  K(T.smarter - 0.02, { ...NEW, eager: 0.35, rise: 0.06 }), // the new setting appears: eyes there at once, brighter
  K(T.smarter + 0.45, { ...NEW, eager: 0.15, rise: 0.06 }, 0.4),
  K(T.h02 + 0.2, TIP, 0.45), // slides back to the pointer, and stays
  K(T.h03, { look: 0.25, lookY: 1.2, rise: 0.1 }), // the lid stencil
  ...READ(T.my2 + 0.1, 1.15, 0.5, { rise: 0.1 }), K(T.my2 + 1.1, TIP), // reads the stencil, then down to the pointer
  K(T.h04 + 0.08, SLOT), ...DOWN("L", T.h04 + 1.1), // the card at the slot, then down the left chute
  K(T.july, { ...NEW, rise: 0.06 }),
  K(T.added, { ...NEW, rise: 0.06, eager: 0.25 }, 0.15), // the new setting, a little brighter
  K(T.added + 1.1, { ...TIP, rise: 0.03 }), // the pointer still on old
  K(T.added + 2.4, { ...NEW, rise: 0.04, lean: 1 }), // and back to the new one
  K(T.h06 + 0.2, { look: 1, lookY: 0.6, lean: 4 }, 0.5), // along the queue as it slides in
  K(T.h07, { ...TIP, rise: 0.08 }), // the tag
  K(T.old2, { look: 0.15, lookY: 0.75, rise: 0.04 }), // the old label
  K(T.dflt, { ...TIP, rise: 0.08 }), // back to the tag on default, with a nod
  K(c8 + 0.1, SLOT), ...DOWN("L", c8 + 0.6), K(c8 + 1.2, SLOT), ...DOWN("L", c8 + 1.6),
  K(c8 + 2.2, SLOT), ...DOWN("L", c8 + 2.6), K(c8 + 2.95, SLOT), ...DOWN("L", c8 + 3.3),
  K(T.h09 + 0.2, LAMP), // the lamp
  K(T.nothing2 + 0.08, { ...LAMP, happy: 0.75, rise: 0.05 }, 0.12), // mild pride: nothing broke
  K(T.nothing2 + 0.6, { ...LAMP, happy: 0.55, rise: 0.03 }, 0.5),
  // hold 10: looks down at its belly as it gathers, the card pops out, then it follows it up to the queue
  K(T.h10 + 0.02, { ...OWN, happy: 0.3 }),
  K(T.h10 + 0.6, { look: 0.7, lookY: 0.25, happy: 0.35 }, 0.3), K(T.h10 + 0.9, { look: 1.05, lookY: 0.62, lean: 3, happy: 0.35 }, 0.6),
  ...READ(T.h11 + 0.3, 1.2, 0.55, { rise: 0.12 }), ...READ(T.listed, 1.05, 0.6, { rise: 0.12 }), ...READ(T.desc, 0.9, 0.55, { rise: 0.1 }),
  // hold 12: unaware contentment, its own card in the queue, into the slot and down the old chute
  K(T.h12 + 0.3, { look: 1.05, lookY: 0.78, lean: 2, happy: 0.35 }), K(c12 + 1.1, { ...SLOT, happy: 0.35 }), ...DOWN("L", c12 + 1.45, { happy: 0.4 }),
  // hold 13: the stream, then the counter, eyes widening as it climbs; a glance away and the take on 36
  K(T.h13 + 0.2, { look: 0.3, lookY: 0.6, lean: 2, eager: 0.1 }),
  K(T.h13 + 0.6, { ...COUNTER, eager: 0.2 }), K(T.h13 + 0.72, { ...COUNTER, eager: 0.6 }, T.one3 - T.h13 - 1.1),
  K(T.one3 - 0.36, { look: 0.3, lookY: 0.6, lean: 2, eager: 0.45 }),
  K(T.one3 - 0.03, { ...COUNTER, lean: 4, eager: 0.95, rise: 0.1 }, 0.07, 0.25),
  K(T.one3 + 0.5, { ...COUNTER, lean: 4, eager: 0.75, rise: 0.06 }, 0.4),
  K(T.h14, { ...LAMP, eager: 0.3 }), K(T.h14 + 0.3, LAMP, 0.4),
  // hold 15: peers into the empty tray, a little puzzled
  K(T.h15 + 0.2, { look: 1.1, lookY: 0.5, lean: 7, rise: 0.1 }, 0.12, 0.5),
  K(T.uses + 0.4, { look: 1.1, lookY: 0.45, lean: 7, rise: 0.1, skew: 0.35 }, 0.25, 0.5),
  // holds 16-17: thinking, the strip's left end, then it follows the marker to day 53 (the marker's own ease)
  K(T.h16, { look: 0, lookY: 1.2, think: 0.95 }, 0.15), K(T.changedEnd, { look: -0.3, lookY: 0.5 }),
  K(T.h17 + 0.05, { look: 1, lookY: 0.5, lean: 3 }, 1.0),
  // hold 18: the note drifts in from the right below the strip; a glance right catches it, eyes ride it down and in
  // under the face (keys on its path at +0.12, +0.27, +0.6), then read it once it has settled
  K(T.h18, { look: 1.15, lookY: 0.2 }), K(T.h18 + 0.12, { look: 0.95, lookY: 0.1 }, 0.15),
  K(T.h18 + 0.27, { look: 0.4, lookY: -0.6 }, 0.3), K(T.h18 + 0.6, { look: 0.1, lookY: -0.9 }, 0.35),
  K(T.h18 + 1.2, { look: -0.15, lookY: -0.85 }), K(T.h18 + 1.3, { look: 0.4, lookY: -0.85 }, 0.6),
  K(T.h18 + 2.1, { look: 0.1, lookY: -0.9, happy: 0.15 }, 0.3),
  // hold 19: its card out of its front, up into the slot, down the new chute; a small pleased beat
  K(T.h19 - 0.1, OWN), K(T.h19 + 0.36, { look: 0.6, lookY: 0.2 }, 0.2), K(T.h19 + 0.55, SLOT, 0.25),
  ...DOWN("R", T.h19 + 1.0), K(T.h19 + 1.4, { ...CHUTE.R, lookY: 0.5, happy: 0.65 }, 0.15), K(T.h19 + 2.2, { ...CHUTE.R, lookY: 0.55, happy: 0.4 }, 0.5),
  // hold 20: side-eye from the note to the chute, then the crooked smile on the bet
  K(T.h20, { look: 0.1, lookY: -0.9, skew: 0.8, happy: 0.2 }, 0.15),
  K(T.h20 + 0.85, { look: 0.15, lookY: -0.85, skew: 0.8, happy: 0.2, lean: 2.5 }, 0.15), // shifts its weight on the note
  K(T.but2, { ...CHUTE.R, skew: 1, happy: 0.4, lean: 1 }, 0.45),
  K(T.id, { ...CHUTE.R, skew: 1, happy: 0.5, lean: 3 }, 0.2),
  K(T.h21, DIAL_UP),
  K(T.h21 + 1.3, TIP), K(T.h21 + 2.6, { ...DIAL_UP, rise: 0.06 }), // the pointer, then the dial again, with a nod
  ...READ(T.h22 + 0.2, 1.2, 0.55, { rise: 0.12 }), ...READ(T.list, 1.05, 0.55, { rise: 0.12 }), K(T.dflt2 - 0.2, { ...TIP, rise: 0.08 }),
  K(T.h23, { ...NEW, rise: 0.08, eager: 0.2 }), K(T.new2, { ...NEW, rise: 0.08, eager: 0.35 }, 0.2),
  K(T.h24 + 0.1, { look: 0.1, lookY: 1, rise: 0.06 }), K(T.h25 + 0.1, { look: 0.8, lookY: 1, rise: 0.06 }),
  K(T.h25 + 0.45, { look: 0.8, lookY: 1, rise: 0.06, happy: 0.45 }, 0.15), // its own small face on the note
  K(T.h25 + 1.3, { look: 0.1, lookY: 1, rise: 0.06, happy: 0.2 }), // back to the left panel
  K(T.h25 + 2.3, { look: 0.8, lookY: 1, rise: 0.06, happy: 0.45, lean: 1.5 }), // and the right one again
  // hold 26: down the log, one row at a time as they type in
  ...[0, 1, 2, 3, 4, 5].map((i) => K(T.h26 + 0.4 + ROW_T * i, { look: 1, lookY: 0.9 - 0.11 * i, lean: 3 })),
  // hold 27: the dial, the unused new setting on "a smarter search", then its last card out (CARD_PLAN), up into the
  // slot, down the old chute on "still using the old one", and the look to camera landing on "one", held to the end
  K(T.h27 + 0.1, DIAL_UP), K(T.built, { ...NEW, eager: 0.2 }),
  K(POPS[2] - 0.15, OWN), K(POPS[2] + 0.42, { look: 0.6, lookY: 0.2 }, 0.25), K(POPS[2] + 0.7, SLOT, 0.35),
  ...DOWN("L", LAST_RIDE),
  K(ONE - 0.04, { look: 0, lookY: 0, happy: 0.2 }), K(T.endIn, { look: 0, lookY: 0, happy: 0.25 }, 0.3),
].sort((a, b) => a.t - b.t);

// the value at time t: walk the keys from the start, each one easing from where the last had got to (no jumps when
// keys come faster than their ease)
function keyed(t, bodyEase) {
  const dOf = (k, n) => (n === "grin" ? MOUTH_D : bodyEase ? k.bd : k.d);
  const step = (from, k, at) => { const o = {}; for (const n in ZERO) o[n] = mix(from[n], k.v[n], io(r01(at, k.t, dOf(k, n)))); return o; };
  let s = FACE[0].v, i = 0;
  for (; i + 1 < FACE.length && FACE[i + 1].t <= t; i++) s = step(s, FACE[i], FACE[i + 1].t);
  return step(s, FACE[i], t);
}

// ---------- blinks: 12 frames at 60 fps, eased (close 4, shut 2, open 6), on the bigger gaze shifts ----------
// the schedule lives in timeline.js (BLINKS) so cues.js can declare each blink to forensics
function blinkAt(t, c) {
  const u = t - c;
  if (u < 0 || u > 0.2) return 0;
  if (u < 1 / 15) return io(u * 15);
  return u < 0.1 ? 1 : 1 - io((u - 0.1) * 10);
}

// ---------- squash and stretch ----------
// a landing with one rebound at about 0.2 of the push, done in about 25 frames
const settle = (u) => (u < 0 || u > 0.6 ? 0 : Math.exp(-u / 0.13) * Math.cos((2 * Math.PI * u) / 0.4));
// [release time, gather (anticipation squash), stretch after release, gather length]. Gathers only on the hero moves.
// the opening hop: mid-fall at frame 0, lands at HOP_LAND (rise only ever up, so nothing leaves the frame)
const HOP_LAND = 0.25;
const hop = (t) => (t >= HOP_LAND ? 0 : 0.14 * (1 - Math.pow((t + 0.12) / (HOP_LAND + 0.12), 2)));
const hopStretch = (t) => (t >= HOP_LAND ? 0 : 0.05 * (1 - r01(t, 0.12, HOP_LAND - 0.12)));
const SQUASH = [
  [HOP_LAND, 0, -0.09, 0.1], // the landing: squash, one small rebound
  [T.nothing2 + 0.12, 0, 0.045, 0.1], // puffs up a little: nothing broke
  [POPS[0], 0.06, 0.07, 0.12], // hero: its first card comes out
  [T.one3, 0.1, 0.11, 0.15], // hero: the take on 36 of 37
  [POPS[1], 0.06, 0.07, 0.12], // hero: the card that goes down the new chute
  [T.h19 + 1.35, 0.035, 0.03, 0.1], // pleased (squash only: the strip is overhead)
  [POPS[2], 0.05, 0.06, 0.12], // the last card out, on "for an AI"
  [ONE - 0.04, 0, 0.03, 0.1], // turns to camera
  // weight shifts that carry the quiet holds (no gather, one small rebound)
  [T.my2 + 1.1, 0, 0.022, 0.1], [T.added + 1.1, 0, 0.022, 0.1], [T.added + 2.4, 0, 0.02, 0.1], [T.dflt, 0, 0.03, 0.1],
  [T.h20 + 0.85, 0, -0.03, 0.1], [T.id, 0, -0.025, 0.1], [T.h21 + 2.6, 0, 0.03, 0.1], [T.h25 + 2.3, 0, 0.025, 0.1],
];
function squashAt(t) {
  let s = 0;
  for (const [t0, gather, stretch, pre] of SQUASH) {
    if (t < t0 - pre) continue;
    if (t < t0) { s -= gather * io(r01(t, t0 - pre, pre)); continue; }
    const u = t - t0;
    s += u < 0.07 ? mix(-gather, stretch, io(u / 0.07)) : stretch * settle(u - 0.07);
  }
  return s;
}

// how far the body reaches sideways when it turns by yaw (support of the superellipse, N 2.8, depth 0.92)
const Q = 2.8 / 1.8;
const reach = (yaw) => Math.pow(Math.pow(Math.abs(Math.cos(yaw)), Q) + Math.pow(Math.abs(0.92 * Math.sin(yaw)), Q), 1 / Q);

export function build(scene, { ramp, G }) {
  pivot = new THREE.Group();
  pivot.position.set(BLINK_X, FOOT_Y, 0);
  body = new THREE.Group();
  body.position.y = 1.08;
  pivot.add(body);
  scene.add(pivot);
  blink = makeBlink(THREE, G, ramp);
  body.add(blink.root);
  // eye halo down to the rest glow, from here, no kit edit
  blink.root.traverse((o) => { if (o.material && o.material.blending === THREE.AdditiveBlending) o.material.opacity = 0.03; });
  // the eye groups and where the kit put them, before any face() call moves them
  eyes = blink.root.children.filter((o) => o.isGroup && o.children.length === 2).map((g) => ({ g, base: g.position.clone() }));
  // smile and grin get their own materials so they can crossfade (the kit swaps them in one frame)
  mouths = blink.root.children.filter((o) => o.isMesh && o.geometry.type === "TubeGeometry" && o.material.isMeshBasicMaterial);
  mouths.forEach((m) => { m.material = m.material.clone(); m.material.transparent = true; });
  // the sprout on its own hinge at its base, so it can trail the body and sway
  sprout = new THREE.Group();
  sprout.position.set(0, G.B - 0.06, 0);
  blink.root.children.filter((o) => o.isMesh && o.geometry.type === "TubeGeometry" && o.material.isMeshToonMaterial).forEach((m) => { sprout.add(m); m.position.y -= G.B - 0.06; });
  blink.root.add(sprout);

  // the pool under Blink: small, not a wide haze
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,0.09)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 40), basic("#ffffff", { map: new THREE.CanvasTexture(c) }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(BLINK_X, FOOT_Y - 0.01, 0.2);
  scene.add(pool);
}

const leanAt = (t) => keyed(t - 0.05, true).lean + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.9 + 0.4)); // the sway only ever leans right

export function update(t) {
  const f = keyed(t, false), b = keyed(t - 0.05, true);
  // under the calendar strip (holds 16-20) Blink never grows taller than at rest: its sprout sits just under the strip
  const low = spanAlpha([[T.h16 - 0.1, T.h21 + 0.9]], t, 0.3);
  const rise = (b.rise + hop(t)) * (1 - low);
  let sy = 1 + 0.0075 * Math.sin((2 * Math.PI * t) / 3.4) + squashAt(t) + hopStretch(t);
  if (sy > 1) sy = 1 + (sy - 1) * (1 - low);
  const sx = 1 / Math.sqrt(sy);
  // the body turns and tilts toward what the eyes are on, a beat behind them
  const yaw = 0.1 * b.look, pitch = -0.05 * b.lookY;
  const lean = leanAt(t);
  // anything that widens the body (squash, turn) is paid for by moving right, so the left edge never moves out
  const dx = Math.max(0, 1.03 * (sx * reach(yaw) - 1));
  pivot.position.set(BLINK_X + dx, FOOT_Y + rise, 0);
  pivot.rotation.set(pitch, 0, -THREE.MathUtils.degToRad(lean));
  pivot.scale.set(sx, sy, sx);
  body.rotation.set(0, yaw, 0);
  // the sprout trails the body's lean and the squash, with its own slow sway; smaller under the strip
  const trail = THREE.MathUtils.degToRad(lean - leanAt(t - 0.15)) * 1.6 + 0.6 * (squashAt(t) - squashAt(t - 0.08));
  sprout.rotation.z = (0.022 * Math.sin(t * 1.7 + 0.8) + Math.max(-0.08, Math.min(0.08, trail))) * (1 - 0.6 * low);
  pool.position.x = BLINK_X + dx;
  pool.material.opacity = cl(1 - 2.5 * rise);
  pool.scale.setScalar(1 + rise);

  let bl = 0;
  for (const c of BLINKS) bl = Math.max(bl, blinkAt(t, c));
  blink.face({ blink: bl, happy: f.happy, look: f.look, lookY: f.lookY, think: f.think, phase: t * 1.6, skew: f.skew, eager: f.eager });
  // wider eye travel than the kit gives (look bible: 0.11 and 0.08), still well inside the visor
  eyes.forEach(({ g, base }) => g.position.set(base.x + f.look * 0.11, base.y + f.happy * 0.05 + f.lookY * 0.08 + f.eager * 0.03, base.z));
  // smile or grin from its own channel: one of them at full opacity, except during a 0.1 s crossfade
  const gr = cl(f.grin);
  if (mouths.length === 2) {
    const [smile, grin] = mouths;
    smile.material.opacity = 1 - gr; smile.visible = 1 - gr > 0.01;
    grin.material.opacity = gr; grin.visible = gr > 0.01;
  }
}
