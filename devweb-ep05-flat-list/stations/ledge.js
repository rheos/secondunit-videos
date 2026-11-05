// S1 the ledge (boards 01, 02, 05, 06, 07; seen in the wides): Blink and its harness on the ledge at the top of the
// shaft, the carabiner that holds the cord, the white "save this" card (pencil), the empty-ask outline, the amber
// result card (eye) and the amber light that carries it up the cord. Dressed (animator pass): full Blink, a rig that
// pivots at its feet so every squash, lean and tug keeps it standing on the ledge, a contact shadow, a trimmed and
// riveted ledge, a real pencil on the request card, a grey that crossfades in, and Blink acting on keyed, eased tracks.
// Every position, size and time is the animatic's.
import { T, CARD_Z, cardY, track, fadeMat, mixHex, cl, io, r01, mix } from "../parts.js";

let THREE, root, rig, blink, harness, crab, shadow, save, saveMat, outline, amber, amberLight, kitRef;
const FEET = -1.08; // Blink's lowest point (blink-geo B); the ledge top is -1.10
const LOOP_H = 0.335; // the gear loop's height above the feet

export function build(scene, kit) {
  THREE = kit.THREE; kitRef = kit;
  root = new THREE.Group(); scene.add(root);
  // the ledge: a slate slab with a lit lip along its front top edge and four rivets on its face
  const ledge = new THREE.Mesh(new kit.RoundedBoxGeometry(4.4, 0.6, 3.7, 3, 0.08), kit.toon("#2a3344"));
  ledge.position.set(0, -1.40, -0.95); root.add(ledge);
  const lip = new THREE.Mesh(new kit.RoundedBoxGeometry(4.24, 0.05, 0.05, 2, 0.02), kit.toon("#3e4b62"));
  lip.position.set(0, -1.135, 0.885); root.add(lip);
  const rivetGeo = new THREE.SphereGeometry(0.05, 14, 10), rivetMat = kit.toon("#4a5770");
  [-1.8, -1.0, 1.0, 1.8].forEach((x) => { const r = new THREE.Mesh(rivetGeo, rivetMat); r.position.set(x, -1.42, 0.9); r.scale.z = 0.5; root.add(r); });
  // the contact shadow on the ledge top: it spreads when Blink squashes
  shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: "#05080c", transparent: true, opacity: 0.4, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -1.095, 0.02); root.add(shadow);
  // Blink (the full model) and the harness, in a rig whose origin is Blink's feet: squash, lean and tilt pivot there
  rig = new THREE.Group(); rig.position.set(0, FEET, 0); root.add(rig);
  blink = kit.makeBlink(THREE, kit.G, kit.ramp); blink.root.position.set(0, -FEET, 0); rig.add(blink.root);
  harness = kit.makeHarness(THREE, kit.G, kit.ramp); harness.root.position.set(0, -FEET, 0); rig.add(harness.root);
  Object.values(harness.tools).forEach((k) => (k.pivot.visible = false)); // the cord's cards are the tools
  // the carabiner on the gear loop that holds the cord: rides the loop's height as Blink squashes
  crab = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 28), kit.toon("#c9d1d9"));
  crab.scale.set(0.9, 1.5, 1); crab.position.set(0, -0.80, 1.08); root.add(crab);

  // "save this": a white request card with a pencil (write); crossfades to grey when nothing saves it
  save = kit.panel(1.95, 0.62, 300, (g, W, H, s) => {
    const fill = mixHex("#eef2f6", "#6e7681", s.grey);
    g.fillStyle = fill; kit.rr(g, 4, 4, W - 8, H - 8, 30); g.fill();
    g.strokeStyle = mixHex("#c9d1d9", "#596270", s.grey); g.lineWidth = 3; kit.rr(g, 5.5, 5.5, W - 11, H - 11, 29); g.stroke();
    // the pencil, tip at lower left: lead, sharpened wood, body, ferrule, eraser, all in ink
    g.save(); g.translate(98, H / 2); g.rotate(-Math.PI / 4);
    g.strokeStyle = "#0d1117"; g.lineWidth = 7; g.lineJoin = "round"; g.lineCap = "round";
    g.fillStyle = fill; g.beginPath(); g.moveTo(-36, -15); g.lineTo(40, -15); g.lineTo(40, 15); g.lineTo(-36, 15); g.lineTo(-64, 0); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-36, -15); g.lineTo(-36, 15); g.stroke(); // where the paint ends
    g.beginPath(); g.moveTo(-36, 0); g.lineTo(40, 0); g.lineWidth = 3; g.stroke(); g.lineWidth = 7; // the facet line
    g.fillStyle = "#0d1117"; g.beginPath(); g.moveTo(-53, -6); g.lineTo(-66, 0); g.lineTo(-53, 6); g.closePath(); g.fill(); // the lead
    g.fillStyle = "#0d1117"; g.fillRect(40, -15, 11, 30); // the ferrule
    g.fillStyle = fill; g.beginPath(); g.roundRect(51, -15, 16, 30, [0, 9, 9, 0]); g.fill(); g.stroke(); // the eraser
    g.restore();
    g.fillStyle = "#0d1117"; g.font = "600 60px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.fillText("save this", 175, H / 2 + 2);
  });
  saveMat = save.mesh.material; root.add(save.mesh);
  // where it was: a dashed grey outline, nothing inside
  outline = kit.panel(1.95, 0.62, 300, (g, W, H) => { g.setLineDash([24, 16]); g.strokeStyle = "#6e7681"; g.lineWidth = 8; kit.rr(g, 6, 6, W - 12, H - 12, 30); g.stroke(); });
  outline.set({}); outline.mesh.position.set(1.75, 1.15, 0.7); root.add(outline.mesh);
  // the amber result: an eye (reads) and the words: this tool reads, it never writes
  amber = kit.panel(1.7, 1.05, 300, (g, W, H) => {
    g.fillStyle = "#d6a45a"; kit.rr(g, 4, 4, W - 8, H - 8, 30); g.fill();
    g.strokeStyle = "#b8873f"; g.lineWidth = 3; kit.rr(g, 5.5, 5.5, W - 11, H - 11, 29); g.stroke();
    const ex = W * 0.25, ey = H / 2;
    g.strokeStyle = "#0d1117"; g.lineWidth = 16; g.beginPath(); g.moveTo(ex - 108, ey); g.quadraticCurveTo(ex, ey - 120, ex + 108, ey); g.quadraticCurveTo(ex, ey + 120, ex - 108, ey); g.stroke();
    g.fillStyle = "#0d1117"; g.beginPath(); g.arc(ex, ey, 44, 0, Math.PI * 2); g.fill(); g.fillStyle = "#d6a45a"; g.beginPath(); g.arc(ex + 14, ey - 14, 12, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#0d1117"; g.font = "700 100px 'IBM Plex Mono', monospace"; g.textBaseline = "middle"; g.textAlign = "left";
    g.fillText("read", W * 0.5, H * 0.33); g.fillText("only", W * 0.5, H * 0.7);
  });
  amber.set({}); root.add(amber.mesh);
  amberLight = new THREE.Sprite(new THREE.SpriteMaterial({ color: "#d6a45a", map: kit.glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  amberLight.scale.setScalar(0.6); root.add(amberLight);
  return root;
}

// ---------- acting helpers (pure functions of t) ----------
// a damped spring that starts and ends at 0: n half-waves of length half, decaying at k
const spring = (u, a, half, n, k) => (u <= 0 || u >= n * half ? 0 : a * Math.sin((Math.PI * u) / half) * Math.exp(-k * u));
// anticipation then release: a dip of -0.6a over 0.14 s before t0, then a spring of a after it
const pop = (t, t0, a) => { const u = t - t0; return u < -0.14 ? 0 : u < 0 ? -0.6 * a * Math.sin((Math.PI * (u + 0.14)) / 0.14) : spring(u, a, 0.18, 6, 3.2); };
const pulse = (t, c, d = 0.07) => Math.max(0, 1 - Math.abs(t - c) / d);
// eyes (look, lookY) and yaw toward a world point; Blink's eyes sit at about y 0.24
const aimX = (x) => Math.max(-1.05, Math.min(1.05, x / 1.6));
const aimY = (y) => Math.max(-1.1, Math.min(0.7, (y - 0.24) / 1.4));

// the "save this" card and the amber card as functions of t (Blink watches them, so both are computed up front)
function saveAt(t) {
  const fall = io(r01(t, T.nothing1 + 0.1, T.there1 + 1.0 - T.nothing1 - 0.1));
  // supervisor 01 L8: it slides out to the right as it tips, before it drops, so the whole fall stays clear of
  // Blink's shoulder (x <= 1.05) and the column (x <= 1.23); a small sway, never back toward them
  const drift = io(r01(t, T.nothing1 - 0.1, 1.0));
  const sway = 0.07 * Math.sin((t - T.nothing1) * 1.9) * fall;
  const hold = 1 - fall; // the float while it waits (ep 3 hold rule)
  return [mix(1.75, 2.45, drift) + sway, mix(1.15, -5.2, fall) + 0.025 * Math.sin((t / 2.3) * Math.PI * 2) * hold, mix(0.7, 1.9, fall), fall];
}
function amberAt(t) {
  const a0 = T.recent1 + 0.4, a1 = T.saved1;
  const up = io(r01(t, a0, a1 - a0));
  // supervisor 01 L6: it leaves card 12 to the LEFT and climbs the gutter beside the column, so it never covers
  // memory_recent (or any name on the way up); small while beside the cards, growing once above them, and it ends
  // where the animatic put it, up beside Blink's left, never across the face
  const y = mix(cardY(12), 1.15, up);
  const s = mix(0.22, 1, io(cl((y + 4.0) / 5.15))); // its size (the card at full size is 1.7 x 1.05)
  const h = io(cl((y + 1.8) / 1.6)); // 0 beside the column, 1 once it is above the ledge
  const x = mix(-1.36 - 0.85 * s, -1.75, h); // right edge 0.13 clear of the card backers (x -1.23)
  const held = r01(t, a1, 0.4);
  return [x, y + 0.025 * Math.sin(((t - a1) / 2.1) * Math.PI * 2) * held, mix(1.45, 0.7, h), up, y, s];
}

// ---------- Blink's performance: keyed tracks, eased between keys (ep 3) ----------
let TR;
function tracks() {
  const s = T.save2, m = T.memory1, SX = aimX(1.75), SY = aimY(1.15), AX = aimX(-1.75), AY = aimY(1.15);
  return {
    // eyes across: down the column (01), to the card as it arrives (05), after the chip to the cord, then the
    // amber card, a glance back at the waiting card on "nothing", the double-take on "errors", the empty outline
    look: track([[0, 0], [s - 0.05, 0], [s + 0.3, SX], [m + 0.1, SX], [m + 0.6, 0.1], [T.name1 - 0.6, 0.05], [T.name1, -0.28], [T.takes + 0.6, -0.28], [T.takes + 1.0, 0],
      [T.saved1 + 0.3, AX], [T.nothing1 - 0.45, AX], [T.nothing1 - 0.15, SX], [T.errors + 0.15, 0], [T.errors + 0.75, 0], [T.errors + 1.1, SX], [T.there1 + 0.7, SX], [T.why + 0.4, 0]]),
    lookY: track([[0, -0.9], [T.say, -0.9], [T.say + 0.5, 0], [T.asks, 0], [T.asks + 0.3, -1.0], [T.back, -1.0], [T.back + 0.5, 0], [s - 0.05, 0], [s + 0.3, SY], [m + 0.1, SY],
      [m + 0.6, 0], [T.name1 - 0.6, 0], [T.name1, -1.0], [T.takes + 1.0, -1.0], [T.saved1 + 0.3, AY], [T.nothing1 - 0.45, AY], [T.nothing1 - 0.15, SY], [T.errors + 0.15, 0],
      [T.errors + 0.75, 0], [T.errors + 1.1, SY], [T.there1 + 0.7, SY], [T.why + 0.4, -1.0], [T.far, -1.0], [T.far + 0.6, 0]]),
    // the whole body turns a little toward what the eyes are on
    yaw: track([[0, 0], [s - 0.05, 0], [s + 0.3, 0.2], [m + 0.1, 0.2], [m + 0.6, 0], [T.saved1 - 0.6, 0], [T.saved1 + 0.2, -0.18], [T.nothing1 - 0.45, -0.18], [T.nothing1 - 0.1, 0.18],
      [T.errors, 0.18], [T.errors + 0.2, 0], [T.errors + 0.75, 0], [T.errors + 1.1, 0.16], [T.there1 + 0.7, 0.16], [T.why + 0.4, 0]]),
    // head tilt: curious while it thinks, doubtful at the read-only card
    tilt: track([[0, 0], [m - 0.5, 0], [m - 0.2, 0.06], [m + 0.4, 0.06], [m + 0.7, 0], [T.saved1 + 0.4, 0], [T.saved1 + 0.7, -0.045], [T.nothing1 - 0.5, -0.045], [T.nothing1 - 0.2, 0]]),
    // expressions, crossfading over about 0.15 s. happy and eager stay under 0.5: the kit swaps the smile for the
    // grin at 0.5 in one frame, so the acting lives in the eyes
    happy: track([[0, 0], [T.back + 0.05, 0], [T.back + 0.2, 0.45], [T.back + 1.0, 0.45], [T.back + 1.15, 0], [T.folderE + 0.4, 0], [T.folderE + 0.7, 0.48]]),
    eager: track([[0, 0], [s - 0.05, 0], [s + 0.1, 0.45], [m - 0.6, 0.45], [m - 0.45, 0], [T.name1 - 0.1, 0], [T.name1 + 0.1, 0.3], [T.takes + 0.6, 0.3], [T.takes + 0.9, 0],
      [T.saved1 - 0.2, 0], [T.saved1, 0.45], [T.saved1 + 0.35, 0.45], [T.saved1 + 0.5, 0]]),
    skew: track([[0, 0], [T.saved1 + 0.4, 0], [T.saved1 + 0.55, -0.7], [T.nothing1 - 0.5, -0.7], [T.nothing1 - 0.35, 0]]),
    think: track([[0, 0], [m - 0.5, 0], [m - 0.38, 1], [m + 0.4, 1], [m + 0.52, 0]]),
    // the slump on "nothing is saved", back up on "why"
    slump: track([[0, 0], [T.nothing1, 0], [T.nothing1 + 0.45, 1], [T.why, 1], [T.why + 0.5, 0]]),
  };
}
const BLINKS = [1.7, 13.0, 16.4, 23.4, 30.0, 32.72, 34.4, 38.6, 85.5, 88.5, 127.6];

export function update(t) {
  TR = TR || tracks();
  const SV = saveAt(t), AM = amberAt(t);

  // ---------- where the eyes go: the keyed track, or a follow of the moving card it is watching ----------
  // the amber light coming up the cord and over to the left (06); the grey card falling away (07)
  const wAmb = r01(t, T.recent1 + 0.2, 0.3) * (1 - r01(t, T.saved1 + 0.05, 0.25));
  const wFall = r01(t, T.nothing1 + 0.05, 0.25) * (1 - r01(t, T.errors - 0.05, 0.2));
  let look = TR.look(t), lookY = TR.lookY(t), yaw = TR.yaw(t);
  look = mix(mix(look, aimX(AM[0]), wAmb), aimX(SV[0]), wFall);
  lookY = mix(mix(lookY, aimY(AM[1]), wAmb), aimY(SV[1]), wFall);
  yaw = mix(mix(yaw, 0.12 * aimX(AM[0]), wAmb), 0.18, wFall);
  yaw += 0.06 * Math.sin((t / 3.1) * Math.PI * 2);

  // ---------- the body: breathing squash, pops, the tug, a lean that follows the eyes down ----------
  const slump = TR.slump(t);
  const sy = 1 + 0.015 * Math.sin((t / 1.7) * Math.PI * 2)
    + pop(t, T.back + 0.05, 0.035) + pop(t, T.save2 - 0.02, 0.06) + pop(t, T.saved1, 0.04) + pop(t, T.folderE + 0.4, 0.05)
    - 0.045 * slump;
  const sxz = 1 / Math.sqrt(sy);
  // lean forward (+x rotation): peering down when the eyes are down, the nod as the request leaves (02),
  // the harness's tug (06): a lean back, then a lurch forward that settles
  const tug = (u) => (u < -0.15 ? 0 : u < 0 ? -0.035 * Math.sin((Math.PI * (u + 0.15)) / 0.15) : spring(u, 0.1, 0.12, 6, 5));
  const lean = 0.06 * Math.max(0, -lookY) + spring(t - T.it1, 0.05, 0.16, 4, 4) + tug(t - T.takes) + 0.04 * slump;
  rig.position.set(0, FEET, 0);
  rig.scale.set(sxz, sy, sxz);
  rig.rotation.set(lean, yaw, TR.tilt(t), "YXZ");
  shadow.scale.set(1.05 * sxz, 0.9 * sxz, 1);
  shadow.material.opacity = 0.4 - 0.08 * (sy - 1) / 0.06;
  crab.position.set(0, -0.80 + (sy - 1) * LOOP_H, 1.08);
  crab.rotation.set(0, 0, 0.6 * yaw);

  // ---------- the face ----------
  const blinkK = Math.max(...BLINKS.map((c) => pulse(t, c)));
  blink.face({ blink: blinkK, happy: TR.happy(t), eager: TR.eager(t), skew: TR.skew(t), look, lookY, think: TR.think(t), phase: t * 1.6 });
  // buckle glow: the request leaves (02), the tug (06)
  const glow = Math.max(0.8 * r01(t, T.it1 - 0.15, 0.1) * (1 - r01(t, T.it1 + 0.25, 0.3)), 0.8 * r01(t, T.takes, 0.1) * (1 - r01(t, T.takes + 0.4, 0.3)));
  harness.buckleGlow.material.opacity = glow;

  // ---------- "save this": in on "save" (2), waits, greys on "nothing" (1), falls out of frame by "errors"; faint in 10 ----------
  const late = t >= T.finds - 0.6 && t < T.problem1 + 0.4;
  save.set({ grey: Math.round(r01(t, T.nothing1 - 0.05, 0.35) * 20) / 20 });
  save.mesh.rotation.set(0, 0, 0); save.mesh.scale.setScalar(1);
  if (late) {
    const k = r01(t, T.finds - 0.6, T.problem1 + 0.4 - (T.finds - 0.6));
    save.mesh.position.set(2.4, mix(-13.8, -19.5, k), 1.9); save.mesh.rotation.set(0, 0, 0.3 * Math.sin(t * 0.9));
    fadeMat(saveMat, 0.35 * r01(t, T.finds - 0.6, 0.4) * (1 - r01(t, T.problem1 - 0.2, 0.5)));
    save.mesh.visible = true;
  } else {
    save.mesh.visible = t >= T.save2 - 0.1 && t < T.there1 + 1.0;
    // it arrives from the upper right with a little overshoot, and fades in as it comes
    const sIn = r01(t, T.save2 - 0.1, 0.35), arr = 1 - io(sIn);
    const fall = SV[3];
    save.mesh.position.set(SV[0] + 0.7 * arr, SV[1] + 0.35 * arr, SV[2]);
    // a slow tumbling drift, a leaf rather than a stone; it tips first, as if let go
    const tip = 0.08 * Math.sin(Math.PI * r01(t, T.nothing1 - 0.1, 0.45));
    save.mesh.rotation.set(0, 0.25 * Math.sin(t * 1.3) * fall, -0.5 * fall + 0.25 * Math.sin((t - T.nothing1) * 1.9 + 0.8) * fall + tip - 0.12 * arr + 0.015 * Math.sin((t / 2.3) * Math.PI * 2 + 1) * (1 - fall));
    save.mesh.scale.setScalar(Math.max(0.01, mix(0.55, 1, kitRef.back(sIn))));
    fadeMat(saveMat, cl(sIn / 0.6) * (1 - r01(t, T.there1 + 0.5, 0.5)));
  }
  // the empty outline where it was: in with the fall, out a second later; the empty slot breathes
  const oA = r01(t, T.nothing1 + 0.1, 0.4) * (1 - r01(t, T.there1 + 0.8, 0.4));
  outline.mesh.visible = oA > 0.001; fadeMat(outline.mesh.material, (0.6 + 0.25 * Math.sin(t * 3.1)) * oA);
  outline.mesh.scale.setScalar(1 + 0.03 * Math.sin(t * 3.1));

  // ---------- the amber result: leaves card 12 at "recent" + 0.4, up the cord, out and up to Blink's left by "saved" ----------
  const a0 = T.recent1 + 0.4, up = AM[3];
  const aOn = t >= a0 && t < T.why + 0.6;
  amber.mesh.visible = aOn;
  amber.mesh.position.set(AM[0], AM[1], AM[2]);
  amber.mesh.rotation.set(0, 0, 0.02 * Math.sin(((t - T.saved1) / 2.7) * Math.PI * 2) * r01(t, T.saved1, 0.4));
  const aIn = r01(t, a0, 0.25), aOut = r01(t, T.why, 0.5);
  amber.mesh.scale.setScalar(mix(0.6, 1, io(aIn)) * AM[5] * mix(1, 0.92, aOut));
  fadeMat(amber.mesh.material, aIn * (1 - aOut));
  const lA = r01(t, a0, 0.15) * (1 - cl((up - 0.7) / 0.15));
  amberLight.visible = t >= a0 && lA > 0.001;
  amberLight.material.opacity = lA;
  amberLight.position.set(0, AM[4] - 0.2, CARD_Z - 0.04);
}
