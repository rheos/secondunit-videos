// The prison officer and the citizen: one jointed paper puppet in profile, in one paper colour.
// Head units (H): chin to top of skull = 1, the figure is 7.5 H to the top of the skull, facing +x, feet on y = 0.
import { DEG, fillet, xf, sdCircle, sdCapsule, sdPolygon, loopsOf, stroke, coreOf } from "./shape2d.js";
import { papers, card } from "./card.js";
import { headOutline, capOutline, badgeOutline, CAP, HEAD } from "./outlines-guard.js";
import { handOutline } from "./hand.js";
export { headOutline, capOutline, badgeOutline, CAP, HEAD };

export const BODY = {
  heads: 7.5, hip: [-0.06, 3.86], thigh: 1.82, shin: 1.72, ankle: 0.32, ball: [0.745, -0.32], heel: [-0.25, -0.32],
  shoulder: [-0.07, 6.02], upper: 1.36, fore: 1.12, chin: [-0.02, 6.50], neck: [-0.12, 6.52],
  belt: [4.54, 4.585], keys: [0.36, 4.52], baton: [-0.43, 4.50], stride: 4.4,
};

// every part's outline, in H, each about its own pivot (the pivot is the origin). For a rig that wants the raw shapes.
export function guardParts() {
  const P = {};
  P.head = headOutline(); P.headCapped = headOutline({ capped: true }); P.cap = capOutline(); P.badge = badgeOutline();
  P.capSlit = stroke([[-0.385, 0.712], [-0.1, 0.712], [0.2, 0.712], [0.345, 0.712]], () => 0.016);       // the seam between band and crown, a fine cut
  // guard: jacket from the squared shoulders to the belt, then the skirt of the jacket to the hip; the belt is the gap
  P.jacket = fillet([[-0.34, 6.66, 0.02], [-0.375, 6.47, 0.03], [-0.405, 6.39, 0.02],
    [-0.445, 6.385, 0.01], [-0.452, 6.455, 0.018], [-0.628, 6.40, 0.024], [-0.64, 6.325, 0.012],          // the epaulette on the shoulder
    [-0.665, 6.31, 0.035], [-0.675, 5.70, 0.45], [-0.535, 4.80, 0.35], [-0.555, 4.585, 0.015],            // squared shoulder, back, small of the back
    [0.39, 4.585, 0.015], [0.44, 5.05, 0.35], [0.635, 5.68, 0.3], [0.50, 6.325, 0.07],                    // chest out, squared in front too
    [0.22, 6.385, 0.03], [0.16, 6.49, 0.03], [0.095, 6.66, 0.02]]);
  P.skirt = fillet([[-0.56, 4.54, 0.015], [-0.69, 3.74, 0.05], [0.455, 3.68, 0.05], [0.395, 4.54, 0.015]]);
  // citizen: the same body in a plain shirt, soft shoulders, no belt
  P.shirt = fillet([[-0.34, 6.66, 0.02], [-0.375, 6.43, 0.06], [-0.585, 6.25, 0.14], [-0.655, 5.70, 0.45], [-0.545, 4.78, 0.4], [-0.63, 3.80, 0.06],
    [0.43, 3.76, 0.06], [0.40, 4.70, 0.4], [0.57, 5.62, 0.35], [0.47, 6.13, 0.25], [0.20, 6.37, 0.08], [0.095, 6.66, 0.02]]);
  P.pocket = stroke([[0.17, 5.74], [0.30, 5.732], [0.43, 5.715]], () => 0.02);                              // a cut for the breast pocket
  P.upper = fillet([[-0.215, 0.13, 0.2], [0.215, 0.13, 0.2], [0.205, -0.45, 0.3], [0.158, -1.48, 0.15], [-0.158, -1.48, 0.15], [-0.215, -0.45, 0.3]]);
  P.fore = fillet([[-0.158, 0.13, 0.15], [0.158, 0.13, 0.15], [0.155, -0.35, 0.3], [0.118, -1.03, 0.02], [0.137, -1.05, 0.012], [0.137, -1.15, 0.02],
    [-0.137, -1.15, 0.02], [-0.137, -1.05, 0.012], [-0.118, -1.03, 0.02], [-0.16, -0.35, 0.3]]);
  // the hand: the 21-joint hand with the fingers closed up, seen on its back, wrist at the origin, fingers down, thumb in front
  P.hand = xf(handOutline("open", { fan: 0.1, thumbOut: 21, cell: 0.012 }).filter((q) => q[1] > -0.45), { sx: -0.37, sy: -0.37 });
  P.thigh = fillet([[-0.40, 0.25, 0.3], [0.36, 0.25, 0.3], [0.365, -0.4, 0.5], [0.225, -1.98, 0.2], [-0.225, -1.98, 0.2], [-0.425, -0.45, 0.5]]);
  P.shin = fillet([[-0.225, 0.16, 0.2], [0.22, 0.16, 0.2], [0.205, -0.5, 0.4], [0.172, -1.50, 0.025], [-0.192, -1.50, 0.025], [-0.28, -0.62, 0.35]]);   // calf at the back, hem above the ankle
  P.boot = fillet([[-0.135, 0.42, 0.02], [0.135, 0.42, 0.02], [0.14, 0.03, 0.10], [0.46, -0.115, 0.14], [0.73, -0.165, 0.09], [0.765, -0.32, 0.05],
    [0.17, -0.32, 0.012], [0.135, -0.262, 0.02], [0.0, -0.262, 0.02], [-0.025, -0.32, 0.012], [-0.255, -0.32, 0.02], [-0.278, -0.10, 0.07], [-0.15, 0.08, 0.1]]);   // a heel, an arch, a toe cap
  // the baton: hangs from the belt by its grip
  P.baton = fillet([[-0.05, 0.16, 0.045], [0.05, 0.16, 0.045], [0.05, -0.12, 0.01], [0.085, -0.13, 0.012], [0.085, -0.175, 0.012], [0.046, -0.185, 0.01],
    [0.05, -1.16, 0.048], [-0.05, -1.16, 0.048], [-0.046, -0.185, 0.01], [-0.085, -0.175, 0.012], [-0.085, -0.13, 0.012], [-0.05, -0.12, 0.01]]);
  // the key ring: a clip, a ring you can see through, two keys with their bits
  const key = (x, y, cx, cy, a) => {
    const c = Math.cos(a), s = Math.sin(a), lx = (x - cx) * c + (y - cy) * s, ly = -(x - cx) * s + (y - cy) * c;       // key frame: bow at the origin, shaft toward -y
    let d = Math.abs(Math.hypot(lx, ly) - 0.045) - 0.023;
    d = Math.min(d, sdCapsule(lx, ly, 0, -0.06, 0, -0.36, 0.021, 0.019));
    d = Math.min(d, sdPolygon(lx, ly, [[0, -0.36], [0.075, -0.36], [0.075, -0.315], [0, -0.315]]), sdPolygon(lx, ly, [[0, -0.29], [0.058, -0.29], [0.058, -0.255], [0, -0.255]]));
    return d;
  };
  const keysField = (x, y) => {
    let d = sdCapsule(x, y, 0, 0.03, 0.06, -0.13, 0.03, 0.026);
    d = Math.min(d, Math.abs(Math.hypot(x - 0.09, y + 0.25) - 0.108) - 0.022);
    d = Math.min(d, key(x, y, 0.045, -0.385, 16 * DEG), key(x, y, 0.15, -0.375, -13 * DEG));
    return d;
  };
  P.keys = loopsOf(keysField, [-0.2, -0.85, 0.42, 0.1], 0.004, 0.0006);       // [outer, ...holes]
  return P;
}
let PARTS = null;

