// S2 the cord column (boards 01-10, 15): the cord, 35 cards (36 in VIII-IX) clipped on in written order, the read
// lane and the pulse head, the `memory` chip, the request card (02), the blue streak (03), the counter and the
// bracket (09). Cards rise, swing, tug, light and recolour, all from t. The cord never reorders.
// Dressed (animator pass): cards are boards (a printed face on a bevelled backer, top-lit, with a steel binder clip
// gripping the top edge on a ring round the cord); the cord has weight and a slow sway that carries its cards; a
// first word blooms when it lights and decays to a steady glow; card 11 owns a halo that goes white as the subject
// on "write" and red on "misses", and on "lost note" it pulses, swings off the cord and its `write` flares.
// Every position, size and time is the animatic's, except card 11's subject cue (now on "write") and the payoff beat.
import { T, w, NAMES, MEMORY, family, CORD_Z, CARD_Z, COL_X, MOUTH_Y, cardY, faceBox, fadeMat, mixHex, cl, io, r01, mix, V } from "../parts.js";
import { rr } from "../kit/world.js";

// red to blue without purple (supervisor 01 L7): a straight RGB mix of the palette's blue and red lands on lavender
// halfway, so the cooling runs blue <- grey <- red, through a neutral of the pair's mean level, and never mixes hue
const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function viaGrey(a, b, k) {
  const m = Math.round([...hexRGB(a), ...hexRGB(b)].reduce((s, x) => s + x, 0) / 6).toString(16).padStart(2, "0");
  const G = "#" + m + m + m;
  return k < 0.5 ? mixHex(a, G, 2 * k) : mixHex(G, b, 2 * k - 1);
}
const redMix = (a, b, k, cool) => (cool ? viaGrey(a, b, k) : mixHex(a, b, k));

let THREE, root, kit;
const cards = [];
let cord, cordBase, lane, pulseHead, pulseCore, pulseGlow, trail, chip, req, reqTrail, streak, counter, bracket, ticks;
const tags = []; // the three memory names, brought out big enough to read (first watch item 3)

// the payoff beat (first watch 02 item 3) and the subject cue (item 2), on Chris's words
const TL = { thats: w("that's", 1), lost: w("lost", 1), hurts: w("hurts", 1) };
const SPOT_IN = T.write1 - 0.5; // write_memory is the bright subject by "write" (58.26), not ~1 s after it

// ---------- the read passes: [time, y] polylines down the first-word column ----------
const PASSES = () => [
  { keys: [[T.first1, -1.82], [T.memory2, cardY(33)]], mem: true, chip: true },                              // 05: the chip
  { keys: [[T.why + 0.3, -1.82], [T.except, cardY(11)], [T.name2, cardY(16)], [T.far, cardY(35) - 0.3]], mem: false }, // 08
  { keys: [[T.look, -1.82], [T.finds + 0.3, cardY(33)], [T.finds + 0.5, cardY(35) - 0.3]], mem: true },       // 10
  { keys: [[T.problem2, cardY(1) + 0.3], [T.anything, cardY(35) - 0.3]], mem: false },                       // 11: full run
];
let P;
const passY = (p, t) => { const k = p.keys; if (t <= k[0][0]) return k[0][1]; for (let i = 0; i < k.length - 1; i++) if (t < k[i + 1][0]) return mix(k[i][1], k[i + 1][1], (t - k[i][0]) / (k[i + 1][0] - k[i][0])); return k[k.length - 1][1]; };
const passTime = (p, y) => { const k = p.keys; for (let i = 0; i < k.length - 1; i++) if (y <= k[i][1] && y >= k[i + 1][1]) return mix(k[i][0], k[i + 1][0], (y - k[i][1]) / (k[i + 1][1] - k[i][1])); return Infinity; };

// is card i's first word lit at t?
function litAt(i, t) {
  if (i === 11) return t >= T.rewrite ? 1 : 0;
  if (!family(i)) return 0;
  const y = cardY(i), [p1, p2, p3, p4] = P;
  if (t >= p4.keys[0][0] - 0.05) return MEMORY.has(i) || t >= passTime(p4, y) ? 1 : 0;
  if (t >= T.look - 0.3) return MEMORY.has(i) && t >= passTime(p3, y) ? 1 : 0;
  if (t >= T.why) return t >= passTime(p2, y) && (MEMORY.has(i) || t < T.memory4 - 0.6) ? 1 : 0;
  if (t >= T.first1) return MEMORY.has(i) && t >= passTime(p1, y) ? 1 : 0;
  return 0;
}
// the lit level eased over 0.12 s (no one-frame swap), and the time it last switched on (for the bloom)
function litLevel(i, t) { let s = 0; for (let k = 0; k < 7; k++) s += litAt(i, t - 0.02 * k); return s / 7; }
function litOnset(i, t) {
  if (!litAt(i, t)) return -Infinity;
  for (let k = 1; k <= 40; k++) if (!litAt(i, t - k / 30)) return t - (k - 0.5) / 30;
  return -Infinity;
}
// a glow that blooms in 0.06 s and decays (1 at the peak, 0 long after)
const bloom = (dt, decay = 0.35) => (dt < 0 ? 0 : dt < 0.06 ? dt / 0.06 : Math.exp(-(dt - 0.06) / decay));
const q = (v, n = 10) => Math.round(cl(v) * n) / n;

