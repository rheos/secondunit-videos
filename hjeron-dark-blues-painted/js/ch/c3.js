// js/ch/c3.js · CANYON WALL (38.750 - 58.042) · verse 2 · look: rock (a rock-wall painting on sandstone in hard daylight)
// One location: a sandstone canyon wall with petroglyph handprints and spirals, the stone fire ring with his ram
// skull below it, a rattlesnake on the rocks. The rhythm section drives it: hits land on the snare cracks.
// Handoffs: c2 tears its sepia frame apart just before A, so we open on the crack with the last scraps flying off;
// we end pushing into the fire ring's flames until they fill the frame, because c4 opens inside those flames.
(() => {
  const A = 38.75, Z = 58.042;
  const tBones = when('bones', 39), tSand = when('sand', 41), tSlip = when('slip', 42);
  const tSpirits = when('spirits', 43.5), tHand = when('hand', 44.3), tRattles = when('rattles', 45.5), tShake = when('shake', 46);
  const tFire = when('fire', 47), tHums = when('hums', 47.5), tFlames = when('flames', 49.3), tDrums = when('drums', 51);
  const tWarn1 = when('warning', 52), tWarn2 = when('warning', 55), tMe = when('me', 56.5), tYou = when('you', 57.3);
  // the snare cracks of this verse (F('perc') peaks above ~.85, checked by hand)
  const CRACKS = [38.77, 39.57, 41.17, 42.77, 44.40, 46.00, 47.60, 49.20, 50.80, 51.60, 52.40, 54.00, 55.60, 57.20];
  const crack = (t, decay = 6) => { let m = 0; for (const c of CRACKS) m = Math.max(m, hit(t, c, decay)); return m; };
  const fastPulse = (t, decay = 7) => { const b = FEAT.fast; let lo = 0, hi = b.length - 1; if (t < b[0]) return 0;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (b[m] <= t) lo = m; else hi = m - 1; } return Math.exp(-decay * (t - b[lo])); };

  // ---------- the wall ----------
  // sandstone in hard daylight from the upper left: broad modelled faces, ledges, desert-varnish streaks, cracks
  function wall(t, base = 1330, warm = 0) {
    s.fillStyle = vgrad(s, -900, base, [[0, '#6e3219'], [.35, '#a8592f'], [.75, '#c77a42'], [1, '#8e4a26']]); s.fillRect(-1200, -1600, 4300, base + 1600);
    const r = rng(301);
    // big soft modelling: lit bulges and shaded hollows
    for (let i = 0; i < 22; i++) { const x = -900 + r() * 3700, y = -1100 + r() * (base + 1000), rx = 220 + r() * 520, ry = 120 + r() * 300, lit = r() > .45;
      s.fillStyle = lit ? 'rgba(246,176,104,.58)' : 'rgba(70,28,12,.5)'; s.beginPath(); s.ellipse(x, y, rx, ry, (r() - .5) * .8, 0, TAU); s.fill(); }
    // ledges: a sunlit lip over the shadow it throws down the face (the strata of the canyon)
    for (let k = 0; k < 8; k++) { const y0 = -1000 + k * (base + 1000) / 8 + r() * 90, dep = 50 + r() * 90, top = [], bot = [];
      for (let x = -1200; x <= 3100; x += 80) { const y = y0 + (noise1(x * .003, k + 40) - .5) * 120 + Math.sin(x * .0012 + k) * 40; top.push([x, y]); bot.push([x, y + dep * (.5 + noise1(x * .006, k + 70))]); }
      s.fillStyle = `rgba(62,24,10,${.22 + r() * .3})`; s.beginPath(); top.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); for (let i = bot.length - 1; i >= 0; i--) s.lineTo(bot[i][0], bot[i][1]); s.fill();
      stroke(s, top.map(([x, y]) => [x, y - 8]), `rgba(250,198,134,${.2 + r() * .35})`, 10 + r() * 8);
      // desert varnish streaking down from the ledge
      for (let j = 0; j < 6; j++) { const x = -1100 + r() * 4100, len = 200 + r() * 420, w = 22 + r() * 40, y = y0 + dep * .5;
        taper(s, [x, y], [x + (r() - .5) * 30, y + len], w, 3, 'rgba(62,26,12,.3)'); } }
    // deep vertical crevices and a few angular cracks
    for (let k = 0; k < 4; k++) { const x0 = -600 + r() * 3200; let x = x0, y = -1200; const pts = [[x, y]];
      while (y < base) { x += (r() - .5) * 90; y += 110; pts.push([x, y]); }
      stroke(s, pts.map(([x, y]) => [x - 12, y]), 'rgba(246,190,126,.4)', 10); stroke(s, pts, 'rgba(48,18,8,.7)', 22 + r() * 14); }
    if (warm > 0) glow(SC, base, 1400, `rgba(255,140,60,${.035 * warm})`);
  }
  // the ground below the wall: pale sand, talus stones, the shadow line at the wall's foot
  function floor(t, base = 1330) {
    s.fillStyle = vgrad(s, base, base + 1400, [[0, '#6a3519'], [.08, '#b77a48'], [.5, '#cc9259'], [1, '#9a6036']]); s.fillRect(-1200, base, 4300, 3000);
    s.fillStyle = 'rgba(80,36,18,.55)'; s.beginPath(); s.moveTo(-1200, base - 30);
    for (let x = -1200; x <= 3100; x += 80) s.lineTo(x, base + 16 + noise1(x * .01, 61) * 34); s.lineTo(3100, base - 30); s.fill();
    const r = rng(77);
    for (let i = 0; i < 26; i++) { const x = -1000 + r() * 3900, y = base + 20 + Math.pow(r(), 1.6) * 900, sz = 18 + r() * 60 * (1 + (y - base) / 600);
      s.fillStyle = 'rgba(92,48,26,.5)'; s.beginPath(); s.ellipse(x + sz * .4, y + sz * .25, sz * 1.1, sz * .35, 0, 0, TAU); s.fill(); // cast shadow, lower right
      s.fillStyle = r() > .5 ? '#b27a4e' : '#9c6843'; s.beginPath(); s.ellipse(x, y, sz, sz * .55, 0, 0, TAU); s.fill();
      s.fillStyle = 'rgba(242,196,140,.55)'; s.beginPath(); s.ellipse(x - sz * .3, y - sz * .2, sz * .45, sz * .2, 0, 0, TAU); s.fill(); }
  }
  // ---------- petroglyphs (symbols in the rock; never human figures) ----------
  function spiralPts(x, y, R, turns, rot = 0) { const p = []; for (let i = 0; i <= 90; i++) { const u = i / 90, a = rot + u * turns * TAU; p.push([x + Math.cos(a) * R * u, y + Math.sin(a) * R * u]); } return p; }
  // pecked spiral: pale lines chipped through a dark varnish patch; glow 0..1 = firelight catching it
  function spiral(x, y, R, turns = 3, rot = 0, glowK = 0) {
    s.fillStyle = 'rgba(78,36,18,.5)'; s.beginPath(); s.ellipse(x, y, R * 1.3, R * 1.2, 0, 0, TAU); s.fill();
    const p = spiralPts(x, y, R, turns, rot); stroke(s, p, '#efcf9f', Math.max(8, R * .075));
    if (glowK > .02) { stroke(f, p, `rgba(255,150,70,${.3 * glowK})`, R * .06); glow(x, y, R * 1.6, `rgba(255,130,50,${.12 * glowK})`); }
  }
  function zigzag(x, y, w, n, amp) { const p = []; for (let i = 0; i <= 40; i++) p.push([x + i * w / 40, y + Math.sin(i / 40 * n * Math.PI) * amp * (.4 + .6 * i / 40)]); stroke(s, p, '#e9c595', Math.max(8, amp * .4)); dot(s, x + w + amp * .4, y, amp * .55, '#e9c595'); } // a serpent line
  // a painted handprint (red ochre), wrist at (x, y), fingers up; sz = wrist to middle fingertip.
  // m = 1 puts the thumb on screen right. rot tilts it about the wrist, curl bends the fingers toward (+m) the thumb side.
  function handprint(x, y, sz, o = {}) {
    const { rot = 0, curl = 0, m = 1, a = .85, col = '154,50,24', glowK = 0 } = o;
    s.save(); s.translate(x, y); s.rotate(rot); s.scale(m, 1);
    // the spray halo of old pigment around it
    s.fillStyle = rgrad(s, 0, -sz * .5, sz * .1, sz * .75, [[0, `rgba(${col},${a * .28})`], [1, `rgba(${col},0)`]]); s.fillRect(-sz, -sz * 1.3, sz * 2, sz * 1.6);
    const c = `rgba(${col},${a})`;
    s.fillStyle = c; s.beginPath(); s.ellipse(0, -sz * .3, sz * .21, sz * .25, 0, 0, TAU); s.fill();
    taper(s, [0, -sz * .05], [0, sz * .08], sz * .15, sz * .14, c);
    const fingers = [[-.17, .27, -.2], [-.06, .32, -.06], [.05, .34, .04], [.16, .3, .14]]; // pinky .. index
    for (const [fx, len, ang] of fingers) { const b = [fx * sz, -sz * .5], a1 = ang + curl * .35, a2 = a1 + curl * .9;
      const k = [b[0] + Math.sin(a1) * len * sz * .55, b[1] - Math.cos(a1) * len * sz * .55], e = [k[0] + Math.sin(a2) * len * sz * .45, k[1] - Math.cos(a2) * len * sz * .45];
      taper(s, b, k, sz * .04, sz * .036, c); taper(s, k, e, sz * .036, sz * .03, c); }
    const tb = [sz * .17, -sz * .22], ta = .95 - curl * .5, tk = [tb[0] + Math.sin(ta) * sz * .14, tb[1] - Math.cos(ta) * sz * .14], te = [tk[0] + Math.sin(ta - .4 - curl * .5) * sz * .12, tk[1] - Math.cos(ta - .4 - curl * .5) * sz * .12];
    taper(s, tb, tk, sz * .06, sz * .05, c); taper(s, tk, te, sz * .05, sz * .04, c);
    s.restore();
    if (glowK > .02) glow(x + Math.sin(rot) * sz * .45, y - Math.cos(rot) * sz * .45, sz * .8, `rgba(255,120,50,${.1 * glowK})`);
  }
  // a small panel of glyphs on the wall around (x, y): spirals, a zigzag (the snake sign), small hands
  function panel(x, y, sc = 1, glowK = 0, seed = 1) {
    // laid out off-balance on purpose so two spirals and a line never pair up into a face
    spiral(x - 190 * sc, y - 200 * sc, 100 * sc, 3, t0rot(seed), glowK);
    spiral(x + 250 * sc, y + 190 * sc, 65 * sc, 2.5, 1 + seed, glowK * .8);
    zigzag(x - 420 * sc, y + 300 * sc, 300 * sc, 6, 20 * sc);
    handprint(x + 40 * sc, y - 90 * sc, 150 * sc, { rot: -.2, m: 1, a: .75 });
    handprint(x + 360 * sc, y - 170 * sc, 120 * sc, { rot: .25, m: -1, a: .6 });
    handprint(x - 380 * sc, y + 90 * sc, 130 * sc, { rot: -.1, m: -1, a: .55 });
  }
  const t0rot = (seed) => seed * 1.7;

  // ---------- props ----------
  // the stone fire ring; lit 0..1 adds painted flame tongues (c4's palette) and light
  function tongue(t, x, y, h, w, seed) {
    if (h < 4) return;
    const shape = (k, c) => flameShape(t, x, y, h, w, k, c, seed, 0);
    shape(1, '#7a1a0c'); shape(.7, '#c8431b'); shape(.4, '#f28a2c'); shape(.18, '#ffc05a');
  }
  function flameWall(t, y0, height, k, x0 = -300, x1 = STAGE + 300, seed = 7, n = 20) {
    if (k <= .01) return;
    for (let i = 0; i < n; i++) { const x = lerp(x0, x1, (i + hash(i * 3 + seed) * .6) / n) + snoise(i, seed) * 70, hh = height * (.3 + .7 * noise1(t * 1.4 + i * 1.7, seed)) * k;
      tongue(t, x, y0, hh, (x1 - x0) / n * (1.1 + .9 * hash(i + seed)), i + seed * 30); }
    glow((x0 + x1) / 2, y0 - height * .3, (x1 - x0) * .55 * k, `rgba(255,120,40,${.08 * k})`);
  }
  // the fire in the ring: tongues from the logs, height sc * lvl
  function fire(t, x, y, sc, lvl, seed = 3) {
    if (lvl <= .01) return;
    for (let i = 0; i < 7; i++) { const u = (i - 3) / 3, hh = sc * lvl * (1.1 + .9 * noise1(t * 2.2 + i * 1.3, seed)) * (1 - Math.abs(u) * .45);
      tongue(t, x + u * sc * .55, y - sc * .05, hh, sc * .2, i + seed * 20); }
    glow(x, y - sc * .6 * lvl, sc * 2.2 * lvl, `rgba(255,130,50,${.09 * lvl})`); glow(x, y - sc * .25, sc * .8 * lvl, `rgba(255,210,140,${.35 * Math.min(1, lvl)})`);
    sparks(t, x, y - sc * .3, sc * 1.1, sc * 3.2 * lvl, 26, .7 * Math.min(1, lvl), seed + 11);
  }
  // unlit ring: the last thread of smoke off the charred logs
  function smolder(t, x, y, sc, a = .5) {
    for (let i = 0; i < 14; i++) { const ph = (t * .22 + i / 14) % 1, px = x + snoise(ph * 3 + i * .1 + t * .3, 81) * sc * .5 * ph, py = y - ph * sc * 2.4;
      glow(px, py, sc * (.12 + ph * .35), `rgba(210,200,190,${a * .1 * Math.sin(ph * Math.PI)})`); }
  }
  // his ram skull (photo 9/10): a long pale face, the snout down toward us, two heavy ridged horns curling out
  // and down. (x, y) = the snout tip, sc = skull width. glint 0..1 runs a sun glint along the right horn.
  function ram(x, y, sc, glint = -1, shade = 0) {
    if (shade > 0) occlude(() => { f.globalAlpha = shade; f.fillStyle = '#000'; f.beginPath(); f.ellipse(x, y - sc * .5, sc * 1.15, sc * .6, 0, 0, TAU); f.fill(); });
    s.fillStyle = 'rgba(60,28,14,.5)'; s.beginPath(); s.ellipse(x + sc * .25, y + sc * .06, sc * 1.1, sc * .16, 0, 0, TAU); s.fill();
    let hornPts = null;
    for (const d of [-1, 1]) { const C = [x + d * sc * .6, y - sc * .6], p = [];
      for (let i = 0; i <= 30; i++) { const u = i / 30, a = Math.PI + (d > 0 ? 0 : 0) - u * TAU * 1.05, rr = sc * (.44 - u * .3);
        p.push([C[0] + d * Math.cos(a) * rr * -1, C[1] + Math.sin(a) * rr * .95]); }
      // start at the skull's crown and curl up, out, down and forward
      for (let i = 1; i < p.length; i++) { const u = i / 30, w = sc * (.2 - u * .14);
        taper(s, [p[i - 1][0], p[i - 1][1] + w * .3], [p[i][0], p[i][1] + w * .3], w, w, '#6b4c2c');
        taper(s, p[i - 1], p[i], w * .92, w * .92, i % 2 ? '#d2b27c' : '#b08a58');
        if (i % 2) stroke(s, [[p[i][0] - w * .7 * d, p[i][1] - w * .4], [p[i][0] + w * .5 * d, p[i][1] + w * .6]], 'rgba(90,62,34,.55)', w * .18); }
      dot(s, C[0] + d * sc * .02, C[1] + sc * .02, sc * .17, '#a8844f'); dot(s, C[0], C[1], sc * .08, '#c9a770');
      if (d > 0) hornPts = p; }
    // the face: brow between the horn bases narrowing to the snout
    const bw = sc * .34;
    s.fillStyle = '#e6d9bd'; s.beginPath(); s.moveTo(x - bw, y - sc * .82); s.quadraticCurveTo(x, y - sc * 1.02, x + bw, y - sc * .82);
    s.quadraticCurveTo(x + sc * .3, y - sc * .45, x + sc * .12, y - sc * .06); s.quadraticCurveTo(x, y + sc * .04, x - sc * .12, y - sc * .06); s.quadraticCurveTo(x - sc * .3, y - sc * .45, x - bw, y - sc * .82); s.fill();
    s.fillStyle = 'rgba(150,120,86,.55)'; s.beginPath(); s.moveTo(x + sc * .05, y - sc * .9); s.quadraticCurveTo(x + sc * .3, y - sc * .6, x + sc * .1, y - sc * .06); s.lineTo(x + sc * .03, y - sc * .1); s.fill(); // shaded right side
    for (const d of [-1, 1]) { s.fillStyle = '#4a3220'; s.beginPath(); s.ellipse(x + d * sc * .27, y - sc * .7, sc * .05, sc * .035, d * .6, 0, TAU); s.fill(); }
    stroke(s, [[x, y - sc * .55], [x, y - sc * .1]], 'rgba(160,130,95,.6)', sc * .04); poly(s, [[x - sc * .035, y - sc * .28], [x + sc * .035, y - sc * .28], [x + sc * .02, y - sc * .08], [x - sc * .02, y - sc * .08]], '#5a4028');
    if (glint >= 0 && hornPts) { const q = at(hornPts, clamp(glint)); glow(q[0], q[1] - sc * .05, sc * .16, 'rgba(255,244,215,.6)'); }
  }
  // the stone ring (warm fieldstones, sun on their tops) in two passes around the fire: back half, then front half
  function stones(x, y, sc, front, seed = 3) {
    const r = rng(seed);
    for (let i = 0; i < 13; i++) { const a = i / 13 * TAU + .2, sx = x + Math.cos(a) * sc, sy = y + Math.sin(a) * sc * .34, sz = sc * (.17 + r() * .09), isFront = Math.sin(a) > 0;
      if (isFront !== front) continue;
      s.fillStyle = '#4b3527'; s.beginPath(); s.ellipse(sx + sz * .15, sy + sz * .2, sz * 1.05, sz * .62, 0, 0, TAU); s.fill();
      s.fillStyle = r() > .5 ? '#9c8472' : '#8a6d58'; s.beginPath(); s.ellipse(sx, sy, sz, sz * .6, (r() - .5) * .5, 0, TAU); s.fill();
      s.fillStyle = 'rgba(232,210,180,.6)'; s.beginPath(); s.ellipse(sx - sz * .25, sy - sz * .25, sz * .5, sz * .22, -.2, 0, TAU); s.fill(); }
    if (!front) { s.fillStyle = '#3a2a20'; s.beginPath(); s.ellipse(x, y, sc * .85, sc * .26, 0, 0, TAU); s.fill(); // ash bed
      for (let i = 0; i < 3; i++) { const a = i * 1.05 + .3; taper(s, [x - Math.cos(a) * sc * .6, y - sc * .02 + i * 6], [x + Math.cos(a) * sc * .6, y - sc * .1 + i * 5], sc * .075, sc * .065, '#17100c');
        stroke(s, [[x - Math.cos(a) * sc * .5, y - sc * .07 + i * 6], [x + Math.cos(a) * sc * .45, y - sc * .15 + i * 5]], 'rgba(150,140,130,.5)', sc * .02); } }
  }

  // ---------- the rattlesnake ----------
  // (x, y) = the ground under the coil, sc = coil radius. rear 0..1 lifts the neck; rattle 0..1 shakes the tail;
  // face 0..1 turns the head toward the lens, open 0..1 opens the mouth, tongueK 0..1 flicks, lunge pushes the head at us.
  const SN = { body: '#7a6750', dark: '#2c2118', pale: '#dccfae', belly: '#3e3024', head: '#5d4a36' };
  function snakeBody(pts, w) { // one smooth thick body along pts, belly shade under, diamond-back pattern on top
    stroke(s, pts.map(([x, y]) => [x + w * .08, y + w * .28]), SN.belly, w * 1.02);
    stroke(s, pts, SN.body, w);
    stroke(s, pts.map(([x, y]) => [x - w * .05, y - w * .22]), 'rgba(226,210,176,.35)', w * .22); // sun along the top
    for (let i = 2; i < pts.length - 1; i += 3) { const [x, y] = pts[i], [x2, y2] = pts[i + 1], a = Math.atan2(y2 - y, x2 - x), d = w * .42;
      s.save(); s.translate(x, y - w * .08); s.rotate(a); s.fillStyle = SN.pale; s.beginPath(); s.moveTo(-d * 1.25, 0); s.lineTo(0, -d * .95); s.lineTo(d * 1.25, 0); s.lineTo(0, d * .95); s.fill();
      s.fillStyle = SN.dark; s.beginPath(); s.moveTo(-d, 0); s.lineTo(0, -d * .72); s.lineTo(d, 0); s.lineTo(0, d * .72); s.fill(); s.restore(); }
  }
  // the head in local coords, snout toward +x: a broad spade seen a little from above, the jaw hinged to open
  function snakeHead(t, hs, open, tongueK) {
    const sp = (g) => { s.beginPath(); s.moveTo(-.5 * hs, -.2 * hs); s.quadraticCurveTo(-.25 * hs, -.55 * hs, .25 * hs, -.46 * hs); s.quadraticCurveTo(.75 * hs, -.34 * hs, 1.0 * hs, -.08 * hs);
      s.quadraticCurveTo(1.07 * hs, .04 * hs, .96 * hs, .1 * hs); s.lineTo(.2 * hs, .14 * hs); s.quadraticCurveTo(-.2 * hs, .3 * hs, -.5 * hs, .2 * hs); s.closePath(); s.fillStyle = g; s.fill(); };
    const ja = open * .55;
    // lower jaw, swung open
    s.save(); s.translate(.15 * hs, .1 * hs); s.rotate(ja); s.fillStyle = '#6b5640'; s.beginPath(); s.moveTo(-.6 * hs, 0); s.quadraticCurveTo(.2 * hs, .28 * hs, .82 * hs, .04 * hs); s.lineTo(.8 * hs, -.03 * hs); s.lineTo(-.6 * hs, -.06 * hs); s.fill(); s.restore();
    if (open > .05) { s.fillStyle = '#c98e84'; s.beginPath(); s.moveTo(.15 * hs, .1 * hs); s.lineTo(.95 * hs, .08 * hs); s.lineTo(.15 * hs + Math.cos(ja) * .8 * hs, .1 * hs + Math.sin(ja) * .8 * hs); s.fill();
      for (const fx of [.62, .8]) stroke(s, [[fx * hs, .1 * hs], [fx * hs + .02 * hs, (.1 + .2 * open) * hs]], '#efe6d2', hs * .035); }
    s.save(); s.translate(.15 * hs, .1 * hs); s.rotate(-ja * .35); s.translate(-.15 * hs, -.1 * hs);
    sp(SN.head);
    // brow: the pale line from snout over the eye to the jaw, the dark band behind the eye
    stroke(s, [[.95 * hs, -.1 * hs], [.45 * hs, -.3 * hs], [-.35 * hs, -.3 * hs]], SN.pale, hs * .07);
    stroke(s, [[.42 * hs, -.12 * hs], [-.3 * hs, .05 * hs]], SN.dark, hs * .12);
    dot(s, .45 * hs, -.16 * hs, hs * .075, '#e9d9a8'); stroke(s, [[.45 * hs, -.22 * hs], [.45 * hs, -.1 * hs]], '#0c0806', hs * .03);
    dot(s, .88 * hs, -.02 * hs, hs * .03, '#1a120c'); // the nostril / pit
    s.restore();
    if (tongueK > 0) { const L = hs * (.5 + .5 * Math.abs(Math.sin(t * 22))) * tongueK, b = [1.0 * hs, .08 * hs], e = [b[0] + L, b[1] + L * .12];
      stroke(s, [b, e], '#7a1812', hs * .045); stroke(s, [e, [e[0] + hs * .18, e[1] - hs * .1]], '#7a1812', hs * .03); stroke(s, [e, [e[0] + hs * .18, e[1] + hs * .12]], '#7a1812', hs * .03); }
  }
  function snake(t, x, y, sc, o = {}) {
    const { rear = .3, rattle = 0, dir = 1, face = 0, open = 0, tongueK = 0, lunge = 0, head = 1, hscale = 1, hto = null, tilt = 0 } = o;
    const w = sc * .2;
    s.fillStyle = 'rgba(60,28,14,.5)'; s.beginPath(); s.ellipse(x + sc * .2, y + sc * .1, sc * 1.3, sc * .42, 0, 0, TAU); s.fill(); // cast shadow
    // two stacked loops: the outer (lower) loop, then the upper loop inside it
    const loop = (r0, r1, y0, y1, a0, a1) => { const p = []; for (let i = 0; i <= 40; i++) { const u = i / 40, a = a0 + (a1 - a0) * u, rr = lerp(r0, r1, u); p.push([x + dir * Math.cos(a) * rr, lerp(y0, y1, u) + Math.sin(a) * rr * .4]); } return p; };
    const outer = loop(sc, sc * .8, y - w * .3, y - w * .7, Math.PI * .92, Math.PI * 2.75);
    const inner = loop(sc * .76, sc * .42, y - w * .8, y - w * 1.5, Math.PI * .75, Math.PI * 2.4);
    // the tail comes round the front of the coil and stands straight up with the rattle
    const tb = outer[0], rb = Math.sin(t * 150) * .6 + (hash(Math.floor(t * 48)) - .5), amp = sc * .09 * rattle;
    snakeBody(outer, w); snakeBody(inner, w * .92);
    const tailTop = [tb[0] - dir * sc * .12, tb[1] - sc * .3];
    stroke(s, [tb, [tb[0] - dir * sc * .1, tb[1] - sc * .12], tailTop], SN.body, w * .5);
    for (let gI = -1; gI <= 1; gI++) { const ox = gI * amp + rb * amp * .4; s.globalAlpha = (gI ? .4 : .95) * (s.globalAlpha > .99 ? 1 : 1);
      for (let k = 0; k < 5; k++) { const cx = tailTop[0] + ox * (k + 1) / 5 - dir * k * sc * .025, cy = tailTop[1] - sc * (.02 + k * .07), rw = sc * (.075 - k * .009);
        s.fillStyle = '#4a3a28'; s.beginPath(); s.ellipse(cx, cy + sc * .015, rw * 1.1, sc * .045, -dir * .3, 0, TAU); s.fill();
        s.fillStyle = k % 2 ? '#c4b28a' : '#e2d4ae'; s.beginPath(); s.ellipse(cx, cy, rw, sc * .038, -dir * .3, 0, TAU); s.fill(); } }
    s.globalAlpha = 1;
    if (!head) return { tail: tailTop };
    // neck rising in an S from the top of the coil to the head
    const pe = inner[inner.length - 1], hp0 = [pe[0] + dir * sc * (.4 - .35 * face), pe[1] - sc * (.5 + .7 * rear)], hp = hto ? [lerp(hp0[0], hto[0], lunge), lerp(hp0[1], hto[1], lunge)] : hp0;
    const neck = bez(pe, [pe[0] - dir * sc * .45, pe[1] - sc * .35], [hp[0] - dir * sc * .45 * (1 - face), hp[1] + sc * .25], hp, 14);
    if (hscale > 1.01) { for (let i = 1; i < neck.length; i++) { const k = Math.pow(i / neck.length, 2), ww = w * .8 * lerp(1, hscale * .7, k); stroke(s, [neck[i - 1], neck[i]], i % 3 ? SN.body : SN.dark, ww); } }
    else snakeBody(neck, w * .8);
    const hs = sc * .4 * hscale;
    s.save(); s.translate(hp[0], hp[1]); s.scale(dir, 1); s.rotate(-.1 + rear * .1 + tilt); snakeHead(t, hs, open, tongueK); s.restore();
    return { head: hp, tail: tailTop };
  }

  // ---------- weather ----------
  // wind dragging sand across the ground in sheets (to screen right), k = gust strength
  function sandSheets(t, y0, y1, k, seed = 5, speed = 1100) {
    if (k <= .01) return;
    for (let i = 0; i < 11; i++) { const yy = lerp(y0, y1, hash(i * 5 + seed)), len = 800 + hash(i * 7 + seed) * 1100, th = (30 + hash(i * 3 + seed) * 70) * (.6 + .4 * k);
      const sp = speed * (.7 + .6 * hash(i * 11 + seed)), head = ((t * sp + hash(i * 13 + seed) * 5000) % 5000) - 1400;
      const pts = [], lo = []; for (let j = 0; j <= 14; j++) { const u = j / 14, yc = yy + Math.sin(u * 4 + t * 2.5 + i) * th * .5 + snoise(u * 3 + t * 1.3 + i, 9) * th * .6, w = th * Math.pow(Math.sin(Math.PI * u), .7) * k;
        pts.push([head - len * u, yc - w * .5]); lo.push([head - len * u + w * .8, yc + w * .5]); }
      s.fillStyle = `rgba(252,226,184,${Math.min(.8, .7 * k)})`; s.beginPath(); pts.forEach(([x, y], j) => j ? s.lineTo(x, y) : s.moveTo(x, y)); for (let j = lo.length - 1; j >= 0; j--) s.lineTo(lo[j][0], lo[j][1]); s.fill();
      stroke(f, pts.slice(2, 12), `rgba(255,226,180,${.035 * k})`, th * .5); }
    const r = rng(seed + 90); for (let i = 0; i < 70; i++) { const yy = lerp(y0, y1, r()), sp = speed * (1 + r()), x = ((t * sp + r() * 4000) % 4000) - 1100;
      stroke(s, [[x, yy], [x - 26 - 40 * k, yy + 2]], `rgba(245,214,165,${.6 * k})`, 4 + r() * 4); }
  }
  // dust shaken off the wall on a hit: pale grains falling from (x, y)
  function dustFall(t, t0, x, y, spread, n = 26, seed = 1) {
    const lt = t - t0; if (lt < 0 || lt > 1.4) return; const r = rng(seed + Math.round(t0 * 100));
    for (let i = 0; i < n; i++) { const px = x + (r() - .5) * spread + lt * 40, py = y + (r() * .3 + lt) * lt * 420 * (.6 + r() * .6), a = (1 - lt / 1.4) * .75;
      stroke(s, [[px, py], [px + 3, py + 18 + lt * 30]], `rgba(240,206,160,${a * .8})`, 3 + r() * 3); }
    glow(x, y + lt * 120, spread * .6, `rgba(255,220,170,${.07 * (1 - lt / 1.4)})`);
  }
  // his hard daylight shadow thrown up the wall to screen right (sun upper left)
  function shadowOnWall(t, x, feetY, wallY, h, o) {
    s.save(); const ga = s.globalAlpha; s.globalAlpha = ga * .42;
    s.fillStyle = '#3b1a0c'; s.beginPath(); s.moveTo(x - h * .06, feetY); s.lineTo(x + h * .06, feetY); s.lineTo(x + h * .3, wallY); s.lineTo(x + h * .08, wallY); s.fill();
    s.translate(x + h * .19, wallY); s.transform(1, 0, -.22, 1, 0, 0); s.translate(-(x + h * .19), -wallY);
    wyrd(t, x + h * .19, wallY, h * .96, { ...o, view: 'sil', rim: null, eye: 0, g: s });
    s.restore();
  }
  // torn sepia scraps of c2's photo flying off the frame edges (screen space) right after the tear
  function scraps(t) {
    const k = inv(A, A + .32, t); if (k >= 1) return; const e = ease.in(k);
    screen(() => { for (let i = 0; i < 6; i++) { const side = i % 2 ? 1 : -1, y0 = H * (hash(i + 3) * .9 + .05), sz = W * (.16 + hash(i + 9) * .14);
      const x0 = side > 0 ? W - sz * .35 : sz * .35, x = x0 + side * e * W * .5, y = y0 + (hash(i + 5) - .5) * e * H * .3, rot = side * e * (1 + hash(i));
      s.save(); s.translate(x, y); s.rotate(rot); s.fillStyle = mixHex('#5a4632', '#d8c6a4', hash(i + 1)); s.beginPath(); s.moveTo(-sz * .5, -sz * .5);
      for (let q = 0; q <= 8; q++) s.lineTo(-sz * .5 + q / 8 * sz, -sz * .5 + (hash(q + i * 9) - .5) * sz * .2); s.lineTo(sz * .5, sz * .5);
      for (let q = 8; q >= 0; q--) s.lineTo(-sz * .5 + q / 8 * sz, sz * .5 + (hash(q + i * 7) - .5) * sz * .25); s.fill(); s.restore(); } });
  }

  // ================= SHOTS =================
  // 1 · the drum crack on the sandstone: a fast crane down the petroglyph wall that lands on the ram skull on "bones"
  function bones(t, lt, dur) {
    const c = inv(A, tBones + .08, t), sh = shake(t, 16 * crack(t, 8));
    const cy = kf(t, [[A, 560], [A + .12, 610], [tBones - .03, 1435], [tBones + .35, 1400]], ease.inOut), z = lerp(1.3, 1.85, ease.inOut(c)) + .3 * ease.inOut(inv(tBones, A + dur, t));
    const cx = SC + kf(lt, [[0, -80], [dur, 30]]);
    frame(cx + sh[0], cy + sh[1], pick(z, z * .8), kf(lt, [[0, .03], [dur, -.015]]));
    whip(0, -55 * Math.pow(Math.sin(Math.PI * inv(A + .12, tBones - .03, t)), 2));
    wall(t, 1250); panel(900, 560, 1.1, 0, 1); spiral(1320, 980, 80, 2.5, 3); handprint(620, 1080, 170, { rot: .15, m: -1, a: .6 });
    floor(t, 1250);
    stones(960, 1470, 230, false); smolder(t, 960, 1440, 230, .6); stones(960, 1470, 230, true);
    ram(960, 1610, 200, inv(tBones - .1, tBones + 1.6, t));
    for (const c0 of CRACKS) if (c0 < A + dur) dustFall(t, c0, 900 + hash(c0 * 10) * 200, 700 + hash(c0 * 7) * 300, 260);
    scraps(t);
    flash(hit(t, 38.77, 9) * .12, '#fff0d0');
  }

  // 2 · wind drags sand across the ground in sheets; low on the shaded ground, he walks at us through it
  function sand(t, lt, dur) {
    const gust = .6 + .4 * ease.out(inv(tSand - .3, tSand + .4, t)) + .3 * crack(t, 4);
    const sh = shake(t, 8 * crack(t, 9)), z = kf(lt, [[0, 1.05], [dur, 1.2]], ease.inOut);
    frame(SC + kf(lt, [[0, -70], [dur, 60]]) + sh[0], pick(1230, 1080) + sh[1], pick(z, z * .78), -.03 + lt * .02);
    whip(22 * hit(t, tSand, 3), 0);
    wall(t, 1030); panel(1300, 640, .9, 0, 4); handprint(560, 760, 240, { rot: .2, m: -1, a: .7 });
    floor(t, 1030);
    // the morning shadow of the far wall lies across the ground, so the sunlit sand sheets read against it
    s.fillStyle = 'rgba(52,22,10,.5)'; s.fillRect(-1200, 1030, 4300, 2000);
    stones(640, 1120, 90, false); stones(640, 1120, 90, true);
    sandSheets(t, 1060, 1380, gust * .75, 5);
    // a step lands on each fast beat, with a puff of sand off the boot
    const walk = (t - 41.17) / .8 + .25, h = kf(lt, [[0, 820], [dur, 980]], ease.in), x = SC + 50 + snoise(t * .5, 3) * 15;
    const feet = kf(lt, [[0, 1420], [dur, 1500]], ease.in);
    wyrd(t, x, feet, h, { walk, wind: 1, guitar: 'hang', arms: 'down', lit: .5, rim: 'rgba(255,220,170,.85)' });
    for (const c0 of FEAT.fast) { const k = t - c0; if (c0 > A && k > 0 && k < .9) { const side = Math.round((c0 - 41.17) / .4) % 2 ? 1 : -1;
      s.fillStyle = `rgba(236,200,148,${.6 * (1 - k / .9)})`; s.beginPath(); s.ellipse(x + side * h * .05 + k * 200, feet + 6, h * .04 + k * 200, h * .012 + k * 40, 0, 0, TAU); s.fill(); } }
    sandSheets(t, 1420, 2200, gust * 1.15, 17, 1500);
  }

  // 3 · he walks between two huge painted handprints; on "spirits ... hand" they seem to close around him
  function hands(t, lt, dur) {
    const close = ease.inOut(inv(tSpirits - .25, tHand + .15, t)), sh = shake(t, 10 * hit(t, 44.40, 7));
    const z = kf(lt, [[0, .9], [dur, 1.16]], ease.inOut);
    frame(SC + sh[0], kf(lt, [[0, 980], [dur, 1010]]) + sh[1], pick(z, z * .76), kf(lt, [[0, -.02], [dur, .02]]));
    wall(t, 1360);
    spiral(SC - 60, 360, 90, 3, 2); spiral(SC + 520, 1160, 70, 2.4, 1); zigzag(SC - 700, 1220, 300, 8, 24);
    const sp = pick(330, 420) - 45 * close, sz = 720;
    for (const d of [-1, 1]) { s.fillStyle = 'rgba(232,176,118,.55)'; s.beginPath(); s.ellipse(SC + d * pick(330, 420), 1000, 330, 420, d * .1, 0, TAU); s.fill(); }
    for (const d of [-1, 1]) handprint(SC + d * sp, 1260, sz, { rot: -d * (.05 + .22 * close), curl: .06 + .14 * close, m: -d, a: .9, col: '140,36,16', glowK: close * (.5 + .5 * crack(t, 3)) });
    floor(t, 1360);
    // walking, then he stops square between them (the stop falls where his feet are together)
    const T0 = tSlip - .2, stopT = T0 + .8 * Math.round((tHand + .25 - T0) / .8);
    const walk = (Math.min(t, stopT) - T0) / .8, gy = 1440 + 70 * ease.out(inv(T0, stopT, t)), hh = 760 + 70 * ease.out(inv(T0, stopT, t));
    const o = { walk, wind: .8, guitar: 'hang', arms: 'down', lit: .5, rim: 'rgba(255,220,170,.8)' };
    shadowOnWall(t, SC, gy, 1360, hh, o);
    wyrd(t, SC, gy, hh, o);
    dustFall(t, 44.40, SC - sp, 700, 300, 30, 3); dustFall(t, 44.40, SC + sp, 700, 300, 30, 4);
    sandSheets(t, 1420, 1700, .45, 23);
  }

  // 4 · the rattlesnake coiled on the rock by the fire ring; its rattle shakes on the hits
  function rattle(t, lt, dur) {
    const z = kf(lt, [[0, 1.42], [dur, 1.68]], ease.out), sh = shake(t, 6 * crack(t, 9));
    frame(kf(lt, [[0, SC - 10], [dur, SC - 50]]) + sh[0], kf(lt, [[0, 1240], [dur, 1270]]) + sh[1], pick(z, z * .78), kf(lt, [[0, .03], [dur, -.01]]));
    wall(t, 1160); spiral(SC + 260, 900, 90, 3, 5); handprint(SC - 330, 1050, 190, { rot: -.3, m: 1, a: .5 });
    floor(t, 1160);
    stones(SC + 420, 1300, 190, false); smolder(t, SC + 420, 1270, 190, .5); stones(SC + 420, 1300, 190, true); ram(SC + 420, 1400, 160);
    // a flat rock for the snake
    s.fillStyle = '#8f5b37'; s.beginPath(); s.ellipse(SC, 1480, 380, 90, 0, 0, TAU); s.fill();
    s.fillStyle = '#c2875a'; s.beginPath(); s.ellipse(SC - 20, 1455, 350, 70, 0, 0, TAU); s.fill();
    const rat = clamp(.35 + crack(t, 5) + hit(t, tRattles, 4) + .8 * hit(t, tShake, 4) + .6 * fastPulse(t, 8), 0, 1.4);
    snake(t, SC, 1440, 250, { rear: .55, rattle: rat, dir: 1, tongueK: hit(t, tShake + .05, 3), open: 0 });
  }

  // 5 · "fire": the ring catches in front of him as he plays; it pulses on the drums (low angle, his real set-up)
  function catchFire(t, lt, dur) {
    const z = kf(lt, [[0, .98], [dur, 1.1]], ease.inOut);
    frame(SC + kf(lt, [[0, 40], [dur, -30]]), kf(lt, [[0, 1260], [dur, 1180]]) - pick(0, 110), pick(z, z * .74));
    const ign = ease.back(inv(tFire + .12, tFire + .5, t)), lvl = ign * (.7 + .35 * fastPulse(t, 6) + .45 * crack(t, 5));
    wall(t, 1440, ign); spiral(SC - 380, 760, 110, 3, 2, ign * (.4 + .6 * fastPulse(t, 5))); handprint(SC + 400, 900, 260, { rot: .2, m: -1, a: .7, glowK: ign * .5 });
    floor(t, 1440);
    wyrd(t, SC + 40, 1480, 1000, { guitar: 'play', wind: .6, lit: .45 + .15 * ign, turn: .1, rim: 'rgba(255,200,140,.85)' });
    stones(SC, 1680, 330, false);
    fire(t, SC, 1680, 330, lvl * 1.1);
    stones(SC, 1680, 330, true);
    ram(SC - 10, 1830, 280, -1, .75);
    snake(t, SC + 520, 1760, 120, { rear: .4, rattle: .4 + crack(t, 5), dir: -1 });
    if (lvl < .05) smolder(t, SC, 1650, 330, .6);
    flash(hit(t, tFire + .15, 6) * .1 + hit(t, 47.60, 7) * .08, '#ffb070');
  }

  // 6a · "speaks in flames": close on the fire between the horns; the spirals behind catch its light on each hit
  function speaks(t, lt, dur) {
    const z = kf(lt, [[0, 1.9], [dur, 2.35]], ease.inOut) + .08 * crack(t, 8);
    frame(SC + kf(lt, [[0, -60], [dur, 50]]), 1430, pick(z, z * .78), kf(lt, [[0, -.05], [dur, .04]]));
    const lvl = 1 + .5 * crack(t, 5) + .4 * hit(t, tFlames, 3) + .2 * fastPulse(t, 7);
    wall(t, 1330, 1); spiral(SC - 220, 1130, 120, 3, 4, .5 + .5 * crack(t, 4)); spiral(SC + 260, 1020, 80, 2.5, 6, .4 + .6 * crack(t, 4));
    floor(t, 1330);
    stones(SC, 1520, 260, false);
    fire(t, SC, 1520, 260, lvl);
    stones(SC, 1520, 260, true);
    ram(SC, 1650, 240, -1, .75);
  }

  // 6b · "beats like drums": he plays behind the fire, the flames jump on every crack and the camera punches in
  function drums(t, lt, dur) {
    const z = kf(lt, [[0, 1.2], [dur, 1.34]], ease.inOut) + .07 * crack(t, 9), sh = shake(t, 7 * crack(t, 10));
    frame(kf(lt, [[0, SC + 70], [dur, SC - 40]]) + sh[0], pick(1150, 1060) + sh[1], pick(z, z * .7), kf(lt, [[0, .025], [dur, -.02]]));
    wall(t, 1880, 1); handprint(SC - 420, 900, 330, { rot: -.2, m: 1, a: .75, glowK: .4 + .6 * crack(t, 4) }); spiral(SC + 430, 640, 120, 3, 7, .3 + .7 * crack(t, 4));
    wyrd(t, SC, 2050, 1500, { guitar: 'play', wind: .5, lit: .6, turn: -.12, rim: 'rgba(255,190,120,.9)' });
    const jump = .45 + .8 * crack(t, 6) + .5 * hit(t, tDrums, 5);
    flameWall(t, 1780, 360 * jump, 1, SC - 900, SC + 900, 41, 14);
    sparks(t, SC, 1700, 900, 900, 50, .5 + .5 * crack(t, 4), 29);
  }

  // 7 · the warning: singing close-up to the lens, veiled, dark against the sunlit sandstone, the fire's light from below
  function warn1(t, lt, dur) {
    const x = SC, y = 2950, h = 2400, headY = y - h * .905;
    const z = kf(lt, [[0, 1.42], [dur, 1.62]], ease.inOut) + .05 * crack(t, 8);
    frame(x + pick(-20, 150) + kf(lt, [[0, -40], [dur, 30]]), headY + h * kf(lt, [[0, -.005], [dur, -.025]]) - pick(0, h * .01), pick(z, z * .62));
    wall(t, 3400, .5);
    handprint(x - 470, headY + 60, 380, { rot: -.25, m: 1, a: .8, col: '140,36,16' }); spiral(x + 480, headY + 330, 140, 3, 8);
    wyrd(t, x, y, h, { turn: .3, sing: 1, wind: .45, lit: .4, guitar: 'none', arms: 'down', rim: 'rgba(255,215,160,.95)' });
    glow(x, headY + h * .6, 1100, `rgba(255,120,40,${.16 + .08 * crack(t, 5)})`);
    sparks(t, x, headY + h * .5, 1300, 1400, 40, .5, 31);
  }

  // 8 · the second warning: the other 3/4, lower and closer, the fire's heat climbing into the bottom of frame
  function warn2(t, lt, dur) {
    const x = SC, y = 3000, h = 2400, headY = y - h * .905;
    const z = kf(lt, [[0, 1.62], [dur, 1.85]], ease.inOut) + .06 * crack(t, 8);
    frame(x + pick(30, -130) + kf(lt, [[0, 30], [dur, -25]]), headY + h * kf(lt, [[0, -.01], [dur, -.035]]) - pick(0, h * .01), pick(z, z * .62), kf(lt, [[0, .025], [dur, -.01]]));
    wall(t, 3400, 1); spiral(x - 420, headY - 120, 170, 3, 9, .3 + .5 * crack(t, 4)); handprint(x + 460, headY + 200, 320, { rot: .3, m: -1, a: .75, col: '140,36,16' });
    const heat = .4 + .6 * lt / dur;
    wyrd(t, x, y, h, { turn: -.32, sing: 1, wind: .55, lit: .4, guitar: 'none', arms: 'down', rim: 'rgba(255,170,100,.95)' });
    glow(x, headY + h * .5, 1100, `rgba(255,110,40,${.14 + .12 * heat})`);
    flameWall(t, headY + h * .42, 300 * heat * (1 + .5 * crack(t, 6)), 1, x - 800, x + 800, 43, 12);
    sparks(t, x, headY + h * .38, 1100, 1100, 40, .6, 37);
  }

  // 9 · "me ... you": the snake by the fire rears, then strikes at the lens; the flames rise past it and fill the frame (-> c4)
  function lunge(t, lt, dur) {
    const L = ease.back(inv(tYou - .1, tYou + .22, t)), rise = ease.inOut(inv(tYou - .02, Z - .06, t));
    const z = kf(lt, [[0, 1.6], [dur, 1.85]], ease.in) + .9 * ease.in(inv(tYou - .05, Z, t)), sh = shake(t, 12 * hit(t, tYou, 6) + 6 * crack(t, 9));
    const cy = kf(lt, [[0, 1340], [dur, 1260]]);
    frame(SC + sh[0], cy + sh[1], pick(z, z * .78));
    wall(t, 1150, 1); spiral(SC - 300, 820, 100, 3, 10, .6); handprint(SC + 330, 880, 220, { rot: .2, m: -1, a: .65, glowK: .5 });
    floor(t, 1150);
    stones(SC + 160, 1220, 210, false); fire(t, SC + 160, 1220, 210, 1.3 + .5 * crack(t, 5)); stones(SC + 160, 1220, 210, true);
    s.fillStyle = '#8f5b37'; s.beginPath(); s.ellipse(SC - 80, 1500, 360, 85, 0, 0, TAU); s.fill();
    s.fillStyle = '#c2875a'; s.beginPath(); s.ellipse(SC - 100, 1478, 330, 66, 0, 0, TAU); s.fill();
    const up = ease.out(inv(tMe - .1, tMe + .45, t));
    snake(t, SC + 60, 1470, 200, { rear: .3 + .6 * up, rattle: .6 + crack(t, 5) + .5 * up, dir: -1, open: clamp(L * 1.1), tongueK: .7 * up * (1 - L),
      lunge: clamp(L), hscale: 1 + 1.6 * L, hto: [SC - 40, cy + 20], tilt: .45 * L });
    // the fire climbs past it and fills the frame
    flameWall(t, 1950, 400 + 1700 * rise, .3 + .7 * rise, -300, STAGE + 300, 7);
    flameWall(t, cy + 1100, 2200 * rise, rise, -400, STAGE + 400, 19, 16);
    const fin = inv(Z - .45, Z, t);
    paintSet({ sat: lerp(.95, LOOK.sunset.sat, fin), tintK: lerp(LOOK.rock.tintK, 0, fin), boil: lerp(6, 10, fin), flowK: lerp(.7, 1.3, fin) });
    flash(hit(t, tYou + .12, 8) * .06, '#ffb070');
  }

  chapter('canyon', A, Z, [
    [A, bones],
    [40.95, sand],
    [tSlip - .08, hands],
    [46.0, rattle],
    [47.1, catchFire],
    [48.95, speaks],
    [50.4, drums],
    [51.95, warn1],
    [55.3, warn2],
    [56.9, lunge],
  ], { paint: { ...LOOK.rock, con: 1.22, sat: .95 } });
})();
