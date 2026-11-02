// S4 the rule slot (boards 13, 14): below the ten folders, the empty dashed "no folder" slot that card 36's lone copy
// lands in and wobbles; in 14 the `invoice` folder types its two good names above it, the lone copy scales up and
// takes the red strike. All three fade on "Rename".
// Dressed (animator pass): nothing stops the 36th tool and the AI pays for it, both shown (first watch 02 item 5).
// On "build passes" and "deploy passes" two green check stamps slam onto card 36 and ride its copy into the slot. On
// "the AI pays" the AI's search key (an `invoice` chip, the same kind of chip that hunted `memory` at 21-25 s) slides
// in, dips onto the copy's first word `send`, finds no match, shakes no and a small red "?" pops: the copy dims. On
// "next time it reads the list" it tries again, the same miss. The invoice folder draws its outline round the rule,
// and the copy flinches when the strike crosses it. Every position, size and time of the animatic is kept.
import { T, w, LONE, FOLDER_X, FOLDER_W, COPY_Z, NAMES, cardY, flightAt, drawCardFace, faceBox, fadeMat, mixHex, cl, io, r01, mix } from "../parts.js";
import { typed, back } from "../kit/world.js";

// the station's window should open before "build passes" so the first stamp lands on its word: world.js's STATIONS
// row for "slot" starts at T.c36Copy - 0.1 (95.08) today; FROM is what it needs (a shared change for the Conductor)
export const FROM = T.build - 0.4;

// ---------- the beats (Chris's words) ----------
const S = {
  build: T.build + 0.05,          // stamp 1 hits on "build passes" (94.35)
  deploy: T.deploy + 0.07,        // stamp 2 hits on "deploy passes" (95.45)
  land: T.c36Copy + 1.0,          // the copy's flight ends (96.18)
  chipIn: T.pays - 0.55,          // the AI's search key arrives (96.41)
  dip1: T.pays,                   // it tries `send` on "pays" (96.96)
  miss1: T.pays + 0.22,           // no match: "?" and the dim (97.18)
  back2: T.reads3 - 0.5,          // "next time": it backs off (97.88)
  dip2: T.reads3,                 // and tries again on "reads" (98.38)
  miss2: T.reads3 + 0.2,
  chipOut: w("list", 5) + 0.4,    // gone after "the list" (99.16)
  stampsOut: w("list", 5) + 0.55, // the stamps leave with it (99.31), before the pull back
};
const CHIP_Y = LONE[1] + 0.47, CHIP_Z = COPY_Z + 0.22;
const WORD_X = LONE[0] + 0.8 * (-1.2 + 0.42 + 0.156); // the centre of `send` on the landed copy (scale 0.8)
const q = (v, n = 20) => Math.round(cl(v) * n) / n;

// the wall's folder silhouette (wall.js `outline`): a tab of width tr whose shoulder slopes down to the body; drawn on
// a canvas in px (u px per unit), inset 0.035 so the stroke stays on the panel
const TAB_H = 0.74, TAB_R = 3.08;
function outline(p, u, H, tr) {
  const m = 0.035, sx = (FOLDER_W - 2 * m) / FOLDER_W, sy = (H - 2 * m) / H;
  const X = (x) => (m + x * sx) * u, Y = (y) => (m + y * sy) * u;
  const W = FOLDER_W, th = TAB_H, sl = 0.24, r = 0.1, rs = 0.06;
  const len = Math.hypot(sl, th), dx = (rs * sl) / len, dy = (rs * th) / len;
  p.moveTo(X(0), Y(r));
  p.quadraticCurveTo(X(0), Y(0), X(r), Y(0));
  p.lineTo(X(tr - rs), Y(0));
  p.quadraticCurveTo(X(tr), Y(0), X(tr + dx), Y(dy));
  p.lineTo(X(tr + sl - dx), Y(th - dy));
  p.quadraticCurveTo(X(tr + sl), Y(th), X(tr + sl + rs), Y(th));
  p.lineTo(X(W - r), Y(th));
  p.quadraticCurveTo(X(W), Y(th), X(W), Y(th + r));
  p.lineTo(X(W), Y(H - r));
  p.quadraticCurveTo(X(W), Y(H), X(W - r), Y(H));
  p.lineTo(X(r), Y(H));
  p.quadraticCurveTo(X(0), Y(H), X(0), Y(H - r));
  p.closePath();
}