// ---------- the cord's sway: pinned at the bend (-1.4) and in the box mouth (-27), slow, from t ----------
function swayX(y, t) {
  const s = Math.sin(Math.PI * cl((-1.4 - y) / 25.6));
  return 0.03 * s * (Math.sin((2 * Math.PI * t) / 6.1) + 0.4 * Math.sin((2 * Math.PI * t) / 3.3 + 1.0));
}

// ---------- where card i hangs at t ----------
const V_UP = 12, V_LIST = 14;
function cardYAt(i, t) {
  const y = cardY(i);
  if (i === 36) {
    if (t < T.c36Up || t > T.c36Down + 1.2) return MOUTH_Y - 1;
    if (t < T.c36Down) return mix(MOUTH_Y, y, io(r01(t, T.c36Up, T.word6 - T.c36Up)));
    return mix(y, MOUTH_Y, io(r01(t, T.c36Down, 1.0)));
  }
  if (t < T.say) { // 01: cards 1-9 rattle up out of the box (3 already clipped at frame 0, 9 just leaving)
    if (i > 9) return MOUTH_Y - 1;
    const arrive = 0.25 * (i - 3), dep = arrive - (y - MOUTH_Y) / V_UP;
    return t >= arrive ? y : Math.max(MOUTH_Y, MOUTH_Y + V_UP * (t - dep));
  }
  if (t < T.cardsUp) { // 01 -> 02: back down into the box as one rigid block (camera-r2 clock 1), riding the crane
    if (i > 9) return MOUTH_Y - 1;
    return Math.max(MOUTH_Y - 1, y - 26.1 * io(r01(t, T.your2, 3.0)));
  }
  // 03: the list comes back: card k leaves the mouth 0.06 s after card k-1, all at one speed
  const dep = T.cardsUp + 0.06 * (i - 1);
  return Math.min(y, MOUTH_Y + V_LIST * Math.max(0, t - dep));
}
// how hard card i is moving along the cord (0 at rest): a clip rattle while it runs, a settle when it stops
function cardSpeed(i, t) { return Math.abs(cardYAt(i, t + 0.02) - cardYAt(i, t - 0.02)) / 0.04; }

