// 04-segura (72.4-90.0) "No me importa lo que dirán, estoy segura, muy segura de que habita en mí
// este fuego ardiendo en mi pecho rojo carmesí". THE KEY IMAGE of the film.
// A (72.4-81.1): full-figure on 03's rose stage (same floor, hill, slot; she stands where 03 left her,
//   x 540, facing right). 03's brass band eases off right under the dissolve while the chatterers slide in
//   from the right with cream bubbles. "No": she turns her back on them (faces left). "dirán": every bubble
//   pops. "estoy segura": hands on hips, feet planted; each "segura" stamps a gold ring out along the floor
//   and the chatterers shrink back off the right edge. 80.0 she turns to face right again (they're gone),
//   and on "habita" the camera pushes into her head.
// B (81.1-90.0): her big close profile (In Her Dream 04-sky geometry), pulled back a little (zoom .92) so her
//   chest sits above the captions. "mí": an ember beats in her chest. "fuego": a small carmine paper flame
//   lights. "ardiendo": it licks up in layered tongues (carmine, red, orange, gold). "pecho": fire fills the
//   chest. "rojo carmesí": carmine floods the whole silhouette from the chest out, torn-paper edge.
//   88.2-89.9 the camera eases back to the exact 04-sky framing (ox 470, oy -150, zoom 1.22) for 05.
(() => {
const wd = (x, n = 0) => wordAt(x, n, 72);
const T = { no: wd('no'), importa: wd('importa'), diran: wd('diran'), estoy: wd('estoy'), seg1: wd('segura', 0),
  muy: wd('muy'), seg2: wd('segura', 1), habita: wd('habita'), mi: wd('mi'), este: wd('este'), fuego: wd('fuego'),
  ardiendo: wd('ardiendo'), pecho: wd('pecho'), rojo: wd('rojo'), carmesi: wd('carmesi') };
const CARM = '#b3262e', CARM2 = '#d23a2f';
const CUT = 81.1, PUSH0 = 79.95;
// her puppet on the stage, and the big-profile framings (04-sky geometry: screen = o + z * headUnits)
const HX = 540, HY = 880, HS = .6;            // = 03-harta2's final stage position
const F1 = { ox: 657, oy: -157, z: .92 };          // fire framing: chest above the captions
const FA = { ox: 470, oy: -150, z: 1.22 };         // 04-sky framing, where 05 picks up
const CH = { x: 640, y: 1062 };                    // her chest, head units (front of the bust, below the throat)

// ---------------- local helpers ----------------
// the bust: HEAD_HER (head, neck, shoulders) with the torso carried on below the frame, as ONE path
const BUST = (() => { const pts = HEAD_HER, p = new Path2D(); p.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 6) p.bezierCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], pts[i + 4], pts[i + 5]);
  p.lineTo(950, 1500); p.lineTo(120, 1500); p.closePath(); return p; })();
