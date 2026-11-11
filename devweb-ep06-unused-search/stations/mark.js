// The Mark: Blink alone. No harness, no belt, no hands (Robin). It acts from its mark: eyes that lead, a body that
// follows them (turn, tilt, lean right only, a small rise), squash and stretch on the hero beats, eased blinks tied to
// gaze shifts, a mouth that crossfades, and the beam from its visor (stations/beam.js) that its own cards condense in.
// It plays to the machine: rides the knob over on a throw, flinches on the thunks and knocks, delights when the lever
// lands on new, looks flat at the dark plate at the end. Every value is a pure function of film time t: keys are walked
// from the start each frame, nothing is carried over. The lever, the knocks, the beam and the card plan are read from
// timeline.js (never copied); the knob's place from machine.knobAt(t).
import * as THREE from "three";
import { makeBlink } from "../kit/blink3d.js";
import { basic } from "../parts.js";
import * as machine from "./machine.js";
import * as beam from "./beam.js";
import { BLINK, BLINKS, CARD_PLAN, FOOT_Y, KNOCKS, LEVER_THROWS, MARKER, T, beamOn, bump, cl, io, mix, r01 } from "../timeline.js";

let pivot, body, blink, pool, sprout, eyes = [], mouths = [];
const VO = globalThis.VO;

// ---------- keys ----------
// K(time, values, eye ease, body ease). Eyes and expression ease over d: 0.1 s is a saccade (look bible: 4-6 frames),
// longer is following something that moves. The body follows 0.05 s later over at least 0.3 s.
// The mouth is its own channel: smile (0) or grin (1), chosen per key and always crossfaded over exactly 0.1 s, so it
// never rests part-way however slowly happy or eager ease.
// onKnob 0..1 hands the gaze to the lever's knob wherever the lever is (machine.knobAt); lid 0..1 is a flat, half-lidded
// look (the sag when the spring takes the lever back, the flat look at the dark plate, the deadpan at the end).
const ZERO = { look: 0, lookY: 0, happy: 0, think: 0, skew: 0, eager: 0, lean: 0, rise: 0, grin: 0, onKnob: 0, lid: 0 };
const K = (t, o = {}, d = 0.1, bd) => {
  const v = { ...ZERO, ...o };
  v.grin = v.happy >= 0.5 || v.eager >= 0.7 ? 1 : 0;
  return { t, v, d, bd: bd ?? Math.max(0.3, d) };
};
const MOUTH_D = 0.1;
// where things are, as eye values from Blink's spot (-1.2, 0.2 at the visor): world-plan-v2 section 11 item 6
const TIP = { onKnob: 1, look: 0.6, lookY: 1.0 }; // the knob (world x -0.36 to 0.56, y about 3.3), wherever the lever has it
const SWITCH = { look: 0.62, lookY: 1.0 }; // the switch housing (0.10, 2.94)
const NEW = { look: 1.0, lookY: 0.85 }; // the meaning (new) plate (1.1, 2.47)
const OLD = { look: 0.25, lookY: 0.8 }; // the keywords (old) plate (-0.86, 2.36)
const TAG = { look: 0.35, lookY: 0.95 }; // the default tag on the spring post (-0.64, 2.97)
const LID = { look: 0.55, lookY: 1.2 }; // the search lid plate (0.08, 3.78)
const SLOT = { look: 0.75, lookY: 0.75, lean: 2 }; // the slot (0.44, 2.08)
const SPOUT = { look: 0.3, lookY: 0.6 }; // the spout mouth (-0.59, 1.54)
const CORE = { look: 1.05, lookY: 1.0 }; // the core (1.24, 3.24)
const COUNTER = { look: -0.2, lookY: 1.3, rise: 0.1 }; // the counter standing on its shelf, up and a little left (-1.14, 4.21)
const BIN = { look: 0.7, lookY: 0.2, lean: 7 }; // the errors bin, down and right at eye level (0.34, 1.38)
const LAMP = { look: 0.4, lookY: 1.3 }; // the bulb on the crown (0.34, 4.66)
const STRIP = (look) => ({ look, lookY: 1.3 }); // the calendar strip above the crown (y 5.2), July left to day 53 right
const FOCUS = { look: 0.55, lookY: 1.15 }; // the beam's focus (-0.33, 1.45, 1.63): up and to the right of the visor
const NOTE = { look: 0.1, lookY: -0.9 }; // the note resting in front of it, under the visor
const QUEUE = { look: 1.0, lookY: 0.5, lean: 3 }; // the line of cards on the trunk, about (1.05, 1.35)
const PROG1 = { look: 0.95, lookY: -0.35 }; // program 1's box on the floor (0.8, -0.63)
// reading one line of the placard (2.08 wide at (0.10, 3.36)): eyes to its start, then along it
const READ = (t0, lookY, dur, o = {}) => [K(t0, { look: 0.3, lookY, ...o }), K(t0 + 0.1, { look: 0.8, lookY, ...o }, dur)];
const c8 = T.h08, c12 = T.h12, ROW_T = 0.36;
// Blink's own cards, from the plan: when each leaves the beam, and when its result arrives back at the focus
const OWN_CARDS = CARD_PLAN.filter((c) => c.from === "blink");
const SENDS = OWN_CARDS.map((c) => c.out);
const GOTS = OWN_CARDS.filter((c) => c.result < T.h27).map((c) => c.result + (c.flight ?? 0.55)); // not the closing line: that one lands flat
const BET = VO.w("bet", 1); // the crooked smile lands on it
const ONE = T.endIn - 0.36; // the last word, "one"
// the lever: the throws Blink plays to (read from timeline.js, never copied)
const TO_NEW = LEVER_THROWS.filter((s) => s[1] === 1), TO_OLD = LEVER_THROWS.filter((s) => s[1] === 0);
const HOOK = TO_NEW[0], FALL = TO_OLD[0], DAY53 = TO_NEW[TO_NEW.length - 1], SNAP = TO_OLD[TO_OLD.length - 1];
const LANDED = DAY53[0] + DAY53[2], DROPPED = FALL[0] + FALL[2], SNAPPED = SNAP[0] + SNAP[2]; // the thunks land 0.02 s after
const HARD = KNOCKS.reduce((a, k) => (k[1] > a[1] ? k : a))[0]; // the 36 seating

