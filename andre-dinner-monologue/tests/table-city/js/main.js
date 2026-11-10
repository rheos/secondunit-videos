// Table-city, the film: section f1800 to f2544 (75.0 to 106.0 s) of _in/andre.wav. Every frame is a pure function
// of song time t. Frames from js/cues.js (Whisper cues snapped to audio onsets by tools/onsets.py).
//   1  f1800-1950  the table from above; the sapling grows a tier on "trees" (f1930)
//   2  f1950-2110  the sapling becomes a redwood on "redwoods" (f1998); the napkin folds into a pack on "backpack"
//                  (f2071); the flame leans toward the tree; the camera dollies in a little
//   3  f2110-2300  on "New York" (f2215) the plates, glasses, bottle and salt rise into towers lit by the candle; on
//                  the second "New York" (f2236) the cutlery fans out and stands up as a fence; the camera tilts
//                  from high to three-quarter, slowly, f2215 to f2300
//   4  f2300-2544  four figures walk from the towers to the fence and turn back, twice; from "theories" (f2466) to
//                  "all" (f2522) the camera pulls up and back to the whole walled table; hold to the end
const params = new URLSearchParams(location.search);
const OUT_W = parseInt(params.get('w') || '720', 10), Q = OUT_W / 720;
const cv = document.getElementById('c'); cv.width = OUT_W; cv.height = Math.round(1280 * Q);
const X = cv.getContext('2d');
const { clamp, lerp, ss, E, noise } = PD;
const PROBE = (typeof ML !== 'undefined' && ML.probe) || { on: false, text() {}, box() {}, event() {}, edge() {}, value() {} };
const FPS = 24, F_IN = 1800, F_OUT = 2544;
// a spring from 0 to 1 as a pure function of time (motion.js spring, copied so the page stands alone)
function spring(t, zeta = .72, hz = 1.1) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * hz;
  if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
}
const sine = (k) => .5 - .5 * Math.cos(Math.PI * clamp(k));
const outQuint = (k) => 1 - (1 - clamp(k)) ** 5;
const sf = (f) => f / FPS;                                   // frame to seconds

// ---------------- cue frames ----------------
const F = {
  trees: CUES.trees.f, redwoods: CUES.redwoods.f, backpack: CUES.backpack.f,
  newyork1: CUES.newyork1.f,
  // the second "New York": the snapper's nearest rise (f2231) is "said"; the envelope has "New" at f2236 (NOTES.md)
  newyork2: 2236,
  leave1: CUES.leave1.f, never: CUES.never.f, why: CUES.why.f, leave2: 2426, gave: CUES.gave.f,
  theories: CUES.theories.f, all: CUES.all.f,
};

