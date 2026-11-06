// The camera, measured without a browser: every key projected to 1080x1920 pixels in node, the same way three.js does it
// (the kit's cameraPath: io between keys plus its slow drift, lookAt with y up, vertical fov). check-graybox.mjs asserts
// on what this returns; `node camera-check.mjs --table` prints the 0.1 s table (subject, Blink's visor and body,
// each overlay on screen) and `--moves` prints one row per move.
//
// Framing rules (DP final, replacing "Blink always whole in frame"):
//  1. the visor is never sliced by the left, right or bottom edge at rest: whole, foreground (below the bottom edge with
//     the head top in frame) or out. A slice only while the camera sweeps past it, under SLICE_MAX s.
//  2. the visor whole in shot for at least 75 % of the film, no absence over 6 s.
//  3. Blink whole (body, sprout and visor, small margin) on its acting beats.
//  4. no overlay phrase over the visor, the dial face, the counter, a label, the tag, the plate or any lit station.
//  5. the subject is 40 px clear of every frame edge, and above the lockup (y 1774), whenever it is resting as subject.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const W = 1080, H = 1920, LOCKUP = 1774, EDGE = 40;
export const MOVE_PX = 1.5; // px per 60 fps frame: the look bible's "camera move" class (hold < 0.225, drift between)
export const CLEAR = 20; // px an overlay phrase keeps from anything it must not cross
export const BORDER = 12; // px a long prop edge keeps from a frame edge, inside or out
export const SLICE_MAX = 0.6; // s a visor slice may last while the camera sweeps past it

