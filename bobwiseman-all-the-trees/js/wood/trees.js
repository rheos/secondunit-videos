// All The Trees look test (47-79.5 s): "Oh it's true ... cause I'm a tree too, and so are you" then
// "birds are angels ... landing on your branches ... the wind, the sun, the winter ... visit you again".
// Mark Von Ulrich's thinking, not his surface: frontal emblems, one constant face with a different crown,
// the hidden relationship made physical (roots knotting underground), one thing given another's function
// (arms become boughs that birds land on). Surface: inlaid wood veneers.
const T = { oh: 49.09, true_: 50.71, I: 52.98, hope: 54.46, cause: 55.92, tree: 57.58, so: 59.91, you: 60.4,
  birds: 64.73, angels: 65.83, flying: 66.85, landing: 68.52, branches: 69.3, sing: 71.02, wind: 71.85, sun: 72.89,
  winter: 73.81, youHope: 74.74, come: 75.29, visit: 75.97, again: 77.69 };
const GY = 700;                  // ground line (world)
const HIM = 560, HER = 1360;     // trunk centres
const PANEL = 40;                // border width

// ---------- the crowns (symmetric, emblem-like) ----------
// oak: rings of leaves radiating from the head like a marquetry fan, open at the bottom where the body is.
// willow: an arch above the head with long blades hanging straight down, longer toward the sides.
function crownLeaves(kind) {
  const out = [];
  if (kind === 'oak') {
    [[104, 12, 50, 0], [142, 16, 58, .5], [180, 20, 66, 0], [218, 24, 72, .5], [254, 28, 76, 0]].forEach(([R, n, L, o], ri) => {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i + o) * Math.PI * 2 / n;
        const fromDown = Math.abs(((a - Math.PI / 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI);   // 0 = straight down
        if (fromDown < .58) continue;                                  // open where the body is
        out.push({ x: Math.cos(a) * R, y: Math.sin(a) * R * .92, ang: a + Math.PI / 2, L, w: L * .36, sp: (i + ri) % 2 ? 'leaf' : 'leaf2', ring: ri, i });
      }
    });
  } else {
    [[212, 21, 0], [176, 17, .5], [140, 13, 0]].forEach(([R, n, o], ri) => {
      for (let i = 0; i < n; i++) {
        const a = Math.PI + (i + .5 + o * 0) * Math.PI / n;            // across the top half
        const x = Math.cos(a) * R, y = Math.sin(a) * R * .8;
        const side = Math.abs(Math.cos(a));
        const L = 130 + side * 150 - ri * 26;
        out.push({ x, y: y + L / 2 - 10, ang: Math.cos(a) * .14, L, w: 15, sp: (i + ri) % 2 ? 'leaf' : 'leaf2', ring: ri, i });
      }
    });
  }
  return out.sort((p, q) => p.ring - q.ring || Math.abs(p.x) - Math.abs(q.x));
}
const OAK = crownLeaves('oak'), WILLOW = crownLeaves('willow');

