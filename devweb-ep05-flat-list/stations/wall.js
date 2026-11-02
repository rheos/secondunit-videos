// S3 the folder wall (boards 11, 12, 13, 15, 16): the shaft's back wall, ten folders that draw in as their first copy
// nears, and the copies themselves: 32 in the mass moment's ripple, card 11's after the rename. Copies are ghosts of
// cards (the cord never moves); each owns its materials because each fades on its own clock (ep 1).
//
// Dressing (animator pass): the wall is riveted plates (low-contrast seams so the camera's moves read without a hard
// line on the frame border); each folder is a real folder: a back cover with its tab cut from one slab with a little
// thickness, a back sheet peeking out behind, and pocket strips the copies drop into like index cards. Depths, back
// to front: wall -2.9, back sheet -2.8, folder face -2.7, copies -2.6 (row 1) / -2.5 (row 2), pocket faces -2.39,
// connectors and the memory gap -2.29: 0.1 between every pair of facing panels (ep 3). x, y, sizes and times are
// the animatic's.
import { T, w, NAMES, FOLDERS, SLOT, WALL_Z, FOLDER_Z, COPY_Z, FOLDER_X, FOLDER_W, cardY, copyDepart, flightAt, drawCardFace, faceBox, fadeMat, mixHex, cl, io, r01, mix } from "../parts.js";

let THREE, root, kit;
const folders = [], copies = [];
const FLIGHT = 0.9, TAB_H = 0.74, TAB_R = 3.08, PPU = 200;
const BACK_Z = FOLDER_Z - 0.1, POCKET_Z = -2.39, OVER_Z = -2.29; // POCKET_Z: the pocket strips' front face
const LIFT = 0.16; // a copy arrives a little high and drops into its pocket

// ---------- the folder outline, one path for the slab (THREE.Shape) and its canvas (y down, from the tab's top) ----
function outline(p, X, Y, H) {
  const W = FOLDER_W, th = TAB_H, tr = TAB_R, sl = 0.24, r = 0.1, rs = 0.06;
  const len = Math.hypot(sl, th), dx = (rs * sl) / len, dy = (rs * th) / len;
  p.moveTo(X(0), Y(r));
  p.quadraticCurveTo(X(0), Y(0), X(r), Y(0));
  p.lineTo(X(tr - rs), Y(0));
  p.quadraticCurveTo(X(tr), Y(0), X(tr + dx), Y(dy)); // the tab's shoulder slopes down to the body
  p.lineTo(X(tr + sl - dx), Y(th - dy));
  p.quadraticCurveTo(X(tr + sl), Y(th), X(tr + sl + rs), Y(th));
  p.lineTo(X(W - r), Y(th));
  p.quadraticCurveTo(X(W), Y(th), X(W), Y(th + r));
  p.lineTo(X(W), Y(H - r));
  p.quadraticCurveTo(X(W), Y(H), X(W - r), Y(H));
  p.lineTo(X(r), Y(H));
  p.quadraticCurveTo(X(0), Y(H), X(0), Y(H - r));
  p.lineTo(X(0), Y(r));
}

// a canvas texture and its context
function canvasTex(wu, hu, ppu) {
  const c = document.createElement("canvas"); c.width = Math.round(wu * ppu); c.height = Math.round(hu * ppu);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { c, g: c.getContext("2d"), tex };
}
// a flat canvas plane, redrawn only when its state changes; never writes depth (it is a decal of lines)
function flat(wu, hu, ppu, draw) {
  const { c, g, tex } = canvasTex(wu, hu, ppu);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wu, hu), mat);
  let key = null;
  return { mesh, mat, set(s) { const k = JSON.stringify(s); if (k === key) return; key = k; g.clearRect(0, 0, c.width, c.height); draw(g, c.width, c.height, s); tex.needsUpdate = true; } };
}
const fadeFlat = (m, a) => { m.transparent = true; m.opacity = a; m.depthWrite = false; };

