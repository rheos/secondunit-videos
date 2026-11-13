// skins/s01.js: section 1, the table as set, f0 to f196. No new painted pieces: the table is section 5's, as set.
// What this file makes: its own soft copies of the two pieces of real tableware (the plates fg_glass and fg_fork), which
// the lens passes on its way in. Section 5's own two stand by the candle for every f before 1800 and are left alone,
// so nothing changes on the join at f196. What it re-poses of the table's, inside f0 to f196 only: the flame card (it
// swings past upright on its hinge; the flame hook clamps at upright) and the reach of the key and bounce lights (the
// light opens across the cloth from the flame outward). Everything is a pure function of f.
import * as S1 from "../sections/s01.js";

export async function build(X) {
  const { THREE } = X, HALF = Math.PI / 2;

  // ---------- the soft tableware: a blurred card that turns to the lens, drawn over everything, never in the depth buffer
  const fg = [];
  for (const [name, o, px] of [["fg_glass", S1.FG.glass, 12], ["fg_fork", S1.FG.fork, 14]]) {
    const dim = o.dim;
    const p = await X.plate(name), c = X.blurred(p.canvas, px), t = X.tex(c);
    const h = (o.w * p.h) / p.w, sw = (o.w * c.width) / p.w, sh = (h * c.height) / p.h;
    const g = new THREE.Group(); g.position.set(o.at[0], o.y, o.at[1]); g.visible = false; X.world.add(g);
    const m = new THREE.Mesh(X.plane(sw, sh), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
    m.position.y = -(sh - h) / 2; m.renderOrder = 10; m.frustumCulled = false; g.add(m);
    X.reg.add(name, g, { kind: "lens" }); fg.push({ g, m, dim, h });
  }

  // ---------- the table's painted pieces, by how far each stands from the candle: as the light opens across the cloth
  // (12 frames) a piece gets the candle's tint when the light reaches it, not before
  const DARK = 0.06, cx = X.LAY.candle[0], cz = X.LAY.candle[1], painted = [];
  for (const n of X.reg.names(5)) {
    const e = X.reg.get(n), it = e.it || {};
    const col = it.mat ? (it.mat.uniforms ? it.mat.uniforms.tint && it.mat.uniforms.tint.value : it.mat.color) : it.card ? it.card.material.color : e.kind === "flat" && e.obj.isMesh ? e.obj.material.color : null;
    if (col && (e.kind === "volume" || e.kind === "flat")) painted.push({ col, pos: (it.G || it.g || e.obj).position });
  }

  function update(f, jitter, cam) {
    const mine = f >= S1.F0 && f < S1.F1;
    // the reach of the flame's light: set on every frame of the film (the registry does not put it back); 0 = no limit
    const R = mine ? S1.reachAt(f) : 0;
    X.key.distance = R; X.bounce.distance = R ? Math.hypot(46, R) * 1.15 : 0;
    if (!mine) return;                                               // the copies are built hidden: the registry hides them again
    // section 5's two soft pieces stand between this lens and the candle: not drawn in these frames
    X.reg.get("fg_glass").set.hide(); X.reg.get("fg_fork").set.hide();
    if (R) { const lit = X.now.flame.lit, lev = DARK + (1 - DARK) * lit;
      for (const { col, pos } of painted) { const u = Math.min(1, Math.hypot(pos.x - cx, pos.z - cz) / R), win = (1 - u ** 4) ** 2; col.multiplyScalar((DARK + (1 - DARK) * lit * win) / lev); } }
    // the flame card swings a little past upright before it settles
    const k = S1.hingeAt(f); if (k < 0) X.flame.rotation.x = HALF * 0.97 * k;
    // the soft tableware: in front of the lens until the lens has passed it
    const dx = cam.T[0] - cam.P[0], dy = cam.T[1] - cam.P[1], dz = cam.T[2] - cam.P[2], dl = Math.hypot(dx, dy, dz), L = X.now.level;
    for (const { g, m, dim, h } of fg) {
      const ahead = ((g.position.x - cam.P[0]) * dx + (g.position.y + h / 2 - cam.P[1]) * dy + (g.position.z - cam.P[2]) * dz) / dl;
      g.visible = ahead > 0.8;
      g.rotation.y = Math.atan2(cam.P[0] - g.position.x, cam.P[2] - g.position.z);
      m.material.color.setRGB(dim * L, dim * 0.94 * L, dim * 0.86 * L);
    }
  }
  return { update };
}
