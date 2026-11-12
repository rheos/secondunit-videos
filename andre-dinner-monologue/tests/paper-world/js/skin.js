// skin.js: test 03. The same table, camera and timing as test 02, but every object is its painted cut-out from
// work/plates/, standing in its place as a card. A painted piece is never relit: it is drawn unlit and multiplied
// by one warm-to-cool tint that falls off with distance from the candle. The cloth is the only lit surface and
// the only one that takes shadows; every card casts its own silhouette onto it from the flame.
//   volumes (towers, bottle, glasses, basket, shakers, candle, redwood, sapling): the card turns about the vertical
//     axis to face the lens; a second, unseen card of the same piece faces the flame and casts the shadow
//   flats (tree man, citizens, the cutlery fence): fixed cards; you see their edge when the lens crosses their plane
// Nobody walks: standees slide along slots drawn on the cloth, rocking on twos, and turn as a card.
import { THREE, clamp, lerp, smooth, spring, hash } from "./kit.js";
import * as S from "./story.js";
import { fencePlan } from "./table.js";
import { makeRegistry } from "./skins/registry.js";
import * as K5 from "./skins/s05.js";
import * as K6 from "./skins/s06.js";
import * as K7 from "./skins/s07.js";

const PL = "work/plates/";
// test 04: the plate towers are real drums (three tiers and a cap) and the foreground glass is moved. ?t3=1 keeps test 03 as it was.
const DRUMS = !globalThis.PAPER_T3;
const named = (o, name) => { o.name = name; return o; };
const HALF = Math.PI / 2;
let REG = null;                 // the registry of the skin being built (buildSkin sets it); the makers below register what they make
// how much of the candle's light the painted pieces get: 1 while it burns as now, DARK when it is out (fl.lit, story.js)
const DARK = 0.06; let LEVEL = 1;

// ---------- plates: load, trim to the alpha box, bleed the piece's colour under the transparent pixels (clean mips)
async function image(name) { const im = new Image(); im.src = PL + name + ".png"; await im.decode(); return im; }
function alphaBox(d, w, h, x0 = 0, x1 = w - 1) {
  let a = w, b = h, c = -1, e = -1;
  for (let y = 0; y < h; y++) for (let x = x0; x <= x1; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > e) e = y; }
  return [a, b, c - a + 1, e - b + 1];
}
function cut(im, box, o = {}) {       // -> { canvas, w, h } trimmed; o.recolour = [r, g, b] repaints the saturated paper in another colour
  const src = document.createElement("canvas"); src.width = im.width; src.height = im.height; const sg = src.getContext("2d", { willReadFrequently: true }); sg.drawImage(im, 0, 0);
  const full = sg.getImageData(0, 0, im.width, im.height);
  const [bx, by, bw, bh] = box || alphaBox(full.data, im.width, im.height, o.x0 ?? 0, o.x1 ?? im.width - 1);
  const img = sg.getImageData(bx, by, bw, bh), d = img.data; let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  r /= n; g /= n; b /= n;
  if (o.recolour) {       // repaint the figure's own paper in another colour, keeping each pixel's lightness; the cream tab is a different hue and stays
    const [tr, tg, tb] = o.recolour, ch = (i) => { const sum = d[i] + d[i + 1] + d[i + 2] + 1; return [d[i] / sum, d[i + 1] / sum]; };
    let cr = 0, cg = 0, m = 0;       // the dominant paper colour: the middle of the piece
    for (let y = Math.round(bh * 0.3); y < bh * 0.7; y++) for (let x = Math.round(bw * 0.3); x < bw * 0.7; x++) { const i = (y * bw + x) * 4; if (d[i + 3] > 200) { const c = ch(i); cr += c[0]; cg += c[1]; m++; } }
    cr /= m; cg /= m; const same = (i) => { const c = ch(i); return Math.hypot(c[0] - cr, c[1] - cg) < 0.055; };
    let ref = 0; m = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && same(i)) { ref += 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; m++; }
    ref /= m;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 20 && same(i)) { const k = (0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]) / ref; d[i] = Math.min(255, tr * k); d[i + 1] = Math.min(255, tg * k); d[i + 2] = Math.min(255, tb * k); }
  }
  if (o.recolour) { r = g = b = n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; } r /= n; g /= n; b /= n; }
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] < 40) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 0; }
  const c = document.createElement("canvas"); c.width = bw; c.height = bh; c.getContext("2d").putImageData(img, 0, 0);
  return { canvas: c, w: bw, h: bh, box: [bx, by, bw, bh], data: img, mean: [r, g, b] };
}
function tex(canvas) { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; return t; }
// a soft, dark copy for a card close to the lens: blurred in the texture, drawn with soft alpha
function blurred(canvas, px, pad = Math.ceil(px * 3)) { const c = document.createElement("canvas"); c.width = canvas.width + 2 * pad; c.height = canvas.height + 2 * pad; const g = c.getContext("2d"); g.filter = `blur(${px}px)`; g.drawImage(canvas, pad, pad); return c; }

// ---------- the one tint: bright and warm within 25 cm of the candle, about 55 % and cooler at the table's far edge
const _c = new THREE.Color();
export function tintAt(x, z, gain = 1) {
  const d = Math.hypot(x - S.LAY.candle[0], z - S.LAY.candle[1]), t = smooth((d - 25) / 52), k = lerp(1, 0.55, t) * gain * LEVEL;
  return _c.setRGB(k * lerp(1.0, 0.86, t), k * lerp(0.98, 0.93, t), k * lerp(0.93, 1.05, t));
}