// ---------- the back wall: riveted plates, a seamless tile (12 x 8 units at 128 px/unit) ----------
function wallTexture() {
  const PU = 128, TW = 12, TH = 8, PW = 6, PH = 4;
  const { c, g, tex } = canvasTex(TW, TH, PU);
  let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const W = c.width, H = c.height, base = [17, 25, 34];
  // one base tone (a tone step between plates would be a hard line); the plates are the seams below
  g.fillStyle = `rgb(${base.join(",")})`; g.fillRect(0, 0, W, H);
  // mottling: soft blobs, wrapped so the tile repeats without a seam
  for (let n = 0; n < 260; n++) {
    const x = rnd() * W, y = rnd() * H, rad = 20 + rnd() * 110, light = rnd() > 0.5;
    for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) {
      const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
      gr.addColorStop(0, light ? "rgba(40,54,70,0.05)" : "rgba(6,9,13,0.06)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2);
    }
  }
  // seams: a grid of 6 x 4 plates, soft grooves about 16 texels wide, dark in the middle with a faint lit lip below /
  // to the right (the sun is upper left). Soft and sparse on purpose: forensics' border check fails a long straight
  // line on the frame's outer pixels (ep 3). The tile's offset (below) puts the seams at x = 0.4 + 6k and
  // y = 2.8 + 4k, where the current camera keys keep them off the frame border (longest brush 0.4 s, in a move).
  const band = (x0, y0, w0, h0, horiz) => {
    const gr = horiz ? g.createLinearGradient(0, y0, 0, y0 + h0) : g.createLinearGradient(x0, 0, x0 + w0, 0);
    gr.addColorStop(0, "rgba(6,9,13,0)"); gr.addColorStop(0.4, "rgba(6,9,13,0.2)"); gr.addColorStop(0.72, "rgba(40,54,70,0.13)"); gr.addColorStop(1, "rgba(40,54,70,0)");
    g.fillStyle = gr; g.fillRect(x0, y0, w0, h0);
  };
  const S = 8;
  for (let r = 0; r < TH / PH; r++) for (const yy of [r * PH * PU, r * PH * PU + H]) band(0, yy - S, W, 2 * S, true);
  for (let k = 0; k < TW / PW; k++) for (const xx of [k * PW * PU, k * PW * PU + W]) band(xx - S, 0, 2 * S, H, false);
  // rivets along each plate's edges, 0.22 in from the seam
  const rivet = (x, y) => {
    g.fillStyle = "rgba(7,10,14,0.65)"; g.beginPath(); g.arc(x + 0.7, y + 0.7, 3.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(38,50,64,0.75)"; g.beginPath(); g.arc(x - 0.4, y - 0.4, 2.4, 0, Math.PI * 2); g.fill();
  };
  for (let r = 0; r < TH / PH; r++) for (let k = 0; k < TW / PW; k++) {
    const x0 = k * PW, y0 = r * PH;
    for (let i = 0; i <= 4; i++) { const x = x0 + 0.22 + (PW - 0.44) * i / 4; rivet(x * PU, (y0 + 0.22) * PU); rivet(x * PU, (y0 + PH - 0.22) * PU); }
    for (let i = 1; i < 3; i++) { const y = y0 + 0.22 + (PH - 0.44) * i / 3; rivet((x0 + 0.22) * PU, y * PU); rivet((x0 + PW - 0.22) * PU, y * PU); }
  }
  // fine grain, a level or so either way
  const img = g.getImageData(0, 0, W, H), px = img.data;
  for (let i = 0; i < px.length; i += 4) { const n = (rnd() - 0.5) * 2; px[i] += n; px[i + 1] += n; px[i + 2] += n; }
  g.putImageData(img, 0, 0);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(40 / TW, 64 / TH);
  // the wall spans x -17..23, y -45..19: seams at x = 0.4 + 6k ((x + 17) / 12 + 0.05 on a tile line) and y = 2.8 + 4k
  tex.offset.set(0.05, 0.025);
  tex.needsUpdate = true;
  return tex;
}

// ---------- the hook's hint (0-3.7 s): a faint dashed folder on the wall, traced while "folder" is said ----------
function ghostShape(g, u, prog, fill) {
  // a folder icon, 2.6 x 1.7: the tab a third of the width
  const pts = [], W = 2.6, H = 1.7, th = 0.3, tw = 1.0, r = 0.08, m = 0.05;
  const arc = (cx, cy, a0, a1) => { for (let k = 0; k <= 6; k++) { const a = mix(a0, a1, k / 6); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  const P = Math.PI;
  arc(m + r, H - m - r, P / 2, P); arc(m + r, m + r, P, 1.5 * P); // bottom-left, then up the left side to the tab top
  pts.push([m + tw, m], [m + tw + 0.2, m + th]); arc(W - m - r, m + th + r, 1.5 * P, 2 * P); arc(W - m - r, H - m - r, 0, P / 2);
  pts.push([m + r, H - m]);
  const L = []; let tot = 0; L.push(0);
  for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(tot); }
  if (fill > 0) {
    g.globalAlpha = 0.22 * fill; g.fillStyle = "#1c4630"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x * u, y * u) : g.moveTo(x * u, y * u))); g.fill(); g.globalAlpha = 1;
  }
  // dashes along the path up to prog of its length
  const end = tot * prog, D = 0.13, G = 0.08;
  const at = (s) => { let i = 1; while (i < L.length - 1 && L[i] < s) i++; const k = (s - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]); return [mix(pts[i - 1][0], pts[i][0], k) * u, mix(pts[i - 1][1], pts[i][1], k) * u]; };
  g.strokeStyle = "#6ad08a"; g.lineWidth = 0.035 * u; g.lineCap = "round";
  for (let s = 0; s < end; s += D + G) {
    const e = Math.min(end, s + D); g.beginPath(); g.moveTo(...at(s));
    for (let i = 1; i < L.length; i++) if (L[i] > s && L[i] < e) g.lineTo(pts[i][0] * u, pts[i][1] * u);
    g.lineTo(...at(e)); g.stroke();
  }
}
let ghost;