const FACE = [
  // the opening starts inside an action: Blink is coming down from a small hop, leaning right, turning to the switch;
  // eyes arrive on the knob by 0.35 s, the landing settles with one rebound by about 0.7 s
  K(0, { look: -0.1, lookY: 0.3, lean: 3 }), K(0.1, TIP, 0.25),
  // the hook: eyes ride the knob over to new with a lift of hope; a glance at the new plate, then the spring takes the
  // lever back and Blink sags, looking at the knob flatly
  K(HOOK[0] - 0.1, { ...TIP, eager: 0.35, rise: 0.06 }),
  K(HOOK[0] + 0.08, { ...TIP, eager: 0.6, happy: 0.35, rise: 0.14, lean: 2 }, 0.35, 0.5),
  K(HOOK[0] + HOOK[2] + 0.25, { ...TIP, eager: 0.5, happy: 0.4, rise: 0.12, lean: 2 }, 0.3),
  K(T.h02, { ...NEW, eager: 0.4, happy: 0.35, rise: 0.1, lean: 2 }), // the new plate, on "it"
  K(FALL[0] + 0.04, { ...TIP, eager: 0.2, rise: 0.06 }, 0.2), // back to the knob as the spring takes it
  K(DROPPED + 0.04, { ...TIP, lid: 1, lean: 0.5 }, 0.15, 0.45), // the thunk: flat
  K(T.h03, { ...LID, rise: 0.1 }), // the lid plate
  K(T.my2 + 0.1, { look: 0.4, lookY: 1.2, rise: 0.1 }), K(T.my2 + 0.2, { look: 0.7, lookY: 1.2, rise: 0.1 }, 0.5), K(T.my2 + 1.1, TIP), // reads "search", then down to the knob
  // hold 04: a plain card rises from program 1 up its rail, in at the slot; the result out of the spout and down home
  K(T.h04 + 0.05, PROG1), K(T.h04 + 0.2, { look: 0.9, lookY: 0.3, lean: 2 }, 0.45), K(T.h04 + 0.75, SLOT, 0.2),
  K(T.h04 + 1.65, SPOUT), K(T.h04 + 1.85, { look: 0.6, lookY: 0.2 }, 0.45), K(T.h04 + 2.35, PROG1, 0.4),
  K(T.july, { ...NEW, rise: 0.06 }),
  K(T.added, { ...NEW, rise: 0.06, eager: 0.25 }, 0.15), // the new setting, a little brighter
  K(T.added + 0.6, { ...CORE, rise: 0.06, eager: 0.3 }, 0.3), // the rings unfolding beside it
  K(T.added + 1.4, { ...TIP, rise: 0.03 }), // the knob still on old
  K(T.added + 2.6, { ...NEW, rise: 0.04, lean: 1 }), // and back to the new one
  // hold 06: the other programs slide in lower right; the eyes climb the trunk as the line fills
  K(T.h06 + 0.15, { look: 1.1, lookY: -0.3, lean: 3 }, 0.3), K(T.h06 + 0.6, { look: 1.05, lookY: 0.1, lean: 4 }, 0.9), K(T.h06 + 1.6, QUEUE, 0.6),
  K(T.h07, { ...TAG, rise: 0.08 }), // the tag
  K(T.old2, { ...OLD, rise: 0.04 }), // the old label
  K(T.dflt, { ...TAG, rise: 0.08, happy: 0.2 }), // back to the tag on default, with a nod
  // hold 08: each card in at the slot, each result out of the spout; a glance at the dark core on the fourth
  K(c8 + 0.1, SLOT), K(c8 + 0.85, SPOUT, 0.2), K(c8 + 1.1, SLOT), K(c8 + 1.85, SPOUT, 0.2), K(c8 + 2.1, SLOT), K(c8 + 2.7, { ...SLOT, lean: 3 }),
  K(c8 + 3.1, { ...CORE, lean: 2 }, 0.2),
  K(T.h09 + 0.2, LAMP), // the lamp
  K(T.nothing2 + 0.08, { ...LAMP, happy: 0.75, rise: 0.05 }, 0.12), // mild pride: nothing broke
  K(T.nothing2 + 0.6, { ...LAMP, happy: 0.55, rise: 0.03 }, 0.5),
  // hold 10: the beam opens from its visor; eyes up to where the card forms, then with it over to the end of the line
  K(SENDS[0] - 0.62, { ...FOCUS, eager: 0.3 }), K(SENDS[0] - 0.32, { ...FOCUS, eager: 0.5, happy: 0.3 }, 0.3),
  K(SENDS[0] + 0.03, { look: 0.75, lookY: 1.0, happy: 0.35 }, 0.25), K(SENDS[0] + 0.33, { look: 1.0, lookY: 0.75, lean: 2, happy: 0.35 }, 0.35), K(SENDS[0] + 0.73, { ...QUEUE, happy: 0.35 }, 0.3),
  // hold 11: watches the placard fall onto its rods, then reads its three lines
  K(T.h11 + 0.3, { look: 0.5, lookY: 1.3, rise: 0.1 }),
  ...READ(T.new1 + 0.1, 1.1, 0.5, { rise: 0.12 }), ...READ(T.listed, 1.03, 0.6, { rise: 0.12 }), ...READ(T.desc, 0.96, 0.55, { rise: 0.1 }),
  // hold 12: unaware contentment; its own card steps down the line and in, then its result back into the beam
  K(c12 - 0.05, { ...SLOT, happy: 0.3 }), K(c12 + 0.35, { look: 0.9, lookY: 0.6, happy: 0.35 }, 0.15), K(c12 + 0.7, { ...SLOT, happy: 0.4, eager: 0.2 }, 0.15),
  K(GOTS[0] - 0.9, { ...SPOUT, happy: 0.35 }), K(GOTS[0] - 0.55, { look: 0.4, lookY: 1.05, happy: 0.45 }, 0.35), K(GOTS[0], { ...FOCUS, happy: 0.6, eager: 0.2 }, 0.1),
  // hold 13: the stream, then the counter, eyes widening as it climbs; a glance at the hammering knob and the take on 36
  K(GOTS[0] + 0.2, { ...COUNTER, eager: 0.3 }, 0.15), K(GOTS[0] + 0.35, { ...COUNTER, eager: 0.6 }, T.one3 - GOTS[0] - 0.95),
  K(T.one3 - 0.36, { ...TIP, lean: 2, eager: 0.5 }), // the lever hammering the old stop
  K(T.one3 - 0.03, { ...COUNTER, lean: 4, eager: 0.95, rise: 0.1 }, 0.07, 0.25), // 36 seats
  K(HARD - 0.02, { ...TIP, lean: 4, eager: 0.95, rise: 0.1 }, 0.06, 0.2), // and the lever slams: a double take
  K(T.one3 + 0.5, { ...COUNTER, lean: 4, eager: 0.75, rise: 0.06 }, 0.4),
  // hold 14: the blink first, still on the counter, then the turn up to the bulb once the eyes have reopened, so the
  // closing eyes and the body tilt never share frames
  K(T.h14, { ...COUNTER, lean: 4, rise: 0.06, eager: 0.3 }), K(T.h14 + 0.22, { ...LAMP, eager: 0.3 }), K(T.h14 + 0.3, LAMP, 0.4),
  // hold 15: peers into the empty bin, down and to the right, a little puzzled
  K(T.h15 + 0.2, { ...BIN, rise: 0.1 }, 0.12, 0.5),
  K(T.uses + 0.4, { ...BIN, lookY: 0.15, rise: 0.1, skew: 0.35 }, 0.25, 0.5),
  // holds 16-17: thinking, then the strip's left end above the crown, and it follows the marker to day 53 (the marker's own ease)
  K(T.h16, { look: 0, lookY: 1.2, think: 0.95 }, 0.15), K(T.changedEnd, STRIP(-0.3)),
  K(MARKER[0], STRIP(-0.3)), K(MARKER[0] + 0.05, { ...STRIP(0.9), lean: 3 }, MARKER[1] - MARKER[0] - 0.05),
  // hold 18: the note drifts in from the right; a glance right catches it, eyes ride it down and in under the face
  // (keys on its path at +0.12, +0.27, +0.6), then read it once it has settled
  K(T.h18, { look: 1.15, lookY: 0.2 }), K(T.h18 + 0.12, { look: 0.95, lookY: 0.1 }, 0.15),
  K(T.h18 + 0.27, { look: 0.4, lookY: -0.6 }, 0.3), K(T.h18 + 0.6, NOTE, 0.35),
  K(T.h18 + 1.2, { look: -0.15, lookY: -0.85 }), K(T.h18 + 1.3, { look: 0.4, lookY: -0.85 }, 0.6),
  K(T.h18 + 2.1, { ...NOTE, happy: 0.15 }, 0.3),
  // day 53: the beam, its card up into the slot, then the knob: eyes ride the throw, delight when it lands, the core
  // lighting, the result out of the spout and back into the beam, a flinch when the spring snaps the lever back
  K(SENDS[1] - 0.62, { ...FOCUS, eager: 0.3 }), K(SENDS[1] - 0.32, { ...FOCUS, eager: 0.5, happy: 0.3 }, 0.3),
  K(SENDS[1] + 0.03, { look: 0.7, lookY: 0.95, eager: 0.4 }, 0.2), K(SENDS[1] + 0.28, { ...SLOT, eager: 0.45 }, 0.3),
  K(DAY53[0] - 0.02, { ...TIP, eager: 0.5 }), K(DAY53[0] + 0.15, { ...TIP, eager: 0.7, lean: 1.5 }, 0.3),
  K(LANDED - 0.02, { ...TIP, happy: 0.95, eager: 0.5, lean: 3 }),
  K(LANDED + 0.3, { ...CORE, happy: 0.9, eager: 0.5, lean: 2 }, 0.2), // the core lights
  K(GOTS[1] - 0.6, { ...SPOUT, happy: 0.6, lean: 1 }, 0.15), K(GOTS[1] - 0.3, { look: 0.45, lookY: 1.05, happy: 0.7 }, 0.3), K(GOTS[1], { ...FOCUS, happy: 0.85, eager: 0.3 }, 0.15),
  K(SNAPPED + 0.04, { ...TIP, happy: 0.55, lid: 0.3 }, 0.12), // the thunk: a look at the knob back on old
  // hold 20: side-eye from the note to the core's rest glow, then the crooked smile on the bet
  K(T.h20, { ...NOTE, skew: 0.8, happy: 0.3 }, 0.15),
  K(T.h20 + 0.85, { look: 0.15, lookY: -0.85, skew: 0.8, happy: 0.2, lean: 2.5 }, 0.15), // shifts its weight on the note
  K(T.but2, { ...CORE, skew: 1, happy: 0.4, lean: 1 }, 0.45), // the core, still lit
  K(T.id, { ...CORE, skew: 1, happy: 0.5, lean: 3 }, 0.2),
  K(BET, { ...CORE, skew: 1, happy: 0.62, lean: 3 }, 0.1), // the crooked smile
  K(T.h21, SWITCH),
  K(T.h21 + 1.3, TIP), K(T.h21 + 2.6, { ...SWITCH, rise: 0.06 }), // the knob, then the switch again, with a nod
  ...READ(T.h22 + 0.2, 1.1, 0.55, { rise: 0.12 }), ...READ(T.list, 1.03, 0.55, { rise: 0.12 }), K(T.dflt2 - 0.2, { ...TAG, rise: 0.08 }),
  K(T.h23, { ...NEW, rise: 0.08, eager: 0.2 }), K(T.new2, { ...NEW, rise: 0.08, eager: 0.35 }, 0.2),
  K(T.h24 + 0.1, { look: 0.05, lookY: 1.1, rise: 0.06 }), K(T.h25 + 0.1, { look: 0.95, lookY: 1.1, rise: 0.06 }),
  K(T.h25 + 0.45, { look: 0.95, lookY: 1.1, rise: 0.06, happy: 0.45 }, 0.15), // its own small face on the note
  K(T.h25 + 1.3, { look: 0.05, lookY: 1.1, rise: 0.06, happy: 0.2 }), // back to the left panel
  K(T.h25 + 2.3, { look: 0.95, lookY: 1.1, rise: 0.06, happy: 0.45, lean: 1.5 }), // and the right one again
  // hold 26: down the log, one row at a time as they type in
  ...[0, 1, 2, 3, 4, 5].map((i) => K(T.h26 + 0.4 + ROW_T * i, { look: 1.0, lookY: 1.1 - 0.11 * i, lean: 3 })),
  // hold 27: the knob, the unused new plate on "a smarter search", then its last card out of the beam, up into the
  // slot, the knock on "still", a flat look at the dark plate, and the look to camera landing on "one", held to the end
  K(T.h27 + 0.1, TIP), K(T.built, { ...NEW, eager: 0.2 }),
  K(SENDS[2] - 0.62, { ...FOCUS, eager: 0.2 }), K(SENDS[2] - 0.32, { ...FOCUS, eager: 0.3 }, 0.3),
  K(SENDS[2] + 0.05, { look: 0.7, lookY: 0.95 }, 0.2), K(SENDS[2] + 0.3, SLOT, 0.3),
  K(T.still - 0.08, TIP), K(T.still + 0.2, { ...NEW, lid: 1 }, 0.2, 0.4), // the knock, then the dark plate, flat
  K(ONE - 0.04, { look: 0, lookY: 0, lid: 0.8 }), K(T.endIn, { look: 0, lookY: 0, lid: 0.8 }, 0.3), // deadpan, to camera
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
// the knob as an eye value: world x -0.36 (old stop) to 0.56 (new stop) from Blink at -1.2 -> look 0.45 to 0.8
const tipLook = (t) => cl(0.45 + 0.38 * (machine.knobAt(t).x + 0.36));

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
const hop0 = (t) => (t >= HOP_LAND ? 0 : 0.14 * (1 - Math.pow((t + 0.12) / (HOP_LAND + 0.12), 2)));
const hop0Stretch = (t) => (t >= HOP_LAND ? 0 : 0.05 * (1 - r01(t, 0.12, HOP_LAND - 0.12)));
// the hop before each send (the test's anticipation): a crouch from 0.78 s before the card leaves, off the floor at
// -0.62, down by -0.32 as the beam's sparks start to gather, so the card forms on the landing
const SEND_HOP = 0.62;
const sendHop = (t) => SENDS.reduce((s, out) => s + 0.1 * bump(t, out - SEND_HOP, 0.3), 0);
// the lift when a result comes back into the beam (the test's "got"): a slow swell, not a pop
const gotAt = (t) => GOTS.reduce((s, at) => s + 0.04 * bump(t, at - 0.05, 1.0), 0);
const SQUASH = [
  [HOP_LAND, 0, -0.09, 0.1], // the landing: squash, one small rebound
  [T.nothing2 + 0.12, 0, 0.045, 0.1], // puffs up a little: nothing broke
  ...SENDS.map((out) => [out - SEND_HOP, 0.07, 0.06, 0.16]), // hero: the crouch and spring before each send
  [T.one3, 0.1, 0.11, 0.15], // hero: the take on 36 of 37
  [LANDED, 0.04, 0.06, 0.1], // delight as the lever lands on new
  [HOOK[0] + 0.1, 0, 0.04, 0.1], // the lift of hope
  [DROPPED + 0.02, 0, -0.05, 0.1], // the sag on the thunk
  [SNAPPED + 0.02, 0, -0.04, 0.08], // the flinch on day 53's snap back
  [ONE - 0.04, 0, 0.02, 0.1], // turns to camera
  // a flinch on every knock of the lever: the plain entries, the stream's hammering, the 36 slam hardest
  ...KNOCKS.map(([k, s]) => [k, 0, s >= 1.6 ? -0.08 : -0.02 * s, 0.08]),
  // weight shifts that carry the quiet holds (no gather, one small rebound)
  [T.my2 + 1.1, 0, 0.022, 0.1], [T.added + 1.4, 0, 0.022, 0.1], [T.added + 2.6, 0, 0.02, 0.1], [T.dflt, 0, 0.03, 0.1],
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
const REACH0 = reach(BLINK.yaw); // at rest, turned a little to the machine: the left edge's zero

export function build(scene, kit) {
  const { ramp, G } = kit;
  pivot = new THREE.Group();
  pivot.position.set(BLINK.x, BLINK.y, BLINK.z);
  body = new THREE.Group();
  body.position.y = 1.08;
  body.rotation.y = BLINK.yaw;
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
  // the beam, parented at the visor: it rides every pose
  beam.build(blink.root, kit);

  // the pool under Blink: small, not a wide haze
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const g = c.getContext("2d"), grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,0.09)"); grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 40), basic("#ffffff", { map: new THREE.CanvasTexture(c) }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(BLINK.x, FOOT_Y - 0.01, BLINK.z + 0.2);
  scene.add(pool);
}

// a deeper idle breath wherever Blink is otherwise still: it eases in 0.5 s after the last key or squash and out 0.3 s
// before the next, so it only shows in gaps of about 1.2 s or more; whole-body squash and stretch about the foot,
// volume kept, starting on an inhale
// the bin tail, "no error message for that": Blink's eyes leave the empty bin and come to the viewer, the body
// straightens out of its peer with a small nod. An overlay on the keyed values, exactly zero outside [44.25, 45.9]:
// it fades out against the hold 16 key's own ease (eyes 0.15 s, body 0.3 s after 0.05 s), so the hand-over is smooth.
const TO_VIEWER = 44.25, VIEWER = { look: -1.1, lookY: -0.4, skew: -0.35, unlean: 4.5, rise: -0.06 }; // offsets from the bin pose (7 deg less 4.5: still leaning right)
function viewerAt(t, body) {
  const t0 = TO_VIEWER + (body ? 0.05 : 0), into = io(r01(t, t0, body ? 0.35 : 0.1));
  const out = 1 - io(r01(t, T.h16 + (body ? 0.05 : 0), body ? 0.3 : 0.15));
  return into * out;
}
const NOD = (t) => (t < TO_VIEWER + 0.05 ? 0 : t < TO_VIEWER + 0.12 ? mix(0, -0.03, io((t - TO_VIEWER - 0.05) / 0.07)) : -0.03 * settle(t - TO_VIEWER - 0.12));
const EVENTS = [...FACE.map((k) => k.t), ...SQUASH.map((q) => q[0]), ...GOTS, TO_VIEWER].sort((a, b) => a - b);
function quiet(t) {
  let prev = 0, next = Infinity;
  for (const e of EVENTS) { if (e <= t) prev = e; else { next = e; break; } }
  return [prev, io(r01(t, prev + 0.5, 0.3)) * (1 - io(r01(t, next - 0.6, 0.3)))];
}
const breathAt = (t) => { const [p, e] = quiet(t); return 0.016 * e * Math.sin((2 * Math.PI * (t - p - 0.5)) / 3.2); };
const leanAt = (t) => keyed(t - 0.05, true).lean + 0.5 * (0.5 + 0.5 * Math.sin(t * 0.9 + 0.4)); // the sway only ever leans right

// Blink's whole pose at t, as numbers (nothing of three in it): the face values, the rig's place, turn, tilt, lean and
// squash, the sprout's swing, the face tip for the beam. update(t) applies it; anything that wants the pose without
// the scene (the camera-set, a probe) can read it here.
export function poseAt(t) {
  const f = keyed(t, false), b = keyed(t - 0.05, true);
  // on the knob: the gaze goes to its tip wherever the lever has it now (and 0.05 s ago, for the body)
  if (f.onKnob > 0) { f.look = mix(f.look, tipLook(t), f.onKnob); f.lookY = mix(f.lookY, TIP.lookY, f.onKnob); }
  if (b.onKnob > 0) { b.look = mix(b.look, tipLook(Math.max(0, t - 0.05)), b.onKnob); b.lookY = mix(b.lookY, TIP.lookY, b.onKnob); }
  const wf = viewerAt(t, false), wb = viewerAt(t, true);
  if (wf > 0) { f.look += VIEWER.look * wf; f.lookY += VIEWER.lookY * wf; f.skew += VIEWER.skew * wf; }
  if (wb > 0) { b.look += VIEWER.look * wb; b.lookY += VIEWER.lookY * wb; b.lean -= VIEWER.unlean * wb; b.rise += VIEWER.rise * wb; }
  const rise = b.rise + hop0(t) + sendHop(t);
  const sy = 1 + 0.0075 * Math.sin((2 * Math.PI * t) / 3.4) + squashAt(t) + hop0Stretch(t) + gotAt(t) + breathAt(t) + NOD(t);
  const sx = 1 / Math.sqrt(sy);
  // the body stands turned a little to the machine and turns and tilts toward what the eyes are on, a beat behind them
  const yaw = BLINK.yaw + 0.1 * b.look, pitch = -0.05 * b.lookY;
  const lean = leanAt(t);
  // anything that widens the body (squash, turn) is paid for by moving right, so the left edge never moves out
  const dx = Math.max(0, 1.03 * (sx * reach(yaw) - REACH0));
  // the sprout trails the body's lean and the squash, with its own slow sway; the breath's sprout a beat behind it
  const trail = THREE.MathUtils.degToRad(lean - leanAt(t - 0.15)) * 1.6 + 0.6 * (squashAt(t) - squashAt(t - 0.08));
  const [qp, qe] = quiet(t), sway = 0.05 * qe * Math.sin((2 * Math.PI * (t - qp - 0.95)) / 3.2);
  const sproutZ = 0.022 * Math.sin(t * 1.7 + 0.8) + Math.max(-0.08, Math.min(0.08, trail)) + sway;
  let bl = 0;
  for (const c of BLINKS) bl = Math.max(bl, blinkAt(t, c));
  bl = Math.max(bl, 0.4 * f.lid);
  return { f, rise, sx, sy, yaw, pitch, lean, dx, sproutZ, blink: bl, tip: -0.12 * beamOn(t) };
}

export function update(t) {
  const p = poseAt(t), f = p.f;
  pivot.position.set(BLINK.x + p.dx, BLINK.y + p.rise, BLINK.z);
  pivot.rotation.set(p.pitch, 0, -THREE.MathUtils.degToRad(p.lean));
  pivot.scale.set(p.sx, p.sy, p.sx);
  body.rotation.set(0, p.yaw, 0);
  blink.root.rotation.set(p.tip, 0, 0); // the face tips up while the beam is on
  sprout.rotation.z = p.sproutZ;
  pool.position.set(BLINK.x + p.dx, FOOT_Y - 0.01, BLINK.z + 0.2);
  pool.material.opacity = cl(1 - 2.5 * p.rise);
  pool.scale.setScalar(1 + p.rise);

  blink.face({ blink: p.blink, happy: f.happy, look: f.look, lookY: f.lookY, think: f.think, phase: t * 1.6, skew: f.skew, eager: f.eager });
  // wider eye travel than the kit gives (look bible: 0.11 and 0.08), still well inside the visor
  eyes.forEach(({ g, base }) => g.position.set(base.x + f.look * 0.11, base.y + f.happy * 0.05 + f.lookY * 0.08 + f.eager * 0.03, base.z));
  // smile or grin from its own channel: one of them at full opacity, except during a 0.1 s crossfade
  const gr = cl(f.grin);
  if (mouths.length === 2) {
    const [smile, grin] = mouths;
    smile.material.opacity = 1 - gr; smile.visible = 1 - gr > 0.01;
    grin.material.opacity = gr; grin.visible = gr > 0.01;
  }
  // the beam last, on the pose just set: cards.js reads its focus after this
  beam.update(t);
}