// ---------------- the table ----------------
const S = TC.build(Q);
const P = {   // table positions
  plateFar: [40, -240], plateNear: [40, 240], glassFar: [170, -200], glassNear: [150, 170], bottle: [96, -70],
  salt: [-140, 50], basket: [-160, -130], candle: TC.C0, pot: [225, -405], napkin: [250, -360], pack: [262, -384],
};
// cutlery at rest beside the plates: [kind, tx, ty, dir]
const REST = [['knife', 106, 300, [0, -1]], ['fork', -26, 300, [0, -1]], ['spoon', 136, 300, [0, -1]], ['knife', -26, -300, [0, 1]], ['fork', 106, -300, [0, 1]], ['spoon', -56, -300, [0, 1]]];
// the fence ring: a rounded rectangle inside the cloth's edge, N slots with position, tangent and outward normal
const RING = { hw: 240, hh: 340, r: 60, N: 34 };
function ringAt(u) {   // u in [0, 1) around the ring, from the near-right corner going clockwise on screen
  const { hw, hh, r } = RING, sw = hw - r, sh = hh - r, arc = Math.PI * r / 2, per = 4 * arc + 4 * sw + 4 * sh;
  let d = ((u % 1) + 1) % 1 * per;
  const segs = [[sw * 2, (k) => [sw - k, hh], [-1, 0], [0, 1]], [arc, (k) => [-sw - r * Math.sin(k / r), sh + r * Math.cos(k / r)], null, null],
    [sh * 2, (k) => [-hw, sh - k], [0, -1], [-1, 0]], [arc, (k) => [-sw - r * Math.cos(k / r), -sh - r * Math.sin(k / r)], null, null],
    [sw * 2, (k) => [-sw + k, -hh], [1, 0], [0, -1]], [arc, (k) => [sw + r * Math.sin(k / r), -sh - r * Math.cos(k / r)], null, null],
    [sh * 2, (k) => [hw, -sh + k], [0, 1], [1, 0]], [arc, (k) => [sw + r * Math.cos(k / r), sh + r * Math.sin(k / r)], null, null]];
  for (const [len, pos, tan, nor] of segs) {
    if (d <= len) { const p = pos(d); const n = nor || TC.unit(p[0] - Math.sign(p[0]) * sw, p[1] - Math.sign(p[1]) * sh); const tg = tan || [-n[1], n[0]]; return { p, n, t: tg }; }
    d -= len;
  }
  return ringAt(0);
}
const SLOTS = [...Array(RING.N)].map((_, j) => ({ j, ...ringAt(j / RING.N), kind: ['knife', 'fork', 'spoon'][j % 3] }));
// each rest piece's home slot, and each slot's source piece (nearest home around the ring)
const home = REST.map(([, tx, ty]) => SLOTS.reduce((b, s) => Math.hypot(s.p[0] - tx, s.p[1] - ty) < Math.hypot(SLOTS[b].p[0] - tx, SLOTS[b].p[1] - ty) ? s.j : b, 0));
const ringDist = (a, b) => Math.min(Math.abs(a - b), RING.N - Math.abs(a - b));
const FENCE = SLOTS.map((s) => {
  let src = 0; for (let i = 1; i < REST.length; i++) if (ringDist(s.j, home[i]) < ringDist(s.j, home[src])) src = i;
  const isHome = home[src] === s.j && home.indexOf(s.j) === src;
  return { ...s, src, isHome, delay: ringDist(s.j, home[src]) * 1.2 + (isHome ? 0 : 2) };
});
const TIER_STEP = [20, 22, 24, 34, 34, 34, 34, 34, 34, 34];   // how far each tier lifts the one above it
// figures: [from, to] walks in table space, from a tower's foot to the fence
// each starts behind its tower (a smaller ty than the tower's, inside its footprint), so it walks out of it
const WALKS = [[[-146, 44], [-232, 96]], [[104, -76], [232, -36]], [[-10, 232], [-90, 332]], [[80, -246], [120, -334]]];