// facing: +1 right, -1 left; a turn squashes the paper through edge-on (from In Her Dream 13-team)
const TURN = .24;
const FACE = [[0, 1], [T.no + .06, -1], [PUSH0 + .05, 1]];
function facing(t) {
  let d = FACE[0][1];
  for (let k = 1; k < FACE.length; k++) {
    const [tk, dk] = FACE[k], prev = FACE[k - 1][1];
    if (t >= tk) d = dk; else if (t > tk - TURN) { const c = Math.cos(Math.PI * (t - (tk - TURN)) / TURN); d = prev * c; if (Math.abs(d) < .45) d = (c > 0 ? prev : dk) * .45; }
  }
  return d;
}
// two-bone arm IK in body units (puppet facing right); bend +1 = elbow back
function ikArm(near, P, bend = 1) {
  const L1 = 168, L2 = 190, qx = P.x - (near ? 8 : -8), qy = P.y + 752;
  const d = clamp(Math.hypot(qx, qy), 40, L1 + L2 - .5);
  const a1 = Math.atan2(qx, qy) - bend * Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  return [a1, Math.atan2(qx - L1 * Math.sin(a1), qy - L1 * Math.cos(a1)) - a1];
}
function footDrop(legs) { const y = (l) => 266 * Math.cos(l[0]) + 250 * Math.cos(l[1] - l[0]); return 516 - Math.max(y(legs[0]), y(legs[1])); }
const mixA = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
// a cream speech bubble (oval + tail toward the speaker's mouth)
function bubblePath(x, y, rx, ry, mx, my) {
  // one outline: the oval, opened where a short wedge tail points toward the speaker's mouth
  const a = Math.atan2((my - y) / ry, (mx - x) / rx), d = .32;
  const ta = Math.atan2(my - y, mx - x), tl = Math.max(rx, ry) * .55;
  const bx = x + Math.cos(a) * rx * .96, by = y + Math.sin(a) * ry * .96;
  const p = new Path2D(); p.ellipse(x, y, rx, ry, 0, a + d, a - d + Math.PI * 2);
  p.lineTo(bx + Math.cos(ta) * tl, by + Math.sin(ta) * tl); p.closePath();
  return p;
}
// a paper flame tongue standing on (0,0), tip at -h
function tongue(w, h, sway) {
  const p = new Path2D(); p.moveTo(-w / 2, 0);
  p.bezierCurveTo(-w * .58, -h * .36, -w * .12 + sway * .3, -h * .62, sway, -h);
  p.bezierCurveTo(w * .06 + sway * .45, -h * .6, w * .58, -h * .38, w / 2, 0);
  p.bezierCurveTo(w * .46, w * .46, -w * .46, w * .46, -w / 2, 0); p.closePath(); return p;
}
const FIRE_COLS = [CARM, CARM2, C.orange, C.gold];
function flame(x, y, w, h, t, seed, layers = 4) {
  if (w < 1 || h < 1) return;
  for (let i = 0; i < layers; i++) {
    const k = 1 - i * .21, hk = 1 - i * .22;
    const sway = (Math.sin(t * 8.3 + seed * 3.1 + i * .7) * .2 + (hash(Math.floor(t * 12) * 3.7 + seed * 11 + i) - .5) * .14) * w * k;
    const hh = h * hk * (1 + .08 * Math.sin(t * 12.7 + seed * 5 + i));
    g.save(); g.translate(x, y + i * w * .05); cut(tongue(w * k, hh, sway), FIRE_COLS[i], { sh: .45, grain: .2, lift: .1 }); g.restore();
  }
}
// gold ring stamped out along the floor from her feet (back half / front half so it goes round her)
function floorRing(t, at, x, y, half) {
  for (let r = 0; r < 3; r++) {
    const d = t - at - r * .13; if (d < 0 || d > 1.7) continue;
    const k = d / 1.7, rx = 50 + eo(k) * 1500, ry = rx * .13;
    g.save(); g.globalAlpha *= (1 - k) * .95; g.strokeStyle = r % 2 ? C.goldPale : C.gold; g.lineWidth = lerp(20, 4, k); g.lineCap = 'round';
    g.shadowColor = 'rgba(20,16,30,.3)'; g.shadowBlur = 10; g.shadowOffsetY = 5;
    g.beginPath(); g.ellipse(x, y, rx, ry, 0, half ? 0 : Math.PI, half ? Math.PI : Math.PI * 2); g.stroke(); g.restore();
  }
}

