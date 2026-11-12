// skins/s09.js: the painted pieces of section 9, the last burst (js/sections/s09.js holds every state as a function of f).
//   the burst   fourteen half-disc leaves cut from the two halves of the `burst` plate, each hinged on the stem's axis, so
//               the ball is real geometry from every side; unlit and never tinted by the candle. Under it a cross of card
//               strips in three telescoping sections, cut from the plate's own stem; a slot in the cloth it rises through;
//               three small coloured lights that put its colour on the cloth, and a share of it on the towers' tint.
//   the robots  forty standees, each with the `robot` plate on its back: three new ranks of eight on three new slots, and
//               one in the place of each of the sixteen citizens of sections 5 and 6, whose own cards are hidden from
//               f3840 to the end of the film (a bricklayer's carried brick stays, and fades with the robots).
// Everything is hidden before f3840. After f4315: the robots fall on "nobody" and fade with their slots from "erased".
import { clamp, lerp } from "../kit.js";
import { makePath } from "../sections/lib.js";
import * as S5 from "../sections/s05.js";
import * as S6 from "../sections/s06.js";
import * as S9 from "../sections/s09.js";

const HALF = Math.PI / 2, { C, BURST, F0 } = S9;
const canvasOf = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

export async function build(X) {
  const { THREE, world, reg, tintAt, flatCard, standee, slot } = X;
  const img = await X.image("burst"), robotP = await X.plate("robot"), guardP = await X.plate("guard");
  const kinds = [X.plates.citizen, X.plates.citizen_woman, X.plates.citizen_navy, X.plates.citizen_ochre];
  const [bx, bz] = BURST.at, dir = [Math.cos(BURST.th0), -Math.sin(BURST.th0)];      // the way the shut pack points from the stem

  // ================= the burst
  // the plate: the ball is x 58 to 965 about the axis x 511, y 12 to 850; its stem is x 468 to 534 below y 856
  const flip = (cv) => { const c = canvasOf(cv.width, cv.height), g = c.getContext("2d"); g.translate(cv.width, 0); g.scale(-1, 1); g.drawImage(cv, 0, 0); return c; };
  const tR = X.tex(X.cut(img, [511, 12, 458, 840]).canvas), tL = X.tex(flip(X.cut(img, [53, 12, 458, 840]).canvas));
  const burstG = new THREE.Group(); burstG.position.set(bx, 0, bz); burstG.visible = false; world.add(burstG);
  const ball = new THREE.Group(); burstG.add(ball);
  const leafGeo = new THREE.PlaneGeometry(BURST.R, BURST.H); leafGeo.translate(BURST.R / 2, 0, 0);       // the axis is its inner edge
  const leaves = Array.from({ length: BURST.N }, (_, i) => {
    const G = new THREE.Group(), m = new THREE.Mesh(leafGeo, new THREE.MeshBasicMaterial({ map: i % 2 ? tL : tR, alphaTest: 0.5, side: THREE.DoubleSide, toneMapped: false }));
    m.material.color.setScalar(i % 2 ? 0.93 : 1.04); m.frustumCulled = false; X.cast(m, i % 2 ? tL : tR); G.add(m); ball.add(G); return { G, m };
  });
  // the stem: two strips crossed, in the paper of the plate's own stem; one piece for each telescoping section and the spine
  const stemCanvas = X.cut(img, [470, 862, 62, 128]).canvas, stemG = new THREE.Group(); stemG.rotation.y = BURST.th0; burstG.add(stemG);
  const stemMats = [];
  const strip = (w, shade = 1) => {
    const t = X.tex(stemCanvas); t.wrapT = THREE.MirroredRepeatWrapping; const mat = new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide, toneMapped: false }); stemMats.push([mat, shade]);
    const g = new THREE.Group(), geo = new THREE.PlaneGeometry(w, 1); geo.translate(0, 0.5, 0);
    for (const ry of [0, HALF]) { const m = new THREE.Mesh(geo, mat); m.rotation.y = ry; m.castShadow = true; m.frustumCulled = false; g.add(m); }
    stemG.add(g);
    return (bottom, len) => { g.visible = len > 0.02; g.position.y = bottom; g.scale.y = Math.max(len, 0.001); t.repeat.set(1, Math.max(len, 0.001) / (w * 2.06)); };
  };
  const sections = [0, 1, 2].map((k) => strip(BURST.widths[k], 1 - 0.07 * (2 - k))), spine = strip(BURST.widths[3], 1.05);
  const collars = [0, 1, 2].map((k) => { const w = BURST.widths[k] + 0.45, mat = new THREE.MeshBasicMaterial({ map: X.tex(stemCanvas), toneMapped: false }); stemMats.push([mat, 0.72]);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.42, w), mat); m.rotation.y = Math.PI / 4; stemG.add(m); return m; });
  // the slot it rises through: one cut as long as the shut pack is wide, and a short one across it for the cross of the stem
  const sl1 = slot(makePath([[bx - 1.4 * dir[0], bz - 1.4 * dir[1]], [bx + 18.3 * dir[0], bz + 18.3 * dir[1]]])), sl2 = slot(makePath([[bx + 1.4 * dir[1], bz - 1.4 * dir[0]], [bx - 1.4 * dir[1], bz + 1.4 * dir[0]]]));
  const burstSlot = new THREE.Group(); burstSlot.add(sl1, sl2); burstSlot.visible = false; world.add(burstSlot); reg.add("burst_slot", burstSlot, { kind: "slots" });
  // its colour on the cloth: three small lights under the ball, off (and out of the scene's light count) unless it is open
  const spillG = new THREE.Group(); spillG.visible = false; world.add(spillG);
  const spills = [["#ff4a78", 0.3], ["#ffae2e", 2.4], ["#27cfc0", 4.5]].map(([col, a]) => { const L = new THREE.PointLight(col, 0, 0, 1); spillG.add(L); return { L, a, c: new THREE.Color(col) }; });
  reg.add("burst", burstG, { kind: "volume" }); reg.add("burst_light", spillG, { kind: "light" });
  // the room's wall (section 5's) is 234 cm high: a lens that looks up at the ball sees its top edge and black beyond.
  // A ring above it carries the wall's top row on up into the dark, for the frames this camera looks up.
  const roomTop = await (async () => { const im = await X.image("room"), c = canvasOf(1536, 256), g = c.getContext("2d"); g.filter = "blur(12px)"; g.drawImage(im, 0, 0, im.width, 10, -30, -30, 1596, 316); g.filter = "none";
    const gr = g.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.7, "rgba(0,0,0,0.93)"); gr.addColorStop(1, "rgba(0,0,0,1)"); g.fillStyle = gr; g.fillRect(0, 0, 1536, 256);
    const t = X.tex(c); t.wrapS = THREE.MirroredRepeatWrapping; t.repeat.x = 4;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(330, 330, 300, 48, 1, true), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, color: new THREE.Color(0.5, 0.5, 0.5), toneMapped: false }));
    m.position.y = 62 + 345 / 2 + 150 - 0.5; m.visible = false; world.add(m); reg.add("room_top", m, { kind: "room" }); return m; })();
  // ... and on the towers: their owners set their tint every frame; this multiplies it for that frame
  const lit = ["glass_far", "glass_near", "bottle", "salt", "pepper", "basket", "plate_far.tower", "plate_near.tower"].filter((n) => reg.has(n)).map((n) => reg.get(n));
  const _mul = new THREE.Color(), seen = new Set();
  function spill(k, phi, hub) {
    spillG.visible = k > 0.003; if (!spillG.visible) return;
    spills.forEach((s) => { const a = s.a + 2 * phi; s.L.position.set(bx + 17 * Math.cos(a), hub - 19, bz + 17 * Math.sin(a)); s.L.intensity = 75 * k; });
    seen.clear();
    for (const e of lit) {
      const p = e.obj.position; _mul.setRGB(1, 1, 1);
      for (const s of spills) { const w = (0.5 * k) / (1 + ((p.x - s.L.position.x) ** 2 + (p.z - s.L.position.z) ** 2) / 500); _mul.r += s.c.r * w; _mul.g += s.c.g * w; _mul.b += s.c.b * w; }
      e.obj.traverse((m) => { const mat = m.material; if (!mat || seen.has(mat) || mat.colorWrite === false) return; seen.add(mat);
        if (mat.uniforms && mat.uniforms.tint) mat.uniforms.tint.value.multiply(_mul); else if (mat.color && !mat.isMeshStandardMaterial) mat.color.multiply(_mul); });
    }
  }
  function updateBurst(f, fade) {
    const b = S9.burstAt(f);
    roomTop.visible = f >= F0 && f < S9.F1;
    burstSlot.visible = b.slot > 0 && fade < 1; sl1.draw(b.slot); sl2.draw(b.slot);
    burstG.visible = b.shown; spill(b.shown ? b.glow : 0, b.phi, b.hub); if (!b.shown) return;
    const c = tintAt(bx, bz); stemMats.forEach(([m, shade]) => m.color.setRGB(c.r * shade, c.g * shade, c.b * shade));
    sections.forEach((set, k) => set(k ? b.Y[k - 1] : 0, b.Y[k] - (k ? b.Y[k - 1] : 0)));
    spine(b.bottom, BURST.spine);
    collars.forEach((m, k) => { m.visible = b.e[k] > 0.04; m.position.y = b.Y[k] - 0.1; });
    ball.position.y = b.hub;
    leaves.forEach((o, i) => { const s = S9.leafAt(i, b); o.G.rotation.y = s.ang; o.m.position.z = -s.off; });
  }

  // ================= the robots
  const RH = 4, RW = (RH * robotP.w) / robotP.h, GH = 4.15, GW = (GH * guardP.w) / guardP.h, cards = [], slots = [];
  function make(name, plate, h) {       // a standee with the robot on its back
    const st = standee(name, plate, h), robot = flatCard(robotP.t, RW, RH); robot.visible = false; st.rock.add(robot);
    st.root.visible = false; st.root.traverse((o) => (o.frustumCulled = false));
    return { st, robot, guard: null, e: reg.get(name) };
  }
  const addSlot = (name, a, b, y = 0) => { const g = slot(makePath([a, b])); g.position.y = y; g.visible = false; world.add(g); const e = reg.add(name, g, { kind: "slots" }); slots.push(e); return g; };
  // the three ranks
  const rankSlots = S9.RANKS.map((R) => {
    const g = addSlot("slot_rank_" + (R.r + 1), R.a, R.b);
    for (let j = 0; j < 8; j++) { const k = R.r * 8 + j, card = make(`rank${R.r + 1}_${j + 1}`, kinds[(k * 3 + R.r) % 4], k % 2 ? 3.8 : 4);
      cards.push({ ...card, o: S9.rankCard(R.r, j), X0: HALF - 0.004, rho: Math.PI, track: (s) => ({ x: R.x0 + j * S9.GAP + s, z: R.z, y: 0.02, yaw: 0 }) }); }
    return (f) => { g.visible = f >= R.cut; g.draw(clamp((f - R.cut) / 14)); };
  });
  // one for each citizen of sections 5 and 6. A guard or a bricklayer lies where the wall left it: its pose is read from
  // the owner's card every frame (it has not moved since f3377). A citizen who went home is folded away at the head of
  // its section 5 slot: it stands up there and slides out along that slot.
  const tCh = S5.CH.t, out = S6.GUARD_Y * Math.sin(HALF - 0.004) + 0.55 * Math.cos(HALF - 0.004) - 0.55, olds = [];
  const lyingUV = (d) => { const s = S6.citizenAt(d.i - 1, F0), [u, v] = S6.chUV([s.x, s.z]); return [u, d.role === "guard" ? v + out : v]; };
  const path0 = (i) => S5.CITIZENS[i].legs[0].path.pose(0); let nl = 0, nh = 0;
  S6.CREW.forEach((d, i) => {
    const theirs = X.citizens[i], lying = d.role !== "home", card = make("robot_c" + String(i + 1).padStart(2, "0"), kinds[i % 4], i % 2 ? 3.8 : 4), o = S9.oldCard(lying ? nl++ : 8 + nh++, lying);
    if (d.role === "guard") { const g0 = theirs.rock.children.find((m) => m !== theirs.a && m !== theirs.b && m !== theirs.core);
      card.guard = flatCard(guardP.t, GW, GH); card.guard.rotation.y = g0 ? g0.rotation.y : 0; card.guard.visible = false; card.st.rock.add(card.guard); }
    const mine = { ...card, o, theirs, their: reg.get(theirs.name), role: d.role, lying, X0: HALF - 0.004, rho: Math.PI };
    if (lying) {       // the robot faces, and slides, toward the right-hand end of the fallen wall
      mine.base = () => { const r = theirs.root, along = Math.cos(r.rotation.y) * tCh[0] - Math.sin(r.rotation.y) * tCh[1] >= 0;
        mine.X0 = theirs.pop.rotation.x; mine.rho = along ? Math.PI : 0; mine.p0 = [r.position.x, r.position.y, r.position.z, r.rotation.y]; };
      mine.track = (s) => { const [x, y, z, yaw] = mine.p0; return { x: x + tCh[0] * s, z: z + tCh[1] * s, y, yaw }; };       // along the wall, whatever way the card lay
    } else { const path = S5.CITIZENS[i].legs[0].path;
      mine.track = (s) => { const p = path.pose(Math.min(s, path.len - 1.2)); return { x: p.x, z: p.z, y: 0.02, yaw: Math.atan2(-p.hz, p.hx) }; }; }
    const s0 = lying ? S6.citizenAt(i, F0) : path0(i); mine.far = Math.hypot(s0.x + 12, s0.z - 36);       // from where section 10's camera starts
    cards.push(mine); olds.push(mine);
  });
  olds.slice().sort((a, b) => a.far - b.far).forEach((k, n) => { k.o.fall = C.nobody + 4 + Math.round(1.5 * n); });       // the nearest first
  // the slots of those by the wall, cut over the fallen bricks: one along the guards' line, one along the bricklayers'
  const wallSlots = ["guard", "layer"].map((role) => { const uv = S6.CREW.filter((d) => d.role === role).map(lyingUV), u0 = Math.min(...uv.map((p) => p[0])) - 1.2, u1 = Math.max(...uv.map((p) => p[0])) + S9.VO * 125 + 1.2, v = uv[0][1];
    return addSlot("slot_wall_" + role, S6.chP(u0, v), S6.chP(u1, v), 0.075); });

  function updateCards(f) {
    for (const k of cards) {
      const { st } = k, s = S9.cardAt(k.o, f), on = f >= F0 && s.fade < 1 && (k.lying || s.shown);
      if (!on) { st.pose({ visible: false }); continue; }
      if (k.lying) k.base();
      const up = s.up, p = k.track(s.s);
      st.pose({ visible: true, x: p.x, z: p.z, yaw: p.yaw + Math.PI * s.turn, f: s.g, walk: s.walk, rest: 99, pop: 1 });
      st.root.position.y = p.y + 0.06 * s.fall;
      st.pop.rotation.x = s.fall > 0 ? -k.X0 * s.fall : k.X0 * (1 - up);
      if (s.fall > 0) st.rock.rotation.z *= 1 - s.fall;
      const edge = s.turn > 0.4 && s.turn < 0.6, c = tintAt(p.x, p.z);
      st.a.visible = st.b.visible = !s.robot && !k.guard; if (k.guard) { k.guard.visible = !s.robot; k.guard.material.color.copy(c); }
      st.core.visible = !s.robot || edge;
      k.robot.visible = s.robot; k.robot.rotation.y = k.rho; k.robot.material.color.copy(c);
      if (s.fade > 0) k.e.set.fade(1 - s.fade);
    }
  }

  return { update(f, jitter, cam) {
    const fade = clamp((f - C.erased) / 40);
    updateBurst(f, fade);
    for (const draw of rankSlots) draw(f);
    updateCards(f);       // reads the owners' poses (base) before the lines below hide them
    wallSlots.forEach((g) => { g.visible = f >= C.beginning - 2; g.draw(clamp((f - (C.beginning - 2)) / 14)); });
    if (f >= F0) for (const k of olds) {       // sections 5 and 6's own cards: out of sight from here to the end of the film
      if (k.role === "layer") { const t = k.theirs; t.a.visible = t.b.visible = t.core.visible = false; if (fade >= 1) k.their.set.hide(); else if (fade > 0) k.their.set.fade(1 - fade); }
      else k.their.set.hide();
    }
    if (fade > 0) { for (const e of slots) e.set.fade(1 - fade); reg.get("burst_slot").set.fade(1 - fade); }
  } };
}