// two-bone leg: the angles (from straight down, + forward) that put the ankle on a target
function legIK(hip, ankle, L1, L2) {
  let vx = ankle[0] - hip[0], vy = ankle[1] - hip[1], d = Math.hypot(vx, vy); const max = (L1 + L2) * 0.9985;
  if (d > max) { vx *= max / d; vy *= max / d; d = max; }
  const base = Math.atan2(vx, -vy), al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))), thigh = base + al;
  const kx = hip[0] + L1 * Math.sin(thigh), ky = hip[1] - L1 * Math.cos(thigh);
  return { thigh, shin: Math.atan2(hip[0] + vx - kx, -(hip[1] + vy - ky)) };
}
const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const R = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
// one leg of the walk at cycle position u (0 = heel strike): the foot is planted for 60 % of the cycle and travels
// back under the hip at exactly the body's speed, so a body moved `stride` per cycle never slides.
function walkLeg(u, S) {
  u = ((u % 1) + 1) % 1; const B = BODY, A = B.ankle;
  const stance = (v) => {
    const x = S * (0.3 - v); let pitch = 0, ankle = [x, A];
    if (v < 0.08) { pitch = 14 * DEG * (1 - sstep(0, 0.08, v)); const h = R(B.heel, pitch); ankle = [x + B.heel[0] - h[0], -h[1]]; }
    else if (v > 0.38) { pitch = -30 * DEG * sstep(0.38, 0.6, v); const b = R(B.ball, pitch); ankle = [x + B.ball[0] - b[0], -b[1]]; }
    return { ankle, pitch };
  };
  if (u <= 0.6) return stance(u);
  const s = (u - 0.6) / 0.4, a = stance(0.6), b = stance(0), e = sstep(0, 1, s), b2 = [b.ankle[0] + S, b.ankle[1]];    // b is one stride on, in the hip's moving frame it is at b.x
  const pitch = s < 0.5 ? a.pitch + (-10 * DEG - a.pitch) * sstep(0, 0.5, s) : -10 * DEG + (b.pitch + 10 * DEG) * sstep(0.5, 1, s);
  return { ankle: [a.ankle[0] + (b.ankle[0] - a.ankle[0]) * e, a.ankle[1] + (b.ankle[1] - a.ankle[1]) * e + 0.30 * Math.pow(Math.sin(Math.PI * s), 1.3)], pitch };
}

