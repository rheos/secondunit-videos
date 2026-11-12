// scenes/porch.js · "everyone knows it, everyone's smiling, except you and me": SEP.12 1992, 7:02PM. The whole
// family posed on the porch at dusk for someone else's camcorder, so the mother is finally in frame. Warm light from
// the open door and the windows behind them, a deep blue dusk past the corner of the house. Father sober and upright
// with his arm round the mother, the little sister in front, the brother by the window, grandma's rocking chair empty
// and rocking a little. You and me at the far end pull faces, then duck out of the picture and run off laughing,
// and the family turns to watch us go.
(function () {
  const T = window.TIMING, S = T.scenes;
  const { KIDS, drawKid, poses: P, lerpPose } = window.CAST;
  const TAU = Math.PI * 2;

  // ---- hits, song seconds ------------------------------------------------------------------------------
  const T0 = S.porch, T1 = S.reprise;
  const EVERYONE = 261.31;   // "Everyone": they settle into the pose
  const KNOWS = 263.22;      // "knows it": everyone still, the picture set
  const SMILE0 = 265.42;     // "everyone's": the little sister starts waving at the camera
  const SMILING = 270.49;    // "smiling": father lifts mother's hand
  const EXCEPT = 275.95;     // "except": the hider ducks
  const YOU = 276.35;        // "you": the hider runs
  const ME = 277.54;         // "me": I run after her (I duck on "and", 276.73)
  const AND = 276.73;

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const sm = (x) => x * x * (3 - 2 * x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const L2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  }
  function ell(g, x, y, rx, ry) { g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, TAU); g.fill(); }

  // ---- the house front, world units ----------------------------------------------------------------------------
  const WALLB = 440;                 // the wall meets the porch floor
  const PF = 456;                    // where people stand on the porch
  const EDGE = 474;                  // the porch floor's front edge
  const GROUND = 550;                // the lawn in front of the porch
  const CORNER = 792;                // the house corner; dusk sky beyond (the porch wraps round)
  const HOR = 404;                   // horizon past the corner
  const DOOR = [404, 196, 578, WALLB];
  const WINL = [116, 232, 300, 424], WINR = [628, 232, 762, 424];
  const STEPS = [392, 596];
  const ROOF = 118;                  // porch roof fascia, top
  const COL = { kid: '#261a1e', wood: '#221a1c', chair: '#2a1d16' };
  const H = 118;                     // h for anyone standing on the porch

  const R = rng(7021992);
  const lace = [];
  for (let i = 0; i < 60; i++) lace.push([R(), R(), 3 + R() * 7, R()]);
  const lawn = [];
  for (let i = 0; i < 900; i++) { const k = Math.pow(R(), 1.3); lawn.push([-300 + R() * 1600, GROUND + 4 + k * 260, k, R()]); }
  const stars = [];
  for (let i = 0; i < 26; i++) stars.push([CORNER + 10 + R() * 500, -200 + R() * 360, R()]);
  const treesFar = [];
  for (let x = CORNER - 40; x < 1600; x += 9 + R() * 16) treesFar.push([x, HOR - 4 - R() * 22, 8 + R() * 16]);

  // ---- background --------------------------------------------------------------------------------------------
  function sky(g) {
    const s = g.createLinearGradient(0, -260, 0, HOR);
    s.addColorStop(0, '#131d44'); s.addColorStop(0.45, '#2a3d72'); s.addColorStop(0.78, '#6a6f9a'); s.addColorStop(0.92, '#d98d6c'); s.addColorStop(1, '#f2b77e');
    g.fillStyle = s; g.fillRect(CORNER, -400, 1400, HOR + 400);
    for (const [x, y, b] of stars) { g.fillStyle = `rgba(240,240,255,${0.25 + 0.4 * b})`; g.fillRect(x, y, 1.6, 1.6); }
    g.fillStyle = '#1d2230';
    for (const [x, y, r] of treesFar) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.fillRect(CORNER, HOR - 6, 1400, 10);
    const f = g.createLinearGradient(0, HOR, 0, GROUND + 200);
    f.addColorStop(0, '#2a3340'); f.addColorStop(1, '#1b2226');
    g.fillStyle = f; g.fillRect(CORNER, HOR + 2, 1400, 600);
  }
  function inside(g) {  // the lit hall through the open door
    const w = g.createLinearGradient(0, DOOR[1], 0, WALLB);
    w.addColorStop(0, '#fbe3b0'); w.addColorStop(1, '#efc583');
    g.fillStyle = w; g.fillRect(DOOR[0], DOOR[1], DOOR[2] - DOOR[0], WALLB - DOOR[1]);
    g.strokeStyle = 'rgba(200,140,80,.25)'; g.lineWidth = 1.2;
    for (let x = DOOR[0] + 8; x < DOOR[2]; x += 14) { g.beginPath(); g.moveTo(x, DOOR[1]); g.lineTo(x, WALLB - 60); g.stroke(); }
    g.fillStyle = 'rgba(150,96,50,.55)'; g.fillRect(DOOR[0], WALLB - 60, DOOR[2] - DOOR[0], 60);   // wainscot
    g.fillStyle = 'rgba(120,76,40,.6)'; g.fillRect(DOOR[0] + 22, DOOR[1] + 40, 38, 30);           // a framed picture
    g.fillStyle = 'rgba(255,240,210,.7)'; g.fillRect(DOOR[0] + 26, DOOR[1] + 44, 30, 22);
    // the hall lamp: the brightest thing in the shot
    const lg = g.createRadialGradient(500, DOOR[1] + 34, 2, 500, DOOR[1] + 34, 120);
    lg.addColorStop(0, 'rgba(255,255,240,1)'); lg.addColorStop(0.2, 'rgba(255,240,200,.8)'); lg.addColorStop(1, 'rgba(255,230,180,0)');
    g.fillStyle = lg; g.fillRect(380, DOOR[1] - 100, 240, 260);
    g.strokeStyle = 'rgba(120,80,40,.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(500, DOOR[1]); g.lineTo(500, DOOR[1] + 24); g.stroke();
    // the stair banister rising on the right
    g.strokeStyle = 'rgba(110,64,30,.7)'; g.lineWidth = 4; g.beginPath(); g.moveTo(DOOR[2] - 70, WALLB - 40); g.lineTo(DOOR[2] + 4, DOOR[1] + 70); g.stroke();
    g.lineWidth = 2;
    for (let i = 0; i < 7; i++) { const x = DOOR[2] - 66 + i * 11; const y = WALLB - 40 - i * 11.5 - 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 36); g.stroke(); }
  }
  function windowGlow(g, W, seed) {
    const [x0, y0, x1, y1] = W;
    const wg = g.createLinearGradient(0, y0, 0, y1);
    wg.addColorStop(0, '#f6cf8c'); wg.addColorStop(1, '#e7a85c');
    g.fillStyle = wg; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    const lamp = g.createRadialGradient(x0 + (x1 - x0) * (seed ? 0.7 : 0.3), y0 + 70, 4, x0 + (x1 - x0) * (seed ? 0.7 : 0.3), y0 + 70, 120);
    lamp.addColorStop(0, 'rgba(255,248,226,.95)'); lamp.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = lamp; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    // lace curtains gathered at both sides
    for (const side of [0, 1]) {
      const cx = side ? x1 - 22 : x0 + 22;
      g.fillStyle = 'rgba(255,250,236,.45)';
      g.beginPath(); g.moveTo(cx - 24, y0); g.lineTo(cx + 24, y0); g.quadraticCurveTo(cx + (side ? -6 : 6), (y0 + y1) / 2, cx + 14, y1); g.lineTo(cx - 14, y1); g.closePath(); g.fill();
      for (const [u, v, r, a] of lace) { if ((a < 0.5) !== !!side) continue; g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.arc(cx - 14 + u * 28, y0 + v * (y1 - y0), r * 0.5, 0, TAU); g.fill(); }
    }
    // a pot plant on the sill, mullions
    g.fillStyle = '#3a2618'; g.fillRect(x0 + (x1 - x0) * 0.5 - 9, y1 - 18, 18, 18);
    g.fillStyle = '#2c2a1a';
    for (const [dx, dy, r] of [[0, -28, 12], [-12, -22, 9], [12, -24, 10], [-4, -40, 8]]) { g.beginPath(); g.arc(x0 + (x1 - x0) * 0.5 + dx, y1 - 18 + dy, r, 0, TAU); g.fill(); }
    g.fillStyle = '#2b2230';
    g.fillRect((x0 + x1) / 2 - 3, y0, 6, y1 - y0); g.fillRect(x0, (y0 + y1) / 2 - 3, x1 - x0, 6);
    g.fillStyle = '#e9dccb'; g.fillRect(x0 - 8, y0 - 8, x1 - x0 + 16, 8); g.fillRect(x0 - 10, y1, x1 - x0 + 20, 7);   // white trim
    g.fillRect(x0 - 8, y0, 8, y1 - y0); g.fillRect(x1, y0, 8, y1 - y0);
  }
  function bg(g, t) {
    sky(g);
    // the house: dusk-blue clapboard siding
    const wall = g.createLinearGradient(0, -200, 0, WALLB);
    wall.addColorStop(0, '#2f3550'); wall.addColorStop(1, '#3d4258');
    g.fillStyle = wall; g.fillRect(-500, -400, CORNER + 500, WALLB + 400);
    g.strokeStyle = 'rgba(16,18,32,.45)'; g.lineWidth = 1.4;
    for (let y = -390; y < WALLB; y += 13) { g.beginPath(); g.moveTo(-500, y); g.lineTo(CORNER, y); g.stroke(); }
    g.strokeStyle = 'rgba(120,130,170,.12)'; g.lineWidth = 1;
    for (let y = -388; y < WALLB; y += 13) { g.beginPath(); g.moveTo(-500, y); g.lineTo(CORNER, y); g.stroke(); }
    g.fillStyle = '#d9d0c4'; g.fillRect(CORNER - 10, -400, 10, WALLB + 400);   // corner board
    // upstairs: a dim bedroom window above the porch roof
    g.fillStyle = '#c99a5c'; g.fillRect(300, -110, 110, 120);
    g.fillStyle = 'rgba(255,230,180,.35)'; g.fillRect(300, -110, 110, 120);
    g.fillStyle = '#2b2230'; g.fillRect(352, -110, 6, 120); g.fillRect(300, -54, 110, 6);
    // openings and their glow on the siding
    g.save(); g.beginPath(); g.rect(DOOR[0], DOOR[1], DOOR[2] - DOOR[0], DOOR[3] - DOOR[1]); g.clip(); inside(g); g.restore();
    g.fillStyle = '#e9dccb'; g.fillRect(DOOR[0] - 10, DOOR[1] - 10, DOOR[2] - DOOR[0] + 20, 10); g.fillRect(DOOR[0] - 10, DOOR[1], 10, WALLB - DOOR[1]); g.fillRect(DOOR[2], DOOR[1], 10, WALLB - DOOR[1]);
    // the inner door swung open into the hall
    g.fillStyle = '#6b3e24'; g.beginPath(); g.moveTo(DOOR[2] - 2, DOOR[1] + 2); g.lineTo(DOOR[2] - 30, DOOR[1] + 14); g.lineTo(DOOR[2] - 30, WALLB - 8); g.lineTo(DOOR[2] - 2, WALLB); g.closePath(); g.fill();
    windowGlow(g, WINL, 0); windowGlow(g, WINR, 1);
    g.save(); g.globalCompositeOperation = 'screen';
    for (const [cx, cy, r, a] of [[491, 320, 300, 0.5], [208, 330, 190, 0.32], [695, 330, 160, 0.3]]) {
      const sp = g.createRadialGradient(cx, cy, 10, cx, cy, r);
      sp.addColorStop(0, `rgba(255,190,110,${a})`); sp.addColorStop(1, 'rgba(255,190,110,0)');
      g.fillStyle = sp; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }
    g.restore();
    // porch roof: shingles and the fascia (the porch wraps round the corner, so the roof runs on past it)
    g.fillStyle = '#272a38'; g.beginPath(); g.moveTo(-500, ROOF); g.lineTo(-500, 56); g.lineTo(CORNER + 260, 56); g.lineTo(CORNER + 330, ROOF); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(10,10,20,.5)'; g.lineWidth = 1.2;
    for (let y = 64; y < ROOF; y += 9) { g.beginPath(); g.moveTo(-500, y); g.lineTo(CORNER + 260 + (y - 56) * 1.1, y); g.stroke(); }
    g.fillStyle = '#1e1f2b'; g.fillRect(-500, ROOF, CORNER + 1000, 30);
    g.fillStyle = 'rgba(255,190,120,.16)'; g.fillRect(-500, ROOF + 28, CORNER + 1000, 3);
    // porch floor: boards, warm light pools from the door and windows
    g.fillStyle = '#4a3a34'; g.fillRect(-500, WALLB, CORNER + 1000, EDGE - WALLB);
    g.strokeStyle = 'rgba(20,14,14,.45)'; g.lineWidth = 1;
    for (let y = WALLB + 6; y < EDGE; y += 6) { g.beginPath(); g.moveTo(-500, y); g.lineTo(CORNER + 600, y); g.stroke(); }
    for (const [x0, x1, a] of [[DOOR[0], DOOR[2], 0.75], [WINL[0], WINL[2], 0.35], [WINR[0], WINR[2], 0.35]]) {
      const pg = g.createLinearGradient(0, WALLB, 0, EDGE);
      pg.addColorStop(0, `rgba(255,196,120,${a})`); pg.addColorStop(1, `rgba(255,196,120,${a * 0.35})`);
      g.fillStyle = pg; g.beginPath(); g.moveTo(x0, WALLB); g.lineTo(x1, WALLB); g.lineTo(x1 + (x1 - 491) * 0.25, EDGE); g.lineTo(x0 + (x0 - 491) * 0.25, EDGE); g.closePath(); g.fill();
    }
    // fascia under the floor edge, lattice skirt, the steps
    g.fillStyle = '#2e2a30'; g.fillRect(-500, EDGE, CORNER + 1000, 14);
    g.fillStyle = '#1a181e'; g.fillRect(-500, EDGE + 14, CORNER + 1000, GROUND - EDGE - 14);
    g.strokeStyle = 'rgba(80,76,90,.5)'; g.lineWidth = 2;
    for (let x = -500; x < CORNER + 500; x += 16) { g.beginPath(); g.moveTo(x, EDGE + 14); g.lineTo(x + 36, GROUND); g.moveTo(x + 36, EDGE + 14); g.lineTo(x, GROUND); g.stroke(); }
    const st = [[EDGE, EDGE + 26], [EDGE + 26, EDGE + 52], [EDGE + 52, GROUND + 4]];
    st.forEach(([y0, y1], i) => {
      const x0 = STEPS[0] - i * 10, x1 = STEPS[1] + i * 10;
      g.fillStyle = '#2f2628'; g.fillRect(x0, y0, x1 - x0, y1 - y0);                   // riser
      const tg = g.createLinearGradient(x0, 0, x1, 0);
      tg.addColorStop(0, 'rgba(240,170,100,.3)'); tg.addColorStop(0.5, 'rgba(255,200,130,.75)'); tg.addColorStop(1, 'rgba(240,170,100,.3)');
      g.fillStyle = tg; g.fillRect(x0, y0, x1 - x0, 5);                                   // lit tread nosing
    });
    // the lawn, catching the door's light near the steps
    const lw = g.createLinearGradient(0, GROUND, 0, GROUND + 260);
    lw.addColorStop(0, '#26302a'); lw.addColorStop(1, '#141a18');
    g.fillStyle = lw; g.fillRect(-500, GROUND, CORNER + 1200, 400);
    g.save(); g.translate(494, GROUND + 10); g.scale(1, 0.22);
    const lp = g.createRadialGradient(0, 0, 10, 0, 0, 380);
    lp.addColorStop(0, 'rgba(255,190,110,.5)'); lp.addColorStop(1, 'rgba(255,190,110,0)');
    g.fillStyle = lp; g.fillRect(-400, -400, 800, 800); g.restore();
    for (const [x, y, k, r] of lawn) {
      g.strokeStyle = `rgba(${70 + r * 40 | 0},${90 + r * 40 | 0},${70 + r * 20 | 0},${0.25 + 0.35 * k})`; g.lineWidth = 0.6 + k * 1.2;
      const h = 2 + k * 9; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r - 0.5) * h, y - h); g.stroke();
    }
    void t;
  }

  // ---- the rocking chair, empty, rocking a little ------------------------------------------------------------------
  function chair(g, t) {
    const a = 0.055 * Math.sin(t * 2.4) + 0.015 * Math.sin(t * 5.1);
    g.save(); g.translate(206, PF - 2); g.rotate(a);
    g.fillStyle = g.strokeStyle = COL.chair; g.lineCap = 'round'; g.lineJoin = 'round';
    g.lineWidth = 5; g.beginPath(); g.moveTo(-50, -8); g.quadraticCurveTo(0, 6, 50, -6); g.stroke();       // the rocker
    g.lineWidth = 4;
    for (const x of [-28, 26]) { g.beginPath(); g.moveTo(x, -2); g.lineTo(x + (x < 0 ? 2 : -2), -50); g.stroke(); }  // legs
    g.fillRect(-34, -56, 66, 7);                                                                                // seat
    g.lineWidth = 5; g.beginPath(); g.moveTo(-30, -52); g.lineTo(-40, -150); g.moveTo(26, -52); g.lineTo(16, -150); g.stroke();  // back posts
    g.lineWidth = 3;
    for (let i = 0; i < 5; i++) { const u = (i + 0.5) / 5; g.beginPath(); g.moveTo(lerp(-37, 13, u), -146); g.lineTo(lerp(-33, 17, u), -60); g.stroke(); }  // spindles
    g.lineWidth = 6; g.beginPath(); g.moveTo(-44, -150); g.quadraticCurveTo(-12, -164, 20, -150); g.stroke();  // top rail
    g.lineWidth = 4; g.beginPath(); g.moveTo(-34, -92); g.lineTo(-44, -90); g.moveTo(26, -92); g.lineTo(34, -88); g.stroke();
    g.beginPath(); g.moveTo(-44, -90); g.lineTo(-40, -56); g.moveTo(34, -88); g.lineTo(30, -56); g.stroke();      // arms
    g.restore();
  }
  function porchBits(g) {
    g.fillStyle = COL.wood;
    for (const x of [58, 380, 604, 802, 952]) g.fillRect(x - 7, ROOF + 28, 14, EDGE - ROOF - 26);
    // the screen door, swung open to the left: a thin frame with its mesh
    g.strokeStyle = COL.wood; g.lineWidth = 4;
    g.beginPath(); g.moveTo(DOOR[0], DOOR[1] + 2); g.lineTo(DOOR[0] - 44, DOOR[1] + 16); g.lineTo(DOOR[0] - 44, WALLB + 10); g.lineTo(DOOR[0], WALLB); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(DOOR[0], (DOOR[1] + WALLB) / 2); g.lineTo(DOOR[0] - 44, (DOOR[1] + WALLB) / 2 + 10); g.stroke();
    // a railing on the far left
    g.lineWidth = 5; g.beginPath(); g.moveTo(-500, PF - 52); g.lineTo(58, PF - 52); g.stroke();
    g.lineWidth = 3; for (let x = -480; x < 58; x += 14) { g.beginPath(); g.moveTo(x, PF - 52); g.lineTo(x, EDGE); g.stroke(); }
  }

  // ---- the family ---------------------------------------------------------------------------------------------------
  const sOf = (k, h) => h / 100 * KIDS[k].size;
  // local point (pre-adultize) for a world target, so a hand lands where we want it on an adult too
  const toLocal = (k, x, y, h, w) => { const s = sOf(k, h), a = KIDS[k].adult ? 1.14 : 1; return [(w[0] - x) / s, (w[1] - y) / s / a]; };
  const turnK = (t, at) => sm(seg(t, at, at + 0.35));
  function turnRight(p, t, at) {  // turn the whole figure toward the runaways
    const k = turnK(t, at);
    if (k <= 0) return p;
    const q = P.stand(1);
    const o = lerpPose(p, q, k);
    if (k > 0.5) o.face = 1;
    return o;
  }
  function father(t) {
    const x0 = 412, x1 = 448;
    const u = sm(seg(t, T0, EVERYONE + 0.2));
    const x = lerp(x0, x1, u);
    let p = u < 1 ? lerpPose(P.march((t - T0) * 1.6, 1, 0), P.stand(0), sm(seg(t, EVERYONE - 0.6, EVERYONE + 0.2))) : P.stand(0);
    // arm round the mother's shoulders from "Everyone" on; lifts her hand on "smiling"
    const M = mother(t, true);
    const around = sm(seg(t, EVERYONE + 0.2, KNOWS - 0.4)) * (1 - sm(seg(t, 276.4, 276.9)));
    const farSh = [M.x + 18, PF - 154];
    const J = [(x + M.x) / 2 + 2, PF - 216];               // the joined hands, up over their heads
    const lift = sm(seg(t, SMILING - 0.55, SMILING)) * (1 - sm(seg(t, 273.4, 274.6)));
    const tgt = L2(farSh, J, lift);
    const hl = toLocal('father', x, PF, H, tgt);
    const el = lift > 0 ? L2([22, -70], [20, -92], lift) : [20, -70];
    if (around > 0) p.armF = [L2(p.armF[0], el, around), L2(p.armF[1], hl, around)];
    p = turnRight(p, t, 277.05);
    if (t > 277.4) { const sh = Math.sin(t * 22) * 0.9 * Math.exp(-(t - 277.6) * 0.4); p.chest = add(p.chest, [0, sh]); p.head = add(p.head, [0, sh * 1.3]); }  // a laugh
    return { k: 'father', x, y: PF, h: H, pose: p };
  }
  function mother(t, noHands) {
    const x = lerp(526, 505, sm(seg(t, T0 + 0.2, EVERYONE + 0.4)));
    const p = P.stand(0);
    const lean = sm(seg(t, KNOWS - 0.6, KNOWS)) * (1 - sm(seg(t, 276.6, 277.0)));
    p.head = add(p.head, [-3 * lean, 0.5 * lean]);
    if (!noHands) {
      const F = father(t);
      const lift = sm(seg(t, SMILING - 0.55, SMILING)) * (1 - sm(seg(t, 273.4, 274.6)));
      if (lift > 0) {
        const J = [(F.x + x) / 2 + 2, PF - 216];
        const hl = toLocal('mother', x, PF, H, J);
        p.armB = [L2(p.armB[0], [-20, -92], lift), L2(p.armB[1], hl, lift)];
      }
    }
    return { k: 'mother', x, y: PF, h: H, pose: turnRight(p, t, 276.8) };
  }
  function sister(t) {
    // out of the bright doorway and onto her spot at the front
    const u = seg(t, T0 + 0.05, EVERYONE - 0.1);
    const x = lerp(548, 554, sm(u)), y = lerp(WALLB - 6, PF + 14, sm(u)), h = lerp(104, 124, sm(u));
    let p;
    if (u < 1) {  // trotting out toward the camera: front view, knees lifting in turn
      const q = P.stand(0), ph = (t - T0) * 3.2 * TAU, a = Math.max(0, Math.sin(ph)), b = Math.max(0, -Math.sin(ph));
      q.legB = [add(q.legB[0], [0, -6 * a]), add(q.legB[1], [0, -10 * a])]; q.legF = [add(q.legF[0], [0, -6 * b]), add(q.legF[1], [0, -10 * b])];
      q.armB = [q.armB[0], add(q.armB[1], [0, -5 * b])]; q.armF = [q.armF[0], add(q.armF[1], [0, -5 * a])];
      for (const k of ['hip', 'chest', 'head']) q[k] = add(q[k], [0, -2 * (a + b)]);
      q.hairSwing = 0.3 * Math.sin(ph);
      p = lerpPose(q, P.stand(0), sm(seg(u, 0.8, 1)));
    } else p = P.stand(0);
    // waves at the camera on "everyone's", again on "smiling"
    const w1 = sm(seg(t, SMILE0 - 0.1, SMILE0 + 0.25)) * (1 - sm(seg(t, 268.4, 268.9)));
    const w2 = sm(seg(t, SMILING - 0.3, SMILING)) * (1 - sm(seg(t, 272.6, 273.1)));
    const w = Math.max(w1, w2);
    if (w > 0) {
      const hop = (t > SMILE0 && t < SMILE0 + 0.5) ? (t - SMILE0) / 0.5 : 0;
      p = lerpPose(p, P.wave((t - SMILE0) / 0.42, 0, hop, 1), w);
    }
    p.hem = 1.5 * Math.sin(t * 2.2);
    p = turnRight(p, t, 276.55);
    if (t > 277.2) { const wv = sm(seg(t, 277.6, 277.9)); if (wv > 0) p = lerpPose(p, P.wave((t - 277.6) / 0.45, 1, 0, 1), wv); }  // waves after us
    return { k: 'sister', x, y, h, pose: p };
  }
  function brother(t) {
    const x = lerp(744, 684, sm(seg(t, T0, EVERYONE)));
    let p = t < EVERYONE ? lerpPose(P.march((t - T0) * 1.7, -1, 0), P.stand(0), sm(seg(t, EVERYONE - 0.5, EVERYONE))) : P.stand(0);
    const pk = sm(seg(t, KNOWS - 0.4, KNOWS));   // hands in his pockets for the picture
    p.armF = [L2(p.armF[0], [14, -60], pk), L2(p.armF[1], [10, -48], pk)];
    p.armB = [L2(p.armB[0], [-14, -60], pk), L2(p.armB[1], [-10, -48], pk)];
    p = turnRight(p, t, 276.5);
    return { k: 'brother', x, y: PF, h: H, pose: p };
  }
  // you and me: fidget, pull faces at the camera, duck out and run off right, laughing
  const RUN = { hider: { duck: EXCEPT, go: YOU, x: 880 }, me: { duck: AND, go: ME, x: 838 } };
  function faces(p, k, t, a) {  // silly ears: hands at the sides of the head, fingers waggling
    if (a <= 0) return p;
    const wg = Math.sin(t * 15) * 2;
    const hd = p.head;
    const L = [add(hd, [-14, 4]), add(hd, [-17, -2 + wg])], Rr = [add(hd, [14, 4]), add(hd, [17, -2 - wg])];
    p.armB = [L2(p.armB[0], L[0], a), L2(p.armB[1], L[1], a)];
    p.armF = [L2(p.armF[0], Rr[0], a), L2(p.armF[1], Rr[1], a)];
    const fan = (side) => (g) => { const h = side < 0 ? p.armB[1] : p.armF[1]; g.lineCap = 'round'; g.lineWidth = 1.9; for (let i = 0; i < 4; i++) { const an = -Math.PI / 2 + side * (0.25 + i * 0.28) + wg * 0.03; g.beginPath(); g.moveTo(h[0], h[1]); g.lineTo(h[0] + Math.cos(an) * 7, h[1] + Math.sin(an) * 7); g.stroke(); } };
    if (a > 0.6) p.props = [fan(-1), fan(1)];
    return p;
  }
  function runaway(k, t) {
    const R0 = RUN[k], sg = k === 'me' ? -1 : 1;
    if (t < R0.duck) {
      let p = P.stand(0);
      const bounce = Math.max(0, Math.sin(t * (k === 'me' ? 5.1 : 6.3) + sg)) * (t < KNOWS ? 3 : 1.6);
      for (const q of ['hip', 'chest', 'head']) p[q] = add(p[q], [0, -bounce]);
      p.legB = [add(p.legB[0], [0, -bounce * 0.7]), add(p.legB[1], [0, -bounce * 0.5])]; p.legF = [add(p.legF[0], [0, -bounce * 0.7]), add(p.legF[1], [0, -bounce * 0.5])];
      // pull faces while everyone else holds still
      const fa = k === 'me' ? sm(seg(t, 266.0, 266.4)) * (1 - sm(seg(t, 268.6, 269.0))) : sm(seg(t, 267.2, 267.6)) * (1 - sm(seg(t, 269.8, 270.2)));
      const fb = sm(seg(t, 271.6, 272.0)) * (1 - sm(seg(t, 274.0, 274.4)));
      p = faces(p, k, t, Math.max(fa, fb));
      if (t > 272 && t < 275.6) { const gg = Math.sin(t * 20 + sg) * 0.8; p.chest = add(p.chest, [0, gg]); p.head = add(p.head, [0, gg]); }  // giggling
      return { k, x: R0.x + (t < EVERYONE ? sg * 6 * Math.sin(t * 3) : 0), y: PF, h: H, pose: p };
    }
    if (t < R0.go) {  // duck down, out of the picture
      const c = sm(seg(t, R0.duck, R0.go));
      const p = P.stand(1);
      for (const q of ['hip', 'chest', 'head']) p[q] = add(p[q], [4 * c, 16 * c * (q === 'hip' ? 0.7 : 1)]);
      p.chest = add(p.chest, [6 * c, 4 * c]); p.head = add(p.head, [10 * c, 8 * c]);
      p.legF = [add(p.legF[0], [10 * c, 4 * c]), p.legF[1]]; p.legB = [add(p.legB[0], [6 * c, 6 * c]), p.legB[1]];
      return { k, x: R0.x, y: PF, h: H, pose: lerpPose(P.stand(0), p, sm(seg(t, R0.duck, R0.duck + 0.15))) };
    }
    // run to the porch end, jump down to the lawn, run on out of frame
    const dt = t - R0.go;
    const ph = dt * 3.0;
    const xEdge = 968, tJump = (xEdge - R0.x) / 260;
    if (dt < tJump) return { k, x: R0.x + dt * 260, y: PF, h: H, pose: P.run(ph, 1, { energy: sm(seg(dt, 0, 0.15)) * 0.4 + 0.6 }) };
    const ja = dt - tJump, jd = 0.42;
    if (ja < jd) { const u = ja / jd; return { k, x: xEdge + ja * 280, y: lerp(PF, GROUND + 6, u) - 4 * 30 * u * (1 - u), h: lerp(H, H * 1.06, u), pose: P.run(ph, 1) }; }
    return { k, x: xEdge + jd * 280 + (ja - jd) * 300, y: GROUND + 6, h: H * 1.06, pose: P.run(ph, 1) };
  }

  function shapes(g, t) {
    chair(g, t);
    porchBits(g);
    const F = father(t), M = mother(t), B = brother(t), Sx = sister(t), A = runaway('me', t), Hd = runaway('hider', t);
    for (const q of [F, M, B, Sx, A, Hd]) drawKid(g, KIDS[q.k], q.pose, q.x, q.y, q.h, COL.kid);
  }

  const CAM = [
    [T0, 500, 342, 1.1], [KNOWS, 504, 344, 1.13], [SMILE0, 506, 344, 1.15], [SMILING, 508, 342, 1.2], [EXCEPT, 520, 342, 1.18],
    [ME, 612, 352, 1.1], [279.2, 572, 346, 1.12], [T1, 558, 344, 1.14],
  ];
  const FOCUS = [[T0, 1.2], [260.7, 0], [EXCEPT, 0], [ME + 0.2, 0], [ME + 0.6, 1.3], [ME + 1.1, 0.2], [279.6, 0]];

  SCENE.add({
    id: 'porch', t0: T0, t1: T1,
    stamp: () => ({ date: 'SEP.12 1992', time: '7:02PM' }),
    camera: CAMKIT.rig(CAM, FOCUS, 19, 1),
    bg, shapes,
    light: { rim: '#ffcf88', glow: 'rgba(255,184,104,.85)', glowBlur: 8, rimW: 1.4, sunDir: [0, -1] },
    source: () => ({ x: 500, y: 232, r: 240, a: 0.5 }),
    grade: { bright: 1.02, contrast: 1.07, sat: 1.05 },
  });
})();