// ---------- cards
const distMat = new Map();
function caster(t) { if (!distMat.has(t)) distMat.set(t, new THREE.MeshDistanceMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide })); return distMat.get(t); }
const unseen = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
function plane(w, h) { const g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2, 0); return g; }       // stands on y = 0
function flatCard(t, w, h, cast = true) {
  const m = new THREE.Mesh(plane(w, h), new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, toneMapped: false }));
  if (cast) { m.castShadow = true; m.customDistanceMaterial = caster(t); }
  return m;
}
// dark-window plate wiping to its lit twin from the bottom up
function wipeMat(tDark, tLit) {
  return new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { tDark: { value: tDark }, tLit: { value: tLit }, wipe: { value: 0 }, tint: { value: new THREE.Color(1, 1, 1) }, opacity: { value: 1 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform sampler2D tDark, tLit; uniform float wipe, opacity; uniform vec3 tint; varying vec2 vUv;
      void main(){ vec4 d = texture2D(tDark, vUv), l = texture2D(tLit, vUv); float k = smoothstep(wipe * 1.08 - 0.04, wipe * 1.08 - 0.08, vUv.y);
        vec4 c = mix(d, l, k); if (c.a < 0.5) discard; gl_FragColor = vec4(c.rgb * tint, opacity); }` });
}
// the pieces are painted from about 24 degrees above. When the lens is higher than that, a volume's card leans back by the
// difference (never the shadow card), so its painted top still reads as its top. Flats never lean.
const elev = (cam, p, h) => Math.atan2(cam[1] - h * 0.4, Math.hypot(cam[0] - p.x, cam[2] - p.z));
const leanFor = (cam, p, h) => clamp(elev(cam, p, h) - 0.42, 0, 0.62) * 0.9;
// a volume: the seen card faces the lens, the unseen one faces the flame and casts the shadow
function volume(world, name, [x, z], t, w, h, mat) {
  const g = named(new THREE.Group(), name); g.position.set(x, 0, z); world.add(g);
  const face = named(new THREE.Group(), name + ".card"); face.rotation.order = "YXZ"; const show = new THREE.Mesh(plane(w, h), mat || new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, toneMapped: false }));
  face.add(show); g.add(face);
  const sh = new THREE.Mesh(plane(w, h), unseen); sh.castShadow = true; sh.customDistanceMaterial = caster(t); const shg = new THREE.Group(); shg.add(sh); g.add(shg);
  const v = { g, face, show, sh, shg, x, z, w, h, mat: show.material,
    aim(cam, light) { face.rotation.set(-leanFor(cam, g.position, h), Math.atan2(cam[0] - g.position.x, cam[2] - g.position.z), 0); shg.rotation.y = Math.atan2(light[0] - g.position.x, light[2] - g.position.z); },
    scale(sx, sy) { show.scale.set(sx, sy, 1); sh.scale.set(sx, sy, 1); },
    tint(gain = 1) { const c = tintAt(g.position.x, g.position.z, gain); if (v.mat.uniforms) v.mat.uniforms.tint.value.copy(c); else v.mat.color.copy(c); } };
  // setters for the registry: called after the owner's update (and its aim), they last that frame
  v.set = {
    tint: (gain = 1) => v.tint(gain),
    // fold(k, heading): hinge the card down about its base, 0 standing to 1 flat on the cloth, painted side up. heading
    // is the way its top comes down (radians, 0 = toward +z, the viewer; PI / 2 = toward +x): default away from the
    // candle; null = straight back from the lens. It turns from facing the lens to that heading over the first third.
    fold(k, heading) { k = clamp(k); if (k <= 0) return; const a = k * (HALF - 0.004), yc = face.rotation.y;
      const yf = heading === null ? yc : heading === undefined ? Math.atan2(S.LAY.candle[0] - g.position.x, S.LAY.candle[1] - g.position.z) : heading + Math.PI;
      const d = Math.atan2(Math.sin(yf - yc), Math.cos(yf - yc));
      face.rotation.set(face.rotation.x * (1 - k), yc + d * smooth(k / 0.35), 0); show.rotation.x = sh.rotation.x = -a; g.position.y = 0.04 * k; },
  };
  if (v.mat.uniforms && v.mat.uniforms.wipe) v.set.windows = (k) => { v.mat.uniforms.wipe.value = clamp(k); };      // 1 lit, 0 dark: goes dark from the top floor down
  if (REG) REG.add(name, g, { kind: "volume", set: v.set, it: v });
  return v;
}

// ---------- test 04: the plate towers as paper drums
// One window cell for a tier's wall, composed from the tier_wall plate: plain card (the plate's own card, from the band
// above its windows), the plate's window scaled so it is 45 % of the tier's height, the umber bands top and bottom.
// The cell repeats round the drum. The lit cell gets a warm glow inside the arch, brightest low, like the painted towers.
function tierCell(im, aspect, o = {}) {
  const W = 256, H = Math.round(W / aspect), c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d", { willReadFrequently: true });
  const sy = 48, sh = 104, dh = Math.round((sh * W) / 512);
  // each row of card comes from a different stretch of the plate's plain bands (above and below its windows), flipped
  // this way and that, so the grain does not repeat in a pattern
  for (let y = 0, j = 0; y < H; y += dh, j++) { const sx = [0, 512, 1024][(j * 2 + (o.seed || 0)) % 3], fx = (j >> 1) % 2, fy = j % 2; g.save(); g.translate(fx ? W : 0, y + (fy ? dh : 0)); g.scale(fx ? -1 : 1, fy ? -1 : 1); g.drawImage(im, sx, j % 3 === 1 ? 870 : sy, 512, sh, 0, 0, W, dh); g.restore(); }
  const bh = Math.round(0.055 * H);
  if (o.window !== false) {
    const wh = 0.45 * H, sx0 = 88, sy0 = 162, sw = 334, shh = 697, m = 14, k = wh / shh, top = H - 0.2 * H - wh;
    g.drawImage(im, sx0 - m, sy0 - m, sw + 2 * m, shh + 2 * m, (W - (sw + 2 * m) * k) / 2, top - m * k, (sw + 2 * m) * k, (shh + 2 * m) * k);
    if (o.glow) {
      const x0 = Math.floor((W - sw * k) / 2) - 2, y0 = Math.floor(top) - 2, ww = Math.ceil(sw * k) + 4, hh = Math.ceil(wh) + 4, img = g.getImageData(x0, y0, ww, hh), d = img.data;
      for (let y = 0; y < hh; y++) for (let x = 0; x < ww; x++) { const i = (y * ww + x) * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
        if (!(r > 185 && gg > 140 && b < 130 && r - b > 85)) continue;                   // only the window's yellow paper
        const t = smooth(((y - 2) / wh) * 1.1), u = (x - ww / 2) / (ww / 2), hot = smooth((y / hh - 0.45) / 0.55) * (1 - 0.5 * u * u), grain = Math.sqrt((0.3 * r + 0.59 * gg + 0.11 * b) / 205);
        const base = [lerp(224, 255, t), lerp(126, 204, t), lerp(42, 82, t)], hi = [255, 243, 198];
        for (let q = 0; q < 3; q++) d[i + q] = Math.min(255, lerp(base[q], hi[q], 0.72 * hot) * grain); }
      g.putImageData(img, x0, y0);
    }
  }
  g.drawImage(im, 0, 0, 512, 38, 0, 0, W, bh); g.drawImage(im, 0, 986, 512, 38, 0, H - bh, W, bh);
  const t = tex(c); t.wrapS = THREE.RepeatWrapping; return t;
}
// wall: unlit card times the tint, times one soft form shade (0.72 away from the flame to 1 facing it); windows wipe dark to lit
function wallMat(tDark, tLit, rep) {
  return new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms: { tDark: { value: tDark }, tLit: { value: tLit }, wipe: { value: 0 }, rep: { value: rep }, tint: { value: new THREE.Color(1, 1, 1) }, toFlame: { value: new THREE.Vector2(1, 0) }, opacity: { value: 1 } },
    vertexShader: "varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform sampler2D tDark, tLit; uniform float wipe, rep, opacity; uniform vec3 tint; uniform vec2 toFlame; varying vec2 vUv; varying vec3 vN;
      void main(){ vec2 uv = vec2(vUv.x * rep, vUv.y); float k = smoothstep(wipe * 1.12 - 0.02, wipe * 1.12 - 0.12, vUv.y);
        vec3 c = mix(texture2D(tDark, uv).rgb, texture2D(tLit, uv).rgb, k);
        float s = mix(0.72, 1.0, smoothstep(-1.0, 1.0, dot(normalize(vN.xz), toFlame)));
        gl_FragColor = vec4(c * tint * s, opacity); }` });
}
function drumTower(world, name, at, im, roofT) {
  const R = [9, 7, 5], N = [24, 18, 12], TH = 4.2, CAP = [1.6, 0.9], SEG = 72;
  const tower = named(new THREE.Group(), name + ".tower"); tower.position.set(at[0], 0, at[1]); world.add(tower);
  const flame = new THREE.Vector2(S.LAY.candle[0] - at[0], S.LAY.candle[1] - at[1]).normalize(), mats = [], tops = [];
  const plain = tierCell(im.tier_wall, 0.6, { window: false });
  const drum = (label, r, h, mat, turn) => {       // a group whose origin is the drum's top
    const g = named(new THREE.Group(), `${name}.tower.${label}`); tower.add(g);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, SEG, 1, true), mat); wall.position.y = -h / 2; wall.castShadow = true; g.add(wall); mat.uniforms.toFlame.value.copy(flame); mats.push(mat);
    // a plain sleeve below the wall, inside the drum underneath, so an overshooting tier never shows a gap
    const sm = wallMat(plain, plain, Math.round((2 * Math.PI * r) / 2.5)); sm.uniforms.toFlame.value.copy(flame); mats.push(sm);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(r - 0.01, r - 0.01, 1.1, SEG, 1, true), sm); sleeve.position.y = -h - 0.55; g.add(sleeve);
    const roof = new THREE.Mesh(new THREE.CircleGeometry(r, SEG), new THREE.MeshBasicMaterial({ map: roofT, alphaTest: 0.5, toneMapped: false })); roof.rotation.set(-Math.PI / 2, 0, turn); roof.position.y = 0.004; roof.castShadow = true; g.add(roof); tops.push(roof.material);
    const rim = new THREE.Mesh(new THREE.RingGeometry(r - 0.07, r + 0.03, SEG), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1), toneMapped: false })); rim.rotation.x = -Math.PI / 2; rim.position.y = 0.012; g.add(rim); rim.userData.rim = true; tops.push(rim.material);
    return g;
  };
  const tiers = R.map((r, k) => { const aspect = ((2 * Math.PI * r) / N[k]) / TH; return drum("tier_" + k, r, TH, wallMat(tierCell(im.tier_wall_dark, aspect, { seed: k }), tierCell(im.tier_wall, aspect, { glow: true, seed: k }), N[k]), 0.5 + k * 1.3); });
  const cap = drum("cap", CAP[0], CAP[1], wallMat(plain, plain, 4), 2.2);
  const pale = new THREE.Color(0.93, 0.85, 0.73);
  const ext = [TH, TH, TH, CAP[1]], parts = [...tiers, cap];
  const place = (ext01) => { let y = 0; parts.forEach((g, k) => { const e = ext01(k); y += ext[k] * e - (e < 0.02 ? 0.03 : 0); g.position.y = y; }); };       // each tier out of the one below
  const up = (f) => {
    const t0 = S.C.newyork1 + 3 * S.RISERS.indexOf(name), wipe = smooth((f - t0 - 12) / 22), c = tintAt(at[0], at[1]);
    // telescoping: the bottom tier comes up out of the disc, then each tier springs out of the one below, three frames apart
    place((k) => spring(f - t0 - 3 * k, 0.6, 16));
    tower.visible = f >= t0 - 1;
    mats.forEach((m) => m.uniforms.tint.value.copy(c));
    tiers.forEach((g, k) => { g.children[0].material.uniforms.wipe.value = clamp(wipe * 3 - k); });
    tops.forEach((m, i) => { if (i % 2) m.color.setRGB(pale.r * c.r, pale.g * c.g, pale.b * c.b); else m.color.setRGB(Math.min(1, c.r * 1.06), Math.min(1, c.g * 1.06), Math.min(1, c.b * 1.06)); });   // tops a little lighter than walls
  };
  const each = (k) => (typeof k === "function" ? k : Array.isArray(k) ? (i) => k[i] : () => k);
  up.set = {
    // telescope(k): 1 = up as built, 0 = down in its plate; a number, [tier 0, tier 1, tier 2, cap] or a function of the tier
    telescope(k) { const e = each(k); place((i) => clamp(e(i), 0, 1.2)); tower.visible = [0, 1, 2, 3].some((i) => e(i) > 0.002); },
    windows(k) { tiers.forEach((g, i) => { g.children[0].material.uniforms.wipe.value = clamp(clamp(k) * 3 - i); }); },      // 1 lit, 0 dark: the top tier goes dark first
    // fold(k, heading): tip the whole stack over about a point on its base rim, toward heading (default away from the candle), to lying on its side
    fold(k, heading) { const a = clamp(k) * HALF, h = heading === undefined ? Math.atan2(at[0] - S.LAY.candle[0], at[1] - S.LAY.candle[1]) : heading, sx = Math.sin(h), cz = Math.cos(h);
      tower.quaternion.setFromAxisAngle(new THREE.Vector3(cz, 0, -sx), a); tower.position.set(at[0] + R[0] * sx * (1 - Math.cos(a)), R[0] * Math.sin(a), at[1] + R[0] * cz * (1 - Math.cos(a))); },
  };
  if (REG) REG.add(name + ".tower", tower, { kind: "drum", set: up.set });
  return up;
}