// ---------------- what moves when ----------------
function state(t) {
  const f = t * FPS;
  const tilt = sine((f - F.newyork1) / 85);                                                  // f2215 to f2300
  const V = TC.view(tilt);
  // the tree: tiers 0-1 at rest; tier 2 on "trees"; tiers 3-9 on "redwoods", one every 4 frames
  const tiers = S.tiers.map((_, i) => i < 2 ? 1 : i === 2 ? spring(sf(f - F.trees), .7, 1.4) : spring(sf(f - F.redwoods - (i - 3) * 4), .76, 1.2));
  const trunkH = 8 + tiers.reduce((a, k, i) => a + TIER_STEP[i] * k, 0) + 24 * tiers[tiers.length - 1];
  // the napkin into the pack: half folds over (6 f), the half folds down (6 f), the pack springs up
  const nk = f - F.backpack, fold1 = clamp(nk / 6), fold2 = clamp((nk - 6) / 6), pack = spring(sf(nk - 11), .75, 1.6);
  // the towers rise on "New York"
  const riseOrder = { plateFar: 0, plateNear: 3, glassFar: 6, glassNear: 8, bottle: 11, salt: 15, basket: 18 };
  const rise = {}; for (const k in riseOrder) rise[k] = spring(sf(f - F.newyork1 - riseOrder[k]), .72, 1.1);
  // the fence on the second "New York": each piece slides to its slot lying flat, then hinges up facing out
  const fence = FENCE.map((s) => { const u = f - F.newyork2 - s.delay; return { slide: outQuint(u / 14), up: spring(sf(u - 10), .72, 1.3), dirMix: clamp((u - 10) / 6) }; });
  // the flame: flicker, and a lean toward the tree through shot 2
  const nz = noise('flame');
  const leanTree = .32 * ss(F.redwoods, F.redwoods + 30, f) * (1 - ss(2112, 2160, f));
  const flame = { sy: 1 + .1 * nz.n1(t * 7.3), lean: .07 * nz.n1(t * 5.1 + 3) + leanTree, k: .5 + .5 * nz.n1(t * 9) };
  // figures: out on f2300, turn on "never", back; out on "why", turn on "gave", back; then still
  const legs = [[2300, F.leave1 + 2, F.never + 4, F.never + 46, 0], [F.why, F.leave2, F.gave + 2, F.gave + 44, .16]];
  const figs = WALKS.map(([a, b], i) => {
    let u = 0, dir = 1, moving = false, dist = 0;
    for (const [o0, o1, b0, b1, uEnd] of legs) {
      const d0 = o0 + i * 2, d1 = o1 + i * 2, e0 = b0 + i * 3, e1 = b1 + i * 3;
      if (f < d0) break;
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (f < d1) { u = clamp((f - d0) / (d1 - d0)); dir = 1; moving = true; dist = u * L; break; }
      if (f < e0) { u = 1; dir = f > d1 + 6 ? -1 : 1; moving = false; dist = L; break; }
      if (f < e1) { u = lerp(1, uEnd, clamp((f - e0) / (e1 - e0))); dir = -1; moving = true; dist = L + (1 - u) * L; break; }
      u = uEnd; dir = f > e1 + 8 ? 1 : -1; moving = false; dist = 2 * L;
    }
    const x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), fx = Math.sign(b[0] - a[0]) * dir;
    return { x, y, flip: fx < 0, pose: moving ? Math.floor(dist / 4) % 8 : 0, dist };
  });
  return { f, V, tiers, trunkH, fold1, fold2, pack, rise, fence, flame, figs, tilt };
}

// ---------------- camera: one slow move per shot, always drifting ----------------
function cam(t) {
  const f = t * FPS, nz = noise('cam');
  const x = 3 * nz.n1(t * .11) + lerp(-12, 12, sine((f - 1800) / 150));                       // shot 1: a truck
  const y = 2 * nz.n1(t * .09 + 5);
  const z = 60 * sine((f - 1950) / 160);                                                      // shot 2: a dolly in
  const zoom = lerp(1, .8, sine((f - F.theories) / (F.all - F.theories)));                     // shot 4: pull up and back
  return { x, y, z, zoom, roll: .0008 * nz.n1(t * .07 + 9) };
}

