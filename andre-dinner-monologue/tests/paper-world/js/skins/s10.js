// skins/s10.js: section 10, the bare table, f4315 to f4761. It makes no pieces. From f4315 its update re-poses the
// pieces of the table and of sections 5 to 7 through the registry, on every frame (their owners have already posed them
// for this frame and put them back on the next), so that by "erased" everything lies flat in the cloth and fades, and
// the bare cloth, two plain plates and the candle are left. Before f4315 it touches nothing. Every pose is a pure
// function of f (sections/s10.js). Not this section's: section 9's robots, section 8's couple and far tables.
// notes/s10.md lists every one of the 143 pieces and what happens to it here.
import * as E from "../sections/s10.js";
import { clamp, lerp, smooth } from "../kit.js";

const HALF = Math.PI / 2, FH = { knife: 20, fork: 19, spoon: 18 };
// what is left on the bare table, and what is never a "flat shape": these are not faded on "erased"
const KEEP = new Set(["room_wall", "room_floor", "cloth", "key_light", "bounce_light", "room_fill", "candle", "plate_far", "plate_near", "plate_far.tower", "plate_near.tower", "fg_glass", "fg_fork"]);

export async function build(X) {
  const { reg, S } = X, { F0, C } = E, get = (n) => reg.get(n), camAt = (f) => E.camAt(f).P;

  // ---------- a volume hinges down about its foot, its top toward dir. Falling away from the lens it lies painted side
  // up (as the registry's fold does); falling toward the lens it goes face down, so the card never spins half a turn.
  // Which of the two is fixed by where the lens is on the frame the fold starts (camP), not by the lens as it moves.
  function foldVolume(e, k, dir, camP, lift) {
    if (k <= 0) return;
    const v = e.it, g = v.g, a = k * (HALF - 0.004), h = Math.atan2(dir[0], dir[1]);
    const toLens = (camP[0] - g.position.x) * dir[0] + (camP[2] - g.position.z) * dir[1] > 0;
    const yc = v.face.rotation.y, yf = toLens ? h : h + Math.PI, d = Math.atan2(Math.sin(yf - yc), Math.cos(yf - yc));
    v.face.rotation.set(v.face.rotation.x * (1 - clamp(k * 3)), yc + d * smooth(k / 0.35), 0);
    v.show.rotation.x = toLens ? a : -a; v.sh.rotation.x = -a;                              // the shadow card always tips away from the flame (toward it, a tall card's shadow would sweep the table)
    g.position.y = lift * clamp(k * 2);
  }
  // a standee hinges down about its foot (only one that is standing and in sight): toward `want` (x, z), or away from the lens
  function foldStandee(e, k, camP, want) {
    const st = e.it; if (k <= 0 || !st.root.visible) return;
    const cur = st.pop.rotation.x; if (Math.abs(cur) > HALF - 0.05) return;                 // it lies flat already
    const yaw = st.root.rotation.y, w = want || [st.root.position.x - camP[0], st.root.position.z - camP[2]];
    const dir = Math.sin(yaw) * w[0] + Math.cos(yaw) * w[1] >= 0 ? 1 : -1;
    st.pop.rotation.x = lerp(cur, dir * (HALF - 0.01), k); st.rock.rotation.z *= 1 - k; st.root.position.y += 0.05 * k;
  }

  // ---------- the fence: where each card stands (it has stood there since section 5), the order they fall in (the
  // nearest first), and which of them the redwood's trunk comes down on
  const { foot, dir: rd, h: RH } = E.RED, redHalf = 0.36 * get("redwood").it.w, along = ([x, z]) => (x - foot[0]) * rd[0] + (z - foot[1]) * rd[1], across = ([x, z]) => (x - foot[0]) * rd[1] - (z - foot[1]) * rd[0];
  const under = (p) => { const r = along(p); return r > 1.5 && r < RH - 3 && Math.abs(across(p)) < redHalf ? r : 0; };
  const posts = X.postObjs.map((o) => { const s = o.Q.at(F0); return { ...o, e: get(o.Q.name), at: [s.x, s.z], h: FH[o.G.userData.kind] || 19, push: under([s.x, s.z]) }; });
  posts.slice().sort((a, b) => b.at[1] - a.at[1]).forEach((p, r) => { p.rank = r; });
  const vols = E.FOLDS.map((F, i) => ({ ...F, e: get(F.name), camP: camAt(F.t0), lift: 0.16 + 0.03 * i }));
  const dark = E.DARK.map(([name, half, lag]) => ({ e: get(name), half, lag }));
  const towers = Object.keys(E.TELE).map((name) => ({ name, e: get(name) }));
  const bricks = reg.names(6).filter((n) => n.startsWith("brick_")).map((n, i) => ({ e: get(n), i }));
  const standees = reg.names(5).filter((n) => n.startsWith("citizen_")).map((n) => get(n));
  const fades = [5, 6, 7].flatMap((n) => reg.names(n)).filter((n) => !KEEP.has(n)).map(get);
  const sap = get("sapling"), red = get("redwood"), pine = get("pine"), treeman = get("treeman"), hand = get("hand_open"), far = get("plate_far"), near = get("plate_near");
  const camRed = camAt(E.RED.t0), camTm = camAt(E.TREEMAN.t0), camNobody = camAt(C.nobody), jp = camAt(F0);
  const sapYaw = Math.atan2(jp[0] - sap.it.g.position.x, jp[2] - sap.it.g.position.z);      // the way the folded sapling lies at the join

  function update(f, jitter, cam) {
    if (f < F0) return;
    // the sapling has lain folded toward the lens since section 5: from here it lies where it lay at the join, and flat
    // (a volume leans back and turns as the lens rises; a card lying on the cloth must not)
    sap.it.face.rotation.set(0, sapYaw, 0);
    // the open hand is section 8's to slide out; if it is out past the near edge it is off the table: not drawn
    if (hand.obj.visible && hand.obj.position.z > 66) hand.obj.visible = false;

    // "nobody": section 9 hides the citizens and the guards and its robots fall. Should any still stand, they fall too
    standees.forEach((e, i) => foldStandee(e, E.standeeDown(i, f), camNobody));

    // "species": the pine shuts from the top, then lies down
    if (f > E.PINE.t0) pine.set.tiers((i) => E.pineTier(i, f));
    const kp = E.pineDown(f); if (kp > 0) { pine.set.fold(kp, E.headingOf(E.PINE.dir)); pine.obj.position.y += 0.34 * clamp(kp * 2); }

    // "human": the redwood comes down across the fence line; the tree man folds, under the trunk if he stands in its way
    const kr = E.redDown(f), ar = kr * HALF; foldVolume(red, kr, rd, camRed, 0.4);
    { const p = [treeman.it.root.position.x, treeman.it.root.position.z], r = under(p);
      if (r) foldStandee(treeman, E.pushed(ar, r, treeman.it.h) / HALF, camTm, rd); else foldStandee(treeman, E.drop(f - E.TREEMAN.t0, E.TREEMAN.n), camTm); }

    // "feelings", "thoughts": windows dark, the plate towers down into their plates, the other towers flat
    for (const d of dark) d.e.set.windows(E.windowsAt(d.half, d.lag, f));
    for (const t of towers) if (f > E.TELE[t.name]) t.e.set.telescope((i) => E.teleAt(t.name, i, f));
    for (const v of vols) foldVolume(v.e, E.drop(f - v.t0, v.n), v.dir, v.camP, v.lift);

    // "history": the fence hinges down inward, the nearest card first (a card the sleeve or the trunk pushed in stays in)
    for (const p of posts) {
      const cur = p.H.rotation.x / HALF, k = Math.max(E.fenceDown(p.rank, f), p.push ? E.pushed(ar, p.push, p.h) / HALF : 0), nk = Math.min(cur, -k);
      if (nk < cur) p.e.set.hinge(nk);
      p.G.position.y += 0.09 * Math.min(1, k * 2);                                          // lying, it is a card's thickness above the plate's disc
    }
    // "memory": the bricks left standing at the fence hinge down
    for (const b of bricks) { const o = b.e.obj, k = E.brickDown(b.i, f); if (!o.visible || k <= 0) continue; o.rotation.order = "YXZ"; o.rotation.x = -k * (HALF - 0.004); o.position.y += 0.05 * k; }

    // "erased": every flat shape and every slot fades to blank cloth
    const kf = E.fadeAt(f);
    if (kf < 1) for (const e of fades) { if (kf <= 0.002) e.obj.visible = false; else if (e.obj.visible) e.set.fade(kf); }

    // out: the far plate is a pale disc in a faint cool fill, the near one barely there
    const kp2 = E.paleAt(f);
    if (kp2 > 0) for (const [e, c] of [[far, E.PALE.far], [near, E.PALE.near]]) { const m = e.obj.material.color; m.setRGB(Math.max(m.r, c[0] * kp2), Math.max(m.g, c[1] * kp2), Math.max(m.b, c[2] * kp2)); }
  }
  return { update };
}
