// skins/s04.js: the painted pieces of section 4, the physicist.
// The room is the `room_fold` plate cut into its four faces (each rectified out of the painting and put back on real
// geometry): a floor that flips over about its back edge, a back wall hinged on the floor, two side walls hinged on the
// back wall. The flap's two doors are cut out of the wall and hinge into the room; the `eye` plate stands behind them in
// three layers (the white, the iris on its slide, the lid), lit from behind. The television, the newspapers and the
// magazines stand flush against the back wall; each is cut out along its own outline and tips back through its hole.
// Same rules as skin.js: painted pieces are unlit, times the one tint by distance from the candle; the cloth is the only
// lit surface. Everything here is hidden before f1205 and gone by f1838; every state is a pure function of the frame.
import * as S4 from "../sections/s04.js";
import { makePath } from "../sections/lib.js";
import { THREE, clamp, lerp, smooth } from "../kit.js";

const HALF = Math.PI / 2;
const named = (o, name) => { o.name = name; return o; };
const canvasOf = (w, h) => { const c = document.createElement("canvas"); c.width = Math.round(w); c.height = Math.round(h); return c; };
const pixels = (im) => { const c = canvasOf(im.width, im.height), g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(im, 0, 0); return { w: im.width, h: im.height, d: g.getImageData(0, 0, im.width, im.height).data }; };

// the map from the unit square to a quad of the plate [top left, top right, bottom right, bottom left] (a face of the
// painted room is a plane seen in perspective, so this is exact)
function homography([p0, p1, p2, p3]) {
  const dx1 = p1[0] - p2[0], dx2 = p3[0] - p2[0], dx3 = p0[0] - p1[0] + p2[0] - p3[0], dy1 = p1[1] - p2[1], dy2 = p3[1] - p2[1], dy3 = p0[1] - p1[1] + p2[1] - p3[1];
  const den = dx1 * dy2 - dx2 * dy1, g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
  const a = p1[0] - p0[0] + g * p1[0], b = p3[0] - p0[0] + h * p3[0], c = p0[0], d = p1[1] - p0[1] + g * p1[1], e = p3[1] - p0[1] + h * p3[1], f = p0[1];
  return (s, t) => { const w = g * s + h * t + 1; return [(a * s + b * t + c) / w, (d * s + e * t + f) / w]; };
}
function rectify(src, quad, W, H) {
  const out = canvasOf(W, H), g = out.getContext("2d"), img = g.createImageData(out.width, out.height), o = img.data, d = src.d, sw = src.w, sh = src.h, map = homography(quad);
  for (let y = 0; y < out.height; y++) for (let x = 0; x < out.width; x++) {
    const [u, v] = map((x + 0.5) / out.width, (y + 0.5) / out.height), x0 = clamp(Math.floor(u - 0.5), 0, sw - 2), y0 = clamp(Math.floor(v - 0.5), 0, sh - 2), fx = clamp(u - 0.5 - x0), fy = clamp(v - 0.5 - y0), i = (y * out.width + x) * 4;
    const a = (y0 * sw + x0) * 4, b = a + 4, c = a + sw * 4, e = c + 4;
    if (d[a + 3] < 128 || d[e + 3] < 128) { if (x > 0) for (let q = 0; q < 4; q++) o[i + q] = o[i - 4 + q]; continue; }      // off the painting's edge: carry the last pixel on
    for (let q = 0; q < 3; q++) o[i + q] = (d[a + q] * (1 - fx) + d[b + q] * fx) * (1 - fy) + (d[c + q] * (1 - fx) + d[e + q] * fx) * fy;
    o[i + 3] = 255;
  }
  g.putImageData(img, 0, 0); return out;
}
// the outline of a cut-out: its alpha with the inside holes filled, traced round once (Moore), in the canvas's pixels
function outline(canvas) {
  const W = canvas.width + 2, H = canvas.height + 2, d = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canvas.width, canvas.height).data;
  const solid = new Uint8Array(W * H); for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) if (d[(y * canvas.width + x) * 4 + 3] > 127) solid[(y + 1) * W + x + 1] = 1;
  const out = new Uint8Array(W * H), stack = [0]; out[0] = 1;       // flood the outside from the padded corner
  while (stack.length) { const p = stack.pop(), x = p % W, y = (p / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const q = ny * W + nx; if (!out[q] && !solid[q]) { out[q] = 1; stack.push(q); } } }
  const at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !out[y * W + x];
  let sx = -1, sy = -1; find: for (let y = H - 1; y >= 0; y--) for (let x = 0; x < W; x++) if (at(x, y)) { sx = x; sy = y; break find; }
  const DIR = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]], pts = []; let cx = sx, cy = sy, back = 0;
  for (let n = 0; n < 200000; n++) {
    pts.push([cx - 1 + 0.5, cy - 1 + 0.5]); let moved = false;
    for (let i = 1; i <= 8; i++) { const k = (back + i) % 8, nx = cx + DIR[k][0], ny = cy + DIR[k][1]; if (at(nx, ny)) { cx = nx; cy = ny; back = (k + 5) % 8; moved = true; break; } }
    if (!moved || (cx === sx && cy === sy)) break;
  }
  return pts;
}