// makeGuard(THREE, paper, opts) -> THREE.Group (also has .group and .pose, so `const { group, pose } = makeGuard(...)` works)
// opts: height (cm to the top of the skull, 4), thickness (cm, 0.08), colour (the face seen at turn 0), back (the other face;
// a citizen turns into a guard by showing it), badge (gold), role "guard" | "citizen" (what is seen at turn 0), grain (cm).
export function makeGuard(THREE, paper, opts = {}) {
  const p = { height: 4, thickness: 0.08, colour: "#1f2755", back: null, badge: "#f1b23a", role: "guard", grain: 4, edge: 0.32, ...opts };
  PARTS = PARTS || guardParts();
  const P = PARTS, M = papers(paper), s = p.height / BODY.heads, t = p.thickness / s, pitch = t * 1.14, e = t * 0.06, B = BODY;
  const base = { thickness: t, uvScale: s / p.grain, colour: p.colour, back: p.back || p.colour, edge: coreOf(p.colour, p.edge) };
  const g = new THREE.Group(), turner = new THREE.Group(), rig = new THREE.Group(); g.name = "guard"; g.add(turner); turner.add(rig); rig.scale.setScalar(s);
  const piv = (parent, x, y, z = 0) => { const n = new THREE.Group(); n.position.set(x, y, z); parent.add(n); return n; };
  const add = (parent, outline, o = {}) => { const m = card(THREE, M, outline, { ...base, ...o }); parent.add(m); return m; };
  const body = piv(rig, B.hip[0], B.hip[1]), torso = piv(body, -B.hip[0], -B.hip[1]);       // the body turns about the hip; torso holds standing coordinates
  const N = { body, turner, rig };
  N.jacket = add(torso, P.jacket, { holes: [P.pocket] }); N.skirt = add(torso, P.skirt);
  N.shirt = add(torso, P.shirt, { holes: [P.pocket] });
  // head, on the neck
  N.head = piv(torso, B.neck[0], B.neck[1], 3 * e); const hl = [B.chin[0] - B.neck[0], B.chin[1] - B.neck[1]];
  N.bare = add(N.head, xf(P.head, { tx: hl[0], ty: hl[1] }));
  N.capped = add(N.head, xf(P.headCapped, { tx: hl[0], ty: hl[1] }));
  N.cap = add(N.head, xf(P.cap, { tx: hl[0], ty: hl[1] }), { holes: [xf(P.capSlit, { tx: hl[0], ty: hl[1] })], z: e });
  const badge = xf(P.badge, { tx: hl[0], ty: hl[1] });
  N.badges = [1, -1].map((side) => add(N.head, badge, { colour: p.badge, back: p.badge, edge: coreOf(p.badge, 0.5), thickness: t * 0.3, z: e + side * t * 0.62 }));
  // kit on the belt
  N.baton = piv(torso, B.baton[0], B.baton[1], -pitch - 4 * e); add(N.baton, P.baton);
  N.keys = piv(torso, B.keys[0], B.keys[1], pitch + 2.5 * e); add(N.keys, P.keys[0], { holes: P.keys.slice(1) });
  // three layers: far limbs, body, near limbs. Within a layer each piece sits a hair off the next, so nothing shares a plane
  for (const [side, zs] of [["far", -1], ["near", 1]]) {
    const up = piv(torso, B.shoulder[0], B.shoulder[1], zs * (pitch + 3 * e)); add(up, P.upper);
    const fo = piv(up, 0, -B.upper, e); add(fo, P.fore);
    const ha = piv(fo, 0, -B.fore, e); add(ha, P.hand);
    const th = piv(rig, B.hip[0], B.hip[1], zs * pitch); add(th, P.thigh);
    const sh = piv(th, 0, -B.thigh, e); add(sh, P.shin);
    const bo = piv(sh, 0, -B.shin, e); add(bo, P.boot);
    N[side] = { up, fo, ha, th, sh, bo };
  }
  g.cast = { nodes: N, params: p };                                   // rig internals; userData stays plain data
  g.userData = { cast: "guard", role: p.role, unit: s, stride: B.stride * s, height: p.height };
  g.group = g; g.pose = poseGuard; poseGuard(g, {});
  return g;
}