// ---------------- the chatterers ----------------
const CHAT = [
  { spec: { col: C.tealDeep, kind: 'dress', head: 'short', hair: 'curls', height: .96 }, x: 1170, y: 850, s: .52, ph: 4.1 },
  { spec: { col: C.sand, kind: 'dress', head: 'short', hair: 'bob', height: .95 }, x: 1730, y: 846, s: .5, ph: 2.2 },
  { spec: { col: C.leafDeep, kind: 'shirt', head: 'short', height: 1.03 }, x: 960, y: 893, s: .6, ph: 1.3 },
  { spec: { col: C.plum, kind: 'dress', head: 'short', hair: 'hat', height: .98 }, x: 1420, y: 893, s: .6, ph: 0 },
];
// bubbles: owner, centre, radii (world px), all between them and her
const BUBS = [
  { o: 2, x: 770, y: 240, rx: 112, ry: 74 }, { o: 0, x: 1040, y: 140, rx: 100, ry: 64 }, { o: 3, x: 1290, y: 250, rx: 118, ry: 78 },
  { o: 1, x: 1600, y: 190, rx: 92, ry: 60 }, { o: 2, x: 740, y: 490, rx: 84, ry: 55 }, { o: 3, x: 840, y: 680, rx: 68, ry: 45 },
];
function chatState(c, i, t) {
  const inK = eo((t - 72.3 - i * .06) / .45);
  const r1 = eio(ss(T.seg1 + .12, T.seg1 + .75, t)), r2 = eio(ss(T.seg2 + .1, T.seg2 + .9, t));
  const x = c.x + (1 - inK) * 900 + r1 * (180 + i * 30) + r2 * 1200;
  const s = c.s * (1 - .18 * r1 - .25 * r2);
  const y = c.y - (r1 * 22 + r2 * 30) * (c.y < 870 ? 1 : 1.4);
  return { x, y, s };
}
function chatPose(c, i, t) {
  const stun = ss(T.diran, T.diran + .2, t);
  const talk = 1 - stun;
  const tk = Math.sin(t * 13 + c.ph * 2);
  const recoil = bump(t, T.seg1 + .05, .55) + bump(t, T.seg2 + .05, .5);
  return {
    head: (.06 * tk + .04) * talk - .08 * stun,
    lean: -.03 * stun - .12 * recoil + .02 * talk,
    arms: [mixA([.42 + .18 * Math.sin(t * 9 + c.ph), 1.75 + .3 * tk], [-.15 - .5 * recoil, .2], stun), [.08, .2]],
    bob: -Math.abs(tk) * 6 * talk,
  };
}
function mouthOf(c, st) { const h = c.spec.height || 1; return { x: st.x - st.s * h * 66, y: st.y - st.s * h * 832 }; }

// ---------------- her pose on the stage ----------------
function herPose(t) {
  const up = ss(T.no - .05, T.no + .3, t), tall = ss(T.estoy - .1, T.estoy + .45, t), neu = ss(PUSH0 - .35, PUSH0 + .45, t);
  let head = lerp(.1, .08, up) + .04 * tall, lean = lerp(-.02, 0, up) - .03 * tall;
  // "importa": the near hand brushes back over her shoulder
  const fl = bump(t, T.importa - .12, .6);
  const op = 1 - ss(72.4, 72.85, t);   // 03 left her arms a little open
  let near = mixA([lerp(.05, -.9, fl), lerp(.18, -.95, fl)], [-.22, .35], op), far = mixA([-.06, .18], [.25, .3], op);
  // "estoy": hands on hips
  const akN = ikArm(true, { x: 18, y: -548 }, 1), akF = ikArm(false, { x: -24, y: -556 }, 1);
  near = mixA(near, akN, tall); far = mixA(far, akF, tall);
  // arms ease down as the camera pushes into her head, so nothing sticks out at the hand-over
  near = mixA(near, [.02, .1], neu); far = mixA(far, [-.02, .1], neu);
  // feet planted apart, a stamp on each "segura"
  const plant = ss(T.estoy - .05, T.estoy + .3, t);
  const legs = [[.14 * plant, .03 * plant], [-.13 * plant, .03 * plant]];
  [[T.seg1, 0], [T.seg2, 1]].forEach(([at, j]) => {
    const k = (t - (at - .34)) / .34; if (k < 0 || k >= 1) return;
    const lift = ss(0, .62, k) * (1 - ss(.78, 1, k));
    legs[j][0] += (j ? -.1 : .32) * lift; legs[j][1] += .8 * lift;
  });
  const hop = bump(t, T.no - .14, .32) * 16 + bump(t, T.estoy - .05, .4) * 10;
  head *= 1 - neu; lean *= 1 - neu;
  // the stamping foot is lifted, so the standing one sets the floor
  const drop = Math.min(footDrop([legs[0], legs[0]]), footDrop([legs[1], legs[1]]));
  return { head, lean, arms: [near, far], legs, bob: drop - hop * (1 - neu) };
}

