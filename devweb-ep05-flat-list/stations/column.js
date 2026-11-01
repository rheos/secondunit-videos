// S2 the cord column (boards 01-10, 15): the cord, 35 cards (36 in VIII-IX) clipped on in written order, the read
// lane and the pulse head, the `memory` chip, the request card (02), the blue streak (03), the counter and the
// bracket (09). Cards rise, swing, tug, light and recolour, all from t. The cord never reorders.
import { T, NAMES, MEMORY, DARK, family, CORD_Z, CARD_Z, COL_X, MOUTH_Y, cardY, drawCardFace, faceBox, fadeMat, mixHex, cl, io, r01, mix, V } from "../parts.js";
import { typed } from "../kit/world.js";

let THREE, root, kit;
const cards = [];
let lane, pulseHead, pulseCore, trail, chip, req, streak, counter, bracket, ticks;

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

// ---------- where card i hangs at t ----------
const V_UP = 12, V_DOWN = 16, V_LIST = 14;
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
  if (t < T.cardsUp) { // 01 -> 02: back down into the box, lowest first (the hook was a flash-forward)
    if (i > 9) return MOUTH_Y - 1;
    const s = T.say + 0.04 * (9 - i);
    return Math.max(MOUTH_Y - 1, y - V_DOWN * Math.max(0, t - s));
  }
  // 03: the list comes back: card k leaves the mouth 0.06 s after card k-1, all at one speed
  const dep = T.cardsUp + 0.06 * (i - 1);
  return Math.min(y, MOUTH_Y + V_LIST * Math.max(0, t - dep));
}

export function build(scene, k) {
  kit = k; THREE = kit.THREE; P = PASSES();
  root = new THREE.Group(); scene.add(root);
  // the cord: one string, nothing branches
  const curve = new THREE.CatmullRomCurve3([V(0, -0.88, 1.10), V(0, -1.0, 1.2), V(0, -1.4, CORD_Z), V(0, -27.0, CORD_Z)]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.014, 6), kit.toon("#8b949e")));
  // the cards: 2.4 x 0.56 x 0.04 boxes, canvas on the front face; originals share one edge material except 11
  const edge = kit.toon("#4f93d6"), steel = kit.toon("#c9d1d9");
  const clipGeo = new THREE.TorusGeometry(0.05, 0.012, 6, 16);
  for (let i = 1; i <= 36; i++) {
    const own = i === 11 ? kit.toon("#4f93d6") : edge;
    const fb = faceBox(2.4, 0.56, 0.04, 420, drawCardFace, own);
    const pivot = new THREE.Group(); // at the clip, on the cord: the card swings from here
    fb.mesh.position.set(0, -0.32, CARD_Z - CORD_Z);
    const clip = new THREE.Mesh(clipGeo, steel); clip.rotation.x = Math.PI / 2;
    pivot.add(fb.mesh, clip); root.add(pivot);
    cards[i] = { fb, pivot, edge: own };
  }
  // the read lane: a narrow additive green strip over the first-word column, grown from t
  lane = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 1), new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }));
  lane.position.set(-0.40, -2, 1.55); root.add(lane);
  // the pulse head: ep 1's packet (white core, green glow, three trail sprites)
  const glowMat = new THREE.SpriteMaterial({ color: "#6ad08a", map: kit.glowTex, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  pulseHead = new THREE.Group(); pulseCore = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
  const pg = new THREE.Sprite(glowMat); pg.scale.setScalar(0.5); pulseHead.add(pulseCore, pg); root.add(pulseHead);
  trail = [1, 2, 3].map((n) => { const s = new THREE.Sprite(glowMat); s.scale.setScalar(0.36 - n * 0.08); root.add(s); return s; });
  // the `memory` chip: the model's search key
  chip = kit.panel(0.95, 0.32, 400, (g, W, H) => {
    g.fillStyle = "#1f5a35"; kit.rr(g, 3, 3, W - 6, H - 6, H / 2); g.fill(); g.strokeStyle = "#6ad08a"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "#b9f0c9"; g.font = "600 68px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("memory", W / 2, H / 2 + 3);
  });
  chip.set({}); root.add(chip.mesh);
  // the request card (02): a list glyph and "?"
  req = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.72), new THREE.MeshBasicMaterial({ transparent: true, map: kit.glyphTexture(THREE, (g, W, H) => {
    g.fillStyle = "#eef2f6"; kit.rr(g, 4, 4, W - 8, H - 8, 30); g.fill();
    g.fillStyle = "#0d1117"; [0.3, 0.5, 0.7].forEach((y) => { g.fillRect(W * 0.12, H * y - 7, 22, 14); g.fillRect(W * 0.22, H * y - 7, W * 0.3, 14); });
    g.font = "700 130px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", W * 0.76, H / 2 + 6);
  }, 360, 260) }));
  root.add(req);
  // the blue streak leading the list up (03)
  streak = new THREE.Sprite(new THREE.SpriteMaterial({ color: "#4f93d6", map: kit.glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  streak.scale.set(0.7, 1.6, 1); root.add(streak);
  // the counter (09): fifteen unrelated tools
  counter = kit.panel(0.8, 0.8, 300, (g, W, H, s) => {
    g.fillStyle = "#0d1117"; kit.rr(g, 4, 4, W - 8, H - 8, 30); g.fill(); g.strokeStyle = "#6e7681"; g.lineWidth = 8; g.stroke();
    g.fillStyle = "#eef2f6"; g.font = "700 120px 'IBM Plex Mono', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(s.n), W / 2, H / 2 + 6);
  });
  root.add(counter.mesh);
  // the bracket (09): links the two memory cards; drawn down by scale.y
  const bm = new THREE.MeshBasicMaterial({ color: "#6ad08a", transparent: true });
  bracket = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1, 0.03), bm); root.add(bracket);
  ticks = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.03), bm); root.add(m); return m; });
  return root;
}