// ---------- a frontal person-tree ----------
// k: { body, face, eyes, arms (0 down .. 1 up as boughs), crown (0..1), bare (0..1 winter twigs) }
// The head is a branch cut across (oyster veneer): growth rings round the pith, a bark rim, two knots for eyes.
function personTree(cx, k, leaves, kind, t) {
  const sh = GY - 330, hy = GY - 410;           // shoulders, head centre
  if (k.crown > 0) {
    const n = leaves.length;
    for (let i = 0; i < n; i++) {
      const L = leaves[i], at = i / n;
      const pop = clamp((k.crown * (1 + 8 / n) - at) * n / 8); if (pop <= 0) continue;
      const sway = Math.sin(t * 1.1 + L.ring + (L.x > 0 ? 1 : -1) * .3) * (kind === 'willow' ? .05 : .025);
      g.save(); g.translate(cx + L.x, hy + L.y); g.rotate(L.ang + sway); const sc = lerp(1.2, 1, pop); g.scale(sc, sc);
      piece(leafPath(L.L, L.w), L.sp, { seam: 1.3, alpha: clamp(pop * 1.4) });
      g.restore();
    }
  }
  if (k.bare > 0) {   // winter: a few bare twigs where the crown will grow
    g.save(); g.globalAlpha *= clamp(k.bare * 3) * (k.bareFade ?? 1);
    for (const s of [-1, 1]) for (let j = 0; j < 3; j++) {
      const a = -Math.PI / 2 + s * (.35 + j * .4), R0 = 70, R1 = lerp(80, 190 + j * 20, clamp(k.bare * 1.2 - j * .12));
      const p = [[cx + Math.cos(a) * R0, hy + Math.sin(a) * R0], [cx + Math.cos(a) * (R0 + R1) / 2 + s * 8, hy + Math.sin(a) * (R0 + R1) / 2], [cx + Math.cos(a) * R1, hy + Math.sin(a) * R1]];
      piece(band(p, 10, 3), 'walnut', { ang: a + Math.PI / 2, ox: p[0][0], oy: p[0][1], seam: 1.1 });
    }
    g.restore();
  }
  if (k.body <= 0) return [];
  g.save(); g.globalAlpha *= clamp(k.body * 1.5);
  // arms: right-angled boughs. down = hanging by the body; up = out to the elbow, then straight up
  const hands = [];
  for (const s of [-1, 1]) {
    const a = eio(k.arms);
    const S = [cx + s * 62, sh + 22];
    const E = [cx + s * lerp(80, 190, a), lerp(sh + 150, sh + 10, a)];
    const Hd = [cx + s * lerp(84, 214, a), lerp(sh + 290, sh - 200, a)];
    piece(band(curve(S, [lerp(S[0], E[0], .5), S[1]], [E[0], lerp(S[1], E[1], .5)], E, 8), 34, 28), 'oak', { ang: s * lerp(0, Math.PI / 2, a), ox: S[0], oy: S[1], seam: 1.6 });
    piece(band([E, [lerp(E[0], Hd[0], .5), lerp(E[1], Hd[1], .5)], Hd], 28, 20), 'oak', { ang: Math.atan2(Hd[1] - E[1], Hd[0] - E[0]) - Math.PI / 2, ox: E[0], oy: E[1], seam: 1.6 });
    const ux = (Hd[0] - E[0]), uy = (Hd[1] - E[1]), dl = Math.hypot(ux, uy) || 1;
    for (const f of [-.6, 0, .6]) {
      const fx = (ux * Math.cos(f) - uy * Math.sin(f)) / dl, fy = (ux * Math.sin(f) + uy * Math.cos(f)) / dl;
      piece(band([Hd, [Hd[0] + fx * 26, Hd[1] + fy * 26], [Hd[0] + fx * 44 + f * 8, Hd[1] + fy * 44]], 11, 4), 'oak', { ang: f, ox: Hd[0], oy: Hd[1], seam: 1.2 });
    }
    hands.push([Hd[0] + ux / dl * 34, Hd[1] + uy / dl * 34]);
  }
  // trunk-body: a tapered column with a root flare and square shoulders
  piece(poly([[cx - 74, GY + 4], [cx - 48, GY - 50], [cx - 44, sh + 120], [cx - 68, sh + 30], [cx - 66, sh], [cx + 66, sh], [cx + 68, sh + 30], [cx + 44, sh + 120], [cx + 48, GY - 50], [cx + 74, GY + 4]]), 'oak', { ox: cx, oy: GY - 180 });
  piece(poly([[cx - 20, sh + 2], [cx - 18, hy + 50], [cx + 18, hy + 50], [cx + 20, sh + 2]]), 'oak', { ox: cx, oy: sh, tone: -.06 });
  if (k.face > 0) {
    const breath = Math.sin(t * Math.PI * 2 / 3.6 + cx) * 2.2;
    g.save(); g.translate(cx, hy + breath); const f = lerp(1.12, 1, clamp(k.face)); g.scale(f, f);
    piece(circle(0, 0, 76), 'walnut', { ang: .4, seam: 1.6 });                // bark
    piece(circle(0, 0, 66), 'oyster', { ox: 7, oy: 10, seam: 1.2, scale: .62, ang: t * .06 }); // end grain, pith off centre, slowly turning
    if (k.eyes > 0) {
      const blink = (Math.sin(t * .8 + cx) > .988) ? .2 : 1, joy = k.smile || 0;
      for (const s of [-1, 1]) {
        g.save(); g.translate(s * 25, -6); g.scale(1, clamp(k.eyes * 2) * blink);
        piece(ellipse(0, 0, 13, lerp(10, 6, joy)), 'ash', { seam: 1 });          // the knot's pale rim
        piece(ellipse(0, lerp(0, -1, joy), 7.5, lerp(6.5, 3.2, joy)), 'ebony', { seam: .8 });
        g.restore();
      }
    }
    g.restore();
  }
  g.restore();
  return hands;
}