// ---------------- A: the stage ----------------
SHOT(72.4, CUT, '04-segura-stage', (t) => {
  const A0 = g.globalAlpha;
  sheet(C.rose);
  // push into her head on "de que habita en mí": log-zoom so it feels even, landing on the F1 framing
  const u = eio(clamp((t - PUSH0) / (CUT - PUSH0)));
  const Zf = F1.z / (HS * .265);
  const Z = Math.exp(Math.log(Zf) * u);
  // head unit (650,700) on the stage vs in the F1 framing
  const hp = herPose(t);
  const fs = { x: HX + HS * (10 + .265 * (650 - 580)), y: HY + hp.bob * HS + HS * (-790 + .265 * (700 - 800)) };
  const ft = { x: F1.ox + F1.z * 650, y: F1.oy + F1.z * 700 };
  const sx = lerp(fs.x, ft.x, u), sy = lerp(fs.y, ft.y, u);
  g.save(); g.translate(sx - Z * fs.x, sy - Z * fs.y); g.scale(Z, Z);

  // 03's stage at full warmth: back hill, floor, the band's slot, her shadow
  { const p = new Path2D(); p.moveTo(-40, H + 40); p.lineTo(-40, 780);
    for (let x = -40; x <= W + 40; x += 40) p.lineTo(x, 780 + Math.sin(x / 280 + 1.4) * 22); p.lineTo(W + 40, H + 40); p.closePath(); cut(p, C.roseDeep, { sh: .6 }); }
  cut(cutRect(-60, 872, W + 120, 300, 21, 4), C.roseDark, { sh: .9, lift: .2 });
  cut(cutRect(820, 889, W, 10, 23, 2), C.ink, { sh: .2, grain: 0, alpha: .85 });
  { g.save(); g.globalAlpha *= .22 * (1 - ss(80.6, 81, t)); g.fillStyle = C.ink; g.fill(ellipse(HX + 10, HY + 4, 120, 14)); g.restore(); }

  // the chatterers (back row first)
  const sts = CHAT.map((c, i) => chatState(c, i, t));
  CHAT.forEach((c, i) => { const st = sts[i]; if (st.x > W + 400) return; puppet(st.x, st.y, st.s, -1, c.spec, chatPose(c, i, t)); });

  // her, with the stamped rings going round her feet
  floorRing(t, T.seg1, HX + 10, HY, false); floorRing(t, T.seg2, HX - 10, HY, false);
  const bu = ss(80.66, 80.98, t);
  if (bu < 1) puppet(HX, HY, HS, facing(t), CAST.her, hp);
  // at the end of the push her shoulders become the big profile's bust, so the hand-over is seamless
  // (opaque paper, never a dissolve: the shoulders spread out from the dress's width to the bust's)
  if (bu > 0) { g.save(); g.translate(HX, HY + hp.bob * HS); g.scale(HS, HS); g.rotate(hp.lean); g.translate(10, -790); g.rotate(-hp.head * .9);
    g.scale(.265, .265); g.translate(-580, -800);
    if (bu < 1) { g.beginPath(); g.rect(-400, 835, 2000, 1200); g.clip(); g.translate(535, 0); g.scale(lerp(.55, 1, eio(bu)), 1); g.translate(-535, 0); }
    cut(BUST, C.navy, { sh: 1.2, lift: 1, grain: .3 }); g.restore(); }
  floorRing(t, T.seg1, HX + 10, HY, true); floorRing(t, T.seg2, HX - 10, HY, true);
  // a spark under the stamping foot
  for (const at of [T.seg1, T.seg2]) { const d = t - at; if (d < 0 || d > .45) continue; const k = d / .45;
    for (let j = 0; j < 5; j++) { const a = Math.PI * (1.08 + j * .21); g.save(); g.globalAlpha *= 1 - k;
      cut(star4(HX + Math.cos(a) * (40 + k * 150), HY - 8 + Math.sin(a) * (20 + k * 90), 16 * (1 - k * .5)), j % 2 ? C.goldPale : C.gold, { sh: .3, grain: 0 }); g.restore(); } }

  // their bubbles: up as they arrive, all pop on "dirán"
  BUBS.forEach((b, j) => {
    const at = 72.5 + j * .05, pt = T.diran + (j % 3) * .012;
    if (t < at) return;
    const c = CHAT[b.o], m = mouthOf(c, sts[b.o]);
    const bobY = Math.sin(t * 2.6 + j * 1.9) * 7;
    if (t < pt) {
      const sc = clamp(pop(t, at, .4), 0, 1.2) * (t > pt - .09 ? 1.12 : 1);
      g.save(); g.translate(b.x, b.y + bobY); g.scale(sc, sc); g.translate(-b.x, -b.y - bobY);
      cut(bubblePath(b.x, b.y + bobY, b.rx, b.ry, m.x, m.y), C.cream, { sh: .9, lift: .4, grain: .2 });
      g.restore();
      return;
    }
    // popped: a burst ring and cream scraps flying out
    const d = t - pt; if (d > .8) return;
    const k = d / .8;
    if (d < .2) { g.save(); g.globalAlpha *= 1 - d / .2; g.strokeStyle = C.cream; g.lineWidth = 7; g.beginPath();
      g.ellipse(b.x, b.y + bobY, b.rx * (1 + d * 2.2), b.ry * (1 + d * 2.2), 0, 0, Math.PI * 2); g.stroke(); g.restore(); }
    for (let q = 0; q < 10; q++) {
      const a = Math.PI * 2 * q / 10 + hash(j * 10 + q) * .5, sp = 120 + hash(j * 7 + q * 3) * 120;
      const r0 = .25 + hash(j * 3 + q * 7) * .7;
      const px = b.x + Math.cos(a) * (b.rx * r0 + eo(k) * sp), py = b.y + bobY + Math.sin(a) * (b.ry * r0 + eo(k) * sp * .7) + k * k * 160;
      g.save(); g.translate(px, py); g.rotate(a + k * 6 * (q % 2 ? 1 : -1)); g.globalAlpha *= 1 - k;
      const r = 14 + hash(j + q * 5) * 12;
      cut(poly([[-r, -r * .5], [r, -r * .2], [-r * .1, r * .7]]), C.cream, { sh: .4, grain: 0 }); g.restore();
    }
  });
  g.restore();
  g.globalAlpha = A0;
}, { xin: .3, tr: 'fade' });