// ---------------- the planes ----------------
function planes(st) {
  const { V, f, flame } = st, list = [];
  list.push({ name: 'room', z: 6000, draw(g) { PD.drawPaper(g, S.room); } });
  list.push({ name: 'cloth', z: 2400, draw(g) {
    const b = TC.proj(V, 0, 0), c = TC.proj(V, TC.C0[0], TC.C0[1]);
    g.save(); g.translate(b[0], b[1] + 26); g.scale(1, V.sinT); PD.drawShadow(g, S.cloth, 0, 0, .55); g.restore();   // the table's shadow on the floor
    g.save(); g.translate(b[0], b[1]); g.scale(1, V.sinT); PD.drawPaper(g, S.cloth); g.restore();
    // the candle's pool on the cloth, breathing with the flame
    g.save(); g.translate(c[0], c[1]); g.scale(1, V.sinT); g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(0, 0, 10, 0, 0, 320); gr.addColorStop(0, `rgba(255,190,100,${.26 + .03 * flame.k})`); gr.addColorStop(.4, 'rgba(255,170,80,.1)'); gr.addColorStop(1, 'rgba(255,150,60,0)');
    g.fillStyle = gr; g.fillRect(-340, -340, 680, 680); g.restore();
  } });
  const item = (ty, draw) => list.push({ z: 2000 - ty * .9, ty, draw });   // nearer rows nearer the lens; all in front of the cloth
  const riseOf = (g, k, sprite, tower, tx, ty, hItem, hTower) => {
    const r = st.rise[k];
    if (r * hTower < hItem) TC.stand(g, V, sprite, tx, ty);
    if (r > 0) TC.stand(g, V, tower, tx, ty, { sy: r });
  };
  // plates and their towers
  for (const k of ['plateFar', 'plateNear']) {
    const [tx, ty] = P[k];
    item(ty, (g) => { TC.flat(g, V, S[k], tx, ty); const r = st.rise[k]; if (r > 0) TC.stand(g, V, S[k === 'plateFar' ? 'towerPlateFar' : 'towerPlateNear'], tx, ty, { sy: r }); });
  }
  for (const k of ['glassFar', 'glassNear']) {
    const [tx, ty] = P[k], tw = k === 'glassFar' ? 'towerGlassFar' : 'towerGlassNear', h = k === 'glassFar' ? 320 : 270;
    item(ty, (g) => {
      riseOf(g, k, S[k], S[tw], tx, ty, 110, h);
      const r = st.rise[k];
      if (r > .4) { const b = TC.proj(V, tx, ty, h * r * .82); PD.glow(g, b[0], b[1], 46, 'rgba(255,190,90,.5)', .55 * ss(.4, 1, r) * (.85 + .15 * flame.k)); }   // lit from inside
    });
  }
  item(P.bottle[1], (g) => riseOf(g, 'bottle', S.bottle, S.towerBottle, P.bottle[0], P.bottle[1], 220, 530));
  item(P.salt[1], (g) => riseOf(g, 'salt', S.salt, S.towerSalt, P.salt[0], P.salt[1], 50, 150));
  item(P.basket[1], (g) => riseOf(g, 'basket', S.basket, S.towerBasket, P.basket[0], P.basket[1], 46, 110));
  // the candle and its flame
  item(TC.C0[1], (g) => {
    TC.stand(g, V, S.candle, TC.C0[0], TC.C0[1], { shadow: false });
    const b = TC.proj(V, TC.C0[0], TC.C0[1], 90);
    g.save(); TC.standee(g, V, b, 1, [0, 1], flame.sy * Math.max(1, .7 / V.cosT), flame.lean); PD.drawPaper(g, S.flame); g.restore();   // a flame reads tall even from above
    PD.glow(g, b[0] + flame.lean * 10, b[1] - 10, 64, 'rgba(255,200,110,.55)', .8 + .2 * flame.k);
  });
  // the pot, the tree and the pack
  item(P.pot[1], (g) => {
    const [tx, ty] = P.pot;
    TC.stand(g, V, S.pot, tx, ty);
    TC.stand(g, V, S.trunk, tx, ty - 2, { sy: st.trunkH / 416, shadow: false });
    let h = 8; for (let i = 0; i < S.tiers.length; i++) { const k = st.tiers[i]; if (k <= 0) break; TC.stand(g, V, S.tiers[i], tx, ty - 2, { sy: k, shadow: i === 0, alpha: .3, h }); h += TIER_STEP[i] * k; }
  });
  item(P.napkin[1], (g) => {
    const [tx, ty] = P.napkin, { fold1, fold2, pack } = st;
    if (fold2 < 1) {
      const b = TC.proj(V, tx, ty);
      g.save(); g.translate(b[0], b[1]); g.scale(1, V.sinT);
      // left half stays; the right half turns over onto it (scale x about the middle, through zero)
      g.save(); g.beginPath(); g.rect(-50, -50, 50, 100); g.clip(); PD.drawPaper(g, S.napkin); g.restore();
      g.save(); g.scale(Math.cos(fold1 * Math.PI), 1); g.beginPath(); g.rect(0, -50, 50, 100); g.clip(); PD.drawPaper(g, S.napkin); g.restore();
      // then the folded half lies down about its far edge (the fold toward the pot)
      if (fold2 > 0) { g.save(); g.translate(0, -40); g.scale(1, Math.max(.01, Math.cos(fold2 * Math.PI / 2))); g.translate(0, 40); g.beginPath(); g.rect(-50, -50, 50, 100); g.clip(); PD.drawPaper(g, S.napkin); g.restore(); }
      g.restore();
    }
    if (pack > 0) TC.stand(g, V, S.pack, P.pack[0], P.pack[1], { sy: pack, lean: -.18 });
  });
  // cutlery: at rest beside the plates, then the fence
  const rested = REST.map(([kind, tx, ty, dir]) => ({ s: S[kind], tx, ty, dir }));
  FENCE.forEach((sl, j) => {
    const fs = st.fence[j], src = rested[sl.src];
    if (fs.slide <= 0 && !sl.isHome) return;                                                   // still under its source
    const tx = lerp(src.tx, sl.p[0], fs.slide), ty = lerp(src.ty, sl.p[1], fs.slide);
    const a0 = Math.atan2(src.dir[1], src.dir[0]), a1 = Math.atan2(sl.t[1], sl.t[0]), a2 = Math.atan2(sl.n[1], sl.n[0]);
    const turn = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
    const ang = fs.slide < 1 ? turn(a0, a1, fs.slide) : turn(a1, a2, fs.dirMix);
    item(ty, (g) => TC.stand(g, V, S[sl.kind], tx, ty, { phi: Math.min(1, fs.up), dir: [Math.cos(ang), Math.sin(ang)], lean: .1 * fs.up * sl.n[0], sy: 1 + Math.max(0, fs.up - 1) * .5, alpha: .2 }));
  });
  // figures
  if (f >= F.newyork1 + 30) st.figs.forEach((fg) => item(fg.y + 1, (g) => TC.stand(g, V, S.figures[fg.pose], fg.x, fg.y, { flip: fg.flip, alpha: .32 })));   // only once there are towers to come out of
  list.sort((a, b) => b.z - a.z);
  return list;
}

