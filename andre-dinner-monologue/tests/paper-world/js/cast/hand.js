// The two hands, built from one 21-joint skeleton (wrist; thumb CMC, MCP, IP, tip; four fingers MCP, PIP, DIP, tip)
// and skinned as paper: tapered capsules for the finger segments, a rounded hull for the palm, a thenar bulge,
// small fillets for the webbing. Unit = palm length (wrist crease to the middle finger's MCP) = 1.
import { DEG, sdCapsule, sdPolygon, sdCircle, smin, outlineOf, loopsOf, spline, stroke, xf, rot, fillet } from "./shape2d.js";
import { papers, card, hinge } from "./card.js";

export const HAND = {
  wristW: 0.65, knuckleW: 0.85, seg: [0.45, 0.30, 0.25], tipTaper: 0.8, web: 0.07,
  fingers: {
    index: { mcp: [-0.30, 1.00], len: 0.82, w: 0.19, fan: -8 },
    middle: { mcp: [-0.07, 1.04], len: 0.90, w: 0.20, fan: 0 },
    ring: { mcp: [0.15, 0.99], len: 0.84, w: 0.185, fan: 7 },
    little: { mcp: [0.34, 0.88], len: 0.66, w: 0.165, fan: 16 },
  },
  thumb: { cmc: [-0.36, 0.22], seg: [0.42, 0.34, 0.28], w: 0.24, out: 50, bend: [0, -9, 6], r: [0.12, 0.11, 0.096, 0.088] },
};
const F = ["index", "middle", "ring", "little"], CUM = [0, 0.45, 0.75, 1];

// The open hand's 21 joints, flat, seen from above the palm: x across (thumb at -x), y from the wrist crease to the fingers.
export function handSkeleton(o = {}) {
  const p = { fan: 1, thumbOut: HAND.thumb.out, thumbBend: HAND.thumb.bend, ...o }, J = { wrist: [0, 0] };
  for (const f of F) {
    const d = HAND.fingers[f], a = d.fan * p.fan * DEG;
    J[f] = CUM.map((c) => [d.mcp[0] + Math.sin(a) * c * d.len, d.mcp[1] + Math.cos(a) * c * d.len]);   // mcp, pip, dip, tip
  }
  let a = p.thumbOut, pos = HAND.thumb.cmc.slice(); J.thumb = [pos.slice()];
  HAND.thumb.seg.forEach((len, i) => { a += p.thumbBend[i]; pos = [pos[0] - Math.sin(a * DEG) * len, pos[1] + Math.cos(a * DEG) * len]; J.thumb.push(pos.slice()); });   // cmc, mcp, ip, tip
  return J;
}

// capsules along a joint chain; the last one stops a radius short so the round tip lands on the tip joint
function capsules(pts, radii) {
  const caps = [];
  for (let k = 0; k < pts.length - 1; k++) {
    let b = pts[k + 1];
    if (k === pts.length - 2) { const dx = b[0] - pts[k][0], dy = b[1] - pts[k][1], l = Math.hypot(dx, dy); b = [b[0] - dx / l * radii[k + 1], b[1] - dy / l * radii[k + 1]]; }
    caps.push([pts[k][0], pts[k][1], b[0], b[1], radii[k], radii[k + 1]]);
  }
  return caps;
}
const dChain = (caps, x, y) => { let d = 1e9; for (const c of caps) d = Math.min(d, sdCapsule(x, y, c[0], c[1], c[2], c[3], c[4], c[5])); return d; };
const boxOf = (pts, pad) => { let b = [1e9, 1e9, -1e9, -1e9]; for (const p of pts) b = [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])]; return [b[0] - pad, b[1] - pad, b[2] + pad, b[3] + pad]; };

// ---------------------------------------------------------------- the open hand, flat
// the thenar fold: the thumb and its pad lift along a line from the thumb-index web to the wrist's thumb corner
const FOLD = { a: [-0.335, 0.0], b: [-0.45, 0.76] };
const CUFF_CUT = -0.62;