// ---------- the table: the world every section stands on, and section 5's pieces (skins/s05.js wraps this)
export async function buildTable(X) {
  const scene = X.scene;
  const names = ["treeman", "citizen", "citizen_woman", "tower_plate", "tower_plate_dark", "tower_glass", "tower_glass_dark", "tower_bottle", "tower_bottle_dark", "basket", "saltpepper", "candle", "redwood", "sapling", "fence_trio", "plate_disc", "fg_glass", "fg_fork", "cloth", "room", ...(DRUMS ? ["tier_wall", "tier_wall_dark", "tier_roof"] : [])];
  const im = Object.fromEntries(await Promise.all(names.map(async (n) => [n, await image(n)])));
  const P = {}, one = (n, o) => { const c = cut(im[n], null, o); P[o?.as || n] = { ...c, t: tex(c.canvas) }; return P[o?.as || n]; };
  for (const n of ["treeman", "citizen", "citizen_woman", "basket", "candle", "redwood", "sapling", "plate_disc", "fg_glass", "fg_fork"]) one(n);
  one("citizen", { recolour: [52, 60, 104], as: "citizen_navy" }); one("citizen_woman", { recolour: [196, 150, 62], as: "citizen_ochre" });
  const roofT = DRUMS ? tex(cut(im.tier_roof).canvas) : null;
  for (const n of ["tower_plate", "tower_glass", "tower_bottle"]) { const lit = one(n), dk = cut(im[n + "_dark"], lit.box); P[n + "_dark"] = { ...dk, t: tex(dk.canvas) }; }
  one("saltpepper", { x0: 0, x1: 765, as: "salt" }); one("saltpepper", { x0: 766, x1: im.saltpepper.width - 1, as: "pepper" });
  one("fence_trio", { x0: 0, x1: 308, as: "knife" }); one("fence_trio", { x0: 309, x1: 620, as: "fork" }); one("fence_trio", { x0: 621, x1: im.fence_trio.width - 1, as: "spoon" });

  const world = named(new THREE.Group(), "world"); scene.add(world);
  const { hw, hd } = S.LAY.cloth, candleXZ = S.LAY.candle;

  // ---------- the room: the restaurant beyond, far behind, blurred and dimmed; a dark floor; the cloth over a table
  { const c = document.createElement("canvas"); c.width = 1536; c.height = 1024; const g = c.getContext("2d"); g.filter = "blur(12px)"; g.drawImage(im.room, -30, -30, 1596, 1084);
    const t = tex(c); t.wrapS = THREE.MirroredRepeatWrapping; t.repeat.x = 4;
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(330, 330, 345, 48, 1, true), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, color: new THREE.Color(0.5, 0.5, 0.5), toneMapped: false }));
    wall.position.y = 62; world.add(named(wall, "room_wall")); REG.add("room_wall", wall, { kind: "room" });
    // below the table the room is as far out of focus as the wall: the same picture, softer and darker
    const c2 = document.createElement("canvas"); c2.width = 768; c2.height = 512; const g2 = c2.getContext("2d"); g2.filter = "blur(16px)"; g2.drawImage(im.room, -40, -40, 848, 592); const t2 = tex(c2); t2.wrapS = t2.wrapT = THREE.MirroredRepeatWrapping; t2.repeat.set(2, 2);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshBasicMaterial({ map: t2, color: new THREE.Color(0.2, 0.19, 0.18), toneMapped: false })); floor.rotation.x = -Math.PI / 2; floor.position.y = -76; world.add(named(floor, "room_floor")); REG.add("room_floor", floor, { kind: "room" }); }
  const clothT = tex((() => {
    const W = 1536, H = 2304, c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const tw = W / 2, th = H / 3;                                   // one tile is 45 by 43 cm: the weave at a believable size
    for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) { g.save(); g.translate(i * tw + tw / 2, j * th + th / 2); g.scale(i % 2 ? -1 : 1, j % 2 ? -1 : 1); g.drawImage(im.cloth, 260, 180, 1016, 664, -tw / 2, -th / 2, tw, th); g.restore(); }
    g.globalAlpha = 0.3; g.translate(W / 2, H / 2); g.rotate(Math.PI / 2); g.drawImage(im.cloth, -H / 2, -W / 2, H, W);
    return c; })());
  // lit paper never burns out: next to the flame the cloth rolls off to white instead of clipping (and so never feeds the glow)
  const shoulder = (m) => { m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace("#include <opaque_fragment>", "#include <opaque_fragment>\ngl_FragColor.rgb = mix(gl_FragColor.rgb, 0.8 + 0.2 * (1.0 - exp(-(gl_FragColor.rgb - 0.8) / 0.2)), step(0.8, gl_FragColor.rgb));"); }; return m; };
  const clothM = shoulder(new THREE.MeshStandardMaterial({ map: clothT, roughness: 1, metalness: 0 }));
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(2 * hw, 2 * hd), clothM); cloth.rotation.x = -Math.PI / 2; cloth.receiveShadow = true; world.add(named(cloth, "cloth")); REG.add("cloth", cloth, { kind: "cloth" });
  { const skirtM = new THREE.MeshBasicMaterial({ map: clothT, color: new THREE.Color(0.11, 0.09, 0.07), toneMapped: false, side: THREE.DoubleSide });     // the cloth hangs over the table's edge, out of the candle's light
    skirtM.vertexColors = true; skirtM.color.setRGB(1, 1, 1);
    for (const [w, x, z, ry] of [[2 * hw, 0, hd, 0], [2 * hw, 0, -hd, Math.PI], [2 * hd, hw, 0, Math.PI / 2], [2 * hd, -hw, 0, -Math.PI / 2]]) { const g = new THREE.PlaneGeometry(w, 40); g.setAttribute("color", new THREE.Float32BufferAttribute([0.085, 0.065, 0.05, 0.085, 0.065, 0.05, 0.006, 0.005, 0.004, 0.006, 0.005, 0.004], 3)); const m = new THREE.Mesh(g, skirtM); m.position.set(x, -20, z); m.rotation.y = ry; world.add(m); } }

  // ---------- slots: a thin dark cut with a paler lip, along every standee's whole path
  const off = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 };
  const slotPale = shoulder(new THREE.MeshStandardMaterial({ color: "#fff7e6", roughness: 1, ...off })), slotDark = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.11, 0.075, 0.05), toneMapped: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  function ribbon(path, half, y, mat) {
    const n = Math.max(2, Math.ceil(path.len / 0.35)), pos = [], idx = [];
    for (let i = 0; i <= n; i++) { const p = path.pose((i / n) * path.len); pos.push(p.x - p.hz * half, y, p.z + p.hx * half, p.x + p.hz * half, y, p.z - p.hx * half); if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); mat.side = THREE.DoubleSide; m.receiveShadow = true; return m;
  }
  const slots = named(new THREE.Group(), "slots"); world.add(slots); REG.add("slots", slots, { kind: "slots" });
  // a slot for any section: the pale lip and the dark cut along a path (lib.js makePath), as a Group; draw(k) shows the
  // first k (0 to 1) of it, for a slot that is cut as a standee travels it (call it every frame)
  const slot = (path) => { const g = new THREE.Group(), a = ribbon(path, 0.15, 0.02, slotPale), b = ribbon(path, 0.05, 0.045, slotDark), n = a.geometry.index.count / 6; g.add(a, b);
    g.draw = (k) => { const m = Math.round(n * clamp(k)); a.geometry.setDrawRange(0, 6 * m); b.geometry.setDrawRange(0, 6 * m); }; return g; };
  for (const w of [S.TM, ...S.CITIZENS]) for (const [k, L] of w.legs.entries()) { if (w !== S.TM && k > 0) continue; slots.add(ribbon(L.path, 0.15, 0.02, slotPale), ribbon(L.path, 0.05, 0.045, slotDark)); }

  // ---------- standees: two faces of one card a millimetre apart, a pale core between them that only shows edge-on
  const figures = [];       // every standee, for the height check (PX=1)
  function standee(name, p, h) {
    const w = (h * p.w) / p.h, root = named(new THREE.Group(), name), pop = new THREE.Group(), rock = named(new THREE.Group(), name + ".card"); root.add(pop); pop.add(rock);
    const a = flatCard(p.t, w, h), b = flatCard(p.t, w, h, false); a.position.z = 0.05; b.position.z = -0.05; rock.add(a, b);
    // the core: the longest opaque run down the column through the middle of the piece
    const cx = Math.round(p.w * 0.5), d = p.data.data; let y0 = 0, y1 = 0, s = -1;
    for (let y = 0; y <= p.h; y++) { const on = y < p.h && d[(y * p.w + cx) * 4 + 3] > 200; if (on && s < 0) s = y; if (!on && s >= 0) { if (y - s > y1 - y0) { y0 = s; y1 = y; } s = -1; } }
    // the cut edge: the piece's own colour pulled toward the paper's pale core
    const ec = new THREE.Color().setRGB((p.mean[0] * 0.6 + 96) / 255, (p.mean[1] * 0.6 + 92) / 255, (p.mean[2] * 0.6 + 80) / 255, THREE.SRGBColorSpace);
    const core = new THREE.Mesh(new THREE.BoxGeometry(0.02, ((y1 - y0) / p.h) * h, 0.09), new THREE.MeshBasicMaterial({ color: ec.clone(), toneMapped: false })); core.position.y = h - ((y0 + y1) / 2 / p.h) * h; rock.add(core);
    world.add(root);
    const st = { name, root, h, pop, rock, a, b, core, pose(s) {
      root.visible = s.visible !== false; if (!root.visible) return;
      root.position.set(s.x, 0.02, s.z); root.rotation.y = s.yaw;
      const ph = (s.f * Math.PI) / 6, w = s.walk ?? 0, settle = Math.exp(-(s.rest ?? 99) / 5) * Math.cos(((s.rest ?? 0) * Math.PI) / 4);      // sliding: rocks on twos; stopped: the rock settles
      rock.rotation.z = (2.6 * Math.PI / 180) * (Math.sin(ph) * w + settle * (1 - w));
      rock.position.y = 0.1 * Math.abs(Math.sin(ph)) * w + 0.38 * (s.hop ?? 0);
      pop.rotation.x = (Math.PI / 2) * (1 - (s.pop ?? 1));
      const c = tintAt(s.x, s.z); a.material.color.copy(c); b.material.color.copy(c); core.material.color.setRGB(ec.r * c.r, ec.g * c.g, ec.b * c.b);
    } };
    // fold(k, dir): hinge the card down flat about its foot (0 standing, 1 flat); dir -1 lays it the other way
    st.set = { fold(k, dir = 1) { k = clamp(k); pop.rotation.x = dir * HALF * k; rock.rotation.z *= 1 - k; } };
    REG.add(name, root, { kind: "standee", set: st.set, it: st }); figures.push(st);
    return st;
  }
  const treeman = standee("treeman", P.treeman, 4);
  const kinds = [P.citizen, P.citizen_woman, P.citizen_navy, P.citizen_ochre];
  const citizens = S.CITIZENS.map((def, i) => standee(def.name, kinds[i % 4], i % 2 ? 3.8 : 4));

  // ---------- the place setting and the city
  const vols = [], rise = [], discs = [];
  for (const [name, at] of [["plate_far", S.LAY.plate_far], ["plate_near", S.LAY.plate_near]]) {
    const disc = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshBasicMaterial({ map: P.plate_disc.t, alphaTest: 0.5, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); disc.rotation.x = -Math.PI / 2; disc.position.set(at[0], 0.015, at[1]); disc.material.color.copy(tintAt(at[0], at[1])); world.add(named(disc, name)); discs.push({ disc, at });
    // lid(k, deg): hinge the disc up about its far edge like a lid, 0 flat to 1 open by deg degrees (its underside shows)
    REG.add(name, disc, { kind: "flat", set: { lid(k, deg = 75) { const a = (clamp(k) * deg * Math.PI) / 180; disc.rotation.x = -HALF - a; disc.position.set(at[0], 0.015 + 12 * Math.sin(a), at[1] - 12 + 12 * Math.cos(a)); disc.material.side = a > 0 ? THREE.DoubleSide : THREE.FrontSide; } } });
    if (DRUMS) { const up = drumTower(world, name, at, im, roofT); rise.push((f) => up(f)); continue; }
    const p = P.tower_plate, v = volume(world, name + ".tower", at, p.t, 24, (24 * p.h) / p.w, wipeMat(P.tower_plate_dark.t, p.t)); vols.push(v);
    rise.push((f, cam) => { const k = S.riseAt(name, f), t0 = S.C.newyork1 + 3 * S.RISERS.indexOf(name); v.g.visible = k > 0.002;
      // the card stands toward the lens by the depth of its painted plate, so that plate lies over the flat disc
      const dx = cam[0] - at[0], dz = cam[2] - at[1], dl = Math.hypot(dx, dz) || 1, e = Math.atan2(cam[1], dl), off = Math.min(6.2, 2.9 / Math.sin(Math.max(e, 0.42))); v.g.position.set(at[0] + (dx / dl) * off, 0, at[1] + (dz / dl) * off); v.scale(lerp(0.5, 1, clamp(k)), Math.max(k, 0.002)); v.mat.uniforms.wipe.value = smooth((f - t0 - 9) / 20); v.tint(); });
  }
  for (const [name, at, key, h] of [["glass_far", S.LAY.glass_far, "tower_glass", 18], ["glass_near", S.LAY.glass_near, "tower_glass", 18], ["bottle", S.LAY.bottle, "tower_bottle", 30]]) {
    const p = P[key], v = volume(world, name, at, p.t, (h * p.w) / p.h, h, wipeMat(P[key + "_dark"].t, p.t)); vols.push(v);
    rise.push((f) => { const t0 = S.C.newyork1 + 3 * S.RISERS.indexOf(name), b = spring(f - t0, 0.55, 14); v.scale(1, 1 + 0.07 * (b - clamp((f - t0) / 2)) * (f > t0 ? 1 : 0)); v.mat.uniforms.wipe.value = smooth((f - t0 - 2) / 22); v.tint(); });
  }
  for (const [name, at, key, h] of [["salt", S.LAY.salt, "salt", 9], ["pepper", S.LAY.pepper, "pepper", 9], ["basket", S.LAY.basket, "basket", 10]]) {
    const p = P[key], v = volume(world, name, at, p.t, (h * p.w) / p.h, h); vols.push(v);       // these have no dark-window plate: they are dimmed until "New York"
    v.set.windows = (k) => v.tint(lerp(0.7, 1, clamp(k)));      // 1 lit, 0 dimmed as before "New York"
    rise.push((f) => { const t0 = S.C.newyork1 + 3 * S.RISERS.indexOf(name), b = spring(f - t0, 0.55, 14); v.scale(1, 1 + 0.07 * (b - clamp((f - t0) / 2)) * (f > t0 ? 1 : 0)); v.tint(lerp(0.7, 1, smooth((f - t0) / 14))); });
  }
  // the candle: body and flame are one plate, split where the flame meets the wick so the flame can lean
  const cp = P.candle, widths = []; for (let y = 0; y < cp.h; y++) { let n = 0; for (let x = 0; x < cp.w; x++) if (cp.data.data[(y * cp.w + x) * 4 + 3] > 200) n++; widths.push(n); }
  let split = 0, peak = 0; for (let y = 0; y < cp.h * 0.45; y++) { if (widths[y] > peak) peak = widths[y]; if (peak > 20 && widths[y] < peak * 0.35) { split = y; break; } }
  let s2 = split; while (s2 < cp.h * 0.5 && widths[s2 + 1] <= widths[s2] + 2) s2++; split = Math.round((split + s2) / 2);
  const CH = 12, CW = (CH * cp.w) / cp.h, fy = CH * (1 - split / cp.h);
  const candle = named(new THREE.Group(), "candle"); candle.position.set(candleXZ[0], 0, candleXZ[1]); world.add(candle); REG.add("candle", candle, { kind: "candle" });
  const cface = new THREE.Group(); cface.rotation.order = "YXZ"; candle.add(cface);
  const body = new THREE.Mesh(new THREE.PlaneGeometry(CW, fy), new THREE.MeshBasicMaterial({ map: cp.t.clone(), alphaTest: 0.5, toneMapped: false })); body.material.map.repeat.set(1, 1 - split / cp.h); body.material.map.needsUpdate = true; body.position.y = fy / 2; cface.add(body);
  const flame = named(new THREE.Group(), "flame"); flame.position.y = fy; cface.add(flame);
  const fl = new THREE.Mesh(plane(CW, CH - fy), new THREE.MeshBasicMaterial({ map: cp.t.clone(), alphaTest: 0.5, toneMapped: false, color: new THREE.Color(1.5, 1.4, 1.2) })); fl.material.map.repeat.set(1, split / cp.h); fl.material.map.offset.set(0, 1 - split / cp.h); fl.material.map.needsUpdate = true; flame.add(fl);
  const flameY = fy + (CH - fy) * 0.5;
  const glowT = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: new THREE.Color(1.0, 0.62, 0.25), blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); glow.scale.set(8.5, 8.5, 1); glow.position.set(0, flameY, 0); candle.add(glow);
  // the sapling and the redwood behind it
  const sap = volume(world, "sapling", S.LAY.pot, P.sapling.t, (7 * P.sapling.w) / P.sapling.h, 7); vols.push(sap);
  const red = volume(world, "redwood", [S.LAY.pot[0] + 1.0, S.LAY.pot[1] - 1.3], P.redwood.t, (45 * P.redwood.w) / P.redwood.h, 45); vols.push(red);
  rise.push((f) => { const { tier } = S.treeAt(f), up = spring(f - S.C.redwoods, 0.6, 18), down = smooth((f - S.C.redwoods + 1) / 10);
    sap.scale(1 + 0.07 * tier, 1 + 0.2 * tier); sap.show.rotation.x = sap.sh.rotation.x = (Math.PI / 2) * 0.985 * down; sap.tint();         // springs a tier, then folds down toward the lens
    red.g.visible = f >= S.C.redwoods - 1; red.show.rotation.x = red.sh.rotation.x = -(Math.PI / 2) * (1 - up); red.tint(); });           // hinges up from behind
  // real tableware close to the lens in the first leg: soft and dark
  const fg = [];
  for (const [name, key, at, w, y, dim, px] of [["fg_glass", "fg_glass", DRUMS ? [7, -10] : [0.6, -10.2], DRUMS ? 9.4 : 10.4, 0, 0.3, 5], ["fg_fork", "fg_fork", [9, -38], 17, 0.3, 0.34, 6]]) {
    const p = P[key], c = blurred(p.canvas, px), t = tex(c), h = (w * p.h) / p.w, sw = (w * c.width) / p.w, sh = (h * c.height) / p.h;
    const g = named(new THREE.Group(), name); g.position.set(at[0], y, at[1]); world.add(g);
    const m = new THREE.Mesh(plane(sw, sh), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(dim, dim * 0.94, dim * 0.86) })); m.position.y = -(sh - h) / 2; m.renderOrder = 10; g.add(m); g.userData.until = name === "fg_glass" ? (DRUMS ? 1826 : 1846) : 1932; g.userData.dim = dim; g.userData.card = m; fg.push(g); REG.add(name, g, { kind: "lens" });      // test 04: the glass stands 8 cm to the right of the lens's path, at the frame's right edge, and is out by f1822
  }

  // ---------- the fence: the same deal as test 02, with the painted knife, fork and spoon
  const plan = fencePlan(), FH = { knife: 20, fork: 19, spoon: 18 };
  const postObjs = [], posts = plan.posts.map((Q) => {
    const p = P[Q.kind], h = FH[Q.kind], G = named(new THREE.Group(), Q.name), H = named(new THREE.Group(), Q.name + ".hinge"); G.add(H); world.add(G); G.userData.kind = Q.kind;
    const m = flatCard(p.t, (h * p.w) / p.h, h); H.add(m); postObjs.push({ Q, G, H });
    // hinge(k): 0 standing, 1 flat on the cloth pointing out over the table's edge (as it was dealt), -1 flat pointing in
    REG.add(Q.name, G, { kind: "flat", set: { hinge(k) { H.rotation.x = clamp(k, -1, 1) * HALF; } }, it: { Q, G, H, card: m } });
    return (f) => { const s = Q.at(f); G.position.set(s.x, s.y, s.z); G.rotation.y = s.yaw; H.rotation.x = s.hinge; m.material.color.copy(tintAt(s.x, s.z)); };
  });

  // ---------- light: the flame lights the cloth and nothing else
  const key = named(new THREE.PointLight("#ffd9b0", 1, 0, 0.9), "key_light"); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 0.4; key.shadow.camera.far = 600; key.shadow.bias = -0.012; key.shadow.normalBias = 0.1; key.shadow.radius = 4; world.add(key);
  const bounce = named(new THREE.PointLight("#ffe0c0", 1, 0, 1.0), "bounce_light"); bounce.position.set(candleXZ[0], 46, candleXZ[1]); world.add(bounce);
  const hemi = named(new THREE.HemisphereLight("#93806c", "#3a2e26", 1), "room_fill"); scene.add(hemi);
  [treeman, ...citizens].forEach((s) => s.root.traverse((o) => (o.frustumCulled = false)));
  REG.add("key_light", key, { kind: "light" }); REG.add("bounce_light", bounce, { kind: "light" }); REG.add("room_fill", hemi, { kind: "light" });

  // what the other skins build with (see buildSkin for the rest of X)
  Object.assign(X, { world, clothT, cloth, shoulder, slotPale, slotDark, ribbon, slot, standee, treeman, citizens, postObjs, figures,
    key, bounce, hemi, candle, flame, flameY, plates: P });

  // The table's update runs first on every frame, before any section's. It sets X.now: { f, jitter, cam, L (where the
  // flame's light is in this sub-render), flame (the flame's state after every hook), fill, level (the painted pieces' share
  // of the candle's light) }.
  function update(f, jitter = [0, 0, 0], cam) {
    const flm = S.flameAt(f), lit = Math.max(0, flm.lit), on = clamp((f - S.C.newyork1 - 6) / 44);
    LEVEL = lit === 1 ? 1 : DARK + (1 - DARK) * lit;
    flame.rotation.z = -Math.atan(flm.lx * 1.4); flame.rotation.x = HALF * 0.97 * clamp(flm.hinge); flame.scale.y = flm.h;
    glow.scale.setScalar(8.5 * (0.94 + 0.12 * (flm.gain - 1) * 10)); glow.material.color.setRGB(0.8 * flm.gain * lit, 0.5 * flm.gain * lit, 0.2 * flm.gain * lit); glow.visible = lit > 0.002;
    const e = lit === 1 ? 1 : 0.1 + 0.9 * Math.min(1, lit); fl.material.color.setRGB(1.5 * e, 1.4 * e, 1.2 * e); body.material.color.setScalar(LEVEL);       // out, the flame card is plain dim paper
    const L = [candleXZ[0] + flm.lx * 1.2 + jitter[0], flameY + jitter[1], candleXZ[1] + flm.lz * 1.2 + jitter[2]];
    const fill = S.fillAt(f);       // 1 through section 5
    key.position.set(...L); key.intensity = 54 * flm.gain * lit; bounce.intensity = (20 + 6 * on) * fill * lit; hemi.intensity = (0.8 + 0.15 * on) * fill;
    X.now = { f, jitter, cam, L, flame: flm, fill, level: LEVEL };
    slotDark.color.setRGB(0.11 * LEVEL, 0.075 * LEVEL, 0.05 * LEVEL);
    discs.forEach(({ disc, at }) => { disc.material.color.copy(tintAt(at[0], at[1])); disc.material.side = THREE.FrontSide; });
    cface.rotation.set(-leanFor(cam.P, candle.position, CH), Math.atan2(cam.P[0] - candleXZ[0], cam.P[2] - candleXZ[1]), 0);
    rise.forEach((r) => r(f, cam.P)); vols.forEach((v) => v.aim(cam.P, L)); posts.forEach((p) => p(f));
    fg.forEach((g) => { const d = g.userData.dim; g.rotation.y = Math.atan2(cam.P[0] - g.position.x, cam.P[2] - g.position.z); g.visible = f < g.userData.until; g.userData.card.material.color.setRGB(d * LEVEL, d * 0.94 * LEVEL, d * 0.86 * LEVEL); });      // gone once it is behind the lens
    treeman.pose(S.treemanAt(f)); citizens.forEach((c, i) => c.pose(S.citizenAt(i, f)));
    return flm;
  }
  return { update };
}

