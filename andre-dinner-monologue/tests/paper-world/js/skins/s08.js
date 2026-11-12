// skins/s08.js: the painted pieces of section 8, the couple at the edge.
//   couple        one standee (the `couple` plate: two figures on one base), 4.5 cm. Painted facing right; it travels left,
//                 so from the near side the lens sees its mirrored back, facing the way it goes. One card throughout.
//   couple_slot   its slot, cut as it goes: on the cloth to the fallen wall, then through the wall card, and the drawn stop
//   far_tables    the room's other tables, out in the dark beyond the left edge: soft cut-outs of the `far_tables` plate
//                 (the whole plate far off as four tables, six more cut from it nearer), dimmed, blurred, each with its
//                 own candle glow. A table is not drawn at all until its candle catches.
// Re-posed from other sections, in this section's frames only: hand_open (slides out, then hidden for the rest of the
// film), and the two fence cards either side of the slot (the gate, f3555 to f3833).
// Everything here is hidden before f3397, so sections 1 to 7 draw as they did.
import * as S8 from "../sections/s08.js";

export async function build(X) {
  const { THREE, world, reg } = X, HALF = Math.PI / 2;
  const group = (name) => { const g = new THREE.Group(); g.name = name; return g; };

  // ================= the couple
  const cp = await X.plate("couple"), st = X.standee("couple", cp, S8.COUPLE.h);
  if (Math.abs((S8.COUPLE.h * cp.w) / cp.h / 2 - S8.COUPLE.half) > 0.05) throw new Error("s08: the couple plate's shape has changed: set COUPLE.half in sections/s08.js");

  // ================= the slot: a straight cut. The cloth part is the kit's slot; over the fallen wall the same two
  // ribbons lie on the wall card; the stop is a short bar across the end.
  const line = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]), h = [(b[0] - a[0]) / l, (b[1] - a[1]) / l]; const at = (s) => [a[0] + h[0] * s, a[1] + h[1] * s];
    return { len: l, at, pose: (s) => { const p = at(Math.min(l, Math.max(0, s))); return { x: p[0], z: p[1], hx: h[0], hz: h[1] }; } }; };
  const slotG = group("couple_slot"); world.add(slotG); reg.add("couple_slot", slotG, { kind: "slots" });
  const onCloth = X.slot(line(S8.START, S8.SLOT.at(S8.SLOT.wall))); slotG.add(onCloth);
  const wallPath = line(S8.SLOT.at(S8.SLOT.wall), S8.STOP), WY = 0.085;
  const wa = X.ribbon(wallPath, 0.15, WY, X.slotPale), wb = X.ribbon(wallPath, 0.05, WY + 0.02, X.slotDark), wn = wa.geometry.index.count / 6; slotG.add(wa, wb);
  const bar = line([S8.STOP[0] + 0.6 * S8.NEAR[0], S8.STOP[1] + 0.6 * S8.NEAR[1]], [S8.STOP[0] - 0.6 * S8.NEAR[0], S8.STOP[1] - 0.6 * S8.NEAR[1]]);
  const stop = group("couple_slot.stop"); stop.add(X.ribbon(bar, 0.19, WY + 0.005, X.slotPale), X.ribbon(bar, 0.08, WY + 0.025, X.slotDark)); slotG.add(stop);
  slotG.visible = false;

  // ================= the gate: the two fence cards either side of the slot (found by where they stand)
  const gate = S8.GATE.z.map((z) => X.postObjs.map((o) => ({ o, s: o.Q.at(S8.F0) })).filter((q) => q.s.x < S8.FENCE_X + 0.5).sort((a, b) => Math.abs(a.s.z - z) - Math.abs(b.s.z - z))[0].o.G.name);

  // ================= the far tables. px are pixels of the far_tables plate (1536 x 1024).
  const im = await X.image("far_tables");
  // a soft cut-out: the plate's rectangle [x0, y0, w, h], feathered to nothing at an ellipse, blurred a little, mirrored or not
  const patch = (x0, y0, w, h, blur, flip) => {
    const k = 0.75, cw = Math.round(w * k), ch = Math.round(h * k), cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; const g = cv.getContext("2d");
    g.filter = `blur(${blur}px)`; if (flip) { g.translate(cw, 0); g.scale(-1, 1); } g.drawImage(im, x0, y0, w, h, 0, 0, cw, ch); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = "none";
    const img = g.getImageData(0, 0, cw, ch), d = img.data;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const u = (x + 0.5) / cw * 2 - 1, v = (y + 0.5) / ch * 2 - 1, r = Math.hypot(u, v), a = 1 - Math.min(1, Math.max(0, (r - 0.5) / 0.5)); d[(y * cw + x) * 4 + 3] = 255 * a * a * (3 - 2 * a); }
    g.putImageData(img, 0, 0); const t = X.tex(cv); t.anisotropy = 4; return t;
  };
  const glowT = (() => { const cv = document.createElement("canvas"); cv.width = cv.height = 96; const g = cv.getContext("2d"), gr = g.createRadialGradient(48, 48, 0, 48, 48, 48); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.18, "rgba(255,255,255,0.42)"); gr.addColorStop(0.5, "rgba(255,255,255,0.08)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 96, 96); return new THREE.CanvasTexture(cv); })();
  // the plate's four tables: the rectangle each is cut from, and where its flame is
  const CUT = { hero: { r: [150, 390, 1250, 634], flame: [1149, 548] }, left: { r: [0, 190, 660, 500], flame: [411, 306] }, mid: { r: [680, 200, 390, 290], flame: [923, 282] }, right: { r: [1060, 215, 476, 400], flame: [1423, 303] } };
  const far = group("far_tables"); world.add(far); reg.add("far_tables", far, { kind: "room" }); far.visible = false;
  // where things stand out there: measured from the join's lens (where section 9 begins), by bearing (degrees from
  // straight out over the left edge, toward the far side) and distance
  const REF = [-56, 22], place = (deg, dist) => { const a = (deg * Math.PI) / 180; return { x: REF[0] - dist * Math.cos(a), z: REF[1] - dist * Math.sin(a), ry: Math.atan2(Math.cos(a), Math.sin(a)) }; };
  const tables = [];
  // one table: a card `w` cm wide showing cut `c`, its middle at (lx, y) on the plane of group G
  const table = (name, G, c, w, lx, y, o = {}) => {
    const [x0, y0, pw, ph] = CUT[c].r, h = (w * ph) / pw, t = patch(x0, y0, pw, ph, o.blur ?? 4, o.flip);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false })); m.name = "far_tables." + name; m.position.set(lx, y, o.dz ?? 0); G.add(m);
    const fx = ((CUT[c].flame[0] - x0) / pw - 0.5) * (o.flip ? -1 : 1), fy = 0.5 - (CUT[c].flame[1] - y0) / ph;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); const gs = (o.glow ?? 0.1) * w; glow.scale.set(gs, gs, 1); glow.position.set(fx * w, fy * h, 0.5); m.add(glow);
    const i = S8.TABLES.findIndex((T) => T.name === name); if (i < 0) throw new Error("s08: no far table named " + name);
    tables.push({ i, m, glow, dim: o.dim ?? 0.6, gs });
  };
  // the whole plate, far off: its four tables on one plane, 200 cm wide, 233 cm out
  { const G = group("far_tables.plate"), p = place(6, 233), W = 200, k = W / 1536; G.position.set(p.x, 30, p.z); G.rotation.y = p.ry; far.add(G);
    for (const [name, c] of [["plate_hero", "hero"], ["plate_left", "left"], ["plate_mid", "mid"], ["plate_right", "right"]]) { const [x0, y0, pw, ph] = CUT[c].r;
      table(name, G, c, pw * k, (x0 + pw / 2 - 768) * k, (512 - (y0 + ph / 2)) * k, { blur: 4, dim: 0.6, glow: c === "hero" ? 0.05 : 0.085, dz: c === "hero" ? 0.4 : 0 }); } }
  // cut-outs from it, nearer, for parallax
  for (const [name, c, deg, dist, w, y, o] of [["near_b", "hero", -10, 150, 112, -24, { flip: true, blur: 2, dim: 0.74, glow: 0.05 }], ["near_g", "right", 15, 124, 74, -33, { flip: true, blur: 2, dim: 0.74, glow: 0.08 }], ["far_c", "left", 27, 190, 76, -9, { flip: true, blur: 3, dim: 0.58, glow: 0.08 }],
    ["far_d", "right", 38, 208, 72, -2, { blur: 4, dim: 0.55, glow: 0.085 }], ["far_e", "hero", 66, 236, 150, 4, { blur: 5, dim: 0.5, glow: 0.05 }], ["far_f", "left", -38, 200, 86, 0, { blur: 4, dim: 0.55, glow: 0.08 }]]) {
    const G = group("far_tables." + name + "_at"), p = place(deg, dist); G.position.set(p.x, y, p.z); G.rotation.y = p.ry; far.add(G); table(name, G, c, w, 0, 0, o); }

  const hand = reg.get("hand_open");
  function update(f, jitter, cam) {
    // ---------- section 7's hand: fingers flat, out on its sleeve, then gone for the rest of the film
    if (f >= S8.F0) { const h = S8.handAt(f); if (h.gone) hand.set.hide(); else { hand.set.fold(h.fold); hand.set.slide(h.dz); } }

    X.key.shadow.bias = S8.biasAt(f);       // the default outside this section

    // ---------- the gate
    gate.forEach((name, i) => { const k = S8.gateAt(i, f); if (k <= 0) return; const e = reg.get(name); e.set.hinge(k); e.obj.position.y += 0.1 * Math.min(1, k); });

    // ---------- the couple and their slot
    const s = S8.coupleAt(f); st.pose(s);
    slotG.visible = f >= S8.F0 && s.fade > 0.002;
    if (s.visible) {
      st.rock.rotation.z += s.lean;
      if (s.fold > 0) { st.set.fold(s.fold, 1); st.root.position.y += 0.1 * Math.min(1, s.fold); }      // down onto the fallen wall, toward the far side
      if (s.fade < 1) reg.get("couple").set.fade(s.fade);
    }
    if (slotG.visible) {
      const d = S8.slotAt(f) * S8.SLOT.len; onCloth.draw(d / S8.SLOT.wall);
      const k = Math.round(wn * Math.min(1, Math.max(0, (d - S8.SLOT.wall) / (S8.SLOT.len - S8.SLOT.wall)))); wa.geometry.setDrawRange(0, 6 * k); wb.geometry.setDrawRange(0, 6 * k);
      stop.visible = k >= wn;
      if (s.fade < 1) reg.get("couple_slot").set.fade(s.fade);
    }

    // ---------- the far tables
    let any = false;
    for (const T of tables) { const k = S8.tableAt(T.i, f), on = k > 0.004; T.m.visible = on; if (!on) continue; any = true;
      T.m.material.opacity = Math.min(1, k); T.m.material.color.setRGB(T.dim * Math.min(1.12, 0.35 + 0.65 * k), T.dim * 0.97 * Math.min(1.1, 0.3 + 0.7 * k), T.dim * 0.92 * Math.min(1.06, 0.25 + 0.75 * k));
      const g = 0.5 * k * k; T.glow.material.color.setRGB(1.0 * g, 0.6 * g, 0.24 * g); T.glow.scale.setScalar(T.gs * (0.8 + 0.25 * k)); }
    far.visible = any;
  }
  return { update };
}