function openModel(o = {}) {
  const J = handSkeleton(o), fr = (f, c) => HAND.fingers[f].w / 2 * (1 - (1 - HAND.tipTaper) * c);
  const caps = {}, dir = {};
  for (const f of F) { caps[f] = capsules(J[f], CUM.map((c) => fr(f, c))); const a = HAND.fingers[f].fan * (o.fan ?? 1) * DEG; dir[f] = [Math.sin(a), Math.cos(a)]; }
  const tcaps = capsules(J.thumb, HAND.thumb.r);
  const tdir = [1, 2].map((k) => { const dx = J.thumb[k + 1][0] - J.thumb[k][0], dy = J.thumb[k + 1][1] - J.thumb[k][1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; });
  const hullP = [[-0.24, -0.06], [0.24, -0.06], [0.318, 0.16], [0.352, 0.44], J.little[0], J.ring[0], J.middle[0], J.index[0], [-0.31, 0.60]];
  const web = o.web ?? HAND.web;
  const hand = (x, y) => {
    let d = sdPolygon(x, y, hullP) - 0.085;
    d = Math.min(d, sdCapsule(x, y, 0, 0.1, 0, -1.4, 0.325, 0.335));                 // wrist and forearm
    d = smin(d, sdCircle(x, y, -0.265, 0.355, 0.235), 0.10);                          // thenar bulge at the thumb's base
    d = smin(d, dChain(tcaps, x, y), 0.17);                                           // thumb, with a wide web to the index
    for (const f of F) d = smin(d, dChain(caps[f], x, y), web);                       // fingers, with small fillets
    return d;
  };
  const fl = Math.hypot(FOLD.b[0] - FOLD.a[0], FOLD.b[1] - FOLD.a[1]), fd = [(FOLD.b[0] - FOLD.a[0]) / fl, (FOLD.b[1] - FOLD.a[1]) / fl], fn = [-fd[1], fd[0]];
  const thumbUnit = (x, y) => Math.max(-((x - FOLD.a[0]) * fn[0] + (y - FOLD.a[1]) * fn[1]), -y);         // negative on the thumb's side of the fold
  const beyond = (j, d, x, y) => (x - j[0]) * d[0] + (y - j[1]) * d[1];                                    // > 0 past a joint
  const G = o.crease ?? 0.0075, OV = 0.004;                                                                 // a hairline at every finger joint (the finger's own creases); hidden seams overlap a hair
  const lane = (f, x, y) => { const di = dChain(caps[f], x, y); let m = -1e9; for (const g of F) if (g !== f) m = Math.max(m, (di - dChain(caps[g], x, y)) / 2); return m - OV; };
  const fingerAll = (f, x, y, off = 0) => Math.max(lane(f, x, y), -beyond(J[f][0], dir[f], x, y) + off, -thumbUnit(x, y));
  const build = () => {
  const pieces = { fingers: {}, thumb: [] }, cell = o.cell ?? 0.006;
  for (const f of F) {
    pieces.fingers[f] = [0, 1, 2].map((k) => outlineOf((x, y) => Math.max(hand(x, y), fingerAll(f, x, y), -beyond(J[f][k], dir[f], x, y) + G / 2, k < 2 ? beyond(J[f][k + 1], dir[f], x, y) + G / 2 : -1e9),
      boxOf([J[f][k], J[f][k + 1]], 0.2), cell));
  }
  const tb = (k, x, y) => beyond(J.thumb[k], tdir[k - 1], x, y), tu = (x, y) => thumbUnit(x, y) - OV;
  pieces.thumb = [
    outlineOf((x, y) => Math.max(hand(x, y), tu(x, y), tb(1, x, y) + G / 2), boxOf([J.thumb[0], J.thumb[1], FOLD.a, FOLD.b], 0.25), cell),
    outlineOf((x, y) => Math.max(hand(x, y), tu(x, y), -tb(1, x, y) + G / 2, tb(2, x, y) + G / 2), boxOf([J.thumb[1], J.thumb[2]], 0.22), cell),
    outlineOf((x, y) => Math.max(hand(x, y), tu(x, y), -tb(2, x, y) + G / 2), boxOf([J.thumb[2], J.thumb[3]], 0.22), cell),
  ];
  pieces.palm = outlineOf((x, y) => { let d = Math.max(hand(x, y), -thumbUnit(x, y), CUFF_CUT - y); for (const f of F) d = Math.max(d, -fingerAll(f, x, y, -G / 2 - OV)); return d; }, [-0.6, CUFF_CUT - 0.1, 0.62, 1.3], cell);
  // the palm's creases, fine cuts: heart line, head line, life line
  const cut = (pts, w = 0.02) => stroke(spline(pts, false, 10), (t) => 0.005 + w * Math.pow(Math.sin(Math.PI * t), 0.6));
  pieces.creases = [
    cut([[0.335, 0.60], [0.20, 0.685], [0.02, 0.745], [-0.12, 0.835]]),
    cut([[-0.345, 0.635], [-0.17, 0.585], [0.03, 0.49], [0.20, 0.375]]),
    cut([[-0.36, 0.585], [-0.225, 0.455], [-0.135, 0.26], [-0.12, 0.07]], 0.017),
  ];
  return pieces;
  };
  let made = null;
  return { J, hand, get pieces() { return made || (made = build()); }, dir, tdir, fold: { a: FOLD.a, d: fd, n: fn } };
}
const cache = new Map();
const memo = (key, make) => { if (!cache.has(key)) cache.set(key, make()); return cache.get(key); };
const openCached = (o = {}) => memo("open" + JSON.stringify(o), () => openModel(o));

// ---------------------------------------------------------------- the hand in side profile (the pinch, and the figures' small hands)
// u = toward the palm side (the way the fingers flex), v = from the wrist to the fingers. Flex angles in degrees at MCP, PIP, DIP.
// yaw turns the view from a pure side view (0) toward the back of the hand (90): at about 30 the knuckles of the curled
// fingers show as steps behind one another, which is how the pinch is drawn. The picture's axes are (h, v).
export const PROFILE = {
  mcpU: -0.03, thick: 0.95, thumbCmc: [0.21, 0.20], thumbX: -0.06, thumbR: [0.13, 0.12, 0.108, 0.096],
  poses: {
    pinch: { index: [34, 50, 34], middle: [80, 98, 62], ring: [84, 100, 64], little: [88, 102, 66], thumb: "solve", splay: 0, yaw: 31, gap: 0.004 },
  },
};
export function profileSkeleton(pose = "pinch", o = {}) {
  const P = { ...(typeof pose === "string" ? PROFILE.poses[pose] : pose), ...o }, J = { wrist: [0, 0], radii: {} }, TH = P.thick ?? PROFILE.thick, CMC = P.thumbCmc ?? PROFILE.thumbCmc;
  const cy = Math.cos(P.yaw * DEG), sy = Math.sin(P.yaw * DEG), x0 = HAND.fingers.index.mcp[0];
  const proj = (x, u, v) => [u * cy - x * sy, v];                                    // x = across the hand from the index (+ toward the little finger)
  J.proj = proj; J.yaw = P.yaw;
  const flat = {};                                                                    // the chains in the (u, v) plane, before the view turns
  F.forEach((f) => {
    const d = HAND.fingers[f], xr = d.mcp[0] - x0; let a = 0, pos = [PROFILE.mcpU, d.mcp[1]]; flat[f] = [pos.slice()];
    HAND.seg.forEach((frac, k) => { a += P[f][k]; pos = [pos[0] + Math.sin(a * DEG) * frac * d.len, pos[1] + Math.cos(a * DEG) * frac * d.len]; flat[f].push(pos.slice()); });
    J[f] = flat[f].map(([u, v]) => proj(xr, u, v));
    J.radii[f] = CUM.map((c) => TH * d.w / 2 * (1 - (1 - HAND.tipTaper) * c));
  });
  const cs = Math.cos(P.splay * DEG), ss = Math.sin(P.splay * DEG);
  const thumbAt = (phi, f2, f3) => { let a = phi, pos = [PROFILE.thumbX, ...CMC]; const t = [pos.slice()]; [0, f2, f3].forEach((fl, k) => { a -= fl; const L = HAND.thumb.seg[k]; pos = [pos[0] - ss * L, pos[1] + cs * Math.sin(a * DEG) * L, pos[2] + cs * Math.cos(a * DEG) * L]; t.push(pos.slice()); }); return t; };
  let T;
  if (P.thumb === "solve") {
    // the pads meet: put the thumb's tip pad against the inner side of the index's tip pad (solved in the hand's own plane)
    const ix = flat.index, ri = J.radii.index[3], rt = PROFILE.thumbR[3];
    let dx = ix[3][0] - ix[2][0], dy = ix[3][1] - ix[2][1]; const l = Math.hypot(dx, dy); dx /= l; dy /= l;
    const ci = [ix[3][0] - dx * ri, ix[3][1] - dy * ri], nIn = [dy, -dx];
    const tgt = [ci[0] + nIn[0] * (ri + rt + P.gap) + dx * 0.012, ci[1] + nIn[1] * (ri + rt + P.gap) + dy * 0.012];
    let bc = 1e9;
    for (let phi = 0; phi <= 100; phi += 0.5) for (let fl = -10; fl <= 55; fl += 0.5) {
      const t = thumbAt(phi, fl, fl * 0.9), ex = t[3][1] - t[2][1], ey = t[3][2] - t[2][2], el = Math.hypot(ex, ey), c = [t[3][1] - ex / el * rt, t[3][2] - ey / el * rt];
      const cost = (c[0] - tgt[0]) ** 2 + (c[1] - tgt[1]) ** 2 + 4e-6 * (fl - 16) ** 2; if (cost < bc) { bc = cost; T = t; }
    }
    J.pinch = proj(0, (ci[0] + tgt[0]) / 2, (ci[1] + tgt[1]) / 2);
  } else { T = thumbAt(P.thumb[0], P.thumb[1], P.thumb[2]); J.pinch = J.index[3]; }
  J.thumb = T.map(([x, u, v]) => proj(x, u, v));
  // the mass of the hand as the view sees it: wrist, back of the hand, the row of knuckles, the thenar pad
  const pts3 = [[0.60, -0.11, -0.12], [-0.02, -0.11, -0.12], [-0.02, 0.11, -0.12], [-0.05, 0.215, 0.27], [-0.03, 0.19, 0.50], [0, 0.05, 0.93], [0.62, -0.09, 0.45]];
  F.forEach((f) => pts3.push([HAND.fingers[f].mcp[0] - x0, PROFILE.mcpU, HAND.fingers[f].mcp[1]]));
  J.mass = hull(pts3.map(([x, u, v]) => proj(x, u, v)));
  J.wristC = proj(0.29, 0, 0)[0]; J.wristR = 0.115 * cy + 0.31 * sy;
  return J;
}
// convex hull (monotone chain)
function hull(pts) {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function profileModel(pose = "pinch", o = {}) {
  const J = profileSkeleton(pose, o), caps = {}, cell = o.cell ?? 0.006;
  for (const f of F) caps[f] = capsules(J[f], J.radii[f]);
  const tcaps = capsules(J.thumb, PROFILE.thumbR), web = [J.thumb[0], J.thumb[1], [J.index[0][0] + 0.05, J.index[0][1] - 0.02]];
  const fields = {
    palm: (x, y) => {
      let d = sdPolygon(x, y, J.mass) - 0.05;
      d = smin(d, sdPolygon(x, y, web) - 0.03, 0.06);                                              // the web of skin between thumb and index
      d = Math.min(d, sdCapsule(x, y, J.wristC, 0.0, J.wristC, -1.3, J.wristR, J.wristR * 1.06));  // wrist
      return d;
    },
    thumb: (x, y) => smin(dChain(tcaps, x, y), sdCircle(x, y, J.thumb[0][0] - 0.02, J.thumb[0][1] + 0.03, 0.13), 0.1),
  };
  for (const f of F) fields[f] = (x, y) => smin(dChain(caps[f], x, y), sdCircle(x, y, J[f][0][0], J[f][0][1], J.radii[f][0] + 0.014), 0.03);
  const box = { palm: [-1.0, -1.4, 0.6, 1.3], thumb: boxOf(J.thumb, 0.3) }; for (const f of F) box[f] = boxOf(J[f], 0.22);
  const pieces = {}; for (const k of Object.keys(fields)) pieces[k] = outlineOf(fields[k], box[k], cell);
  const all = (x, y) => { let d = 1e9; for (const k of Object.keys(fields)) d = Math.min(d, fields[k](x, y)); return d; };
  return { J, pieces, all };
}
const profileCached = (pose, o = {}) => memo("profile" + JSON.stringify([pose, o]), () => profileModel(pose, o));

// ---------------------------------------------------------------- 2D outlines on their own
// handOutline("open")    -> the open hand from above the palm, wrist crease at (0, 0), fingers toward +y, thumb at -x
// handOutline("pinch")   -> the pinch in side profile, wrist at (0, 0), fingers toward +v, palm side at +u
// handOutline("open", { fan: 0.3, thumbOut: 24 }) -> the same hand with the fingers closed up (the figures' small hands)
// Returns the outer outline as an array of [x, y]. handLoops(pose) also returns the holes (the gap inside the pinch).
export function handOutline(pose = "open", o = {}) { return handLoops(pose, o)[0]; }
export function handLoops(pose = "open", o = {}) {
  return memo("loops" + JSON.stringify([pose, o]), () => {
    if (pose === "open") { const m = openCached(o); return loopsOf((x, y) => Math.max(m.hand(x, y), -1.0 - y), [-1.45, -1.1, 0.75, 2.1], o.cell ?? 0.006); }
    const m = profileCached(pose, o); return loopsOf((x, y) => Math.max(m.all(x, y), -0.9 - y), [-1.0, -1.0, 1.1, 1.75], 0.006);
  });
}
// the separate pieces, for a rig that wants to joint the hand itself
export const handPieces = (pose = "open", o = {}) => (pose === "open" ? openCached(o).pieces : profileCached(pose, o).pieces);

// ---------------------------------------------------------------- three.js builders
// The receiving hand: palm up, lying on the ground (y = 0), wrist crease at the origin, fingers toward -z, thumb toward -x.
// opts: scale (cm per palm length, 10), thickness (cm, 0.12), colour, cuff, sleeve, grain (cm per texture repeat), side "left" | "right".
export function makeHandOpen(THREE, paper, opts = {}) {
  const p = { scale: 10, thickness: 0.12, colour: "#35366f", cuff: "#f2b38a", sleeve: "#1f2755", grain: 4, side: "left", creases: true, ...opts };
  const M = papers(paper), m = openCached(), t = p.thickness / p.scale, uvScale = p.scale / p.grain, base = { thickness: t, uvScale, colour: p.colour };
  const g = new THREE.Group(), rig = new THREE.Group(); g.name = "handOpen"; g.add(rig);
  rig.rotation.x = -Math.PI / 2; rig.position.y = p.thickness / 2; rig.scale.set(p.side === "right" ? -p.scale : p.scale, p.scale, p.scale);
  const palm = card(THREE, M, m.pieces.palm, { ...base, holes: p.creases ? m.pieces.creases : [], name: "palm" }); rig.add(palm);
  if (p.creases) for (const c of m.pieces.creases) {                       // a pale liner under each cut, so the cut shows the paper core on any ground
    const cx = c.reduce((s, q) => s + q[0], 0) / c.length, cy = c.reduce((s, q) => s + q[1], 0) / c.length;
    rig.add(card(THREE, M, c.map((q) => [cx + (q[0] - cx) * 1.25 + Math.sign(q[0] - cx) * 0.004, cy + (q[1] - cy) * 1.25 + Math.sign(q[1] - cy) * 0.004]), { thickness: t * 0.3, uvScale, colour: "#f6ecd6", edge: "#f6ecd6", z: -t * 0.34, name: "crease" }));
  }
  // cuff over the wrist, sleeve over the cuff, running off toward the camera
  const cuff = fillet([[-0.44, -0.17, 0.03], [0.44, -0.17, 0.03], [0.47, -0.60, 0.03], [-0.47, -0.60, 0.03]]);
  const sleeve = fillet([[-0.56, -0.47, 0.03], [0.56, -0.47, 0.03], [0.70, -4.6, 0.02], [-0.70, -4.6, 0.02]]);
  rig.add(card(THREE, M, cuff, { ...base, colour: p.cuff, z: t * 1.02, name: "cuff" }));
  rig.add(card(THREE, M, sleeve, { ...base, colour: p.sleeve, z: t * 2.04, name: "sleeve" }));
  const H = { fingers: {}, thumb: [] };
  for (const f of F) {
    const d = m.dir[f], ax = [d[1], -d[0]]; let parent = rig; H.fingers[f] = [];
    for (let k = 0; k < 3; k++) { const h = hinge(THREE, parent, m.J[f][k], ax); h.inner.add(card(THREE, M, m.pieces.fingers[f][k], { ...base, name: f + k })); H.fingers[f].push(h); parent = h.inner; }
  }
  // the thumb: thenar fold, then MCP, then IP. Axes chosen so a positive angle lifts the tip off the ground.
  const lift = (pivot, axis, probe) => { const r = [probe[0] - pivot[0], probe[1] - pivot[1]]; return axis[0] * r[1] - axis[1] * r[0] > 0 ? axis : [-axis[0], -axis[1]]; };
  let parent = rig;
  [[m.fold.a, m.fold.d, m.J.thumb[1]], [m.J.thumb[1], [m.tdir[0][1], -m.tdir[0][0]], m.J.thumb[2]], [m.J.thumb[2], [m.tdir[1][1], -m.tdir[1][0]], m.J.thumb[3]]].forEach(([pv, ax, probe], k) => {
    const h = hinge(THREE, parent, pv, lift(pv, ax, probe)); h.inner.add(card(THREE, M, m.pieces.thumb[k], { ...base, name: "thumb" + k })); H.thumb.push(h); parent = h.inner;
  });
  // where the seed lies: the hollow of the palm
  const palmAnchor = new THREE.Group(); palmAnchor.position.set(-0.02, 0.50, t / 2); rig.add(palmAnchor);
  g.cast = { hinges: H, palmAnchor, params: p };
  g.userData = { cast: "handOpen", scale: p.scale, palmCentre: [-0.02 * p.scale * (p.side === "right" ? -1 : 1), p.thickness, -0.50 * p.scale] };   // palmCentre: where a seed lies, in the group's own cm
  g.group = g; g.pose = poseHandOpen; poseHandOpen(g, { curl: 0 });
  return g;
}
// curl: 0 flat on the ground, 1 cupped (about 35 degrees a joint), the fingers and thumb bending up in real 3D.
// fingers: optional [index, middle, ring, little] curls, thumb: optional thumb curl; both default to curl.
export function poseHandOpen(g, { curl = 0, fingers, thumb } = {}) {
  const H = g.cast.hinges, per = [0.92, 1.0, 1.04, 1.1], joint = [35, 35, 35];
  F.forEach((f, i) => { const c = (fingers ? fingers[i] : curl) * per[i]; H.fingers[f].forEach((h, k) => h.set(c * joint[k] * DEG)); });
  const tc = thumb ?? curl; [30, 26, 32].forEach((a, k) => H.thumb[k].set(tc * a * DEG));
  return g;
}

// The giving hand: a standing card in side profile, thumb and index tips together, the other three fingers curled and
// stepped behind, seen a little from the back of the hand so the knuckles show. The origin is the pinch point (where the
// seed is held), the card faces +z, the hand reaches down from the upper right and the sleeve runs up out of frame.
// opts: scale (cm per palm length, 10), thickness (cm, 0.12), colour, cuff, sleeve, grain, lean (degrees the hand is turned in
// its plane: -55 reaches down from the upper right, palm down), facing (1 | -1 mirrors it to come from the upper left),
// pose (overrides for PROFILE.poses.pinch, for example { index: [38, 46, 32], yaw: 36 }).
export function makeHandPinch(THREE, paper, opts = {}) {
  const p = { scale: 10, thickness: 0.12, colour: "#7e3b2f", cuff: "#f2b38a", sleeve: "#5f8350", grain: 4, lean: -55, facing: 1, pose: null, ...opts };
  const M = papers(paper), m = profileCached("pinch", p.pose || {}), t = p.thickness / p.scale, uvScale = p.scale / p.grain, pitch = t * 1.3, base = { thickness: t, uvScale, colour: p.colour };
  const g = new THREE.Group(), rig = new THREE.Group(); g.name = "handPinch"; g.add(rig); rig.scale.set(p.scale * p.facing, p.scale, p.scale);
  const map = ([u, v]) => rot([u - m.J.pinch[0], -(v - m.J.pinch[1])], p.lean * DEG), mapAll = (pts) => pts.map(map);
  const layer = { little: -3, ring: -2, middle: -1, palm: 0, index: 1, thumb: 2 };
  for (const k of ["little", "ring", "middle", "palm"]) rig.add(card(THREE, M, mapAll(m.pieces[k]), { ...base, z: layer[k] * pitch, name: k }));
  const H = {};
  for (const [k, pv, tip] of [["index", m.J.index[0], m.J.index[3]], ["thumb", m.J.thumb[0], m.J.thumb[3]]]) {
    const h = hinge(THREE, rig, [...map(pv), layer[k] * pitch], [0, 0, 1]); h.inner.add(card(THREE, M, mapAll(m.pieces[k]), { ...base, z: layer[k] * pitch, name: k }));
    H[k] = h; h.pv = map(pv); h.tip = map(tip); h.mid = map(m.J[k][2]);
  }
  // which way opens: the turn that takes each tip away from the other
  const away = (h, other) => { const r = [h.tip[0] - h.pv[0], h.tip[1] - h.pv[1]], q = rot(r, 0.05), a = [h.pv[0] + q[0], h.pv[1] + q[1]]; return Math.hypot(a[0] - other.mid[0], a[1] - other.mid[1]) > Math.hypot(h.tip[0] - other.mid[0], h.tip[1] - other.mid[1]) ? 1 : -1; };
  H.index.sign = away(H.index, H.thumb); H.thumb.sign = away(H.thumb, H.index);
  const wc = m.J.wristC, wr = m.J.wristR;
  const cuff = fillet([[wc - wr - 0.075, -0.13, 0.03], [wc + wr + 0.075, -0.13, 0.03], [wc + wr + 0.095, -0.50, 0.03], [wc - wr - 0.095, -0.50, 0.03]]);
  const sleeve = fillet([[wc - wr - 0.16, -0.40, 0.03], [wc + wr + 0.16, -0.40, 0.03], [wc + wr + 0.32, -5.2, 0.02], [wc - wr - 0.32, -5.2, 0.02]]);
  rig.add(card(THREE, M, mapAll(cuff), { ...base, colour: p.cuff, z: pitch, name: "cuff" }));
  rig.add(card(THREE, M, mapAll(sleeve), { ...base, colour: p.sleeve, z: 2 * pitch, name: "sleeve" }));
  const seedAnchor = new THREE.Group(); seedAnchor.position.set(0, 0, 1.5 * pitch); rig.add(seedAnchor);
  g.cast = { hinges: H, seedAnchor, params: p };                      // seedAnchor: a group at the pinch point, in palm units (scale a seed by 1 / scale)
  g.userData = { cast: "handPinch", scale: p.scale };
  g.group = g; g.pose = poseHandPinch; poseHandPinch(g, { open: 0 });
  return g;
}
// open: 0 holds the seed, 1 lets it go (the index lifts, the thumb drops away).
export function poseHandPinch(g, { open = 0 } = {}) {
  const H = g.cast.hinges; H.index.set(H.index.sign * open * 14 * DEG); H.thumb.set(H.thumb.sign * open * 7 * DEG);
  return g;
}