// ---------- the film's skin: the kit X, the registry, and the ten skins. The table (skins/s05.js: this file) is built and
// updated first, because every section stands on it and sections 1 to 4 re-pose its pieces; then skins/s01.js to s04.js,
// s06.js to s10.js in section order. Each is `export async function build(X)` returning { update(f, jitter, cam) }.
// A skin (other than 5 to 7) that fails to load, to build or to update is left out and listed in S.FAILED; the rest carry on.
//
// X, the shared kit:
//   THREE, S (story.js), scene, world (the Group everything on the table hangs from), LAY (the layout, cm), PL (the plates' folder)
//   image(name)                 load work/plates/<name>.png
//   cut(image, box, o)          trim to the alpha box, bleed colour under the transparent pixels -> { canvas, w, h, box, data, mean }
//                               (o.recolour = [r, g, b] repaints the piece's own paper; o.x0, o.x1 cut a column range out of a sheet)
//   tex(canvas)                 a texture with mips
//   plate(name, o)              image + cut + tex in one: -> { canvas, w, h, box, data, mean, t }
//   blurred(canvas, px)         a pre-blurred copy, for a card close to the lens (draw it transparent, depthWrite false)
//   plane(w, h)                 a card's geometry standing on y = 0
//   flatCard(t, w, h, cast)     a flat: an unlit, alpha-tested, two-sided card that casts its own silhouette
//   volume(world, name, [x, z], t, w, h, mat)   a volume: a card that turns to the lens and a second, unseen card that faces
//                               the flame and casts the shadow. Registered under name. Call v.aim(cam.P, X.now.L) and v.tint()
//                               every frame; v.scale(sx, sy); wipeMat(tDark, tLit) as mat gives it windows (uniform wipe 0 to 1)
//   standee(name, plate, h)     a standee on a slot: two faces a millimetre apart and a core. Registered under name. Every
//                               frame: st.pose({ visible, x, z, yaw, f, walk (0 to 1), rest (frames since it stopped), hop, pop (0 flat to 1 up) })
//   tintAt(x, z, gain)          the candle tint: the one colour a painted piece is multiplied by (it follows the candle's level)
//   cast(mesh, t), caster(t), unseen   the shadow set-up: cast() makes a mesh throw its texture's silhouette on the cloth;
//                               unseen is the material of a shadow-only card
//   slot(path), ribbon(path, half, y, mat), slotPale, slotDark   the cloth-slot drawer (path: lib.js makePath)
//   shoulder(material)          for a lit material: rolls off to white near the flame instead of clipping
//   clothT, cloth               the cloth's texture and mesh (the only lit, shadow-receiving surface)
//   leanFor(cam.P, position, h) how far a volume leans back when the lens is high
//   key, bounce, hemi           the flame's light, the cloth's bounce, the room fill (set by the table every frame)
//   treeman, citizens, postObjs, plates   section 5's standees, fence posts and cut plates
//   figures                     every standee made with standee(), for the height check (PX=1 prints how tall each stands on screen)
//   reg                         the registry (skins/registry.js)
//   now                         this frame: { f, jitter, cam, L, flame, fill, level }, set by the table before your update
const STATIC = { 5: K5, 6: K6, 7: K7 };
export async function buildSkin(scene) {
  const reg = makeRegistry(); REG = reg;
  const plate = async (name, o) => { const c = cut(await image(name), null, o); return { ...c, t: tex(c.canvas) }; };
  const cast = (mesh, t) => { mesh.castShadow = true; mesh.customDistanceMaterial = caster(t); return mesh; };
  const X = { THREE, S, scene, reg, LAY: S.LAY, PL, image, cut, tex, plate, blurred, plane, flatCard, volume, wipeMat, tintAt, cast, caster, unseen, leanFor, named, now: null };
  const skins = [];
  for (const n of [5, 1, 2, 3, 4, 6, 7, 8, 9, 10]) {
    reg.section = n; const before = new Set([...(X.world ? X.world.children : []), ...scene.children]);
    const added = () => [...(X.world ? X.world.children : []), ...scene.children].filter((o) => !before.has(o) && o !== X.world);
    try {
      const mod = STATIC[n] || await import(`./skins/s${String(n).padStart(2, "0")}.js`), skin = await mod.build(X);
      if (!skin || typeof skin.update !== "function") throw new Error("build(X) must return { update(f, jitter, cam) }");
      skins.push({ n, skin, objs: added(), dead: false });
    } catch (e) { if (STATIC[n]) throw e; S.fail(n, "skin build, left out", e); const gone = added(); gone.forEach((o) => o.removeFromParent()); reg.drop(n, gone); }
  }
  reg.section = 0;
  function update(f, jitter = [0, 0, 0], cam) {
    reg.begin();
    for (const k of skins) { if (k.dead) continue; reg.section = k.n;
      try { k.skin.update(f, jitter, cam); } catch (e) { if (STATIC[k.n]) throw e; k.dead = true; S.fail(k.n, "skin update, left out from here on", e); k.objs.forEach((o) => o.removeFromParent()); reg.drop(k.n, k.objs); } }
    reg.section = 0; return X.now.flame;
  }
  return { world: X.world, update, figures: X.figures, skin: true, reg, X };
}
