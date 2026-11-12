// figures.js: the people. Each is a flat paper cut-out standing in the world as a card: a profile silhouette in
// one paper colour, jointed (torso, head, two-piece legs, two-piece arms, each a separate card a hair apart in
// depth). The rig is 2D in the card's own plane (x forward, y up); the card stands at (x, y, z) turned to its
// heading. Feet are planted by inverse kinematics from the distance walked, so a planted foot cannot slide.
import { THREE, card, PAL, clamp, lerp, smooth, edgeOf, mixHex } from "./kit.js";

const T = 0.09, GAP = 0.13;                       // card thickness, depth between layers (cm)
const circle = (cx, cy, r, a0 = 0, a1 = Math.PI * 2, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
// a tapered limb hanging from its joint at the origin down to (0, -len)
function limb(len, w0, w1, n = 6) {
  return [...circle(0, 0, w0 / 2, 0, Math.PI, n), ...circle(0, -len, w1 / 2, Math.PI, 2 * Math.PI, n)];
}
const sc = (pts, h) => pts.map(([x, y]) => [x * h, y * h]);

// 2-bone IK in the plane. Angles are measured from straight down toward +x (forward). bend = +1 knee, -1 elbow.
function ik(hx, hy, tx, ty, a, b, bend) {
  const dx = tx - hx, dy = ty - hy, d = Math.min(Math.hypot(dx, dy), a + b - 1e-3), base = Math.atan2(dx, -dy);
  const A = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1)), t1 = base + bend * A;
  const kx = hx + a * Math.sin(t1), ky = hy - a * Math.cos(t1);
  return [t1, Math.atan2(tx - kx, -(ty - ky))];
}
// where a foot is, relative to the body, at walk phase ph (in steps; a whole number = feet together)
function foot(ph, i, L, d = 0.08) {
  const psi = ph - i, j = Math.round(psi / 2), k = psi - 2 * j;
  if (Math.abs(k) <= 0.5 + d) return [-k * L, 0];
  const u = k > 0 ? (k - 0.5 - d) / (1 - 2 * d) : (k + 1.5 - d) / (1 - 2 * d), e = u * u * (3 - 2 * u);
  return [(k > 0 ? 2 * L * e : -2 * L + 2 * L * e) - k * L, Math.sin(Math.PI * u)];
}