// ---------------- B: the big profile, the fire ----------------
SHOT(CUT, 90.0, '04-segura-fire', (t) => {
  const A0 = g.globalAlpha;
  sheet(C.rose);
  const hill = (y, amp, ph, col) => { const p = new Path2D(); p.moveTo(-20, H + 20); p.lineTo(-20, y);
    for (let x = 0; x <= W + 40; x += 40) p.lineTo(x, y + Math.sin(x / 260 + ph) * amp); p.lineTo(W + 40, H + 20); p.closePath(); cut(p, col, { sh: .6 }); };
  hill(900, 26, 1.2, '#d9877f'); hill(975, 18, 3.4, '#c9746f');

  // framing: F1 for the fire, easing to 04-sky's exact framing for 05
  const bk = eio(clamp((t - 88.2) / 1.7));
  const z = lerp(F1.z, FA.z, bk), ox = lerp(F1.ox, FA.ox, bk) + jit(t, 3), oy = lerp(F1.oy, FA.oy, bk) + jit(t, 4);
  const tilt = -.035 * ss(T.rojo, T.carmesi + .6, t) * (1 - ss(88.2, 89.7, t));
  const toHer = () => { g.translate(ox, oy); g.scale(z, z); g.translate(560, 900); g.rotate(tilt); g.translate(-560, -900); };

  // fire stages
  const f1 = clamp(pop(t, T.fuego, .45), 0, 1.25);
  const grow = ss(T.ardiendo - .05, T.ardiendo + .75, t);
  const fill = ss(T.pecho - .1, T.pecho + .55, t);
  const R = t < T.rojo ? 0 : lerp(130, 600, eo((t - T.rojo) / .75)) + (t < T.carmesi ? 0 : lerp(0, 520, eo((t - T.carmesi) / .8)));
  const heat = Math.max(f1 * .35, grow * .7, fill, R > 0 ? 1 : 0);

  // a tonal halo behind her head (rose papers; the gold sun is saved for 06), warmed by the fire's glow
  g.save(); toHer();
  cut(circle(470, 470, 434), '#eaa99e', { sh: .4, grain: .22 });
  cut(circle(470, 470, 400), '#efb8ab', { sh: .5, grain: .22 });
  if (heat > 0) {
    const gl = g.createRadialGradient(CH.x, CH.y - 120, 40, CH.x, CH.y - 120, 900);
    gl.addColorStop(0, `rgba(240,140,70,${.55 * heat})`); gl.addColorStop(.5, `rgba(232,116,59,${.22 * heat})`); gl.addColorStop(1, 'rgba(232,116,59,0)');
    g.fillStyle = gl; g.fillRect(-600, -500, 2400, 2400);
  }
  g.restore();

  // her paper silhouette
  g.save(); toHer(); cut(BUST, C.navy, { sh: 1.2, lift: 1, grain: .3 }); g.restore();

  // inside her
  g.save(); toHer(); g.clip(BUST);
  // "mí": an ember in her chest, beating
  const emb = ss(T.mi - .1, T.mi + .2, t) * (1 - ss(T.fuego, T.fuego + .3, t));
  if (emb > 0) {
    let beat = 0; for (let b = T.mi; b < T.fuego; b += .52) beat = Math.max(beat, bump(t, b, .3));
    const gl = g.createRadialGradient(CH.x, CH.y, 4, CH.x, CH.y, 120); gl.addColorStop(0, `rgba(241,178,58,${.8 * emb})`); gl.addColorStop(1, 'rgba(210,58,47,0)');
    g.fillStyle = gl; g.fill(circle(CH.x, CH.y, 120));
    g.save(); g.globalAlpha *= emb; cut(circle(CH.x, CH.y, 16 + beat * 9), C.gold, { sh: .3, grain: .1 }); g.restore();
  }
  // "rojo carmesí": carmine floods out from the chest with a torn-paper edge
  if (R > 0) {
    const N = 64, edge = [];
    for (let i = 0; i < N; i++) { const a = Math.PI * 2 * i / N; const r = R * (1 + (hash(i * .37 + 3) - .5) * .12) + (hash(i * 1.7 + 9) - .5) * 26 + Math.sin(a * 5 + 1) * 10;
      edge.push([CH.x + Math.cos(a) * r, CH.y - 40 + Math.sin(a) * r]); }
    const torn = poly(edge);
    g.save(); g.shadowColor = 'rgba(8,6,20,.55)'; g.shadowBlur = 14; g.shadowOffsetY = 8; g.fillStyle = CARM; g.fill(torn); g.restore();
    g.save(); g.clip(torn); g.globalAlpha *= .22; g.globalCompositeOperation = 'soft-light'; const m = g.getTransform(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(GRAIN2, 0, 0); g.setTransform(m); g.restore();
    if (R < 1050) { g.save(); g.strokeStyle = 'rgba(244,234,214,.6)'; g.lineWidth = 4; g.lineJoin = 'round'; g.stroke(torn); g.restore(); }
  }
  // "pecho": the fire fills her chest: a body of flame from the bottom of the bust up to the collarbone
  if (fill > 0) {
    const top = lerp(1230, 985, eo(fill));
    const pts = [[60, 1600], [60, top + 40]];
    for (let x = 60; x <= 980; x += 30) pts.push([x, top + 40 - Math.abs(Math.sin(x / 70 + t * 5)) * 70 * fill - (hash(Math.floor(t * 12) + x) - .5) * 10]);
    pts.push([980, 1600]);
    g.save(); if (R > 0) g.globalAlpha *= 1 - ss(T.carmesi, T.carmesi + .5, t) * .6;
    cut(poly(pts), CARM2, { sh: .5, grain: .2, lift: .1 });
    g.restore();
  }
  // the flame: lit on "fuego", licking up in tongues on "ardiendo", widest on "pecho"
  if (f1 > 0) {
    const w = lerp(80 * f1, 170, grow) + fill * 70, h = lerp(140 * f1, 330, grow) + fill * 90;
    const side = grow + fill * .4;
    const baseY = CH.y + 50;
    if (side > 0) {
      flame(CH.x - w * .5, baseY + 12, w * .62 * side, h * .62 * side, t, 2);
      flame(CH.x + w * .48, baseY + 16, w * .58 * side, h * .7 * side, t, 3);
    }
    if (fill > 0) {
      flame(CH.x - w * 1.05, baseY + 40, w * .5 * fill, h * .45 * fill, t, 4);
      flame(CH.x + w * 1.0, baseY + 30, w * .5 * fill, h * .55 * fill, t, 5);
    }
    flame(CH.x, baseY, w, h, t, 1);
  }
  g.restore();

  // her closed eye, cut out of the silhouette
  g.save(); toHer();
  g.strokeStyle = R > 560 ? C.goldPale : C.rose; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.arc(706, 452, 13, Math.PI * .1, Math.PI * .9); g.stroke();
  g.restore();

  g.globalAlpha = A0;
}, { xin: .3, tr: 'fade' });
})();