// ---------- roots ----------
// Each family's roots spread symmetrically under its trunk. The two inner roots run toward each other and
// twist together, over and under, between the trunks: separate above the ground, joined below it.
const ROOTS = (() => {
  const r = [];
  for (const [cx, s, sp] of [[HIM, 1, 'ash'], [HER, -1, 'maple']]) {
    for (const side of [-1, 1]) {
      r.push({ sp, p: curve([cx + side * 40, GY + 2], [cx + side * 90, GY + 80], [cx + side * 170, GY + 150], [cx + side * 250, GY + 250], 18), w: 30, w1: 7 });
      r.push({ sp, p: curve([cx + side * 18, GY + 4], [cx + side * 30, GY + 120], [cx + side * 70, GY + 220], [cx + side * 90, GY + 330], 18), w: 24, w1: 6 });
    }
    r.push({ sp, p: curve([cx, GY + 4], [cx + 4, GY + 120], [cx - 6, GY + 230], [cx, GY + 340], 18), w: 26, w1: 6 });
  }
  return r;
})();
// the meeting roots: from each trunk down to the twist, then twisting across the middle
const TWX0 = 760, TWX1 = 1160, TWY = GY + 190;
const MEET = {
  him: curve([HIM + 30, GY + 4], [HIM + 80, GY + 110], [TWX0 - 120, TWY], [TWX0, TWY], 16),
  her: curve([HER - 30, GY + 4], [HER - 80, GY + 110], [TWX1 + 120, TWY], [TWX1, TWY], 16),
};
function twistPts(phase, a0, a1) {   // a strand of the twist between x TWX0..TWX1, u from a0 to a1 (0..1)
  const out = []; for (let i = 0; i <= 12; i++) { const u = lerp(a0, a1, i / 12);
    out.push([lerp(TWX0, TWX1, u), TWY + Math.sin(u * Math.PI * 4 + phase) * 26]); }
  return out;
}
function drawRoots(k, kLate) {
  for (const R of ROOTS) {
    if (k <= 0) continue;
    const n = Math.max(2, Math.round(R.p.length * clamp(k * 1.3)));
    const pts = R.p.slice(0, n);
    piece(band(pts, R.w, lerp(R.w, R.w1, n / R.p.length)), R.sp, { ang: Math.atan2(pts[n - 1][1] - pts[0][1], pts[n - 1][0] - pts[0][0]) - Math.PI / 2, ox: pts[0][0], oy: pts[0][1], seam: 1.4 });
  }
  // the meeting roots grow toward each other, then twist: draw in half-wave segments, alternating which
  // strand is on top, so they pass over and under like a two-strand cord
  const km = clamp(k * 1.2);
  for (const [key, sp] of [['him', 'ash'], ['her', 'maple']]) {
    const P = MEET[key], n = Math.max(2, Math.round(P.length * clamp(km * 1.6)));
    piece(band(P.slice(0, n), 26, 22), sp, { ang: key === 'him' ? -.9 : .9, ox: P[0][0], oy: P[0][1], seam: 1.4 });
  }
  const tw = clamp((km - .62) / .38);
  if (tw > 0) {
    const segs = 8;
    for (let j = 0; j < segs; j++) {
      const a0 = j / segs, a1 = (j + 1) / segs;
      // him's strand grows left->right, hers right->left; both meet across the middle
      const showA = clamp(tw * segs - j), showB = clamp(tw * segs - (segs - 1 - j));
      const A = () => showA > 0 && piece(band(twistPts(0, a0, lerp(a0, a1, showA)), 22, 22), 'ash', { ang: -1.4, ox: TWX0, oy: TWY, seam: 1.4 });
      const B = () => showB > 0 && piece(band(twistPts(Math.PI, lerp(a1, a0, showB), a1), 22, 22), 'maple', { ang: 1.4, ox: TWX1, oy: TWY, seam: 1.4 });
      if (j % 2) { A(); B(); } else { B(); A(); }
    }
  }
  // past the twist the joined cord runs on, out to both edges: the rest of the forest, unseen
  if (kLate > 0) for (const s of [-1, 1]) {
    const P = curve([s < 0 ? HIM - 250 : HER + 250, GY + 250], [s < 0 ? 300 : 1620, GY + 300], [s < 0 ? 160 : 1760, GY + 250], [s < 0 ? -60 : 1980, GY + 290], 18);
    const n = Math.max(2, Math.round(P.length * kLate));
    piece(band(P.slice(0, n), 14, 10), s < 0 ? 'ash' : 'maple', { ang: s * 1.3, ox: P[0][0], oy: P[0][1], seam: 1.2 });
  }
}