export async function build(X) {
  const { world, reg, image, tex, plate, plane, caster, tintAt, ribbon, slot, slotPale, slotDark, clothT, shoulder, LAY } = X;
  const { ROOM, EYE, THINGS, T, C } = S4, W = ROOM.W, H = ROOM.H, D = ROOM.D, SP = ROOM.splay, PX = 64, BW = W * PX, BH = H * PX;
  const [imRoom, imEye] = await Promise.all([image("room_fold"), image("eye")]);
  const [pTv, pNews, pMags, pPhys, pRobot] = await Promise.all(["tv", "newspapers", "magazines", "physicist", "robot"].map((n) => plate(n)));
  const basic = (o) => new THREE.MeshBasicMaterial({ toneMapped: false, ...o });
  const card = (t, side = THREE.FrontSide) => basic({ map: t, alphaTest: 0.5, side });
  const tints = [];                                                   // [material, room (lx, lz), gain, base colour]: set every frame
  const tinted = (m, at, gain = 1, base = null) => { tints.push([m, at, gain, base ? new THREE.Color(base) : null]); return m; };

  // ================= the room's faces, out of the plate (plate pixels; the quads sit a few pixels inside the paint)
  const src = pixels(imRoom), QX0 = 301, QX1 = 1231, QY0 = 52, QY1 = 661;
  const cWall = rectify(src, [[QX0, QY0], [QX1, QY0], [QX1, QY1], [QX0, QY1]], BW, BH), cWallFull = canvasOf(BW, BH); cWallFull.getContext("2d").drawImage(cWall, 0, 0);
  const LS = Math.hypot(SP, D), cLeft = rectify(src, [[88, 192], [298, 50], [298, 661], [92, 971]], LS * PX, BH), cRight = rectify(src, [[1234, 50], [1447, 192], [1443, 971], [1234, 661]], LS * PX, BH);
  const cFloor = rectify(src, [[300, 663], [1232, 663], [1443, 971], [92, 971]], 1280, 512);
  const wpx = (x) => ((x - QX0) / (QX1 - QX0)) * BW, wpy = (y) => ((y - QY0) / (QY1 - QY0)) * BH;       // plate pixel -> wall canvas pixel
  const lxOf = (x) => wpx(x) / PX - W / 2, wyOf = (y) => H - wpy(y) / PX;                              // plate pixel -> wall coordinates, cm
  const FL = { x0: lxOf(600), x1: lxOf(949), seam: lxOf(777), y0: wyOf(478), y1: wyOf(178) };          // the flap's opening

  // the flap's two doors, cut from the wall as painted; where the latch lay over them, their own card carried across
  const doorC = [[600, 777], [777, 949]].map(([a, b], k) => { const w = wpx(b) - wpx(a), h = wpy(478) - wpy(178), c = canvasOf(w, h), g = c.getContext("2d"); g.drawImage(cWall, wpx(a), wpy(178), w, h, 0, 0, c.width, c.height);
    const copy = canvasOf(c.width, c.height); copy.getContext("2d").drawImage(c, 0, 0); const lw = 44, lh = 66;
    if (k === 0) g.drawImage(copy, c.width - 2 * lw - 2, 0, lw, lh, c.width - lw, 0, lw, lh); else g.drawImage(copy, lw - 4, 0, lw - 6, lh, 0, 0, lw - 6, lh);
    return c; });
  // the wall with the opening cut, and the latch as its own small card: it hangs over the doors from a hinge on the wall above them
  cWall.getContext("2d").clearRect(wpx(600), wpy(178), wpx(949) - wpx(600), wpy(478) - wpy(178));
  const LX0 = wpx(747), LX1 = wpx(802), LY0 = wpy(153), LY1 = wpy(219), cLatch = canvasOf(LX1 - LX0, LY1 - LY0);
  { const g = cLatch.getContext("2d"), w = cLatch.width, h = cLatch.height, r = w / 2; g.beginPath(); g.rect(0, 0, w, h - r); g.arc(r, h - r, r, 0, Math.PI); g.clip(); g.drawImage(cWallFull, LX0, LY0, w, h, 0, 0, w, h); }
  // plain card for the backs: a clean stretch of the wall's own teal, tiled this way and that, a little darker
  const cPlain = (() => { const c = canvasOf(BW, BH), g = c.getContext("2d"), sx = 934, sy = 96, sw = 280, sh = 380;
    for (let j = 0; j * sh < BH; j++) for (let i = 0; i * sw < BW; i++) { g.save(); g.translate(i * sw + (i % 2 ? sw : 0), j * sh + (j % 2 ? sh : 0)); g.scale(i % 2 ? -1 : 1, j % 2 ? -1 : 1); g.drawImage(cWallFull, sx, sy, sw, sh, 0, 0, sw, sh); g.restore(); }
    g.fillStyle = "rgba(20,14,10,0.22)"; g.fillRect(0, 0, BW, BH); return c; })();

  // ================= the three things on the wall: their cards, their outlines, and the wall with 0 to 3 holes
  const things = THINGS.map((d, i) => { const p = [pTv, pNews, pMags][i], h = d.h ?? (d.w * p.h) / p.w, w = d.w ?? (d.h * p.w) / p.h;
    const c = canvasOf(w * PX, h * PX); c.getContext("2d").drawImage(p.canvas, 0, 0, c.width, c.height);
    const raw = outline(c), pts = []; for (let k = 0; k < raw.length; k += 2) { let x = 0, y = 0; for (let q = -2; q <= 2; q++) { const r = raw[(k + q + raw.length) % raw.length]; x += r[0]; y += r[1]; } pts.push([x / 5, y / 5]); }
    return { d, p, w, h, pts, x0: (d.x - w / 2 + W / 2) * PX, y0: (H - h) * PX }; });
  const wallStates = [cWall]; for (let s = 1; s <= 3; s++) { const c = canvasOf(BW, BH), g = c.getContext("2d"), th = things[s - 1]; g.drawImage(wallStates[s - 1], 0, 0);
    const path = () => { g.beginPath(); th.pts.forEach(([x, y], k) => (k ? g.lineTo(th.x0 + x, th.y0 + y) : g.moveTo(th.x0 + x, th.y0 + y))); g.closePath(); };
    g.lineJoin = "round"; path(); g.strokeStyle = "#f0e2c6"; g.lineWidth = 6.5; g.stroke(); g.strokeStyle = "rgba(120,96,70,0.5)"; g.lineWidth = 1.5; g.stroke();        // the pale cut edge
    g.globalCompositeOperation = "destination-out"; path(); g.fill(); g.lineWidth = 1; g.stroke(); g.globalCompositeOperation = "source-over"; wallStates.push(c); }
  const backStates = wallStates.map((c) => { const b = canvasOf(BW, BH), g = b.getContext("2d"); g.drawImage(cPlain, 0, 0); g.globalCompositeOperation = "destination-in"; g.drawImage(c, 0, 0); return b; });
  const wallT = wallStates.map(tex), backT = backStates.map(tex);

  // ================= the groups: room > flip (the floor, hinged on its back edge) > hinge (the back wall) > side walls
  const room = named(new THREE.Group(), "room"); room.rotation.y = ROOM.yaw; room.position.set(ROOM.at[0], 0, ROOM.at[1]); room.visible = false; world.add(room);
  const flip = named(new THREE.Group(), "room.floor"); flip.position.set(0, ROOM.y, -D / 2); room.add(flip);
  // the floor: a trapezoid, W wide at the hinge, W + 2 * splay at the front. Its top is the painted floor; its back is the
  // cloth it lay in, lit like the cloth, so face down it is the tablecloth with a cut round it
  const NU = 12, NV = 8, fpos = [], fuv = [], fuv1 = [], fidx = [], { hw, hd } = LAY.cloth;
  for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) { const s = i / NU, t = j / NV, x = (s - 0.5) * (W + 2 * SP * t), z = D * t; fpos.push(x, 0, z); fuv.push(s, 1 - t);
    const [wx, wz] = S4.loc([x, -D / 2 - z]); fuv1.push((wx + hw) / (2 * hw), (hd - wz) / (2 * hd)); }
  for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, e = c + 1; fidx.push(a, c, b, b, c, e); }
  const fgeo = new THREE.BufferGeometry(); fgeo.setAttribute("position", new THREE.Float32BufferAttribute(fpos, 3)); fgeo.setAttribute("uv", new THREE.Float32BufferAttribute(fuv, 2)); fgeo.setAttribute("uv1", new THREE.Float32BufferAttribute(fuv1, 2)); fgeo.setIndex(fidx); fgeo.computeVertexNormals();
  const floorTop = new THREE.Mesh(fgeo, tinted(basic({ map: tex(cFloor), side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }), [0, 0])); flip.add(floorTop);
  const ct = clothT.clone(); ct.channel = 1; ct.needsUpdate = true;
  const floorBack = new THREE.Mesh(fgeo, shoulder(new THREE.MeshStandardMaterial({ map: ct, roughness: 1, metalness: 0, side: THREE.DoubleSide }))); floorBack.position.y = -0.012; floorBack.receiveShadow = true; flip.add(floorBack);
  // the cut round the floor while it lies face down: drawn edge by edge from the hinge
  const corners = [[-W / 2, 0], [W / 2, 0], [W / 2 + SP, D], [-W / 2 - SP, D]];
  const cutEdges = [0, 1, 2, 3].map((k) => { const a = corners[[0, 1, 2, 0][k]], b = corners[[1, 2, 3, 3][k]], path = makePath([a, b]), pale = ribbon(path, 0.13, -0.022, slotPale), dark = ribbon(path, 0.045, -0.03, slotDark); flip.add(pale, dark); return { pale, dark, n: pale.geometry.index.count / 6 }; });

  const hinge = named(new THREE.Group(), "room.back"); hinge.position.y = 0.1; flip.add(hinge);
  const wallMats = wallT.map((t) => tinted(card(t), [0, -D / 2])), wallBackMats = backT.map((t) => tinted(card(t, THREE.BackSide), [0, -D / 2], 0.86));
  const wallF = new THREE.Mesh(plane(W, H), wallMats[0]), wallB = new THREE.Mesh(plane(W, H), wallBackMats[0]); wallF.castShadow = true; wallF.customDistanceMaterial = caster(wallT[0]); hinge.add(wallF, wallB);
  // the side walls: hinged on the back wall's two upright edges; folded they lie against its face
  const sideT = [tex(cRight), tex(cLeft)], plainSide = tex((() => { const c = canvasOf(LS * PX, BH); c.getContext("2d").drawImage(cPlain, 0, 0); return c; })());
  const sides = [1, -1].map((sg, k) => { const g = named(new THREE.Group(), "room." + (k ? "left" : "right")); g.position.set((sg * W) / 2, 0, 0.03 + 0.03 * k); hinge.add(g);
    const geo = new THREE.PlaneGeometry(LS, H); geo.translate((sg * LS) / 2, H / 2, 0); const mid = [sg * (W / 2 + SP / 2), 0];
    const inner = new THREE.Mesh(geo, tinted(basic({ map: sideT[k], side: THREE.FrontSide }), mid)), outer = new THREE.Mesh(geo, tinted(basic({ map: plainSide, side: THREE.BackSide }), mid, 0.86)); inner.castShadow = true; g.add(inner, outer);
    return { g, sg }; });
  const OPEN = Math.PI - Math.atan2(D, SP);                           // how far a side wall swings from folded to open

  // the flap's doors: hinged on their outer upright edges, they open into the room; their backs are plain card that takes the lamp
  const cardOf = (w, h, sx, sy, shade) => { const c = canvasOf(w, h), g = c.getContext("2d"); g.drawImage(cFloor, sx, sy, w, h, 0, 0, w, h); g.globalCompositeOperation = "multiply"; g.fillStyle = shade(g); g.fillRect(0, 0, w, h); return tex(c); };       // plain card off the floor's paint, shaded
  const doorGrad = [0, 1].map((k) => cardOf(256, 400, 240 + 300 * k, 60, (g) => { const gr = g.createLinearGradient(k ? 256 : 0, 0, k ? 0 : 256, 0); gr.addColorStop(0, "rgb(255,255,255)"); gr.addColorStop(0.45, "rgb(165,165,165)"); gr.addColorStop(1, "rgb(85,85,85)"); return gr; }));
  const doorBack = [0, 1].map((k) => basic({ map: doorGrad[k], side: THREE.BackSide })), doorH = FL.y1 - FL.y0;       // brightest at the hinge, by the opening
  const doors = [0, 1].map((k) => { const w = k ? FL.x1 - FL.seam : FL.seam - FL.x0, g = named(new THREE.Group(), "room.flap_" + (k ? "r" : "l")); g.position.set(k ? FL.x1 : FL.x0, FL.y0, 0.012); hinge.add(g);
    const geo = new THREE.PlaneGeometry(w, doorH); geo.translate(k ? -w / 2 : w / 2, doorH / 2, 0);
    g.add(new THREE.Mesh(geo, tinted(basic({ map: tex(doorC[k]), side: THREE.FrontSide }), [0, -D / 2])), new THREE.Mesh(geo, doorBack[k])); return { g, k }; });

  const latchW = (LX1 - LX0) / PX, latchH = (LY1 - LY0) / PX, latchG = named(new THREE.Group(), "room.latch"); latchG.position.set(lxOf(774.5), H - LY0 / PX, 0.03); hinge.add(latchG);
  { const geo = new THREE.PlaneGeometry(latchW, latchH); geo.translate(0, -latchH / 2, 0); latchG.add(new THREE.Mesh(geo, tinted(card(tex(cLatch), THREE.DoubleSide), [0, -D / 2]))); }

  // the three things and their dashed cuts
  const dashM = tinted(basic({ side: THREE.DoubleSide }), [0, -D / 2], 1, "#2e1d14");
  const thingObjs = things.map((th, i) => { const g = named(new THREE.Group(), "room." + th.d.name); g.position.set(th.d.x, 0, 0.02); hinge.add(g);
    const m = new THREE.Mesh(plane(th.w, th.h), tinted(card(th.p.t, THREE.DoubleSide), [th.d.x, -D / 2])); m.castShadow = true; m.customDistanceMaterial = caster(th.p.t); g.add(m);
    // the dashed cut: quads along the outline, 2 mm on, 1.3 off; drawn from the foot round
    const poly = th.pts.map(([x, y]) => [th.d.x - th.w / 2 + x / PX, th.h - y / PX]), pos = [], idx = []; let s = 0, n = 0;
    for (let k = 0; k < poly.length; k++) { const a = poly[k], b = poly[(k + 1) % poly.length], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); if (l < 1e-6) continue;
      if (s % 0.33 < 0.2) { const ox = (-dy / l) * 0.032, oy = (dx / l) * 0.032, v = pos.length / 3; pos.push(a[0] + ox, a[1] + oy, 0, a[0] - ox, a[1] - oy, 0, b[0] + ox, b[1] + oy, 0, b[0] - ox, b[1] - oy, 0); idx.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); n++; }
      s += l; }
    const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); dg.setIndex(idx); const dashes = new THREE.Mesh(dg, dashM); dashes.position.z = 0.04; dashes.frustumCulled = false; hinge.add(dashes);
    return { th, g, m, dashes, n }; });
  // the television's screen glows cold
  const glowT = (() => { const c = canvasOf(128, 128), g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.4)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const glowM = () => basic({ map: glowT, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
  const tvGlow = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 4.6), glowM()); tvGlow.position.set(-0.1 * things[0].w, 0.42 * things[0].h, 0.12); thingObjs[0].g.add(tvGlow);

  // ================= the eye, behind the flap: the white, the iris on its slide, the lid; a lamp panel behind it
  const E = pixels(imEye), ed = E.d, EX0 = 40, EY0 = 172, EW = 1446, EH = 706, ek = EYE.w / 1437, ICX = 754.5, ICY = 545, IR = 293;
  const lidY = (x) => 324 + 4.86e-4 * (x - 760) ** 2 + 3.39e-10 * (x - 760) ** 4;       // the lid's lower edge, plate pixels
  const epix = (x, y) => (clamp(Math.round(y), 0, E.h - 1) * E.w + clamp(Math.round(x), 0, E.w - 1)) * 4;
  const isWhite = (x, y) => { const i = epix(x, y); return ed[i + 3] > 200 && ed[i] > 120 && ed[i + 1] > 85 && ed[i + 2] > 60 && ed[i] - ed[i + 2] < 115 && y > lidY(x); };
  const cWhite = canvasOf(EW, EH), cLid = canvasOf(EW, EH), cShade = canvasOf(EW / 2, EH / 2), IS = 2 * (IR + 20), cIris = canvasOf(IS, IS);
  { const g = cWhite.getContext("2d"); g.drawImage(imEye, -EX0, -EY0); const img = g.getImageData(0, 0, EW, EH), o = img.data, R2 = IR + 50;
    // paint the iris and its shadow out of the white: the hole is filled from the clean white round it (relaxed on a
    // quarter-size grid, so it has no seam), then the lid's shadow is laid back over it
    const Q = 4, gx0 = Math.floor(ICX - R2 - 12), gy0 = Math.floor(ICY - R2 - 12), gw = Math.ceil((2 * R2 + 24) / Q), gh = Math.ceil((2 * R2 + 24) / Q), kind = new Uint8Array(gw * gh), val = new Float32Array(gw * gh * 3);
    const hole = (x, y) => Math.hypot(x - ICX, y - ICY) < R2 && ed[epix(x, y) + 3] > 200 && y > lidY(x) - 2; let mean = [0, 0, 0], nk = 0;
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const x = gx0 + (i + 0.5) * Q, y = gy0 + (j + 0.5) * Q, c = j * gw + i;
      if (hole(x, y)) kind[c] = 2; else if (isWhite(x, y)) { kind[c] = 1; const e = epix(x, y); for (let q = 0; q < 3; q++) { val[c * 3 + q] = ed[e + q]; mean[q] += ed[e + q]; } nk++; } }
    for (let c = 0; c < gw * gh; c++) if (kind[c] === 2) for (let q = 0; q < 3; q++) val[c * 3 + q] = mean[q] / nk;
    for (let it = 0; it < 700; it++) for (let j = 1; j < gh - 1; j++) for (let i = 1; i < gw - 1; i++) { const c = j * gw + i; if (kind[c] !== 2) continue; let n = 0, r = 0, gg = 0, b = 0;
      for (const d of [c - 1, c + 1, c - gw, c + gw]) if (kind[d]) { r += val[d * 3]; gg += val[d * 3 + 1]; b += val[d * 3 + 2]; n++; }
      if (n) { val[c * 3] = r / n; val[c * 3 + 1] = gg / n; val[c * 3 + 2] = b / n; } }
    for (let y = Math.max(EY0, gy0 + Q); y < Math.min(EY0 + EH, gy0 + gh * Q - Q); y++) for (let x = Math.max(EX0, gx0 + Q); x < Math.min(EX0 + EW, gx0 + gw * Q - Q); x++) { if (!hole(x, y)) continue;
      const fx = (x - gx0) / Q - 0.5, fy = (y - gy0) / Q - 0.5, i0 = Math.floor(fx), j0 = Math.floor(fy), tx = fx - i0, ty = fy - j0, i = ((y - EY0) * EW + (x - EX0)) * 4; let w = 0, c3 = [0, 0, 0];
      for (const [di, dj, ww] of [[0, 0, (1 - tx) * (1 - ty)], [1, 0, tx * (1 - ty)], [0, 1, (1 - tx) * ty], [1, 1, tx * ty]]) { const c = (j0 + dj) * gw + i0 + di; if (!kind[c] || ww <= 0) continue; w += ww; for (let q = 0; q < 3; q++) c3[q] += ww * val[c * 3 + q]; }
      if (!w) continue; const sh = 1 - 0.5 * clamp(1 - (y - lidY(x)) / 46) ** 1.5, n = 1 + 0.035 * (Math.abs((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) - 0.5);
      for (let q = 0; q < 3; q++) o[i + q] = clamp((c3[q] / w) * sh * n, 0, 255); }
    g.putImageData(img, 0, 0);
    const gl = cLid.getContext("2d"); gl.drawImage(imEye, -EX0, -EY0); const li = gl.getImageData(0, 0, EW, EH), lo = li.data; for (let y = 0; y < EH; y++) for (let x = 0; x < EW; x++) if (y + EY0 >= lidY(x + EX0)) lo[(y * EW + x) * 4 + 3] = 0; gl.putImageData(li, 0, 0);
    // the iris: the painted disc; what the lid and its shadow hide is the disc's lower half mirrored
    const gi = cIris.getContext("2d"), ii = gi.createImageData(IS, IS), io = ii.data;
    for (let v = 0; v < IS; v++) for (let u = 0; u < IS; u++) { const x = ICX - IS / 2 + u + 0.5, y = ICY - IS / 2 + v + 0.5, dd = Math.hypot(x - ICX, y - ICY), i = (v * IS + u) * 4;
      if (dd <= IR - 1) { const j = epix(x, y > lidY(x) + 54 ? y : 2 * ICY - y); io[i] = ed[j]; io[i + 1] = ed[j + 1]; io[i + 2] = ed[j + 2]; io[i + 3] = 255; }
      else if (dd < IR + 16) { io[i] = 46; io[i + 1] = 30; io[i + 2] = 20; io[i + 3] = dd <= IR ? 255 : 105 * (1 - (dd - IR) / 16) ** 1.5; } }      // its rim, then its soft shadow on the white
    gi.putImageData(ii, 0, 0);
    // the lid's shadow, as it falls on the iris: it stays with the lid while the iris slides under it
    const gs = cShade.getContext("2d"), si = gs.createImageData(cShade.width, cShade.height), so = si.data;
    for (let y = 0; y < cShade.height; y++) for (let x = 0; x < cShade.width; x++) { const py = EY0 + 2 * y, e = py - lidY(EX0 + 2 * x), i = (y * cShade.width + x) * 4; so[i] = 8; so[i + 1] = 10; so[i + 2] = 8; so[i + 3] = e < -8 ? 0 : e < 6 ? 215 : 215 * clamp(1 - (e - 6) / 56) ** 1.6; }
    gs.putImageData(si, 0, 0); }
  const eyeG = named(new THREE.Group(), "room.eye"); eyeG.position.set(EYE.at[0], EYE.at[1], -0.5); hinge.add(eyeG);
  const eW = EW * ek, eH = EH * ek, whiteM = card(tex(cWhite)), lidM = card(tex(cLid)), irisM = basic({ map: tex(cIris), transparent: true, depthWrite: false }), shadeT = tex(cShade), shadeM = basic({ map: shadeT, transparent: true, depthWrite: false });
  const white = new THREE.Mesh(new THREE.PlaneGeometry(eW, eH), whiteM), lid = new THREE.Mesh(new THREE.PlaneGeometry(eW, eH), lidM); lid.position.z = 0.07; eyeG.add(white, lid);
  const iris = named(new THREE.Mesh(new THREE.PlaneGeometry(IS * ek, IS * ek), irisM), "room.iris"); iris.renderOrder = 1; eyeG.add(iris);
  const shade = new THREE.Mesh(new THREE.CircleGeometry((IR - 0.5) * ek, 64), shadeM); shade.renderOrder = 2; eyeG.add(shade);
  const irisRest = [(ICX - (EX0 + EW / 2)) * ek, -(ICY - (EY0 + EH / 2)) * ek], fcx = (FL.x0 + FL.x1) / 2, fcy = (FL.y0 + FL.y1) / 2;
  const lampT = cardOf(640, 448, 320, 40, (g) => { const gr = g.createRadialGradient(320, 224, 30, 320, 224, 400); gr.addColorStop(0, "rgb(255,255,255)"); gr.addColorStop(0.5, "rgb(160,160,160)"); gr.addColorStop(1, "rgb(50,50,50)"); return gr; });
  const lampM = basic({ map: lampT, side: THREE.FrontSide }), lamp = new THREE.Mesh(new THREE.PlaneGeometry(FL.x1 - FL.x0 + 2.6, doorH + 1.4), lampM); lamp.position.set(fcx, fcy, -0.9); hinge.add(lamp);
  const boxM = tinted(basic({ side: THREE.BackSide }), [0, -D / 2], 0.8, "#d9c7a4"), box = new THREE.Mesh(lamp.geometry, boxM); box.position.set(fcx, fcy, -0.93); hinge.add(box);      // the lamp's card back, seen from behind the wall
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(17, 15), glowM()); halo.position.set(fcx, fcy, -0.7); hinge.add(halo);
  // the lamp's light through the open flap, on the room's floor: an additive pool, widest toward the open front
  const spillT = (() => { const c = canvasOf(128, 128), g = c.getContext("2d"); g.filter = "blur(9px)"; const gr = g.createLinearGradient(0, 14, 0, 124); gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr;
    g.beginPath(); g.moveTo(44, 14); g.lineTo(84, 14); g.lineTo(112, 118); g.lineTo(16, 118); g.closePath(); g.fill(); return new THREE.CanvasTexture(c); })();
  const spillM = basic({ map: spillT, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(15, D + 1).rotateX(-HALF), spillM); spill.position.set(fcx, 0.03, D / 2 - 0.2); flip.add(spill);

  // ================= the physicist, and his shadow on the room's floor (a painted floor takes no real shadow)
  const phys = X.standee("physicist", pPhys, 5);
  const shT = (() => { const c = canvasOf(96, 256), g = c.getContext("2d"); g.filter = "blur(5px)"; g.drawImage(pPhys.canvas, 22, 14, 52, 236); g.globalCompositeOperation = "source-in"; const gr = g.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, "rgba(20,12,8,1)"); gr.addColorStop(1, "rgba(20,12,8,0.15)"); g.fillStyle = gr; g.fillRect(0, 0, 96, 256); return new THREE.CanvasTexture(c); })();
  const shGeo = new THREE.PlaneGeometry(2.6, 7); shGeo.translate(0, 3.5, 0); shGeo.rotateX(-HALF);
  const shM = basic({ map: shT, transparent: true, depthWrite: false, opacity: 0.4, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), physShadow = new THREE.Mesh(shGeo, shM); physShadow.position.y = 0.02; flip.add(physShadow);
  const candleR = S4.toRoom(LAY.candle[0], LAY.candle[1]);
  // his slot: cut in the cloth outside the room and on across the room's floor (that part goes off with the floor)
  const pp = S4.PHYS.legs[0].path, dense = []; for (let s = 0; s <= pp.len + 1e-6; s += 0.25) dense.push(pp.at(Math.min(s, pp.len)));
  let cross = dense.findIndex(([x, z]) => S4.toRoom(x, z)[1] < D / 2 - 0.05); if (cross < 2) cross = 2;
  const pathOut = makePath(dense.slice(0, cross + 1), 2), pathIn = makePath(dense.slice(cross), 2), slotOut = slot(pathOut), slotIn = slot(pathIn);
  const pSlots = named(new THREE.Group(), "slot_physicist"); pSlots.add(slotOut, slotIn); pSlots.visible = false; world.add(pSlots);

  // ================= the citizen whose back is the robot, and its slot
  const citz = X.standee("citizen", X.plates.citizen, 4);
  citz.a.material = card(pRobot.t, THREE.FrontSide); citz.a.customDistanceMaterial = caster(pRobot.t);
  citz.b.material = card(X.plates.citizen.t, THREE.BackSide); citz.b.customDistanceMaterial = caster(X.plates.citizen.t);
  const cSlot = named(slot(S4.CITZ.legs[0].path), "slot_citizen"); cSlot.visible = false; world.add(cSlot);
  [phys, citz].forEach((s) => s.root.traverse((o) => (o.frustumCulled = false)));

  // ================= the pull-strip that draws the folded room off the left edge
  const stripM = tinted(basic({ side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), [-12, 0], 1, "#e6d5b2");
  const strip = named(new THREE.Group(), "strip"), sBar = new THREE.Mesh(new THREE.PlaneGeometry(44, 1.7).rotateX(-HALF), stripM), sTab = new THREE.Mesh(new THREE.CircleGeometry(1.35, 24).rotateX(-HALF), stripM); sBar.position.x = -22; strip.add(sBar, sTab); strip.visible = false; world.add(strip);
  const stripAt = S4.loc([-11.5, 0.5]);

  reg.add("room", room, { kind: "flat" }); reg.add("slot_physicist", pSlots, { kind: "slots" }); reg.add("slot_citizen", cSlot, { kind: "slots" }); reg.add("strip", strip, { kind: "flat" });

  const col = new THREE.Color(), cool = new THREE.Color();
  function update(f, jitter, cam) {
    // section 5's soft tableware: hidden from f1196 until the lens is on the eye, far from both; there from then on
    if (f >= S4.F0 && f < T.fg) { reg.get("fg_glass").set.hide(); reg.get("fg_fork").set.hide(); }
    const draw = S4.drawAt(f), on = f >= T.cut && f < T.gone;

    // ---------- the physicist and his slot
    const ps = S4.physicistAt(f); phys.pose(ps); if (ps.visible) phys.root.position.x -= draw;
    pSlots.visible = f >= T.pop - 2 && f < T.gone;
    if (pSlots.visible) { const s = S4.PHYS.legs[0].sAt(f - ((f - S4.F0) & 1)) + 1.5, heal = 1 - smooth((f - (T.gone - 13)) / 12); slotOut.draw(clamp(s / pathOut.len) * heal); slotIn.draw(clamp((s - pathOut.len) / pathIn.len)); slotIn.position.x = -draw; }
    // ---------- the citizen, the robot on its back, and its slot
    const cs = S4.citizenAt(f); citz.pose(cs); citz.a.castShadow = cs.robot; citz.b.castShadow = !cs.robot;
    cSlot.visible = cs.slot > 0.001; cSlot.draw(cs.slot);
    // ---------- the strip
    strip.visible = f >= T.strip && f < T.gone; if (strip.visible) strip.position.set(lerp(-47, stripAt[0], S4.stripAt(f)) - draw, 0.03, stripAt[1]);

    room.visible = on; if (!on) return;
    room.position.set(ROOM.at[0] - draw, 0, ROOM.at[1]);
    for (const [m, at, gain, base] of tints) { const [x, z] = S4.loc(at), c = tintAt(x, z, gain); if (base) m.color.setRGB(base.r * c.r, base.g * c.g, base.b * c.b); else m.color.copy(c); }
    // the floor
    const fk = S4.floorAt(f), wk = S4.wallAt(f); flip.rotation.x = -Math.PI * (1 - fk);
    floorBack.castShadow = fk > 0.02 && fk < 0.98; floorTop.visible = fk > 0.001;
    const ck = S4.cutAt(f) * 3; cutEdges.forEach((e, k) => { const n = Math.round(e.n * clamp(ck - [0, 1, 2, 1][k])); e.pale.geometry.setDrawRange(0, 6 * n); e.dark.geometry.setDrawRange(0, 6 * n); e.pale.visible = e.dark.visible = fk < 0.5; });
    // the back wall and what is on it
    hinge.visible = fk > 0.02; hinge.rotation.x = HALF * (1 - wk);
    const st = S4.holesAt(f); wallF.material = wallMats[st]; wallB.material = wallBackMats[st]; wallF.customDistanceMaterial = caster(wallT[st]);
    // folded, a side wall lies on the back wall's face 2 mm proud of it (over the cards that stand against the wall)
    sides.forEach((s, k) => { const o = S4.sideAt(k, f); s.g.rotation.y = -s.sg * (Math.PI - OPEN * o); s.g.position.z = 0.03 + 0.03 * k + 0.2 * (1 - clamp(o * 4)); });
    thingObjs.forEach((o, i) => { const t = S4.thingAt(i, f); o.g.rotation.x = -t.tip * (HALF - 0.012); o.dashes.visible = t.dashes; o.dashes.geometry.setDrawRange(0, 6 * Math.round(o.n * t.cut)); });
    const gk = wk * clamp(S4.sideAt(1, f) * 3); tvGlow.material.color.setRGB(0.2 * gk, 0.3 * gk, 0.42 * gk); tvGlow.visible = gk > 0.3;       // the screen shows once the left side wall has swung off it
    // the flap, the lamp, the eye
    const open = S4.flapAt(f), lk = S4.lampAt(f), a = open * 1.95; doors.forEach((d) => { d.g.rotation.y = d.k ? a : -a; });
    latchG.rotation.x = -2.95 * smooth((f - (C.orwellian - 4)) / 5) * (1 - smooth((f - (T.shut + 8)) / 5));       // the latch flips up out of the doors' way, and back when they have shut
    const base = tintAt(...S4.loc([0, -D / 2]), 0.45); col.copy(base);
    cool.setRGB(1.0, 1.05, 1.2); whiteM.color.copy(col).lerp(cool, lk); cool.setRGB(0.95, 1.05, 1.16); irisM.color.copy(col).lerp(cool, lk); cool.setRGB(0.78, 0.84, 1.0); lidM.color.copy(col).lerp(cool, lk);
    lampM.color.setRGB(col.r * 0.4 + 0.4 * lk, col.g * 0.4 + 0.62 * lk, col.b * 0.4 + 1.0 * lk); halo.material.color.setRGB(0.12 * lk, 0.2 * lk, 0.36 * lk); halo.visible = lk > 0.01;
    const db = tintAt(...S4.loc([0, -D / 2]), 0.62); doorBack.forEach((m) => m.color.setRGB(lerp(db.r * 0.85, 0.34, 0.85 * lk), lerp(db.g * 0.78, 0.5, 0.85 * lk), lerp(db.b * 0.62, 0.8, 0.85 * lk)));
    spillM.color.setRGB(0.1 * lk * open, 0.17 * lk * open, 0.3 * lk * open); spill.visible = lk * open > 0.01;
    // the iris: to him, then to the lens (it follows the lens from "everything")
    const ir = S4.irisAt(f), [clx, clz] = S4.toRoom(cam.P[0] + draw, cam.P[2]), dz = Math.max(4, clz + D / 2), lx = clamp((1.5 * (clx - EYE.at[0])) / Math.hypot(clx - EYE.at[0], dz), -0.95, 0.95);
    const ox = lerp(lerp(0, -0.95, ir.him), lx, ir.lens), down = lerp(lerp(0, 0.08, ir.him), lerp(0.16, 0.04, Math.abs(lx) / 0.95), ir.lens);
    iris.position.set(irisRest[0] + ox, irisRest[1] - down, 0.03); shade.position.set(irisRest[0] + ox, irisRest[1] - down, 0.05);
    const R2 = 2 * (IR - 0.5), px0 = ICX + ox / ek - (IR - 0.5) - EX0, py1 = ICY + down / ek + (IR - 0.5) - EY0; shadeT.repeat.set(R2 / EW, R2 / EH); shadeT.offset.set(px0 / EW, 1 - py1 / EH);
    shadeM.opacity = 0.9;
    // his shadow on the floor: away from the candle, as long as he stands up in the room
    const [plx, plz] = S4.toRoom(ps.x, ps.z), dxs = plx - candleR[0], dzs = plz - candleR[1], inRoom = smooth((D / 2 - 0.3 - plz) / 1.2) * (ps.pop ?? 0) * wk;
    physShadow.visible = ps.visible && inRoom > 0.02; physShadow.position.set(plx, 0.02, plz + D / 2); physShadow.rotation.y = Math.atan2(-dxs, -dzs); shM.opacity = 0.42 * inRoom * X.now.level;
  }
  return { update };
}