export function makeFigure(name, o = {}) {
  const h = o.h ?? 4, colour = o.colour ?? PAL.indigo, tree = !!o.treeman;
  const HIP = 0.52 * h, TH = 0.27 * h, SH = 0.25 * h, TORSO = 0.30 * h, UA = 0.165 * h, FA = 0.185 * h;
  const root = new THREE.Group(); root.name = name;
  const part = (pn, pts, z, col = colour) => { const m = card(pts, col, T); m.position.z = z; m.name = `${name}.${pn}`; return m; };
  const joint = (z = 0) => { const g = new THREE.Group(); g.position.z = z; return g; };

  // torso: a coat, pivot at the hip
  const hem = o.coat ?? -0.10, flare = o.flare ?? 0;
  const torsoPts = sc([[0.075 + flare, hem], [0.08, 0.03], [0.082, 0.17], [0.062, 0.27], [0.022, 0.335], [-0.026, 0.335], [-0.062, 0.3], [-0.088, 0.22], [-0.072, 0.08], [-0.085 - flare, hem]], h);
  const torso = joint(); torso.add(part("torso", torsoPts, 0)); root.add(torso);
  // head, pivot at the neck: a round head with a nose; no eye, no mouth
  const headPts = [...circle(0.012, 0.078, 0.072, -0.25, Math.PI * 1.75, 16).map((p) => p), [0.048, 0.02]];
  headPts.splice(1, 0, [0.103, 0.064], [0.086, 0.085]);      // the nose
  const head = joint(); head.position.set(0, 0.335 * h, 0);
  head.add(part("head", sc(headPts, h), 0.02));
  if (tree) {       // a soft wide-brimmed walker's hat and a beard
    head.add(part("hat", sc([[-0.125, 0.112], [0.14, 0.098], [0.142, 0.118], [0.07, 0.128], [0.058, 0.178], [0.0, 0.196], [-0.052, 0.182], [-0.066, 0.132], [-0.125, 0.13]], h), 0.045));
    head.add(part("beard", sc([[0.02, 0.04], [0.085, 0.045], [0.1, -0.005], [0.075, -0.05], [0.03, -0.02]], h), 0.045));
  } else if (o.hat === 1) head.add(part("hat", sc(circle(-0.02, 0.135, 0.062, -0.1, Math.PI * 1.1, 8).map(([x, y]) => [x * 1.25, y]), h), 0.045));      // a beret, no brim
  else if (o.hat === 2) head.add(part("hair", sc([...circle(-0.03, 0.07, 0.07, Math.PI * 0.35, Math.PI * 1.5, 8), [-0.02, 0.0]], h), 0.045));
  torso.add(head);
  // legs: thigh at the hip, shin with the foot at the knee
  const footPts = [[-0.04, -0.25], [0.118, -0.25], [0.115, -0.228], [0.035, -0.2]];
  const legs = [-1, 1].map((side, i) => {
    const th = joint(side * GAP), shn = joint(); shn.position.y = -TH;
    th.add(part(i ? "thigh_near" : "thigh_far", sc(limb(0.27, 0.088, 0.066), h), 0));
    shn.add(part(i ? "shin_near" : "shin_far", sc([...limb(0.25, 0.062, 0.04).slice(0, 8), ...footPts, [0.021, -0.19]], h), 0));
    th.add(shn); root.add(th); return { th, shn };
  });
  // arms: upper arm at the shoulder (on the torso), forearm with the hand at the elbow
  const arms = [-1, 1].map((side, i) => {
    const ua = joint(side * 2 * GAP), fa = joint(); ua.position.set(0.005 * h, 0.285 * h, side * 2 * GAP); fa.position.y = -UA;
    ua.add(part(i ? "arm_near" : "arm_far", sc(limb(0.165, 0.056, 0.046), h), 0));
    fa.add(part(i ? "forearm_near" : "forearm_far", sc([...limb(0.16, 0.046, 0.036).slice(0, 7), ...circle(0, -0.165, 0.026, Math.PI * 0.9, Math.PI * 2.1, 8)], h), 0));
    ua.add(fa); torso.add(ua); return { ua, fa };
  });
  let pack = null, staff = null;
  if (tree) {
    pack = joint(0.07); pack.position.set(-0.075 * h, 0.2 * h, 0.07);
    pack.add(part("pack", sc([[-0.11, -0.13], [0.012, -0.14], [0.02, 0.08], [-0.02, 0.105], [-0.105, 0.09], [-0.125, 0.0]], h), 0, PAL.umber));
    pack.add(part("bedroll", sc(circle(-0.05, 0.135, 0.042, 0, Math.PI * 2, 10).map(([x, y]) => [x * 1.5 + 0.02, y]), h), 0.03, PAL.gold));
    torso.add(pack);
    staff = joint(3 * GAP); staff.add(part("staff", sc([[-0.012, 0], [0.012, 0], [0.013, 0.63], [0.026, 0.66], [0.0, 0.69], [-0.026, 0.66], [-0.013, 0.63]], h), 0, PAL.umber)); root.add(staff);
  }
  root.userData.dims = [0.3 * h, h, 6 * GAP];

  function pose(s) {
    root.visible = s.visible !== false; if (!root.visible) return;
    root.position.set(s.x, s.y ?? 0, s.z); root.rotation.y = s.yaw;
    const w = s.walk ?? 0, ph = s.phase ?? 0, L = s.L ?? 2, lean0 = tree ? 0.2 : (o.lean ?? 0.05);
    const f0 = foot(ph, 0, L), f1 = foot(ph, 1, L), lift = 0.075 * h * w;
    // hip height: the planted leg vaults over its foot
    const reach = (HIP * 0.992);
    const hy = Math.min(...[f0, f1].filter((p) => p[1] < 0.5).map((p) => Math.sqrt(Math.max(reach * reach - p[0] * p[0], 0.5 * reach * reach)))) - 0.012 * h * (tree ? 1 + (s.lean ?? 0) * 1.5 : 1);
    const lean = lean0 + 0.05 * w + 0.17 * (s.lean ?? 0) - 0.05 * (s.hitch ?? 0);
    torso.position.set(0, hy, 0); torso.rotation.z = -lean;
    head.rotation.z = lean * 0.75 - 0.12 * (s.lean ?? 0);
    [f0, f1].forEach((p, i) => {
      const [t1, t2] = ik(0, hy, p[0], p[1] * lift, TH, SH, 1);
      legs[i].th.position.set(0, hy, (i ? 1 : -1) * GAP); legs[i].th.rotation.z = t1; legs[i].shn.rotation.z = t2 - t1;
    });
    const swing = Math.sin(Math.PI * ph) * w;
    // arms hang from the torso, so take the torso's lean out of their angles
    const setArm = (i, t1, t2) => { arms[i].ua.rotation.z = t1 + lean; arms[i].fa.rotation.z = t2 - t1; };
    setArm(0, 0.45 * swing, 0.45 * swing + 0.25 + 0.25 * Math.max(0, swing));
    if (!tree) setArm(1, -0.45 * swing, -0.45 * swing + 0.25 + 0.25 * Math.max(0, -swing));
    else {
      // shoulder in root space
      const sx = 0.005 * h * Math.cos(lean) + 0.285 * h * Math.sin(lean), sy = hy + 0.285 * h * Math.cos(lean) - 0.005 * h * Math.sin(lean);
      // the staff: its tip plants with the far foot, the near hand rides it
      const ln = s.lean ?? 0, tipX = lerp(f0[0] * 0.5 + 0.42 * h, 0.4 * h, ln), tipY = f0[1] * lift * 0.6, SL = 0.64 * h;
      // aim for a grip out in front, then put the hand exactly on the stick's top
      const gx = lerp(0.3 * h + 0.4 * (tipX - 0.42 * h), 0.3 * h, ln), gy = lerp(hy + 0.1 * h, hy + 0.03 * h, ln), gl = Math.hypot(gx - tipX, gy - tipY) || 1;
      const hx = tipX + ((gx - tipX) / gl) * SL, hyy = tipY + ((gy - tipY) / gl) * SL;
      const [a1, a2] = ik(sx, sy, hx, hyy, UA, FA, -1); setArm(1, a1, a2);
      staff.position.set(tipX, tipY, 3 * GAP); staff.rotation.z = -Math.atan2(hx - tipX, hyy - tipY);
      // the hitch: the far hand goes to the strap, the pack jumps and settles
      const k = s.hitch ?? 0;
      if (k > 0) { const [b1, b2] = ik(sx, sy, sx + 0.07 * h, sy - 0.03 * h, UA, FA * 0.9, -1); setArm(0, lerp(0.45 * swing, b1, clamp(k * 1.4)), lerp(0.7, b2, clamp(k * 1.4))); }
      pack.position.y = 0.2 * h + 0.12 * h * k; pack.rotation.z = -0.22 * k;
    }
  }
  return { name, root, pose, h };
}

export const CITIZEN_COLOURS = [PAL.indigo, PAL.umber, PAL.lavender, PAL.navy, mixHex(PAL.umber, PAL.peach, 0.45)];
export function makeCitizen(def) {
  const i = +def.name.slice(-2);
  return makeFigure(def.name, { h: def.h, colour: CITIZEN_COLOURS[def.colour % 5], hat: def.hat, coat: [-0.08, -0.2, -0.13][i % 3], flare: [0, 0.03, 0.01][i % 3], lean: 0.04 + 0.03 * (i % 2) });
}
export const makeTreeman = () => makeFigure("treeman", { h: 4.7, colour: mixHex(PAL.green, PAL.core, 0.18), treeman: true });