// ---------- birds ----------
function bird(x, y, s, flap, dir, halo) {
  g.save(); g.translate(x, y); g.scale(s * dir, s);
  const w = Math.sin(flap) * .9;
  g.save(); g.rotate(-.2 - w); piece(blob([[-4, -2], [-30, -26], [-46, -22], [-28, -6]], .5), 'holly', { ang: 1, seam: 1.2 }); g.restore();
  piece(blob([[-34, 4], [-12, -10], [16, -12], [32, -4], [34, 4], [14, 12], [-14, 12]], .55), 'holly', { ang: Math.PI / 2, seam: 1.3 });
  piece(poly([[-34, 4], [-56, -6], [-52, 12]]), 'maple', { seam: 1.2 });
  piece(poly([[33, -4], [46, 0], [33, 3]]), 'padauk', { seam: 1 });
  piece(circle(22, -4, 2.6), 'ebony', { seam: 0 });
  g.save(); g.rotate(.15 + w); piece(blob([[-2, -2], [-22, -34], [-40, -34], [-26, -6]], .5), 'holly', { ang: .8, seam: 1.2 }); g.restore();
  if (halo > 0) { g.save(); g.translate(18, -30); g.scale(1, .35); piece(ring(0, 0, 13, 18), 'brass', { seam: .8, alpha: halo }); g.restore(); }
  g.restore();
}

// ---------- roundels (classic marquetry medallions) ----------
function roundel(x, y, r, kind, k, t) {
  if (k <= 0) return;
  g.save(); g.translate(x, y); const s = back(k); g.scale(s, s);
  piece(circle(0, 0, r + 10), 'brass', { seam: 1.2 });
  piece(circle(0, 0, r), kind === 'sun' ? 'walnut' : 'ebony', { ang: .3 });
  if (kind === 'sun') {     // a fan of alternating rays: the classic marquetry patera, here a sun
    const n = 16; for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2 + t * .15, a1 = a0 + Math.PI * 2 / n;
      const p = new Path2D(); p.moveTo(Math.cos(a0) * r * .42, Math.sin(a0) * r * .42); p.lineTo(Math.cos(a0) * r * .94, Math.sin(a0) * r * .94);
      p.lineTo(Math.cos(a1) * r * .94, Math.sin(a1) * r * .94); p.lineTo(Math.cos(a1) * r * .42, Math.sin(a1) * r * .42); p.closePath();
      piece(p, i % 2 ? 'padauk' : 'maple', { ang: (a0 + a1) / 2 + Math.PI / 2, seam: 1 }); }
    piece(circle(0, 0, r * .42), 'padauk', { tone: .06 });
  } else if (kind === 'wind') {
    for (let j = 0; j < 3; j++) { const pts = []; for (let i = 0; i <= 26; i++) { const u = i / 26, a = u * 4.2 + j * 2.1 + t * .6; const rr = r * (.15 + u * .72); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
      piece(band(pts, 4, 16), j === 1 ? 'ash' : 'holly', { ang: j, seam: 1 }); }
  } else if (kind === 'winter') {
    g.save(); g.rotate(t * .1);
    for (let i = 0; i < 6; i++) { g.save(); g.rotate(i * Math.PI / 3);
      piece(poly([[-4, 0], [-4, -r * .8], [0, -r * .9], [4, -r * .8], [4, 0]]), 'holly', { seam: 1 });
      for (const v of [.4, .62]) { piece(poly([[0, -r * v], [-r * .2, -r * (v + .16)], [-r * .17, -r * (v + .2)], [0, -r * (v + .07)]]), 'holly', { seam: .8 });
        piece(poly([[0, -r * v], [r * .2, -r * (v + .16)], [r * .17, -r * (v + .2)], [0, -r * (v + .07)]]), 'holly', { seam: .8 }); }
      g.restore(); }
    piece(circle(0, 0, 10), 'holly', {}); g.restore();
  }
  g.restore();
}

