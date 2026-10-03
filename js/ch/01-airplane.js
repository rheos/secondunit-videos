// 71.0 - 91.0  "I'm an airplane on the highway / and I feel so strange / mnuh nuh nuh /
// I'm an airplane on the highway / and I'm sick of the passing lane"
// A stubby 1950s prop airliner stuck driving the highway on car tyres, wings too long for the lane,
// printed as a three-drum risograph gig poster (look.js). Every shape here is a separation:
// C(pink, teal, yellow) densities. PAPER = no ink. KEY = pink + teal = the navy line.
// Animation is on twos (TA = song time stepped to 12 fps), and the plates jitter per drawing.
//   71.00 poster   the print slaps into register; a framed poster: striped sun, ray burst, teal
//                  mountains, and he drives in from the left, small, across the whole sheet
//   74.86 track    side-on tracking shot down the highway; a "no planes" sign; his long wing bonks it
//   77.22 feel     head-on, wings far wider than the road; uneasy eyes
//   78.38 strange  the plates fly apart, a new ink drops in, the sky turns op-art, his eyes spiral
//   79.13 mnuh     three beats, three Warhol panels of his face, one per ink, each going "nuh"
//   80.88 lane     side-on again: the passing lane is a roped-off red carpet; cars zip past below his wing
//   84.24 highway  tighter on him, the cars keep coming
//   86.60 sick     head-on; eye roll on "sick", a red limo on "passing lane"; glare; sigh;
//                  the print slides out of register and fades to paper
(() => {
  const C = (a, b, c) => `rgb(${Math.round(clamp(a) * 255)},${Math.round(clamp(b) * 255)},${Math.round(clamp(c) * 255)})`;
  const PAPER = C(0, 0, 0), KEY = C(1, 1, 0), PINK = C(1, 0, 0), TEAL = C(0, 1, 0), YEL = C(0, 0, 1);
  const RED = C(1, 0, 1), GREEN = C(0, 1, 1);
  const STRANGE = 78.38, MNUH = [79.13, 79.73, 80.30], LINE2 = 80.88, SICK = 86.6;
  const tri = (x, w) => clamp(1 - Math.abs(x) / w);
  const wrap = (x, m) => ((x % m) + m) % m;
  let FRI = 0;                      // drawing index (12 per second)
  const ta = (t) => Math.floor(t * 12) / 12;

  // ---- separation drawing ----
  const over = () => { s.globalCompositeOperation = 'source-over'; };
  const lighten = () => { s.globalCompositeOperation = 'lighten'; };
  const BOIL = 1.4;
  const jit = (x, y) => [x + (hash((FRI * 7919 + Math.round(x) * 131 + Math.round(y) * 17) >>> 0) - .5) * BOIL,
    y + (hash((FRI * 6271 + Math.round(x) * 37 + Math.round(y) * 211) >>> 0) - .5) * BOIL];
  function pathPts(pts, smooth) {
    const p = pts.map(([x, y]) => jit(x, y)), n = p.length; s.beginPath();
    if (!smooth) { p.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return; }
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; s.moveTo(...m(p[n - 1], p[0]));
    for (let i = 0; i < n; i++) { const q = m(p[i], p[(i + 1) % n]); s.quadraticCurveTo(p[i][0], p[i][1], q[0], q[1]); } s.closePath();
  }
  function paint(col, o) {
    if (col) { if (o.op) lighten(); s.fillStyle = col; s.fill(); over(); }
    if (o.lw) { s.lineWidth = o.lw; s.strokeStyle = o.line || KEY; s.lineJoin = 'round'; s.lineCap = 'round'; s.stroke(); }
  }
  function shape(pts, col, o = {}) { pathPts(pts, o.smooth); paint(col, o); }
  function ell(x, y, rx, ry, col, o = {}) { const [jx, jy] = jit(x, y); s.beginPath(); s.ellipse(jx, jy, Math.max(.1, rx), Math.max(.1, ry), o.rot || 0, 0, TAU); paint(col, o); }
  function rrect(x, y, w, h, r, col, o = {}) { s.beginPath(); s.roundRect(x, y, w, h, r); paint(col, o); }
  function stroke(pts, col, w) { const p = pts.map(([x, y]) => jit(x, y)); s.beginPath(); p.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.lineWidth = w; s.strokeStyle = col; s.lineCap = 'round'; s.lineJoin = 'round'; s.stroke(); }
  function sheet(col) { s.fillStyle = col; s.fillRect(-W, -H, W * 3, H * 3); }

  // ---- the character's parts ----
  const PAL0 = { body: PAPER, key: KEY, glass: TEAL, wing: YEL, fin: TEAL, tip: PINK, cheek: C(.45, 0, 0), ring: PINK };
  function eye(cx, cy, rx, ry, o, i, lw, body) {
    const { look = [.5, .1], lid = 0, spiral = 0, t = 0 } = o;
    ell(cx, cy, rx, ry, PAPER, { lw: lw * 1.15, line: o.pal.key });
    withT(() => {
      s.beginPath(); s.ellipse(cx, cy, rx, ry, 0, 0, TAU); s.clip();
      if (spiral < 1) {
        const px = cx + look[0] * rx * .45, py = cy + look[1] * ry * .45, r = rx * .44;
        ell(px, py, r, r * 1.08, o.pal.key);
        ell(px - r * .35, py - r * .38, r * .28, r * .28, PAPER);
      }
      if (spiral > 0) {
        const pts = []; for (let a = 0; a < TAU * 2.8; a += .25) { const r = a * rx * .055, aa = a + t * 12 * (i ? -1 : 1); pts.push([cx + Math.cos(aa) * r, cy + Math.sin(aa) * r * ry / rx]); }
        stroke(pts, o.pal.key, lw * 1.1);
      }
      if (lid > 0) {
        const ly = cy - ry + lid * ry * 2.05;
        s.beginPath(); s.moveTo(cx - rx - 6, cy - ry - 6); s.lineTo(cx + rx + 6, cy - ry - 6); s.lineTo(cx + rx + 6, ly - 6);
        s.quadraticCurveTo(cx, ly + 10, cx - rx - 6, ly - 6); s.closePath(); s.fillStyle = body; s.fill();
        s.beginPath(); s.moveTo(cx - rx - 6, ly - 6); s.quadraticCurveTo(cx, ly + 10, cx + rx + 6, ly - 6); s.lineWidth = lw * 1.1; s.strokeStyle = o.pal.key; s.stroke();
      }
    });
  }
  function mouth(cx, cy, hw, open, lw, pal) {
    const L = [cx - hw, cy], R = [cx + hw, cy + 2], up = [cx, cy + 14], dn = [cx, cy + 14 + 150 * open * hw / 80];
    if (open < .06) { stroke([L, [cx - hw * .5, cy + 12], [cx, cy + 16], [cx + hw * .5, cy + 12], R], pal.key, lw * 1.4); return; }
    const mp = () => { s.beginPath(); s.moveTo(...L); s.quadraticCurveTo(...up, ...R); s.quadraticCurveTo(...dn, ...L); s.closePath(); };
    mp(); s.fillStyle = pal.key; s.fill();
    withT(() => { mp(); s.clip();
      ell(cx + 4, (cy + dn[1]) / 2 + 26 * open * hw / 80, hw * .5, hw * (.16 + .1 * open), PINK);
      s.beginPath(); s.moveTo(...L); s.quadraticCurveTo(...up, ...R); s.lineWidth = hw * .2; s.strokeStyle = PAPER; s.stroke(); });
    mp(); s.lineWidth = lw; s.strokeStyle = pal.key; s.stroke();
  }
  function brows(eyes, raise, tilt, lw, pal) {   // tilt > 0 cross, < 0 worried
    eyes.forEach(([ex, ey, rx, ry], i) => {
      const inner = i ? -1 : 1, by = ey - ry - 22 - raise * 24;
      const a = [ex - rx * .75, by + (inner < 0 ? tilt * 18 : -tilt * 6)], b = [ex + rx * .75, by + (inner > 0 ? tilt * 18 : -tilt * 6)];
      stroke([a, [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 9], b], pal.key, lw * 2.2);
    });
  }
  // a prop seen face-on: tinted disc, three blades plus a ghost of where they were a drawing ago
  function propFace(cx, cy, R, spin, lw, pal) {
    ell(cx, cy, R, R, C(0, 0, .3), { op: 1 });
    ell(cx, cy, R, R, null, { lw: lw * .35, line: C(.5, .5, 0) });
    for (const [g, col] of [[.42, C(.3, .3, 0)], [0, pal.key]]) for (let i = 0; i < 3; i++) {
      const a = spin - g + i * TAU / 3, ca = Math.cos(a), sa = Math.sin(a), w = R * .1;
      const pts = [[cx - sa * w * .6, cy + ca * w * .6], [cx + ca * R * .5 - sa * w, cy + sa * R * .5 + ca * w], [cx + ca * R * .97, cy + sa * R * .97], [cx + ca * R * .5 + sa * w, cy + sa * R * .5 - ca * w], [cx + sa * w * .6, cy - ca * w * .6]];
      if (g) { pathPts(pts, true); lighten(); s.fillStyle = col; s.fill(); over(); } else shape(pts, col, { smooth: true });
    }
    ell(cx, cy, R * .13, R * .13, pal.ring, { lw: lw * .6, line: pal.key });
  }
  // a prop seen side-on (the disc is edge-on: a tall thin ellipse)
  function propSide(cx, cy, R, spin, lw, pal) {
    ell(cx, cy, R * .28, R, C(0, 0, .3), { op: 1, lw: lw * .3, line: C(.5, .5, 0) });
    for (let i = 0; i < 3; i++) { const a = spin + i * TAU / 3, tip = [cx + Math.sin(a) * R * .28, cy + Math.cos(a) * R]; if (Math.sin(a) < -.2) continue; stroke([[cx, cy], tip], pal.key, R * .13); }
    ell(cx + R * .08, cy, R * .17, R * .17, pal.ring, { lw: lw * .6, line: pal.key });
  }

  // ---- HEAD-ON plane: origin on the road under his middle; local units, 1 = 1 px at k = 1 ----
  const FEYES = [[-88, -505, 68, 78], [88, -505, 68, 78]];
  function frontPlane(x, y, k, o) {
    const { open = 0, bob = 0, spin = 0, pal = PAL0, tilt = 0, sq = 0 } = o; o = { ...o, pal };
    withT(() => {
      s.translate(x, y); s.scale(k, k);
      const lw = 7;
      ell(0, -4, 560, 38, C(0, .6, 0), { op: 1 });                                    // shadow on the road
      // tyres stay on the road; everything else bobs
      for (const sd of [-1, 1]) {
        withT(() => { s.translate(sd * 150, 0); s.scale(1 + sq * .4, 1 - sq); rrect(-46, -152, 92, 152, 34, pal.key);
          ell(sd * 18, -78, 16, 44, PAPER, { lw: 4, line: pal.key }); stroke([[-40, -40], [40, -40]], C(.3, .3, 0), 5); });
      }
      s.translate(0, bob); s.rotate(tilt);
      shape([[-24, -600], [-34, -800], [34, -800], [24, -600]], pal.fin, { lw: lw * .9 });                 // fin
      shape([[-310, -640], [310, -640], [296, -666], [-296, -666]], pal.fin, { lw: lw * .8 });              // tailplane
      for (const sd of [-1, 1]) {                                                                           // the too-long wings
        shape([[sd * 110, -300], [sd * 1340, -382], [sd * 1352, -416], [sd * 110, -376]], pal.wing, { lw });
        shape([[sd * 1150, -370], [sd * 1340, -382], [sd * 1352, -416], [sd * 1150, -404]], pal.tip, { lw });
        stroke([[sd * 200, -345], [sd * 1100, -398]], C(.25, 0, 0), 4);
      }
      for (const sd of [-1, 1]) for (const ex of [470, 860]) {                                              // engines and props
        const ey = -342 - (ex - 110) * .067, R = ex > 600 ? 170 : 200;
        ell(sd * ex, ey, 74, 74, pal.body, { lw: lw * .9, line: pal.key });
        ell(sd * ex, ey, 56, 56, null, { lw: 13, line: pal.ring });
        propFace(sd * ex, ey, R, spin * sd + ex, lw, pal);
      }
      for (const sd of [-1, 1]) stroke([[sd * 70, -190], [sd * 150, -110]], pal.key, 20);                   // gear legs
      ell(0, -380, 252, 252, pal.body, { lw: lw * 1.25, line: pal.key });                                    // fuselage
      ell(-30, -500, 160, 70, C(0, 0, 0), {});
      shape([[-200, -468], [-120, -446], [0, -438], [120, -446], [200, -468], [190, -540], [100, -578], [0, -588], [-100, -578], [-190, -540]], pal.glass, { smooth: true, lw: lw * .8, line: pal.key });
      for (const sd of [-1, 1]) ell(sd * 160, -318, 40, 30, pal.cheek, { op: 1 });
      FEYES.forEach(([ex, ey, rx, ry], i) => eye(ex, ey, rx, ry, o, i, lw, pal.body));
      brows(FEYES, o.brow?.[0] || 0, o.brow?.[1] || 0, lw, pal);
      ell(0, -392, 38, 36, pal.key); ell(-12, -404, 10, 9, PAPER);                                          // the nose
      mouth(0, -330, 78, open, lw, pal);
    });
  }

  // ---- SIDE-ON plane, facing +x; origin on the road under his middle ----
  const FUSE = [[284, -168], [270, -232], [195, -270], [60, -276], [-110, -264], [-250, -246], [-340, -240], [-354, -214], [-302, -186], [-230, -136], [-110, -102], [60, -92], [200, -90], [268, -114]];
  const SEYES = [[172, -228, 30, 38], [232, -224, 28, 36]];
  function tyreSide(cx, cy, r, ang, sq, pal) {
    withT(() => { s.translate(cx, cy + r); s.scale(1 + sq * .5, 1 - sq); s.translate(-cx, -cy - r);
      ell(cx, cy, r, r, pal.key); ell(cx, cy, r * .62, r * .62, PAPER); ell(cx, cy, r * .44, r * .44, null, { lw: 3, line: pal.key });
      for (let i = 0; i < 4; i++) { const a = ang + i * TAU / 4; stroke([[cx, cy], [cx + Math.cos(a) * r * .42, cy + Math.sin(a) * r * .42]], pal.key, 4); }
      ell(cx, cy, r * .14, r * .14, PINK, { lw: 3, line: pal.key }); });
  }
  function sidePlane(x, y, k, o, between) {
    const { open = 0, bob = 0, spin = 0, roll = 0, sq = 0, hop = 0, pal = PAL0 } = o; o = { ...o, pal };
    withT(() => {
      s.translate(x, y + hop); s.scale(k, k);
      const lw = 6 / Math.sqrt(k);
      ell(-20, -2, 380, 26, C(0, .6, 0), { op: 1 });
      withT(() => { s.translate(0, bob);
        shape([[50, -150], [-110, -390], [-150, -400], [-182, -390], [-80, -146]], C(0, 0, .55), { lw });       // far wing
        ell(-60, -300, 44, 15, pal.body, { lw: lw * .8 }); propSide(-14, -300, 40, spin + 1, lw, pal);
        shape([[-228, -240], [-298, -400], [-352, -404], [-360, -234]], pal.fin, { lw });                    // fin
        ell(-318, -330, 20, 20, YEL);
        shape(FUSE, pal.body, { smooth: true, lw: lw * 1.2 });
        withT(() => { pathPts(FUSE, true); s.clip();
          shape([[-380, -184], [120, -164], [178, -150], [120, -140], [-380, -160]], PINK);                  // cheat line
          stroke([[-380, -150], [118, -132]], YEL, 6); });
        for (let i = 0; i < 6; i++) { const wx = -250 + i * 58; ell(wx, -206, 15, 15, pal.glass, { lw: lw * .7 }); ell(wx - 5, -211, 4, 4, PAPER); }
        shape([[-250, -206], [-320, -208], [-374, -150], [-340, -146]], C(0, 0, .55), { lw });               // near stabiliser
      });
      for (const tx of [120, -175]) tyreSide(tx, -50, 50, roll, sq, pal);
      withT(() => { s.translate(0, bob);
        for (const tx of [120, -175]) { s.beginPath(); s.arc(tx, -50, 68, Math.PI * 1.02, Math.PI * 1.98); s.arc(tx, -50, 56, Math.PI * 1.98, Math.PI * 1.02, true); s.closePath(); paint(pal.body, { lw: lw * .8 }); }
        shape([[128, -272], [264, -262], [274, -190], [132, -184]], pal.glass, { lw: lw * .8 });
        SEYES.forEach(([ex, ey, rx, ry], i) => eye(ex, ey, rx, ry, o, i, lw * .8, pal.body));
        brows(SEYES.map(([a, b, c, d]) => [a, b + 6, c, d]), o.brow?.[0] || 0, o.brow?.[1] || 0, lw * .55, pal);
        mouth(236, -128, 38, open * .9, lw * .8, pal);
        ell(292, -166, 26, 26, pal.key); ell(284, -174, 7, 7, PAPER);                                          // nose
        ell(196, -150, 16, 12, pal.cheek, { op: 1 });
      });
      if (between) withT(() => { s.scale(1 / k, 1 / k); s.translate(-x, -y - hop); between(); });
      withT(() => { s.translate(0, bob);                                                                     // near wing, too long
        const NW = [[60, -116], [-100, 190], [-132, 206], [-188, 192], [-72, -108]];
        shape(NW, pal.wing, { lw });
        withT(() => { pathPts(NW, false); s.clip(); shape([[-200, 150], [0, 150], [0, 260], [-200, 260]], pal.tip); });
        for (const [f, R] of [[.3, 58], [.64, 52]]) {
          const lx = 60 + (-100 - 60) * f, ly = -116 + (190 + 116) * f;
          ell(lx - 4, ly, 52, 19, pal.body, { lw: lw * .8 }); ell(lx + 40, ly, 7, 19, pal.ring);
          propSide(lx + 50, ly, R, spin + f * 3, lw, pal);
        }
      });
    });
  }

  // the character's state from the song
  function base(t) {
    const T = ta(t), b = beatPulse(T, 7);
    const blink = Math.max(...[72.4, 74.0, 76.1, 82.1, 85.0, 88.0].map((bt) => tri(T - bt, .1)));
    return { t: T, open: clamp((F('voc', T, 1) - .07) / .4), bob: b * 10, sq: b * .06, lid: blink, spin: T * TAU * 1.9, roll: T * 15 };
  }
  function regMark(x, y, r) {   // a registration mark printed in all three inks: it shows the misregistration
    for (const col of [PINK, TEAL, YEL]) { lighten(); ell(x, y, r, r, null, { lw: 3, line: col }); s.globalCompositeOperation = 'lighten'; stroke([[x - r * 1.5, y], [x + r * 1.5, y]], col, 3); s.globalCompositeOperation = 'lighten'; stroke([[x, y - r * 1.5], [x, y + r * 1.5]], col, 3); over(); }
  }
  function border(m) {
    s.beginPath(); s.rect(-W, -H, W * 3, H * 3); s.rect(m, m, W - 2 * m, H - 2 * m); s.fillStyle = PAPER; s.fill('evenodd');
    for (const [x, y] of [[m / 2, m / 2], [W - m / 2, m / 2], [m / 2, H - m / 2], [W - m / 2, H - m / 2]]) regMark(x, y, m * .22);
  }
  function rays(cx, cy, n, r, rot, col) {
    lighten(); s.fillStyle = col;
    for (let i = 0; i < n; i++) { const a0 = rot + i * TAU / n, a1 = a0 + TAU / n / 2; s.beginPath(); s.moveTo(cx, cy); s.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r); s.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r); s.closePath(); s.fill(); }
    over();
  }
  function sun(cx, cy, r) {
    ell(cx, cy, r, r, YEL);
    for (let i = 0; i < 4; i++) { const y = cy + r * (.15 + i * .22), h = r * (.05 + i * .035); s.fillStyle = PAPER; s.fillRect(cx - r - 4, y, 2 * r + 8, h); }
  }
  function mountains(y, x0, amp, step, seed, col, o = {}) {
    const pts = [[x0 - 200, y + 600]];
    for (let x = x0 - 200, i = 0; x < x0 + W + 2400; x += step, i++) pts.push([x, y - amp * (.35 + .65 * hash(seed + i * 13))]), pts.push([x + step / 2, y - amp * .2 * hash(seed + i * 7)]);
    pts.push([x0 + W + 2400, y + 600]);
    shape(pts, col, o);
  }
  function cloud(x, y, r, col) {
    s.beginPath(); for (const [dx, dy, rr] of [[-1.1, .2, .62], [-.45, -.25, .8], [.35, -.35, .9], [1.05, .1, .65], [0, .25, .75]]) { const [jx, jy] = jit(x + dx * r, y + dy * r); s.moveTo(jx + rr * r, jy); s.arc(jx, jy, rr * r, 0, TAU); }
    lighten(); s.fillStyle = col; s.fill(); over();
  }
  function noPlanes(x, y, h, ang) {
    const r = h * .3, cy = y - h + r;
    withT(() => { s.translate(x, y); s.rotate(ang); s.translate(-x, -y);
      stroke([[x, y], [x, cy]], KEY, 12);
      ell(x, cy, r, r, PAPER, { lw: r * .2, line: PINK });
      withT(() => { s.translate(x, cy); s.scale(r / 70, r / 70);
        shape([[44, -4], [30, -16], [-36, -12], [-50, -28], [-58, -26], [-52, 2], [30, 10]], KEY);
        shape([[8, -4], [-14, 30], [-24, 30], [-12, -4]], KEY); });
      stroke([[x - r * .68, cy - r * .68], [x + r * .68, cy + r * .68]], PINK, r * .17);
      ell(x, cy, r, r, null, { lw: 4 });
    });
  }

  // ===== 71.00 poster: a framed print, he drives in small from the left =====
  function poster(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    sheet(PAPER);
    rays(1340, 400, 22, 1700, T * .07, C(.38, 0, 0));
    sun(1340, 400, 230);
    cloud(420, 230, 70, C(0, .3, 0)); cloud(860, 150, 50, C(0, .3, 0));
    mountains(640, -100, 260, 340, 11, C(0, .5, 0));
    mountains(700, -260, 150, 260, 29, C(.55, 0, 0), { op: 1 });
    s.fillStyle = C(0, 0, .5); s.fillRect(-W, 700, W * 3, 100);
    s.fillStyle = TEAL; s.fillRect(-W, 790, W * 3, 125);
    stroke([[-W, 798], [W * 2, 798]], PAPER, 5); stroke([[-W, 907], [W * 2, 907]], PAPER, 5);
    for (let i = 0; i < 16; i++) { const x = i * 150 + 20; s.fillStyle = PAPER; s.fillRect(x, 848, 80, 9); }
    s.fillStyle = C(0, 0, .45); s.fillRect(-W, 915, W * 3, 400);
    for (let i = 0; i < 9; i++) { const x = 80 + i * 230; stroke([[x, 700], [x, 600]], KEY, 6); stroke([[x - 22, 612], [x + 22, 612]], KEY, 5); }
    lighten(); stroke([[-20, 612], [W + 20, 612]].map(([x, y]) => [x, y]), C(.5, .5, 0), 2); over();
    const st = base(t), px = kf(T, [[71.0, -380], [74.86, 1120]], (x) => x);
    const look = [.8, T > 73.3 && T < 74.3 ? -.6 : .1];
    sidePlane(px, 892, .62, { ...st, look, brow: [T > 73.3 && T < 74.3 ? .6 : 0, 0] });
    border(44);
    // the print slaps into register
    const u = 1 - ease.out(inv(71.0, 71.55, t));
    fx({ off: [-110 * u, 40 * u, 90 * u, -70 * u, 30 * u, 120 * u], jit: 2.4 + 6 * u });
  }

  // ===== side-on tracking world =====
  const VR = 900;
  function sideWorld(t, carpet) {
    const T = ta(t), sc = (T - 71) * VR;
    sheet(PAPER);
    s.fillStyle = C(.6, 0, 0); s.fillRect(-W, -H, W * 3, H + 70);
    s.fillStyle = C(.4, 0, 0); s.fillRect(-W, 70, W * 3, 70);
    s.fillStyle = C(.22, 0, 0); s.fillRect(-W, 140, W * 3, 70);
    s.fillStyle = C(.1, 0, 0); s.fillRect(-W, 210, W * 3, 60);
    sun(300, 330, 190);
    for (let i = 0; i < 3; i++) cloud(wrap(400 + i * 760 - sc * .03, W + 600) - 300, 160 + i * 60, 55, C(0, .28, 0));
    mountains(560, -wrap(sc * .05, 680) - 300, 230, 340, 41, C(0, .55, 0));
    mountains(620, -wrap(sc * .14, 520) - 300, 120, 260, 53, C(0, 0, .6), { op: 1 });
    s.fillStyle = C(0, 0, .35); s.fillRect(-W, 610, W * 3, 80);
    for (let i = -1; i < 12; i++) { const x = i * 300 - wrap(sc * .3, 300); stroke([[x, 690], [x, 560]], KEY, 7); stroke([[x - 26, 574], [x + 26, 574]], KEY, 6); }
    lighten(); for (let i = -1; i < 12; i++) { const x = i * 300 - wrap(sc * .3, 300); stroke([[x, 574], [x + 150, 590], [x + 300, 574]], C(.5, .5, 0), 2); } over();
    s.fillStyle = TEAL; s.fillRect(-W, 690, W * 3, 240);
    stroke([[-W, 700], [W * 2, 700]], PAPER, 6);
    for (let i = -1; i < 14; i++) { const x = i * 200 - wrap(sc, 200); s.fillStyle = PAPER; s.fillRect(x, 806, 110, 10); }
    if (carpet) {
      s.fillStyle = PINK; s.fillRect(-W, 930, W * 3, 160);
      stroke([[-W, 936], [W * 2, 936]], YEL, 6);
      for (let i = -1; i < 40; i++) { const x = i * 60 - wrap(sc, 60); lighten(); stroke([[x, 950], [x + 20, 1080]], C(.0, 0, .35), 3); over(); }
    } else {
      stroke([[-W, 922], [W * 2, 922]], PAPER, 6);
      s.fillStyle = C(0, 0, .5); s.fillRect(-W, 930, W * 3, 200);
      for (let i = -1; i < 30; i++) { const x = i * 90 - wrap(sc * 1.3, 90); stroke([[x, 1000], [x + 8, 975], [x + 16, 1000]], C(.6, 0, .5), 4); }
    }
  }
  function stanchions(t) {
    const sc = (ta(t) - 71) * VR * 1.3, sp = 330, top = 905, foot = 1040;
    const xs = []; for (let x = -sp - wrap(sc, sp); x < W + sp * 2; x += sp) xs.push(x);
    for (let i = 0; i < xs.length - 1; i++) { const a = [xs[i], top + 4], b = [xs[i + 1], top + 4]; s.beginPath(); s.moveTo(...a); s.quadraticCurveTo((a[0] + b[0]) / 2, top + 70, ...b); s.lineWidth = 14; s.strokeStyle = RED; s.stroke(); s.lineWidth = 3; s.strokeStyle = KEY; s.stroke(); }
    for (const x of xs) { ell(x, foot, 30, 9, YEL, { lw: 3 }); rrect(x - 7, top, 14, foot - top, 6, YEL, { lw: 3 }); ell(x, top - 8, 15, 15, YEL, { lw: 3 }); }
  }
  function carSide(x, y, k, col, T, limo) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      const X = (v) => v < 0 ? v * (limo ? 1.6 : 1) : v;
      for (let i = 0; i < 3; i++) stroke([[X(-180) - 30 - i * 20, -50 - i * 26], [X(-180) - 220 - i * 40, -50 - i * 26]], KEY, 6);
      shape([[155, -40], [146, -82], [72, -92], [36, -136], [X(-52), -140], [X(-88), -96], [X(-154), -88], [X(-174), -78], [X(-166), -40], [X(-142), -22], [146, -22]], col, { lw: 5 });
      shape([[28, -128], [X(-46), -130], [X(-76), -96], [56, -94]], limo ? YEL : PAPER, { lw: 4 });
      ell(-14, -108, 15, 15, PAPER, { lw: 3 }); s.fillStyle = KEY; s.fillRect(-8, -114, 24, 7);
      if (limo) { s.fillStyle = KEY; s.fillRect(-30, -126, 32, 6); s.fillRect(-22, -140, 18, 15); }
      stroke([[X(-150), -62], [134, -64]], PAPER, 6);
      ell(144, -62, 11, 11, PAPER, { lw: 3 });
      tyreSide(94, -26, 28, T * 30, 0, PAL0); tyreSide(X(-104), -26, 28, T * 30, 0, PAL0);
    });
  }

  // ===== 74.86 track: side-on down the highway; a "no planes" sign; the wing bonks it =====
  const PXS = 820, PYS = 892;
  function track(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    sideWorld(t, false);
    const signX = 2050 - (T - 74.86) * VR * 1.3, tHit = 74.86 + (2050 - (PXS - 110)) / (VR * 1.3);
    const dt = T - tHit, ang = dt > 0 ? -.55 * Math.exp(-4 * dt) * Math.sin(dt * 16) : 0;
    const st = base(t);
    let look = [.7, .1], brow = [0, 0], lid = st.lid;
    const g = tri(T - (tHit - .25), .7);
    if (g > 0) { look = [lerp(.7, -.2, g), lerp(.1, .95, g)]; brow = [.7 * g, 0]; }
    const h = hit(T, tHit, 3); if (h > .05) { brow = [1, 0]; lid = Math.max(lid, .3 * h); }
    if (T > 76.6) { const u = inv(76.6, 77.2, T); look = [lerp(.7, .2, u), lerp(.1, -.5, u)]; brow = [.4 * u, -.8 * u]; }
    sidePlane(PXS, PYS, 1.0, { ...st, look, brow, lid }, () => noPlanes(signX, 1060, 300, ang));
    fx({ jit: 2.4 });
  }

  // ===== head-on world: the road runs to a vanishing point behind him =====
  const VPX = 1040, HOR = 400, FOC = 680, ZP = 1.06, RW = 1.3;
  const gy = (z) => HOR + FOC / z, gx = (X, z) => VPX + X * FOC / z;
  const PLANE_X = gx(-.62, ZP), PLANE_Y = gy(ZP);
  function frontWorld(t, o = {}) {
    const T = ta(t), V = 7;
    sheet(PAPER);
    if (o.op) {
      const n = 24, rot = T * 1.6;
      s.fillStyle = YEL; s.fillRect(-W, -H, W * 3, H * 3);
      s.fillStyle = PINK; for (let i = 0; i < n; i++) { const a0 = rot + i * TAU / n, a1 = a0 + TAU / n / 2; s.beginPath(); s.moveTo(o.op[0], o.op[1]); s.lineTo(o.op[0] + Math.cos(a0) * 3000, o.op[1] + Math.sin(a0) * 3000); s.lineTo(o.op[0] + Math.cos(a1) * 3000, o.op[1] + Math.sin(a1) * 3000); s.closePath(); s.fill(); }
      for (let i = 0; i < 9; i++) { const r = wrap(i * 260 + T * 600, 2340); lighten(); ell(o.op[0], o.op[1], r, r, null, { lw: 40, line: C(0, .7, 0) }); over(); }
      return;
    }
    rays(VPX, HOR, 26, 2600, -T * .05, C(.35, 0, 0));
    sun(VPX, HOR - 20, 250);
    cloud(300, 170, 70, C(0, .3, 0)); cloud(1650, 120, 55, C(0, .3, 0));
    mountains(HOR, -200, 110, 230, 71, C(0, .55, 0));
    s.fillStyle = C(0, 0, .5); s.fillRect(-W, HOR, W * 3, H * 2);
    for (let i = 0; i < 40; i++) {                       // field bands streaming away, so the ground reads as flat
      const z0 = .3 + wrap(i * .9 + T * V, 36), z1 = z0 + .45;
      s.fillStyle = C(0, 0, .85); s.fillRect(-W, gy(z1), W * 3, gy(z0) - gy(z1));
    }
    const zf = 80, zn = .3;
    shape([[gx(-RW, zf), gy(zf)], [gx(RW, zf), gy(zf)], [gx(RW, zn), gy(zn)], [gx(-RW, zn), gy(zn)]], TEAL);
    if (o.carpet) shape([[gx(.04, zf), gy(zf)], [gx(RW, zf), gy(zf)], [gx(RW, zn), gy(zn)], [gx(.04, zn), gy(zn)]], PINK);
    for (const X of [-RW, RW]) stroke([[gx(X, zf), gy(zf)], [gx(X, zn), gy(zn)]], o.carpet && X > 0 ? YEL : PAPER, 6);
    for (let i = 0; i < 14; i++) {                       // telephone poles down the left verge
      const z = .5 + wrap(i * 2.4 + T * V, 33.6), x = gx(-RW - .5, z), y = gy(z), h = .9 * FOC / z;
      stroke([[x, y], [x, y - h]], KEY, Math.max(1.5, 16 / z)); stroke([[x - .14 * FOC / z, y - h * .92], [x + .14 * FOC / z, y - h * .92]], KEY, Math.max(1.5, 12 / z));
    }
    // centre dashes stream away from us toward the vanishing point
    for (let i = 0; i < 30; i++) {
      const z0 = .45 + wrap(i * 1.2 + T * V, 36), z1 = z0 + .5;
      shape([[gx(-.025, z0), gy(z0)], [gx(.025, z0), gy(z0)], [gx(.025, z1), gy(z1)], [gx(-.025, z1), gy(z1)]], o.carpet ? YEL : PAPER);
    }
  }
  function carpetPosts(t, near) {     // stanchions along both edges of the carpet, streaming away
    const T = ta(t), V = 7, list = [];
    for (let i = 0; i < 18; i++) list.push(.42 + wrap(i * 1.6 + T * V, 28.8));
    list.sort((a, b) => b - a);
    for (const X of [.1, RW - .08]) {
      let prev = null;
      for (const z of list) {
        if (near ? z > ZP : z <= ZP) { prev = z; continue; }
        const x = gx(X, z), y = gy(z), h = .32 * FOC / z, r = FOC / z;
        if (prev !== null && Math.abs(prev - z) < 2) { const xa = gx(X, prev), ya = gy(prev) - .32 * FOC / prev; s.beginPath(); s.moveTo(xa, ya); s.quadraticCurveTo((xa + x) / 2, (ya + y - h) / 2 + .08 * r, x, y - h); s.lineWidth = .03 * r; s.strokeStyle = RED; s.stroke(); }
        rrect(x - .012 * r, y - h, .024 * r, h, .01 * r, YEL, { lw: Math.max(1, .004 * r) });
        ell(x, y - h, .022 * r, .022 * r, YEL, { lw: Math.max(1, .004 * r) });
        prev = z;
      }
    }
  }
  function carFront(x, y, k, col, limo) {
    withT(() => { s.translate(x, y); s.scale(k, k);
      const w = limo ? 1.15 : 1;
      rrect(-140 * w, -40, 60, 40, 14, KEY); rrect(80 * w, -40, 60, 40, 14, KEY);
      shape([[-110 * w, -150], [-80 * w, -215], [80 * w, -215], [110 * w, -150]], col, { lw: 5 });
      shape([[-92 * w, -152], [-70 * w, -202], [70 * w, -202], [92 * w, -152]], PAPER, { lw: 4 });
      ell(0, -170, 22, 24, PAPER, { lw: 3 }); s.fillStyle = KEY; s.fillRect(-20, -176, 40, 9);
      if (limo) { s.fillStyle = KEY; s.fillRect(-26, -196, 52, 7); s.fillRect(-16, -214, 32, 20); }
      rrect(-180 * w, -152, 360 * w, 112, 40, col, { lw: 5 });
      for (const sd of [-1, 1]) ell(sd * 128 * w, -104, 30, 30, PAPER, { lw: 4 });
      rrect(-60, -122, 120, 50, 10, KEY);
      for (let i = 0; i < 4; i++) stroke([[-48 + i * 32, -116], [-48 + i * 32, -78]], col, 4);
      rrect(-192 * w, -56, 384 * w, 22, 10, PAPER, { lw: 4 });
    });
  }

  // ===== 77.22 feel / 78.38 strange: head-on =====
  function headOn(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const on = t >= STRANGE, st = base(t);
    const z = on ? 1.32 : kf(T, [[77.22, 1.18], [78.38, 1.3]], ease.out);
    const fcx = PLANE_X, fcy = PLANE_Y - 470 * .85;
    let look = [0, .1], brow = [0, 0], lid = st.lid, spiral = 0, hop = 0;
    if (!on) { const a = Math.sin((T - 77.22) * 7); look = [a * .8, .05]; brow = [.5, -.9]; lid = .1; }
    else { spiral = smooth(inv(STRANGE, STRANGE + .2, T)); brow = [1.2, 0]; hop = -60 * Math.sin(Math.PI * clamp((T - STRANGE) / .45)); }
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-fcx, -fcy);
      frontWorld(t, on ? { op: [fcx, fcy] } : {});
      frontPlane(PLANE_X, PLANE_Y + hop, .85, { ...st, look, brow, lid, spiral, tilt: on ? .05 * Math.sin(T * 9) : 0 });
    });
    if (on) haywire(t);
  }
  // the plates come apart and a new ink drops in, swapping on every beat
  const STRANGE_INKS = [[INK.pink, INK.teal, INK.orange], [INK.orange, INK.blue, INK.yellow], [INK.purple, INK.yellow, INK.pink], [INK.red, INK.teal, INK.green], [INK.blue, INK.orange, INK.pink]];
  function haywire(t, amt = 1) {
    const T = ta(t), u = smooth(inv(STRANGE, STRANGE + .18, t)) * amt, bi = Math.max(0, lastBeat(T) - lastBeat(STRANGE));
    fx({ off: [Math.sin(T * 6.1) * 75 * u, Math.cos(T * 4.3) * 38 * u, Math.cos(T * 5.3) * 70 * u, Math.sin(T * 3.7) * 50 * u, Math.sin(T * 4.9 + 2) * 28 * u, -60 * u + Math.cos(T * 7) * 20 * u],
      inks: STRANGE_INKS[bi % STRANGE_INKS.length], jit: 3 + 5 * u });
  }

  // ===== 79.13 mnuh nuh nuh: three Warhol panels, one per beat =====
  const PANELS = [
    { bg: PINK, pal: { ...PAL0, body: YEL, glass: TEAL, wing: TEAL, fin: TEAL, tip: PAPER, cheek: C(0, 0, 0), ring: TEAL } },
    { bg: YEL, pal: { ...PAL0, body: PAPER, glass: PINK, wing: PINK, fin: PINK, tip: TEAL, cheek: C(.6, 0, 0), ring: PINK } },
    { bg: TEAL, pal: { ...PAL0, body: PINK, glass: YEL, wing: YEL, fin: YEL, tip: PAPER, cheek: C(0, 0, .6), ring: YEL } },
  ];
  function mnuh(t) {
    headOn(t);
    const T = ta(t); FRI = Math.floor(t * 12);
    MNUH.forEach((bt, i) => {
      if (T < bt - .001) return;
      const pop = ease.back(inv(bt, bt + .17, T)), x0 = i * 640;
      withT(() => {
        s.beginPath(); s.rect(x0, 0, 640, H); s.clip();
        s.fillStyle = PANELS[i].bg; s.fillRect(x0, 0, 640, H);
        const k = 1.06 * (1.25 - .25 * pop), nuh = hit(T, bt, 5);
        const look = [[.5, .2], [0, -.4], [-.5, .2]][i];
        frontPlane(x0 + 320, 540 + 470 * k, k, { t: T, open: .1 + .75 * nuh, look, brow: [.6 + .6 * nuh, 0], bob: -30 * nuh, spin: T * TAU * 1.9, pal: PANELS[i].pal, lid: 0 });
      });
      stroke([[x0, 0], [x0, H]], PAPER, 14);
    });
    const bi = MNUH.filter((bt) => T >= bt).length - 1;
    const sw = [[INK.pink, INK.teal, INK.yellow], [INK.orange, INK.blue, INK.yellow], [INK.pink, INK.purple, INK.yellow]][Math.max(0, bi)];
    const a = .35, k = bi * 1.7;
    fx({ off: [Math.sin(k) * 28 * a + Math.sin(T * 6) * 8, Math.cos(k) * 18 * a, -Math.sin(k + 1) * 26 * a, Math.cos(T * 5) * 8, 10 * a, -24 * a], inks: sw, jit: 4 });
  }

  // ===== 80.88 lane: side-on, the roped-off red-carpet passing lane; cars zip past =====
  const CARS_S = [[81.45, TEAL], [82.55, YEL], [83.6, GREEN], [84.75, PINK], [85.7, TEAL], [86.35, RED, true]];
  const VCAR = 1500;
  function lane(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const tight = T >= 84.24, z = tight ? kf(T, [[84.24, 1.45], [86.6, 1.6]], (x) => x) : kf(T, [[LINE2, 1.0], [84.24, 1.06]], (x) => x);
    const fcx = tight ? PXS + 120 : W / 2, fcy = tight ? PYS - 240 : H / 2;
    const st = base(t);
    let look = [.6, .2], brow = [0, 0], lid = st.lid, best = null;
    for (const c of CARS_S) { const x = PXS + 250 + (T - c[0]) * VCAR; if (x > -200 && x < W + 300 && (best === null || Math.abs(x - 1100) < Math.abs(best - 1100))) best = x; }
    if (best !== null) { look = [clamp((best - (PXS + 250)) / 500, -1, 1), .9]; brow = [.3, .5]; }
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-fcx, -fcy);
      sideWorld(t, true);
      sidePlane(PXS, PYS, 1.0, { ...st, look, brow, lid }, () => {
        stanchions(t);
        for (const c of CARS_S) { const x = PXS + 250 + (T - c[0]) * VCAR; if (x > -700 && x < W + 700) carSide(x, 1062, .95, c[1], T, c[2]); }
      });
    });
    fx({ jit: 2.4 });
  }

  // ===== 86.60 sick: head-on with the carpet; eye roll, the limo, a glare, a sigh, the print lets go =====
  const CARS_F = [[86.2, YEL], [87.32, RED, true], [88.5, TEAL], [89.75, GREEN]];
  const VREL = 4.2;
  function sick(t) {
    const T = ta(t); FRI = Math.floor(t * 12);
    const z = kf(T, [[SICK, 1.12], [91, 1.22]], (x) => x), fcx = PLANE_X + 120, fcy = PLANE_Y - 380;
    const st = base(t);
    let look = [.3, .2], brow = [.2, .4], lid = st.lid;
    const cz = (c) => ZP + VREL * (c[0] - T);
    const u = inv(SICK, SICK + .55, T);
    if (u > 0 && u < 1) { const th = lerp(-.3, Math.PI + .3, ease.inOut(u)); look = [Math.cos(th), -Math.sin(th) * 1.05]; lid = Math.max(lid, .4); brow = [.9, -.3]; }
    if (T >= SICK + .55 && T < 88.2) { const c = CARS_F[1], zz = cz(c); look = [clamp((gx(.66, zz) - PLANE_X) / 700, -1, 1), clamp((gy(zz) - PLANE_Y + 300) / 500, -.2, 1)]; lid = Math.max(lid, .38); brow = [0, 1]; }
    if (T >= 88.2 && T < 89.2) { look = [.7, .7]; lid = Math.max(lid, .3); brow = [0, .7]; }
    if (T >= 89.2) { const v = smooth(inv(89.2, 89.7, T)); look = [lerp(.7, 0, v), lerp(.7, .5, v)]; lid = Math.max(lid, .55 * v); brow = [-.1 * v, -.6 * v]; }
    withT(() => {
      s.translate(W / 2, H / 2); s.scale(z, z); s.translate(-fcx, -fcy);
      frontWorld(t, { carpet: true });
      const cars = CARS_F.map((c) => [cz(c), c]).filter(([zz]) => zz > .32 && zz < 40).sort((a, b) => b[0] - a[0]);
      carpetPosts(t, false);
      for (const [zz, c] of cars) if (zz > ZP) carFront(gx(.66, zz), gy(zz), FOC / zz / 650 * 1.2, c[1], c[2]);
      frontPlane(PLANE_X, PLANE_Y, .85, { ...st, look, brow, lid });
      carpetPosts(t, true);
      for (const [zz, c] of cars) if (zz <= ZP) carFront(gx(.66, zz), gy(zz), FOC / zz / 650 * 1.2, c[1], c[2]);
      for (let q = 0; q < 3; q++) { const w = (T - 89.3 - q * .2) / 1.1; if (w < 0 || w >= 1) continue;          // the sigh
        cloud(PLANE_X + 90 + w * 260 + q * 20, PLANE_Y - 280 * .85 - w * 160 - q * 30, (18 + w * 40) * (1 - w * .3), C(0, .45 * (1 - w), 0)); }
    });
    const e = smooth(inv(90.1, 90.95, t));
    fx({ off: [-90 * e, 30 * e, 70 * e, -55 * e, 20 * e, 95 * e], fade: .85 * e, jit: 2.4 + 5 * e });
  }

  chapter('airplane', 71.0, 91.0, [[71.0, poster], [74.86, track], [77.22, headOn], [79.13, mnuh], [LINE2, lane], [SICK, sick]]);
})();
