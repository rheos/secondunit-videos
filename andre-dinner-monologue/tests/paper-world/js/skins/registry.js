// registry.js: every piece any skin makes, by name. X.reg.get(name) gives { name, obj, section, kind, set, it }:
//   obj      the piece's THREE object (a Group or a Mesh) in the world
//   section  the section that owns it (5 for the table as set and everything in skin.js)
//   kind     volume (turns to the lens), flat, standee, drum, slots, lens, candle, cloth, room, light, part
//   set      small named setters: hide() and fade(k) on every piece, plus what its maker gives it (fold, windows, ...)
//   it       the maker's own handle, where it has one (a volume's { g, face, show, sh, ... }, a standee's { root, pop, rock, ... })
// The rule that makes sharing safe: AN OWNER SETS EVERY ANIMATED PROPERTY OF ITS PIECES FROM SCRATCH ON EVERY FRAME.
// The registry backs the rule up: at the start of every frame (begin) it puts every registered object and everything
// under it back as it was built (position, rotation, scale, visibility) and undoes the last frame's fades. Then the
// skins' updates run in order (the table first, then sections 1 to 4, 6 to 10). So a later update may re-pose an earlier
// section's piece through obj or set, and the change lasts exactly that frame. What the registry does not put back:
// material colours and uniforms, textures, geometry draw ranges. Their owner must set those every frame.
// Names: sections 5 to 7 keep the names blocking.json has. Every other section's names are prefixed "sNN." (add does
// it), so two builders can both have a "tv". Named objects under a piece are registered too, as parts ("fence_07.hinge").
import { THREE, clamp } from "../kit.js";

export function makeRegistry() {
  const map = new Map(), snapped = new Set(), dirty = new Set(); let snap = [], ready = false;
  const record = (root) => root.traverse((o) => { if (snapped.has(o)) return; snapped.add(o);
    snap.push({ o, p: o.position.clone(), r: [o.rotation.x, o.rotation.y, o.rotation.z, o.rotation.order], s: o.scale.clone(), v: o.visible }); });
  // fade: opacity for one frame. A material shared by several meshes is never changed: the mesh draws with its own
  // copy while it fades. A ShaderMaterial fades through its own `opacity` uniform (wipeMat and wallMat have one).
  function fade(e, k) {
    k = clamp(k);
    e.obj.traverse((m) => {
      if (!m.isMesh && !m.isSprite) return;
      if (!dirty.has(m)) { dirty.add(m); m.userData.fade0 = { mat: m.material, cast: m.castShadow }; }
      const base = m.userData.fade0.mat; m.castShadow = m.userData.fade0.cast && k >= 0.5;
      if (base.colorWrite === false) return;                          // a shadow-only card
      if (base.isShaderMaterial) { if (base.uniforms.opacity) { base.uniforms.opacity.value = k; base.transparent = true; } else m.visible = k >= 0.5; return; }
      let c = m.userData.fadeMat; if (!c || c.userData.of !== base) { c = base.clone(); c.onBeforeCompile = base.onBeforeCompile; c.userData.of = base; m.userData.fadeMat = c; }
      if (c.color && base.color) c.color.copy(base.color); c.side = base.side;
      c.transparent = true; c.opacity = base.opacity * k; if (base.alphaTest > 0) c.alphaTest = Math.max(0.004, base.alphaTest * k);
      m.material = c;
    });
    if (k <= 0.002) e.obj.visible = false;
  }
  const unfade = () => { for (const m of dirty) { const z = m.userData.fade0; m.material = z.mat; m.castShadow = z.cast; if (z.mat.isShaderMaterial && z.mat.uniforms.opacity) { z.mat.uniforms.opacity.value = 1; z.mat.transparent = false; } } dirty.clear(); };
  const prefixOf = (section) => ([5, 6, 7].includes(section) || !section ? "" : `s${String(section).padStart(2, "0")}.`);

  const reg = {
    section: 0,                                                       // the section being built or updated (buildSkin sets it)
    // add(name, obj, { kind, set, it, section }): register a piece. Returns its entry.
    add(name, obj, o = {}) {
      const section = o.section ?? reg.section, pre = prefixOf(section), full = name.startsWith(pre) ? name : pre + name;
      if (map.has(full)) throw new Error(`registry: the name "${full}" is taken (section ${map.get(full).section})`);
      const { kind = "flat", set = {}, section: _s, ...info } = o;
      const e = { name: full, short: name, obj, section, kind, ...info, set }; if (!set.hide) set.hide = () => { obj.visible = false; }; if (!set.fade) set.fade = (k) => fade(e, k);       // the maker's own set object: it may add to it later
      obj.name = full; map.set(full, e); if (ready) { parts(e); record(obj); }
      return e;
    },
    get(name) { const e = map.get(name) || map.get(prefixOf(reg.section) + name); if (!e) throw new Error(`registry: no piece named "${name}" (NAMES=1 node tools/render.mjs lists them)`); return e; },
    has: (name) => map.has(name) || map.has(prefixOf(reg.section) + name),
    names: (section) => [...map.values()].filter((e) => e.kind !== "part" && (section === undefined || e.section === section)).map((e) => e.name),
    list: () => [...map.values()].map((e) => ({ name: e.name, section: e.section, kind: e.kind, of: e.of || null, set: Object.keys(e.set) })),
    // begin(): called once at the start of every frame, before any update
    begin() {
      if (!ready) { ready = true; for (const e of [...map.values()]) parts(e); for (const e of map.values()) record(e.obj); }
      unfade();
      for (const z of snap) { const o = z.o;
        if (!o.position.equals(z.p)) o.position.copy(z.p); if (!o.scale.equals(z.s)) o.scale.copy(z.s);
        if (o.rotation.x !== z.r[0] || o.rotation.y !== z.r[1] || o.rotation.z !== z.r[2] || o.rotation.order !== z.r[3]) o.rotation.set(...z.r);
        o.visible = z.v; }
    },
    // drop(section, objects): forget a section whose skin failed
    drop(section, gone = []) {
      for (const [k, e] of [...map]) if (e.section === section) map.delete(k);
      const lost = new Set(); gone.forEach((g) => g.traverse((o) => lost.add(o)));
      snap = snap.filter((z) => !lost.has(z.o)); lost.forEach((o) => { snapped.delete(o); dirty.delete(o); });
    },
  };
  // the named objects under a piece become parts, reachable by name; a part of a prefixed piece takes its prefix
  function parts(e) {
    if (e.kind === "part") return;
    e.obj.traverse((d) => { if (d === e.obj || !d.name) return;
      let n = d.name; if (e.name !== e.short && n.startsWith(e.short) && !n.startsWith(e.name)) n = e.name + n.slice(e.short.length);
      if (n !== d.name) d.name = n;
      const had = map.get(n); if (had) { if (had.obj !== d) console.warn(`registry: two objects are named "${n}"; the part under ${e.name} is not registered`); return; }
      const p = { name: n, short: n, obj: d, section: e.section, kind: "part", of: e.name }; p.set = { hide() { d.visible = false; }, fade(k) { fade(p, k); } }; map.set(n, p); });
  }
  return reg;
}
export { THREE };