// ---------- the scene ----------
const CAM0 = { z: 1.3, fx: HIM + 40, fy: 450 }, CAM1 = { z: 1, fx: 960, fy: 540 };
function drawScene(t) {
  // camera: on him, then pulling back on "so are you" to show them both and the roots
  const pb = eio(ss(T.so - .3, T.you + 1.6, t));
  const drift = eio(ss(47, T.so, t)) * .1;
  const z = lerp(CAM0.z + drift, CAM1.z, pb), fx = lerp(CAM0.fx, CAM1.fx, pb), fy = lerp(CAM0.fy - drift * 120, CAM1.fy, pb);
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-fx, -fy);
  // book-matched sky: two leaves of the same veneer, mirrored at the centre seam
  const sky = (mirror) => { g.save(); if (mirror) { g.translate(1920, 0); g.scale(-1, 1); }
    piece(poly([[-200, -200], [960, -200], [960, GY], [-200, GY]]), 'sky', { ang: .05, ox: 700, oy: 300, seam: 1.2, scale: 1.6 }); g.restore(); };
  sky(false); sky(true);
  // soil: burl, with a walnut ground band and holly stringing
  piece(poly([[-200, GY], [2120, GY], [2120, 1300], [-200, 1300]]), 'burl', { ox: 960, oy: 900, seam: 0, scale: 1.4 });
  piece(poly([[-200, GY - 6], [2120, GY - 6], [2120, GY + 8], [-200, GY + 8]]), 'walnut', { ang: Math.PI / 2, ox: 960, oy: GY, seam: 1 });

  // roots under both
  drawRoots(ss(T.you + .9, T.birds - .9, t), ss(T.birds - 1.0, T.birds + .6, t));

  // him: inlaid bottom-up, then the face, eyes on "Oh", winter twigs on "no hope", boughs up on "Cause", leaves on "tree"
  const him = { body: ss(47.0, 48.0, t), face: inlay(t, 48.2, .3), eyes: ss(T.oh, T.oh + .25, t),
    arms: eio(ss(T.cause, T.tree + .2, t)), crown: ss(T.tree - .1, T.tree + 1.2, t), bare: ss(T.I - .2, T.hope + 1.2, t), bareFade: 1 - ss(T.tree - .3, T.tree + .4, t),
    smile: ss(T.tree, T.tree + .6, t) };
  // her: "and so are you": the same face, a willow crown
  const her = { body: ss(T.you, T.you + .5, t), face: inlay(t, T.you + .35, .3), eyes: ss(T.you + .55, T.you + .8, t),
    arms: eio(ss(T.you + .6, T.you + 1.5, t)) * .85, crown: ss(T.you + .7, T.you + 1.9, t), bare: 0, smile: ss(T.you + 1, T.you + 1.6, t) };
  const hHands = personTree(HIM, him, OAK, 'oak', t) || [];
  const rHands = personTree(HER, her, WILLOW, 'willow', t) || [];

  // roundels: the wind, the sun, the winter, each on its word
  roundel(175, 200, 88, 'wind', ss(T.wind - .05, T.wind + .3, t), t);
  roundel(960, 190, 100, 'sun', ss(T.sun - .05, T.sun + .3, t), t);
  roundel(1745, 200, 88, 'winter', ss(T.winter - .05, T.winter + .3, t), t);

  // birds: angels (brass halos), land on the boughs, sing, leave, one comes back "again"
  const perches = [hHands[0], hHands[1], rHands[1]].map((p, i) => p || [[HIM - 220, 160], [HIM + 220, 160], [HER + 220, 160]][i]);
  for (let i = 0; i < 3; i++) {
    const t0 = T.birds + i * .35, tl = T.landing + i * .3 + .1;
    if (t < t0) continue;
    const start = [-120 - i * 80, 120 + i * 60];
    const per = [perches[i][0] - 6, perches[i][1] - 22];
    let x, y, flap = t * 16 + i, dir = 1, s = 1.45;
    if (t < tl) {             // fly in on a wide loop ("flying around")
      const u = clamp((t - t0) / (tl - t0)), a = u * Math.PI * 1.6;
      x = lerp(start[0], per[0], eo(u)) + Math.sin(a) * 140 * (1 - u); y = lerp(start[1], per[1], u * u) - Math.sin(u * Math.PI) * 90;
      dir = Math.cos(a) * (1 - u) > -.2 ? 1 : -1;
    } else if (t < T.come + i * .2) {   // perched: wings folded, a bob, singing
      x = per[0]; y = per[1] + Math.abs(Math.sin((t - tl) * 4)) * -3; flap = -.5;
    } else {                  // off again, out to the right; the first one returns on "again"
      const u = clamp((t - T.come - i * .2) / 1.6);
      x = per[0] + eo(u) * 1300; y = per[1] - Math.sin(u * Math.PI) * 220 - u * 120; dir = 1;
      if (i === 0 && t > T.again - .9) { const v = clamp((t - (T.again - .9)) / .9); x = lerp(2100, per[0], eo(v)); y = lerp(80, per[1], eo(v)); dir = -1; if (v >= 1) flap = -.5; }
    }
    const halo = ss(T.angels - .1, T.angels + .25, t);
    bird(x, y, s, flap, dir, halo);
    // song: brass rings rising from the perched birds on "sing"
    if (t > T.sing && t < T.come + 1) for (let r = 0; r < 3; r++) {
      const d = ((t - T.sing - r * .33 - i * .12) % 1.2); if (d < 0) continue;
      g.save(); g.globalAlpha *= (1 - d / 1.2) * .8; g.translate(per[0] + 40, per[1] - 40 - d * 60); g.scale(1, .55);
      piece(ring(0, 0, 8 + d * 30, 11 + d * 30), 'brass', { seam: .6 }); g.restore();
    }
  }
  g.restore();

  // the panel frame: walnut banding with a holly stringing line, drawn last over everything
  for (const [x0, y0, x1, y1, a] of [[0, 0, W, PANEL, Math.PI / 2], [0, H - PANEL, W, H, Math.PI / 2], [0, 0, PANEL, H, 0], [W - PANEL, 0, W, H, 0]])
    piece(poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]), 'walnut', { ang: a, ox: x0, oy: y0, seam: 0 });
  g.save(); g.strokeStyle = 'rgba(243,236,218,.92)'; g.lineWidth = 4; g.strokeRect(PANEL - 9, PANEL - 9, W - 2 * PANEL + 18, H - 2 * PANEL + 18);
  g.strokeStyle = 'rgba(34,20,10,.85)'; g.lineWidth = 1.5; g.strokeRect(PANEL - 1, PANEL - 1, W - 2 * PANEL + 2, H - 2 * PANEL + 2); g.restore();
}
const FADE = (t) => 1 - clamp((t - 47.0) / .5) * (1 - clamp((t - 79.0) / .5));