// ---------- maths ----------
const cl = (x) => Math.max(0, Math.min(1, x));
const io = (x) => { x = cl(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const mix = (a, b, k) => a + (b - a) * k;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// the kit's cameraPath, as numbers (kit/world.js imports three, so it can't load here)
export function cameraAt(KEYS, t) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const [t0, p0, g0, f0] = KEYS[i], [t1, p1, g1, f1] = KEYS[i + 1];
  const k = io((t - t0) / Math.max(0.001, t1 - t0));
  const pos = [0, 1, 2].map((a) => mix(p0[a], p1[a], k)), tgt = [0, 1, 2].map((a) => mix(g0[a], g1[a], k));
  pos[0] += 0.06 * Math.sin(t * 0.7); pos[1] += 0.04 * Math.sin(t * 0.53 + 1.3);
  const fwd = norm(sub(tgt, pos)), right = norm(cross(fwd, [0, 1, 0])), up = cross(right, fwd);
  return { pos, fwd, right, up, f: H / 2 / Math.tan(((mix(f0, f1, k) / 2) * Math.PI) / 180), seg: i };
}
export function project(c, p) {
  const d = sub(p, c.pos), z = dot(d, c.fwd);
  return [W / 2 + (c.f * dot(d, c.right)) / z, H / 2 - (c.f * dot(d, c.up)) / z, z];
}
// a world box [x0, x1, y0, y1, z] (or a list of them) to a screen box { l, r, t, b }
export function screenBox(c, boxes) {
  if (typeof boxes[0] === "number") boxes = [boxes];
  let l = 1e9, r = -1e9, t = 1e9, b = -1e9;
  for (const [x0, x1, y0, y1, z] of boxes) for (const x of [x0, x1]) for (const y of [y0, y1]) {
    const [sx, sy] = project(c, [x, y, z]);
    l = Math.min(l, sx); r = Math.max(r, sx); t = Math.min(t, sy); b = Math.max(b, sy);
  }
  return { l, r, t, b, w: r - l, h: b - t, cx: (l + r) / 2, cy: (t + b) / 2 };
}
const inside = (bx, m = 0, bottom = H) => bx.l >= m && bx.r <= W - m && bx.t >= m && bx.b <= bottom - m;
const overlaps = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
const fmt = (b) => `${b.l.toFixed(0)},${b.t.toFixed(0)} ${b.w.toFixed(0)}x${b.h.toFixed(0)}`;

// ---------- the set, in world units (from timeline.js and the stations; Blink's body half-width = 1) ----------
const BLINK_SPROUT_X = -0.86;
export const BOX = {
  dial: [-0.45, 0.75, 2.6, 3.8, -1.47],
  tag: [-0.62, -0.04, 2.62, 2.95, -1.38],
  oldLbl: [-0.97, 0.03, 2.28, 2.44, -1.48],
  newLbl: [0.27, 1.27, 2.28, 2.44, -1.48],
  plate: [-0.85, 1.15, 3.92, 4.34, -1.45],
  lid: [-1.07, 1.37, 4.38, 4.71, -1.47], // the lid band: its top edge and the `search` stencil (1.6 x 0.26 at y 4.54)
  crate: [-1.07, 1.37, 1.55, 4.71, -1.5],
  slot: [1.0, 1.5, 3.4, 3.7, -1.5],
  queue: [0.98, 1.94, 1.88, 3.72, -1.1],
  chuteL: [-0.97, 0.03, 1.5, 2.44, -1.4],
  chuteR: [0.27, 1.27, 1.5, 2.44, -1.4],
  lamp: [1.6, 2.2, 4.22, 4.66, -1.8],
  counter: [1.26, 2.21, 2.99, 3.61, -1.1],
  tray: [1.4, 2.1, 2.34, 2.76, -1.1],
  strip: [-1.5, 1.8, 1.96, 2.18, -1.0],
  note: [-1.23, -0.27, -0.56, -0.2, 1.15],
  panels: [-1.94, 1.94, 2.55, 4.05, -0.9],
  log: [0.45, 1.95, 1.95, 4.25, -0.8],
  visor: [-1.66, -0.06, -0.14, 0.94, 0.75],
  body: [-1.89, 0.17, -0.88, 1.28, 0],
  sprout: [-1.2, -0.52, 1.28, 1.84, 0],
  head: [-1.6, -0.12, 1.0, 1.28, 0.3],
  mouth: [-0.76, -0.12, -0.76, -0.4, 1.02],
};
const B = BOX;
// what a key can name as its subject: a box or a list of boxes
export const SUBJECTS = {
  dial: [B.dial, B.tag],
  needle: [B.dial],
  labels: [B.dial, B.oldLbl, B.newLbl],
  crate: [B.crate],
  set: [B.crate, B.body, B.sprout],
  queue: [B.slot, B.queue],
  feed: [B.dial, B.slot, B.queue, B.chuteL],
  chuteL: [B.chuteL, B.dial],
  tag: [B.tag, B.dial],
  lamp: [B.lamp, B.dial],
  blink: [B.body, B.sprout],
  blinkcard: [B.body, B.sprout, B.queue],
  plate: [B.plate, B.dial],
  counter: [B.counter],
  stream: [B.counter, B.chuteL],
  tray: [B.tray],
  strip: [B.strip],
  note: [B.body, B.sprout, B.note],
  turn: [B.dial, B.chuteR, B.newLbl],
  newchute: [B.chuteR, B.newLbl, B.dial],
  tip: [B.plate, B.tag],
  panels: [B.panels],
  log: [B.log],
  end: [B.body, B.sprout, B.dial],
  bet: [B.body, B.sprout, B.plate],
};

// ---------- prop edges on a frame edge ----------
// the props with long straight borders, and when they are on screen
export function edgeHits(c, t, T, counterAlpha, band = BORDER) {
  const EDGED = [["crate", B.crate, true], ["plate", B.plate, t >= T.new1 - 0.6], ["strip", B.strip, t >= T.h16 + 1.2 && t <= T.h20 - 0.15],
    ["counter", B.counter, counterAlpha(t) > 0.5], ["tray", B.tray, t >= T.h15 + 0.4 && t <= T.h16], ["panels", B.panels, t >= T.h24 + 0.6 && t <= T.h26],
    ["log", B.log, t >= T.h26 + 0.4 && t <= T.h27], ["lamp", B.lamp, true]];
  const out = [];
  for (const [name, box, on] of EDGED) {
    if (!on) continue;
    const sb = screenBox(c, box), vy = Math.min(H, sb.b) - Math.max(0, sb.t), vx = Math.min(W, sb.r) - Math.max(0, sb.l);
    if (vy >= 100) { if (Math.abs(sb.l) < band) out.push(`${name} left`); if (Math.abs(sb.r - W) < band) out.push(`${name} right`); }
    if (vx >= 100) { if (Math.abs(sb.t) < band) out.push(`${name} top`); if (Math.abs(sb.b - H) < band) out.push(`${name} bottom`); }
  }
  return out;
}

// ---------- the report ----------
export async function cameraReport(root, KEYS, VO) {
  const TL = await import(pathToFileURL(join(root, "timeline.js")).href);
  const { T, counterAlpha } = TL;
  globalThis.window = globalThis;
  new Function(readFileSync(join(root, "overlays.js"), "utf8"))();
  const OV = window.OVERLAYS(VO.w);
  const END = VO.END, dt = 1 / 60;
  const subjAt = (c) => KEYS[c.seg + 1][5];

  // what each overlay must stay off, and when those things are on screen
  const on = (a, b) => (t) => t >= a && t <= b;
  const PROTECT = [
    ["visor", B.visor, () => true], ["Blink", [B.body, B.sprout], () => true], ["dial face", B.dial, () => true], ["lid and its stencil", B.lid, () => true], ["tag", B.tag, () => true],
    ["keywords label", B.oldLbl, () => true], ["meaning label", B.newLbl, () => true],
    ["plate", B.plate, on(T.new1 - 0.6, END)], ["counter", B.counter, (t) => counterAlpha(t) > 0.05],
    ["lamp", B.lamp, () => true], ["tray", B.tray, on(T.h15, T.h16 + 0.5)], ["strip", B.strip, on(T.h16 + 0.2, T.h20 + 0.45)],
    ["panels", B.panels, on(T.h24, T.h26 + 0.4)], ["log", B.log, on(T.h26, T.h27 + 0.4)], ["note", B.note, on(T.h18 + 0.9, T.h21 + 0.5)],
  ];
  // the fixed overlay phrases: width from IBM Plex Sans Bold advances (as check-graybox), caps height 0.74 of size
  const ADV = { A: 640, B: 650, C: 630, D: 680, E: 580, F: 560, G: 680, H: 700, I: 360, J: 540, K: 650, L: 540, M: 830, N: 700, O: 700, P: 620, Q: 700, R: 640, S: 600, T: 590, U: 680, V: 630, W: 930, X: 640, Y: 610, Z: 590, " ": 250, ",": 280 };
  const textW = (s, size) => [...s].reduce((a, ch) => a + (ADV[ch] ?? 600), 0) * size * 0.001 - s.length * size * 0.02;
  const ovBoxes = OV.flatMap(({ lines, at, gone }) => lines.map(([s, x, base, size]) => {
    const hw = textW(s, size) / 2 + 12;
    const box = { l: x - hw, r: x + hw, t: base - 0.74 * size - CLEAR, b: base + 0.05 * size + CLEAR }; // CLEAR px kept from anything protected
    return { s, at, gone, box: { ...box, w: box.r - box.l, h: box.b - box.t } };
  }));

  // reference points spread over the set, for the camera's own speed (median screen shift of those in frame)
  const REF = [];
  for (const x of [-1.8, -0.9, 0, 0.9, 1.8]) for (const y of [-0.6, 0.6, 1.8, 3.0, 4.2]) REF.push([x, y, y < 1.3 ? 0.4 : -1.3]);
  const speedAt = (t) => {
    const a = cameraAt(KEYS, t - dt), b = cameraAt(KEYS, t);
    const d = [];
    for (const p of REF) {
      const pa = project(a, p), pb = project(b, p);
      if (pb[2] > 0.5 && pb[0] > 0 && pb[0] < W && pb[1] > 0 && pb[1] < H) d.push(Math.hypot(pb[0] - pa[0], pb[1] - pa[1]));
    }
    d.sort((x, y) => x - y);
    return d.length ? d[Math.floor(d.length / 2)] : 0;
  };

  const frames = [];
  for (let n = 0, t = 0; t <= END + 1e-9; n++, t = n * dt) {
    const c = cameraAt(KEYS, t), v = speedAt(t);
    const visor = screenBox(c, B.visor), body = screenBox(c, [B.body, B.sprout]), head = screenBox(c, B.head);
    const vstate = inside(visor) ? "in" : visor.r < 0 || visor.l > W || visor.b < 0 ? "out" : visor.t >= H ? (head.t < H - 10 && head.r > 0 && head.l < W ? "fg" : "out") : "sliced";
    frames.push({ t, c, v, visor, vstate, body, subj: subjAt(c) });
  }
  const N = frames.length;
  const moving = frames.filter((f) => f.v >= MOVE_PX).length, drift = frames.filter((f) => f.v >= 0.225 && f.v < MOVE_PX).length;

  // longest stretch with the camera below the move class (drift or hold)
  let longestStill = 0, run = 0;
  for (const f of frames) { run = f.v < MOVE_PX ? run + 1 : 0; longestStill = Math.max(longestStill, run); }
  let longestHold = 0; run = 0;
  for (const f of frames) { run = f.v < 0.225 ? run + 1 : 0; longestHold = Math.max(longestHold, run); }

  // moves: one per key segment whose pose changes. Subject travel = its centre's shift; zoom = its width ratio.
  const moves = [];
  for (let i = 0; i + 1 < KEYS.length; i++) {
    const [t0, p0, g0, f0] = KEYS[i], [t1, p1, g1, f1] = KEYS[i + 1];
    const d = Math.hypot(...sub(p0, p1)) + Math.hypot(...sub(g0, g1)) + Math.abs(f0 - f1) * 0.05;
    if (d < 1e-6) continue;
    const a = Math.max(0, t0), b = Math.min(END, t1), subj = KEYS[i + 1][5];
    const ca = cameraAt(KEYS, a), cb = cameraAt(KEYS, b);
    const sa = screenBox(ca, SUBJECTS[subj]), sb = screenBox(cb, SUBJECTS[subj]);
    const shift = Math.hypot(sb.cx - sa.cx, sb.cy - sa.cy), zoom = sb.w / sa.w - 1;
    const fr = frames.filter((f) => f.t > a && f.t <= b), mv = fr.filter((f) => f.v >= MOVE_PX).length;
    const peak = Math.max(0, ...fr.map((f) => f.v));
    moves.push({ i, a, b, subj, shift, zoom, travel: Math.hypot(shift, zoom * 1101), frames: Math.round((b - a) * 60), moving: mv, peak, kind: mv >= 20 ? "move" : "creep" });
  }

  // rule 1: visor slices
  const slices = [];
  let s0 = null;
  frames.forEach((f, n) => {
    if (f.vstate === "sliced" && s0 === null) s0 = n;
    if ((f.vstate !== "sliced" || n === N - 1) && s0 !== null) {
      const fr = frames.slice(s0, n), slow = fr.filter((g) => g.v < MOVE_PX).length;
      slices.push({ a: frames[s0].t, b: f.t, slow, edge: sliceEdge(fr[Math.floor(fr.length / 2)].visor) });
      s0 = null;
    }
  });
  const rule1 = slices.filter((s) => s.b - s.a > SLICE_MAX || s.slow > 6).map((s) => `${s.a.toFixed(2)}-${s.b.toFixed(2)} ${s.edge}, ${s.slow} slow f`);

  // rule 2: visor whole in shot
  const inShot = frames.filter((f) => f.vstate === "in").length / N;
  let gap = 0, gapMax = 0, gapAt = 0;
  frames.forEach((f) => { gap = f.vstate === "in" ? 0 : gap + dt; if (gap > gapMax) { gapMax = gap; gapAt = f.t; } });

  // rule 3: Blink whole on its acting beats
  const BEATS = [[26.2, 29.0], [48.8, 52.3], [54.9, 58.0], [75.5, END]];
  const rule3 = [];
  for (const [a, b] of BEATS) {
    const bad = frames.filter((f) => f.t >= a && f.t <= b && !inside(f.body, 8, LOCKUP));
    if (bad.length) rule3.push(`${a}-${b}: ${bad.length} frames, first ${bad[0].t.toFixed(2)} body ${fmt(bad[0].body)}`);
  }

  // rule 4: overlays off the protected things, and never straddling the crate's or Blink's border (a phrase sits wholly
  // on dark field or wholly on one plain surface)
  const STRADDLE = [["crate", B.crate, () => true], ["Blink", [B.body, B.sprout], () => true]];
  const rule4 = [];
  for (const o of ovBoxes) {
    const hits = new Map();
    const text = { l: o.box.l + CLEAR, r: o.box.r - CLEAR, t: o.box.t + CLEAR, b: o.box.b - CLEAR };
    for (const f of frames) {
      if (f.t < o.at || f.t > o.gone - 0.05) continue;
      for (const [name, box, when] of PROTECT) if (when(f.t) && overlaps(o.box, screenBox(f.c, box))) if (!hits.has(name)) hits.set(name, f.t);
      for (const [name, box] of STRADDLE) {
        const sb = screenBox(f.c, box), within = text.l >= sb.l && text.r <= sb.r && text.t >= sb.t && text.b <= sb.b;
        if (overlaps(text, sb) && !within && !hits.has(name + "'s border")) hits.set(name + "'s border", f.t);
      }
    }
    for (const [name, t] of hits) rule4.push(`"${o.s}" over the ${name} from ${t.toFixed(2)}`);
  }

  // border: no prop edge running 100 px or more along a frame edge sits within BORDER px of it, inside or outside, for
  // 7 or more 60 fps frames, 3 or more at 30 fps (a move sweeps an edge across the band in fewer; forensics flags the
  // ones that sit)
  const border = [], borderRuns = {};
  for (const f of frames) for (const k of edgeHits(f.c, f.t, T, counterAlpha)) (borderRuns[k] ||= []).push(f.t);
  for (const [k, ts] of Object.entries(borderRuns)) {
    let a = ts[0], prev = ts[0];
    for (const t of ts.slice(1).concat([1e9])) { if (t - prev > 0.05) { if (prev - a >= 6 / 60 - 1e-9) border.push(`${k} ${a.toFixed(2)}-${prev.toFixed(2)}`); a = t; } prev = t; }
  }

  // the strip's right end (the `day 53` box and its label, x 1.45-1.8) is wholly in by 40 px or wholly out, never sliced,
  // whenever the camera is slower than 4 px/f
  const D53 = [1.45, 1.8, 1.96, 2.18, -1.0], stripEnd = [];
  for (const f of frames) {
    if (f.t < T.h16 + 1.2 || f.t > T.h20 - 0.15) continue;
    if (f.v >= 4) continue; // a move sweeping the end past the edge is not a slice that sits; at rest and slow drift only
    const s = screenBox(f.c, D53);
    if (s.r > W - EDGE && s.l < W + EDGE && s.r - s.l > 0) stripEnd.push(f.t);
  }
  const stripCut = [];
  if (stripEnd.length) { let a = stripEnd[0], prev = a; for (const t of stripEnd.slice(1).concat([1e9])) { if (t - prev > 0.05) { if (prev - a >= 5 / 60 - 1e-9) stripCut.push(`${a.toFixed(2)}-${prev.toFixed(2)}`); a = t; } prev = t; } }

  // composition at rest (creep segments): a prop subject's centre sits between 30 % and 60 % of the frame height, and
  // the frame's width is not mostly empty. Empty width = 1 - (length of the union of the x-spans of everything on screen:
  // the crate, Blink, the counter, tray, strip, note, panels, log and lamp while each is on and inside the frame
  // vertically) / 1080, at most 0.55.
  const NOT_PROP = new Set(["blink", "blinkcard", "set", "note", "end", "bet"]);
  const restSeg = new Set(moves.filter((m) => m.kind === "creep").map((m) => m.i));
  KEYS.forEach((k, i) => { if (i < KEYS.length - 1 && !moves.some((m) => m.i === i)) restSeg.add(i); });
  const SCENE = [[B.crate, () => true], [[B.body, B.sprout], () => true], [B.counter, (t) => counterAlpha(t) > 0.3], [B.tray, on(T.h15 + 0.3, T.h16)],
    [B.strip, on(T.h16 + 0.6, T.h20 - 0.15)], [B.note, on(T.h18 + 1.1, T.h21 + 0.5)], [B.panels, on(T.h24 + 0.3, T.h26)], [B.log, on(T.h26 + 0.3, T.h27)], [B.lamp, () => true]];
  const centreBad = {}, emptyBad = {};
  let emptyMax = 0, emptyAt = 0;
  for (const f of frames) {
    if (!restSeg.has(f.c.seg) || f.t < 0.5) continue;
    const key = `K${f.c.seg + 2} ${f.subj}`;
    if (!NOT_PROP.has(f.subj)) {
      const s = screenBox(f.c, SUBJECTS[f.subj]);
      if ((s.cy < 0.3 * H || s.cy > 0.6 * H) && !centreBad[key]) centreBad[key] = `${f.t.toFixed(2)} y ${s.cy.toFixed(0)}`;
    }
    const spans = [];
    for (const [box, when] of SCENE) { if (!when(f.t)) continue; const s = screenBox(f.c, box); if (s.b < 0 || s.t > H || s.r < 0 || s.l > W) continue; spans.push([Math.max(0, s.l), Math.min(W, s.r)]); }
    spans.sort((a, b) => a[0] - b[0]);
    let cov = 0, end = -1;
    for (const [a, b] of spans) { if (b <= end) continue; cov += b - Math.max(a, end); end = b; }
    const empty = 1 - cov / W;
    if (empty > emptyMax) { emptyMax = empty; emptyAt = f.t; }
    if (empty > 0.55 && !emptyBad[key]) emptyBad[key] = `${f.t.toFixed(2)} ${(100 * empty).toFixed(0)} % empty`;
  }
  const ruleCentre = Object.entries(centreBad).map(([k, v]) => `${k}: ${v}`), ruleEmpty = Object.entries(emptyBad).map(([k, v]) => `${k}: ${v}`);

  // rule 5: the subject clear of the edges and the lockup once the camera has arrived on it (creep segments, and the
  // last frame of each move)
  const rule5 = [];
  const worst5 = {};
  const creepSeg = new Set(moves.filter((m) => m.kind === "creep").map((m) => m.i));
  KEYS.forEach((k, i) => { if (i < KEYS.length - 1 && !moves.some((m) => m.i === i)) creepSeg.add(i); });
  for (const f of frames) {
    const seg = f.c.seg, last = Math.abs(f.t - KEYS[seg + 1][0]) < dt / 2;
    if (!creepSeg.has(seg) && !last) continue;
    const s = screenBox(f.c, SUBJECTS[f.subj]);
    if (!inside(s, EDGE, LOCKUP + EDGE)) { const k = `${f.subj}@K${seg + 2}`; if (!worst5[k]) worst5[k] = `${f.t.toFixed(2)} ${fmt(s)}`; }
  }
  for (const [k, v] of Object.entries(worst5)) rule5.push(`${k}: ${v}`);

  // the note on Blink's front stays above the bottom chrome (y 1700) on 54.9-58.0 and whenever the camera rests on Blink
  const noteOn = (t) => t >= T.h18 + 1.1 && t <= T.h21 + 0.5;
  const ruleNote = [];
  let noteLow = -1e9, noteAt = 0;
  for (const f of frames) {
    if (!noteOn(f.t)) continue;
    const rest = creepSeg.has(f.c.seg) && ["blink", "note", "end", "bet"].includes(f.subj);
    if (!(rest || (f.t >= 54.9 && f.t <= 58.0))) continue;
    const nb = screenBox(f.c, B.note).b;
    if (nb > noteLow) { noteLow = nb; noteAt = f.t; }
    if (nb > 1700 && !ruleNote.length) ruleNote.push(`${f.t.toFixed(2)}: note bottom ${nb.toFixed(0)}`);
  }
  // overlay phrases and their distance to the frame edges
  const ovEdge = Math.min(...ovBoxes.map((o) => Math.min(o.box.l + CLEAR, W - o.box.r + CLEAR, o.box.t + CLEAR, LOCKUP - o.box.b + CLEAR)));

  // the calendar strip's bottom edge clears the top of Blink's sprout (world y 1.84) while the strip is out
  let sproutGap = 1e9, sproutAt = 0;
  for (const f of frames) {
    if (f.t < T.h16 + 0.2 || f.t > T.h20 + 0.45) continue;
    const g = project(f.c, [BLINK_SPROUT_X, 1.84, 0])[1] - screenBox(f.c, B.strip).b;
    if (g < sproutGap) { sproutGap = g; sproutAt = f.t; }
  }

  return { stripCut, ruleCentre, ruleEmpty, emptyMax, emptyAt, border, ruleNote, noteLow, noteAt, ovEdge, sproutGap, sproutAt, frames, N, moving: moving / N, drift: drift / N, longestStill, longestHold, moves, slices, rule1, inShot, gapMax, gapAt, rule3, rule4, rule5, ovBoxes, PROTECT };
}
function sliceEdge(v) { return v.l < 0 ? "left" : v.r > W ? "right" : v.b > H ? "bottom" : "top"; }

// ---------- command line ----------
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = dirname(fileURLToPath(import.meta.url));
  const d = JSON.parse(readFileSync(join(root, "vo/words.json"), "utf8"));
  const find = (word, n = 1) => d.words.filter((x) => x[0] === word.toLowerCase())[n - 1];
  globalThis.VO = { END: d.end, w: (word, n) => find(word, n)[1], e: (word, n) => find(word, n)[2] };
  const { T } = await import(pathToFileURL(join(root, "timeline.js")).href);
  const src = readFileSync(join(root, "world.js"), "utf8");
  const block = src.slice(src.indexOf("// KEYS-BEGIN"), src.indexOf("// KEYS-END")).replace("// KEYS-BEGIN", "").replace("export const KEYS =", "return ").replace(/;\s*$/, "");
  const KEYS = new Function("w", "VO", "T", block)(VO.w, VO, T);
  const R = await cameraReport(root, KEYS, VO);
  if (process.argv.includes("--table")) {
    console.log("t      subject   subject box         visor (state)             body                speed  overlay");
    for (let n = 0; n < R.N; n += 6) {
      const f = R.frames[n], s = screenBox(f.c, SUBJECTS[f.subj]);
      const ov = R.ovBoxes.filter((o) => f.t >= o.at && f.t <= o.gone).map((o) => `${o.s} ${fmt(o.box)}`).join("; ");
      console.log(`${f.t.toFixed(1).padStart(5)}  ${f.subj.padEnd(9)} ${fmt(s).padEnd(19)} ${(fmt(f.visor) + " " + f.vstate).padEnd(25)} ${fmt(f.body).padEnd(19)} ${f.v.toFixed(1).padStart(5)}  ${ov}`);
    }
  }
  if (process.argv.includes("--moves")) for (const m of R.moves) console.log(`K${m.i + 1}->K${m.i + 2} ${m.a.toFixed(2)}-${m.b.toFixed(2)} ${m.subj.padEnd(9)} shift ${m.shift.toFixed(0).padStart(4)} zoom ${(100 * m.zoom).toFixed(0).padStart(4)}% travel ${m.travel.toFixed(0).padStart(4)} ${m.frames} f, moving ${m.moving} f, peak ${m.peak.toFixed(1)} ${m.kind}`);
  console.log(`camera moving ${(100 * R.moving).toFixed(1)} %, drifting ${(100 * R.drift).toFixed(1)} %; longest below move ${(R.longestStill / 60).toFixed(2)} s, longest hold ${(R.longestHold / 60).toFixed(2)} s`);
  console.log(`visor whole in shot ${(100 * R.inShot).toFixed(1)} %, longest absence ${R.gapMax.toFixed(2)} s (ends ${R.gapAt.toFixed(2)})`);
  console.log(`visor slices: ${R.slices.map((s) => `${s.a.toFixed(2)}-${s.b.toFixed(2)} ${s.edge}${s.slow ? ` (${s.slow} slow f)` : ""}`).join(", ") || "none"}`);
  console.log(`note bottom at most ${R.noteLow.toFixed(0)} (at ${R.noteAt.toFixed(2)}); overlays at least ${R.ovEdge.toFixed(0)} px from an edge or the lockup`);
  console.log(`strip clears the sprout by ${R.sproutGap.toFixed(0)} px (worst at ${R.sproutAt.toFixed(2)})`);
  console.log(`widest empty frame at rest ${(100 * R.emptyMax).toFixed(0)} % (at ${R.emptyAt.toFixed(2)})`);
  for (const [name, list] of [["strip end", R.stripCut], ["subject centre", R.ruleCentre], ["empty width", R.ruleEmpty], ["border", R.border], ["note", R.ruleNote], ["rule 1", R.rule1], ["rule 3", R.rule3], ["rule 4", R.rule4], ["rule 5", R.rule5]]) console.log(`${name}: ${list.length ? list.join(" | ") : "ok"}`);
}