// ---------- the card face: the board (number strip, name in two runs, two soft lines, { }) ----------
// card units 2.4 x 0.56; ppu 420 -> 1008 x 235, name font 55 px; the longest name (topic_thread_summarize, 22 ch)
// ends at 2.136 of 2.4, the clip covers only the top 0.045 of the face above the name row
const FW = (name) => { const c = name.indexOf("_"); return c < 0 ? name : name.slice(0, c); };
function drawBoard(g, W, H, s) {
  const u = W / 2.4;
  const red = s.red || 0, spot = s.spot || 0, flag = s.flag || 0, lit = s.lit || 0, flare = s.flare || 0, cool = !!s.cool;
  const dimA = 1 - 0.55 * (s.dark || 0);
  // the board: top-lit, a touch darker at the foot
  const base = red > 0 ? redMix("#14243a", "#3a1714", red, cool) :spot > 0 ? mixHex("#14243a", "#2b4c74", spot) : "#14243a";
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, mixHex(base, "#ffffff", 0.08)); gr.addColorStop(0.5, base); gr.addColorStop(1, mixHex(base, "#000000", 0.28));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // the number strip, pressed in
  g.fillStyle = "rgba(0,0,0,0.22)"; rr(g, 0.04 * u, 0.045 * u, 0.3 * u, H - 0.09 * u, 0.03 * u); g.fill();
  // the printed rim, then a light bevel line along the top and a dark one along the foot
  const edgeC = red > 0 ? redMix("#4f93d6", "#e0675a", red, cool) : spot > 0 ? mixHex("#4f93d6", "#ffffff", spot) : "#4f93d6";
  g.strokeStyle = edgeC; g.lineWidth = (0.025 + 0.02 * spot + 0.012 * red) * u; g.strokeRect(0.0125 * u, 0.0125 * u, W - 0.025 * u, H - 0.025 * u);
  g.fillStyle = "rgba(255,255,255,0.16)"; g.fillRect(0.035 * u, 0.034 * u, W - 0.07 * u, 0.009 * u);
  g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0.035 * u, H - 0.043 * u, W - 0.07 * u, 0.009 * u);
  // number
  g.globalAlpha = dimA;
  g.fillStyle = red > 0.5 ? "#c98a82" : "#6e7f93"; g.font = `600 ${0.16 * u}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle";
  g.fillText(String(s.n).padStart(2, "0"), 0.06 * u, 0.2 * u);
  // name row
  const fs = 0.13 * u; g.font = `600 ${fs}px 'IBM Plex Mono', monospace`;
  const nameY = 0.16 * u, x0 = 0.42 * u;
  const drawName = (name, litK, alpha, dy, firstColor, restA = 1) => {
    const fw = FW(name), rest = name.slice(fw.length), fwW = g.measureText(fw).width;
    g.globalAlpha = dimA * alpha;
    if (litK > 0) { // the green underlay, then the first word with a soft bloom of its own
      g.fillStyle = `rgba(106,208,138,${0.24 * litK})`; rr(g, x0 - 0.025 * u, nameY - 0.1 * u + dy, fwW + 0.05 * u, 0.2 * u, 0.03 * u); g.fill();
    }
    if (flag > 0) { const ga = g.globalAlpha; g.globalAlpha = alpha * flag; g.fillStyle = s.flagRed ? "#e0675a" : "#eef2f6"; rr(g, x0 - 0.03 * u, nameY - 0.11 * u + dy, fwW + 0.06 * u, 0.22 * u, 0.03 * u); g.fill(); g.globalAlpha = ga; }
    if (flare > 0) { // the payoff: `write` flares hot on a red plate with a red bloom
      const ga = g.globalAlpha; g.globalAlpha = alpha * flare;
      g.shadowColor = "#ff5a48"; g.shadowBlur = 0.14 * u * flare; g.fillStyle = "#e0675a";
      rr(g, x0 - 0.035 * u, nameY - 0.115 * u + dy, fwW + 0.07 * u, 0.23 * u, 0.035 * u); g.fill();
      g.shadowBlur = 0; g.globalAlpha = ga;
    }
    let c1 = firstColor || (flare > 0.5 ? "#ffffff" : flag > 0.5 ? "#0d1117" : spot > 0.5 ? "#ffffff" : red > 0.5 ? "#ffb3a8" : mixHex("#a9c8ea", "#c8f7d6", litK));
    if (litK > 0 && !flag && !flare) { g.shadowColor = "rgba(106,208,138,0.9)"; g.shadowBlur = 0.05 * u * litK; }
    g.fillStyle = c1; g.fillText(fw, x0, nameY + dy); g.shadowBlur = 0;
    g.fillStyle = spot > 0.5 ? "#ffffff" : red > 0.5 ? "#ffb3a8" : "#7f9fc2";
    if (restA > 0) { g.globalAlpha = dimA * alpha * restA; g.fillText(rest, x0 + fwW + 0.08 * u * (1 - restA), nameY + dy); }
    return fwW + g.measureText(rest).width;
  };
  g.save(); g.beginPath(); g.rect(0.36 * u, 0.04 * u, W - 0.4 * u, 0.24 * u); g.clip();
  if (s.old != null) {
    // the rename: old name struck in red, sliding up and fading; the new one comes in a whole word at a time
    // ("memory" rides up with the slide, then "_write" eases in beside it), so no frame shows a broken word
    const k = s.slide || 0;
    const ow = drawName(s.old, 0, 1 - k, -0.2 * u * k);
    if (s.strike > 0) { g.globalAlpha = 1 - k; g.fillStyle = "#e0675a"; g.fillRect(x0, nameY - 0.01 * u - 0.2 * u * k, ow * s.strike, 0.022 * u); }
    if (s.name && k > 0) drawName(s.name, lit, k, 0.2 * u * (1 - k), null, s.restA || 0);
  } else drawName(s.name, lit, 1, 0, s.white && s.name.startsWith("send") ? "#ffffff" : null);
  g.restore();
  // lower row: two dim, slightly soft description bars and the inputs tab
  g.save(); g.filter = "blur(2px)";
  g.globalAlpha = dimA * 0.3; g.fillStyle = red > 0.5 ? "#b08a86" : "#8b949e";
  rr(g, 0.42 * u, 0.36 * u, 1.3 * u, 0.05 * u, 0.02 * u); g.fill(); rr(g, 0.42 * u, 0.44 * u, 0.88 * u, 0.05 * u, 0.02 * u); g.fill();
  g.restore();
  g.globalAlpha = dimA; const tabC = red > 0.5 ? "#e0675a" : "#4f93d6";
  g.fillStyle = "rgba(79,147,214,0.08)"; rr(g, 1.98 * u, 0.33 * u, 0.32 * u, 0.17 * u, 0.03 * u); g.fill();
  g.strokeStyle = tabC; g.lineWidth = 0.012 * u; g.stroke();
  g.fillStyle = tabC; g.font = `600 ${0.11 * u}px 'IBM Plex Mono', monospace`; g.textAlign = "center"; g.fillText("{ }", 2.14 * u, 0.42 * u); g.textAlign = "left";
  g.globalAlpha = 1;
}

export function build(scene, k) {
  kit = k; THREE = kit.THREE; P = PASSES();
  root = new THREE.Group(); scene.add(root);
  // the cord: one string, nothing branches; heavier than the animatic's, and it sways (its vertices move from t)
  // Two extra points pin the long run flat at CORD_Z: with only the bend and the mouth, the spline bowed forward to
  // z 1.30 near card 11 and ran over the red card's face when it leaned back on "that's" (supervisor 01 H2).
  const curve = new THREE.CatmullRomCurve3([V(0, -0.88, 1.10), V(0, -1.0, 1.2), V(0, -1.4, CORD_Z), V(0, -1.6, CORD_Z), V(0, -1.8, CORD_Z), V(0, -27.0, CORD_Z)]);
  const TUB = 260, RAD = 8, CORD_R = 0.015;
  const cordGeo = new THREE.TubeGeometry(curve, TUB, CORD_R, RAD);
  // each vertex's offset from the centreline, so the shader can widen the tube about its own axis
  const radial = new Float32Array(cordGeo.attributes.position.count * 3), cp = cordGeo.attributes.position.array;
  for (let j = 0; j <= TUB; j++) {
    const ctr = curve.getPointAt(j / TUB);
    for (let r = 0; r <= RAD; r++) { const n = (j * (RAD + 1) + r) * 3; radial[n] = cp[n] - ctr.x; radial[n + 1] = cp[n + 1] - ctr.y; radial[n + 2] = cp[n + 2] - ctr.z; }
  }
  cordGeo.setAttribute("aRadial", new THREE.BufferAttribute(radial, 3));
  // never thinner than 4.5 px of a 1920 px frame (widened at most 3x): in the wides a 0.03 tube is a 3 px line whose
  // edge column shimmers as it sways (supervisor 01 M11, 7.37 s); in the closes it is wider and keeps its own radius
  const cordMat = kit.toon("#8b949e");
  cordMat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec3 aRadial;")
      .replace("#include <begin_vertex>", `vec3 cordC = position - aRadial;
        float cordD = -(modelViewMatrix * vec4(cordC, 1.0)).z;
        float cordK = clamp((4.5 / 1920.0) * cordD / (${CORD_R.toFixed(4)} * projectionMatrix[1][1]), 1.0, 3.0);
        vec3 transformed = cordC + aRadial * cordK;`);
  };
  cordMat.customProgramCacheKey = () => "devweb-ep05-cord-minpx";
  cord = new THREE.Mesh(cordGeo, cordMat);
  cordBase = Float32Array.from(cord.geometry.attributes.position.array);
  root.add(cord);
  // the cards: a printed 2.4 x 0.56 x 0.04 face box on a bevelled backer, hung from a steel binder clip
  const edge = kit.toon("#4f93d6"), steel = kit.toon("#c9d1d9"), steelDark = kit.toon("#8b949e");
  const backerMat = kit.toon("#2c5f95");
  const backerGeo = new kit.RoundedBoxGeometry(2.46, 0.62, 0.03, 2, 0.014);
  const ringGeo = new THREE.TorusGeometry(0.05, 0.013, 8, 20);
  const jawGeo = new kit.RoundedBoxGeometry(0.16, 0.075, 0.014, 2, 0.006);
  const hangGeo = new THREE.BoxGeometry(0.03, 0.06, 0.022);
  const pinGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.19, 8);
  for (let i = 1; i <= 36; i++) {
    const own = i === 10 || i === 11 || i === 32 ? kit.toon("#4f93d6") : edge; // the three action-first cards recolour alone
    const fb = faceBox(2.4, 0.56, 0.04, i === 11 ? 520 : 420, drawBoard, own);
    const pivot = new THREE.Group(); // at the clip, on the cord: the card swings from here
    fb.mesh.position.set(0, -0.32, CARD_Z - CORD_Z);
    const backer = new THREE.Mesh(backerGeo, i === 11 ? kit.toon("#2c5f95") : backerMat);
    backer.position.set(0, -0.32, CARD_Z - CORD_Z - 0.03); // 1.265..1.295: a lip round the face box, clear of the cord
    // the clip: a ring round the cord, a hanger, a jaw on the face's top edge with its hinge pin
    const ring = new THREE.Mesh(ringGeo, steel); ring.rotation.x = Math.PI / 2;
    const hang = new THREE.Mesh(hangGeo, steelDark); hang.position.set(0, -0.025, 0.06);
    const jaw = new THREE.Mesh(jawGeo, steel); jaw.position.set(0, -0.055, CARD_Z - CORD_Z + 0.03);
    const pin = new THREE.Mesh(pinGeo, steelDark); pin.rotation.z = Math.PI / 2; pin.position.set(0, -0.022, CARD_Z - CORD_Z + 0.032);
    // the first word's glow (own material: each blooms on its own clock), in front of the face, inside the pivot
    const fwLen = FW(NAMES[i]).length * 0.078;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ color: "#6ad08a", map: kit.glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.set(-1.2 + 0.42 + fwLen / 2, -0.32 + 0.28 - 0.16, CARD_Z - CORD_Z + 0.07);
    glow.scale.set(fwLen + 0.45, 0.42, 1);
    pivot.add(backer, fb.mesh, ring, hang, jaw, pin, glow); root.add(pivot);
    const c = { fb, pivot, edge: own, backer, glow, fwLen };
    if (i === 11) { // card 11's halo: behind the card, so it blooms round the edges and in the gaps
      c.halo = new THREE.Sprite(new THREE.SpriteMaterial({ color: "#ffffff", map: kit.glowTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      c.halo.position.set(0, -0.32, CARD_Z - CORD_Z - 0.16); c.halo.scale.set(3.6, 1.35, 1);
      pivot.add(c.halo);
    }
    cards[i] = c;
  }
  // the memory name tags (05): a leader from the card, then the name at about 40 px in the column read
  [12, 28, 33].forEach((i) => {
    const tg = kit.panel(3.9, 0.62, 200, (g, W, H) => {
      const u = W / 3.9;
      g.fillStyle = "#6ad08a"; g.fillRect(0, H / 2 - 0.02 * u, 0.24 * u, 0.04 * u);
      g.fillStyle = "rgba(13,17,23,0.9)"; kit.rr(g, 0.22 * u, 3, W - 0.22 * u - 3, H - 6, 0.12 * u); g.fill();
      g.strokeStyle = "#6ad08a"; g.lineWidth = 0.035 * u; g.stroke();
      g.font = `600 ${0.4 * u}px 'IBM Plex Mono', monospace`; g.textBaseline = "middle";
      const nm = NAMES[i], fw = "memory", x = 0.4 * u;
      g.fillStyle = "#b9f0c9"; g.fillText(fw, x, H / 2 + 2); g.fillStyle = "#a9c8ea"; g.fillText(nm.slice(fw.length), x + g.measureText(fw).width, H / 2 + 2);
    });
    tg.set({}); root.add(tg.mesh); tags.push({ i, tg });
  });
  // the read lane: a narrow additive green strip over the first-word column, grown from t
  lane = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 1), new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }));
  lane.position.set(-0.40, -2, 1.55); root.add(lane);
  // the pulse head: ep 1's packet (white core, green glow, three trail sprites)
  const glowMat = new THREE.SpriteMaterial({ color: "#6ad08a", map: kit.glowTex, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  pulseHead = new THREE.Group(); pulseCore = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
  pulseGlow = new THREE.Sprite(glowMat); pulseGlow.scale.setScalar(0.5); pulseHead.add(pulseCore, pulseGlow); root.add(pulseHead);
  trail = [1, 2, 3].map((n) => { const s = new THREE.Sprite(glowMat); s.scale.setScalar(0.36 - n * 0.08); root.add(s); return s; });
  // the `memory` chip: the model's search key
  chip = kit.panel(0.95, 0.32, 400, (g, W, H) => {
    g.fillStyle = "#1f5a35"; kit.rr(g, 3, 3, W - 6, H - 6, H / 2); g.fill(); g.strokeStyle = "#6ad08a"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "rgba(255,255,255,0.14)"; kit.rr(g, 14, 9, W - 28, 6, 3); g.fill();
    g.fillStyle = "#b9f0c9"; g.font = "600 68px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("memory", W / 2, H / 2 + 3);
  });
  chip.set({}); root.add(chip.mesh);
  // the request card (02): a list glyph and "?", with a short white trail above it while it rides down
  req = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.72), new THREE.MeshBasicMaterial({ transparent: true, map: kit.glyphTexture(THREE, (g, W, H) => {
    g.fillStyle = "#eef2f6"; kit.rr(g, 4, 4, W - 8, H - 8, 30); g.fill();
    g.fillStyle = "#0d1117"; [0.3, 0.5, 0.7].forEach((y) => { g.fillRect(W * 0.12, H * y - 7, 22, 14); g.fillRect(W * 0.22, H * y - 7, W * 0.3, 14); });
    g.font = "700 130px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", W * 0.76, H / 2 + 6);
  }, 360, 260) }));
  root.add(req);
  reqTrail = new THREE.Sprite(new THREE.SpriteMaterial({ color: "#eef2f6", map: kit.glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  root.add(reqTrail);
  // the blue streak leading the list up (03)
  streak = new THREE.Sprite(new THREE.SpriteMaterial({ color: "#4f93d6", map: kit.glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  streak.scale.set(0.7, 1.6, 1); root.add(streak);
  // the counter (09): fifteen unrelated tools, a bevelled tile with the number printed on its face
  counter = faceBox(0.8, 0.8, 0.06, 300, (g, W, H, s) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#1a212b"); gr.addColorStop(1, "#0b0f15");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#8b949e"; g.lineWidth = 8; kit.rr(g, 6, 6, W - 12, H - 12, 26); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.14)"; g.fillRect(20, 14, W - 40, 4);
    g.fillStyle = "#eef2f6"; g.font = "700 120px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(s.n), W / 2, H / 2 + 6);
  }, kit.toon("#3a4452"));
  root.add(counter.mesh);
  // the bracket (09): links the two memory cards; drawn down by scale.y
  const bm = new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true });
  bracket = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1, 0.03), bm); root.add(bracket);
  ticks = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.03), bm); root.add(m); return m; });
  return root;
}

export function update(t) {
  // ---------- the cord: its sway, from the base vertices every frame ----------
  const pa = cord.geometry.attributes.position, arr = pa.array;
  for (let n = 0; n < arr.length; n += 3) { arr[n] = cordBase[n] + swayX(cordBase[n + 1], t); arr[n + 1] = cordBase[n + 1]; arr[n + 2] = cordBase[n + 2]; }
  pa.needsUpdate = true;

  // ---------- the cards ----------
  for (let i = 1; i <= 36; i++) {
    const c = cards[i], y = cardYAt(i, t);
    c.pivot.visible = y > MOUTH_Y - 0.5;
    // reset every transform before any branch (kit rule)
    c.pivot.scale.setScalar(1);
    if (!c.pivot.visible) { c.pivot.position.set(0, y + 0.32, CORD_Z); c.pivot.rotation.set(0, 0, 0); continue; }
    let dy = 0;
    if (i === 12 && t >= T.takes && t < T.takes + 0.6) dy = 0.22 * Math.sin((Math.PI * (t - T.takes)) / 0.6); // the tug
    const sp = cardSpeed(i, t); // a running card trails a little and rattles on its clip
    let px = swayX(y, t), pz = CORD_Z, sc = 1;
    let rx = -0.05 * cl(sp / 14) + 0.02 * cl(sp / 14) * Math.sin(t * 31 + i);
    let ry = 0.04 * Math.sin((2 * Math.PI * t) / 3.7 + 0.5 * i);
    let rz = 0.025 * Math.sin((2 * Math.PI * t) / 2.9 + 0.35 * i) - 0.6 * (swayX(y, t + 0.05) - swayX(y, t - 0.05)); // swings behind the cord

    // VII: the three action-first cards step out of the column, first word boxed white (no folder; white = unclaimed,
    // like card 36's `send`), from "then the action" until "build" (first watch item 6)
    const mark = i === 10 || i === 11 || i === 32 ? r01(t, T.action1 - 0.1, 0.4) * (1 - r01(t, T.build, 0.5)) : 0;
    // IX (camera-r2 optional): their first words flash red as the camera rides past on "rename" / "action"
    const flash = i === 32 ? r01(t, T.rename, 0.15) * (1 - r01(t, T.rename + 0.7, 0.3))
      : i === 10 || i === 11 ? r01(t, T.action3, 0.15) * (1 - r01(t, T.action3 + 0.6, 0.3)) : 0;
    // VI: write_memory is the subject from "named write memory" until "misses" (first watch 01 item 5, 02 item 2)
    const spot = i === 11 ? r01(t, SPOT_IN, 0.3) * (1 - r01(t, T.misses, 0.25)) : 0;
    // the dim of the three action-first cards eases in on "first" and out as they step out or take the subject
    let dark = 0;
    if (i === 10 || i === 32 || i === 11) dark = r01(t, T.first1, 0.3) * (1 - cl(mark * 2));
    if (i === 11) dark *= 1 - r01(t, SPOT_IN, 0.3);
    const lit = litLevel(i, t);
    const s = { n: i, name: NAMES[i], lit: q(lit, 5), dark: q(dark, 5) };
    if (i === 36) s.white = true;
    if (mark > 0) s.flag = q(mark);
    if (flash > 0) { s.flag = q(flash); s.flagRed = true; }
    if (i === 10 || i === 32) c.edge.color.set(mixHex("#4f93d6", "#eef2f6", mark));
    if (mark > 0 || spot > 0) { // step out (left of the column) and forward; a slow pulse keeps the held wide alive
      const out = io(cl(mark));
      px += -0.5 * out; pz += 0.25 * out + 0.15 * spot; sc = 1 + 0.04 * mark * Math.sin(t * 4.2 + i) + 0.07 * spot;
    }

    // the first word's glow: a bloom on the frame it lights, decaying to a steady low glow
    const on = litOnset(i, t), found = MEMORY.has(i) && t < T.memory2 + 1.5; // the chip's three finds bloom hardest
    const ga = lit * (0.1 + (found ? 0.75 : 0.5) * bloom(t - on, found ? 0.5 : 0.3));
    c.glow.visible = ga > 0.004; c.glow.material.opacity = ga;
    c.glow.scale.set(c.fwLen + 0.45 + 0.35 * bloom(t - on), 0.42 + 0.12 * bloom(t - on), 1);

    if (i === 11) {
      s.spot = q(spot);
      if (t >= T.write2 - 0.1 && t < T.write2 + 1.1) s.flag = q(r01(t, T.write2 - 0.1, 0.15) * (1 - r01(t, T.write2 + 0.8, 0.3))); // "its first word is write"
      const red = r01(t, T.misses, 0.25) * (1 - r01(t, T.rewrite, 0.5));
      s.red = q(red);
      // the payoff, "that's the lost note": a breath back on "that's", then on "lost" the card pulses, swings off the
      // cord toward the camera and its `write` flares; it settles back onto the cord before the full read (72.8)
      const dl = t - TL.lost, env = dl < 0 ? 0 : Math.exp(-dl / 0.8);
      const off = io(r01(t, TL.lost - 0.06, 0.22)) * (1 - io(r01(t, TL.lost + 1.9, 0.9)));
      const antic = r01(t, TL.thats, 0.3) * (1 - r01(t, TL.lost - 0.06, 0.12));
      pz += 0.24 * off - 0.03 * antic;
      rx += -0.2 * off + 0.08 * Math.sin(dl * 5.4) * env + 0.04 * antic;
      rz += 0.06 * Math.sin(dl * 5.9) * env;
      const kick = (tk, a) => a * Math.sin(Math.PI * cl((t - tk) / 0.35)); // a quick scale beat
      sc += kick(TL.lost, 0.1) + kick(T.misses, 0.05) + kick(TL.hurts, 0.04) + kick(SPOT_IN + 0.3, 0.04);
      const flare = r01(t, TL.lost - 0.05, 0.12) * (1 - r01(t, T.note3 + 0.9, 0.5)) + 0.85 * r01(t, TL.hurts - 0.05, 0.1) * (1 - r01(t, TL.hurts + 0.6, 0.3));
      if (flare > 0) s.flare = q(flare);
      // the halo: white-blue as the subject (blooms on "write"), red once it misses, pulsing on "lost" and "hurts"
      const haloW = spot * (0.3 + 0.6 * bloom(t - T.write1, 0.6));
      const haloR = red * (0.38 + 0.4 * bloom(t - T.misses, 0.5) + 0.75 * bloom(t - TL.lost, 0.9) + 0.35 * bloom(t - TL.hurts, 0.5) + 0.06 * Math.sin(t * 3.1));
      const ha = Math.max(haloW, haloR);
      c.halo.visible = ha > 0.004; c.halo.material.opacity = cl(ha);
      c.halo.material.color.set(mixHex("#cfe4ff", "#e0675a", red / Math.max(0.001, red + spot)));
      c.halo.scale.set(3.6 + 0.6 * bloom(t - TL.lost, 0.9), 1.35 + 0.35 * bloom(t - TL.lost, 0.9), 1);
      const cool = t >= T.rewrite; // the cooling back to blue goes through grey, never through purple (L7)
      if (cool) s.cool = 1;
      const edgeC = red > 0 ? redMix("#4f93d6", "#e0675a", red, cool) : spot > 0 ? mixHex("#4f93d6", "#ffffff", spot) : "#4f93d6";
      c.edge.color.set(edgeC); c.backer.material.color.set(red > 0 ? redMix("#2c5f95", "#8f3a31", red, cool) : spot > 0 ? mixHex("#2c5f95", "#9fb8d6", spot) : "#2c5f95");
      if (cool) c.halo.material.opacity = cl(ha) * (1 - r01(t, T.rewrite, 0.2)); // the red halo goes first, so no red glow sits on the blue
      if (t >= T.write3) { // the rename: strike, slide up; "memory" rides in with the slide, "_write" eases in by rewrite
        s.old = "write_memory"; s.strike = q(r01(t, T.write3, 0.3)); s.slide = q(r01(t, T.write3 + 0.3, 0.4));
        s.name = "memory_write"; s.restA = q(r01(t, T.rewrite - 0.25, 0.22));
      }
    }
    c.pivot.position.set(px, y + 0.32 + dy, pz);
    c.pivot.rotation.set(rx, ry, rz);
    c.pivot.scale.setScalar(sc);
    c.fb.set(s);
  }

  // ---------- the read passes: lane and pulse head ----------
  let active = null;
  for (const p of P) { const k = p.keys; if (t >= k[0][0] - (p === P[1] ? 0.3 : 0) && t < k[k.length - 1][0] + 1.2) active = p; }
  lane.visible = false; pulseHead.visible = false; trail.forEach((s) => (s.visible = false)); chip.mesh.visible = false;
  pulseHead.scale.setScalar(1);
  if (active) {
    const k = active.keys, t0 = k[0][0], tEnd = k[k.length - 1][0];
    const py = passY(active, t);
    const fade = 1 - r01(t, tEnd + 0.2, 1.0);
    lane.visible = !active.chip || t >= t0;
    const top = -1.82, bot = Math.min(top - 0.01, py);
    lane.scale.set(1, top - bot, 1); lane.position.set(-0.40, (top + bot) / 2, 1.55); lane.material.opacity = 0.1 * fade;
    if (!active.chip) {
      // 08 starts at the visor: a quick hop down to the cord top
      const hop = active === P[1] ? io(r01(t, T.why, 0.3)) : 1;
      const cx = COL_X + swayX(py, t);
      const pos = hop < 1 ? V(mix(0, COL_X, hop), mix(0.25, -1.82, hop), 1.66) : V(cx, py, 1.66);
      pulseHead.visible = t < tEnd + 0.3; pulseHead.position.copy(pos);
      pulseHead.scale.setScalar(Math.max(0.01, 1 - r01(t, tEnd, 0.3)));
      pulseGlow.scale.setScalar(0.5 + 0.06 * Math.sin(t * 11)); // the packet breathes as it reads
      trail.forEach((s, n) => { s.visible = pulseHead.visible && hop >= 1; s.position.set(COL_X + swayX(py + 0.18 * (n + 1), t), py + 0.18 * (n + 1), 1.66); });
    }
  }
  // the chip: out of "save this" on "memory" (1), to the visor, to the cord top on "name" (1), down the column
  if (t >= T.memory1 && t < T.memory2 + 0.7) {
    chip.mesh.visible = true;
    let pos;
    if (t < T.memory1 + 0.6) pos = V(1.75, 0.84, 0.8).lerp(V(0, 0.25, 1.3), io(r01(t, T.memory1, 0.6)));
    else if (t < T.first1) pos = V(0, 0.25, 1.3).lerp(V(COL_X, -1.82, 1.66), io(r01(t, T.name1 - 0.6, 0.6)));
    else { const py = passY(P[0], t); pos = V(COL_X + swayX(py, t), py, 1.66); }
    chip.mesh.position.copy(pos);
    chip.mesh.rotation.set(0, 0, 0.04 * Math.sin(t * 3.3));
    chip.mesh.scale.setScalar(Math.max(0.01, kit.back(r01(t, T.memory1, 0.3))));
    fadeMat(chip.mesh.material, 1 - r01(t, T.memory2 + 0.2, 0.4));
  }

  // ---------- the memory name tags (05): each pops out as the chip reaches its card, held through "three names" ----------
  tags.forEach(({ i, tg }) => {
    const at = passTime(P[0], cardY(i)) - 0.05;
    const gone = T.takes + 0.1; // all go on "takes": they shrink and fade where they stand (no ride off the right edge)
    const a = r01(t, at, 0.3) * (1 - r01(t, gone, 0.25));
    tg.mesh.visible = a > 0.001;
    if (!tg.mesh.visible) return;
    const pop = kit.back(r01(t, at, 0.35)) * (1 - 0.25 * io(r01(t, gone, 0.25)));
    const x = mix(1.3, 3.25, io(r01(t, at, 0.35)));
    tg.mesh.position.set(x, cardY(i) + 0.08 + 0.03 * Math.sin(t * 2.3 + i), 1.8);
    tg.mesh.scale.setScalar(Math.max(0.01, pop));
    fadeMat(tg.mesh.material, a);
  });

  // ---------- the request card (02): down the cord into the shut lid's grommet ----------
  // camera-r2 clock 3: leaves Blink on "it asks", 1.8 s with an ease-out onto the lid, then shrinks into the grommet
  const r0 = T.it1 - 0.1, rLand = r0 + 1.8, r1 = rLand + 0.35;
  req.visible = t >= r0 && t < r1;
  const rx = r01(t, r0, rLand - r0), rk = 1 - (1 - rx) * (1 - rx);
  const ry = mix(0.0, -25.9, rk);
  req.position.set(0, ry, 1.66);
  req.rotation.set(0, 0, 0.05 * Math.sin(t * 5.1) * (1 - rx));
  req.scale.setScalar(Math.max(0.01, r01(t, r0, 0.15) * (1 - r01(t, rLand, 0.35))));
  const rv = rx < 1 ? 2 * (1 - rx) : 0; // its speed (ease-out): the trail shortens as it lands
  reqTrail.visible = req.visible && rv > 0.05;
  reqTrail.position.set(0, ry + 0.45 + 0.5 * cl(rv), 1.6);
  reqTrail.scale.set(0.28, 0.4 + 1.0 * cl(rv), 1);
  reqTrail.material.opacity = 0.45 * cl(rv) * r01(t, r0, 0.2);

  // ---------- the blue streak leading card 01 up (03) ----------
  const y1 = cardYAt(1, t);
  streak.visible = t >= T.cardsUp && y1 < cardY(1) - 0.05 + 0.04 && t < T.cardsUp + 2.4;
  streak.position.set(swayX(y1, t), y1 + 0.7, CORD_Z + 0.3);
  streak.material.opacity = 1 - r01(t, T.cardsUp + 1.6, 0.6);

  // ---------- the counter and the bracket (09), riding the dive ----------
  const dp = io(r01(t, T.diveA, T.diveB - T.diveA));
  const cA = r01(t, T.memory4 - 0.2, 0.3) * (1 - r01(t, T.now + 0.2, 0.3));
  const n = 1 + Math.round(14 * dp);
  // the tile arrives and leaves by scale (its digit is full white from the first frame: first watch 02 item 12),
  // and bumps each time its number changes
  let tick = -Infinity;
  for (let k2 = 1; k2 <= 15; k2++) { const tb = t - k2 / 30; if (1 + Math.round(14 * io(r01(tb, T.diveA, T.diveB - T.diveA))) !== n) { tick = tb + 1 / 60; break; } }
  const cs = kit.back(r01(t, T.memory4 - 0.2, 0.35)) * (1 - io(r01(t, T.now + 0.2, 0.3)));
  counter.mesh.visible = cs > 0.01;
  counter.set({ n });
  counter.mesh.position.set(1.75, mix(-10.95, -19.0, dp) - 0.1 + 0.04 * Math.sin(t * 2.1), 1.6);
  counter.mesh.rotation.set(0, -0.12 + 0.04 * Math.sin(t * 1.3), 0.02 * Math.sin(t * 1.7));
  counter.mesh.scale.setScalar(Math.max(0.01, cs * (1 + 0.1 * Math.sin(Math.PI * cl((t - tick) / 0.18)))));
  const L = cardY(12) - cardY(28), top = cardY(12);
  bracket.visible = cA > 0.001; bracket.material.opacity = cA; bracket.material.depthWrite = cA > 0.98;
  bracket.scale.set(1, Math.max(0.001, L * dp), 1); bracket.position.set(-1.5, top - (L * dp) / 2, CARD_Z);
  ticks[0].visible = cA > 0.001; ticks[0].position.set(-1.35, top, CARD_Z);
  ticks[1].visible = cA > 0.001 && dp > 0.98; ticks[1].position.set(-1.35, cardY(28), CARD_Z);
}