// ---------------- one frame ----------------
function frame(t) {
  const st = state(t), C = cam(t);
  X.setTransform(1, 0, 0, 1, 0, 0);
  X.fillStyle = '#121737'; X.fillRect(0, 0, cv.width, cv.height);
  PD.renderPlanes(X, planes(st), C, t, { q: Q });
  PD.finish(X, { bloom: .4, threshold: .78, vignette: .3, grain: .05, frame: Math.round(t * FPS), grade: { color: '#e9ae3a', amount: .07, mode: 'soft-light' } });
  if (PROBE.on) {
    PROBE.value('tilt', st.tilt); PROBE.value('riseFar', st.rise.plateFar);
    PROBE.edge('rise', st.rise.plateFar > 0, state(ML.prevT(t)).rise.plateFar > 0);
  }
}

window.__frameJPEG = (t, q = .93) => { frame(t); return cv.toDataURL('image/jpeg', q); };
window.__ready = Promise.resolve(true);
window.FILM = { F_IN, F_OUT, F, frame, state, cam };
if (!params.has('offline')) {
  const t0 = performance.now(), start = parseFloat(params.get('t') || (F_IN / FPS));
  (function loop() { const t = start + (performance.now() - t0) / 1000; frame(t < F_OUT / FPS ? t : F_IN / FPS + (t - F_IN / FPS) % ((F_OUT - F_IN) / FPS)); requestAnimationFrame(loop); })();
}