export function build(scene, k) {
  kit = k; THREE = kit.THREE;
  root = new THREE.Group(); scene.add(root);
  // the back wall: taller than the plan's 40 x 40 so its bottom edge never enters the wide (DP); 0.1 behind the
  // back sheets
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 64), new THREE.MeshBasicMaterial({ map: wallTexture() }));
  wall.position.set(3, -13, WALL_Z - 0.1); root.add(wall);

  ghost = flat(2.6, 1.7, PPU, (g, W, H, s) => ghostShape(g, W / 2.6, s.p, s.f));
  ghost.mesh.position.set(3.2, -6.05, WALL_Z); root.add(ghost.mesh);

  // the copies: every card except 10, 11, 32 in the ripple; 11's after the rename
  const ids = [];
  for (let i = 1; i <= 35; i++) if (i !== 10 && i !== 11 && i !== 32) ids.push(i);
  ids.push(11);
  ids.forEach((i) => {
    const edge = kit.toon("#4f93d6", { transparent: true });
    const fb = faceBox(2.4, 0.56, 0.04, 210, drawCardFace, edge, { transparent: true });
    fb.set({ n: i, name: i === 11 ? "memory_write" : NAMES[i], lit: 1, hot: 0 });
    const dep = i === 11 ? T.rewrite : copyDepart(i);
    const f = FOLDERS[SLOT[i][2]], row = Math.floor(f[5].indexOf(i) / f[4]);
    copies.push({ i, fb, edge, dep, slot: SLOT[i], z: COPY_Z + 0.1 * row }); // row 2 stands 0.1 in front of row 1
    root.add(fb.mesh);
  });

  // a measuring context for the tab words (Plex Mono 700 at 0.44)
  const mg = document.createElement("canvas").getContext("2d"); mg.font = `700 ${0.44 * 100}px 'IBM Plex Mono', monospace`;

  FOLDERS.forEach(([name, tabTop, bodyTop, bodyBot, cols, cards], fi) => {
    const H = tabTop - bodyBot, cy = (tabTop + bodyBot) / 2, left = FOLDER_X - FOLDER_W / 2;
    const g0 = new THREE.Group(); g0.position.set(FOLDER_X, cy, 0); root.add(g0);
    const local = (x, y) => [x - FOLDER_X, y - cy];
    const mats = [];

    // the back sheet: dimmer, peeking above the body right of the tab and past its right edge
    const bsW = FOLDER_W - 0.5, bsH = bodyTop - bodyBot + 0.07;
    const bs = flat(bsW, bsH, 120, (g, W, Hp) => {
      const u = W / bsW; g.fillStyle = "#0c1c14"; kit.rr(g, 1, 1, W - 2, Hp - 2, 0.07 * u); g.fill();
      g.strokeStyle = "#3d7d57"; g.lineWidth = 0.05 * u; kit.rr(g, 0, 0, W, Hp, 0.07 * u); g.stroke();
    });
    bs.set({}); bs.mesh.position.set(...local(left + 0.62 + bsW / 2, bodyBot + 0.1 + bsH / 2), BACK_Z); g0.add(bs.mesh); mats.push([bs.mat, true]);

    // the folder: tab and back cover cut as one slab 0.06 thick; the canvas sits on its front cap
    const shape = new THREE.Shape(); outline(shape, (x) => x, (y) => H - y, H);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false, curveSegments: 6 });
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let n = 0; n < pos.count; n++) uv.setXY(n, pos.getX(n) / FOLDER_W, pos.getY(n) / H);
    geo.translate(-FOLDER_W / 2, -H / 2, -0.06);
    const { c, g, tex } = canvasTex(FOLDER_W, H, PPU);
    const face = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const side = new THREE.MeshBasicMaterial({ color: "#2b6143", transparent: true });
    const slab = new THREE.Mesh(geo, [face, side]); slab.position.set(0, 0, FOLDER_Z); g0.add(slab);
    mats.push([face, false], [side, false]);
    let key = null;
    const drawSlab = (s) => {
      const k2 = JSON.stringify(s); if (k2 === key) return; key = k2;
      const u = PPU, hi = s.hi;
      const gr = g.createLinearGradient(0, TAB_H * u, 0, H * u); gr.addColorStop(0, "#12291e"); gr.addColorStop(1, "#0e2017");
      g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = mixHex("#13301f", "#2f8a52", hi); g.fillRect(0, 0, c.width, TAB_H * u); // the tab: lit hard while the rule is spoken
      g.fillStyle = `rgba(106,208,138,${0.06 + 0.2 * hi})`; g.fillRect(0, (TAB_H - 0.012) * u, (TAB_R + 0.24) * u, 0.024 * u); // where tab meets body
      g.beginPath(); outline(g, (x) => x * u, (y) => y * u, H);
      g.strokeStyle = "#6ad08a"; g.lineWidth = (0.06 + 0.04 * hi) * u; g.stroke(); // half of it falls outside the slab
      g.fillStyle = hi > 0.5 ? "#ffffff" : "#b9f0c9"; g.font = `700 ${0.44 * u}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle";
      g.fillText(name, 0.22 * u, TAB_H / 2 * u + 2);
      tex.needsUpdate = true;
    };

    // pocket strips, one per row of copies: each covers the lower half of its row, the last one to the body's foot
    const rows = Math.ceil(cards.length / cols), edge = new THREE.MeshBasicMaterial({ color: "#2f6b48", transparent: true });
    mats.push([edge, false]);
    for (let r = 0; r < rows; r++) {
      const rowY = bodyTop - 0.2975 - 0.315 * r, top = rowY - 0.045; // the name row stays clear
      const bot = r === rows - 1 ? bodyBot + 0.035 : rowY - 0.1975;
      const pw = FOLDER_W - 0.16, ph = top - bot;
      const pk = faceBox(pw, ph, 0.02, PPU, (g2, W, Hp) => {
        const u = W / pw, gr2 = g2.createLinearGradient(0, 0, 0, Hp);
        gr2.addColorStop(0, "#1b4630"); gr2.addColorStop(1, "#122f20"); g2.fillStyle = gr2; g2.fillRect(0, 0, W, Hp);
        g2.fillStyle = "rgba(0,0,0,0.35)"; g2.fillRect(0, 0.03 * u, W, 0.02 * u); // the lip's shadow
        g2.fillStyle = "#6ad08a"; g2.fillRect(0, 0, W, 0.03 * u); // the lip
      }, edge, { transparent: true });
      pk.set({});
      pk.mesh.position.set(...local(FOLDER_X, (top + bot) / 2), POCKET_Z - 0.01); g0.add(pk.mesh);
      mats.push([pk.face, false]);
    }

    // connectors and (memory) the red gap: in front of everything in the folder
    mg.font = `700 44px 'IBM Plex Mono', monospace`;
    const wordW = mg.measureText(name).width / 100;
    const over = flat(FOLDER_W, H, PPU, (g3, W, Hp, s) => {
      const u = W / FOLDER_W, Y = (y) => (tabTop - y) * u, X = (x) => (x - left) * u;
      if (s.link > 0) {
        // a tree from the tab word: underline, a trunk down the left margin, a branch along each row, a leaf to each
        // copy's first word
        const L = s.link, seg = (a, d) => io(cl((L - a) / d));
        const ux = 0.22 + wordW, uy = tabTop - 0.69, tx = left + 0.12;
        const targets = cards.filter((i) => !(i === 11 && s.gap > 0)).map((i) => {
          const [sx, sy] = SLOT[i], fw = NAMES[i === 11 ? 12 : i].split("_")[0].length; // 11 lands as memory_write
          return [sx - 0.328 + 0.0328 * fw / 2, sy + 0.1175, Math.floor(cards.indexOf(i) / cols)];
        });
        g3.strokeStyle = "#b9f0c9"; g3.fillStyle = "#b9f0c9"; g3.lineWidth = 0.03 * u; g3.lineCap = "round"; g3.lineJoin = "round";
        const line = (x0, y0, x1, y1, k) => { if (k <= 0) return; g3.beginPath(); g3.moveTo(X(x0), Y(y0)); g3.lineTo(X(mix(x0, x1, k)), Y(mix(y0, y1, k))); g3.stroke(); };
        line(left + ux, uy, tx, uy, seg(0, 0.25)); // under the word, out to the margin
        const lastY = Math.min(...targets.map(([, ty]) => ty + 0.04));
        line(tx, uy, tx, lastY, seg(0.2, 0.35));
        for (let r = 0; r < rows; r++) {
          const row = targets.filter(([, , rr]) => rr === r); if (!row.length) continue;
          const by = row[0][1] + 0.04, bx = Math.max(...row.map(([x]) => x));
          line(tx, by, bx, by, seg(0.45 + 0.08 * r, 0.3));
          row.forEach(([x, y]) => {
            const kk = seg(0.7 + 0.05 * r + 0.1 * ((x - tx) / 6), 0.15); line(x, by, x, y + 0.005, kk);
            if (kk > 0.95) { g3.beginPath(); g3.arc(X(x), Y(y + 0.005), 0.025 * u, 0, Math.PI * 2); g3.fill(); }
          });
        }
      }
      if (s.gap > 0) { // where card 11 should be
        const [sx, sy] = SLOT[11];
        g3.globalAlpha = s.gap; g3.setLineDash([0.08 * u, 0.06 * u]); g3.strokeStyle = "#e0675a"; g3.lineWidth = 0.03 * u;
        g3.strokeRect(X(sx - 0.515), Y(sy + 0.1275), 1.03 * u, 0.255 * u); g3.setLineDash([]); g3.globalAlpha = 1;
      }
    });
    over.mesh.position.set(0, 0, OVER_Z); g0.add(over.mesh); mats.push([over.mat, true]);

    // a folder draws in when its first copy is 0.3 s from landing
    const first = Math.min(...cards.filter((i) => i !== 11).map((i) => copyDepart(i)));
    folders.push({ name, g0, mats, drawSlab, over, at: first + FLIGHT - 0.3 });
  });
  return root;
}

// the fix shown while it is spoken (first watch item 8): on "start its name with the thing" each tab lights in turn
// and its copies' first words light against it; on "match the first words" the connectors grow from each tab
const q = (v) => Math.round(v * 10) / 10;
const q2 = (v) => Math.round(v * 50) / 50;
const ruleOff = (t) => 1 - r01(t, T.already3 + 0.5, 0.5);
const hiAt = (t, f) => q(r01(t, T.start3 + 0.12 * f, 0.3) * ruleOff(t));
const linkAt = (t, f) => q2(r01(t, T.match + 0.1 * f, 0.6) * ruleOff(t));

// where a copy is at flight progress p: the shared flight, then (the dressing) y settles a beat early, the copy
// reaches its row's depth while lifted LIFT above its slot, and drops into the pocket for the last 0.16 s
function copyAt(c, p) {
  const [x, y, z, s] = flightAt(cardY(c.i), c.slot[0], c.slot[1], p);
  const yy = mix(y, c.slot[1], io(r01(p, 0.5, 0.22)));
  const zz = mix(z, c.z, io(r01(p, 0.55, 0.3)));
  const lift = LIFT * io(r01(p, 0.45, 0.25)) * (1 - io(r01(p, 0.82, 0.18)));
  return [x, yy + lift, zz, s];
}

export function update(t) {
  // the hook's hint
  const fw = w("folder", 1), ga = r01(t, 0.3, 0.3) * (1 - r01(t, T.say - 0.25, 0.4));
  ghost.mesh.visible = ga > 0.001;
  if (ghost.mesh.visible) {
    ghost.set({ p: q2(io(r01(t, 0.45, fw - 0.45))), f: q(r01(t, fw, 0.35)) });
    fadeFlat(ghost.mat, 0.42 * ga);
  }

  folders.forEach((f, n) => {
    const a = r01(t, f.at - 0.1, 0.4), on = a > 0.001;
    f.g0.visible = on;
    f.g0.scale.set(mix(0.96, 1, a), mix(0.96, 1, a), 1); // never scale depth: the layers keep their 0.1
    if (!on) return;
    const hi = hiAt(t, n), link = linkAt(t, n);
    const gap = f.name === "memory" ? q(1 - r01(t, T.rewrite + FLIGHT - 0.3, 0.3)) : 0;
    f.drawSlab({ hi });
    f.over.set({ link, gap });
    f.over.mesh.visible = link > 0 || gap > 0;
    f.mats.forEach(([m, decal]) => (decal ? fadeFlat(m, a) : fadeMat(m, a)));
  });
  copies.forEach((c) => {
    const p = (t - c.dep) / FLIGHT;
    c.fb.mesh.visible = p >= 0;
    if (p < 0) return;
    const [x, y, z, s] = copyAt(c, p);
    c.fb.mesh.position.set(x, y, z);
    const breath = p >= 1 ? 1 + 0.01 * Math.sin(t * 1.3 + c.i) : 1; // a held wide never freezes (ep 3)
    c.fb.mesh.scale.set(s * breath, s, s);
    c.fb.set({ n: c.i, name: c.i === 11 ? "memory_write" : NAMES[c.i], lit: 1, hot: q(r01(t, T.start3 + 0.12 * c.slot[2] + 0.15, 0.3) * ruleOff(t)) });
    const a = r01(t, c.dep, 0.15);
    fadeMat(c.fb.face, a); fadeMat(c.edge, a);
  });
}
