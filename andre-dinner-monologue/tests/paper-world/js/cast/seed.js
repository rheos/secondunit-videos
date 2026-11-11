// The winged pine seed and the pop-up pine.
import { DEG, fillet, spline, xf } from "./shape2d.js";
import { papers, card, cardGeometry, hinge } from "./card.js";

// Seed outlines, unit = the whole seed's length (1). Origin at the middle of the seed body, the wing runs toward +y.
export function seedOutline() {
  const body = spline([[0, -0.15], [0.105, -0.10], [0.15, 0.01], [0.10, 0.15], [0, 0.26], [-0.10, 0.15], [-0.15, 0.01], [-0.105, -0.10]], true, 6);
  const spine = [[0.0, 0.06], [0.05, 0.955]];                                      // the fold runs up the wing
  const wingL = spline([[0.0, 0.06], [-0.075, 0.13], [-0.118, 0.32], [-0.10, 0.60], [-0.045, 0.86], [0.05, 0.955], [0.031, 0.60], [0.0145, 0.28]], true, 6);
  const wingR = spline([[0.0, 0.06], [0.0145, 0.28], [0.031, 0.60], [0.05, 0.955], [0.145, 0.90], [0.228, 0.74], [0.25, 0.52], [0.215, 0.30], [0.115, 0.14]], true, 6);
  return { body, wingL, wingR, spine };
}

// makeSeed(THREE, paper, opts): a tiny folded card. Origin at the seed body; at rest it hangs, wing up, facing +z.
// opts: size (cm, whole length, 3.2), thickness (cm, 0.05), colour (gold), wing (paler), grain.
export function makeSeed(THREE, paper, opts = {}) {
  const p = { size: 3.2, thickness: 0.05, colour: "#f1b23a", wing: "#f8dfa2", grain: 4, ...opts };
  const M = papers(paper), o = seedOutline(), t = p.thickness / p.size, base = { thickness: t, uvScale: p.size / p.grain };
  const g = new THREE.Group(), spin = new THREE.Group(), tilt = new THREE.Group(), rig = new THREE.Group(); g.name = "seed";
  g.add(spin); spin.add(tilt); tilt.add(rig); rig.scale.setScalar(p.size);
  const dir = [o.spine[1][0] - o.spine[0][0], o.spine[1][1] - o.spine[0][1]];
  const hl = hinge(THREE, rig, o.spine[0], dir), hr = hinge(THREE, rig, o.spine[0], dir);
  hl.inner.add(card(THREE, M, o.wingL, { ...base, colour: p.wing })); hr.inner.add(card(THREE, M, o.wingR, { ...base, colour: p.wing }));
  for (const z of [1, -1]) rig.add(card(THREE, M, o.body, { ...base, colour: p.colour, thickness: t * 0.9, z: z * t * 1.0 }));   // the seed sits on both faces of the wing
  g.cast = { spin, tilt, hl, hr, params: p };
  g.userData = { cast: "seed", size: p.size };
  g.group = g; g.pose = poseSeed; poseSeed(g, {});
  return g;
}
// spin: radians about the vertical axis through the seed (the autorotation as it falls)
// tilt: radians from hanging (0, wing straight up) to flat (PI / 2, lying on a surface, wing toward -z)
// fold: radians each half of the wing is folded up from flat (default 0.22)
export function poseSeed(g, { spin = 0, tilt = 0, fold = 0.22 } = {}) {
  const d = g.cast; d.spin.rotation.y = spin; d.tilt.rotation.x = -tilt; d.hl.set(fold); d.hr.set(-fold);
  return g;
}

// The pine in outline at growth 0..1: unit = full height (1), origin at the foot of the trunk. Tiers appear from the tip down,
// each new tier pushing the ones above it up, so the tree grows tier by tier out of the seed.
export const PINE = { tiers: 5, trunkH: 0.15, trunkW: 0.036, tierH: 0.27, advance: 0.158, w0: 0.125, dw: 0.062, droop: 0.022 };
const easeOut = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 2.2);
export function pineOutline(growth = 1) {
  const c = PINE, T = Math.max(0, Math.min(1, growth)) * (c.tiers + 0.6), right = [];
  const th = c.trunkH * easeOut(T / 0.6), tw = c.trunkW * (0.5 + 0.5 * easeOut(T / 0.6));
  // visible tiers from the bottom up; tier i counts from the tip (0)
  const vis = []; for (let i = c.tiers - 1; i >= 0; i--) { const s = easeOut(T - 0.6 - i); if (s > 0.002) vis.push({ i, s }); }
  let y = th; right.push([tw, 0, 0], [tw, Math.max(th - 0.004, 0.001), 0]);
  let prev = null;
  for (const v of vis) {
    const w = (c.w0 + c.dw * v.i) * (0.35 + 0.65 * v.s), h = c.tierH * (0.4 + 0.6 * v.s), yb = y, yt = y + h, drop = c.droop * v.s;
    // where this tier's underside meets the slope of the tier below (or the trunk)
    let inner; if (prev) { const k = (prev.yt - (yb + drop)) / (prev.yt - prev.yb); inner = [Math.max(prev.w * k, tw + 0.004), yb + drop]; } else inner = [tw + 0.012, yb + drop];
    right.push([inner[0], inner[1], 0.012], [w, yb, 0.008]);
    prev = { w, yb, yt }; y += c.advance * (0.4 + 0.6 * v.s) * (v.i === 0 ? 0 : 1);
  }
  const top = prev ? prev.yt : th + 0.02;
  const pts = right.concat([[0, top, 0.004]], right.slice().reverse().map(([x, yy, r]) => [-x, yy, r]));
  return fillet(pts, 4);
}

// makePine(THREE, paper, opts): a pop-up, three flat cards crossed on one axis (a six-pointed star from above).
// opts: height (cm at full growth, 14), thickness (cm, 0.1), colour, grain. Origin at the foot of the trunk, growing up +y.
export function makePine(THREE, paper, opts = {}) {
  const p = { height: 14, thickness: 0.1, colour: "#5f8350", grain: 4, ...opts };
  const M = papers(paper), g = new THREE.Group(), rig = new THREE.Group(); g.name = "pine"; g.add(rig); rig.scale.setScalar(p.height);
  const mats = [M(p.colour), M(p.colour), M.core(p.colour)], cards = [];
  for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(new THREE.BufferGeometry(), mats); m.rotation.y = k * Math.PI / 3 + 0.26; m.castShadow = m.receiveShadow = true; rig.add(m); cards.push(m); }
  g.cast = { cards, params: p, THREE, growth: -1 };
  g.userData = { cast: "pine", height: p.height };
  g.group = g; g.pose = posePine; posePine(g, { growth: 1 });
  return g;
}
// growth: 0 (nothing but the foot of a shoot) to 1 (the full tree). Overshoot is the caller's: growth may go a little past 1 by scaling the group.
export function posePine(g, q = {}) {
  const growth = typeof q === "number" ? q : (q.growth ?? q.g ?? 1), d = g.cast, key = Math.round(growth * 400);
  if (key === d.growth) return g; d.growth = key;
  const p = d.params, geo = cardGeometry(d.THREE, pineOutline(key / 400), p.thickness / p.height, [], p.height / p.grain);
  for (const m of d.cards) { m.geometry.dispose(); m.geometry = geo; m.visible = key > 0; }
  return g;
}