// poseGuard(group, params): pure, sets every joint from the params.
//   stance "ease" (hands behind the back, chest out: pride) | "walk" | "stand"
//   phase  0..1 along the walk cycle (move the group stride * phase to keep the feet planted; group.userData.stride is the default stride in cm)
//   turn   degrees the card has turned about its vertical axis; at 90 it is edge on, past 90 the other face (opts.back) shows
//   guard  true | false: the kit (cap, belt, keys, baton, epaulette). Defaults to the role. A citizen becomes a guard by
//          turning the card and passing guard: turn >= 90, so the swap happens while the card is edge on
//   head, lean, keys, baton: degrees, to override the stance's own values; stride: in head units (default 4.4)
export function poseGuard(g, q = {}) {
  const { nodes: N, params: p } = g.cast, B = BODY, stance = q.stance || (p.role === "guard" ? "ease" : "stand"), u = q.phase || 0, S = q.stride || B.stride;
  const turn = q.turn || 0, isGuard = q.guard ?? (p.role === "guard");
  N.turner.rotation.y = turn * DEG;
  for (const k of ["jacket", "skirt", "capped", "cap", "baton", "keys"]) N[k].visible = isGuard;
  for (const m of N.badges) m.visible = isGuard;
  for (const k of ["shirt", "bare"]) N[k].visible = !isGuard;
  let hipY = 3.84, lean = 0, head = 0, keys = 0, baton = -27, legs, arms;
  if (stance === "walk") {
    const low = B.ankle + Math.sqrt(Math.max(3.5 * 3.5 - (0.25 * S) ** 2, 1)) - 0.03, high = Math.min(low + 0.19, 3.82);
    hipY = (low + high) / 2 + (high - low) / 2 * Math.cos(4 * Math.PI * (u - 0.3));
    legs = { near: walkLeg(u, S), far: walkLeg(u + 0.5, S) };
    const arm = (v) => { const c = Math.cos(2 * Math.PI * v); return { up: (isGuard ? -22 : -17) * c - 1, fo: 11 + 15 * (0.5 - 0.5 * c), ha: 6, len: 1 }; };
    arms = { near: arm(u), far: arm(u + 0.5) };
    lean = isGuard ? -1.5 : -4.5; head = isGuard ? 1 : -5; keys = 9 * Math.sin(4 * Math.PI * u + 0.6); baton = -37 + 6 * Math.sin(4 * Math.PI * u);
  } else {
    const ease = stance === "ease";
    legs = { near: { ankle: [ease ? 0.20 : 0.10, B.ankle], pitch: 0 }, far: { ankle: [ease ? -0.24 : -0.14, B.ankle], pitch: 0 } };
    arms = ease ? { near: { up: -20, fo: 4, ha: 44, len: 0.5, hs: 0.86 }, far: { up: -16, fo: 2, ha: 40, len: 0.5, hs: 0.86 } }       // the forearms run across the back, so in profile they are short
      : { near: { up: 3, fo: 9, ha: 5, len: 1 }, far: { up: -5, fo: 13, ha: 5, len: 1 } };
    lean = ease ? 2 : -1; head = ease ? 3 : (isGuard ? 0 : -6); baton = ease ? -41 : -30;
  }
  lean = q.lean ?? lean; head = q.head ?? head; keys = q.keys ?? keys; baton = q.baton ?? baton;
  N.body.position.set(B.hip[0], hipY, 0); N.body.rotation.z = lean * DEG; N.head.rotation.z = head * DEG;
  N.keys.rotation.z = (keys - lean) * DEG; N.baton.rotation.z = (baton - lean) * DEG;
  for (const side of ["near", "far"]) {
    const L = N[side], a = arms[side], l = legs[side], ik = legIK([0, hipY], l.ankle, B.thigh, B.shin);
    L.up.rotation.z = a.up * DEG; L.fo.rotation.z = a.fo * DEG; L.fo.scale.y = a.len; L.ha.rotation.z = a.ha * DEG; L.ha.scale.set(a.hs || 1, (a.hs || 1) / a.len, 1);
    L.th.position.set(B.hip[0], hipY, L.th.position.z); L.th.rotation.z = ik.thigh; L.sh.rotation.z = ik.shin - ik.thigh; L.bo.rotation.z = l.pitch - ik.shin;
  }
  return g;
}