export function update(t) {
  // ---------- the cards ----------
  for (let i = 1; i <= 36; i++) {
    const c = cards[i], y = cardYAt(i, t);
    c.pivot.visible = y > MOUTH_Y - 0.5;
    let dy = 0;
    if (i === 12 && t >= T.takes && t < T.takes + 0.6) dy = 0.22 * Math.sin((Math.PI * (t - T.takes)) / 0.6); // the tug
    c.pivot.position.set(0, y + 0.32 + dy, CORD_Z);
    c.pivot.rotation.set(0, 0.04 * Math.sin((2 * Math.PI * t) / 3.7 + 0.5 * i), 0.025 * Math.sin((2 * Math.PI * t) / 2.9 + 0.35 * i));
    if (!c.pivot.visible) continue;
    const dark = t >= T.first1 && (i === 10 || i === 32 || (i === 11 && t < T.misses));
    const s = { n: i, name: NAMES[i], lit: litAt(i, t), dark };
    if (i === 36) s.white = true;
    if (i === 11) {
      const red = r01(t, T.misses, 0.25) * (1 - r01(t, T.rewrite, 0.5));
      s.red = Math.round(red * 10) / 10;
      c.edge.color.set(red > 0 ? mixHex("#4f93d6", "#e0675a", red) : "#4f93d6");
      if (t >= T.write3) { // the rename: strike, slide up, memory_write types in
        const t0 = T.write3 + 0.4;
        s.old = "write_memory"; s.strike = Math.round(r01(t, T.write3, 0.3) * 10) / 10; s.slide = Math.round(r01(t, T.write3 + 0.3, 0.4) * 10) / 10;
        s.name = typed("memory_write", t0, 12 / (T.rewrite - t0), t);
      }
    }
    c.fb.set(s);
  }

  // ---------- the read passes: lane and pulse head ----------
  let active = null;
  for (const p of P) { const k = p.keys; if (t >= k[0][0] - (p === P[1] ? 0.3 : 0) && t < k[k.length - 1][0] + 1.2) active = p; }
  lane.visible = false; pulseHead.visible = false; trail.forEach((s) => (s.visible = false)); chip.mesh.visible = false;
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
      const pos = hop < 1 ? V(mix(0, COL_X, hop), mix(0.25, -1.82, hop), 1.66) : V(COL_X, py, 1.66);
      pulseHead.visible = t < tEnd + 0.3; pulseHead.position.copy(pos);
      pulseHead.scale.setScalar(Math.max(0.01, 1 - r01(t, tEnd, 0.3)));
      trail.forEach((s, n) => { s.visible = pulseHead.visible && hop >= 1; s.position.set(COL_X, py + 0.18 * (n + 1), 1.66); });
    }
  }
  // the chip: out of "save this" on "memory" (1), to the visor, to the cord top on "name" (1), down the column
  if (t >= T.memory1 && t < T.memory2 + 0.7) {
    chip.mesh.visible = true;
    let pos;
    if (t < T.memory1 + 0.6) pos = V(1.75, 0.84, 0.8).lerp(V(0, 0.25, 1.3), io(r01(t, T.memory1, 0.6)));
    else if (t < T.first1) pos = V(0, 0.25, 1.3).lerp(V(COL_X, -1.82, 1.66), io(r01(t, T.name1 - 0.6, 0.6)));
    else pos = V(COL_X, passY(P[0], t), 1.66);
    chip.mesh.position.copy(pos);
    chip.mesh.scale.setScalar(Math.max(0.01, kit.back(r01(t, T.memory1, 0.3))));
    fadeMat(chip.mesh.material, 1 - r01(t, T.memory2 + 0.2, 0.4));
  }

  // ---------- the request card (02): down the cord into the shut lid's grommet ----------
  const r0 = T.asks + 0.2, r1 = T.cardsUp - 0.6;
  req.visible = t >= r0 && t < r1;
  const rk = io(r01(t, r0, r1 - r0));
  req.position.set(0, mix(0.0, -25.9, rk), 1.66);
  req.scale.setScalar(Math.max(0.01, r01(t, r0, 0.15) * (1 - r01(t, r1 - 0.35, 0.35))));

  // ---------- the blue streak leading card 01 up (03) ----------
  const y1 = cardYAt(1, t);
  streak.visible = t >= T.cardsUp && y1 < cardY(1) - 0.05 + 0.04 && t < T.cardsUp + 2.4;
  streak.position.set(0, y1 + 0.7, CORD_Z + 0.3);
  streak.material.opacity = 1 - r01(t, T.cardsUp + 1.6, 0.6);

  // ---------- the counter and the bracket (09), riding the dive ----------
  const dp = io(r01(t, T.diveA, T.diveB - T.diveA));
  const cA = r01(t, T.memory4 - 0.2, 0.3) * (1 - r01(t, T.now + 0.2, 0.3));
  counter.mesh.visible = cA > 0.001;
  counter.set({ n: 1 + Math.round(14 * dp) });
  counter.mesh.position.set(1.75, mix(-10.95, -19.0, dp) - 0.1 + 0.04 * Math.sin(t * 2.1), 1.6);
  fadeMat(counter.mesh.material, cA);
  const L = cardY(12) - cardY(28), top = cardY(12);
  bracket.visible = cA > 0.001; bracket.material.opacity = cA; bracket.material.depthWrite = cA > 0.98;
  bracket.scale.set(1, Math.max(0.001, L * dp), 1); bracket.position.set(-1.5, top - (L * dp) / 2, CARD_Z);
  ticks[0].visible = cA > 0.001; ticks[0].position.set(-1.35, top, CARD_Z);
  ticks[1].visible = cA > 0.001 && dp > 0.98; ticks[1].position.set(-1.35, cardY(28), CARD_Z);
}