let THREE, root, kit, slot, invoice, carrier, lone, loneEdge, strike, chip, ask, askGlow;
const stamps = [];

// a rubber stamp: green check and a word on a dark green plate, slightly inked at the rim
function drawStamp(word) {
  return (g, W, H) => {
    const u = W / 0.86;
    g.fillStyle = "rgba(16,36,26,0.94)"; kit.rr(g, 0.02 * u, 0.02 * u, W - 0.04 * u, H - 0.04 * u, 0.05 * u); g.fill();
    g.strokeStyle = "#6ad08a"; g.lineWidth = 0.022 * u; g.stroke();
    g.strokeStyle = "rgba(106,208,138,0.35)"; g.lineWidth = 0.008 * u; kit.rr(g, 0.05 * u, 0.05 * u, W - 0.1 * u, H - 0.1 * u, 0.035 * u); g.stroke();
    // the check, drawn (Plex Mono has no reliable check glyph)
    g.strokeStyle = "#6ad08a"; g.lineWidth = 0.032 * u; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(0.1 * u, 0.125 * u); g.lineTo(0.155 * u, 0.175 * u); g.lineTo(0.255 * u, 0.065 * u); g.stroke();
    g.fillStyle = "#b9f0c9"; g.font = `700 ${0.135 * u}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle";
    g.fillText(word, 0.3 * u, H / 2 + 0.008 * u);
  };
}

export function build(scene, k) {
  kit = k; THREE = kit.THREE;
  root = new THREE.Group(); scene.add(root);
  // the empty slot: a folder's ghost in dashed grey, the wall's folder silhouette with a blank 2.0-wide tab (nothing
  // takes it; not red, nothing flashes)
  slot = kit.panel(FOLDER_W, 2.14, 160, (g, W, H) => {
    const u = W / FOLDER_W;
    g.setLineDash([0.12 * u, 0.08 * u]); g.strokeStyle = "#6e7681"; g.lineWidth = 0.03 * u;
    g.beginPath(); outline(g, u, 2.14, 2.0); g.stroke();
  });
  slot.set({}); slot.mesh.position.set(FOLDER_X, -24.49, -2.7); root.add(slot.mesh);
  // the invoice folder (14): the rule shown, in the wall's folder look; its outline draws round the lines (k)
  invoice = kit.panel(FOLDER_W, 2.04, 200, (g, W, H, s) => {
    const u = W / FOLDER_W, k2 = s.k, Hu = 2.04;
    g.save(); g.globalAlpha = k2;
    g.beginPath(); outline(g, u, Hu, TAB_R); g.clip();
    const gr = g.createLinearGradient(0, TAB_H * u, 0, H); gr.addColorStop(0, "#12291e"); gr.addColorStop(1, "#0e2017");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = "#13301f"; g.fillRect(0, 0, W, TAB_H * u);
    g.fillStyle = "rgba(106,208,138,0.06)"; g.fillRect(0, (TAB_H - 0.012) * u, (TAB_R + 0.24) * u, 0.024 * u);
    g.restore();
    // the outline draws round from the tab's top-left corner (dash length = drawn share of the perimeter)
    const per = 2 * (FOLDER_W + Hu) * u;
    g.setLineDash([per * k2, per]); g.strokeStyle = "#6ad08a"; g.lineWidth = 0.045 * u; g.lineCap = "round";
    g.beginPath(); outline(g, u, Hu, TAB_R); g.stroke(); g.setLineDash([]);
    g.globalAlpha = cl(k2 * 1.6);
    g.fillStyle = "#b9f0c9"; g.font = `700 ${0.44 * u}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle"; g.fillText("invoice", 0.24 * u, (TAB_H / 2) * u + 2);
    g.globalAlpha = 1;
    g.font = `600 ${0.42 * u}px 'IBM Plex Mono', monospace`;
    [s.a, s.b].forEach((line, n) => {
      if (!line) return; const y = (TAB_H + 0.38 + 0.6 * n) * u, fw = Math.min(line.length, 7);
      g.fillStyle = "#b9f0c9"; g.fillText(line.slice(0, fw), 0.4 * u, y); g.fillStyle = "#7f9fc2"; g.fillText(line.slice(fw), 0.4 * u + g.measureText(line.slice(0, fw)).width, y);
    });
  });
  invoice.mesh.position.set(FOLDER_X, -22.05, -2.7); root.add(invoice.mesh);

  // card 36's lone copy (`send` in white: new, unclaimed) and its two stamps ride one carrier
  carrier = new THREE.Group(); root.add(carrier);
  loneEdge = kit.toon("#4f93d6", { transparent: true });
  lone = faceBox(2.4, 0.56, 0.04, 210, drawCardFace, loneEdge, { transparent: true });
  lone.set({ n: 36, name: NAMES[36], lit: 0, white: true }); carrier.add(lone.mesh);
  // the stamps sit on the face's right half (x 0.32..1.18, clear of `send_invoice`, which ends at 0.16), 0.14 in front
  [["build", 0.13, -0.06, S.build], ["deploy", -0.13, 0.045, S.deploy]].forEach(([word, y, rz, at]) => {
    const p = kit.panel(0.86, 0.23, 600, drawStamp(word)); p.set({});
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ color: "#6ad08a", map: kit.glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.set(0.75, y, 0.12);
    carrier.add(p.mesh, glow);
    stamps.push({ p, glow, y, rz, at });
  });
  // the red strike across it (14): the wrong name
  strike = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 0.02), new THREE.MeshBasicMaterial({ color: "#e0675a", transparent: true }));
  root.add(strike);
  // the AI's search key: an `invoice` chip, kin to the `memory` chip (column.js)
  chip = kit.panel(1.15, 0.34, 400, (g, W, H) => {
    g.fillStyle = "#1f5a35"; kit.rr(g, 3, 3, W - 6, H - 6, H / 2); g.fill(); g.strokeStyle = "#6ad08a"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.14)"; kit.rr(g, 16, 9, W - 32, 6, 3); g.fill();
    g.fillStyle = "#b9f0c9"; g.font = "600 70px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("invoice", W / 2, H / 2 + 3);
  });
  chip.set({}); root.add(chip.mesh);
  // the miss: a small red "?" by the chip (red: it marks the failure)
  ask = kit.panel(0.44, 0.44, 400, (g, W, H) => {
    g.fillStyle = "#3a1714"; g.beginPath(); g.arc(W / 2, H / 2, W / 2 - 6, 0, 2 * Math.PI); g.fill();
    g.strokeStyle = "#e0675a"; g.lineWidth = 9; g.stroke();
    g.fillStyle = "#ffb3a8"; g.font = "700 112px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", W / 2, H / 2 + 5);
  });
  ask.set({}); root.add(ask.mesh);
  askGlow = new THREE.Sprite(new THREE.SpriteMaterial({ color: "#e0675a", map: kit.glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  root.add(askGlow);
  return root;
}

// a decaying bump (1 at d = 0.06 s after a, gone after about 0.5 s)
const hit = (t, a, decay = 0.18) => (t < a ? 0 : t - a < 0.06 ? (t - a) / 0.06 : Math.exp(-(t - a - 0.06) / decay));
// a quick sine beat over d seconds from a
const beat = (t, a, d) => Math.sin(Math.PI * cl((t - a) / d));

export function update(t) {
  const out = 1 - r01(t, T.rename, 0.4); // everything at S4 fades on "Rename"

  // ---------- the lone copy: peels off card 36 and flies into the empty slot (1.0 s), then wobbles ----------
  const p = (t - T.c36Copy) / 1.0;
  const [x, y, z, s] = flightAt(cardY(36), LONE[0], LONE[1], p, 0.8); // camera-r2 clock 5: lands at scale 0.8
  const big = io(r01(t, T.invoice1, 0.6)); // 14: the same copy scales up in its slot
  const sc = mix(s, 2.2, big);
  // the wobble eases in after landing (no snap to a mid-swing angle); the miss and the strike knock it
  const wob = 0.05 * Math.sin((2 * Math.PI * t) / 1.6) * (1 - 0.6 * big) * r01(t, S.land - 0.2, 0.5);
  const knock = -0.035 * beat(t, S.miss1, 0.35) - 0.025 * beat(t, S.miss2, 0.3) - 0.04 * Math.sin(Math.PI * cl((t - T.send3 - 0.15) / 0.3)) * hit(t, T.send3 + 0.15, 0.3);
  carrier.visible = out > 0.001;
  carrier.position.set(x, y - 0.02 * beat(t, S.miss1, 0.35), z);
  carrier.scale.setScalar(sc * (1 - 0.03 * beat(t, T.send3 + 0.2, 0.3)));
  carrier.rotation.set(0, 0, wob + knock);
  lone.mesh.visible = p >= 0;
  // the cost: the miss dims it (until "invoice" brings it back up to be struck), edge going grey with it
  const dim = r01(t, S.miss1 + 0.05, 0.5) * (1 - r01(t, T.invoice1 - 0.1, 0.4));
  const la = r01(t, T.c36Copy, 0.15) * out * mix(1, 0.4, dim);
  // while the chip dips onto it, `send` is read: a white plate behind it (the word that is there, not `invoice`)
  const read = Math.max(beat(t, S.dip1 - 0.05, 0.45), beat(t, S.dip2 - 0.05, 0.45));
  lone.set({ n: 36, name: NAMES[36], lit: 0, white: true, flag: q(read, 10) });
  fadeMat(lone.face, la); fadeMat(loneEdge, la);
  loneEdge.color.set(mixHex("#4f93d6", "#4a5361", dim));

  // ---------- the stamps: slam on their words (from 0.5 in front, 1.7x, in 0.12 s), squash, then ride the copy ----------
  stamps.forEach((st) => {
    const a = t - (st.at - 0.12);
    const gone = r01(t, S.stampsOut, 0.35);
    const on = a >= 0 && gone < 1 && out > 0.001;
    st.p.mesh.visible = on; st.glow.visible = on;
    st.p.mesh.scale.setScalar(1); st.p.mesh.position.set(0.75, st.y, 0.14); st.p.mesh.rotation.set(0, 0, st.rz);
    if (!on) return;
    const f = cl(a / 0.12), f2 = f * f;
    const sq = 0.09 * beat(t, st.at, 0.16); // the squash on impact
    st.p.mesh.position.z = 0.14 + 0.5 * (1 - f2);
    st.p.mesh.scale.set(mix(1.7, 1, f2) * (1 + sq) * (1 - 0.25 * gone), mix(1.7, 1, f2) * (1 - sq) * (1 - 0.25 * gone), 1);
    fadeMat(st.p.mesh.material, cl(a / 0.06) * (1 - gone) * out);
    const h = hit(t, st.at, 0.2);
    st.glow.material.opacity = 0.75 * h * (1 - gone);
    st.glow.scale.set(1.2 + 0.6 * h, 0.5 + 0.3 * h, 1);
  });

  // ---------- the AI's search key: in, tries `send`, no match; backs off, tries again; leaves ----------
  const chipOn = t >= S.chipIn && t < S.chipOut + 0.3 && out > 0.001;
  chip.mesh.visible = chipOn;
  chip.mesh.scale.setScalar(1); chip.mesh.rotation.set(0, 0, 0);
  if (chipOn) {
    const slide = io(r01(t, S.chipIn, S.dip1 - 0.05 - S.chipIn));             // 3.55 -> the word
    const backOff = io(r01(t, S.back2, 0.25)) * (1 - io(r01(t, S.back2 + 0.25, S.dip2 - 0.05 - S.back2 - 0.25)));
    let cx = mix(LONE[0] - 1.35, WORD_X, slide) - 0.35 * backOff;
    // the tries: a lift (anticipation), then a dip onto the word
    const tryAt = (a) => 0.05 * beat(t, a - 0.22, 0.2) - 0.08 * beat(t, a, 0.26);
    // no: a decaying shake of the head, after each dip
    const no = (a, amp) => amp * Math.sin((2 * Math.PI * (t - a)) / 0.2) * (1 - r01(t, a, 0.45)) * (t >= a ? 1 : 0);
    cx += no(S.miss1 + 0.04, 0.05) + no(S.miss2 + 0.04, 0.035);
    const droop = io(r01(t, S.miss1 + 0.3, 0.3)) * (1 - io(r01(t, S.back2, 0.25))) + io(r01(t, S.miss2 + 0.35, 0.3));
    const cy = CHIP_Y + tryAt(S.dip1) + tryAt(S.dip2) - 0.03 * droop + 0.02 * Math.sin(t * 2.6);
    chip.mesh.position.set(cx, cy, CHIP_Z);
    chip.mesh.rotation.set(0, 0, 0.03 * Math.sin(t * 3.3) - 0.07 * droop + 4 * (no(S.miss1 + 0.04, 0.05) + no(S.miss2 + 0.04, 0.035)) * 0.5);
    const inS = back(r01(t, S.chipIn, 0.3)), outS = 1 - io(r01(t, S.chipOut, 0.3));
    chip.mesh.scale.setScalar(Math.max(0.001, inS * outS));
    fadeMat(chip.mesh.material, r01(t, S.chipIn, 0.1) * outS);
  }

  // ---------- the "?": pops on the first miss, bumps on the second, leaves with the chip ----------
  const askOn = t >= S.miss1 && t < S.chipOut + 0.35 && out > 0.001;
  ask.mesh.visible = askOn; askGlow.visible = askOn;
  ask.mesh.scale.setScalar(1);
  if (askOn) {
    const ax = WORD_X + 0.55, ay = CHIP_Y + 0.52 + 0.025 * Math.sin(t * 2.2 + 1.0);
    const pop = back(r01(t, S.miss1, 0.3)) * (1 + 0.22 * beat(t, S.miss2, 0.28)) * (1 - io(r01(t, S.chipOut + 0.05, 0.3)));
    ask.mesh.position.set(ax, ay, CHIP_Z + 0.02);
    ask.mesh.rotation.set(0, 0, 0.08 * Math.sin(t * 1.9));
    ask.mesh.scale.setScalar(Math.max(0.001, pop));
    fadeMat(ask.mesh.material, r01(t, S.miss1, 0.08) * (1 - r01(t, S.chipOut + 0.05, 0.3)));
    const h = hit(t, S.miss1, 0.25) + 0.7 * hit(t, S.miss2, 0.25);
    askGlow.position.set(ax, ay, CHIP_Z);
    askGlow.material.opacity = 0.6 * cl(h);
    askGlow.scale.setScalar(0.7 + 0.5 * cl(h));
  }

  // ---------- the slot's dashed outline draws in over the flight's last 0.4 s ----------
  const sa = r01(t, T.c36Copy + 0.6, 0.4) * out;
  slot.mesh.visible = sa > 0.001; fadeMat(slot.mesh.material, sa);
  slot.mesh.scale.setScalar(mix(0.97, 1, sa));

  // ---------- the invoice folder: draws in on "invoice" (1), lines type on "invoice" (2) and (3) ----------
  const ik = r01(t, T.invoice1 - 0.1, 0.6);
  const ia = cl(ik * 3) * out;
  invoice.mesh.visible = ia > 0.001; fadeMat(invoice.mesh.material, ia);
  invoice.set({ k: q(io(ik)), a: typed("invoice_get", T.invoice2, 14, t), b: typed("invoice_send", T.invoice3, 14, t) });

  // ---------- the strike on "send invoice" (the "Not") ----------
  const k = io(r01(t, T.send3, 0.4));
  const len = 2.4 * sc * 0.92;
  strike.visible = k > 0.001 && out > 0.001;
  strike.scale.set(Math.max(0.001, len * k), 1, 1);
  strike.position.set(x - len / 2 + (len * k) / 2, y + 0.12 * sc, z + 0.1);
  strike.rotation.copy(carrier.rotation);
  fadeMat(strike.material, out);
}
