// skin67.js: the painted pieces of sections 6 and 7 (the camp, the seed), added to section 5's table by buildSkin.
// Same rules as skin.js: a painted piece is never relit (unlit, times the one tint by distance from the candle); the
// cloth is the only lit, shadow-receiving surface; volumes (watchtowers, the pine) turn to the lens, flats (wall,
// guards, bricks, the head, the hands, the seed) do not. Every state is a pure function of the film frame; everything
// here is hidden before f2544, so section 5 draws exactly as it did.
// skins/s06.js builds this and runs the camp's updates (the wall, the watchtowers, the crew, the head); skins/s07.js runs
// the seed's (the open hand, the pinch hand and the seed, the pine). Every piece is in the registry (X.reg).
import { THREE, clamp, lerp, smooth } from "./kit.js";
import * as S from "./story.js";
import { tintAt } from "./skin.js";

const { S6, S7 } = S, HALF = Math.PI / 2;
const named = (o, name) => { o.name = name; return o; };
const canvasOf = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

export async function buildCamp(X) {
  const { world, image, cut, tex, plane, flatCard, caster, unseen, volume, ribbon, slotPale, slotDark, shoulder, leanFor, clothT, reg } = X;
  const names = ["brick", "wall_segment", "watchtower", "guard", "head_bare", "head_capped", "hand_open", "hand_pinch", "seed", "pine_tall", "brain"];
  const im = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await image(n)])));
  const P = {}; for (const n of ["brick", "wall_segment", "watchtower", "guard", "hand_pinch", "seed", "pine_tall"]) { const c = cut(im[n]); P[n] = { ...c, t: tex(c.canvas) }; }
  const basic = (color) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color), toneMapped: false, side: THREE.DoubleSide });
  const paint = (mat, x, z, gain = 1, base = null) => { const c = tintAt(x, z, gain); if (base) mat.color.setRGB(base.r * c.r, base.g * c.g, base.b * c.b); else mat.color.copy(c); };
  const flatPlane = (w, d) => { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-HALF); return g; };       // lies on the cloth
  const updates = [], updates7 = [], each = (k) => (typeof k === "function" ? k : Array.isArray(k) ? (i) => k[i] : () => k);

  // ================= the wall
  const WH = S6.WALL.H, wallObjs = S6.SEGS.map((s) => {
    const G = named(new THREE.Group(), "wall_" + String(s.i + 1).padStart(2, "0")); G.position.set(s.mid[0], 0, s.mid[1]); G.rotation.y = s.yaw; world.add(G);
    const H = named(new THREE.Group(), G.name + ".hinge"); G.add(H);
    const card = flatCard(P.wall_segment.t, s.w, WH); H.add(card);
    // the slit it rises through: cut along the wall line from the end nearer the first segment
    const slit = new THREE.Group(), pale = new THREE.Mesh(flatPlane(s.w, 0.34), slotPale), dark = new THREE.Mesh(flatPlane(s.w, 0.12), slotDark); pale.position.y = 0.02; dark.position.y = 0.045; pale.receiveShadow = true;
    const inner = new THREE.Group(); inner.add(pale, dark); inner.position.x = (s.from * s.w) / 2; slit.add(inner); slit.position.x = (-s.from * s.w) / 2; G.add(slit);       // local +x runs from b to a
    reg.add(G.name, G, { kind: "flat", it: { s, G, H, card, slit } });
    return { s, G, H, card, slit, inner };
  });
  // The guards have no slot up the wall's face: they come up behind the battlements (s06.js GUARD_TOP). The five strips
  // that were the slots are kept, hidden, on the face of the hero segment, and shown only once that face is turned down
  // onto the cloth in the fall (from f3357): their top ends show through the crenels of the fallen wall as two to six
  // pixels in the wides of sections 7 to 10, and those frames are the ones the later sections were built on. Delete
  // these strips and f3357 on changes by those pixels and nothing else.
  const hero = wallObjs[S6.HERO], slotPaleB = basic("#dba584"), slotDarkB = basic("#3a1e16"), oldSlots = [];
  const localX = (o, [x, z]) => (x - o.s.mid[0]) * Math.cos(o.s.yaw) - (z - o.s.mid[1]) * Math.sin(o.s.yaw);
  S6.CREW.filter((d) => d.role === "guard").forEach((d) => { const L = d.w.legs[d.w.legs.length - 1], e = L.path.at(L.path.len), x = localX(hero, e);
    const a = new THREE.Mesh(new THREE.PlaneGeometry(0.2, S6.GUARD_Y - 0.5), slotPaleB), b = new THREE.Mesh(new THREE.PlaneGeometry(0.07, S6.GUARD_Y - 0.5), slotDarkB); a.position.set(x, (S6.GUARD_Y + 0.5) / 2, 0.015); b.position.set(x, (S6.GUARD_Y + 0.5) / 2, 0.03); a.visible = b.visible = false; hero.H.add(a, b); oldSlots.push(a, b); });
  updates.push((f) => {
    paint(slotPaleB, hero.s.mid[0], hero.s.mid[1], 1, new THREE.Color("#dba584")); paint(slotDarkB, hero.s.mid[0], hero.s.mid[1], 1, new THREE.Color("#3a1e16"));
    const under = f >= S7.F0 && S7.fallAt(S6.HERO, f).a >= 0.75; for (const m of oldSlots) m.visible = under;
    for (const o of wallObjs) {
      const w = S6.wallAt(o.s.i, f), fall = f >= S7.F0 ? S7.fallAt(o.s.i, f) : { a: 0, dir: 1 };
      o.G.visible = f >= S6.F0 && w.slit > 0; if (!o.G.visible) continue;
      o.slit.scale.x = Math.max(0.001, w.slit);
      o.H.visible = w.up > 0; o.H.position.y = -WH * (1 - w.up) + 0.05 * fall.a; o.H.rotation.x = fall.dir * fall.a * (fall.dir < 0 ? HALF : HALF - 0.004);
      paint(o.card.material, o.s.mid[0], o.s.mid[1]);
    }
  });

  // ================= the watchtowers: volumes at the two corners of the front wall; they hinge up, then the lamp comes on
  const lampT = (() => { const c = canvasOf(64, 64), g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,0.4)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const TWH = 15, TWW = (TWH * P.watchtower.w) / P.watchtower.h, towers = S6.TOWERS.map((T) => {
    const v = volume(world, T.name, T.at, P.watchtower.t, TWW, TWH), lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: lampT, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    lamp.scale.set(2.6, 2.6, 1); lamp.position.set(((514 - P.watchtower.box[0]) / P.watchtower.w - 0.5) * TWW, (1 - (439 - P.watchtower.box[1]) / P.watchtower.h) * TWH, 0.1); v.show.add(lamp);
    v.set.windows = (k) => { k = clamp(k); v.tint(lerp(0.62, 1, k)); lamp.material.color.setRGB(1.0 * k, 0.58 * k, 0.22 * k); };      // the lamp: 1 on, 0 off
    return { T, v, lamp };
  });
  updates.push((f, cam, L) => towers.forEach((o, k) => { const s = S6.towerAt(k, f); o.v.g.visible = f >= o.T.t0; if (!o.v.g.visible) return;
    o.v.aim(cam.P, L); o.v.show.rotation.x = o.v.sh.rotation.x = -HALF * (1 - s.up); o.v.tint(lerp(0.62, 1, s.lamp)); o.lamp.material.color.setRGB(1.0 * s.lamp, 0.58 * s.lamp, 0.22 * s.lamp); }));

  // ================= the crew: each citizen's brick, the guard on the back of five cards, their slots outside the fence
  const BW = 1.5, BH = (BW * P.brick.h) / P.brick.w, GH = 4.15, GW = (GH * P.guard.w) / P.guard.h, slots = named(new THREE.Group(), "slots_camp"); world.add(slots); reg.add("slots_camp", slots, { kind: "slots" });
  const growing = [];           // a slot is cut as the first standee goes along it
  const grow = (L, f0 = L.fa) => { const a = ribbon(L.path, 0.15, 0.02, slotPale), b = ribbon(L.path, 0.05, 0.045, slotDark); slots.add(a, b); growing.push({ L, a, b, n: a.geometry.index.count / 6 }); };
  const front = S6.SEGS.slice(0, 4), segAtU = (u) => front.findIndex((s, k) => u >= S6.WALL_CORNERS.uB + k * s.w && u < S6.WALL_CORNERS.uB + (k + 1) * s.w);
  const crew = S6.CREW.map((d, i) => {
    const st = X.citizens[i], carried = flatCard(P.brick.t, BW, BH); carried.position.x = 1.35; st.pop.add(carried);
    const sp = S6.brickSpot(i), left = named(flatCard(P.brick.t, BW, BH), "brick_" + String(i + 1).padStart(2, "0")); left.position.set(sp.x, 0.02, sp.z); left.rotation.y = sp.yaw; world.add(left); reg.add(left.name, left, { kind: "flat" });
    Object.assign(reg.get(st.name), { role: d.role, guard: d.k });      // what this citizen is in the camp: guard (k: 0 to 4 along the wall), layer or home
    let guard = null, sign = 1, seg = -1;
    if (d.role !== "home") { d.w.legs.slice(1).forEach((L, k) => { if (d.role === "guard" || k < 2) grow(L); }); const L = d.w.legs[d.w.legs.length - 1], e = L.path.pose(L.path.len); seg = segAtU(S6.chUV([e.x, e.z])[0]); }
    if (d.role === "guard") { const L = d.w.legs[d.w.legs.length - 1], e = L.path.pose(L.path.len), along = e.hx * S.CH.t[0] + e.hz * S.CH.t[1];       // which way it faced as it arrived
      guard = flatCard(P.guard.t, GW, GH); guard.rotation.y = along < 0 ? Math.PI : 0; st.rock.add(guard); sign = along < 0 ? -1 : 1; seg = S6.HERO; }
    return { d, st, carried, left, guard, sign, seg };
  });
  grow(S6.TM_SLOT);
  updates.push((f) => {
    const on = f >= S6.F0; slots.visible = on;
    for (const g of growing) { const k = Math.round(g.n * clamp((g.L.sAt(f) + 1.7) / g.L.path.len) * (f >= g.L.fa - 2 ? 1 : 0)); g.a.geometry.setDrawRange(0, 6 * k); g.b.geometry.setDrawRange(0, 6 * k); }
    crew.forEach((c, i) => {
      const { st } = c; c.carried.visible = false; c.left.visible = false; if (c.guard) c.guard.visible = false; st.a.visible = st.b.visible = st.core.visible = true;
      if (!on) return;
      const s = S.citizenAt(i, f), tint = tintAt(s.x, s.z), fall = f >= S7.F0 && c.seg >= 0 ? S7.fallAt(c.seg, f + (c.guard ? 0 : 5)).a : 0;
      c.carried.visible = !!s.carry && s.role !== undefined; c.carried.material.color.copy(tint);
      c.left.visible = S6.delivered(i, f) && fall < 0.45; paint(c.left.material, c.left.position.x, c.left.position.z);
      // a guard on the wall rides it down; over the first three quarters of the fall it is eased to where it has always
      // lain on the fallen wall (ride = 1: the pose sections 8 to 10 are built on, computed exactly as before)
      const ride = c.guard && fall > 0 ? smooth(fall / 0.75) : 0, GT = S6.GUARD_TOP, n = S.CH.n, yaw0 = st.root.rotation.y;
      if (c.guard) { c.guard.visible = !!s.guard; st.a.visible = st.b.visible = st.core.visible = !s.guard; c.guard.material.color.copy(tint);
        if (!s.wall) st.root.position.y -= s.sink || 0;                // down through the slot it stands in
        else if (ride < 1) {                                           // behind the battlements, boots on the floor of its crenel, the card parallel to the wall
          const th = fall * (HALF - 0.004), w0 = S6.chP(s.wu, S6.WALL.off), on = -GT.back * Math.cos(th) + s.wy * Math.sin(th), oy = s.wy * Math.cos(th) + GT.back * Math.sin(th);
          const out = S6.GUARD_Y * Math.sin(th) + 0.55 * Math.cos(th) - 0.55, y = Math.max(0.12, S6.GUARD_Y * Math.cos(th) - 0.55 * Math.sin(th));      // where it lay before, at this angle
          const yawW = hero.s.yaw + (c.sign < 0 ? 0 : Math.PI), dy = Math.atan2(Math.sin(yawW - yaw0), Math.cos(yawW - yaw0));
          st.root.position.set(lerp(w0[0] + n[0] * on, s.x + n[0] * out, ride), lerp(oy, y, ride), lerp(w0[1] + n[1] * on, s.z + n[1] * out, ride)); st.root.rotation.y = yaw0 + dy * (1 - ride);
        } }
      if (fall > 0 && st.root.visible) {       // the wall comes down: a guard rides it to the cloth, a bricklayer is folded flat ahead of it
        const th = fall * (HALF - 0.004), zl = [Math.sin(st.root.rotation.y), Math.cos(st.root.rotation.y)], sg = zl[0] * n[0] + zl[1] * n[1] > 0 ? 1 : -1;
        if (c.guard && ride >= 1) { const out = S6.GUARD_Y * Math.sin(th) + 0.55 * Math.cos(th) - 0.55, y = S6.GUARD_Y * Math.cos(th) - 0.55 * Math.sin(th);
          st.root.position.x += n[0] * out; st.root.position.z += n[1] * out; st.root.position.y = Math.max(0.12, y); }
        st.pop.rotation.x = sg * th; st.rock.rotation.z = 0;
      }
    });
  });

  // ================= the head
  const cb = cut(im.head_capped), box = cb.box, bb = cut(im.head_bare, box), HW = box[2], HHp = box[3], HH = S6.HEAD.h, HWc = (HH * HW) / HHp;
  const lineY = (x) => 275 - 0.219 * (x - 201);                       // the hat band's lower edge, in the box's pixels
  const visor = [[448, 188], [678, 168], [733, 223], [713, 253], [543, 238], [463, 203]];      // the peak hangs below that line: it lifts with the cap
  const inPoly = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  const part = (src, keep, recolour) => { const c = canvasOf(HW, HHp), g = c.getContext("2d"); g.drawImage(src.canvas, 0, 0); const img = g.getImageData(0, 0, HW, HHp), d = img.data;
    for (let y = 0; y < HHp; y++) for (let x = 0; x < HW; x++) { const i = (y * HW + x) * 4; if (!keep(x, y)) d[i + 3] = 0; else if (recolour && d[i + 3] > 40) { const k = 0.75 + 0.25 * ((d[i] + d[i + 1] + d[i + 2]) / 300); d[i] = recolour[0] * k; d[i + 1] = recolour[1] * k; d[i + 2] = recolour[2] * k; } }
    g.putImageData(img, 0, 0); return tex(c); };
  const isLidC = (x, y) => y < lineY(x) || inPoly(visor, x, y), isLidB = (x, y) => y < lineY(x);
  const headG = named(new THREE.Group(), "head"); headG.position.set(S6.HEAD.at[0], 0.03, S6.HEAD.at[1]); world.add(headG); reg.add("head", headG, { kind: "flat" });
  const hinge = named(new THREE.Group(), "head.hinge"); headG.add(hinge);
  const pivot = [(193 / HW - 0.5) * HWc, (1 - 275 / HHp) * HH];
  const layer = (name, body, lid, z, extra) => { const G = named(new THREE.Group(), name); G.position.z = z; hinge.add(G);
    const b = flatCard(body, HWc, HH); G.add(b); const lg = named(new THREE.Group(), name + ".lid"); lg.position.set(pivot[0], pivot[1], 0); const l = flatCard(lid, HWc, HH); l.position.set(-pivot[0], -pivot[1], 0); lg.add(l); G.add(lg);
    const mats = [b.material, l.material]; if (extra) { const e = flatCard(extra, HWc, HH, false); e.position.z = -0.06; G.add(e); mats.push(e.material); }
    return { G, lg, mats }; };
  const capped = layer("head.capped", part(cb, (x, y) => !isLidC(x, y)), part(cb, isLidC), 0.15);
  const bare = layer("head.bare", part(bb, (x, y) => !isLidB(x, y)), part(bb, isLidB), -0.15);
  // the hollow under the crown. No dark card stands where the crown was: with the lid up, the head is cut clean along
  // the band line and the room shows through the gap. What is inside is an inner wall of darker card, bowed back behind
  // the cut like the far side of a bowl (a strip fixed at both ends of the cut that bows as the lid lifts, 6.5 cm deep
  // at the middle, its edge 0.9 cm above the cut), darker toward the bottom; and the pale core of the card shows as a
  // rim along the three cut edges (the head's, the lid's, the inner wall's). Looking down into it the wall is a dark
  // lens between two pale rims; from eye height it is a sliver.
  const HOL = { D: 6.5, rise: 0.9, deep: 7.5, rim: 7, n: 28 }, A8 = (d, x, y) => (x < 0 || y < 0 || x >= HW || y >= HHp ? 0 : d[(Math.round(y) * HW + Math.round(x)) * 4 + 3]);
  const rimOf = (onLid) => { const c = canvasOf(HW, HHp), g = c.getContext("2d"), img = g.createImageData(HW, HHp), d = cb.data.data, o = img.data;       // the cut edge of the capped layer: of its lid, or of what stays
    for (let x = 0; x < HW; x++) for (let y = 1; y < HHp - 1; y++) { if (A8(d, x, y) < 128 || isLidC(x, y) !== onLid) continue; const yn = onLid ? y + 1 : y - 1;
      if (A8(d, x, yn) < 128 || isLidC(x, yn) === onLid) continue; for (let q = 0; q < HOL.rim; q++) { const yy = onLid ? y - q : y + q; if (A8(d, x, yy) < 128 || isLidC(x, yy) !== onLid) break; const i = (yy * HW + x) * 4; o[i] = o[i + 1] = o[i + 2] = o[i + 3] = 255; } }
    g.putImageData(img, 0, 0); return tex(c); };
  const rimM = [], rimBody = flatCard(rimOf(false), HWc, HH, false), rimLid = flatCard(rimOf(true), HWc, HH, false); rimBody.position.z = 0.03; rimLid.position.set(-pivot[0], -pivot[1], 0.03); capped.G.add(rimBody); capped.lg.add(rimLid); rimM.push(rimBody.material, rimLid.material);
  let xa = 0, xb = HW - 1; while (xa < HW && A8(bb.data.data, xa, lineY(xa) + 4) < 128) xa++; while (xb > xa && A8(bb.data.data, xb, lineY(xb) + 4) < 128) xb--;       // the two ends of the cut, in the box's pixels
  const cutP = (u) => { const x = lerp(xa, xb, u); return [(x / HW - 0.5) * HWc, (1 - lineY(x) / HHp) * HH]; };
  const wallG = new THREE.BufferGeometry(), rimG = new THREE.BufferGeometry(), wIdx = [], wCol = [], cTop = new THREE.Color("#2a2233"), cBot = new THREE.Color("#060508");
  for (let i = 0; i <= HOL.n; i++) { wCol.push(cTop.r, cTop.g, cTop.b, cBot.r, cBot.g, cBot.b); if (i < HOL.n) { const a = i * 2; wIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  for (const g of [wallG, rimG]) { g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array((HOL.n + 1) * 6), 3)); g.setIndex(wIdx); } wallG.setAttribute("color", new THREE.Float32BufferAttribute(wCol, 3));
  const wallM = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, side: THREE.DoubleSide }), rimWM = basic("#ffffff"); rimM.push(rimWM);
  const hollow = new THREE.Group(), hWall = new THREE.Mesh(wallG, wallM), hRim = new THREE.Mesh(rimG, rimWM); hWall.frustumCulled = hRim.frustumCulled = false; hollow.add(hWall, hRim); hinge.add(hollow);
  const bow = (k) => { const pw = wallG.attributes.position, pr = rimG.attributes.position;       // k: how far the lid is open, 0 to 1
    for (let i = 0; i <= HOL.n; i++) { const th = (Math.PI * i) / HOL.n, [x, y] = cutP((1 - Math.cos(th)) / 2), sn = Math.sin(th), z = -0.34 - HOL.D * sn * k, top = y + HOL.rise * sn * k;
      pw.setXYZ(i * 2, x, top, z); pw.setXYZ(i * 2 + 1, x, top - HOL.deep * (0.25 + 0.75 * sn), z); pr.setXYZ(i * 2, x, top, z + 0.03); pr.setXYZ(i * 2 + 1, x, top - 0.24 * Math.min(1, 4 * sn), z + 0.03); }
    pw.needsUpdate = pr.needsUpdate = true; };
  // its back is the cloth it was cut from: lying face down it is the tablecloth; lit, like the cloth
  { const g = new THREE.PlaneGeometry(HWc, HH, 8, 8); g.translate(0, HH / 2, 0); const pos = g.attributes.position, uv1 = [], { hw, hd } = S.LAY.cloth;
    for (let i = 0; i < pos.count; i++) { const wx = S6.HEAD.at[0] - pos.getX(i), wz = S6.HEAD.at[1] + pos.getY(i); uv1.push((wx + hw) / (2 * hw), (hd - wz) / (2 * hd)); }
    g.setAttribute("uv1", new THREE.Float32BufferAttribute(uv1, 2)); for (let i = 0; i < pos.count; i++) g.attributes.uv.setX(i, 1 - g.attributes.uv.getX(i));       // the card faces away: its outline is the layers' outline seen from behind
    const ac = canvasOf(HW, HHp), ag = ac.getContext("2d"), a = cb.data.data, b = bb.data.data, img = ag.createImageData(HW, HHp); for (let i = 0; i < a.length; i += 4) { const v = a[i + 3] > 127 || b[i + 3] > 127 ? 255 : 0; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; } ag.putImageData(img, 0, 0);
    const at = new THREE.CanvasTexture(ac), ct = clothT.clone(); ct.channel = 1; ct.needsUpdate = true;
    const m = new THREE.Mesh(g, shoulder(new THREE.MeshStandardMaterial({ map: ct, alphaMap: at, alphaTest: 0.5, roughness: 1, metalness: 0 }))); m.rotation.y = Math.PI; m.position.z = -0.3; m.receiveShadow = true; hinge.add(named(m, "head.back")); }
  // the band of bricks: drawn out of a slit at the back of the head, across the eyes, by the tab at its leading end
  const bandLen = 16.2, bandH = 3.6, slitX = ((275 - box[0]) / HW - 0.5) * HWc;
  const bc = canvasOf(765, 170); bc.getContext("2d").drawImage(P.wall_segment.canvas, 30, 258, 765, 170, 0, 0, 765, 170); const bandT = tex(bc); bandT.wrapS = THREE.ClampToEdgeWrapping;
  const bandGeo = new THREE.PlaneGeometry(bandLen, bandH); bandGeo.translate(bandLen / 2, 0, 0);
  const band = named(new THREE.Mesh(bandGeo, new THREE.MeshBasicMaterial({ map: bandT, toneMapped: false })), "head.band"); band.position.set(slitX, S6.HEAD.eyeY, 0.09); capped.G.add(band);
  const tabM = basic("#ead9b8"), gripM = basic("#d8c39c"), slitM = basic("#1c1310"), bandTab = new THREE.Mesh(new THREE.PlaneGeometry(0.75, bandH + 0.5), gripM), bandSlit = new THREE.Mesh(new THREE.PlaneGeometry(0.14, bandH + 0.7), slitM);
  bandTab.position.set(slitX, S6.HEAD.eyeY, 0.12); bandSlit.position.set(slitX - 0.05, S6.HEAD.eyeY, 0.07); capped.G.add(bandTab, bandSlit);
  // the pull-tab on the cloth in front of the head: one strip to each layer, each in its own slot
  const strips = [1.5, 3.3].map((dz, k) => { const g = new THREE.Group(); g.position.set(0, 0, dz); headG.add(g);
    const lip = new THREE.Mesh(flatPlane(24, 1.75), slotPale), cutL = new THREE.Mesh(flatPlane(24, 1.45), slotDark); lip.position.y = 0.0; cutL.position.y = 0.012; lip.receiveShadow = true; g.add(lip, cutL);
    const strip = new THREE.Group(), s1 = new THREE.Mesh(flatPlane(13, 1.25), tabM), s2 = new THREE.Mesh(new THREE.CircleGeometry(1.15, 24).rotateX(-HALF), tabM); s1.position.y = 0.03; s2.position.set((k ? -1 : 1) * 6.5, 0.03, 0); strip.add(s1, s2); g.add(strip);
    return { g, strip, k }; });
  // the brain (s06.js BRAIN): the painted plate and nothing else, standing in the hollow behind the bare layer, its long
  // axis along the skull's cut, so its dome shows above the rim once the crown is up. It is cut in two in code along its
  // groove: `brain` is what stays, `brain_lobe` the frontal lobe. The two are the same pixels of the same plate, the lobe
  // two pixels under the other's edge, so there is no gap until the lobe moves. The brain rides the hollow's inner wall:
  // it stands off 1.2 cm behind the face as the lid lifts and is pressed flat between the layers when the crown shuts,
  // so it folds away inside the head. The lobe, once out, lies on the cloth where the head's flap comes down on it.
  const br = cut(im.brain), BK = S6.BRAIN.len / br.w, BWc = S6.BRAIN.len, BHc = br.h * BK, TILT = Math.atan(0.219);      // TILT: the slope of the skull's cut (lineY)
  // the groove from the top down, in the plate's pixels: the lobe's own edge of the dark fold between it and the rest
  const GROOVE = [[926, 10], [932, 40], [948, 60], [965, 80], [976, 100], [977, 120], [974, 140], [966, 160], [959, 180], [957, 200], [959, 220], [965, 240], [976, 260], [990, 280], [998, 300], [1001, 320], [1000, 340], [999, 360],
    [996, 380], [990, 400], [983, 420], [978, 440], [973, 460], [969, 480], [966, 500], [968, 520], [975, 540], [981, 560], [990, 580], [994, 600], [996, 620], [995, 640], [992, 660], [985, 690], [980, 720]].map(([x, y]) => [x - br.box[0], y - br.box[1]]);
  const cutX = (y) => { const G = GROOVE; if (y <= G[0][1]) return G[0][0]; for (let i = 1; i < G.length; i++) if (y <= G[i][1]) return lerp(G[i - 1][0], G[i][0], (y - G[i - 1][1]) / (G[i][1] - G[i - 1][1])); return G[G.length - 1][0]; };
  const lobeBox = [1e9, -1e9, 1e9];       // the lobe's first and last row and its leftmost pixel
  const bpart = (keep, white) => { const c = canvasOf(br.w, br.h), g = c.getContext("2d"), img = g.createImageData(br.w, br.h), src = br.data.data, d = img.data;
    for (let y = 0; y < br.h; y++) { const cx = cutX(y); for (let x = 0; x < br.w; x++) { const i = (y * br.w + x) * 4, on = keep(x, cx) && (!white || src[i + 3] > 127);
      d[i] = white ? 255 : src[i]; d[i + 1] = white ? 255 : src[i + 1]; d[i + 2] = white ? 255 : src[i + 2]; d[i + 3] = on ? (white ? 255 : src[i + 3]) : 0;
      if (!white && on && x > cx && src[i + 3] > 127) { lobeBox[0] = Math.min(lobeBox[0], y); lobeBox[1] = Math.max(lobeBox[1], y); lobeBox[2] = Math.min(lobeBox[2], x); } } }
    g.putImageData(img, 0, 0); return tex(c); };
  const restT = bpart((x, cx) => x <= cx), lobeT = bpart((x, cx) => x > cx - 2), brimT = bpart((x, cx) => x <= cx && x > cx - 19, true);       // the pale core along the cut, as wide as the head's rims
  const bC = [(S6.BRAIN.at[0] / HW - 0.5) * HWc, (1 - S6.BRAIN.at[1] / HHp) * HH];                                  // the brain's centre on the head, cm
  const vRim = ((1 - 275 / HHp) * HH + 0.219 * (bC[0] - (201 / HW - 0.5) * HWc) - bC[1]) * Math.cos(TILT);         // the skull's rim, cm above the brain's centre along the brain's own upright
  const brainG = named(new THREE.Group(), "brain"); brainG.visible = false; bare.G.add(brainG); reg.add("brain", brainG, { kind: "flat" });
  const rest = flatCard(restT, BWc, BHc), brim = flatCard(brimT, BWc, BHc, false); rest.position.y = brim.position.y = -BHc / 2; brim.position.z = 0.012; brainG.add(rest, brim); rimM.push(brim.material);
  // the dashed cut: slits along the middle of the groove, drawn from the top down
  const dashM = basic("#f4ead2"), dashG = new THREE.BufferGeometry(); let nDash = 0, nVis = 0;
  { const pts = GROOVE.filter(([, y]) => y >= 14 && y <= 668).map(([x, y]) => [(x - 12 - br.w / 2) * BK, (br.h / 2 - y) * BK]), seg = [], pos = [], idx = []; let L = 0;
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push({ a, b, s0: L, l }); L += l; }
    const at = (q) => { const g = seg.find((e) => q <= e.s0 + e.l) || seg[seg.length - 1], k = clamp((q - g.s0) / g.l); return [lerp(g.a[0], g.b[0], k), lerp(g.a[1], g.b[1], k)]; };
    for (let q = 0.08; q + 0.42 < L; q += 0.68) { const a = at(q), b = at(q + 0.42), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = (-dy / l) * 0.07, ny = (dx / l) * 0.07, o = nDash * 4;
      pos.push(a[0] - nx, a[1] - ny, 0, a[0] + nx, a[1] + ny, 0, b[0] + nx, b[1] + ny, 0, b[0] - nx, b[1] - ny, 0); idx.push(o, o + 1, o + 2, o, o + 2, o + 3); if ((a[1] + b[1]) / 2 > vRim) nVis++; nDash++; }
    dashG.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); dashG.setIndex(idx); }
  const dashes = new THREE.Mesh(dashG, dashM); dashes.position.z = 0.016; dashes.frustumCulled = false; brainG.add(dashes);
  // the lobe is its own piece in the world: it hangs where the plate has it until the cut, then turns about the line
  // where it crosses the skull's rim (its hinge) and falls. (uP, vP): that hinge on the brain, cm from its centre
  const uP = ((lobeBox[2] + br.w) / 2 - br.w / 2) * BK, vP = vRim + 0.2, dTop = (br.h / 2 - lobeBox[0]) * BK - vP, dBot = (br.h / 2 - lobeBox[1]) * BK - vP;
  const lobeG = named(new THREE.Group(), "brain_lobe"); lobeG.rotation.order = "YZX"; lobeG.visible = false; world.add(lobeG); reg.add("brain_lobe", lobeG, { kind: "flat" });
  const lobe = flatCard(lobeT, BWc, BHc); lobe.position.set(-uP, -vP - BHc / 2, 0); lobeG.add(lobe);
  updates.push((f) => {
    const h = S6.headAt(f), down = f >= S7.F0 ? S7.headDownAt(f) : 0; headG.visible = h.shown && down < 1; if (!headG.visible) return;
    hinge.rotation.x = HALF * (1 - h.up * (1 - down)); hinge.scale.z = lerp(0.04, 1, clamp(h.up * (1 - down) * 2.5));      // lying flat, the layers are pressed together
    capped.G.position.x = h.capped; bare.G.position.x = h.bare; capped.lg.rotation.z = bare.lg.rotation.z = 0.56 * h.lid * (f >= S7.F0 ? 1 - smooth((f - S7.HEAD_DOWN + 4) / 9) : 1);       // the crown shuts as the head folds away
    const open = clamp(capped.lg.rotation.z / 0.56); hollow.visible = rimBody.visible = rimLid.visible = open > 0.02; if (hollow.visible) bow(Math.min(1, open));
    const [x, z] = S6.HEAD.at, c = tintAt(x, z); [...capped.mats, ...bare.mats, band.material, wallM].forEach((m) => m.color.copy(c)); rimM.forEach((m) => paint(m, x, z, 1, new THREE.Color("#ead9b8"))); paint(tabM, x, z, 1, new THREE.Color("#ead9b8")); paint(gripM, x, z, 1, new THREE.Color("#d8c39c")); paint(slitM, x, z, 1, new THREE.Color("#1c1310"));
    const ext = Math.max(0.001, h.band) * bandLen; band.visible = h.band > 0.002; band.scale.x = ext / bandLen; bandT.repeat.x = ext / bandLen; bandT.offset.x = 1 - ext / bandLen; bandTab.position.x = slitX + ext + 0.3;
    strips.forEach((s) => { s.strip.position.x = s.k ? h.bare : h.capped; s.g.visible = h.up * (1 - down) > 0.03; });       // under the flap while it lies flat
    // the brain: seen only through the open crown (shut, it is behind the bare layer)
    const b = S6.brainAt(f), zb = -(0.07 + S6.BRAIN.depth * open); brainG.visible = open > 0.02;
    if (brainG.visible) { brainG.position.set(bC[0], bC[1], zb); brainG.rotation.z = TILT - ((S6.BRAIN.slump * Math.PI) / 180) * b.slump;
      rest.material.color.copy(tintAt(x, z)); paint(dashM, x, z, 1, new THREE.Color("#f4ead2")); brim.visible = b.parted;
      dashes.visible = b.dash > 0 && b.tip < 0.34; dashG.setDrawRange(0, 6 * (b.dash >= 1 ? nDash : Math.ceil(nVis * b.dash))); }
    lobeG.visible = f >= S6.BRAIN.t0 && h.up * (1 - down) > 0.03 && (b.parted || open > 0.02);       // on the cloth it goes under the head's flap, as the pull-tab does
    if (lobeG.visible) {
      const cs = Math.cos(TILT), sn = Math.sin(TILT), x0 = x + h.bare + bC[0] + uP * cs - vP * sn, y0 = 0.03 + bC[1] + uP * sn + vP * cs, z0 = z - 0.15 + zb - 0.02, zf = z - 0.5;
      const co = Math.cos(b.th), ys = y0 + b.lift, floor = 0.08 - Math.min(dTop * co, dBot * co);       // it never goes into the cloth: it lands on an edge and comes down flat
      const lx = x0 + S6.BRAIN.land[0] * b.side, lz = b.tip < 1 ? lerp(z0, zf, b.tip * b.tip) : zf + (S6.BRAIN.land[1] + 0.5) * b.out;
      lobeG.position.set(lx, Math.max(ys - (ys - 0.08) * b.drop, b.parted ? floor : 0), lz); lobeG.rotation.set(b.th, b.yaw, TILT * (1 - smooth(b.fall * 1.5)));
      lobe.material.color.copy(tintAt(lx, lz));
    }
  });

  // ================= the open hand
  const hp = cut(im.hand_open), HB = hp.box, k = S7.HAND.k, EXT = Math.round(46 / k), PADX = 110;
  const hc = canvasOf(hp.w + 2 * PADX, hp.h + EXT), hg = hc.getContext("2d", { willReadFrequently: true }); hg.drawImage(hp.canvas, PADX, 0);
  const fx = (px) => px - HB[0] + PADX, fy = (py) => py - HB[1];       // plate pixels -> this canvas
  { // paint the plate's own seed out: palm sampled from just below it, feathered, then the crease it sat on drawn through
    const src = hg.getImageData(0, 0, hc.width, hp.h), d = src.data, W = hc.width, dy = 104, ell = (x, y, cx, cy, a, b, rot) => { const c = Math.cos(rot), s = Math.sin(rot), u = (x - cx) * c + (y - cy) * s, v = -(x - cx) * s + (y - cy) * c; return (u * u) / (a * a) + (v * v) / (b * b); };
    const out = hg.getImageData(0, 0, hc.width, hp.h), o = out.data;
    for (let y = fy(700); y < fy(826); y++) for (let x = fx(604); x < fx(784); x++) { const e = Math.min(ell(x, y, fx(655), fy(787), 44, 38, 0), ell(x, y, fx(716), fy(750), 76, 36, -0.56)); if (e >= 1) continue;
      const m = clamp((1 - e) / 0.22), i = (y * W + x) * 4, j = ((y + dy) * W + x) * 4; for (let q = 0; q < 3; q++) o[i + q] = lerp(d[i + q], d[j + q], m); }
    hg.putImageData(out, 0, 0);
    hg.strokeStyle = "rgba(240,208,170,0.92)"; hg.lineWidth = 4.2; hg.lineCap = "round"; hg.beginPath(); hg.moveTo(fx(640), fy(752)); hg.quadraticCurveTo(fx(700), fy(772), fx(748), fy(798)); hg.stroke();
    hg.beginPath(); hg.lineWidth = 3.6; hg.moveTo(fx(700), fy(688)); hg.quadraticCurveTo(fx(750), fy(702), fx(790), fy(722)); hg.stroke(); }
  { // the sleeve runs on past the plate's lower edge, off the table: its last rows repeated, its two edges carried on straight
    const img = hg.getImageData(0, 0, hc.width, hp.h).data, W = hc.width, edge = (y) => { let a = -1, b = -1; for (let x = 0; x < W; x++) if (img[(y * W + x) * 4 + 3] > 127) { if (a < 0) a = x; b = x; } return [a, b]; };
    const N = 220, y1 = hp.h - 2, y0 = y1 - N, [a0, b0] = edge(y0), [a1, b1] = edge(y1), copy = canvasOf(W, hp.h); copy.getContext("2d").drawImage(hc, 0, 0, W, hp.h, 0, 0, W, hp.h);
    for (let r = 0; r < EXT; r++) { const tri = N - Math.abs((r % (2 * N)) - N), sy = y1 - Math.min(N - 1, tri), [sa, sb] = edge(sy), ta = a1 + ((a1 - a0) / N) * r, tb = b1 + ((b1 - b0) / N) * r; hg.drawImage(copy, sa, sy, sb - sa + 1, 1, ta, y1 + 1 + r, tb - ta + 1, 1.5); } }
  // the four fingers and the thumb, cut along their knuckle lines (plate pixels), each hinged on that line
  const FING = [
    { name: "index", poly: [[380, 300], [512, 300], [520, 560], [530, 597], [427, 608], [380, 612]], line: [[427, 608], [530, 597]], deg: 30 },
    { name: "middle", poly: [[512, 300], [645, 300], [638, 562], [635, 590], [530, 590], [520, 560]], line: [[530, 590], [635, 590]], deg: 27 },
    { name: "ring", poly: [[645, 300], [765, 300], [753, 560], [746, 586], [735, 610], [630, 603], [638, 562]], line: [[630, 603], [735, 610]], deg: 31 },
    { name: "little", poly: [[765, 300], [900, 300], [900, 656], [850, 654], [723, 630], [746, 586], [753, 560]], line: [[723, 630], [850, 654]], deg: 35 },
    { name: "thumb", poly: [[60, 560], [330, 640], [348, 728], [262, 778], [240, 806], [60, 806]], line: [[262, 778], [348, 728]], deg: 28 },
  ];
  const handG = named(new THREE.Group(), "hand_open"); handG.rotation.x = -HALF; world.add(handG);
  const local = (px, py) => [(px - 630) * k, (965 - py) * k], handMats = [];
  const piece = (canvas, x0, y0) => { const t = tex(canvas), m = new THREE.Mesh(new THREE.PlaneGeometry(canvas.width * k, canvas.height * k), new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, toneMapped: false, side: THREE.DoubleSide })); handMats.push(m.material);
    const [cx, cy] = local(x0 + canvas.width / 2, y0 + canvas.height / 2); m.userData.c = [cx, cy]; m.castShadow = true; m.customDistanceMaterial = caster(t); return m; };
  const fingers = FING.map((F) => {
    const xs = F.poly.map((p) => p[0]), ys = F.poly.map((p) => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0, c = canvasOf(w, h), g = c.getContext("2d");
    g.beginPath(); F.poly.forEach(([x, y], i) => (i ? g.lineTo(x - x0, y - y0) : g.moveTo(x - x0, y - y0))); g.closePath(); g.clip(); g.drawImage(hc, fx(x0), fy(y0), w, h, 0, 0, w, h);
    const a = local(...F.line[0]), b = local(...F.line[1]), mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const G = named(new THREE.Group(), "hand_open." + F.name); G.position.set(mid[0], mid[1], 0.02); G.rotation.z = ang; const Hn = new THREE.Group(); G.add(Hn); handG.add(G);
    const m = piece(c, x0, y0), dx = m.userData.c[0] - mid[0], dy = m.userData.c[1] - mid[1]; m.position.set(dx * Math.cos(-ang) - dy * Math.sin(-ang), dx * Math.sin(-ang) + dy * Math.cos(-ang), 0); m.rotation.z = -ang; Hn.add(m);
    return { F, Hn };
  });
  { const g = hg; g.save(); g.globalCompositeOperation = "destination-out"; for (const F of FING) { g.beginPath(); F.poly.forEach(([x, y], i) => (i ? g.lineTo(fx(x), fy(y)) : g.moveTo(fx(x), fy(y)))); g.closePath(); g.fill(); } g.restore();
    const m = piece(hc, HB[0] - PADX, HB[1]); m.position.set(m.userData.c[0], m.userData.c[1], 0); handG.add(m); }
  // what the sleeve crosses on its way in is pushed flat by the fingertips: the cutlery cards of the near fence in its path
  const under = X.postObjs.map((o) => { const s = o.Q.at(3000); return s.z > 57 && s.x > 11.5 && s.x < 39.6 ? o : null; }).filter(Boolean);
  reg.add("hand_open", handG, { kind: "flat", section: 7, set: {
    // slide(dz): where the hand is along its sleeve: 0 in place, S7.HAND.travel (72 cm) out over the near edge
    slide(dz) { handG.position.z = S7.HAND.zw + dz; const c = tintAt(S7.HAND.xc, S7.HAND.zw - 12 + dz); handMats.forEach((m) => m.color.copy(c)); },
    fold(k) { fingers.forEach((o) => { o.Hn.rotation.x = ((o.F.deg * Math.PI) / 180) * k; }); },      // the fingers: 0 flat, 1 folded up round the seed
  } });
  updates7.push((f) => {
    const h = S7.handAt(f); handG.visible = f >= S7.F0 && h.shown; if (!handG.visible) return;
    handG.position.set(S7.HAND.xc, 0.075, S7.HAND.zw + h.dz);
    const c = tintAt(S7.HAND.xc, S7.HAND.zw - 12 + h.dz); handMats.forEach((m) => m.color.copy(c));
    const curl = S7.curlAt(f); fingers.forEach((o, i) => { o.Hn.rotation.x = (o.F.deg * Math.PI / 180) * h.fold(i) * curl; });
    const a = S7.fallAt(S7.UNDER[0], f).a; under.forEach((o) => { o.H.rotation.x = -a * HALF; });
  });

  // ================= the pinch hand and the seed
  const pp = P.hand_pinch, PH = S7.PINCH.h, PW = (PH * pp.w) / pp.h;
  let tipX = 0, tn = 0; for (let y = pp.h - 26; y < pp.h; y++) for (let x = 0; x < pp.w; x++) if (pp.data.data[(y * pp.w + x) * 4 + 3] > 127) { tipX += x; tn++; } tipX = (tipX / tn / pp.w - 0.5) * PW;
  const pinch = named(flatCard(pp.t, PW, PH), "hand_pinch"); pinch.geometry = pinch.geometry.clone().translate(-tipX, 0, 0); world.add(pinch);
  const sd = P.seed, SK = 5.45 / 869, SW = sd.w * SK, SH = sd.h * SK, seedG = named(new THREE.Group(), "seed"), seedT = new THREE.Group(), seed = flatCard(sd.t, SW, SH);
  seed.geometry = new THREE.PlaneGeometry(SW, SH).translate(SW / 2 - 58 * SK, SH / 2 - (sd.h - 335) * SK, 0); seedT.add(seed); seedG.add(seedT); world.add(seedG);       // its body at the origin
  reg.add("hand_pinch", pinch, { kind: "flat", section: 7 }); reg.add("seed", seedG, { kind: "flat", section: 7 });
  updates7.push((f) => {
    const p = S7.pinchAt(f), s = S7.seedAt(f), [x, z] = S7.SEED_AT, on = f >= S7.F0;
    pinch.visible = on && p.shown; pinch.position.set(x, p.y, z + 0.25); pinch.rotation.z = p.rock; paint(pinch.material, x, z);
    seedG.visible = on && s.shown; seedG.position.set(x, s.y, z); seedG.rotation.y = s.spin; seedT.rotation.x = -HALF * s.flat; seed.rotation.z = lerp(-1.9, 0.265, s.flat); paint(seed.material, x, z, 1.04);
  });

  // ================= the pine: a volume in eight tiers; 3 cm on "pine tree", 60 cm on "escape"
  const pt = P.pine_tall, NT = S7.PINE.tiers, PHt = S7.PINE.h, PWt = (PHt * pt.w) / pt.h, th = PHt / NT;
  const pineG = named(new THREE.Group(), "pine"); pineG.position.set(S7.PINE.at[0], 0.12, S7.PINE.at[1]); world.add(pineG);
  const pface = named(new THREE.Group(), "pine.card"); pface.rotation.order = "YXZ"; const pshadow = new THREE.Group(); pshadow.rotation.order = "YXZ"; pineG.add(pface, pshadow);
  const tiers = Array.from({ length: NT }, (_, i) => { const t = pt.t.clone(); t.repeat.set(1, 1 / NT); t.offset.set(0, i / NT); t.needsUpdate = true;
    const show = named(new THREE.Mesh(plane(PWt, th), new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, toneMapped: false })), "pine.tier_" + i), sh = new THREE.Mesh(plane(PWt, th), unseen); sh.castShadow = true; sh.customDistanceMaterial = new THREE.MeshDistanceMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide });
    pface.add(show); pshadow.add(sh); return { show, sh }; });
  reg.add("pine", pineG, { kind: "volume", section: 7, set: {
    // tiers(k): how far each tier is open, 1 = full, 0 = shut: a number, an array of eight (0 = the bottom tier) or a function of the tier
    tiers(k) { const e = each(k); let y = 0; tiers.forEach((o, i) => { const s = Math.max(0.0005, e(i)); for (const m of [o.show, o.sh]) { m.scale.set(s, s, 1); m.position.y = y; } y += th * s; }); },
    // fold(k, heading): lay the tree down about its foot, 0 standing to 1 flat, painted side up; its top comes down toward
    // heading (radians, 0 = toward +z; default away from the candle; null = straight back from the lens)
    fold(k, heading) { k = clamp(k); if (k <= 0) return; const a = k * (HALF - 0.004), yc = pface.rotation.y, [px, pz] = S7.PINE.at;
      const yf = heading === null ? yc : heading === undefined ? Math.atan2(S.LAY.candle[0] - px, S.LAY.candle[1] - pz) : heading + Math.PI, d = Math.atan2(Math.sin(yf - yc), Math.cos(yf - yc));
      pface.rotation.set(pface.rotation.x * (1 - k) - a, yc + d * smooth(k / 0.35), 0); pshadow.rotation.x = -a; pineG.position.y = 0.12 + 0.04 * k; },
  } });
  updates7.push((f, cam, L) => {
    const p = S7.pineAt(f); pineG.visible = f >= S7.F0 && p.shown; if (!pineG.visible) return;
    const c = tintAt(S7.PINE.at[0], S7.PINE.at[1], 1.03); let y = 0;
    tiers.forEach((o, i) => { const s = Math.max(0.0005, S7.PINE.tiny * p.tiny + (1 - S7.PINE.tiny) * p.tier(i)); for (const m of [o.show, o.sh]) { m.scale.set(s, s, 1); m.position.y = y; } y += th * s; o.show.material.color.copy(c); });
    pface.rotation.set(-leanFor(cam.P, pineG.position, y), Math.atan2(cam.P[0] - pineG.position.x, cam.P[2] - pineG.position.z), 0); pshadow.rotation.y = Math.atan2(L[0] - pineG.position.x, L[2] - pineG.position.z);
  });

  return { update6(f, cam, L) { for (const u of updates) u(f, cam, L); }, update7(f, cam, L) { for (const u of updates7) u(f, cam, L); } };
}
